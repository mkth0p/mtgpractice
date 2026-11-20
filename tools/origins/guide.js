/* Numbers for the play guide of one deck: how it wins against the field with the given bot.
   node tools/origins/guide.js --deck out/final-std.json:key --field out/field.json [--n 100] [--bot std] [--out guide.json]
                               [--mull 2000] [--nomull]

   For every opponent of the field the deck plays n seeds from both seats. Recorded:
     opening   win rate with and without each card in the opening hand (after the mulligan)
     rounds    what the bot plays in each round, how much mana it leaves unused, how long games last
     legendary the round in which the Legendary card comes down, and the win rate of those games
     first     win rate when revealing first in round 1 and when revealing second
     locations win rate with each location on the board
     matchups  win rate against each opponent
   Mulligan test, for each card of the deck: games are searched in which the card is in the first four cards dealt,
   and each of them is played twice, once always keeping the card and once always throwing it back (the other
   cards follow the usual rule). The two results of a game form a pair, so the gap comes with its own error.
   --mull is the number of such pairs per card, shared between the opponents like the field. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { E, D } = L;

function botWithKeep(spec, rule) {
  const b = L.mkBot(spec);
  if (!rule) return b;
  return { name: b.name, plan: b.plan, keep: (c, hand) => (c.id === rule.id ? rule.keep : E.defaultKeep(c, hand)) };
}

// worker: one opponent, n seeds, both seats; rule = null or { id, keep } for the mulligan test
function guideTask(task) {
  D.setPatch(task.patch || null);
  const me = task.deck, opp = task.opp;
  const out = { n: 0, w: 0, rounds: 0, first: [0, 0, 0, 0], open: {}, loc: {}, play: {}, reach: new Array(16).fill(0), spent: new Array(16).fill(0), mana: new Array(16).fill(0), len: new Array(41).fill(0), tossed: {},
    legN: new Array(16).fill(0), legW: new Array(16).fill(0) };          // the round the Legendary was first played (0 = never)
  for (let i = 0; i < task.n; i++) {
    const s = E.mix(task.seed, i);
    for (let side = 0; side < 2; side++) {
      const mine = botWithKeep(task.bot, task.rule), theirs = L.mkBot(task.bot);
      const G = E.playGame(side ? [opp, me] : [me, opp], side ? [theirs, mine] : [mine, theirs], { seed: s, rules: task.rules, track: true });
      const win = G.winner === side ? 1 : (G.winner === -1 ? 0.5 : 0);
      out.n++; out.w += win; out.rounds += G.round; out.len[Math.min(40, G.round)]++;
      const f = G.first === side ? 0 : 2; out.first[f]++; out.first[f + 1] += win;
      if (task.rule) continue;
      const t = G.P[side].track;
      for (const id of new Set(t.opening)) { const o = out.open[id] || (out.open[id] = [0, 0]); o[0]++; o[1] += win; }
      for (const id of new Set(t.tossed)) { const o = out.tossed[id] || (out.tossed[id] = [0, 0]); o[0]++; o[1] += win; }
      for (const l of G.locs) if (l.id) { const o = out.loc[l.id] || (out.loc[l.id] = [0, 0]); o[0]++; o[1] += win; }
      for (let r = 1; r <= Math.min(15, G.round); r++) out.reach[r]++;
      { const lp = t.played.find((x) => x[1] === me.legend); const k = lp ? Math.min(15, lp[0]) : 0; out.legN[k]++; out.legW[k] += win; }
      for (const [r, id] of t.played) { if (r > 15) continue; const k = r + ':' + id; out.play[k] = (out.play[k] || 0) + 1; out.spent[r] += D.CARDS[id].cost; }
    }
  }
  return out;
}

// worker: the paired mulligan test of one card against one opponent
function mullTask(task) {
  D.setPatch(task.patch || null);
  const me = task.deck, opp = task.opp, id = task.id;
  const out = { m: 0, k: 0, t: 0, d: 0, d2: 0, tried: 0 };
  for (let i = 0; out.m < task.m && i < task.m * 12; i++) {
    const s = E.mix(task.seed, i);
    for (let side = 0; side < 2 && out.m < task.m; side++) {
      out.tried++;
      const decks = side ? [opp, me] : [me, opp];
      // the first four cards only depend on the seed: look at them before paying for the game
      const G0 = E.newGame(decks, { seed: s, rules: task.rules, mulligan: false });
      if (!G0.P[side].hand.some((c) => c.id === id)) continue;
      const res = [true, false].map((keep) => {
        const mine = botWithKeep(task.bot, { id, keep }), theirs = L.mkBot(task.bot);
        const G = E.playGame(decks, side ? [theirs, mine] : [mine, theirs], { seed: s, rules: task.rules });
        return G.winner === side ? 1 : (G.winner === -1 ? 0.5 : 0);
      });
      out.m++; out.k += res[0]; out.t += res[1]; out.d += res[0] - res[1]; out.d2 += (res[0] - res[1]) ** 2;
    }
  }
  return out;
}

function merge(a, b) {
  if (!a) return b;
  a.n += b.n; a.w += b.w; a.rounds += b.rounds;
  for (let i = 0; i < 4; i++) a.first[i] += b.first[i];
  for (const k of ['reach', 'spent', 'mana', 'len', 'legN', 'legW']) for (let i = 0; i < a[k].length; i++) a[k][i] += b[k][i];
  for (const k of ['open', 'loc', 'tossed']) for (const id in b[k]) { const o = a[k][id] || (a[k][id] = [0, 0]); o[0] += b[k][id][0]; o[1] += b[k][id][1]; }
  for (const k in b.play) a.play[k] = (a.play[k] || 0) + b.play[k];
  return a;
}

async function guide(deck, field, opt = {}) {
  const n = opt.n || 100, bot = opt.bot || 'std', seed = opt.seed || 2027;
  const wsum = field.reduce((a, d) => a + d.w, 0);
  const mk = (rule) => field.map((o, j) => ({ mod: 'guide.js', fn: 'guideTask', deck, opp: { legend: o.legend, cards: o.cards, key: o.key }, n, seed: E.mix(seed, j), bot, rule, patch: opt.patch, rules: opt.rules, j }));
  const wavg = (rs) => rs.reduce((a, r, j) => a + field[j].w * r.w / r.n, 0) / wsum;
  const base = await L.pool(mk(null));
  let all = null;
  // weight every opponent by its share of the field when adding the games up
  const scale = (r, w) => { const k = w * field.length / wsum; const c = JSON.parse(JSON.stringify(r)); const mul = (o) => { for (const key in o) { if (Array.isArray(o[key])) o[key] = o[key].map((x) => x * k); else if (typeof o[key] === 'number') o[key] *= k; else if (o[key] && typeof o[key] === 'object') mul(o[key]); } }; mul(c); return c; };
  base.forEach((r, j) => { all = merge(all, scale(r, field[j].w)); });
  const out = { deck, bot, games: base.reduce((a, r) => a + r.n, 0), p: wavg(base), rounds: all.rounds / all.n,
    matchups: base.map((r, j) => ({ key: field[j].key, legend: field[j].legend, w: field[j].w, p: r.w / r.n, n: r.n, rounds: r.rounds / r.n })),
    first: { first: all.first[1] / all.first[0], second: all.first[3] / all.first[2] },
    opening: Object.keys(all.open).map((id) => ({ id, share: all.open[id][0] / all.n, with: all.open[id][1] / all.open[id][0], without: (all.w - all.open[id][1]) / (all.n - all.open[id][0]) })).sort((a, b) => (b.with - b.without) - (a.with - a.without)),
    tossed: Object.keys(all.tossed).map((id) => ({ id, share: all.tossed[id][0] / all.n })),
    locations: Object.keys(all.loc).map((id) => ({ id, n: Math.round(all.loc[id][0]), p: all.loc[id][1] / all.loc[id][0] })).sort((a, b) => b.p - a.p),
    rounds_: [], length: all.len.map((x) => x / all.n),
    legendary: all.legN.map((n, r) => ({ round: r, share: n / all.n, p: n ? all.legW[r] / n : null })).filter((x) => x.share >= 0.02) };
  for (let r = 1; r <= 12; r++) {
    if (all.reach[r] < all.n * 0.05) break;
    const plays = Object.keys(all.play).filter((k) => k.startsWith(r + ':')).map((k) => ({ id: k.split(':')[1], rate: all.play[k] / all.reach[r] })).sort((a, b) => b.rate - a.rate).slice(0, 6);
    out.rounds_.push({ round: r, reach: all.reach[r] / all.n, spent: all.spent[r] / all.reach[r], plays });
  }
  if (opt.mulligan !== false) {
    out.mulligan = [];
    const M = opt.mull || 2000;
    const ids = [deck.legend].concat(deck.cards);
    for (const id of ids) {
      const tasks = field.map((o, j) => ({ mod: 'guide.js', fn: 'mullTask', deck, opp: { legend: o.legend, cards: o.cards, key: o.key }, id, m: Math.max(16, Math.round(M * o.w / wsum)), seed: E.mix(seed + 31, j), bot, patch: opt.patch, rules: opt.rules }));
      const rs = await L.pool(tasks);
      let keep = 0, toss = 0, diff = 0, v = 0, w = 0, pairs = 0, tried = 0;
      rs.forEach((r, j) => {
        if (r.m < 2) return;
        const wj = field[j].w, dj = r.d / r.m, var_ = Math.max(0, r.d2 / r.m - dj * dj) * r.m / (r.m - 1);
        keep += wj * r.k / r.m; toss += wj * r.t / r.m; diff += wj * dj; v += wj * wj * var_ / r.m; w += wj; pairs += r.m; tried += r.tried;
      });
      out.mulligan.push({ id, keep: keep / w, toss: toss / w, diff: diff / w, se: Math.sqrt(v) / w, pairs, share: pairs / tried });
      out.mullGames = (out.mullGames || 0) + 2 * pairs;
      if (opt.log) opt.log(`  mulligan ${id}: keep ${(100 * keep / w).toFixed(1)}% toss ${(100 * toss / w).toFixed(1)}% diff ${(100 * diff / w).toFixed(1)} ±${(196 * Math.sqrt(v) / w).toFixed(1)} (${pairs} pairs)`);
    }
    out.mulligan.sort((a, b) => b.diff - a.diff);
  }
  return out;
}

if (require.main === module) (async () => {
  const [file, key] = String(L.arg('deck')).split(':');
  let deck = L.BY_KEY[file];
  if (!deck) { const j = JSON.parse(fs.readFileSync(path.resolve(__dirname, file), 'utf8')); deck = (j.decks || j).find((d) => d.key === key) || j; }
  const field = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('field', 'out/field.json'))), 'utf8')).decks;
  const t0 = Date.now();
  const res = await guide({ key: deck.key, legend: deck.legend, cards: deck.cards }, field, { n: L.arg('n', 100), bot: String(L.arg('bot', 'std')), mulligan: !L.arg('nomull', false), mull: L.arg('mull', 2000), log: (s) => console.log(s) });
  res.seconds = Math.round((Date.now() - t0) / 1000);
  const out = path.join(__dirname, 'out', String(L.arg('out', 'guide.json')));
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(`${deck.key}: ${(100 * res.p).toFixed(1)}% vs the field over ${res.games} games, ${res.seconds} s -> ${out}`);
})();

module.exports = { guideTask, mullTask, guide };
