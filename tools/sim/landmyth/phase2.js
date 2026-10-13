'use strict';
// Land count myth, part 2, phase 2 runner: optimal play and optimal mulligans (opt.js) over the grid.
// Driven by run.js:  node run.js --phase 2 [run|status|report|pack|selftest] [options]
//
// One job per shared graph (shape, spell cost set, lump grouping, commander, scenario):
//   1. a graph worker evaluates part 1's rule on the job's decks with phase 1's code (the baseline,
//      also used by gate a on every cell), then builds the optimal-play graph in shared memory;
//   2. the scheduler grants it solver lanes (threads); each lane solves batches of K decks
//      (backward induction per objective and horizon, optimal mulligans, forward pass) over the one
//      shared graph and sends finished cells back; one fsync'd JSON line per cell in cells-p2.jsonl.
// Memory: a job holds its graph (measured after the build; estimated before it from the measurements
// in README) plus one workspace per lane. Jobs start biggest first while they fit in --max-mem.
// A job too big for the machine is skipped with a message (status and report list it).
const os = require('os');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const M = require('./model');
const Gd = require('./grid');
const O = require('./opt');

const T = 15;
const HS = O.range(3, T);
const ALL_SC = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const GRID = { lands: '20-48', dorks: '0-15', rocks: '0-20', maxramp: 25 };
const SHAPES = ['tight', 'normal3'];
const PASSES = [
  { n: 1, name: 'coarse', shapes: SHAPES, cmds: [4], scens: ['P1', 'P4', 'P8'], avgs: [2.5, 3, 3.5, 4], step: 4, ...GRID, objectives: ['V09', 'N', 'V08', 'V10'] },
  { n: 2, name: 'medium', shapes: SHAPES, cmds: [2, 3, 4, 5, 6, 7], scens: ALL_SC, avgs: [2, 2.5, 3, 3.5, 4, 4.5], step: 2, ...GRID, objectives: ['V09', 'N'] },
];
const DEPTH = 3; // mulligans: 7, 7 (free), 6, then 5 cards always kept (README: depth)
const DELTA = 0.02;
const KEEP_HS = [6, 8, 10, 15];

// ---------------- cells and jobs ----------------
const _curve = new Map();
function curveInfo(shape, S, avg) { // spell costs and lump grouping of a (shape, spells, average), or null
  const k = `${shape}|${S}|${avg}`; if (_curve.has(k)) return _curve.get(k);
  const c = M.spellCounts(shape, S, avg); let r = null;
  if (c) {
    const costs = []; let tot = 0; c.forEach((x, i) => { if (x) { costs.push(i); tot += i * x; } });
    let grp = null;
    if (shape === 'normal3') { const a = tot / S; grp = costs.map(x => (x <= a ? 0 : 1)); if (grp.every(x => x === grp[0])) grp = grp.map(() => 0); }
    r = { costs, grp };
  }
  _curve.set(k, r); return r;
}
const cellId = (shape, L, D, R, avg, cmd, sc, depth) => `${shape}|${L}:${D}:${R}|${avg}|c${cmd}|${sc}|d${depth}`;
function parseId(id) { const [shape, ldr, avg, c, sc, d] = id.split('|'); const [L, D, R] = ldr.split(':').map(Number); return { shape, L, D, R, avg: +avg, cmd: +c.slice(1), sc, depth: +d.slice(1) }; }
function inPass(p, c) { return p.shapes.includes(c.shape) && p.cmds.includes(c.cmd) && p.scens.includes(c.sc) && p.avgs.includes(c.avg) && (c.L - 20) % p.step === 0 && c.D % p.step === 0 && c.R % p.step === 0; }
const jobKey = (shape, info, cmd, sc) => `${shape} ${info.costs.join('-')}${info.grp ? '/g' + info.grp.join('') : ''} c${cmd} ${sc}`;

// Relative size of a ramp-class graph (dorks <= D, rocks <= R) vs the universal one (15 dorks, 20 rocks),
// measured on tight 3.0, P4, commander 4, depth 3, T = 15 (README "Phase 2: graphs per ramp class").
const REL = {
  D: [0, 4, 8, 12, 15], R: [0, 4, 8, 12, 16, 20],
  v: [[0.01, 0.23, 0.53, 0.79, 0.93, 0.97], [0.25, 3.78, 8.71, 12.30, 13.83, 14.11], [0.60, 8.58, 18.25, 24.16, 26.16, 27.0],
    [0.89, 11.95, 24.05, 30.54, 32.6, 32.87], [1.0, 13.5, 27.0, 33.5, 34.3, 34.69]].map(r => r.map(x => x / 34.69)),
};
function relSize(D, R) {
  const f = (a, x) => { let i = 0; while (i < a.length - 2 && x > a[i + 1]) i++; return [i, Math.max(0, Math.min(1, (x - a[i]) / (a[i + 1] - a[i])))]; };
  const [i, u] = f(REL.D, D), [j, w] = f(REL.R, R), v = REL.v;
  return Math.max(2e-4, (1 - u) * ((1 - w) * v[i][j] + w * v[i][j + 1]) + u * ((1 - w) * v[i + 1][j] + w * v[i + 1][j + 1]));
}
// The table is for 1-cost tight; class graphs of 2- and 3-cost curves are relatively bigger (the spell
// dimensions do not shrink with ramp): measured tight 3.5 P1 classes fit relSize^0.55 for mid and large
// classes (0.8 for tiny ones), normal3 P1 at D<=4,R<=4 the same; 1-cost P1 fits ^0.85. Conservative.
const REL_EXP = { t1: 0.85, t2: 0.55, n3: 0.55 };
const MERGE_RATIO = 1.3; // rock counts share one graph while its size is within 30% of the smallest member's

// Jobs of a pass: one per (shape, cost set, lump grouping, commander, scenario, dork count, rock range).
// A deck with D dorks and R rocks never sees more, so its graph only needs dorks <= D and rocks <= R:
// cutting graphs this way makes them several times smaller on average (README). {key, ..., D, Rmin, Rmax, cells, total}
function passJobs(p, done, depth) {
  const base = new Map(); const cs = Gd.comps(p);
  for (const shape of p.shapes) for (const cmd of p.cmds) for (const sc of p.scens) for (const avg of p.avgs) for (const [L, D, R] of cs) {
    const info = curveInfo(shape, M.DECK_SIZE - L - D - R, avg); if (!info) continue;
    const key = jobKey(shape, info, cmd, sc);
    let b = base.get(key);
    if (!b) { b = { key, shape, costs: info.costs, grp: info.grp, cmd, sc, byD: new Map() }; base.set(key, b); }
    if (!b.byD.has(D)) b.byD.set(D, new Map());
    const byR = b.byD.get(D); if (!byR.has(R)) byR.set(R, []);
    byR.get(R).push({ id: cellId(shape, L, D, R, avg, cmd, sc, depth), shape, L, D, R, avg, cmd, sc });
  }
  const jobs = [];
  for (const b of base.values()) for (const [D, byR] of b.byD) {
    const Rs = [...byR.keys()].sort((x, y) => x - y);
    let grp = [];
    const flush = () => {
      if (!grp.length) return;
      const all = grp.flatMap(R => byR.get(R)), Rmin = grp[0], Rmax = grp[grp.length - 1];
      jobs.push({ key: `${b.key} D${D} R${Rmin === Rmax ? Rmax : Rmin + '-' + Rmax}`, shape: b.shape, costs: b.costs, grp: b.grp, cmd: b.cmd, sc: b.sc, D, Rmin, Rmax, total: all.length, cells: done ? all.filter(c => !done.has(c.id)) : all });
      grp = [];
    };
    for (const R of Rs) { if (grp.length && relSize(D, R) / relSize(D, grp[0]) > MERGE_RATIO) flush(); grp.push(R); }
    flush();
  }
  return jobs;
}

