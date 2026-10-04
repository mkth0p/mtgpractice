#!/usr/bin/env node
/* Runs a small tournament in the Arena tab, in its workers: checks every page draws, the race and
   the standings agree, a cup crowns its champion, and that "Watch" replays a tournament game on the
   table with the same result. Screenshots go to --shots DIR when given.
   node tools/ui/arena-play.js [--site miku] [--format league] [--games 40] [--shots /tmp/arena]   (exits 1 on a problem) */
"use strict";
const fs = require("fs");
const { serve, launch } = require("./serve");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : args[i + 1]; };
const SITE = opt("site", "miku"), FORMAT = opt("format", "league"), GAMES = +opt("games", 40), SHOTS = opt("shots", null);
const W = +(process.env.W || 390);
(async () => {
  const srv = await serve(); const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: 844 }, acceptDownloads: true }); const page = await ctx.newPage();
  await page.route("**/api.scryfall.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], not_found: [] }) }));
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  const errs = []; page.on("pageerror", e => errs.push("PAGEERR " + e.message)); page.on("console", m => { if (m.type() === "error" && !/Failed to load|scryfall/.test(m.text())) errs.push("CONSOLE " + m.text()); });
  const cfg = { format: FORMAT, games: GAMES, pod: 4, rounds: 3, series: 1, top: 4, koSeries: 3, level: "sharp", casual: true, seed: 42 };
  if (FORMAT === "cup") cfg.entrants = ["edgar", "ghalta", "krenko", "talrand", "lathril", "kaalia", "miku", "etrata"];
  await page.addInitScript(c => { if (!sessionStorage.getItem("armed")) { sessionStorage.setItem("armed", "1"); for (const k of ["mikuWiki", "etrataWiki", "corruptedWiki", "cetrataWiki"]) localStorage.setItem(k + ".game.settings.v1", JSON.stringify({ speed: "fast" })); localStorage.setItem("mtgArena.cfg.v1", JSON.stringify(c)); } }, cfg);
  const base = `http://127.0.0.1:${srv.address().port}/${SITE}/`;
  const shot = async n => { if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: `${SHOTS}/${n}-${W}.png`, fullPage: false }); } };
  await page.goto(base + "#arena/setup");
  await page.waitForSelector("[data-start]", { timeout: 30000 });
  const tabs = await page.$$eval(".tabbar [data-tab], .topnav [data-tab]", ts => ts.map(t => t.dataset.tab));
  if (!tabs.includes("arena")) errs.push("no Arena tab in the nav");
  const picks = await page.$$eval("[data-pick]", bs => bs.length);
  if (picks < 15) errs.push(`only ${picks} decks to pick`);
  await shot("setup");
  await page.click("[data-start]");
  await page.waitForFunction(() => location.hash === "#arena/live", null, { timeout: 5000 }).catch(() => errs.push("start didn't open Live"));
  const t0 = Date.now();
  await page.waitForTimeout(2500);
  await shot("live");
  await page.waitForFunction(() => { const R = window.MikuArena && MikuArena.state(); return R && R.st && R.st.status === "done" && !R.running; }, null, { timeout: 300000 }).catch(() => errs.push("the tournament never finished"));
  const sum = await page.evaluate(() => { const R = MikuArena.state(), st = R.st; return { games: st.games.filter(Boolean).length, errors: st.games.filter(g => g && g.err).map(g => g.msg), workers: R.size, champion: st.champion, ko: st.ko && st.ko.stages.map(s => s.label + ": " + (s.through || []).join(",")) }; });
  console.log(`${FORMAT}: ${sum.games} games in ${((Date.now() - t0) / 1000).toFixed(1)}s on ${sum.workers} workers, champion ${sum.champion}`, sum.ko || "");
  if (!sum.workers) errs.push("no workers started: the games ran on the page");
  if (sum.errors.length) errs.push("engine errors: " + sum.errors.slice(0, 3).join(" | "));
  if (!sum.champion) errs.push("no champion");
  await page.waitForTimeout(400);
  await shot("live-done");
  const race = await page.$$eval(".ar-race li", ls => ls.map(l => [l.dataset.id, +l.style.transform.replace(/[^0-9.]/g, "")]).sort((a, b) => a[1] - b[1]).map(x => x[0]));
  // every page draws with the results
  for (const seg of ["standings", "matchups", "decks", "games", "saved"]) {
    await page.goto(base + "#arena/" + seg);
    await page.waitForSelector(`[data-arena="${seg}"] .ar`, { timeout: 10000 }).catch(() => errs.push(`${seg} didn't draw`));
    await page.waitForTimeout(300);
    await shot(seg);
  }
  await page.goto(base + "#arena/standings");
  await page.waitForSelector(".ar-table tbody tr");
  const table = await page.$$eval(".ar-table tbody tr", rs => rs.map(r => r.dataset.deck));
  if (table[0] !== race[0]) errs.push(`the race leader (${race[0]}) isn't the standings leader (${table[0]})`);
  if (FORMAT !== "cup" && table[0] !== sum.champion) errs.push("the champion doesn't top the table");
  const lines = await page.$$eval(".ar-svg path", ps => ps.length);
  if (!lines) errs.push("the rating chart has no lines");
  await page.goto(base + "#arena/matchups");
  await page.waitForSelector(".ar-heat button");
  await page.click(".ar-heat button");
  const note = await page.textContent(".ar-cellnote");
  if (!/finished above/.test(note)) errs.push("tapping a matchup square shows nothing");
  // watch the first game again on the table: same seed, same result
  await page.goto(base + "#arena/games");
  await page.waitForSelector("[data-arena=games] [data-watch]");
  const gi = await page.evaluate(() => { const st = MikuArena.state().st; const g = st.games.filter(x => x && !x.x).sort((a, b) => a.tn - b.tn)[0]; return g.gi; });
  await page.evaluate(gi => MikuArena.watch(gi), gi);
  await page.waitForSelector(".mg-table, .mg", { timeout: 20000 }).catch(() => {});
  const w0 = Date.now();
  while (Date.now() - w0 < 240000) {
    const over = await page.$(".mg-over");
    if (over) break;
    await page.click("[data-act='ff']", { timeout: 600 }).catch(() => {});
    await page.waitForTimeout(150);
  }
  const lw = await page.evaluate(() => MikuArena.state().lastWatch);
  console.log("watched game", gi + 1, lw);
  if (!lw) errs.push("the watched game never finished");
  else if (!lw.same) errs.push("the watched game ended differently from the tournament game");
  await shot("watch-over");
  const back = await page.$("[data-e='lobby']");
  if (back) { const label = await back.textContent(); if (!/Arena/.test(label)) errs.push("the end screen doesn't lead back to the Arena"); await back.click(); }
  for (const e of errs) console.log("  problem: " + e);
  console.log(`arena: ${errs.length} problem${errs.length === 1 ? "" : "s"}.`);
  process.exitCode = errs.length ? 1 : 0;
  await browser.close(); srv.close();
})();
