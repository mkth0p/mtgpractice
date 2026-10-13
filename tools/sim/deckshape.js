/* node deckshape.js DECK_CONST [LIST_FILE] > shape.json: a deck's shape for manamodel.js --shape, read from the
   engine's card definitions: lands, ramp (MV, whether it makes mana the turn it's cast, net mana a turn) and the
   other spells' MVs. Ramp is what mana.js counts as ramp; a dork is slow (summoning sick), a rock or a ritual fast,
   a land search slow with net 1. LIST_FILE ("1 Card Name" lines) replaces the deck's list. */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js")); require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
const [k, file] = process.argv.slice(2);
const D = MK[k];
let list = D.list;
if (file) { list = []; for (const l of fs.readFileSync(file, "utf8").split(/\r?\n/)) { const m = l.trim().match(/^(\d+)\s+(.+)$/); if (m && m[2] !== D.commander) for (let i = 0; i < +m[1]; i++) list.push(m[2]); } }
const isRamp = d => {
  if (d.ai && (d.ai.ramp || d.ai.ritual)) return true;
  if (d.types.includes("Land")) return false;
  if (d.mana && d.mana.length) return true;
  const t = d.text || "";
  return /search your library for (?:up to \w+ )?(?:a |an |two |three )?(?:basic )?(?:land|Forest|Plains|Island|Swamp|Mountain)/i.test(t) && !/creature card/i.test(t) || /^Add \{/m.test(t) && d.types.some(x => x === "Instant" || x === "Sorcery");
};
const ONCE = { "Mana Vault": 3, "Grim Monolith": 3, "Lotus Petal": 1, "Dark Ritual": 3, "Cabal Ritual": 3, "Culling Ritual": 2 };
const out = { name: D.name + (file ? " (" + path.basename(file) + ")" : ""), cmdr: MK.defs.get(D.commander).mv, lands: 0, ramp: [], spells: [] };
for (const n of list) {
  const d = MK.defs.get(n);
  if (!d) { console.error("not in engine: " + n); continue; }
  if (d.types.includes("Land")) { out.lands++; continue; }
  if (isRamp(d)) {
    const m = (d.mana || [])[0];
    let net = 1;
    if (m) { const p = typeof m.produce === "string" ? m.produce : ""; net = Math.max(1, (p.match(/[WUBRGC]|any/g) || ["x"]).length - (m.cost ? MK.util.costMV(MK.util.parseCost(m.cost)) : 0)); }
    const creature = d.types.includes("Creature");
    const r = { name: n, mv: d.mv || 0, fast: !creature && !!(d.mana && d.mana.length) || /^Add \{/m.test(d.text || ""), net };
    // mana that comes once: rocks that don't untap, sacrificed for mana, rituals
    if (ONCE[n] != null) r.once = ONCE[n];
    out.ramp.push(r);
  } else out.spells.push({ name: n, mv: d.mv || 0 });
}
console.log(JSON.stringify(out, null, 1));
