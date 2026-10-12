/* Mana-efficiency telemetry for one hero deck, loaded by wrap.js when MANA_OUT is set (one JSON file per process).
   The idea comes from Mano's mana study: over the hero's first 8 turns, how much mana did the deck make, how much
   went into "useful" spells, and how much was wasted?

   The hero's turn cycle k runs from the start of its k-th turn to the start of its next one, so mana held up for an
   instant on an opponent's turn counts in the cycle it came from. For each cycle:
     produced  = everything spent in the cycle + what was still available at the end of it
     ramp      = mana spent on ramp spells (mana rocks, dorks, rituals, land searches) and on mana abilities' own costs
     commander = mana spent casting the commander
     spells    = mana spent on every other spell
     ability   = mana spent on activated abilities, cycling and the like
     wasted    = mana the deck could have made and didn't use: untapped mana sources at the end of the cycle (their
                 net output: a Signet counts 1) plus mana left in the pool when it emptied
   "Useful" is commander + spells + ability, as in Mano's split (ramp is counted apart). The cycle in which the hero
   wins, or runs a repeated loop (infinite mana, Heliod + Ballista), is a combo turn: it is recorded but flagged, so summaries can leave it out as Mano does.
   Sources that only exist in the hand (Elvish Spirit Guide) or sacrifice themselves (Lotus Petal, Treasure) aren't
   counted as available when unused: they aren't lost, they wait.

   Each cycle also counts the cards drawn (the draw step's card included).
   Also recorded per game: mulligans, whether the hero won, the round it won in, and the round it went out.
   GOLDFISH=1 replaces every opponent with a deck of 99 Plains and an uncastable commander (Vorinclex, {6}{G}{G}):
   nobody interacts, so the kill turn is the deck's own speed. manasum.js reads the files. */
