#!/usr/bin/env node
'use strict';
// Land myth part 2, phase 2: optimal play and optimal mulligans by backward induction (Bellman),
// on deck-independent ("shared") game graphs.
//
// The graph. As in grid.js, states are written in "cards seen" coordinates (library count =
// universal maximum - copies seen), so the graph does not depend on how many lands, dorks, rocks
// or spells of each cost the deck has; only the draw probabilities do. One graph is built per
// (spell cost set, commander cost, scenario, library model) and holds, turn by turn:
//   - every opening state: each 7-card composition with 0..depth-1 cards bottomed (London);
//   - draw steps: one card at a time, an edge to the child for each card type;
//   - decision steps: an edge for EVERY non-dominated legal action (model.enumerateActions with
//     maximalOnly: the land drop is always taken, and an action is listed only when no further card
//     in hand fits; adding a castable card never hurts in the solo goldfish, see README), with the
//     action's useful mana, useful spells, ramp mana and ramp cards.
// Library models: exact (one library count per card type; tight curves and the exact reference for
// normal3) and lump-hand-g2 (normal3: one library count per cost group, costs drawn inside a group
// in proportion to what is plausibly left; the same approximation as grid.js / exact.js).
//
// Per deck and per horizon H (3..15; the game ends at H and the player knows it), backward
// induction gives the optimal value of every state, the optimal action (lexicographic: primary
// objective, ties within 1e-12 relative broken by a secondary objective, then by enumeration order),
// then optimal stopping for the mulligan (keep iff value(keep, best bottom) >= value(mulligan)),
// then a forward pass under that policy gives every reported quantity. Decks are processed in
// batches of K sharing the graph (values interleaved per state, so one edge read serves K decks).
//
// Objectives (prim = the one maximised; sec = tie-break):
//   V09: useful mana discounted 0.9 (PREREG primary), tie-break N
//   N:   useful spells cast, raw (PREREG co-primary), tie-break V09
//   V08, V10: discount sensitivity (0.8; 1.0 = undiscounted useful mana), tie-break N
//
// The part 1 heuristic baseline is computed with phase 1's own code (grid.js graph + sweep), not on
// this graph: part 1's action is not always maximal (from turn 7 it casts spells first and then
// cannot pay for a rock it could have cast first with one spare mana), so it is not always an edge here.
//
// CLI: node opt.js --deck 36:5:5 --shape tight --avg 3 --scenario P1 --T 10 [--cmd 4] [--depth 4] [--lump] [--obj V09,N]
const M = require('./model');
const E = require('./exact');
const Gd = require('./grid');

const OBJECTIVES = {
  V09: { prim: 0, gp: 0.9, sec: 1, gs: 1.0 },
  N: { prim: 1, gp: 1.0, sec: 0, gs: 0.9 },
  V08: { prim: 0, gp: 0.8, sec: 1, gs: 1.0 },
  V10: { prim: 0, gp: 1.0, sec: 1, gs: 1.0 },
}; // reward kind 0 = useful mana, 1 = useful spells
const REL_TOL = 1e-12;
const DEFAULT_DEPTH = 4; // mulligans allowed: 7, 7 (free), 6, 5, then 4 cards always kept (see README)

// ---------- compact key set (states -> dense index), no per-state objects ----------
class KeySet {
  constructor(W, cap = 1 << 12) {
    this.W = W; this.n = 0; this.cap = cap; this.mask = cap - 1;
    this.slots = new Int32Array(cap).fill(-1); this.dcap = cap >> 1;
    this.data = new Uint8Array(this.dcap * W);
  }
  hash(buf, off) {
    let h = 0x811c9dc5 | 0;
    for (let i = 0; i < this.W; i++) { h ^= buf[off + i]; h = Math.imul(h, 0x01000193); }
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12;
    return h >>> 0;
  }
  find(s) {
    const W = this.W, data = this.data; let h = this.hash(s, 0) & this.mask;
    for (;;) {
      const idx = this.slots[h]; if (idx < 0) return -1;
      const o = idx * W; let eq = true;
      for (let i = 0; i < W; i++) if (data[o + i] !== s[i]) { eq = false; break; }
      if (eq) return idx; h = (h + 1) & this.mask;
    }
  }
  add(s) {
    const W = this.W; let h = this.hash(s, 0) & this.mask;
    for (;;) {
      const idx = this.slots[h]; if (idx < 0) break;
      const o = idx * W; let eq = true;
      for (let i = 0; i < W; i++) if (this.data[o + i] !== s[i]) { eq = false; break; }
      if (eq) return idx; h = (h + 1) & this.mask;
    }
    if (this.n >= this.dcap) { this.grow(); return this.add(s); }
    const idx = this.n++; this.data.set(s, idx * W); this.slots[h] = idx; return idx;
  }
  grow() {
    const W = this.W; this.cap *= 2; this.mask = this.cap - 1;
    this.slots = new Int32Array(this.cap).fill(-1); this.dcap = this.cap >> 1;
    const d = new Uint8Array(this.dcap * W); d.set(this.data.subarray(0, this.n * W)); this.data = d;
    for (let idx = 0; idx < this.n; idx++) { let h = this.hash(d, idx * W) & this.mask; while (this.slots[h] >= 0) h = (h + 1) & this.mask; this.slots[h] = idx; }
  }
  state(idx) { return this.data.subarray(idx * this.W, (idx + 1) * this.W); }
  bytes() { return this.slots.byteLength + this.data.byteLength; }
}
function capFor(n) { let c = 1 << 12; while (c < n * 2) c *= 2; return c; }

