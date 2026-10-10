/* Bench wrapper around tools/sim/run.js for deck experiments.
   Loads the game like run.js, then optionally:
   - VARIANT='{"cut":[...],"add":[...]}' swaps cards in the hero deck's list (cut[i] -> add[i]), in place,
     so a swapped card keeps its library position and paired seeds stay comparable.
   - LIST_FILE=path replaces the hero list with a whole decklist ("1 Card Name" lines, commander excluded).
   - DECK_CONST=CETRATA_DECK picks which MK.*_DECK object is the hero (default CETRATA_DECK).
   - NO_COMMANDER=1 stops the hero from ever casting its commander from the command zone.
   - TELE_OUT=file.json records per-game telemetry for the hero (tele.js: steals, flips, where the damage came from,
     how each opponent went out).
   - MANA_OUT=file.json records mana efficiency per turn cycle for the hero (mana.js; GOLDFISH=1 adds a do-nothing
     "goldfish" opponent deck).
   Then hands the remaining argv to run.js. */
const path = require("path"), fs = require("fs");
const repo = path.resolve(__dirname, "../../..");
const dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK;
const deck = MK[process.env.DECK_CONST || "CETRATA_DECK"];
if (!deck) throw new Error("no MK." + process.env.DECK_CONST);
if (process.env.LIST_FILE) {
  const list = [];
  for (const line of fs.readFileSync(process.env.LIST_FILE, "utf8").split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)\s+(.+)$/);
    if (!m || m[2] === deck.commander) continue;
    for (let i = 0; i < +m[1]; i++) list.push(m[2]);
  }
  deck.list = list;
}
if (process.env.VARIANT) {
  const v = JSON.parse(process.env.VARIANT), list = deck.list.slice();
  (v.cut || []).forEach((n, i) => { const k = list.indexOf(n); if (k < 0) throw new Error("not in list: " + n); list[k] = v.add[i]; });
  deck.list = list;
}
for (const n of deck.list) if (!MK.defs.has(n)) throw new Error("card not defined in the engine: " + n);
if (process.env.NO_COMMANDER) {
  const G = MK.Game.prototype, orig = G.castZones;
  G.castZones = function (p) { const z = orig.call(this, p); return p.commanders.some(c => c.def.name === deck.commander) ? z.filter(o => !o.isCommander || o.zone !== "command") : z; };
}
if (process.env.MANA_OUT) require("./mana.js")(MK, { heroId: process.env.TELE_HERO || deck.id, out: process.env.MANA_OUT });
if (process.env.TELE_OUT) require("./tele.js")(MK, { heroId: process.env.TELE_HERO || deck.id, out: process.env.TELE_OUT });
require(path.join(repo, "tools/sim/run.js"));
