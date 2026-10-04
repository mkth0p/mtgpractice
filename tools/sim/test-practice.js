#!/usr/bin/env node
/* Checks practice mode (miku/game/practice.js): a recorded game replays exactly from its seed and
   the recorded answers, a branch changes what follows, and the moment analysis runs.
   node tools/sim/test-practice.js [--games 6]       (exits 1 if a check fails) */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
for (const f of ["practice.js", "train-cetrata.js"]) if (fs.existsSync(path.join(dir, f))) require(path.join(dir, f));
const MK = globalThis.MK, P = MK.Practice;
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : args[i + 1]; };
const GAMES = +opt("games", 6);

let passed = 0, failed = 0;
function check(name, cond, extra) {
  if (cond) { passed++; return; }
  failed++;
  console.log("FAIL:", name, extra == null ? "" : JSON.stringify(extra).slice(0, 400));
}
const pick = (arr, seed) => arr[seed % arr.length];

/* Plays a game the way the table does, with a bot standing in for the person behind the recorder. */
async function recordGame(seed, heroId) {
  const precons = MK.BOT_DECKS.filter(d => (d.bracket || 4) < 4);
  const seats = [{ deck: heroId, name: "You" }];
  for (let k = 0; k < 3; k++) { const d = pick(precons, seed * 3 + k); seats.push({ deck: d.id, name: d.name, skill: 0.9, aggression: d.aggression }); }
  const rec = P.newRecord({ deck: heroId, seed: 1000 + seed, hero: 0, seats });
  const person = MK.AI.create({ skill: 0.8 });
  const g = P.buildGame(rec, (i, d, s) => i === 0 ? P.record(person, { rec }) : MK.AI.create({ skill: s.skill, aggression: s.aggression }));
  await g.play();
  rec.result = { winner: g.winner ? g.winner.idx : null, turn: g.turn };
  return { rec, g };
}
const logText = g => g.logs.map(e => e.text).join("\n");

(async () => {
  check("practice module loaded", !!P && typeof P.replay === "function");
  let total = 0;
  for (let s = 1; s <= GAMES; s++) {
    const { rec, g } = await recordGame(s, "corrupted-etrata");
    total += rec.answers.length;
    check(`game ${s}: answers recorded`, rec.answers.length > 10 && rec.kinds.length === rec.answers.length, rec.answers.length);
    check(`game ${s}: moments snapshotted`, rec.moments.length > 3, rec.moments.length);
    // the record survives JSON
    const back = JSON.parse(JSON.stringify(rec));
    const r = await P.replay(back, {});
    check(`game ${s}: replay doesn't diverge`, !r.diverged && !r.error, r.diverged || r.error);
    check(`game ${s}: replay ends the same`, r.g.turn === g.turn && (r.g.winner ? r.g.winner.idx : null) === rec.result.winner, { was: rec.result, now: { turn: r.g.turn, w: r.g.winner && r.g.winner.idx } });
    const la = g.logs.map(e => e.text), lb = r.g.logs.map(e => e.text);
    const at = la.findIndex((t, k) => t !== lb[k]);
    check(`game ${s}: same log line for line`, logText(r.g) === logText(g), at < 0 ? { lengths: [la.length, lb.length] } : { at, was: la.slice(Math.max(0, at - 2), at + 2), now: lb.slice(Math.max(0, at - 2), at + 2) });
    // stop at a moment: the state there matches the snapshot
    const m = rec.moments[Math.floor(rec.moments.length / 2)];
    let seen = null;
    await P.replay(back, { at: m.i, onAt: (g2, p) => { seen = { t: g2.turn, hand: p.hand.map(o => o.def.name).join("|"), life: g2.players.map(q => q.lost ? 0 : q.life).join(",") }; return { stop: true }; } });
    check(`game ${s}: stopping at moment ${m.i} rebuilds that moment`, seen && seen.t === m.t && seen.hand === m.hand.join("|") && seen.life === m.life.join(","), { seen, m: { t: m.t, hand: m.hand.join("|"), life: m.life.join(",") } });
  }
  console.log(`${GAMES} games, ${total} answers recorded`);
  // analysis of one moment
  const { rec } = await recordGame(2, "corrupted-etrata");
  const mains = rec.moments.filter(m => m.k === "main" && m.mine && m.acts && m.acts.length > 2);
  if (mains.length) {
    const t0 = Date.now();
    const a = await P.analyzeMoment(rec, mains[0].i, { n: 6, horizon: 2 });
    check("analysis: candidates scored", !a.error && a.cands.length >= 2 && a.cands.every(c => c.eq >= 0 && c.eq <= 1), a);
    check("analysis: your choice is among them", a.cands.some(c => c.tags.includes("you")), a.cands.map(c => c.tags));
    console.log(`analysis of answer ${mains[0].i} (${a.cands.length} options x 6 rollouts) took ${Date.now() - t0} ms; best "${a.best}", yours "${a.mine}" (loss ${a.loss && a.loss.toFixed(3)})`);
  }
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
