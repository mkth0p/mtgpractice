/* node scripts/build-combos.js: combos.json from the reviewed draft (work/combos-draft.json), with exactly the keys of the
   brief: id, name, pieces, colors, prerequisites, steps, mana_needed, instant_speed, result, weak_to, beats_field,
   spellbook_url. "colors" is recomputed as the union of the pieces' color identities (Scryfall bulk), in WUBRG order. */
"use strict";
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
const idx = require("../scryfall/index.json");
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
const draft = JSON.parse(fs.readFileSync(path.join(root, "work/combos-draft.json"), "utf8"));
const ORDER = "WUBRG";
const out = draft.map(d => {
  const ci = new Set(); for (const p of d.pieces) { const c = find(p); if (!c) throw new Error("not in index: " + p); c.color_identity.forEach(k => ci.add(k)); }
  return { id: d.id, name: d.name, pieces: d.pieces, colors: [...ORDER].filter(k => ci.has(k)).join("") || "C", prerequisites: d.prerequisites, steps: d.steps, mana_needed: d.mana_needed, instant_speed: d.instant_speed, result: d.result, weak_to: d.weak_to, beats_field: d.beats_field, spellbook_url: d.spellbook_url };
});
fs.writeFileSync(path.join(root, "combos.json"), JSON.stringify(out, null, 1));
console.log(out.length, "lines ->", "combos.json;", out.map(o => o.id + ":" + o.colors).join(" "));
