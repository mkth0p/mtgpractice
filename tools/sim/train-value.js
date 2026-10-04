#!/usr/bin/env node
/* Fits the table-wide value model (miku/game/value.js) on bot games.
   Games seat four decks dealt at random (Corrupted Etrata in most of them). At the first main-phase
   decision of every turn, every live player's features are stored with the game's winner. A small
   network scores each player; the chances are the softmax of the scores over the live players,
   trained on the winner (cross-entropy). Games that end in a draw are left out.
   The old Etrata-only logistic model (train-cetrata.js) is scored on the same held-out positions.
   node tools/sim/train-value.js --games 8000 [--threads 4] [--hidden 16] [--data file.json] [--write] */
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
  require(path.join(dir, "value.js"));
  return globalThis.MK;
}

async function playGames(from, to) {
  const MK = load(), V = MK.Value, T = MK.TRAIN["corrupted-etrata"];
  const all = MK.BOT_DECKS;
  const hero = all.find(d => d.id === "corrupted-etrata");
  const rows = [];
  for (let s = from; s < to; s++) {
    let r = (s * 2654435761) >>> 0;
    const rnd = n => { r = (r * 1103515245 + 12345) >>> 0; return (r >>> 8) % n; };
    const seats = s % 10 < 7 ? [hero] : [];
    while (seats.length < 4) { const d = all[rnd(all.length)]; if (!seats.includes(d)) seats.push(d); }
    // a random seat order
    for (let i = seats.length - 1; i > 0; i--) { const j = rnd(i + 1); [seats[i], seats[j]] = [seats[j], seats[i]]; }
    const local = [];
    const seen = new Set();
    let g = null;
    const players = seats.map((d, i) => {
      const bot = MK.AI.create({ skill: 0.85 + rnd(16) / 100, aggression: d.aggression == null ? 0.55 : d.aggression, casual: (d.bracket || 4) <= 2 });   // precons play like a casual table, as on the site
      const main = bot.main;
      bot.main = (gg, p, ctx) => {
        const k = gg.turn;
        if (!seen.has(k) && gg.active === p) {
          seen.add(k);
          try {
            const xs = gg.players.map(q => q.lost ? null : V.seatFeatures(gg, q));
            const e = gg.players.findIndex(q => q.deckId === "corrupted-etrata" && !q.lost);
            const old = e >= 0 ? T.winProb(T.features(gg, gg.players[e])) : null;
            local.push({ xs, round: gg.round, e, old });
          } catch (err) { /* skip the position */ }
        }
        return main(gg, p, ctx);
      };
      return { name: d.name, commander: d.commander, list: d.list, identity: d.identity, agent: bot, deckId: d.id };
    });
    g = new MK.Game({ seed: 90000 + s, players, maxTurns: 120 });
    g.players.forEach((p, i) => { p.deckId = players[i].deckId; });
    g.activeIdx = g.rand(4);
    try { await g.play(); } catch (e) { continue; }
    if (!g.winner) continue;
    for (const row of local) rows.push({ xs: row.xs, y: g.winner.idx, r: row.round, e: row.e, old: row.old, s });
  }
  return rows;
}

