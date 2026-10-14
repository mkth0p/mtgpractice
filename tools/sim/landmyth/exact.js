#!/usr/bin/env node
'use strict';
// Exact (no sampling) solo goldfish model, land myth part 2, phase 1.
//
// Forward dynamic programming over game states: the probability mass of every reachable
// state is pushed turn by turn through exact draws (multivariate hypergeometric, one card at
// a time from the remaining library composition) and through a policy's action. Expected
// per-turn quantities are accumulated, so one solve to Tmax gives every horizon T <= Tmax.
//
// Usage:
//   node exact.js --deck 36:5:5 --shape tight --avg 3 --scenario P1 --T 15 [--cmd 4] [--nomull] [--dist] [--lump [hand]] [--groups 1|2] [--caplands] [--tail k --samples m] [--json] [--progress]
const M = require('./model');
const { StateTable } = require('./statetable');
const { makePolicy } = require('./policy1');

const GAMMAS = [0.9, 0.8, 1.0];

// solve(deck, extra, Tmax, opts) -> per-turn expectations and state-space statistics.
// opts.mulligan (default true), opts.policy (default: part 1 heuristic), opts.dist (track the
// exact distribution of cumulative useful mana: adds it to the state, so costs more states).
function solve(deck, extra, Tmax, opts = {}) {
  const t0 = process.hrtime.bigint();
  const policy = opts.policy || makePolicy(deck);
  const dist = !!opts.dist;
  const W0 = deck.W, W = W0 + (dist ? 2 : 0);
  const { n, K_OFF, H_OFF, B_LAND, B_ROCK, B_DORK, CMD, nSp } = deck;
  const T = Tmax;
  const z = () => new Float64Array(T + 1);
  const pt = {
    useful: z(), gen: z(), ramp: z(), unused: z(), spells: z(), rampCast: z(),
    left: z(), landOnCurve: z(), cmdCast: z(), mass: z(), sources: z(),
    genHist: [], usefulDist: [],
  };
  const counts = { pre: [0], draw: [0], post: [0], secs: [0], bytes: [0] };
  let peakBytes = 0, truncated = 0, tailDone = 0;

  let A = new StateTable(W);
  const s0 = new Uint8Array(W);
  const lump = nSp > 0 && opts.lumpSpells ? (opts.lumpSpells === 'hand' ? 'hand' : 'base') : false;
  const mix = new Float64Array(Math.max(1, nSp));
  // Spell groups for the lumped library: the library keeps one count per group (slot K_OFF+3+g).
  // lumpGroups 1: all spells one group; 2: costs <= deck average vs above.
  const grp = new Int32Array(Math.max(1, nSp)); let G = 1;
  if (lump && (opts.lumpGroups || 1) >= 2 && nSp >= 2) {
    for (let j = 0; j < nSp; j++) grp[j] = deck.costs[j] <= deck.avg ? 0 : 1;
    if (grp.every(x => x === grp[0])) grp.fill(0); else G = 2;
  }
  const SG = new Float64Array(G); for (let j = 0; j < nSp; j++) SG[grp[j]] += deck.K[3 + j];
  for (const o of M.openingStates(deck, opts)) {
    s0.fill(0); s0.set(o.s);
    if (lump) {
      const kg = new Array(G).fill(0);
      for (let j = 0; j < nSp; j++) { kg[grp[j]] += s0[K_OFF + 3 + j]; s0[K_OFF + 3 + j] = 0; }
      for (let g = 0; g < G; g++) s0[K_OFF + 3 + g] = kg[g];
    }
    A.add(s0, o.p);
  }
  const child = new Uint8Array(W), rw = {};

  for (let t = 1; t <= T; t++) {
    counts.pre.push(A.n);
    // ---- draw step(s): one card at a time, exact probabilities k_i / N
    let cur = A, drawStates = 0;
    const nd = M.drawsAt(extra, t);
    for (let j = 0; j < nd; j++) {
      const nxt = new StateTable(W, nextCap(cur.n * 2));
      for (let idx = 0; idx < cur.n; idx++) {
        const s = cur.state(idx), p = cur.mass[idx];
        let N = 0;
        for (let i = 0; i < n; i++) N += s[K_OFF + i];
        if (N === 0) { nxt.add(s, p); continue; }
        if (lump) { // approximation: spell costs drawn from the deck's proportions (see README)
          for (let i = 0; i < n; i++) {
            if (i === 3) i = deck.X0; // non-spell types: land, dork, rock, then any extra ramp classes
            if (i >= n) break;
            const k = s[K_OFF + i];
            if (!k) continue;
            child.set(s); child[K_OFF + i]--; child[H_OFF + i]++;
            nxt.add(child, p * k / N);
          }
          // 'base': within its group a drawn spell's cost follows the deck mix K_c. 'hand': K_c minus
          // the copies in hand minus the group's cast spells shared out in proportion to K_c.
          for (let g = 0; g < G; g++) {
            const kG = s[K_OFF + 3 + g];
            if (!kG) continue;
            let tot = 0;
            if (lump === 'hand') {
              let hG = 0; for (let j = 0; j < nSp; j++) if (grp[j] === g) hG += s[H_OFF + 3 + j];
              const castG = Math.max(0, SG[g] - kG - hG);
              for (let j = 0; j < nSp; j++) { mix[j] = grp[j] !== g ? 0 : Math.max(0, deck.K[3 + j] - s[H_OFF + 3 + j] - castG * deck.K[3 + j] / SG[g]); tot += mix[j]; }
              if (tot <= 0) { tot = 0; for (let j = 0; j < nSp; j++) { mix[j] = grp[j] === g ? deck.K[3 + j] : 0; tot += mix[j]; } }
            } else { for (let j = 0; j < nSp; j++) { mix[j] = grp[j] === g ? deck.K[3 + j] : 0; tot += mix[j]; } }
            for (let j = 0; j < nSp; j++) {
              if (!mix[j]) continue;
              child.set(s); child[K_OFF + 3 + g]--; child[H_OFF + 3 + j]++;
              nxt.add(child, p * kG / N * mix[j] / tot);
            }
          }
          continue;
        }
        for (let i = 0; i < n; i++) {
          const k = s[K_OFF + i];
          if (!k) continue;
          child.set(s); child[K_OFF + i]--; child[H_OFF + i]++;
          nxt.add(child, p * k / N);
        }
      }
      peakBytes = Math.max(peakBytes, cur.bytes() + nxt.bytes());
      cur = nxt;
      if (j < nd - 1) drawStates += cur.n;
    }
    A = null;
    counts.draw.push(drawStates);
    counts.post.push(cur.n);
    // ---- decision: apply the policy once per post-draw state
    const B = new StateTable(W, nextCap(cur.n));
    const gh = new Float64Array(64);
    for (let idx = 0; idx < cur.n; idx++) {
      const s = cur.state(idx), p = cur.mass[idx];
      const a = policy(s.subarray(0, W0), t);
      M.applyAction(deck, s, a, child, rw);
      // exact reduction: lands in hand beyond the land drops left before Tmax never matter
      if (opts.capHandLands && child[H_OFF] > T - t) child[H_OFF] = T - t;
      if (dist) { const u = s[W0] + 256 * s[W0 + 1] + rw.useful; child[W0] = u & 255; child[W0 + 1] = u >> 8; }
      pt.useful[t] += p * rw.useful; pt.gen[t] += p * rw.gen; pt.ramp[t] += p * rw.ramp;
      pt.unused[t] += p * rw.unused; pt.spells[t] += p * rw.spells; pt.rampCast[t] += p * rw.rampCast;
      gh[Math.min(63, rw.gen)] += p;
      B.add(child, p);
    }
    pt.genHist[t] = trim(gh);
    peakBytes = Math.max(peakBytes, cur.bytes() + B.bytes());
    // ---- end-of-turn quantities, read from the state
    const ud = dist ? new Float64Array(512) : null;
    for (let idx = 0; idx < B.n; idx++) {
      const s = B.state(idx), p = B.mass[idx];
      pt.mass[t] += p;
      if (s[B_LAND] === t) pt.landOnCurve[t] += p;
      if (s[CMD]) pt.cmdCast[t] += p;
      let left = 0; for (let j = 0; j < nSp; j++) left += s[H_OFF + 3 + j];
      pt.left[t] += p * left;
      pt.sources[t] += p * (s[B_LAND] + s[B_ROCK] + s[B_DORK]);
      if (dist) ud[s[W0] + 256 * s[W0 + 1]] += p;
    }
    if (dist) pt.usefulDist[t] = trim(ud);
    A = B;
    counts.secs.push(Number(process.hrtime.bigint() - t0) / 1e9);
    counts.bytes.push(peakBytes);
    if (opts.progress) process.stderr.write(`t=${t} pre ${counts.pre[t]} post ${counts.post[t]} next ${B.n} ${(Number(process.hrtime.bigint() - t0) / 1e9).toFixed(1)}s\n`);
    if (opts.maxStates && B.n > opts.maxStates) { truncated = t; break; }
    if (opts.tailFrom && t === opts.tailFrom && t < T) { sampleTail(deck, extra, T, t, A, policy, pt, opts); A = new StateTable(W); tailDone = t; break; }
  }
  counts.pre.push(A.n); // states after the last turn
  const seconds = Number(process.hrtime.bigint() - t0) / 1e9;
  return { deck, extra, T, pt, counts, seconds, peakBytes, dist, truncated, tailDone };
}

