#!/usr/bin/env node
'use strict';
// Real-ramp variant (PREREG change log 2026-10-13, approved by ju): realistic rocks and dorks.
// OFF by default; the headline results keep the default 2-mana rock and 1-mana dork.
//
// The default model has one rock (cost 2, makes 1 at once) and one dork (cost 1, makes 1 from
// the next turn). In real Commander decks (EDHREC, pool-caps.json):
//   - Sol Ring (cost 1, makes 2) is in 83% of decks, so a deck with R >= 1 rocks plays it;
//   - the other rocks are mostly 2-mana +1 (Arcane Signet, Talismans, Signets, Fellwar Stone, Mind
//     Stone, Thought Vessel), but only so many exist for a colour identity; past that a deck has to
//     play 3-mana +1 rocks (Commander's Sphere, Chromatic Lantern, banners);
//   - 1-mana dorks are green only and run out fast (7 for mono-green, 11 for five colours); past
//     that a deck plays 2-mana dorks (Sylvan Caryatid, Paradise Druid, Myr), and a non-green deck
//     only has 2-mana dorks (2 to 6 realistic ones).
// So a real deck with D dorks and R rocks is, for its colour profile (caps from pool-caps.json):
//   dork1 = min(D, cap dork1), dork2 = D - dork1 (must be <= cap dork2),
//   sol = min(R, 1), rock2 = min(R - sol, cap rock2), rock3 = the rest (must be <= cap rock3);
// a (D, R) beyond the caps is not buildable from the realistic pool for that profile.
// Profile "nocap" changes the rocks only (Sol Ring + 2-mana rocks, no caps): the pure real-rocks effect.
//
//   node realramp.js profiles                         identity -> profile mapping and caps
//   node realramp.js run [--out DIR] [--workers N] [--mem GB] [slice options]   resumable
//   node realramp.js report [--out DIR]               write report.md from the cells
//   node realramp.js selftest                         graph pass == exact.js on real decks
// Slice options (defaults = the comparison run in this container):
//   --shapes tight,normal3 --avgs 3,3.5 --cmds 4 --scens P1,P4 --T 15
//   --lands 20,24,...,48 --dorks 0,2,4,6,8,10,12,15 --rock-counts 0,1,2,4,6,8,12,16,20 --maxramp 25 (rock-counts, not rocks: run.js uses --rocks real)
//   --profiles all (or a list of keys)   --graph-max 4 (GB: bigger shared graphs are replaced by
//   one exact.js solve per deck, slower but small)   --skip-direct (leave those decks out for now)
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const M = require('./model');
const E = require('./exact');
const G = require('./grid');

// Extra ramp classes, in this fixed layout order (counts may be 0).
const CLASSES = [
  { name: 'sol', cost: 1, out: 2 },                 // Sol Ring
  { name: 'rock3', cost: 3, out: 1 },               // 3-mana rocks
  { name: 'dork2', cost: 2, out: 1, tapped: true }, // 2-mana dorks (make mana from the next turn)
];
const DELTA = 0.02;

// ---------- profiles ----------
const POOL = (() => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, 'pool-caps.json'), 'utf8')); } catch (e) { return null; } })();
const ncol = id => (id === 'C' ? 0 : id.length);
const PROFILE_DEFS = [
  { key: 'nocap', label: 'real rocks only: Sol Ring + 2-mana rocks, 1-mana dorks, no pool caps', ids: [] },
  { key: 'C', label: 'colourless', ids: ['C'] },
  { key: 'nonG1', label: 'one colour, not green', test: id => !id.includes('G') && ncol(id) === 1 },
  { key: 'nonG2', label: 'two colours, no green', test: id => !id.includes('G') && ncol(id) === 2 },
  { key: 'nonG34', label: 'three or four colours, no green', test: id => !id.includes('G') && ncol(id) >= 3 },
  { key: 'G1', label: 'mono-green', ids: ['G'] },
  { key: 'G2', label: 'green + one colour', test: id => id.includes('G') && ncol(id) === 2 },
  { key: 'G3', label: 'green + two colours', test: id => id.includes('G') && ncol(id) === 3 },
  { key: 'G45', label: 'four or five colours with green', test: id => id.includes('G') && ncol(id) >= 4 },
];
// rankIdx 2 = realistic (EDHREC rank <= 3000), 0 = every legal card (pool).
function profiles(rankIdx = 2) {
  const out = [];
  for (const d of PROFILE_DEFS) {
    if (d.key === 'nocap') { out.push({ key: d.key, label: d.label, ids: [], caps: { dork1: 99, dork2: 0, rock2: 99, rock3: 0 } }); continue; }
    if (!POOL) throw new Error('pool-caps.json missing: run node pool.js');
    const ids = d.ids || Object.keys(POOL.caps).filter(d.test);
    const caps = {};
    for (const k of ['dork1', 'dork2', 'rock2', 'rock3']) caps[k] = Math.min(...ids.map(id => POOL.caps[id][k][rankIdx]));
    out.push({ key: d.key, label: d.label, ids, caps });
  }
  return out;
}

