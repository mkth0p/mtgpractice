#!/usr/bin/env node
/* Computes the mulligan values the Mulligan Lab drill grades against (MULL in train-cetrata.js):
   the expected goldfish value of taking a mulligan, for each mulligan count, assuming you then keep
   or mulligan again optimally. Commander's first mulligan is free; later ones bottom one card each;
   the game makes you keep after five. A goldfish only counts speed, so each card bottomed also costs
   LAMBDA (cards matter against real opponents): 0.15 keeps about half of first sevens (the free mulligan is worth a lot) and
   about seven sevens in ten after it.
   --deck heist: the Etrata heist closer's module (train-heist.js) instead.
   node tools/sim/mull-values.js [--deck heist] [--hands 500] [--lambda 0.1] [--write] */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
require(path.join(dir, "engine.js"));
require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon|checklist)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
require(path.join(dir, "ai.js"));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const HEIST = opt("deck", "") === "heist";
const MODULE = HEIST ? "train-heist.js" : "train-cetrata.js";
if (HEIST) require(path.join(dir, "coach-heist.js"));
require(path.join(dir, MODULE));
const T = globalThis.MK.TRAIN[HEIST ? "etrata-heist-aggro" : "corrupted-etrata"];
const HANDS = +opt("hands", 500), WRITE = !!opt("write", false), LAMBDA = +opt("lambda", 0.15);
const t0 = Date.now();
// values of kept hands at mulligan count m (cards bottomed: m - 1)
const vals = {};
for (let m = 1; m <= 5; m++) {
  vals[m] = [];
  for (let s = 0; s < HANDS; s++) {
    const h = T.dealHand(90000 + m * 10007 + s);
    const k = Math.max(0, m - 1);
    const kept = k ? T.bestBottom(h, k, { n: 120 }).hand : h;
    vals[m].push(T.handValue(kept, { n: 200 }).value);
  }
  process.stderr.write(`level ${m} done (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
}
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
function policy(lambda) {
  const M = new Array(6).fill(null);
  const adj = m => vals[m].map(v => v - lambda * Math.max(0, m - 1));
  M[5] = mean(adj(5));
  for (let m = 4; m >= 1; m--) M[m] = mean(adj(m).map(v => Math.max(v, M[m + 1])));
  return { M, keep1: vals[1].filter(v => v >= M[1]).length / HANDS, keep2: vals[1].filter(v => v >= M[2]).length / HANDS };
}
for (const l of [0, 0.05, 0.08, 0.1, 0.12, 0.15]) { const r = policy(l); console.log(`lambda ${l}: keep ${(100 * r.keep1).toFixed(0)}% of first sevens, ${(100 * r.keep2).toFixed(0)}% after the free one; MULL ${JSON.stringify(r.M.slice(1).map(x => +x.toFixed(3)))}`); }
const { M: MULL } = policy(LAMBDA);
console.log("average 7-card hand value", mean(vals[1]).toFixed(4));
const out = [null].concat(MULL.slice(1).map(x => +x.toFixed(4)), [LAMBDA]);
if (WRITE) {
  const file = path.join(dir, MODULE);
  const src = fs.readFileSync(file, "utf8");
  const block = `/*MULL*/ MULL = ${JSON.stringify(out)}; /*MULL-END*/`;
  const res = src.includes("/*MULL*/") ? src.replace(/\/\*MULL\*\/[\s\S]*?\/\*MULL-END\*\//, block) : src.replace("  let MULL = null;", "  let MULL = null;\n  " + block);
  fs.writeFileSync(file, res);
  console.log("wrote MULL into " + MODULE);
}