// Hybrid (approximation): from the end of turn k, instead of enumerating, play m sampled
// continuations from EVERY state (stratified: each state's mass split over its own samples).
// Common random numbers: the sample stream of a state depends only on its key and the seed.
function sampleTail(deck, extra, T, k, A, policy, pt, opts) {
  const m = opts.tailSamples || 1, seed = opts.tailSeed || 1;
  const { n, W, K_OFF, H_OFF, B_LAND, CMD, nSp } = deck;
  const s = new Uint8Array(A.W), nx = new Uint8Array(A.W), rw = {};
  for (let idx = 0; idx < A.n; idx++) {
    const p0 = A.mass[idx] / m;
    let a = (A.hash(A.data, idx * A.W) ^ seed) >>> 0;
    const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    for (let r = 0; r < m; r++) {
      s.set(A.state(idx));
      for (let t = k + 1; t <= T; t++) {
        for (let j = 0; j < M.drawsAt(extra, t); j++) {
          let N = 0; for (let i = 0; i < n; i++) N += s[K_OFF + i];
          if (!N) break;
          let x = rnd() * N, i = 0;
          while (x >= s[K_OFF + i] || !s[K_OFF + i]) { x -= s[K_OFF + i]; i++; }
          s[K_OFF + i]--; s[H_OFF + i]++;
        }
        M.applyAction(deck, s, policy(s.subarray(0, W), t), nx, rw); s.set(nx);
        pt.useful[t] += p0 * rw.useful; pt.gen[t] += p0 * rw.gen; pt.ramp[t] += p0 * rw.ramp;
        pt.unused[t] += p0 * rw.unused; pt.spells[t] += p0 * rw.spells; pt.rampCast[t] += p0 * rw.rampCast;
        pt.mass[t] += p0;
        if (s[B_LAND] === t) pt.landOnCurve[t] += p0;
        if (s[CMD]) pt.cmdCast[t] += p0;
        let left = 0; for (let j = 0; j < nSp; j++) left += s[H_OFF + 3 + j];
        pt.left[t] += p0 * left;
      }
    }
  }
}

