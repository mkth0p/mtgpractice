#!/usr/bin/env node
'use strict';
// Resumable grid runner (part 1 play rule), one command, pure Node, any OS.
//
//   node --max-old-space-size=8192 grid.js --out results-grid [options]
//
// tight curve: EXACT, through a deck-independent state graph. In "seen cards" coordinates the
//   game graph under a fixed policy does not depend on how many lands/dorks/rocks/spells the
//   deck has, only on the set of spell costs, the commander cost and the scenario. One graph is
//   built per (spell cost set, commander cost, scenario) and every deck sharing it is evaluated by
//   one cheap pass over its edges with that deck's draw probabilities (25-45x faster than a
//   direct solve on 2-cost curves; results identical to exact.js to ~1e-15).
// normal3 curve (PREREG's normal, folded on 3 costs): the same shared graph, with the
//   lump-hand-g2 library (one library count per cost group; error vs exact in README).
// normal (the old 5-6-cost version, not in PREREG any more): one direct lump-hand-g2 solve per cell.
//
// Output: <out>/cells.jsonl, one fsync'd line per finished cell; rerun the same command to resume
// (finished cells are skipped, a torn last line is ignored). run.js drives this in passes.
//
// Options (defaults = PREREG grid):
//   --shape tight,normal3 (tight)       --cmd 2,3,4,5,6,7          --scen P1,...,P8
//   --avgs 2,2.25,...,4.5               --step 1 (2 = every other lands/dorks/rocks value)
//   --lands 20-48 --dorks 0-15 --rocks 0-20 --maxramp 25         --T 15
//   --workers N (default: all cores)   --mem GB (default: min(48, 75% of RAM); tasks are started
//   biggest first while their estimated memory fits)   --chunk 3000 (cells per task)   --selftest
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const M = require('./model');
const E = require('./exact');
const { StateTable } = require('./statetable');
const { makePolicy } = require('./policy1');

const KMAX = [48, 15, 20]; // grid maxima for lands, dorks, rocks; spells up to 99 - 20 = 79

// ---------- deck-independent graph ----------
// lumpGrp (optional): group index (0/1) of each spell type for the lump-hand-g2 library; the
// library then holds one count per group, as exact.js does with lumpSpells 'hand', lumpGroups 2.
function universalDeck(costs, cmd, lumpGrp) {
  const counts = new Array(M.MAX_COST + 1).fill(0); costs.forEach(c => { counts[c] = 1; });
  const d = M.makeDeck(M.DECK_SIZE - costs.length, 0, 0, counts, cmd); // valid layout, K replaced below
  const u = Object.assign({}, d, { K: [...KMAX, ...costs.map(() => 79)] });
  if (lumpGrp) {
    u.grp = Int32Array.from(lumpGrp); u.G = Math.max(...lumpGrp) + 1;
    u.UG = new Array(u.G).fill(0); costs.forEach((c, j) => { u.UG[u.grp[j]] += 79; });
  }
  return u;
}
// lump-hand-g2 grouping used by exact.js: costs <= deck average vs above (one group if all on one side)
function lumpGroupsOf(deck) {
  const g = deck.costs.map(c => (c <= deck.avg ? 0 : 1));
  return g.every(x => x === g[0]) ? g.map(() => 0) : g;
}
function growI32(a, need) { if (need <= a.length) return a; const b = new Int32Array(Math.max(need, a.length * 2)); b.set(a); return b; }
function growU8(a, need) { if (need <= a.length) return a; const b = new Uint8Array(Math.max(need, a.length * 2)); b.set(a); return b; }
function findIdx(tab, s) {
  const W = tab.W; let h = tab.hash(s, 0) & tab.mask;
  for (;;) { const idx = tab.slots[h]; if (idx < 0) return -1; const o = idx * W; let eq = true; for (let i = 0; i < W; i++) if (tab.data[o + i] !== s[i]) { eq = false; break; } if (eq) return idx; h = (h + 1) & tab.mask; }
}
// map a deck's opening state (deck coordinates) to the universal graph's coordinates
function toUniversal(univ, deck, ds, out) {
  const { n, K_OFF, W } = univ;
  out.fill(0); out.set(ds.subarray(K_OFF + n, deck.W), K_OFF + n); // hand, board, commander
  for (let i = 0; i < 3; i++) out[K_OFF + i] = univ.K[i] - (deck.K[i] - ds[K_OFF + i]);
  if (univ.grp) {
    const seen = new Array(univ.G).fill(0);
    for (let j = 0; j < univ.nSp; j++) seen[univ.grp[j]] += deck.K[3 + j] - ds[K_OFF + 3 + j];
    for (let g = 0; g < univ.G; g++) out[K_OFF + 3 + g] = univ.UG[g] - seen[g];
  } else for (let i = 3; i < n; i++) out[K_OFF + i] = univ.K[i] - (deck.K[i] - ds[K_OFF + i]);
  return out;
}

