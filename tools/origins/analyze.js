/* Numbers derived from a round-robin file: win rate against a weighted field, Legendary averages, the Nash mix,
   and how well the simulator's Legendary ranking matches real ladder data.
   node tools/origins/analyze.js out/matrix.json [--real vault30] */
const fs = require('fs');
const path = require('path');
const REAL = require('./real.js');

// Weight of each deck in a field described by Legendary shares; a Legendary's share is split evenly over its lists.
function fieldWeights(decks, share) {
  const count = {};
  for (const d of decks) count[d.legend] = (count[d.legend] || 0) + 1;
  let w = decks.map((d) => (share[d.legend] || 0) / count[d.legend]);
  const t = w.reduce((a, b) => a + b, 0);
  return w.map((x) => x / t);
}
// Expected win rate of every deck against the field (mirror matches count as 50%).
const vsField = (wr, w) => wr.map((row) => row.reduce((a, x, j) => a + x * w[j], 0));
// Legendary level: mean and best of its lists.
function byLegend(decks, val) {
  const out = {};
  decks.forEach((d, i) => { const o = out[d.legend] || (out[d.legend] = { n: 0, sum: 0, best: -1, bestKey: null }); o.n++; o.sum += val[i]; if (val[i] > o.best) { o.best = val[i]; o.bestKey = d.key; } });
  for (const k in out) out[k].mean = out[k].sum / out[k].n;
  return out;
}
// Nash equilibrium of the symmetric zero-sum game "pick a deck" by multiplicative weights; returns the mix and
// how much the best single deck gains against it (0 means exact).
function nash(wr, iters = 40000) {
  const K = wr.length;
  let w = new Array(K).fill(1 / K), avg = new Array(K).fill(0);
  for (let t = 1; t <= iters; t++) {
    const pay = wr.map((row) => row.reduce((a, x, j) => a + (x - 0.5) * w[j], 0));
    const eta = 4 / Math.sqrt(t);
    let s = 0;
    w = w.map((x, i) => { const y = x * Math.exp(eta * pay[i]); s += y; return y; });
    w = w.map((x) => x / s);
    for (let i = 0; i < K; i++) avg[i] += w[i];
  }
  avg = avg.map((x) => x / iters);
  const pay = wr.map((row) => row.reduce((a, x, j) => a + (x - 0.5) * avg[j], 0));
  return { mix: avg, gap: Math.max(...pay), pay };
}
function pearson(x, y) {
  const n = x.length, mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxy / Math.sqrt(sxx * syy);
}
const ranks = (x) => { const o = x.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]); const r = new Array(x.length); o.forEach(([, i], k) => { r[i] = k; }); return r; };
const spearman = (x, y) => pearson(ranks(x), ranks(y));

// Compare with a real data set: the field is weighted by that data set's own play shares (or game counts).
function calibrate(M, real) {
  const share = {};
  for (const k in real.wr) share[k] = real.share ? real.share[k] || 0 : real.wr[k][1];
  const w = fieldWeights(M.decks, share);
  const f = vsField(M.wr, w);
  const leg = byLegend(M.decks, f);
  const rows = Object.keys(real.wr).filter((k) => leg[k]).map((k) => ({ legend: k, real: real.wr[k][0], games: real.wr[k][1], sim: 100 * leg[k].mean, simBest: 100 * leg[k].best, lists: leg[k].n }));
  const x = rows.map((r) => r.real), y = rows.map((r) => r.sim);
  return { rows, pearson: pearson(x, y), spearman: spearman(x, y), mae: rows.reduce((a, r) => a + Math.abs(r.real - r.sim), 0) / rows.length };
}

if (require.main === module) {
  const M = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
  const which = process.argv.includes('--real') ? [process.argv[process.argv.indexOf('--real') + 1]] : (M.patch ? ['vault30', 'meta19oct'] : ['ladderNov']);
  console.log(`${M.decks.length} decks, ${M.n} games per pair, bot ${JSON.stringify(M.bot)}, patch ${M.patch || 'current'}`);
  for (const name of which) {
    const c = calibrate(M, REAL[name]);
    console.log(`\n${REAL[name].label}: Pearson ${c.pearson.toFixed(2)}, Spearman ${c.spearman.toFixed(2)}, mean gap ${c.mae.toFixed(1)} points`);
    for (const r of c.rows.sort((a, b) => b.real - a.real)) console.log('  ' + r.legend.padEnd(26) + `real ${r.real.toFixed(1)}%`.padEnd(13) + `sim ${r.sim.toFixed(1)}% (best list ${r.simBest.toFixed(1)}%, ${r.lists} lists)`);
    if (REAL[name].matchups) for (const [a, b, p] of REAL[name].matchups) {
      let w = 0, n = 0;
      M.decks.forEach((d, i) => M.decks.forEach((e, j) => { if (d.legend === a && e.legend === b) { w += M.wr[i][j]; n++; } }));
      if (n) console.log(`  matchup ${a} vs ${b}: real ${p}%, sim ${(100 * w / n).toFixed(1)}% (${n} list pairs)`);
    }
  }
  const N = nash(M.wr);
  console.log('\nNash mix (decks above 2%), exploitability ' + (100 * N.gap).toFixed(2) + ' points:');
  N.mix.map((x, i) => [x, M.decks[i].key]).filter((x) => x[0] > 0.02).sort((a, b) => b[0] - a[0]).forEach(([x, k]) => console.log('  ' + k.padEnd(16) + (100 * x).toFixed(1) + '%'));
}
module.exports = { fieldWeights, vsField, byLegend, nash, pearson, spearman, calibrate, REAL };