// ---------------- memory and time model (measured on the 4-vCPU cloud box, README "Phase 2") ----------------
// Optimal-graph states (all layers) at P1, commander 4, mulligan depth 3, T = 15; P8/P1 ratio; growth
// between them is geometric in the number of extra draws. Depth factors measured on tight 3.0 P1.
const EST = {
  states: { t1: 13.6e6, t2: 182e6, n3: 520e6 },
  p8: { t1: 7.8, t2: 5.6, n3: 5.6 },
  depth: { 1: 0.22, 2: 0.49, 3: 1, 4: 1.64, 5: 2.35 },
  bytesPerState: { t1: 30, t2: 33, n3: 36 },
  layerFrac: [0.21, 0.12], // largest layer / states at P1 and P8
  buildPerState: 2.4e-6, // seconds per state, graph build
  solvePerState: 1.6e-7, // seconds per state per deck and objective (13 horizons, backward + forward), K = 4
  heurPerState: 0.35e-6, // phase 1 baseline: its graph (about 1/7 of the states) plus sweeps
};
function kind(job) { return job.shape === 'normal3' ? 'n3' : job.costs.length >= 2 ? 't2' : 't1'; }
function estimate(job, depth = DEPTH, Tj = T) {
  const k = kind(job), extra = M.SCENARIOS[job.sc].reduce((a, b) => a + b, 0);
  const rel = job.D === undefined ? 1 : Math.pow(relSize(job.D, job.Rmax), REL_EXP[k]);
  // horizons below 15 (selftest only): states grow steeply with T, (T/15)^4 is a rough upper fit
  const states = EST.states[k] * Math.pow(EST.p8[k], extra / 7) * (EST.depth[depth] || 1) * (job.cmd >= 5 ? 1.0 : 1.05) * Math.pow(Math.min(1, Tj / 15), 4) * rel;
  const maxLayer = states * (EST.layerFrac[0] + (EST.layerFrac[1] - EST.layerFrac[0]) * extra / 7);
  const graphGB = states * EST.bytesPerState[k] / 1e9;
  const g = { maxLayer, sumX: 0.45 * states, nOpen: 2000, maxActs: 100 };
  return {
    states, maxLayer, graphGB,
    buildGB: graphGB + 64 * maxLayer / 1e9 + 0.3,
    laneGB: K => O.workspaceBytes(g, K) / 1e9 + 0.15,
    buildSecs: states * (EST.buildPerState + EST.heurPerState),
    deckSecs: states * EST.solvePerState, // per deck and objective
  };
}

// ---------------- files ----------------
function files(out) {
  return { cells: path.join(out, 'cells-p2.jsonl'), tasks: path.join(out, 'tasks-p2.jsonl'), report: path.join(out, 'report-p2.md'), gz: path.join(out, 'cells-p2.jsonl.gz'), skipped: path.join(out, 'skipped-p2.json') };
}
const r7 = x => (x === null || x === undefined ? null : +x.toPrecision(8)); // 8 significant digits, as phase 1
const r4 = x => (x === null || x === undefined ? null : +x.toFixed(4));

// One cell's record from solveDecks output (opt: {objective: summary}) and the heuristic block.
function record(c, deck, opt, depth, Hs) {
  const rec = { id: c.id, shape: c.shape, L: c.L, D: c.D, R: c.R, avg: c.avg, realAvg: +deck.avg.toFixed(4), cmd: c.cmd, sc: c.sc, depth, method: c.shape === 'normal3' ? 'optimal-lump-hand-g2' : 'optimal-exact', H: Hs };
  for (const ok in opt) {
    const o = opt[ok], b = {};
    const full = ok === 'V09' || ok === 'N';
    for (const k of (full ? ['value', 'vP1Mull', 'V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn'] : ['value', 'vP1Mull', 'V09', 'V10', 'N'])) b[k] = o[k].map(r7);
    b.keep7 = o.stageP.map(s => r4(s[0]));
    b.mulls = o.stageP.map(s => r4(s.reduce((a, p, m) => a + m * p, 0)));
    if (full) {
      b.size = o.stageP.map(s => r4(s.reduce((a, p, m) => a + p * (m <= 1 ? 7 : 8 - m), 0)));
      b.depthV = o.valueAtDepth.map(v => v.map(r7)); // value with the forced keep at depth 2..depth
      b.keep = {}; for (const H in o.keep) b.keep[H] = o.keep[H].map(a => a.map(r4)); // P(keep | lands in the 7), first hand and after the free mulligan
    }
    rec[ok] = b;
  }
  return rec;
}

// the universal deck of a job: dorks and rocks capped at the job's ramp class
function classDeck(job) {
  const u = Gd.universalDeck(job.costs, job.cmd, job.grp);
  if (job.D !== undefined) { u.K = u.K.slice(); u.K[1] = job.D; u.K[2] = job.Rmax; }
  return u;
}

