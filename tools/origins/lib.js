/* Shared helpers for the Origins TCG simulation scripts: bots from a plain spec, paired-seed duels, a worker pool. */
const os = require('os');
const path = require('path');
const { Worker } = require('worker_threads');
const E = require('../../origins/engine.js');
const A = require('../../origins/ai.js');
const DK = require('../../origins/decks.js');
const D = require('../../origins/cards.js');

// A closed pipe (the output of a run piped into `head`) must not stop a long run halfway.
process.stdout.on('error', (e) => { if (e.code !== 'EPIPE') throw e; });

const BY_KEY = Object.fromEntries(DK.META.map((d) => [d.key, d]));
const deck = (x) => (typeof x === 'string' ? BY_KEY[x] : x);

// The named bots (fast, std, strong) live in origins/ai.js so that the site's own simulator uses the same ones.
const PRESET = A.PRESET, mkBot = A.mkBot;

/* n seeds, each played twice with the seats swapped. The seed fixes the three locations and who has priority, so the
   swap cancels that luck. Counts are from deck a's side.
   track: also count, per card of each deck, how often it was seen (opening hand or drawn) and how often its owner won. */
function duel(task) {
  D.setPatch(task.patch || null);
  const a = deck(task.a), b = deck(task.b);
  const ba = mkBot(task.botA), bb = mkBot(task.botB || task.botA);
  const n = task.n, seed = task.seed == null ? 1 : task.seed;
  let wa = 0, wb = 0, dr = 0, rounds = 0;
  const cards = task.track ? [{}, {}] : null;
  for (let i = 0; i < n; i++) {
    const s = E.mix(seed, i);
    for (let side = 0; side < 2; side++) {
      const G = E.playGame(side ? [b, a] : [a, b], side ? [bb, ba] : [ba, bb], { seed: s, rules: task.rules, track: !!task.track, maxRounds: task.maxRounds });
      const w = G.winner;
      if (w === -1) dr++; else if ((w === 0) !== !!side) wa++; else wb++;
      rounds += G.round;
      if (cards) for (let seat = 0; seat < 2; seat++) {
        const who = seat === side ? 0 : 1;           // 0 = deck a, 1 = deck b
        const t = G.P[seat].track, win = w === seat ? 1 : (w === -1 ? 0.5 : 0);
        const C = cards[who];
        const bump = (id, k) => { const r = C[id] || (C[id] = [0, 0, 0, 0, 0, 0]); r[k] += 1; r[k + 1] += win; };
        for (const id of new Set(t.opening.concat(t.drawn))) bump(id, 0);
        for (const id of new Set(t.opening)) bump(id, 2);
        for (const id of new Set(t.played.map((x) => x[1]))) bump(id, 4);
      }
    }
  }
  const out = { wa, wb, dr, n: 2 * n, rounds };
  if (cards) out.cards = cards;
  return out;
}

// Run tasks on all cores. A task is a plain object; { mod, fn } names the function (default: duel in this file).
function pool(tasks, opt = {}) {
  const nw = Math.max(1, Math.min(opt.workers || os.cpus().length, tasks.length));
  const results = new Array(tasks.length);
  let next = 0, done = 0;
  return new Promise((resolve, reject) => {
    if (!tasks.length) return resolve(results);
    const ws = [];
    const give = (w) => { if (next < tasks.length) { const id = next++; w.postMessage({ id, task: tasks[id] }); } };
    for (let i = 0; i < nw; i++) {
      const w = new Worker(path.join(__dirname, 'worker.js'));
      ws.push(w);
      w.on('message', (m) => {
        if (m.err) { for (const x of ws) x.terminate(); return reject(new Error(m.err)); }
        results[m.id] = m.out; done++;
        if (opt.onDone) opt.onDone(m.id, m.out, done, tasks.length);
        if (done === tasks.length) { for (const x of ws) x.terminate(); resolve(results); } else give(w);
      });
      w.on('error', (e) => { for (const x of ws) x.terminate(); reject(e); });
      give(w);
    }
  });
}

// Split one big duel into chunks so the pool can spread it over the cores; returns the summed result.
async function bigDuel(task, chunk = 25, opt) {
  const tasks = [];
  for (let i = 0; i < task.n; i += chunk) tasks.push(Object.assign({}, task, { n: Math.min(chunk, task.n - i), seed: E.mix((task.seed == null ? 1 : task.seed) + 7919, i) }));
  const rs = await pool(tasks, opt);
  return sum(rs);
}
function sum(rs) {
  const t = { wa: 0, wb: 0, dr: 0, n: 0, rounds: 0 };
  for (const r of rs) {
    t.wa += r.wa; t.wb += r.wb; t.dr += r.dr; t.n += r.n; t.rounds += r.rounds;
    if (r.cards) { t.cards = t.cards || [{}, {}]; for (let k = 0; k < 2; k++) for (const id in r.cards[k]) { const x = t.cards[k][id] || (t.cards[k][id] = [0, 0, 0, 0, 0, 0]); for (let j = 0; j < 6; j++) x[j] += r.cards[k][id][j]; } }
  }
  return t;
}
const wr = (r) => (r.wa + r.dr / 2) / r.n;
// 95% interval half-width for a win rate from n paired games (pairs are not independent, so this is a little wide)
const ci = (p, n) => 1.96 * Math.sqrt(Math.max(p * (1 - p), 1e-9) / n);
const pct = (x, d = 1) => (100 * x).toFixed(d) + '%';

function arg(name, def) {
  const i = process.argv.indexOf('--' + name);
  if (i < 0) return def;
  const v = process.argv[i + 1];
  return v == null || v.startsWith('--') ? true : (isNaN(+v) ? v : +v);
}

module.exports = { E, A, DK, D, BY_KEY, PRESET, deck, mkBot, duel, pool, bigDuel, sum, wr, ci, pct, arg };
