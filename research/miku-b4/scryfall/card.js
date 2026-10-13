// node card.js [--rulings] "Name" ...: a card's exact Oracle text, legality, Game Changer flag, cheapest printings and Miku
// printings, from index.json (Scryfall bulk data; dates in index-meta.json)
const idx = require("./index.json");
let args = process.argv.slice(2); const R = args.includes("--rulings"); args = args.filter(a => a !== "--rulings");
const find = n => idx[n] || Object.values(idx).find(x => x.name.toLowerCase() === n.toLowerCase()) || Object.values(idx).find(x => x.name.split(" // ")[0].toLowerCase() === n.toLowerCase());
for (const n of args) {
  const c = find(n);
  if (!c) { console.log(`NOT IN INDEX: ${n}`); continue; }
  const text = c.faces && c.oracle_text == null ? c.faces.map(f => `${f.name} ${f.mana_cost} | ${f.type_line}${f.power != null ? " " + f.power + "/" + f.toughness : ""}${f.loyalty != null ? " loyalty " + f.loyalty : ""}\n${f.oracle_text}`).join("\n//\n") : c.oracle_text;
  console.log(`## ${c.name} | ${c.mana_cost} | ${c.type_line}${c.power != null ? " " + c.power + "/" + c.toughness : ""}${c.loyalty != null ? " | loyalty " + c.loyalty : ""} | identity ${c.color_identity.join("") || "C"} | commander: ${c.legal_commander} | ${c.game_changer ? "Game Changer" : "not GC"}`);
  console.log(text);
  console.log(`  cheapest: €${c.price_eur ?? "not verified"} ${c.price_eur_set || ""} ${c.price_eur_url || ""} | $${c.price_usd ?? "not verified"} ${c.price_usd_set || ""} ${c.price_usd_url || ""}`);
  for (const m of c.miku_printings) console.log(`  Miku printing: SLD ${m.collector_number}${m.flavor_name ? " \"" + m.flavor_name + "\"" : ""} €${m.eur ?? "-"} (foil €${m.eur_foil ?? "-"}) $${m.usd ?? "-"} (foil $${m.usd_foil ?? "-"}) ${m.scryfall_uri}`);
  if (R) for (const r of c.rulings) console.log(`  - [${r.date}] ${r.text}`);
}