// ---------------- workers ----------------
if (!isMainThread && workerData && workerData.role === 'graph') {
  const { job, depth, objectives, T } = workerData;
  const HS = O.range(3, T);
  const post = m => parentPort.postMessage(m);
  const t0 = Date.now();
  const univ = classDeck(job);
  const extra = M.SCENARIOS[job.sc];
  const decks = new Map(job.cells.map(c => [c.id, Gd.deckFor(c)]));
  // 1. part 1 baseline with phase 1's code
  const hb = O.heuristicBaseline(univ, extra, T, [...decks.values()], HS);
  const heur = new Map();
  job.cells.forEach((c, i) => { const h = hb.results[i], o = {}; for (const k of ['V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn']) o[k] = h[k].map(r7); heur.set(c.id, o); });
  const heurSecs = (Date.now() - t0) / 1000;
  post({ type: 'stage', stage: 'baseline done', heurSecs });
  // 2. the optimal-play graph, in shared memory
  let lastP = 0;
  const g = O.buildOptGraph(univ, extra, T, depth, { shared: true, progress: p => { if (Date.now() - lastP > 5000) { lastP = Date.now(); post({ type: 'progress', t: p.t, states: p.states }); } } });
  post({ type: 'built', states: g.states, edges: g.edges, bytes: g.bytes, maxLayer: g.maxLayer, sumX: g.sumX, nOpen: g.nOpen, maxActs: g.maxActs, buildSecs: g.buildSecs, heurSecs });
  // 3. lanes
  const queue = job.cells.slice().sort((a, b) => (a.D - b.D) || (a.R - b.R) || (a.L - b.L) || (a.avg - b.avg));
  let lanes = 0, laneSecs = 0, K = 1;
  const dispatch = w => {
    const batch = queue.splice(0, K);
    if (batch.length) { w.postMessage({ cells: batch }); post({ type: 'pending', pending: queue.length }); } else w.postMessage({ stop: true });
  };
  parentPort.on('message', m => {
    if (!m.grant) return;
    K = m.K; lanes++;
    const w = new Worker(__filename, { workerData: { role: 'lane', g, K, objectives, depth, T } });
    w.on('message', r => {
      if (r.type === 'result') {
        laneSecs += r.secs;
        for (const rec of r.recs) { rec.heur = heur.get(rec.id); post({ type: 'cell', rec }); }
      }
      dispatch(w);
    });
    w.on('error', e => post({ type: 'error', message: String(e && e.stack || e) }));
    w.on('exit', () => {
      lanes--; post({ type: 'laneDone' });
      if (!lanes && !queue.length) { post({ type: 'done', laneSecs, wall: (Date.now() - t0) / 1000 }); process.exit(0); }
    });
  });
  return;
}
if (!isMainThread && workerData && workerData.role === 'lane') {
  const { g, K, objectives, depth, T } = workerData;
  const HS = O.range(3, T);
  const ws = O.workspace(g, K);
  parentPort.on('message', m => {
    if (m.stop) process.exit(0);
    const t0 = Date.now();
    const decks = m.cells.map(c => Gd.deckFor(c));
    const r = O.solveDecks(g, decks, { objectives, depth, Hs: HS, keepHs: KEEP_HS, ws });
    parentPort.postMessage({ type: 'result', secs: (Date.now() - t0) / 1000, recs: m.cells.map((c, k) => record(c, decks[k], r.results[k].opt, depth, HS)) });
  });
  parentPort.postMessage({ type: 'ready' });
  return;
}

// ---------------- scheduler ----------------
// jobs: from passJobs (with cells left). opts: {outFile, taskFile, workers, memGB, depth, objectives, log, onCell, onSkip}
function schedule(jobs, opts) {
  const { workers, memGB, depth } = opts, Tj = opts.T || T;
  const totalGB = os.totalmem() / 1e9;
  const queue = jobs.filter(j => j.cells.length).map(j => Object.assign(j, { est: estimate(j, depth, Tj) })).sort((a, b) => b.est.states - a.est.states);
  const fd = fs.openSync(opts.outFile, 'a'), tfd = fs.openSync(opts.taskFile, 'a');
  const active = new Set();
  let failed = null, written = 0;
  const memUsed = () => { let m = 0; for (const j of active) m += j.memGB + j.lanes * (j.laneGB || 0); return m; };
  const threadsUsed = () => { let t = 0; for (const j of active) t += (j.phase === 'building' ? 1 : 0) + j.lanes; return t; };
  return new Promise((resolve, reject) => {
    const finish = () => { fs.closeSync(fd); fs.closeSync(tfd); if (failed) reject(failed); else resolve(written); };
    const start = job => {
      job.phase = 'building'; job.memGB = job.est.buildGB; job.lanes = 0; job.unready = 0; job.pending = job.cells.length; job.t0 = Date.now(); job.done = 0;
      active.add(job);
      const w = new Worker(__filename, { workerData: { role: 'graph', job: { key: job.key, shape: job.shape, costs: job.costs, grp: job.grp, cmd: job.cmd, sc: job.sc, cells: job.cells, D: job.D, Rmax: job.Rmax }, depth, objectives: opts.objectives, T: Tj } });
      job.w = w;
      w.on('message', m => {
        if (m.type === 'progress') { job.progress = m; }
        else if (m.type === 'stage') { job.heurSecs = m.heurSecs; }
        else if (m.type === 'built') {
          job.phase = 'solving'; job.built = m;
          job.memGB = m.bytes / 1e9 + 0.3;
          if (opts.log) opts.log(`graph ${job.key}: ${(m.states / 1e6).toFixed(0)}M states, ${(m.bytes / 1e9).toFixed(1)} GB, built in ${Math.round(m.buildSecs)} s; ${job.cells.length} decks`);
        } else if (m.type === 'pending') { job.pending = m.pending; job.unready = Math.max(0, job.unready - 1); }
        else if (m.type === 'cell') {
          fs.writeSync(fd, JSON.stringify(m.rec) + '\n'); fs.fsyncSync(fd); written++; job.done++;
          if (opts.onCell) opts.onCell(m.rec);
        } else if (m.type === 'laneDone') { job.lanes--; }
        else if (m.type === 'done') {
          job.finished = true;
          const b = job.built || {};
          fs.writeSync(tfd, JSON.stringify({ key: job.key, kind: kind(job), cmd: job.cmd, sc: job.sc, depth, cells: job.cells.length, states: b.states, edges: b.edges, graphGB: +(b.bytes / 1e9).toFixed(2), maxLayer: b.maxLayer, buildSecs: b.buildSecs, heurSecs: job.heurSecs, laneSecs: +m.laneSecs.toFixed(1), K: job.K, wall: +m.wall.toFixed(1), objectives: opts.objectives.length, estStates: Math.round(job.est.states), estBuildSecs: Math.round(job.est.buildSecs), estDeckSecs: +job.est.deckSecs.toFixed(2), cpus: os.cpus().length, at: new Date().toISOString() }) + '\n');
          fs.fsyncSync(tfd);
        } else if (m.type === 'error') { if (!failed) failed = new Error(m.message); }
        pump();
      });
      w.on('error', e => { if (!failed) failed = e; });
      w.on('exit', code => {
        active.delete(job);
        if (!job.finished && !failed) failed = new Error(`job ${job.key} stopped (exit code ${code}); rerun the same command to resume`);
        if (failed) for (const j of active) j.w.terminate();
        pump();
      });
    };
    const pump = () => {
      if (failed) { if (!active.size) finish(); return; }
      // 1. lanes for built graphs, oldest job first
      for (const j of [...active].sort((a, b) => a.t0 - b.t0)) {
        if (j.phase !== 'solving') continue;
        if (!j.K) { // batch size: 4 decks per lane if memory allows a lane per free thread, else fewer
          const free = memGB - memUsed(), want = Math.max(1, Math.min(workers - threadsUsed(), Math.ceil(j.pending / 4)));
          j.K = [4, 2, 1].find(K => K <= Math.max(1, j.pending) && laneGB(j, K) * want <= free) || 1;
          j.laneGB = laneGB(j, j.K);
        }
        while (threadsUsed() < workers && j.pending - j.unready * j.K > 0) {
          if (j.laneGB > memGB - memUsed() && j.lanes > 0) break;
          if (j.laneGB > memGB - memUsed() && j.lanes === 0 && active.size > 1) break; // wait for memory
          j.lanes++; j.unready++; j.w.postMessage({ grant: true, K: j.K });
        }
      }
      // 2. new graphs, biggest first, while they fit (with one lane)
      while (threadsUsed() < workers && queue.length) {
        const free = memGB - memUsed();
        let k = queue.findIndex(j => Math.max(j.est.buildGB, j.est.graphGB + j.est.laneGB(1)) <= free);
        if (k < 0) {
          if (active.size) break;
          const j = queue[0], need = Math.max(j.est.buildGB, j.est.graphGB + j.est.laneGB(1));
          if (need > 0.92 * totalGB) { queue.shift(); if (opts.onSkip) opts.onSkip(j, need); continue; }
          k = 0; // run the biggest alone, above the budget but within the machine
        }
        start(queue.splice(k, 1)[0]);
      }
      if (!queue.length && !active.size) finish();
    };
    const laneGB = (j, K) => O.workspaceBytes(j.built, K) / 1e9 + 0.15;
    opts.status = () => [...active].map(j => j.phase === 'building' ? `building ${j.key}${j.progress ? ` (turn ${j.progress.t}, ${(j.progress.states / 1e6).toFixed(0)}M states)` : ''}` : `${j.key}: ${j.lanes} lanes, ${j.done}/${j.cells.length}`).join('; ');
    opts.usage = () => ({ threads: threadsUsed(), mem: memUsed() });
    pump();
  });
}

