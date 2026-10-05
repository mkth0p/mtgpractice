/* Etrata Heist: Bracket 4 theft aggro with Etrata, Deadly Fugitive (research deck, see
   research/etrata-theft-aggro/local/). Cheap Assassins connect, every hit cloaks an opponent's card, and the
   stolen cards become more attackers.
   This file holds the cards the other Etrata lists don't define, `MK.ETRATA_HEIST_DECK` (id
   "etrata-heist-aggro") and its bot brain (MK.DECK_BRAINS["etrata-heist-aggro"]). The deck is a hero deck only:
   it isn't in MK.BOT_DECKS, so the random Bracket 4 tables stay the same.
   Card text follows the printed Oracle text; `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const pc = s => MK.parseCost(s);
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isOpp = (g, p, q) => !!q && q !== p && g.opponents(p).includes(q);
  const isAssassin = (g, o) => (MK.isAssassin ? MK.isAssassin(g, o) : !!o && g.hasSub(o, "Assassin"));
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  const valueOf = (g, o) => (AI().value ? AI().value(g, o) : g.power(o));
  const mainWin = w => w === "main1" || w === "main2";
  /* "that player loses half their life, rounded up" */
  function halve(g, q, src) { if (q && !q.lost && q.life > 0) g.loseLife(q, Math.ceil(q.life / 2), src); }
  /* The players our creatures dealt combat damage to in this damage step ("whenever one or more creatures you
     control deal combat damage to a player": once for each of those players). */
  const hitPlayers = (g, s, ev) => [...new Set(ev.hits.filter(h => h.controller === s.controller && isOpp(g, s.controller, h.p)).map(h => h.p))];
  /* The heist brain picks targets for some of these cards; it's attached below. */
  const H = {};

  /* ---------------- ninjutsu: offered on the card in hand after blockers (as Fallen Shinobi does), the card is
     discarded to pay and comes back from the graveyard tapped and attacking the same player. */
  function unblockedAttacker(g, c) {
    return !!g.combat && !!c.combat && !!c.combat.attacking && !c.combat.wasBlocked && !(c.combat.blockedBy || []).length;
  }
  function ninjutsu(name, cost) {
    return {
      label: "Ninjutsu", cost,
      targets: [{ kind: "creature", you: true, purpose: "ninjutsu", prompt: "Ninjutsu: return an unblocked attacker you control to its owner's hand", filter: (g, c) => unblockedAttacker(g, c) }],
      do: (g, o, ctx) => {
        const p = ctx.p, a = ctx.targets[0];
        if (!a || !ctx.legal[0] || a.zone !== "battlefield") return;
        const target = a.combat && a.combat.attacking;
        g.bounce(a);
        if (o.zone !== "graveyard" && o.zone !== "exile") return;
        g.putOntoBattlefield([o], p, { tapped: true, attacking: target || undefined });
        log(g, `${p.name} ninjutsus ${name} in, tapped and attacking.`, p, [name]);
      }
    };
  }
  const ninjaNote = "Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.";
  /* An unblocked attacker worth swapping for a ninja: one of our own cheap cards (never a cloak of someone else's
     card, which would go to its owner's hand), not one whose hit matters more. */
  function ninjaBait(g, p, opts) {
    const keep = new Set(["Virtus the Veiled", "Unstoppable Slasher", "Etrata, Deadly Fugitive", "Bloodletter of Aclazotz", "Shredder, Shadow Master"]);
    const list = (opts || g.creatures(p).filter(c => unblockedAttacker(g, c)))
      .filter(c => c.controller === p && c.owner === p && !c.faceDown && !c.isToken && !c.isCommander && !keep.has(c.def.name) && !g.battlefield.some(e => e.attachedTo === c) && g.power(c) <= 2);
    return list.sort((a, b) => valueOf(g, a) - valueOf(g, b))[0] || null;
  }
  const ninjaAi = extra => Object.assign({
    priority: 6,
    plan: (g, p, o, ctx) => {
      if (o.zone !== "hand" || ctx.window !== "combat" || g.active !== p || g.phase !== "damage") return null;
      if (!ctx.actions.some(a => a.type === "channel" && a.card === o)) return null;
      return ninjaBait(g, p) ? { type: "channel", card: o, maxTries: 1 } : null;
    },
    target: (g, p, req) => (req.purpose === "ninjutsu" ? ninjaBait(g, p, req.options) || undefined : undefined)
  }, extra || {});

  /* ================================================================ creatures */
  D({
    name: "Satoru, the Infiltrator", cost: "{U}{B}", type: "Legendary Creature — Human Ninja Rogue", pt: "2/3",
    keywords: ["menace"],
    text: "Menace\nWhenever Satoru and/or one or more other nontoken creatures you control enter, if none of them were cast or no mana was spent to cast them, draw a card.",
    note: "Cloaked, manifested and ninjutsu'd creatures enter without being cast; a creature Etrata casts for free was cast with no mana spent. Turning a creature face up isn't entering.",
    triggers: [{
      on: "enters",
      when: (g, s, ev) => {
        const list = (ev.batch ? ev.batch.map(b => b.o) : [ev.o]).filter(o => o.controller === s.controller && !o.isToken && o.zone === "battlefield" && g.isCreature(o));
        if (!list.length || list[0] !== ev.o) return false;   // once for the whole batch
        if (!list.includes(s) && s.zone !== "battlefield") return false;
        return list.every(o => o.castEntry !== "paid");
      },
      do: (g, s, ev, { p }) => g.draw(p, 1)
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Thieving Amalgam", cost: "{5}{B}{B}", type: "Creature — Ape Snake", pt: "6/7",
    text: "At the beginning of each opponent's upkeep, you manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)\nWhenever a creature you control but don't own dies, its owner loses 2 life and you gain 2 life.",
    triggers: [
      {
        on: "upkeep", when: (g, s, ev) => isOpp(g, s.controller, ev.p),
        do: (g, s, ev, { p }) => { const q = ev.p; if (!q.lost && q.library.length) g.putFaceDown(p, [q.library[0]], { kind: "manifest", what: `the top card of ${q.name}'s library` }); }
      },
      {
        on: "dies", when: (g, s, ev) => !!ev.lki && ev.lki.controller === s.controller && ev.o.owner !== s.controller,
        do: (g, s, ev, { p }) => { const q = ev.o.owner; if (q && !q.lost) g.loseLife(q, 2, s); g.gainLife(p, 2, s); }
      }
    ],
    ai: { priority: 7, threat: 3 }
  });
  D({
    name: "Orochi Soul-Reaver", cost: "{5}{B}", type: "Creature — Snake Ninja Rogue", pt: "5/4",
    text: "Ninjutsu {3}{B} ({3}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever one or more creatures you control deal combat damage to a player, create a Treasure token and manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
    note: ninjaNote,
    channel: ninjutsu("Orochi Soul-Reaver", "{3}{B}"),
    triggers: [{
      on: "combatDamageStep", when: (g, s, ev) => hitPlayers(g, s, ev).length > 0,
      do: (g, s, ev, { p }) => {
        for (const q of hitPlayers(g, s, ev)) {
          g.createToken(p, T.treasure);
          if (!q.lost && q.library.length) g.putFaceDown(p, [q.library[0]], { kind: "manifest", what: `the top card of ${q.name}'s library` });
        }
      }
    }],
    ai: ninjaAi({ priority: 7, threat: 3 })
  });
  D({
    name: "Grim Hireling", cost: "{3}{B}", type: "Creature — Tiefling Rogue", pt: "3/2",
    text: "Whenever one or more creatures you control deal combat damage to a player, create two Treasure tokens.\n{B}, Sacrifice X Treasures: Target creature gets -X/-X until end of turn. Activate only as a sorcery.",
    note: "X is chosen and the Treasures are sacrificed as the ability resolves.",
    triggers: [{
      on: "combatDamageStep", when: (g, s, ev) => hitPlayers(g, s, ev).length > 0,
      do: (g, s, ev, { p }) => { for (let n = hitPlayers(g, s, ev).length; n > 0; n--) g.createToken(p, T.treasure, { count: 2 }); }
    }],
    abilities: [{
      label: "Sacrifice X Treasures: -X/-X", cost: "{B}", timing: "sorcery",
      condition: (g, o, p) => g.controlled(p, c => c.def.name === "Treasure").length > 0,
      targets: [{ kind: "creature", purpose: "harm", prompt: "-X/-X until end of turn" }],
      do: async (g, src, ctx) => {
        const p = ctx.p, t = ctx.targets[0];
        const tr = g.controlled(p, c => c.def.name === "Treasure");
        if (!t || !ctx.legal[0] || !tr.length) return;
        const want = Math.max(1, g.toughness(t) - (t.damage || 0));
        const x = Math.max(0, Math.min(tr.length, (await g.ask(p, { type: "number", prompt: "Sacrifice how many Treasures (X)?", min: 1, max: tr.length, purpose: "hirelingX", src, want })) | 0));
        for (const c of tr.slice(0, x)) g.sacrifice(c);
        if (x > 0 && t.zone === "battlefield") g.pump(t, -x, -x);
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (ctx.window !== "main1") return false;
          const n = g.controlled(p, c => c.def.name === "Treasure").length;
          return g.battlefield.some(c => c.controller !== p && g.isCreature(c) && !g.kw(c, "indestructible") && g.canTarget(p, c) && g.toughness(c) <= n - 2 && AI().threat && AI().threat(g, c, p) >= 6);
        },
        x: (g, p, o, max) => max
      }
    }],
    ai: {
      priority: 7, threat: 2,
      target: (g, p, req) => {
        if (req.purpose !== "harm" || !req.src || req.src.def.name !== "Grim Hireling") return undefined;
        const n = g.controlled(p, c => c.def.name === "Treasure").length;
        return req.options.filter(c => c.controller !== p && g.toughness(c) <= n).sort((a, b) => (AI().threat ? AI().threat(g, b, p) - AI().threat(g, a, p) : 0))[0];
      }
    }
  });
  D({
    name: "Shredder, Shadow Master", cost: "{3}{B}{B}", type: "Legendary Creature — Human Ninja", pt: "5/5",
    text: "Whenever Shredder attacks a player, for each other opponent, create a token that's a copy of Shredder tapped and attacking that player, except it isn't legendary. Sacrifice those tokens at end of combat.\nWhenever Shredder deals combat damage to a player, that player loses half their life, rounded up.",
    triggers: [
      {
        on: "attacks", when: (g, s, ev) => ev.o === s && g.isPlayer(ev.target),
        do: (g, s, ev, { p }) => {
          if (!g.combat || s.zone !== "battlefield") return;
          const base = MK.copiable(s), made = [];
          const except = { supertypes: base.supertypes.filter(t => t !== "Legendary"), legendary: false };
          for (const q of g.opponents(p).filter(q => q !== ev.target)) made.push(...g.copyToken(p, s, { except, tapped: true, attacking: q }));
          if (!made.length) return;
          const entry = { controller: p, def: { name: "Shredder, Shadow Master", triggers: [{
            on: "endCombat", when: (g2, e) => g2.tempTriggers.includes(e),
            do: g2 => { g2.tempTriggers = g2.tempTriggers.filter(x => x !== entry); g2.ts++; for (const t of made) if (t.zone === "battlefield") g2.sacrifice(t); }
          }] } };
          g.tempTriggers.push(entry); g.ts++;
        }
      },
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev) => halve(g, ev.p, s) }
    ],
    ai: { priority: 8, threat: 4 }
  });
  D({
    name: "Radioactive Man", cost: "{4}{B}", type: "Legendary Creature — Human Scientist Villain", pt: "3/5",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhenever Radioactive Man deals combat damage to a player, that player loses half their life, rounded up.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev) => halve(g, ev.p, s) }],
    ai: { priority: 7, threat: 3 }
  });
  D({
    name: "Vela the Night-Clad", cost: "{4}{U}{B}", type: "Legendary Creature — Human Wizard", pt: "4/4",
    keywords: ["intimidate"],
    text: "Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)\nOther creatures you control have intimidate.\nWhenever Vela or another creature you control leaves the battlefield, each opponent loses 1 life.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o), kw: ["intimidate"] }],
    triggers: [{
      on: "leaves", when: (g, s, ev) => !!ev.lki && ev.lki.controller === s.controller && ev.lki.creature,
      do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); }
    }],
    ai: { priority: 7, threat: 3 }
  });
  D({
    name: "Roaming Throne", cost: "{4}", type: "Artifact Creature — Golem", pt: "4/4",
    keywords: ["ward"],
    text: "Ward {2}\nAs this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.\nIf a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    makesAssassins: (g, s, o) => o === s,
    statics: [
      { applies: (g, s, o) => o === s, subtypes: ["Assassin"] },
      { triggerExtra: (g, s, f) => (f.src && f.src !== s && !f.src.emblem && f.src.def && f.controller === s.controller && f.src.controller === s.controller && f.src.zone === "battlefield" && g.isCreature(f.src) && isAssassin(g, f.src) ? 1 : 0) }
    ],
    triggers: [MK.wardTrigger(2)],
    ai: { priority: 8, threat: 3 }
  });
  D({
    name: "Glen Elendra Liege", cost: "{1}{U/B}{U/B}{U/B}", type: "Creature — Faerie Knight", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\nOther blue creatures you control get +1/+1.\nOther black creatures you control get +1/+1.",
    statics: [
      { applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && g.colorsOf(o).has("U"), pt: [1, 1] },
      { applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && g.colorsOf(o).has("B"), pt: [1, 1] }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Mist-Syndicate Naga", cost: "{2}{U}", type: "Creature — Snake Ninja", pt: "3/1",
    text: "Ninjutsu {2}{U} ({2}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever this creature deals combat damage to a player, create a token that's a copy of this creature.",
    note: ninjaNote,
    channel: ninjutsu("Mist-Syndicate Naga", "{2}{U}"),
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => { g.copyToken(p, s); } }],
    ai: ninjaAi({ priority: 7 })
  });
  D({
    name: "Reno and Rude", cost: "{1}{B}", type: "Legendary Creature — Human Assassin", pt: "2/1",
    keywords: ["menace"],
    text: "Menace\nWhenever Reno and Rude deals combat damage to a player, exile the top card of that player's library. Then you may sacrifice another creature or artifact. If you do, you may play the exiled card this turn, and mana of any type can be spent to cast it.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const q = ev.p, c = q.library[0];
        if (!c || q.lost) return;
        g.moveTo(c, "exile");
        log(g, `${p.name} exiles ${c.def.name} from the top of ${q.name}'s library (Reno and Rude).`, p, [c.def.name]);
        const fodder = g.battlefield.filter(o => o.controller === p && o !== s && (g.isCreature(o) || g.isArtifact(o)));
        if (!fodder.length || c.zone !== "exile") return;
        const pick = await g.ask(p, { type: "target", prompt: `Reno and Rude: sacrifice another creature or artifact to be able to play ${c.def.name} this turn?`, options: fodder, optional: true, purpose: "renoSac", src: s, card: c });
        if (!pick || !fodder.includes(pick) || pick.zone !== "battlefield") return;
        g.sacrifice(pick);
        c.playable = { by: p, turn: g.turn, anyColor: true };
      }
    }],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.purpose !== "renoSac") return undefined;
        const c = req.card;
        if (!c || c.def.types.includes("Land") && p.landsPlayed > 0) return null;
        // a Treasure, a cloaked land, a token: worth it for a spell we can cast this turn
        const cheap = req.options.filter(o => o.def.name === "Treasure" || (o.faceDown && o.cardDef.types.includes("Land")) || (o.isToken && g.power(o) <= 1));
        if (!cheap.length || (c.def.mv > manaNow(g, p) + 1 && !c.def.types.includes("Land"))) return null;
        return cheap.sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];
      }
    }
  });
  D({
    name: "Massacre Girl, Known Killer", cost: "{2}{B}{B}", type: "Legendary Creature — Human Assassin", pt: "4/4",
    keywords: ["menace"],
    text: "Menace\nCreatures you control have wither. (They deal damage to creatures in the form of -1/-1 counters.)\nWhenever a creature an opponent controls dies, if its toughness was less than 1, draw a card.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["wither"] }],
    triggers: [{ on: "dies", when: (g, s, ev) => !!ev.lki && isOpp(g, s.controller, ev.lki.controller) && ev.lki.toughness < 1, do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 7, threat: 3 }
  });
  D({
    name: "Archetype of Imagination", cost: "{4}{U}{U}", type: "Enchantment Creature — Human Wizard", pt: "3/2",
    text: "Creatures you control have flying.\nCreatures your opponents control lose flying and can't have or gain flying.",
    statics: [
      { applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["flying"] },
      { applies: (g, s, o) => !mine(s, o) && isOpp(g, s.controller, o.controller) && g.isCreature(o), loseKw: ["flying"] }
    ],
    ai: { priority: 7, threat: 4 }
  });
  const hostages = new WeakMap();
  D({
    name: "Hostage Taker", cost: "{2}{U}{B}", type: "Creature — Human Pirate", pt: "2/3",
    text: "When this creature enters, exile another target creature or artifact until this creature leaves the battlefield. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "permanent", other: true, purpose: "harm", prompt: "Hostage Taker: exile another creature or artifact", filter: (g2, o) => o !== s && (g2.isCreature(o) || g2.isArtifact(o)) }), s);
          if (!t || t.zone !== "battlefield" || s.zone !== "battlefield") return;
          g.exile(t, s);
          if (t.zone !== "exile" || t.isToken) return;
          t.playable = { by: p, forever: true, anyColor: true, hostage: s.id };
          hostages.set(s, { card: t, zc: s.zc });
          log(g, `${p.name} may cast ${t.def.name} while it stays exiled (Hostage Taker).`, p, [t.def.name]);
        }
      },
      {
        on: "leaves", self: true,
        do: (g, s) => {
          const h = hostages.get(s);
          if (!h) return;
          hostages.delete(s);
          const c = h.card;
          if (c.zone === "exile" && c.playable && c.playable.hostage === s.id && !c.owner.lost) { g.putOntoBattlefield([c], c.owner); log(g, `${c.def.name} returns to ${c.owner.name} (Hostage Taker left).`, c.owner, [c.def.name]); }
        }
      }
    ],
    ai: { priority: 7, threat: 3 }
  });


  /* ---------------- cheap Assassins and friends from the public lists */
  D({
    name: "Assassin Initiate", cost: "{B}", type: "Creature — Human Assassin", pt: "1/1",
    text: "{1}: This creature gains your choice of flying, deathtouch, or lifelink until end of turn.",
    abilities: [{
      label: "{1}: flying, deathtouch or lifelink", cost: "{1}",
      do: async (g, src, ctx) => {
        if (src.zone !== "battlefield") return;
        const options = [{ id: 0, label: "Flying" }, { id: 1, label: "Deathtouch" }, { id: 2, label: "Lifelink" }];
        const m = await g.ask(ctx.p, { type: "option", prompt: "Assassin Initiate gains", options, purpose: "initiateKw", src });
        g.grant(src, [["flying", "deathtouch", "lifelink"][options.some(o => o.id === m) ? m : 0]]);
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !o.sick && !o.tapped && !g.kw(o, "flying") && !g.ch(o).unblockable && manaNow(g, p) >= 3 && o.state.initTurn !== g.turn && (o.state.initTurn = g.turn) }
    }],
    ai: { priority: 6, option: () => 0 }
  });
  D({
    name: "Hullcarver", cost: "{B}", type: "Artifact Creature — Robot Assassin", pt: "1/1",
    keywords: ["deathtouch"], text: "Deathtouch",
    ai: { priority: 6 }
  });
  D({
    name: "Poison-Blade Mentor", cost: "{1}{B}", type: "Creature — Human Assassin", pt: "2/1",
    keywords: ["deathtouch"],
    text: "Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nWhenever this creature attacks, another target Assassin you control gains deathtouch until end of turn.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => ev.o === s,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, other: true, purpose: "help", prompt: "Another Assassin gains deathtouch", filter: (g2, c) => c !== s && isAssassin(g2, c) }), s);
        if (t && t.zone === "battlefield") g.grant(t, ["deathtouch"]);
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.src && req.src.def.name === "Poison-Blade Mentor" ? req.options.filter(c => c.combat && !g.kw(c, "deathtouch")).sort((a, b) => g.power(b) - g.power(a))[0] || req.options[0] : undefined) }
  });
  D({
    name: "Evie Frye", cost: "{1}{U}", type: "Legendary Creature — Human Assassin", pt: "2/1",
    text: "Partner with Jacob Frye (When this creature enters, target player may put Jacob into their hand from their library, then shuffle.)\n{1}, {T}: Draw a card, then discard a card. When you discard a creature card this way, target creature you control can't be blocked this turn.",
    note: "Partner with: Jacob Frye isn't in the game, so the enters trigger does nothing.",
    abilities: [{
      label: "Loot", cost: "{1}", tap: true,
      do: async (g, src, ctx) => {
        const p = ctx.p;
        g.draw(p, 1);
        if (!p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Evie Frye: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src });
        const c = (pick || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1];
        const creature = c.def.types.includes("Creature");
        g.discard(p, c);
        if (!creature) return;
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Can't be blocked this turn" }), src);
        if (t && t.zone === "battlefield") g.addEffect({ objs: [t], unblockable: true });
      },
      ai: { use: (g, p, o, ctx) => (ctx.window === "main1" && g.active === p && g.creatures(p).some(c => c !== o && !c.sick && !c.tapped && !g.ch(c).unblockable && g.power(c) >= 2)) || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p) }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Bident of Thassa", cost: "{2}{U}{U}", type: "Legendary Enchantment Artifact",
    text: "Whenever a creature you control deals combat damage to a player, you may draw a card.\n{1}{U}, {T}: Creatures your opponents control attack this turn if able.",
    note: "The second ability isn't offered to the bots.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && isOpp(g, s.controller, ev.p), do: (g, s, ev, { p }) => { if (p.hand.length < 9) g.draw(p, 1); } }],
    ai: { priority: 6, draw: true }
  });
  /* Myriad: whenever it attacks, for each opponent other than the defending player, a token copy tapped and
     attacking that player, exiled at end of combat. */
  const myriadTrigger = {
    on: "attacks", when: (g, s, ev) => ev.o === s && g.isPlayer(ev.target),
    do: (g, s, ev, { p }) => {
      if (!g.combat || s.zone !== "battlefield") return;
      for (const q of g.opponents(p).filter(q => q !== ev.target)) g.copyToken(p, s, { tapped: true, attacking: q, exileEoc: true });
    }
  };
  D({
    name: "Auton Soldier", cost: "{4}{U}{U}", type: "Artifact Creature — Alien Soldier", pt: "0/0",
    text: "You may have this creature enter as a copy of any creature on the battlefield, except it isn't legendary, is an artifact in addition to its other types, and has myriad. (Whenever it attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)",
    note: "The myriad tokens always go in, and only at players.",
    asEnters: async (g, p, o, item, eo) => {
      const opts = g.battlefield.filter(c => c !== o && g.isCreature(c) && !c.faceDown);
      if (!opts.length) return;
      const pick = await g.ask(p, { type: "target", prompt: "Auton Soldier: enter as a copy of", options: opts, optional: true, purpose: "autonCopy", src: o });
      if (!pick || !opts.includes(pick)) return;
      const base = MK.copiable(pick);
      o.def = MK.derive(base, { supertypes: base.supertypes.filter(t => t !== "Legendary"), legendary: false, types: base.types.includes("Artifact") ? base.types : ["Artifact"].concat(base.types), triggers: base.triggers.concat([myriadTrigger]), keywords: base.keywords.concat(["myriad"]) });
      g.ts++;
      log(g, `Auton Soldier enters as a copy of ${base.name}, with myriad.`, p, [base.name]);
    },
    ai: {
      priority: 6, hold: (g, p) => !g.battlefield.some(c => g.isCreature(c) && !c.faceDown && valueOf(g, c) >= 6),
      target: (g, p, req) => (req.purpose === "autonCopy" ? (H.copyTarget ? H.copyTarget(g, p, req) : req.options.slice().sort((a, b) => valueOf(g, b) - valueOf(g, a))[0]) : undefined)
    }
  });

  /* ================================================================ equipment and artifacts */
  D({
    name: "Quietus Spike", cost: "{3}", type: "Artifact — Equipment", equip: "{3}",
    text: "Equipped creature has deathtouch.\nWhenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.\nEquip {3}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["deathtouch"] }],
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src === s.attachedTo, do: (g, s, ev) => halve(g, ev.p, s) }],
    ai: { priority: 7, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Quietus Spike") : undefined }
  });
  T.phyrexianGerm = MK.tokenDef({ key: "phyrexian-germ", name: "Phyrexian Germ", pt: [0, 0], colors: "B", subtypes: ["Phyrexian", "Germ"] });
  D({
    name: "Scytheclaw", cost: "{5}", type: "Artifact — Equipment", equip: "{3}",
    text: "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\nEquipped creature gets +1/+1.\nWhenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.\nEquip {3}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 1] }],
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => { const t = g.createToken(p, T.phyrexianGerm)[0]; if (t && s.zone === "battlefield" && t.zone === "battlefield") { s.attachedTo = t; g.bump(); } } },
      { on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src === s.attachedTo, do: (g, s, ev) => halve(g, ev.p, s) }
    ],
    ai: { priority: 6, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Scytheclaw") : undefined }
  });
  D({
    name: "Genji Glove", cost: "{5}", type: "Artifact — Equipment", equip: "{3}",
    text: "Equipped creature has double strike.\nWhenever equipped creature attacks, if it's the first combat phase of the turn, untap it. After this phase, there is an additional combat phase.\nEquip {3}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["double strike"] }],
    triggers: [{
      on: "attacks", when: (g, s, ev) => ev.o === s.attachedTo && g.combatN === 1,
      intervening: (g) => g.combatN === 1,
      do: (g, s, ev, { p }) => { if (ev.o.zone === "battlefield") g.untap(ev.o); g.addExtraCombat(p); }
    }],
    ai: { priority: 6, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Genji Glove") : undefined }
  });
  D({
    name: "Leyline Axe", cost: "{4}", type: "Artifact — Equipment", equip: "{3}",
    openingHand: true,
    text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nEquipped creature gets +1/+1 and has double strike and trample.\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 1], kw: ["double strike", "trample"] }],
    ai: { priority: 6, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Leyline Axe") : undefined }
  });
  D({
    name: "Fireshrieker", cost: "{3}", type: "Artifact — Equipment", equip: "{2}",
    text: "Equipped creature has double strike. (It deals both first-strike and regular combat damage.)\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["double strike"] }],
    ai: { priority: 5, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Fireshrieker") : undefined }
  });
  D({
    name: "Winged Boots", cost: "{1}{U}", type: "Artifact — Equipment", equip: "{1}",
    text: "Equipped creature has flying and ward {4}. (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {4}.)\nEquip {1}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["flying"], ward: 4 }],
    ai: { priority: 6, equipTarget: (g, p, opts) => H.equipTarget ? H.equipTarget(g, p, opts, "Winged Boots") : undefined }
  });
  D({
    name: "Forsaken Monument", cost: "{5}", type: "Legendary Artifact",
    text: "Colorless creatures you control get +2/+2.\nWhenever you tap a permanent for {C}, add an additional {C}.\nWhenever you cast a colorless spell, you gain 2 life.",
    note: "The extra {C} is counted when mana is paid (a source that makes {C} makes one more).",
    statics: [
      { applies: (g, s, o) => mine(s, o) && g.isCreature(o) && g.colorsOf(o).size === 0, pt: [2, 2] },
      { colorlessTapBonus: true }
    ],
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && !(ev.item && ev.item.isCopy) && (ev.item && ev.item.faceDown ? true : (ev.o.def.colors || []).length === 0), do: (g, s, ev, { p }) => g.gainLife(p, 2, s) }],
    ai: { priority: 6, ramp: true }
  });
  D({
    name: "Eldrazi Monument", cost: "{5}", type: "Artifact",
    text: "Creatures you control get +1/+1 and have flying and indestructible.\nAt the beginning of your upkeep, sacrifice a creature. If you can't, sacrifice this artifact.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), pt: [1, 1], kw: ["flying", "indestructible"] }],
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const cands = g.creatures(p);
        if (!cands.length) { if (s.zone === "battlefield") g.sacrifice(s); return; }
        const pick = await g.ask(p, { type: "target", prompt: "Eldrazi Monument: sacrifice a creature", options: cands, purpose: "sacrifice", src: s });
        const c = cands.includes(pick) ? pick : cands[0];
        if (c.zone === "battlefield") g.sacrifice(c);
      }
    }],
    ai: { priority: 6, minCreatures: 3 }
  });

  /* ================================================================ enchantments */
  D({
    name: "Grievous Wound", cost: "{3}{B}{B}", type: "Enchantment — Aura",
    text: "Enchant player\nEnchanted player can't gain life.\nWhenever enchanted player is dealt damage, they lose half their life, rounded up.",
    note: "The enchanted opponent is chosen as it enters (it isn't targeted, so a hexproof player can be chosen). It goes to the graveyard when that player leaves the game.",
    asEnters: async (g, p, o, item, eo) => {
      const opts = g.opponents(p);
      if (!opts.length) return;
      const q = await g.ask(p, { type: "player", prompt: "Grievous Wound: enchant which opponent?", options: opts, purpose: "harm", src: o });
      eo.enchantPlayer = opts.includes(q) ? q : opts[0];
    },
    etbState: (g, o, opts) => ({ enchanted: (opts && opts.enchantPlayer) || null }),
    statics: [{ cantGainLife: (g, s, pl) => !!s.state.enchanted && pl === s.state.enchanted }],
    triggers: [
      { on: "damage", when: (g, s, ev) => !!ev.toPlayer && !!s.state.enchanted && ev.target === s.state.enchanted && ev.amount > 0, do: (g, s, ev) => halve(g, ev.target, s) },
      { on: "playerLost", when: (g, s, ev) => ev.p === s.state.enchanted, do: (g, s) => { if (s.zone === "battlefield") g.toGraveyardFromBattlefield([s], "sba"); } }
    ],
    ai: { priority: 7, threat: 4 }
  });
  D({
    name: "Intimidation", cost: "{2}{B}{B}{B}", type: "Enchantment",
    text: "Creatures you control have fear. (They can't be blocked except by artifact creatures and/or black creatures.)",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["fear"] }],
    ai: { priority: 7 }
  });
  D({
    name: "Levitation", cost: "{2}{U}{U}", type: "Enchantment",
    text: "Creatures you control have flying.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["flying"] }],
    ai: { priority: 7 }
  });
  /* Rogue Class: cards exiled with it, by Class object */
  const rogueExiled = c => !!c.rogueClass;
  D({
    name: "Rogue Class", cost: "{U}{B}", type: "Enchantment — Class",
    text: "(Gain the next level as a sorcery to add its ability.)\nWhenever a creature you control deals combat damage to a player, exile the top card of that player's library face down. You may look at it for as long as it remains exiled.\n{1}{U}{B}: Level 2\nCreatures you control have menace.\n{2}{U}{B}: Level 3\nYou may play cards exiled with this Class, and you may spend mana as though it were mana of any color to cast those spells.",
    note: "The exiled cards are face up in the game's exile (the bots never look at them).",
    levels: [
      {
        triggers: [{
          on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && isOpp(g, s.controller, ev.p),
          do: (g, s, ev, { p }) => {
            const q = ev.p, c = q.library[0];
            if (!c || q.lost) return;
            g.moveTo(c, "exile");
            if (c.zone !== "exile") return;
            c.rogueClass = s.id;
            if ((s.state.level || 1) >= 3) c.playable = { by: p, forever: true, anyColor: true };
            log(g, `${p.name} exiles the top card of ${q.name}'s library face down (Rogue Class).`, p, []);
          }
        }]
      },
      { cost: "{1}{U}{B}", statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["menace"] }] },
      {
        cost: "{2}{U}{B}",
        onLevel: (g, s) => { for (const q of g.players) for (const c of q.exile) if (rogueExiled(c) && c.rogueClass === s.id) c.playable = { by: s.controller, forever: true, anyColor: true }; }
      }
    ],
    ai: { priority: 7 }
  });

  /* ================================================================ instants and sorceries */
  D({
    name: "Predators' Hour", cost: "{1}{B}", type: "Sorcery",
    text: "Until end of turn, creatures you control gain menace and \"Whenever this creature deals combat damage to a player, exile the top card of that player's library face down. You may look at and play that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.\"",
    note: "The exiled cards are face up in the game's exile (the bots never look at them).",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p, list = g.creatures(p);
        if (!list.length) return;
        g.addEffect({ objs: list, kw: ["menace"] });
        const ids = new Set(list.map(o => o.id));
        g.tempTriggers.push({ controller: p, def: { name: "Predators' Hour", triggers: [{
          on: "combatDamagePlayer", when: (g2, t, ev) => !!ev.src && ids.has(ev.src.id) && ev.src.controller === p && isOpp(g2, p, ev.p),
          do: (g2, t, ev) => { const q = ev.p, c = q.library[0]; if (!c || q.lost) return; g2.moveTo(c, "exile"); if (c.zone === "exile") c.playable = { by: p, forever: true, anyColor: true }; log(g2, `${p.name} exiles the top card of ${q.name}'s library face down (Predators' Hour).`, p, []); }
        }] } });
        g.ts++; g.bump();
      }
    },
    ai: { priority: 5, cast: (g, p, o, { window }) => (window === "main1" && g.creatures(p).filter(c => !c.sick || g.kw(c, "haste")).length >= 3 ? 22 : false) }
  });
  D({
    name: "Fading Hope", cost: "{U}", type: "Instant",
    text: "Return target creature to its owner's hand. If its mana value was 3 or less, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
    spell: {
      targets: [{ kind: "creature", purpose: "fadingHope", prompt: "Return to its owner's hand" }],
      do: async (g, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "battlefield") return;
        const mv = g.mvOf(t);
        g.bounce(t);
        if (mv <= 3) await g.scry(ctx.p, 1, ctx.o);
      }
    },
    ai: { priority: 4, protection: true, target: (g, p, req) => (req.purpose === "fadingHope" && H.fadingTarget ? H.fadingTarget(g, p, req) : undefined) }
  });
  D({
    name: "Ghostly Flicker", cost: "{2}{U}", type: "Instant",
    text: "Exile two target artifacts, creatures, and/or lands you control, then return those cards to the battlefield under your control.",
    note: "A commander exiled this way goes to the command zone instead (the game always makes that choice).",
    spell: {
      targets: [
        { kind: "permanent", you: true, purpose: "flicker", prompt: "Ghostly Flicker: first artifact, creature or land", filter: (g, o) => g.isCreature(o) || g.isArtifact(o) || g.isLand(o) },
        { kind: "permanent", you: true, optional: true, purpose: "flicker2", prompt: "Ghostly Flicker: second artifact, creature or land", filter: (g, o) => g.isCreature(o) || g.isArtifact(o) || g.isLand(o) }
      ],
      do: (g, ctx) => {
        const p = ctx.p, back = [];
        ctx.targets.forEach((t, i) => {
          if (!t || !ctx.legal[i] || t.zone !== "battlefield" || back.includes(t)) return;
          g.exile(t, ctx.o);
          if (t.zone === "exile" && !t.isToken && g.isPermanentCard(t)) back.push(t);
        });
        if (back.length) { g.putOntoBattlefield(back, p); log(g, `${back.map(c => c.def.name).join(" and ")} return${back.length > 1 ? "" : "s"} to the battlefield under ${p.name}'s control.`, p, back.map(c => c.def.name)); }
      }
    },
    ai: { priority: 4, protection: true, target: (g, p, req) => (H.flickerTarget ? H.flickerTarget(g, p, req) : undefined) }
  });
  const extraTurn = (name, cost, text) => D({
    name, cost, type: "Sorcery", text,
    spell: { do: (g, ctx) => g.addExtraTurn(ctx.p, ctx.o) },
    ai: { priority: 6, cast: (g, p, o, ctx) => (H.extraTurnCast ? H.extraTurnCast(g, p, o, ctx) : undefined) }
  });
  extraTurn("Time Warp", "{3}{U}{U}", "Target player takes an extra turn after this one.");
  extraTurn("Temporal Manipulation", "{3}{U}{U}", "Take an extra turn after this one.");
  extraTurn("Capture of Jingzhou", "{3}{U}{U}", "Take an extra turn after this one.");
  MK.defs.get("Time Warp").note = "You always target yourself.";
  T.faerieRogue = MK.tokenDef({ key: "faerie-rogue-b1f", name: "Faerie Rogue", pt: [1, 1], colors: "B", subtypes: ["Faerie", "Rogue"], keywords: ["flying"] });
  D({
    name: "Notorious Throng", cost: "{3}{U}", type: "Kindred Sorcery — Rogue",
    text: "Prowl {5}{U} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)\nCreate X 1/1 black Faerie Rogue creature tokens with flying, where X is the damage dealt to your opponents this turn. If this spell's prowl cost was paid, take an extra turn after this one.",
    altCosts: [{ label: "Prowl", cost: "{5}{U}", condition: (g, p) => p.prowl === g.turn }],
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        const x = g.opponents(p).reduce((s, q) => s + (q.damageTakenThisTurn || 0), 0);
        if (x > 0) g.createToken(p, T.faerieRogue, { count: x });
        if (ctx.item && ctx.item.alt === 1) g.addExtraTurn(p, ctx.o);
      }
    },
    ai: { priority: 6, cast: (g, p, o, ctx) => (H.throngCast ? H.throngCast(g, p, o, ctx) : undefined) }
  });


  /* ================================================================ the brain (bots)
     A bot piloting the heist deck runs this ahead of the cards' own hints (MK.DECK_BRAINS, see ai.js). Etrata's
     own hooks (cards-etrata.js: blocks, combat flips, Boots on the engine piece, unblockable for a kill) stay on.
     The plan: pick one opponent to kill (the "mark") and send every attacker that gets through at them; with
     Ramses out one kill wins the game. Attackers that can't get through to the mark hit whoever they can reach
     (each Assassin hit still steals a card), and the best blockers stay home when the table can hit back. */
  const DECK_ID = "etrata-heist-aggro";
  const EB = () => MK.ETRATA_BRAIN || {};
  const MEM = new WeakMap();
  const mem = p => { let m = MEM.get(p); if (!m) { m = {}; MEM.set(p, m); } return m; };
  const brainOn = p => !!p && p.deckId === DECK_ID && !!p.agent && !!p.agent.bot;
  const liveOpps = (g, p) => g.opponents(p).filter(q => !q.lost);
  const onBf = (g, p, name) => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === name);
  const hitOf = (g, a) => Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1);
  const HALVE_ON_HIT = new Set(["Unstoppable Slasher", "Virtus the Veiled", "Shredder, Shadow Master", "Radioactive Man"]);
  const halver = (g, a) => (!a.faceDown && HALVE_ON_HIT.has(a.def.name)) || g.battlefield.some(e => e.attachedTo === a && (e.def.name === "Quietus Spike" || e.def.name === "Scytheclaw"));
  const evasive = (g, a) => g.ch(a).unblockable || g.kw(a, "flying") || g.kw(a, "menace") || g.kw(a, "shadow") || g.kw(a, "fear") || g.kw(a, "intimidate");

  /* ---------------- the combat model: what an attack does to one opponent. Combat damage first (doubled by
     Bloodletter on our turn), then each connecting creature's halving triggers (Virtus, Slasher, Shredder,
     Radioactive Man, Quietus Spike, Scytheclaw; Roaming Throne doubles a creature's own) and Grievous Wound's
     trigger for each source that dealt damage; first strike and double strike in two steps. */
  const SPIKES = new Set(["Quietus Spike", "Scytheclaw"]);
  function halvesOnHit(g, a) {
    const own = !a.faceDown && HALVE_ON_HIT.has(a.def.name) ? 1 + (isAssassin(g, a) ? g.battlefield.filter(o => o !== a && o.controller === a.controller && o.def.name === "Roaming Throne").length : 0) : 0;
    return own + g.battlefield.filter(e => e.attachedTo === a && SPIKES.has(e.def.name)).length;
  }
  function lifeAfter(g, p, q, through) {
    let life = q.life;
    const bl = g.active === p && g.battlefield.some(o => o.controller === p && o.def.name === "Bloodletter of Aclazotz") ? 2 : 1;
    const wound = g.battlefield.filter(o => o.controller === p && o.def.name === "Grievous Wound" && o.state.enchanted === q).length;
    const fs = a => g.kw(a, "first strike") || g.kw(a, "double strike");
    for (const step of [through.filter(fs), through.filter(a => !fs(a) || g.kw(a, "double strike"))]) {
      const hitters = step.filter(a => g.power(a) > 0);
      if (!hitters.length || life <= 0) continue;
      life -= bl * hitters.reduce((t, a) => t + g.power(a), 0);
      for (const a of hitters) for (let k = halvesOnHit(g, a) + wound; k > 0 && life > 0; k--) life -= bl * Math.ceil(life / 2);
    }
    return life;
  }
  function outcome(g, p, q, attackers, evade) {
    const blocked = EB().predictBlocks(g, q, attackers, evade);
    const through = attackers.filter(a => !blocked.has(a));
    const life = lifeAfter(g, p, q, through);
    return { blocked, through, life, dmg: q.life - life, kill: life <= 0 };
  }
  MK.HEIST_MODEL = { lifeAfter, outcome, halvesOnHit };

  /* The mark: the opponent we can kill soonest. For each opponent, the damage our attackers would deal if all of
     them went at that player (predicted blocks, halving), against their life; the current mark keeps a small edge
     so the attack doesn't wander, and the table's leader breaks ties. */
  function pickMark(g, p, able) {
    const opps = liveOpps(g, p);
    if (!opps.length) return null;
    const m = mem(p), tm = AI().threatModel ? AI().threatModel(g, p) : null;
    let best = null, bs = 1e9;
    for (const q of opps) {
      const r = outcome(g, p, q, able);
      const left = Math.max(0, r.life);
      let sc = left + 0.15 * q.life;
      if (m.mark === q) sc -= 4;
      if (tm) sc -= 2 * ((tm.rel.get(q) || 1) - 1);
      if (sc < bs) { bs = sc; best = q; }
    }
    m.mark = best;
    return best;
  }
  /* What a hit with this attacker brings besides its damage (Etrata's steal, card draw, halving). */
  function hitValue(g, p, a, q) {
    let v = hitOf(g, a);
    if (isAssassin(g, a) && onBf(g, p, "Etrata, Deadly Fugitive")) v += 3 * (g.battlefield.filter(o => o.controller === p && o.def.name === "Roaming Throne").length + 1);
    if (halver(g, a) && q) v += Math.ceil(q.life / 2) * 0.8;
    if (AI().hitTriggerValue) v += AI().hitTriggerValue(g, p, a, q || liveOpps(g, p)[0]) * 0.3;
    return v;
  }
  function heistAttack(g, p, cands, targets) {
    const E = EB();
    if (!E.predictBlocks) return null;
    const opps = liveOpps(g, p).filter(q => targets.includes(q));
    if (!opps.length) return null;
    const able = cands.filter(a => g.power(a) > 0 || a.def.triggers.some(t => t.on === "attacks"));
    if (!able.length) return null;
    const ramses = onBf(g, p, "Ramses, Assassin Lord");
    // 1. a kill: everything the kill needs goes; with Ramses an Assassin must be in it (one kill wins)
    let kill = null, ks = -1e9;
    for (const q of opps) {
      const r = outcome(g, p, q, able);
      if (!r.kill) continue;
      const winNow = ramses && able.some(a => isAssassin(g, a));
      const sc = (winNow ? 100 : 0) + (opps.length === 1 ? 100 : 0) - q.life * 0.1;
      if (sc > ks) { ks = sc; kill = q; }
    }
    const home = [];
    if (kill) {
      let team = able.slice();
      const order = able.slice().sort((x, y) => blockWorth(g, y) - blockWorth(g, x));
      for (const a of order) {
        const without = team.filter(x => x !== a);
        if (without.length && outcome(g, p, kill, without).kill && (!ramses || without.some(x => isAssassin(g, x)))) team = without;
      }
      const decl = team.map(a => ({ attacker: a, target: kill }));
      // the rest still attack where they get through (more steals), unless we need them home
      for (const a of able) if (!team.includes(a) && !needHome(g, p, a, team)) { const open = opps.filter(q => q !== kill && !E.predictBlocks(g, q, [a]).has(a)); if (open.length) decl.push({ attacker: a, target: open[0] }); }
      return { decl };
    }
    // 2. the mark gets everything that gets through to it
    const mark = pickMark(g, p, able);
    const decl = [], toMark = [];
    const byGain = able.slice().sort((x, y) => hitValue(g, p, y, mark) - hitValue(g, p, x, mark));
    for (const a of byGain) {
      if (a.def.ai && a.def.ai.attack && a.def.ai.attack(g, p, a, g.creatures(mark).filter(b => !b.tapped && g.canBlock(b, a))) === false && !(a.def.name === "Etrata, Deadly Fugitive")) continue;
      const trial = toMark.concat([a]);
      if (mark && !E.predictBlocks(g, mark, trial).has(a)) { toMark.push(a); decl.push({ attacker: a, target: mark, a }); continue; }
      const open = opps.filter(q => q !== mark && !E.predictBlocks(g, q, decl.filter(d => d.target === q).map(d => d.attacker).concat([a])).has(a));
      if (open.length) {
        const t = open.sort((x, y) => x.life - y.life)[0];
        decl.push({ attacker: a, target: t, a });
        continue;
      }
      // blocked anywhere: a junk body (a cloaked land, a token) that would only trade still goes at the mark
      if (pushJunk(g, p, a) && mark) decl.push({ attacker: a, target: mark, a });
    }
    // 3. Etrata herself: only where no untapped blocker can kill her (her own hint), and never as a chump
    // 4. keep blockers home when the table can hit us hard
    const threatIn = Math.max(0, ...opps.map(q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((s, c) => s + hitOf(g, c), 0)));
    if (p.life <= threatIn * 1.1 + 3) {
      const need = Math.max(1, Math.ceil(opps.reduce((n, q) => n + g.creatures(q).length, 0) / 4));
      let homeN = g.creatures(p).filter(c => !decl.some(d => d.attacker === c) && !c.tapped && !g.ch(c).cantBlock).length;
      const pull = decl.filter(d => !g.kw(d.attacker, "vigilance") && !g.ch(d.attacker).cantBlock).sort((x, y) => (blockWorth(g, y.attacker) - hitValue(g, p, y.attacker, y.target) * 0.4) - (blockWorth(g, x.attacker) - hitValue(g, p, x.attacker, x.target) * 0.4));
      for (const d of pull) { if (homeN >= need) break; decl.splice(decl.indexOf(d), 1); homeN++; }
    }
    return { decl: decl.map(d => ({ attacker: d.attacker, target: d.target })) };
  }
  const blockWorth = (g, o) => (g.ch(o).cantBlock ? -10 : 0) + (g.kw(o, "deathtouch") ? 4 : 0) + Math.max(0, g.toughness(o)) + Math.max(0, g.power(o)) * 0.5;
  /* A body worth throwing at a blocker: face down and hiding a land or a cheap card, or a small token. */
  const pushJunk = (g, p, a) => (a.faceDown && a.cardDef && (a.cardDef.types.includes("Land") || a.cardDef.mv <= 2)) || (a.isToken && g.power(a) <= 1);
  function needHome(g, p, a, team) {
    const opps = liveOpps(g, p);
    const threatIn = Math.max(0, ...opps.map(q => g.creatures(q).reduce((s, c) => s + hitOf(g, c), 0)));
    return p.life <= threatIn * 1.1 + 3 && blockWorth(g, a) >= 4;
  }

  /* ---------------- choices */
  /* Equipment: the creature whose hit matters most and that gets through. Quietus Spike and the double strikers
     go on an evasive creature (an Assassin steals twice with double strike); +1/+1 equipment avoids the
     creatures Tetsuko makes unblockable. */
  H.equipTarget = (g, p, opts, name) => {
    const tetsuko = onBf(g, p, "Tetsuko Umezawa, Fugitive");
    const plus = name === "Leyline Axe" || name === "Scytheclaw";
    const score = c => {
      if (c.controller !== p) return -1e9;
      let s = (evasive(g, c) ? 10 : 0) + (isAssassin(g, c) ? 4 : 0) + g.power(c) + (c.sick && !g.kw(c, "haste") ? -3 : 0);
      if (tetsuko && (g.power(c) <= 1 || g.toughness(c) <= 1)) s += plus ? -15 : 8;
      if ((name === "Quietus Spike" || name === "Scytheclaw") && halver(g, c)) s -= 12;   // halving twice in one hit does little more
      if (name === "Genji Glove" || name === "Fireshrieker" || name === "Leyline Axe") s += g.power(c) * 1.5;
      if (c.isCommander && c.def.name === "Etrata, Deadly Fugitive") s -= 6;
      if (g.battlefield.some(e => e.attachedTo === c && e.def.equip && e.def.name !== name)) s -= 2;
      return s;
    };
    return opts.slice().sort((a, b) => score(b) - score(a))[0];
  };
  /* Fading Hope: save our creature from removal (Etrata back to hand costs no tax), never one we don't own. */
  H.fadingTarget = (g, p, req) => {
    const top = g.stack[g.stack.length - 1];
    const hit = top && top.p !== p ? (top.targets || []).filter(t => t && !g.isPlayer(t) && t.controller === p && t.owner === p && req.options.includes(t)) : [];
    if (hit.length) return hit.sort((a, b) => (b.isCommander - a.isCommander) || (valueOf(g, b) - valueOf(g, a)))[0];
    const mine2 = req.options.filter(c => c.controller === p && c.owner === p);
    return mine2.sort((a, b) => (b.isCommander - a.isCommander) || (valueOf(g, b) - valueOf(g, a)))[0] || null;
  };
  /* Ghostly Flicker: two face-down cards that come back face up as something better than a 2/2 (a stolen
     creature, an artifact), or the creature an opponent's removal targets. Never Etrata (she'd go to the command
     zone). */
  const flickerGain = (g, c) => {
    if (!c.faceDown || !c.cardDef) return c.def.triggers.some(t => t.on === "enters" && t.self) ? 2 : -1;
    const d = c.cardDef;
    if (d.types.includes("Instant") || d.types.includes("Sorcery")) return -5;
    if (d.types.includes("Creature")) return (d.pt ? d.pt[0] + d.pt[1] - 4 : 0) + d.mv * 0.5 + (d.statics.length ? 2 : 0);
    return 1 + d.mv * 0.6;   // an artifact, enchantment or land of theirs, ours for good
  };
  H.flickerTarget = (g, p, req) => {
    const top = g.stack[g.stack.length - 1];
    const opts = req.options.filter(c => c.controller === p && !c.isCommander);
    const first = req.purpose === "flicker";
    const taken = g.stack.length && top && top.p === p && top.o && top.o.def.name === "Ghostly Flicker" ? (top.targets || []) : [];
    if (top && top.p !== p) {
      const hit = (top.targets || []).find(t => t && !g.isPlayer(t) && opts.includes(t) && !taken.includes(t));
      if (hit && first) return hit;
    }
    const pool = opts.filter(c => !taken.includes(c)).sort((a, b) => flickerGain(g, b) - flickerGain(g, a));
    const best = pool[0];
    if (!best) return first ? req.options.find(c => !c.isCommander) || null : null;
    return flickerGain(g, best) > 0 || first ? best : null;
  };
  function flickerPlan(g, p, acts, win) {
    const a = acts.find(x => x.type === "cast" && x.card.def.name === "Ghostly Flicker");
    if (!a) return null;
    if (!(win === "main2" || (win === "end" && g.nextPlayer(g.active) === p))) return null;
    const good = g.controlled(p, c => c.faceDown && !c.isCommander).filter(c => flickerGain(g, c) >= 3);
    return good.length ? { type: "cast", card: a.card, maxTries: 1 } : null;
  }
  /* Extra turns go off after combat, with a board that attacks again. */
  H.extraTurnCast = (g, p, o, ctx) => {
    if (!brainOn(p)) return undefined;
    const pw = g.creatures(p).reduce((s, c) => s + hitOf(g, c), 0);
    if (ctx.window === "main2") return pw >= 3 ? 40 : 12;
    return p.hand.length <= 2 && pw >= 3 ? 20 : false;
  };
  /* Notorious Throng: after combat, with the damage dealt this turn (prowl: an extra turn too). */
  H.throngCast = (g, p, o, ctx) => {
    if (ctx.window !== "main2") return false;
    const x = g.opponents(p).reduce((s, q) => s + (q.damageTakenThisTurn || 0), 0);
    return (p.prowl === g.turn && x >= 1) || x >= 4 ? 30 + x : false;
  };

  /* ---------------- tutors and mulligans */
  const TUTOR_WANT = ["Ramses, Assassin Lord", "Bloodletter of Aclazotz", "Quietus Spike", "Unstoppable Slasher", "Virtus the Veiled", "Roaming Throne", "Interceptor, Shadow's Hound",
    "Shredder, Shadow Master", "Genji Glove", "Achilles Davenport", "Roshan, Hidden Magister", "Leyline of Transformation", "Arcane Adaptation", "Maskwood Nexus", "Kindred Discovery", "Ezio, Blade of Vengeance", "Black Widow, Deadly Hunter", "Rhystic Study"];
  /* The kill kit: a doubler (Bloodletter: a halving hit takes all of it), the halvers, and Ramses (one kill wins). */
  const KIT_HALVERS = ["Quietus Spike", "Virtus the Veiled", "Unstoppable Slasher", "Shredder, Shadow Master", "Grievous Wound", "Radioactive Man", "Scytheclaw"];
  function kitWant(g, p) {
    const have = n => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n) || p.hand.some(c => c.def.name === n);
    const halvers = KIT_HALVERS.filter(have), doubler = have("Bloodletter of Aclazotz"), ramses = have("Ramses, Assassin Lord");
    const evasiveBody = g.creatures(p).some(c => !c.faceDown && (g.ch(c).unblockable || g.kw(c, "flying") || c.def.name === "Changeling Outcast"));
    const tetsuko = have("Tetsuko Umezawa, Fugitive");
    const halverOrder = (evasiveBody ? ["Quietus Spike"] : []).concat(tetsuko ? ["Virtus the Veiled"] : []).concat(["Unstoppable Slasher", "Shredder, Shadow Master", "Grievous Wound", "Virtus the Veiled", "Quietus Spike", "Radioactive Man", "Scytheclaw"]);
    let order = [];
    if (!halvers.length && !doubler) order = halverOrder.slice(0, 2).concat(["Bloodletter of Aclazotz"]).concat(halverOrder.slice(2));
    else if (!halvers.length) order = halverOrder;
    else if (!doubler) order = ["Bloodletter of Aclazotz"];
    if (!ramses) order.push("Ramses, Assassin Lord");
    return order.filter((n, i) => order.indexOf(n) === i && !have(n));
  }
  function heistTutor(g, p, cands) {
    if (!cands || !cands.length) return null;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (lands < 3 && !p.hand.some(c => c.def.types.includes("Land"))) {
      const l = cands.find(c => c.def.types.includes("Land") && !c.def.supertypes.includes("Basic")) || cands.find(c => c.def.types.includes("Land"));
      if (l) return l;
    }
    const have = n => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n) || p.hand.some(c => c.def.name === n);
    const enabled = g.battlefield.some(o => o.controller === p && (o.def.makesAssassins && o.def.name !== "Roaming Throne" || o.def.name === "Maskwood Nexus")) || p.hand.some(c => c.def.makesAssassins && c.def.name !== "Roaming Throne" || c.def.name === "Maskwood Nexus");
    if (H.kitTutor !== false) for (const n of kitWant(g, p)) { const c = cands.find(x => x.def.name === n); if (c) return c; }
    for (const n of TUTOR_WANT) {
      if (have(n)) continue;
      if (enabled && ["Maskwood Nexus", "Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"].includes(n)) continue;
      const c = cands.find(x => x.def.name === n);
      if (c) return c;
    }
    return null;
  }
  function heistMulligan(g, p, { hand, mulls }) {
    const lands = hand.filter(o => o.def.types.includes("Land")).length;
    const cheap = hand.filter(o => !o.def.types.includes("Land") && o.def.mv <= 2).length;
    const rocks = hand.filter(o => !o.def.types.includes("Land") && o.def.ai && o.def.ai.ramp && o.def.mv <= 2).length;
    if (mulls >= 2) return lands >= 1 && lands <= 5;
    if (lands >= 2 && lands <= 4 && cheap >= 2) return true;
    if (lands === 5 && cheap >= 1) return true;
    if (lands === 1 && rocks >= 1 && cheap >= 3 && mulls >= 1) return true;
    if (lands >= 2 && lands <= 4 && mulls >= 1) return true;
    return false;
  }

  /* ---------------- the plan outside combat */
  /* ---------------- flips (Etrata's {2}{U}{B}, or the card's own cost): what turning a face-down creature up
     gains over the face-down body it is now (with our pumps, evasion and Forsaken Monument's +2/+2). Lands
     can't be turned up (the flip would only exile them). */
  const KW_V = { flying: 2, "double strike": 3, trample: 1, deathtouch: 1.5, lifelink: 1, menace: 1.5, "first strike": 1, hexproof: 1, indestructible: 2, vigilance: 0.5 };
  function flipGain(g, p, o) {
    const d = o.cardDef;
    if (!o.faceDown || !d || d.types.includes("Land")) return -99;
    const cur = Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)) * 0.5 + (evasive(g, o) ? 2 : 0);
    if (d.types.includes("Instant") || d.types.includes("Sorcery")) return null;
    if (!d.types.includes("Creature")) return 1 + d.mv * 0.8 - cur * 0.6;   // a free permanent instead of a body
    const pt = d.pt || [0, 0];
    let up = pt[0] + pt[1] * 0.5 + d.keywords.reduce((t, k) => t + (KW_V[k] || 0), 0) + (d.statics.length ? 2 : 0) + (d.triggers.length ? 1 : 0);
    if (isAssassin(g, o)) up += (onBf(g, p, "Ramses, Assassin Lord") ? 1.5 : 0) + (onBf(g, p, "Achilles Davenport") ? 1.5 : 0);
    return up - cur;
  }
  const flipActs = (acts, o) => acts.filter(a => a.type === "activate" && a.card === o && a.ab && (a.ab.etrata || a.ab.faceUp));
  /* The cheapest way to turn it up: its own cost when we can pay it, else Etrata's ability. */
  function cheapestFlip(g, p, acts, o) {
    const list = flipActs(acts, o).map(a => ({ a, mv: MK.util.costMV(g.abilityCost(p, o, a.ab, 0)) })).sort((x, y) => x.mv - y.mv);
    return list[0] || null;
  }
  function flipPlan(g, p, acts, win) {
    let best = null, bs = 0;
    for (const o of g.controlled(p, c => c.faceDown && g.isCreature(c))) {
      const gain = flipGain(g, p, o);
      if (gain == null || gain < (win === "main1" ? 3 : 2)) continue;
      // in the first main phase only a creature that can still attack this turn
      if (win === "main1" && (o.tapped || (o.sick && !g.kw(o, "haste")) || !o.cardDef.types.includes("Creature"))) continue;
      const f = cheapestFlip(g, p, acts, o);
      if (!f) continue;
      const sc = gain - f.mv * 0.3;
      if (sc > bs) { bs = sc; best = f.a; }
    }
    return best ? { type: "activate", card: best.card, idx: best.idx, maxTries: 1 } : null;
  }
  /* After blockers: an unblocked face-down attacker that hits harder face up. */
  function combatFlips(g, p, acts) {
    let best = null, bs = 1;
    for (const o of g.controlled(p, c => c.faceDown && c.combat && c.combat.attacking && !c.combat.wasBlocked)) {
      const d = o.cardDef;
      if (!d || !d.types.includes("Creature") || !d.pt) continue;
      const gain = (d.pt[0] - g.power(o)) * (d.keywords.includes("double strike") ? 2 : 1) + (onBf(g, p, "Ramses, Assassin Lord") && isAssassin(g, o) ? 1 : 0);
      const f = cheapestFlip(g, p, acts, o);
      if (!f || gain < 2) continue;
      if (gain - f.mv * 0.1 > bs) { bs = gain - f.mv * 0.1; best = f.a; }
    }
    return best ? { type: "activate", card: best.card, idx: best.idx, maxTries: 1 } : null;
  }
  /* Etrata's ability when the generic loop asks (the brain flips in its own plan first): noncreature permanents
     we stole become free permanents; instants and sorceries follow Etrata's own rules. */
  function heistFlipUse(g, p, o, ctx) {
    if (!brainOn(p)) return undefined;
    const gain = flipGain(g, p, o);
    if (gain == null) return undefined;
    if (!(mainWin(ctx.window) || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p))) return false;
    return gain >= (o.cardDef.types.includes("Creature") ? 2 : 1);
  }

  /* Before combat: when making one more attacker unblockable turns this attack into a kill, do it (Rogue's
     Passage, Access Tunnel, Key to the City, Brotherhood Regalia). */
  const EVADE = { "Rogue's Passage": () => true, "Access Tunnel": (g, c) => g.power(c) <= 3, "Key to the City": () => true, "Brotherhood Regalia": () => true };
  function evasionPlan(g, p, acts) {
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    const opps = liveOpps(g, p);
    if (!able.length || opps.some(q => outcome(g, p, q, able).kill)) return null;
    for (const a of acts) {
      if (a.type !== "activate" || !EVADE[a.card.def.name]) continue;
      if (a.card.def.name === "Brotherhood Regalia" && a.ab.label !== "Equip" && a.ab.label !== "Equip legendary creature") continue;
      if (a.card.def.name === "Key to the City" && p.hand.length < 1) continue;
      for (const c of able) {
        if (g.ch(c).unblockable || !EVADE[a.card.def.name](g, c) || (a.ab.label === "Equip legendary creature" && !c.def.legendary)) continue;
        if (a.card.def.name === "Brotherhood Regalia" && a.card.attachedTo === c) continue;
        if (opps.some(q => outcome(g, p, q, able, new Set([c])).kill)) { mem(p).evade = { o: c, turn: g.turn }; return { type: "activate", card: a.card, idx: a.idx, maxTries: 1 }; }
      }
    }
    return null;
  }
  /* Main phase one: the cards that make this combat lethal or bigger go down before it (Bloodletter when
     something will connect, Grievous Wound on the mark). */
  function precombat(g, p, acts) {
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    if (!able.length) return null;
    const bl = acts.find(a => a.type === "cast" && !a.faceDown && a.card.def.name === "Bloodletter of Aclazotz");
    if (bl && liveOpps(g, p).some(q => outcome(g, p, q, able).through.length)) return { type: "cast", card: bl.card, maxTries: 1 };
    const gw = acts.find(a => a.type === "cast" && a.card.def.name === "Grievous Wound");
    if (gw && liveOpps(g, p).some(q => outcome(g, p, q, able).through.length)) return { type: "cast", card: gw.card, maxTries: 1 };
    return null;
  }
  /* Transmute (Muddle the Mixture, Shred Memory, Drift of Phantasms, Dimir House Guard) for a kit piece of the same mana value. */
  const TRANSMUTERS = new Set(["Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard", "Dizzy Spell"]);
  function transmutePlan(g, p, acts) {
    for (const a of acts) {
      if (a.type !== "channel" || !TRANSMUTERS.has(a.card.def.name) || a.card.zone !== "hand") continue;
      const mv = a.card.def.mv, want = kitWant(g, p);
      if (p.library.some(c => c.def.mv === mv && want.includes(c.def.name))) return { type: "channel", card: a.card, maxTries: 1 };
    }
    return null;
  }
  function heistPlan(g, p, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    if (!brainOn(p)) return null;
    if (win === "combat" && g.active === p && g.phase === "damage") return combatFlips(g, p, acts);
    if (win === "main1" && g.active === p) { const a = precombat(g, p, acts) || (H.flipFirst ? flipPlan(g, p, acts, win) : null) || evasionPlan(g, p, acts) || transmutePlan(g, p, acts); if (a) return a; }
    if (win === "main2" && g.active === p && H.flipFirst) { const a = flipPlan(g, p, acts, win); if (a) return a; }
    if (win === "main2" || win === "end") { const f = flickerPlan(g, p, acts, win); if (f) return f; }
    return null;
  }
  function heistChoose(g, p, req) {
    // the creature an evasion source was used for
    const ev = mem(p).evade;
    if (ev && ev.turn === g.turn && req.type === "target" && req.src && EVADE[req.src.def.name] && req.options.includes(ev.o)) return ev.o;
    if (req.type === "target" && req.purpose === "transmute") return req.options.find(x => x === p);
    if (req.type === "cards" && req.purpose === "tutor" && req.options.length > 1) {
      const c = heistTutor(g, p, req.options);
      return c ? [c] : undefined;
    }
    // Grievous Wound and the other "harm a player" choices: the mark
    if (req.type === "player" && req.purpose === "harm" && req.src && req.src.def && req.src.def.name === "Grievous Wound") {
      const m = mem(p).mark;
      if (m && req.options.includes(m)) return m;
      return req.options.slice().sort((a, b) => a.life - b.life)[0];
    }
    if (req.type === "target" && req.purpose === "sacrifice" && req.src && req.src.def && req.src.def.name === "Eldrazi Monument") {
      return req.options.slice().sort((a, b) => sacScore(g, p, a) - sacScore(g, p, b))[0];
    }
    return undefined;
  }
  /* What a creature is worth keeping: a stolen face-down land is the first to go (Thieving Amalgam drains for it). */
  const sacScore = (g, p, o) => (o.isCommander ? 50 : 0) + (o.owner !== p ? -3 : 0) + (o.faceDown && o.cardDef && o.cardDef.types.includes("Land") ? -4 : 0) + (o.isToken ? -2 : 0) + valueOf(g, o);

  (MK.DECK_BRAINS = MK.DECK_BRAINS || {})[DECK_ID] = {
    plan: heistPlan,
    attack: (g, p, cands, targets) => (brainOn(p) ? heistAttack(g, p, cands, targets) : null),
    choose: heistChoose, tutor: heistTutor, mulligan: heistMulligan,
    ownFlips: true, flipUse: heistFlipUse
  };
  MK.DECK_TUTORS = MK.DECK_TUTORS || {}; MK.DECK_TUTORS[DECK_ID] = heistTutor;
  MK.DECK_TYPES = MK.DECK_TYPES || {}; MK.DECK_TYPES[DECK_ID] = "Assassin";
  // Etrata's own hooks (cards-etrata.js) run for this deck too: her blocks, combat flips, Boots, the unblockable-for-a-kill plan
  if (MK.ETRATA_BRAIN && MK.ETRATA_BRAIN.decks) MK.ETRATA_BRAIN.decks.add(DECK_ID);
  MK.HEIST_BRAIN = { pickMark, heistAttack, heistTutor, heistMulligan, hitValue, flickerGain };

  /* ================================================================ the deck */
  const B = n => Array(n).fill("Swamp"), I = n => Array(n).fill("Island");
  // the starting point: the Etrata B4 aggro list (decks-etrata4.js); research lists replace it (tools/sim/bench LIST_FILE)
  const LIST = ["Changeling Outcast", "Mothdust Changeling", "Universal Automaton", "Hookblade Veteran", "Hired Poisoner",
    "Brotherhood Spy", "Desmond Miles", "Basim Ibn Ishaq", "Duskmantle Guildmage", "Guildsworn Prowler", "Thrill-Kill Assassin", "Mischievous Sneakling",
    "Mari, the Killing Quill", "Black Widow, Deadly Hunter", "Shadow, Mysterious Assassin", "Virtus the Veiled", "Unstoppable Slasher", "Mistwalker", "Midnight Assassin", "Lydia Frye", "Merciless Harlequin", "Gix, Yawgmoth Praetor", "Adéwalé, Breaker of Chains",
    "Achilles Davenport", "Ramses, Assassin Lord", "Roshan, Hidden Magister", "Etrata, the Silencer", "Interceptor, Shadow's Hound", "Spark Double", "Ezio, Blade of Vengeance",
    "Sol Ring", "Mana Vault", "Chrome Mox", "Lotus Petal", "Arcane Signet", "Talisman of Dominance", "Fellwar Stone", "Dark Ritual",
    "Skullclamp", "Rhystic Study", "Mystic Remora", "Kindred Discovery", "Rooftop Bypass", "Bitterblossom", "Eagle Vision", "Preordain", "Brainstorm",
    "Demonic Tutor", "Vampiric Tutor", "Imperial Seal",
    "Force of Will", "Fierce Guardianship", "Swan Song", "Counterspell", "An Offer You Can't Refuse", "Infernal Grasp", "Go for the Throat", "Deadly Rollick", "Chain Assassination", "Shoot the Sheriff", "Cyclonic Rift",
    "Swiftfoot Boots", "Lightning Greaves", "Brotherhood Regalia", "Cover of Darkness", "Maskwood Nexus", "Mindcrank",
    "Ancient Tomb", "Command Tower", "Watery Grave", "Polluted Delta", "Marsh Flats", "Scalding Tarn", "Flooded Strand", "Underground River", "Drowned Catacomb", "Sunken Hollow", "Choked Estuary", "Darkwater Catacombs", "Darkslick Shores", "Tainted Isle", "River of Tears", "Path of Ancestry", "Access Tunnel", "Rogue's Passage", "Brotherhood Headquarters", "Cavern of Souls", "Secluded Courtyard"
  ].concat(I(5), B(6));
  MK.ETRATA_HEIST_DECK = {
    id: DECK_ID, hero: "etrata", variant: DECK_ID, label: "Etrata Heist (research)", name: "Etrata Heist", title: "Etrata, Deadly Fugitive",
    commander: "Etrata, Deadly Fugitive", identity: ["U", "B"], bracket: 4, aggression: 0.85,
    style: "Dimir theft aggro",
    blurb: "Research list: cheap Assassins connect, each hit cloaks an opponent's card, and the stolen cards attack too. One opponent at a time, until Ramses or the damage ends the game.",
    watch: ["Ramses, Assassin Lord", "Unstoppable Slasher", "Virtus the Veiled", "Quietus Spike", "Bloodletter of Aclazotz"],
    list: LIST
  };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.ETRATA_HEIST_DECK);

  MK.HEIST_HOOKS = H;
})(typeof window !== "undefined" ? window : globalThis);
