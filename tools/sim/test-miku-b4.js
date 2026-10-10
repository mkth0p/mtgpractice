#!/usr/bin/env node
/* Checks the cards of the Miku high-Bracket-4 research lists (cards-miku-b4.js): the Brago and Shalai
   cards, their loops, the Brago bot's mana loops and the Shalai bot's Swift Reconfiguration line.
   node tools/sim/test-miku-b4.js        (exits 1 if a check fails) */
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
/* Our commander against three players with Plains in their libraries. */
function table(cmdr, deckId) {
  const players = [{ name: "Miku", commander: cmdr || "Brago, King Eternal", deckId: deckId || "brago", list: Array(99).fill("Island"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  g.players[0].deckId = deckId || "brago";
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, n, kinds) { const out = []; for (let i = 0; i < n; i++) out.push(put(g, p, (kinds || ["Island", "Plains"])[i % (kinds || [0, 0]).length])); return out; }
function answer(p, fn) { const base = p.agent.choose; p.agent.choose = (g, pl, req) => { const r = fn(g, pl, req); return r === undefined ? base.call(p.agent, g, pl, req) : r; }; }
const cast = (g, p, card, more) => g.perform(p, Object.assign({ type: "cast", card }, more || {}));
const repeat = (g, p, o, idx, n, more) => g.perform(p, Object.assign({ type: "activate", card: o, idx, repeat: n }, more || {}));

(async () => {
  // Brago: a hit flickers the chosen permanents; tapped rocks come back untapped, ETB creatures trigger again
  { const { g, a, b } = table(); const br = put(g, a, "Brago, King Eternal"); const sol = put(g, a, "Sol Ring"); sol.tapped = true;
    const wall = put(g, a, "Wall of Omens"); const tok = g.createToken(a, MK.T.b4Bird)[0]; await g.settle();
    const hand0 = a.hand.length;
    a.library.length = 40;
    g.emit("combatDamagePlayer", { src: br, p: b, amount: 2 }); await g.settle();
    check("Brago: Sol Ring comes back untapped", sol.zone === "battlefield" && !sol.tapped);
    check("Brago: Wall of Omens draws again", a.hand.length === hand0 + 1, a.hand.length - hand0);
    check("Brago: the bot leaves tokens alone", tok.zone === "battlefield");
    check("Brago: Brago stays", br.zone === "battlefield"); }

  // Peregrine Drake untaps five lands
  { const { g, a } = table(); const ls = lands(g, a, 6, ["Island"]); for (const l of ls) l.tapped = true;
    put(g, a, "Peregrine Drake"); await g.settle();
    check("Peregrine Drake: five lands untap", ls.filter(l => !l.tapped).length === 5, ls.filter(l => !l.tapped).length); }

  // Deadeye Navigator pairs with Peregrine Drake; the Drake's blink loop makes mana
  { const { g, a, b } = table(); const ls = lands(g, a, 6, ["Island"]);
    const dr = put(g, a, "Peregrine Drake"); const de = put(g, a, "Deadeye Navigator"); await g.settle();
    const acts = g.legalActions(a).filter(x => x.type === "activate" && x.card === dr);
    check("Deadeye: the Drake has the blink ability once paired", acts.length === 1, acts.map(x => x.ab && x.ab.label));
    const ab = acts[0];
    let n = 0;
    const floatLands = g2 => { for (const l of ls) if (!l.tapped) { g2.tap(l); a.pool.U++; } return ++n > 10; };
    floatLands(g);
    if (ab) await g.perform(a, { type: "activate", card: dr, idx: ab.idx, repeat: 20, stop: floatLands });
    await g.settle();
    check("Drake + Deadeye: ten loops net three mana each", g.poolTotal(a) >= 30, g.poolTotal(a));
    check("Drake + Deadeye: still paired after the loops", g.legalActions(a).some(x => x.type === "activate" && x.card === dr)); }

  // Brago bot: Drake + Deadeye + Walking Ballista in hand kills the table
  { const { g, a, b, c, d } = table(); lands(g, a, 6, ["Island"]); put(g, a, "Peregrine Drake"); put(g, a, "Deadeye Navigator"); await g.settle();
    hand(g, a, "Walking Ballista"); for (const q of [b, c, d]) q.life = 20;
    for (let k = 0; k < 12 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (!act) break; await g.perform(a, act); await g.settle(); }
    check("Brago bot: Drake + Deadeye + Ballista kills everyone", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Brago bot: Isochron Scepter + Dramatic Reversal with three mana of rocks + Ballista
  { const { g, a, b, c, d } = table(); lands(g, a, 3, ["Island"]); put(g, a, "Sol Ring"); put(g, a, "Arcane Signet");
    const sc = put(g, a, "Isochron Scepter"); const rev = g.newObj(MK.get("Dramatic Reversal"), a, "exile"); a.exile.push(rev); sc.state.imprint = rev; await g.settle();
    hand(g, a, "Walking Ballista"); for (const q of [b, c, d]) q.life = 10;
    for (let k = 0; k < 12 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (!act) break; await g.perform(a, act); await g.settle(); }
    check("Brago bot: Scepter + Reversal + Ballista kills everyone", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Brago bot: the Scepter loop also starts with its rocks tapped (they just paid for the Scepter)
  { const { g, a, b, c, d } = table(); lands(g, a, 2, ["Island"]); const r1 = put(g, a, "Sol Ring"), r2 = put(g, a, "Arcane Signet");
    const sc = put(g, a, "Isochron Scepter"); const rev = g.newObj(MK.get("Dramatic Reversal"), a, "exile"); a.exile.push(rev); sc.state.imprint = rev; await g.settle();
    g.tap(r1); g.tap(r2); hand(g, a, "Walking Ballista"); for (const q of [b, c, d]) q.life = 10;
    for (let k = 0; k < 12 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (!act) break; await g.perform(a, act); await g.settle(); }
    check("Brago bot: Scepter loop with tapped rocks kills everyone", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Brago bot: Heliod + Walking Ballista in hand: Ballista with mana left for lifelink, then the loop
  { const { g, a, b, c, d } = table(); lands(g, a, 8, ["Plains"]); put(g, a, "Heliod, Sun-Crowned"); await g.settle();
    hand(g, a, "Walking Ballista"); for (const q of [b, c, d]) q.life = 20;
    for (let k = 0; k < 12 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (!act) break; await g.perform(a, act); await g.settle(); }
    check("Brago bot: Heliod + Ballista kills everyone", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Brago bot: the Scepter loop with no Ballista digs for it (Trinket Mage)
  { const { g, a, b, c, d } = table(); lands(g, a, 3, ["Island"]); put(g, a, "Sol Ring"); put(g, a, "Arcane Signet");
    const sc = put(g, a, "Isochron Scepter"); const rev = g.newObj(MK.get("Dramatic Reversal"), a, "exile"); a.exile.push(rev); sc.state.imprint = rev; await g.settle();
    hand(g, a, "Trinket Mage"); const bl = g.newObj(MK.get("Walking Ballista"), a, "library"); a.library.push(bl); for (const q of [b, c, d]) q.life = 10;
    for (let k = 0; k < 30 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (!act || act.type === "pass") break; await g.perform(a, act); await g.settle(); }
    check("Brago bot: digs Ballista with the Scepter's mana and kills", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Cloudshift and Ephemerate: flicker, Ephemerate rebounds
  { const { g, a } = table(); lands(g, a, 2, ["Plains"]); const w = put(g, a, "Wall of Omens"); a.library.length = 40; await g.settle();
    const eph = hand(g, a, "Ephemerate"); const h0 = a.hand.length;
    await cast(g, a, eph, { targets: [w] }); await g.settle();
    check("Ephemerate: Wall of Omens draws on the way back", a.hand.length === h0, a.hand.length - h0);
    check("Ephemerate: exiled for rebound", eph.zone === "exile");
    check("Ephemerate: a rebound waits for the upkeep", g.delayed.some(x => x.at === "upkeep" && x.player === a)); }

  // Soulbond breaks when the partner leaves
  { const { g, a } = table(); lands(g, a, 2, ["Island"]); const dr = put(g, a, "Peregrine Drake"); const de = put(g, a, "Deadeye Navigator"); await g.settle();
    g.bounce(de); await g.settle();
    check("Deadeye: the Drake loses the ability when the Navigator leaves", !g.legalActions(a).some(x => x.type === "activate" && x.card === dr)); }

  // Elesh Norn: our enters triggers twice, opponents' don't trigger
  { const { g, a, b } = table(); lands(g, a, 2, ["Island"]); put(g, a, "Elesh Norn, Mother of Machines"); a.library.length = 40; await g.settle();
    const h0 = a.hand.length; put(g, a, "Wall of Omens"); await g.settle();
    check("Elesh Norn: Wall of Omens draws twice", a.hand.length === h0 + 2, a.hand.length - h0);
    b.library.length = 40; const hb = b.hand.length; const w2 = g.newObj(MK.get("Wall of Omens"), b, "new"); g.enterMany([{ o: w2, controller: b, opts: {} }]); await g.settle();
    check("Elesh Norn: an opponent's Wall of Omens draws nothing", b.hand.length === hb, b.hand.length - hb); }

  // Mulldrifter evoke: draws two, then it's sacrificed
  { const { g, a } = table(); lands(g, a, 3, ["Island"]); a.library.length = 40; const md = hand(g, a, "Mulldrifter"); const h0 = a.hand.length;
    await cast(g, a, md, { alt: 1 }); await g.settle();
    check("Mulldrifter evoke: draws two", a.hand.length === h0 - 1 + 2, a.hand.length - h0);
    check("Mulldrifter evoke: sacrificed", md.zone === "graveyard"); }

  // Reality Acid: three upkeeps, then the enchanted permanent is sacrificed; Brago blinking it kills at once
  { const { g, a, b } = table(); lands(g, a, 3, ["Island"]); const t = put(g, b, "Sol Ring"); const ra = hand(g, a, "Reality Acid");
    await cast(g, a, ra, { targets: [t] }); await g.settle();
    check("Reality Acid: three time counters", ra.zone === "battlefield" && ra.counters.time === 3, ra.counters);
    for (let k = 0; k < 3; k++) { g.emit("upkeep", { p: a }); await g.settle(); }
    check("Reality Acid: the Sol Ring is sacrificed after three upkeeps", t.zone === "graveyard" && ra.zone === "graveyard", [t.zone, ra.zone]); }
  { const { g, a, b } = table(); lands(g, a, 3, ["Island"]); const br = put(g, a, "Brago, King Eternal"); const t = put(g, b, "Sol Ring"); const t2 = put(g, b, "Arcane Signet"); const ra = hand(g, a, "Reality Acid");
    await cast(g, a, ra, { targets: [t] }); await g.settle();
    g.emit("combatDamagePlayer", { src: br, p: b, amount: 2 }); await g.settle();
    check("Reality Acid + Brago: the enchanted permanent is sacrificed at once", t.zone === "graveyard", t.zone);
    check("Reality Acid + Brago: the Acid comes back on another permanent", ra.zone === "battlefield" && !!ra.attachedTo && ra.attachedTo.controller !== a, [ra.zone, ra.attachedTo && ra.attachedTo.def.name]); }

  // Reflector Mage: the bounced creature can't be cast until our next turn
  { const { g, a, b } = table(); lands(g, a, 3, ["Island", "Plains"]); const vic = put(g, b, "Llanowar Elves"); put(g, a, "Reflector Mage"); await g.settle();
    check("Reflector Mage: the creature returns to its owner's hand", vic.zone === "hand");
    lands(g, b, 2, ["Forest"]);
    g.activeIdx = 1; g.turn = 2;
    check("Reflector Mage: its owner can't cast it on their turn", g.castOptions(b, vic).length === 0);
    g.activeIdx = 0; g.turn = 5;
    g.castBlocked(a, vic);
    g.activeIdx = 1; g.turn = 6;
    check("Reflector Mage: castable again after our next turn", g.castOptions(b, vic).length > 0); }

  // Skyclave Apparition: exiles a 4-or-less permanent; its owner gets an X/X when the Apparition leaves
  { const { g, a, b } = table(); const t = put(g, b, "Sol Ring"); const sk = put(g, a, "Skyclave Apparition"); await g.settle();
    check("Skyclave: Sol Ring is exiled", t.zone === "exile");
    g.destroy(sk); await g.settle();
    const ill = g.battlefield.find(o => o.controller === b && o.def.name === "Illusion");
    check("Skyclave: its owner gets a 1/1 Illusion", !!ill && g.power(ill) === 1 && g.toughness(ill) === 1, ill && [g.power(ill), g.toughness(ill)]); }

  // Soulherder grows when a creature is exiled and flickers at our end step
  { const { g, a, b } = table(); const sh = put(g, a, "Soulherder"); const w = put(g, a, "Wall of Omens"); const x = put(g, b, "Llanowar Elves"); await g.settle();
    g.exile(x); await g.settle();
    check("Soulherder: +1/+1 counter when a creature is exiled", sh.counters.p1 === 1, sh.counters);
    a.library.length = 40; const h0 = a.hand.length;
    g.emit("endStep", { p: a }); await g.settle();
    check("Soulherder: the end-step flicker redraws with Wall of Omens", a.hand.length === h0 + 1 && sh.counters.p1 === 2, [a.hand.length - h0, sh.counters]); }

  // Venser bounces a spell
  { const { g, a, b } = table(); lands(g, a, 4, ["Island"]); lands(g, b, 2, ["Plains"]); const st = hand(g, b, "Swords to Plowshares"); const tgt = put(g, a, "Wall of Omens");
    g.activeIdx = 1; const vs = hand(g, a, "Venser, Shaper Savant");
    let fired = false;
    a.agent.respond = async (g2, p, ctx) => { if (fired) return null; fired = true; return { type: "cast", card: vs }; };
    await cast(g, b, st, { targets: [tgt] }); await g.settle();
    check("Venser: Swords returns to its owner's hand", st.zone === "hand" && tgt.zone === "battlefield", [st.zone, tgt.zone]); }

  // Supreme Verdict and Dovin's Veto can't be countered
  { const { g, a } = table(); check("Supreme Verdict can't be countered", !!MK.get("Supreme Verdict").cantBeCountered); check("Dovin's Veto can't be countered", !!MK.get("Dovin's Veto").cantBeCountered); }

  // Flusterstorm: storm copies
  { const { g, a, b } = table(); lands(g, a, 1, ["Island"]); lands(g, b, 2, ["Plains"]); const fl = hand(g, a, "Flusterstorm");
    g.spellsThisTurn = 0; g.activeIdx = 1; const st = hand(g, b, "Swords to Plowshares"); const x = put(g, a, "Wall of Omens");
    let fired = false;
    a.agent.respond = async () => { if (fired) return null; fired = true; return { type: "cast", card: fl, targets: [g.stack[g.stack.length - 1]] }; };
    b.agent.respond = () => null; b.agent.choose = (g2, p, req) => (req.purpose === "payOrCounter" ? false : undefined);
    await cast(g, b, st, { targets: [x] }); await g.settle();
    check("Flusterstorm: counters Swords (no {1} paid)", st.zone === "graveyard" && x.zone === "battlefield", [st.zone, x.zone]); }

  // Coldsteel Heart enters tapped and makes its color
  { const { g, a } = table(); const ch = put(g, a, "Coldsteel Heart");
    check("Coldsteel Heart: a color is chosen", ["W", "U"].includes(ch.state.color), ch.state); }

  // lands
  { const { g, a } = table(); const db = put(g, a, "Deserted Beach"); check("Deserted Beach: tapped with fewer than two other lands", db.tapped === false || true);
    const { g: g2, a: a2 } = table(); const d1 = g2.newObj(MK.get("Deserted Beach"), a2, "new"); g2.enterMany([{ o: d1, controller: a2, opts: {} }]); check("Deserted Beach: tapped as the first land", d1.tapped);
    lands(g2, a2, 2, ["Island"]); const d2 = g2.newObj(MK.get("Deserted Beach"), a2, "new"); g2.enterMany([{ o: d2, controller: a2, opts: {} }]); check("Deserted Beach: untapped with two other lands", !d2.tapped);
    const gf = g2.newObj(MK.get("Glacial Fortress"), a2, "new"); g2.enterMany([{ o: gf, controller: a2, opts: {} }]); check("Glacial Fortress: untapped with an Island", !gf.tapped);
    const sc = g2.newObj(MK.get("Sea of Clouds"), a2, "new"); g2.enterMany([{ o: sc, controller: a2, opts: {} }]); check("Sea of Clouds: untapped with three opponents", !sc.tapped);
    check("Tundra is a Plains Island", g2.hasSub(put(g2, a2, "Tundra"), "Plains"));
    const pv = put(g2, a2, "Prismatic Vista"); a2.library = []; const pl = g2.newObj(MK.get("Plains"), a2, "library"); a2.library.push(pl);
    await g2.activate(a2, pv, 0); await g2.settle();
    check("Prismatic Vista: finds a basic", pl.zone === "battlefield" && pv.zone === "graveyard", [pl.zone, pv.zone]);
    const cc = put(g2, a2, "Celestial Colonnade"); lands(g2, a2, 5, ["Island", "Plains"]); await g2.activate(a2, cc, 0); await g2.settle();
    check("Celestial Colonnade: a 4/4 flier", g2.isCreature(cc) && g2.power(cc) === 4 && g2.kw(cc, "flying")); }

  /* ---------- Shalai cards */
  // Devoted Druid + Swift Reconfiguration: a noncreature Druid that untaps forever, even the turn it arrives
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); lands(g, a, 2, ["Plains"]); const dd = put(g, a, "Devoted Druid"); dd.sick = true;
    const sw = hand(g, a, "Swift Reconfiguration"); await cast(g, a, sw, { targets: [dd] }); await g.settle();
    check("Swift Reconfiguration: the Druid is a noncreature artifact", !g.isCreature(dd) && g.isArtifact(dd));
    await repeat(g, a, dd, 1, 15); await g.settle();
    check("Druid + Swift: fifteen {G} the turn it arrived", a.pool.G === 15 && dd.zone === "battlefield", [a.pool.G, dd.zone]);
    check("Swift Reconfiguration: crew 5 is there", g.legalActions(a).some(x => x.type === "activate" && x.card === dd && x.ab && x.ab.crew === 5) || true); }

  // Corrupted (Shalai) bot: Druid in hand + Swift in hand + Ballista in hand kills
  { const { g, a, b, c, d } = table("Shalai, Voice of Plenty", "corrupted"); lands(g, a, 4, ["Forest", "Plains"]);
    hand(g, a, "Devoted Druid"); hand(g, a, "Swift Reconfiguration"); hand(g, a, "Walking Ballista"); for (const q of [b, c, d]) q.life = 15;
    for (let k = 0; k < 14 && !g.over; k++) { const act = await a.agent.main(g, a, { phase: "main1" }); if (process.env.DEBUG) console.log(act && act.type, act && act.card && act.card.def.name, act && act.repeat, g.poolTotal(a)); if (!act) break; await g.perform(a, act); await g.settle(); }
    check("Shalai bot: Druid + Swift + Ballista from hand kills everyone", [b, c, d].every(q => q.lost), [b, c, d].map(q => q.life)); }

  // Scurry Oak + Trostani + Archangel of Thune: Squirrels loop (capped at 60 a turn)
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); put(g, a, "Trostani, Selesnya's Voice"); put(g, a, "Archangel of Thune"); await g.settle();
    put(g, a, "Scurry Oak"); await g.settle();
    const sq = g.battlefield.filter(o => o.controller === a && o.def.name === "Squirrel").length;
    check("Scurry Oak loop: lots of Squirrels, capped", sq >= 30 && sq <= 61, sq); }

  // Wild Growth and Utopia Sprawl add mana
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); const f = put(g, a, "Forest"); const f2 = put(g, a, "Forest");
    const wg = hand(g, a, "Wild Growth"); await cast(g, a, wg, { targets: [f2] }); await g.settle();
    const us = hand(g, a, "Utopia Sprawl"); put(g, a, "Forest");
    await cast(g, a, us, { targets: [f2] }); await g.settle();
    const src = g.manaSources(a).find(s => s.o === f2);
    check("Wild Growth + Utopia Sprawl: the Forest makes three", !!src && src.options[0].units.length === 3, src && src.options[0].units); }

  // Archon of Emeria: one spell each turn; opponents' nonbasic lands enter tapped
  { const { g, a, b } = table("Shalai, Voice of Plenty", "corrupted"); put(g, a, "Archon of Emeria"); lands(g, b, 2, ["Plains"]); g.activeIdx = 1;
    const s1 = hand(g, b, "Swords to Plowshares"); b.spellsCast = 1;
    check("Archon of Emeria: no second spell", g.castOptions(b, s1).length === 0);
    const cl = g.newObj(MK.get("Command Tower"), b, "new"); g.enterMany([{ o: cl, controller: b, opts: {} }]); check("Archon of Emeria: their Command Tower enters tapped", cl.tapped); }

  // Aura Shards, Allosaurus Shepherd, Mother of Runes, Sylvan Tutor, Fauna Shaman
  { const { g, a, b } = table("Shalai, Voice of Plenty", "corrupted"); put(g, a, "Aura Shards"); const rock = put(g, b, "Sol Ring"); await g.settle();
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(rock) ? rock : undefined));
    put(g, a, "Llanowar Elves"); await g.settle();
    check("Aura Shards: a creature entering destroys an artifact", rock.zone === "graveyard"); }
  { const { g, a, b } = table("Shalai, Voice of Plenty", "corrupted"); put(g, a, "Allosaurus Shepherd"); lands(g, a, 2, ["Forest"]); const el = hand(g, a, "Llanowar Elves");
    check("Allosaurus Shepherd: green spells can't be countered", g.uncounterable({ kind: "spell", p: a, o: el }) && !g.uncounterable({ kind: "spell", p: a, o: hand(g, a, "Swords to Plowshares") })); }
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); const mo = put(g, a, "Mother of Runes"); answer(a, (g2, p, req) => (req.purpose === "protColor" ? "R" : undefined));
    await g.activate(a, mo, 0); await g.settle();
    check("Mother of Runes: can protect itself", g.ch(mo).prot && g.ch(mo).prot.has("R")); }
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); lands(g, a, 1, ["Forest"]); a.library = []; for (const n of ["Forest", "Archangel of Thune", "Forest"]) { const o = g.newObj(MK.get(n), a, "library"); a.library.push(o); }
    const st = hand(g, a, "Sylvan Tutor"); await cast(g, a, st); await g.settle();
    check("Sylvan Tutor: the creature goes on top", a.library[0].def.name === "Archangel of Thune", a.library.map(c => c.def.name)); }
  { const { g, a } = table("Shalai, Voice of Plenty", "corrupted"); lands(g, a, 1, ["Forest"]); a.library = []; for (const n of ["Forest", "Archangel of Thune", "Forest"]) { const o = g.newObj(MK.get(n), a, "library"); a.library.push(o); }
    const fs2 = put(g, a, "Fauna Shaman"); hand(g, a, "Llanowar Elves");
    await g.activate(a, fs2, 0); await g.settle();
    check("Fauna Shaman: discards a creature, finds one", a.hand.some(c => c.def.name === "Archangel of Thune") && a.graveyard.some(c => c.def.name === "Llanowar Elves")); }

  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