function buildGraph(univ, extra, T) {
  const policy = makePolicy(univ);
  const { n, W, K_OFF, H_OFF, B_LAND, CMD, nSp } = univ;
  const lump = !!univ.grp;
  let A = new StateTable(W);
  const tmp = new Uint8Array(W);
  for (const o of M.openingStates(univ, {})) A.add(lump ? toUniversal(univ, univ, o.s, tmp) : o.s, 0);
  const g = { first: A, steps: [], states: 0, edges: 0, lump };
  const child = new Uint8Array(W), rw = {};
  for (let t = 1; t <= T; t++) {
    let cur = A;
    for (let j = 0; j < M.drawsAt(extra, t); j++) {
      const nxt = new StateTable(W, 1 << 12);
      const off = new Int32Array(cur.n + 1);
      let ch = new Int32Array(1 << 16), ty = new Uint8Array(1 << 16), se = new Uint8Array(1 << 16), hj = lump ? new Uint8Array(1 << 16) : null, hg = lump ? new Uint8Array(1 << 16) : null;
      let e = 0;
      const push = (c, i, seen, h1, h2) => {
        if (e + 1 > ch.length) { ch = growI32(ch, e + 1); ty = growU8(ty, e + 1); se = growU8(se, e + 1); if (lump) { hj = growU8(hj, e + 1); hg = growU8(hg, e + 1); } }
        ch[e] = c; ty[e] = i; se[e] = seen; if (lump) { hj[e] = h1; hg[e] = h2; } e++;
      };
      for (let idx = 0; idx < cur.n; idx++) {
        const s = cur.state(idx); off[idx] = e;
        const nTypes = lump ? 3 : n;
        for (let i = 0; i < nTypes; i++) if (s[K_OFF + i]) {
          child.set(s); child[K_OFF + i]--; child[H_OFF + i]++;
          push(nxt.add(child, 0), i, univ.K[i] - s[K_OFF + i], 0, 0); // se = copies of type i already seen
        }
        if (lump) for (let jj = 0; jj < nSp; jj++) {
          const gg = univ.grp[jj];
          if (!s[K_OFF + 3 + gg]) continue;
          let hG = 0; for (let q = 0; q < nSp; q++) if (univ.grp[q] === gg) hG += s[H_OFF + 3 + q];
          child.set(s); child[K_OFF + 3 + gg]--; child[H_OFF + 3 + jj]++;
          push(nxt.add(child, 0), 3 + jj, univ.UG[gg] - s[K_OFF + 3 + gg], s[H_OFF + 3 + jj], hG); // se = spells of the group seen
        }
      }
      off[cur.n] = e;
      g.steps.push({ kind: 'draw', nFrom: cur.n, nTo: nxt.n, off, ch: ch.slice(0, e), ty: ty.slice(0, e), se: se.slice(0, e), hj: lump ? hj.slice(0, e) : null, hg: lump ? hg.slice(0, e) : null });
      g.edges += e; g.states += cur.n;
      cur = nxt;
    }
    const B = new StateTable(W, 1 << 12);
    const m = cur.n, nx = new Int32Array(m), us = new Uint8Array(m), ge = new Uint8Array(m), ra = new Uint8Array(m), sp = new Uint8Array(m), rc = new Uint8Array(m);
    for (let idx = 0; idx < m; idx++) {
      const s = cur.state(idx);
      M.applyAction(univ, s, policy(s, t), child, rw);
      nx[idx] = B.add(child, 0); us[idx] = rw.useful; ge[idx] = rw.gen; ra[idx] = rw.ramp; sp[idx] = rw.spells; rc[idx] = rw.rampCast;
    }
    const lc = new Uint8Array(B.n), cm = new Uint8Array(B.n), lf = new Uint8Array(B.n);
    for (let idx = 0; idx < B.n; idx++) {
      const s = B.state(idx); lc[idx] = s[B_LAND] === t ? 1 : 0; cm[idx] = s[CMD];
      let left = 0; for (let j = 0; j < nSp; j++) left += s[H_OFF + 3 + j]; lf[idx] = left;
    }
    g.steps.push({ kind: 'act', t, nFrom: m, nTo: B.n, nx, us, ge, ra, sp, rc, lc, cm, lf });
    g.edges += m; g.states += m;
    A = B;
  }
  return g;
}

