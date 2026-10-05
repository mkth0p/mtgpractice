// node trace.js OUTDIR NAME: the hero's average state at the start of its turn, by round (tele.js traces), for won and lost games
const fs = require("fs"), path = require("path");
const [dir, name] = process.argv.slice(2);
let r = [];
for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1)))) r = r.concat(JSON.parse(fs.readFileSync(path.join(dir, f))));
const cols = ["life", "creatures", "power", "faceDown", "lands", "hand", "oppLife", "opps"];
for (const [label, set] of [["won", r.filter(x => x.win)], ["lost", r.filter(x => !x.win)]]) {
  console.log(`${name} ${label} (${set.length} games): round | ${cols.join(" ")} | games alive`);
  for (let rd = 1; rd <= 12; rd++) {
    const rows = set.map(x => (x.trace || []).find(t => t[0] === rd)).filter(Boolean);
    if (!rows.length) continue;
    console.log(`  ${String(rd).padStart(2)} | ${cols.map((c, i) => (rows.reduce((s, t) => s + t[i + 1], 0) / rows.length).toFixed(1).padStart(5)).join(" ")} | ${rows.length}`);
  }
}
