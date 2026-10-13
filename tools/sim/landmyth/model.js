'use strict';
// Land myth part 2: the game model (decks, curves, states, transitions).
// No policy lives here: a policy is any function (state, t) -> action, and the
// model only checks that the action is legal and applies it. Phase 2 swaps the
// part 1 heuristic (policy1.js) for a max over enumerateActions().

const SCENARIOS = {
  P1: [0, 0, 0, 0], P2: [1, 0, 0, 0], P3: [1, 1, 0, 0], P4: [1, 1, 1, 0],
  P5: [1, 1, 1, 1], P6: [2, 1, 1, 1], P7: [2, 2, 1, 1], P8: [2, 2, 2, 1],
};
const DECK_SIZE = 99;
const CMD_COST = 4, DORK_CMC = 1, ROCK_CMC = 2; // CMD_COST: default commander cost (part 1); decks carry their own deck.cmdCost
const MAX_COST = 8;
const T_LAND = 0, T_DORK = 1, T_ROCK = 2; // spell types follow, one per cost present

// Cards drawn on turn t (1 + extra on turns 5-8), as in part 1.
function drawsAt(extra, t) { return 1 + (t >= 5 && t <= 8 ? extra[t - 5] : 0); }

// ---------- Spell cost spreads (PREREG) ----------
// Each returns counts[0..8] (index = cost) summing exactly to S, or null if infeasible.

// tight: identical to part 1 spellCurve(mode 'avg', curve 'tight'):
// total cost round(avg*S), split over floor/ceil.
function tightCounts(S, avg) {
  const budget = Math.round(avg * S);
  if (S <= 0 || budget < S) return null;
  const lo = Math.floor(budget / S), hi = budget - lo * S;
  if (lo + (hi > 0 ? 1 : 0) > MAX_COST) return null;
  const c = new Array(MAX_COST + 1).fill(0);
  c[lo] += S - hi; if (hi) c[lo + 1] += hi;
  return c;
}

function normCdf(x) { return 0.5 * (1 + erf(x / Math.SQRT2)); }
function erf(x) { // Maclaurin series below 3, continued fraction for erfc above: ~1e-13 accuracy
  const s = x < 0 ? -1 : 1; x = Math.abs(x);
  if (x < 3) { // Maclaurin series, converges fast for |x| < 3
    let sum = x, term = x, n = 0;
    while (Math.abs(term) > 1e-17 * Math.abs(sum)) { n++; term *= -x * x / n; sum += term / (2 * n + 1); }
    return s * 2 / Math.sqrt(Math.PI) * sum;
  }
  // continued fraction for erfc, x >= 3
  let f = 0; for (let k = 60; k >= 1; k--) f = (k / 2) / (x + f);
  const erfc = Math.exp(-x * x) / Math.sqrt(Math.PI) / (x + f);
  return s * (1 - erfc);
}

// Hamilton (largest remainder) rounding of real weights to integers summing to S.
// Ties broken towards the lower cost: deterministic.
function apportion(weights, S) {
  const tot = weights.reduce((a, b) => a + b, 0);
  const q = weights.map(w => w / tot * S);
  const c = q.map(Math.floor);
  let rest = S - c.reduce((a, b) => a + b, 0);
  const order = q.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => (b[0] - a[0]) || (a[1] - b[1]));
  for (let k = 0; k < rest; k++) c[order[k][1]]++;
  return c;
}

