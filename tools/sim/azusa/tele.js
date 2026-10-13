/* Per-game telemetry for an Azusa hero (wrap.js, TELE_OUT): win, rounds, the lines the brain took
   (p.azusaLines: infinite mana, the kill), Ashaya: entered, left the battlefield (round, where to,
   whose turn, what did it: an opponent's spell or ability, combat, our own), Dark Depths' Marit Lage,
   Craterhoof cast, how each opponent went out. summary.js reads the files. */
"use strict";
const fs = require("fs");
module.exports = function install(MK, opts) {
  const G = MK.Game.prototype, rows = [], HERO = opts.heroId, ASHAYA = "Ashaya, Soul of the Wild";
  const st = g => g.__az || (g.__az = { hero: g.players.find(p => p.deckId === HERO) || null, ashaya: [], left: [], hoof: 0, lage: 0, outs: [] });
  const oe = G.emit;
  G.emit = function (type, ev) {
    const s = st(this), h = s.hero;
    if (h && ev && type === "enters" && ev.p === h && ev.o) {
      if (ev.o.def.name === ASHAYA) s.ashaya.push(this.round);
      if (ev.o.def.name === "Marit Lage") s.lage++;
    }
    if (h && ev && type === "leaves" && ev.lki && ev.lki.controller === h && ev.lki.name === ASHAYA) {
      // what was resolving: a spell or ability (resolveTop below), else a trigger
      const res = this.__azRes || this.resolving;
      const by = res && res.p ? (res.p === h ? "own" : "opponent") : this.combat && this.phase === "damage" ? "combat" : "other";
      s.left.push({ round: this.round, to: ev.to, turn: this.active === h ? "mine" : "theirs", by, what: (res && res.o && res.o.def && res.o.def.name) || (res && res.name) || null });
    }
    if (h && type === "cast" && ev && ev.p === h && ev.o && ev.o.def.name === "Craterhoof Behemoth") s.hoof++;
    return oe.apply(this, arguments);
  };
  const ort = G.resolveTop;
  G.resolveTop = async function () {
    const prev = this.__azRes;
    this.__azRes = this.stack[this.stack.length - 1] || null;
    try { return await ort.apply(this, arguments); } finally { this.__azRes = prev; }
  };
  const olose = G.lose;
  G.lose = function (p, why) { const s = st(this); if (s.hero && p !== s.hero && !p.lost) s.outs.push({ why, round: this.round }); return olose.apply(this, arguments); };
  const op = G.play;
  G.play = async function () {
    const g = this, s = st(g);
    const r = await op.apply(this, arguments);
    const h = s.hero;
    if (h) rows.push({ seed: g.seed, win: g.winner === h, rounds: g.round, opps: g.players.filter(q => q !== h).map(q => q.deckId), lines: h.azusaLines || [], ashaya: s.ashaya, left: s.left, hoof: s.hoof, lage: s.lage, outs: s.outs, heroLost: h.lost ? h.lostReason : null });
    return r;
  };
  process.on("exit", () => fs.writeFileSync(opts.out, JSON.stringify(rows)));
};
