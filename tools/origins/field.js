/* Builds the field of opponents that the deck search plays against.
   node tools/origins/field.js out/matrix-now.json [--out field.json] [--real ladderNov] [--add out/opt-all.json]

   From a round robin of the real lists it keeps, for every Legendary, the list that does best against the real
   field (two lists for a Legendary with 12% of the games or more). Each Legendary then counts for its share of
   real ladder games, split evenly over its lists. With --add, the given searched lists join the field and take
   `--addShare` (default 0.3) of the total weight, spread like the real shares of their Legendaries. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const AN = require('./analyze.js');

const M = JSON.parse(fs.readFileSync(path.resolve(process.argv[2]), 'utf8'));
const real = AN.REAL[String(L.arg('real', 'ladderNov'))];
const share = {};
let tot = 0;
for (const k in real.wr) { share[k] = real.share ? real.share[k] : real.wr[k][1]; tot += share[k]; }
for (const k in share) share[k] /= tot;
const w0 = AN.fieldWeights(M.decks, share);
const f = AN.vsField(M.wr, w0);
const byLeg = {};
M.decks.forEach((d, i) => { (byLeg[d.legend] || (byLeg[d.legend] = [])).push([f[i], d]); });
const decks = [];
for (const leg in byLeg) {
  if (!share[leg]) continue;
  const lists = byLeg[leg].sort((a, b) => b[0] - a[0]).slice(0, share[leg] >= 0.12 ? 2 : 1);
  for (const [p, d] of lists) decks.push({ key: d.key, legend: d.legend, cards: d.cards, w: share[leg] / lists.length, sim: +p.toFixed(4) });
}
const add = L.arg('add', null);
if (add) {
  const extra = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(add)), 'utf8'));
  const part = L.arg('addShare', 0.3);
  const list = (extra.decks || extra).filter((d) => share[d.legend]);
  const s = list.reduce((a, d) => a + share[d.legend], 0);
  for (const d of decks) d.w *= 1 - part;
  for (const d of list) decks.push({ key: d.key, legend: d.legend, cards: d.cards, w: part * share[d.legend] / s });
}
decks.sort((a, b) => b.w - a.w);
const out = path.join(__dirname, 'out', String(L.arg('out', 'field.json')));
fs.writeFileSync(out, JSON.stringify({ basis: real.label, decks }, null, 1));
console.log(`${decks.length} decks in the field (${real.label}) -> ${out}`);
for (const d of decks) console.log('  ' + d.key.padEnd(16) + (100 * d.w).toFixed(1).padStart(5) + '%' + (d.sim != null ? '   sim ' + (100 * d.sim).toFixed(1) + '%' : ''));