// normal: discretised normal, sd 1.0, on costs 1..8 (tails folded into 1 and 8).
// The centre mu is solved so that the discretised (pre-rounding) mean equals avg;
// counts are then Hamilton-rounded to sum to S. The realised average can differ
// from avg by up to ~0.5/S per card moved; deckStats() reports it.
function normalWeights(mu, sd) {
  const w = new Array(MAX_COST + 1).fill(0);
  for (let c = 1; c <= MAX_COST; c++) {
    const a = c === 1 ? -Infinity : (c - 0.5 - mu) / sd;
    const b = c === MAX_COST ? Infinity : (c + 0.5 - mu) / sd;
    w[c] = (b === Infinity ? 1 : normCdf(b)) - (a === -Infinity ? 0 : normCdf(a));
  }
  return w;
}
function normalCounts(S, avg, sd = 1.0) {
  if (S <= 0) return null;
  const meanOf = mu => { const w = normalWeights(mu, sd); let m = 0; for (let c = 1; c <= MAX_COST; c++) m += c * w[c]; return m; };
  let lo = -10, hi = 20;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (meanOf(mid) < avg) lo = mid; else hi = mid; }
  const w = normalWeights((lo + hi) / 2, sd);
  return apportion(w, S);
}

// barbell: floor(S/2) cheap spells at cost 1-2, the rest expensive at 5-7, total cost round(avg*S).
// The extra cost above the all-1 / all-5 floor is shared between the halves in proportion
// to their room (cheap: +1 each, expensive: +2 each); inside each half the spread is tight.
// Feasible only for 3.0 <= avg <= 4.5 (roughly): below 3.0 returns null (see README).
function barbellCounts(S, avg) {
  if (S < 2) return null;
  const nC = Math.floor(S / 2), nX = S - nC;
  const target = Math.round(avg * S);
  const E = target - (nC * 1 + nX * 5), cap = nC * 1 + nX * 2;
  if (E < 0 || E > cap) return null;
  let eC = Math.round(E * nC / cap);
  eC = Math.max(Math.max(0, E - 2 * nX), Math.min(Math.min(nC, E), eC));
  const eX = E - eC;
  const c = new Array(MAX_COST + 1).fill(0);
  c[1] += nC - eC; c[2] += eC;
  const lo = 5 + Math.floor(eX / nX), hiN = eX - (lo - 5) * nX;
  c[lo] += nX - hiN; if (hiN) c[lo + 1] += hiN;
  return c;
}

// normal3 (NOT in PREREG; a candidate coarsening measured for phase 2): the same discretised
// normal folded onto three costs, round(avg)-1..round(avg)+1 (shifted up to start at 1), centre
// re-solved so the folded mean equals avg, then Hamilton-rounded to S.
function normal3Counts(S, avg, sd = 1.0) {
  if (S <= 0) return null;
  const mid = Math.max(2, Math.min(MAX_COST - 1, Math.round(avg))), lo = mid - 1, hi = mid + 1;
  const fold = mu => { const w = normalWeights(mu, sd), f = new Array(MAX_COST + 1).fill(0); for (let c = 1; c <= MAX_COST; c++) f[Math.max(lo, Math.min(hi, c))] += w[c]; return f; };
  const meanOf = mu => { const f = fold(mu); let m = 0; for (let c = lo; c <= hi; c++) m += c * f[c]; return m; };
  if (avg <= lo || avg >= hi) return null;
  let a = -10, b = 20;
  for (let i = 0; i < 200; i++) { const m = (a + b) / 2; if (meanOf(m) < avg) a = m; else b = m; }
  return apportion(fold((a + b) / 2), S);
}

function spellCounts(shape, S, avg) {
  if (shape === 'normal3') return normal3Counts(S, avg);
  if (shape === 'tight') return tightCounts(S, avg);
  if (shape === 'normal') return normalCounts(S, avg);
  if (shape === 'barbell') return barbellCounts(S, avg);
  throw new Error('unknown shape ' + shape);
}

