// node scripts/draftcheck.js draft/<list>.txt IDENTITY: count, identity, legality, duplicates, € total, GC, top prices, cards missing from the engine
const idx = require("../scryfall/index.json"), fs = require("fs"), path = require("path");
const eng = new Set(fs.readFileSync(path.join(__dirname, "../engine-cards.txt"), "utf8").split("\n").map(s => s.trim()));
const [file, ci] = process.argv.slice(2);
const L = fs.readFileSync(file, "utf8").trim().split("\n").map(s => s.trim()).filter(Boolean);
const find = n => idx[n] || Object.values(idx).find(x => x.name.split(" // ")[0] === n);
let eur = 0, gc = []; const bad = [], miss = [], seen = {}, pr = [];
for (const n of L) { const c = find(n); if (!c) { bad.push("NOTFOUND " + n); continue; } seen[n] = (seen[n] || 0) + 1;
  if (!c.color_identity.every(k => ci.includes(k))) bad.push("CI " + n); if (c.legal_commander !== "legal") bad.push("LEGAL " + n);
  eur += c.price_eur || 0; if (c.price_eur == null) bad.push("NOPRICE " + n); if (c.game_changer) gc.push(n); if (!eng.has(n) && !eng.has(n.split(" // ")[0])) miss.push(n); pr.push([c.price_eur || 0, n]); }
for (const n in seen) if (seen[n] > 1 && !/^(Forest|Plains|Island|Swamp|Mountain|Wastes)$/.test(n)) bad.push("DUP " + n);
console.log(`${path.basename(file)}: ${L.length} cards (incl. commander); EUR ${eur.toFixed(0)}; GC ${gc.length}; lands ${L.filter(n => /Land/.test((find(n) || {}).type_line || "")).length}; problems: ${bad.join(", ") || "none"}`);
console.log("  top prices:", pr.sort((a, b) => b[0] - a[0]).slice(0, 18).map(([p, n]) => `${n} ${p}`).join(" | "));
console.log("  not in engine:", miss.join(" | "));
