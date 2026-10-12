/* node scripts/verbatim.js commander|rulings NAME...: markdown blocks with a card's exact Oracle text (faces for two-faced
   cards) and its Scryfall rulings, dated, from scryfall/index.json (bulk files dated in scryfall/index-meta.json). */
"use strict";
const idx = require("../scryfall/index.json"), meta = require("../scryfall/index-meta.json");
const [mode, ...names] = process.argv.slice(2);
const quote = t => t.split("\n").map(l => "> " + l).join("\n");
for (const n of names) {
  const c = idx[n];
  if (!c) { console.log(`### ${n}\nNOT IN INDEX (not verified)\n`); continue; }
  if (mode === "commander") {
    const pt = c.power != null ? ` ${c.power}/${c.toughness}` : "", loy = c.loyalty != null ? ` (loyalty ${c.loyalty})` : "";
    console.log(`### ${c.name}\n${c.mana_cost || "(no mana cost)"} · ${c.type_line}${pt}${loy} · color identity ${c.color_identity.join("") || "colorless"} · Commander: ${c.legal_commander} · ${c.game_changer ? "Game Changer" : "not a Game Changer"}\n`);
    if (c.faces && c.oracle_text == null) for (const f of c.faces) console.log(`**${f.name}** ${f.mana_cost} · ${f.type_line}\n${quote(f.oracle_text)}\n`);
    else console.log(quote(c.oracle_text || "(no rules text)") + "\n");
    const m = c.miku_printings.filter(p => !/★/.test(p.collector_number));
    if (m.length) console.log(`Miku printing: ${m.map(p => `SLD ${p.collector_number}${p.flavor_name ? ` "${p.flavor_name}"` : ""} (${p.released_at})`).join("; ")}\n`);
  } else {
    console.log(`### ${c.name}\n`);
    if (!c.rulings.length) { console.log(`Scryfall lists no rulings for this card (rulings bulk ${meta.rulings}).\n`); continue; }
    for (const r of c.rulings) console.log(`- **${r.date}** (${r.source}): ${r.text}`);
    console.log("");
  }
}
