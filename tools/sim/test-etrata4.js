#!/usr/bin/env node
/* Checks the cards of the Etrata Bracket 4 aggro upgrade (decks-etrata4.js) in the game engine:
   freerunning, Mari's hit counters, the draw-on-hit engines, halving, and the Assassin-only lands.
   node tools/sim/test-etrata4.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}
function table() {
  const players = [{ name: "Etrata", commander: "Etrata, Deadly Fugitive", list: Array(99).fill("Island"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1], c: g.players[2] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, n, name) { for (let i = 0; i < n; i++) put(g, p, name || (i % 2 ? "Island" : "Swamp")); }
async function attack(g, a, list) { a.agent.attack = () => list; await g.doCombat(a); await g.settle(); }

(async () => {
  // Both decks are legal 99s of defined cards
  for (const d of [MK.ETRATA_AGGRO_DECK, MK.ETRATA_B4_DECK]) {
    check(d.id + ": 99 cards", d.list.length === 99, d.list.length);
    check(d.id + ": every card is defined", d.list.every(n => MK.defs.has(n)), d.list.filter(n => !MK.defs.has(n)));
    const singles = d.list.filter(n => !/^(Island|Swamp)$/.test(n));
    check(d.id + ": singleton", new Set(singles).size === singles.length);
  }

  // Freerunning: Achilles costs {U}{B} only after an Assassin dealt combat damage this turn
  { const { g, a, b } = table(); lands(g, a, 2); const ach = hand(g, a, "Achilles Davenport"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    check("freerunning is off before combat", !g.castOptions(a, ach).some(w => w.alt));
    await attack(g, a, [{ attacker: oc, target: b }]);
    g.phase = "main2";
    check("freerunning is on after an Assassin connects", g.castOptions(a, ach).some(w => w.alt));
    await g.cast(a, ach, { alt: 1 }); await g.settle();
    check("Achilles resolves for two mana", ach.zone === "battlefield");
    check("Achilles pumps other Assassins", g.power(oc) === 2 && g.toughness(oc) === 2, [g.power(oc), g.toughness(oc)]); }

  // Mari: opposing creatures that die are exiled with a hit counter; her Assassins have deathtouch
  { const { g, a, b } = table(); put(g, a, "Mari, the Killing Quill"); const hp = put(g, a, "Hired Poisoner"); const oc = put(g, a, "Changeling Outcast"); const elf = put(g, b, "Llanowar Elves"); await g.settle();
    check("Mari gives Assassins deathtouch", g.kw(oc, "deathtouch"));
    g.destroy(elf); await g.settle();
    check("Mari exiles a dying opposing creature with a hit counter", elf.zone === "exile" && elf.hitCounter && g.hitCount(b) === 1, { zone: elf.zone });
    a.agent.confirm = () => true;
    const before = a.hand.length;
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Mari: a hit cashes a hit counter for a card and two Treasures", a.hand.length === before + 1 && g.hitCount(b) === 0 && g.controlled(a, o => o.def.name === "Treasure").length === 2, { hand: a.hand.length - before, hits: g.hitCount(b) }); }

  // Mari + Etrata, the Silencer: two hit counters from Mari, the Silencer's hit makes three
  { const { g, a, b } = table(); put(g, a, "Mari, the Killing Quill"); const si = put(g, a, "Etrata, the Silencer"); const es = [0, 1, 2].map(() => put(g, b, "Llanowar Elves")); await g.settle();
    g.destroy(es[0]); g.destroy(es[1]); await g.settle();
    a.agent.confirm = () => false;
    await attack(g, a, [{ attacker: si, target: b }]);
    check("Mari's hit counters count for the Silencer", b.lost, { hits: g.hitCount(b) }); }

  // Black Widow draws for each deathtouch creature that connects; Ezio for each Assassin
  { const { g, a, b } = table(); put(g, a, "Black Widow, Deadly Hunter"); put(g, a, "Ezio, Blade of Vengeance"); const hp = put(g, a, "Hired Poisoner"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    const before = a.hand.length;
    await attack(g, a, [{ attacker: hp, target: b }, { attacker: oc, target: b }]);
    check("Black Widow (Poisoner) + Ezio (both) draw three", a.hand.length === before + 3, a.hand.length - before); }

  // Virtus halves a life total
  { const { g, a, b } = table(); const v = put(g, a, "Virtus the Veiled"); await g.settle(); b.life = 40;
    await attack(g, a, [{ attacker: v, target: b }]);
    check("Virtus: 40 - 1, then half of 39 rounded up", b.life === 19, b.life); }

  // Rooftop Bypass: one token per player hit, not per creature
  { const { g, a, b, c } = table(); put(g, a, "Rooftop Bypass"); const x = put(g, a, "Changeling Outcast"), y = put(g, a, "Hired Poisoner"), z = put(g, a, "Mothdust Changeling"); await g.settle();
    await attack(g, a, [{ attacker: x, target: b }, { attacker: y, target: b }, { attacker: z, target: c }]);
    const toks = g.controlled(a, o => o.isToken && o.def.name === "Assassin");
    check("Rooftop Bypass: two players hit, two Assassin tokens", toks.length === 2, toks.length);
    check("the token is a menace Assassin", toks[0] && g.kw(toks[0], "menace") && g.hasSub(toks[0], "Assassin")); }

  // Interceptor gives Assassins menace
  { const { g, a } = table(); put(g, a, "Interceptor, Shadow's Hound"); const hp = put(g, a, "Hired Poisoner"); await g.settle();
    check("Interceptor: Assassins have menace", g.kw(hp, "menace")); }

  // Cavern of Souls: colored mana only for Assassin creature spells, which can't be countered
  { const { g, a } = table(); put(g, a, "Cavern of Souls"); put(g, a, "Cavern of Souls"); await g.settle();
    const widow = hand(g, a, "Mischievous Sneakling"), cs = hand(g, a, "Counterspell");
    check("Cavern pays for an Assassin creature spell", g.castOptions(a, widow).length > 0);
    check("Cavern's colored mana doesn't pay for Counterspell", g.castOptions(a, cs).length === 0); }

  // Brotherhood Regalia makes the equipped creature an unblockable Assassin; equip {1} on a legend
  { const { g, a } = table(); lands(g, a, 1); const r = put(g, a, "Brotherhood Regalia"); const gix = put(g, a, "Gix, Yawgmoth Praetor"); await g.settle();
    await g.activate(a, r, 0, { targets: [gix] }); await g.settle();
    check("Regalia: equip legendary for {1}", r.attachedTo === gix);
    check("Regalia: equipped Gix is an unblockable Assassin", g.hasSub(gix, "Assassin") && !!g.ch(gix).unblockable); }

  // A few bot games with both decks: no engine errors
  for (const id of ["etrata-aggro", "etrata-b4"]) {
    const deck = MK.HERO_DECKS.find(d => d.id === id);
    const opp = MK.BOT_DECKS.filter(d => d.bracket === 4 && d.id !== id);
    let errors = 0;
    for (let i = 0; i < 6; i++) {
      const seats = [deck, opp[i % opp.length], opp[(i + 1) % opp.length], opp[(i + 2) % opp.length]];
      const g = new MK.Game({ seed: 100 + i, players: seats.map((d, k) => ({ name: d.name + k, commander: d.commander, list: d.list, identity: d.identity, agent: MK.AI.create({ skill: .85, aggression: d.aggression }) })), maxTurns: 60, ui: { anim() {}, log() {} } });
      g.warn = () => { errors++; };
      try { await g.play(); } catch (e) { errors++; }
    }
    check(id + ": six bot games without engine errors", errors === 0, errors);
  }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
