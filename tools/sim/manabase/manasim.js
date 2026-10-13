#!/usr/bin/env node
// Monte Carlo des bases de mana Commander (spec de ju, 2026-10-13).
//
// Deck : 99 cartes + commandant à 4 mana (hors des 99, posé en priorité).
// Sources : terrains + dorks (type Llanowar Elves, CMC 1, mal d'invocation)
//         + rocks (type Arcane Signet, CMC 2, produit dès le tour où il arrive).
// Pression 1 : budget de mana du deck (CMC total des 99, terrains = 0) de 130 à 230.
//              Les sorts utiles se partagent ce qui reste après dorks et rocks,
//              en courbe lissée au mieux autour de la moyenne (que des floor/ceil).
// Pression 2 : pioche en plus aux tours 5 à 8, scénarios P1 à P8.
//
// Usage :
//   node manasim.js sweep  [--mode budget|avg] [--games 2000] [--turns 10] [--curve tight|spread] [--out results.json]
//   node manasim.js split  [--games 20000] --configs "32:5:5,32:6:6" ...   (terrains:dorks:rocks)
//   node manasim.js one    --config 32:5:5 --budget 180 [--games 20000]
'use strict';
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const SCENARIOS = {
  P1: [0, 0, 0, 0], P2: [1, 0, 0, 0], P3: [1, 1, 0, 0], P4: [1, 1, 1, 0],
  P5: [1, 1, 1, 1], P6: [2, 1, 1, 1], P7: [2, 2, 1, 1], P8: [2, 2, 2, 1],
};
const SCN = Object.keys(SCENARIOS);
const BUDGETS = [];
for (let b = 130; b <= 230; b += 10) BUDGETS.push(b);
const CMD_COST = 4;
const DORK_CMC = 1, ROCK_CMC = 2;
const RAMP_FIRST_UNTIL = 6; // tours 1-6 : la ramp passe avant les sorts utiles
const LAND = -1, DORK = -2, ROCK = -3; // sinon le code = CMC du sort utile

// ---------- PRNG (mulberry32), même graine par partie pour toutes les configs ----------
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Construction du deck ----------
// Retourne la liste des CMC des sorts utiles, ou null si le budget est impossible.
function spellCurve(lands, dorks, rocks, budget, curve, mode) {
  const S = 99 - lands - dorks - rocks;
  if (S <= 0) return null;
  // mode 'budget' (spec) : budget = CMC total des 99, ramp comprise.
  // mode 'avg' : budget = CMC moyen des sorts utiles, fixe quel que soit le nombre de sources.
  const spellBudget = mode === 'avg' ? Math.round(budget * S) : budget - dorks * DORK_CMC - rocks * ROCK_CMC;
  if (spellBudget < S) return null; // il faudrait des sorts à 0
  const lo = Math.floor(spellBudget / S), hi = spellBudget - lo * S; // hi cartes à lo+1
  const out = [];
  for (let i = 0; i < S; i++) out.push(i < hi ? lo + 1 : lo);
  if (curve === 'spread') {
    // Variante plus réaliste : on étale ±2 autour de la moyenne (forme 1-2-3-2-1),
    // en gardant exactement le même total et un CMC minimum de 1.
    const shape = [-2, -1, -1, 0, 0, 0, 1, 1, 2];
    for (let i = 0; i < S; i++) out[i] = Math.max(1, out[i] + shape[i % shape.length]);
    let diff = out.reduce((a, b) => a + b, 0) - spellBudget, i = 0, guard = 0;
    while (diff !== 0 && guard++ < 100000) {
      const k = i++ % S;
      if (diff > 0 && out[k] > 1) { out[k]--; diff--; }
      else if (diff < 0) { out[k]++; diff++; }
    }
  }
  return out;
}