// ---------- Deck ----------
// Types: 0 land, 1 dork, 2 rock, then one type per spell cost with a nonzero count (ascending),
// then (real-ramp variant only) one type per extra ramp class, from index X0 = 3 + nSp.
// ramp (optional): extra ramp classes [{name, cost, out, tapped, count}] beyond the default dork
// (cost 1, makes 1 from the next turn) and rock (cost 2, makes 1 at once): e.g. Sol Ring
// {cost 1, out 2}, a 3-mana rock {cost 3, out 1}, a 2-mana dork {cost 2, out 1, tapped: true}.
// A class with tapped makes mana from the turn after it is cast. Counts may be 0 (the type then
// exists but is never drawn), so decks of one variant share one layout. Without ramp the deck,
// its layout and every result are exactly the default model's (X0 = n, nX = 0).
// D counts the default 1-mana dorks and R the default 2-mana rocks; extra classes are not in D or R.
function makeDeck(L, D, R, costCounts, cmdCost = CMD_COST, ramp = null) {
  const xs = ramp || [], nXc = xs.reduce((a, c) => a + c.count, 0);
  const S = DECK_SIZE - L - D - R - nXc;
  if (S < 0) throw new Error('more than 99 cards');
  const sum = costCounts.reduce((a, b) => a + b, 0);
  if (sum !== S) throw new Error(`spell counts sum ${sum} != S ${S}`);
  const costs = [], K = [L, D, R];
  for (let c = 1; c < costCounts.length; c++) if (costCounts[c] > 0) { costs.push(c); K.push(costCounts[c]); }
  if (costCounts[0]) throw new Error('0-cost spells not modelled');
  const X0 = K.length;
  for (const c of xs) K.push(c.count);
  const n = K.length;
  const cost = [0, DORK_CMC, ROCK_CMC, ...costs, ...xs.map(c => c.cost)];
  const maxCmc = Math.max(1, ...costs);
  const nSp = X0 - 3, nX = xs.length;
  const W = 2 * n + 4;
  return {
    L, D, R, S, K, n, nSp, cost, costs, maxCmc, W, cmdCost,
    // offsets into a state vector
    K_OFF: 0, H_OFF: n, B_LAND: 2 * n, B_ROCK: 2 * n + 1, B_DORK: 2 * n + 2, CMD: 2 * n + 3,
    avg: S ? costs.reduce((a, c, i) => a + c * K[3 + i], 0) / S : 0,
    costCounts: costCounts.slice(),
    X0, nX, ramp: xs.map(c => ({ name: c.name, cost: c.cost, out: c.out, tapped: !!c.tapped, count: c.count })),
  };
}

// ---------- State ----------
// Uint8Array of length W (+ extra bytes a caller may append, e.g. cumulative useful mana):
//   [k_0..k_{n-1}]  library count of each type (library = deck - hand - board - graveyard - bottomed)
//   [h_0..h_{n-1}]  hand count of each type
//   lands, rocks, dorks on the battlefield (at the start of a turn every dork is untapped and able to tap)
//   cmd: 1 once the commander is cast
// The library composition IS the information about which cards were drawn, so this
// is the minimal Markov state for exact hypergeometric draws.

function binom(n, k) {
  if (k < 0 || k > n) return 0;
  k = Math.min(k, n - k);
  let r = 1;
  for (let i = 1; i <= k; i++) r = r * (n - k + i) / i;
  return r;
}

// Every 7-card opening composition with its multivariate hypergeometric probability.
function openingHands(deck, size = 7) {
  const { n, K } = deck, out = [];
  const total = binom(DECK_SIZE, size);
  const x = new Array(n).fill(0);
  (function rec(i, left, w) {
    if (i === n - 1) {
      if (left > K[i]) return;
      x[i] = left;
      out.push({ x: x.slice(), p: w * binom(K[i], left) / total });
      return;
    }
    for (let v = 0; v <= Math.min(left, K[i]); v++) { x[i] = v; rec(i + 1, left - v, w * binom(K[i], v)); }
  })(0, size, 1);
  return out;
}

// Part 1 keep rule on a 7-card hand: 2-5 lands, or 1 land + at least 2 ramp (dorks + rocks).
function part1Keep(x) {
  const L = x[T_LAND], R = x[T_DORK] + x[T_ROCK];
  return (L >= 2 && L <= 5) || (L === 1 && R >= 2);
}