// ---------------- calibration and time left ----------------
function calibration(taskFile) {
  // per graph kind (t1/t2/n3): small one-cost graphs build faster per state than big ones, so one
  // kind's ratio is not applied to another; kinds with no finished graph keep the built-in model
  const acc = {};
  Gd.forEachLine(taskFile, line => { try { const r = JSON.parse(line); if (!r.estBuildSecs) return; const a = acc[r.kind || 'all'] || (acc[r.kind || 'all'] = { eb: 0, ab: 0, es: 0, as: 0, n: 0 }); a.eb += r.estBuildSecs; a.ab += r.buildSecs + (r.heurSecs || 0); a.es += r.estDeckSecs * r.cells * r.objectives; a.as += r.laneSecs; a.n++; } catch (e) { /* torn */ } });
  const by = {}; let tasks = 0;
  for (const k in acc) { const a = acc[k]; tasks += a.n; by[k] = { build: a.eb ? a.ab / a.eb : 1, solve: a.es ? a.as / a.es : 1, tasks: a.n }; }
  const of = k => by[k] || by.all || { build: 1, solve: 1, tasks: 0 };
  const txt = Object.keys(by).sort().map(k => `${k}: build x${by[k].build.toFixed(2)}, solve x${by[k].solve.toFixed(2)} (${by[k].tasks})`).join('; ');
  return { of, tasks, txt };
}
function remaining(p, done, cal, workers, memGB, depth, ramGB = os.totalmem() / 1e9) {
  let core = 0, wall = 0, cells = 0; const tooBig = [];
  const totalGB = ramGB;
  for (const j of passJobs(p, done, depth)) {
    const n = j.cells.length; if (!n) continue;
    const e = estimate(j, depth);
    const c = cal.of(kind(j)), build = e.buildSecs * c.build, solve = n * p.objectives.length * e.deckSecs * c.solve;
    if (Math.max(e.buildGB, e.graphGB + e.laneGB(1)) > 0.92 * totalGB) { tooBig.push(j.key); continue; }
    // threads that can work on this job: lanes limited by memory (graph shared by its lanes)
    const lanes = Math.max(1, Math.min(workers, Math.ceil(n / 4), Math.floor((memGB - e.graphGB) / e.laneGB(1))));
    const share = Math.max(1, Math.floor(memGB / (e.graphGB + lanes * e.laneGB(1)))) * lanes; // copies of such jobs at once
    core += build + solve; cells += n;
    wall += build / Math.min(workers, Math.max(1, Math.floor(memGB / e.buildGB))) + solve / Math.min(workers, share);
  }
  return { cells, core, wall, tooBig };
}



// ---------------- report ----------------
const TS = [6, 8, 10, 15];
const REP_DECKS = ['36:4:4', '40:0:0', '32:8:8', '28:12:8'];
function loadCells(file, Hs) {
  const ctx = new Map(); let n = 0; const reps = [];
  let gate = { checks: 0, fails: 0, worst: Infinity, worstAt: '' };
  const depthGain = { V: TS.map(() => []), N: TS.map(() => []) };
  const sens = [];
  Gd.forEachLine(file, line => {
    let r; try { r = JSON.parse(line); } catch (e) { return; }
    if (!r.V09 || !r.N || !r.heur) return;
    const k = `${r.shape}|${r.avg}|${r.cmd}|${r.sc}`;
    let c = ctx.get(k);
    if (!c) { c = { shape: r.shape, avg: r.avg, cmd: r.cmd, sc: r.sc, ids: new Map(), comp: [], m: { oV: [], oN: [], hV: [], hN: [], pV: [], pN: [], s8: [], s10: [] } }; ctx.set(k, c); }
    const key = `${r.L}:${r.D}:${r.R}`; if (c.ids.has(key)) return;
    const hi = r.H.indexOf(3), sl = a => Float32Array.from(a.slice(hi, hi + Hs.length));
    c.ids.set(key, c.comp.length); c.comp.push([r.L, r.D, r.R]);
    c.m.oV.push(sl(r.V09.value)); c.m.oN.push(sl(r.N.value)); c.m.hV.push(sl(r.heur.V09)); c.m.hN.push(sl(r.heur.N));
    c.m.pV.push(sl(r.V09.vP1Mull)); c.m.pN.push(sl(r.N.vP1Mull));
    if (r.V08 && r.V10) { c.m.s8.push(sl(r.V08.value)); c.m.s10.push(sl(r.V10.value)); }
    // gate a on every cell, horizon and objective: optimal >= part 1 rule (8 stored digits, so 1e-6 relative)
    // also: optimal play with part 1's mulligans >= part 1 rule, and the full optimum >= that
    for (const [o, h] of [[r.V09.value, r.heur.V09], [r.N.value, r.heur.N], [r.V09.vP1Mull, r.heur.V09], [r.N.vP1Mull, r.heur.N], [r.V09.value, r.V09.vP1Mull], [r.N.value, r.N.vP1Mull]]) for (let i = 0; i < o.length; i++) {
      gate.checks++; const d = o[i] - h[i];
      if (d < gate.worst) { gate.worst = d; gate.worstAt = `${r.id} H=${r.H[i]}`; }
      if (d < -1e-6 * Math.max(1, Math.abs(h[i]))) gate.fails++;
    }
    TS.forEach((t, ti) => { const i = r.H.indexOf(t); if (i < 0) return; for (const [nm, b] of [['V', r.V09], ['N', r.N]]) { const dv = b.depthV[i]; depthGain[nm][ti].push((dv[dv.length - 1] - dv[0]) / dv[dv.length - 1]); } });
    if (REP_DECKS.includes(key) && (r.avg === 3 || r.avg === 3.5) && r.cmd === 4 && (r.sc === 'P1' || r.sc === 'P8')) reps.push({ key, shape: r.shape, avg: r.avg, sc: r.sc, H: r.H, V: r.V09, N: r.N, heur: r.heur });
    n++;
  });
  return { ctx, n, gate, depthGain, reps };
}