// Real deck composition of (L, D, R) for a profile's caps, or null if not buildable.
function realComp(L, D, R, caps) {
  const d1 = Math.min(D, caps.dork1), d2 = D - d1;
  if (d2 > caps.dork2) return null;
  const sol = R >= 1 ? 1 : 0, r2 = Math.min(R - sol, caps.rock2), r3 = R - sol - r2;
  if (r3 > caps.rock3) return null;
  return [L, d1, r2, sol, r3, d2];
}
const hasExtra = c => c[3] + c[4] + c[5] > 0;
function rampOf(c) { return CLASSES.map((k, i) => Object.assign({}, k, { count: c[3 + i] })); }
// The deck of a composition [L, dork1, rock2, sol, rock3, dork2]; with no extra class it is the
// default model's deck exactly (no ramp classes at all).
function deckOf(c, shape, avg, cmd) {
  const S = M.DECK_SIZE - c.reduce((a, b) => a + b, 0);
  const counts = M.spellCounts(shape, S, avg); if (!counts) return null;
  return M.makeDeck(c[0], c[1], c[2], counts, cmd, hasExtra(c) ? rampOf(c) : null);
}
const compKey = c => c.join(':');
const cellId = (shape, c, avg, cmd, sc) => `${shape}|${compKey(c)}|${avg}|c${cmd}|${sc}`;

// Universal deck for a group of decks sharing spell costs (and lump grouping): every type's
// count is the group maximum, so every deck's states map into its graph (see grid.js).
function universalFor(decks, lumpGrp) {
  const d0 = decks[0], extra = d0.nX > 0;
  const counts = new Array(M.MAX_COST + 1).fill(0); d0.costs.forEach(c => { counts[c] = 1; });
  const nX = extra ? CLASSES.length : 0;
  const u0 = M.makeDeck(M.DECK_SIZE - d0.costs.length - nX, 0, 0, counts, d0.cmdCost, extra ? CLASSES.map(k => Object.assign({}, k, { count: 1 })) : null);
  const K = u0.K.map((_, i) => Math.max(...decks.map(d => d.K[i])));
  const u = Object.assign({}, u0, { K });
  if (lumpGrp) {
    u.grp = Int32Array.from(lumpGrp); u.G = Math.max(...lumpGrp) + 1;
    u.UG = new Array(u.G).fill(0); d0.costs.forEach((c, j) => { u.UG[u.grp[j]] += K[3 + j]; });
  }
  return u;
}