function nextCap(n) { let c = 1 << 12; while (c < n * 2) c <<= 1; return c; }
function trim(a) { let k = a.length; while (k > 1 && a[k - 1] === 0) k--; return Array.from(a.subarray(0, k)); }

// Lower-tail CVaR: mean of the worst fraction q of games, from an exact distribution.
function cvar(distArr, q = 0.1) {
  let need = q, acc = 0;
  for (let v = 0; v < distArr.length && need > 1e-15; v++) {
    const take = Math.min(need, distArr[v]); acc += take * v; need -= take;
  }
  return acc / q;
}

// Per-horizon summary for every T in 1..Tmax.
function summarize(sol) {
  const { pt, T } = sol;
  const out = [];
  let cum = { useful: 0, gen: 0, ramp: 0, unused: 0, spells: 0, rampCast: 0 };
  const V = GAMMAS.map(() => 0), NV = GAMMAS.map(() => 0);
  let cmdTurn = 1;
  for (let t = 1; t <= T; t++) {
    for (const k in cum) cum[k] += pt[k][t];
    GAMMAS.forEach((g, i) => { V[i] += Math.pow(g, t - 1) * pt.useful[t]; NV[i] += Math.pow(g, t - 1) * pt.spells[t]; });
    cmdTurn += 1 - pt.cmdCast[t];
    const r = {
      T: t,
      V09: V[0], V08: V[1], V10: V[2],
      // N: useful spells cast (non-ramp spells + commander), raw and discounted per spell
      N: cum.spells, N09: NV[0], N08: NV[1],
      useful: cum.useful, gen: cum.gen, ramp: cum.ramp, unused: cum.unused,
      spells: cum.spells, rampCast: cum.rampCast, left: pt.left[t],
      cmdTurn, pCmdByT: pt.cmdCast[t],
      landMiss: [], mass: pt.mass[t],
    };
    for (let u = 1; u <= Math.min(t, 6); u++) r.landMiss.push(1 - pt.landOnCurve[u]);
    if (sol.dist) {
      const d = pt.usefulDist[t]; let m = 0, m2 = 0;
      d.forEach((p, v) => { m += p * v; m2 += p * v * v; });
      r.usefulSd = Math.sqrt(Math.max(0, m2 - m * m)); r.cvar10 = cvar(d, 0.1);
    }
    out.push(r);
  }
  return out;
}

