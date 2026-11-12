/* Best three-deck line-up for a Conquest tournament with one ban (the Crimson Cup format).
   Each player brings three decks with different Legendaries. Each bans one deck of the other, then the two decks
   left play a best of three: a deck that wins is put away, and the first player to win once with both decks wins.
   Both the bans and the deck picked for each game are made without seeing the other's choice, so each of them is
   a small matrix game; they are solved exactly (2x2) or by iteration (3x3).

   lineups(decks, wr, share) -> { best, nash } where wr[i][j] is deck i's win rate against deck j. */

// value of a zero-sum matrix game for the row player (who maximises), by fictitious play; exact for saddle points
function gameValue(M) {
  const R = M.length, C = M[0].length;
  if (R === 1) return Math.min(...M[0]);
  if (C === 1) return Math.max(...M.map((r) => r[0]));
  if (R === 2 && C === 2) {
    const [[a, b], [c, d]] = M;
    const lo = Math.max(Math.min(a, b), Math.min(c, d)), hi = Math.min(Math.max(a, c), Math.max(b, d));
    if (lo >= hi - 1e-12) return lo;                       // saddle point
    return (a * d - b * c) / (a + d - b - c);              // both mix
  }
  const rs = new Array(R).fill(0), cs = new Array(C).fill(0);
  let r = 0, c = 0, lo = -Infinity, hi = Infinity;
  for (let t = 1; t <= 4000; t++) {
    for (let i = 0; i < R; i++) rs[i] += M[i][c];
    for (let j = 0; j < C; j++) cs[j] += M[r][j];
    r = 0; for (let i = 1; i < R; i++) if (rs[i] > rs[r]) r = i;
    c = 0; for (let j = 1; j < C; j++) if (cs[j] < cs[c]) c = j;
    hi = Math.min(hi, rs[r] / t); lo = Math.max(lo, cs[c] / t);
  }
  return (lo + hi) / 2;
}

// Conquest between two sets of decks still to win with (indices into wr)
function conquest(A, B, wr, memo) {
  if (!A.length) return 1;
  if (!B.length) return 0;
  const key = A.join(',') + '|' + B.join(',');
  if (memo.has(key)) return memo.get(key);
  const M = A.map((a) => B.map((b) => wr[a][b] * conquest(A.filter((x) => x !== a), B, wr, memo) + (1 - wr[a][b]) * conquest(A, B.filter((x) => x !== b), wr, memo)));
  const v = gameValue(M);
  memo.set(key, v);
  return v;
}

// match win probability of line-up A against line-up B, bans included
function match(A, B, wr, memo) {
  // A bans one of B's decks (columns), B bans one of A's (rows are A's choice)
  const M = B.map((bj) => A.map((ai) => conquest(A.filter((x) => x !== ai), B.filter((x) => x !== bj), wr, memo)));
  return gameValue(M);            // rows: the deck of B that A bans (A maximises); columns: the deck of A that B bans
}

function lineups(decks, wr, share) {
  // one deck per Legendary: the indices given are already the chosen representatives
  const K = decks.length;
  const trios = [];
  for (let a = 0; a < K; a++) for (let b = a + 1; b < K; b++) for (let c = b + 1; c < K; c++) {
    if (new Set([decks[a].legend, decks[b].legend, decks[c].legend]).size === 3) trios.push([a, b, c]);
  }
  const memo = new Map();
  const T = trios.length;
  const V = trios.map(() => new Array(T).fill(0.5));
  for (let i = 0; i < T; i++) for (let j = i + 1; j < T; j++) { const v = match(trios[i], trios[j], wr, memo); V[i][j] = v; V[j][i] = 1 - v; }
  // field of line-ups: three Legendaries drawn with the tournament's deck shares
  const w = trios.map((t) => t.reduce((a, i) => a * (share[decks[i].legend] || 0), 1));
  const ws = w.reduce((a, b) => a + b, 0);
  const vsField = V.map((row) => row.reduce((a, x, j) => a + x * w[j], 0) / ws);
  // Nash mix over line-ups (multiplicative weights)
  let mix = new Array(T).fill(1 / T), avg = new Array(T).fill(0);
  const iters = 6000;
  for (let t = 1; t <= iters; t++) {
    const pay = V.map((row) => row.reduce((a, x, j) => a + (x - 0.5) * mix[j], 0));
    const eta = 6 / Math.sqrt(t);
    let s = 0;
    mix = mix.map((x, i) => { const y = x * Math.exp(eta * pay[i]); s += y; return y; });
    mix = mix.map((x) => x / s);
    for (let i = 0; i < T; i++) avg[i] += mix[i];
  }
  avg = avg.map((x) => x / iters);
  const payN = V.map((row) => row.reduce((a, x, j) => a + (x - 0.5) * avg[j], 0));
  const rows = trios.map((t, i) => ({ decks: t.map((x) => decks[x].key), legends: t.map((x) => decks[x].legend), field: +vsField[i].toFixed(4), nash: +avg[i].toFixed(4), vsNash: +(0.5 + payN[i]).toFixed(4) }));
  return { n: T, byField: rows.slice().sort((a, b) => b.field - a.field).slice(0, 10), byNash: rows.slice().sort((a, b) => b.nash - a.nash).slice(0, 8), gap: Math.max(...payN) };
}

module.exports = { gameValue, conquest, match, lineups };
