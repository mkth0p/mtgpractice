/* Azusa, Lost but Seeking ("Miku, Lost but Singing"): the Bracket 4 Miku deck, mono-green lands.
   Azusa plays three lands a turn. The deck ramps into Primeval Titan, Field of the Dead Zombies,
   Scute Swarm and Avenger of Zendikar, and kills with Dark Depths + Thespian's Stage: the Stage
   copies Dark Depths without its ice counters, so it's sacrificed at once for Marit Lage, a 20/20
   flying, indestructible Avatar. Every land search here looks for the missing combo piece first.
   A player can pilot it from the Play tab (MK.HERO_DECKS) and it also sits at the table as a bot.
   Card text follows the printed Oracle text; `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const pc = s => MK.parseCost(s);
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isLandCard = c => !!c && c.def.types.includes("Land");
  const isBasicCard = c => isLandCard(c) && c.def.supertypes.includes("Basic");
  const landfall = (s, ev, g) => mine(s, ev.o) && g.isLand(ev.o);
  const mainWin = ctx => ctx.window === "main1" || ctx.window === "main2";
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p;
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  const DEPTHS = "Dark Depths", STAGE = "Thespian's Stage";

  /* ---------- tokens */
  T.maritLage = MK.tokenDef({ key: "marit-lage", name: "Marit Lage", pt: [20, 20], colors: "B", supertypes: ["Legendary"], subtypes: ["Avatar"], keywords: ["flying", "indestructible"] });
  T.azusaInsect = MK.tokenDef({ key: "insect-g1", name: "Insect", pt: [1, 1], colors: "G", subtypes: ["Insect"] });
  T.azusaElemental = MK.tokenDef({ key: "elemental-g53", name: "Elemental", pt: [5, 3], colors: "G", subtypes: ["Elemental"] });
  T.food = T.food || MK.tokenDef({
    key: "food", name: "Food", types: ["Artifact"], subtypes: ["Food"], colors: [], text: "{2}, {T}, Sacrifice this token: You gain 3 life.",
    abilities: [{ label: "Gain 3 life", cost: "{2}", tap: true, sacSelf: true, do: (g, s, ctx) => g.gainLife(ctx.p, 3, s), ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.life < 25 } }]
  });

  /* ---------- the combo, for the bots */
  const has = (g, p, n) => g.controlled(p, o => o.def.name === n).length > 0;
  const inHand = (p, n) => p.hand.some(c => c.def.name === n);
  const inLib = (p, n) => p.library.some(c => c.def.name === n);
  /* The land a search should find: the missing half of Dark Depths + Thespian's Stage, then the
     other half, then Field of the Dead or a utility land we don't have, then a basic. */
  function landWish(g, p, cards) {
    const lands = cards.filter(isLandCard);
    if (!lands.length) return null;
    const d = has(g, p, DEPTHS) || inHand(p, DEPTHS), st = has(g, p, STAGE) || inHand(p, STAGE);
    const find = n => lands.find(c => c.def.name === n);
    if (d && !st && find(STAGE)) return find(STAGE);
    if (st && !d && find(DEPTHS)) return find(DEPTHS);
    if (!d && find(DEPTHS)) return find(DEPTHS);
    if (!st && find(STAGE)) return find(STAGE);
    const owned = new Set(g.controlled(p, o => g.isLand(o)).map(o => o.def.name));
    const util = ["Field of the Dead", "Castle Garenbrig", "Mosswort Bridge", "War Room", "Rogue's Passage", "Reliquary Tower"];
    for (const n of util) { const c = find(n); if (c && !owned.has(n)) return c; }
    return lands.find(isBasicCard) || lands[0];
  }
  /* ai.cards for every land search: the wished-for lands first. */
  function pickLands(g, p, req) {
    const opts = req.options.slice();
    const max = req.max == null ? opts.length : req.max;
    const out = [];
    while (out.length < max) {
      const rest = opts.filter(c => !out.includes(c));
      const c = landWish(g, p, rest);
      if (!c) break;
      out.push(c);
    }
    return out.length >= (req.min || 0) ? out : null;
  }
  /* A search spell is the best play while half of the combo is still in the library. */
  const comboMissing = (g, p) => !has(g, p, "Marit Lage") && ((!has(g, p, DEPTHS) && !inHand(p, DEPTHS) && inLib(p, DEPTHS)) || (!has(g, p, STAGE) && !inHand(p, STAGE) && inLib(p, STAGE)));
  const tutorCast = (g, p) => (comboMissing(g, p) ? 30 : undefined);
  /* Deck plan: play the combo lands, copy Dark Depths with the Stage, and go find a missing piece. */
  function plan(g, p, o, ctx) {
    if (!mainWin(ctx)) return null;
    const acts = ctx.actions;
    const depths = g.battlefield.find(x => x.def.name === DEPTHS && x.zone === "battlefield");
    if (depths && !has(g, p, "Marit Lage")) {
      const st = acts.find(a => a.type === "activate" && a.card.def.name === STAGE && a.ab && a.ab.stage);
      if (st) return { type: "activate", card: st.card, idx: st.idx };
    }
    const playPiece = acts.find(a => a.type === "land" && (a.card.def.name === DEPTHS || a.card.def.name === STAGE));
    if (playPiece) return playPiece;
    // a combo piece still in the library: go get it (the half that's missing, else Dark Depths)
    if (comboMissing(g, p)) {
      const crop = acts.find(a => a.type === "cast" && a.card.def.name === "Crop Rotation");
      if (crop) return { type: "cast", card: crop.card };
      const rec = acts.find(a => a.type === "activate" && a.card.def.name === "Elvish Reclaimer");
      if (rec) return { type: "activate", card: rec.card, idx: rec.idx };
    }
    return null;
  }

  /* ================================================================ commander */
  D({
    name: "Azusa, Lost but Seeking", cost: "{2}{G}", type: "Legendary Creature — Human Monk", pt: "1/2",
    text: "You may play two additional lands on each of your turns.",
    statics: [{ extraLands: 2 }],
    ai: { priority: 9, plan }
  });

  /* ================================================================ creatures */
  D({
    name: "Arboreal Grazer", cost: "{G}", type: "Creature — Sloth Beast", pt: "0/3",
    keywords: ["reach"],
    text: "Reach\nWhen Arboreal Grazer enters, you may put a land card from your hand onto the battlefield tapped.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const lands = p.hand.filter(isLandCard);
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Put a land card from your hand onto the battlefield tapped", options: lands, min: 0, max: 1, purpose: "landFromHand", src: s });
        const c = (pick || []).find(x => p.hand.includes(x));
        if (c) g.putOntoBattlefield([c], p, { tapped: true });
      }
    }],
    ai: { priority: 6, ramp: true, cards: (g, p, req) => pickLands(g, p, Object.assign({}, req, { min: 0, max: 1 })) }
  });
  D({
    name: "Sakura-Tribe Scout", cost: "{G}", type: "Creature — Human Scout", pt: "1/1",
    text: "{T}: You may put a land card from your hand onto the battlefield.",
    abilities: [{
      label: "Put a land from your hand onto the battlefield", tap: true,
      condition: (g, o, p) => p.hand.some(isLandCard),
      do: async (g, s, ctx) => {
        const p = ctx.p, lands = p.hand.filter(isLandCard);
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Put a land card from your hand onto the battlefield", options: lands, min: 0, max: 1, purpose: "landFromHand", src: s });
        const c = (pick || []).find(x => p.hand.includes(x));
        if (c) g.putOntoBattlefield([c], p);
      },
      ai: { use: (g, p, o, ctx) => (mainWin(ctx) && p.landsPlayed >= g.landDrops(p)) || endBeforeMe(g, p, ctx) }
    }],
    ai: { priority: 6, ramp: true, cards: (g, p, req) => pickLands(g, p, Object.assign({}, req, { min: 0, max: 1 })) }
  });
  D({
    name: "Elvish Reclaimer", cost: "{G}", type: "Creature — Elf Warrior", pt: "1/2",
    text: "Elvish Reclaimer gets +2/+2 as long as there are three or more land cards in your graveyard.\n{2}, {T}, Sacrifice a land: Search your library for a land card, put it onto the battlefield tapped, then shuffle.",
    statics: [{ applies: (g, s, o) => o === s && s.controller.graveyard.filter(isLandCard).length >= 3, pt: [2, 2] }],
    abilities: [{
      label: "Sacrifice a land: search for a land", cost: "{2}", tap: true,
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isLand(c), prompt: "Sacrifice a land" },
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => isLandCard(c), to: "battlefield", tapped: true, prompt: "Search for a land card", src: s }),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && comboMissing(g, p) }
    }],
    ai: {
      priority: 6, cards: pickLands,
      target: (g, p, req) => req.purpose === "sacrifice" ? req.options.filter(c => c.def.name !== DEPTHS && c.def.name !== STAGE).sort((a, b) => (b.tapped - a.tapped) || (g.isBasic(b) - g.isBasic(a)))[0] || req.options[0] : undefined
    }
  });
  D({
    name: "Lotus Cobra", cost: "{1}{G}", type: "Creature — Snake", pt: "2/1",
    text: "Landfall — Whenever a land you control enters, add one mana of any color.",
    note: "The mana is green.",
    triggers: [{ on: "enters", when: (g, s, ev) => landfall(s, ev, g), do: (g, s, ev, { p }) => { p.pool.G += 1; g.bump(); } }],
    ai: { priority: 7, ramp: true }
  });
  D({
    name: "Courser of Kruphix", cost: "{1}{G}{G}", type: "Enchantment Creature — Centaur", pt: "2/4",
    text: "Play with the top card of your library revealed.\nYou may play lands from the top of your library.\nLandfall — Whenever a land you control enters, you gain 1 life.",
    statics: [{ playLandsFrom: ["top"] }],
    triggers: [{ on: "enters", when: (g, s, ev) => landfall(s, ev, g), do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }],
    ai: { priority: 7 }
  });
  D({
    name: "Oracle of Mul Daya", cost: "{3}{G}", type: "Creature — Elf Shaman", pt: "2/2",
    text: "You may play an additional land on each of your turns.\nPlay with the top card of your library revealed.\nYou may play lands from the top of your library.",
    statics: [{ extraLands: 1, playLandsFrom: ["top"] }],
    ai: { priority: 8 }
  });
  D({
    name: "Ramunap Excavator", cost: "{2}{G}", type: "Creature — Snake Cleric", pt: "2/3",
    text: "You may play lands from your graveyard.",
    statics: [{ playLandsFrom: ["graveyard"] }],
    ai: { priority: 7 }
  });
  D({
    name: "Dryad of the Ilysian Grove", cost: "{2}{G}", type: "Enchantment Creature — Nymph Dryad", pt: "2/4",
    text: "You may play an additional land on each of your turns.\nLands you control are every basic land type in addition to their other types.",
    note: "The basic land types don't change anything in this deck.",
    statics: [{ extraLands: 1 }],
    ai: { priority: 7 }
  });
  const blessed = (g, p) => p.cityBlessing || (g.controlled(p).length >= 10 && (p.cityBlessing = true));
  D({
    name: "Wayward Swordtooth", cost: "{2}{G}", type: "Creature — Dinosaur", pt: "5/5",
    text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nYou may play an additional land on each of your turns.\nWayward Swordtooth can't attack or block unless you have the city's blessing.",
    statics: [{ extraLands: 1 }, { applies: (g, s, o) => o === s && !blessed(g, s.controller), cantAttack: true, cantBlock: true }],
    ai: { priority: 7 }
  });
  D({
    name: "Scute Swarm", cost: "{2}{G}", type: "Creature — Insect", pt: "1/1",
    text: "Landfall — Whenever a land you control enters, create a 1/1 green Insect creature token. If you control six or more lands, create a token that's a copy of Scute Swarm instead.",
    note: "Stops copying itself at 64 Scute Swarms.",
    triggers: [{
      on: "enters", when: (g, s, ev) => landfall(s, ev, g),
      do: (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        if (g.controlled(p, o => g.isLand(o)).length >= 6 && g.controlled(p, o => o.def.name === "Scute Swarm").length < 64) g.copyToken(p, s);
        else g.createToken(p, T.azusaInsect);
      }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Tireless Provisioner", cost: "{2}{G}", type: "Creature — Elf Scout", pt: "3/2",
    text: "Landfall — Whenever a land you control enters, create a Food token or a Treasure token. (Food is an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\" Treasure is an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    triggers: [{
      on: "enters", when: (g, s, ev) => landfall(s, ev, g),
      do: async (g, s, ev, { p }) => {
        const pick = await g.ask(p, { type: "option", prompt: "Tireless Provisioner: create a Food or a Treasure?", options: [{ id: 0, label: "Treasure" }, { id: 1, label: "Food" }], purpose: "provisioner", src: s });
        g.createToken(p, pick === 1 ? T.food : T.treasure);
      }
    }],
    ai: { priority: 7, ramp: true, option: (g, p) => (p.life < 15 ? 1 : 0) }
  });
  D({
    name: "Primeval Titan", cost: "{4}{G}{G}", type: "Creature — Giant", pt: "6/6",
    keywords: ["trample"],
    text: "Trample\nWhenever Primeval Titan enters or attacks, you may search your library for up to two land cards, put them onto the battlefield tapped, then shuffle.",
    triggers: ["enters", "attacks"].map(on => ({
      on, when: (g, s, ev) => ev.o === s,
      do: (g, s, ev, { p }) => g.search(p, { filter: (g2, c) => isLandCard(c), count: 2, to: "battlefield", tapped: true, prompt: "Search for up to two land cards", src: s })
    })),
    ai: { priority: 9, cards: pickLands }
  });
  D({
    name: "Titania, Protector of Argoth", cost: "{3}{G}{G}", type: "Legendary Creature — Elemental", pt: "5/3",
    text: "When Titania, Protector of Argoth enters, return target land card from your graveyard to the battlefield.\nWhenever a land you control is put into a graveyard from the battlefield, create a 5/3 green Elemental creature token.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "card", purpose: "reanimate", prompt: "Return a land card from your graveyard", from: (g2, pl) => pl.graveyard.filter(isLandCard) }), s);
          if (t && t.zone === "graveyard") g.putOntoBattlefield([t], p);
        }
      },
      { on: "putInGraveyard", when: (g, s, ev) => ev.from === "battlefield" && ev.p === s.controller && isLandCard(ev.o), do: (g, s, ev, { p }) => g.createToken(p, T.azusaElemental) }
    ],
    ai: { priority: 8, target: (g, p, req) => req.purpose === "reanimate" ? landWish(g, p, req.options) || req.options[0] : undefined }
  });
  D({
    name: "Bane of Progress", cost: "{4}{G}{G}", type: "Creature — Elemental", pt: "2/2",
    text: "When Bane of Progress enters, destroy all artifacts and enchantments. Put a +1/+1 counter on Bane of Progress for each permanent destroyed this way.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s) => {
        const list = g.battlefield.filter(o => g.isArtifact(o) || g.isEnchantment(o));
        const before = new Set(list);
        g.destroyAll(list, s);
        const gone = [...before].filter(o => o.zone !== "battlefield").length;
        if (gone) g.addCounters(s, "p1", gone, s);
      }
    }],
    ai: {
      priority: 7,
      hold: (g, p) => {
        const hits = g.battlefield.filter(o => g.isArtifact(o) || g.isEnchantment(o));
        const theirs = hits.filter(o => o.controller !== p && !o.isToken).length, ours = hits.filter(o => o.controller === p && !o.isToken).length;
        return theirs < ours + 3;
      }
    }
  });

  /* ================================================================ artifacts and enchantments */
  D({
    name: "Conduit of Worlds", cost: "{2}{G}{G}", type: "Artifact",
    text: "You may play lands from your graveyard.\n{T}: Choose target nonland permanent card in your graveyard. If you haven't cast a spell this turn, you may cast that card. If you do, you can't cast additional spells this turn. Activate only as a sorcery.",
    note: "Only the first ability works here.",
    statics: [{ playLandsFrom: ["graveyard"] }],
    ai: { priority: 6 }
  });
  D({
    name: "Expedition Map", cost: "{1}", type: "Artifact",
    text: "{2}, {T}, Sacrifice Expedition Map: Search your library for a land card, reveal it, put it into your hand, then shuffle.",
    abilities: [{
      label: "Search for a land card", cost: "{2}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => isLandCard(c), to: "hand", prompt: "Search for a land card", src: s }),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) || ctx.window === "main2" || (mainWin(ctx) && comboMissing(g, p)) }
    }],
    ai: { priority: 6, cast: tutorCast, cards: pickLands }
  });
  D({
    name: "Zuran Orb", cost: "{0}", type: "Artifact",
    text: "Sacrifice a land: You gain 2 life.",
    abilities: [{
      label: "Sacrifice a land: gain 2 life",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isLand(c), prompt: "Sacrifice a land" },
      do: (g, s, ctx) => g.gainLife(ctx.p, 2, s),
      ai: { use: (g, p, o, ctx) => p.life <= 3 && ctx.window === "combat" }
    }],
    ai: { priority: 3, target: (g, p, req) => req.purpose === "sacrifice" ? req.options.filter(c => c.tapped).sort((a, b) => g.isBasic(b) - g.isBasic(a))[0] || req.options[0] : undefined }
  });
  D({
    name: "Exploration", cost: "{G}", type: "Enchantment",
    text: "You may play an additional land on each of your turns.",
    statics: [{ extraLands: 1 }],
    ai: { priority: 8, ramp: true }
  });
  D({
    name: "Khalni Heart Expedition", cost: "{1}{G}", type: "Enchantment",
    text: "Landfall — Whenever a land you control enters, you may put a quest counter on Khalni Heart Expedition.\nRemove three quest counters from Khalni Heart Expedition and sacrifice it: Search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.",
    triggers: [{ on: "enters", when: (g, s, ev) => landfall(s, ev, g), do: (g, s) => g.addCounters(s, "quest", 1, s) }],
    abilities: [{
      label: "Search for two basic lands", removeCounters: { kind: "quest", n: 3 }, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => isBasicCard(c), count: 2, to: "battlefield", tapped: true, prompt: "Search for up to two basic land cards", src: s }),
      ai: { use: (g, p, o, ctx) => mainWin(ctx) }
    }],
    ai: { priority: 6, ramp: true }
  });
  D({
    name: "Sylvan Library", cost: "{1}{G}", type: "Enchantment",
    text: "At the beginning of your draw step, you may draw two additional cards. If you do, choose two cards in your hand drawn this turn. For each of those cards, pay 4 life or put the card on top of your library.",
    note: "You always put two cards back (paying 4 life instead isn't offered).",
    triggers: [{
      on: "drawStep", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        if (p.library.length < 3) return;
        g.draw(p, 2);
        const pick = await g.ask(p, { type: "cards", prompt: "Sylvan Library: put two cards back on top of your library", options: p.hand.slice(), min: Math.min(2, p.hand.length), max: Math.min(2, p.hand.length), purpose: "bottom", src: s });
        for (const c of (pick || []).filter(x => p.hand.includes(x)).slice(0, 2).reverse()) { g.removeFromZone(c); c.zone = "library"; p.library.unshift(c); }
        g.bump();
      }
    }],
    ai: { priority: 7, draw: true }
  });
  D({
    name: "Up the Beanstalk", cost: "{1}{G}", type: "Enchantment",
    text: "When Up the Beanstalk enters and whenever you cast a spell with mana value 5 or greater, draw a card.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) },
      { on: "cast", when: (g, s, ev) => ev.p === s.controller && !ev.item.faceDown && ev.o.def.mv >= 5, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: { priority: 7, draw: true }
  });

  /* ================================================================ instants and sorceries */
  const sacOwnLand = async (g, p, src) => {
    const lands = g.controlled(p, o => g.isLand(o));
    if (!lands.length) return false;
    const t = await g.ask(p, { type: "target", prompt: "Sacrifice a land", options: lands, purpose: "sacrifice", src });
    if (!t || t.zone !== "battlefield") return false;
    g.sacrifice(t);
    return true;
  };
  const sacPick = (g, p, req) => req.purpose === "sacrifice" ? req.options.filter(c => c.def.name !== DEPTHS && c.def.name !== STAGE).sort((a, b) => (b.tapped - a.tapped) || (g.isBasic(b) - g.isBasic(a)))[0] || req.options[0] : undefined;
  D({
    name: "Crop Rotation", cost: "{G}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice a land.\nSearch your library for a land card, put that card onto the battlefield, then shuffle.",
    note: "The land is sacrificed as the spell resolves.",
    canCast: (g, p) => g.controlled(p, o => g.isLand(o)).length > 0,
    spell: { do: async (g, ctx) => { if (await sacOwnLand(g, ctx.p, ctx.o)) await g.search(ctx.p, { filter: (g2, c) => isLandCard(c), to: "battlefield", prompt: "Search for a land card", src: ctx.o }); } },
    ai: { never: true, plan, cards: pickLands, target: sacPick }
  });
  D({
    name: "Harrow", cost: "{2}{G}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice a land.\nSearch your library for up to two basic land cards, put them onto the battlefield, then shuffle.",
    note: "The land is sacrificed as the spell resolves.",
    canCast: (g, p) => g.controlled(p, o => g.isLand(o)).length > 0,
    spell: { do: async (g, ctx) => { if (await sacOwnLand(g, ctx.p, ctx.o)) await g.search(ctx.p, { filter: (g2, c) => isBasicCard(c), count: 2, to: "battlefield", prompt: "Search for up to two basic land cards", src: ctx.o }); } },
    ai: { ramp: true, priority: 6, target: sacPick }
  });
  D({
    name: "Rampant Growth", cost: "{1}{G}", type: "Sorcery",
    text: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, c) => isBasicCard(c), to: "battlefield", tapped: true, prompt: "Search for a basic land card", src: ctx.o }) },
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Sylvan Scrying", cost: "{1}{G}", type: "Sorcery",
    text: "Search your library for a land card, reveal it, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, c) => isLandCard(c), to: "hand", prompt: "Search for a land card", src: ctx.o }) },
    ai: { priority: 6, tutor: true, cast: tutorCast, cards: pickLands }
  });
  const cardTypes = p => { const s = new Set(); for (const c of p.graveyard) for (const t of c.def.types) s.add(t); return s.size; };
  D({
    name: "Traverse the Ulvenwald", cost: "{G}", type: "Sorcery",
    text: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle.\nDelirium — If there are four or more card types among cards in your graveyard, instead search your library for a creature or land card, reveal it, put it into your hand, then shuffle.",
    spell: {
      do: (g, ctx) => {
        const del = cardTypes(ctx.p) >= 4;
        return g.search(ctx.p, { filter: (g2, c) => (del ? isLandCard(c) || c.def.types.includes("Creature") : isBasicCard(c)), to: "hand", prompt: del ? "Delirium: search for a creature or land card" : "Search for a basic land card", src: ctx.o });
      }
    },
    ai: { priority: 5, cast: (g, p) => (comboMissing(g, p) && cardTypes(p) < 4 ? undefined : tutorCast(g, p)), cards: (g, p, req) => { if (comboMissing(g, p)) return pickLands(g, p, req); const cre = req.options.filter(c => c.def.name === "Primeval Titan"); return cre.length ? [cre[0]] : pickLands(g, p, req); } }
  });
  D({
    name: "Hour of Promise", cost: "{4}{G}", type: "Sorcery",
    text: "Search your library for up to two land cards, put them onto the battlefield tapped, then shuffle. Then if you control three or more Deserts, create two 2/2 black Zombie creature tokens.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        await g.search(p, { filter: (g2, c) => isLandCard(c), count: 2, to: "battlefield", tapped: true, prompt: "Search for up to two land cards", src: ctx.o });
        if (g.controlled(p, o => g.isLand(o) && g.hasSub(o, "Desert")).length >= 3) g.createToken(p, T.zombie, { count: 2 });
      }
    },
    ai: { ramp: true, priority: 7, cards: pickLands }
  });
  D({
    name: "Life from the Loam", cost: "{1}{G}", type: "Sorcery",
    text: "Return up to three target land cards from your graveyard to your hand.\nDredge 3 (If you would draw a card, you may mill three cards instead. If you do, return this card from your graveyard to your hand.)",
    note: "Dredge isn't offered. The lands are chosen as it resolves.",
    canCast: (g, p) => p.graveyard.some(isLandCard),
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, lands = p.graveyard.filter(isLandCard);
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Return up to three land cards to your hand", options: lands, min: 0, max: Math.min(3, lands.length), purpose: "tutor", src: ctx.o });
        for (const c of (pick || []).filter(x => x.zone === "graveyard").slice(0, 3)) g.moveTo(c, "hand");
      }
    },
    ai: { priority: 5, hold: (g, p) => p.graveyard.filter(isLandCard).length < 2, cards: pickLands }
  });
  D({
    name: "Splendid Reclamation", cost: "{3}{G}", type: "Sorcery",
    text: "Return all land cards from your graveyard to the battlefield tapped.",
    spell: { do: (g, ctx) => { const lands = ctx.p.graveyard.filter(isLandCard); if (lands.length) g.putOntoBattlefield(lands, ctx.p, { tapped: true }); } },
    ai: { priority: 6, hold: (g, p) => p.graveyard.filter(isLandCard).length < 3 }
  });
  D({
    name: "Nature's Claim", cost: "{G}", type: "Instant",
    text: "Destroy target artifact or enchantment. Its controller gains 4 life.",
    spell: {
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Destroy" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (!t || !ctx.legal[0]) return; const q = t.controller; g.destroy(t, ctx.o); g.gainLife(q, 4, ctx.o); }
    },
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "Snakeskin Veil", cost: "{G}", type: "Instant",
    text: "Put a +1/+1 counter on target creature you control. It gains hexproof until end of turn.",
    spell: {
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "+1/+1 counter and hexproof" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (!t || !ctx.legal[0]) return; g.addCounters(t, "p1", 1, ctx.o); g.grant(t, ["hexproof"]); }
    },
    ai: {
      protection: true, priority: 3,
      target: (g, p, req) => { const top = g.stack[g.stack.length - 1]; return (top && top.p !== p && top.targets.find(t => t && req.options.includes(t))) || undefined; }
    }
  });
  D({
    name: "Tail Swipe", cost: "{G}", type: "Instant",
    text: "Choose target creature you control and target creature you don't control. If you cast this spell during your main phase, the creature you control gets +1/+1 until end of turn. Then those creatures fight each other. (Each deals damage equal to its power to the other.)",
    spell: {
      targets: [{ kind: "creature", opp: true, purpose: "harm", prompt: "Creature you don't control" }, { kind: "creature", you: true, purpose: "help", prompt: "Your creature that fights" }],
      do: (g, ctx) => {
        const [them, us] = ctx.targets;
        if (!them || !us || !ctx.legal[0] || !ctx.legal[1]) return;
        if (g.active === ctx.p && (g.phase === "main1" || g.phase === "main2")) g.pump(us, 1, 1);
        const a = Math.max(0, g.power(us)), b = Math.max(0, g.power(them));
        g.damage(us, them, a); g.damage(them, us, b);
      }
    },
    ai: {
      removal: true, minThreat: 4,
      hold: (g, p) => !g.creatures(p).some(c => g.power(c) >= 4),
      target: (g, p, req) => req.purpose === "help" ? req.options.slice().sort((a, b) => g.power(b) - g.power(a))[0] : undefined
    }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  function depthsCheck(g, s) {
    if (s.zone !== "battlefield" || (s.counters.ice || 0) > 0 || s.def.name !== DEPTHS) return;
    const p = s.controller;
    g.sacrifice(s);
    const [ml] = g.createToken(p, T.maritLage);
    if (ml) log(g, `Marit Lage rises: a 20/20 flying, indestructible Avatar for ${p.name}.`, p, ["Dark Depths"]);
  }
  land(DEPTHS, {
    type: "Legendary Land",
    text: "Dark Depths enters with ten ice counters on it.\n{3}: Remove an ice counter from Dark Depths.\nWhen Dark Depths has no ice counters on it, sacrifice it. If you do, create Marit Lage, a legendary 20/20 black Avatar creature token with flying and indestructible.",
    etbCounters: () => ({ ice: 10 }),
    abilities: [{
      label: "Remove an ice counter", cost: "{3}", depthsIce: true,
      condition: (g, o) => (o.counters.ice || 0) > 0,
      do: (g, s) => { g.removeCounters(s, "ice", 1); depthsCheck(g, s); },
      ai: { use: (g, p, o, ctx) => { if (!endBeforeMe(g, p, ctx) || has(g, p, STAGE) || has(g, p, "Marit Lage")) return false; const n = Math.floor(manaNow(g, p) / 3); return n > 0 ? { repeat: n } : false; } }
    }],
    ai: { plan }
  });
  const STAGE_AB = {
    label: "Become a copy of target land", cost: "{2}", tap: true, stage: true,
    targets: [{ kind: "land", purpose: "stage", prompt: "Thespian's Stage becomes a copy of", filter: (g, t, p, src) => t !== src }],
    do: (g, s, ctx) => {
      const t = ctx.targets[0];
      if (!t || !ctx.legal[0] || s.zone !== "battlefield") return;
      const base = t.copyDef || t.def;
      s.def = MK.derive(base, { abilities: base.abilities.filter(a => !a.stage).concat([STAGE_AB]) });
      g.ts++; g.bump();
      log(g, `Thespian's Stage becomes a copy of ${base.name}.`, ctx.p, [base.name]);
      depthsCheck(g, s);
    },
    ai: { use: (g, p, o, ctx) => mainWin(ctx) && o.def.name === STAGE && !has(g, p, "Marit Lage") && g.battlefield.some(x => x.def.name === DEPTHS) }
  };
  land(STAGE, {
    text: "{T}: Add {C}.\n{2}, {T}: Thespian's Stage becomes a copy of target land, except it has this ability.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [STAGE_AB],
    ai: { plan, target: (g, p, req) => req.purpose === "stage" ? req.options.find(o => o.def.name === DEPTHS && o.controller === p) || req.options.find(o => o.def.name === DEPTHS) || null : undefined }
  });
  land("Blast Zone", {
    text: "Blast Zone enters with a charge counter on it.\n{T}: Add {C}.\n{X}{X}, {T}: Put X charge counters on Blast Zone.\n{3}, {T}, Sacrifice Blast Zone: Destroy each nonland permanent with mana value equal to the number of charge counters on Blast Zone.",
    etbCounters: () => ({ charge: 1 }),
    mana: [{ tap: true, produce: "C" }],
    abilities: [
      { label: "Add X charge counters", cost: "{X}{X}", tap: true, minX: 1, do: (g, s, ctx) => g.addCounters(s, "charge", ctx.x, s), ai: { use: () => false } },
      {
        label: "Destroy each nonland permanent with that mana value", cost: "{3}", tap: true,
        do: (g, s) => {
          const n = s.counters.charge || 0;
          g.sacrifice(s);
          g.destroyAll(g.battlefield.filter(o => !g.isLand(o) && g.mvOf(o) === n), s);
        },
        ai: {
          use: (g, p, o, ctx) => {
            if (!mainWin(ctx)) return false;
            const n = o.counters.charge || 0;
            const hit = g.battlefield.filter(x => !g.isLand(x) && g.mvOf(x) === n);
            return hit.filter(x => x.controller !== p).length >= 3 && hit.filter(x => x.controller === p).length <= 1;
          }
        }
      }
    ]
  });
  land("Castle Garenbrig", {
    text: "Castle Garenbrig enters tapped unless you control a Forest.\n{T}: Add {G}.\n{2}{G}{G}, {T}: Add six {G}. Spend this mana only to cast creature spells or activate abilities of creatures.",
    note: "The six mana can pay for any spell.",
    etbTapped: (g, o) => !g.controlled(o.controller, l => l !== o && g.isLand(l) && l.def.subtypes.includes("Forest")).length,
    mana: [{ tap: true, produce: "G" }, { tap: true, cost: "{2}{G}{G}", produce: "GGGGGG" }]
  });
  land("Emergence Zone", {
    text: "{T}: Add {C}.\n{1}, {T}, Sacrifice Emergence Zone: You may cast spells this turn as though they had flash.",
    note: "Only its mana ability is used here.",
    mana: [{ tap: true, produce: "C" }]
  });
  land("Fabled Passage", {
    text: "{T}, Sacrifice Fabled Passage: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Then if you control four or more lands, untap that land.",
    abilities: [{
      label: "Search for a basic land", tap: true, sacSelf: true,
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const got = await g.search(p, { filter: (g2, c) => isBasicCard(c), to: "battlefield", tapped: true, prompt: "Search for a basic land card", src: s });
        if (got[0] && g.controlled(p, o => g.isLand(o)).length >= 4) g.untap(got[0]);
      },
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && ctx.window !== "combat" }
    }]
  });
  land("Field of the Dead", {
    text: "Field of the Dead enters tapped.\n{T}: Add {C}.\nWhenever Field of the Dead or another land you control enters, if you control seven or more lands with different names, create a 2/2 black Zombie creature token.",
    etbTapped: true,
    mana: [{ tap: true, produce: "C" }],
    triggers: [{
      on: "enters", when: (g, s, ev) => landfall(s, ev, g),
      intervening: (g, s) => new Set(g.controlled(s.controller, o => g.isLand(o)).map(o => o.def.name)).size >= 7,
      do: (g, s, ev, { p }) => g.createToken(p, T.zombie)
    }]
  });
  const landKill = (name, text, extra) => land(name, Object.assign({
    text, mana: [{ tap: true, produce: "C" }],
    ai: { target: (g, p, req) => req.purpose === "landKill" ? req.options.filter(o => o.controller !== p).sort((a, b) => AI().threat(g, b, p) - AI().threat(g, a, p))[0] || null : undefined }
  }, extra));
  const worthKilling = (g, p, o) => o.controller !== p && (o.def.legendary || o.def.abilities.length > 0 || o.def.name === DEPTHS);
  landKill("Ghost Quarter", "{T}: Add {C}.\n{T}, Sacrifice Ghost Quarter: Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield, then shuffle.", {
    abilities: [{
      label: "Destroy target land", tap: true, sacSelf: true,
      targets: [{ kind: "land", purpose: "landKill", prompt: "Destroy", filter: (g, t, p) => t.controller !== p }],
      do: async (g, s, ctx) => { const t = ctx.targets[0]; if (!t || !ctx.legal[0]) return; const q = t.controller; g.destroy(t, s); if (!q.lost) await g.search(q, { filter: (g2, c) => isBasicCard(c), to: "battlefield", prompt: "Ghost Quarter: search for a basic land card", src: s }); },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && g.battlefield.some(x => g.isLand(x) && worthKilling(g, p, x)) }
    }]
  });
  landKill("Strip Mine", "{T}: Add {C}.\n{T}, Sacrifice Strip Mine: Destroy target land.", {
    abilities: [{
      label: "Destroy target land", tap: true, sacSelf: true,
      targets: [{ kind: "land", purpose: "landKill", prompt: "Destroy", filter: (g, t, p) => t.controller !== p }],
      do: (g, s, ctx) => { if (ctx.targets[0] && ctx.legal[0]) g.destroy(ctx.targets[0], s); },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && g.battlefield.some(x => g.isLand(x) && worthKilling(g, p, x)) }
    }]
  });
  landKill("Tectonic Edge", "{T}: Add {C}.\n{1}, {T}, Sacrifice Tectonic Edge: Destroy target nonbasic land. Activate only if an opponent controls four or more lands.", {
    abilities: [{
      label: "Destroy target nonbasic land", cost: "{1}", tap: true, sacSelf: true,
      condition: (g, o, p) => g.opponents(p).some(q => g.controlled(q, x => g.isLand(x)).length >= 4),
      targets: [{ kind: "land", purpose: "landKill", prompt: "Destroy", filter: (g, t, p) => t.controller !== p && !g.isBasic(t) }],
      do: (g, s, ctx) => { if (ctx.targets[0] && ctx.legal[0]) g.destroy(ctx.targets[0], s); },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && g.battlefield.some(x => g.isLand(x) && !g.isBasic(x) && worthKilling(g, p, x)) }
    }]
  });
  land("Hashep Oasis", {
    type: "Land — Desert",
    text: "{T}: Add {C}.\n{T}, Pay 1 life: Add {G}.\n{1}{G}{G}, {T}, Sacrifice a Desert: Target creature gets +3/+3 until end of turn. Activate only as a sorcery.",
    note: "Its green mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "G", condition: (g, o) => o.controller.life > 1, after: (g, o) => g.loseLife(o.controller, 1) }],
    abilities: [{
      label: "Sacrifice a Desert: +3/+3", cost: "{1}{G}{G}", tap: true, timing: "sorcery",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isLand(c) && g.hasSub(c, "Desert"), prompt: "Sacrifice a Desert" },
      targets: [{ kind: "creature", purpose: "help", prompt: "+3/+3 until end of turn" }],
      do: (g, s, ctx) => { if (ctx.targets[0] && ctx.legal[0]) g.pump(ctx.targets[0], 3, 3); },
      ai: { use: () => false }
    }]
  });
  land("Mosswort Bridge", {
    text: "Hideaway 4 (When this permanent enters, look at the top four cards of your library, exile one face down, then put the rest on the bottom of your library.)\nMosswort Bridge enters tapped.\n{T}: Add {G}.\n{G}, {T}: You may play the exiled card without paying its mana cost if creatures you control have total power 10 or greater.",
    etbTapped: true,
    mana: [{ tap: true, produce: "G" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 4);
        if (!top.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Hideaway: choose a card to exile face down", options: top, min: 1, max: 1, purpose: "hideaway", src: s });
        const c = (pick || []).find(x => top.includes(x)) || top[0];
        g.moveTo(c, "exile");
        c.hidden = true;
        s.state.hidden = c;
        for (const o of top) if (o !== c && o.zone === "library") { g.removeFromZone(o); p.library.push(o); }
        log(g, `${p.name} exiles a card face down with Mosswort Bridge.`, p, ["Mosswort Bridge"]);
      }
    }],
    abilities: [{
      label: "Play the hidden card", cost: "{G}", tap: true,
      condition: (g, o, p) => !!o.state.hidden && o.state.hidden.zone === "exile" && g.creatures(p).reduce((n, c) => n + Math.max(0, g.power(c)), 0) >= 10,
      do: async (g, s, ctx) => {
        const c = s.state.hidden;
        if (!c || c.zone !== "exile") return;
        s.state.hidden = null; c.hidden = false;
        if (isLandCard(c)) g.putOntoBattlefield([c], ctx.p);
        else await g.castWithoutPaying(ctx.p, c);
      },
      ai: { use: (g, p, o, ctx) => mainWin(ctx) }
    }],
    ai: { cards: (g, p, req) => req.purpose === "hideaway" ? [req.options.slice().sort((a, b) => (isLandCard(a) - isLandCard(b)) || (b.def.mv - a.def.mv))[0]] : null }
  });
  land("Tranquil Thicket", {
    text: "Tranquil Thicket enters tapped.\n{T}: Add {G}.\nCycling {G} ({G}, Discard this card: Draw a card.)",
    etbTapped: true, cycling: "{G}",
    mana: [{ tap: true, produce: "G" }]
  });

  /* ================================================================ the deck */
  MK.AZUSA_DECK = {
    id: "azusa", hero: "miku", variant: "b4", label: "Bracket 4 Azusa", name: "Azusa", title: "Azusa, Lost but Seeking",
    commander: "Azusa, Lost but Seeking", identity: ["G"], bracket: 4, aggression: 0.5,
    style: "Lands and Marit Lage",
    blurb: "The Bracket 4 Miku deck: Azusa plays three lands a turn, and Thespian's Stage copying Dark Depths makes a 20/20 flying, indestructible Marit Lage.",
    watch: ["Dark Depths", "Thespian's Stage", "Primeval Titan", "Field of the Dead", "Scute Swarm"],
    list: ["Arboreal Grazer", "Arcane Signet", "Avenger of Zendikar", "Bane of Progress", "Beast Within", "Birds of Paradise", "Blast Zone", "Castle Garenbrig", "Conduit of Worlds", "Courser of Kruphix", "Craterhoof Behemoth", "Crop Rotation", "Dark Depths", "Dryad Arbor", "Dryad of the Ilysian Grove", "Elvish Mystic", "Elvish Reclaimer", "Emergence Zone", "Evolving Wilds", "Expedition Map", "Exploration", "Explore", "Fabled Passage", "Field of the Dead", "Fyndhorn Elves", "Garruk's Uprising", "Ghost Quarter", "Harmonize", "Harrow", "Hashep Oasis", "Heroic Intervention", "Hour of Promise", "Khalni Heart Expedition", "Kodama's Reach", "Life from the Loam", "Lightning Greaves", "Llanowar Elves", "Lotus Cobra", "Mosswort Bridge", "Myriad Landscape", "Nature's Claim", "Nature's Lore", "Oracle of Mul Daya", "Primeval Titan", "Ram Through", "Rampaging Baloths", "Rampant Growth", "Ramunap Excavator", "Reclamation Sage", "Reliquary Tower", "Rogue's Passage", "Sakura-Tribe Elder", "Sakura-Tribe Scout", "Scute Swarm", "Skullclamp", "Snakeskin Veil", "Sol Ring", "Splendid Reclamation", "Strip Mine", "Sylvan Library", "Sylvan Scrying", "Tail Swipe", "Tectonic Edge", "Terramorphic Expanse", "Thespian's Stage", "Three Visits", "Tireless Provisioner", "Tireless Tracker", "Titania, Protector of Argoth", "Tranquil Thicket", "Traverse the Ulvenwald", "Up the Beanstalk", "War Room", "Wayward Swordtooth", "Zuran Orb"].concat(Array(24).fill("Forest"))
  };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.AZUSA_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.AZUSA_DECK);
})(typeof window !== "undefined" ? window : globalThis);
