/* node bulk-index.js default-cards.jsonl.gz rulings.jsonl.gz: builds gw-index.json from Scryfall's bulk data (no API calls):
   every Commander-legal card whose color identity is within green-white (colorless included), with its Oracle text, Game
   Changer flag, rulings, the cheapest nonfoil USD price over its paper printings (prices.usd is TCGplayer's market
   price, as Scryfall reports it) with that printing's Scryfall and TCGplayer URLs, and the cheapest nonfoil EUR price
   (prices.eur is Cardmarket's trend price, as Scryfall reports it) with its Cardmarket URL.
   Copied from research/etrata-theft-aggro/local/scryfall/ (blue-black) for the Miku research. */
const fs = require("fs"), zlib = require("zlib"), readline = require("readline"), path = require("path");
const [cardsGz, rulesGz] = process.argv.slice(2);
const lines = f => readline.createInterface({ input: fs.createReadStream(f).pipe(zlib.createGunzip()), crlfDelay: Infinity });
const textOf = c => c.oracle_text != null ? c.oracle_text : (c.card_faces || []).map(f => `${f.name}: ${f.oracle_text}`).join("\n//\n");
// TCGplayer's own product page, from Scryfall's affiliate link (its u= parameter)
const tcgDirect = u => { if (!u) return null; try { const v = new URL(u).searchParams.get("u"); return v ? v.split("?")[0] : u; } catch (e) { return u; } };
const costOf = c => c.mana_cost != null && c.mana_cost !== "" ? c.mana_cost : (c.card_faces || []).map(f => f.mana_cost).filter(Boolean).join(" // ");
(async () => {
  const idx = {}, byOracle = {};
  for await (const line of lines(cardsGz)) {
    if (!line.trim()) continue;
    const c = JSON.parse(line);
    if (!c.legalities || c.legalities.commander !== "legal") continue;
    if (!(c.color_identity || []).every(k => k === "G" || k === "W")) continue;
    if (c.layout === "token" || c.layout === "art_series" || c.set_type === "token") continue;
    let e = idx[c.name];
    if (!e) {
      e = idx[c.name] = { name: c.name, oracle_id: c.oracle_id, cost: costOf(c), cmc: c.cmc, type: c.type_line, text: textOf(c),
        pt: c.power != null ? `${c.power}/${c.toughness}` : (c.card_faces && c.card_faces[0].power != null ? `${c.card_faces[0].power}/${c.card_faces[0].toughness}` : null),
        ci: c.color_identity.join(""), gc: !!c.game_changer, keywords: c.keywords, edhrec: c.edhrec_rank || null, minUsd: null, minEur: null, prints: 0 };
      byOracle[c.oracle_id] = e;
    }
    if (c.game_changer) e.gc = true;
    e.prints++;
    const usd = c.prices && c.prices.usd != null ? +c.prices.usd : null;
    const eur = c.prices && c.prices.eur != null ? +c.prices.eur : null;
    if (eur != null && !c.digital && (e.minEur == null || eur < e.minEur)) Object.assign(e, { minEur: eur, minEurSet: `${c.set_name} (${c.set.toUpperCase()} ${c.collector_number})`, minCardmarket: (c.purchase_uris || {}).cardmarket || null });
    if (usd != null && !c.digital && (e.minUsd == null || usd < e.minUsd)) {
      Object.assign(e, { minUsd: usd, minSet: `${c.set_name} (${c.set.toUpperCase()} ${c.collector_number})`, minScryfall: c.scryfall_uri.split("?")[0], minTcg: tcgDirect((c.purchase_uris || {}).tcgplayer) });
    }
  }
  if (rulesGz) for await (const line of lines(rulesGz)) {
    if (!line.trim()) continue;
    const r = JSON.parse(line), e = byOracle[r.oracle_id];
    if (e) (e.rulings = e.rulings || []).push({ date: r.published_at, src: r.source, text: r.comment });
  }
  const out = path.join(__dirname, "gw-index.json");
  fs.writeFileSync(out, JSON.stringify(idx));
  console.log(Object.keys(idx).length, "cards ->", out, "(Scryfall bulk default_cards of", path.basename(cardsGz) + ")");
})();