// One deck's pass over the graph: the same per-turn quantities as exact.solve.
function sweep(g, univ, deck, T) {
  const { W } = univ;
  let mass = new Float64Array(g.first.n);
  const s = new Uint8Array(W);
  for (const o of M.openingStates(deck, {})) {
    const idx = findIdx(g.first, toUniversal(univ, deck, o.s, s)); if (idx < 0) throw new Error('opening state missing from graph');
    mass[idx] += o.p;
  }
  const z = () => new Float64Array(T + 1);
  const pt = { useful: z(), gen: z(), ramp: z(), unused: z(), spells: z(), rampCast: z(), left: z(), landOnCurve: z(), cmdCast: z(), mass: z() };
  let N = M.DECK_SIZE - 7; const K = deck.K;
  // lump-hand-g2: per group deck totals; mix weights are recomputed per state from its edges
  const lump = g.lump, G = lump ? univ.G : 0, SG = new Float64Array(Math.max(1, G));
  if (lump) for (let j = 0; j < univ.nSp; j++) SG[univ.grp[j]] += K[3 + j];
  const mix = new Float64Array(64), tot = new Float64Array(Math.max(1, G));
  for (const st of g.steps) {
    const out = new Float64Array(st.nTo);
    if (st.kind === 'draw') {
      const { off, ch, ty, se, hj, hg } = st; const inv = 1 / N;
      for (let idx = 0; idx < st.nFrom; idx++) {
        const p = mass[idx]; if (p === 0) continue;
        const e0 = off[idx], e1 = off[idx + 1];
        if (lump) {
          tot.fill(0);
          for (let e = e0; e < e1; e++) {
            const i = ty[e]; if (i < 3) continue;
            const gg = univ.grp[i - 3], Kj = K[i];
            const castG = Math.max(0, se[e] - hg[e]);
            mix[e - e0] = Math.max(0, Kj - hj[e] - castG * Kj / SG[gg]); tot[gg] += mix[e - e0];
          }
          for (let gg = 0; gg < G; gg++) if (tot[gg] <= 0) { // same fallback as exact.js: the deck mix
            tot[gg] = 0;
            for (let e = e0; e < e1; e++) { const i = ty[e]; if (i >= 3 && univ.grp[i - 3] === gg) { mix[e - e0] = K[i]; tot[gg] += K[i]; } }
          }
        }
        for (let e = e0; e < e1; e++) {
          const i = ty[e];
          if (!lump || i < 3) { const k = K[i] - se[e]; if (k > 0) out[ch[e]] += p * k * inv; continue; }
          const gg = univ.grp[i - 3], kG = SG[gg] - se[e];
          if (kG > 0 && mix[e - e0] > 0) out[ch[e]] += p * kG * inv * mix[e - e0] / tot[gg];
        }
      }
      N--;
    } else {
      const t = st.t; let u = 0, ge = 0, ra = 0, sp = 0, rc = 0;
      for (let idx = 0; idx < st.nFrom; idx++) {
        const p = mass[idx]; if (p === 0) continue;
        u += p * st.us[idx]; ge += p * st.ge[idx]; ra += p * st.ra[idx]; sp += p * st.sp[idx]; rc += p * st.rc[idx];
        out[st.nx[idx]] += p;
      }
      pt.useful[t] = u; pt.gen[t] = ge; pt.ramp[t] = ra; pt.spells[t] = sp; pt.rampCast[t] = rc; pt.unused[t] = ge - u - ra;
      let lc = 0, cm = 0, lf = 0, ms = 0;
      for (let idx = 0; idx < st.nTo; idx++) { const p = out[idx]; if (p === 0) continue; ms += p; lc += p * st.lc[idx]; cm += p * st.cm[idx]; lf += p * st.lf[idx]; }
      pt.landOnCurve[t] = lc; pt.cmdCast[t] = cm; pt.left[t] = lf; pt.mass[t] = ms;
    }
    mass = out;
  }
  return { pt, T, dist: false };
}

