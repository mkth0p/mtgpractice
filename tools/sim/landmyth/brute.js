'use strict';
// Independent reference for gate b of phase 2: expectimax over the full game tree.
// Shares NO code with model.js / opt.js. Different formulation on purpose:
//   - the turn is played card by card: every order of plays is enumerated (land drop optional and at
//     any point, rocks tap for mana at once, dorks only from the next turn, commander once), not the
//     "maximal action set" of opt.js, so it also checks opt.js's dominance reductions;
//   - mulligans: every 7-card composition, every bottom choice, optimal keep/mulligan by recursion
//     over the mulligan stage (stage 0 and 1 keep 7, stage m >= 2 keeps 8 - m; the last is forced).
// Draws are enumerated by card type with probability count / library size (exchangeability), and a
// memo on (turn, full state) keeps it tractable for short horizons; nothing else is shared or cached.
// Returns the optimal expected objective (no tie-break; values only).

function lfact(n) { let r = 0; for (let i = 2; i <= n; i++) r += Math.log(i); return r; }
const LF = []; for (let i = 0; i <= 100; i++) LF.push(lfact(i));
const lC = (n, k) => (k < 0 || k > n ? -Infinity : LF[n] - LF[k] - LF[n - k]);

// deck: {lands, dorks, rocks, spells: [[cost, count], ...], cmd} (99 cards); extra: draws added on turns 5..8
// obj: {gamma, kind: 'mana'|'spells'}; depth: mulligans allowed
function bruteValue(deck, extra, T, obj, depth) {
  const types = [{ k: 'land' }, { k: 'dork' }, { k: 'rock' }, ...deck.spells.map(([c]) => ({ k: 'spell', c }))];
  const counts = [deck.lands, deck.dorks, deck.rocks, ...deck.spells.map(([, n]) => n)];
  const total = counts.reduce((a, b) => a + b, 0);
  if (total !== 99) throw new Error('deck must have 99 cards');
  const nT = types.length;
  const draws = t => 1 + (t >= 5 && t <= 8 ? extra[t - 5] : 0);
  const memo = new Map();

  // all distinct end-of-turn results reachable by any sequence of plays
  function turnResults(hand, lands, rocks, dorks, cmdCast) {
    const res = new Map();
    const h = hand.slice();
    function dfs(avail, landPlayed, nl, nr, nd, cmd, useful, spells) {
      const key = h.join(',') + '|' + nl + ',' + nr + ',' + nd + ',' + cmd;
      const prev = res.get(key);
      // same end state always has the same rewards (rewards are a function of what left the hand),
      // but the remaining mana may differ: explore every path anyway (memo per avail too)
      const k2 = key + '|' + avail + '|' + landPlayed;
      if (seen.has(k2)) return; seen.add(k2);
      if (!prev) res.set(key, { hand: h.slice(), nl, nr, nd, cmd, useful, spells });
      else if (prev.useful !== useful || prev.spells !== spells) throw new Error('inconsistent rewards');
      // play a land
      if (!landPlayed && h[0] > 0) { h[0]--; dfs(avail + 1, true, nl + 1, nr, nd, cmd, useful, spells); h[0]++; }
      // dork: cost 1, taps from next turn
      if (h[1] > 0 && avail >= 1) { h[1]--; dfs(avail - 1, landPlayed, nl, nr, nd + 1, cmd, useful, spells); h[1]++; }
      // rock: cost 2, taps at once
      if (h[2] > 0 && avail >= 2) { h[2]--; dfs(avail - 1, landPlayed, nl, nr + 1, nd, cmd, useful, spells); h[2]++; }
      if (!cmd && avail >= deck.cmd) dfs(avail - deck.cmd, landPlayed, nl, nr, nd, true, useful + deck.cmd, spells + 1);
      for (let i = 3; i < nT; i++) if (h[i] > 0 && avail >= types[i].c) { h[i]--; dfs(avail - types[i].c, landPlayed, nl, nr, nd, cmd, useful + types[i].c, spells + 1); h[i]++; }
    }
    const seen = new Set();
    dfs(lands + rocks + dorks, false, lands, rocks, dorks, cmdCast, 0, 0);
    return [...res.values()];
  }

  // value of the game from the start of turn t (before the draw)
  function value(t, lib, hand, lands, rocks, dorks, cmd) {
    if (t > T) return 0;
    const key = t + ':' + lib.join(',') + '/' + hand.join(',') + '/' + lands + ',' + rocks + ',' + dorks + ',' + (cmd ? 1 : 0);
    const m = memo.get(key); if (m !== undefined) return m;
    // draw draws(t) cards one at a time, then decide
    let v = 0;
    const nd = draws(t);
    (function drawRec(j, p, lb, hd) {
      if (j === nd) {
        let best = -Infinity;
        const w = Math.pow(obj.gamma, t - 1);
        for (const r of turnResults(hd, lands, rocks, dorks, cmd)) {
          const rew = w * (obj.kind === 'mana' ? r.useful : r.spells);
          const x = rew + value(t + 1, lb, r.hand, r.nl, r.nr, r.nd, r.cmd);
          if (x > best) best = x;
        }
        v += p * best; return;
      }
      const N = lb.reduce((a, b) => a + b, 0);
      for (let i = 0; i < nT; i++) if (lb[i] > 0) {
        const l2 = lb.slice(), h2 = hd.slice(); const q = l2[i] / N; l2[i]--; h2[i]++;
        drawRec(j + 1, p * q, l2, h2);
      }
    })(0, 1, lib, hand);
    memo.set(key, v);
    return v;
  }

  // opening hands
  const hands = [];
  (function rec(i, left, x, lp) {
    if (i === nT - 1) { if (left > counts[i]) return; x[i] = left; hands.push({ x: x.slice(), p: Math.exp(lp + lC(counts[i], left) - lC(99, 7)) }); return; }
    for (let v = 0; v <= Math.min(left, counts[i]); v++) { x[i] = v; rec(i + 1, left - v, x, lp + lC(counts[i], v)); }
  })(0, 7, new Array(nT).fill(0), 0);
  function keepValue(x, b) {
    let best = -Infinity;
    const lib = counts.map((c, i) => c - x[i]);
    (function rec(i, left, hand) {
      if (i === nT) { if (left === 0) best = Math.max(best, value(1, lib, hand, 0, 0, 0, false)); return; }
      for (let v = 0; v <= Math.min(left, x[i]); v++) { hand[i] = x[i] - v; rec(i + 1, left - v, hand); }
      hand[i] = x[i];
    })(0, b, x.slice());
    return best;
  }
  const bOf = m => (m === 0 ? 0 : m - 1);
  const kv = []; for (let b = 0; b <= Math.max(0, depth - 1); b++) kv.push(hands.map(h => keepValue(h.x, b)));
  let U = hands.reduce((a, h, i) => a + h.p * kv[bOf(depth)][i], 0);
  for (let m = depth - 1; m >= 0; m--) U = hands.reduce((a, h, i) => a + h.p * Math.max(kv[bOf(m)][i], U), 0);
  return { value: U, memo: memo.size };
}

module.exports = { bruteValue };
