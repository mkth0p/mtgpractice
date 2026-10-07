/* node mkdeck.js TIER 'VARIANT_JSON' > decklist-tierN.txt: the precon with the variant's swaps applied, as a 100-card list
   (commander included). Added cards are marked "[in]", the cut cards are listed under "Out", and only the changed cards
   are priced (cheapest nonfoil printing: Cardmarket EUR trend and TCGplayer USD market, from Scryfall bulk data 2026-10-07).
   Also checks: 100 cards, singleton except basics, every card in green-white identity and Commander-legal (gw-index). */
const fs = require("fs"), path = require("path"), dir = path.resolve(__dirname, "../../../miku/game");
require(dir + "/engine.js"); require(dir + "/cards-miku.js");
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK, idx = require("./scryfall/gw-index.json");
const [tier, vjson, owned] = process.argv.slice(2);
const v = JSON.parse(vjson || "{}"), list = MK.MIKU_PRECON_DECK.list.slice();
(v.cut || []).forEach((n, i) => { const k = list.indexOf(n); if (k < 0) throw new Error("not in list: " + n); list[k] = v.add[i]; });
const BASIC = new Set(["Plains", "Forest"]);
const card = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
const cnt = {}; for (const n of list) cnt[n] = (cnt[n] || 0) + 1;
const errs = [];
if (list.length !== 99) errs.push("99 cards expected, got " + list.length);
for (const [n, k] of Object.entries(cnt)) { if (k > 1 && !BASIC.has(n)) errs.push("not singleton: " + n); if (!BASIC.has(n) && !card(n)) errs.push("not GW/legal: " + n); }
const pre = {}; for (const n of MK.MIKU_PRECON_DECK.list) pre[n] = (pre[n] || 0) + 1;
const ins = [], outs = [];
for (const [n, k] of Object.entries(cnt)) for (let i = (pre[n] || 0); i < k; i++) ins.push(n);
for (const [n, k] of Object.entries(pre)) for (let i = (cnt[n] || 0); i < k; i++) outs.push(n);
const OWN = new Set(MK.MIKU_BUDGET_DECK.list);
const typeOf = n => { const t = (MK.defs.get(n).types || []); return t.includes("Land") ? "Lands" : t.includes("Creature") ? "Creatures" : t.includes("Planeswalker") ? "Planeswalkers" : t.includes("Instant") ? "Instants" : t.includes("Sorcery") ? "Sorceries" : t.includes("Artifact") ? "Artifacts" : "Enchantments"; };
const out = [`// Trostani (Miku precon), tier ${tier}: ${ins.length} cards different from the precon (cap 15). Bracket 4 legal: Commander banned list only.`,
  `// "[in]" = a swap into the box list; the cut cards are listed under "Out". Prices: cheapest nonfoil printing, Scryfall bulk data 2026-10-07.`, "",
  "Commander", "1 Trostani, Selesnya's Voice", ""];
const groups = {}; const seen = new Set();
for (const n of list) { if (seen.has(n)) continue; seen.add(n); (groups[typeOf(n)] = groups[typeOf(n)] || []).push(n); }
let left = ins.slice();
for (const gname of ["Creatures", "Planeswalkers", "Instants", "Sorceries", "Artifacts", "Enchantments", "Lands"]) {
  const g = groups[gname]; if (!g) continue;
  out.push(`${gname} (${g.reduce((s, n) => s + cnt[n], 0)})`);
  for (const n of g.sort()) { const nin = left.filter(x => x === n).length; left = left.filter(x => x !== n); out.push(`${cnt[n]} ${n}${nin ? `  [in${nin > 1 ? " x" + nin : ""}]` : ""}`); }
  out.push("");
}
out.push(`Out (${outs.length})`); for (const n of outs) out.push(`1 ${n}  [out]`);
out.push("", "Prices of the cards that come in (cards from the 80€ plan are marked owned)");
let eur = 0, usd = 0;
for (const n of [...new Set(ins)]) { const c = card(n), k = ins.filter(x => x === n).length;
  if (BASIC.has(n)) { out.push(`${k} ${n}: basic land`); continue; }
  const own = OWN.has(n) && !MK.MIKU_PRECON_DECK.list.includes(n);
  if (!own) { eur += (c.minEur || 0) * k; usd += (c.minUsd || 0) * k; }
  out.push(`${k} ${n}: ${c.minEur != null ? "€" + c.minEur.toFixed(2) : "€ not verified"} / ${c.minUsd != null ? "$" + c.minUsd.toFixed(2) : "$ not verified"}${own ? " (owned: 80€ plan)" : ""}${c.gc ? " (Game Changer)" : ""}${c.minScryfall ? " " + c.minScryfall : ""}`); }
out.push(`To buy beyond the precon and the 80€ plan: €${eur.toFixed(2)} / $${usd.toFixed(2)}`);
if (errs.length) out.push("", "ERRORS: " + errs.join("; "));
console.log(out.join("\n"));
if (errs.length) process.exitCode = 1;
