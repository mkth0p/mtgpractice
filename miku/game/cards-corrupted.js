/* Corrupted Miku (Shalai, Voice of Plenty, "Miku, Voice Over All"): the Bracket 4 Selesnya combo deck
   a player can pilot from the Play tab. This file defines the cards no other deck has, the deck list,
   and the coach: live tips about what to look for, read by game-ui.js while you play it.
   Card text follows the printed Oracle text. Where the engine simplifies a card, its `note` says how.
   It loads right after cards-miku.js, so its Cavern of Souls (which asks for a creature type) is the
   one every deck uses. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const D = MK.defineOnce, T = MK.T;

  /* ---------- small helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const isType = (c, t) => c.def.types.includes(t);
  const isCreatureCard = c => isType(c, "Creature");
  const isGreen = c => (c.def.colors || []).includes("G");
  const legendaryCreatures = (g, p) => g.controlled(p, o => g.isCreature(o) && o.def.legendary).length;
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const basePower = (g, o) => { const d = o.def; let b = d.pt ? d.pt[0] : 0; if (d.cda && o.zone === "battlefield") { const r = d.cda(g, o); if (r[0] != null) b = r[0]; } if (o.state.earth) b = 0; return b; };
  const opponentsTurn = s => g => g.active !== s.controller;
  /* Evoke: an alternative cost that exiles a card of a color from your hand, then the creature is
     sacrificed when it enters (after its enters ability, the order a player picks). */
  const evoke = color => ({
    altCosts: [{ label: `Evoke (exile a ${MK.COLOR_NAME[color]} card from your hand)`, cost: "", exileFromHand: { filter: (g, c) => (c.def.colors || []).includes(color), prompt: `Evoke: exile a ${MK.COLOR_NAME[color]} card from your hand` } }],
    onResolve: async (g, p, o, item) => {
      if (item.alt !== 1) return;
      g.pending.unshift({ src: o, controller: p, ev: {}, tr: { do: async g2 => { if (o.zone === "battlefield") { log(g2, `${o.def.name} was evoked and is sacrificed.`, p, [o.def.name]); g2.sacrifice(o); } } } });
    }
  });
  /* "Your opponents can't cast spells during your turn." */
  const quietTurn = { cantCast: (g, s, p) => g.active === s.controller && p !== s.controller };

  T.warriorR = MK.tokenDef({ key: "warrior-r", name: "Warrior", pt: [1, 1], colors: "R", subtypes: ["Warrior"] });
  T.sagaConstruct = MK.tokenDef({
    key: "construct-saga", name: "Construct", types: ["Artifact", "Creature"], subtypes: ["Construct"], pt: [0, 0], colors: [],
    text: "This token gets +1/+1 for each artifact you control.",
    cda: (g, o) => { const n = g.controlled(o.controller, x => g.isArtifact(x)).length; return [n, n]; }
  });

  /* ================================================================ creatures */
  D({
    name: "Delighted Halfling", cost: "{G}", type: "Creature — Halfling Citizen", pt: "1/2",
    note: "A legendary spell paid for with its colored mana can't be countered.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => !!card && card.def.legendary, after: (g, o) => { o.state.legendMana = g.turn; } }],
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && s.state.legendMana === g.turn && !!ev.item,
      do: (g, s, ev) => { s.state.legendMana = null; if (ev.o.def.legendary) { ev.item.cantBeCountered = true; log(g, `${ev.item.name} can't be countered (Delighted Halfling).`, ev.p, [s.def.name]); } }
    }],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Elvish Spirit Guide", cost: "{2}{G}", type: "Creature — Elf Spirit", pt: "2/2",
    text: "Exile Elvish Spirit Guide from your hand: Add {G}.",
    note: "Its {G} from your hand is used only when nothing else can pay, and only for spells and abilities you pay for.",
    handMana: "G",
    ai: { priority: 1 }
  });
  D({
    name: "Badgermole Cub", cost: "{1}{G}", type: "Creature — Badger Mole", pt: "2/2",
    text: "When this creature enters, earthbend 1. (Target land you control becomes a 0/0 creature with haste that's still a land. Put a +1/+1 counter on it. When it dies or is exiled, return it to the battlefield tapped.)\nWhenever you tap a creature for mana, add an additional {G}.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "land", you: true, purpose: "help", prompt: "Earthbend 1: choose a land you control (Gaea's Cradle is the best)" }), s);
        if (!t) return;
        t.state.earth = true; t.earthReturn = true;
        g.bump();
        g.addCounters(t, "p1", 1, s);
        log(g, `${t.def.name} becomes a 0/0 creature with haste and gets a +1/+1 counter (earthbend 1).`, p, [s.def.name, t.def.name]);
      }
    }],
    statics: [{ creatureManaBonus: (g, s, o) => (o.controller === s.controller ? "G" : "") }],
    ai: { ramp: true, priority: 7, target: (g, p, req) => (req.purpose === "help" && req.options.length ? (req.options.find(o => o.def.name === "Gaea's Cradle") || req.options.find(o => !g.isBasic(o)) || req.options[0]) : undefined) }
  });
  D({
    name: "Devoted Druid", cost: "{1}{G}", type: "Creature — Elf Druid", pt: "0/2",
    text: "{T}: Add {G}.\nPut a -1/-1 counter on Devoted Druid: Untap Devoted Druid.",
    note: "\"Tap for {G} and untap\" makes one {G} you keep floating until the step ends, for loops with Vizier of Remedies: use it ×N, then spend the mana.",
    mana: [{ tap: true, produce: "G" }],
    abilities: [
      {
        label: "Untap it (put a -1/-1 counter on it)",
        condition: (g, o) => o.tapped,
        do: (g, s) => { g.addCounters(s, "m1", 1, s); if (s.zone === "battlefield") g.untap(s); },
        ai: { use: () => false }
      },
      {
        label: "Tap for {G}, then untap it (-1/-1 counter)", manaAbility: true,
        condition: (g, o) => !o.tapped && (!o.sick || g.kw(o, "haste")),
        do: (g, s, ctx) => {
          g.tap(s); ctx.p.pool.G++;
          g.addCounters(s, "m1", 1, s);
          if (s.zone === "battlefield") g.untap(s);
          g.bump();
        },
        ai: { use: () => false }
      }
    ],
    ai: { ramp: true, priority: 6 }
  });
  D({
    name: "Vizier of Remedies", cost: "{1}{W}", type: "Creature — Human Cleric", pt: "2/1",
    statics: [{ counterPlus: (g, s, o, kind) => (kind === "m1" && o.controller === s.controller && g.isCreature(o) ? -1 : 0) }],
    ai: { priority: 5 }
  });
  D({
    name: "Grand Abolisher", cost: "{W}{W}", type: "Creature — Human Cleric", pt: "2/2",
    statics: [Object.assign({
      cantActivate: (g, s, p, o) => g.active === s.controller && p !== s.controller && o.zone === "battlefield" && (g.isArtifact(o) || g.isCreature(o) || g.isEnchantment(o))
    }, quietTurn)],
    ai: { priority: 7 }
  });
  D({
    name: "Kutzil, Malamet Exemplar", cost: "{1}{G}{W}", type: "Legendary Creature — Cat Warrior", pt: "3/3",
    statics: [quietTurn],
    triggers: [{
      on: "combatDamageStep",
      when: (g, s, ev) => ev.hits.some(h => h.controller === s.controller && h.src && h.src.zone === "battlefield" && g.power(h.src) > basePower(g, h.src)),
      do: (g, s, ev, { p }) => { g.draw(p, 1); log(g, `${p.name} draws a card (Kutzil).`, p, [s.def.name]); }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Voice of Victory", cost: "{1}{W}", type: "Creature — Human Soldier", pt: "1/3",
    text: "Mobilize 2 (Whenever this creature attacks, create two tapped and attacking 1/1 red Warrior creature tokens. Sacrifice them at the beginning of the next end step.)\nYour opponents can't cast spells during your turn.",
    statics: [quietTurn],
    triggers: [{ on: "attacks", self: true, do: (g, s, ev, { p }) => { g.createToken(p, T.warriorR, { count: 2, tapped: true, attacking: ev.target, sacEnd: true }); } }],
    ai: { priority: 7 }
  });
  D({
    name: "Drannith Magistrate", cost: "{1}{W}", type: "Creature — Human Wizard", pt: "1/3",
    statics: [{ cantCast: (g, s, p, o) => p !== s.controller && o.zone !== "hand" }],
    ai: { priority: 6 }
  });
  D({
    name: "Thalia, Heretic Cathar", cost: "{2}{W}", type: "Legendary Creature — Human Soldier", pt: "3/2",
    keywords: ["first strike"],
    statics: [{ entersTapped: (g, s, o) => o.controller !== s.controller && (g.isCreature(o) || (g.isLand(o) && !g.isBasic(o))) }],
    ai: { priority: 6 }
  });
  D({
    name: "Linvala, Keeper of Silence", cost: "{2}{W}{W}", type: "Legendary Creature — Angel", pt: "3/4",
    keywords: ["flying"],
    note: "Mana abilities count: opponents' mana creatures can't tap for mana.",
    statics: [{ cantActivate: (g, s, p, o) => p !== s.controller && o.controller !== s.controller && o.zone === "battlefield" && g.isCreature(o) }],
    ai: { priority: 6 }
  });
  D({
    name: "Aven Mindcensor", cost: "{2}{W}", type: "Creature — Bird Wizard", pt: "2/1",
    keywords: ["flash", "flying"],
    statics: [{ searchLimit: (g, s, p) => (p !== s.controller ? 4 : null) }],
    ai: { priority: 4, instantEnd: true }
  });
  D({
    name: "Destiny Spinner", cost: "{1}{G}", type: "Enchantment Creature — Human", pt: "2/3",
    statics: [{ uncounterable: (g, s, item) => item.p === s.controller && !item.isCopy && (isType(item.o, "Creature") || isType(item.o, "Enchantment")) }],
    abilities: [{
      label: "Animate a land", cost: "{3}{G}",
      targets: [{ kind: "land", you: true, purpose: "help", prompt: "Choose a land you control" }],
      do: (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t) return;
        const x = g.controlled(ctx.p, o => g.isEnchantment(o)).length;
        t.state.animated = { turn: g.turn, pt: [x, x], subtypes: ["Elemental"], keywords: ["trample", "haste"] };
        g.bump();
        log(g, `${t.def.name} becomes a ${x}/${x} Elemental with trample and haste until end of turn.`, ctx.p, [t.def.name]);
      },
      ai: { use: () => false }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Esper Sentinel", cost: "{W}", type: "Artifact Creature — Human Soldier", pt: "1/1",
    triggers: [{
      on: "cast",
      when: (g, s, ev) => ev.p !== s.controller && !!ev.item && !ev.item.isCopy && !isType(ev.o, "Creature") && ev.p.ncCast === 1,
      do: async (g, s, ev, { p }) => {
        const q = ev.p, x = Math.max(0, s.zone === "battlefield" ? g.power(s) : 1);
        const cost = MK.parseCost(`{${x}}`);
        if (x > 0 && g.canPay(q, cost)) {
          const ok = await g.ask(q, { type: "confirm", prompt: `Esper Sentinel: pay {${x}}, or ${p.name} draws a card`, src: s, purpose: "sentinelPay" });
          if (ok && g.pay(q, cost)) { log(g, `${q.name} pays {${x}} for Esper Sentinel.`, q, [s.def.name]); return; }
        }
        g.draw(p, 1);
        log(g, `${p.name} draws a card (Esper Sentinel).`, p, [s.def.name]);
      }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Archivist of Oghma", cost: "{1}{W}", type: "Creature — Halfling Cleric", pt: "2/2",
    keywords: ["flash"],
    triggers: [{
      on: "searchLibrary", when: (g, s, ev) => ev.p !== s.controller && g.opponents(s.controller).includes(ev.p),
      do: (g, s, ev, { p }) => { g.gainLife(p, 1, s); g.draw(p, 1); log(g, `${p.name} draws a card (Archivist of Oghma).`, p, [s.def.name]); }
    }],
    ai: { priority: 5, instantEnd: true }
  });
  const PROT = [["W", "white"], ["U", "blue"], ["B", "black"], ["R", "red"], ["G", "green"], ["C", "colorless"]];
  D({
    name: "Giver of Runes", cost: "{W}", type: "Creature — Kor Cleric", pt: "1/2",
    note: "Protection here means: it can't be targeted, damaged or blocked by anything of that color until end of turn.",
    abilities: [{
      label: "Give protection", tap: true,
      targets: [{ kind: "creature", you: true, other: true, purpose: "help", prompt: "Give protection to" }],
      do: async (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t) return;
        // the color the bots would want: the spell on top of the stack, else black
        const top = g.stack[g.stack.length - 1];
        const guess = top && top.p !== ctx.p ? ([...g.colorsOf(top.o)][0] || "C") : "B";
        const k = await g.ask(ctx.p, { type: "option", prompt: "Protection from which color?", options: PROT.map(([id, label]) => ({ id, label: label[0].toUpperCase() + label.slice(1) })), purpose: "protColor", src: s, guess });
        const col = PROT.some(x => x[0] === k) ? k : guess;
        g.addEffect({ objs: [t], prot: [col] });
        log(g, `${t.def.name} gains protection from ${PROT.find(x => x[0] === col)[1]} until end of turn.`, ctx.p, [s.def.name, t.def.name]);
      },
      ai: { use: () => false }
    }],
    ai: { priority: 6, option: (g, p, req) => (req.purpose === "protColor" ? req.guess : undefined) }
  });
  D({
    name: "Eternal Witness", cost: "{1}{G}{G}", type: "Creature — Human Shaman", pt: "2/1",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", optional: true, from: (g2, pl) => pl.graveyard.slice(), purpose: "reanimate", prompt: "Eternal Witness: return a card from your graveyard to your hand" }), s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "hand"); log(g, `${p.name} returns ${t.def.name} to their hand.`, p, [s.def.name, t.def.name]); }
      }
    }],
    ai: { priority: 5 }
  });
  D({
    name: "Formidable Speaker", cost: "{2}{G}", type: "Creature — Elf Druid", pt: "2/4",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        if (!p.hand.length) return;
        const d = await g.ask(p, { type: "cards", prompt: "Formidable Speaker: you may discard a card to search for a creature card", options: p.hand.slice(), min: 0, max: 1, purpose: "discardTutor", src: s });
        const c = (d || []).find(x => p.hand.includes(x));
        if (!c) return;
        g.discard(p, c);
        await g.search(p, { filter: (g2, o) => isCreatureCard(o), to: "hand", prompt: "Formidable Speaker: search for a creature card", src: s });
      }
    }],
    abilities: [{
      label: "Untap another permanent", cost: "{1}", tap: true,
      targets: [{ kind: "permanent", other: true, purpose: "help", prompt: "Untap", filter: (g, o) => o.tapped }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.untap(ctx.targets[0]); },
      ai: { use: () => false }
    }],
    ai: { priority: 5, tutor: true }
  });
  D({
    name: "Recruiter of the Guard", cost: "{2}{W}", type: "Creature — Human Soldier", pt: "1/1",
    triggers: [{
      on: "enters", self: true, optional: "Recruiter of the Guard: search for a creature card with toughness 2 or less?",
      do: (g, s, ev, { p }) => g.search(p, { filter: (g2, o) => isCreatureCard(o) && (o.def.pt ? o.def.pt[1] : 0) <= 2, to: "hand", prompt: "Recruiter of the Guard: a creature card with toughness 2 or less", src: s })
    }],
    ai: { priority: 5, tutor: true }
  });
  D({
    name: "Ranger-Captain of Eos", cost: "{1}{W}{W}", type: "Creature — Human Soldier", pt: "3/3",
    triggers: [{
      on: "enters", self: true, optional: "Ranger-Captain of Eos: search for a creature card with mana value 1 or less?",
      do: (g, s, ev, { p }) => g.search(p, { filter: (g2, o) => isCreatureCard(o) && o.def.mv <= 1, to: "hand", prompt: "Ranger-Captain of Eos: a creature card with mana value 1 or less", src: s })
    }],
    abilities: [{
      label: "Sacrifice: opponents can't cast noncreature spells this turn", sacSelf: true,
      do: (g, s, ctx) => {
        const p = ctx.p;
        g.banCasting((g2, q, card) => q !== p && !isType(card, "Creature"), "Ranger-Captain of Eos");
        log(g, `${p.name}'s opponents can't cast noncreature spells this turn.`, p, [s.def.name]);
      },
      ai: { use: () => false }
    }],
    ai: { priority: 5, tutor: true }
  });
  D({
    name: "Brightglass Gearhulk", cost: "{G}{G}{W}{W}", type: "Artifact Creature — Construct", pt: "4/4",
    keywords: ["first strike", "trample"],
    triggers: [{
      on: "enters", self: true, optional: "Brightglass Gearhulk: search for up to two cards with mana value 1 or less?",
      do: (g, s, ev, { p }) => g.search(p, { filter: (g2, o) => (isType(o, "Artifact") || isType(o, "Creature") || isType(o, "Enchantment")) && o.def.mv <= 1, count: 2, to: "hand", prompt: "Brightglass Gearhulk: up to two artifact, creature or enchantment cards with mana value 1 or less", src: s })
    }],
    ai: { priority: 5, tutor: true }
  });
  D(Object.assign({
    name: "Endurance", cost: "{1}{G}{G}", type: "Creature — Elemental Incarnation", pt: "3/4",
    keywords: ["flash", "reach"],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "player", optional: true, purpose: "harm", prompt: "Endurance: which player puts their graveyard on the bottom of their library?" }), s);
        if (!t || !t.graveyard.length) return;
        const cards = g.shuffleArr(t.graveyard.slice());
        for (const c of cards) g.moveTo(c, "library", { bottom: true });
        log(g, `${t.name} puts ${cards.length} card${cards.length > 1 ? "s" : ""} from their graveyard on the bottom of their library.`, p, [s.def.name]);
      }
    }],
    ai: { priority: 3 }
  }, evoke("G")));
  D(Object.assign({
    name: "Solitude", cost: "{3}{W}{W}", type: "Creature — Elemental Incarnation", pt: "3/2",
    keywords: ["flash", "lifelink"],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", other: true, optional: true, purpose: "harm", prompt: "Solitude: exile up to one other target creature" }), s);
        if (!t || t.zone !== "battlefield") return;
        const who = t.controller, pw = Math.max(0, g.power(t));
        g.exile(t, s);
        g.gainLife(who, pw, s);
      }
    }],
    ai: { priority: 4, removal: true, minThreat: 4 }
  }, evoke("W")));

  /* ================================================================ instants and sorceries */
  D({
    name: "Eladamri's Call", cost: "{G}{W}", type: "Instant",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: (g2, o) => isCreatureCard(o), to: "hand", prompt: "Eladamri's Call: search for a creature card", src: ctx.o }) },
    ai: { tutor: true, instantEnd: true }
  });
  D({
    name: "Archdruid's Charm", cost: "{G}{G}{G}", type: "Instant",
    modes: [
      {
        label: "Search for a creature or land card",
        do: async (g, ctx) => {
          const p = ctx.p, pool = g.librarySearch(p).filter(o => isCreatureCard(o) || isType(o, "Land"));
          const pick = pool.length ? ((await g.ask(p, { type: "cards", prompt: "Archdruid's Charm: a creature card (to your hand) or a land card (onto the battlefield tapped)", options: pool, min: 0, max: 1, purpose: "tutor", src: ctx.o })) || []).find(x => pool.includes(x)) : null;
          g.shuffle(p);
          if (!pick) { log(g, `${p.name} searches and finds nothing.`, p); return; }
          if (isType(pick, "Land")) { log(g, `${p.name} puts ${pick.def.name} onto the battlefield tapped.`, p, [pick.def.name]); g.putOntoBattlefield([pick], p, { tapped: true }); }
          else { g.moveTo(pick, "hand"); log(g, `${p.name} reveals ${pick.def.name} and puts it into their hand.`, p, [pick.def.name]); }
        }
      },
      {
        label: "+1/+1 counter, then it fights one way",
        canChoose: (g, p) => g.creatures(p).length > 0 && g.creatures().some(o => o.controller !== p),
        targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Put a +1/+1 counter on" }, { kind: "creature", opp: true, purpose: "harm", prompt: "It deals damage to" }],
        do: (g, ctx) => {
          const [a, b] = ctx.targets;
          if (!ctx.legal[0] || !a) return;
          g.addCounters(a, "p1", 1, ctx.o);
          if (ctx.legal[1] && b && a.zone === "battlefield") g.damage(a, b, Math.max(0, g.power(a)));
        }
      },
      {
        label: "Exile an artifact or enchantment",
        canChoose: (g, p) => g.battlefield.some(o => g.isArtifact(o) || g.isEnchantment(o)),
        targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Exile" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], ctx.o); }
      }
    ],
    ai: { tutor: true, mode: () => 0 }
  });
  D({
    name: "Veil of Summer", cost: "{G}", type: "Instant",
    note: "The hexproof is from everything your opponents control, not only blue and black.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        if ((g.castLog || []).some(e => e.turn === g.turn && e.p !== p && e.colors.some(k => k === "U" || k === "B"))) g.draw(p, 1);
        p.noCounterTurn = g.turn; p.hexTurn = g.turn;
        g.grant(g.controlled(p), ["hexproof"]);
        log(g, `${p.name}'s spells can't be countered this turn, and ${p.name} and their permanents gain hexproof.`, p, ["Veil of Summer"]);
      }
    },
    ai: { protection: true }
  });
  D({
    name: "Silence", cost: "{W}", type: "Instant",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        g.banCasting((g2, q) => q !== p, "Silence");
        log(g, `${p.name}'s opponents can't cast spells this turn.`, p, ["Silence"]);
      }
    },
    ai: { never: true }
  });
  D({
    name: "Orim's Chant", cost: "{W}", type: "Instant", kicker: "{W}",
    spell: {
      targets: [{ kind: "player", purpose: "harm", prompt: "Which player can't cast spells this turn?" }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (ctx.legal[0] && t) { g.banCasting((g2, q) => q === t, "Orim's Chant"); log(g, `${t.name} can't cast spells this turn.`, ctx.p, ["Orim's Chant"]); }
        if (ctx.kicked) { g.noAttackTurn = g.turn; log(g, "Creatures can't attack this turn.", ctx.p, ["Orim's Chant"]); }
      }
    },
    ai: { never: true }
  });
  D({
    name: "Reprieve", cost: "{1}{W}", type: "Instant",
    spell: {
      targets: [{ kind: "spell", purpose: "harm", prompt: "Return which spell to its owner's hand?", filter: (g, it, p) => it.p !== p }],
      do: (g, ctx) => {
        const it = ctx.targets[0];
        if (ctx.legal[0] && it) {
          const i = g.stack.indexOf(it);
          if (i >= 0) {
            g.stack.splice(i, 1);
            it.countered = true;
            const o = it.o;
            if (it.isCopy) o.gone = true;
            else {
              if (o.cardDef && o.def !== o.cardDef) { o.def = o.cardDef; o.faceDown = null; }
              o.zone = "hand"; o.owner.hand.push(o);
              if (o.isCommander) g.moveTo(o, "command");
            }
            g.bump();
            g.anim("countered", { item: it });
            log(g, `${it.name} returns to ${o.owner.name}'s hand.`, ctx.p, ["Reprieve", o.def.name]);
          }
        }
        g.draw(ctx.p, 1);
      }
    },
    ai: { counter: true }
  });
  D({
    name: "Teferi's Protection", cost: "{2}{W}", type: "Instant",
    note: "Your permanents phase out and you can't be damaged, targeted or change life total until your next turn.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        p.shield = true; p.lifeLock = true;
        g.phaseOut(g.controlled(p));
        ctx.item.exileAfter = true;
        log(g, `Until ${p.name}'s next turn, their life total can't change and they have protection from everything.`, p, ["Teferi's Protection"]);
      }
    },
    ai: { protection: true }
  });

  /* ================================================================ enchantments and artifacts */
  D({
    name: "Deafening Silence", cost: "{W}", type: "Enchantment",
    statics: [{ cantCast: (g, s, p, o) => !isType(o, "Creature") && (p.ncCast || 0) >= 1 }],
    ai: { priority: 6 }
  });
  D({
    name: "Blind Obedience", cost: "{1}{W}", type: "Enchantment",
    statics: [{ entersTapped: (g, s, o) => o.controller !== s.controller && (g.isArtifact(o) || g.isCreature(o)) }],
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.item && !ev.item.isCopy,
      do: async (g, s, ev, { p }) => {
        const cost = MK.parseCost("{W/B}");
        if (!g.canPay(p, cost)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Extort: pay {W/B} to drain each opponent for 1?", src: s, purpose: "extort" });
        if (!ok || !g.pay(p, cost)) return;
        let n = 0;
        for (const q of g.opponents(p)) n += g.loseLife(q, 1, s);
        g.gainLife(p, n, s);
      }
    }],
    ai: { priority: 6, confirm: (g, p, req) => (req.purpose === "extort" ? g.active !== p || g.phase === "main2" : true) }
  });
  /* "Loses all abilities and is a 3/3 green Elk": the creature gets a stripped copy of its card while
     the Aura is attached. */
  function elkOf(def) {
    return MK.derive(def, {
      keywords: [], triggers: [], abilities: [], mana: [], statics: [], gyAbilities: [], commandStatics: [],
      pt: [3, 3], colors: ["G"], types: ["Creature"], subtypes: ["Elk"], cda: null, notCreatureUnless: null,
      doesntUntap: null, equip: null, crew: null, levels: null, doors: null, saga: null, canBeBlockedBy: null,
      cantBlock: false, changeling: false, doublesLandMana: false, makesAssassins: false,
      text: "A 3/3 green Elk with no abilities (Kenrith's Transformation).", elk: true
    });
  }
  D({
    name: "Kenrith's Transformation", cost: "{1}{G}", type: "Enchantment — Aura", aura: true, enchant: "creature",
    targets: [{ kind: "creature", purpose: "harm", prompt: "Enchant creature" }],
    triggers: [
      {
        on: "enters", self: true,
        do: (g, s, ev, { p }) => {
          g.draw(p, 1);
          const t = s.attachedTo;
          if (!t || t.zone !== "battlefield" || t.def.elk) return;
          s.elkTarget = t; t.elkPrev = t.def;
          t.def = elkOf(t.def);
          g.ts++; g.bump();
          log(g, `${t.def.name} loses all abilities and is a 3/3 green Elk.`, p, [s.def.name, t.def.name]);
        }
      },
      {
        on: "leaves", self: true,
        do: (g, s) => {
          const t = s.elkTarget;
          s.elkTarget = null;
          if (t && t.zone === "battlefield" && t.def.elk && t.elkPrev) { t.def = t.elkPrev; t.elkPrev = null; g.ts++; g.bump(); log(g, `${t.def.name} is itself again.`, t.controller, [t.def.name]); }
        }
      }
    ],
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "The One Ring", cost: "{4}", type: "Legendary Artifact",
    keywords: ["indestructible"],
    note: "Protection from everything: you can't be targeted by opponents and damage to you is prevented until your next turn.",
    onResolve: (g, p, o) => { p.shield = true; log(g, `${p.name} has protection from everything until their next turn.`, p, [o.def.name]); },
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller && (s.counters.burden || 0) > 0,
      do: (g, s, ev, { p }) => g.loseLife(p, s.counters.burden || 0, s)
    }],
    abilities: [{
      label: "Burden counter, then draw", tap: true,
      do: (g, s, ctx) => { g.addCounters(s, "burden", 1, s); const n = s.counters.burden || 0; g.draw(ctx.p, n); log(g, `${ctx.p.name} draws ${n} card${n > 1 ? "s" : ""} (The One Ring).`, ctx.p, [s.def.name]); },
      ai: { use: (g, p, o, ctx) => (ctx.window === "main2" || ctx.window === "end") && p.life > 4 * ((o.counters.burden || 0) + 1) }
    }],
    ai: { priority: 6, draw: true }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const hasLandType = (g, p, types) => g.controlled(p, o => g.isLand(o) && types.some(t => o.def.subtypes.includes(t))).length > 0;
  land("Savannah", { type: "Land — Forest Plains", mana: [{ tap: true, produce: ["G", "W"] }] });
  land("Horizon Canopy", {
    note: "The 1 life is paid as you tap it for mana.",
    mana: [{ tap: true, produce: ["G", "W"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.loseLife(o.controller, 1, o) }],
    abilities: [{ label: "Sacrifice: draw a card", cost: "{1}", tap: true, sacSelf: true, do: (g, s, ctx) => g.draw(ctx.p, 1), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.controlled(p, x => g.isLand(x)).length >= 6 } }]
  });
  land("Branchloft Pathway", {
    text: "{T}: Add {G}.\n(Modal double-faced card: the back face, Boulderloft Pathway, has \"{T}: Add {W}.\" You play one face.)",
    note: "You pick the face (green or white) when it enters.",
    etbState: (g, o) => {
      const p = o.controller, has = k => g.manaSources(p).some(s => s.options.some(x => x.units.includes(k)));
      return { face: !has("W") && has("G") ? "W" : "G" };
    },
    triggers: [{
      on: "enters", self: true, when: (g, s) => !!s.controller.human,
      do: async (g, s, ev, { p }) => {
        const k = await g.ask(p, { type: "option", prompt: "Play it as Branchloft Pathway ({G}) or Boulderloft Pathway ({W})?", options: [{ id: "G", label: "Branchloft Pathway: {G}" }, { id: "W", label: "Boulderloft Pathway: {W}" }], purpose: "pathway", src: s });
        if (k === "G" || k === "W") { s.state.face = k; g.bump(); }
      }
    }],
    mana: [{ tap: true, produce: (g, o) => (o.state.face === "W" ? "W" : "G") }]
  });
  land("Hushwood Verge", { mana: [{ tap: true, produce: "G" }, { tap: true, produce: "W", condition: (g, o) => hasLandType(g, o.controller, ["Forest", "Plains"]) }] });
  land("Misty Rainforest", {
    fetchTypes: ["Forest", "Island"],
    text: "{T}, Pay 1 life, Sacrifice Misty Rainforest: Search your library for a Forest or Island card, put it onto the battlefield, then shuffle.",
    abilities: [{
      label: "Find a Forest or Island", tap: true, payLife: 1, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, o) => isType(o, "Land") && ["Forest", "Island"].some(t => o.def.subtypes.includes(t)), to: "battlefield", prompt: "Choose a Forest or Island card", src: s }),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && p.life > 2 }
    }],
    ai: { plan: (g, p, o, { window }) => (o.zone === "battlefield" && !o.tapped && o.controller === p && p.life > 2 && g.active === p && (window === "main1" || window === "main2") ? { type: "activate", card: o, idx: 0 } : null) }
  });
  land("Gemstone Caverns", {
    type: "Legendary Land",
    note: "In your opening hand when you don't go first, you're asked whether to begin with it on the battlefield.",
    openingHand: true,
    openingHandIf: (g, p) => g.active !== p,
    onOpeningHand: async (g, p, o) => {
      o.counters.luck = 1;
      if (!p.hand.length) return;
      const pick = await g.ask(p, { type: "cards", prompt: "Gemstone Caverns: exile a card from your hand", options: p.hand.slice(), min: 1, max: 1, purpose: "exileHand", src: o });
      const c = (pick || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1];
      g.moveTo(c, "exile");
      log(g, `${p.name} exiles a card from their hand for Gemstone Caverns.`, p, [o.def.name]);
    },
    mana: [{ tap: true, produce: (g, o) => (o.counters.luck ? "any" : "C") }]
  });
  land("Boseiju, Who Endures", {
    type: "Legendary Land",
    mana: [{ tap: true, produce: "G" }],
    channel: {
      label: "Channel: destroy an artifact, enchantment or nonbasic land", cost: "{1}{G}",
      costReduce: (g, p) => legendaryCreatures(g, p),
      targets: [{ kind: "permanent", opp: true, purpose: "harm", prompt: "Destroy", filter: (g, o) => g.isArtifact(o) || g.isEnchantment(o) || (g.isLand(o) && !g.isBasic(o)) }],
      do: async (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t) return;
        const q = t.controller;
        g.destroy(t, s);
        await g.search(q, { filter: (g2, o) => isType(o, "Land") && ["Plains", "Island", "Swamp", "Mountain", "Forest"].some(k => o.def.subtypes.includes(k)), to: "battlefield", prompt: "Boseiju: you may search for a land card with a basic land type", src: s });
      }
    }
  });
  land("Eiganjo, Seat of the Empire", {
    type: "Legendary Land",
    mana: [{ tap: true, produce: "W" }],
    channel: {
      label: "Channel: 4 damage to an attacking or blocking creature", cost: "{2}{W}",
      costReduce: (g, p) => legendaryCreatures(g, p),
      targets: [{ kind: "creature", purpose: "harm", amount: 4, prompt: "Deal 4 damage to", filter: (g, o) => !!(o.combat && (o.combat.attacking || o.combat.blocking)) }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 4); }
    }
  });
  land("Urza's Saga", {
    type: "Enchantment Land — Urza's Saga", subtypes: ["Urza's", "Saga"],
    text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Urza's Saga gains \"{T}: Add {C}.\"\nII — Urza's Saga gains \"{2}, {T}: Create a 0/0 colorless Construct artifact creature token with 'This token gets +1/+1 for each artifact you control.'\"\nIII — Search your library for an artifact card with mana cost {0} or {1}, put it onto the battlefield, then shuffle.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Make a Construct", cost: "{2}", tap: true, noSelfMana: true,
      condition: (g, o) => (o.counters.lore || 0) >= 2,
      do: (g, s, ctx) => g.createToken(ctx.p, T.sagaConstruct),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" || ctx.window === "main2" }
    }],
    saga: [
      async () => {},
      async () => {},
      async (g, s, p) => g.search(p, { filter: (g2, o) => isType(o, "Artifact") && (o.def.cost === "{0}" || o.def.cost === "{1}"), to: "battlefield", prompt: "Urza's Saga: an artifact card with mana cost {0} or {1}", src: s })
    ]
  });

  /* Cavern of Souls for every deck: the type is the creature type most common in your deck (bots),
     or the one you pick (you). Etrata's Assassins keep their own rule: with a permanent that makes
     everything an Assassin, every creature spell counts. */
  function deckTypes(p) {
    const n = new Map();
    for (const z of ["library", "hand", "graveyard", "command", "exile"]) for (const c of p[z]) if (isCreatureCard(c)) for (const t of c.def.subtypes) n.set(t, (n.get(t) || 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1]).map(x => x[0]);
  }
  const cavernFits = (g, card, src) => {
    if (!card || !isCreatureCard(card)) return false;
    const t = src.state.chosenType;
    return !!t && (card.def.subtypes.includes(t) || !!card.def.changeling || (t === "Assassin" && g.battlefield.some(s => s.controller === card.owner && s.def.makesAssassins)));
  };
  MK.define({
    name: "Cavern of Souls", type: "Land",
    text: "As Cavern of Souls enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't be countered.",
    note: "A creature spell of the chosen type you cast while you control it can't be countered, whichever mana paid for it.",
    etbState: (g, o) => ({ chosenType: deckTypes(o.controller)[0] || "Human" }),
    triggers: [
      {
        on: "enters", self: true, when: (g, s) => !!s.controller.human,
        do: async (g, s, ev, { p }) => {
          const types = deckTypes(p).slice(0, 8);
          if (types.length < 2) return;
          const k = await g.ask(p, { type: "option", prompt: "Cavern of Souls: choose a creature type", options: types.map(t => ({ id: t, label: t })), purpose: "cavernType", src: s });
          if (types.includes(k)) { s.state.chosenType = k; g.bump(); }
          log(g, `${p.name} names ${s.state.chosenType} for Cavern of Souls.`, p, [s.def.name]);
        }
      },
      { on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.item && cavernFits(g, ev.o, s), do: (g, s, ev) => { ev.item.cantBeCountered = true; } }
    ],
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card, src) => cavernFits(g, card, src) }]
  });

  /* ================================================================ the deck */
  const LIST = [
    "Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Birds of Paradise", "Avacyn's Pilgrim", "Delighted Halfling", "Elvish Spirit Guide", "Badgermole Cub",
    "Devoted Druid", "Vizier of Remedies", "Walking Ballista", "Spike Feeder", "Heliod, Sun-Crowned", "Archangel of Thune",
    "Grand Abolisher", "Kutzil, Malamet Exemplar", "Voice of Victory", "Drannith Magistrate", "Thalia, Heretic Cathar", "Linvala, Keeper of Silence", "Aven Mindcensor", "Destiny Spinner",
    "Esper Sentinel", "Archivist of Oghma", "Giver of Runes", "Eternal Witness",
    "Formidable Speaker", "Recruiter of the Guard", "Ranger-Captain of Eos", "Brightglass Gearhulk",
    "Endurance", "Solitude", "Craterhoof Behemoth", "Vorinclex, Voice of Hunger",
    "Worldly Tutor", "Enlightened Tutor", "Crop Rotation", "Eladamri's Call", "Chord of Calling", "Summoner's Pact", "Archdruid's Charm",
    "Swords to Plowshares", "Path to Exile", "Generous Gift", "Force of Vigor",
    "Veil of Summer", "Silence", "Orim's Chant", "Reprieve", "Teferi's Protection", "Flawless Maneuver",
    "Natural Order", "Green Sun's Zenith", "Finale of Devastation", "Nature's Lore",
    "Sylvan Library", "Survival of the Fittest", "Smothering Tithe", "Deafening Silence", "Blind Obedience", "Kenrith's Transformation",
    "Sol Ring", "Mana Vault", "Grim Monolith", "Chrome Mox", "Mox Diamond", "Lotus Petal", "Skullclamp", "Lightning Greaves", "The One Ring",
    "Gaea's Cradle", "Ancient Tomb", "Command Tower", "Bountiful Promenade", "Sunpetal Grove", "Canopy Vista", "Gavony Township",
    "Savannah", "Temple Garden", "Brushland", "Horizon Canopy", "Razorverge Thicket", "Branchloft Pathway", "Hushwood Verge",
    "Windswept Heath", "Wooded Foothills", "Misty Rainforest", "Flooded Strand", "Marsh Flats",
    "Gemstone Caverns", "Cavern of Souls", "Boseiju, Who Endures", "Eiganjo, Seat of the Empire", "Urza's Saga", "Dryad Arbor",
    "Forest", "Forest", "Plains", "Plains"
  ];

  /* ================================================================ the coach
     tips(g, p) returns what to look for right now, most urgent first: { level: "win" | "now" | "plan" |
     "warn" | "info", title, text, cards }. The table shows the first one in the hint line and all of them
     in the Coach panel, next to the turn checklist (checklist-corrupted.js). */
  const COMBOS = [
    { key: "thune", pieces: ["Archangel of Thune", "Spike Feeder"], title: "Archangel of Thune + Spike Feeder", how: "Use Spike Feeder's \"Remove a counter: gain 2 life\" with ×N. Each loop: +2 life, and Thune puts a +1/+1 counter on each creature you control, Feeder included. No mana, instant speed." },
    { key: "heliodBallista", pieces: ["Heliod, Sun-Crowned", "Walking Ballista"], title: "Heliod + Walking Ballista", how: "Ballista needs 2+ counters. Pay {1}{W}: Heliod gives Ballista lifelink. Then ping ×N: each 1 damage gains 1 life, and Heliod puts the counter back." },
    { key: "heliodFeeder", pieces: ["Heliod, Sun-Crowned", "Spike Feeder"], title: "Heliod + Spike Feeder", how: "Remove a counter from Feeder (gain 2), Heliod puts it back: infinite life. Add Ballista or Thune to turn it into a kill." },
    { key: "druid", pieces: ["Devoted Druid", "Vizier of Remedies"], title: "Devoted Druid + Vizier of Remedies", how: "Use Devoted Druid's \"Tap for {G}, then untap it\" with ×N: Vizier makes the -1/-1 counter zero, so it's unlimited green mana. Spend it on Walking Ballista ({4}: +1 counter), Shalai ({4}{G}{G}) or Finale of Devastation with X 10+." }
  ];
  const HATE = {
    "Grafdigger's Cage": "stops Natural Order, Chord, Green Sun's Zenith and Finale (creatures can't enter from your library)",
    "Torpor Orb": "stops your creatures' enters abilities (Recruiter, Ranger-Captain, Gearhulk, Speaker, Witness)",
    "Hushbringer": "stops enters abilities (your creature tutors)",
    "Collector Ouphe": "stops Walking Ballista and your mana rocks",
    "Null Rod": "stops Walking Ballista and your mana rocks",
    "Cursed Totem": "stops creature abilities: dorks, Spike Feeder, Devoted Druid, Ballista",
    "Linvala, Keeper of Silence": "stops your creatures' activated abilities, mana included",
    "Humility": "turns every creature into a 1/1 with no abilities",
    "Rest in Peace": "exiles what would go to graveyards (Finale can't find from your graveyard)",
    "Stony Silence": "stops your rocks' abilities",
    "Drannith Magistrate": "stops you casting Shalai from the command zone",
    "Aven Mindcensor": "limits your searches to the top four cards"
  };
  const QUIET = ["Grand Abolisher", "Kutzil, Malamet Exemplar", "Voice of Victory"];

  /* Summoner's Pact: at your next upkeep pay {2}{G}{G} or lose. What your permanents make once they untap
     decides whether that's safe; the tip says so while it's due, and before you cast one you can't pay for. */
  function pactTip(g, p) {
    const due = g.delayed.some(d => d.player === p && d.src && d.src.def && d.src.def.name === "Summoner's Pact");
    const inHand = p.hand.some(c => c.def.name === "Summoner's Pact");
    if (!due && !inHand) return null;
    const m = g.manaAfterUntap(p, MK.parseCost("{2}{G}{G}"));
    const have = `Your lands and mana permanents make ${m.total} mana (${m.G} green) after they untap.`;
    if (due && m.can) return { level: "warn", title: "Summoner's Pact is due", text: `At your next upkeep you pay {2}{G}{G} or lose the game. ${have} That's enough, so don't sacrifice or give away a mana source before then.`, cards: ["Summoner's Pact"] };
    if (due) return { level: "now", title: "You can't pay Summoner's Pact yet", text: `At your next upkeep you need {2}{G}{G} or you lose the game. ${have} Play a green land, cast a mana creature or a rock this turn, or win before your upkeep.`, cards: ["Summoner's Pact"] };
    if (!m.can) return { level: "warn", title: "Summoner's Pact would kill you", text: `Casting it now means paying {2}{G}{G} at your next upkeep. ${have} That isn't enough: only cast it if you win this turn, or add mana first.`, cards: ["Summoner's Pact"] };
    return null;
  }

  /* ---------------------------------------------------------------- the turn planner (brain-corrupted.js)
     reads the board into plain data and asks the planner for the ranked lines and the threats. */
  const BRAIN_HATE = ["Grafdigger's Cage", "Torpor Orb", "Hushbringer", "Null Rod", "Collector Ouphe", "Stony Silence", "Cursed Totem", "Linvala, Keeper of Silence", "Humility", "Rest in Peace", "Drannith Magistrate", "Aven Mindcensor"];
  function manaNow(g, p) {
    let n = Object.values(p.pool || {}).reduce((t, v) => t + (+v || 0), 0);
    for (const src of g.manaSources(p)) n += src.options[0].units.length * (src.mult || 1);
    return n;
  }
  let planKey = null, planVal = null;
  function plan(g, p) {
    const B = root.CorruptedBrain || (root.MK && root.MK.CorruptedBrain);
    if (!B) return null;
    const key = g.v != null ? g.v + ":" + p.id + ":" + g.phase + ":" + (g.active && g.active.id) : null;
    if (key && key === planKey) return planVal;
    const mine = g.battlefield.filter(o => o.controller === p && o.zone === "battlefield");
    const cre = g.creatures(p);
    const canAttack = cre.filter(o => !o.sick || g.kw(o, "haste"));
    const isGreenCre = o => g.isCreature(o) && [...g.colorsOf(o)].includes("G");
    const dork = cre.filter(o => isGreenCre(o) && !B.PIECES[o.def.name]).sort((a, b) => g.power(a) - g.power(b))[0];
    const myTurn = g.active === p, main = myTurn && (g.phase === "main1" || g.phase === "main2") && !(g.stack && g.stack.length);
    const state = {
      bf: mine.map(o => ({ name: o.def.name, sick: g.isCreature(o) && o.sick && !g.kw(o, "haste"), counters: (o.counters && o.counters.p1) || 0, green: isGreenCre(o) })),
      hand: p.hand.map(c => c.def.name),
      creaturesInHand: p.hand.filter(c => c.def.types.includes("Creature")).map(c => c.def.name),
      gy: p.graveyard.map(c => c.def.name),
      convoke: cre.filter(o => !o.tapped).length,
      canPay: c => g.canPay(p, MK.parseCost(c)),
      canPayNext: c => g.manaAfterUntap(p, MK.parseCost(c)).can,
      manaNow: manaNow(g, p), manaNext: g.manaAfterUntap(p).total,
      quiet: QUIET.find(n => mine.some(o => o.def.name === n)) || null,
      opps: g.opponents(p).filter(q => !q.lost).map(q => ({
        name: q.name, life: q.life, hand: q.hand.length,
        open: g.battlefield.filter(o => o.controller === q && !o.tapped && g.manaAbilities(o).length).length,
        power: g.creatures(q).reduce((t, o) => t + Math.max(0, g.power(o)), 0),
        hate: g.battlefield.filter(o => o.controller === q && BRAIN_HATE.includes(o.def.name)).map(o => ({ name: o.def.name, types: o.def.types })),
        top: MK.AI && MK.AI.threat ? g.battlefield.filter(o => o.controller === q && !g.isLand(o) && !o.isToken).map(o => ({ name: o.def.name, types: [...g.typesOf(o)], power: g.isCreature(o) ? g.power(o) : 0, score: MK.AI.threat(g, o, p), commander: !!o.isCommander })).filter(o => o.score >= 7).sort((x, y) => y.score - x.score).slice(0, 2) : []
      })),
      life: p.life, myTurn, main,
      hoof: { creatures: cre.length, attackers: canAttack.length, power: canAttack.reduce((t, o) => t + Math.max(0, g.power(o)), 0), sacAttacker: !!(dork && canAttack.includes(dork)), sacPower: dork ? Math.max(0, g.power(dork)) : 0 }
    };
    const r = B.solve(state);
    r.state = state;
    planKey = key; planVal = r;
    return r;
  }
  const stepText = l => l.steps.map(st => st.text).join(" ");
  const lineCards = l => [...new Set([].concat(...l.steps.map(st => st.cards)))].slice(0, 5);
  /* a line as a coach tip: win now, go now, or the plan for next turn */
  function lineTip(l, r) {
    const short2 = n => n.split(",")[0];
    const find = l.missing.length ? `Find ${l.missing.map(short2).join(" + ")}${l.tutors.length ? ` with ${l.tutors.map(short2).join(" and ")}` : ""}` : l.title;
    const money = l.early ? `${l.early} at the end of the turn before yours, then ${l.onTurn} on your turn (you'll have ${r.state.manaNext}).` : `Costs ${l.cost} (${l.mana} mana). You have ${r.state.manaNow} now, ${r.state.manaNext} next turn.`;
    const who = r.risk.who, guard = r.state.quiet ? ` ${r.state.quiet} keeps them from responding.` : who.length && r.state.myTurn ? ` ${who.join(" and ")} ${who.length > 1 ? "have" : "has"} cards and open mana: ${r.risk.silence.length ? `cast ${r.risk.silence[0]} first` : "they can still respond"}.` : "";
    if (l.when === "now") return { level: l.kill ? "win" : "now", title: l.kill ? `Win now: ${l.title}` : `Now: ${l.title}`, text: `${stepText(l)}${l.mana ? " " + money : ""}${guard}`, cards: lineCards(l) };
    if (l.when === "next") return { level: "plan", title: `Next turn: ${find}`, text: `${l.title}${l.kill ? " wins" : ""} next turn. ${stepText(l)} ${money}`, cards: lineCards(l) };
    return { level: "plan", title: find, text: `${l.title}: ${stepText(l)} ${money} Build mana first.`, cards: lineCards(l) };
  }

  function coachTips(g, p) {
    const out = [];
    const bf = name => g.battlefield.filter(o => o.controller === p && o.def.name === name && o.zone === "battlefield");
    const on = name => bf(name).length > 0;
    const inHand = name => p.hand.some(c => c.def.name === name);
    const castable = name => p.hand.some(c => c.def.name === name && g.castOptions(p, c).length > 0);
    const myTurn = g.active === p;
    const main = myTurn && (g.phase === "main1" || g.phase === "main2");
    const shalai = g.battlefield.find(o => o.controller === p && o.def.name === "Shalai, Voice of Plenty");
    const quietOn = QUIET.find(on);
    // 1. the planner's lines: a win this turn first, then the best line for next turn
    const r = plan(g, p);
    if (r) {
      const live = r.lines.filter(l => l.when !== "blocked");
      for (const l of live.filter(x => x.when === "now")) out.push(lineTip(l, r));
      const nxt = live.find(x => x.when !== "now" && x.kill) || live.find(x => x.when !== "now");
      if (nxt && !out.some(t => t.level === "win")) out.push(lineTip(nxt, r));
    }
    // 3. pact upkeep, protection and Shalai
    const pt = pactTip(g, p);
    if (pt) out.push(pt);
    if (shalai && !g.kw(shalai, "shroud") && !g.kw(shalai, "hexproof")) {
      if (on("Lightning Greaves") && main) out.push({ level: "now", title: "Shalai has no hexproof", text: "She protects everyone but herself. Equip Lightning Greaves to her ({0}) unless a combo piece needs the haste.", cards: ["Lightning Greaves", "Shalai, Voice of Plenty"] });
      else if (on("Giver of Runes")) out.push({ level: "info", title: "Giver of Runes protects Shalai", text: "Keep Giver untapped. When removal targets Shalai, give her protection from that color in response.", cards: ["Giver of Runes"] });
    }
    if (!shalai && myTurn && main && p.commanders[0] && p.commanders[0].zone === "command" && g.castOptions(p, p.commanders[0]).length) out.push({ level: "now", title: "Cast Shalai before the combo pieces", text: "With Shalai out, your other creatures and you have hexproof: Swords, Path and Chaos Warp can't touch the combo. Against a fast-combo table, a lock piece can come first.", cards: ["Shalai, Voice of Plenty"] });
    // 4. threats: hate pieces (what each switches off), boards that can kill you
    if (r) for (const t of r.threats) out.push({ level: t.level === "high" ? "warn" : "info", title: t.title, text: `${t.text}${t.answerText ? " " + t.answerText : ""}`, cards: [t.kind === "hate" ? t.name : null].concat(t.answers.slice(0, 2)).filter(Boolean) });
    // 5. silence and protection on hand
    const silence = ["Silence", "Orim's Chant"].filter(inHand);
    if (silence.length && myTurn && main && !quietOn && out.some(t => t.level === "win" || t.level === "now")) out.push({ level: "now", title: `Cast ${silence[0]} first`, text: "Opponents can't cast spells this turn, so nothing answers your combo. (Grand Abolisher, Kutzil or Voice of Victory on the battlefield do the same on every turn of yours.)", cards: [silence[0]] });
    if (silence.length && !myTurn && g.phase === "upkeep") out.push({ level: "info", title: `${silence[0]} in their upkeep`, text: `If ${g.active.name} looks ready to win this turn, cast ${silence[0]} now: they can't cast spells for the whole turn.`, cards: [silence[0]] });
    const prot = ["Teferi's Protection", "Flawless Maneuver", "Veil of Summer"].filter(inHand);
    if (prot.length && g.creatures(p).length >= 4) out.push({ level: "info", title: `Hold ${prot[0]}`, text: prot[0] === "Veil of Summer" ? "Veil stops counterspells and blue or black removal for a turn: cast it in response." : "Hexproof doesn't stop wipes. Keep it for the turn someone casts a board wipe.", cards: [prot[0]] });
    // 6. big lines
    if (on("Kutzil, Malamet Exemplar") && myTurn && g.phase === "main1" && g.creatures(p).some(o => g.power(o) > basePower(g, o))) out.push({ level: "info", title: "Kutzil draws", text: "Creatures bigger than their printed power that deal combat damage to a player draw you a card once per combat. Shalai's and Gavony's counters count.", cards: ["Kutzil, Malamet Exemplar"] });
    if (on("Badgermole Cub") && on("Gaea's Cradle")) out.push({ level: "info", title: "Cub doubles your dorks", text: "Each creature you tap for mana adds an extra {G}, Gaea's Cradle included once it's earthbent into a creature.", cards: ["Badgermole Cub"] });
    if (on("Vizier of Remedies") && on("Spike Feeder") && !on("Archangel of Thune") && !on("Heliod, Sun-Crowned") && !on("Devoted Druid")) out.push({ level: "warn", title: "Vizier + Feeder is not a combo", text: "Spike Feeder removes +1/+1 counters; Vizier of Remedies only stops -1/-1 counters. Feeder loops with Archangel of Thune or Heliod, and Vizier with Devoted Druid.", cards: ["Spike Feeder", "Vizier of Remedies"] });
    if (!out.length) out.push({ level: "info", title: myTurn ? "Develop" : "Wait for your window", text: myTurn ? "Land, fast mana, then a lock piece or Shalai. Keep a tutor for the missing combo piece." : "Hold your instants: Swords and Path for threats, Reprieve for a key spell, Silence for someone's winning turn.", cards: [] });
    return out.slice(0, 8);
  }

  /* ================================================================ the companion
     companion(g, p, ctx) walks you through the game one stage at a time: what to do with this hand,
     this turn, this attack or this spell on the stack. The table shows it in a panel when Companion is
     ticked in the game setup. ctx.mode is "mulligan" (ctx.hand), "main", "attack", "block" (ctx.attackers),
     "respond" (ctx.window, ctx.top, ctx.can: names you can cast or activate now) or "wait".
     Returns { stage, title, steps: [{ text, cards }], urgent }. urgent asks the table to stop and show
     the advice at a response window it would otherwise skip. */
  const FAST = ["Sol Ring", "Mana Vault", "Grim Monolith", "Chrome Mox", "Mox Diamond", "Lotus Petal", "Ancient Tomb", "Gemstone Caverns", "Elvish Spirit Guide"];
  const DORKS = ["Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Birds of Paradise", "Avacyn's Pilgrim", "Delighted Halfling", "Badgermole Cub", "Dryad Arbor"];
  const LOCKS = ["Grand Abolisher", "Drannith Magistrate", "Deafening Silence", "Thalia, Heretic Cathar", "Linvala, Keeper of Silence", "Aven Mindcensor", "Kutzil, Malamet Exemplar", "Voice of Victory"];
  const PIECES = ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies"];
  const ALL_TUTORS = ["Worldly Tutor", "Enlightened Tutor", "Crop Rotation", "Eladamri's Call", "Chord of Calling", "Summoner's Pact", "Archdruid's Charm", "Green Sun's Zenith", "Natural Order", "Finale of Devastation", "Survival of the Fittest", "Recruiter of the Guard", "Formidable Speaker", "Ranger-Captain of Eos"];
  const INSTANTS = ["Swords to Plowshares", "Path to Exile", "Veil of Summer", "Silence", "Orim's Chant", "Reprieve", "Teferi's Protection", "Flawless Maneuver", "Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Archdruid's Charm"];
  const FLASH = ["Aven Mindcensor", "Archivist of Oghma", "Endurance"];
  const NOT_GREEN = ["Plains", "Eiganjo, Seat of the Empire", "Ancient Tomb", "Urza's Saga", "Gemstone Caverns", "Gaea's Cradle"];
  const short = n => n.split(",")[0];
  const list = names => names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " or " + names[names.length - 1];

  function companion(g, p, ctx) {
    ctx = ctx || {};
    const mode = ctx.mode || "wait";
    const mineOn = name => g.battlefield.filter(o => o.controller === p && o.def.name === name && o.zone === "battlefield");
    const on = name => mineOn(name).length > 0;
    const inHand = name => p.hand.some(c => c.def.name === name);
    const castable = name => p.hand.some(c => c.def.name === name && g.castOptions(p, c).length > 0);
    const myTurn = g.active === p;
    const shalai = g.battlefield.find(o => o.controller === p && o.def.name === "Shalai, Voice of Plenty");
    const shalaiHome = p.commanders[0] && p.commanders[0].zone === "command" ? p.commanders[0] : null;
    const quietOn = QUIET.find(on);
    const steps = [];
    const step = (text, cards) => steps.push({ text, cards: cards || [] });
    const brain = mode === "mulligan" ? null : plan(g, p);

    // ---- the opening hand
    if (mode === "mulligan") {
      const hand = ctx.hand || p.hand, names = hand.map(o => o.def.name);
      const lands = hand.filter(o => o.def.types.includes("Land")).length;
      const fast = hand.filter(o => !o.def.types.includes("Land") && (FAST.includes(o.def.name) || DORKS.includes(o.def.name) || (o.def.ai && o.def.ai.ramp))).map(o => o.def.name);
      const green = hand.some(o => o.def.types.includes("Land") && !NOT_GREEN.includes(o.def.name)) || names.some(n => n === "Elvish Spirit Guide" || n === "Lotus Petal");
      const pieces = names.filter(n => PIECES.includes(n)), tutors = names.filter(n => ALL_TUTORS.includes(n));
      const locks = names.filter(n => LOCKS.includes(n));
      const mana = lands + fast.length;
      let title, keep;
      if (lands === 0 && fast.length < 2) { title = "Mulligan: no lands"; keep = false; }
      else if (!green) { title = "Mulligan: no green source"; keep = false; }
      else if (mana < 3 && lands < 2) { title = "Mulligan: too little mana"; keep = false; }
      else if (lands >= 6) { title = "Mulligan: too many lands"; keep = false; }
      else if (pieces.length + tutors.length >= 2 && mana >= 3) { title = "Great keep: mana and a plan"; keep = true; }
      else if (pieces.length + tutors.length >= 1 && mana >= 3) { title = "Keep: mana and a way to the combo"; keep = true; }
      else if (mana >= 4) { title = "Keep: lots of mana, find the combo later"; keep = true; }
      else { title = "Risky: little mana and no combo piece"; keep = null; }
      step(`${lands} land${lands === 1 ? "" : "s"}${fast.length ? `, ${fast.length} ramp` : ""}: about ${mana} mana by turn ${Math.max(2, Math.min(4, mana))}.${green ? "" : " Nothing makes {G}, and most of the deck needs it."}`, fast.slice(0, 2));
      if (pieces.length) step(`Combo piece${pieces.length > 1 ? "s" : ""}: ${list(pieces)}. Look for the partner with a tutor.`, pieces);
      if (tutors.length) step(`Tutor${tutors.length > 1 ? "s" : ""}: ${list(tutors)}. A tutor counts as the combo piece it finds.`, tutors.slice(0, 2));
      if (locks.length) step(`Lock piece${locks.length > 1 ? "s" : ""}: ${list(locks)}. It keeps opponents quiet while you set up.`, locks.slice(0, 2));
      if (!pieces.length && !tutors.length) step("No combo piece or tutor: you'll be drawing for one. Keep only if the mana is very good.");
      if (inHand("Gemstone Caverns")) step("Not going first? Gemstone Caverns begins on the battlefield: exile your worst card for it.", ["Gemstone Caverns"]);
      return { stage: "Opening hand", title, keep, steps };
    }

    // ---- something on the stack, a combat or an end step: answer it
    if (mode === "respond") {
      const can = new Set(ctx.can || []);
      const top = ctx.top, def = top && (top.o ? top.o.def : top.src && top.src.def);
      const theirs = top && top.p && top.p !== p;
      if (ctx.window === "stack" && theirs && def) {
        const ai = def.ai || {};
        const hits = (top.targets || []).filter(t => t && !g.isPlayer(t) && t.controller === p);
        const wipe = ai.wipe || ((def.types.includes("Sorcery") || def.types.includes("Instant")) && /(destroy|exile|return) all [^.]*(creatures|permanents)|damage to each creature/i.test(def.text || ""));
        if (wipe) {
          const save = ["Teferi's Protection", "Flawless Maneuver"].filter(n => can.has(n));
          if (save.length) step(`${top.name} is a board wipe. Hexproof doesn't stop it. Cast ${save[0]} now${save[0] === "Flawless Maneuver" && shalai ? " (free, you control your commander)" : ""}.`, save);
          else if (can.has("Reprieve")) step(`${top.name} is a board wipe. Reprieve puts it back in their hand and draws you a card.`, ["Reprieve"]);
          else step(`${top.name} is a board wipe and you hold no answer. Next time keep Teferi's Protection or Flawless Maneuver for it.`, ["Teferi's Protection", "Flawless Maneuver"]);
          return { stage: "Defend", title: `Board wipe: ${top.name}`, steps, urgent: save.length > 0 || can.has("Reprieve") };
        }
        if (hits.length) {
          const hit = hits[0], key = hit === shalai || PIECES.includes(hit.def.name);
          if (can.has("Giver of Runes") && hit.def.name !== "Giver of Runes") step(`Tap Giver of Runes: give ${short(hit.def.name)} protection from the spell's color. It fizzles.`, ["Giver of Runes", hit.def.name]);
          if (can.has("Veil of Summer") && [...g.colorsOf(top.o || top.src)].some(c => c === "U" || c === "B")) step(`Veil of Summer gives your permanents hexproof from blue and black this turn: ${top.name} fizzles, and you draw.`, ["Veil of Summer"]);
          if (can.has("Reprieve")) step(`Reprieve returns ${top.name} to its owner's hand.`, ["Reprieve"]);
          if (!steps.length) step(hit === shalai ? "Shalai has no hexproof herself, and you hold no answer. Lightning Greaves or Giver of Runes protect her next time." : `${short(hit.def.name)} is the target and you hold no answer. ${shalai ? "" : "Shalai would have given it hexproof."}`, hit === shalai ? ["Lightning Greaves", "Giver of Runes"] : []);
          return { stage: "Defend", title: `${top.name} targets your ${short(hit.def.name)}`, steps, urgent: key && steps.some(s => s.cards.length && can.has(s.cards[0])) };
        }
        if (ai.tutor || /search(es)? (their|your) library/i.test(def.text || "") || /Tutor$/.test(def.name)) {
          if (can.has("Aven Mindcensor")) { step(`${top.p.name} is searching. Flash in Aven Mindcensor now: they only see the top four cards.`, ["Aven Mindcensor"]); return { stage: "Defend", title: `${top.p.name} is tutoring`, steps, urgent: true }; }
        }
        if (can.has("Silence") || can.has("Orim's Chant")) {
          const s = can.has("Silence") ? "Silence" : "Orim's Chant";
          if (myTurn) { step(`${s} in response stops ${top.p.name} casting more spells this turn, so they can't answer your combo after this one.`, [s]); return { stage: "Go off", title: `${top.p.name} responds`, steps }; }
          step(`If ${top.p.name} is about to win, ${s} now stops every spell after this one this turn.`, [s]);
        }
        if (can.has("Reprieve") && (def.types.includes("Creature") || def.types.includes("Sorcery")) && def.mv >= 5) step(`${top.name} is a big spell. Reprieve sends it back and costs them the turn's mana.`, ["Reprieve"]);
        return { stage: myTurn ? "Your turn" : "Their turn", title: `${top.p.name} casts ${top.name}`, steps: steps.length ? steps : [{ text: "Nothing here needs an answer. Save your instants for removal on Shalai, a board wipe or someone's winning turn.", cards: [] }] };
      }
      if (ctx.window === "end") {
        if (ctx.turnOf && g.nextPlayer(ctx.turnOf) !== p) return { stage: myTurn ? "Your turn" : "Their turn", title: "", steps };
        const flash = FLASH.filter(n => can.has(n));
        if (flash.length) step(`Flash in ${list(flash)} now: it is ready on your turn and they had no turn to answer it.`, flash);
        // the best line that an instant tutor you can cast now moves forward
        const ls = brain ? brain.lines.filter(l => l.when !== "blocked") : [];
        let done = false;
        for (const l of ls) {
          const t = l.tutors.find(x => can.has(x));
          const st = t && l.steps.find(x => x.cards[0] === t);
          if (!st) continue;
          step(`End of their turn: cast ${t} for ${short(st.cards[1])} (${l.title}). You untap with your mana back${l.missing.length > 1 ? `; then ${list(l.missing.filter(n => n !== st.cards[1]).map(short))}` : ""}.`, [t, st.cards[1]]);
          done = true; break;
        }
        if (!done) { const tut = ["Worldly Tutor", "Eladamri's Call", "Chord of Calling"].filter(n => can.has(n)); if (tut.length) step(`End of their turn: ${tut[0]} now for the piece you're missing. You untap with the mana back.`, tut.slice(0, 1)); }
        return { stage: "Their turn", title: "End of turn: your instants", steps, urgent: steps.length > 0 };
      }
      if (ctx.window === "combat") {
        const rem = ["Swords to Plowshares", "Path to Exile"].filter(n => can.has(n));
        if (rem.length && !myTurn) step(`${rem[0]} can exile the biggest attacker before damage. Better saved for a combo piece or a lock aimed at you, unless the damage is lethal.`, rem);
        return { stage: myTurn ? "Combat" : "Their turn", title: "Before damage", steps };
      }
      return { stage: myTurn ? "Your turn" : "Their turn", title: "", steps };
    }

    // ---- combat
    if (mode === "attack") {
      const opp = g.opponents(p).filter(q => !q.lost);
      const hater = opp.find(q => g.battlefield.some(o => o.controller === q && HATE[o.def.name]));
      const tgt = hater || opp.slice().sort((a, b) => b.hand.length - a.hand.length)[0];
      const stay = (ctx.candidates || []).filter(o => PIECES.includes(o.def.name) || o.def.name === "Giver of Runes" || (o === shalai && !g.kw(o, "hexproof"))).map(o => o.def.name);
      const atk = (ctx.candidates || []).filter(o => !stay.includes(o.def.name));
      const pw = atk.reduce((s, o) => s + Math.max(0, g.power(o)), 0);
      const kill = opp.filter(q => q.life <= pw).sort((a, b) => a.life - b.life)[0];
      if (kill) step(`Your other attackers have ${pw} power and ${kill.name} is at ${kill.life}: they can die this turn if nothing blocks.`);
      if (tgt) step(hater ? `Attack ${tgt.name}: they have a hate piece out, and the pressure pulls their mana away from answers.` : `Attack ${tgt.name}: the most cards in hand is the most likely to answer your combo.`);
      if (stay.length) step(`Keep ${list([...new Set(stay)].map(short))} home: a combo piece lost in combat costs you the game plan.`, [...new Set(stay)].slice(0, 3));
      if (on("Kutzil, Malamet Exemplar")) step("Kutzil draws a card when a creature bigger than its printed power deals combat damage.", ["Kutzil, Malamet Exemplar"]);
      return { stage: "Combat", title: "Who attacks", steps };
    }
    if (mode === "block") {
      const att = ctx.attackers || [];
      const at = att.filter(a => a.combat && a.combat.attacking === p);
      const dmg = at.reduce((s, a) => s + Math.max(0, g.power(a)), 0);
      if (dmg >= p.life) step(`${dmg} damage is coming at you and you're at ${p.life}. Block enough to live, with dorks first.`);
      else step(`${dmg} damage is coming at you (you're at ${p.life}). Life is a resource: take it rather than lose a creature you need.`);
      step("Don't block with Devoted Druid, Vizier, Spike Feeder, Ballista or Giver: they are worth more than the life.", ["Devoted Druid", "Giver of Runes"]);
      if (shalai) step("Shalai is a 3/4 flyer and can block safely, but she dies to bigger attackers or a combat trick.", ["Shalai, Voice of Plenty"]);
      return { stage: "Their turn", title: "Blocks", steps };
    }

    const pact = pactTip(g, p);
    if (pact && (pact.level === "now" || /due/.test(pact.title) || mode === "main")) step(`${pact.title}. ${pact.text}`, pact.cards);
    // ---- their turn, waiting
    if (!myTurn) {
      const hold = INSTANTS.filter(inHand);
      if (hold.length) step(`Hold ${list(hold.slice(0, 4))}. The game stops for you when something needs an answer.`, hold.slice(0, 3));
      if (on("Giver of Runes")) step("Giver of Runes stays untapped for removal aimed at Shalai.", ["Giver of Runes"]);
      const flash = FLASH.filter(inHand);
      if (flash.length) step(`${list(flash)}: cast it at the end of the turn before yours.`, flash);
      for (const t of (brain ? brain.threats : []).filter(x => x.kind === "lethal")) step(`${t.title}: ${t.text}`, t.answers.slice(0, 2));
      if (!steps.length) step("Nothing to do yet. Watch what they set up: the coach lists their hate pieces.");
      return { stage: "Their turn", title: `${g.active.name}'s turn`, steps };
    }

    // ---- your turn: where you are in the game plan
    const sources = g.battlefield.filter(o => o.controller === p && g.manaAbilities(o).length).length;
    const fake = on("Vizier of Remedies") && on("Spike Feeder") && !on("Archangel of Thune") && !on("Heliod, Sun-Crowned") && !on("Devoted Druid");
    if (fake) step("Vizier of Remedies and Spike Feeder don't combo: Feeder removes +1/+1 counters, and Vizier only stops -1/-1 counters. Feeder needs Archangel of Thune or Heliod; Vizier needs Devoted Druid.", ["Vizier of Remedies", "Spike Feeder", "Devoted Druid", "Archangel of Thune"]);
    const silence = ["Silence", "Orim's Chant"].find(castable);
    const r = brain || { lines: [], threats: [], risk: { who: [] }, state: {} };
    const lines = r.lines.filter(l => l.when !== "blocked");
    const winNow = lines.find(l => l.when === "now" && l.kill);
    if (winNow) {
      const who = r.risk.who;
      if (!quietOn && silence) step(`First cast ${silence}: ${who.length ? `${list(who)} can't` : "nobody can"} respond with a spell this turn.`, [silence]);
      else if (!quietOn && who.length) step(`${list(who)} ${who.length > 1 ? "have" : "has"} cards and open mana and can respond. Go anyway if waiting gives them a turn.`);
      for (const st of winNow.steps) step(st.text, st.cards);
      return { stage: "Go off", title: `Win now: ${winNow.title}`, steps, urgent: true };
    }
    // a hate piece that stops your plan, and you hold the answer: answer it first
    const hit = r.threats.find(t => t.kind === "hate" && t.level === "high" && t.answers.some(castable));
    if (hit && mode === "main") step(`${hit.title}: ${hit.text} ${hit.answerText}`, [hit.name].concat(hit.answers.filter(castable).slice(0, 1)));
    if (mode === "main" && g.phase === "main2") {
      const hold = INSTANTS.filter(inHand);
      if (hold.length) step(`Before you pass: keep mana up for ${list(hold.slice(0, 3))}.`, hold.slice(0, 3));
      if (on("Giver of Runes")) step("Leave Giver of Runes untapped.", ["Giver of Runes"]);
      const flash = FLASH.filter(inHand);
      if (flash.length) step(`Don't cast ${list(flash)} now: it is better at the end of the turn before yours.`, flash);
      const nxt = lines[0];
      if (nxt && nxt.when === "next") step(`Next turn: ${nxt.title} (${nxt.cost}, you'll have ${r.state.manaNext} mana).`, lineCards(nxt).slice(0, 3));
      if (!steps.length) step("Nothing to hold back. Pass when ready.");
      return { stage: "End of your turn", title: "Before you pass", steps };
    }
    const landDrop = p.landsPlayed < g.landDrops(p) && p.hand.some(c => c.def.types.includes("Land"));
    if (landDrop) step("Play a land first. Crack a fetch land now, not later.");
    const ramp = p.hand.filter(c => (FAST.includes(c.def.name) || DORKS.includes(c.def.name)) && g.castOptions(p, c).length).map(c => c.def.name);
    const locks = LOCKS.filter(castable);
    const pactNow = pactTip(g, p);
    if (sources < 4 && !shalai) {
      if (ramp.length) step(`Cast ${list([...new Set(ramp)].slice(0, 3))}: mana first, the combo needs about 5 to 6.`, ramp.slice(0, 2));
      if (on("Deafening Silence")) step("Deafening Silence is out: only one noncreature spell per turn, yours too.", ["Deafening Silence"]);
      planStep();
      return { stage: "Ramp", title: "Build mana", steps, urgent: !!(pactNow && pactNow.level === "now") };
    }
    if (!shalai) {
      if (shalaiHome && g.castOptions(p, shalaiHome).length) step("Cast Shalai: your other creatures and you get hexproof, so spot removal can't touch the combo.", ["Shalai, Voice of Plenty"]);
      else if (shalaiHome) step(`Shalai costs ${shalaiHome.def.cost}${g.commanderTax(p, shalaiHome) ? ` plus {${g.commanderTax(p, shalaiHome)}} tax` : ""}. Build to it before risking combo pieces.`, ["Shalai, Voice of Plenty"]);
      if (locks.length) step(`${list(locks.slice(0, 2))}: against a fast table, a lock piece comes before Shalai.`, locks.slice(0, 2));
      if (ramp.length) step(`More mana: ${list([...new Set(ramp)].slice(0, 2))}.`, ramp.slice(0, 2));
      planStep();
      return { stage: "Shield up", title: "Get Shalai out", steps };
    }
    if (shalai && !g.kw(shalai, "hexproof") && !g.kw(shalai, "shroud") && on("Lightning Greaves")) step("Equip Lightning Greaves to Shalai ({0}) unless a combo piece needs the haste.", ["Lightning Greaves"]);
    if (locks.length && !quietOn) step(`${list(locks.slice(0, 2))} keeps opponents from answering. Cast it before the combo piece.`, locks.slice(0, 2));
    planStep();
    if (!steps.length) step("Develop: more mana, a lock piece, and keep a tutor for the missing combo piece.");
    return { stage: "Assemble", title: lines[0] && lines[0].when === "now" ? lines[0].title : "Find the combo", steps };

    // the planner's best line: what to do about it this turn
    function planStep() {
      const l = lines[0];
      if (!l) {
        const off = r.lines.find(x => x.when === "blocked");
        if (off) step(`Once ${list(off.blockedBy.map(h => `${h.owner}'s ${short(h.name)}`))} ${off.blockedBy.length > 1 ? "are" : "is"} gone: ${off.title} (${off.cost}). ${off.steps[0].text}`, lineCards(off).slice(0, 3));
        return;
      }
      if (l.when === "now") { for (const st of l.steps.slice(0, 3)) step(st.text, st.cards); return; }
      const tut = l.tutors.find(t => B().TUTORS[t] && B().TUTORS[t].instant && inHand(t));
      const fetch = tut && (l.steps.find(st => st.cards[0] === tut) || {}).cards;
      const what = l.missing.length ? `${list(l.missing.map(short))} for ${l.title}` : l.title;
      if (l.when === "next") {
        if (tut && fetch && fetch[1]) step(`Next turn: ${l.title}. Hold ${tut} and cast it at the end of the turn before yours for ${short(fetch[1])}${l.early ? ` (${l.early})` : ""}; you untap with all your mana for the rest (${l.onTurn}, you'll have ${r.state.manaNext}).`, [tut, fetch[1]]);
        else step(`Next turn: ${what}. It costs ${l.onTurn} and you'll have ${r.state.manaNext} mana. ${l.steps[0].text}`, lineCards(l).slice(0, 3));
      } else step(`Closest line: ${what}. It costs ${l.cost} (${l.mana} mana) and you have ${r.state.manaNow}. ${l.steps[0].text}`, lineCards(l).slice(0, 3));
    }
  }
  const B = () => root.CorruptedBrain || (root.MK && root.MK.CorruptedBrain);

  MK.CORRUPTED_DECK = {
    id: "corrupted", hero: "corrupted", variant: "corrupted", alsoOn: ["miku"], name: "Corrupted Miku", label: "Corrupted Miku", title: "Shalai, Voice of Plenty (Miku, Voice Over All)",
    commander: "Shalai, Voice of Plenty", identity: ["G", "W"], bracket: 4, aggression: 0.5,
    style: "Hexproof combo",
    blurb: "Bracket 4 Selesnya combo: Shalai gives everything else hexproof, lock pieces stop opponents on your turn, and two-card combos win (Thune + Feeder, Heliod + Ballista, Druid + Vizier). Coach tips show what to look for.",
    watch: ["Archangel of Thune", "Heliod, Sun-Crowned", "Devoted Druid"],
    list: LIST,
    coach: { tips: coachTips, companion, plan, checklist: "corrupted" }
  };
  MK.CORRUPTED_COMBOS = COMBOS;
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.CORRUPTED_DECK);
})(typeof window !== "undefined" ? window : globalThis);
