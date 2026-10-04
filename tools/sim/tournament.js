#!/usr/bin/env node
/* A bot tournament without the screen: the same code as the Arena tab (miku/game/tournament.js).
   node tools/sim/tournament.js --format league --games 300 --pod 4 [--decks all|b4|precon|yours|id,id,...]
     [--rounds 6 --series 3] (swiss, cup)  [--top 8 --ko-series 5] (cup)  [--hero etrata] (gauntlet)
     [--level casual|sharp|best] [--no-casual] [--seed 7] [--jobs 8] [--json out.json]
   Prints the standings, ratings, head-to-head extremes and any engine errors. */
"use strict";
const path = require("path");
const fs = require("fs");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const dir = path.join(__dirname, "../../miku/game");

function loadGame() {
  require(path.join(dir, "engine.js"));
  require(path.join(dir, "cards-miku.js"));
  for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
  require(path.join(dir, "ai.js"));
  require(path.join(dir, "tournament.js"));
  return globalThis.MK;
}

if (!isMainThread) {
  const MK = loadGame();
  parentPort.on("message", async job => {
    let res;
    try { res = await MK.Tournament.playGame(job); } catch (e) { res = { error: String(e && e.message || e) }; }
    parentPort.postMessage({ gi: job.gi, res });
  });
  return;
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const MK = loadGame();
const T = MK.Tournament;

function pickDecks(spec) {
  const all = T.entrants();
  if (!spec || spec === "all") return all.map(e => e.id);
  if (["b4", "precon", "yours"].includes(spec)) return all.filter(e => e.group === spec).map(e => e.id);
  return String(spec).split(",").filter(id => T.entrant(id));
}

async function main() {
  const cfg = {
    format: opt("format", "league"), entrants: pickDecks(opt("decks", "all")), pod: +opt("pod", 4), games: +opt("games", 120),
    rounds: +opt("rounds", 6), series: +opt("series", 3), top: +opt("top", 8), koSeries: +opt("ko-series", 5),
    hero: opt("hero", null), level: opt("level", "sharp"), casual: !opt("no-casual", false), seed: +opt("seed", 1)
  };
  const st = T.create(cfg);
  const JOBS = Math.max(1, +opt("jobs", Math.max(1, require("os").cpus().length - 1)));
  const workers = Array.from({ length: JOBS }, () => new Worker(__filename));
  const t0 = Date.now();
  let errors = 0;
  const errs = [];
  const play = (w, job) => new Promise(res => { w.once("message", m => res(m)); w.postMessage(job); });
  for (;;) {
    const last = st.rounds[st.rounds.length - 1];
    if (last && !last.closed) { T.closeRound(st, last); last.closed = true; }
    const round = T.nextRound(st);
    if (!round) break;
    const queue = T.jobs(st, round);
    await Promise.all(workers.map(async w => {
      for (let job; (job = queue.shift());) {
        const { res } = await play(w, job);
        if (res.error) { errors++; errs.push(`game ${job.gi}: ${res.error}`); continue; }
        const g = T.record(st, job, res);
        if (g.err) { errors += g.err; if (errs.length < 10) errs.push(`game ${job.gi} (${g.d.join(", ")}): ${g.msg}`); }
      }
    }));
    if (opt("verbose", false)) console.log(`${round.label}: ${round.pods.map(p => p.seats.join("/")).join("  ")}`);
  }
  T.finish(st);
  st.ms = Date.now() - t0;
  await Promise.all(workers.map(w => w.terminate()));

  const A = T.analyze(st);
  const pct = x => (100 * x).toFixed(1).padStart(5) + "%";
  console.log(`\n${T.FORMATS[cfg.format].name}, pods of ${cfg.pod}, ${A.games} games, ${(st.ms / 1000).toFixed(1)}s (${(A.games / st.ms * 1000).toFixed(1)} games/s on ${JOBS} threads), seed ${cfg.seed}`);
  if (st.champion) console.log(`Champion: ${st.names[st.champion]}`);
  if (st.ko) for (const s of st.ko.stages) console.log(`  ${s.label}: ${s.pods.map(p => p.map(id => st.names[id]).join(" / ")).join("  |  ")} -> ${(s.through || []).map(id => st.names[id]).join(", ")}`);
  console.log("\n  #  deck                 rating  games  wins   win%   95% CI        edge  avg place  pts/g  win rnd  out rnd");
  A.standings.forEach((r, i) => {
    console.log(`${String(i + 1).padStart(3)}  ${r.name.padEnd(20)} ${r.rating.toFixed(0).padStart(6)} ${String(r.n).padStart(6)} ${String(r.wins).padStart(5)} ${pct(r.winRate)}  ${pct(r.ci[0])}-${pct(r.ci[1]).trim()}  ${r.edge.toFixed(2).padStart(5)}  ${r.avgPlace.toFixed(2).padStart(9)}  ${r.ppg.toFixed(2).padStart(5)}  ${r.avgWin == null ? "   -" : r.avgWin.toFixed(1).padStart(7)}  ${r.medOut == null ? "   -" : String(r.medOut).padStart(7)}`);
  });
  for (const s of A.seats) console.log(`\nTurn order, pods of ${s.P} (${s.n} games): ` + s.wins.map((w, i) => `${i + 1}${["st", "nd", "rd", "th"][Math.min(i, 3)]} ${pct(w / s.n).trim()}`).join(", "));
  console.log(`Game length: median ${A.lengths.median} rounds, ${A.lengths.draws} draws at the turn limit`);
  for (const h of A.highlights) console.log(`${h.title}: ${h.line} (game ${h.g.gi + 1}, seed ${h.g.seed})`);
  console.log(`\nEngine errors: ${errors}`);
  for (const e of errs) console.log("  " + e);
  const out = opt("json", null);
  if (out && out !== true) { fs.writeFileSync(out, JSON.stringify(st)); console.log(`Wrote ${out}`); }
}
main().catch(e => { console.error(e); process.exit(1); });
