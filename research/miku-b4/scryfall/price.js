/* node scryfall/price.js decklist.txt > prices.csv: prices a 100-card list ("1 Card Name", commander first) from index.json.
   Columns: qty,card,price_eur,price_eur_url,price_usd,price_usd_url,game_changer, then a TOTAL row. Prices are the cheapest
   nonfoil printing in Scryfall's bulk data (dates in index-meta.json): EUR = Cardmarket trend with that printing's Cardmarket
   URL, USD = TCGplayer market with its TCGplayer URL. A card with no price in the data is "not verified". Basic lands are
   priced like any card. */
"use strict";
const fs = require("fs"), path = require("path");
const idx = require("./index.json"), meta = require("./index-meta.json");
const file = process.argv[2];
const q = s => /[",\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
const rows = [["qty", "card", "price_eur", "price_eur_url", "price_usd", "price_usd_url", "game_changer"]];
let eur = 0, usd = 0, missE = 0, missU = 0, gc = 0;
for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.trim().match(/^(\d+)\s+(.+)$/); if (!m) continue;
  const n = +m[1], c = find(m[2].trim());
  if (!c) { rows.push([n, m[2].trim(), "not verified", "", "not verified", "", ""]); missE++; missU++; continue; }
  if (c.game_changer) gc += n;
  if (c.price_eur != null) eur += n * c.price_eur; else missE++;
  if (c.price_usd != null) usd += n * c.price_usd; else missU++;
  rows.push([n, c.name.split(" // ")[0] === m[2].trim() ? m[2].trim() : c.name, c.price_eur != null ? c.price_eur.toFixed(2) : "not verified", c.price_eur_url || "", c.price_usd != null ? c.price_usd.toFixed(2) : "not verified", c.price_usd_url || "", c.game_changer ? "yes" : "no"]);
}
rows.push(["", "TOTAL", eur.toFixed(2) + (missE ? ` (+${missE} not verified)` : ""), `Scryfall bulk default-cards ${meta.default_cards}`, usd.toFixed(2) + (missU ? ` (+${missU} not verified)` : ""), "", `${gc} Game Changers`]);
console.log(rows.map(r => r.map(q).join(",")).join("\n"));
