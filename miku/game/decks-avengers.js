/* Captain America, Team Leader: a Bracket 3 Jeskai Heroes deck for the bots, built from the retail
   "Avengers Assemble" precon (Marvel Super Heroes Commander, 2026) and upgraded.
   How it wins: every Hero that enters gets a +1/+1 counter, vigilance and haste from Captain
   America (and Captain America grows too). Agent Phil Coulson, Cathars' Crusade, Methods of the
   Mighty, Iron Man and Shang-Chi keep the counters coming; Captain Marvel copies them onto
   herself; War Machine gives every modified attacker double strike and Iron Man gives them flying;
   Hawkeye, Trick Shot shoots something each time a Hero enters.
   Jarvis, Folk Hero, Kindred Discovery, Director Nick Fury, Herald's Horn and Rhystic Study keep the
   hand full; Swords, Path, Lightning Bolt, the Marvel removal, three counterspells and Teferi's
   Protection keep the team alive.
   The upgrade cut the precon's slow or narrow cards (Avenge, Heroic Sacrifice, Heroic Return, Love
   on the Battlefield, Gift of Immortality, Speed, Patriot, Photon, Jocasta, She-Hulk, Hero's Blade,
   Hulkbuster Armor, the Quinjet, Tome of Legends, Door of Destinies, Dismantling Wave, Raise the
   Palisade, the tapped lands) for stronger Heroes (Hawkeye, Trick Shot; Captain America, Skybound;
   Captain Marvel, Shooting Star; The Falcon; Luke Cage...), better removal and interaction, and a
   faster mana base. Four game changers: Rhystic Study, Smothering Tithe, Cyclonic Rift, Teferi's
   Protection.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   The bot brain (MK.DECK_BRAINS.avengers) keeps Captain America out of attacks that could kill him. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const CAP = "Captain America, Team Leader";
  const cost = s => MK.parseCost(s);

  /* ================================================================ helpers */
  const trig = spec => Object.assign({ trigger: true }, spec);
  const maxBy = (list, f) => { let best = null, bs = -Infinity; for (const x of list) { const s = f(x); if (s > bs) { bs = s; best = x; } } return best; };
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));
  const manaNow = (g, p) => g.maxX(p, cost(""), 1);
  const nextIsMe = (g, p) => g.active !== p && g.nextPlayer(g.active) === p;
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && nextIsMe(g, p);
  /* Hero tests: a card (also a spell on the stack), or a permanent with its current types. */
  const isHeroDef = d => !!d && (d.subtypes.includes("Hero") || !!d.changeling);
  const isHero = (g, o) => g.hasSub(o, "Hero");
  const isCreatureCard = c => c.def.types.includes("Creature");
  /* "Modified": it has counters, or an Equipment or Aura its controller controls is attached to it. */
  const modified = (g, o) => Object.keys(o.counters).some(k => (o.counters[k] || 0) > 0) ||
    g.battlefield.some(a => a.attachedTo === o && a.controller === o.controller && (a.def.subtypes.includes("Equipment") || a.def.subtypes.includes("Aura")));
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, { p, cards: [src.def.name] });
    return got;
  }
  const attackingMine = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield") : []);
  /* Best "harm" option, the way the bots rate threats. */
  function bestHarm(g, p, opts) {
    const list = opts.filter(o => !g.isPlayer(o) && o.controller !== p);
    return list.length ? maxBy(list, o => threatOf(g, o, p)) : null;
  }
  function harmScore(g, p, opts) { const b = bestHarm(g, p, opts); return b ? threatOf(g, b, p) : -1; }
  const specOpts = (g, p, spec, src) => g.targetOptions(p, spec, src);
  /* `canChoose` of a "choose one" mode (called as the mode's method): its targets have options. */
  function modeHasTarget(g, p, o) { return (this.targets || []).every(spec => spec.optional || g.targetOptions(p, spec, o).length > 0); }

  /* ================================================================ tokens */
  const BIRD = MK.tokenDef({ key: "bird-w-falcon", name: "Bird", pt: [1, 1], colors: "W", subtypes: ["Bird"], keywords: ["flying"] });

  /* ================================================================ the commander */
  D({
    name: CAP, cost: "{R}{W}{U}", type: "Legendary Creature — Human Soldier Hero", pt: "3/3",
    text: "Whenever another Hero you control enters, it gains vigilance and haste until end of turn. Put a +1/+1 counter on that Hero and a +1/+1 counter on Captain America.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && isHero(g, ev.o),
      do: (g, s, ev, { p }) => {
        const o = ev.o;
        if (o.zone === "battlefield") {
          g.grant([o], ["vigilance", "haste"]);
          g.addCounters(o, "p1", 1, s);
          g.log(`${o.def.name} gains vigilance and haste (Captain America).`, { p, cards: [o.def.name] });
        }
        if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
      }
    }],
    ai: { priority: 9 }
  });

  /* ================================================================ creatures */
  D({
    name: "Agent Phil Coulson", cost: "{1}{W}", type: "Legendary Creature — Human Spy Hero", pt: "2/2",
    keywords: ["vigilance"],
    text: "Vigilance\n{T}: Put a +1/+1 counter on each other Hero you control.",
    abilities: [{
      label: "Counter on each other Hero", tap: true,
      do: (g, s, ctx) => {
        const list = g.creatures(ctx.p).filter(o => o !== s && isHero(g, o));
        for (const o of list) g.addCounters(o, "p1", 1, s);
        if (list.length) g.log(`${ctx.p.name} puts a +1/+1 counter on each other Hero (${list.length}).`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: {
        use: (g, p, o, ctx) => {
          const n = g.creatures(p).filter(c => c !== o && isHero(g, c)).length;
          if (n < 1) return false;
          if (g.active === p && ctx.window === "main1") return n >= 2;
          return endBeforeMe(g, p, ctx) || (g.active === p && ctx.window === "main2");
        }
      }
    }],
    ai: { priority: 8 }
  });

  D({
    name: "The Wasp, Winsome Avenger", cost: "{1}{U}", type: "Legendary Creature — Human Hero", pt: "2/1",
    keywords: ["flash", "flying"],
    text: "Flash\nFlying\nWhen The Wasp enters, target Hero gains hexproof until end of turn.\nWhenever The Wasp attacks, tap target creature defending player controls.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "help", prompt: "The Wasp: target Hero gains hexproof until end of turn", filter: (g2, o) => isHero(g2, o) }), s);
          if (t) { g.grant([t], ["hexproof"]); g.log(`${t.def.name} gains hexproof.`, { p, cards: [s.def.name] }); }
        }
      },
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const q = g.defenderOf(ev.target);
          if (!q || q === p) return;
          const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", prompt: "The Wasp: tap target creature defending player controls", filter: (g2, o) => o.controller === q && !o.tapped }), s);
          if (t) g.tap(t);
        }
      }
    ],
    ai: { priority: 6, instantEnd: true }
  });

  D({
    name: "Hero in Training", cost: "{2}{W}", type: "Creature — Human Hero", pt: "2/2",
    text: "When this creature enters, draw a card. If you control another Hero, you gain 2 life.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        drawLog(g, p, 1, s);
        if (g.creatures(p).some(o => o !== s && isHero(g, o))) g.gainLife(p, 2, s);
      }
    }],
    ai: { priority: 6, draw: true }
  });

  D({
    name: "Falcon and Redwing", cost: "{2}{W}", type: "Legendary Creature — Human Bird Hero", pt: "1/2",
    keywords: ["flying"],
    text: "Flying\nWhenever Falcon and Redwing deal combat damage to a player, create that many 1/1 white Bird creature tokens with flying, then put a +1/+1 counter on Falcon and Redwing.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: (g, s, ev, { p }) => {
        if (ev.amount > 0) g.createToken(p, BIRD, { count: Math.min(ev.amount, 20) });
        if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Captain America, Living Legend", cost: "{1}{W}{U}", type: "Legendary Creature — Human Soldier Hero", pt: "3/4",
    keywords: ["vigilance"],
    text: "Vigilance\nWhenever a creature you control becomes tapped during your turn, if it's the first time that creature has become tapped this turn, untap it.",
    triggers: [{
      on: "becomesTapped",
      when: (g, s, ev) => {
        const o = ev.o;
        if (!o || o.controller !== s.controller || g.active !== s.controller || !g.isCreature(o)) return false;
        if (o.state.legendTap === g.turn) return false;
        o.state.legendTap = g.turn;
        return true;
      },
      do: (g, s, ev) => { if (ev.o.zone === "battlefield" && ev.o.tapped) g.untap(ev.o); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Captain America, Wings of Freedom", cost: "{2}{W}", type: "Legendary Creature — Human Soldier Hero", pt: "3/1",
    keywords: ["flying", "first strike"],
    text: "Flying, first strike, ward {1}\nWhenever Captain America attacks, each other Hero you control gets +X/+X until end of turn, where X is Captain America's toughness.",
    triggers: [
      MK.wardTrigger(1),
      {
        on: "attacks", self: true, late: true,
        do: (g, s, ev, { p }) => {
          if (s.zone !== "battlefield") return;
          const x = Math.max(0, g.toughness(s));
          const list = g.creatures(p).filter(o => o !== s && isHero(g, o));
          if (x > 0 && list.length) { g.addEffect({ objs: list, pt: [x, x] }); g.log(`Each other Hero ${p.name} controls gets +${x}/+${x}.`, { p, cards: [s.def.name] }); }
        }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Jarvis, Earth's Mightiest Butler", cost: "{2}{U}", type: "Legendary Creature — Human Advisor", pt: "1/4",
    text: "Whenever you cast a Hero spell, draw a card.",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && isHeroDef(ev.o.def), do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }],
    ai: { priority: 8, draw: true }
  });

  D({
    name: "Director Nick Fury", cost: "{U}{R}{W}", type: "Legendary Creature — Human Spy Hero", pt: "2/4",
    text: "Hero spells you cast cost {1} less to cast.\nWhenever you attack, look at the top four cards of your library. You may reveal a Hero card from among them and put that card into your hand. Put the rest on the bottom of your library in a random order.",
    statics: [{ costMod: (g, s, card) => (isHeroDef(card.def) && card.owner === s.controller ? 1 : 0) }],
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 4);
        if (!top.length) return;
        const heroes = top.filter(c => isHeroDef(c.def));
        let pick = null;
        if (heroes.length) {
          const r = await g.ask(p, { type: "cards", prompt: "Director Nick Fury: reveal a Hero card and put it into your hand", options: heroes, min: 0, max: 1, purpose: "furyPick", src: s });
          pick = r && r[0] && heroes.includes(r[0]) ? r[0] : null;
        }
        if (pick && pick.zone === "library") { g.moveTo(pick, "hand"); g.log(`${p.name} reveals ${pick.def.name} and puts it into their hand (Director Nick Fury).`, { p, cards: [pick.def.name] }); }
        for (const c of g.shuffleArr(top.filter(c => c !== pick && c.zone === "library"))) g.moveTo(c, "library", { bottom: true });
      }
    }],
    ai: { priority: 8, cards: (g, p, req) => (req.purpose === "furyPick" ? [maxBy(req.options, c => c.def.mv + (c.def.keywords.includes("flying") ? 1 : 0))] : null) }
  });

  D({
    name: "Ant-Man, Elusive Avenger", cost: "{1}{U}{R}", type: "Legendary Creature — Human Rogue Hero", pt: "1/2",
    text: "Ant-Man can't be blocked by creatures with greater power.\nWhenever Ant-Man deals combat damage to a player, create that many Treasure tokens.",
    canBeBlockedBy: (g, a, b) => g.power(b) <= g.power(a),
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => { if (ev.amount > 0) g.createToken(p, T.treasure, { count: Math.min(ev.amount, 20) }); } }],
    ai: { priority: 7 }
  });

  D({
    name: "Shang-Chi and the Ten Rings", cost: "{1}{W}{U}", type: "Legendary Creature — Human Warrior Hero", pt: "2/2",
    keywords: ["first strike"],
    text: "First strike\nWhenever you draw a card, put a +1/+1 counter on Shang-Chi.\nWhen the tenth +1/+1 counter is put on Shang-Chi, you draw five cards and gain 5 life.",
    triggers: [
      { on: "draw", when: (g, s, ev) => ev.p === s.controller, do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); } },
      {
        on: "counters",
        when: (g, s, ev) => {
          if (ev.o !== s || ev.kind !== "p1" || s.state.tenth) return false;
          const now = s.counters.p1 || 0;
          if (now >= 10 && now - ev.n < 10) { s.state.tenth = true; return true; }
          return false;
        },
        do: (g, s, ev, { p }) => { drawLog(g, p, 5, s); g.gainLife(p, 5, s); }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "The Mighty Thor, Jane Foster", cost: "{1}{W}{U}", type: "Legendary Creature — Human God Hero", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever The Mighty Thor attacks, exile up to one target nontoken artifact or creature, then return that card to the battlefield tapped under its owner's control.\nWhenever an Equipment you control enters, draw a card.",
    note: "A commander exiled this way goes to the command zone instead.",
    triggers: [
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "permanent", purpose: "harm", optional: true, prompt: "The Mighty Thor: exile up to one target nontoken artifact or creature, then return it tapped", filter: (g2, o) => !o.isToken && (g2.isCreature(o) || g2.isArtifact(o)) }), s);
          if (!t || t.zone !== "battlefield") return;
          const owner = t.owner;
          g.exile(t, s);
          if (t.zone === "exile") { g.putOntoBattlefield([t], owner, { tapped: true }); g.log(`${t.def.name} returns to the battlefield tapped.`, { p, cards: [t.def.name] }); }
        }
      },
      { on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && ev.o.def.subtypes.includes("Equipment"), do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }
    ],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.src && req.src.def.name !== "The Mighty Thor, Jane Foster") return undefined;
        // the best untapped blocker, else an opposing permanent with counters or Auras
        const opp = req.options.filter(o => o.controller !== p);
        const blockers = opp.filter(o => g.isCreature(o) && !o.tapped);
        if (blockers.length) return maxBy(blockers, o => threatOf(g, o, p));
        const pumped = opp.filter(o => (o.counters.p1 || 0) > 0);
        return pumped.length ? maxBy(pumped, o => o.counters.p1) : null;
      }
    }
  });

  D({
    name: "Firebird, Blazing Ranger", cost: "{2}{R}", type: "Legendary Creature — Human Ranger Hero", pt: "1/3",
    keywords: ["flying"],
    text: "Flying\nWhenever Firebird attacks, other attacking creatures get +X/+0 until end of turn, where X is Firebird's power.",
    triggers: [{
      on: "attacks", self: true, late: true,
      do: (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        const x = Math.max(0, g.power(s));
        const list = attackingMine(g, p).filter(o => o !== s);
        if (x > 0 && list.length) { g.addEffect({ objs: list, pt: [x, 0] }); g.log(`Other attacking creatures get +${x}/+0 (Firebird).`, { p, cards: [s.def.name] }); }
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Daredevil, Man Without Fear", cost: "{2}{R}{W}", type: "Legendary Creature — Human Hero", pt: "3/4",
    keywords: ["vigilance", "haste"],
    text: "Vigilance, haste\nRadar Sense — You may look at the top card of your library any time.\nWhenever you attack, you may exile the top card of your library. If that card is a Hero card, Daredevil gets +2/+1 until end of turn. You may play that card this turn.",
    note: "Radar Sense isn't shown: the top card stays hidden.",
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller, optional: "Daredevil: exile the top card of your library? (You may play it this turn.)",
      do: (g, s, ev, { p }) => {
        const got = g.impulse(p, 1);
        if (got[0] && isHeroDef(got[0].def) && s.zone === "battlefield") { g.pump(s, 2, 1); g.log(`Daredevil gets +2/+1.`, { p, cards: [s.def.name] }); }
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Metallic Mimic", cost: "{2}", type: "Artifact Creature — Shapeshifter", pt: "2/1",
    text: "As Metallic Mimic enters, choose a creature type.\nMetallic Mimic is the chosen type in addition to its other types.\nEach other creature you control of the chosen type enters with an additional +1/+1 counter on it.",
    note: "The extra counter is put on the creature right after it enters. A bot names its deck's main type.",
    etbState: (g, o) => ({ chosenType: (MK.DECK_TYPES && MK.DECK_TYPES[o.controller.deckId]) || mimicType(o.controller) }),
    triggers: [
      {
        on: "enters", self: true, when: (g, s) => !!s.controller.human,
        do: async (g, s, ev, { p }) => {
          const types = mimicTypes(p).slice(0, 8);
          if (types.length < 2) return;
          const k = await g.ask(p, { type: "option", prompt: "Metallic Mimic: choose a creature type", options: types.map(t => ({ id: t, label: t })), purpose: "creatureType", src: s });
          if (types.includes(k) && s.zone === "battlefield") { s.state.chosenType = k; g.bump(); }
          g.log(`${p.name} chooses ${s.state.chosenType} for Metallic Mimic.`, { p, cards: [s.def.name] });
        }
      },
      {
        on: "enters",
        when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && !!s.state.chosenType && g.hasSub(ev.o, s.state.chosenType),
        do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.addCounters(ev.o, "p1", 1, s); }
      }
    ],
    statics: [{ applies: (g, s, o) => o === s && !!s.state.chosenType, subtypes: (g, s) => [s.state.chosenType] }],
    ai: { priority: 7 }
  });
  function mimicTypes(p) {
    const n = new Map();
    for (const z of ["library", "hand", "graveyard", "command"]) for (const c of p[z]) if (isCreatureCard(c)) for (const t of c.def.subtypes) n.set(t, (n.get(t) || 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1]).map(x => x[0]);
  }
  function mimicType(p) { return mimicTypes(p)[0] || "Human"; }

  D({
    name: "Iron Man, Armored Avenger", cost: "{3}{U}", type: "Legendary Artifact Creature — Human Hero", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever you draw a card, put a +1/+1 counter on target creature.\nWhenever Iron Man attacks, other attacking modified creatures gain flying until end of turn. (Equipment, Auras you control, and counters are modifications.)",
    triggers: [
      {
        on: "draw", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "ironCounter", prompt: "Iron Man: put a +1/+1 counter on target creature" }), s);
          if (t) g.addCounters(t, "p1", 1, s);
        }
      },
      {
        on: "attacks", self: true, late: true,
        do: (g, s, ev, { p }) => {
          const list = attackingMine(g, p).filter(o => o !== s && modified(g, o));
          if (list.length) { g.grant(list, ["flying"]); g.log(`${list.length} modified attacker${list.length > 1 ? "s gain" : " gains"} flying (Iron Man).`, { p, cards: [s.def.name] }); }
        }
      }
    ],
    ai: { priority: 8, target: (g, p, req) => (req.purpose === "ironCounter" ? counterTarget(g, p, req.options) : undefined) }
  });
  /* Where a free +1/+1 counter does the most: Captain Marvel copies it, unmodified creatures become
     "modified" (War Machine, Iron Man), fliers and double strikers hit harder. */
  function counterTarget(g, p, opts) {
    const mine = opts.filter(o => o.controller === p);
    if (!mine.length) return undefined;
    const marvel = g.creatures(p).some(o => o.def.name === "Captain Marvel, Apex Avenger");
    return maxBy(mine, o => {
      let s = valueOf(g, o) * 0.2;
      if (marvel && o.def.name !== "Captain Marvel, Apex Avenger" && !o.def.subtypes.includes("Kree")) s += 3;
      if (!modified(g, o)) s += 2;
      if (g.kw(o, "flying")) s += 1.5;
      if (g.kw(o, "double strike")) s += 1.5;
      if (o.isCommander) s += 1;
      if (o.def.name === "Shang-Chi and the Ten Rings") s += 1;
      return s;
    });
  }

  D({
    name: "Hawkeye, Avenging Archer", cost: "{2}{U}{R}", type: "Legendary Creature — Human Archer Hero", pt: "3/4",
    keywords: ["reach"],
    text: "Reach\nWhenever a creature an opponent controls dies, if Hawkeye dealt damage to it this turn, draw a card.\n{T}: Hawkeye deals 1 damage to any target.",
    triggers: [
      {
        // remembers the creatures it damaged this turn (never triggers)
        on: "damage",
        when: (g, s, ev) => {
          if (ev.src === s && ev.target && !ev.toPlayer && ev.target.def) {
            if (!s.state.hit || s.state.hit.turn !== g.turn) s.state.hit = { turn: g.turn, ids: [] };
            s.state.hit.ids.push(ev.target.id);
          }
          return false;
        },
        do: () => {}
      },
      {
        on: "dies",
        when: (g, s, ev) => !!ev.lki && ev.lki.controller !== s.controller && !!s.state.hit && s.state.hit.turn === g.turn && s.state.hit.ids.includes(ev.o.id),
        do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
      }
    ],
    abilities: [{
      label: "1 damage", tap: true,
      targets: [{ kind: "any", purpose: "harm", amount: 1, prompt: "Hawkeye deals 1 damage to" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) || (g.active === p && ctx.window === "main2") }
    }],
    ai: { priority: 7, target: (g, p, req) => (req.src && req.src.def.name === "Hawkeye, Avenging Archer" && req.purpose === "harm" ? pingTarget(g, p, req.options) : undefined) }
  });
  /* 1 damage: kill an X/1 worth killing, else hit the weakest opponent. */
  function pingTarget(g, p, opts) {
    const kills = opts.filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o) && !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= 1);
    if (kills.length) return maxBy(kills, o => threatOf(g, o, p));
    const pl = opts.filter(o => g.isPlayer(o) && o !== p);
    return pl.length ? pl.slice().sort((a, b) => a.life - b.life)[0] : undefined;
  }

  D({
    name: "Scarlet Witch, Chaotic Avenger", cost: "{2}{U}{R}", type: "Legendary Creature — Mutant Warlock Hero", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever Scarlet Witch deals combat damage to a player, look at the top two cards of your library, then exile them face down. Then you may cast a Hero or noncreature spell from among cards exiled with Scarlet Witch without paying its mana cost.",
    note: "Only the cards exiled by this trigger can be cast.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 2);
        if (!top.length) return;
        for (const c of top) g.moveTo(c, "exile");
        g.log(`${p.name} exiles the top ${top.length} card${top.length > 1 ? "s" : ""} face down (Scarlet Witch).`, { p, cards: [s.def.name] });
        const opts = top.filter(c => c.zone === "exile" && !c.def.types.includes("Land") && (isHeroDef(c.def) || !isCreatureCard(c)));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Scarlet Witch: cast a Hero or noncreature spell from among them without paying its mana cost", options: opts, optional: true, purpose: "witchCast", src: s });
        if (pick && opts.includes(pick) && pick.zone === "exile") await g.castWithoutPaying(p, pick);
      }
    }],
    ai: {
      priority: 7,
      // the best free spell, never one that only matters in response (protection, counterspells) or an X spell
      target: (g, p, req) => {
        if (req.purpose !== "witchCast") return undefined;
        const ok = req.options.filter(c => { const h = c.def.ai || {}; return !h.protection && !h.counter && !h.never && !/\{X\}/.test(c.def.cost || "") && c.def.name !== "West Coast Expansion"; });
        return maxBy(ok, c => c.def.mv) || null;
      }
    }
  });

  D({
    name: "Bastion Protector", cost: "{2}{W}", type: "Creature — Human Soldier", pt: "3/3",
    text: "Commander creatures you control get +2/+2 and have indestructible.",
    statics: [{ applies: (g, s, o) => !!o.isCommander && o.controller === s.controller && g.isCreature(o), pt: [2, 2], kw: ["indestructible"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Vision, Synthezoid Avenger", cost: "{4}", type: "Legendary Artifact Creature — Robot Hero", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever a player casts a spell, if it isn't that player's turn, choose one —\n• Put a +1/+1 counter on Vision.\n• Vision phases out. (Treat him and anything attached to him as though they don't exist until your next turn.)",
    triggers: [{
      on: "cast", when: (g, s, ev) => !!ev.p && g.active !== ev.p,
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        const k = await g.ask(p, { type: "option", prompt: "Vision: choose one", options: [{ id: 0, label: "Put a +1/+1 counter on Vision" }, { id: 1, label: "Vision phases out" }], purpose: "visionMode", src: s, item: ev.item });
        if (k === 1) g.phaseOut([s]); else g.addCounters(s, "p1", 1, s);
      }
    }],
    ai: {
      priority: 6,
      option: (g, p, req) => {
        if (req.purpose !== "visionMode") return undefined;
        const src = req.src, it = req.item;
        if (!it || it.p === p) return 0;
        const d = it.o && it.o.def;
        const hitsMe = (it.targets || []).includes(src) || !!(d && d.ai && d.ai.wipe);
        return hitsMe ? 1 : 0;
      }
    }
  });

  D({
    name: "Quicksilver, Speedster", cost: "{3}{U}{R}", type: "Legendary Creature — Mutant Hero", pt: "3/4",
    keywords: ["flash", "double strike", "haste"],
    text: "Flash\nDouble strike, haste\nAs long as Quicksilver is tapped, you may cast spells as though they had flash.",
    statics: [{ giveFlash: (g, s, card, p) => s.tapped && p === s.controller }],
    ai: { priority: 7 }
  });

  D({
    name: "Hercules, Olympian Hero", cost: "{3}{W}{W}", type: "Legendary Creature — Demigod Warrior Hero", pt: "3/3",
    text: "Whenever Hercules attacks, put a +1/+1 counter on him. He gains indestructible until end of turn.\nWhenever Hercules is dealt damage for the first time each turn, put that many +1/+1 counters on him. (He must survive the damage to get the counters.)",
    triggers: [
      {
        on: "attacks", self: true,
        do: (g, s, ev, { p }) => { if (s.zone !== "battlefield") return; g.addCounters(s, "p1", 1, s); g.grant([s], ["indestructible"]); }
      },
      {
        on: "damage",
        when: (g, s, ev) => {
          if (ev.target !== s || s.state.hurtTurn === g.turn) return false;
          s.state.hurtTurn = g.turn;
          return true;
        },
        do: (g, s, ev) => { if (s.zone === "battlefield") g.addCounters(s, "p1", ev.amount, s); }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Winter Soldier, Reborn Avenger", cost: "{4}{W}", type: "Legendary Creature — Human Soldier Hero", pt: "3/5",
    text: "Whenever Winter Soldier attacks, return target creature card with mana value less than or equal to Winter Soldier's power from your graveyard to the battlefield. If a Hero enters this way, it enters with an additional +1/+1 counter on it.",
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        const pw = s.zone === "battlefield" ? g.power(s) : 0;
        const spec = trig({ kind: "card", purpose: "reanimate", prompt: "Winter Soldier: return target creature card from your graveyard to the battlefield", from: (g2, pl) => pl.graveyard.filter(c => isCreatureCard(c) && c.def.mv <= pw) });
        const t = await g.chooseTarget(p, spec, s);
        if (!t || t.zone !== "graveyard") return;
        g.putOntoBattlefield([t], p, isHeroDef(t.def) ? { counters: { p1: 1 } } : {});
        g.log(`${p.name} returns ${t.def.name} to the battlefield (Winter Soldier).`, { p, cards: [t.def.name] });
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "War Machine, Avenging Arsenal", cost: "{4}{R}", type: "Legendary Artifact Creature — Human Hero", pt: "3/5",
    keywords: ["flying"],
    text: "Flying\nWhenever War Machine attacks, attacking modified creatures you control gain double strike until end of turn. (Equipment, Auras you control, and counters are modifications.)",
    triggers: [{
      on: "attacks", self: true, late: true,
      do: (g, s, ev, { p }) => {
        const list = attackingMine(g, p).filter(o => modified(g, o));
        if (list.length) { g.grant(list, ["double strike"]); g.log(`${list.length} modified attacker${list.length > 1 ? "s gain" : " gains"} double strike (War Machine).`, { p, cards: [s.def.name] }); }
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Captain Marvel, Earth's Protector", cost: "{3}{W}{W}", type: "Legendary Creature — Human Kree Hero", pt: "5/4",
    keywords: ["flash", "flying", "lifelink"],
    text: "Flash\nFlying, lifelink\nPower-up — {5}{W}{W}: Put a +1/+1 counter and an indestructible counter on Captain Marvel. (Activate each power-up ability only once. Reduce the cost by her mana cost if she entered this turn.)",
    note: "The reduced power-up ({2}) is a separate button while she entered this turn.",
    statics: [{ applies: (g, s, o) => o === s && (s.counters.indestructible || 0) > 0, kw: ["indestructible"] }],
    abilities: powerUp("{5}{W}{W}", "{2}", (g, s) => { g.addCounters(s, "p1", 1, s); g.addCounters(s, "indestructible", 1, s); }),
    ai: { priority: 7, instantEnd: true }
  });
  /* Power-up: once per object; costs less the turn it entered. Two buttons, one shows at a time. */
  function powerUp(full, reduced, effect) {
    const use = (g, p, o, ctx) => (g.active === p && (ctx.window === "main2" || ctx.window === "main1")) || endBeforeMe(g, p, ctx);
    const mk = (c, fresh) => ({
      label: fresh ? `Power-up (${c})` : "Power-up", cost: c,
      condition: (g, o) => !o.state.poweredUp && (o.enteredTurn === g.turn) === fresh,
      do: (g, s, ctx) => { if (s.zone !== "battlefield" || s.state.poweredUp) return; s.state.poweredUp = true; effect(g, s, ctx); g.log(`${s.def.name} powers up.`, { p: ctx.p, cards: [s.def.name] }); },
      ai: { use }
    });
    return [mk(full, false), mk(reduced, true)];
  }

  D({
    name: "Thor Odinson", cost: "{3}{R}{W}", type: "Legendary Creature — God Warrior Hero", pt: "4/4",
    keywords: ["flying", "vigilance"],
    text: "Flying, vigilance, prowess, prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn twice.)",
    note: "Both prowess triggers are one +2/+2 trigger.",
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && !ev.o.def.types.includes("Creature"),
      do: (g, s) => { if (s.zone === "battlefield") g.pump(s, 2, 2); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Professor Hulk", cost: "{4}{U}{U}", type: "Legendary Creature — Gamma Scientist Hero", pt: "6/6",
    keywords: ["trample"],
    text: "Trample\nWhenever Professor Hulk deals combat damage to a player, draw that many cards.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => drawLog(g, p, Math.min(ev.amount, 15), s) }],
    ai: { priority: 7 }
  });

  D({
    name: "Captain Marvel, Apex Avenger", cost: "{5}{R}{W}", type: "Legendary Creature — Human Kree Hero", pt: "4/4",
    keywords: ["flying", "double strike", "indestructible"],
    text: "Flying, double strike, indestructible\nWhenever you put one or more counters on another creature, if it's not a Kree, you may put the same number and kind of counters on Captain Marvel.",
    triggers: [{
      on: "counters",
      when: (g, s, ev) => {
        const o = ev.o;
        if (!o || o === s || o.zone !== "battlefield" || !g.isCreature(o) || g.hasSub(o, "Kree")) return false;
        const who = ev.src && ev.src.controller ? ev.src.controller : o.controller;
        return who === s.controller && ev.n > 0;
      },
      do: (g, s, ev) => { if (s.zone === "battlefield") g.addCounters(s, ev.kind, ev.n, s); }
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Hawkeye, Trick Shot", cost: "{3}{R}", type: "Legendary Creature — Human Archer Hero", pt: "3/4",
    keywords: ["first strike", "reach"],
    text: "First strike, reach\nWhenever Hawkeye or another Hero you control enters, it deals damage equal to the number of Heroes you control to any target.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o === s || (ev.o.controller === s.controller && g.isCreature(ev.o) && isHero(g, ev.o)),
      do: async (g, s, ev, { p }) => {
        const n = g.creatures(p).filter(o => isHero(g, o)).length;
        if (n <= 0) return;
        const src = ev.o.zone === "battlefield" ? ev.o : s;
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `${src.def.name} deals ${n} damage to any target (Hawkeye)` }), s);
        if (t) g.damage(src, t, n);
      }
    }],
    ai: {
      priority: 8,
      target: (g, p, req) => (req.src && req.src.def.name === "Hawkeye, Trick Shot" && req.purpose === "harm" ? burnTarget(g, p, req.options, req.spec && req.spec.amount || 1) : undefined)
    }
  });
  /* n damage: the most threatening creature or planeswalker it kills, else the player closest to dying
     (a kill when it can), else the biggest threat it at least softens. */
  function burnTarget(g, p, opts, n) {
    const players = opts.filter(o => g.isPlayer(o) && o !== p);
    const dying = players.filter(q => q.life <= n);
    if (dying.length) return dying[0];
    const kills = opts.filter(o => !g.isPlayer(o) && o.controller !== p && (g.isPlaneswalker(o) && !g.isCreature(o) ? (o.counters.loyalty || 0) <= n : g.isCreature(o) && !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= n));
    const best = kills.length ? maxBy(kills, o => threatOf(g, o, p)) : null;
    if (best && threatOf(g, best, p) >= 2.5) return best;
    if (players.length) {
      const lead = AIX().leader ? AIX().leader(g, p) : null;
      return players.includes(lead) && lead.life <= 20 ? lead : players.slice().sort((a, b) => a.life - b.life)[0];
    }
    return best || undefined;
  }

  D({
    name: "Captain America, Skybound", cost: "{3}{W}{W}", type: "Legendary Creature — Human Soldier Hero", pt: "3/5",
    keywords: ["flying", "vigilance"],
    text: "Flying, vigilance\nBattalion — Whenever Captain America and at least two other creatures attack, put a +1/+1 counter on each attacking creature. They gain indestructible until end of turn. (Damage and effects that say \"destroy\" don't destroy them.)",
    triggers: [{
      on: "attacks", self: true, when: (g, s) => attackingMine(g, s.controller).length >= 3,
      do: (g, s, ev, { p }) => {
        const list = attackingMine(g, p);
        for (const o of list) g.addCounters(o, "p1", 1, s);
        g.grant(list, ["indestructible"]);
        g.log(`Battalion: each attacking creature gets a +1/+1 counter and indestructible (Captain America).`, { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 8 }
  });

  const shootingStar = async (g, s, p) => {
    const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", optional: true, prompt: "Captain Marvel: exile up to one target creature (its controller gains life equal to its power)" }), s);
    if (!t || t.zone !== "battlefield") return;
    const q = t.controller, pw = Math.max(0, g.power(t));
    g.exile(t, s);
    if (pw > 0) g.gainLife(q, pw, s);
  };
  D({
    name: "Captain Marvel, Shooting Star", cost: "{5}{W}{W}", type: "Legendary Creature — Human Kree Hero", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhenever Captain Marvel enters or attacks, exile up to one target creature. That creature's controller gains life equal to its power.\nWhenever a creature other than Captain Marvel is exiled from the battlefield, you gain life equal to its power.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => shootingStar(g, s, p) },
      { on: "attacks", self: true, do: (g, s, ev, { p }) => shootingStar(g, s, p) },
      {
        on: "leaves", when: (g, s, ev) => ev.to === "exile" && ev.o !== s && !!ev.lki && ev.lki.creature && ev.lki.power > 0,
        do: (g, s, ev, { p }) => g.gainLife(p, ev.lki.power, s)
      }
    ],
    ai: {
      priority: 8,
      target: (g, p, req) => {
        if (!req.src || req.src.def.name !== "Captain Marvel, Shooting Star" || req.purpose !== "harm") return undefined;
        const b = bestHarm(g, p, req.options);
        return b && threatOf(g, b, p) >= 3 ? b : null;
      }
    }
  });

  D({
    name: "The Falcon, Sam Wilson", cost: "{4}{W}", type: "Legendary Creature — Human Hero", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhen The Falcon enters, put a +1/+1 counter on each other creature you control.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p).filter(o => o !== s);
        for (const o of list) g.addCounters(o, "p1", 1, s);
        if (list.length) g.log(`${p.name} puts a +1/+1 counter on each other creature (${list.length}).`, { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 7, cast: (g, p, o, { window }) => (window === "main1" && g.creatures(p).length >= 3 ? 26 : undefined) }
  });

  D({
    name: "Luke Cage, Hero for Hire", cost: "{2}{R}{R}", type: "Legendary Creature — Human Mercenary Hero", pt: "4/4",
    keywords: ["trample"],
    text: "Trample\nAt the beginning of combat on your turn, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    triggers: [{ on: "beginCombat", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => g.createToken(p, T.treasure) }],
    ai: { priority: 7 }
  });

  D({
    name: "Captain America, Unbowed", cost: "{3}{W}", type: "Legendary Creature — Human Soldier Hero", pt: "3/4",
    keywords: ["flash"],
    text: "Flash\nWhen Captain America enters, Soldiers and Heroes you control gain indestructible until end of turn.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p).filter(o => g.hasSub(o, "Soldier") || isHero(g, o));
        if (list.length) { g.grant(list, ["indestructible"]); g.log(`Soldiers and Heroes ${p.name} controls gain indestructible.`, { p, cards: [s.def.name] }); }
      }
    }],
    ai: {
      priority: 6, protection: true,
      // held for a wipe while the team is big; otherwise a flash creature at the end of the turn
      // before ours (or in our main phase when the hand is full)
      cast: (g, p, o, { window }) => {
        const team = g.creatures(p).filter(c => isHero(g, c)).length;
        if (team >= 3) return undefined;
        if (window === "end" && nextIsMe(g, p)) return 18;
        if (g.active === p && window === "main2" && p.hand.length >= 5) return 15;
        return undefined;
      }
    }
  });

  /* ================================================================ noncreature spells */
  D({
    name: "West Coast Expansion", cost: "{X}{U}{U}", type: "Sorcery",
    text: "Draw X cards. If X is 5 or more, you may cast a Hero spell from your hand without paying its mana cost.",
    minX: 1,
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.x || 0;
        drawLog(g, p, x, ctx.o);
        if (x < 5) return;
        const opts = p.hand.filter(c => isHeroDef(c.def) && !c.def.types.includes("Land"));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "West Coast Expansion: cast a Hero spell from your hand without paying its mana cost", options: opts, optional: true, purpose: "wceFree", src: ctx.o });
        if (pick && opts.includes(pick) && pick.zone === "hand") await g.castWithoutPaying(p, pick);
      }
    },
    ai: {
      priority: 5, draw: true,
      cast: (g, p) => (manaNow(g, p) >= 5 && p.hand.length <= 4 ? undefined : false),
      target: (g, p, req) => (req.purpose === "wceFree" ? maxBy(req.options, c => c.def.mv) : undefined)
    }
  });

  D({
    name: "Rip Apart", cost: "{R}{W}", type: "Sorcery",
    canCast: (g, p, o) => o.def.modes.some(m => m.canChoose(g, p, o)),
    text: "Choose one —\n• Rip Apart deals 3 damage to target creature or planeswalker.\n• Destroy target artifact or enchantment.",
    modes: [
      {
        label: "3 damage to a creature or planeswalker",
        canChoose: modeHasTarget,
        targets: [{ kind: "creatureOrPlaneswalker", purpose: "harm", amount: 3, prompt: "Rip Apart deals 3 damage to" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.o, ctx.targets[0], 3); }
      },
      {
        label: "Destroy an artifact or enchantment",
        canChoose: modeHasTarget,
        targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Rip Apart: destroy target artifact or enchantment" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
      }
    ],
    ai: Object.assign({ priority: 6 }, modalRemoval([
      (g, p, o) => specOpts(g, p, { kind: "creatureOrPlaneswalker" }, o).filter(t => t.controller !== p && (g.isPlaneswalker(t) || (!g.kw(t, "indestructible") && g.lethalDamageLeft(t) <= 3))),
      (g, p, o) => specOpts(g, p, { kind: "artifactOrEnchantment" }, o).filter(t => t.controller !== p && !g.kw(t, "indestructible"))
    ], 4))
  });

  D({
    name: "Destroy Evil", cost: "{1}{W}", type: "Instant",
    canCast: (g, p, o) => o.def.modes.some(m => m.canChoose(g, p, o)),
    text: "Choose one —\n• Destroy target creature with toughness 4 or greater.\n• Destroy target enchantment.",
    modes: [
      {
        label: "Destroy a creature with toughness 4 or greater",
        canChoose: modeHasTarget,
        targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy Evil: destroy target creature with toughness 4 or greater", filter: (g, o) => g.toughness(o) >= 4 }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
      },
      {
        label: "Destroy an enchantment",
        canChoose: modeHasTarget,
        targets: [{ kind: "enchantment", purpose: "harm", prompt: "Destroy Evil: destroy target enchantment" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
      }
    ],
    ai: Object.assign({ priority: 6 }, modalRemoval([
      (g, p, o) => specOpts(g, p, { kind: "creature", filter: (g2, t) => g2.toughness(t) >= 4 }, o).filter(t => t.controller !== p && !g.kw(t, "indestructible")),
      (g, p, o) => specOpts(g, p, { kind: "enchantment" }, o).filter(t => t.controller !== p && !g.kw(t, "indestructible"))
    ], 4))
  });
  /* Hints for a "choose one" removal spell: cast it in a main phase when a mode has a target worth
     it, choose that mode, aim it at the biggest threat. */
  function modalRemoval(modeOpts, minThreat) {
    const best = (g, p, o) => {
      let bi = -1, bs = -1;
      modeOpts.forEach((f, i) => { const s = harmScore(g, p, f(g, p, o)); if (s > bs) { bs = s; bi = i; } });
      return { i: bi, s: bs };
    };
    return {
      cast: (g, p, o, { window }) => {
        if (window !== "main1" && window !== "main2") return false;
        const b = best(g, p, o);
        return b.i >= 0 && b.s >= minThreat ? 16 + b.s * 0.5 : false;
      },
      mode: (g, p, o) => best(g, p, o).i,
      threatFloor: minThreat
    };
  }

  D({
    name: "Make Your Move", cost: "{2}{W}", type: "Instant",
    text: "Destroy target artifact, enchantment, or creature with power 4 or greater.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Make Your Move: destroy target artifact, enchantment, or creature with power 4 or greater", filter: (g, o) => g.isArtifact(o) || g.isEnchantment(o) || (g.isCreature(o) && g.power(o) >= 4) }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
    },
    ai: { priority: 6, removal: true, minThreat: 4 }
  });

  D({
    name: "Methods of the Mighty", cost: "{3}{W}", type: "Instant",
    text: "Choose one or more —\n• Destroy target artifact.\n• Destroy target tapped creature.\n• Put a +1/+1 counter on each creature you control.",
    note: "It chooses every mode it can: each target is optional, and the counters always come.",
    spell: {
      targets: [
        { kind: "creature", purpose: "harm", optional: true, prompt: "Methods of the Mighty: destroy target tapped creature (optional)", filter: (g, o) => o.tapped },
        { kind: "artifact", purpose: "harm", optional: true, prompt: "Methods of the Mighty: destroy target artifact (optional)" }
      ],
      do: (g, ctx) => {
        ctx.targets.forEach((t, i) => { if (t && ctx.legal[i] && t.zone === "battlefield") g.destroy(t, ctx.o); });
        g.counterEach(ctx.p, "p1", 1, ctx.o);
        g.log(`${ctx.p.name} puts a +1/+1 counter on each creature they control.`, { p: ctx.p, cards: [ctx.o.def.name] });
      }
    },
    ai: {
      priority: 5,
      cast: (g, p, o, { window }) => {
        const n = g.creatures(p).length;
        const kill = harmScore(g, p, specOpts(g, p, { kind: "creature", filter: (g2, t) => t.tapped }, o).concat(specOpts(g, p, { kind: "artifact" }, o)));
        if (window === "end" || window === "main1" || window === "main2") {
          if (kill >= 5 || n >= 4) return 18 + n + Math.max(0, kill) * 0.5;
        }
        return false;
      },
      instantEnd: true,
      target: (g, p, req) => {
        if (req.purpose !== "harm") return undefined;
        const b = bestHarm(g, p, req.options);
        return b && threatOf(g, b, p) >= 3 ? b : null;
      }
    }
  });

  D({
    name: "Folk Hero", cost: "{1}{W}", type: "Legendary Enchantment — Background",
    text: "Commander creatures you own have \"Whenever you cast a spell that shares a creature type with this creature, draw a card. This ability triggers only once each turn.\"",
    note: "The ability is shown on Folk Hero; it draws once each turn for each commander creature you own on the battlefield.",
    triggers: [{
      on: "cast",
      when: (g, s, ev) => {
        if (ev.p !== s.controller || !ev.o) return false;
        const subs = ev.o.def.changeling ? null : ev.o.def.subtypes;
        if (!ev.o.def.types.includes("Creature") && !ev.o.def.types.includes("Kindred")) return false;
        const cmd = g.battlefield.find(c => c.isCommander && c.owner === s.controller && c.controller === s.controller && g.isCreature(c) && c.state.folkTurn !== g.turn &&
          (subs === null || [...g.ch(c).subtypes].some(t => subs.includes(t))));
        if (!cmd) return false;
        cmd.state.folkTurn = g.turn;
        return true;
      },
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 7, draw: true }
  });

  D({
    name: "Relic of Legends", cost: "{3}", type: "Artifact",
    text: "{T}: Add one mana of any color.\nTap an untapped legendary creature you control: Add one mana of any color.",
    note: "Only the first ability is used: automatic payment never taps your creatures for it.",
    mana: [{ tap: true, produce: "any" }],
    ai: { ramp: true, priority: 6 }
  });

  D({
    name: "Talisman of Creativity", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{T}: Add {U} or {R}. Talisman of Creativity deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["U", "R"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });

  /* ================================================================ lands */
  D({
    name: "Avengers Tower", type: "Land",
    text: "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a Hero spell or to activate an ability of a Hero source.\n{4}, {T}: Look at the top three cards of your library. You may reveal a Hero card from among them and put it into your hand. Put the rest on the bottom of your library in any order.",
    note: "Its colored mana pays only for Hero spells.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => !!card && isHeroDef(card.def) }],
    abilities: [{
      label: "Look at the top three", cost: "{4}", tap: true,
      do: async (g, s, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 3);
        if (!top.length) return;
        const heroes = top.filter(c => isHeroDef(c.def));
        let pick = null;
        if (heroes.length) {
          const r = await g.ask(p, { type: "cards", prompt: "Avengers Tower: reveal a Hero card and put it into your hand", options: heroes, min: 0, max: 1, purpose: "towerPick", src: s });
          pick = r && r[0] && heroes.includes(r[0]) ? r[0] : null;
        }
        if (pick && pick.zone === "library") { g.moveTo(pick, "hand"); g.log(`${p.name} reveals ${pick.def.name} and puts it into their hand (Avengers Tower).`, { p, cards: [pick.def.name] }); }
        for (const c of top.filter(c => c !== pick && c.zone === "library")) g.moveTo(c, "library", { bottom: true });
      },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && manaNow(g, p) >= 5 && p.hand.length < 7 }
    }],
    ai: { priority: 5 }
  });

  const check = (name, a, b, sa, sb) => D({
    name, type: "Land",
    text: `${name} enters tapped unless you control a ${sa} or a ${sb}.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: (g, o) => !g.controlled(o.controller, x => x !== o && g.isLand(x) && (x.def.subtypes.includes(sa) || x.def.subtypes.includes(sb))).length,
    mana: [{ tap: true, produce: [a, b] }]
  });
  check("Glacial Fortress", "W", "U", "Plains", "Island");
  check("Sulfur Falls", "U", "R", "Island", "Mountain");
  const battlebond = (name, a, b) => D({
    name, type: "Land",
    text: `${name} enters tapped unless you have two or more opponents.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: (g, o) => g.opponents(o.controller).length < 2,
    mana: [{ tap: true, produce: [a, b] }]
  });
  battlebond("Spectator Seating", "R", "W");
  battlebond("Sea of Clouds", "W", "U");
  battlebond("Training Center", "U", "R");

  /* ================================================================ the bot's brain
     Captain America is worth more alive than in a trade: every Hero that enters grows the team and
     him. He stays home from an attack that doesn't kill when a blocker (or two) could kill him,
     unless he is indestructible. Jarvis and Hawkeye, Avenging Archer do their work at home. */
  function couldDieAttacking(g, p, c) {
    if (g.kw(c, "indestructible")) return false;
    const life = g.lethalDamageLeft(c);
    for (const q of g.opponents(p)) {
      const bl = g.creatures(q).filter(b => !b.tapped && g.canBlock(b, c)).map(b => (g.kw(b, "deathtouch") ? 99 : Math.max(0, g.power(b))));
      bl.sort((a, b) => b - a);
      if ((bl[0] || 0) + (bl[1] || 0) >= life) return true;
    }
    return false;
  }
  const HOMEBODIES = new Set(["Jarvis, Earth's Mightiest Butler", "Hawkeye, Avenging Archer"]);
  function keepHome(g, p, c) {
    if (c.isCommander && c.def.name === CAP) return couldDieAttacking(g, p, c);
    if (HOMEBODIES.has(c.def.name)) return g.power(c) < 4;
    return false;
  }
  MK.DECK_BRAINS = MK.DECK_BRAINS || {};
  MK.DECK_BRAINS.avengers = { keepHome };

  /* ================================================================ the deck */
  MK.DECK_TYPES = MK.DECK_TYPES || {};
  MK.DECK_TYPES.avengers = "Hero";

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "avengers", name: "Avengers", title: CAP, commander: CAP,
    identity: ["W", "U", "R"], bracket: 3, aggression: 0.7,
    style: "Jeskai Heroes and +1/+1 counters",
    blurb: "Avengers assemble: every Hero that joins Captain America gets a +1/+1 counter, haste and vigilance, then War Machine, Iron Man and Captain Marvel turn the counters into flying double strikers while Jarvis and Nick Fury refill the hand.",
    watch: [CAP, "Captain Marvel, Apex Avenger", "War Machine, Avenging Arsenal", "Jarvis, Earth's Mightiest Butler", "Cathars' Crusade", "Teferi's Protection"],
    precon: "Avengers Assemble (Marvel Super Heroes Commander, 2026), upgraded",
    list: (function () {
      const singles = [
        // creatures (33): the precon's best Avengers plus Marvel Super Heroes Heroes
        "Agent Phil Coulson", "The Wasp, Winsome Avenger", "Metallic Mimic", "Hero in Training", "Falcon and Redwing",
        "Captain America, Living Legend", "Captain America, Wings of Freedom", "Jarvis, Earth's Mightiest Butler",
        "Director Nick Fury", "Ant-Man, Elusive Avenger", "Shang-Chi and the Ten Rings", "The Mighty Thor, Jane Foster",
        "Firebird, Blazing Ranger", "Bastion Protector", "Daredevil, Man Without Fear", "Iron Man, Armored Avenger",
        "Hawkeye, Avenging Archer", "Hawkeye, Trick Shot", "Luke Cage, Hero for Hire", "Captain America, Unbowed",
        "Scarlet Witch, Chaotic Avenger", "Vision, Synthezoid Avenger", "Quicksilver, Speedster", "Hercules, Olympian Hero",
        "Winter Soldier, Reborn Avenger", "War Machine, Avenging Arsenal", "Captain Marvel, Earth's Protector",
        "Captain America, Skybound", "The Falcon, Sam Wilson", "Thor Odinson", "Professor Hulk",
        "Captain Marvel, Apex Avenger", "Captain Marvel, Shooting Star",
        // removal and interaction (12)
        "Swords to Plowshares", "Path to Exile", "Lightning Bolt", "Rip Apart", "Destroy Evil", "Make Your Move",
        "Chaos Warp", "Generous Gift", "Cyclonic Rift", "Counterspell", "Arcane Denial", "Swan Song",
        // protection (4)
        "Teferi's Protection", "Boros Charm", "Lightning Greaves", "Swiftfoot Boots",
        // card draw and Hero support (7)
        "Rhystic Study", "Kindred Discovery", "Herald's Horn", "Folk Hero", "West Coast Expansion", "Cathars' Crusade",
        "Methods of the Mighty",
        // mana (9)
        "Sol Ring", "Arcane Signet", "Talisman of Conviction", "Talisman of Progress", "Talisman of Creativity",
        "Fellwar Stone", "Mind Stone", "Relic of Legends", "Smothering Tithe",
        // lands (23 + 11 basics)
        "Command Tower", "Avengers Tower", "Path of Ancestry", "Exotic Orchard", "Cavern of Souls", "Raugrin Triome",
        "Sacred Foundry", "Hallowed Fountain", "Steam Vents", "Plateau", "Inspiring Vantage", "Battlefield Forge",
        "Clifftop Retreat", "Glacial Fortress", "Sulfur Falls", "Spectator Seating", "Sea of Clouds", "Training Center",
        "Prairie Stream", "Flooded Strand", "Scalding Tarn", "Arid Mesa", "Port Town"
      ];
      const list = singles.slice();
      for (let i = 0; i < 4; i++) list.push("Plains");
      for (let i = 0; i < 4; i++) list.push("Island");
      for (let i = 0; i < 3; i++) list.push("Mountain");
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
