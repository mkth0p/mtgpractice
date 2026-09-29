/* The Miku deck (Trostani, Selesnya's Voice) for the game engine: every card in the list, plus a few that were cut.
   Card text follows the printed Oracle text. Where the engine simplifies a card, the comment on
   that card says how. `ai` hints tell the bots when to cast or use a card; see ENGINE.md. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const D = MK.define, T = MK.T;
  const AI = () => MK.AI || {};

  /* ---------- small helpers shared by several cards */
  const mine = (s, o) => o.controller === s.controller;
  const myCreature = (g, s, o) => mine(s, o) && g.isCreature(o);
  const gainedByMe = (g, s, ev) => ev.p === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const opponentsOf = (g, p) => g.opponents(p);
  const greatestPower = (g, list) => list.reduce((m, o) => Math.max(m, g.power(o)), 0);
  const attackingMine = (g, p) => g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield") : [];
  const hasLand = (g, p, sub) => g.controlled(p, o => g.isLand(o) && o.def.subtypes.includes(sub)).length > 0;
  const otherLands = (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x)).length;
  const gw = ["G", "W"];

  /* Tokens this deck makes that aren't in the engine's common set. */
  T.junk = MK.tokenDef({
    key: "junk", name: "Junk", types: ["Artifact"], subtypes: ["Junk"], colors: [],
    abilities: [{
      label: "Exile the top card, play it this turn", tap: true, sacSelf: true, timing: "sorcery",
      do: (g, s, ctx) => g.impulse(ctx.p, 1),
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.landDrops(p) > p.landsPlayed }
    }]
  });
  T.voiceElemental = MK.tokenDef({
    key: "voice-elemental", name: "Elemental", pt: [0, 0], colors: "GW", subtypes: ["Elemental"],
    text: "Power and toughness are each equal to the number of creatures you control.",
    cda: (g, o) => { const n = g.creatures(o.controller).length; return [n, n]; }
  });
  T.groveElemental = MK.tokenDef({ key: "grove-elemental", name: "Elemental", pt: [8, 8], colors: "GW", subtypes: ["Elemental"], keywords: ["vigilance"] });
  T.dinosaur = x => MK.tokenDef({ key: "dino-" + x, name: "Dinosaur", pt: [x, x], colors: "G", subtypes: ["Dinosaur"], keywords: ["trample"] });

  /* ================================================================ commander */
  D({
    name: "Trostani, Selesnya's Voice", cost: "{G}{G}{W}{W}", type: "Legendary Creature — Dryad", pt: "2/5",
    // late: her triggers wait for Soul Warden, Cathars' Crusade, Thune and the like, so each
    // token is as big as it gets before she checks its toughness (the order a player would pick)
    triggers: [{
      on: "enters", late: true, checksToughness: true,
      when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o) && (ev.t0 == null ? ((ev.t0 = g.toughness(ev.o)), true) : true),
      do: (g, s, ev, { p }) => g.gainLife(p, Math.max(0, ev.o.zone === "battlefield" ? g.toughness(ev.o) : ev.t0), s)
    }],
    abilities: [{
      label: "Populate", cost: "{1}{G}{W}", tap: true,
      condition: (g, o, p) => g.controlled(p, x => x.isToken && g.isCreature(x)).length > 0,
      do: (g, s, ctx) => g.populate(ctx.p, s),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" || ctx.window === "main2" }
    }],
    ai: { priority: 8 }
  });

  /* ================================================================ creatures */
  D({
    name: "Adeline, Resplendent Cathar", cost: "{1}{W}{W}", type: "Legendary Creature — Human Knight", pt: "*/4",
    keywords: ["vigilance"],
    cda: (g, o) => [g.creatures(o.controller).length, null],
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => { for (const q of opponentsOf(g, p)) g.createToken(p, T.human, { tapped: true, attacking: q }); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Ajani's Pridemate", cost: "{1}{W}", type: "Creature — Cat Soldier", pt: "2/2",
    triggers: [{ on: "gainLife", when: gainedByMe, do: (g, s) => g.addCounters(s, "p1", 1, s) }]
  });

  D({
    name: "Archangel of Thune", cost: "{3}{W}{W}", type: "Creature — Angel", pt: "3/4",
    keywords: ["flying", "lifelink"],
    triggers: [{ on: "gainLife", when: gainedByMe, do: (g, s, ev, { p }) => g.counterEach(p, "p1", 1, s) }],
    ai: { priority: 7 }
  });

  D({ name: "Avacyn's Pilgrim", cost: "{G}", type: "Creature — Human Monk", pt: "1/1", mana: [{ tap: true, produce: "W" }], ai: { ramp: true } });
  D({ name: "Elvish Mystic", cost: "{G}", type: "Creature — Elf Druid", pt: "1/1", mana: [{ tap: true, produce: "G" }], ai: { ramp: true } });
  D({ name: "Llanowar Elves", cost: "{G}", type: "Creature — Elf Druid", pt: "1/1", mana: [{ tap: true, produce: "G" }], ai: { ramp: true } });

  D({
    name: "Blossoming Bogbeast", cost: "{4}{G}", type: "Creature — Beast", pt: "3/3",
    triggers: [{
      on: "attacks", self: true, late: true,
      do: (g, s, ev, { p }) => {
        g.gainLife(p, 2, s);
        const x = p.gained;
        g.addEffect({ objs: g.creatures(p), pt: [x, x], kw: ["trample"] });
        g.log(`Creatures ${p.name} controls get +${x}/+${x} and trample.`, { p, cards: [s.def.name] });
      }
    }]
  });

  D({
    name: "Bramble Sovereign", cost: "{2}{G}{G}", type: "Creature — Dryad", pt: "4/4",
    text: "Whenever another nontoken creature enters, you may pay {1}{G}. If you do, that creature's controller creates a token that's a copy of that creature.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && !ev.o.isToken && g.isCreature(ev.o),
      do: async (g, s, ev, { p }) => {
        const cost = MK.parseCost("{1}{G}");
        if (!g.canPay(p, cost)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: `Pay {1}{G} to copy ${ev.o.def.name} with Bramble Sovereign?`, src: s, purpose: "brambleCopy", target: ev.o });
        if (!ok || !g.pay(p, cost)) return;
        g.copyToken(ev.o.zone === "battlefield" ? ev.o.controller : ev.o.owner, ev.o);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Conclave Evangelist", cost: "{3}{G/W}{G/W}", type: "Creature — Elephant Cleric", pt: "4/4",
    keywords: ["myriad"],
    triggers: [
      {
        on: "attacks", self: true,
        do: (g, s, ev, { p }) => {
          const defending = g.defenderOf(ev.target);
          for (const q of opponentsOf(g, p)) if (q !== defending) g.copyToken(p, s, { tapped: true, attacking: q, exileEoc: true });
        }
      },
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.copyToken(p, s) }
    ]
  });

  D({
    name: "Crashing Drawbridge", cost: "{2}", type: "Artifact Creature — Wall", pt: "0/4",
    keywords: ["defender"],
    abilities: [{
      label: "Your creatures gain haste", tap: true,
      do: (g, s, ctx) => { g.grant(g.creatures(ctx.p), ["haste"]); g.log(`Creatures ${ctx.p.name} controls gain haste.`, { p: ctx.p }); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.creatures(p).filter(c => c.sick && !g.kw(c, "defender") && g.power(c) > 0).reduce((n, c) => n + g.power(c), 0) >= 3 }
    }]
  });

  D({
    name: "Craterhoof Behemoth", cost: "{5}{G}{G}{G}", type: "Creature — Beast", pt: "5/5",
    keywords: ["haste"],
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p); const x = list.length;
        g.addEffect({ objs: list, pt: [x, x], kw: ["trample"] });
        g.log(`Creatures ${p.name} controls get +${x}/+${x} and trample.`, { p, cards: [s.def.name], kind: "big" });
      }
    }],
    ai: { finisher: true, priority: 9 }
  });

  D({
    name: "Elenda's Hierophant", cost: "{2}{W}", type: "Creature — Vampire Cleric", pt: "1/1",
    keywords: ["flying"],
    triggers: [
      { on: "gainLife", when: gainedByMe, do: (g, s) => g.addCounters(s, "p1", 1, s) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.vampireLL, { count: Math.max(0, ev.lki.power) }) }
    ]
  });

  D({
    name: "Fanatic of Rhonas", cost: "{1}{G}", type: "Creature — Snake Druid", pt: "1/4",
    mana: [
      { tap: true, produce: "G" },
      { tap: true, produce: "GGGG", condition: (g, o) => g.creatures(o.controller).some(c => g.power(c) >= 4) }
    ],
    gyAbilities: [{
      label: "Eternalize", cost: "{2}{G}{G}", timing: "sorcery", exileSelf: true,
      do: (g, s, ctx) => g.copyToken(ctx.p, s, { except: { name: "Fanatic of Rhonas", pt: [4, 4], colors: ["B"], subtypes: ["Zombie", "Snake", "Druid"], cost: "" } }),
      ai: { use: (g, p, o, ctx) => ctx.window === "main2" }
    }],
    ai: { ramp: true }
  });

  D({
    name: "Ghalta and Mavren", cost: "{3}{G}{G}{W}{W}", type: "Legendary Creature — Dinosaur Vampire", pt: "12/12",
    keywords: ["trample"],
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller, late: true,
      do: async (g, s, ev, { p }) => {
        const others = attackingMine(g, p).filter(a => a !== s);
        const big = greatestPower(g, others);
        const opts = [
          { id: 0, label: `Dinosaur token ${big}/${big} with trample, attacking` },
          { id: 1, label: `${others.length} Vampire token${others.length === 1 ? "" : "s"} with lifelink` }
        ];
        const pick = await g.ask(p, { type: "option", prompt: "Ghalta and Mavren: choose one", options: opts, src: s, purpose: "ghaltaMode", big, count: others.length });
        if (pick === 0) {
          if (big <= 0) { g.log("No other attacking creature has power, so the Dinosaur would be 0/0.", { p }); return; }
          const tgt = s.combat && s.combat.attacking ? s.combat.attacking : (others[0] && others[0].combat ? others[0].combat.attacking : opponentsOf(g, p)[0]);
          g.createToken(p, T.dinosaur(big), { tapped: true, attacking: g.isPlayer(tgt) || !tgt ? tgt : tgt });
        } else g.createToken(p, T.vampireLL, { count: others.length });
      }
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Hero of Bladehold", cost: "{2}{W}{W}", type: "Creature — Human Knight", pt: "3/4",
    keywords: ["battle cry"],
    triggers: [
      {
        on: "attacks", self: true,
        do: (g, s, ev, { p }) => g.createToken(p, T.soldier, { count: 2, tapped: true, attacking: ev.target })
      },
      {
        on: "attacks", self: true, late: true,
        do: (g, s, ev, { p }) => {
          const others = attackingMine(g, p).filter(a => a !== s);
          if (others.length) { g.addEffect({ objs: others, pt: [1, 0] }); g.log(`Battle cry: the other attackers get +1/+0.`, { p, cards: [s.def.name] }); }
        }
      }
    ],
    ai: { priority: 8 }
  });

  D({
    name: "Jazal Goldmane", cost: "{2}{W}{W}", type: "Legendary Creature — Cat Warrior", pt: "4/4",
    keywords: ["first strike"],
    abilities: [{
      label: "Attackers get +X/+X", cost: "{3}{W}{W}",
      condition: (g, o, p) => attackingMine(g, p).length > 0,
      do: (g, s, ctx) => {
        const list = attackingMine(g, ctx.p); const x = list.length;
        g.addEffect({ objs: list, pt: [x, x] });
        g.log(`Attacking creatures get +${x}/+${x}.`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && g.combat && g.combat.attacker === p && attackingMine(g, p).length >= 3 }
    }]
  });

  D({
    name: "Lathiel, the Bounteous Dawn", cost: "{2}{G}{W}", type: "Legendary Creature — Unicorn", pt: "2/2",
    keywords: ["lifelink"],
    text: "Lifelink\nAt the beginning of each end step, if you gained life this turn, distribute up to that many +1/+1 counters among any number of other target creatures.",
    triggers: [{
      on: "endStep", intervening: (g, s) => s.controller.gained > 0,
      do: async (g, s, ev, { p }) => {
        const options = g.creatures(p).filter(c => c !== s);
        if (!options.length) return;
        await g.distribute(p, p.gained, options, s, `Lathiel: put up to ${p.gained} +1/+1 counter${p.gained === 1 ? "" : "s"} on your other creatures`);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Mirror Entity", cost: "{2}{W}", type: "Creature — Shapeshifter", pt: "1/1",
    changeling: true, keywords: ["changeling"],
    abilities: [{
      label: "Creatures become X/X", cost: "{X}", minX: 1,
      do: (g, s, ctx) => {
        g.addEffect({ objs: g.creatures(ctx.p), setPT: [ctx.x, ctx.x], allTypes: true });
        g.log(`Creatures ${ctx.p.name} controls have base power and toughness ${ctx.x}/${ctx.x}.`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (ctx.window !== "combat" || !g.combat || g.combat.attacker !== p) return false;
          const att = attackingMine(g, p);
          if (att.length < 3) return false;
          const x = g.maxX(p, MK.parseCost(""), 1);
          const avg = att.reduce((n, a) => n + g.power(a), 0) / att.length;
          return x >= 3 && x > avg + 1 ? { x } : false;
        }
      }
    }]
  });

  D({
    name: "Nykthos Paragon", cost: "{4}{W}{W}", type: "Enchantment Creature — Human Soldier", pt: "4/6",
    triggers: [{
      on: "gainLife", when: gainedByMe, intervening: (g, s) => s.state.paragonTurn !== g.turn,
      do: async (g, s, ev, { p }) => {
        const n = ev.amount;
        const ok = await g.ask(p, { type: "confirm", prompt: `Nykthos Paragon: put ${n} +1/+1 counter${n === 1 ? "" : "s"} on each creature you control? (once each turn)`, src: s, purpose: "paragon", amount: n });
        if (!ok) return;
        s.state.paragonTurn = g.turn;
        g.counterEach(p, "p1", n, s);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Prosperous Innkeeper", cost: "{1}{G}", type: "Creature — Halfling Citizen", pt: "1/1",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.treasure) },
      { on: "enters", when: (g, s, ev) => ev.o !== s && myCreature(g, s, ev.o), do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }
    ],
    ai: { ramp: true }
  });

  D({
    name: "Resplendent Angel", cost: "{1}{W}{W}", type: "Creature — Angel", pt: "3/3",
    keywords: ["flying"],
    triggers: [{
      on: "endStep", intervening: (g, s) => s.controller.gained >= 5,
      do: (g, s, ev, { p }) => g.createToken(p, T.angelV)
    }],
    abilities: [{
      label: "+2/+2 and lifelink", cost: "{3}{W}{W}{W}",
      do: (g, s) => g.pump(s, 2, 2, ["lifelink"]),
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && !!o.combat }
    }]
  });

  D({
    name: "Shalai, Voice of Plenty", cost: "{3}{W}", type: "Legendary Creature — Angel", pt: "3/4",
    keywords: ["flying"],
    statics: [
      { applies: (g, s, o) => o !== s && mine(s, o) && (g.isCreature(o) || g.isPlaneswalker(o)), kw: ["hexproof"] },
      { playerHexproof: (g, s, pl) => pl === s.controller }
    ],
    abilities: [{
      label: "+1/+1 counter on each creature", cost: "{4}{G}{G}",
      do: (g, s, ctx) => g.counterEach(ctx.p, "p1", 1, s),
      ai: { use: (g, p, o, ctx) => (ctx.window === "end" && ctx.turnOf && ctx.turnOf !== p) || ctx.window === "main2" }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Soul of Eternity", cost: "{5}{W}{W}", type: "Creature — Avatar", pt: "*/*",
    keywords: ["encore"],
    text: "Soul of Eternity's power and toughness are each equal to your life total.\nEncore {7}{W}{W}",
    cda: (g, o) => [o.controller.life, o.controller.life],
    gyAbilities: [{
      label: "Encore", cost: "{7}{W}{W}", timing: "sorcery", exileSelf: true,
      do: (g, s, ctx) => {
        for (const q of opponentsOf(g, ctx.p)) {
          const [tok] = g.copyToken(ctx.p, s, { haste: true, sacEnd: true });
          if (tok) tok.state.mustAttack = q;
        }
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && p.life >= 20 }
    }]
  });

  D({ name: "Soul Warden", cost: "{W}", type: "Creature — Human Cleric", pt: "1/1",
    triggers: [{ on: "enters", when: (g, s, ev) => ev.o !== s && g.isCreature(ev.o), do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }] });

  D({
    name: "Speaker of the Heavens", cost: "{W}", type: "Creature — Human Cleric", pt: "1/1",
    keywords: ["vigilance", "lifelink"],
    abilities: [{
      label: "Create a 4/4 Angel", tap: true, timing: "sorcery",
      condition: (g, o, p) => p.life >= g.startingLife + 7,
      do: (g, s, ctx) => g.createToken(ctx.p, T.angel),
      ai: { use: () => true }
    }]
  });

  D({
    name: "Spike Feeder", cost: "{1}{G}{G}", type: "Creature — Spike", pt: "0/0",
    etbCounters: () => ({ p1: 2 }),
    abilities: [
      {
        label: "Move a +1/+1 counter", cost: "{2}", removeCounters: { kind: "p1", n: 1 },
        targets: [{ kind: "creature", purpose: "counter", prompt: "Put a +1/+1 counter on" }],
        do: (g, s, ctx) => { if (ctx.legal[0]) g.addCounters(ctx.targets[0], "p1", 1, s); }
      },
      {
        label: "Remove a counter: gain 2 life", removeCounters: { kind: "p1", n: 1 },
        do: (g, s, ctx) => g.gainLife(ctx.p, 2, s),
        ai: { use: (g, p, o) => AI().heliodLoop ? AI().heliodLoop(g, p, o) : false }
      }
    ]
  });

  D({
    name: "Voice of Resurgence", cost: "{G}{W}", type: "Creature — Elemental", pt: "2/2",
    triggers: [
      { on: "cast", when: (g, s, ev) => ev.p !== s.controller && g.active === s.controller, do: (g, s, ev, { p }) => g.createToken(p, T.voiceElemental) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.voiceElemental) }
    ]
  });

  D({
    name: "Voice of the Blessed", cost: "{W}{W}", type: "Creature — Spirit Cleric", pt: "2/2",
    triggers: [{ on: "gainLife", when: gainedByMe, do: (g, s) => g.addCounters(s, "p1", 1, s) }],
    statics: [
      { applies: (g, s, o) => o === s && (s.counters.p1 || 0) >= 4, kw: ["flying", "vigilance"] },
      { applies: (g, s, o) => o === s && (s.counters.p1 || 0) >= 10, kw: ["indestructible"] }
    ]
  });

  D({
    name: "Vorinclex, Voice of Hunger", cost: "{6}{G}{G}", type: "Legendary Creature — Phyrexian Praetor", pt: "7/6",
    keywords: ["trample"],
    doublesLandMana: true,
    triggers: [{ on: "tapForMana", when: (g, s, ev) => ev.p !== s.controller, do: (g, s, ev) => { if (ev.o.zone === "battlefield") ev.o.skipUntap = true; } }],
    ai: { priority: 8 }
  });

  D({
    name: "Walking Ballista", cost: "{X}{X}", type: "Artifact Creature — Construct", pt: "0/0",
    etbCounters: (g, o, opts) => ({ p1: (opts && opts.x) || 0 }),
    canCast: (g, p, o) => g.maxX(p, g.spellCost(p, o, { x: 0 }), 2) >= 1,
    minX: 1,
    abilities: [
      {
        label: "+1/+1 counter", cost: "{4}",
        do: (g, s) => g.addCounters(s, "p1", 1, s),
        ai: { use: (g, p, o, ctx) => (ctx.window === "end" && ctx.turnOf !== p) || (AI().ballistaGrow ? AI().ballistaGrow(g, p, o, ctx) : false) }
      },
      {
        label: "Deal 1 damage", removeCounters: { kind: "p1", n: 1 },
        targets: [{ kind: "any", purpose: "harm", prompt: "Walking Ballista deals 1 damage to" }],
        do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1, { kws: ctx.kws }); },
        ai: { use: (g, p, o, ctx) => AI().ballistaPing ? AI().ballistaPing(g, p, o, ctx) : false }
      }
    ],
    ai: { x: (g, p, o, xMax) => xMax, priority: 3 }
  });

  /* ================================================================ enchantment creature, planeswalker */
  D({
    name: "Heliod, Sun-Crowned", cost: "{2}{W}", type: "Legendary Enchantment Creature — God", pt: "5/5",
    keywords: ["indestructible"],
    notCreatureUnless: (g, o) => g.devotion(o.controller, "W") >= 5,
    triggers: [{
      on: "gainLife", when: gainedByMe,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creatureOrEnchantment", you: true, purpose: "counter", prompt: "Heliod: put a +1/+1 counter on" }), s);
        if (t) g.addCounters(t, "p1", 1, s);
      }
    }],
    abilities: [{
      label: "Give lifelink", cost: "{1}{W}",
      targets: [{ kind: "creature", other: true, purpose: "help", prompt: "Give lifelink to" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) { g.grant(ctx.targets[0], ["lifelink"]); g.log(`${ctx.targets[0].def.name} gains lifelink.`, { p: ctx.p, cards: [ctx.targets[0].def.name] }); } },
      ai: { use: (g, p, o, ctx) => AI().heliodLifelink ? AI().heliodLifelink(g, p, o, ctx) : false }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Elspeth, Sun's Champion", cost: "{4}{W}{W}", type: "Legendary Planeswalker — Elspeth", loyalty: 4,
    abilities: [
      { label: "+1: Three 1/1 Soldiers", loyalty: 1, do: (g, s, ctx) => g.createToken(ctx.p, T.soldier, { count: 3 }) },
      {
        label: "−3: Destroy creatures with power 4+", loyalty: -3,
        do: (g, s) => { const n = g.destroyAll(g.battlefield.filter(o => g.isCreature(o) && g.power(o) >= 4)); g.log(`${n} creature${n === 1 ? "" : "s"} destroyed.`, {}); },
        ai: { use: (g, p) => { const big = o => g.isCreature(o) && g.power(o) >= 4; const theirs = g.battlefield.filter(o => o.controller !== p && big(o)).length; const ours = g.controlled(p, big).length; return theirs >= ours + 2; } }
      },
      {
        label: "−7: Emblem, +2/+2 and flying", loyalty: -7,
        do: (g, s, ctx) => g.addEmblem(ctx.p, { name: "Elspeth emblem", text: "Creatures you control get +2/+2 and have flying.", statics: [{ applies: (g2, src, o) => o.controller === src.controller && g2.isCreature(o), pt: [2, 2], kw: ["flying"] }] }),
        ai: { use: () => true }
      }
    ],
    ai: { priority: 8 }
  });

  /* ================================================================ artifacts */
  D({
    name: "Aetherflux Reservoir", cost: "{4}", type: "Artifact",
    // 1 life for each spell cast before this one this turn (spellsCast already counts this one)
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { if (p.spellsCast > 1) g.gainLife(p, p.spellsCast - 1, s); } }],
    abilities: [{
      label: "Pay 50 life: 50 damage", payLife: 50,
      targets: [{ kind: "any", purpose: "harm", prompt: "Aetherflux Reservoir deals 50 damage to" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 50); },
      ai: { use: (g, p) => p.life >= 60 }
    }]
  });

  D({ name: "Arcane Signet", cost: "{2}", type: "Artifact", mana: [{ tap: true, produce: "any" }], ai: { ramp: true } });
  D({ name: "Sol Ring", cost: "{1}", type: "Artifact", mana: [{ tap: true, produce: "CC" }], ai: { ramp: true, priority: 10 } });
  D({ name: "Selesnya Signet", cost: "{2}", type: "Artifact", mana: [{ tap: true, cost: "{1}", produce: "GW" }], ai: { ramp: true } });
  D({ name: "Springleaf Drum", cost: "{1}", type: "Artifact", mana: [{ tap: true, tapCreature: 1, produce: "any5" }], ai: { ramp: true } });

  D({
    name: "Esika's Chariot", cost: "{3}{G}", type: "Legendary Artifact — Vehicle", pt: "4/4",
    crew: 4,
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.cat, { count: 2 }) },
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "token", you: true, purpose: "copy", prompt: "Esika's Chariot: copy a token you control", filter: (g2, o) => g2.isCreature(o) || o.def.name === "Treasure" }), s);
          if (t) g.copyToken(p, t);
        }
      }
    ],
    ai: { priority: 8 }
  });

  D({
    name: "Halo Fountain", cost: "{2}{W}", type: "Artifact",
    abilities: [
      {
        label: "Make a Citizen", cost: "{W}", tap: true, untapCreatures: 1,
        do: (g, s, ctx) => g.createToken(ctx.p, T.citizen),
        ai: { use: (g, p, o, ctx) => ctx.window === "main2" || ctx.window === "combat" }
      },
      {
        label: "Draw a card", cost: "{W}{W}", tap: true, untapCreatures: 2,
        do: (g, s, ctx) => g.draw(ctx.p, 1),
        ai: { use: (g, p, o, ctx) => ctx.window === "main2" && g.creatures(p).filter(c => c.tapped).length >= 2 && !g.canActivate(p, o, g.findAbility(o, 0)) }
      },
      {
        label: "Win the game", cost: "{W}{W}{W}{W}{W}", tap: true, untapCreatures: 15,
        do: (g, s, ctx) => g.win(ctx.p, "Halo Fountain"),
        ai: { use: () => true, first: true }
      }
    ],
    ai: { priority: 5 }
  });

  D({
    name: "Skullclamp", cost: "{1}", type: "Artifact — Equipment",
    equip: "{1}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, -1] }],
    triggers: [{
      on: "dies", when: (g, s, ev) => ev.lki && ev.lki.attached && ev.lki.attached.includes(s) && s.zone === "battlefield",
      do: (g, s, ev, { p }) => g.draw(p, 2)
    }],
    ai: { priority: 6 }
  });

  /* ================================================================ enchantments */
  D({
    name: "Beastmaster Ascension", cost: "{2}{G}", type: "Enchantment",
    triggers: [{ on: "attacks", when: (g, s, ev) => mine(s, ev.o), do: (g, s) => g.addCounters(s, "quest", 1, s) }],
    statics: [{ applies: (g, s, o) => myCreature(g, s, o) && (s.counters.quest || 0) >= 7, pt: [5, 5] }],
    ai: { priority: 6 }
  });

  D({
    name: "Cathars' Crusade", cost: "{3}{W}{W}", type: "Enchantment",
    triggers: [{ on: "enters", when: (g, s, ev) => myCreature(g, s, ev.o), do: (g, s, ev, { p }) => g.counterEach(p, "p1", 1, s) }],
    ai: { priority: 7 }
  });

  D({
    name: "Cleric Class", cost: "{W}", type: "Enchantment — Class",
    text: "If you would gain life, you gain that much life plus 1 instead.\n{3}{W}: Level 2 — Whenever you gain life, put a +1/+1 counter on target creature you control.\n{4}{W}: Level 3 — When this Class becomes level 3, return target creature card from your graveyard to the battlefield. You gain life equal to its toughness.",
    levels: [
      { statics: [{ lifeGainPlus: (g, s, p) => (p === s.controller ? 1 : 0) }] },
      {
        cost: "{3}{W}",
        triggers: [{
          on: "gainLife", when: gainedByMe,
          do: async (g, s, ev, { p }) => {
            const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "counter", prompt: "Cleric Class: put a +1/+1 counter on" }), s);
            if (t) g.addCounters(t, "p1", 1, s);
          }
        }]
      },
      {
        cost: "{4}{W}",
        onLevel: async (g, s) => {
          const p = s.controller;
          const t = await g.chooseTarget(p, trig({ kind: "card", from: (g2, pl) => pl.graveyard.filter(o => o.def.types.includes("Creature")), purpose: "reanimate", prompt: "Cleric Class: return a creature card from your graveyard" }), s);
          if (!t || t.zone !== "graveyard") return;
          g.putOntoBattlefield([t], p);
          g.gainLife(p, Math.max(0, g.toughness(t)), s);
        }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Dazzling Theater // Prop Room", type: "Enchantment — Room", colors: "W", mvOverride: 7,
    doors: [
      { name: "Dazzling Theater", cost: "{3}{W}", text: "Creature spells you cast have convoke.", statics: [{ giveConvoke: (g, s, o) => o.def.types.includes("Creature") }] },
      { name: "Prop Room", cost: "{2}{W}", text: "Untap each creature you control during each other player's untap step.", statics: [{ untapOnOthersTurn: true }] }
    ],
    ai: { priority: 5, door: (g, p) => (g.creatures(p).length >= 4 ? 1 : 0) }
  });

  D({
    name: "Intangible Virtue", cost: "{1}{W}", type: "Enchantment",
    statics: [{ applies: (g, s, o) => myCreature(g, s, o) && o.isToken, pt: [1, 1], kw: ["vigilance"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Song of the Worldsoul", cost: "{4}{W}{W}", type: "Enchantment",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => g.populate(p, s) }],
    ai: { priority: 7 }
  });

  /* ================================================================ instants */
  const destroyAndToken = (tok) => ({
    targets: [{ kind: "permanent", purpose: "harm", prompt: "Destroy" }],
    do: (g, ctx) => {
      if (!ctx.legal[0]) return;
      const t = ctx.targets[0]; const who = t.controller;
      g.destroy(t, ctx.o);
      g.createToken(who, tok);
    }
  });
  D({ name: "Beast Within", cost: "{2}{G}", type: "Instant", spell: destroyAndToken(T.beast), ai: { removal: true, minThreat: 5 } });
  D({ name: "Generous Gift", cost: "{2}{W}", type: "Instant", spell: destroyAndToken(T.elephant), ai: { removal: true, minThreat: 5 } });

  D({
    name: "Break Down", cost: "{2}{G}", type: "Instant",
    spell: {
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Destroy" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); g.createToken(ctx.p, T.junk); }
    },
    ai: { removal: true, minThreat: 3 }
  });

  D({
    name: "Sundering Growth", cost: "{G/W}{G/W}", type: "Instant",
    spell: {
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Destroy" }],
      do: async (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); await g.populate(ctx.p, ctx.o); }
    },
    ai: { removal: true, minThreat: 3 }
  });

  D({
    name: "Grand Crescendo", cost: "{X}{W}{W}", type: "Instant",
    spell: {
      do: (g, ctx) => {
        if (ctx.x > 0) g.createToken(ctx.p, T.citizen, { count: ctx.x });
        g.grant(g.creatures(ctx.p), ["indestructible"]);
        g.log(`Creatures ${ctx.p.name} controls gain indestructible.`, { p: ctx.p });
      }
    },
    ai: { protection: true, instantEnd: true, x: (g, p, o, xMax) => xMax }
  });

  D({
    name: "Path to Exile", cost: "{W}", type: "Instant",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Exile" }],
      do: async (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0]; const who = t.controller;
        g.exile(t, ctx.o);
        const ok = await g.ask(who, { type: "confirm", prompt: "Path to Exile: search for a basic land?", src: ctx.o, purpose: "pathLand" });
        if (ok) await g.search(who, { filter: (g2, o) => g2.isBasic(o) && o.def.types.includes("Land"), to: "battlefield", tapped: true, prompt: "Choose a basic land" });
      }
    },
    ai: { removal: true, minThreat: 4 }
  });

  D({
    name: "Swords to Plowshares", cost: "{W}", type: "Instant",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Exile" }],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0]; const who = t.controller; const pw = Math.max(0, g.power(t));
        g.exile(t, ctx.o);
        g.gainLife(who, pw, ctx.o);
      }
    },
    ai: { removal: true, minThreat: 4 }
  });

  D({
    name: "Return of the Wildspeaker", cost: "{4}{G}", type: "Instant",
    modes: [
      {
        label: "Draw cards equal to the greatest power among your non-Humans",
        do: (g, ctx) => g.draw(ctx.p, greatestPower(g, g.creatures(ctx.p).filter(o => !g.hasSub(o, "Human"))))
      },
      {
        label: "Non-Human creatures you control get +3/+3",
        do: (g, ctx) => g.addEffect({ objs: g.creatures(ctx.p).filter(o => !g.hasSub(o, "Human")), pt: [3, 3] })
      }
    ],
    ai: { mode: (g, p) => (g.combat && g.combat.attacker === p ? 1 : 0), instantEnd: true }
  });

  D({
    name: "Rootborn Defenses", cost: "{2}{W}", type: "Instant",
    spell: {
      do: async (g, ctx) => {
        await g.populate(ctx.p, ctx.o);
        g.grant(g.creatures(ctx.p), ["indestructible"]);
        g.log(`Creatures ${ctx.p.name} controls gain indestructible.`, { p: ctx.p });
      }
    },
    ai: { protection: true }
  });

  /* ================================================================ sorceries */
  D({
    name: "Camaraderie", cost: "{4}{G}{W}", type: "Sorcery",
    spell: {
      do: (g, ctx) => {
        const x = g.creatures(ctx.p).length;
        g.gainLife(ctx.p, x, ctx.o);
        g.draw(ctx.p, x);
        g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 1] });
      }
    },
    ai: { draw: true, minCreatures: 3 }
  });

  D({
    name: "Shamanic Revelation", cost: "{3}{G}{G}", type: "Sorcery",
    spell: {
      do: (g, ctx) => {
        const list = g.creatures(ctx.p);
        g.draw(ctx.p, list.length);
        const big = list.filter(o => g.power(o) >= 4).length;
        if (big) g.gainLife(ctx.p, 4 * big, ctx.o);
      }
    },
    ai: { draw: true, minCreatures: 3 }
  });

  D({
    name: "Cultivate", cost: "{2}{G}", type: "Sorcery",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const pool = p.library.filter(o => g.isBasic(o) && o.def.types.includes("Land"));
        let picks = [];
        if (pool.length) picks = (await g.ask(p, { type: "cards", prompt: "Cultivate: choose up to two basic lands. The first goes onto the battlefield tapped, the second into your hand.", options: pool, min: 0, max: 2, purpose: "cultivate", src: ctx.o })) || [];
        picks = picks.slice(0, 2);
        if (picks[0]) g.putOntoBattlefield([picks[0]], p, { tapped: true });
        if (picks[1]) g.moveTo(picks[1], "hand");
        g.shuffle(p);
        g.log(picks.length ? `${p.name} finds ${picks.map(o => o.def.name).join(" and ")}.` : `${p.name} finds no basic land.`, { p, kind: "search" });
      }
    },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Farseek", cost: "{1}{G}", type: "Sorcery",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && ["Plains", "Island", "Swamp", "Mountain"].some(t => o.def.subtypes.includes(t)), to: "battlefield", tapped: true, prompt: "Farseek: choose a Plains, Island, Swamp or Mountain card", src: ctx.o }) },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Nature's Lore", cost: "{1}{G}", type: "Sorcery",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && o.def.subtypes.includes("Forest"), to: "battlefield", prompt: "Nature's Lore: choose a Forest card", src: ctx.o }) },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Excavation Technique", cost: "{3}{W}", type: "Sorcery",
    keywords: ["demonstrate"],
    spell: {
      targets: [{ kind: "nonland", purpose: "harm", prompt: "Destroy" }],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0]; const who = t.controller;
        g.destroy(t, ctx.o);
        g.createToken(who, T.treasure, { count: 2 });
      }
    },
    onCast: async (g, p, o, item) => {
      if (item.isCopy) return;
      const ok = await g.ask(p, { type: "confirm", prompt: "Demonstrate: copy Excavation Technique? An opponent you choose gets a copy too.", src: o, purpose: "demonstrate" });
      if (!ok) return;
      await g.copySpell(item, p);
      const q = await g.ask(p, { type: "player", prompt: "Choose an opponent to also copy it", options: g.opponents(p), src: o, purpose: "demonstrateOpponent" });
      if (q) await g.copySpell(item, q);
    },
    ai: { removal: true, minThreat: 5 }
  });

  D({
    name: "Finale of Devastation", cost: "{X}{G}{G}", type: "Sorcery",
    spell: {
      do: async (g, ctx) => {
        const x = ctx.x;
        await g.search(ctx.p, { from: ["library", "graveyard"], filter: (g2, o) => o.def.types.includes("Creature") && o.def.mv <= x, to: "battlefield", prompt: `Finale: choose a creature card with mana value ${x} or less`, src: ctx.o });
        if (x >= 10) {
          g.addEffect({ objs: g.creatures(ctx.p), pt: [x, x], kw: ["haste"] });
          g.log(`Creatures ${ctx.p.name} controls get +${x}/+${x} and haste.`, { p: ctx.p, kind: "big" });
        }
      }
    },
    // wait until X is at least 3 (Heliod, Adeline): smaller finds aren't worth a card
    ai: { tutor: true, hold: (g, p) => g.maxX(p, MK.parseCost("{G}{G}"), 1) < 3, x: (g, p, o, xMax) => (AI().finaleX ? AI().finaleX(g, p, xMax) : xMax) }
  });

  D({
    name: "Hour of Reckoning", cost: "{4}{W}{W}{W}", type: "Sorcery",
    keywords: ["convoke"],
    spell: { do: (g, ctx) => { const n = g.destroyAll(g.battlefield.filter(o => g.isCreature(o) && !o.isToken)); g.log(`${n} nontoken creature${n === 1 ? "" : "s"} destroyed.`, {}); } },
    ai: { wipe: true, spares: o => o.isToken }
  });

  D({
    name: "Overwhelming Stampede", cost: "{3}{G}{G}", type: "Sorcery",
    spell: {
      do: (g, ctx) => {
        const list = g.creatures(ctx.p); const x = greatestPower(g, list);
        g.addEffect({ objs: list, pt: [x, x], kw: ["trample"] });
        g.log(`Creatures ${ctx.p.name} controls get +${x}/+${x} and trample.`, { p: ctx.p, kind: "big" });
      }
    },
    ai: { finisher: true }
  });

  D({
    name: "Triumph of the Hordes", cost: "{2}{G}{G}", type: "Sorcery",
    spell: {
      do: (g, ctx) => {
        g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 1], kw: ["trample", "infect"] });
        g.log(`Creatures ${ctx.p.name} controls get +1/+1, trample and infect.`, { p: ctx.p, kind: "big" });
      }
    },
    ai: { finisher: true, infect: true }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const gainOnEnter = n => ({ on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, n, s) });

  D({ name: "Plains", type: "Basic Land — Plains", mana: [{ tap: true, produce: "W" }] });
  D({ name: "Forest", type: "Basic Land — Forest", mana: [{ tap: true, produce: "G" }] });

  land("Blossoming Sands", { etbTapped: true, triggers: [gainOnEnter(1)], mana: [{ tap: true, produce: gw }] });
  land("Graypelt Refuge", { etbTapped: true, triggers: [gainOnEnter(1)], mana: [{ tap: true, produce: gw }] });
  land("Bountiful Promenade", { etbTapped: (g, o) => g.opponents(o.controller).length < 2, mana: [{ tap: true, produce: gw }] });
  land("Canopy Vista", { type: "Land — Forest Plains", etbTapped: (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x) && g.isBasic(x)).length < 2, mana: [{ tap: true, produce: gw }] });
  land("Overgrown Farmland", { etbTapped: (g, o) => otherLands(g, o) < 2, mana: [{ tap: true, produce: gw }] });
  land("Razorverge Thicket", { etbTapped: (g, o) => otherLands(g, o) > 2, mana: [{ tap: true, produce: gw }] });
  land("Sunpetal Grove", { etbTapped: (g, o) => !hasLand(g, o.controller, "Forest") && !hasLand(g, o.controller, "Plains"), mana: [{ tap: true, produce: gw }] });
  land("Scattered Groves", { type: "Land — Forest Plains", etbTapped: true, note: "Cycling isn't in this game.", mana: [{ tap: true, produce: gw }] });
  land("Brushland", {
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: gw, condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  land("Command Tower", { mana: [{ tap: true, produce: "any" }] });
  land("Radiant Fountain", { triggers: [gainOnEnter(2)], mana: [{ tap: true, produce: "C" }] });
  land("Seraph Sanctuary", {
    triggers: [gainOnEnter(1), { on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o) && g.hasSub(ev.o, "Angel"), do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }],
    mana: [{ tap: true, produce: "C" }]
  });
  land("Selesnya Sanctuary", {
    etbTapped: true,
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const lands = g.controlled(p, o => g.isLand(o));
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Selesnya Sanctuary: return a land you control to your hand", options: lands, src: s, purpose: "bounceOwnLand" });
        const t = pick || lands[0];
        if (t && t.zone === "battlefield") g.bounce(t);
      }
    }],
    mana: [{ tap: true, produce: "GW" }]
  });
  land("Sungrass Prairie", { mana: [{ tap: true, cost: "{1}", produce: "GW" }] });
  land("Sapseep Forest", {
    type: "Land — Forest", etbTapped: true,
    mana: [{ tap: true, produce: "G" }],
    abilities: [{
      label: "Gain 1 life", cost: "{G}", tap: true,
      condition: (g, o, p) => g.controlled(p, x => g.colorsOf(x).has("G")).length >= 2,
      do: (g, s, ctx) => g.gainLife(ctx.p, 1, s),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && ctx.turnOf !== p }
    }]
  });
  land("Gavony Township", {
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "+1/+1 counter on each creature", cost: "{2}{G}{W}", tap: true,
      do: (g, s, ctx) => g.counterEach(ctx.p, "p1", 1, s),
      ai: { use: (g, p, o, ctx) => g.creatures(p).length >= 2 && ((ctx.window === "end" && ctx.turnOf !== p) || (ctx.window === "combat" && g.combat && g.combat.attacker === p)) }
    }]
  });
  land("Grove of the Guardian", {
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Create an 8/8 Elemental", cost: "{3}{G}{W}", tap: true, tapCreatures: 2, sacSelf: true,
      do: (g, s, ctx) => g.createToken(ctx.p, T.groveElemental),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && ctx.turnOf !== p && g.creatures(p).filter(c => g.power(c) <= 2).length >= 2 }
    }]
  });
  land("Rogue's Passage", {
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Make a creature unblockable", cost: "{4}", tap: true,
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Can't be blocked this turn" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) { g.addEffect({ objs: [ctx.targets[0]], unblockable: true }); g.log(`${ctx.targets[0].def.name} can't be blocked this turn.`, { p: ctx.p }); } },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.creatures(p).some(c => g.canAttack(c, p) && g.power(c) >= 6) }
    }]
  });
  land("Krosan Verge", {
    etbTapped: true,
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Fetch a Forest and a Plains", cost: "{2}", tap: true, sacSelf: true,
      do: async (g, s, ctx) => {
        await g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && o.def.subtypes.includes("Forest"), to: "battlefield", tapped: true, prompt: "Krosan Verge: choose a Forest card" });
        await g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && o.def.subtypes.includes("Plains"), to: "battlefield", tapped: true, prompt: "Krosan Verge: choose a Plains card" });
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "end" || ctx.window === "main2" }
    }]
  });
  land("Brokers Hideout", {
    text: "When Brokers Hideout enters, sacrifice it. When you do, search your library for a basic Forest, Plains, or Island card, put it onto the battlefield tapped, then shuffle and you gain 1 life.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        g.sacrifice(s);
        await g.search(p, { filter: (g2, o) => g2.isBasic(o) && ["Forest", "Plains", "Island"].some(t => o.def.subtypes.includes(t)), to: "battlefield", tapped: true, prompt: "Choose a basic Forest, Plains or Island" });
        g.gainLife(p, 1, s);
      }
    }]
  });
  land("Restless Prairie", {
    etbTapped: true,
    mana: [{ tap: true, produce: gw }],
    abilities: [{
      label: "Become a 3/3 Llama", cost: "{2}{G}{W}", noSelfMana: true,
      condition: (g, o) => !(o.state.animated && o.state.animated.turn === g.turn),
      do: (g, s) => { s.state.animated = { turn: g.turn, pt: [3, 3], subtypes: ["Llama"], colors: ["G", "W"] }; g.bump(); g.log("Restless Prairie becomes a 3/3 Llama until end of turn.", { p: s.controller, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !o.sick && g.creatures(p).filter(c => g.canAttack(c, p)).length >= 3 }
    }],
    triggers: [{
      on: "attacks", self: true, late: true,
      do: (g, s, ev, { p }) => { g.addEffect({ objs: g.creatures(p).filter(c => c !== s), pt: [1, 1] }); g.log("Other creatures get +1/+1.", { p, cards: [s.def.name] }); }
    }]
  });
  land("Lazotep Quarry", {
    type: "Land — Desert",
    mana: [{ tap: true, produce: "C" }],
    abilities: [
      {
        label: "Sacrifice a creature: one mana of any color", tap: true,
        sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
        do: async (g, s, ctx) => {
          const opts = g.identityOf(ctx.p).map(k => ({ id: k, label: MK.COLOR_NAME[k] }));
          const k = opts.length === 1 ? opts[0].id : await g.ask(ctx.p, { type: "option", prompt: "Choose a color", options: opts, purpose: "manaColor", src: s });
          ctx.p.pool[k || opts[0].id]++;
          g.bump();
        },
        ai: { use: () => false }
      },
      {
        label: "Zombie copy of a creature card", cost: "{X}{2}", tap: true, sacSelf: true, timing: "sorcery",
        targets: [{ kind: "card", from: (g, pl) => pl.graveyard.filter(o => o.def.types.includes("Creature")), purpose: "reanimate", prompt: "Exile a creature card from your graveyard" }],
        minXFn: (g, o, p) => Math.min(...p.graveyard.filter(c => c.def.types.includes("Creature")).map(c => c.def.mv).concat([99])),
        xFrom: (g, ctx) => (ctx.targets[0] ? ctx.targets[0].def.mv : 0),
        do: (g, s, ctx) => {
          const t = ctx.targets[0];
          if (!t || t.zone !== "graveyard") return;
          g.moveTo(t, "exile");
          g.copyToken(ctx.p, t, { except: { pt: [4, 4], colors: ["B"], subtypes: ["Zombie"] } });
        },
        ai: { use: (g, p, o, ctx) => ctx.window === "main2" && p.graveyard.some(c => c.def.types.includes("Creature") && c.def.mv >= 4) }
      }
    ]
  });

  /* ================================================================ the deck */
  MK.MIKU_DECK = {
    id: "miku",
    name: "Miku",
    hero: "miku", variant: "full", label: "Full upgrades", bracket: 3,
    blurb: "The wiki's full upgrade list: the precon plus 24 upgrades, Craterhoof and the Heliod combos.",
    title: "Trostani, Selesnya's Voice",
    commander: "Trostani, Selesnya's Voice",
    identity: ["G", "W"],
    list: (function () {
      const counts = { Plains: 9, Forest: 6 };
      const singles = ["Adeline, Resplendent Cathar", "Aetherflux Reservoir", "Ajani's Pridemate", "Arcane Signet", "Archangel of Thune", "Avacyn's Pilgrim", "Beast Within", "Beastmaster Ascension", "Blossoming Bogbeast", "Blossoming Sands", "Bountiful Promenade", "Bramble Sovereign", "Break Down", "Brokers Hideout", "Brushland", "Camaraderie", "Canopy Vista", "Cathars' Crusade", "Cleric Class", "Command Tower", "Conclave Evangelist", "Crashing Drawbridge", "Craterhoof Behemoth", "Cultivate", "Dazzling Theater // Prop Room", "Elenda's Hierophant", "Elspeth, Sun's Champion", "Elvish Mystic", "Esika's Chariot", "Excavation Technique", "Fanatic of Rhonas", "Farseek", "Finale of Devastation", "Gavony Township", "Generous Gift", "Ghalta and Mavren", "Grand Crescendo", "Graypelt Refuge", "Grove of the Guardian", "Halo Fountain", "Heliod, Sun-Crowned", "Hero of Bladehold", "Hour of Reckoning", "Intangible Virtue", "Jazal Goldmane", "Krosan Verge", "Lathiel, the Bounteous Dawn", "Lazotep Quarry", "Llanowar Elves", "Mirror Entity", "Nature's Lore", "Nykthos Paragon", "Overgrown Farmland", "Overwhelming Stampede", "Path to Exile", "Prosperous Innkeeper", "Razorverge Thicket", "Resplendent Angel", "Restless Prairie", "Return of the Wildspeaker", "Rogue's Passage", "Rootborn Defenses", "Scattered Groves", "Selesnya Sanctuary", "Selesnya Signet", "Shalai, Voice of Plenty", "Shamanic Revelation", "Skullclamp", "Sol Ring", "Song of the Worldsoul", "Soul Warden", "Soul of Eternity", "Speaker of the Heavens", "Spike Feeder", "Springleaf Drum", "Sundering Growth", "Sungrass Prairie", "Sunpetal Grove", "Swords to Plowshares", "Triumph of the Hordes", "Voice of Resurgence", "Voice of the Blessed", "Vorinclex, Voice of Hunger", "Walking Ballista"];
      const out = [];
      for (const n of singles) out.push(n);
      for (const n in counts) for (let i = 0; i < counts[n]; i++) out.push(n);
      return out;
    })()
  };
  /* Decks a player can pilot on the Play tab (and that the sim knows by id). The precon, budget and
     Azusa versions are added by cards-miku-precon.js and decks-azusa.js; Etrata by cards-etrata.js. */
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.MIKU_DECK);
})(typeof window !== "undefined" ? window : globalThis);
