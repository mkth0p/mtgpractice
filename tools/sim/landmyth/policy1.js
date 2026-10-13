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

module.exports = { makePolicy, bestSpend, RAMP_FIRST_UNTIL };
