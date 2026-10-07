const fs = require("fs"), path = require("path");
const repo = "/Users/glyphsek/Documents/mtg-todeletelater/mtgpractice", idx = require(path.join(repo, "research/etrata-theft-aggro/local/scryfall/ub-index.json"));
const txt = fs.readFileSync(path.join(repo, "research/etrata-theft-aggro/local/proxies-from-etrata-base.txt"), "utf8");
const names = txt.split("OUT (take these out):")[0].split("\n").filter(l => /^\d+ /.test(l)).map(l => l.replace(/^\d+ /, "").replace(/\s+\[.*$/, ""));
const out = names.map(n => { const c = idx[n], m = c.minScryfall.match(/scryfall\.com\/card\/([^/]+)\/([^/]+)\//); return { name: n, set: m[1], num: decodeURIComponent(m[2]), file: n.replace(/[^A-Za-z0-9]+/g, "_") + ".jpg" }; });
fs.writeFileSync(process.argv[2], JSON.stringify(out, null, 1)); console.log(out.length, "cards");
