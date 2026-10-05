/* Corrupted Etrata: the Bracket 4 list "Etrata's Shadow Market" (v3, Etrata, Deadly Fugitive), a Dimir
   deck of theft and odd two-card combos. A player can pilot it from the Corrupted Etrata site, and the
   Etrata site offers it too (alsoOn).
   The cards no other file defines are here; the rest come from cards-etrata.js (Etrata, Mindcrank,
   Scroll of Fate, Training Grounds, Duskmantle Guildmage...), decks-etrata4.js (Mari, Virtus, Imperial
   Seal), decks-edgar.js (the vampire combo pieces, Demonic and Vampiric Tutor) and the other bots.
   Card text follows the printed Oracle text. Where the engine simplifies a card, its `note` says how.
   The engine has no draw or search replacement and no "spend mana as though it were any type", so
   the cards that need those work through triggers instead (see each note).
   Win lines in the v3 list: the vampire loop, Mindcrank + Duskmantle Guildmage, Bloodletter + Virtus
   and the Wormfang Manta turn loop (manifest it with Scroll of Fate, flip it, bounce it). The v2 lines
   (the Brine Elemental lock, Mari + Etrata, the Silencer) keep their cards and code here; they drop out
   of the plan when their pieces aren't in the list. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const pc = s => MK.parseCost(s);
  const AI = () => MK.AI || {};

  /* ---------- helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isOpp = (g, p, q) => !!q && q !== p && g.opponents(p).includes(q);
  const mainWin = ctx => ctx.window === "main1" || ctx.window === "main2";
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p;
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  const isAssassin = (g, o) => (MK.isAssassin ? MK.isAssassin(g, o) : !!o && g.hasSub(o, "Assassin"));
  const nameOf = o => (o.cardDef || o.def).name;
  const onBf = (g, p, name) => g.battlefield.some(o => o.controller === p && o.def.name === name);
  const bfObj = (g, p, name) => g.battlefield.find(o => o.controller === p && o.def.name === name) || null;
  const inHand = (p, name) => p.hand.some(c => c.def.name === name);
  /* The pilot of this list (or of another Etrata list): the deck's bot picks only apply to them. */
  const isOurs = p => !!p && (p.commanders || []).some(c => nameOf(c) === "Etrata, Deadly Fugitive");
  /* This deck's bots run the brain at the end of this file instead of the cards' plans below. */
  const DECK_ID = "corrupted-etrata";
  const hasBrain = p => !!p && p.deckId === DECK_ID;
  /* Put a card from a hand back on top of its owner's library (Necropotence, Notion Thief). */
  function backOnTop(g, p, o) {
    if (!o || o.zone !== "hand" || !p.hand.includes(o)) return false;
    g.removeFromZone(o);
    o.zone = "library";
    p.library.unshift(o);
    g.bump();
    return true;
  }
  /* "As an additional cost to cast this spell, sacrifice a creature": paid right after it's cast. */
  const sacAsCost = () => async (g, p, o) => {
    const opts = g.creatures(p);
    if (!opts.length) return;
    let pick = await g.ask(p, { type: "target", prompt: `${o.def.name}: sacrifice a creature (additional cost)`, options: opts, purpose: "sacrifice", src: o });
    if (!pick || !opts.includes(pick)) pick = opts.slice().sort((a, b) => fodderScore(g, a) - fodderScore(g, b))[0];
    g.sacrifice(pick);
  };
  /* Low is cheap to sacrifice: tokens, face-down lands and other people's cards, then small creatures. */
  function fodderScore(g, o) {
    if (o.isToken) return g.power(o);
    if (o.faceDown) return COMBO_NAMES.has(o.cardDef.name) ? 40 : (o.cardDef.types.includes("Land") ? 1 : 4) + (o.owner !== o.controller ? 0 : 2);
    if (o.isCommander) return 50;
    if (COMBO_NAMES.has(o.def.name)) return 40;
    return 5 + (AI().value ? AI().value(g, o) : g.power(o));
  }
  const cheapFodder = (g, p) => g.creatures(p).some(o => fodderScore(g, o) <= 3);

  /* ================================================================ the combos
     The bots tutor toward these. A line is "live" when one card of each side is on our battlefield,
     "one away" when only one side is missing (counting the hand). */
  const LOSS = ["Exquisite Blood", "Bloodthirsty Conqueror"];                              // opponent loses life: you gain it
  const GAIN = ["Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Sanguine Bond", "Enduring Tenacity", "Starscape Cleric", "Defiant Bloodlord"];   // you gain life: opponents lose it
  const LINES = [
    { key: "vampire", title: "Vampire loop", sides: [LOSS, GAIN] },
    { key: "mindcrank", title: "Mindcrank + Duskmantle Guildmage", sides: [["Mindcrank"], ["Duskmantle Guildmage"]] },
    { key: "doubletap", title: "Bloodletter + Virtus", sides: [["Bloodletter of Aclazotz"], ["Virtus the Veiled"]] },
    { key: "brine", title: "Brine Elemental lock", sides: [["Brine Elemental"], ["Vesuvan Shapeshifter"]] },
    { key: "hitlist", title: "Mari + Etrata, the Silencer", sides: [["Mari, the Killing Quill"], ["Etrata, the Silencer"]] }
  ];
  const COMBO_NAMES = new Set([].concat(...LINES.map(l => [].concat(...l.sides))));
  /* Engine pieces worth a tutor when no line is close. */
  const WANT = ["Training Grounds", "Rhystic Study", "Necropotence", "Ramses, Assassin Lord", "Tetsuko Umezawa, Fugitive", "Opposition Agent", "Notion Thief", "Leyline of Transformation", "Roshan, Hidden Magister", "Mystic Remora"];
  /* Our face-down permanents are known to us: a face-down Brine counts as Brine on the battlefield. */
  const onBfAny = (g, p, name) => g.battlefield.some(o => o.controller === p && nameOf(o) === name);
  const haveCard = (g, p, name) => onBfAny(g, p, name) || inHand(p, name);
  function lineState(g, p, l) {
    const live = l.sides.map(side => side.some(n => onBf(g, p, n)));
    const have = l.sides.map(side => side.some(n => haveCard(g, p, n)));
    return { line: l, live: live.every(Boolean), missing: l.sides.filter((side, i) => !have[i]), haveSides: have.filter(Boolean).length };
  }
  /* The best card among cands for this deck: rank 3 completes a line, 2 starts a line we hold half
     of... 1 is an engine piece, 0 anything else. */
  function bestPiece(g, p, cands) {
    if (!cands.length) return null;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (lands < 3 && !p.hand.some(c => c.def.types.includes("Land"))) {
      const l = cands.find(c => c.def.types.includes("Land") && !c.def.supertypes.includes("Basic")) || cands.find(c => c.def.types.includes("Land"));
      if (l) return { c: l, rank: 2 };
    }
    const states = LINES.map(l => lineState(g, p, l));
    for (const st of states) {
      if (st.live || st.missing.length !== 1) continue;
      for (const n of st.missing[0]) { const c = cands.find(x => x.def.name === n); if (c) return { c, rank: 3, line: st.line }; }
    }
    for (const st of states) {
      if (st.live) continue;
      for (const side of st.missing) for (const n of side) { const c = cands.find(x => x.def.name === n); if (c) return { c, rank: 2, line: st.line }; }
    }
    for (const n of WANT) { if (haveCard(g, p, n)) continue; const c = cands.find(x => x.def.name === n); if (c) return { c, rank: 1 }; }
    return null;
  }
  /* Search with this deck's picks for the bots (the generic picker doesn't know the combos). */
  async function tutor(g, p, src, opts) {
    const filter = opts.filter || (() => true);
    let f = filter;
    if (p.agent && p.agent.bot && isOurs(p)) {
      const cands = p.library.filter(o => filter(g, o));
      const pick = hasBrain(p) ? botPiece(g, p, cands) : (bestPiece(g, p, cands) || {}).c;
      if (pick) f = (g2, o) => o === pick;
    }
    return g.search(p, { filter: f, to: opts.to || "hand", prompt: opts.prompt, src, hidden: opts.hidden !== false, purpose: "tutor" });
  }
  const tutorCards = (g, p, req) => {
    if (req.purpose !== "tutor" || !isOurs(p)) return null;
    const b = bestPiece(g, p, req.options);
    return b ? [b.c] : null;
  };

  /* ---------- transmute: an activated ability from the hand, written as a channel ability. It's
     only offered while you could cast a sorcery (the "target" is you, legal only then). */
  const transmute = cost => ({
    label: "Transmute", cost,
    targets: [{ kind: "player", purpose: "transmute", prompt: "Transmute (only as a sorcery): search your library", playerFilter: (g, pl, p) => pl === p && g.canSorcery(p) }],
    do: async (g, o, ctx) => {
      const p = ctx.p, mv = o.cardDef ? o.cardDef.mv : o.def.mv;
      await tutor(g, p, o, { filter: (g2, c) => c.def.mv === mv, prompt: `Transmute ${o.def.name}: search for a card with mana value ${mv}`, hidden: false });
    }
  });
  const TRANSMUTE_NOTE = "Transmute is offered on the card in your hand only while you could cast a sorcery. You pick yourself as its \"target\"; that's only how the game knows the timing.";
  /* Bots transmute when it finds a piece of a line they hold half of (or the last piece). */
  const transmutePlan = (g, p, o, ctx) => {
    if (!mainWin(ctx) || o.zone !== "hand" || hasBrain(p)) return null;
    const act = ctx.actions.find(a => a.type === "channel" && a.card === o);
    if (!act) return null;
    const mv = o.def.mv;
    const b = bestPiece(g, p, p.library.filter(c => c.def.mv === mv));
    return b && b.rank >= 2 ? { type: "channel", card: o, maxTries: 1 } : null;
  };
  const transmuteTarget = (g, p, req) => (req.purpose === "transmute" ? req.options.find(x => x === p) : undefined);

  /* ================================================================ the deck plan (bots)
     Attached to several of this deck's cards (lands, Mox Amber, the engines) so it runs whenever one
     of them is in hand or on the battlefield. */
  function deckPlan(g, p, o, ctx) {
    if (!isOurs(p) || hasBrain(p) || g.active !== p) return null;
    // 1. the vampire loop is live: Duskmantle Guildmage's mill (after its life-loss ability) starts it
    if (mainWin(ctx) && lineState(g, p, LINES[0]).live) {
      const gm = bfObj(g, p, "Duskmantle Guildmage");
      if (gm) {
        const st = gm.state;
        const act0 = ctx.actions.find(a => a.type === "activate" && a.card === gm && a.idx === 0);
        const act1 = ctx.actions.find(a => a.type === "activate" && a.card === gm && a.idx === 1);
        if (st.cetLoop !== g.turn && act0 && manaNow(g, p) >= 7) { st.cetLoop = g.turn; st.dusk = g.turn; return { type: "activate", card: gm, idx: 0, maxTries: 1 }; }
        if (st.cetLoop === g.turn && act1) return { type: "activate", card: gm, idx: 1, maxTries: 1 };
      }
    }
    return null;
  }

  /* ================================================================ creatures */
  D({
    name: "Bloodletter of Aclazotz", cost: "{1}{B}{B}{B}", type: "Creature — Vampire Demon", pt: "2/4",
    keywords: ["flying"],
    text: "Flying\nIf an opponent would lose life during your turn, they lose twice that much life instead. (Damage causes loss of life.)",
    note: "Written as a trigger: whenever an opponent loses life during your turn, they lose that much life again. The total is the same (Virtus's half becomes all of it), but it's two losses, so Mindcrank mills and Exquisite Blood gains in two parts.",
    triggers: [{
      on: "loseLife",
      when: (g, s, ev) => g.active === s.controller && isOpp(g, s.controller, ev.p) && ev.amount > 0 && !ev.paid && !(ev.src && ev.src.bloodletter),
      do: (g, s, ev, { p }) => { if (!ev.p.lost) g.loseLife(ev.p, ev.amount, { def: { name: "Bloodletter of Aclazotz" }, controller: p, bloodletter: true }); }
    }],
    ai: { priority: 8, threat: 4, plan: deckPlan }
  });
  D({
    name: "Marauding Blight-Priest", cost: "{2}{B}", type: "Creature — Vampire Cleric", pt: "3/2",
    text: "Whenever you gain life, each opponent loses 1 life.",
    triggers: [{ on: "gainLife", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); } }],
    ai: { priority: 8, threat: 3, plan: deckPlan }
  });
  D({
    name: "Tetsuko Umezawa, Fugitive", cost: "{1}{U}", type: "Legendary Creature — Human Rogue", pt: "1/3",
    text: "Creatures you control with power or toughness 1 or less can't be blocked.",
    note: "Checked at the beginning of your combat: your creatures with power or toughness 1 or less then can't be blocked this turn.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p).filter(c => g.power(c) <= 1 || g.toughness(c) <= 1);
        if (!list.length) return;
        g.addEffect({ objs: list, unblockable: true });
        log(g, `${list.map(c => c.def.name).join(", ")} can't be blocked this turn (Tetsuko).`, p, ["Tetsuko Umezawa, Fugitive"]);
      }
    }],
    ai: { priority: 8, plan: deckPlan }
  });
  D({
    name: "Gonti, Night Minister", cost: "{2}{B}{B}", type: "Legendary Creature — Aetherborn Rogue", pt: "3/4",
    text: "Whenever a player casts a spell they don't own, that player creates a Treasure token.\nWhenever a creature deals combat damage to one of your opponents, its controller looks at the top card of that opponent's library and exiles it face down. They may play that card for as long as it remains exiled. Mana of any type can be spent to cast a spell this way.",
    note: "The exiled card is face up here, and you pay its normal cost: the game has no \"mana of any type\", so off-color cards need the colors.",
    triggers: [
      { on: "cast", when: (g, s, ev) => !!ev.o && !!ev.p && ev.o.owner !== ev.p && !(ev.item && ev.item.isCopy), do: (g, s, ev) => { if (!ev.p.lost) g.createToken(ev.p, T.treasure); } },
      {
        on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && isOpp(g, s.controller, ev.p) && !!ev.src.controller && !ev.src.controller.lost,
        do: (g, s, ev) => {
          const q = ev.p, who = ev.src.controller, c = q.library[0];
          if (!c || q.lost) return;
          g.moveTo(c, "exile");
          if (c.zone !== "exile") return;
          c.playable = { by: who, forever: true };
          log(g, `${who.name} exiles the top card of ${q.name}'s library (Gonti) and may play it.`, who, [c.def.name]);
        }
      }
    ],
    ai: { priority: 7, threat: 3, plan: deckPlan }
  });
  D({
    name: "Thief of Sanity", cost: "{1}{U}{B}", type: "Creature — Specter", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever Thief of Sanity deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. You may look at and cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any type to cast that spell.",
    note: "The exiled card is face up here, and you pay its normal cost (the game has no \"mana of any type\"). Exiling a land gives you nothing to cast.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const q = ev.p, top = q.library.slice(0, 3);
        if (!top.length || q.lost) return;
        const pick = await g.ask(p, { type: "cards", prompt: `Thief of Sanity: exile one of ${q.name}'s top three (you may cast it); the rest go to their graveyard`, options: top, min: 1, max: 1, purpose: "thiefPick", src: s });
        const c = (pick || []).find(x => top.includes(x)) || top[0];
        g.moveTo(c, "exile");
        if (c.zone === "exile" && !c.def.types.includes("Land")) c.playable = { by: p, forever: true };
        for (const o of top) if (o !== c && o.zone === "library") g.moveTo(o, "graveyard");
        log(g, `${p.name} exiles ${c.def.name} from ${q.name}'s library (Thief of Sanity).`, p, [c.def.name]);
      }
    }],
    ai: { priority: 7, threat: 3, cards: (g, p, req) => (req.purpose === "thiefPick" ? [stealPick(g, p, req.options)] : null) }
  });
  /* The card worth stealing: one we can cast (our colors), the best first. */
  function stealPick(g, p, opts) {
    const ours = new Set(g.identityOf(p));
    const castable = c => !c.def.types.includes("Land") && c.def.colors.every(k => ours.has(k));
    const score = c => (castable(c) ? 20 : 0) + ((c.def.ai && c.def.ai.priority) || 5) + c.def.mv * 0.6 + (c.def.ai && c.def.ai.finisher ? 4 : 0);
    return opts.slice().sort((a, b) => score(b) - score(a))[0];
  }
  D({
    name: "Fallen Shinobi", cost: "{3}{U}{B}", type: "Creature — Zombie Ninja", pt: "5/4",
    text: "Ninjutsu {2}{U}{B} ({2}{U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever Fallen Shinobi deals combat damage to a player, that player exiles the top two cards of their library. Until end of turn, you may play those cards without paying their mana costs.",
    note: "Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking, so \"whenever you discard\" effects see it.",
    channel: {
      label: "Ninjutsu", cost: "{2}{U}{B}",
      targets: [{ kind: "creature", you: true, purpose: "ninjutsu", prompt: "Ninjutsu: return an unblocked attacker you control to its owner's hand", filter: (g, c) => unblockedAttacker(g, c) }],
      do: (g, o, ctx) => {
        const p = ctx.p, a = ctx.targets[0];
        if (!a || !ctx.legal[0] || a.zone !== "battlefield") return;
        const target = a.combat && a.combat.attacking;
        g.bounce(a);
        if (o.zone !== "graveyard" && o.zone !== "exile") return;
        g.putOntoBattlefield([o], p, { tapped: true, attacking: target || undefined });
        log(g, `${p.name} ninjutsus Fallen Shinobi in, tapped and attacking.`, p, ["Fallen Shinobi"]);
      }
    },
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: (g, s, ev, { p }) => {
        const q = ev.p, top = q.library.slice(0, 2);
        if (!top.length || q.lost) return;
        for (const c of top) { g.moveTo(c, "exile"); if (c.zone === "exile") c.playable = { by: p, turn: g.turn, free: true }; }
        log(g, `${q.name} exiles ${top.map(c => c.def.name).join(" and ")}: ${p.name} may play them for free this turn (Fallen Shinobi).`, p, top.map(c => c.def.name));
      }
    }],
    ai: {
      priority: 6, threat: 3,
      plan: (g, p, o, ctx) => {
        if (o.zone !== "hand" || ctx.window !== "combat" || g.active !== p) return null;
        if (!ctx.actions.some(a => a.type === "channel" && a.card === o)) return null;
        return ninjaBait(g, p) ? { type: "channel", card: o, maxTries: 1 } : null;
      },
      target: (g, p, req) => (req.purpose === "ninjutsu" ? ninjaBait(g, p, req.options) || undefined : undefined)
    }
  });
  function unblockedAttacker(g, c) {
    return !!g.combat && !!g.combat.blocks && !!c.combat && !!c.combat.attacking && !c.combat.wasBlocked && !(c.combat.blockedBy || []).length;
  }
  /* The attacker to swap for Fallen Shinobi: a cheap creature of our own (not a cloak of someone
     else's card, not a creature whose hit wins). */
  function ninjaBait(g, p, opts) {
    const keep = new Set(["Virtus the Veiled", "Etrata, the Silencer", "Etrata, Deadly Fugitive", "Thief of Sanity", "Fallen Shinobi", "Bloodletter of Aclazotz"]);
    const list = (opts || g.creatures(p).filter(c => unblockedAttacker(g, c)))
      .filter(c => c.controller === p && c.owner === p && !c.faceDown && !c.isToken && !c.isCommander && !keep.has(c.def.name) && g.power(c) < 4);
    return list.sort((a, b) => g.power(a) - g.power(b))[0] || null;
  }
  D({
    name: "Opposition Agent", cost: "{2}{B}", type: "Creature — Human Rogue", pt: "3/2",
    keywords: ["flash"],
    text: "Flash\nYou control your opponents while they're searching their libraries.\nWhile an opponent is searching their library, they exile each card they find. You may play those cards for as long as they remain exiled, and you may spend mana as though it were mana of any color to cast them.",
    note: "Your opponents still choose what they find. Right after an opponent searches, the card they found (from their hand, the battlefield, or the top of their library for a tutor that puts it there) is exiled and you may play it. You pay its normal cost: the game has no \"mana of any color\".",
    triggers: [{
      on: "searchLibrary",
      when: (g, s, ev) => {
        if (!isOpp(g, s.controller, ev.p)) return false;
        AGENT_SNAP.set(ev, { lib: new Set(ev.p.library), hand: new Set(ev.p.hand), top: ev.p.library[0] || null });
        return true;
      },
      do: (g, s, ev, { p }) => {
        const q = ev.p, snap = AGENT_SNAP.get(ev);
        if (!snap || q.lost) return;
        let found = q.hand.filter(c => snap.lib.has(c) && !snap.hand.has(c)).concat(g.battlefield.filter(o => o.owner === q && snap.lib.has(o)));
        if (!found.length && q.library[0] && q.library[0] !== snap.top) found = [q.library[0]];
        for (const c of found) {
          if (c.zone === "battlefield") g.exile(c, s); else g.moveTo(c, "exile");
          if (c.zone === "exile") c.playable = { by: p, forever: true };
        }
        if (found.length) log(g, `${q.name}'s search is exiled (Opposition Agent): ${p.name} may play ${found.map(c => c.def.name).join(" and ")}.`, p, found.map(c => c.def.name).concat(["Opposition Agent"]));
      }
    }],
    ai: { priority: 7, threat: 3, instantEnd: true }
  });
  const AGENT_SNAP = new WeakMap();
  let notionDrawing = false;
  D({
    name: "Notion Thief", cost: "{2}{U}{B}", type: "Creature — Human Rogue", pt: "3/1",
    keywords: ["flash"],
    text: "Flash\nIf an opponent would draw a card except the first one they draw in each of their draw steps, instead that player skips that draw and you draw a card.",
    note: "Written as a trigger: when an opponent draws a card that isn't the first of their draw step, that card goes back on top of their library and you draw a card. (\"Whenever you draw\" effects still see their draw.)",
    triggers: [{
      on: "draw",
      when: (g, s, ev) => {
        if (notionDrawing || !isOpp(g, s.controller, ev.p)) return false;
        if (g.phase === "draw" && g.active === ev.p) {
          const seen = s.state.ntSeen || (s.state.ntSeen = {});
          if (seen[ev.p.id] !== g.turn) { seen[ev.p.id] = g.turn; return false; }
        }
        return true;
      },
      do: (g, s, ev, { p }) => {
        backOnTop(g, ev.p, ev.o);
        notionDrawing = true;
        try { g.draw(p, 1); } finally { notionDrawing = false; }
        log(g, `${p.name} draws instead of ${ev.p.name} (Notion Thief).`, p, ["Notion Thief"]);
      }
    }],
    ai: { priority: 7, threat: 3, instantEnd: true }
  });
  D({
    name: "Brine Elemental", cost: "{4}{U}{U}", type: "Creature — Elemental", pt: "5/4",
    morph: "{5}{U}{U}",
    text: "Morph {5}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen Brine Elemental is turned face up, each opponent skips their next untap step.",
    note: "Each permanent your opponents control when it's turned face up stays tapped through their next untap step. Etrata turns it face up for {2}{U}{B} ({U}{B} with Training Grounds).",
    triggers: [{ on: "turnedFaceUp", self: true, do: (g, s, ev, { p }) => brineLock(g, s, p) }],
    faceUpAi: { use: (g, p, o, ctx) => mainWin(ctx) && g.active === p },
    ai: {
      priority: 7, threat: 4,
      cast: () => false,   // cast for its mana cost, nothing happens: it's only good turned face up
      morph: (g, p) => (onBf(g, p, "Etrata, Deadly Fugitive") || manaNow(g, p) >= 10 ? 14 : 9)
    }
  });
  function brineLock(g, s, p) {
    for (const q of g.opponents(p)) {
      for (const o of g.battlefield) if (o.controller === q) o.skipUntap = true;
      q.cetrataSkip = g.turn;
    }
    g.bump();
    log(g, `Each opponent of ${p.name} skips their next untap step (${s.def.name}).`, p, ["Brine Elemental"]);
  }

  /* Vesuvan Shapeshifter: a copy that can turn itself face down each upkeep and come back up as a
     copy again (with Brine Elemental: a lock). */
  function turnFaceDown(g, o) {
    if (o.zone !== "battlefield" || o.faceDown) return;
    o.def = MK.faceDownDef(o.cardDef, "morph");
    o.faceDown = { kind: "morph" };
    g.ts++; g.bump();
    log(g, `${o.controller.name} turns Vesuvan Shapeshifter face down.`, o.controller, []);
  }
  const VES_UPKEEP = {
    on: "upkeep", when: (g, s, ev) => ev.p === s.controller && !s.faceDown && s.cardDef && s.cardDef.name === "Vesuvan Shapeshifter" && s.def !== s.cardDef,
    optional: "Vesuvan Shapeshifter: turn it face down?", ai: "vesuvanDown",
    do: (g, s) => turnFaceDown(g, s)
  };
  /* Should the bot turn its Vesuvan copy face down? Yes when it copies a "when turned face up"
     creature (Brine Elemental) and it can pay the morph cost {1}{U} this turn. */
  const vesDown = (g, p, o) => !!o && o.def.triggers.some(t => t.on === "turnedFaceUp" && t.self) && g.canPay(p, pc("{1}{U}"), { for: "special" });
  function becomeCopy(g, s, pick) {
    const base = pick.copyDef || pick.def;
    const ai = Object.assign({}, base.ai || {});
    const prev = ai.confirm;
    ai.confirm = (g2, p, req) => (req.purpose === "vesuvanDown" ? vesDown(g2, p, req.src) : prev ? prev(g2, p, req) : true);
    s.def = MK.derive(base, { triggers: base.triggers.concat([VES_UPKEEP]), ai });
    s.state.vesCopying = false;
    g.ts++; g.bump();
    log(g, `Vesuvan Shapeshifter becomes a copy of ${base.name}.`, s.controller, [base.name]);
  }
  const vesOptions = (g, s) => g.battlefield.filter(c => c !== s && g.isCreature(c) && !c.faceDown);
  function vesPick(g, p, opts) {
    const brine = opts.find(c => c.def.name === "Brine Elemental");
    if (brine) return brine;
    return opts.filter(c => !(c.def.legendary && c.controller === p)).sort((a, b) => (AI().value ? AI().value(g, b) - AI().value(g, a) : g.power(b) - g.power(a)))[0] || null;
  }
  const VES_FACEUP = {
    on: "turnedFaceUp", self: true,
    // as it's turned face up it may become a copy: until then it isn't a 0/0 that dies
    when: (g, s) => { s.state.vesCopying = true; return true; },
    do: async (g, s, ev, { p }) => {
      if (s.zone !== "battlefield" || s.faceDown) return;
      const opts = vesOptions(g, s);
      const pick = opts.length ? await g.ask(p, { type: "target", prompt: "Vesuvan Shapeshifter: become a copy of another creature (or nothing: it's a 0/0)", options: opts, optional: true, purpose: "vesuvanCopy", src: s }) : null;
      s.state.vesCopying = false;
      g.bump();
      if (!pick || !opts.includes(pick) || pick.zone !== "battlefield" || s.zone !== "battlefield" || s.faceDown) return;
      becomeCopy(g, s, pick);
      // it was already the copy as it turned face up, so the copy's "when turned face up" triggers
      for (const tr of s.def.triggers) if (tr.on === "turnedFaceUp" && tr.self && tr !== VES_FACEUP) { try { await tr.do(g, s, ev, { p }); } catch (e) { g.warn(e, s); } }
    }
  };
  D({
    name: "Vesuvan Shapeshifter", cost: "{3}{U}{U}", type: "Creature — Shapeshifter", pt: "0/0",
    morph: "{1}{U}",
    text: "As Vesuvan Shapeshifter enters or is turned face up, you may choose another creature on the battlefield. If you do, until Vesuvan Shapeshifter is turned face down, it becomes a copy of that creature, except it has \"At the beginning of your upkeep, you may turn this creature face down.\"\nMorph {1}{U}",
    note: "It can't copy a face-down creature. When it's turned face up as a copy of Brine Elemental, Brine's \"when turned face up\" ability triggers.",
    cda: (g, o) => (o.state.vesCopying ? [0, 1] : [0, 0]),
    asEnters: async (g, p, o) => {
      const opts = vesOptions(g, o);
      if (!opts.length) return;
      const pick = await g.ask(p, { type: "target", prompt: "Vesuvan Shapeshifter: enter as a copy of", options: opts, optional: true, purpose: "vesuvanCopy", src: o });
      if (pick && opts.includes(pick)) becomeCopy(g, o, pick);
    },
    triggers: [VES_FACEUP],
    faceUpAi: { use: (g, p, o, ctx) => mainWin(ctx) && g.active === p && !!vesPick(g, p, vesOptions(g, o)) && (vesOptions(g, o).some(c => c.def.name === "Brine Elemental") || (AI().value && AI().value(g, vesPick(g, p, vesOptions(g, o))) >= 8)) },
    ai: {
      priority: 5,
      morph: () => 10,
      cast: (g, p) => { const o = { state: {} }; const best = vesPick(g, p, vesOptions(g, o)); return best && AI().value && AI().value(g, best) >= 8 ? undefined : false; },
      target: (g, p, req) => (req.purpose === "vesuvanCopy" ? vesPick(g, p, req.options) : undefined)
    }
  });
  D({
    name: "Wormfang Manta", cost: "{5}{U}{U}", type: "Creature — Nightmare Fish Beast", pt: "6/1",
    keywords: ["flying"],
    text: "Flying\nWhen Wormfang Manta enters, you skip your next turn.\nWhen Wormfang Manta leaves the battlefield, you take an extra turn after this one.",
    // a face-down Manta has no abilities: manifested, it never makes you skip a turn, and it only
    // gives the extra turn if it leaves face up (the engine skips a face-down card's own triggers)
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.skipNextTurn(p, s) },
      { on: "leaves", self: true, do: (g, s, ev, { p }) => g.addExtraTurn(p, s) }
    ],
    ai: { priority: 5, cast: (g, p) => (manaNow(g, p) >= 9 ? undefined : false) }
  });
  D({
    name: "Dimir House Guard", cost: "{3}{B}", type: "Creature — Skeleton", pt: "2/3",
    keywords: ["fear"],
    text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSacrifice a creature: Regenerate Dimir House Guard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: TRANSMUTE_NOTE,
    abilities: [{
      label: "Sacrifice a creature: regenerate",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
      do: (g, s) => g.regenerate(s),
      ai: { use: () => false }
    }],
    channel: transmute("{1}{B}{B}"),
    ai: { priority: 3, plan: transmutePlan, target: transmuteTarget }
  });
  D({
    name: "Drift of Phantasms", cost: "{2}{U}", type: "Creature — Spirit", pt: "0/5",
    keywords: ["defender", "flying"],
    text: "Defender (This creature can't attack.)\nFlying\nTransmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: TRANSMUTE_NOTE,
    channel: transmute("{1}{U}{U}"),
    ai: { priority: 3, plan: transmutePlan, target: transmuteTarget }
  });

  /* ================================================================ artifacts */
  D({
    name: "Crystal Shard", cost: "{3}", type: "Artifact",
    text: "{3}, {T} or {U}, {T}: Return target creature to its owner's hand unless its controller pays {1}.",
    abilities: [
      shardAbility("{3}"),
      shardAbility("{U}")
    ],
    ai: {
      priority: 4,
      // the other players always pay {1} when they can
      confirm: (g, p, req) => (req.purpose === "shardPay" ? true : undefined),
      target: (g, p, req) => (req.purpose === "shard" ? shardTarget(g, p, req.options) || undefined : undefined)
    }
  });
  function shardAbility(cost) {
    return {
      label: "Return a creature to its owner's hand", cost, tap: true,
      targets: [{ kind: "creature", purpose: "shard", prompt: "Return to its owner's hand (unless its controller pays {1})" }],
      do: async (g, src, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "battlefield") return;
        const q = t.controller;
        if (q !== ctx.p && g.canPay(q, pc("{1}"))) {
          const ok = await g.ask(q, { type: "confirm", prompt: `Crystal Shard: pay {1} to keep ${g.nameOf(t)}?`, src, purpose: "shardPay" });
          if (ok && g.pay(q, pc("{1}"))) { log(g, `${q.name} pays {1}: ${g.nameOf(t)} stays.`, q, ["Crystal Shard"]); return; }
        }
        g.bounce(t);
      },
      ai: { use: (g, p, o, ctx) => !!shardTarget(g, p, null, ctx) }
    };
  }
  /* Bots use the Shard to save their own creature from removal, or to replay Tribute Mage. */
  function shardTarget(g, p, opts, ctx) {
    const pool = opts || g.creatures(p);
    const top = g.stack[g.stack.length - 1];
    if (top && top.p !== p) {
      const hit = (top.targets || []).find(t => t && !g.isPlayer(t) && t.controller === p && t.owner === p && !t.faceDown && !t.isToken && pool.includes(t) && g.isCreature(t));
      if (hit && (!ctx || ctx.window === "stack")) return hit;
    }
    // the turn loop: a face-up Wormfang Manta that leaves gives an extra turn (after combat, on our turn)
    const manta = pool.find(c => c.controller === p && c.def.name === "Wormfang Manta" && !c.faceDown);
    if (manta && g.active === p && (!ctx || ctx.window === "main2")) return manta;
    if (ctx && !endBeforeMe(g, p, ctx)) return null;
    return pool.find(c => c.controller === p && c.def.name === "Tribute Mage") || null;
  }
  D({
    name: "Wishclaw Talisman", cost: "{1}{B}", type: "Artifact",
    text: "Wishclaw Talisman enters with three wish counters on it.\n{1}, {T}, Remove a wish counter from Wishclaw Talisman: Search your library for a card, put it into your hand, then shuffle. An opponent gains control of Wishclaw Talisman. Activate only during your turn.",
    note: "The player who activates it picks the opponent who gets it.",
    etbCounters: () => ({ wish: 3 }),
    abilities: [{
      label: "Tutor, then an opponent gets it", cost: "{1}", tap: true,
      condition: (g, o, p) => g.active === p && (o.counters.wish || 0) > 0,
      do: async (g, src, ctx) => {
        const p = ctx.p;
        if (!g.removeCounters(src, "wish", 1)) return;
        await tutor(g, p, src, { prompt: "Wishclaw Talisman: search for a card" });
        const opps = g.opponents(p);
        if (!opps.length || src.zone !== "battlefield") return;
        let q = opps.length === 1 ? opps[0] : await g.ask(p, { type: "target", prompt: "Wishclaw Talisman: which opponent gains control of it?", options: opps, purpose: "wishclawGive", src });
        if (!q || !opps.includes(q)) q = opps[0];
        src.controller = q;
        g.ts++; g.bump();
        log(g, `${q.name} gains control of Wishclaw Talisman.`, q, ["Wishclaw Talisman"]);
      },
      ai: { use: (g, p, o, ctx) => wishclawUse(g, p, o, ctx) }
    }],
    ai: {
      priority: 6, tutor: true,
      cards: tutorCards,
      target: (g, p, req) => {
        if (req.purpose !== "wishclawGive") return undefined;
        // the opponent least able to use it: the fewest cards in hand and lands
        return req.options.slice().sort((a, b) => (a.hand.length + g.controlled(a, o => g.isLand(o)).length) - (b.hand.length + g.controlled(b, o => g.isLand(o)).length))[0];
      }
    }
  });
  function wishclawUse(g, p, o, ctx) {
    if (ctx.window !== "main1" || g.active !== p) return false;
    if (!isOurs(p)) return g.turn >= 4 && manaNow(g, p) >= 3;
    // ours: only the turn it finds a missing combo piece we can cast right away
    const b = bestPiece(g, p, p.library.slice());
    return !!b && b.rank >= 3 && manaNow(g, p) - 1 >= b.c.def.mv;
  }
  D({
    name: "Mox Amber", cost: "{0}", type: "Legendary Artifact",
    text: "{T}: Add one mana of any color among legendary creatures and planeswalkers you control.",
    mana: [{ tap: true, produce: (g, o) => {
      const out = new Set();
      for (const c of g.battlefield) if (c.controller === o.controller && c !== o && c.def.legendary && (g.isCreature(c) || g.isPlaneswalker(c))) for (const k of g.colorsOf(c)) if ("WUBRG".includes(k)) out.add(k);
      return out.size ? [...out] : null;
    } }],
    ai: { priority: 9, ramp: true, plan: deckPlan }
  });

  /* ================================================================ enchantments */
  D({
    name: "Necropotence", cost: "{B}{B}{B}", type: "Enchantment",
    text: "Skip your draw step.\nWhenever you discard a card, exile that card from your graveyard.\nPay 1 life: Exile the top card of your library face down. Put that card into your hand at the beginning of your next end step.",
    note: "Skipping the draw step is written as a trigger: the card you draw in your draw step goes back on top of your library. The exiled cards are face up here.",
    triggers: [
      {
        on: "draw",
        when: (g, s, ev) => ev.p === s.controller && g.phase === "draw" && g.active === s.controller && s.state.necroTurn !== g.turn && ((s.state.necroTurn = g.turn), true),
        do: (g, s, ev, { p }) => { if (backOnTop(g, p, ev.o)) log(g, `${p.name} skips their draw (Necropotence).`, p, ["Necropotence"]); }
      },
      { on: "discard", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev) => { if (ev.o && ev.o.zone === "graveyard") g.moveTo(ev.o, "exile"); } }
    ],
    abilities: [{
      label: "Pay 1 life: exile the top card, to your hand at your end step", payLife: 1,
      condition: (g, o, p) => p.library.length > 0,
      do: (g, src, ctx) => {
        const p = ctx.p, c = p.library[0];
        if (!c) return;
        g.moveTo(c, "exile");
        if (c.zone !== "exile") return;
        g.delayed.push({ at: "endStep", once: true, player: p, controller: p, src, do: async g2 => { if (c.zone === "exile" && !p.lost) { g2.moveTo(c, "hand"); log(g2, `${p.name} puts a card exiled with Necropotence into their hand.`, p, ["Necropotence"]); } } });
        log(g, `${p.name} pays 1 life and exiles the top card of their library (Necropotence).`, p, ["Necropotence"]);
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (ctx.window !== "main2" || g.active !== p) return false;
          const pending = g.delayed.filter(d => d.src === o).length;
          const n = Math.min(p.life - 14, 6 - p.hand.length - pending, 5);
          return n > 0 ? { repeat: n } : false;
        }
      }
    }],
    ai: { priority: 8, draw: true, plan: deckPlan }
  });
  T.cetrataMercenary = MK.tokenDef({ key: "cetrata-mercenary", name: "Shapeshifter", pt: [3, 2], colors: "", subtypes: ["Shapeshifter"], changeling: true, keywords: ["changeling"], text: "Changeling (This token is every creature type.)" });
  D({
    name: "Black Market Connections", cost: "{2}{B}", type: "Enchantment",
    text: "At the beginning of your first main phase, choose one or more —\n• Sell Contraband — Create a Treasure token. You lose 1 life.\n• Buy Information — Draw a card. You lose 2 life.\n• Hire a Mercenary — Create a 3/2 colorless Shapeshifter creature token with changeling. You lose 3 life.",
    note: "You're asked about each mode in turn. If you decline all three, you sell contraband.",
    triggers: [{
      on: "precombatMain", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const modes = [
          { purpose: "bmcTreasure", prompt: "Black Market Connections: Sell Contraband (a Treasure, you lose 1 life)?", run: () => { g.createToken(p, T.treasure); g.loseLife(p, 1, s); } },
          { purpose: "bmcDraw", prompt: "Black Market Connections: Buy Information (draw a card, you lose 2 life)?", run: () => { g.draw(p, 1); g.loseLife(p, 2, s); } },
          { purpose: "bmcMerc", prompt: "Black Market Connections: Hire a Mercenary (a 3/2 changeling, you lose 3 life)?", run: () => { g.createToken(p, T.cetrataMercenary); g.loseLife(p, 3, s); } }
        ];
        const picked = [];
        for (const m of modes) if (await g.ask(p, { type: "confirm", prompt: m.prompt, src: s, purpose: m.purpose })) picked.push(m);
        if (!picked.length) picked.push(modes[0]);
        for (const m of picked) { if (p.lost) break; m.run(); }
      }
    }],
    ai: {
      priority: 7, draw: true, plan: deckPlan,
      confirm: (g, p, req) => {
        const life = p.life;
        if (req.purpose === "bmcTreasure") return life > 5;
        if (req.purpose === "bmcDraw") return life > 12;
        if (req.purpose === "bmcMerc") return life > 20;
        return true;
      }
    }
  });

  /* ================================================================ instants and sorceries */
  D({
    name: "Culling the Weak", cost: "{B}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice a creature.\nAdd {B}{B}{B}{B}.",
    note: "The creature is sacrificed right after the spell is cast. The mana stays until the end of the step or phase.",
    canCast: (g, p) => g.creatures(p).length > 0,
    onCast: sacAsCost(),
    spell: { do: (g, ctx) => { ctx.p.pool.B += 4; g.bump(); log(g, `${ctx.p.name} adds {B}{B}{B}{B}.`, ctx.p, ["Culling the Weak"]); } },
    ai: {
      target: (g, p, req) => (req.purpose === "sacrifice" ? req.options.slice().sort((a, b) => fodderScore(g, a) - fodderScore(g, b))[0] : undefined),
      cast: (g, p, o, { window }) => {
        if (window !== "main1" || !cheapFodder(g, p)) return false;
        const have = manaNow(g, p);
        const big = p.hand.some(c => c !== o && !c.def.types.includes("Land") && c.def.mv >= have + 1 && c.def.mv <= have + 3 && !g.castOptions(p, c).length && (c.def.colors.length === 0 || c.def.colors.includes("B")));
        return big ? 38 : false;
      }
    }
  });
  D({
    name: "Dizzy Spell", cost: "{U}", type: "Instant",
    text: "Target creature gets -3/-0 until end of turn.\nTransmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: TRANSMUTE_NOTE,
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "-3/-0 until end of turn" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.pump(t, -3, 0); }
    },
    channel: transmute("{1}{U}{U}"),
    ai: { priority: 2, cast: () => false, plan: transmutePlan, target: transmuteTarget }
  });
  D({
    name: "Shred Memory", cost: "{1}{B}", type: "Instant",
    text: "Exile up to four target cards from a single graveyard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: "You target the player, then choose up to four cards from their graveyard as it resolves. " + TRANSMUTE_NOTE,
    spell: {
      targets: [{ kind: "player", purpose: "gy", prompt: "Exile up to four cards from this player's graveyard" }],
      do: async (g, ctx) => {
        const q = ctx.targets[0];
        if (!q || !ctx.legal[0] || !q.graveyard.length) return;
        const opts = q.graveyard.slice();
        const pick = await g.ask(ctx.p, { type: "cards", prompt: `Shred Memory: exile up to four cards from ${q.name}'s graveyard`, options: opts, min: 0, max: Math.min(4, opts.length), purpose: "shred", src: ctx.o });
        const list = (pick || []).filter(c => opts.includes(c) && c.zone === "graveyard").slice(0, 4);
        for (const c of list) g.moveTo(c, "exile");
        if (list.length) log(g, `${ctx.p.name} exiles ${list.map(c => c.def.name).join(", ")} from ${q.name}'s graveyard.`, ctx.p, list.map(c => c.def.name));
      }
    },
    channel: transmute("{1}{B}{B}"),
    ai: {
      priority: 2, cast: () => false, plan: transmutePlan,
      target: (g, p, req) => (req.purpose === "transmute" ? transmuteTarget(g, p, req) : req.purpose === "gy" ? req.options.filter(q => q !== p).sort((a, b) => b.graveyard.length - a.graveyard.length)[0] : undefined),
      cards: (g, p, req) => (req.purpose === "shred" ? req.options.slice().sort((a, b) => b.def.mv - a.def.mv).slice(0, req.max) : null)
    }
  });
  D({
    name: "Muddle the Mixture", cost: "{U}{U}", type: "Instant",
    text: "Counter target instant or sorcery spell.\nTransmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: TRANSMUTE_NOTE,
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target instant or sorcery spell", filter: (g, item, p) => item.p !== p && (item.o.def.types.includes("Instant") || item.o.def.types.includes("Sorcery")) }],
      do: (g, ctx) => { const it = ctx.targets[0]; if (ctx.legal[0] && it && g.stack.includes(it)) g.counterSpell(it, ctx.o); }
    },
    channel: transmute("{1}{U}{U}"),
    ai: { priority: 4, counter: true, plan: transmutePlan, target: transmuteTarget }
  });
  D({
    name: "Grim Tutor", cost: "{1}{B}{B}", type: "Sorcery",
    text: "Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.",
    spell: { do: async (g, ctx) => { await tutor(g, ctx.p, ctx.o, { prompt: "Grim Tutor: search for a card" }); g.loseLife(ctx.p, 3, ctx.o); } },
    ai: { tutor: true, priority: 7, cards: tutorCards }
  });
  D({
    name: "Beseech the Mirror", cost: "{1}{B}{B}{B}", type: "Sorcery",
    text: "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nSearch your library for a card, exile it face down, then shuffle. If this spell was bargained, you may cast the exiled card without paying its mana cost if that spell's mana value is 4 or less. Put the exiled card into your hand if it wasn't cast this way.",
    note: "You choose whether to bargain (and what to sacrifice) as it resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, src = ctx.o;
        const fodder = g.battlefield.filter(o => o.controller === p && (g.isArtifact(o) || g.isEnchantment(o) || o.isToken));
        let bargained = false;
        if (fodder.length) {
          const pick = await g.ask(p, { type: "cards", prompt: "Beseech the Mirror: bargain? Sacrifice an artifact, enchantment or token (or none)", options: fodder, min: 0, max: 1, purpose: "bargain", src });
          const c = (pick || []).find(x => fodder.includes(x) && x.zone === "battlefield");
          if (c) { g.sacrifice(c); bargained = true; }
        }
        const got = await tutor(g, p, src, { prompt: "Beseech the Mirror: search for a card (exiled face down)" });
        const card = got[0];
        if (!card) return;
        g.moveTo(card, "exile");
        if (card.zone !== "exile") return;
        if (bargained && card.def.mv <= 4 && !card.def.types.includes("Land")) {
          const ok = await g.ask(p, { type: "confirm", prompt: `Cast ${card.def.name} without paying its mana cost?`, src, purpose: "beseechCast", card });
          if (ok) { const cast = await g.castWithoutPaying(p, card); if (cast || card.zone !== "exile") return; }
        }
        if (card.zone === "exile") g.moveTo(card, "hand");
      }
    },
    ai: {
      tutor: true, priority: 6, cards: (g, p, req) => {
        if (req.purpose === "bargain") {
          const o = req.options;
          const cheap = o.filter(c => c.def.name === "Treasure").concat(o.filter(c => c.def.name === "Wishclaw Talisman"), o.filter(c => c.isToken), o.filter(c => c.def.name === "Mind Stone"));
          return cheap.length ? [cheap[0]] : [];
        }
        return tutorCards(g, p, req);
      },
      confirm: (g, p, req) => {
        if (req.purpose !== "beseechCast") return true;
        const d = req.card && req.card.def, ai = (d && d.ai) || {};
        return !!d && !ai.counter && !ai.protection && !ai.instantEnd && !(d.spell && d.spell.targets && d.spell.targets.length);
      }
    }
  });
  D({
    name: "Lim-Dûl's Vault", cost: "{U}{B}", type: "Instant",
    text: "Look at the top five cards of your library. As many times as you choose, you may pay 1 life, put those cards on the bottom of your library in any order, then look at the top five cards of your library. Then shuffle and put the last cards you looked at this way on top in any order.",
    note: "You choose which of the last five goes on top; the other four keep their order below it.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, src = ctx.o;
        const rounds = Math.max(0, Math.ceil(p.library.length / 5) - 1);
        for (let i = 0; i < rounds && !p.lost; i++) {
          const top = p.library.slice(0, 5);
          const again = p.life > 1 && await g.ask(p, { type: "confirm", prompt: `Lim-Dûl's Vault: you see ${top.map(c => c.def.name).join(", ")}. Pay 1 life to put them on the bottom and look at the next five?`, src, purpose: "vaultAgain", cards: top });
          if (!again || !g.payLife(p, 1)) break;
          for (const c of top) { g.removeFromZone(c); c.zone = "library"; p.library.push(c); }
          g.bump();
        }
        const last = p.library.slice(0, 5);
        for (const c of last) g.removeFromZone(c);
        g.shuffle(p);
        let first = last[0];
        if (last.length > 1) {
          const pick = await g.ask(p, { type: "cards", prompt: "Lim-Dûl's Vault: choose the card to put on top", options: last, min: 1, max: 1, purpose: "vaultTop", src });
          first = (pick || []).find(c => last.includes(c)) || last[0];
        }
        const order = [first].concat(last.filter(c => c !== first));
        for (let i = order.length - 1; i >= 0; i--) { order[i].zone = "library"; p.library.unshift(order[i]); }
        g.bump();
        log(g, `${p.name} puts five cards back on top of their library (Lim-Dûl's Vault).`, p, ["Lim-Dûl's Vault"]);
      }
    },
    ai: {
      tutor: true, priority: 5, instantEnd: true,
      confirm: (g, p, req) => {
        if (req.purpose !== "vaultAgain") return true;
        const want = bestPiece(g, p, p.library.slice());
        if (!want || p.life <= 10) return false;
        return !(req.cards || []).includes(want.c);
      },
      cards: (g, p, req) => {
        if (req.purpose !== "vaultTop") return null;
        const b = bestPiece(g, p, req.options);
        return [b ? b.c : req.options.slice().sort((a, b2) => ((b2.def.ai && b2.def.ai.priority) || 5) - ((a.def.ai && a.def.ai.priority) || 5))[0]];
      }
    }
  });
  D({
    name: "Scheming Symmetry", cost: "{B}", type: "Sorcery",
    text: "Choose two target players. Each of them searches their library for a card, then shuffles and puts that card on top.",
    note: "If both targets are the same player, they search once.",
    spell: {
      targets: [
        { kind: "player", purpose: "symmetryMe", prompt: "Scheming Symmetry: first player who searches" },
        { kind: "player", purpose: "symmetryOther", prompt: "Scheming Symmetry: second player who searches" }
      ],
      do: async (g, ctx) => {
        const seen = new Set();
        for (let i = 0; i < 2; i++) {
          const q = ctx.targets[i];
          if (!q || !ctx.legal[i] || q.lost || seen.has(q)) continue;
          seen.add(q);
          if (isOurs(q)) await tutor(g, q, ctx.o, { to: "top", prompt: "Scheming Symmetry: search for a card to put on top" });
          else await g.search(q, { to: "top", prompt: "Scheming Symmetry: search for a card to put on top", src: ctx.o, hidden: true, purpose: "tutor" });
        }
      }
    },
    ai: {
      tutor: true, priority: 6, cards: tutorCards,
      target: (g, p, req) => {
        if (req.purpose === "symmetryMe") return req.options.includes(p) ? p : undefined;
        if (req.purpose === "symmetryOther") {
          const opps = req.options.filter(q => q !== p);
          // with Opposition Agent out we take what they find; else the opponent with the least going on
          return opps.sort((a, b) => (a.hand.length + g.controlled(a).length) - (b.hand.length + g.controlled(b).length))[0];
        }
        return undefined;
      }
    }
  });
  D({
    name: "Praetor's Grasp", cost: "{1}{B}{B}", type: "Sorcery",
    text: "Search target opponent's library for a card and exile it face down. Then that player shuffles. You may look at and play that card for as long as it remains exiled.",
    note: "The exiled card is face up here.",
    spell: {
      targets: [{ kind: "opponent", purpose: "harm", prompt: "Search this opponent's library" }],
      do: async (g, ctx) => {
        const p = ctx.p, q = ctx.targets[0];
        if (!q || !ctx.legal[0] || q.lost || !q.library.length) return;
        const opts = q.library.slice();
        const pick = await g.ask(p, { type: "cards", prompt: `Praetor's Grasp: exile a card from ${q.name}'s library (you may play it)`, options: opts, min: 1, max: 1, purpose: "grasp", src: ctx.o });
        const c = (pick || []).find(x => opts.includes(x)) || null;
        if (c) { g.moveTo(c, "exile"); if (c.zone === "exile") c.playable = { by: p, forever: true }; log(g, `${p.name} exiles a card from ${q.name}'s library (Praetor's Grasp).`, p, []); }
        g.shuffle(q);
      }
    },
    ai: { tutor: true, priority: 5, cards: (g, p, req) => (req.purpose === "grasp" ? [stealPick(g, p, req.options)] : null) }
  });
  D({
    name: "Windfall", cost: "{2}{U}", type: "Sorcery",
    text: "Each player discards their hand, then draws cards equal to the greatest number of cards a player discarded this way.",
    spell: {
      do: (g, ctx) => {
        let most = 0;
        const order = g.orderFrom ? g.orderFrom(ctx.p) : g.players;
        for (const q of order) {
          if (q.lost) continue;
          const hand = q.hand.slice();
          most = Math.max(most, hand.length);
          for (const c of hand) g.discard(q, c);
        }
        for (const q of order) if (!q.lost) g.draw(q, most);
        log(g, `Each player discards their hand and draws ${most} (Windfall).`, ctx.p, ["Windfall"]);
      }
    },
    ai: {
      priority: 4, draw: true,
      cast: (g, p, o) => {
        if (onBf(g, p, "Notion Thief")) return 30;
        const theirs = Math.max(0, ...g.opponents(p).map(q => q.hand.length));
        return p.hand.length <= 2 && theirs >= 3 ? undefined : false;
      }
    }
  });

  /* ================================================================ lands */
  D({
    name: "Morphic Pool", type: "Land",
    text: "This land enters tapped unless you have two or more opponents.\n{T}: Add {U} or {B}.",
    etbTapped: (g, o) => !!o && !!o.controller && o.id !== -1 && g.opponents(o.controller).length < 2,
    mana: [{ tap: true, produce: ["U", "B"] }],
    ai: { plan: deckPlan }
  });
  const islandOrSwamp = (g, p, except) => g.controlled(p, l => l !== except && g.isLand(l) && (l.def.subtypes.includes("Island") || l.def.subtypes.includes("Swamp"))).length > 0;
  D({
    name: "Gloomlake Verge", type: "Land",
    text: "{T}: Add {U}.\n{T}: Add {B}. Activate only if you control an Island or a Swamp.",
    mana: [{ tap: true, produce: "U" }, { tap: true, produce: "B", condition: (g, o) => islandOrSwamp(g, o.controller, o) }],
    ai: { plan: deckPlan }
  });
  D({
    name: "Undercity Sewers", type: "Land — Island Swamp",
    text: "({T}: Add {U} or {B}.)\nThis land enters tapped.\nWhen this land enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
    etbTapped: true,
    mana: [{ tap: true, produce: ["U", "B"] }],
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.surveil(p, 1, s) }],
    ai: { plan: deckPlan }
  });
  const legendaryCreatures = (g, p) => g.controlled(p, o => o.def.legendary && g.isCreature(o)).length;
  D({
    name: "Otawara, Soaring City", type: "Legendary Land",
    text: "{T}: Add {U}.\nChannel — {3}{U}, Discard Otawara, Soaring City: Return target artifact, creature, enchantment, or planeswalker to its owner's hand. This ability costs {1} less to activate for each legendary creature you control.",
    mana: [{ tap: true, produce: "U" }],
    channel: {
      label: "Channel: return an artifact, creature, enchantment or planeswalker to its owner's hand", cost: "{3}{U}",
      costReduce: (g, p) => legendaryCreatures(g, p),
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Return to its owner's hand", filter: (g, o) => !g.isLand(o) && (g.isArtifact(o) || g.isCreature(o) || g.isEnchantment(o) || g.isPlaneswalker(o)) }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.bounce(t); }
    },
    ai: { plan: deckPlan }
  });
  D({
    name: "Takenuma, Abandoned Mire", type: "Legendary Land",
    text: "{T}: Add {B}.\nChannel — {3}{B}, Discard Takenuma, Abandoned Mire: Mill three cards, then return a creature or planeswalker card from your graveyard to your hand. This ability costs {1} less to activate for each legendary creature you control.",
    mana: [{ tap: true, produce: "B" }],
    channel: {
      label: "Channel: mill three, return a creature or planeswalker card to your hand", cost: "{3}{B}",
      costReduce: (g, p) => legendaryCreatures(g, p),
      do: async (g, s, ctx) => {
        const p = ctx.p;
        g.mill(p, 3);
        const opts = p.graveyard.filter(c => c.def.types.includes("Creature") || c.def.types.includes("Planeswalker"));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Takenuma: return a creature or planeswalker card to your hand", options: opts, min: 1, max: 1, purpose: "takenuma", src: s });
        const c = (pick || []).find(x => opts.includes(x)) || opts[0];
        if (c.zone === "graveyard") { g.moveTo(c, "hand"); log(g, `${p.name} returns ${c.def.name} to their hand.`, p, [c.def.name]); }
      }
    },
    ai: { plan: deckPlan, cards: (g, p, req) => { if (req.purpose !== "takenuma") return null; const b = bestPiece(g, p, req.options); return [b ? b.c : req.options.slice().sort((a, c) => c.def.mv - a.def.mv)[0]]; } }
  });

  /* ================================================================ upgrade candidates
     Cards tried as upgrades (etrata-deck/underused-tech/FINDINGS.md). The deck list below says which
     ones are in; the rest stay defined so the sim can test them (tools/sim/run.js --cut). */
  const defendingCombat = (g, p) => !!g.combat && g.combat.attacker !== p;
  const attackersAt = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.zone === "battlefield" && a.combat && g.defenderOf(a.combat.attacking) === p) : []);
  D({
    name: "Silumgar Assassin", cost: "{1}{B}", type: "Creature — Human Assassin", pt: "2/1",
    morph: "{2}{B}", megamorph: true,
    text: "Creatures with power greater than Silumgar Assassin's power can't block it.\nMegamorph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\nWhen Silumgar Assassin is turned face up, destroy target creature with power 3 or less an opponent controls.",
    canBeBlockedBy: (g, a, b) => g.power(b) <= g.power(a),
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", prompt: "Silumgar Assassin: destroy target creature with power 3 or less an opponent controls", filter: (g2, o, pl) => o.controller !== pl && g2.power(o) <= 3 }), s);
        if (t && t.zone === "battlefield" && g.power(t) <= 3) g.destroy(t, s);
      }
    }],
    // the bots flip it to kill an attacker coming at them, or a real threat in their main phase
    faceUpAi: {
      use: (g, p, o, ctx) => {
        const ok = c => c.controller !== p && g.power(c) <= 3;
        if (ctx.window === "combat" && defendingCombat(g, p)) return attackersAt(g, p).some(a => ok(a) && !a.combat.wasBlocked && g.power(a) >= 2);
        if (mainWin(ctx)) return g.battlefield.some(c => g.isCreature(c) && ok(c) && AI().threat && AI().threat(g, c, p) >= 4);
        return false;
      }
    },
    ai: { priority: 6, morph: (g, p) => (manaNow(g, p) >= 3 ? 9 : -1), cast: (g, p) => (manaNow(g, p) >= 3 ? false : undefined) }
  });
  D({
    name: "Stratus Dancer", cost: "{1}{U}", type: "Creature — Djinn Monk", pt: "2/1",
    keywords: ["flying"], morph: "{1}{U}", megamorph: true,
    text: "Flying\nMegamorph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\nWhen Stratus Dancer is turned face up, counter target instant or sorcery spell.",
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: async (g, s, ev, { p }) => {
        const isIS = item => item.kind === "spell" && !item.faceDown && (item.o.def.types.includes("Instant") || item.o.def.types.includes("Sorcery"));
        const it = await g.chooseTarget(p, trig({ kind: "spell", purpose: "counter", prompt: "Stratus Dancer: counter target instant or sorcery spell", filter: (g2, item) => isIS(item) }), s);
        if (it && g.stack.includes(it) && isIS(it)) g.counterSpell(it, s);
      }
    }],
    faceUpAi: {
      inStack: true,
      use: (g, p, o, ctx) => {
        const t = g.stack[g.stack.length - 1];
        if (ctx.window !== "stack" || !t || t.p === p || t.kind !== "spell" || t.faceDown) return false;
        const d = t.o.def, ai = d.ai || {};
        if (!(d.types.includes("Instant") || d.types.includes("Sorcery"))) return false;
        return !!(ai.wipe || ai.finisher || ai.combo || (ai.removal && t.targets.some(x => x && !g.isPlayer(x) && x.controller === p)) || d.mv >= 5);
      }
    },
    ai: { priority: 6, morph: (g, p) => (manaNow(g, p) >= 3 ? 9 : -1), cast: (g, p) => (manaNow(g, p) >= 3 ? false : undefined) }
  });
  D({
    name: "Kadena's Silencer", cost: "{1}{U}", type: "Creature — Naga Wizard", pt: "2/1",
    morph: "{1}{U}", megamorph: true,
    text: "When Kadena's Silencer is turned face up, counter all abilities your opponents control.\nMegamorph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)",
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.stack.filter(it => (it.kind === "ability" || it.kind === "trigger") && it.p !== p && it.p && g.opponents(p).includes(it.p));
        for (const it of list) g.counterSpell(it, s);
        log(g, list.length ? `Kadena's Silencer counters ${list.length} abilit${list.length === 1 ? "y" : "ies"}.` : "Kadena's Silencer finds no ability to counter.", p, ["Kadena's Silencer"]);
      }
    }],
    faceUpAi: {
      inStack: true,
      use: (g, p, o, ctx) => {
        if (ctx.window !== "ability") return false;
        const t = g.stack[g.stack.length - 1];
        if (!t || t.p === p || !g.opponents(p).includes(t.p)) return false;
        const harm = (t.targets || []).some(x => x && !g.isPlayer(x) && !x.kind && x.controller === p);
        return harm || g.stack.filter(it => (it.kind === "ability" || it.kind === "trigger") && g.opponents(p).includes(it.p)).length >= 3;
      }
    },
    ai: { priority: 6, morph: (g, p) => (manaNow(g, p) >= 3 ? 9 : -1), cast: (g, p) => (manaNow(g, p) >= 3 ? false : undefined) }
  });
  D({
    name: "Thousand Winds", cost: "{4}{U}{U}", type: "Creature — Elemental", pt: "5/6",
    keywords: ["flying"], morph: "{5}{U}{U}",
    text: "Flying\nMorph {5}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen Thousand Winds is turned face up, return all other tapped creatures to their owners' hands.",
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.battlefield.filter(o => o !== s && o.tapped && g.isCreature(o));
        for (const o of list) g.bounce(o);
        log(g, `Thousand Winds returns ${list.length} tapped creature${list.length === 1 ? "" : "s"}.`, p, ["Thousand Winds"]);
      }
    }],
    // after blocks, when the attackers coming at us are worth more than what we'd lose
    faceUpAi: {
      use: (g, p, o, ctx) => {
        if (ctx.window !== "combat" || !defendingCombat(g, p)) return false;
        const theirs = attackersAt(g, p).filter(a => a.tapped);
        const mineTapped = g.battlefield.filter(c => c !== o && c.tapped && g.isCreature(c) && c.controller === p);
        return theirs.length >= 3 && theirs.length > mineTapped.length + 1;
      }
    },
    ai: { priority: 5, morph: (g, p) => (manaNow(g, p) >= 3 ? 8 : -1), cast: (g, p) => (manaNow(g, p) >= 3 ? false : undefined) }
  });
  D({
    name: "Hooded Blightfang", cost: "{2}{B}", type: "Creature — Snake", pt: "1/4",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => ev.o.controller === s.controller && g.kw(ev.o, "deathtouch"),
      do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); g.gainLife(p, 1, s); }
    }, {
      on: "damage", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && g.isCreature(ev.src) && g.kw(ev.src, "deathtouch") && !!ev.target && !g.isPlayer(ev.target) && ev.target.zone === "battlefield" && g.isPlaneswalker(ev.target),
      do: (g, s, ev) => { if (ev.target.zone === "battlefield") g.destroy(ev.target, s); }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Gifted Aetherborn", cost: "{B}{B}", type: "Creature — Aetherborn Vampire", pt: "2/3",
    keywords: ["deathtouch", "lifelink"], text: "Deathtouch, lifelink",
    ai: { priority: 6 }
  });
  D({
    name: "Royal Assassin", cost: "{1}{B}{B}", type: "Creature — Human Assassin", pt: "1/1",
    text: "{T}: Destroy target tapped creature.",
    abilities: [{
      label: "Destroy a tapped creature", tap: true,
      targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy target tapped creature", filter: (g, o) => o.tapped }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield" && t.tapped) g.destroy(t, s); },
      ai: {
        use: (g, p, o, ctx) => {
          const big = c => c.controller !== p && c.tapped && g.isCreature(c) && (g.power(c) >= 3 || (AI().threat && AI().threat(g, c, p) >= 5));
          if (ctx.window === "combat" && defendingCombat(g, p)) return attackersAt(g, p).some(big);
          if (ctx.window === "end") return g.battlefield.some(big);
          return false;
        }
      }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "harm" && req.src && req.src.def.name === "Royal Assassin" ? req.options.filter(o => o && o.controller !== p).sort((a, b) => g.power(b) - g.power(a))[0] : undefined) }
  });
  D({
    name: "Memory Lapse", cost: "{1}{U}", type: "Instant",
    text: "Counter target spell. If that spell is countered this way, put it on top of its owner's library instead of into that player's graveyard.",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell" }],
      do: (g, ctx) => {
        const it = ctx.targets[0];
        if (!ctx.legal[0] || !it) return;
        const card = it.o, copy = it.isCopy;
        if (!g.counterSpell(it, ctx.o) || copy || card.isCommander) return;
        if (card.zone === "graveyard") {
          const q = card.owner;
          g.removeFromZone(card); card.zone = "library"; q.library.unshift(card); g.bump();
          log(g, `${card.def.name} goes on top of ${q.name}'s library.`, ctx.p, [card.def.name]);
        }
      }
    },
    ai: { counter: true }
  });
  D({
    name: "Snuff Out", cost: "{3}{B}", type: "Instant",
    text: "If you control a Swamp, you may pay 4 life rather than pay this spell's mana cost.\nDestroy target nonblack creature. It can't be regenerated.",
    altCosts: [{ label: "Pay 4 life (you control a Swamp)", cost: "", payLife: 4, condition: (g, p) => p.life > 8 && g.battlefield.some(o => o.controller === p && g.isLand(o) && g.hasSub(o, "Swamp")) }],
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy target nonblack creature", filter: (g, o) => !g.colorsOf(o).has("B") }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o, { noRegen: true }); } },
    ai: { removal: true, minThreat: 4 }
  });
  /* More payoffs for the vampire loop: "whenever you gain life, an opponent loses life". */
  const drainOnGain = (each) => ({
    on: "gainLife", when: (g, s, ev) => ev.p === s.controller,
    do: async (g, s, ev, { p }) => {
      if (each) { for (const q of g.opponents(p)) g.loseLife(q, 1, s); return; }
      const t = await g.chooseTarget(p, trig({ kind: "opponent", purpose: "harm", prompt: `${s.def.name}: target opponent loses ${ev.amount} life` }), s);
      if (t) g.loseLife(t, ev.amount, s);
    }
  });
  D({
    name: "Enduring Tenacity", cost: "{2}{B}{B}", type: "Enchantment Creature — Snake Glimmer", pt: "4/3",
    text: "Whenever you gain life, target opponent loses that much life.\nWhen Enduring Tenacity dies, if it was a creature, return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)",
    notCreatureUnless: (g, o) => !o.state.enduring,
    triggers: [drainOnGain(false), {
      on: "dies", self: true, intervening: (g, s, ev) => !(ev.lki && ev.lki.wasEnduring),
      do: (g, s, ev) => {
        const o = ev.o;
        if (!o || o.zone !== "graveyard") return;
        g.putOntoBattlefield([o], o.owner);
        if (o.zone === "battlefield") { o.state.enduring = true; g.bump(); log(g, "Enduring Tenacity returns as an enchantment.", o.owner, ["Enduring Tenacity"]); }
      }
    }],
    ai: { priority: 7 }
  });
  const starscapeTrig = drainOnGain(true);
  T.cetrataStarscape = MK.tokenDef({ key: "cetrata-starscape", name: "Starscape Cleric", pt: [1, 1], colors: "B", subtypes: ["Bat", "Cleric"], keywords: ["flying"], cantBlock: true, text: "Flying\nThis creature can't block.\nWhenever you gain life, each opponent loses 1 life.", triggers: [starscapeTrig] });
  D({
    name: "Starscape Cleric", cost: "{1}{B}", type: "Creature — Bat Cleric", pt: "2/1",
    keywords: ["flying"], kicker: "{2}{B}", cantBlock: true,
    text: "Offspring {2}{B} (You may pay an additional {2}{B} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\nFlying\nThis creature can't block.\nWhenever you gain life, each opponent loses 1 life.",
    note: "Offspring is paid like kicker; the 1/1 copy is made as it resolves.",
    onResolve: (g, p, o, item) => { if (item && item.kicked && o.zone === "battlefield") g.createToken(p, T.cetrataStarscape); },
    triggers: [starscapeTrig],
    ai: { priority: 6 }
  });
  D({
    name: "Defiant Bloodlord", cost: "{5}{B}{B}", type: "Creature — Vampire", pt: "4/5",
    keywords: ["flying"], text: "Flying\nWhenever you gain life, target opponent loses that much life.",
    triggers: [drainOnGain(false)],
    ai: { priority: 6 }
  });
  /* Mutavault has every creature type while animated: it makes itself an Assassin (makesAssassins). */
  const vaultUp = (g, s) => !!(s.state.animated && s.state.animated.turn === g.turn);
  D({
    name: "Mutavault", type: "Land",
    text: "{T}: Add {C}.\n{1}: Until end of turn, Mutavault becomes a 2/2 creature with all creature types. It's still a land.",
    note: "While animated it counts as an Assassin and a Vampire (the engine names the types this deck checks).",
    mana: [{ tap: true, produce: "C" }],
    makesAssassins: (g, s, o) => o === s && vaultUp(g, s),
    abilities: [{
      label: "Becomes a 2/2 creature", cost: "{1}", noSelfMana: true,
      do: (g, s) => { s.state.animated = { turn: g.turn, pt: [2, 2], subtypes: ["Shapeshifter", "Assassin", "Vampire"], colors: [] }; g.bump(); log(g, "Mutavault becomes a 2/2 creature with all creature types.", s.controller, ["Mutavault"]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !o.sick && !o.tapped && !vaultUp(g, o) && g.turn >= 6 && manaNow(g, p) >= 4 }
    }]
  });

  /* ================================================================ the coach
     tips(g, p): what to look for right now, most urgent first ({ level, title, text, cards }). */
  const GENERAL_TUTORS = ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Beseech the Mirror", "Scheming Symmetry", "Lim-Dûl's Vault"];
  const TRANSMUTERS = { "Dizzy Spell": 1, "Shred Memory": 2, "Muddle the Mixture": 2, "Drift of Phantasms": 3, "Dimir House Guard": 4 };
  const short = n => n.split(",")[0];
  const nick = n => n === "Etrata, the Silencer" ? "the Silencer" : short(n);
  const list = names => names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " or " + names[names.length - 1];
  /* The tutors p holds that can find this card. */
  function findersFor(g, p, name) {
    const d = MK.get(name);
    const out = GENERAL_TUTORS.filter(n => inHand(p, n));
    if (onBf(g, p, "Wishclaw Talisman")) out.push("Wishclaw Talisman");
    for (const n in TRANSMUTERS) if (TRANSMUTERS[n] === d.mv && inHand(p, n)) out.push(n);
    if (inHand(p, "Tribute Mage") && d.types.includes("Artifact") && d.mv === 2) out.push("Tribute Mage");
    return [...new Set(out)];
  }
  const HOW = {
    vampire: "Any opponent losing life starts it: an attack that connects, their fetch or shock land, or Duskmantle Guildmage ({1}{U}{B}, then {2}{U}{B} to mill them two). It loops until every opponent is dead.",
    mindcrank: "On any turn: Guildmage's {1}{U}{B} ability, then its {2}{U}{B} mill. Each milled card costs them 1 life, and Mindcrank mills them again for each life lost. One player dies (lowest life first).",
    doubletap: "On your turn, Virtus's hit makes them lose half their life; Bloodletter doubles it: all of it. Make Virtus unblockable: Tetsuko while it's a 1/1 (checked at the start of combat), else Rogue's Passage.",
    brine: "Cast both face down for {3}. Etrata turns Brine face up for {2}{U}{B} ({U}{B} with Training Grounds): opponents skip their next untap step. Vesuvan turns face up for {1}{U} as a copy of Brine (same trigger), then turns itself face down each upkeep and flips again.",
    hitlist: "Mari exiles every opposing creature that dies with a hit counter. The Silencer's hit adds one only if that player controls a creature for it to exile: three on one player and they lose. Hit a player who has a creature, and don't wipe their board first (Toxic Deluge before Mari is out, not after)."
  };
  function coachTips(g, p) {
    const out = [];
    const myTurn = g.active === p;
    const main = myTurn && (g.phase === "main1" || g.phase === "main2");
    const mana = manaNow(g, p);
    const tg = onBf(g, p, "Training Grounds");
    const etrata = onBf(g, p, "Etrata, Deadly Fugitive");
    const states = LINES.map(l => lineState(g, p, l));
    // 1. lines that are live
    for (const st of states.filter(s => s.live)) {
      const l = st.line;
      if (l.key === "vampire") out.push({ level: "win", title: "Vampire loop is live", text: HOW.vampire, cards: l.sides.map(side => side.find(n => onBf(g, p, n))).concat(onBf(g, p, "Duskmantle Guildmage") ? ["Duskmantle Guildmage"] : []) });
      else if (l.key === "mindcrank") out.push({ level: mana >= 7 ? "win" : "plan", title: mana >= 7 ? "Mindcrank + Guildmage: go now" : "Mindcrank + Guildmage on the battlefield", text: `${HOW.mindcrank} It needs {1}{U}{B} plus {2}{U}{B} (7 mana); you have ${mana}.`, cards: ["Mindcrank", "Duskmantle Guildmage"] });
      else if (l.key === "doubletap") {
        const v = bfObj(g, p, "Virtus the Veiled");
        const big = v && g.power(v) > 1 && g.toughness(v) > 1;
        const evade = big ? ` Virtus is ${g.power(v)}/${g.toughness(v)} now${onBf(g, p, "Ramses, Assassin Lord") ? " (Ramses pumps Assassins)" : ""}, so Tetsuko doesn't make it unblockable: use Rogue's Passage ({4}, {T}).` : "";
        out.push({ level: myTurn ? "now" : "plan", title: "Bloodletter + Virtus", text: HOW.doubletap + evade, cards: ["Bloodletter of Aclazotz", "Virtus the Veiled", big ? "Rogue's Passage" : "Tetsuko Umezawa, Fugitive"] });
      }
      else if (l.key === "brine") out.push({ level: "info", title: "Brine lock", text: HOW.brine, cards: ["Brine Elemental", "Vesuvan Shapeshifter"] });
      else if (l.key === "hitlist") {
        const best = g.opponents(p).map(q => ({ q, n: g.hitCount ? g.hitCount(q) : 0 })).sort((a, b) => b.n - a.n)[0];
        out.push({ level: best && best.n >= 2 ? "now" : "info", title: "Mari + the Silencer", text: `${HOW.hitlist}${best ? ` ${best.q.name} has ${best.n} exiled card${best.n === 1 ? "" : "s"} with a hit counter${g.creatures(best.q).length ? "" : " but no creature for the Silencer to exile"}.` : ""}`, cards: ["Mari, the Killing Quill", "Etrata, the Silencer", "Toxic Deluge"] });
      }
    }
    // 2. one card away: which tutor finds the missing piece
    for (const st of states.filter(s => !s.live && s.missing.length === 1 && s.line.key !== "hitlist")) {
      const l = st.line, side = st.missing[0];
      const finders = [...new Set([].concat(...side.map(n => findersFor(g, p, n))))];
      const held = l.sides.filter(s2 => s2 !== side).map(s2 => s2.find(n => haveCard(g, p, n))).filter(Boolean);
      out.push({
        level: finders.length ? (main ? "now" : "plan") : "plan",
        title: `One card from ${l.title}: ${list(side.map(short))}`,
        text: `You have ${list(held.map(short))}. ${finders.length ? `${list(finders.map(short))} can find it.` : "No tutor in hand: dig (Necropotence, Rhystic Study, Brainstorm) or find a tutor."} ${HOW[l.key]}`,
        cards: side.slice(0, 2).concat(finders.slice(0, 2))
      });
    }
    // 3. Etrata flips
    const downs = g.controlled(p, o => !!o.faceDown);
    if (etrata && downs.length) {
      const cost = tg ? "{U}{B}" : "{2}{U}{B}";
      const brine = downs.find(o => o.cardDef.name === "Brine Elemental" && o.owner === p);
      if (brine && myTurn) out.push({ level: "now", title: "Flip Brine Elemental: opponents skip their untap", text: `Etrata turns your face-down Brine Elemental face up for ${cost}: each opponent skips their next untap step.`, cards: ["Brine Elemental", "Etrata, Deadly Fugitive"] });
      const big = downs.filter(o => o !== brine && o.cardDef.types.includes("Creature") && o.cardDef.mv >= 5);
      const spells = downs.filter(o => !o.cardDef.types.includes("Creature") && !o.cardDef.types.includes("Land"));
      if (big.length || spells.length) out.push({ level: "info", title: `Etrata: flip for ${cost}`, text: `${big.length ? `Turn ${list(big.map(o => o.owner === p ? short(o.cardDef.name) : "a cloaked creature"))} face up for ${cost} instead of its cost. ` : ""}${spells.length ? `A face-down noncreature card can't turn face up: Etrata exiles it and you cast it for free (${spells.length} on your side).` : ""}`, cards: ["Etrata, Deadly Fugitive"].concat(tg ? ["Training Grounds"] : []) });
    }
    const ves = g.battlefield.find(o => o.controller === p && o.cardDef && o.cardDef.name === "Vesuvan Shapeshifter");
    if (ves && !ves.faceDown && ves.def.name === "Brine Elemental") out.push({ level: "info", title: "Vesuvan lock", text: "At your upkeep, say yes to turning Vesuvan face down, then turn it face up for {1}{U} as a copy of Brine Elemental: opponents skip their next untap step again.", cards: ["Vesuvan Shapeshifter", "Brine Elemental"] });
    if (ves && ves.faceDown && myTurn && g.battlefield.some(o => o.def.name === "Brine Elemental")) out.push({ level: "now", title: "Flip Vesuvan as Brine", text: "Turn Vesuvan Shapeshifter face up ({1}{U}, its morph cost) and copy Brine Elemental: opponents skip their next untap step.", cards: ["Vesuvan Shapeshifter", "Brine Elemental"] });
    // 4. Ramses, Notion Thief + Windfall, Necropotence
    if (onBf(g, p, "Ramses, Assassin Lord")) out.push({ level: "info", title: "Ramses: one kill wins", text: "Attack with an Assassin first: if any player you attacked this turn loses, you win the game. Do the combo kill after combat.", cards: ["Ramses, Assassin Lord"] });
    if (onBf(g, p, "Notion Thief") && inHand(p, "Windfall")) out.push({ level: main ? "now" : "plan", title: "Windfall with Notion Thief", text: "Everyone discards their hand; you draw every card your opponents would draw.", cards: ["Windfall", "Notion Thief"] });
    if (onBf(g, p, "Necropotence") && myTurn) out.push({ level: "info", title: "Necropotence", text: "You skip your draw. In your second main phase pay life (1 per card): the cards come to your hand at your end step. Keep enough life for the table.", cards: ["Necropotence"] });
    // 5. warnings
    const claw = g.battlefield.find(o => o.def.name === "Wishclaw Talisman");
    if (claw && claw.controller === p) out.push({ level: "warn", title: "Wishclaw goes to an opponent", text: `Using it hands it to an opponent, who can tutor with it on their turn. Use it the turn you go off${onBf(g, p, "Opposition Agent") ? " (or now: Opposition Agent takes what they find)" : ", or with Opposition Agent out"}.`, cards: ["Wishclaw Talisman", "Opposition Agent"] });
    else if (claw && claw.controller !== p && (claw.counters.wish || 0) > 0) out.push({ level: "warn", title: `${claw.controller.name} has Wishclaw Talisman`, text: `${claw.controller.name} can tutor with it on their turn (${claw.counters.wish} wish counter${claw.counters.wish === 1 ? "" : "s"} left). Then it comes back to an opponent of theirs.`, cards: ["Wishclaw Talisman"] });
    if (inHand(p, "Wormfang Manta")) out.push({ level: "info", title: "Wormfang Manta here", text: "Don't cast it: it makes you skip your next turn. Put it on Scroll of Fate (manifest), flip it with Etrata, then bounce it with Crystal Shard or Otawara for an extra turn.", cards: ["Wormfang Manta", "Scroll of Fate", "Crystal Shard"] });
    const manta = g.battlefield.find(o => o.controller === p && o.def.name === "Wormfang Manta" && !o.faceDown);
    if (manta && myTurn) out.push({ level: "now", title: "Bounce the Manta for an extra turn", text: "Your face-up Wormfang Manta leaving the battlefield gives you an extra turn after this one. Bounce it with Crystal Shard ({U}, {T}) or Otawara, then manifest it again with Scroll of Fate.", cards: ["Wormfang Manta", "Crystal Shard"] });
    const order = { win: 0, now: 1, warn: 2, plan: 3, info: 4 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  /* ================================================================ the turn planner
     plan(g, p) reads the board into the same shape Corrupted Miku's planner returns, so the game's
     Coach "Plan" tab and the companion can show it: { state, lines, threats, risk }. Each line:
     { key, when (now, next, later, blocked), title, short, kill, cost, mana, steps, tutors, missing,
     blockedBy }. Costs count what's left to cast or activate from here. */
  const TOP_TUTORS = ["Vampiric Tutor", "Imperial Seal", "Scheming Symmetry", "Lim-Dûl's Vault"];   // to the top: next turn
  const INSTANT_TUTORS = ["Vampiric Tutor"];
  const MANTA = { key: "manta", title: "Infinite turns: Scroll of Fate + Wormfang Manta + Crystal Shard", sides: [["Scroll of Fate"], ["Wormfang Manta"], ["Crystal Shard", "Otawara, Soaring City"]] };
  const PLAN_LINES = LINES.concat([MANTA]);
  const SHORT_TITLE = { vampire: "Vampire loop", mindcrank: "Mindcrank + Guildmage", doubletap: "Double tap", brine: "Brine lock", hitlist: "Hit list", manta: "Infinite turns" };
  /* Opposing cards that switch a line off, and what in this deck answers them. */
  const HATE = {
    "Rest in Peace": { lines: ["mindcrank"], why: "cards go to exile instead of graveyards, so Guildmage's drain never triggers" },
    "Leyline of the Void": { lines: ["mindcrank"], why: "your opponents' cards go to exile instead of their graveyard" },
    "Cursed Totem": { lines: ["mindcrank", "brine", "manta"], why: "creatures' activated abilities can't be activated: no Guildmage, no Etrata flip" },
    "Linvala, Keeper of Silence": { lines: ["mindcrank", "brine", "manta"], why: "your creatures' activated abilities can't be activated: no Guildmage, no Etrata flip" },
    "Null Rod": { lines: ["manta"], why: "artifacts' activated abilities can't be activated: no Scroll of Fate, no Crystal Shard" },
    "Collector Ouphe": { lines: ["manta"], why: "artifacts' activated abilities can't be activated: no Scroll of Fate, no Crystal Shard" },
    "Stony Silence": { lines: ["manta"], why: "artifacts' activated abilities can't be activated: no Scroll of Fate, no Crystal Shard" },
    "Hushbringer": { lines: ["hitlist"], why: "dies triggers don't happen, so Mari's hit counters stop" },
    "Torpor Orb": { lines: [], why: "Tribute Mage and Opposition Agent's enter triggers stop" }
  };
  const ANSWERS = { creature: ["Infernal Grasp", "Deadly Rollick", "Cyclonic Rift", "Otawara, Soaring City"], other: ["Cyclonic Rift", "Otawara, Soaring City"] };
  const COUNTERS = ["Fierce Guardianship", "Counterspell", "Swan Song", "An Offer You Can't Refuse"];
  const DEFENSE = ["Toxic Deluge", "Cyclonic Rift", "Deadly Rollick", "Infernal Grasp"];
  /* Adds mana costs as strings: "{1}{U}{B}" + "{3}" = "{4}{U}{B}". */
  function addCost(...cs) {
    let n = 0; const col = [];
    for (const c of cs) { const o = pc(c || ""); n += o.g + o.C + o.hyb.length + o.phy.length; for (const k of ["W", "U", "B", "R", "G"]) for (let i = 0; i < o[k]; i++) col.push(k); }
    col.sort((a, b) => "WUBRG".indexOf(a) - "WUBRG".indexOf(b));
    return (n || !col.length ? `{${n}}` : "") + col.map(k => `{${k}}`).join("");
  }
  const costN = c => { const o = pc(c || ""); return o.g + o.C + o.hyb.length + o.phy.length + o.W + o.U + o.B + o.R + o.G; };
  const cardCost = name => { const d = MK.get(name); return d ? d.cost || "" : ""; };
  function manaNext(g, p) {
    let n = 0;
    try { n = g.manaAfterUntap(p, null).total; } catch (e) { n = manaNow(g, p); }
    if (p.hand.some(c => c.def.types.includes("Land"))) n++;
    return n;
  }
  /* Whether p can pay a cost with the right colors: now, or next turn (after untapping, plus one
     land from hand). Counting mana alone misses lines that need {U}{B} from a board of colorless rocks. */
  function payNow(g, p, cost) { try { return g.canPay(p, pc(cost || "{0}")); } catch (e) { return true; } }
  function landColors(g, p, c) {
    const out = new Set();
    for (const ab of c.def.mana || []) {
      const prod = typeof ab.produce === "function" ? null : ab.produce;
      if (!prod) continue;
      try { for (const u of g.expandProduce(prod, p)) if (u.length === 1) out.add(u[0]); } catch (e) { /* skip */ }
    }
    return out;
  }
  function payNext(g, p, cost) {
    try {
      const c0 = pc(cost || "{0}");
      if (g.manaAfterUntap(p, c0).can) return true;
      for (const land of p.hand.filter(c => c.def.types.includes("Land"))) {
        for (const k of landColors(g, p, land)) {
          const c = pc(cost || "{0}");
          if (k !== "C" && c[k] > 0) c[k]--; else if (c.g > 0) c.g--; else continue;
          if (g.manaAfterUntap(p, c).can) return true;
        }
      }
      return false;
    } catch (e) { return true; }
  }
  let planKey = null, planVal = null;
  function plan(g, p) {
    const key = g.v != null ? (g.idBase || 0) + ":" + g.v + ":" + p.id + ":" + g.phase + ":" + (g.active && g.active.id) : null;
    if (key && key === planKey) return planVal;
    const myTurn = g.active === p, main = myTurn && (g.phase === "main1" || g.phase === "main2");
    const now = manaNow(g, p), next = manaNext(g, p);
    const tg = onBf(g, p, "Training Grounds"), etrata = onBf(g, p, "Etrata, Deadly Fugitive");
    const flip = tg ? "{U}{B}" : "{2}{U}{B}";
    // the hate pieces on the table, and which lines they stop
    const hate = g.battlefield.filter(o => o.controller !== p && !o.faceDown && HATE[o.def.name]);
    const lines = [];
    for (const l of PLAN_LINES) {
      const st = lineState(g, p, l);
      const pieces = l.sides.map(side => side.find(n => onBf(g, p, n)) || side.find(n => onBfAny(g, p, n)) || side.find(n => inHand(p, n)) || null);
      const missing = l.sides.filter((side, i) => !pieces[i]);
      // a tutor for each missing side, each tutor once
      const used = new Set(), tutors = [];
      let tutorCost = "", onTop = false;
      for (const side of missing) {
        const f = [].concat(...side.map(n => findersFor(g, p, n).map(t => [t, n]))).find(([t]) => !used.has(t));
        if (!f) { tutors.length = 0; tutorCost = ""; onTop = false; break; }
        used.add(f[0]); tutors.push(f);
        if (inHand(p, f[0])) tutorCost = addCost(tutorCost, cardCost(f[0]));
        if (TOP_TUTORS.includes(f[0])) onTop = true;
      }
      if (missing.length && tutors.length !== missing.length) {
        // not reachable yet: only worth showing when half of it is already here
        if (st.haveSides === 0 || missing.length > 1) continue;
      }
      if (!missing.length && l.key === "hitlist" && !g.opponents(p).some(q => !q.lost && (g.hitCount ? g.hitCount(q) : 0) >= 1)) { /* still a plan */ }
      // what is left to cast or activate, piece by piece
      const steps = [], cards = [];
      let cost = tutorCost;
      for (const [t, n] of tutors) steps.push({ text: `${nick(t)} for ${nick(n)}${TOP_TUTORS.includes(t) ? " (it goes on top: you draw it next turn)" : ""}.`, cards: [t, n] });
      const unfound = missing.length > tutors.length;
      if (unfound) for (const side of missing) { cost = addCost(cost, cardCost(side[0])); steps.push({ text: `Find ${list(side.map(nick))}: no tutor for it in hand yet. Dig with Rhystic Study, Necropotence, Brainstorm, or draw a tutor.`, cards: side.slice(0, 2), find: true }); }
      const need = (name, how) => { if (name && !onBfAny(g, p, name)) { cost = addCost(cost, how || cardCost(name)); return true; } return false; };
      const piece = i => pieces[i] || (tutors.find(([, n]) => l.sides[i].includes(n)) || [])[1];
      if (l.key === "vampire") {
        const a = piece(0), b = piece(1);
        if (need(a)) steps.push({ text: `Cast ${nick(a)}.`, cards: [a] });
        if (need(b)) steps.push({ text: `Cast ${nick(b)}.`, cards: [b] });
        const gm = onBf(g, p, "Duskmantle Guildmage");
        steps.push({ text: gm ? "Start it: Duskmantle Guildmage's {1}{U}{B}, then {2}{U}{B} to mill an opponent two cards, or any hit that connects. Every opponent drains to 0." : "Start it: any opponent losing life. An Assassin or Changeling Outcast that connects, or their own fetch or shock land. Every opponent drains to 0.", cards: gm ? ["Duskmantle Guildmage"] : ["Changeling Outcast"] });
      } else if (l.key === "mindcrank") {
        if (need("Mindcrank")) steps.push({ text: "Cast Mindcrank ({2}).", cards: ["Mindcrank"] });
        if (need("Duskmantle Guildmage")) steps.push({ text: "Cast Duskmantle Guildmage ({U}{B}).", cards: ["Duskmantle Guildmage"] });
        cost = addCost(cost, "{1}{U}{B}", "{2}{U}{B}");
        steps.push({ text: "Guildmage: {1}{U}{B} (cards going to their graveyards drain them), then {2}{U}{B}: mill the lowest-life opponent two. Mindcrank loops until they're dead. One player per start.", cards: ["Duskmantle Guildmage", "Mindcrank"] });
      } else if (l.key === "doubletap") {
        if (need("Bloodletter of Aclazotz")) steps.push({ text: "Cast Bloodletter of Aclazotz.", cards: ["Bloodletter of Aclazotz"] });
        if (need("Virtus the Veiled")) steps.push({ text: "Cast Virtus the Veiled. It has to wait a turn to attack.", cards: ["Virtus the Veiled"] });
        const v = bfObj(g, p, "Virtus the Veiled");
        const big = v ? g.power(v) > 1 && g.toughness(v) > 1 : onBf(g, p, "Ramses, Assassin Lord");
        if (big) { cost = addCost(cost, "{4}"); steps.push({ text: "Rogue's Passage ({4}, {T}): Virtus can't be blocked (Ramses makes it too big for Tetsuko).", cards: ["Rogue's Passage"] }); }
        else if (onBfAny(g, p, "Tetsuko Umezawa, Fugitive")) steps.push({ text: "Tetsuko makes Virtus, a 1/1, unblockable.", cards: ["Tetsuko Umezawa, Fugitive"] });
        else steps.push({ text: "Attack someone with no flying or untapped blockers, or use Rogue's Passage ({4}, {T}).", cards: ["Rogue's Passage"] });
        steps.push({ text: "Virtus connects: they lose half their life, doubled by Bloodletter. All of it.", cards: ["Virtus the Veiled", "Bloodletter of Aclazotz"] });
      } else if (l.key === "brine") {
        const bd = g.battlefield.find(o => o.controller === p && nameOf(o) === "Brine Elemental");
        if (!bd) { cost = addCost(cost, "{3}"); steps.push({ text: "Cast Brine Elemental face down ({3}).", cards: ["Brine Elemental"] }); }
        if (!bd || bd.faceDown) { cost = addCost(cost, etrata ? flip : "{5}{U}{U}"); steps.push({ text: etrata ? `Etrata turns Brine face up for ${flip}: opponents skip their next untap step.` : "Turn Brine face up for its morph cost {5}{U}{U} (Etrata makes it {2}{U}{B}).", cards: ["Brine Elemental", "Etrata, Deadly Fugitive"] }); }
        const vs = g.battlefield.find(o => o.controller === p && nameOf(o) === "Vesuvan Shapeshifter");
        if (!vs) { cost = addCost(cost, "{3}"); steps.push({ text: "Cast Vesuvan Shapeshifter face down ({3}).", cards: ["Vesuvan Shapeshifter"] }); }
        steps.push({ text: "Next turn and every turn after: Vesuvan turns face up as a copy of Brine ({1}{U}), then face down again at your upkeep. Opponents never untap.", cards: ["Vesuvan Shapeshifter"] });
      } else if (l.key === "manta") {
        if (need("Scroll of Fate")) steps.push({ text: "Cast Scroll of Fate ({3}).", cards: ["Scroll of Fate"] });
        const sh = piece(2);
        if (need(sh, sh === "Otawara, Soaring City" ? "" : undefined)) steps.push({ text: sh === "Otawara, Soaring City" ? "Play Otawara, Soaring City." : "Cast Crystal Shard ({3}).", cards: [sh] });
        cost = addCost(cost, etrata ? flip : "{5}{U}{U}", sh === "Otawara, Soaring City" ? "{3}{U}" : "{U}");
        steps.push({ text: `Scroll of Fate ({T}): manifest Wormfang Manta from your hand. Its enter trigger never happens. Etrata turns it face up for ${etrata ? flip : "{5}{U}{U}"}.`, cards: ["Scroll of Fate", "Wormfang Manta"] });
        steps.push({ text: `${sh === "Otawara, Soaring City" ? "Otawara" : "Crystal Shard ({U}, {T})"} returns it to your hand: an extra turn. Do it again each turn.`, cards: [sh || "Crystal Shard", "Wormfang Manta"] });
      } else if (l.key === "hitlist") {
        if (need("Mari, the Killing Quill")) steps.push({ text: "Cast Mari: opposing creatures that die are exiled with a hit counter.", cards: ["Mari, the Killing Quill"] });
        if (need("Etrata, the Silencer")) steps.push({ text: "Cast Etrata, the Silencer. It can't be blocked.", cards: ["Etrata, the Silencer"] });
        const best = g.opponents(p).filter(q => !q.lost).map(q => ({ q, n: g.hitCount ? g.hitCount(q) : 0 })).sort((a, b) => b.n - a.n)[0];
        steps.push({ text: `Kill their creatures (Toxic Deluge, deathtouch blocks), then hit with the Silencer: three hit counters on one player and they lose.${best ? ` ${best.q.name} has ${best.n}.` : ""} Leave them a creature to exile.`, cards: ["Toxic Deluge", "Etrata, the Silencer"] });
      }
      const n = costN(cost);
      const blockedBy = hate.filter(o => HATE[o.def.name].lines.includes(l.key)).map(o => ({ name: o.def.name, owner: o.controller.name }));
      const combat = l.key === "doubletap" || l.key === "hitlist";
      const sick = l.key === "doubletap" && !(bfObj(g, p, "Virtus the Veiled") && !bfObj(g, p, "Virtus the Veiled").sick);
      // enough mana is not enough: the colors have to be there too
      const okNow = n <= now && payNow(g, p, cost), okNext = n <= next && (okNow || payNext(g, p, cost));
      const colorShort = n <= next && !okNext ? "next" : n <= now && !okNow ? "now" : null;
      if (colorShort) steps.push({ text: `You have ${colorShort === "now" ? "the mana" : "enough mana next turn"} but not the colors: it needs ${(cost.match(/\{[WUBRG]\}/g) || []).join("")}. Get a land or rock that makes them first.`, cards: [] });
      let when = blockedBy.length ? "blocked" : unfound ? "later" : (!onTop && missing.length === tutors.length && okNow && myTurn && !sick && (!combat || g.phase === "main1")) ? "now" : okNext ? "next" : "later";
      if (l.key === "hitlist" && when === "now") when = "next";   // it takes several hits
      lines.push({ key: l.key, when, title: l.title, short: SHORT_TITLE[l.key], kill: l.key !== "brine", cost: cost || "{0}", mana: n, steps, tutors: tutors.map(t => t[0]), missing: missing.map(side => side[0]), blockedBy, colorShort, early: null, onTurn: cost || "{0}" });
    }
    const W = { now: 0, next: 1, later: 2, blocked: 3 };
    lines.sort((a, b) => W[a.when] - W[b.when] || a.mana - b.mana || (a.kill === b.kill ? 0 : a.kill ? -1 : 1));
    // threats: hate pieces, and boards that can kill you
    const threats = [];
    for (const o of hate) {
      const h = HATE[o.def.name];
      const answers = (g.isCreature(o) ? ANSWERS.creature : ANSWERS.other).filter(n => inHand(p, n) || (n === "Otawara, Soaring City" && onBf(g, p, n)));
      threats.push({ kind: "hate", level: h.lines.length ? "high" : "low", name: o.def.name, title: `${o.controller.name}'s ${nick(o.def.name)}`, text: `${h.why}.`, answers, answerText: answers.length ? `Answer: ${list(answers.map(short))}.` : "No answer in hand: tutor around it or switch lines." });
    }
    for (const q of g.opponents(p).filter(q => !q.lost)) {
      const pw = g.creatures(q).reduce((s, c) => s + Math.max(0, g.power(c)), 0);
      if (pw >= p.life) threats.push({ kind: "lethal", level: "high", name: null, title: `${q.name} can kill you`, text: `${pw} power on board and you're at ${p.life}. Keep blockers back (Etrata's deathtouch) or end it first.`, answers: ["Cyclonic Rift", "Toxic Deluge"].filter(n => inHand(p, n)), answerText: "" });
    }
    // the whole table's attackers: three precons racing you kill a combo deck before it's ready
    const lethal = threats.some(t => t.kind === "lethal");
    const tablePw = g.opponents(p).filter(q => !q.lost).reduce((s, q) => s + g.creatures(q).reduce((n, c) => n + Math.max(0, g.power(c)), 0), 0);
    if (!lethal && tablePw * 2 >= p.life) {
      const answers = DEFENSE.filter(n => inHand(p, n));
      threats.push({ kind: "pressure", level: tablePw * 1.5 >= p.life ? "high" : "low", name: null, title: "The table is racing you", text: `${tablePw} power across the table and you're at ${p.life}: ${tablePw * 1.5 >= p.life ? "a turn or two" : "two or three turns"} of hits kill you. Keep Etrata and your blockers home.`, answers, answerText: answers.length ? `Defense in hand: ${list(answers.map(short))}.` : "Look for Toxic Deluge or Cyclonic Rift." });
    }
    const who = g.opponents(p).filter(q => !q.lost && q.hand.length >= 2 && g.controlled(q, o => g.isLand(o) && !o.tapped).length >= 2).map(q => q.name);
    const r = { state: { manaNow: now, manaNext: next }, lines, threats, risk: { who, quiet: null } };
    planKey = key; planVal = r;
    return r;
  }

  /* ================================================================ the companion
     companion(g, p, ctx) walks you through the game one stage at a time, like Corrupted Miku's: the
     mulligan, setting up Etrata and the engines, assembling a line, going off, and what to answer on
     their turns. Returns { stage, title, steps: [{ text, cards }], urgent, keep }. */
  const ROCKS = ["Sol Ring", "Mox Amber", "Arcane Signet", "Talisman of Dominance", "Dimir Signet", "Fellwar Stone", "Mind Stone", "Dark Ritual"];
  const ENGINES = ["Rhystic Study", "Necropotence", "Mystic Remora", "Opposition Agent", "Notion Thief", "Gonti, Night Minister", "Thief of Sanity", "Black Market Connections", "Training Grounds", "Tetsuko Umezawa, Fugitive"];
  const FLASHERS = ["Opposition Agent", "Notion Thief"];
  const ALL_TUTORS = GENERAL_TUTORS.concat(Object.keys(TRANSMUTERS), ["Wishclaw Talisman", "Tribute Mage"]);
  const companionLine = l => l.steps.map(st => ({ text: st.text, cards: st.cards }));
  function companion(g, p, ctx) {
    ctx = ctx || {};
    const mode = ctx.mode || "wait";
    const myTurn = g.active === p;
    const castable = name => p.hand.some(c => c.def.name === name && g.castOptions(p, c).length > 0);
    const steps = [];
    const step = (text, cards) => steps.push({ text, cards: cards || [] });
    const etrata = bfObj(g, p, "Etrata, Deadly Fugitive");
    const home = p.commanders[0] && p.commanders[0].zone === "command" ? p.commanders[0] : null;

    // ---- the opening hand (the sim's rule: 3 to 5 lands, or 2 lands and a rock)
    if (mode === "mulligan") {
      const hand = ctx.hand || p.hand, names = hand.map(o => o.def.name);
      const lands = hand.filter(o => o.def.types.includes("Land")).length;
      const rocks = names.filter(n => ROCKS.includes(n));
      const pieces = names.filter(n => COMBO_NAMES.has(n) || MANTA.sides.flat().includes(n));
      const tutors = names.filter(n => ALL_TUTORS.includes(n));
      const engines = names.filter(n => ENGINES.includes(n));
      let title, keep;
      if (lands === 0 || (lands === 1 && rocks.length < 2)) { title = "Mulligan: too few lands"; keep = false; }
      else if (lands >= 6) { title = "Mulligan: too many lands"; keep = false; }
      else if (lands === 2 && !rocks.length) { title = "Risky: two lands and no rock"; keep = null; }
      else if (pieces.length + tutors.length >= 2) { title = "Great keep: mana and a plan"; keep = true; }
      else if (pieces.length + tutors.length + engines.length >= 1) { title = "Keep: mana and something to do"; keep = true; }
      else { title = "Keep: the mana is fine, dig for a plan"; keep = true; }
      step(`${lands} land${lands === 1 ? "" : "s"}${rocks.length ? ` and ${list(rocks.map(short))}` : ""}. Etrata costs {1}{U}{B}: cast her on turn 3, or turn 2 off a rock.`, rocks.slice(0, 2));
      if (pieces.length) step(`Combo piece${pieces.length > 1 ? "s" : ""}: ${list(pieces.map(short))}. A tutor finds the partner.`, pieces.slice(0, 3));
      if (tutors.length) step(`Tutor${tutors.length > 1 ? "s" : ""}: ${list(tutors.map(short))}. Count each as the piece it finds.`, tutors.slice(0, 2));
      if (engines.length) step(`Engine: ${list(engines.map(short))}. Cards and stolen cards keep you ahead while you assemble.`, engines.slice(0, 2));
      if (!pieces.length && !tutors.length) step("No combo piece or tutor: you'll be digging. Keep only if the mana is good.");
      return { stage: "Opening hand", title, keep, steps };
    }
    const r = plan(g, p) || { lines: [], threats: [], risk: { who: [] }, state: {} };
    const lines = r.lines.filter(l => l.when !== "blocked");
    const counters = COUNTERS.filter(n => castable(n));

    // ---- something on the stack, a combat or an end step
    if (mode === "respond") {
      const can = new Set(ctx.can || []);
      const top = ctx.top, def = top && (top.o ? top.o.def : top.src && top.src.def);
      const theirs = top && top.p && top.p !== p;
      const ctr = COUNTERS.filter(n => can.has(n) && (n !== "Swan Song" || (def && /Instant|Sorcery|Enchantment/.test(def.type))) && (n !== "Fierce Guardianship" && n !== "An Offer You Can't Refuse" || (def && !def.types.includes("Creature"))));
      if (ctx.window === "stack" && theirs && def) {
        const ai = def.ai || {};
        const hits = (top.targets || []).filter(t => t && !g.isPlayer(t) && t.controller === p);
        const wipe = ai.wipe || ((def.types.includes("Sorcery") || def.types.includes("Instant")) && /(destroy|exile|return) all [^.]*(creatures|permanents)|damage to each creature|all creatures get -/i.test(def.text || ""));
        const piece = hits.find(o => COMBO_NAMES.has(nameOf(o)) || ENGINES.includes(nameOf(o)) || o.def.name === "Etrata, Deadly Fugitive");
        if (wipe || piece) {
          if (ctr.length) step(`${ctr[0] === "Fierce Guardianship" && etrata ? "Fierce Guardianship is free with Etrata out. C" : "C"}ounter ${top.name} with ${ctr[0]}${wipe ? ": it's a board wipe" : `: it hits your ${nick(nameOf(piece))}`}.`, [ctr[0]]);
          else step(`${top.name} ${wipe ? "is a board wipe" : `hits your ${nick(nameOf(piece))}`} and you hold no counter that stops it. Keep Fierce Guardianship or Counterspell up next time.`, ["Fierce Guardianship", "Counterspell"]);
          return { stage: "Defend", title: wipe ? `Board wipe: ${top.name}` : `${top.name} targets your ${nick(nameOf(piece))}`, steps, urgent: ctr.length > 0 };
        }
        const win = ai.combo || /you win the game|loses the game/i.test(def.text || "");
        if (win && ctr.length) { step(`${top.name} can end the game. Counter it with ${ctr[0]}.`, [ctr[0]]); return { stage: "Defend", title: `${top.p.name} goes for the win`, steps, urgent: true }; }
        if ((ai.tutor || /search(es)? (their|your) library/i.test(def.text || "")) && onBf(g, p, "Opposition Agent")) step(`${top.p.name} is searching: Opposition Agent hands you what they find.`, ["Opposition Agent"]);
        if (ctr.length) step(`Nothing here needs ${ctr[0]}. Save counters for a wipe, removal on a combo piece, or someone's winning spell.`, [ctr[0]]);
        return { stage: myTurn ? "Your turn" : "Their turn", title: `${top.p.name} casts ${top.name}`, steps };
      }
      if (ctx.window === "end") {
        if (ctx.turnOf && g.nextPlayer(ctx.turnOf) !== p) return { stage: "Their turn", title: "", steps };
        const flash = FLASHERS.filter(n => can.has(n));
        if (flash.length) step(`Flash in ${list(flash.map(short))} now: it's ready on your turn and they never got a turn to answer it.`, flash);
        const l = lines.find(x => x.tutors.some(t => INSTANT_TUTORS.includes(t) && can.has(t)));
        if (l) { const t = l.tutors.find(x => INSTANT_TUTORS.includes(x) && can.has(x)); step(`Vampiric Tutor now for ${nick(l.missing[0])} (${l.short}): you draw it in your draw step.`, [t, l.missing[0]]); }
        else if (can.has("Brainstorm")) step("Brainstorm at end of turn: dig with mana you didn't use.", ["Brainstorm"]);
        return { stage: "Their turn", title: "End of turn: your instants", steps, urgent: steps.length > 0 };
      }
      return { stage: myTurn ? "Your turn" : "Their turn", title: "", steps };
    }

    // ---- combat
    if (mode === "attack") {
      const opp = g.opponents(p).filter(q => !q.lost);
      const cands = ctx.candidates || [];
      const KEEP = ["Mindcrank", "Duskmantle Guildmage", "Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Mari, the Killing Quill", "Tetsuko Umezawa, Fugitive", "Bloodletter of Aclazotz"];
      const assassins = cands.filter(o => isAssassin(g, o) && o.def.name !== "Etrata, Deadly Fugitive" && !KEEP.includes(o.def.name));
      const stealers = cands.filter(o => ["Gonti, Night Minister", "Thief of Sanity", "Fallen Shinobi", "Etrata, the Silencer"].includes(o.def.name));
      const virtus = cands.find(o => o.def.name === "Virtus the Veiled");
      const race = r.threats.find(t => (t.kind === "pressure" && t.level === "high") || t.kind === "lethal");
      if (race) step(`${race.title}: attack only with creatures that can't block well. Etrata (deathtouch) and your biggest blockers stay home.`, ["Etrata, Deadly Fugitive"]);
      if (virtus && onBf(g, p, "Bloodletter of Aclazotz")) {
        const tgt = opp.slice().sort((a, b) => b.life - a.life)[0];
        step(`Virtus attacks ${tgt.name}${g.power(virtus) > 1 ? " (use Rogue's Passage first: it's too big for Tetsuko)" : ""}. If it connects, Bloodletter doubles the half: they lose all their life.`, ["Virtus the Veiled", "Bloodletter of Aclazotz"]);
      }
      if (onBf(g, p, "Ramses, Assassin Lord") && assassins.length) step("Ramses is out: attack with at least one Assassin, then kill that player any way you can this turn and you win the game.", ["Ramses, Assassin Lord"]);
      if (assassins.length && etrata) step(`Send ${list(assassins.slice(0, 3).map(o => nick(o.def.name)))}: each Assassin hit makes Etrata cloak the top card of that player's library for you.`, ["Etrata, Deadly Fugitive"]);
      if (stealers.length) step(`${list(stealers.map(o => nick(o.def.name)))} steal${stealers.length > 1 ? "" : "s"} on a hit: attack the player whose deck you'd most like to play.`, stealers.map(o => o.def.name).slice(0, 2));
      if (etrata && cands.includes(etrata) && !race) step("Etrata is your engine. Attack with her only when no blocker kills her: she's a 1/4 with deathtouch, a great blocker too.", ["Etrata, Deadly Fugitive"]);
      const keep = cands.filter(o => KEEP.includes(o.def.name));
      if (keep.length) step(`Keep ${list(keep.map(o => nick(o.def.name)))} home: losing a combo piece in a trade costs more than the damage.`, keep.map(o => o.def.name).slice(0, 2));
      if (!steps.length) step("No good attack: keep your creatures back as blockers.");
      return { stage: "Combat", title: "Who attacks", steps };
    }
    if (mode === "block") {
      const at = (ctx.attackers || []).filter(a => a.combat && a.combat.attacking === p);
      const dmg = at.reduce((s, a) => s + Math.max(0, g.power(a)), 0);
      step(dmg >= p.life ? `${dmg} damage is coming at you and you're at ${p.life}: block enough to live.` : `${dmg} damage is coming at you (you're at ${p.life}). Take it rather than lose a combo piece.`);
      if (etrata && !etrata.tapped) step("Etrata blocks well: 4 toughness and deathtouch kill any attacker she blocks.", ["Etrata, Deadly Fugitive"]);
      return { stage: "Their turn", title: "Blocks", steps };
    }

    // ---- their turn, waiting
    if (!myTurn) {
      if (counters.length || COUNTERS.some(n => inHand(p, n))) step(`Hold ${list(COUNTERS.filter(n => inHand(p, n)).map(short))} for a wipe, removal on a combo piece, or a winning spell. The game stops for you when it matters.`, COUNTERS.filter(n => inHand(p, n)).slice(0, 2));
      const flash = FLASHERS.filter(n => inHand(p, n));
      if (flash.length) step(`${list(flash.map(short))}: flash it in at the end of the turn before yours.`, flash);
      if (inHand(p, "Vampiric Tutor") && lines[0] && lines[0].tutors.includes("Vampiric Tutor")) step(`Vampiric Tutor at the end of the turn before yours, for ${nick(lines[0].missing[0])}.`, ["Vampiric Tutor"]);
      for (const t of r.threats.filter(x => x.kind === "lethal" || (x.kind === "pressure" && x.level === "high"))) step(`${t.title}: ${t.text}`, t.answers.slice(0, 2));
      if (!steps.length) step("Nothing to do yet. Watch what they set up: the Coach's Plan tab lists the hate pieces.");
      return { stage: "Their turn", title: `${g.active.name}'s turn`, steps };
    }

    // ---- your turn: where you are in the game plan
    const winNow = lines.find(l => l.when === "now" && l.kill);
    if (winNow && mode === "main") {
      if (r.risk.who.length) step(`${list(r.risk.who)} ${r.risk.who.length > 1 ? "have" : "has"} cards and open mana.${counters.length ? ` Keep ${counters[0]} up to protect the combo.` : " Go anyway if waiting gives them a turn."}`, counters.slice(0, 1));
      for (const st of companionLine(winNow)) step(st.text, st.cards);
      return { stage: "Go off", title: `Win now: ${winNow.title}`, steps, urgent: true };
    }
    const hit = r.threats.find(t => t.kind === "hate" && t.level === "high" && t.answers.some(n => castable(n) || n === "Otawara, Soaring City"));
    if (hit && mode === "main") step(`${hit.title}: ${hit.text} ${hit.answerText}`, [hit.name].concat(hit.answers.slice(0, 1)));
    const race = r.threats.find(t => (t.kind === "pressure" && t.level === "high") || t.kind === "lethal");
    if (race && mode === "main" && g.phase !== "main2") {
      const theirs = g.opponents(p).filter(q => !q.lost).reduce((s, q) => s + g.creatures(q).length, 0), mine = g.creatures(p).length;
      if (castable("Toxic Deluge") && theirs >= mine + 2) step(`Defend first: Toxic Deluge (pay life equal to the biggest toughness you need) clears ${theirs} creatures to your ${mine}. ${race.title}.`, ["Toxic Deluge"]);
      else if (castable("Cyclonic Rift") && manaNow(g, p) >= 7) step(`Defend first: overload Cyclonic Rift ({6}{U}) at the end of the turn before yours bounces every attacker. ${race.title}.`, ["Cyclonic Rift"]);
      else step(`${race.title}: ${race.text}`, ["Etrata, Deadly Fugitive"].concat(race.answers.slice(0, 1)));
    }
    if (mode === "main" && g.phase === "main2") {
      if (COUNTERS.some(n => inHand(p, n))) step(`Before you pass: keep mana up for ${list(COUNTERS.filter(n => inHand(p, n)).map(short))}.`, COUNTERS.filter(n => inHand(p, n)).slice(0, 2));
      if (onBf(g, p, "Necropotence")) step("Necropotence: pay life now for cards at your end step. Keep enough life for the table's attacks.", ["Necropotence"]);
      const flash = FLASHERS.filter(n => inHand(p, n));
      if (flash.length) step(`Don't cast ${list(flash.map(short))} now: flash it in at the end of the turn before yours.`, flash);
      const nx = lines[0];
      if (nx && nx.when === "next") step(`Next turn: ${nx.short} (${nx.cost}, you'll have ${r.state.manaNext} mana).`, nx.steps[0] ? nx.steps[0].cards : []);
      if (!steps.length) step("Nothing to hold back. Pass when ready.");
      return { stage: "End of your turn", title: "Before you pass", steps };
    }
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (p.landsPlayed < g.landDrops(p) && p.hand.some(c => c.def.types.includes("Land"))) step("Play a land first. Crack Polluted Delta now: the shock lands come in untapped if you pay 2 life.");
    const rocks = ROCKS.filter(castable);
    if (!etrata) {
      if (home && g.castOptions(p, home).length) step("Cast Etrata: her Assassin hits cloak their cards, and she makes every flip cheaper.", ["Etrata, Deadly Fugitive"]);
      else if (home) step(`Etrata costs ${home.def.cost}${g.commanderTax(p, home) ? ` plus {${g.commanderTax(p, home)}} tax` : ""}. Build mana to her.`, ["Etrata, Deadly Fugitive"]);
      if (rocks.length) step(`Mana first: ${list(rocks.slice(0, 2).map(short))}.`, rocks.slice(0, 2));
      planStep();
      return { stage: lands + rocks.length < 3 ? "Ramp" : "Set up", title: "Get Etrata out", steps };
    }
    const engines = ENGINES.filter(n => castable(n) && !FLASHERS.includes(n) && !onBf(g, p, n));
    if (rocks.length && manaNow(g, p) < 5) step(`More mana: ${list(rocks.slice(0, 2).map(short))}. Most lines want 5 to 7.`, rocks.slice(0, 2));
    if (engines.length) step(`Engine: ${list(engines.slice(0, 2).map(short))}. Cards and theft keep you ahead while you assemble.`, engines.slice(0, 2));
    planStep();
    const downs = g.controlled(p, o => !!o.faceDown);
    if (downs.length) step(`${downs.length} face-down creature${downs.length > 1 ? "s" : ""}: Etrata flips each for ${onBf(g, p, "Training Grounds") ? "{U}{B}" : "{2}{U}{B}"}, or exiles a noncreature card and you cast it for free.`, ["Etrata, Deadly Fugitive"]);
    if (!steps.length) step("Develop: mana, an engine, and keep a tutor for the missing piece.");
    return { stage: "Assemble", title: lines[0] ? `Closest: ${lines[0].short}` : "Find a line", steps };

    function planStep() {
      const l = lines[0];
      if (!l) {
        const off = r.lines.find(x => x.when === "blocked");
        if (off) step(`${off.short} is switched off by ${list(off.blockedBy.map(h => `${h.owner}'s ${nick(h.name)}`))}. Answer it or go for another line.`, off.blockedBy.map(h => h.name).slice(0, 2));
        else step("No line within reach yet: draw, steal and dig. Rhystic Study, Necropotence and the cloaks find pieces.");
        return;
      }
      if (l.when === "now") { for (const st of l.steps.slice(0, 3)) step(st.text, st.cards); return; }
      const what = l.missing.length ? `${l.short}, missing ${l.missing.map(nick).join(" and ")}` : l.short;
      if (l.when === "next") step(`Next turn: ${what}. It costs ${l.cost} and you'll have ${r.state.manaNext} mana. ${l.steps[0] ? l.steps[0].text : ""}`, l.steps[0] ? l.steps[0].cards : []);
      else step(`Closest line: ${what}. All in, about ${l.mana} mana; you have ${r.state.manaNow}${l.colorShort ? ", but not the colors it needs" : ""}. ${l.steps[0] ? l.steps[0].text : ""}`, l.steps[0] ? l.steps[0].cards : []);
    }
  }

  /* ================================================================ the brain (bots)
     A bot piloting this deck runs this brain (MK.DECK_BRAINS, see ai.js) ahead of the cards' own hints.
     In order: win when a line is live, stay alive (blockers, free removal, counters), develop, then
     tutor and transmute with the mana that's left. The other Etrata decks keep the cards' hints. */
  const BRAIN_MEM = new WeakMap();
  function bmem(p) { let m = BRAIN_MEM.get(p); if (!m) { m = {}; BRAIN_MEM.set(p, m); } return m; }
  const liveOpps = (g, p) => g.opponents(p).filter(q => !q.lost);
  const valueOf = (g, o) => (AI().value ? AI().value(g, o) : g.power(o));
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : g.power(o));
  const castActs = (acts, name) => acts.filter(a => a.type === "cast" && a.card.def.name === name && !a.faceDown);
  const endBeforeMine = (g, p, win) => win === "end" && g.nextPlayer(g.active) === p;

  /* How hard the table can hit us: the power of each opponent's creatures that can attack (summoning
     sick ones too: they'll be ready on that player's turn). high: one player can take half our life,
     or the table all of it. */
  function pressure(g, p) {
    const pw = q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((s, c) => s + Math.max(0, g.power(c)) * (g.kw(c, "double strike") ? 2 : 1), 0);
    const each = liveOpps(g, p).map(pw);
    const table = each.reduce((a, b) => a + b, 0), top = each.length ? Math.max(...each) : 0;
    return { table, top, high: top * 2 >= p.life || table >= p.life, lethal: top >= p.life };
  }
  /* Our creatures that can block. */
  const blockersOf = (g, p) => g.creatures(p).filter(c => !g.ch(c).cantBlock);
  /* Opponents an attacker gets through to: nobody there can block it (menace needs two). */
  function openTo(g, a, opps) {
    return opps.filter(q => {
      const n = g.creatures(q).filter(b => g.canBlock(b, a)).length;
      return n === 0 || (g.kw(a, "menace") && n < 2);
    });
  }

  /* ---------- tutoring: the bot's pick */
  /* The vampire loop comes first: once it's live, one point of life loss kills the whole table. Then
     a piece that completes another line, a sweeper when the table is about to kill us, and else
     the coach's pick (bestPiece). */
  const VAMP_ORDER = ["Bloodthirsty Conqueror", "Exquisite Blood", "Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Sanguine Bond"];
  function botPiece(g, p, cands) {
    if (!cands.length) return null;
    const b = bestPiece(g, p, cands);
    if (b && b.c.def.types.includes("Land")) return b.c;   // short of lands
    // three mana sources and no land to play: a land that makes both colors before a five-drop
    const sources = g.battlefield.filter(o => o.controller === p && (g.isLand(o) || (o.def.mana && o.def.mana.length && !g.isCreature(o)))).length;
    if (sources < 4 && !p.hand.some(c => c.def.types.includes("Land"))) {
      const l = cands.filter(c => c.def.types.includes("Land")).sort((x, y) => landColors(g, p, y).size - landColors(g, p, x).size)[0];
      if (l) return l;
    }
    // Bloodthirsty Conqueror before Exquisite Blood: the same mana, and a flying body that blocks and
    // starts the loop with its own hit
    const order = side => cands.filter(x => side.includes(x.def.name)).sort((x, y) => x.def.mv - y.def.mv || VAMP_ORDER.indexOf(x.def.name) - VAMP_ORDER.indexOf(y.def.name))[0];
    const vs = lineState(g, p, LINES[0]);
    if (!vs.live && vs.missing.length === 1) {
      const c = order(vs.missing[0]);
      if (c) return c;
    }
    if (b && b.rank === 3) return b.c;
    if (!vs.live && vs.missing.length === 2) {
      const c = order(LINES[0].sides[0]);
      if (c) return c;
    }
    if (pressure(g, p).high && !p.hand.some(c => c.def.name === "Toxic Deluge" || c.def.name === "Cyclonic Rift")) {
      const d = cands.find(c => c.def.name === "Toxic Deluge");
      if (d) return d;
    }
    return b ? b.c : null;
  }

  /* ---------- winning */
  /* Duskmantle Guildmage's two abilities in one go: {1}{U}{B} (cards put into their graveyards cost
     them life), then {2}{U}{B} (mill two). With the vampire loop live that drains everyone; with
     Mindcrank it kills the player it mills. Only when both can be paid. */
  function guildmagePlan(g, p, acts) {
    const gm = bfObj(g, p, "Duskmantle Guildmage");
    if (!gm) return null;
    const m = bmem(p);
    const a0 = acts.find(a => a.type === "activate" && a.card === gm && a.idx === 0);
    const a1 = acts.find(a => a.type === "activate" && a.card === gm && a.idx === 1);
    if (m.gmTurn === g.turn && m.gm === gm) return a1 ? { type: "activate", card: gm, idx: 1, maxTries: 3 } : null;
    const vamp = lineState(g, p, LINES[0]).live, crank = onBf(g, p, "Mindcrank") && !!guildVictim(g, p);
    if ((!vamp && !crank) || !a0 || !a1) return null;
    const both = MK.util.addCost(g.abilityCost(p, gm, a0.ab, 0), g.abilityCost(p, gm, a1.ab, 0));
    if (!g.canPay(p, both, { for: "ability" })) return null;
    m.gmTurn = g.turn; m.gm = gm;
    return { type: "activate", card: gm, idx: 0, maxTries: 1 };
  }
  /* The opponent Guildmage mills: the one Mindcrank kills, else (vampire loop) anyone. */
  const guildVictim = (g, p) => liveOpps(g, p).filter(q => q.life <= q.library.length + 2).sort((a, b) => a.life - b.life)[0] || null;
  /* A creature whose hit wins: anything while the vampire loop is live, Virtus with Bloodletter. */
  function winsOnHit(g, p, c) {
    if (lineState(g, p, LINES[0]).live) return g.power(c) > 0;
    return c.def.name === "Virtus the Veiled" && onBf(g, p, "Bloodletter of Aclazotz");
  }
  /* Rogue's Passage on a creature whose hit wins when nothing of ours gets through. */
  function passagePlan(g, p, acts) {
    const rp = acts.find(a => a.type === "activate" && a.card.def.name === "Rogue's Passage");
    if (!rp) return null;
    const opps = liveOpps(g, p);
    const ready = g.creatures(p).filter(c => g.canAttack(c, p) && winsOnHit(g, p, c));
    if (!ready.length || ready.some(c => openTo(g, c, opps).length)) return null;
    bmem(p).passage = ready.sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];
    return { type: "activate", card: rp.card, idx: rp.idx, maxTries: 1 };
  }
  /* Attacks: when a hit wins, only the creatures that get through go; combo pieces stay home unless
     they get through. Everything else is the default attack. */
  const KEEP_HOME = new Set([...COMBO_NAMES, "Tetsuko Umezawa, Fugitive"]);
  function attackPlan(g, p, cands, targets) {
    const opps = targets.filter(t => g.isPlayer(t) && isOpp(g, p, t) && !t.lost);
    if (!opps.length) return null;
    const winners = cands.filter(a => winsOnHit(g, p, a) && openTo(g, a, opps).length);
    if (winners.length) {
      // Virtus takes half the life of whoever has the most; any other hit starts the loop on the weakest
      const decl = winners.map(a => ({ attacker: a, target: openTo(g, a, opps).sort((x, y) => a.def.name === "Virtus the Veiled" ? y.life - x.life : x.life - y.life)[0] }));
      return { decl };
    }
    const home = cands.filter(a => KEEP_HOME.has(nameOf(a)) && !a.faceDown && !openTo(g, a, opps).length);
    return home.length ? { home } : null;
  }

  /* ---------- staying alive */
  /* How badly an opponent's spell on the stack hurts us. */
  function spellHurts(g, p, item) {
    const d = item.o.def, ai = d.ai || {};
    let s = d.mv * 0.5;
    if (ai.wipe) s += 8;
    if (ai.finisher) s += 6;
    if (ai.tutor) s += 2;
    if (ai.threat) s += ai.threat;
    const hit = (item.targets || []).filter(t => t && !g.isPlayer(t) && t.controller === p && t.zone === "battlefield");
    if (hit.length) s += 3 + Math.max(...hit.map(t => (COMBO_NAMES.has(nameOf(t)) || t.isCommander ? 8 : valueOf(g, t) * 0.5)));
    return s;
  }
  /* Fierce Guardianship (free while our commander is out) on a dangerous noncreature spell. */
  function counterPlan(g, p, acts) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.kind !== "spell" || top.p === p || top.o.def.types.includes("Creature")) return null;
    const fg = castActs(acts, "Fierce Guardianship").sort((a, b) => (b.alt || 0) - (a.alt || 0))[0];
    if (!fg || spellHurts(g, p, top) < (fg.alt ? 6 : 9)) return null;
    return { type: "cast", card: fg.card, alt: fg.alt, targets: [top], maxTries: 1 };
  }
  /* Attackers coming at us: Deadly Rollick (free while our commander is out) on the biggest one,
     Infernal Grasp when the hit is big. */
  function defendPlan(g, p, acts) {
    const c = g.combat;
    if (!c || c.attacker === p) return null;
    const atMe = c.attackers.filter(a => a.zone === "battlefield" && a.combat && g.defenderOf(a.combat.attacking) === p && !(a.combat.blockedBy || []).length);
    if (!atMe.length) return null;
    const dmg = atMe.reduce((s, a) => s + Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1), 0);
    const big = atMe.slice().sort((a, b) => g.power(b) - g.power(a))[0];
    const cmd = big.isCommander && (p.cmdDmg[big.id] || 0) + g.power(big) >= 15;
    const roll = castActs(acts, "Deadly Rollick").sort((a, b) => (b.alt || 0) - (a.alt || 0))[0];
    if (roll && (g.power(big) >= 4 || dmg * 2 >= p.life || cmd) && (roll.alt || dmg * 2 >= p.life)) return { type: "cast", card: roll.card, alt: roll.alt, targets: [big], maxTries: 1 };
    const grasp = castActs(acts, "Infernal Grasp")[0];
    if (grasp && (dmg * 2 >= p.life || dmg >= 10 || cmd) && g.power(big) >= 3) return { type: "cast", card: grasp.card, targets: [big], maxTries: 1 };
    return null;
  }
  /* The end of the turn before ours: overload Cyclonic Rift on a big table, exile a big threat with
     a free Deadly Rollick. */
  function endPlan(g, p, acts) {
    const rift = acts.find(a => a.type === "cast" && a.card.def.name === "Cyclonic Rift" && a.alt === 1);
    if (rift) {
      const theirs = g.battlefield.filter(o => o.controller !== p && !g.isLand(o));
      const val = theirs.reduce((s, o) => s + valueOf(g, o), 0);
      if (val >= 30 || (pressure(g, p).high && val >= 15)) return { type: "cast", card: rift.card, alt: 1, targets: [null], maxTries: 1 };
    }
    const roll = castActs(acts, "Deadly Rollick").find(a => a.alt);
    if (roll) {
      const t = g.battlefield.filter(o => o.controller !== p && g.isCreature(o) && g.canTarget(p, o)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
      if (t && threatOf(g, t, p) >= 8) return { type: "cast", card: roll.card, alt: roll.alt, targets: [t], maxTries: 1 };
    }
    return null;
  }
  /* How good a creature is at holding the ground. */
  function blockScore(g, c) {
    const d = c.def, pt = d.pt || [0, 0];
    if (d.cantBlock || d.name === "Wormfang Manta" || d.name === "Brine Elemental" || d.name === "Vesuvan Shapeshifter" || d.name === "Changeling Outcast") return -1;
    return pt[1] + pt[0] * 0.5 + (d.keywords.includes("deathtouch") ? 4 : 0) + (d.keywords.includes("flying") ? 1 : 0) + (d.keywords.includes("defender") ? 1 : 0);
  }
  /* No blocker while the table has attackers (or two few under pressure): a creature first. */
  function blockerFirst(g, p, acts, pr) {
    const have = blockersOf(g, p).length;
    const need = pr.high ? 2 : pr.top > 0 ? 1 : 0;
    if (have >= need) return null;
    // a morph creature whose hint says so goes down face down: a 2/2 blocker that holds its flip
    const morphOk = a => { const ai = a.card.def.ai || {}; return !!ai.morph && ai.morph(g, p, a.card) > 0; };
    const score = a => (a.faceDown ? 3.5 : blockScore(g, a.card));
    const list = acts.filter(a => a.type === "cast" && !a.alt && a.card.def.types.includes("Creature") && blockScore(g, a.card) >= 0 && (a.faceDown ? morphOk(a) : !morphOk(a) && blockScore(g, a.card) > 2))
      .sort((a, b) => score(b) - score(a));
    return list.length ? { type: "cast", card: list[0].card, faceDown: !!list[0].faceDown, maxTries: 1 } : null;
  }

  /* ---------- developing */
  /* Transmute: in the first main phase for the piece that completes a line, else in the second main
     phase with the mana that's left. Drift of Phantasms stays a blocker under pressure. */
  function transmuteNow(g, p, acts, win, pr) {
    for (const a of acts) {
      if (a.type !== "channel" || !TRANSMUTERS[a.card.def.name] || a.card.zone !== "hand") continue;
      if (a.card.def.name === "Drift of Phantasms" && pr.high && blockersOf(g, p).length < 2) continue;
      const mv = a.card.def.mv;
      const pool = p.library.filter(c => c.def.mv === mv);
      const c = botPiece(g, p, pool);
      if (!c) continue;
      const b = bestPiece(g, p, [c]);
      const rank = b ? b.rank : 0;
      if (rank >= 3 || (win === "main2" && rank >= 1)) return { type: "channel", card: a.card, maxTries: 1 };
    }
    return null;
  }
  /* Opposition Agent and Notion Thief: flashed in at the end of a turn when the mana is up, but a
     bot that taps out never gets there, so they come down in the second main phase. */
  function flashNow(g, p, acts) {
    for (const n of ["Opposition Agent", "Notion Thief"]) {
      const a = castActs(acts, n)[0];
      if (a) return { type: "cast", card: a.card, maxTries: 1 };
    }
    return null;
  }
  /* Diabolic Intent with something cheap to sacrifice (a token, a cloaked land), for a piece of a line. */
  function intentPlan(g, p, acts) {
    const a = castActs(acts, "Diabolic Intent")[0];
    if (!a || !g.creatures(p).some(o => fodderScore(g, o) <= 4)) return null;
    const c = botPiece(g, p, p.library.slice());
    const b = c && bestPiece(g, p, [c]);
    return b && b.rank >= 2 ? { type: "cast", card: a.card, maxTries: 1 } : null;
  }
  /* The vampire loop: the missing side the moment its partner is on the battlefield, or both sides
     this turn when the mana is there (the creature first, so the loop is live before combat). */
  function vampireCast(g, p, acts) {
    const vs = lineState(g, p, LINES[0]);
    if (vs.live) return null;
    const sideActs = side => acts.filter(a => a.type === "cast" && !a.faceDown && side.includes(a.card.def.name) && a.card.zone === "hand").sort((a, b) => a.card.def.mv - b.card.def.mv);
    const live = LINES[0].sides.map(side => side.some(n => onBf(g, p, n)));
    for (let i = 0; i < 2; i++) if (live[1 - i] && !live[i]) { const a = sideActs(LINES[0].sides[i])[0]; if (a) return { type: "cast", card: a.card, alt: a.alt, maxTries: 1 }; }
    if (live[0] || live[1]) return null;
    const loss = sideActs(LINES[0].sides[0])[0], gain = sideActs(LINES[0].sides[1])[0];
    if (!loss || !gain) return null;
    const both = MK.util.addCost(g.spellCost(p, loss.card, {}), g.spellCost(p, gain.card, {}));
    if (!g.canPay(p, both)) return null;
    const first = gain.card.def.types.includes("Creature") ? gain : loss;
    return { type: "cast", card: first.card, alt: first.alt, maxTries: 1 };
  }
  function mainPlan(g, p, acts, win) {
    const pr = pressure(g, p);
    return guildmagePlan(g, p, acts)
      || vampireCast(g, p, acts)
      || (win === "main1" ? passagePlan(g, p, acts) : null)
      || (win === "main1" ? blockerFirst(g, p, acts, pr) : null)
      || transmuteNow(g, p, acts, win, pr)
      || (win === "main2" ? flashNow(g, p, acts) : null)
      || intentPlan(g, p, acts);
  }

  /* ---------- the brain */
  function brainPlan(g, p, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    if (win === "stack") return counterPlan(g, p, acts);
    if (win === "attackers" || win === "combat") return defendPlan(g, p, acts);
    if (win === "end") return guildmagePlan(g, p, acts) || (endBeforeMine(g, p, win) ? endPlan(g, p, acts) : null);
    if ((win === "main1" || win === "main2") && g.active === p) return mainPlan(g, p, acts, win);
    return null;
  }
  function brainChoose(g, p, req) {
    if (req.type === "cards" && req.purpose === "tutor" && req.options.length > 1) {
      const c = botPiece(g, p, req.options);
      return c ? [c] : undefined;
    }
    if (req.type === "target" && req.purpose === "sacrifice") {
      const opts = req.options.filter(o => !g.isPlayer(o));
      return opts.length ? opts.slice().sort((a, b) => fodderScore(g, a) - fodderScore(g, b))[0] : undefined;
    }
    if (req.type === "target" && req.purpose === "help" && req.src && req.src.def.name === "Rogue's Passage") {
      const c = bmem(p).passage;
      return c && req.options.includes(c) ? c : undefined;
    }
    return undefined;
  }
  (MK.DECK_BRAINS = MK.DECK_BRAINS || {})[DECK_ID] = { plan: brainPlan, attack: attackPlan, choose: brainChoose, tutor: botPiece };

  /* ================================================================ the deck */
  const B = n => Array(n).fill("Swamp"), I = n => Array(n).fill("Island");
  const LIST = [
    // win lines and their pieces (v3, 2026-10-05: the Brine lock and the hit list are out, and five
    // slow spells became lands from the Etrata deck, then Praetor's Grasp and Fallen Shinobi made way for
    // Phyrexian Arena, Aetherize and Mutavault; see etrata-deck/underused-tech)
    "Enduring Tenacity", "Starscape Cleric", "Vampire of the Dire Moon", "Hooded Blightfang", "Silumgar Assassin",
    "Duskmantle Guildmage", "Mindcrank", "Scroll of Fate", "Wormfang Manta", "Crystal Shard", "Training Grounds",
    "Bloodthirsty Conqueror", "Bloodletter of Aclazotz",
    "Vito, Thorn of the Dusk Rose", "Changeling Outcast", "Marauding Blight-Priest", "Exquisite Blood", "Sanguine Bond",
    "Virtus the Veiled", "Tetsuko Umezawa, Fugitive", "Toxic Deluge",
    // theft and card advantage
    "Thief of Sanity", "Black Market Connections", "Phyrexian Arena", "Opposition Agent", "Notion Thief",
    "Windfall", "Aetherize", "Rhystic Study", "Necropotence", "Mystic Remora", "Brainstorm", "Ponder", "Night's Whisper",
    // tutors
    "Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Beseech the Mirror", "Lim-Dûl's Vault",
    "Scheming Symmetry", "Wishclaw Talisman", "Tribute Mage", "Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard",
    // interaction
    "Counterspell", "Swan Song", "An Offer You Can't Refuse", "Fierce Guardianship", "Deadly Rollick", "Cyclonic Rift",
    // mana
    "Sol Ring", "Mox Amber", "Arcane Signet", "Talisman of Dominance", "Dimir Signet", "Fellwar Stone", "Mind Stone", "Dark Ritual", "Culling the Weak",
    // lands
    "Command Tower", "Watery Grave", "Drowned Catacomb", "Darkslick Shores", "Underground River", "Sunken Hollow", "Morphic Pool",
    "Gloomlake Verge", "Undercity Sewers", "Polluted Delta", "Otawara, Soaring City", "Takenuma, Abandoned Mire", "Rogue's Passage",
    "Path of Ancestry", "Secluded Courtyard", "Choked Estuary", "Darkwater Catacombs", "Tainted Isle", "River of Tears", "Mutavault"
  ].concat(I(7), B(9));

  /* Lines whose pieces left the list (the Brine lock and the hit list in v3) drop out of the plan, the
     coach and the bots' tutoring. Their cards stay defined above. */
  for (let i = LINES.length - 1; i >= 0; i--) if (!LINES[i].sides.every(side => side.some(n => LIST.includes(n)))) LINES.splice(i, 1);
  for (let i = PLAN_LINES.length - 1; i >= 0; i--) if (!PLAN_LINES[i].sides.every(side => side.some(n => LIST.includes(n)))) PLAN_LINES.splice(i, 1);
  const V3_ADDS = ["Enduring Tenacity", "Starscape Cleric", "Vampire of the Dire Moon", "Hooded Blightfang", "Silumgar Assassin",
    "Choked Estuary", "Darkwater Catacombs", "Tainted Isle", "River of Tears", "Swamp", "Phyrexian Arena", "Aetherize", "Mutavault"];
  const V3_CUTS = ["Mari, the Killing Quill", "Etrata, the Silencer", "Brine Elemental", "Vesuvan Shapeshifter", "Dizzy Spell",
    "Ramses, Assassin Lord", "Gonti, Night Minister", "Leyline of Transformation", "Roshan, Hidden Magister", "Infernal Grasp", "Praetor's Grasp", "Fallen Shinobi", "Island"];
  MK.CETRATA_DECK = {
    id: "corrupted-etrata", hero: "corrupted-etrata", alsoOn: ["etrata"], variant: "corrupted-etrata",
    label: "Corrupted Etrata", name: "Corrupted Etrata", title: "Etrata, Deadly Fugitive",
    commander: "Etrata, Deadly Fugitive", identity: ["U", "B"], bracket: 4, aggression: 0.6,
    style: "Dimir theft and odd combos",
    blurb: "Bracket 4 Etrata: steal cards with cloaks, Thief of Sanity and Notion Thief while tutoring for two-card wins (the vampire loop, Mindcrank + Guildmage, Bloodletter + Virtus, the Wormfang Manta turns), with cheap deathtouch blockers for the early turns. Coach tips show which piece is missing.",
    watch: ["Exquisite Blood", "Bloodthirsty Conqueror", "Mindcrank", "Bloodletter of Aclazotz", "Enduring Tenacity", "Hooded Blightfang", "Opposition Agent", "Notion Thief"],
    list: LIST,
    // games recorded before engine 7 replay with the v2 list
    legacyList: { before: 7, list: V3_ADDS.reduce((l, n) => { const i = l.indexOf(n); return l.slice(0, i).concat(l.slice(i + 1)); }, LIST).concat(V3_CUTS) },
    coach: { tips: coachTips, companion, plan, checklist: "corrupted-etrata", companionBlurb: "guides you through each stage of the game: the mulligan, getting Etrata out, which line to assemble, going off, and what to counter on their turns. It stops the game when it has advice." }
  };
  MK.CETRATA_LINES = LINES;
  MK.CETRATA_AI = { bestPiece, lineState, coachTips, plan, companion, manaNow, manaNext, findersFor, LINES: PLAN_LINES, HATE, COUNTERS, ENGINES, ROCKS, ALL_TUTORS, GENERAL_TUTORS, TRANSMUTERS, COMBO_NAMES };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.CETRATA_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.CETRATA_DECK);
})(typeof window !== "undefined" ? window : globalThis);
