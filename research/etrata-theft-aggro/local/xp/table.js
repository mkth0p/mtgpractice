// node table.js PREFIX [BASE]: the sweep runs in xp.log whose names start with PREFIX, as a markdown table sorted by the sum of both deltas
const fs = require("fs"), path = require("path");
const [pfx] = process.argv.slice(2);
const rows = {};
for (const l of fs.readFileSync(path.join(__dirname, "xp.log"), "utf8").split("\n")) {
  const m = l.match(/^\S+ (\S+)-(b2|b4) \|.*?(?:variant=(\{.*?\}) )?\| \S+: games (\d+), win ([\d.]+)% ±([\d.]+).*?avg win round ([\d.]+).*\| vs (\S+): \S+\s+([+-][\d.]+) ±([\d.]+)/);
  if (!m || !m[1].startsWith(pfx)) continue;
  const r = rows[m[1]] || (rows[m[1]] = { name: m[1], variant: m[3] || "" });
  r[m[2]] = { win: +m[5], se: +m[6], rnd: +m[7], d: +m[9], dse: +m[10], base: m[8] };
}
const list = Object.values(rows).filter(r => r.b2 && r.b4).sort((a, b) => (b.b2.d + b.b4.d) - (a.b2.d + a.b4.d));
console.log("| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |\n|---|---|---|---|---|---|---|");
for (const r of list) {
  let sw = r.variant; try { const v = JSON.parse(r.variant); sw = v.cut.map((c, i) => `${c} → ${v.add[i]}`).join("; "); } catch (e) { }
  console.log(`| ${r.name} | ${sw} | ${r.b2.win}% | ${r.b2.d >= 0 ? "+" : ""}${r.b2.d} ±${r.b2.dse} | ${r.b4.win}% | ${r.b4.d >= 0 ? "+" : ""}${r.b4.d} ±${r.b4.dse} | ${(r.b2.d + r.b4.d).toFixed(1)} |`);
}
