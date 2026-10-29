/* Walks the whole Learn Arcs course (arcs/) in Chromium the way a learner would: every lesson,
   every widget solved for real (no skip links), every quiz answered, then the final quiz, the word
   list and the cheat sheet. Fails on any page error or on a widget that never unlocks Next.
   Usage: node tools/ui/arcs-walk.js [--shots <dir>] */
"use strict";
const { serve, launch } = require("./serve");
const path = require("path");
const shotDir = (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf("--shots"));
const issues = [];

// widgets that are a run of small questions: try answers until one is right, then go to the next one
async function series(p) {
  for (let n = 0; n < 40 && await p.$eval("#next", b => b.hidden); n++) {
    for (const b of await p.$$("#wbox .ser-opts [data-k]:not([disabled])")) { await b.click(); if (await p.$("#wbox .msg.good")) break; }
    if (await p.$("#ser-next")) await p.click("#ser-next");
  }
}
const SOLVE = {
  pieces: series, control: series, initiative: series, secure: series, ambmatch: series, score: series, choices: series,
  async adjacent(p) {
    const ids = await p.$$eval("#wbox [data-n]", g => g.map(x => x.dataset.n));
    for (let n = 0; n < 4 && await p.$eval("#next", b => b.hidden); n++) for (const id of ids) await p.click(`#wbox [data-n='${id}']`);
  },
  async readcard(p) { for (const c of ["adm2", "agg6", "con4"]) await p.click(`#wbox [data-c='${c}']`); },
  async follow(p) {
    // a wrong Surpass first (lower card of the lead suit), then good plays
    await p.click("#wbox [data-c='agg2']"); await p.click("#wbox [data-m='Surpass']");
    if (!(await p.$("#wbox .msg.bad"))) throw new Error("a lower card was allowed to Surpass");
    await p.click("#wbox [data-m='Copy']");
    await p.click("#wbox [data-c='con6']"); await p.click("#wbox [data-m='Surpass']");
    await p.click("#wbox [data-c='mob6']"); await p.click("#wbox [data-m='Surpass']");
  },
  async round(p) { await p.click("#wbox [data-c='mob5']"); await p.click("#wbox [data-m='Surpass']"); },
  async move(p) { for (const n of ["G1", "G2", "G1", "G2", "P2b"]) await p.click(`#wbox [data-n='${n}']`); },
  async tax(p) { for (const t of ["a", "a", "b", "c"]) await p.click(`#wbox [data-t='${t}']`); },
  async battle(p) { await p.click("#wbox [data-d='raid'][data-v='1']"); await p.click("#wbox #roll"); },
  async prelude(p) {
    for (const [r, a] of [["material", "Build or Repair"], ["fuel", "Move"], ["weapon", "Pips may Battle"], ["relic", "Secure"], ["psionic", "1 lead-card action"]]) { await p.click(`#wbox [data-r='${r}']`); await p.click(`#wbox [data-a='${a}']`); }
  },
  async order(p) {
    for (let n = 0; n < 60 && await p.$("#wbox .ser-opts [data-k]"); n++) {
      for (const b of await p.$$("#wbox .ser-opts [data-k]")) { const before = await p.$$eval("#wbox ol li", x => x.length); await b.click(); if (await p.$$eval("#wbox ol li", x => x.length) > before) break; }
    }
  }
};

