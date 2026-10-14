#!/usr/bin/env node
'use strict';
// Land myth part 2: build the web page's data file (lab/part2/data.js) from grid results.
//
//   node build-site-data.js [--play part1|optimal] FILE [FILE ...] [--out ../../../lab/part2/data.js]
//                           [--xT 4,6,8,10,12,15] [--xScen all|P1,P4,P8] [--date ISO]
//
// FILE: a cells.jsonl or cells.jsonl.gz from run.js (one JSON object per line). Several files are
// merged; a cell seen twice (same play and id) keeps the last copy. --play before a file sets the
// play rule of the files after it (default: the cell's own `play` / `policy` field, else part1).
//
// Output: window.LANDMYTH = { meta, dims, ctx, summary, grid, robust }. Aggregates only, never raw
// cells. Numbers live in two gzip + base64 blobs of planes of unsigned bytes / 16-bit integers
// (field-major, so gzip does well); the page inflates them with DecompressionStream. See SITE.md
// for the full schema. Plain Node, no dependencies.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');

// Pre-registered values (PREREG.md) and the run.js passes (copied: run.js runs its CLI on require).
const DELTA = 0.02;
const TMIN = 3, TMAX = 15;
const BAND = [36, 40];
const ALL_AVGS = [2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5];
const ALL_SC = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const SHAPES = ['tight', 'normal3'];
const PASSES = [
  { n: 1, name: 'coarse', cmds: [4], scens: ['P1', 'P4', 'P8'], avgs: [2.5, 3, 3.5, 4], step: 4 },
  { n: 2, name: 'medium', cmds: [2, 3, 4, 5, 6, 7], scens: ALL_SC, avgs: ALL_AVGS, step: 2 },
  { n: 3, name: 'full', cmds: [2, 3, 4, 5, 6, 7], scens: ALL_SC, avgs: ALL_AVGS, step: 1 },
];
const PLAYS = ['part1', 'optimal'];
const Q = 1000; // regret bytes: ceil(regret * 1000), i.e. 0.1% steps; 254 = 25.4% or more; 255 = missing

function compsOf(step) { let n = 0; for (let L = 20; L <= 48; L += step) for (let D = 0; D <= 15; D += step) for (let R = 0; R <= 20; R += step) if (D + R <= 25) n++; return n; }
function inPass(p, c) {
  return p.cmds.includes(c.cmd) && p.scens.includes(c.sc) && p.avgs.includes(c.avg)
    && (c.L - 20) % p.step === 0 && c.D % p.step === 0 && c.R % p.step === 0;
}

function parseArgs(argv) {
  const a = { files: [], out: path.resolve(__dirname, '../../../lab/part2/data.js'), xT: [4, 6, 8, 10, 12, 15], xScen: 'all', date: null };
  let play = null;
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--play') { play = argv[++i]; if (!PLAYS.includes(play)) throw new Error(`--play must be one of ${PLAYS.join(', ')}`); }
    else if (v === '--out') a.out = path.resolve(argv[++i]);
    else if (v === '--xT') a.xT = argv[++i].split(',').map(Number);
    else if (v === '--xScen') a.xScen = argv[++i];
    else if (v === '--date') a.date = argv[++i];
    else if (v === '--keep-partial') a.keepPartial = true;
    else if (v.startsWith('--')) throw new Error('unknown option ' + v);
    else a.files.push({ file: path.resolve(v), play });
  }
  if (!a.files.length) throw new Error('usage: node build-site-data.js [--play part1|optimal] cells.jsonl.gz [...] [--out data.js]');
  return a;
}

// ---------- reading ----------
// A context = (play, curve, commander, average, scenario). Each holds its decks and, per deck,
// V (useful mana, discount 0.9) and N (useful spells cast, raw) for T = TMIN..TMAX.
const NT = TMAX - TMIN + 1;
function playOf(r, forced) {
  if (forced) return forced;
  const p = r.play || r.policy;
  if (p) return /opt/i.test(p) ? 'optimal' : 'part1';
  return /opt/i.test(r.method || '') ? 'optimal' : 'part1';
}
// Phase 2 (run.js --phase 2) stores, per objective, the optimal value for each horizon in H
// (T = 3..15). Map it to phase 1's layout: arrays indexed T - 1, play = optimal.
function fromPhase2(r) {
  const at = obj => { const a = new Array(TMAX).fill(0); r.H.forEach((t, i) => { a[t - 1] = obj.value[i]; }); return a; };
  if (!r.N || !Array.isArray(r.N.value)) return null;
  return { ...r, V09: at(r.V09), N: at(r.N), play: 'optimal' };
}