// growable typed arrays for edge lists
// typed arrays, optionally on a SharedArrayBuffer (so several solver threads can share one graph)
function alloc(Ctor, n, shared) { return shared ? new Ctor(new SharedArrayBuffer(Math.max(1, n) * Ctor.BYTES_PER_ELEMENT)) : new Ctor(n); }
function finish(a, n, shared) { const b = alloc(a.constructor, n, shared); b.set(a.subarray(0, n)); return b; }
class GrowI32 { constructor(n) { this.a = new Int32Array(Math.max(16, n)); this.n = 0; } push(v) { if (this.n === this.a.length) { const b = new Int32Array(Math.ceil(this.a.length * 1.5)); b.set(this.a); this.a = b; } this.a[this.n++] = v; } done(sh) { const r = finish(this.a, this.n, sh); this.a = null; return r; } }
class GrowU8 { constructor(n) { this.a = new Uint8Array(Math.max(16, n)); this.n = 0; } push(v) { if (this.n === this.a.length) { const b = new Uint8Array(Math.ceil(this.a.length * 1.5)); b.set(this.a); this.a = b; } this.a[this.n++] = v; } done(sh) { const r = finish(this.a, this.n, sh); this.a = null; return r; } }

// all compositions of `total` cards over n types
function compositions(n, total) {
  const out = [], x = new Uint8Array(n);
  (function rec(i, left) { if (i === n - 1) { x[i] = left; out.push(x.slice()); return; } for (let v = 0; v <= left; v++) { x[i] = v; rec(i + 1, left - v); } })(0, total);
  return out;
}
// all sub-multisets of x with exactly b cards
function subMultisets(x, b) {
  const out = [], y = new Uint8Array(x.length);
  (function rec(i, left) { if (i === x.length - 1) { if (left <= x[i]) { y[i] = left; out.push(y.slice()); } return; } for (let v = 0; v <= Math.min(left, x[i]); v++) { y[i] = v; rec(i + 1, left - v); } })(0, b);
  return out;
}

