/* node sources-md.js CATEGORIES.json OUT.md: writes a card research file from ub-index.json. CATEGORIES.json is
   [{ "title": "...", "why": "one line", "cards": [["Card Name", "why it's here"], ...] }, ...]. Each card gets its exact Oracle
   text, cost, type, Commander legality (every card in the index is legal), Game Changer flag, the cheapest nonfoil printing's
   price with its Scryfall and TCGplayer URLs, Scryfall rulings that matter, and whether the game engine has it. */
const fs = require("fs"), path = require("path");
const idx = require("./ub-index.json");
const [catFile, out] = process.argv.slice(2);
const cats = JSON.parse(fs.readFileSync(catFile, "utf8"));
const repo = path.resolve(__dirname, "../../../..");
const dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js")); require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
let md = `# Etrata heist aggro: card research (generated ${new Date().toISOString().slice(0, 10)})\n\n`;
md += `Every card below was checked against Scryfall's bulk data of 2026-10-05 (\`default_cards\` and \`rulings\`, read offline by \`local/scryfall/bulk-index.js\`):\n`;
md += `- **Oracle text** is copied from that data, character for character.\n- **Legality**: every card listed is legal in Commander (the index only holds Commander-legal cards whose color identity is within blue-black).\n`;
md += `- **Game Changer** is Scryfall's \`game_changer\` flag.\n- **Price** is the cheapest nonfoil paper printing's \`prices.usd\` (TCGplayer's market price as Scryfall reports it), with that printing's Scryfall page and its TCGplayer product page.\n- **Engine** says whether the game engine defines the card, and in which file.\n\n`;
let n = 0;
for (const cat of cats) {
  md += `## ${cat.title}\n\n${cat.why ? cat.why + "\n\n" : ""}`;
  for (const [name, why] of cat.cards) {
    const c = idx[name];
    n++;
    if (!c) { md += `### ${name}\nNot in the index (not verified).\n\n`; continue; }
    const def = MK.defs.get(c.name);
    let file = "";
    if (def) for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".js"))) { if (fs.readFileSync(path.join(dir, f), "utf8").includes(`name: "${c.name.replace(/"/g, '\\"')}"`)) { file = f; break; } }
    md += `### ${c.name}\n- ${c.cost || "(no mana cost)"} · ${c.type}${c.pt ? " · " + c.pt : ""} · ${c.gc ? "**Game Changer**" : "not a Game Changer"} · Commander: legal\n`;
    md += `- Price: ${c.minUsd != null ? "$" + c.minUsd.toFixed(2) + " (" + c.minSet + "): " + c.minScryfall + (c.minTcg ? " · " + c.minTcg : "") : "not verified"}\n`;
    md += `- Engine: ${def ? "defined in `" + file + "`" + (def.note ? " (simplified: " + def.note + ")" : "") : "not in the engine"}\n`;
    if (why) md += `- Why: ${why}\n`;
    md += `\n> ${c.text.replace(/\n/g, "\n> ")}\n\n`;
    const rel = (c.rulings || []).filter(r => !/^In the Commander variant/i.test(r.text)).slice(0, 3);
    if (rel.length) md += rel.map(r => `- Ruling (${r.date}): ${r.text}`).join("\n") + "\n\n";
  }
}
fs.writeFileSync(out, md);
console.log(n, "cards ->", out);
