/* Turns the simulation output files into origins/data.js, the numbers the site shows.
   node tools/origins/report.js [--matrix out/final-std.json] [--date 2026-11-12]

   Reads what exists in tools/origins/out/:
     final-std.json   round robin of the real lists and the searched lists (standard bot)
     cal07-std.json   round robin of the October lists on the October card pool (calibration)
     opt-<id>.json    deck search per Legendary
     refine-<id>.json every one-card change of a search winner, tested (refine.js)
     strong.json      the leading decks again with the strong bot
     sens-*.json      the leading decks under other location pools
     guide*.json      play-guide numbers of the leading decks
     bots.json        the bots measured against each other (botcheck.js --save)
     field.json       the field of opponents used by the search */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const AN = require('./analyze.js');
const TR = require('./trio.js');
const { D, DK } = L;
const REAL = AN.REAL;

const OUT = path.join(__dirname, 'out');
const read = (f) => (fs.existsSync(path.join(OUT, f)) ? JSON.parse(fs.readFileSync(path.join(OUT, f), 'utf8')) : null);
const r3 = (x) => +x.toFixed(3), r4 = (x) => +x.toFixed(4);

const M = read(String(L.arg('matrix', 'final-std.json')).replace(/^out\//, '')) || read('now-std.json');
if (!M) throw new Error('no round robin file found');
const decks = M.decks;
const K = decks.length;
const meta = Object.fromEntries(DK.META.map((d) => [d.key, d]));
const isReal = decks.map((d) => !!meta[d.key]);

// ---- the real field: real lists only, each Legendary weighted by its share of current ladder games
const share = {};
{ let t = 0; for (const k in REAL.ladderNov.wr) { share[k] = REAL.ladderNov.wr[k][1]; t += share[k]; } for (const k in share) share[k] /= t; }
const realDecks = decks.filter((d, i) => isReal[i]);
const cnt = {};
for (const d of realDecks) cnt[d.legend] = (cnt[d.legend] || 0) + 1;
let w = decks.map((d, i) => (isReal[i] ? (share[d.legend] || 0) / cnt[d.legend] : 0));
{ const t = w.reduce((a, b) => a + b, 0); w = w.map((x) => x / t); }
// a deck does not meet itself: take its own weight out and rescale
const field = decks.map((d, i) => { let s = 0, t = 0, v = 0; for (let j = 0; j < K; j++) { if (j === i || !w[j]) continue; s += w[j] * M.wr[i][j]; t += w[j]; v += w[j] * w[j] * M.wr[i][j] * (1 - M.wr[i][j]) / M.n; } return { p: s / t, se: Math.sqrt(v) / t }; });
const flat = decks.map((d, i) => M.wr[i].reduce((a, x, j) => a + (j === i ? 0 : x), 0) / (K - 1));
const N = AN.nash(M.wr, 60000);

// ---- card numbers: how the owner did in the games where the card was seen, was in the opening hand, was played
const deckCards = {};
const pool = {};
decks.forEach((d, i) => {
  const c = M.cards && M.cards[i]; if (!c) return;
  const p = flat[i];
  deckCards[d.key] = [d.legend].concat(d.cards).map((id) => { const x = c[id] || [0, 0, 0, 0, 0, 0]; return { id, seen: x[0] ? r3(x[1] / x[0]) : null, open: x[2] ? r3(x[3] / x[2]) : null, openN: x[2], played: x[4] ? r3(x[5] / x[4]) : null, playedShare: x[0] ? r3(x[4] / x[0]) : null }; });
  for (const id of [d.legend].concat(d.cards)) {
    const x = c[id]; if (!x || !x[0]) continue;
    const o = pool[id] || (pool[id] = { n: 0, d: 0, decks: 0, on: 0, od: 0 });
    // against the deck's own average over the same games (every game sees about 60% of the deck)
    const all = Object.values(c).reduce((a, y) => a + y[0], 0), allW = Object.values(c).reduce((a, y) => a + y[1], 0);
    o.n += x[0]; o.d += x[1] - x[0] * (allW / all); o.decks += 1;
    if (x[2]) { const oa = Object.values(c).reduce((a, y) => a + y[2], 0), ow = Object.values(c).reduce((a, y) => a + y[3], 0); o.on += x[2]; o.od += x[3] - x[2] * (ow / oa); }
  }
  void p;
});
const cardRatings = Object.keys(pool).map((id) => ({ id, decks: pool[id].decks, n: pool[id].n, drawn: r4(pool[id].d / pool[id].n), opening: pool[id].on ? r4(pool[id].od / pool[id].on) : null, openN: pool[id].on }))
  .sort((a, b) => b.drawn - a.drawn);

// ---- deck search
const search = {};
for (const leg of D.LEGENDS) {
  const o = read('opt-' + leg + '.json'); if (!o) continue;
  const o2 = read('opt2-' + leg + '.json');
  const same = (a, b) => a.slice().sort().join() === b.slice().sort().join();
  const rf = read('refine-' + leg + '.json');               // every one-card change of the winner, tested (refine.js)
  const refined = rf && same(rf.start, o.cards) ? rf : null;
  const cards = refined && refined.changed ? refined.cards : o.cards;
  const at = decks.find((d) => d.legend === leg && same(d.cards, cards));
  const o1 = read('opt-' + leg + '.stage1.json');           // the first pass, when a deeper second pass replaced it
  search[leg] = { key: at ? at.key : null, real: !!(at && meta[at.key]), cards, p: o.p, games: o.games, played: (o.played || 0) + (o1 ? o1.played || 0 : 0) + (refined ? refined.played : 0),
    tried: (o.tried || 0) + (o1 ? o1.tried || 0 : 0) + (refined ? refined.screen.lists : 0), deeper: !!o1,
    runners: o.runners, table: o.table.slice(0, 24), second: o2 ? { cards: o2.cards, p: o2.p, games: o2.games } : null,
    refine: refined ? { changed: refined.changed, start: refined.start, z: refined.z, played: refined.played,
      screen: { lists: refined.screen.lists, games: refined.screen.games, perList: refined.screen.perList, slots: refined.screen.slots, ins: refined.screen.ins.slice(0, 10) },
      passes: refined.passes.map((p) => ({ first: p.first.map((f) => ({ out: f.out, in: f.in, gain: f.gain, se: f.se, games: f.games })), confirm: p.confirm.map((f) => ({ out: f.out, in: f.in, gain: f.gain, se: f.se, z: f.z, games: f.games })), adopted: p.adopted })) } : null };
}
const searchGames = Object.values(search).reduce((a, x) => a + x.played, 0), searchDecks = Object.values(search).reduce((a, x) => a + x.tried, 0);

// ---- calibration against October's real numbers
const cal = [];
const C = read('cal07-std.json');
if (C) for (const name of ['meta19oct', 'vault30']) {
  const c = AN.calibrate(C, REAL[name]);
  const mu = [];
  if (REAL[name].matchups) for (const [a, b, p, n] of REAL[name].matchups) {
    let s = 0, k = 0; C.decks.forEach((d, i) => C.decks.forEach((e, j) => { if (d.legend === a && e.legend === b) { s += C.wr[i][j]; k++; } }));
    if (k) mu.push({ a, b, real: p, games: n, sim: r3(100 * s / k) });
  }
  cal.push({ key: name, label: REAL[name].label, games: REAL[name].games, pearson: r3(c.pearson), spearman: r3(c.spearman), gap: r3(c.mae), lists: C.decks.length, simGames: C.games,
    rows: c.rows.map((r) => ({ legend: r.legend, real: r.real, games: r.games, sim: r3(r.sim), best: r3(r.simBest), lists: r.lists })), matchups: mu });
}
// the same comparison for the current patch (small real sample)
const calNow = AN.calibrate({ decks: realDecks, wr: realDecks.map((d) => { const i = decks.indexOf(d); return realDecks.map((e) => M.wr[i][decks.indexOf(e)]); }) }, REAL.ladderNov);

// ---- Legendary table
const legends = D.LEGENDS.map((id) => {
  const idx = decks.map((d, i) => i).filter((i) => decks[i].legend === id);
  const realIdx = idx.filter((i) => isReal[i]);
  const best = idx.slice().sort((a, b) => field[b].p - field[a].p)[0];
  const bestReal = realIdx.slice().sort((a, b) => field[b].p - field[a].p)[0];
  const tier = Object.keys(REAL.tiers).find((t) => Array.isArray(REAL.tiers[t]) && REAL.tiers[t].includes(id)) || null;
  return { id, name: D.CARDS[id].name, power: D.POWERS[id], lists: realIdx.length,
    now: REAL.ladderNov.wr[id] || null, oct: REAL.meta19oct.wr[id] || null, vault: REAL.vault30.wr[id] || null, share: share[id] ? r3(share[id]) : 0,
    cup: REAL.cup.share[id] != null ? [REAL.cup.share[id], REAL.cup.ban[id]] : null, tier,
    best: best != null ? decks[best].key : null, bestP: best != null ? r4(field[best].p) : null, bestReal: bestReal != null ? decks[bestReal].key : null, bestRealP: bestReal != null ? r4(field[bestReal].p) : null,
    mean: realIdx.length ? r3(realIdx.reduce((a, i) => a + field[i].p, 0) / realIdx.length) : null };
});

// ---- line-ups for a Conquest tournament with one ban: the best list of each Legendary
const reps = legends.filter((l) => l.best).map((l) => decks.findIndex((d) => d.key === l.best));
const sub = reps.map((i) => reps.map((j) => (i === j ? 0.5 : M.wr[i][j])));
const cupShare = {}; for (const k in REAL.cup.share) cupShare[k] = REAL.cup.share[k];
for (const l of D.LEGENDS) if (cupShare[l] == null) cupShare[l] = 1;
const trio = TR.lineups(reps.map((i) => decks[i]), sub, cupShare);

// ---- strong-bot check, other location pools, play guide
const S = read('strong.json');
const strong = S ? { keys: S.decks.map((d) => d.key), wr: S.wr.map((r) => r.map(r3)), n: S.n, games: S.games,
  avg: S.decks.map((d, i) => r3(S.wr[i].reduce((a, x, j) => a + (j === i ? 0 : x), 0) / (S.decks.length - 1))),
  std: S.decks.map((d) => { const i = decks.findIndex((e) => e.key === d.key); const js = S.decks.map((e) => decks.findIndex((f) => f.key === e.key)); return i < 0 ? null : r3(js.reduce((a, j) => a + (j === i || j < 0 ? 0 : M.wr[i][j]), 0) / (S.decks.length - 1)); }) } : null;
const sens = [];
for (const [f, label] of [['sens-cup.json', 'Tournament pool (the 7 swingy locations off)'], ['sens-noloc.json', 'No locations at all'], ['sens-flat.json', 'All 43 locations equally likely']]) {
  const x = read(f); if (!x) continue;
  sens.push({ label, n: x.n, games: x.games, rows: x.decks.map((d, i) => ({ key: d.key, p: r3(x.wr[i].reduce((a, y, j) => a + (j === i ? 0 : y), 0) / (x.decks.length - 1)),
    base: (() => { const bi = decks.findIndex((e) => e.key === d.key); const js = x.decks.map((e) => decks.findIndex((g) => g.key === e.key)); return r3(js.reduce((a, j) => a + (j === bi ? 0 : M.wr[bi][j]), 0) / (x.decks.length - 1)); })() })) });
}
const guides = fs.readdirSync(OUT).filter((f) => /^guide.*\.json$/.test(f)).sort().map((f) => read(f));
const fieldFile = read('field.json');
const bots = read('bots.json');

// ---- the pick: the list with the best win rate against the ladder field, among the Legendaries that also win
// more than half of their real ladder games this patch. The simulator and the ladder have to agree.
const okLeg = new Set(Object.keys(REAL.ladderNov.wr).filter((k) => REAL.ladderNov.wr[k][0] > 50));
const order = decks.map((d, i) => i).sort((a, b) => field[b].p - field[a].p);
const pickI = order.find((i) => okLeg.has(decks[i].legend));
const pick = { key: decks[pickI].key, rule: 'best simulated win rate against the ladder field among Legendaries above 50% on the real ladder this patch', simTop: decks[order[0]].key,
  eligible: [...okLeg], nextReal: (() => { const j = order.find((i) => isReal[i] && decks[i].legend === decks[pickI].legend); return j == null ? null : decks[j].key; })(),
  others: order.filter((i) => okLeg.has(decks[i].legend) && decks[i].legend !== decks[pickI].legend).filter((i, k, a) => a.findIndex((j) => decks[j].legend === decks[i].legend) === k).map((i) => decks[i].key) };

const games = M.games + (C ? C.games : 0) + (S ? S.games : 0) + sens.reduce((a, s) => a + s.games, 0) + guides.reduce((a, g) => a + g.games + (g.mullGames || 0), 0) + Object.values(bots || {}).reduce((a, b) => a + (b.n || 0), 0) + searchGames;

const out = {
  made: String(L.arg('date', new Date().toISOString().slice(0, 10))),
  game: { client: '0.8.2', data: 1266 },
  games, bot: M.bot, perPair: M.n, rounds: M.rounds,
  decks: decks.map((d, i) => ({ key: d.key, legend: d.legend, name: meta[d.key] ? meta[d.key].name : d.name, author: meta[d.key] ? meta[d.key].author : 'simulation', source: meta[d.key] ? meta[d.key].source : 'search',
    cards: d.cards, self: meta[d.key] && meta[d.key].wr ? [meta[d.key].wr, meta[d.key].games] : null, field: r4(field[i].p), se: r4(field[i].se), flat: r4(flat[i]), nash: r4(N.mix[i]), w: +w[i].toFixed(5) })),
  wr: M.wr.map((r) => r.map(r3)),
  nashGap: r4(N.gap),
  field: { label: REAL.ladderNov.label, games: REAL.ladderNov.games, share: Object.fromEntries(Object.keys(share).map((k) => [k, r3(share[k])])) },
  legends, tiers: REAL.tiers, cup: REAL.cup,
  calibration: cal, calNow: { pearson: r3(calNow.pearson), spearman: r3(calNow.spearman), gap: r3(calNow.mae), rows: calNow.rows.map((r) => ({ legend: r.legend, real: r.real, games: r.games, sim: r3(r.sim), best: r3(r.simBest), lists: r.lists })) },
  search, searchField: fieldFile ? fieldFile.decks.map((d) => ({ key: d.key, legend: d.legend, w: r3(d.w) })) : null,
  cardRatings, deckCards, strong, sens, trio, guides, pick, bots, searchGames, searchDecks,
  reals: realDecks.length, nextPatch: '17 Nov 2026',
};
// the best list of each Legendary and the pick, for the follow-up runs (strong bot, other location pools, guides)
fs.writeFileSync(path.join(OUT, 'reps.json'), JSON.stringify({ pick: pick.key, nextReal: pick.nextReal, decks: reps.map((i) => ({ key: decks[i].key, legend: decks[i].legend, name: decks[i].name, cards: decks[i].cards, source: isReal[i] ? decks[i].source : 'search', author: decks[i].author })) }, null, 1));
const js = '/* Origins TCG simulation results. Generated by tools/origins/report.js: do not edit by hand. */\n(function (root) { (root.OT = root.OT || {}).results = ' + JSON.stringify(out) + '; })(typeof self !== \'undefined\' ? self : this);\n';
fs.writeFileSync(path.join(__dirname, '..', '..', 'origins', 'data.js'), js);
console.log(`origins/data.js written: ${K} decks, ${games} games counted, ${(js.length / 1024).toFixed(0)} KB`);
const top = out.decks.slice().sort((a, b) => b.field - a.field).slice(0, 12);
for (const d of top) console.log('  ' + d.key.padEnd(18) + (100 * d.field).toFixed(1) + '% ±' + (196 * d.se).toFixed(1) + '   flat ' + (100 * d.flat).toFixed(1) + '%   nash ' + (100 * d.nash).toFixed(1) + '%');
