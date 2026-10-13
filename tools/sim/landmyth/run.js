#!/usr/bin/env node
'use strict';
// Land count myth, part 2: the grid runner (part 1 play rule). Pure Node, no install.
//
//   node run.js              run passes 1, 2, 3 in order; stop any time (Ctrl-C, sleep, crash),
//                            run it again to carry on where it stopped
//   node run.js status       progress per pass and time left
//   node run.js report       write report.md (preliminary findings from the cells done so far)
//   node run.js pack         write cells.jsonl.gz (the file to send back) next to the results
//   node run.js selftest     check the runner against exact.js on a few cells
//
// Passes (each only computes cells that are not done yet; later passes include earlier cells):
//   1  coarse:  lands/dorks/rocks in steps of 4, average cost 2.5/3/3.5/4, commander 4,
//               draw scenarios P1/P4/P8, tight + normal curves      (4,032 cells)
//   2  medium:  steps of 2, every average 2.0-4.5, commanders 2-7, P1-P8      (~1.1M cells)
//   3  full:    every composition (PREREG grid)                              (~8.6M cells)
// Every cell is solved to T = 15 and stores all T = 1..15.
//
// Options: --out DIR (default ./landmyth-results)  --workers N (default: all cores)
//          --max-mem GB (default: min(48, 75% of RAM))  --pass N (stop after pass N)
//          --verbose (print each graph as it is built)
const os = require('os');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const M = require('./model');
const E = require('./exact');
const G = require('./grid');

const ALL_AVGS = [2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5];
const ALL_SC = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const GRID = { lands: '20-48', dorks: '0-15', rocks: '0-20', maxramp: 25 };
const SHAPES = ['tight', 'normal3'];
const PASSES = [
  { n: 1, name: 'coarse', shapes: SHAPES, cmds: [4], scens: ['P1', 'P4', 'P8'], avgs: [2.5, 3, 3.5, 4], step: 4, ...GRID },
  { n: 2, name: 'medium', shapes: SHAPES, cmds: [2, 3, 4, 5, 6, 7], scens: ALL_SC, avgs: ALL_AVGS, step: 2, ...GRID },
  { n: 3, name: 'full', shapes: SHAPES, cmds: [2, 3, 4, 5, 6, 7], scens: ALL_SC, avgs: ALL_AVGS, step: 1, ...GRID },
];
const T = 15;
const DELTA = 0.02; // PREREG margin: 2% of the best deck's value

function args() {
  const a = { _: [] }; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) {
    if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] !== undefined && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; } else a._.push(v[i]);
  }
  return a;
}
const A = args();
const OUT = path.resolve(A.out || 'landmyth-results');
const CELLS = path.join(OUT, 'cells.jsonl');
const TASKLOG = path.join(OUT, 'tasks.jsonl');
const MEM = +(A['max-mem'] || Math.min(48, Math.floor(0.75 * os.totalmem() / 1024 ** 3)));
const WORKERS = +(A.workers || Math.max(1, os.cpus().length));

