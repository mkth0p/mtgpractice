/* node price.js LIST.txt [--csv out.csv]: prices a decklist ("1 Card Name" lines) from gw-index.json, the cheapest nonfoil
   paper printing's TCGplayer market price as Scryfall reports it (bulk data of the date in ub-index). Basic lands too. */
const fs = require("fs"), path = require("path");
const idx = require("./gw-index.json");
const [file, ...rest] = process.argv.slice(2);
const ci = rest.indexOf("--csv"), csv = ci >= 0 ? rest[ci + 1] : null;
const rows = [];
let total = 0, missing = [];
for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.trim().match(/^(\d+)\s+(.+)$/); if (!m) continue;
  const n = +m[1], name = m[2].trim();
  const c = idx[name] || Object.values(idx).find(x => x.name.split(" // ")[0] === name);
  if (!c || c.minUsd == null) { missing.push(name); rows.push([n, name, "not verified", "", ""]); continue; }
  total += n * c.minUsd;
  rows.push([n, c.name, c.minUsd.toFixed(2), c.minScryfall, c.minTcg || "", c.gc ? "Game Changer" : ""]);
}
rows.sort((a, b) => (+b[2] || 0) - (+a[2] || 0));
if (csv) {
  const q = s => /[",]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
  fs.writeFileSync(csv, ["qty,card,price_usd,scryfall_url,tcgplayer_url,game_changer"].concat(rows.map(r => r.map(q).join(","))).concat([`,TOTAL,${total.toFixed(2)},,,`]).join("\n") + "\n");
}
console.log(`total $${total.toFixed(2)} for ${rows.reduce((s, r) => s + r[0], 0)} cards; GC ${rows.filter(r => r[5]).length}; not priced: ${missing.join(", ") || "none"}`);
console.log(rows.slice(0, 25).map(r => `  ${r[2]} ${r[1]}${r[5] ? " (GC)" : ""}`).join("\n"));
