#!/usr/bin/env node
/* Builds a deck site's A4 proxy sheet: every card the site's prices.js doesn't mark `base` (the cards that don't come
   from the Etrata deck), as text playtest proxies, 63 x 88 mm, nine to a page, with cutting room. Card text from the
   site's cards.js. Prints with the pre-installed Chromium (Playwright).
   node tools/proxy-sheet.js [site=corrupted-etrata] */
"use strict";
const fs = require("fs"), path = require("path");
const site = process.argv[2] || "corrupted-etrata";
const dir = path.join(__dirname, "..", site);
const window = {};
for (const f of ["cards.js", "prices.js"]) eval(fs.readFileSync(path.join(dir, f), "utf8"));
const CARDS = window.CETRATA_CARDS, PRICES = window.CETRATA_PRICES;
const byName = new Map(CARDS.map(c => [c.name, c]));
const label = "Corrupted Etrata";
const ORDER = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Land"];
const proxies = [];
for (const p of PRICES.cards.filter(c => !c.base)) { const c = byName.get(p.name); if (!c) throw new Error("No card " + p.name); for (let i = 0; i < p.qty; i++) proxies.push(c); }
proxies.sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat) || a.name.localeCompare(b.name));
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const sym = s => esc(s).replace(/\{([^}]+)\}/g, (m, x) => `<span class="ms ms-${/^[WUBRG]$/.test(x) ? x : "c"}">${x === "T" ? "↷" : x}</span>`);
const colors = c => { const m = (c.cost || "").match(/\{([WUBRG])\}/g) || []; return [...new Set(m.map(x => x[1]))]; };
const frame = c => { if (c.cat === "Land") return "land"; const k = colors(c); return k.length > 1 ? "gold" : k[0] === "U" ? "blue" : k[0] === "B" ? "black" : "colorless"; };
const card = c => `<div class="card ${frame(c)}"><div class="bar title"><b>${esc(c.name)}</b><span class="cost">${sym(c.cost || "")}</span></div>
  <div class="art"><span class="stamp">PLAYTEST PROXY</span><small>${label}</small></div>
  <div class="bar type">${esc(c.type)}</div>
  <div class="box">${String(c.text || "").split("\n").map(l => `<p>${sym(l)}</p>`).join("")}${c.pt ? `<span class="pt">${esc(c.pt)}</span>` : ""}</div>
  <div class="foot">Playtest proxy · not a real card · ${label}</div></div>`;
const pages = [];
for (let i = 0; i < proxies.length; i += 9) pages.push(proxies.slice(i, i + 9));
const html = `<!doctype html><meta charset="utf-8"><style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
body { margin: 0; font-family: Georgia, "Times New Roman", serif; }
.page { width: 210mm; height: 297mm; padding: 9.5mm 7.5mm; display: grid; grid-template-columns: repeat(3, 63mm); grid-template-rows: repeat(3, 88mm); gap: 3mm; justify-content: center; align-content: center; background: #111; page-break-after: always; }
.card { width: 63mm; height: 88mm; border-radius: 3mm; padding: 2.6mm; display: flex; flex-direction: column; gap: 1.2mm; }
.card.blue { background: #6ea3d1; } .card.black { background: #8a837c; } .card.gold { background: #cdb46a; } .card.colorless { background: #b4b8bc; } .card.land { background: #a68f74; }
.bar { background: #fbf7ee; border-radius: 1.4mm; padding: 1mm 1.8mm; border: 0.3mm solid rgba(0,0,0,.35); }
.title { display: flex; justify-content: space-between; align-items: center; gap: 1mm; font-size: 8pt; }
.title b { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cost { display: flex; gap: 0.4mm; flex: none; }
.ms { display: inline-flex; width: 3.4mm; height: 3.4mm; border-radius: 50%; align-items: center; justify-content: center; font: 700 5.5pt Arial, sans-serif; border: 0.2mm solid #333; vertical-align: -0.6mm; margin: 0 0.2mm; }
.ms-U { background: #b5d5ee; } .ms-B { background: #8f8a86; color: #fff; } .ms-W { background: #f7f3dc; } .ms-R { background: #f0a58a; } .ms-G { background: #9fcf9f; } .ms-c { background: #ddd8d2; }
.art { height: 23mm; border-radius: 1.4mm; border: 0.3mm solid rgba(0,0,0,.35); background: repeating-linear-gradient(135deg, #e7e7e7 0 2.4mm, #d6d6d6 2.4mm 4.8mm); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; }
.stamp { font: 700 9pt Arial, sans-serif; letter-spacing: 0.6mm; color: #c8102e; border: 0.5mm solid #c8102e; padding: 0.4mm 2mm; transform: rotate(-6deg); background: rgba(255,255,255,.6); }
.art small { font: 5.5pt Arial, sans-serif; color: #555; }
.type { font: 700 7pt Georgia, serif; }
.box { flex: 1; background: #fbf7ee; border-radius: 1.4mm; border: 0.3mm solid rgba(0,0,0,.35); padding: 1.4mm 1.8mm; font-size: 6.3pt; line-height: 1.22; position: relative; overflow: hidden; }
.box p { margin: 0 0 1mm; }
.pt { position: absolute; right: 1.2mm; bottom: 1mm; font: 700 7pt Arial, sans-serif; border: 0.3mm solid #333; border-radius: 1mm; padding: 0.2mm 1.4mm; background: #fff; }
.foot { text-align: center; font: 4.8pt Arial, sans-serif; color: #222; }
</style>${pages.map(p => `<div class="page">${p.map(card).join("")}</div>`).join("")}`;
const tmp = path.join(require("os").tmpdir(), "proxy-sheet.html");
fs.writeFileSync(tmp, html);
(async () => {
  const { chromium } = require("playwright");
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.goto("file://" + tmp);
  // shrink the rules text of long cards until it fits its box
  await pg.evaluate(() => { for (const box of document.querySelectorAll(".box")) { let s = 6.3; while (box.scrollHeight > box.clientHeight + 1 && s > 4.2) { s -= 0.2; box.style.fontSize = s + "pt"; } } });
  await pg.pdf({ path: path.join(dir, "proxies-A4.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true });
  await b.close();
  console.log(`${proxies.length} proxies on ${pages.length} pages → ${site}/proxies-A4.pdf`);
})().catch(e => { console.error(e); process.exit(1); });
