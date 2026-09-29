/* Isperia, Supreme Judge: a Bracket 2 bot deck built from the retail "First Flight" precon
   (Starter Commander Decks, 2022). Azorius fliers: Angels, Sphinxes, Birds and Thopters, flying
   anthems, card draw stapled to creatures, three counterspells, Gideon Jura, and the precon's
   removal, wipes and mana rocks.
   How it wins: evasive beats in the air, pumped by Favorable Winds, Empyrean Eagle, Thunderclap
   Wyvern, Kangee and Steel-Plume Marshal, kept alive by Sephara (other fliers are indestructible)
   and turned into a lifelinking race by True Conviction. Isperia and Ever-Watching Threshold draw
   cards whenever the table attacks her player, and Gideon Jura drags the table's attacks onto himself.
   94 of the 99 cards are the retail list. The other five replace cards the engine can't express:
   Inspiring Overseer for Jubilant Skybonder, Linvala, the Preserver for Angler Turtle, Coastal
   Piracy for Bident of Thassa and Midnight Haunting for Migratory Route, plus Oblivion Ring in
   place of the retail list's 39th land.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   The `ai` hints keep it a casual deck: creatures on curve, removal on real threats, counterspells
   held for big spells, mana sinks at the end of the turn before its own, a board wipe only when it
   is far behind, and combat tricks only when they change a fight. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce;
  const AIX = () => MK.AI || {};

  /* ================================================================ helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const safe = (f, d) => { try { return f(); } catch (e) { return d; } };
  const V = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const TH = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : V(g, o));
  const landCount = (g, p) => g.controlled(p, o => g.isLand(o)).length;
  const isLandCard = o => o.def.types.includes("Land");
  const isSpellCard = o => o.def.types.includes("Instant") || o.def.types.includes("Sorcery");
  /* Enough cards left to draw without drifting toward an empty library. */
  const deckOK = (p, n) => p.library.length > (n == null ? 10 : n);
  /* The end step of the player just before us: mana left over now is wasted otherwise. */
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;
  const sum = (list, f) => list.reduce((s, x) => s + f(x), 0);
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, { p, cards: [src.def.name] });
    return got;
  }
  /* A creature attacking p or a planeswalker p controls. */
  const attacksPlayer = (g, p, t) => t === p || (!!t && !g.isPlayer(t) && t.controller === p && g.isPlaneswalker(t));

  /* Flying from the card, effects and other static abilities, read without recomputing o's own
     characteristics: a static ability that asks "does it fly?" about the creature being computed
     would otherwise only see the printed keywords. */
  function flies(g, o) {
    if (o.def.keywords.includes("flying")) return true;
    if (o.state && o.state.selfKw && o.state.selfKw.includes("flying")) return true;
    const an = o.state && o.state.animated;
    if (an && an.turn === g.turn && (an.keywords || []).includes("flying")) return true;
    for (const e of g.effects) if (e.kw && e.kw.includes("flying") && g.affects(e, o)) return true;
    for (const s of g.staticSources()) {
      for (const st of g.staticsOf(s)) {
        if (!st.kw || !st.applies) continue;
        const v = typeof st.kw === "function" ? st.kw(g, s, o) : st.kw;
        if (v && v.includes("flying") && st.applies(g, s, o)) return true;
      }
    }
    for (const pl of g.players) {
      for (const em of pl.emblems) {
        for (const st of em.statics || []) {
          if (!st.kw || !st.applies) continue;
          const src = { controller: pl, emblem: true };
          const v = typeof st.kw === "function" ? st.kw(g, src, o) : st.kw;
          if (v && v.includes("flying") && st.applies(g, src, o)) return true;
        }
      }
    }
    return false;
  }
  const myFliers = (g, p) => g.creatures(p).filter(c => g.kw(c, "flying"));
  const untappedFliers = (g, p) => g.creatures(p).filter(c => !c.tapped && g.kw(c, "flying"));
  /* Creatures with flying in combat right now (Kangee, Kangee's Lieutenant, Steel-Plume Marshal). */
  const attackingFliers = g => (g.combat ? g.combat.attackers.filter(c => c.zone === "battlefield" && c.combat && g.isCreature(c) && g.kw(c, "flying")) : []);
  const blockingFliers = g => g.battlefield.filter(c => c.combat && c.combat.blocking && g.isCreature(c) && g.kw(c, "flying"));
  function pumpList(g, s, list, dp, dt, who) {
    if (!list.length) return;
    g.pump(list, dp, dt);
    g.log(`${who} get ${dp < 0 ? dp : "+" + dp}/${dt < 0 ? dt : "+" + dt} until end of turn.`, { p: s.controller, cards: [s.def.name] });
  }

  /* Scry 1 (Temple of Enlightenment). */
  function keepOnTop(g, p, card) {
    const lands = landCount(g, p);
    const inHand = p.hand.filter(isLandCard).length;
    if (isLandCard(card)) return lands + inHand < 6;
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
  const scryConfirm = (g, p, req) => (req.purpose === "scryBottom" && req.card ? !keepOnTop(g, p, req.card) : true);

  /* "Exile it until this leaves" (Oblivion Ring, Banishing Light). The exiled cards are remembered
     on the object itself, with each card's zone count so a card that has moved on since isn't
     brought back. Tokens stop existing in exile and never come back. */
  function exileLinked(g, s, list, until) {
    list = [].concat(list).filter(t => t && t.zone === "battlefield");
    if (!list.length) return;
    if (s.zone !== "battlefield") {
      // already gone: "until" (Banishing Light) exiles nothing; Oblivion Ring exiles for good
      if (!until) for (const t of list) g.exile(t, s);
      return;
    }
    const links = s.linkedExile || (s.linkedExile = []);
    for (const t of list) {
      g.exile(t, s);
      if (t.zone === "exile" && !t.isToken) links.push({ card: t, zc: t.zc });
    }
  }
  function returnLinked(g, s) {
    const links = s.linkedExile || [];
    s.linkedExile = null;
    const back = links.filter(l => l.card.zone === "exile" && l.card.zc === l.zc && !l.card.owner.lost).map(l => l.card);
    for (const q of new Set(back.map(c => c.owner))) {
      const mineBack = back.filter(c => c.owner === q);
      g.log(`${mineBack.map(c => c.def.name).join(" and ")} return${mineBack.length === 1 ? "s" : ""} to the battlefield under ${q.name}'s control.`, { p: q, cards: mineBack.map(c => c.def.name) });
      g.putOntoBattlefield(mineBack, q);
    }
  }

  /* ---------- bot helpers */
  function bestOpposing(g, p, list) {
    let best = null, score = -1e9;
    for (const t of list) {
      if (g.isPlayer(t) || t.controller === p) continue;
      const s = TH(g, t, p);
      if (s > score) { score = s; best = t; }
    }
    return { best, score };
  }
  /* Cast an "exile target ... when this enters" permanent only when there is something worth it. */
  const etbRemovalCast = (spec, minThreat) => (g, p, o) => {
    const { best, score } = bestOpposing(g, p, g.targetOptions(p, spec, o));
    if (!best || score < minThreat) return false;
    return 15 + o.def.mv * 0.6 + score * 0.5;
  };
  const oppCreatures = (g, p) => g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c));
  /* The top of the stack is an opponent's spell that would take o away (a board wipe only
     threatens creatures). */
  function doomedByStack(g, p, o) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return false;
    const ai = top.o.def.ai || {};
    return (top.targets || []).includes(o) || (!!ai.wipe && g.isCreature(o));
  }
  /* Mana sinks: used at the end of the turn before ours, when the mana would be wasted anyway. */
  const sinkUse = (g, p, ctx, libFloor) => endBeforeMe(g, p, ctx) && deckOK(p, libFloor == null ? 12 : libFloor) && p.hand.length < 8;
  function weakestOpp(g, p, options) {
    const opps = options.filter(q => g.isPlayer(q) && q !== p);
    const might = q => sum(g.battlefield.filter(o => o.controller === q), o => V(g, o)) + q.hand.length * 2 + q.life * 0.2;
    return opps.sort((a, b) => might(a) - might(b))[0] || options[0];
  }
  const graveScore = q => sum(q.graveyard, c => (c.def.types.includes("Creature") ? 2 + c.def.mv * 0.3 : isSpellCard(c) ? 0.5 : 0.3));
  function graveTarget(g, p, options) {
    const opps = options.filter(q => g.isPlayer(q) && q !== p);
    if (!opps.length) return options[0];
    return opps.sort((a, b) => graveScore(b) - graveScore(a))[0];
  }
  /* Attackers coming at p or a planeswalker p controls, that p can target. */
  function attackersAt(g, p) {
    const c = g.combat;
    if (!c || c.attacker === p) return [];
    return c.attackers.filter(a => a.zone === "battlefield" && a.combat && g.defenderOf(a.combat.attacking) === p && g.canTarget(p, a));
  }
  function bestAttackerTarget(g, p, req) {
    if (req.purpose !== "harm") return undefined;
    const at = attackersAt(g, p).filter(a => req.options.includes(a)).sort((a, b) => TH(g, b, p) - TH(g, a, p));
    return at[0];
  }
  /* The creature an Aura should go on: our best flier, else our best creature. */
  function auraHost(g, p, options) {
    const own = options.filter(c => !g.isPlayer(c) && c.controller === p && g.isCreature(c));
    const score = c => Math.max(0, g.power(c)) + g.toughness(c) * 0.5 + (g.kw(c, "flying") ? 3 : 0) + (g.kw(c, "hexproof") ? 1 : 0) - (c.isToken ? 1 : 0);
    return own.sort((a, b) => score(b) - score(a))[0] || null;
  }

  /* Counterspells: besides the bot's own rule (big spells, wipes, removal on its board), also stop
     engines (noncreature permanents with abilities) and spells an opponent pumped X into. */
  function counterWorth(g, p, item) {
    if (!item || item.p === p || item.isCopy) return 0;
    const d = item.o.def, ai = d.ai || {};
    let s = d.mv + (item.x || 0) * (d.costObj.x || 0);
    if (ai.wipe) s += 8;
    if (ai.finisher) s += 8;
    if (ai.tutor) s += 4;
    if (ai.threat) s += ai.threat;
    if (item.o.isCommander) s += 3;
    const permanent = !d.types.includes("Instant") && !d.types.includes("Sorcery");
    if (permanent && !d.types.includes("Creature") && !d.types.includes("Land") && (d.statics.length || d.triggers.length)) s += 2;
    if (ai.removal && (item.targets || []).some(t => t && !g.isPlayer(t) && t.controller === p)) s += 4 + Math.max(0, ...item.targets.filter(t => t && !g.isPlayer(t)).map(t => V(g, t)));
    return s;
  }
  const counterPlan = (g, p, o, ctx) => {
    if (ctx.window !== "stack" || o.zone !== "hand") return null;
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p || top.o.def.cantBeCountered) return null;
    const act = (ctx.actions || []).find(a => a.type === "cast" && a.card === o);
    if (!act) return null;
    const spec = o.def.spell.targets[0];
    if (!g.targetOptions(p, spec, o).includes(top)) return null;
    // the cheapest counterspell that can answer it goes first
    const cheaper = p.hand.some(c => c !== o && c.def.ai && c.def.ai.counterPlan && c.def.mv < o.def.mv &&
      (ctx.actions || []).some(a => a.type === "cast" && a.card === c) && g.targetOptions(p, c.def.spell.targets[0], c).includes(top));
    if (cheaper) return null;
    return counterWorth(g, p, top) >= 5 ? { type: "cast", card: o, targets: [top], maxTries: 1 } : null;
  };

  /* Board wipes: when the table's creatures are worth far more than ours, or when one opponent could
     nearly kill us next turn and the wipe costs them more than us. Time Wipe keeps our best creature. */
  function incomingPower(g, p) {
    return Math.max(0, ...g.opponents(p).map(q => sum(g.creatures(q).filter(c => !g.kw(c, "defender")), c => Math.max(0, g.power(c)) * (g.kw(c, "double strike") ? 2 : 1))));
  }
  function wipeCast(g, p, keepBest) {
    const hit = c => g.isCreature(c) && !g.kw(c, "indestructible");
    const ours = g.creatures(p).filter(hit).map(c => V(g, c)).sort((a, b) => b - a);
    const lost = sum(keepBest ? ours.slice(1) : ours, v => v);
    const theirs = sum(g.battlefield.filter(c => c.controller !== p && hit(c)), c => V(g, c));
    if (theirs >= 14 && theirs >= lost * 2 + 6) return 25;
    if (incomingPower(g, p) >= p.life * 0.75 && theirs >= lost + 8) return 25;
    return false;
  }

  /* ---------- tokens */
  const TK = {
    spirit: MK.tokenDef({ key: "isperia-spirit-w-flying", name: "Spirit", pt: [1, 1], colors: "W", subtypes: ["Spirit"], keywords: ["flying"] }),
    bird: MK.tokenDef({ key: "isperia-bird-w-flying", name: "Bird", pt: [1, 1], colors: "W", subtypes: ["Bird"], keywords: ["flying"] }),
    faerie: MK.tokenDef({ key: "isperia-faerie-u-flying", name: "Faerie", pt: [1, 1], colors: "U", subtypes: ["Faerie"], keywords: ["flying"] }),
    thopter: MK.tokenDef({ key: "isperia-thopter-flying", name: "Thopter", pt: [1, 1], colors: [], types: ["Artifact", "Creature"], subtypes: ["Thopter"], keywords: ["flying"] }),
    thopterU: MK.tokenDef({ key: "isperia-thopter-u-flying", name: "Thopter", pt: [1, 1], colors: "U", types: ["Artifact", "Creature"], subtypes: ["Thopter"], keywords: ["flying"] }),
    angel: MK.tokenDef({ key: "isperia-angel-w3-flying", name: "Angel", pt: [3, 3], colors: "W", subtypes: ["Angel"], keywords: ["flying"] }),
    pegasus: MK.tokenDef({ key: "isperia-pegasus-w-flying", name: "Pegasus", pt: [1, 1], colors: "W", subtypes: ["Pegasus"], keywords: ["flying"] }),
    catBird: MK.tokenDef({ key: "isperia-catbird-w-flying", name: "Cat Bird", pt: [1, 1], colors: "W", subtypes: ["Cat", "Bird"], keywords: ["flying"] })
  };

  /* ================================================================ commander */
  D({
    name: "Isperia, Supreme Judge", cost: "{2}{W}{W}{U}{U}", type: "Legendary Creature — Sphinx", pt: "6/4",
    keywords: ["flying"],
    text: "Flying\nWhenever a creature attacks you or a planeswalker you control, you may draw a card.",
    triggers: [{
      on: "attacks", optional: "Isperia: draw a card?", ai: "isperiaDraw",
      when: (g, s, ev) => attacksPlayer(g, s.controller, ev.target),
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    // she draws unless the library is nearly empty
    ai: { priority: 8, confirm: (g, p, req) => req.purpose !== "isperiaDraw" || deckOK(p, 10) }
  });

  /* ================================================================ creatures */
  /* Archon of Redemption: the power is read when the creature enters and again when the life is
     gained, so a creature that has left in between still counts (last known information). */
  const archonSeen = new WeakMap();
  D({
    name: "Archon of Redemption", cost: "{3}{W}{W}", type: "Creature — Archon", pt: "3/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Archon of Redemption or another creature you control with flying enters, you may gain life equal to that creature's power.",
    triggers: [{
      on: "enters", optional: "Archon of Redemption: gain life equal to that creature's power?", ai: "archonLife",
      when: (g, s, ev) => {
        if (ev.o.controller !== s.controller || !g.isCreature(ev.o) || !g.kw(ev.o, "flying")) return false;
        archonSeen.set(ev, { zc: ev.o.zc, pow: g.power(ev.o) });
        return true;
      },
      do: (g, s, ev, { p }) => {
        const seen = archonSeen.get(ev) || { zc: -1, pow: 0 };
        const n = ev.o.zone === "battlefield" && ev.o.zc === seen.zc ? g.power(ev.o) : seen.pow;
        if (n > 0) g.gainLife(p, n, s);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Aven Gagglemaster", cost: "{3}{W}{W}", type: "Creature — Bird Warrior", pt: "4/3",
    keywords: ["flying"],
    text: "Flying\nWhen Aven Gagglemaster enters, you gain 2 life for each creature you control with flying.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 2 * myFliers(g, p).length, s) }],
    ai: { priority: 6 }
  });

  D({
    name: "Cartographer's Hawk", cost: "{1}{W}", type: "Creature — Bird", pt: "2/1",
    keywords: ["flying"],
    text: "Flying\nWhen Cartographer's Hawk deals combat damage to a player who controls more lands than you, return it to its owner's hand. If you do, you may search your library for a Plains card, put it onto the battlefield tapped, then shuffle.",
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => ev.src === s && landCount(g, ev.p) > landCount(g, s.controller),
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        g.bounce(s);
        if (s.zone !== "hand") return;   // "if you do"
        const go = await g.ask(p, { type: "confirm", prompt: "Cartographer's Hawk: search your library for a Plains card and put it onto the battlefield tapped?", src: s, purpose: "hawkSearch" });
        if (!go) return;
        await g.search(p, { filter: (g2, c) => isLandCard(c) && c.def.subtypes.includes("Plains"), to: "battlefield", tapped: true, prompt: "Cartographer's Hawk: choose a Plains card", src: s });
      }
    }],
    ai: { priority: 5 }
  });

  D({
    name: "Cloudblazer", cost: "{W}{U}", type: "Creature — Human Scout", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhen Cloudblazer enters, you gain 2 life and draw two cards.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { g.gainLife(p, 2, s); drawLog(g, p, 2, s); } }],
    ai: { priority: 7 }
  });

  /* Diluvian Primordial: one free spell from each opponent's graveyard. The bot only casts what
     helps it: removal with a real target, a board wipe when it is far behind, card draw and the
     like, never counterspells, X spells, tutors or cards another deck's plan is built around. */
  function diluvianScore(g, p, c) {
    const d = c.def, ai = d.ai || {};
    if (!isSpellCard(c) || c.zone !== "graveyard") return -1;
    if (d.costObj.x || ai.never || ai.counter || ai.protection || ai.trick || ai.tutor || ai.plan || ai.option || ai.finisher) return -1;
    if (d.canCast && !safe(() => d.canCast(g, p, c), false)) return -1;
    const specs = (d.spell && d.spell.targets) || [];
    for (const spec of specs) if (!spec.optional && !safe(() => g.targetOptions(p, spec, c).length, 0)) return -1;
    if (d.modes && !ai.mode) return -1;
    if (ai.wipe) return wipeCast(g, p, false) ? 30 : -1;
    if (ai.removal) {
      if (!specs[0]) return -1;
      const { best, score } = bestOpposing(g, p, safe(() => g.targetOptions(p, specs[0], c), []));
      return best && score >= (ai.minThreat || 3) ? 12 + score : -1;
    }
    if (ai.cast) {
      const r = safe(() => ai.cast(g, p, c, { window: "main1" }), false);
      if (r === false) return -1;
      if (typeof r === "number") return Math.min(20, r) * 0.5 + d.mv;
    }
    if (ai.draw && !deckOK(p, 12)) return -1;
    return 4 + d.mv + (ai.priority != null ? ai.priority : 5) * 0.3;
  }
  function diluvianPick(g, p, options) {
    let best = null, bs = 0;
    for (const c of options) { const s = diluvianScore(g, p, c); if (s > bs) { bs = s; best = c; } }
    return best;
  }
  D({
    name: "Diluvian Primordial", cost: "{5}{U}{U}", type: "Creature — Avatar", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Diluvian Primordial enters, for each opponent, you may cast up to one target instant or sorcery card from that player's graveyard without paying its mana cost. If a spell cast this way would be put into a graveyard, exile it instead.",
    note: "The card for each opponent is chosen and cast in turn order as the ability resolves.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        for (const q of g.opponents(p)) {
          if (g.over || p.lost) return;
          const spec = trig({
            kind: "card", optional: true, purpose: "diluvian",
            prompt: `Diluvian Primordial: you may cast an instant or sorcery card from ${q.name}'s graveyard without paying its mana cost`,
            from: () => q.graveyard.filter(isSpellCard)
          });
          const pick = await g.chooseTarget(p, spec, s);
          if (!pick || pick.zone !== "graveyard" || pick.owner !== q) continue;
          await g.castWithoutPaying(p, pick, { exileAfter: true });
        }
      }
    }],
    ai: { priority: 7, target: (g, p, req) => (req.purpose === "diluvian" ? diluvianPick(g, p, req.options) : undefined) }
  });

  D({
    name: "Emeria Angel", cost: "{2}{W}{W}", type: "Creature — Angel", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nLandfall — Whenever a land you control enters, you may create a 1/1 white Bird creature token with flying.",
    triggers: [{
      on: "enters", optional: "Emeria Angel: create a 1/1 white Bird with flying?",
      when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isLand(ev.o),
      do: (g, s, ev, { p }) => g.createToken(p, TK.bird)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Empyrean Eagle", cost: "{1}{W}{U}", type: "Creature — Bird Spirit", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\nOther creatures you control with flying get +1/+1.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && flies(g, o), pt: [1, 1] }],
    ai: { priority: 6 }
  });

  D({
    name: "Faerie Formation", cost: "{4}{U}", type: "Creature — Faerie", pt: "5/4",
    keywords: ["flying"],
    text: "Flying\n{3}{U}: Create a 1/1 blue Faerie creature token with flying. Draw a card.",
    abilities: [{
      label: "Faerie token and draw", cost: "{3}{U}",
      do: (g, s, ctx) => { g.createToken(ctx.p, TK.faerie); drawLog(g, ctx.p, 1, s); },
      ai: { use: (g, p, o, ctx) => sinkUse(g, p, ctx) }
    }],
    ai: { priority: 6 }
  });

  /* Hanged Executioner: exile a real threat at the end of the turn before ours, or when it is about to die anyway. */
  function executionerUse(g, p, o, ctx) {
    const { best, score } = bestOpposing(g, p, oppCreatures(g, p));
    if (!best) return false;
    if (ctx.window === "stack") return doomedByStack(g, p, o) && score >= 3;
    return (ctx.window === "main2" || endBeforeMe(g, p, ctx)) && score >= 7;
  }
  D({
    name: "Hanged Executioner", cost: "{2}{W}", type: "Creature — Spirit", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nWhen Hanged Executioner enters, create a 1/1 white Spirit creature token with flying.\n{3}{W}, Exile Hanged Executioner: Exile target creature.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.spirit) }],
    abilities: [{
      label: "Exile target creature", cost: "{3}{W}", exileSelf: true,
      targets: [{ kind: "creature", purpose: "harm", prompt: "Hanged Executioner: exile target creature" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], s); },
      // "first" so the bot also looks at it while a spell is on the stack
      ai: { first: true, use: (g, p, o, ctx) => executionerUse(g, p, o, ctx) }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Inspired Sphinx", cost: "{5}{U}{U}", type: "Creature — Sphinx", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Inspired Sphinx enters, draw cards equal to the number of opponents you have.\n{3}{U}: Create a 1/1 colorless Thopter artifact creature token with flying.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => drawLog(g, p, g.opponents(p).length, s) }],
    abilities: [{
      label: "Create a 1/1 Thopter", cost: "{3}{U}",
      do: (g, s, ctx) => g.createToken(ctx.p, TK.thopter),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Inspiring Overseer", cost: "{2}{W}", type: "Creature — Angel Cleric", pt: "2/1",
    keywords: ["flying"],
    text: "Flying\nWhen Inspiring Overseer enters, you gain 1 life and draw a card.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { g.gainLife(p, 1, s); drawLog(g, p, 1, s); } }],
    ai: { priority: 7 }
  });

  /* Kangee's Lieutenant. Encore makes one hasty token copy per opponent, each made to attack that
     opponent (the engine's "attacks that player this turn if able"), and sacrifices them at the
     next end step. The copies have to attack this turn, so the bot uses encore before combat, once
     nothing in its hand or command zone wants the mana more. */
  function wantsMana(g, p, c) {
    if (isLandCard(c) || c.def.types.includes("Instant")) return false;
    const ai = c.def.ai || {};
    if (ai.never || ai.cast === false || ai.counter || ai.protection || ai.trick) return false;
    if (!safe(() => g.castOptions(p, c).length, 0)) return false;
    if (typeof ai.cast === "function") {
      const r = safe(() => ai.cast(g, p, c, { window: "main1" }), false);
      if (r === false || (typeof r === "number" && r <= 0)) return false;
    }
    return true;
  }
  function encoreUse(g, p, o, ctx) {
    if (ctx.window !== "main1" || g.active !== p || !g.opponents(p).length) return false;
    return !p.hand.concat(p.command).some(c => wantsMana(g, p, c));
  }
  D({
    name: "Kangee's Lieutenant", cost: "{2}{W}", type: "Creature — Bird Soldier", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nWhenever Kangee's Lieutenant attacks, attacking creatures with flying get +1/+1 until end of turn.\nEncore {5}{W} ({5}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
    triggers: [{ on: "attacks", self: true, do: (g, s) => pumpList(g, s, attackingFliers(g), 1, 1, "Attacking creatures with flying") }],
    gyAbilities: [{
      label: "Encore", cost: "{5}{W}", timing: "sorcery", exileSelf: true,
      do: (g, s, ctx) => {
        const p = ctx.p, opps = g.opponents(p);
        if (!opps.length) return;
        const made = g.copyToken(p, s, { count: opps.length, haste: true, sacEnd: true });
        made.forEach((t, i) => { t.state.mustAttack = opps[i]; });
        if (made.length) g.log(`Each copy attacks ${made.length > 1 ? "a different opponent" : opps[0].name} this turn if able.`, { p, cards: [s.def.name] });
      },
      ai: { first: true, use: encoreUse }
    }],
    ai: { priority: 5 }
  });

  D({
    name: "Kangee, Sky Warden", cost: "{3}{W}{U}", type: "Legendary Creature — Bird Wizard", pt: "3/3",
    keywords: ["flying", "vigilance"],
    text: "Flying, vigilance\nWhenever Kangee attacks, attacking creatures with flying get +2/+0 until end of turn.\nWhenever Kangee blocks, blocking creatures with flying get +0/+2 until end of turn.",
    triggers: [
      { on: "attacks", self: true, do: (g, s) => pumpList(g, s, attackingFliers(g), 2, 0, "Attacking creatures with flying") },
      { on: "blocks", self: true, do: (g, s) => pumpList(g, s, blockingFliers(g), 0, 2, "Blocking creatures with flying") }
    ],
    ai: { priority: 7 }
  });

  const oppMoreLife = (g, s) => g.opponents(s.controller).some(q => q.life > s.controller.life);
  const oppMoreCreatures = (g, s) => g.opponents(s.controller).some(q => g.creatures(q).length > g.creatures(s.controller).length);
  D({
    name: "Linvala, the Preserver", cost: "{4}{W}{W}", type: "Legendary Creature — Angel", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Linvala, the Preserver enters, if an opponent has more life than you, you gain 5 life.\nWhen Linvala enters, if an opponent controls more creatures than you, create a 3/3 white Angel creature token with flying.",
    triggers: [
      { on: "enters", self: true, when: oppMoreLife, intervening: oppMoreLife, do: (g, s, ev, { p }) => g.gainLife(p, 5, s) },
      { on: "enters", self: true, when: oppMoreCreatures, intervening: oppMoreCreatures, do: (g, s, ev, { p }) => g.createToken(p, TK.angel) }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Pilgrim's Eye", cost: "{3}", type: "Artifact Creature — Thopter", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nWhen Pilgrim's Eye enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => g.search(p, { filter: (g2, c) => isLandCard(c) && g2.isBasic(c), to: "hand", prompt: "Pilgrim's Eye: you may search your library for a basic land card", src: s })
    }],
    ai: { priority: 5 }
  });

  /* Remorseful Cleric: sacrificed for value when it is about to die anyway. */
  function clericUse(g, p, o, ctx) {
    if (ctx.window !== "stack" || !doomedByStack(g, p, o)) return false;
    return g.opponents(p).some(q => graveScore(q) >= 3);
  }
  D({
    name: "Remorseful Cleric", cost: "{1}{W}", type: "Creature — Spirit Cleric", pt: "2/1",
    keywords: ["flying"],
    text: "Flying\nSacrifice Remorseful Cleric: Exile all cards from target player's graveyard.",
    abilities: [{
      label: "Sacrifice: exile a graveyard", sacSelf: true,
      targets: [{ kind: "player", purpose: "exileGraveyard", prompt: "Remorseful Cleric: exile all cards from target player's graveyard" }],
      do: (g, s, ctx) => {
        const q = ctx.targets[0];
        if (!ctx.legal[0] || !q || q.lost) return;
        const cards = q.graveyard.slice();
        for (const c of cards) g.moveTo(c, "exile");
        g.log(`${ctx.p.name} exiles ${q.name}'s graveyard (${cards.length} card${cards.length === 1 ? "" : "s"}).`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: { first: true, use: clericUse }
    }],
    ai: { priority: 4, target: (g, p, req) => (req.purpose === "exileGraveyard" ? graveTarget(g, p, req.options) : undefined) }
  });

  /* Sephara: the alternative cost taps four fliers. Before combat that only costs their attack, so the
     bot does it; after combat it would tap its blockers, so then it only pays the full cost. */
  function sepharaCast(g, p, o, { window }) {
    if (window === "main1") return undefined;
    return g.canPay(p, g.spellCost(p, o, {}), {}) ? undefined : false;
  }
  D({
    name: "Sephara, Sky's Blade", cost: "{4}{W}{W}{W}", type: "Legendary Creature — Angel", pt: "7/7",
    keywords: ["flying", "lifelink"],
    text: "You may pay {W} and tap four untapped creatures you control with flying rather than pay this spell's mana cost.\nFlying, lifelink\nOther creatures you control with flying have indestructible.",
    altCosts: [{ label: "Pay {W} and tap four creatures with flying", cost: "{W}", condition: (g, p) => untappedFliers(g, p).length >= 4 }],
    onCast: async (g, p, o, item) => {
      if (item.alt !== 1) return;
      const opts = untappedFliers(g, p);
      let pick = await g.ask(p, { type: "cards", prompt: "Sephara: tap four untapped creatures you control with flying", options: opts, min: Math.min(4, opts.length), max: 4, purpose: "tapCost", src: o });
      pick = (pick || []).filter(c => opts.includes(c)).slice(0, 4);
      for (const c of opts) { if (pick.length >= 4) break; if (!pick.includes(c)) pick.push(c); }
      for (const c of pick) g.tap(c);
      g.log(`${p.name} taps ${pick.map(c => c.def.name).join(", ")} to cast Sephara.`, { p, cards: pick.map(c => c.def.name) });
    },
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && flies(g, o), kw: ["indestructible"] }],
    ai: { priority: 8, cast: sepharaCast }
  });

  D({
    name: "Sharding Sphinx", cost: "{4}{U}{U}", type: "Artifact Creature — Sphinx", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhenever an artifact creature you control deals combat damage to a player, you may create a 1/1 blue Thopter artifact creature token with flying.",
    triggers: [{
      on: "combatDamagePlayer", optional: "Sharding Sphinx: create a 1/1 blue Thopter with flying?",
      when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && g.isCreature(ev.src) && g.isArtifact(ev.src),
      do: (g, s, ev, { p }) => g.createToken(p, TK.thopterU)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Skycat Sovereign", cost: "{W}{U}", type: "Creature — Elemental Cat", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nSkycat Sovereign gets +1/+1 for each other creature you control with flying.\n{2}{W}{U}: Create a 1/1 white Cat Bird creature token with flying.",
    statics: [{
      applies: (g, s, o) => o === s,
      pt: (g, s) => { const n = g.creatures(s.controller).filter(c => c !== s && flies(g, c)).length; return [n, n]; }
    }],
    abilities: [{
      label: "Create a 1/1 Cat Bird", cost: "{2}{W}{U}",
      do: (g, s, ctx) => g.createToken(ctx.p, TK.catBird),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Skyscanner", cost: "{3}", type: "Artifact Creature — Thopter", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nWhen Skyscanner enters, draw a card.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }],
    ai: { priority: 5 }
  });

  D({
    name: "Sphinx of Enlightenment", cost: "{4}{U}{U}", type: "Creature — Sphinx", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Sphinx of Enlightenment enters, target opponent draws a card and you draw three cards.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const q = await g.chooseTarget(p, trig({ kind: "opponent", purpose: "giveCard", prompt: "Sphinx of Enlightenment: target opponent draws a card" }), s);
        if (!q || q.lost) return;   // no legal target: the ability does nothing
        drawLog(g, q, 1, s);
        drawLog(g, p, 3, s);
      }
    }],
    ai: { priority: 7, target: (g, p, req) => (req.purpose === "giveCard" ? weakestOpp(g, p, req.options) : undefined) }
  });

  D({
    name: "Steel-Plume Marshal", cost: "{3}{W}{W}", type: "Creature — Bird Soldier", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever Steel-Plume Marshal attacks, other attacking creatures you control with flying get +2/+2 until end of turn.",
    triggers: [{
      on: "attacks", self: true,
      do: (g, s, ev, { p }) => pumpList(g, s, attackingFliers(g).filter(c => c !== s && c.controller === p), 2, 2, `Other attacking creatures ${p.name} controls with flying`)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Thunderclap Wyvern", cost: "{2}{W}{U}", type: "Creature — Drake", pt: "2/3",
    keywords: ["flash", "flying"],
    text: "Flash\nFlying\nOther creatures you control with flying get +1/+1.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && flies(g, o), pt: [1, 1] }],
    ai: { priority: 7 }
  });

  D({
    name: "Tide Skimmer", cost: "{3}{U}", type: "Creature — Drake", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\nWhenever you attack with two or more creatures with flying, draw a card.",
    triggers: [{
      on: "attack",
      when: (g, s, ev) => ev.p === s.controller && ev.attackers.filter(c => g.kw(c, "flying")).length >= 2,
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Warden of Evos Isle", cost: "{2}{U}", type: "Creature — Bird Wizard", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nCreature spells with flying you cast cost {1} less to cast.",
    statics: [{ costMod: (g, s, card) => (card.def.types.includes("Creature") && card.def.keywords.includes("flying") ? 1 : 0) }],
    ai: { priority: 7 }
  });

  D({
    name: "Windreader Sphinx", cost: "{5}{U}{U}", type: "Creature — Sphinx", pt: "3/7",
    keywords: ["flying"],
    text: "Flying\nWhenever a creature with flying attacks, you may draw a card.",
    triggers: [{
      on: "attacks", optional: "Windreader Sphinx: draw a card?", ai: "windreaderDraw",
      when: (g, s, ev) => g.kw(ev.o, "flying"),
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 7, confirm: (g, p, req) => req.purpose !== "windreaderDraw" || deckOK(p, 10) }
  });

  /* ================================================================ planeswalker */
  /* Gideon Jura. +2 marks the target opponent. At the beginning of combat on that player's next turn,
     each creature they control that can attack has to attack Gideon (the engine's "attacks ... if
     able"); the requirement ends with that combat, or when Gideon leaves. */
  function clearGideonAttacks(g, s) {
    for (const c of g.battlefield) if (c.state && c.state.mustAttack === s) delete c.state.mustAttack;
  }
  function gideonKill(g, p) {
    return bestOpposing(g, p, g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && c.tapped && g.canTarget(p, c) && !g.kw(c, "indestructible")));
  }
  function attackPower(g, q) {
    return sum(g.creatures(q).filter(c => !g.kw(c, "defender")), c => Math.max(0, g.power(c)) * (g.kw(c, "double strike") ? 2 : 1));
  }
  function gideonTarget(g, p, req) {
    if (req.purpose === "gideonTaunt") {
      const opps = req.options.filter(q => g.isPlayer(q) && q !== p);
      return opps.sort((a, b) => attackPower(g, b) - attackPower(g, a))[0];
    }
    if (req.purpose === "harm") return bestOpposing(g, p, req.options.filter(c => !g.isPlayer(c) && !g.kw(c, "indestructible"))).best || undefined;
    return undefined;
  }
  /* The 0: only when a 6/6 attacker finishes an opponent who has nothing untapped to block with. */
  function gideonPlan(g, p, o, ctx) {
    if (ctx.window !== "main1" || o.zone !== "battlefield" || o.controller !== p || o.sick) return null;
    const act = (ctx.actions || []).find(a => a.type === "activate" && a.card === o && a.idx === 2);
    if (!act) return null;
    const open = g.opponents(p).some(q => q.life <= 6 && !g.creatures(q).some(c => !c.tapped));
    return open ? { type: "activate", card: o, idx: 2, maxTries: 1 } : null;
  }
  D({
    name: "Gideon Jura", cost: "{3}{W}{W}", type: "Legendary Planeswalker — Gideon", loyalty: 6,
    text: "+2: During target opponent's next turn, creatures that player controls attack Gideon Jura if able.\n−2: Destroy target tapped creature.\n0: Until end of turn, Gideon Jura becomes a 6/6 Human Soldier creature that's still a planeswalker. Prevent all damage that would be dealt to him this turn.",
    note: "Instead of preventing the damage dealt to him, the 0 ability makes him indestructible until end of turn.",
    abilities: [
      {
        label: "+2: Their creatures attack Gideon", loyalty: 2,
        targets: [{ kind: "opponent", purpose: "gideonTaunt", prompt: "Gideon Jura: during target opponent's next turn, creatures that player controls attack Gideon Jura if able" }],
        do: (g, s, ctx) => {
          const q = ctx.targets[0];
          if (!ctx.legal[0] || !q || q.lost || s.zone !== "battlefield") return;
          (s.state.gideonTaunt || (s.state.gideonTaunt = [])).push({ q, turn: g.turn });
          g.log(`During ${q.name}'s next turn, creatures they control attack Gideon Jura if able.`, { p: ctx.p, cards: [s.def.name] });
        }
      },
      {
        label: "−2: Destroy target tapped creature", loyalty: -2,
        targets: [{ kind: "creature", purpose: "harm", prompt: "Gideon Jura: destroy target tapped creature", filter: (g, o) => !!o.tapped }],
        do: (g, s, ctx) => { const t = ctx.targets[0]; if (ctx.legal[0] && t) g.destroy(t, s); },
        ai: { use: (g, p) => { const { best, score } = gideonKill(g, p); return !!best && score >= 5; } }
      },
      {
        label: "0: Becomes a 6/6 creature", loyalty: 0,
        do: (g, s, ctx) => {
          if (s.zone !== "battlefield") return;
          s.state.animated = { turn: g.turn, pt: [6, 6], subtypes: ["Human", "Soldier"] };
          g.grant([s], ["indestructible"]);
          g.bump();
          g.log(`Gideon Jura becomes a 6/6 Human Soldier creature until end of turn.`, { p: ctx.p, cards: [s.def.name] });
        }
      }
    ],
    triggers: [
      {
        on: "beginCombat",
        when: (g, s, ev) => (s.state.gideonTaunt || []).some(m => m.q === ev.p && m.turn < g.turn),
        do: (g, s, ev) => {
          const q = ev.p;
          s.state.gideonTaunt = (s.state.gideonTaunt || []).filter(m => m.q !== q);
          if (s.zone !== "battlefield" || q.lost) return;
          const forced = g.creatures(q).filter(c => g.canAttack(c, q) && !c.state.mustAttack);
          if (!forced.length) return;
          for (const c of forced) c.state.mustAttack = s;
          g.log(`${forced.length === 1 ? forced[0].def.name + " has" : forced.length + " creatures have"} to attack Gideon Jura this combat.`, { p: q, cards: [s.def.name] });
          // a safety net if Gideon's controller leaves the game mid-combat (no trigger of his fires then)
          g.delayed.push({ at: "endStep", once: true, turn: g.turn, player: q, controller: q, src: { def: { name: "Gideon Jura" }, controller: q }, do: g2 => clearGideonAttacks(g2, s) });
        }
      },
      { on: "endCombat", do: (g, s) => clearGideonAttacks(g, s) },
      // a turn without combat still uses up the +2
      { on: "endStep", when: (g, s, ev) => (s.state.gideonTaunt || []).some(m => m.q === ev.p && m.turn < g.turn), do: (g, s, ev) => { s.state.gideonTaunt = (s.state.gideonTaunt || []).filter(m => m.q !== ev.p); } },
      { on: "leaves", self: true, do: (g, s) => clearGideonAttacks(g, s) }
    ],
    ai: { priority: 8, plan: gideonPlan, target: gideonTarget }
  });

  /* ================================================================ artifacts */
  D({
    name: "Azorius Signet", cost: "{2}", type: "Artifact",
    text: "{1}, {T}: Add {W}{U}.",
    mana: [{ tap: true, cost: "{1}", produce: "WU" }],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Talisman of Progress", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{T}: Add {W} or {U}. Talisman of Progress deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["W", "U"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Commander's Sphere", cost: "{3}", type: "Artifact",
    text: "{T}: Add one mana of any color in your commander's color identity.\nSacrifice Commander's Sphere: Draw a card.",
    mana: [{ tap: true, produce: "any" }],
    abilities: [{
      label: "Sacrifice: draw a card", sacSelf: true,
      do: (g, s, ctx) => drawLog(g, ctx.p, 1, s),
      ai: {
        first: true,
        use: (g, p, o, ctx) => (ctx.window === "stack" && doomedByStack(g, p, o)) ||
          (endBeforeMe(g, p, ctx) && landCount(g, p) >= 8 && p.hand.length <= 1 && deckOK(p))
      }
    }],
    ai: { ramp: true, priority: 7 }
  });
  D({
    name: "Hedron Archive", cost: "{4}", type: "Artifact",
    text: "{T}: Add {C}{C}.\n{2}, {T}, Sacrifice Hedron Archive: Draw two cards.",
    mana: [{ tap: true, produce: "CC" }],
    abilities: [{
      label: "Sacrifice: draw two cards", cost: "{2}", tap: true, sacSelf: true,
      do: (g, s, ctx) => drawLog(g, ctx.p, 2, s),
      ai: {
        first: true,
        use: (g, p, o, ctx) => (ctx.window === "stack" && doomedByStack(g, p, o)) ||
          (endBeforeMe(g, p, ctx) && landCount(g, p) >= 8 && p.hand.length <= 2 && deckOK(p, 12))
      }
    }],
    ai: { ramp: true, priority: 6 }
  });
  D({
    name: "Sky Diamond", cost: "{2}", type: "Artifact",
    text: "Sky Diamond enters tapped.\n{T}: Add {U}.",
    etbTapped: true,
    mana: [{ tap: true, produce: "U" }],
    ai: { ramp: true, priority: 6 }
  });
  D({
    name: "Thought Vessel", cost: "{2}", type: "Artifact",
    text: "You have no maximum hand size.\n{T}: Add {C}.",
    statics: [{ noMaxHand: true }],
    mana: [{ tap: true, produce: "C" }],
    ai: { ramp: true, priority: 7 }
  });

  /* ================================================================ enchantments */
  const ORING_SPEC = trig({ kind: "nonland", other: true, purpose: "harm", prompt: "Oblivion Ring: exile another target nonland permanent" });
  D({
    name: "Oblivion Ring", cost: "{2}{W}", type: "Enchantment",
    text: "When Oblivion Ring enters, exile another target nonland permanent.\nWhen Oblivion Ring leaves the battlefield, return the exiled card to the battlefield under its owner's control.",
    triggers: [
      { on: "enters", self: true, do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, ORING_SPEC, s); if (t) exileLinked(g, s, t); } },
      { on: "leaves", self: true, do: (g, s) => returnLinked(g, s) }
    ],
    ai: { priority: 6, cast: etbRemovalCast(ORING_SPEC, 5) }
  });

  const BANISH_SPEC = trig({ kind: "nonland", opp: true, purpose: "harm", prompt: "Banishing Light: exile target nonland permanent an opponent controls" });
  D({
    name: "Banishing Light", cost: "{2}{W}", type: "Enchantment",
    text: "When Banishing Light enters, exile target nonland permanent an opponent controls until Banishing Light leaves the battlefield.",
    triggers: [
      { on: "enters", self: true, do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, BANISH_SPEC, s); if (t) exileLinked(g, s, t, true); } },
      { on: "leaves", self: true, do: (g, s) => returnLinked(g, s) }
    ],
    ai: { priority: 6, cast: etbRemovalCast(BANISH_SPEC, 5) }
  });

  D({
    name: "Coastal Piracy", cost: "{2}{U}{U}", type: "Enchantment",
    text: "Whenever a creature you control deals combat damage to an opponent, you may draw a card.",
    triggers: [{
      on: "combatDamagePlayer", optional: "Coastal Piracy: draw a card?", ai: "piracyDraw",
      when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && ev.p !== s.controller && g.isCreature(ev.src),
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 6, minCreatures: 2, confirm: (g, p, req) => req.purpose !== "piracyDraw" || deckOK(p, 10) }
  });

  D({
    name: "Ever-Watching Threshold", cost: "{2}{U}", type: "Enchantment",
    text: "Whenever an opponent attacks you and/or planeswalkers you control with one or more creatures, draw a card.",
    triggers: [{
      on: "attack",
      when: (g, s, ev) => ev.p !== s.controller && (ev.attackers || []).some(a => a.combat && attacksPlayer(g, s.controller, a.combat.attacking)),
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Favorable Winds", cost: "{1}{U}", type: "Enchantment",
    text: "Creatures you control with flying get +1/+1.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && flies(g, o), pt: [1, 1] }],
    ai: { priority: 6, minCreatures: 2 }
  });

  /* Gravitational Shift is symmetric: cast it when it helps us more than the table. */
  function shiftGood(g, p) {
    let us = 0, them = 0;
    for (const c of g.creatures()) {
      const up = g.kw(c, "flying") ? 2 : -Math.min(2, Math.max(0, g.power(c)));
      if (c.controller === p) us += up; else them += up;
    }
    return myFliers(g, p).length >= 2 && us - them / Math.max(1, g.opponents(p).length) >= 3;
  }
  D({
    name: "Gravitational Shift", cost: "{3}{U}{U}", type: "Enchantment",
    text: "Creatures with flying get +2/+0.\nCreatures without flying get -2/-0.",
    statics: [{ applies: (g, s, o) => g.isCreature(o), pt: (g, s, o) => (flies(g, o) ? [2, 0] : [-2, 0]) }],
    ai: { priority: 6, cast: (g, p) => (shiftGood(g, p) ? undefined : false) }
  });

  /* Soul Snare: on the biggest attacker coming at us or Gideon. */
  function snareUse(g, p, o, ctx) {
    if (ctx.window !== "combat") return false;
    const at = attackersAt(g, p);
    if (!at.length) return false;
    const best = at.slice().sort((a, b) => TH(g, b, p) - TH(g, a, p))[0];
    const dmg = sum(at.filter(a => !a.combat.wasBlocked && g.isPlayer(a.combat.attacking)), a => Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1));
    return TH(g, best, p) >= 7 || (!best.combat.wasBlocked && g.power(best) >= 5) || dmg >= p.life;
  }
  D({
    name: "Soul Snare", cost: "{W}", type: "Enchantment",
    text: "{W}, Sacrifice Soul Snare: Exile target creature that's attacking you or a planeswalker you control.",
    abilities: [{
      label: "Exile an attacking creature", cost: "{W}", sacSelf: true,
      targets: [{ kind: "creature", purpose: "harm", prompt: "Soul Snare: exile target creature that's attacking you or a planeswalker you control", filter: (g, o, p) => !!(o.combat && o.combat.attacking) && attacksPlayer(g, p, o.combat.attacking) }],
      do: (g, s, ctx) => { if (ctx.legal[0] && ctx.targets[0]) g.exile(ctx.targets[0], s); },
      ai: { use: snareUse }
    }],
    ai: { priority: 5, target: bestAttackerTarget }
  });

  const INSIGHT_SPEC = { kind: "creature", purpose: "help", prompt: "Staggering Insight: enchant target creature" };
  D({
    name: "Staggering Insight", cost: "{W}{U}", type: "Enchantment — Aura",
    aura: true, enchant: "creature", targets: [INSIGHT_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, INSIGHT_SPEC, o).length > 0,
    text: "Enchant creature\nEnchanted creature gets +1/+1 and has lifelink and \"Whenever this creature deals combat damage to a player, draw a card.\"",
    note: "The enchanted creature's draw ability is shown on Staggering Insight.",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 1], kw: ["lifelink"] }],
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => !!s.attachedTo && ev.src === s.attachedTo,
      do: (g, s, ev) => { if (!ev.src.controller.lost) drawLog(g, ev.src.controller, 1, s); }
    }],
    ai: {
      priority: 6,
      cast: (g, p, o) => (auraHost(g, p, g.targetOptions(p, INSIGHT_SPEC, o)) ? undefined : false),
      target: (g, p, req) => (req.purpose === "help" ? auraHost(g, p, req.options) || undefined : undefined)
    }
  });

  D({
    name: "True Conviction", cost: "{3}{W}{W}{W}", type: "Enchantment",
    text: "Creatures you control have double strike and lifelink.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["double strike", "lifelink"] }],
    ai: { priority: 8, minCreatures: 2 }
  });

  const VOW_SPEC = { kind: "creature", you: true, purpose: "help", prompt: "Vow of Duty: enchant target creature you control" };
  D({
    name: "Vow of Duty", cost: "{2}{W}", type: "Enchantment — Aura",
    aura: true, enchant: "creature", targets: [VOW_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, VOW_SPEC, o).length > 0,
    text: "Enchant creature\nEnchanted creature gets +2/+2, has vigilance, and can't attack you or planeswalkers you control.",
    note: "It can only enchant a creature you control, so the attack restriction never comes up.",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [2, 2], kw: ["vigilance"] }],
    ai: {
      priority: 4,
      cast: (g, p, o) => (auraHost(g, p, g.targetOptions(p, VOW_SPEC, o)) ? undefined : false),
      target: (g, p, req) => (req.purpose === "help" ? auraHost(g, p, req.options) || undefined : undefined)
    }
  });

  /* ================================================================ instants */
  const anySpell = prompt => ({ kind: "spell", purpose: "counter", prompt });
  const counterIt = (g, ctx) => { const it = ctx.targets[0]; return !!(ctx.legal[0] && it && g.stack.includes(it) && g.counterSpell(it, ctx.o)); };

  D({
    name: "Absorb", cost: "{W}{U}{U}", type: "Instant",
    text: "Counter target spell. You gain 3 life.",
    spell: {
      targets: [anySpell("Absorb: counter target spell")],
      do: (g, ctx) => { if (!ctx.legal[0]) return; counterIt(g, ctx); g.gainLife(ctx.p, 3, ctx.o); }
    },
    ai: { counter: true, counterPlan: true, plan: counterPlan, priority: 7 }
  });

  D({
    name: "Aetherize", cost: "{3}{U}", type: "Instant",
    text: "Return all attacking creatures to their owner's hand.",
    spell: {
      do: (g, ctx) => {
        const list = g.combat ? g.combat.attackers.filter(a => a.zone === "battlefield") : [];
        g.log(`Aetherize returns ${list.length} attacking creature${list.length === 1 ? "" : "s"} to ${list.length === 1 ? "its owner's hand" : "their owners' hands"}.`, { p: ctx.p, cards: ["Aetherize"], kind: "big" });
        g.quiet = (g.quiet || 0) + 1;
        try { for (const o of list) g.bounce(o); } finally { g.quiet = Math.max(0, g.quiet - 1); }
      }
    },
    ai: {
      priority: 9,         // kept in hand when discarding
      cast: () => false,   // only in combat, below
      combat: (g, p) => {
        const c = g.combat;
        if (!c || c.attacker === p) return false;
        const atMe = c.attackers.filter(a => a.zone === "battlefield" && a.combat && g.defenderOf(a.combat.attacking) === p && !a.combat.wasBlocked);
        const dmg = sum(atMe, a => Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1));
        return dmg >= p.life || dmg >= 12 || (atMe.length >= 4 && dmg >= 8);
      }
    }
  });

  /* Condemn: on an attacker coming at us that matters. */
  const condemnWanted = (g, p) => attackersAt(g, p).some(a => TH(g, a, p) >= 7 || (!a.combat.wasBlocked && g.power(a) >= 5));
  D({
    name: "Condemn", cost: "{W}", type: "Instant",
    text: "Put target attacking creature on the bottom of its owner's library. Its controller gains life equal to its toughness.",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Condemn: put target attacking creature on the bottom of its owner's library", filter: (g, o) => !!(o.combat && o.combat.attacking) }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t || t.zone !== "battlefield") return;
        const q = t.controller, n = Math.max(0, g.toughness(t));
        g.log(`${t.def.name} goes to the bottom of ${t.owner.name}'s library.`, { p: ctx.p, cards: [t.def.name] });
        g.tuck(t, true);
        g.gainLife(q, n, ctx.o);
      }
    },
    ai: { removal: true, minThreat: 4, priority: 7, combat: (g, p) => condemnWanted(g, p), target: bestAttackerTarget }
  });

  /* Counterspell is defined in decks-urdragon.js. */

  /* Crush Contraband: "choose one or both" is three modes here (artifact, enchantment, both). */
  const CC_ART = { kind: "artifact", opp: true, purpose: "harm", prompt: "Crush Contraband: exile target artifact an opponent controls" };
  const CC_ENC = { kind: "enchantment", opp: true, purpose: "harm", prompt: "Crush Contraband: exile target enchantment an opponent controls" };
  const hasTarget = spec => (g, p, o) => g.targetOptions(p, spec, o).length > 0;
  function crushTargets(g, p, o) {
    return { a: bestOpposing(g, p, g.targetOptions(p, CC_ART, o)), e: bestOpposing(g, p, g.targetOptions(p, CC_ENC, o)) };
  }
  const exileEach = (g, ctx) => ctx.targets.forEach((t, i) => { if (ctx.legal[i] && t && t.zone === "battlefield") g.exile(t, ctx.o); });
  D({
    name: "Crush Contraband", cost: "{3}{W}", type: "Instant",
    text: "Choose one or both —\n• Exile target artifact an opponent controls.\n• Exile target enchantment an opponent controls.",
    canCast: (g, p, o) => hasTarget(CC_ART)(g, p, o) || hasTarget(CC_ENC)(g, p, o),
    modes: [
      { label: "Exile target artifact an opponent controls", canChoose: hasTarget(CC_ART), targets: [CC_ART], do: exileEach },
      { label: "Exile target enchantment an opponent controls", canChoose: hasTarget(CC_ENC), targets: [CC_ENC], do: exileEach },
      { label: "Both", canChoose: (g, p, o) => hasTarget(CC_ART)(g, p, o) && hasTarget(CC_ENC)(g, p, o), targets: [CC_ART, CC_ENC], do: exileEach }
    ],
    ai: {
      priority: 5,
      cast: (g, p, o) => {
        const { a, e } = crushTargets(g, p, o);
        const top = Math.max(a.best ? a.score : -1, e.best ? e.score : -1);
        const both = a.best && e.best && a.best !== e.best && Math.min(a.score, e.score) >= 4;
        return top >= 6 || both ? 16 + top * 0.5 : false;
      },
      mode: (g, p, o) => {
        const { a, e } = crushTargets(g, p, o);
        if (a.best && e.best && a.best !== e.best && Math.min(a.score, e.score) >= 3) return 2;
        return (a.best ? a.score : -1) >= (e.best ? e.score : -1) ? 0 : 1;
      },
      target: (g, p, req) => (req.purpose === "harm" ? bestOpposing(g, p, req.options).best || undefined : undefined)
    }
  });

  D({
    name: "Disenchant", cost: "{1}{W}", type: "Instant",
    text: "Destroy target artifact or enchantment.",
    spell: {
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Disenchant: destroy target artifact or enchantment" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (ctx.legal[0] && t) g.destroy(t, ctx.o); }
    },
    ai: { removal: true, minThreat: 5, priority: 5 }
  });

  D({
    name: "Midnight Haunting", cost: "{2}{W}", type: "Instant",
    text: "Create two 1/1 white Spirit creature tokens with flying.",
    spell: { do: (g, ctx) => g.createToken(ctx.p, TK.spirit, { count: 2 }) },
    ai: { priority: 5, instantEnd: true }
  });

  D({
    name: "Negate", cost: "{1}{U}", type: "Instant",
    text: "Counter target noncreature spell.",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Negate: counter target noncreature spell", filter: (g, it) => !it.o.def.types.includes("Creature") }],
      do: (g, ctx) => { counterIt(g, ctx); }
    },
    ai: { counter: true, counterPlan: true, plan: counterPlan, priority: 6 }
  });

  /* Rally of Wings: after blocks, when +2/+2 on our fliers adds real damage or wins a fight. */
  function rallyWanted(g, p) {
    const c = g.combat;
    if (!c) return false;
    const fightSaved = (x, inc) => { const tough = g.toughness(x) - x.damage; return inc >= tough && inc < tough + 2 && V(g, x) >= 3; };
    if (c.attacker === p) {
      const att = c.attackers.filter(a => a.zone === "battlefield" && a.controller === p && a.combat);
      const fly = att.filter(a => g.kw(a, "flying"));
      const open = fly.filter(a => !a.combat.wasBlocked && g.isPlayer(a.combat.attacking));
      if (open.length >= 2) return true;
      // lethal on a defender thanks to the pump
      for (const q of new Set(att.filter(a => !a.combat.wasBlocked && g.isPlayer(a.combat.attacking)).map(a => a.combat.attacking))) {
        const hit = att.filter(a => !a.combat.wasBlocked && a.combat.attacking === q);
        const mult = a => (g.kw(a, "double strike") ? 2 : 1);
        const now = sum(hit, a => Math.max(0, g.power(a)) * mult(a));
        const more = sum(hit.filter(a => g.kw(a, "flying")), a => 2 * mult(a));
        if (now < q.life && now + more >= q.life) return true;
      }
      return fly.some(a => a.combat.wasBlocked && !a.combat.blockedBy.some(b => g.kw(b, "deathtouch")) &&
        fightSaved(a, sum(a.combat.blockedBy.filter(b => b.zone === "battlefield"), b => Math.max(0, g.power(b)))));
    }
    // defending: a flier of ours that dies blocking now and lives with +2/+2
    return g.creatures(p).some(b => b.combat && b.combat.blocking && g.kw(b, "flying") && b.combat.blocking.zone === "battlefield" &&
      !g.kw(b.combat.blocking, "deathtouch") && fightSaved(b, Math.max(0, g.power(b.combat.blocking)) * (g.kw(b.combat.blocking, "double strike") ? 2 : 1)));
  }
  D({
    name: "Rally of Wings", cost: "{1}{W}", type: "Instant",
    text: "Untap all creatures you control. Creatures you control with flying get +2/+2 until end of turn.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        for (const c of g.creatures(p)) g.untap(c);
        const list = myFliers(g, p);
        if (list.length) g.pump(list, 2, 2);
        g.log(`${p.name} untaps their creatures, and their creatures with flying get +2/+2 until end of turn.`, { p, cards: ["Rally of Wings"] });
      }
    },
    ai: { priority: 6, cast: () => false, combat: (g, p) => rallyWanted(g, p) }
  });

  /* Sphinx's Revelation: at the end of the turn before ours, with X of 3 or more. */
  function revelationPlan(g, p, o, ctx) {
    if (o.zone !== "hand" || !endBeforeMe(g, p, ctx)) return null;
    const act = (ctx.actions || []).find(a => a.type === "cast" && a.card === o);
    if (!act) return null;
    const x = Math.min(act.xMax, Math.max(0, p.library.length - 8));
    if (x < 3 && !(x >= 2 && p.life <= 12)) return null;
    return { type: "cast", card: o, x };
  }
  D({
    name: "Sphinx's Revelation", cost: "{X}{W}{U}{U}", type: "Instant",
    text: "You gain X life and draw X cards.",
    spell: { do: (g, ctx) => { g.gainLife(ctx.p, ctx.x, ctx.o); if (ctx.x > 0) drawLog(g, ctx.p, ctx.x, ctx.o); } },
    ai: { priority: 6, draw: true, never: true, plan: revelationPlan }
  });

  /* ================================================================ sorceries */
  /* Cleansing Nova: creatures when the board is lost, else artifacts and enchantments when the
     table's are worth far more than ours (our Oblivion Ring and Banishing Light would let go). */
  function novaArtifacts(g, p) {
    const hit = o => (g.isArtifact(o) || g.isEnchantment(o)) && !g.isLand(o) && !g.kw(o, "indestructible");
    const held = o => sum((o.linkedExile || []).filter(l => l.card.zone === "exile" && l.card.zc === l.zc), l => 6);
    const ours = sum(g.battlefield.filter(o => o.controller === p && hit(o)), o => V(g, o) + held(o));
    const theirs = sum(g.battlefield.filter(o => o.controller !== p && hit(o)), o => TH(g, o, p));
    return theirs >= 14 && theirs >= ours * 2 + 4;
  }
  D({
    name: "Cleansing Nova", cost: "{3}{W}{W}", type: "Sorcery",
    text: "Choose one —\n• Destroy all creatures.\n• Destroy all artifacts and enchantments.",
    modes: [
      {
        label: "Destroy all creatures",
        do: (g, ctx) => {
          const n = g.destroyAll(g.creatures(), ctx.o);
          g.log(`Cleansing Nova destroys ${n} creature${n === 1 ? "" : "s"}.`, { p: ctx.p, cards: ["Cleansing Nova"], kind: "big" });
        }
      },
      {
        label: "Destroy all artifacts and enchantments",
        do: (g, ctx) => {
          const n = g.destroyAll(g.battlefield.filter(o => g.isArtifact(o) || g.isEnchantment(o)), ctx.o);
          g.log(`Cleansing Nova destroys ${n} artifact${n === 1 ? "" : "s"} and enchantment${n === 1 ? "" : "s"}.`, { p: ctx.p, cards: ["Cleansing Nova"], kind: "big" });
        }
      }
    ],
    ai: {
      priority: 4, wipe: true,
      cast: (g, p) => (wipeCast(g, p, false) ? 25 : novaArtifacts(g, p) ? 18 : false),
      mode: (g, p) => (wipeCast(g, p, false) ? 0 : 1)
    }
  });

  D({
    name: "Storm Herd", cost: "{8}{W}{W}", type: "Sorcery",
    text: "Create X 1/1 white Pegasus creature tokens with flying, where X is your life total.",
    spell: { do: (g, ctx) => { const n = Math.max(0, ctx.p.life); if (n) g.createToken(ctx.p, TK.pegasus, { count: n }); } },
    ai: { priority: 9, cast: (g, p) => (p.life >= 5 ? undefined : false) }
  });

  /* Time Wipe keeps our best creature: judge the wipe without it. */
  D({
    name: "Time Wipe", cost: "{2}{W}{W}{U}", type: "Sorcery",
    text: "Return a creature you control to its owner's hand, then destroy all other creatures.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const own = g.creatures(p);
        let keep = null;
        if (own.length) {
          keep = await g.ask(p, { type: "target", prompt: "Time Wipe: return a creature you control to its owner's hand", options: own, purpose: "timeWipe", src: ctx.o });
          if (!keep || !own.includes(keep)) keep = own[0];
          g.bounce(keep);
        }
        const list = g.creatures().filter(c => c !== keep);
        const n = g.destroyAll(list, ctx.o);
        g.log(`Time Wipe destroys ${n} creature${n === 1 ? "" : "s"}.`, { p, cards: ["Time Wipe"], kind: "big" });
      }
    },
    ai: {
      priority: 4, wipe: true, cast: (g, p) => wipeCast(g, p, true),
      target: (g, p, req) => (req.purpose === "timeWipe" ? req.options.slice().sort((a, b) => (b.isCommander - a.isCommander) || (V(g, b) - V(g, a)))[0] : undefined)
    }
  });

  D({
    name: "Winged Words", cost: "{2}{U}", type: "Sorcery",
    text: "This spell costs {1} less to cast if you control a creature with flying.\nDraw two cards.",
    costReduce: (g, p) => (g.creatures(p).some(c => g.kw(c, "flying")) ? 1 : 0),
    spell: { do: (g, ctx) => drawLog(g, ctx.p, 2, ctx.o) },
    ai: { priority: 6, draw: true }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const WU = ["W", "U"];
  const gainOnEnter = n => ({ on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, n, s) });
  const plainsOrIsland = o => o.def.subtypes.includes("Plains") || o.def.subtypes.includes("Island");

  land("Coastal Tower", { text: "Coastal Tower enters tapped.\n{T}: Add {W} or {U}.", etbTapped: true, mana: [{ tap: true, produce: WU }] });
  land("Meandering River", { text: "Meandering River enters tapped.\n{T}: Add {W} or {U}.", etbTapped: true, mana: [{ tap: true, produce: WU }] });
  land("Tranquil Cove", { text: "Tranquil Cove enters tapped.\nWhen Tranquil Cove enters, you gain 1 life.\n{T}: Add {W} or {U}.", etbTapped: true, triggers: [gainOnEnter(1)], mana: [{ tap: true, produce: WU }] });
  land("Sejiri Refuge", { text: "Sejiri Refuge enters tapped.\nWhen Sejiri Refuge enters, you gain 1 life.\n{T}: Add {W} or {U}.", etbTapped: true, triggers: [gainOnEnter(1)], mana: [{ tap: true, produce: WU }] });
  land("Temple of Enlightenment", {
    text: "Temple of Enlightenment enters tapped.\nWhen Temple of Enlightenment enters, scry 1.\n{T}: Add {W} or {U}.",
    etbTapped: true,
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => scry1(g, p, s) }],
    mana: [{ tap: true, produce: WU }],
    ai: { confirm: scryConfirm }
  });
  land("Prairie Stream", {
    type: "Land — Plains Island",
    text: "({T}: Add {W} or {U}.)\nPrairie Stream enters tapped unless you control two or more basic lands.",
    etbTapped: (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x) && g.isBasic(x)).length < 2,
    mana: [{ tap: true, produce: WU }]
  });
  land("Port Town", {
    text: "As Port Town enters, you may reveal a Plains or Island card from your hand. If you don't, Port Town enters tapped.\n{T}: Add {W} or {U}.",
    note: "You reveal a Plains or Island card automatically when you have one.",
    etbTapped: (g, o) => !o.controller.hand.some(c => c !== o && plainsOrIsland(c)),
    mana: [{ tap: true, produce: WU }]
  });
  /* Moorland Haunt: the creature card exiled is the cheapest one. */
  const hauntPick = (g, p, req) => (req.purpose === "hauntExile" ? req.options.slice().sort((a, b) => a.def.mv - b.def.mv)[0] : undefined);
  land("Moorland Haunt", {
    text: "{T}: Add {C}.\n{W}{U}, {T}, Exile a creature card from your graveyard: Create a 1/1 white Spirit creature token with flying.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Exile a creature card: 1/1 Spirit", cost: "{W}{U}", tap: true,
      condition: (g, o, p) => p.graveyard.some(c => c.def.types.includes("Creature")),
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const opts = p.graveyard.filter(c => c.def.types.includes("Creature"));
        if (!opts.length) return;
        let pick = await g.ask(p, { type: "target", prompt: "Moorland Haunt: exile a creature card from your graveyard", options: opts, src: s, purpose: "hauntExile" });
        if (!opts.includes(pick)) pick = opts[0];
        g.moveTo(pick, "exile");
        g.log(`${p.name} exiles ${pick.def.name} from their graveyard.`, { p, cards: [pick.def.name] });
        g.createToken(p, TK.spirit);
      },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) }
    }],
    ai: { target: hauntPick }
  });

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "isperia", name: "Isperia", title: "Isperia, Supreme Judge", commander: "Isperia, Supreme Judge",
    identity: ["W", "U"], bracket: 2, precon: "First Flight (Starter Commander Decks, 2022)", aggression: 0.55,
    style: "Azorius fliers",
    blurb: "Angels, Sphinxes and Thopters take to the air while Isperia draws a card whenever a creature attacks her player, Sephara makes the other fliers indestructible and True Conviction gives the whole flock double strike and lifelink.",
    watch: ["Gideon Jura", "True Conviction", "Sephara, Sky's Blade", "Kangee, Sky Warden", "Storm Herd"],
    list: (function () {
      const singles = [
        // creatures (26): the retail list, with Inspiring Overseer and Linvala in for Jubilant Skybonder
        // and Angler Turtle
        "Archon of Redemption", "Aven Gagglemaster", "Cartographer's Hawk", "Cloudblazer", "Diluvian Primordial",
        "Emeria Angel", "Empyrean Eagle", "Faerie Formation", "Hanged Executioner", "Inspired Sphinx",
        "Inspiring Overseer", "Kangee's Lieutenant", "Kangee, Sky Warden", "Linvala, the Preserver", "Pilgrim's Eye",
        "Remorseful Cleric", "Sephara, Sky's Blade", "Sharding Sphinx", "Skycat Sovereign", "Skyscanner",
        "Sphinx of Enlightenment", "Steel-Plume Marshal", "Thunderclap Wyvern", "Tide Skimmer", "Warden of Evos Isle",
        "Windreader Sphinx",
        // planeswalker (1)
        "Gideon Jura",
        // instants (12): Midnight Haunting in for Migratory Route
        "Absorb", "Aetherize", "Condemn", "Counterspell", "Crush Contraband", "Disenchant", "Generous Gift",
        "Midnight Haunting", "Negate", "Rally of Wings", "Sphinx's Revelation", "Swords to Plowshares",
        // sorceries (4)
        "Cleansing Nova", "Storm Herd", "Time Wipe", "Winged Words",
        // artifacts (8)
        "Arcane Signet", "Azorius Signet", "Commander's Sphere", "Hedron Archive", "Sky Diamond", "Sol Ring",
        "Talisman of Progress", "Thought Vessel",
        // enchantments (10): Coastal Piracy in for Bident of Thassa, plus Oblivion Ring
        "Banishing Light", "Coastal Piracy", "Ever-Watching Threshold", "Favorable Winds", "Gravitational Shift",
        "Oblivion Ring", "Soul Snare", "Staggering Insight", "True Conviction", "Vow of Duty",
        // lands (9 + 15 Plains + 14 Islands)
        "Coastal Tower", "Command Tower", "Meandering River", "Moorland Haunt", "Port Town", "Prairie Stream",
        "Sejiri Refuge", "Temple of Enlightenment", "Tranquil Cove"
      ];
      const list = singles.slice();
      for (let i = 0; i < 15; i++) list.push("Plains");
      for (let i = 0; i < 14; i++) list.push("Island");
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
