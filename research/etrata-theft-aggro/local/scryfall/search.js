/* Scryfall full-text research for the Etrata theft-aggro deck.
   node search.js            runs every query below, writes cards.json (one entry per card, oracle data)
                             and queries.json (which query found which cards, with total counts)
   Uses https://api.scryfall.com/cards/search (paginated, ~120 ms between requests). */
const fs = require("fs"), path = require("path");
const OUT = __dirname;
const UA = { "User-Agent": "mtgpractice-research/1.0", Accept: "application/json" };
const base = "legal:commander id<=ub";
const Q = {
  combatDamagePlayer: `o:"deals combat damage to a player" ${base}`,
  combatDamageOpponent: `o:"combat damage to an opponent" ${base}`,
  faceDown: `o:"face down" ${base}`,
  faceDown2: `o:"face-down" ${base}`,
  cloak: `o:cloak ${base}`,
  manifest: `o:manifest ${base}`,
  disguise: `kw:disguise ${base}`,
  dontOwn: `o:"you don't own" ${base}`,
  butDontOwn: `o:"but don't own" ${base}`,
  ownerControl: `o:"you control but don't own" ${base}`,
  assassinType: `t:assassin ${base}`,
  assassinText: `o:assassin ${base}`,
  ninjutsu: `o:ninjutsu ${base}`,
  doubleStrike: `o:"double strike" ${base}`,
  cantBeBlocked: `o:"can't be blocked" ${base}`,
  additionalCombat: `o:"additional combat" ${base}`,
  extraTurn: `o:"extra turn" ${base}`,
  triggersAdditional: `o:"triggers an additional time" ${base}`,
  loseHalf: `o:"half their life" ${base}`,
  loseHalf2: `o:"half his or her life" ${base}`,
  twice: `o:"twice that much" ${base}`,
  infect: `kw:infect ${base}`,
  toxic: `kw:toxic ${base}`,
  proliferate: `o:proliferate ${base}`,
  shadow: `kw:shadow ${base}`,
  gainsShadow: `o:"gains shadow" ${base}`,
  anthem: `o:"creatures you control get +" ${base}`,
  otherAnthem: `o:"other creatures you control get +" ${base}`,
  typeAnthem: `o:/(Assassins|Rogues|Ninjas|Shapeshifters|Vampires|Zombies|Faeries) you control get/ ${base}`,
  teamMenace: `o:"creatures you control have menace" ${base}`,
  teamEvasion: `o:"creatures you control" (o:"can't be blocked" or o:flying or o:menace or o:fear or o:shadow or o:intimidate) ${base}`,
  gainControl: `o:"gain control of" ${base}`,
  castFromOpp: `(o:"an opponent owns" or o:"cards your opponents own" or o:"opponent's library" ) o:cast ${base}`,
  everyType: `(kw:changeling or o:"every creature type") ${base}`,
  turnedFaceUp: `o:"turned face up" ${base}`,
  entersNotCast: `o:"without being cast" ${base}`,
  commanderNinja: `o:ninja ${base}`,
  drainOnCombat: `o:"deals combat damage" o:"loses" ${base}`,
  eachOppLoses: `o:"each opponent loses" t:creature cmc<=4 ${base}`,
  copyCreature: `(o:"enter as a copy" or o:"becomes a copy") t:creature ${base}`,
  attackTrigger: `o:"whenever you attack" ${base}`,
  untapAll: `o:"untap all creatures you control" ${base}`,
  hasteAll: `o:"creatures you control have haste" ${base}`,
  plusOneZero: `o:"get +1/+0" ${base}`,
  cantBlock: `o:"can't block this turn" ${base}`,
  gameChangers: `is:gamechanger ${base}`,
  phase: `o:"phase out" ${base}`,
  flash: `o:"as though they had flash" ${base}`,
  dontUntapLands: `o:"lands don't untap" ${base}`,
  playersCantBlock: `o:"can't block" o:"each opponent" ${base}`,
  stealCombat: `o:"exile the top" o:"combat damage" ${base}`,
  manaFromHit: `o:"combat damage" o:treasure ${base}`,
  wardEquip: `t:equipment ${base}`,
  auraEvasion: `t:aura (o:"can't be blocked" or o:"double strike" or o:"+1/+0") ${base}`
};
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function search(q) {
  let url = "https://api.scryfall.com/cards/search?unique=cards&order=name&q=" + encodeURIComponent(q), out = [], total = 0;
  while (url) {
    await sleep(120);
    const r = await fetch(url, { headers: UA });
    const j = await r.json();
    if (j.object === "error") { if (j.status === 404) return { total: 0, cards: [] }; throw new Error(q + ": " + j.details); }
    total = j.total_cards; out = out.concat(j.data); url = j.has_more ? j.next_page : null;
  }
  return { total, cards: out };
}
const textOf = c => c.oracle_text != null ? c.oracle_text : (c.card_faces || []).map(f => `${f.name}: ${f.oracle_text}`).join("\n//\n");
const costOf = c => c.mana_cost != null && c.mana_cost !== "" ? c.mana_cost : (c.card_faces || []).map(f => f.mana_cost).filter(Boolean).join(" // ");
(async () => {
  const db = fs.existsSync(path.join(OUT, "cards.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "cards.json"))) : {};
  const qs = {};
  const only = process.argv.slice(2);
  for (const [k, q] of Object.entries(Q)) {
    if (only.length && !only.includes(k)) continue;
    try {
      const r = await search(q);
      qs[k] = { q, total: r.total, cards: r.cards.map(c => c.name) };
      for (const c of r.cards) {
        const e = db[c.name] || (db[c.name] = { name: c.name, found: [] });
        Object.assign(e, {
          cost: costOf(c), cmc: c.cmc, type: c.type_line, text: textOf(c), pt: c.power != null ? `${c.power}/${c.toughness}` : (c.card_faces && c.card_faces[0].power != null ? `${c.card_faces[0].power}/${c.card_faces[0].toughness}` : null),
          ci: c.color_identity.join(""), commander: c.legalities.commander, gc: !!c.game_changer, keywords: c.keywords, edhrec: c.edhrec_rank || null,
          usd: c.prices.usd, scryfall: c.scryfall_uri.split("?")[0], tcg: (c.purchase_uris || {}).tcgplayer || null, oracle_id: c.oracle_id
        });
        if (!e.found.includes(k)) e.found.push(k);
      }
      console.log(`${k}: ${r.total}`);
    } catch (e) { console.log(`${k}: FAILED ${e.message}`); qs[k] = { q, error: e.message }; }
  }
  const prevQ = fs.existsSync(path.join(OUT, "queries.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "queries.json"))) : {};
  fs.writeFileSync(path.join(OUT, "queries.json"), JSON.stringify(Object.assign(prevQ, qs), null, 1));
  fs.writeFileSync(path.join(OUT, "cards.json"), JSON.stringify(db, null, 1));
  console.log("cards in db:", Object.keys(db).length, "fetched", new Date().toISOString());
})();
