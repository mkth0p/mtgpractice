/* Watch one bench game of the Brago hero: LIST=... [VARIANT=...] node watch.js SEED_OF_PROCESS GAME_INDEX
   (the game is the GAME_INDEX-th (0-based) of the process whose first seed is SEED_OF_PROCESS, as in bench.sh)
   Prints the hero's hand and board at the start of each of its turns and every log line about the hero. */
"use strict";
const path = require("path");
const [s0, gi] = process.argv.slice(2).map(Number);
process.argv = [process.argv[0], path.join(__dirname, "wrap.js"), "--games", String(gi + 1), "--seed", String(s0), "--decks", "brago-hero," + (process.env.OPP || "random4") + "," + (process.env.OPP || "random4") + "," + (process.env.OPP || "random4"), "--first", "random"];
const MK = globalThis.MK || (globalThis.MK = {});
const fs = require("fs");
// load wrap's setup, but hook the game first: wrap.js requires run.js at the end, which starts the games
const repo = path.resolve(__dirname, "../../..");
const origLog = console.log;
let cur = -1;
const Mod = require("module");
const origLoad = Mod._load;
Mod._load = function (req) {
  const r = origLoad.apply(this, arguments);
  if (/engine\.js$/.test(req) && globalThis.MK && globalThis.MK.Game && !globalThis.MK.Game.__watch) {
    const G = globalThis.MK.Game.prototype; globalThis.MK.Game.__watch = true;
    const tt = G.takeTurn;
    G.takeTurn = async function (p, o) {
      if (this.seed === s0 + gi && p.deckId === "brago-hero") {
        origLog(`--- round ${this.round} turn ${this.turn}: life ${p.life}, hand: ${p.hand.map(c => c.def.name).join(", ")}`);
        origLog(`    board: ${this.battlefield.filter(x => x.controller === p).map(x => x.def.name + (x.tapped ? "(T)" : "")).join(", ")}`);
        origLog(`    opponents: ${this.opponents(p).map(q => `${q.name} ${q.life} [${this.battlefield.filter(x => x.controller === q && !this.isLand(x)).map(x => x.def.name).join(", ")}]`).join(" | ")}`);
      }
      return tt.apply(this, arguments);
    };
    const lg = G.log;
    G.log = function (text, info) {
      if (this.seed === s0 + gi && (/Brago Hero/.test(text) || /wins|out of the game/.test(text))) origLog(`  t${this.turn} ${text}`);
      return lg.apply(this, arguments);
    };
  }
  return r;
};
console.log = (...a) => { if (!/^game \d+ seed/.test(String(a[0])) || String(a[0]).includes(`seed ${s0 + gi}:`)) origLog(...a); };
require("./wrap.js");
