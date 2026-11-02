/* Walks the Hidden gem commanders page (commanders/) on a phone and a desktop: answers the whole quiz,
   checks a result shows up, tries the October preset, the color filter and the sort, opens every card's
   details, and fails on page errors or a page wider than the screen.
   Usage: node tools/ui/commanders-walk.js [--shots <dir>] */
"use strict";
const { serve, launch } = require("./serve");
const path = require("path");
const shotDir = (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf("--shots"));
const issues = [];
const fail = m => { issues.push(m); console.log("  ✗ " + m); };

(async () => {
  const srv = await serve(), browser = await launch();
  const url = `http://127.0.0.1:${srv.address().port}/commanders/`;
  for (const [label, vp, dark] of [["phone", { width: 390, height: 844 }, false], ["desktop", { width: 1280, height: 900 }, true]]) {
    console.log(label);
    const ctx = await browser.newContext({ viewport: vp, colorScheme: dark ? "dark" : "light" });
    const p = await ctx.newPage();
    await p.route("**/api.scryfall.com/**", r => r.fulfill({ status: 404, body: "" }));
    await p.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    p.on("pageerror", e => fail(`${label}: page error ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/i.test(m.text())) fail(`${label}: console ${m.text()}`); });
    await p.goto(url);
    const n = await p.$$eval(".cmd", x => x.length);
    if (n !== 20) fail(`${label}: ${n} commander cards, expected 20`);
    const wide = () => p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (await wide() > 1) fail(`${label}: page is ${await wide()}px wider than the screen`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `${label}-top.png`) });

    // the quiz, answered with a different option each run
    for (let step = 0; step < 20; step++) {
      if (await p.$("#qdone")) { await p.click("#qdone"); break; }
      if (await p.$("#quiz [data-col]")) { await p.click("#quiz [data-col='U']"); await p.click("#quiz [data-col='B']"); await p.click("#qnext"); continue; }
      const opts = await p.$$("#quiz [data-i]");
      if (!opts.length) break;
      await opts[(step + (label === "phone" ? 0 : 1)) % opts.length].click();
    }
    if (await p.$("#qdone")) await p.click("#qdone");
    const winner = await p.$eval("#quiz h3", h => h.textContent).catch(() => null);
    if (!winner) fail(`${label}: no quiz result`); else console.log(`  quiz match: ${winner}`);
    const runners = await p.$$eval("#quiz .runner", x => x.length);
    if (runners !== 4) fail(`${label}: ${runners} runners-up, expected 4`);
    if (shotDir) await p.locator("#quiz").screenshot({ path: path.join(shotDir, `${label}-result.png`) });
    await p.click("#quiz [data-jump]");
    if (!(await p.$(".cmd.hit details[open]"))) fail(`${label}: jumping to the match did not open its card`);

    // the October preset
    await p.click("#qreset");
    await p.click("#qpreset");
    const preset = await p.$eval("#quiz h3", h => h.textContent).catch(() => null);
    if (!preset) fail(`${label}: preset gave no result`); else console.log(`  October preset match: ${preset}`);

    // reload keeps the result
    await p.reload();
    if (!(await p.$("#quiz h3"))) fail(`${label}: result lost on reload`);

    // filters and sort
    await p.click("#tools [data-col='U']");
    const blue = await p.$$eval(".cmd", x => x.length);
    if (!(blue > 0 && blue < 20)) fail(`${label}: blue-only filter shows ${blue}`);
    await p.click("#tools [data-col='U']");
    await p.selectOption("#sort", "power");
    const first = await p.$eval(".cmd .cname b", b => b.textContent);
    console.log(`  most powerful first: ${first}`);
    for (const d of await p.$$("details")) await d.evaluate(e => { e.open = true; });
    if (await wide() > 1) fail(`${label}: page too wide with all details open`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `${label}-list.png`), fullPage: label === "phone" ? false : true });
    await ctx.close();
  }
  await browser.close(); srv.close();
  console.log(issues.length ? `${issues.length} problem(s)` : "all good");
  process.exit(issues.length ? 1 : 0);
})();
