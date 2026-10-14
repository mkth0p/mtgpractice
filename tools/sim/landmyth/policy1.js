'use strict';
// Part 1 play rule (tools/sim/manabase/manasim.js, play()), ported as a policy:
// (deck, post-draw state, turn) -> action. Kept line for line in the same order:
//   0. play a land if one is in hand;
//   1. commander first: while a rock is in hand and mana >= cmdCost+1 (5 in part 1), cast the rock
//      (net -1); then cast the commander if mana >= cmdCost (4 in part 1);
//   2. turns 1-6: cast rocks while mana >= 2, then dorks while mana >= 1;
//   3. useful spells: bestSpend (max mana spent, part 1's search order decides ties);
//   4. turns 7+: rocks then dorks with what is left.
const M = require('./model');

const RAMP_FIRST_UNTIL = 6;

// Verbatim port of part 1 bestSpend (same search order, so the same tie-breaks).
function bestSpend(cnt, maxCmc, mana, take) {
  let best = -1, bestTake = null;
  const cur = new Array(maxCmc + 1).fill(0);
  function rec(cmc, rem) {
    if (best === mana) return;
    if (cmc === 0) {
      const spent = mana - rem;
      if (spent > best) { best = spent; bestTake = cur.slice(); }
      return;
    }
    const n = Math.min(cnt[cmc], Math.floor(rem / cmc));
    for (let x = n; x >= 0; x--) { cur[cmc] = x; rec(cmc - 1, rem - x * cmc); if (best === mana) return; }
    cur[cmc] = 0;
  }
  rec(maxCmc, mana);
  for (let c = 0; c <= maxCmc; c++) take[c] = bestTake ? bestTake[c] : 0;
  return best;
}

function makePolicy(deck) {
  if (deck.nX) return makePolicyX(deck);
  const { H_OFF, B_LAND, B_ROCK, B_DORK, CMD, nSp, maxCmc, costs, cmdCost } = deck;
  const cnt = new Int32Array(maxCmc + 1), tk = new Int32Array(maxCmc + 1);
  const act = { land: 0, r: 0, d: 0, cmd: 0, take: new Int32Array(nSp) };
  return function policy(s, t) {
    let hRock = s[H_OFF + M.T_ROCK], hDork = s[H_OFF + M.T_DORK];
    act.land = s[H_OFF + M.T_LAND] > 0 ? 1 : 0;
    let mana = s[B_LAND] + act.land + s[B_ROCK] + s[B_DORK];
    let r = 0, d = 0, cmd = 0;
    if (!s[CMD]) {
      while (hRock > 0 && mana >= cmdCost + 1) { hRock--; r++; mana -= M.ROCK_CMC; mana += 1; }
      if (mana >= cmdCost) { mana -= cmdCost; cmd = 1; }
    }
    if (t <= RAMP_FIRST_UNTIL) {
      while (hRock > 0 && mana >= M.ROCK_CMC) { hRock--; r++; mana -= M.ROCK_CMC; mana += 1; }
      while (hDork > 0 && mana >= M.DORK_CMC) { hDork--; d++; mana -= M.DORK_CMC; }
    }
    act.take.fill(0);
    if (mana > 0) {
      cnt.fill(0);
      for (let j = 0; j < nSp; j++) cnt[costs[j]] = s[H_OFF + 3 + j];
      const spent = bestSpend(cnt, maxCmc, mana, tk);
      if (spent > 0) {
        for (let j = 0; j < nSp; j++) act.take[j] = tk[costs[j]];
        mana -= spent;
      }
    }
    if (t > RAMP_FIRST_UNTIL) {
      while (hRock > 0 && mana >= M.ROCK_CMC) { hRock--; r++; mana -= M.ROCK_CMC; mana += 1; }
      while (hDork > 0 && mana >= M.DORK_CMC) { hDork--; d++; mana -= M.DORK_CMC; }
    }
    act.r = r; act.d = d; act.cmd = cmd;
    return act;
  };
}

