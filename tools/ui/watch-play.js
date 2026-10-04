#!/usr/bin/env node
/* Watches a bot game from the Play tab's "Watch bots play" button: every seat a bot, the screen
   following the deck picked in the lobby, then "Follow next" mid-game. Reports page errors, a game
   that never ends, and a finished game that changed your record.
   node tools/ui/watch-play.js [--site corrupted-etrata --hero corrupted-etrata]   (exits 1 on a problem) */
"use strict";
const { serve, launch } = require("./serve");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : args[i + 1]; };
const SITE = opt("site", "corrupted-etrata"), HERO = opt("hero", "corrupted-etrata");
const KEY = { miku: "mikuWiki", etrata: "etrataWiki", corrupted: "corruptedWiki" }[SITE] || ({ "corrupted-etrata": "cetrataWiki" }[SITE]);
(async () => {
  const srv = await serve(); const browser = await launch();
  const ctx = await browser.newContext({ viewport: { width: +(process.env.W || 390), height: 844 } }); const page = await ctx.newPage();
  await page.route("**/api.scryfall.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], not_found: [] }) }));
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  const errs = []; page.on("pageerror", e => errs.push("PAGEERR " + e.message)); page.on("console", m => { if (m.type() === "error" && !/Failed to load|scryfall/.test(m.text())) errs.push("CONSOLE " + m.text()); });
  await page.addInitScript(([k, h]) => localStorage.setItem(k + ".game.settings.v1", JSON.stringify({ opponents: 3, speed: "fast", pool: "precon", picks: ["kaalia", "lathril"], hero: h })), [KEY, HERO]);
  await page.goto(`http://127.0.0.1:${srv.address().port}/${SITE}/#play`);
  await page.waitForSelector("[data-watch]", { timeout: 20000 });
    const follows = await page.$$eval("[data-follow]", bs => bs.map(b => b.textContent));
  if (follows.length < 3) errs.push("the lobby offers " + follows.length + " seats to follow, not your deck and the two picks");
  await page.click("[data-follow='kaalia']");
  await page.click("[data-watch]");
  await page.waitForFunction(() => window.MikuGame && MikuGame.Lobby.table && MikuGame.Lobby.table.g, null, { timeout: 20000 });
  console.log(await page.evaluate(() => { const t = MikuGame.Lobby.table; return { me: t.me.name, watching: t.watching, players: t.g.players.map(p => p.name) }; }));
  const t0 = Date.now(); let followed = false;
  while (Date.now() - t0 < 240000) {
    const st = await page.evaluate(() => { const t = MikuGame.Lobby.table; return t ? { over: t.g.over, mode: t.mode, round: t.g.round, me: t.me.name } : null; });
    if (!st || st.over) break;
    if (!followed && st.round >= 2) {
      followed = true;
      const before = await page.evaluate(() => MikuGame.Lobby.table.me.name);
      await page.click("[data-act='follow']", { timeout: 3000 }).catch(e => errs.push("Follow next: " + e.message.split("\n")[0]));
      const after = await page.evaluate(() => MikuGame.Lobby.table.me.name);
      if (after === before) errs.push("Follow next didn't change the seat");
    }
    if (st.mode === "wait") await page.click("[data-act='ff']", { timeout: 800 }).catch(() => {});
    await page.waitForTimeout(150);
  }
  await page.waitForSelector(".mg-over", { timeout: 20000 }).catch(() => errs.push("the game never showed its end screen"));
  const res = await page.evaluate(() => { const t = MikuGame.Lobby.table; const o = document.querySelector(".mg-over"); return { round: t && t.g.round, winner: t && t.g.winner && t.g.winner.name, over: o && o.innerText.slice(0, 600), stats: localStorage.getItem(Object.keys(localStorage).find(k => /\.game\.stats/.test(k))) }; });
  console.log(res);
  if (res.stats) errs.push("a watched game changed your record");
  for (const e of errs) console.log("  problem: " + e);
  console.log(`watch: ${errs.length} problem${errs.length === 1 ? "" : "s"}.`);
  process.exitCode = errs.length ? 1 : 0;
  await browser.close(); srv.close();
})();
