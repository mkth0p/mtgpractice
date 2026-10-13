#!/usr/bin/env node
'use strict';
// State-space measurement for phase 1 (writes measure-results.json next to this file).
//   heuristic: states reachable under part 1's play rule (exact.js solve), per turn
//   optimal:   states reachable under ANY non-dominated action (what phase 2's Bellman
//              backward induction must cover), per turn
// Each run is a child process with a state cap; capped runs are extrapolated from the
// last turns' growth ratio and flagged.
// Usage: node measure.js [--cap 15000000] [--par 3] [--out file] [--quick] [--set cmd|phase2|g2|n3|normal3opt]
//        node measure.js reprocess results.json [out.json]
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const M = require('./model');
const E = require('./exact');
const { StateTable } = require('./statetable');

// ---- optimal-policy reachability: expand every maximal action (mass is irrelevant here)
function reach(deck, extra, Tmax, cap, lump = false, groups = 1) {
  const t0 = process.hrtime.bigint();
  const { n, W, K_OFF, H_OFF } = deck;
  const counts = { pre: [0], post: [0], secs: [0], actions: [0] };
  let A = new StateTable(W);
  for (const o of M.openingStates(deck, {})) A.add(o.s, 0);
  // phase 2 also chooses keep/mulligan and the bottomed card: add every 6-card hand
  for (const h of M.openingHands(deck, 7)) for (let b = 0; b < n; b++) if (h.x[b] > 0) {
    const s = new Uint8Array(W);
    for (let i = 0; i < n; i++) { s[K_OFF + i] = deck.K[i] - h.x[i]; s[H_OFF + i] = h.x[i]; }
    s[H_OFF + b]--; A.add(s, 0);
  }
  // lumped library: one spell count per group (groups 2: costs <= deck average vs above)
  const grp = new Int32Array(Math.max(1, deck.nSp)); let G = 1;
  if (groups >= 2) { for (let j = 0; j < deck.nSp; j++) grp[j] = deck.costs[j] <= deck.avg ? 0 : 1; if (!grp.every(x => x === grp[0])) G = 2; else grp.fill(0); }
  if (lump && deck.nSp > 0) {
    const B0 = new StateTable(W);
    for (let idx = 0; idx < A.n; idx++) {
      const s = A.state(idx).slice(); const kg = [0, 0];
      for (let j = 0; j < deck.nSp; j++) { kg[grp[j]] += s[K_OFF + 3 + j]; s[K_OFF + 3 + j] = 0; }
      for (let g = 0; g < G; g++) s[K_OFF + 3 + g] = kg[g];
      B0.add(s, 0);
    }
    A = B0;
  }
  const child = new Uint8Array(W), rw = {};
  let truncated = 0;
  for (let t = 1; t <= Tmax; t++) {
    counts.pre.push(A.n);
    let cur = A;
    for (let j = 0; j < M.drawsAt(extra, t); j++) {
      const nxt = new StateTable(W, 1 << 12);
      for (let idx = 0; idx < cur.n; idx++) {
        const s = cur.state(idx);
        if (lump && deck.nSp > 0) {
          for (let i = 0; i < 3; i++) if (s[K_OFF + i]) { child.set(s); child[K_OFF + i]--; child[H_OFF + i]++; nxt.add(child, 0); }
          for (let j = 0; j < deck.nSp; j++) { const g = grp[j]; if (!s[K_OFF + 3 + g]) continue; child.set(s); child[K_OFF + 3 + g]--; child[H_OFF + 3 + j]++; nxt.add(child, 0); }
          continue;
        }
        for (let i = 0; i < n; i++) if (s[K_OFF + i]) { child.set(s); child[K_OFF + i]--; child[H_OFF + i]++; nxt.add(child, 0); }
      }
      cur = nxt;
    }
    counts.post.push(cur.n);
    const B = new StateTable(W, 1 << 12);
    let nAct = 0;
    for (let idx = 0; idx < cur.n; idx++) {
      const s = cur.state(idx);
      const acts = M.enumerateActions(deck, s, true);
      nAct += acts.length;
      for (const a of acts) { M.applyAction(deck, s, a, child, rw); B.add(child, 0); }
    }
    counts.actions.push(nAct);
    counts.secs.push(Number(process.hrtime.bigint() - t0) / 1e9);
    A = B;
    if (B.n > cap) { truncated = t; break; }
  }
  return { counts, truncated };
}

