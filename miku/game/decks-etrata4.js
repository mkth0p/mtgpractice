/* Etrata, Bracket 4 aggro: the upgraded Etrata list from the Etrata site's Shop tab. Cheap evasive
   Assassins, two Assassin lords, card draw on every hit, fast mana, tutors and free counterspells.
   The cards the base Etrata list doesn't have are defined here; the rest come from cards-etrata.js
   and the bot decks (Force of Will, Demonic Tutor, the fetch lands...).
   Two decks a player can pilot from the Etrata site (MK.HERO_DECKS): stage 1 of the upgrade (the
   ~53€ aggro core) and the finished Bracket 4 list, which also sits at the table as a Bracket 4 bot.
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
  // cards-etrata.js loads first and exports its Assassin test (changelings, Roshan, Maskwood Nexus...)
  const isAssassin = (g, o) => (MK.isAssassin ? MK.isAssassin(g, o) : !!o && g.hasSub(o, "Assassin"));
  const assassinCard = c => !!c && !!c.def && (!!c.def.changeling || c.def.subtypes.includes("Assassin"));
  const OUTLAWS = ["Assassin", "Mercenary", "Pirate", "Rogue", "Warlock"];

  /* Freerunning: the engine marks p.freerun with the turn p dealt combat damage to a player with an
     Assassin or a commander. */
  const freerunning = cost => ({ label: "Freerunning", cost, condition: (g, p) => p.freerun === g.turn });
  const hasFreerun = c => !!c && !!c.def && (c.def.altCosts || []).some(a => a.label === "Freerunning");

  /* Lands whose colored mana only pays for Assassin creature spells. */
  const assassinSpell = (g, card) => !!card && card.def.types.includes("Creature") && (assassinCard(card) || g.battlefield.some(s => s.controller === card.owner && s.def.makesAssassins));

  /* ================================================================ creatures */
  D({
    name: "Hired Poisoner", cost: "{B}", type: "Creature — Human Assassin", pt: "1/1",
    keywords: ["deathtouch"], text: "Deathtouch",
    ai: { priority: 6 }
  });
  D({
    name: "Thrill-Kill Assassin", cost: "{1}{B}", type: "Creature — Human Assassin", pt: "1/2",
    keywords: ["deathtouch"],
    text: "Deathtouch\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
    note: "It always enters unleashed, with the +1/+1 counter.",
    etbCounters: () => ({ p1: 1 }),
    statics: [{ applies: (g, s, o) => o === s && (o.counters.p1 || 0) > 0, cantBlock: true }],
    ai: { priority: 6 }
  });
  const blockedThisTurn = new WeakMap();
  D({
    name: "Guildsworn Prowler", cost: "{1}{B}", type: "Creature — Tiefling Rogue Assassin", pt: "2/1",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhen Guildsworn Prowler dies, if it wasn't blocking, draw a card.",
    note: "It counts as blocking for the rest of the turn once it blocks.",
    triggers: [
      { on: "blocks", when: (g, s, ev) => ev.o === s, do: (g, s) => { blockedThisTurn.set(s, g.turn); } },
      { on: "dies", self: true, intervening: (g, s) => blockedThisTurn.get(s) !== g.turn, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Mischievous Sneakling", cost: "{1}{U/B}", type: "Creature — Shapeshifter", pt: "2/2", changeling: true,
    keywords: ["changeling", "flash"],
    text: "Changeling (This card is every creature type.)\nFlash",
    ai: { priority: 5, instantEnd: true }
  });
  D({
    name: "Midnight Assassin", cost: "{2}{B}", type: "Creature — Vampire Assassin", pt: "1/2",
    keywords: ["flying", "deathtouch"], text: "Flying, deathtouch",
    ai: { priority: 6 }
  });
  D({
    name: "Mistwalker", cost: "{2}{U}", type: "Creature — Shapeshifter", pt: "1/4", changeling: true,
    keywords: ["changeling", "flying"],
    text: "Changeling (This card is every creature type.)\nFlying\n{1}{U}: Mistwalker gets +1/-1 until end of turn.",
    abilities: [{
      label: "+1/-1", cost: "{1}{U}",
      condition: (g, o) => g.toughness(o) > 1,
      do: (g, src) => { if (src.zone === "battlefield") g.pump(src, 1, -1); },
      // pump an unblocked Mistwalker after blockers, while it survives
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && !!o.combat && !!o.combat.attacking && !(o.combat.blockedBy || []).length && g.toughness(o) > 2 && g.turn > 0 && g.active === p }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Mari, the Killing Quill", cost: "{1}{B}{B}", type: "Legendary Creature — Vampire Assassin", pt: "3/2",
    text: "Whenever a creature an opponent controls dies, exile it with a hit counter on it.\nAssassins, Mercenaries, and Rogues you control have deathtouch and \"Whenever this creature deals combat damage to a player, you may remove a hit counter from a card that player owns in exile. If you do, draw a card and create two Treasure tokens.\"",
    note: "The granted combat-damage trigger is Mari's own trigger, one for each of your Assassins, Mercenaries and Rogues that connects.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && (isAssassin(g, o) || g.hasSub(o, "Mercenary") || g.hasSub(o, "Rogue")), kw: ["deathtouch"] }],
    triggers: [
      {
        on: "dies", when: (g, s, ev) => !!ev.lki && isOpp(g, s.controller, ev.lki.controller) && !ev.o.isToken,
        do: (g, s, ev) => {
          const c = ev.o;
          if (c.zone !== "graveyard") return;
          g.moveTo(c, "exile");
          if (c.zone === "exile") { c.hitCounter = true; g.bump(); log(g, `Mari exiles ${c.def.name} with a hit counter (${c.owner.name} has ${g.hitCount(c.owner)}).`, s.controller, [c.def.name, s.def.name]); }
        }
      },
      {
        on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && mine(s, ev.src) && isOpp(g, s.controller, ev.p) && g.hitCount(ev.p) > 0 && (isAssassin(g, ev.src) || g.hasSub(ev.src, "Mercenary") || g.hasSub(ev.src, "Rogue")),
        optional: "Mari: remove a hit counter to draw a card and make two Treasures?",
        do: (g, s, ev, { p }) => {
          const c = ev.p.exile.find(x => x.hitCounter);
          if (!c) return;
          c.hitCounter = false;
          g.draw(p, 1);
          g.createToken(p, T.treasure, { count: 2 });
          log(g, `${p.name} removes the hit counter from ${c.def.name}: a card and two Treasures.`, p, [s.def.name]);
        }
      }
    ],
    ai: {
      priority: 8, threat: 3,
      // hit counters are a win condition with Etrata, the Silencer: stop cashing them in at two
      confirm: (g, p) => !g.opponents(p).some(q => g.hitCount(q) === 2)
    }
  });
  D({
    name: "Black Widow, Deadly Hunter", cost: "{2}{B}", type: "Legendary Creature — Human Assassin Hero", pt: "3/3",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhenever a creature you control with deathtouch deals combat damage to a player, you draw a card and lose 1 life.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && mine(s, ev.src) && g.kw(ev.src, "deathtouch"),
      do: (g, s, ev, { p }) => { g.draw(p, 1); g.loseLife(p, 1, s); }
    }],
    ai: { priority: 8, draw: true }
  });
  D({
    name: "Shadow, Mysterious Assassin", cost: "{2}{B}", type: "Legendary Creature — Human Assassin", pt: "3/3",
    keywords: ["deathtouch"],
    text: "Deathtouch\nThrow — Whenever Shadow deals combat damage to a player, you may sacrifice another nonland permanent. If you do, draw two cards and each opponent loses life equal to the mana value of the sacrificed permanent.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const opts = g.controlled(p, o => o !== s && !g.isLand(o));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Shadow: sacrifice another nonland permanent to draw two (or none)", options: opts, min: 0, max: 1, purpose: "shadowSac", src: s });
        const c = (pick || [])[0];
        if (!c || c.zone !== "battlefield" || c.controller !== p) return;
        const mv = c.faceDown ? 0 : g.mvOf(c);
        g.sacrifice(c);
        g.draw(p, 2);
        if (mv > 0) for (const q of g.opponents(p)) g.loseLife(q, mv, s);
      }
    }],
    ai: {
      priority: 7,
      // Treasures, spent mana rocks and spare tokens first; a cloak only when there are plenty
      cards: (g, p, req) => {
        if (req.purpose !== "shadowSac") return null;
        const o = req.options;
        const cheap = o.filter(c => c.isToken && !g.isCreature(c)).concat(o.filter(c => c.def.name === "Lotus Petal" || c.def.name === "Mana Vault" && c.tapped))
          .concat(o.filter(c => c.isToken && g.isCreature(c) && g.power(c) <= 1));
        if (cheap.length) return [cheap[0]];
        const downs = o.filter(c => c.faceDown);
        if (downs.length >= 3) return [downs[0]];
        return [];
      }
    }
  });
  D({
    name: "Virtus the Veiled", cost: "{2}{B}", type: "Legendary Creature — Azra Assassin", pt: "1/1",
    keywords: ["deathtouch"],
    text: "Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Virtus the Veiled deals combat damage to a player, that player loses half their life, rounded up.",
    note: "Partner with does nothing here: Gorm isn't in the deck.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev) => { const q = ev.p; if (!q.lost && q.life > 0) g.loseLife(q, Math.ceil(q.life / 2), s); } }],
    ai: {
      priority: 7, threat: 3,
      attackTarget: (g, p, o, targets) => targets.filter(t => g.isPlayer(t) && isOpp(g, p, t)).sort((a, b) => b.life - a.life)[0],
      unblock: (g, p, o) => !g.ch(o).unblockable
    }
  });
  D({
    name: "Lydia Frye", cost: "{2}{U/B}", type: "Legendary Creature — Human Assassin", pt: "3/2",
    text: "Lydia Frye can't be blocked by creatures with power 3 or greater.\nAt the beginning of your end step, surveil X, where X is the number of tapped Assassins you control. (Look at the top X cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
    canBeBlockedBy: (g, a, b) => g.power(b) < 3,
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => { const x = g.creatures(p).filter(c => c.tapped && isAssassin(g, c)).length; if (x > 0) return g.surveil(p, x, s); }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Merciless Harlequin", cost: "{2}{B}", type: "Creature — Human Assassin", pt: "2/1",
    text: "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nWhen Merciless Harlequin enters, you draw a card and you lose 1 life.",
    altCosts: [freerunning("{1}{B}")],
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { g.draw(p, 1); g.loseLife(p, 1, s); } }],
    ai: { priority: 6 }
  });
  D({
    name: "Adéwalé, Breaker of Chains", cost: "{1}{U}{B}", type: "Legendary Creature — Human Assassin Pirate", pt: "4/1",
    text: "When Adéwalé enters, reveal the top six cards of your library. Put an Assassin, Pirate, or Vehicle card from among them into your hand and the rest on the bottom of your library in a random order.\nWhenever a Vehicle you control deals combat damage to a player, you may return Adéwalé from your graveyard to your hand.",
    note: "The deck has no Vehicles, so the second ability never comes up.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 6);
        if (!top.length) return;
        log(g, `${p.name} reveals ${top.map(c => c.def.name).join(", ")}.`, p, top.map(c => c.def.name));
        const hits = top.filter(c => assassinCard(c) || c.def.subtypes.includes("Pirate") || c.def.subtypes.includes("Vehicle"));
        let pick = null;
        if (hits.length) {
          const got = await g.ask(p, { type: "cards", prompt: "Adéwalé: put an Assassin, Pirate or Vehicle card into your hand", options: hits, min: 1, max: 1, purpose: "adewale", src: s });
          pick = (got || []).find(c => hits.includes(c)) || hits[0];
        }
        if (pick) { g.moveTo(pick, "hand"); log(g, `${p.name} puts ${pick.def.name} into their hand.`, p, [pick.def.name]); }
        const rest = top.filter(c => c !== pick && c.zone === "library");
        g.shuffleArr(rest);
        for (const c of rest) g.tuck(c, true);
        g.bump();
      }
    }],
    ai: { priority: 7, cards: (g, p, req) => (req.purpose === "adewale" ? [req.options.slice().sort((a, b) => ((b.def.ai && b.def.ai.priority) || 5) + b.def.mv * 0.5 - ((a.def.ai && a.def.ai.priority) || 5) - a.def.mv * 0.5)[0]] : null) }
  });
  D({
    name: "Achilles Davenport", cost: "{2}{U}{B}", type: "Legendary Creature — Human Assassin", pt: "3/3",
    keywords: ["menace"],
    text: "Freerunning {U}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nMenace\nOther Assassins you control get +1/+1.",
    altCosts: [freerunning("{U}{B}")],
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [1, 1] }],
    ai: { priority: 8, threat: 3 }
  });
  D({
    name: "Interceptor, Shadow's Hound", cost: "{2}{B}{B}", type: "Legendary Creature — Dog", pt: "4/3",
    keywords: ["menace"],
    text: "Menace\nAssassins you control have menace.\nWhenever you attack with one or more legendary creatures, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && isAssassin(g, o), kw: ["menace"] }],
    triggers: [{
      on: "attack", zone: "graveyard", when: (g, s, ev) => ev.p === s.owner && (ev.attackers || []).some(a => a.def.legendary),
      do: async (g, s, ev, { p }) => {
        const cost = pc("{2}{B}");
        if (s.zone !== "graveyard" || !g.canPay(p, cost)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Pay {2}{B} to return Interceptor tapped and attacking?", purpose: "interceptor", src: s });
        if (!ok || !g.pay(p, cost)) return;
        const leg = (ev.attackers || []).find(a => a.def.legendary && a.combat);
        const target = leg && leg.combat ? leg.combat.attacking : null;
        g.putOntoBattlefield([s], p, { tapped: true, attacking: target || undefined });
        log(g, `Interceptor returns ${target ? "tapped and attacking" : "tapped"}.`, p, [s.def.name]);
      }
    }],
    ai: { priority: 7, confirm: () => true }
  });
  D({
    name: "Ezio, Blade of Vengeance", cost: "{3}{U}{B}", type: "Legendary Creature — Human Assassin", pt: "5/5",
    keywords: ["deathtouch"],
    text: "Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nWhenever an Assassin you control deals combat damage to a player, draw a card.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && mine(s, ev.src) && isAssassin(g, ev.src), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 8, threat: 4, draw: true }
  });

  /* ================================================================ artifacts and enchantments */
  D({
    name: "Brotherhood Regalia", cost: "{2}", type: "Artifact — Equipment",
    text: "Equipped creature has ward {2}, is an Assassin in addition to its other types, and can't be blocked.\nEquip legendary creature {1}\nEquip {3}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, subtypes: ["Assassin"], unblockable: true, ward: 2 }],
    abilities: [
      {
        label: "Equip legendary creature", cost: "{1}", timing: "sorcery",
        targets: [{ kind: "creature", you: true, purpose: "equip", prompt: "Attach Brotherhood Regalia to", filter: (g, t, p, src) => t.def.legendary && t.id !== (src.attachedTo && src.attachedTo.id) }],
        do: (g, src, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") { src.attachedTo = t; g.bump(); log(g, `Brotherhood Regalia is attached to ${t.def.name}.`, ctx.p, [src.def.name, t.def.name]); } },
        ai: { use: (g, p, o, ctx) => ctx.window === "main1" && regaliaWant(g, p, o, true) }
      },
      {
        label: "Equip", cost: "{3}", timing: "sorcery",
        targets: [{ kind: "creature", you: true, purpose: "equip", prompt: "Attach Brotherhood Regalia to", filter: (g, t, p, src) => t.id !== (src.attachedTo && src.attachedTo.id) }],
        do: (g, src, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") { src.attachedTo = t; g.bump(); log(g, `Brotherhood Regalia is attached to ${t.def.name}.`, ctx.p, [src.def.name, t.def.name]); } },
        ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !regaliaWant(g, p, o, true) && regaliaWant(g, p, o, false) }
      }
    ],
    ai: {
      priority: 6,
      target: (g, p, req) => (req.purpose === "equip" ? req.options.filter(c => c.controller === p && !c.sick).sort((a, b) => regaliaRank(g, b) - regaliaRank(g, a))[0] || req.options[0] : undefined)
    }
  });
  /* Who wears the Regalia: the creature whose hit matters most (Slasher and Virtus halve a life total,
     Etrata, the Silencer already can't be blocked). */
  const regaliaRank = (g, c) => (c.def.name === "Etrata, the Silencer" || c.def.name === "Etrata, Deadly Fugitive" ? -50 : 0) + (/Slasher|Virtus/.test(c.def.name) ? 40 : 0) + (isAssassin(g, c) ? 10 : 0) + g.power(c);
  function regaliaWant(g, p, o, legendaryOnly) {
    const cur = o.attachedTo && o.attachedTo.zone === "battlefield" ? o.attachedTo : null;
    const best = g.creatures(p).filter(c => !c.sick && (!legendaryOnly || c.def.legendary)).sort((a, b) => regaliaRank(g, b) - regaliaRank(g, a))[0];
    return !!best && best !== cur && regaliaRank(g, best) > (cur ? regaliaRank(g, cur) + 5 : 0) && !g.ch(best).unblockable;
  }
  const bypassHit = new WeakMap();
  D({
    name: "Rooftop Bypass", cost: "{1}{U}{B}", type: "Enchantment",
    text: "Whenever one or more nontoken creatures you control deal combat damage to a player, create a 1/1 black Assassin creature token with menace. (It can't be blocked except by two or more creatures.)",
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => {
        if (!ev.src || !mine(s, ev.src) || ev.src.isToken) return false;
        const seen = bypassHit.get(s) || { key: null, players: new Set() };
        const key = g.turn;
        if (seen.key !== key) { seen.key = key; seen.players = new Set(); }
        bypassHit.set(s, seen);
        if (seen.players.has(ev.p)) return false;
        seen.players.add(ev.p);
        return true;
      },
      do: (g, s, ev, { p }) => g.createToken(p, T.bypassAssassin)
    }],
    ai: { priority: 7 }
  });
  T.bypassAssassin = MK.tokenDef({ key: "rooftop-assassin", name: "Assassin", pt: [1, 1], colors: "B", subtypes: ["Assassin"], keywords: ["menace"], text: "Menace" });

  /* ================================================================ instants and sorceries */
  D({
    name: "Imperial Seal", cost: "{B}", type: "Sorcery",
    text: "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const pick = p.agent && p.agent.bot ? tutorPick(g, p) : null;
        await g.search(p, { filter: pick ? (g2, o) => o === pick : () => true, to: "top", prompt: "Imperial Seal: search for a card to put on top", src: ctx.o, hidden: true, purpose: "tutor" });
        g.loseLife(p, 2, ctx.o);
      }
    },
    ai: { tutor: true, priority: 7 }
  });
  /* The bots' tutor pick for this deck: a land when short, then the engine pieces it lacks. */
  const WANT = ["Mari, the Killing Quill", "Black Widow, Deadly Hunter", "Ezio, Blade of Vengeance", "Achilles Davenport", "Ramses, Assassin Lord", "Rhystic Study", "Skullclamp", "Roshan, Hidden Magister", "Etrata, the Silencer"];
  function tutorPick(g, p) {
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (lands < 3 && !p.hand.some(c => c.def.types.includes("Land"))) { const l = p.library.find(c => c.def.types.includes("Land") && !c.def.supertypes.includes("Basic")) || p.library.find(c => c.def.types.includes("Land")); if (l) return l; }
    const have = n => g.battlefield.some(o => o.controller === p && o.def.name === n) || p.hand.some(c => c.def.name === n);
    for (const n of WANT) { if (have(n)) continue; const c = p.library.find(x => x.def.name === n); if (c) return c; }
    return null;
  }
  D({
    name: "Eagle Vision", cost: "{4}{U}", type: "Sorcery",
    text: "Freerunning {1}{U} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDraw three cards.",
    altCosts: [freerunning("{1}{U}")],
    spell: { do: (g, ctx) => g.draw(ctx.p, 3) },
    ai: { priority: 5, draw: true }
  });
  D({
    name: "Chain Assassination", cost: "{2}{B}{B}", type: "Instant",
    text: "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDestroy target creature. If another creature died this turn, draw a card.",
    altCosts: [freerunning("{1}{B}")],
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy" }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        const before = g.diedThisTurn || 0;
        if (t && ctx.legal[0]) g.destroy(t);
        const died = (g.diedThisTurn || 0) - (t && t.zone !== "battlefield" && ctx.legal[0] ? 1 : 0);
        if (died > 0 || before > 0) g.draw(ctx.p, 1);
      }
    },
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "Shoot the Sheriff", cost: "{1}{B}", type: "Instant",
    text: "Destroy target non-outlaw creature. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws. Everyone else is fair game.)",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy target non-outlaw creature", filter: (g, o) => !OUTLAWS.some(t => g.hasSub(o, t)) }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.destroy(t); }
    },
    ai: { removal: true, minThreat: 4 }
  });

  /* ================================================================ lands */
  D({
    name: "Cavern of Souls", type: "Land",
    text: "As Cavern of Souls enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't be countered.",
    note: "The chosen type is always Assassin. While you control it, your Assassin creature spells can't be countered, whichever mana paid for them.",
    etbState: () => ({ chosenType: "Assassin" }),
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => assassinSpell(g, card) }],
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.item && assassinSpell(g, ev.o), do: (g, s, ev) => { ev.item.cantBeCountered = true; } }]
  });
  D({
    name: "Secluded Courtyard", type: "Land",
    text: "As Secluded Courtyard enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type or activate an ability of a creature or creature card of the chosen type.",
    note: "The chosen type is always Assassin, and its colored mana only pays for Assassin creature spells.",
    etbState: () => ({ chosenType: "Assassin" }),
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => assassinSpell(g, card) }]
  });
  D({
    name: "Brotherhood Headquarters", type: "Land",
    text: "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source.",
    note: "Its colored mana only pays for Assassin spells and spells with freerunning.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => assassinSpell(g, card) || hasFreerun(card) }]
  });

  /* ================================================================ the decks */
  const B = n => Array(n).fill("Swamp"), I = n => Array(n).fill("Island");
  // Stage 1: the ~53€ aggro core. The base list with 29 swaps; its mana and interaction stay.
  const STAGE1 = ["Changeling Outcast", "Mothdust Changeling", "Universal Automaton", "Hookblade Veteran", "Hired Poisoner",
    "Brotherhood Spy", "Desmond Miles", "Basim Ibn Ishaq", "Duskmantle Guildmage", "Guildsworn Prowler", "Thrill-Kill Assassin", "Mischievous Sneakling",
    "Mari, the Killing Quill", "Black Widow, Deadly Hunter", "Shadow, Mysterious Assassin", "Virtus the Veiled", "Unstoppable Slasher", "Mistwalker", "Midnight Assassin", "Lydia Frye", "Merciless Harlequin", "Gix, Yawgmoth Praetor", "Adéwalé, Breaker of Chains",
    "Achilles Davenport", "Ramses, Assassin Lord", "Roshan, Hidden Magister", "Etrata, the Silencer", "Interceptor, Shadow's Hound", "Spark Double", "Ezio, Blade of Vengeance",
    "Sol Ring", "Arcane Signet", "Dimir Signet", "Talisman of Dominance", "Fellwar Stone", "Mind Stone", "Springleaf Drum", "Dark Ritual",
    "Skullclamp", "Kindred Discovery", "Rooftop Bypass", "Key to the City", "Eagle Vision", "Preordain", "Consider", "Brainstorm", "Night's Whisper",
    "Counterspell", "Arcane Denial", "An Offer You Can't Refuse", "Wash Away", "Infernal Grasp", "Go for the Throat", "Chain Assassination", "Shoot the Sheriff", "Toxic Deluge",
    "Swiftfoot Boots", "Lightning Greaves", "Brotherhood Regalia", "Cover of Darkness", "Maskwood Nexus", "Leyline of Transformation", "Mindcrank",
    "Command Tower", "Exotic Orchard", "Underground River", "Drowned Catacomb", "Sunken Hollow", "Choked Estuary", "Darkwater Catacombs", "Darkslick Shores", "Tainted Isle", "River of Tears", "Path of Ancestry", "Access Tunnel", "Rogue's Passage", "Brotherhood Headquarters", "Secluded Courtyard"
  ].concat(I(11), B(10));
  // Stage 3: the finished Bracket 4 list (10 Game Changers).
  const FULL = ["Changeling Outcast", "Mothdust Changeling", "Universal Automaton", "Hookblade Veteran", "Hired Poisoner",
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
  const base = {
    hero: "etrata", commander: "Etrata, Deadly Fugitive", title: "Etrata, Deadly Fugitive", identity: ["U", "B"],
    style: "Dimir Assassin aggro",
    watch: ["Mari, the Killing Quill", "Black Widow, Deadly Hunter", "Ezio, Blade of Vengeance", "Achilles Davenport", "Ramses, Assassin Lord", "Unstoppable Slasher", "Virtus the Veiled"]
  };
  MK.ETRATA_AGGRO_DECK = Object.assign({}, base, {
    id: "etrata-aggro", variant: "etrata-aggro", label: "Etrata aggro (stage 1)", name: "Etrata aggro", bracket: 3, aggression: 0.8,
    blurb: "The ~53€ first step of the Bracket 4 upgrade: 30 creatures, two Assassin lords and a card for most hits. The base list's mana and counterspells stay.",
    list: STAGE1
  });
  MK.ETRATA_B4_DECK = Object.assign({}, base, {
    id: "etrata-b4", variant: "etrata-b4", label: "Etrata B4 aggro", name: "Etrata B4", bracket: 4, aggression: 0.85,
    blurb: "Bracket 4 Assassin aggro: fast mana, tutors and free counterspells behind 30 cheap Assassins that draw a card whenever they connect.",
    list: FULL
  });
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.ETRATA_AGGRO_DECK, MK.ETRATA_B4_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.ETRATA_B4_DECK);
})(typeof window !== "undefined" ? window : globalThis);
