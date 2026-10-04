#!/usr/bin/env node
/* Plays your seat through the real game screen by tapping at random: lands, spells, abilities,
   attacks, blocks, responses and answers, against the normal bots. Reports page errors, "Display
   error" log lines, cards that glow but offer nothing, and stalls (nothing moves for 20 seconds).
   node tools/ui/random-play.js --hero miku-precon --games 3 [--seed 1] [--pool precon] [--site miku] [--minutes 6]
   --assess plays Corrupted Etrata's assessment games from the Train tab instead, then opens each
   game's review and replays one key moment.
   Exits 1 when something is reported. */
"use strict";
const { serve, launch, openPlay, rng, answer } = require("./serve");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const HERO = opt("hero", "miku"), SITE = opt("site", "miku"), POOL = opt("pool", "precon");
const GAMES = +opt("games", 2), MINUTES = +opt("minutes", 6), STALL = 20000, ASSESS = !!opt("assess", false);
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

/* The Train tab's assessment game: same table, with the recorder on. */
let assessPage = null;
async function openAssess(browser, srv, onError) {
  // one page for every game, so the saved games pile up the way they would for a person
  if (assessPage) {
    const { ctx, page } = assessPage;
    await page.goto(`http://127.0.0.1:${srv.address().port}/corrupted-etrata/#train/games`);
    await page.reload();
    await page.waitForSelector("[data-assess]", { timeout: 20000 });
    await page.click("[data-assess]");
    await page.waitForFunction(() => window.MikuGame && MikuGame.Lobby.table && MikuGame.Lobby.table.g && !MikuGame.Lobby.table.g.over, null, { timeout: 30000 });
    return { ctx, page };
  }
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  assessPage = { ctx, page };
  await page.route("**/api.scryfall.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], not_found: [] }) }));
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  page.on("pageerror", e => onError("page error", e.message + " | " + String(e.stack || "").split("\n").slice(1, 4).join(" | ")));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|scryfall/i.test(m.text())) onError("console error", m.text()); });
  page.on("dialog", d => d.accept());
  await page.addInitScript(() => localStorage.setItem("cetrataWiki.game.settings.v1", JSON.stringify({ speed: "fast", askTriggers: true, stopOnSpells: false })));
  await page.goto(`http://127.0.0.1:${srv.address().port}/corrupted-etrata/#train/games`);
  await page.waitForSelector("[data-assess]", { timeout: 20000 });
  await page.click("[data-assess]");
  await page.waitForFunction(() => window.MikuGame && MikuGame.Lobby.table && MikuGame.Lobby.table.g, null, { timeout: 30000 });
  return { ctx, page };
}
/* After an assessment game: the review opens and analyzes itself (every decision, then the costly
   ones in depth, in workers), and renders the score, the chart and the deep moment cards. */
async function checkReview(page) {
  try {
    await page.waitForSelector(".mg-over [data-e='review']", { timeout: 15000 });
    await page.click(".mg-over [data-e='review']");
    await page.waitForSelector(".tn-review", { timeout: 15000 });
    const t0 = Date.now();
    await page.waitForFunction(() => {
      const a = JSON.parse(localStorage.getItem("cetrataWiki.analysis.v2") || "{}"), id = (JSON.parse(localStorage.getItem("cetrataWiki.games.v1") || "[]")[0] || {}).id;
      return id && a[id] && a[id].sum && !document.querySelector(".tn-progress");
    }, null, { timeout: 600000, polling: 1000 });
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => {
      const a = JSON.parse(localStorage.getItem("cetrataWiki.analysis.v2")), rec = JSON.parse(localStorage.getItem("cetrataWiki.games.v1"))[0], an = a[rec.id];
      const deep = Object.values(an.deep || {});
      return {
        decisions: (rec.moments || []).filter(m => !m.replayed).length, quick: Object.keys(an.quick).length, qerr: Object.values(an.quick).filter(x => x.error).map(x => x.error).slice(0, 3),
        deep: deep.length, derr: deep.filter(x => x.error).map(x => x.error).slice(0, 3), acc: an.sum.accuracy, skill: an.sum.skill, luck: an.sum.luck,
        cards: document.querySelectorAll(".tn-mo").length, rows: document.querySelectorAll(".tn-mo.open .tn-cands tbody tr").length, chart: !!document.querySelector(".tn-chart svg .dot"),
        flags: document.querySelectorAll(".tn-flag").length, workers: !!(window.MikuApp && window.MikuApp.gameInfo)
      };
    });
    console.log(`  game ${gameNo}: analyzed ${r.quick}/${r.decisions} decisions and ${r.deep} in depth in ${((Date.now() - t0) / 1000).toFixed(0)} s: accuracy ${r.acc}, skill ${r.skill}, luck ${r.luck}; ${r.cards} moment cards (${r.rows} options open), ${r.flags} flags, chart ${r.chart}`);
    if (r.quick < r.decisions) note("review", "not every decision was analyzed", r);
    if (r.qerr.length || r.derr.length) note("review", "analysis errors", { q: r.qerr, d: r.derr });
    if (!r.chart) note("review", "no chart");
    if (r.deep && !r.rows) note("review", "the open moment shows no options", r);
  } catch (e) { note("review", e.message.split("\n")[0]); }
}

(async () => {
  const srv = await serve();
  const browser = await launch();
  for (gameNo = 1; gameNo <= GAMES; gameNo++) {
    const { ctx, page } = ASSESS ? await openAssess(browser, srv, (k, m) => note(k, m)) : await openPlay(browser, srv, { site: SITE, hero: HERO, pool: POOL }, (k, m) => note(k, m));
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
    if (ASSESS) await checkReview(page);
    if (ASSESS && opt("shots", false)) await page.screenshot({ path: `${opt("shots")}/review-${gameNo}.png`, fullPage: true });
    if (ASSESS && gameNo === GAMES) {
      // the personal analysis (as a preview while it's still locked) reads every saved game
      await page.goto(page.url().replace(/#.*/, "#train/report"));
      await page.waitForTimeout(800);
      if (await page.$("[data-peek]")) await page.click("[data-peek]");
      await page.waitForSelector(".tn-report", { timeout: 15000 }).catch(() => note("report", "the analysis didn't render"));
      if (opt("shots", false)) await page.screenshot({ path: `${opt("shots")}/report.png`, fullPage: true });
    }
    if (!ASSESS || gameNo === GAMES) await ctx.close();
  }
  console.log(`${HERO}: ${issues.length} problem${issues.length === 1 ? "" : "s"}.`);
  await browser.close(); srv.close();
  process.exitCode = issues.length ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });
