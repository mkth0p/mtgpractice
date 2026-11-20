/* One-at-a-time sensitivity of the bot's evaluation weights: each weight is scaled down and up and the changed bot
   plays the standard one on random pairs of real lists (same seeds, both seats, both deck assignments).
   node tools/origins/scan.js [--pairs 80] [--seeds 5] [--scales 0.4,2.5] [--keys pw,hpv] */
const L = require('./lib.js');
const { E, A } = L;
const keys = L.DK.META.map((d) => d.key);
const pairs = L.arg('pairs', 80), seeds = L.arg('seeds', 5);
const scales = String(L.arg('scales', '0.4,2.5')).split(',').map(Number);
const which = L.arg('keys', null) ? String(L.arg('keys')).split(',') : Object.keys(A.W0).filter((k) => k !== 'a1');
const base = L.PRESET[L.arg('bot', 'fast')];
(async () => {
  const tasks = [];
  which.forEach((k, ki) => scales.forEach((sc, si) => {
    const W = Object.assign({}, A.W0); W[k] = +(Math.max(W[k], 0.05) * sc).toFixed(3);
    const rng = E.rngFrom(4242);
    for (let i = 0; i < pairs; i++) {
      const x = keys[Math.floor(rng() * keys.length)]; let y = x; while (y === x) y = keys[Math.floor(rng() * keys.length)];
      const s = E.mix(4242, i);
      tasks.push({ a: x, b: y, n: seeds, seed: s, botA: Object.assign({}, base, { W }), botB: base, tag: ki * 10 + si, role: 0 });
      tasks.push({ a: x, b: y, n: seeds, seed: s, botA: base, botB: Object.assign({}, base, { W }), tag: ki * 10 + si, role: 1 });
    }
  }));
  const rs = await L.pool(tasks);
  which.forEach((k, ki) => {
    const out = scales.map((sc, si) => { let w = 0, n = 0; tasks.forEach((t, i) => { if (t.tag === ki * 10 + si) { const r = rs[i]; w += (t.role === 0 ? r.wa : r.wb) + r.dr / 2; n += r.n; } }); return `x${sc}: ${(100 * w / n).toFixed(1)}%`; });
    console.log(k.padEnd(9) + String(A.W0[k]).padEnd(6) + out.join('   '));
  });
  console.log(`${pairs * seeds * 4} games per cell, noise about ±${(100 * 1.96 * 0.5 / Math.sqrt(pairs * seeds * 4)).toFixed(1)}%`);
})();
