/* The value model: how likely each player at the table is to win from here.

   Every live player is described by the same features (life, cards, mana, board, commander, how
   soon their turn comes, which deck they play, and for decks with a planner how close their win
   lines are). A small neural network turns each player's features into a strength score, and the
   chances are the softmax of the scores over the players still in the game, so one player's
   chance goes up only when someone else's goes down.

   Fitted by tools/sim/train-value.js on bot games (all seats of every game), which writes the
   weights between the VALUE markers below. Runs in the page, in the analysis worker and in Node.

   MK.Value.chances(g)        -> [p0, p1, ...] (0 for players out of the game)
   MK.Value.winProb(g, p)     -> p's chance
   MK.Value.seatFeatures(g, q) -> q's feature vector (FEATURES order) */
(function (root) {
  "use strict";
  const MK = root.MK;
  const V = MK.Value = MK.Value || {};
  const clip = (x, a, b) => Math.max(a, Math.min(b, x));
  // decks the model knows by name; any other deck gets no deck feature
  const DECKS = ["corrupted-etrata", "etrata", "etrata-b4", "azusa", "edgar", "ghalta", "krenko", "talrand", "urdragon", "ghired", "isperia", "kaalia", "lathril", "wilhelt", "miku", "corrupted"];
  const BASE = ["round", "life", "lifeRank", "poison", "cmdDmg", "hand", "lands", "mana", "creatures", "power", "evasive", "maxPower", "toughness", "others", "commander", "tax", "faceDown", "stolen", "library", "turnIn", "threat", "pressure", "lineNow", "lineNext", "lineLater", "tutors", "counters", "engines"];
  const FEATURES = BASE.concat(DECKS.map(d => "deck:" + d));
  V.FEATURES = FEATURES; V.DECKS = DECKS;

  function power(g, o) { try { return Math.max(0, g.power(o)); } catch (e) { return 0; } }
  function evasive(g, o) {
    try { const c = g.ch(o); return !!(c.unblockable || c.kws.has("flying") || c.kws.has("menace") || c.kws.has("trample")); } catch (e) { return false; }
  }
  /* Seats until q's next turn starts (0: it's q's turn). */
  function turnIn(g, q) {
    let k = 0, p = g.active;
    while (p !== q && k < 6) { p = g.seatAfter(p); k++; }
    return k;
  }
  /* The deck's own planner, when it has one: how close its win lines are. */
  function lines(g, q) {
    const T = MK.TRAIN && MK.TRAIN[q.deckId];
    if (T && T.lineFeatures) { try { return T.lineFeatures(g, q); } catch (e) { /* none */ } }
    return null;
  }
  function seatFeatures(g, q) {
    const alive = g.players.filter(x => !x.lost);
    const others = alive.filter(x => x !== q);
    const cr = g.creatures(q);
    const pw = cr.reduce((a, o) => a + power(g, o), 0);
    let mana = 0;
    try { mana = g.manaAfterUntap(q, null).total; } catch (e) { mana = g.controlled(q, o => g.isLand(o)).length; }
    const cmd = q.commanders && q.commanders[0];
    const cmdOut = cmd ? g.battlefield.includes(cmd) : false;
    const maxCmd = Object.values(q.cmdDmg || {}).reduce((a, b) => Math.max(a, b), 0);
    const lifeRank = others.length ? others.filter(x => x.life > q.life).length / others.length : 0;
    // what the others could swing at this player, against its life
    const incoming = others.reduce((a, x) => a + g.creatures(x).reduce((s, o) => s + power(g, o), 0), 0) / Math.max(1, others.length);
    // what this player could swing at the weakest other
    const minLife = others.length ? Math.min(...others.map(x => x.life)) : 40;
    const L = lines(g, q) || {};
    const v = {
      round: clip(g.round, 1, 16) / 10,
      life: clip(q.life, 0, 60) / 40,
      lifeRank,
      poison: clip(q.poison || 0, 0, 10) / 10,
      cmdDmg: clip(maxCmd, 0, 21) / 21,
      hand: clip(q.hand.length, 0, 10) / 7,
      lands: clip(g.controlled(q, o => g.isLand(o)).length, 0, 12) / 10,
      mana: clip(mana, 0, 20) / 10,
      creatures: clip(cr.length, 0, 12) / 8,
      power: clip(pw, 0, 60) / 20,
      evasive: clip(cr.filter(o => evasive(g, o)).reduce((a, o) => a + power(g, o), 0), 0, 40) / 15,
      maxPower: clip(cr.reduce((a, o) => Math.max(a, power(g, o)), 0), 0, 20) / 10,
      toughness: clip(cr.reduce((a, o) => { try { return a + Math.max(0, g.toughness(o)); } catch (e) { return a; } }, 0), 0, 60) / 20,
      others: clip(g.controlled(q, o => !g.isLand(o) && !g.isCreature(o)).length, 0, 12) / 8,
      commander: cmdOut ? 1 : 0,
      tax: cmd ? clip((q.cmdCasts && q.cmdCasts[cmd.id]) || 0, 0, 4) / 3 : 0,
      faceDown: clip(g.controlled(q, o => !!o.faceDown).length, 0, 6) / 4,
      stolen: clip(g.controlled(q, o => o.owner !== q).length, 0, 6) / 4,
      library: q.library.length < 12 ? (12 - q.library.length) / 12 : 0,
      turnIn: turnIn(g, q) / 3,
      threat: clip(incoming / Math.max(1, q.life), 0, 2),
      pressure: clip(pw / Math.max(1, minLife), 0, 2),
      lineNow: L.now ? 1 : 0, lineNext: L.next ? 1 : 0, lineLater: L.later ? 1 : 0,
      tutors: clip(L.tutors || 0, 0, 4) / 3, counters: clip(L.counters || 0, 0, 3) / 2, engines: clip(L.engines || 0, 0, 4) / 3
    };
    const out = BASE.map(k => +(+v[k] || 0).toFixed(3));
    for (const d of DECKS) out.push(q.deckId === d ? 1 : 0);
    return out;
  }
  V.seatFeatures = seatFeatures;

  // Fitted weights: { F, H, W1 (H x F), b1 (H), w2 (H), b2, meta }. null until train-value.js runs.
  let M = null;
  /*VALUE*/ M = {"F":44,"H":16,"W1":[[-0.2731,0.1038,-0.0578,0.071,-0.1544,-0.0816,-0.2165,-0.1267,-0.137,0.0115,-0.1375,-0.1889,-0.0803,-0.5729,-0.1894,0.0644,0.0274,0.0187,0.2878,0.6191,0.3898,0.303,-0.7005,0.096,0.2258,0.1967,0.2769,0.0422,0.403,0.2971,0.5122,0.3363,0.0024,-0.1117,-0.3575,-0.1569,-0.5233,0.1722,-0.1039,0.3087,0.1369,0.1475,0,0],[0.2754,-0.8138,0.2894,0.0237,0.2149,0.0637,-1.3379,-1.0859,-0.519,-0.044,-0.1761,0.0761,-0.0512,-0.1491,-0.0298,-0.1277,0.0535,-0.0891,0.0043,0.0901,0.3833,-0.4757,-0.5187,-0.4197,0.0258,0.0967,0.0777,0.3492,0.0553,0.1247,0.1034,-0.1235,-0.1546,-0.2751,-0.0739,0.0586,0.503,-0.1193,0.0243,-0.0344,-0.1952,0.1094,0,0],[0.7035,-0.7609,0.4147,0.0412,0.3498,-0.2844,-0.334,0.2108,0.3935,0.1435,-0.1989,0.1239,0.0331,-0.3536,-0.0093,0.3964,0.2766,0.1649,0.0965,-0.3453,1.0862,0.1432,-0.3778,-0.0383,-0.3849,-0.1513,-0.0369,-0.0858,0.0929,-0.2148,-0.2175,0.0973,-0.2826,0.002,-0.0176,0.0694,-0.21,0.1563,0.2055,0.049,-0.2212,0.0411,0,0],[0.0383,0.7259,0.2679,-0.0263,0.2642,-0.5678,0.3584,0.3457,0.4826,0.2166,0.1831,-0.4436,0.1989,-0.0193,-0.2049,0.0145,-0.0074,0.2817,-0.0449,0.1895,-0.0616,-0.0622,0.4358,-0.1305,0.3235,-0.061,-0.2089,-0.2778,-0.1709,-0.4144,-0.1759,0.0128,0.2498,0.1361,0.5321,0.1043,0.0989,-0.1628,-0.1418,0.3949,0.2087,-0.1987,0,0],[0.1989,-0.0992,-0.3801,0.0313,0.0075,-0.5198,0.0703,-0.0414,0.0699,0.0038,-0.0482,-0.283,-0.0322,0.0743,-0.1877,0.2713,0.0348,0.4233,0.1172,-0.0048,-0.0458,0.0975,-0.3469,-0.3618,0.0083,0.204,-0.05,0.0127,0.1388,-0.04,0.4807,0.1509,0.034,-0.2902,-0.2149,-0.422,-0.4486,0.1987,-0.2604,0.1786,0.0044,0.1453,0,0],[-0.0053,-0.0374,-0.0155,0,-0.0064,-0.0433,-0.0103,-0.0145,-0.0113,0.0092,0.0018,-0.0047,0.0113,-0.0077,-0.0061,0.0024,-0.0004,-0.0014,-0.0002,-0.0218,-0.0134,0.0103,0.0097,-0.0042,0.0142,0.0126,-0.0082,-0.0009,-0.0093,0.0054,0.0084,0.0115,-0.0034,-0.0014,-0.0135,0.005,-0.0049,0.0046,-0.0049,0.0043,0.0133,0.0004,0,0],[0.005,-0.0877,-0.0755,0.0552,0.1653,-0.7915,0.1115,0.2613,-0.554,0.1073,0.0575,0.3555,-0.2993,-0.0344,0.3393,-0.0508,-0.1556,-0.1761,0.0522,0.1279,0.3306,-0.1955,-0.3821,-0.6899,0.0256,-0.2718,0.0841,-0.1343,-0.2386,0.3702,0.3573,0.1942,0.2915,-0.2004,-0.4451,-0.2639,-0.294,-0.1821,0.0714,0.3488,0.1482,-0.2846,0,0],[0.1877,0.6837,0.1028,-0.0492,0.0327,0.0202,0.1147,0.405,0.1731,-0.3485,0.0689,-0.4042,-0.0388,0.1294,-0.0689,0.0534,0.3305,0.2065,-0.1313,-0.7393,-0.2679,0.0995,0.2781,0.4195,0.0165,0.0191,-0.0658,0.035,0.0838,0.101,0.0374,0.006,0.1625,-0.0497,0.1566,0.1159,0.0207,-0.1526,-0.1476,-0.032,0.0518,-0.1408,0,0],[-0.1536,-0.9585,0.5921,0.018,0.0916,-0.4561,-0.3876,0.547,0.0335,-0.404,0.1022,-0.3073,-0.1296,0.0593,0.0295,0.1227,0.1621,0.1612,0.1054,0.0951,-0.2741,-0.1243,-0.3813,-0.4105,-0.0986,-0.0234,0.0993,0.2178,0.0855,0.2082,0.3077,0.4243,-0.2298,-0.2663,0.5718,0.2436,-0.5039,-0.3559,-0.7543,-0.1039,-0.0624,0.0125,0,0],[-0.0019,-0.0017,0.0024,0,0.0012,0.005,0.0051,0.0141,-0.0049,0.0022,-0.0036,-0.0051,-0.0013,0.0121,-0.0099,-0.0073,-0.008,-0.0049,0.001,0.0092,0.0032,0,0.0036,-0.0062,0.0011,-0.0003,-0.0169,-0.0064,-0.0003,-0.0129,-0.0023,-0.0014,-0.0018,-0.0033,-0.0088,0.0099,-0.0076,-0.0055,0.017,-0.0003,0.0026,0.0171,0,0],[-0.3183,0.0185,0.1643,-0.0071,0.0115,0.5671,0.4767,0.2712,0.0119,0.2709,0.0338,0.2082,0.2738,0.2762,0.2607,-0.241,0.1069,-0.0143,0.0024,0.8292,0.1551,0.0048,0.1429,-0.0551,-0.012,-0.0179,0.0583,-0.1373,0.1475,-0.0954,-0.0718,-0.0697,-0.0934,0.1896,-0.072,0.1918,-0.2256,0.1873,0.1326,-0.0243,-0.0773,0.0673,0,0],[0.1065,-0.0806,0.6719,-0.0005,-0.0008,0.577,0.5672,0.1202,0.1606,0.2884,-0.1198,-0.1,0.3348,-0.1271,-0.1892,-0.0617,-0.1873,-0.0862,0.0133,0.1645,0.5215,0.1141,0.1612,0.3033,-0.1178,0.1706,-0.0794,-0.0173,0.0959,-0.2406,-0.2737,-0.1674,-0.0394,0.1166,0.0642,0.199,0.1246,0.2541,0.0043,-0.2095,-0.2334,0.1782,0,0],[-0.2721,-0.2147,0.0608,-0.0633,-0.1475,0.5277,0.3673,0.4782,0.2517,0.0933,0.0405,-0.1257,0.1388,0.8014,0.1651,-0.0973,0.2335,-0.0015,-0.0247,-0.1776,-0.4003,0.1119,0.571,0.7926,-0.0204,0.1136,0.0575,0.0224,0.0802,-0.3595,-0.0428,-0.0567,0.1611,0.3286,0.2104,-0.0916,0.3456,-0.4385,0.0718,-0.1048,-0.0011,-0.2153,0,0],[0.1527,0.9759,-0.1838,-0.0436,0.2338,0.1239,0.0428,-0.4614,0.1925,0.0423,-0.1137,0.2469,0.0886,-0.1322,-0.0264,0.2024,-0.1573,-0.2908,-0.132,-0.3586,-0.4241,0.0044,0.408,0.4875,-0.0495,-0.1731,0.0482,0.0842,-0.0543,-0.3498,-0.3432,-0.0357,0.143,0.2108,0.0848,0.2853,0.0912,0.1107,0.2301,0.2674,0.0316,-0.0319,0,0],[-0.1857,-0.2894,0.207,0.0189,-0.1046,0.5786,-0.5598,-0.5436,-0.0548,-0.4399,0.2223,-0.506,-0.1709,-0.8188,-0.1982,-0.0595,0.3306,0.1933,0.0209,0.1898,0.0651,-0.0498,-0.5584,-0.1076,-0.0228,-0.0915,-0.0728,-0.0134,0.2918,0.3908,0.3248,-0.1882,-0.5098,-0.1357,0.2168,-0.2139,-0.3104,-0.194,0.3303,-0.4731,0.1249,0.3781,0,0],[-0.0003,0.0006,-0.0003,0,0.0014,-0.0003,0.0014,0.0046,0.0002,0.0013,0.0011,-0.0011,0.0003,0.0044,-0.0027,-0.0012,-0.0018,-0.0006,0.0003,0.0026,0.0001,0.0022,-0.0005,-0.0043,-0.0008,-0.0004,-0.0057,-0.0033,-0.0002,-0.0037,-0.0021,0,-0.002,-0.0028,-0.0012,0.0008,-0.0034,-0.0022,0.0044,-0.0006,0.0016,0.0059,0,0]],"b1":[1.0619,0.4555,0.1513,-0.3642,-0.0509,-0.1611,-0.3952,0.3797,-0.1541,-0.625,-0.1274,-0.2159,-0.6192,0.3457,0.8211,-0.6945],"w2":[-0.9256,-1.2428,-0.9169,0.631,-0.5568,-0.0063,-0.8037,0.5505,-1.1298,0.0018,0.5834,0.562,0.6579,0.7318,-0.7325,-0.0005],"b2":0,"meta":{"games":10000,"positions":342367,"logloss":1.0519,"uniform":1.3049,"top1":0.526,"etrata":{"n":61717,"logloss":0.4546,"oldLogloss":0.4667,"brier":0.1461,"oldBrier":0.1494}}}; /*VALUE-END*/
  V.setModel = m => { M = m; };
  V.getModel = () => M;

  /* A player's strength score from its features. */
  function score(x) {
    if (!M) {
      // before the model is fitted: life, board and lines, by hand
      const f = k => x[FEATURES.indexOf(k)] || 0;
      return 1.2 * f("life") + 0.6 * f("power") + 0.4 * f("mana") + 0.3 * f("hand") + 2 * f("lineNow") + f("lineNext") - 0.8 * f("threat");
    }
    let s = M.b2;
    for (let j = 0; j < M.H; j++) {
      let z = M.b1[j];
      const row = M.W1[j];
      for (let i = 0; i < M.F && i < x.length; i++) z += row[i] * x[i];
      s += M.w2[j] * Math.tanh(z);
    }
    return s;
  }
  V.score = score;
  /* Softmax of the live players' scores. */
  function softmax(scores, alive) {
    let mx = -Infinity;
    for (let i = 0; i < scores.length; i++) if (alive[i]) mx = Math.max(mx, scores[i]);
    let sum = 0;
    const e = scores.map((s, i) => alive[i] ? Math.exp(s - mx) : 0);
    for (const x of e) sum += x;
    return e.map(x => sum ? x / sum : 0);
  }
  V.softmax = softmax;
  function chances(g) {
    // a playout stopped at its horizon is "over" with no winner: score it like any position
    if (g.over && g.winner) return g.players.map(q => g.winner === q ? 1 : 0);
    const alive = g.players.map(q => !q.lost);
    const scores = g.players.map(q => q.lost ? 0 : score(seatFeatures(g, q)));
    return softmax(scores, alive);
  }
  V.chances = chances;
  V.winProb = (g, p) => chances(g)[p.idx];
  /* For the review: each feature's push on this player's score, compared with the table's average
     (which features made this position good or bad). Returns [{ k, d }] sorted by size. */
  V.explain = function (g, p) {
    const x = seatFeatures(g, p);
    const base = score(x);
    const out = [];
    for (let i = 0; i < BASE.length; i++) {
      if (!x[i]) continue;
      const y = x.slice(); y[i] = 0;
      out.push({ k: BASE[i], v: x[i], d: base - score(y) });
    }
    return out.sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  };
})(typeof window !== "undefined" ? window : globalThis);
