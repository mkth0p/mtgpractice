/* node summary.js OUTDIR NAME [BASE]: one Goblin Storm bench run (bench.sh): win rate ± standard error, win rounds,
   won by round 6/8/10, what knocked opponents out, how the hero went out, Zada casts, copies, storm, engine errors.
   With BASE (another run with the same PROCS, games per process, POOL and SEED0), the paired difference by seed. */
"use strict";
const fs = require("fs"), path = require("path");
const [dir, name, base] = process.argv.slice(2);
const load = (nm, ext) => fs.readdirSync(dir).filter(f => f.startsWith(nm + "-") && new RegExp("^\\d+\\." + ext + "$").test(f.slice(nm.length + 1))).flatMap(f => JSON.parse(fs.readFileSync(path.join(dir, f))));
const rows = load(name, "tele\\.json"), games = load(name, "json");
const n = rows.length, wins = rows.filter(r => r.win);
const pct = (k, of = n) => (100 * k / (of || 1)).toFixed(1) + "%";
const p = wins.length / n, se = Math.sqrt(p * (1 - p) / n);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : "-"; };
const avg = a => (a.reduce((x, y) => x + y, 0) / (a.length || 1)).toFixed(2);
const err = games.reduce((s, x) => s + x.errors.length + x.problems.length, 0);
const gold = n && rows[0].opps.every(o => o === "goldfish");
const by = t => pct(wins.filter(r => r.rounds <= t).length);
console.log(`${name}: ${n} games, win ${(100 * p).toFixed(1)}% ±${(100 * se).toFixed(1)} (SE), median win round ${med(wins.map(r => r.rounds))}, won by round ${gold ? "4/5/6/7/8/10: " + [4, 5, 6, 7, 8, 10].map(by).join("/") : "6/8/10/12: " + [6, 8, 10, 12].map(by).join("/")}, draws ${rows.filter(r => r.draw).length}, engine errors/problems ${err}`);
const kills = rows.flatMap(r => r.kills), kb = {};
for (const k of kills) { const key = k.by ? k.by.replace(/^token: /, "token ") : "(not the hero: " + k.why + ")"; kb[key] = (kb[key] || 0) + 1; }
console.log(`  opponents knocked out: ${(kills.length / n).toFixed(2)}/game; last hit: ` + Object.entries(kb).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(", "));
const dm = {};
for (const r of rows) for (const [k, v] of Object.entries(r.dmg)) dm[k] = (dm[k] || 0) + v;
const tot = Object.values(dm).reduce((a, b) => a + b, 0);
console.log(`  damage to opponents ${(tot / n).toFixed(1)}/game: ` + Object.entries(dm).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${(v / n).toFixed(1)}`).join(", "));
const outs = rows.filter(r => !r.win && r.out), why = {};
for (const r of outs) why[r.out.why] = (why[r.out.why] || 0) + 1;
if (!gold) console.log(`  hero out in ${pct(outs.length)} (median round ${med(outs.map(r => r.out.round))}): ${Object.entries(why).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(", ")}`);
console.log(`  per game: spells ${avg(rows.map(r => r.casts))}, commander casts ${avg(rows.map(r => r.zada.length))} (first round median ${med(rows.filter(r => r.zada.length).map(r => r.zada[0]))}), copies ${avg(rows.map(r => r.copies))}, max storm ${avg(rows.map(r => r.storm))} (10+ in ${pct(rows.filter(r => r.storm >= 10).length)}), cards drawn ${avg(rows.map(r => r.drawn))}, mulligans ${avg(rows.map(r => r.mulls))}`);
if (!gold) {
  const opp = {};
  for (const r of rows) for (const o of new Set(r.opps)) { opp[o] = opp[o] || [0, 0]; opp[o][0]++; if (r.win) opp[o][1]++; }
  console.log("  win rate with each opponent at the table: " + Object.entries(opp).sort().map(([k, [a, w]]) => `${k} ${pct(w, a)}`).join(", "));
}
if (base) {
  const b = new Map(load(base, "tele\\.json").map(r => [r.seed, r]));
  let m = 0, s = 0, s2 = 0;
  for (const r of rows) { const q = b.get(r.seed); if (!q) continue; m++; const d = (r.win ? 1 : 0) - (q.win ? 1 : 0); s += d; s2 += d * d; }
  const mean = s / (m || 1), sd = Math.sqrt(Math.max(0, s2 / (m || 1) - mean * mean));
  console.log(`  vs ${base}: ${mean >= 0 ? "+" : ""}${(100 * mean).toFixed(1)} ±${(100 * sd / Math.sqrt(m || 1)).toFixed(1)} pts paired by seed (n ${m})`);
}