/* ------------------------------------------------------------------ the network */
function init(F, H, rnd) {
  const n = () => (rnd() * 2 - 1) * Math.sqrt(3 / F);
  return { F, H, W1: Array.from({ length: H }, () => Array.from({ length: F }, n)), b1: new Array(H).fill(0), w2: Array.from({ length: H }, () => (rnd() * 2 - 1) * 0.3), b2: 0 };
}
function forward(m, x) {
  const h = new Array(m.H);
  let s = m.b2;
  for (let j = 0; j < m.H; j++) {
    let z = m.b1[j]; const row = m.W1[j];
    for (let i = 0; i < m.F; i++) z += row[i] * x[i];
    h[j] = Math.tanh(z); s += m.w2[j] * h[j];
  }
  return { s, h };
}
function probs(m, row) {
  const out = row.xs.map(x => x ? forward(m, x) : null);
  let mx = -Infinity;
  for (const o of out) if (o) mx = Math.max(mx, o.s);
  let sum = 0;
  const e = out.map(o => o ? Math.exp(o.s - mx) : 0);
  for (const v of e) sum += v;
  return { p: e.map(v => v / sum), out };
}
function train(m, rows, opts) {
  const { epochs, lr, l2, batch, rnd } = opts;
  const shape = () => ({ W1: m.W1.map(r => r.map(() => 0)), b1: m.b1.map(() => 0), w2: m.w2.map(() => 0), b2: 0 });
  const mo = shape(), ve = shape();
  let t = 0;
  const idx = rows.map((_, i) => i);
  for (let ep = 0; ep < epochs; ep++) {
    for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    for (let b = 0; b < idx.length; b += batch) {
      const gr = shape();
      const end = Math.min(idx.length, b + batch);
      for (let k = b; k < end; k++) {
        const row = rows[idx[k]];
        const { p, out } = probs(m, row);
        for (let q = 0; q < out.length; q++) {
          if (!out[q]) continue;
          const ds = p[q] - (row.y === q ? 1 : 0);
          gr.b2 += ds;
          const x = row.xs[q];
          for (let j = 0; j < m.H; j++) {
            gr.w2[j] += ds * out[q].h[j];
            const dz = ds * m.w2[j] * (1 - out[q].h[j] * out[q].h[j]);
            gr.b1[j] += dz;
            const gw = gr.W1[j];
            for (let i = 0; i < m.F; i++) if (x[i]) gw[i] += dz * x[i];
          }
        }
      }
      const n = end - b;
      t++;
      const b1c = 1 - Math.pow(0.9, t), b2c = 1 - Math.pow(0.999, t);
      const step = (pv, key, gv, mv, vv, wd) => {
        const gg = gv / n + wd;
        mv[key] = 0.9 * mv[key] + 0.1 * gg;
        vv[key] = 0.999 * vv[key] + 0.001 * gg * gg;
        pv[key] -= lr * (mv[key] / b1c) / (Math.sqrt(vv[key] / b2c) + 1e-8);
      };
      for (let j = 0; j < m.H; j++) {
        for (let i = 0; i < m.F; i++) step(m.W1[j], i, gr.W1[j][i], mo.W1[j], ve.W1[j], l2 * m.W1[j][i]);
        step(m.b1, j, gr.b1[j], mo.b1, ve.b1, 0);
        step(m.w2, j, gr.w2[j], mo.w2, ve.w2, l2 * m.w2[j]);
      }
      const box = { b2: m.b2 }, mb = { b2: mo.b2 }, vb = { b2: ve.b2 };
      step(box, "b2", gr.b2, mb, vb, 0); m.b2 = box.b2; mo.b2 = mb.b2; ve.b2 = vb.b2;
    }
    if (opts.onEpoch) opts.onEpoch(ep);
  }
  return m;
}
function evaluate(m, rows) {
  let ll = 0, n = 0, top = 0, llE = 0, llOld = 0, nE = 0, brE = 0, brOld = 0, llBase = 0;
  const byRound = {};
  const cal = Array.from({ length: 10 }, () => ({ n: 0, p: 0, y: 0 }));
  const live = rows.map(r => r.xs.filter(Boolean).length);
  for (let k = 0; k < rows.length; k++) {
    const row = rows[k];
    const { p } = probs(m, row);
    const py = Math.max(1e-6, p[row.y]);
    ll += -Math.log(py); n++;
    llBase += -Math.log(1 / live[k]);
    const best = p.indexOf(Math.max(...p));
    if (best === row.y) top++;
    const rb = Math.min(10, row.r);
    byRound[rb] = byRound[rb] || { n: 0, top: 0, ll: 0 };
    byRound[rb].n++; byRound[rb].ll += -Math.log(py); if (best === row.y) byRound[rb].top++;
    for (let q = 0; q < p.length; q++) if (row.xs[q]) { const c = cal[Math.min(9, Math.floor(p[q] * 10))]; c.n++; c.p += p[q]; c.y += row.y === q ? 1 : 0; }
    if (row.e >= 0 && row.old != null) {
      const y = row.y === row.e ? 1 : 0, pe = Math.min(1 - 1e-6, Math.max(1e-6, p[row.e])), po = Math.min(1 - 1e-6, Math.max(1e-6, row.old));
      llE += -(y * Math.log(pe) + (1 - y) * Math.log(1 - pe)); llOld += -(y * Math.log(po) + (1 - y) * Math.log(1 - po));
      brE += (pe - y) ** 2; brOld += (po - y) ** 2; nE++;
    }
  }
  return {
    logloss: +(ll / n).toFixed(4), uniform: +(llBase / n).toFixed(4), top1: +(top / n).toFixed(3),
    etrata: nE ? { n: nE, logloss: +(llE / nE).toFixed(4), oldLogloss: +(llOld / nE).toFixed(4), brier: +(brE / nE).toFixed(4), oldBrier: +(brOld / nE).toFixed(4) } : null,
    byRound: Object.fromEntries(Object.entries(byRound).map(([k, v]) => [k, { n: v.n, top1: +(v.top / v.n).toFixed(2), ll: +(v.ll / v.n).toFixed(3) }])),
    calibration: cal.filter(c => c.n).map(c => [+(c.p / c.n).toFixed(3), +(c.y / c.n).toFixed(3), c.n])
  };
}

