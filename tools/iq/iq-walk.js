/* Plays every task of the cognitive test practice pages (iq/) in Chromium: practice with feedback
   and standard rules, answering from the item on screen (mostly right, some wrong on purpose), then
   a full test, the progress page and both exports. Fails on any page error, on a
   task that never reaches its result page, or on a score that does not match the answers given.
   Usage: node tools/iq/iq-walk.js [--only matrix,dsf,full] [--shots <dir>] */
"use strict";
const { serve, launch } = require("../ui/serve");
const arg = k => (i => i > 0 ? process.argv[i + 1] : null)(process.argv.indexOf(k));
const only = arg("--only") ? arg("--only").split(",") : null;
const shotDir = arg("--shots");
const issues = [];
const SPEED = ["coding", "symsearch", "nsq"];
const ALL = ["matrix", "weights", "series", "puzzle", "blocks", "dsf", "dsb", "dss", "lns", "running", "symspan", "spatialadd", "arith", "similar", "vocab"].concat(SPEED);

async function answer(page, wrong) {
  const it = await page.evaluate(() => window.__iqItem);
  if (!it) return;
  const t = it.type;
  if (["matrix", "weights", "series"].includes(t)) {
    const i = wrong ? (it.correct + 1) % it.options.length : it.correct;
    await page.click(`#ch .choice[data-i="${i}"]`);
  } else if (t === "puzzle") {
    const pick = wrong ? [0, 1, 2, 3, 4, 5].filter(i => !it.correct.includes(i)).slice(0, 3) : it.correct;
    for (const i of pick) await page.click(`#pc .choice[data-i="${i}"]`);
    await page.click("#ok");
  } else if (t === "blocks") {
    if (!wrong) for (let k = 0; k < it.faces.length; k++) { const f = it.faces[k]; if (!f) continue; await page.click(`#fp [data-f="${f}"]`); await page.click(`#build [data-k="${k}"]`); }
    await page.click("#ok");
  } else if (["span", "lns", "running"].includes(t)) {
    await page.waitForSelector("#k .pad", { timeout: 20000 });
    const ans = wrong ? it.answer.slice().reverse().concat(["1"]) : it.answer;
    for (const ch of ans.map(String)) await page.click(`#k [data-k="${ch}"]`);
    await page.click('#k [data-k="ok"]');
  } else if (t === "symbolspan") {
    await page.waitForSelector("#sg", { timeout: 20000 });
    const order = wrong ? [1, 0] : Array.from({ length: it.len }, (_, i) => i);
    for (const k of order.slice(0, it.len)) await page.click(`#sg [data-k="${k}"]`);
    await page.click("#ok");
  } else if (t === "spatialadd") {
    await page.waitForSelector("#sa button", { timeout: 20000 });
    if (!wrong) for (let k = 0; k < it.answer.length; k++) { const n = { 0: 0, 1: 1, 3: 2 }[it.answer[k]]; for (let c = 0; c < n; c++) await page.click(`#sa [data-k="${k}"]`); }
    await page.click("#ok");
  } else if (t === "arith") {
    await page.fill("#ans", String(wrong ? it.answer + 1 : it.answer));
    await page.click("#ok");
  }
}

async function playTask(browser, base, id, mode) {
  const ctx = await browser.newContext({ viewport: { width: 400, height: 860 } });
  const page = await ctx.newPage();
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  page.on("pageerror", e => issues.push(`${id}/${mode}: page error ${e.message}`));
  page.on("console", m => { if (m.type() === "error") issues.push(`${id}/${mode}: console ${m.text()}`); });
  page.on("dialog", d => d.accept());
  await page.addInitScript(() => localStorage.setItem("iqPractice.v1", JSON.stringify({ sessions: [], prefs: { practiceN: 6 }, levels: {} })));
  if (SPEED.includes(id)) await page.clock.install();
  await page.goto(`${base}#/run/${id}/${mode}`);
  let given = 0, right = 0;
  const t0 = Date.now();
  for (let step = 0; step < 400; step++) {
    if (Date.now() - t0 > 240000) { issues.push(`${id}/${mode}: took too long`); break; }
    const h1 = await page.$eval("h1", e => e.textContent).catch(() => "");
    if (/Raw score|Practice done/.test(h1)) break;
    if (SPEED.includes(id)) {
      if (await page.$("#go")) { await page.click("#go"); continue; }
      // a few answers, then run the clock out
      for (let n = 0; n < 6; n++) {
        const sel = id === "coding" ? ".code-ans button" : id === "symsearch" ? "#yes" : '[data-n="2"]';
        await page.click(sel).catch(() => {});
      }
      await page.clock.fastForward(310000);
      await page.waitForTimeout(300);
      continue;
    }
    if (await page.$("#nx")) { await page.click("#nx"); continue; }
    if (id === "similar" || id === "vocab") {
      if (await page.$("#fb [data-p]")) { await page.click('#fb [data-p="2"]'); continue; }
      if (await page.$("#ans")) { await page.fill("#ans", "a general category"); await page.click("#ok"); given++; await page.waitForTimeout(120); continue; }
      await page.waitForTimeout(150); continue;
    }
    const it = await page.evaluate(() => window.__iqItem && window.__iqItem.__seen ? null : window.__iqItem);
    if (it && await page.$("#stage :is(.choice, #ok, .pad, #sg, #sa, #ans, .stim)")) {
      await page.evaluate(() => { window.__iqItem.__seen = true; });
      const wrong = given % 4 === 3;
      await answer(page, wrong);
      given++; if (!wrong) right++;
      await page.waitForTimeout(150);
      continue;
    }
    await page.waitForTimeout(200);
  }
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("iqPractice.v1")));
  const sess = state.sessions[state.sessions.length - 1];
  if (!sess) issues.push(`${id}/${mode}: no session saved`);
  else if (!SPEED.includes(id) && id !== "similar" && id !== "vocab") {
    const got = sess.result.items.filter(x => x.correct).length;
    if (got !== right) issues.push(`${id}/${mode}: ${right} answered right, ${got} scored right`);
  }
  if (shotDir) await page.screenshot({ path: `${shotDir}/${id}-${mode}.png`, fullPage: true });
  console.log(`${id}/${mode}: ${sess ? `raw ${sess.result.raw}` : "no session"} (${given} answers)`);
  await ctx.close();
}

