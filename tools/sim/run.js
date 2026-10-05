#!/usr/bin/env node
/* Headless games between bots, to test the Miku game engine, the cards and the bot decks.
   node tools/sim/run.js --games 50 --seed 1 --decks miku,random --players 4 [--strict] [--verbose] [--first random]
   Prints win rates, game lengths and any engine errors or broken invariants.
   In --decks, "random" is any bot deck, "random2" a Bracket 2 precon and "random4" a Bracket 4 deck.
   --first random picks who goes first at random, like the Play tab does (the default is the first seat).
   --chaos plays the first seat like a careless human: any legal play, any attack, block, answer or
   target the screen would offer, at random. It finds the paths the bots never take (your own
   Swords on your own creature, X=0, skipped targets) and reports any play that did nothing. */
"use strict";
const path = require("path");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
// cards-*.js (other player decks) load next, then the Bracket 4 bots (decks-*.js), then the precons
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
// --files decks-krenko.js,precon-lathril.js loads only those deck files (default: all of them).
// Bracket 4 decks (decks-*.js) load before the precons (precon-*.js), as on the site, so their cards win.
const onlyFiles = opt("files", null);
for (const f of require("fs").readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) {
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
const FIRST = opt("first", "0");
const CHAOS = !!opt("chaos", false);

/* Every deck by id: the bot decks, plus the decks a player can pilot (MK.HERO_DECKS: the Miku
   precon, budget and full upgrades, Azusa, Etrata). "miku" is the full upgraded Trostani list. */
function deckPool() {
  const pool = { miku: MK.MIKU_DECK };
  for (const d of MK.HERO_DECKS || []) pool[d.id] = d;
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
      if (o.def !== o.cardDef && !o.isToken) problems.push(`${o.cardDef.name} in ${p.name}'s ${z} still looks like ${o.def.name}`);
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
    const n = ["library", "hand", "graveyard", "exile", "command"].reduce((s, z) => s + p[z].length, 0) + g.battlefield.concat(g.phased).filter(o => o.owner === p && !o.isToken).length + g.stack.filter(it => it.kind === "spell" && it.o.owner === p && !it.isCopy).length;
    if (n !== p.startCards) problems.push(`${p.name} has ${n} cards, started with ${p.startCards}`);
  }
  return problems.map(s => `[${where}] ${s}`);
}

/* The --chaos seat: every choice at random among what the Play tab would offer a person. */
function chaosAgent(seed, noted) {
  let s = seed | 0;
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const pick = a => a[Math.floor(rnd() * a.length)];
  const helper = MK.AI.create({ skill: 1 });
  let tries = 0;
  const act = (g, p, acts) => {
    if (!acts.length) return null;
    const lands = acts.filter(a => a.type === "land");
    const a = lands.length && rnd() < 0.8 ? pick(lands) : pick(acts);
    if (a.type === "activate" && !a.ab.tap && a.ab.loyalty == null && !a.ab.once && !a.ab.sacSelf && rnd() < 0.2) a.repeat = 1 + Math.floor(rnd() * 5);
    return a;
  };
  return {
    mulligan: () => true,
    async main(g, p) {
      if (++tries > 60 || rnd() < 0.2) { tries = 0; return { type: "pass", skipCombat: rnd() < 0.2 }; }
      const a = act(g, p, g.legalActions(p));
      if (!a) { tries = 0; return { type: "pass" }; }
      const before = g.logs.length, zone = a.card.zone;
      const orig = g.perform.bind(g);
      // report a play the screen offers that then does nothing (the "frozen" card)
      g.perform = async (pl, x) => { g.perform = orig; const ok = await orig(pl, x); if (!ok && g.logs.length === before && a.card.zone === zone && !g.over) noted(`${a.type} ${a.card.def.name} (${zone}) did nothing`); return ok; };
      return a;
    },
    attack(g, p, { candidates, targets }) {
      const out = [];
      for (const c of candidates) if (rnd() < 0.6) out.push({ attacker: c, target: pick(targets) });
      return out;
    },
    block(g, p, { attackers }) {
      const out = [];
      for (const b of g.creatures(p)) { const can = attackers.filter(a => g.canBlock(b, a)); if (can.length && rnd() < 0.5) out.push({ blocker: b, attacker: pick(can) }); }
      return out;
    },
    respond(g, p, ctx) { return rnd() < 0.3 ? act(g, p, ctx.actions || []) : null; },
    choose(g, p, req) {
      // crew needs enough power, and the screen won't let you pick less
      if (rnd() < 0.3 || req.purpose === "crew") return helper.choose(g, p, req);
      const o = req.options || [];
      switch (req.type) {
        case "confirm": return rnd() < 0.5;
        case "number": return req.min + Math.floor(rnd() * (req.max - req.min + 1));
        case "option": return pick(o).id;
        case "target": case "player": return req.optional && rnd() < 0.15 ? null : pick(o);
        case "cards": case "targets": {
          const min = req.min || 0, max = req.max == null ? o.length : Math.min(req.max, o.length);
          const n = min + Math.floor(rnd() * (max - min + 1));
          return o.slice().sort(() => rnd() - 0.5).slice(0, n);
        }
        default: return helper.choose(g, p, req);
      }
    }
  };
}

