/* Checks the cognitive practice generators (iq/gen.js): every item builds, is the same for the
   same seed, and has exactly one right answer that the rules alone decide.
   Usage: node tools/iq/test-gen.js [--n 300] */
"use strict";
const G = require("../../iq/gen.js");
const N = (i => i > 0 ? +process.argv[i + 1] : 300)(process.argv.indexOf("--n"));
let fails = 0; const fail = (...m) => { fails++; if (fails < 30) console.log("FAIL", ...m); };
const J = JSON.stringify;
const t0 = Date.now();

// matrices: 8 distinct choices, one equals the generated answer, each attribute value in half the choices
for (let lv = 1; lv <= G.MATRIX_MAX; lv++) {
  let bal = 0;
  for (let i = 0; i < N; i++) {
    const m = G.genMatrix("t" + i, lv);
    if (J(m) !== J(G.genMatrix("t" + i, lv))) fail("matrix not deterministic", lv, i);
    if (m.options.length !== 8) fail("matrix options", lv, i);
    if (new Set(m.options.map(J)).size !== 8) fail("matrix duplicate options", lv, i, J(m.options));
    const keys = Object.keys(m.options[0]);
    for (const k of keys) {
      if (Array.isArray(m.options[0][k])) { // sets: each element should be in all, none or half the choices
        for (let e = 0; e < 9; e++) { const c = m.options.filter(o => o[k].includes(e)).length; if (c !== 0 && c !== 8 && c !== 4) bal++; }
        continue;
      }
      const counts = {}; m.options.forEach(o => { const v = J(o[k]); counts[v] = (counts[v] || 0) + 1; }); const ansv = J(m.options[m.correct][k]); if (counts[ansv] === 8) continue; if (counts[ansv] !== 4) bal++; }
    for (const o of m.options) { if (o.pos && !o.pos.length) fail("empty grid", lv, i); if (o.lines && !o.lines.length) fail("empty lines", lv, i); }
  }
  console.log(`matrix level ${lv}: ok, ${bal} attribute values off the half split in ${N} items`);
}
for (let lv = 1; lv <= G.WEIGHT_MAX; lv++) {
  for (let i = 0; i < N; i++) {
    const w = G.genWeights("t" + i, lv), h = w.weightsHidden;
    const tot = ms => ms.reduce((s, k) => s + h[k], 0);
    w.scales.forEach(([a, b]) => { if (tot(a) !== tot(b)) fail("unbalanced scale", lv, i); });
    const right = w.options.filter(o => tot(o) === tot(w.question));
    if (right.length !== 1 || tot(w.options[w.correct]) !== tot(w.question)) fail("weights answer", lv, i);
  }
  console.log(`weights level ${lv}: ok`);
}
for (let lv = 1; lv <= G.VP_MAX; lv++) {
  const n = Math.min(N, 80);
  for (let i = 0; i < n; i++) {
    const p = G.genPuzzle("t" + i, lv);
    if (!G.canTile(p.target, p.correct.map(k => p.pieces[k]))) fail("puzzle answer does not tile", lv, i);
    let fits = 0;
    for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let c = b + 1; c < 6; c++) if (G.canTile(p.target, [p.pieces[a], p.pieces[b], p.pieces[c]])) fits++;
    if (fits !== 1) fail("puzzle not unique", lv, i, fits);
  }
  console.log(`puzzles level ${lv}: ok`);
}
for (let lv = 1; lv <= G.BD_MAX; lv++) for (let i = 0; i < N; i++) G.genBlocks("t" + i, lv);
for (let lv = 1; lv <= G.ARITH_MAX; lv++) for (let i = 0; i < N; i++) { const a = G.genArith("t", lv, i); if (!a || !Number.isInteger(a.answer)) fail("arith", lv, i); }
for (let lv = 1; lv <= G.SERIES_MAX; lv++) for (let i = 0; i < N; i++) { const s = G.genSeries("t" + i, lv); if (new Set(s.options).size !== s.options.length || s.options.length < 4) fail("series options", lv, i, J(s)); }
for (let len = 2; len <= 9; len++) for (const mode of ["forward", "backward", "sequencing"]) { const s = G.genSpan("t", mode, len, 1); if (s.seq.length !== len) fail("span"); }
for (let len = 2; len <= 8; len++) { const s = G.genLNS("t", len, 1); if (!s || s.seq.length !== len) fail("lns", len); }
for (let i = 0; i < N; i++) { const d = G.genDSM("t" + i); if (new Set(d.key).size !== 6 || d.digit.slice().sort().join("") !== "112233" || d.probes.some((k, j) => k === d.probes[j - 1])) fail("dsm", i); }
// open norms: the normal functions and a few hand-checked scores
{
  const NM = require("../../iq/norms.js"), near = (a, b, e) => Math.abs(a - b) <= e;
  if (!near(NM.Phi(1.96), 0.975, 1e-4) || !near(NM.PhiInv(0.975), 1.96, 1e-3) || !near(NM.PhiInv(0.1), -1.2816, 1e-3)) fail("normal cdf");
  const sc = (task, r, extra) => NM.score(Object.assign({ task, mode: "test", result: r }, extra || {}), 30);
  const f6 = sc("dsf", { longest: 6 }); // mid-p of span 6 against 6.35 (1.15)
  const want = NM.PhiInv((NM.Phi((6.5 - 6.35) / 1.15) + NM.Phi((5.5 - 6.35) / 1.15)) / 2);
  if (!near(f6.z, want, 1e-9) || f6.atMax) fail("dsf score", J(f6));
  if (!sc("dsf", { longest: 9 }).atMax || sc("dsb", { longest: 7 }).atMax) fail("ceiling flag");
  const m = sc("dsm", { medianRtc: 1005.3 }), mm = sc("dsm", { medianRtc: 1039.5 }, { device: "mac" });
  if (!near(m.z, 1, 1e-6) || !near(mm.z, (1342.3 - 1039.5) / 302.3, 1e-9)) fail("dsm score", m.z, mm.z);
  const c = NM.composite([f6, m]);
  if (!near(c.z, (f6.z + m.z) / Math.sqrt(2 + 2 * NM.ASSUMED_R), 1e-9) || !(c.lo < c.iq && c.iq < c.hi)) fail("composite", J(c));
  if (NM.score({ task: "matrix", mode: "test", result: { raw: 20 } }, 30) || NM.score({ task: "dsf", mode: "practice", result: { longest: 6 } }, 30)) fail("scored a task or mode without norms");
  console.log(`norms: dsf 6 -> IQ scale ${f6.iq.toFixed(1)}, dsm 1005 ms -> ${m.iq.toFixed(1)}, composite ${c.iq.toFixed(1)} (${c.lo.toFixed(0)} to ${c.hi.toFixed(0)})`);
}
console.log(fails ? `${fails} failures` : `all generators ok (${Date.now() - t0} ms)`);
process.exit(fails ? 1 : 0);
