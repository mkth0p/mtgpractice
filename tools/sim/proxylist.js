/* node proxylist.js DECKLIST.txt CARDS.json [--manual "A=B;C=D"] > out.txt: makes a decklist the engine can play by
   standing in for each card the engine doesn't define with an engine card of the same mana value, the same main type
   (land, creature, artifact, enchantment, instant, sorcery), colors inside the card's, not already in the list.
   --manual sets stand-ins by hand. Prints the swaps on stderr. For mana measurements only: the stand-in keeps the
   mana shape, not what the card does. */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js")); require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
const A = process.argv.slice(2);
const [listFile, cardsFile] = A;
const mi = A.indexOf("--manual"), manual = new Map(mi < 0 ? [] : A[mi + 1].split(";").map(x => x.split("=").map(s => s.trim())));
const cards = new Map(JSON.parse(fs.readFileSync(cardsFile, "utf8")).map(c => [c.name, c]));
const lines = fs.readFileSync(listFile, "utf8").split(/\r?\n/).map(l => l.trim().match(/^(\d+)\s+(.+)$/)).filter(Boolean).map(m => [+m[1], m[2]]);
const used = new Set(lines.map(l => l[1]));
const main = t => ["Land", "Creature", "Artifact", "Enchantment", "Instant", "Sorcery", "Planeswalker"].find(x => (t || "").includes(x));
const out = [];
for (const [n, name] of lines) {
  if (MK.defs.has(name)) { out.push(`${n} ${name}`); continue; }
  let pick = manual.get(name);
  if (!pick) {
    const c = cards.get(name) || {};
    const mv = c.cmc || 0, ty = main(c.type_line), ci = c.color_identity || [];
    const cands = [...MK.defs.values()].filter(d => !d.token && !used.has(d.name) && (d.mv || 0) === mv && main(d.types.join(" ")) === ty && (d.colors || []).every(k => ci.includes(k)) && !d.legendary === !(c.type_line || "").includes("Legendary"))
      .sort((a, b) => ((b.colors || []).length - (a.colors || []).length) || a.name.localeCompare(b.name));
    pick = cands.length ? cands[0].name : (ty === "Land" ? (ci.includes("W") ? "Plains" : ci.includes("U") ? "Island" : "Forest") : null);
  }
  if (!pick) { console.error(`no stand-in for ${name}`); continue; }
  used.add(pick);
  console.error(`${name} -> ${pick}`);
  out.push(`${n} ${pick}`);
}
console.log(out.join("\n"));
