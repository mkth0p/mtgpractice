/* The Miku deck as it comes out of the box, and the 80€ upgrade: the cards the full upgrade cut
   (Congregate, Pest Infestation, Crested Sunmare...), and the two decks a player can pick on the
   Play tab besides the full upgrade (`MK.MIKU_DECK` in cards-miku.js).
   - "miku-precon": Secret Lair Commander Deck: Hatsune Miku, card for card.
   - "miku-budget": the precon plus the 22 swaps of the budget plan (buy-list-cardmarket-v2), the
     one bought for about 80€: Heliod + Walking Ballista, Avenger of Zendikar, True Conviction.
   Card text follows the printed Oracle text; `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });

  T.mikuSpider = MK.tokenDef({ key: "spider-g12-reach", name: "Spider", pt: [1, 2], colors: "G", subtypes: ["Spider"], keywords: ["reach"] });
  T.mikuHorse = MK.tokenDef({ key: "horse-w5", name: "Horse", pt: [5, 5], colors: "W", subtypes: ["Horse"] });
  T.mikuElfWarrior = MK.tokenDef({ key: "elf-warrior-gw", name: "Elf Warrior", pt: [1, 1], colors: "GW", subtypes: ["Elf", "Warrior"] });
  T.mikuPest = MK.tokenDef({
    key: "pest-bg-gain", name: "Pest", pt: [1, 1], colors: "BG", subtypes: ["Pest"], text: "When this token dies, you gain 1 life.",
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }]
  });
  const minion = x => MK.tokenDef({ key: "phyrexian-minion-" + x, name: "Phyrexian Minion", pt: [x, x], colors: "B", subtypes: ["Phyrexian", "Minion"] });

  /* ================================================================ creatures */
  D({
    name: "Arasta of the Endless Web", cost: "{2}{G}{G}", type: "Legendary Enchantment Creature — Spider", pt: "3/5",
    keywords: ["reach"],
    text: "Reach\nWhenever an opponent casts an instant or sorcery spell, create a 1/2 green Spider creature token with reach.",
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p !== s.controller && (ev.o.def.types.includes("Instant") || ev.o.def.types.includes("Sorcery")),
      do: (g, s, ev, { p }) => g.createToken(p, T.mikuSpider)
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Suture Priest", cost: "{1}{W}", type: "Creature — Phyrexian Cleric", pt: "1/1",
    text: "Whenever another creature you control enters, you may gain 1 life.\nWhenever a creature an opponent controls enters, you may have that player lose 1 life.",
    triggers: [
      { on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o), do: (g, s, ev, { p }) => g.gainLife(p, 1, s) },
      { on: "enters", when: (g, s, ev) => ev.o.controller !== s.controller && g.isCreature(ev.o), do: (g, s, ev) => { if (!ev.o.controller.lost) g.loseLife(ev.o.controller, 1, s); } }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Gruff Triplets", cost: "{3}{G}{G}{G}", type: "Creature — Satyr Warrior", pt: "3/3",
    keywords: ["trample"],
    text: "Trample\nWhen Gruff Triplets enters, if it isn't a token, create two tokens that are copies of it.\nWhen Gruff Triplets dies, put a number of +1/+1 counters equal to its power on each creature you control named Gruff Triplets.",
    triggers: [
      { on: "enters", self: true, intervening: (g, s) => !s.isToken, do: (g, s, ev, { p }) => g.copyToken(p, s, { count: 2 }) },
      {
        on: "dies", self: true,
        do: (g, s, ev, { p }) => {
          const n = Math.max(0, (ev.lki && ev.lki.power) || 0);
          for (const o of g.controlled(p, c => c.def.name === "Gruff Triplets")) g.addCounters(o, "p1", n, s);
        }
      }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Silverquill Lecturer", cost: "{4}{W}", type: "Creature — Kor Wizard", pt: "3/3",
    text: "Creature spells you cast have demonstrate. (Whenever you cast a creature spell, you may copy it. If you do, choose an opponent to also copy it. Each copy becomes a token.)",
    note: "The two token copies enter when you cast the spell, before the creature itself.",
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !ev.item.faceDown && !ev.item.isCopy && ev.o.def.types.includes("Creature"),
      optional: "Demonstrate: make a token copy of this creature? An opponent you choose gets one too.",
      ai: "demonstrate",
      do: async (g, s, ev, { p }) => {
        g.copyToken(p, ev.o);
        const q = await g.ask(p, { type: "player", prompt: "Choose an opponent to also get a copy", options: g.opponents(p), src: s, purpose: "demonstrateOpponent" });
        if (q && !q.lost) g.copyToken(q, ev.o);
      }
    }],
    ai: { priority: 4 }
  });
  D({
    name: "Angel of Indemnity", cost: "{5}{W}", type: "Creature — Angel Warrior", pt: "5/5",
    keywords: ["flying", "lifelink", "encore"],
    text: "Flying, lifelink\nWhen Angel of Indemnity enters, return target permanent card with mana value 4 or less from your graveyard to the battlefield.\nEncore {6}{W}{W} ({6}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", purpose: "reanimate", prompt: "Return a permanent card with mana value 4 or less", from: (g2, pl) => pl.graveyard.filter(c => !c.def.types.includes("Instant") && !c.def.types.includes("Sorcery") && c.def.mv <= 4) }), s);
        if (t && t.zone === "graveyard") g.putOntoBattlefield([t], p);
      }
    }],
    gyAbilities: [{
      label: "Encore", cost: "{6}{W}{W}", timing: "sorcery", exileSelf: true,
      do: (g, s, ctx) => {
        for (const q of g.opponents(ctx.p)) { const [tok] = g.copyToken(ctx.p, s, { haste: true, sacEnd: true }); if (tok) tok.state.mustAttack = q; }
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Rhys the Redeemed", cost: "{G/W}", type: "Legendary Creature — Elf Warrior", pt: "1/1",
    text: "{2}{G/W}, {T}: Create a 1/1 green and white Elf Warrior creature token.\n{4}{G/W}{G/W}, {T}: For each creature token you control, create a token that's a copy of that creature.",
    abilities: [
      { label: "Create a 1/1 Elf Warrior", cost: "{2}{G/W}", tap: true, do: (g, s, ctx) => g.createToken(ctx.p, T.mikuElfWarrior), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && g.controlled(p, c => c.isToken && g.isCreature(c)).length < 3 } },
      {
        label: "Copy each creature token", cost: "{4}{G/W}{G/W}", tap: true,
        do: (g, s, ctx) => { for (const t of g.controlled(ctx.p, c => c.isToken && g.isCreature(c))) g.copyToken(ctx.p, t); },
        ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && g.controlled(p, c => c.isToken && g.isCreature(c)).length >= 3 }
      }
    ],
    ai: { priority: 5 }
  });
  D({
    name: "Crested Sunmare", cost: "{3}{W}{W}", type: "Creature — Horse", pt: "5/5",
    text: "Other Horses you control have indestructible.\nAt the beginning of each end step, if you gained life this turn, create a 5/5 white Horse creature token.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.hasSub(o, "Horse"), kw: ["indestructible"] }],
    triggers: [{ on: "endStep", intervening: (g, s) => s.controller.gained > 0, do: (g, s, ev, { p }) => g.createToken(p, T.mikuHorse) }],
    ai: { priority: 7 }
  });

  /* ================================================================ artifacts */
  D({
    name: "Ancient Cornucopia", cost: "{2}{G}", type: "Artifact",
    text: "Whenever you cast a spell that's one or more colors, you may gain 1 life for each of that spell's colors. Do this only once each turn.\n{T}: Add one mana of any color.",
    mana: [{ tap: true, produce: "any" }],
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !ev.item.faceDown && (ev.o.def.colors || []).length > 0 && s.state.cornu !== g.turn,
      do: (g, s, ev, { p }) => { s.state.cornu = g.turn; g.gainLife(p, ev.o.def.colors.length, s); }
    }],
    ai: { ramp: true, priority: 7 }
  });
  D({
    name: "Phyrexian Processor", cost: "{4}", type: "Artifact",
    text: "As Phyrexian Processor enters, pay any amount of life.\n{4}, {T}: Create an X/X black Phyrexian Minion creature token, where X is the life paid as Phyrexian Processor entered.",
    asEnters: async (g, p, o) => {
      const max = Math.max(0, p.life - 1);
      const n = max ? Math.max(0, Math.min(max, (await g.ask(p, { type: "number", prompt: "Phyrexian Processor: pay how much life?", min: 0, max, purpose: "x", src: o })) | 0)) : 0;
      if (n && g.payLife(p, n)) { o._processorLife = n; log(g, `${p.name} pays ${n} life for Phyrexian Processor.`, p, ["Phyrexian Processor"]); }
    },
    etbState: (g, o) => { const n = o._processorLife || 0; o._processorLife = 0; return { paid: n }; },
    abilities: [{
      label: "Create an X/X Minion", cost: "{4}", tap: true,
      condition: (g, o) => (o.state.paid || 0) > 0,
      do: (g, s, ctx) => g.createToken(ctx.p, minion(s.state.paid || 0)),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p || ctx.window === "main2" }
    }],
    ai: { priority: 5, x: (g, p) => Math.max(0, Math.min(8, p.life - 18)) }
  });

  /* ================================================================ enchantments */
  D({
    name: "Boon Reflection", cost: "{4}{W}", type: "Enchantment",
    text: "If you would gain life, you gain twice that much life instead.",
    statics: [{ lifeGainTimes: 2 }],
    ai: { priority: 5 }
  });
  D({
    name: "Angelic Chorus", cost: "{3}{W}{W}", type: "Enchantment",
    text: "Whenever a creature you control enters, you gain life equal to its toughness.",
    triggers: [{ on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o), do: (g, s, ev, { p }) => { if (ev.o.zone === "battlefield") g.gainLife(p, Math.max(0, g.toughness(ev.o)), s); } }],
    ai: { priority: 5 }
  });
  D({
    name: "Mirari's Wake", cost: "{3}{G}{W}", type: "Enchantment",
    text: "Creatures you control get +1/+1.\nWhenever you tap a land for mana, add one mana of any type that land produced.",
    note: "Your lands make twice their mana, as with Vorinclex.",
    doublesLandMana: true,
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), pt: [1, 1] }],
    ai: { priority: 7 }
  });
  D({
    name: "Song of Freyalise", cost: "{1}{G}", type: "Enchantment — Saga",
    text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI, II — Until your next turn, creatures you control gain \"{T}: Add one mana of any color.\"\nIII — Put a +1/+1 counter on each creature you control. Those creatures gain vigilance, trample, and indestructible until end of turn.",
    note: "Your creatures can tap for mana while the Saga has one or two lore counters.",
    saga: [
      () => {}, () => {},
      (g, s, p) => { const list = g.creatures(p); for (const o of list) g.addCounters(o, "p1", 1, s); g.grant(list, ["vigilance", "trample", "indestructible"]); }
    ],
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && (s.counters.lore || 0) <= 2, grantMana: [{ tap: true, produce: "any" }] }],
    ai: { priority: 6, ramp: true }
  });

  /* ================================================================ sorceries */
  D({
    name: "Invincible Hymn", cost: "{6}{W}{W}", type: "Sorcery",
    text: "Count the number of cards in your library. Your life total becomes that number.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p, n = p.library.length, d = n - p.life;
        if (d > 0) g.gainLife(p, d, ctx.o); else if (d < 0) g.loseLife(p, -d, ctx.o);
      }
    },
    ai: { cast: (g, p) => (p.library.length >= p.life + 15 ? 12 : false) }
  });
  D({
    name: "Healing Technique", cost: "{3}{G}", type: "Sorcery",
    keywords: ["demonstrate"],
    text: "Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may choose new targets for their copies.)\nReturn target card from your graveyard to your hand. You gain life equal to that card's mana value. Exile Healing Technique.",
    spell: {
      targets: [{ kind: "card", purpose: "reanimate", prompt: "Return to your hand", from: (g, pl) => pl.graveyard }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "graveyard" || t.owner !== ctx.p) return;
        g.moveTo(t, "hand");
        g.gainLife(ctx.p, t.def.mv, ctx.o);
      }
    },
    onCast: async (g, p, o, item) => {
      if (item.isCopy) return;
      item.exileAfter = true;
      const ok = await g.ask(p, { type: "confirm", prompt: "Demonstrate: copy Healing Technique? An opponent you choose gets a copy too.", src: o, purpose: "demonstrate" });
      if (!ok) return;
      await g.copySpell(item, p);
      const q = await g.ask(p, { type: "player", prompt: "Choose an opponent to also copy it", options: g.opponents(p), src: o, purpose: "demonstrateOpponent" });
      if (q) await g.copySpell(item, q);
    },
    ai: { priority: 4, hold: (g, p) => !p.graveyard.some(c => c.def.mv >= 3 && !c.def.types.includes("Land")) }
  });
  D({
    name: "Pest Infestation", cost: "{X}{X}{G}", type: "Sorcery",
    text: "Destroy up to X target artifacts and/or enchantments. Create twice X 1/1 black and green Pest creature tokens with \"When this token dies, you gain 1 life.\"",
    note: "The artifacts and enchantments are chosen as it resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.x || 0;
        const cands = g.battlefield.filter(o => (g.isArtifact(o) || g.isEnchantment(o)) && (o.controller === p || g.canTarget(p, o)) && o.controller !== p);
        if (x && cands.length) {
          const pick = await g.ask(p, { type: "cards", prompt: `Destroy up to ${x} artifacts and/or enchantments`, options: cands, min: 0, max: Math.min(x, cands.length), purpose: "destroyUpTo", src: ctx.o });
          g.destroyAll((pick || []).filter(o => cands.includes(o)).slice(0, x), ctx.o);
        }
        if (x) g.createToken(p, T.mikuPest, { count: 2 * x });
      }
    },
    ai: { priority: 6, x: (g, p, o, xMax) => xMax, hold: (g, p) => g.maxX(p, MK.parseCost("{G}"), 2) < 2 }
  });

  /* ================================================================ lands */
  D({
    name: "Temple of Plenty", type: "Land",
    text: "Temple of Plenty enters tapped.\nWhen Temple of Plenty enters, scry 1. (Look at the top card of your library. You may put that card on the bottom.)\n{T}: Add {G} or {W}.",
    etbTapped: true,
    mana: [{ tap: true, produce: ["G", "W"] }],
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.scry(p, 1, s) }]
  });

  /* ================================================================ the decks */
  const FULL = MK.MIKU_DECK;
  // full upgrade -> precon: each upgrade and the card it replaced (cards.js "new" / "cut")
  const SWAPS = [
    ["Adeline, Resplendent Cathar", "Arasta of the Endless Web"], ["Arcane Signet", "Ancient Cornucopia"], ["Beast Within", "Healing Technique"],
    ["Beastmaster Ascension", "Invincible Hymn"], ["Brushland", "Radiant Fountain"], ["Cathars' Crusade", "Storm Herd"],
    ["Crashing Drawbridge", "Silverquill Lecturer"], ["Craterhoof Behemoth", "Idol of Oblivion"], ["Elspeth, Sun's Champion", "Gruff Triplets"],
    ["Elvish Mystic", "Explore"], ["Esika's Chariot", "Song of Freyalise"], ["Generous Gift", "Rhys the Redeemed"],
    ["Heliod, Sun-Crowned", "Pest Infestation"], ["Hero of Bladehold", "Growing Ranks"], ["Intangible Virtue", "Boon Reflection"],
    ["Jazal Goldmane", "Mirari's Wake"], ["Mirror Entity", "Angelic Chorus"], ["Overwhelming Stampede", "Congregate"],
    ["Razorverge Thicket", "Temple of Plenty"], ["Return of the Wildspeaker", "Angel of Indemnity"], ["Scattered Groves", "Sapseep Forest"],
    ["Spike Feeder", "Suture Priest"], ["Triumph of the Hordes", "Crested Sunmare"], ["Walking Ballista", "Phyrexian Processor"]
  ];
  const basics = (list, plains, forest) => list.filter(n => n !== "Plains" && n !== "Forest").concat(Array(plains).fill("Plains"), Array(forest).fill("Forest"));
  const back = new Map(SWAPS);
  // the box: every upgrade goes back to the card it replaced, Seraph Sanctuary comes back, 7 Plains and 7 Forest
  const PRECON = basics(FULL.list.map(n => back.get(n) || n), 7, 7).concat(["Seraph Sanctuary"]);
  // the 80€ plan (buy-list-cardmarket-v2): 22 swaps from the box, 9 Plains and 6 Forest
  const BUDGET_SWAPS = [
    ["Congregate", "Overwhelming Stampede"], ["Invincible Hymn", "Beastmaster Ascension"], ["Boon Reflection", "Intangible Virtue"],
    ["Healing Technique", "Beast Within"], ["Arasta of the Endless Web", "Adeline, Resplendent Cathar"], ["Suture Priest", "Spike Feeder"],
    ["Mirari's Wake", "Avenger of Zendikar"], ["Gruff Triplets", "Elspeth, Sun's Champion"], ["Song of Freyalise", "Esika's Chariot"],
    ["Ancient Cornucopia", "Arcane Signet"], ["Explore", "Elvish Mystic"], ["Silverquill Lecturer", "True Conviction"],
    ["Angel of Indemnity", "Return of the Wildspeaker"], ["Rhys the Redeemed", "Generous Gift"], ["Temple of Plenty", "Razorverge Thicket"],
    ["Pest Infestation", "Heliod, Sun-Crowned"], ["Phyrexian Processor", "Walking Ballista"], ["Storm Herd", "Cathars' Crusade"],
    ["Growing Ranks", "Hero of Bladehold"], ["Crested Sunmare", "Triumph of the Hordes"], ["Radiant Fountain", "Brushland"], ["Sapseep Forest", "Scattered Groves"]
  ];
  const fwd = new Map(BUDGET_SWAPS);
  const BUDGET = basics(PRECON.filter(n => n !== "Seraph Sanctuary").map(n => fwd.get(n) || n), 9, 6);

  const base = { name: "Miku", title: "Trostani, Selesnya's Voice", commander: "Trostani, Selesnya's Voice", identity: ["G", "W"], hero: "miku" };
  MK.MIKU_PRECON_DECK = Object.assign({}, base, {
    id: "miku-precon", variant: "precon", label: "Precon", bracket: 2,
    blurb: "The deck as it comes in the box: lifegain, tokens and populate, with Archangel of Thune and Finale of Devastation as the best cards.",
    list: PRECON
  });
  MK.MIKU_BUDGET_DECK = Object.assign({}, base, {
    id: "miku-budget", variant: "budget", label: "80€ upgrade", bracket: 3,
    blurb: "The precon plus the 22 swaps of the 80€ plan: Heliod and Walking Ballista, Avenger of Zendikar, True Conviction and Cathars' Crusade.",
    list: BUDGET
  });
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.MIKU_PRECON_DECK, MK.MIKU_BUDGET_DECK);
})(typeof window !== "undefined" ? window : globalThis);
