#!/usr/bin/env node
/* Anchors the analysis engine's accuracy scale: records games played by a person who taps legal
   options at random and by the bot, runs the quick pass on every decision, and prints each one's
   average accuracy. With --write, stores them as MK.Analysis.ANCHORS (the report's strength scale
   puts random play at 0 and the bot at 100).
   node tools/sim/calibrate-analysis.js [--games 8] [--threads 4] [--write] */
"use strict";
const path = require("path"), fs = require("fs");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const dir = path.join(__dirname, "../../miku/game");

function boot() {
  require(path.join(dir, "engine.js"));
  require(path.join(dir, "cards-miku.js"));
  for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
  require(path.join(dir, "ai.js"));
  for (const f of ["practice.js", "train-cetrata.js", "value.js", "analysis.js"]) require(path.join(dir, f));
  return globalThis.MK;
}
function randomAgent(MK, seed) {
  let s = seed >>> 0;
  const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
  const bot = MK.AI.create({ skill: 1 });
  return Object.assign({}, bot, {
    main: async (g, p) => { const acts = g.legalActions(p); return rnd() < 0.35 || !acts.length ? { type: "pass" } : acts[Math.floor(rnd() * acts.length)]; },
    attack: async (g, p, ctx) => (ctx.candidates || []).filter(() => rnd() < 0.5).map(o => ({ attacker: o, target: g.players.filter(q => q !== p && !q.lost)[0] })),
    respond: async (g, p, ctx) => rnd() < 0.8 ? null : ((ctx.actions || []).filter(a => a.type === "cast")[0] || null)
  });
}
async function analyzeOne(MK, person, seed) {
  const P = MK.Practice, A = MK.Analysis;
  const precons = MK.BOT_DECKS.filter(d => (d.bracket || 4) < 4);
  const seats = [{ deck: "corrupted-etrata", name: "You" }];
  for (let k = 0; k < 3; k++) { const d = precons[(seed * 3 + k) % precons.length]; seats.push({ deck: d.id, name: d.name, skill: 0.9, aggression: d.aggression, casual: (d.bracket || 4) <= 2 }); }
  const rec = P.newRecord({ deck: "corrupted-etrata", seed: 7000 + seed, hero: 0, seats });
  const who = person === "random" ? randomAgent(MK, seed) : MK.AI.create({ skill: 0.9 });
  const g = P.buildGame(rec, (i, d, s) => i === 0 ? P.record(who, { rec }) : MK.AI.create({ skill: s.skill, aggression: s.aggression, casual: !!s.casual }));
  await g.play();
  rec.result = { win: g.winner === g.players[0], rounds: g.round };
  const quick = {};
  for (const m of rec.moments.filter(m => !m.replayed)) quick[m.i] = await A.quick(rec, m.i);
  const sum = A.summarize(rec, quick, {});
  return { person, seed, acc: sum.accuracy, n: sum.n, win: rec.result.win, rounds: rec.result.rounds, counts: sum.counts };
}

if (!isMainThread) {
  const MK = boot();
  (async () => {
    for (const job of workerData.jobs) parentPort.postMessage(await analyzeOne(MK, job.person, job.seed).catch(e => ({ person: job.person, seed: job.seed, error: String(e && e.message || e) })));
  })();
} else {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
  const GAMES = +opt("games", 8), THREADS = +opt("threads", 4), WRITE = !!opt("write", false);
  const jobs = [];
  for (let s = 1; s <= GAMES; s++) { jobs.push({ person: "random", seed: s }); jobs.push({ person: "bot", seed: s }); }
  const parts = Array.from({ length: THREADS }, () => []);
  jobs.forEach((j, k) => parts[k % THREADS].push(j));
  const out = [];
  const t0 = Date.now();
  Promise.all(parts.filter(p => p.length).map(p => new Promise((res, rej) => {
    const w = new Worker(__filename, { workerData: { jobs: p } });
    w.on("message", r => { out.push(r); console.log(r.error ? `${r.person} ${r.seed}: ERROR ${r.error}` : `${r.person} game ${r.seed}: accuracy ${r.acc} over ${r.n} decisions, ${r.win ? "won" : "lost"} in ${r.rounds} rounds ${JSON.stringify(r.counts)}`); });
    w.on("error", rej); w.on("exit", res);
  }))).then(() => {
    const avg = p => { const xs = out.filter(r => r.person === p && !r.error && r.acc != null).map(r => r.acc); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    const sd = p => { const xs = out.filter(r => r.person === p && !r.error && r.acc != null).map(r => r.acc), m = avg(p); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / Math.max(1, xs.length - 1)); };
    const random = avg("random"), bot = avg("bot");
    console.log(`random ${random && random.toFixed(1)} (sd ${sd("random").toFixed(1)}), bot ${bot && bot.toFixed(1)} (sd ${sd("bot").toFixed(1)}), ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    if (WRITE && random != null && bot != null && bot > random) {
      const f = path.join(dir, "analysis.js");
      const src = fs.readFileSync(f, "utf8").replace(/\/\*ANCHORS\*\/[\s\S]*?\/\*ANCHORS-END\*\//, `/*ANCHORS*/ A.ANCHORS = { random: ${random.toFixed(1)}, bot: ${bot.toFixed(1)} }; /*ANCHORS-END*/`);
      fs.writeFileSync(f, src);
      console.log("wrote the anchors to analysis.js");
    }
    const errs = out.filter(r => r.error).length;
    process.exitCode = errs ? 1 : 0;
  });
}
