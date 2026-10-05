#!/usr/bin/env node
/* Checks the rules the engine plays (engine version 2): abilities and triggers on the stack and the
   windows to respond to them, ward against abilities, the legend rule, commanders bounced to hand,
   extra and skipped turns, extra combats, regeneration, Sylvan Library and tap-creature costs.
   node tools/sim/test-rules.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
const MK = globalThis.MK;

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra));
}
/* A person at seat 0 whose answers come from `answers(req)`; bots elsewhere that never respond. */
function person(answers) {
  return {
    bot: false,
    choose: (g, p, req) => {
      const a = answers ? answers(req) : undefined;
      if (a !== undefined) return a;
      if (req.type === "confirm") return true;
      if (req.type === "target" || req.type === "player") return req.options[0] || null;
      if (req.type === "cards") return req.options.slice(0, req.min || 0);
      if (req.type === "number") return req.max;
      if (req.type === "option") return req.options[0] && req.options[0].id;
      return null;
    },
    respond: () => null, main: () => ({ type: "pass" }), attack: () => [], block: () => [], mulligan: () => true
  };
}
function table(opts) {
  opts = opts || {};
  const players = [{ name: "A", commander: opts.commander || "Trostani, Selesnya's Voice", list: Array(60).fill("Forest"), agent: opts.human ? person(opts.answers) : MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "BCD"[i], commander: "Krenko, Mob Boss", list: Array(60).fill("Mountain"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 5, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name, counters) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: { counters } }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, name, n) { for (let i = 0; i < n; i++) put(g, p, name); }
const ballistaIdx = o => o.def.abilities.findIndex(ab => ab.removeCounters);
/* A player only gets asked to respond when they could do something: a Plains and Swords to Plowshares. */
function armed(g, q) { put(g, q, "Plains"); hand(g, q, "Swords to Plowshares"); }

(async () => {
  // ---------------------------------------------------------------- the stack
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 2 }); armed(g, b); await g.settle();
    const seen = [];
    b.agent.respond = (g2, q, ctx) => { seen.push({ win: ctx.window, kind: ctx.top && ctx.top.kind, onStack: g2.stack.length, life: b.life }); return null; };
    await g.activate(a, wb, ballistaIdx(wb), { targets: [b] });
    check("an activated ability goes on the stack: the opponent gets an \"ability\" window", seen.some(s => s.win === "ability" && s.kind === "ability" && s.onStack === 1), seen);
    check("the ability resolves after the window", b.life === 39 && g.stack.length === 0, { life: b.life, stack: g.stack.length });
    check("the cost (a counter) is paid before anyone can respond", seen[0] && wb.counters.p1 === 1); }

  { const { g, a, b } = table(); put(g, a, "Soul Warden"); armed(g, b); await g.settle();
    const seen = [];
    b.agent.respond = (g2, q, ctx) => { seen.push(ctx.window + ":" + (ctx.top && ctx.top.kind)); return null; };
    const life = a.life;
    g.createToken(a, MK.T.soldier); await g.settle();
    check("a triggered ability goes on the stack and can be answered", seen.includes("ability:trigger"), seen);
    check("the trigger then resolves", a.life === life + 1, a.life); }

  // responding to an ability: its only target leaves, so it does nothing
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 1 }); const bear = put(g, b, "Soul Warden"); armed(g, b); await g.settle();
    b.agent.respond = (g2, q, ctx) => { if (ctx.window === "ability" && bear.zone === "battlefield") g2.bounce(bear); return null; };
    await g.activate(a, wb, ballistaIdx(wb), { targets: [bear] });
    check("an ability whose target is gone does nothing", g.logs.some(e => /no legal target left/.test(e.text)), g.logs.slice(-4).map(e => e.text)); }

  // mana abilities don't use the stack
  { const { g, a, b } = table(); const sk = put(g, a, "Skirk Prospector"); const gob = put(g, a, "Skirk Prospector"); await g.settle();
    let windows = 0; b.agent.respond = (g2, q, ctx) => { windows++; return null; };
    await g.activate(a, sk, 0, {});
    check("a mana ability resolves at once with no window", windows === 0 && a.pool.R === 1, { windows, R: a.pool.R });
    void gob; }

  // counterspells can't target abilities
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 2 }); armed(g, b); await g.settle();
    let opts = null;
    b.agent.respond = (g2, q, ctx) => { if (ctx.window === "ability") opts = g2.targetOptions(q, { kind: "spell" }, null); return null; };
    await g.activate(a, wb, ballistaIdx(wb), { targets: [b] });
    check("\"target spell\" doesn't offer an ability", Array.isArray(opts) && opts.length === 0, opts && opts.length); }

  // ---------------------------------------------------------------- ward
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 1 });
    const card = g.newObj(MK.get("Soul Warden"), b, "library"); b.library.unshift(card);
    const cloak = g.cloakTop(b); await g.settle();
    await g.activate(a, wb, ballistaIdx(wb), { targets: [cloak] });
    check("ward {2} counters an ability when its controller can't pay", cloak.zone === "battlefield" && cloak.damage === 0 && g.logs.some(e => /is countered/.test(e.text)), { zone: cloak.zone, dmg: cloak.damage }); }
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 1 }); lands(g, a, "Forest", 2);
    const card = g.newObj(MK.get("Soul Warden"), b, "library"); b.library.unshift(card);
    const cloak = g.cloakTop(b); await g.settle();
    await g.activate(a, wb, ballistaIdx(wb), { targets: [cloak] });
    check("paying ward lets the ability resolve", cloak.damage === 1 && g.controlled(a, o => o.tapped && g.isLand(o)).length === 2, { dmg: cloak.damage }); }
  { const { g, a, b } = table(); const wb = put(g, a, "Walking Ballista", { p1: 1 }); const v = put(g, b, "Soul Warden"); const reg = put(g, b, "Brotherhood Regalia"); reg.attachedTo = v; g.bump(); await g.settle();
    await g.activate(a, wb, ballistaIdx(wb), { targets: [v] });
    check("Brotherhood Regalia gives the equipped creature ward {2}", v.zone === "battlefield", v.zone); }

  // ---------------------------------------------------------------- legend rule
  { const { g, a } = table(); const old = put(g, a, "Rhys the Exiled"); const nw = put(g, a, "Rhys the Exiled"); await g.settle();
    check("legend rule: a bot keeps the newest", nw.zone === "battlefield" && old.zone === "graveyard", [old.zone, nw.zone]); }
  { let first = null;
    const { g, a } = table({ human: true, answers: req => (req.purpose === "legendKeep" ? first : undefined) });
    first = put(g, a, "Rhys the Exiled"); const nw = put(g, a, "Rhys the Exiled"); await g.settle();
    check("legend rule: a person chooses which one to keep", first.zone === "battlefield" && nw.zone === "graveyard", [first.zone, nw.zone]); }

  // ---------------------------------------------------------------- commanders
  { const { g, a } = table(); const cmd = a.commanders[0]; g.moveTo(cmd, "battlefield"); g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: a, opts: {} }]); await g.settle();
    g.bounce(cmd);
    check("a commander returned to hand stays in its owner's hand", cmd.zone === "hand" && a.hand.includes(cmd), cmd.zone);
    lands(g, a, "Forest", 3); lands(g, a, "Plains", 4);
    const before = a.cmdCasts[cmd.id] || 0;
    const ways = g.castOptions(a, cmd);
    check("cast from hand it costs no commander tax", ways.length && MK.util.costMV(ways[0].cost) === cmd.def.mv && (a.cmdCasts[cmd.id] || 0) === before, ways[0] && MK.costString(ways[0].cost));
    g.tuck(cmd, true);
    check("a commander put into a library goes to the command zone", cmd.zone === "command", cmd.zone); }

  // ---------------------------------------------------------------- turns
  async function turnOrder(setup, stopAt) {
    const { g, a, b, c, d } = table();
    const order = [];
    g.mulligans = async () => {};
    g.takeTurn = async (p, o) => { g.turn++; order.push(p.name + (o && o.extra ? "*" : "")); setup(g, p, order, { a, b, c, d }); if (order.length >= stopAt) g.end(null); };
    await g.play();
    return { order: order.join(" "), g };
  }
  { const r = await turnOrder((g, p, order) => { if (order.length === 1) g.addExtraTurn(p); }, 5);
    check("an extra turn comes right after this one, then the order resumes", r.order === "A A* B C D", r.order); }
  { const r = await turnOrder((g, p, order, s) => { if (order.length === 1) { g.addExtraTurn(s.c); } }, 5);
    check("an opponent's extra turn after A's turn, then B", r.order === "A C* B C D", r.order); }
  { const r = await turnOrder((g, p, order) => { if (order.length === 1) { g.addExtraTurn(p); g.addExtraTurn(p); } }, 5);
    check("two extra turns in a row", r.order === "A A* A* B C", r.order); }
  { const r = await turnOrder((g, p, order, s) => { if (order.length === 1) g.skipNextTurn(s.b); }, 4);
    check("a skipped turn is passed over", r.order === "A C D A", r.order);
    check("skipping logs it", r.g.logs.some(e => /skips their turn/.test(e.text))); }
  { const { g, a } = table(); const m = put(g, a, "Wormfang Manta"); await g.settle();
    check("Wormfang Manta cast or put in: you skip your next turn", a.skipTurns === 1, a.skipTurns);
    g.bounce(m); await g.settle();
    check("Wormfang Manta leaving: an extra turn", g.extraTurns.length === 1 && g.extraTurns[0].p === a); }
  { const { g, a } = table(); const card = g.newObj(MK.get("Wormfang Manta"), a, "library"); a.library.unshift(card);
    const fd = g.putFaceDown(a, [card], { kind: "manifest" })[0]; await g.settle();
    check("a manifested Manta skips nothing", !a.skipTurns, a.skipTurns);
    g.bounce(fd); await g.settle();
    check("a face-down Manta leaving gives no extra turn", g.extraTurns.length === 0);
    const card2 = g.newObj(MK.get("Wormfang Manta"), a, "library"); a.library.unshift(card2);
    const fd2 = g.putFaceDown(a, [card2], { kind: "manifest" })[0]; await g.settle();
    g.turnFaceUp(fd2); await g.settle();
    check("turning it face up isn't entering", !a.skipTurns);
    g.bounce(fd2); await g.settle();
    check("the face-up Manta leaving: an extra turn (the turn loop)", g.extraTurns.length === 1);
    check("nextPlayer sees the waiting extra turn", g.nextPlayer(a) === a); }

  // extra combat
  { const { g, a } = table(); put(g, a, "Soul Warden");
    let combats = 0; const orig = g.doCombat.bind(g);
    g.doCombat = async p => { combats++; if (combats === 1) g.addExtraCombat(p); return orig(p); };
    a.agent.main = () => ({ type: "pass" });
    g.turn = 0; await g.takeTurn(a);
    check("an additional combat phase happens", combats === 2, combats); }

  // ---------------------------------------------------------------- regeneration
  { const { g, a, b } = table(); const r = put(g, a, "Rhys the Exiled"); put(g, a, "Llanowar Elves"); lands(g, a, "Swamp", 1); await g.settle();
    await g.activate(a, r, 0, {}); await g.settle();
    check("Rhys's ability gives a regeneration shield (an Elf sacrificed)", r.state.regen && r.state.regen.n === 1 && g.creatures(a).length === 1);
    g.destroy(r); await g.settle();
    check("destroyed with a shield: it regenerates (tapped, stays)", r.zone === "battlefield" && r.tapped, r.zone);
    g.destroy(r); await g.settle();
    check("the shield is used up", r.zone !== "battlefield"); }
  { const { g, a, b } = table(); const r = put(g, a, "Rhys the Exiled"); g.regenerate(r); r.damage = 5; g.bump(); await g.settle();
    check("lethal damage uses the shield and the damage is removed", r.zone === "battlefield" && r.damage === 0, { zone: r.zone, dmg: r.damage }); }
  { const { g, a, b } = table(); const r = put(g, a, "Rhys the Exiled"); g.regenerate(r); lands(g, b, "Plains", 4);
    const w = hand(g, b, "Wrath of God"); g.activeIdx = 1; await g.cast(b, w);
    check("Wrath of God: \"can't be regenerated\"", r.zone !== "battlefield", r.zone); }
  { const { g, a } = table(); const hg = put(g, a, "Dimir House Guard"); put(g, a, "Soul Warden"); await g.settle();
    await g.activate(a, hg, 0, {}); await g.settle();
    check("Dimir House Guard regenerates by sacrificing a creature", hg.state.regen && hg.state.regen.n === 1); }

  // ---------------------------------------------------------------- Sylvan Library
  { const { g, a } = table({ human: true, answers: req => (req.purpose === "sylvanPay" ? (req.card.def.name === "Plains") : undefined) });
    a.library.length = 0;
    for (const n of ["Plains", "Island", "Swamp", "Forest", "Forest"]) { const o = g.newObj(MK.get(n), a, "library"); a.library.push(o); }
    put(g, a, "Sylvan Library"); await g.settle();
    a.drawnThisTurn = []; g.draw(a, 1);                    // the draw step's card: Plains
    a.life = 40; g.emit("drawStep", { p: a }); await g.settle();
    check("Sylvan Library: pays 4 life for one card", a.life === 36, a.life);
    check("Sylvan Library: the other goes back on top", a.library[0].def.name !== "Plains" && a.hand.length === 2, { top: a.library[0].def.name, hand: a.hand.map(o => o.def.name) }); }
  { const { g, a } = table({ human: true, answers: req => (req.purpose === "sylvanPay" ? false : undefined) });
    put(g, a, "Sylvan Library"); await g.settle();
    const n = a.library.length; a.life = 40; g.emit("drawStep", { p: a }); await g.settle();
    check("Sylvan Library: declining to pay puts both back", a.life === 40 && a.library.length === n && a.hand.length === 0, { life: a.life, hand: a.hand.length }); }
  { const { g, a } = table({ human: true, answers: req => (req.purpose === "sylvanDraw" ? false : undefined) });
    put(g, a, "Sylvan Library"); await g.settle();
    const n = a.library.length; g.emit("drawStep", { p: a }); await g.settle();
    check("Sylvan Library is a \"may\"", a.library.length === n); }

  // ---------------------------------------------------------------- tap-creature costs
  { const { g, a, b } = table({ commander: "Lathril, Blade of the Elves" });
    const lath = put(g, a, "Lathril, Blade of the Elves");
    for (let i = 0; i < 10; i++) put(g, a, "Llanowar Elves");
    armed(g, b); await g.settle();
    let tappedAtWindow = -1;
    b.agent.respond = (g2, q, ctx) => { if (ctx.window === "ability" && tappedAtWindow < 0) tappedAtWindow = g2.creatures(a).filter(c => c.tapped && c !== lath).length; return null; };
    const life = b.life;
    await g.activate(a, lath, 0, {});
    check("Lathril: the ten Elves are tapped as a cost, before anyone responds", tappedAtWindow === 10, tappedAtWindow);
    check("Lathril: each opponent loses 10", b.life === life - 10, b.life); }

  // ---------------------------------------------------------------- Willbender on an ability
  { const { g, a, b, c } = table(); const wb = put(g, a, "Walking Ballista", { p1: 1 });
    const wcard = g.newObj(MK.get("Willbender"), b, "library"); b.library.unshift(wcard);
    const fd = g.putFaceDown(b, [wcard], { kind: "morph" })[0]; lands(g, b, "Island", 2); await g.settle();
    b.agent.respond = (g2, q, ctx) => (ctx.window === "ability" && fd.faceDown ? { type: "activate", card: fd, idx: fd.def.abilities.findIndex(x => x.morph || /morph/.test(x.label)) } : null);
    b.agent.choose = (g2, q, req) => (req.purpose === "redirect" ? req.options[0] : req.purpose === "willbenderNew" ? (req.options.includes(c) ? c : req.options[0]) : req.type === "confirm" ? true : req.options ? req.options[0] : null);
    const lifeB = b.life, lifeC = c.life;
    await g.activate(a, wb, ballistaIdx(wb), { targets: [b] });
    check("Willbender redirects an activated ability", b.life === lifeB && c.life === lifeC - 1, { b: b.life, c: c.life }); }

  // ---------------------------------------------------------------- the declare-attackers window
  { const { g, a, b } = table(); const sw = put(g, a, "Soul Warden"); armed(g, b); await g.settle();
    const wins = [];
    b.agent.respond = (g2, q, ctx) => { wins.push(ctx.window); return null; };
    a.agent.attack = () => [{ attacker: sw, target: b }];
    g.phase = "main1"; await g.doCombat(a);
    check("defenders get a window after attackers are declared", wins.includes("attackers"), wins); }

  // phasing out everything (Teferi's Protection) moves an attached Equipment once
  { const { g, a } = table(); const c = put(g, a, "Soul Warden"); const clamp = put(g, a, "Skullclamp"); clamp.attachedTo = c; g.bump();
    g.phaseOut(g.controlled(a)); g.phaseIn(a);
    check("phasing out a creature and its Equipment together doesn't copy the Equipment", g.battlefield.filter(o => o === clamp).length === 1, g.battlefield.filter(o => o === clamp).length); }

  // ---------------------------------------------------------------- priority in every step (engine 5)
  { const { g, a, b } = table({ human: true }); const sw = put(g, a, "Soul Warden"); armed(g, a); armed(g, b); await g.settle();
    const seen = [];
    const rec = who => (g2, q, ctx) => { seen.push({ who, win: ctx.window, hand: a.hand.length, phase: g2.phase }); return null; };
    a.agent.respond = rec("A"); b.agent.respond = rec("B");
    a.agent.attack = () => [{ attacker: sw, target: b }];
    const hand0 = a.hand.length;
    g.turn = 0; await g.takeTurn(a);
    const wins = w => seen.filter(s => s.win === w).map(s => s.who).join("");
    check("upkeep: the active player, then the others get priority", wins("upkeep") === "AB", seen.map(s => s.who + ":" + s.win));
    check("upkeep priority comes before the draw", (seen.find(s => s.win === "upkeep") || {}).hand === hand0, seen.find(s => s.win === "upkeep"));
    check("draw step: priority after the card is drawn", wins("draw") === "AB" && (seen.find(s => s.win === "draw") || {}).hand === hand0 + 1, seen.filter(s => s.win === "draw"));
    check("beginning of combat: priority before attackers", wins("beginCombat") === "AB" && seen.findIndex(s => s.win === "beginCombat") < seen.findIndex(s => s.win === "attackers"), seen.map(s => s.who + ":" + s.win));
    check("combat damage step: priority after damage", wins("damage") === "AB" && seen.findIndex(s => s.win === "damage") > seen.findIndex(s => s.win === "combat"));
    check("end of combat: priority", wins("endCombat") === "AB" && seen.findIndex(s => s.win === "endCombat") > seen.findIndex(s => s.win === "damage")); }

  // an instant in the opponent's upkeep removes the creature before it can attack; at beginning of combat too
  { const { g, a, b } = table(); const sw = put(g, a, "Soul Warden"); armed(g, b); await g.settle();
    b.agent.respond = (g2, q, ctx) => { if (ctx.window !== "beginCombat" || sw.zone !== "battlefield") return null; const s = ctx.actions.find(x => x.type === "cast" && x.card.def.name === "Swords to Plowshares"); return s ? { type: "cast", card: s.card, targets: [sw] } : null; };
    let asked = 0; a.agent.attack = (g2, p, ctx) => { asked++; return ctx.candidates.map(c => ({ attacker: c, target: b })); };
    const life = b.life;
    await g.doCombat(a);
    check("Swords to Plowshares at beginning of combat: the creature never attacks", sw.zone === "exile" && asked === 0 && b.life === life, { zone: sw.zone, asked, life: b.life }); }

  // the end of combat step happens without attackers (508.8)
  { const { g, a } = table(); await g.settle();
    const evs = []; const emit = g.emit.bind(g); g.emit = (t, ev) => { evs.push(t); return emit(t, ev); };
    await g.doCombat(a);
    check("with nothing to attack, beginning and end of combat still happen", evs.includes("beginCombat") && evs.includes("endCombat") && !g.combat, evs); }
  { const { g, a } = table({ human: true }); put(g, a, "Soul Warden"); await g.settle();
    const evs = []; const emit = g.emit.bind(g); g.emit = (t, ev) => { evs.push(t); return emit(t, ev); };
    let asked = 0; a.agent.attack = () => { asked++; return []; };
    a.agent.main = (g2) => ({ type: "pass", skipCombat: g2.phase === "main1" });
    g.turn = 0; await g.takeTurn(a);
    check("\"End the turn\" in main 1 still has a combat phase (beginning of combat triggers), with no attack", evs.includes("beginCombat") && evs.includes("endCombat") && asked === 0, { evs: evs.filter(e => /Combat/.test(e)), asked }); }

  // ---------------------------------------------------------------- combat damage
  async function fight(opts) {
    const { g, a, b } = table({ human: !!opts.answer, answers: req => (req.purpose === "combatDamage" ? opts.answer(req) : undefined) });
    const atk = put(g, a, "Elvish Spirit Guide");
    g.pump(atk, opts.power - 2, opts.power - 2, opts.kws || null);
    const blockers = (opts.blockers || []).map(t => { const o = put(g, b, "Elvish Spirit Guide"); if (t !== 2) g.pump(o, t - 2, t - 2); return o; });
    armed(g, b); await g.settle();
    const asked = [];
    if (opts.answer) { const ch = a.agent.choose; a.agent.choose = (g2, p, req) => { if (req.purpose === "combatDamage") asked.push(req); return ch(g2, p, req); }; }
    a.agent.attack = () => [{ attacker: atk, target: opts.at ? opts.at(g, b) : b }];
    b.agent.block = (g2, q, ctx) => blockers.map(o => ({ blocker: o, attacker: atk }));
    b.agent.respond = (g2, q, ctx) => (opts.respond ? opts.respond(g2, ctx, { atk, blockers }) : null);
    const life = b.life;
    await g.doCombat(a);
    return { g, a, b, atk, blockers, lost: life - b.life, asked };
  }
  { const r = await fight({ power: 5, blockers: [2, 2], answer: req => { const m = {}; m[req.options[0].id] = 5; return m; } });
    check("a person divides damage among blockers: all 5 on one 2/2", r.asked.length === 1 && r.blockers[0].zone !== "battlefield" && r.blockers[1].zone === "battlefield", r.blockers.map(o => o.zone)); }
  { const r = await fight({ power: 6, kws: ["trample"], blockers: [2, 2], answer: req => { const m = {}; m[req.options[0].id] = 1; m[req.options[1].id] = 1; return m; } });
    check("with trample a person's split is topped up to lethal for each blocker before the player", r.blockers.every(o => o.zone !== "battlefield") && r.lost === 2, { zones: r.blockers.map(o => o.zone), lost: r.lost }); }
  { const r = await fight({ power: 6, kws: ["trample"], blockers: [2, 2], answer: req => { const m = {}; m[req.options[0].id] = 4; return m; } });
    check("with trample a person may put more than lethal on a blocker", r.lost === 0 && r.blockers.every(o => o.zone !== "battlefield"), { lost: r.lost }); }
  { const r = await fight({ power: 5, blockers: [2], answer: () => ({}) });
    check("one blocker: no question, it takes all the damage", r.asked.length === 0 && r.blockers[0].zone !== "battlefield" && r.lost === 0); }
  { const r = await fight({ power: 5, kws: ["trample", "deathtouch"], blockers: [3, 3] });
    check("deathtouch and trample (bot): 1 to each blocker, the rest to the player", r.lost === 3 && r.blockers.every(o => o.zone !== "battlefield"), { lost: r.lost }); }
  { const r = await fight({ power: 7, kws: ["trample"], blockers: [2, 4] });
    check("trample (bot): lethal to each blocker, then the rest to the player", r.lost === 1 && r.blockers.every(o => o.zone !== "battlefield"), { lost: r.lost, z: r.blockers.map(o => o.zone) }); }
  { const r = await fight({ power: 5, kws: ["trample"], blockers: [2, 4] });
    check("trample (bot) short of lethal for all: nothing tramples over", r.lost === 0 && r.blockers[0].zone !== "battlefield" && r.blockers[1].damage === 3, { lost: r.lost, z: r.blockers.map(o => o.zone) }); }
  { const r = await fight({ power: 4, blockers: [2], respond: (g2, ctx, s) => { if (ctx.window === "combat" && s.blockers[0].zone === "battlefield") g2.bounce(s.blockers[0]); return null; } });
    check("a blocked attacker whose blocker left deals no damage", r.lost === 0 && r.atk.zone === "battlefield", r.lost); }
  { const r = await fight({ power: 4, kws: ["trample"], blockers: [2], respond: (g2, ctx, s) => { if (ctx.window === "combat" && s.blockers[0].zone === "battlefield") g2.bounce(s.blockers[0]); return null; } });
    check("with trample it deals all its damage to the player", r.lost === 4, r.lost); }
  { const r = await fight({ power: 3, kws: ["first strike"], blockers: [2] });
    check("first strike: the blocker dies before it deals damage", r.blockers[0].zone !== "battlefield" && r.atk.damage === 0 && r.atk.zone === "battlefield"); }
  { const r = await fight({ power: 2, kws: ["double strike"], blockers: [] });
    check("double strike unblocked: damage in both steps", r.lost === 4, r.lost); }
  { const r = await fight({ power: 2, kws: ["first strike"], blockers: [], respond: (g2, ctx, s) => { if (ctx.window === "damage" && !s.atk.state.ds) { s.atk.state.ds = 1; g2.grant(s.atk, ["double strike"]); } return null; } });
    check("gaining double strike after the first-strike step: it deals damage again", r.lost === 4, r.lost); }
  { const r = await fight({ power: 3, blockers: [3], respond: (g2, ctx, s) => { if (ctx.window === "combat" && !s.atk.state.fs) { s.atk.state.fs = 1; g2.grant(s.blockers[0], ["first strike"]); } return null; } });
    check("a blocker given first strike after blocks strikes first", r.atk.zone !== "battlefield" && r.blockers[0].zone === "battlefield" && r.blockers[0].damage === 0, { atk: r.atk.zone, blk: r.blockers[0].zone }); }
  // first strike "until end of combat" in the first combat: the creature still deals damage in a second combat that turn
  { const { g, a, b } = table(); const atk = put(g, a, "Elvish Spirit Guide"); await g.settle();
    a.agent.attack = () => (atk.tapped ? [] : [{ attacker: atk, target: b }]);
    g.grant(atk, ["first strike"], { until: "eoc" });
    const l0 = b.life; await g.doCombat(a); const l1 = b.life;
    atk.tapped = false; await g.doCombat(a);
    check("a creature that struck first in an earlier combat deals damage in a later one", l0 - l1 === 2 && l1 - b.life === 2, { first: l0 - l1, second: l1 - b.life }); }
  // planeswalkers and commander damage
  { const { g, a, b } = table(); const atk = put(g, a, "Elvish Spirit Guide"); const pw = put(g, b, "Sorin, Imperious Bloodlord"); await g.settle();
    a.agent.attack = () => [{ attacker: atk, target: pw }];
    const life = b.life, loy = pw.counters.loyalty; await g.doCombat(a);
    check("combat damage to a planeswalker removes loyalty, not life", pw.counters.loyalty === loy - 2 && b.life === life, { loy: pw.counters.loyalty, life: b.life }); }
  { const { g, a, b } = table(); const cmd = a.commanders[0]; g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: a, opts: {} }]); cmd.sick = false; await g.settle();
    a.agent.attack = () => [{ attacker: cmd, target: b }];
    await g.doCombat(a);
    g.damage(cmd, b, 3);
    check("commander damage counts combat damage only", b.cmdDmg[cmd.id] === g.power(cmd), b.cmdDmg); }

  // ---------------------------------------------------------------- copies skip non-copy overlays
  /* Liliana returns a Dragon "as a black Zombie in addition to its other types"; Miirym copies it.
     That Zombie overlay isn't a copiable value (706.2): the token is a plain Goldspan Dragon. The
     overlay's type line used to be a getter, and Miirym's "except" assigning type threw. */
  { const { g, a } = table(); put(g, a, "Miirym, Sentinel Wyrm"); const lil = put(g, a, "Liliana, Death's Majesty", { loyalty: 5 });
    const gd = g.newObj(MK.get("Goldspan Dragon"), a, "graveyard"); a.graveyard.push(gd); await g.settle();
    let err = null;
    try { await g.activate(a, lil, lil.def.abilities.findIndex(ab => ab.loyalty === -3), { targets: [gd] }); await g.settle(); } catch (e) { err = String(e && e.message || e); }
    const tok = g.battlefield.find(o => o.isToken && o.def.name === "Goldspan Dragon");
    check("Miirym copies a Dragon Liliana returned as a Zombie without an engine error", !err && gd.zone === "battlefield" && !!tok, { err, zone: gd.zone });
    check("the returned Dragon is a black Zombie; Miirym's token copy of it is neither", g.hasSub(gd, "Zombie") && gd.def.colors.includes("B") && !!tok && !g.hasSub(tok, "Zombie") && !tok.def.colors.includes("B") && !/Zombie/.test(tok.def.type), tok && { type: tok.def.type, colors: tok.def.colors }); }

  // ---------------------------------------------------------------- bot games stay clean
  { let errs = 0, done = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const decks = [MK.CETRATA_DECK].concat(MK.BOT_DECKS.filter(d => d.bracket === 4).slice(0, 3));
      const players = decks.map(d => ({ name: d.name, commander: d.commander, list: d.list, identity: d.identity, agent: MK.AI.create({ skill: 1 }) }));
      const g = new MK.Game({ seed, players });
      try { await g.play(); done++; } catch (e) { errs++; console.log(e); }
      errs += g.errors || 0;
    }
    check("six bot games finish with no engine errors", errs === 0 && done === 6, { errs, done }); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
})();
