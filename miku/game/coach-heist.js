/* The coach for the Etrata heist closer (decks-heist.js, deck "etrata-heist-aggro"), the list the Corrupted Etrata
   site is built around: the Coach's "Look for" tips, the turn planner behind its Plan tab and the companion that
   walks you through each stage of a game. It follows the nine piloting rules of the research report
   (research/etrata-theft-aggro/local/REPORT.md): mulligan is the default, Etrata when an Assassin connects, Ramses
   first, don't wait to protect him, the last counter for the wrath, everything in once Teferi's Veil is out, one
   player at a time, flip rarely, no mana held for one-shots.
   It also makes the deck a hero on the Corrupted Etrata site (alsoOn) and registers MK.HEIST_AI for the Train tab. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const deck = MK && MK.ETRATA_HEIST_DECK;
  if (!deck) return;
  const DECK_ID = deck.id;
  const pc = s => MK.parseCost(s);
  const ETRATA = "Etrata, Deadly Fugitive", RAMSES = "Ramses, Assassin Lord", BLOOD = "Bloodletter of Aclazotz", VEIL = "Teferi's Veil";
  const short = n => String(n).split(",")[0];
  const list = names => names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " or " + names[names.length - 1];
  const and = names => names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
  const nameOf = o => (o.cardDef || o.def).name;
  const onBf = (g, p, n) => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n);
  const bfObj = (g, p, n) => g.battlefield.find(o => o.controller === p && !o.faceDown && o.def.name === n) || null;
  const inHand = (p, n) => p.hand.some(c => c.def.name === n);
  const have = (g, p, n) => onBf(g, p, n) || inHand(p, n);
  const isAssassin = (g, o) => (MK.isAssassin ? MK.isAssassin(g, o) : !!o && g.hasSub(o, "Assassin"));
  const liveOpps = (g, p) => g.opponents(p).filter(q => !q.lost);
  const manaNow = (g, p) => { try { return g.maxX(p, pc(""), 1); } catch (e) { return g.controlled(p, o => g.isLand(o) && !o.tapped).length; } };
  function manaNext(g, p) {
    let n = 0;
    try { n = g.manaAfterUntap(p, null).total; } catch (e) { n = manaNow(g, p); }
    if (p.hand.some(c => c.def.types.includes("Land")) && p.landsPlayed >= 1) n++;
    return n;
  }
  const costN = c => { const o = pc(c || ""); return o.g + o.C + o.hyb.length + o.phy.length + o.W + o.U + o.B + o.R + o.G; };
  const cardCost = n => { const d = MK.get(n); return d ? d.cost || "" : ""; };
  function addCost(...cs) {
    let n = 0; const col = [];
    for (const c of cs) { const o = pc(c || ""); n += o.g + o.C + o.hyb.length + o.phy.length; for (const k of ["W", "U", "B", "R", "G"]) for (let i = 0; i < o[k]; i++) col.push(k); }
    col.sort((a, b) => "WUBRG".indexOf(a) - "WUBRG".indexOf(b));
    return (n || !col.length ? `{${n}}` : "") + col.map(k => `{${k}}`).join("");
  }
  const payNow = (g, p, cost) => { try { return g.canPay(p, pc(cost || "{0}")); } catch (e) { return true; } };
  function payNext(g, p, cost) { try { return g.manaAfterUntap(p, pc(cost || "{0}")).can || costN(cost) <= manaNext(g, p); } catch (e) { return true; } }

  /* ================================================================ the deck's card groups */
  const GENERAL_TUTORS = ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Demonic Consultation"];
  const TOP_TUTORS = ["Vampiric Tutor", "Imperial Seal"];
  const ALL_TUTORS = GENERAL_TUTORS.concat(["Pyre of Heroes", "Reanimate"]);
  const COUNTERS = ["Force of Will", "Fierce Guardianship", "Force of Negation", "Swan Song", "Reverse the Polarity"];
  const REMOVAL = ["Deadly Rollick", "Snuff Out", "Cyclonic Rift", "Kindred Dominance"];
  const ROCKS = ["Sol Ring", "Mox Amber", "Chrome Mox", "Lotus Petal", "Dark Ritual", "Arcane Signet", "Talisman of Dominance"];
  const ENGINES = ["Rhystic Study", "Mystic Remora", "Dark Confidant", "Satoru, the Infiltrator", "They Came from the Pipes", "Roaming Throne", "Coat of Arms"];
  const TYPERS = ["Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"];
  const HALVERS = ["Virtus the Veiled", "Unstoppable Slasher", "Quietus Spike"];
  const DRAINS = ["Exquisite Blood", "Bloodthirsty Conqueror"], PAYOFFS = ["Sanguine Bond", "Vito, Thorn of the Dusk Rose"];
  const CHEAP = ["Changeling Outcast", "Hired Poisoner", "Slither Blade", "Mothdust Changeling", "Tetsuko Umezawa, Fugitive", "Satoru, the Infiltrator", "Brotherhood Spy", "Reno and Rude", "Basim Ibn Ishaq"];
  const KEEP_HOME = new Set(["Bloodletter of Aclazotz", "Vito, Thorn of the Dusk Rose", "Tetsuko Umezawa, Fugitive", "Dark Confidant", "Satoru, the Infiltrator"]);
  const LINES = [
    { key: "ramses", title: "Ramses: one death wins the game", short: "Ramses kill", sides: [[RAMSES]] },
    { key: "halve", title: "Bloodletter + a halver: one hit takes all their life", short: "Halve + double", sides: [[BLOOD], HALVERS] },
    { key: "loop", title: "The drain loop: Exquisite Blood or Conqueror + Sanguine Bond or Vito", short: "Drain loop", sides: [DRAINS, PAYOFFS] }
  ];
  const COMBO_NAMES = new Set([].concat(...LINES.map(l => [].concat(...l.sides))));

  /* The tutors p holds (or Pyre of Heroes on the battlefield) that can find this card. */
  function findersFor(g, p, name) {
    const d = MK.get(name);
    const out = GENERAL_TUTORS.filter(n => inHand(p, n));
    const pyre = bfObj(g, p, "Pyre of Heroes");
    if (pyre && !pyre.tapped && d && d.types.includes("Creature") && d.mv > 0 && g.creatures(p).some(c => !c.faceDown && c.def.mv === d.mv - 1 && isAssassin(g, c) && (d.subtypes.includes("Assassin") || d.changeling))) out.push("Pyre of Heroes");
    if (d && d.types.includes("Creature") && inHand(p, "Reanimate") && g.players.some(q => q.graveyard.some(c => c.def.name === name))) out.push("Reanimate");
    return [...new Set(out)];
  }
  /* The Assassins that could attack this turn (summoning sickness, tapped) and the opponent the attack would kill. */
  function attackers(g, p) { return g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")) && !(c.def.defender)); }
  function markFor(g, p) {
    const B = MK.HEIST_BRAIN;
    try { if (B && B.pickMark) return B.pickMark(g, p, attackers(g, p)); } catch (e) { /* none */ }
    return liveOpps(g, p).slice().sort((a, b) => a.life - b.life)[0] || null;
  }
  function killNow(g, p, q, bonus) {
    const M = MK.HEIST_MODEL;
    if (!M || !q) return null;
    try { return M.outcome(g, p, q, attackers(g, p), undefined, bonus); } catch (e) { return null; }
  }

  /* ================================================================ the turn planner
     plan(g, p) -> { state, lines, threats, risk } in the shape the game's Coach "Plan" tab shows (see the
     Corrupted Etrata planner in decks-cetrata.js). Lines: { key, when (now, next, later), title, short, kill, cost,
     mana, steps, tutors, missing, blockedBy }. */
  let planKey = null, planVal = null;
  function plan(g, p) {
    const key = g.v != null ? (g.idBase || 0) + ":" + g.v + ":" + p.id + ":" + g.phase + ":" + (g.active && g.active.id) : null;
    if (key && key === planKey) return planVal;
    const myTurn = g.active === p, preCombat = myTurn && (g.phase === "main1" || g.phase === "upkeep" || g.phase === "draw");
    const now = manaNow(g, p), next = manaNext(g, p);
    const mark = markFor(g, p);
    const ramsesOut = onBf(g, p, RAMSES);
    const assassinsReady = attackers(g, p).filter(c => isAssassin(g, c));
    const lines = [];
    for (const l of LINES) {
      const pieces = l.sides.map(side => side.find(n => onBf(g, p, n)) || side.find(n => inHand(p, n)) || null);
      const missing = l.sides.filter((side, i) => !pieces[i]);
      const used = new Set(), tutors = [];
      let cost = "", onTop = false;
      for (const side of missing) {
        const f = [].concat(...side.map(n => findersFor(g, p, n).map(t => [t, n]))).find(([t]) => !used.has(t));
        if (!f) { tutors.length = 0; cost = ""; onTop = false; break; }
        used.add(f[0]); tutors.push(f);
        if (f[0] === "Pyre of Heroes") cost = addCost(cost, "{2}");
        else if (f[0] !== "Reanimate") cost = addCost(cost, cardCost(f[0]));
        else cost = addCost(cost, "{B}");
        if (TOP_TUTORS.includes(f[0])) onTop = true;
      }
      const reachable = !missing.length || tutors.length === missing.length;
      if (!reachable && (missing.length === l.sides.length || missing.length > 1)) continue;
      const steps = [];
      for (const [t, n] of tutors) steps.push({ text: t === "Reanimate" ? `Reanimate ${short(n)} from the graveyard (you lose 4 life).` : t === "Pyre of Heroes" ? `Pyre of Heroes ({2}, {T}, sacrifice a 3-mana Assassin): ${short(n)} straight onto the battlefield.` : `${t} for ${short(n)}${TOP_TUTORS.includes(t) ? " (it goes on top: you draw it next turn)" : ""}.`, cards: [t, n] });
      const unfound = !reachable;
      if (unfound) for (const side of missing) { cost = addCost(cost, cardCost(side[0])); steps.push({ text: `Find ${list(side.map(short))}: no tutor for it in hand yet. Dig with Rhystic Study, Dark Confidant, the cloaks and the cantrips.`, cards: side.slice(0, 2) }); }
      const need = n => { if (n && !onBf(g, p, n) && !tutors.some(([t, m]) => m === n && t === "Pyre of Heroes") && !tutors.some(([t, m]) => m === n && t === "Reanimate")) { cost = addCost(cost, cardCost(n)); return true; } return false; };
      const piece = i => pieces[i] || (tutors.find(([, n]) => l.sides[i].includes(n)) || [])[1];
      let kills = false;
      if (l.key === "ramses") {
        if (need(RAMSES)) steps.push({ text: "Cast Ramses before combat. Don't wait for Greaves: a turn of his anthem is worth more than the games he's removed in.", cards: [RAMSES, "Lightning Greaves"] });
        const bonus = ramsesOut ? undefined : a => (isAssassin(g, a) ? 1 : 0);
        const out = killNow(g, p, mark, bonus);
        kills = !!(out && out.kill);
        steps.push({ text: mark ? `Attack ${mark.name} (${mark.life} life) with an Assassin and everything that gets through.${out ? ` About ${Math.max(0, out.dmg)} damage gets there${kills ? ": they die, and Ramses wins you the game." : "."}` : ""} If they lose this turn by any means, you win.` : "Attack the player the board kills soonest.", cards: [RAMSES] });
        if (!kills && have(g, p, "Reverse the Polarity")) steps.push({ text: "Reverse the Polarity (creatures can't be blocked) gets the whole team through.", cards: ["Reverse the Polarity"] });
        if (!kills && onBf(g, p, "Rogue's Passage")) steps.push({ text: "Rogue's Passage ({4}, {T}) makes your best halver unblockable.", cards: ["Rogue's Passage"] });
      } else if (l.key === "halve") {
        const h = piece(1);
        if (need(BLOOD)) steps.push({ text: "Cast Bloodletter of Aclazotz: on your turn every life loss is doubled.", cards: [BLOOD] });
        if (h === "Quietus Spike") { if (need("Quietus Spike")) steps.push({ text: "Cast Quietus Spike.", cards: ["Quietus Spike"] }); cost = addCost(cost, "{3}"); steps.push({ text: "Equip it ({3}) to an evasive attacker: a 1/1 keeps Tetsuko's evasion (the Spike doesn't change power).", cards: ["Quietus Spike", "Tetsuko Umezawa, Fugitive"] }); }
        else if (h && need(h)) steps.push({ text: `Cast ${short(h)}. It has to wait a turn to attack.`, cards: [h] });
        steps.push({ text: `It connects: half their life, rounded up, doubled by Bloodletter. All of it. One player${ramsesOut ? ", and with Ramses out that's the game" : ""}.`, cards: [h || "Virtus the Veiled", BLOOD] });
        const hv = h && h !== "Quietus Spike" ? bfObj(g, p, h) : null;
        kills = !!(hv && !hv.sick && !hv.tapped && onBf(g, p, BLOOD) && (g.ch(hv).unblockable || g.kw(hv, "flying") || g.kw(hv, "menace")));
      } else {
        const a = piece(0), b = piece(1);
        if (need(a)) steps.push({ text: `Cast ${short(a)}.`, cards: [a] });
        if (need(b)) steps.push({ text: `Cast ${short(b)}.`, cards: [b] });
        steps.push({ text: "Start it with any opponent losing life: an attack that connects, a halver, their own fetch or shock land, Vein Ripper with Ashnod's Altar. Gain, drain, gain: every opponent goes to 0.", cards: ["Vein Ripper", "Ashnod's Altar"] });
        kills = true;
      }
      const n = costN(cost);
      const okNow = n <= now && payNow(g, p, cost), okNext = n <= next && (okNow || payNext(g, p, cost));
      const sick = l.key === "halve" && !kills && !onBf(g, p, piece(1) || "");
      let when;
      if (unfound) when = "later";
      else if (l.key === "ramses") when = !onTop && okNow && preCombat && assassinsReady.length && kills ? "now" : (okNow || okNext) ? "next" : "later";
      else if (l.key === "halve") when = !onTop && okNow && preCombat && kills ? "now" : okNext || okNow ? "next" : "later";
      else when = !onTop && okNow && myTurn ? "now" : okNext ? "next" : "later";
      if (sick && when === "now") when = "next";
      lines.push({ key: l.key, when, title: l.title, short: l.short, kill: l.key !== "halve" || ramsesOut, cost: cost || "{0}", mana: n, steps, tutors: tutors.map(t => t[0]), missing: missing.map(side => side[0]), blockedBy: [], early: null, onTurn: cost || "{0}" });
    }
    const W = { now: 0, next: 1, later: 2, blocked: 3 };
    lines.sort((a, b) => W[a.when] - W[b.when] || (a.kill === b.kill ? 0 : a.kill ? -1 : 1) || a.mana - b.mana);
    const threats = [];
    for (const q of liveOpps(g, p)) {
      const pw = g.creatures(q).reduce((s, c) => s + Math.max(0, g.power(c)), 0);
      if (pw >= p.life) threats.push({ kind: "lethal", level: "high", name: null, title: `${q.name} can kill you`, text: `${pw} power on board and you're at ${p.life}. Keep a deathtouch blocker home or end it first.`, answers: ["Cyclonic Rift", "Kindred Dominance", "Snuff Out", "Deadly Rollick"].filter(n => inHand(p, n)), answerText: "" });
    }
    const lethal = threats.some(t => t.kind === "lethal");
    const tablePw = liveOpps(g, p).reduce((s, q) => s + g.creatures(q).reduce((t, c) => t + Math.max(0, g.power(c)), 0), 0);
    if (!lethal && tablePw * 2 >= p.life) {
      const answers = ["Kindred Dominance", "Cyclonic Rift"].filter(n => inHand(p, n));
      threats.push({ kind: "pressure", level: tablePw * 1.5 >= p.life ? "high" : "low", name: null, title: "The table is racing you", text: `${tablePw} power across the table and you're at ${p.life}. Close one player fast with Ramses, or wipe their boards.`, answers, answerText: answers.length ? `In hand: ${list(answers.map(short))}.` : "" });
    }
    const key2 = ramsesOut ? bfObj(g, p, RAMSES) : null;
    if (key2 && !g.kw(key2, "shroud") && !g.kw(key2, "hexproof")) threats.push({ kind: "threat", level: "low", name: RAMSES, title: "Ramses is unprotected", text: "Most of his removal is a wrath on its owner's turn: keep your last counter for it, and put Lightning Greaves on him when you can.", answers: ["Lightning Greaves", "Force of Will", "Fierce Guardianship"].filter(n => have(g, p, n)), answerText: "" });
    const who = liveOpps(g, p).filter(q => q.hand.length >= 2 && g.controlled(q, o => g.isLand(o) && !o.tapped).length >= 2).map(q => q.name);
    const r = { state: { manaNow: now, manaNext: next, mark: mark ? mark.name : null }, lines, threats, risk: { who, quiet: null } };
    planKey = key; planVal = r;
    return r;
  }

  /* ================================================================ the "Look for" tips */
  function coachTips(g, p) {
    const out = [];
    const myTurn = g.active === p, main = myTurn && (g.phase === "main1" || g.phase === "main2");
    const r = plan(g, p);
    for (const l of r.lines.filter(x => x.when === "now")) out.push({ level: "win", title: l.title, text: l.steps.map(s => s.text).join(" "), cards: [].concat(...l.steps.map(s => s.cards || [])).slice(0, 4) });
    for (const l of r.lines.filter(x => x.when !== "now" && x.missing.length === 1 && x.tutors.length)) out.push({ level: main ? "now" : "plan", title: `One card from ${l.short}: ${short(l.missing[0])}`, text: `${list(l.tutors)} can find it. ${l.steps.slice(1).map(s => s.text).join(" ")}`, cards: [l.tutors[0], l.missing[0]] });
    const ramses = bfObj(g, p, RAMSES);
    if (ramses) out.push({ level: "info", title: "Ramses: pick one player", text: `${r.state.mark ? `The mark is ${r.state.mark}, the player your board kills soonest. ` : ""}Every attacker that gets through goes at them; the rest hit whoever is open (each Assassin hit is still a card). If a player you attacked with an Assassin loses this turn, any way at all, you win.`, cards: [RAMSES] });
    else if (inHand(p, RAMSES)) out.push({ level: main ? "now" : "plan", title: "Ramses in hand: cast him", text: "Before combat, this turn. Holding him until Greaves can go on him the same turn cost 3.8 points against precons in bot games.", cards: [RAMSES] });
    else if (GENERAL_TUTORS.some(n => inHand(p, n))) out.push({ level: main ? "now" : "plan", title: "Tutor for Ramses first", text: "He's the kill. Tutoring anything else first cost 8 to 11 points in bot games. After him the order barely matters.", cards: GENERAL_TUTORS.filter(n => inHand(p, n)).slice(0, 2).concat([RAMSES]) });
    if (!onBf(g, p, ETRATA) && p.commanders[0] && p.commanders[0].zone === "command") {
      const ready = attackers(g, p).filter(c => isAssassin(g, c));
      out.push({ level: main && ready.length ? "now" : "plan", title: ready.length ? "Etrata now: an Assassin can connect" : "Etrata when an Assassin connects", text: ready.length ? `${and(ready.slice(0, 3).map(o => short(o.def.name)))} can attack this turn. Cast her first: her trigger works the turn she's cast.` : "Cast her on the turn an Assassin is already getting through: she's kill-on-sight, so give her a hit before they can answer her.", cards: [ETRATA] });
    }
    if (onBf(g, p, VEIL)) out.push({ level: "info", title: "Teferi's Veil is out: send everything", text: "Your attackers phase out at end of combat and come back at your untap step, so the wraths on everyone else's turns miss them. Attack with everything that gets through.", cards: [VEIL] });
    if (inHand(p, "Kindred Dominance")) {
      const t = TYPERS.some(n => onBf(g, p, n));
      out.push({ level: "info", title: "Kindred Dominance: name Assassin", text: `Every creature that isn't an Assassin dies.${t ? " Your type-changer makes the stolen 2/2s Assassins, so they live." : " Without a type-changer your face-down 2/2s have no types and die too: cast Leyline, Arcane Adaptation or Roshan first if you can."}`, cards: ["Kindred Dominance"].concat(TYPERS.filter(n => have(g, p, n)).slice(0, 1)) });
    }
    const downs = g.controlled(p, o => !!o.faceDown);
    if (downs.length && !TYPERS.some(n => onBf(g, p, n))) out.push({ level: "info", title: `${downs.length} face-down 2/2${downs.length > 1 ? "s" : ""} with no types`, text: "They aren't Assassins until Leyline of Transformation, Arcane Adaptation (name Assassin) or Roshan is out. With one, each of them cloaks again when it connects.", cards: TYPERS });
    const bombs = downs.filter(o => o.cardDef && o.cardDef.types.includes("Creature") && (o.cardDef.mv >= 5 || (o.cardDef.pt && o.cardDef.pt[0] >= 4)));
    if (bombs.length && onBf(g, p, ETRATA)) out.push({ level: "info", title: "Flip rarely", text: `Turn a stolen card up only when it beats the 2/2 it is (${and(bombs.slice(0, 2).map(o => short(o.cardDef.name)))} might), after your own spells and never before combat. Flipping first cost 1.7 points in bot games.`, cards: [ETRATA] });
    if (inHand(p, "Demonic Consultation")) out.push({ level: "warn", title: "Demonic Consultation exiles up to your whole library", text: "Name a card that's still in your library. 8% of the losses against precons in bot games were an empty library.", cards: ["Demonic Consultation"] });
    if (onBf(g, p, "Dark Confidant") && p.life <= 12) out.push({ level: "warn", title: "Dark Confidant costs life", text: `You're at ${p.life}. Each upkeep you lose the revealed card's mana value.`, cards: ["Dark Confidant"] });
    const ctr = COUNTERS.filter(n => inHand(p, n));
    if (ctr.length === 1 && !myTurn) out.push({ level: "info", title: "Your last counter is for the wrath", text: `Keep ${short(ctr[0])} for a board wipe or removal aimed at Ramses or Etrata. Let single creatures and commanders resolve.`, cards: ctr });
    const order = { win: 0, now: 1, warn: 2, plan: 3, info: 4 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  /* ================================================================ the companion
     companion(g, p, ctx) -> { stage, title, steps: [{ text, cards }], urgent, keep } for the moment the game is in. */
  function companion(g, p, ctx) {
    ctx = ctx || {};
    const mode = ctx.mode || "wait";
    const myTurn = g.active === p;
    const castable = name => p.hand.some(c => c.def.name === name && g.castOptions(p, c).length > 0);
    const steps = [];
    const step = (text, cards) => steps.push({ text, cards: cards || [] });
    const etrata = bfObj(g, p, ETRATA);
    const home = p.commanders[0] && p.commanders[0].zone === "command" ? p.commanders[0] : null;

    if (mode === "mulligan") {
      const hand = ctx.hand || p.hand, names = hand.map(o => o.def.name);
      const lands = hand.filter(o => o.def.types.includes("Land")).length;
      const fast = names.filter(n => ROCKS.includes(n) || n === "Ancient Tomb");
      const cheap = names.filter(n => CHEAP.includes(n));
      const engines = names.filter(n => n === "Rhystic Study" || n === "Mystic Remora" || n === "Dark Confidant");
      const tutors = names.filter(n => GENERAL_TUTORS.includes(n));
      let keep = null;
      const brain = (MK.DECK_BRAINS || {})[DECK_ID];
      try { if (brain && brain.mulligan) keep = !!brain.mulligan(g, p, { hand, mulls: ctx.mulls || 0 }); } catch (e) { keep = null; }
      const title = keep === true ? (cheap.length && lands >= 2 ? "Keep: a body, then Etrata by turn 3" : "Keep: it does something by turn 3") : keep === false ? "Mulligan: it doesn't do enough by turn 3" : "Close call";
      step(`${lands} land${lands === 1 ? "" : "s"}${fast.length ? ` and ${list(fast.map(short))}` : ""}. You need blue and black, and Etrata on turn 3 with an Assassin ready to hit.`, fast.slice(0, 2));
      if (cheap.length) step(`Cheap evasive Assassin${cheap.length > 1 ? "s" : ""}: ${list(cheap.map(short))}. Changeling Outcast is the best one-drop.`, cheap.slice(0, 2));
      if (engines.length) step(`Early engine: ${list(engines.map(short))}, with the lands to cast it.`, engines.slice(0, 2));
      if (tutors.length) step(`Tutor: ${list(tutors.map(short))}. It finds Ramses.`, tutors.slice(0, 1).concat([RAMSES]));
      step("Mulligan is the default: interaction alone, or draw with nothing to develop, isn't a keep. The free first mulligan makes it cheap.");
      return { stage: "Opening hand", title, keep, steps };
    }
    const r = plan(g, p) || { lines: [], threats: [], risk: { who: [] }, state: {} };
    const counters = COUNTERS.filter(castable);

    if (mode === "respond") {
      const can = new Set(ctx.can || []);
      const top = ctx.top, def = top && (top.o ? top.o.def : top.src && top.src.def);
      const theirs = top && top.p && top.p !== p;
      const ctr = COUNTERS.filter(n => can.has(n) && (n !== "Swan Song" || (def && /Instant|Sorcery|Enchantment/.test(def.type))) && (n !== "Fierce Guardianship" && n !== "Force of Negation" || (def && !def.types.includes("Creature"))));
      if (ctx.window === "stack" && theirs && def) {
        const ai = def.ai || {};
        const hits = (top.targets || []).filter(t => t && !g.isPlayer(t) && t.controller === p);
        const wipe = ai.wipe || ((def.types.includes("Sorcery") || def.types.includes("Instant")) && /(destroy|exile|return) all [^.]*(creatures|permanents)|damage to each creature|all creatures get -/i.test(def.text || ""));
        const key = hits.find(o => nameOf(o) === RAMSES || nameOf(o) === ETRATA || nameOf(o) === BLOOD);
        if (wipe || key) {
          if (onBf(g, p, VEIL) && wipe && !key) { step("Teferi's Veil phased your attackers out: the ones that attacked this turn are safe. Counter it only if what's still here matters."); }
          if (ctr.length) step(`${ctr[0] === "Fierce Guardianship" && etrata ? "Fierce Guardianship is free with Etrata out. " : ""}Counter ${top.name} with ${ctr[0]}: ${wipe ? "it's a board wipe" : `it hits your ${short(nameOf(key))}`}. This is what the last counter is for.`, [ctr[0]]);
          else step(`${top.name} ${wipe ? "is a board wipe" : `hits your ${short(nameOf(key))}`} and nothing in hand stops it. Rebuild from hand: the cheap Assassins come back fast.`);
          return { stage: "Defend", title: wipe ? `Board wipe: ${top.name}` : `${top.name} targets your ${short(nameOf(key))}`, steps, urgent: ctr.length > 0 };
        }
        const win = ai.combo || /you win the game|loses the game/i.test(def.text || "");
        if (win && ctr.length) { step(`${top.name} can end the game. Counter it with ${ctr[0]}.`, [ctr[0]]); return { stage: "Defend", title: `${top.p.name} goes for the win`, steps, urgent: true }; }
        if (ctr.length) step(`Let it resolve. Save ${short(ctr[0])} for a wrath or removal aimed at Ramses or Etrata: single creatures and commanders aren't worth it (+1.0 point in bot games).`, [ctr[0]]);
        return { stage: myTurn ? "Your turn" : "Their turn", title: `${top.p.name} casts ${top.name}`, steps };
      }
      if (ctx.window === "end") {
        if (ctx.turnOf && g.nextPlayer(ctx.turnOf) !== p) return { stage: "Their turn", title: "", steps };
        if (can.has("Vampiric Tutor") && !have(g, p, RAMSES)) step("Vampiric Tutor now for Ramses: you draw him this turn and cast him before combat.", ["Vampiric Tutor", RAMSES]);
        else if (can.has("Brainstorm")) step("Brainstorm with the mana you didn't use.", ["Brainstorm"]);
        if (can.has("Cyclonic Rift") && manaNow(g, p) >= 7) step("Overloaded Cyclonic Rift now clears every blocker before your attack.", ["Cyclonic Rift"]);
        return { stage: "Their turn", title: "End of turn: your instants", steps, urgent: steps.length > 0 };
      }
      return { stage: myTurn ? "Your turn" : "Their turn", title: "", steps };
    }

    if (mode === "attack") {
      const cands = ctx.candidates || [];
      const ramses = onBf(g, p, RAMSES);
      const mark = r.state.mark;
      const race = r.threats.find(t => t.kind === "lethal");
      if (onBf(g, p, VEIL)) step("Teferi's Veil is out: attack with everything that gets through. It all phases out after combat, out of reach of their wraths.", [VEIL]);
      if (ramses && mark) step(`Ramses is out: everything that gets through goes at ${mark}. Once they lose this turn, by any means, you win.`, [RAMSES]);
      else step("No Ramses yet: spread the hits. Each Assassin that connects cloaks a card, and a player who leaves takes their stolen cards with them.", [ETRATA]);
      const halvers = cands.filter(o => HALVERS.includes(o.def.name) || g.battlefield.some(e => e.attachedTo === o && e.def.name === "Quietus Spike"));
      if (halvers.length) step(`${and(halvers.map(o => short(o.def.name)))}: half their life on a hit${onBf(g, p, BLOOD) ? ", doubled by Bloodletter: all of it" : ""}. Send it where it can't be blocked.`, halvers.map(o => o.def.name).slice(0, 2));
      const keep = cands.filter(o => KEEP_HOME.has(o.def.name));
      if (keep.length && !onBf(g, p, VEIL)) step(`${and(keep.map(o => short(o.def.name)))} can stay home unless the hit matters: they do more alive.`, keep.map(o => o.def.name).slice(0, 2));
      if (race) step(`${race.title}: keep a deathtouch blocker back.`, [ETRATA]);
      return { stage: "Combat", title: ramses ? `Kill ${mark || "one player"}` : "Who attacks", steps };
    }
    if (mode === "block") {
      const at = (ctx.attackers || []).filter(a => a.combat && a.combat.attacking === p);
      const dmg = at.reduce((s, a) => s + Math.max(0, g.power(a)), 0);
      step(dmg >= p.life ? `${dmg} damage is coming and you're at ${p.life}: block enough to live.` : `${dmg} damage is coming (you're at ${p.life}). Take it rather than trade away Ramses, Etrata or Bloodletter.`);
      if (etrata && !etrata.tapped) step("Etrata blocks well: 4 toughness and deathtouch.", [ETRATA]);
      return { stage: "Their turn", title: "Blocks", steps };
    }
    if (!myTurn) {
      const held = COUNTERS.filter(n => inHand(p, n));
      if (held.length) step(`Hold ${list(held.map(short))} for a wrath or removal on Ramses or Etrata. The game stops for you when it matters.`, held.slice(0, 2));
      if (inHand(p, "Vampiric Tutor") && !have(g, p, RAMSES)) step("Vampiric Tutor at the end of the turn before yours, for Ramses.", ["Vampiric Tutor", RAMSES]);
      for (const t of r.threats.filter(x => x.kind === "lethal")) step(`${t.title}: ${t.text}`, t.answers.slice(0, 2));
      if (!steps.length) step("Nothing to do on their turn. Watch who could wipe the board.");
      return { stage: "Their turn", title: `${g.active.name}'s turn`, steps };
    }

    const winNow = r.lines.find(l => l.when === "now" && l.kill);
    if (winNow && mode === "main" && g.phase === "main1") {
      if (r.risk.who.length && counters.length) step(`${list(r.risk.who)} ${r.risk.who.length > 1 ? "have" : "has"} cards and open mana: keep ${short(counters[0])} up.`, counters.slice(0, 1));
      for (const st of winNow.steps) step(st.text, st.cards);
      return { stage: "Go off", title: `Win now: ${winNow.short}`, steps, urgent: true };
    }
    if (mode === "main" && g.phase === "main2") {
      const held = COUNTERS.filter(n => inHand(p, n));
      if (held.length) step(`Before you pass: mana up for ${list(held.map(short))} if you can (the Forces and Fierce Guardianship can be free).`, held.slice(0, 2));
      if (inHand(p, VEIL) && castable(VEIL)) step("Teferi's Veil now: next turn your whole attack phases out after combat.", [VEIL]);
      const downs = g.controlled(p, o => !!o.faceDown && o.cardDef && o.cardDef.types.includes("Creature") && o.cardDef.mv >= 5);
      if (downs.length && etrata) step(`A stolen ${short(downs[0].cardDef.name)} is face down. Flip it now (after your own spells) only if it beats a 2/2.`, [ETRATA]);
      if (!steps.length) step("Nothing to hold back. Pass when ready.");
      return { stage: "End of your turn", title: "Before you pass", steps };
    }
    if (p.landsPlayed < g.landDrops(p) && p.hand.some(c => c.def.types.includes("Land"))) step("Play a land first.");
    const rocks = ROCKS.filter(castable);
    if (rocks.length) step(`Fast mana: ${list(rocks.slice(0, 2).map(short))}.`, rocks.slice(0, 2));
    const ready = attackers(g, p).filter(c => isAssassin(g, c));
    if (!etrata && home) {
      if (g.castOptions(p, home).length) step(ready.length ? `Cast Etrata now: ${and(ready.slice(0, 2).map(o => short(o.def.name)))} can hit this turn, and her trigger works the turn she's cast.` : "Etrata is castable, but no Assassin can connect this turn. Put a cheap evasive Assassin down first if you can, and cast her the turn one hits.", [ETRATA]);
      else step(`Etrata costs ${home.def.cost}${g.commanderTax(p, home) ? ` plus {${g.commanderTax(p, home)}} tax` : ""}.`, [ETRATA]);
    }
    const cheap = CHEAP.filter(castable);
    if (cheap.length && g.creatures(p).length < 3) step(`Cheap evasive Assassin${cheap.length > 1 ? "s" : ""}: ${list(cheap.slice(0, 3).map(short))}.`, cheap.slice(0, 2));
    if (castable(RAMSES)) step("Ramses now, before combat. Don't hold him for protection.", [RAMSES]);
    else { const t = GENERAL_TUTORS.filter(castable); if (t.length && !have(g, p, RAMSES)) step(`${short(t[0])} for Ramses: he's the kill.`, [t[0], RAMSES]); }
    const typer = TYPERS.filter(castable);
    if (typer.length && g.controlled(p, o => !!o.faceDown).length) step(`${short(typer[0])}: your face-down 2/2s become Assassins and cloak again when they connect.`, typer.slice(0, 1));
    const l = r.lines[0];
    if (l && l.when === "next") step(`Next turn: ${l.short}${l.missing.length ? `, missing ${l.missing.map(short).join(" and ")}` : ""}.`, l.steps[0] ? l.steps[0].cards : []);
    if (!steps.length) step("Develop: Assassins, a draw engine, and keep a tutor for Ramses.");
    return { stage: etrata ? "Snowball" : "Set up", title: etrata ? (onBf(g, p, RAMSES) ? "Close one player" : "Find Ramses") : "Get Etrata out on a hit", steps };
  }

  /* ================================================================ hooks */
  deck.coach = { tips: coachTips, plan, companion, checklist: "etrata-heist",
    companionBlurb: "walks you through the heist plan: the Bracket 4 mulligan, Etrata on the turn an Assassin connects, Ramses first, picking one player, and what to save your last counter for. It stops the game when it has advice." };
  deck.alsoOn = [...new Set((deck.alsoOn || []).concat(["corrupted-etrata"]))];
  MK.HEIST_AI = { plan, coachTips, companion, findersFor, manaNow, manaNext, markFor, LINES, COMBO_NAMES, ALL_TUTORS, GENERAL_TUTORS, COUNTERS, REMOVAL, ROCKS, ENGINES, TYPERS, HALVERS, DRAINS, PAYOFFS, CHEAP };
})(typeof window !== "undefined" ? window : globalThis);
