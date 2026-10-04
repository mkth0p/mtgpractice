#!/usr/bin/env node
/* Checks Corrupted Etrata's training module (miku/game/train-cetrata.js): every puzzle is solved by
   its scripted line in the real engine and is NOT solved by passing the turn, the drills generate
   valid questions, the mulligan evaluator runs, and the review rules read a recorded game.
   node tools/sim/test-train.js        (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
require(path.join(dir, "practice.js"));
require(path.join(dir, "train-cetrata.js"));
const MK = globalThis.MK, P = MK.Practice, T = MK.TRAIN["corrupted-etrata"];
const args = process.argv.slice(2);
const only = (() => { const i = args.indexOf("--only"); return i < 0 ? null : args[i + 1]; })();
const verbose = args.includes("--verbose");

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra).slice(0, 600));
}
const nm = o => o && o.def ? (o.cardDef || o.def).name : "";

/* A person who follows a puzzle's script; anything the script doesn't say, the helper bot answers. */
function scripted(steps) {
  const helper = MK.AI.create({ skill: 1 });
  const q = steps.slice();
  let cur = null;
  const takeChoice = (g, p, req) => {
    const s = cur || {};
    if (req.type === "confirm" && s.confirm !== undefined) return s.confirm;
    if (req.type === "number" && s.number !== undefined) return Math.max(req.min, Math.min(req.max, s.number));
    if (req.type === "option" && s.number !== undefined) { const o = req.options.find(x => x.id === s.number || String(x.label).startsWith(String(s.number))); if (o) return o.id; }
    if ((req.type === "target" || req.type === "player") && s.target) {
      const o = req.options.find(x => (x.name && x.name.includes(s.target)) || nm(x).includes(s.target));
      if (o) return o;
    }
    if (req.type === "cards" && s.choose) {
      const o = req.options.find(x => nm(x) === s.choose);
      if (o) return [o];
    }
    return helper.choose(g, p, req);
  };
  return {
    mulligan: () => true,
    main(g, p) {
      if (q.length && q[0].main) {
        const s = q[0];
        const acts = g.legalActions(p).filter(a => P.sayAction(g, p, a).startsWith(s.main));
        const a = acts[s.n || 0];
        if (verbose) console.log("   main:", s.main, "->", a ? P.sayAction(g, p, a) : "(none)", "| legal:", g.legalActions(p).map(x => P.sayAction(g, p, x)).join(" / "));
        if (a) { q.shift(); cur = s; return { type: a.type, card: a.card, idx: a.idx, alt: a.alt, faceDown: a.faceDown, door: a.door }; }
      }
      return { type: "pass" };
    },
    attack(g, p, ctx) {
      if (q.length && q[0].attack) {
        const s = q.shift(); cur = s;
        const opps = g.opponents(p);
        const out = [];
        for (const e of s.attack) {
          const [who, at] = Array.isArray(e) ? e : [e, null];
          const a = ctx.candidates.find(o => nm(o) === who && !out.some(d => d.attacker === o));
          const t = at ? opps.find(x => x.name.includes(at)) : opps[0];
          if (a && t) out.push({ attacker: a, target: t });
        }
        if (verbose) console.log("   attack:", out.map(d => nm(d.attacker) + "->" + d.target.name).join(", "));
        return out;
      }
      return [];
    },
    block: () => [],
    respond: () => null,
    choose: (g, p, req) => { const a = takeChoice(g, p, req); if (verbose) console.log("   choose:", req.type, req.prompt, "->", Array.isArray(a) ? a.map(nm) : a && a.name ? a.name : nm(a) || a); return a; }
  };
}
async function runPuzzle(pz, agent) {
  const pf = T.puzzleFor(pz);
  const players = pf.players(null);
  players[0].agent = agent;
  const g = new MK.Game({ seed: pf.seed, players, endOnHumanLoss: true, maxTurns: 40, setup: x => pf.setup(x), stopAtTurn: 1, round: pf.round, strict: false });
  g.activeIdx = 0;
  await g.play();
  return { g, me: g.players[0], ok: !!pz.check(g, g.players[0]) };
}

