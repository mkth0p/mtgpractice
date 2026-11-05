/* Per-game telemetry for the Goblin Storm hero (wrap.js, TELE_OUT): win, rounds, opponents, mulligans, spells
   cast and copied, Zada casts, the biggest storm count, cards drawn, damage dealt to opponents by source
   (combat or not), what dealt the last damage to each opponent the hero knocked out, and how the hero went
   out. summary.js reads the files. */
"use strict";
const fs = require("fs");
module.exports = function install(MK, opts) {
  const G = MK.Game.prototype, rows = [], ZADA = MK.GSTORM_DECK.commander;
  const st = g => g.__gt || (g.__gt = { hero: g.players.find(p => p.deckId === "goblin-storm") || null, casts: 0, zada: [], copies: 0, storm: 0, drawn: 0, dmg: {}, last: new Map(), kills: [], out: null, firstWin: null, byCard: {} });
  const nameOf = o => (o && o.def ? (o.isToken ? "token: " + o.def.name : o.def.name) : "?");
  const oe = G.emit;
  G.emit = function (type, ev) {
    const s = st(this), h = s.hero;
    if (h && ev) {
      if (type === "cast" && ev.p === h) {
        s.casts++;
        const n = ev.o && ev.o.def ? ev.o.def.name : "?";
        s.byCard[n] = (s.byCard[n] || 0) + 1;
        if (n === ZADA) s.zada.push(this.round);
        if (this.active === h && (this.spellsThisTurn || 0) > s.storm) s.storm = this.spellsThisTurn;
      }
      if (type === "copied" && ev.p === h) s.copies++;
      if (type === "draw" && ev.p === h) s.drawn++;
      if (type === "damage" && ev.toPlayer && ev.target !== h && ev.src && ev.src.controller === h) {
        const k = (ev.combat ? "combat " : "") + nameOf(ev.src);
        s.dmg[k] = (s.dmg[k] || 0) + ev.amount;
        s.last.set(ev.target, k);
      }
      if (type === "loseLife" && ev.p !== h && !ev.fromDamage && !ev.paid && ev.src && ev.src.controller === h) {
        const k = "drain " + nameOf(ev.src);
        s.dmg[k] = (s.dmg[k] || 0) + ev.amount;
        s.last.set(ev.p, k);
      }
    }
    return oe.apply(this, arguments);
  };
  const olose = G.lose;
  G.lose = function (p, why) {
    const s = st(this);
    if (s.hero && !p.lost) {
      if (p === s.hero) s.out = { round: this.round, why, turnOf: this.active ? this.active.deckId : null };
      else s.kills.push({ round: this.round, why, by: s.last.get(p) || null, onHeroTurn: this.active === s.hero });
    }
    return olose.apply(this, arguments);
  };
  const op = G.play;
  G.play = async function () {
    const g = this, s = st(g);
    const r = await op.apply(this, arguments);
    const h = s.hero;
    if (h) rows.push({
      seed: g.seed, win: g.winner === h, rounds: g.round, winner: g.winner ? g.winner.deckId : null, draw: !!(g.endInfo && g.endInfo.draw),
      opps: g.players.filter(q => q !== h).map(q => q.deckId), mulls: h.mulls || 0,
      casts: s.casts, zada: s.zada, copies: s.copies, storm: s.storm, drawn: s.drawn, dmg: s.dmg, kills: s.kills, out: s.out, byCard: s.byCard
    });
    return r;
  };
  process.on("exit", () => fs.writeFileSync(opts.out, JSON.stringify(rows)));
};