function buildDeck(lands, dorks, rocks, spells) {
  const deck = new Int8Array(99);
  let k = 0;
  for (let i = 0; i < lands; i++) deck[k++] = LAND;
  for (let i = 0; i < dorks; i++) deck[k++] = DORK;
  for (let i = 0; i < rocks; i++) deck[k++] = ROCK;
  for (const c of spells) deck[k++] = c;
  return deck;
}

// ---------- Choix des sorts : dépenser le plus de mana possible ----------
// cnt[cmc] = nombre de sorts utiles de ce CMC en main. Remplit take[] et renvoie le total.
function bestSpend(cnt, maxCmc, mana, take) {
  let best = -1, bestTake = null;
  const cur = new Array(maxCmc + 1).fill(0);
  function rec(cmc, rem) {
    if (best === mana) return;
    if (cmc === 0) {
      const spent = mana - rem;
      if (spent > best) { best = spent; bestTake = cur.slice(); }
      return;
    }
    const n = Math.min(cnt[cmc], Math.floor(rem / cmc));
    for (let x = n; x >= 0; x--) { cur[cmc] = x; rec(cmc - 1, rem - x * cmc); if (best === mana) return; }
    cur[cmc] = 0;
  }
  rec(maxCmc, mana);
  for (let c = 0; c <= maxCmc; c++) take[c] = bestTake ? bestTake[c] : 0;
  return best;
}

