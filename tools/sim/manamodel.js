/* A fast goldfish model of mana use, after Mano's study (lands, ramp, curve, extra draws -> mana wasted).
   Not the game engine: cards are only a mana value and a role, so thousands of deck shapes can be swept in seconds.
   The engine measurement (tools/sim/bench/mana.js) checks what this model says on real lists.

   Each game: shuffle a 99-card deck, keep or mulligan (London, first mulligan free), then play 8 turns. Every turn
   draws (multiplayer: the first player draws too), plus the extra draws for that turn. The turn:
     1. play a land if there is one;
     2. cast ramp while it can be paid for (a rock or a dork costs its MV and makes 1 mana from the next turn on;
        rocks with "fast" make it this turn, like Sol Ring or Arcane Signet);
     3. spend the rest on the hand: the commander (from the command zone) and the spells, choosing the set that
        uses the most mana (exact knapsack);
     4. wasted = mana available - mana spent.
   Extra draws ("energy" in Mano's table): E extra cards over the 8 turns, spread evenly.
   Usage: node manamodel.js [--games N] [--lands 30] [--ramp 14] [--rampmv 2] [--curve 1:8,2:12,3:12,4:8,5:5,6:3,7:2]
            [--cmdr 5] [--energy 0,3,5,...] [--turns 8] [--seed 1] [--sweep] [--json]
   --curve gives the non-land, non-ramp spells by MV; they are scaled to fill 99 - lands - ramp.
   --shape file.json reads a deck shape instead (lands, cmdr, ramp with mv/fast/net/once, spells by MV; see shapeDeck).
   --draw 0 ignores the draw cards of a shape file (to see what they're worth).
   --sweep runs the land x ramp x curve grid and prints the best shapes (--by useful, the default, or --by wasted). */
