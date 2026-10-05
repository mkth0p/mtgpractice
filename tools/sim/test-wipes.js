#!/usr/bin/env node
/* Checks that the bots see mass removal on the stack (engine 9) and answer it with protection that
   stops that kind of wipe: Toxic Deluge, Reiver Demon's trigger, Liliana's ultimate. Games recorded
   before engine 9 (legacyWipes) keep the old rule: only spells flagged ai.wipe.
   node tools/sim/test-wipes.js        (exits 1 if a check fails) */
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
/* A at seat 0 casts the wipe (its X answers come from `answers`); B is a bot that may respond. */
function table(opts) {
  opts = opts || {};
  const caster = {
    bot: false,
    choose: (g, p, req) => {
      if (opts.answers) { const a = opts.answers(req); if (a !== undefined) return a; }
      if (req.type === "confirm") return true;
      if (req.type === "target" || req.type === "player") return req.options[0] || null;
      if (req.type === "cards") return req.options.slice(0, req.min || 0);
      if (req.type === "option") return req.options[0] && req.options[0].id;
      return null;
    },
    respond: () => null, main: () => ({ type: "pass" }), attack: () => [], block: () => [], mulligan: () => true
  };
  const players = [{ name: "A", commander: "Trostani, Selesnya's Voice", list: Array(60).fill("Swamp"), agent: caster }];
  for (let i = 0; i < 3; i++) players.push({ name: "BCD"[i], commander: "Krenko, Mob Boss", list: Array(60).fill("Mountain"), agent: MK.AI.create({ skill: 1 }) });
  const g = new MK.Game({ seed: 5, players, strict: true, legacyWipes: !!opts.legacy });
  g.turn = 1; g.phase = "main1"; g.activeIdx = 0;
  for (const q of g.players.slice(2)) { q.agent.block = () => []; q.agent.respond = () => null; }
  return { g, a: g.players[0], b: g.players[1] };
}
function put(g, p, name) { const o = g.newObj(MK.get(name), p, "new"); g.enterMany([{ o, controller: p, opts: {} }]); o.sick = false; return o; }
function hand(g, p, name) { const o = g.newObj(MK.get(name), p, "hand"); p.hand.push(o); return o; }
function lands(g, p, name, n) { for (let i = 0; i < n; i++) put(g, p, name); }
const BOARD = ["Archangel of Thune", "Craterhoof Behemoth", "Llanowar Elves", "Avenger of Zendikar"];
function board(g, p) { return BOARD.map(n => put(g, p, n)); }

(async () => {
  // Toxic Deluge: Teferi's Protection answers it
  for (const legacy of [false, true]) {
    const { g, a, b } = table({ legacy, answers: req => (req.purpose === "delugeX" ? 6 : undefined) });
    lands(g, a, "Swamp", 3); lands(g, b, "Plains", 3);
    const mine = board(g, b); const tp = hand(g, b, "Teferi's Protection"); const td = hand(g, a, "Toxic Deluge"); await g.settle();
    await g.cast(a, td); await g.settle();
    if (!legacy) {
      check("protection answers Toxic Deluge: Teferi's Protection is cast", tp.zone === "exile", tp.zone);
      check("protection answers Toxic Deluge: the creatures live", mine.every(o => o.zone === "battlefield" || o.zone === "phased"), mine.map(o => o.zone));
    } else check("legacyWipes: Toxic Deluge isn't seen as a wipe", tp.zone === "hand", tp.zone);
  }
  // indestructible doesn't stop -X/-X: Heroic Intervention stays in hand
  { const { g, a, b } = table({ answers: req => (req.purpose === "delugeX" ? 6 : undefined) });
    lands(g, a, "Swamp", 3); lands(g, b, "Forest", 2);
    board(g, b); const hi = hand(g, b, "Heroic Intervention"); const td = hand(g, a, "Toxic Deluge"); await g.settle();
    await g.cast(a, td); await g.settle();
    check("Heroic Intervention isn't wasted on Toxic Deluge", hi.zone === "hand", hi.zone); }
  // a wipe on a trigger: Reiver Demon's enters trigger meets Heroic Intervention
  for (const legacy of [false, true]) {
    const { g, a, b } = table({ legacy });
    lands(g, a, "Swamp", 8); lands(g, b, "Forest", 2);
    const mine = board(g, b); const hi = hand(g, b, "Heroic Intervention"); const rd = hand(g, a, "Reiver Demon"); await g.settle();
    await g.cast(a, rd); await g.settle();
    if (!legacy) {
      check("protection answers Reiver Demon's trigger", hi.zone === "graveyard", hi.zone);
      check("Reiver Demon's trigger: the creatures live", mine.every(o => o.zone === "battlefield"), mine.map(o => o.zone));
    } else check("legacyWipes: Reiver Demon's trigger isn't seen as a wipe", hi.zone === "hand", hi.zone);
  }
  // the recognizer: what massHarm reads off the stack
  { const { g, a, b } = table(); const mine = board(g, b); await g.settle();
    const spell = name => ({ kind: "spell", o: g.newObj(MK.get(name), a, "stack"), p: a, targets: [], x: 0, alt: 0, mode: null });
    const H = top => MK.AI.massHarm(g, b, top);
    check("Toxic Deluge is mass removal (-X/-X)", (H(spell("Toxic Deluge")) || {}).kind === "minus");
    check("Wrath of God hits every creature", (H(spell("Wrath of God")) || {}).hit.length === mine.length);
    check("Evacuation is a mass bounce", (H(spell("Evacuation")) || {}).kind === "bounce");
    check("Cyclonic Rift is mass removal only when overloaded", !H(spell("Cyclonic Rift")) && !!H(Object.assign(spell("Cyclonic Rift"), { alt: 1 })));
    const crux = Object.assign(spell("Crux of Fate"), { mode: 1 });
    check("Crux of Fate on Dragons spares other creatures", !H(crux));
    check("Swords to Plowshares isn't mass removal", !H(spell("Swords to Plowshares")));
    const lili = put(g, a, "Liliana, Death's Majesty"); const ab = lili.def.abilities.find(x => /^−7/.test(x.label));
    check("Liliana's −7 is mass removal", !!H({ kind: "ability", o: lili, p: a, ab, targets: [] }));
    const cac = put(g, a, "Dread Cacodemon");
    check("Dread Cacodemon's trigger hits the opponents' creatures", (H({ kind: "trigger", o: cac, p: a, trig: { tr: cac.def.triggers[0], ev: {} }, targets: [] }) || {}).hit.length === mine.length);
    check("Dread Cacodemon's trigger spares its controller", !MK.AI.massHarm(g, a, { kind: "trigger", o: cac, p: a, trig: { tr: cac.def.triggers[0], ev: {} }, targets: [] }));
    const g2 = table({ legacy: true }).g;
    check("legacyWipes switches the new rule off", !MK.AI.newWipes(g2) && MK.AI.newWipes(g)); }

  console.log(`${passed} checks passed, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
})();
