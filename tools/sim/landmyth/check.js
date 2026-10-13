#!/usr/bin/env node
'use strict';
// Phase 1 gate checks. Prints PASS/FAIL lines.
//   a) land-drop probabilities (and the keep probability) vs independent closed-form hypergeometric sums, to 1e-9;
//   b1) exact.js vs an exhaustive enumeration of every opening hand and draw order, played by
//       part 1's OWN mulligan() and play() (loaded from manasim.js), to 1e-9 (short horizons);
//   b2) exact.js vs part 1 Monte Carlo (part 1's mulligan()/play(), 200k games), within 3 SE;
//   b3) commander costs other than 4: exact.js vs a plain Monte Carlo of the same model;
//   c) sanity: V nondecreasing in T, probability mass 1 every turn, accounting identity.
// Usage: node check.js [--games 200000] [--games3 100000] [--skip-mc] [--only a,b1,b2,b3,c] [--cfgs 0,1 (b2 subset)] [--b1cfgs 0,8 (b1 subset)]
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const M = require('./model');
const E = require('./exact');
const { loadPart1 } = require('./part1');

// ---------- independent helpers (do not reuse model.js combinatorics) ----------
function lchoose(n, k) { // exact enough in log space up to n = 99
  if (k < 0 || k > n) return -Infinity;
  let r = 0; for (let i = 1; i <= k; i++) r += Math.log(n - k + i) - Math.log(i);
  return r;
}
function C(n, k) { return k < 0 || k > n ? 0 : Math.exp(lchoose(n, k)); }

// P(no land drop missed through turn t), drawing from a library of size N with Lb lands,
// starting with h lands in hand. Turn s draws d[s] cards; a drop is missed at turn s iff
// lands seen by then < s. Sum over land counts in each turn's block (multivariate hypergeometric).
function pNoMissClosed(N, Lb, h, d, t) {
  let tot = 0;
  (function rec(s, drawn, landsDrawn, w) {
    if (s > t) { tot += w * C(N - drawn, Lb - landsDrawn) / C(N, Lb); return; }
    for (let l = 0; l <= d[s]; l++) {
      if (h + landsDrawn + l < s) continue; // missed at turn s
      rec(s + 1, drawn + d[s], landsDrawn + l, w * C(d[s], l));
    }
  })(1, 0, 0, 1);
  return tot;
}
function drawsVec(extra, T) { const d = [0]; for (let t = 1; t <= T; t++) d.push(1 + (t >= 5 && t <= 8 ? extra[t - 5] : 0)); return d; }

// Closed form with part 1 mulligans: classify 7-card hands by (lands l, ramp r, spells s=7-l-r).
// Keep: 2<=l<=5 or (l==1 and r>=2). Third hand: bottom a land iff l>=4 or (s==0 and l>0).
function closedLandMiss(deck, extra, T, mull) {
  const { L, D, R, S } = deck; const RR = D + R; const tot = C(99, 7);
  const hands = [];
  for (let l = 0; l <= 7; l++) for (let r = 0; l + r <= 7; r++) {
    const s = 7 - l - r; const p = C(L, l) * C(RR, r) * C(S, s) / tot;
    if (p > 0) hands.push({ l, r, s, p });
  }
  const keep = h => (h.l >= 2 && h.l <= 5) || (h.l === 1 && h.r >= 2);
  const pKeep = hands.filter(keep).reduce((a, h) => a + h.p, 0), pFail = 1 - pKeep;
  const d = drawsVec(extra, T); const out = [];
  for (let t = 1; t <= T; t++) {
    let ok = 0;
    for (const h of hands) {
      const base = pNoMissClosed(92, L - h.l, h.l, d, t);
      if (!mull) { ok += h.p * base; continue; }
      if (keep(h)) ok += (1 + pFail) * h.p * base;
      const botLand = h.l >= 4 || (h.s === 0 && h.l > 0);
      // bottomed land: hand has l-1 lands, library still 92 cards with L-l lands (bottom card out of play)
      ok += pFail * pFail * h.p * (botLand ? pNoMissClosed(92, L - h.l, h.l - 1, d, t) : base);
    }
    out.push(1 - ok);
  }
  return { miss: out, pKeep };
}

const results = [];
function report(name, pass, detail) { results.push(pass); console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); }

