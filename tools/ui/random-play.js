#!/usr/bin/env node
/* Plays your seat through the real game screen by tapping at random: lands, spells, abilities,
   attacks, blocks, responses and answers, against the normal bots. Reports page errors, "Display
   error" log lines, cards that glow but offer nothing, and stalls (nothing moves for 20 seconds).
   node tools/ui/random-play.js --hero miku-precon --games 3 [--seed 1] [--pool precon] [--site miku] [--minutes 6]
   Exits 1 when something is reported. */
"use strict";
const { serve, launch, openPlay, rng, answer } = require("./serve");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const HERO = opt("hero", "miku"), SITE = opt("site", "miku"), POOL = opt("pool", "precon");
const GAMES = +opt("games", 2), MINUTES = +opt("minutes", 6), STALL = 20000;
const rnd = rng(+opt("seed", 1));
const pick = a => a[Math.floor(rnd() * a.length)];
const issues = [];
let gameNo = 0;
const note = (kind, msg, extra) => { const s = `game ${gameNo}: ${kind}: ${msg}`; if (issues.includes(s)) return; issues.push(s); console.log("  " + s); if (extra) console.log("     ", JSON.stringify(extra).slice(0, 800)); };

async function clickAny(page, sel) {
  const els = [];
  for (const e of await page.$$(sel)) if (await e.isVisible()) els.push(e);
  if (!els.length) return false;
  await pick(els).click({ timeout: 1500 });
  return true;
}
const sheetOpen = page => page.$(".mg-sheet.on");

async function act(page, st) {
  if (st.mull) return page.click(".btns [data-m='1']");
  if (st.sheet && st.sheetMode === "prompt") return answer(page, rnd);
  if (st.sheet) {
    if (st.sheetMode === "inspect" && rnd() < 0.85 && await clickAny(page, ".mg-sheet.on .use:not([disabled])")) return;
    return page.evaluate(() => MikuGame.Lobby.table.closeSheet());
  }
  switch (st.mode) {
    case "main": {
      const r = rnd();
      if (r < 0.55) {
        const cands = await page.$$(".mg-hand .hc.can, .mg-cmd.can");
        if (cands.length) {
          const el = pick(cands), name = await el.getAttribute("aria-label");
          await el.click({ timeout: 1500 });
          await page.waitForTimeout(80);
          const ok = await page.$$(".mg-sheet.on .use:not([disabled])");
          if (!ok.length) { note("glows but offers nothing", name); return page.evaluate(() => MikuGame.Lobby.table.closeSheet()); }
          return pick(ok).click({ timeout: 1500 });
        }
      }
      if (r < 0.8 && await clickAny(page, ".mg-board.me .mc")) {
        await page.waitForTimeout(60);
        const ok = await page.$$(".mg-sheet.on .use:not([disabled])");
        if (ok.length && rnd() < 0.7) return pick(ok).click({ timeout: 1500 });
        return page.evaluate(() => MikuGame.Lobby.table.closeSheet());
      }
      return page.click(rnd() < 0.8 ? "[data-act='pass']" : "[data-act='endturn'], [data-act='pass']");
    }
    case "attack":
      if (rnd() < 0.3) await clickAny(page, ".mg-seat:not(.out)");
      if (rnd() < 0.5) await page.click("[data-act='atkall']");
      else for (let i = 0; i < 3 && !(await sheetOpen(page)); i++) await clickAny(page, ".mg-board.me .mc");
      if (await sheetOpen(page)) return;
      return page.click("[data-act='atkgo']");
    case "block":
      if (rnd() < 0.5) await page.click("[data-act='blkauto']");
      else for (let i = 0; i < 2 && !(await sheetOpen(page)); i++) await clickAny(page, ".mg-board.me .mc");
      if (await sheetOpen(page)) return;
      return page.click("[data-act='blkgo']");
    case "respond":
      if (rnd() < 0.5) { await page.click("[data-act='respond']"); await page.waitForTimeout(60); if (await clickAny(page, ".mg-sheet.on .use")) return; }
      return page.click("[data-act='rpass']");
    case "wait": return page.click("[data-act='ff']", { timeout: 1500 });
    case "prompt": return page.click("[data-act='prompt']");
    default: return null;
  }
}

(async () => {
  const srv = await serve();
  const browser = await launch();
  for (gameNo = 1; gameNo <= GAMES; gameNo++) {
    const { ctx, page } = await openPlay(browser, srv, { site: SITE, hero: HERO, pool: POOL }, (k, m) => note(k, m));
    const t0 = Date.now();
    let sig = "", moved = Date.now(), stalled = false, steps = 0;
    for (;;) {
      const st = await page.evaluate(() => {
        const t = MikuGame.Lobby.table, g = t.g, me = t.me;
        const sheet = document.querySelector(".mg-sheet.on");
        return {
          over: g.over || me.lost, mode: t.mode, sheetMode: t.sheetMode, sheet: !!sheet, mull: !!document.querySelector(".mg-mull"),
          sig: [g.turn, g.phase, g.logs.length, t.mode, g.stack.length, me.life, me.hand.length].join("|"), round: g.round, life: me.life,
          winner: g.winner && g.winner.name, display: [...document.querySelectorAll(".mg-log li")].filter(l => /Display error/.test(l.textContent)).map(l => l.textContent)
        };
      });
      for (const d of st.display) note("display error", d);
      if (st.over) { console.log(`  game ${gameNo}: over in round ${st.round}, ${st.winner ? st.winner + " won" : "you lost"}, your life ${st.life}, ${steps} taps`); break; }
      if (st.sig !== sig) { sig = st.sig; moved = Date.now(); stalled = false; }
      else if (!stalled && Date.now() - moved > STALL) {
        stalled = true;
        note("stall", `nothing moved for ${STALL / 1000}s`, await page.evaluate(() => { const t = MikuGame.Lobby.table, g = t.g; return { mode: t.mode, sheetMode: t.sheetMode, asking: t.asking, phase: g.phase, active: g.active.name, stack: g.stack.map(i => i.name), log: g.logs.slice(-6).map(e => e.text) }; }));
      }
      if (Date.now() - t0 > MINUTES * 60000) { console.log(`  game ${gameNo}: stopped after ${MINUTES} minutes (round ${st.round})`); break; }
      steps++;
      try { await act(page, st); } catch (e) {
        if (!/intercepts pointer|Timeout|detached|not attached|not visible|not stable|outside of the viewport|Target closed/.test(e.message)) note("driver", e.message.split("\n")[0]);
      }
      await page.waitForTimeout(60);
    }
    await ctx.close();
  }
  console.log(`${HERO}: ${issues.length} problem${issues.length === 1 ? "" : "s"}.`);
  await browser.close(); srv.close();
  process.exitCode = issues.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
