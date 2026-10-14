#!/usr/bin/env node
'use strict';
// Phase 2 gate checks (optimal play and mulligans, opt.js). Prints PASS/FAIL lines.
//   a) optimal value >= part 1 rule's value (phase 1 code) for every deck, horizon T and objective
//      (V0.9, N, and the 0.8 / 1.0 discount solves), to 1e-9;
//   b) optimal value == an independent brute-force expectimax (brute.js: every order of plays, land
//      drop optional, every bottom choice) on short horizons, to 1e-9;
//   c) monotonicity: more extra draws never lower the optimal value (P1 <= P2 <= ... <= P8), the value
//      is nondecreasing in T, and allowing deeper mulligans never lowers it; batch invariance
//      (decks solved together == alone);
//   d) normal3: lump-hand-g2 library vs the exact library under optimal play, where exact fits
//      (reports the max relative error on V and N; PASS if under 0.5%);
//   e) Karsten's optimum: SKIP (see README; his objective and play rules are not specified in the
//      research notes in enough detail to reproduce).
// Usage: node check2.js [--only a,b,c,d,e] [--quick]
const M = require('./model');
const E = require('./exact');
const Gd = require('./grid');
const O = require('./opt');
const { bruteValue } = require('./brute');

const results = [];
function report(name, pass, detail) { results.push(pass); console.log(`${pass === null ? 'SKIP' : pass ? 'PASS' : 'FAIL'}  ${name}  ${detail}`); }
const graphFor = (decks, sc, T, depth, lump) => O.buildOptGraph(Gd.universalDeck(decks[0].costs, decks[0].cmdCost, lump ? Gd.lumpGroupsOf(decks[0]) : null), M.SCENARIOS[sc], T, depth);

function gateA(quick) {
  const cfgs = [
    ['tight', 3, 4, 'P1', 15], ['tight', 3, 2, 'P4', 15], ['tight', 3, 7, 'P8', quick ? 9 : 12],
    ['tight', 3.5, 4, 'P1', quick ? 8 : 10], ['tight', 2.5, 6, 'P4', 8], ['normal3', 3, 4, 'P1', quick ? 6 : 8], ['normal3', 4, 3, 'P8', 6],
  ];
  const specs = ['20:0:0', '48:0:0', '36:5:5', '28:15:10', '24:12:12', '40:0:20', '32:8:0'];
  for (const [shape, avg, cmd, sc, T] of cfgs) {
    const all = specs.map(s => E.buildDeck(s, shape, avg, cmd)).filter(Boolean);
    const byCosts = new Map(); for (const d of all) { const k = d.costs.join() + '/' + (shape === 'normal3' ? Gd.lumpGroupsOf(d).join() : ''); if (!byCosts.has(k)) byCosts.set(k, []); byCosts.get(k).push(d); }
    let worst = Infinity, n = 0, at = '';
    for (const decks of byCosts.values()) {
      const lump = shape === 'normal3';
      const g = graphFor(decks, sc, T, 3, lump);
      const r = O.solveDecks(g, decks, { objectives: ['V09', 'N', 'V08', 'V10'], depth: 3 });
      const h = O.heuristicBaseline(g.univ, M.SCENARIOS[sc], T, decks, O.range(3, T));
      decks.forEach((d, k) => {
        for (const [ok, hk] of [['V09', 'V09'], ['N', 'N'], ['V08', 'V08'], ['V10', 'V10']]) r.results[k].opt[ok].value.forEach((v, i) => {
          const m = v - h.results[k][hk][i]; n++; if (m < worst) { worst = m; at = `${d.L}:${d.D}:${d.R} ${ok} T=${i + 3}`; }
        });
      });
    }
    report(`a  optimal >= part 1 rule, ${shape} ${avg} cmd${cmd} ${sc} T=3..${T}`, worst >= -1e-9, `${n} checks (${specs.length} decks x 4 objectives x T), smallest margin ${worst.toFixed(6)} (${at})`);
  }
}

