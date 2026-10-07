// node combos.js NAME...: per combo type (tele.js comboName), games assembled, wins, and the lost games' seed/round
const fs = require("fs"), dir = "tools/sim/bench/out";
for (const name of process.argv.slice(2)) {
  let r = []; for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1)))) r = r.concat(JSON.parse(fs.readFileSync(dir + "/" + f)));
  const c = {}; for (const x of r.filter(x => x.comboName)) { const k = x.comboName; c[k] = c[k] || [0, 0, []]; c[k][0]++; if (x.win) c[k][1]++; else c[k][2].push([x.seed, x.combo, x.rounds, x.heroLost]); }
  console.log(name, r.length, "games;", Object.entries(c).map(([k, v]) => `${k} ${v[0]} won ${v[1]} lost e.g. ${JSON.stringify(v[2].slice(0, 4))}`).join(" | "));
}