// ---------- graph ----------
// univ: grid.universalDeck(costs, cmd, lumpGrp|null). depth: mulligans allowed (hands 7,7,6,..., 8-depth).
function buildOptGraph(univ, extra, T, depth = DEFAULT_DEPTH, opts = {}) {
  const t0 = Date.now();
  const { n, W, K_OFF, H_OFF, B_LAND, B_ROCK, B_DORK, CMD, nSp, cost, cmdCost } = univ;
  const lump = !!univ.grp, NG = lump ? univ.G : 0;
  const nLib = lump ? 3 + NG : n;
  const infoW = nLib + (lump ? nSp : 0);
  const progress = opts.progress || null, sh = !!opts.shared;
  // opening states
  let A = new KeySet(W);
  const comps = compositions(n, 7);
  const open = { n, comps, byB: [] };
  const s0 = new Uint8Array(W);
  for (let b = 0; b < depth; b++) {
    const start = new Int32Array(comps.length + 1), st = [];
    comps.forEach((x, ci) => {
      start[ci] = st.length;
      // a composition with more copies of a type than the universal maximum (ramp-class graphs) has no state
      let fits = true; for (let i = 0; i < 3; i++) if (x[i] > univ.K[i]) fits = false;
      if (lump) { const seen = new Array(NG).fill(0); for (let j = 0; j < nSp; j++) seen[univ.grp[j]] += x[3 + j]; for (let gg = 0; gg < NG; gg++) if (seen[gg] > univ.UG[gg]) fits = false; }
      else for (let i = 3; i < n; i++) if (x[i] > univ.K[i]) fits = false;
      if (!fits) return;
      for (const B of subMultisets(x, b)) {
        s0.fill(0);
        for (let i = 0; i < 3; i++) s0[K_OFF + i] = univ.K[i] - x[i];
        if (lump) { const seen = new Array(NG).fill(0); for (let j = 0; j < nSp; j++) seen[univ.grp[j]] += x[3 + j]; for (let g = 0; g < NG; g++) s0[K_OFF + 3 + g] = univ.UG[g] - seen[g]; }
        else for (let i = 3; i < n; i++) s0[K_OFF + i] = univ.K[i] - x[i];
        for (let i = 0; i < n; i++) s0[H_OFF + i] = x[i] - B[i];
        st.push(A.add(s0));
      }
    });
    start[comps.length] = st.length;
    open.byB.push({ start, st: Int32Array.from(st) });
  }
  const g = { univ, extra, T, depth, lump, n, nLib, infoW, open, steps: [], actStep: [], nOpen: A.n, states: 0, edges: 0, maxLayer: A.n, maxActs: 0, bytes: 0 };
  const child = new Uint8Array(W);
  const take = new Int32Array(Math.max(1, nSp));
  let N = M.DECK_SIZE - 7;
  for (let t = 1; t <= T; t++) {
    let cur = A;
    for (let j = 0; j < M.drawsAt(extra, t); j++) {
      const nxt = new KeySet(W, capFor(cur.n * 1.5));
      const ch = alloc(Int32Array, cur.n * n, sh).fill(-1), info = alloc(Uint8Array, cur.n * infoW, sh);
      let e = 0;
      for (let idx = 0; idx < cur.n; idx++) {
        const s = cur.state(idx), ib = idx * infoW, cb = idx * n;
        for (let q = 0; q < nLib; q++) info[ib + q] = s[K_OFF + q];
        if (lump) for (let q = 0; q < nSp; q++) info[ib + nLib + q] = s[H_OFF + 3 + q];
        for (let i = 0; i < n; i++) {
          const li = lump && i >= 3 ? 3 + univ.grp[i - 3] : i;
          if (!s[K_OFF + li]) continue;
          child.set(s); child[K_OFF + li]--; child[H_OFF + i]++;
          ch[cb + i] = nxt.add(child); e++;
        }
      }
      g.steps.push({ kind: 'draw', t, nFrom: cur.n, nTo: nxt.n, N, ch, info });
      g.states += cur.n; g.edges += e; g.bytes += ch.byteLength + info.byteLength;
      g.maxLayer = Math.max(g.maxLayer, nxt.n);
      N--; cur = nxt;
      if (progress) progress({ t, stage: 'draw', states: g.states, layer: cur.n, secs: (Date.now() - t0) / 1000 });
      if (opts.maxStates && g.states + cur.n > opts.maxStates) { g.truncated = t; g.buildSecs = (Date.now() - t0) / 1000; return g; }
    }
    // decision step: every maximal action
    const X = cur, nX = X.n;
    const B = new KeySet(W, capFor(nX));
    const off = alloc(Int32Array, nX + 1, sh), m0 = alloc(Uint8Array, nX, sh), xi = alloc(Uint8Array, nX * nLib, sh);
    const ech = new GrowI32(nX * 2), eus = new GrowU8(nX * 2), esp = new GrowU8(nX * 2), era = new GrowU8(nX * 2), erc = new GrowU8(nX * 2);
    let s, land, mana0, hR, hD, r, d, cmd, cmdDone;
    const emit = () => {
      child.set(s);
      if (land) { child[H_OFF]--; child[B_LAND]++; }
      child[H_OFF + 2] -= r; child[B_ROCK] += r; child[H_OFF + 1] -= d; child[B_DORK] += d;
      let us = 0, sp = 0;
      if (cmd) { child[CMD] = 1; us = cmdCost; sp = 1; }
      for (let q = 0; q < nSp; q++) if (take[q]) { child[H_OFF + 3 + q] -= take[q]; us += take[q] * cost[3 + q]; sp += take[q]; }
      ech.push(B.add(child)); eus.push(us); esp.push(sp); era.push(2 * r + d); erc.push(r + d);
    };
    const rec = (q, b) => {
      if (q === nSp) {
        if (r < hR && b >= 1 && mana0 >= r + 2) return;
        if (d < hD && b >= 1) return;
        if (!cmdDone && !cmd && b >= cmdCost) return;
        for (let i = 0; i < nSp; i++) if (take[i] < s[H_OFF + 3 + i] && b >= cost[3 + i]) return;
        emit(); return;
      }
      const c = cost[3 + q], mx = Math.min(s[H_OFF + 3 + q], Math.floor(b / c));
      for (let x = 0; x <= mx; x++) { take[q] = x; rec(q + 1, b - x * c); }
      take[q] = 0;
    };
    for (let idx = 0; idx < nX; idx++) {
      s = X.state(idx); off[idx] = ech.n;
      land = s[H_OFF] > 0 ? 1 : 0; mana0 = s[B_LAND] + land + s[B_ROCK] + s[B_DORK];
      hR = s[H_OFF + 2]; hD = s[H_OFF + 1]; cmdDone = s[CMD];
      m0[idx] = mana0;
      for (let q = 0; q < nLib; q++) xi[idx * nLib + q] = s[K_OFF + q];
      for (r = 0; r <= hR; r++) {
        if (r > 0 && mana0 < r + 1) break;
        const budgetR = mana0 - r;
        for (d = 0; d <= hD && d <= budgetR; d++) for (cmd = 0; cmd <= (cmdDone ? 0 : 1); cmd++) {
          const b0 = budgetR - d - cmd * cmdCost; if (b0 < 0) continue;
          rec(0, b0);
        }
      }
      const na = ech.n - off[idx];
      if (na > g.maxActs) g.maxActs = na;
    }
    off[nX] = ech.n;
    const fl = alloc(Uint8Array, B.n, sh), lf = alloc(Uint8Array, B.n, sh);
    for (let idx = 0; idx < B.n; idx++) {
      const q = B.state(idx); fl[idx] = (q[B_LAND] === t ? 1 : 0) | (q[CMD] ? 2 : 0);
      let left = 0; for (let j = 0; j < nSp; j++) left += q[H_OFF + 3 + j]; lf[idx] = left;
    }
    const st = { kind: 'act', t, nFrom: nX, nTo: B.n, off, m0, xi, ch: ech.done(sh), us: eus.done(sh), sp: esp.done(sh), ra: era.done(sh), rc: erc.done(sh), fl, lf };
    g.steps.push(st); g.actStep[t] = g.steps.length - 1;
    g.states += nX; g.edges += st.ch.length; g.maxLayer = Math.max(g.maxLayer, B.n);
    g.bytes += off.byteLength + m0.byteLength + xi.byteLength + st.ch.byteLength + 4 * st.us.byteLength + fl.byteLength + lf.byteLength;
    A = B;
    if (progress) progress({ t, stage: 'act', states: g.states, layer: B.n, secs: (Date.now() - t0) / 1000 });
    if (opts.maxStates && g.states + B.n > opts.maxStates) { g.truncated = t; g.buildSecs = (Date.now() - t0) / 1000; return g; }
  }
  g.nFinal = A.n; g.states += A.n;
  g.sumX = 0; for (const st of g.steps) if (st.kind === 'act') g.sumX += st.nFrom;
  g.buildSecs = (Date.now() - t0) / 1000;
  return g;
}