// ---------- a) hypergeometric ----------
function gateA() {
  const decks = [['36:5:5', 'tight', 3], ['30:6:8', 'tight', 3.5], ['42:0:0', 'tight', 4], ['20:12:8', 'tight', 2.5], ['48:0:16', 'tight', 4.5], ['44:0:0', 'normal', 3.75]];
  for (const [spec, shape, avg] of decks) {
    const deck = E.buildDeck(spec, shape, avg);
    for (const sc of ['P1', 'P5', 'P8']) {
      for (const mull of [false, true]) {
        const T = 6;
        const sol = E.solve(deck, M.SCENARIOS[sc], T, { mulligan: mull });
        const sum = E.summarize(sol);
        const ex = []; for (let t = 1; t <= T; t++) ex.push(1 - sol.pt.landOnCurve[t]);
        const cf = closedLandMiss(deck, M.SCENARIOS[sc], T, mull);
        let md = 0; ex.forEach((v, i) => md = Math.max(md, Math.abs(v - cf.miss[i])));
        let extra = '';
        if (!mull && sc === 'P1') { // the textbook table: P(no miss by t) = P(Hyp(99, L, 7+t) >= t)
          let md2 = 0;
          for (let t = 1; t <= T; t++) {
            let tail = 0; for (let k = t; k <= 7 + t; k++) tail += C(deck.L, k) * C(99 - deck.L, 7 + t - k) / C(99, 7 + t);
            md2 = Math.max(md2, Math.abs((1 - ex[t - 1]) - tail));
          }
          md = Math.max(md, md2); extra = ' (incl. single-tail table)';
        }
        if (mull) { // keep probability: mass of stage-0 opening states
          const pk = M.openingStates(deck).filter(o => o.stage === 0).reduce((a, o) => a + o.p, 0);
          md = Math.max(md, Math.abs(pk - cf.pKeep)); extra += ` pKeep=${cf.pKeep.toFixed(6)}`;
        }
        report(`a land-drop ${spec} ${shape} ${avg} ${sc} ${mull ? 'mull' : 'nomull'}`, md < 1e-9,
          `max|diff|=${md.toExponential(2)} miss(t=1..6)=${ex.slice(0, 6).map(x => x.toFixed(5)).join(' ')}${extra}`);
      }
    }
  }
}

