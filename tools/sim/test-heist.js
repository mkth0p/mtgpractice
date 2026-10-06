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


  // the ways to Ramses: Demonic Consultation, Fleshwrither, Pyre of Heroes
  { const { g, a } = table(); lands(g, a, 1, "Swamp"); const ram = lib(g, a, "Ramses, Assassin Lord"); for (let i = 0; i < 8; i++) lib(g, a, "Island");
    a.agent.choose = (g2, p, req) => (req.purpose === "consultName" ? req.options.find(o => o.label === "Ramses, Assassin Lord").id : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    const dc = hand(g, a, "Demonic Consultation"); await g.cast(a, dc); await g.settle();
    check("Demonic Consultation: exiles six, then finds the named card", ram.zone === "hand" && a.exile.length >= 6, { zone: ram.zone, ex: a.exile.length }); }
  { const { g, a } = table(); lands(g, a, 3, "Swamp"); const fw = put(g, a, "Fleshwrither"); const ram = lib(g, a, "Ramses, Assassin Lord"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "tutor" ? [ram] : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await g.activate(a, fw, g.abilitiesOf(fw)[0].i, {}); await g.settle();
    check("Fleshwrither: transfigure puts a mana value 4 creature onto the battlefield", ram.zone === "battlefield" && fw.zone === "graveyard"); }
  { const { g, a } = table(); lands(g, a, 2); const py = put(g, a, "Pyre of Heroes"); const vt = put(g, a, "Virtus the Veiled"); const ram = lib(g, a, "Ramses, Assassin Lord"); lib(g, a, "Hostage Taker"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "sacrifice" ? vt : req.purpose === "tutor" ? [req.options.find(c => c === ram)].filter(Boolean) : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    let offered = null; const os = g.search.bind(g); g.search = async (p, o) => { offered = p.library.filter(c => o.filter(g, c)).map(c => c.def.name); return os(p, o); };
    await g.activate(a, py, g.abilitiesOf(py)[0].i, {}); await g.settle();
    check("Pyre of Heroes: a mana value 3 Assassin finds a mana value 4 Assassin (not a Pirate)", ram.zone === "battlefield" && vt.zone === "graveyard" && offered && !offered.includes("Hostage Taker"), offered); }


  // Coat of Arms: each creature +1/+1 per other creature sharing a type; type-changers count; opponents' typal boards too
  { const { g, a, b } = table(); put(g, a, "Coat of Arms"); put(g, a, "Leyline of Transformation"); const hp = put(g, a, "Hired Poisoner"); const elf = put(g, a, "Llanowar Elves"); const oc = put(g, a, "Changeling Outcast");
    const e1 = put(g, b, "Llanowar Elves"), e2 = put(g, b, "Llanowar Elves"); await g.settle();
    check("Coat of Arms: Poisoner +2 (two other Assassins), our Elf +4 (Assassins and Elves), the changeling +4 (everything)", g.power(hp) === 3 && g.power(elf) === 5 && g.power(oc) === 5, [g.power(hp), g.power(elf), g.power(oc)]);
    check("Coat of Arms: the opponent's Elves get +3 (the other Elf, our Elf, the changeling)", g.power(e1) === 4 && g.power(e2) === 4, [g.power(e1), g.power(e2)]); }
  // Obelisk of Urd, Vanquisher's Banner, Door of Destinies, Icon of Ancestry, Adaptive Automaton
  { const { g, a } = table(); lands(g, a, 6); const hp = put(g, a, "Hired Poisoner"); put(g, a, "Obelisk of Urd"); put(g, a, "Vanquisher's Banner"); const door = put(g, a, "Door of Destinies"); put(g, a, "Icon of Ancestry"); put(g, a, "Adaptive Automaton"); await g.settle();
    check("typal anthems: Obelisk +2, Banner +1, Icon +1, Automaton +1 on an Assassin", g.power(hp) === 6, g.power(hp));
    const h0 = a.hand.length; const ai2 = hand(g, a, "Assassin Initiate"); await g.cast(a, ai2); await g.settle();
    check("Vanquisher's Banner draws and Door of Destinies charges on an Assassin spell", a.hand.length === h0 + 1 && (door.counters.charge || 0) === 1 && g.power(hp) === 7, { hand: a.hand.length - h0, charge: door.counters.charge, pw: g.power(hp) }); }
  // Kindred Dominance: destroys everything that isn't an Assassin (Leyline keeps ours)
  { const { g, a, b } = table(); lands(g, a, 7, "Swamp"); put(g, a, "Leyline of Transformation"); const elf = put(g, a, "Llanowar Elves"); const theirs = put(g, b, "Llanowar Elves"); const kd = hand(g, a, "Kindred Dominance"); await g.cast(a, kd); await g.settle();
    check("Kindred Dominance: their creature dies, our type-changed one lives", theirs.zone === "graveyard" && elf.zone === "battlefield"); }
  // altars, Blood Tribute, Rush of Dread, Hatred, Archfiend, Dark Confidant, Cabal Ritual, Massacre Wurm, Mithril Coat
  { const { g, a } = table(); const alt = put(g, a, "Ashnod's Altar"); put(g, a, "Hired Poisoner"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "sacrifice" ? req.options[0] : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await g.activate(a, alt, g.abilitiesOf(alt)[0].i, {}); await g.settle();
    check("Ashnod's Altar: sacrifice a creature for {C}{C}", a.pool.C === 2 && g.creatures(a).length === 0, a.pool); }
  { const { g, a, b } = table(); lands(g, a, 6, "Swamp"); const et = put(g, a, "Etrata, Deadly Fugitive"); const bt = hand(g, a, "Blood Tribute"); await g.cast(a, bt, { targets: [b] }); await g.settle();
    check("Blood Tribute: half their life, and the Vampire taps to gain it", b.life === 20 && a.life === 60 && et.tapped, [b.life, a.life, et.tapped]); }
  { const { g, a, b } = table(); lands(g, a, 6, "Swamp"); put(g, b, "Llanowar Elves"); put(g, b, "Llanowar Elves"); const rd = hand(g, a, "Rush of Dread"); await g.cast(a, rd, { targets: [b], kicked: true }); await g.settle();
    check("Rush of Dread (kicked): half their creatures and half their life", g.creatures(b).length === 1 && b.life === 20, [g.creatures(b).length, b.life]); }
  { const { g, a, b } = table(); lands(g, a, 5, "Swamp"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "hatredX" ? 19 : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    const ht = hand(g, a, "Hatred"); await g.cast(a, ht, { targets: [oc] }); await g.settle();
    check("Hatred: pay 19 life for +19/+0", a.life === 21 && g.power(oc) === 20, [a.life, g.power(oc)]);
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Hatred: a 20-power unblockable hit", b.life === 20, b.life); }
  { const { g, a, b } = table(); put(g, a, "Archfiend of Despair"); const hp = put(g, a, "Hired Poisoner"); await g.settle();
    await attack(g, a, [{ attacker: hp, target: b }]);
    g.gainLife(b, 5);
    check("Archfiend of Despair: opponents can't gain life", b.life === 39, b.life);
    g.emit("endStep", { p: a }); await g.settle();
    check("Archfiend of Despair: at the end step they lose it again", b.life === 38, b.life); }
  { const { g, a } = table(); put(g, a, "Dark Confidant"); const top = lib(g, a, "Ramses, Assassin Lord"); await g.settle();
    g.emit("upkeep", { p: a }); await g.settle();
    check("Dark Confidant: the top card to hand, life lost for its mana value", top.zone === "hand" && a.life === 36, { zone: top.zone, life: a.life }); }
  { const { g, a } = table(); lands(g, a, 2, "Swamp"); for (let i = 0; i < 7; i++) { const c = g.newObj(MK.get("Island"), a, "graveyard"); a.graveyard.push(c); } const cr = hand(g, a, "Cabal Ritual"); await g.cast(a, cr); await g.settle();
    check("Cabal Ritual: five black mana with threshold", a.pool.B === 5, a.pool.B); }
  { const { g, a, b } = table(); const e1 = put(g, b, "Llanowar Elves"); const big = put(g, b, "Thieving Amalgam"); put(g, a, "Massacre Wurm"); await g.settle();
    check("Massacre Wurm: -2/-2 kills the Elf, the 6/7 lives; the owner loses 2", e1.zone === "graveyard" && big.zone === "battlefield" && b.life === 38, { e1: e1.zone, life: b.life }); }
  { const { g, a } = table(); lands(g, a, 3); const ram = put(g, a, "Ramses, Assassin Lord"); const mc = hand(g, a, "Mithril Coat"); await g.cast(a, mc); await g.settle();
    check("Mithril Coat: attaches to a legendary creature, indestructible", mc.attachedTo === ram && g.kw(ram, "indestructible"));
    g.destroy(ram);
    check("Mithril Coat: the creature survives destruction", ram.zone === "battlefield"); }
  // ninjas: Ingenious Infiltrator draws for every Ninja hit; Moon-Circuit Hacker loots unless it entered this turn
  { const { g, a, b } = table(); lands(g, a, 4); const hp = put(g, a, "Hired Poisoner"); const inf = hand(g, a, "Ingenious Infiltrator"); await g.settle();
    a.agent.attack = () => [{ attacker: hp, target: b }];
    const ow = g.trickWindow.bind(g); let done = false; const h0 = a.hand.length;
    g.trickWindow = async (p, w) => { if (!w && !done) { done = true; await g.channel(a, inf, {}); } return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Ingenious Infiltrator: ninjutsu, then its own hit draws", inf.zone === "battlefield" && hp.zone === "hand" && a.hand.length === h0 + 1, { inf: inf.zone, hand: a.hand.length - h0 }); }
  // free interaction: Flare of Denial sacrificing a blue creature; Snapback pitching a blue card; Force of Despair on an opponent's turn
  { const { g, a, b } = table(); const sl = put(g, a, "Slither Blade"); const fd = hand(g, a, "Flare of Denial"); await g.settle();
    lands(g, b, 2, "Forest"); const elf = hand(g, b, "Llanowar Elves");
    a.agent.choose = (g2, p, req) => (req.purpose === "altSac" ? sl : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    let offered = null;
    a.agent.respond = (g2, p, ctx) => { const act = (ctx.actions || []).find(x => x.card === fd && x.alt); if (ctx.top && ctx.top.o === elf) offered = !!act; return act && ctx.top && ctx.top.o === elf ? { type: "cast", card: fd, alt: act.alt, targets: [ctx.top] } : null; };
    g.activeIdx = 1; await g.cast(b, elf); await g.settle();
    check("Flare of Denial: the free way is offered with a nontoken blue creature", offered === true, offered);
    check("Flare of Denial: counters for free, the blue creature is sacrificed", elf.zone === "graveyard" && sl.zone === "graveyard" && fd.zone === "graveyard", { elf: elf.zone, sl: sl.zone }); }
  { const { g, a, b } = table(); const elf = put(g, b, "Llanowar Elves"); const sb = hand(g, a, "Snapback"); const blue = hand(g, a, "Counterspell"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "altExile" ? blue : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await g.cast(a, sb, { alt: 1, targets: [elf] }); await g.settle();
    check("Snapback: free by exiling a blue card", elf.zone === "hand" && blue.zone === "exile"); }
  { const { g, a, b } = table(); const old = put(g, b, "Llanowar Elves"); old.enteredTurn = 0; g.turn = 5; g.activeIdx = 1; const fresh = put(g, b, "Thieving Amalgam"); const fod = hand(g, a, "Force of Despair"); const blk = hand(g, a, "Hired Poisoner"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "altExile" ? blk : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    check("Force of Despair: free on an opponent's turn", g.castOptions(a, fod).some(w => w.alt));
    await g.cast(a, fod, { alt: 1 }); await g.settle();
    check("Force of Despair: kills what entered this turn, not the old creature", fresh.zone === "graveyard" && old.zone === "battlefield", { fresh: fresh.zone, old: old.zone }); }


  // Mana Drain, Dismember, Flare of Malice, Mental Misstep, Thousand-Faced Shadow, Siren Stormtamer, the MDFC lands
  { const { g, a, b } = table(); lands(g, a, 2, "Island"); lands(g, b, 4, "Swamp"); const md = hand(g, a, "Mana Drain"); const big = hand(g, b, "Thieving Amalgam"); await g.settle();
    a.agent.respond = (g2, p, ctx) => { const act = (ctx.actions || []).find(x => x.card === md); return act && ctx.top && ctx.top.o === big ? { type: "cast", card: md, targets: [ctx.top] } : null; };
    g.activeIdx = 1; lands(g, b, 3, "Swamp"); await g.cast(b, big); await g.settle();
    check("Mana Drain: counters the spell", big.zone === "graveyard" && md.zone === "graveyard");
    g.activeIdx = 0; g.phase = "main1"; g.emit("precombatMain", { p: a }); g.runDelayed("precombatMain", a); await g.settle();
    check("Mana Drain: {C} for the spell's mana value in our next main phase", a.pool.C === 7, a.pool); }
  { const { g, a, b } = table(); lands(g, a, 1, "Swamp"); const big = put(g, b, "Thieving Amalgam"); const dm = hand(g, a, "Dismember"); await g.cast(a, dm, { targets: [big] }); await g.settle();
    check("Dismember: paid with life, -5/-5", a.life === 36 && g.power(big) === 1, [a.life, g.power(big)]); }
  { const { g, a, b, c } = table(); const hp = put(g, a, "Hired Poisoner"); const e1 = put(g, b, "Llanowar Elves"), big = put(g, b, "Thieving Amalgam"), ce = put(g, c, "Llanowar Elves"); const fm = hand(g, a, "Flare of Malice"); await g.settle();
    a.agent.choose = (g2, p, req) => (req.purpose === "altSac" ? hp : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    await g.cast(a, fm, { alt: 1 }); await g.settle();
    check("Flare of Malice: free by sacrificing a black creature; each opponent loses their biggest", hp.zone === "graveyard" && big.zone === "graveyard" && e1.zone === "battlefield" && ce.zone === "graveyard"); }
  { const { g, a, b } = table(); const mm = hand(g, a, "Mental Misstep"); lands(g, b, 1, "Forest"); const elf = hand(g, b, "Llanowar Elves"); await g.settle();
    a.agent.respond = (g2, p, ctx) => { const act = (ctx.actions || []).find(x => x.card === mm); return act && ctx.top && ctx.top.o === elf ? { type: "cast", card: mm, targets: [ctx.top] } : null; };
    g.activeIdx = 1; await g.cast(b, elf); await g.settle();
    check("Mental Misstep: counters a one-drop for 2 life", elf.zone === "graveyard" && a.life === 38, { elf: elf.zone, life: a.life }); }
  { const { g, a, b } = table(); lands(g, a, 4, "Island"); const hp = put(g, a, "Hired Poisoner"); const oc = put(g, a, "Changeling Outcast"); const tfs = hand(g, a, "Thousand-Faced Shadow"); await g.settle();
    a.agent.attack = () => [{ attacker: hp, target: b }, { attacker: oc, target: b }];
    a.agent.choose = (g2, p, req) => (req.purpose === "ninjutsu" ? hp : req.purpose === "copy" ? oc : MK.AI.create({ skill: 1 }).choose(g2, p, req));
    const ow = g.trickWindow.bind(g); let done = false;
    g.trickWindow = async (p, w) => { if (!w && !done) { done = true; await g.channel(a, tfs, {}); } return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Thousand-Faced Shadow: ninjutsu in, copy another attacker, 1+1+1 damage", tfs.zone === "battlefield" && b.life === 37 && g.battlefield.some(o => o.isToken && o.def.name === "Changeling Outcast"), { life: b.life, z: tfs.zone }); }
  { const { g, a, b } = table(); lands(g, a, 1, "Island"); const ss = put(g, a, "Siren Stormtamer"); const ram = put(g, a, "Ramses, Assassin Lord"); lands(g, b, 2, "Swamp"); const gr = hand(g, b, "Infernal Grasp"); await g.settle();
    a.agent.respond = (g2, p, ctx) => { const act = (ctx.actions || []).find(x => x.type === "activate" && x.card === ss); return act && ctx.top && ctx.top.o === gr ? { type: "activate", card: ss, idx: act.idx } : null; };
    g.activeIdx = 1; await g.cast(b, gr, { targets: [ram] }); await g.settle();
    check("Siren Stormtamer: sacrificed to counter removal on our creature", ram.zone === "battlefield" && ss.zone === "graveyard" && gr.zone === "graveyard", { ram: ram.zone, ss: ss.zone }); }
  { const { g, a } = table(); const fp = hand(g, a, "Fell the Profane // Fell Mire"); const acts = g.legalActions(a);
    check("Fell the Profane: playable as a land (Fell Mire)", acts.some(x => x.type === "land" && x.card === fp && x.back));
    await g.playLand(a, fp, true); await g.settle();
    check("Fell Mire: enters untapped for 3 life", fp.zone === "battlefield" && !fp.tapped && a.life === 37 && g.isLand(fp), { tapped: fp.tapped, life: a.life }); }


  // the brain's closers: Coat of Arms only when our typal board beats theirs; Hatred's X; Blood Tribute with Bloodletter
  { const { g, a, b } = table(); const H = MK.HEIST_HOOKS; a.deckId = "etrata-heist-aggro"; a.agent.bot = true;
    for (let i = 0; i < 4; i++) put(g, a, "Hired Poisoner"); put(g, b, "Llanowar Elves"); put(g, b, "Llanowar Elves"); const coat = hand(g, a, "Coat of Arms"); await g.settle();
    check("Coat of Arms: cast with four Assassins against two Elves", H.coatCast(g, a, coat, { window: "main1" }) === 24);
    for (let i = 0; i < 4; i++) put(g, b, "Llanowar Elves"); await g.settle();
    check("Coat of Arms: not cast when the opponent's Elves would gain as much", H.coatCast(g, a, coat, { window: "main1" }) === false); }
  { const { g, a, b } = table(); const H = MK.HEIST_HOOKS; a.deckId = "etrata-heist-aggro"; a.agent.bot = true; lands(g, a, 5, "Swamp"); put(g, a, "Ramses, Assassin Lord"); const oc = put(g, a, "Changeling Outcast"); const ht = hand(g, a, "Hatred"); b.life = 25; await g.settle();
    a.agent.attack = () => [{ attacker: oc, target: b }];
    let x = null; const ow = g.trickWindow.bind(g);
    g.trickWindow = async (p, w) => { if (!w && x == null) { x = H.hatredTrick(g, a, ht) ? H.hatredX(g, a) : -1; } return ow(p, w); };
    await g.doCombat(a); await g.settle();
    check("Hatred: with Ramses out it pays exactly what kills (23 life: the Outcast is 2/2 under Ramses, hitting 25)", x === 23, x); }
  { const { g, a, b } = table(); const H = MK.HEIST_HOOKS; a.deckId = "etrata-heist-aggro"; a.agent.bot = true; put(g, a, "Bloodletter of Aclazotz"); const bt = hand(g, a, "Blood Tribute"); await g.settle();
    check("Blood Tribute: with Bloodletter out it's a kill, cast at once", H.halfSpellCast(g, a, bt, { window: "main1" }) === 60); }


  // recursion: Reanimate takes Ramses from any graveyard; Patriarch's Bidding brings the Assassins back
  { const { g, a, b } = table(); lands(g, a, 1, "Swamp"); const ram = g.newObj(MK.get("Ramses, Assassin Lord"), b, "graveyard"); b.graveyard.push(ram); const re = hand(g, a, "Reanimate"); await g.cast(a, re, { targets: [ram] }); await g.settle();
    check("Reanimate: Ramses from an opponent's graveyard, 4 life", ram.zone === "battlefield" && ram.controller === a && a.life === 36, { zone: ram.zone, life: a.life }); }
  { const { g, a, b } = table(); lands(g, a, 5, "Swamp"); for (const n of ["Hired Poisoner", "Virtus the Veiled", "Llanowar Elves"]) { const c = g.newObj(MK.get(n), a, "graveyard"); a.graveyard.push(c); } const elf = g.newObj(MK.get("Llanowar Elves"), b, "graveyard"); b.graveyard.push(elf);
    const pb = hand(g, a, "Patriarch's Bidding"); await g.cast(a, pb); await g.settle();
    check("Patriarch's Bidding: our Assassins return; the opponent chose Elf, so both Elves return too", named(g, a, "Hired Poisoner").length === 1 && named(g, a, "Virtus the Veiled").length === 1 && named(g, a, "Llanowar Elves").length === 1 && elf.zone === "battlefield", { elf: elf.zone }); }


  // attack-trigger drain: Pulse Tracker, Within Range, and Hooded Blightfang with Mari making a changeling deathtouch
  { const { g, a, b, c, d } = table(); const pt = put(g, a, "Pulse Tracker"); put(g, a, "Within Range"); const oc = put(g, a, "Changeling Outcast"); put(g, a, "Mari, the Killing Quill"); put(g, a, "Hooded Blightfang"); await g.settle();
    check("Mari: the changeling Assassin has deathtouch", g.kw(oc, "deathtouch"));
    await attack(g, a, [{ attacker: pt, target: b }, { attacker: oc, target: b }]);
    // Pulse Tracker: each opponent 1; Within Range: b loses 2 (two attackers at b); Blightfang: the Outcast's attack drains each opponent 1 (Pulse Tracker has no deathtouch); damage: 1 + 1 to b
    // Pulse Tracker is a Rogue, so Mari gives it deathtouch too: Blightfang drains for both attackers
    check("attack drains: b loses 1 (Tracker) + 2 (Within Range) + 2 (Blightfang) + 2 damage; c and d lose 3; we gain 2", b.life === 33 && c.life === 37 && d.life === 37 && a.life === 42, [b.life, c.life, d.life, a.life]); }


  // Teferi's Veil: attackers phase out at end of combat and come back at our untap
  { const { g, a, b } = table(); put(g, a, "Teferi's Veil"); const hp = put(g, a, "Hired Poisoner"); const home = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: hp, target: b }]);
    check("Teferi's Veil: the attacker is phased out, the creature that stayed home isn't", hp.zone === "phased" && g.phased.includes(hp) && home.zone === "battlefield", { hp: hp.zone, home: home.zone });
    g.phaseIn(a);
    check("Teferi's Veil: it phases in at our untap", hp.zone === "battlefield", hp.zone); }


  // Whispersilk Cloak and Darksteel Plate on Ramses
  { const { g, a } = table(); lands(g, a, 4); const ram = put(g, a, "Ramses, Assassin Lord"); const wc = put(g, a, "Whispersilk Cloak"); const dp = put(g, a, "Darksteel Plate"); await g.settle();
    await equip(g, a, wc, ram); await g.settle(); await equip(g, a, dp, ram); await g.settle();
    check("Whispersilk Cloak: shroud and unblockable", g.kw(ram, "shroud") && g.ch(ram).unblockable && !g.canTarget(a, ram));
    g.destroy(ram); check("Darksteel Plate: indestructible", ram.zone === "battlefield"); }

  // the engine rules: "triggers an additional time" stays with its creature type, anyColor, castEntry
  { const { g, a } = table(); const rt = put(g, a, "Roaming Throne"); await g.settle();
    check("triggerExtra: a non-Assassin's trigger isn't doubled", (() => { const n = g.staticsOf(rt).find(st => st.triggerExtra).triggerExtra(g, rt, { src: put(g, a, "Llanowar Elves"), controller: a }); return n === 0; })()); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });
