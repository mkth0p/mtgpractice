#!/usr/bin/env node
/* Headless games between bots, to test the Miku game engine, the cards and the bot decks.
   node tools/sim/run.js --games 50 --seed 1 --decks miku,random --players 4 [--strict] [--verbose]
   Prints win rates, game lengths and any engine errors or broken invariants. */
"use strict";
const path = require("path");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
// --files decks-krenko.js,decks-edgar.js loads only those deck files (default: all of them)
const onlyFiles = opt("files", null);
for (const f of require("fs").readdirSync(dir).filter(f => /^(cards|decks)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) {
  if (onlyFiles && !String(onlyFiles).split(",").includes(f)) continue;
  try { require(path.join(dir, f)); } catch (e) { console.error(`Could not load ${f}: ${e.message}`); }
}
require(path.join(dir, "ai.js"));
const MK = globalThis.MK;
const GAMES = +opt("games", 20);
const SEED = +opt("seed", 1);
const PLAYERS = +opt("players", 4);
const STRICT = !!opt("strict", false);
const VERBOSE = !!opt("verbose", false);
const LOGGAME = opt("log", null);
const MAXTURNS = +opt("turns", 80);

function deckPool() {
  const pool = { miku: MK.MIKU_DECK };
  for (const d of MK.BOT_DECKS || []) pool[d.id] = d;
  return pool;
}
function checkInvariants(g, where) {
  const problems = [];
  const seen = new Map();
  const note = (o, zone) => {
    if (seen.has(o.id)) problems.push(`${o.def.name} (#${o.id}) is in ${zone} and ${seen.get(o.id)}`);
    else seen.set(o.id, zone);
  };
  for (const o of g.battlefield) { note(o, "battlefield"); if (o.zone !== "battlefield") problems.push(`${o.def.name} on battlefield has zone ${o.zone}`); }
  for (const p of g.players) {
    for (const z of ["library", "hand", "graveyard", "exile", "command"]) for (const o of p[z]) {
      note(o, p.name + " " + z);
      if (o.zone !== z) problems.push(`${o.def.name} in ${p.name}'s ${z} has zone ${o.zone}`);
      if (o.isToken) problems.push(`token ${o.def.name} in ${z}`);
    }
    if (!Number.isFinite(p.life)) problems.push(`${p.name} life is ${p.life}`);
    for (const k in p.pool) if (p.pool[k] < 0) problems.push(`${p.name} pool ${k} negative`);
  }
  for (const o of g.battlefield) {
    for (const k in o.counters) if (o.counters[k] < 0 || !Number.isFinite(o.counters[k])) problems.push(`${o.def.name} has ${o.counters[k]} ${k} counters`);
    if (!Number.isFinite(g.power(o)) || !Number.isFinite(g.toughness(o))) problems.push(`${o.def.name} has P/T ${g.power(o)}/${g.toughness(o)}`);
    if (o.attachedTo && o.attachedTo.zone !== "battlefield") problems.push(`${o.def.name} attached to a gone object`);
  }
  // card count conservation per player (non-token cards)
  for (const p of g.players) {
    if (p.lost) continue;
    const n = ["library", "hand", "graveyard", "exile", "command"].reduce((s, z) => s + p[z].length, 0) + g.battlefield.filter(o => o.owner === p && !o.isToken).length + g.stack.filter(it => it.o.owner === p && !it.isCopy).length;
    if (n !== p.startCards) problems.push(`${p.name} has ${n} cards, started with ${p.startCards}`);
  }
  return problems.map(s => `[${where}] ${s}`);
}

async function runOne(seed, seats) {
  const players = seats.map((deck, i) => ({
    name: seats.filter(d => d === deck).length > 1 ? `${deck.name} ${"ABCDEF"[i]}` : deck.name, commander: deck.commander, list: deck.list, identity: deck.identity,
    agent: MK.AI.create({ skill: 0.85, aggression: deck.aggression == null ? 0.55 : deck.aggression })
  }));
  const problems = [];
  const errors = [];
  let g;
  const ui = {
    anim(kind) { if (kind === "turn") problems.push(...checkInvariants(g, "turn " + g.turn)); },
    log(e) { if (LOGGAME) console.log(`  t${e.turn} ${e.text}`); }
  };
  g = new MK.Game({ seed, players, strict: STRICT, maxTurns: MAXTURNS, ui });
  for (const p of g.players) p.startCards = p.library.length + p.command.length;
  const origWarn = g.warn.bind(g);
  g.warn = (err, o) => { errors.push(`${o && o.def ? o.def.name : "?"}: ${err && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : err}`); if (STRICT) throw err; };
  const t0 = Date.now();
  try { await g.play(); } catch (e) { errors.push("CRASH: " + (e.stack || e)); }
  problems.push(...checkInvariants(g, "end"));
  return {
    seed, winner: g.winner ? g.winner.name : null, draw: !!(g.endInfo && g.endInfo.draw), turns: g.turn, rounds: g.round,
    ms: Date.now() - t0, errors, problems: [...new Set(problems)].slice(0, 20), spells: g.stats.spells, triggers: g.stats.triggers,
    players: g.players.map(p => ({ name: p.name, life: p.life, lost: p.lost, why: p.lostReason, dmg: p.stats.dmg, gained: p.stats.gained, tokens: p.stats.tokens, casts: Object.values(p.stats.cast).reduce((a, b) => a + b, 0) })),
    logs: g.logs
  };
}

(async () => {
  const pool = deckPool();
  const wanted = String(opt("decks", "miku")).split(",");
  const results = [];
  const wins = {};
  const seatsFor = (i) => {
    const out = [];
    for (let k = 0; k < PLAYERS; k++) {
      const w = wanted[k % wanted.length];
      if (w === "random") {
        const ids = Object.keys(pool).filter(id => id !== "miku");
        out.push(pool[ids[(SEED * 7919 + i * 31 + k * 17) % ids.length]] || pool.miku);
      } else out.push(pool[w] || pool.miku);
    }
    return out;
  };
  for (let i = 0; i < GAMES; i++) {
    const seats = seatsFor(i);
    const r = await runOne(SEED + i, seats);
    results.push(r);
    const key = r.winner || (r.draw ? "draw" : "none");
    wins[key] = (wins[key] || 0) + 1;
    const flag = r.errors.length || r.problems.length ? " !!" : "";
    console.log(`game ${i + 1} seed ${r.seed}: ${r.winner || "no winner"} on turn ${r.turns} (round ${r.rounds}), ${r.spells} spells, ${r.triggers} triggers, ${r.ms} ms${flag}`);
    if (VERBOSE || flag) {
      for (const e of r.errors.slice(0, 5)) console.log("   error:", e);
      for (const pr of r.problems.slice(0, 5)) console.log("   problem:", pr);
      if (VERBOSE) console.log("   ", r.players.map(p => `${p.name}: ${p.life} life${p.lost ? " (out: " + p.why + ")" : ""}, dealt ${p.dmg}, gained ${p.gained}, ${p.tokens} tokens`).join("; "));
    }
  }
  const errs = results.reduce((s, r) => s + r.errors.length, 0);
  const probs = results.reduce((s, r) => s + r.problems.length, 0);
  const avgRounds = results.reduce((s, r) => s + r.rounds, 0) / results.length;
  console.log(`\n${GAMES} games. Wins: ${Object.entries(wins).map(([k, v]) => `${k} ${v}`).join(", ")}. Average length ${avgRounds.toFixed(1)} rounds. Errors ${errs}, invariant problems ${probs}.`);
  if (opt("json", null)) require("fs").writeFileSync(opt("json"), JSON.stringify(results.map(r => Object.assign({}, r, { logs: undefined })), null, 1));
  process.exitCode = errs || probs ? 1 : 0;
})();
