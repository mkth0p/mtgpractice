/* Bot against bot on random pairs of real lists (same seeds, both seats, both deck assignments).
   node tools/origins/botcheck.js --a '"std"' --b '"fast"' [--pairs 30] [--seeds 2] [--save std-fast] */
const L = require('./lib.js');
const { E } = L;
const keys = L.DK.META.map((d) => d.key);
const A = JSON.parse(L.arg('a', '{"type":"deep"}')), B = JSON.parse(L.arg('b', '{}'));
const pairs = L.arg('pairs', 30), seeds = L.arg('seeds', 2);
(async () => {
  const rng = E.rngFrom(L.arg('seed', 77));
  const tasks = [];
  for (let i = 0; i < pairs; i++) {
    const x = keys[Math.floor(rng() * keys.length)]; let y = x; while (y === x) y = keys[Math.floor(rng() * keys.length)];
    const s = E.mix(L.arg('seed', 77), i);
    tasks.push({ a: x, b: y, n: seeds, seed: s, botA: A, botB: B, role: 0 });
    tasks.push({ a: x, b: y, n: seeds, seed: s, botA: B, botB: A, role: 1 });
  }
  const t0 = Date.now();
  const rs = await L.pool(tasks);
  let w = 0, n = 0, rounds = 0;
  tasks.forEach((t, i) => { const r = rs[i]; w += (t.role === 0 ? r.wa : r.wb) + r.dr / 2; n += r.n; rounds += r.rounds; });
  const p = w / n;
  const save = L.arg('save', null);          // --save std-fast: keep the result in out/bots.json for the report
  if (save) {
    const fs = require('fs'), f = require('path').join(__dirname, 'out', 'bots.json');
    const all = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
    all[String(save)] = { a: A, b: B, p: +p.toFixed(4), n, ci: +L.ci(p, n).toFixed(4), ms: Math.round((Date.now() - t0) * 4 / n) };
    fs.writeFileSync(f, JSON.stringify(all, null, 1));
  }
  console.log(`A ${JSON.stringify(A)} vs B ${JSON.stringify(B)}: A wins ${L.pct(p)} ± ${L.pct(L.ci(p, n))} of ${n} games, ${(rounds / n).toFixed(1)} rounds, ${((Date.now() - t0) / 1000).toFixed(0)} s (${((Date.now() - t0) * 4 / n).toFixed(0)} ms per game per core)`);
})();