// Part 1 bottom rule after the second mulligan (third 7-card hand, keep 6):
// a land if the hand has 4+ lands; otherwise the most expensive card by part 1's
// card code (spell code = its cost; land -1 > dork -2 > rock -3), i.e. the most
// expensive spell, or if there is no spell, a land, else a dork, else a rock.
function part1Bottom(deck, x) {
  if (x[T_LAND] >= 4) return T_LAND;
  for (let i = deck.X0 - 1; i >= 3; i--) if (x[i] > 0) return i;
  if (x[T_LAND] > 0) return T_LAND;
  if (x[T_DORK] > 0) return T_DORK;
  if (!deck.nX || x[T_ROCK] > 0) return T_ROCK;
  for (let i = deck.n - 1; i >= deck.X0; i--) if (x[i] > 0) return i; // real-ramp variant: an extra ramp card
  return T_ROCK;
}
// Same keep rule when the deck has extra ramp classes: they count as ramp.
function part1KeepX(deck, x) {
  let R = x[T_DORK] + x[T_ROCK];
  for (let i = deck.X0; i < deck.n; i++) R += x[i];
  const L = x[T_LAND];
  return (L >= 2 && L <= 5) || (L === 1 && R >= 2);
}

// Opening-state distribution. opts.mulligan false: always keep 7.
// Otherwise part 1: hand 0 kept if keep(x); else hand 1 (new shuffle, 7 cards, free) kept if keep(x);
// else hand 2 is always kept with one card bottomed (bottom(x)). keep/bottom are pluggable for phase 2.
function openingStates(deck, opts = {}) {
  const keep = opts.keep || (deck.nX ? (x) => part1KeepX(deck, x) : part1Keep), bottom = opts.bottom || ((x) => part1Bottom(deck, x));
  const hands = openingHands(deck, 7);
  const res = [];
  const mk = (x, b) => {
    const s = new Uint8Array(deck.W);
    for (let i = 0; i < deck.n; i++) { s[deck.K_OFF + i] = deck.K[i] - x[i]; s[deck.H_OFF + i] = x[i]; }
    if (b >= 0) s[deck.H_OFF + b]--; // bottomed card: in neither library nor hand (part 1 puts it at position 98, never reached)
    return s;
  };
  if (opts.mulligan === false) { for (const h of hands) res.push({ s: mk(h.x, -1), p: h.p, stage: 0 }); return res; }
  let pFail = 0;
  for (const h of hands) if (!keep(h.x)) pFail += h.p;
  for (const h of hands) {
    if (keep(h.x)) { res.push({ s: mk(h.x, -1), p: h.p, stage: 0 }); res.push({ s: mk(h.x, -1), p: pFail * h.p, stage: 1 }); }
    res.push({ s: mk(h.x, bottom(h.x)), p: pFail * pFail * h.p, stage: 2 });
  }
  return res;
}

// ---------- Actions ----------
// A turn's action, chosen after the draw: {land: 0|1, r: rocks cast, d: dorks cast, cmd: 0|1, take: Int array per spell type}.
// Rocks are cast first (each nets -1 mana but must be paid with 2), so an action is legal iff
// r <= hand rocks, d <= hand dorks, take <= hand, cmd only if not yet cast,
// r == 0 or mana0 >= r + 1, and 2r + d + 4cmd + sum(take*cost) <= mana0 + r.
function manaAvailable(deck, s, land) { return s[deck.B_LAND] + land + s[deck.B_ROCK] + s[deck.B_DORK]; }