// ---------- cells ----------
function range(spec, step) { const [a, b] = String(spec).split('-').map(Number); const r = []; for (let x = a; x <= (b === undefined ? a : b); x += step) r.push(x); return r; }
// Compositions [L, D, R] of a slice: lands/dorks/rocks ranges ('a-b'), one step for all three, ramp cap.
function comps(o) {
  const out = [], st = o.step || 1;
  for (const L of range(o.lands || '20-48', st)) for (const D of range(o.dorks || '0-15', st)) for (const R of range(o.rocks || '0-20', st))
    if (D + R <= (o.maxramp === undefined ? 25 : o.maxramp)) out.push([L, D, R]);
  return out;
}
function cellId(shape, L, D, R, avg, cmd, sc) { return `${shape}|${L}:${D}:${R}|${avg}|c${cmd}|${sc}`; }
function parseId(id) {
  const [shape, ldr, avg, c, sc] = id.split('|'); const [L, D, R] = ldr.split(':').map(Number);
  return { shape, L, D, R, avg: +avg, cmd: +c.slice(1), sc };
}
function costsOf(counts) { const r = []; counts.forEach((x, i) => { if (x) r.push(i); }); return r; }
// Cells of a slice o: {shapes, cmds, scens, avgs, lands, dorks, rocks, step, maxramp}
function cellsFor(o) {
  const out = [], cs = comps(o);
  for (const shape of o.shapes) for (const cmd of o.cmds) for (const sc of o.scens) for (const avg of o.avgs) for (const [L, D, R] of cs) {
    const c = M.spellCounts(shape, M.DECK_SIZE - L - D - R, avg); if (!c) continue;
    out.push({ id: cellId(shape, L, D, R, avg, cmd, sc), shape, L, D, R, avg, cmd, sc, costs: costsOf(c) });
  }
  return out;
}
function compact(sum) { // per-T arrays, T = 1..Tmax; 8 significant digits (gaps that matter are > 1e-4)
  const keys = ['V09', 'V08', 'V10', 'N', 'N09', 'N08', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn', 'pCmdByT'];
  const o = {}; for (const k of keys) o[k] = sum.map(r => +r[k].toPrecision(8));
  o.landMiss = sum[sum.length - 1].landMiss.map(x => +x.toPrecision(8));
  return o;
}
function deckFor(c) { return M.makeDeck(c.L, c.D, c.R, M.spellCounts(c.shape, M.DECK_SIZE - c.L - c.D - c.R, c.avg), c.cmd); }
function cellRecord(c, deck, sum, method) {
  return { id: c.id, shape: c.shape, L: c.L, D: c.D, R: c.R, avg: c.avg, realAvg: +deck.avg.toFixed(4), cmd: c.cmd, sc: c.sc, method, ...compact(sum) };
}

// ---------- worker ----------
// A task is a list of cells of one (shape, commander, scenario) that (nearly always) share one cost
// set. The worker groups them by (cost set, lump grouping), builds each group's graph once and
// sweeps every deck of the group over it; one graph is held at a time.
if (!isMainThread) {
  const { task, T } = workerData;
  const groups = new Map();
  for (const c of task.cells) {
    if (c.shape === 'normal') { const k = 'direct'; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(c); continue; }
    const deck = deckFor(c), lump = c.shape === 'normal3' ? lumpGroupsOf(deck) : null;
    const k = `${deck.costs.join('-')}${lump ? '/g' + lump.join('') : ''}`;
    if (!groups.has(k)) groups.set(k, []); groups.get(k).push(Object.assign(c, { costs: deck.costs, lump }));
  }
  const stats = { graphs: [], sweepSecs: 0, cells: 0 };
  for (const [k, cs] of groups) {
    if (k === 'direct') {
      for (const c of cs) {
        const deck = deckFor(c), t0 = Date.now();
        parentPort.postMessage({ cell: cellRecord(c, deck, E.summarize(E.solve(deck, M.SCENARIOS[c.sc], T, { lumpSpells: 'hand', lumpGroups: 2 })), 'lump-hand-g2-direct') });
        stats.sweepSecs += (Date.now() - t0) / 1000; stats.cells++;
      }
      continue;
    }
    const t0 = Date.now();
    const univ = universalDeck(cs[0].costs, task.cmd, cs[0].lump);
    let g = buildGraph(univ, M.SCENARIOS[task.sc], T);
    const gs = { key: k, states: g.states, edges: g.edges, buildSecs: (Date.now() - t0) / 1000, cells: cs.length };
    stats.graphs.push(gs);
    parentPort.postMessage({ info: `graph ${task.shape} ${k} c${task.cmd} ${task.sc}: ${(g.states / 1e6).toFixed(1)}M states, built in ${gs.buildSecs.toFixed(0)}s; ${cs.length} decks to sweep` });
    const method = cs[0].lump ? 'lump-hand-g2-graph' : 'exact-graph';
    const t1 = Date.now();
    for (const c of cs) {
      const deck = deckFor(c);
      parentPort.postMessage({ cell: cellRecord(c, deck, E.summarize(sweep(g, univ, deck, T)), method) });
      stats.cells++;
    }
    stats.sweepSecs += (Date.now() - t1) / 1000;
    g = null;
  }
  parentPort.postMessage({ done: true, stats });
  return;
}

// Estimated peak memory (GB) of a task's graph, measured to T=15 (~25-35 bytes per graph state);
// T < 15 scales roughly as (T/15)^3. Calibrated in phase 1 (README): tight 2 costs at P8 ~3 GB,
// 1 cost ~0.25 GB, P1 ~6x smaller than P8; normal3 (3 costs, lump-hand-g2) see NORMAL3_GB.
const NORMAL3_GB = 4.5;
function estimateGB(task, T = 15) {
  const extra = M.SCENARIOS[task.sc].reduce((x, y) => x + y, 0); // 0 (P1) .. 7 (P8)
  const scale = Math.pow(T / 15, 3), fP = 0.17 + 0.83 * extra / 7, cmdF = task.cmd >= 5 ? 1.2 : 1;
  if (task.shape === 'normal') return Math.max(0.5, (extra === 0 ? 6 : extra <= 3 ? 12 : 40) * scale);
  const big = task.shape === 'normal3' ? NORMAL3_GB : task.nCosts >= 2 ? 3.5 : 0.25;
  return Math.max(0.2, big * cmdF * fP * scale);
}
// Estimated single-core seconds of a task with n cells (graph build + n sweeps), on the machine
// used in phase 1; run.js rescales it with the timings it logs.
function estimateSecs(task, n, T = 15) {
  const gb = estimateGB(task, T);
  if (task.shape === 'normal') return n * gb * 20;
  return gb * 55 + n * gb * 0.85;
}

// Stream a JSONL file line by line (files may be many GB). fn(line) per complete line;
// returns the byte length of the complete-line prefix (a torn last line is not included).
function forEachLine(file, fn) {
  if (!fs.existsSync(file)) return 0;
  const fd = fs.openSync(file, 'r'), buf = Buffer.alloc(1 << 24);
  let pos = 0, rest = '', good = 0;
  for (;;) {
    const n = fs.readSync(fd, buf, 0, buf.length, pos); if (n <= 0) break; pos += n;
    const text = rest + buf.toString('utf8', 0, n);
    const lines = text.split('\n'); rest = lines.pop();
    for (const line of lines) { good += Buffer.byteLength(line) + 1; if (line.trim()) fn(line); }
  }
  fs.closeSync(fd);
  return good;
}
// Finished cell ids. Also cuts a torn last line (crash mid-write) so later appends stay clean.
function readDone(file, repair = true) {
  const done = new Set();
  const good = forEachLine(file, line => {
    const m = /^\{"id":"([^"]+)"/.exec(line);
    if (m && line.endsWith('}')) done.add(m[1]);
  });
  if (repair && fs.existsSync(file) && fs.statSync(file).size > good) fs.truncateSync(file, good);
  return done;
}

