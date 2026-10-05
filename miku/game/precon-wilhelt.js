/* Wilhelt, the Rotcleaver: a Bracket 2 bot deck modeled on the retail Undead Unleashed precon
   (Innistrad: Midnight Hunt Commander, 2021). Blue-black Zombies: every Zombie that dies comes back
   as a decayed token, Wilhelt and a handful of sacrifice outlets turn the dead into cards, edicts and
   drains, and lords, Army of the Damned and Gravespawn Sovereign finish the job.
   Cards shared with other decks (Sol Ring, Arcane Signet, Command Tower, Swamp, Myriad Landscape) are
   defined in cards-miku.js and the decks-*.js files, which load first; this file only lists them. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const WILHELT = "Wilhelt, the Rotcleaver";

  /* ================================================================ helpers */
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : 0);
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  const isBot = p => !!(p && p.agent && p.agent.bot);
  const landsOf = (g, p) => g.controlled(p, o => g.isLand(o));
  /* The end of the turn just before ours (deck plans get no turnOf: the active player is the one whose turn ends). */
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf || g.active) === p && g.active !== p;
  const myMain = (g, p, ctx) => (ctx.window === "main1" || ctx.window === "main2") && g.active === p;
  const creatureCard = c => c.def.types.includes("Creature");

  /* Zombie checks. zDef/zq read the card itself (safe inside statics, which run while characteristics
     are computed); zNow reads the current characteristics (for triggers, abilities and spells). */
  const zDef = d => !!d && ((d.subtypes || []).includes("Zombie") || !!d.changeling);
  const zq = o => zDef(o.def);
  const zNow = (g, o) => g.hasSub(o, "Zombie");
  const zombieCreatureCard = c => zDef(c.def) && c.def.types.includes("Creature");
  const myZombies = (g, p) => g.battlefield.filter(o => o.controller === p && g.isCreature(o) && zNow(g, o));
  const zombiePermanents = (g, p) => g.battlefield.filter(o => o.controller === p && zNow(g, o));
  const untappedZombies = (g, p) => myZombies(g, p).filter(o => !o.tapped);
  const lkiZombie = ev => !!ev.lki && (ev.lki.subtypes.includes("Zombie") || !!(ev.o && ev.o.def && ev.o.def.changeling));
  /* Who controlled a trigger's source: when the source left in the same event, its last known information. */
  const ctrlOf = (s, ev, lki) => (lki && lki.controller) || (ev && ev.o === s && ev.lki ? ev.lki.controller : s.controller);
  const allGraveCreatures = g => g.players.filter(q => !q.lost).reduce((out, q) => out.concat(q.graveyard.filter(creatureCard)), []);

  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"}${src && src.def ? " (" + src.def.name + ")" : ""}.`, { p, cards: src && src.def ? [src.def.name] : [] });
    return got;
  }
  /* Mill that reports which cards went to the graveyard. */
  function millCards(g, q, n) {
    const out = [];
    for (let i = 0; i < n && q.library.length; i++) { const c = q.library[0]; g.moveTo(c, "graveyard"); out.push(c); }
    if (out.length) g.log(`${q.name} mills ${plural(out.length, "card")}: ${out.map(c => c.def.name).join(", ")}.`, { p: q, cards: out.map(c => c.def.name).slice(0, 6), kind: "mill" });
    return out;
  }
  /* Creatures that "died this turn" (Liliana's Devotee): Wilhelt records every death, from the
     battlefield or the command zone. */
  const noteDeath = g => { g.__wilheltDied = g.turn; return false; };
  const diedThisTurn = g => g.__wilheltDied === g.turn;

  /* Scry 1 and surveil 1. */
  function keepOnTop(g, p, card) {
    const lands = landsOf(g, p).length;
    const inHand = p.hand.filter(o => o.def.types.includes("Land")).length;
    if (card.def.types.includes("Land")) return lands + inHand < 6;
    if (lands + inHand < 3 && card.def.mv >= 4) return false;
    return true;
  }
  async function scry1(g, p, src) {
    const top = p.library[0];
    if (!top) return;
    const bottom = await g.ask(p, { type: "confirm", prompt: `Scry 1: put ${top.def.name} on the bottom of your library?`, src, purpose: "scryBottom", card: top });
    if (bottom && p.library[0] === top) {
      p.library.shift(); p.library.push(top); g.bump();
      g.log(`${p.name} scries 1 and puts the card on the bottom.`, { p });
    } else g.log(`${p.name} scries 1 and leaves the card on top.`, { p });
  }
  async function surveil1(g, p, src) {
    const top = p.library[0];
    if (!top) return;
    const gy = await g.ask(p, { type: "confirm", prompt: `Surveil 1: put ${top.def.name} into your graveyard?`, src, purpose: "surveilGrave", card: top });
    if (gy && p.library[0] === top) {
      g.moveTo(top, "graveyard");
      g.log(`${p.name} surveils 1 and puts ${top.def.name} into their graveyard.`, { p, cards: [top.def.name] });
    } else g.log(`${p.name} surveils 1 and leaves the card on top.`, { p });
  }
  const topConfirm = (g, p, req) => (req.purpose === "scryBottom" || req.purpose === "surveilGrave" ? !keepOnTop(g, p, req.card) : true);

  /* ================================================================ tokens */
  const DECAY_TEXT = "Decayed (This creature can't block. When it attacks, sacrifice it at end of combat.)";
  const DECAY_TRIGGERS = [
    // remembers that it attacked (never triggers by itself)
    { on: "attacks", self: true, when: (g, s) => { s.state.decayedAttack = g.turn; return false; }, do: () => {} },
    { on: "endCombat", when: (g, s) => s.state.decayedAttack === g.turn, do: (g, s) => { if (s.zone === "battlefield") g.sacrifice(s); } }
  ];
  const ZOMBIE_DECAYED = MK.tokenDef({ key: "wilhelt-zombie-decayed", name: "Zombie", pt: [2, 2], colors: "B", subtypes: ["Zombie"], keywords: ["decayed"], cantBlock: true, text: DECAY_TEXT, triggers: DECAY_TRIGGERS });
  /* Create tokens with our own log line (the engine's would read like any other token). */
  function quietToken(g, p, def, opts) {
    g.quiet = (g.quiet || 0) + 1;
    try { return g.createToken(p, def, opts); } finally { g.quiet = Math.max(0, g.quiet - 1); }
  }
  function decayedTokens(g, p, n, opts) {
    const made = quietToken(g, p, ZOMBIE_DECAYED, Object.assign({ count: n }, opts || {}));
    g.log(`${p.name} creates ${n === 1 ? "a decayed 2/2 Zombie token" : n + " decayed 2/2 Zombie tokens"}.`, { p, cards: ["Zombie"], kind: "token" });
    return made;
  }
  const ZOMBIE_ARMY = MK.tokenDef({ key: "wilhelt-zombie-army", name: "Zombie Army", pt: [0, 0], colors: "B", subtypes: ["Zombie", "Army"] });
  const blueZombie = x => MK.tokenDef({ key: "wilhelt-zombie-u" + x, name: "Zombie", pt: [x, x], colors: "U", subtypes: ["Zombie"] });

  /* Amass Zombies N: counters on an Army you control, or a new 0/0 Zombie Army first. */
  function amass(g, p, n, src) {
    const army = g.battlefield.find(o => o.controller === p && g.isCreature(o) && o.def.subtypes.includes("Army"));
    if (!army) {
      quietToken(g, p, ZOMBIE_ARMY, { counters: { p1: n } });
      g.log(`${p.name} amasses Zombies ${n}: a new Zombie Army with ${plural(n, "+1/+1 counter")}.`, { p, cards: src ? [src.def.name] : [], kind: "token" });
      return;
    }
    g.addCounters(army, "p1", n, src);
    g.log(`${p.name} amasses Zombies ${n}: ${plural(n, "+1/+1 counter")} on the Army.`, { p, cards: src ? [src.def.name] : [] });
  }

  /* Investigate: a Clue token. */
  function clueUse(g, p, o, ctx) {
    if (p.library.length < 6) return false;
    if (endBeforeMe(g, p, ctx)) return true;
    return ctx.window === "main2" && g.active === p && p.hand.length <= 1 && landsOf(g, p).length >= 6;
  }
  const CLUE = MK.tokenDef({
    key: "wilhelt-clue", name: "Clue", types: ["Artifact"], subtypes: ["Clue"], colors: [],
    text: "{2}, Sacrifice this artifact: Draw a card.",
    abilities: [{ label: "Draw a card", cost: "{2}", sacSelf: true, do: (g, s, ctx) => drawLog(g, ctx.p, 1, s), ai: { use: clueUse } }]
  });
  const investigate = (g, p) => g.createToken(p, CLUE);

  /* "They're black Zombies in addition to their other colors and types" (Liliana's -3, Ghouls' Night Out).
     The object gets its own copy of its card's definition. The changes only apply while it stays on the
     battlefield, and the card gets its own definition back when it leaves. */
  const ZOMBIFIED = new WeakMap();           // object -> { zc, decayed, base }
  const baseDef = o => { const z = ZOMBIFIED.get(o); return z ? z.base : o.def; };
  const RESTORE = {
    on: "leaves", self: true,
    when: (g, s) => { const z = ZOMBIFIED.get(s); if (z && s.def !== z.base) { s.def = z.base; g.ts++; g.bump(); } return false; },
    do: () => {}
  };
  function zombify(g, o, decayed) {
    if (!o || o.zone !== "battlefield") return;
    const prev = ZOMBIFIED.get(o);
    const base = baseDef(o);
    decayed = !!decayed || !!(prev && prev.zc === o.zc && prev.decayed);
    const zc = o.zc;
    const live = () => o.zc === zc && o.zone === "battlefield";
    const hasZ = base.subtypes.includes("Zombie");
    const subs = hasZ ? base.subtypes : base.subtypes.concat("Zombie");
    const cols = base.colors.includes("B") ? base.colors : base.colors.concat("B");
    const kws = decayed && !base.keywords.includes("decayed") ? base.keywords.concat("decayed") : base.keywords;
    const typeLine = hasZ ? base.type : base.type.includes(" — ") ? base.type + " Zombie" : base.type + " — Zombie";
    const d = Object.create(base);
    const gate = (k, v) => Object.defineProperty(d, k, { get: () => (live() ? v : base[k]), configurable: true, enumerable: true });
    gate("subtypes", subs); gate("colors", cols); gate("keywords", kws); gate("type", typeLine);
    if (decayed) gate("cantBlock", true);
    d.triggers = base.triggers.concat(decayed ? DECAY_TRIGGERS : [], [RESTORE]);
    ZOMBIFIED.set(o, { zc, decayed, base });
    o.def = d;
    g.ts++; g.bump();
  }
  /* Did the creature that just died have decayed? (Wilhelt looks back in time.) */
  function hadDecayed(g, o) {
    if ((o.def.keywords || []).includes("decayed")) return true;
    const z = ZOMBIFIED.get(o);
    return !!(z && z.decayed && o.zc === z.zc + 1);
  }

  /* ================================================================ sacrifices, edicts, targets */
  const KEEP = new Set([WILHELT, "Cemetery Reaper", "Death Baron", "Diregraf Captain", "Lord of the Accursed", "Tomb Tyrant",
    "Liliana's Devotee", "Undead Augur", "Diregraf Colossus", "Gravespawn Sovereign", "Hordewing Skaab", "Eternal Skylord",
    "Gleaming Overseer", "Cleaver Skaab", "Noosegraf Mob", "Gorex, the Tombshell", "Butcher of Malakir", "Midnight Reaper",
    "Ruthless Deathfang", "Overseer of the Damned", "Eloise, Nephalia Sleuth", "Prowling Geistcatcher", "Gisa and Geralf",
    "Stitcher Geralf", "Havengul Runebinder", "Forgotten Creation", "Ravenous Rotbelly"]);
  /* How little p minds sacrificing o (lower goes first). */
  function fodderScore(g, p, o) {
    if (!g.isCreature(o)) return 40;
    if (o.isCommander) return 50;
    const name = o.def.name;
    if (o.isToken && !o.copyDef) {
      if (g.kw(o, "decayed")) return 0;
      if (o.def.subtypes.includes("Army")) return 0.5 + (o.counters.p1 || 0) * 1.2;
      return 1 + Math.max(0, (o.def.pt ? o.def.pt[0] : 0) - 2) * 0.8;
    }
    if (g.kw(o, "decayed")) return 1.2;
    if (name === "Geralf's Mindcrusher") return o.counters.p1 ? 7 : 1.5;
    if (name === "Stitcher's Supplier") return 1;
    if (name === "Fleshbag Marauder" || name === "Spark Reaper" || name === "Gravedigger" || name === "Corpse Augur") return 2.5;
    if (name === "Cryptbreaker") return 3;
    if (KEEP.has(name)) return 20 + valueOf(g, o) * 0.5;
    return 4 + valueOf(g, o) * 0.4;
  }
  const cheapest = (g, p, list) => list.slice().sort((a, b) => fodderScore(g, p, a) - fodderScore(g, p, b))[0] || null;
  const hasFodder = (g, p, max, except) => g.battlefield.some(o => o.controller === p && o !== except && g.isCreature(o) && fodderScore(g, p, o) <= max);

  /* q sacrifices n creatures of their choice. */
  async function edict(g, q, n, src) {
    let done = 0;
    for (let i = 0; i < n && !q.lost; i++) {
      const opts = g.creatures(q);
      if (!opts.length) break;
      let pick = await g.ask(q, { type: "target", prompt: `${src.def.name}: sacrifice a creature`, options: opts, purpose: "sacrifice", src });
      if (!pick || !opts.includes(pick) || pick.zone !== "battlefield") pick = opts.slice().sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];
      if (g.sacrifice(pick)) done++;
    }
    return done;
  }
  async function eachOpponentSacrifices(g, p, n, src) {
    let total = 0;
    for (const q of g.orderFrom(p).slice(1)) total += await edict(g, q, n, src);
    return total;
  }
  async function chooseOpponent(g, p, src, prompt, purpose) {
    const opts = g.targetOptions(p, { kind: "opponent" }, src);
    if (!opts.length) return null;
    return g.ask(p, { type: "target", prompt, options: opts, purpose: purpose || "harm", src, spec: { kind: "opponent" } });
  }

  /* How much a card in a graveyard is worth bringing back. */
  const cardWorth = c => (c.def.ai && c.def.ai.priority != null ? c.def.ai.priority : 5) + c.def.mv * 0.7 + (c.def.pt ? (c.def.pt[0] + c.def.pt[1]) * 0.3 : 0);
  function reanimatePick(g, p, options) {
    const ok = options.filter(c => !(c.def.legendary && g.battlefield.some(o => o.controller === p && o.def.name === c.def.name)));
    return (ok.length ? ok : options).slice().sort((a, b) => cardWorth(b) - cardWorth(a))[0];
  }
  /* A creature card of ours to exile as a cost: non-Zombies and cheap cards first. */
  const exileCostPick = (g, p, options) => options.slice().sort((a, b) => (zDef(a.def) - zDef(b.def)) || (cardWorth(a) - cardWorth(b)))[0];
  function commonTarget(g, p, req) {
    const opts = req.options || [];
    if (!opts.length) return undefined;
    switch (req.purpose) {
      case "sacrifice": return opts.some(o => g.isPlayer(o)) ? undefined : cheapest(g, p, opts);
      case "reanimate": return reanimatePick(g, p, opts);
      case "exileCost": return exileCostPick(g, p, opts);
      default: return undefined;
    }
  }
  /* A def's ai.target: only for requests its controller answers (edicts ask each opponent with our card as the source). */
  const targetHook = extra => (g, p, req) => {
    if (!req || (req.src && req.src.controller && req.src.controller !== p)) return undefined;
    if (extra) { const r = extra(g, p, req); if (r !== undefined) return r; }
    return commonTarget(g, p, req);
  };
  const commonHook = targetHook(null);

  /* Wilhelt's end step: sacrifice cheap Zombies for cards. */
  function endSacPick(g, p, options) {
    if (p.library.length <= 4) return null;
    const best = cheapest(g, p, options);
    return best && fodderScore(g, p, best) <= 2.5 ? best : null;
  }
  /* Taps n untapped Zombies (Gravespawn Sovereign, Cryptbreaker): decayed and summoning-sick ones first. */
  const tapCost = (g, o) => (g.kw(o, "decayed") ? 0 : 1) + (o.sick ? 0 : 1.5) + valueOf(g, o) * 0.1;
  async function tapZombies(g, p, n, src) {
    const opts = untappedZombies(g, p);
    if (opts.length < n) return 0;
    let pick;
    if (isBot(p)) pick = opts.slice().sort((a, b) => tapCost(g, a) - tapCost(g, b)).slice(0, n);
    else pick = (await g.ask(p, { type: "cards", prompt: `Tap ${n} untapped Zombies you control`, options: opts, min: n, max: n, purpose: "tapCost", src })) || [];
    pick = pick.filter(o => opts.includes(o)).slice(0, n);
    if (pick.length < n) pick = pick.concat(opts.filter(o => !pick.includes(o)).slice(0, n - pick.length));
    pick.forEach(o => g.tap(o));
    return pick.length;
  }

  /* Damage coming at p in the current combat (after blocks). */
  function incomingAtMe(g, p) {
    const c = g.combat;
    let dmg = 0, n = 0;
    if (!c || c.attacker === p) return { dmg, n };
    for (const a of c.attackers) {
      if (!a.combat || a.zone !== "battlefield" || g.defenderOf(a.combat.attacking) !== p) continue;
      n++;
      if (!a.combat.wasBlocked || g.kw(a, "trample")) dmg += Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1);
    }
    return { dmg, n };
  }

  /* Aetherspouts is worth it against a lethal or big hit, or as a three-for-one against a wide attack. */
  function spoutsWorthIt(g, p) {
    const { dmg, n } = incomingAtMe(g, p);
    if (!n) return false;
    const all = g.combat.attackers.filter(a => a.zone === "battlefield" && a.combat);
    const cards = all.filter(a => !a.isToken).length;
    if (dmg >= p.life) return true;
    if (n >= 2 && dmg >= Math.max(8, p.life * 0.3)) return true;
    return all.length >= 3 && dmg >= 5 && (cards >= 2 || all.length >= 5);
  }

  /* ================================================================ the commander */
  /* Deck plan (runs from the command zone or the battlefield): Aetherspouts against a big attack, and
     Drown in Dreams at the end of the turn before ours. */
  function wilheltPlan(g, p, o, ctx) {
    const acts = ctx.actions || [];
    if (ctx.window === "combat" && g.combat && g.combat.attacker !== p) {
      const a = acts.find(x => x.type === "cast" && x.card.def.name === "Aetherspouts");
      if (a && spoutsWorthIt(g, p)) return { type: "cast", card: a.card, maxTries: 1 };
    }
    if (endBeforeMe(g, p, ctx)) {
      const a = acts.find(x => x.type === "cast" && x.card.def.name === "Drown in Dreams" && !x.alt);
      if (a && a.xMax >= 2 && p.library.length > 12) return { type: "cast", card: a.card, x: Math.min(a.xMax, p.library.length - 10), maxTries: 1 };
    }
    return null;
  }

  /* Bot casting (engine 7): Wilhelt dies often, and from the third cast on (tax 4 or more) recasting
     him ate the whole turn's mana while the hand overflowed and got discarded. He waits while two
     other spells can be cast. Games recorded before engine 7 (legacyDecks) replay without this. */
  function wilheltCastPlan(g, p, o) {
    if (g.opts && g.opts.legacyDecks) return undefined;
    if (o.def.name !== WILHELT || o.zone !== "command" || g.commanderTax(p, o) < 4) return undefined;
    const others = p.hand.filter(c => !c.def.types.includes("Land") && c.def.mv >= 2 && g.castOptions(p, c).length);
    return others.length >= 2 ? false : undefined;
  }

  D({
    name: WILHELT, cost: "{2}{U}{B}", type: "Legendary Creature — Zombie Warrior", pt: "3/3",
    text: "Whenever another Zombie you control dies, if it didn't have decayed, create a 2/2 black Zombie creature token with decayed. (It can't block. When it attacks, sacrifice it at end of combat.)\nAt the beginning of your end step, you may sacrifice a Zombie. If you do, draw a card.",
    triggers: [
      {
        on: "dies",
        when: (g, s, ev, lki) => { noteDeath(g); return ev.o !== s && lkiZombie(ev) && ev.lki.controller === ctrlOf(s, ev, lki) && !hadDecayed(g, ev.o); },
        do: (g, s, ev, { p }) => decayedTokens(g, p, 1)
      },
      {
        on: "endStep", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const opts = zombiePermanents(g, p);
          if (!opts.length) return;
          const pick = await g.ask(p, { type: "target", prompt: "Wilhelt: you may sacrifice a Zombie. If you do, draw a card.", options: opts, optional: true, purpose: "wilheltEnd", src: s });
          if (!pick || pick.zone !== "battlefield" || pick.controller !== p) return;
          if (g.sacrifice(pick)) drawLog(g, p, 1, s);
        }
      },
      // records deaths while Wilhelt waits in the command zone (never triggers)
      { on: "dies", zone: "command", when: noteDeath, do: () => {} }
    ],
    ai: {
      priority: 8,
      target: targetHook((g, p, req) => (req.purpose === "wilheltEnd" ? endSacPick(g, p, req.options) : undefined)),
      plan: wilheltPlan,
      castPlan: wilheltCastPlan
    }
  });

  /* ================================================================ Zombie lords */
  const otherZombieCreatures = (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o) && zq(o);

  D({
    name: "Cemetery Reaper", cost: "{1}{B}{B}", type: "Creature — Zombie", pt: "2/2",
    text: "Other Zombie creatures you control get +1/+1.\n{2}{B}, {T}: Exile target creature card from a graveyard. Create a 2/2 black Zombie creature token.",
    statics: [{ applies: otherZombieCreatures, pt: [1, 1] }],
    abilities: [{
      label: "Exile a creature card: make a Zombie", cost: "{2}{B}", tap: true,
      targets: [{ kind: "card", from: allGraveCreatures, purpose: "reaperExile", prompt: "Cemetery Reaper: exile target creature card from a graveyard" }],
      do: (g, s, ctx) => {
        const c = ctx.targets[0];
        if (!c || !ctx.legal[0] || c.zone !== "graveyard") return;
        g.moveTo(c, "exile");
        g.log(`${ctx.p.name} exiles ${c.def.name} from ${c.owner === ctx.p ? "their" : c.owner.name + "'s"} graveyard.`, { p: ctx.p, cards: [c.def.name] });
        g.createToken(ctx.p, T.zombie);
      },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) || (ctx.window === "main2" && g.active === p) }
    }],
    ai: {
      priority: 7, threat: 2,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "reaperExile") return undefined;
        const theirs = req.options.filter(c => c.owner !== p);
        if (theirs.length) return theirs.slice().sort((a, b) => cardWorth(b) - cardWorth(a))[0];
        return exileCostPick(g, p, req.options);
      })
    }
  });

  D({
    name: "Death Baron", cost: "{1}{B}{B}", type: "Creature — Zombie Wizard", pt: "2/2",
    text: "Skeletons you control and other Zombies you control get +1/+1 and have deathtouch.",
    statics: [{
      applies: (g, s, o) => o.controller === s.controller && g.isCreature(o) && ((o !== s && zq(o)) || o.def.subtypes.includes("Skeleton")),
      pt: [1, 1], kw: ["deathtouch"]
    }],
    ai: { priority: 7, threat: 3 }
  });

  D({
    name: "Diregraf Captain", cost: "{1}{U}{B}", type: "Creature — Zombie Soldier", pt: "2/2",
    keywords: ["deathtouch"],
    text: "Deathtouch\nOther Zombie creatures you control get +1/+1.\nWhenever another Zombie you control dies, target opponent loses 1 life.",
    statics: [{ applies: otherZombieCreatures, pt: [1, 1] }],
    triggers: [{
      on: "dies", when: (g, s, ev, lki) => ev.o !== s && lkiZombie(ev) && ev.lki.controller === ctrlOf(s, ev, lki),
      do: async (g, s, ev, { p }) => {
        const q = await chooseOpponent(g, p, s, "Diregraf Captain: target opponent loses 1 life", "drain");
        if (q && !q.lost) g.loseLife(q, 1, s);
      }
    }],
    ai: {
      priority: 7, threat: 3,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "drain") return undefined;
        const opts = req.options.filter(q => g.isPlayer(q));
        return opts.find(q => q.life <= 1) || opts.slice().sort((a, b) => a.life - b.life)[0];
      })
    }
  });

  D({
    name: "Lord of the Accursed", cost: "{2}{B}", type: "Creature — Zombie", pt: "2/3",
    text: "Other Zombies you control get +1/+1.\n{1}{B}, {T}: All Zombies gain menace until end of turn.",
    statics: [{ applies: otherZombieCreatures, pt: [1, 1] }],
    abilities: [{
      label: "All Zombies gain menace", cost: "{1}{B}", tap: true,
      do: (g, s, ctx) => {
        const list = g.battlefield.filter(o => g.isCreature(o) && zNow(g, o));
        if (list.length) g.grant(list, ["menace"]);
        g.log("All Zombies gain menace until end of turn.", { p: ctx.p, cards: [s.def.name] });
      },
      ai: {
        use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p &&
          myZombies(g, p).filter(z => z !== o && !z.tapped && (!z.sick || g.kw(z, "haste")) && !g.kw(z, "menace")).length >= 3 &&
          g.opponents(p).some(q => g.creatures(q).some(c => !c.tapped))
      }
    }],
    ai: { priority: 7, threat: 2 }
  });

  D({
    name: "Tomb Tyrant", cost: "{3}{B}", type: "Creature — Zombie Noble", pt: "3/3",
    text: "Other Zombies you control get +1/+1.\n{2}{B}, {T}, Sacrifice a creature: Return a Zombie creature card at random from your graveyard to the battlefield. Activate only during your turn and only if there are at least three Zombie creature cards in your graveyard.",
    statics: [{ applies: otherZombieCreatures, pt: [1, 1] }],
    abilities: [{
      label: "Return a random Zombie", cost: "{2}{B}", tap: true,
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Tomb Tyrant: sacrifice a creature" },
      condition: (g, s, p) => g.active === p && p.graveyard.filter(zombieCreatureCard).length >= 3,
      do: (g, s, ctx) => {
        const pool = ctx.p.graveyard.filter(zombieCreatureCard);
        if (!pool.length) return;
        const c = pool[g.rand(pool.length)];
        g.putOntoBattlefield([c], ctx.p);
        g.log(`${ctx.p.name} returns ${c.def.name} at random from their graveyard to the battlefield.`, { p: ctx.p, cards: [c.def.name] });
      },
      ai: { use: (g, p, o, ctx) => myMain(g, p, ctx) && hasFodder(g, p, 1.5, o) }
    }],
    ai: { priority: 6, threat: 2, target: commonHook }
  });

  D({
    name: "Liliana's Devotee", cost: "{2}{B}", type: "Creature — Zombie", pt: "1/2",
    text: "Zombies you control get +1/+0.\nAt the beginning of your end step, if a creature died this turn, you may pay {1}{B}. If you do, create a 2/2 black Zombie creature token.",
    statics: [{ applies: (g, s, o) => o.controller === s.controller && g.isCreature(o) && zq(o), pt: [1, 0] }],
    triggers: [
      { on: "dies", when: noteDeath, do: () => {} },
      {
        on: "endStep", when: (g, s, ev) => ev.p === s.controller && diedThisTurn(g), intervening: g => diedThisTurn(g),
        do: async (g, s, ev, { p }) => {
          const cost = MK.parseCost("{1}{B}");
          if (!g.canPay(p, cost)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: "Liliana's Devotee: pay {1}{B} to create a 2/2 black Zombie token?", src: s, purpose: "devoteePay" });
          if (ok && g.pay(p, cost)) g.createToken(p, T.zombie);
        }
      }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Liliana's Mastery", cost: "{3}{B}{B}", type: "Enchantment",
    text: "Zombies you control get +1/+1.\nWhen Liliana's Mastery enters, create two 2/2 black Zombie creature tokens.",
    statics: [{ applies: (g, s, o) => o.controller === s.controller && g.isCreature(o) && zq(o), pt: [1, 1] }],
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.zombie, { count: 2 }) }],
    ai: { priority: 7 }
  });

  /* ================================================================ death payoffs */
  D({
    name: "Undead Augur", cost: "{B}{B}", type: "Creature — Zombie Wizard", pt: "2/2",
    text: "Whenever Undead Augur or another Zombie you control dies, you draw a card and you lose 1 life.",
    triggers: [{
      on: "dies", when: (g, s, ev, lki) => (ev.o === s || lkiZombie(ev)) && ev.lki.controller === ctrlOf(s, ev, lki),
      do: (g, s, ev, { p }) => { drawLog(g, p, 1, s); g.loseLife(p, 1, s); }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Midnight Reaper", cost: "{2}{B}", type: "Creature — Zombie Knight", pt: "3/2",
    text: "Whenever a nontoken creature you control dies, Midnight Reaper deals 1 damage to you and you draw a card.",
    triggers: [{
      on: "dies", when: (g, s, ev, lki) => !ev.lki.isToken && ev.lki.controller === ctrlOf(s, ev, lki),
      do: (g, s, ev, { p }) => { g.damage(s, p, 1); drawLog(g, p, 1, s); }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Butcher of Malakir", cost: "{5}{B}{B}", type: "Creature — Vampire Warrior", pt: "5/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Butcher of Malakir or another creature you control dies, each opponent sacrifices a creature of their choice.",
    triggers: [{
      on: "dies", when: (g, s, ev, lki) => ev.o === s || ev.lki.controller === ctrlOf(s, ev, lki),
      do: (g, s, ev, { p }) => eachOpponentSacrifices(g, p, 1, s)
    }],
    ai: { priority: 7, threat: 2 }
  });

  D({
    name: "Corpse Augur", cost: "{3}{B}", type: "Creature — Zombie Wizard", pt: "4/2",
    text: "When Corpse Augur dies, you draw X cards and you lose X life, where X is the number of creature cards in target player's graveyard.",
    triggers: [{
      on: "dies", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = g.targetOptions(p, { kind: "player" }, s);
        if (!opts.length) return;
        const q = await g.ask(p, { type: "target", prompt: "Corpse Augur: choose target player. You draw a card and lose 1 life for each creature card in their graveyard.", options: opts, purpose: "augurPlayer", src: s, spec: { kind: "player" } });
        if (!q || q.lost) return;
        const x = q.graveyard.filter(creatureCard).length;
        if (!x) { g.log(`${q.name} has no creature cards in their graveyard (Corpse Augur).`, { p, cards: [s.def.name] }); return; }
        drawLog(g, p, x, s);
        g.loseLife(p, x, s);
      }
    }],
    ai: {
      priority: 5,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "augurPlayer") return undefined;
        const x = q => q.graveyard.filter(creatureCard).length;
        const safe = q => x(q) <= Math.max(0, p.life - 8) && x(q) <= Math.max(0, p.library.length - 4);
        const opts = req.options.filter(q => g.isPlayer(q));
        const ok = opts.filter(safe).sort((a, b) => x(b) - x(a));
        return ok[0] || opts.slice().sort((a, b) => x(a) - x(b))[0];
      })
    }
  });

  D({
    name: "Eloise, Nephalia Sleuth", cost: "{3}{U}{B}", type: "Legendary Creature — Human Rogue", pt: "4/4",
    text: "Whenever another creature you control dies, investigate.\nWhenever you sacrifice a token, surveil 1.",
    triggers: [
      { on: "dies", when: (g, s, ev, lki) => ev.o !== s && ev.lki.controller === ctrlOf(s, ev, lki), do: (g, s, ev, { p }) => investigate(g, p) },
      { on: "sacrifice", when: (g, s, ev) => ev.p === s.controller && ev.o.isToken, do: (g, s, ev, { p }) => surveil1(g, p, s) }
    ],
    ai: { priority: 6, confirm: topConfirm }
  });

  D({
    name: "Open the Graves", cost: "{3}{B}{B}", type: "Enchantment",
    text: "Whenever a nontoken creature you control dies, create a 2/2 black Zombie creature token.",
    triggers: [{ on: "dies", when: (g, s, ev) => !ev.lki.isToken && ev.lki.controller === s.controller, do: (g, s, ev, { p }) => g.createToken(p, T.zombie) }],
    ai: { priority: 6 }
  });

  const GEIST = new WeakMap();               // Prowling Geistcatcher -> { zc, cards: [{ c, zc }] }
  D({
    name: "Prowling Geistcatcher", cost: "{3}{B}", type: "Creature — Human Rogue", pt: "2/4",
    text: "Whenever you sacrifice another creature, exile it. If that creature was a token, put a +1/+1 counter on Prowling Geistcatcher.\nWhen Prowling Geistcatcher leaves the battlefield, return each card exiled with it to the battlefield under your control.",
    triggers: [
      {
        on: "sacrifice",
        when: (g, s, ev) => {
          if (ev.p !== s.controller || ev.o === s || !g.isCreature(ev.o)) return false;
          ev.geistZc = ev.o.zc; ev.geistToken = ev.o.isToken;
          return true;
        },
        do: (g, s, ev) => {
          const o = ev.o;
          if (ev.geistToken) { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); return; }
          if (o.zone !== "graveyard" || o.zc !== ev.geistZc + 1 || !o.owner.graveyard.includes(o)) return;
          g.moveTo(o, "exile");
          g.log(`Prowling Geistcatcher exiles ${o.def.name}.`, { p: s.controller, cards: [o.def.name] });
          if (s.zone !== "battlefield") return;
          let rec = GEIST.get(s);
          if (!rec || rec.zc !== s.zc) { rec = { zc: s.zc, cards: [] }; GEIST.set(s, rec); }
          rec.cards.push({ c: o, zc: o.zc });
        }
      },
      {
        on: "leaves", self: true,
        when: (g, s, ev) => {
          const rec = GEIST.get(s);
          GEIST.delete(s);
          ev.geistCards = rec && rec.zc === s.zc - 1 ? rec.cards : [];
          return ev.geistCards.length > 0;
        },
        do: (g, s, ev, { p }) => {
          const back = ev.geistCards.filter(x => x.c.zone === "exile" && x.c.zc === x.zc && !x.c.owner.lost).map(x => x.c);
          if (!back.length || p.lost) return;
          g.putOntoBattlefield(back, p);
          g.log(`${p.name} returns ${back.map(c => c.def.name).join(", ")} to the battlefield (Prowling Geistcatcher).`, { p, cards: back.map(c => c.def.name) });
        }
      }
    ],
    ai: { priority: 6 }
  });

  /* ================================================================ Zombies with a job */
  D({
    name: "Cleaver Skaab", cost: "{3}{U}", type: "Creature — Zombie Horror", pt: "2/4",
    text: "{3}, {T}, Sacrifice another Zombie: Create two tokens that are copies of the sacrificed creature.",
    triggers: [{
      // remembers the last creature its controller sacrificed (never triggers)
      on: "sacrifice", when: (g, s, ev) => { if (ev.p === s.controller) s.state.lastSac = ev.o; return false; }, do: () => {}
    }],
    abilities: [{
      label: "Copy a sacrificed Zombie", cost: "{3}", tap: true,
      sacCost: { filter: (g, c, src) => c !== src && c.controller === src.controller && zNow(g, c), prompt: "Cleaver Skaab: sacrifice another Zombie" },
      do: (g, s, ctx) => {
        const src = s.state.lastSac;
        s.state.lastSac = null;
        if (src) g.copyToken(ctx.p, src, { count: 2 });
      },
      ai: { use: (g, p, o, ctx) => (endBeforeMe(g, p, ctx) || (ctx.window === "main2" && g.active === p)) && bestCopy(g, p, o) != null }
    }],
    ai: {
      priority: 6,
      target: targetHook((g, p, req) => (req.purpose === "sacrifice" && req.src && req.src.def.name === "Cleaver Skaab" ? bestCopy(g, p, req.src, req.options) || undefined : undefined))
    }
  });
  /* What two copies of a creature are worth (Cleaver Skaab). */
  const COPY_WORTH = {
    "Ravenous Rotbelly": 6, "Geralf's Mindcrusher": 6, "Eternal Skylord": 5, "Spark Reaper": 5, "Noosegraf Mob": 5, "Tomb Tyrant": 5,
    "Cemetery Reaper": 5, "Death Baron": 5, "Diregraf Captain": 5, "Lord of the Accursed": 5, "Fleshbag Marauder": 4, "Gleaming Overseer": 4,
    "Gravedigger": 4, "Hordewing Skaab": 4, "Gravespawn Sovereign": 4, "Corpse Augur": 3, "Undead Augur": 3, "Midnight Reaper": 3,
    "Diregraf Colossus": 3, "Forgotten Creation": 3, "Stitcher's Supplier": 2, "Cryptbreaker": 2, "Liliana's Devotee": 3
  };
  function copyWorth(g, p, o) {
    if (o.def.legendary || o.isCommander) return -10;
    if (o.isToken && !o.copyDef) {
      if (o.def.subtypes.includes("Army")) return -5;        // copies of an Army are 0/0
      return g.kw(o, "decayed") ? 2 : 2 + (o.def.pt ? o.def.pt[0] : 0) * 0.5;
    }
    const w = COPY_WORTH[baseDef(o).name];
    return w != null ? w : 2 + valueOf(g, o) * 0.15;
  }
  function bestCopy(g, p, src, options) {
    const opts = options || g.battlefield.filter(c => c !== src && c.controller === p && zNow(g, c));
    let best = null, bs = 1.9;
    for (const o of opts) { const s = copyWorth(g, p, o) - (o.isToken ? 0 : 1); if (s > bs) { bs = s; best = o; } }
    return best;
  }

  D({
    name: "Diregraf Colossus", cost: "{2}{B}", type: "Creature — Zombie Giant", pt: "2/2",
    text: "Diregraf Colossus enters with a +1/+1 counter on it for each Zombie card in your graveyard.\nWhenever you cast a Zombie spell, create a tapped 2/2 black Zombie creature token.",
    etbCounters: (g, o) => ({ p1: o.controller.graveyard.filter(c => zDef(c.def)).length }),
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && zDef(ev.o.def), do: (g, s, ev, { p }) => g.createToken(p, T.zombie, { tapped: true }) }],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Noosegraf Mob", cost: "{4}{B}{B}", type: "Creature — Zombie Horror", pt: "0/0",
    text: "Noosegraf Mob enters with five +1/+1 counters on it.\nWhenever a player casts a spell, remove a +1/+1 counter from Noosegraf Mob. If you do, create a 2/2 black Zombie creature token.",
    etbCounters: () => ({ p1: 5 }),
    triggers: [{
      on: "cast",
      do: (g, s) => { if (s.zone === "battlefield" && g.removeCounters(s, "p1", 1) === 1) g.createToken(s.controller, T.zombie); }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Eternal Skylord", cost: "{4}{U}", type: "Creature — Zombie Wizard", pt: "3/3",
    text: "When Eternal Skylord enters, amass Zombies 2. (Put two +1/+1 counters on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)\nZombie tokens you control have flying.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => amass(g, p, 2, s) }],
    statics: [{ applies: (g, s, o) => o.isToken && o.controller === s.controller && g.isCreature(o) && zq(o), kw: ["flying"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Gleaming Overseer", cost: "{1}{U}{B}", type: "Creature — Zombie Wizard", pt: "1/4",
    text: "When Gleaming Overseer enters, amass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)\nZombie tokens you control have hexproof and menace.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => amass(g, p, 1, s) }],
    statics: [{ applies: (g, s, o) => o.isToken && o.controller === s.controller && g.isCreature(o) && zq(o), kw: ["hexproof", "menace"] }],
    ai: { priority: 7 }
  });

  D({
    name: "Hordewing Skaab", cost: "{4}{U}", type: "Creature — Zombie Horror", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nOther Zombies you control have flying.\nWhenever one or more Zombies you control deal combat damage to one or more of your opponents, you may draw cards equal to the number of opponents dealt damage this way. If you do, discard that many cards.",
    statics: [{ applies: otherZombieCreatures, kw: ["flying"] }],
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => {
        const a = ev.src;
        if (!a || a.controller !== s.controller || !g.isCreature(a) || !zNow(g, a)) return false;
        if (!ev.p || ev.p === s.controller) return false;
        const set = s.state.hordeHit || (s.state.hordeHit = new Set());
        const first = set.size === 0;
        set.add(ev.p.id);
        if (first) ev.hordeSet = set;
        return first;
      },
      do: async (g, s, ev, { p }) => {
        const n = (ev.hordeSet && ev.hordeSet.size) || 1;
        if (s.state.hordeHit === ev.hordeSet) s.state.hordeHit = null;
        const ok = await g.ask(p, { type: "confirm", prompt: `Hordewing Skaab: draw ${plural(n, "card")}, then discard ${plural(n, "card")}?`, src: s, purpose: "loot" });
        if (!ok) return;
        if (!drawLog(g, p, n, s)) return;
        const k = Math.min(n, p.hand.length);
        const pick = await g.ask(p, { type: "cards", prompt: `Hordewing Skaab: discard ${plural(k, "card")}`, options: p.hand.slice(), min: k, max: k, purpose: "discard", src: s });
        let list = (pick || []).filter(c => p.hand.includes(c)).slice(0, k);
        if (list.length < k) list = list.concat(p.hand.filter(c => !list.includes(c)).slice(0, k - list.length));
        for (const c of list) g.discard(p, c);
      }
    }],
    ai: { priority: 7, threat: 1, confirm: (g, p, req) => req.purpose !== "loot" || p.library.length > 8 }
  });

  D({
    name: "Fleshbag Marauder", cost: "{2}{B}", type: "Creature — Zombie Warrior", pt: "3/1",
    text: "When Fleshbag Marauder enters, each player sacrifices a creature of their choice.",
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => { for (const q of g.orderFrom(p)) await edict(g, q, 1, s); } }],
    ai: {
      priority: 6, target: commonHook,
      cast: (g, p) => (g.opponents(p).some(q => g.creatures(q).length) || p.hand.length >= 6 ? undefined : false)
    }
  });

  D({
    name: "Forgotten Creation", cost: "{3}{U}", type: "Creature — Zombie Horror", pt: "3/3",
    keywords: ["skulk"],
    text: "Skulk (This creature can't be blocked by creatures with greater power.)\nAt the beginning of your upkeep, you may discard all the cards in your hand. If you do, draw that many cards.",
    canBeBlockedBy: (g, a, b) => g.power(b) <= g.power(a),
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller && s.controller.hand.length > 0,
      do: async (g, s, ev, { p }) => {
        const n = p.hand.length;
        if (!n) return;
        const ok = await g.ask(p, { type: "confirm", prompt: `Forgotten Creation: discard your hand (${plural(n, "card")}) and draw that many?`, src: s, purpose: "wheel" });
        if (!ok) return;
        for (const c of p.hand.slice()) g.discard(p, c);
        drawLog(g, p, n, s);
      }
    }],
    ai: {
      priority: 5,
      confirm: (g, p, req) => {
        if (req.purpose !== "wheel") return true;
        const hand = p.hand, lands = landsOf(g, p).length;
        if (hand.length < 2 || p.library.length < hand.length + 8) return false;
        const dead = hand.filter(c => (c.def.types.includes("Land") && lands >= 6) || c.def.mv > lands + 2).length;
        return dead * 2 >= hand.length;
      }
    }
  });

  const gisaCastable = (g, p) => p.graveyard.filter(c => zombieCreatureCard(c) && g.castOptions(p, c).length > 0);
  D({
    name: "Gisa and Geralf", cost: "{2}{U}{B}", type: "Legendary Creature — Human Wizard", pt: "4/4",
    text: "When Gisa and Geralf enters, mill four cards.\nOnce during each of your turns, you may cast a Zombie creature spell from your graveyard.",
    note: "Casting from the graveyard is an action on Gisa and Geralf, at sorcery speed. You pay the Zombie's cost as usual.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => millCards(g, p, 4) }],
    abilities: [{
      label: "Cast a Zombie from your graveyard", timing: "sorcery",
      condition: (g, s, p) => g.active === p && s.state.gisaUsed !== g.turn && gisaCastable(g, p).length > 0,
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const opts = gisaCastable(g, p);
        if (!opts.length) return;
        const c = await g.ask(p, { type: "target", prompt: "Gisa and Geralf: cast a Zombie creature spell from your graveyard", options: opts, optional: true, purpose: "gisaCast", src: s });
        if (!c || !opts.includes(c)) return;
        s.state.gisaUsed = g.turn;
        if (!(await g.cast(p, c)) && s.zone === "battlefield") s.state.gisaUsed = null;
      },
      ai: { use: (g, p, o, ctx) => myMain(g, p, ctx) && !g.battlefield.some(x => x.controller === p && x.def.name === "Rooftop Storm") }
    }],
    ai: {
      priority: 7, threat: 1,
      target: targetHook((g, p, req) => (req.purpose === "gisaCast" ? req.options.slice().sort((a, b) => cardWorth(b) - cardWorth(a))[0] : undefined)),
      // cast from the graveyard before spending mana on the hand (Rooftop Storm does it for free instead)
      plan: (g, p, o, ctx) => {
        if (o.zone !== "battlefield" || o.controller !== p || !myMain(g, p, ctx)) return null;
        if (g.battlefield.some(x => x.controller === p && x.def.name === "Rooftop Storm")) return null;
        const a = (ctx.actions || []).find(x => x.type === "activate" && x.card === o);
        if (!a) return null;
        const best = gisaCastable(g, p).sort((x, y) => cardWorth(y) - cardWorth(x))[0];
        return best && cardWorth(best) >= 6 ? { type: "activate", card: o, idx: a.idx, maxTries: 1 } : null;
      }
    }
  });
  const gisaReady = (g, p) => g.active === p && g.battlefield.find(o => o.controller === p && o.def.name === "Gisa and Geralf" && o.state.gisaUsed !== g.turn) || null;

  const GOREX = new WeakMap();               // Gorex -> [{ c, zc }] exiled with it
  const gorexCount = p => Math.min(3, p.graveyard.filter(creatureCard).length);
  function gorexReturn(g, s, p) {
    const list = (GOREX.get(s) || []).filter(x => x.c.zone === "exile" && x.c.zc === x.zc);
    if (!list.length) return;
    const pick = list[g.rand(list.length)];
    GOREX.set(s, list.filter(x => x !== pick));
    g.moveTo(pick.c, "hand");
    g.log(`${pick.c.def.name} returns to ${pick.c.owner.name}'s hand (Gorex).`, { p, cards: [pick.c.def.name] });
  }
  D({
    name: "Gorex, the Tombshell", cost: "{6}{B}{B}", type: "Legendary Creature — Zombie Turtle", pt: "4/4",
    keywords: ["deathtouch"],
    text: "As an additional cost to cast this spell, you may exile any number of creature cards from your graveyard. This spell costs {2} less to cast for each card exiled this way.\nDeathtouch\nWhenever Gorex attacks or dies, choose a card at random exiled with Gorex and put that card into its owner's hand.",
    note: "It exiles as many creature cards from your graveyard as lower its cost the most (at most three), non-Zombies first.",
    costReduce: (g, p) => 2 * gorexCount(p),
    onCast: (g, p, o, item) => {
      if (item && item.isCopy) return;
      const n = gorexCount(p);
      const picks = p.graveyard.filter(creatureCard).sort((a, b) => (zDef(a.def) - zDef(b.def)) || (cardWorth(a) - cardWorth(b))).slice(0, n);
      const list = [];
      for (const c of picks) { g.moveTo(c, "exile"); list.push({ c, zc: c.zc }); }
      GOREX.set(o, list);
      if (list.length) g.log(`${p.name} exiles ${list.map(x => x.c.def.name).join(", ")} to cast Gorex for less.`, { p, cards: list.map(x => x.c.def.name) });
    },
    triggers: [
      { on: "attacks", self: true, do: (g, s, ev, { p }) => gorexReturn(g, s, p) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => { gorexReturn(g, s, p); GOREX.delete(s); } },
      { on: "leaves", self: true, when: (g, s, ev) => { if (ev.to !== "graveyard") GOREX.delete(s); return false; }, do: () => {} }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Gravespawn Sovereign", cost: "{4}{B}{B}", type: "Creature — Zombie", pt: "3/3",
    text: "Tap five untapped Zombies you control: Put target creature card from a graveyard onto the battlefield under your control.",
    abilities: [{
      label: "Tap five Zombies: reanimate",
      condition: (g, s, p) => untappedZombies(g, p).length >= 5,
      targets: [{ kind: "card", from: allGraveCreatures, purpose: "reanimate", prompt: "Gravespawn Sovereign: put target creature card from a graveyard onto the battlefield under your control" }],
      do: async (g, s, ctx) => {
        const p = ctx.p;
        if (await tapZombies(g, p, 5, s) < 5) return;
        const c = ctx.targets[0];
        if (!c || !ctx.legal[0] || c.zone !== "graveyard") return;
        g.putOntoBattlefield([c], p);
        g.log(`${p.name} puts ${c.def.name} from ${c.owner === p ? "their" : c.owner.name + "'s"} graveyard onto the battlefield.`, { p, cards: [c.def.name] });
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (!endBeforeMe(g, p, ctx) && !(ctx.window === "main2" && g.active === p && untappedZombies(g, p).length >= 8)) return false;
          const best = reanimatePick(g, p, allGraveCreatures(g));
          return !!best && best.def.mv >= 3;
        }
      }
    }],
    ai: { priority: 6, threat: 2, target: commonHook }
  });

  D({
    name: "Havengul Runebinder", cost: "{2}{U}{U}", type: "Creature — Human Wizard", pt: "2/2",
    text: "{2}{U}, {T}, Exile a creature card from your graveyard: Create a 2/2 black Zombie creature token, then put a +1/+1 counter on each Zombie creature you control.",
    abilities: [{
      label: "Exile a creature card: Zombie and counters", cost: "{2}{U}", tap: true,
      condition: (g, s, p) => p.graveyard.some(creatureCard),
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const opts = p.graveyard.filter(creatureCard);
        if (!opts.length) return;
        let c = await g.ask(p, { type: "target", prompt: "Havengul Runebinder: exile a creature card from your graveyard", options: opts, purpose: "exileCost", src: s });
        if (!c || !opts.includes(c)) c = opts[0];
        g.moveTo(c, "exile");
        g.log(`${p.name} exiles ${c.def.name} from their graveyard.`, { p, cards: [c.def.name] });
        g.createToken(p, T.zombie);
        for (const z of myZombies(g, p)) g.addCounters(z, "p1", 1, s);
      },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) || (ctx.window === "main2" && g.active === p) }
    }],
    ai: { priority: 6, threat: 1, target: commonHook }
  });

  D({
    name: "Overseer of the Damned", cost: "{5}{B}{B}", type: "Creature — Demon", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Overseer of the Damned enters, you may destroy target creature.\nWhenever a nontoken creature an opponent controls dies, create a tapped 2/2 black Zombie creature token.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, { kind: "creature", optional: true, purpose: "harm", prompt: "Overseer of the Damned: you may destroy target creature" }, s);
          if (t && t.zone === "battlefield") g.destroy(t, s);
        }
      },
      {
        on: "dies", when: (g, s, ev, lki) => !ev.lki.isToken && ev.lki.controller !== ctrlOf(s, ev, lki),
        do: (g, s, ev, { p }) => g.createToken(p, T.zombie, { tapped: true })
      }
    ],
    ai: { priority: 7, threat: 1 }
  });

  async function rotbellyEtb(g, s, p) {
    let n = 0;
    for (let i = 0; i < 3; i++) {
      const opts = zombiePermanents(g, p);
      if (!opts.length) break;
      const pick = await g.ask(p, { type: "target", prompt: `Ravenous Rotbelly: you may sacrifice a Zombie (${n} of up to three so far)`, options: opts, optional: true, purpose: "rotbelly", src: s });
      if (!pick || pick.zone !== "battlefield" || pick.controller !== p) break;
      if (g.sacrifice(pick)) n++;
    }
    if (!n) return;
    g.log(`Each opponent sacrifices ${plural(n, "creature")} (Ravenous Rotbelly).`, { p, cards: [s.def.name] });
    await eachOpponentSacrifices(g, p, n, s);
  }
  D({
    name: "Ravenous Rotbelly", cost: "{4}{B}", type: "Creature — Zombie Horror", pt: "4/5",
    text: "When Ravenous Rotbelly enters, you may sacrifice up to three Zombies. When you sacrifice one or more Zombies this way, each opponent sacrifices that many creatures of their choice.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => rotbellyEtb(g, s, p) }],
    ai: {
      priority: 7,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "rotbelly") return undefined;
        if (!g.opponents(p).some(q => g.creatures(q).length)) return null;
        const best = cheapest(g, p, req.options.filter(o => o !== req.src));
        const big = g.opponents(p).some(q => g.creatures(q).some(c => threatOf(g, c, p) >= 6));
        return best && fodderScore(g, p, best) <= (big ? 2.5 : 1.5) ? best : null;
      })
    }
  });

  D({
    name: "Ruthless Deathfang", cost: "{4}{U}{B}", type: "Creature — Dragon", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhenever you sacrifice a creature, target opponent sacrifices a creature of their choice.",
    triggers: [{
      on: "sacrifice", when: (g, s, ev) => ev.p === s.controller && g.isCreature(ev.o),
      do: async (g, s, ev, { p }) => {
        const q = await chooseOpponent(g, p, s, "Ruthless Deathfang: target opponent sacrifices a creature", "deathfang");
        if (q && !q.lost) await edict(g, q, 1, s);
      }
    }],
    ai: {
      priority: 7, threat: 1,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "deathfang") return undefined;
        const opts = req.options.filter(q => g.isPlayer(q));
        const withC = opts.filter(q => g.creatures(q).length);
        if (!withC.length) return opts[0];
        // the opponent whose weakest creature is still worth the most
        return withC.slice().sort((a, b) => Math.min(...g.creatures(b).map(c => valueOf(g, c))) - Math.min(...g.creatures(a).map(c => valueOf(g, c))))[0];
      })
    }
  });

  D({
    name: "Spark Reaper", cost: "{2}{B}", type: "Creature — Zombie", pt: "2/3",
    text: "As an additional cost to cast this spell, sacrifice a creature or planeswalker.\nWhen Spark Reaper enters, you gain 3 life and draw a card.",
    note: "The creature or planeswalker is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.battlefield.some(o => o.controller === p && (g.isCreature(o) || g.isPlaneswalker(o))),
    onCast: async (g, p, o, item) => {
      if (item && item.isCopy) return;
      const opts = g.battlefield.filter(c => c.controller === p && (g.isCreature(c) || g.isPlaneswalker(c)));
      if (!opts.length) return;
      let pick = await g.ask(p, { type: "target", prompt: "Spark Reaper: sacrifice a creature or planeswalker (additional cost)", options: opts, purpose: "sacrifice", src: o });
      if (!pick || !opts.includes(pick)) pick = cheapest(g, p, opts);
      g.sacrifice(pick);
    },
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { g.gainLife(p, 3, s); drawLog(g, p, 1, s); } }],
    ai: { priority: 6, target: commonHook, cast: (g, p) => (hasFodder(g, p, 1.5) ? undefined : false) }
  });

  D({
    name: "Stitcher Geralf", cost: "{3}{U}{U}", type: "Legendary Creature — Human Wizard", pt: "3/4",
    text: "{2}{U}, {T}: Each player mills three cards. Exile up to two creature cards put into graveyards this way. Create an X/X blue Zombie creature token, where X is the total power of the cards exiled this way.",
    abilities: [{
      label: "Each player mills three", cost: "{2}{U}", tap: true,
      do: async (g, s, ctx) => {
        const p = ctx.p;
        let milled = [];
        for (const q of g.orderFrom(p)) milled = milled.concat(millCards(g, q, 3));
        const pool = milled.filter(c => creatureCard(c) && c.zone === "graveyard");
        const picked = [];
        for (let i = 0; i < 2; i++) {
          const opts = pool.filter(c => !picked.includes(c) && c.zone === "graveyard");
          if (!opts.length) break;
          const c = await g.ask(p, { type: "target", prompt: "Stitcher Geralf: exile up to two creature cards milled this way", options: opts, optional: true, purpose: "stitch", src: s });
          if (!c || !opts.includes(c)) break;
          picked.push(c);
        }
        let x = 0;
        for (const c of picked) { x += Math.max(0, c.def.pt ? c.def.pt[0] : 0); g.moveTo(c, "exile"); }
        if (picked.length) g.log(`${p.name} exiles ${picked.map(c => c.def.name).join(" and ")} (Stitcher Geralf).`, { p, cards: picked.map(c => c.def.name) });
        g.createToken(p, blueZombie(x));
      },
      ai: { use: (g, p, o, ctx) => p.library.length >= 15 && (endBeforeMe(g, p, ctx) || (ctx.window === "main2" && g.active === p)) }
    }],
    ai: {
      priority: 6, threat: 1,
      target: targetHook((g, p, req) => {
        if (req.purpose !== "stitch") return undefined;
        const pw = c => (c.def.pt ? c.def.pt[0] : 0);
        const best = req.options.slice().sort((a, b) => (pw(b) - pw(a)) || ((b.owner !== p) - (a.owner !== p)))[0];
        return best && pw(best) > 0 ? best : null;
      })
    }
  });

  D({
    name: "Stitcher's Supplier", cost: "{B}", type: "Creature — Zombie", pt: "1/1",
    text: "When Stitcher's Supplier enters or dies, mill three cards.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => millCards(g, p, 3) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => millCards(g, p, 3) }
    ],
    ai: { priority: 5 }
  });

  const UNDYING = {
    on: "dies", self: true,
    when: (g, s, ev) => { if (ev.lki.counters.p1) return false; s.state.undyingZc = s.zc; return true; },
    do: (g, s) => {
      if (s.zone !== "graveyard" || s.state.undyingZc !== s.zc || !s.owner.graveyard.includes(s) || s.owner.lost) return;
      g.log(`${s.def.name} returns to the battlefield with a +1/+1 counter (undying).`, { p: s.owner, cards: [s.def.name] });
      g.putOntoBattlefield([s], s.owner, { counters: { p1: 1 } });
    }
  };
  D({
    name: "Geralf's Mindcrusher", cost: "{4}{U}{U}", type: "Creature — Zombie Horror", pt: "5/5",
    keywords: ["undying"],
    text: "When Geralf's Mindcrusher enters, target player mills five cards.\nUndying (When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const q = await g.chooseTarget(p, { kind: "player", purpose: "harm", prompt: "Geralf's Mindcrusher: target player mills five cards" }, s);
          if (q && !q.lost) millCards(g, q, 5);
        }
      },
      UNDYING
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Cryptbreaker", cost: "{B}", type: "Creature — Zombie", pt: "1/1",
    text: "{1}{B}, {T}, Discard a card: Create a 2/2 black Zombie creature token.\nTap three untapped Zombies you control: You draw a card and you lose 1 life.",
    abilities: [
      {
        label: "Discard a card: make a Zombie", cost: "{1}{B}", tap: true, discard: 1,
        do: (g, s, ctx) => g.createToken(ctx.p, T.zombie),
        ai: {
          use: (g, p, o, ctx) => {
            if (!endBeforeMe(g, p, ctx) && !(ctx.window === "main2" && g.active === p)) return false;
            const lands = landsOf(g, p).length;
            return p.hand.length >= 6 || p.hand.some(c => c.def.types.includes("Land") && lands >= 6);
          }
        }
      },
      {
        label: "Tap three Zombies: draw a card",
        condition: (g, s, p) => untappedZombies(g, p).length >= 3,
        do: async (g, s, ctx) => {
          if (await tapZombies(g, ctx.p, 3, s) < 3) return;
          drawLog(g, ctx.p, 1, s);
          g.loseLife(ctx.p, 1, s);
        },
        ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.life >= 12 && p.library.length >= 12 }
      }
    ],
    ai: { priority: 5 }
  });

  D({
    name: "Gravedigger", cost: "{3}{B}", type: "Creature — Zombie", pt: "2/2",
    text: "When Gravedigger enters, you may return target creature card from your graveyard to your hand.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "card", from: (g2, pl) => pl.graveyard.filter(creatureCard), optional: true, purpose: "reanimate", prompt: "Gravedigger: you may return target creature card from your graveyard to your hand" }, s);
        if (t && t.zone === "graveyard" && t.owner === p) {
          g.moveTo(t, "hand");
          g.log(`${p.name} returns ${t.def.name} to their hand.`, { p, cards: [t.def.name] });
        }
      }
    }],
    ai: { priority: 5, target: commonHook }
  });

  /* ================================================================ Liliana */
  D({
    name: "Liliana, Death's Majesty", cost: "{3}{B}{B}", type: "Legendary Planeswalker — Liliana", loyalty: 5,
    text: "+1: Create a 2/2 black Zombie creature token. Mill two cards.\n−3: Return target creature card from your graveyard to the battlefield. That creature is a black Zombie in addition to its other colors and types.\n−7: Destroy all non-Zombie creatures.",
    abilities: [
      { label: "+1: Zombie token, mill two", loyalty: 1, do: (g, s, ctx) => { g.createToken(ctx.p, T.zombie); millCards(g, ctx.p, 2); } },
      {
        label: "−3: Return a creature as a Zombie", loyalty: -3,
        targets: [{ kind: "card", from: (g, p) => p.graveyard.filter(creatureCard), purpose: "reanimate", prompt: "Liliana: return target creature card from your graveyard to the battlefield" }],
        do: (g, s, ctx) => {
          const c = ctx.targets[0];
          if (!c || !ctx.legal[0] || c.zone !== "graveyard") return;
          g.putOntoBattlefield([c], ctx.p);
          zombify(g, c, false);
          g.log(`${c.def.name} returns to the battlefield as a black Zombie.`, { p: ctx.p, cards: [c.def.name] });
        },
        ai: {
          use: (g, p, o) => {
            const best = reanimatePick(g, p, p.graveyard.filter(creatureCard));
            if (!best) return false;
            return best.def.mv >= 4 && ((o.counters.loyalty || 0) >= 5 || best.def.mv >= 6);
          }
        }
      },
      {
        label: "−7: Destroy all non-Zombie creatures", loyalty: -7,
        do: (g, s, ctx) => {
          const list = g.battlefield.filter(o => g.isCreature(o) && !zNow(g, o));
          const n = g.destroyAll(list, s);
          g.log(`Liliana destroys ${plural(n, "non-Zombie creature")}.`, { p: ctx.p, cards: [s.def.name] });
        },
        ai: {
          use: (g, p) => {
            const hit = c => g.isCreature(c) && !zNow(g, c) && !g.kw(c, "indestructible");
            const theirs = g.battlefield.filter(c => c.controller !== p && hit(c)).reduce((n, c) => n + valueOf(g, c), 0);
            const mine = g.battlefield.filter(c => c.controller === p && hit(c)).reduce((n, c) => n + valueOf(g, c), 0);
            return theirs >= 10 && theirs >= mine * 2;
          }
        }
      }
    ],
    ai: { priority: 7, threat: 2, target: commonHook }
  });

  /* ================================================================ instants and sorceries */
  D({
    name: "Aetherspouts", cost: "{3}{U}{U}", type: "Instant",
    text: "For each attacking creature, its owner puts it on their choice of the top or bottom of their library.",
    spell: {
      do: async (g, ctx) => {
        const list = g.combat ? g.combat.attackers.filter(a => a.zone === "battlefield") : [];
        let top = 0, bottom = 0;
        for (const a of list) {
          if (a.zone !== "battlefield") continue;
          let where = "bottom";
          if (!a.isToken && !a.isCommander) {
            where = await g.ask(a.owner, { type: "option", prompt: `Aetherspouts: put ${a.def.name} on the top or the bottom of your library?`, options: [{ id: "top", label: "Top" }, { id: "bottom", label: "Bottom" }], purpose: "spoutsSpot", src: ctx.o, card: a });
          }
          g.tuck(a, where !== "top");
          if (where === "top") top++; else bottom++;
        }
        g.log(`Aetherspouts sweeps away ${plural(list.length, "attacking creature")}${top ? ` (${top} on top of a library)` : ""}.`, { p: ctx.p, cards: ["Aetherspouts"] });
      }
    },
    ai: {
      cast: () => false,   // the Wilhelt plan casts it when a big attack comes in
      option: (g, p, req) => (req.purpose === "spoutsSpot" && req.card ? (req.card.def.mv >= 4 ? "top" : "bottom") : undefined)
    }
  });

  const drownDrawSpec = { kind: "player", purpose: "help", prompt: "Drown in Dreams: target player draws X cards" };
  const drownMillSpec = { kind: "player", purpose: "harm", prompt: "Drown in Dreams: target player mills twice X cards" };
  const drownDraw = (g, ctx, i) => { const q = ctx.targets[i]; if (q && ctx.legal[i] && !q.lost) drawLog(g, q, ctx.x, ctx.o); };
  const drownMill = (g, ctx, i) => { const q = ctx.targets[i]; if (q && ctx.legal[i] && !q.lost) millCards(g, q, ctx.x * 2); };
  D({
    name: "Drown in Dreams", cost: "{X}{2}{U}", type: "Instant",
    text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Target player draws X cards.\n• Target player mills twice X cards.",
    minX: 1,
    modes: [
      { label: "Target player draws X cards", targets: [drownDrawSpec], do: (g, ctx) => drownDraw(g, ctx, 0) },
      { label: "Target player mills twice X cards", targets: [drownMillSpec], do: (g, ctx) => drownMill(g, ctx, 0) },
      {
        label: "Both (you control a commander)", canChoose: (g, p) => g.battlefield.some(o => o.controller === p && o.isCommander),
        targets: [drownDrawSpec, drownMillSpec], do: (g, ctx) => { drownDraw(g, ctx, 0); drownMill(g, ctx, 1); }
      }
    ],
    ai: {
      never: true,         // the Wilhelt plan casts it at the end of the turn before ours
      mode: (g, p) => (g.battlefield.some(o => o.controller === p && o.isCommander) ? 2 : 0),
      x: (g, p, o, xMax) => Math.max(1, Math.min(xMax, p.library.length - 10))
    }
  });

  D({
    name: "Go for the Throat", cost: "{1}{B}", type: "Instant",
    text: "Destroy target nonartifact creature.",
    spell: {
      targets: [{ kind: "creature", filter: (g, o) => !g.isArtifact(o), purpose: "harm", prompt: "Go for the Throat: destroy target nonartifact creature" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
    },
    ai: { removal: true, minThreat: 4, priority: 6 }
  });

  D({
    name: "Feed the Swarm", cost: "{1}{B}", type: "Sorcery",
    text: "Destroy target creature or enchantment an opponent controls. You lose life equal to that permanent's mana value.",
    spell: {
      targets: [{ kind: "creatureOrEnchantment", opp: true, purpose: "harm", prompt: "Feed the Swarm: destroy target creature or enchantment an opponent controls" }],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0];
        const mv = g.mvOf(t);
        g.destroy(t, ctx.o);
        if (mv > 0) g.loseLife(ctx.p, mv, ctx.o);
      }
    },
    ai: { removal: true, minThreat: 4, hold: (g, p) => p.life <= 10 }
  });

  D({
    name: "Army of the Damned", cost: "{5}{B}{B}{B}", type: "Sorcery",
    text: "Create thirteen tapped 2/2 black Zombie creature tokens.\nFlashback {7}{B}{B}{B} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashback: "{7}{B}{B}{B}",
    spell: { do: (g, ctx) => g.createToken(ctx.p, T.zombie, { count: 13, tapped: true }) },
    ai: { priority: 9 }
  });

  D({
    name: "Dark Salvation", cost: "{X}{X}{B}", type: "Sorcery",
    text: "Target player creates X 2/2 black Zombie creature tokens, then up to one target creature gets -1/-1 until end of turn for each Zombie that player controls.",
    minX: 1,
    spell: {
      targets: [
        { kind: "player", purpose: "help", prompt: "Dark Salvation: target player creates X Zombie tokens" },
        { kind: "creature", optional: true, purpose: "salvation", prompt: "Dark Salvation: up to one target creature gets -1/-1 for each Zombie that player controls" }
      ],
      do: (g, ctx) => {
        const q = ctx.targets[0];
        if (!q || !ctx.legal[0] || q.lost) return;
        if (ctx.x > 0) g.createToken(q, T.zombie, { count: ctx.x });
        const t = ctx.targets[1];
        if (!t || !ctx.legal[1] || t.zone !== "battlefield") return;
        const n = zombiePermanents(g, q).length;
        if (n > 0) { g.pump(t, -n, -n); g.log(`${t.def.name} gets -${n}/-${n} until end of turn.`, { p: ctx.p, cards: [t.def.name] }); }
      }
    },
    ai: {
      priority: 6,
      cast: (g, p, o) => (g.maxX(p, g.spellCost(p, o, {}), 2) >= 2 ? undefined : false),
      x: (g, p, o, xMax) => { o.state.aiX = xMax; return xMax; },
      target: targetHook((g, p, req) => {
        if (req.purpose !== "salvation") return undefined;
        const n = zombiePermanents(g, p).length + ((req.src && req.src.state.aiX) || 0);
        const kill = req.options.filter(c => c.controller !== p && !g.kw(c, "indestructible") && g.toughness(c) <= n)
          .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
        return kill[0] || null;
      })
    }
  });

  D({
    name: "Distant Melody", cost: "{3}{U}", type: "Sorcery",
    text: "Choose a creature type. Draw a card for each permanent you control of that type.",
    note: "You choose among the creature types of the permanents you control.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const counts = new Map([["Zombie", 0]]);
        for (const o of g.controlled(p)) {
          if (!g.isCreature(o) && !o.def.types.includes("Kindred")) continue;
          for (const t of g.ch(o).subtypes) counts.set(t, 0);
        }
        for (const t of counts.keys()) counts.set(t, g.controlled(p, o => g.hasSub(o, t)).length);
        const options = [...counts].sort((a, b) => b[1] - a[1]).map(([t, n]) => ({ id: t, label: `${t} (${n})` }));
        let t = await g.ask(p, { type: "option", prompt: "Distant Melody: choose a creature type", options, purpose: "creatureType", src: ctx.o });
        if (!counts.has(t)) t = options[0].id;
        g.log(`${p.name} chooses ${t}.`, { p, cards: ["Distant Melody"] });
        const n = g.controlled(p, o => g.hasSub(o, t)).length;
        if (n) drawLog(g, p, n, ctx.o);
      }
    },
    ai: { priority: 6, draw: true, cast: (g, p) => { const n = zombiePermanents(g, p).length; return n >= 3 && p.library.length > n + 8 ? undefined : false; } }
  });

  D({
    name: "Dread Summons", cost: "{X}{B}{B}", type: "Sorcery",
    text: "Each player mills X cards. For each creature card put into a graveyard this way, you create a tapped 2/2 black Zombie creature token.",
    spell: {
      do: (g, ctx) => {
        let n = 0;
        for (const q of g.orderFrom(ctx.p)) n += millCards(g, q, ctx.x).filter(c => creatureCard(c) && c.zone === "graveyard").length;
        if (n) g.createToken(ctx.p, T.zombie, { count: n, tapped: true });
        else g.log("No creature cards were milled (Dread Summons).", { p: ctx.p, cards: ["Dread Summons"] });
      }
    },
    ai: {
      priority: 6,
      cast: (g, p, o) => (g.maxX(p, g.spellCost(p, o, {}), 1) >= 3 && p.library.length >= 18 ? undefined : false),
      x: (g, p, o, xMax) => Math.max(0, Math.min(xMax, p.library.length - 15))
    }
  });

  D({
    name: "Empty the Laboratory", cost: "{X}{U}{U}", type: "Sorcery",
    text: "Sacrifice X Zombies, then reveal cards from the top of your library until you reveal a number of Zombie creature cards equal to the number of Zombies sacrificed this way. Put those cards onto the battlefield and the rest on the bottom of your library in a random order.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        let n = 0;
        for (let i = 0; i < ctx.x; i++) {
          const opts = zombiePermanents(g, p);
          if (!opts.length) break;
          let pick = await g.ask(p, { type: "target", prompt: `Empty the Laboratory: sacrifice a Zombie (${i + 1} of ${ctx.x})`, options: opts, purpose: "sacrifice", src: ctx.o });
          if (!pick || !opts.includes(pick)) pick = cheapest(g, p, opts);
          if (g.sacrifice(pick)) n++;
        }
        if (!n) return;
        const found = [], rest = [];
        for (const c of p.library) { if (found.length >= n) break; (zombieCreatureCard(c) ? found : rest).push(c); }
        g.log(`${p.name} reveals ${plural(found.length + rest.length, "card")} and finds ${found.length ? found.map(c => c.def.name).join(", ") : "no Zombie creature cards"}.`, { p, cards: found.map(c => c.def.name) });
        if (found.length) g.putOntoBattlefield(found, p);
        for (const c of rest) { const i = p.library.indexOf(c); if (i >= 0) p.library.splice(i, 1); }
        p.library.push(...g.shuffleArr(rest));
        g.bump();
      }
    },
    ai: {
      priority: 6,
      cast: (g, p) => (zombiePermanents(g, p).filter(o => fodderScore(g, p, o) <= 1.5).length >= 2 && p.library.length >= 15 ? undefined : false),
      x: (g, p, o, xMax) => Math.min(xMax, zombiePermanents(g, p).filter(z => fodderScore(g, p, z) <= 1.5).length),
      target: commonHook
    }
  });

  D({
    name: "Ghouls' Night Out", cost: "{3}{B}{B}", type: "Sorcery",
    text: "For each player, choose a creature card in that player's graveyard. Put those cards onto the battlefield under your control. They're black Zombies in addition to their other colors and types and they gain decayed.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const picks = [];
        for (const q of g.orderFrom(p)) {
          const opts = q.graveyard.filter(creatureCard);
          if (!opts.length) continue;
          let c = await g.ask(p, { type: "target", prompt: `Ghouls' Night Out: choose a creature card in ${q === p ? "your" : q.name + "'s"} graveyard`, options: opts, purpose: "reanimate", src: ctx.o });
          if (!c || !opts.includes(c)) c = opts[0];
          picks.push(c);
        }
        if (!picks.length) return;
        g.putOntoBattlefield(picks, p);
        for (const c of picks) zombify(g, c, true);
        g.log(`${picks.map(c => c.def.name).join(", ")} ${picks.length === 1 ? "joins" : "join"} ${p.name}'s side as decayed black Zombies.`, { p, cards: picks.map(c => c.def.name) });
      }
    },
    ai: {
      priority: 7, target: commonHook,
      cast: (g, p) => {
        let total = 0, n = 0;
        for (const q of g.players) {
          if (q.lost) continue;
          const opts = q.graveyard.filter(creatureCard);
          if (!opts.length) continue;
          n++; total += Math.max(...opts.map(cardWorth));
        }
        return n >= 2 && total >= 16 ? undefined : false;
      }
    }
  });

  D({
    name: "Hour of Eternity", cost: "{X}{X}{U}{U}{U}", type: "Sorcery",
    text: "Exile X target creature cards from your graveyard. For each card exiled this way, create a token that's a copy of that card, except it's a 4/4 black Zombie.",
    note: "The creature cards are chosen as the spell resolves.",
    minX: 1,
    canCast: (g, p) => p.graveyard.some(creatureCard),
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const opts = p.graveyard.filter(creatureCard);
        const k = Math.min(ctx.x, opts.length);
        if (!k) return;
        let picks = await g.ask(p, { type: "cards", prompt: `Hour of Eternity: exile ${plural(k, "creature card")} from your graveyard`, options: opts, min: k, max: k, purpose: "hourOfEternity", src: ctx.o });
        picks = (picks || []).filter(c => opts.includes(c)).slice(0, k);
        if (picks.length < k) picks = picks.concat(opts.filter(c => !picks.includes(c)).slice(0, k - picks.length));
        for (const c of picks) {
          if (c.zone !== "graveyard") continue;
          g.moveTo(c, "exile");
          const base = baseDef(c);
          const type = [...base.supertypes, ...base.types].join(" ") + " — Zombie";
          g.copyToken(p, c, { except: { pt: [4, 4], colors: ["B"], subtypes: ["Zombie"], type } });
        }
      }
    },
    ai: {
      priority: 7,
      cast: (g, p) => (p.graveyard.filter(creatureCard).length >= 2 ? undefined : false),
      x: (g, p, o, xMax) => Math.min(xMax, p.graveyard.filter(creatureCard).length)
    }
  });

  D({
    name: "Syphon Flesh", cost: "{4}{B}", type: "Sorcery",
    text: "Each other player sacrifices a creature of their choice. You create a 2/2 black Zombie creature token for each creature sacrificed this way.",
    spell: {
      do: async (g, ctx) => {
        let n = 0;
        for (const q of g.orderFrom(ctx.p).slice(1)) n += await edict(g, q, 1, ctx.o);
        if (n) g.createToken(ctx.p, T.zombie, { count: n });
      }
    },
    ai: { priority: 6, cast: (g, p) => (g.opponents(p).filter(q => g.creatures(q).length).length >= Math.min(2, g.opponents(p).length) ? undefined : false) }
  });

  D({
    name: "Zombie Apocalypse", cost: "{3}{B}{B}{B}", type: "Sorcery",
    text: "Return all Zombie creature cards from your graveyard to the battlefield tapped, then destroy all Humans.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        const back = p.graveyard.filter(zombieCreatureCard);
        if (back.length) {
          g.putOntoBattlefield(back, p, { tapped: true });
          g.log(`${p.name} returns ${plural(back.length, "Zombie")} to the battlefield tapped.`, { p, cards: back.map(c => c.def.name).slice(0, 6) });
        }
        const humans = g.battlefield.filter(o => g.isCreature(o) && g.hasSub(o, "Human"));
        if (humans.length) g.destroyAll(humans, ctx.o);
      }
    },
    ai: {
      priority: 8,
      cast: (g, p) => {
        const back = p.graveyard.filter(zombieCreatureCard);
        const human = o => g.isCreature(o) && g.hasSub(o, "Human") && !g.kw(o, "indestructible");
        const gain = back.reduce((n, c) => n + cardWorth(c), 0) * 0.6;
        const lose = g.controlled(p, human).reduce((n, o) => n + valueOf(g, o), 0);
        const hurt = g.battlefield.filter(o => o.controller !== p && human(o)).reduce((n, o) => n + valueOf(g, o), 0);
        return back.length >= 3 && gain + hurt - lose >= 12 ? undefined : false;
      }
    }
  });

  /* ================================================================ enchantments */
  D({
    name: "Dreadhorde Invasion", cost: "{1}{B}", type: "Enchantment",
    text: "At the beginning of your upkeep, you lose 1 life and amass Zombies 1. (Put a +1/+1 counter on an Army you control. It's also a Zombie. If you don't control an Army, create a 0/0 black Zombie Army creature token first.)\nWhenever a Zombie token you control with power 6 or greater attacks, it gains lifelink until end of turn.",
    triggers: [
      { on: "upkeep", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { g.loseLife(p, 1, s); amass(g, p, 1, s); } },
      {
        on: "attacks", when: (g, s, ev) => ev.o.controller === s.controller && ev.o.isToken && zNow(g, ev.o) && g.power(ev.o) >= 6,
        do: (g, s, ev) => { if (ev.o.zone === "battlefield") { g.grant(ev.o, ["lifelink"]); g.log(`${ev.o.def.name} gains lifelink until end of turn.`, { p: s.controller, cards: [s.def.name] }); } }
      }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Endless Ranks of the Dead", cost: "{2}{B}{B}", type: "Enchantment",
    text: "At the beginning of your upkeep, create X 2/2 black Zombie creature tokens, where X is half the number of Zombies you control, rounded down.",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => { const n = Math.floor(zombiePermanents(g, p).length / 2); if (n > 0) g.createToken(p, T.zombie, { count: n }); }
    }],
    ai: { priority: 6, threat: 2 }
  });

  /* Curses: "Enchant player". The Curse stays on its controller's side of the table and remembers the
     player it enchants; it goes to the graveyard when that player leaves the game. */
  const curseNote = "The Curse stays on your side of the table and remembers the player it enchants.";
  const curseParts = name => ({
    targets: [{ kind: "player", purpose: "harm", prompt: `${name}: enchant target player` }],
    onResolve: (g, p, o, item) => {
      const q = item.targets[0];
      if (q && g.isPlayer(q) && !q.lost) { o.state.cursed = q; g.log(`${name} enchants ${q.name}.`, { p, cards: [name] }); }
    },
    curseTriggers: [
      {
        // put onto the battlefield some other way: its controller picks the player
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          if (s.state.cursed) return;
          const q = await chooseOpponent(g, p, s, `${name}: enchant target player`);
          if (q) { s.state.cursed = q; g.log(`${name} enchants ${q.name}.`, { p, cards: [name] }); }
        }
      },
      {
        on: "playerLost", when: (g, s, ev) => ev.p === s.state.cursed,
        do: (g, s) => {
          if (s.zone !== "battlefield") return;
          g.log(`${name} goes to the graveyard: the enchanted player left the game.`, { p: s.controller, cards: [name] });
          g.toGraveyardFromBattlefield([s], "curse");
        }
      }
    ]
  });
  const curse = (spec) => {
    const parts = curseParts(spec.name);
    return D(Object.assign({ note: curseNote, targets: parts.targets, onResolve: parts.onResolve }, spec, { triggers: spec.triggers.concat(parts.curseTriggers) }));
  };

  curse({
    name: "Curse of the Restless Dead", cost: "{2}{B}", type: "Enchantment — Aura Curse",
    text: "Enchant player\nWhenever a land enchanted player controls enters, you create a 2/2 black Zombie creature token with decayed.",
    triggers: [{
      on: "enters", when: (g, s, ev) => !!s.state.cursed && ev.o.controller === s.state.cursed && g.isLand(ev.o),
      do: (g, s, ev, { p }) => decayedTokens(g, p, 1)
    }],
    ai: { priority: 6 }
  });

  curse({
    name: "Curse of Unbinding", cost: "{6}{U}", type: "Enchantment — Aura Curse",
    text: "Enchant player\nAt the beginning of enchanted player's upkeep, that player reveals cards from the top of their library until they reveal a creature card. Put that card onto the battlefield under your control. That player puts the rest of the revealed cards into their graveyard.",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => !!s.state.cursed && ev.p === s.state.cursed && !ev.p.lost,
      do: (g, s, ev, { p }) => {
        const q = s.state.cursed;
        if (!q || q.lost || p.lost) return;
        const revealed = [];
        let hit = null;
        for (const c of q.library) { revealed.push(c); if (creatureCard(c)) { hit = c; break; } }
        if (hit) {
          g.putOntoBattlefield([hit], p);
          g.log(`${q.name} reveals ${plural(revealed.length, "card")}; ${hit.def.name} enters under ${p.name}'s control (Curse of Unbinding).`, { p, cards: [hit.def.name] });
        } else g.log(`${q.name} reveals ${plural(revealed.length, "card")} and no creature (Curse of Unbinding).`, { p, cards: ["Curse of Unbinding"] });
        for (const c of revealed) if (c !== hit && c.zone === "library") g.moveTo(c, "graveyard");
      }
    }],
    ai: { priority: 6, threat: 2 }
  });

  /* Rooftop Storm: the free cast is an action on the enchantment. */
  function rooftopChoices(g, p) {
    const ok = c => zombieCreatureCard(c) && (!c.def.canCast || c.def.canCast(g, p, c));
    const out = p.hand.filter(ok);
    for (const c of p.command) if (c.isCommander && ok(c) && g.canPay(p, MK.parseCost(`{${g.commanderTax(p, c)}}`))) out.push(c);
    if (gisaReady(g, p)) out.push(...p.graveyard.filter(ok));
    return out;
  }
  D({
    name: "Rooftop Storm", cost: "{5}{U}", type: "Enchantment",
    text: "You may pay {0} rather than pay the mana cost for Zombie creature spells you cast.",
    note: "The free cast is an action on Rooftop Storm: at sorcery speed, cast a Zombie creature card from your hand (or your commander, paying only its commander tax) without paying its mana cost. With Gisa and Geralf, it also works from the graveyard once each turn.",
    abilities: [{
      label: "Cast a Zombie for {0}", timing: "sorcery",
      condition: (g, s, p) => rooftopChoices(g, p).length > 0,
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const opts = rooftopChoices(g, p);
        if (!opts.length) return;
        let c = await g.ask(p, { type: "target", prompt: "Rooftop Storm: cast a Zombie creature spell without paying its mana cost", options: opts, purpose: "rooftop", src: s });
        if (!c || !opts.includes(c)) return;
        if (c.zone === "graveyard") { const gg = gisaReady(g, p); if (gg) gg.state.gisaUsed = g.turn; }
        if (c.isCommander && c.zone === "command") {
          const tax = g.commanderTax(p, c);
          if (tax && !g.pay(p, MK.parseCost(`{${tax}}`))) return;
          p.cmdCasts[c.id] = (p.cmdCasts[c.id] || 0) + 1;
        }
        await g.castWithoutPaying(p, c);
      }
    }],
    ai: {
      priority: 7, threat: 2,
      // Diregraf Colossus first (every later Zombie then brings a token), then the biggest spell
      target: targetHook((g, p, req) => {
        if (req.purpose !== "rooftop") return undefined;
        const score = c => c.def.mv + (c.isCommander ? 2 : 0) + (c.def.name === "Diregraf Colossus" ? 20 : 0);
        return req.options.slice().sort((a, b) => score(b) - score(a))[0];
      }),
      plan: (g, p, o, ctx) => {
        if (o.zone !== "battlefield" || o.controller !== p || !myMain(g, p, ctx)) return null;
        const a = (ctx.actions || []).find(x => x.type === "activate" && x.card === o);
        return a ? { type: "activate", card: o, idx: a.idx, maxTries: 12 } : null;
      }
    }
  });

  /* ================================================================ artifacts */
  D({
    name: "Crowded Crypt", cost: "{2}{B}", type: "Artifact",
    text: "{T}: Add {B}.\nWhenever a creature you control dies, put a corpse counter on Crowded Crypt.\n{4}{B}{B}, {T}, Sacrifice Crowded Crypt: Create a 2/2 black Zombie creature token with decayed for each corpse counter on Crowded Crypt.",
    mana: [{ tap: true, produce: "B" }],
    triggers: [{ on: "dies", when: (g, s, ev) => ev.lki.controller === s.controller, do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "corpse", 1, s); } }],
    abilities: [{
      label: "Decayed Zombies for each corpse counter", cost: "{4}{B}{B}", tap: true, sacSelf: true,
      condition: (g, s) => (s.counters.corpse || 0) > 0,
      do: (g, s, ctx) => { const n = ctx.lki ? (ctx.lki.counters.corpse || 0) : 0; if (n) decayedTokens(g, ctx.p, n); },
      ai: { use: (g, p, o, ctx) => ((o.counters.corpse || 0) >= 4 && endBeforeMe(g, p, ctx)) || ((o.counters.corpse || 0) >= 7 && ctx.window === "main2" && g.active === p) }
    }],
    ai: { priority: 6, ramp: true }
  });

  D({
    name: "Commander's Sphere", cost: "{3}", type: "Artifact",
    text: "{T}: Add one mana of any color in your commander's color identity.\nSacrifice Commander's Sphere: Draw a card.",
    mana: [{ tap: true, produce: "any" }],
    abilities: [{
      label: "Sacrifice: draw a card", sacSelf: true,
      do: (g, s, ctx) => drawLog(g, ctx.p, 1, s),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && landsOf(g, p).length >= 8 && p.hand.length <= 1 && p.library.length > 5 }
    }],
    ai: { ramp: true, priority: 6 }
  });

  const diamond = (name, c) => D({
    name, cost: "{2}", type: "Artifact",
    text: `${name} enters tapped.\n{T}: Add {${c}}.`,
    etbTapped: true,
    mana: [{ tap: true, produce: c }],
    ai: { ramp: true, priority: 7 }
  });
  diamond("Charcoal Diamond", "B");
  diamond("Sky Diamond", "U");

  D({
    name: "Talisman of Dominance", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{T}: Add {U} or {B}. Talisman of Dominance deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["U", "B"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });

  /* ================================================================ lands */
  D({ name: "Island", type: "Basic Land — Island", text: "({T}: Add {U}.)", mana: [{ tap: true, produce: "U" }] });

  D({
    name: "Bojuka Bog", type: "Land",
    text: "Bojuka Bog enters tapped.\nWhen Bojuka Bog enters, exile target player's graveyard.\n{T}: Add {B}.",
    etbTapped: true,
    mana: [{ tap: true, produce: "B" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const q = await g.chooseTarget(p, { kind: "player", purpose: "bog", prompt: "Bojuka Bog: exile target player's graveyard" }, s);
        if (!q || q.lost) return;
        const n = q.graveyard.length;
        for (const c of q.graveyard.slice()) g.moveTo(c, "exile");
        g.log(`${q.name}'s graveyard is exiled (${plural(n, "card")}).`, { p, cards: [s.def.name] });
      }
    }],
    ai: {
      target: targetHook((g, p, req) => {
        if (req.purpose !== "bog") return undefined;
        const opps = req.options.filter(q => g.isPlayer(q) && q !== p);
        const w = q => q.graveyard.length + q.graveyard.filter(creatureCard).length * 2;
        return opps.slice().sort((a, b) => w(b) - w(a))[0] || undefined;
      })
    }
  });

  D({
    name: "Choked Estuary", type: "Land",
    text: "As this land enters, you may reveal an Island or Swamp card from your hand. If you don't, this land enters tapped.\n{T}: Add {U} or {B}.",
    note: "It reveals a card for you when it can.",
    etbTapped: (g, o) => !o.controller.hand.some(c => c !== o && (c.def.subtypes.includes("Island") || c.def.subtypes.includes("Swamp"))),
    mana: [{ tap: true, produce: ["U", "B"] }]
  });

  D({
    name: "Darkwater Catacombs", type: "Land",
    text: "{1}, {T}: Add {U}{B}.",
    mana: [{ tap: true, cost: "{1}", produce: "UB" }]
  });

  function orchardColors(g, p) {
    const out = new Set();
    for (const o of g.battlefield) {
      if (o.controller === p || o.controller.lost || !g.isLand(o)) continue;
      for (const m of o.def.mana || []) {
        const pr = m.produce;
        if (typeof pr === "function") continue;
        const s = Array.isArray(pr) ? pr.join("") : pr === "any" ? g.identityOf(o.controller).join("") : pr === "any5" ? "WUBRG" : String(pr || "").replace(/^choice:/, "");
        for (const k of "WUBRG") if (s.includes(k)) out.add(k);
      }
    }
    return [...out];
  }
  D({
    name: "Exotic Orchard", type: "Land",
    text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
    mana: [{
      tap: true,
      produce: (g, o) => {
        if (o._orchardV !== g.v) { o._orchardV = g.v; o._orchard = orchardColors(g, o.controller); }
        return o._orchard.length ? o._orchard : null;
      }
    }]
  });

  D({
    name: "Mortuary Mire", type: "Land",
    text: "Mortuary Mire enters tapped.\nWhen Mortuary Mire enters, you may put target creature card from your graveyard on top of your library.\n{T}: Add {B}.",
    etbTapped: true,
    mana: [{ tap: true, produce: "B" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "card", from: (g2, pl) => pl.graveyard.filter(creatureCard), optional: true, purpose: "mire", prompt: "Mortuary Mire: you may put target creature card from your graveyard on top of your library" }, s);
        if (!t || t.zone !== "graveyard" || t.owner !== p) return;
        g.moveTo(t, "library");
        g.log(`${p.name} puts ${t.def.name} on top of their library.`, { p, cards: [t.def.name] });
      }
    }],
    ai: {
      target: targetHook((g, p, req) => {
        if (req.purpose !== "mire") return undefined;
        const best = reanimatePick(g, p, req.options);
        return best && best.def.mv >= 4 && landsOf(g, p).length >= 4 ? best : null;
      })
    }
  });

  const sharesCommanderType = (g, p, o) => {
    if (o.def.changeling) return true;
    for (const c of p.commanders) {
      if (c.def.changeling) return true;
      for (const t of c.def.subtypes) if (o.def.subtypes.includes(t)) return true;
    }
    return false;
  };
  D({
    name: "Path of Ancestry", type: "Land",
    text: "Path of Ancestry enters tapped.\n{T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell that shares a creature type with your commander, scry 1.",
    note: "The scry happens when Path of Ancestry was tapped to pay for such a spell.",
    etbTapped: true,
    mana: [{ tap: true, produce: "any" }],
    triggers: [
      {
        // armed while the payment it was tapped for goes on (never triggers)
        on: "tapForMana",
        when: (g, s, ev) => {
          if (ev.o === s) { s.state.pathArmed = true; if (typeof queueMicrotask === "function") queueMicrotask(() => { s.state.pathArmed = false; }); }
          return false;
        },
        do: () => {}
      },
      {
        on: "cast",
        when: (g, s, ev) => {
          if (!s.state.pathArmed || ev.p !== s.controller) return false;
          s.state.pathArmed = false;
          return !(ev.item && ev.item.free) && ev.o.def.types.includes("Creature") && sharesCommanderType(g, s.controller, ev.o);
        },
        do: (g, s, ev, { p }) => scry1(g, p, s)
      }
    ],
    ai: { confirm: topConfirm }
  });

  D({
    name: "Sunken Hollow", type: "Land — Island Swamp",
    text: "({T}: Add {U} or {B}.)\nSunken Hollow enters tapped unless you control two or more basic lands.",
    etbTapped: (g, o) => g.battlefield.filter(x => x.controller === o.controller && x !== o && g.isLand(x) && g.isBasic(x)).length < 2,
    mana: [{ tap: true, produce: ["U", "B"] }]
  });

  D({
    name: "Tainted Isle", type: "Land",
    text: "{T}: Add {C}.\n{T}: Add {U} or {B}. Activate only if you control a Swamp.",
    mana: [
      { tap: true, produce: "C" },
      { tap: true, produce: ["U", "B"], condition: (g, o) => g.battlefield.some(x => x.controller === o.controller && g.isLand(x) && x.def.subtypes.includes("Swamp")) }
    ]
  });

  D({
    name: "Temple of Deceit", type: "Land",
    text: "Temple of Deceit enters tapped.\nWhen Temple of Deceit enters, scry 1.\n{T}: Add {U} or {B}.",
    etbTapped: true,
    mana: [{ tap: true, produce: ["U", "B"] }],
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => scry1(g, p, s) }],
    ai: { confirm: topConfirm }
  });

  /* ================================================================ the deck */
  const list = [
    // Zombies and friends
    "Butcher of Malakir", "Cemetery Reaper", "Cleaver Skaab", "Corpse Augur", "Cryptbreaker", "Death Baron", "Diregraf Captain",
    "Diregraf Colossus", "Eloise, Nephalia Sleuth", "Eternal Skylord", "Fleshbag Marauder", "Forgotten Creation", "Geralf's Mindcrusher",
    "Gisa and Geralf", "Gleaming Overseer", "Gorex, the Tombshell", "Gravedigger", "Gravespawn Sovereign", "Havengul Runebinder",
    "Hordewing Skaab", "Liliana's Devotee", "Lord of the Accursed", "Midnight Reaper", "Noosegraf Mob", "Overseer of the Damned",
    "Prowling Geistcatcher", "Ravenous Rotbelly", "Ruthless Deathfang", "Spark Reaper", "Stitcher Geralf", "Stitcher's Supplier",
    "Tomb Tyrant", "Undead Augur",
    // planeswalker, instants and sorceries
    "Liliana, Death's Majesty", "Aetherspouts", "Drown in Dreams", "Go for the Throat",
    "Army of the Damned", "Dark Salvation", "Distant Melody", "Dread Summons", "Empty the Laboratory", "Feed the Swarm",
    "Ghouls' Night Out", "Hour of Eternity", "Syphon Flesh", "Zombie Apocalypse",
    // artifacts and enchantments
    "Arcane Signet", "Charcoal Diamond", "Commander's Sphere", "Crowded Crypt", "Sky Diamond", "Sol Ring", "Talisman of Dominance",
    "Curse of Unbinding", "Curse of the Restless Dead", "Dreadhorde Invasion", "Endless Ranks of the Dead", "Liliana's Mastery",
    "Open the Graves", "Rooftop Storm",
    // lands
    "Bojuka Bog", "Choked Estuary", "Command Tower", "Darkwater Catacombs", "Exotic Orchard", "Mortuary Mire", "Myriad Landscape",
    "Path of Ancestry", "Sunken Hollow", "Tainted Isle", "Temple of Deceit"
  ];
  for (let i = 0; i < 12; i++) list.push("Island");
  for (let i = 0; i < 15; i++) list.push("Swamp");

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "wilhelt", name: "Wilhelt", title: WILHELT, commander: WILHELT,
    identity: ["U", "B"], bracket: 2, precon: "Undead Unleashed (Innistrad: Midnight Hunt Commander, 2021)", aggression: 0.55,
    style: "Zombie swarm",
    blurb: "A blue-black Zombie horde that sacrifices its own dead for cards and brings them back as decayed tokens, then buries the table under Army of the Damned.",
    watch: ["Butcher of Malakir", "Army of the Damned", "Gravespawn Sovereign", "Liliana, Death's Majesty"],
    list
  });
})(typeof window !== "undefined" ? window : globalThis);
