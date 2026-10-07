/* node watch.js <wrap.js args with --games 1 --seed S ...>: one game's log with the hero's hand and board printed at the start of
   each of its turns (HERO_ID env, default etrata-heist-aggro). */
const path = require("path");
require(path.resolve(__dirname, "../../../miku/game/engine.js"));
const MK = globalThis.MK, G = MK.Game.prototype, HERO = process.env.HERO_ID || "etrata-heist-aggro";
const ot = G.takeTurn;
G.takeTurn = async function (p) {
  if (p.deckId === HERO) {
    const g = this, name = o => o.faceDown ? `[fd:${o.cardDef.name}${o.owner !== p ? "*" : ""}]` : o.def.name;
    console.log(`  == R${g.round} ${p.name} life ${p.life} | hand: ${p.hand.map(o => o.def.name).join(", ")}`);
    console.log(`     board: ${g.controlled(p).filter(o => !g.isLand(o)).map(o => name(o) + (g.isCreature(o) ? ` ${g.power(o)}/${g.toughness(o)}` : "")).join(", ")} | lands ${g.controlled(p, o => g.isLand(o)).length} | opps ${g.opponents(p).map(q => q.name + " " + q.life + " (" + g.creatures(q).length + "cr)").join(", ")}`);
  }
  return ot.apply(this, arguments);
};
require("./wrap.js");
