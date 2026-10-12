/* Bench wrapper for the Azusa lists (bench.sh): loads the game like run.js, makes the Ashaya lists
   (MK.AZUSA_VARIANTS: azusa-v2, azusa-v3) playable as heroes, takes the Azusa bot out of the opponents
   (no mirror games: every list meets the same 7 Bracket 4 bots), and with TELE_OUT records per game
   for the hero: the lines it took (p.azusaLines), Ashaya entering and leaving, the win. */
const path = require("path"), fs = require("fs");
const repo = path.resolve(__dirname, "../../..");
const dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
for (const d of MK.AZUSA_VARIANTS) if (!MK.HERO_DECKS.includes(d)) MK.HERO_DECKS.push(d);
// the Brago bots (merged in later) stay out too, so the pool is still the 7 bots of RESULTS.md
MK.BOT_DECKS = MK.BOT_DECKS.filter(d => !["azusa", "brago", "brago-1500"].includes(d.id));
const hero = process.env.HERO;
const deck = MK.HERO_DECKS.find(d => d.id === hero);
if (!deck) throw new Error("no hero deck " + hero);
for (const n of deck.list) if (!MK.defs.has(n)) throw new Error("card not defined in the engine: " + n);
if (deck.list.length !== 99) throw new Error(`${hero} has ${deck.list.length} cards`);
if (process.env.TELE_OUT) require("./tele.js")(MK, { heroId: hero, out: process.env.TELE_OUT });
require(path.join(repo, "tools/sim/run.js"));