async function readFile(f, ctxs, stats) {
  const raw = fs.createReadStream(f.file);
  const input = f.file.endsWith('.gz') ? raw.pipe(zlib.createGunzip()) : raw;
  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of rl) {
    if (!line) continue;
    let r; try { r = JSON.parse(line); } catch (e) { stats.torn++; continue; }
    if (r && Array.isArray(r.H) && r.V09 && Array.isArray(r.V09.value)) r = fromPhase2(r);
    if (!r ||!Array.isArray(r.V09) || !Array.isArray(r.N) || r.V09.length < TMAX) { stats.skipped++; continue; }
    const play = playOf(r, f.play);
    const k = `${play}|${r.shape}|${r.cmd}|${r.avg}|${r.sc}`;
    let c = ctxs.get(k);
    if (!c) { c = { play, shape: r.shape, cmd: r.cmd, avg: r.avg, sc: r.sc, ids: new Map(), L: [], D: [], R: [], v: [], n: [], methods: new Set() }; ctxs.set(k, c); }
    const key = r.L * 10000 + r.D * 100 + r.R;
    const v = new Float32Array(NT), n = new Float32Array(NT);
    for (let t = TMIN; t <= TMAX; t++) { v[t - TMIN] = r.V09[t - 1]; n[t - TMIN] = r.N[t - 1]; }
    let i = c.ids.get(key);
    if (i === undefined) { i = c.L.length; c.ids.set(key, i); c.L.push(r.L); c.D.push(r.D); c.R.push(r.R); c.v.push(v); c.n.push(n); stats.cells++; }
    else { c.v[i] = v; c.n[i] = n; stats.dup++; }
    if (r.method) c.methods.add(r.method);
  }
}

// ---------- aggregation ----------
const sortNum = (a, b) => a - b;
const regByte = (best, x) => { if (!(best > 0) || !(x >= 0)) return 255; return Math.min(254, Math.max(0, Math.ceil((best - x) / best * Q - 1e-9))); };

