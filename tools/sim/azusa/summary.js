/* node summary.js OUTDIR NAME [BASE]: one Azusa bench run (bench.sh): win rate ± standard error, win rounds,
   the lines the wins came from, Ashaya (cast, removed: by whom), engine errors. With BASE (another run with
   the same PROCS and games per process), the paired difference by seed. */
const fs = require("fs"), path = require("path");
const [dir, name, base] = process.argv.slice(2);
const load = (nm, ext) => fs.readdirSync(dir).filter(f => f.startsWith(nm + "-") && f.slice(nm.length + 1).match(new RegExp("^\\d+\\." + ext + "$"))).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f))));
const rows = load(name, "tele\\.json"), games = load(name, "json");
const n = rows.length, wins = rows.filter(r => r.win);
const pct = (k, of = n) => (100 * k / of).toFixed(1) + "%";
const p = wins.length / n, se = Math.sqrt(p * (1 - p) / n);
const rounds = wins.map(r => r.rounds).sort((a, b) => a - b);
const err = games.reduce((s, x) => s + x.errors.length + x.problems.length, 0);
console.log(`${name}: ${n} games, win ${(100 * p).toFixed(1)}% ±${(100 * se).toFixed(1)} (SE), median win round ${rounds[rounds.length >> 1] || "-"}, avg ${(rounds.reduce((a, b) => a + b, 0) / (rounds.length || 1)).toFixed(1)}, engine errors/problems ${err}`);
// the line of each win: the last kill line noted in the last two rounds, else infinite mana that game, else the rest
const lineOf = r => {
  const late = r.lines.filter(l => l.round >= r.rounds - 1);
  const kill = late.filter(l => l.what === "kill").pop();
  const inf = r.lines.find(l => l.what === "infinite mana");
  if (kill) return (inf ? inf.line + " → " : "") + kill.line;
  if (late.some(l => l.what === "infinite mana")) return late.find(l => l.what === "infinite mana").line + " → combat";
  if (r.lage) return "Marit Lage (Dark Depths)";
  if (r.hoof) return "Craterhoof (no combo)";
  return "other (combat, value)";
};
const by = {};
for (const r of wins) { const k = lineOf(r); by[k] = (by[k] || 0) + 1; }
console.log("  wins by line: " + Object.entries(by).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v} (${pct(v, wins.length)} of wins)`).join("; "));
const inf = rows.filter(r => r.lines.some(l => l.what === "infinite mana"));
if (inf.length) console.log(`  infinite mana in ${pct(inf.length)} of games (won ${pct(inf.filter(r => r.win).length, inf.length)} of those); by engine: ` + Object.entries(inf.reduce((o, r) => { const k = r.lines.find(l => l.what === "infinite mana").line; o[k] = (o[k] || 0) + 1; return o; }, {})).map(([k, v]) => `${k} ${v}`).join(", "));
const ash = rows.filter(r => r.ashaya.length);
if (ash.length) {
  const left = ash.filter(r => r.left.length), opp = ash.filter(r => r.left.some(l => l.by === "opponent" || l.by === "combat"));
  const kinds = {};
  for (const r of ash) for (const l of r.left) { const k = `${l.by}${l.what ? " (" + l.what + ")" : ""}`; kinds[l.by] = (kinds[l.by] || 0) + 1; }
  const whats = {};
  for (const r of ash) for (const l of r.left) if (l.by === "opponent" && l.what) whats[l.what] = (whats[l.what] || 0) + 1;
  console.log(`  Ashaya on the battlefield in ${pct(ash.length)} of games; left it in ${pct(left.length, ash.length)} of those, removed by opponents or combat in ${pct(opp.length, ash.length)}; times: ${Object.entries(kinds).map(([k, v]) => `${k} ${v}`).join(", ")}; first round out median ${(() => { const a = ash.map(r => r.ashaya[0]).sort((x, y) => x - y); return a[a.length >> 1]; })()}`);
  console.log("  opponents' removal on Ashaya: " + Object.entries(whats).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${v}`).join(", "));
}
const opp = {};
for (const r of rows) for (const o of r.opps) { opp[o] = opp[o] || [0, 0]; opp[o][0]++; if (r.win) opp[o][1]++; }
console.log("  win rate with each opponent at the table: " + Object.entries(opp).sort().map(([k, [a, w]]) => `${k} ${pct(w, a)}`).join(", "));
if (base) {
  const b = new Map(load(base, "tele\\.json").map(r => [r.seed, r.win ? 1 : 0]));
  let k = 0, d = 0, dd = 0;
  for (const r of rows) if (b.has(r.seed)) { const x = (r.win ? 1 : 0) - b.get(r.seed); k++; d += x; dd += x * x; }
  const mean = d / k, s2 = Math.sqrt((dd / k - mean * mean) / k);
  console.log(`  paired vs ${base}: ${(100 * mean >= 0 ? "+" : "") + (100 * mean).toFixed(1)} ±${(100 * s2).toFixed(1)} pts (n ${k})`);
}
