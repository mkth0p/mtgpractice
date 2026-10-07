/* The Etrata heist closer's training module for practice mode (practice.js) and the Corrupted Etrata Train tab:
   the win-probability features, the snapshot extras, the puzzles, the mulligan evaluator, the drill generators and
   the review rules that read a recorded game. It follows the nine piloting rules of the research report
   (research/etrata-theft-aggro/local/REPORT.md) and reads the real game engine, so the drills and the review use the
   same rules as the game. Registered as MK.TRAIN["etrata-heist-aggro"]; the v3 list keeps its own module
   (train-cetrata.js), so games recorded with it still review with its rules. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const A = () => MK.HEIST_AI;
  const DECK_ID = "etrata-heist-aggro";
  const ETRATA = "Etrata, Deadly Fugitive", RAMSES = "Ramses, Assassin Lord", BLOOD = "Bloodletter of Aclazotz";
  const short = n => n.split(",")[0];
  const onBf = (g, p, n) => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n);
  const clip = (x, a, b) => Math.max(a, Math.min(b, x));
  const isAssassin = (g, o) => (MK.isAssassin ? MK.isAssassin(g, o) : !!o && g.hasSub(o, "Assassin"));
  const deckList = () => (MK.ETRATA_HEIST_DECK && MK.ETRATA_HEIST_DECK.list) || [];

  /* ================================================================ win probability
     features(g, p): a fixed-length vector for the heist seat. winProb(f): a logistic model; the weights are a
     hand-set guess (the v3 module's are fitted by tools/sim/train-wp.js, which reads only that module). */
  const FEATURES = ["bias", "round", "life", "oppLifeAvg", "oppLifeMin", "oppsLeft", "myPower", "oppPowerMax", "danger", "lands", "mana", "hand", "etrata", "tax", "ramses", "ramsesHand", "killNow", "loopNow", "tutors", "counters", "faceDown", "assassins", "stolen"];
  function lineState(g, p) {
    let now = 0, next = 0, later = 0, loop = 0;
    try {
      const r = A().plan(g, p);
      const ls = r.lines.filter(l => l.kill);
      now = ls.some(l => l.when === "now") ? 1 : 0;
      next = !now && ls.some(l => l.when === "next") ? 1 : 0;
      later = !now && !next && ls.length ? 1 : 0;
      loop = r.lines.some(l => l.key === "loop" && l.when === "now") ? 1 : 0;
    } catch (e) { /* no planner */ }
    return { now, next, later, loop };
  }
  function features(g, p) {
    const ai = A();
    const opps = g.players.filter(q => q !== p && !q.lost);
    const lifeAvg = opps.length ? opps.reduce((a, q) => a + q.life, 0) / opps.length : 0;
    const lifeMin = opps.length ? Math.min(...opps.map(q => q.life)) : 0;
    const pw = q => g.creatures(q).reduce((a, c) => a + Math.max(0, g.power(c)), 0);
    const oppMax = opps.length ? Math.max(...opps.map(pw)) : 0;
    const ls = lineState(g, p);
    let mana = 0;
    try { mana = g.manaAfterUntap(p, null).total; } catch (e) { mana = g.controlled(p, o => g.isLand(o)).length; }
    const cmd = p.commanders[0];
    const v = {
      bias: 1, round: clip(g.round, 1, 16) / 10, life: clip(p.life, 0, 60) / 40,
      oppLifeAvg: clip(lifeAvg, 0, 60) / 40, oppLifeMin: clip(lifeMin, 0, 60) / 40, oppsLeft: opps.length / 3,
      myPower: clip(pw(p), 0, 40) / 20, oppPowerMax: clip(oppMax, 0, 60) / 20, danger: clip(oppMax / Math.max(1, p.life), 0, 2),
      lands: clip(g.controlled(p, o => g.isLand(o)).length, 0, 12) / 10, mana: clip(mana, 0, 16) / 10, hand: clip(p.hand.length, 0, 10) / 7,
      etrata: onBf(g, p, ETRATA) ? 1 : 0, tax: cmd ? clip((p.cmdCasts && p.cmdCasts[cmd.id]) || 0, 0, 4) / 3 : 0,
      ramses: onBf(g, p, RAMSES) ? 1 : 0, ramsesHand: p.hand.some(c => c.def.name === RAMSES) ? 1 : 0,
      killNow: ls.now, loopNow: ls.loop,
      tutors: clip(p.hand.filter(c => ai.ALL_TUTORS.includes(c.def.name)).length, 0, 4) / 3,
      counters: clip(p.hand.filter(c => ai.COUNTERS.includes(c.def.name)).length, 0, 3) / 2,
      faceDown: clip(g.controlled(p, o => !!o.faceDown).length, 0, 8) / 4,
      assassins: clip(g.creatures(p).filter(o => isAssassin(g, o)).length, 0, 10) / 5,
      stolen: clip(g.controlled(p, o => o.owner !== p).length, 0, 8) / 4
    };
    return FEATURES.map(k => +v[k].toFixed(3));
  }
  /* For the table-wide value model (value.js): how close this seat's kills are, and its tools. */
  function lineFeatures(g, p) {
    const ai = A(), ls = lineState(g, p);
    return { now: ls.now, next: ls.next, later: ls.later,
      tutors: p.hand.filter(c => ai.ALL_TUTORS.includes(c.def.name)).length,
      counters: p.hand.filter(c => ai.COUNTERS.includes(c.def.name)).length,
      engines: g.controlled(p, o => ai.ENGINES.includes(o.def.name) || ai.TYPERS.includes(o.def.name)).length };
  }
  // From the research telemetry: Ramses on the battlefield roughly doubles the win rate; the rest is a guess.
  let WP = null;
  const GUESS = { bias: -1.7, round: 0, life: 1.0, oppLifeAvg: -1.2, oppLifeMin: -0.8, oppsLeft: -1.0, myPower: 0.7, oppPowerMax: -0.3, danger: -1.0, lands: 0.3, mana: 0.5, hand: 0.3, etrata: 0.4, tax: -0.2, ramses: 1.1, ramsesHand: 0.4, killNow: 2.2, loopNow: 1.0, tutors: 0.4, counters: 0.2, faceDown: 0.3, assassins: 0.4, stolen: 0.2 };
  const sig = x => 1 / (1 + Math.exp(-x));
  function winProb(f) {
    if (!f) return null;
    const w = WP ? WP.w : FEATURES.map(k => GUESS[k] || 0);
    let z = 0;
    for (let i = 0; i < f.length && i < w.length; i++) z += f[i] * w[i];
    return +sig(z).toFixed(4);
  }

  /* ================================================================ snapshot extras */
  function snap(g, p, k, ctx) {
    const out = {};
    const ai = A();
    try {
      const r = ai.plan(g, p);
      out.lines = r.lines.slice(0, 3).map(l => ({ k: l.key, w: l.when, c: l.cost, m: l.missing.map(short), t: l.tutors.map(short), b: [] }));
      out.threats = r.threats.slice(0, 3).map(t => t.title);
      out.mana = r.state.manaNow;
      out.mark = r.state.mark;
    } catch (e) { /* none */ }
    out.etrata = onBf(g, p, ETRATA);
    out.ramses = onBf(g, p, RAMSES);
    out.cmdZone = !!(p.commanders[0] && p.commanders[0].zone === "command");
    out.landDrop = p.landsPlayed < (g.landDrops ? g.landDrops(p) : 1) && p.hand.some(c => c.def.types.includes("Land"));
    out.ctrs = p.hand.filter(c => ai.COUNTERS.includes(c.def.name)).map(c => c.def.name);
    out.ready = g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")) && isAssassin(g, c)).length;
    try {
      let c = null;
      if (k === "main") c = ai.companion(g, p, { mode: "main" });
      else if (k === "respond" && ctx) c = ai.companion(g, p, { mode: "respond", window: ctx.window, top: ctx.top, turnOf: ctx.turnOf, can: (ctx.actions || []).map(a => a.card && a.card.def.name).filter(Boolean) });
      if (c) { out.stage = c.stage; out.ctitle = c.title; out.urgent = !!c.urgent; out.csteps = (c.steps || []).slice(0, 4).map(x => x.text); }
    } catch (e) { /* optional */ }
    if (k === "choose" && ctx && ctx.purpose === "tutor" && ctx.options && ctx.options.length > 1) {
      try { const picks = tutorPicks(g, p, ctx.options); if (picks[0]) { out.best = picks[0].def.name; out.best2 = []; out.bestWhy = whyPick(g, p, picks[0].def.name); } } catch (e) { /* optional */ }
    }
    return out;
  }
  /* The research brain's tutor pick (Ramses first, then the other half of the loop, Reanimate for a dead Ramses). */
  function tutorPicks(g, p, options) {
    const B = MK.HEIST_BRAIN;
    const c = B && B.heistTutor ? B.heistTutor(g, p, options) : null;
    return c ? [c] : [];
  }
  function whyPick(g, p, n) {
    if (n === RAMSES) return "Ramses first: he's the kill";
    if (n === "Reanimate") return "Ramses is in a graveyard";
    if (A().DRAINS.includes(n) || A().PAYOFFS.includes(n)) return "it completes the drain loop";
    return "";
  }

  /* ================================================================ puzzles
     One turn in the real game engine, from a fixed board; the bots block and respond as in a game. Same shape as the
     v3 module's: me { board, hand, lands, life, library, faceDown }, opps [{ commander, life, board, hand }], goal,
     hints, solution, lesson, check(g, me), and `script` for tools/sim/test-train-heist.js. */
  const basics = (n, a) => Array.from({ length: n }, (_, i) => (a || ["Island", "Swamp"])[i % (a || ["Island", "Swamp"]).length]);
  const won = (g, me) => g.winner === me || g.players.every(q => q === me || q.lost);
  const PUZZLES = [
    { id: "first-hit", title: "The first hit", level: 1, rating: 950, skill: "etrata",
      goal: "Cloak a card this turn.",
      cmdZone: true,
      me: { board: ["Changeling Outcast"], hand: ["Hired Poisoner"], lands: ["Island", "Swamp", "Watery Grave"] },
      opps: [{ commander: "Kaalia of the Vast", life: 34, board: ["Serra Angel"] }, { commander: "Lathril, Blade of the Elves", life: 36, board: ["Llanowar Elves"] }, { commander: "Wilhelt, the Rotcleaver", life: 38, board: [] }],
      hints: ["Etrata cloaks whenever an Assassin you control deals combat damage to an opponent. Does her trigger work the turn she's cast?", "Which of your creatures can attack this turn, and can it be blocked?"],
      solution: ["Cast Etrata ({1}{U}{B}) before combat: her trigger works the turn she's cast.", "Attack with Changeling Outcast: it's every creature type (an Assassin) and can't be blocked. It connects and Etrata cloaks the top card of that player's library."],
      lesson: "Rule 2: Etrata comes down on the turn an Assassin is already getting through. She doesn't need to attack herself; her trigger cares about any Assassin you control.",
      check: (g, me) => g.controlled(me, o => !!o.faceDown).length >= 1,
      script: [{ main: "Cast Etrata" }, { attack: [["Changeling Outcast", "Wilhelt"]] }] },
    { id: "half-doubled", title: "Half, doubled", level: 1, rating: 1050, skill: "combat",
      goal: "Knock Isperia out of the game this turn.",
      me: { board: [ETRATA, BLOOD, "Virtus the Veiled", "Tetsuko Umezawa, Fugitive"], hand: [], lands: ["Island", "Island", "Swamp", "Swamp"] },
      opps: [{ commander: "Isperia, Supreme Judge", life: 37, board: ["Serra Angel", "Angel of Indemnity"] }, { commander: "Kaalia of the Vast", life: 25, board: [] }, { commander: "Wilhelt, the Rotcleaver", life: 31, board: [] }],
      hints: ["Virtus: the player it hits loses half their life, rounded up. Bloodletter doubles life loss on your turn.", "Isperia has fliers that can block. What makes Virtus unblockable?"],
      solution: ["Attack Isperia with Virtus. Tetsuko makes it unblockable: its power is 1.", "1 combat damage, doubled: 2. Isperia is at 35. Half rounded up is 18, doubled to 36: she's out."],
      lesson: "Half rounded up, doubled, is always at least their whole life. Keep a halver small for Tetsuko, or use Rogue's Passage.",
      check: (g, me) => g.players.some(q => q !== me && /Isperia/.test(q.name) && q.lost),
      script: [{ attack: [["Virtus the Veiled", "Isperia"]] }] },
    { id: "verdict", title: "Ramses' verdict", level: 2, rating: 1250, skill: "lines",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, RAMSES, BLOOD, "Unstoppable Slasher", "Changeling Outcast"], hand: [], lands: ["Island", "Island", "Swamp", "Swamp", "Rogue's Passage"] },
      opps: [{ commander: "Kaalia of the Vast", life: 29, board: ["Serra Angel", "Angel of Indemnity"] }, { commander: "Lathril, Blade of the Elves", life: 33, board: ["Elvish Archdruid", "Llanowar Elves"] }, { commander: "Ghired, Conclave Exile", life: 36, board: ["Old Gnawbone"] }],
      hints: ["Ramses: whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win. You only need one of them to die.", "Unstoppable Slasher halves on a hit, and Bloodletter doubles. Everyone has blockers. What makes the Slasher unblockable?"],
      solution: ["Rogue's Passage ({4}, {T}): Unstoppable Slasher can't be blocked this turn.", "Attack one player with the Slasher (and Changeling Outcast, which can't be blocked). The hit takes all their life: they lose, and Ramses wins you the game."],
      lesson: "Rule 7: with Ramses out, one death is the game. Pick one player and put everything that gets through at them. Ramses makes the Slasher a 4/3, too big for Tetsuko: Rogue's Passage is the way.",
      check: won, script: [{ main: "Rogue's Passage", target: "Unstoppable Slasher" }, { attack: [["Unstoppable Slasher", "Kaalia"], ["Changeling Outcast", "Kaalia"]] }] },
    { id: "loop", title: "Gain, drain, gain", level: 2, rating: 1200, skill: "lines",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, "Exquisite Blood", "Changeling Outcast"], hand: ["Vito, Thorn of the Dusk Rose", "Swan Song"], lands: ["Swamp", "Swamp", "Island"] },
      opps: [{ commander: "Kaalia of the Vast", life: 19, board: ["Serra Angel"] }, { commander: "Ghired, Conclave Exile", life: 26, board: [] }, { commander: "Isperia, Supreme Judge", life: 33, board: [] }],
      hints: ["Exquisite Blood plus Vito or Sanguine Bond loops. Which half is in your hand?", "The loop needs an opponent to lose life. What can deal damage this turn that can't be blocked?"],
      solution: ["Cast Vito, Thorn of the Dusk Rose ({2}{B}).", "Attack anyone with Changeling Outcast: it can't be blocked.", "One damage: Exquisite Blood gains you 1, Vito makes an opponent lose 1, Exquisite Blood triggers again, until every opponent is dead."],
      lesson: "The drain loop is the second kill: it's what wins the games Ramses never lands in (38% of them in bot games against precons). Any opponent losing life starts it.",
      check: won, script: [{ main: "Cast Vito" }, { attack: ["Changeling Outcast"] }] },
    { id: "two-cloaks", title: "Two cloaks a hit", level: 2, rating: 1300, skill: "etrata",
      goal: "Cloak two cards this turn.",
      me: { board: [ETRATA, "Changeling Outcast"], hand: ["Spark Double"], lands: ["Island", "Island", "Swamp", "Watery Grave"] },
      opps: [{ commander: "Isperia, Supreme Judge", life: 33, board: ["Serra Angel"] }, { commander: "Kaalia of the Vast", life: 30, board: [] }, { commander: "Lathril, Blade of the Elves", life: 31, board: ["Llanowar Elves"] }],
      hints: ["You have one creature that can hit unblocked. How can that one hit cloak two cards?", "Spark Double enters as a copy of a creature you control, and the copy isn't legendary."],
      solution: ["Cast Spark Double ({3}{U}) as a copy of Etrata. It isn't legendary, so both stay.", "Attack with Changeling Outcast. Each Etrata triggers on its hit: two cloaks."],
      lesson: "Copies of Etrata double every hit. A copy of Ramses is a second lord and a second 'you win'. The copy is summoning sick, but its trigger doesn't need it to attack.",
      check: (g, me) => g.controlled(me, o => !!o.faceDown).length >= 2,
      script: [{ main: "Cast Spark Double", target: "Etrata" }, { attack: [["Changeling Outcast", "Kaalia"]] }] },
    { id: "dominance", title: "Only Assassins", level: 3, rating: 1450, skill: "rules",
      goal: "Destroy every creature your opponents control and keep all of yours.",
      me: { board: [ETRATA, "Leyline of Transformation", "Mothdust Changeling"], faceDown: [{ name: "Serra Angel", kind: "cloak", owner: 1 }, { name: "Llanowar Elves", kind: "cloak", owner: 2 }], hand: ["Kindred Dominance"], lands: ["Swamp", "Swamp", "Swamp", "Island", "Island", "Watery Grave", "Sunken Hollow"] },
      opps: [{ commander: "Kaalia of the Vast", life: 28, board: ["Angel of Indemnity", "Serra Angel"] }, { commander: "Ghalta, Primal Hunger", life: 30, board: ["Old Gnawbone"] }, { commander: "Lathril, Blade of the Elves", life: 31, board: ["Elvish Archdruid", "Llanowar Elves"] }],
      hints: ["Kindred Dominance destroys every creature that isn't the chosen type. Name Assassin.", "Your face-down creatures have no creature types of their own. What makes them Assassins?"],
      solution: ["Leyline of Transformation (named Assassin) makes every creature you control an Assassin, face-down ones included.", "Cast Kindred Dominance naming Assassin: every opposing creature dies, and all of yours survive."],
      lesson: "With a type-changer out, Kindred Dominance is a one-sided wrath that keeps your stolen 2/2s. Without one, the face-down creatures die too. In bot games it measured +0.8 / +0.7 over a basic land.",
      check: (g, me) => g.players.filter(q => q !== me && !q.lost).every(q => g.creatures(q).length === 0) && g.controlled(me, o => !!o.faceDown).length >= 2 && onBf(g, me, ETRATA),
      script: [{ main: "Cast Kindred Dominance" }] },
    { id: "polarity", title: "Nobody blocks", level: 3, rating: 1500, skill: "lines",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, RAMSES, "Hired Poisoner", "Brotherhood Spy", "Leyline of Transformation"], faceDown: [{ name: "Cemetery Reaper", kind: "cloak", owner: 2 }, { name: "Serra Angel", kind: "cloak", owner: 1 }], hand: ["Reverse the Polarity"], lands: ["Island", "Island", "Swamp", "Watery Grave", "Underground River"] },
      opps: [{ commander: "Kaalia of the Vast", life: 15, board: ["Serra Angel", "Angel of Indemnity", "Archangel of Thune"] }, { commander: "Lathril, Blade of the Elves", life: 30, board: ["Elvish Archdruid"] }, { commander: "Wilhelt, the Rotcleaver", life: 34, board: ["Cemetery Reaper"] }],
      hints: ["Ramses is out. Kaalia is at 15. Count your power with Ramses' +1/+1 on your Assassins.", "Kaalia has three fliers ready to block. Reverse the Polarity has a mode for that."],
      solution: ["Before blockers, cast Reverse the Polarity choosing 'creatures can't be blocked this turn' ({1}{U}{U}). Cast it in your first main phase or at the start of combat.", "Attack Kaalia with everything. Leyline makes the face-down 2/2s Assassins, so Ramses gives every attacker +1/+1: far more than her 15 life gets through. She dies, and Ramses wins you the game."],
      lesson: "Reverse the Polarity was one of the cards that correlated most with winning when it landed. Its other mode counters every other spell, so it can also save Ramses from a wrath.",
      check: won, script: [{ main: "Cast Reverse the Polarity", number: 1 }, { attack: [[ETRATA, "Kaalia"], ["Hired Poisoner", "Kaalia"], ["Brotherhood Spy", "Kaalia"], [RAMSES, "Kaalia"], ["Cemetery Reaper", "Kaalia"], ["Serra Angel", "Kaalia"]] }] },
    { id: "tutor-first", title: "First things first", level: 2, rating: 1150, skill: "tutor",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, BLOOD, "Virtus the Veiled", "Changeling Outcast", "Mari, the Killing Quill"], hand: ["Pyre of Heroes"], lands: ["Island", "Swamp", "Swamp", "Swamp", "Watery Grave", "Island", "Sunken Hollow"], library: [RAMSES, "Coat of Arms", "Rhystic Study", "Swamp", "Island"] },
      opps: [{ commander: "Kaalia of the Vast", life: 27, board: ["Serra Angel"] }, { commander: "Lathril, Blade of the Elves", life: 24, board: [] }, { commander: "Ghalta, Primal Hunger", life: 38, board: [] }],
      hints: ["Virtus and Bloodletter kill one player. That's one player, not the game. What turns one death into a win?", "Pyre of Heroes: sacrifice a creature, find a creature that shares a type with it and costs one more. Mari is a 3-mana Assassin."],
      solution: ["Cast Pyre of Heroes ({2}), then activate it ({2}, {T}, sacrifice Mari): Ramses, Assassin Lord comes onto the battlefield.", "Attack Lathril with Virtus the Veiled (no flying blockers there) and Changeling Outcast. Virtus' half, doubled, takes all her life: she loses, and Ramses wins you the game."],
      lesson: "Rule 3: tutor for Ramses first. Pyre of Heroes finds him from any 3-mana Assassin (Etrata, Mari) and puts him straight onto the battlefield.",
      check: won, script: [{ main: "Cast Pyre of Heroes" }, { main: "Pyre of Heroes", target: "Mari", choose: RAMSES }, { attack: [["Virtus the Veiled", "Lathril"], ["Changeling Outcast", "Lathril"]] }] }
  ];
  function puzzlePlayers(pz, table) {
    const lib = (pz.me.library || []).concat(basics(40));
    const out = [{ name: "You", commander: ETRATA, list: lib, identity: ["U", "B"], human: true, agent: table ? table.humanAgent() : null, deckId: DECK_ID }];
    for (const o of pz.opps) {
      const d = MK.get(o.commander);
      const id = (MK.BOT_DECKS || []).find(x => x.commander === o.commander);
      const bot = MK.AI.create({ skill: 1, aggression: 0.5 });
      out.push({ name: short(o.commander), commander: o.commander, list: basics(60, ["Plains", "Forest", "Mountain"]), identity: d ? d.colors : [], agent: table ? table.paced(bot) : bot, deckId: id ? id.id : "puzzle" });
    }
    return out;
  }
  function putOn(g, p, name, opts) {
    opts = opts || {};
    const def = MK.get(name);
    if (!def) throw new Error("Unknown card " + name);
    const owner = opts.owner != null ? g.players[opts.owner] : p;
    const o = g.newObj(def, owner, "new");
    if (opts.faceDown) { g.putFaceDown(p, [o], { kind: opts.faceDown, log: false }); }
    else g.enterMany([{ o, controller: p, opts: {} }]);
    o.sick = false;
    return o;
  }
  function puzzleSetup(pz, g) {
    const me = g.players.find(p => p.human) || g.players[0];
    if (pz.me.life) me.life = pz.me.life;
    const cmd = me.commanders[0];
    for (const n of pz.me.board || []) {
      if (n === ETRATA && cmd && cmd.zone === "command") { g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: me, opts: {} }]); cmd.sick = false; continue; }
      putOn(g, me, n);
    }
    for (const n of pz.me.lands || []) putOn(g, me, n);
    for (const f of pz.me.faceDown || []) putOn(g, me, f.name, { faceDown: f.kind || "manifest", owner: f.owner });
    for (const n of pz.me.hand || []) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); }
    pz.opps.forEach((o, i) => {
      const q = g.players[i + 1];
      q.life = o.life || 40;
      for (const n of o.board || []) putOn(g, q, n);
      for (let k = 0; k < (o.lands || 4); k++) putOn(g, q, ["Plains", "Forest", "Mountain"][k % 3]);
      for (let k = 0; k < (o.hand || 0); k++) { const c = q.library.shift(); if (c) { c.zone = "hand"; q.hand.push(c); } }
    });
    for (const p of g.players) p.startCards = ["library", "hand", "graveyard", "exile", "command"].reduce((s, z) => s + p[z].length, 0) + g.battlefield.filter(o => o.owner === p && !o.isToken).length;
    g.log(`Puzzle: ${pz.title}. ${pz.goal}`, { kind: "big" });
  }
  const puzzleFor = pz => Object.assign({}, pz, { players: t => puzzlePlayers(pz, t), setup: g => puzzleSetup(pz, g), stopAtTurn: 1, round: 6, seed: 7 });

  /* ================================================================ the mulligan evaluator
     A goldfish of the heist plan: no opponents, just how fast a hand gets going. Each simulated game draws, plays a
     land, casts fast mana, cheap Assassins (they can attack the turn after), Etrata on the first turn an Assassin
     can attack, and Ramses as soon as he's in hand and castable (a tutor fetches him). The hand's value is
     0.5 x P(Etrata's first hit by turn 3) + 0.5 x P(Ramses by turn 6). Mulligan values come from the same model
     over random hands (MULL below), with the free first mulligan and the London bottom. */
  const GF_ROCKS = { "Sol Ring": [1, 2], "Arcane Signet": [2, 1], "Talisman of Dominance": [2, 1], "Mox Amber": [0, 1], "Chrome Mox": [0, 1] };
  const GF_ONESHOT = { "Lotus Petal": 1, "Dark Ritual": 2 };   // mana this turn only (Dark Ritual: {B} for {B}{B}{B})
  const GF_TUTOR = { "Demonic Tutor": [2, "hand"], "Grim Tutor": [3, "hand"], "Diabolic Intent": [2, "hand"], "Vampiric Tutor": [1, "top"], "Imperial Seal": [1, "top"], "Demonic Consultation": [1, "hand"] };
  const GF_DRAW = { "Rhystic Study": [3, 1], "Mystic Remora": [1, 1], "Dark Confidant": [2, 1] };
  const GF_CANTRIP = { "Brainstorm": 1, "Preordain": 1 };
  let GF_DECK = null;
  function gfDeck() {
    if (GF_DECK) return GF_DECK;
    GF_DECK = deckList().map(n => { const d = MK.get(n); return { n, land: !!(d && d.types.includes("Land")), mv: d ? d.mv : 0 }; });
    return GF_DECK;
  }
  const mvOf = n => { const d = MK.get(n); return d ? d.mv : 0; };
  function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  function goldfish(hand, rnd, maxT) {
    maxT = maxT || 8;
    const ai = A();
    const CHEAP = ai.CHEAP;
    const pool = gfDeck().map(c => c.n);
    for (const n of hand) { const i = pool.indexOf(n); if (i >= 0) pool.splice(i, 1); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const H = hand.slice();
    let lands = 0, rocks = 0, etrataT = 0, hitT = 0, ramsesT = 0, lands3 = false, assassinsReady = 0, assassinsNew = 0;
    const draws = [];
    const isLand = n => { const d = MK.get(n); return !!(d && d.types.includes("Land")); };
    const take = n => { const i = H.indexOf(n); if (i >= 0) H.splice(i, 1); };
    const fetch = n => { const i = pool.indexOf(n); if (i >= 0) pool.splice(i, 1); return i >= 0; };
    for (let t = 1; t <= maxT; t++) {
      if (t > 1 && pool.length) H.push(pool.shift());
      for (const d of draws) for (let k = 0; k < d && pool.length; k++) H.push(pool.shift());
      assassinsReady += assassinsNew; assassinsNew = 0;
      const li = H.findIndex(isLand);
      if (li >= 0) { H.splice(li, 1); lands++; }
      if (t === 3 && lands >= 3) lands3 = true;
      let mana = lands + rocks;
      for (const n of Object.keys(GF_ROCKS)) if (H.includes(n)) {
        const [c, add] = GF_ROCKS[n];
        if (n === "Mox Amber" && !etrataT) continue;
        if (n === "Chrome Mox" && H.length < 2) continue;
        if (c <= mana) { mana -= c; take(n); if (n === "Chrome Mox") H.splice(H.findIndex(x => !isLand(x)), 1); rocks += add; mana += add; }
      }
      for (const n of Object.keys(GF_ONESHOT)) if (H.includes(n) && (n !== "Dark Ritual" || mana >= 1)) { take(n); mana += GF_ONESHOT[n]; }
      // Etrata the turn an Assassin can attack (or once two turns of Assassins have been missed)
      if (!etrataT && mana >= 3 && (assassinsReady > 0 || t >= 4)) { mana -= 3; etrataT = t; if (assassinsReady > 0) hitT = hitT || t; }
      else if (etrataT && assassinsReady > 0 && !hitT) hitT = t;
      // Ramses as soon as possible
      if (!ramsesT && H.includes(RAMSES) && mana >= 4) { mana -= 4; take(RAMSES); ramsesT = t; }
      if (!ramsesT && !H.includes(RAMSES)) for (const n of Object.keys(GF_TUTOR)) if (H.includes(n) && GF_TUTOR[n][0] <= mana && fetch(RAMSES)) { mana -= GF_TUTOR[n][0]; take(n); if (GF_TUTOR[n][1] === "top") pool.unshift(RAMSES); else H.push(RAMSES); break; }
      if (!ramsesT && H.includes(RAMSES) && mana >= 4) { mana -= 4; take(RAMSES); ramsesT = t; }
      // cheap Assassins, then draw engines and cantrips
      for (const n of CHEAP) if (H.includes(n) && mvOf(n) <= mana) { mana -= mvOf(n); take(n); assassinsNew++; }
      for (const n of Object.keys(GF_DRAW)) if (H.includes(n) && GF_DRAW[n][0] <= mana) { mana -= GF_DRAW[n][0]; take(n); draws.push(GF_DRAW[n][1]); }
      for (const n of Object.keys(GF_CANTRIP)) if (H.includes(n) && mana >= 1) { mana -= 1; take(n); if (pool.length) H.push(pool.shift()); }
    }
    return { hit: hitT, etrata: etrataT, ramses: ramsesT, lands3 };
  }
  function handValue(hand, opts) {
    opts = opts || {};
    const n = opts.n || 400;
    const rnd = rngFrom(opts.seed != null ? opts.seed : hashStr(hand.slice().sort().join("|")));
    let h3 = 0, r6 = 0, e3 = 0, l3 = 0;
    for (let i = 0; i < n; i++) {
      const r = goldfish(hand, rnd, 6);
      if (r.hit && r.hit <= 3) h3++;
      if (r.ramses && r.ramses <= 6) r6++;
      if (r.etrata && r.etrata <= 3) e3++;
      if (r.lands3) l3++;
    }
    const ph = h3 / n, pr = r6 / n;
    return { value: +(0.5 * ph + 0.5 * pr).toFixed(4), h3: ph, r6: pr, e3: e3 / n, l3: l3 / n };
  }
  function bestBottom(hand, k, opts) {
    let h = hand.slice();
    const out = [];
    for (let j = 0; j < k; j++) {
      let best = null;
      for (const n of [...new Set(h)]) { const rest = h.slice(); rest.splice(rest.indexOf(n), 1); const v = handValue(rest, { n: (opts && opts.n) || 160 }).value; if (!best || v > best.v) best = { n, v, rest }; }
      out.push(best.n); h = best.rest;
    }
    return { bottom: out, hand: h };
  }
  // Expected value of taking a mulligan, by mulligans already taken (tools/sim/mull-values.js --deck heist --write).
  let MULL = null;
  /*MULL*/ MULL = null; /*MULL-END*/
  function mulliganAdvice(hand, mulls) {
    const k = Math.max(0, mulls - 1);
    const kept = k ? bestBottom(hand, k) : { bottom: [], hand: hand.slice() };
    const v = handValue(kept.hand);
    const lam = MULL && MULL[6] != null ? MULL[6] : 0.1;
    const value = +(v.value - lam * k).toFixed(4);
    const next = MULL && mulls + 1 <= 5 ? MULL[mulls + 1] : null;
    const keep = mulls >= 5 ? true : next == null ? value >= 0.4 : value >= next;
    const margin = next == null ? null : +(value - next).toFixed(4);
    return { keep, value, raw: v.value, mull: next, stats: v, bottom: kept.bottom, margin, close: margin != null && Math.abs(margin) < 0.06 };
  }
  function dealHand(seed, size) {
    const rnd = rngFrom(seed);
    const pool = gfDeck().map(c => c.n);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, size || 7);
  }

  /* ================================================================ drill generators
     Boards built in the real engine, read by the same combat model the heist brain attacks with. */
  const PRECON_CMDS = ["Kaalia of the Vast", "Lathril, Blade of the Elves", "Wilhelt, the Rotcleaver", "Ghired, Conclave Exile", "Isperia, Supreme Judge", "Krenko, Mob Boss", "Talrand, Sky Summoner"];
  const OPP_CREATURES = ["Serra Angel", "Llanowar Elves", "Elvish Archdruid", "Cemetery Reaper", "Angel of Indemnity", "Old Gnawbone", "Death Baron", "Archangel of Thune"];
  const DECK_LANDS = ["Watery Grave", "Drowned Catacomb", "Darkslick Shores", "Underground River", "Sunken Hollow", "Command Tower", "Island", "Swamp", "Island", "Swamp"];
  const MY_ATTACKERS = ["Changeling Outcast", "Hired Poisoner", "Slither Blade", "Mothdust Changeling", "Brotherhood Spy", "Basim Ibn Ishaq", "Reno and Rude", "Achilles Davenport", "Virtus the Veiled", "Unstoppable Slasher", "Mari, the Killing Quill", "Vein Ripper"];
  const FILLER = ["Rhystic Study", "Brainstorm", "Force of Will", "Swan Song", "Deadly Rollick", "Cyclonic Rift", "Arcane Signet", "Preordain", "Snuff Out"];
  function scenario(seed, opts) {
    opts = opts || {};
    const rnd = rngFrom(seed);
    const pick = a => a[Math.floor(rnd() * a.length)];
    const cmds = PRECON_CMDS.slice().sort(() => rnd() - 0.5).slice(0, 3);
    const players = [{ name: "You", commander: ETRATA, list: basics(30), identity: ["U", "B"], agent: MK.AI.create({ skill: 1 }) }]
      .concat(cmds.map(c => ({ name: short(c), commander: c, list: basics(40, ["Plains", "Forest", "Mountain"]), agent: MK.AI.create({ skill: 1 }) })));
    const g = new MK.Game({ seed: seed + 1, players });
    const me = g.players[0];
    me.deckId = DECK_ID;
    g.turn = 16 + Math.floor(rnd() * 12); g.round = Math.ceil(g.turn / 4); g.phase = "main1"; g.activeIdx = 0;
    const cmd = me.commanders[0];
    if (rnd() < 0.85) { g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: me, opts: {} }]); cmd.sick = false; }
    const nLands = opts.lands != null ? opts.lands : 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < nLands; k++) putOn(g, me, DECK_LANDS[k % DECK_LANDS.length]);
    if (opts.ramses != null ? opts.ramses : rnd() < 0.6) putOn(g, me, RAMSES);
    if (rnd() < 0.45) putOn(g, me, BLOOD);
    const nAtk = 2 + Math.floor(rnd() * 3);
    for (const n of MY_ATTACKERS.slice().sort(() => rnd() - 0.5).slice(0, nAtk)) putOn(g, me, n);
    if (rnd() < 0.5) putOn(g, me, pick(["Leyline of Transformation", "Arcane Adaptation", "Tetsuko Umezawa, Fugitive", "Quietus Spike", "Eldrazi Monument", "Coat of Arms"]));
    const nCloak = Math.floor(rnd() * 3);
    for (let k = 0; k < nCloak; k++) putOn(g, me, pick(OPP_CREATURES.concat(["Plains", "Forest"])), { faceDown: "cloak", owner: 1 + Math.floor(rnd() * 3) });
    for (const n of opts.hand || []) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); }
    for (const n of FILLER.slice().sort(() => rnd() - 0.5).slice(0, 1 + Math.floor(rnd() * 2))) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); }
    g.players.slice(1).forEach(q => {
      q.life = opts.lowLife ? 6 + Math.floor(rnd() * 22) : 10 + Math.floor(rnd() * 30);
      const n = Math.floor(rnd() * 4);
      for (let k = 0; k < n; k++) putOn(g, q, pick(OPP_CREATURES));
      for (let k = 0; k < 4; k++) putOn(g, q, ["Plains", "Forest", "Mountain"][k % 3]);
      for (let k = 0; k < 3; k++) { const c = q.library.shift(); c.zone = "hand"; q.hand.push(c); }
    });
    g.bump();
    return { g, me };
  }
  function describe(g, me) {
    const nmo = o => o.faceDown ? `${o.cardDef.name} (face down)` : o.def.name;
    return {
      bf: g.controlled(me, o => !g.isLand(o)).map(nmo),
      lands: g.controlled(me, o => g.isLand(o)).map(o => o.def.name),
      hand: me.hand.map(o => o.def.name),
      mana: A().manaNow(g, me),
      life: me.life,
      cmd: me.commanders[0] && me.commanders[0].zone === "command",
      opps: g.players.slice(1).map(q => ({ n: q.name, life: q.life, bf: g.controlled(q, o => !g.isLand(o)).map(o => o.def.name), open: g.controlled(q, o => g.isLand(o) && !o.tapped).length, hand: q.hand.length }))
    };
  }
  /* Kill Spotter: an all-in attack at one player. Who dies, and does it win the game? Answer from the heist brain's
     combat model (the blocks the bots would make, damage doubled by Bloodletter, then each halving trigger). */
  function lineSpotter(seed) {
    const M = MK.HEIST_MODEL;
    for (let tries = 0; tries < 40; tries++) {
      const s = scenario(seed * 31 + tries, { lowLife: true });
      const { g, me } = s;
      const atk = g.creatures(me).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")));
      const opps = g.players.slice(1);
      const outs = opps.map(q => ({ q, r: M.outcome(g, me, q, atk) }));
      const kills = outs.filter(x => x.r.kill);
      if (kills.length > 1) continue;
      if (!!kills.length !== ((seed % 3) !== 0) && tries < 30) continue;
      const ramses = onBf(g, me, RAMSES);
      const options = opps.map(q => q.name).concat(["Nobody"]);
      const answer = kills.length ? [opps.indexOf(kills[0].q)] : [3];
      const blood = onBf(g, me, BLOOD);
      const k = kills[0];
      const thru = k ? k.r.through.map(o => o.faceDown ? "a face-down 2/2" : short(o.def.name)) : [];
      const why = k ? `All in at ${k.q.name} (${k.q.life}): ${thru.join(", ")} get${thru.length === 1 ? "s" : ""} through${k.r.blocked.size ? ` (${k.r.blocked.size} blocked)` : ""}${blood ? ", Bloodletter doubles every point" : ""}${k.r.through.some(o => M.halvesOnHit(g, o)) ? ", and the halving triggers take the rest" : ""}. ${ramses ? "Ramses is out and they were attacked by an Assassin: their death wins you the game." : "Without Ramses it's one player, not the game: spread the hits instead unless that player is the real threat."}`
        : `No single player dies to an all-in attack: the best is ${outs.slice().sort((a, b) => a.r.life - b.r.life)[0].q.name}, left at ${Math.max(0, outs.slice().sort((a, b) => a.r.life - b.r.life)[0].r.life)}. ${ramses ? "Keep the mark on them and hit whoever is open with the rest." : "Spread the hits: every Assassin that connects is a stolen card."}`;
      return { kind: "line", seed, q: `Your attack: all of it at one player. Who dies this turn?${ramses ? " (Ramses is out.)" : ""}`, view: describe(g, me), options, answer, explain: why, cards: [ramses ? RAMSES : ETRATA].concat(blood ? [BLOOD] : []) };
    }
    return null;
  }
  /* Tutor Target: the research rule (Ramses first, then the other half of the loop, Reanimate for a dead Ramses). */
  const DRILL_TUTORS = ["Demonic Tutor", "Grim Tutor", "Diabolic Intent", "Vampiric Tutor", "Imperial Seal"];
  function tutorTarget(seed) {
    for (let tries = 0; tries < 40; tries++) {
      const rnd = rngFrom(seed * 97 + tries);
      const tutor = DRILL_TUTORS[Math.floor(rnd() * DRILL_TUTORS.length)];
      const kind = ["ramses", "ramses", "loop", "dead"][seed % 4];
      const s = scenario(seed * 97 + tries, { ramses: kind === "loop", hand: [tutor] });
      const { g, me } = s;
      if (kind === "loop") { putOn(g, me, rnd() < 0.5 ? "Exquisite Blood" : "Bloodthirsty Conqueror"); }
      if (kind === "dead") { for (const o of g.battlefield.filter(o => o.def.name === RAMSES)) g.removeFromZone(o); const c = g.newObj(MK.get(RAMSES), me, "graveyard"); me.graveyard.push(c); }
      g.bump();
      const pool = [...new Set(deckList())].filter(n => !me.hand.some(c => c.def.name === n) && !g.battlefield.some(o => o.controller === me && !o.faceDown && o.def.name === n) && !me.graveyard.some(c => c.def.name === n) && !/^(Island|Swamp)$/.test(n));
      const cands = pool.map(n => g.newObj(MK.get(n), me, "library"));
      const best = tutorPicks(g, me, cands)[0];
      if (!best) continue;
      const right = best.def.name;
      if (kind === "loop" && !A().PAYOFFS.includes(right)) continue;
      if (kind === "dead" && right !== "Reanimate") continue;
      if (kind === "ramses" && right !== RAMSES) continue;
      const tempting = ["Coat of Arms", "Rhystic Study", BLOOD, "Quietus Spike", "Kindred Dominance", "Teferi's Veil", "Eldrazi Monument", "Spark Double", "Leyline of Transformation", "Sol Ring", "Force of Will"].filter(n => pool.includes(n) && n !== right);
      const opts = [right].concat(tempting.sort(() => rnd() - 0.5).slice(0, 3));
      const order = opts.slice().sort(() => rnd() - 0.5);
      const why = kind === "ramses" ? `${RAMSES}. Rule 3: tutor for Ramses first. With him out the deck won about 56% of its bot games against precons, without him 38%; tutoring anything else first cost 8 to 11 points.`
        : kind === "loop" ? `${right}: half of the drain loop is already out, and the other half kills the whole table. It's the kill that doesn't need Ramses.`
        : `Reanimate: Ramses is in your graveyard. Reanimate puts him back for {B} and 4 life, and he's the kill.`;
      return { kind: "tutor", seed, tutor, q: `You cast ${tutor}. What do you fetch?`, view: describe(g, me), options: order, answer: [order.indexOf(right)], explain: why, cards: [tutor, right] };
    }
    return null;
  }
  /* Clock Math: the numbers that decide heist games, generated fresh each time. */
  function clockMath(seed) {
    const rnd = rngFrom(seed * 13 + 5);
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const kinds = ["virtus", "spike", "twohalves", "bloodcombat", "tax", "coat", "loop", "offturn"];
    const k = kinds[seed % kinds.length];
    const opts4 = (right, xs) => { const set = [right]; for (const x of xs) if (!set.includes(x) && x >= 0) set.push(x); while (set.length < 4) { const y = right + ri(1, 6) * (rnd() < 0.5 ? -1 : 1); if (y >= 0 && !set.includes(y)) set.push(y); } const o = set.slice(0, 4).sort((a, b) => a - b); return { options: o.map(String), answer: [o.indexOf(right)] }; };
    if (k === "virtus") {
      const L = ri(15, 39);
      const after = Math.max(0, L - 2), right = Math.min(L, 2 + Math.ceil(after / 2) * 2);
      return { kind: "math", seed, q: `Your turn, Bloodletter of Aclazotz is out. Virtus the Veiled (a 1/1) connects with an opponent at ${L} life. How much life do they lose in total?`, ...opts4(right, [Math.ceil(L / 2), Math.ceil(L / 2) + 1, L - 1]), explain: `Combat damage first: 1, doubled to 2 (${L} → ${after}). Then the trigger: half of ${after}, rounded up, is ${Math.ceil(after / 2)}, doubled to ${Math.ceil(after / 2) * 2}. That's ${right >= L ? "all of it: they're out" : `${right} in total`}.`, cards: ["Virtus the Veiled", BLOOD] };
    }
    if (k === "spike") {
      const L = ri(18, 40), P = ri(2, 5);
      const after = L - P, right = P + Math.ceil(after / 2);
      return { kind: "math", seed, q: `No Bloodletter. A ${P}/${P} carrying Quietus Spike connects with a player at ${L}. Where are they after the trigger resolves?`, ...opts4(L - right, [Math.floor(L / 2) - P, Math.floor(L / 2), L - P]), explain: `Combat damage first: ${L} − ${P} = ${after}. Then half of what's left, rounded up: ${Math.ceil(after / 2)}. They're at ${after - Math.ceil(after / 2)}.`, cards: ["Quietus Spike"] };
    }
    if (k === "twohalves") {
      const L = ri(20, 40);
      const a = L - 1, b = a - Math.ceil(a / 2), c = b - Math.ceil(b / 2);
      return { kind: "math", seed, q: `No Bloodletter. Unstoppable Slasher (power 1 after a -2/-0 effect, it doesn't matter how) carries Quietus Spike and connects with a player at ${L}. Two halving triggers. Where do they end?`, ...opts4(c, [Math.floor(a / 2), b, Math.floor(L / 4)]), explain: `1 combat damage: ${a}. The first trigger takes half rounded up: ${b}. The second takes half of what's left, not the same amount again: ${c}.`, cards: ["Unstoppable Slasher", "Quietus Spike"] };
    }
    if (k === "bloodcombat") {
      const n = ri(2, 5), L = ri(15, 30);
      const right = Math.max(0, L - n * 2 * 2);
      return { kind: "math", seed, q: `Your turn, Bloodletter is out. ${n} face-down 2/2s connect with a player at ${L}. Where are they now?`, ...opts4(right, [L - n * 2, Math.max(0, L - n * 3), Math.max(0, L - n * 2 * 3)]), explain: `${n} × 2 = ${n * 2} damage, and Bloodletter doubles the life loss on your turn: ${n * 4}. ${L} − ${n * 4} = ${right}.`, cards: [BLOOD] };
    }
    if (k === "tax") {
      const n = ri(1, 4), right = 3 + 2 * n;
      return { kind: "math", seed, q: `Etrata has been cast from the command zone ${n} time${n > 1 ? "s" : ""} before. What does she cost now?`, ...opts4(right, [3 + n, 3 + 2 * (n - 1), 3 + 2 * (n + 1)]), explain: `{1}{U}{B} plus {2} for each earlier cast from the command zone: 3 + ${2 * n} = ${right}.`, cards: [ETRATA] };
    }
    if (k === "coat") {
      const n = ri(3, 6);
      const right = 2 + (n - 1);
      return { kind: "math", seed, q: `Leyline of Transformation (Assassin) and Coat of Arms are out. You control ${n} face-down 2/2s and nothing else; no other creature on the battlefield is an Assassin. How big is each one?`, ...opts4(right, [2 + n, 2, 3]), explain: `Leyline makes them Assassins, and Coat of Arms gives each +1/+1 for each OTHER creature sharing a type with it: ${n - 1}. ${right}/${right}. Coat of Arms counts your opponents' creatures too, so cast it when your type count is higher than theirs.`, cards: ["Coat of Arms", "Leyline of Transformation"] };
    }
    if (k === "loop") {
      const L = ri(1, 3);
      return { kind: "math", seed, q: `Exquisite Blood and Sanguine Bond are out. An opponent pays ${L} life for a shock land on their own turn. What happens?`, options: ["Nothing: paying life isn't losing it", `You gain ${L} and it stops`, "The loop runs until every opponent is dead", "Only that opponent loses more life"], answer: [2], explain: `Paying life is losing life. Exquisite Blood gains you ${L}, Sanguine Bond makes a target opponent lose ${L}, Exquisite Blood triggers again... Each Sanguine Bond trigger targets, so you aim the loop at each opponent in turn until all of them are dead.`, cards: ["Exquisite Blood", "Sanguine Bond"] };
    }
    const L = ri(15, 35), right = Math.ceil(L / 2);
    return { kind: "math", seed, q: `An opponent's turn. Bloodletter of Aclazotz is out, and an effect makes a player at ${L} lose half their life, rounded up. How much do they lose?`, ...opts4(right, [right * 2, Math.floor(L / 2), L]), explain: `Bloodletter only doubles life loss during your turn. Half of ${L}, rounded up: ${right}.`, cards: [BLOOD] };
  }

  /* ================================================================ the review */
  const SKILLS = [
    { id: "mull", name: "Mulligans", blurb: "Keeping hands that do something by turn 3, shipping the rest." },
    { id: "tempo", name: "Mana and tempo", blurb: "Land drops, fast mana, Etrata on the turn an Assassin connects." },
    { id: "lines", name: "Seeing the kill", blurb: "Ramses, the halvers and the loop: spotting the kill and taking it." },
    { id: "tutor", name: "Tutoring", blurb: "Ramses first, then the loop." },
    { id: "etrata", name: "Etrata and the snowball", blurb: "Cloaks, type-changers, copies, flipping rarely." },
    { id: "stack", name: "The stack", blurb: "The last counter for the wrath and for removal on Ramses or Etrata." },
    { id: "combat", name: "Combat and the mark", blurb: "One player at a time once Ramses is out; everything in under Teferi's Veil." },
    { id: "rules", name: "Rules knowledge", blurb: "Halving, doubling, types on face-down creatures." }
  ];
  const isInstantName = n => { const d = MK.get(n); return !!d && (d.types.includes("Instant") || (d.keywords || []).includes("flash")); };
  function review(rec) {
    const ai = A();
    const ms = rec.moments || [];
    const log = rec.log || [];
    const flags = [];
    const ev = {};
    SKILLS.forEach(s => { ev[s.id] = { ok: 0, n: 0 }; });
    const took = (s, ok, w) => { w = w || 1; ev[s].n += w; if (ok) ev[s].ok += w; };
    const flag = f => flags.push(Object.assign({ sev: 2 }, f));
    const hero = rec.hero;
    const myTurns = [];
    for (const m of ms) if (m.mine && !myTurns.includes(m.t)) myTurns.push(m.t);
    myTurns.sort((a, b) => a - b);
    const ownTurn = t => myTurns.indexOf(t) + 1;
    const byTurn = new Map();
    for (const m of ms) { if (!byTurn.has(m.t)) byTurn.set(m.t, []); byTurn.get(m.t).push(m); }
    const res = rec.result || {};
    const turnOfLog = [];
    let curT = 0;
    for (const [k, p, text] of log) { if (k === "turn") { const mt = /^Turn (\d+)/.exec(text); if (mt) curT = +mt[1]; } turnOfLog.push(curT); }
    const logIn = (t, re) => log.some(([k, p, text], i) => turnOfLog[i] === t && re.test(text));
    const wonOnTurn = t => res.win && res.turn === t;

    for (const m of ms.filter(x => x.k === "mulligan" && !x.replayed)) {
      let adv = null;
      try { adv = mulliganAdvice(m.hand, m.mulls || 0); } catch (e) { adv = null; }
      if (!adv) continue;
      m.adv = { keep: adv.keep, value: adv.value, mull: adv.mull, h3: adv.stats.h3, r6: adv.stats.r6 };
      const kept = m.ans === "Keep";
      took("mull", kept === adv.keep || adv.close);
      if (kept !== adv.keep && !adv.close) flag({ id: "mull", skill: "mull", sev: adv.margin != null && Math.abs(adv.margin) > 0.1 ? 3 : 2, i: m.i, r: 0, title: kept ? "Kept a hand the model would ship" : "Shipped a hand the model would keep", text: `This hand gets Etrata's first hit by turn 3 in ${Math.round(adv.stats.h3 * 100)}% of goldfish games and Ramses down by turn 6 in ${Math.round(adv.stats.r6 * 100)}%. Its value is ${Math.round(adv.value * 100)}${adv.mull != null ? `; a mulligan here is worth ${Math.round(adv.mull * 100)} on average` : ""}. Mulligan is the default.`, drill: "mulligan" });
    }
    let etrataCast = 0, etrataEarly = null, ramsesHeld = null;
    for (const t of myTurns) {
      const list = byTurn.get(t).filter(m => m.mine && !m.replayed);
      const mains = list.filter(m => m.k === "main");
      if (!mains.length) continue;
      const last = mains[mains.length - 1];
      const own = ownTurn(t);
      if (last.landDrop) { took("tempo", false); flag({ id: "land", skill: "tempo", i: last.i, r: last.r, title: "Missed a land drop", text: `You ended turn ${own} with a land in hand and no land played.` }); }
      else took("tempo", true);
      const sorc = (last.acts || []).filter(a => /^Cast /.test(a)).map(a => a.replace(/^Cast /, "").replace(/ face down$/, "")).filter(n => !isInstantName(n));
      if (last.ph === "main2" && (last.mana || 0) >= 3 && sorc.length) { took("tempo", false, 0.5); flag({ id: "float", skill: "tempo", sev: 1, i: last.i, r: last.r, title: `Passed with ${last.mana} mana up`, text: `You could still cast ${sorc.slice(0, 3).join(", ")}. Rule 9: don't hold mana for one-shot tricks.` }); }
      const go = mains.find(m => m.stage === "Go off");
      if (go) {
        if (wonOnTurn(t) || logIn(t, /wins the game/)) took("lines", true, 2);
        else { took("lines", false, 2); flag({ id: "missedwin", skill: "lines", sev: 3, i: go.i, r: go.r, title: `A kill was live: ${(go.ctitle || "").replace(/^Win now: /, "")}`, text: `On your turn ${own} (round ${go.r}) the planner saw a kill this turn, and the turn ended without the win.`, drill: "lines" }); }
      }
      // Etrata cast on a turn no Assassin could connect (rule 2)
      const etr = mains.find(m => m.ans === "Cast " + ETRATA);
      if (etr) { if (!etrataCast) etrataCast = own; if (etr.ready === 0 && !etrataEarly) etrataEarly = etr; }
      // Ramses castable but held (rule 4)
      if (!ramsesHeld && mains.some(m => (m.acts || []).includes("Cast " + RAMSES)) && !mains.some(m => m.ans === "Cast " + RAMSES)) ramsesHeld = { m: mains.find(m => (m.acts || []).includes("Cast " + RAMSES)), own };
      // tutor cast while Ramses was in neither hand nor play and the pick wasn't him: see the tutor picks below
    }
    if (etrataCast) took("tempo", etrataCast <= 4);
    if (etrataEarly) { took("etrata", false); flag({ id: "etrata-early", skill: "etrata", sev: 1, i: etrataEarly.i, r: etrataEarly.r, title: "Etrata came down with no Assassin ready to hit", text: "Rule 2: cast her on the turn an Assassin connects. Her trigger works the turn she's cast, and she's kill-on-sight: a turn on the table without a hit gives them a free shot." }); }
    else if (etrataCast) took("etrata", true);
    if (ramsesHeld) { took("lines", false); flag({ id: "ramses-held", skill: "lines", sev: 2, i: ramsesHeld.m.i, r: ramsesHeld.m.r, title: "Ramses stayed in hand", text: `You could cast Ramses on your turn ${ramsesHeld.own} and didn't. Rule 4: holding him for protection cost 3.8 points against precons in bot games. He's the kill.` }); }
    for (const m of ms.filter(x => x.k === "respond" && !x.replayed && x.top && x.top.p !== hero && x.top.p >= 0)) {
      const countered = m.ans !== "Pass" && /Force of Will|Force of Negation|Fierce Guardianship|Swan Song|Reverse the Polarity/.test(m.ans);
      if (m.urgent) {
        took("stack", countered, 2);
        if (!countered) flag({ id: "nocounter", skill: "stack", sev: 3, i: m.i, r: m.r, title: `Let ${m.top.n} resolve`, text: `${m.ctitle || m.top.n}. You held ${(m.ctrs || []).join(", ") || "a counter"} and passed. This is what the last counter is for.`, drill: "stack" });
      } else if (countered && (m.ctrs || []).length <= 1) {
        took("stack", false);
        flag({ id: "wastecounter", skill: "stack", sev: 1, i: m.i, r: m.r, title: `Spent your last counter on ${m.top.n}`, text: "Rule 5: save the last counter for the wrath and for removal aimed at Ramses or Etrata. Single creatures and commanders can resolve.", drill: "stack" });
      } else if (!countered) took("stack", true, 0.5);
    }
    for (const m of ms.filter(x => x.k === "choose" && !x.replayed && x.q && x.q.purpose === "tutor" && x.best)) {
      const ok = m.ans === m.best;
      took("tutor", ok);
      if (!ok && m.best === RAMSES) flag({ id: "tutorpick", skill: "tutor", sev: 2, i: m.i, r: m.r, title: `Tutored ${m.ans} with ${m.q.src}`, text: "Rule 3: Ramses first. Tutoring anything else first cost 8 to 11 points in bot games.", drill: "tutor" });
      else if (!ok) flag({ id: "tutorpick", skill: "tutor", sev: 1, i: m.i, r: m.r, title: `Tutored ${m.ans} with ${m.q.src}`, text: `The research pick was ${m.best}${m.bestWhy ? `: ${m.bestWhy}` : ""}.`, drill: "tutor" });
    }
    for (const m of ms.filter(x => x.k === "block" && !x.replayed)) {
      const dmg = (m.inc || []).reduce((a, x) => a + x.pw, 0);
      const myLife = m.life[hero];
      if (dmg >= myLife) { const ok = m.ans !== "No blocks"; took("combat", ok, 2); if (!ok) flag({ id: "lethalblock", skill: "combat", sev: 3, i: m.i, r: m.r, title: "No blocks against lethal damage", text: `${dmg} damage was coming at you at ${myLife} life.` }); }
      else took("combat", true, 0.3);
    }
    // the mark: with Ramses out, attacks split across players
    for (const m of ms.filter(x => x.k === "attack" && !x.replayed && x.ramses && x.mark)) {
      const ans = m.ans || "";
      const targets = new Set((ans.match(/→ ([^,;]+)/g) || []).map(s => s.slice(2).trim()));
      const split = targets.size > 1 && !targets.has(m.mark);
      took("combat", !split);
      if (split) flag({ id: "mark", skill: "combat", sev: 1, i: m.i, r: m.r, title: "Ramses was out and the attack skipped the mark", text: `Rule 7: with Ramses out, one death is the game. The planner's mark was ${m.mark}, the player your board kills soonest.` });
    }
    for (const m of ms.filter(x => !x.replayed && (x.stage === "Go off" || x.urgent) && x.ms != null && x.ms < 2500)) flag({ id: "fast", skill: "lines", sev: 1, i: m.i, r: m.r, title: "A key moment, answered in under three seconds", text: "The coach marked this as a moment that matters. Count the table's open mana first.", info: true });
    const cnt = re => log.filter(([k, p, t]) => p === hero && re.test(t)).length;
    const think = {};
    for (const m of ms.filter(x => !x.replayed && x.ms != null)) { const t = think[m.k] = think[m.k] || { n: 0, ms: 0 }; t.n++; t.ms += Math.min(m.ms, 120000); }
    const wps = ms.filter(m => m.mine && m.k === "main" && m.wp != null);
    const stats = {
      win: !!res.win, rounds: res.rounds || 0, turns: myTurns.length, etrataTurn: etrataCast || null,
      etrataLost: log.filter(([k, p, t]) => /Etrata, Deadly Fugitive (dies|is put into the command zone|goes to the command zone|is exiled)/.test(t)).length,
      cloaks: cnt(/cloaks/), flips: cnt(/turns .* face up/), spells: cnt(/^You casts /), stolen: cnt(/cloaks/),
      think: Object.fromEntries(Object.entries(think).map(([k, v]) => [k, Math.round(v.ms / v.n)])),
      wpStart: wps.length ? wps[0].wp : null, wpPeak: wps.length ? Math.max(...wps.map(m => m.wp)) : null, wpEnd: wps.length ? wps[wps.length - 1].wp : null
    };
    const swings = [];
    const seq = ms.filter(m => m.wp != null && !m.replayed);
    for (let k = 1; k < seq.length; k++) { const d = seq[k].wp - seq[k - 1].wp; if (Math.abs(d) >= 0.05) swings.push({ i: seq[k - 1].i, to: seq[k].i, r: seq[k - 1].r, d: +d.toFixed(3), mine: seq[k - 1].mine }); }
    swings.sort((a, b) => a.d - b.d);
    flags.sort((a, b) => b.sev - a.sev || a.i - b.i);
    return { flags, ev, stats, swings: swings.slice(0, 8) };
  }
  function categorize(m, r) {
    const ai = A();
    const mine = (r && r.mine) || m.ans || "", best = (r && (r.best || r.bot)) || "";
    const both = mine + " | " + best;
    const has = l => l.some(n => both.includes(n));
    if (m.k === "mulligan") return "mull";
    if (m.k === "attack" || m.k === "block") return "combat";
    if (m.k === "respond") return "stack";
    if (m.k === "choose") {
      const src = m.q && m.q.src || "";
      if ((m.q && /tutor|search/i.test((m.q.purpose || "") + " " + (m.q.prompt || ""))) || ai.ALL_TUTORS.includes(src)) return "tutor";
      return "rules";
    }
    if (/face down|face up|Face-down/i.test(both) || has(ai.TYPERS)) return "etrata";
    if (has(ai.ALL_TUTORS)) return "tutor";
    if (/^Play /.test(mine) || /^Play /.test(best) || has(ai.ROCKS) || /Cast Etrata, Deadly Fugitive/.test(both)) return "tempo";
    if (has(ai.COUNTERS)) return "stack";
    return "lines";
  }
  function criticalMoments(rec, rv, max) {
    rv = rv || review(rec);
    const out = [];
    const add = i => { if (i != null && !out.includes(i) && rec.moments.some(m => m.i === i && !m.replayed && m.k !== "mulligan")) out.push(i); };
    for (const f of rv.flags.filter(f => !f.info && f.sev >= 2)) add(f.i);
    for (const s of rv.swings) add(s.i);
    for (const m of rec.moments.filter(m => m.stage === "Go off" || m.urgent)) add(m.i);
    for (const m of rec.moments.filter(m => m.k === "main" && m.mine && (m.acts || []).length > 3).slice(0, 6)) add(m.i);
    return out.slice(0, max || 6);
  }

  const T = { id: DECK_ID, FEATURES, features, winProb, lineFeatures, categorize, snap, tutorPicks, PUZZLES, puzzleFor, goldfish, handValue, bestBottom, mulliganAdvice, dealHand, scenario, describe, lineSpotter, tutorTarget, clockMath, review, criticalMoments, SKILLS, setMULL: m => { MULL = m; }, getMULL: () => MULL, puzzlePlayers, puzzleSetup, setWP: w => { WP = w; }, getWP: () => WP };
  (MK.TRAIN = MK.TRAIN || {})[DECK_ID] = T;
  MK.HEIST_TRAIN = T;
})(typeof window !== "undefined" ? window : globalThis);
