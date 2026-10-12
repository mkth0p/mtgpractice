/* node turns.js OUTDIR NAME: how a Brago bench run unfolds by round. For each round: the share of games
   in which the hero had cast Brago, made unlimited mana (a loop the brain noted), won, or was out.
   Rounds count the hero's turns (round 3 = the hero's third turn). Reads the tele files of bench.sh. */
"use strict";
const fs = require("fs"), path = require("path");
const [dir, name] = process.argv.slice(2);
const rows = fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1))).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f))));
const n = rows.length;
const pct = k => (100 * k / n).toFixed(1).padStart(5) + "%";
console.log(`${name}: ${n} games`);
console.log("round  Brago cast  unlimited mana  won    hero out");
for (const R of [2, 3, 4, 5, 6, 7, 8, 10, 12]) {
  const cast = rows.filter(r => r.casts.length && r.casts[0] <= R).length;
  const inf = rows.filter(r => r.lines.some(l => l.what === "infinite" && l.round <= R)).length;
  const won = rows.filter(r => r.win && r.rounds <= R).length;
  const out = rows.filter(r => r.out && r.out.round <= R).length;
  console.log(`${String(R).padStart(5)}  ${pct(cast)}      ${pct(inf)}          ${pct(won)} ${pct(out)}`);
}
