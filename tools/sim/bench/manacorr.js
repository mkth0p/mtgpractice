/* node manacorr.js FILE.json ...: inside one deck's games, does early mana use go with winning?
   For games where the hero reached its 5th turn: sums turns 1-4 (combo turns left out) of wasted, useful
   (commander + spells + abilities) and produced mana, splits the games into quartiles of each, and prints the
   win rate per quartile, plus the win rate by mulligan count. It's correlation, not cause: a game where the
   deck draws its combo also spends its mana. */
"use strict";
const fs = require("fs");
const rows = [].concat(...process.argv.slice(2).map(f => JSON.parse(fs.readFileSync(f, "utf8"))));
const g = rows.filter(r => r.cycles.some(c => c.k === 5));
const sum = (r, key) => r.cycles.filter(c => c.k <= 4 && !c.combo).reduce((t, c) => t + (key === "useful" ? c.commander + c.spells + c.ability : c[key]), 0);
for (const key of ["wasted", "useful", "produced"]) {
  const s = g.map(r => ({ v: sum(r, key), w: r.win ? 1 : 0 })).sort((a, b) => a.v - b.v);
  const q = [0, 1, 2, 3].map(i => s.slice(Math.floor(i * s.length / 4), Math.floor((i + 1) * s.length / 4)));
  console.log(`${key.padEnd(8)} turns 1-4, quartiles low->high: ` + q.map(a => `${(a.reduce((t, x) => t + x.v, 0) / a.length).toFixed(1)} mana -> ${(100 * a.reduce((t, x) => t + x.w, 0) / a.length).toFixed(1)}% wins`).join(" | "));
}
const byM = {};
for (const r of rows) (byM[r.mulls] = byM[r.mulls] || []).push(r.win ? 1 : 0);
console.log("by mulligans: " + Object.entries(byM).map(([m, a]) => `${m}: ${(100 * a.reduce((x, y) => x + y, 0) / a.length).toFixed(1)}% of ${a.length}`).join(" | "));
console.log(`${g.length} of ${rows.length} games reached turn 5.`);
