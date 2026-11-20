/* Quick look: node tools/origins/smoke.js [deckA] [deckB] [seeds] [--log]
   Plays paired games between two real lists with the greedy bot and prints the score, and one game log with --log. */
const L = require('./lib.js');
const a = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'vh-crono';
const b = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 'pigs-crono';
const n = +process.argv[4] || 50;
(async () => {
  if (L.arg('log')) {
    const G = L.E.playGame([L.deck(a), L.deck(b)], [L.mkBot(), L.mkBot()], { seed: L.arg('seed', 7), log: true });
    let r = 0;
    for (const x of G.log) { if (x.r !== r) { r = x.r; console.log('--- round ' + r); } console.log('  ' + x.s); }
    console.log('winner: P' + G.winner + ' after ' + G.round + ' rounds; barriers ' + JSON.stringify(G.P.map((P) => P.barrier)) + ' breaks left ' + G.P.map((P) => P.notches));
    return;
  }
  const t0 = Date.now();
  const r = await L.bigDuel({ a, b, n, seed: L.arg('seed', 1) });
  const p = L.wr(r);
  console.log(`${a} vs ${b}: ${L.pct(p)} ± ${L.pct(L.ci(p, r.n))} over ${r.n} games (${r.wa}-${r.wb}-${r.dr}), ${(r.rounds / r.n).toFixed(1)} rounds, ${((Date.now() - t0) / r.n).toFixed(1)} ms per game wall`);
})();
