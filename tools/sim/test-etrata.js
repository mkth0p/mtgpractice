#!/usr/bin/env node
/* Checks that the Etrata deck's combos and win conditions work in the game engine.
   node tools/sim/test-etrata.js        (exits 1 if a check fails) */
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
/* Etrata against three players with 60 Plains in their libraries. */
function table() {
  const players = [{ name: "Etrata", commander: "Etrata, Deadly Fugitive", list: Array(99).fill("Island"), agent: MK.AI.create({ skill: 1 }) }];
  for (let i = 0; i < 3; i++) players.push({ name: "P" + (i + 2), commander: "Trostani, Selesnya's Voice", list: Array(99).fill("Plains"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 3, players, strict: true });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(1)) { q.library.length = 60; q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1], c: g.players[2], d: g.players[3] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function lands(g, p, n) { for (let i = 0; i < n; i++) put(g, p, i % 2 ? "Island" : "Swamp"); }
async function attack(g, a, list) { a.agent.attack = () => list; await g.doCombat(a); await g.settle(); }
async function endStep(g, a) { g.phase = "end"; g.emit("endStep", { p: a }); g.runDelayed("endStep", a); await g.settle(); }

(async () => {
  // Duskmantle Guildmage + Mindcrank: one point of damage loops until they're dead
  { const { g, a, b } = table(); lands(g, a, 6); put(g, a, "Mindcrank"); const gm = put(g, a, "Duskmantle Guildmage"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    b.life = 40; b.library.length = 60;
    await g.activate(a, gm, 0); await g.settle();
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Guildmage + Mindcrank: one hit kills a 40-life opponent", b.lost || b.life <= 0, { life: b.life, lib: b.library.length }); }

  // Unstoppable Slasher + Wound Reflection
  { const { g, a, b } = table(); put(g, a, "Wound Reflection"); const sl = put(g, a, "Unstoppable Slasher"); await g.settle();
    await attack(g, a, [{ attacker: sl, target: b }]);
    check("Slasher halves their life", b.life === 19, b.life);
    await endStep(g, a);
    check("Wound Reflection finishes them at the end step", b.lost, b.life); }

  // Strixhaven Stadium at nine counters
  { const { g, a, b } = table(); const st = put(g, a, "Strixhaven Stadium"); const oc = put(g, a, "Changeling Outcast"); await g.settle(); st.counters.point = 9;
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Stadium's tenth counter makes them lose", b.lost); }

  // Ramses: an attacked player loses, and Etrata wins the game
  { const { g, a, b } = table(); put(g, a, "Ramses, Assassin Lord"); put(g, a, "Strixhaven Stadium").counters.point = 9; const oc = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: oc, target: b }]);
    check("Ramses wins when an Assassin-attacked player loses", g.over && g.winner === a, { over: g.over, winner: g.winner && g.winner.name }); }

  // Etrata, the Silencer: three hit counters
  { const { g, a, b } = table(); const si = put(g, a, "Etrata, the Silencer"); for (let i = 0; i < 3; i++) put(g, b, "Llanowar Elves"); await g.settle();
    for (const o of g.battlefield.filter(o => o.controller === b).slice(0, 2)) g.exileWithHit(o, si);
    await attack(g, a, [{ attacker: si, target: b }]);
    check("Silencer's third hit counter makes them lose", b.lost); }

  // Etrata's cloak trigger, then a type enabler makes the cloak an Assassin
  { const { g, a, b } = table(); put(g, a, "Etrata, Deadly Fugitive"); put(g, a, "Roshan, Hidden Magister"); const oc = put(g, a, "Changeling Outcast"); await g.settle();
    await attack(g, a, [{ attacker: oc, target: b }]);
    const fd = g.battlefield.filter(o => o.controller === a && o.faceDown);
    check("Etrata cloaks the top of their library", fd.length === 1, fd.length);
    check("Roshan makes the cloak an Assassin", fd[0] && MK.isAssassin(g, fd[0])); }

  // The bot: Silencer keeps hitting the player who already has hit counters
  { const { g, a, b, c } = table(); const si = put(g, a, "Etrata, the Silencer"); put(g, b, "Llanowar Elves"); put(g, c, "Llanowar Elves"); const x = put(g, c, "Llanowar Elves"); await g.settle();
    g.exileWithHit(x, si); g.exileWithHit(put(g, c, "Llanowar Elves"), si);
    const decl = a.agent.attack(g, a, { candidates: [si], targets: g.opponents(a) });
    check("bot: Silencer attacks the player with two hit counters", decl.length === 1 && decl[0].target === c, decl.map(d => d.target.name)); }

  // The bot: with Guildmage, Mindcrank and seven mana it runs the loop after combat
  { const { g, a, b } = table(); lands(g, a, 7); put(g, a, "Mindcrank"); put(g, a, "Duskmantle Guildmage"); await g.settle();
    b.life = 12; g.phase = "main2";
    for (let i = 0; i < 6 && !b.lost; i++) { const act = a.agent.main(g, a, { phase: "main2" }); if (!act || act.type !== "activate") break; await g.activate(a, act.card, act.idx); await g.settle(); }
    check("bot: Guildmage + Mindcrank loop kills the weakest opponent", b.lost, { life: b.life }); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