function report(ctx0, quiet) {
  const F = files(ctx0.OUT), depth = DEPTH;
  const done = Gd.readDone(F.cells, false);
  const Hs = HS, ti = t => t - 3;
  const { ctx, n, gate, depthGain, reps } = loadCells(F.cells, Hs);
  const L = [], p = x => L.push(x);
  const pct = x => (isFinite(x) ? (100 * x).toFixed(1) + '%' : '');
  const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : NaN; };
  const ctxs = [...ctx.values()].filter(c => c.comp.length >= 8);
  const uniq = (f, arr = ctxs) => [...new Set(arr.map(f))].sort((x, y) => (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'en', { numeric: true })));
  const arrOf = (c, which) => c.m[which];
  const region = (c, which, t) => {
    const arr = arrOf(c, which); let b = -Infinity, bi = -1;
    for (let i = 0; i < arr.length; i++) if (arr[i][ti(t)] > b) { b = arr[i][ti(t)]; bi = i; }
    const thr = b * (1 - DELTA); let lo = 99, hi = 0;
    for (let i = 0; i < arr.length; i++) if (arr[i][ti(t)] >= thr) { lo = Math.min(lo, c.comp[i][0]); hi = Math.max(hi, c.comp[i][0]); }
    return { b, bi, lo, hi, thr };
  };
  const fmt = (c, r) => `${c.comp[r.bi].join(':')} (${r.lo}-${r.hi})`;

  p('# Land count myth, part 2, phase 2: optimal play and optimal mulligans (preliminary)');
  p('');
  p(`PRELIMINARY. Generated ${new Date().toISOString()} from ${n} cells. Every deck is played by the exactly optimal policy (backward induction; one policy per horizon T and per objective) ` +
    `with optimal keep/mulligan decisions (first mulligan free, then London, down to ${8 - depth} cards, best cards bottomed). Tight curve: exact library. Normal curve (normal3): lump-hand-g2 library. ` +
    'Each cell also carries part 1\'s rule on the same deck ("heuristic", phase 1 code). V = discounted useful mana (0.9) under the V-optimal policy; N = useful spells cast by T under the N-optimal policy. ' +
    '"Near-optimal" = within 2% of the best deck in the same curve, average, commander and scenario (PREREG δ).');
  p('');
  p('| pass | grid | cells done | of | coverage |'); p('|---|---|---|---|---|');
  for (const { p: q, total, done: d } of passTotals(done, depth)) p(`| ${q.n} | ${q.name}: step ${q.step}, avgs ${q.avgs.join('/')}, commanders ${q.cmds.join(',')}, ${q.scens.join(',')} | ${d} | ${total} | ${(100 * d / total).toFixed(1)}% |`);
  const sk = Object.keys(readSkipped(F.skipped)); if (sk.length) { p(''); p(`Graphs skipped as too big for the machine that ran them (their cells are missing): ${sk.join(', ')}.`); }
  p('');
  p('## 0. Gate a on every cell');
  p('');
  p(`Optimal value >= optimal play with part 1's mulligans >= part 1 rule's value, for every cell, horizon T = 3..15 and objective (V, N): ${gate.fails ? 'FAIL' : 'PASS'}, ${gate.checks} checks, ${gate.fails} below (tolerance 1e-6 relative: 8 stored digits); smallest margin ${gate.worst.toPrecision(3)} at ${gate.worstAt}.`);
  p('');

  // 1. gain
  p('## 1. How much optimal play and mulligans add');
  p('');
  p('Relative gain of the optimum over part 1\'s rule, over every deck and context computed: median (90th percentile, max). "Mulligans" = share of the gain that comes from optimal mulligans: (optimum - optimal play with part 1\'s mulligans) / (optimum - part 1).');
  p('');
  p('| curve | metric | T | decks | gain median | p90 | max | share from mulligans (median) |'); p('|---|---|---|---|---|---|---|---|');
  for (const shape of uniq(c => c.shape)) for (const [nm, o, h, pm] of [['V', 'oV', 'hV', 'pV'], ['N', 'oN', 'hN', 'pN']]) for (const t of TS) {
    const g = [], sh = [];
    for (const c of ctxs.filter(x => x.shape === shape)) for (let i = 0; i < c.comp.length; i++) {
      const ov = c.m[o][i][ti(t)], hv = c.m[h][i][ti(t)], pv = c.m[pm][i][ti(t)];
      if (hv > 0) g.push((ov - hv) / hv); if (ov - hv > 1e-9) sh.push((ov - pv) / (ov - hv));
    }
    if (!g.length) continue;
    const s = [...g].sort((a, b) => a - b);
    p(`| ${shape} | ${nm} | ${t} | ${g.length} | ${pct(med(g))} | ${pct(s[Math.floor(0.9 * (s.length - 1))])} | ${pct(s[s.length - 1])} | ${pct(med(sh))} |`);
  }
  p('');

  // 2. best deck and range, optimal vs heuristic
  p('## 2. Best deck and near-optimal land range: optimal play vs part 1\'s rule');
  p('');
  p('Each cell: optimal play\'s best lands:dorks:rocks and the land counts among near-optimal decks (lo-hi), then the same under part 1\'s rule after the arrow. Commander 4 (or the most common one present).');
  for (const shape of uniq(c => c.shape)) {
    const cs = ctxs.filter(c => c.shape === shape); const cmdN = uniq(c => c.cmd, cs); const cmd = cmdN.includes(4) ? 4 : cmdN[0];
    for (const [nm, o, h] of [['V (useful mana, 0.9)', 'oV', 'hV'], ['N (useful spells cast)', 'oN', 'hN']]) for (const t of TS) {
      const scs = uniq(c => c.sc, cs.filter(c => c.cmd === cmd)), avgs = uniq(c => c.avg, cs.filter(c => c.cmd === cmd));
      p(''); p(`### ${shape}, ${nm}, T = ${t}, commander ${cmd}`); p('');
      p(`| avg cost | ${scs.join(' | ')} |`); p(`|---|${scs.map(() => '---').join('|')}|`);
      for (const avg of avgs) p(`| ${avg} | ${scs.map(sc => { const c = ctx.get(`${shape}|${avg}|${cmd}|${sc}`); if (!c || c.comp.length < 8) return ''; return `${fmt(c, region(c, o, t))} ← ${fmt(c, region(c, h, t))}`; }).join(' | ')} |`);
    }
  }
  p('');

  // 3. necessity of 36-40, optimal vs heuristic
  p('## 3. Is 36-40 lands necessary? Optimal play vs part 1\'s rule');
  p('');
  p('PREREG reading: refuted for a context when a deck with lands outside 36-40 scores within δ of the best deck inside 36-40. Counts over every computed (curve average, commander, draw scenario) at each T.');
  p('');
  p('| curve | metric | T | contexts | refuted (optimal) | below 36 / above 40 | fewest lands near-optimal, median (min) | refuted (part 1 rule) | fewest lands, part 1 rule |'); p('|---|---|---|---|---|---|---|---|---|');
  const necessity = (cs, which, t) => {
    let k = 0, ref = 0, below = 0, above = 0; const fl = [];
    for (const c of cs) {
      const arr = arrOf(c, which); let bIn = -1, bAll = -1;
      for (let i = 0; i < arr.length; i++) { const x = arr[i][ti(t)], Lc = c.comp[i][0]; bAll = Math.max(bAll, x); if (Lc >= 36 && Lc <= 40) bIn = Math.max(bIn, x); }
      if (bIn < 0) continue; k++;
      const thr = bIn - DELTA * bAll; let lo = false, hi = false;
      for (let i = 0; i < arr.length; i++) if (arr[i][ti(t)] >= thr) { if (c.comp[i][0] < 36) lo = true; if (c.comp[i][0] > 40) hi = true; }
      if (lo || hi) ref++; if (lo) below++; if (hi) above++;
      fl.push(region(c, which, t).lo);
    }
    return { k, ref, below, above, fl };
  };
  for (const shape of uniq(c => c.shape)) for (const [nm, o, h] of [['V', 'oV', 'hV'], ['N', 'oN', 'hN']]) for (const t of TS) {
    const cs = ctxs.filter(x => x.shape === shape), a = necessity(cs, o, t), b = necessity(cs, h, t);
    if (a.k) p(`| ${shape} | ${nm} | ${t} | ${a.k} | ${a.ref} | ${a.below} / ${a.above} | ${med(a.fl)} (${Math.min(...a.fl)}) | ${b.ref} | ${med(b.fl)} (${Math.min(...b.fl)}) |`);
  }
  p('');

  // 4. composition shift
  p('## 4. Does optimal play move the best deck?');
  p('');
  p('Mean lands / dorks / rocks of the best deck per context, part 1\'s rule vs optimal play, and the share of contexts where the best deck changes.');
  p('');
  p('| curve | metric | T | contexts | part 1: L / D / R | optimal: L / D / R | best deck changed |'); p('|---|---|---|---|---|---|---|');
  for (const shape of uniq(c => c.shape)) for (const [nm, o, h] of [['V', 'oV', 'hV'], ['N', 'oN', 'hN']]) for (const t of TS) {
    const cs = ctxs.filter(x => x.shape === shape); if (!cs.length) continue;
    const sum = (which) => { const s = [0, 0, 0]; for (const c of cs) { const r = region(c, which, t); c.comp[r.bi].forEach((v, i) => { s[i] += v / cs.length; }); } return s.map(x => x.toFixed(1)).join(' / '); };
    let ch = 0; for (const c of cs) if (region(c, o, t).bi !== region(c, h, t).bi) ch++;
    p(`| ${shape} | ${nm} | ${t} | ${cs.length} | ${sum(h)} | ${sum(o)} | ${pct(ch / cs.length)} |`);
  }
  p('');

  // 5. mulligans
  p('## 5. Optimal mulligans');
  p('');
  p(`Representative decks (commander 4). "keep by lands" = P(keep the first 7-card hand | lands in it = 0..7); after the free mulligan the second 7 is kept more often (its alternative is a 6-card hand). V-optimal policy unless marked N.`);
  p('');
  p('| deck | curve | scenario | T | objective | P(keep first 7) | mulligans (mean) | kept size (mean) | keep by lands 0..7, first hand | keep by lands, after the free mulligan |'); p('|---|---|---|---|---|---|---|---|---|---|');
  for (const r of reps.sort((a, b) => a.shape.localeCompare(b.shape) || a.avg - b.avg || a.sc.localeCompare(b.sc) || a.key.localeCompare(b.key))) for (const t of [6, 10, 15]) for (const [nm, b] of [['V', r.V], ['N', r.N]]) {
    const i = r.H.indexOf(t); if (i < 0 || !b.keep || !b.keep[t]) continue;
    const f = a => a.map(x => (x === null ? '-' : x.toFixed(2))).join(' ');
    p(`| ${r.key} | ${r.shape} ${r.avg} | ${r.sc} | ${t} | ${nm} | ${b.keep7[i].toFixed(3)} | ${b.mulls[i].toFixed(2)} | ${b.size[i].toFixed(2)} | ${f(b.keep[t][0])} | ${f(b.keep[t][1])} |`);
  }
  p('');
  p(`### Mulligan depth`);
  p('');
  p(`Gain in optimal value from allowing mulligans down to ${8 - depth} cards instead of forcing the keep at 6 (part 1's depth): median (max) over all cells.`);
  p('');
  p('| metric | ' + TS.map(t => `T = ${t}`).join(' | ') + ' |'); p('|---|' + TS.map(() => '---').join('|') + '|');
  for (const nm of ['V', 'N']) p(`| ${nm} | ${depthGain[nm].map(a => a.length ? `${pct(med(a))} (${pct(Math.max(...a))})` : '').join(' | ')} |`);
  p('');

  // 6. discount sensitivity
  const sc = ctxs.filter(c => c.m.s8.length === c.comp.length && c.comp.length);
  p('## 6. Discount sensitivity (cells with the 0.8 and 1.0 solves, pass 1)');
  p('');
  if (!sc.length) p('No cells with the sensitivity solves yet.');
  else {
    p('Best deck (near-optimal land range) when the policy and the ranking use discount 0.8, 0.9 and 1.0. Commander 4.');
    for (const shape of uniq(c => c.shape, sc)) for (const t of [10, 15]) {
      const scs = uniq(c => c.sc, sc.filter(c => c.shape === shape)), avgs = uniq(c => c.avg, sc.filter(c => c.shape === shape));
      p(''); p(`### ${shape}, T = ${t}: 0.8 / 0.9 / 1.0`); p('');
      p(`| avg cost | ${scs.join(' | ')} |`); p(`|---|${scs.map(() => '---').join('|')}|`);
      for (const avg of avgs) p(`| ${avg} | ${scs.map(s => { const c = ctx.get(`${shape}|${avg}|4|${s}`); if (!c || c.m.s8.length !== c.comp.length) return ''; return ['s8', 'oV', 's10'].map(w => fmt(c, region(c, w, t))).join(' / '); }).join(' | ')} |`);
    }
  }
  p('');
  p('Tables are computed from whatever cells exist; rerun `node run.js --phase 2 report` after more passes. Raw numbers: cells-p2.jsonl (one JSON line per deck and context; every T = 3..15; see README "Phase 2" for the fields).');
  fs.writeFileSync(F.report, L.join('\n') + '\n');
  if (!quiet) return F.report;
  return F.report;
}