// Real-ramp variant (deck with extra ramp classes, model.js makeDeck ramp): the same rule, with the
// rocks ranked by what they cost per mana they make (cheapest first; ties: the cheaper card first):
//   0. play a land if one is in hand;
//   1. (new) rocks that make at least what they cost (Sol Ring, a mox): cast every one in hand, any
//      turn, as soon as it can be paid, before anything else: they never leave less mana this turn;
//   2. commander first: while some other untapped rock in hand can be paid and leaves mana >= cmdCost
//      after it, cast the cheapest-per-mana such rock; then the commander if mana >= cmdCost;
//   3. turns 1-6: untapped rocks, cheapest-per-mana first, while each can be paid; then the dorks
//      and the classes that make mana from the next turn (2-mana dorks), cheapest-per-mana first;
//   4. useful spells: bestSpend; 5. turns 7+: step 3 with what is left.
// With only the default dork and rock this is exactly makePolicy's rule (step 1 never fires, and
// steps 2-3 reduce to "rocks while mana >= cmdCost + 1", "rocks while mana >= 2, then dorks").
function makePolicyX(deck) {
  const { H_OFF, B_LAND, B_ROCK, B_DORK, CMD, nSp, maxCmc, costs, cmdCost, X0, nX } = deck;
  const cls = [{ i: M.T_ROCK, k: -1, cost: M.ROCK_CMC, out: 1, tapped: false }, { i: M.T_DORK, k: -2, cost: M.DORK_CMC, out: 1, tapped: true }];
  deck.ramp.forEach((c, k) => cls.push({ i: X0 + k, k, cost: c.cost, out: c.out, tapped: c.tapped }));
  const rank = (a, b) => (a.cost * b.out - b.cost * a.out) || (a.cost - b.cost); // cost per mana made, then cost
  const free = cls.filter(c => !c.tapped && c.out >= c.cost).sort(rank);
  const rocks = cls.filter(c => !c.tapped && c.out < c.cost).sort(rank);
  const sick = cls.filter(c => c.tapped).sort(rank);
  const cnt = new Int32Array(maxCmc + 1), tk = new Int32Array(maxCmc + 1);
  const h = new Int32Array(deck.n);
  const act = { land: 0, r: 0, d: 0, cmd: 0, take: new Int32Array(nSp), x: new Int32Array(nX) };
  let mana = 0;
  const cast = c => { h[c.i]--; mana += (c.tapped ? 0 : c.out) - c.cost; if (c.k === -1) act.r++; else if (c.k === -2) act.d++; else act.x[c.k]++; };
  const rampStep = () => {
    for (const c of rocks) while (h[c.i] > 0 && mana >= c.cost) cast(c);
    for (const c of sick) while (h[c.i] > 0 && mana >= c.cost) cast(c);
  };
  return function policy(s, t) {
    for (const c of cls) h[c.i] = s[H_OFF + c.i];
    act.land = s[H_OFF + M.T_LAND] > 0 ? 1 : 0;
    mana = s[B_LAND] + act.land + s[B_ROCK] + s[B_DORK];
    act.r = 0; act.d = 0; act.cmd = 0; act.x.fill(0);
    for (const c of free) while (h[c.i] > 0 && mana >= c.cost) cast(c);
    if (!s[CMD]) {
      for (;;) {
        const c = rocks.find(q => h[q.i] > 0 && mana >= q.cost && mana - q.cost + q.out >= cmdCost);
        if (!c) break;
        cast(c);
      }
      if (mana >= cmdCost) { mana -= cmdCost; act.cmd = 1; }
    }
    if (t <= RAMP_FIRST_UNTIL) rampStep();
    act.take.fill(0);
    if (mana > 0) {
      cnt.fill(0);
      for (let j = 0; j < nSp; j++) cnt[costs[j]] = s[H_OFF + 3 + j];
      const spent = bestSpend(cnt, maxCmc, mana, tk);
      if (spent > 0) {
        for (let j = 0; j < nSp; j++) act.take[j] = tk[costs[j]];
        mana -= spent;
      }
    }
    if (t > RAMP_FIRST_UNTIL) rampStep();
    return act;
  };
}

module.exports = { makePolicy, makePolicyX, bestSpend, RAMP_FIRST_UNTIL };