"use strict";
const fs = require("fs");
module.exports = function install(MK, opts) {
  const G = MK.Game.prototype, rows = [];
  const HERO = opts.heroId, MAXC = opts.cycles || 8;
  const units = c => { if (!c) return 0; let n = (c.g || 0) + (c.C || 0) + (c.hyb ? c.hyb.length : 0); for (const k of ["W", "U", "B", "R", "G"]) n += c[k] || 0; return n; };
  const isRamp = d => {
    if (!d) return false;
    if (d.ai && (d.ai.ramp || d.ai.ritual)) return true;
    if (d.types && d.types.includes("Land")) return false;
    if (d.mana && d.mana.length) return true;                                        // rocks and dorks
    const t = d.text || "";
    return /search your library for (?:up to \w+ )?(?:a |an |two |three )?(?:basic )?(?:land|Forest|Plains|Island|Swamp|Mountain)/i.test(t) && !/creature card/i.test(t)
      || /^Add \{/m.test(t) && (d.types || []).some(x => x === "Instant" || x === "Sorcery");   // rituals
  };
  const st = g => g.__mana || (g.__mana = { hero: g.players.find(p => p.deckId === HERO) || null, cycles: [], cur: null, n: 0 });
  // what p's untapped, reusable mana sources could still make right now (net of their own costs)
  function available(g, p) {
    let n = 0;
    const pool = Object.assign({}, p.pool);
    try {
      for (const s of g.manaSources(p)) {
        if (s.o.zone !== "battlefield") continue;
        const opt = s.options[0];
        if (opt.ab.sacSelf || opt.ab.hand) continue;
        n += Math.max(0, opt.units.length * (s.mult || 1) - units(opt.cost) - (opt.tapCreature || 0));
      }
    } finally { Object.assign(p.pool, pool); }
    return n;
  }
  function close(g, s, won) {
    const c = s.cur;
    if (!c) return;
    c.left = won ? 0 : available(g, s.hero);
    c.wasted = c.left + c.poolLost;
    c.produced = c.ramp + c.commander + c.spells + c.ability + c.wasted;
    c.combo = !!won || !!c.loop;
    s.cycles.push(c);
    s.cur = null;
  }
  const ot = G.takeTurn;
  G.takeTurn = async function (p) {
    const s = st(this);
    if (s.hero && p === s.hero) {
      close(this, s, false);
      s.n++;
      if (s.n <= MAXC) s.cur = { k: s.n, round: this.round, ramp: 0, commander: 0, spells: 0, ability: 0, poolLost: 0, lands: this.controlled(p, o => this.isLand(o)).length, hand: p.hand.length };
    }
    return ot.apply(this, arguments);
  };
  const op = G.pay;
  G.pay = function (p, cost, o) {
    const s = st(this), c = s.cur;
    const conv0 = c ? c.convoked || 0 : 0;
    const ok = op.apply(this, arguments);
    if (ok && c && p === s.hero) {
      o = o || {};
      const n = Math.max(0, units(cost) - ((c.convoked || 0) - conv0));
      const d = o.spell && o.spell.def;
      if (d) { if (o.spell.isCommander) c.commander += n; else if (isRamp(d)) c.ramp += n; else c.spells += n; }
      else c.ability += n;
    }
    return ok;
  };
  // convoke: the creatures tapped paid part of the cost, which isn't mana
  const ocr = G.convokeRemainder;
  G.convokeRemainder = function (p, cost, tapped) {
    const s = st(this), c = s.cur;
    if (c && p === s.hero) { const r = ocr.apply(this, arguments); const d = units(cost) - units(r); c.convoked = (c.convoked || 0) + d; return r; }
    return ocr.apply(this, arguments);
  };
  // a mana ability with its own cost (a Signet's {1}) turns mana into mana: count it as ramp spending
  const oam = G.activateMana;
  G.activateMana = function (p, src, oi, reserve) {
    const s = st(this), c = s.cur;
    if (c && p === s.hero && src && src.options && src.options[oi] && src.options[oi].cost) c.ramp += units(src.options[oi].cost);
    return oam.apply(this, arguments);
  };
  // a repeated loop (Devoted Druid + Vizier, Heliod + Ballista) is a combo turn too, won or not
  const operf = G.perform;
  G.perform = async function (p, act) {
    const s = st(this), c = s.cur;
    if (c && p === s.hero && act && act.type === "activate" && (act.repeat || 1) > 1) c.loop = true;
    return operf.apply(this, arguments);
  };
  // cards drawn in the cycle (the draw step's card included; "extra" = drawn - 1 is Mano's "energy")
  const odr = G.draw;
  G.draw = function (p) {
    const s = st(this), c = s.cur;
    const before = p.hand.length;
    const r = odr.apply(this, arguments);
    if (c && p === s.hero) c.drawn = (c.drawn || 0) + Math.max(0, p.hand.length - before);
    return r;
  };
  const oep = G.emptyPools;
  G.emptyPools = function () {
    const s = st(this), c = s.cur;
    if (c && s.hero) { let n = 0; for (const k in s.hero.pool) n += s.hero.pool[k] > 0 ? s.hero.pool[k] : 0; c.poolLost += n; }
    return oep.apply(this, arguments);
  };
  const oplay = G.play;
  G.play = async function () {
    const g = this;
    const r = await oplay.apply(this, arguments);
    const s = st(g), h = s.hero;
    if (h) {
      close(g, s, g.winner === h);
      rows.push({ seed: g.seed, win: g.winner === h, round: g.round, mulls: h.mulls || 0, out: h.lost ? g.round : null, cycles: s.cycles });
    }
    return r;
  };
  if (process.env.GOLDFISH) {
    const d = { id: "goldfish", name: "Goldfish", commander: "Vorinclex, Voice of Hunger", identity: ["G", "W"], bracket: 9, list: Array(99).fill("Plains") };
    (MK.BOT_DECKS || (MK.BOT_DECKS = [])).push(d);
  }
  process.on("exit", () => fs.writeFileSync(opts.out, JSON.stringify(rows)));
};
