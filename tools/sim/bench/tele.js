/* Per-game telemetry for one hero deck, loaded by wrap.js when TELE_OUT is set (one JSON file per process).
   For the hero (the seat whose deck id is HERO_ID): win, rounds, commander casts, cards stolen (any card it
   doesn't own entering under its control: Etrata's cloaks, Thieving Amalgam's manifests...), Etrata's flips,
   and where the life its opponents lost came from:
     combat  combat damage from the hero's creatures
     onhit   life lost while one of the hero's "deals combat damage" triggers resolves (Slasher, Virtus, Quietus Spike)
     drain   any other life loss from the hero's sources (Exquisite Blood, Thieving Amalgam, Bloodletter's extra
             half is credited to whatever caused the first half)
     poison  poison counters from the hero's infect damage
   For every opponent who is out: why (life, poison, commander, alt, library) and, for life, who made the last
   cut and of which kind. telesum.js reads the files. */
"use strict";
const fs = require("fs");
module.exports = function install(MK, opts) {
  const G = MK.Game.prototype, rows = [];
  const HERO = opts.heroId, ET = "Etrata, Deadly Fugitive";
  const ctl = s => (s && s.controller) || null;
  const st = g => g.__tele || (g.__tele = {
    hero: g.players.find(p => p.deckId === HERO) || null,
    steals: 0, etrataSteals: 0, flips: 0, stolenFlips: 0, freeCasts: 0, faceUpStolen: 0,
    dmg: { combat: 0, onhit: 0, drain: 0, poison: 0 }, cmdDmg: 0, outs: []
  });
  const isHit = tr => tr && (tr.on === "combatDamagePlayer" || tr.on === "combatDamageStep");
  // what kind of hero life loss is happening now (combat damage is marked by the damage wrapper)
  function kindNow(g, src) {
    const r = g.resolving && g.resolving.trig;
    if (r && r.ev && r.ev.__kind && r.tr && r.tr.on === "loseLife") return r.ev.__kind;   // Bloodletter, Sanguine Bond copies
    if (r && isHit(r.tr)) return "onhit";
    return "drain";
  }
  const od = G.damage;
  G.damage = function (src, target, n, o) {
    const g = this, s = st(g);
    if (!s.hero || !this.isPlayer(target) || target === s.hero || n <= 0) return od.apply(this, arguments);
    const srcObj = src && src.def ? src : null;
    const mine = ctl(srcObj || src) === s.hero;
    const infect = srcObj && srcObj.zone === "battlefield" && this.kw(srcObj, "infect");
    const kind = infect ? "poison" : (o && o.combat ? "combat" : kindNow(g, src));
    const before = target.life;
    g.__dmgKind = mine ? kind : null; g.__dmgBy = ctl(srcObj || src);
    const r = od.apply(this, arguments);
    g.__dmgKind = null; g.__dmgBy = null;
    if (r > 0) {
      if (mine) { s.dmg[kind] += r; if (o && o.combat && srcObj && srcObj.isCommander) s.cmdDmg += r; }
      if (infect) target.__lastPoison = mine ? "hero" : "other";
      if (!infect && target.life < before) target.__last = { by: mine ? "hero" : "other", kind: mine ? kind : "other", src: srcObj ? srcObj.def.name : "?" };
    }
    return r;
  };
  const ol = G.loseLife;
  G.loseLife = function (p, n, src) {
    const g = this, s = st(g);
    const before = p.life;
    const r = ol.apply(this, arguments);
    if (s.hero && p !== s.hero && r > 0) {
      const mine = ctl(src) === s.hero;
      const kind = mine ? kindNow(g, src) : "other";
      if (mine) s.dmg[kind] += r;
      if (p.life < before) p.__last = { by: mine ? "hero" : "other", kind, src: src && src.def ? src.def.name : "?" };
    }
    return r;
  };
  // tag each loseLife event with the kind of loss behind it, so a doubler's extra loss is credited to the same kind
  const oe = G.emit;
  G.emit = function (type, ev) {
    if (type === "loseLife" && ev && this.__tele && this.__tele.hero && ev.p !== this.__tele.hero) {
      if (ev.fromDamage && this.__dmgKind) ev.__kind = this.__dmgKind;
      else if (ev.src && ctl(ev.src) === this.__tele.hero) ev.__kind = kindNow(this, ev.src);
    }
    if (type === "enters" && ev && ev.o && this.__tele && this.__tele.hero && ev.p === this.__tele.hero && !ev.o.isToken && ev.o.owner !== this.__tele.hero) this.__tele.steals++;
    // the round each of the hero's own nonland cards first entered the battlefield
    if (type === "enters" && ev && ev.o && this.__tele && this.__tele.hero && ev.p === this.__tele.hero && ev.o.owner === this.__tele.hero && !ev.o.isToken && !ev.o.faceDown && !this.isLand(ev.o)) { const f = this.__tele.first || (this.__tele.first = {}); if (f[ev.o.def.name] == null) f[ev.o.def.name] = this.round; }
    if (type === "turnedFaceUp" && ev && ev.o && this.__tele && ev.p === this.__tele.hero && ev.o.owner !== this.__tele.hero) this.__tele.faceUpStolen++;
    // the hero's key permanents leaving the battlefield (Ramses, Etrata): round and where to
    if (type === "leaves" && ev && ev.lki && this.__tele && this.__tele.hero && ev.lki.controller === this.__tele.hero && ev.lki.creature && ev.to !== "hand") { const k = this.active === this.__tele.hero ? "lostMyTurn" : "lostTheirTurn"; this.__tele[k] = (this.__tele[k] || 0) + 1; }
    if (type === "leaves" && ev && ev.lki && this.__tele && this.__tele.hero && ev.lki.controller === this.__tele.hero && /^(Ramses, Assassin Lord|Etrata, Deadly Fugitive|Bloodletter of Aclazotz)$/.test(ev.lki.name)) { const top = this.stack[this.stack.length - 1]; const how = this.combat && this.phase === "damage" ? "combat" : (top && top.p && top.p !== this.__tele.hero ? "their spell/ability" : this.resolving ? "trigger" : "other"); const ls = this.__lastSpell && this.__lastSpell.turn === this.turn && this.__lastSpell.p !== this.__tele.hero ? this.__lastSpell.name : null; (this.__tele.left || (this.__tele.left = [])).push([this.round, ev.lki.name, ev.to, how, this.active === this.__tele.hero ? "my turn" : "their turn", ls]); }
    return oe.apply(this, arguments);
  };
  // opponents' mass removal that resolved (spells the bots know as wipes), and the hero's creatures that left the battlefield
  const WIPE = /Toxic Deluge|Cyclonic Rift|Evacuation|Aetherize|Aetherspouts|Wrath of God|Hour of Reckoning|Phyrexian Rebirth|Time Wipe|Cleansing Nova|Crux of Fate|Austere Command|Zombie Apocalypse|Blasphemous Act|Earthquake|Eyeblight Massacre|Vandalblast|Kindred Dominance|Massacre Wurm|Reiver Demon|Dread Cacodemon|Damnation|Day of Judgment|Black Sun's Zenith|Languish|Ritual of Soot/;
  const ort = G.resolveTop;
  G.resolveTop = async function () {
    const g = this, s = st(g), top = g.stack[g.stack.length - 1];
    if (top && top.kind === "spell" && top.o && top.o.def && !top.countered) g.__lastSpell = { name: top.o.def.name, p: top.p, turn: g.turn };
    if (s.hero && top && top.kind === "spell" && top.p !== s.hero && !top.countered && top.o && top.o.def && (WIPE.test(top.o.def.name) || (top.o.def.ai && top.o.def.ai.wipe)) && !(top.o.def.name === "Cyclonic Rift" && top.alt !== 1)) s.wipes = (s.wipes || 0) + 1;
    return ort.apply(this, arguments);
  };
  // what the hero counters, and what counters the hero's spells
  const ocs = G.counterSpell;
  G.counterSpell = function (item, by) {
    const s = st(this), r = ocs.apply(this, arguments);
    if (r && s.hero && item && item.o && item.o.def) {
      const byHero = by && by.controller === s.hero, ofHero = item.p === s.hero;
      if (byHero) (s.countered || (s.countered = [])).push(item.o.def.name);
      if (ofHero) (s.gotCountered || (s.gotCountered = [])).push(item.o.def.name);
    }
    return r;
  };
  const oc = G.cloakTop;
  G.cloakTop = function (p, from, src) { const s = st(this); if (s.hero && p === s.hero && src && src.def && src.def.name === ET && from && from !== p) s.etrataSteals++; return oc.apply(this, arguments); };
  const olose = G.lose;
  G.lose = function (p, why) {
    const s = st(this);
    if (s.hero && p !== s.hero && !p.lost) s.outs.push({ why, by: why === "life" ? (p.__last ? p.__last.by : "?") : why === "poison" ? (p.__lastPoison || "?") : "?", kind: why === "life" ? (p.__last ? p.__last.kind : "?") : why, src: p.__last ? p.__last.src : null, round: this.round });
    return olose.apply(this, arguments);
  };
  const ow = G.win;
  G.win = function (p, why) { const s = st(this); if (s.hero && p === s.hero) s.altWin = String(why || "alt"); return ow.apply(this, arguments); };
  const up = MK.defs.get(ET) && MK.defs.get(ET).statics[0] && MK.defs.get(ET).statics[0].grantAbilities && MK.defs.get(ET).statics[0].grantAbilities[0];
  if (up && !up.__tele) {
    const odo = up.do;
    up.do = async (g, src, ctx) => { const s = st(g); if (s.hero && ctx.p === s.hero) { s.flips++; if (src.owner && src.owner !== ctx.p) s.stolenFlips++; if (!g.canTurnFaceUp(src)) s.freeCasts++; } return odo(g, src, ctx); };
    up.__tele = true;
  }
  // a snapshot at the start of each of the hero's turns: life, board, mana, hand, opponents' life
  const ot = G.takeTurn;
  G.takeTurn = async function (p) {
    const s = st(this);
    if (s.hero && p === s.hero) {
      const cr = this.creatures(p);
      (s.trace || (s.trace = [])).push([this.round, p.life, cr.length, cr.reduce((t, c) => t + Math.max(0, this.power(c)), 0), cr.filter(c => c.faceDown).length,
        this.controlled(p, o => this.isLand(o)).length, p.hand.length, this.opponents(p).reduce((t, q) => t + Math.max(0, q.life), 0), this.opponents(p).length]);
    }
    return ot.apply(this, arguments);
  };
  // what the hero's searches found (tutors, transmute), with the round
  const os = G.search;
  G.search = async function (p, o) {
    const r = await os.apply(this, arguments);
    const s = st(this);
    if (s.hero && p === s.hero && o && (o.purpose || "tutor") === "tutor") (s.found || (s.found = [])).push([this.round, (o.src && o.src.def && o.src.def.name) || "?", r.map(c => c.def.name).join("+") || "-"]);
    return r;
  };
  const op = G.play;
  G.play = async function () {
    const g = this, s = st(g);
    const r = await op.apply(this, arguments);
    const h = s.hero;
    if (h) rows.push({
      seed: g.seed, win: g.winner === h, rounds: g.round, casts: h.stats.cast[h.commanders[0] ? h.commanders[0].def.name : ""] || 0,
      steals: s.steals, etrataSteals: s.etrataSteals, flips: s.flips, stolenFlips: s.stolenFlips, freeCasts: s.freeCasts, faceUpStolen: s.faceUpStolen,
      dmg: s.dmg, cmdDmg: s.cmdDmg, outs: s.outs, altWin: s.altWin || null, heroLost: h.lost ? h.lostReason : null, trace: s.trace || [], first: s.first || {}, cast: Object.assign({}, h.stats.cast), found: s.found || [], left: s.left || [], wipes: s.wipes || 0, countered: s.countered || [], gotCountered: s.gotCountered || [], lostMyTurn: s.lostMyTurn || 0, lostTheirTurn: s.lostTheirTurn || 0, end: (() => { const g2 = g; return { oppLife: g2.players.filter(q => q !== h).map(q => q.lost ? 0 : q.life), heroLife: h.life }; })()
    });
    return r;
  };
  process.on("exit", () => fs.writeFileSync(opts.out, JSON.stringify(rows)));
};