// Apply an action to a post-draw state s, writing the next pre-draw state into out.
// Returns the turn's rewards in rw (preallocated object).
function applyAction(deck, s, a, out, rw) {
  if (deck.nX) return applyActionX(deck, s, a, out, rw);
  const { n, H_OFF, B_LAND, B_ROCK, B_DORK, CMD, cost } = deck;
  out.set(s);
  if (a.land && s[H_OFF + T_LAND] === 0) throw new Error('land drop without land');
  const mana0 = manaAvailable(deck, s, a.land);
  if (a.r > s[H_OFF + T_ROCK] || a.d > s[H_OFF + T_DORK]) throw new Error('ramp not in hand');
  if (a.r > 0 && mana0 < a.r + 1) throw new Error('rock not payable');
  if (a.cmd && s[CMD]) throw new Error('commander twice');
  let useful = a.cmd ? deck.cmdCost : 0, spells = a.cmd ? 1 : 0;
  for (let j = 0; j < deck.nSp; j++) {
    const k = a.take[j];
    if (k) {
      if (k > s[H_OFF + 3 + j]) throw new Error('spell not in hand');
      out[H_OFF + 3 + j] -= k; useful += k * cost[3 + j]; spells += k;
    }
  }
  const ramp = ROCK_CMC * a.r + DORK_CMC * a.d;
  if (useful + ramp > mana0 + a.r) throw new Error('overspent');
  if (a.land) { out[H_OFF + T_LAND]--; out[B_LAND]++; }
  out[H_OFF + T_ROCK] -= a.r; out[B_ROCK] += a.r;
  out[H_OFF + T_DORK] -= a.d; out[B_DORK] += a.d;
  if (a.cmd) out[CMD] = 1;
  rw.useful = useful; rw.gen = mana0 + a.r; rw.ramp = ramp; rw.spells = spells; rw.rampCast = a.r + a.d;
  rw.unused = rw.gen - useful - ramp;
  return rw;
}

// Real-ramp variant (deck.nX > 0): a.x[k] copies of extra class k are cast too. B_ROCK holds the
// mana the rocks (and tapped-on-entry classes) on the battlefield make each turn, so a Sol Ring adds 2.
// Legal iff some casting order pays every ramp card when cast; the order tried is the best one:
// rocks that make at least what they cost (cheapest first), then the other untapped rocks (most
// mana made first), then dorks and tapped classes (pure costs), then spells and the commander.
function rampOrder(deck) {
  if (deck._rampOrder) return deck._rampOrder;
  const cls = [{ i: T_ROCK, k: -1, cost: ROCK_CMC, out: 1, tapped: false }];
  deck.ramp.forEach((c, k) => cls.push({ i: deck.X0 + k, k, cost: c.cost, out: c.out, tapped: c.tapped }));
  const free = cls.filter(c => !c.tapped && c.out >= c.cost).sort((a, b) => a.cost - b.cost);
  const neg = cls.filter(c => !c.tapped && c.out < c.cost).sort((a, b) => (b.out - a.out) || (a.cost - b.cost));
  const sick = [{ i: T_DORK, k: -2, cost: DORK_CMC, out: 1, tapped: true }, ...cls.filter(c => c.tapped)];
  deck._rampOrder = { free, neg, sick, all: cls };
  return deck._rampOrder;
}
function applyActionX(deck, s, a, out, rw) {
  const { H_OFF, B_LAND, B_ROCK, B_DORK, CMD, cost, X0, nX } = deck;
  out.set(s);
  if (a.land && s[H_OFF + T_LAND] === 0) throw new Error('land drop without land');
  const mana0 = manaAvailable(deck, s, a.land);
  if (a.r > s[H_OFF + T_ROCK] || a.d > s[H_OFF + T_DORK]) throw new Error('ramp not in hand');
  const cnt = c => (c.k === -1 ? a.r : c.k === -2 ? a.d : a.x[c.k]);
  for (let k = 0; k < nX; k++) if (a.x[k] > s[H_OFF + X0 + k]) throw new Error('ramp not in hand');
  if (a.cmd && s[CMD]) throw new Error('commander twice');
  const ord = rampOrder(deck);
  let avail = mana0, gen = mana0, ramp = 0, rampCast = 0, board = 0;
  for (const c of [...ord.free, ...ord.neg]) for (let q = cnt(c); q > 0; q--) {
    if (avail < c.cost) throw new Error('rock not payable');
    avail += c.out - c.cost; gen += c.out; ramp += c.cost; rampCast++; board += c.out;
  }
  for (const c of ord.sick) { const q = cnt(c); avail -= q * c.cost; ramp += q * c.cost; rampCast += q; if (c.k !== -2) board += q * c.out; }
  let useful = a.cmd ? deck.cmdCost : 0, spells = a.cmd ? 1 : 0;
  for (let j = 0; j < deck.nSp; j++) {
    const k = a.take[j];
    if (k) {
      if (k > s[H_OFF + 3 + j]) throw new Error('spell not in hand');
      out[H_OFF + 3 + j] -= k; useful += k * cost[3 + j]; spells += k;
    }
  }
  if (useful > avail) throw new Error('overspent');
  if (a.land) { out[H_OFF + T_LAND]--; out[B_LAND]++; }
  out[H_OFF + T_ROCK] -= a.r; out[H_OFF + T_DORK] -= a.d; out[B_DORK] += a.d;
  for (let k = 0; k < nX; k++) out[H_OFF + X0 + k] -= a.x[k];
  out[B_ROCK] += board;
  if (a.cmd) out[CMD] = 1;
  rw.useful = useful; rw.gen = gen; rw.ramp = ramp; rw.spells = spells; rw.rampCast = rampCast;
  rw.unused = gen - useful - ramp;
  return rw;
}

