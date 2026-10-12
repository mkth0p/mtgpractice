/* Per-game telemetry for the Brago hero (wrap.js, TELE_OUT): win, rounds, opponents, mulligans, the lines
   the brain noted (p.bragoLines: infinite mana and its engine, the kill and its outlet), Brago cast and
   connecting (rounds), the opening hand, when and how the hero went out (round, why, whose turn), and how
   each opponent went out. summary.js reads the files. */
"use strict";
const fs = require("fs");
module.exports = function install(MK, opts) {
  const G = MK.Game.prototype, rows = [], HERO = opts.heroId, BRAGO = "Brago, King Eternal";
  const st = g => g.__bt || (g.__bt = { hero: g.players.find(p => p.deckId === HERO) || null, casts: [], hits: [], outs: [], out: null, opener: null });
  const oe = G.emit;
  G.emit = function (type, ev) {
    const s = st(this), h = s.hero;
    if (h && ev) {
      if (type === "cast" && ev.p === h && ev.o && ev.o.def.name === BRAGO) s.casts.push(this.round);
      if (type === "combatDamagePlayer" && ev.src && ev.src.def && ev.src.def.name === BRAGO && ev.src.controller === h) s.hits.push(this.round);
    }
    return oe.apply(this, arguments);
  };
  const olose = G.lose;
  G.lose = function (p, why) {
    const s = st(this);
    if (s.hero && !p.lost) {
      if (p === s.hero) s.out = { round: this.round, why, turnOf: this.active ? this.active.deckId : null };
      else s.outs.push({ why, round: this.round });
    }
    return olose.apply(this, arguments);
  };
  const om = G.mulligans;
  G.mulligans = async function () {
    const r = await om.apply(this, arguments);
    const s = st(this);
    if (s.hero) s.opener = s.hero.hand.map(o => o.def.name);
    return r;
  };
  const op = G.play;
  G.play = async function () {
    const g = this, s = st(g);
    const r = await op.apply(this, arguments);
    const h = s.hero;
    if (h) rows.push({
      seed: g.seed, win: g.winner === h, rounds: g.round, winner: g.winner ? g.winner.deckId : null, draw: !!(g.endInfo && g.endInfo.draw),
      opps: g.players.filter(q => q !== h).map(q => q.deckId), mulls: h.mulls || 0, opener: s.opener,
      lines: h.bragoLines || [], casts: s.casts, hits: s.hits, out: s.out, outs: s.outs
    });
    return r;
  };
  process.on("exit", () => fs.writeFileSync(opts.out, JSON.stringify(rows)));
};
