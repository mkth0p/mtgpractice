/* Azusa, Lost but Seeking: the Ashaya lists (v2, v3). The same commander as decks-azusa.js, built as
   green creature combo instead of Dark Depths:
   - Ashaya, Soul of the Wild makes every nontoken creature a Forest land. Argothian Elder or Ley Weaver
     ("{T}: Untap two target lands") then untaps itself and a land each time: unlimited mana.
   - Argothian Elder (an Elf) + Wirewood Lodge ("{G}, {T}: Untap target Elf") + a land that taps for
     two (Wild Growth, Utopia Sprawl, Jungle Basin): unlimited mana without Ashaya.
   - The mana goes into Walking Ballista, Duskwatch Recruiter digging for it, Craterhoof, Finale of
     Devastation or Tyvar, the Pummeler's pump, and the lands that draw cards.
   The bot's decisions live in `brain` (MK.DECK_BRAINS["azusa-v2"] and ["azusa-v3"]). The decks are in
   MK.AZUSA_VARIANTS for the bench (tools/sim/azusa); they aren't offered on the site yet.
   Card text is the Oracle text (Scryfall); `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const pc = s => MK.parseCost(s);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isLandCard = c => !!c && c.def.types.includes("Land");
  const isBasicCard = c => isLandCard(c) && c.def.supertypes.includes("Basic");
  const isCreatureCard = c => !!c && c.def.types.includes("Creature");
  const mine = (s, o) => o.controller === s.controller;
  const landfall = (s, ev, g) => mine(s, ev.o) && g.isLand(ev.o);
  const mainWin = ctx => ctx.window === "main1" || ctx.window === "main2";
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p;
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  const unsick = (g, o) => !o.sick || g.kw(o, "haste");
  const trig = spec => Object.assign({ trigger: true }, spec);

  const ASHAYA = "Ashaya, Soul of the Wild", ELDER = "Argothian Elder", WEAVER = "Ley Weaver", LODGE = "Wirewood Lodge";
  const BALLISTA = "Walking Ballista", HOOF = "Craterhoof Behemoth", DUSK = "Duskwatch Recruiter", TYVAR = "Tyvar, the Pummeler";
  const UNTAPPERS = [ELDER, WEAVER];
  const onBf = (g, p, n) => g.controlled(p, o => o.def.name === n);
  const has = (g, p, n) => onBf(g, p, n).length > 0;
  const inHand = (p, n) => p.hand.find(c => c.def.name === n) || null;
  const inLib = (p, n) => p.library.some(c => c.def.name === n);
  const held = (g, p, n) => has(g, p, n) || !!inHand(p, n);

  /* ---------- mana a land would make if it were untapped now (the loops tap it again and again) */
  // a {T} mana ability with no other cost: no mana, no life, no damage (Ancient Tomb), no sacrifice
  const freeTap = ab => ab.tap && !ab.cost && !ab.sacSelf && !ab.after && !ab.payLife && !ab.noAuto && !ab.tapCreature;
  function canTapFree(g, x) {
    if (g.isCreature(x) && !unsick(g, x)) return false;
    return g.manaAbilities(x).some(freeTap);
  }
  function outputOf(g, p, x) {
    const was = x.tapped;
    x.tapped = false;
    try {
      const e = g.manaSources(p).find(s => s.o === x);
      if (!e) return 0;
      const opts = e.options.filter(o => freeTap(o.ab));
      return opts.length ? Math.max(...opts.map(o => o.units.length)) * (e.mult || 1) : 0;
    } finally { x.tapped = was; }
  }
  /* Tap x for its biggest free mana ability (a mana ability, so no stack). Returns the mana made. */
  function tapForMana(g, p, x) {
    if (!x || x.zone !== "battlefield" || x.tapped) return 0;
    const e = g.manaSources(p).find(s => s.o === x);
    if (!e) return 0;
    let best = -1, n = 0;
    e.options.forEach((o, i) => { if (freeTap(o.ab) && o.units.length > n) { n = o.units.length; best = i; } });
    if (best < 0) return 0;
    g.activateMana(p, e, best);
    return n * (e.mult || 1);
  }
  const lodgeOf = (g, p) => onBf(g, p, LODGE)[0] || null;
  const loopSpec = lodge => ({
    kind: "land", purpose: "loopLand", prompt: "The land to untap and tap for mana",
    filter: (g, t, p, src) => t !== src && t.controller === src.controller && (!lodge || t.def.name !== LODGE) && canTapFree(g, t)
  });
  /* The best land for a loop: the most mana per tap; then one the loop already tapped (it untaps it
     again), so the other lands and the creatures stay untapped; then a land that isn't a creature. */
  function bestLoopLand(g, p, src, lodge) {
    let best = null, n = 0, bs = -1;
    for (const x of g.controlled(p, o => g.isLand(o) && o !== src && (!lodge || o.def.name !== LODGE) && canTapFree(g, o))) {
      const k = outputOf(g, p, x);
      if (k <= 0) continue;
      const sc = k * 10 + (x.tapped ? 4 : 0) + (g.isCreature(x) ? 0 : 2);
      if (sc > bs) { best = x; n = k; bs = sc; }
    }
    return best ? { land: best, out: n } : null;
  }

  /* "{T}: Untap two target lands." plus the two loops the deck builds on it. */
  function untapperAbilities(elf) {
    const out = [
      {
        label: "Untap two target lands", tap: true,
        targets: [{ kind: "land", purpose: "untapLand", prompt: "Untap (first land)" }, { kind: "land", purpose: "untapLand", prompt: "Untap (second land)", optional: true }],
        do: (g, s, ctx) => { ctx.targets.forEach((t, i) => { if (t && ctx.legal[i] && t.zone === "battlefield") g.untap(t); }); },
        ai: { use: () => false }
      },
      {
        // Ashaya: this creature is a land, so it untaps itself
        label: "Ashaya loop: untap this and a land, tap that land for mana", tap: true, loop: "ashaya",
        condition: (g, o, p) => g.isLand(o) && g.canTarget(p, o, o),
        targets: [loopSpec(false)],
        do: (g, s, ctx) => {
          const p = ctx.p, x = ctx.targets[0];
          if (x && ctx.legal[0] && x.zone === "battlefield") g.untap(x);
          if (s.zone === "battlefield" && g.isLand(s) && g.canTarget(p, s, s)) g.untap(s);
          if (x && x.zone === "battlefield") tapForMana(g, p, x);
        },
        ai: { use: () => false }
      }
    ];
    if (elf) out.push({
      // Wirewood Lodge untaps this Elf for {G}
      label: "Wirewood Lodge loop: untap Lodge and a land, tap the land for mana, Lodge untaps this", tap: true, loop: "lodge",
      condition: (g, o, p) => !!lodgeOf(g, p),
      targets: [loopSpec(true)],
      do: (g, s, ctx) => {
        const p = ctx.p, x = ctx.targets[0], lodge = lodgeOf(g, p);
        if (x && ctx.legal[0] && x.zone === "battlefield") g.untap(x);
        if (lodge) g.untap(lodge);
        if (x && x.zone === "battlefield") tapForMana(g, p, x);
        if (lodge && !lodge.tapped && s.zone === "battlefield" && g.hasSub(s, "Elf") && g.canTarget(p, s, lodge) && p.pool.G > 0) {
          p.pool.G--; g.tap(lodge); g.untap(s); g.bump();
        }
      },
      ai: { use: () => false }
    });
    return out;
  }
  const UNTAPPER_NOTE = "The loop abilities are shortcuts for what a player does by hand: tap the land for mana, then use \"untap two target lands\" on it and on this creature (with Ashaya, Soul of the Wild) or on it and Wirewood Lodge (then Lodge's {G}, {T} untaps this Elf). Each loop goes on the stack.";
  D({
    name: ELDER, cost: "{3}{G}", type: "Creature — Elf Druid", pt: "2/2",
    text: "{T}: Untap two target lands.",
    note: UNTAPPER_NOTE,
    abilities: untapperAbilities(true),
    ai: { priority: 5, target: (g, p, req) => loopTarget(g, p, req), blockPlan: pieceBlocks }
  });
  D({
    name: WEAVER, cost: "{3}{G}", type: "Creature — Human Druid", pt: "2/2",
    text: "Partner with Lore Weaver (When this creature enters, target player may put Lore Weaver into their hand from their library, then shuffle.)\n{T}: Untap two target lands.",
    note: "Lore Weaver isn't in the engine, so the partner trigger does nothing. " + UNTAPPER_NOTE,
    abilities: untapperAbilities(false),
    ai: { priority: 5, target: (g, p, req) => loopTarget(g, p, req), blockPlan: pieceBlocks }
  });
  function loopTarget(g, p, req) {
    // the draw loop: the land that draws, then this creature (a land with Ashaya)
    const pair = p.azusaMem && p.azusaMem.turn === g.turn && p.azusaMem.untapPair;
    if (req.purpose === "untapLand" && pair) { const t = /second/.test((req.spec && req.spec.prompt) || "") ? pair[1] : pair[0]; return req.options.includes(t) ? t : undefined; }
    if (req.purpose !== "loopLand") return undefined;
    const src = req.src, lodge = req.options.every(o => o.def.name !== LODGE) && !!lodgeOf(g, p) && !g.isLand(src);
    const b = bestLoopLand(g, p, src, lodge);
    return b && req.options.includes(b.land) ? b.land : req.options[0];
  }

  D({
    name: ASHAYA, cost: "{3}{G}{G}", type: "Legendary Creature — Elemental", pt: "*/*",
    text: "Ashaya's power and toughness are each equal to the number of lands you control.\nNontoken creatures you control are Forest lands in addition to their other types. (They're still affected by summoning sickness.)",
    cda: (g, o) => { const n = g.controlled(o.controller, x => g.isLand(x)).length; return [n, n]; },
    statics: [{
      applies: (g, s, o) => o.controller === s.controller && !o.isToken && g.isCreature(o),
      addTypes: ["Land"], subtypes: ["Forest"], grantMana: [{ tap: true, produce: "G" }]
    }],
    ai: { priority: 8, threat: 3, blockPlan: (g, p, ctx) => pieceBlocks(g, p, ctx) }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const blessed = (g, p) => p.cityBlessing || (g.controlled(p).length >= 10 && (p.cityBlessing = true));
  // a land that draws: at the end of the turn before ours with mana to spare, or with the combo's mana
  const drawLandUse = (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.library.length > 12;
  land("Arch of Orazca", {
    text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\n{T}: Add {C}.\n{5}, {T}: Draw a card. Activate only if you have the city's blessing.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{ label: "Draw a card", cost: "{5}", tap: true, drawLand: true, condition: (g, o, p) => blessed(g, p), do: (g, s, ctx) => g.draw(ctx.p, 1), ai: { use: drawLandUse } }]
  });
  land("Bonders' Enclave", {
    text: "{T}: Add {C}.\n{3}, {T}: Draw a card. Activate only if you control a creature with power 4 or greater.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{ label: "Draw a card", cost: "{3}", tap: true, drawLand: true, condition: (g, o, p) => g.creatures(p).some(c => g.power(c) >= 4), do: (g, s, ctx) => g.draw(ctx.p, 1), ai: { use: drawLandUse } }]
  });
  /* Rad counters: at the beginning of your precombat main phase, mill that many cards; for each
     nonland card milled, lose 1 life and a rad counter. Kept on the player, run by an emblem. */
  function addRad(g, p, n) {
    p.rad = (p.rad || 0) + n;
    if (!p.emblems.some(e => e.rad)) g.addEmblem(p, {
      name: "Rad counters", rad: true, text: "At the beginning of your precombat main phase, if you have rad counters, mill that many cards. For each nonland card milled this way, you lose 1 life and a rad counter.",
      triggers: [{
        on: "precombatMain", when: (g2, s, ev) => ev.p === s.controller && (s.controller.rad || 0) > 0,
        do: (g2, s, ev, { p: q }) => {
          const milled = q.library.slice(0, q.rad);
          g2.mill(q, q.rad);
          const hits = milled.filter(c => !isLandCard(c)).length;
          if (hits) { g2.loseLife(q, hits, null); q.rad = Math.max(0, q.rad - hits); }
          log(g2, `${q.name} mills ${milled.length} for rad counters (${q.rad} left).`, q, milled.map(c => c.def.name));
        }
      }]
    });
    log(g, `${p.name} gets ${n} rad counters.`, p, ["Mariposa Military Base"]);
  }
  land("Mariposa Military Base", {
    text: "You may have this land enter tapped. If you do, you get two rad counters.\n{T}: Add {C}.\n{5}, {T}: Draw a card. This ability costs {1} less to activate for each rad counter you have.",
    note: "It enters untapped, then you may tap it for the two rad counters.",
    mana: [{ tap: true, produce: "C" }],
    triggers: [{
      on: "enters", self: true, optional: "Mariposa Military Base: tap it and get two rad counters?", ai: "mariposaRad",
      do: (g, s, ev, { p }) => { if (s.zone === "battlefield" && !s.tapped) { g.tap(s); addRad(g, p, 2); } }
    }],
    abilities: [{
      label: "Draw a card", cost: "{5}", tap: true, drawLand: true,
      costReduce: (g, o) => Math.min(5, o.controller.rad || 0),
      do: (g, s, ctx) => g.draw(ctx.p, 1), ai: { use: drawLandUse }
    }],
    // the rad counters cost cards and life: only when the land drop's mana isn't needed this turn
    ai: { confirm: (g, p, req) => req.purpose === "mariposaRad" ? p.landsPlayed >= 2 && p.life > 20 && p.library.length > 40 : true }
  });
  const forestsToReturn = (g, p, s) => g.controlled(p, o => o !== s && !o.tapped && g.isLand(o) && g.hasSub(o, "Forest"));
  land("Jungle Basin", {
    text: "This land enters tapped.\nWhen this land enters, sacrifice it unless you return an untapped Forest you control to its owner's hand.\n{T}: Add {C}{G}.",
    etbTapped: true,
    mana: [{ tap: true, produce: "CG" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = forestsToReturn(g, p, s);
        const pick = opts.length ? await g.ask(p, { type: "target", prompt: "Jungle Basin: return an untapped Forest you control to its owner's hand (or sacrifice Jungle Basin)", options: opts, optional: true, purpose: "basinReturn", src: s }) : null;
        if (pick && opts.includes(pick) && pick.zone === "battlefield") { g.bounce(pick); log(g, `${p.name} returns ${pick.def.name} to hand (Jungle Basin).`, p, ["Jungle Basin", pick.def.name]); }
        else if (s.zone === "battlefield") g.sacrifice(s);
      }
    }],
    // a basic Forest (played again with Azusa's extra land drops), never a creature
    ai: { target: (g, p, req) => req.purpose === "basinReturn" ? (req.options.filter(o => !g.isCreature(o)).sort((a, b) => g.isBasic(b) - g.isBasic(a))[0] || null) : undefined }
  });
  land("Prismatic Vista", {
    text: "{T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield, then shuffle.",
    abilities: [{
      label: "Search for a basic land", tap: true, payLife: 1, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => isBasicCard(c), to: "battlefield", prompt: "Search for a basic land card", src: s }),
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && ctx.window !== "combat" && p.life > 5 }
    }]
  });
  land(LODGE, {
    text: "{T}: Add {C}.\n{G}, {T}: Untap target Elf.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Untap target Elf", cost: "{G}", tap: true,
      targets: [{ kind: "permanent", purpose: "help", prompt: "Untap", filter: (g, t) => g.hasSub(t, "Elf") }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.untap(t); },
      // a tapped Priest of Titania makes more than the {G} it costs
      ai: { use: (g, p, o, ctx) => mainWin(ctx) && g.active === p && g.controlled(p, c => c.tapped && c.def.name === "Priest of Titania").length > 0 && g.battlefield.filter(c => g.hasSub(c, "Elf") && g.isCreature(c)).length >= 3 }
    }],
    ai: { target: (g, p, req) => req.purpose === "help" && req.src && req.src.def.name === LODGE ? (req.options.find(o => o.tapped && o.def.name === "Priest of Titania" && o.controller === p) || req.options.find(o => o.tapped && o.controller === p) || req.options[0]) : undefined }
  });
  land("Yavimaya Hollow", {
    type: "Legendary Land",
    text: "{T}: Add {C}.\n{G}, {T}: Regenerate target creature.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Regenerate target creature", cost: "{G}", tap: true,
      targets: [{ kind: "creature", purpose: "help", prompt: "Regenerate" }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.regenerate(t, s); },
      ai: { use: () => false }
    }],
    ai: { target: (g, p, req) => req.src && req.src.def.name === "Yavimaya Hollow" ? threatened(g, p, req.options) : undefined }
  });

  /* ================================================================ creatures */
  D({
    name: DUSK, cost: "{1}{G}", type: "Creature — Human Warrior Werewolf", pt: "2/2",
    text: "{2}{G}: Look at the top three cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in any order.\nAt the beginning of each upkeep, if no spells were cast last turn, transform this creature.",
    note: "It doesn't transform here (its back face is Krallenhorde Howler).",
    abilities: [{
      label: "Look at the top three cards", cost: "{2}{G}",
      do: async (g, s, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 3);
        if (!top.length) return;
        const cre = top.filter(isCreatureCard);
        const pick = cre.length ? await g.ask(p, { type: "cards", prompt: "Duskwatch Recruiter: reveal a creature card and put it into your hand", options: cre, min: 0, max: 1, purpose: "duskwatch", src: s }) : [];
        const c = (pick || []).find(x => cre.includes(x));
        if (c) { g.moveTo(c, "hand"); log(g, `${p.name} reveals ${c.def.name} and puts it into their hand.`, p, [DUSK, c.def.name]); }
        for (const o of top) if (o !== c && o.zone === "library") { g.removeFromZone(o); o.zone = "library"; p.library.push(o); }
        g.bump();
      },
      ai: { use: (g, p, o, ctx) => { if (!endBeforeMe(g, p, ctx) || p.library.length < 15) return false; const n = Math.min(3, Math.floor(manaNow(g, p) / 3)); return n > 0 ? { repeat: n } : false; } }
    }],
    ai: { priority: 6, cards: (g, p, req) => req.purpose === "duskwatch" ? [best(g, p, req.options, "hand")] : null }
  });
  D({
    name: "Fauna Shaman", cost: "{1}{G}", type: "Creature — Elf Shaman", pt: "2/2",
    text: "{G}, {T}, Discard a creature card: Search your library for a creature card, reveal it, put it into your hand, then shuffle.",
    abilities: [{
      label: "Discard a creature card: search for a creature card", cost: "{G}", tap: true, discard: 1,
      discardFilter: (g, c) => isCreatureCard(c), discardPrompt: "Discard a creature card",
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => isCreatureCard(c), to: "hand", prompt: "Search for a creature card", src: s }),
      ai: { use: (g, p, o, ctx) => (endBeforeMe(g, p, ctx) || (mainWin(ctx) && g.active === p)) && !!faunaChoice(g, p) }
    }],
    ai: {
      priority: 6,
      cards: (g, p, req) => {
        if (req.purpose === "discard") { const c = faunaChoice(g, p); return c ? [c.discard] : [worst(g, p, req.options)]; }
        if (req.purpose === "tutor") return [best(g, p, req.options, "hand")];
        return null;
      }
    }
  });
  function faunaChoice(g, p) {
    const hand = p.hand.filter(isCreatureCard), lib = p.library.filter(isCreatureCard);
    if (!hand.length || !lib.length) return null;
    const d = worst(g, p, hand), f = best(g, p, lib, "hand");
    return want(g, p, f, "hand") >= want(g, p, d, "hand") + 3 ? { discard: d, fetch: f } : null;
  }
  D({
    name: "Nissa, Resurgent Animist", cost: "{2}{G}", type: "Legendary Creature — Elf Scout", pt: "3/3",
    text: "Landfall — Whenever a land you control enters, add one mana of any color. Then if this is the second time this ability has resolved this turn, reveal cards from the top of your library until you reveal an Elf or Elemental card. Put that card into your hand and the rest on the bottom of your library in a random order.",
    note: "The mana is green.",
    triggers: [{
      on: "enters", when: (g, s, ev) => landfall(s, ev, g),
      do: (g, s, ev, { p }) => {
        p.pool.G += 1; g.bump();
        const st = s.state.nissa && s.state.nissa.turn === g.turn ? s.state.nissa : (s.state.nissa = { turn: g.turn, n: 0 });
        if (++st.n !== 2) return;
        const seen = [];
        let hit = null;
        while (p.library.length) {
          const c = p.library.shift();
          if (c.def.subtypes.includes("Elf") || c.def.subtypes.includes("Elemental") || c.def.changeling) { hit = c; p.library.unshift(c); break; }
          seen.push(c);
        }
        if (hit) { g.moveTo(hit, "hand"); log(g, `${p.name} reveals ${seen.length + 1} cards and puts ${hit.def.name} into their hand (Nissa).`, p, ["Nissa, Resurgent Animist", hit.def.name]); }
        g.shuffleArr(seen);
        for (const c of seen) p.library.push(c);
        g.bump();
      }
    }],
    ai: { priority: 7, ramp: true }
  });
  D({
    name: "Quirion Ranger", cost: "{G}", type: "Creature — Elf Ranger", pt: "1/1",
    text: "Return a Forest you control to its owner's hand: Untap target creature. Activate only once each turn.",
    note: "The Forest is returned as the ability resolves.",
    abilities: [{
      label: "Return a Forest: untap target creature", once: true,
      targets: [
        { kind: "land", purpose: "quirionForest", prompt: "Return a Forest you control", filter: (g, t, p, src) => t.controller === src.controller && g.hasSub(t, "Forest") },
        { kind: "creature", purpose: "quirionUntap", prompt: "Untap" }
      ],
      do: (g, s, ctx) => {
        const [f, c] = ctx.targets;
        if (f && ctx.legal[0] && f.zone === "battlefield") g.bounce(f);
        if (c && ctx.legal[1] && c.zone === "battlefield") g.untap(c);
      },
      ai: { use: (g, p, o, ctx) => mainWin(ctx) && g.active === p && !!quirionChoice(g, p) }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => {
        const loop = p.azusaMem && p.azusaMem.turn === g.turn && p.azusaMem.rangerLoop;
        const q = (req.purpose === "quirionForest" || req.purpose === "quirionUntap") && (loop || quirionChoice(g, p));
        if (!q) return undefined;
        const t = req.purpose === "quirionForest" ? q.forest : q.untap;
        return req.options.includes(t) ? t : req.options[0];
      }
    }
  });
  /* Quirion Ranger: a tapped basic Forest goes back to the hand to be played again (Azusa's extra land
     drops, landfall), and a tapped mana creature untaps. */
  function quirionChoice(g, p) {
    if (p.landsPlayed >= g.landDrops(p) || p.hand.filter(isLandCard).length >= g.landDrops(p) - p.landsPlayed) return null;
    const forest = g.controlled(p, o => o.tapped && g.isLand(o) && !g.isCreature(o) && g.hasSub(o, "Forest") && g.isBasic(o))[0];
    if (!forest) return null;
    const untap = g.creatures(p).filter(c => c.tapped && g.manaAbilities(c).length).sort((a, b) => outputOf(g, p, b) - outputOf(g, p, a))[0];
    return untap ? { forest, untap } : null;
  }
  D({
    name: "Scavenging Ooze", cost: "{1}{G}", type: "Creature — Ooze", pt: "2/2",
    text: "{G}: Exile target card from a graveyard. If it was a creature card, put a +1/+1 counter on this creature and you gain 1 life.",
    abilities: [{
      label: "Exile target card from a graveyard", cost: "{G}",
      targets: [{ kind: "card", purpose: "oozeEat", prompt: "Exile from a graveyard", from: g => g.players.filter(q => !q.lost).flatMap(q => q.graveyard) }],
      do: (g, s, ctx) => {
        const c = ctx.targets[0];
        if (!c || c.zone !== "graveyard") return;
        const cre = isCreatureCard(c);
        g.moveTo(c, "exile");
        if (cre && s.zone === "battlefield") { g.addCounters(s, "p1", 1, s); g.gainLife(ctx.p, 1, s); }
      },
      // the opponents' creature cards, at the end of the turn before ours with green to spare
      ai: { use: (g, p, o, ctx) => { if (!endBeforeMe(g, p, ctx)) return false; const n = Math.min(oozeFood(g, p).length, manaNow(g, p)); return n > 0 ? { repeat: n } : false; } }
    }],
    ai: { priority: 4, target: (g, p, req) => req.purpose === "oozeEat" ? (oozeFood(g, p).find(c => req.options.includes(c)) || null) : undefined }
  });
  const oozeFood = (g, p) => g.opponents(p).flatMap(q => q.graveyard).filter(isCreatureCard).sort((a, b) => b.def.mv - a.def.mv);
  D({
    name: "Springheart Nantuko", cost: "{1}{G}", type: "Enchantment Creature — Insect Monk", pt: "1/1",
    text: "Bestow {1}{G} (If you cast this card for its bestow cost, it's an Aura spell with enchant creature. It becomes a creature again if it's not attached.)\nEnchanted creature gets +1/+1.\nLandfall — Whenever a land you control enters, you may pay {1}{G} if this permanent is attached to a creature you control. If you do, create a token that's a copy of that creature. If you didn't create a token this way, create a 1/1 green Insect creature token.",
    note: "Cast for its bestow cost on a creature that becomes an illegal target, it enters as a creature.",
    altCosts: [{ label: "Bestow", cost: "{1}{G}", targets: [{ kind: "creature", you: true, optional: true, purpose: "bestow", prompt: "Bestow on" }] }],
    asEnters: async (g, p, o, item) => {
      const t = item && item.alt === 1 && item.targets[0];
      if (t && t.zone === "battlefield" && g.isCreature(t) && t.controller === p && g.canTarget(p, t, o)) o.attachedTo = t;
    },
    notCreatureUnless: (g, o) => !(o.attachedTo && o.attachedTo.zone === "battlefield"),
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 1] }],
    triggers: [{
      on: "enters", when: (g, s, ev) => landfall(s, ev, g),
      do: async (g, s, ev, { p }) => {
        const t = s.attachedTo;
        if (t && t.zone === "battlefield" && t.controller === p && g.canPay(p, pc("{1}{G}"))) {
          const ok = await g.ask(p, { type: "confirm", prompt: `Springheart Nantuko: pay {1}{G} to create a token copy of ${t.def.name}?`, purpose: "nantukoCopy", src: s, target: t });
          if (ok && g.pay(p, pc("{1}{G}"))) { g.copyToken(p, t); return; }
        }
        g.createToken(p, T.azusaInsect);
      }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => req.purpose === "bestow" ? (bestowTarget(g, p, req.options) || null) : undefined,
      confirm: (g, p, req) => req.purpose === "nantukoCopy" ? !!req.target && !req.target.def.supertypes.includes("Legendary") && copyWorth(req.target.def.name) > 0 : true
    }
  });
  // the creatures worth copying on each landfall, best first
  const COPY_WORTH = { "Avenger of Zendikar": 10, "Tireless Provisioner": 8, "Lotus Cobra": 7, "Tireless Tracker": 6, "Argothian Elder": 5, "Ley Weaver": 5, "Priest of Titania": 5, "Eternal Witness": 4, "Oracle of Mul Daya": 3, "Reclamation Sage": 3, "Craterhoof Behemoth": 9 };
  const copyWorth = n => COPY_WORTH[n] || 0;
  const bestowTarget = (g, p, opts) => opts.filter(o => o.controller === p && copyWorth(o.def.name) > 0).sort((a, b) => copyWorth(b.def.name) - copyWorth(a.def.name))[0];
  D({
    name: "Sylvan Safekeeper", cost: "{G}", type: "Creature — Human Wizard", pt: "1/1",
    text: "Sacrifice a land: Target creature you control gains shroud until end of turn. (It can't be the target of spells or abilities.)",
    abilities: [{
      label: "Sacrifice a land: shroud", safekeeper: true,
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isLand(c), prompt: "Sacrifice a land" },
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Gains shroud until end of turn" }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.grant(t, ["shroud"]); },
      ai: { use: () => false }
    }],
    ai: {
      priority: 3,
      target: (g, p, req) => {
        if (req.purpose === "sacrifice") return spareLand(g, p, req.options);
        if (req.purpose === "help") return threatened(g, p, req.options);
        return undefined;
      }
    }
  });
  D({
    name: TYVAR, cost: "{1}{G}{G}", type: "Legendary Creature — Elf Warrior", pt: "3/3",
    text: "Tap another untapped creature you control: Tyvar gains indestructible until end of turn. Tap it.\n{3}{G}{G}: Creatures you control get +X/+X until end of turn, where X is the greatest power among creatures you control.",
    abilities: [
      {
        label: "Tap another creature: indestructible", tapCreatures: 1,
        do: (g, s) => { if (s.zone === "battlefield") { g.grant(s, ["indestructible"]); g.tap(s); } },
        ai: { use: () => false }
      },
      {
        label: "Creatures you control get +X/+X", cost: "{3}{G}{G}", pump: true,
        do: (g, s, ctx) => {
          const cr = g.creatures(ctx.p);
          if (!cr.length) return;
          const x = Math.max(0, ...cr.map(c => g.power(c)));
          if (x > 0) g.addEffect({ objs: cr, pt: [x, x] });
          log(g, `Creatures ${ctx.p.name} controls get +${x}/+${x} (Tyvar).`, ctx.p, [TYVAR]);
        },
        // after blocks, when our attack has creatures nobody blocked
        ai: { use: (g, p, o, ctx) => { if (ctx.window !== "combat" || !g.combat || g.combat.attacker !== p || !g.combat.attackers.some(a => !a.combat || !a.combat.wasBlocked)) return false; const n = Math.floor(manaNow(g, p) / 5); return n > 0 ? { repeat: Math.min(n, 6) } : false; } }
      }
    ],
    ai: { priority: 5 }
  });

  /* ================================================================ artifacts and enchantments */
  D({
    name: "Birthing Pod", cost: "{3}{G/P}", type: "Artifact",
    text: "({G/P} can be paid with either {G} or 2 life.)\n{1}{G/P}, {T}, Sacrifice a creature: Search your library for a creature card with mana value equal to 1 plus the sacrificed creature's mana value, put that card onto the battlefield, then shuffle. Activate only as a sorcery.",
    abilities: [{
      label: "Sacrifice a creature: search for one with mana value 1 more", cost: "{1}{G/P}", tap: true, timing: "sorcery",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
      do: (g, s, ctx) => {
        const mv = ctx.sacrificed ? ctx.sacrificed.mv + 1 : null;
        if (mv == null) return;
        return g.search(ctx.p, { filter: (g2, c) => isCreatureCard(c) && c.def.mv === mv, to: "battlefield", prompt: `Search for a creature card with mana value ${mv}`, src: s });
      },
      ai: { use: (g, p, o, ctx) => mainWin(ctx) && !!podChoice(g, p) }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => { if (req.purpose !== "sacrifice") return undefined; const c = podChoice(g, p); return c && req.options.includes(c.sac) ? c.sac : undefined; },
      cards: (g, p, req) => req.purpose === "tutor" ? [best(g, p, req.options, "battlefield")] : null
    }
  });
  function podChoice(g, p) {
    let out = null;
    for (const c of g.creatures(p)) {
      if (c.isToken || c.isCommander || isPiece(g, p, c)) continue;
      const mv = g.mvOf(c) + 1, lib = p.library.filter(x => isCreatureCard(x) && x.def.mv === mv);
      if (!lib.length) continue;
      const t = best(g, p, lib, "battlefield"), gain = want(g, p, t, "battlefield") - 0.8 * want(g, p, c, "battlefield");
      if (gain >= 3 && (!out || gain > out.gain)) out = { sac: c, target: t, gain };
    }
    return out;
  }
  const auraSpec = (forest) => ({ kind: "land", purpose: "auraLand", prompt: forest ? "Enchant Forest" : "Enchant land", filter: forest ? (g, t) => g.hasSub(t, "Forest") : undefined });
  // our untapped land without an aura, a basic Forest first and never a creature (it can die)
  const auraTarget = (g, p, req) => req.purpose === "auraLand" ? (req.options.filter(o => o.controller === p && !g.battlefield.some(a => a.attachedTo === o)).sort((a, b) => (g.isCreature(a) - g.isCreature(b)) || (a.tapped - b.tapped) || (g.isBasic(b) - g.isBasic(a)))[0] || req.options.find(o => o.controller === p) || null) : undefined;
  D({
    name: "Utopia Sprawl", cost: "{G}", type: "Enchantment — Aura", aura: true, enchant: "land",
    text: "Enchant Forest\nAs this Aura enters, choose a color.\nWhenever enchanted Forest is tapped for mana, its controller adds an additional one mana of the chosen color.",
    note: "The color is the first of your commander's colors.",
    targets: [auraSpec(true)],
    etbState: (g, o) => ({ color: (o.controller.identity && o.controller.identity[0]) || "G" }),
    statics: [{ tapManaBonus: (g, s, o) => (s.attachedTo === o ? s.state.color || "G" : "") }],
    ai: { priority: 8, ramp: true, target: auraTarget }
  });
  D({
    name: "Wild Growth", cost: "{G}", type: "Enchantment — Aura", aura: true, enchant: "land",
    text: "Enchant land\nWhenever enchanted land is tapped for mana, its controller adds an additional {G}.",
    targets: [auraSpec(false)],
    statics: [{ tapManaBonus: (g, s, o) => (s.attachedTo === o ? "G" : "") }],
    ai: { priority: 8, ramp: true, target: auraTarget }
  });

  /* ================================================================ instants and sorceries */
  D({
    name: "Regrowth", cost: "{1}{G}", type: "Sorcery",
    text: "Return target card from your graveyard to your hand.",
    spell: {
      targets: [{ kind: "card", purpose: "regrow", prompt: "Return to your hand", from: (g, p) => p.graveyard.slice() }],
      do: (g, ctx) => { const c = ctx.targets[0]; if (c && c.zone === "graveyard") g.moveTo(c, "hand"); }
    },
    ai: {
      priority: 4,
      hold: (g, p) => !regrowPick(g, p),
      target: (g, p, req) => req.purpose === "regrow" ? (regrowPick(g, p, req.options) || req.options[0]) : undefined
    }
  });
  function regrowPick(g, p, opts) {
    const list = (opts || p.graveyard).filter(c => !isLandCard(c) && c.def.name !== "Regrowth");
    const b = best(g, p, list, "hand");
    return b && want(g, p, b, "hand") >= 6 ? b : null;
  }
  D({
    name: "Shared Summons", cost: "{3}{G}{G}", type: "Instant",
    text: "Search your library for up to two creature cards with different names, reveal them, put them into your hand, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const got = await g.search(p, { filter: (g2, c) => isCreatureCard(c), count: 2, to: "hand", prompt: "Search for up to two creature cards with different names", src: ctx.o });
        // different names: a second card with the first one's name goes back
        if (got.length === 2 && got[0].def.name === got[1].def.name) { g.removeFromZone(got[1]); got[1].zone = "library"; p.library.push(got[1]); g.shuffle(p); }
      }
    },
    ai: {
      priority: 6, tutor: true, instantEnd: true,
      cards: (g, p, req) => {
        if (req.purpose !== "tutor") return null;
        const out = [], sorted = req.options.slice().sort((a, b) => want(g, p, b, "hand") - want(g, p, a, "hand"));
        for (const c of sorted) if (out.length < 2 && !out.some(x => x.def.name === c.def.name)) out.push(c);
        return out;
      }
    }
  });
  D({
    name: "Sylvan Tutor", cost: "{G}", type: "Sorcery",
    text: "Search your library for a creature card, reveal it, then shuffle and put that card on top.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, c) => isCreatureCard(c), to: "top", prompt: "Search for a creature card", src: ctx.o }) },
    ai: { priority: 3, tutor: true, cast: (g, p, o, ctx) => (ctx && ctx.window === "main2" ? 6 : false), cards: (g, p, req) => req.purpose === "tutor" ? [best(g, p, req.options, "hand")] : null }
  });
  D({
    name: "Time of Need", cost: "{1}{G}", type: "Sorcery",
    text: "Search your library for a legendary creature card, reveal it, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, c) => isCreatureCard(c) && c.def.supertypes.includes("Legendary"), to: "hand", prompt: "Search for a legendary creature card", src: ctx.o }) },
    ai: {
      priority: 5, tutor: true,
      hold: (g, p) => !p.library.some(c => isCreatureCard(c) && c.def.supertypes.includes("Legendary") && !has(g, p, c.def.name)),
      cards: (g, p, req) => req.purpose === "tutor" ? [best(g, p, req.options, "hand")] : null
    }
  });
  /* Celestial Reunion: X from the best creature we can reach; behold two creatures of a type to put a
     creature of that type onto the battlefield. */
  const typesHeld = (g, p) => {
    const n = {};
    for (const c of g.creatures(p).filter(c => !c.isToken).concat(p.hand.filter(isCreatureCard))) for (const t of new Set(c.def.subtypes)) n[t] = (n[t] || 0) + 1;
    return Object.keys(n).filter(t => n[t] >= 2).sort((a, b) => n[b] - n[a]);
  };
  D({
    name: "Celestial Reunion", cost: "{X}{G}", type: "Sorcery",
    text: "As an additional cost to cast this spell, you may choose a creature type and behold two creatures of that type.\nSearch your library for a creature card with mana value X or less, reveal it, put it into your hand, then shuffle. If this spell's additional cost was paid and the revealed card is the chosen type, put that card onto the battlefield instead of putting it into your hand.",
    note: "Beholding: two creatures of the type among the ones you control and the cards in your hand.",
    onCast: async (g, p, o, item) => {
      if (item.isCopy) return;
      const types = typesHeld(g, p);
      if (!types.length) return;
      const opts = [{ id: "", label: "Don't behold" }].concat(types.map(t => ({ id: t, label: `Behold two ${t}s` })));
      const pick = await g.ask(p, { type: "option", prompt: "Celestial Reunion: choose a creature type and behold two creatures of it?", options: opts, purpose: "behold", src: o });
      if (pick) { item.behold = pick; log(g, `${p.name} beholds two ${pick}s.`, p, ["Celestial Reunion"]); }
    },
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.x || 0, ty = ctx.item && ctx.item.behold;
        const got = await g.search(p, { filter: (g2, c) => isCreatureCard(c) && c.def.mv <= x, to: "hand", prompt: `Search for a creature card with mana value ${x} or less`, src: ctx.o });
        const c = got[0];
        if (c && ty && c.zone === "hand" && (c.def.subtypes.includes(ty) || c.def.changeling)) { g.putOntoBattlefield([c], p); log(g, `${c.def.name} is a ${ty}: it goes onto the battlefield.`, p, [c.def.name]); }
      }
    },
    ai: {
      priority: 5, tutor: true,
      option: (g, p, req) => { if (req.purpose !== "behold") return undefined; const want2 = p.__reunionWant; return want2 && req.options.some(o => o.id && want2.def.subtypes.includes(o.id)) ? req.options.find(o => o.id && want2.def.subtypes.includes(o.id)).id : (req.options[1] || req.options[0]).id; },
      x: (g, p, o, xMax) => { const b = xBest(g, p, xMax, c => true, "hand"); p.__reunionWant = b; return b ? b.def.mv : xMax; },
      hold: (g, p) => { const b = xBest(g, p, g.maxX(p, pc("{G}"), 1), () => true, "hand"); return !b || want(g, p, b, "hand") < 6; },
      cards: (g, p, req) => req.purpose === "tutor" ? [best(g, p, req.options, p.__reunionWant ? "battlefield" : "hand")] : null
    }
  });
  D({
    name: "Nature's Rhythm", cost: "{X}{G}{G}", type: "Sorcery",
    text: "Search your library for a creature card with mana value X or less, put it onto the battlefield, then shuffle.\nHarmonize {X}{G}{G}{G}{G} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by an amount of generic mana equal to its power. Then exile this spell.)",
    note: "Harmonize isn't offered.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, c) => isCreatureCard(c) && c.def.mv <= (ctx.x || 0), to: "battlefield", prompt: `Search for a creature card with mana value ${ctx.x || 0} or less`, src: ctx.o }) },
    ai: xTutorHints(c => true)
  });
  D({
    name: "Invasion of Ikoria", cost: "{X}{G}{G}", type: "Battle — Siege",
    text: "(As a Siege enters, choose an opponent to protect it. You and others can attack it. When it's defeated, exile it, then cast it transformed.)\nWhen this Siege enters, search your library and/or graveyard for a non-Human creature card with mana value X or less and put it onto the battlefield. If you search your library this way, shuffle.\nDefense 6 // Zilortha, Apex of Ikoria",
    note: "Battles can't be attacked here: it stays on the battlefield with its 6 defense counters and never becomes Zilortha.",
    etbCounters: () => ({ defense: 6 }),
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => g.search(p, { from: ["library", "graveyard"], filter: (g2, c) => isCreatureCard(c) && !c.def.subtypes.includes("Human") && c.def.mv <= (s.x || 0), to: "battlefield", prompt: `Search for a non-Human creature card with mana value ${s.x || 0} or less`, src: s })
    }],
    ai: xTutorHints(c => !c.def.subtypes.includes("Human"))
  });
  /* X tutors that put the creature onto the battlefield: X from the best creature in reach. */
  function xTutorHints(ok) {
    return {
      priority: 5, tutor: true,
      x: (g, p, o, xMax) => { const b = xBest(g, p, xMax, ok, "battlefield"); return b ? b.def.mv : xMax; },
      hold: (g, p, o) => { const b = xBest(g, p, g.maxX(p, g.spellCost(p, o, { x: 0 }), 1), ok, "battlefield"); return !b || want(g, p, b, "battlefield") < 6; },
      cards: (g, p, req) => req.purpose === "tutor" ? [best(g, p, req.options, "battlefield")] : null
    };
  }
  function xBest(g, p, xMax, ok, dest) {
    return best(g, p, p.library.filter(c => isCreatureCard(c) && c.def.mv <= xMax && ok(c)), dest);
  }
  D({
    name: "Tamiyo's Safekeeping", cost: "{G}", type: "Instant",
    text: "Target permanent you control gains hexproof and indestructible until end of turn. You gain 2 life. (A permanent with hexproof and indestructible can't be the target of spells or abilities your opponents control. Damage and effects that say \"destroy\" don't destroy it.)",
    spell: {
      targets: [{ kind: "permanent", you: true, purpose: "help", prompt: "Hexproof and indestructible until end of turn" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.grant(t, ["hexproof", "indestructible"]); g.gainLife(ctx.p, 2, ctx.o); }
    },
    ai: { protection: true, priority: 3, target: (g, p, req) => req.purpose === "help" ? threatened(g, p, req.options) : undefined }
  });

  /* ================================================================ the brain */
  /* How much the deck wants a creature card (tutors, Duskwatch, Fauna Shaman, Pod). */
  const BASE = {
    [ASHAYA]: 8, [ELDER]: 6, [WEAVER]: 6, [BALLISTA]: 3, [HOOF]: 3, [DUSK]: 5, [TYVAR]: 4, "Fauna Shaman": 5,
    "Avenger of Zendikar": 6, "Tireless Tracker": 6, "Tireless Provisioner": 6, "Lotus Cobra": 6, "Nissa, Resurgent Animist": 6,
    "Oracle of Mul Daya": 6, "Eternal Witness": 4, "Destiny Spinner": 3, "Priest of Titania": 5, "Devoted Druid": 3, "Endurance": 3,
    "Scavenging Ooze": 3, "Springheart Nantuko": 4, "Reclamation Sage": 3, "Formidable Speaker": 4, "Badgermole Cub": 5,
    "Quirion Ranger": 3, "Sylvan Safekeeper": 2, "Elvish Reclaimer": 3, "Delighted Halfling": 4, "Birds of Paradise": 4,
    "Llanowar Elves": 4, "Elvish Mystic": 4, "Fyndhorn Elves": 4, "Dryad Arbor": 2
  };
  const DORKS = new Set(["Delighted Halfling", "Birds of Paradise", "Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Dryad Arbor", "Devoted Druid", "Priest of Titania", "Badgermole Cub"]);
  /* The combo pieces: what this card adds to the mana engine. */
  function pieceBonus(g, p, name) {
    const ash = held(g, p, ASHAYA), unt = UNTAPPERS.some(n => held(g, p, n)), elder = held(g, p, ELDER), lodge = has(g, p, LODGE) || inHand(p, LODGE);
    if (name === ASHAYA) return has(g, p, ASHAYA) ? -10 : unt ? 22 : 6;
    if (name === ELDER || name === WEAVER) {
      if (UNTAPPERS.some(n => held(g, p, n))) return -2;
      return ash ? 22 : name === ELDER && lodge ? 16 : 3;
    }
    if (name === BALLISTA) { if (held(g, p, BALLISTA)) return -3; return engineSoon(g, p) ? 30 : ash && unt ? 18 : 2; }
    if (name === DUSK && engineSoon(g, p) && !held(g, p, BALLISTA) && !held(g, p, DUSK)) return 10;
    if (name === TYVAR && engineSoon(g, p) && !held(g, p, BALLISTA)) return 6;
    if (name === LODGE && elder && !lodge) return 12;
    // the other engines: Tyvar + Devoted Druid, Ashaya + Quirion Ranger
    if (name === "Devoted Druid" && held(g, p, TYVAR) && !held(g, p, name)) return 10;
    if (name === TYVAR && held(g, p, "Devoted Druid")) return 10;
    if (name === "Quirion Ranger" && ash && !held(g, p, name)) return 6;
    return 0;
  }
  // the engine is on the battlefield (or one card away from it)
  const engineSoon = (g, p) => (has(g, p, ASHAYA) && UNTAPPERS.some(n => has(g, p, n))) || (has(g, p, ELDER) && has(g, p, LODGE));
  function want(g, p, c, dest, pot) {
    if (!c) return -99;
    const d = c.def, name = d.name;
    if (pot == null) pot = manaNow(g, p);
    let s = BASE[name] != null ? BASE[name] : ((d.ai && d.ai.priority) || 4) * 0.6 + Math.min(3, d.mv * 0.4);
    if (DORKS.has(name)) s += g.controlled(p, o => g.isLand(o)).length < 5 ? 2 : -3;
    if (name === HOOF) s += hoofKills(g, p) ? 60 : g.creatures(p).length >= 5 ? 4 : 0;
    if (name === "Avenger of Zendikar") s += g.controlled(p, o => g.isLand(o)).length >= 7 ? 3 : 0;
    s += pieceBonus(g, p, name);
    if (d.supertypes.includes("Legendary") && has(g, p, name)) s -= 12;
    if (dest === "hand" && d.mv > pot + 2) s -= (d.mv - pot - 2) * 1.2;
    return s;
  }
  function best(g, p, list, dest) {
    if (!list.length) return null;
    const pot = manaNow(g, p), sc = new Map(list.map(c => [c, want(g, p, c, dest, pot)]));
    return list.slice().sort((a, b) => sc.get(b) - sc.get(a))[0];
  }
  function worst(g, p, list) {
    if (!list.length) return null;
    const pot = manaNow(g, p), sc = new Map(list.map(c => [c, want(g, p, c, "hand", pot)]));
    return list.slice().sort((a, b) => sc.get(a) - sc.get(b))[0];
  }
  // the pieces the bot protects and doesn't feed to Pod or Eldritch Evolution
  function isPiece(g, p, o) {
    const n = o.def.name;
    if (n === ASHAYA) return true;
    if (UNTAPPERS.includes(n)) return has(g, p, ASHAYA) || (n === ELDER && has(g, p, LODGE));
    if (n === "Devoted Druid") return has(g, p, TYVAR);
    if (n === TYVAR) return has(g, p, "Devoted Druid");
    return false;
  }
  /* Craterhoof's swing kills someone now (decks-azusa.js's test, with the team we have). */
  function hoofKills(g, p) {
    const x = g.creatures(p).length + 1;
    const ready = g.creatures(p).filter(c => unsick(g, c) && !c.tapped && !g.kw(c, "defender") && !g.ch(c).cantAttack);
    const dmg = ready.reduce((s, c) => s + Math.max(0, g.power(c)) + x, 0) + 5 + x;
    const opps = g.opponents(p);
    if (!opps.length) return false;
    const soak = q => g.creatures(q).filter(c => !c.tapped).reduce((s, c) => s + Math.max(0, g.toughness(c)), 0);
    return opps.some(q => dmg - soak(q) >= q.life) || dmg >= 2 * Math.min(...opps.map(q => q.life));
  }
  /* Blocks: the engine's pieces don't block where they'd die, unless the damage they stop is what keeps us alive. */
  function pieceBlocks(g, p, { attackers, blocks }) {
    const dies = (b, a) => !g.kw(b, "indestructible") && (g.kw(a, "deathtouch") || Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1) >= g.toughness(b));
    const drop = blocks.filter(x => isPiece(g, p, x.blocker) && dies(x.blocker, x.attacker));
    if (!drop.length) return null;
    const kept = blocks.filter(x => !drop.includes(x));
    const through = attackers.filter(a => !kept.some(x => x.attacker === a)).reduce((n, a) => n + (g.kw(a, "infect") ? 0 : Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1)), 0);
    return through >= p.life ? null : kept;
  }
  /* Our permanent the top of the stack threatens, among options (Safekeeper, Hollow, Tamiyo's). */
  function threatened(g, p, options) {
    const top = g.stack[g.stack.length - 1];
    const hit = top && top.p !== p ? (top.targets || []).filter(t => t && options.includes(t)) : [];
    return hit.sort((a, b) => (isPiece(g, p, b) - isPiece(g, p, a)))[0] || options.find(o => isPiece(g, p, o)) || options[0];
  }
  // a land to sacrifice: tapped basics first, never a creature, Lodge or an enchanted land
  const spareLand = (g, p, opts) => opts.filter(o => !g.isCreature(o) && o.def.name !== LODGE && !g.battlefield.some(a => a.attachedTo === o)).sort((a, b) => (b.tapped - a.tapped) || (g.isBasic(b) - g.isBasic(a)))[0] || opts.find(o => !g.isCreature(o)) || opts[0];

  /* Lines this game, for the bench (tools/sim/azusa/tele.js): { round, line, what }. */
  const note = (g, p, line, what) => { (p.azusaLines || (p.azusaLines = [])).push({ round: g.round, turn: g.turn, line, what }); };
  const memOf = (g, p) => { const m = p.azusaMem || (p.azusaMem = {}); if (m.turn !== g.turn) { p.azusaMem = { turn: g.turn }; return p.azusaMem; } return m; };
  const act = (acts, card, f) => acts.find(a => a.type === "activate" && a.card === card && (!f || f(a.ab)));
  const castOf = (acts, name, f) => acts.find(a => a.type === "cast" && a.card.def.name === name && !a.alt && (!f || f(a)));
  const lifeToKill = (g, p) => g.opponents(p).reduce((s, q) => s + Math.max(0, q.life), 0);

  /* An unlimited-mana engine ready now: the untapper's loop ability, its kind and the mana per loop. */
  function engineNow(g, p, acts, ctx) {
    let out = null;
    for (const o of g.controlled(p, x => UNTAPPERS.includes(x.def.name))) {
      if (o.tapped || !unsick(g, o)) continue;
      for (const kind of ["ashaya", "lodge"]) {
        const a = act(acts, o, ab => ab.loop === kind);
        if (!a) continue;
        const b = bestLoopLand(g, p, o, kind === "lodge");
        const per = b ? b.out - (kind === "lodge" ? 1 : 0) : 0;
        if (per >= 1 && (!out || per > out.per)) out = { card: o, idx: a.idx, kind, per };
      }
    }
    if (out) return out;
    // Tyvar + Devoted Druid: each pump ({3}{G}{G}) gives the Druid +X/+X, X more untaps for {G}; X is the
    // greatest power, which the pump also raises, so from X 6 (or 3 with mana to spare) it never runs out
    const tyvar = onBf(g, p, TYVAR)[0], druid = onBf(g, p, "Devoted Druid").find(o => !o.tapped && unsick(g, o));
    if (tyvar && druid && (ctx.window === "main1" || held(g, p, BALLISTA))) {
      const x = Math.max(0, ...g.creatures(p).map(c => g.power(c))), safe = g.toughness(druid) - 1;
      if (x >= 6 || (x >= 3 && manaNow(g, p) + Math.max(0, safe) >= 8)) return { card: druid, kind: "tyvar", tyvar, per: x - 5 };
    }
    // Ashaya + Quirion Ranger: Ranger (a Forest) returns itself to untap a mana creature and is cast
    // again for {G}; it enters as a land, so landfall pays (Nissa, Lotus Cobra, Tireless Provisioner)
    const ranger = onBf(g, p, "Quirion Ranger")[0] || inHand(p, "Quirion Ranger");
    if (has(g, p, ASHAYA) && ranger) {
      const fall = g.controlled(p, o => ["Nissa, Resurgent Animist", "Lotus Cobra", "Tireless Provisioner"].includes(o.def.name)).length;
      const top = Math.max(0, ...g.creatures(p).filter(c => c.def.name !== "Quirion Ranger" && unsick(g, c)).map(c => rangerOut(g, p, c)));
      const per = fall + top - 1;
      if (per >= 1 && top >= 1) return { card: ranger, kind: "ranger", per };
    }
    return null;
  }
  // the mana a creature makes when Quirion Ranger untaps it (Priest of Titania: one per Elf)
  function rangerOut(g, p, c) {
    if (c.def.name === "Devoted Druid") return 1;
    return outputOf(g, p, c);
  }
  /* One step of the Tyvar or Ranger engine: an action that makes mana (or null when it's stuck). */
  function engineStep(g, p, acts, eng, ctx) {
    if (eng.kind === "tyvar") {
      const d = eng.card;
      if (d.zone !== "battlefield") return null;
      const ta = act(acts, d, ab => ab.manaAbility);
      if (ta && g.toughness(d) - 1 >= 1) return { type: "activate", card: d, idx: ta.idx, repeat: Math.min(400, g.toughness(d) - 1), stop: g2 => d.zone !== "battlefield" || g2.toughness(d) <= 1, maxTries: 60 };
      const pa = eng.tyvar.zone === "battlefield" && act(acts, eng.tyvar, ab => ab.pump);
      if (pa) { const m = memOf(g, p); m.tyvarPumps = (m.tyvarPumps || 0) + 1; return { type: "activate", card: eng.tyvar, idx: pa.idx, maxTries: 60 }; }
      return null;
    }
    if (eng.kind === "ranger") {
      const m = memOf(g, p);
      const r = onBf(g, p, "Quirion Ranger")[0];
      if (r) {
        const a = act(acts, r);
        if (!a) return null;
        // tap the best mana creature first, so the untap pays
        const best = g.creatures(p).filter(c => c !== r && unsick(g, c)).sort((x, y) => rangerOut(g, p, y) - rangerOut(g, p, x))[0];
        if (!best) return null;
        if (!best.tapped) tapForMana(g, p, best);
        if (!best.tapped) return null;
        m.rangerLoop = { forest: r, untap: best };
        return { type: "activate", card: r, idx: a.idx, maxTries: 60 };
      }
      const c = castOf(acts, "Quirion Ranger");
      if (c) { m.rangerLoop = null; return { type: "cast", card: c.card, maxTries: 60 }; }
      return null;
    }
    return null;
  }
  /* The tutors that can fetch an outlet: what each finds, where it goes, its X, its cost in mana. */
  const isGreen = d => (d.colors || []).includes("G");
  const TUTORS = [
    { n: "Summoner's Pact", ok: d => isGreen(d), dest: "hand", cost: () => 0, pact: true },
    { n: "Green Sun's Zenith", ok: d => isGreen(d), dest: "battlefield", x: d => d.mv, cost: d => d.mv + 1 },
    { n: "Chord of Calling", ok: () => true, dest: "battlefield", x: d => d.mv, cost: d => d.mv + 3 },
    { n: "Finale of Devastation", ok: () => true, dest: "battlefield", x: d => Math.max(d.mv, 20), cost: d => Math.max(d.mv, 20) + 2 },
    { n: "Nature's Rhythm", ok: () => true, dest: "battlefield", x: d => d.mv, cost: d => d.mv + 2, main: true },
    { n: "Invasion of Ikoria", ok: d => !d.subtypes.includes("Human"), dest: "battlefield", x: d => d.mv, cost: d => d.mv + 2, main: true },
    { n: "Natural Order", ok: d => isGreen(d), dest: "battlefield", cost: () => 4, main: true, sacGreen: true },
    { n: "Time of Need", ok: d => d.supertypes.includes("Legendary"), dest: "hand", cost: () => 2, main: true },
    { n: "Celestial Reunion", ok: () => true, dest: "hand", x: d => d.mv, cost: d => d.mv + 1, main: true },
    { n: "Shared Summons", ok: () => true, dest: "hand", cost: () => 5 }
  ];
  /* Main phase with the engine: make the mana, then turn it into a kill: Walking Ballista (dug up by
     Duskwatch Recruiter, Fauna Shaman or the tutors), Craterhoof, Finale of Devastation, Tyvar's pump;
     with nothing else, the untapper untaps a land that draws (Arch of Orazca, Bonders' Enclave...) again
     and again. */
  function comboRun(g, p, acts, ctx) {
    const eng = engineNow(g, p, acts, ctx);
    if (!eng) return null;
    const m = memOf(g, p);
    const ENG = { ashaya: () => "Ashaya + " + eng.card.def.name, lodge: () => "Elder + Wirewood Lodge", tyvar: () => "Tyvar + Devoted Druid", ranger: () => "Ashaya + Quirion Ranger" };
    if (!m.started) { m.started = true; note(g, p, ENG[eng.kind](), "infinite mana"); }
    // the Ranger loop leaves its mana in untapped creatures and Treasures as much as in the pool
    const pool = eng.kind === "ranger" ? manaNow(g, p) : g.poolTotal(p), need = lifeToKill(g, p), main1 = ctx.window === "main1";
    if (need <= 0) return null;
    const make = mana => {
      const n = Math.ceil((mana - pool) / eng.per);
      if (n <= 0 || m.makes > (eng.kind === "ashaya" || eng.kind === "lodge" ? 60 : 300)) return null;
      m.makes = (m.makes || 0) + 1;
      if (eng.kind === "tyvar" || eng.kind === "ranger") return engineStep(g, p, acts, eng, ctx);
      return { type: "activate", card: eng.card, idx: eng.idx, repeat: Math.min(400, n), maxTries: 60 };
    };
    // spend `cost` on action a (or make the mana for it first)
    const pay = (cost, a) => (pool >= cost ? a : make(cost + 1));
    // 1. Walking Ballista on the battlefield: counters, then shoot every opponent
    const bal = g.controlled(p, o => o.def.name === BALLISTA).sort((a, b) => (b.counters.p1 || 0) - (a.counters.p1 || 0))[0];
    if (bal) {
      const k = need - (bal.counters.p1 || 0);
      if (k <= 0) {
        const ping = act(acts, bal, ab => !!ab.removeCounters);
        if (ping) { if (!m.pinging) { m.pinging = true; note(g, p, "Walking Ballista", "kill"); } return { type: "activate", card: bal, idx: ping.idx, repeat: Math.min(400, need + 2), stop: g2 => !g2.opponents(p).length || !(bal.counters.p1 > 0), maxTries: 8 }; }
      } else {
        const grow = act(acts, bal, ab => ab.cost === "{4}");
        if (grow && pool >= 4) return { type: "activate", card: bal, idx: grow.idx, repeat: Math.min(k, Math.floor(pool / 4)), maxTries: 60 };
        const r = make(4 * k);
        if (r) return r;
      }
    }
    // 2. Ballista in hand: cast it big
    const bh = inHand(p, BALLISTA);
    if (bh && !bal) {
      const c = castOf(acts, BALLISTA);
      if (c && c.xMax >= need) return { type: "cast", card: bh, x: need, maxTries: 4 };
      const r = make(2 * need + 2);
      if (r) return r;
      if (c) return { type: "cast", card: bh, x: c.xMax, maxTries: 4 };
    }
    // 3. Ballista in the graveyard: Regrowth or Eternal Witness brings it back
    if (!bal && !bh && p.graveyard.some(c => c.def.name === BALLISTA)) {
      for (const [n, cost] of [["Regrowth", 2], ["Eternal Witness", 3]]) {
        const ca = inHand(p, n) && castOf(acts, n);
        if (inHand(p, n)) { m.want = BALLISTA; const r = pay(cost, ca && { type: "cast", card: ca.card, maxTries: 2 }); if (r) return r; }
      }
    }
    const ballistaLib = !bal && !bh && inLib(p, BALLISTA);
    // 4. dig for Ballista: Duskwatch Recruiter, Fauna Shaman
    if (ballistaLib) {
      const dusk = g.controlled(p, o => o.def.name === DUSK)[0];
      const da = dusk && act(acts, dusk);
      if (dusk && p.library.some(isCreatureCard) && !m.duskDone) {
        m.want = BALLISTA;
        if (da && pool >= 3) { if ((m.dusk = (m.dusk || 0) + 1) > 6) m.duskDone = true; return { type: "activate", card: dusk, idx: da.idx, repeat: Math.min(30, Math.floor(pool / 3)), stop: () => !!inHand(p, BALLISTA) || !p.library.some(isCreatureCard), maxTries: 12 }; }
        const r = make(60);
        if (r) return r;
      }
      const fauna = g.controlled(p, o => o.def.name === "Fauna Shaman" && !o.tapped && unsick(g, o))[0];
      if (fauna && p.hand.some(isCreatureCard)) { m.want = BALLISTA; const a = act(acts, fauna); const r = pay(1, a && { type: "activate", card: fauna, idx: a.idx, maxTries: 3 }); if (r) return r; }
    }
    // 5. Craterhoof in hand (before combat)
    const hoofOut = has(g, p, HOOF);
    const hh = inHand(p, HOOF);
    if (hh && !hoofOut && main1) { const c = castOf(acts, HOOF); if (c && pool >= 8) { note(g, p, "Craterhoof Behemoth", "kill"); return { type: "cast", card: hh, maxTries: 3 }; } const r = make(9); if (r) return r; }
    // 6. a tutor for an outlet: Ballista where it can reach it, else Craterhoof, Duskwatch, Tyvar
    const outletWanted = [ballistaLib ? BALLISTA : null, !hoofOut && !hh ? HOOF : null, !has(g, p, DUSK) && ballistaLib ? DUSK : null, !has(g, p, TYVAR) && !inHand(p, TYVAR) ? TYVAR : null].filter(Boolean);
    for (const t of TUTORS) {
      const card = inHand(p, t.n);
      if (!card || (t.main && !main1 && !t.pact) || (t.dest === "battlefield" && !main1)) continue;
      if (t.pact && !g.canPay(p, pc("{2}{G}{G}")) && g.controlled(p, o => g.isLand(o)).length < 6) continue;
      if (t.sacGreen && !g.creatures(p).some(c => g.colorsOf(c).has("G") && !isPiece(g, p, c) && c !== eng.card && !c.isCommander)) continue;
      const pool2 = t.n === "Finale of Devastation" ? p.library.concat(p.graveyard) : p.library;
      const target = outletWanted.map(n => pool2.find(c => c.def.name === n && t.ok(c.def))).find(Boolean);
      if (!target) continue;
      m.want = target.def.name;
      const ca = castOf(acts, t.n);
      const x = t.x ? t.x(target.def) : null, cost = t.cost(target.def);
      if (ca && pool >= cost && (!ca.xCount || ca.xMax >= x)) {
        if (target.def.name === HOOF || t.n === "Finale of Devastation") note(g, p, t.n + (target.def.name === HOOF ? " for Craterhoof" : ""), "kill");
        return Object.assign({ type: "cast", card, maxTries: 3 }, x != null ? { x } : {});
      }
      const r = make(cost + 1);
      if (r) return r;
    }
    // a tutor that puts Ballista on top, with a land that draws it
    const drawer = g.controlled(p, o => !o.tapped && o.def.abilities.some(ab => ab.drawLand && (!ab.condition || ab.condition(g, o, p))))[0];
    if (ballistaLib && drawer && p.library[0] && p.library[0].def.name !== BALLISTA) {
      for (const n of ["Worldly Tutor", "Sylvan Tutor"]) {
        if (!inHand(p, n) || (n === "Sylvan Tutor" && !main1 && ctx.window !== "main2")) continue;
        m.want = BALLISTA;
        const ca = castOf(acts, n);
        const r = pay(6, ca && { type: "cast", card: ca.card, maxTries: 2 });
        if (r) return r;
      }
    }
    // 7. Tyvar's pump, again and again, before combat
    const tyvar = g.controlled(p, o => o.def.name === TYVAR)[0];
    if (tyvar && main1 && !m.pumped && g.creatures(p).filter(c => unsick(g, c) && !c.tapped && c !== eng.card).length >= 2) {
      const a = act(acts, tyvar, ab => ab.pump);
      if (a && pool >= 5 * 8) { m.pumped = true; note(g, p, "Tyvar pump", "kill"); return { type: "activate", card: tyvar, idx: a.idx, repeat: 8, maxTries: 3 }; }
      const r = make(5 * 8);
      if (r) return r;
    }
    // 8. draw: a land that draws, untapped again by the untapper (it untaps the land and itself with
    // Ashaya), until a card in hand is a way to win; Elvish Reclaimer finds such a land
    if (p.library.length > 8 && (m.draws || 0) < 40 && !m.drawStop) {
      const drawLands = g.controlled(p, o => o.def.abilities.some(ab => ab.drawLand && (!ab.condition || ab.condition(g, o, p))));
      const untapped = drawLands.find(o => !o.tapped);
      if (untapped) {
        const a = act(acts, untapped, ab => ab.drawLand);
        const cost = a ? MK.util.costMV(g.abilityCost(p, untapped, a.ab, 0)) : 5;
        if (a && pool >= cost) { m.draws = (m.draws || 0) + 1; if (m.draws === 1) note(g, p, "draw lands", "dig"); return { type: "activate", card: untapped, idx: a.idx, maxTries: 60 }; }
        const r = make(cost + 3);
        if (r) return r;
      } else if (drawLands.length && eng.kind === "ashaya" && !eng.card.tapped) {
        const a = act(acts, eng.card, ab => !ab.loop && ab.targets && ab.targets.length === 2);
        if (a) { m.untapPair = [drawLands[0], eng.card]; return { type: "activate", card: eng.card, idx: a.idx, maxTries: 60 }; }
      } else if (!drawLands.length) {
        const rec = g.controlled(p, o => o.def.name === "Elvish Reclaimer" && !o.tapped && unsick(g, o))[0];
        const want2 = ["Bonders' Enclave", "Arch of Orazca", "Mariposa Military Base", "War Room"].find(n => inLib(p, n));
        if (rec && want2) { const a = act(acts, rec); m.want = want2; const r = pay(2, a && { type: "activate", card: rec, idx: a.idx, maxTries: 2 }); if (r) return r; }
      }
    }
    // 9. everything else in the hand gets cast with the floating mana
    if (!m.floated) { m.floated = true; const r = make(Math.max(20, pool)); if (r) return r; }
    return null;
  }
  /* Protect the engine: Sylvan Safekeeper's shroud or Yavimaya Hollow's regeneration against an
     opponent's spell or ability aimed at a piece (Tamiyo's Safekeeping and the rest are the cards'
     own protection hints). */
  function protect(g, p, acts) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return null;
    const hit = (top.targets || []).find(t => t && !g.isPlayer(t) && t.controller === p && t.zone === "battlefield" && (isPiece(g, p, t) || t.def.name === "Azusa, Lost but Seeking"));
    if (!hit) return null;
    const keeper = g.controlled(p, o => o.def.name === "Sylvan Safekeeper")[0];
    if (keeper) { const a = act(acts, keeper); if (a) return { type: "activate", card: keeper, idx: a.idx, maxTries: 1 }; }
    const text = (top.o && top.o.def && top.o.def.text) || "";
    const hollow = g.controlled(p, o => o.def.name === "Yavimaya Hollow" && !o.tapped)[0];
    if (hollow && /destroy/i.test(text) && !/can't be regenerated/i.test(text)) { const a = act(acts, hollow); if (a) return { type: "activate", card: hollow, idx: a.idx, maxTries: 1 }; }
    const tam = castOf(acts, "Tamiyo's Safekeeping");
    if (tam) return { type: "cast", card: tam.card, targets: [hit], maxTries: 1 };
    return null;
  }
  function brain(g, p, ctx) {
    const acts = ctx.actions || [];
    if (ctx.window === "stack" || ctx.window === "ability") return protect(g, p, acts);
    if (!mainWin(ctx) || g.active !== p) return null;
    const run = comboRun(g, p, acts, ctx);
    if (run) return run;
    // Wirewood Lodge for an Argothian Elder that can loop (Crop Rotation puts it in untapped)
    const elder = g.controlled(p, o => o.def.name === ELDER && unsick(g, o) && !o.tapped)[0];
    if (elder && !has(g, p, LODGE) && inLib(p, LODGE) && bestLoopLand(g, p, elder, true) && bestLoopLand(g, p, elder, true).out >= 2) {
      const crop = castOf(acts, "Crop Rotation");
      if (crop) { memOf(g, p).want = LODGE; return { type: "cast", card: crop.card, maxTries: 2 }; }
    }
    // Ashaya with an untapper that can go this turn: Ashaya first
    const ash = castOf(acts, ASHAYA);
    if (ash && g.controlled(p, o => UNTAPPERS.includes(o.def.name) && !o.tapped && unsick(g, o)).length) return { type: "cast", card: ash.card, maxTries: 2 };
    // Springheart Nantuko bestowed on the best landfall creature
    const nan = acts.find(a => a.type === "cast" && a.card.def.name === "Springheart Nantuko" && a.alt === 1);
    if (nan && ctx.window === "main1") { const t = bestowTarget(g, p, g.creatures(p)); if (t) return { type: "cast", card: nan.card, alt: 1, targets: [t], maxTries: 2 }; }
    return null;
  }
  /* The deck's answers: Ballista shoots the opponent closest to dying, searches find the land or the
     creature the plan asked for. */
  function choose(g, p, req) {
    const m = p.azusaMem && p.azusaMem.turn === g.turn ? p.azusaMem : null;
    if (req.type === "target" && req.src && req.src.def && req.src.def.name === BALLISTA && req.purpose === "harm" && m && m.pinging) {
      const pl = req.options.filter(o => g.isPlayer(o) && o !== p && !o.lost).sort((a, b) => a.life - b.life);
      if (pl.length) return pl[0];
    }
    if (m && m.want && (req.type === "cards" || req.type === "target") && ["tutor", "duskwatch", "search", "regrow", "reanimate"].includes(req.purpose)) {
      const hit = (req.options || []).find(c => c && c.def && c.def.name === m.want);
      if (hit) return req.type === "cards" ? [hit] : hit;
    }
    if (req.purpose === "sacrifice" && req.src && req.src.def && req.src.def.name === "Crop Rotation") return spareLand(g, p, req.options);
    // Natural Order, Eldritch Evolution: never a piece of the engine (nor the commander) while there's other fodder
    if (req.type === "target" && req.purpose === "sacrifice" && req.src && req.src.def && ["Natural Order", "Eldritch Evolution"].includes(req.src.def.name)) {
      const ok = req.options.filter(o => !isPiece(g, p, o) && !o.isCommander && o.def.name !== BALLISTA);
      if (ok.length && ok.length < req.options.length) return ok.sort((a, b) => (b.isToken - a.isToken) || (want(g, p, a, "battlefield", 0) - want(g, p, b, "battlefield", 0)))[0];
    }
    return undefined;
  }
  const tutorBonus = (g, p, o) => pieceBonus(g, p, o.def.name);
  // Ashaya and the untappers stay out of attacks that don't kill
  const keepHome = (g, p, c) => isPiece(g, p, c) || c.def.name === ASHAYA || (UNTAPPERS.includes(c.def.name) && held(g, p, ASHAYA));

  /* ================================================================ the decks */
  const COMMANDER = "Azusa, Lost but Seeking";
  const V2 = ["Ancient Tomb", "Arch of Orazca", "Archdruid's Charm", ELDER, ASHAYA, "Beast Within", "Birds of Paradise", "Birthing Pod", "Bonders' Enclave", "Boseiju, Who Endures", "Castle Garenbrig", "Celestial Reunion", "Chord of Calling", HOOF, "Crop Rotation", "Delighted Halfling", "Destiny Spinner", "Devoted Druid", "Dryad Arbor", DUSK, "Eldritch Evolution", "Elvish Mystic", "Elvish Reclaimer", "Eternal Witness", "Evolving Wilds", "Fabled Passage", "Fauna Shaman", "Finale of Devastation", "Force of Vigor", "Formidable Speaker", "Fyndhorn Elves", "Green Sun's Zenith", "Heroic Intervention", "Invasion of Ikoria", "Jungle Basin", WEAVER, "Lightning Greaves", "Llanowar Elves", "Mariposa Military Base", "Misty Rainforest", "Natural Order", "Nature's Rhythm", "Priest of Titania", "Prismatic Vista", "Regrowth", "Rogue's Passage", "Shared Summons", "Snakeskin Veil", "Sol Ring", "Summoner's Pact", "Swiftfoot Boots", "Sylvan Library", "Sylvan Safekeeper", "Sylvan Tutor", "Terramorphic Expanse", "The One Ring", "Time of Need", "Tranquil Thicket", TYVAR, "Utopia Sprawl", "Veil of Summer", "Verdant Catacombs", BALLISTA, "War Room", "Wild Growth", "Windswept Heath", LODGE, "Wooded Foothills", "Worldly Tutor", "Yavimaya Hollow"].concat(Array(29).fill("Forest"));
  const V3 = ["Ancient Tomb", "Arch of Orazca", "Archdruid's Charm", ELDER, ASHAYA, "Avenger of Zendikar", "Badgermole Cub", "Beast Within", "Birds of Paradise", "Bonders' Enclave", "Boseiju, Who Endures", "Castle Garenbrig", "Chord of Calling", HOOF, "Crop Rotation", "Delighted Halfling", "Destiny Spinner", "Dryad Arbor", DUSK, "Eldritch Evolution", "Elvish Mystic", "Elvish Reclaimer", "Endurance", "Eternal Witness", "Evolving Wilds", "Fabled Passage", "Fauna Shaman", "Field of the Dead", "Finale of Devastation", "Force of Vigor", "Fyndhorn Elves", "Ghost Quarter", "Green Sun's Zenith", "Heroic Intervention", "Jungle Basin", WEAVER, "Lightning Greaves", "Llanowar Elves", "Lotus Cobra", "Mariposa Military Base", "Misty Rainforest", "Natural Order", "Nature's Claim", "Nissa, Resurgent Animist", "Oracle of Mul Daya", "Prismatic Vista", "Quirion Ranger", "Ram Through", "Reclamation Sage", "Regrowth", "Rogue's Passage", "Scavenging Ooze", "Snakeskin Veil", "Sol Ring", "Springheart Nantuko", "Summoner's Pact", "Swiftfoot Boots", "Sylvan Library", "Sylvan Safekeeper", "Sylvan Tutor", "Tamiyo's Safekeeping", "Terramorphic Expanse", "The One Ring", "Tireless Provisioner", "Tireless Tracker", "Tranquil Thicket", "Utopia Sprawl", "Veil of Summer", "Verdant Catacombs", BALLISTA, "War Room", "Wild Growth", "Windswept Heath", LODGE, "Wooded Foothills", "Worldly Tutor", "Yavimaya Hollow"].concat(Array(22).fill("Forest"));
  const deck = (id, label, list, blurb) => ({
    id, hero: "miku", variant: id, label, name: label, title: COMMANDER, commander: COMMANDER, identity: ["G"], bracket: 4, aggression: 0.5,
    style: "Lands and Ashaya combo", blurb, watch: [ASHAYA, ELDER, WEAVER, LODGE, BALLISTA], list
  });
  MK.AZUSA_VARIANTS = [
    deck("azusa-v2", "Azusa v2", V2, "Azusa with fast mana and creature tutors: Ashaya + Argothian Elder or Ley Weaver for unlimited mana, into Walking Ballista."),
    deck("azusa-v3", "Azusa v3", V3, "Azusa with more landfall (Lotus Cobra, Nissa, Avenger, Field of the Dead) and the same Ashaya combo.")
  ];
  MK.DECK_BRAINS = MK.DECK_BRAINS || {};
  for (const d of MK.AZUSA_VARIANTS) MK.DECK_BRAINS[d.id] = { plan: brain, choose, tutorBonus, keepHome };
  MK.THREAT_LANDS = Object.assign(MK.THREAT_LANDS || {}, { "azusa-v2": 0.25, "azusa-v3": 0.25 });
})(typeof window !== "undefined" ? window : globalThis);
