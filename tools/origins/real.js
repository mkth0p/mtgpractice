/* Real-world numbers used to check the simulator (all read on 2026-11-12, see the research notes for the pages).
   Win rates are in percent, with the number of games behind them where the source gives it. */
const V = 'van-helsing', P = 'three-not-so-little-pigs', L = 'legion-of-the-dead', D = 'dracula', R = 'robin-hood', A = 'king-arthur',
  Q = 'queen-of-hearts', O = 'dorothy', M = 'merlin', U = 'mulan', S = 'wicked-stepmother', F = 'dr-frank';
module.exports = {
  // Current patch (after 4 Nov 2026): OriginsMeta ladder tracker, 1,162 games
  ladderNov: {
    label: 'OriginsMeta ladder, patch of 4 Nov 2026', games: 1162, patch: null,
    wr: { [V]: [58.8, 165], [D]: [57.6, 297], [P]: [57.4, 376], [A]: [52.2, 90], [L]: [50.0, 100], [Q]: [44.5, 119], [R]: [40.9, 93], [M]: [40.5, 42], [U]: [39.6, 48], [O]: [25.6, 39] },
  },
  // Patch 0.7 (29 Sep to 3 Nov): OriginsMeta meta report of 19 Oct, 2,478 matches
  meta19oct: {
    label: 'OriginsMeta meta report, 19 Oct 2026 (patch 0.7)', games: 2478, patch: '0.7',
    wr: { [P]: [61.2, 709], [V]: [61.0, 575], [R]: [59.9, 362], [Q]: [50.3, 306], [M]: [45.9, 368], [L]: [43.6, 617], [D]: [43.3, 436], [U]: [42.3, 293], [A]: [36.5, 197], [S]: [28.6, 105], [O]: [20.0, 85] },
    matchups: [[V, P, 56, null], [P, R, 54, 61], [R, V, 55, null], [R, D, 86.7, 30]],
  },
  // Mostly patch 0.7: Origins Vault, 30 days to 12 Nov, 8,456 games
  vault30: {
    label: 'Origins Vault, 30 days to 12 Nov 2026 (mostly patch 0.7)', games: 8456, patch: '0.7',
    wr: { [P]: [60.0, 2751], [R]: [57.6, 1600], [V]: [56.4, 1849], [M]: [48.5, 1181], [Q]: [46.3, 791], [L]: [45.9, 1988], [U]: [41.9, 810], [A]: [41.5, 1059], [D]: [39.1, 1051], [O]: [34.1, 308], [S]: [25.4, 272] },
    share: { [P]: 20.1, [L]: 14.6, [V]: 13.5, [R]: 11.7, [M]: 8.6, [A]: 7.8, [D]: 7.7, [U]: 5.9, [Q]: 5.8, [O]: 2.3, [S]: 2.0 },
  },
  // Crimson Cup, 19 to 25 Oct 2026 (patch 0.7): share of the 4,917 decks brought and how often each was banned
  cup: {
    label: 'Crimson Cup 2026 field', decks: 4917,
    share: { [P]: 24.3, [V]: 20.9, [M]: 9.2, [L]: 8.8, [U]: 8.7, [R]: 7.2, [D]: 6.2, [Q]: 6.1, [A]: 5.5, [O]: 2.2, [S]: 1.0 },
    ban: { [P]: 33.3, [V]: 50.5, [M]: 42.0, [L]: 13.5, [U]: 18.1, [R]: 17.6, [D]: 14.0, [Q]: 11.5, [A]: 19.6, [O]: 20.8, [S]: 14.3 },
  },
  tiers: { label: 'OriginsMeta tier list, 9 Nov 2026', S: [P, D, V], A: [A, L], B: [U], C: [Q, R, M], D: [F, O] },
};