function runOne(job) {
  const deck = E.buildDeck(job.deck, job.shape, job.avg, job.cmd || 4);
  const extra = M.SCENARIOS[job.sc];
  const out = { ...job, costCounts: deck.costCounts.slice(1), types: deck.n };
  if (job.mode.startsWith('optimal')) {
    const r = reach(deck, extra, job.T, job.cap, job.mode.startsWith('optimal-lumped'), job.mode === 'optimal-lumped2' ? 2 : 1);
    Object.assign(out, r.counts, { truncated: r.truncated });
  } else {
    const sol = E.solve(deck, extra, job.T, { maxStates: job.cap, lumpSpells: job.mode.startsWith('lumped') ? 'hand' : false, lumpGroups: job.mode === 'lumped2' ? 2 : 1 });
    Object.assign(out, sol.counts, { truncated: sol.truncated, peakBytes: sol.peakBytes });
    if (!sol.truncated) { const s = E.summarize(sol); out.V09_T10 = s[9].V09; out.V09_T15 = s[14] && s[14].V09; }
  }
  out.rssMB = process.memoryUsage().rss / 1e6;
  return out;
}

// Geometric extrapolation of per-turn decision-state counts beyond a cap. Only meaningful
// when the cap was hit after the extra-draw turns (t > 8) or in a scenario without extra
// draws; otherwise the run is reported as a lower bound only.
function extrapolate(r, Tmax) {
  const post = r.post.slice(1); const secs = r.secs.slice(1);
  const k = post.length;
  const sumK = post.reduce((a, b) => a + b, 0);
  const perStateSecs = secs[k - 1] / sumK;
  const steady = r.sc === 'P1' || k >= 10;
  if (!steady || k < 3) return { lowerBound: true, reachedTurn: k, lastLayer: post[k - 1], totalSoFar: sumK, perStateSecs };
  const g = Math.pow(post[k - 1] / post[k - 3], 0.5);
  const est = post.slice();
  for (let t = k + 1; t <= Tmax; t++) est.push(est[est.length - 1] * g);
  const sum = (T) => est.slice(0, T).reduce((a, b) => a + b, 0);
  return { growth: g, postEst: est.map(Math.round), total10: sum(10), total15: sum(15), estSecs10: perStateSecs * sum(10), estSecs15: perStateSecs * sum(15), maxLayer15: Math.max(...est), perStateSecs };
}

if (process.argv[2] === 'reprocess') {
  const f = process.argv[3]; const j = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const r of j.results) if (r.truncated) r.extrapolated = extrapolate(r, 15);
  fs.writeFileSync(process.argv[4] || f, JSON.stringify(j, null, 1));
  process.exit(0);
}

if (process.argv[2] === 'run') {
  const job = JSON.parse(process.argv[3]);
  process.stdout.write(JSON.stringify(runOne(job)));
  process.exit(0);
}

