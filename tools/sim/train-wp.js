#!/usr/bin/env node
/* Fits Corrupted Etrata's win-probability model (miku/game/train-cetrata.js) on bot games.
   Every game seats the Corrupted Etrata bot against three decks dealt at random; at each of its
   main phases and at the end of the turn before its own, the position's features are stored with
   the game's result. A logistic regression on those rows gives the weights, which this script
   writes into train-cetrata.js between the WP markers.
   node tools/sim/train-wp.js --games 3000 [--threads 8] [--write] */
"use strict";
const path = require("path"), fs = require("fs");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const dir = path.join(__dirname, "../../miku/game");

function load() {
  require(path.join(dir, "engine.js"));
  require(path.join(dir, "cards-miku.js"));
  for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
  require(path.join(dir, "ai.js"));
  require(path.join(dir, "train-cetrata.js"));
  return globalThis.MK;
}

async function playGames(from, to) {
  const MK = load(), T = MK.TRAIN["corrupted-etrata"];
  const hero = MK.CETRATA_DECK;
  const pool = MK.BOT_DECKS.filter(d => d.id !== hero.id && d.commander !== hero.commander);
  const precons = pool.filter(d => (d.bracket || 4) < 4), b4 = pool.filter(d => (d.bracket || 4) >= 4);
  const rows = [];
  let wins = 0;
  for (let s = from; s < to; s++) {
    let r = s * 2654435761 >>> 0;
    const rnd = n => { r = (r * 1103515245 + 12345) >>> 0; return r % n; };
    const src = s % 10 < 7 ? precons : s % 10 < 9 ? pool : b4;
    const seats = [hero];
    while (seats.length < 4) { const d = src[rnd(src.length)]; if (!seats.includes(d)) seats.push(d); }
    const local = [];
    const players = seats.map((d, i) => {
      const bot = MK.AI.create({ skill: i === 0 ? 1 : 0.9, aggression: d.aggression == null ? 0.55 : d.aggression });
      if (i === 0) {
        const seen = new Set();
        const main = bot.main, respond = bot.respond;
        bot.main = (g, p, ctx) => { const k = "m" + g.turn; if (!seen.has(k)) { seen.add(k); try { local.push(T.features(g, p)); } catch (e) { /* skip */ } } return main(g, p, ctx); };
        bot.respond = (g, p, ctx) => { if (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p) { const k = "e" + g.turn; if (!seen.has(k)) { seen.add(k); try { local.push(T.features(g, p)); } catch (e) { /* skip */ } } } return respond(g, p, ctx); };
      }
      return { name: d.name, commander: d.commander, list: d.list, identity: d.identity, agent: bot };
    });
    const g = new MK.Game({ seed: 5000 + s, players, maxTurns: 120 });
    g.activeIdx = g.rand(4);
    try { await g.play(); } catch (e) { continue; }
    const won = g.winner === g.players[0] ? 1 : 0;
    wins += won;
    for (const f of local) rows.push([f, won, s]);
  }
  return { rows, wins, games: to - from };
}

function fit(rows, nf) {
  // logistic regression, full-batch gradient descent with a little L2
  const w = new Array(nf).fill(0);
  const lr = 0.5, l2 = 1e-4;
  const sig = x => 1 / (1 + Math.exp(-x));
  for (let it = 0; it < 1500; it++) {
    const gr = new Array(nf).fill(0);
    for (const [f, y] of rows) {
      let z = 0; for (let i = 0; i < nf; i++) z += f[i] * w[i];
      const e = sig(z) - y;
      for (let i = 0; i < nf; i++) gr[i] += e * f[i];
    }
    for (let i = 0; i < nf; i++) w[i] -= lr * (gr[i] / rows.length + (i ? l2 * w[i] : 0));
  }
  return w;
}
function score(rows, w) {
  const sig = x => 1 / (1 + Math.exp(-x));
  let ll = 0, br = 0;
  const buckets = Array.from({ length: 10 }, () => ({ n: 0, p: 0, y: 0 }));
  for (const [f, y] of rows) {
    let z = 0; for (let i = 0; i < f.length; i++) z += f[i] * w[i];
    const p = Math.min(1 - 1e-6, Math.max(1e-6, sig(z)));
    ll += -(y * Math.log(p) + (1 - y) * Math.log(1 - p));
    br += (p - y) * (p - y);
    const b = buckets[Math.min(9, Math.floor(p * 10))]; b.n++; b.p += p; b.y += y;
  }
  return { logloss: ll / rows.length, brier: br / rows.length, buckets: buckets.filter(b => b.n).map(b => ({ n: b.n, said: +(b.p / b.n).toFixed(3), was: +(b.y / b.n).toFixed(3) })) };
}

if (!isMainThread) {
  playGames(workerData.from, workerData.to).then(r => parentPort.postMessage(r));
} else {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
  const GAMES = +opt("games", 2000), THREADS = +opt("threads", 8), WRITE = !!opt("write", false);
  const t0 = Date.now();
  const per = Math.ceil(GAMES / THREADS);
  const jobs = [];
  for (let k = 0; k < THREADS; k++) jobs.push(new Promise((res, rej) => { const w = new Worker(__filename, { workerData: { from: k * per, to: Math.min(GAMES, (k + 1) * per) } }); w.on("message", res); w.on("error", rej); }));
  Promise.all(jobs).then(parts => {
    const rows = [].concat(...parts.map(p => p.rows));
    const wins = parts.reduce((a, p) => a + p.wins, 0), games = parts.reduce((a, p) => a + p.games, 0);
    const MK = load(), T = MK.TRAIN["corrupted-etrata"];
    // every fifth game is held out to check the fit
    const train = rows.filter(r => r[2] % 5), test = rows.filter(r => r[2] % 5 === 0);
    const w = fit(train, T.FEATURES.length);
    const sc = score(test, w), base = score(test, T.FEATURES.map(() => 0));
    console.log(`${games} games, Etrata won ${wins} (${(100 * wins / games).toFixed(1)}%), ${rows.length} positions, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    console.log("held-out log loss", sc.logloss.toFixed(4), "(coin flip", base.logloss.toFixed(4) + "), Brier", sc.brier.toFixed(4));
    console.log("calibration", JSON.stringify(sc.buckets));
    console.log(T.FEATURES.map((k, i) => `${k} ${w[i].toFixed(2)}`).join(", "));
    if (WRITE) {
      const file = path.join(dir, "train-cetrata.js");
      const src = fs.readFileSync(file, "utf8");
      const block = `/*WP*/ WP = ${JSON.stringify({ games, positions: rows.length, wins, logloss: +sc.logloss.toFixed(4), brier: +sc.brier.toFixed(4), w: w.map(x => +x.toFixed(4)) })}; /*WP-END*/`;
      const out = src.includes("/*WP*/") ? src.replace(/\/\*WP\*\/[\s\S]*?\/\*WP-END\*\//, block) : src.replace("  const GUESS =", "  " + block + "\n  const GUESS =");
      fs.writeFileSync(file, out);
      console.log("wrote the weights into train-cetrata.js");
    }
  }).catch(e => { console.error(e); process.exit(1); });
}