function gateB(quick) {
  const cases = [
    ['36:5:5', 'tight', 3.5, 4, 'P1', 3, 3], ['30:6:8', 'tight', 2.5, 2, 'P4', 4, 2], ['40:3:2', 'normal3', 2.75, 3, 'P1', 3, 4],
    ['24:12:10', 'tight', 3, 7, 'P1', 4, 3], ['44:0:6', 'tight', 4.5, 5, 'P2', 3, 5],
  ];
  if (!quick) cases.push(['28:10:12', 'tight', 2.5, 3, 'P5', 4, 2]);
  for (const [spec, shape, avg, cmd, sc, T, depth] of cases) {
    const deck = E.buildDeck(spec, shape, avg, cmd);
    const g = graphFor([deck], sc, T, depth, false); // exact library (normal3 too)
    const r = O.solveDecks(g, [deck], { objectives: ['V09', 'N', 'V08'], depth, Hs: [T] });
    const bd = { lands: deck.L, dorks: deck.D, rocks: deck.R, spells: deck.costs.map((c, j) => [c, deck.K[3 + j]]), cmd };
    let worst = 0; const parts = [];
    for (const [ok, obj] of [['V09', { gamma: 0.9, kind: 'mana' }], ['N', { gamma: 1, kind: 'spells' }], ['V08', { gamma: 0.8, kind: 'mana' }]]) {
      const b = bruteValue(bd, M.SCENARIOS[sc], T, obj, depth).value, o = r.results[0].opt[ok].value[0];
      worst = Math.max(worst, Math.abs(o - b)); parts.push(`${ok} ${o.toFixed(6)}`);
    }
    report(`b  optimal == brute-force expectimax, ${spec} ${shape} ${avg} cmd${cmd} ${sc} T=${T} depth ${depth}`, worst < 1e-9, `${parts.join(', ')}; max |diff| ${worst.toExponential(1)}`);
  }
}

function gateC(quick) {
  // extra draws: P1..P8 at a fixed T, every deck
  const T = quick ? 7 : 9, specs = ['36:5:5', '24:12:12', '44:0:0', '30:0:15'];
  for (const [shape, avg, cmd] of [['tight', 3, 4], ['tight', 3.5, 6]]) {
    const decks = specs.map(s => E.buildDeck(s, shape, avg, cmd));
    const vals = {};
    for (const sc of Object.keys(M.SCENARIOS)) {
      if (shape === 'tight' && avg === 3.5 && !['P1', 'P3', 'P5', 'P8'].includes(sc)) continue;
      const g = graphFor(decks, sc, T, 3, false);
      vals[sc] = O.solveDecks(g, decks, { objectives: ['V09', 'N'], depth: 3 }).results;
    }
    const scs = Object.keys(vals); let worst = Infinity, n = 0, worstT = Infinity, worstD = Infinity;
    for (let q = 1; q < scs.length; q++) decks.forEach((d, k) => { for (const ok of ['V09', 'N']) vals[scs[q]][k].opt[ok].value.forEach((v, i) => { n++; worst = Math.min(worst, v - vals[scs[q - 1]][k].opt[ok].value[i]); }); });
    for (const sc of scs) decks.forEach((d, k) => { for (const ok of ['V09', 'N']) { const o = vals[sc][k].opt[ok]; for (let i = 1; i < o.value.length; i++) worstT = Math.min(worstT, o.value[i] - o.value[i - 1]); o.valueAtDepth.forEach(a => { for (let j = 1; j < a.length; j++) worstD = Math.min(worstD, a[j] - a[j - 1]); }); } });
    report(`c  more extra draws never lower the optimum, ${shape} ${avg} cmd${cmd}, ${scs.join(' <= ')}, T=3..${T}`, worst >= -1e-9, `${n} comparisons, smallest step ${worst.toExponential(2)}`);
    report(`c  optimum nondecreasing in T and in mulligan depth (2 -> 3), ${shape} ${avg}`, worstT >= -1e-9 && worstD >= -1e-9, `smallest step in T ${worstT.toExponential(2)}, in depth ${worstD.toExponential(2)}`);
  }
  // batch invariance
  const decks = ['36:5:5', '24:12:12', '44:0:0', '30:0:15', '28:8:8'].map(s => E.buildDeck(s, 'tight', 3, 5));
  const g = graphFor(decks, 'P4', 8, 3, false);
  const all = O.solveDecks(g, decks, { objectives: ['V09', 'N'], depth: 3 }).results;
  let md = 0;
  decks.forEach((d, k) => { const one = O.solveDecks(g, [d], { objectives: ['V09', 'N'], depth: 3 }).results[0]; for (const ok of ['V09', 'N']) for (const key of ['value', 'V09', 'N', 'gen', 'left']) one.opt[ok][key].forEach((v, i) => { md = Math.max(md, Math.abs(v - all[k].opt[ok][key][i])); }); });
  report('c  batch invariance (5 decks solved together vs one at a time)', md < 1e-12, `max |diff| ${md.toExponential(1)}`);
}