// Tasks of a slice, as lazy descriptors: one per (shape, commander, scenario, cost set of the
// averages), split into chunks of at most `chunk` cells (each chunk builds its own graph).
function sliceTasks(o, chunk = 3000) {
  const cs = comps(o), tasks = [];
  for (const shape of o.shapes) for (const cmd of o.cmds) for (const sc of o.scens) {
    const bySet = new Map();
    for (const avg of o.avgs) {
      const c = M.spellCounts(shape, 63, avg); if (!c) continue;
      const k = costsOf(c).join('-'); if (!bySet.has(k)) bySet.set(k, []); bySet.get(k).push(avg);
    }
    for (const [k, avgs] of bySet) {
      const total = avgs.length * cs.length;
      for (let i = 0; i < total; i += chunk)
        tasks.push({ shape, cmd, sc, avgs, nCosts: k.split('-').length, key: `${shape} ${k} c${cmd} ${sc}`, from: i, to: Math.min(total, i + chunk), comps: cs });
    }
  }
  return tasks;
}
const _ok = new Map(); // memo: does (shape, spells, avg) give a valid curve
function validCurve(shape, S, avg) { const k = `${shape}|${S}|${avg}`; let v = _ok.get(k); if (v === undefined) { v = !!M.spellCounts(shape, S, avg); _ok.set(k, v); } return v; }
function taskCells(t, done) {
  const out = [];
  for (let i = t.from; i < t.to; i++) {
    const avg = t.avgs[Math.floor(i / t.comps.length)], [L, D, R] = t.comps[i % t.comps.length];
    const id = cellId(t.shape, L, D, R, avg, t.cmd, t.sc);
    if (done && done.has(id)) continue;
    if (!validCurve(t.shape, M.DECK_SIZE - L - D - R, avg)) continue;
    out.push({ id, shape: t.shape, L, D, R, avg, cmd: t.cmd, sc: t.sc });
  }
  return out;
}