// ---------------- CLI (main thread), called from run.js --phase 2 ----------------
const hms = s => { if (!isFinite(s)) return '?'; s = Math.max(0, Math.round(s)); const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60); return d ? `${d} d ${h} h` : h ? `${h} h ${String(m).padStart(2, '0')} min` : m ? `${m} min` : `${s} s`; };
function passTotals(done, depth) {
  return PASSES.map(p => {
    let total = 0; for (const j of passJobs(p, null, depth)) total += j.total;
    let d = 0; for (const id of done) { const c = parseId(id); if (c.depth === depth && inPass(p, c)) d++; }
    return { p, total, done: d };
  });
}
function readSkipped(f) { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return {}; } }

// optional slice of a pass: --shapes tight --scens P1,P4 --cmds 4 --avgs 3,3.5 (intersected with the pass)
function restrict(p, A) {
  const f = (k, conv) => (A[k] ? String(A[k]).split(',').map(conv) : null);
  const q = Object.assign({}, p);
  for (const [k, key, conv] of [['shapes', 'shapes', String], ['scens', 'scens', String], ['cmds', 'cmds', Number], ['avgs', 'avgs', Number]]) { const v = f(k, conv); if (v) q[key] = p[key].filter(x => v.includes(x)); }
  return q;
}

async function run(A, ctx) {
  const F = files(ctx.OUT), depth = +(A.depth || DEPTH);
  fs.mkdirSync(ctx.OUT, { recursive: true });
  const done = Gd.readDone(F.cells);
  const last = +(A.pass || 1); // pass 2 only when asked: as specified it is far beyond one machine (see PREREG-proposed-changes.md)
  console.log(`Phase 2 (optimal play and mulligans, mulligan depth ${depth}). Results: ${F.cells}\n${done.size} cells already done. Using up to ${ctx.WORKERS} threads within ~${ctx.MEM} GB of memory.`);
  console.log('Stop any time with Ctrl-C (or sleep, or a crash); run the same command again to resume.\n');
  process.on('SIGINT', () => { console.log('\n\nStopped. Every finished cell is saved; run the same command to resume.'); process.exit(130); });
  const skipped = readSkipped(F.skipped);
  for (const p of PASSES.filter(q => q.n <= last).map(q => restrict(q, A))) {
    const cal = calibration(F.tasks), rem = remaining(p, done, cal, ctx.WORKERS, ctx.MEM, depth);
    const jobs = passJobs(p, done, depth).filter(j => j.cells.length);
    if (!jobs.length) { console.log(`Pass ${p.n} (${p.name}): already complete.`); continue; }
    console.log(`Pass ${p.n} (${p.name}): ${rem.cells} cells in ${jobs.length} graphs, about ${hms(rem.wall)} on this machine${cal.tasks ? '' : ' (first guess from the measurements; improves as graphs finish)'}.`);
    if (rem.tooBig.length) console.log(`  ${rem.tooBig.length} graphs are too big for this machine's memory and will be skipped: ${rem.tooBig.slice(0, 4).join(', ')}${rem.tooBig.length > 4 ? ', ...' : ''}`);
    const t0 = Date.now(); let n = 0, lastPrint = 0;
    const opts = {
      outFile: F.cells, taskFile: F.tasks, workers: ctx.WORKERS, memGB: ctx.MEM, depth, objectives: p.objectives,
      log: x => { if (A.verbose) process.stdout.write(`\n  ${x}\n`); },
      onCell: rec => { n++; done.add(rec.id); },
      onSkip: (j, need) => { skipped[j.key] = { need: +need.toFixed(1), cells: j.cells.length, at: new Date().toISOString() }; fs.writeFileSync(F.skipped, JSON.stringify(skipped, null, 1)); console.log(`\n  skipped ${j.key}: needs about ${need.toFixed(0)} GB, more than this machine has`); },
    };
    const beat = setInterval(() => {
      const now = Date.now(); if (now - lastPrint < 10000) return; lastPrint = now;
      const el = (now - t0) / 1000, frac = n / Math.max(1, rem.cells);
      const eta = frac > 0.05 ? el * (1 - frac) / frac : rem.wall - el;
      const u = opts.usage ? opts.usage() : { threads: 0, mem: 0 };
      process.stdout.write(`\r  pass ${p.n}: ${n}/${rem.cells} cells, ${hms(el)} elapsed, about ${hms(eta)} left; ${u.threads} threads, ~${u.mem.toFixed(0)} GB${n ? '' : ' (building the first game graphs)'}        `);
      if (A.verbose && opts.status) process.stdout.write(`\n    ${opts.status()}\n`);
    }, 2000);
    try { await schedule(jobs, opts); } finally { clearInterval(beat); }
    console.log(`\nPass ${p.n} done in ${hms((Date.now() - t0) / 1000)}.`);
    console.log(`Preliminary report written: ${report(ctx, true)}\n`);
  }
  console.log('All requested phase 2 passes are complete.');
}

