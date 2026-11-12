/* Deck search for one Legendary against a fixed field of opponents.
   node tools/origins/optimize.js --legend van-helsing --field out/field.json [--gens 10] [--pop 64] [--seeds 2]
                                  [--out opt-van-helsing.json] [--start out/opt-van-helsing.json] [--finalBot std] [--seed 1]
                                  [--climb 2] [--wide 30] [--quick] [--keepTable]

   The field file is { decks: [{ key, legend, cards, w }] }: the opponents and how much each one counts.
   A deck's score is its win rate against that field. Every deck of a round plays the same seeds against the same
   opponents from both seats, so luck is shared and differences between decks show sooner.

   1. Cross-entropy search (fast bot). A table gives every card of the pool its odds of being in the deck. Each
      generation draws `pop` decks from the table, scores them, and moves the table toward the cards of the best
      quarter. The real lists of the Legendary enter the first generation as they are.
   2. Race (fresh seeds every round). The leaders of the search, the real lists and the one-card changes of the
      table's deck with the next cards of the table play more and more games; the weaker half drops out each
      round. The last rounds use the standard bot, which is the one all the published numbers come from.
   3. Climb. The one-card changes of the winner with every card the search still rates (the first `wide` of
      them) race again, `climb` times at most, until none of them is better. refine.js asks the same question
      with the whole pool and paired games.

   The output keeps the winner, the runners-up and the search table, so a later run can tell how firm the choice is. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { E, D } = L;

// ---- worker side: one candidate against the whole field
function evalDeck(task) {
  const wins = [], games = [];
  for (let j = 0; j < task.field.length; j++) {
    const r = L.duel({ a: task.cand, b: task.field[j], n: task.n, seed: E.mix(task.seed, j), botA: task.bot, botB: task.oppBot || task.bot, patch: task.patch, rules: task.rules });
    wins.push(r.wa + r.dr / 2); games.push(r.n);
  }
  return { wins, games };
}

// ---- main side
const score = (r, field) => { let s = 0, w = 0; for (let j = 0; j < field.length; j++) { s += field[j].w * r.wins[j] / r.games[j]; w += field[j].w; } return s / w; };
const keyOf = (cards) => cards.slice().sort().join(',');

const STATS = { games: 0, decks: 0 };
async function evalMany(cands, field, opt) {
  const tasks = cands.map((cards) => ({ mod: 'optimize.js', fn: 'evalDeck', cand: { legend: opt.legend, cards }, field, n: opt.n, seed: opt.seed, bot: opt.bot, patch: opt.patch, rules: opt.rules }));
  const rs = await L.pool(tasks);
  STATS.decks += cands.length;
  for (const r of rs) for (const g of r.games) STATS.games += g;
  return rs.map((r) => ({ p: score(r, field), games: r.games.reduce((a, b) => a + b, 0), wins: r.wins, n: r.games }));
}

// Draws 12 different cards so that card i is included with probability p[i] (the p add up to 12): systematic
// sampling over a shuffled order.
function sampleDeck(pool, p, rng) {
  const idx = pool.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
  const out = [];
  let acc = 0, next = rng();
  for (const i of idx) { acc += p[i]; if (acc > next) { out.push(pool[i]); next += 1; } }
  while (out.length < 12) { const c = pool[Math.floor(rng() * pool.length)]; if (!out.includes(c)) out.push(c); }
  return out.slice(0, 12);
}
function normalize(p) {
  for (let it = 0; it < 20; it++) {
    let s = 0; for (const x of p) s += x;
    const k = 12 / s;
    let over = false;
    for (let i = 0; i < p.length; i++) { p[i] = Math.min(0.97, Math.max(0.004, p[i] * k)); if (p[i] >= 0.97) over = true; }
    if (!over && Math.abs(s - 12) < 1e-6) break;
  }
  return p;
}

// Runs a race: all decks play n games per opponent seed block, the better half stays, n doubles.
async function race(decks, field, plan, base) {
  let alive = decks.map((cards) => ({ cards, key: keyOf(cards), w: 0, g: 0, hist: [] }));
  for (let r = 0; r < plan.length; r++) {
    const st = plan[r];
    const res = await evalMany(alive.map((d) => d.cards), field, Object.assign({}, base, { n: st.n, bot: st.bot, seed: E.mix(base.seed, 1000 + r) }));
    alive.forEach((d, i) => { d.last = res[i].p; d.hist.push([st.bot, res[i].games, +res[i].p.toFixed(4)]); if (st.keepScore) { d.w += res[i].p * res[i].games; d.g += res[i].games; } });
    // rank by this round (plus the earlier rounds of the same bot when they count)
    alive.sort((a, b) => (st.keepScore ? b.w / b.g - a.w / a.g : b.last - a.last));
    if (base.log) base.log(`  race ${r + 1}/${plan.length} (${st.bot}, ${res[0].games} games each): ${alive.length} decks, best ${(100 * alive[0].last).toFixed(1)}%`);
    const keep = Math.max(st.keep, 1);
    const prot = alive.filter((d, i) => i >= keep && base.protect && base.protect.has(d.key) && r < plan.length - 2);
    alive = alive.slice(0, keep).concat(prot);
  }
  return alive;
}

async function optimize(opt) {
  const legend = opt.legend;
  const field = opt.field;
  const pool = D.POOL.slice();
  const rng = E.rngFrom(opt.seed || 1);
  const log = opt.log || (() => {});
  const real = L.DK.META.filter((d) => d.legend === legend).map((d) => d.cards).concat(opt.start || []);
  const inReal = new Set(real.flat());
  const inAny = new Set(L.DK.META.flatMap((d) => d.cards));
  // start table: cards of the Legendary's own lists, then cards any real list plays, then the rest
  let p = normalize(pool.map((c) => (inReal.has(c) ? 0.45 : inAny.has(c) ? 0.12 : 0.04)));
  // a table kept from an earlier search replaces the start table (used with gens 0 to climb further from its winner)
  if (opt.table) { const t = new Map(opt.table); p = normalize(pool.map((c) => t.get(c) || 0.004)); }
  const archive = new Map();          // key -> { cards, w, g }
  const note = (cards, r) => { const k = keyOf(cards); const a = archive.get(k) || { cards, w: 0, g: 0 }; a.w += r.p * r.games; a.g += r.games; archive.set(k, a); };
  const base = { legend, patch: opt.patch, rules: opt.rules, seed: opt.seed || 1, log };
  const gens = opt.gens == null ? 10 : opt.gens, pop = opt.pop || 64;
  const t0 = Date.now();
  for (let g = 0; g < gens; g++) {
    const decks = [];
    const seen = new Set();
    const add = (cards) => { const k = keyOf(cards); if (!seen.has(k)) { seen.add(k); decks.push(cards); } };
    if (g === 0) for (const r of real) add(r);
    for (let tries = 0; decks.length < pop && tries < pop * 20; tries++) add(sampleDeck(pool, p, rng));
    const res = await evalMany(decks, field, Object.assign({}, base, { n: opt.seeds || 2, bot: 'fast', seed: E.mix(base.seed, g) }));
    res.forEach((r, i) => note(decks[i], r));
    const order = decks.map((_, i) => i).sort((a, b) => res[b].p - res[a].p);
    const elite = order.slice(0, Math.max(4, Math.round(decks.length / 4)));
    const f = pool.map((c) => elite.filter((i) => decks[i].includes(c)).length / elite.length);
    const alpha = 0.5;
    p = normalize(p.map((x, i) => (1 - alpha) * x + alpha * f[i]));
    const mean = res.reduce((a, r) => a + r.p, 0) / res.length;
    log(` gen ${g + 1}/${gens}: mean ${(100 * mean).toFixed(1)}%, elite ${(100 * elite.reduce((a, i) => a + res[i].p, 0) / elite.length).toFixed(1)}%, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  const table = pool.map((c, i) => [c, +p[i].toFixed(3)]).sort((a, b) => b[1] - a[1]);
  const top = table.slice(0, 12).map((x) => x[0]);
  const bench = table.slice(12, 12 + (opt.bench || 7)).map((x) => x[0]);

  // candidates for the race: the table's deck, the real lists, the best decks met during the search and
  // the one-card changes of the table's deck with the next cards of the table
  const swaps = (cards, ins) => { const out = []; for (const o of cards) for (const n of ins) if (!cards.includes(n)) out.push(cards.filter((c) => c !== o).concat([n])); return out; };
  const uniq = (list) => { const s = new Set(); return list.filter((c) => { const k = keyOf(c); if (s.has(k)) return false; s.add(k); return true; }); };
  const best = [...archive.values()].sort((a, b) => b.w / b.g - a.w / a.g).slice(0, 12).map((a) => a.cards);
  let cands = uniq([top].concat(real, best, gens ? swaps(top, bench) : []));
  const protect = new Set(real.map(keyOf));
  const finalBot = opt.finalBot || 'std';
  const plan = opt.quick
    ? [{ n: 2, bot: 'fast', keep: 24 }, { n: 4, bot: 'fast', keep: 10 }, { n: 4, bot: finalBot, keep: 4, keepScore: true }, { n: 12, bot: finalBot, keep: 2, keepScore: true }]
    : [{ n: 2, bot: 'fast', keep: 40 }, { n: 4, bot: 'fast', keep: 20 }, { n: 8, bot: 'fast', keep: 10 }, { n: 4, bot: finalBot, keep: 6, keepScore: true }, { n: 8, bot: finalBot, keep: 3, keepScore: true }, { n: 20, bot: finalBot, keep: 2, keepScore: true }];
  let alive = await race(cands, field, plan, Object.assign({}, base, { protect }));
  let winner = alive[0];
  log(` winner after the race: ${(100 * winner.w / winner.g).toFixed(1)}% over ${winner.g} games`);

  // climb: one-card changes of the winner, with every card the search still rates
  const wide = table.filter((x) => x[1] >= 0.05).map((x) => x[0]).slice(0, opt.wide || 30);
  for (let pass = 0; pass < (opt.climb == null ? 2 : opt.climb); pass++) {
    const nb = uniq(swaps(winner.cards, wide)).filter((c) => keyOf(c) !== winner.key);
    if (!nb.length) break;
    const plan2 = [{ n: 2, bot: 'fast', keep: 30 }, { n: 6, bot: 'fast', keep: 8 }, { n: 6, bot: finalBot, keep: 3, keepScore: true }, { n: 20, bot: finalBot, keep: 1, keepScore: true }];
    const a2 = await race([winner.cards].concat(nb), field, plan2, Object.assign({}, base, { seed: E.mix(base.seed, 50 + pass), protect: new Set([winner.key]) }));
    const top2 = a2[0];
    if (top2.key === winner.key) { log(` climb ${pass + 1}: no one-card change is better`); break; }
    // head to head on fresh seeds before switching
    const hh = await evalMany([winner.cards, top2.cards], field, Object.assign({}, base, { n: 30, bot: finalBot, seed: E.mix(base.seed, 90 + pass) }));
    const out = winner.cards.filter((c) => !top2.cards.includes(c))[0], inn = top2.cards.filter((c) => !winner.cards.includes(c))[0];
    log(` climb ${pass + 1}: ${out} -> ${inn}: ${(100 * hh[0].p).toFixed(1)}% -> ${(100 * hh[1].p).toFixed(1)}% over ${hh[0].games} games`);
    if (hh[1].p <= hh[0].p + 0.004) break;
    winner = { cards: top2.cards, key: top2.key, w: hh[1].p * hh[1].games, g: hh[1].games, hist: top2.hist.concat([[finalBot, hh[1].games, +hh[1].p.toFixed(4)]]) };
    alive = [winner].concat(alive);
  }
  return { legend, cards: winner.cards, p: +(winner.w / winner.g).toFixed(4), games: winner.g, hist: winner.hist,
    runners: alive.filter((d) => d.key !== winner.key).slice(0, 3).map((d) => ({ cards: d.cards, p: +(d.w / d.g).toFixed(4), games: d.g })),
    table: table.slice(0, 40), seconds: Math.round((Date.now() - t0) / 1000), played: STATS.games, tried: archive.size };
}

if (require.main === module) (async () => {
  const OUT = path.join(__dirname, 'out');
  const legend = String(L.arg('legend'));
  const field = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('field', 'out/field.json'))), 'utf8')).decks;
  // --start out/opt-<legend>.json: the winner and runners-up of an earlier search enter the first generation too
  let start = null, table = null;
  if (L.arg('start', null)) { const o = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('start'))), 'utf8')); start = [o.cards].concat((o.runners || []).map((r) => r.cards)); if (L.arg('keepTable', false)) table = o.table; }
  const res = await optimize({ legend, field, gens: L.arg('gens', 10), pop: L.arg('pop', 64), seeds: L.arg('seeds', 2), seed: L.arg('seed', 1), finalBot: L.arg('finalBot', 'std'), quick: !!L.arg('quick', false),
    climb: L.arg('climb', 2), wide: L.arg('wide', 30), start, table, log: (s) => console.log(s) });
  if (table) res.table = table;
  const out = path.join(OUT, String(L.arg('out', 'opt-' + legend + '.json')));
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(`${legend}: ${(100 * res.p).toFixed(1)}% vs the field over ${res.games} games, ${res.seconds} s -> ${out}`);
  console.log('  ' + res.cards.map((c) => D.CARDS[c].name).join(', '));
})();

module.exports = { evalDeck, optimize, evalMany, race, sampleDeck, score, keyOf };
