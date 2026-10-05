// node paired.js OUTDIR BASE VAR... [--hero "Corrupted Etrata"]: paired win-rate difference by seed (VAR minus BASE)
const fs = require("fs"), path = require("path");
let args = process.argv.slice(2), me = "Corrupted Etrata";
const h = args.indexOf("--hero"); if (h >= 0) { me = args[h + 1]; args.splice(h, 2); }
const [dir, base, ...vars] = args;
const load = name => { const m = new Map(); for (const f of fs.readdirSync(dir).filter(f => f.slice(name.length + 1).match(/^\d+\.json$/) && f.startsWith(name + "-"))) for (const x of JSON.parse(fs.readFileSync(path.join(dir, f)))) if (x.players.filter(q => q.name === me).length === 1) m.set(x.seed, x.winner === me ? 1 : 0); return m; };
const b = load(base);
for (const v of vars) {
  const m = load(v); let n = 0, d = 0, dd = 0;
  for (const [s, w] of m) if (b.has(s)) { const x = w - b.get(s); n++; d += x; dd += x * x; }
  const mean = d / n, se = Math.sqrt((dd / n - mean * mean) / n);
  console.log(`${v.padEnd(30)} ${(100 * mean >= 0 ? "+" : "") + (100 * mean).toFixed(1)} ±${(100 * se).toFixed(1)} pts (n ${n})`);
}