// All legal actions (for phase 2). With maximalOnly, only actions to which no further card
// in hand can be added (land drop always taken): any other action is weakly dominated in the
// solo goldfish (casting a card now with mana that would otherwise be lost never hurts).
function enumerateActions(deck, s, maximalOnly = true) {
  if (deck.nX) throw new Error('enumerateActions: the real-ramp variant (extra ramp classes) is not supported in phase 2 yet');
  const { H_OFF, CMD, nSp, cost } = deck;
  const land = s[H_OFF + T_LAND] > 0 ? 1 : 0;
  const mana0 = manaAvailable(deck, s, land);
  const hR = s[H_OFF + T_ROCK], hD = s[H_OFF + T_DORK];
  const acts = [];
  const take = new Int32Array(nSp);
  const cmdOpts = s[CMD] ? [0] : [0, 1];
  for (let r = 0; r <= hR; r++) {
    if (r > 0 && mana0 < r + 1) break;
    const budgetR = mana0 + r - ROCK_CMC * r; // mana left after r rocks
    for (let d = 0; d <= hD && d <= budgetR; d++) {
      for (const cmd of cmdOpts) {
        const b0 = budgetR - d - cmd * deck.cmdCost;
        if (b0 < 0) continue;
        (function rec(j, b) {
          if (j === nSp) {
            if (maximalOnly) {
              // can anything else be added?
              if (r < hR && b >= 1 && (mana0 >= r + 2)) return; // another rock: needs 2 available, nets -1
              if (d < hD && b >= DORK_CMC) return;
              if (!s[CMD] && !cmd && b >= deck.cmdCost) return;
              for (let i = 0; i < nSp; i++) if (take[i] < s[H_OFF + 3 + i] && b >= cost[3 + i]) return;
            }
            acts.push({ land, r, d, cmd, take: take.slice() });
            return;
          }
          const c = cost[3 + j], mx = Math.min(s[H_OFF + 3 + j], Math.floor(b / c));
          for (let x = 0; x <= mx; x++) { take[j] = x; rec(j + 1, b - x * c); }
          take[j] = 0;
        })(0, b0);
      }
    }
  }
  return acts;
}

module.exports = {
  SCENARIOS, DECK_SIZE, CMD_COST, DORK_CMC, ROCK_CMC, MAX_COST, T_LAND, T_DORK, T_ROCK,
  drawsAt, tightCounts, normalCounts, barbellCounts, spellCounts, makeDeck, binom,
  openingHands, openingStates, part1Keep, part1KeepX, part1Bottom, applyAction, rampOrder, enumerateActions, manaAvailable,
};
