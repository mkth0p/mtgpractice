/* node summary.js OUTDIR NAME [BASE]: one Brago bench run (bench.sh): win rate ± standard error, win rounds,
   won by round 6/8/10, the lines the wins came from, how the hero went out, Brago cast and connecting,
   engine errors. Goldfish runs (opponents "goldfish") also print the kill-by-round-3/4/5/6 rates. With BASE
   (another run with the same PROCS and games per process), the paired difference by seed. */
"use strict";
const fs = require("fs"), path = require("path");
const [dir, name, base] = process.argv.slice(2);
const load = (nm, ext) => fs.readdirSync(dir).filter(f => f.startsWith(nm + "-") && new RegExp("^\\d+\\." + ext + "$").test(f.slice(nm.length + 1))).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f))));
const rows = load(name, "tele\\.json"), games = load(name, "json");
const n = rows.length, wins = rows.filter(r => r.win);
const pct = (k, of = n) => (100 * k / (of || 1)).toFixed(1) + "%";
const p = wins.length / n, se = Math.sqrt(p * (1 - p) / n);
const rounds = wins.map(r => r.rounds).sort((a, b) => a - b);
const err = games.reduce((s, x) => s + x.errors.length + x.problems.length, 0);
const by = t => pct(wins.filter(r => r.rounds <= t).length);
const gold = rows.length && rows[0].opps.every(o => o === "goldfish");
console.log(`${name}: ${n} games, win ${(100 * p).toFixed(1)}% ±${(100 * se).toFixed(1)} (SE), median win round ${rounds[rounds.length >> 1] || "-"}, avg ${(rounds.reduce((a, b) => a + b, 0) / (rounds.length || 1)).toFixed(2)}, won by round ${gold ? "3/4/5/6/8: " + [3, 4, 5, 6, 8].map(by).join("/") : "6/8/10: " + [6, 8, 10].map(by).join("/")}, draws ${rows.filter(r => r.draw).length}, engine errors/problems ${err}`);
// the line of each win: the last kill noted in the last two rounds (with the engine that made the mana), else combat or other
const lineOf = r => {
  const late = r.lines.filter(l => l.round >= r.rounds - 1);
  const kill = late.filter(l => l.what === "kill").pop();
  const inf = late.filter(l => l.what === "infinite").pop();
  if (kill) return (inf ? inf.line + " → " : "") + kill.line;
  if (inf) return inf.line + " → other";
  return "no combo (combat, value)";
};
const byLine = {};
for (const r of wins) { const k = lineOf(r); byLine[k] = (byLine[k] || 0) + 1; }
console.log("  wins by line: " + Object.entries(byLine).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v} (${pct(v, wins.length)})`).join("; "));
const inf = rows.filter(r => r.lines.some(l => l.what === "infinite"));
if (inf.length) {
  const eng = {};
  for (const r of inf) { const k = r.lines.find(l => l.what === "infinite").line; eng[k] = (eng[k] || 0) + 1; }
  console.log(`  infinite mana or loop in ${pct(inf.length)} of games (won ${pct(inf.filter(r => r.win).length, inf.length)} of those); first engine: ` + Object.entries(eng).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", "));
}
const outs = rows.filter(r => !r.win && r.out);
const why = {}, whose = {};
for (const r of outs) { why[r.out.why] = (why[r.out.why] || 0) + 1; const k = r.out.turnOf || "?"; whose[k] = (whose[k] || 0) + 1; }
const outR = outs.map(r => r.out.round).sort((a, b) => a - b);
if (!gold) console.log(`  hero out in ${pct(outs.length)} of games (median round ${outR[outR.length >> 1] || "-"}): ${Object.entries(why).map(([k, v]) => `${k} ${v}`).join(", ")}; on the turn of ${Object.entries(whose).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}`);
const cast = rows.filter(r => r.casts.length), hit = rows.filter(r => r.hits.length);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
console.log(`  Brago cast in ${pct(cast.length)} (first round median ${med(cast.map(r => r.casts[0])) || "-"}), connected in ${pct(hit.length)} (hits per game ${(rows.reduce((s, r) => s + r.hits.length, 0) / n).toFixed(2)}); mulligans ${(rows.reduce((s, r) => s + r.mulls, 0) / n).toFixed(2)}/game`);
if (!gold) {
  const opp = {};
  for (const r of rows) for (const o of new Set(r.opps)) { opp[o] = opp[o] || [0, 0]; opp[o][0]++; if (r.win) opp[o][1]++; }
  console.log("  win rate with each opponent at the table: " + Object.entries(opp).sort().map(([k, [a, w]]) => `${k} ${pct(w, a)}`).join(", "));
}
if (base) {
  const b = new Map(load(base, "tele\\.json").map(r => [r.seed, r]));
  let k = 0, d = 0, dd = 0, kr = 0, dr = 0, ddr = 0;
  for (const r of rows) if (b.has(r.seed)) {
    const q = b.get(r.seed), x = (r.win ? 1 : 0) - (q.win ? 1 : 0);
    k++; d += x; dd += x * x;
    if (gold && r.win && q.win) { const y = r.rounds - q.rounds; kr++; dr += y; ddr += y * y; }
  }
  const mean = d / k, s2 = Math.sqrt(Math.max(0, dd / k - mean * mean) / k);
  console.log(`  paired vs ${base}: ${(100 * mean >= 0 ? "+" : "") + (100 * mean).toFixed(1)} ±${(100 * s2).toFixed(1)} pts (n ${k})` + (kr ? `; kill round where both won: ${(dr / kr >= 0 ? "+" : "") + (dr / kr).toFixed(2)} ±${Math.sqrt(Math.max(0, ddr / kr - (dr / kr) ** 2) / kr).toFixed(2)} (n ${kr})` : ""));
}
