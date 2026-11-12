/* Walks the Origins TCG page (origins/) on a phone and a desktop: opens every tab, checks that each chart and
   table has its marks, hovers a mark for its tooltip, runs the deck tester and a deck against deck match in the
   page's own workers, replays a game round by round, and fails on page errors or a page wider than the screen.
   Usage: node tools/ui/origins-walk.js [--shots <dir>] */
"use strict";
const { serve, launch } = require("./serve");
const path = require("path");
const shotDir = (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf("--shots"));
const issues = [];
const fail = m => { issues.push(m); console.log("  ✗ " + m); };

(async () => {
  const srv = await serve(), browser = await launch();
  const url = `http://127.0.0.1:${srv.address().port}/origins/`;
  for (const [label, vp, dark] of [["phone", { width: 390, height: 844 }, false], ["desktop", { width: 1280, height: 900 }, true]]) {
    console.log(label);
    const ctx = await browser.newContext({ viewport: vp, colorScheme: dark ? "dark" : "light" });
    const p = await ctx.newPage();
    await p.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    p.on("pageerror", e => fail(`${label}: page error ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/i.test(m.text())) fail(`${label}: console ${m.text()}`); });
    await p.goto(url);
    const wide = async where => { const w = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (w > 1) fail(`${label}: ${where} is ${w}px wider than the screen`); };
    const count = (sel) => p.$$eval(sel, x => x.length);
    const need = async (sel, min, what) => { const n = await count(sel); if (n < min) fail(`${label}: ${what}: ${n} found, at least ${min} expected`); };
    const tab = async name => { await p.click(`#tabs button[data-tab='${name}']`); if (await p.$eval(`#p-${name}`, e => e.hidden)) fail(`${label}: tab ${name} did not open`); await wide(name); if (shotDir) await p.screenshot({ path: path.join(shotDir, `${label}-${name}.png`), fullPage: true }); };
    const text = await p.evaluate(() => document.body.innerText);
    if (/\[object |undefined|NaN/.test(text)) fail(`${label}: the page shows a raw value (${(text.match(/.{20}(\[object |undefined|NaN).{20}/) || [""])[0]})`);

    // verdict
    await wide("verdict");
    await need("#tiles .tile", 4, "header tiles");
    await need("#pick .chip", 13, "cards of the pick");
    await need("#rank .row", 10, "ranking rows");
    await p.click("#rank-seg button[data-v='all']");
    await need("#rank .row", 30, "ranking rows, all lists");
    await p.click("#rank-seg button[data-v='real']");
    await need("#rank .row", 10, "ranking rows, real lists only");
    if (await count("#rank .row .tag")) fail(`${label}: a searched list shows among the real lists`);
    await p.click("#rank-seg button[data-v='best']");
    await need("#rank .row", 10, "ranking rows, best per Legendary");
    await p.hover("#rank .row:nth-child(3)");
    if (!(await p.$eval("#tip", e => e.classList.contains("on") && e.textContent.length > 20))) fail(`${label}: no tooltip on a ranking row`);
    await need("#src-tbl tbody tr", 10, "source table rows");
    await need("#trust .card", 2, "trust cards");

    // Legendaries
    await tab("legends");
    await need("#agree .row", 8, "real against simulated rows");
    await need("#heat .c:not(.self)", 90, "matchup cells");
    await p.click("#heat-seg button[data-v='real']");
    await need("#heat .c:not(.self)", 56, "matchup cells, real lists");
    if (!(await p.$eval("#heat-cap", e => e.textContent.length > 40))) fail(`${label}: the matchup chart has no caption`);
    await wide("matchups between real lists");
    await p.click("#heat-seg button[data-v='best']");
    await need("#lg-tbl tbody tr", 12, "Legendary rows");

    // deck lab: every Legendary, then the tester with the fast bot
    await tab("lab");
    for (const b of await p.$$("#lab-seg button")) {
      await b.click();
      if (!/No list for this Legendary/.test(await p.$eval("#lab-best", e => e.textContent))) await need("#lab-best .chip", 13, `best list of ${await b.textContent()}`);
      if (!(await p.$eval("#lab-refine", e => e.hidden))) { await need("#lab-refine table tbody tr", 3, "one-card changes tested"); await wide("one-card changes"); }
    }
    await need("#cr .div", 20, "card rating bars");
    await p.click("#cr-seg button[data-v='all']");
    await need("#cr .div", 60, "card rating bars, all cards");
    await need("#builder .cards button.chip[aria-pressed]", 100, "cards of the pool");
    await p.click("#builder .seg button:has-text('Fast bot')");
    await p.click("#builder .btn:has-text('Run')");
    await p.waitForFunction(() => { const o = document.querySelector("#builder .out .hero small"); return o && !/so far/.test(o.textContent); }, null, { timeout: 240000 });
    const rate = parseFloat(await p.$eval("#builder .out .hero", e => e.textContent));
    if (!(rate > 20 && rate < 95)) fail(`${label}: the deck tester gives ${rate}%`);
    await wide("deck tester result");

    // play guide
    await tab("play");
    await need("#pg-rules li", 5, "play rules");
    if (await count("#pg .card")) { await need("#pg .div", 13, "mulligan bars"); await need("#pg table", 3, "guide tables"); }

    // simulator: a short match and a replay stepped to its end
    await tab("sim");
    await p.click("#duel .seg button:has-text('Fast bot')");
    await p.click("#duel .btn:has-text('Run')");
    await p.waitForFunction(() => { const o = document.querySelector("#duel .out .hero small"); return o && !/so far/.test(o.textContent); }, null, { timeout: 240000 });
    if (!/60 games/.test(await p.$eval("#duel .out", e => e.textContent))) fail(`${label}: the match did not play its 60 games`);
    await p.click("#watch .btn:has-text('Play the game')");
    await p.waitForSelector("#watch .board", { timeout: 240000 });
    const steps = +(await p.$eval("#watch input[type=range]", e => e.max));
    for (let i = 0; i < steps; i++) await p.click("#watch .btn:has-text('Next')");
    if (!/after combat/.test(await p.$eval("#watch .stepper b", e => e.textContent))) fail(`${label}: the replay did not reach its last round`);
    await need("#watch .lane", 3, "replay locations");
    await need("#watch .log li", 1, "replay log lines");
    await wide("replay");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `${label}-replay.png`), fullPage: true });

    // method
    await tab("method");
    await need("#m-steps li", 6, "method steps");
    await need("#cal circle", 8, "calibration points");
    for (const b of await p.$$("#cal-seg button")) { await b.click(); await need("#cal circle", 8, "calibration points"); }
    await need("#m-rules li", 12, "engine rules");
    await need("#m-src li", 4, "sources");
    const text2 = await p.evaluate(() => [...document.querySelectorAll(".pane")].map(e => e.textContent).join(" "));
    if (/\[object |undefined|NaN/.test(text2)) fail(`${label}: a section shows a raw value (${(text2.match(/.{30}(\[object |undefined|NaN).{30}/) || [""])[0]})`);

    // the tab in the address opens on load
    await p.goto(url + "#method");
    if (await p.$eval("#p-method", e => e.hidden)) fail(`${label}: #method in the address did not open the tab`);
    await ctx.close();
  }
  await browser.close(); srv.close();
  console.log(issues.length ? `${issues.length} problem(s)` : "origins-walk: all good");
  process.exit(issues.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
