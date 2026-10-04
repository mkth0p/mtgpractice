#!/usr/bin/env node
/* Reruns the analysis on a file from the Train tab's "Export all games and analysis" button and
   compares it with what the browser said: does each game replay, does the quick pass give the same
   grades, and how far do the deep results move with a bigger budget. Games recorded before engine 3
   run in Chromium (Playwright), where their bots rolled the same dice as in the person's browser.
   node tools/sim/judge-export.js export.json [--game <id prefix>] [--deep] [--budget 240] [--verbose] */
"use strict";
const path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "../../miku/game");
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf("--" + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true); };
const file = args.find(a => !a.startsWith("--") && /\.json$/.test(a));
if (!file) { console.log("usage: node tools/sim/judge-export.js export.json [--game id] [--deep] [--budget 240] [--verbose]"); process.exit(1); }
const ex = JSON.parse(fs.readFileSync(file, "utf8"));
const opts = { deep: !!opt("deep", false), budget: +opt("budget", 240), verbose: !!opt("verbose", false) };
const ONLY = opt("game", null);
// the browser's files, in the browser's order
const files = ((ex.site && ex.site.files) || []).map(f => f.replace(/^game\//, "")).filter(f => !/game-ui/.test(f) && fs.existsSync(path.join(dir, f)));
for (const f of files) require(path.join(dir, f));
require(path.join(__dirname, "judge-core.js"));
const MK = globalThis.MK, A = MK.Analysis;

async function chromium() {
  let pw;
  for (const p of [path.join(__dirname, "../ui"), "/usr/lib/node_modules", "/usr/local/lib/node_modules"]) { try { pw = require(require.resolve("playwright", { paths: [p] })); break; } catch (e) { /* next */ } }
  if (!pw) throw new Error("Playwright isn't installed: games recorded before engine 3 need Chromium to replay");
  const b = await pw.chromium.launch();
  const page = await b.newPage();
  await page.setContent("<html></html>");
  for (const f of files) await page.addScriptTag({ content: fs.readFileSync(path.join(dir, f), "utf8") });
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, "judge-core.js"), "utf8") });
  return { b, run: g0 => page.evaluate(([g, o]) => window.JUDGE(g, o), [g0, opts]) };
}

(async () => {
  console.log(`export of ${ex.exportedAt}, site v${ex.site && ex.site.asset}, analysis v${ex.engine && ex.engine.analysis} (here v${A.VERSION}), anchors ${JSON.stringify(ex.engine && ex.engine.anchors)} (here ${JSON.stringify(A.ANCHORS)})`);
  if (JSON.stringify((ex.engine && ex.engine.valueModel) || {}) !== JSON.stringify((MK.Value.getModel() || {}).meta || {})) console.log("note: the value model differs from the one in the export; expect small differences");
  let ch = null;
  for (const g0 of ex.games.filter(g => !ONLY || g.id.startsWith(ONLY))) {
    const old = (g0.rec.engine || 0) < 3;
    if (old && !ch) ch = await chromium();
    const lines = old ? await ch.run(g0) : await globalThis.JUDGE(g0, opts);
    console.log("\n" + lines.join("\n") + (old ? "\n  (run in Chromium: recorded before engine 3)" : ""));
  }
  if (ch) await ch.b.close();
})().catch(e => { console.error(e); process.exit(1); });
