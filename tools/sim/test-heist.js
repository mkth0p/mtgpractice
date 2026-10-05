#!/usr/bin/env node
/* Checks the cards of the Etrata heist research deck (decks-heist.js) and the engine rules they brought:
   halving, double strike and the extra combat, theft engines, intimidate, wither, "triggers an additional time",
   "can't gain life", "mana of any type", Forsaken Monument's extra {C}, prowl, and the deck itself.
   node tools/sim/test-heist.js        (exits 1 if a check fails) */
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
function table(opts) {
  opts = opts || {};
  const players = [{ name: "Heist", commander: "Etrata, Deadly Fugitive", list: Array(99).fill("Island"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill(opts.oppLib || "Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  g.players[0].agent.respond = () => null;
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name, owner) { const o = g.newObj(MK.get(name), owner || p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lib(g, p, name) { const o = g.newObj(MK.get(name), p, "library"); p.library.unshift(o); return o; }
function lands(g, p, n, name) { for (let i = 0; i < n; i++) put(g, p, name || (i % 2 ? "Island" : "Swamp")); }
async function attack(g, a, list) { a.agent.attack = () => list; await g.doCombat(a); await g.settle(); }
async function equip(g, p, eq, t) { const e = g.abilitiesOf(eq).find(x => x.ab.label === "Equip"); return g.activate(p, eq, e.i, { targets: [t] }); }
const named = (g, p, n) => g.battlefield.filter(o => o.controller === p && o.def.name === n);

(async () => {
  // the deck: 99 defined cards, singleton, Etrata in the command zone, not a random bot
  { const d = MK.ETRATA_HEIST_DECK;
    check("heist deck: 99 cards", d.list.length === 99, d.list.length);
    check("heist deck: every card is defined", d.list.every(n => MK.defs.has(n)), d.list.filter(n => !MK.defs.has(n)));
    const singles = d.list.filter(n => !/^(Island|Swamp)$/.test(n));
    check("heist deck: singleton", new Set(singles).size === singles.length);
    check("heist deck: a hero deck, not in the random bot pool", MK.HERO_DECKS.includes(d) && !(MK.BOT_DECKS || []).includes(d));
    check("heist deck: its brain is registered", !!MK.DECK_BRAINS["etrata-heist-aggro"]); }

  // Quietus Spike: deathtouch, and a hit takes half of what's left
  { const { g, a, b } = table(); lands(g, a, 3); const oc = put(g, a, "Changeling Outcast"); const qs = put(g, a, "Quietus Spike"); await g.settle();
    await equip(g, a, qs, oc); await g.settle();
    check("Quietus Spike: equipped creature has deathtouch", g.kw(oc, "deathtouch"));
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Quietus Spike: 1 damage then half of 39 rounded up", b.life === 19, b.life); }

  // Scytheclaw: a 1/1 Germ that halves
  { const { g, a, b } = table(); const sc = put(g, a, "Scytheclaw"); await g.settle();
    const germ = g.creatures(a).find(o => o.def.name === "Phyrexian Germ");
    check("Scytheclaw: living weapon makes an equipped 1/1 Germ", !!germ && sc.attachedTo === germ && g.power(germ) === 1 && g.toughness(germ) === 1);
    germ.sick = false; await attack(g, a, [{ attacker: germ, target: b }]);
    check("Scytheclaw: 1 damage then half of 39 rounded up", b.life === 19, b.life); }

  // Genji Glove: double strike, and the first combat adds another one with the creature untapped
  { const { g, a, b } = table(); lands(g, a, 3); const hp = put(g, a, "Hired Poisoner"); const gg = put(g, a, "Genji Glove"); await g.settle();
    await equip(g, a, gg, hp); await g.settle();
    check("Genji Glove: double strike", g.kw(hp, "double strike"));
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Genji Glove: two hits in the first combat", b.life === 38, b.life);
    check("Genji Glove: untapped and an additional combat waits", !hp.tapped && g.extraCombats.length === 1, { tapped: hp.tapped, n: g.extraCombats.length });
    g.extraCombats.length = 0;
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Genji Glove: no third combat from the second one", g.extraCombats.length === 0 && hp.tapped && b.life === 36, { n: g.extraCombats.length, life: b.life }); }

  // Leyline Axe and Fireshrieker
  { const { g, a } = table(); lands(g, a, 3); const hp = put(g, a, "Hired Poisoner"); const ax = put(g, a, "Leyline Axe"); await g.settle();
    await equip(g, a, ax, hp); await g.settle();
    check("Leyline Axe: +1/+1, double strike, trample", g.power(hp) === 2 && g.kw(hp, "double strike") && g.kw(hp, "trample") && !!MK.get("Leyline Axe").openingHand);
    const fs2 = put(g, a, "Fireshrieker"); const oc = put(g, a, "Changeling Outcast"); lands(g, a, 2); await g.settle();
    await equip(g, a, fs2, oc); await g.settle();
    check("Fireshrieker: double strike", g.kw(oc, "double strike")); }

  // Shredder: copies attack the other opponents and leave at end of combat; each hit halves
  { const { g, a, b, c, d } = table(); const sh = put(g, a, "Shredder, Shadow Master"); await g.settle();
    a.agent.attack = () => [{ attacker: sh, target: b }];
    let mid = null;
    const ow = g.trickWindow.bind(g);
    g.trickWindow = async (p, w) => { if (!w && !mid) mid = g.combat.attackers.map(x => [x.def.name, x.isToken, g.defenderOf(x.combat.attacking).name]); return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Shredder: a token copy attacks each other opponent", !!mid && mid.length === 3 && mid.filter(x => x[1]).map(x => x[2]).sort().join() === [c.name, d.name].sort().join(), mid);
    check("Shredder: 5 damage, then half of 35 rounded up, for each player", b.life === 17 && c.life === 17 && d.life === 17, [b.life, c.life, d.life]);
    check("Shredder: the copies are sacrificed at end of combat", g.battlefield.filter(o => o.def.name === "Shredder, Shadow Master").length === 1); }

  // Grievous Wound: no life gain, and each source's damage halves
  { const { g, a, b } = table(); a.agent.choose = (g2, p, req) => (req.purpose === "harm" && req.type === "player" ? b : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    lands(g, a, 5, "Swamp"); const gw = hand(g, a, "Grievous Wound"); await g.cast(a, gw); await g.settle();
    check("Grievous Wound: enchants the chosen opponent", gw.zone === "battlefield" && gw.state.enchanted === b);
    g.gainLife(b, 5);
    check("Grievous Wound: they can't gain life", b.life === 40, b.life);
    const x = put(g, a, "Hired Poisoner"), y = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: x, target: b }, { attacker: y, target: b }]);
    check("Grievous Wound: two sources, two halvings (40-2=38, 19, 9)", b.life === 9, b.life);
    g.lose(b, "life"); await g.settle();
    check("Grievous Wound: goes to the graveyard when that player is out", gw.zone === "graveyard", gw.zone); }

  // Thieving Amalgam: manifests in each opponent's upkeep; a stolen creature dying drains 2
  { const { g, a, b } = table(); put(g, a, "Thieving Amalgam"); const top = lib(g, b, "Llanowar Elves"); await g.settle();
    g.activeIdx = 1; g.emit("upkeep", { p: b }); await g.settle();
    check("Thieving Amalgam: manifests the top card of the opponent's library", top.zone === "battlefield" && top.controller === a && top.owner === b && !!top.faceDown);
    g.destroy(top); await g.settle();
    check("Thieving Amalgam: a creature we don't own dies: its owner loses 2, we gain 2", b.life === 38 && a.life === 42, [b.life, a.life]); }

  // Orochi Soul-Reaver: a Treasure and a manifest of the damaged player's top card, once per player
  { const { g, a, b, c } = table(); put(g, a, "Orochi Soul-Reaver"); const x = put(g, a, "Hired Poisoner"), y = put(g, a, "Changeling Outcast"), z = put(g, a, "Hullcarver");
    const tb = lib(g, b, "Forest"), tc = lib(g, c, "Forest"); await g.settle();
    await attack(g, a, [{ attacker: x, target: b }, { attacker: y, target: b }, { attacker: z, target: c }]);
    check("Orochi: one Treasure and one manifest for each player hit", named(g, a, "Treasure").length === 2 && tb.zone === "battlefield" && tc.zone === "battlefield" && tb.controller === a && !!tb.faceDown, { t: named(g, a, "Treasure").length, tb: tb.zone, tc: tc.zone }); }

  // Satoru: draws for cards that enter without being cast (a cloak), not for a creature cast with mana
  { const { g, a, b } = table(); put(g, a, "Satoru, the Infiltrator"); lib(g, b, "Forest"); await g.settle();
    const h0 = a.hand.length; g.cloakTop(a, b); await g.settle();
    check("Satoru: a cloaked card entering draws a card", a.hand.length === h0 + 1, a.hand.length - h0);
    lands(g, a, 1, "Swamp"); const hp = hand(g, a, "Hired Poisoner"); const h1 = a.hand.length; await g.cast(a, hp); await g.settle();
    check("Satoru: a creature cast with mana draws nothing", hp.zone === "battlefield" && a.hand.length === h1 - 1, a.hand.length - h1);
    const free = hand(g, a, "Hullcarver"); const h2 = a.hand.length; await g.castWithoutPaying(a, free); await g.settle();
    check("Satoru: a creature cast without paying draws", free.zone === "battlefield" && a.hand.length === h2, a.hand.length - h2); }

  // Forsaken Monument: face-down creatures +2/+2, {C} sources make one more, colorless spells gain 2
  { const { g, a, b } = table(); lib(g, b, "Forest"); const fm = put(g, a, "Forsaken Monument"); const cl = g.cloakTop(a, b); const sr = put(g, a, "Sol Ring"); await g.settle();
    check("Forsaken Monument: a face-down creature is 4/4", g.power(cl) === 4 && g.toughness(cl) === 4, [g.power(cl), g.toughness(cl)]);
    const src = g.manaSources(a).find(s2 => s2.o === sr);
    check("Forsaken Monument: Sol Ring makes {C}{C}{C}", !!src && src.options[0].units.length === 3, src && src.options[0].units);
    const auto = hand(g, a, "Universal Automaton"); const l0 = a.life; await g.cast(a, auto); await g.settle();
    check("Forsaken Monument: casting a colorless spell gains 2 life", a.life === l0 + 2 && g.power(auto) === 3, [a.life - l0, g.power(auto)]);
    void fm; }

  // Vela and intimidate: a colorless attacker is blocked only by artifact creatures; a creature leaving drains 1
  { const { g, a, b, c } = table(); put(g, a, "Vela the Night-Clad"); lib(g, b, "Forest"); const cl = g.cloakTop(a, b); const hp = put(g, a, "Hired Poisoner");
    const elf = put(g, b, "Llanowar Elves"), zomb = put(g, b, "Hired Poisoner"), auto = put(g, b, "Universal Automaton"); await g.settle();
    check("intimidate: a colorless face-down attacker can't be blocked by a green creature", !g.canBlock(elf, cl));
    check("intimidate: but an artifact creature can block it", g.canBlock(auto, cl));
    check("intimidate: a black attacker can be blocked by a black creature, not a green one", g.canBlock(zomb, hp) && !g.canBlock(elf, hp));
    g.destroy(hp); await g.settle();
    check("Vela: a creature of ours leaving makes each opponent lose 1", b.life === 39 && c.life === 39, [b.life, c.life]); }

  // Roaming Throne (Assassin): Etrata's trigger happens twice; the Throne is an Assassin
  { const { g, a, b } = table(); const et = put(g, a, "Etrata, Deadly Fugitive"); const rt = put(g, a, "Roaming Throne"); const oc = put(g, a, "Changeling Outcast"); for (let i = 0; i < 3; i++) lib(g, b, "Forest"); await g.settle();
    check("Roaming Throne: it is an Assassin", MK.isAssassin(g, rt) && g.hasSub(rt, "Assassin"));
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Roaming Throne: Etrata cloaks twice for one Assassin hit", g.controlled(a, o => o.faceDown && o.owner === b).length === 2, g.controlled(a, o => o.faceDown).length);
    void et; }

  // Grim Hireling: two Treasures for each player hit
  { const { g, a, b, c } = table(); put(g, a, "Grim Hireling"); const x = put(g, a, "Hired Poisoner"), y = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: x, target: b }, { attacker: y, target: c }]);
    check("Grim Hireling: two Treasures per player dealt damage", named(g, a, "Treasure").length === 4, named(g, a, "Treasure").length); }

  // Glen Elendra Liege: +1/+1 for blue, +1/+1 for black, +2/+2 for both
  { const { g, a } = table(); put(g, a, "Glen Elendra Liege"); const hp = put(g, a, "Hired Poisoner"), ts = put(g, a, "Tetsuko Umezawa, Fugitive"), sat = put(g, a, "Satoru, the Infiltrator"); await g.settle();
    check("Glen Elendra Liege: black +1/+1, blue +1/+1, blue-black +2/+2", g.power(hp) === 2 && g.power(ts) === 2 && g.power(sat) === 4, [g.power(hp), g.power(ts), g.power(sat)]); }

  // Mist-Syndicate Naga: ninjutsu in, then a hit makes a copy
  { const { g, a, b } = table(); lands(g, a, 3, "Island"); const hp = put(g, a, "Hired Poisoner"); const nag = hand(g, a, "Mist-Syndicate Naga"); await g.settle();
    a.agent.attack = () => [{ attacker: hp, target: b }];
    const ow = g.trickWindow.bind(g); let done = false;
    g.trickWindow = async (p, w) => { if (!w && !done) { done = true; await g.channel(a, nag, {}); } return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Mist-Syndicate Naga: ninjutsu returns the attacker and puts the Naga in attacking", hp.zone === "hand" && nag.zone === "battlefield" && b.life === 37, { hp: hp.zone, naga: nag.zone, life: b.life });
    check("Mist-Syndicate Naga: its hit makes a token copy", named(g, a, "Mist-Syndicate Naga").length === 2); }

  // Reno and Rude: exile their top card; sacrificing a creature lets us play it with any mana
  { const { g, a, b } = table(); const rr = put(g, a, "Reno and Rude"); const tok = g.createToken(a, MK.T.treasure)[0]; const top = lib(g, b, "Llanowar Elves"); lands(g, a, 1, "Island"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "renoSac" ? tok : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await attack(g, a, [{ attacker: rr, target: b }]);
    check("Reno and Rude: their top card is exiled and playable this turn", top.zone === "exile" && top.playable && top.playable.by === a && tok.zone !== "battlefield");
    g.phase = "main2";
    check("Reno and Rude: mana of any type casts it (an Island pays {G})", g.castOptions(a, top).length > 0); }

  // Massacre Girl, Known Killer: wither, deathtouch through -1/-1 counters, and a card when one shrinks away
  { const { g, a, b } = table(); put(g, a, "Massacre Girl, Known Killer"); const hp = put(g, a, "Hired Poisoner"); const ox = put(g, b, "Hired Poisoner"); const big = put(g, b, "Thieving Amalgam"); await g.settle();
    const h0 = a.hand.length;
    g.damage(hp, big, 1); await g.settle();
    check("wither + deathtouch: a -1/-1 counter from a deathtouch source is lethal", big.zone === "graveyard", big.zone);
    g.damage(hp, ox, 1); await g.settle();
    check("Massacre Girl: an opposing creature with toughness 0 dies and we draw", ox.zone === "graveyard" && a.hand.length === h0 + 1, { zone: ox.zone, drew: a.hand.length - h0 }); }

  // Archetype of Imagination: our creatures fly, theirs can't
  { const { g, a, b } = table(); put(g, a, "Archetype of Imagination"); const hp = put(g, a, "Hired Poisoner"); const blf = put(g, b, "Bloodletter of Aclazotz"); await g.settle();
    check("Archetype of Imagination: our creatures fly, theirs lose flying", g.kw(hp, "flying") && !g.kw(blf, "flying") && !g.canBlock(blf, hp)); }

  // Hostage Taker: exiles an opposing creature we may cast with any mana; it comes back if the Taker leaves first
  { const { g, a, b } = table(); lands(g, a, 4); const elf = put(g, b, "Llanowar Elves"); const ht = hand(g, a, "Hostage Taker"); await g.cast(a, ht); await g.settle();
    check("Hostage Taker: exiles the creature", elf.zone === "exile" && elf.playable && elf.playable.anyColor);
    g.destroy(ht); await g.settle();
    check("Hostage Taker: the card returns to its owner when the Taker leaves", elf.zone === "battlefield" && elf.controller === b, elf.zone); }

  // Eldrazi Monument: +1/+1, flying, indestructible; our upkeep takes a creature
  { const { g, a } = table(); put(g, a, "Eldrazi Monument"); const hp = put(g, a, "Hired Poisoner"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    check("Eldrazi Monument: +1/+1, flying, indestructible", g.power(hp) === 2 && g.kw(hp, "flying") && g.kw(hp, "indestructible"));
    g.emit("upkeep", { p: a }); await g.settle();
    check("Eldrazi Monument: sacrifices a creature in our upkeep", [hp, oc].filter(o => o.zone === "graveyard").length === 1); }

  // Intimidation and Levitation
  { const { g, a } = table(); put(g, a, "Intimidation"); put(g, a, "Levitation"); const hp = put(g, a, "Hired Poisoner"); await g.settle();
    check("Intimidation and Levitation: fear and flying", g.kw(hp, "fear") && g.kw(hp, "flying")); }

  // Rogue Class: level 1 exiles on a hit, level 2 gives menace, level 3 lets us play the exiled cards
  { const { g, a, b } = table(); lands(g, a, 7); const rc = put(g, a, "Rogue Class"); const hp = put(g, a, "Hired Poisoner"); const top = lib(g, b, "Llanowar Elves"); await g.settle();
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Rogue Class: a hit exiles their top card", top.zone === "exile" && !top.playable);
    g.phase = "main1"; hp.tapped = false;
    const lv = () => g.abilitiesOf(rc).find(x => x.ab.levelUp);
    await g.activate(a, rc, lv().i, {}); await g.settle();
    check("Rogue Class level 2: menace", g.kw(hp, "menace"));
    await g.activate(a, rc, lv().i, {}); await g.settle();
    check("Rogue Class level 3: the exiled card is playable with any mana", !!top.playable && top.playable.anyColor && top.playable.by === a); }

  // Predators' Hour: menace now, and hits exile playable cards
  { const { g, a, b } = table(); lands(g, a, 2, "Swamp"); const hp = put(g, a, "Hired Poisoner"); const top = lib(g, b, "Llanowar Elves"); const ph = hand(g, a, "Predators' Hour"); await g.cast(a, ph); await g.settle();
    check("Predators' Hour: menace", g.kw(hp, "menace"));
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Predators' Hour: a hit exiles their top card, ours to play", top.zone === "exile" && top.playable && top.playable.by === a && top.playable.anyColor); }

  // Fading Hope: bounce, scry 1 for a cheap one
  { const { g, a, b } = table(); lands(g, a, 1, "Island"); const elf = put(g, b, "Llanowar Elves"); const fh = hand(g, a, "Fading Hope"); await g.cast(a, fh, { targets: [elf] }); await g.settle();
    check("Fading Hope: returns the creature to its owner's hand", elf.zone === "hand" && b.hand.includes(elf)); }

  // Ghostly Flicker: a cloaked card of theirs comes back face up and ours
  { const { g, a, b } = table(); lands(g, a, 3, "Island"); const top = lib(g, b, "Llanowar Elves"); const cl = g.cloakTop(a, b); const sr = put(g, a, "Sol Ring"); await g.settle();
    const gf = hand(g, a, "Ghostly Flicker"); await g.cast(a, gf, { targets: [cl, sr] }); await g.settle();
    check("Ghostly Flicker: the stolen card returns face up under our control", top.zone === "battlefield" && !top.faceDown && top.controller === a && top.owner === b && top.def.name === "Llanowar Elves");
    check("Ghostly Flicker: our artifact comes back too", sr.zone === "battlefield"); }

  // extra turns
  { const { g, a } = table(); lands(g, a, 5, "Island"); const tw = hand(g, a, "Temporal Manipulation"); await g.cast(a, tw); await g.settle();
    check("Temporal Manipulation: an extra turn", g.extraTurns.length === 1 && g.extraTurns[0].p === a); }

  // Notorious Throng: X fliers for the damage this turn; prowl after a Rogue hit, with an extra turn
  { const { g, a, b } = table(); lands(g, a, 6, "Island"); const oa = put(g, a, "Changeling Outcast"); await g.settle();
    const nt = hand(g, a, "Notorious Throng");
    check("Notorious Throng: no prowl before a Rogue hit", !g.castOptions(a, nt).some(w => w.alt));
    await attack(g, a, [{ attacker: oa, target: b }]);
    g.phase = "main2";
    check("prowl: a changeling (a Rogue) dealt combat damage", a.prowl === g.turn && g.castOptions(a, nt).some(w => w.alt));
    await g.cast(a, nt, { alt: 1 }); await g.settle();
    check("Notorious Throng: X Faerie Rogues and an extra turn", named(g, a, "Faerie Rogue").length === 1 && g.extraTurns.length === 1, { n: named(g, a, "Faerie Rogue").length, t: g.extraTurns.length }); }

  // the small ones
  { const { g, a } = table(); lands(g, a, 2); const ai2 = put(g, a, "Assassin Initiate"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "initiateKw" ? 1 : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await g.activate(a, ai2, g.abilitiesOf(ai2)[0].i, {}); await g.settle();
    check("Assassin Initiate: {1}: deathtouch", g.kw(ai2, "deathtouch"));
    const hc = put(g, a, "Hullcarver"); await g.settle();
    check("Hullcarver: an artifact Assassin with deathtouch", g.isArtifact(hc) && g.kw(hc, "deathtouch") && MK.isAssassin(g, hc)); }
  { const { g, a, b } = table(); const pbm = put(g, a, "Poison-Blade Mentor"); const ev = put(g, a, "Evie Frye"); await g.settle();
    await attack(g, a, [{ attacker: pbm, target: b }, { attacker: ev, target: b }]);
    check("Poison-Blade Mentor: another attacking Assassin gains deathtouch", g.kw(ev, "deathtouch")); }
  { const { g, a, b } = table(); put(g, a, "Bident of Thassa"); const hp = put(g, a, "Hired Poisoner"); await g.settle(); const h0 = a.hand.length;
    a.agent.choose = (g2, p, req) => (req.type === "confirm" ? true : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Bident of Thassa: a hit draws", a.hand.length === h0 + 1); }

  // Auton Soldier: a non-legendary artifact copy of Etrata with myriad; two Etratas cloak twice
  { const { g, a, b, c, d } = table(); lands(g, a, 6, "Island"); const et = put(g, a, "Etrata, Deadly Fugitive"); for (const q of [b, c, d]) for (let i = 0; i < 4; i++) lib(g, q, "Forest");
    a.agent.choose = (g2, p, req) => (req.purpose === "autonCopy" ? et : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    const au = hand(g, a, "Auton Soldier"); await g.cast(a, au); await g.settle();
    check("Auton Soldier: a non-legendary artifact copy of Etrata", au.def.name === "Etrata, Deadly Fugitive" && !au.def.legendary && g.isArtifact(au) && et.zone === "battlefield");
    au.sick = false;
    await attack(g, a, [{ attacker: au, target: b }]);
    const stolen = g.controlled(a, o => o.faceDown).length;
    check("Auton Soldier: three hits, and four Etratas (her, the Soldier, two myriad tokens) cloak for each", stolen === 12 && !g.battlefield.some(o => o.isToken && o.def.name === "Etrata, Deadly Fugitive"), stolen); }


  // Dolmen Gate: our attackers take no combat damage
  { const { g, a, b } = table(); put(g, a, "Dolmen Gate"); const hp = put(g, a, "Hired Poisoner"); const blk = put(g, b, "Thieving Amalgam"); await g.settle();
    b.agent.block = () => [{ blocker: blk, attacker: hp }];
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Dolmen Gate: the blocked attacker survives, its deathtouch kills the blocker", hp.zone === "battlefield" && blk.zone === "graveyard", { hp: hp.zone, blk: blk.zone }); }

  // Haunted One: Etrata attacking pumps every creature that shares a type with her, and gives undying
  { const { g, a, b } = table(); put(g, a, "Haunted One"); const et = put(g, a, "Etrata, Deadly Fugitive"); et.isCommander = true; const hp = put(g, a, "Hired Poisoner"); const elf = put(g, a, "Llanowar Elves"); await g.settle();
    a.agent.attack = () => [{ attacker: et, target: b }];
    let mid = null; const ow = g.trickWindow.bind(g);
    g.trickWindow = async (p, w) => { if (!w && !mid) mid = [g.power(et), g.power(hp), g.power(elf)]; return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Haunted One: Etrata and the Assassin get +2/+0, the Elf doesn't", !!mid && mid[0] === 3 && mid[1] === 3 && mid[2] === 1, mid);
    g.destroy(hp); await g.settle();
    check("Haunted One: undying brings the Assassin back with a +1/+1 counter", hp.zone === "battlefield" && hp.counters.p1 === 1, { zone: hp.zone, c: hp.counters }); }

  // Sword Coast Sailor: Etrata can't be blocked attacking the player with the most life
  { const { g, a, b, c } = table(); put(g, a, "Sword Coast Sailor"); const et = put(g, a, "Etrata, Deadly Fugitive"); et.isCommander = true; c.life = 30; await g.settle();
    a.agent.attack = () => [{ attacker: et, target: b }];
    let ub = null; const ow = g.trickWindow.bind(g);
    g.trickWindow = async (p, w) => { if (w === "attackers" && ub == null) ub = g.ch(et).unblockable; return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Sword Coast Sailor: unblockable against the highest life total", ub === true, ub); }

  // Reverse the Polarity (creatures can't be blocked) and Akroma's Memorial (protection from black)
  { const { g, a, b } = table(); lands(g, a, 3, "Island"); const hp = put(g, a, "Hired Poisoner"); const blk = put(g, b, "Llanowar Elves"); const rp = hand(g, a, "Reverse the Polarity"); await g.settle();
    await g.cast(a, rp, { mode: 1 }); await g.settle();
    check("Reverse the Polarity: creatures can't be blocked this turn", !g.canBlock(blk, hp));
    put(g, a, "Akroma's Memorial"); const bk = put(g, b, "Hired Poisoner"); await g.settle();
    check("Akroma's Memorial: flying, first strike, haste and protection from black", g.kw(hp, "first strike") && g.kw(hp, "haste") && g.protectedFrom(hp, bk)); }

  // the engine rules: "triggers an additional time" stays with its creature type, anyColor, castEntry
  { const { g, a } = table(); const rt = put(g, a, "Roaming Throne"); await g.settle();
    check("triggerExtra: a non-Assassin's trigger isn't doubled", (() => { const n = g.staticsOf(rt).find(st => st.triggerExtra).triggerExtra(g, rt, { src: put(g, a, "Llanowar Elves"), controller: a }); return n === 0; })()); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
