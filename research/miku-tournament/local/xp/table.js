// node table.js PREFIX [--sort b4|b2|sum]: the paired rows in xp.log whose run names start with PREFIX, both fields side by side
// (B2 = precons, B4 = Bracket 4 bots), sorted by Δ B4 by default (the event's field).
const fs = require("fs"), path = require("path");
const args = process.argv.slice(2), si = args.indexOf("--sort"), by = si >= 0 ? args[si + 1] : "b4";
const pfx = args.filter((a, i) => si < 0 || (i !== si && i !== si + 1))[0] || "";
const rows = new Map();
for (const l of fs.readFileSync(path.join(__dirname, "xp.log"), "utf8").split("\n")) {
  const m = l.match(/^\S+ (\S+)-(b2|b4) \|(.*?)\| \S+: games (\d+), win ([\d.]+)% ±([\d.]+).*?avg win round ([\d.]+).*\| vs (\S+): \S+\s+([+-][\d.]+) ±([\d.]+)/);
  if (!m || !m[1].startsWith(pfx)) continue;
  let swap = (m[3].match(/list=(\S+)/) || [])[1] || "";
  const v = (m[3].match(/variant=(\{.*\})/) || [])[1];
  if (v) try { const j = JSON.parse(v); swap += (swap ? " " : "") + (j.cut || []).map((c, i) => c + " → " + (j.add || [])[i]).join("; "); } catch (e) {}
  const r = rows.get(m[1]) || { name: m[1], swap, base: m[8] }; rows.set(m[1], r);
  r[m[2]] = { win: +m[5], se: +m[6], rnd: +m[7], d: +m[9], dse: +m[10], n: +m[4] };
}
const list = [...rows.values()].filter(r => r.b2 && r.b4);
const key = r => by === "sum" ? r.b2.d + r.b4.d : r[by].d;
list.sort((a, b) => key(b) - key(a));
const f = x => `${x.d >= 0 ? "+" : ""}${x.d} ±${x.dse}`;
console.log(`| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |\n|---|---|---|---|---|---|---|`);
for (const r of list) console.log(`| ${r.name} | ${r.swap} | ${r.b4.win}% | ${f(r.b4)} | ${r.b2.win}% | ${f(r.b2)} | ${r.base} |`);
