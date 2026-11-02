/* Checks the Star Trek 2HG page (star-trek/) in Chromium at phone and desktop sizes, in light and dark:
   the hub tile, every card link in the text, the all-cards explorer (search, filters, sort, show more),
   the card sheet, practice pools (same number = same pool, notes hidden until asked), the split
   score and the sim's split, the build timer, the contents bar, and no sideways scroll.
   Usage: node tools/ui/startrek-walk.js [--shots <dir>] */
"use strict";
const { serve, launch } = require("./serve");
const path = require("path");
const shotDir = (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf("--shots"));
const issues = [];

(async () => {
  const srv = await serve(), browser = await launch();
  const root = `http://127.0.0.1:${srv.address().port}/`, base = root + "star-trek/";
  for (const vp of [{ width: 390, height: 844, tag: "phone" }, { width: 1280, height: 900, tag: "desktop" }, { width: 390, height: 844, tag: "phone-dark", dark: true }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, colorScheme: vp.dark ? "dark" : "light", reducedMotion: "reduce" });
    const p = await ctx.newPage();
    const say = m => issues.push(`[${vp.tag}] ${m}`);
    await p.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    const missing = [];
    p.on("response", r => { if (r.status() >= 400 && r.url().startsWith(root)) missing.push(r.url()); });
    p.on("pageerror", e => say(`page error: ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) say(`console: ${m.text()}`); });
    const shot = async (name, full) => { if (shotDir) await p.screenshot({ path: path.join(shotDir, `st-${name}-${vp.tag}.png`), fullPage: !!full }); };

    await p.goto(root);
    if (!(await p.$("a[href='star-trek/']"))) say("the hub has no Star Trek tile");
    if (shotDir && !vp.dark) { await p.$eval("a[href='star-trek/']", a => a.scrollIntoView({ block: "center" })); await shot("hub"); }

    await p.goto(base);
    await p.waitForSelector("#ex-list li");
    await shot("top");
    // every card link in the text names a real card
    const bad = await p.$$eval("a.c[data-c]", (as, names) => as.map(a => a.dataset.c).filter(n => !names.includes(n)), await p.evaluate(() => window.TRK.map(c => c[0])));
    if (bad.length) say(`card links with no card: ${[...new Set(bad)].join(", ")}`);
    const nLinks = await p.$$eval("a.c[data-c]", a => a.length);
    // the sheet opens from a link in the text and closes with Escape
    await p.click("#plan a.c[data-c]");
    await p.waitForSelector("#sheet[open] #sh-name");
    const shName = await p.$eval("#sh-name", h => h.textContent), shText = await p.$eval(".sh-text", d => d.textContent.length);
    if (!shName || shText < 20) say(`the card sheet is empty (${shName})`);
    if (!(await p.$("#sheet[open] .sh-gr .gb"))) say("the card sheet shows no grade");
    await shot("sheet");
    await p.keyboard.press("Escape");
    if (await p.$("#sheet[open]")) say("Escape didn't close the card sheet");

    // explorer
    const count = async () => parseInt(await p.$eval("#ex-count", e => e.textContent), 10);
    if (await count() !== 306) say(`explorer starts with ${await count()} cards, not 306`);
    if ((await p.$$("#ex-list li")).length !== 40) say("explorer doesn't start with 40 rows");
    await p.click("#ex-more");
    if ((await p.$$("#ex-list li")).length !== 100) say("show more didn't add 60 rows");
    await p.click("#ex-col [data-v='W']");
    const nW = await count();
    const allW = await p.$$eval("#ex-list .cr", (bs) => bs.every(b => window.TRK.find(c => c[0] === b.dataset.c)[7] === "W"));
    if (nW !== 45 || !allW) say(`white filter: ${nW} cards, all white ${allW}`);
    await p.click("#ex-col [data-v='']");
    await p.fill("#ex-q", "phasers");
    await p.waitForFunction(() => parseInt(document.querySelector("#ex-count").textContent, 10) < 306);
    const nQ = await count();
    if (nQ < 1 || nQ > 10) say(`search "phasers" found ${nQ} cards`);
    await p.fill("#ex-q", "défaussé zzzz");
    await p.waitForSelector("#ex-list .none");
    await p.fill("#ex-q", "");
    await p.waitForFunction(() => parseInt(document.querySelector("#ex-count").textContent, 10) === 306);
    await p.check("#ex-rem");
    const nRem = await count(), wantRem = await p.evaluate(() => window.TRK.filter(c => /(^|,)(removal|sweeper)/.test(c[10])).length);
    if (nRem !== wantRem) say(`removal filter: ${nRem} cards, expected ${wantRem}`);
    await p.click("#ex-rar [data-v='C']");
    const nRemC = await count();
    if (!(nRemC > 0 && nRemC < nRem)) say(`common removal: ${nRemC}`);
    for (const s of ["z", "cmc", "n", "g"]) await p.selectOption("#ex-sort", s);
    const first = await p.$eval("#ex-list .cr", b => b.dataset.c);
    await p.click("#ex-list .cr");
    await p.waitForSelector("#sheet[open]");
    if (await p.$eval("#sh-name", h => h.textContent) !== first) say("tapping a row opened another card");
    await p.keyboard.press("Escape");
    await p.uncheck("#ex-rem"); await p.click("#ex-rar [data-v='']");
    await p.$eval("#cartes", s => s.scrollIntoView());
    await shot("cards");

    // practice: a numbered pool is always the same pool
    await p.fill("#pr-seed", "1107");
    await p.click("#pr-form button[type=submit]");
    await p.waitForSelector("#pr-pool .pc");
    const poolA = await p.$eval("#pr-pool", d => d.textContent);
    if (await p.$("#pr-pool .gb")) say("grades show in the pool before asking");
    await p.click("#pr-pool .pc");
    await p.waitForSelector("#sheet[open]");
    if (await p.$("#sheet .sh-gr")) say("the sheet shows grades for a pool card in blind mode");
    await p.keyboard.press("Escape");
    await p.click("#pr-open");
    await p.waitForFunction(old => document.querySelector("#pr-pool").textContent !== old, poolA);
    await p.fill("#pr-seed", "1107");
    await p.click("#pr-form button[type=submit]");
    await p.waitForFunction(old => document.querySelector("#pr-pool").textContent === old, poolA, { timeout: 3000 }).catch(() => say("pool 1107 came out different the 2nd time"));
    const nPool = await p.evaluate(() => { const s = document.querySelector(".pool-sum").textContent; return parseInt(s.split("·")[1], 10); });
    if (!(nPool >= 104 && nPool <= 115)) say(`pool has ${nPool} cards`);
    await p.check("#pr-grades");
    if (!(await p.$("#pr-pool .gb"))) say("'Montrer nos notes' didn't show grades");
    // splits: one per pair of pairs, best first, and a chosen split gets a score
    const sp = await p.evaluate(() => { const P = TRKPage, pool = P.makePool(1107).cards.filter(c => !c.land), s = P.allSplits(pool); return { n: s.length, best: s[0].v, last: s[44].v, d: s[0].pa.length + s[0].pb.length }; });
    if (sp.n !== 45 || sp.best < sp.last || sp.d !== 46) say(`splits look wrong: ${JSON.stringify(sp)}`);
    await p.selectOption("#pr-a", "WB"); await p.selectOption("#pr-b", "RG");
    if (!/points/.test(await p.$eval("#pr-you", e => e.textContent))) say("choosing a split gave no score");
    await p.selectOption("#pr-b", "WB");
    if (!/différentes/.test(await p.$eval("#pr-you", e => e.textContent))) say("the same pair twice wasn't caught");
    await p.click("#pr-sim");
    await p.waitForSelector("#pr-res .res-deck");
    const decks = await p.$$eval("#pr-res .res-deck p", ps => ps.map(x => parseInt(x.textContent, 10)));
    if (decks.length !== 2 || decks.some(n => n !== 23)) say(`the sim's decks have ${decks} cards`);
    // timer: runs, pauses, resets
    await p.click("#t-go");
    await p.waitForTimeout(1300);
    const t1 = await p.$eval("#t-clock", e => e.textContent);
    if (t1 === "40:00") say("the timer didn't run");
    await p.click("#t-go");
    const t2 = await p.$eval("#t-clock", e => e.textContent);
    await p.waitForTimeout(1200);
    if (await p.$eval("#t-clock", e => e.textContent) !== t2) say("the timer didn't pause");
    await p.click("#t-reset");
    if (await p.$eval("#t-clock", e => e.textContent) !== "40:00") say("reset didn't go back to 40:00");
    // fast-forward the clock to check the phases and the end
    await p.click("#t-go");
    await p.evaluate(() => { const real = Date.now; Date.now = () => real() + 40 * 60000; });
    await p.waitForFunction(() => /écoulé/.test(document.querySelector("#t-phase").textContent), null, { timeout: 4000 }).catch(() => say("the timer never ended"));
    await p.evaluate(() => { delete Date.now; });
    await p.click("#t-reset");
    await p.$eval("#entrainement", s => s.scrollIntoView());
    await shot("practice");
    await p.$eval("#pr-res", s => s.scrollIntoView());
    await shot("sim");

    // contents bar follows the page
    await p.click("#toc a[href='#tricks']");
    await p.waitForFunction(() => document.querySelector("#toc a[aria-current='true']")?.getAttribute("href") === "#tricks", null, { timeout: 4000 }).catch(() => say("the contents bar didn't follow to Tricks"));
    await shot("tricks");
    if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) say("the page scrolls sideways");
    for (const id of ["archetypes", "cles", "build"]) { await p.$eval("#" + id, s => s.scrollIntoView()); await shot(id); }
    if (shotDir && vp.tag === "desktop") await shot("full", true);
    if (missing.length) say(`missing files: ${[...new Set(missing)].join(", ")}`);
    console.log(`${vp.tag}: ${nLinks} card links, ${nW} white, ${nQ} for "phasers", ${nRem} removal, pool 1107 has ${nPool} cards, best split ${sp.best.toFixed(1)}`);
    await ctx.close();
  }
  await browser.close(); srv.close();
  if (issues.length) { console.error(issues.join("\n")); process.exit(1); }
  console.log("Star Trek page OK");
})().catch(e => { console.error(e); process.exit(1); });
