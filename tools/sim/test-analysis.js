#!/usr/bin/env node
/* Checks the game analysis engine (miku/game/analysis.js) on recorded bot games: the quick pass runs
   on every decision, the deep pass on the worst ones, the summary adds up, and the same analysis
   twice gives the same numbers. Prints timings.
   node tools/sim/test-analysis.js [--games 2] [--seed 1] [--person bot|random] [--verbose] */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
for (const f of ["practice.js", "train-cetrata.js", "value.js", "analysis.js"]) require(path.join(dir, f));
const MK = globalThis.MK, P = MK.Practice, A = MK.Analysis;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const GAMES = +opt("games", 2), SEED = +opt("seed", 1), PERSON = opt("person", "bot"), VERBOSE = !!opt("verbose", false);

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra).slice(0, 400));
}
/* A person who taps something legal at random (the analysis should find many mistakes). */
function randomAgent(seed) {
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
  const bot = MK.AI.create({ skill: 1 });
  return Object.assign({}, bot, {
    main: async (g, p, ctx) => { const acts = g.legalActions(p); return rnd() < 0.35 || !acts.length ? { type: "pass" } : acts[Math.floor(rnd() * acts.length)]; },
    attack: async (g, p, ctx) => (ctx.candidates || []).filter(() => rnd() < 0.5).map(o => ({ attacker: o, target: g.players.filter(q => q !== p && !q.lost)[0] })),
    respond: async (g, p, ctx) => rnd() < 0.8 ? null : ((ctx.actions || []).filter(a => a.type === "cast")[0] || null)
  });
}
async function recordGame(seed) {
  const precons = MK.BOT_DECKS.filter(d => (d.bracket || 4) < 4);
  const seats = [{ deck: "corrupted-etrata", name: "You" }];
  for (let k = 0; k < 3; k++) { const d = precons[(seed * 3 + k) % precons.length]; seats.push({ deck: d.id, name: d.name, skill: 0.9, aggression: d.aggression }); }
  const rec = P.newRecord({ deck: "corrupted-etrata", seed: 2000 + seed, hero: 0, seats });
  const person = PERSON === "random" ? randomAgent(seed) : MK.AI.create({ skill: 0.8 });
  const g = P.buildGame(rec, (i, d, s) => i === 0 ? P.record(person, { rec }) : MK.AI.create({ skill: s.skill, aggression: s.aggression }));
  await g.play();
  rec.result = { win: g.winner === g.players[0], rounds: g.round };
  return rec;
}

(async () => {
  check("value model present", !!MK.Value);
  for (let s = SEED; s < SEED + GAMES; s++) {
    const rec = await recordGame(s);
    const ms = rec.moments.filter(m => !m.replayed);
    let t = Date.now();
    const quick = {};
    for (const m of ms) quick[m.i] = await A.quick(rec, m.i);
    const tq = Date.now() - t;
    const errs = Object.values(quick).filter(q => q.error);
    check(`game ${s}: quick pass ran on every decision`, errs.length === 0, errs.slice(0, 3));
    const sum0 = A.summarize(rec, quick, {});
    t = Date.now();
    const deep = {};
    for (const i of sum0.worst.slice(0, 2).concat(ms.slice(0, 1).map(m => m.i))) deep[i] = await A.deep(rec, i);
    const td = Date.now() - t;
    const derrs = Object.values(deep).filter(d => d.error);
    check(`game ${s}: deep pass ran`, derrs.length === 0, derrs);
    const sum = A.summarize(rec, quick, deep);
    check(`game ${s}: summary covers the decisions`, sum.n === ms.length, { n: sum.n, ms: ms.length });
    check(`game ${s}: accuracy in range`, sum.accuracy >= 0 && sum.accuracy <= 100, sum.accuracy);
    check(`game ${s}: skill + luck = result - start`, sum.start == null || Math.abs(sum.start + sum.skill + sum.luck - sum.end) < 0.003, sum);
    // the same analysis twice gives the same numbers (it's all seeded)
    const i0 = ms[Math.floor(ms.length / 2)].i;
    const again = await A.quick(rec, i0);
    check(`game ${s}: quick pass is repeatable`, JSON.stringify({ ...again, ms: 0 }) === JSON.stringify({ ...quick[i0], ms: 0 }), [again, quick[i0]]);
    console.log(`game ${s} (${PERSON}): ${rec.result.win ? "won" : "lost"} in ${rec.result.rounds} rounds; ${ms.length} decisions; quick ${tq} ms (${(tq / ms.length).toFixed(0)} per decision), deep ${td} ms for ${Object.keys(deep).length}`);
    console.log(`  accuracy ${sum.accuracy}%, avg loss ${sum.avgLoss} pts, ${JSON.stringify(sum.counts)}; start ${sum.start}, decisions ${sum.skill}, luck ${sum.luck}; passive ${sum.dirs.passive}, rushed ${sum.dirs.rushed}`);
    if (VERBOSE) for (const d of Object.values(deep)) console.log("  deep", d.i, d.kind, "R" + d.round, "best", d.best, "mine", d.mine, "loss", d.loss, "±", d.se, d.spent, "playouts,", d.ms, "ms", JSON.stringify(d.why || []).slice(0, 300), d.lines ? d.lines.best.log.slice(0, 4).map(l => l.t).join(" / ") : "");
  }
  console.log(`${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
