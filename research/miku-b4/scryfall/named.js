/* node named.js "Card A" "Card B" ...  (or --file names.txt): exact Oracle data for named cards into cards.json (found: "named"),
   plus the cheapest nonfoil USD price over all printings (prices.usd is TCGplayer's market price) with that printing's URLs. */
const fs = require("fs"), path = require("path");
const UA = { "User-Agent": "mtgpractice-research/1.0", Accept: "application/json" };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let names = process.argv.slice(2);
const fi = names.indexOf("--file"); if (fi >= 0) names = fs.readFileSync(names[fi + 1], "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
const dbf = path.join(__dirname, "cards.json");
const db = fs.existsSync(dbf) ? JSON.parse(fs.readFileSync(dbf)) : {};
const textOf = c => c.oracle_text != null ? c.oracle_text : (c.card_faces || []).map(f => `${f.name}: ${f.oracle_text}`).join("\n//\n");
const costOf = c => c.mana_cost != null && c.mana_cost !== "" ? c.mana_cost : (c.card_faces || []).map(f => f.mana_cost).filter(Boolean).join(" // ");
(async () => {
  for (const n of names) {
    try {
      await sleep(110);
      let r = await fetch("https://api.scryfall.com/cards/named?exact=" + encodeURIComponent(n), { headers: UA });
      let c = await r.json();
      if (c.object === "error") { await sleep(110); r = await fetch("https://api.scryfall.com/cards/named?fuzzy=" + encodeURIComponent(n), { headers: UA }); c = await r.json(); }
      if (c.object === "error") { console.log(`NOT FOUND: ${n} (${c.details})`); continue; }
      await sleep(110);
      let url = c.prints_search_uri, prints = [];
      while (url) { const pr = await (await fetch(url, { headers: UA })).json(); prints = prints.concat(pr.data || []); url = pr.has_more ? pr.next_page : null; await sleep(110); }
      const priced = prints.filter(p => p.prices && p.prices.usd != null && !p.digital).sort((a, b) => +a.prices.usd - +b.prices.usd);
      const cheap = priced[0] || null;
      const e = db[c.name] || (db[c.name] = { name: c.name, found: [] });
      Object.assign(e, {
        cost: costOf(c), cmc: c.cmc, type: c.type_line, text: textOf(c), pt: c.power != null ? `${c.power}/${c.toughness}` : (c.card_faces && c.card_faces[0].power != null ? `${c.card_faces[0].power}/${c.card_faces[0].toughness}` : null),
        ci: c.color_identity.join(""), commander: c.legalities.commander, gc: !!c.game_changer, keywords: c.keywords, edhrec: c.edhrec_rank || null,
        usd: c.prices.usd, scryfall: c.scryfall_uri.split("?")[0], tcg: (c.purchase_uris || {}).tcgplayer || null, oracle_id: c.oracle_id,
        minUsd: cheap ? +cheap.prices.usd : null, minSet: cheap ? `${cheap.set_name} (${cheap.set.toUpperCase()} ${cheap.collector_number})` : null,
        minScryfall: cheap ? cheap.scryfall_uri.split("?")[0] : null, minTcg: cheap && cheap.purchase_uris ? cheap.purchase_uris.tcgplayer : null,
        priced: new Date().toISOString().slice(0, 10)
      });
      if (!e.found.includes("named")) e.found.push("named");
      console.log(`${c.name} | ${e.cost} | ${c.type_line}${e.pt ? " " + e.pt : ""} | ${c.legalities.commander}${e.gc ? " | GC" : ""} | min $${e.minUsd} (${e.minSet})`);
    } catch (err) { console.log(`FAILED: ${n}: ${err.message}`); }
  }
  fs.writeFileSync(dbf, JSON.stringify(db, null, 1));
})();
