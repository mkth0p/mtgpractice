#!/usr/bin/env node
/* Checks for the bot tournaments (miku/game/tournament.js): the pods each format deals, the
   knockout, the numbers, and that a game replays from its seed.
   node tools/sim/test-tournament.js */
"use strict";
const path = require("path");
const fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
require(path.join(dir, "tournament.js"));
const MK = globalThis.MK, T = MK.Tournament;

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { fails++; console.log("FAIL " + msg); } };

// a fake game result, so the scheduling checks don't have to play real games
function fakeResult(job, r) {
  const n = job.seats.length, order = Array.from({ length: n }, (_, i) => i).sort(() => r() - 0.5);
  const pl = new Array(n); order.forEach((s, k) => { pl[s] = k + 1; });
  const w = order[0];
  return { f: Math.floor(r() * n), w, draw: false, rd: 5 + Math.floor(r() * 8), tn: 30, ms: 1, pl, out: pl.map((p, i) => (i === w ? 0 : 10 - p)), why: pl.map((p, i) => (i === w ? "" : "life")), dmg: pl.map(() => 10), cast: pl.map(() => 20), tok: pl.map(() => 1), mull: pl.map(() => 0), life: pl.map((p, i) => (i === w ? 12 : 0)), err: 0 };
}
function runFake(cfg, rseed) {
  let s = rseed || 1;
  const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const st = T.create(cfg);
  for (;;) {
    const last = st.rounds[st.rounds.length - 1];
    if (last && !last.closed) { T.closeRound(st, last); last.closed = true; }
    const round = T.nextRound(st);
    if (!round) break;
    for (const job of T.jobs(st, round)) T.record(st, job, fakeResult(job, r));
  }
  T.finish(st);
  return st;
}

