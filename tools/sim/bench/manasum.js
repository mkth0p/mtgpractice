/* node manasum.js FILE.json [FILE.json ...]: summarizes mana.js output (one or more processes' files).
   Prints, per turn cycle 1-8, the average mana produced, spent on ramp / commander / spells / abilities, and
   wasted, over the cycles that happened and weren't the hero's winning (combo) cycle. Then the 8-cycle totals
   for games where the hero reached its 8th turn alive (Mano's "first 8 turns" figure), the keep-7 rate, the
   win rate and the median and mean winning round. --json prints the summary as JSON instead. */
"use strict";
const fs = require("fs");
const args = process.argv.slice(2), JSONOUT = args.includes("--json");
const rows = [].concat(...args.filter(a => !a.startsWith("--")).map(f => JSON.parse(fs.readFileSync(f, "utf8"))));
const K = ["produced", "ramp", "commander", "spells", "ability", "wasted"];
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
const sd = a => { const m = mean(a); return a.length > 1 ? Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)) : 0; };
const per = [];
for (let k = 1; k <= 8; k++) {
  const cs = rows.map(r => r.cycles.find(c => c.k === k)).filter(c => c && !c.combo);
  const o = { k, n: cs.length };
  for (const key of K) o[key] = mean(cs.map(c => c[key]));
  o.lands = mean(cs.map(c => c.lands));
  o.drawn = mean(cs.map(c => c.drawn || 0));
  per.push(o);
}
// 8-cycle totals: games where cycles 1-8 all exist (the combo cycle, if it is one of them, counts with its waste set to 0
// and is left out of "useful", as Mano excludes the turn he goes off)
const full = rows.filter(r => [1, 2, 3, 4, 5, 6, 7, 8].every(k => r.cycles.some(c => c.k === k)));
const tot = r => { const o = {}; for (const key of K) o[key] = r.cycles.filter(c => c.k <= 8 && !c.combo).reduce((s, c) => s + c[key], 0); o.useful = o.commander + o.spells + o.ability; return o; };
const T = full.map(tot);
const sum = { games: rows.length, full8: full.length };
for (const key of K.concat("useful")) { sum[key] = mean(T.map(t => t[key])); sum[key + "_se"] = sd(T.map(t => t[key])) / Math.sqrt(Math.max(1, T.length)); }
sum.wastePct = sum.wasted / sum.produced;
sum.keep7 = rows.filter(r => !r.mulls).length / rows.length;
sum.mulls = mean(rows.map(r => r.mulls));
const wins = rows.filter(r => r.win);
sum.win = wins.length / rows.length;
sum.win_se = Math.sqrt(sum.win * (1 - sum.win) / rows.length);
const wr = wins.map(r => r.round).sort((a, b) => a - b);
sum.winRoundMedian = wr.length ? wr[Math.floor(wr.length / 2)] : null;
sum.winRoundMean = mean(wr);
sum.winBy6 = rows.filter(r => r.win && r.round <= 6).length / rows.length;
// waste in the first 8 cycles, over every game, cycles that happened (not only full games)
const all = [].concat(...rows.map(r => r.cycles.filter(c => c.k <= 8 && !c.combo)));
sum.wastePerCycle = mean(all.map(c => c.wasted));
// extra cards drawn in turns 1-8 beyond one a turn (Mano's "energy"), over games that reached turn 8
sum.extraDraws = mean(full.map(r => r.cycles.filter(c => c.k <= 8).reduce((t, c) => t + Math.max(0, (c.drawn || 0) - 1), 0)));
if (JSONOUT) { console.log(JSON.stringify({ sum, per })); process.exit(0); }
const f = x => Number.isFinite(x) ? x.toFixed(2) : "-";
console.log("cycle  n     lands  drawn  produced  ramp  cmdr  spells  abil  wasted");
for (const o of per) console.log(`${String(o.k).padEnd(6)} ${String(o.n).padEnd(5)} ${f(o.lands).padStart(5)}  ${f(o.drawn).padStart(5)}  ${f(o.produced).padStart(8)}  ${f(o.ramp).padStart(4)}  ${f(o.commander).padStart(4)}  ${f(o.spells).padStart(6)}  ${f(o.ability).padStart(4)}  ${f(o.wasted).padStart(6)}`);
console.log(`\n${sum.games} games; ${sum.full8} reached their 8th turn. Over turns 1-8: produced ${f(sum.produced)}, ramp ${f(sum.ramp)}, commander ${f(sum.commander)}, spells ${f(sum.spells)}, abilities ${f(sum.ability)}, wasted ${f(sum.wasted)} ±${f(sum.wasted_se)} (${(100 * sum.wastePct).toFixed(1)}%). Extra cards drawn: ${f(sum.extraDraws)}.`);
console.log(`Keep 7: ${(100 * sum.keep7).toFixed(1)}%, mulligans ${f(sum.mulls)}. Wins ${(100 * sum.win).toFixed(1)}% ±${(100 * sum.win_se).toFixed(1)}, by round 6 ${(100 * sum.winBy6).toFixed(1)}%, winning round median ${sum.winRoundMedian}, mean ${f(sum.winRoundMean)}.`);
