/* Lathril, Blade of the Elves: a Bracket 2 bot deck built from the retail Elven Empire precon
   (Kaldheim Commander, 2021). Black-green Elves: mana Elves and lords spill out Elf Warrior tokens
   until Lathril can tap ten Elves to drain each opponent for 10.
   It is the retail list with four swaps: Elvish Warmaster for Numa, Joraga Chieftain and
   Llanowar Visionary for Voice of Many (their text couldn't be checked), Assassin's Trophy for
   Binding the Old Gods (a Saga) and Temple of Malady for Golgari Rot Farm (the bots misplay
   bounce lands).
   Cards shared with other decks (Sol Ring, Elvish Archdruid, Beast Whisperer...) are defined in
   cards-miku.js and the decks-*.js files, which load first; this file only lists them. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce;
  const AI = () => MK.AI || {};
  const LATHRIL = "Lathril, Blade of the Elves";

  /* ================================================================ helpers */
  const mine = (s, o) => o.controller === s.controller;
  const isElfDef = d => !!d && ((d.subtypes || []).includes("Elf") || !!d.changeling);
  /* Elf check from the card itself: safe inside statics and cda, which run while characteristics are computed. */
  const isElf = o => isElfDef(o.def);
  /* Elf check with the current characteristics: for triggers, abilities and spells. */
  const elfNow = (g, o) => g.hasSub(o, "Elf");
  const myElves = (g, p) => g.controlled(p, o => g.isCreature(o) && elfNow(g, o));
  /* "Elves you control" counts Elf permanents, so Prowess of the Fair (a Kindred Elf) counts too. */
  const elfCount = (g, p) => g.controlled(p, o => elfNow(g, o)).length;
  /* The same count from the cards themselves, for statics and cda. */
  const elfCountDef = (g, p) => g.battlefield.filter(o => o.controller === p && isElf(o)).length;
  const elvesOnField = g => g.battlefield.filter(o => elfNow(g, o));
  const landsOf = (g, p) => g.controlled(p, o => g.isLand(o));
  const untappedLands = (g, p) => landsOf(g, p).filter(l => !l.tapped && l.def.mana.length).length;
  const valueOf = (g, o) => (AI().value ? AI().value(g, o) : 0);
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : 0);
  const basicLandCard = (g, c) => g.isBasic(c) && c.def.types.includes("Land");
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
  /* Who controlled a trigger's source: when it left the battlefield with the others (a wipe), its last known controller. */
  const ctrlOf = (s, slki) => (slki && slki.controller) || s.controller;
  /* The end step of the player just before p: a free moment to tap creatures, which untap right after. */
  const endBeforeMine = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf || g.active) === p;

  const ELF_WARRIOR = MK.tokenDef({ key: "lathril-elf-warrior", name: "Elf Warrior", pt: [1, 1], colors: "G", subtypes: ["Elf", "Warrior"] });
  const elfWarriors = (g, p, n) => g.createToken(p, ELF_WARRIOR, { count: n });
  const SERVO = MK.tokenDef({ key: "lathril-servo", name: "Servo", pt: [1, 1], types: ["Artifact", "Creature"], subtypes: ["Servo"], colors: "" });
  const ELEMENTAL = MK.tokenDef({ key: "lathril-elemental-7-7", name: "Elemental", pt: [7, 7], colors: "G", subtypes: ["Elemental"], keywords: ["trample"] });

  /* Put cards from the library on the bottom, in a random order when asked. */
  function toBottom(g, p, cards, random) {
    const list = cards.filter(c => c.zone === "library" && p.library.includes(c));
    for (const c of list) p.library.splice(p.library.indexOf(c), 1);
    if (random) g.shuffleArr(list);
    p.library.push(...list);
    g.bump();
  }

  /* Scry 1 (Temple of Malady, Path of Ancestry). */
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
  const scryConfirm = (g, p, req) => (req.purpose === "scryBottom" ? !keepOnTop(g, p, req.card) : true);

  /* "Choose a creature type": the types among creatures on the battlefield, plus Elf. */
  function typeOptions(g) {
    const set = new Set(["Elf"]);
    for (const o of g.battlefield) if (g.isCreature(o)) for (const t of g.ch(o).subtypes) set.add(t);
    return [...set].sort().map(t => ({ id: t, label: t }));
  }
  /* The creature type most of q's creatures share, and how many have it. */
  function bestTypeFor(g, q) {
    const counts = new Map();
    let all = 0;
    for (const c of g.creatures(q)) {
      const ch = g.ch(c);
      if (ch.allTypes) { all++; continue; }
      for (const t of ch.subtypes) counts.set(t, (counts.get(t) || 0) + 1);
    }
    let type = null, n = 0;
    for (const [t, k] of counts) if (k > n) { type = t; n = k; }
    return { type, n: n + all };
  }
  const tribeCount = (g, p) => bestTypeFor(g, p).n;
  function sharesCommanderType(p, def) {
    if (def.changeling) return true;
    return p.commanders.some(c => c.def.subtypes.some(t => (def.subtypes || []).includes(t)));
  }

  /* Bot picks. */
  function bestOppTarget(g, p, options, minThreat) {
    const list = (options || []).filter(o => !g.isPlayer(o) && o.controller !== p).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    return list[0] && threatOf(g, list[0], p) >= (minThreat || 0) ? list[0] : null;
  }
  function lowestLife(options, n) {
    const opps = options.slice().sort((a, b) => a.life - b.life);
    const kill = opps.find(q => q.life <= n);
    return kill || opps[0] || null;
  }
  /* The card to take from a look at the top of the library (Harald, Bounty of Skemfar): the best
     one we can cast soon, and mana Elves while we're short of lands. */
  function cardPick(g, p, options, extraLands) {
    const lands = landsOf(g, p).length + (extraLands || 0);
    const score = c => {
      const ai = c.def.ai || {};
      let s = (ai.priority != null ? ai.priority : 5) + c.def.mv * 0.6;
      if (c.def.mv > lands + 1) s -= 4;
      if (ai.ramp && lands < 5) s += 3;
      return s;
    };
    return options.slice().sort((a, b) => score(b) - score(a))[0] || null;
  }

  /* A shrink-everything spell (Eyeblight Massacre): what it kills, ours and theirs. */
  function shrinkWipe(g, p, n, spared) {
    let net = 0, kills = 0;
    for (const c of g.battlefield) {
      if (!g.isCreature(c) || spared(c)) continue;
      if (g.toughness(c) - n > c.damage) continue;
      const v = Math.max(1, valueOf(g, c));
      if (c.controller === p) net -= v * 1.5;
      else { net += v; kills++; }
    }
    return { net, kills };
  }
  const shrinkWipeCast = (n, spared) => (g, p) => {
    const r = shrinkWipe(g, p, n, c => spared(g, c));
    return r.kills >= 2 && r.net >= 7 ? 20 + r.net : false;
  };

  /* ================================================================ the commander */
  /* Untapped Elves p controls for "Tap ten untapped Elves" costs. Any Elf permanent can be tapped,
     so Prowess of the Fair (a Kindred Elf enchantment) counts too, and summoning sickness doesn't matter. */
  function untappedElves(g, p, except) {
    return g.battlefield.filter(o => o.controller === p && o !== except && !o.tapped && elfNow(g, o));
  }
  /* Lathril, if she can use her ability right now. */
  function lathrilReady(g, p) {
    return g.controlled(p, o => o.def.name === LATHRIL && !o.tapped && (!o.sick || g.kw(o, "haste")))[0] || null;
  }
  /* How many more untapped Elves Lathril needs to drain right now (Infinity if she can't). */
  function drainGap(g, p) {
    const l = lathrilReady(g, p);
    return l ? Math.max(0, 10 - untappedElves(g, p, l).length) : Infinity;
  }
  /* A token spell that makes n Elves and costs `mv`: does it let Lathril drain this turn?
     (Mana Elves tapped to pay for it don't count, so leave room for them when lands run short.) */
  const enablesDrain = (g, p, n, mv) => n > 0 && n >= drainGap(g, p) + Math.max(0, mv - untappedLands(g, p));

  /* Bot attack (engine 7): each hit of Lathril's makes Elf Warriors toward the drain, but the casual
     keep-a-blocker-home rule keeps the biggest creature home, and early on that is Lathril. She goes
     in at a player whose untapped blockers can't double-block her to death (menace), while the
     table can't kill us next turn. Games recorded before engine 7 (legacyDecks) replay without this. */
  function lathrilAttack(g, p, ctx) {
    if (g.opts && g.opts.legacyDecks) return null;
    const { candidates, targets, decl } = ctx;
    const l = candidates.find(c => c.def.name === LATHRIL);
    if (!l || decl.some(d => d.attacker === l)) return null;
    const opps = g.opponents(p);
    const threatIn = Math.max(0, ...opps.map(q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((s, c) => s + Math.max(0, g.power(c)), 0)));
    if (p.life <= threatIn + 2) return null;
    const need = Math.max(1, g.lethalDamageLeft(l));
    const safe = q => {
      const bl = g.creatures(q).filter(b => !b.tapped && g.canBlock(b, l));
      if (bl.length < 2) return true;
      if (bl.some(b => g.kw(b, "deathtouch") && g.power(b) > 0)) return false;
      const top2 = bl.map(b => Math.max(0, g.power(b))).sort((a, b) => b - a).slice(0, 2);
      return top2[0] + top2[1] < need;
    };
    const players = targets.filter(t => g.isPlayer(t) && t !== p && safe(t));
    if (!players.length) return null;
    const count = new Map();
    for (const d of decl) { const q = g.defenderOf(d.target); count.set(q, (count.get(q) || 0) + 1); }
    const pick = players.slice().sort((a, b) => ((count.get(b) || 0) - (count.get(a) || 0)) || (a.life - b.life) || (a.idx - b.idx))[0];
    return decl.concat([{ attacker: l, target: pick }]);
  }

  D({
    name: LATHRIL, cost: "{2}{B}{G}", type: "Legendary Creature — Elf Noble", pt: "2/3",
    keywords: ["menace"],
    text: "Menace\nWhenever Lathril, Blade of the Elves deals combat damage to a player, create that many 1/1 green Elf Warrior creature tokens.\n{T}, Tap ten untapped Elves you control: Each opponent loses 10 life and you gain 10 life.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && ev.amount > 0,
      do: (g, s, ev, { p }) => elfWarriors(g, p, ev.amount)
    }],
    abilities: [{
      label: "Tap ten Elves: drain 10", tap: true,
      tapCreatures: 10, tapFilter: (g, c) => elfNow(g, c), tapPrompt: "Lathril: tap ten untapped Elves you control",
      do: async (g, s, ctx) => {
        const p = ctx.p;
        g.log(`${p.name} taps ten Elves: each opponent loses 10 life.`, { p, cards: [s.def.name], kind: "big" });
        for (const q of g.opponents(p)) g.loseLife(q, 10, s);
        g.gainLife(p, 10, s);
      },
      // 10 from each opponent is always worth it: use it the first time it's ready
      ai: { first: true, use: (g, p) => g.opponents(p).length > 0 }
    }],
    ai: { priority: 8, threat: 3, attackPlan: lathrilAttack }
  });

  /* ================================================================ mana Elves */
  /* Jaspera taps another creature for its cost. The engine picks that creature itself when the
     mana is made (summoning-sick ones first, then tokens, then the smallest), so only offer the
     mana when that creature can't be needed for its own mana or {T} ability in the same payment. */
  function spareCreature(g, o) {
    const cands = g.battlefield.filter(c => c !== o && c.controller === o.controller && !c.tapped && g.isCreature(c));
    if (!cands.length) return false;
    cands.sort((a, b) => (b.sick - a.sick) || (b.isToken - a.isToken) || (g.power(a) - g.power(b)));
    const c = cands[0];
    const canTap = !c.sick || g.kw(c, "haste");
    return !(canTap && (c.def.mana.length || c.def.abilities.some(ab => ab.tap)));
  }
  D({
    name: "Jaspera Sentinel", cost: "{G}", type: "Creature — Elf Rogue", pt: "1/2",
    keywords: ["reach"],
    text: "Reach\n{T}, Tap an untapped creature you control: Add one mana of any color.",
    note: "Its mana is only used while the creature it would tap has no mana or {T} ability of its own to use.",
    mana: [{ tap: true, tapCreature: 1, produce: "any5", condition: spareCreature }],
    ai: { ramp: true, priority: 5 }
  });

  D({
    name: "Llanowar Tribe", cost: "{G}{G}{G}", type: "Creature — Elf", pt: "3/3",
    text: "{T}: Add {G}{G}{G}.",
    mana: [{ tap: true, produce: "GGG" }],
    ai: { ramp: true, priority: 7 }
  });

  D({
    name: "Wirewood Channeler", cost: "{3}{G}", type: "Creature — Elf Druid", pt: "2/2",
    text: "{T}: Add X mana of any one color, where X is the number of Elves on the battlefield.",
    mana: [{
      tap: true,
      produce: (g, o) => {
        const x = elvesOnField(g).length;
        if (!x) return null;
        const cols = o.controller.identity.length ? o.controller.identity : ["W", "U", "B", "R", "G"];
        return cols.map(k => k.repeat(x));
      }
    }],
    ai: { ramp: true, priority: 6 }
  });

  D({
    name: "Llanowar Visionary", cost: "{2}{G}", type: "Creature — Elf Druid", pt: "2/2",
    text: "When Llanowar Visionary enters, draw a card.\n{T}: Add {G}.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) }],
    mana: [{ tap: true, produce: "G" }],
    ai: { ramp: true, priority: 6 }
  });

  D({
    name: "Canopy Tactician", cost: "{3}{G}", type: "Creature — Elf Warrior", pt: "3/3",
    text: "Other Elves you control get +1/+1.\n{T}: Add {G}{G}{G}.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isElf(o), pt: [1, 1] }],
    mana: [{ tap: true, produce: "GGG" }],
    ai: { ramp: true, priority: 7 }
  });

  D({
    name: "Farhaven Elf", cost: "{2}{G}", type: "Creature — Elf Druid", pt: "1/1",
    text: "When Farhaven Elf enters, you may search your library for a basic land card, put it onto the battlefield tapped, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.search(p, { filter: basicLandCard, to: "battlefield", tapped: true, prompt: "Farhaven Elf: you may choose a basic land card", src: s }) }],
    ai: { ramp: true }
  });

  D({
    name: "Elvish Rejuvenator", cost: "{2}{G}", type: "Creature — Elf Druid", pt: "1/1",
    text: "When Elvish Rejuvenator enters, look at the top five cards of your library. You may put a land card from among them onto the battlefield tapped. Put the rest on the bottom of your library in a random order.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 5);
        if (!top.length) return;
        const lands = top.filter(c => c.def.types.includes("Land"));
        let pick = null;
        if (lands.length) {
          const r = await g.ask(p, { type: "cards", prompt: "Elvish Rejuvenator: you may put a land card onto the battlefield tapped", options: lands, min: 0, max: 1, purpose: "tutor", src: s });
          pick = (r || []).find(c => lands.includes(c)) || null;
        }
        if (pick) g.putOntoBattlefield([pick], p, { tapped: true });
        toBottom(g, p, top.filter(c => c !== pick), true);
        g.log(pick ? `${p.name} puts ${pick.def.name} onto the battlefield tapped (Elvish Rejuvenator).` : `${p.name} finds no land in the top five cards (Elvish Rejuvenator).`, { p, cards: pick ? [pick.def.name] : [] });
      }
    }],
    ai: { ramp: true }
  });

  /* Springbloom Druid: trade a tapped basic (or a tapped tapland) for two basics. */
  function springbloomPick(g, p, options) {
    if (p.library.filter(c => basicLandCard(g, c)).length < 2) return null;
    const score = o => (g.isBasic(o) ? 0 : (o.def.abilities.length || !o.def.etbTapped ? 20 : 3)) + (o.tapped ? 0 : 2);
    const list = options.filter(o => o.controller === p && g.isLand(o)).sort((a, b) => score(a) - score(b));
    return list[0] && score(list[0]) < 20 ? list[0] : null;
  }
  D({
    name: "Springbloom Druid", cost: "{2}{G}", type: "Creature — Elf Druid", pt: "1/1",
    text: "When Springbloom Druid enters, you may sacrifice a land. If you do, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const lands = landsOf(g, p);
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Springbloom Druid: you may sacrifice a land", options: lands, optional: true, purpose: "springbloom", src: s });
        if (!pick || !lands.includes(pick) || pick.zone !== "battlefield") return;
        g.sacrifice(pick);
        await g.search(p, { filter: basicLandCard, to: "battlefield", tapped: true, count: 2, purpose: "cultivate", prompt: "Springbloom Druid: choose up to two basic land cards", src: s });
      }
    }],
    ai: { ramp: true, priority: 6, target: (g, p, req) => (req.purpose === "springbloom" ? springbloomPick(g, p, req.options) : undefined) }
  });

  /* ================================================================ Elves that make Elves */
  D({
    name: "Elvish Warmaster", cost: "{1}{G}", type: "Creature — Elf Warrior", pt: "2/2",
    text: "Whenever one or more other Elves you control enter, create a 1/1 green Elf Warrior creature token. This ability triggers only once each turn.\n{5}{G}{G}: Elves you control get +2/+2 and gain deathtouch until end of turn.",
    triggers: [{
      on: "enters",
      // "triggers only once each turn": marked when it triggers, so a batch of Elves makes one token
      when: (g, s, ev) => {
        if (ev.o === s || ev.o.controller !== s.controller || !isElf(ev.o) || s.state.warmasterTurn === g.turn) return false;
        s.state.warmasterTurn = g.turn;
        return true;
      },
      do: (g, s, ev, { p }) => elfWarriors(g, p, 1)
    }],
    abilities: [{
      label: "Elves get +2/+2 and deathtouch", cost: "{5}{G}{G}",
      do: (g, s, ctx) => {
        const list = myElves(g, ctx.p);
        if (list.length) g.addEffect({ objs: list, pt: [2, 2], kw: ["deathtouch"] });
        s.state.pumpTurn = g.turn;
        g.log(`Elves ${ctx.p.name} controls get +2/+2 and deathtouch until end of turn.`, { p: ctx.p, cards: [s.def.name], kind: "big" });
      },
      ai: {
        use: (g, p, o, ctx) => ctx.window === "combat" && !!g.combat && g.combat.attacker === p && o.state.pumpTurn !== g.turn &&
          g.combat.attackers.filter(a => a.controller === p && elfNow(g, a)).length >= 3
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Imperious Perfect", cost: "{2}{G}", type: "Creature — Elf Warrior", pt: "2/2",
    text: "Other Elves you control get +1/+1.\n{G}, {T}: Create a 1/1 green Elf Warrior creature token.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isElf(o), pt: [1, 1] }],
    abilities: [{
      label: "Create a 1/1 Elf Warrior", cost: "{G}", tap: true,
      do: (g, s, ctx) => elfWarriors(g, ctx.p, 1),
      // spare mana after our turn, or at the end of the turn before ours
      ai: { use: (g, p, o, ctx) => ctx.window === "main2" || endBeforeMine(g, p, ctx) }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Lys Alana Huntmaster", cost: "{2}{G}{G}", type: "Creature — Elf Warrior", pt: "3/3",
    text: "Whenever you cast an Elf spell, you may create a 1/1 green Elf Warrior creature token.",
    triggers: [{
      on: "cast", optional: "Lys Alana Huntmaster: create a 1/1 Elf Warrior?",
      when: (g, s, ev) => ev.p === s.controller && !!ev.o && isElfDef(ev.o.def),
      do: (g, s, ev, { p }) => elfWarriors(g, p, 1)
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Wolverine Riders", cost: "{4}{G}{G}", type: "Creature — Elf Warrior", pt: "4/4",
    text: "At the beginning of each upkeep, create a 1/1 green Elf Warrior creature token.\nWhenever another Elf you control enters, you gain life equal to its toughness.",
    triggers: [
      { on: "upkeep", do: (g, s, ev, { p }) => elfWarriors(g, p, 1) },
      {
        on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && isElf(ev.o),
        do: (g, s, ev, { p }) => { const t = ev.o.zone === "battlefield" ? g.toughness(ev.o) : 0; if (t > 0) g.gainLife(p, t, s); }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Eyeblight Cullers", cost: "{4}{B}", type: "Creature — Elf Warrior", pt: "3/3",
    text: "When Eyeblight Cullers dies, create three 1/1 green Elf Warrior creature tokens, then mill three cards.",
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => { elfWarriors(g, p, 3); g.mill(p, 3); } }],
    ai: { priority: 6 }
  });

  D({
    name: "Cultivator of Blades", cost: "{3}{G}{G}", type: "Creature — Elf Artificer", pt: "1/1",
    text: "Fabricate 2 (When Cultivator of Blades enters, put two +1/+1 counters on it or create two 1/1 colorless Servo artifact creature tokens.)\nWhenever Cultivator of Blades attacks, you may have other attacking creatures get +X/+X until end of turn, where X is Cultivator of Blades's power.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          // if it has already left the battlefield, only the Servos are possible
          const m = s.zone !== "battlefield" ? 1 : await g.ask(p, { type: "option", prompt: "Cultivator of Blades: fabricate 2", options: [{ id: 0, label: "Two +1/+1 counters on it" }, { id: 1, label: "Two 1/1 Servo tokens" }], purpose: "fabricate", src: s });
          if (m === 0 && s.zone === "battlefield") g.addCounters(s, "p1", 2, s);
          else g.createToken(p, SERVO, { count: 2 });
        }
      },
      {
        on: "attacks", self: true, optional: "Cultivator of Blades: other attacking creatures get +X/+X?",
        do: (g, s, ev, { p }) => {
          const x = s.zone === "battlefield" ? Math.max(0, g.power(s)) : 0;
          const others = g.combat ? g.combat.attackers.filter(a => a !== s && a.zone === "battlefield") : [];
          if (!x || !others.length) return;
          g.addEffect({ objs: others, pt: [x, x] });
          g.log(`Other attacking creatures get +${x}/+${x} until end of turn (Cultivator of Blades).`, { p, cards: [s.def.name], kind: "big" });
        }
      }
    ],
    // counters make a bigger pump when there are creatures to attack alongside it
    ai: { priority: 6, option: (g, p, req) => (req.purpose === "fabricate" ? (g.creatures(p).length >= 3 ? 0 : 1) : undefined) }
  });

  /* ================================================================ lords and big Elves */
  D({
    name: "Dwynen, Gilt-Leaf Daen", cost: "{2}{G}{G}", type: "Legendary Creature — Elf Warrior", pt: "3/4",
    keywords: ["reach"],
    text: "Reach\nOther Elf creatures you control get +1/+1.\nWhenever Dwynen, Gilt-Leaf Daen attacks, you gain 1 life for each attacking Elf you control.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isElf(o), pt: [1, 1] }],
    triggers: [{
      on: "attacks", self: true,
      do: (g, s, ev, { p }) => { const n = g.controlled(p, o => !!(o.combat && o.combat.attacking) && elfNow(g, o)).length; if (n) g.gainLife(p, n, s); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Abomination of Llanowar", cost: "{1}{B}{G}", type: "Legendary Creature — Elf Horror", pt: "*/*",
    keywords: ["vigilance", "menace"],
    text: "Vigilance, menace\nAbomination of Llanowar's power and toughness are each equal to the number of Elves you control plus the number of Elf cards in your graveyard.",
    cda: (g, o) => { const n = elfCountDef(g, o.controller) + o.controller.graveyard.filter(c => isElfDef(c.def)).length; return [n, n]; },
    ai: { priority: 7 }
  });

  D({
    name: "Twinblade Assassins", cost: "{3}{B}{G}", type: "Creature — Elf Assassin", pt: "5/4",
    text: "At the beginning of your end step, if a creature died this turn, draw a card.",
    note: "It only knows about creatures that died while it was on the battlefield.",
    triggers: [
      // remembers deaths; never triggers itself
      { on: "dies", when: (g, s, ev) => { if (ev.o !== s && s.zone === "battlefield") s.state.deathTurn = g.turn; return false; }, do: () => {} },
      {
        on: "endStep", when: (g, s, ev) => ev.p === s.controller && s.state.deathTurn === g.turn,
        intervening: (g, s) => s.state.deathTurn === g.turn,
        do: (g, s, ev, { p }) => { g.draw(p, 1); g.log(`${p.name} draws a card (Twinblade Assassins).`, { p, cards: [s.def.name] }); }
      }
    ],
    ai: { priority: 6 }
  });

  /* ================================================================ Elves with a job */
  /* Jagged-Scar Archers: shoot the most dangerous flier it can kill. */
  function archerPick(g, p, o, options) {
    const pw = Math.max(0, g.power(o));
    if (!pw) return null;
    const dt = g.kw(o, "deathtouch");
    const pool = options || g.battlefield.filter(c => g.isCreature(c) && g.kw(c, "flying") && g.canTarget(p, c));
    const list = pool.filter(c => !g.isPlayer(c) && c.controller !== p && !g.kw(c, "indestructible") && (dt || g.lethalDamageLeft(c) <= pw))
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    return list[0] && threatOf(g, list[0], p) >= 2.5 ? list[0] : null;
  }
  D({
    name: "Jagged-Scar Archers", cost: "{1}{G}{G}", type: "Creature — Elf Archer", pt: "*/*",
    text: "Jagged-Scar Archers's power and toughness are each equal to the number of Elves you control.\n{T}: Jagged-Scar Archers deals damage equal to its power to target creature with flying.",
    cda: (g, o) => { const n = elfCountDef(g, o.controller); return [n, n]; },
    abilities: [{
      label: "Shoot a flier", tap: true,
      targets: [{ kind: "creature", purpose: "harm", prompt: "Jagged-Scar Archers: target creature with flying", filter: (g, o) => g.kw(o, "flying") }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.damage(s, t, Math.max(0, g.power(s))); },
      ai: { use: (g, p, o) => !!archerPick(g, p, o) }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "harm" ? archerPick(g, p, req.src, req.options) || undefined : undefined) }
  });

  /* Timberwatch Elf: a blocked or blocking creature that the pump saves or lets win, else the
     unblocked attacker that hits hardest (Lathril first: her damage becomes Elf Warriors). */
  function timberPick(g, p) {
    const c = g.combat;
    if (!c) return null;
    const x = elvesOnField(g).length;
    if (x <= 0) return null;
    let best = null, bs = 0;
    for (const o of g.creatures(p)) {
      if (!o.combat || !g.canTarget(p, o)) continue;
      let s = 0;
      if (o.combat.attacking) {
        const blockers = o.combat.blockedBy.filter(b => b.zone === "battlefield");
        if (!o.combat.wasBlocked) s = 2 + (o.isCommander ? 4 : 0) + g.power(o) * 0.3;
        else if (blockers.length) {
          const incoming = blockers.reduce((n, b) => n + Math.max(0, g.power(b)), 0);
          const left = g.lethalDamageLeft(o);
          const saved = incoming >= left && incoming < left + x && !blockers.some(b => g.kw(b, "deathtouch"));
          const kills = blockers.some(b => g.lethalDamageLeft(b) > g.power(o) && g.lethalDamageLeft(b) <= g.power(o) + x);
          s = (saved ? 5 + valueOf(g, o) * 0.3 : 0) + (kills ? 3 : 0);
        }
      } else if (o.combat.blocking) {
        const a = o.combat.blocking;
        if (a.zone !== "battlefield") continue;
        const saved = g.power(a) >= g.lethalDamageLeft(o) && g.power(a) < g.lethalDamageLeft(o) + x && !g.kw(a, "deathtouch");
        const kills = g.lethalDamageLeft(a) > g.power(o) && g.lethalDamageLeft(a) <= g.power(o) + x && !g.kw(a, "indestructible");
        s = (saved ? 5 + valueOf(g, o) * 0.3 : 0) + (kills ? 3 + valueOf(g, a) * 0.2 : 0);
      }
      if (s > bs) { bs = s; best = o; }
    }
    return best;
  }
  D({
    name: "Timberwatch Elf", cost: "{2}{G}", type: "Creature — Elf", pt: "1/2",
    text: "{T}: Target creature gets +X/+X until end of turn, where X is the number of Elves on the battlefield.",
    abilities: [{
      label: "Pump +X/+X", tap: true,
      targets: [{ kind: "creature", purpose: "help", prompt: "Timberwatch Elf: target creature gets +X/+X" }],
      do: (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0]) return;
        const x = elvesOnField(g).length;
        g.pump(t, x, x);
        g.log(`${t.def.name} gets +${x}/+${x} until end of turn.`, { p: ctx.p, cards: [s.def.name, t.def.name] });
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && !!timberPick(g, p) }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "help" ? timberPick(g, p) || undefined : undefined) }
  });

  D({
    name: "Reclamation Sage", cost: "{2}{G}", type: "Creature — Elf Shaman", pt: "2/1",
    text: "When Reclamation Sage enters, you may destroy target artifact or enchantment.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "artifactOrEnchantment", purpose: "harm", optional: true, prompt: "Reclamation Sage: you may destroy target artifact or enchantment", trigger: true }, s);
        if (t && t.zone === "battlefield") g.destroy(t, s);
      }
    }],
    ai: { priority: 5, target: (g, p, req) => bestOppTarget(g, p, req.options, 3) }
  });

  /* Nullmage Shepherd: the opponents' most dangerous artifact or enchantment. */
  function shepherdPick(g, p, options, min) {
    const pool = options || g.battlefield.filter(o => (g.isArtifact(o) || g.isEnchantment(o)) && g.canTarget(p, o));
    const list = pool.filter(o => !g.isPlayer(o) && o.controller !== p).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    return list[0] && threatOf(g, list[0], p) >= min ? list[0] : null;
  }
  D({
    name: "Nullmage Shepherd", cost: "{3}{G}", type: "Creature — Elf Shaman", pt: "2/4",
    text: "Tap four untapped creatures you control: Destroy target artifact or enchantment.",
    abilities: [{
      label: "Tap four creatures: destroy an artifact or enchantment",
      tapCreatures: 4, tapSelfOk: true, tapPrompt: "Nullmage Shepherd: tap four untapped creatures you control",
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Nullmage Shepherd: destroy target artifact or enchantment" }],
      do: async (g, s, ctx) => {
        const t = ctx.targets[0];
        if (t && ctx.legal[0]) g.destroy(t, s);
      },
      // creatures tapped at the end of the turn before ours untap right away
      ai: { use: (g, p, o, ctx) => (endBeforeMine(g, p, ctx) && !!shepherdPick(g, p, null, 3)) || (ctx.window === "main2" && !!shepherdPick(g, p, null, 6)) }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "harm" ? shepherdPick(g, p, req.options, -99) || undefined : undefined) }
  });

  const untappedElvesAll = (g, p) => untappedElves(g, p, null);
  D({
    name: "Voice of the Woods", cost: "{3}{G}{G}", type: "Creature — Elf", pt: "2/2",
    text: "Tap five untapped Elves you control: Create a 7/7 green Elemental creature token with trample.",
    abilities: [{
      label: "Tap five Elves: 7/7 Elemental",
      tapCreatures: 5, tapSelfOk: true, tapFilter: (g, c) => elfNow(g, c), tapPrompt: "Voice of the Woods: tap five untapped Elves you control",
      do: async (g, s, ctx) => {
        g.createToken(ctx.p, ELEMENTAL);
      },
      // at the end of the turn before ours the Elves untap right after; in main 2 only with plenty to spare
      ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) || (ctx.window === "main2" && untappedElvesAll(g, p).length >= 12) }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Sylvan Messenger", cost: "{3}{G}", type: "Creature — Elf", pt: "2/2",
    keywords: ["trample"],
    text: "Trample\nWhen Sylvan Messenger enters, reveal the top four cards of your library. Put all Elf cards revealed this way into your hand and the rest on the bottom of your library in any order.",
    note: "The other cards go to the bottom in a random order.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const top = p.library.slice(0, 4);
        if (!top.length) return;
        const elves = top.filter(c => isElfDef(c.def));
        for (const c of elves) g.moveTo(c, "hand");
        toBottom(g, p, top.filter(c => !elves.includes(c)), true);
        g.log(`${p.name} reveals ${top.map(c => c.def.name).join(", ")} and puts ${elves.length ? elves.map(c => c.def.name).join(" and ") : "no Elf card"} into their hand.`, { p, cards: elves.map(c => c.def.name) });
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Harald, King of Skemfar", cost: "{1}{B}{G}", type: "Legendary Creature — Elf Warrior", pt: "3/2",
    keywords: ["menace"],
    text: "Menace\nWhen Harald, King of Skemfar enters, look at the top five cards of your library. You may reveal an Elf, Warrior, or Tyvar card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 5);
        if (!top.length) return;
        const opts = top.filter(c => isElfDef(c.def) || c.def.subtypes.includes("Warrior") || c.def.subtypes.includes("Tyvar"));
        let pick = null;
        if (opts.length) {
          pick = await g.ask(p, { type: "target", prompt: "Harald: you may reveal an Elf, Warrior or Tyvar card and put it into your hand", options: opts, optional: true, purpose: "lookPick", src: s });
          if (!opts.includes(pick)) pick = null;
        }
        if (pick) g.moveTo(pick, "hand");
        toBottom(g, p, top.filter(c => c !== pick), true);
        g.log(pick ? `${p.name} reveals ${pick.def.name} and puts it into their hand (Harald).` : `${p.name} puts the top five cards on the bottom (Harald).`, { p, cards: pick ? [pick.def.name] : [] });
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "lookPick" ? cardPick(g, p, req.options) : undefined) }
  });

  /* Masked Admirers comes back when there's mana to spare: off our turn, in main 2, or with plenty left. */
  function admirersPay(g, p) {
    const spare = g.maxX(p, MK.parseCost(""), 1);
    return spare >= 2 && (g.active !== p || g.phase === "main2" || spare >= 6);
  }
  D({
    name: "Masked Admirers", cost: "{2}{G}{G}", type: "Creature — Elf Shaman", pt: "3/2",
    text: "When Masked Admirers enters, draw a card.\nWhenever you cast a creature spell, you may pay {G}{G}. If you do, return Masked Admirers from your graveyard to your hand.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) },
      {
        on: "cast", zone: "graveyard",
        when: (g, s, ev) => ev.p === s.owner && !!ev.o && ev.o.def.types.includes("Creature"),
        do: async (g, s, ev, { p }) => {
          const cost = MK.parseCost("{G}{G}");
          if (s.zone !== "graveyard" || !g.canPay(p, cost)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: "Masked Admirers: pay {G}{G} to return it from your graveyard to your hand?", src: s, purpose: "admirers" });
          if (!ok || s.zone !== "graveyard" || !g.pay(p, cost)) return;
          g.moveTo(s, "hand");
          g.log(`${p.name} pays {G}{G} and returns Masked Admirers to their hand.`, { p, cards: [s.def.name] });
        }
      }
    ],
    ai: { priority: 6, confirm: (g, p, req) => (req.purpose === "admirers" ? admirersPay(g, p) : true) }
  });

  /* ================================================================ the black Elves */
  D({
    name: "Miara, Thorn of the Glade", cost: "{1}{B}", type: "Legendary Creature — Elf Scout", pt: "1/2",
    text: "Whenever Miara, Thorn of the Glade or another Elf you control dies, you may pay {1} and 1 life. If you do, draw a card.\nPartner (You can have two commanders if both have partner.)",
    note: "Partner does nothing here: Miara is in the deck, not in the command zone.",
    triggers: [{
      on: "dies",
      when: (g, s, ev, slki) => ev.o === s || (!!ev.lki && ev.lki.controller === ctrlOf(s, slki) && ev.lki.subtypes.includes("Elf")),
      do: async (g, s, ev, { p }) => {
        const one = MK.parseCost("{1}");
        if (p.life <= 1 || !g.canPay(p, one)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Miara: pay {1} and 1 life to draw a card?", src: s, purpose: "miara" });
        if (!ok || p.life <= 1 || !g.pay(p, one)) return;
        g.payLife(p, 1);
        g.draw(p, 1);
        g.log(`${p.name} pays {1} and 1 life and draws a card (Miara).`, { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 6, confirm: (g, p, req) => (req.purpose === "miara" ? p.life > 10 && p.library.length > 5 : true) }
  });

  /* Lys Alana Scarblade: shrink an opposing threat to death. */
  function scarbladePick(g, p, options) {
    const x = elfCount(g, p);
    const pool = options || g.battlefield.filter(c => g.isCreature(c) && g.canTarget(p, c));
    const dies = c => g.toughness(c) <= x || (g.lethalDamageLeft(c) <= x && !g.kw(c, "indestructible"));
    const list = pool.filter(c => !g.isPlayer(c) && c.controller !== p && g.isCreature(c) && dies(c)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    return list[0] && threatOf(g, list[0], p) >= 5 ? list[0] : null;
  }
  D({
    name: "Lys Alana Scarblade", cost: "{2}{B}", type: "Creature — Elf Assassin", pt: "1/1",
    text: "{T}, Discard an Elf card: Target creature gets -X/-X until end of turn, where X is the number of Elves you control.",
    note: "The Elf card is discarded as the ability resolves.",
    abilities: [{
      label: "Discard an Elf: -X/-X", tap: true,
      condition: (g, o, p) => p.hand.some(c => isElfDef(c.def)),
      targets: [{ kind: "creature", purpose: "harm", prompt: "Lys Alana Scarblade: target creature gets -X/-X" }],
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const elves = p.hand.filter(c => isElfDef(c.def));
        if (!elves.length) { g.log(`${p.name} has no Elf card to discard.`, { p, cards: [s.def.name] }); return; }
        const r = await g.ask(p, { type: "cards", prompt: "Lys Alana Scarblade: discard an Elf card", options: elves, min: 1, max: 1, purpose: "discard", src: s });
        g.discard(p, (r || []).find(c => elves.includes(c)) || elves[0]);
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0]) return;
        const x = elfCount(g, p);
        if (x > 0) { g.pump(t, -x, -x); g.log(`${t.def.name} gets -${x}/-${x} until end of turn.`, { p, cards: [s.def.name, t.def.name] }); }
      },
      ai: { use: (g, p) => !!scarbladePick(g, p) }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "harm" ? scarbladePick(g, p, req.options) || undefined : undefined) }
  });

  /* Rhys the Exiled: regenerate (played as indestructible) when removal or a lethal fight comes his way. */
  function rhysThreatened(g, p, o, ctx) {
    if (g.kw(o, "indestructible")) return false;
    if (ctx.window === "stack") {
      const top = g.stack[g.stack.length - 1];
      if (!top || top.p === p) return false;
      const ai = top.o.def.ai || {};
      return !!ai.wipe || (!!ai.removal && top.targets.includes(o));
    }
    if (ctx.window === "combat" && g.combat && o.combat) {
      let incoming = 0, dt = false;
      const hit = c => { if (c && c.zone === "battlefield") { incoming += Math.max(0, g.power(c)); dt = dt || g.kw(c, "deathtouch"); } };
      if (o.combat.attacking) o.combat.blockedBy.forEach(hit);
      if (o.combat.blocking) hit(o.combat.blocking);
      return incoming > 0 && (dt || incoming >= g.lethalDamageLeft(o));
    }
    return false;
  }
  D({
    name: "Rhys the Exiled", cost: "{2}{G}", type: "Legendary Creature — Elf Warrior", pt: "3/2",
    text: "Whenever Rhys the Exiled attacks, you gain 1 life for each Elf you control.\n{B}, Sacrifice an Elf: Regenerate Rhys the Exiled.",
    triggers: [{ on: "attacks", self: true, do: (g, s, ev, { p }) => { const n = elfCount(g, p); if (n) g.gainLife(p, n, s); } }],
    abilities: [{
      label: "Sacrifice an Elf: regenerate", cost: "{B}",
      sacCost: { filter: (g, c, src) => c !== src && elfNow(g, c), prompt: "Rhys the Exiled: sacrifice an Elf" },
      do: (g, s) => g.regenerate(s),
      ai: { first: true, use: (g, p, o, ctx) => rhysThreatened(g, p, o, ctx) }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Skemfar Shadowsage", cost: "{2}{B}", type: "Creature — Elf Cleric", pt: "2/5",
    text: "When Skemfar Shadowsage enters, choose one —\n• Each opponent loses X life, where X is the greatest number of creatures you control that have a creature type in common.\n• You gain X life, where X is the greatest number of creatures you control that have a creature type in common.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const m = await g.ask(p, { type: "option", prompt: "Skemfar Shadowsage: choose one", options: [{ id: 0, label: "Each opponent loses X life" }, { id: 1, label: "You gain X life" }], purpose: "shadowsageMode", src: s });
        const x = tribeCount(g, p);
        if (m === 1) g.gainLife(p, x, s);
        else for (const q of g.opponents(p)) g.loseLife(q, x, s);
      }
    }],
    ai: {
      priority: 6,
      option: (g, p, req) => {
        if (req.purpose !== "shadowsageMode") return undefined;
        const x = tribeCount(g, p);
        const kill = g.opponents(p).some(q => q.life <= x);
        return !kill && p.life <= 15 ? 1 : 0;
      }
    }
  });

  D({
    name: "Elderfang Ritualist", cost: "{2}{B}", type: "Creature — Elf Cleric", pt: "3/1",
    text: "When Elderfang Ritualist dies, return another target Elf card from your graveyard to your hand.",
    triggers: [{
      on: "dies", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "card", from: (g2, pl) => pl.graveyard.filter(c => c !== s && isElfDef(c.def)), purpose: "reanimate", prompt: "Elderfang Ritualist: return another Elf card to your hand", trigger: true }, s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "hand"); g.log(`${p.name} returns ${t.def.name} to their hand (Elderfang Ritualist).`, { p, cards: [t.def.name] }); }
      }
    }],
    ai: { priority: 5 }
  });

  D({
    name: "Shaman of the Pack", cost: "{1}{B}{G}", type: "Creature — Elf Shaman", pt: "3/2",
    text: "When Shaman of the Pack enters, target opponent loses life equal to the number of Elves you control.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const q = await g.chooseTarget(p, { kind: "opponent", purpose: "harm", prompt: "Shaman of the Pack: target opponent loses life", trigger: true }, s);
        if (!q || q.lost) return;
        const n = elfCount(g, p);
        if (n) g.loseLife(q, n, s);
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.spec && req.spec.kind === "opponent" ? lowestLife(req.options, elfCount(g, p)) : undefined) }
  });

  D({
    name: "Poison-Tip Archer", cost: "{2}{B}{G}", type: "Creature — Elf Archer", pt: "2/3",
    keywords: ["reach", "deathtouch"],
    text: "Reach, deathtouch\nWhenever another creature dies, each opponent loses 1 life.",
    triggers: [{ on: "dies", when: (g, s, ev) => ev.o !== s, do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); } }],
    ai: { priority: 6 }
  });

  D({
    name: "Golgari Findbroker", cost: "{B}{B}{G}{G}", type: "Creature — Elf Shaman", pt: "3/4",
    text: "When Golgari Findbroker enters, return target permanent card from your graveyard to your hand.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "card", from: (g2, pl) => pl.graveyard.filter(c => !g2.isInstantOrSorcery(c)), purpose: "reanimate", prompt: "Golgari Findbroker: return target permanent card to your hand", trigger: true }, s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "hand"); g.log(`${p.name} returns ${t.def.name} to their hand (Golgari Findbroker).`, { p, cards: [t.def.name] }); }
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Ruthless Winnower", cost: "{3}{B}{B}", type: "Creature — Elf Rogue", pt: "4/4",
    text: "At the beginning of each player's upkeep, that player sacrifices a non-Elf creature.",
    triggers: [{
      on: "upkeep",
      do: async (g, s, ev) => {
        const q = ev.p;
        if (!q || q.lost) return;
        const opts = g.creatures(q).filter(o => !elfNow(g, o));
        if (!opts.length) return;
        let pick = opts.length === 1 ? opts[0] : await g.ask(q, { type: "target", prompt: "Ruthless Winnower: sacrifice a non-Elf creature", options: opts, purpose: "sacrifice", src: s });
        if (!pick || !opts.includes(pick)) pick = opts[0];
        g.sacrifice(pick);
      }
    }],
    ai: { priority: 7, threat: 2 }
  });

  /* ================================================================ artifacts */
  /* Serpent's Soul-Jar: the cards it exiled, still in exile. */
  function jarCards(g, s) { return (s.state.jar || []).filter(j => j.o.zone === "exile" && j.o.zc === j.zc).map(j => j.o); }
  function jarUse(g, p, o, ctx) {
    if (ctx.window !== "main1" && ctx.window !== "main2") return false;
    if (p.life < 12 || !g.canSorcery(p)) return false;
    return jarCards(g, o).some(c => c.def.types.includes("Creature") && c.def.mv >= 2 && g.canPay(p, g.spellCost(p, c, {})));
  }
  D({
    name: "Serpent's Soul-Jar", cost: "{2}{B}", type: "Artifact",
    text: "Whenever an Elf you control dies, exile it.\n{T}, Pay 2 life: Until end of turn, you may cast a creature spell from among cards exiled with Serpent's Soul-Jar.",
    triggers: [
      {
        on: "dies", when: (g, s, ev, slki) => ev.o !== s && !!ev.lki && !ev.lki.isToken && ev.lki.controller === ctrlOf(s, slki) && ev.lki.subtypes.includes("Elf"),
        do: (g, s, ev) => {
          const c = ev.o;
          if (c.zone !== "graveyard") return;
          g.moveTo(c, "exile");
          if (s.zone === "battlefield") (s.state.jar = s.state.jar || []).push({ o: c, zc: c.zc });
          g.log(`${c.def.name} is exiled with Serpent's Soul-Jar.`, { p: s.controller, cards: [c.def.name, s.def.name], kind: "exile" });
        }
      },
      {
        // one creature spell per activation: casting one ends the permission for the others
        on: "cast", when: (g, s, ev) => ev.p === s.controller && (s.state.jar || []).some(j => j.o === ev.o),
        do: (g, s, ev) => {
          s.state.jar = (s.state.jar || []).filter(j => j.o !== ev.o);
          for (const c of jarCards(g, s)) if (c.playable && c.playable.jar === s.id) c.playable = null;
          g.bump();
        }
      }
    ],
    abilities: [{
      label: "Cast a creature from the jar", tap: true, payLife: 2,
      condition: (g, o) => jarCards(g, o).some(c => c.def.types.includes("Creature")),
      do: (g, s, ctx) => {
        const list = jarCards(g, s).filter(c => c.def.types.includes("Creature"));
        for (const c of list) c.playable = { by: ctx.p, turn: g.turn, jar: s.id };
        g.bump();
        g.log(`${ctx.p.name} may cast a creature spell exiled with Serpent's Soul-Jar this turn.`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: { use: jarUse }
    }],
    ai: { priority: 5 }
  });

  /* ================================================================ enchantments */
  D({
    name: "Elderfang Venom", cost: "{2}{B}{G}", type: "Enchantment",
    text: "Attacking Elves you control have deathtouch.\nWhenever an Elf you control dies, each opponent loses 1 life and you gain 1 life.",
    statics: [{ applies: (g, s, o) => mine(s, o) && isElf(o) && !!(o.combat && o.combat.attacking) && g.isCreature(o), kw: ["deathtouch"] }],
    triggers: [{
      on: "dies", when: (g, s, ev, slki) => !!ev.lki && ev.lki.controller === ctrlOf(s, slki) && ev.lki.subtypes.includes("Elf"),
      do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); g.gainLife(p, 1, s); }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Moldervine Reclamation", cost: "{3}{B}{G}", type: "Enchantment",
    text: "Whenever a creature you control dies, you gain 1 life and draw a card.",
    triggers: [{ on: "dies", when: (g, s, ev, slki) => !!ev.lki && ev.lki.controller === ctrlOf(s, slki), do: (g, s, ev, { p }) => { g.gainLife(p, 1, s); g.draw(p, 1); } }],
    ai: { priority: 6 }
  });

  D({
    name: "Pride of the Perfect", cost: "{3}{B}", type: "Enchantment",
    text: "Elves you control get +2/+0.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isElf(o), pt: [2, 0] }],
    ai: { priority: 6, cast: (g, p) => { const n = myElves(g, p).length; return n >= 3 ? 12 + n * 0.5 : false; } }
  });

  D({
    name: "Prowess of the Fair", cost: "{1}{B}", type: "Kindred Enchantment — Elf",
    text: "Whenever another nontoken Elf is put into your graveyard from the battlefield, you may create a 1/1 green Elf Warrior creature token.",
    triggers: [{
      on: "leaves", optional: "Prowess of the Fair: create a 1/1 Elf Warrior?",
      when: (g, s, ev, slki) => ev.to === "graveyard" && ev.o !== s && !!ev.lki && !ev.lki.isToken && ev.lki.subtypes.includes("Elf") && ev.o.owner === ctrlOf(s, slki),
      do: (g, s, ev, { p }) => elfWarriors(g, p, 1)
    }],
    ai: { priority: 6 }
  });

  /* Crown of Skemfar: on the Abomination (vigilance, menace), else Lathril (menace, and her damage
     makes Elves), else the biggest creature that isn't a mana Elf. */
  const CROWN_SPEC = { kind: "creature", purpose: "crown", prompt: "Crown of Skemfar: enchant creature" };
  function crownTarget(g, p, options) {
    const own = (options || []).filter(o => !g.isPlayer(o) && o.controller === p && g.isCreature(o) && !g.kw(o, "defender"));
    const score = o => g.power(o) + (o.def.name === "Abomination of Llanowar" ? 8 : 0) + (o.def.name === LATHRIL ? 6 : 0) +
      (g.kw(o, "menace") || g.kw(o, "trample") ? 2 : 0) + (g.kw(o, "vigilance") ? 1 : 0) - (o.def.mana.length ? 3 : 0) - (o.isToken ? 1 : 0);
    return own.sort((a, b) => score(b) - score(a))[0] || null;
  }
  D({
    name: "Crown of Skemfar", cost: "{2}{B}{G}", type: "Enchantment — Aura",
    aura: true, enchant: "creature", targets: [CROWN_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, CROWN_SPEC, o).length > 0,
    text: "Enchant creature\nEnchanted creature gets +1/+1 for each Elf you control and has reach.\n{2}{G}: Return Crown of Skemfar from your graveyard to your hand.",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: (g, s) => { const n = elfCountDef(g, s.controller); return [n, n]; }, kw: ["reach"] }],
    gyAbilities: [{
      label: "Return to hand", cost: "{2}{G}",
      do: (g, s, ctx) => {
        if (s.zone !== "graveyard") return;
        g.moveTo(s, "hand");
        g.log(`${ctx.p.name} returns Crown of Skemfar to their hand.`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: { use: (g, p, o, ctx) => (ctx.window === "main2" || endBeforeMine(g, p, ctx)) && !!crownTarget(g, p, g.creatures(p)) }
    }],
    ai: {
      priority: 6,
      cast: (g, p) => (crownTarget(g, p, g.creatures(p)) && elfCountDef(g, p) >= 3 ? 12 + elfCountDef(g, p) * 0.5 : false),
      target: (g, p, req) => (req.purpose === "crown" ? crownTarget(g, p, req.options) || undefined : undefined)
    }
  });

  /* ================================================================ sorceries and instants */
  D({
    name: "Elvish Promenade", cost: "{3}{G}", type: "Kindred Sorcery — Elf",
    text: "Create a 1/1 green Elf Warrior creature token for each Elf you control.",
    spell: {
      do: (g, ctx) => {
        const n = elfCount(g, ctx.p);
        if (n) elfWarriors(g, ctx.p, n);
        else g.log(`${ctx.p.name} controls no Elves.`, { p: ctx.p });
      }
    },
    ai: {
      cast: (g, p) => {
        const n = elfCount(g, p);
        if (enablesDrain(g, p, n, 4)) return 60;
        return myElves(g, p).length >= 3 ? 12 + n : false;
      }
    }
  });

  /* Elven Ambush: at the end of the turn before ours (the tokens can attack and tap for Lathril),
     or at once when the tokens let Lathril drain right now. */
  function ambushPlan(g, p, o, ctx) {
    if (!(ctx.actions || []).some(a => a.type === "cast" && a.card === o)) return null;
    const n = elfCount(g, p);
    if (enablesDrain(g, p, n, 4)) return { type: "cast", card: o };
    if (ctx.window === "end" && g.nextPlayer(g.active) === p && n >= 3) return { type: "cast", card: o };
    return null;
  }
  D({
    name: "Elven Ambush", cost: "{3}{G}", type: "Instant",
    text: "Create a 1/1 green Elf Warrior creature token for each Elf you control.",
    spell: {
      do: (g, ctx) => {
        const n = elfCount(g, ctx.p);
        if (n) elfWarriors(g, ctx.p, n);
        else g.log(`${ctx.p.name} controls no Elves.`, { p: ctx.p });
      }
    },
    ai: { never: true, plan: ambushPlan }
  });

  D({
    name: "Eyeblight Massacre", cost: "{2}{B}{B}", type: "Sorcery",
    text: "Non-Elf creatures get -2/-2 until end of turn.",
    spell: {
      do: (g, ctx) => {
        const hit = g.battlefield.filter(o => g.isCreature(o) && !elfNow(g, o));
        if (hit.length) g.addEffect({ objs: hit, pt: [-2, -2] });
        g.log("Non-Elf creatures get -2/-2 until end of turn.", { p: ctx.p, cards: [ctx.o.def.name], kind: "big" });
      }
    },
    ai: { cast: shrinkWipeCast(2, (g, c) => elfNow(g, c)) }
  });

  /* Tergrid's Shadow: each player loses their two least valuable creatures. */
  function sacTwoLoss(g, q) {
    const vals = g.creatures(q).map(c => valueOf(g, c)).sort((a, b) => a - b);
    return (vals[0] || 0) + (vals[1] || 0);
  }
  function tergridCast(g, p) {
    const opp = g.opponents(p).reduce((s, q) => s + sacTwoLoss(g, q), 0);
    const me = sacTwoLoss(g, p);
    return opp >= 10 && opp >= me * 2 + 4 ? 18 + opp * 0.5 : false;
  }
  D({
    name: "Tergrid's Shadow", cost: "{3}{B}{B}", type: "Instant",
    text: "Each player sacrifices two creatures.",
    spell: {
      do: async (g, ctx) => {
        const all = [];
        for (const q of g.orderFrom(g.active)) {
          const pool = g.creatures(q);
          const chosen = pool.length <= 2 ? pool.slice() : [];
          while (chosen.length < 2 && pool.length > 2) {
            const opts = pool.filter(c => !chosen.includes(c));
            const t = await g.ask(q, { type: "target", prompt: `Tergrid's Shadow: sacrifice a creature (${chosen.length + 1} of 2)`, options: opts, purpose: "sacrifice", src: ctx.o });
            chosen.push(opts.includes(t) ? t : opts[0]);
          }
          all.push(...chosen);
        }
        // everyone's creatures go at the same time
        const live = all.filter(o => o.zone === "battlefield");
        for (const o of live) g.emit("sacrifice", { o, p: o.controller });
        g.toGraveyardFromBattlefield(live, "sacrifice");
      }
    },
    ai: { cast: tergridCast }
  });

  /* Casualties of War: one target per type, all different, from the opponents. */
  function casualtiesPlan(g, p) {
    const used = new Set();
    const out = {};
    const pick = (kind, min, extra) => {
      const list = g.battlefield.filter(o => o.controller !== p && !used.has(o.id) && g.kindMatch(o, kind) && g.canTarget(p, o) && (!extra || extra(o)))
        .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
      if (list[0] && threatOf(g, list[0], p) >= min) { used.add(list[0].id); out[kind] = list[0]; }
    };
    pick("planeswalker", 0);
    pick("creature", 3);
    pick("enchantment", 2, o => !g.isCreature(o));
    pick("artifact", 2, o => !g.isCreature(o));
    pick("land", -99, o => !g.isBasic(o));
    if (!out.land) pick("land", -99);
    return out;
  }
  function casualtiesCast(g, p) {
    const plan = casualtiesPlan(g, p);
    const hits = ["planeswalker", "creature", "enchantment", "artifact"].filter(k => plan[k]);
    const sum = hits.reduce((s, k) => s + threatOf(g, plan[k], p), 0);
    return (hits.length >= 2 && sum >= 9) || sum >= 11 ? 20 + sum * 0.5 : false;
  }
  const casualtySpec = kind => ({ kind, optional: true, purpose: "casualties", prompt: `Casualties of War: destroy target ${kind} (you may skip this one)` });
  D({
    name: "Casualties of War", cost: "{2}{B}{B}{G}{G}", type: "Sorcery",
    text: "Choose one or more —\n• Destroy target artifact.\n• Destroy target creature.\n• Destroy target enchantment.\n• Destroy target land.\n• Destroy target planeswalker.",
    note: "Each mode is a target you may skip.",
    spell: {
      targets: ["artifact", "creature", "enchantment", "land", "planeswalker"].map(casualtySpec),
      do: (g, ctx) => {
        const hit = [...new Set(ctx.targets.filter((t, i) => t && ctx.legal[i]))];
        if (!hit.length) { g.log("Casualties of War destroys nothing.", { p: ctx.p, cards: [ctx.o.def.name] }); return; }
        g.destroyAll(hit, ctx.o);
      }
    },
    ai: {
      cast: casualtiesCast,
      target: (g, p, req) => (req.purpose === "casualties" ? casualtiesPlan(g, p)[req.spec.kind] || null : undefined)
    }
  });

  /* Pact of the Serpent: finish an opponent who has as many creatures of one type as life, else draw
     off our own creatures, naming the type that draws the most without overfilling the hand
     (handAfter: our hand once the Pact has left it) or costing too much life. */
  function pactSelf(g, p, handAfter) {
    const cap = Math.min(7 - handAfter, p.life - 12, p.library.length - 8);
    let best = null, least = null;
    for (const { id } of typeOptions(g)) {
      const x = g.creatures(p).filter(o => g.hasSub(o, id)).length;
      if (x <= cap && (!best || x > best.x || (x === best.x && id === "Elf"))) best = { type: id, x, fits: true };
      if (!least || x < least.x) least = { type: id, x, fits: false };
    }
    return best || least;
  }
  function pactKill(g, p) {
    for (const q of g.opponents(p)) {
      if (g.playerHexproof(q)) continue;
      const b = bestTypeFor(g, q);
      if (b.type && b.n >= q.life) return { q, type: b.type };
    }
    return null;
  }
  D({
    name: "Pact of the Serpent", cost: "{1}{B}{B}", type: "Sorcery",
    text: "Choose a creature type. Target player draws X cards and loses X life, where X is the number of creatures they control of the chosen type.",
    spell: {
      targets: [{ kind: "player", purpose: "pact", prompt: "Pact of the Serpent: target player" }],
      do: async (g, ctx) => {
        const who = ctx.targets[0];
        if (!who || !ctx.legal[0] || who.lost) return;
        const opts = typeOptions(g);
        let t = await g.ask(ctx.p, { type: "option", prompt: "Pact of the Serpent: choose a creature type", options: opts, purpose: "creatureType", src: ctx.o, who });
        if (!opts.some(o => o.id === t)) t = "Elf";
        const x = g.creatures(who).filter(o => g.hasSub(o, t)).length;
        g.log(`${ctx.p.name} chooses ${t}: ${who.name} draws ${plural(x, "card")} and loses ${x} life.`, { p: ctx.p, cards: [ctx.o.def.name] });
        if (x > 0) { g.draw(who, x); g.loseLife(who, x, ctx.o); }
      }
    },
    ai: {
      draw: true,
      cast: (g, p) => {
        if (pactKill(g, p)) return 50;
        const self = pactSelf(g, p, p.hand.length - 1);
        return self && self.fits && self.x >= 3 ? 14 + self.x : false;
      },
      target: (g, p, req) => {
        if (req.purpose !== "pact") return undefined;
        const k = pactKill(g, p);
        if (k && req.options.includes(k.q)) return k.q;
        return req.options.includes(p) ? p : undefined;
      },
      option: (g, p, req) => {
        if (req.purpose !== "creatureType") return undefined;
        if (req.who && req.who !== p) { const b = bestTypeFor(g, req.who); if (b.type) return b.type; }
        return pactSelf(g, p, p.hand.length).type;
      }
    }
  });

  D({
    name: "Ambition's Cost", cost: "{3}{B}", type: "Sorcery",
    text: "You draw three cards and you lose 3 life.",
    spell: { do: (g, ctx) => { g.draw(ctx.p, 3); g.loseLife(ctx.p, 3, ctx.o); } },
    ai: { draw: true, priority: 6, hold: (g, p) => p.life <= 12 || p.library.length < 12 }
  });

  D({
    name: "Bounty of Skemfar", cost: "{2}{G}", type: "Sorcery",
    text: "Reveal the top six cards of your library. You may put a land card from among them onto the battlefield tapped and an Elf card from among them into your hand. Put the rest on the bottom of your library in a random order.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, src = ctx.o;
        const top = p.library.slice(0, 6);
        if (!top.length) return;
        g.log(`${p.name} reveals ${top.map(c => c.def.name).join(", ")}.`, { p, cards: top.map(c => c.def.name) });
        let land = null, elf = null;
        const lands = top.filter(c => c.def.types.includes("Land"));
        if (lands.length) {
          const r = await g.ask(p, { type: "cards", prompt: "Bounty of Skemfar: you may put a land card onto the battlefield tapped", options: lands, min: 0, max: 1, purpose: "tutor", src });
          land = (r || []).find(c => lands.includes(c)) || null;
        }
        const elves = top.filter(c => c !== land && isElfDef(c.def));
        if (elves.length) {
          elf = await g.ask(p, { type: "target", prompt: "Bounty of Skemfar: you may put an Elf card into your hand", options: elves, optional: true, purpose: "lookPick", extraLands: land ? 1 : 0, src });
          if (!elves.includes(elf)) elf = null;
        }
        if (land) g.putOntoBattlefield([land], p, { tapped: true });
        if (elf) g.moveTo(elf, "hand");
        toBottom(g, p, top.filter(c => c !== land && c !== elf), true);
        g.log(`${p.name} ${land ? "puts " + land.def.name + " onto the battlefield" : "finds no land"} and ${elf ? "takes " + elf.def.name : "finds no Elf card"} (Bounty of Skemfar).`, { p, cards: [land, elf].filter(Boolean).map(c => c.def.name) });
      }
    },
    ai: { ramp: true, priority: 7, target: (g, p, req) => (req.purpose === "lookPick" ? cardPick(g, p, req.options, req.extraLands) : undefined) }
  });

  function harvestCast(g, p) {
    const x = g.creatures(p).filter(c => c.tapped).length;
    if (x < 2 || p.library.filter(c => basicLandCard(g, c)).length < 2) return false;
    return 14 + Math.min(x, 6);
  }
  D({
    name: "Harvest Season", cost: "{2}{G}", type: "Sorcery",
    text: "Search your library for up to X basic land cards, where X is the number of tapped creatures you control, put those cards onto the battlefield tapped, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const x = g.creatures(ctx.p).filter(c => c.tapped).length;
        await g.search(ctx.p, { filter: basicLandCard, to: "battlefield", tapped: true, count: x, prompt: `Harvest Season: choose up to ${plural(x, "basic land card")}`, src: ctx.o });
      }
    },
    // best after combat, with the attackers tapped
    ai: { ramp: true, cast: harvestCast }
  });

  const RETURN_SPEC = { kind: "card", from: (g, p) => p.graveyard.filter(c => c.def.types.includes("Creature")), purpose: "reanimate", prompt: "Return Upon the Tide: return target creature card from your graveyard to the battlefield" };
  function returnCast(g, p) {
    const best = p.graveyard.filter(c => c.def.types.includes("Creature")).sort((a, b) => b.def.mv - a.def.mv)[0];
    return best && best.def.mv >= 3 ? 13 + best.def.mv * 0.8 + (isElfDef(best.def) ? 2 : 0) : false;
  }
  D({
    name: "Return Upon the Tide", cost: "{4}{B}", type: "Sorcery",
    text: "Return target creature card from your graveyard to the battlefield. If it's an Elf, create two 1/1 green Elf Warrior creature tokens.\nForetell {3}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
    note: "Foretell isn't in this game: it's always cast from your hand for {4}{B}.",
    spell: {
      targets: [RETURN_SPEC],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "graveyard") return;
        g.putOntoBattlefield([t], ctx.p);
        g.log(`${ctx.p.name} returns ${t.def.name} to the battlefield (Return Upon the Tide).`, { p: ctx.p, cards: [t.def.name] });
        if (isElfDef(t.def)) elfWarriors(g, ctx.p, 2);
      }
    },
    ai: { cast: returnCast }
  });

  /* Roots of Wisdom: a land while we're short of lands, else the best Elf card. */
  function rootsPick(g, p, options) {
    const lands = landsOf(g, p).length + p.hand.filter(c => c.def.types.includes("Land")).length;
    const land = options.find(c => c.def.types.includes("Land"));
    const score = c => (c.def.ai && c.def.ai.priority != null ? c.def.ai.priority : 5) + c.def.mv * 0.6;
    const elf = options.filter(c => isElfDef(c.def)).sort((a, b) => score(b) - score(a))[0];
    if (land && (lands < 5 || !elf)) return land;
    return elf || options[0];
  }
  D({
    name: "Roots of Wisdom", cost: "{1}{G}", type: "Sorcery",
    text: "Mill three cards, then return a land card or Elf card from your graveyard to your hand. If you can't, draw a card.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const milled = p.library.slice(0, 3);
        g.mill(p, 3);
        if (milled.length) g.log(`${p.name} mills ${milled.map(c => c.def.name).join(", ")}.`, { p, cards: milled.map(c => c.def.name) });
        const opts = p.graveyard.filter(c => c.def.types.includes("Land") || isElfDef(c.def));
        if (!opts.length) { g.draw(p, 1); g.log(`${p.name} has no land or Elf card in their graveyard and draws a card.`, { p, cards: [ctx.o.def.name] }); return; }
        let pick = await g.ask(p, { type: "target", prompt: "Roots of Wisdom: return a land card or Elf card to your hand", options: opts, purpose: "roots", src: ctx.o });
        if (!opts.includes(pick)) pick = opts[0];
        g.moveTo(pick, "hand");
        g.log(`${p.name} returns ${pick.def.name} to their hand (Roots of Wisdom).`, { p, cards: [pick.def.name] });
      }
    },
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "roots" ? rootsPick(g, p, req.options) : undefined) }
  });

  D({
    name: "Poison the Cup", cost: "{1}{B}{B}", type: "Instant",
    text: "Destroy target creature. If this spell was foretold, scry 2.\nForetell {1}{B} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
    note: "Foretell isn't in this game: it's always cast from your hand for {1}{B}{B}, so it never scries.",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Poison the Cup: destroy target creature" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
    },
    ai: { removal: true, minThreat: 4 }
  });

  D({
    name: "Putrefy", cost: "{1}{B}{G}", type: "Instant",
    text: "Destroy target artifact or creature. It can't be regenerated.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Putrefy: destroy target artifact or creature", filter: (g, o) => g.isArtifact(o) || g.isCreature(o) }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o, { noRegen: true }); }
    },
    ai: { removal: true, minThreat: 4 }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const BG = ["B", "G"];

  land("Jungle Hollow", {
    text: "Jungle Hollow enters tapped.\nWhen Jungle Hollow enters, you gain 1 life.\n{T}: Add {B} or {G}.",
    etbTapped: true,
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }],
    mana: [{ tap: true, produce: BG }]
  });
  land("Golgari Guildgate", {
    type: "Land — Gate",
    text: "Golgari Guildgate enters tapped.\n{T}: Add {B} or {G}.",
    etbTapped: true,
    mana: [{ tap: true, produce: BG }]
  });
  land("Foul Orchard", {
    text: "Foul Orchard enters tapped.\n{T}: Add {B} or {G}.",
    etbTapped: true,
    mana: [{ tap: true, produce: BG }]
  });
  land("Temple of Malady", {
    text: "Temple of Malady enters tapped.\nWhen Temple of Malady enters, scry 1.\n{T}: Add {B} or {G}.",
    etbTapped: true,
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => scry1(g, p, s) }],
    mana: [{ tap: true, produce: BG }],
    ai: { confirm: scryConfirm }
  });
  land("Path of Ancestry", {
    text: "Path of Ancestry enters tapped.\n{T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell that shares a creature type with your commander, scry 1.",
    note: "The scry happens when the next spell you cast after tapping it for mana is a creature spell that shares a creature type with your commander.",
    etbTapped: true,
    mana: [{ tap: true, produce: "any", after: (g, o) => { o.state.pathMana = { turn: g.turn, spells: g.stats.spells }; } }],
    triggers: [{
      on: "cast",
      when: (g, s, ev) => {
        const m = s.state.pathMana;
        return !!m && ev.p === s.controller && m.turn === g.turn && m.spells === g.stats.spells - 1 && !!ev.o && ev.o.def.types.includes("Creature") && sharesCommanderType(ev.p, ev.o.def);
      },
      do: async (g, s, ev, { p }) => { s.state.pathMana = null; await scry1(g, p, s); }
    }],
    ai: { confirm: scryConfirm }
  });

  /* Skemfar Elderhall: late in the game, or when two more Elves let Lathril drain this turn. */
  function elderhallUse(g, p, o, ctx) {
    if (ctx.window !== "main1" && ctx.window !== "main2") return false;
    if (ctx.window === "main1" && drainGap(g, p) <= 2) return true;
    const kill = g.battlefield.some(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && g.lethalDamageLeft(c) <= 2 && threatOf(g, c, p) >= 4);
    return landsOf(g, p).length >= 8 && (kill || ctx.window === "main2");
  }
  land("Skemfar Elderhall", {
    text: "Skemfar Elderhall enters tapped.\n{T}: Add {B}.\n{2}{B}{B}{G}, {T}, Sacrifice Skemfar Elderhall: Up to one target creature you don't control gets -2/-2 until end of turn. Create two 1/1 green Elf Warrior creature tokens. Activate only as a sorcery.",
    etbTapped: true,
    mana: [{ tap: true, produce: "B" }],
    abilities: [{
      label: "Sacrifice: -2/-2 and two Elf Warriors", cost: "{2}{B}{B}{G}", tap: true, sacSelf: true, timing: "sorcery",
      targets: [{ kind: "creature", opp: true, optional: true, purpose: "harm", amount: 2, prompt: "Skemfar Elderhall: up to one target creature you don't control gets -2/-2" }],
      do: (g, s, ctx) => {
        const t = ctx.targets[0];
        if (t && ctx.legal[0]) { g.pump(t, -2, -2); g.log(`${t.def.name} gets -2/-2 until end of turn.`, { p: ctx.p, cards: [s.def.name, t.def.name] }); }
        elfWarriors(g, ctx.p, 2);
      },
      ai: { use: elderhallUse }
    }]
  });

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "lathril", name: "Lathril", title: LATHRIL, commander: LATHRIL,
    identity: ["B", "G"], bracket: 2, precon: "Elven Empire (Kaldheim Commander, 2021)", aggression: 0.55,
    style: "Elf swarm",
    blurb: "Mana Elves and Elf lords fill the board with Elf Warrior tokens until Lathril can tap ten of them to drain every opponent for 10.",
    watch: [LATHRIL, "Elvish Promenade", "Elven Ambush", "Voice of the Woods", "Eyeblight Massacre"],
    list: [
      // mana Elves and ramp creatures
      "Elvish Mystic", "Jaspera Sentinel", "Elvish Archdruid", "Marwyn, the Nurturer", "Llanowar Tribe", "Canopy Tactician",
      "Wirewood Channeler", "Llanowar Visionary", "Wood Elves", "Farhaven Elf", "Elvish Rejuvenator", "Springbloom Druid",
      // Elves that make Elves, lords and big Elves
      "Elvish Warmaster", "Imperious Perfect", "Lys Alana Huntmaster", "Wolverine Riders", "Eyeblight Cullers", "Cultivator of Blades",
      "Dwynen, Gilt-Leaf Daen", "Abomination of Llanowar", "Voice of the Woods", "Twinblade Assassins", "End-Raze Forerunners",
      // Elves with a job
      "Jagged-Scar Archers", "Timberwatch Elf", "Reclamation Sage", "Nullmage Shepherd", "Sylvan Messenger", "Harald, King of Skemfar",
      "Masked Admirers", "Beast Whisperer", "Miara, Thorn of the Glade", "Lys Alana Scarblade", "Rhys the Exiled", "Skemfar Shadowsage",
      "Elderfang Ritualist", "Shaman of the Pack", "Poison-Tip Archer", "Golgari Findbroker", "Ruthless Winnower",
      // artifacts and enchantments
      "Sol Ring", "Arcane Signet", "Serpent's Soul-Jar", "Elderfang Venom", "Moldervine Reclamation", "Pride of the Perfect",
      "Prowess of the Fair", "Crown of Skemfar",
      // sorceries and instants
      "Elvish Promenade", "Elven Ambush", "Bounty of Skemfar", "Harvest Season", "Roots of Wisdom", "Ambition's Cost",
      "Pact of the Serpent", "Return Upon the Tide", "Eyeblight Massacre", "Tergrid's Shadow", "Casualties of War",
      "Poison the Cup", "Putrefy", "Assassin's Trophy",
      // lands
      "Command Tower", "Path of Ancestry", "Myriad Landscape", "Jungle Hollow", "Golgari Guildgate", "Foul Orchard",
      "Temple of Malady", "Skemfar Elderhall",
      ...Array(16).fill("Forest"), ...Array(13).fill("Swamp")
    ]
  });
})(typeof window !== "undefined" ? window : globalThis);
