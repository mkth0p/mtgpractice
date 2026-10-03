/* Walks the whole Learn Magic course (learn/) in Chromium the way a learner would: every lesson,
   every widget solved for real (no skip links), every quiz answered, then the final quiz, the word
   list and the cheat sheet. Fails on any page error or on a widget that never unlocks Next.
   Usage: node tools/ui/learn-walk.js [--shots <dir>] */
"use strict";
const { serve, launch } = require("./serve");
const path = require("path");
const shotDir = (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf("--shots"));
const issues = [];

const SOLVE = {
  async life(p) { for (let i = 0; i < 10 && !(await p.$(".w .msg.good")); i++) await p.click("#wbox [data-k='2']"); },
  async anatomy(p) { for (const el of await p.$$("#wbox .part")) await el.click(); },
  async wheel(p) { for (const el of await p.$$("#wbox .wheel button")) await el.click(); },
  async colors(p) { for (const el of await p.$$("#wbox .colors button")) await el.click(); },
  async zones(p) { for (const el of await p.$$("#wbox .board button")) await el.click(); },
  async lands(p) { for (let t = 0; t < 4; t++) { await p.click("#hnd .mcard"); await p.click("#nt"); } },
  async tapper(p) { for (let k = 0; k < 3; k++) await p.click(`#wbox .mcard[data-k='${k}']`); await p.click("#nt"); },
  async pay(p) {
    for (let n = 0; n < 10; n++) {
      const lands = (await p.$$("#lands .mcard")).length;
      for (let k = 0; k < lands; k++) { if (!(await p.$("#cast")) || !(await p.$eval("#cast", b => b.disabled))) break; await p.click(`#lands .mcard[data-k='${k}']`); }
      if (await p.$eval("#cast", b => !b.disabled)) await p.click("#cast"); else await p.click("#cant");
      if (await p.$("#nx")) await p.click("#nx"); else break;
    }
  },
  async sort(p) {
    for (let n = 0; n < 12 && await p.$("#wbox .buckets"); n++) {
      const bs = await p.$$("#wbox .buckets button");
      for (const b of bs) { await b.click(); if (await p.$("#wbox .msg.good")) break; }
      await p.waitForFunction(() => !document.querySelector("#wbox .msg.good") || !document.querySelector("#wbox .buckets"), null, { timeout: 4000 });
    }
  },
  async order(p) {
    for (let n = 0; n < 60 && await p.$("#wbox .pool2 button"); n++) {
      for (const b of await p.$$("#wbox .pool2 button")) { const before = await p.$$eval("#wbox ol li", x => x.length); await b.click(); if (await p.$$eval("#wbox ol li", x => x.length) > before) break; }
    }
  },
  async flip(p) { for (let n = 0; n < 15; n++) { await p.click("#wbox .fc"); if (await p.$eval("#nx", b => b.disabled)) break; await p.click("#nx"); } },
  async combat(p) {
    const picks = (await p.$$("#pb button")).length;
    for (let n = 0; n < 4; n++) { if (picks) await p.click(`#pb button:nth-child(${1 + n % picks})`); await p.click("#go"); }
  },
  async stack(p) {
    await p.click("#gg"); await p.click("#res"); await p.click("#res");
    await p.click("#sw"); await p.click("#gg"); await p.click("#res"); await p.click("#res");
  },
  async tax(p) { for (let n = 0; n < 2; n++) { await p.click("#cast"); await p.click("#die"); } },
  async guided(p) {
    await p.click("#untap"); await p.click("#lib");
    await p.click("[data-h='0']"); // the Forest
    for (let k = 0; k < 2; k++) await p.click("[data-l]:not(.tapped)");
    await p.click("[data-h]:last-child"); // Grizzly Bears, drawn last
    await p.click("[data-c='0']"); await p.click("#end");
  }
};

