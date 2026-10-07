// node table-b4.js PREFIX: the Bracket-4-only sweep rows in xp.log whose names start with PREFIX, sorted by Δ B4
const fs = require("fs"), path = require("path");
const [pfx] = process.argv.slice(2), rows = [];
for (const l of fs.readFileSync(path.join(__dirname, "xp.log"), "utf8").split("\n")) {
  const m = l.match(/^\S+ (\S+)-b4 \|.*?(?:variant=(\{.*?\}) )?\| \S+: games (\d+), win ([\d.]+)% ±([\d.]+).*?avg win round ([\d.]+).*\| vs (\S+): \S+\s+([+-][\d.]+) ±([\d.]+)/);
  if (!m || !m[1].startsWith(pfx)) continue;
  let swap = ""; try { const v = JSON.parse(m[2] || "{}"); swap = (v.cut || []).map((c, i) => c + " → " + (v.add || [])[i]).join("; "); } catch (e) {}
  rows.push({ name: m[1], swap, win: +m[4], se: +m[5], rnd: +m[6], d: +m[8], dse: +m[9] });
}
rows.sort((a, b) => b.d - a.d);
console.log("| Run | Swap | B4 win | Δ B4 | avg win round |\n|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.name} | ${r.swap} | ${r.win}% | ${r.d >= 0 ? "+" : ""}${r.d} ±${r.dse} | ${r.rnd} |`);
