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
  /*VALUE*/ M = {"F":44,"H":16,"W1":[[0.3729,-0.0691,-0.4223,-0.0095,0.1841,-0.149,-0.5798,-0.3676,0.0646,-0.0225,-0.266,-0.0344,0.1124,0.2436,0.118,0.0147,-0.0048,0.2829,0.198,0.2034,1.548,0.176,-0.1421,0.2676,-0.3588,-0.1753,0.1459,0.1519,0.1148,0.0418,0.0866,-0.0579,-0.1946,-0.2439,0.1776,-0.0121,-0.4724,0.1523,0.4391,0.272,0.1912,-0.0963,0,0],[0.166,-0.33,-0.0987,-0.0029,0.0159,-0.2029,-0.1603,-0.0348,0.0314,-0.0161,-0.2373,-0.1832,-0.0729,-0.5352,-0.1097,-0.0591,-0.1227,-0.1906,0.0568,-0.0767,0.4191,0.0884,-0.3022,-0.1962,-0.0666,0.1407,0.1029,0.1531,0.3403,-0.0063,0.2535,-0.1377,-0.1348,-0.2379,-0.3306,-0.1283,0.0661,0.1932,-0.2853,0.1052,-0.0329,0.1017,0,0],[0.596,-0.6638,0.3045,-0.0283,0.0576,-0.1463,-0.3676,0.255,0.0721,0.1525,0.0499,-0.1933,0.1243,-0.085,-0.0294,0.1601,0.2286,0.0013,0.068,-0.2775,1.151,0.0769,-0.3625,-0.2139,-0.1541,-0.1654,0.1329,-0.3155,0.0466,-0.2559,-0.3163,0.1553,-0.4072,-0.0333,-0.0007,0.0282,-0.2617,0.2024,0.4303,0.3526,-0.2606,-0.1435,0,0],[0.2604,0.7307,-0.0745,0.0035,0.0644,-0.3931,1.0011,0.7503,0.1163,0.078,-0.0207,-0.2835,0.001,0.1898,-0.0387,0.113,0.0996,0.2362,-0.0143,0.0022,0.0759,0.1165,0.2985,-0.0702,0.0348,-0.1943,-0.0931,-0.128,0.0792,-0.0724,-0.1084,-0.1261,0.1563,0.2807,0.3118,-0.1796,-0.1365,-0.1585,0.0936,0.2626,0.016,-0.4233,0,0],[-0.0762,-0.0947,-0.366,-0.0123,-0.1135,-0.2476,-0.0498,0.2053,-0.3097,0.1231,0.0223,0.1002,-0.065,0.0353,-0.2071,0.1122,0.1413,0.1217,0.2472,0.0445,0.0849,0.2076,-0.4301,-0.228,-0.0121,0.2479,0.1781,0.1934,0.3367,-0.0764,0.6465,-0.1284,-0.1521,-0.2663,-0.5296,-0.4999,-0.3697,0.2326,-0.2516,0.095,0.1283,0.2023,0,0],[-0.1332,-0.1086,-0.3142,0.0009,-0.0006,-0.5213,-0.2802,-0.3597,-0.3827,-0.2517,0.0128,-0.2121,-0.1792,-0.2994,0.1699,-0.035,0.0512,-0.0688,0.0024,-0.1896,-0.3332,-0.2742,-0.091,-0.1275,-0.004,-0.2315,0.0146,-0.0495,-0.1805,0.0732,-0.0232,-0.0162,0.046,-0.0758,-0.3536,0.0388,0.146,-0.0879,0.0478,0.0794,0.3004,0.0066,0,0],[-0.0001,-0.0015,-0.0025,0,-0.0015,0.0022,-0.0007,0.0021,0.0044,0.004,0.0014,0.0002,0,-0.0006,-0.0022,-0.0006,0.001,0.002,0.0011,-0.0023,-0.0008,0.0027,-0.0004,-0.0018,-0.0048,0.0017,-0.003,-0.0006,0.0015,0.0023,0.0029,-0.0035,-0.0033,0.0005,0.0005,-0.0035,-0.0003,0.0009,0.0011,0.0006,0.0036,-0.0001,0,0],[0.5379,1.1631,-0.1122,0.0011,0.0695,-0.2076,0.3369,0.0521,-0.0669,-0.3174,0.0156,-0.3275,0.1066,-0.1861,-0.1967,0.3414,0.2782,0.0365,-0.2923,-0.6986,-0.0198,0.0524,0.3104,0.3807,-0.0502,-0.3916,-0.1442,-0.1813,0.0597,-0.1009,-0.1277,0.0739,0.1312,0.0771,0.1671,-0.2089,0.1692,-0.2157,-0.1506,0.3616,0.1371,-0.3241,0,0],[0.0009,-0.7493,0.4281,0.0008,-0.0396,-0.0958,0.0303,0.5247,0.2069,-0.4582,0.2337,-0.3893,-0.1866,-0.1926,-0.0414,0.3224,0.4281,0.4448,0.1495,0.1473,-0.0042,-0.043,-0.5051,-0.3641,-0.4552,0.2297,-0.3501,0.295,0.049,0.5416,0.44,0.0825,-0.3789,-0.2366,0.3051,-0.4177,-0.2004,-0.247,-0.2824,-0.0729,-0.3598,-0.2106,0,0],[-0.0757,0.1331,0.1907,0.0119,0.2404,-1.2471,0.0953,0.0304,-0.2685,0.1158,-0.1992,0.069,0.0837,-0.3506,-0.1176,0.3955,-0.0996,-0.1391,0.0812,0.1797,0.1234,-0.2344,-0.2593,-0.7497,-0.0248,-0.2493,-0.1951,-0.1332,-0.0222,0.0117,-0.4678,0.1421,0.1342,-0.0957,0.126,-0.3178,-0.1773,-0.0095,-0.1529,0.4759,0.1984,-0.2503,0,0],[0.0379,0.3991,0.0278,0.0032,0.1467,0.3045,0.3773,0.019,-0.0025,0.1325,0.0952,0.135,0.2295,0.2632,0.0297,-0.0453,-0.1056,0.1298,-0.0127,0.8356,0.1706,-0.1976,0.2294,-0.4597,0.0484,-0.3887,-0.1169,-0.166,-0.2481,0.1311,0.0489,-0.0341,0.0161,0.107,0.3106,-0.1358,-0.0688,0.051,-0.0005,0.0393,0.124,-0.1378,0,0],[-0.3497,0.8264,-0.238,-0.0109,-0.1424,0.0465,1.2346,0.794,0.2404,0.2829,0.0623,0.017,0.1415,0.1055,0.3784,-0.2652,-0.0597,0.0833,-0.0024,-0.0618,-0.1859,0.3892,0.3097,0.6023,-0.2761,0.0545,0.1799,-0.0789,0.25,-0.4242,-0.2193,0.0995,0.1469,0.2653,-0.1934,0.2682,-0.4931,0.1875,-0.0765,0.0693,-0.0146,0.0107,0,0],[0.385,-0.3142,0.012,0.0204,0.0191,-0.035,-0.0339,0.2802,0.0566,0.1823,0.0283,0.1883,0.1136,1.2433,0.276,0.072,0.0319,0.0959,-0.1111,-0.3757,-0.4912,-0.028,0.7971,0.6829,-0.0324,-0.1233,0.0465,0.0228,-0.2245,-0.3662,-0.1092,-0.0405,0.182,0.0668,0.1108,0.1446,0.5074,-0.3551,-0.137,0.1931,0.1659,-0.1913,0.0004,0],[0.1792,0.254,0.0418,-0.0051,0.0391,0.6435,-0.041,-0.4336,0.7676,0.0058,-0.2313,-0.234,0.7475,0.2564,-0.4526,0.1746,-0.3355,-0.1054,-0.0884,0.1724,-0.144,0.0734,0.5732,0.7096,0.2088,0.1479,0.1368,0.0279,-0.1595,-0.5726,-0.4552,-0.2009,-0.1248,0.1885,0.5943,0.2205,0.5056,0.1701,0.1325,0.0811,-0.1255,0.1242,0,0],[-0.1087,-0.0651,0.1968,-0.0037,-0.0406,0.2904,-0.8491,-0.8625,-0.0988,-0.2845,0.2166,-0.057,-0.0596,-0.7379,-0.149,-0.0637,0.1656,-0.0449,0.0133,0.19,-0.0333,-0.3227,-0.3558,-0.3894,-0.0206,-0.1611,-0.0014,-0.073,-0.1934,0.2843,0.2372,-0.0258,-0.3772,0.0047,0.1549,-0.0677,-0.0285,0.0278,0.1286,-0.1848,0.2788,0.227,0,0],[0,0.0003,0.0005,0,-0.0007,0.0012,-0.0008,0.0003,0.0014,0.0016,0.0004,-0.0004,0.0015,0,-0.0002,-0.0007,0.0007,0.0008,-0.0002,0,-0.0007,0.0011,0.0001,-0.0009,0.0001,0.0005,-0.0016,0.0002,0.0001,-0.0002,0.0007,-0.0007,-0.0013,-0.0003,0.0014,-0.0007,-0.0012,0.0006,-0.0001,0.0004,0.0021,0.0004,0,0]],"b1":[1.0299,0.1091,0.3191,-0.542,-0.0184,0.2634,-0.7439,0.173,-0.493,-0.5108,0.0174,-0.4164,-0.9969,0.0985,0.7817,1.391],"w2":[-1.0134,-0.3482,-0.8063,0.639,-0.6005,-0.4341,0.0011,0.8855,-0.8242,-0.8131,0.5118,1.1712,0.7843,1.0224,-0.6204,-0.0002],"b2":0,"meta":{"games":10000,"positions":354223,"logloss":1.0885,"uniform":1.3136,"top1":0.507,"etrata":{"n":64518,"logloss":0.4974,"oldLogloss":0.5194,"brier":0.1635,"oldBrier":0.1697}}}; /*VALUE-END*/
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