// ramp (optional): extra ramp classes, see model.js makeDeck (real-ramp variant).
function buildDeck(spec, shape, avg, cmdCost = M.CMD_COST, ramp = null) {
  const [L, D, R] = spec.split(':').map(Number);
  const S = M.DECK_SIZE - L - D - R - (ramp ? ramp.reduce((x, c) => x + c.count, 0) : 0);
  const c = M.spellCounts(shape, S, avg);
  if (!c) return null;
  return M.makeDeck(L, D, R, c, cmdCost, ramp);
}

module.exports = { solve, summarize, cvar, buildDeck, GAMMAS };

if (require.main === module) {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  const deck = buildDeck(a.deck || '36:5:5', a.shape || 'tight', +(a.avg || 3), +(a.cmd || 4));
  if (!deck) { console.error('infeasible curve'); process.exit(1); }
  const sc = a.scenario || 'P1';
  const sol = solve(deck, M.SCENARIOS[sc], +(a.T || 10), { mulligan: !a.nomull, dist: !!a.dist, progress: !!a.progress, lumpSpells: a.lump === 'hand' ? 'hand' : !!a.lump, capHandLands: !!a.caplands, lumpGroups: +(a.groups || 1), tailFrom: +(a.tail || 0), tailSamples: +(a.samples || 1), maxStates: +(a.maxStates || 0) });
  const sum = summarize(sol);
  if (a.json) { console.log(JSON.stringify({ deck: { L: deck.L, D: deck.D, R: deck.R, costCounts: deck.costCounts, avg: deck.avg }, scenario: sc, summary: sum, counts: sol.counts, seconds: sol.seconds })); }
  else {
    console.log(`deck ${deck.L}:${deck.D}:${deck.R} commander ${deck.cmdCost} spells ${JSON.stringify(deck.costCounts.slice(1))} (avg ${deck.avg.toFixed(3)}) ${sc}`);
    console.log('T   V0.9     V0.8     V1.0     N0.9    N       gen      unused   left   cmdTurn  landMiss(1..6)' + (sol.dist ? '  sd  CVaR10' : ''));
    for (const r of sum) console.log(`${String(r.T).padEnd(3)} ${r.V09.toFixed(4).padStart(8)} ${r.V08.toFixed(4).padStart(8)} ${r.V10.toFixed(4).padStart(8)} ${r.N09.toFixed(3).padStart(7)} ${r.N.toFixed(3).padStart(7)} ${r.gen.toFixed(3).padStart(8)} ${r.unused.toFixed(3).padStart(8)} ${r.left.toFixed(3).padStart(6)} ${r.cmdTurn.toFixed(3).padStart(7)}  ${r.landMiss.map(x => x.toFixed(4)).join(' ')}` + (sol.dist ? `  ${r.usefulSd.toFixed(2)} ${r.cvar10.toFixed(3)}` : ''));
    console.log(`states pre-draw per turn ${sol.counts.pre.slice(1).join(',')}`);
    console.log(`states post-draw per turn ${sol.counts.post.slice(1).join(',')}`);
    console.log(`time ${sol.seconds.toFixed(2)}s peak table bytes ${(sol.peakBytes / 1e6).toFixed(1)}MB rss ${(process.memoryUsage().rss / 1e6).toFixed(0)}MB`);
  }
}
