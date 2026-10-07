/* node bulk-index.js oracle-cards.jsonl.gz default-cards.jsonl.gz rulings.jsonl.gz
   Builds index.json from Scryfall's bulk data (no API calls), for every color (the Miku B4 research covers all five):
   one entry per Oracle card (tokens, art series and memorabilia left out) with its exact Oracle text (faces for two-faced
   cards), Commander legality, Game Changer flag, keywords, rulings, and prices:
     price_eur  cheapest nonfoil EUR over the paper printings (prices.eur: Cardmarket trend, as Scryfall reports it),
                with that printing's Cardmarket purchase URL;
     price_usd  cheapest nonfoil USD (prices.usd: TCGplayer market), with that printing's TCGplayer purchase URL.
   Also writes sld-printings.json: every Secret Lair (SLD) printing with its collector number and flavor name. A card's
   miku_printings are its SLD printings listed in miku-printings.json (Scryfall's art tag hatsune-miku, 46 printings). Bulk file dates are recorded in index-meta.json.
   Copied from research/etrata-theft-aggro/local/scryfall/ (blue-black only) and widened to WUBRG. */
"use strict";
const fs = require("fs"), zlib = require("zlib"), readline = require("readline"), path = require("path");
const [oracleGz, cardsGz, rulesGz] = process.argv.slice(2);
const lines = f => readline.createInterface({ input: fs.createReadStream(f).pipe(zlib.createGunzip()), crlfDelay: Infinity });
const SKIP_LAYOUT = new Set(["token", "double_faced_token", "art_series", "emblem", "vanguard", "scheme", "planar"]);
const tcgDirect = u => { if (!u) return null; try { const v = new URL(u).searchParams.get("u"); return v ? v.split("?")[0] : u; } catch (e) { return u; } };
const face = f => ({ name: f.name, mana_cost: f.mana_cost || "", type_line: f.type_line || "", oracle_text: f.oracle_text || "", power: f.power ?? null, toughness: f.toughness ?? null, loyalty: f.loyalty ?? null });
(async () => {
  const idx = {}, byOracle = {}, sld = [];
  // the Miku printings: Scryfall's art tag (miku-printings.json, from the API search "set:sld art:hatsune-miku")
  const mikuSet = new Set(JSON.parse(fs.readFileSync(path.join(__dirname, "miku-printings.json"), "utf8")).printings.map(p => p.collector_number));
  for await (const line of lines(oracleGz)) {
    if (!line.trim()) continue;
    const c = JSON.parse(line);
    if (SKIP_LAYOUT.has(c.layout) || c.set_type === "token" || c.set_type === "memorabilia") continue;
    const two = c.card_faces && c.oracle_text == null;
    const e = {
      name: c.name, oracle_id: c.oracle_id, layout: c.layout,
      mana_cost: c.mana_cost != null ? c.mana_cost : (c.card_faces || []).map(f => f.mana_cost).filter(Boolean).join(" // "),
      cmc: c.cmc, type_line: c.type_line, oracle_text: two ? null : (c.oracle_text || ""),
      faces: c.card_faces ? c.card_faces.map(face) : null,
      power: c.power ?? (two ? null : null), toughness: c.toughness ?? null, loyalty: c.loyalty ?? null,
      color_identity: c.color_identity || [], keywords: c.keywords || [],
      legal_commander: c.legalities ? c.legalities.commander : null, game_changer: !!c.game_changer, edhrec_rank: c.edhrec_rank || null,
      price_eur: null, price_eur_set: null, price_eur_url: null, price_usd: null, price_usd_set: null, price_usd_url: null, price_scryfall: null,
      miku_printings: [], rulings: []
    };
    if (c.card_faces && c.power == null && c.card_faces[0].power != null) { e.power = c.card_faces[0].power; e.toughness = c.card_faces[0].toughness; }
    if (c.loyalty == null && c.card_faces && c.card_faces[0].loyalty != null) e.loyalty = c.card_faces[0].loyalty;
    idx[c.name] = e; byOracle[c.oracle_id] = e;
  }
  for await (const line of lines(cardsGz)) {
    if (!line.trim()) continue;
    const c = JSON.parse(line);
    const e = byOracle[c.oracle_id] || (c.card_faces && c.card_faces[0].oracle_id && byOracle[c.card_faces[0].oracle_id]);
    if (!e || c.digital) continue;
    if (c.set === "sld") {
      const fl = c.flavor_name || (c.card_faces || []).map(f => f.flavor_name).filter(Boolean).join(" // ") || null;
      const row = { name: c.name, collector_number: c.collector_number, flavor_name: fl, released_at: c.released_at, eur: c.prices && c.prices.eur != null ? +c.prices.eur : null, eur_foil: c.prices && c.prices.eur_foil != null ? +c.prices.eur_foil : null, usd: c.prices && c.prices.usd != null ? +c.prices.usd : null, usd_foil: c.prices && c.prices.usd_foil != null ? +c.prices.usd_foil : null, scryfall_uri: c.scryfall_uri.split("?")[0], cardmarket: (c.purchase_uris || {}).cardmarket || null, tcgplayer: tcgDirect((c.purchase_uris || {}).tcgplayer), legal_commander: c.legalities && c.legalities.commander };
      sld.push(row);
      if (mikuSet.has(c.collector_number)) e.miku_printings.push(row);
    }
    if (c.oversized || c.set_type === "memorabilia") continue;
    const eur = c.prices && c.prices.eur != null ? +c.prices.eur : null;
    const usd = c.prices && c.prices.usd != null ? +c.prices.usd : null;
    if (eur != null && (e.price_eur == null || eur < e.price_eur)) Object.assign(e, { price_eur: eur, price_eur_set: `${c.set_name} (${c.set.toUpperCase()} ${c.collector_number})`, price_eur_url: (c.purchase_uris || {}).cardmarket || c.scryfall_uri.split("?")[0], price_scryfall: c.scryfall_uri.split("?")[0] });
    if (usd != null && (e.price_usd == null || usd < e.price_usd)) Object.assign(e, { price_usd: usd, price_usd_set: `${c.set_name} (${c.set.toUpperCase()} ${c.collector_number})`, price_usd_url: tcgDirect((c.purchase_uris || {}).tcgplayer) || c.scryfall_uri.split("?")[0] });
  }
  for await (const line of lines(rulesGz)) {
    if (!line.trim()) continue;
    const r = JSON.parse(line), e = byOracle[r.oracle_id];
    if (e) e.rulings.push({ date: r.published_at, source: r.source, text: r.comment });
  }
  const dateOf = f => (path.basename(f).match(/(\d{14})/) || [])[1] || path.basename(f);
  fs.writeFileSync(path.join(__dirname, "index.json"), JSON.stringify(idx));
  fs.writeFileSync(path.join(__dirname, "sld-printings.json"), JSON.stringify(sld, null, 1));
  fs.writeFileSync(path.join(__dirname, "index-meta.json"), JSON.stringify({ built: new Date().toISOString(), oracle_cards: dateOf(oracleGz), default_cards: dateOf(cardsGz), rulings: dateOf(rulesGz), cards: Object.keys(idx).length }, null, 1));
  console.log(Object.keys(idx).length, "cards ->", path.join(__dirname, "index.json"), "| SLD printings", sld.length);
})();
