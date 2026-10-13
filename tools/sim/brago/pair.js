/* node pair.js DIR_A NAME_A DIR_B NAME_B: the paired win-rate difference A - B by seed between two bench
   runs whose tele files are in different folders (a Brago run against the Azusa bench's run of the same
   seeds, tools/sim/azusa/bench.sh), and how many games had the same three opponents. */
"use strict";
const fs = require("fs"), path = require("path");
const [da, na, db, nb] = process.argv.slice(2);
const load = (d, n) => fs.readdirSync(d).filter(f => f.startsWith(n + "-") && /^\d+\.tele\.json$/.test(f.slice(n.length + 1))).flatMap(f => JSON.parse(fs.readFileSync(path.join(d, f))));
const a = load(da, na), b = new Map(load(db, nb).map(r => [r.seed, r]));
let n = 0, s = 0, s2 = 0, same = 0;
for (const r of a) {
  const q = b.get(r.seed);
  if (!q) continue;
  n++;
  const d = (r.win ? 1 : 0) - (q.win ? 1 : 0);
  s += d; s2 += d * d;
  if (JSON.stringify(r.opps.slice().sort()) === JSON.stringify(q.opps.slice().sort())) same++;
}
const mean = s / n, sd = Math.sqrt(s2 / n - mean * mean);
console.log(`${na} - ${nb}: ${(100 * mean).toFixed(1)} ±${(100 * sd / Math.sqrt(n)).toFixed(1)} pts paired by seed (n ${n}; same three opponents in ${same})`);