function gateD(quick) {
  const cfgs = [[3, 4, 'P1', quick ? 6 : 8], [4, 4, 'P1', quick ? 6 : 7], [2.5, 2, 'P4', 6], [3.5, 7, 'P8', 5]];
  const specs = ['36:5:5', '28:10:12', '42:0:0', '32:12:0'];
  let all = { V: 0, N: 0 };
  for (const [avg, cmd, sc, T] of cfgs) {
    const decks = specs.map(s => E.buildDeck(s, 'normal3', avg, cmd));
    const groups = new Map(); for (const d of decks) { const k = Gd.lumpGroupsOf(d).join(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(d); }
    let eV = 0, eN = 0, states = [0, 0];
    for (const ds of groups.values()) {
      const gx = graphFor(ds, sc, T, 3, false), gl = graphFor(ds, sc, T, 3, true);
      states[0] += gx.states; states[1] += gl.states;
      const rx = O.solveDecks(gx, ds, { objectives: ['V09', 'N'], depth: 3 }).results, rl = O.solveDecks(gl, ds, { objectives: ['V09', 'N'], depth: 3 }).results;
      ds.forEach((d, k) => {
        rx[k].opt.V09.value.forEach((v, i) => { eV = Math.max(eV, Math.abs(rl[k].opt.V09.value[i] - v) / v); });
        rx[k].opt.N.value.forEach((v, i) => { eN = Math.max(eN, Math.abs(rl[k].opt.N.value[i] - v) / v); });
      });
    }
    all.V = Math.max(all.V, eV); all.N = Math.max(all.N, eN);
    report(`d  normal3 ${avg} cmd${cmd} ${sc} T=3..${T}: lump-hand-g2 vs exact library, optimal values`, eV < 0.005 && eN < 0.005, `max relative error V ${(100 * eV).toFixed(3)}%, N ${(100 * eN).toFixed(3)}% (${specs.length} decks; graph states exact ${(states[0] / 1e6).toFixed(1)}M, lumped ${(states[1] / 1e6).toFixed(1)}M)`);
  }
  console.log(`      overall max relative error: V ${(100 * all.V).toFixed(3)}%, N ${(100 * all.N).toFixed(3)}%`);
}

function gateE() {
  report('e  Karsten\'s optimum under his objective', null, 'not reproducible from the research notes: they give his Commander objective only in words (compounded mana on board, turns 1-7, blank 1-6 drops, Sol Ring, 2-mana rocks) without his curve, play or mulligan rules, and nothing for the 60-card study; no web access by instruction');
}

const a = {}; const v = process.argv.slice(2);
for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
const only = a.only ? a.only.split(',') : ['a', 'b', 'c', 'd', 'e'];
const t0 = Date.now();
if (only.includes('b')) gateB(!!a.quick);
if (only.includes('a')) gateA(!!a.quick);
if (only.includes('c')) gateC(!!a.quick);
if (only.includes('d')) gateD(!!a.quick);
if (only.includes('e')) gateE();
const fails = results.filter(x => x === false).length;
console.log(`\n${fails ? 'FAIL' : 'PASS'}: ${results.filter(x => x === true).length} passed, ${fails} failed, ${results.filter(x => x === null).length} skipped (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
process.exitCode = fails ? 1 : 0;