if (!isMainThread) {
  playGames(workerData.from, workerData.to).then(rows => parentPort.postMessage(rows));
} else {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
  const GAMES = +opt("games", 6000), THREADS = +opt("threads", 4), H = +opt("hidden", 16), EPOCHS = +opt("epochs", 25);
  const DATA = opt("data", null);
  (async () => {
    let rows;
    const t0 = Date.now();
    if (DATA && fs.existsSync(DATA)) { rows = JSON.parse(fs.readFileSync(DATA, "utf8")); console.log(`loaded ${rows.length} positions from ${DATA}`); }
    else {
      const per = Math.ceil(GAMES / THREADS);
      const parts = await Promise.all(Array.from({ length: THREADS }, (_, k) => new Promise((res, rej) => {
        const w = new Worker(__filename, { workerData: { from: k * per, to: Math.min(GAMES, (k + 1) * per) } });
        w.on("message", res); w.on("error", rej);
      })));
      rows = [].concat(...parts);
      console.log(`${GAMES} games, ${rows.length} positions (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
      if (DATA) fs.writeFileSync(DATA, JSON.stringify(rows));
    }
    const MK = load(), V = MK.Value;
    const F = V.FEATURES.length;
    // held out by game
    const test = rows.filter(r => r.s % 5 === 0), trainRows = rows.filter(r => r.s % 5 !== 0);
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const m = init(F, H, rnd);
    train(m, trainRows, { epochs: EPOCHS, lr: 0.003, l2: 2e-4, batch: 128, rnd, onEpoch: ep => { if (ep % 5 === 4) console.log(`epoch ${ep + 1}: held-out`, JSON.stringify(evaluate(m, test)).slice(0, 220)); } });
    const ev = evaluate(m, test);
    console.log(JSON.stringify(ev, null, 1));
    if (opt("write", false)) {
      const r4 = a => a.map(x => +x.toFixed(4));
      const out = { F, H, W1: m.W1.map(r4), b1: r4(m.b1), w2: r4(m.w2), b2: +m.b2.toFixed(4), meta: { games: GAMES, positions: rows.length, logloss: ev.logloss, uniform: ev.uniform, top1: ev.top1, etrata: ev.etrata } };
      const file = path.join(dir, "value.js");
      const src = fs.readFileSync(file, "utf8");
      fs.writeFileSync(file, src.replace(/\/\*VALUE\*\/[\s\S]*?\/\*VALUE-END\*\//, `/*VALUE*/ M = ${JSON.stringify(out)}; /*VALUE-END*/`));
      console.log("wrote", file);
    }
  })().catch(e => { console.error(e); process.exit(1); });
}