const hms = s => { if (!isFinite(s)) return '?'; s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h} h ${String(m).padStart(2, '0')} min` : m ? `${m} min` : `${s} s`; };
function inPass(p, c) {
  return p.shapes.includes(c.shape) && p.cmds.includes(c.cmd) && p.scens.includes(c.sc) && p.avgs.includes(c.avg)
    && (c.L - 20) % p.step === 0 && c.D % p.step === 0 && c.R % p.step === 0;
}

// Ratio of measured to estimated task time on this machine (from tasks.jsonl), for time-left estimates.
function calibration() {
  let est = 0, act = 0, n = 0;
  G.forEachLine(TASKLOG, line => { try { const r = JSON.parse(line); if (r.estSecs > 0) { est += r.estSecs; act += r.secs * r.workers / Math.max(1, r.workers); n++; } } catch (e) { /* torn */ } });
  return { factor: n ? act / est : 1, tasks: n };
}
// Remaining work of a pass: estimated core-seconds and a parallel time estimate.
function remaining(p, done, cal) {
  let core = 0, cells = 0, gbSecs = 0;
  for (const t of G.sliceTasks(p)) {
    const n = G.taskCells(t, done).length; if (!n) continue;
    const s = G.estimateSecs(t, n, T) * cal.factor, gb = G.estimateGB(t, T);
    core += s; cells += n; gbSecs += gb * s;
  }
  const meanGB = core ? gbSecs / core : 1;
  const par = Math.max(1, Math.min(WORKERS, Math.floor(MEM / meanGB)));
  return { cells, core, wall: core / par, par };
}
function passTotals(done) {
  return PASSES.map(p => {
    let total = 0; for (const t of G.sliceTasks(p)) total += G.taskCells(t, null).length;
    let d = 0; for (const id of done) if (inPass(p, G.parseId(id))) d++;
    return { p, total, done: d };
  });
}

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const done = G.readDone(CELLS); // also cuts a torn last line
  const last = +(A.pass || 3);
  console.log(`Results: ${CELLS}\n${done.size} cells already done. Using up to ${WORKERS} workers within ~${MEM} GB of memory.`);
  console.log('Stop any time with Ctrl-C (or sleep, or a crash); run the same command again to resume.\n');
  let stopping = false;
  process.on('SIGINT', () => { if (stopping) process.exit(130); stopping = true; console.log('\n\nStopped. Every finished cell is saved; run the same command to resume.'); process.exit(130); });
  for (const p of PASSES.filter(q => q.n <= last)) {
    const cal = calibration(), rem = remaining(p, done, cal);
    if (!rem.cells) { console.log(`Pass ${p.n} (${p.name}): already complete.`); continue; }
    console.log(`Pass ${p.n} (${p.name}): ${rem.cells} cells to compute, about ${hms(rem.wall)} on this machine${cal.tasks ? '' : ' (first guess; improves as tasks finish)'}.`);
    const t0 = Date.now(); let n = 0, lastPrint = 0, coreDone = 0;
    const tasks = G.sliceTasks(p);
    const log = fs.openSync(TASKLOG, 'a');
    // Heartbeat: the first cells only land once a game graph is built (minutes for the big ones), so show it is alive.
    const beat = setInterval(() => {
      if (Date.now() - lastPrint < 10000) return;
      lastPrint = Date.now(); const el = (lastPrint - t0) / 1000;
      process.stdout.write(`\r  pass ${p.n}: ${n}/${rem.cells} cells, ${hms(el)} elapsed${n ? '' : ', building the first game graphs (normal for the first few minutes)'}      `);
    }, 10000);
    await G.runTasks(tasks, {
      outFile: CELLS, T, workers: WORKERS, memGB: MEM, done, verbose: !!A.verbose,
      log: x => process.stdout.write(x),
      onCell: () => {
        n++; const now = Date.now();
        if (now - lastPrint > 2000 || n === rem.cells) {
          lastPrint = now; const el = (now - t0) / 1000;
          const frac = Math.max(n / rem.cells, coreDone / rem.core);
          const eta = frac > 0.02 ? el * (1 - frac) / frac : rem.wall - el;
          process.stdout.write(`\r  pass ${p.n}: ${n}/${rem.cells} cells, ${hms(el)} elapsed, about ${hms(eta)} left      `);
        }
      },
      onTask: (task, stats, secs) => {
        const est = G.estimateSecs(task, stats.cells, T);
        coreDone += est * cal.factor;
        fs.writeSync(log, JSON.stringify({ key: task.key, shape: task.shape, cmd: task.cmd, sc: task.sc, cells: stats.cells, estGB: +task.memGB.toFixed(2), estSecs: +est.toFixed(1), secs: +secs.toFixed(1), workers: 1, graphs: stats.graphs, sweepSecs: +stats.sweepSecs.toFixed(1), cpus: os.cpus().length, at: new Date().toISOString() }) + '\n');
      },
    });
    clearInterval(beat);
    fs.closeSync(log);
    console.log(`\nPass ${p.n} done in ${hms((Date.now() - t0) / 1000)}.`);
    const r = report(true);
    console.log(`Preliminary report written: ${r}\n`);
  }
  console.log('All requested passes are complete.');
}

function status() {
  const done = G.readDone(CELLS, false);
  const cal = calibration();
  if (!fs.existsSync(CELLS)) console.log(`No results yet in ${OUT}. Start with: node run.js`);
  else { const st = fs.statSync(CELLS); console.log(`Results: ${CELLS} (${(st.size / 1e6).toFixed(1)} MB, last write ${st.mtime.toLocaleString()})`); }
  console.log(`${done.size} cells done. Time estimates assume ${WORKERS} workers within ${MEM} GB${cal.tasks ? `, calibrated on ${cal.tasks} finished tasks (x${cal.factor.toFixed(2)} vs the built-in estimate)` : ' (not calibrated yet)'}.\n`);
  let cum = 0;
  for (const { p, total, done: d } of passTotals(done)) {
    const rem = remaining(p, done, cal); cum += rem.wall;
    // passes run in order: time left for pass k = its own remaining work after earlier passes finish
    console.log(`Pass ${p.n} (${p.name.padEnd(6)}): ${String(d).padStart(8)} / ${String(total).padEnd(8)} cells (${(100 * d / total).toFixed(1).padStart(5)}%)` +
      (rem.cells ? `   about ${hms(rem.wall)} of work left, complete in about ${hms(cum)}` : '   complete'));
  }
}

// ---------------- report ----------------
const TS = [6, 8, 10, 15];
function loadCells() {
  // per context (shape|avg|cmd|sc): compositions and V0.9 / N (raw) for T = 3..15
  const ctx = new Map(); let n = 0;
  G.forEachLine(CELLS, line => {
    let r; try { r = JSON.parse(line); } catch (e) { return; }
    const k = `${r.shape}|${r.avg}|${r.cmd}|${r.sc}`;
    let c = ctx.get(k);
    if (!c) { c = { shape: r.shape, avg: r.avg, cmd: r.cmd, sc: r.sc, ids: new Map(), comp: [], v: [], nn: [] }; ctx.set(k, c); }
    const key = `${r.L}:${r.D}:${r.R}`; if (c.ids.has(key)) return;
    c.ids.set(key, c.comp.length); c.comp.push([r.L, r.D, r.R]);
    c.v.push(Float32Array.from(r.V09.slice(2, T))); c.nn.push(Float32Array.from(r.N.slice(2, T)));
    n++;
  });
  return { ctx, n };
}
const ti = t => t - 3;
function best(c, metric, t) {
  const arr = metric === 'V' ? c.v : c.nn; let b = -1, bi = -1;
  for (let i = 0; i < arr.length; i++) if (arr[i][ti(t)] > b) { b = arr[i][ti(t)]; bi = i; }
  return { b, bi, arr };
}
function region(c, metric, t) {
  const { b, bi, arr } = best(c, metric, t); const thr = b * (1 - DELTA);
  let lo = 99, hi = 0, cnt = 0, minSrc = 99;
  for (let i = 0; i < arr.length; i++) if (arr[i][ti(t)] >= thr) { const [L, D, R] = c.comp[i]; lo = Math.min(lo, L); hi = Math.max(hi, L); minSrc = Math.min(minSrc, L + D + R); cnt++; }
  return { b, bi, lo, hi, cnt, minSrc, thr };
}
const fmtC = x => x.join(':');
const median = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor((s.length - 1) / 2)] : NaN; };

function report(quiet) {
  const done = G.readDone(CELLS, false);
  const { ctx, n } = loadCells();
  const L = [];
  const p = x => L.push(x);
  const tot = passTotals(done);
  p('# Land count myth, part 2: preliminary grid results (part 1 play rule)');
  p('');
  p(`PRELIMINARY. Generated ${new Date().toISOString()} from ${n} cells. Play and mulligans follow part 1's fixed rule, not optimal play (that is phase 2). ` +
    'Tight curve: exact. Normal curve (normal3): lump-hand-g2 library approximation (about 0.1% error, README). ' +
    'V = discounted useful mana (0.9), N = useful spells cast by T (raw). "Near-optimal" = within 2% of the best deck in the same curve, average, commander and scenario (PREREG δ).');
  p('');
  p('Coverage:');
  p('');
  p('| pass | grid | cells done | of | coverage |'); p('|---|---|---|---|---|');
  for (const { p: q, total, done: d } of tot) p(`| ${q.n} | ${q.name}: step ${q.step}, avgs ${q.avgs.length}, commanders ${q.cmds.join(',')}, ${q.scens.join(',')} | ${d} | ${total} | ${(100 * d / total).toFixed(1)}% |`);
  p('');
  p('Finer passes only add decks, so a best deck or a near-optimal range can still move (usually by one grid step) as coverage grows. Rows and columns appear only where cells exist.');
  p('');
  const ctxs = [...ctx.values()].filter(c => c.comp.length >= 8);
  const uniq = (f, arr = ctxs) => [...new Set(arr.map(f))].sort((x, y) => (typeof x === 'number' ? x - y : String(x).localeCompare(String(y), 'en', { numeric: true })));
  const get = (shape, avg, cmd, sc) => ctx.get(`${shape}|${avg}|${cmd}|${sc}`);

  // 1. best deck and near-optimal land range
  p('## 1. Best deck and near-optimal land range');
  p('');
  p('Each cell: best lands:dorks:rocks, then the land counts found among near-optimal decks (lo-hi). Commander cost 4 (or the most common one present).');
  for (const shape of uniq(c => c.shape)) {
    const cs = ctxs.filter(c => c.shape === shape);
    const cmdN = uniq(c => c.cmd, cs); const cmd = cmdN.includes(4) ? 4 : cmdN[0];
    for (const metric of ['V', 'N']) for (const t of TS) {
      const sc = uniq(c => c.sc, cs.filter(c => c.cmd === cmd)), avgs = uniq(c => c.avg, cs.filter(c => c.cmd === cmd));
      p(''); p(`### ${shape}, ${metric === 'V' ? 'V (useful mana, 0.9)' : 'N (useful spells cast)'}, T = ${t}, commander ${cmd}`); p('');
      p(`| avg cost | ${sc.join(' | ')} |`); p(`|---|${sc.map(() => '---').join('|')}|`);
      for (const avg of avgs) p(`| ${avg} | ${sc.map(s => { const c = get(shape, avg, cmd, s); if (!c) return ''; const r = region(c, metric, t); return `${fmtC(c.comp[r.bi])} (${r.lo}-${r.hi})`; }).join(' | ')} |`);
    }
  }
  p('');

  // 2. commander cost
  p('## 2. Commander cost');
  p('');
  p('Best deck by commander cost, T = 10, middle draw scenario present (P4 if computed).');
  for (const shape of uniq(c => c.shape)) {
    const cs = ctxs.filter(c => c.shape === shape), cmds = uniq(c => c.cmd, cs);
    if (cmds.length < 2) { p(''); p(`${shape}: only commander ${cmds.join(',')} computed so far.`); continue; }
    const scs = uniq(c => c.sc, cs), sc = scs.includes('P4') ? 'P4' : scs[Math.floor(scs.length / 2)];
    for (const metric of ['V', 'N']) {
      p(''); p(`### ${shape}, ${metric}, ${sc}, T = 10`); p('');
      p(`| avg cost | ${cmds.map(c => 'cmd ' + c).join(' | ')} |`); p(`|---|${cmds.map(() => '---').join('|')}|`);
      for (const avg of uniq(c => c.avg, cs)) p(`| ${avg} | ${cmds.map(cm => { const c = get(shape, avg, cm, sc); if (!c) return ''; const r = region(c, metric, 10); return `${fmtC(c.comp[r.bi])} (${r.lo}-${r.hi})`; }).join(' | ')} |`);
    }
  }
  p('');

  // 3. necessity of 36-40 lands
  p('## 3. Is 36-40 lands necessary?');
  p('');
  p('PREREG reading: refuted for an archetype and scenario when a deck with lands outside 36-40 scores within δ (2% of the best deck) of the best deck inside 36-40. ' +
    'Counted over every computed (average, commander, draw scenario) at each T. "fewest lands" = the lowest land count among all near-optimal decks.');
  p('');
  p('| curve | metric | T | contexts | refuted | by fewer than 36 | by more than 40 | best deck inside 36-40 | fewest lands near-optimal: median (min) |');
  p('|---|---|---|---|---|---|---|---|---|');
  for (const shape of uniq(c => c.shape)) for (const metric of ['V', 'N']) for (const t of TS) {
    let k = 0, ref = 0, below = 0, above = 0, inBand = 0; const fl = [];
    for (const c of ctxs.filter(x => x.shape === shape)) {
      const arr = metric === 'V' ? c.v : c.nn; let bIn = -1, bAll = -1;
      for (let i = 0; i < arr.length; i++) { const x = arr[i][ti(t)], Lc = c.comp[i][0]; bAll = Math.max(bAll, x); if (Lc >= 36 && Lc <= 40) bIn = Math.max(bIn, x); }
      if (bIn < 0) continue;
      k++; if (bIn >= bAll) inBand++;
      const thr = bIn - DELTA * bAll; let lo = false, hi = false;
      for (let i = 0; i < arr.length; i++) { const Lc = c.comp[i][0]; if (arr[i][ti(t)] >= thr) { if (Lc < 36) lo = true; if (Lc > 40) hi = true; } }
      if (lo || hi) ref++; if (lo) below++; if (hi) above++;
      fl.push(region(c, metric, t).lo);
    }
    if (k) p(`| ${shape} | ${metric} | ${t} | ${k} | ${ref} | ${below} | ${above} | ${inBand} | ${median(fl)} (${Math.min(...fl)}) |`);
  }
  p('');

  // 4. 38 lands + 10 ramp
  const c38 = ctxs.filter(c => c.comp.some(([Lc, D, R]) => Lc === 38 && D + R === 10));
  p('## 4. "38 lands + 10 ramp"');
  p('');
  if (!c38.length) p('Not on the computed grid yet (needs pass 2: 38 lands is not a step-4 value).');
  else {
    p('Contexts where at least one 38-land, 10-ramp deck (any dork/rock split on the grid) is near-optimal.');
    p(''); p('| curve | metric | T | contexts | 38+10 near-optimal |'); p('|---|---|---|---|---|');
    for (const shape of uniq(c => c.shape, c38)) for (const metric of ['V', 'N']) for (const t of TS) {
      let k = 0, ok = 0;
      for (const c of c38.filter(x => x.shape === shape)) {
        const r = region(c, metric, t), arr = metric === 'V' ? c.v : c.nn; k++;
        if (c.comp.some(([Lc, D, R], i) => Lc === 38 && D + R === 10 && arr[i][ti(t)] >= r.thr)) ok++;
      }
      p(`| ${shape} | ${metric} | ${t} | ${k} | ${ok} |`);
    }
  }
  p('');

  // 5. minimax regret
  p('## 5. Robust choice: minimax regret');
  p('');
  p('Regret of a deck = (best value - its value) / best value, in the same curve, average, commander, draw scenario and T. ' +
    'Ranked by the worst regret over every computed draw scenario and T = 3..15 (PREREG experiment 5), separately per average cost, using only decks computed in every context of that row.');
  for (const shape of uniq(c => c.shape)) for (const metric of ['V', 'N']) {
    p(''); p(`### ${shape}, ${metric}`); p('');
    p('| avg cost | contexts | most robust deck | worst regret | mean regret | runner-up | worst regret |'); p('|---|---|---|---|---|---|---|');
    for (const avg of uniq(c => c.avg, ctxs.filter(c => c.shape === shape))) {
      const cs = ctxs.filter(c => c.shape === shape && c.avg === avg);
      let common = null;
      for (const c of cs) { const ks = new Set(c.ids.keys()); common = common ? new Set([...common].filter(x => ks.has(x))) : ks; }
      const rows = [];
      for (const key of common) {
        let worst = 0, sum = 0, m = 0;
        for (const c of cs) {
          const arr = metric === 'V' ? c.v : c.nn, i = c.ids.get(key);
          for (let t = 3; t <= T; t++) { const b = best(c, metric, t).b; if (b <= 0) continue; const r = (b - arr[i][ti(t)]) / b; worst = Math.max(worst, r); sum += r; m++; }
        }
        rows.push({ key, worst, mean: sum / m });
      }
      rows.sort((x, y) => x.worst - y.worst);
      if (rows.length < 2) continue;
      p(`| ${avg} | ${cs.length} | ${rows[0].key} | ${(100 * rows[0].worst).toFixed(1)}% | ${(100 * rows[0].mean).toFixed(1)}% | ${rows[1].key} | ${(100 * rows[1].worst).toFixed(1)}% |`);
    }
  }
  p('');
  p('Each table is computed from whatever cells exist; rerun `node run.js report` after more passes.');
  const file = path.join(OUT, 'report.md');
  fs.writeFileSync(file, L.join('\n') + '\n');
  if (!quiet) console.log(`Wrote ${file} (${n} cells).`);
  return file;
}

