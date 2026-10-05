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
  /*VALUE*/ M = {"F":44,"H":16,"W1":[[0.0245,-0.0782,-0.1169,-0.0626,0.2975,-0.061,-0.3299,-0.3359,0.0498,-0.0527,0.0862,-0.0181,-0.184,0.008,-0.0734,0.2164,-0.0325,-0.1496,0.2676,0.2081,2.4094,-0.0719,0.1059,0.2493,0.0075,-0.6705,0.0079,-0.2473,0.4343,-0.0704,-0.2513,0.0549,-0.0722,-0.4399,0.1489,0.3576,-0.5779,-0.0116,0.2414,0.2497,0.3186,-0.0845,0,0],[0.209,-0.3599,-0.5365,-0.0338,0.0722,-0.1241,0.0028,0.2749,0.4915,0.1176,-0.3084,-0.935,0.577,-0.2912,-0.3051,0.2395,0.0126,0.1473,0.1998,-0.0434,0.0313,0.0864,-0.1599,0.1579,0.0187,0.1278,0.3418,0.1393,0.512,-0.1435,-0.345,-0.0641,-0.1604,-0.1238,0.2473,0.2396,0.1224,-0.0095,-0.3746,-0.0622,-0.0676,0.0579,0,0],[0.9528,-0.5326,0.2802,-0.0108,0.0115,-0.1476,0.0563,-0.1046,0.0041,0.5448,0.0637,-0.1247,0.115,0.2971,-0.0799,-0.1217,0.1262,-0.2322,0.1335,-0.5293,0.5186,0.0411,-0.434,-0.6125,-0.5442,0.2575,-0.0223,0.0194,-0.2295,0.0978,0.1648,0.1923,-0.3327,0.1599,-0.0291,-0.0683,0.2705,-0.1365,-0.2627,-0.1196,-0.0607,-0.0167,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0.0945,0.43,0.3752,-0.0578,-0.1196,0.0483,-0.1693,0.2704,-0.1507,-0.4109,-0.0916,-0.0614,-0.5187,-0.14,-0.1753,-0.1689,-0.2318,-0.2207,0.1576,0.5923,0.8065,-0.1618,-0.0096,0.1062,0.1703,-0.094,0.0329,0.0022,0.5304,-0.4015,-0.3587,0.2185,0.1413,-0.0514,-0.3292,0.2359,-0.2608,-0.0047,-0.0746,0.1868,-0.0207,0.1459,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-0.0001,0],[0.0769,-0.1919,-0.4103,0.0115,0.0714,0.1357,-0.1556,0.9085,0.0294,-0.0278,-0.374,-0.323,0.0693,0.0348,0.1145,0.5414,0.0108,-0.2938,0.0709,-0.0708,0.1355,0.4174,-0.7485,-0.5376,-0.681,-0.3669,0.1633,-0.1157,-0.6081,0.2294,0.2963,-0.1148,-0.1483,0.1184,0.2937,-0.1298,-0.4953,0.0491,0.4007,0.1155,0.3095,0.1927,0,0],[0.2425,0.2913,0.1897,-0.0325,-0.0899,0.1112,-0.066,-0.3543,0.3488,-0.3648,0.1374,-1.1646,0.1003,-0.167,-0.0967,0.5078,0.1869,0.3456,-0.2611,-0.133,-0.3536,0.0688,0.4143,0.4893,-0.2681,0.4649,0.1857,0.0204,0.0359,0.4509,-0.0366,-0.1889,-0.0679,0.0087,0.4733,0.2597,0.1265,-0.3734,-0.1807,0.0521,-0.2709,-0.039,0,0],[0.2148,-0.8168,0.2005,-0.1031,-0.2451,-0.028,-0.0219,0.2644,0.443,-0.3674,0.4424,-0.124,-0.6789,0.6516,-0.1136,0.2181,0.4877,0.2625,0.2946,0.1789,-0.1998,-0.0361,-0.346,-0.2723,-0.2159,0.1655,-0.185,0.1141,0.2154,0.5314,0.5527,0.0719,-0.1772,-0.361,0.1885,-0.4636,-0.1567,0.0358,-0.1033,-0.3212,-0.2934,0.0627,0,0],[0.6422,-0.0219,0.422,0.025,0.3828,-0.5853,-0.539,0.0099,-0.5484,-0.1902,-0.0804,0.1078,0.1681,-0.6129,-0.351,0.16,-0.2564,-0.3669,0.1577,0.1355,0.4011,-0.0785,-0.443,-0.5775,-0.2908,0.3729,0.0602,0.0449,-0.1912,-0.0694,-0.2201,0.0852,0.1965,-0.0983,0.3523,-0.566,0.1041,0.0334,-0.1792,-0.292,0.235,0.4114,0,0],[0.0956,-0.523,0.3615,0.0833,-0.0039,1.0047,0.1975,0.4233,0.106,0.194,-0.1926,0.0781,0.1336,0.4294,-0.1015,-0.212,-0.2072,-0.358,-0.1588,0.4363,0.1595,0.2303,0.4108,0.6819,0.0747,0.8886,-0.3483,0.2148,0.2602,-0.6385,-0.0064,-0.1098,0.0207,0.1713,0.391,-0.4839,0.0438,-0.0653,0.0975,-0.1443,0.1672,-0.0418,0,0],[-0.2152,0.5077,0.0093,-0.0069,-0.0765,-0.3482,0.9688,0.6266,0.4048,0.2166,0.0659,0.0667,0.1747,0.2809,-0.2218,0.1647,-0.0932,0.0306,0.0002,0.07,-0.4759,0.2695,0.3132,-0.0556,-0.2142,-0.0841,0.2825,-0.297,0.371,-0.0731,-0.173,-0.0437,-0.1058,0.2006,0.1535,0.0596,-0.6583,0.1121,-0.064,0.1622,0.2127,-0.3242,0,0],[0.1585,0.1859,-0.0485,0.0113,0.0182,0.0051,0.1673,0.0138,-0.2253,-0.0601,-0.2529,0.1041,-0.1029,0.2514,-0.4386,0.0671,0.0874,-0.1124,-0.122,-1.0126,-0.1069,-0.0202,0.1811,0.3256,0.2494,0.2445,-0.0393,0.1029,0.2832,-0.1024,0.1934,-0.1898,0.0414,0.1095,0.1611,-0.1601,-0.1971,0.021,0.1077,0.0177,0.1551,-0.0948,0,-0.0002],[-0.2216,-0.0984,-0.2466,-0.0088,0.1936,0.0991,0.1393,0.3745,0.4489,-0.2203,0.283,-0.1614,-0.4175,1.272,0.0231,-0.0884,-0.0717,-0.107,-0.287,-0.174,-0.0154,-0.2747,0.928,0.1009,-0.3184,-0.0395,0.1781,0.0939,-0.0447,-0.383,-0.6611,0.1143,0.1883,0.2832,0.2517,0.4097,0.2356,-0.2181,-0.3016,-0.0594,0.0953,-0.1062,0,0],[0.2421,0.0913,0.0244,-0.0416,-0.006,0.1891,-0.0608,0.0696,-0.3651,-0.4591,-0.1336,-0.9324,-0.2959,-0.3246,0.0563,0.0003,0.216,0.1524,0.168,-0.0023,0.0956,-0.2309,-0.7516,-0.6182,0.5299,0.3789,-0.2097,-0.0194,0.1021,-0.1946,-0.0553,0.1797,-0.1289,-0.1579,-0.0897,0.148,-0.2749,0.2192,0.0879,0.2284,-0.1024,0.1402,0,0.0001],[-0.0494,0.2975,0.0867,-0.0012,0.0397,0.4465,-1.1065,-1.3395,0.2049,-0.0749,0.2106,0.2394,-0.1297,0.0899,-0.3488,-0.2568,0.3345,0.1468,0.001,0.1561,0.1517,-0.1116,-0.2713,-0.3821,0.012,0.2845,-0.0523,-0.0374,-0.2168,-0.0041,-0.1945,-0.3245,-0.1757,0.2872,0.0002,-0.0399,0.0811,-0.1067,0.3566,0.0302,-0.1193,0.342,0,0]],"b1":[0.9296,-1.0507,0.0558,2.864,0.8018,3.0619,0.4313,0.7975,-0.9011,-0.6323,-0.4858,0.2645,0.8787,-0.8876,0.8684,0.0062],"w2":[-1.3083,-0.6789,-0.7562,0,-0.78,0,-0.8475,0.8085,-1.0111,-0.9777,0.9024,0.8846,0.5055,0.8834,-0.6264,-0.7513],"b2":0,"meta":{"games":10000,"positions":322980,"logloss":1.0764,"uniform":1.3429,"top1":0.548,"etrata":{"n":60738,"logloss":0.6363,"oldLogloss":0.6604,"brier":0.2242,"oldBrier":0.2351}}}; /*VALUE-END*/
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
