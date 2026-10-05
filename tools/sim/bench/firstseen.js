// node firstseen.js OUTDIR NAME [card...]: win rate by the round a card first entered for the hero (tele.js "first"), and with it never out
const fs = require("fs"), path = require("path");
const [dir, name, ...cards] = process.argv.slice(2);
let r = [];
for (const f of fs.readdirSync(dir).filter(f => f.startsWith(name + "-") && /^\d+\.tele\.json$/.test(f.slice(name.length + 1)))) r = r.concat(JSON.parse(fs.readFileSync(path.join(dir, f))));
const pct = (a) => a.length ? (100 * a.filter(x => x.win).length / a.length).toFixed(0) + "% of " + a.length : "-";
const list = cards.length ? cards : (() => { const c = {}; for (const x of r) for (const k in x.first || {}) c[k] = (c[k] || 0) + 1; return Object.keys(c).sort((a, b) => c[b] - c[a]).slice(0, 40); })();
console.log(`${name}: ${r.length} games, win ${pct(r)}`);
for (const card of list) {
  const by = k => r.filter(x => x.first && x.first[card] != null && x.first[card] <= k);
  const never = r.filter(x => !x.first || x.first[card] == null);
  console.log(`  ${card.padEnd(34)} out by r3 ${pct(by(3)).padEnd(10)} by r5 ${pct(by(5)).padEnd(10)} by r7 ${pct(by(7)).padEnd(10)} ever ${pct(r.filter(x => x.first && x.first[card] != null)).padEnd(10)} never ${pct(never)}`);
}
