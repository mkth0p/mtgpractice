/* Shared by the screen tests: serves the repository on a free local port and opens the Play tab in
   Chromium (Playwright) with Scryfall and Google Fonts mocked, so the tests run offline.
   Needs Playwright: npm i -g playwright (the cloud sandbox already has it and a Chromium). */
"use strict";
const http = require("http"), fs = require("fs"), path = require("path");
let chromium;
try { ({ chromium } = require("playwright")); } catch (e) {
  try { ({ chromium } = require(path.join(require("child_process").execSync("npm root -g").toString().trim(), "playwright"))); } catch (e2) { console.error("Playwright is missing: npm i -g playwright"); process.exit(2); }
}
const ROOT = path.join(__dirname, "../..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".webmanifest": "application/json", ".json": "application/json" };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, out) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p.endsWith("/")) p += "index.html";
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT)) { out.writeHead(403); return out.end(); }
      fs.readFile(f, (err, buf) => {
        if (err) { out.writeHead(404); return out.end(); }
        out.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" });
        out.end(buf);
      });
    });
    srv.listen(0, "127.0.0.1", () => res(srv));
  });
}
function launch() {
  const exe = ["/opt/pw-browsers/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"].find(f => { try { return fs.statSync(f).isFile(); } catch (e) { return false; } });
  return chromium.launch(exe ? { executablePath: exe } : {});
}
/* A phone-sized page on the Play tab with the given lobby settings; `issues` collects page errors. */
async function openPlay(browser, srv, { site = "miku", hero, pool = "precon", askTriggers = true }, onError) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.route("**/api.scryfall.com/**", r => r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], not_found: [] }) }));
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  page.on("pageerror", e => onError("page error", e.message + " | " + String(e.stack || "").split("\n").slice(1, 4).join(" | ")));
  page.on("console", m => { if (m.type() === "error" && !/Failed to load resource|scryfall/i.test(m.text())) onError("console error", m.text()); });
  page.on("dialog", d => d.accept());
  await page.addInitScript(([key, s]) => localStorage.setItem(key + ".game.settings.v1", JSON.stringify(s)),
    [{ miku: "mikuWiki", etrata: "etrataWiki", corrupted: "corruptedWiki" }[site] || site + "Wiki", { opponents: 3, level: "sharp", speed: "fast", pool, askTriggers, stopOnSpells: false, picks: [], hero }]);
  await page.goto(`http://127.0.0.1:${srv.address().port}/${site}/#play`);
  await page.waitForSelector("[data-start]", { timeout: 20000 });
  await page.click("[data-start]");
  await page.waitForFunction(() => window.MikuGame && MikuGame.Lobby.table && MikuGame.Lobby.table.g, null, { timeout: 20000 });
  return { ctx, page };
}
/* Seeded random numbers (mulberry32). */
function rng(seed) {
  let s = seed | 0;
  return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/* Answer whatever question sheet is open, the way a person could. */
async function answer(page, rnd) {
  const pick = a => a[Math.floor(rnd() * a.length)];
  const sh = ".mg-sheet.on";
  if (await page.$(`${sh} [data-y]`)) return page.click(`${sh} [data-y='${rnd() < 0.6 ? 1 : 0}']`);
  if (await page.$(`${sh} .mg-num`)) { if (rnd() < 0.5) await pick(await page.$$(`${sh} [data-q]`)).click(); return page.click(`${sh} [data-ok]`); }
  if (await page.$(`${sh} .mg-opts [data-o]`)) return pick(await page.$$(`${sh} [data-o]`)).click();
  if (await page.$(`${sh} .mg-dist`)) return page.click(`${sh} [data-auto]`);
  if (await page.$(`${sh} .opt[data-k]`)) {
    const n = 1 + Math.floor(rnd() * 3);
    for (let i = 0; i < n; i++) { if (!(await page.$(sh))) return; await pick(await page.$$(`${sh} .opt[data-k]`)).click(); }
    if (!(await page.$(sh))) return;
    const ok = await page.$(`${sh} [data-ok]`);
    if (ok && !(await ok.isDisabled())) return ok.click();
    if (await page.$(`${sh} [data-auto]`)) return page.click(`${sh} [data-auto]`);
    return;
  }
  const tg = await page.$$(`${sh} [data-p], ${sh} .bd [data-oid]`);
  if (tg.length) { if (rnd() < 0.1 && await page.$(`${sh} [data-none]`)) return page.click(`${sh} [data-none]`); return pick(tg).click(); }
  if (await page.$(`${sh} [data-none]`)) return page.click(`${sh} [data-none]`);
  throw new Error("a question with no way to answer it: " + await page.evaluate(() => document.querySelector(".mg-sheet.on").innerText.replace(/\s+/g, " ").slice(0, 200)));
}
/* Opponents that never do anything, for tests that set up the board themselves. */
async function passiveOpponents(page) {
  await page.evaluate(() => {
    const t = MikuGame.Lobby.table;
    for (const p of t.g.players) if (!p.human) p.agent = { mulligan: async () => true, main: async () => ({ type: "pass" }), attack: async () => [], block: async () => [], respond: async () => null, choose: async (g, pl, req) => t.helper.choose(g, pl, req) };
  });
}
module.exports = { serve, launch, openPlay, rng, answer, passiveOpponents };
