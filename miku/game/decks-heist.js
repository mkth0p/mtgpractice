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


  /* ---------------- cheap evasive bodies (Rogues and friends; type-changers make them Assassins) */
  const unblockable = { applies: (g, s, o) => o === s, unblockable: true };
  D({ name: "Slither Blade", cost: "{U}", type: "Creature — Snake Rogue", pt: "1/2", text: "This creature can't be blocked.", statics: [unblockable], ai: { priority: 6 } });
  D({ name: "Triton Shorestalker", cost: "{U}", type: "Creature — Merfolk Rogue", pt: "1/1", text: "This creature can't be blocked.", statics: [unblockable], ai: { priority: 6 } });
  D({ name: "Invisible Stalker", cost: "{1}{U}", type: "Creature — Human Rogue", pt: "1/1", keywords: ["hexproof"], text: "Hexproof (This creature can't be the target of spells or abilities your opponents control.)\nThis creature can't be blocked.", statics: [unblockable], ai: { priority: 6 } });
  D({
    name: "Gray Harbor Merfolk", cost: "{1}{U}", type: "Creature — Merfolk Rogue", pt: "0/3",
    text: "This creature can't be blocked.\nThis creature gets +2/+0 as long as you control a commander that's a creature or planeswalker.",
    statics: [unblockable, { applies: (g, s, o) => o === s && g.battlefield.some(c => c.controller === s.controller && c.isCommander && (g.isCreature(c) || g.isPlaneswalker(c))), pt: [2, 0] }],
    ai: { priority: 6 }
  });
  D({
    name: "Shoreline Looter", cost: "{1}{U}", type: "Creature — Rat Rogue", pt: "1/1",
    text: "This creature can't be blocked.\nThreshold — Whenever this creature deals combat damage to a player, draw a card. Then discard a card unless there are seven or more cards in your graveyard.",
    statics: [unblockable],
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        g.draw(p, 1);
        if (p.graveyard.length >= 7 || !p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Shoreline Looter: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
        g.discard(p, (pick || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1]);
      }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Looter il-Kor", cost: "{1}{U}", type: "Creature — Kor Rogue", pt: "1/1", keywords: ["shadow"],
    text: "Shadow (This creature can block or be blocked by only creatures with shadow.)\nWhenever this creature deals damage to an opponent, draw a card, then discard a card.",
    triggers: [{
      on: "damage", when: (g, s, ev) => ev.src === s && !!ev.toPlayer && isOpp(g, s.controller, ev.target),
      do: async (g, s, ev, { p }) => {
        g.draw(p, 1);
        if (!p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Looter il-Kor: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
        g.discard(p, (pick || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1]);
      }
    }],
    ai: { priority: 6 }
  });
  D({ name: "Prickly Boggart", cost: "{B}", type: "Creature — Goblin Rogue", pt: "1/1", keywords: ["fear"], text: "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)", ai: { priority: 5 } });
  D({
    name: "Vampire Cutthroat", cost: "{B}", type: "Creature — Vampire Rogue", pt: "1/1", keywords: ["skulk", "lifelink"],
    text: "Skulk (This creature can't be blocked by creatures with greater power.)\nLifelink (Damage dealt by this creature also causes you to gain that much life.)",
    canBeBlockedBy: (g, a, b) => g.power(b) <= g.power(a),
    ai: { priority: 6 }
  });
  D({ name: "Nightshade Stinger", cost: "{B}", type: "Creature — Faerie Rogue", pt: "1/1", keywords: ["flying"], cantBlock: true, text: "Flying\nThis creature can't block.", ai: { priority: 5 } });
  D({
    name: "Network Disruptor", cost: "{U}", type: "Artifact Creature — Moonfolk Rogue", pt: "1/1", keywords: ["flying"],
    text: "Flying\nWhen this creature enters, tap target permanent.",
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, trig({ kind: "permanent", purpose: "harm", prompt: "Network Disruptor: tap target permanent", filter: (g2, o) => !o.tapped && o.controller !== p }), s); if (t && t.zone === "battlefield") g.tap(t); } }],
    ai: { priority: 5 }
  });
  D({
    name: "Sygg, River Cutthroat", cost: "{U/B}{U/B}", type: "Legendary Creature — Merfolk Rogue", pt: "1/3",
    text: "At the beginning of each end step, if an opponent lost 3 or more life this turn, you may draw a card. (Damage causes loss of life.)",
    triggers: [{ on: "endStep", intervening: (g, s) => g.opponents(s.controller).some(q => (q.lifeLostThisTurn || 0) >= 3), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 6 }
  });
  D({
    name: "Ruthless Ripper", cost: "{B}", type: "Creature — Human Assassin", pt: "1/1", keywords: ["deathtouch"],
    text: "Deathtouch\nMorph—Reveal a black card in your hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, target player loses 2 life.",
    note: "Casting it face down isn't offered (its morph cost is revealing a card, which the game can't pay); it's a one-mana deathtouch Assassin here. A cloaked or manifested Ripper still turns up for {B}.",
    triggers: [{ on: "turnedFaceUp", self: true, do: async (g, s, ev, { p }) => { const q = await g.chooseTarget(p, trig({ kind: "player", purpose: "harm", prompt: "Ruthless Ripper: target player loses 2 life" }), s); if (q && !q.lost) g.loseLife(q, 2, s); } }],
    ai: { priority: 6 }
  });


  /* ---------------- combat helpers from the public lists */
  D({
    name: "Dolmen Gate", cost: "{2}", type: "Artifact",
    text: "Prevent all combat damage that would be dealt to attacking creatures you control.",
    statics: [{ preventCombatDamageTo: (g, s, t) => t.controller === s.controller }],
    ai: { priority: 7 }
  });
  /* two creatures share a creature type (every type for changelings and Maskwood Nexus; none face down) */
  function shareType(g, x, y) {
    const X = g.ch(x), Y = g.ch(y);
    if (X.allTypes) return Y.allTypes || Y.subtypes.size > 0;
    if (Y.allTypes) return X.subtypes.size > 0;
    for (const t of X.subtypes) if (Y.subtypes.has(t)) return true;
    return false;
  }
  D({
    name: "Haunted One", cost: "{2}{B}", type: "Legendary Enchantment — Background",
    text: "Commander creatures you own have \"Whenever this creature becomes tapped, it and other creatures you control that share a creature type with it each get +2/+0 and gain undying until end of turn.\" (When a creature with undying dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)",
    note: "A Background in the 99: it works as written, on your commander. The commander's ability is written as a trigger of Haunted One.",
    triggers: [{
      on: "becomesTapped", when: (g, s, ev) => !!ev.o && ev.o.isCommander && ev.o.owner === s.controller && ev.o.controller === s.controller && g.isCreature(ev.o),
      do: (g, s, ev, { p }) => {
        const c = ev.o;
        if (c.zone !== "battlefield") return;
        const list = g.creatures(p).filter(o => o === c || shareType(g, c, o));
        g.pump(list, 2, 0, ["undying"]);
        const ids = new Map(list.map(o => [o.id, o.zc]));
        const entry = { controller: p, def: { name: "Haunted One", triggers: [{
          on: "dies", when: (g2, e, ev2) => g2.tempTriggers.includes(e) && ids.get(ev2.o.id) === ev2.o.zc - 1 && !(ev2.lki && ev2.lki.counters && ev2.lki.counters.p1 > 0),
          do: (g2, e, ev2) => {
            const o = ev2.o;
            if (o.zone !== "graveyard" || o.isToken || o.owner.lost) return;
            g2.putOntoBattlefield([o], o.owner, { counters: { p1: 1 } });
            log(g2, `${o.def.name} returns with a +1/+1 counter (undying).`, o.owner, [o.def.name]);
          }
        }] } };
        g.tempTriggers.push(entry); g.ts++;
        log(g, `${list.length} creature${list.length > 1 ? "s" : ""} sharing a type with ${c.def.name} get +2/+0 and undying (Haunted One).`, p, [s.def.name]);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Sword Coast Sailor", cost: "{1}{U}", type: "Legendary Enchantment — Background",
    text: "Commander creatures you own have \"Whenever this creature attacks a player, if no opponent has more life than that player, this creature can't be blocked this turn.\"",
    note: "The commander's ability is written as a trigger of Sword Coast Sailor.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => !!ev.o && ev.o.isCommander && ev.o.owner === s.controller && ev.o.controller === s.controller && g.isPlayer(ev.target),
      intervening: (g, s, ev) => !g.opponents(s.controller).some(q => q.life > ev.target.life),
      do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.addEffect({ objs: [ev.o], unblockable: true }); }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Reverse the Polarity", cost: "{1}{U}{U}", type: "Instant",
    text: "Choose one —\n• Counter all other spells.\n• Switch each creature's power and toughness until end of turn.\n• Creatures can't be blocked this turn.",
    note: "Switching power and toughness isn't offered (the bots never chose it).",
    modes: [
      { label: "Counter all other spells", do: (g, ctx) => { for (const it of g.stack.slice()) if (it !== ctx.item && it.kind === "spell") g.counterSpell(it, ctx.o); } },
      { label: "Creatures can't be blocked this turn", do: (g, ctx) => { g.addEffect({ filter: (g2, o) => g2.isCreature(o), unblockable: true }); log(g, "Creatures can't be blocked this turn.", ctx.p, ["Reverse the Polarity"]); } }
    ],
    ai: { priority: 5, cast: () => false, mode: (g, p) => (g.active === p ? 1 : 0) }
  });
  D({
    name: "Akroma's Memorial", cost: "{7}", type: "Legendary Artifact",
    text: "Creatures you control have flying, first strike, vigilance, trample, haste, and protection from black and from red.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["flying", "first strike", "vigilance", "trample", "haste"], prot: ["B", "R"] }],
    ai: { priority: 7 }
  });


  D({
    name: "Sakashima the Impostor", cost: "{2}{U}{U}", type: "Legendary Creature — Human Rogue", pt: "3/1",
    text: "You may have Sakashima the Impostor enter as a copy of any creature on the battlefield, except its name is Sakashima the Impostor, it's legendary in addition to its other types, and it has \"{2}{U}{U}: Return Sakashima the Impostor to its owner's hand at the beginning of the next end step.\"",
    note: "The return-to-hand ability isn't offered to the bots.",
    asEnters: async (g, p, o, item, eo) => {
      const opts = g.battlefield.filter(c => c !== o && g.isCreature(c) && !c.faceDown);
      if (!opts.length) return;
      const pick = await g.ask(p, { type: "target", prompt: "Sakashima the Impostor: enter as a copy of", options: opts, optional: true, purpose: "sakashimaCopy", src: o });
      if (!pick || !opts.includes(pick)) return;
      const base = MK.copiable(pick);
      o.def = MK.derive(base, { name: "Sakashima the Impostor", supertypes: base.supertypes.includes("Legendary") ? base.supertypes : ["Legendary"].concat(base.supertypes), legendary: true });
      g.ts++;
      log(g, `Sakashima the Impostor enters as a copy of ${base.name}.`, p, [base.name]);
    },
    ai: { priority: 6, hold: (g, p) => !g.battlefield.some(c => g.isCreature(c) && !c.faceDown && valueOf(g, c) >= 6), target: (g, p, req) => (req.purpose === "sakashimaCopy" && H.copyTarget ? H.copyTarget(g, p, req) : undefined) }
  });


  /* ---------------- ways to Ramses */
  D({
    name: "Demonic Consultation", cost: "{B}", type: "Instant",
    text: "Choose a card name. Exile the top six cards of your library, then reveal cards from the top of your library until you reveal a card with the chosen name. Put that card into your hand and exile all other cards revealed this way.",
    note: "You choose among the names of the cards in your library (the bots pick their tutor target; they don't know the order).",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const names = [...new Set(p.library.map(c => c.def.name))];
        if (!names.length) return;
        const want = H.consultName ? H.consultName(g, p) : null;
        const ans = await g.ask(p, { type: "option", prompt: "Demonic Consultation: choose a card name", options: names.map((n, i) => ({ id: i, label: n })), purpose: "consultName", src: ctx.o, want });
        const name = names[ans] != null ? names[ans] : names[0];
        for (let i = 0; i < 6 && p.library.length; i++) g.moveTo(p.library[0], "exile");
        while (p.library.length) {
          const c = p.library[0];
          if (c.def.name === name) { g.moveTo(c, "hand"); log(g, `${p.name} reveals ${name} (Demonic Consultation).`, p, [name]); return; }
          g.moveTo(c, "exile");
        }
        log(g, `${p.name} exiles the rest of their library without finding ${name}.`, p, []);
      }
    },
    ai: { priority: 7, tutor: true, option: (g, p, req) => (req.purpose === "consultName" && req.want ? (req.options.find(o => o.label === req.want) || req.options[0]).id : undefined), cast: (g, p) => (H.consultName && H.consultName(g, p) ? 30 : false) }
  });
  D({
    name: "Fleshwrither", cost: "{2}{B}{B}", type: "Creature — Horror", pt: "3/3",
    text: "Transfigure {1}{B}{B} ({1}{B}{B}, Sacrifice this creature: Search your library for a creature card with the same mana value as this creature, put that card onto the battlefield, then shuffle. Transfigure only as a sorcery.)",
    abilities: [{
      label: "Transfigure", cost: "{1}{B}{B}", timing: "sorcery", sacSelf: true,
      do: async (g, src, ctx) => {
        const p = ctx.p, mv = src.cardDef ? src.cardDef.mv : 4;
        await g.search(p, { filter: (g2, c) => c.def.types.includes("Creature") && c.def.mv === mv, to: "battlefield", prompt: "Transfigure: a creature card with mana value " + mv, purpose: "tutor", src });
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !!H.transfigureWant && H.transfigureWant(g, p, 4) }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Pyre of Heroes", cost: "{2}", type: "Artifact",
    text: "{2}, {T}, Sacrifice a creature: Search your library for a creature card that shares a creature type with the sacrificed creature and has mana value equal to 1 plus that creature's mana value. Put that card onto the battlefield, then shuffle. Activate only as a sorcery.",
    note: "The sacrificed creature's types and mana value are read as it's sacrificed, as the ability is activated.",
    abilities: [{
      label: "Sacrifice: search one mana value up", cost: "{2}", tap: true, timing: "sorcery",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c) && !c.faceDown, prompt: "Pyre of Heroes: sacrifice a creature" },
      do: async (g, src, ctx) => {
        const p = ctx.p, info = ctx.sacrificed || null;
        if (!info) return;
        await g.search(p, { filter: (g2, c) => c.def.types.includes("Creature") && c.def.mv === info.mv + 1 && (c.def.changeling || info.allTypes || c.def.subtypes.some(t => info.subtypes.includes(t))), to: "battlefield", prompt: "Pyre of Heroes: a creature card sharing a type, mana value " + (info.mv + 1), purpose: "tutor", src });
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !!H.pyrePick && !!H.pyrePick(g, p) }
    }],
    ai: { priority: 5 }
  });


  /* ================================================================ typal payoffs (Assassins) and closers
     Everything that names a creature type chooses Assassin. The creature types a permanent has, read from the card
     and the type-changing statics (never from the full characteristics, so it's safe inside another static). */
  function typesLite(g, o) {
    const out = new Set(o.def.subtypes);
    let all = !!o.def.changeling;
    if (o.zone !== "battlefield") return { set: out, all };
    for (const src of g.staticSources()) for (const st of g.staticsOf(src)) {
      if (!st.subtypes && !st.allTypes) continue;
      let ok = false;
      try { ok = !st.applies || st.applies(g, src, o); } catch (e) { ok = false; }
      if (!ok) continue;
      if (st.allTypes) all = true;
      if (st.subtypes) { const v = typeof st.subtypes === "function" ? st.subtypes(g, src, o) : st.subtypes; if (v) v.forEach(t => out.add(t)); }
    }
    return { set: out, all };
  }
  function shareTypeLite(a, b) {
    if (a.all) return b.all || b.set.size > 0;
    if (b.all) return a.set.size > 0;
    for (const t of a.set) if (b.set.has(t)) return true;
    return false;
  }
  /* The creature spell is an Assassin: on the card, by changeling, or by a type changer on our battlefield ("the same is
     true for creature spells you control"). */
  const assassinSpell = (g, card, p) => !!card && card.def.types.includes("Creature") && (card.def.changeling || card.def.subtypes.includes("Assassin") || g.battlefield.some(o => o.controller === p && (o.def.makesAssassins && o.def.name !== "Roaming Throne" || o.def.name === "Maskwood Nexus")));
  D({
    name: "Coat of Arms", cost: "{5}", type: "Artifact",
    text: "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it. (For example, if two Goblin Warriors and a Goblin Shaman are on the battlefield, each gets +2/+2.)",
    statics: [{
      applies: (g, s, o) => g.isCreature(o),
      pt: (g, s, o) => {
        if (!s.__coat || s.__coat.v !== g.v) {
          const cre = g.battlefield.filter(c => g.isCreature(c)), types = new Map(cre.map(c => [c.id, typesLite(g, c)])), counts = new Map();
          for (const c of cre) { let n = 0; for (const d of cre) if (d !== c && shareTypeLite(types.get(c.id), types.get(d.id))) n++; counts.set(c.id, n); }
          s.__coat = { v: g.v, counts };
        }
        const n = s.__coat.counts.get(o.id) || 0;
        return [n, n];
      }
    }],
    ai: { priority: 7, threat: 4, cast: (g, p, o, ctx) => (H.coatCast ? H.coatCast(g, p, o, ctx) : undefined) }
  });
  D({
    name: "Obelisk of Urd", cost: "{6}", type: "Artifact", keywords: ["convoke"],
    text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nAs this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +2/+2.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [2, 2] }],
    ai: { priority: 7, minCreatures: 3 }
  });
  D({
    name: "Kindred Dominance", cost: "{5}{B}{B}", type: "Sorcery",
    text: "Choose a creature type. Destroy all creatures that aren't of the chosen type.",
    note: "The chosen type is always Assassin.",
    spell: { do: (g, ctx) => { const hit = g.battlefield.filter(o => g.isCreature(o) && !isAssassin(g, o)); g.destroyAll(hit, ctx.o); log(g, `Kindred Dominance (Assassin): ${hit.length} creature${hit.length === 1 ? "" : "s"} destroyed.`, ctx.p, ["Kindred Dominance"]); } },
    ai: { priority: 6, wipe: true, spares: o => !!o.def.changeling || o.def.subtypes.includes("Assassin"), cast: (g, p, o, ctx) => (H.dominanceCast ? H.dominanceCast(g, p, o, ctx) : undefined) }
  });
  D({
    name: "Vanquisher's Banner", cost: "{5}", type: "Artifact",
    text: "As this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.\nWhenever you cast a creature spell of the chosen type, draw a card.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [1, 1] }],
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !(ev.item && (ev.item.isCopy || ev.item.faceDown)) && assassinSpell(g, ev.o, ev.p), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 6 }
  });
  D({
    name: "Door of Destinies", cost: "{4}", type: "Artifact",
    text: "As this artifact enters, choose a creature type.\nWhenever you cast a spell of the chosen type, put a charge counter on this artifact.\nCreatures you control of the chosen type get +1/+1 for each charge counter on this artifact.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: (g, s) => [s.counters.charge || 0, s.counters.charge || 0] }],
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !(ev.item && (ev.item.isCopy || ev.item.faceDown)) && assassinSpell(g, ev.o, ev.p), do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "charge", 1, s); } }],
    ai: { priority: 6 }
  });
  D({
    name: "Icon of Ancestry", cost: "{3}", type: "Artifact",
    text: "As this artifact enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.\n{3}, {T}: Look at the top three cards of your library. You may reveal a creature card of the chosen type from among them and put it into your hand. Put the rest on the bottom of your library in a random order.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [1, 1] }],
    abilities: [{
      label: "Look at the top three for an Assassin", cost: "{3}", tap: true,
      do: async (g, src, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 3);
        if (!top.length) return;
        const ok = top.filter(c => assassinSpell(g, c, p));
        let pick = null;
        if (ok.length) { const a = await g.ask(p, { type: "cards", prompt: "Icon of Ancestry: reveal an Assassin creature card and put it into your hand", options: ok, min: 0, max: 1, purpose: "iconPick", src }); pick = (a || [])[0] || null; }
        if (pick) g.moveTo(pick, "hand");
        for (const c of g.shuffleArr(top.filter(c => c !== pick))) if (c.zone === "library") { g.removeFromZone(c); p.library.push(c); }
        log(g, pick ? `${p.name} reveals ${pick.def.name} (Icon of Ancestry).` : `${p.name} finds no Assassin (Icon of Ancestry).`, p, pick ? [pick.def.name] : []);
      },
      ai: { use: (g, p, o, ctx) => (ctx.window === "main2" || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p)) && manaNow(g, p) >= 3 }
    }],
    ai: { priority: 6, cards: (g, p, req) => (req.purpose === "iconPick" ? [req.options.slice().sort((a, b) => ((b.def.ai && b.def.ai.priority) || 5) - ((a.def.ai && a.def.ai.priority) || 5))[0]] : null) }
  });
  D({
    name: "Adaptive Automaton", cost: "{3}", type: "Artifact Creature — Construct", pt: "2/2",
    text: "As this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.\nOther creatures you control of the chosen type get +1/+1.",
    note: "The chosen type is always Assassin.",
    etbState: () => ({ chosenType: "Assassin" }),
    makesAssassins: (g, s, o) => o === s,
    statics: [{ applies: (g, s, o) => o === s, subtypes: ["Assassin"] }, { applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [1, 1] }],
    ai: { priority: 6 }
  });
  /* altars: a mana ability with a sacrifice cost can't be used by the automatic payment, so it adds to the pool (the
     mana stays until the end of the step) and a brain plan spends it */
  const altar = (name, text, add) => D({
    name, cost: "{3}", type: "Artifact", text,
    abilities: [{
      label: "Sacrifice a creature: add mana", manaAbility: true,
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: `${name}: sacrifice a creature` },
      do: (g, src, ctx) => { add(g, ctx); g.bump(); },
      ai: { use: (g, p, o, ctx) => (H.altarUse ? H.altarUse(g, p, o, ctx) : false) }
    }],
    ai: { priority: 5 }
  });
  altar("Ashnod's Altar", "Sacrifice a creature: Add {C}{C}.", (g, ctx) => { ctx.p.pool.C += 2; });
  altar("Phyrexian Altar", "Sacrifice a creature: Add one mana of any color.", (g, ctx) => { ctx.p.pool.B += 1; });
  MK.defs.get("Phyrexian Altar").note = "The mana is always black.";
  D({
    name: "Blood Tribute", cost: "{4}{B}{B}", type: "Sorcery",
    text: "Kicker—Tap an untapped Vampire you control. (You may tap a Vampire you control in addition to any other costs as you cast this spell.)\nTarget opponent loses half their life, rounded up. If this spell was kicked, you gain life equal to the life lost this way.",
    note: "It's kicked whenever you control an untapped Vampire (Etrata is one): the Vampire is tapped as it resolves.",
    spell: {
      targets: [{ kind: "opponent", purpose: "harm", prompt: "Target opponent loses half their life" }],
      do: (g, ctx) => {
        const q = ctx.targets[0], p = ctx.p;
        if (!q || !ctx.legal[0] || q.lost) return;
        const vamp = g.creatures(p).find(c => !c.tapped && g.hasSub(c, "Vampire"));
        const n = Math.ceil(q.life / 2);
        g.loseLife(q, n, ctx.o);
        if (vamp) { g.tap(vamp); g.gainLife(p, n, ctx.o); }
      }
    },
    ai: { priority: 6, cast: (g, p, o, ctx) => (H.halfSpellCast ? H.halfSpellCast(g, p, o, ctx) : undefined), target: (g, p, req) => (H.halfSpellTarget ? H.halfSpellTarget(g, p, req) : undefined) }
  });
  D({
    name: "Rush of Dread", cost: "{3}{B}{B}", type: "Sorcery", kicker: "{1}",
    text: "Spree (Choose one or more additional costs.)\n+ {1} — Target opponent sacrifices half the creatures they control of their choice, rounded up.\n+ {2} — Target opponent discards half the cards in their hand, rounded up.\n+ {2} — Target opponent loses half their life, rounded up.",
    note: "Only two of the spree modes are offered: the life mode is always chosen ({1}{B}{B} plus {2}), and the kicker is the sacrifice mode (+{1}). The discard mode isn't offered.",
    spell: {
      targets: [{ kind: "opponent", purpose: "harm", prompt: "Target opponent loses half their life" }],
      do: async (g, ctx) => {
        const q = ctx.targets[0], p = ctx.p;
        if (!q || !ctx.legal[0] || q.lost) return;
        if (ctx.kicked) {
          const cre = g.creatures(q), n = Math.ceil(cre.length / 2);
          if (n) { const pick = await g.ask(q, { type: "cards", prompt: `Rush of Dread: sacrifice ${n} creature${n > 1 ? "s" : ""}`, options: cre, min: n, max: n, purpose: "sacrifice", src: ctx.o }); for (const c of (pick || []).slice(0, n)) if (c.zone === "battlefield") g.sacrifice(c); }
        }
        g.loseLife(q, Math.ceil(q.life / 2), ctx.o);
        void p;
      }
    },
    ai: { priority: 6, cast: (g, p, o, ctx) => (H.halfSpellCast ? H.halfSpellCast(g, p, o, ctx) : undefined), target: (g, p, req) => (H.halfSpellTarget ? H.halfSpellTarget(g, p, req) : undefined), confirm: () => true }
  });
  D({
    name: "Hatred", cost: "{3}{B}{B}", type: "Instant",
    text: "As an additional cost to cast this spell, pay X life.\nTarget creature gets +X/+0 until end of turn.",
    note: "X is chosen as it resolves (not as an additional cost).",
    spell: {
      targets: [{ kind: "creature", purpose: "help", prompt: "Hatred: +X/+0" }],
      do: async (g, ctx) => {
        const t = ctx.targets[0], p = ctx.p;
        if (!t || !ctx.legal[0] || t.zone !== "battlefield") return;
        const max = Math.max(0, p.life - 1);
        const want = H.hatredX ? H.hatredX(g, p, t) : max;
        const x = Math.max(0, Math.min(max, (await g.ask(p, { type: "number", prompt: "Hatred: pay how much life (X)?", min: 0, max, purpose: "hatredX", src: ctx.o, want })) | 0));
        if (x > 0 && g.payLife(p, x)) g.pump(t, x, 0);
      }
    },
    ai: { priority: 4, trick: (g, p, o) => (H.hatredTrick ? H.hatredTrick(g, p, o) : false), target: (g, p, req) => (H.hatredTarget ? H.hatredTarget(g, p, req) : undefined) }
  });
  D({
    name: "Archfiend of Despair", cost: "{6}{B}{B}", type: "Creature — Demon", pt: "6/6", keywords: ["flying"],
    text: "Flying\nYour opponents can't gain life.\nAt the beginning of each end step, each opponent loses life equal to the life that player lost this turn. (Damage causes loss of life.)",
    statics: [{ cantGainLife: (g, s, pl) => isOpp(g, s.controller, pl) }],
    triggers: [{ on: "endStep", do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) { const n = q.lifeLostThisTurn || 0; if (n > 0) g.loseLife(q, n, s); } } }],
    ai: { priority: 6, threat: 4 }
  });
  D({
    name: "Dark Confidant", cost: "{1}{B}", type: "Creature — Human Wizard", pt: "2/1",
    text: "At the beginning of your upkeep, reveal the top card of your library and put that card into your hand. You lose life equal to its mana value.",
    triggers: [{ on: "upkeep", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { const c = p.library[0]; if (!c) return; g.moveTo(c, "hand"); log(g, `${p.name} reveals ${c.def.name} (Dark Confidant).`, p, [c.def.name]); if (c.def.mv > 0) g.loseLife(p, c.def.mv, s); } }],
    ai: { priority: 7, draw: true }
  });
  D({
    name: "Cabal Ritual", cost: "{1}{B}", type: "Instant",
    text: "Add {B}{B}{B}.\nThreshold — Add {B}{B}{B}{B}{B} instead if there are seven or more cards in your graveyard.",
    note: "The mana stays until the end of the step or phase.",
    spell: { do: (g, ctx) => { const n = ctx.p.graveyard.length >= 7 ? 5 : 3; ctx.p.pool.B += n; g.bump(); log(g, `${ctx.p.name} adds ${"{B}".repeat(n)}.`, ctx.p, ["Cabal Ritual"]); } },
    ai: {
      cast: (g, p, o, { window }) => {
        if (window !== "main1") return false;
        const have = manaNow(g, p), gain = (p.graveyard.length >= 7 ? 5 : 3) - 2;
        const big = p.hand.some(c => c !== o && !c.def.types.includes("Land") && c.def.mv > have && c.def.mv <= have + gain && !g.castOptions(p, c).length && (c.def.colors.length === 0 || c.def.colors.includes("B")));
        return big ? 40 : false;
      }
    }
  });
  D({
    name: "Massacre Wurm", cost: "{3}{B}{B}{B}", type: "Creature — Phyrexian Wurm", pt: "6/5",
    text: "When this creature enters, creatures your opponents control get -2/-2 until end of turn.\nWhenever a creature an opponent controls dies, that player loses 2 life.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => { const list = g.battlefield.filter(o => g.isCreature(o) && isOpp(g, p, o.controller)); if (list.length) g.pump(list, -2, -2); } },
      { on: "dies", when: (g, s, ev) => !!ev.lki && isOpp(g, s.controller, ev.lki.controller), do: (g, s, ev) => { const q = ev.lki.controller; if (q && !q.lost) g.loseLife(q, 2, s); } }
    ],
    ai: { priority: 7, threat: 4 }
  });
  D({
    name: "Mithril Coat", cost: "{3}", type: "Legendary Artifact — Equipment", equip: "{3}", keywords: ["flash", "indestructible"],
    text: "Flash\nIndestructible\nWhen Mithril Coat enters, attach it to target legendary creature you control.\nEquipped creature has indestructible.\nEquip {3}",
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "equip", prompt: "Mithril Coat: attach to a legendary creature", filter: (g2, c) => c.def.legendary }), s); if (t && t.zone === "battlefield" && s.zone === "battlefield") { s.attachedTo = t; g.bump(); } } }],
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["indestructible"] }],
    ai: { priority: 6, protection: true, equipTarget: (g, p, opts) => (H.coatTarget ? H.coatTarget(g, p, opts) : undefined), target: (g, p, req) => (req.purpose === "equip" && H.coatTarget ? H.coatTarget(g, p, req.options) : undefined) }
  });
  /* ninjas */
  D({
    name: "Ninja of the Deep Hours", cost: "{3}{U}", type: "Creature — Human Ninja", pt: "2/2",
    text: "Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever this creature deals combat damage to a player, you may draw a card.",
    note: ninjaNote, channel: ninjutsu("Ninja of the Deep Hours", "{1}{U}"),
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: ninjaAi({ priority: 6 })
  });
  D({
    name: "Ingenious Infiltrator", cost: "{2}{U}{B}", type: "Creature — Vedalken Ninja", pt: "2/3",
    text: "Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever a Ninja you control deals combat damage to a player, draw a card.",
    note: ninjaNote, channel: ninjutsu("Ingenious Infiltrator", "{U}{B}"),
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && mine(s, ev.src) && g.hasSub(ev.src, "Ninja"), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: ninjaAi({ priority: 7 })
  });
  D({
    name: "Moon-Circuit Hacker", cost: "{1}{U}", type: "Enchantment Creature — Human Ninja", pt: "2/1",
    text: "Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card unless this creature entered this turn.",
    note: ninjaNote, channel: ninjutsu("Moon-Circuit Hacker", "{U}"),
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        g.draw(p, 1);
        if (s.enteredTurn === g.turn || !p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Moon-Circuit Hacker: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
        g.discard(p, (pick || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1]);
      }
    }],
    ai: ninjaAi({ priority: 6 })
  });
  /* free interaction */
  D({
    name: "Flare of Denial", cost: "{1}{U}{U}", type: "Instant",
    text: "You may sacrifice a nontoken blue creature rather than pay this spell's mana cost.\nCounter target spell.",
    altCosts: [{ label: "Sacrifice a nontoken blue creature", cost: "", sacPermanent: { filter: (g, c) => !c.isToken && g.isCreature(c) && g.colorsOf(c).has("U"), prompt: "Flare of Denial: sacrifice a nontoken blue creature" } }],
    spell: { targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell", filter: (g, item, p) => item.p !== p }], do: (g, ctx) => { const it = ctx.targets[0]; if (ctx.legal[0] && it && g.stack.includes(it)) g.counterSpell(it, ctx.o); } },
    ai: { counter: true, target: (g, p, req) => (req.purpose === "altSac" && H.flareSac ? H.flareSac(g, p, req) : undefined) }
  });
  D({
    name: "Snapback", cost: "{1}{U}", type: "Instant",
    text: "You may exile a blue card from your hand rather than pay this spell's mana cost.\nReturn target creature to its owner's hand.",
    altCosts: [{ label: "Exile a blue card from your hand", cost: "", exileFromHand: { filter: (g, c) => c.def.colors.includes("U"), prompt: "Snapback: exile a blue card from your hand" } }],
    spell: { targets: [{ kind: "creature", purpose: "fadingHope", prompt: "Return to its owner's hand" }], do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.bounce(t); } },
    ai: { priority: 4, protection: true, target: (g, p, req) => (req.purpose === "fadingHope" && H.fadingTarget ? H.fadingTarget(g, p, req) : undefined) }
  });
  D({
    name: "Force of Despair", cost: "{1}{B}{B}", type: "Instant",
    text: "If it's not your turn, you may exile a black card from your hand rather than pay this spell's mana cost.\nDestroy all creatures that entered the battlefield this turn.",
    altCosts: [{ label: "Exile a black card from your hand", cost: "", condition: (g, p) => g.active !== p, exileFromHand: { filter: (g, c) => c.def.colors.includes("B"), prompt: "Force of Despair: exile a black card from your hand" } }],
    spell: { do: (g, ctx) => { const hit = g.battlefield.filter(o => g.isCreature(o) && o.enteredTurn === g.turn); g.destroyAll(hit, ctx.o); } },
    ai: { priority: 4, cast: () => false, plan: (g, p, o, ctx) => (H.despairPlan ? H.despairPlan(g, p, o, ctx) : null) }
  });
  D({
    name: "Baleful Mastery", cost: "{3}{B}", type: "Instant",
    text: "You may pay {1}{B} rather than pay this spell's mana cost.\nIf the {1}{B} cost was paid, an opponent draws a card.\nExile target creature or planeswalker.",
    note: "The opponent who draws is the target's controller (or the first opponent).",
    altCosts: [{ label: "Pay {1}{B}: an opponent draws", cost: "{1}{B}" }],
    spell: {
      targets: [{ kind: "creatureOrPlaneswalker", purpose: "harm", prompt: "Exile target creature or planeswalker" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (!t || !ctx.legal[0] || t.zone !== "battlefield") return; const q = t.controller !== ctx.p ? t.controller : g.opponents(ctx.p)[0]; g.exile(t, ctx.o); if (ctx.item && ctx.item.alt === 1 && q && !q.lost) g.draw(q, 1); }
    },
    ai: { removal: true, minThreat: 5 }
  });


  /* ---------------- Dimir Bracket 4 staples the Yuriko and Etrata lists share */
  D({
    name: "Mana Drain", cost: "{U}{U}", type: "Instant",
    text: "Counter target spell. At the beginning of your next main phase, add an amount of {C} equal to that spell's mana value.",
    note: "The mana arrives at the start of your next precombat main phase and stays until the end of that phase.",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell", filter: (g, item, p) => item.p !== p }],
      do: (g, ctx) => {
        const it = ctx.targets[0], p = ctx.p;
        if (!ctx.legal[0] || !it || !g.stack.includes(it)) return;
        const mv = it.o ? g.mvOf(it.o) : 0;
        if (!g.counterSpell(it, ctx.o) || mv <= 0) return;
        g.delayed.push({ at: "precombatMain", once: true, player: p, controller: p, src: ctx.o, do: g2 => { p.pool.C += mv; g2.bump(); log(g2, `${p.name} adds ${"{C}".repeat(mv)} (Mana Drain).`, p, ["Mana Drain"]); } });
      }
    },
    ai: { counter: true }
  });
  D({
    name: "Dismember", cost: "{1}{B/P}{B/P}", type: "Instant",
    text: "({B/P} can be paid with either {B} or 2 life.)\nTarget creature gets -5/-5 until end of turn.",
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "-5/-5 until end of turn" }], do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.pump(t, -5, -5); } },
    ai: { removal: true, minThreat: 5 }
  });
  D({
    name: "Flare of Malice", cost: "{2}{B}{B}", type: "Instant",
    text: "You may sacrifice a nontoken black creature rather than pay this spell's mana cost.\nEach opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers they control.",
    altCosts: [{ label: "Sacrifice a nontoken black creature", cost: "", sacPermanent: { filter: (g, c) => !c.isToken && g.isCreature(c) && g.colorsOf(c).has("B"), prompt: "Flare of Malice: sacrifice a nontoken black creature" } }],
    spell: {
      do: async (g, ctx) => {
        for (const q of g.opponents(ctx.p)) {
          const cands = g.battlefield.filter(o => o.controller === q && (g.isCreature(o) || g.isPlaneswalker(o)));
          if (!cands.length) continue;
          const top = Math.max(...cands.map(o => g.mvOf(o))), pool = cands.filter(o => g.mvOf(o) === top);
          const pick = pool.length > 1 ? await g.ask(q, { type: "target", prompt: "Flare of Malice: sacrifice a creature or planeswalker with the greatest mana value", options: pool, purpose: "sacrifice", src: ctx.o }) : pool[0];
          const c = pool.includes(pick) ? pick : pool[0];
          if (c.zone === "battlefield") g.sacrifice(c);
        }
      }
    },
    ai: { priority: 5, removal: true, minThreat: 6, instantEnd: true, target: (g, p, req) => (req.purpose === "altSac" && H.flareSac ? H.flareSac(g, p, req) : undefined) }
  });
  D({
    name: "Submerge", cost: "{4}{U}", type: "Instant",
    text: "If an opponent controls a Forest and you control an Island, you may cast this spell without paying its mana cost.\nPut target creature on top of its owner's library.",
    altCosts: [{ label: "Free (an opponent controls a Forest, you an Island)", cost: "", condition: (g, p) => g.battlefield.some(o => o.controller === p && g.isLand(o) && o.def.subtypes.includes("Island")) && g.opponents(p).some(q => g.battlefield.some(o => o.controller === q && g.isLand(o) && o.def.subtypes.includes("Forest"))) }],
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Put on top of its owner's library" }], do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.tuck(t, false); } },
    ai: { removal: true, minThreat: 5 }
  });
  D({
    name: "Mental Misstep", cost: "{U/P}", type: "Instant",
    text: "({U/P} can be paid with either {U} or 2 life.)\nCounter target spell with mana value 1.",
    spell: { targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell with mana value 1", filter: (g, item, p) => item.p !== p && !!item.o && g.mvOf(item.o) === 1 }], do: (g, ctx) => { const it = ctx.targets[0]; if (ctx.legal[0] && it && g.stack.includes(it)) g.counterSpell(it, ctx.o); } },
    ai: { counter: true }
  });
  D({
    name: "Thousand-Faced Shadow", cost: "{U}", type: "Creature — Human Ninja", pt: "1/1", keywords: ["flying"],
    text: "Ninjutsu {2}{U}{U} ({2}{U}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nFlying\nWhen this creature enters from your hand, if it's attacking, create a token that's a copy of another target attacking creature. The token enters tapped and attacking.",
    note: ninjaNote, channel: ninjutsu("Thousand-Faced Shadow", "{2}{U}{U}"),
    triggers: [{
      on: "enters", self: true, when: (g, s, ev) => !!s.combat && !!s.combat.attacking,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, other: true, purpose: "copy", prompt: "Thousand-Faced Shadow: copy another attacking creature", filter: (g2, c) => c !== s && !!c.combat && !!c.combat.attacking }), s);
        if (t && t.zone === "battlefield" && t.combat) g.copyToken(p, t, { tapped: true, attacking: t.combat.attacking });
      }
    }],
    ai: ninjaAi({ priority: 6, target: (g, p, req) => (req.purpose === "copy" ? req.options.slice().sort((a, b) => valueOf(g, b) - valueOf(g, a))[0] : req.purpose === "ninjutsu" ? ninjaBait(g, p, req.options) || undefined : undefined) })
  });
  D({
    name: "Prosperous Thief", cost: "{2}{U}", type: "Creature — Human Ninja", pt: "3/2",
    text: "Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever one or more Ninja or Rogue creatures you control deal combat damage to a player, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    note: ninjaNote, channel: ninjutsu("Prosperous Thief", "{1}{U}"),
    triggers: [{ on: "combatDamageStep", when: (g, s, ev) => ev.hits.some(h => h.controller === s.controller && h.src.zone === "battlefield" && (g.hasSub(h.src, "Ninja") || g.hasSub(h.src, "Rogue"))), do: (g, s, ev, { p }) => { g.createToken(p, T.treasure); } }],
    ai: ninjaAi({ priority: 6 })
  });
  D({
    name: "Mistblade Shinobi", cost: "{2}{U}", type: "Creature — Human Ninja", pt: "1/1",
    text: "Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever this creature deals combat damage to a player, you may return target creature that player controls to its owner's hand.",
    note: ninjaNote, channel: ninjutsu("Mistblade Shinobi", "{U}"),
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: async (g, s, ev, { p }) => { const q = ev.p; const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", optional: true, prompt: "Mistblade Shinobi: return a creature that player controls", filter: (g2, c) => c.controller === q }), s); if (t && t.zone === "battlefield") g.bounce(t); } }],
    ai: ninjaAi({ priority: 6 })
  });
  D({
    name: "Silver-Fur Master", cost: "{U}{B}", type: "Creature — Rat Ninja", pt: "2/2",
    text: "Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nNinjutsu abilities you activate cost {1} less to activate.\nOther Ninja and Rogue creatures you control get +1/+1.",
    note: ninjaNote + " The {1} discount on other ninjutsu costs isn't applied.",
    channel: ninjutsu("Silver-Fur Master", "{U}{B}"),
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && (g.hasSub(o, "Ninja") || g.hasSub(o, "Rogue")), pt: [1, 1] }],
    ai: ninjaAi({ priority: 7 })
  });
  D({
    name: "Faerie Seer", cost: "{U}", type: "Creature — Faerie Wizard", pt: "1/1", keywords: ["flying"],
    text: "Flying\nWhen this creature enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.scry(p, 2, s) }],
    ai: { priority: 6 }
  });
  D({ name: "Ornithopter", cost: "{0}", type: "Artifact Creature — Thopter", pt: "0/2", keywords: ["flying"], text: "Flying", ai: { priority: 5 } });
  D({
    name: "Spectral Sailor", cost: "{U}", type: "Creature — Spirit Pirate", pt: "1/1", keywords: ["flash", "flying"],
    text: "Flash (You may cast this spell any time you could cast an instant.)\nFlying\n{3}{U}: Draw a card.",
    abilities: [{ label: "Draw a card", cost: "{3}{U}", do: (g, src, ctx) => g.draw(ctx.p, 1), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && manaNow(g, p) >= 4 && p.hand.length < 6 } }],
    ai: { priority: 6 }
  });
  D({
    name: "Siren Stormtamer", cost: "{U}", type: "Creature — Siren Pirate Wizard", pt: "1/1", keywords: ["flying"],
    text: "Flying\n{U}, Sacrifice this creature: Counter target spell or ability that targets you or a creature you control.",
    abilities: [{
      label: "Counter a spell or ability targeting you or your creature", cost: "{U}", sacSelf: true,
      targets: [{ kind: "spell", orAbility: true, purpose: "counter", prompt: "Counter target spell or ability that targets you or a creature you control", filter: (g, item, p) => item.p !== p && (item.targets || []).some(t => t === p || (t && !g.isPlayer(t) && t.controller === p && g.isCreature(t))) }],
      do: (g, src, ctx) => { const it = ctx.targets[0]; if (ctx.legal[0] && it && g.stack.includes(it)) g.counterSpell(it, src); },
      ai: { inStack: true, use: (g, p, o, ctx) => (ctx.window === "stack" || ctx.window === "ability") && !!H.stormtamerUse && H.stormtamerUse(g, p, o, ctx) }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "counter" ? req.options.find(it => it.p !== p) : undefined) }
  });
  const FELL_MIRE = MK.define({ name: "Fell Mire", type: "Land", cost: "", text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {B}.", note: "You pay the 3 life when you have more than 12.", etbTapped: (g, o) => { if (!o || o.id === -1) return false; const p = o.controller; if (p && p.life > 12 && g.payLife(p, 3)) { log(g, `${p.name} pays 3 life so Fell Mire enters untapped.`, p, ["Fell Mire"]); return false; } return true; }, mana: [{ tap: true, produce: "B" }] });
  D({
    name: "Fell the Profane // Fell Mire", cost: "{2}{B}{B}", type: "Instant",
    text: "Fell the Profane: Destroy target creature or planeswalker.\n//\nFell Mire (land): As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {B}.",
    note: "A modal double-faced card: play it as the land Fell Mire from your hand instead of casting it.",
    mdfcLand: FELL_MIRE,
    spell: { targets: [{ kind: "creatureOrPlaneswalker", purpose: "harm", prompt: "Destroy target creature or planeswalker" }], do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.destroy(t, ctx.o); } },
    ai: { removal: true, minThreat: 5 }
  });
  const SOPORIFIC = MK.define({ name: "Soporific Springs", type: "Land", cost: "", text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {U}.", note: "You pay the 3 life when you have more than 12.", etbTapped: (g, o) => { if (!o || o.id === -1) return false; const p = o.controller; if (p && p.life > 12 && g.payLife(p, 3)) { log(g, `${p.name} pays 3 life so Soporific Springs enters untapped.`, p, ["Soporific Springs"]); return false; } return true; }, mana: [{ tap: true, produce: "U" }] });
  D({
    name: "Sink into Stupor // Soporific Springs", cost: "{1}{U}{U}", type: "Instant",
    text: "Sink into Stupor: Return target spell or nonland permanent an opponent controls to its owner's hand.\n//\nSoporific Springs (land): As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {U}.",
    note: "A modal double-faced card: play it as the land Soporific Springs from your hand instead of casting it. As a spell it only targets permanents here (not spells on the stack).",
    mdfcLand: SOPORIFIC,
    spell: { targets: [{ kind: "nonland", opp: true, purpose: "harm", prompt: "Return target nonland permanent an opponent controls to its owner's hand" }], do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.bounce(t); } },
    ai: { removal: true, minThreat: 6 }
  });
  D({
    name: "Cunning Evasion", cost: "{1}{U}", type: "Enchantment",
    text: "Whenever a creature you control becomes blocked, you may return it to its owner's hand.",
    triggers: [{ on: "blocked", when: (g, s, ev) => !!ev.o && ev.o.controller === s.controller, optional: "Cunning Evasion: return the blocked creature to its owner's hand?", do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.bounce(ev.o); } }],
    ai: { priority: 5, confirm: (g, p, req) => { const a = req.ev && req.ev.o; return !!a && !a.isToken && a.owner === p && !a.faceDown && (a.combat && a.combat.blockedBy || []).some(b => AI().fight(g, a, b).aDies); } }
  });


  /* ---------------- the closers' hooks: when the brain casts and aims Coat of Arms, Kindred Dominance, Hatred, the
     half-life spells, the altars (with Vein Ripper), Force of Despair, Siren Stormtamer and the flares */
  const sharedCount = (g, who) => { const cre = g.creatures(); const types = new Map(cre.map(c => [c.id, typesLite(g, c)])); let n = 0; for (const c of cre) { if (c.controller !== who) continue; for (const d of cre) if (d !== c && shareTypeLite(types.get(c.id), types.get(d.id))) n++; } return n; };
  /* Coat of Arms: ours when our shared-type count clearly beats every opponent's (a typal opponent gets it too) */
  H.coatCast = (g, p, o, ctx) => {
    if (!mainWin(ctx.window)) return false;
    const ours = sharedCount(g, p), theirs = Math.max(0, ...liveOpps(g, p).map(q => sharedCount(g, q)));
    return ours >= 6 && ours >= theirs * 1.5 + 2 ? 24 : false;
  };
  /* Kindred Dominance: before combat when it destroys far more of theirs than of ours (our Assassins survive) and
     the attack then connects; otherwise the generic wipe rule (ai.wipe) in the second main phase */
  H.dominanceCast = (g, p, o, ctx) => {
    if (ctx.window !== "main1") return undefined;
    const dead = g.creatures().filter(c => !isAssassin(g, c));
    const theirs = dead.filter(c => c.controller !== p).reduce((t, c) => t + valueOf(g, c), 0), ours = dead.filter(c => c.controller === p).reduce((t, c) => t + valueOf(g, c), 0);
    return theirs >= 12 && ours * 3 <= theirs ? 36 : false;
  };
  /* Hatred after blockers: the life X that makes an unblocked attacker's hit lethal on its defender (Bloodletter and
     the halvers counted), paid when we keep at least 6 life, or 1 with Ramses out and an Assassin in the attack */
  H.hatredTrick = (g, p, o) => {
    const c = g.combat;
    if (!c || c.attacker !== p || !brainOn(p)) return false;
    const ramses = onBf(g, p, "Ramses, Assassin Lord");
    for (const a of c.attackers.filter(a => a.controller === p && a.combat && !a.combat.wasBlocked && g.isPlayer(a.combat.attacking) && g.power(a) >= 0)) {
      const q = a.combat.attacking;
      if (q.lost) continue;
      const through = c.attackers.filter(x => x.controller === p && x.combat && !x.combat.wasBlocked && x.combat.attacking === q);
      const keep = ramses && through.some(x => isAssassin(g, x)) ? 1 : 8;
      let lo = 1, hi = p.life - keep;
      if (hi < lo || lifeAfter(g, p, q, through, x => (x === a ? hi : 0)) > 0) continue;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (lifeAfter(g, p, q, through, x => (x === a ? mid : 0)) <= 0) hi = mid; else lo = mid + 1; }
      mem(p).hatred = { o: a, x: lo, turn: g.turn };
      return true;
    }
    return false;
  };
  H.hatredX = (g, p) => { const h = mem(p).hatred; return h && h.turn === g.turn ? h.x : 0; };
  H.hatredTarget = (g, p, req) => { const h = mem(p).hatred; return h && h.turn === g.turn && req.options.includes(h.o) ? h.o : undefined; };
  /* Blood Tribute and Rush of Dread: at the mark, when the halving (doubled by Bloodletter: all of it) plus this
     turn's attack kills, or when it just takes 20 from the player we're killing anyway */
  H.halfSpellCast = (g, p, o, ctx) => {
    if (ctx.window !== "main1" || !brainOn(p)) return false;
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    const bl = onBf(g, p, "Bloodletter of Aclazotz");
    for (const q of liveOpps(g, p)) {
      if (bl) { mem(p).halfAt = q; return 60; }
      const after = q.life - Math.ceil(q.life / 2);
      const r = able.length ? outcome(g, p, q, able) : { dmg: 0 };
      if (after - r.dmg <= 0 || (q === pickMark(g, p, able) && q.life >= 20)) { mem(p).halfAt = q; return 30; }
    }
    return false;
  };
  H.halfSpellTarget = (g, p, req) => { const q = mem(p).halfAt; return q && req.options.includes(q) ? q : req.options.slice().sort((a, b) => b.life - a.life)[0]; };
  /* Vein Ripper and an altar: sacrifice bodies to drain 2 each, when that kills an opponent (the mark first) */
  const fodder = (g, p) => g.creatures(p).filter(c => !c.isCommander && !["Ramses, Assassin Lord", "Vein Ripper", "Bloodletter of Aclazotz"].includes(c.def.name)).sort((a, b) => sacScore(g, p, a) - sacScore(g, p, b));
  H.altarUse = (g, p, o, ctx) => {
    if (!mainWin(ctx.window) || !onBf(g, p, "Vein Ripper")) return false;
    const n = fodder(g, p).length, opps = liveOpps(g, p).filter(q => q.life <= 2 * n);
    if (!opps.length) return false;
    const q = opps.includes(mem(p).mark) ? mem(p).mark : opps.sort((a, b) => a.life - b.life)[0];
    mem(p).drainAt = q;
    return { repeat: Math.ceil(q.life / 2) };
  };
  /* Whispersilk Cloak: shroud for the piece removal goes after, unblockable for the attacker that matters; Ramses first */
  H.cloakTarget = (g, p, opts) => { for (const n of ["Ramses, Assassin Lord", "Etrata, Deadly Fugitive", "Bloodletter of Aclazotz"]) { const c = opts.find(x => x.controller === p && x.def.name === n && !g.kw(x, "shroud") && !g.kw(x, "hexproof")); if (c) return c; } return opts.filter(c => c.controller === p).sort((a, b) => valueOf(g, b) - valueOf(g, a))[0]; };
  H.coatTarget = (g, p, opts) => { for (const n of ["Ramses, Assassin Lord", "Etrata, Deadly Fugitive", "Bloodletter of Aclazotz"]) { const c = opts.find(x => x.controller === p && x.def.name === n); if (c) return c; } return opts.filter(c => c.controller === p && c.def.legendary).sort((a, b) => valueOf(g, b) - valueOf(g, a))[0]; };
  /* Force of Despair at the end of an opponent's turn (or on the stack) when what entered this turn is worth it */
  H.despairPlan = (g, p, o, ctx) => {
    if (o.zone !== "hand" || g.active === p || !brainOn(p)) return null;
    if (!(ctx.window === "end" || ctx.window === "stack" || ctx.window === "ability")) return null;
    const fresh = g.creatures().filter(c => c.enteredTurn === g.turn);
    const theirs = fresh.filter(c => c.controller !== p).reduce((t, c) => t + valueOf(g, c), 0), ours = fresh.filter(c => c.controller === p).reduce((t, c) => t + valueOf(g, c), 0);
    if (theirs < 9 || ours * 2 > theirs) return null;
    const acts = (ctx.actions || []).filter(a => a.type === "cast" && a.card === o).sort((a, b) => (b.alt || 0) - (a.alt || 0));
    return acts.length ? { type: "cast", card: o, alt: acts[0].alt, maxTries: 1 } : null;
  };
  H.stormtamerUse = (g, p, o, ctx) => {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return false;
    return (top.targets || []).some(t => t && (t === p || (!g.isPlayer(t) && t.controller === p && g.isCreature(t) && (t.isCommander || valueOf(g, t) >= 6))));
  };
  H.flareSac = (g, p, req) => req.options.filter(c => c.controller === p && c.owner === p && !c.isCommander && c.def.name !== "Ramses, Assassin Lord").sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];


  /* ---------------- recursion: Ramses comes back */
  const REANIMATE_WANT = ["Ramses, Assassin Lord", "Bloodletter of Aclazotz", "Shredder, Shadow Master", "Vein Ripper", "Massacre Wurm", "Roaming Throne", "Achilles Davenport", "Interceptor, Shadow's Hound", "Roshan, Hidden Magister", "Unstoppable Slasher", "Virtus the Veiled"];
  const reanimateScore = (g, p, c) => { const i = REANIMATE_WANT.indexOf(c.def.name); return (i >= 0 ? 100 - i * 5 : 0) + c.def.mv * 2 + ((c.def.ai && c.def.ai.threat) || 0) * 3 - (c.owner !== p ? 1 : 0); };
  D({
    name: "Reanimate", cost: "{B}", type: "Sorcery",
    text: "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
    spell: {
      targets: [{ kind: "card", purpose: "reanimate", prompt: "Reanimate: a creature card from a graveyard", from: (g, p) => g.players.flatMap(q => q.graveyard.filter(c => c.def.types.includes("Creature"))) }],
      do: (g, ctx) => { const c = ctx.targets[0], p = ctx.p; if (!c || !ctx.legal[0] || c.zone !== "graveyard") return; g.putOntoBattlefield([c], p); g.loseLife(p, c.def.mv, ctx.o); }
    },
    ai: {
      priority: 7,
      cast: (g, p, o, ctx) => { if (!mainWin(ctx.window)) return false; const best = g.players.flatMap(q => q.graveyard.filter(c => c.def.types.includes("Creature"))).sort((a, b) => reanimateScore(g, p, b) - reanimateScore(g, p, a))[0]; return best && reanimateScore(g, p, best) >= 60 && p.life > best.def.mv + 10 ? 30 : false; },
      target: (g, p, req) => (req.purpose === "reanimate" ? req.options.slice().sort((a, b) => reanimateScore(g, p, b) - reanimateScore(g, p, a))[0] : undefined)
    }
  });
  D({
    name: "Patriarch's Bidding", cost: "{3}{B}{B}", type: "Sorcery",
    text: "Each player chooses a creature type. Each player returns all creature cards of a type chosen this way from their graveyard to the battlefield.",
    note: "You choose Assassin; each opponent chooses the type that returns the most of their own creature cards.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p, types = new Set(["Assassin"]);
        for (const q of g.opponents(p)) {
          const count = {};
          for (const c of q.graveyard) if (c.def.types.includes("Creature")) for (const t of (c.def.changeling ? ["Assassin"] : c.def.subtypes)) count[t] = (count[t] || 0) + 1;
          const best = Object.entries(count).sort((a, b) => b[1] - a[1])[0];
          if (best) types.add(best[0]);
        }
        for (const q of g.players) {
          if (q.lost) continue;
          const back = q.graveyard.filter(c => c.def.types.includes("Creature") && (c.def.changeling || c.def.subtypes.some(t => types.has(t))));
          if (back.length) { g.putOntoBattlefield(back, q); log(g, `${q.name} returns ${back.map(c => c.def.name).join(", ")} (Patriarch's Bidding).`, q, back.map(c => c.def.name)); }
        }
      }
    },
    ai: { priority: 6, cast: (g, p, o, ctx) => { if (!mainWin(ctx.window)) return false; const mine = p.graveyard.filter(c => c.def.types.includes("Creature") && (c.def.changeling || c.def.subtypes.includes("Assassin"))); const v = mine.reduce((t, c) => t + c.def.mv + ((c.def.ai && c.def.ai.priority) || 5) * 0.3, 0); return mine.length >= 3 || mine.some(c => c.def.name === "Ramses, Assassin Lord") ? 20 + v : false; } }
  });


  /* ---------------- attack triggers: life loss that doesn't need to connect */
  const attackDrain = (each, gain) => ({ on: "attacks", when: (g, s, ev) => ev.o === s, do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, each, s); if (gain) g.gainLife(p, gain, s); } });
  D({ name: "Pulse Tracker", cost: "{B}", type: "Creature — Vampire Rogue", pt: "1/1", text: "Whenever this creature attacks, each opponent loses 1 life.", triggers: [attackDrain(1, 0)], ai: { priority: 6 } });
  D({ name: "Vicious Conquistador", cost: "{B}", type: "Creature — Vampire Soldier", pt: "1/2", text: "Whenever this creature attacks, each opponent loses 1 life.", triggers: [attackDrain(1, 0)], ai: { priority: 6 } });
  D({ name: "Sanguine Syphoner", cost: "{1}{B}", type: "Creature — Vampire Warlock", pt: "1/3", text: "Whenever this creature attacks, each opponent loses 1 life and you gain 1 life.", triggers: [attackDrain(1, 1)], ai: { priority: 6 } });
  D({
    name: "Postmortem Professor", cost: "{1}{B}", type: "Creature — Zombie Warlock", pt: "2/2", cantBlock: true,
    text: "This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.",
    note: "The graveyard ability isn't offered.",
    triggers: [attackDrain(1, 1)], ai: { priority: 6 }
  });
  D({
    name: "Agate-Blade Assassin", cost: "{1}{B}", type: "Creature — Lizard Assassin", pt: "1/3",
    text: "Whenever this creature attacks, defending player loses 1 life and you gain 1 life.",
    triggers: [{ on: "attacks", when: (g, s, ev) => ev.o === s, do: (g, s, ev, { p }) => { const q = g.defenderOf(ev.target); if (q && !q.lost) g.loseLife(q, 1, s); g.gainLife(p, 1, s); } }],
    ai: { priority: 6 }
  });
  T.warriorR = MK.tokenDef({ key: "warrior-r1", name: "Warrior", pt: [1, 1], colors: "R", subtypes: ["Warrior"] });
  D({
    name: "Within Range", cost: "{3}{B}", type: "Enchantment",
    text: "When this enchantment enters, create two 1/1 red Warrior creature tokens.\nWhenever you attack, each opponent loses life equal to the number of creatures attacking them.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => { g.createToken(p, T.warriorR, { count: 2 }); } },
      { on: "attack", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) { const n = (ev.attackers || []).filter(a => a.combat && g.defenderOf(a.combat.attacking) === q).length; if (n > 0) g.loseLife(q, n, s); } } }
    ],
    ai: { priority: 7 }
  });


  D({
    name: "Teferi's Veil", cost: "{1}{U}", type: "Enchantment",
    text: "Whenever a creature you control attacks, it phases out at end of combat. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
    note: "Written as one trigger at the end of combat: every creature of yours that attacked phases out.",
    triggers: [{
      on: "endCombat", when: (g, s, ev) => ev.p === s.controller && !ev.noAttack,
      do: (g, s, ev, { p }) => { const list = g.creatures(p).filter(c => c.combat && c.combat.attacking); if (list.length) g.phaseOut(list); }
    }],
    ai: { priority: 7 }
  });


  D({
    name: "Whispersilk Cloak", cost: "{3}", type: "Artifact — Equipment", equip: "{2}",
    text: "Equipped creature can't be blocked and has shroud. (It can't be the target of spells or abilities.)\nEquip {2}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, unblockable: true, kw: ["shroud"] }],
    ai: { priority: 6, equipTarget: (g, p, opts) => (H.cloakTarget ? H.cloakTarget(g, p, opts) : undefined) }
  });
  D({
    name: "Darksteel Plate", cost: "{3}", type: "Artifact — Equipment", equip: "{2}", keywords: ["indestructible"],
    text: "Indestructible\nEquipped creature has indestructible.\nEquip {2}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["indestructible"] }],
    ai: { priority: 6, equipTarget: (g, p, opts) => (H.coatTarget ? H.coatTarget(g, p, opts) : undefined) }
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
  const ON = new Set(String((typeof process !== "undefined" && process.env && process.env.HEIST_ON) || "").split(",").filter(Boolean));
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
  function lifeAfter(g, p, q, through, bonus) {
    let life = q.life;
    const bl = g.active === p && g.battlefield.some(o => o.controller === p && o.def.name === "Bloodletter of Aclazotz") ? 2 : 1;
    const wound = g.battlefield.filter(o => o.controller === p && o.def.name === "Grievous Wound" && o.state.enchanted === q).length;
    const fs = a => g.kw(a, "first strike") || g.kw(a, "double strike");
    for (const step of [through.filter(fs), through.filter(a => !fs(a) || g.kw(a, "double strike"))]) {
      const hitters = step.filter(a => g.power(a) > 0);
      if (!hitters.length || life <= 0) continue;
      life -= bl * hitters.reduce((t, a) => t + g.power(a) + (bonus ? bonus(a) : 0), 0);
      for (const a of hitters) for (let k = halvesOnHit(g, a) + wound; k > 0 && life > 0; k--) life -= bl * Math.ceil(life / 2);
    }
    return life;
  }
  function outcome(g, p, q, attackers, evade, bonus) {
    const blocked = EB().predictBlocks(g, q, attackers, evade);
    const through = attackers.filter(a => !blocked.has(a));
    // attack triggers happen whether or not the attacker is blocked
    const drain = attackers.reduce((t, a) => { const d = attackDrainOf(g, p, a); return t + d.each + d.one; }, 0);
    const life = lifeAfter(g, p, q, through, bonus) - drain;
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
  /* Life the table loses when this creature attacks, before any damage: Hooded Blightfang (deathtouch attackers), the
     Vampires that drain on attack, Agate-Blade Assassin, Within Range; doubled by Bloodletter. */
  function attackDrainOf(g, p, a) {
    let each = 0, one = 0;
    const d = a.faceDown ? null : a.def;
    if (d) {
      if (/^(Pulse Tracker|Vicious Conquistador|Sanguine Syphoner|Postmortem Professor)$/.test(d.name)) each += 1;
      if (d.name === "Agate-Blade Assassin") one += 1;
      if (d.name === "Infectious Horror") each += 2;
    }
    if (g.kw(a, "deathtouch")) each += g.battlefield.filter(o => o.controller === p && o.def.name === "Hooded Blightfang").length;
    one += g.battlefield.filter(o => o.controller === p && o.def.name === "Within Range").length;
    const bl = onBf(g, p, "Bloodletter of Aclazotz") ? 2 : 1;
    return { each: each * bl, one: one * bl, total: (each * liveOpps(g, p).length + one) * bl };
  }
  /* What a hit with this attacker brings besides its damage (Etrata's steal, card draw, halving). */
  function hitValue(g, p, a, q) {
    let v = hitOf(g, a) + attackDrainOf(g, p, a).total;
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
    const gate = onBf(g, p, "Dolmen Gate");
    const haunted = onBf(g, p, "Haunted One");
    for (const a of byGain) {
      const isEtrata = a.isCommander && a.def.name === "Etrata, Deadly Fugitive";
      // with Dolmen Gate no blocker hurts an attacker: everything goes at the mark
      if (gate && mark) { toMark.push(a); decl.push({ attacker: a, target: mark, a }); continue; }
      // with Haunted One, Etrata attacking pumps the team: she goes where no blocker kills her (or blocks at all)
      if (isEtrata && haunted && mark) {
        const safe = opps.filter(q => !g.creatures(q).some(b => !b.tapped && g.canBlock(b, a) && AI().fight && AI().fight(g, a, b).aDies));
        const t = safe.includes(mark) ? mark : safe[0];
        if (t) { decl.push({ attacker: a, target: t, a }); if (t === mark) toMark.push(a); continue; }
      }
      if (a.def.ai && a.def.ai.attack && a.def.ai.attack(g, p, a, g.creatures(mark).filter(b => !b.tapped && g.canBlock(b, a))) === false && !isEtrata) continue;
      const trial = toMark.concat([a]);
      if (mark && !E.predictBlocks(g, mark, trial).has(a)) { toMark.push(a); decl.push({ attacker: a, target: mark, a }); continue; }
      const open = opps.filter(q => q !== mark && !E.predictBlocks(g, q, decl.filter(d => d.target === q).map(d => d.attacker).concat([a])).has(a));
      if (open.length) {
        const t = open.sort((x, y) => x.life - y.life)[0];
        decl.push({ attacker: a, target: t, a });
        continue;
      }
      // blocked anywhere: a junk body (a cloaked land, a token) that would only trade still goes at the mark, and so
      // does a creature whose attack trigger drains more than the body is worth (Blightfang's deathtouch attackers:
      // whatever blocks them dies too)
      const dr = attackDrainOf(g, p, a).total;
      if ((pushJunk(g, p, a) || (dr >= 2 && (g.kw(a, "deathtouch") || dr >= valueOf(g, a) * 0.6))) && mark) decl.push({ attacker: a, target: mark, a });
    }
    // 3. Etrata herself: only where no untapped blocker can kill her (her own hint), and never as a chump
    // 4. keep blockers home when the table can hit us hard
    const powerOf = q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((s, c) => s + hitOf(g, c), 0);
    const threatIn = Math.max(0, ...opps.map(powerOf));
    // HEIST_ON=defend2: the whole table's crack-back counts, not only the biggest opponent's
    const total = opps.reduce((t, q) => t + powerOf(q), 0);
    const danger = ON.has("defend2") ? p.life <= total * 0.6 + 4 : p.life <= threatIn * 1.1 + 3;
    if (danger) {
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
  const TUTOR_WANT0 = ["Ramses, Assassin Lord", "Hooded Blightfang", "Bloodletter of Aclazotz", "Mari, the Killing Quill", "Dolmen Gate", "Quietus Spike", "Unstoppable Slasher", "Virtus the Veiled", "Roaming Throne", "Interceptor, Shadow's Hound",
    "Shredder, Shadow Master", "Genji Glove", "Achilles Davenport", "Roshan, Hidden Magister", "Leyline of Transformation", "Arcane Adaptation", "Maskwood Nexus", "Kindred Discovery", "Ezio, Blade of Vengeance", "Black Widow, Deadly Hunter", "Rhystic Study"];
  // research switch: HEIST_TUTOR="Card A|Card B|..." replaces the tutor order
  const TUTOR_WANT = (typeof process !== "undefined" && process.env && process.env.HEIST_TUTOR) ? process.env.HEIST_TUTOR.split("|") : TUTOR_WANT0;
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
    if (H.kitTutor) for (const n of kitWant(g, p)) { const c = cands.find(x => x.def.name === n); if (c) return c; }
    // HEIST_ON=protectTutor: Ramses is out and bare (no hexproof or shroud): protection before anything else.
    // When he lands early and stays, the deck wins about 80% of the time; he's removed in most of the losses.
    if (ON.has("protectTutor")) {
      const ram = g.battlefield.find(o => o.controller === p && !o.faceDown && o.def.name === "Ramses, Assassin Lord");
      if (ram && !g.kw(ram, "hexproof") && !g.kw(ram, "shroud") && !g.battlefield.some(e => e.attachedTo === ram && /^(Swiftfoot Boots|Lightning Greaves|Whispersilk Cloak)$/.test(e.def.name))) {
        const onBoard = g.controlled(p, o => /^(Swiftfoot Boots|Lightning Greaves|Whispersilk Cloak)$/.test(o.def.name)).length;
        if (!onBoard) for (const n of ["Lightning Greaves", "Swiftfoot Boots", "Whispersilk Cloak", "Darksteel Plate"]) { const c = cands.find(x => x.def.name === n); if (c) return c; }
      }
    }
    // the vampire loop (hybrid lists only): half of it out, the other half first
    const VAMP = [["Exquisite Blood"], ["Sanguine Bond", "Bloodthirsty Conqueror", "Vito, Thorn of the Dusk Rose", "Marauding Blight-Priest"]];
    const side = i => VAMP[i].some(have);
    if (side(0) !== side(1)) { const need = VAMP[side(0) ? 1 : 0]; const c = cands.find(x => need.includes(x.def.name)); if (c) return c; }
    for (const n of TUTOR_WANT) {
      if (have(n)) continue;
      if (enabled && ["Maskwood Nexus", "Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"].includes(n)) continue;
      const c = cands.find(x => x.def.name === n);
      if (c) return c;
    }
    return null;
  }
  /* The Bracket 4 mulligan (Sperling, Draftsim/learncedh on Yuriko): mulligan is the default; keep for a start that
     does something by turn 2-3: a 0-2 mana evasive creature plus the mana to cast Etrata by turn 3, or fast mana
     plus a real threat, or a broken turn 1-2 engine (Rhystic Study, Mystic Remora, Necropotence) with the lands for
     it. Interaction alone or draw without development isn't a keep. */
  const ROCKS2 = c => !c.def.types.includes("Land") && c.def.ai && c.def.ai.ramp && c.def.mv <= 2;
  const RITUAL = c => /^(Dark Ritual|Cabal Ritual|Lotus Petal|Chrome Mox|Mox Amber|Mana Vault)$/.test(c.def.name);
  const EVASIVE_CHEAP = (g, c) => c.def.types.includes("Creature") && c.def.mv <= 2 && (c.def.changeling || c.def.subtypes.includes("Assassin") || c.def.keywords.some(k => ["flying", "shadow", "fear", "menace", "skulk"].includes(k)) || /can't be blocked/.test(c.def.text || ""));
  const ENGINE_START = c => /^(Rhystic Study|Mystic Remora|Necropotence|Dark Confidant|Esper Sentinel)$/.test(c.def.name);
  function b4Mulligan(g, p, { hand, mulls }) {
    const lands = hand.filter(c => c.def.types.includes("Land")).length;
    const rocks = hand.filter(ROCKS2).length, rituals = hand.filter(RITUAL).length;
    const sources2 = lands + rocks;   // mana by turn 2-3 (a rock counts once it's cast)
    const cheap = hand.filter(c => EVASIVE_CHEAP(g, c)).length;
    const threat = hand.some(c => !c.def.types.includes("Land") && c.def.types.includes("Creature") && c.def.mv >= 3 && c.def.mv <= 4 && (c.def.ai && c.def.ai.priority >= 7));
    const tutor = hand.some(c => c.def.ai && c.def.ai.tutor && c.def.mv <= 2);
    if (mulls >= 3) return lands >= 1 && lands <= 5;
    if (lands < 1 || lands > 5) return false;
    if (lands >= 2 && lands <= 4 && hand.some(ENGINE_START)) return true;                          // a broken start
    if (lands >= 2 && lands <= 4 && cheap >= 1 && sources2 >= 3) return true;                     // a body, then Etrata by turn 3
    if (lands >= 1 && lands <= 3 && (rocks + rituals) >= 2 && (cheap >= 1 || threat || tutor)) return true;   // fast mana plus a threat
    if (mulls >= 1 && lands >= 2 && lands <= 4 && (cheap >= 1 || rocks >= 1 || tutor)) return true;   // the second look: a functional hand
    if (mulls >= 2 && lands >= 2 && lands <= 5) return true;
    return false;
  }
  function heistMulligan(g, p, { hand, mulls }) {
    if (!ON.has("mull1")) return b4Mulligan(g, p, { hand, mulls });   // the Bracket 4 mulligan is the default (+1.3 vs B4); HEIST_ON=mull1 restores the first one
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
  /* Reverse the Polarity: everything unblockable when that makes this attack a kill (with Ramses, a win). */
  function polarityPlan(g, p, acts) {
    const a = acts.find(x => x.type === "cast" && x.card.def.name === "Reverse the Polarity");
    if (!a) return null;
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    if (!able.length) return null;
    const opps = liveOpps(g, p);
    if (opps.some(q => outcome(g, p, q, able).kill)) return null;
    const all = new Set(able);
    return opps.some(q => outcome(g, p, q, able, all).kill) ? { type: "cast", card: a.card, mode: 1, maxTries: 1 } : null;
  }
  /* HEIST_ON=saveCounter: with one counter in hand, it waits for a wipe, for removal aimed at Ramses or Etrata, or for
     a spell that wins; creature spells (opponents' commanders) are let through. With two or more, the generic rule. */
  function counterPolicy(g, p, ctx) {
    if (OFF.has("saveCounter") || ctx.window !== "stack") return null;   // +1.0 vs precons on v2: the default
    const top = ctx.top || g.stack[g.stack.length - 1];
    if (!top || top.kind !== "spell" || top.p === p) return null;
    const held = p.hand.filter(c => c.def.ai && c.def.ai.counter).length;
    if (held >= 2) return null;
    const d = top.o.def, ai = d.ai || {};
    const mass = AI().massHarm ? AI().massHarm(g, p, top) : null;
    const key = (top.targets || []).some(t => t && !g.isPlayer(t) && t.controller === p && (t.isCommander || KEY.has(t.def.name)));
    const must = !!mass || key || ai.finisher || (AI().comboThreat && AI().comboThreat(g, top.p) >= 10);
    if (must) {
      const c = (ctx.actions || []).filter(a => a.type === "cast" && a.card.def.ai && a.card.def.ai.counter && g.legalTarget(p, (a.card.def.spell && a.card.def.spell.targets || [{ kind: "spell" }])[0], top, a.card)).sort((a, b) => (b.alt || 0) - (a.alt || 0) || a.card.def.mv - b.card.def.mv)[0];
      return c ? { type: "cast", card: c.card, alt: c.alt, targets: [top], maxTries: 1 } : null;
    }
    mem(p).noCounterItem = top.id;
    return { type: "pass" };
  }
  function heistPlan(g, p, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    if (!brainOn(p)) return null;
    if (win === "stack") { const r = counterPolicy(g, p, ctx); if (r) return r; }
    if (win === "combat" && g.active === p && g.phase === "damage") return combatFlips(g, p, acts);
    if ((win === "main1" || win === "beginCombat") && g.active === p) { const r = polarityPlan(g, p, acts); if (r) return r; }
    if (win === "main1" && g.active === p) { const a = precombat(g, p, acts) || (H.flipFirst ? flipPlan(g, p, acts, win) : null) || evasionPlan(g, p, acts) || transmutePlan(g, p, acts); if (a) return a; }
    if (win === "main2" && g.active === p && H.flipFirst) { const a = flipPlan(g, p, acts, win); if (a) return a; }
    if (win === "main2" || win === "end") { const f = flickerPlan(g, p, acts, win); if (f) return f; }
    return null;
  }
  /* Spark Double and Auton Soldier: a second Etrata when Assassins connect (every hit cloaks twice), else Ramses
     (a second "you win"), else the best creature. */
  H.copyTarget = (g, p, req) => {
    const opts = req.options.filter(c => !c.faceDown);
    const et = opts.find(c => c.controller === p && c.def.name === "Etrata, Deadly Fugitive");
    const connectors = g.creatures(p).filter(c => c !== et && isAssassin(g, c) && evasive(g, c)).length;
    const ram = opts.find(c => c.controller === p && c.def.name === "Ramses, Assassin Lord");
    if (ram && !ON.has("copyEtrata")) return ram;
    if (et && (connectors >= 1 || ON.has("copyEtrata"))) return et;
    if (ram) return ram;
    return opts.sort((a, b) => valueOf(g, b) - valueOf(g, a))[0] || null;
  };
  /* The ways to Ramses: Demonic Consultation names what the tutors want; Fleshwrither and Pyre of Heroes put a
     wanted creature of the right mana value onto the battlefield. */
  const inLib = (p, n) => p.library.some(c => c.def.name === n);
  const haveIt = (g, p, n) => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n) || p.hand.some(c => c.def.name === n);
  H.consultName = (g, p) => { const c = heistTutor(g, p, p.library.filter(x => !x.def.types.includes("Land"))); return c ? c.def.name : null; };
  H.transfigureWant = (g, p, mv) => { const c = heistTutor(g, p, p.library.filter(x => x.def.types.includes("Creature") && x.def.mv === mv)); return !!c; };
  H.pyrePick = (g, p) => {
    for (const n of TUTOR_WANT) {
      if (haveIt(g, p, n) || !inLib(p, n)) continue;
      const d = MK.defs.get(n);
      if (!d || !d.types.includes("Creature")) continue;
      const fodder = g.creatures(p).filter(c => !c.faceDown && c.owner === p && g.mvOf(c) === d.mv - 1 && !TUTOR_WANT.slice(0, 3).includes(c.def.name) && (c.def.changeling || d.changeling || g.ch(c).allTypes || [...g.ch(c).subtypes].some(t => d.subtypes.includes(t))));
      if (fodder.length) return fodder.sort((a, b) => (a.isCommander - b.isCommander) || (valueOf(g, a) - valueOf(g, b)))[0];
    }
    return null;
  };
  /* Ramses waits in hand (out of reach of sorcery-speed removal) until he makes this turn's attack a kill: his
     +1/+1 for the other Assassins counted. Late, or with nothing else to cast, he comes down anyway. */
  /* Don't overextend into wraths (HEIST_ON=holdBoard): with four creatures already out, further creatures that aren't
     engine pieces wait in hand; with six out, all of them do. A creature that makes this turn's attack a kill still
     comes down. */
  const KEY = new Set(["Etrata, Deadly Fugitive", "Ramses, Assassin Lord", "Bloodletter of Aclazotz", "Roaming Throne", "Achilles Davenport", "Interceptor, Shadow's Hound", "Roshan, Hidden Magister", "Tetsuko Umezawa, Fugitive", "Satoru, the Infiltrator", "Spark Double", "Auton Soldier", "Sakashima the Impostor"]);
  function holdBoard(g, p, o, ctx) {
    if (!ON.has("holdBoard") || !o.def.types.includes("Creature") || o.zone !== "hand" || KEY.has(o.def.name) || !mainWin(ctx.window) || g.active !== p) return undefined;
    const n = g.creatures(p).length;
    if (n < 4 || p.hand.length <= 2) return undefined;
    if (n < 6 && o.def.mv <= 1) return undefined;
    // it makes the attack lethal (haste) or we're at the kill already: play it
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    if (liveOpps(g, p).some(q => outcome(g, p, q, able).kill)) return undefined;
    return false;
  }
  /* Hatred (and Blood Tribute with Bloodletter): when the kill is live this turn, main-phase-one casts that would use
     the mana wait, so the spell can be cast after blockers (Hatred) or after the attack (Blood Tribute). */
  function killSpellLive(g, p) {
    if (!brainOn(p) || g.active !== p) return 0;
    const mana = manaNow(g, p);
    const hat = p.hand.find(c => c.def.name === "Hatred");
    if (hat && mana >= 5) {
      const ramses = onBf(g, p, "Ramses, Assassin Lord");
      const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0 && (evasive(g, c) || g.ch(c).unblockable));
      for (const q of liveOpps(g, p)) for (const a of able) {
        const open = !g.creatures(q).some(b => !b.tapped && g.canBlock(b, a));
        if (!open) continue;
        const keep = ramses && isAssassin(g, a) ? 1 : 8, x = p.life - keep;
        if (x >= 1 && lifeAfter(g, p, q, [a], c => (c === a ? x : 0)) <= 0) return 5;
      }
    }
    const bt = p.hand.find(c => c.def.name === "Blood Tribute" || c.def.name === "Rush of Dread");
    if (bt && onBf(g, p, "Bloodletter of Aclazotz") && mana >= bt.def.mv + 2) return bt.def.mv + 2;
    return 0;
  }
  /* HEIST_ON=etrataLate: Etrata leaves the command zone only when an Assassin can connect this turn (her trigger works
     the turn she's cast), or when Boots/Greaves are out, or from round 6. The pilots: "cast her only when an
     Assassin can connect that turn", she is kill-on-sight. */
  function etrataLate(g, p, o, ctx) {
    if (OFF.has("etrataLate") || !o.isCommander || o.zone !== "command" || o.def.name !== "Etrata, Deadly Fugitive") return undefined;
    if (g.round >= 6 || g.controlled(p, x => /^(Swiftfoot Boots|Lightning Greaves)$/.test(x.def.name)).length) return undefined;
    if (ctx.window !== "main1") return false;
    const E = EB();
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0 && isAssassin(g, c));
    if (!able.length || !E.predictBlocks) return false;
    return liveOpps(g, p).some(q => able.some(a => !E.predictBlocks(g, q, [a]).has(a))) ? undefined : false;
  }
  function castHold(g, p, o, ctx) {
    { const r = etrataLate(g, p, o, ctx); if (r !== undefined) return r; }
    if (ON.has("hatredHold")) {   // measured −0.8 / −0.5 on v1: opt-in
      const need = ctx.window === "main1" && g.active === p && o.zone === "hand" && !/^(Hatred|Blood Tribute|Rush of Dread)$/.test(o.def.name) ? killSpellLive(g, p) : 0;
      if (need && manaNow(g, p) - o.def.mv < need && !(o.def.types.includes("Land"))) return false;
    }
    const hb = holdBoard(g, p, o, ctx);
    if (hb !== undefined) return hb;
    if (!ON.has("holdRamses") || o.def.name !== "Ramses, Assassin Lord" || o.zone !== "hand") return undefined;
    if (ctx.window !== "main1" || g.active !== p) return false;
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    const lord = a => (isAssassin(g, a) ? 1 : 0);
    if (able.some(a => isAssassin(g, a)) && liveOpps(g, p).some(q => outcome(g, p, q, able, null, lord).kill)) return undefined;
    if (g.round >= 9 || p.hand.length <= 1) return undefined;
    return false;
  }
  /* HEIST_ON=etrataBoots: Boots and Greaves go on Etrata first (the pilots' turn-2 Greaves so she swings on turn 3);
     Ramses takes them once he's out. */
  function bootsTarget(g, p, req) {
    if (!ON.has("etrataBoots") || req.purpose !== "equip" || !req.src || !/^(Swiftfoot Boots|Lightning Greaves)$/.test(req.src.def.name)) return undefined;
    const bare = c => !(g.kw(c, "hexproof") || g.kw(c, "shroud")) || (req.src.attachedTo === c);
    const ram = req.options.find(c => c.controller === p && c.def.name === "Ramses, Assassin Lord" && bare(c) && req.src.attachedTo !== c);
    if (ram) return ram;
    const et = req.options.find(c => c.controller === p && c.isCommander && bare(c) && req.src.attachedTo !== c);
    return et || undefined;
  }
  function heistChoose(g, p, req) {
    { const b = bootsTarget(g, p, req); if (b) return b; }
    if (req.type === "number" && req.purpose === "hatredX") return Math.max(req.min, Math.min(req.max, H.hatredX(g, p)));
    if (req.type === "target" && req.purpose === "sacrifice" && req.src && /Altar$/.test(req.src.def.name)) { const f = fodder(g, p).find(c => req.options.includes(c)); if (f) return f; }
    if (req.type === "target" && req.src && req.src.def.name === "Vein Ripper" && req.options.some(x => g.isPlayer(x))) { const q = mem(p).drainAt || mem(p).mark; if (q && req.options.includes(q)) return q; const qs = req.options.filter(x => g.isPlayer(x) && x !== p); if (qs.length) return qs.sort((a, b) => a.life - b.life)[0]; }
    if (req.type === "target" && req.purpose === "sacrifice" && req.src && req.src.def.name === "Pyre of Heroes") { const f = H.pyrePick(g, p); if (f && req.options.includes(f)) return f; }
    if (req.type === "target" && (req.purpose === "sparkCopy" || req.purpose === "autonCopy" || req.purpose === "sakashimaCopy")) { const t = H.copyTarget(g, p, req); if (t && req.options.includes(t)) return t; }
    // the creature an evasion source was used for
    const ev = mem(p).evade;
    if (ev && ev.turn === g.turn && req.type === "target" && req.src && EVADE[req.src.def.name] && req.options.includes(ev.o)) return ev.o;
    if (req.type === "target" && req.purpose === "transmute") return req.options.find(x => x === p);
    if (req.type === "cards" && req.purpose === "tutor" && req.options.length > 1 && !OFF.has("tutor")) {
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

  // research switches: HEIST_ON="kit,flipFirst,copyEtrata" turns optional behaviours on
  if (ON.has("kit")) H.kitTutor = true;
  if (ON.has("flipFirst")) H.flipFirst = true;
  // research switches: HEIST_OFF="attack,mulligan,plan,flips,choose" (environment, Node only) turns parts of this brain off
  const OFF = new Set(String((typeof process !== "undefined" && process.env && process.env.HEIST_OFF) || "").split(",").filter(Boolean));
  (MK.DECK_BRAINS = MK.DECK_BRAINS || {})[DECK_ID] = Object.assign({
    plan: OFF.has("plan") ? null : heistPlan,
    attack: OFF.has("attack") ? null : (g, p, cands, targets) => (brainOn(p) ? heistAttack(g, p, cands, targets) : null),
    choose: OFF.has("choose") ? null : heistChoose, tutor: OFF.has("tutor") ? null : heistTutor
  }, OFF.has("mulligan") ? {} : { mulligan: heistMulligan }, OFF.has("flips") ? {} : { ownFlips: true, flipUse: heistFlipUse }, { castHold });
  MK.DECK_TUTORS = MK.DECK_TUTORS || {}; if (!OFF.has("tutor")) MK.DECK_TUTORS[DECK_ID] = heistTutor;
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
