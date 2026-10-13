/* node scripts/missing-from-engine.js > missing-from-engine.md: every card of the decklists that engine-cards.txt lacks,
   most important first (win-line pieces, then by how many lists play it, lands last), with its exact Oracle text from
   cards.json and one line on what is tricky to implement (NOTES, written by hand). */
"use strict";
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
const cards = JSON.parse(fs.readFileSync(path.join(root, "cards.json"), "utf8")), by = new Map(cards.map(c => [c.name, c]));
const combos = JSON.parse(fs.readFileSync(path.join(root, "combos.json"), "utf8"));
const NOTES = {
  "Brago, King Eternal": "Combat-damage trigger with \"any number of\" targets among your own nonland permanents; returned cards are new objects (tokens cease to exist, counters and attachments go, permanents come back untapped). The bot needs a pick rule: tapped mana rocks, ETB creatures, its own stax pieces.",
  "Child of Alara": "Dies trigger, \"can't be regenerated\". As a commander it must reach the graveyard before the command-zone move (CR 903.9a, rulings.md) so the trigger fires.",
  "Displacer Kitten": "Cast trigger on noncreature spells that blinks a nonland permanent you control; with Teferi each blink makes a new Teferi object that can use its loyalty ability again. The loop needs a scripted repeat with a stop condition (library size for the Oracle finish).",
  "Peregrine Drake": "ETB untaps up to five lands: the bot must choose the five that tap for the most mana. Loops with Ghostly Flicker + Archaeomancer (combos.json).",
  "Scurry Oak": "Evolve is an intervening-if that compares power and toughness on trigger and on resolution; the counter trigger makes a Squirrel. With Trostani + a lifegain-counter engine it loops forever, so the engine needs a cap (already written on the miku-tournament branch: miku/game/cards-miku-tourney.js, 60 a turn).",
  "Swift Reconfiguration": "Type-changing Aura with flash: the creature becomes a noncreature Vehicle artifact (crew 5). Devoted Druid then taps the turn it arrives and its -1/-1 counters don't kill it (combos.json druid-swiftreconfig).",
  "Tainted Pact": "Exiles the top card one at a time, the controller choosing whether to continue, and stops on a repeated name. With Thassa's Oracle the bot exiles everything (the deck runs one of each basic).",
  "Teferi, Time Raveler": "Static that limits opponents to sorcery timing (shuts off their counters during the loop), +1 sorcery flash, -3 bounce plus draw. Loyalty-ability once per turn per object matters for the Kitten loop.",
  "Brain Freeze": "Storm: copies for each spell cast before it this turn; target yourself to mill for the Breach loop.",
  "Lion's Eye Diamond": "Mana ability that sacrifices it and discards your hand, activatable only as an instant (rulings); with Underworld Breach it escapes again from the graveyard.",
  "Underworld Breach": "Gives every nonland card in your graveyard escape (cost plus exile three other cards) until it's sacrificed at the end step.",
  "Snapcaster Mage": "Flash; ETB gives a target instant or sorcery card in your graveyard flashback equal to its mana cost (recasts Dramatic Reversal).",
  "Aether Channeler": "Modal ETB: a 1/1 Bird, bounce a nonland permanent, or draw. Brago blinks pick the mode each time.",
  "Allosaurus Shepherd": "Static: your green spells can't be countered; activated type-and-size change for Elves.",
  "Archon of Emeria": "Each player casts at most one spell each turn; opponents' nonbasic lands enter tapped.",
  "Aura Shards": "Optional trigger on each creature entering under your control: destroy target artifact or enchantment.",
  "Chromatic Lantern": "Lands you control have \"{T}: Add one mana of any color\" (a layer-6 ability grant).",
  "Cloud of Faeries": "ETB untaps up to two lands; cycling {2}.",
  "Deathrite Shaman": "Three activations that exile land, instant/sorcery or creature cards from any graveyard.",
  "Dovin's Veto": "Can't be countered; counters noncreature spells only.",
  "Elesh Norn, Mother of Machines": "Your ETB triggers trigger an additional time; opponents' permanents' ETB abilities don't trigger. Touches every ETB in the game.",
  "Ephemerate": "Flicker your creature, with rebound (casts again at your next upkeep from exile).",
  "Fauna Shaman": "{G}, {T}, discard a creature card: search for a creature card.",
  "Flusterstorm": "Storm counter that taxes {1}; copies each need their own payment decision.",
  "Mother of Runes": "{T}: protection from a chosen color for a creature you control (blocks, damage, targeting, attachment).",
  "Mulldrifter": "Evoke alternative cost (sacrificed on ETB), draws two.",
  "Omen of the Sea": "Flash; scry 2 and draw on ETB, sacrifice for another scry.",
  "Orcish Bowmasters": "Triggers on opponents' draws other than the first in their draw step; deals 1 damage and amasses Orcs.",
  "Phyrexian Metamorph": "Clone of an artifact or creature that stays an artifact; Phyrexian mana in its cost.",
  "Ragavan, Nimble Pilferer": "Dash; on combat damage to a player, a Treasure and exile-and-may-cast the top card of that player's library this turn.",
  "Reflector Mage": "Bounce an opponent's creature; its owner can't cast spells with that name until their next turn.",
  "Skyclave Apparition": "Exiles a nonland, nontoken permanent with mana value 4 or less you don't control; when it leaves, that player gets an X/X token.",
  "Soulherder": "End-step blink of another creature you control; grows from exiled creatures.",
  "Supreme Verdict": "A wrath that can't be countered.",
  "Sylvan Tutor": "Puts the creature on top of the library (not to hand).",
  "Utopia Sprawl": "Enchant Forest; choose a color as it enters; extra mana of that color when the Forest is tapped.",
  "Venser, Shaper Savant": "Flash; ETB returns target spell (from the stack) or permanent to its owner's hand.",
  "Wall of Omens": "Defender; draw on ETB.",
  "Deadeye Navigator": "Soulbond pairing (choose a partner when either enters; the pair breaks when one leaves) and a granted {1}{U} flicker ability on both. With Peregrine Drake the loop needs a scripted repeat and a stop condition (combos.json drake-deadeye).",
  "Loran of the Third Path": "ETB destroys up to one artifact or enchantment (Brago re-uses it each connect); the {T} draw gives the target opponent a card too.",
  "Reality Acid": "Aura with vanishing 3: the enchanted permanent is sacrificed when the Aura leaves the battlefield, so a Brago blink of the Aura kills its target at once (return it to a new target).",
  "Coldsteel Heart": "Snow artifact that enters tapped; choose a color as it enters.",
  "Cloudshift": "Flicker a creature you control (instant, no rebound).",
  "Cryogen Relic": "Draws when it enters and when it leaves; its activated ability puts a stun counter. Brago blinks repeat both draws.",
  "Sea Gate Oracle": "Look at the top two, one to hand and one to the bottom (not a draw: matters for Orcish Bowmasters-type triggers).",
  "Wild Growth": "Enchant land; extra {G} when it's tapped for mana.",
  "Culling Ritual": "Destroy each nonland permanent with mana value 2 or less; add {B} or {G} for each destroyed.",
  "Faerie Mastermind": "Flash flier; draws when an opponent draws their second card each turn; activated draw.",
  "Prismatic Vista": "Fetch a basic land, pay 1 life.",
  "Adarkar Wastes": "Pain land: colorless free, colored costs 1 damage.",
  "Celestial Colonnade": "Enters tapped; becomes a 4/4 flying vigilance creature land.",
  "Deserted Beach": "Enters tapped unless you control two or more other lands.",
  "Glacial Fortress": "Enters tapped unless you control a Plains or an Island.",
  "Irrigated Farmland": "Enters tapped; cycling {2}; has basic land types (fetchable).",
  "Sea of Clouds": "Enters tapped unless you have two or more opponents (untapped in multiplayer).",
  "Spire of Industry": "Any color for 1 life, only if you control an artifact.",
  "Tundra": "Dual with basic land types Plains and Island (fetchable).", "Bayou": "Dual with basic land types Swamp and Forest (fetchable).",
  "Taiga": "Dual with basic land types Mountain and Forest (fetchable).", "Tropical Island": "Dual with basic land types Forest and Island (fetchable).",
  "Underground Sea": "Dual with basic land types Island and Swamp (fetchable).", "Volcanic Island": "Dual with basic land types Island and Mountain (fetchable)."
};
const lists = fs.readdirSync(root).filter(f => /^decklist-.*\.txt$/.test(f) && !/trostani/.test(f));
const use = new Map();
for (const f of lists) for (const l of fs.readFileSync(path.join(root, f), "utf8").split("\n")) {
  const n = l.replace(/^1 /, "").trim(); const c = by.get(n);
  if (!c || c.in_engine) continue; if (!use.has(n)) use.set(n, new Set()); use.get(n).add(f.replace(/^decklist-|\.txt$/g, ""));
}
const rows = [...use].map(([n, s]) => ({ n, s: [...s], c: by.get(n) })).sort((a, b) => (b.c.combos.length > 0) - (a.c.combos.length > 0) || a.c.roles.includes("land") - b.c.roles.includes("land") || b.s.length - a.s.length || a.n.localeCompare(b.n));
const out = [`# Cards in the lists that the game engine doesn't have yet`, ``,
  `Every card of the decklists (\`decklist-*.txt\`) that isn't in \`engine-cards.txt\`: ${rows.length} cards. Order: win-line pieces first, then the cards most lists play, lands last. The Oracle text is quoted from Scryfall's bulk data (\`cards.json\`, bulk of 2026-10-07 21:00 UTC). The notes on what's tricky are mine. Generated by \`scripts/missing-from-engine.js\`.`, ``];
for (const r of rows) {
  const c = r.c, txt = c.oracle_text != null ? c.oracle_text : c.faces.map(f => `${f.name}: ${f.oracle_text}`).join("\n//\n");
  out.push(`## ${c.name} — ${c.mana_cost || "no cost"} · ${c.type_line}${c.power != null ? ` ${c.power}/${c.toughness}` : ""}${c.loyalty != null ? ` · loyalty ${c.loyalty}` : ""}`);
  out.push(`Lists: ${r.s.join(", ")}${c.combos.length ? ` · win lines: ${c.combos.join(", ")}` : ""}${c.game_changer ? " · Game Changer" : ""}`, "");
  out.push(txt.split("\n").map(l => "> " + l).join("\n"), "");
  out.push(`Tricky: ${NOTES[c.name] || "nothing beyond the text."}`, "");
}
console.log(out.join("\n"));