(async () => {
  const all = T.entrants();
  ok(all.length >= 15, `every deck is an entrant (${all.length})`);
  ok(new Set(all.map(e => e.id)).size === all.length, "entrant ids are unique");
  ok(new Set(all.map(e => e.name)).size === all.length, "entrant names are unique: " + all.map(e => e.name).join(", "));
  ok(all.some(e => e.group === "yours") && all.some(e => e.group === "b4") && all.some(e => e.group === "precon"), "all three groups are there");

  // knockout sizes
  ok(JSON.stringify(T.koSizes(16, 4)) === "[16,4]", "16 in pods of 4: one stage, then the final");
  ok(JSON.stringify(T.koSizes(8, 4)) === "[8,4]", "8 in pods of 4: two pods, two through each");
  ok(JSON.stringify(T.koSizes(8, 2)) === "[8,4,2]", "8 in duels: quarters, semis, final");
  ok(T.koSizes(12, 4) === null && T.koSizes(6, 3) === null, "fields that don't divide are refused");

  // league: balanced games, all pods full, game budget exact
  {
    const ids = all.map(e => e.id);
    const st = runFake({ format: "league", entrants: ids, pod: 4, games: 200, seed: 5 });
    const per = {}; for (const g of st.games) for (const id of g.d) per[id] = (per[id] || 0) + 1;
    const counts = Object.values(per);
    ok(st.games.length === 200, `league plays its budget (${st.games.length})`);
    ok(Math.max(...counts) - Math.min(...counts) <= 1, `league games are balanced (${Math.min(...counts)}-${Math.max(...counts)})`);
    ok(st.games.every(g => new Set(g.d).size === 4), "every pod has four different decks");
    // pairs spread out: no pair meets far more than the average
    const mx = T.matrix(st); let mn = Infinity, mxn = 0;
    for (const a of ids) for (const b of ids) if (a !== b) { mn = Math.min(mn, mx[a][b].n); mxn = Math.max(mxn, mx[a][b].n); }
    ok(mxn - mn <= 6, `league pairs meet evenly (${mn}-${mxn})`);
    const sd = T.standings(st);
    ok(sd.length === ids.length && sd[0].pts >= sd[sd.length - 1].pts, "standings are sorted by points");
    const rt = T.ratings(st);
    ok(Object.values(rt).every(Number.isFinite), "ratings are finite");
    ok(Math.abs(Object.values(rt).reduce((a, b) => a + b, 0) / ids.length - 1500) < 60, "ratings center near 1500");
    ok(st.champion === sd[0].id, "the league champion tops the table");
  }
  // gauntlet: the hero is in every game
  {
    const ids = all.map(e => e.id);
    const st = runFake({ format: "gauntlet", entrants: ids, hero: "etrata", pod: 4, games: 60, seed: 9 });
    ok(st.games.length === 60 && st.games.every(g => g.d.includes("etrata")), "the gauntlet deck sits in every pod");
    const per = {}; for (const g of st.games) for (const id of g.d) if (id !== "etrata") per[id] = (per[id] || 0) + 1;
    ok(Math.max(...Object.values(per)) - Math.min(...Object.values(per)) <= 1, "the gauntlet field is balanced");
  }
  // swiss: rounds, series, byes spread out
  {
    const ids = all.map(e => e.id).slice(0, 18);
    const st = runFake({ format: "swiss", entrants: ids, pod: 4, rounds: 5, series: 3, seed: 2 });
    ok(st.rounds.length === 5 && st.games.length === 5 * 4 * 3, `swiss plays rounds x pods x series (${st.games.length})`);
    const byes = {}; for (const r of st.rounds) for (const id of r.byes) byes[id] = (byes[id] || 0) + 1;
    ok(Math.max(0, ...Object.values(byes)) <= 1, "no deck sits out twice while others haven't");
  }
  // cup: qualifiers, a knockout, a champion who won the final
  {
    const ids = all.map(e => e.id).slice(0, 16);
    const st = runFake({ format: "cup", entrants: ids, pod: 4, rounds: 3, series: 2, top: 8, koSeries: 5, seed: 4 });
    ok(st.ko && st.ko.stages.length === 2, "the cup has two knockout stages for a top 8");
    ok(st.ko.stages[0].through.length === 4, "two decks from each semi-final pod go through");
    const fin = st.rounds[st.rounds.length - 1];
    ok(fin.label === "Final" && fin.pods.length === 1 && fin.pods[0].games === 5, "the final is one pod playing the series");
    ok(st.champion === T.series(st, fin, fin.pods[0])[0].id, "the champion won the final series");
    ok(st.ko.stages[0].field.every(id => T.standings(st).some(s => s.id === id)), "the knockout field comes from the standings");
    const duel = runFake({ format: "cup", entrants: ids, pod: 2, rounds: 3, series: 1, top: 8, koSeries: 3, seed: 4 });
    ok(duel.ko.stages.map(s => s.label).join(",") === "Quarter-finals,Semi-finals,Final", "a duel cup has quarters, semis and a final");
  }
  ok(T.check({ format: "league", entrants: ["miku", "edgar"], pod: 4 }) !== "", "too few decks is refused");
  ok(T.wilson(0, 0)[1] === 0 && T.wilson(5, 10)[0] < 0.5 && T.wilson(5, 10)[1] > 0.5, "the Wilson interval holds the rate");

  // real games: the same seed plays the same game, and results are sane
  {
    const st = T.create({ format: "league", entrants: ["edgar", "ghalta", "krenko", "lathril"], pod: 4, games: 3, seed: 11 });
    const round = T.nextRound(st);
    const job = T.jobs(st, round)[0];
    const a = await T.playGame(job), b = await T.playGame(job);
    const strip = x => JSON.stringify(Object.assign({}, x, { ms: 0 }));
    ok(strip(a) === strip(b), "a game replays the same from its seed");
    ok(a.pl.filter(p => p === 1).length >= 1 && a.pl.every(p => p >= 1 && p <= 4), "places run 1 to 4");
    ok(a.w < 0 || (a.pl[a.w] === 1 && a.out[a.w] === 0), "the winner placed first and never went out");
    ok(a.err === 0, "no engine errors: " + (a.msg || ""));
    await T.run(st);
    ok(st.status === "done" && st.games.length === 3, "a real three-game league finishes");
    const A = T.analyze(st);
    ok(A.standings.length === 4 && A.elo.n === 3, "the analysis covers every deck and game");
  }

  console.log(`${passes} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})();
