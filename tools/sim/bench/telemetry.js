/* Etrata telemetry: STATS_OUT=file.json node telemetry.js <wrap.js args>. Per game: wins, rounds, Etrata casts,
   opponent cards she cloaked, flips with her granted ability, flips of stolen cards, free casts from the fallback. */
const path = require("path"), fs = require("fs");
require(path.resolve(__dirname, "../../../miku/game/engine.js"));
const MK = globalThis.MK, G = MK.Game.prototype, ET = "Etrata, Deadly Fugitive", rows = [];
const st = g => g.__st || (g.__st = { stolen: 0, flips: 0, stolenFlips: 0, freeCasts: 0 });
const oc = G.cloakTop;
G.cloakTop = function (p, from, src) { if (src && src.def && src.def.name === ET && from && from !== p) st(this).stolen++; return oc.apply(this, arguments); };
const op = G.play;
G.play = async function () {
  const g = this, me = g.players.find(p => p.commanders && p.commanders.some(c => c.def.name === ET));
  const up = MK.defs.get(ET).statics[0].grantAbilities[0];
  if (!up.__wrapped) { const od = up.do; up.do = async (g2, src, ctx) => { const s = st(g2); s.flips++; if (src.owner && src.owner !== ctx.p) s.stolenFlips++; if (!g2.canTurnFaceUp(src)) s.freeCasts++; return od(g2, src, ctx); }; up.__wrapped = true; }
  const r = await op.apply(this, arguments);
  rows.push(Object.assign({ seed: g.seed, win: !!me && g.winner === me, rounds: g.round, etrataCasts: me ? (me.stats.cast[ET] || 0) : 0 }, st(g)));
  return r;
};
process.on("exit", () => { if (process.env.STATS_OUT) fs.writeFileSync(process.env.STATS_OUT, JSON.stringify(rows)); });
require("./wrap.js");
