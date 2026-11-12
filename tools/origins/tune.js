/* Self-play tuning of the bot's evaluation weights.
   node tools/origins/tune.js [--minutes 30] [--pairs 40] [--seeds 5] [--lambda 4] [--from out/tune.json] [--deck key]

   (1+lambda) evolution strategy. Each step proposes `lambda` mutated weight sets. A candidate plays the current best
   on random pairs of real decklists, with the same seeds, both seats and both deck assignments, so the decks' own
   strength cancels out. The best candidate above 52% is replayed on fresh seeds (three times as many games) and only
   replaces the incumbent if it still wins. With --deck the candidate always pilots that one list (per-deck tuning). */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { E, A } = L;

const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const minutes = L.arg('minutes', 30), nPairs = L.arg('pairs', 40), nSeeds = L.arg('seeds', 5), lambda = L.arg('lambda', 4);
const only = L.arg('deck', null);
const outFile = path.join(OUT, L.arg('out', only ? 'tune-' + only + '.json' : 'tune.json'));
const KEYS = Object.keys(A.W0);
const FIXED = new Set(['a1']);              // the unit of the scale
const keys = L.DK.META.map((d) => d.key);

function mutate(W, rng, sigma) {
  const V = Object.assign({}, W);
  const gauss = () => { let u = 0, v = 0; while (!u) u = rng(); v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  let changed = 0;
  while (!changed) for (const k of KEYS) {
    if (FIXED.has(k) || rng() > 0.22) continue;
    const base = V[k] > 0.02 ? V[k] : 0.05;
    V[k] = +(base * Math.exp(sigma * gauss())).toFixed(3);
    if (k === 'look' || k === 'look2') V[k] = Math.min(V[k], 3);
    changed++;
  }
  return V;
}

function tasksFor(W, Winc, pairs, seeds, seed, tag) {
  const rng = E.rngFrom(seed);
  const tasks = [];
  for (let i = 0; i < pairs; i++) {
    const x = only || keys[Math.floor(rng() * keys.length)];
    let y = x; while (y === x) y = keys[Math.floor(rng() * keys.length)];
    const s = E.mix(seed, i);
    tasks.push({ a: x, b: y, n: seeds, seed: s, botA: { W }, botB: { W: Winc }, tag, role: 0 });
    if (!only) tasks.push({ a: x, b: y, n: seeds, seed: s, botA: { W: Winc }, botB: { W }, tag, role: 1 });
  }
  return tasks;
}
function tally(tasks, results, tag) {
  let w = 0, n = 0;
  for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].tag !== tag) continue;
    const r = results[i];
    w += (tasks[i].role === 0 ? r.wa : r.wb) + r.dr / 2; n += r.n;
  }
  return { w, n, p: w / n };
}

(async () => {
  let best = Object.assign({}, A.W0), log = [], iter = 0;
  const from = L.arg('from', null);
  if (from && fs.existsSync(path.resolve(OUT, '..', from))) { const j = JSON.parse(fs.readFileSync(path.resolve(OUT, '..', from), 'utf8')); best = Object.assign(best, j.best); if (!only) { log = j.log || []; iter = j.iter || 0; } }
  const rng = E.rngFrom(L.arg('seed', 12345) + iter);
  const t0 = Date.now();
  let sigma = L.arg('sigma', 0.35), accepted = 0, stale = 0;
  while ((Date.now() - t0) / 60000 < minutes) {
    iter++;
    const cands = [];
    for (let i = 0; i < lambda; i++) cands.push(mutate(best, rng, sigma));
    const seed = E.mix(99991, iter);
    let tasks = [];
    cands.forEach((W, i) => { tasks = tasks.concat(tasksFor(W, best, nPairs, nSeeds, seed, i)); });
    const rs = await L.pool(tasks);
    const sc = cands.map((W, i) => tally(tasks, rs, i));
    let bi = 0; for (let i = 1; i < lambda; i++) if (sc[i].p > sc[bi].p) bi = i;
    let line = `#${iter} sigma ${sigma.toFixed(2)} screen ${sc.map((s) => (100 * s.p).toFixed(1)).join(' ')}`;
    if (sc[bi].p > 0.52) {
      const t2 = tasksFor(cands[bi], best, nPairs * 3, nSeeds, E.mix(seed, 777), 0);
      const c = tally(t2, await L.pool(t2), 0);
      line += ` | confirm ${(100 * c.p).toFixed(1)}% of ${c.n}`;
      if (c.p > 0.5 + 1.2 * Math.sqrt(0.25 / c.n)) {
        const diff = KEYS.filter((k) => cands[bi][k] !== best[k]).map((k) => `${k} ${best[k]}->${cands[bi][k]}`).join(', ');
        best = cands[bi]; accepted++; stale = 0;
        log.push({ iter, p: +c.p.toFixed(4), n: c.n, diff });
        line += ' ACCEPT ' + diff;
      } else stale++;
    } else stale++;
    if (stale >= 6) { sigma = Math.max(0.12, sigma * 0.8); stale = 0; }
    console.log(line + ` (${((Date.now() - t0) / 60000).toFixed(1)} min)`);
    fs.writeFileSync(outFile, JSON.stringify({ best, iter, accepted, log, deck: only }, null, 1));
  }
  console.log('best', JSON.stringify(best));
})();
