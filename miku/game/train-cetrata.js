/* Corrupted Etrata's training module for practice mode (practice.js): the win-probability model,
   the snapshot extras, the review rules that read a recorded game, the mulligan evaluator and the
   drill generators. Everything here reads the real game engine, so the drills and the review
   use the same rules as the game. Registered as MK.TRAIN["corrupted-etrata"]. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const A = () => MK.CETRATA_AI;
  const short = n => n.split(",")[0];
  const nameOf = o => (o.cardDef || o.def).name;
  const onBf = (g, p, n) => g.battlefield.some(o => o.controller === p && o.def.name === n);
  const inHand = (p, n) => p.hand.some(c => c.def.name === n);
  const clip = (x, a, b) => Math.max(a, Math.min(b, x));

  /* ================================================================ win probability
     features(g, p): a fixed-length vector describing the position for the Etrata seat.
     winProb(f): a logistic model fitted on bot games (tools/sim/train-wp.js writes WP below). */
  const FEATURES = ["bias", "round", "life", "oppLifeAvg", "oppLifeMin", "oppsLeft", "myPower", "oppPowerMax", "danger", "lands", "mana", "hand", "etrata", "tax", "lineNow", "lineNext", "lineLater", "tutors", "engines", "counters", "faceDown", "oppHand", "stolen"];
  function features(g, p) {
    const ai = A();
    const opps = g.players.filter(q => q !== p && !q.lost);
    const lifeAvg = opps.length ? opps.reduce((a, q) => a + q.life, 0) / opps.length : 0;
    const lifeMin = opps.length ? Math.min(...opps.map(q => q.life)) : 0;
    const pw = q => g.creatures(q).reduce((a, c) => a + Math.max(0, g.power(c)), 0);
    const oppMax = opps.length ? Math.max(...opps.map(pw)) : 0;
    let best = 0, nowL = 0, nextL = 0, laterL = 0;
    try {
      const r = ai.plan(g, p);
      const ls = r.lines.filter(l => l.when !== "blocked" && l.kill);
      nowL = ls.some(l => l.when === "now") ? 1 : 0;
      nextL = !nowL && ls.some(l => l.when === "next") ? 1 : 0;
      laterL = !nowL && !nextL && ls.length ? 1 : 0;
      best = nowL || nextL;
    } catch (e) { /* no planner */ }
    let mana = 0;
    try { mana = g.manaAfterUntap(p, null).total; } catch (e) { mana = g.controlled(p, o => g.isLand(o)).length; }
    const cmd = p.commanders[0];
    const v = {
      bias: 1,
      round: clip(g.round, 1, 16) / 10,
      life: clip(p.life, 0, 60) / 40,
      oppLifeAvg: clip(lifeAvg, 0, 60) / 40,
      oppLifeMin: clip(lifeMin, 0, 60) / 40,
      oppsLeft: opps.length / 3,
      myPower: clip(pw(p), 0, 40) / 20,
      oppPowerMax: clip(oppMax, 0, 60) / 20,
      danger: clip(oppMax / Math.max(1, p.life), 0, 2),
      lands: clip(g.controlled(p, o => g.isLand(o)).length, 0, 12) / 10,
      mana: clip(mana, 0, 16) / 10,
      hand: clip(p.hand.length, 0, 10) / 7,
      etrata: onBf(g, p, "Etrata, Deadly Fugitive") ? 1 : 0,
      tax: cmd ? clip((p.cmdCasts && p.cmdCasts[cmd.id]) || 0, 0, 4) / 3 : 0,
      lineNow: nowL, lineNext: nextL, lineLater: laterL,
      tutors: clip(p.hand.filter(c => ai.ALL_TUTORS.includes(c.def.name)).length, 0, 4) / 3,
      engines: clip(g.controlled(p, o => ai.ENGINES.includes(o.def.name)).length, 0, 4) / 3,
      counters: clip(p.hand.filter(c => ai.COUNTERS.includes(c.def.name)).length, 0, 3) / 2,
      faceDown: clip(g.controlled(p, o => !!o.faceDown).length, 0, 6) / 4,
      oppHand: opps.length ? clip(opps.reduce((a, q) => a + q.hand.length, 0) / opps.length, 0, 10) / 7 : 0,
      stolen: clip(g.controlled(p, o => o.owner !== p).length, 0, 6) / 4
    };
    return FEATURES.map(k => +v[k].toFixed(3));
  }
  // Fitted by tools/sim/train-wp.js; null until then (a hand-set guess is used instead).
  let WP = null;
  /*WP*/ WP = {"games":4000,"positions":36264,"wins":574,"logloss":0.3835,"brier":0.1168,"w":[-0.9641,-0.2587,1.3122,-1.0044,-0.5672,-1.0505,1.3155,-0.3912,-1.1372,-0.2362,0.6573,0.2246,0.2864,0.1574,2.1598,1.0797,0.3723,-0.1361,0.2214,-0.191,-0.042,0.0292,-0.1228]}; /*WP-END*/
  const GUESS = { bias: -1.6, round: 0, life: 1.2, oppLifeAvg: -1.4, oppLifeMin: -0.6, oppsLeft: -1.0, myPower: 0.5, oppPowerMax: -0.3, danger: -1.0, lands: 0.4, mana: 0.6, hand: 0.4, etrata: 0.3, tax: -0.2, lineNow: 2.2, lineNext: 1.0, lineLater: 0.3, tutors: 0.5, engines: 0.4, counters: 0.3, faceDown: 0.2, oppHand: -0.3, stolen: 0.3 };
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
      out.lines = r.lines.slice(0, 4).map(l => ({ k: l.key, w: l.when, c: l.cost, m: l.missing.map(short), t: l.tutors.map(short), b: (l.blockedBy || []).map(h => short(h.name)) }));
      out.threats = r.threats.slice(0, 3).map(t => t.title);
      out.mana = r.state.manaNow;
    } catch (e) { /* none */ }
    out.etrata = onBf(g, p, "Etrata, Deadly Fugitive");
    out.cmdZone = !!(p.commanders[0] && p.commanders[0].zone === "command");
    out.landDrop = p.landsPlayed < (g.landDrops ? g.landDrops(p) : 1) && p.hand.some(c => c.def.types.includes("Land"));
    out.ctrs = p.hand.filter(c => ai.COUNTERS.includes(c.def.name)).map(c => c.def.name);
    // what the companion would have said at this moment (it's switched off in practice games)
    try {
      let c = null;
      if (k === "main") c = ai.companion(g, p, { mode: "main" });
      else if (k === "respond" && ctx) c = ai.companion(g, p, { mode: "respond", window: ctx.window, top: ctx.top, turnOf: ctx.turnOf, can: (ctx.actions || []).map(a => a.card && a.card.def.name).filter(Boolean) });
      if (c) { out.stage = c.stage; out.ctitle = c.title; out.urgent = !!c.urgent; out.csteps = (c.steps || []).slice(0, 4).map(x => x.text); }
    } catch (e) { /* optional */ }
    // a tutor: the planner's pick
    if (k === "choose" && ctx && ctx.purpose === "tutor" && ctx.options && ctx.options.length > 1) {
      try {
        const picks = tutorPicks(g, p, ctx.options);
        if (picks[0]) { out.best = picks[0].def.name; out.best2 = picks.slice(1, 2).map(o => o.def.name); const b = ai.bestPiece(g, p, ctx.options); out.bestWhy = b ? ["", "an engine piece", "it starts or advances a line", "it completes a line"][b.rank] || "" : ""; }
      } catch (e) { /* optional */ }
    }
    return out;
  }

  /* The deck's best picks among tutor options, best first (for the what-if analysis). */
  function tutorPicks(g, p, options) {
    const ai = A();
    const out = [];
    const rest = options.slice();
    for (let k = 0; k < 4 && rest.length; k++) {
      const b = ai.bestPiece(g, p, rest);
      if (!b) break;
      out.push(b.c);
      // same-named copies (basics) count once
      for (let i = rest.length - 1; i >= 0; i--) if (rest[i].def.name === b.c.def.name) rest.splice(i, 1);
    }
    return out;
  }

  /* ================================================================ puzzles
     One turn in the real game engine, from a fixed board. The bots block and respond as in a game.
     Each puzzle: me { board, hand, lands, life, library, faceDown }, opps [{ commander, life, board,
     hand, exileHits }], goal, hints, solution, lesson, check(g, me). `script` is how the test solves
     it (tools/sim/test-train.js); the page never reads it. */
  const ETRATA = "Etrata, Deadly Fugitive";
  const basics = (n, a) => Array.from({ length: n }, (_, i) => (a || ["Island", "Swamp"])[i % (a || ["Island", "Swamp"]).length]);
  const won = (g, me) => g.winner === me || g.players.every(q => q === me || q.lost);
  const PUZZLES = [
    { id: "cloak3", title: "Three cloaks", level: 1, rating: 1000, skill: "etrata",
      goal: "Cloak three cards this turn.",
      me: { board: [ETRATA, "Tetsuko Umezawa, Fugitive", "Changeling Outcast", "Virtus the Veiled"], hand: ["Ramses, Assassin Lord"], lands: ["Island", "Island", "Swamp", "Swamp"] },
      opps: [{ commander: "Kaalia of the Vast", life: 31, board: ["Serra Angel", "Serra Angel"] }, { commander: "Lathril, Blade of the Elves", life: 28, board: ["Llanowar Elves", "Elvish Mystic"] }, { commander: "Wilhelt, the Rotcleaver", life: 35, board: [] }],
      hints: ["Etrata cloaks once for each Assassin that deals combat damage to an opponent.", "Tetsuko makes your creatures with power or toughness 1 or less unblockable. Which of your Assassins qualify?", "Ramses gives other Assassins +1/+1. Is that good here?"],
      solution: ["Don't cast Ramses: his +1/+1 makes Virtus a 2/2 and takes away Tetsuko's evasion.", "Attack with Etrata (1/4, toughness doesn't matter: power 1), Virtus (1/1) and Changeling Outcast (can't be blocked anyway).", "Three Assassins connect: three cloak triggers."],
      lesson: "Tetsuko reads power OR toughness 1 or less. Etrata herself is a 1/4, so she's unblockable with Tetsuko. Ramses is a great card, just not before this attack.",
      check: (g, me) => g.controlled(me, o => !!o.faceDown).length >= 3,
      script: [{ attack: ["Etrata, Deadly Fugitive", "Virtus the Veiled", "Changeling Outcast"] }] },
    { id: "court", title: "Court is in session", level: 1, rating: 1100, skill: "lines",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, "Exquisite Blood", "Changeling Outcast"], hand: ["Marauding Blight-Priest", "Counterspell"], lands: ["Swamp", "Swamp", "Island"] },
      opps: [{ commander: "Kaalia of the Vast", life: 19, board: ["Serra Angel"] }, { commander: "Ghired, Conclave Exile", life: 26, board: [] }, { commander: "Isperia, Supreme Judge", life: 33, board: [] }],
      hints: ["Exquisite Blood plus a payoff loops. Which payoff is in your hand?", "The loop needs one opponent to lose life. What can deal damage this turn that can't be blocked?"],
      solution: ["Cast Marauding Blight-Priest ({2}{B}).", "Attack anyone with Changeling Outcast: it can't be blocked.", "One damage: Exquisite Blood gains you 1, Blight-Priest drains each opponent 1, Exquisite Blood triggers for each, and it loops until the table is dead."],
      lesson: "The vampire court needs a starter: any life loss by any opponent. A creature that can't be blocked is the most reliable one.",
      check: won, script: [{ main: "Cast Marauding Blight-Priest" }, { attack: ["Changeling Outcast"] }] },
    { id: "mill-not-loss", title: "Milling isn't losing life", level: 2, rating: 1250, skill: "rules",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, "Exquisite Blood", "Sanguine Bond", "Duskmantle Guildmage"], hand: [], lands: ["Island", "Island", "Island", "Swamp", "Swamp", "Swamp", "Underground River"] },
      opps: [{ commander: "Lathril, Blade of the Elves", life: 24, board: ["Elvish Archdruid", "Llanowar Elves"] }, { commander: "Isperia, Supreme Judge", life: 30, board: ["Serra Angel"] }, { commander: "Wilhelt, the Rotcleaver", life: 22, board: ["Cemetery Reaper"] }],
      hints: ["Exquisite Blood and Sanguine Bond already make the loop. You need one opponent to lose life.", "Duskmantle Guildmage's {2}{U}{B} mills two cards. Is milling losing life?", "What does its other ability do?"],
      solution: ["Activate Duskmantle Guildmage's {1}{U}{B}: this turn, each card put into an opponent's graveyard makes them lose 1 life.", "Then {2}{U}{B}: mill any opponent two cards. They lose 1 life twice.", "Exquisite Blood gains you that life and Sanguine Bond makes an opponent lose it: the loop runs until every opponent is dead."],
      lesson: "Mill alone is not life loss. Guildmage's first ability turns every card into a point of life loss, and that's the starter. Seven mana: {1}{U}{B} plus {2}{U}{B}.",
      check: won, script: [{ main: "Duskmantle Guildmage: ", n: 0 }, { main: "Duskmantle Guildmage: ", n: 1, target: "Lathril" }] },
    { id: "crank-table", title: "Crank the whole table", level: 3, rating: 1450, skill: "lines",
      goal: "Win the game this turn (every opponent).",
      me: { board: [ETRATA, "Mindcrank", "Duskmantle Guildmage"], hand: ["Windfall"], lands: ["Island", "Island", "Swamp", "Swamp", "Watery Grave", "Underground River"] },
      opps: [{ commander: "Ghired, Conclave Exile", life: 30, hand: 3 }, { commander: "Kaalia of the Vast", life: 22, hand: 2 }, { commander: "Lathril, Blade of the Elves", life: 35, hand: 4 }],
      hints: ["Mindcrank and the Guildmage's {1}{U}{B} kill one player per starter. You need a starter for each opponent, this turn.", "What makes every player put cards into their graveyard at once?", "Count your mana: six lands."],
      solution: ["Activate Duskmantle Guildmage's {1}{U}{B} (3 mana).", "Cast Windfall ({2}{U}): every opponent discards their hand.", "Each discarded card costs its owner 1 life, Mindcrank mills them that many, and so on: three loops at once."],
      lesson: "Guildmage's mill only starts one loop. Windfall starts one for every opponent with a card in hand. Activate first, then cast.",
      check: won, script: [{ main: "Duskmantle Guildmage: ", n: 0 }, { main: "Cast Windfall" }] },
    { id: "doubletap", title: "Double tap", level: 2, rating: 1300, skill: "combat",
      goal: "Knock Isperia out of the game this turn.",
      me: { board: [ETRATA, "Bloodletter of Aclazotz", "Virtus the Veiled", "Tetsuko Umezawa, Fugitive"], hand: ["Ramses, Assassin Lord"], lands: ["Island", "Island", "Swamp", "Swamp"] },
      opps: [{ commander: "Isperia, Supreme Judge", life: 37, board: ["Serra Angel", "Angel of Indemnity"] }, { commander: "Kaalia of the Vast", life: 25, board: [] }, { commander: "Wilhelt, the Rotcleaver", life: 31, board: [] }],
      hints: ["Virtus: the player it hits loses half their life, rounded up. Bloodletter doubles life loss on your turn.", "Isperia has fliers that can block. What makes Virtus unblockable?", "Does Ramses help or hurt this attack?"],
      solution: ["Leave Ramses in your hand: he'd make Virtus, an Assassin, a 2/2, and Tetsuko only covers power or toughness 1 or less.", "Attack Isperia with Virtus. Tetsuko makes it unblockable.", "Half of 37 rounded up is 19; Bloodletter doubles it to 38. Isperia is out."],
      lesson: "Half rounded up, doubled, is always at least their whole life total. Keep Virtus a 1/1 for Tetsuko, or use Rogue's Passage.",
      check: (g, me) => g.players.some(q => q !== me && /Isperia/.test(q.name) && q.lost),
      script: [{ attack: [["Virtus the Veiled", "Isperia"]] }] },
    { id: "ramses", title: "Ramses' contract", level: 4, rating: 1650, skill: "lines",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, "Ramses, Assassin Lord", "Bloodletter of Aclazotz", "Virtus the Veiled", "Tetsuko Umezawa, Fugitive"], hand: [], lands: ["Rogue's Passage", "Island", "Island", "Swamp", "Swamp"] },
      opps: [{ commander: "Ghired, Conclave Exile", life: 29, board: ["Serra Angel", "Llanowar Elves"] }, { commander: "Kaalia of the Vast", life: 40, board: ["Angel of Indemnity"] }, { commander: "Lathril, Blade of the Elves", life: 33, board: ["Elvish Archdruid"] }],
      hints: ["Ramses: when a player loses the game, if an Assassin you controlled attacked them this turn, you win.", "Virtus is a 2/2 with Ramses out. Tetsuko won't help. What else makes a creature unblockable?", "Pick one opponent and take all of their life."],
      solution: ["Rogue's Passage ({4}, {T}): Virtus can't be blocked this turn.", "Attack any opponent with Virtus (an Assassin).", "They lose half their life, doubled by Bloodletter: all of it. They lose the game, and Ramses wins it for you."],
      lesson: "With Ramses out, every single-player kill is a win if an Assassin attacked that player. Plan evasion around his +1/+1.",
      check: won, script: [{ main: "Rogue's Passage: ", target: "Virtus the Veiled" }, { attack: [["Virtus the Veiled", "Kaalia"]] }] },
    { id: "brine", title: "Nobody untaps", level: 2, rating: 1350, skill: "etrata",
      goal: "Make every opponent skip their next untap step.",
      me: { board: [ETRATA, "Training Grounds"], faceDown: [{ name: "Brine Elemental", kind: "morph" }, { name: "Vesuvan Shapeshifter", kind: "morph" }], hand: [], lands: ["Island", "Swamp", "Island"] },
      opps: [{ commander: "Talrand, Sky Summoner", life: 34, board: [] }, { commander: "Krenko, Mob Boss", life: 30, board: [] }, { commander: "Ghalta, Primal Hunger", life: 38, board: [] }],
      hints: ["Brine Elemental's morph cost is {5}{U}{U}. You have three lands.", "Etrata gives your face-down creatures a way to turn face up. What does Training Grounds do to it?"],
      solution: ["Use the ability Etrata gives your face-down Brine Elemental: {2}{U}{B}, reduced to {U}{B} by Training Grounds.", "Brine turns face up: each opponent skips their next untap step."],
      lesson: "Training Grounds cuts {2} from creatures' activated abilities (never below one mana): Etrata's flip becomes {U}{B}. Vesuvan's own {1}{U} morph flip is a special action, so Training Grounds doesn't touch it.",
      check: (g, me) => g.players.filter(q => q !== me && !q.lost).every(q => g.controlled(q, o => g.isLand(o)).length > 0 && g.controlled(q, o => g.isLand(o)).every(o => o.skipUntap)),
      script: [{ main: "Face-down Brine Elemental: " }] },
    { id: "manta", title: "One more turn", level: 4, rating: 1700, skill: "lines",
      goal: "Set up an extra turn after this one.",
      me: { board: [ETRATA, "Scroll of Fate", "Crystal Shard"], hand: ["Wormfang Manta"], lands: ["Island", "Island", "Swamp", "Swamp", "Underground River"] },
      opps: [{ commander: "Wilhelt, the Rotcleaver", life: 33, board: [] }, { commander: "Isperia, Supreme Judge", life: 36, board: [] }, { commander: "Lathril, Blade of the Elves", life: 30, board: [] }],
      hints: ["Casting Wormfang Manta makes you skip a turn, and costs 7.", "Scroll of Fate puts it onto the battlefield face down. A face-down creature has no abilities. When does the Manta's leave trigger work?", "Count: Scroll is free to tap, Etrata's flip, Crystal Shard."],
      solution: ["Scroll of Fate ({T}): manifest Wormfang Manta from your hand. No enter trigger: you don't skip a turn.", "Turn it face up with Etrata's ability ({2}{U}{B}).", "Crystal Shard ({U}, {T}): return it to your hand. You decline to pay {1}. It leaves face up: you take an extra turn."],
      lesson: "The Manta must be face up when it leaves, or it has no ability to trigger. Five mana makes one extra turn; Training Grounds makes it three.",
      check: (g, me) => (g.extraTurns || []).some(e => e.p === me) || g.logs.some(e => /extra turn after this one/.test(e.text) && e.p === me),
      script: [{ main: "Scroll of Fate: ", choose: "Wormfang Manta" }, { main: "Face-down Wormfang Manta: " }, { main: "Crystal Shard: ", target: "Wormfang Manta", confirm: false }] },
    { id: "hitlist", title: "The third hit", level: 4, rating: 1750, skill: "rules",
      goal: "Knock Ghired out of the game this turn.",
      me: { board: [ETRATA, "Mari, the Killing Quill", "Etrata, the Silencer"], hand: ["Toxic Deluge"], lands: ["Island", "Swamp", "Swamp", "Swamp"] },
      opps: [{ commander: "Ghired, Conclave Exile", life: 30, board: ["Llanowar Elves"], exileHits: ["Serra Angel", "Cemetery Reaper"] }, { commander: "Kaalia of the Vast", life: 34, board: [] }, { commander: "Isperia, Supreme Judge", life: 36, board: [] }],
      hints: ["Ghired already owns two exiled cards with hit counters. The Silencer's hit adds a third.", "The Silencer's trigger exiles a creature that player controls. What if they have none?", "Mari also offers to remove a hit counter when an Assassin connects. Should you?"],
      solution: ["Don't cast Toxic Deluge: the Silencer needs a creature to exile.", "Attack Ghired with Etrata, the Silencer (it can't be blocked).", "Say no to Mari's offer to remove a hit counter. The Silencer exiles Llanowar Elves with a hit counter: three, and Ghired loses."],
      lesson: "Three exiled cards with hit counters, checked on the Silencer's trigger. Leave them a creature to exile, and don't spend hit counters on Mari's card draw that turn.",
      check: (g, me) => g.players.some(q => /Ghired/.test(q.name) && q.lost),
      script: [{ attack: [["Etrata, the Silencer", "Ghired"]], confirm: false }] },
    { id: "tutor", title: "Find the payoff", level: 3, rating: 1450, skill: "tutor",
      goal: "Win the game this turn.",
      me: { board: [ETRATA, "Exquisite Blood", "Changeling Outcast"], hand: ["Demonic Tutor"], lands: ["Island", "Swamp", "Swamp", "Swamp", "Watery Grave"], library: ["Sanguine Bond", "Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Mindcrank", "Bloodthirsty Conqueror", "Necropotence", "Rhystic Study", "Swamp", "Island"] },
      opps: [{ commander: "Kaalia of the Vast", life: 27, board: [] }, { commander: "Lathril, Blade of the Elves", life: 24, board: [] }, { commander: "Ghalta, Primal Hunger", life: 38, board: [] }],
      hints: ["Exquisite Blood needs a payoff: Blight-Priest, Vito or Sanguine Bond.", "You have five mana. Demonic Tutor costs two. What can you still cast?"],
      solution: ["Demonic Tutor ({1}{B}) for Marauding Blight-Priest or Vito ({2}{B}). Sanguine Bond costs five: too much.", "Cast it, then attack with Changeling Outcast."],
      lesson: "Tutor for the piece you can cast this turn, not the strongest card. Count mana before you search.",
      check: won, script: [{ main: "Cast Demonic Tutor", choose: "Marauding Blight-Priest" }, { main: "Cast Marauding Blight-Priest" }, { attack: ["Changeling Outcast"] }] },
    { id: "freecast", title: "Their wipe, your turn", level: 3, rating: 1550, skill: "etrata",
      goal: "Destroy every creature your opponents control.",
      me: { life: 14, board: [ETRATA], faceDown: [{ name: "Toxic Deluge", kind: "cloak", owner: 1 }, { name: "Cemetery Reaper", kind: "cloak", owner: 2 }], hand: [], lands: ["Island", "Swamp", "Swamp", "Island"] },
      opps: [{ commander: "Kaalia of the Vast", life: 28, board: ["Angel of Indemnity", "Serra Angel"] }, { commander: "Ghalta, Primal Hunger", life: 30, board: ["Old Gnawbone"] }, { commander: "Lathril, Blade of the Elves", life: 31, board: ["Elvish Archdruid", "Llanowar Elves"] }],
      hints: ["You know your face-down cards: one of them is a Toxic Deluge you cloaked from Kaalia.", "A face-down instant or sorcery can't turn face up. What does Etrata's ability do then?", "Toxic Deluge: pay X life. How big is the biggest creature?"],
      solution: ["Use Etrata's ability on the face-down Toxic Deluge ({2}{U}{B}): it can't turn face up, so it's exiled and you cast it without paying its mana cost.", "Pay 7 life: all creatures get -7/-7. Old Gnawbone is a 7/7, so everything dies, Etrata too: that's the price."],
      lesson: "Etrata turns stolen spells into free casts. Look at your cloaks every turn: a wipe on the right turn is worth more than a 2/2.",
      check: (g, me) => g.players.filter(q => q !== me && !q.lost).every(q => g.creatures(q).length === 0),
      script: [{ main: "Face-down Toxic Deluge: ", confirm: true, number: 7 }] }
  ];
  /* The players for a puzzle: you (with a library that starts with p.me.library) and the three bots. */
  function puzzlePlayers(pz, table) {
    const lib = (pz.me.library || []).concat(basics(40));
    const out = [{ name: "You", commander: ETRATA, list: lib, identity: ["U", "B"], human: true, agent: table ? table.humanAgent() : null, deckId: "corrupted-etrata" }];
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
      for (const n of o.exileHits || []) { const c = g.newObj(MK.get(n), q, "exile"); c.hitCounter = true; q.exile.push(c); }
    });
    for (const p of g.players) p.startCards = ["library", "hand", "graveyard", "exile", "command"].reduce((s, z) => s + p[z].length, 0) + g.battlefield.filter(o => o.owner === p && !o.isToken).length;
    g.log(`Puzzle: ${pz.title}. ${pz.goal}`, { kind: "big" });
  }
  // the form game-ui's puzzle mode takes
  const puzzleFor = pz => Object.assign({}, pz, { players: t => puzzlePlayers(pz, t), setup: g => puzzleSetup(pz, g), stopAtTurn: 1, round: 6, seed: 7 });

  /* ================================================================ the mulligan evaluator
     A goldfish: no opponents, just how fast a hand assembles a win line. Each simulated game draws,
     plays a land, casts rocks, Etrata, engines and tutors (a tutor fetches the piece that finishes
     the closest line), and casts combo pieces, until a line can be finished that turn. The hand's
     value is 0.75 × P(a line by turn 8) + 0.25 × P(Etrata by turn 4). Mulligan values come from the
     same model over random hands (tools/sim/mull-values.js writes MULL below), with the free first
     mulligan and the London bottom. */
  const GF_LINES = [
    { key: "vampire", sides: [["Exquisite Blood", "Bloodthirsty Conqueror"], ["Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Sanguine Bond"]], finish: 0 },
    { key: "mindcrank", sides: [["Mindcrank"], ["Duskmantle Guildmage"]], finish: 7 },
    { key: "doubletap", sides: [["Bloodletter of Aclazotz"], ["Virtus the Veiled"]], finish: 0, wait: "Virtus the Veiled" },
    { key: "brine", sides: [["Brine Elemental"], ["Vesuvan Shapeshifter"]], finish: 4, etrata: true, faceDown: true },
    { key: "manta", sides: [["Scroll of Fate"], ["Wormfang Manta"], ["Crystal Shard", "Otawara, Soaring City"]], finish: 5, etrata: true, noCast: ["Wormfang Manta", "Otawara, Soaring City"] }
  ];
  const GF_ROCKS = { "Sol Ring": [1, 2], "Arcane Signet": [2, 1], "Talisman of Dominance": [2, 1], "Dimir Signet": [2, 1], "Fellwar Stone": [2, 1], "Mind Stone": [2, 1], "Mox Amber": [0, 1] };
  const GF_TOP = { "Vampiric Tutor": 1, "Imperial Seal": 1, "Scheming Symmetry": 1, "Lim-Dûl's Vault": 2 };
  const GF_HAND = { "Demonic Tutor": 2, "Grim Tutor": 3, "Diabolic Intent": 2, "Beseech the Mirror": 4 };
  const GF_TRANS = { "Dizzy Spell": 1, "Shred Memory": 2, "Muddle the Mixture": 2, "Drift of Phantasms": 3, "Dimir House Guard": 4 };
  const GF_DRAW = { "Rhystic Study": [3, 1, 99], "Necropotence": [3, 2, 99], "Mystic Remora": [1, 1, 3], "Black Market Connections": [3, 1, 99] };
  const GF_CANTRIP = { "Brainstorm": [1, 1], "Ponder": [1, 1], "Night's Whisper": [2, 2] };
  let GF_DECK = null;
  function gfDeck() {
    if (GF_DECK) return GF_DECK;
    const list = (MK.CETRATA_DECK && MK.CETRATA_DECK.list) || [];
    GF_DECK = list.map(n => { const d = MK.get(n); return { n, land: !!(d && d.types.includes("Land")), mv: d ? d.mv : 0 }; });
    return GF_DECK;
  }
  const mvOf = n => { const d = MK.get(n); return d ? d.mv : 0; };
  function rngFrom(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  /* One goldfish game from a kept hand: returns { win: turn or 0, etrata: turn or 0, lands3: bool }. */
  function goldfish(hand, rnd, maxT) {
    maxT = maxT || 10;
    const deck = gfDeck();
    // library: the deck minus the hand, shuffled
    const pool = deck.map(c => c.n);
    for (const n of hand) { const i = pool.indexOf(n); if (i >= 0) pool.splice(i, 1); }
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const H = hand.slice(), bf = new Set();
    let lands = 0, rocks = 0, etrataT = 0, lands3 = false, winT = 0;
    const draws = [];   // engines: [per turn, turns left]
    const isLand = n => { const d = MK.get(n); return !!(d && d.types.includes("Land")); };
    const has = n => H.includes(n) || bf.has(n);
    const take = n => { const i = H.indexOf(n); if (i >= 0) H.splice(i, 1); };
    const fetch = n => { const i = pool.indexOf(n); if (i >= 0) pool.splice(i, 1); return i >= 0; };
    for (let t = 1; t <= maxT && !winT; t++) {
      // draw (every turn in a multiplayer game) and engines
      if (pool.length) H.push(pool.shift());
      for (const d of draws) if (d[1] > 0) { for (let k = 0; k < d[0] && pool.length; k++) H.push(pool.shift()); d[1]--; }
      // land
      const li = H.findIndex(isLand);
      if (li >= 0) { const n = H.splice(li, 1)[0]; if (n !== "Otawara, Soaring City") lands++; else { lands++; bf.add(n); } }
      if (t === 3 && lands >= 3) lands3 = true;
      let mana = lands + rocks;
      // can a line finish this turn?
      const lineCost = l => {
        if (l.etrata && !bf.has(ETRATA) && mana < 3) return Infinity;
        let c = l.etrata && !bf.has(ETRATA) ? 3 : 0;
        for (const side of l.sides) {
          const onB = side.find(n => bf.has(n));
          if (onB) continue;
          const inH = side.find(n => H.includes(n));
          if (!inH) return Infinity;
          if (l.noCast && l.noCast.includes(inH)) continue;
          if (l.wait === inH) return Infinity;   // cast this turn: summoning sick
          c += l.faceDown ? 3 : mvOf(inH);
        }
        return c + l.finish;
      };
      for (const l of GF_LINES) if (lineCost(l) <= mana) { winT = t; break; }
      if (winT) break;
      const spend = (n, cost) => { if (cost > mana) return false; mana -= cost; take(n); return true; };
      // rocks
      for (const n of Object.keys(GF_ROCKS)) if (H.includes(n)) {
        const [c, add] = GF_ROCKS[n];
        if (n === "Mox Amber" && !bf.has(ETRATA)) continue;
        if (spend(n, c)) { rocks += add; mana += n === "Sol Ring" ? 2 : n === "Mox Amber" ? 1 : 0; bf.add(n); }
      }
      // Etrata
      if (!bf.has(ETRATA) && mana >= 3) { mana -= 3; bf.add(ETRATA); etrataT = etrataT || t; }
      // tutors: the missing piece of the closest line
      const missingOf = l => l.sides.filter(side => !side.some(n => has(n)));
      const ranked = GF_LINES.map(l => ({ l, miss: missingOf(l) })).sort((a, b) => a.miss.length - b.miss.length);
      for (const { l, miss } of ranked) {
        if (miss.length !== 1) continue;
        const want = miss[0].find(n => pool.includes(n));
        if (!want) continue;
        let used = null;
        for (const n of Object.keys(GF_HAND)) if (H.includes(n) && GF_HAND[n] <= mana) { used = n; mana -= GF_HAND[n]; take(n); fetch(want); H.push(want); break; }
        if (!used) for (const n of Object.keys(GF_TOP)) if (H.includes(n) && GF_TOP[n] <= mana) { used = n; mana -= GF_TOP[n]; take(n); fetch(want); pool.unshift(want); break; }
        if (!used) for (const n of Object.keys(GF_TRANS)) if (H.includes(n) && mana >= 3 && GF_TRANS[n] === mvOf(want)) { used = n; mana -= 3; take(n); fetch(want); H.push(want); break; }
        if (!used && H.includes("Tribute Mage") && mvOf(want) === 2 && MK.get(want).types.includes("Artifact") && mana >= 3) { used = "Tribute Mage"; mana -= 3; take("Tribute Mage"); fetch(want); H.push(want); }
        if (used) break;
      }
      // deploy combo pieces of lines we hold a side of (the cheapest first)
      for (const { l } of ranked) for (const side of l.sides) {
        if (side.some(n => bf.has(n))) continue;
        const n = side.find(x => H.includes(x));
        if (!n || (l.noCast && l.noCast.includes(n))) continue;
        const c = l.faceDown ? 3 : mvOf(n);
        if (c <= mana && (l.faceDown || n !== "Exquisite Blood" || mana - c >= 0)) { mana -= c; take(n); bf.add(n); }
      }
      // engines and cantrips with what's left
      for (const n of Object.keys(GF_DRAW)) if (H.includes(n) && GF_DRAW[n][0] <= mana) { mana -= GF_DRAW[n][0]; take(n); bf.add(n); draws.push([GF_DRAW[n][1], GF_DRAW[n][2]]); }
      for (const n of Object.keys(GF_CANTRIP)) if (H.includes(n) && GF_CANTRIP[n][0] <= mana) { mana -= GF_CANTRIP[n][0]; take(n); for (let k = 0; k < GF_CANTRIP[n][1] && pool.length; k++) H.push(pool.shift()); }
    }
    return { win: winT, etrata: etrataT, lands3 };
  }
  /* The value of keeping this hand (after any bottom): goldfish stats over n games. */
  function handValue(hand, opts) {
    opts = opts || {};
    const n = opts.n || 400;
    const rnd = rngFrom(opts.seed != null ? opts.seed : hashStr(hand.slice().sort().join("|")));
    let w6 = 0, w8 = 0, e4 = 0, l3 = 0, sumW = 0, nW = 0;
    const by = new Array(11).fill(0);
    for (let i = 0; i < n; i++) {
      const r = goldfish(hand, rnd, 10);
      if (r.win && r.win <= 6) w6++;
      if (r.win && r.win <= 8) w8++;
      if (r.etrata && r.etrata <= 4) e4++;
      if (r.lands3) l3++;
      if (r.win) { sumW += r.win; nW++; by[r.win]++; }
    }
    const pw8 = w8 / n, pe4 = e4 / n;
    return { value: +(0.75 * pw8 + 0.25 * pe4).toFixed(4), w6: w6 / n, w8: pw8, e4: pe4, l3: l3 / n, avg: nW ? sumW / nW : null, by: by.map(x => x / n) };
  }
  /* Best cards to bottom: greedy, one at a time. */
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
  // Expected value of taking a mulligan, by how many you've already taken (tools/sim/mull-values.js).
  let MULL = null;
  /*MULL*/ MULL = [null,0.66,0.507,0.335,0.106,-0.143,0.15]; /*MULL-END*/
  /* Should you keep? mulls = mulligans already taken (0: the first one is free). */
  function mulliganAdvice(hand, mulls) {
    const k = Math.max(0, mulls - 1);
    const kept = k ? bestBottom(hand, k) : { bottom: [], hand: hand.slice() };
    const v = handValue(kept.hand);
    const lam = MULL && MULL[6] != null ? MULL[6] : 0.1;
    const value = +(v.value - lam * k).toFixed(4);
    const next = MULL && mulls + 1 <= 5 ? MULL[mulls + 1] : null;
    const keep = mulls >= 5 ? true : next == null ? value >= 0.45 : value >= next;
    const margin = next == null ? null : +(value - next).toFixed(4);
    // within 0.08 of the line, either answer is fine: the goldfish can't tell them apart
    return { keep, value, raw: v.value, mull: next, stats: v, bottom: kept.bottom, margin, close: margin != null && Math.abs(margin) < 0.08 };
  }
  /* A random opening hand from the 99 (for the drill), seeded. */
  function dealHand(seed, size) {
    const rnd = rngFrom(seed);
    const pool = gfDeck().map(c => c.n);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, size || 7);
  }

  /* ================================================================ drill generators
     Boards built in the real engine and read by the same planner the coach uses, so every answer is
     what the game itself would say. scenario(seed, opts) returns { g, me }; the drills turn it into a
     question with options, the right answer and an explanation. */
  const PRECON_CMDS = ["Kaalia of the Vast", "Lathril, Blade of the Elves", "Wilhelt, the Rotcleaver", "Ghired, Conclave Exile", "Isperia, Supreme Judge", "Krenko, Mob Boss", "Talrand, Sky Summoner"];
  const OPP_CREATURES = ["Serra Angel", "Llanowar Elves", "Elvish Archdruid", "Cemetery Reaper", "Angel of Indemnity", "Old Gnawbone", "Mischievous Sneakling", "Death Baron", "Archangel of Thune"];
  const DECK_LANDS = ["Watery Grave", "Drowned Catacomb", "Darkslick Shores", "Underground River", "Sunken Hollow", "Command Tower", "Island", "Swamp", "Island", "Swamp"];
  const FILLER = ["Rhystic Study", "Mystic Remora", "Brainstorm", "Ponder", "Night's Whisper", "Counterspell", "Swan Song", "Infernal Grasp", "Deadly Rollick", "Gonti, Night Minister", "Thief of Sanity", "Black Market Connections", "Fallen Shinobi", "Opposition Agent", "Toxic Deluge", "Cyclonic Rift", "Arcane Signet", "Mind Stone"];
  function scenario(seed, opts) {
    opts = opts || {};
    const rnd = rngFrom(seed);
    const pick = a => a[Math.floor(rnd() * a.length)];
    const cmds = PRECON_CMDS.slice().sort(() => rnd() - 0.5).slice(0, 3);
    const players = [{ name: "You", commander: ETRATA, list: basics(30), identity: ["U", "B"], agent: MK.AI.create({ skill: 1 }) }]
      .concat(cmds.map(c => ({ name: short(c), commander: c, list: basics(40, ["Plains", "Forest", "Mountain"]), agent: MK.AI.create({ skill: 1 }) })));
    const g = new MK.Game({ seed: seed + 1, players });
    const me = g.players[0];
    me.deckId = "corrupted-etrata";
    g.turn = 12 + Math.floor(rnd() * 12); g.round = Math.ceil(g.turn / 4); g.phase = "main1"; g.activeIdx = 0;
    const cmd = me.commanders[0];
    if (opts.etrata !== false && rnd() < (opts.etrataP == null ? 0.8 : opts.etrataP)) { g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: me, opts: {} }]); cmd.sick = false; }
    const nLands = opts.lands != null ? opts.lands : 3 + Math.floor(rnd() * 5);
    for (let k = 0; k < nLands; k++) putOn(g, me, DECK_LANDS[k % DECK_LANDS.length]);
    // a line: some of its sides on the battlefield or in hand
    const line = opts.line || pick(GF_LINES);
    const placed = [];
    line.sides.forEach((side, si) => {
      const n = pick(side);
      const r = rnd();
      if (opts.missing === si) return;
      if (r < 0.45) { if (line.faceDown) putOn(g, me, n, { faceDown: "morph" }); else if (!(line.noCast || []).includes(n)) putOn(g, me, n); else { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); } placed.push(n); }
      else if (r < 0.85 || opts.missing != null) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); placed.push(n); }
    });
    if (line.etrata && !onBf(g, me, ETRATA) && rnd() < 0.5) { g.removeFromZone(cmd); cmd.zone = "new"; g.enterMany([{ o: cmd, controller: me, opts: {} }]); cmd.sick = false; }
    if (rnd() < 0.3) putOn(g, me, "Training Grounds");
    for (const n of opts.hand || []) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); }
    const fill = FILLER.slice().sort(() => rnd() - 0.5).slice(0, 1 + Math.floor(rnd() * 3));
    for (const n of fill) { const o = g.newObj(MK.get(n), me, "hand"); me.hand.push(o); }
    if (rnd() < 0.5) putOn(g, me, pick(["Rhystic Study", "Arcane Signet", "Sol Ring", "Black Market Connections", "Tetsuko Umezawa, Fugitive"]));
    g.players.slice(1).forEach(q => {
      q.life = 12 + Math.floor(rnd() * 28);
      const n = Math.floor(rnd() * 3);
      for (let k = 0; k < n; k++) putOn(g, q, pick(OPP_CREATURES));
      for (let k = 0; k < 4; k++) putOn(g, q, ["Plains", "Forest", "Mountain"][k % 3]);
      for (let k = 0; k < 3; k++) { const c = q.library.shift(); c.zone = "hand"; q.hand.push(c); }
    });
    if (opts.hate || rnd() < 0.08) putOn(g, g.players[1 + Math.floor(rnd() * 3)], "Linvala, Keeper of Silence");
    g.bump();
    return { g, me, line };
  }
  const LINE_NAME = { vampire: "Vampire loop", mindcrank: "Mindcrank + Guildmage", doubletap: "Double tap (Bloodletter + Virtus)", brine: "Brine lock", manta: "Infinite turns (Manta)", hitlist: "Hit list" };
  /* What you see in a drill: your board, hand, mana and the table. */
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
  /* Line Spotter: which line wins this turn? Answer from the planner. */
  function lineSpotter(seed) {
    for (let tries = 0; tries < 30; tries++) {
      const s = scenario(seed * 31 + tries);
      const r = A().plan(s.g, s.me);
      const kills = r.lines.filter(l => l.kill && l.when !== "blocked");
      const now = kills.filter(l => l.when === "now");
      // about half the questions should have a live line
      if (!!now.length !== ((seed % 2) === 0) && tries < 20) continue;
      const keys = ["vampire", "mindcrank", "doubletap", "manta"];
      const options = keys.map(k => LINE_NAME[k]).concat(["Nothing wins this turn"]);
      const answer = now.length ? now.map(l => keys.indexOf(l.key)).filter(i => i >= 0) : [4];
      if (!answer.length) continue;
      const best = now[0] || kills[0] || null;
      const blocked = r.lines.filter(l => l.when === "blocked");
      const why = best ? `${now.length ? "Live" : `Closest: ${LINE_NAME[best.key]} (${best.when === "next" ? "next turn" : "later"})`}. ${best.steps.map(x => x.text).join(" ")} It costs ${best.cost} from here and you have ${r.state.manaNow}.` : "No line is within reach: nothing is missing just one piece you can tutor.";
      return { kind: "line", seed, q: "Can you win this turn? If so, with what?", view: describe(s.g, s.me), options, answer, any: true, explain: why + (blocked.length ? ` ${blocked.map(l => `${LINE_NAME[l.key]} is switched off by ${l.blockedBy.map(h => h.owner + "'s " + short(h.name)).join(", ")}.`).join(" ")}` : ""), cards: best ? best.steps.flatMap(x => x.cards || []).slice(0, 4) : [] };
    }
    return null;
  }
  /* Tutor Target: one tutor in hand, four candidates; the right one makes a line soonest. */
  const DRILL_TUTORS = ["Demonic Tutor", "Grim Tutor", "Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard", "Dizzy Spell"];
  function tutorTarget(seed) {
    const ai = A();
    for (let tries = 0; tries < 40; tries++) {
      const rnd = rngFrom(seed * 97 + tries);
      const tutor = DRILL_TUTORS[Math.floor(rnd() * DRILL_TUTORS.length)];
      const line = GF_LINES[Math.floor(rnd() * GF_LINES.length)];
      const miss = Math.floor(rnd() * line.sides.length);
      const s = scenario(seed * 97 + tries, { line, missing: miss, hand: [tutor], lands: 4 + Math.floor(rnd() * 4), etrataP: 0.9 });
      const tcost = MK.get(tutor).mv;
      const t = TUTORS_ALL[tutor];
      const pool = [...new Set(MK.CETRATA_DECK.list)].filter(n => !s.me.hand.some(c => c.def.name === n) && !s.g.battlefield.some(o => o.controller === s.me && (o.cardDef || o.def).name === n) && !/^(Island|Swamp)$/.test(n));
      const findable = pool.filter(n => t.any || MK.get(n).mv === t.mv);
      // score each findable card: put it in hand, read the plan, mana left after the tutor
      const score = n => {
        const o = s.g.newObj(MK.get(n), s.me, "hand"); s.me.hand.push(o); s.g.bump();
        const r = ai.plan(s.g, s.me);
        s.me.hand.splice(s.me.hand.indexOf(o), 1); s.g.bump();
        const avail = r.state.manaNow - tcost;
        let best = 9, line2 = null;
        for (const l of r.lines.filter(l => l.kill && l.when !== "blocked" && !l.missing.length)) {
          const w = l.mana <= avail && l.when === "now" ? 0 : l.mana <= r.state.manaNext ? 1 : 2;
          if (w < best || (w === best && line2 && l.mana < line2.mana)) { best = w; line2 = l; }
        }
        return { n, w: best, l: line2 };
      };
      const scored = findable.map(score).filter(x => x.l).sort((a, b) => a.w - b.w || a.l.mana - b.l.mana);
      if (!scored.length) continue;
      const top = scored[0];
      if (scored.length > 1 && scored[1].w === top.w && scored[1].l.mana === top.l.mana && scored[1].l.key !== top.l.key) continue;   // two equal answers: skip
      // distractors: other combo pieces and engines, some the tutor can't even find
      const wrongs = pool.filter(n => n !== top.n && !scored.some(x => x.n === n && x.w === top.w)).sort(() => rnd() - 0.5);
      const pieceish = wrongs.filter(n => ai.COMBO_NAMES.has(n) || ai.ENGINES.includes(n) || GF_LINES.some(l => l.sides.flat().includes(n)));
      const opts = [top.n].concat(pieceish.slice(0, 2), wrongs.filter(n => !pieceish.includes(n)).slice(0, 1)).slice(0, 4);
      while (opts.length < 4 && wrongs.length) { const n = wrongs.shift(); if (!opts.includes(n)) opts.push(n); }
      const order = opts.slice().sort(() => rnd() - 0.5);
      const cantFind = order.filter(n => !(t.any || MK.get(n).mv === t.mv));
      const when = top.w === 0 ? "this turn" : top.w === 1 ? "next turn" : "later";
      return { kind: "tutor", seed, tutor, q: `You cast ${tutor}. What do you fetch?`, view: describe(s.g, s.me), options: order, answer: [order.indexOf(top.n)],
        explain: `${top.n} completes ${LINE_NAME[top.l.key] || top.l.title} ${when}: it costs ${top.l.cost} after the ${tutor} ({${tcost}}), from ${describe(s.g, s.me).mana} mana.${t.mv != null ? ` ${tutor} transmutes for mana value ${t.mv} only${cantFind.length ? `, so ${cantFind.join(" and ")} ${cantFind.length > 1 ? "aren't" : "isn't"} even findable` : ""}.` : ""}`,
        cards: [tutor, top.n] };
    }
    return null;
  }
  const TUTORS_ALL = { "Demonic Tutor": { any: true }, "Grim Tutor": { any: true }, "Shred Memory": { mv: 2 }, "Muddle the Mixture": { mv: 2 }, "Drift of Phantasms": { mv: 3 }, "Dimir House Guard": { mv: 4 }, "Dizzy Spell": { mv: 1 } };

  /* Clock Math: numbers that decide games, generated fresh each time. */
  function clockMath(seed) {
    const rnd = rngFrom(seed * 13 + 5);
    const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));
    const kinds = ["virtus", "virtusOff", "crank", "flip", "tax", "hits", "court", "rally"];
    const k = kinds[seed % kinds.length];
    const opts4 = (right, xs) => { const set = [right]; for (const x of xs) if (!set.includes(x) && x >= 0) set.push(x); while (set.length < 4) { const y = right + ri(1, 6) * (rnd() < 0.5 ? -1 : 1); if (y >= 0 && !set.includes(y)) set.push(y); } const o = set.slice(0, 4).sort((a, b) => a - b); return { options: o.map(String), answer: [o.indexOf(right)] }; };
    if (k === "virtus") {
      const L = ri(13, 39);
      const right = Math.ceil(L / 2) * 2;
      const o = opts4(right, [Math.ceil(L / 2), Math.floor(L / 2) * 2, L]);
      return { kind: "math", seed, q: `Your turn. Bloodletter of Aclazotz is out, and Virtus the Veiled connects with an opponent at ${L} life. How much life do they lose in total?`, ...o, explain: `Half of ${L}, rounded up, is ${Math.ceil(L / 2)}. Bloodletter doubles it on your turn: ${right}. That's ${right >= L ? "their whole life total: they're out" : "not quite all"}. Half rounded up, doubled, always covers it.`, cards: ["Virtus the Veiled", "Bloodletter of Aclazotz"] };
    }
    if (k === "virtusOff") {
      const L = ri(13, 39);
      const right = Math.ceil(L / 2);
      const o = opts4(right, [right * 2, Math.floor(L / 2), L]);
      return { kind: "math", seed, q: `An opponent's turn: your Virtus the Veiled blocks nothing, but an effect lets it deal combat damage to a player at ${L} life during their turn while Bloodletter of Aclazotz is out. How much life do they lose?`, ...o, explain: `Bloodletter only doubles life loss during your turn. Virtus alone: half of ${L}, rounded up, ${right}.`, cards: ["Bloodletter of Aclazotz"] };
    }
    if (k === "crank") {
      const L = ri(15, 35), lib = ri(8, 40);
      const dies = lib >= L;
      return { kind: "math", seed, q: `Mindcrank is out and you've activated Duskmantle Guildmage's {1}{U}{B}. You use its {2}{U}{B} on an opponent with ${L} life and ${lib} cards in their library. Do they die right now?`, options: ["Yes", "No, they survive with an empty library"], answer: [dies ? 0 : 1], explain: `Each card that hits their graveyard costs 1 life, so ${L} life needs ${L} cards. They have ${lib}. ${dies ? "Enough: they're dead." : `Not enough: they mill out at ${L - lib} life and lose only when they next draw.`}`, cards: ["Mindcrank", "Duskmantle Guildmage"] };
    }
    if (k === "flip") {
      const tg = rnd() < 0.6;
      const right = tg ? 4 : 7;
      const o = opts4(right, tg ? [7, 5, 3] : [4, 8, 6]);
      return { kind: "math", seed, q: `Etrata is out${tg ? " with Training Grounds" : ""}. How much mana to flip your face-down Brine Elemental with Etrata's ability AND activate Duskmantle Guildmage's {1}{U}{B} this turn?`, ...o, explain: tg ? "Training Grounds takes {2} off creatures' activated abilities, never below one mana: Etrata's flip {2}{U}{B} becomes {U}{B} and the Guildmage's {1}{U}{B} becomes {U}{B}. 2 + 2 = 4." : "Etrata's flip is {2}{U}{B} (4) and the Guildmage's ability is {1}{U}{B} (3): 7. Training Grounds would make it 4.", cards: ["Training Grounds", "Etrata, Deadly Fugitive"] };
    }
    if (k === "tax") {
      const n = ri(1, 4);
      const right = 3 + 2 * n;
      const o = opts4(right, [3 + n, 3 + 2 * (n - 1), 3 + 2 * (n + 1)]);
      return { kind: "math", seed, q: `Etrata has been cast from the command zone ${n} time${n > 1 ? "s" : ""} before. What does she cost now?`, ...o, explain: `{1}{U}{B} plus {2} for each earlier cast from the command zone: 3 + ${2 * n} = ${right}.`, cards: ["Etrata, Deadly Fugitive"] };
    }
    if (k === "hits") {
      const have = ri(0, 2), creatures = ri(0, 2);
      const out = creatures > 0 && have >= 2;
      return { kind: "math", seed, q: `An opponent owns ${have} exiled card${have === 1 ? "" : "s"} with hit counters and controls ${creatures} creature${creatures === 1 ? "" : "s"}. Etrata, the Silencer connects with them. Are they out of the game?`, options: ["Yes", "No"], answer: [out ? 0 : 1], explain: creatures === 0 ? "The Silencer's trigger exiles a creature that player controls. They have none, so no hit counter is added: nothing happens." : `It exiles one of their creatures with a hit counter: ${have + 1} in total. They lose at three${out ? ": they're out." : ", so not yet."}`, cards: ["Etrata, the Silencer"] };
    }
    if (k === "court") {
      const opps = ri(2, 3), loss = ri(1, 4);
      return { kind: "math", seed, q: `Exquisite Blood and Marauding Blight-Priest are out. One of your ${opps} opponents loses ${loss} life to a shock land. What happens?`, options: ["You gain " + loss + " and it stops", "Every opponent loses 1 and it stops", "The loop runs until every opponent is dead", "Nothing: paying life isn't losing it"], answer: [2], explain: `Paying life is losing life. You gain ${loss}, Blight-Priest makes each opponent lose 1, each of those is new life loss for Exquisite Blood: gain, drain, gain, drain, until every opponent is at 0.`, cards: ["Exquisite Blood", "Marauding Blight-Priest"] };
    }
    const L = ri(10, 30), n = ri(2, 4);
    const right = Math.max(0, L - n * 2);
    const o = opts4(right, [L - n, L - n * 3, L]);
    return { kind: "math", seed, q: `Your turn: Bloodletter of Aclazotz is out and you gain life ${n} times (separate events) with Marauding Blight-Priest out. An opponent started at ${L}. Where are they now?`, ...o, explain: `Blight-Priest makes each opponent lose 1 per life-gain event; Bloodletter doubles each to 2 during your turn. ${n} × 2 = ${n * 2}: ${L} − ${n * 2} = ${right}.`, cards: ["Marauding Blight-Priest", "Bloodletter of Aclazotz"] };
  }

  /* ================================================================ the review
     review(rec) reads a recorded game: what happened (stats), the moments to look at again (flags)
     and, for each skill, how many chances you had and how many you took (evidence). Every flag
     points at a moment (its answer index i) so the page can replay it, analyze it or let you retry. */
  const SKILLS = [
    { id: "mull", name: "Mulligans", blurb: "Keeping hands that win, shipping hands that don't." },
    { id: "tempo", name: "Mana and tempo", blurb: "Land drops, rocks, Etrata on time, no wasted mana." },
    { id: "lines", name: "Seeing the win", blurb: "Spotting live lines and taking them." },
    { id: "tutor", name: "Tutoring", blurb: "Fetching the piece that wins soonest." },
    { id: "etrata", name: "Etrata and face-down play", blurb: "Cloaks, flips, free casts, flash timing." },
    { id: "stack", name: "The stack", blurb: "Countering what matters, saving counters otherwise." },
    { id: "combat", name: "Combat and threats", blurb: "Who to hit, what to block, keeping Etrata alive." },
    { id: "rules", name: "Rules knowledge", blurb: "Knowing exactly how the pieces work." }
  ];
  const FLASH = ["Opposition Agent", "Notion Thief"];
  const isInstantName = n => { const d = MK.get(n); return !!d && (d.types.includes("Instant") || (d.keywords || []).includes("flash") || FLASH.includes(n)); };
  function review(rec) {
    const ms = rec.moments || [];
    const log = rec.log || [];
    const flags = [];
    const ev = {};
    SKILLS.forEach(s => { ev[s.id] = { ok: 0, n: 0 }; });
    const took = (s, ok, w) => { w = w || 1; ev[s].n += w; if (ok) ev[s].ok += w; };
    const flag = (f) => flags.push(Object.assign({ sev: 2 }, f));
    const hero = rec.hero;
    // turns: which game turns were yours, and your turn count
    const myTurns = [];
    let tcount = 0;
    for (const m of ms) if (m.mine && !myTurns.includes(m.t)) myTurns.push(m.t);
    myTurns.sort((a, b) => a - b);
    const ownTurn = t => myTurns.indexOf(t) + 1;
    const byTurn = new Map();
    for (const m of ms) { if (!byTurn.has(m.t)) byTurn.set(m.t, []); byTurn.get(m.t).push(m); }
    const res = rec.result || {};
    // the log, by turn
    const turnOfLog = [];
    let curT = 0;
    for (const [k, p, text] of log) { if (k === "turn") { const mt = /^Turn (\d+)/.exec(text); if (mt) curT = +mt[1]; } turnOfLog.push(curT); }
    const logIn = (t, re) => log.some(([k, p, text], i) => turnOfLog[i] === t && re.test(text));
    const wonOnTurn = t => res.win && res.turn === t;

    // ---- mulligans: the goldfish evaluator's call
    for (const m of ms.filter(x => x.k === "mulligan" && !x.replayed)) {
      let adv = null;
      try { adv = mulliganAdvice(m.hand, m.mulls || 0); } catch (e) { adv = null; }
      if (!adv) continue;
      m.adv = { keep: adv.keep, value: adv.value, mull: adv.mull, w8: adv.stats.w8, e4: adv.stats.e4 };
      const kept = m.ans === "Keep";
      const close = adv.close;
      took("mull", kept === adv.keep || close);
      if (kept !== adv.keep && !close) flag({ id: "mull", skill: "mull", sev: Math.abs(adv.margin) > 0.12 ? 3 : 2, i: m.i, r: 0, title: kept ? "Kept a hand the model would ship" : "Shipped a hand the model would keep", text: `This hand reaches a win line by turn 8 in ${Math.round(adv.stats.w8 * 100)}% of goldfish games and has Etrata out by turn 4 in ${Math.round(adv.stats.e4 * 100)}%. Its value is ${Math.round(adv.value * 100)}; a mulligan here is worth ${Math.round(adv.mull * 100)} on average.`, drill: "mulligan" });
    }
    // ---- your turns
    let etrataCast = 0, etrataWindow = null;
    for (const t of myTurns) {
      const list = byTurn.get(t).filter(m => m.mine && !m.replayed);
      const mains = list.filter(m => m.k === "main");
      if (!mains.length) continue;
      const last = mains[mains.length - 1];
      const own = ownTurn(t);
      // land drops and leftover mana at the end of the turn
      if (last.landDrop) { took("tempo", false); flag({ id: "land", skill: "tempo", i: last.i, r: last.r, title: "Missed a land drop", text: `You ended turn ${own} with a land in hand and no land played. One land a turn is the cheapest mana you'll ever get.`, drill: "lines" }); }
      else took("tempo", true);
      const sorc = (last.acts || []).filter(a => /^Cast /.test(a)).map(a => a.replace(/^Cast /, "").replace(/ face down$/, "")).filter(n => !isInstantName(n));
      const held = (last.ctrs || []).length;
      if (last.ph === "main2" && (last.mana || 0) >= 3 + (held ? 2 : 0) && sorc.length) { took("tempo", false, 0.5); flag({ id: "float", skill: "tempo", sev: 1, i: last.i, r: last.r, title: `Passed with ${last.mana} mana up`, text: `You could still cast ${sorc.slice(0, 3).join(", ")}.${held ? ` Holding up ${last.ctrs[0]} is fine, but you had more than enough for both.` : ""} Mana you don't use this turn is gone.` }); }
      // a win on the table that wasn't taken
      const go = mains.find(m => m.stage === "Go off");
      if (go) {
        if (wonOnTurn(t) || logIn(t, /wins the game/)) took("lines", true, 2);
        else { took("lines", false, 2); flag({ id: "missedwin", skill: "lines", sev: 3, i: go.i, r: go.r, title: `A win was live: ${go.ctitle.replace(/^Win now: /, "")}`, text: `On your turn ${own} (round ${go.r}) the planner saw a line you could finish that turn, and the turn ended without the win. ${(go.lines && go.lines[0]) ? `It needed ${go.lines[0].c} from ${go.mana} mana.` : ""}`, drill: "lines" }); }
      }
      // Etrata on time
      const etr = mains.find(m => m.ans === "Cast Etrata, Deadly Fugitive");
      if (etr && !etrataCast) etrataCast = own;
      if (!etrataCast && own <= 3) { const could = mains.find(m => (m.acts || []).includes("Cast Etrata, Deadly Fugitive")); if (could && !etrataWindow) etrataWindow = { m: could, own }; }
      // flash creatures cast in your own main phase
      for (const m of mains) for (const n of FLASH) if (m.ans === "Cast " + n) { took("etrata", false, 0.5); flag({ id: "flash", skill: "etrata", sev: 1, i: m.i, r: m.r, title: `${short(n)} cast at sorcery speed`, text: `${n} has flash. Cast at the end of the turn before yours, it's online for your turn and nobody gets a turn to answer it first.` }); }
      // Wishclaw on a turn you didn't win
      for (const m of mains) if (/^Wishclaw Talisman:/.test(m.ans) && !wonOnTurn(t)) { took("tutor", false); flag({ id: "wishclaw", skill: "tutor", sev: 2, i: m.i, r: m.r, title: "Wishclaw used on a turn you didn't win", text: "Wishclaw goes to an opponent after you use it, and they get to tutor with it on their turn. Use it the turn you go off." }); }
      // hate on the table with an answer in hand, not used
      const hate = mains.find(m => (m.threats || []).some(x => /Linvala|Rest in Peace|Leyline of the Void|Cursed Totem|Null Rod|Collector Ouphe|Stony Silence|Hushbringer|Torpor Orb/.test(x)) && (m.acts || []).some(a => /Infernal Grasp|Deadly Rollick|Cyclonic Rift|Otawara/.test(a)));
      if (hate && !mains.some(m => /Infernal Grasp|Deadly Rollick|Cyclonic Rift|Otawara/.test(m.ans))) { took("lines", false); flag({ id: "hate", skill: "lines", sev: 2, i: hate.i, r: hate.r, title: "A hate piece stayed on the table", text: `${hate.threats.join("; ")}. You had an answer you could cast and kept it.` }); }
    }
    if (etrataCast) took("tempo", etrataCast <= 3);
    if (etrataWindow && (!etrataCast || etrataCast > etrataWindow.own)) flag({ id: "etrata", skill: "tempo", sev: 2, i: etrataWindow.m.i, r: etrataWindow.m.r, title: "Etrata could have come down sooner", text: `You could cast Etrata on your turn ${etrataWindow.own} and ${etrataCast ? `cast her on turn ${etrataCast}` : "never cast her"}. She makes every flip cheaper and turns each Assassin hit into a stolen card.` });
    // ---- their spells: what you countered and what you let through
    for (const m of ms.filter(x => x.k === "respond" && !x.replayed && x.top && x.top.p !== hero && x.top.p >= 0)) {
      const countered = m.ans !== "Pass" && /Counterspell|Swan Song|Fierce Guardianship|An Offer You Can't Refuse/.test(m.ans);
      if (m.urgent) {
        took("stack", countered, 2);
        if (!countered) flag({ id: "nocounter", skill: "stack", sev: 3, i: m.i, r: m.r, title: `Let ${m.top.n} resolve`, text: `${m.ctitle || m.top.n}. You held ${(m.ctrs || []).join(", ") || "a counter"} and passed.`, drill: "stack" });
      } else if (m.ctitle && countered && !/win|wipe|targets your/i.test(m.ctitle)) {
        took("stack", false);
        flag({ id: "wastecounter", skill: "stack", sev: 1, i: m.i, r: m.r, title: `Spent a counter on ${m.top.n}`, text: `It didn't hit a combo piece, wipe the board or win. Counters are for wipes, removal on your pieces, and winning spells.`, drill: "stack" });
      } else if (!countered) took("stack", true, 0.5);
    }
    // ---- tutor picks
    for (const m of ms.filter(x => x.k === "choose" && !x.replayed && x.q && x.q.purpose === "tutor" && x.best)) {
      const ok = m.ans === m.best || (m.best2 || []).includes(m.ans);
      took("tutor", ok);
      if (!ok) flag({ id: "tutorpick", skill: "tutor", sev: 2, i: m.i, r: m.r, title: `Tutored ${m.ans} with ${m.q.src}`, text: `The planner's pick was ${m.best}${m.bestWhy ? `: ${m.bestWhy}` : ""}.`, drill: "tutor" });
    }
    // ---- blocks
    for (const m of ms.filter(x => x.k === "block" && !x.replayed)) {
      const dmg = (m.inc || []).reduce((a, x) => a + x.pw, 0);
      const myLife = m.life[hero];
      if (dmg >= myLife) { const ok = m.ans !== "No blocks"; took("combat", ok, 2); if (!ok) flag({ id: "lethalblock", skill: "combat", sev: 3, i: m.i, r: m.r, title: "No blocks against lethal damage", text: `${dmg} damage was coming at you at ${myLife} life.` }); }
      else took("combat", true, 0.3);
    }
    // ---- Etrata in combat (the log)
    let etrataDied = 0;
    for (let k = 0; k < log.length; k++) if (/Etrata, Deadly Fugitive (dies|is put into the command zone|goes to the command zone|is exiled)/.test(log[k][2])) etrataDied++;
    const attackedWithEtrata = ms.filter(m => m.k === "attack" && /Etrata, Deadly Fugitive/.test(m.ans || "")).length;
    if (attackedWithEtrata) took("combat", etrataDied < attackedWithEtrata);
    // ---- slow down on the moments that matter
    for (const m of ms.filter(x => !x.replayed && (x.stage === "Go off" || x.urgent) && x.ms != null && x.ms < 2500)) flag({ id: "fast", skill: "lines", sev: 1, i: m.i, r: m.r, title: "A key moment, answered in under three seconds", text: "The coach marked this as a moment that matters. Take a breath and count the table's open mana first.", info: true });
    // ---- stats
    const cnt = re => log.filter(([k, p, t]) => p === hero && re.test(t)).length;
    const think = {};
    for (const m of ms.filter(x => !x.replayed && x.ms != null)) { const t = think[m.k] = think[m.k] || { n: 0, ms: 0 }; t.n++; t.ms += Math.min(m.ms, 120000); }
    const wps = ms.filter(m => m.mine && m.k === "main" && m.wp != null);
    const stats = {
      win: !!res.win, rounds: res.rounds || 0, turns: myTurns.length, etrataTurn: etrataCast || null, etrataLost: etrataDied,
      cloaks: cnt(/cloaks/), flips: cnt(/turns .* face up/), spells: cnt(/^You casts /), stolen: cnt(/without paying its mana cost/),
      think: Object.fromEntries(Object.entries(think).map(([k, v]) => [k, Math.round(v.ms / v.n)])),
      wpStart: wps.length ? wps[0].wp : null, wpPeak: wps.length ? Math.max(...wps.map(m => m.wp)) : null, wpEnd: wps.length ? wps[wps.length - 1].wp : null
    };
    // biggest drops in the win chance between your consecutive decisions
    const swings = [];
    const seq = ms.filter(m => m.wp != null && !m.replayed);
    for (let k = 1; k < seq.length; k++) { const d = seq[k].wp - seq[k - 1].wp; if (Math.abs(d) >= 0.05) swings.push({ i: seq[k - 1].i, to: seq[k].i, r: seq[k - 1].r, d: +d.toFixed(3), mine: seq[k - 1].mine }); }
    swings.sort((a, b) => a.d - b.d);
    flags.sort((a, b) => b.sev - a.sev || a.i - b.i);
    return { flags, ev, stats, swings: swings.slice(0, 8) };
  }
  /* Moments worth a deep look: flagged ones first, then the biggest swings, then the go-off turns. */
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

  const T = { id: "corrupted-etrata", FEATURES, features, winProb, snap, tutorPicks, PUZZLES, puzzleFor, goldfish, handValue, bestBottom, mulliganAdvice, dealHand, scenario, describe, lineSpotter, tutorTarget, clockMath, review, criticalMoments, SKILLS, setMULL: m => { MULL = m; }, getMULL: () => MULL, puzzlePlayers, puzzleSetup, setWP: w => { WP = w; }, getWP: () => WP };
  (MK.TRAIN = MK.TRAIN || {})["corrupted-etrata"] = T;
  MK.CETRATA_TRAIN = T;
})(typeof window !== "undefined" ? window : globalThis);
