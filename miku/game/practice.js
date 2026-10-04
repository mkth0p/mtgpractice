/* Practice mode: records every choice a person makes in a game, replays the game exactly from its
   seed and those choices, and asks "what if?" at any of them.

   - A game is deterministic: one seed drives every shuffle and every bot's dice, and the person's
     answers are the only other input. So a record is { seed, seats, answers } plus snapshots of the
     moments worth reviewing, and replaying it rebuilds the same game, card for card.
   - Object ids are global, so answers store ids relative to the game's first id (g.idBase).
   - While a person is thinking, the screen's helpers (the coach, "pick for me") run against a
     scratch random number generator, so nothing they do moves the game's dice.
   - Counterfactual rollouts: replay to a moment, play an alternative there, reshuffle every library
     (nobody knew the order), then let bots finish the game or play a few rounds, and score the end
     position with the deck's win-probability model. The same reshuffle seeds are used for every
     alternative, so the differences between them aren't luck of the draw.

   Runs in the page, in a Web Worker (practice-worker.js) and in Node (tools/sim). A deck plugs in
   through MK.TRAIN[deckId]: { features(g, p), winProb(features), snap(g, p), ... }. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const P = MK.Practice = MK.Practice || {};
  const KINDS = ["mulligan", "main", "attack", "block", "respond", "choose"];
  const KCODE = { mulligan: "m", main: "a", attack: "t", block: "b", respond: "r", choose: "c" };
  P.KINDS = KINDS;
  P.VERSION = 1;

  /* ------------------------------------------------------------ answers to and from JSON */
  const isPlayer = x => x && typeof x === "object" && x.pool !== undefined && x.library !== undefined && typeof x.idx === "number";
  const isObj = x => x && typeof x === "object" && x.def && typeof x.id === "number" && "zone" in x;
  const isItem = x => x && typeof x === "object" && (x.kind === "spell" || x.kind === "ability" || x.kind === "trigger") && x.id != null && "p" in x;
  function ser(g, v, depth) {
    depth = depth || 0;
    if (v == null || typeof v !== "object") return v === undefined ? null : v;
    if (depth > 6) return null;
    if (isPlayer(v)) return { $p: v.idx };
    if (isObj(v)) return { $o: v.id - g.idBase };
    if (isItem(v)) return { $i: typeof v.id === "number" ? v.id : String(v.id) };
    if (Array.isArray(v)) return v.map(x => ser(g, x, depth + 1));
    const out = {};
    for (const k of Object.keys(v)) {
      const x = v[k];
      if (typeof x === "function") continue;
      // the screen's own helpers (ab: the ability object) are rebuilt from idx on the way back
      if (k === "ab" || k === "run" || k === "label") continue;
      out[k] = ser(g, x, depth + 1);
    }
    return out;
  }
  // objects a question offers can be in no zone at all (Lim-Dûl's Vault lifts five cards out of the
  // library before it asks), so the question's own objects are looked at first
  function poolOf(g, ctx) {
    const m = new Map();
    const walk = (x, d) => {
      if (!x || typeof x !== "object" || d > 3) return;
      if (isObj(x)) { m.set(x.id, x); return; }
      if (isPlayer(x) || isItem(x)) return;
      if (Array.isArray(x)) { for (const y of x) walk(y, d + 1); return; }
      for (const k of ["options", "cards", "targets", "card", "choices"]) if (x[k]) walk(x[k], d + 1);
      if (d && x.obj) walk(x.obj, d + 1);
    };
    walk(ctx, 0);
    return m;
  }
  function de(g, v, pool) {
    if (v == null || typeof v !== "object") return v;
    if (Array.isArray(v)) return v.map(x => de(g, x, pool));
    if ("$p" in v) return g.players[v.$p];
    if ("$o" in v) { const id = v.$o + g.idBase; return (pool && pool.get(id)) || g.findAny(id); }
    if ("$i" in v) return g.stack.find(it => it.id === v.$i) || null;
    const out = {};
    for (const k of Object.keys(v)) out[k] = de(g, v[k], pool);
    return out;
  }
  P.ser = ser; P.de = de;
  // distribute answers are { [object id]: n }: keyed by absolute id
  function serAnswer(g, kind, req, a) {
    if (kind === "choose" && req && req.type === "distribute" && a && typeof a === "object") {
      const out = {};
      for (const k of Object.keys(a)) out["r" + (+k - g.idBase)] = a[k];
      return { $dist: out };
    }
    return ser(g, a);
  }
  function deAnswer(g, v, ctx) {
    if (v && typeof v === "object" && v.$dist) {
      const out = {};
      for (const k of Object.keys(v.$dist)) out[+k.slice(1) + g.idBase] = v.$dist[k];
      return out;
    }
    return de(g, v, ctx ? poolOf(g, ctx) : null);
  }
  P.serAnswer = serAnswer; P.deAnswer = deAnswer;

  /* ------------------------------------------------------------ words for an answer */
  const nm = o => o && o.def ? (o.faceDown ? "a face-down card" : o.def.name) : "";
  const cardName = o => o && (o.cardDef || o.def) ? (o.cardDef || o.def).name : "";
  function sayAction(g, p, a) {
    if (!a) return "Pass";
    if (a.type === "pass") return a.skipCombat ? "End the turn" : "Pass";
    const c = a.card;
    const n = c ? cardName(c) : "";
    if (a.type === "land") return `Play ${n}`;
    if (a.type === "cast") return a.faceDown ? `Cast ${n} face down` : `Cast ${n}`;
    if (a.type === "activate") {
      const ab = c && c.def && c.def.abilities ? c.def.abilities[a.idx] : null;
      const lab = ab && ab.label ? ab.label : "ability";
      return `${c && c.faceDown && c.controller === p ? "Face-down " + n : nm(c)}: ${lab}${a.repeat > 1 ? ` ×${a.repeat}` : ""}`;
    }
    if (a.type === "faceUp") return `Turn ${n} face up`;
    if (a.type === "channel") return `Channel ${n}`;
    if (a.type === "cycle") return `Cycle ${n}`;
    return a.type + (n ? " " + n : "");
  }
  function sayAnswer(g, p, kind, ctx, a) {
    if (kind === "mulligan") return a ? "Keep" : "Mulligan";
    if (kind === "main" || kind === "respond") return sayAction(g, p, a);
    if (kind === "attack") {
      if (!a || !a.length) return "No attack";
      const by = new Map();
      for (const d of a) { const t = d.target; const k = t ? (t.name || nm(t)) : "?"; by.set(k, (by.get(k) || []).concat(nm(d.attacker))); }
      return [...by].map(([k, list]) => `${list.join(", ")} → ${k}`).join("; ");
    }
    if (kind === "block") {
      if (!a || !a.length) return "No blocks";
      return a.map(b => `${nm(b.blocker)} blocks ${nm(b.attacker)}`).join("; ");
    }
    if (kind === "choose") {
      if (a == null) return "None";
      if (typeof a === "boolean") return a ? "Yes" : "No";
      if (typeof a === "number") return String(a);
      if (Array.isArray(a)) return a.length ? a.map(x => isPlayer(x) ? x.name : isItem(x) ? x.name : nm(x)).join(", ") : "None";
      if (isPlayer(a)) return a.name;
      if (isItem(a)) return a.name;
      if (isObj(a)) return nm(a);
      if (ctx && ctx.options) { const o = ctx.options.find(x => x && x.id === a); if (o) return o.label; }
      return String(a);
    }
    return "";
  }
  P.sayAction = sayAction; P.sayAnswer = sayAnswer;

  /* ------------------------------------------------------------ the recorder (in the page) */
  /* Wraps the person's agent. Every answer is stored for the replay; the moments worth reviewing
     also get a snapshot (`moments`) with what the deck's coach saw and the win-probability features. */
  P.record = function (agent, opts) {
    opts = opts || {};
    const rec = opts.rec;
    const T = (MK.TRAIN || {})[rec.deck] || null;
    const out = {};
    for (const k of KINDS) {
      if (!agent[k]) continue;
      out[k] = async function (g, p, ctx) {
        const i = rec.answers.length;
        const seq0 = MK.objSeq ? MK.objSeq.get() : null;
        // neither the snapshot's planner nor the screen's helpers may move the game's dice while the
        // person thinks: the replay has neither
        const dice = g.random;
        g.random = MK.rng(0x51ed ^ i);
        let snap = null, a, t0 = Date.now();
        try {
          try { snap = P.meaningful(g, p, k, ctx) ? P.snapshot(g, p, k, ctx, T) : null; } catch (e) { snap = null; if (root.console) console.error("[practice] snapshot", e); }
          t0 = Date.now();
          a = await agent[k](g, p, ctx);
        } finally { g.random = dice; }
        // the planner and the screen may make scratch objects while the person thinks; the replay
        // doesn't, so rewind the id counter unless one of those objects is really in this game
        if (seq0 != null) {
          const seq1 = MK.objSeq.get();
          let kept = false;
          for (let id = seq0 + 1; id <= seq1 && !kept; id++) if (g.findAny(id)) kept = true;
          if (!kept) MK.objSeq.set(seq0);
        }
        rec.answers.push(serAnswer(g, k, ctx, a));
        rec.kinds += KCODE[k];
        if (snap) {
          snap.i = i;
          snap.ms = Date.now() - t0;
          if (opts.replayedUntil && i < opts.replayedUntil) snap.replayed = true;
          snap.ans = sayAnswer(g, p, k, ctx, a);
          snap.raw = rec.answers[i];
          try { if (T && T.after) T.after(g, p, k, ctx, a, snap); } catch (e) { /* the review is best effort */ }
          rec.moments.push(snap);
        }
        return a;
      };
    }
    return out;
  };
  /* Which questions are worth a snapshot: a real choice, not an automatic pass. */
  P.meaningful = function (g, p, k, ctx) {
    if (k === "mulligan") return true;
    if (k === "main") return g.legalActions(p).length > 0;
    if (k === "attack") return (ctx.candidates || []).length > 0;
    if (k === "block") return (ctx.attackers || []).some(a => a.combat && g.defenderOf && g.defenderOf(a.combat.attacking) === p) && g.creatures(p).some(b => (ctx.attackers || []).some(a => g.canBlock(b, a)));
    if (k === "respond") return (ctx.actions || []).some(a => a.type === "cast") && ctx.window !== "trigger";
    if (k === "choose") return !!(ctx && ctx.options && ctx.options.length > 1) && !(ctx.spec && ctx.spec.trigger) && ctx.purpose !== "manaColor";
    return false;
  };
  P.snapshot = function (g, p, k, ctx, T) {
    const opp = g.players.filter(q => q !== p);
    const s = {
      k, t: g.turn, r: g.round, ph: g.phase, mine: g.active === p, act: g.active.idx,
      life: g.players.map(q => q.lost ? 0 : q.life),
      hand: p.hand.map(o => o.def.name),
      bf: g.controlled(p).map(o => o.faceDown ? (o.owner === p ? "↓" + o.cardDef.name : "↓?") : o.def.name),
      opp: opp.map(q => ({ i: q.idx, n: q.name, lost: q.lost, life: q.life, hand: q.hand.length, cr: g.creatures(q).length, pw: g.creatures(q).reduce((a, c) => a + Math.max(0, g.power(c)), 0), lands: g.controlled(q, o => g.isLand(o)).length, open: g.controlled(q, o => g.isLand(o) && !o.tapped).length, cmd: (q.commanders[0] || {}).def ? q.commanders[0].def.name : "" })),
      lands: g.controlled(p, o => g.isLand(o)).length
    };
    if (k === "main" || k === "respond") s.acts = [...new Set(((k === "main" ? g.legalActions(p) : ctx.actions) || []).map(a => sayAction(g, p, a)))].slice(0, 30);
    if (k === "respond") { s.win = ctx.window; const top = ctx.top; if (top) s.top = { n: top.name, p: top.p ? top.p.idx : -1, k: top.kind, card: top.o && top.o.def ? top.o.def.name : "" }; }
    if (k === "attack") s.cands = (ctx.candidates || []).map(o => nm(o));
    if (k === "block") s.inc = (ctx.attackers || []).filter(a => a.combat && g.defenderOf(a.combat.attacking) === p).map(a => ({ n: nm(a), pw: g.power(a), from: a.controller.idx }));
    if (k === "choose") { s.q = { type: ctx.type, prompt: ctx.prompt, purpose: ctx.purpose, src: ctx.src && ctx.src.def ? ctx.src.def.name : "", n: (ctx.options || []).length, opts: (ctx.options || []).slice(0, 40).map(o => isPlayer(o) ? o.name : isItem(o) ? o.name : isObj(o) ? nm(o) : o && o.label ? o.label : String(o)) }; }
    if (k === "mulligan") { s.mulls = ctx.mulls; s.hand = (ctx.hand || p.hand).map(o => o.def.name); }
    if (T) {
      try { if (T.features) { s.f = T.features(g, p); s.wp = T.winProb ? T.winProb(s.f) : null; } } catch (e) { s.f = null; }
      try { if (T.snap) Object.assign(s, T.snap(g, p, k, ctx)); } catch (e) { /* optional */ }
    }
    return s;
  };

  /* ------------------------------------------------------------ rebuilding a game */
  function deckById(id) {
    for (const d of (MK.HERO_DECKS || []).concat(MK.BOT_DECKS || [])) if (d.id === id) return d;
    if (id === "miku" && MK.MIKU_DECK) return MK.MIKU_DECK;
    return null;
  }
  P.deckById = deckById;
  /* A new record for a game about to start: seats as the table built them. */
  P.newRecord = function (o) {
    return {
      v: P.VERSION, engine: MK.ENGINE_VERSION, id: o.id || ("g" + Date.now().toString(36)), deck: o.deck, mode: o.mode || "assess",
      t: Date.now(), seed: o.seed, first: null, hero: o.hero, maxTurns: o.maxTurns || 160,
      seats: o.seats, answers: [], kinds: "", moments: [], result: null, turns: []
    };
  };
  /* Rebuild the players of a record. agents(i, deck, seat) returns each seat's agent. */
  function buildGame(rec, agents, extra) {
    const players = rec.seats.map((s, i) => {
      const d = deckById(s.deck);
      if (!d) throw new Error("Unknown deck " + s.deck);
      return { name: s.name || d.name, commander: d.commander, list: d.list, identity: d.identity, human: i === rec.hero, agent: agents(i, d, s), deckId: d.id };
    });
    const g = new MK.Game(Object.assign({ seed: rec.seed, players, endOnHumanLoss: true, maxTurns: rec.maxTurns || 160, legacyAttackSort: (rec.engine || 0) < 3 }, extra || {}));
    g.players.forEach((p, i) => { p.deckId = players[i].deckId; });
    // the table picks who goes first with the game's dice right after it's built
    g.activeIdx = g.rand(g.players.length);
    return g;
  }
  P.buildGame = buildGame;
  const botFor = (d, s) => MK.AI.create({ skill: s.skill == null ? 0.9 : s.skill, aggression: s.aggression != null ? s.aggression : (d.aggression == null ? 0.55 : d.aggression), casual: !!s.casual });

  /* Replays a record. Options:
     at: the answer index to stop or branch at (default: play every recorded answer)
     onAt(g, p, kind, ctx): called at that point; return { answer } to branch with that answer
       (its value as the person's agent would return it), or { stop: true } to end the game there
     reseed: a seed for everything after the branch (libraries are reshuffled with it)
     horizon: after the branch, stop once this many more rounds have started
     heroBot: options for the bot that plays the person's seat after the branch
     ui: an object the game reports to ({ log(entry), event(type, ev) }); ui.bind(g) is called first
     After the recorded answers run out, the bot plays the seat (an unfinished game). */
  P.replay = async function (rec, opts) {
    opts = opts || {};
    const at = opts.at == null ? Infinity : opts.at;
    const st = { i: 0, bot: false, branched: false, diverged: false, stopRound: null, pendingShuffle: false, info: null };
    let heroBot = null;
    const hero = rec.hero;
    const guard = (g) => {
      if (st.stopRound != null && g.round >= st.stopRound && !g.over) g.end(null, { horizon: true });
      if (st.pendingShuffle && !g.over) { st.pendingShuffle = false; reshuffle(g); }
    };
    // nobody knew the order of any library, and the person didn't know what the others held:
    // shuffle every library and, with `hidden`, deal each opponent a new hand from their unseen cards
    const reshuffle = (g) => {
      for (const q of g.players) if (!q.lost) g.shuffleArr(q.library);
      if (opts.hidden) P.resampleHands(g, g.players[hero]);
    };
    const fallback = (k, ctx) => k === "mulligan" ? true : k === "main" ? { type: "pass" } : k === "attack" || k === "block" ? [] : k === "respond" ? null : (ctx && ctx.type === "confirm" ? false : ctx && ctx.options && ctx.options.length ? (ctx.type === "cards" || ctx.type === "targets" ? ctx.options.slice(0, ctx.min || 0) : ctx.type === "option" ? ctx.options[0].id : ctx.type === "number" ? ctx.min : ctx.options[0]) : null);
    const g = buildGame(rec, (i, d, s) => {
      if (i !== hero) {
        const b = botFor(d, s);
        if (opts.horizon == null) return b;
        const w = {};
        for (const k of KINDS) w[k] = (g, p, ctx) => { guard(g); return b[k](g, p, ctx); };
        w.bot = true;
        return Object.assign({}, b, w);
      }
      heroBot = MK.AI.create(Object.assign({ skill: 1, aggression: d.aggression == null ? 0.55 : d.aggression }, opts.heroBot || {}));
      const a = {};
      // once the bot takes the seat over it plays like one: the decks' bot-only logic (tutoring for
      // the missing combo piece with the planner) checks agent.bot. Before the branch it must stay a
      // person, or a tutor's search would only offer the bot's pick and the recorded answer.
      Object.defineProperty(a, "bot", { get: () => st.bot, enumerable: true });
      for (const k of KINDS) a[k] = async (g, p, ctx) => {
        guard(g);
        if (g.over) return fallback(k, ctx);
        const i = st.i++;
        if (st.bot) return heroBot[k](g, p, ctx);
        if (i < at && i < rec.answers.length) {
          if (rec.kinds[i] !== KCODE[k]) { st.diverged = { i, want: rec.kinds[i], got: KCODE[k] }; g.end(null, { diverged: true }); return fallback(k, ctx); }
          return deAnswer(g, rec.answers[i], ctx);
        }
        if (i >= rec.answers.length && i < at) { st.bot = true; return heroBot[k](g, p, ctx); }
        // the branch point
        let r = opts.onAt ? await opts.onAt(g, p, k, ctx, { heroBot, i }) : null;
        if (!r || r.stop) { st.info = r && r.info; g.end(null, { stopped: true }); return fallback(k, ctx); }
        st.branched = true; st.bot = true;
        if (opts.reseed != null) {
          g.random = MK.rng(opts.reseed);
          if (k === "choose") st.pendingShuffle = true; else reshuffle(g);
        }
        st.logFrom = g.logs.length ? g.logs[g.logs.length - 1].n + 1 : 0;
        st.branchRound = g.round;
        if (opts.horizon != null) st.stopRound = g.round + opts.horizon;
        return r.answer;
      };
      return a;
    }, opts.ui ? { ui: opts.ui } : null);
    st.g = g;
    if (opts.ui && opts.ui.bind) opts.ui.bind(g);
    try { await g.play(); }
    catch (e) { st.error = String(e && e.message || e); }
    return st;
  };

  /* Deals each opponent of `me` a new hand of the same size from the cards `me` can't see (their
     hand and library together). Commanders in hand stay: everyone saw them go there. */
  P.resampleHands = function (g, me) {
    for (const q of g.players) {
      if (q === me || q.lost || !q.hand.length) continue;
      const keep = q.hand.filter(o => o.isCommander || (o.state && o.state.revealed));
      const back = q.hand.filter(o => !keep.includes(o));
      if (!back.length) continue;
      for (const o of back) { o.zone = "library"; q.library.push(o); }
      g.shuffleArr(q.library);
      q.hand.length = 0;
      for (const o of keep) q.hand.push(o);
      for (let k = 0; k < back.length && q.library.length; k++) { const o = q.library.shift(); o.zone = "hand"; q.hand.push(o); }
    }
  };

  /* The score of a finished or stopped rollout for the seat: 1 win, 0 loss, the model otherwise. */
  P.equity = function (g, p, T) {
    if (g.over) {
      if (g.winner === p) return 1;
      if (p.lost) return 0;
      if (g.endInfo && g.endInfo.draw) return 0.2;
      if (g.winner && g.winner !== p) return 0;
    }
    if (p.lost) return 0;
    if (T && T.features && T.winProb) { try { return T.winProb(T.features(g, p)); } catch (e) { return 0.25; } }
    return 0.25;
  };

  /* Candidate answers at a moment, as the person's agent would return them. */
  P.candidates = async function (g, p, k, ctx, heroBot, mine) {
    const out = [];
    const key = a => JSON.stringify(ser(g, a));
    const add = (label, a, tag) => { const s = key(a); if (out.some(c => c.key === s)) { const c = out.find(c => c.key === s); c.tags.push(tag); return; } out.push({ label, answer: a, key: s, tags: [tag] }); };
    if (mine !== undefined) add(sayAnswer(g, p, k, ctx, mine), mine, "you");
    let b = null;
    try {
      // the bot's own pick, with its dice set aside so the replay that follows isn't moved
      const dice = g.random; g.random = MK.rng(7);
      try { b = await heroBot[k](g, p, ctx); } finally { g.random = dice; }
      add(sayAnswer(g, p, k, ctx, b), b, "bot");
    } catch (e) { /* no bot answer */ }
    if (k === "main") {
      add("Pass", { type: "pass" }, "alt");
      const seen = new Set();
      for (const a of g.legalActions(p)) {
        const lab = sayAction(g, p, a);
        if (seen.has(lab)) continue;
        seen.add(lab);
        add(lab, { type: a.type, card: a.card, idx: a.idx, door: a.door, alt: a.alt, faceDown: a.faceDown, back: a.back }, "alt");
        if (out.length >= 9) break;
      }
    } else if (k === "respond") {
      add("Pass", null, "alt");
      for (const a of (ctx.actions || []).filter(a => a.type === "cast" || a.type === "activate").slice(0, 5)) add(sayAction(g, p, a), { type: a.type, card: a.card, idx: a.idx, alt: a.alt, faceDown: a.faceDown }, "alt");
    } else if (k === "attack") {
      add("No attack", [], "alt");
    } else if (k === "block") {
      add("No blocks", [], "alt");
    } else if (k === "mulligan") {
      add("Keep", true, "alt"); add("Mulligan", false, "alt");
    } else if (k === "choose" && ctx.type === "confirm") {
      add("Yes", true, "alt"); add("No", false, "alt");
    } else if (k === "choose" && (ctx.type === "target" || ctx.type === "player") && ctx.options.length <= 8) {
      for (const o of ctx.options) add(sayAnswer(g, p, k, ctx, o), o, "alt");
    } else if (k === "choose" && ctx.type === "cards" && (ctx.max || 1) === 1 && ctx.options.length > 1) {
      // a tutor: the deck's own best picks
      const T = (MK.TRAIN || {})[p.deckId];
      const picks = T && T.tutorPicks ? T.tutorPicks(g, p, ctx.options) : [];
      for (const o of picks.slice(0, 4)) add(sayAnswer(g, p, k, ctx, [o]), [o], "alt");
    }
    return out;
  };

  /* Analyzes one moment of a record: every candidate is played `n` times with the same reshuffles.
     Returns { i, moment, cands: [{ label, tags, eq, se, n, wins, losses }], best, mine } */
  P.analyzeMoment = async function (rec, i, opts) {
    opts = opts || {};
    const n = opts.n || 20, horizon = opts.horizon == null ? 3 : opts.horizon;
    const T = (MK.TRAIN || {})[rec.deck];
    // 1. find the candidates at that point
    let cands = null, kind = null, round = null;
    const probe = await P.replay(rec, {
      at: i,
      onAt: async (g, p, k, ctx, { heroBot }) => {
        kind = k; round = g.round;
        const mine = i < rec.answers.length ? deAnswer(g, rec.answers[i], ctx) : undefined;
        const list = await P.candidates(g, p, k, ctx, heroBot, mine);
        cands = list.map(c => ({ label: c.label, tags: c.tags, raw: serAnswer(g, k, ctx, c.answer), dist: c.answer && typeof c.answer === "object" && !Array.isArray(c.answer) && k === "choose" && ctx.type === "distribute" }));
        return { stop: true };
      }
    });
    if (probe.diverged || probe.error || !cands) return { i, error: probe.error || (probe.diverged ? "The replay didn't match the game." : "Nothing to compare at this moment.") };
    if (opts.maxCands) cands = cands.slice(0, opts.maxCands);
    // 2. roll each one out with the same seeds
    const seeds = []; for (let s = 0; s < n; s++) seeds.push(((rec.seed ^ (i * 7919)) + s * 104729) >>> 0);
    const t0 = Date.now();
    for (const c of cands) {
      c.res = [];
      for (const sd of seeds) {
        const r = await P.replay(rec, { at: i, reseed: sd, horizon, onAt: (g, p, k, ctx) => ({ answer: deAnswer(g, c.raw, ctx) }) });
        if (r.diverged || r.error) { c.res.push(null); continue; }
        const p = r.g.players[rec.hero];
        c.res.push(P.equity(r.g, p, T));
      }
      const xs = c.res.filter(x => x != null);
      c.n = xs.length;
      c.eq = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
      c.wins = xs.filter(x => x === 1).length;
      c.losses = xs.filter(x => x === 0).length;
      if (opts.onProgress) opts.onProgress(cands.indexOf(c) + 1, cands.length);
    }
    // paired differences against the best, on the same seeds
    const ok = cands.filter(c => c.eq != null);
    ok.sort((a, b) => b.eq - a.eq);
    const best = ok[0] || null;
    for (const c of ok) {
      const d = [];
      for (let s = 0; s < seeds.length; s++) if (c.res[s] != null && best.res[s] != null) d.push(best.res[s] - c.res[s]);
      const m = d.length ? d.reduce((a, b) => a + b, 0) / d.length : 0;
      const v = d.length > 1 ? d.reduce((a, b) => a + (b - m) * (b - m), 0) / (d.length - 1) : 0;
      c.loss = m; c.se = d.length ? Math.sqrt(v / d.length) : 0;
    }
    for (const c of cands) delete c.res;
    const mine = ok.find(c => c.tags.includes("you")) || null;
    return { i, kind, round, cands: ok, best: best ? best.label : null, mine: mine ? mine.label : null, loss: mine ? mine.loss : null, se: mine ? mine.se : null, ms: Date.now() - t0, n, horizon };
  };

  /* Chess-style labels from the win chance lost (0..1), when the gap is clear of the noise. */
  P.classify = function (loss, se) {
    if (loss == null) return null;
    const clear = loss > 2 * (se || 0);
    const pct = loss * 100;
    if (!clear || pct < 3) return pct <= 0.5 ? "best" : "good";
    if (pct < 8) return "inaccuracy";
    if (pct < 15) return "mistake";
    return "blunder";
  };
  /* Lichess's move accuracy from win-percentage loss (0..100). */
  P.accuracy = function (lossPct) {
    const a = 103.1668 * Math.exp(-0.04354 * Math.max(0, lossPct)) - 3.1669;
    return Math.max(0, Math.min(100, a));
  };
})(typeof window !== "undefined" ? window : globalThis);
