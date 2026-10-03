/* Corrupted Etrata: the Bracket 4 list "Etrata's Shadow Market v2" (Etrata, Deadly Fugitive), a Dimir
   deck of theft and odd two-card combos. A player can pilot it from the Corrupted Etrata site, and the
   Etrata site offers it too (alsoOn).
   The cards no other file defines are here; the rest come from cards-etrata.js (Etrata, Mindcrank,
   Scroll of Fate, Training Grounds, Duskmantle Guildmage...), decks-etrata4.js (Mari, Virtus, Imperial
   Seal), decks-edgar.js (the vampire combo pieces, Demonic and Vampiric Tutor) and the other bots.
   Card text follows the printed Oracle text. Where the engine simplifies a card, its `note` says how.
   The engine itself has no extra turns, no draw or search replacement and no "spend mana as though
   it were any type", so the cards that need those work through triggers instead (see each note).
   Win lines that work here: the vampire loop, Mindcrank + Duskmantle Guildmage, Bloodletter + Virtus,
   the Brine Elemental untap lock (with Vesuvan Shapeshifter), Mari + Etrata, the Silencer, and Ramses.
   Wormfang Manta's extra turns don't exist in this game. */
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
    if (o.faceDown) return (o.cardDef.types.includes("Land") ? 1 : 4) + (o.owner !== o.controller ? 0 : 2);
    if (o.isCommander) return 50;
    if (COMBO_NAMES.has(o.def.name)) return 40;
    return 5 + (AI().value ? AI().value(g, o) : g.power(o));
  }
  const cheapFodder = (g, p) => g.creatures(p).some(o => fodderScore(g, o) <= 3);

  /* ================================================================ the combos
     The bots tutor toward these. A line is "live" when one card of each side is on our battlefield,
     "one away" when only one side is missing (counting the hand). */
  const LOSS = ["Exquisite Blood", "Bloodthirsty Conqueror"];                              // opponent loses life: you gain it
  const GAIN = ["Marauding Blight-Priest", "Vito, Thorn of the Dusk Rose", "Sanguine Bond"];   // you gain life: opponents lose it
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
      const pick = bestPiece(g, p, p.library.filter(o => filter(g, o)));
      if (pick) f = (g2, o) => o === pick.c;
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
    if (!mainWin(ctx) || o.zone !== "hand") return null;
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
    if (!isOurs(p) || g.active !== p) return null;
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
    note: "This game has no extra or skipped turns, so neither ability does anything here: the Scroll of Fate + Crystal Shard turn loop can't be played. It's a 6/1 flier that Etrata turns face up for {2}{U}{B}.",
    ai: { priority: 5, cast: (g, p) => (manaNow(g, p) >= 9 ? undefined : false) }
  });
  D({
    name: "Dimir House Guard", cost: "{3}{B}", type: "Creature — Skeleton", pt: "2/3",
    keywords: ["fear"],
    text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSacrifice a creature: Regenerate Dimir House Guard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
    note: "There is no regeneration in this game, so the second ability isn't there. " + TRANSMUTE_NOTE,
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

  /* ================================================================ the coach
     tips(g, p): what to look for right now, most urgent first ({ level, title, text, cards }). */
  const GENERAL_TUTORS = ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Beseech the Mirror", "Scheming Symmetry", "Lim-Dûl's Vault"];
  const TRANSMUTERS = { "Dizzy Spell": 1, "Shred Memory": 2, "Muddle the Mixture": 2, "Drift of Phantasms": 3, "Dimir House Guard": 4 };
  const short = n => n.split(",")[0];
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
    if (inHand(p, "Wormfang Manta")) out.push({ level: "info", title: "Wormfang Manta here", text: "This game has no extra turns, so the Manta turn loop doesn't work. Manifest it with Scroll of Fate and flip it with Etrata as a 6/1 flier.", cards: ["Wormfang Manta", "Scroll of Fate"] });
    const order = { win: 0, now: 1, warn: 2, plan: 3, info: 4 };
    return out.sort((a, b) => order[a.level] - order[b.level]);
  }

  /* ================================================================ the deck */
  const B = n => Array(n).fill("Swamp"), I = n => Array(n).fill("Island");
  const LIST = [
    // win lines and their pieces
    "Mari, the Killing Quill", "Etrata, the Silencer", "Ramses, Assassin Lord", "Duskmantle Guildmage", "Mindcrank",
    "Scroll of Fate", "Wormfang Manta", "Crystal Shard", "Training Grounds", "Brine Elemental", "Vesuvan Shapeshifter",
    "Bloodthirsty Conqueror", "Bloodletter of Aclazotz", "Roshan, Hidden Magister", "Leyline of Transformation",
    "Vito, Thorn of the Dusk Rose", "Changeling Outcast", "Marauding Blight-Priest", "Exquisite Blood", "Sanguine Bond",
    "Virtus the Veiled", "Tetsuko Umezawa, Fugitive", "Toxic Deluge",
    // theft and card advantage
    "Gonti, Night Minister", "Thief of Sanity", "Black Market Connections", "Fallen Shinobi", "Opposition Agent", "Notion Thief",
    "Windfall", "Praetor's Grasp", "Rhystic Study", "Necropotence", "Mystic Remora", "Brainstorm", "Ponder", "Night's Whisper",
    // tutors
    "Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Beseech the Mirror", "Lim-Dûl's Vault",
    "Scheming Symmetry", "Wishclaw Talisman", "Tribute Mage", "Dizzy Spell", "Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard",
    // interaction
    "Counterspell", "Swan Song", "An Offer You Can't Refuse", "Fierce Guardianship", "Deadly Rollick", "Infernal Grasp", "Cyclonic Rift",
    // mana
    "Sol Ring", "Mox Amber", "Arcane Signet", "Talisman of Dominance", "Dimir Signet", "Fellwar Stone", "Mind Stone", "Dark Ritual", "Culling the Weak",
    // lands
    "Command Tower", "Watery Grave", "Drowned Catacomb", "Darkslick Shores", "Underground River", "Sunken Hollow", "Morphic Pool",
    "Gloomlake Verge", "Undercity Sewers", "Polluted Delta", "Otawara, Soaring City", "Takenuma, Abandoned Mire", "Rogue's Passage",
    "Path of Ancestry", "Secluded Courtyard"
  ].concat(I(8), B(8));

  MK.CETRATA_DECK = {
    id: "corrupted-etrata", hero: "corrupted-etrata", alsoOn: ["etrata"], variant: "corrupted-etrata",
    label: "Corrupted Etrata", name: "Corrupted Etrata", title: "Etrata, Deadly Fugitive",
    commander: "Etrata, Deadly Fugitive", identity: ["U", "B"], bracket: 4, aggression: 0.6,
    style: "Dimir theft and odd combos",
    blurb: "Bracket 4 Etrata: steal cards with cloaks, Gonti and Thief of Sanity while tutoring for two-card wins (the vampire loop, Mindcrank + Guildmage, Bloodletter + Virtus, the Brine Elemental untap lock). Coach tips show which piece is missing.",
    watch: ["Exquisite Blood", "Bloodthirsty Conqueror", "Mindcrank", "Bloodletter of Aclazotz", "Brine Elemental", "Ramses, Assassin Lord", "Opposition Agent", "Notion Thief"],
    list: LIST,
    coach: { tips: coachTips, checklist: "corrupted-etrata" }
  };
  MK.CETRATA_LINES = LINES;
  MK.CETRATA_AI = { bestPiece, lineState, coachTips };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.CETRATA_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.CETRATA_DECK);
})(typeof window !== "undefined" ? window : globalThis);