"use strict";
const A = process.argv.slice(2);
const opt = (k, d) => { const i = A.indexOf("--" + k); return i < 0 ? d : (A[i + 1] == null || A[i + 1].startsWith("--") ? true : A[i + 1]); };
let seed = +opt("seed", 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const GAMES = +opt("games", 20000), TURNS = +opt("turns", 8);

function makeDeck(lands, ramp, rampMV, curve) {
  // curve: { mv: count } shape, scaled to fill the rest
  const n = 99 - lands - ramp, tot = Object.values(curve).reduce((a, b) => a + b, 0);
  const spells = [];
  const ks = Object.keys(curve).map(Number).sort((a, b) => a - b);
  let left = n;
  ks.forEach((k, i) => { const c = i === ks.length - 1 ? left : Math.round(curve[k] * n / tot); for (let j = 0; j < c && left > 0; j++, left--) spells.push({ t: "s", mv: k }); });
  const deck = [];
  for (let i = 0; i < lands; i++) deck.push({ t: "l", mv: 0 });
  // ramp: rampMV is the MV of every piece, or "mix" (a competitive mix: 1-drop dorks, 0-1 MV artifacts, 2 MV rocks)
  for (let i = 0; i < ramp; i++) {
    if (rampMV === "mix") { const r = i % 7; deck.push(r < 2 ? { t: "r", mv: 1, fast: false } : r === 2 ? { t: "r", mv: 1, fast: true } : { t: "r", mv: 2, fast: true }); }
    else deck.push({ t: "r", mv: +rampMV, fast: true });
  }
  return deck.concat(spells);
}
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
// keep: 2 to 5 mana sources among 7 (lands + 1-2 MV ramp), as most players do
const keepable = h => { const l = h.filter(c => c.t === "l").length, r = h.filter(c => c.t === "r" && c.mv <= 2).length; return l >= 2 && l + r >= 3 && l <= 5; };
// the most mana a set of hand cards (+ commander) can use with m mana: knapsack over MVs
function best(items, m) {
  const can = new Array(m + 1).fill(-1); can[0] = 0;
  const pick = new Array(m + 1).fill(null).map(() => []);
  for (let i = 0; i < items.length; i++) {
    const v = items[i].mv;
    if (v <= 0 || v > m) continue;
    for (let x = m; x >= v; x--) if (can[x - v] >= 0 && can[x] < 0) { can[x] = 1; pick[x] = pick[x - v].concat(i); }
  }
  for (let x = m; x >= 0; x--) if (can[x] >= 0) return { used: x, idx: pick[x] };
  return { used: 0, idx: [] };
}
function game(deck, cmdrMV, energy) {
  let lib, hand, mulls = 0;
  for (;;) {
    lib = shuffle(deck.slice()); hand = lib.splice(0, 7);
    if (keepable(hand) || mulls >= 3) break;
    mulls++;
  }
  // bottom mulls-1 cards: the worst ones (extra lands beyond 4, then the most expensive spells)
  for (let b = 0; b < Math.max(0, mulls - 1); b++) {
    const l = hand.filter(c => c.t === "l").length;
    let i = l > 3 ? hand.findIndex(c => c.t === "l") : hand.reduce((bi, c, k) => (c.t !== "l" && (bi < 0 || c.mv > hand[bi].mv) ? k : bi), -1);
    if (i < 0) i = 0;
    lib.push(hand.splice(i, 1)[0]);
  }
  let lands = 0, rocks = 0, cmdr = cmdrMV > 0;
  const pend = [];
  const out = { produced: 0, ramp: 0, cmdr: 0, spells: 0, wasted: 0, mulls, perTurn: [] };
  for (let t = 1; t <= TURNS; t++) {
    const extra = Math.floor(energy * t / TURNS) - Math.floor(energy * (t - 1) / TURNS);
    const owed = pend.shift() || 0;   // cards owed by draw spells cast earlier
    hand.push(...lib.splice(0, 1 + extra + owed));
    const li = hand.findIndex(c => c.t === "l");
    if (li >= 0) { hand.splice(li, 1); lands++; }
    let m = lands + rocks, produced = m, rampSpent = 0;
    // ramp first, cheapest first, while affordable
    for (;;) {
      const ri = hand.reduce((bi, c, k) => (c.t === "r" && c.mv <= m && (bi < 0 || c.mv < hand[bi].mv) ? k : bi), -1);
      if (ri < 0) break;
      const r = hand.splice(ri, 1)[0];
      const net = r.net || 1;
      m -= r.mv; rampSpent += r.mv;
      if (r.once) { m += r.once; produced += r.once; continue; }   // Mana Vault, Lotus Petal: once
      rocks += net;
      if (r.fast) { m += net; produced += net; }
    }
    const items = hand.filter(c => c.t === "s");
    if (cmdr) items.push({ t: "c", mv: cmdrMV });
    const b = best(items, m);
    let cs = 0, ss = 0;
    const chosen = new Set(b.idx.map(i => items[i]));
    for (const c of chosen) {
      if (c.t === "c") { cs += c.mv; cmdr = false; } else ss += c.mv;
      // a draw card: its extra cards arrive over the next turns (about one a turn), as an engine or a cantrip would
      if (c.draw) for (let k = 0; k < c.draw; k++) pend[k] = (pend[k] || 0) + 1;
    }
    hand = hand.filter(c => !chosen.has(c));
    const wasted = m - cs - ss;
    out.produced += produced; out.ramp += rampSpent; out.cmdr += cs; out.spells += ss; out.wasted += wasted;
    out.perTurn.push(wasted);
  }
  return out;
}
// a deck shape file: { lands, cmdr, ramp: [{ name, mv, fast, net }], spells: [{ name, mv }] or { mv: count } }
// Also reads pass 2's deckshape-*.json (lands as a name list, the commander among the spells, rocks that don't untap
// marked by a note, draw cards with their extra cards over 8 turns): the commander is taken out, a rock that doesn't
// untap counts once, and a card in `draw` brings its extra cards over the turns after it's cast (with DRAW=0, none).
function shapeDeck(sh) {
  const deck = [];
  const nl = Array.isArray(sh.lands) ? sh.lands.length : sh.lands;
  for (let i = 0; i < nl; i++) deck.push({ t: "l", mv: 0 });
  const once = r => r.once || (/doesn't untap|sacrific|exile it from your hand/i.test(r.note || "") ? r.net || 1 : 0);
  const drawOf = new Map((sh.draw || []).map(d => [d.name, d.extra || 0]));
  const useDraw = opt("draw", "1") !== "0";
  for (const r of sh.ramp) deck.push({ t: "r", mv: r.mv, fast: r.fast !== false, net: r.net || 1, once: once(r) });
  if (Array.isArray(sh.spells)) for (const x of sh.spells) { if (x.name && x.name === sh.commander) continue; deck.push({ t: "s", mv: x.mv, draw: useDraw ? drawOf.get(x.name) || 0 : 0 }); }
  else for (const [mv, n] of Object.entries(sh.spells)) for (let i = 0; i < n; i++) deck.push({ t: "s", mv: +mv });
  if (deck.length !== 99) console.error(`shape has ${deck.length} cards, not 99`);
  return deck;
}
function run(cfg) {
  const deck = cfg.shape ? shapeDeck(cfg.shape) : makeDeck(cfg.lands, cfg.ramp, cfg.rampMV, cfg.curve);
  const acc = { produced: 0, ramp: 0, cmdr: 0, spells: 0, wasted: 0, keep7: 0, w2: 0, perTurn: new Array(TURNS).fill(0) };
  for (let i = 0; i < cfg.games; i++) {
    const r = game(deck, cfg.cmdr, cfg.energy);
    for (const k of ["produced", "ramp", "cmdr", "spells", "wasted"]) acc[k] += r[k];
    acc.w2 += r.wasted * r.wasted;
    if (!r.mulls) acc.keep7++;
    r.perTurn.forEach((w, t) => { acc.perTurn[t] += w; });
  }
  const n = cfg.games, o = {};
  for (const k of ["produced", "ramp", "cmdr", "spells", "wasted"]) o[k] = acc[k] / n;
  o.wasted_se = Math.sqrt(Math.max(0, acc.w2 / n - o.wasted * o.wasted) / n);
  o.keep7 = acc.keep7 / n;
  o.perTurn = acc.perTurn.map(x => x / n);
  return o;
}
const parseCurve = s => Object.fromEntries(String(s).split(",").map(x => x.split(":").map(Number)));
const base = {
  games: GAMES, lands: +opt("lands", 30), ramp: +opt("ramp", 14), rampMV: opt("rampmv", "2"), cmdr: +opt("cmdr", 5),
  curve: parseCurve(opt("curve", "1:8,2:12,3:12,4:8,5:5,6:3,7:2")), energy: 0
};
if (opt("shape", null)) {
  base.shape = JSON.parse(require("fs").readFileSync(opt("shape"), "utf8"));
  if (base.shape.cmdr != null) base.cmdr = base.shape.cmdr;
  else if (base.shape.commander && Array.isArray(base.shape.spells)) { const c = base.shape.spells.find(x => x.name === base.shape.commander); if (c) base.cmdr = c.mv; }
  if (!base.shape.name) base.shape.name = base.shape.list || base.shape.commander || "";
}
module.exports = { run, makeDeck, base };
if (require.main === module) {
  const f = x => x.toFixed(2);
  if (opt("sweep", false)) {
    const curves = {
      low: "1:14,2:16,3:9,4:4,5:2", mid: "1:8,2:12,3:12,4:8,5:5,6:3,7:2", high: "1:4,2:8,3:12,4:10,5:8,6:5,7:4",
      twos: "1:6,2:24,3:8,4:4,5:2", flat: "1:7,2:7,3:7,4:7,5:7,6:5,7:4"
    };
    const rows = [];
    for (const lands of [26, 28, 30, 32, 34, 36, 38]) for (const ramp of [6, 10, 12, 14, 18]) for (const [cn, cv] of Object.entries(curves)) {
      const r = run(Object.assign({}, base, { games: +opt("games", 4000), lands, ramp, curve: parseCurve(cv), energy: +opt("energy", 0) }));
      rows.push(Object.assign({}, r, { lands, rampN: ramp, rampSpent: r.ramp, curve: cn, useful: r.cmdr + r.spells }));
    }
    const key = opt("by", "useful");
    rows.sort((a, b) => key === "wasted" ? a.wasted - b.wasted : b[key] - a[key]);
    if (opt("json", false)) { console.log(JSON.stringify(rows.map(r => Object.assign({}, r, { perTurn: undefined })))); process.exit(0); }
    console.log("lands ramp curve  produced  useful  ramp  wasted  keep7");
    for (const r of rows.slice(0, +opt("top", 25))) console.log(`${r.lands}    ${String(r.rampN).padEnd(4)} ${r.curve.padEnd(5)}  ${f(r.produced).padStart(7)}  ${f(r.useful).padStart(6)}  ${f(r.rampSpent).padStart(4)}  ${f(r.wasted).padStart(6)}  ${(100 * r.keep7).toFixed(0)}%`);
  } else {
    const es = String(opt("energy", "0,3,5,7,10,12,15,18,21,27,35")).split(",").map(Number);
    const res = es.map(e => ({ e, ...run(Object.assign({}, base, { energy: e })) }));
    const inf = run(Object.assign({}, base, { energy: 200, games: Math.min(GAMES, 5000) }));
    if (opt("json", false)) { console.log(JSON.stringify({ base, res, limit: inf.wasted })); process.exit(0); }
    console.log(base.shape ? `shape ${opt("shape")}: ${base.shape.name || ""}` : `lands ${base.lands}, ramp ${base.ramp} (MV ${base.rampMV}), commander MV ${base.cmdr}, curve ${JSON.stringify(base.curve)}, ${GAMES} games, ${TURNS} turns`);
    console.log(`limit with 200 extra cards: ${f(inf.wasted)} wasted`);
    console.log("energy  produced  ramp  cmdr  spells  wasted   speed  keep7");
    for (const r of res) console.log(`${String(r.e).padEnd(7)} ${f(r.produced).padStart(8)}  ${f(r.ramp).padStart(4)}  ${f(r.cmdr).padStart(4)}  ${f(r.spells).padStart(6)}  ${f(r.wasted).padStart(6)}  ${(100 * (res[0].wasted - r.wasted) / (res[0].wasted - inf.wasted)).toFixed(1).padStart(5)}%  ${(100 * r.keep7).toFixed(0)}%`);
  }
}
