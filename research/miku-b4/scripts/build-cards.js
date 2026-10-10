/* node scripts/build-cards.js: builds cards.json (and miku-prices.csv) from the hand-written candidate pool pool/pool.tsv
   (columns: name, roles, for_commanders, combos, why; lists comma-separated) and combos.json. Every other field comes from
   Scryfall's bulk data (scryfall/index.json, dates in index-meta.json) and engine-cards.txt, so nothing is typed by hand.
   - rulings: the card's Scryfall rulings when it is a commander or a piece of a win line in combos.json (the ones that matter
     for the simulator), else [].
   - miku_printing: the card's non-star Miku printing's SLD collector number (scryfall/miku-printings.json), else null.
   - in_engine: exact match of the Oracle name (or the front face) against engine-cards.txt. */
"use strict";
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const idx = require("../scryfall/index.json"), meta = require("../scryfall/index-meta.json");
const engine = new Set(fs.readFileSync(path.join(root, "engine-cards.txt"), "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean));
const combos = fs.existsSync(path.join(root, "combos.json")) ? JSON.parse(fs.readFileSync(path.join(root, "combos.json"), "utf8")) : [];
const date = `${meta.default_cards.slice(0, 4)}-${meta.default_cards.slice(4, 6)}-${meta.default_cards.slice(6, 8)}`;
const COMMANDERS = new Set(["Child of Alara", "Brago, King Eternal", "Shalai, Voice of Plenty", "Trostani, Selesnya's Voice"]);
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
const split = s => (s || "").split(",").map(x => x.trim()).filter(Boolean);
const out = [], miss = [], seen = new Map(), mikuRows = [["card", "sld_number", "miku_name", "released", "eur_nonfoil", "eur_foil", "usd_nonfoil", "usd_foil", "scryfall_url", "cardmarket_url", "price_date"]];
for (const line of fs.readFileSync(path.join(root, "pool/pool.tsv"), "utf8").split(/\r?\n/)) {
  if (!line.trim() || line.startsWith("#") || line.startsWith("name\t")) continue;
  const [name, roles, fors, cmb, why] = line.split("\t");
  const c = find(name.trim());
  if (!c) { miss.push(name); continue; }
  if (seen.has(c.name)) { // a card listed twice: merge roles and commanders
    const o = seen.get(c.name); o.roles = [...new Set(o.roles.concat(split(roles)))]; o.for_commanders = [...new Set(o.for_commanders.concat(split(fors)))]; continue;
  }
  const inCombos = combos.filter(x => x.pieces.includes(c.name) || x.pieces.includes(c.name.split(" // ")[0])).map(x => x.id);
  const twoFaced = c.faces && c.oracle_text == null;
  const mk = c.miku_printings.filter(p => !/★/.test(p.collector_number));
  const o = {
    name: c.name, mana_cost: c.mana_cost, cmc: c.cmc, type_line: c.type_line,
    oracle_text: twoFaced ? null : c.oracle_text, faces: twoFaced ? c.faces.map(f => ({ name: f.name, mana_cost: f.mana_cost, type_line: f.type_line, oracle_text: f.oracle_text })) : null,
    power: c.power, toughness: c.toughness, loyalty: c.loyalty, color_identity: c.color_identity, keywords: c.keywords,
    legal_commander: c.legal_commander === "legal", game_changer: c.game_changer,
    price_eur: c.price_eur, price_eur_url: c.price_eur_url, price_usd: c.price_usd, price_usd_url: c.price_usd_url, price_date: date,
    miku_printing: mk.length ? mk[0].collector_number : null,
    roles: split(roles), for_commanders: split(fors), combos: [...new Set(split(cmb).concat(inCombos))],
    why: (why || "").trim(),
    rulings: COMMANDERS.has(c.name) || inCombos.length ? c.rulings.map(r => ({ date: r.date, text: r.text })) : [],
    in_engine: engine.has(c.name) || engine.has(c.name.split(" // ")[0])
  };
  seen.set(c.name, o); out.push(o);
  for (const m of mk) mikuRows.push([c.name, m.collector_number, m.flavor_name || "", m.released_at, m.eur ?? "not verified", m.eur_foil ?? "not verified", m.usd ?? "not verified", m.usd_foil ?? "not verified", m.scryfall_uri, m.cardmarket || "", date]);
}
fs.writeFileSync(path.join(root, "cards.json"), JSON.stringify(out, null, 1));
const q = s => /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
fs.writeFileSync(path.join(root, "miku-prices.csv"), mikuRows.map(r => r.map(q).join(",")).join("\n") + "\n");
console.log(`cards.json: ${out.length} cards (${out.filter(o => o.in_engine).length} in the engine, ${out.filter(o => o.game_changer).length} Game Changers); miku-prices.csv: ${mikuRows.length - 1} rows`);
if (miss.length) { console.log("NOT FOUND in the Scryfall index:", miss.join(" | ")); process.exitCode = 1; }