(async () => {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  const cap = +(a.cap || 15e6), par = +(a.par || 3);
  const decks = ['36:5:5', '30:6:8', '42:0:0', '28:10:12'];
  const curves = [['tight', 3], ['tight', 3.5], ['tight', 4], ['normal', 3], ['normal', 4], ['barbell', 3.75]];
  const jobs = [];
  for (const d of decks) for (const [shape, avg] of curves) for (const sc of ['P1', 'P8'])
    jobs.push({ mode: 'heuristic', deck: d, shape, avg, sc, T: 15, cap });
  for (const d of ['36:5:5', '28:10:12']) for (const sc of ['P1', 'P8']) {
    for (const [shape, avg] of [['normal', 3], ['barbell', 3.75]]) jobs.push({ mode: 'lumped', deck: d, shape, avg, sc, T: 15, cap });
    for (const [shape, avg] of [['tight', 3], ['tight', 3.5]]) jobs.push({ mode: 'optimal', deck: d, shape, avg, sc, T: 15, cap: cap / 3 });
  }
  if (a.set === 'cmd') { // commander-cost effect on state counts
    jobs.length = 0;
    for (const d of ['36:5:5', '28:10:12']) for (const sc of ['P1', 'P8']) for (let cmd = 2; cmd <= 7; cmd++)
      jobs.push({ mode: 'heuristic', deck: d, shape: 'tight', avg: 3.5, sc, T: 15, cap, cmd });
    for (const sc of ['P1', 'P8']) for (const cmd of [2, 7]) jobs.push({ mode: 'optimal', deck: '36:5:5', shape: 'tight', avg: 3, sc, T: 15, cap: cap / 3, cmd });
  }
  if (a.set === 'phase2') { // optimal-policy reachability with a larger cap, exact and lumped library
    jobs.length = 0;
    for (const sc of ['P1', 'P8']) for (const mode of ['optimal', 'optimal-lumped']) jobs.push({ mode, deck: '36:5:5', shape: 'tight', avg: 3.5, sc, T: 15, cap });
    for (const sc of ['P1', 'P8']) jobs.push({ mode: 'optimal-lumped', deck: '36:5:5', shape: 'normal', avg: 3, sc, T: 15, cap });
    jobs.push({ mode: 'optimal-lumped', deck: '36:5:5', shape: 'barbell', avg: 3.75, sc: 'P1', T: 15, cap });
    jobs.push({ mode: 'optimal', deck: '28:10:12', shape: 'tight', avg: 3.5, sc: 'P8', T: 15, cap });
  }
  if (a.set === 'g2') { // feasibility of the normal curve on high-ramp decks with the lump-hand-g2 library
    jobs.length = 0;
    for (const sc of ['P1', 'P4', 'P8']) for (const avg of [3, 4]) jobs.push({ mode: 'lumped2', deck: '28:10:12', shape: 'normal', avg, sc, T: 15, cap });
    for (const sc of ['P1', 'P8']) jobs.push({ mode: 'lumped2', deck: '36:5:5', shape: 'normal', avg: 3, sc, T: 15, cap });
    for (const sc of ['P1', 'P8']) jobs.push({ mode: 'optimal-lumped2', deck: '28:10:12', shape: 'normal', avg: 3, sc, T: 15, cap });
    jobs.push({ mode: 'optimal-lumped2', deck: '28:10:12', shape: 'tight', avg: 3.5, sc: 'P8', T: 15, cap });
  }
  if (a.set === 'n3') { // candidate coarsening: normal folded onto 3 costs
    jobs.length = 0;
    for (const sc of ['P1', 'P8']) {
      jobs.push({ mode: 'heuristic', deck: '28:10:12', shape: 'normal3', avg: 3, sc, T: 15, cap });
      jobs.push({ mode: 'lumped2', deck: '28:10:12', shape: 'normal3', avg: 3, sc, T: 15, cap });
      jobs.push({ mode: 'optimal-lumped2', deck: '28:10:12', shape: 'normal3', avg: 3, sc, T: 15, cap });
      jobs.push({ mode: 'optimal-lumped', deck: '28:10:12', shape: 'tight', avg: 3.5, sc, T: 15, cap });
    }
  }
  if (a.set === 'normal3opt') { // PREREG normal (= normal3) under the optimal policy
    jobs.length = 0;
    for (const sc of ['P1', 'P8']) for (const d of ['28:10:12', '36:5:5']) for (const mode of ['optimal-lumped2', 'optimal-lumped', 'optimal'])
      jobs.push({ mode, deck: d, shape: 'normal3', avg: 3, sc, T: 15, cap });
    for (const sc of ['P1', 'P8']) jobs.push({ mode: 'lumped2', deck: '36:5:5', shape: 'normal3', avg: 3, sc, T: 15, cap });
    jobs.push({ mode: 'lumped2', deck: '28:10:12', shape: 'normal3', avg: 3, sc: 'P8', T: 15, cap });
    jobs.push({ mode: 'heuristic', deck: '36:5:5', shape: 'normal3', avg: 3, sc: 'P1', T: 15, cap });
  }
  const todo = a.quick ? jobs.slice(0, 4) : jobs;
  const file = a.out || path.join(__dirname, 'measure-results.json');
  const results = [];
  const save = () => fs.writeFileSync(file, JSON.stringify({ generated: new Date().toISOString(), cap, note: 'post = decision states per turn (after the draw); pre = states at turn start; secs = cumulative seconds; runs in parallel lanes so times are indicative', results }, null, 1));
  let next = 0;
  async function lane() {
    while (next < todo.length) {
      const job = todo[next++];
      const t0 = Date.now();
      const r = await new Promise((resolve) => {
        const p = spawn(process.execPath, ['--max-old-space-size=8000', __filename, 'run', JSON.stringify(job)]);
        let buf = '', err = '';
        p.stdout.on('data', d => buf += d); p.stderr.on('data', d => err += d);
        p.on('close', code => { try { resolve(JSON.parse(buf)); } catch (e) { resolve({ ...job, error: (err || 'exit ' + code).slice(-500) }); } });
      });
      if (!r.error) {
        const post = r.post.slice(1);
        r.total10 = post.slice(0, 10).reduce((x, y) => x + y, 0);
        r.total15 = post.slice(0, 15).reduce((x, y) => x + y, 0);
        r.secs10 = r.secs[Math.min(10, r.secs.length - 1)]; r.secs15 = r.secs[r.secs.length - 1];
        if (r.truncated) r.extrapolated = extrapolate(r, 15);
      }
      results.push(r);
      save();
      console.error(`${job.mode} ${job.deck} ${job.shape} ${job.avg} ${job.sc}${job.cmd ? ' cmd' + job.cmd : ''}: ${r.error ? 'ERROR ' + r.error : (r.truncated ? `capped at t=${r.truncated}` + (r.extrapolated.lowerBound ? ' (lower bound only)' : `, est total15 ${r.extrapolated.total15.toExponential(2)}`) : `total15 ${r.total15} in ${r.secs15.toFixed(1)}s`)} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
  }
  await Promise.all(Array.from({ length: par }, lane));
  save();
  console.error('wrote ' + file);
})();
