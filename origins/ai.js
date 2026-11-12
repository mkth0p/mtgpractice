/* Origins TCG bots.
   greedy  builds its plan one action at a time. Every candidate is tried on a copy of the game (the round, then two
           more combats with nothing new played) and scored with evaluate(). The opponent is assumed to add nothing
           this round. About 10 ms per game, so it screens large numbers of decks.
   reply   the same construction, but every candidate is scored against what the opponent may do: the opponent's
           hand is dealt several times from the cards not seen yet and an opponent bot plans in each of those worlds.
           This is the bot used for the results on the site (see PRESET in tools/origins/lib.js).
   deep    takes its best few different plans and plays each one forward for a few rounds against sampled replies.
           Slower, and it loses to reply, so it is only kept for comparison. */
(function (root) {
  const E = (typeof module !== 'undefined' && module.exports) ? require('./engine.js') : root.OT.engine;
  const { CARDS, clone, nextSeed, cost, power, hp, units, startRound, resolveRound, phantomRound, canMove } = E;

  // Evaluation weights, in "points of barrier health" (a1 = 1 is the unit). Start values; tools/origins/tune.js
  // replaces them with the self-play result.
  const W0 = {
    a1: 1, a2: 0.8, a3: 0.3,     // my three barriers, lowest first, while I can still afford one break
    c1: 1, c2: 0.35, c3: 0.15,   // the same once one barrier has broken
    notch: 12,                   // having a break in reserve
    pw: 1.2,       // unit power
    hpv: 0.5,      // unit remaining health
    body: 0.3,     // flat value per unit (a body that can block)
    hand: 1,       // a card in hand
    handCost: 0.4, // extra per mana of that card's cost (up to 6)
    tools: 2.5,    // Van Helsing's Tools in hand
    perm: 4, book: 5, next: 1,
    shield: 1.5, dt: 2, snipe: 1.5, dbl: 0.8, reb: 1.5, tr: 0.6, stun: 0.5,
    eng: 0.7,      // multiplier on the table of ongoing engines
    look: 0.8,     // weight of the position after one more combat with nothing new played
    look2: 0.4,    // and after a second one
    lethal: 25,    // bonus when those extra combats alone would win
    deck: 0.3,
    moves: 0.6,    // Dorothy decks: every move made this game (she gets +1/+1 for each, wherever she is)
  };

  const ENGINE = { 'van-helsing': 10, 'big-bad-wolf': 3, 'ali-baba': 3, 'shahrazad': 2, 'merlin': 6, 'queen-of-the-night': 3, 'sorcerers-apprentice': 3, 'glinda': 3,
    'king-shahryar': 2, 'koschei': 2, 'golden-egg': 6, 'baby-bear': 4, 'papa-bear': 3, 'three-blind-mice': 2, 'humpty': 2, 'beast': 2, 'beauty': 3, 'sandman': 2, 'dr-frank': 6,
    'queen-of-hearts': 3, 'mulan': 3, 'lancelot': 2, 'old-macdonald': 1, 'brides-of-dracula': 1, 'impundulu': 3, 'phuong-hoang': 2, 'jill': 1, 'puck': 1, 'boitata': 2 };

  // How safe a player is: every barrier counts, the weakest ones most.
  function life(P, W) {
    W = W || W0;
    let x = P.barrier[0], y = P.barrier[1], z = P.barrier[2], t;
    if (x > y) { t = x; x = y; y = t; }
    if (y > z) { t = y; y = z; z = t; }
    if (x > y) { t = x; x = y; y = t; }
    return P.notches >= 2 ? W.a1 * x + W.a2 * y + W.a3 * z + W.notch * 2 : W.c1 * x + W.c2 * y + W.c3 * z + W.notch;
  }
  function unitValue(G, u, W) {
    const pw = power(G, u);
    let v = W.body + pw * W.pw + hp(u) * W.hpv;
    if (u.shield) v += W.shield;
    if (!u.sil) {
      const k = u.kw;
      if (k.deathtouch) v += W.dt;
      if (k.snipe) v += k.snipe * W.snipe;
      if (k.double) v += pw * W.dbl;
      if (k.rebirth && !u.reb) v += W.reb;
      if (k.trample) v += W.tr;
      const e = ENGINE[u.id]; if (e) v += e * W.eng;
    }
    if (u.stun) v -= pw * W.stun;
    return v > 0 ? v : 0;
  }
  function sideValue(G, p, W) {
    const P = G.P[p];
    let s = life(P, W);
    const B = G.board[p];
    for (let l = 0; l < 3; l++) for (let i = 0; i < 3; i++) { const u = B[l][i]; if (u && !u.dead) s += unitValue(G, u, W); }
    const cap = Math.min(6, G.round + 2 + P.perm);   // a card is worth no more than the mana there will be to play it
    for (const c of P.hand) {
      if (c.tmp != null) continue;
      if (c.id === 'van-helsings-tools') s += W.tools;
      else s += W.hand + W.handCost * Math.min(cap, CARDS[c.id].cost);
    }
    s += W.perm * P.perm + W.next * P.bonusNext + W.book * P.spellbook + W.deck * Math.min(P.deck.length, 6);
    if (P.legend === 'dorothy') s += W.moves * P.moves;
    return s;
  }
  const WIN = 1e4;
  function evaluate(G, p, W) {
    W = W || W0;
    if (G.over) return G.winner === p ? WIN : (G.winner === -1 ? 0 : -WIN);
    return sideValue(G, p, W) - sideValue(G, 1 - p, W);
  }

  // Spaces player p can still use, given the plan so far. `taken` holds the spaces the plan fills, and -1 - space
  // for a space that a planned move leaves: moves happen before cards are put down, so it is free the same round.
  function freeSpaces(G, p, taken) {
    const out = [];
    for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const i = l * 3 + s; if (!taken.has(i) && (!G.board[p][l][s] || taken.has(-1 - i))) out.push([l, s]); }
    return out;
  }

  // Candidate single actions for player p with `mana` left, skipping hand cards and spaces already used by the plan.
  function candidates(G, p, mana, used, taken) {
    const out = [];
    const P = G.P[p];
    const me = units(G, p), op = units(G, 1 - p);
    const free = freeSpaces(G, p, taken);
    const seenCard = new Set();
    for (const c of P.hand) {
      if (used.has(c.hid)) continue;
      const k = cost(G, p, c);
      if (k > mana) continue;
      const key = c.id + ':' + c.bp + ':' + c.bh + ':' + k;
      if (seenCard.has(key)) continue;
      seenCard.add(key);
      const C = CARDS[c.id];
      const A = (x) => { x.hid = c.hid; x.cost = k; x.id = c.id; out.push(x); };
      if (!C.spell) {
        for (const [l, s] of free) {
          switch (c.id) {
            case 'frog-prince': case 'magic-carpet': A({ lane: l, slot: s, mode: 0 }); A({ lane: l, slot: s, mode: 1 }); break;
            case 'flying-monkey': A({ lane: l, slot: s }); for (const e of op) if (e.lane !== l) A({ lane: l, slot: s, tgt: e.uid }); break;
            case 'fairy-godmother': if (!me.length) A({ lane: l, slot: s }); for (const m of me) A({ lane: l, slot: s, tgt: m.uid }); break;
            case 'white-queen': case 'captain-ahab': A({ lane: l, slot: s }); for (const e of op) A({ lane: l, slot: s, tgt: e.uid }); break;
            default: A({ lane: l, slot: s });
          }
        }
        continue;
      }
      switch (c.id) {
        case 'bullseye': case 'axe-throw': case 'dark-omen': case 'underworld-flare': case 'searing-light': case 'freeze': case 'stroke-of-midnight':
          for (const e of op) A({ tgt: e.uid }); break;
        case 'lightning-strike': case 'obliterate':
          for (const e of op) A({ tgt: e.uid }); for (let l = 0; l < 3; l++) A({ lane2: l }); break;
        case 'van-helsings-tools':
          for (const e of op) for (let m = 0; m < 4; m++) A({ tgt: e.uid, mode: m });
          for (let l = 0; l < 3; l++) A({ mode: 1, lane2: l });
          break;
        case 'defense-matrix': case 'poison-apple': case 'trash-for-treasure': case 'blow-the-house-down': case 'off-with-your-head':
          for (const m of me) A({ tgt: m.uid }); break;
        case 'first-aid':
          for (const m of me) if (m.dmg > 0) A({ tgt: m.uid }); for (let l = 0; l < 3; l++) if (P.barrier[l] < P.bmax[l]) A({ lane2: l }); break;
        case 'twister-toss':
          for (const m of me) {
            for (const [l, s] of free) A({ tgt: m.uid, lane2: l, slot2: s });
            for (const m2 of me) if (m2.uid > m.uid) A({ tgt: m.uid, lane2: m2.lane, slot2: m2.slot });   // swap two allies
          }
          break;
        case 'en-passant':
          for (const m of me) { if (G.board[1 - p][m.lane][m.slot]) A({ tgt: m.uid }); for (const [l, s] of free) if (G.board[1 - p][l][s]) A({ tgt: m.uid, lane2: l, slot2: s }); }
          break;
        case 'animate-object': for (const [l, s] of free) A({ lane2: l, slot2: s }); break;
        default: A({});
      }
    }
    // Merlin's Prophecy does nothing alone, so it is also offered together with each spell it could repeat.
    const pro = P.hand.find((c) => c.id === 'merlins-prophecy' && !used.has(c.hid));
    if (pro) {
      const kp = cost(G, p, pro);
      const n = out.length;
      for (let i = 0; i < n; i++) {
        const x = out[i];
        if (x.id === 'merlins-prophecy' || !CARDS[x.id].spell || x.hid === pro.hid || kp + x.cost > mana) continue;
        out.push({ hid: pro.hid, id: pro.id, cost: kp + x.cost, then: x });
      }
    }
    for (const u of me) {
      if (!canMove(G, u) || used.has('m' + u.uid)) continue;
      const from = u.lane * 3 + u.slot;
      for (const [l, s] of free) if (l * 3 + s !== from) out.push({ move: u.uid, lane: l, slot: s, from, cost: 0 });
    }
    return out;
  }

  // Score of a plan: play the round on a copy, look at the result, then let the boards fight twice more with nothing
  // new played. The three snapshots are averaged with the weights 1, look and look2.
  function score(G, p, plan, oppPlan, seed, W) {
    const H = clone(G, seed);
    const plans = [null, null]; plans[p] = plan; plans[1 - p] = oppPlan || [];
    resolveRound(H, plans);
    return lookAhead(H, p, W);
  }
  // Value of a position at the end of a round (H is used up).
  function lookAhead(H, p, W) {
    const s0 = evaluate(H, p, W);
    if (H.over) return s0;
    let tot = s0, wt = 1, last = s0;
    for (let k = 0; k < 2; k++) {
      const w = k ? W.look2 : W.look;
      if (!(w > 0)) break;
      if (!H.over) { phantomRound(H); last = H.over ? last + (H.winner === p ? W.lethal : (H.winner === -1 ? 0 : -W.lethal)) : evaluate(H, p, W); }
      tot += w * last; wt += w;
    }
    return tot / wt;
  }

  // Adds a chosen candidate (one action, or two for a pair) to the plan and books its mana, card and space.
  function commit(plan, c, used, taken) {
    for (let a = c; a; a = a.then) {
      plan.push(a);
      if (a.hid != null) used.add(a.hid);
      if (a.move != null) { used.add('m' + a.move); taken.add(-1 - a.from); }
      if (a.lane != null && a.slot != null) taken.add(a.lane * 3 + a.slot);
      if (a.lane2 != null && a.slot2 != null) taken.add(a.lane2 * 3 + a.slot2);
    }
    return c.cost;
  }
  const withCand = (plan, c) => (c.then ? plan.concat([c, c.then]) : plan.concat([c]));

  // A copy in which the planner's own deck is reshuffled, so trying out a draw never shows the real next card.
  function fairCopy(G, p, seed) {
    const H = clone(G, seed);
    const d = H.P[p].deck;
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(H.rng() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
    return H;
  }

  function greedyPlan(G0, p, opt) {
    opt = opt || {};
    const W = opt.W || W0;
    const seed = opt.seed != null ? opt.seed : nextSeed(G0);
    const G = opt.fair === false ? G0 : fairCopy(G0, p, seed);
    const plan = [];
    let mana = G.P[p].mana;
    const used = new Set(), taken = new Set();
    let base = score(G, p, plan, opt.opp, seed, W);
    for (let step = 0; step < 10; step++) {
      let best = null, bestS = -Infinity;
      if (step === 0 && opt.first) { best = opt.first; bestS = score(G, p, withCand(plan, best), opt.opp, seed, W); }
      else {
        const cs = candidates(G, p, mana, used, taken);
        if (!cs.length) break;
        for (const c of cs) {
          const s = score(G, p, withCand(plan, c), opt.opp, seed, W);
          if (s > bestS) { bestS = s; best = c; }
        }
        if (!best || bestS <= base + 0.01) break;
      }
      base = bestS;
      mana -= commit(plan, best, used, taken);
    }
    plan.value = base;
    return plan;
  }

  // ---- deep bot
  // A world the planner cannot tell apart from the real one: the opponent's hand is re-dealt from their unseen cards
  // and both decks are reshuffled.
  function determinize(G, p) {
    const H = clone(G);
    const O = H.P[1 - p];
    const fixed = O.hand.filter((c) => c.tmp != null || CARDS[c.id].token);
    const pool = O.hand.filter((c) => !(c.tmp != null || CARDS[c.id].token)).concat(O.deck);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(H.rng() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    const n = O.hand.length - fixed.length;
    O.hand = fixed.concat(pool.slice(0, n).map(E.copyCard));
    O.deck = pool.slice(n);
    const d = H.P[p].deck;
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(H.rng() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
    return H;
  }

  const planKey = (pl) => pl.map((a) => (a.move != null ? 'm' + a.move : a.id) + ':' + (a.lane != null ? a.lane : '') + (a.slot != null ? a.slot : '') + ':' + (a.tgt != null ? a.tgt : '') + ':' + (a.mode != null ? a.mode : '') + ':' + (a.lane2 != null ? a.lane2 : '') + (a.slot2 != null ? a.slot2 : '')).join('|');

  // The greedy plan plus the best different plans that start with another first action.
  function planVariants(G, p, k, W, seed) {
    const g = greedyPlan(G, p, { W, seed });
    const plans = [g];
    const seen = new Set([planKey(g)]);
    const firsts = candidates(G, p, G.P[p].mana, new Set(), new Set());
    const scored = firsts.map((c) => [score(G, p, withCand([], c), null, seed, W), c]).sort((a, b) => b[0] - a[0]);
    const firstSeen = new Set();
    for (const [, c] of scored) {
      if (plans.length >= k) break;
      const fk = (c.move != null ? 'm' + c.move : c.id) + ':' + (c.lane != null ? c.lane : c.tgt);
      if (firstSeen.has(fk)) continue; firstSeen.add(fk);
      const pl = greedyPlan(G, p, { W, seed, first: c });
      const key = planKey(pl);
      if (!seen.has(key)) { seen.add(key); plans.push(pl); }
    }
    if (!seen.has('')) plans.push([]);
    return plans;
  }

  function deepPlan(G, p, opt) {
    opt = opt || {};
    const W = opt.W || W0;
    const K = opt.k || 5, S = opt.samples || 3, R = opt.rounds == null ? 2 : opt.rounds;
    const seed = nextSeed(G);
    const mine = planVariants(G, p, K, W, seed);
    if (mine.length <= 1) return mine[0];
    const tot = new Array(mine.length).fill(0);
    for (let s = 0; s < S; s++) {
      const H = determinize(G, p);
      const opp = greedyPlan(H, 1 - p, { W, fair: false });
      const sd = nextSeed(H);
      for (let i = 0; i < mine.length; i++) {
        const X = clone(H, sd);
        const plans = [null, null]; plans[p] = mine[i]; plans[1 - p] = opp;
        resolveRound(X, plans);
        for (let r = 0; r < R && !X.over; r++) {
          startRound(X);
          if (X.over) break;
          resolveRound(X, [greedyPlan(X, 0, { W, fair: false }), greedyPlan(X, 1, { W, fair: false })]);
        }
        let v = opt.leaf === 'static' ? evaluate(X, p, W) : lookAhead(X, p, W);
        if (v > 150) v = 150; else if (v < -150) v = -150;
        tot[i] += v;
      }
    }
    let bi = 0; for (let i = 1; i < mine.length; i++) if (tot[i] > tot[bi] + 1e-9) bi = i;
    return mine[bi];
  }

  // ---- reply bot: greedy construction, but every candidate is scored against what the opponent is likely to do.
  // The opponent's hand is dealt S times from the cards not seen yet; in each of those worlds a greedy opponent picks
  // its plan (it cannot see ours: both plan at the same time). A candidate's score is its average over the S worlds.
  function sampleWorlds(G, p, S, W, oppBot, every) {
    const worlds = [];
    for (let s = 0; s < S; s++) {
      const H = determinize(G, p);
      const opp = oppBot && (!every || s % every === every - 1) ? oppBot(H, 1 - p) : greedyPlan(H, 1 - p, { W, fair: false });
      worlds.push({ H, opp, seed: nextSeed(H) });
    }
    return worlds;
  }
  function valueVs(worlds, p, plan, W) {
    let t = 0;
    for (let i = 0; i < worlds.length; i++) { const w = worlds[i]; let v = score(w.H, p, plan, w.opp, w.seed, W); if (v > 150) v = 150; else if (v < -150) v = -150; t += v; }
    return t / worlds.length;
  }
  function buildVs(G, p, worlds, W, first) {
    const plan = [];
    let mana = G.P[p].mana;
    const used = new Set(), taken = new Set();
    let base = valueVs(worlds, p, plan, W);
    for (let step = 0; step < 10; step++) {
      let best = null, bestS = -Infinity;
      if (step === 0 && first) { best = first; bestS = valueVs(worlds, p, withCand(plan, best), W); }
      else {
        const cs = candidates(G, p, mana, used, taken);
        if (!cs.length) break;
        for (const c of cs) { const v = valueVs(worlds, p, withCand(plan, c), W); if (v > bestS) { bestS = v; best = c; } }
        if (!best || bestS <= base + 0.01) break;
      }
      base = bestS;
      mana -= commit(plan, best, used, taken);
    }
    plan.value = base;
    return plan;
  }
  function replyPlan(G, p, opt) {
    opt = opt || {};
    const W = opt.W || W0;
    // level 2: the opponent in each sampled world is itself a reply bot (one sample) instead of a greedy one
    // mix: only every second world gets the smarter opponent, the others keep the greedy one
    const oppBot = opt.level === 2 || opt.mix ? (H, q) => replyPlan(H, q, { W, samples: opt.oppSamples || 1 }) : null;
    const worlds = sampleWorlds(G, p, opt.samples || 3, W, oppBot, opt.mix ? 2 : 0);
    return buildVs(G, p, worlds, W);
  }

  function randomPlan(G, p) {
    const out = []; let mana = G.P[p].mana; const used = new Set(), taken = new Set();
    for (let i = 0; i < 6; i++) {
      const cs = candidates(G, p, mana, used, taken); if (!cs.length || G.rng() < 0.15) break;
      const c = cs[Math.floor(G.rng() * cs.length)]; mana -= commit(out, c, used, taken);
    }
    return out;
  }

  const bots = {
    greedy: { name: 'Greedy', plan: (G, p) => greedyPlan(G, p) },
    random: { name: 'Random', plan: randomPlan },
    deep: { name: 'Deep', plan: (G, p) => deepPlan(G, p) },
    greedyW: (W, keep) => ({ name: 'Greedy*', plan: (G, p) => greedyPlan(G, p, { W }), keep }),
    deepW: (opt, keep) => ({ name: 'Deep*', plan: (G, p) => deepPlan(G, p, opt), keep }),
    replyW: (opt, keep) => ({ name: 'Reply*', plan: (G, p) => replyPlan(G, p, opt), keep }),
  };

  // Named bots. fast: greedy (the opponent is assumed to add nothing). std: plans against sampled replies, half of
  // them from a greedy opponent and half from an opponent that itself expects a reply. strong: more samples.
  const PRESET = {
    fast: { type: 'greedy' },
    std: { type: 'reply', opt: { samples: 2, mix: true } },
    strong: { type: 'reply', opt: { samples: 8, mix: true } },
  };
  // spec: a preset name or { type: 'greedy' | 'reply' | 'deep' | 'random', W: {weight overrides}, opt: {...} }
  function mkBot(spec) {
    if (typeof spec === 'string') spec = PRESET[spec];
    spec = spec || {};
    if (spec.type === 'random') return bots.random;
    const W = Object.assign({}, W0, spec.W || {});
    if (spec.type === 'deep') return bots.deepW(Object.assign({ W }, spec.opt || {}));
    if (spec.type === 'reply') return bots.replyW(Object.assign({ W }, spec.opt || {}));
    return bots.greedyW(W);
  }

  const API = { W0, ENGINE, PRESET, mkBot, evaluate, life, candidates, score, greedyPlan, deepPlan, replyPlan, sampleWorlds, buildVs, valueVs, planVariants, determinize, bots };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else (root.OT = root.OT || {}).ai = API;
})(typeof self !== 'undefined' ? self : this);