// Run tasks with a memory-aware worker pool, appending one fsync'd JSON line per finished cell.
// opts: {outFile, T, workers, memGB, done (Set), onCell(record), onTask(task, stats, secs), log(text)}
// Resolves with the number of cells written; rejects if a worker dies (rerun resumes).
function runTasks(tasks, opts) {
  const T = opts.T || 15, done = opts.done || new Set();
  const log = opts.log || (x => process.stdout.write(x));
  tasks = tasks.map(t => Object.assign({}, t, { memGB: estimateGB(t, T) })).sort((x, y) => y.memGB - x.memGB);
  const memBudget = opts.memGB, nw = opts.workers;
  const fd = fs.openSync(opts.outFile, 'a');
  let running = 0, usedGB = 0, finished = 0, failed = null;
  const live = new Set();
  return new Promise((resolveAll, rejectAll) => {
    const finish = () => { fs.closeSync(fd); if (failed) rejectAll(failed); else resolveAll(finished); };
    const pump = () => {
      if (failed) { if (!running) finish(); return; }
      while (tasks.length && running < nw) {
        let k = tasks.findIndex(t => t.memGB <= memBudget - usedGB);
        if (k < 0) { if (running) break; k = 0; } // nothing fits: run the biggest alone
        const task = tasks.splice(k, 1)[0];
        const cells = taskCells(task, done);
        if (!cells.length) continue;
        running++; usedGB += task.memGB;
        const t0 = Date.now();
        const w = new Worker(__filename, { workerData: { task: { shape: task.shape, cmd: task.cmd, sc: task.sc, cells }, T } });
        live.add(w);
        let stats = null;
        w.on('message', m => {
          if (m.info && opts.verbose) log(`\n${m.info} [${running} workers, ~${usedGB.toFixed(0)}/${memBudget} GB]\n`);
          if (m.cell) { fs.writeSync(fd, JSON.stringify(m.cell) + '\n'); fs.fsyncSync(fd); finished++; done.add(m.cell.id); if (opts.onCell) opts.onCell(m.cell); }
          if (m.done) stats = m.stats;
        });
        w.on('error', e => { if (!failed) failed = e; });
        w.on('exit', code => {
          live.delete(w); running--; usedGB -= task.memGB;
          if (!stats && !failed) failed = new Error(`worker for ${task.key} stopped (exit code ${code}); rerun the same command to resume`);
          if (stats && opts.onTask) opts.onTask(task, stats, (Date.now() - t0) / 1000);
          if (failed) { for (const x of live) x.terminate(); }
          if (!tasks.length && !running) return finish();
          pump();
        });
      }
      if (!tasks.length && !running) finish();
    };
    pump();
  });
}

// ---------- CLI ----------
function args() {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] !== undefined && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  return a;
}

