/* Round robin between decklists.
   node tools/origins/matrix.js [--n 100] [--out matrix.json] [--extra out/optimized.json] [--rules '{"cup":true}'] [--only cup,ladder] [--bot std]
                                [--reuse out/earlier.json] [--patch 0.7]
   Every pair plays n seeds from both seats (2n games). Also records, for every card of every deck, how often it was
   seen and how its owner did (the "win rate when drawn" numbers). With --reuse, pairs already played in an earlier
   file (same lists, same number of games) are copied from it and only the new pairs are played. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { E } = L;

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

function loadDecks() {
  let decks = L.DK.META.map((d) => ({ key: d.key, legend: d.legend, name: d.name, cards: d.cards, source: d.source, author: d.author }));
  const only = L.arg('only', null);
  if (only) { const o = String(only).split(','); decks = decks.filter((d) => o.includes(d.source) || o.includes(d.key)); }
  const extra = L.arg('extra', null);
  if (extra) for (const f of String(extra).split(',')) {
    const j = JSON.parse(fs.readFileSync(path.resolve(__dirname, f), 'utf8'));
    for (const d of j.decks || j) if (!decks.some((x) => x.key === d.key)) decks.push({ key: d.key, legend: d.legend, name: d.name, cards: d.cards, source: d.source || 'opt', author: d.author || 'simulation' });
  }
  const patch = L.arg('patch', null);
  if (patch) {            // keep only the lists that were legal in that patch
    L.D.setPatch(String(patch));
    decks = decks.filter((d) => L.D.LEGENDS.includes(d.legend) && d.cards.every((c) => L.D.POOL.includes(c)));
    L.D.setPatch(null);
  }
  return decks;
}

async function run(decks, n, opt = {}) {
  const tasks = [];
  const chunk = opt.chunk || 50;
  const K = decks.length;
  const W = decks.map(() => new Array(K).fill(0)), N = decks.map(() => new Array(K).fill(0)), R = decks.map(() => new Array(K).fill(0));
  const cards = decks.map(() => ({}));
  const old = opt.reuse && opt.reuse.n === 2 * n ? opt.reuse : null;
  const at = decks.map((d) => (old ? old.decks.findIndex((e) => e.key === d.key && e.legend === d.legend && e.cards.join() === d.cards.join()) : -1));
  let copied = 0;
  for (let i = 0; i < K; i++) if (at[i] >= 0 && old.cards && old.cards[at[i]]) cards[i] = JSON.parse(JSON.stringify(old.cards[at[i]]));
  for (let i = 0; i < decks.length; i++) for (let j = i + 1; j < decks.length; j++) {
    if (at[i] >= 0 && at[j] >= 0) {
      const p = old.wr[at[i]][at[j]];
      W[i][j] = p * old.n; W[j][i] = (1 - p) * old.n; N[i][j] = N[j][i] = old.n; R[i][j] = R[j][i] = old.rounds * old.n; copied++;
      continue;
    }
    for (let c = 0; c < n; c += chunk) tasks.push({ a: decks[i], b: decks[j], n: Math.min(chunk, n - c), seed: E.mix(E.mix(opt.seed || 2026, i * 1000 + j), c), rules: opt.rules, patch: opt.patch, track: opt.track !== false, botA: opt.bot, botB: opt.bot, i, j });
  }
  if (copied && !opt.quiet) console.log(`  ${copied} pairs copied from the earlier run, ${tasks.length} tasks to play`);
  const t0 = Date.now();
  let last = 0;
  await L.pool(tasks, { onDone: (id, r, done, total) => {
    const { i, j } = tasks[id];
    W[i][j] += r.wa + r.dr / 2; W[j][i] += r.wb + r.dr / 2; N[i][j] += r.n; N[j][i] += r.n; R[i][j] += r.rounds; R[j][i] += r.rounds;
    if (r.cards) for (const [k, who] of [[0, i], [1, j]]) for (const id2 in r.cards[k]) { const x = cards[who][id2] || (cards[who][id2] = [0, 0, 0, 0, 0, 0]); for (let q = 0; q < 6; q++) x[q] += r.cards[k][id2][q]; }
    if (!opt.quiet && Date.now() - last > 20000) { last = Date.now(); console.log(`  ${done}/${total} tasks, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
  } });
  const wr = W.map((row, i) => row.map((w, j) => (i === j ? 0.5 : +(w / N[i][j]).toFixed(4))));
  let games = 0, rounds = 0;
  for (let i = 0; i < K; i++) for (let j = i + 1; j < K; j++) { games += N[i][j]; rounds += R[i][j]; }
  return { decks, n: 2 * n, wr, games, rounds: +(rounds / games).toFixed(2), cards, seconds: Math.round((Date.now() - t0) / 1000) };
}

if (require.main === module) (async () => {
  const decks = loadDecks();
  const n = L.arg('n', 100);
  const rules = L.arg('rules', null) ? JSON.parse(L.arg('rules')) : undefined;
  const b = L.arg('bot', null);
  const bot = b ? (String(b).startsWith('{') ? JSON.parse(b) : String(b)) : undefined;
  const patch = L.arg('patch', null) ? String(L.arg('patch')) : undefined;
  console.log(`${decks.length} decks, ${decks.length * (decks.length - 1) / 2} pairs, ${2 * n} games each`);
  const reuse = L.arg('reuse', null) ? JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('reuse'))), 'utf8')) : null;
  const res = await run(decks, n, { rules, bot, patch, seed: L.arg('seed', 2026), reuse });
  res.rules = rules || null; res.bot = bot || 'fast'; res.patch = patch || null;
  const out = path.join(OUT, L.arg('out', 'matrix.json'));
  fs.writeFileSync(out, JSON.stringify(res));
  console.log(`${res.games} games in ${res.seconds} s, ${res.rounds} rounds on average -> ${out}`);
  const avg = res.wr.map((row, i) => [decks[i].key, row.reduce((a, b, j) => a + (j === i ? 0 : b), 0) / (decks.length - 1)]).sort((a, b) => b[1] - a[1]);
  for (const [k, v] of avg) console.log('  ' + k.padEnd(16) + L.pct(v));
})();

module.exports = { run, loadDecks };