function pack() {
  if (!fs.existsSync(CELLS)) { console.log('Nothing to pack yet.'); return; }
  G.readDone(CELLS); // cut a torn last line first
  const dst = path.join(OUT, 'cells.jsonl.gz');
  const src = fs.createReadStream(CELLS), gz = zlib.createGzip({ level: 6 }), out = fs.createWriteStream(dst);
  src.pipe(gz).pipe(out);
  out.on('finish', () => console.log(`Wrote ${dst} (${(fs.statSync(dst).size / 1e6).toFixed(1)} MB). Send this file and report.md back.`));
}

async function selftest() {
  let ok = G.selftest([['36:5:5', 'tight', 3.5, 4, 'P5', 9], ['28:10:12', 'tight', 3, 2, 'P8', 9], ['28:10:12', 'normal3', 3, 4, 'P1', 10], ['40:3:2', 'normal3', 2.75, 3, 'P8', 7]]);
  // runner round trip: a tiny slice through the worker pool and the results file, compared with exact.js
  const dir = path.join(OUT, 'selftest'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'cells.jsonl'), Tt = 10;
  const sl = { shapes: SHAPES, cmds: [5], scens: ['P3'], avgs: [3.25], step: 12, ...GRID };
  await G.runTasks(G.sliceTasks(sl), { outFile: file, T: Tt, workers: Math.min(4, WORKERS), memGB: MEM, done: new Set(), log: () => {} });
  const recs = []; G.forEachLine(file, l => recs.push(JSON.parse(l)));
  let worst = 0;
  for (const r of recs.filter((x, i) => i % 7 === 0)) {
    const deck = G.deckFor(r);
    const s = E.summarize(E.solve(deck, M.SCENARIOS[r.sc], Tt, r.shape === 'normal3' ? { lumpSpells: 'hand', lumpGroups: 2 } : {}));
    for (const k of ['V09', 'N', 'N09', 'V10']) for (let t = 0; t < Tt; t++) worst = Math.max(worst, Math.abs(r[k][t] - s[t][k]) / Math.max(1e-9, Math.abs(s[t][k])));
  }
  const pass2 = recs.length > 0 && worst < 1e-7;
  console.log(`${pass2 ? 'PASS' : 'FAIL'}  runner round trip: ${recs.length} cells through the worker pool, ${Math.ceil(recs.length / 7)} re-solved with exact.js, max relative diff ${worst.toExponential(1)} (8 digits stored)`);
  fs.rmSync(dir, { recursive: true, force: true });
  process.exitCode = ok && pass2 ? 0 : 1;
}

const cmd = A._[0] || 'run';
const fns = { run, status, report: () => report(false), pack, selftest };
if (!fns[cmd]) { console.log('Usage: node run.js [run|status|report|pack|selftest] [--out DIR] [--workers N] [--max-mem GB] [--pass N]'); process.exitCode = 1; }
else Promise.resolve(fns[cmd]()).catch(e => { console.error('\n' + (e && e.message || e)); process.exitCode = 1; });
