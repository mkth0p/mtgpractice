#!/usr/bin/env node
/* Checks the cards added for the upgraded Goblin Storm lists (cards-gstorm.js, Impolite Entrance in
   decks-zada.js, Sting in the Krenko brain): Krenko untappers, Marvin, the finishers, protection,
   counters, the modal lands and Three Tree City.
   node tools/sim/test-gstorm-up.js        (exits 1 if a check fails) */
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
const KRENKO = "Krenko, Mob Boss";
function table(cmd, oppCmd) {
  const players = [{ name: "Gob", commander: cmd || KRENKO, list: Array(99).fill("Mountain"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: oppCmd || "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 5, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  const a = g.players[0];
  a.library.length = 60;
  return { g, a, b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, n) { for (let i = 0; i < n; i++) put(g, p, "Mountain"); }
function commander(g, p) { const z = p.commanders[0]; g.removeFromZone(z); z.zone = "new"; g.enterMany([{ o: z, controller: p, opts: {} }]); z.sick = false; return z; }
function goblins(g, p, n) { return g.createToken(p, MK.T.goblin, { count: n }); }
function answer(p, fn) { const base = p.agent.choose; p.agent.choose = (g, pl, req) => { const r = fn(g, pl, req); return r === undefined ? base.call(p.agent, g, pl, req) : r; }; }
const ab = (g, o, f) => g.abilitiesOf(o).find(e => f(e.ab));
const tokens = (g, p) => g.creatures(p).filter(c => c.isToken).length;

(async () => {
  // every card of both lists is defined
  for (const f of ["krenko-high-b3.txt", "krenko-b4.txt"]) {
    const file = path.join(__dirname, "gstorm/lists", f);
    const names = fs.readFileSync(file, "utf8").split("\n").map(l => l.match(/^\d+\s+(.+)$/)).filter(Boolean).map(m => m[1]);
    const missing = names.filter(n => !MK.get(n));
    check(`${f}: every card is defined`, !missing.length, missing);
    check(`${f}: 100 cards`, fs.readFileSync(file, "utf8").split("\n").map(l => l.match(/^(\d+)\s/)).filter(Boolean).reduce((s, m) => s + +m[1], 0) === 100);
  }

  // Sting untaps Krenko at the beginning of every combat, opponents' too
  { const { g, a, b } = table(); lands(g, a, 4); const kr = commander(g, a); const st = put(g, a, "Sting, the Glinting Dagger"); await g.settle();
    const eq = ab(g, st, x => x.label === "Equip");
    await g.activate(a, st, eq.i, { targets: [kr] }); await g.settle();
    check("Sting: attached to Krenko", st.attachedTo === kr);
    check("Sting: +1/+1 and haste", g.power(kr) === 4 && g.kw(kr, "haste"), [g.power(kr)]);
    const make = ab(g, kr, x => x.krenkoMake);
    await g.activate(a, kr, make.i, {}); await g.settle();
    check("Krenko: one Goblin makes one token", tokens(g, a) === 1, tokens(g, a));
    await g.emit("beginCombat", { p: b }); await g.settle();
    check("Sting: Krenko untaps at an opponent's combat", !kr.tapped); }

  // Magewright's Stone and Thousand-Year Elixir untap Krenko; the Elixir lets a new Krenko tap
  { const { g, a } = table(); lands(g, a, 4); const kr = commander(g, a); goblins(g, a, 3); const ms = put(g, a, "Magewright's Stone"); await g.settle();
    const make = ab(g, kr, x => x.krenkoMake);
    await g.activate(a, kr, make.i, {}); await g.settle();
    check("Krenko: 4 Goblins make 4", tokens(g, a) === 7, tokens(g, a));
    await g.activate(a, ms, ab(g, ms, x => x.label.startsWith("Untap")).i, { targets: [kr] }); await g.settle();
    check("Magewright's Stone: untaps Krenko", !kr.tapped);
    await g.activate(a, kr, make.i, {}); await g.settle();
    check("Krenko again: 8 Goblins make 8", tokens(g, a) === 15, tokens(g, a)); }
  { const { g, a } = table(); lands(g, a, 4); const kr = commander(g, a); kr.sick = true; const el = put(g, a, "Thousand-Year Elixir"); await g.settle();
    const make = ab(g, kr, x => x.krenkoMake);
    check("Thousand-Year Elixir: a new Krenko can tap", g.canActivate(a, kr, make));
    await g.activate(a, kr, make.i, {}); await g.settle();
    await g.activate(a, el, ab(g, el, x => x.label.startsWith("Untap")).i, { targets: [kr] }); await g.settle();
    check("Thousand-Year Elixir: untaps Krenko", !kr.tapped && tokens(g, a) === 1, tokens(g, a)); }
  { const { g, a } = table(); lands(g, a, 4); const kr = commander(g, a); kr.sick = true; await g.settle();
    check("no Elixir: a new Krenko can't tap", !g.canActivate(a, kr, ab(g, kr, x => x.krenkoMake))); }

  // Marvin has Krenko's ability
  { const { g, a } = table(); lands(g, a, 4); commander(g, a); goblins(g, a, 1); const mv = put(g, a, "Marvin, Murderous Mimic"); await g.settle();
    const m = ab(g, mv, x => x.krenkoMake);
    check("Marvin: has Krenko's ability", !!m);
    if (m) { await g.activate(a, mv, m.i, {}); await g.settle(); }
    check("Marvin: makes a Goblin per Goblin (2)", tokens(g, a) === 3, tokens(g, a)); }

  // Hobgoblin Bandit Lord: lord, and damage equal to the Goblins that entered this turn
  { const { g, a, b } = table(); lands(g, a, 4); const hb = put(g, a, "Hobgoblin Bandit Lord"); const t = goblins(g, a, 5); await g.settle();
    check("Hobgoblin: other Goblins get +1/+1", g.power(t[0]) === 2);
    const life = b.life;
    await g.activate(a, hb, ab(g, hb, x => x.cost === "{R}").i, { targets: [b] }); await g.settle();
    check("Hobgoblin: it and 5 Goblins entered, 6 damage", b.life === life - 6, life - b.life); }

  // Goblin War Strike and Massive Raid
  { const { g, a, b } = table(); lands(g, a, 4); commander(g, a); goblins(g, a, 6); await g.settle();
    const life = b.life;
    await g.cast(a, hand(g, a, "Goblin War Strike"), { targets: [b] }); await g.settle();
    check("Goblin War Strike: 7 Goblins, 7 damage", b.life === life - 7, life - b.life);
    await g.cast(a, hand(g, a, "Massive Raid"), { targets: [b] }); await g.settle();
    check("Massive Raid: 7 creatures, 7 damage", b.life === life - 14, life - b.life); }

  // Hexing Squelcher: ward (pay 2 life) for our creatures, our spells can't be countered
  { const { g, a, b } = table(); lands(g, a, 4); const kr = commander(g, a); put(g, a, "Hexing Squelcher"); lands(g, b, 3); await g.settle();
    g.activeIdx = 1; const life = b.life;
    const bolt = g.newObj(MK.get("Lightning Bolt"), b, "hand"); b.hand.push(bolt);
    await g.cast(b, bolt, { targets: [kr] }); await g.settle();
    check("Hexing Squelcher: the opponent pays 2 life for ward", b.life === life - 2, life - b.life);
    g.activeIdx = 0;
    const item = { kind: "spell", p: a, o: { def: MK.get("Expedite") } };
    check("Hexing Squelcher: our spells can't be countered", g.uncounterable(item)); }

  // Deflecting Swat: free with a commander out, moves removal off Krenko
  { const { g, a, b } = table(); lands(g, a, 1); const kr = commander(g, a); const sw = hand(g, a, "Deflecting Swat"); lands(g, b, 3); const bear = put(g, b, "Elvish Spirit Guide"); await g.settle();
    g.activeIdx = 1;
    const bolt = g.newObj(MK.get("Lightning Bolt"), b, "hand"); b.hand.push(bolt);
    let swatted = false;
    a.agent.respond = (g2, p, ctx) => { if (swatted || ctx.window !== "stack") return null; swatted = true; return { type: "cast", card: sw, alt: 1 }; };
    await g.cast(b, bolt, { targets: [kr] }); await g.settle();
    check("Deflecting Swat: Krenko lives", kr.zone === "battlefield");
    check("Deflecting Swat: the Bolt hits the opponent's creature instead", bear.zone !== "battlefield", bear.zone);
    check("Deflecting Swat: cast for free", g.battlefield.filter(o => o.controller === a && o.def.name === "Mountain" && !o.tapped).length === 1); }

  // Red Elemental Blast counters a blue spell; Tibalt's Trickery counters anything
  { const { g, a, b } = table(); lands(g, a, 3); commander(g, a); const reb = hand(g, a, "Red Elemental Blast"); lands(g, b, 1); put(g, b, "Island"); await g.settle();
    check("Red Elemental Blast: nothing blue, can't be cast", g.castOptions(a, reb).length === 0);
    g.activeIdx = 1;
    const blade = g.newObj(MK.get("Slither Blade"), b, "hand"); b.hand.push(blade);
    let done = false;
    a.agent.respond = (g2, p, ctx) => { if (done || ctx.window !== "stack") return null; done = true; return { type: "cast", card: reb, targets: [ctx.top] }; };
    await g.cast(b, blade, {}); await g.settle();
    check("Red Elemental Blast: the blue creature spell is countered", blade.zone === "graveyard", blade.zone);
    g.activeIdx = 0;
    const blade2 = put(g, b, "Slither Blade"); const reb2 = hand(g, a, "Red Elemental Blast");
    await g.cast(a, reb2, { mode: 1, targets: [blade2] }); await g.settle();
    check("Red Elemental Blast: destroys a blue permanent", blade2.zone === "graveyard", blade2.zone); }
  { const { g, a, b } = table(); lands(g, a, 3); commander(g, a); const tt = hand(g, a, "Tibalt's Trickery"); lands(g, b, 3); await g.settle();
    g.activeIdx = 1;
    b.library.length = 0; for (let i = 0; i < 10; i++) { const o = g.newObj(MK.get(i < 4 ? "Plains" : "Elvish Spirit Guide"), b, "library"); b.library.push(o); }
    const bolt = g.newObj(MK.get("Lightning Bolt"), b, "hand"); b.hand.push(bolt);
    let done = false;
    a.agent.respond = (g2, p, ctx) => { if (done || ctx.window !== "stack") return null; done = true; return { type: "cast", card: tt, targets: [ctx.top] }; };
    const life = a.life;
    await g.cast(b, bolt, { targets: [a] }); await g.settle();
    check("Tibalt's Trickery: the Bolt is countered", a.life === life, life - a.life);
    check("Tibalt's Trickery: the library keeps its cards (bottom)", b.library.length + b.graveyard.length + g.battlefield.filter(o => o.owner === b && o.def.name === "Elvish Spirit Guide").length >= 10); }

  // Fury, evoked: 4 damage divided, then it's sacrificed
  { const { g, a, b } = table(); lands(g, a, 1); commander(g, a); const fury = hand(g, a, "Fury"); hand(g, a, "Lightning Bolt"); const x1 = put(g, b, "Elvish Spirit Guide"), x2 = put(g, b, "Elvish Spirit Guide"); await g.settle();
    await g.cast(a, fury, { alt: 1 }); await g.settle();
    check("Fury: two 2/2s die", x1.zone !== "battlefield" && x2.zone !== "battlefield", [x1.zone, x2.zone]);
    check("Fury: evoked Fury is sacrificed", fury.zone === "graveyard", fury.zone);
    check("Fury: a red card was exiled", a.exile.some(c => c.def.name === "Lightning Bolt")); }

  // Fiery Confluence: 6 to each opponent when that kills one
  { const { g, a, b, c } = table(); lands(g, a, 4); commander(g, a); b.life = 6; await g.settle();
    await g.cast(a, hand(g, a, "Fiery Confluence"), {}); await g.settle();
    check("Fiery Confluence: 2 damage three times to each opponent", b.lost && c.life === 34, [b.life, c.life]); }

  // Shatterskull Smashing: a land that pays 3 life, or X damage
  { const { g, a, b } = table(); commander(g, a); const sk = hand(g, a, "Shatterskull Smashing"); await g.settle();
    const life = a.life;
    await g.playLand(a, sk, true); await g.settle();
    check("Shatterskull: played as a land, untapped for 3 life", sk.zone === "battlefield" && !sk.tapped && a.life === life - 3, [sk.zone, sk.tapped, a.life]); }
  { const { g, a, b } = table(); lands(g, a, 5); commander(g, a); const bear = put(g, b, "Elvish Spirit Guide"); await g.settle();
    await g.cast(a, hand(g, a, "Shatterskull Smashing"), { x: 3 }); await g.settle();
    check("Shatterskull Smashing: X=3 kills a 2/2", bear.zone !== "battlefield"); }

  // Sundering Eruption: creatures without flying can't block this turn
  { const { g, a, b } = table(); lands(g, a, 3); commander(g, a); const bear = put(g, b, "Elvish Spirit Guide"); const pl = put(g, b, "Plains"); await g.settle();
    await g.cast(a, hand(g, a, "Sundering Eruption"), { targets: [pl] }); await g.settle();
    check("Sundering Eruption: the land is destroyed", pl.zone !== "battlefield");
    check("Sundering Eruption: a creature without flying can't block", !!g.ch(bear).cantBlock || g.effects.some(e => e.cantBlock && e.objs.has(bear.id))); }

  // Three Tree City names Goblin and makes a red mana per Goblin
  { const { g, a } = table(); lands(g, a, 2); commander(g, a); goblins(g, a, 5); const tc = put(g, a, "Three Tree City"); await g.settle();
    check("Three Tree City: chose Goblin", tc.state.chosenType === "Goblin", tc.state.chosenType);
    await g.activate(a, tc, ab(g, tc, x => x.cost === "{2}").i, {});
    check("Three Tree City: 6 Goblins, 6 red", a.pool.R === 6, a.pool); }

  // Hanweir Battlements gives haste; Sokenzan's channel makes two hasty Spirits for less
  { const { g, a } = table(); lands(g, a, 2); const kr = commander(g, a); kr.sick = true; const hw = put(g, a, "Hanweir Battlements"); await g.settle();
    await g.activate(a, hw, ab(g, hw, x => x.cost === "{R}").i, { targets: [kr] }); await g.settle();
    check("Hanweir Battlements: Krenko has haste", g.kw(kr, "haste")); }
  { const { g, a } = table(); lands(g, a, 3); commander(g, a); const so = hand(g, a, "Sokenzan, Crucible of Defiance"); await g.settle();
    check("Sokenzan: channel costs {2}{R} with Krenko out", g.channelCost(a, so).g === 2, g.channelCost(a, so));
    await g.channel(a, so, {}); await g.settle();
    const sp = g.creatures(a).filter(c => c.def.name === "Spirit");
    check("Sokenzan: two hasty Spirits", sp.length === 2 && sp.every(c => g.kw(c, "haste")), sp.length); }

  // Simian Spirit Guide pays from the hand
  { const { g, a } = table(); commander(g, a); const sg = hand(g, a, "Simian Spirit Guide"); const ex = hand(g, a, "Expedite"); await g.settle();
    check("Simian Spirit Guide: Expedite castable with no lands", g.castOptions(a, ex).length > 0); }

  // Goblin Chirurgeon regenerates Krenko
  { const { g, a } = table(); commander(g, a); const ch = put(g, a, "Goblin Chirurgeon"); const t = goblins(g, a, 1); const kr = g.creatures(a).find(c => c.def.name === KRENKO); await g.settle();
    answer(a, (g2, p, req) => (req.purpose === "sacrifice" || (req.prompt || "").startsWith("Sacrifice") ? (Array.isArray(req.options) && req.type === "cards" ? [t[0]] : t[0]) : undefined));
    await g.activate(a, ch, ab(g, ch, x => !!x.sacCost).i, { targets: [kr] }); await g.settle();
    g.destroy(kr); await g.settle();
    check("Goblin Chirurgeon: Krenko regenerates", kr.zone === "battlefield" && kr.tapped, kr.zone); }

  // Impolite Entrance on Zada: copied for each other creature
  { const { g, a } = table("Zada, Hedron Grinder"); lands(g, a, 2); const z = commander(g, a); goblins(g, a, 3); await g.settle();
    const before = a.hand.length;
    await g.cast(a, hand(g, a, "Impolite Entrance"), { targets: [z] }); await g.settle();
    check("Impolite Entrance on Zada with 3 others draws 4", a.hand.length === before + 4, a.hand.length - before);
    check("Impolite Entrance: tokens get haste and trample", g.creatures(a).filter(c => c.isToken).every(c => g.kw(c, "haste") && g.kw(c, "trample"))); }

  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
