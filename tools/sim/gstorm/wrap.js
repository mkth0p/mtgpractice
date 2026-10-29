/* Bench wrapper for Goblin Storm (Zada) lists (bench.sh). Loads the game like run.js, then:
   - plays the hero as the "goblin-storm" deck (so the Zada brain and the deck's hooks apply) with LIST:
     "precon" (MK.GSTORM_DECK's list) or a decklist file ("1 Card Name" lines, the commander skipped);
   - VARIANT='{"cut":[...],"add":[...]}' swaps cards in place (cut[i] -> add[i]), so a swapped card keeps its
     library position and paired seeds stay comparable;
   - COMMANDER='Krenko, Mob Boss' (or a "Commander:" line / the first line of the decklist file) swaps the
     commander; that card is skipped in the list;
   - POOL picks the three opponents' pool: p2 (the five Bracket 2 precons), b3 (the Bracket 3 bots),
     b4 (nine Bracket 4 bots: the Azusa bench's seven plus Azusa and Brago v2) or goldfish (do-nothing decks).
   - the game stops as soon as the hero loses (STOP_ON_LOSS=0 plays it out).
   Then hands the remaining argv to run.js (use --decks goblin-storm,random,random,random). */
"use strict";
const path = require("path"), fs = require("fs");
const repo = path.resolve(__dirname, "../../..");
const dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
const POOLS = {
  p2: ["ghired", "isperia", "kaalia", "lathril", "wilhelt"],
  b3: ["etrata", "avengers", "doom", "fantastic4", "spiderverse"],
  b4: ["corrupted-etrata", "etrata-b4", "edgar", "ghalta", "krenko", "talrand", "urdragon", "azusa", "brago-v2"]
};
const poolName = process.env.POOL || "b4";
if (poolName === "goldfish") MK.BOT_DECKS = [{ id: "goldfish", name: "Goldfish", commander: "Vorinclex, Voice of Hunger", identity: ["G", "W"], bracket: 9, list: Array(99).fill("Plains") }];
else {
  const ids = POOLS[poolName];
  if (!ids) throw new Error("unknown POOL " + poolName);
  const all = new Map(MK.BOT_DECKS.concat(MK.HERO_DECKS || []).map(d => [d.id, d]));
  MK.BOT_DECKS = ids.map(id => { if (!all.has(id)) throw new Error("no bot deck " + id); return all.get(id); });
}
const src = process.env.LIST || "precon";
let list, commander = process.env.COMMANDER || null;
if (src === "precon") list = MK.GSTORM_DECK.list.slice();
else {
  list = [];
  const lines = fs.readFileSync(src, "utf8").split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#") && !l.startsWith("//"));
  const cmd = lines.find(l => /^commander:/i.test(l));
  if (!commander && cmd) commander = cmd.replace(/^commander:\s*(1\s+)?/i, "").trim();
  let first = true;
  for (const line of lines) {
    const m = line.match(/^(\d+)x?\s+(.+?)(\s+\*CMDR\*)?$/);
    if (!m) continue;
    // the first card line is the commander when nothing else names one and the file has 100 cards
    if (first && !commander && lines.filter(l => /^\d/.test(l)).reduce((a, l) => a + +l.match(/^\d+/)[0], 0) === 100) { commander = m[2]; first = false; continue; }
    first = false;
    if (m[2] === commander) continue;
    for (let i = 0; i < +m[1]; i++) list.push(m[2]);
  }
}
commander = commander || MK.GSTORM_DECK.commander;
if (!MK.defs.has(commander)) throw new Error("commander not defined in the engine: " + commander);
// a new commander that was in the 99 trades places with the old one (the precon with Krenko in charge)
if (list.includes(commander)) list[list.indexOf(commander)] = MK.GSTORM_DECK.commander;
if (process.env.VARIANT) {
  const v = JSON.parse(process.env.VARIANT);
  (v.cut || []).forEach((n, i) => { const k = list.indexOf(n); if (k < 0) throw new Error("not in list: " + n); list[k] = v.add[i]; });
}
const missing = [...new Set(list.filter(n => !MK.defs.has(n)))];
if (missing.length) throw new Error("cards not defined in the engine: " + missing.join(", "));
if (list.length !== 99) throw new Error(`the hero list has ${list.length} cards`);
const dup = list.filter((n, i) => n !== "Mountain" && list.indexOf(n) !== i);
if (dup.length) throw new Error("not singleton: " + dup.join(", "));
MK.GSTORM_DECK.list = list;
MK.GSTORM_DECK.commander = commander;
if (process.env.TELE_OUT) require("./tele.js")(MK, { out: process.env.TELE_OUT });
// the game is over for the hero once it loses: stop there (the hero's result can't change, and benches run faster)
if (process.env.STOP_ON_LOSS !== "0") {
  const olose = MK.Game.prototype.lose;
  MK.Game.prototype.lose = function (p, why) {
    const r = olose.apply(this, arguments);
    if (p && p.deckId === "goblin-storm" && p.lost && !this.over) this.end(null, { heroLost: true });
    return r;
  };
}
require(path.join(repo, "tools/sim/run.js"));
