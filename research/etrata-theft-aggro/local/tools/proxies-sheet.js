const fs = require("fs"), path = require("path");
const repo = "/Users/glyphsek/Documents/mtg-todeletelater/mtgpractice", dir = path.join(repo, "miku/game");
require(path.join(dir, "engine.js")); require(path.join(dir, "cards-miku.js"));
for (const f of fs.readdirSync(dir).filter(f => /^(cards|decks|precon)-.*\.js$/.test(f) && f !== "cards-miku.js").sort()) require(path.join(dir, f));
const MK = globalThis.MK, idx = require(path.join(repo, "research/etrata-theft-aggro/local/scryfall/ub-index.json"));
const base = [].concat(MK.HERO_DECKS || [], MK.BOT_DECKS || []).find(d => d.id === "etrata");
const rec = fs.readFileSync(path.join(repo, "research/etrata-theft-aggro/local/decklist-heist-closer.txt"), "utf8").split("\n").filter(Boolean).map(r => r.replace(/^\d+ /, ""));
const count = a => { const c = {}; for (const n of a) c[n] = (c[n] || 0) + 1; return c; };
const R = count(rec.filter(n => n !== "Etrata, Deadly Fugitive")), L = count(base.list.filter(n => n !== base.commander));
const inn = [], out = [];
for (const n of Object.keys(R).sort()) if (R[n] > (L[n] || 0)) inn.push([n, R[n] - (L[n] || 0)]);
for (const n of Object.keys(L).sort()) if (L[n] > (R[n] || 0)) out.push([n, L[n] - (R[n] || 0)]);
const tot = a => a.reduce((s, x) => s + x[1], 0);
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// text list
let txt = `Etrata heist closer: cards to add to the site's base Etrata list (${tot(inn)} in / ${tot(out)} out; the commander stays)\n\nIN (print these as proxies):\n`;
for (const [n, k] of inn) { const c = idx[n]; txt += `${k} ${n}${c ? "  [" + c.cost + " | " + c.type + (c.minUsd != null ? " | $" + c.minUsd.toFixed(2) : "") + "]" : ""}\n`; }
txt += `\nOUT (take these out):\n`; for (const [n, k] of out) txt += `${k} ${n}\n`;
txt += `\nThe resulting 100-card list is decklist-heist-closer.txt (prices in prices-heist-closer.csv).\n`;
fs.writeFileSync(path.join(repo, "research/etrata-theft-aggro/local/proxies-from-etrata-base.txt"), txt);
// printable sheet: 9 cards per page at real size, image from Scryfall by the cheapest printing's set and number, text fallback
const cards = [];
for (const [n, k] of inn) { const c = idx[n]; const m = c && c.minScryfall && c.minScryfall.match(/scryfall\.com\/card\/([^/]+)\/([^/]+)\//); for (let i = 0; i < k; i++) cards.push({ n, c, set: m && m[1], num: m && decodeURIComponent(m[2]) }); }
const basics = { Island: ["fdn", "280"], Swamp: ["fdn", "282"] };
let html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Etrata proxies</title>
<style>
@page { size: A4; margin: 8mm; }
body { margin: 0; font-family: Georgia, serif; background: #fff; color: #000; }
.page { display: grid; grid-template-columns: repeat(3, 63.5mm); grid-auto-rows: 88.9mm; gap: 1mm; justify-content: center; page-break-after: always; padding: 2mm 0; }
.card { position: relative; width: 63.5mm; height: 88.9mm; border: 0.3mm solid #222; border-radius: 3mm; overflow: hidden; background: #f4efe3; box-sizing: border-box; }
.card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.text { padding: 3mm; font-size: 2.6mm; line-height: 1.25; }
.text .name { font-weight: bold; font-size: 3.1mm; display: flex; justify-content: space-between; gap: 2mm; }
.text .type { font-style: italic; margin: 1mm 0; border-bottom: 0.2mm solid #999; padding-bottom: 1mm; }
.text .pt { position: absolute; right: 3mm; bottom: 3mm; font-weight: bold; font-size: 3.2mm; }
.note { font: 12px/1.4 system-ui, sans-serif; margin: 10px 14px; color: #333; }
@media print { .note { display: none; } }
</style></head><body>
<p class="note">Etrata heist closer: ${cards.length} proxies (the cards the recommended list adds to the site's base Etrata list). Print at 100% scale on A4, 9 per page, real card size. Each card shows the Scryfall image of its default printing; if an image doesn't load, the printed text version underneath is complete.</p>`;
for (let i = 0; i < cards.length; i += 9) {
  html += `<div class="page">`;
  for (const x of cards.slice(i, i + 9)) {
    const c = x.c || {}, sn = basics[x.n] || [x.set, x.num];
    const img = `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(x.n)}&format=image&version=normal`;
    html += `<div class="card"><div class="text"><div class="name"><span>${esc(x.n)}</span><span>${esc(c.cost || "")}</span></div><div class="type">${esc(c.type || "")}</div><div>${esc(c.text || "").replace(/\n/g, "<br>")}</div>${c.pt ? `<div class="pt">${esc(c.pt)}</div>` : ""}</div>${img ? `<img src="${img}" alt="" loading="eager" onerror="this.remove()">` : ""}</div>`;
  }
  html += `</div>`;
}
html += `</body></html>`;
fs.writeFileSync(path.join(repo, "research/etrata-theft-aggro/local/proxies-from-etrata-base.html"), html);
console.log(`${tot(inn)} in / ${tot(out)} out; ${cards.length} proxies on ${Math.ceil(cards.length / 9)} pages; no image for: ` + (cards.filter(x => !(basics[x.n] || (x.set && x.num))).map(x => x.n).join(", ") || "none"));
console.log(txt.split("\n").slice(0, 70).join("\n"));
