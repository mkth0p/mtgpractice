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