(async () => {
  const srv = await serve(), browser = await launch();
  const base = `http://127.0.0.1:${srv.address().port}/learn/`;
  for (const vp of [{ width: 390, height: 844, tag: "phone" }, { width: 1280, height: 900, tag: "desktop" }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    await p.route("**/api.scryfall.com/**", r => r.fulfill({ status: 404, body: "" }));
    p.on("pageerror", e => issues.push(`[${vp.tag}] page error: ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) issues.push(`[${vp.tag}] console: ${m.text()}`); });
    p.on("dialog", d => d.accept());
    await p.goto(base.replace("learn/", ""));
    if (!(await p.$("a.learn[href='learn/']"))) issues.push(`[${vp.tag}] the hub has no Learn Magic card`);
    if (await p.$("a[href^='storytelling']")) issues.push(`[${vp.tag}] the hub still links the storytelling page`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `hub-${vp.tag}.png`) });
    await p.goto(base);
    await p.waitForSelector(".path");
    // reading settings: every switch toggles its class on <html>
    await p.click("#aa");
    for (const [k, cls] of [["big", "big"], ["spaced", "spaced"]]) {
      await p.check(`#prefs input[data-p='${k}']`);
      if (!(await p.evaluate(c => document.documentElement.classList.contains(c), cls))) issues.push(`[${vp.tag}] setting ${k} did nothing`);
      await p.uncheck(`#prefs input[data-p='${k}']`);
    }
    await p.click("#prefs-x");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `learn-home-${vp.tag}.png`), fullPage: vp.tag === "desktop" });
    const lessons = await p.evaluate(() => LEARN.lessons.map(l => ({ id: l.id, n: l.steps.length })));
    let shots = 0;
    for (const l of lessons) {
      await p.goto(base + `#/l/${l.id}/0`);
      await p.waitForFunction(() => document.querySelector("#screen") && !document.querySelector(".finish"));
      for (let s = 0; s < l.n; s++) {
        await p.waitForSelector("#screen");
        const w = await p.$("#wbox");
        if (w) {
          const name = await w.getAttribute("data-widget");
          const gated = await p.$eval("#next", b => b.hidden);
          if (SOLVE[name]) {
            try { await SOLVE[name](p); } catch (e) { issues.push(`[${vp.tag}] ${l.id} step ${s} widget ${name}: ${e.message.split("\n")[0]}`); }
          }
          if (gated) await p.waitForFunction(() => !document.querySelector("#next").hidden, null, { timeout: 3000 }).catch(() => {}); // fights and the stack animate first
          if (gated && await p.$eval("#next", b => b.hidden)) { issues.push(`[${vp.tag}] ${l.id} step ${s}: widget ${name} never unlocked Next`); await p.click("#hint .linkish"); }
          if (shotDir && vp.tag === "phone" && shots < 40 && ["anatomy", "pay", "combat", "stack", "guided", "tax", "sort"].includes(name)) { await p.screenshot({ path: path.join(shotDir, `learn-${l.id}-${name}.png`) }); shots++; }
        }
        if (await p.$("#qbox")) {
          for (const o of await p.$$("#qbox .opt")) { if (await p.$("#qbox .opt.right")) break; await o.click(); }
          if (!(await p.$("#qbox .opt.right"))) issues.push(`[${vp.tag}] ${l.id} step ${s}: quiz has no right answer`);
        }
        if (await p.$eval("#next", b => b.hidden || b.disabled)) { issues.push(`[${vp.tag}] ${l.id} step ${s}: stuck`); break; }
        const old = await p.$("#screen");
        await p.click("#next");
        await old.waitForElementState("hidden").catch(() => {}); // the next screen replaces this one on hashchange
      }
      await p.waitForSelector(".finish", { timeout: 3000 }).catch(() => issues.push(`[${vp.tag}] ${l.id}: no finish screen`));
    }
    const done = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("learnMagic.v1")).done).length);
    if (done !== lessons.length) issues.push(`[${vp.tag}] progress saved ${done} of ${lessons.length}`);
    await p.goto(base + "#/exam"); await p.waitForSelector("#screen .q");
    for (let q = 0; q < 15; q++) {
      for (const o of await p.$$("#screen .opt")) { if (await p.$("#screen .opt.right")) break; await o.click(); }
      if (await p.$eval("#next", b => b.hidden)) { issues.push(`[${vp.tag}] final quiz question ${q + 1} stuck: ` + await p.$eval("#screen", s => s.innerText.slice(0, 200))); break; }
      const old = await p.$("#screen .q");
      await p.click("#next");
      await old.waitForElementState("hidden").catch(() => {});
    }
    if (!(await p.$(".score"))) issues.push(`[${vp.tag}] the final quiz didn't end with a score`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `learn-exam-${vp.tag}.png`) });
    await p.goto(base + "#/glossary"); await p.waitForSelector(".search"); await p.fill(".search", "tap");
    if (!(await p.$$(".gloss > div")).length) issues.push(`[${vp.tag}] glossary search found nothing for "tap"`);
    await p.goto(base + "#/cheat"); await p.waitForSelector(".cheat");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `learn-cheat-${vp.tag}.png`), fullPage: true });
    await p.goto(base); await p.waitForSelector(".progress-card");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `learn-home-done-${vp.tag}.png`) });
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (wide) issues.push(`[${vp.tag}] the page scrolls sideways`);
    console.log(`${vp.tag}: walked ${lessons.length} lessons, ${lessons.reduce((a, l) => a + l.n, 0)} steps`);
    await ctx.close();
  }
  await browser.close(); srv.close();
  if (issues.length) { console.log(issues.join("\n")); process.exit(1); }
  console.log("Learn Magic: no issues");
})();
