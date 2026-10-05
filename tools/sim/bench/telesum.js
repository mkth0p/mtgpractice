// node telesum.js OUTDIR NAME: averages of the per-game telemetry (tele.js) of one bench run, and how the wins happened
const fs = require("fs"), path = require("path");
const [dir, name] = process.argv.slice(2);
let r = [];
for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1)))) r = r.concat(JSON.parse(fs.readFileSync(path.join(dir, f))));
if (!r.length) { console.log(`${name}: no telemetry`); process.exit(0); }
const n = r.length, avg = f => (r.reduce((s, x) => s + f(x), 0) / n);
const wins = r.filter(x => x.win);
const pct = (k, of) => (of ? (100 * k / of).toFixed(0) : "0") + "%";
const dmgTot = x => x.dmg.combat + x.dmg.onhit + x.dmg.drain;
console.log(`${name}: ${n} games, win ${pct(wins.length, n)}; per game: commander casts ${avg(x => x.casts).toFixed(2)}, cards stolen ${avg(x => x.steals).toFixed(2)} (Etrata ${avg(x => x.etrataSteals).toFixed(2)}), Etrata flips ${avg(x => x.flips).toFixed(2)} (stolen ${avg(x => x.stolenFlips).toFixed(2)}, free casts ${avg(x => x.freeCasts).toFixed(2)}), stolen cards turned up ${avg(x => x.faceUpStolen).toFixed(2)}`);
console.log(`  life taken from opponents per game: combat ${avg(x => x.dmg.combat).toFixed(1)}, on-hit triggers ${avg(x => x.dmg.onhit).toFixed(1)}, drain ${avg(x => x.dmg.drain).toFixed(1)} (total ${avg(dmgTot).toFixed(1)}), poison ${avg(x => x.dmg.poison).toFixed(1)}`);
// each opponent the hero put out, by kind; and the kill that ended each won game (the last opponent out)
const kinds = {}, last = {};
let outs = 0;
for (const x of r) for (const o of x.outs) { if (o.by !== "hero" && o.kind !== "alt") continue; outs++; kinds[o.kind] = (kinds[o.kind] || 0) + 1; }
for (const x of wins) {
  const o = x.outs[x.outs.length - 1];
  const k = x.altWin ? "alt win (" + x.altWin + ")" : !o ? "?" : o.by === "hero" ? o.kind : o.why === "life" ? "another player's damage" : o.why;
  last[k] = (last[k] || 0) + 1;
}
const fmt = (m, of) => Object.entries(m).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${pct(v, of)}`).join(", ");
console.log(`  opponents the hero put out: ${(outs / n).toFixed(2)} per game (${fmt(kinds, outs)})`);
console.log(`  the last kill in won games: ${fmt(last, wins.length)}`);
// share of all opponent eliminations (in won games) by kind, the hero's or not
const all = {};
let tot = 0;
for (const x of wins) for (const o of x.outs) { tot++; const k = o.by === "hero" ? "hero " + o.kind : o.why === "life" ? "others" : o.why; all[k] = (all[k] || 0) + 1; }
console.log(`  every opponent out in won games: ${fmt(all, tot)}`);