(async () => {
  const srv = await serve(), browser = await launch();
  const base = `http://127.0.0.1:${srv.address().port}/arcs/`;
  for (const vp of [{ width: 390, height: 844, tag: "phone" }, { width: 1280, height: 900, tag: "desktop" }]) {
    const ctx = await browser.newContext({ viewport: vp });
    const p = await ctx.newPage();
    await p.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
    const missing = [];
    p.on("response", r => { if (r.status() >= 400 && r.url().includes("/arcs/")) missing.push(r.url()); });
    p.on("pageerror", e => issues.push(`[${vp.tag}] page error: ${e.message}`));
    p.on("console", m => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) issues.push(`[${vp.tag}] console: ${m.text()}`); });
    p.on("dialog", d => d.accept());
    await p.goto(base.replace("arcs/", ""));
    if (!(await p.$("a[href='arcs/']"))) issues.push(`[${vp.tag}] the hub has no Learn Arcs tile`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `hub-arcs-${vp.tag}.png`) });
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
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `arcs-home-${vp.tag}.png`), fullPage: vp.tag === "desktop" });
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
          if (shotDir && vp.tag === "phone" && shots < 60 && ["pieces", "adjacent", "control", "follow", "initiative", "round", "move", "tax", "secure", "battle", "dicefaces", "prelude", "score", "mapdemo"].includes(name)) { await p.screenshot({ path: path.join(shotDir, `arcs-${l.id}-${name}.png`) }); shots++; }
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
    // tapping a real picture opens it big; Escape closes it
    await p.goto(base + "#/l/pieces/0"); await p.waitForSelector("#screen [data-big]");
    await p.click("#screen [data-big]");
    if (!(await p.$("#zoom img"))) issues.push(`[${vp.tag}] tapping a picture didn't open it big`);
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `arcs-zoom-${vp.tag}.png`) });
    await p.keyboard.press("Escape");
    if (await p.$("#zoom")) issues.push(`[${vp.tag}] Escape didn't close the big picture`);
    const done = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("learnArcs.v1")).done).length);
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
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `arcs-exam-${vp.tag}.png`) });
    // the walk misses questions on purpose (it tries options in order), so the weak-spots round has work
    await p.goto(base);
    const weak = await p.evaluate(() => JSON.parse(localStorage.getItem("learnArcs.v1")).weak.length);
    if (!weak || !(await p.$("a.weak[href='#/practice']"))) issues.push(`[${vp.tag}] no weak spots collected (${weak})`);
    for (let round = 0; round < 12 && await p.evaluate(() => JSON.parse(localStorage.getItem("learnArcs.v1")).weak.length); round++) {
      await p.goto(base + "#/"); await p.waitForSelector(".path");
      await p.goto(base + "#/practice"); await p.waitForSelector("#screen .q");
      for (let q = 0; q < 10; q++) {
        // answer right first time (each option button knows whether it is the right one)
        await p.evaluate(() => [...document.querySelectorAll("#screen .opt")].find(b => b._ok).click());
        if (await p.$eval("#next", b => b.hidden)) break;
        const old = await p.$("#screen .q");
        await p.click("#next");
        await old.waitForElementState("hidden").catch(() => {});
        if (await p.$(".score")) break;
      }
    }
    const left = await p.evaluate(() => JSON.parse(localStorage.getItem("learnArcs.v1")).weak.length);
    if (left) issues.push(`[${vp.tag}] weak spots never cleared (${left} left)`);
    await p.goto(base + "#/glossary"); await p.waitForSelector(".search"); await p.fill(".search", "seize");
    if (!(await p.$$(".gloss > div")).length) issues.push(`[${vp.tag}] glossary search found nothing for "seize"`);
    await p.goto(base + "#/cheat"); await p.waitForSelector(".cheat");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `arcs-cheat-${vp.tag}.png`), fullPage: true });
    await p.goto(base); await p.waitForSelector(".progress-card");
    if (shotDir) await p.screenshot({ path: path.join(shotDir, `arcs-home-done-${vp.tag}.png`) });
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    if (wide) issues.push(`[${vp.tag}] the page scrolls sideways`);
    if (missing.length) issues.push(`[${vp.tag}] missing files: ${[...new Set(missing)].join(", ")}`);
    console.log(`${vp.tag}: walked ${lessons.length} lessons, ${lessons.reduce((a, l) => a + l.n, 0)} steps`);
    await ctx.close();
  }
  await browser.close(); srv.close();
  if (issues.length) { console.log(issues.join("\n")); process.exit(1); }
  console.log("Learn Arcs: no issues");
})();
