#!/usr/bin/env node
/* Checks the Goblin Storm deck (Zada, Hedron Grinder) in the game engine: Zada's copies, storm,
   magecraft on copies, the Haze of Rage loop, Past in Flames, buyback, Frontline Heroism, the coach.
   node tools/sim/test-gstorm.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
require(path.join(dir, "checklist-gstorm.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}
function table() {
  const players = [{ name: "Gob", commander: "Zada, Hedron Grinder", list: Array(99).fill("Mountain"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 5, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  const a = g.players[0];
  a.library.length = 60;
  return { g, a, b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function grave(g, p, name) { const o = g.newObj(MK.get(name), p, "graveyard"); p.graveyard.push(o); return o; }
function lands(g, p, n) { for (let i = 0; i < n; i++) put(g, p, "Mountain"); }
function zada(g, p) { const z = p.commanders[0]; g.removeFromZone(z); z.zone = "new"; g.enterMany([{ o: z, controller: p, opts: {} }]); z.sick = false; return z; }
function goblins(g, p, n) { return g.createToken(p, MK.T.goblin, { count: n }); }
function answer(p, fn) { const base = p.agent.choose; p.agent.choose = (g, pl, req) => { const r = fn(g, pl, req); return r === undefined ? base.call(p.agent, g, pl, req) : r; }; }
const treasures = (g, p) => g.battlefield.filter(o => o.controller === p && o.def.name === "Treasure").length;

(async () => {
  // the deck is 100 cards and every card is defined
  { const d = MK.GSTORM_DECK;
    check("deck: 99 cards plus Zada", d.list.length === 99, d.list.length);
    const missing = d.list.concat([d.commander]).filter(n => !MK.get(n));
    check("deck: every card is defined", !missing.length, missing);
    check("deck: is a hero on the goblin-storm site", (MK.HERO_DECKS || []).includes(d) && d.hero === "goblin-storm");
    check("deck: checklist exists", !!(globalThis.MK_CHECKLISTS || {}).gstorm); }

  // Zada copies a cantrip once per other creature
  { const { g, a } = table(); lands(g, a, 2); const z = zada(g, a); goblins(g, a, 4); await g.settle();
    const ex = hand(g, a, "Expedite"); const before = a.hand.length;
    await g.cast(a, ex, { targets: [z] }); await g.settle();
    check("Zada: Expedite with 4 others draws 5", a.hand.length === before - 1 + 5, a.hand.length - before + 1);
    check("Zada: every Goblin token has haste", g.creatures(a).filter(c => c.isToken).every(c => g.kw(c, "haste"))); }

  // a spell aimed at another creature isn't copied
  { const { g, a } = table(); lands(g, a, 2); zada(g, a); const t = goblins(g, a, 3); await g.settle();
    const ex = hand(g, a, "Expedite"); const before = a.hand.length;
    await g.cast(a, ex, { targets: [t[0]] }); await g.settle();
    check("Zada: Expedite on a token draws 1", a.hand.length === before, a.hand.length - before); }

  // Ancestors' Aid: a Treasure per copy; Storm-Kiln Artist adds one per cast and per copy
  { const { g, a } = table(); lands(g, a, 2); const z = zada(g, a); put(g, a, "Storm-Kiln Artist"); goblins(g, a, 3); await g.settle();
    const aid = hand(g, a, "Ancestors' Aid");
    await g.cast(a, aid, { targets: [z] }); await g.settle();
    check("Zada + Artist: Ancestors' Aid with 4 others makes 10 Treasures", treasures(g, a) === 10, treasures(g, a)); }

  // Daring Discovery on Zada alone: a discover per creature
  { const { g, a } = table(); lands(g, a, 5); const z = zada(g, a); goblins(g, a, 2); await g.settle();
    a.library.length = 0; for (let i = 0; i < 6; i++) { const o = g.newObj(MK.get("Dragon Fodder"), a, "library"); a.library.push(o); }
    answer(a, (g2, p, req) => (req.purpose === "discover" ? true : undefined));
    const dd = hand(g, a, "Daring Discovery");
    await g.cast(a, dd, { targets: [z, null, null] }); await g.settle();
    check("Zada: Daring Discovery with 2 others discovers 3 times (6 more Goblins)", g.creatures(a).filter(c => c.isToken).length === 8, g.creatures(a).filter(c => c.isToken).length); }

  // storm: Grapeshot and Empty the Warrens
  { const { g, a, b } = table(); lands(g, a, 8); await g.settle();
    for (const n of ["Expedite", "Crimson Wisps", "Renegade Tactics"]) { const o = hand(g, a, n); put(g, a, "Mountain"); }
    const t = goblins(g, a, 1); await g.settle();
    for (const n of ["Expedite", "Crimson Wisps", "Renegade Tactics"]) await g.cast(a, a.hand.find(c => c.def.name === n), { targets: [t[0]] });
    await g.settle();
    answer(a, (g2, p, req) => (req.purpose === "stormSame" ? true : req.type === "target" && req.options.includes(b) ? b : undefined));
    const life = b.life;
    await g.cast(a, hand(g, a, "Grapeshot"), { targets: [b] }); await g.settle();
    check("storm: Grapeshot as the 4th spell deals 4", life - b.life === 4, life - b.life);
    const toks = g.creatures(a).filter(c => c.isToken).length;
    await g.cast(a, hand(g, a, "Empty the Warrens")); await g.settle();
    check("storm: Empty the Warrens as the 5th spell makes 10 Goblins", g.creatures(a).filter(c => c.isToken).length - toks === 10, g.creatures(a).filter(c => c.isToken).length - toks); }

  // Haze of Rage with buyback returns to the hand; Artist makes 1 + storm Treasures
  { const { g, a } = table(); lands(g, a, 10); put(g, a, "Storm-Kiln Artist"); goblins(g, a, 2); await g.settle();
    const t = g.creatures(a).find(c => c.isToken);
    for (const n of ["Expedite", "Crimson Wisps", "Renegade Tactics"]) await g.cast(a, hand(g, a, n), { targets: [t] });
    await g.settle();
    const tr = treasures(g, a);
    const hz = hand(g, a, "Haze of Rage");
    const p0 = g.power(t);
    await g.cast(a, hz, { kicked: true }); await g.settle();
    check("Haze: buyback puts it back in your hand", hz.zone === "hand", hz.zone);
    check("Haze: Artist makes 4 Treasures with storm 3", treasures(g, a) - tr === 4, treasures(g, a) - tr);
    check("Haze: storm 3 gives +4/+0", g.power(t) - p0 === 4, g.power(t) - p0); }

  // Past in Flames: rituals come back with flashback, then get exiled
  { const { g, a } = table(); lands(g, a, 4); await g.settle();
    const ss = grave(g, a, "Seething Song");
    check("Past in Flames: no flashback before it resolves", !g.castZones(a).includes(ss));
    await g.cast(a, hand(g, a, "Past in Flames")); await g.settle();
    put(g, a, "Mountain"); put(g, a, "Mountain"); put(g, a, "Mountain");
    check("Past in Flames: Seething Song can be cast from the graveyard", g.castOptions(a, ss).length > 0);
    await g.cast(a, ss); await g.settle();
    check("Past in Flames: the flashed-back ritual is exiled", ss.zone === "exile", ss.zone);
    check("Past in Flames: the ritual made 5 red", a.pool.R >= 5, a.pool); }

  // Frontline Heroism: a Soldier and a copy aimed at it, and Zada copies onto the Soldier too
  { const { g, a } = table(); lands(g, a, 2); const z = zada(g, a); put(g, a, "Frontline Heroism"); goblins(g, a, 1); await g.settle();
    const cre = g.creatures(a).length; // Zada, the first Soldier, a Goblin
    const before = a.hand.length;
    await g.cast(a, hand(g, a, "Expedite"), { targets: [z] }); await g.settle();
    check("Frontline + Zada: a new Soldier", g.creatures(a).length === cre + 1, g.creatures(a).length - cre);
    check("Frontline + Zada: Expedite draws 5 (original, Frontline copy, 3 Zada copies)", a.hand.length - before === 5, a.hand.length - before); }

  // Roaming Throne picks Goblin here, and doubles Zada's copies
  { const { g, a } = table(); lands(g, a, 2); const z = zada(g, a); for (let i = 0; i < 20; i++) a.library[i] = g.newObj(MK.get("Goblin Lackey"), a, "library");
    const rt = put(g, a, "Roaming Throne"); goblins(g, a, 2); await g.settle();
    check("Roaming Throne: chooses Goblin in a Goblin deck", rt.state.chosenType === "Goblin", rt.state);
    const before = a.hand.length;
    await g.cast(a, hand(g, a, "Expedite"), { targets: [z] }); await g.settle();
    check("Roaming Throne: Zada's trigger twice (3 others: 6 copies, 7 cards)", a.hand.length - before === 7, a.hand.length - before); }

  // General Kreat: one damage per creature entering
  { const { g, a, b } = table(); put(g, a, "General Kreat, the Boltbringer"); await g.settle(); const life = b.life;
    goblins(g, a, 3); await g.settle();
    check("Kreat: 3 Goblins entering deal 3 to each opponent", life - b.life === 3, life - b.life); }

  // the coach speaks up with Zada out and a cantrip in hand
  { const { g, a } = table(); lands(g, a, 2); zada(g, a); goblins(g, a, 3); hand(g, a, "Expedite"); await g.settle();
    const tips = MK.GSTORM_DECK.coach.tips(g, a);
    check("coach: tells you how many copies Zada makes", tips.some(t => /Zada makes 3 copies/.test(t.title)), tips.map(t => t.title)); }

  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
