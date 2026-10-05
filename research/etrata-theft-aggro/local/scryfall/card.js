// node card.js [--rulings] "Name" ...: a card's exact Oracle text, Game Changer flag and cheapest printing from ub-index.json
const idx = require("./ub-index.json");
let args = process.argv.slice(2); const R = args.includes("--rulings"); args = args.filter(a => a !== "--rulings");
for (const n of args) {
  const c = idx[n] || Object.values(idx).find(x => x.name.toLowerCase() === n.toLowerCase()) || Object.values(idx).find(x => x.name.toLowerCase().startsWith(n.toLowerCase()));
  if (!c) { console.log(`NOT IN INDEX: ${n}`); continue; }
  console.log(`## ${c.name} | ${c.cost} | ${c.type}${c.pt ? " " + c.pt : ""} | ${c.gc ? "Game Changer" : "not GC"} | min $${c.minUsd} ${c.minSet || ""}\n${c.text}\n${c.minScryfall || ""}${c.minTcg ? " | " + c.minTcg : ""}`);
  if (R && c.rulings) for (const r of c.rulings) console.log(`  - [${r.date}] ${r.text}`);
}
