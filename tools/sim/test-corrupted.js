#!/usr/bin/env node
/* Checks that the Corrupted Miku deck's combos, lock pieces and coach work in the game engine.
   node tools/sim/test-corrupted.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
require(path.join(dir, "checklist-corrupted.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}
/* Shalai against three players with Plains in their libraries. */
function table() {
  const players = [{ name: "Miku", commander: "Shalai, Voice of Plenty", list: Array(99).fill("Forest"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, n, kinds) { for (let i = 0; i < n; i++) put(g, p, (kinds || ["Forest", "Plains"])[i % (kinds || [0, 0]).length]); }
/* Answer p's choices with fn first (undefined: the bot decides). */
function answer(p, fn) { const base = p.agent.choose; p.agent.choose = (g, pl, req) => { const r = fn(g, pl, req); return r === undefined ? base.call(p.agent, g, pl, req) : r; }; }
const repeat = (g, p, o, idx, n) => g.perform(p, { type: "activate", card: o, idx, repeat: n });

(async () => {
  // Archangel of Thune + Spike Feeder: each loop gains 2 life and grows the team
  { const { g, a } = table(); put(g, a, "Archangel of Thune"); const sf = put(g, a, "Spike Feeder"); await g.settle();
    sf.counters.p1 = 2; const life = a.life;
    await repeat(g, a, sf, 1, 10); await g.settle();
    check("Thune + Feeder: ten loops gain 20 life", a.life === life + 20, a.life - life);
    check("Thune + Feeder: Feeder keeps its counters", (sf.counters.p1 || 0) >= 2, sf.counters); }

  // Heliod + Walking Ballista: the pings come back as counters
  { const { g, a, b } = table(); lands(g, a, 4, ["Plains"]); const he = put(g, a, "Heliod, Sun-Crowned"); const wb = put(g, a, "Walking Ballista"); wb.counters.p1 = 2; await g.settle(); b.agent.respond = () => null;
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(wb) ? wb : undefined));
    await g.activate(a, he, 0); await g.settle(); await g.settle();
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(b) ? b : undefined));
    const life = b.life;
    await repeat(g, a, wb, 1, 20); await g.settle();
    check("Heliod + Ballista: twenty pings hit the opponent", b.life === life - 20, life - b.life);
    check("Heliod + Ballista: Ballista survives", wb.zone === "battlefield" && (wb.counters.p1 || 0) >= 2, wb.counters); }

  // Devoted Druid + Vizier of Remedies: unlimited green mana
  { const { g, a } = table(); const dd = put(g, a, "Devoted Druid"); put(g, a, "Vizier of Remedies"); await g.settle();
    await repeat(g, a, dd, 1, 12); await g.settle();
    check("Druid + Vizier: twelve {G} in the pool", a.pool.G === 12, a.pool);
    check("Druid + Vizier: Druid has no -1/-1 counters", dd.zone === "battlefield" && !(dd.counters.m1 > 0), dd.counters); }
  { const { g, a } = table(); const dd = put(g, a, "Devoted Druid"); await g.settle();
    await repeat(g, a, dd, 1, 3); await g.settle();
    check("Druid alone dies on the second untap", dd.zone !== "battlefield"); }

  // Shalai gives your other creatures and you hexproof, but not herself
  { const { g, a, b } = table(); const sh = put(g, a, "Shalai, Voice of Plenty"); const el = put(g, a, "Llanowar Elves"); await g.settle();
    const opts = g.targetOptions(b, { kind: "creature" }, null);
    check("Shalai: opponents can't target your other creatures", !opts.includes(el));
    check("Shalai: she can be targeted", opts.includes(sh));
    check("Shalai: you can't be targeted", !g.targetOptions(b, { kind: "player" }, null).includes(a)); }

  // Grand Abolisher: opponents can't cast spells on your turn
  { const { g, a, b } = table(); put(g, a, "Grand Abolisher"); lands(g, b, 2, ["Plains"]); const st = hand(g, b, "Swords to Plowshares"); await g.settle();
    check("Abolisher: no spells for opponents on your turn", g.castOptions(b, st).length === 0);
    g.activeIdx = 1;
    check("Abolisher: they cast normally on their turn", g.castOptions(b, st).length > 0); }

  // Drannith Magistrate: opponents can't cast commanders
  { const { g, a, b } = table(); put(g, a, "Drannith Magistrate"); lands(g, b, 6, ["Plains"]); g.activeIdx = 1; g.phase = "main1"; await g.settle();
    check("Drannith: Trostani can't be cast from the command zone", g.castOptions(b, b.commanders[0]).length === 0); }

  // Silence
  { const { g, a, b } = table(); lands(g, a, 1, ["Plains"]); lands(g, b, 2, ["Plains"]); const si = hand(g, a, "Silence"); const st = hand(g, b, "Swords to Plowshares"); await g.settle();
    await g.cast(a, si); await g.settle();
    check("Silence: opponents can't cast spells this turn", g.castOptions(b, st).length === 0); }

  // Deafening Silence: one noncreature spell each turn, for you too
  { const { g, a } = table(); put(g, a, "Deafening Silence"); lands(g, a, 3, ["Plains"]); const s1 = hand(g, a, "Silence"), s2 = hand(g, a, "Swords to Plowshares"); put(g, a, "Llanowar Elves"); await g.settle();
    await g.cast(a, s1); await g.settle();
    check("Deafening Silence: your second noncreature spell is blocked", g.castOptions(a, s2).length === 0); }

  // Giver of Runes: protection from a color stops a targeted spell
  { const { g, a, b } = table(); const gv = put(g, a, "Giver of Runes"); const sh = put(g, a, "Shalai, Voice of Plenty"); await g.settle();
    answer(a, (g2, p, req) => (req.purpose === "protColor" ? "W" : undefined));
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(sh) ? sh : undefined));
    await g.activate(a, gv, 0); await g.settle();
    const st = hand(g, b, "Swords to Plowshares");
    check("Giver: Shalai with protection from white can't be targeted by Swords", !g.targetOptions(b, MK.get("Swords to Plowshares").spell.targets[0], st).includes(sh)); }

  // Teferi's Protection: life can't change, everything phases out
  { const { g, a, b } = table(); lands(g, a, 3, ["Plains"]); const el = put(g, a, "Llanowar Elves"); const tp = hand(g, a, "Teferi's Protection"); await g.settle();
    await g.cast(a, tp); await g.settle();
    g.damage(put(g, b, "Llanowar Elves"), a, 5);
    check("Teferi's Protection: no damage", a.life === 40, a.life);
    check("Teferi's Protection: your permanents phase out", el.zone !== "battlefield" || g.phased.includes(el));
    check("Teferi's Protection: it exiles itself", tp.zone === "exile", tp.zone); }

  // Kenrith's Transformation: the creature is a vanilla 3/3 Elk
  { const { g, a, b } = table(); lands(g, a, 2, ["Forest"]); const th = put(g, b, "Archangel of Thune"); const kt = hand(g, a, "Kenrith's Transformation"); await g.settle();
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(th) ? th : undefined));
    const n = a.hand.length;
    await g.cast(a, kt); await g.settle();
    check("Kenrith's: the target is a 3/3 Elk", g.power(th) === 3 && g.toughness(th) === 3 && !g.kw(th, "flying"), [g.power(th), g.toughness(th)]);
    check("Kenrith's: you draw a card", a.hand.length === n, a.hand.length - n); }

  // Esper Sentinel: the first noncreature spell each turn draws unless they pay
  { const { g, a, b } = table(); put(g, a, "Esper Sentinel"); g.activeIdx = 1; lands(g, b, 1, ["Plains"]); const st = hand(g, b, "Swords to Plowshares"); const sh = put(g, a, "Llanowar Elves"); await g.settle();
    b.agent.confirm = () => false; answer(b, (g2, p, req) => (req.type === "target" ? req.options[0] : undefined));
    const n = a.hand.length;
    await g.cast(b, st); await g.settle();
    check("Esper Sentinel draws when they don't pay", a.hand.length === n + 1, a.hand.length - n); }

  // Aven Mindcensor: an opponent searches only the top four
  { const { g, a, b } = table(); put(g, a, "Aven Mindcensor"); await g.settle();
    check("Mindcensor: four cards to search", g.librarySearch(b).length === 4, g.librarySearch(b).length);
    check("Mindcensor: you search your whole library", g.librarySearch(a).length === a.library.length); }

  // Boseiju channel: costs {1} less for each legendary creature
  { const { g, a, b } = table(); put(g, a, "Shalai, Voice of Plenty"); lands(g, a, 1, ["Forest"]); const bo = hand(g, a, "Boseiju, Who Endures"); const sr = put(g, b, "Sol Ring"); await g.settle();
    answer(a, (g2, p, req) => (req.type === "target" && req.options.includes(sr) ? sr : undefined));
    check("Boseiju: channel offered with one land and Shalai", g.canChannel(a, bo));
    await g.channel(a, bo); await g.settle();
    check("Boseiju: Sol Ring is destroyed", sr.zone !== "battlefield"); }

  // Cavern of Souls: the bot names its deck's main type
  { const { g, a } = table(); for (let i = 0; i < 5; i++) a.library.push(g.newObj(MK.get("Llanowar Elves"), a, "library")); const cv = put(g, a, "Cavern of Souls"); await g.settle();
    check("Cavern of Souls names Elf", cv.state.chosenType === "Elf", cv.state.chosenType); }

  // The coach: it sees the combo on board
  { const { g, a } = table(); put(g, a, "Archangel of Thune"); const sf = put(g, a, "Spike Feeder"); sf.counters.p1 = 2; await g.settle();
    const tips = MK.CORRUPTED_DECK.coach.tips(g, a);
    check("coach: Thune + Feeder is a win tip", tips[0] && tips[0].level === "win" && /Thune/.test(tips[0].title), tips.map(t => t.title)); }
  { const { g, a } = table(); put(g, a, "Devoted Druid"); hand(g, a, "Eladamri's Call"); await g.settle();
    const tips = MK.CORRUPTED_DECK.coach.tips(g, a);
    check("coach: tells you to find Vizier", tips.some(t => /Vizier/.test(t.title)), tips.map(t => t.title)); }

  // Vizier of Remedies + Spike Feeder is not a combo: Feeder's counters are +1/+1, Vizier only touches -1/-1
  { const { g, a } = table(); put(g, a, "Vizier of Remedies"); const sf = put(g, a, "Spike Feeder"); await g.settle(); sf.counters.p1 = 2; const life = a.life;
    const c = MK.CORRUPTED_DECK.coach.companion(g, a, { mode: "main" });
    check("companion: says Vizier + Feeder don't combo", c.steps.some(s => /don't combo/.test(s.text)), c.steps.map(s => s.text));
    check("coach: no win tip for Vizier + Feeder", !MK.CORRUPTED_DECK.coach.tips(g, a).some(t => t.level === "win"));
    await repeat(g, a, sf, 1, 5); await g.settle();
    check("Vizier + Feeder: only two loops (4 life), then Feeder dies with no counters", a.life === life + 4 && sf.zone !== "battlefield", [a.life - life, sf.zone]); }

  // The companion: one stage at a time
  const comp = (g, a, ctx) => MK.CORRUPTED_DECK.coach.companion(g, a, ctx);
  { const { g, a } = table(); const h = ["Forest", "Plains", "Sol Ring", "Devoted Druid", "Worldly Tutor", "Swords to Plowshares", "Llanowar Elves"].map(n => hand(g, a, n));
    const c = comp(g, a, { mode: "mulligan", hand: h });
    check("companion: a keep with mana, Druid and a tutor", c.keep === true && c.stage === "Opening hand", c.title); }
  { const { g, a } = table(); const h = ["Plains", "Plains", "Swords to Plowshares", "Silence", "Reprieve", "Path to Exile", "Giver of Runes"].map(n => hand(g, a, n));
    const c = comp(g, a, { mode: "mulligan", hand: h });
    check("companion: no green source is a mulligan", c.keep === false && /green/.test(c.title), c.title); }
  { const { g, a } = table(); lands(g, a, 1, ["Forest"]); hand(g, a, "Llanowar Elves"); hand(g, a, "Forest"); await g.settle();
    const c = comp(g, a, { mode: "main" });
    check("companion: early turns are the Ramp stage", c.stage === "Ramp" && c.steps.some(s => /land/i.test(s.text)), [c.stage, c.steps.map(s => s.text)]); }
  { const { g, a } = table(); lands(g, a, 6, ["Forest", "Plains"]); await g.settle();
    const c = comp(g, a, { mode: "main" });
    check("companion: with mana and no Shalai, get her out", c.stage === "Shield up" && c.steps.some(s => /Cast Shalai/.test(s.text)), [c.stage, c.steps.map(s => s.text)]); }
  { const { g, a } = table(); lands(g, a, 6, ["Forest", "Plains"]); put(g, a, "Shalai, Voice of Plenty"); put(g, a, "Devoted Druid"); hand(g, a, "Eladamri's Call"); await g.settle();
    const c = comp(g, a, { mode: "main" });
    check("companion: with Shalai out, tutor for Vizier", c.stage === "Assemble" && c.steps.some(s => /Vizier/.test(s.text) && /Eladamri/.test(s.text)), [c.stage, c.steps.map(s => s.text)]); }
  { const { g, a } = table(); put(g, a, "Archangel of Thune"); const sf = put(g, a, "Spike Feeder"); sf.counters.p1 = 2; await g.settle();
    const c = comp(g, a, { mode: "main" });
    check("companion: assembled combo is Go off and urgent", c.stage === "Go off" && c.urgent, [c.stage, c.urgent]); }
  { const { g, a, b } = table(); g.activeIdx = 1; const sh = put(g, a, "Shalai, Voice of Plenty"); put(g, a, "Giver of Runes");
    const top = { kind: "spell", p: b, o: g.newObj(MK.get("Swords to Plowshares"), b, "stack"), name: "Swords to Plowshares", targets: [sh] };
    const c = comp(g, a, { mode: "respond", window: "stack", top, can: ["Giver of Runes"] });
    check("companion: removal on Shalai says use Giver, and stops", c.urgent && c.steps.some(s => /Giver/.test(s.text)), c.steps.map(s => s.text)); }
  { const { g, a, b } = table(); g.activeIdx = 1;
    const wipe = [...MK.defs.values()].find(d => d.ai && d.ai.wipe);
    const top = { kind: "spell", p: b, o: g.newObj(wipe, b, "stack"), name: wipe.name, targets: [] };
    const c = comp(g, a, { mode: "respond", window: "stack", top, can: ["Teferi's Protection"] });
    check("companion: a wipe says Teferi's Protection", c.urgent && c.steps.some(s => /Teferi/.test(s.text)), c.steps.map(s => s.text)); }
  { const { g, a, b } = table(); put(g, a, "Devoted Druid"); put(g, a, "Llanowar Elves"); await g.settle();
    const c = comp(g, a, { mode: "attack", candidates: g.creatures(a) });
    check("companion: keep Druid home", c.steps.some(s => /Druid/.test(s.text) && /home/.test(s.text)), c.steps.map(s => s.text)); }
  { check("checklist is defined", !!(globalThis.MK_CHECKLISTS && globalThis.MK_CHECKLISTS.corrupted && globalThis.MK_CHECKLISTS.corrupted.length)); }

  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
