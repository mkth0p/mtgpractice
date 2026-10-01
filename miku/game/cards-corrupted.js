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
        label: "Tap for {G}, then untap it (-1/-1 counter)",
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
  const TUTORS = {
    "Archangel of Thune": ["Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Archdruid's Charm", "Formidable Speaker", "Survival of the Fittest", "Finale of Devastation"],
    "Spike Feeder": ["Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Summoner's Pact", "Green Sun's Zenith", "Archdruid's Charm", "Recruiter of the Guard", "Formidable Speaker", "Survival of the Fittest", "Finale of Devastation"],
    "Heliod, Sun-Crowned": ["Enlightened Tutor", "Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Formidable Speaker", "Survival of the Fittest", "Finale of Devastation"],
    "Walking Ballista": ["Enlightened Tutor", "Worldly Tutor", "Eladamri's Call", "Recruiter of the Guard", "Ranger-Captain of Eos", "Brightglass Gearhulk", "Formidable Speaker", "Survival of the Fittest", "Archdruid's Charm"],
    "Devoted Druid": ["Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Summoner's Pact", "Green Sun's Zenith", "Archdruid's Charm", "Recruiter of the Guard", "Formidable Speaker", "Survival of the Fittest", "Finale of Devastation"],
    "Vizier of Remedies": ["Worldly Tutor", "Eladamri's Call", "Chord of Calling", "Archdruid's Charm", "Recruiter of the Guard", "Formidable Speaker", "Survival of the Fittest", "Finale of Devastation"]
  };
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
  const ANSWERS = ["Force of Vigor", "Generous Gift", "Archdruid's Charm", "Boseiju, Who Endures", "Swords to Plowshares", "Path to Exile", "Solitude", "Kenrith's Transformation"];
  const QUIET = ["Grand Abolisher", "Kutzil, Malamet Exemplar", "Voice of Victory"];

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
    // 1. combos already assembled
    for (const c of COMBOS) {
      if (!c.pieces.every(on)) continue;
      if (c.key === "druid") { const dr = bf("Devoted Druid")[0]; if (dr.sick && !g.kw(dr, "haste")) { out.push({ level: "plan", title: "Druid + Vizier next turn", text: "Devoted Druid is summoning sick, so it can't tap for mana yet. Lightning Greaves (equip {0}) gives it haste now.", cards: c.pieces.concat(on("Lightning Greaves") ? ["Lightning Greaves"] : []) }); continue; } }
      if (c.key === "heliodBallista" && (bf("Walking Ballista")[0].counters.p1 || 0) < 2) { out.push({ level: "plan", title: "Heliod + Ballista: one more counter", text: "Ballista needs 2 counters. Pay {4} for one, or use Shalai's {4}{G}{G}, then give it lifelink.", cards: c.pieces }); continue; }
      if (c.key === "thune" && !(bf("Spike Feeder")[0].counters.p1 > 0)) continue;
      const finisher = c.key === "druid" ? "" : on("Walking Ballista") ? " Walking Ballista is out: ping each opponent with the counters." : " Then attack with your huge flyers, or find Walking Ballista.";
      out.push({ level: "win", title: c.title, text: c.how + finisher + (quietOn || !myTurn ? "" : " Opponents can still respond: Silence or a Grand Abolisher first is safer."), cards: c.pieces });
    }
    // 2. one piece missing
    if (!out.some(t => t.level === "win")) {
      for (const c of COMBOS) {
        const have = c.pieces.filter(on), miss = c.pieces.filter(n => !on(n));
        if (have.length !== 1 || miss.length !== 1) continue;
        const need = miss[0];
        if (castable(need)) { out.push({ level: "now", title: `Cast ${need.split(",")[0]} to go off`, text: `${have[0]} is out. ${need} completes ${c.title}. ${quietOn ? `${quietOn} keeps opponents from casting spells on your turn.` : "Check what opponents can answer with first."}`, cards: [need].concat(have) }); continue; }
        const tutors = (TUTORS[need] || []).filter(n => inHand(n) || (n === "Survival of the Fittest" && on(n)));
        if (inHand(need)) out.push({ level: "plan", title: `${need.split(",")[0]} is in your hand`, text: `With ${have[0]} out, casting it completes ${c.title}. Keep the mana for it.`, cards: [need, have[0]] });
        else if (tutors.length) out.push({ level: "plan", title: `Find ${need.split(",")[0]}`, text: `${have[0]} is out. ${tutors.slice(0, 3).join(", ")} can find ${need}.`, cards: [need].concat(tutors.slice(0, 2)) });
      }
    }
    // 3. pact upkeep, protection and Shalai
    if (g.delayed.some(d => d.player === p && d.src && d.src.def && d.src.def.name === "Summoner's Pact")) out.push({ level: "warn", title: "Summoner's Pact is due", text: "At your next upkeep you must pay {2}{G}{G} or lose the game. Keep four mana, two of it green, untapped for it.", cards: ["Summoner's Pact"] });
    if (shalai && !g.kw(shalai, "shroud") && !g.kw(shalai, "hexproof")) {
      if (on("Lightning Greaves") && main) out.push({ level: "now", title: "Shalai has no hexproof", text: "She protects everyone but herself. Equip Lightning Greaves to her ({0}) unless a combo piece needs the haste.", cards: ["Lightning Greaves", "Shalai, Voice of Plenty"] });
      else if (on("Giver of Runes")) out.push({ level: "info", title: "Giver of Runes protects Shalai", text: "Keep Giver untapped. When removal targets Shalai, give her protection from that color in response.", cards: ["Giver of Runes"] });
    }
    if (!shalai && myTurn && main && p.commanders[0] && p.commanders[0].zone === "command" && g.castOptions(p, p.commanders[0]).length) out.push({ level: "now", title: "Cast Shalai before the combo pieces", text: "With Shalai out, your other creatures and you have hexproof: Swords, Path and Chaos Warp can't touch the combo. Against a fast-combo table, a lock piece can come first.", cards: ["Shalai, Voice of Plenty"] });
    // 4. hate on the table
    for (const q of g.opponents(p)) for (const o of g.battlefield) {
      if (o.controller !== q || !HATE[o.def.name]) continue;
      const ans = ANSWERS.filter(inHand);
      out.push({ level: "warn", title: `${q.name}'s ${o.def.name}`, text: `It ${HATE[o.def.name]}.${ans.length ? ` Answer it with ${ans.slice(0, 2).join(" or ")}.` : ""}`, cards: [o.def.name].concat(ans.slice(0, 1)) });
    }
    // 5. silence and protection on hand
    const silence = ["Silence", "Orim's Chant"].filter(inHand);
    if (silence.length && myTurn && main && !quietOn && out.some(t => t.level === "win" || t.level === "now")) out.push({ level: "now", title: `Cast ${silence[0]} first`, text: "Opponents can't cast spells this turn, so nothing answers your combo. (Grand Abolisher, Kutzil or Voice of Victory on the battlefield do the same on every turn of yours.)", cards: [silence[0]] });
    if (silence.length && !myTurn && g.phase === "upkeep") out.push({ level: "info", title: `${silence[0]} in their upkeep`, text: `If ${g.active.name} looks ready to win this turn, cast ${silence[0]} now: they can't cast spells for the whole turn.`, cards: [silence[0]] });
    const prot = ["Teferi's Protection", "Flawless Maneuver", "Veil of Summer"].filter(inHand);
    if (prot.length && g.creatures(p).length >= 4) out.push({ level: "info", title: `Hold ${prot[0]}`, text: prot[0] === "Veil of Summer" ? "Veil stops counterspells and blue or black removal for a turn: cast it in response." : "Hexproof doesn't stop wipes. Keep it for the turn someone casts a board wipe.", cards: [prot[0]] });
    // 6. big lines
    if (castable("Natural Order") && main) {
      const atk = g.creatures(p).filter(o => !o.sick || g.kw(o, "haste")).length + 1, n = g.creatures(p).length; // Natural Order sacrifices one, Hoof adds one
      const dmg = g.creatures(p).filter(o => !o.sick || g.kw(o, "haste")).reduce((t, o) => t + Math.max(0, g.power(o)) + n, 0) - n + 5 + n;
      const lows = g.opponents(p).map(q => q.life).sort((a, b) => a - b);
      out.push({ level: "plan", title: "Natural Order", text: `Craterhoof now: about ${Math.max(0, dmg)} trample damage from ${atk} attacker${atk > 1 ? "s" : ""} (opponents at ${lows.join(", ")}). It kills one player long before it kills the table; Vorinclex instead locks their lands.`, cards: ["Natural Order", "Craterhoof Behemoth", "Vorinclex, Voice of Hunger"] });
    }
    if (on("Kutzil, Malamet Exemplar") && myTurn && g.phase === "main1" && g.creatures(p).some(o => g.power(o) > basePower(g, o))) out.push({ level: "info", title: "Kutzil draws", text: "Creatures bigger than their printed power that deal combat damage to a player draw you a card once per combat. Shalai's and Gavony's counters count.", cards: ["Kutzil, Malamet Exemplar"] });
    if (on("Badgermole Cub") && on("Gaea's Cradle")) out.push({ level: "info", title: "Cub doubles your dorks", text: "Each creature you tap for mana adds an extra {G}, Gaea's Cradle included once it's earthbent into a creature.", cards: ["Badgermole Cub"] });
    if (on("Devoted Druid") && !on("Vizier of Remedies") && TUTORS["Vizier of Remedies"].some(inHand)) { /* covered above */ }
    if (!out.length) out.push({ level: "info", title: myTurn ? "Develop" : "Wait for your window", text: myTurn ? "Land, fast mana, then a lock piece or Shalai. Keep a tutor for the missing combo piece." : "Hold your instants: Swords and Path for threats, Reprieve for a key spell, Silence for someone's winning turn.", cards: [] });
    return out.slice(0, 8);
  }

  MK.CORRUPTED_DECK = {
    id: "corrupted", hero: "corrupted", variant: "corrupted", alsoOn: ["miku"], name: "Corrupted Miku", label: "Corrupted Miku", title: "Shalai, Voice of Plenty (Miku, Voice Over All)",
    commander: "Shalai, Voice of Plenty", identity: ["G", "W"], bracket: 4, aggression: 0.5,
    style: "Hexproof combo",
    blurb: "Bracket 4 Selesnya combo: Shalai gives everything else hexproof, lock pieces stop opponents on your turn, and two-card combos win (Thune + Feeder, Heliod + Ballista, Druid + Vizier). Coach tips show what to look for.",
    watch: ["Archangel of Thune", "Heliod, Sun-Crowned", "Devoted Druid"],
    list: LIST,
    coach: { tips: coachTips, checklist: "corrupted" }
  };
  MK.CORRUPTED_COMBOS = COMBOS;
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.CORRUPTED_DECK);
})(typeof window !== "undefined" ? window : globalThis);
