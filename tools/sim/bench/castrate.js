// node castrate.js OUTDIR NAME: for each card the hero cast, the share of games it was cast in, and the win rate in those games vs the rest
const fs = require("fs"), path = require("path");
const [dir, name] = process.argv.slice(2);
let r = [];
for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1)))) r = r.concat(JSON.parse(fs.readFileSync(path.join(dir, f))));
const cards = {};
for (const x of r) for (const k in x.cast || {}) (cards[k] = cards[k] || []).push(x);
const w = a => a.length ? 100 * a.filter(x => x.win).length / a.length : 0;
console.log(`${name}: ${r.length} games, win ${w(r).toFixed(1)}%   (card: cast in % of games | win% when cast | win% otherwise)`);
for (const [k, a] of Object.entries(cards).sort((a, b) => b[1].length - a[1].length)) {
  const rest = r.filter(x => !(x.cast || {})[k]);
  console.log(`  ${k.padEnd(36)} ${(100 * a.length / r.length).toFixed(0).padStart(3)}% | ${w(a).toFixed(0).padStart(3)}% | ${w(rest).toFixed(0).padStart(3)}%`);
}
