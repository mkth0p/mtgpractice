/* node scripts/check-decklists.js decklist-*.txt: for each list, checks exactly 100 cards, the commander on the first line,
   singleton except basic lands, every card Commander-legal and inside the commander's color identity (Scryfall bulk),
   every card present in cards.json, and counts Game Changers. Exit code 1 if any list has a problem. */
"use strict";
const fs = require("fs"), path = require("path");
const idx = require("../scryfall/index.json");
const cards = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, "../cards.json"), "utf8")).map(c => c.name));
const BASIC = new Set(["Plains", "Island", "Swamp", "Mountain", "Forest", "Wastes", "Snow-Covered Plains", "Snow-Covered Island", "Snow-Covered Swamp", "Snow-Covered Mountain", "Snow-Covered Forest"]);
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
let bad = 0;
for (const f of process.argv.slice(2)) {
  const lines = fs.readFileSync(f, "utf8").split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("//") && !l.startsWith("#"));
  const list = [], probs = [];
  for (const l of lines) { const m = l.match(/^(\d+)\s+(.+)$/); if (!m) { probs.push("bad line: " + l); continue; } for (let i = 0; i < +m[1]; i++) list.push(m[2].trim()); }
  const cmd = find(list[0] || "");
  if (!cmd) probs.push("commander not found: " + list[0]);
  else if (!/Legendary Creature/.test(cmd.type_line) && !/can be your commander/.test(cmd.oracle_text || "")) probs.push("first card can't be a commander: " + cmd.name);
  if (list.length !== 100) probs.push(`${list.length} cards, not 100`);
  const ci = new Set(cmd ? cmd.color_identity : []), seen = new Map();
  let gc = 0, miku = 0;
  for (const n of list) {
    seen.set(n, (seen.get(n) || 0) + 1);
    const c = find(n);
    if (!c) { probs.push("not in Scryfall index: " + n); continue; }
    if (c.legal_commander !== "legal") probs.push(`not Commander-legal (${c.legal_commander}): ${n}`);
    if (!c.color_identity.every(k => ci.has(k))) probs.push(`outside ${[...ci].join("")} identity (${c.color_identity.join("")}): ${n}`);
    if (!BASIC.has(n) && !cards.has(c.name) && !cards.has(n)) probs.push("not in cards.json: " + n);
    if (c.game_changer) gc++;
    if (c.miku_printings.length) miku++;
  }
  for (const [n, k] of seen) if (k > 1 && !BASIC.has(n)) probs.push(`${k} copies: ${n}`);
  if (probs.length) bad++;
  console.log(`${path.basename(f)}: ${list.length} cards, commander ${list[0]}, ${gc} Game Changers, ${miku} cards with a Miku printing, ${probs.length ? probs.length + " problem(s)" : "OK"}`);
  for (const p of probs) console.log("  - " + p);
}
process.exitCode = bad ? 1 : 0;