(async () => {
  // ---- puzzles
  for (const pz of T.PUZZLES) {
    if (only && pz.id !== only) continue;
    if (verbose) console.log("puzzle", pz.id);
    const r = await runPuzzle(pz, scripted(pz.script));
    check(`puzzle ${pz.id}: the scripted line solves it`, r.ok, r.g.logs.slice(-14).map(e => e.text));
    const idle = await runPuzzle(pz, scripted([]));
    check(`puzzle ${pz.id}: passing the turn doesn't`, !idle.ok);
    check(`puzzle ${pz.id}: has hints and a solution`, pz.hints.length >= 2 && pz.solution.length >= 1 && pz.lesson);
  }
  if (only) { console.log(`${passed} passed, ${failed} failed`); process.exit(failed ? 1 : 0); }
  // ---- drills
  const valid = q => q && q.options && q.options.length >= 2 && q.answer.length >= 1 && q.answer.every(i => i >= 0 && i < q.options.length) && q.explain && q.q;
  let lines = 0, live = 0, t0 = Date.now();
  for (let s = 1; s <= 40; s++) { const q = T.lineSpotter(s); if (q) { lines++; if (!q.answer.includes(4)) live++; check(`line spotter ${s}: valid`, valid(q), q); } }
  check("line spotter: most seeds make a question", lines >= 36, lines);
  check("line spotter: a mix of live and dead boards", live >= 10 && live <= 30, live);
  console.log(`line spotter: ${lines} questions, ${live} with a live line (${Date.now() - t0} ms)`);
  let tut = 0; t0 = Date.now();
  for (let s = 1; s <= 30; s++) { const q = T.tutorTarget(s); if (q) { tut++; check(`tutor target ${s}: valid`, valid(q) && q.options.length === 4 && new Set(q.options).size === 4, q); if (verbose) console.log(q.q, q.options, q.answer, q.explain); } }
  check("tutor target: most seeds make a question", tut >= 24, tut);
  console.log(`tutor target: ${tut} questions (${Date.now() - t0} ms)`);
  for (let s = 0; s < 24; s++) { const q = T.clockMath(s); check(`clock math ${s}: valid`, valid(q), q); }
  // ---- mulligans
  const adv = T.mulliganAdvice(T.dealHand(3), 0);
  check("mulligan advice", typeof adv.keep === "boolean" && adv.value >= 0 && adv.value <= 1 && adv.stats.w8 >= 0, adv);
  const noLands = ["Demonic Tutor", "Vampiric Tutor", "Exquisite Blood", "Counterspell", "Brainstorm", "Ponder", "Mindcrank"];
  check("mulligan: a no-land hand is shipped", !T.mulliganAdvice(noLands, 0).keep);
  const great = ["Island", "Swamp", "Watery Grave", "Sol Ring", "Exquisite Blood", "Marauding Blight-Priest", "Demonic Tutor"];
  check("mulligan: lands, Sol Ring and both vampire pieces is kept", T.mulliganAdvice(great, 0).keep, T.mulliganAdvice(great, 0));
  let keeps = 0; for (let s = 0; s < 60; s++) if (T.mulliganAdvice(T.dealHand(7000 + s), 0).keep) keeps++;
  console.log(`mulligan: keeps ${keeps} of 60 random first sevens`);
  check("mulligan: keeps a fair share of first sevens", keeps >= 12 && keeps <= 54, keeps);
  // ---- the review of a recorded game
  const pre = MK.BOT_DECKS.filter(d => (d.bracket || 4) < 4);
  for (let s = 1; s <= 3; s++) {
    const seats = [{ deck: "corrupted-etrata", name: "You" }].concat(pre.slice(s, s + 3).map(d => ({ deck: d.id, name: d.name, skill: 0.9, aggression: d.aggression })));
    const rec = P.newRecord({ deck: "corrupted-etrata", seed: 300 + s, hero: 0, seats });
    const g = P.buildGame(rec, (i, d, st) => i === 0 ? P.record(MK.AI.create({ skill: 0.7 }), { rec }) : MK.AI.create({ skill: st.skill, aggression: st.aggression }));
    await g.play();
    rec.result = { win: g.winner === g.players[0], rounds: g.round, turn: g.turn };
    rec.log = g.logs.map(e => [e.kind || "", e.p ? e.p.idx : -1, e.text]);
    const rv = T.review(rec);
    check(`review ${s}: runs`, rv && Array.isArray(rv.flags) && rv.stats && rv.ev, rv);
    check(`review ${s}: has evidence`, Object.values(rv.ev).some(e => e.n > 0), rv.ev);
    check(`review ${s}: moments carry the companion's read`, rec.moments.some(m => m.stage), rec.moments.slice(0, 3));
    const crit = T.criticalMoments(rec, rv, 4);
    check(`review ${s}: finds critical moments`, crit.length >= 1, crit);
    if (verbose || s === 1) console.log(`review ${s}: ${rv.flags.length} flags (${rv.flags.map(f => f.id).join(", ")}), stats ${JSON.stringify(rv.stats)}`);
  }
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
