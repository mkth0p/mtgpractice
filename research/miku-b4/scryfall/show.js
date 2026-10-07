// node show.js queryKey [queryKey...] [--max N]: prints the cards a query found, one compact block each
const db = require("./cards.json"), qs = require("./queries.json");
const args = process.argv.slice(2); const mi = args.indexOf("--max"); const max = mi >= 0 ? +args[mi + 1] : 1e9; if (mi >= 0) args.splice(mi, 2);
const seen = new Set(global.SEEN || []);
for (const k of args) {
  const q = qs[k]; if (!q) { console.log("no query", k); continue; }
  console.log(`\n### ${k} (${q.total}): ${q.q}`);
  for (const n of q.cards.slice(0, max)) { const c = db[n]; console.log(`- ${n} | ${c.cost} | ${c.type}${c.pt ? " " + c.pt : ""} | $${c.usd}${c.gc ? " | GC" : ""}\n  ${c.text.replace(/\n/g, " / ")}`); }
}