// ---------- per-deck data ----------
function binom(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
function prepDeck(g, deck) {
  const u = g.univ;
  if (deck.costs.join() !== u.costs.join()) throw new Error(`deck costs ${deck.costs} do not match graph ${u.costs}`);
  const off = new Int32Array(g.nLib); // remaining in library = off + universal library byte
  for (let i = 0; i < 3; i++) off[i] = deck.K[i] - u.K[i];
  let SG = null, Kj = null;
  if (g.lump) {
    SG = new Float64Array(u.G); Kj = new Float64Array(u.nSp);
    for (let j = 0; j < u.nSp; j++) { Kj[j] = deck.K[3 + j]; SG[u.grp[j]] += deck.K[3 + j]; }
    for (let gg = 0; gg < u.G; gg++) off[3 + gg] = SG[gg] - u.UG[gg];
  } else for (let i = 3; i < g.n; i++) off[i] = deck.K[i] - u.K[i];
  // opening hand probabilities (exact multivariate hypergeometric over the deck's types)
  const tot = binom(M.DECK_SIZE, 7), pc = new Float64Array(g.open.comps.length);
  g.open.comps.forEach((x, ci) => { let p = 1; for (let i = 0; i < g.n; i++) p *= binom(deck.K[i], x[i]); pc[ci] = p / tot; });
  return { deck, off, SG, Kj, pc };
}

// Fill pr[k*n + i] with deck k's probability of drawing type i from the draw-step state idx
// (0 when the state is unreachable for that deck). Returns nothing; reach[k] = 0/1.
function drawProbs(g, st, idx, P, K, pr, reach) {
  const n = g.n, nLib = g.nLib, info = st.info, ib = idx * g.infoW, invN = 1 / st.N;
  const u = g.univ;
  for (let k = 0; k < K; k++) {
    const d = P[k], o = d.off, base = k * n;
    let ok = 1;
    for (let q = 0; q < nLib; q++) if (o[q] + info[ib + q] < 0) { ok = 0; break; }
    reach[k] = ok;
    if (!ok) continue;
    for (let i = 0; i < 3; i++) pr[base + i] = (o[i] + info[ib + i]) * invN;
    if (!g.lump) { for (let i = 3; i < n; i++) pr[base + i] = (o[i] + info[ib + i]) * invN; continue; }
    // lump-hand-g2 (as exact.js lumpSpells 'hand', lumpGroups 2, and grid.js sweep)
    for (let gg = 0; gg < u.G; gg++) {
      const remG = o[3 + gg] + info[ib + 3 + gg];
      const seenG = u.UG[gg] - info[ib + 3 + gg];
      let hG = 0; for (let j = 0; j < u.nSp; j++) if (u.grp[j] === gg) hG += info[ib + nLib + j];
      const castG = Math.max(0, seenG - hG);
      let tot = 0;
      for (let j = 0; j < u.nSp; j++) if (u.grp[j] === gg) { const m = Math.max(0, d.Kj[j] - info[ib + nLib + j] - castG * d.Kj[j] / d.SG[gg]); pr[base + 3 + j] = m; tot += m; }
      if (tot <= 0) { tot = 0; for (let j = 0; j < u.nSp; j++) if (u.grp[j] === gg) { pr[base + 3 + j] = d.Kj[j]; tot += d.Kj[j]; } }
      const f = remG > 0 && tot > 0 ? remG * invN / tot : 0;
      for (let j = 0; j < u.nSp; j++) if (u.grp[j] === gg) pr[base + 3 + j] *= f;
    }
  }
}

// ---------- solver ----------
// Returns per deck: { opt: { objective: metrics by H } }.
// opts: objectives (keys of OBJECTIVES), Hs (horizons), depth (<= g.depth), keepHs (horizons for keep tables)
function solveDecks(g, decks, opts = {}) {
  const objs = opts.objectives || ['V09', 'N'];
  const Hs = (opts.Hs || range(3, g.T)).filter(h => h <= g.T);
  const depth = Math.min(opts.depth || g.depth, g.depth);
  const keepHs = opts.keepHs || [6, 8, 10, 15];
  const K = decks.length, n = g.n;
  const P = decks.map(d => prepDeck(g, d));
  const ws = opts.ws && opts.ws.K >= K ? opts.ws : workspace(g, K);
  const aP = ws.aP, bP = ws.bP, pol = ws.pol;
  const pr = new Float64Array(K * n), reach = new Uint8Array(K);
  const bp = new Float64Array(K), bs = new Float64Array(K), ba = new Int32Array(K), acc = new Float64Array(9 * K);
  // exact library: remaining count of type i for deck k = offs[k*n+i] + library byte
  const offs = new Int32Array(K * g.nLib); P.forEach((d, k) => offs.set(d.off, k * g.nLib));
  const exact = !g.lump, infoW = g.infoW;
  const out = decks.map(() => ({ opt: {} }));
  const timing = { backward: 0, forward: 0 };

  // forward pass under the policy in pol from opening masses. Returns per deck the per-turn sums.
  function forward(H, openMass) {
    const t0 = Date.now();
    let cur = aP, nxt = bP;
    cur.fill(0, 0, g.nOpen * K); cur.set(openMass);
    const z = () => decks.map(() => new Float64Array(H + 1));
    const pt = { useful: z(), gen: z(), ramp: z(), spells: z(), rampCast: z(), left: z(), landOnCurve: z(), cmdCast: z(), mass: z() };
    for (let si = 0; si <= g.actStep[H]; si++) {
      const st = g.steps[si];
      nxt.fill(0, 0, st.nTo * K);
      if (st.kind === 'draw') {
        const ch = st.ch, info = st.info, invN = 1 / st.N;
        for (let idx = 0; idx < st.nFrom; idx++) {
          const b = idx * K; let any = false;
          for (let k = 0; k < K; k++) if (cur[b + k] !== 0) { any = true; break; }
          if (!any) continue;
          if (exact) {
            const ib = idx * infoW, cb0 = idx * n;
            for (let k = 0; k < K; k++) {
              const m = cur[b + k]; if (m === 0) continue;
              const ob = k * n, f = m * invN;
              for (let i = 0; i < n; i++) { const rem = offs[ob + i] + info[ib + i]; if (rem > 0) nxt[ch[cb0 + i] * K + k] += f * rem; }
            }
            continue;
          }
          drawProbs(g, st, idx, P, K, pr, reach);
          for (let i = 0; i < n; i++) {
            const c = ch[idx * n + i]; if (c < 0) continue;
            const cb = c * K;
            for (let k = 0; k < K; k++) { const m = cur[b + k]; if (m !== 0 && reach[k]) nxt[cb + k] += m * pr[k * n + i]; }
          }
        }
      } else {
        const t = st.t, pl = pol[si], off = st.off, ch = st.ch, us = st.us, sp = st.sp, ra = st.ra, rc = st.rc, m0 = st.m0;
        acc.fill(0);
        for (let x = 0; x < st.nFrom; x++) {
          const xb = x * K;
          for (let k = 0; k < K; k++) {
            const m = cur[xb + k]; if (m === 0) continue;
            const e = off[x] + pl[xb + k];
            nxt[ch[e] * K + k] += m;
            const a = k * 9;
            acc[a] += m * us[e]; acc[a + 1] += m * sp[e]; acc[a + 2] += m * ra[e]; acc[a + 3] += m * rc[e];
            acc[a + 4] += m * (m0[x] + ra[e] - rc[e]);
          }
        }
        const fl = st.fl, lf = st.lf;
        for (let y = 0; y < st.nTo; y++) {
          const yb = y * K, f = fl[y], l = lf[y];
          for (let k = 0; k < K; k++) { const m = nxt[yb + k]; if (m === 0) continue; const a = k * 9; acc[a + 5] += m; if (f & 1) acc[a + 6] += m; if (f & 2) acc[a + 7] += m; acc[a + 8] += m * l; }
        }
        for (let k = 0; k < K; k++) {
          const a = k * 9;
          pt.useful[k][t] = acc[a]; pt.spells[k][t] = acc[a + 1]; pt.ramp[k][t] = acc[a + 2]; pt.rampCast[k][t] = acc[a + 3]; pt.gen[k][t] = acc[a + 4];
          pt.mass[k][t] = acc[a + 5]; pt.landOnCurve[k][t] = acc[a + 6]; pt.cmdCast[k][t] = acc[a + 7]; pt.left[k][t] = acc[a + 8];
        }
      }
      const tmp = cur; cur = nxt; nxt = tmp;
    }
    timing.forward += (Date.now() - t0) / 1000;
    return pt;
  }

  // backward pass for horizon H and objective o; leaves the opening values in aP (index = state*K + k).
  // Ties (within REL_TOL) go to the action with the larger immediate secondary reward, then to the
  // first in enumeration order: a fixed convention that does not change any optimal value.
  function backward(H, o) {
    const t0 = Date.now();
    let toP = aP, frP = bP;
    toP.fill(0, 0, g.steps[g.actStep[H]].nTo * K);
    for (let si = g.actStep[H]; si >= 0; si--) {
      const st = g.steps[si];
      if (st.kind === 'act') {
        const wp = Math.pow(o.gp, st.t - 1);
        const rP = o.prim === 0 ? st.us : st.sp, rS = o.sec === 0 ? st.us : st.sp;
        const off = st.off, ch = st.ch, pl = pol[si], xi = st.xi, nLib = g.nLib;
        for (let x = 0; x < st.nFrom; x++) {
          const e0 = off[x], e1 = off[x + 1], xb = x * K;
          // skip a state that no deck of the batch can reach (some type seen more often than the deck has it)
          let anyReach = false;
          for (let k = 0; k < K && !anyReach; k++) { let ok = true; const ob = k * nLib, xo = x * nLib; for (let q = 0; q < nLib; q++) if (offs[ob + q] + xi[xo + q] < 0) { ok = false; break; } anyReach = ok; }
          if (!anyReach) { for (let k = 0; k < K; k++) { frP[xb + k] = 0; pl[xb + k] = 0; } continue; }
          if (e1 - e0 === 1) {
            const cb = ch[e0] * K, vp = wp * rP[e0];
            for (let k = 0; k < K; k++) { frP[xb + k] = vp + toP[cb + k]; pl[xb + k] = 0; }
            continue;
          }
          { const cb = ch[e0] * K, vp0 = wp * rP[e0]; for (let k = 0; k < K; k++) { bp[k] = vp0 + toP[cb + k]; ba[k] = 0; } }
          for (let e = e0 + 1; e < e1; e++) {
            const cb = ch[e] * K, vp0 = wp * rP[e], sNew = rS[e];
            for (let k = 0; k < K; k++) {
              const vp = vp0 + toP[cb + k], cur = bp[k], tol = REL_TOL * (1 + Math.abs(cur));
              if (vp > cur + tol || (vp >= cur - tol && sNew > rS[e0 + ba[k]])) { bp[k] = vp; ba[k] = e - e0; }
            }
          }
          for (let k = 0; k < K; k++) { frP[xb + k] = bp[k]; pl[xb + k] = ba[k]; }
        }
      } else {
        const ch = st.ch, info = st.info, invN = 1 / st.N;
        for (let idx = 0; idx < st.nFrom; idx++) {
          const b = idx * K;
          if (exact) {
            const ib = idx * infoW, cb0 = idx * n;
            for (let k = 0; k < K; k++) {
              const ob = k * n; let vp = 0, ok = true;
              for (let i = 0; i < n; i++) {
                const rem = offs[ob + i] + info[ib + i];
                if (rem > 0) vp += rem * toP[ch[cb0 + i] * K + k]; else if (rem < 0) { ok = false; break; }
              }
              frP[b + k] = ok ? vp * invN : 0;
            }
            continue;
          }
          drawProbs(g, st, idx, P, K, pr, reach);
          for (let k = 0; k < K; k++) frP[b + k] = 0;
          for (let i = 0; i < n; i++) {
            const c = ch[idx * n + i]; if (c < 0) continue;
            const cb = c * K;
            for (let k = 0; k < K; k++) { if (!reach[k]) continue; const p = pr[k * n + i]; if (p !== 0) frP[b + k] += p * toP[cb + k]; }
          }
        }
      }
      const tmp = toP; toP = frP; frP = tmp;
    }
    if (toP !== aP) aP.set(toP.subarray(0, g.nOpen * K));
    timing.backward += (Date.now() - t0) / 1000;
  }

  // mulligan as optimal stopping, from the opening values in aP/aS. Returns per deck the opening
  // masses (written into om at state*K + k), and the mulligan summary.
  // keep/mulligan and bottom choices: maximise the primary value; ties (within REL_TOL) keep, and
  // the bottom choice goes to the first in enumeration order
  const better = (p1, p2) => p1 > p2 + REL_TOL * (1 + Math.abs(p2));
  function mulligan(om, wantKeep) {
    const nc = g.open.comps.length, res = [];
    om.fill(0);
    const bOf = m => (m === 0 ? 0 : m - 1);
    for (let k = 0; k < K; k++) {
      const pc = P[k].pc;
      // best keep value per composition and bottom size
      const kv = [], kvI = [];
      for (let b = 0; b < depth; b++) {
        const { start, st } = g.open.byB[b];
        const vp = new Float64Array(nc), vi = new Int32Array(nc);
        for (let ci = 0; ci < nc; ci++) {
          let p = -Infinity, best = -1;
          for (let q = start[ci]; q < start[ci + 1]; q++) { const x = st[q]; if (best < 0 || better(aP[x * K + k], p)) { p = aP[x * K + k]; best = x; } }
          vp[ci] = p; vi[ci] = best;
        }
        kv.push(vp); kvI.push(vi);
      }
      // value at each depth limit d = 2..depth (forced keep at stage d), and the keep policy at full depth
      const valueAtDepth = [];
      let keepTab = null;
      for (let dd = Math.min(2, depth); dd <= depth; dd++) {
        let U = 0;
        for (let ci = 0; ci < nc; ci++) if (pc[ci] > 0) U += pc[ci] * kv[bOf(dd)][ci];
        const keepP = [];
        for (let m = dd - 1; m >= 0; m--) {
          let nU = 0; const kp = new Uint8Array(nc);
          for (let ci = 0; ci < nc; ci++) {
            if (pc[ci] === 0) continue;
            const v = kv[bOf(m)][ci];
            if (!better(U, v)) { kp[ci] = 1; nU += pc[ci] * v; } else nU += pc[ci] * U;
          }
          keepP[m] = kp; U = nU;
        }
        valueAtDepth.push(U);
        if (dd === depth) keepTab = keepP;
      }
      // optimal play with part 1's mulligan rule (keep 2-5 lands or 1 land + 2 ramp, free mulligan,
      // third hand kept with part 1's bottom): isolates what optimal mulligans add
      let vP1 = null;
      if (depth >= 2) {
        let pFail = 0; g.open.comps.forEach((x, ci) => { if (!M.part1Keep(x)) pFail += pc[ci]; });
        const { start: s0, st: st0 } = g.open.byB[0], { start, st } = g.open.byB[1];
        vP1 = 0;
        g.open.comps.forEach((x, ci) => {
          if (pc[ci] === 0) return;
          if (M.part1Keep(x)) vP1 += (1 + pFail) * pc[ci] * aP[st0[s0[ci]] * K + k];
          const bt = M.part1Bottom(g.univ, x); let q = -1;
          subMultisets(x, 1).forEach((B, i2) => { if (B[bt]) q = start[ci] + i2; });
          vP1 += pFail * pFail * pc[ci] * aP[st[q] * K + k];
        });
      }
      // forward masses under the full-depth policy
      let reachM = 1; const stageP = [];
      for (let m = 0; m <= depth; m++) {
        let mull = 0; const b = bOf(m);
        for (let ci = 0; ci < nc; ci++) {
          if (pc[ci] === 0) continue;
          const pm = reachM * pc[ci];
          if (m === depth || keepTab[m][ci]) om[kvI[b][ci] * K + k] += pm; else mull += pm;
        }
        stageP.push(reachM - mull); reachM = mull;
      }
      const r = { valueAtDepth, stageP, vP1 };
      if (wantKeep) { // P(keep | lands in the 7-card hand) for the first hand (stage 0) and after the free mulligan (stage 1)
        r.keep = [0, 1].map(m => { const num = new Float64Array(8), den = new Float64Array(8); g.open.comps.forEach((x, ci) => { den[x[0]] += pc[ci]; if (keepTab[m] && keepTab[m][ci]) num[x[0]] += pc[ci]; }); return Array.from(num, (v, l) => (den[l] > 1e-15 ? v / den[l] : null)); });
      }
      res.push(r);
    }
    return res;
  }

  const om = new Float64Array(g.nOpen * K);
  for (const ok of objs) {
    const o = OBJECTIVES[ok];
    const per = decks.map(() => []);
    for (const H of Hs) {
      backward(H, o);
      const mres = mulligan(om, keepHs.includes(H));
      const fp = forward(H, om);
      for (let k = 0; k < K; k++) per[k].push({ H, fp, k, mull: mres[k] });
    }
    for (let k = 0; k < K; k++) out[k].opt[ok] = summarizeOpt(per[k], o, ok);
  }
  return { results: out, timing };
}

// Part 1 rule on the same decks with phase 1's code (graph shared by the decks, one sweep each).
function heuristicBaseline(univ, extra, T, decks, Hs) {
  const t0 = Date.now();
  const hg = Gd.buildGraph(univ, extra, T);
  const out = decks.map(d => {
    const sum = E.summarize(Gd.sweep(hg, univ, d, T));
    const o = { H: Hs.slice() }; for (const key of MKEYS) o[key] = Hs.map(H => sum[H - 1][key]);
    o.landMiss = sum[T - 1].landMiss;
    return o;
  });
  return { results: out, states: hg.states, secs: (Date.now() - t0) / 1000 };
}

// value and policy buffers for batches of up to K decks (reusable across batches)
function workspace(g, K) {
  const L = g.maxLayer * K;
  return { K, aP: new Float64Array(L), bP: new Float64Array(L), pol: g.steps.map(st => (st.kind === 'act' ? (g.maxActs > 255 ? new Uint16Array(st.nFrom * K) : new Uint8Array(st.nFrom * K)) : null)) };
}
// bytes of a workspace for K decks
function workspaceBytes(g, K) { return K * (16 * g.maxLayer + (g.maxActs > 255 ? 2 : 1) * g.sumX + 8 * g.nOpen); }

function range(a, b) { const r = []; for (let x = a; x <= b; x++) r.push(x); return r; }

// cumulative quantities at horizon H from per-turn sums
function atH(pt, k, H) {
  let V09 = 0, V08 = 0, V10 = 0, N = 0, N09 = 0, gen = 0, ramp = 0, rampCast = 0, cmdTurn = 1;
  for (let t = 1; t <= H; t++) {
    const u = pt.useful[k][t], s = pt.spells[k][t];
    V09 += Math.pow(0.9, t - 1) * u; V08 += Math.pow(0.8, t - 1) * u; V10 += u;
    N += s; N09 += Math.pow(0.9, t - 1) * s;
    gen += pt.gen[k][t]; ramp += pt.ramp[k][t]; rampCast += pt.rampCast[k][t];
    cmdTurn += 1 - pt.cmdCast[k][t];
  }
  const landMiss = []; for (let t = 1; t <= Math.min(6, H); t++) landMiss.push(1 - pt.landOnCurve[k][t]);
  return { V09, V08, V10, N, N09, gen, ramp, unused: gen - V10 - ramp, rampCast, left: pt.left[k][H], cmdTurn, mass: pt.mass[k][H], landMiss };
}
const MKEYS = ['V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn'];
function summarizeH(pt, k, Hs) {
  const o = { H: Hs.slice() }; for (const key of MKEYS) o[key] = [];
  o.mass = [];
  for (const H of Hs) { const r = atH(pt, k, H); for (const key of MKEYS) o[key].push(r[key]); o.mass.push(r.mass); }
  o.landMiss = atH(pt, k, Math.max(...Hs)).landMiss;
  return o;
}
function summarizeOpt(list, o, okey) {
  const r = { H: list.map(x => x.H) }; for (const key of MKEYS) r[key] = [];
  r.mass = []; r.value = []; r.vP1Mull = []; r.valueAtDepth = []; r.stageP = []; r.keep = {};
  for (const { H, fp, k, mull } of list) {
    const a = atH(fp, k, H);
    for (const key of MKEYS) r[key].push(a[key]);
    r.mass.push(a.mass);
    r.value.push(mull.valueAtDepth[mull.valueAtDepth.length - 1]); r.vP1Mull.push(mull.vP1);
    r.valueAtDepth.push(mull.valueAtDepth); r.stageP.push(mull.stageP);
    if (mull.keep) r.keep[H] = mull.keep;
    if (H === list[list.length - 1].H) r.landMiss = a.landMiss;
  }
  return r;
}

module.exports = { buildOptGraph, solveDecks, heuristicBaseline, range, workspace, workspaceBytes, prepDeck, OBJECTIVES, DEFAULT_DEPTH, KeySet, compositions, subMultisets, MKEYS };

if (require.main === module) {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  const cmd = +(a.cmd || 4), T = +(a.T || 10), sc = a.scenario || 'P1', depth = +(a.depth || DEFAULT_DEPTH);
  const decks = (a.deck || '36:5:5').split(',').map(spec => E.buildDeck(spec, a.shape || 'tight', +(a.avg || 3), cmd));
  const lump = a.lump ? Gd.lumpGroupsOf(decks[0]) : null;
  const univ = Gd.universalDeck(decks[0].costs, cmd, lump);
  const g = buildOptGraph(univ, M.SCENARIOS[sc], T, depth, { progress: a.progress ? p => process.stderr.write(`\r t=${p.t} ${p.stage} ${(p.states / 1e6).toFixed(1)}M states ${p.secs.toFixed(0)}s   `) : null });
  console.log(`graph ${a.shape || 'tight'} costs ${univ.costs} cmd ${cmd} ${sc} T=${T} depth ${depth}${lump ? ' lump-hand-g2' : ''}: ${g.states} states, ${g.edges} edges, max layer ${g.maxLayer}, max actions ${g.maxActs}, ${(g.bytes / 1e6).toFixed(0)} MB, built in ${g.buildSecs.toFixed(1)}s`);
  const objectives = (a.obj || 'V09,N').split(',');
  const r = solveDecks(g, decks, { objectives, depth });
  const hb = heuristicBaseline(univ, M.SCENARIOS[sc], T, decks, range(3, T));
  console.log(`solve: backward ${r.timing.backward.toFixed(1)}s forward ${r.timing.forward.toFixed(1)}s for ${decks.length} deck(s), rss ${(process.memoryUsage().rss / 1e6).toFixed(0)} MB, peak rss ${(process.resourceUsage().maxRSS / 1e3).toFixed(0)} MB`);
  decks.forEach((d, k) => {
    const x = r.results[k]; x.heur = hb.results[k];
    console.log(`\ndeck ${d.L}:${d.D}:${d.R} spells ${JSON.stringify(d.costCounts.slice(1))}`);
    for (const ok of objectives) {
      const o = x.opt[ok];
      console.log(`objective ${ok}: H  value  | V09 (heur)  N (heur)  V10 gen unused left cmdTurn | P(keep 7 first) | value at depth 2..${depth}`);
      o.H.forEach((H, i) => console.log(`  ${String(H).padStart(2)} ${o.value[i].toFixed(5)} | ${o.V09[i].toFixed(4)} (${x.heur.V09[i].toFixed(4)}) ${o.N[i].toFixed(4)} (${x.heur.N[i].toFixed(4)}) ${o.V10[i].toFixed(3)} ${o.gen[i].toFixed(3)} ${o.unused[i].toFixed(3)} ${o.left[i].toFixed(3)} ${o.cmdTurn[i].toFixed(3)} | ${o.stageP[i][0].toFixed(4)} | ${o.valueAtDepth[i].map(z => z.toFixed(6)).join(' ')}`));
    }
  });
}
