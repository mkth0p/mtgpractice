/* Azusa, Lost but Seeking ("Miku, Lost but Singing"): the Bracket 4 Miku deck, mono-green lands.
   Azusa plays three lands a turn. The deck ramps into Primeval Titan, Field of the Dead Zombies,
   Scute Swarm and Avenger of Zendikar, and kills with Dark Depths + Thespian's Stage: the Stage
   copies Dark Depths without its ice counters, so it's sacrificed at once for Marit Lage, a 20/20
   flying, indestructible Avatar. Every land search here looks for the missing combo piece first,
   and the bot's decisions live in `brain` (Azusa's plan).
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
  T.maritLage = MK.tokenDef({ key: "marit-lage", name: "Marit Lage", pt: [20, 20], colors: "B", supertypes: ["Legendary"], subtypes: ["Avatar"], keywords: ["flying", "indestructible"], ai: { attackTarget: lageTarget, attackFocus: lageAttackFocus } });
  T.azusaInsect = MK.tokenDef({ key: "insect-g1", name: "Insect", pt: [1, 1], colors: "G", subtypes: ["Insect"] });
  T.azusaElemental = MK.tokenDef({ key: "elemental-g53", name: "Elemental", pt: [5, 3], colors: "G", subtypes: ["Elemental"] });
  T.food = T.food || MK.tokenDef({
    key: "food", name: "Food", types: ["Artifact"], subtypes: ["Food"], colors: [], text: "{2}, {T}, Sacrifice this token: You gain 3 life.",
    abilities: [{ label: "Gain 3 life", cost: "{2}", tap: true, sacSelf: true, do: (g, s, ctx) => g.gainLife(ctx.p, 3, s), ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.life < 25 } }]
  });

  /* The other bots' threat judgement counts Azusa's lands at a quarter of their usual weight: three a
     turn put her far ahead on lands while she's behind on what wins (ai.js playerThreat). */
  MK.THREAT_LANDS = Object.assign(MK.THREAT_LANDS || {}, { azusa: 0.25 });

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
  /* A combo piece sits in the graveyard with no copy on the battlefield or in hand, and no Marit
     Lage is out: Life from the Loam, Splendid Reclamation and Titania bring it back. */
  const inGy = (p, n) => p.graveyard.some(c => c.def.name === n);
  const pieceInGy = (g, p) => !has(g, p, "Marit Lage") && [DEPTHS, STAGE].some(n => inGy(p, n) && !has(g, p, n) && !inHand(p, n));
  const lageOf = (g, p) => g.controlled(p, o => o.def.name === "Marit Lage")[0] || null;

  /* ================================================================ the brain (Azusa's ai.plan)
     Azusa's plan runs from the command zone, the battlefield or the hand, so it's always there.
     On other players' spells it keeps Marit Lage alive, and in combat Zuran Orb keeps us alive. In
     our main phases, in order: make Marit Lage, go find the missing half of the combo (or bring it
     back from the graveyard), cast the landfall cards and extra land drops before the lands,
     Craterhoof when the swing kills, and Skullclamp on the 1/1 tokens. Marit Lage's token picks
     whom the whole team attacks (lageFocus below). */
  // cards that do more when they're out before this turn's land drops, best first
  const BEFORE_LANDS = ["Azusa, Lost but Seeking", "Exploration", "Dryad of the Ilysian Grove", "Oracle of Mul Daya", "Wayward Swordtooth",
    "Scute Swarm", "Avenger of Zendikar", "Lotus Cobra", "Tireless Provisioner", "Tireless Tracker", "Rampaging Baloths", "Khalni Heart Expedition", "Courser of Kruphix"];
  const MORE_DROPS = new Set(BEFORE_LANDS.slice(0, 5));
  const enterUntapped = (g, p, c) => { const t = c.def.etbTapped; if (t === true) return false; if (typeof t === "function") { try { return !t(g, { controller: p, def: c.def, id: -1 }); } catch (e) { return false; } } return true; };
  const castAct = (acts, n) => acts.find(a => a.type === "cast" && a.card.def.name === n && !a.alt && !a.faceDown);
  const activateAct = (acts, n, f) => acts.find(a => a.type === "activate" && a.card.def.name === n && (!f || f(a)));
  // an opponent's spell or ability that would remove a creature: it targets it, or it's an enters
  // trigger that exiles, destroys or bounces a target (Oblivion Ring picks as it resolves)
  const REMOVAL_TEXT = /(exile|destroy|return)[^.]*target[^.]*(creature|permanent)/i;
  function threatensRemoval(g, p, item, o) {
    if (!item || item.p === p) return false;
    if ((item.targets || []).includes(o)) return true;
    return item.kind === "trigger" && !!item.o && !!item.o.def && REMOVAL_TEXT.test(item.o.def.text || "") && item.trig && item.trig.tr && item.trig.tr.on === "enters";
  }
  function brain(g, p, o, ctx) {
    const acts = ctx.actions || [];
    const lage = lageOf(g, p);
    // keep Marit Lage: Snakeskin Veil (hexproof), else Heroic Intervention, against removal aimed at her
    if ((ctx.window === "stack" || ctx.window === "ability") && lage) {
      const top = g.stack[g.stack.length - 1];
      if (!threatensRemoval(g, p, top, lage)) return null;
      const veil = castAct(acts, "Snakeskin Veil");
      if (veil && g.canTarget(p, lage)) return { type: "cast", card: veil.card, targets: [lage] };
      const hi = castAct(acts, "Heroic Intervention");
      if (hi) return { type: "cast", card: hi.card };
      return null;
    }
    // lethal combat damage coming at us: Zuran Orb turns spare lands into enough life to live
    if (ctx.window === "combat" && g.combat && g.combat.attacker !== p) {
      const orb = activateAct(acts, "Zuran Orb");
      if (!orb) return null;
      const need = incomingDamage(g, p) - p.life + 1;
      const spare = g.controlled(p, x => g.isLand(x) && x.def.name !== DEPTHS && x.def.name !== STAGE).length;
      const n = Math.ceil(need / 2);
      return need > 0 && n <= spare ? { type: "activate", card: orb.card, idx: orb.idx, repeat: n } : null;
    }
    if (!mainWin(ctx)) return null;
    // 1. the combo: the Stage copies Dark Depths, and the pieces get played first
    const depths = g.battlefield.find(x => x.def.name === DEPTHS && x.zone === "battlefield" && x.controller === p);
    if (depths && !lage) {
      const st = acts.find(a => a.type === "activate" && a.card.def.name === STAGE && a.ab && a.ab.stage);
      if (st) return { type: "activate", card: st.card, idx: st.idx };
    }
    const playPiece = acts.find(a => a.type === "land" && (a.card.def.name === DEPTHS || a.card.def.name === STAGE) && !has(g, p, a.card.def.name));
    if (playPiece && !lage) return playPiece;
    // 2. a combo piece still in the library: go get it (the half that's missing, else Dark Depths)
    if (comboMissing(g, p)) {
      const crop = castAct(acts, "Crop Rotation");
      if (crop) return { type: "cast", card: crop.card };
      const rec = activateAct(acts, "Elvish Reclaimer");
      if (rec) return { type: "activate", card: rec.card, idx: rec.idx };
      const map = activateAct(acts, "Expedition Map");
      if (map) return { type: "activate", card: map.card, idx: map.idx };
      for (const n of ["Sylvan Scrying", "Expedition Map", "Primeval Titan", "Hour of Promise"]) { const a = castAct(acts, n); if (a) return { type: "cast", card: a.card }; }
    }
    // a combo piece in the graveyard: bring it back
    if (pieceInGy(g, p)) {
      for (const n of ["Life from the Loam", "Ramunap Excavator", "Titania, Protector of Argoth", "Splendid Reclamation", "Conduit of Worlds"]) { const a = castAct(acts, n); if (a) return { type: "cast", card: a.card }; }
    }
    // 3. landfall cards and extra land drops before this turn's lands
    const landActs = acts.filter(a => a.type === "land");
    if (landActs.length) {
      const landsLeft = new Set(landActs.map(a => a.card)).size;
      const dropsLeft = g.landDrops(p) - p.landsPlayed;
      for (const n of BEFORE_LANDS) {
        if (MORE_DROPS.has(n) && landsLeft <= dropsLeft) continue;
        const a = castAct(acts, n);
        if (a) return { type: "cast", card: a.card };
      }
      // one land first when it pays for a landfall card that's one mana short, then the rest after it
      if (landsLeft >= 2 && dropsLeft >= 2) {
        const mana = manaNow(g, p);
        const want = p.hand.concat(p.command.filter(c => c.isCommander)).filter(c => BEFORE_LANDS.includes(c.def.name) && !g.castOptions(p, c).length && g.spellCost && MK.util.costMV(g.spellCost(p, c)) === mana + 1);
        const untapped = landActs.filter(a => enterUntapped(g, p, a.card) && a.card.def.name !== DEPTHS && a.card.def.mana && a.card.def.mana.length);
        if (want.length && untapped.length) return untapped.find(a => isBasicCard(a.card)) || untapped[0];
      }
    }
    // 4. Craterhoof before combat when the swing kills someone (trample: blockers soak only their toughness)
    const hoof = ctx.window === "main1" && castAct(acts, "Craterhoof Behemoth");
    if (hoof && hoofKills(g, p)) return { type: "cast", card: hoof.card };
    // 5. Skullclamp on the 1/1 tokens: two cards each
    const clamp = activateAct(acts, "Skullclamp", a => a.ab.label === "Equip");
    if (clamp && p.library.length > 20 && p.hand.length < 8 && g.creatures(p).some(c => c.isToken && g.toughness(c) === 1 && c.def.name !== "Scute Swarm")) {
      return { type: "activate", card: clamp.card, idx: clamp.idx, maxTries: 12 };
    }
    return null;
  }
  /* The combat damage about to hit p: unblocked attackers, and what tramplers push past their blockers. */
  function incomingDamage(g, p) {
    let n = 0;
    for (const a of g.combat.attackers) {
      if (!a.combat || g.defenderOf(a.combat.attacking) !== p || g.kw(a, "infect")) continue;
      let d = Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1);
      if (a.combat.wasBlocked) d = g.kw(a, "trample") ? Math.max(0, d - a.combat.blockedBy.reduce((s, b) => s + Math.max(0, g.toughness(b)), 0)) : 0;
      n += d;
    }
    return n;
  }
  /* Craterhoof Behemoth's swing: everything that can attack (and the hasty Hoof) gets +X/+X and
     trample, X the creatures we'll control. It kills an opponent whose untapped creatures can't
     soak enough of it, or it's twice the lowest life total anyway. */
  function hoofKills(g, p) {
    const x = g.creatures(p).length + 1;
    const ready = g.creatures(p).filter(c => (!c.sick || g.kw(c, "haste")) && !c.tapped && !g.kw(c, "defender") && !g.ch(c).cantAttack);
    const dmg = ready.reduce((s, c) => s + Math.max(0, g.power(c)) + x, 0) + 5 + x;
    const opps = g.opponents(p);
    if (!opps.length) return false;
    const soak = q => g.creatures(q).filter(c => !c.tapped).reduce((s, c) => s + Math.max(0, g.toughness(c)), 0);
    return opps.some(q => dmg - soak(q) >= q.life) || dmg >= 2 * Math.min(...opps.map(q => q.life));
  }
  /* Whom Marit Lage and the team attack together: someone the swing kills now, else whoever dies
     in the fewest swings, where a player with most of the table's creatures counts as up to one
     and a half swings closer (they're the one killing us). A swing is Marit Lage's power
     unless a flier or reach creature can chump her, plus the other attackers that get past the
     player's untapped creatures (they block the biggest ones). */
  function lageFocus(g, p, ml, among) {
    const opps = g.opponents(p).filter(q => !among || among.includes(q));
    if (!opps.length) return null;
    const team = g.creatures(p).filter(c => c !== ml && !c.tapped && (!c.sick || g.kw(c, "haste")) && g.power(c) > 0 && !g.ch(c).cantAttack && !g.kw(c, "defender") && !(c.def.mana.length && g.power(c) <= 1))
      .map(c => Math.max(0, g.power(c))).sort((a, b) => a - b);
    const swing = q => {
      const chump = g.creatures(q).some(b => g.canBlock(b, ml));
      const walls = g.creatures(q).filter(b => !b.tapped).length - (chump ? 1 : 0);
      const rest = team.slice(0, Math.max(0, team.length - walls)).reduce((s, n) => s + n, 0);
      return (chump && !g.kw(ml, "trample") ? 0 : Math.max(0, g.power(ml))) + rest;
    };
    const danger = q => g.creatures(q).reduce((s, c) => s + Math.max(0, g.power(c)) + 0.5, 0) + (g.battlefield.some(c => c.controller === q && c.isCommander) ? 5 : 0);
    const swings = q => Math.ceil(Math.max(1, q.life) / Math.max(1, swing(q)));
    const total = opps.reduce((s, q) => s + danger(q), 0) || 1;
    const score = q => swings(q) === 1 ? -10 - danger(q) / total : swings(q) - 1.5 * danger(q) / total;
    return opps.slice().sort((x, y) => score(x) - score(y))[0];
  }
  function lageTarget(g, p, a, targets) { return lageFocus(g, p, a, targets); }
  function lageAttackFocus(g, p, ml) { return lageFocus(g, p, ml, null); }

  /* ================================================================ commander */
  D({
    name: "Azusa, Lost but Seeking", cost: "{2}{G}", type: "Legendary Creature — Human Monk", pt: "1/2",
    text: "You may play two additional lands on each of your turns.",
    statics: [{ extraLands: 2 }],
    ai: { priority: 9, plan: brain }
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
    // tapped basics go first, never Dark Depths or Thespian's Stage while another land is left
    ai: { priority: 3, target: (g, p, req) => sacPick(g, p, req) }
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
    triggers: [{
      on: "drawStep", when: (g, s, ev) => ev.p === s.controller,
      optional: "Sylvan Library: draw two additional cards?", ai: "sylvanDraw",
      do: async (g, s, ev, { p }) => {
        if (!g.draw(p, 2)) return;
        const drawn = (p.drawnThisTurn || []).filter(c => c.zone === "hand" && p.hand.includes(c));
        let two = drawn;
        if (drawn.length > 2) {
          const pick = await g.ask(p, { type: "cards", prompt: "Sylvan Library: choose two cards you drew this turn (for each, pay 4 life or put it back on top)", options: drawn, min: 2, max: 2, purpose: "sylvanChoose", src: s });
          two = (pick || []).filter(c => drawn.includes(c)).slice(0, 2);
          if (two.length < 2) two = drawn.slice(-2);
        }
        const back = [];
        for (const c of two) {
          const pay = p.life >= 4 && await g.ask(p, { type: "confirm", prompt: `Sylvan Library: pay 4 life to keep ${c.def.name}? (No puts it back on top of your library)`, purpose: "sylvanPay", src: s, card: c });
          if (pay && g.payLife(p, 4)) g.log(`${p.name} pays 4 life to keep a card (Sylvan Library).`, { p, cards: ["Sylvan Library"], kind: "life" });
          else back.push(c);
        }
        for (const c of back) { g.removeFromZone(c); c.zone = "library"; p.library.unshift(c); }
        if (back.length) g.log(`${p.name} puts ${back.length} card${back.length > 1 ? "s" : ""} back on top (Sylvan Library).`, { p, cards: ["Sylvan Library"] });
        g.bump();
      }
    }],
    ai: {
      priority: 7, draw: true,
      // deal with the two least useful cards drawn, and pay 4 life only for a strong card while life is high
      cards: (g, p, req) => (req.purpose === "sylvanChoose" ? req.options.slice().sort((a, b) => sylvanWorth(g, p, a) - sylvanWorth(g, p, b)).slice(0, 2) : null),
      confirm: (g, p, req) => {
        if (req.purpose === "sylvanDraw") return p.library.length >= 4;
        if (req.purpose !== "sylvanPay") return true;
        if (p.life < 24 || sylvanWorth(g, p, req.card) < 8 || p.sylvanPaid === g.turn) return false;
        p.sylvanPaid = g.turn;
        return true;
      }
    }
  });
  /* How much a card drawn off Sylvan Library is worth keeping: spells over spare lands, tutors and
     big threats most. */
  function sylvanWorth(g, p, c) {
    const d = c.def, ai = d.ai || {};
    // the missing half of Dark Depths + Thespian's Stage is worth the most
    if ((d.name === DEPTHS || d.name === STAGE) && !has(g, p, "Marit Lage") && !has(g, p, d.name)) return 20;
    if (d.types.includes("Land")) return g.controlled(p, o => g.isLand(o)).length >= 6 ? 0 : 5;
    return 3 + Math.min(5, d.mv) + (ai.tutor ? 4 : 0) + (ai.finisher ? 4 : 0) + (ai.wipe ? 2 : 0);
  }
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
    ai: { never: true, cards: pickLands, target: sacPick }
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
      // keep {G} open for it while Marit Lage is out
      keepUp: (g, p) => (lageOf(g, p) ? 1 : 0),
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
    }]
  });
  const STAGE_AB = {
    label: "Become a copy of target land", cost: "{2}", tap: true, stage: true,
    targets: [{ kind: "land", purpose: "stage", prompt: "Thespian's Stage becomes a copy of", filter: (g, t, p, src) => t !== src }],
    do: (g, s, ctx) => {
      const t = ctx.targets[0];
      if (!t || !ctx.legal[0] || s.zone !== "battlefield") return;
      const base = MK.copiable(t);
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
    ai: { target: (g, p, req) => req.purpose === "stage" ? req.options.find(o => o.def.name === DEPTHS && o.controller === p) || req.options.find(o => o.def.name === DEPTHS) || null : undefined }
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