// Graph pass vs exact.js (exact library for tight, lump-hand-g2 library for normal3).
function selftest(cases) {
  let worst = 0;
  cases = cases || [['36:5:5', 'tight', 3.5, 4, 'P5', 10], ['28:10:12', 'tight', 3, 2, 'P8', 12], ['44:2:0', 'tight', 4.25, 7, 'P1', 15],
    ['28:10:12', 'normal3', 3, 4, 'P1', 10], ['36:5:5', 'normal3', 3.5, 6, 'P4', 8], ['40:3:2', 'normal3', 2.75, 3, 'P8', 7]];
  for (const [spec, shape, avg, cmd, sc, T] of cases) {
    const deck = E.buildDeck(spec, shape, avg, cmd);
    const lump = shape === 'normal3' ? lumpGroupsOf(deck) : null;
    const univ = universalDeck(deck.costs, cmd, lump);
    const g = buildGraph(univ, M.SCENARIOS[sc], T);
    const a = E.summarize(sweep(g, univ, deck, T));
    const b = E.summarize(E.solve(deck, M.SCENARIOS[sc], T, lump ? { lumpSpells: 'hand', lumpGroups: 2 } : {}));
    let md = 0;
    for (let t = 0; t < T; t++) for (const k of ['V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'left', 'cmdTurn', 'mass']) md = Math.max(md, Math.abs(a[t][k] - b[t][k]));
    for (let t = 0; t < a[T - 1].landMiss.length; t++) md = Math.max(md, Math.abs(a[T - 1].landMiss[t] - b[T - 1].landMiss[t]));
    worst = Math.max(worst, md);
    console.log(`${md < 1e-9 ? 'PASS' : 'FAIL'}  graph pass vs exact.js${lump ? ' (lump-hand-g2)' : ''} ${spec} ${shape} ${avg} cmd${cmd} ${sc} T<=${T}: max|diff| ${md.toExponential(1)} (graph ${g.states} states)`);
  }
  return worst < 1e-9;
}

async function main() {
  const a = args();
  if (a.selftest) { process.exitCode = selftest() ? 0 : 1; return; }
  const o = {
    shapes: (a.shape || 'tight').split(','),
    cmds: (a.cmd || '2,3,4,5,6,7').split(',').map(Number),
    scens: (a.scen || 'P1,P2,P3,P4,P5,P6,P7,P8').split(','),
    avgs: (a.avgs || '2,2.25,2.5,2.75,3,3.25,3.5,3.75,4,4.25,4.5').split(',').map(Number),
    step: +(a.step || 1), lands: a.lands || '20-48', dorks: a.dorks || '0-15', rocks: a.rocks || '0-20', maxramp: +(a.maxramp || 25),
  };
  const T = +(a.T || 15);
  const outDir = path.resolve(a.out || 'results-grid');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'cells.jsonl');
  const memGB = +(a.mem || Math.min(48, Math.floor(0.75 * os.totalmem() / 1024 ** 3)));
  const workers = +(a.workers || Math.max(1, os.cpus().length));
  const done = readDone(outFile), tasks = sliceTasks(o, +(a.chunk || 3000));
  const total = tasks.reduce((x, t) => x + taskCells(t, null).length, 0), todo = tasks.reduce((x, t) => x + taskCells(t, done).length, 0);
  console.log(`${total} cells, ${total - todo} already done, ${todo} to run, up to ${workers} workers within ~${memGB} GB -> ${outFile}`);
  const t0 = Date.now(); let n = 0;
  await runTasks(tasks, { outFile, T, workers, memGB, done, verbose: !!a.verbose, onCell: () => {
    n++; const el = (Date.now() - t0) / 1000, eta = (todo - n) / (n / el);
    process.stdout.write(`\r${n}/${todo} cells  ${(el / 3600).toFixed(2)} h elapsed  ETA ${(eta / 3600).toFixed(1)} h   `);
  } });
  console.log(`\nall ${todo} cells done in ${((Date.now() - t0) / 3600000).toFixed(2)} h`);
}

if (require.main === module) main().catch(e => { console.error('\n' + e.message); process.exitCode = 1; });
module.exports = { universalDeck, lumpGroupsOf, buildGraph, sweep, comps, cellsFor, cellId, parseId, deckFor, sliceTasks, taskCells, runTasks, readDone, forEachLine, estimateGB, estimateSecs, selftest };