// ---------- b1) exhaustive enumeration through part 1's own code ----------
function part1Deck(P, deck) {
  const spells = []; deck.costs.forEach((c, j) => { for (let i = 0; i < deck.K[3 + j]; i++) spells.push(c); });
  return { arr: P.buildDeck(deck.L, deck.D, deck.R, spells), code: [P.LAND, P.DORK, P.ROCK, ...deck.costs] };
}
// RNG values that make part 1's shuffle(deck) return exactly `desired` (a permutation of deck codes).
function scriptFor(deckArr, desired) {
  const a = Array.from(deckArr), v = [];
  for (let i = a.length - 1; i > 0; i--) {
    let j = -1; for (let q = i; q >= 0; q--) if (a[q] === desired[i]) { j = q; break; }
    v.push((j + 0.5) / (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return v;
}
function orderFrom(code, K, prefixTypes) { // prefix types, then the rest of the deck
  const left = K.slice(), out = [];
  for (const i of prefixTypes) { out.push(code[i]); left[i]--; }
  for (let i = 0; i < K.length; i++) for (let k = 0; k < left[i]; k++) out.push(code[i]);
  return out;
}

function gateB1(pick) {
  const P = loadPart1();
  const cfgs = [
    // sizes: (opening compositions) x (types ^ cards drawn) orders, each replayed by part 1
    ['36:5:5', 'tight', 3, 'P1', 7], ['36:5:5', 'tight', 3, 'P8', 5], ['30:6:8', 'tight', 3.5, 'P1', 5],
    ['30:6:8', 'tight', 3.5, 'P5', 5], ['42:0:0', 'tight', 4, 'P8', 6], ['22:10:10', 'tight', 2.25, 'P3', 5],
    ['26:3:12', 'tight', 3, 'P1', 7], ['38:6:4', 'normal', 3, 'P1', 3], ['42:0:0', 'normal', 3.5, 'P1', 3],
  ];
  for (const [ci, [spec, shape, avg, sc, T]] of cfgs.entries()) {
    if (pick && !pick.includes(ci)) continue;
    const deck = E.buildDeck(spec, shape, avg), extra = M.SCENARIOS[sc];
    const { arr, code } = part1Deck(P, deck);
    const n = deck.n, K = deck.K;
    const d = drawsVec(extra, T); const nDraw = d.reduce((a, b) => a + b, 0);
    // a hand part 1 must reject: 7 spells if possible, else 7 lands
    const badTypes = []; { const k = K.slice(); let i = 3; while (badTypes.length < 7 && i < n) { if (k[i] > 0) { badTypes.push(i); k[i]--; } else i++; } if (badTypes.length < 7) { badTypes.length = 0; for (let q = 0; q < 7; q++) badTypes.push(0); } }
    const badOrder = orderFrom(code, K, badTypes);
    // independent enumeration of 7-card hands
    const hands = [];
    (function rec(i, left, x, w) {
      if (i === n) { if (left === 0) hands.push({ x: x.slice(), p: w / C(99, 7) }); return; }
      for (let v = 0; v <= Math.min(left, K[i]); v++) { x.push(v); rec(i + 1, left - v, x, w * C(K[i], v)); x.pop(); }
    })(0, 7, [], 1);
    const res = {};
    const runMull = (orders) => { let q = []; for (const o of orders) q = q.concat(scriptFor(arr, o)); let k = 0; const r = () => q[k++]; return P.mulligan(arr, r); };
    // part 1 keep decision per hand (stage 0), checked also at stage 1
    let pFail = 0;
    for (const h of hands) {
      const pre = []; h.x.forEach((c, i) => { for (let k = 0; k < c; k++) pre.push(i); });
      h.pre = pre;
      const o0 = orderFrom(code, K, pre);
      const r0 = runMull([o0, badOrder, badOrder]);
      h.keep = r0.mull !== 2 && r0.every((c, i) => c === o0[i]);
      const r1 = runMull([badOrder, o0, badOrder]);
      const keep1 = r1.mull !== 2 && r1.every((c, i) => c === o0[i]);
      if (keep1 !== h.keep) throw new Error('part 1 keep differs between hands 0 and 1');
      if (!h.keep) pFail += h.p;
    }
    const acc = { V09: 0, V08: 0, V10: 0, N09: 0, N: 0, gen: 0, ramp: 0, unused: 0, rampCast: 0, left: 0, cmdTurn: 0, mass: 0 };
    const add = (w, ord) => {
      const per = [0], perN = [0]; for (let t = 1; t <= T; t++) { P.play(ord, extra, t, deck.maxCmc, res); per.push(res.useful); perN.push(res.spells); }
      let v9 = 0, v8 = 0, n9 = 0; for (let t = 1; t <= T; t++) { const u = per[t] - per[t - 1]; v9 += Math.pow(0.9, t - 1) * u; v8 += Math.pow(0.8, t - 1) * u; n9 += Math.pow(0.9, t - 1) * (perN[t] - perN[t - 1]); }
      acc.V09 += w * v9; acc.V08 += w * v8; acc.V10 += w * res.useful; acc.N09 += w * n9; acc.N += w * res.spells; acc.gen += w * res.gen; acc.ramp += w * res.ramp;
      acc.unused += w * res.unused; acc.rampCast += w * res.rampCast; acc.left += w * res.left;
      acc.cmdTurn += w * Math.min(res.cmdTurn, T + 1); acc.mass += w;
    };
    let nSeq = 0;
    for (const h of hands) {
      const lib = K.map((k, i) => k - h.x[i]);
      const seq = [];
      (function rec(j, w) {
        if (j === nDraw) {
          nSeq++;
          const o = orderFrom(code, K, h.pre.concat(seq));
          if (h.keep) add((1 + pFail) * h.p * w, o);
          const r2 = runMull([badOrder, badOrder, o]);
          if (r2.mull !== 2) throw new Error('third hand not marked');
          add(pFail * pFail * h.p * w, r2);
          return;
        }
        const N = 92 - j;
        for (let i = 0; i < n; i++) if (lib[i] > 0) { const pi = lib[i] / N; lib[i]--; seq.push(i); rec(j + 1, w * pi); seq.pop(); lib[i]++; }
      })(0, 1);
    }
    const sol = E.solve(deck, extra, T, {}); const ex = E.summarize(sol)[T - 1];
    let md = 0, worst = '';
    for (const k of Object.keys(acc)) { if (k === 'mass') continue; const diff = Math.abs(acc[k] - ex[k]); if (diff > md) { md = diff; worst = k; } }
    md = Math.max(md, Math.abs(acc.mass - 1));
    report(`b1 enumeration-through-part1 ${spec} ${shape} ${avg} ${sc} T=${T}`, md < 1e-9,
      `${hands.length} hands x ${nSeq / hands.length} draw orders; max|diff|=${md.toExponential(2)}${worst ? ' (' + worst + ')' : ''}; V0.9=${ex.V09.toFixed(6)} useful=${ex.V10.toFixed(6)}`);
  }
}

// ---------- b2) Monte Carlo through part 1 ----------
const MC_CFGS = [
  ['36:5:5', 'tight', 3, 15], ['30:6:8', 'tight', 3.5, 15], ['42:0:0', 'tight', 4, 15],
  ['24:12:12', 'tight', 2.25, 15], ['46:0:4', 'tight', 4.5, 12], ['38:6:4', 'normal', 3, 5],
  ['30:6:8', 'normal', 4, 5], ['42:0:0', 'normal', 3.5, 10],
];
const MC_SCN = ['P1', 'P4', 'P8'];
const MC_KEYS = ['V09', 'V08', 'V10', 'N09', 'N', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn'];

function mcWorker({ spec, shape, avg, T, games, g0, g1, seed }) {
  const P = loadPart1();
  const deck = E.buildDeck(spec, shape, avg);
  const { arr } = part1Deck(P, deck);
  const res = {};
  const Ts = [];
  for (let t = 3; t <= T; t++) Ts.push(t);
  const out = {};
  for (const sc of MC_SCN) { out[sc] = {}; for (const t of Ts) { out[sc][t] = {}; for (const k of MC_KEYS) out[sc][t][k] = [0, 0]; } out[sc].miss = Array.from({ length: 7 }, () => [0, 0]); out[sc].cmdT4 = [0, 0]; }
  for (let g = g0; g < g1; g++) {
    const r = P.rng((seed + g * 2654435761) >>> 0);
    const order = P.mulligan(arr, r);
    for (const sc of MC_SCN) {
      const extra = M.SCENARIOS[sc];
      let prevU = 0, prevN = 0, v9 = 0, v8 = 0, n9 = 0;
      for (let t = 1; t <= T; t++) {
        P.play(order, extra, t, deck.maxCmc, res);
        const u = res.useful - prevU; prevU = res.useful;
        const ns = res.spells - prevN; prevN = res.spells;
        v9 += Math.pow(0.9, t - 1) * u; v8 += Math.pow(0.8, t - 1) * u; n9 += Math.pow(0.9, t - 1) * ns;
        if (t === 4) { const x = res.cmdTurn <= 4 ? 1 : 0; out[sc].cmdT4[0] += x; out[sc].cmdT4[1] += x; }
        if (t >= 3) {
          const vals = { V09: v9, V08: v8, V10: res.useful, N09: n9, N: res.spells, gen: res.gen, ramp: res.ramp, unused: res.unused, rampCast: res.rampCast, left: res.left, cmdTurn: Math.min(res.cmdTurn, t + 1) };
          const o = out[sc][t];
          for (const k of MC_KEYS) { o[k][0] += vals[k]; o[k][1] += vals[k] * vals[k]; }
        }
      }
      // land drops straight from the order (independent of both engines)
      let ptr = order.mull === 2 ? 6 : 7, hand = 0, missed = 0;
      for (let i = 0; i < ptr; i++) if (order[i] === P.LAND) hand++;
      for (let t = 1; t <= 6; t++) {
        const nd = 1 + (t >= 5 && t <= 8 ? extra[t - 5] : 0);
        for (let q = 0; q < nd; q++) if (order[ptr++] === P.LAND) hand++;
        if (hand > 0) hand--; else missed = 1;
        out[sc].miss[t][0] += missed; out[sc].miss[t][1] += missed;
      }
    }
  }
  return out;
}

async function gateB2(games, pick) {
  const nw = Math.max(1, os.cpus().length);
  for (const [ci, [spec, shape, avg, T]] of MC_CFGS.entries()) {
    if (pick && !pick.includes(ci)) continue;
    const t0 = Date.now();
    const chunk = Math.ceil(games / nw);
    const parts = await Promise.all(Array.from({ length: nw }, (_, w) => new Promise((resolve, reject) => {
      const wk = new Worker(__filename, { workerData: { spec, shape, avg, T, games, g0: w * chunk, g1: Math.min(games, (w + 1) * chunk), seed: 12345 } });
      wk.on('message', resolve); wk.on('error', reject);
    })));
    const merged = parts[0];
    const addInto = (a, b) => { a[0] += b[0]; a[1] += b[1]; };
    for (const p of parts.slice(1)) for (const sc of MC_SCN) {
      for (let t = 3; t <= T; t++) for (const k of MC_KEYS) addInto(merged[sc][t][k], p[sc][t][k]);
      for (let t = 1; t <= 6; t++) addInto(merged[sc].miss[t], p[sc].miss[t]);
      addInto(merged[sc].cmdT4, p[sc].cmdT4);
    }
    const deck = E.buildDeck(spec, shape, avg);
    let nTests = 0, nOver = 0, maxZ = 0, worst = '';
    const z = (acc, exact, label) => {
      const m = acc[0] / games, v = Math.max(0, acc[1] / games - m * m), se = Math.sqrt(v / games);
      let zz = se > 0 ? Math.abs(m - exact) / se : (Math.abs(m - exact) < 1e-12 ? 0 : Infinity);
      nTests++; if (zz > 3) nOver++; if (zz > maxZ) { maxZ = zz; worst = `${label} mc=${m.toFixed(5)} exact=${exact.toFixed(5)} se=${se.toExponential(1)}`; }
    };
    for (const sc of MC_SCN) {
      const sol = E.solve(deck, M.SCENARIOS[sc], T, {}); const sum = E.summarize(sol);
      for (let t = 3; t <= T; t++) for (const k of MC_KEYS) z(merged[sc][t][k], sum[t - 1][k], `${sc} T${t} ${k}`);
      for (let t = 1; t <= 6; t++) z(merged[sc].miss[t], 1 - sol.pt.landOnCurve[t], `${sc} landMiss${t}`);
      z(merged[sc].cmdT4, sol.pt.cmdCast[4], `${sc} cmdT4`);
    }
    // metrics are strongly correlated across T, so count |z|>3 against the 0.27% a single test allows
    const pass = maxZ < 4.5 && nOver <= Math.max(2, Math.ceil(0.01 * nTests));
    report(`b2 monte-carlo ${spec} ${shape} ${avg} T<=${T} ${MC_SCN.join('/')}`, pass,
      `${games} games, ${nTests} comparisons, ${nOver} with |z|>3, max|z|=${maxZ.toFixed(2)} [${worst}] (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
  }
}

// ---------- b3) other commander costs: exact.js vs a plain simulation of the same model ----------
// Part 1 only has a 4-mana commander, so for 2..7 the reference is a straightforward Monte Carlo
// of model.js/policy1.js on real shuffles (checks the exact enumeration, not the port).
function gateB3(games) {
  const { makePolicy } = require('./policy1');
  const cfgs = [['36:5:5', 'tight', 3.5, 2, 'P4', 12], ['30:6:8', 'tight', 3, 7, 'P8', 12], ['28:10:12', 'tight', 2.5, 5, 'P1', 12], ['40:2:4', 'tight', 4.25, 3, 'P6', 12]];
  for (const [spec, shape, avg, cmd, sc, T] of cfgs) {
    const deck = E.buildDeck(spec, shape, avg, cmd), extra = M.SCENARIOS[sc], policy = makePolicy(deck);
    const cards = []; deck.K.forEach((k, i) => { for (let q = 0; q < k; q++) cards.push(i); });
    let seed = 987654321 + cmd; const rnd = () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const shuf = () => { const a = cards.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    const acc = {}; const keys = ['V09', 'V10', 'N', 'gen', 'left', 'cmdTurn'];
    keys.forEach(k => acc[k] = [0, 0]);
    const s = new Uint8Array(deck.W), nx = new Uint8Array(deck.W), rw = {};
    for (let g = 0; g < games; g++) {
      let o, hand;
      for (let m = 0; m < 3; m++) {
        o = shuf(); const x = new Array(deck.n).fill(0); for (let i = 0; i < 7; i++) x[o[i]]++;
        if (m < 2 && M.part1Keep(x)) { hand = x; o = o.slice(7); break; }
        if (m === 2) { x[M.part1Bottom(deck, x)]--; hand = x; o = o.slice(7); }
      }
      s.fill(0); for (let i = 0; i < deck.n; i++) s[deck.H_OFF + i] = hand[i];
      for (const c of o) s[deck.K_OFF + c]++;
      let ptr = 0, v9 = 0, u = 0, gen = 0, spells = 0, cmdTurn = T + 1;
      for (let t = 1; t <= T; t++) {
        for (let q = 0; q < M.drawsAt(extra, t); q++) { const c = o[ptr++]; s[deck.K_OFF + c]--; s[deck.H_OFF + c]++; }
        M.applyAction(deck, s, policy(s, t), nx, rw); s.set(nx);
        v9 += Math.pow(0.9, t - 1) * rw.useful; u += rw.useful; gen += rw.gen; spells += rw.spells;
        if (s[deck.CMD] && cmdTurn > T) cmdTurn = t;
      }
      let left = 0; for (let j = 0; j < deck.nSp; j++) left += s[deck.H_OFF + 3 + j];
      const vals = { V09: v9, V10: u, N: spells, gen, left, cmdTurn };
      for (const k of keys) { acc[k][0] += vals[k]; acc[k][1] += vals[k] * vals[k]; }
    }
    const ex = E.summarize(E.solve(deck, extra, T, {}))[T - 1];
    let maxZ = 0, worst = '';
    for (const k of keys) { const m = acc[k][0] / games, se = Math.sqrt(Math.max(0, acc[k][1] / games - m * m) / games); const z = Math.abs(m - ex[k]) / se; if (z > maxZ) { maxZ = z; worst = `${k} mc=${m.toFixed(4)} exact=${ex[k].toFixed(4)}`; } }
    report(`b3 commander cost ${cmd}: ${spec} ${shape} ${avg} ${sc} T=${T}`, maxZ < 3.5, `${games} games, max|z|=${maxZ.toFixed(2)} [${worst}]; V0.9=${ex.V09.toFixed(4)}`);
  }
}

// ---------- c) sanity ----------
function gateC() {
  const decks = [['36:5:5', 'tight', 3, 15], ['30:6:8', 'tight', 3.5, 15], ['42:0:0', 'tight', 4, 15], ['20:12:8', 'tight', 2, 15], ['28:10:12', 'normal', 3, 6]];
  for (const [spec, shape, avg, T] of decks) for (const sc of ['P1', 'P8']) {
    const deck = E.buildDeck(spec, shape, avg);
    const sol = E.solve(deck, M.SCENARIOS[sc], T, { dist: true }); const sum = E.summarize(sol);
    let mono = true, massErr = 0, ident = 0, missMono = true, distErr = 0;
    for (let i = 0; i < sum.length; i++) {
      const r = sum[i];
      if (i > 0) for (const k of ['V09', 'V08', 'V10', 'N09', 'N', 'gen']) if (r[k] < sum[i - 1][k] - 1e-12) mono = false;
      massErr = Math.max(massErr, Math.abs(r.mass - 1));
      ident = Math.max(ident, Math.abs(r.gen - r.V10 - r.ramp - r.unused));
      const d = sol.pt.usefulDist[i + 1]; let s = 0, m = 0; d.forEach((p, v) => { s += p; m += p * v; });
      distErr = Math.max(distErr, Math.abs(s - 1), Math.abs(m - r.V10));
      const gh = sol.pt.genHist[i + 1]; distErr = Math.max(distErr, Math.abs(gh.reduce((a, b) => a + b, 0) - 1));
    }
    for (let t = 2; t <= T; t++) if (1 - sol.pt.landOnCurve[t] < 1 - sol.pt.landOnCurve[t - 1] - 1e-12) missMono = false;
    const pass = mono && missMono && massErr < 1e-9 && ident < 1e-9 && distErr < 1e-9;
    report(`c sanity ${spec} ${shape} ${avg} ${sc} T=1..${T}`, pass,
      `V/N/gen nondecreasing in T: ${mono}; landMiss nondecreasing: ${missMono}; max|mass-1|=${massErr.toExponential(1)}; |gen-useful-ramp-unused|=${ident.toExponential(1)}; dist sums/means err=${distErr.toExponential(1)}; V0.9(${T})=${sum[T - 1].V09.toFixed(4)} CVaR10(${T})=${sum[T - 1].cvar10.toFixed(3)}`);
  }
}

if (!isMainThread) { parentPort.postMessage(mcWorker(workerData)); }
else (async () => {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  const only = a.only ? a.only.split(',') : ['a', 'b1', 'b2', 'b3', 'c'];
  if (only.includes('a')) gateA();
  if (only.includes('b1')) gateB1(a.b1cfgs ? a.b1cfgs.split(',').map(Number) : null);
  if (only.includes('b2') && !a['skip-mc']) await gateB2(+(a.games || 200000), a.cfgs ? a.cfgs.split(',').map(Number) : null);
  if (only.includes('b3')) gateB3(+(a.games3 || 100000));
  if (only.includes('c')) gateC();
  const nf = results.filter(x => !x).length;
  console.log(`\n${results.length - nf}/${results.length} PASS${nf ? `, ${nf} FAIL` : ''}`);
  process.exitCode = nf ? 1 : 0;
})();
