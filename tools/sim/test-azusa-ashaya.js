#!/usr/bin/env node
/* Checks the Ashaya Azusa lists (decks-azusa-ashaya.js) in the game engine: the new cards (Ashaya,
   the untappers, Wirewood Lodge, Wild Growth, Utopia Sprawl, Jungle Basin, Fauna Shaman, Quirion
   Ranger, the lands that draw...) and the bot's unlimited-mana lines, each played out by the brain.
   node tools/sim/test-azusa-ashaya.js        (exits 1 if a check fails) */
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
function table(deckId) {
  const players = [{ name: "Azusa", commander: "Azusa, Lost but Seeking", list: Array(99).fill("Forest"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.life = 20; q.agent.block = () => []; q.agent.respond = () => null; }
  const a = g.players[0];
  a.library.length = 0;
  if (deckId) a.deckId = deckId;
  return { g, a, b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lib(g, p, names) { for (const n of names) p.library.push(g.newObj(MK.get(n), p, "library")); }
function lands(g, p, n, name) { const out = []; for (let i = 0; i < n; i++) out.push(put(g, p, name || "Forest")); return out; }
const opps = t => [t.b, t.c, t.d];
const lines = p => (p.azusaLines || []).map(l => l.line);

(async () => {
  // Both lists are legal 99s of defined cards, in MK.AZUSA_VARIANTS with a brain
  for (const d of MK.AZUSA_VARIANTS) {
    check(d.id + ": 99 cards", d.list.length === 99, d.list.length);
    check(d.id + ": every card is defined", d.list.every(n => MK.defs.has(n)), d.list.filter(n => !MK.defs.has(n)));
    const singles = d.list.filter(n => n !== "Forest");
    check(d.id + ": singleton", new Set(singles).size === singles.length);
    check(d.id + ": has a brain", !!(MK.DECK_BRAINS[d.id] && MK.DECK_BRAINS[d.id].plan));
  }

  // Ashaya: nontoken creatures are Forest lands that tap for {G}; Ashaya is */* the lands
  { const { g, a } = table(); lands(g, a, 3); const ash = put(g, a, "Ashaya, Soul of the Wild"); const elf = put(g, a, "Llanowar Elves"); await g.settle();
    check("Ashaya: a creature is a Forest land", g.isLand(elf) && g.isCreature(elf) && g.hasSub(elf, "Forest"));
    check("Ashaya counts herself and the creatures as lands", g.power(ash) === 5 && g.toughness(ash) === 5, [g.power(ash), g.toughness(ash)]);
    g.createToken(a, MK.T.azusaInsect); await g.settle(); const tok = g.battlefield.find(o => o.isToken);
    check("Ashaya: tokens stay non-lands", tok && !g.isLand(tok));
    check("Ashaya: a creature taps for {G} as a Forest", g.manaSources(a).some(s => s.o === ash)); }

  // Wild Growth and Utopia Sprawl: the enchanted land taps for two
  for (const n of ["Wild Growth", "Utopia Sprawl"]) {
    const { g, a } = table(); const [f] = lands(g, a, 2); const au = hand(g, a, n); await g.settle();
    a.agent.target = (g2, p, req) => req.options.includes(f) ? f : req.options[0];
    await g.cast(a, au, {}); await g.settle();
    check(n + ": enters on the land", au.zone === "battlefield" && au.attachedTo, au.zone);
    const t = au.attachedTo; if (t) g.untap(t); const e = t && g.manaSources(a).find(s => s.o === t);
    check(n + ": the land makes two", e && Math.max(...e.options.map(o => o.units.length)) === 2, e && e.options.map(o => o.units)); }

  // Jungle Basin: returns an untapped Forest, taps for {C}{G}
  { const { g, a } = table(); const [f] = lands(g, a, 1); const jb = hand(g, a, "Jungle Basin"); await g.settle();
    await g.playLand(a, jb); await g.settle();
    check("Jungle Basin: returns the Forest and stays", jb.zone === "battlefield" && f.zone === "hand", [jb.zone, f.zone]); }
  { const { g, a } = table(); const jb = hand(g, a, "Jungle Basin"); await g.settle();
    await g.playLand(a, jb); await g.settle();
    check("Jungle Basin: sacrificed with no Forest to return", jb.zone === "graveyard", jb.zone); }

  // Argothian Elder + Ashaya: the loop untaps a land and itself, unlimited mana
  { const { g, a } = table(); lands(g, a, 3); put(g, a, "Ashaya, Soul of the Wild"); const el = put(g, a, "Argothian Elder"); await g.settle();
    const acts = g.legalActions(a), loop = acts.find(x => x.card === el && x.ab.loop === "ashaya");
    check("Elder: the Ashaya loop is offered", !!loop);
    if (loop) { await g.perform(a, { type: "activate", card: el, idx: loop.idx, repeat: 20 }); await g.settle(); }
    check("Elder + Ashaya: 20 loops make 20 mana", g.poolTotal(a) >= 20, g.poolTotal(a)); }

  // Argothian Elder + Wirewood Lodge + Wild Growth: one more {G} each loop, no Ashaya
  { const { g, a } = table(); const [f] = lands(g, a, 2); const wg = put(g, a, "Wild Growth"); wg.attachedTo = f; put(g, a, "Wirewood Lodge"); const el = put(g, a, "Argothian Elder"); await g.settle();
    const loop = g.legalActions(a).find(x => x.card === el && x.ab.loop === "lodge");
    check("Elder: the Lodge loop is offered", !!loop);
    if (loop) { await g.perform(a, { type: "activate", card: el, idx: loop.idx, repeat: 15 }); await g.settle(); }
    check("Elder + Lodge + Wild Growth: 15 loops net 15 mana", g.poolTotal(a) >= 15 && !el.tapped, [g.poolTotal(a), el.tapped]); }

  // Ley Weaver is no Elf: no Lodge loop
  { const { g, a } = table(); const [f] = lands(g, a, 2); const wg = put(g, a, "Wild Growth"); wg.attachedTo = f; put(g, a, "Wirewood Lodge"); const lw = put(g, a, "Ley Weaver"); await g.settle();
    check("Ley Weaver: no Lodge loop (not an Elf)", !g.legalActions(a).some(x => x.card === lw && x.ab.loop === "lodge")); }

  // Fauna Shaman: discard only a creature card, find a creature card
  { const { g, a } = table(); lands(g, a, 1); const fs2 = put(g, a, "Fauna Shaman"); hand(g, a, "Forest"); await g.settle();
    check("Fauna Shaman: no creature card in hand, no activation", !g.legalActions(a).some(x => x.card === fs2));
    hand(g, a, "Llanowar Elves"); lib(g, a, ["Forest", "Walking Ballista"]);
    a.agent.choose = (g2, p, req) => req.type === "cards" ? req.options.filter(c => req.purpose === "discard" ? c.def.name === "Llanowar Elves" : c.def.name === "Walking Ballista").slice(0, 1) : undefined;
    const ab = g.legalActions(a).find(x => x.card === fs2);
    if (ab) { await g.perform(a, { type: "activate", card: fs2, idx: ab.idx }); await g.settle(); }
    check("Fauna Shaman: discards Elves, finds Ballista", a.hand.some(c => c.def.name === "Walking Ballista") && a.graveyard.some(c => c.def.name === "Llanowar Elves"), a.hand.map(c => c.def.name)); }

  // Quirion Ranger: return a Forest, untap a creature, once a turn
  { const { g, a } = table(); const fo = lands(g, a, 2); const qr = put(g, a, "Quirion Ranger"); const elf = put(g, a, "Llanowar Elves"); await g.settle();
    g.tap(elf); g.tap(fo[0]);
    a.agent.target = (g2, p, req) => req.purpose === "quirionForest" ? fo[0] : req.purpose === "quirionUntap" ? elf : req.options[0];
    const ab = g.legalActions(a).find(x => x.card === qr);
    if (ab) { await g.perform(a, { type: "activate", card: qr, idx: ab.idx }); await g.settle(); }
    check("Quirion Ranger: the Forest goes back, the Elves untap", fo[0].zone === "hand" && !elf.tapped, [fo[0].zone, elf.tapped]);
    check("Quirion Ranger: once each turn", !g.legalActions(a).some(x => x.card === qr)); }

  // Regrowth, Sylvan Tutor, Scavenging Ooze
  { const { g, a } = table(); lands(g, a, 2); const wb = g.newObj(MK.get("Walking Ballista"), a, "graveyard"); a.graveyard.push(wb); const rg = hand(g, a, "Regrowth"); await g.settle();
    a.agent.target = (g2, p, req) => req.options.includes(wb) ? wb : req.options[0];
    await g.cast(a, rg, {}); await g.settle();
    check("Regrowth: the card comes back to hand", wb.zone === "hand", wb.zone); }
  { const { g, a } = table(); lands(g, a, 1); lib(g, a, ["Forest", "Forest", "Craterhoof Behemoth", "Forest"]); const st = hand(g, a, "Sylvan Tutor"); await g.settle();
    await g.cast(a, st, {}); await g.settle();
    check("Sylvan Tutor: the creature goes on top", a.library[0] && a.library[0].def.name === "Craterhoof Behemoth", a.library[0] && a.library[0].def.name); }
  { const { g, a, b } = table(); lands(g, a, 1); const oz = put(g, a, "Scavenging Ooze"); const dead = g.newObj(MK.get("Llanowar Elves"), b, "graveyard"); b.graveyard.push(dead); await g.settle();
    a.agent.target = (g2, p, req) => req.options.includes(dead) ? dead : req.options[0];
    const ab = g.legalActions(a).find(x => x.card === oz), life = a.life;
    if (ab) { await g.perform(a, { type: "activate", card: oz, idx: ab.idx }); await g.settle(); }
    check("Scavenging Ooze: exiles a creature card, grows, gains 1", dead.zone === "exile" && oz.counters.p1 === 1 && a.life === life + 1, [dead.zone, oz.counters.p1, a.life - life]); }

  // The bot (MK.DECK_BRAINS["azusa-v2"]): a whole main phase on its own
  { const t = table("azusa-v2"), { g, a } = t; lands(g, a, 4); put(g, a, "Ashaya, Soul of the Wild"); put(g, a, "Argothian Elder"); hand(g, a, "Walking Ballista"); await g.settle();
    await g.mainPhase(a);
    check("bot: Ashaya + Elder → a huge Walking Ballista kills the table", opps(t).every(q => q.lost), [opps(t).map(q => q.life), lines(a)]);
    check("bot: notes the line", lines(a).includes("Ashaya + Argothian Elder") && lines(a).includes("Walking Ballista"), lines(a)); }
  { const t = table("azusa-v2"), { g, a } = t; lands(g, a, 4); put(g, a, "Ashaya, Soul of the Wild"); put(g, a, "Ley Weaver"); const dk = put(g, a, "Duskwatch Recruiter"); lib(g, a, ["Forest", "Walking Ballista", "Forest", "Forest", "Forest", "Forest", "Forest", "Forest", "Forest", "Forest"]); await g.settle();
    await g.mainPhase(a);
    check("bot: Ashaya + Ley Weaver, Duskwatch digs up Ballista", opps(t).every(q => q.lost), [opps(t).map(q => q.life), lines(a)]); }
  { const t = table("azusa-v2"), { g, a } = t; const fo = lands(g, a, 3); const wg = put(g, a, "Wild Growth"); wg.attachedTo = fo[0]; put(g, a, "Wirewood Lodge"); put(g, a, "Argothian Elder"); hand(g, a, "Walking Ballista"); await g.settle();
    await g.mainPhase(a);
    check("bot: Elder + Wirewood Lodge + Wild Growth → Ballista", opps(t).every(q => q.lost), [opps(t).map(q => q.life), lines(a)]); }
  { const t = table("azusa-v2"), { g, a } = t; lands(g, a, 2); const jb = put(g, a, "Jungle Basin"); put(g, a, "Wirewood Lodge"); put(g, a, "Argothian Elder"); hand(g, a, "Walking Ballista"); await g.settle();
    await g.mainPhase(a);
    check("bot: Elder + Wirewood Lodge + Jungle Basin → Ballista", opps(t).every(q => q.lost) && jb.zone === "battlefield", [opps(t).map(q => q.life), lines(a)]); }
  { const t = table("azusa-v2"), { g, a } = t; lands(g, a, 6); put(g, a, "Tyvar, the Pummeler"); put(g, a, "Devoted Druid"); put(g, a, "Ashaya, Soul of the Wild"); hand(g, a, "Walking Ballista"); await g.settle();
    await g.mainPhase(a);
    check("bot: Tyvar + Devoted Druid (Ashaya the big one) → Ballista", opps(t).every(q => q.lost), [opps(t).map(q => q.life), lines(a)]);
    check("bot: notes Tyvar + Druid", lines(a).includes("Tyvar + Devoted Druid"), lines(a)); }
  { const t = table("azusa-v3"), { g, a } = t; lands(g, a, 4); put(g, a, "Ashaya, Soul of the Wild"); put(g, a, "Nissa, Resurgent Animist"); put(g, a, "Quirion Ranger"); for (const q of opps(t)) q.life = 6; hand(g, a, "Walking Ballista"); await g.settle();
    await g.mainPhase(a);
    check("bot: Ashaya + Quirion Ranger + Nissa: mana each time Ranger comes back", lines(a).includes("Ashaya + Quirion Ranger") && opps(t).every(q => q.lost), [opps(t).map(q => q.life), lines(a)]); }
  // the pieces don't go to Natural Order
  { const t = table("azusa-v2"), { g, a } = t; lands(g, a, 3); put(g, a, "Ashaya, Soul of the Wild"); const el = put(g, a, "Argothian Elder"); const elf = put(g, a, "Llanowar Elves"); await g.settle();
    const no = g.newObj(MK.get("Natural Order"), a, "hand");
    const pick = MK.DECK_BRAINS["azusa-v2"].choose(g, a, { type: "target", purpose: "sacrifice", options: [el, elf], src: no });
    check("bot: Natural Order sacrifices the Elves, not the Elder", pick === elf, pick && pick.def.name); }

  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