// a full test (two tasks taken, the rest skipped), the progress page and both exports
async function fullTest(browser, base) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ status: 200, contentType: "text/css", body: "" }));
  page.on("pageerror", e => issues.push(`full test: page error ${e.message}`));
  page.on("dialog", d => d.accept());
  await page.goto(`${base}#/full`);
  await page.click("input[value=core]");
  await page.click("#go");
  const take = ["Matrix Reasoning", "Digit Sequencing"];
  for (let step = 0; step < 400; step++) {
    if (await page.$("#skip")) { const nm = await page.$eval("h1", e => e.textContent); await page.click(take.includes(nm) ? "#go" : "#skip"); continue; }
    if (/My progress/.test(await page.$eval("h1", e => e.textContent).catch(() => ""))) break;
    const it = await page.evaluate(() => window.__iqItem && !window.__iqItem.__seen ? window.__iqItem : null);
    if (it && await page.$("#stage :is(.choice, .pad)")) { await page.evaluate(() => { window.__iqItem.__seen = true; }); await answer(page, it.type === "span" ? it.len > 4 : it.level > 5); continue; }
    await page.waitForTimeout(200);
  }
  const state = await page.evaluate(() => JSON.parse(localStorage.getItem("iqPractice.v1")));
  const inFull = state.sessions.filter(s => s.fullTest);
  if (inFull.length !== 2 || !inFull.every(s => s.form === "full1")) issues.push(`full test: expected 2 sessions on form full1, got ${JSON.stringify(inFull.map(s => [s.task, s.form]))}`);
  if (!(await page.$$("#app svg.spark")).length) issues.push("full test: progress page has no charts");
  if (shotDir) await page.screenshot({ path: `${shotDir}/progress.png`, fullPage: true });
  // single standard tests get new form numbers
  await page.goto(`${base}#/data`);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#exc")]);
  const csv = require("fs").readFileSync(await dl.path(), "utf8").split("\n");
  if (csv.length < 10 || !/^session,full_test/.test(csv[0])) issues.push("full test: CSV export looks wrong: " + csv.slice(0, 2).join(" | "));
  const [dj] = await Promise.all([page.waitForEvent("download"), page.click("#exj")]);
  const js = JSON.parse(require("fs").readFileSync(await dj.path(), "utf8"));
  if (js.data.sessions.length !== 2) issues.push(`full test: JSON has ${js.data.sessions.length} sessions, expected 2`);
  console.log(`full test: ${inFull.length} tasks taken, ${csv.length - 1} trial rows`);
  for (const r of ["#/method", "#/settings", "#/task/matrix", "#/progress", "#/"]) { await page.goto(base + r); await page.waitForTimeout(200); }
  await ctx.close();
}

(async () => {
  const srv = await serve(), browser = await launch();
  const base = `http://127.0.0.1:${srv.address().port}/iq/`;
  const list = only ? only.filter(x => x !== "full") : ALL;
  for (const id of list) for (const mode of ["practice", "test"]) await playTask(browser, base, id, mode);
  if (!only || only.includes("full")) await fullTest(browser, base);
  await browser.close(); srv.close();
  if (issues.length) { console.log(`\n${issues.length} issue(s):\n` + issues.join("\n")); process.exit(1); }
  console.log("\nall tasks ok");
})();