// ---------- Une partie ----------
// order : deck mélangé (Int8Array). Renvoie les métriques par scénario dans acc.
function shuffle(deck, r) {
  const a = Int8Array.from(deck);
  for (let i = a.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

// Main de départ avec mulligan : 1er mulligan gratuit (Commander), le 2e met 1 carte en dessous.
// On garde si 2 à 5 terrains (ou 1 terrain + 2 ramps). Renvoie {order, bottomed}.
function mulligan(deck, r) {
  for (let m = 0; m < 3; m++) {
    const o = shuffle(deck, r);
    let L = 0, R = 0;
    for (let i = 0; i < 7; i++) { if (o[i] === LAND) L++; else if (o[i] === DORK || o[i] === ROCK) R++; }
    const ok = (L >= 2 && L <= 5) || (L === 1 && R >= 2);
    if (ok || m === 2) {
      if (m < 2) return o;
      // 2e mulligan : on met 1 carte au fond (un terrain si >= 4, sinon le sort le plus cher)
      let idx = -1;
      if (L >= 4) { for (let i = 0; i < 7; i++) if (o[i] === LAND) { idx = i; break; } }
      else { let hi = -9; for (let i = 0; i < 7; i++) if (o[i] > hi) { hi = o[i]; idx = i; } }
      if (idx < 0) idx = 6;
      const out = new Int8Array(99); let k = 0;
      for (let i = 0; i < 99; i++) if (i !== idx) out[k++] = o[i];
      out[98] = o[idx];
      out.mull = 2;
      return out;
    }
  }
}

function play(order, extra, turns, maxCmc, res) {
  // main
  const cnt = new Int32Array(maxCmc + 1);
  let hLand = 0, hDork = 0, hRock = 0, ptr = 0;
  const handSize = order.mull === 2 ? 6 : 7;
  function draw(n) {
    for (let i = 0; i < n && ptr < 99; i++) {
      const c = order[ptr++];
      if (c === LAND) hLand++; else if (c === DORK) hDork++; else if (c === ROCK) hRock++; else cnt[c]++;
    }
  }
  draw(handSize);
  let lands = 0, rocks = 0, dorksReady = 0, dorksSick = 0, cmdCast = false, cmdTurn = 99;
  let gen = 0, useful = 0, rampSpent = 0, spells = 0, rampCast = 0, gen8 = 0, useful8 = 0;
  const take = new Int32Array(maxCmc + 1);
  for (let t = 1; t <= turns; t++) {
    dorksReady += dorksSick; dorksSick = 0;
    draw(1 + (t >= 5 && t <= 8 ? extra[t - 5] : 0)); // multijoueur : tout le monde pioche au T1
    if (hLand > 0) { hLand--; lands++; }
    let mana = lands + rocks + dorksReady;
    gen += mana;
    const castRock = () => { hRock--; rocks++; mana -= ROCK_CMC; mana += 1; gen += 1; rampSpent += ROCK_CMC; rampCast++; };
    const castDork = () => { hDork--; dorksSick++; mana -= DORK_CMC; rampSpent += DORK_CMC; rampCast++; };
    // 1) Commandant en priorité. Une rock qui laisse encore 4 mana passe avant (nette -1).
    if (!cmdCast) {
      while (hRock > 0 && mana >= CMD_COST + 1) castRock();
      if (mana >= CMD_COST) { mana -= CMD_COST; useful += CMD_COST; spells++; cmdCast = true; cmdTurn = t; }
    }
    // 2) Ramp avant les sorts jusqu'au tour 6 (rocks d'abord : elles produisent tout de suite)
    if (t <= RAMP_FIRST_UNTIL) {
      while (hRock > 0 && mana >= ROCK_CMC) castRock();
      while (hDork > 0 && mana >= DORK_CMC) castDork();
    }
    // 3) Sorts utiles : on dépense le maximum de mana possible
    if (mana > 0) {
      const spent = bestSpend(cnt, maxCmc, mana, take);
      if (spent > 0) {
        for (let c = 1; c <= maxCmc; c++) if (take[c]) { cnt[c] -= take[c]; spells += take[c]; }
        mana -= spent; useful += spent;
      }
    }
    // 4) Après le tour 6, la ramp ne prend que le mana restant
    if (t > RAMP_FIRST_UNTIL) {
      while (hRock > 0 && mana >= ROCK_CMC) castRock();
      while (hDork > 0 && mana >= DORK_CMC) castDork();
    }
    if (t === 8) { gen8 = gen; useful8 = useful; }
  }
  let left = 0;
  for (let c = 1; c <= maxCmc; c++) left += cnt[c];
  res.gen = gen; res.useful = useful; res.ramp = rampSpent; res.unused = gen - useful - rampSpent;
  res.spells = spells; res.rampCast = rampCast; res.left = left; res.cmdTurn = cmdTurn;
  res.gen8 = gen8; res.useful8 = useful8;
}

const METRICS = ['gen', 'useful', 'ramp', 'unused', 'spells', 'rampCast', 'left', 'cmdT4', 'cmdTurn', 'gen8', 'useful8'];

// Simule une config sur un budget, tous les scénarios avec les mêmes mélanges (variables communes).
function simCell(lands, dorks, rocks, budget, games, turns, curve, seed, mode) {
  const spells = spellCurve(lands, dorks, rocks, budget, curve, mode);
  if (!spells) return null;
  const deck = buildDeck(lands, dorks, rocks, spells);
  const maxCmc = Math.max(1, ...spells);
  const out = {};
  for (const s of SCN) { out[s] = {}; for (const m of METRICS) out[s][m] = 0; out[s].useful2 = 0; }
  const res = {};
  for (let g = 0; g < games; g++) {
    const r = rng((seed + g * 2654435761) >>> 0);
    const order = mulligan(deck, r);
    for (const s of SCN) {
      play(order, SCENARIOS[s], turns, maxCmc, res);
      const o = out[s];
      o.gen += res.gen; o.useful += res.useful; o.ramp += res.ramp; o.unused += res.unused;
      o.spells += res.spells; o.rampCast += res.rampCast; o.left += res.left;
      o.cmdT4 += res.cmdTurn <= 4 ? 1 : 0; o.cmdTurn += Math.min(res.cmdTurn, turns + 1);
      o.gen8 += res.gen8; o.useful8 += res.useful8; o.useful2 += res.useful * res.useful;
    }
  }
  for (const s of SCN) {
    const o = out[s];
    for (const m of METRICS) o[m] /= games;
    o.usefulSd = Math.sqrt(Math.max(0, o.useful2 / games - o.useful * o.useful));
    delete o.useful2;
  }
  out.avgSpellCmc = spells.reduce((a, b) => a + b, 0) / spells.length;
  return out;
}

// ---------- Workers ----------
if (!isMainThread) {
  const { jobs, games, turns, curve, seed, mode } = workerData;
  const results = [];
  for (const j of jobs) {
    const cell = simCell(j.lands, j.dorks, j.rocks, j.budget, games, turns, curve, seed, mode);
    results.push({ ...j, cell });
    if (results.length % 50 === 0) parentPort.postMessage({ progress: 50 });
  }
  parentPort.postMessage({ done: results });
  return;
}

function runJobs(jobs, opts) {
  const n = Math.min(os.cpus().length, jobs.length) || 1;
  const chunks = Array.from({ length: n }, () => []);
  jobs.forEach((j, i) => chunks[i % n].push(j));
  let doneCount = 0;
  return Promise.all(chunks.map(chunk => new Promise((resolve, reject) => {
    const w = new Worker(__filename, { workerData: { jobs: chunk, ...opts } });
    w.on('message', m => {
      if (m.progress) { doneCount += m.progress; if (process.stderr.isTTY) process.stderr.write(`\r${doneCount}/${jobs.length}`); }
      if (m.done) resolve(m.done);
    });
    w.on('error', reject);
  }))).then(r => { process.stderr.write('\n'); return r.flat(); });
}

function args() {
  const a = process.argv.slice(3), o = {};
  for (let i = 0; i < a.length; i++) if (a[i].startsWith('--')) o[a[i].slice(2)] = a[i + 1], i++;
  return o;
}

async function main() {
  const cmd = process.argv[2] || 'sweep';
  const a = args();
  const opts = { games: +(a.games || 2000), turns: +(a.turns || 10), curve: a.curve || 'tight', seed: +(a.seed || 12345), mode: a.mode || 'budget' };
  const AVGS = [2, 2.25, 2.5, 2.75, 3, 3.25, 3.5, 3.75, 4, 4.25, 4.5];
  const budgets = a.budgets ? a.budgets.split(',').map(Number) : (opts.mode === 'avg' ? AVGS : BUDGETS);
  let jobs = [];
  if (cmd === 'sweep') {
    // Toutes les configs de 35 à 55 sources ; ramp moitié dorks / moitié rocks (rock en plus si impair).
    const minLands = +(a.minLands || 24), maxRamp = +(a.maxRamp || 24);
    for (let N = 35; N <= 55; N++)
      for (let L = Math.max(minLands, N - maxRamp); L <= N; L++) {
        const ramp = N - L, dorks = Math.floor(ramp / 2), rocks = ramp - dorks;
        for (const budget of budgets) jobs.push({ lands: L, dorks, rocks, budget });
      }
  } else if (cmd === 'split' || cmd === 'one') {
    const cfgs = (a.configs || a.config).split(',').map(s => s.split(':').map(Number));
    for (const [lands, dorks, rocks] of cfgs) for (const budget of (cmd === 'one' && a.budget ? [+a.budget] : budgets))
      jobs.push({ lands, dorks, rocks, budget });
  }
  const t0 = Date.now();
  const results = await runJobs(jobs, opts);
  const out = { opts, scenarios: SCENARIOS, budgets, results, seconds: (Date.now() - t0) / 1000 };
  const file = a.out || path.join(__dirname, `results-${cmd}-${opts.mode}-${opts.curve}.json`);
  fs.writeFileSync(file, JSON.stringify(out));
  console.error(`${results.length} cellules en ${out.seconds}s -> ${file}`);
  if (cmd === 'one') for (const r of results) console.log(JSON.stringify(r, null, 1));
}
main();