function status(A, ctx) {
  const F = files(ctx.OUT), depth = +(A.depth || DEPTH);
  const done = Gd.readDone(F.cells, false), cal = calibration(F.tasks), skipped = readSkipped(F.skipped);
  if (!fs.existsSync(F.cells)) console.log(`No phase 2 results yet in ${ctx.OUT}. Start with: node run.js --phase 2`);
  else { const st = fs.statSync(F.cells); console.log(`Results: ${F.cells} (${(st.size / 1e6).toFixed(1)} MB, last write ${st.mtime.toLocaleString()})`); }
  console.log(`${done.size} phase 2 cells done (mulligan depth ${depth}). Time estimates assume ${ctx.WORKERS} threads within ${ctx.MEM} GB${cal.tasks ? `, calibrated on ${cal.tasks} finished graphs vs the built-in model (${cal.txt})` : ' (not calibrated yet)'}.\n`);
  let cum = 0;
  for (const { p, total, done: d } of passTotals(done, depth)) {
    const rem = remaining(p, done, cal, ctx.WORKERS, ctx.MEM, depth, A.ram ? +A.ram : undefined); cum += rem.wall;
    console.log(`Pass ${p.n} (${p.name.padEnd(6)}): ${String(d).padStart(8)} / ${String(total).padEnd(8)} cells (${(100 * d / total).toFixed(1).padStart(5)}%)` +
      (rem.cells ? `   about ${hms(rem.wall)} of work left (${hms(rem.core)} of single-thread work), complete in about ${hms(cum)}` : rem.tooBig.length ? '' : '   complete') +
      (rem.tooBig.length ? `   ${rem.tooBig.length} graphs too big for this machine` : ''));
  }
  const sk = Object.keys(skipped); if (sk.length) console.log(`\nSkipped as too big for this machine: ${sk.join(', ')}`);
}