async function runOne(seed, seats) {
  const noops = [];
  const players = seats.map((deck, i) => ({
    name: seats.filter(d => d === deck).length > 1 ? `${deck.name} ${"ABCDEF"[i]}` : deck.name, commander: deck.commander, list: deck.list, identity: deck.identity,
    agent: CHAOS && i === 0 ? chaosAgent(seed * 7 + 1, m => noops.push(m)) : MK.AI.create({ skill: 0.85, aggression: deck.aggression == null ? 0.55 : deck.aggression, casual: (deck.bracket || 4) <= 2 })
  }));
  const problems = [];
  const errors = [];
  let g;
  const ui = {
    anim(kind) { if (kind === "turn") problems.push(...checkInvariants(g, "turn " + g.turn)); },
    log(e) { if (LOGGAME) console.log(`  t${e.turn} ${e.text}`); }
  };
  g = new MK.Game({ seed, players, strict: STRICT, maxTurns: MAXTURNS, ui });
  // the deck ids, as the table sets them (a deck's bot brain keys on it)
  g.players.forEach((p, i) => { p.deckId = seats[i].id; });
  g.activeIdx = FIRST === "random" ? g.rand(players.length) : (+FIRST || 0) % players.length;
  for (const p of g.players) p.startCards = p.library.length + p.command.length;
  const origWarn = g.warn.bind(g);
  g.warn = (err, o) => { errors.push(`${o && o.def ? o.def.name : "?"}: ${err && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : err}`); if (STRICT) throw err; };
  const t0 = Date.now();
  try { await g.play(); } catch (e) { errors.push("CRASH: " + (e.stack || e)); }
  problems.push(...checkInvariants(g, "end"));
  problems.push(...noops.map(m => "[chaos] " + m));
  return {
    seed, winner: g.winner ? g.winner.name : null, draw: !!(g.endInfo && g.endInfo.draw), turns: g.turn, rounds: g.round,
    ms: Date.now() - t0, errors, problems: [...new Set(problems)].slice(0, 20), spells: g.stats.spells, triggers: g.stats.triggers,
    players: g.players.map(p => ({ name: p.name, life: p.life, lost: p.lost, why: p.lostReason, dmg: p.stats.dmg, gained: p.stats.gained, tokens: p.stats.tokens, casts: Object.values(p.stats.cast).reduce((a, b) => a + b, 0) })),
    logs: g.logs
  };
}

(async () => {
  const pool = deckPool();
  // --cut "miku-precon:Boon Reflection" plays that deck with the card replaced by a basic land (to test a card's weight)
  const cut = opt("cut", null);
  if (cut) {
    const [id, name] = String(cut).split(":");
    const d = pool[id];
    const i = d ? d.list.indexOf(name) : -1;
    if (i < 0) { console.error(`--cut: no ${name} in ${id}`); process.exit(2); }
    pool[id] = Object.assign({}, d, { list: d.list.map((n, k) => (k === i ? (d.identity.includes("W") ? "Plains" : d.identity.includes("U") ? "Island" : "Forest") : n)) });
  }
  const wanted = String(opt("decks", "miku")).split(",");
  const results = [];
  const wins = {};
  const seatsFor = (i) => {
    const out = [];
    for (let k = 0; k < PLAYERS; k++) {
      const w = wanted[k % wanted.length];
      if (/^random[24]?$/.test(w)) {
        const br = +w.slice(6) || 0;
        const bots = new Set((MK.BOT_DECKS || []).map(d => d.id));
        const ids = Object.keys(pool).filter(id => bots.has(id) && (!br || (pool[id].bracket || 4) === br));
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
