/* Bench wrapper for the Brago lists (bench.sh). Loads the game like run.js, then:
   - takes the Azusa bot and both Brago bots out of the Bracket 4 opponents, so every list meets the same
     7 Bracket 4 bots as the Azusa bench (tools/sim/azusa/: Corrupted Etrata, Etrata B4, Edgar, Ghalta,
     Krenko, Talrand, Ur-Dragon), in the same order: same seeds, same opponents, same seats;
   - seats the hero as deck id "brago-hero" (the Brago brain) with LIST: "1500", "uncapped", "v2" (the
     lists in MK.BRAGO_LISTS) or a decklist file ("1 Card Name" lines, the commander skipped);
   - VARIANT='{"cut":[...],"add":[...]}' swaps cards in place (cut[i] -> add[i]), so a swapped card keeps its
     library position and paired seeds stay comparable;
   - GOLDFISH=1 adds a do-nothing opponent deck (99 Plains, an uncastable commander) as "goldfish";
   - TELE_OUT=file.json records per-game telemetry for the hero (tele.js).
   Then hands the remaining argv to run.js. */
"use strict";
const path = require("path"), fs = require("fs");
const repo = path.resolve(__dirname, "../../..");
const dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
MK.BOT_DECKS = MK.BOT_DECKS.filter(d => !["azusa", "brago", "brago-1500"].includes(d.id));
const src = process.env.LIST || "1500";
let list;
if (MK.BRAGO_LISTS[src]) list = MK.BRAGO_LISTS[src].slice();
else {
  list = [];
  for (const line of fs.readFileSync(src, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)\s+(.+)$/);
    if (!m || m[2] === "Brago, King Eternal") continue;
    for (let i = 0; i < +m[1]; i++) list.push(m[2]);
  }
}
if (process.env.VARIANT) {
  const v = JSON.parse(process.env.VARIANT);
  (v.cut || []).forEach((n, i) => { const k = list.indexOf(n); if (k < 0) throw new Error("not in list: " + n); list[k] = v.add[i]; });
}
for (const n of list) if (!MK.defs.has(n)) throw new Error("card not defined in the engine: " + n);
if (list.length !== 99) throw new Error(`the hero list has ${list.length} cards`);
const BASICS = new Set(["Island", "Plains", "Wastes"]);
const dup = list.filter((n, i) => !BASICS.has(n) && list.indexOf(n) !== i);
if (dup.length) throw new Error("not singleton: " + dup.join(", "));
const hero = Object.assign({}, MK.BRAGO_1500_DECK, { id: "brago-hero", name: "Brago Hero", list });
(MK.HERO_DECKS = MK.HERO_DECKS || []).push(hero);
MK.DECK_BRAINS["brago-hero"] = MK.DECK_BRAINS.brago;
if (process.env.GOLDFISH) MK.BOT_DECKS.push({ id: "goldfish", name: "Goldfish", commander: "Vorinclex, Voice of Hunger", identity: ["G", "W"], bracket: 9, list: Array(99).fill("Plains") });
if (process.env.TELE_OUT) require("./tele.js")(MK, { heroId: "brago-hero", out: process.env.TELE_OUT });
require(path.join(repo, "tools/sim/run.js"));