// ---------- cells ----------
function parseList(s, d) { return (s || d).split(',').map(x => (isNaN(+x) ? x : +x)); }
function slice(a) {
  return {
    shapes: parseList(a.shapes, 'tight,normal3'), avgs: parseList(a.avgs, '3,3.5'), cmds: parseList(a.cmds, '4'), scens: parseList(a.scens, 'P1,P4'),
    lands: parseList(a.lands, '20,24,28,32,36,40,44,48'), dorks: parseList(a.dorks, '0,2,4,6,8,10,12,15'), rocks: parseList(a['rock-counts'], '0,1,2,4,6,8,12,16,20'),
    maxramp: +(a.maxramp || 25), T: +(a.T || 15), graphMax: +(a['graph-max'] || 4), skipDirect: !!a['skip-direct'], profiles: a.profiles && a.profiles !== 'all' ? a.profiles.split(',') : null,
  };
}
// Every (L, D, R) of the slice, and its composition under 'old' and each profile.
function mapping(o) {
  const profs = profiles(2).filter(p => !o.profiles || o.profiles.includes(p.key));
  const pool = Object.fromEntries(profiles(0).map(p => [p.key, p]));
  const rows = [];
  for (const L of o.lands) for (const D of o.dorks) for (const R of o.rocks) {
    if (D + R > o.maxramp) continue;
    const m = { L, D, R, old: [L, D, R, 0, 0, 0], real: {}, pool: {} };
    for (const p of profs) { m.real[p.key] = realComp(L, D, R, p.caps); m.pool[p.key] = realComp(L, D, R, pool[p.key].caps); }
    rows.push(m);
  }
  return { rows, profs };
}
// Unique cells to compute, grouped into graph tasks.
function tasksFor(o, done) {
  const { rows } = mapping(o);
  const comps = new Map();
  for (const m of rows) { comps.set(compKey(m.old), m.old); for (const c of Object.values(m.real)) if (c) comps.set(compKey(c), c); }
  const groups = new Map();
  let total = 0, skipped = 0;
  for (const shape of o.shapes) for (const avg of o.avgs) for (const cmd of o.cmds) for (const sc of o.scens) for (const c of comps.values()) {
    const deck = deckOf(c, shape, avg, cmd); if (!deck) continue;
    total++;
    const id = cellId(shape, c, avg, cmd, sc); if (done && done.has(id)) continue;
    const lump = shape === 'normal3' ? G.lumpGroupsOf(deck) : null;
    const pres = [c[1] > 0, c[2] > 0, c[3] > 0, c[4] > 0, c[5] > 0].map(Number).join(''); // dork1 rock2 sol rock3 dork2 present
    const k = `${shape}|${deck.costs.join('-')}|${lump ? lump.join('') : ''}|c${cmd}|${sc}|${hasExtra(c) ? 'x' : 'd'}${pres}`;
    if (!groups.has(k)) groups.set(k, { key: k, shape, cmd, sc, nCosts: deck.costs.length, pres, cells: [] });
    groups.get(k).cells.push({ id, shape, comp: c, avg, cmd, sc });
  }
  // groups whose shared graph would be too big are solved deck by deck with exact.js instead
  const tasks = [];
  for (const t of groups.values()) {
    if (estimateGB(t, o.T) <= o.graphMax) { tasks.push(t); continue; }
    if (o.skipDirect) { skipped += t.cells.length; continue; }
    for (const c of t.cells) tasks.push(Object.assign({}, t, { key: t.key + '|' + compKey(c.comp) + '|' + c.avg, direct: true, cells: [c] }));
  }
  return { tasks, total, skipped };
}
// Memory estimate (GB) of a task: grid.js's estimate for the default deck times a factor per ramp
// type present beyond it (Sol Ring x2.1 measured on tight 3.5 P4 T = 15; 3-mana rocks and 2-mana
// dorks x3, a guess on the safe side) and x0.5 per default ramp type absent. Direct solves: 1 GB.
const XFACTOR = [0.5, 0.5, 2.1, 3, 3]; // factor when the type is absent (dork1, rock2) or present (sol, rock3, dork2)
function estimateGB(t, T) {
  if (t.direct) return 1;
  let f = 1; for (let i = 0; i < 5; i++) if ((t.pres[i] === '1') === (i >= 2)) f *= XFACTOR[i];
  if (t.pres === '11111') f *= 1.4; // all five ramp types: measured 5.2 GB against 3.8 estimated (tight 3, P4)
  return G.estimateGB({ shape: t.shape, sc: t.sc, cmd: t.cmd, nCosts: t.nCosts }, T) * f;
}
function record(c, deck, sum) {
  const keys = ['V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'rampCast', 'left', 'cmdTurn'];
  const r = { id: c.id, shape: c.shape, comp: c.comp, avg: c.avg, realAvg: +deck.avg.toFixed(4), cmd: c.cmd, sc: c.sc };
  for (const k of keys) r[k] = sum.map(x => +x[k].toPrecision(8));
  return r;
}

// ---------- worker ----------
if (!isMainThread && workerData && workerData.realramp) {
  const { task, T } = workerData;
  const decks = task.cells.map(c => deckOf(c.comp, c.shape, c.avg, c.cmd));
  if (task.direct) {
    task.cells.forEach((c, i) => parentPort.postMessage({ cell: record(c, decks[i], E.summarize(E.solve(decks[i], M.SCENARIOS[c.sc], T, c.shape === 'normal3' ? { lumpSpells: 'hand', lumpGroups: 2 } : {}))) }));
    parentPort.postMessage({ done: true });
    return;
  }
  const lump = task.shape === 'normal3' ? G.lumpGroupsOf(decks[0]) : null;
  const t0 = Date.now();
  const univ = universalFor(decks, lump);
  const g = G.buildGraph(univ, M.SCENARIOS[task.sc], T);
  parentPort.postMessage({ info: `${task.key}: ${(g.states / 1e6).toFixed(1)}M states in ${((Date.now() - t0) / 1000).toFixed(0)}s, ${task.cells.length} decks; rss ${(process.memoryUsage().rss / 1e9).toFixed(2)} GB` });
  task.cells.forEach((c, i) => parentPort.postMessage({ cell: record(c, decks[i], E.summarize(G.sweep(g, univ, decks[i], T))) }));
  parentPort.postMessage({ done: true, states: g.states, secs: (Date.now() - t0) / 1000 });
}

function runTasks(tasks, opts) {
  const { outFile, T, workers, memGB } = opts;
  tasks = tasks.map(t => Object.assign(t, { memGB: estimateGB(t, T) })).sort((a, b) => b.memGB - a.memGB);
  const fd = fs.openSync(outFile, 'a');
  let running = 0, used = 0, n = 0, failed = null;
  return new Promise((resolve, reject) => {
    const pump = () => {
      while (!failed && tasks.length && running < workers) {
        let k = tasks.findIndex(t => t.memGB <= memGB - used);
        if (k < 0) { if (running) break; k = 0; }
        const t = tasks.splice(k, 1)[0]; running++; used += t.memGB;
        const w = new Worker(__filename, { workerData: { realramp: true, task: t, T } });
        let ok = false;
        w.on('message', m => {
          if (m.info && opts.verbose) process.stdout.write(`\n${m.info} [est ${t.memGB.toFixed(1)} GB]\n`);
          if (m.cell) { fs.writeSync(fd, JSON.stringify(m.cell) + '\n'); fs.fsyncSync(fd); n++; if (opts.onCell) opts.onCell(n); }
          if (m.done) ok = true;
        });
        w.on('error', e => { failed = failed || e; });
        w.on('exit', () => {
          running--; used -= t.memGB;
          if (!ok && !failed) failed = new Error(`worker for ${t.key} stopped; rerun to resume`);
          if ((!tasks.length || failed) && !running) { fs.closeSync(fd); return failed ? reject(failed) : resolve(n); }
          pump();
        });
      }
      if (!tasks.length && !running) { fs.closeSync(fd); resolve(n); }
    };
    pump();
  });
}

async function run(a) {
  const o = slice(a);
  const out = path.resolve(a.out || 'landmyth-results-real');
  fs.mkdirSync(out, { recursive: true });
  const file = path.join(out, 'cells-real.jsonl');
  const done = G.readDone(file);
  const { tasks, total, skipped } = tasksFor(o, done);
  const todo = tasks.reduce((x, t) => x + t.cells.length, 0);
  const workers = +(a.workers || Math.max(1, os.cpus().length));
  const memGB = +(a.mem || a['max-mem'] || Math.min(48, Math.floor(0.75 * os.totalmem() / 1024 ** 3)));
  console.log(`Real-ramp variant: ${total} cells (old and real decks), ${total - todo - skipped} done, ${skipped} left out (--skip-direct), ${todo} to run in ${tasks.length} tasks, ${workers} workers within ~${memGB} GB -> ${file}`);
  const t0 = Date.now();
  await runTasks(tasks, { outFile: file, T: o.T, workers, memGB, verbose: !!a.verbose, onCell: n => { if (n % 50 === 0 || n === todo) process.stdout.write(`\r${n}/${todo} cells, ${((Date.now() - t0) / 60000).toFixed(1)} min   `); } });
  console.log(`\ndone in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
  console.log(`report: ${report(a)}`);
}

// ---------- report ----------
const TS = [4, 6, 8, 10, 12, 15];
function loadCells(file) {
  const m = new Map();
  G.forEachLine(file, line => { let r; try { r = JSON.parse(line); } catch (e) { return; } m.set(r.id, r); });
  return m;
}
function report(a) {
  const o = slice(a);
  const out = path.resolve(a.out || 'landmyth-results-real');
  const cells = loadCells(path.join(out, 'cells-real.jsonl'));
  const { rows, profs } = mapping(o);
  const L = [], p = x => L.push(x);
  const variants = [{ key: 'old', label: 'default model (2-mana rock, 1-mana dork)' }, ...profs];
  p('# Land count myth, part 2: real-ramp variant against the default model');
  p('');
  p(`Generated ${new Date().toISOString()} from ${cells.size} cells. Part 1 play rule (generalised for the extra ramp classes, policy1.js), solo goldfish, commander ${o.cmds.join('/')}. ` +
    'V = discounted useful mana (0.9). Near-optimal = within 2% of the best deck of the same variant and context (PREREG δ). ' +
    `Grid: lands ${o.lands.join(',')}; dorks ${o.dorks.join(',')}; rocks ${o.rocks.join(',')}; ramp <= ${o.maxramp}. Tight: exact; normal3: lump-hand-g2.`);
  p('');
  p('Decks are written lands:dorks:rocks as in the default grid; the real deck behind it is [lands, 1-mana dorks, 2-mana rocks, Sol Ring, 3-mana rocks, 2-mana dorks]. ' +
    'A profile only has the (dorks, rocks) its realistic pool can build (pool-caps.json, EDHREC rank <= 3000).');
  p('');
  p('## Profiles (realistic caps)');
  p('');
  p('| profile | identities | 1-mana dorks | 2-mana dorks | 2-mana rocks (besides Sol Ring) | 3-mana rocks |'); p('|---|---|---|---|---|---|');
  for (const q of profs) p(`| ${q.key}: ${q.label} | ${q.ids.join(' ') || '-'} | ${q.caps.dork1 >= 99 ? 'any' : q.caps.dork1} | ${q.caps.dork2} | ${q.caps.rock2 >= 99 ? 'any' : q.caps.rock2} | ${q.caps.rock3} |`);
  p('');
  const ctxs = [];
  for (const shape of o.shapes) for (const avg of o.avgs) for (const cmd of o.cmds) for (const sc of o.scens) ctxs.push({ shape, avg, cmd, sc });
  const val = (ctx, c, t, k = 'V09') => { if (!c) return null; const r = cells.get(cellId(ctx.shape, c, ctx.avg, ctx.cmd, ctx.sc)); return r ? r[k][t - 1] : null; };
  const fmt = m => `${m.L}:${m.D}:${m.R}`;
  const summary = { necessity: {}, outside: {} };
  // per context: best deck and band per variant, necessity, old best outside realistic region
  const bestOf = (ctx, vk, t) => {
    let b = -1, bm = null, missing = 0; const xs = [];
    for (const m of rows) { const c = vk === 'old' ? m.old : m.real[vk]; if (!c) continue; const v = val(ctx, c, t); if (v == null) { missing++; continue; } xs.push([m, v]); if (v > b) { b = v; bm = m; } }
    if (!bm) return null;
    const thr = b * (1 - DELTA); let lo = 99, hi = 0, cnt = 0;
    for (const [m, v] of xs) if (v >= thr) { lo = Math.min(lo, m.L); hi = Math.max(hi, m.L); cnt++; }
    let bIn = -1, bInM = null; for (const [m, v] of xs) if (m.L >= 36 && m.L <= 40 && v > bIn) { bIn = v; bInM = m; }
    const thrN = bIn - DELTA * b; let below = false, above = false;
    for (const [m, v] of xs) if (v >= thrN) { if (m.L < 36) below = true; if (m.L > 40) above = true; }
    return { b, bm, lo, hi, cnt, missing, refuted: below || above, below, above, bIn, bInM, xs };
  };
  p('## 1. Best deck and near-optimal land range, per variant');
  p('');
  p('Each cell: best deck lands:dorks:rocks, the land counts among near-optimal decks (lo-hi); for a profile, its best V against the default model\'s best (%); for the default model, ⚠ when its best deck cannot be built from the realistic pool of some profiles (listed under the table). "partial n" = n decks of the profile\'s region not computed yet (too big for this machine; they run on the Mac).');
  // a context counts only when every default-model deck is computed: without them there is nothing to compare against
  const oldMissing = ctx => rows.filter(m => m.old && val(ctx, m.old, TS[0]) == null).length;
  const done = ctxs.filter(ctx => oldMissing(ctx) === 0);
  for (const ctx of ctxs) {
    p('');
    p(`### ${ctx.shape}, average ${ctx.avg}, commander ${ctx.cmd}, ${ctx.sc}`);
    p('');
    const om = oldMissing(ctx);
    if (om) { p(`Not complete: ${om} of ${rows.filter(m => m.old).length} default-model decks not computed yet, so this context is left out of every table (run the slice again to finish it).`); continue; }
    p(`| variant | ${TS.map(t => `T=${t}`).join(' | ')} |`); p(`|---|${TS.map(() => '---').join('|')}|`);
    const notes = [];
    for (const v of variants) {
      const cellsTxt = TS.map(t => {
        const r = bestOf(ctx, v.key, t); if (!r) return '-';
        let s = `${fmt(r.bm)} (${r.lo}-${r.hi})`;
        if (v.key !== 'old') { const o0 = bestOf(ctx, 'old', t); if (o0) s += ` ${(100 * (r.b / o0.b - 1)).toFixed(1)}%`; }
        if (r.missing) s += ` partial ${r.missing}`;
        if (v.key === 'old') {
          const bad = profs.filter(q => q.key !== 'nocap' && !r.bm.real[q.key]).map(q => q.key + (r.bm.pool[q.key] ? '' : '*'));
          const down = profs.filter(q => q.key !== 'nocap' && r.bm.real[q.key] && (r.bm.real[q.key][4] + r.bm.real[q.key][5] > 0)).map(q => q.key);
          if (bad.length || down.length) { s += ' ⚠'; notes.push(`T=${t}: default best ${fmt(r.bm)}` + (bad.length ? ` not buildable for ${bad.join(', ')}` : '') + (down.length ? `${bad.length ? ';' : ''} only with 2-mana dorks or 3-mana rocks for ${down.join(', ')}` : '')); }
          for (const q of profs) { const k = `${q.key}`, c = r.bm.real[q.key]; summary.outside[k] = summary.outside[k] || [0, 0, 0]; summary.outside[k][1]++; if (!c) summary.outside[k][0]++; else if (c[4] + c[5] > 0) summary.outside[k][2]++; }
        }
        const nk = v.key; summary.necessity[nk] = summary.necessity[nk] || [0, 0, 0, 0]; summary.necessity[nk][1]++; if (r.refuted) summary.necessity[nk][0]++; if (r.below) summary.necessity[nk][2]++; if (r.above) summary.necessity[nk][3]++;
        return s;
      });
      p(`| ${v.key} | ${cellsTxt.join(' | ')} |`);
    }
    if (notes.length) { p(''); p(notes.map(x => `- ${x}`).join('\n') + '\n  (* = not buildable even from the whole legal pool)'); }
  }
  p('');
  p('## 2. Is 36-40 lands necessary? (PREREG necessity test, per variant)');
  p('');
  p(`Refuted in a context when a deck with lands outside 36-40 scores within δ of the best deck inside 36-40. Contexts = ${done.length} x T in {${TS.join(',')}}.`);
  p('');
  p('| variant | refuted | by fewer than 36 | by more than 40 | of |'); p('|---|---|---|---|---|');
  for (const v of variants) { const s = summary.necessity[v.key] || [0, 0, 0, 0]; p(`| ${v.key} | ${s[0]} | ${s[2]} | ${s[3]} | ${s[1]} |`); }
  p('');
  p('## 3. Default best decks outside a profile\'s realistic region');
  p('');
  p('"Downgraded": buildable only by playing 2-mana dorks for the dorks past the 1-mana cap (or 3-mana rocks past the 2-mana cap), so it is not the deck the default model scored.');
  p('');
  p('| profile | default best deck not buildable | buildable only downgraded | of |'); p('|---|---|---|---|');
  for (const q of profs) if (q.key !== 'nocap') { const s = summary.outside[q.key] || [0, 0, 0]; p(`| ${q.key} | ${s[0]} | ${s[2]} | ${s[1]} |`); }
  p('');
  p('## 4. Dorks against rocks at equal count');
  p('');
  p('Gain in V over the no-ramp deck at the same land count, k dorks (k, 0) against k rocks (0, k), at 36 lands. "d/r" = dork gain / rock gain (> 1: dorks better; shown when both gains exceed 0.05). Real rocks include the Sol Ring; real dorks switch to 2-mana dorks past the profile cap.');
  for (const t of [6, 10, 15]) {
    p('');
    p(`### T = ${t}`);
    p('');
    const ks = o.dorks.filter(k => k > 0 && o.rocks.includes(k));
    p(`| context | variant | ${ks.map(k => `k=${k}: dorks / rocks (d/r)`).join(' | ')} |`); p(`|---|---|${ks.map(() => '---').join('|')}|`);
    for (const ctx of done) for (const v of variants) {
      if (!['old', 'nocap', 'G1', 'G3', 'nonG2'].includes(v.key)) continue;
      const row = ks.map(k => {
        const get = (D, R) => { const m = rows.find(x => x.L === 36 && x.D === D && x.R === R); if (!m) return null; return val(ctx, v.key === 'old' ? m.old : m.real[v.key], t); };
        const b0 = get(0, 0), vd = get(k, 0), vr = get(0, k);
        if (b0 == null || vr == null) return '-';
        const gr = vr - b0; if (vd == null) return `n/a / ${gr.toFixed(2)}`;
        const gd = vd - b0;
        return `${gd.toFixed(2)} / ${gr.toFixed(2)}` + (gd > 0.05 && gr > 0.05 ? ` (${(gd / gr).toFixed(2)})` : '');
      });
      p(`| ${ctx.shape} ${ctx.avg} ${ctx.sc} | ${v.key} | ${row.join(' | ')} |`);
    }
  }
  const file = path.join(out, 'report.md');
  fs.writeFileSync(file, L.join('\n') + '\n');
  return file;
}

// ---------- selftest: graph pass vs exact.js on real decks ----------
function selftest() {
  let worst = 0;
  const cases = [[[34, 4, 5, 1, 3, 3], 'tight', 3, 4, 'P1', 10], [[30, 7, 9, 1, 2, 0], 'tight', 3.5, 4, 'P4', 9], [[36, 0, 4, 1, 0, 4], 'normal3', 3, 5, 'P1', 8], [[32, 6, 0, 1, 4, 6], 'normal3', 3.5, 2, 'P1', 6]];
  for (const [c, shape, avg, cmd, sc, T] of cases) {
    const deck = deckOf(c, shape, avg, cmd);
    const other = deckOf(c.map((x, i) => (i === 0 ? x - 2 : i >= 1 ? x + (i === 2 ? 2 : 0) : x)), shape, avg, cmd); // a second deck in the same graph
    const lump = shape === 'normal3' ? G.lumpGroupsOf(deck) : null;
    const univ = universalFor([deck, other], lump);
    const g = G.buildGraph(univ, M.SCENARIOS[sc], T);
    for (const d of [deck, other]) {
      const a = E.summarize(G.sweep(g, univ, d, T));
      const b = E.summarize(E.solve(d, M.SCENARIOS[sc], T, lump ? { lumpSpells: 'hand', lumpGroups: 2 } : {}));
      let md = 0;
      for (let t = 0; t < T; t++) for (const k of ['V09', 'V08', 'V10', 'N', 'N09', 'gen', 'ramp', 'unused', 'left', 'cmdTurn', 'mass']) md = Math.max(md, Math.abs(a[t][k] - b[t][k]));
      worst = Math.max(worst, md);
      console.log(`${md < 1e-9 ? 'PASS' : 'FAIL'}  real-ramp graph pass vs exact.js${lump ? ' (lump-hand-g2)' : ''} ${d.L}:${d.D}:${d.R}+${d.ramp.map(x => x.count).join('/')} ${shape} ${avg} cmd${cmd} ${sc} T<=${T}: max|diff| ${md.toExponential(1)} (graph ${g.states} states)`);
    }
  }
  return worst < 1e-9;
}

function printProfiles() {
  const pr = profiles(2), pool = profiles(0);
  console.log(`pool-caps.json: ${POOL.source}`);
  for (const q of pr) {
    const pq = pool.find(x => x.key === q.key);
    console.log(`${q.key.padEnd(7)} ${q.label}\n        identities: ${q.ids.join(' ') || '-'}\n        realistic caps ${JSON.stringify(q.caps)}; whole pool ${JSON.stringify(pq.caps)}`);
  }
}

function args() {
  const a = { _: [] }; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) { if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] !== undefined && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; } else a._.push(v[i]); }
  return a;
}
async function main(a = args()) {
  const cmd = a._[0] || 'run';
  if (cmd === 'profiles') return printProfiles();
  if (cmd === 'selftest') { process.exitCode = selftest() ? 0 : 1; return; }
  if (cmd === 'report') { console.log(report(a)); return; }
  if (cmd === 'run') return run(a);
  throw new Error('unknown command ' + cmd);
}
module.exports = { CLASSES, profiles, realComp, deckOf, universalFor, mapping, tasksFor, report, selftest, main, slice };
if (isMainThread && require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; });
