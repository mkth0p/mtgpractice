/* node manacompare.js DIR BASE NAME...: compares mana.js runs made by the sweep script. For each NAME it reads
   DIR/NAME-b4-*.json (games against three Bracket 4 bots) and DIR/NAME-gf-*.json (goldfish: three opponents who
   do nothing). Prints, per variant:
     win%      against the Bracket 4 bots, ± one standard error, and the paired difference to BASE (same seeds)
     gf kill   goldfish winning round: median, mean, and the share of games won by round 6
     mana      the 8-turn profile against the bots: the sum over turns 1-8 of the average per-turn produced,
               useful (commander + spells + abilities), ramp and wasted mana (combo turns left out), and the
               extra cards drawn in those turns
     keep7     share of opening 7s kept (bot games and goldfish games together)
   --md prints a Markdown table. */
"use strict";
const fs = require("fs"), path = require("path");
const [dir, base, ...rest] = process.argv.slice(2).filter(a => !a.startsWith("--"));
const MD = process.argv.includes("--md");
const load = (n, kind) => [].concat(...fs.readdirSync(dir).filter(f => f.startsWith(`${n}-${kind}-`) && f.endsWith(".json")).sort().map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))));
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN;
function profile(rows) {
  const o = { produced: 0, useful: 0, ramp: 0, wasted: 0, drawn: 0 };
  for (let k = 1; k <= 8; k++) {
    const cs = rows.map(r => r.cycles.find(c => c.k === k)).filter(c => c && !c.combo);
    o.produced += mean(cs.map(c => c.produced)); o.ramp += mean(cs.map(c => c.ramp)); o.wasted += mean(cs.map(c => c.wasted));
    o.useful += mean(cs.map(c => c.commander + c.spells + c.ability));
    o.drawn += mean(cs.map(c => Math.max(0, (c.drawn || 0) - 1)));
  }
  return o;
}
const B = load(base, "b4"), bySeed = new Map(B.map(r => [r.seed, r.win ? 1 : 0]));
const out = [];
for (const n of [base, ...rest]) {
  const b4 = load(n, "b4"), gf = load(n, "gf");
  if (!b4.length) { console.error("no runs for " + n); continue; }
  const w = mean(b4.map(r => r.win ? 1 : 0)), se = Math.sqrt(w * (1 - w) / b4.length);
  const d = b4.filter(r => bySeed.has(r.seed)).map(r => (r.win ? 1 : 0) - bySeed.get(r.seed));
  const dm = mean(d), dse = Math.sqrt(d.reduce((s, x) => s + (x - dm) ** 2, 0) / Math.max(1, d.length - 1) / Math.max(1, d.length));
  const wr = gf.filter(r => r.win).map(r => r.round).sort((a, b) => a - b);
  const p = profile(b4);
  out.push({ n, games: b4.length, win: w, se, diff: n === base ? null : dm, dse, gfGames: gf.length, gfMedian: wr[Math.floor(wr.length / 2)], gfMean: mean(wr), gfBy6: gf.filter(r => r.win && r.round <= 6).length / Math.max(1, gf.length), ...p, keep7: mean(b4.concat(gf).map(r => r.mulls ? 0 : 1)) });
}
const f = (x, d = 1) => Number.isFinite(x) ? x.toFixed(d) : "-";
if (MD) {
  console.log("| Variant | Win vs B4 bots | vs base (paired) | Goldfish kill round (median / mean) | Goldfish won by round 6 | Mana made, turns 1-8 | Useful | Ramp | Wasted | Extra cards drawn | Keep 7 |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of out) console.log(`| ${r.n} | ${f(100 * r.win)}% ±${f(100 * r.se)} | ${r.diff == null ? "-" : (r.diff >= 0 ? "+" : "") + f(100 * r.diff) + " ±" + f(100 * r.dse)} | ${r.gfMedian} / ${f(r.gfMean, 2)} | ${f(100 * r.gfBy6)}% | ${f(r.produced)} | ${f(r.useful)} | ${f(r.ramp)} | ${f(r.wasted)} | ${f(r.drawn)} | ${f(100 * r.keep7)}% |`);
} else console.log(JSON.stringify(out, null, 1));