function main(A) {
  return (async () => {
    const t0 = Date.now();
    const ctxMap = new Map(), stats = { cells: 0, dup: 0, torn: 0, skipped: 0 };
    for (const f of A.files) { await readFile(f, ctxMap, stats); }
    const tRead = Date.now();
    // A setting is shown only once it holds every deck of the coarse (pass 1) grid: a half-filled
    // setting's "best deck" is just the best of whatever finished first (--keep-partial keeps them).
    if (!A.keepPartial) {
      const coarse = []; for (let L = 20; L <= 48; L += 4) for (let D = 0; D <= 15; D += 4) for (let R = 0; R <= 20; R += 4) if (D + R <= 25) coarse.push(L * 10000 + D * 100 + R);
      let dropped = 0, droppedCells = 0;
      for (const [k, c] of ctxMap) if (!coarse.every(id => c.ids.has(id))) { ctxMap.delete(k); dropped++; droppedCells += c.L.length; }
      if (dropped) console.log(`left out ${dropped} settings (${droppedCells} cells) that do not yet hold every coarse-grid deck`);
    }

    // dimensions, sorted
    const uniq = (f, num = true) => [...new Set([...ctxMap.values()].map(f))].sort(num ? sortNum : undefined);
    const plays = PLAYS.filter(p => [...ctxMap.values()].some(c => c.play === p));
    const curves = SHAPES.filter(s => [...ctxMap.values()].some(c => c.shape === s));
    const cmds = uniq(c => c.cmd), avgs = uniq(c => c.avg);
    const scens = ALL_SC.filter(s => [...ctxMap.values()].some(c => c.sc === s));
    const Ts = []; for (let t = TMIN; t <= TMAX; t++) Ts.push(t);
    const xT = A.xT.filter(t => t >= TMIN && t <= TMAX);
    const xScen = A.xScen === 'all' ? scens : A.xScen.split(',').filter(s => scens.includes(s));
    const ctxs = [...ctxMap.values()].sort((a, b) => plays.indexOf(a.play) - plays.indexOf(b.play) || curves.indexOf(a.shape) - curves.indexOf(b.shape)
      || a.cmd - b.cmd || a.avg - b.avg || scens.indexOf(a.sc) - scens.indexOf(b.sc));
    // explorer axes: every land count and every total ramp present anywhere
    const lands = new Set(), ramps = new Set();
    for (const c of ctxs) for (let i = 0; i < c.L.length; i++) { lands.add(c.L[i]); ramps.add(c.D[i] + c.R[i]); }
    const gL = [...lands].sort(sortNum), gR = [...ramps].sort(sortNum);
    const gLi = new Map(gL.map((x, i) => [x, i])), gRi = new Map(gR.map((x, i) => [x, i]));

    // ---- summary planes: per (context, metric, T) ----
    const NS = ctxs.length * 2 * NT;
    const F = {
      bestL: new Uint8Array(NS), bestD: new Uint8Array(NS), bestR: new Uint8Array(NS),
      landLo: new Uint8Array(NS), landHi: new Uint8Array(NS), srcLo: new Uint8Array(NS), srcHi: new Uint8Array(NS),
      nNear: new Uint16Array(NS), best100: new Uint16Array(NS),
      // necessity of 36-40: bit0 a 36-40 deck exists, bit1 the best deck is inside 36-40,
      // bit2 refuted by a deck below 36, bit3 refuted by a deck above 40
      band: new Uint8Array(NS), regBand: new Uint8Array(NS),
      reg3810: new Uint8Array(NS),           // best 38 lands + 10 ramp deck (any split); 255 = not on the grid
      regAllD: new Uint8Array(NS), regAllR: new Uint8Array(NS), // best deck's lands and ramp total, all dorks / all rocks
    };
    const sIdx = (ci, m, ti) => (ci * 2 + m) * NT + ti;
    // ---- explorer grid planes: per (explorer context, metric, xT): regret of the best split per (lands, ramp) ----
    const xCtx = []; const ctxX = new Int32Array(ctxs.length).fill(-1);
    ctxs.forEach((c, ci) => { if (xScen.includes(c.sc)) { ctxX[ci] = xCtx.length; xCtx.push(ci); } });
    const GC = gL.length * gR.length;
    const grid = new Uint8Array(xCtx.length * 2 * xT.length * GC).fill(255);
    const gIdx = (xi, m, k) => ((xi * 2 + m) * xT.length + k) * GC;
    const bestVal = ctxs.map(() => [new Float64Array(NT), new Float64Array(NT)]);

    ctxs.forEach((c, ci) => {
      const nd = c.L.length;
      const keyIdx = c.ids;
      for (let m = 0; m < 2; m++) {
        const arr = m === 0 ? c.v : c.n;
        for (let ti = 0; ti < NT; ti++) {
          let b = -Infinity, bi = -1, bIn = -Infinity;
          for (let i = 0; i < nd; i++) { const x = arr[i][ti]; if (x > b) { b = x; bi = i; } if (c.L[i] >= BAND[0] && c.L[i] <= BAND[1] && x > bIn) bIn = x; }
          bestVal[ci][m][ti] = b;
          const s = sIdx(ci, m, ti), thr = b * (1 - DELTA);
          let lLo = 99, lHi = 0, sLo = 255, sHi = 0, cnt = 0, lo = false, hi = false, b3810 = -Infinity;
          const thrIn = bIn - DELTA * b;
          for (let i = 0; i < nd; i++) {
            const x = arr[i][ti], L = c.L[i], src = L + c.D[i] + c.R[i];
            if (x >= thr) { cnt++; if (L < lLo) lLo = L; if (L > lHi) lHi = L; if (src < sLo) sLo = src; if (src > sHi) sHi = src; }
            if (bIn > -Infinity && x >= thrIn) { if (L < BAND[0]) lo = true; if (L > BAND[1]) hi = true; }
            if (L === 38 && c.D[i] + c.R[i] === 10 && x > b3810) b3810 = x;
          }
          F.bestL[s] = c.L[bi]; F.bestD[s] = c.D[bi]; F.bestR[s] = c.R[bi];
          F.landLo[s] = lLo; F.landHi[s] = lHi; F.srcLo[s] = sLo; F.srcHi[s] = sHi;
          F.nNear[s] = Math.min(65535, cnt); F.best100[s] = Math.min(65535, Math.round(b * 100));
          F.band[s] = (bIn > -Infinity ? 1 : 0) | (c.L[bi] >= BAND[0] && c.L[bi] <= BAND[1] ? 2 : 0) | (lo ? 4 : 0) | (hi ? 8 : 0);
          F.regBand[s] = bIn > -Infinity ? regByte(b, bIn) : 255;
          F.reg3810[s] = b3810 > -Infinity ? regByte(b, b3810) : 255;
          const rt = c.D[bi] + c.R[bi], L = c.L[bi];
          const iD = keyIdx.get(L * 10000 + rt * 100), iR = keyIdx.get(L * 10000 + rt);
          F.regAllD[s] = iD === undefined ? 255 : regByte(b, arr[iD][ti]);
          F.regAllR[s] = iR === undefined ? 255 : regByte(b, arr[iR][ti]);
        }
        const xi = ctxX[ci];
        if (xi >= 0) xT.forEach((t, k) => {
          const ti = t - TMIN, b = bestVal[ci][m][ti], o = gIdx(xi, m, k);
          for (let i = 0; i < nd; i++) {
            const g = o + gLi.get(c.L[i]) * gR.length + gRi.get(c.D[i] + c.R[i]);
            const r = regByte(b, arr[i][ti]); if (r < grid[g] || grid[g] === 255) grid[g] = r;
          }
        });
      }
    });

    // ---- robust picks: minimax regret per (play, curve, metric, average, commander or all) ----
    const SCOPES = [{ id: 'all', t0: 3, t1: 15 }, { id: 'mid', t0: 6, t1: 12 }];
    const robust = [];
    for (const play of plays) for (const shape of curves) for (const avg of avgs) {
      const base = ctxs.map((c, ci) => ({ c, ci })).filter(o => o.c.play === play && o.c.shape === shape && o.c.avg === avg);
      if (!base.length) continue;
      const groups = [{ cmd: 'all', cs: base }];
      const cmdHere = [...new Set(base.map(o => o.c.cmd))].sort(sortNum);
      if (cmdHere.length > 1) for (const cm of cmdHere) groups.push({ cmd: cm, cs: base.filter(o => o.c.cmd === cm) });
      for (const g of groups) {
        let common = null;
        for (const { c } of g.cs) { const ks = new Set(c.ids.keys()); common = common ? new Set([...common].filter(x => ks.has(x))) : ks; }
        for (let m = 0; m < 2; m++) for (const sc of SCOPES) {
          const rows = [];
          for (const key of common) {
            let worst = 0, sum = 0, k = 0;
            for (const { c, ci } of g.cs) {
              const arr = m === 0 ? c.v : c.n, i = c.ids.get(key);
              for (let t = sc.t0; t <= sc.t1; t++) { const b = bestVal[ci][m][t - TMIN]; if (!(b > 0)) continue; const r = (b - arr[i][t - TMIN]) / b; if (r > worst) worst = r; sum += r; k++; }
            }
            rows.push({ key, worst, mean: k ? sum / k : 0 });
          }
          if (rows.length < 2) continue;
          rows.sort((x, y) => x.worst - y.worst || x.mean - y.mean);
          const dec = key => [Math.floor(key / 10000), Math.floor(key / 100) % 100, key % 100];
          const fmt = r => [...dec(r.key), +(r.worst * 100).toFixed(2), +(r.mean * 100).toFixed(2)];
          const inBand = rows.find(r => { const L = dec(r.key)[0]; return L >= BAND[0] && L <= BAND[1]; });
          const minSrc = rows.filter(r => r.worst <= rows[0].worst + DELTA);
          robust.push({ play, curve: shape, avg, cmd: g.cmd, metric: m ? 'N' : 'V', scope: sc.id, contexts: g.cs.length, decks: rows.length,
            top: rows.slice(0, 3).map(fmt), band: inBand ? fmt(inBand) : null,
            // land range of the decks whose worst regret is within 2 points of the most robust one
            nearLands: [Math.min(...minSrc.map(r => dec(r.key)[0])), Math.max(...minSrc.map(r => dec(r.key)[0]))] });
        }
      }
    }

    // ---- coverage ----
    const coverage = plays.map(play => {
      const cs = ctxs.filter(c => c.play === play);
      let cells = 0; const perPass = PASSES.map(p => ({ n: p.n, name: p.name, step: p.step, done: 0, total: compsOf(p.step) * curves.length * p.cmds.length * p.scens.length * p.avgs.length }));
      for (const c of cs) for (let i = 0; i < c.L.length; i++) {
        cells++;
        const cell = { cmd: c.cmd, sc: c.sc, avg: c.avg, L: c.L[i], D: c.D[i], R: c.R[i] };
        PASSES.forEach((p, k) => { if (inPass(p, cell)) perPass[k].done++; });
      }
      const complete = perPass.filter(p => p.done >= p.total).map(p => p.n);
      const methods = {}; for (const s of curves) methods[s] = [...new Set(cs.filter(c => c.shape === s).flatMap(c => [...c.methods]))];
      return { play, cells, contexts: cs.length, passComplete: complete.length ? Math.max(...complete) : 0, passes: perPass, methods };
    });

    // ---- pack ----
    function pack(planes) {
      const parts = [], fields = []; let off = 0;
      for (const [name, a] of planes) {
        const bytes = Buffer.from(a.buffer, a.byteOffset, a.byteLength);
        if (a.BYTES_PER_ELEMENT === 2 && off % 2) { parts.push(Buffer.alloc(1)); off++; }
        fields.push({ name, type: a.BYTES_PER_ELEMENT === 2 ? 'u16' : 'u8', offset: off, length: a.length });
        parts.push(bytes); off += bytes.length;
      }
      const raw = Buffer.concat(parts); // little-endian on every machine Node runs on
      return { fields, rawBytes: raw.length, b64: zlib.gzipSync(raw, { level: 9 }).toString('base64') };
    }
    const sum = pack(Object.entries(F));
    const grd = pack([['regret', grid]]);

    const out = {
      schema: 1,
      meta: {
        generated: A.date || new Date().toISOString(),
        sources: A.files.map(f => path.basename(f.file)),
        delta: DELTA, band: BAND, discount: 0.9, regretUnit: 1 / Q, missing: 255,
        metrics: { V: 'useful mana, discounted 0.9 per turn (V09)', N: 'useful spells cast by T, raw' },
        coverage,
        stats,
      },
      dims: { plays, curves, cmds, avgs, scens, Ts, xT, xScen, gL, gR, metrics: ['V', 'N'] },
      // contexts: [play index, curve index, commander, average, scenario index, decks]
      ctx: ctxs.map(c => [plays.indexOf(c.play), curves.indexOf(c.shape), c.cmd, c.avg, scens.indexOf(c.sc), c.L.length]),
      // summary planes, index (ctx * 2 + metric) * Ts.length + (T - Ts[0])
      summary: { fields: sum.fields, rawBytes: sum.rawBytes, gz: sum.b64 },
      // explorer planes, index ((xctx * 2 + metric) * xT.length + k) * gL.length * gR.length + li * gR.length + ri
      grid: { ctx: [...ctxX], fields: grd.fields, rawBytes: grd.rawBytes, gz: grd.b64 },
      robust,
    };
    const js = '// Generated by tools/sim/landmyth/build-site-data.js; do not edit by hand. See tools/sim/landmyth/SITE.md.\n'
      + 'window.LANDMYTH = ' + JSON.stringify(out) + ';\n';
    fs.mkdirSync(path.dirname(A.out), { recursive: true });
    fs.writeFileSync(A.out, js);
    const mem = process.memoryUsage();
    console.log(`read ${stats.cells} cells (${stats.dup} duplicates replaced, ${stats.torn} torn lines, ${stats.skipped} skipped) in ${((tRead - t0) / 1000).toFixed(1)} s`);
    console.log(`${ctxs.length} contexts, explorer ${xCtx.length} contexts x ${xT.length} T x ${gL.length}x${gR.length}; summary raw ${(sum.rawBytes / 1024).toFixed(0)} KB, grid raw ${(grd.rawBytes / 1024).toFixed(0)} KB`);
    console.log(`wrote ${A.out}: ${(js.length / 1024).toFixed(0)} KB in ${((Date.now() - t0) / 1000).toFixed(1)} s, peak rss ~${(mem.rss / 1024 ** 2).toFixed(0)} MB`);
    for (const c of coverage) console.log(`  ${c.play}: ${c.cells} cells, pass ${c.passComplete} complete; ` + c.passes.map(p => `pass ${p.n} ${p.done}/${p.total}`).join(', '));
  })();
}

if (require.main === module) {
  let A; try { A = parseArgs(process.argv.slice(2)); } catch (e) { console.error(e.message); process.exit(1); }
  main(A).catch(e => { console.error(e); process.exit(1); });
}
module.exports = { main, parseArgs };
