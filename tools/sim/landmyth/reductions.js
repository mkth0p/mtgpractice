#!/usr/bin/env node
'use strict';
// State reductions for phase 2, measured against the exact model where the exact model runs.
// Variants (all under part 1's play rule):
//   exact          the reference (exact.js)
//   (the exact lumpings tried first, capping hand lands at the drops left and dropping dead costs,
//    never bind before T=15 and gave no reduction, so they are not listed)
//   lump-base      APPROX: library spells tracked as one count; a drawn spell's cost is drawn
//                  from the deck's base mix K_c/S (per-card marginals right, joint draws not)
//   lump-hand      APPROX: same state; cost drawn from K_c - hand_c - (spells cast) x K_c/S
//   lump-hand-g2   APPROX: as lump-hand, but the library keeps two spell counts (costs <= deck
//                  average, costs above), the cost mix applied within each group
//   tail6 / tail8  APPROX (sampling): exact to the end of turn k, then 1 sampled continuation
//                  per state (stratified); sampling error, not bias
// Writes reductions-results.json next to this file.
// Usage: node reductions.js [--quick] [--set normal3] [--out file]
const fs = require('fs');
const path = require('path');
const M = require('./model');
const E = require('./exact');

const CFGS = [
  ['36:5:5', 'tight', 3.5, 'P1', 15], ['36:5:5', 'tight', 3.5, 'P8', 15], ['30:6:8', 'tight', 3.5, 'P1', 15],
  ['28:10:12', 'tight', 2.5, 'P8', 15], ['42:0:0', 'normal', 3, 'P1', 15], ['42:0:0', 'normal', 4, 'P8', 12],
  ['36:5:5', 'normal', 3, 'P1', 8], ['28:10:12', 'normal', 4, 'P1', 8], ['28:10:12', 'normal', 3, 'P1', 9],
  ['36:5:5', 'normal', 3, 'P8', 5], ['28:10:12', 'normal', 3, 'P8', 5],
];
const VARIANTS = {
  'lump-base': { lumpSpells: true },
  'lump-hand': { lumpSpells: 'hand' },
  'lump-hand-g2': { lumpSpells: 'hand', lumpGroups: 2 },
  tail6: { tailFrom: 6, tailSamples: 1 },
  tail8: { tailFrom: 8, tailSamples: 1 },
};

function total(counts) { return counts.post.slice(1).reduce((a, b) => a + b, 0); }

function main() {
  const a = {}; const v = process.argv.slice(2);
  for (let i = 0; i < v.length; i++) if (v[i].startsWith('--')) { const k = v[i].slice(2); if (v[i + 1] && !v[i + 1].startsWith('--')) a[k] = v[++i]; else a[k] = true; }
  const cfgs = a.set === 'normal3' ? [
    ['28:10:12', 'normal3', 3, 'P1', 15], ['36:5:5', 'normal3', 3.5, 'P1', 15], ['42:0:0', 'normal3', 4, 'P8', 15],
    ['30:6:8', 'normal3', 2.75, 'P4', 12], ['28:10:12', 'normal3', 3, 'P8', 8], ['36:5:5', 'normal3', 3, 'P8', 9],
  ] : a.quick ? CFGS.slice(0, 2) : CFGS;
  const out = [];
  for (const [spec, shape, avg, sc, T] of cfgs) {
    const deck = E.buildDeck(spec, shape, avg), extra = M.SCENARIOS[sc];
    const ref = E.solve(deck, extra, T, {}); const rs = E.summarize(ref);
    const row = { deck: spec, shape, avg, sc, T, exact: { states: total(ref.counts), secs: ref.seconds, V09: rs[T - 1].V09, N09: rs[T - 1].N09 }, variants: {} };
    for (const [name, o] of Object.entries(VARIANTS)) {
      if (o.tailFrom && o.tailFrom >= T) continue;
      const sol = E.solve(deck, extra, T, o); const s = E.summarize(sol);
      const err = { V09: 0, V10: 0, N: 0, N09: 0 }, at = {};
      for (let t = 3; t <= T; t++) for (const k in err) {
        const r = Math.abs(s[t - 1][k] - rs[t - 1][k]) / rs[t - 1][k];
        if (r > err[k]) { err[k] = r; at[k] = t; }
      }
      row.variants[name] = { states: total(sol.counts), ratio: total(sol.counts) / row.exact.states, secs: sol.seconds, maxRelErr: err, atT: at, V09: s[T - 1].V09, N09: s[T - 1].N09 };
    }
    out.push(row);
    console.log(`${spec} ${shape} ${avg} ${sc} T<=${T}: exact ${row.exact.states} states ${row.exact.secs.toFixed(1)}s V0.9=${row.exact.V09.toFixed(4)} N0.9=${row.exact.N09.toFixed(4)}`);
    for (const [k, r] of Object.entries(row.variants))
      console.log(`   ${k.padEnd(14)} states x${r.ratio.toFixed(3)}  ${r.secs.toFixed(1)}s  max rel err over T=3..${T}: V0.9 ${(100 * r.maxRelErr.V09).toFixed(3)}%  V1.0 ${(100 * r.maxRelErr.V10).toFixed(3)}%  N0.9 ${(100 * r.maxRelErr.N09).toFixed(3)}%  N ${(100 * r.maxRelErr.N).toFixed(3)}%`);
    fs.writeFileSync(a.out || path.join(__dirname, 'reductions-results.json'), JSON.stringify({ generated: new Date().toISOString(), results: out }, null, 1));
  }
}
main();
