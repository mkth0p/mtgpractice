// node summary.js OUTDIR NAME [HERO_NAME]: win rate, win rounds, damage for one bench run (hero seat only, mirror seats dropped)
const fs = require("fs"), path = require("path");
const [dir, name, me = "Corrupted Etrata"] = process.argv.slice(2);
let r = [];
for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /-\d+\.json$/.test(f) && f.slice(name.length + 1).match(/^\d+\.json$/))) r = r.concat(JSON.parse(fs.readFileSync(path.join(dir, f))));
r = r.filter(x => x.players.filter(q => q.name === me).length === 1);
const n = r.length, w = r.filter(x => x.winner === me).map(x => x.rounds).sort((a, b) => a - b);
const p = w.length / n, se = Math.sqrt(p * (1 - p) / n);
const by = t => (100 * w.filter(x => x <= t).length / n).toFixed(0) + "%";
const err = r.reduce((s, x) => s + x.errors.length + x.problems.length, 0);
console.log(`${name}: games ${n}, win ${(100 * p).toFixed(1)}% ±${(100 * se).toFixed(1)}, avg win round ${(w.reduce((a, b) => a + b, 0) / (w.length || 1)).toFixed(1)}, median ${w[w.length >> 1] || "-"}, won by round 6/7/8: ${by(6)}/${by(7)}/${by(8)}, avg combat dmg ${(r.reduce((s, x) => s + x.players.find(q => q.name === me).dmg, 0) / n).toFixed(0)}, errors ${err}`);