// Planning table: per pass, graphs by kind with the estimated size and work (no run).
function plan(A, ctx) {
  const depth = +(A.depth || DEPTH), ram = +(A.ram || os.totalmem() / 1e9);
  console.log(`Plan for ${ctx.WORKERS} threads, ${ctx.MEM} GB budget, ${ram.toFixed(0)} GB RAM (--workers, --max-mem, --ram), at the speed of the reference box (a Mac M5 core is roughly 1.5x faster).`);
  for (const p of PASSES) {
    const rows = new Map();
    for (const j of passJobs(restrict(p, A), null, depth)) {
      const e = estimate(j, depth), k = `${kind(j)} ${j.sc}`;
      const r = rows.get(k) || { graphs: 0, cells: 0, maxGB: 0, core: 0 };
      r.graphs++; r.cells += j.total; r.maxGB = Math.max(r.maxGB, Math.max(e.buildGB, e.graphGB + e.laneGB(1))); r.core += e.buildSecs + j.total * p.objectives.length * e.deckSecs; rows.set(k, r);
    }
    console.log(`\nPass ${p.n} (${p.name}), depth ${depth}: graph kind, scenario, graphs, cells, peak GB of one graph with one lane, single-thread work on the reference box`);
    for (const [k, r] of [...rows].sort()) console.log(`  ${k.padEnd(8)} ${String(r.graphs).padStart(5)} ${String(r.cells).padStart(8)} ${r.maxGB.toFixed(1).padStart(7)} GB  ${hms(r.core)}${r.maxGB > 0.92 * ram ? '  (too big for this RAM)' : ''}`);
    const rem = remaining(restrict(p, A), new Set(), { build: 1, solve: 1 }, ctx.WORKERS, ctx.MEM, depth, ram);
    console.log(`  total: ${hms(rem.core)} single-thread; about ${hms(rem.wall)} with ${ctx.WORKERS} threads and ${ctx.MEM} GB at reference speed${rem.tooBig.length ? `; ${rem.tooBig.length} graphs too big for this machine` : ''}`);
  }
}

function pack(A, ctx) {
  const F = files(ctx.OUT);
  if (!fs.existsSync(F.cells)) { console.log('Nothing to pack yet.'); return; }
  Gd.readDone(F.cells);
  const src = fs.createReadStream(F.cells), gz = zlib.createGzip({ level: 6 }), out = fs.createWriteStream(F.gz);
  src.pipe(gz).pipe(out);
  out.on('finish', () => console.log(`Wrote ${F.gz} (${(fs.statSync(F.gz).size / 1e6).toFixed(1)} MB). Send this file and report-p2.md back.`));
}


// ---------------- selftest ----------------
async function selftest(A, ctx) {
  const E = require('./exact');
  const { bruteValue } = require('./brute');
  let ok = true;
  // 1. optimal values vs the independent brute-force expectimax (tiny horizon)
  {
    const deck = E.buildDeck('36:5:5', 'tight', 3.5, 4), d = 3, Tt = 3;
    const g = O.buildOptGraph(Gd.universalDeck(deck.costs, 4, null), M.SCENARIOS.P1, Tt, d);
    const r = O.solveDecks(g, [deck], { objectives: ['V09', 'N'], depth: d, Hs: [Tt] });
    const bd = { lands: deck.L, dorks: deck.D, rocks: deck.R, spells: deck.costs.map((c, j) => [c, deck.K[3 + j]]), cmd: 4 };
    for (const [ok2, obj] of [['V09', { gamma: 0.9, kind: 'mana' }], ['N', { gamma: 1, kind: 'spells' }]]) {
      const b = bruteValue(bd, M.SCENARIOS.P1, Tt, obj, d).value, o = r.results[0].opt[ok2].value[0], diff = Math.abs(o - b);
      console.log(`${diff < 1e-9 ? 'PASS' : 'FAIL'}  optimal vs brute-force expectimax, 36:5:5 tight 3.5 P1 T=3 depth 3 ${ok2}: ${o.toFixed(9)} vs ${b.toFixed(9)} (|diff| ${diff.toExponential(1)})`);
      ok = ok && diff < 1e-9;
    }
  }
  // 2. runner round trip: a small slice through the scheduler, graph workers and lanes (shared graphs)
  const dir = path.join(ctx.OUT, 'selftest-p2'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const F = files(dir), Tt = 6, d = 3;
  const sl = { shapes: SHAPES, cmds: [5], scens: ['P4'], avgs: [3.25], step: 12, ...GRID, objectives: ['V09', 'N'] };
  const jobs = passJobs(sl, null, d);
  await schedule(jobs, { outFile: F.cells, taskFile: F.tasks, workers: Math.min(4, ctx.WORKERS), memGB: ctx.MEM, depth: d, objectives: sl.objectives, T: Tt });
  const recs = []; Gd.forEachLine(F.cells, l => recs.push(JSON.parse(l)));
  let worst = 0, worstH = 0;
  for (const j of passJobs(sl, null, d)) {
    const univ = Gd.universalDeck(j.costs, j.cmd, j.grp), g = O.buildOptGraph(univ, M.SCENARIOS[j.sc], Tt, d); // full universal graph: also checks the class cut
    for (const c of j.cells) {
      const rec = recs.find(x => x.id === c.id); if (!rec) { worst = Infinity; continue; }
      const deck = Gd.deckFor(c), r = O.solveDecks(g, [deck], { objectives: ['V09', 'N'], depth: d, Hs: O.range(3, Tt) }).results[0].opt;
      for (const o of ['V09', 'N']) for (const k of ['value', 'V09', 'N', 'gen', 'left']) r[o][k].forEach((v, i) => { worst = Math.max(worst, Math.abs(rec[o][k][i] - v) / Math.max(1e-9, Math.abs(v))); });
      const h = E.summarize(E.solve(deck, M.SCENARIOS[c.sc], Tt, c.shape === 'normal3' ? { lumpSpells: 'hand', lumpGroups: 2 } : {}));
      for (const k of ['V09', 'N', 'gen']) rec.heur[k].forEach((v, i) => { worstH = Math.max(worstH, Math.abs(v - h[i + 2][k]) / Math.max(1e-9, Math.abs(h[i + 2][k]))); });
    }
  }
  const total = jobs.reduce((a, j) => a + j.cells.length, 0);
  const pass = recs.length === total && worst < 1e-6 && worstH < 1e-6;
  console.log(`${pass ? 'PASS' : 'FAIL'}  phase 2 runner round trip: ${recs.length}/${total} cells through shared graphs and lanes; max relative diff vs a direct solve ${worst.toExponential(1)}, heuristic baseline vs exact.js ${worstH.toExponential(1)} (8 digits stored)`);
  fs.rmSync(dir, { recursive: true, force: true });
  process.exitCode = ok && pass ? 0 : 1;
}

module.exports.cli = async function cli(cmd, A, ctx) {
  const fns = { run, status, report: () => console.log(`Wrote ${report(ctx, false)}`), pack, selftest, plan };
  if (!fns[cmd]) { console.log('Usage: node run.js --phase 2 [run|status|report|pack|selftest|plan] [--out DIR] [--workers N] [--max-mem GB] [--pass N] [--depth D]'); process.exitCode = 1; return; }
  await fns[cmd](A, ctx);
};

Object.assign(module.exports, { PASSES, DEPTH, HS, passJobs, estimate, schedule, cellId, parseId, inPass, files, calibration, remaining, record, curveInfo, kind, EST, DELTA, KEEP_HS, relSize, classDeck });
