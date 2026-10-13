/* Doctor Doom, King of Latveria: a Bracket 3 (upper end) Grixis Villains deck for the bots, built
   from the retail "Doom Prevails" precon (Marvel Super Heroes Commander, 2026).
   How it wins: every combat Doom makes a Villain connive (draw, then discard). A land discarded with
   Doom out drains each opponent for 2; a nonland one grows the creature, and Mayhem creatures
   (Abomination, The Squadron Sinister) come back from the graveyard cheaply the turn they are
   discarded. Prowler, Baron Strucker, Ultron Unlimited and Iron Monger turn each connive into
   counters, tokens and cards; Madame Hydra, Crimson Cowl and the token makers go wide, and The Masters
   of Evil and Patchwork Banner pump the Villain team. Kang and Red Ghost pay off the second card drawn
   each turn. Cycling lands, Frantic Search and the looting spells are extra land discards for Doom.
   The top end is big Villains (Thanos, Doctor Doom Unrivaled, Red Hulk, Venom) and Grixis dragons.
   The precon's slow and unsupported cards (suspend, miracle, control-swapping, Sword of Kang,
   Damocles Base, Tri-Sentinel, Act of Vengeance) are replaced by staples: cheap removal, Counterspell,
   Talismans and Signets, Skullclamp, and three game changers (Rhystic Study, Demonic Tutor, Cyclonic Rift).
   Some other Marvel Villains are defined here too but are not in the current list (kept for tuning).
   Card text follows the Oracle text. Where the engine simplifies a card, `note` says how.
   MK.DECK_BRAINS.doom picks the discards (mayhem, land drains), cycles lands for Doom and answers
   the deck's "may" questions. See ENGINE.md. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const DECK_ID = "doom";
  const DOOM = "Doctor Doom, King of Latveria";

  /* ================================================================ helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const isLandCard = o => o.def.types.includes("Land");
  const villainCard = o => !!o && (o.def.subtypes.includes("Villain") || !!o.def.changeling);
  const isVillain = (g, o) => g.isCreature(o) && g.hasSub(o, "Villain");
  const villainsOf = (g, p) => g.controlled(p, o => isVillain(g, o));
  const hasVillain = (g, p) => g.controlled(p, o => isVillain(g, o)).length > 0;
  const named = (g, p, n) => g.battlefield.some(o => o.controller === p && o.def.name === n);
  const V = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const landCount = (g, p) => g.controlled(p, o => g.isLand(o)).length;
  function log(g, text, p, cards) { g.log(text, { p, cards: cards || [] }); }
  /* "Whenever you draw your second card each turn" */
  const secondDraw = (g, s, ev) => ev.p === s.controller && (ev.p.drawnThisTurn || []).length === 2;
  /* "This ability triggers only once each turn." */
  function onceTurn(g, s, key) { if (s.state[key] === g.turn) return false; s.state[key] = g.turn; return true; }

  /* Connive, with Leader, Super-Genius ("instead you draw a card, then that creature connives"). */
  async function connive(g, o, src) {
    if (!o || o.zone !== "battlefield") return null;
    const p = o.controller;
    const leaders = g.controlled(p, c => c.def.name === "Leader, Super-Genius").length;
    if (leaders) { g.draw(p, leaders); log(g, `${p.name} draws ${leaders === 1 ? "a card" : leaders + " cards"} first (Leader, Super-Genius).`, p, ["Leader, Super-Genius"]); }
    return g.connive(o, src || o);
  }

  /* ---------- tokens */
  T.doomVillain = MK.tokenDef({ key: "doom-villain-21", name: "Villain", pt: [2, 1], colors: "B", subtypes: ["Villain"], keywords: ["menace"] });
  T.doomRobot = MK.tokenDef({ key: "doom-robot-villain", name: "Robot", types: ["Artifact", "Creature"], pt: [2, 2], colors: [], subtypes: ["Robot", "Villain"] });
  T.doomApe = MK.tokenDef({ key: "doom-ape-villain", name: "Ape", pt: [3, 3], colors: "R", subtypes: ["Ape", "Villain"], keywords: ["haste"] });

  /* ---------- bot helpers */
  /* The Villain we want to connive and give menace: one that can attack this turn, the biggest first. */
  function conniveTarget(g, p, opts) {
    const mineOpts = opts.filter(o => !g.isPlayer(o) && o.controller === p);
    if (!mineOpts.length) return undefined;
    const score = o => (g.kw(o, "defender") ? -20 : 0) + ((!o.sick || g.kw(o, "haste")) && !o.tapped ? 10 : 0) + g.power(o) + (g.kw(o, "flying") ? 2 : 0) + (o.isToken ? -1 : 0);
    return mineOpts.slice().sort((a, b) => score(b) - score(a))[0];
  }
  const helpHook = (g, p, req) => (req.purpose === "help" ? conniveTarget(g, p, req.options) : undefined);
  /* Can p cast a discarded mayhem card right now or later this turn (its own turn, a main phase to come)? */
  function mayhemSoon(g, p, c) {
    if (!c.def.mayhem || g.active !== p) return false;
    if (g.phase === "end" || g.phase === "cleanup") return false;
    const cost = MK.parseCost(c.def.mayhem);
    return g.canPay(p, cost, { spell: c });
  }
  const MAYHEM_RANK = { "Abomination, World Ravager": 10, "The Squadron Sinister": 9, "Ultimate Green Goblin": 6, "Raging Goblinoids": 5, "Swarm, Being of Bees": 3 };
  /* Which card to discard (connive, Ultimate Green Goblin, looting). */
  function discardPick(g, p, opts) {
    if (!opts.length) return null;
    const doomOut = named(g, p, DOOM);
    const lands = opts.filter(isLandCard);
    const onField = landCount(g, p);
    // 1. a mayhem creature we can cast back this turn
    const may = opts.filter(c => mayhemSoon(g, p, c)).sort((a, b) => (MAYHEM_RANK[b.def.name] || 1) - (MAYHEM_RANK[a.def.name] || 1));
    if (may.length && (MAYHEM_RANK[may[0].def.name] || 0) >= 5) return [may[0]];
    // 2. a spare land: each opponent loses 2 with Doom out
    const spareLand = lands.length && (onField >= 7 || (onField >= 5 && onField + lands.length >= 7) || (doomOut && onField >= 5) || lands.length >= 3);
    if (spareLand) {
      const worst = lands.slice().sort((a, b) => (b.def.etbTapped === true) - (a.def.etbTapped === true) || (b.def.cycling ? 1 : 0) - (a.def.cycling ? 1 : 0))[0];
      return [worst];
    }
    if (may.length) return [may[0]];
    // 3. otherwise the card we need least
    const inHand = lands.length;
    const threats = g.opponents(p).some(q => g.creatures(q).some(o => V(g, o) >= 6));
    const keep = c => {
      const d = c.def, ai = d.ai || {};
      if (isLandCard(c)) return onField + inHand <= 4 ? 9 : onField >= 6 ? 1 : 5;
      let k = ai.priority != null ? ai.priority : 5;
      if (ai.removal) k += threats ? 3 : 1;
      if (ai.counter) k -= 1;
      if (ai.ramp) k += onField < 5 ? 2 : -3;
      if (d.mv > onField + 2) k -= 2;
      if (villainCard(c) && d.types.includes("Creature")) k += 1;
      if (d.name === "Exsanguinate") k += 3;
      return k;
    };
    return [opts.slice().sort((a, b) => keep(a) - keep(b))[0]];
  }

  /* ================================================================ the commander */
  D({
    name: DOOM, cost: "{1}{U}{B}{R}", type: "Legendary Creature — Human Noble Villain", pt: "3/3",
    text: "Whenever you discard one or more land cards, each opponent loses 2 life.\nAt the beginning of combat on your turn, target Villain you control gains menace until end of turn. It connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
    note: "Land cards discarded together (Frantic Search, one spell or ability) trigger it once; separate discards each trigger it.",
    triggers: [
      {
        on: "discard", doomDrain: true,
        when: (g, s, ev) => ev.p === s.controller && !!ev.o && isLandCard(ev.o) && !g.pending.some(x => x.src === s && x.tr && x.tr.doomDrain),
        do: (g, s, ev, { p }) => {
          for (const q of g.opponents(p)) g.loseLife(q, 2, s);
        }
      },
      {
        on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Doctor Doom: a Villain you control gains menace and connives", filter: (g2, o) => o.controller === p && isVillain(g2, o) }), s);
          if (!t || t.zone !== "battlefield") return;
          g.grant([t], ["menace"]);
          await connive(g, t, s);
        }
      }
    ],
    ai: { priority: 9, target: helpHook }
  });

  /* ================================================================ Villains */
  D({
    name: "Prowler, Clawed Thief", cost: "{1}{U}{B}", type: "Legendary Creature — Human Rogue Villain", pt: "2/3",
    keywords: ["menace"],
    text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever another Villain you control enters, Prowler connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
    triggers: [{ on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && isVillain(g, ev.o), do: (g, s) => connive(g, s, s) }],
    ai: { priority: 8 }
  });
  D({
    name: "Baron Strucker, HYDRA Overlord", cost: "{2}{B}", type: "Legendary Creature — Human Villain", pt: "2/2",
    text: "Villain spells you cast cost {1} less to cast.\nWhenever another Villain you control enters, you may have it connive. Do this only once each turn. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
    statics: [{ costMod: (g, s, card) => (villainCard(card) ? 1 : 0) }],
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && isVillain(g, ev.o) && s.state.struckerT !== g.turn,
      do: async (g, s, ev, { p }) => {
        if (s.state.struckerT === g.turn || ev.o.zone !== "battlefield") return;
        s.state.struckerT = g.turn;
        await connive(g, ev.o, s);
      }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Tombstone, Career Criminal", cost: "{2}{B}", type: "Legendary Creature — Human Villain", pt: "2/2",
    text: "When Tombstone enters, return target Villain card from your graveyard to your hand.\nVillain spells you cast cost {1} less to cast.",
    statics: [{ costMod: (g, s, card) => (villainCard(card) ? 1 : 0) }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", purpose: "reanimate", prompt: "Tombstone: return a Villain card to your hand", from: (g2, pl) => pl.graveyard.filter(c => villainCard(c) && c !== s) }), s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "hand"); log(g, `${p.name} returns ${t.def.name} to their hand (Tombstone).`, p, [t.def.name]); }
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Madame Hydra", cost: "{2}{B}{R}", type: "Legendary Creature — Human Villain", pt: "2/3",
    text: "Whenever you cast a Villain spell, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && villainCard(ev.o) && !(ev.item && ev.item.isCopy), do: (g, s, ev, { p }) => g.createToken(p, T.doomVillain) }],
    ai: { priority: 8 }
  });
  D({
    name: "Kang, Temporal Tyrant", cost: "{2}{U}{B}", type: "Legendary Creature — Human Villain", pt: "3/4",
    text: "Whenever Kang attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\nWhenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life.",
    triggers: [
      { on: "attacks", self: true, do: (g, s) => connive(g, s, s) },
      { on: "draw", when: secondDraw, do: (g, s, ev, { p }) => { let n = 0; for (const q of g.opponents(p)) { g.loseLife(q, 1, s); n++; } if (n) g.gainLife(p, 1, s); } }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Iron Monger, Sadistic Tycoon", cost: "{2}{B}", type: "Legendary Artifact Creature — Human Villain", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever a creature you control connives, put a +1/+1 counter on each Villain you control.",
    triggers: [{ on: "connive", when: (g, s, ev) => !!ev.o && ev.o.controller === s.controller, do: (g, s, ev, { p }) => { for (const o of villainsOf(g, p)) g.addCounters(o, "p1", 1, s); } }],
    ai: { priority: 7 }
  });
  D({
    name: "Ultron, Unlimited", cost: "{1}{U}{B}", type: "Legendary Artifact Creature — Robot Villain", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever Ultron attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\nWhenever a creature you control connives, you may pay {1}. If you do, create a 2/2 colorless Robot Villain artifact creature token.",
    triggers: [
      { on: "attacks", self: true, do: (g, s) => connive(g, s, s) },
      {
        on: "connive", when: (g, s, ev) => !!ev.o && ev.o.controller === s.controller,
        do: async (g, s, ev, { p }) => {
          const cost = MK.parseCost("{1}");
          if (!g.canPay(p, cost)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: "Ultron: pay {1} to create a 2/2 Robot Villain?", src: s, purpose: "doomUltron" });
          if (ok && g.pay(p, cost)) g.createToken(p, T.doomRobot);
        }
      }
    ],
    ai: { priority: 8, confirm: () => true }
  });
  D({
    name: "The Frightful Four", cost: "{3}{B}", type: "Legendary Creature — Villain", pt: "4/4",
    keywords: ["menace"],
    text: "Menace\nWhenever an opponent casts their first noncreature spell each turn, that player loses life equal to that spell's mana value.",
    triggers: [{
      on: "cast",
      when: (g, s, ev) => !!ev.p && ev.p !== s.controller && !!ev.o && !ev.o.def.types.includes("Creature") && !(ev.item && ev.item.isCopy) && g.castThisTurn(ev.p, e => e.nc) === 1,
      do: (g, s, ev) => { const n = ev.o.def.mv || 0; if (n > 0 && !ev.p.lost) g.loseLife(ev.p, n, s); }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Typhoid Mary, Fractured", cost: "{1}{B}{R}", type: "Legendary Creature — Mutant Villain", pt: "3/3",
    text: "Whenever Typhoid Mary attacks, choose one at random. If you discarded a card this turn, you choose one instead.\n• Mary — Create a Treasure token.\n• Typhoid Mary — Draw a card.\n• Bloody Mary — Each opponent loses 2 life and you gain 2 life.",
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = [{ id: "mary", label: "Mary: create a Treasure" }, { id: "typhoid", label: "Typhoid Mary: draw a card" }, { id: "bloody", label: "Bloody Mary: each opponent loses 2, you gain 2" }];
        let k;
        if (g.discardedThisTurn(p) > 0) k = await g.ask(p, { type: "option", prompt: "Typhoid Mary: choose one", options: opts, purpose: "mode", src: s });
        if (!opts.some(o => o.id === k)) k = opts[Math.floor(g.random() * 3)].id;
        if (k === "mary") g.createToken(p, T.treasure);
        else if (k === "typhoid") g.draw(p, 1);
        else { for (const q of g.opponents(p)) g.loseLife(q, 2, s); g.gainLife(p, 2, s); }
        log(g, `Typhoid Mary: ${opts.find(o => o.id === k).label}.`, p, ["Typhoid Mary, Fractured"]);
      }
    }],
    ai: {
      priority: 7,
      option: (g, p) => (g.opponents(p).some(q => q.life <= 2) ? "bloody" : p.hand.length <= 2 ? "typhoid" : landCount(g, p) < 6 ? "mary" : "bloody")
    }
  });
  D({
    name: "Red Ghost, Intangible Genius", cost: "{2}{U}{R}", type: "Legendary Creature — Human Scientist Villain", pt: "2/3",
    text: "Ward {2}\nRed Ghost can't be blocked.\nWhenever you draw your second card each turn, create a 3/3 red Ape Villain creature token with haste.",
    statics: [{ applies: (g, s, o) => o === s, unblockable: true }],
    triggers: [MK.wardTrigger(2), { on: "draw", when: secondDraw, do: (g, s, ev, { p }) => g.createToken(p, T.doomApe) }],
    ai: { priority: 8 }
  });
  D({
    name: "Loki, the Deceiver", cost: "{1}{U}{B}{R}", type: "Legendary Creature — God Sorcerer Villain", pt: "4/4",
    text: "Whenever Loki attacks, create a tapped and attacking token that's a copy of another target Villain you control, except it isn't legendary and it's an Illusion in addition to its other types. Sacrifice that token at the beginning of the next end step.\nWhenever one or more Villains you control deal combat damage to a player, draw a card.",
    note: "The copy attacks the player or planeswalker Loki attacks.",
    triggers: [
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "copy", prompt: "Loki: copy another Villain you control", filter: (g2, o) => o !== s && o.controller === p && isVillain(g2, o) }), s);
          if (!t || t.zone !== "battlefield") return;
          const base = MK.copiable(t);
          g.copyToken(p, t, {
            except: { supertypes: base.supertypes.filter(x => x !== "Legendary"), legendary: false, subtypes: base.subtypes.includes("Illusion") ? base.subtypes : base.subtypes.concat("Illusion") },
            tapped: true, attacking: g.combat ? ev.target : null, sacEnd: true
          });
        }
      },
      {
        on: "combatDamagePlayer",
        when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && ev.p !== s.controller && g.isCreature(ev.src) && g.hasSub(ev.src, "Villain") && s.state.lokiHit !== `${g.turn}:${ev.p.id != null ? ev.p.id : ev.p.name}`,
        do: (g, s, ev, { p }) => { s.state.lokiHit = `${g.turn}:${ev.p.id != null ? ev.p.id : ev.p.name}`; g.draw(p, 1); }
      }
    ],
    ai: {
      priority: 8,
      target: (g, p, req) => (req.purpose === "copy" ? req.options.filter(o => !g.isPlayer(o) && o.controller === p).sort((a, b) => V(g, b) - V(g, a))[0] : undefined)
    }
  });
  D({
    name: "The Squadron Sinister", cost: "{5}{U}{R}", type: "Legendary Creature — Human Villain", pt: "5/5",
    keywords: ["flying", "haste"],
    mayhem: "{3}{U}{R}",
    text: "Flying, haste\nOther Villains you control get +2/+2 and have flying and haste.\nMayhem {3}{U}{R} (You may cast this card from your graveyard for {3}{U}{R} if you discarded it this turn. Timing rules still apply.)",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && (o.def.subtypes.includes("Villain") || (o.isToken && (o.def.subtypes || []).includes("Villain"))), pt: [2, 2], kw: ["flying", "haste"] }],
    note: "The anthem counts creatures whose printed or token type line says Villain.",
    ai: { priority: 8 }
  });
  D({
    name: "Abomination, World Ravager", cost: "{7}{R}", type: "Legendary Creature — Gamma Berserker Villain", pt: "10/10",
    keywords: ["menace", "trample"],
    mayhem: "{4}{R}",
    text: "Menace, trample\nMayhem {4}{R} (You may cast this card from your graveyard for {4}{R} if you discarded it this turn. Timing rules still apply.)",
    ai: { priority: 6 }
  });
  D({
    name: "Moonstone, Harsh Mistress", cost: "{3}{B}", type: "Legendary Creature — Human Doctor Villain", pt: "2/4",
    keywords: ["flying"],
    text: "Flying\nWhenever you discard a card, you may exile that card from your graveyard. If you do, until the end of your next turn, you may play that card.",
    triggers: [{
      on: "discard", when: (g, s, ev) => ev.p === s.controller && !!ev.o,
      do: async (g, s, ev, { p }) => {
        const c = ev.o;
        if (c.zone !== "graveyard") return;
        const ok = await g.ask(p, { type: "confirm", prompt: `Moonstone: exile ${c.def.name}? You may play it until the end of your next turn.`, src: s, purpose: "doomMoonstone", card: c });
        if (!ok || c.zone !== "graveyard") return;
        g.moveTo(c, "exile");
        if (c.zone !== "exile") return;
        const zc = c.zc;
        c.playable = { by: p, forever: true };
        g.delayed.push({ at: "endStep", once: true, player: p, controller: p, turn: g.turn + 1, src: s, do: () => { if (c.zone === "exile" && c.zc === zc) c.playable = null; } });
        log(g, `${p.name} exiles ${c.def.name} with Moonstone and may play it until the end of their next turn.`, p, [c.def.name]);
      }
    }],
    ai: { priority: 7, confirm: (g, p, req) => !(req.card && mayhemSoon(g, p, req.card)) }
  });
  D({
    name: "Puppet Master, String Puller", cost: "{2}{R}", type: "Legendary Creature — Human Artificer Villain", pt: "2/4",
    text: "Whenever you attack, goad target creature an opponent controls. It can't block this turn. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)\nWhenever one or more goaded creatures deal combat damage to one of your opponents, create a Treasure token.",
    triggers: [
      {
        on: "attack", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", opp: true, purpose: "harm", prompt: "Puppet Master: goad a creature (it can't block this turn)", filter: (g2, o) => o.controller !== p }), s);
          if (!t || t.zone !== "battlefield") return;
          g.goad(t, p);
          g.addEffect({ objs: [t], cantBlock: true });
        }
      },
      {
        on: "combatDamagePlayer",
        when: (g, s, ev) => !!ev.src && !!ev.src.state && !!ev.src.state.goad && ev.src.state.goad.by === s.controller && ev.p !== s.controller && s.state.pmHit !== `${g.turn}:${ev.p.name}`,
        do: (g, s, ev, { p }) => { s.state.pmHit = `${g.turn}:${ev.p.name}`; g.createToken(p, T.treasure); }
      }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Tiger Shark, Abyssal Hunter", cost: "{2}{U/B}{U/B}", type: "Legendary Creature — Shark Human Villain", pt: "2/3",
    text: "Whenever Tiger Shark enters or attacks, he connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\n{4}{U/B}: Tiger Shark can't be blocked this turn.",
    triggers: [
      { on: "enters", self: true, do: (g, s) => connive(g, s, s) },
      { on: "attacks", self: true, do: (g, s) => connive(g, s, s) }
    ],
    abilities: [{
      label: "Can't be blocked", cost: "{4}{U/B}",
      do: (g, s) => { if (s.zone === "battlefield") g.addEffect({ objs: [s], unblockable: true }); },
      once: true,
      ai: { use: (g, p, o, { window }) => window === "main1" && !o.tapped && (!o.sick || g.kw(o, "haste")) && g.power(o) >= 4 }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Madame Masque", cost: "{4}{B}", type: "Legendary Creature — Human Villain", pt: "3/2",
    text: "When Madame Masque enters, she connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\nWhenever you draw your second card each turn, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
    triggers: [
      { on: "enters", self: true, do: (g, s) => connive(g, s, s) },
      { on: "draw", when: secondDraw, do: (g, s, ev, { p }) => g.createToken(p, T.doomVillain) }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Mob Lookout", cost: "{1}{U/B}", type: "Creature — Human Rogue Villain", pt: "0/3",
    text: "When this creature enters, target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Mob Lookout: target creature you control connives", filter: (g2, o) => o.controller === p }), s);
        if (t) await connive(g, t, s);
      }
    }],
    ai: { priority: 7, target: helpHook }
  });
  D({
    name: "Red Room Recruit", cost: "{1}{B}", type: "Creature — Human Spy Villain", pt: "1/2",
    text: "When this creature enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
    triggers: [{ on: "enters", self: true, do: (g, s) => connive(g, s, s) }],
    ai: { priority: 7 }
  });
  D({
    name: "Leader, Super-Genius", cost: "{2}{U}{U}", type: "Legendary Creature — Gamma Scientist Villain", pt: "1/3",
    text: "If a creature you control would connive, instead you draw a card, then that creature connives.\nAt the beginning of combat on your turn, target creature you control connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
    note: "The extra card works for this deck's connive cards; other decks' connive effects don't see it.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Leader: target creature you control connives", filter: (g2, o) => o.controller === p }), s);
        if (t) await connive(g, t, s);
      }
    }],
    ai: { priority: 8, target: helpHook }
  });
  D({
    name: "Swarm, Being of Bees", cost: "{2}{B}", type: "Legendary Creature — Insect Villain", pt: "2/2",
    keywords: ["flash", "flying"],
    mayhem: "{B}",
    text: "Flash\nFlying\nMayhem {B} (You may cast this card from your graveyard for {B} if you discarded it this turn. Timing rules still apply.)",
    ai: { priority: 5, instantEnd: true }
  });
  D({
    name: "Ultimate Green Goblin", cost: "{1}{B/R}{B/R}", type: "Legendary Creature — Goblin Villain", pt: "5/4",
    mayhem: "{2}{B/R}",
    text: "At the beginning of your upkeep, discard a card, then create a Treasure token.\nMayhem {2}{B/R} (You may cast this card from your graveyard for {2}{B/R} if you discarded it this turn. Timing rules still apply.)",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        if (p.hand.length) {
          const pick = await g.ask(p, { type: "cards", prompt: "Ultimate Green Goblin: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
          const c = (pick && pick[0] && pick[0].zone === "hand") ? pick[0] : p.hand[p.hand.length - 1];
          if (c) g.discard(p, c);
        }
        g.createToken(p, T.treasure);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Green Goblin, Nemesis", cost: "{2}{B/R}", type: "Legendary Creature — Goblin Human Villain", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever you discard a nonland card, put a +1/+1 counter on target Goblin you control.\nWhen you discard a land card, create a tapped Treasure token.",
    triggers: [
      {
        on: "discard", when: (g, s, ev) => ev.p === s.controller && !!ev.o && !isLandCard(ev.o),
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Green Goblin: +1/+1 counter on a Goblin you control", filter: (g2, o) => o.controller === p && g2.hasSub(o, "Goblin") }), s);
          if (t && t.zone === "battlefield") g.addCounters(t, "p1", 1, s);
        }
      },
      { on: "discard", when: (g, s, ev) => ev.p === s.controller && !!ev.o && isLandCard(ev.o), do: (g, s, ev, { p }) => g.createToken(p, T.treasure, { tapped: true }) }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Doctor Octopus, Master Planner", cost: "{5}{U}{B}", type: "Legendary Creature — Human Scientist Villain", pt: "4/8",
    text: "Other Villains you control get +2/+2.\nYour maximum hand size is eight.\nAt the beginning of your end step, if you have fewer than eight cards in hand, draw cards equal to the difference.",
    note: "Hand size isn't enforced by the engine, so the second ability does nothing here.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && (o.def.subtypes || []).includes("Villain"), pt: [2, 2] }],
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      intervening: (g, s) => s.controller.hand.length < 8,
      do: (g, s, ev, { p }) => { const n = 8 - p.hand.length; if (n > 0 && p.library.length > n + 2) g.draw(p, n); }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Pharaoh Rama-Tut", cost: "{4}{U}", type: "Legendary Creature — Human Noble Villain", pt: "4/4",
    text: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nWhenever you cast a noncreature spell, Pharaoh Rama-Tut connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)",
    triggers: [MK.wardTrigger(2), { on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && !ev.o.def.types.includes("Creature") && !(ev.item && ev.item.isCopy), do: (g, s) => connive(g, s, s) }],
    ai: { priority: 7 }
  });
  D({
    name: "Crossbones, Malicious Mercenary", cost: "{3}{B}", type: "Legendary Creature — Human Mercenary Villain", pt: "3/3",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhenever another Villain you control enters, put a +1/+1 counter on Crossbones. He deals 2 damage to each opponent. This ability triggers only once each turn.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && isVillain(g, ev.o) && s.state.xbT !== g.turn && onceTurn(g, s, "xbT"),
      do: (g, s, ev, { p }) => {
        if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
        for (const q of g.opponents(p)) g.damage(s, q, 2);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Elektra, Daughter of the Hand", cost: "{2}{B}{B}", type: "Legendary Creature — Human Ninja Villain", pt: "3/3",
    text: "Sneak {1}{B}{B} (You may cast this spell for {1}{B}{B} if you also return an unblocked attacker you control to hand during the declare blockers step. She enters tapped and attacking.)\nWhen Elektra enters, destroy target creature an opponent controls with power 3 or less.",
    note: "Sneak isn't used: she is always cast for her mana cost.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", opp: true, purpose: "harm", prompt: "Elektra: destroy a creature with power 3 or less", filter: (g2, o) => o.controller !== p && g2.power(o) <= 3 }), s);
        if (t && t.zone === "battlefield" && g.power(t) <= 3) g.destroy(t, s);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Ultron the Annihilator", cost: "{3}{B}{B}", type: "Legendary Artifact Creature — Robot Villain", pt: "3/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Ultron enters or attacks, create a 2/2 colorless Robot Villain artifact creature token.\nWhenever another artifact is put into your graveyard from the battlefield or an artifact card is put into your graveyard from anywhere other than the battlefield, each opponent loses 1 life.",
    note: "Artifact cards milled into your graveyard don't count.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.doomRobot) },
      { on: "attacks", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.doomRobot) },
      {
        on: "leaves", when: (g, s, ev) => ev.o !== s && ev.to === "graveyard" && !!ev.lki && ev.o.owner === s.controller && (ev.lki.types || ev.o.def.types || []).includes("Artifact"),
        do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); }
      },
      {
        on: "discard", when: (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.types.includes("Artifact"),
        do: (g, s, ev, { p }) => { for (const q of g.opponents(p)) g.loseLife(q, 1, s); }
      }
    ],
    ai: { priority: 8 }
  });
  D({
    name: "Grendel, Spawn of Knull", cost: "{3}{B}", type: "Legendary Creature — Symbiote Dragon Villain", pt: "3/3",
    keywords: ["flying", "deathtouch"],
    text: "Flying (This creature can't be blocked except by creatures with flying or reach.)\nDeathtouch (Any amount of damage this deals to a creature is enough to destroy it.)",
    ai: { priority: 7 }
  });
  D({
    name: "Thanos, Death's Consort", cost: "{2}{B}{B}", type: "Legendary Creature — Eternal Villain", pt: "3/3",
    keywords: ["lifelink"],
    text: "Lifelink\nWhenever another creature dies, put a +1/+1 counter on Thanos.",
    triggers: [{ on: "dies", when: (g, s, ev) => ev.o !== s && !!ev.lki && ev.lki.creature, do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); } }],
    ai: { priority: 7 }
  });
  D({
    name: "Doctor Doom, Unrivaled", cost: "{2}{B}{B}", type: "Legendary Creature — Human Sorcerer Villain", pt: "4/4",
    keywords: ["lifelink"],
    text: "Lifelink\n{T}: You draw a card and lose 1 life. Then if your library has no cards in it, you win the game. (You win even if you have 0 life or didn't draw a card.)",
    abilities: [{
      label: "Draw a card", tap: true,
      do: (g, s, ctx) => {
        const p = ctx.p;
        g.draw(p, 1);
        g.loseLife(p, 1, s);
        if (!p.library.length && !p.lost) g.win(p, "Doctor Doom, Unrivaled");
      },
      ai: { use: (g, p, o, { window, turnOf }) => window === "end" && turnOf !== p && g.nextPlayer(turnOf) === p && p.life > 8 && p.library.length > 5 }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Venom, Eddie Brock", cost: "{4}{B}{B}", type: "Legendary Creature — Symbiote Villain", pt: "6/4",
    keywords: ["menace"],
    text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhenever another creature dies, put a +1/+1 counter on Venom. If that creature was a Villain, draw a card.",
    triggers: [{
      on: "dies", when: (g, s, ev) => ev.o !== s && !!ev.lki && ev.lki.creature,
      do: (g, s, ev, { p }) => {
        if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
        if ((ev.lki.subtypes || []).includes("Villain")) g.draw(p, 1);
      }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Green Goblin, Back for More", cost: "{3}{B}{B}", type: "Legendary Creature — Goblin Human Villain", pt: "4/4",
    keywords: ["flying", "menace"],
    mayhem: "{3}{B}{B}",
    text: "Flying, menace\nAt the beginning of combat on your turn, you may discard a card. If you do, each opponent discards a card.\nMayhem {3}{B}{B} (You may cast this card from your graveyard for {3}{B}{B} if you discarded it this turn. Timing rules still apply.)",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        if (!p.hand.length) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Green Goblin: discard a card to make each opponent discard a card?", src: s, purpose: "doomGoblin" });
        if (!ok || !p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Green Goblin: discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
        const c = (pick && pick[0] && pick[0].zone === "hand") ? pick[0] : p.hand[p.hand.length - 1];
        if (!c) return;
        g.discard(p, c);
        for (const q of g.opponents(p)) {
          if (!q.hand.length) continue;
          const qp = await g.ask(q, { type: "cards", prompt: "Green Goblin: discard a card", options: q.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
          const qc = (qp && qp[0] && qp[0].zone === "hand") ? qp[0] : q.hand[q.hand.length - 1];
          if (qc) g.discard(q, qc);
        }
      }
    }],
    ai: {
      priority: 7,
      // worth it with a spare land (Doom drains), a mayhem card or a big hand
      confirm: (g, p) => p.hand.length >= 3 || p.hand.some(c => c.def.types.includes("Land") && g.controlled(p, o => g.isLand(o)).length >= 5) || p.hand.some(c => c.def.mayhem)
    }
  });
  D({
    name: "Shocker, Unshakable", cost: "{4}{R}{R}", type: "Legendary Creature — Human Rogue Villain", pt: "5/5",
    text: "During your turn, Shocker has first strike.\nVibro-Shock Gauntlets — When Shocker enters, he deals 2 damage to target creature and 2 damage to that creature's controller.",
    statics: [{ applies: (g, s, o) => o === s && g.active === s.controller, kw: ["first strike"] }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", amount: 2, prompt: "Shocker: 2 damage to a creature and 2 to its controller", filter: (g2, o) => o.controller !== p }), s);
        if (!t || t.zone !== "battlefield") return;
        const q = t.controller;
        g.damage(s, t, 2);
        if (q && !q.lost) g.damage(s, q, 2);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Red Hulk", cost: "{4}{R}{R}", type: "Legendary Creature — Gamma Berserker Villain", pt: "6/7",
    keywords: ["reach", "trample"],
    text: "Reach, trample\nEnrage — Whenever Red Hulk is dealt damage, put a +1/+1 counter on him. When you do, he deals damage equal to the number of +1/+1 counters on him to any other target.",
    triggers: [{
      on: "damage", when: (g, s, ev) => ev.target === s && ev.amount > 0,
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        g.addCounters(s, "p1", 1, s);
        const n = s.counters.p1 || 0;
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `Red Hulk deals ${n} damage to`, filter: (g2, o) => o !== s }), s);
        if (t && (g.isPlayer(t) || t.zone === "battlefield")) g.damage(s, t, n);
      }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "The Masters of Evil", cost: "{5}{B}", type: "Legendary Creature — Human Villain", pt: "5/6",
    text: "Other Villains you control get +2/+1.\n{1}{B}, Discard this card: Search your library for a Plan card, reveal it, put it into your hand, then shuffle.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && (o.def.subtypes || []).includes("Villain"), pt: [2, 1] }],
    channel: {
      label: "Search for a Plan", cost: "{1}{B}",
      do: async (g, o, ctx) => {
        const p = ctx.p;
        const pool = (g.librarySearch ? g.librarySearch(p) : p.library).filter(c => (c.def.subtypes || []).includes("Plan"));
        const pick = pool.length ? await g.ask(p, { type: "target", prompt: "The Masters of Evil: find a Plan card", options: pool, optional: true, purpose: "tutor", src: o }) : null;
        if (pick && pick.zone === "library") { g.moveTo(pick, "hand"); log(g, `${p.name} reveals ${pick.def.name} and puts it into their hand.`, p, [pick.def.name]); }
        g.shuffle(p);
      }
    },
    ai: { priority: 8 }
  });
  D({
    name: "Crimson Cowl, Master of Evil", cost: "{2}{B}", type: "Legendary Creature — Human Villain", pt: "1/3",
    text: "Whenever one or more nontoken Villains you control attack a player, you create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
    note: "Once per combat, when at least one of your nontoken Villains attacks a player.",
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller && (ev.attackers || []).some(a => !a.isToken && isVillain(g, a) && a.combat && g.isPlayer(a.combat.attacking)),
      do: (g, s, ev, { p }) => g.createToken(p, T.doomVillain)
    }],
    ai: { priority: 7 }
  });
  async function edict(g, q, src) {
    const opts = g.creatures(q);
    if (!opts.length || q.lost) return;
    let pick = await g.ask(q, { type: "target", prompt: `${src.def.name}: sacrifice a creature`, options: opts, purpose: "sacrifice", src });
    if (!pick || !opts.includes(pick) || pick.zone !== "battlefield") pick = opts.slice().sort((a, b) => V(g, a) - V(g, b))[0];
    g.sacrifice(pick);
  }
  D({
    name: "Ultimo, Civilization's End", cost: "{4}{B}{B}", type: "Legendary Artifact Creature — Robot Villain", pt: "6/5",
    keywords: ["menace"],
    text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen Ultimo enters, each opponent sacrifices a creature of their choice.\n{2}{B}, Discard this card: Each opponent sacrifices a creature of their choice.",
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => { for (const q of g.orderFrom(p).slice(1)) await edict(g, q, s); } }],
    channel: { label: "Each opponent sacrifices", cost: "{2}{B}", do: async (g, o, ctx) => { for (const q of g.orderFrom(ctx.p).slice(1)) await edict(g, q, o); } },
    ai: { priority: 7 }
  });

  /* ================================================================ spells */
  D({
    name: "Glorious Purpose", cost: "{1}{U}", type: "Enchantment — Plan",
    text: "Whenever a creature you control connives, put a +1/+1 counter on that creature and a plan counter on this enchantment.\nWhen the sixth plan counter is put on this enchantment, sacrifice it. If you do, exile the top four cards of your library. You may cast any number of spells from among them without paying their mana costs. Put the rest into your hand.",
    note: "Lands among the four cards go to your hand.",
    triggers: [{
      on: "connive", when: (g, s, ev) => !!ev.o && ev.o.controller === s.controller,
      do: async (g, s, ev, { p }) => {
        if (ev.o.zone === "battlefield") g.addCounters(ev.o, "p1", 1, s);
        if (s.zone !== "battlefield") return;
        g.addCounters(s, "plan", 1, s);
        if ((s.counters.plan || 0) < 6 || s.state.done) return;
        s.state.done = true;
        g.sacrifice(s);
        const cards = p.library.slice(0, 4);
        for (const c of cards) g.moveTo(c, "exile");
        log(g, `Glorious Purpose: ${p.name} exiles ${cards.map(c => c.def.name).join(", ")}.`, p, cards.map(c => c.def.name));
        for (const c of cards) {
          if (c.zone !== "exile" || isLandCard(c)) continue;
          const ok = await g.ask(p, { type: "confirm", prompt: `Glorious Purpose: cast ${c.def.name} without paying its mana cost?`, src: s, purpose: "doomGlorious", card: c });
          if (ok) { await g.castWithoutPaying(p, c); await g.settle(); }
        }
        for (const c of cards) if (c.zone === "exile") g.moveTo(c, "hand");
      }
    }],
    ai: { priority: 6, confirm: () => true }
  });
  D({
    name: "Doom Reigns Supreme", cost: "{1}{B}", type: "Enchantment — Plan",
    text: "Whenever a Villain you control enters, each opponent loses 1 life and you gain 1 life. Put a plan counter on this enchantment.\nWhen the fifth plan counter is put on this enchantment, sacrifice it. When you do, target opponent exiles the top five cards of their library. You may cast up to two spells from among the exiled cards without paying their mana costs.",
    note: "The opponent with the most cards in library is chosen; you are asked about the spells, the biggest first.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && isVillain(g, ev.o),
      do: async (g, s, ev, { p }) => {
        let n = 0;
        for (const q of g.opponents(p)) { g.loseLife(q, 1, s); n++; }
        if (n) g.gainLife(p, 1, s);
        if (s.zone !== "battlefield" || s.state.done) return;
        g.addCounters(s, "plan", 1, s);
        if ((s.counters.plan || 0) < 5) return;
        s.state.done = true;
        g.sacrifice(s);
        const q = await g.chooseTarget(p, trig({ kind: "opponent", purpose: "harm", prompt: "Doom Reigns Supreme: target opponent exiles the top five cards of their library" }), s);
        if (!q || q.lost) return;
        const cards = q.library.slice(0, 5);
        for (const c of cards) g.moveTo(c, "exile");
        log(g, `${q.name} exiles ${cards.map(c => c.def.name).join(", ")} (Doom Reigns Supreme).`, p, cards.map(c => c.def.name));
        let cast = 0;
        for (const c of cards.filter(c => !isLandCard(c)).sort((a, b) => b.def.mv - a.def.mv)) {
          if (cast >= 2 || p.lost) break;
          if (c.zone !== "exile") continue;
          const ok = await g.ask(p, { type: "confirm", prompt: `Doom Reigns Supreme: cast ${c.def.name} without paying its mana cost?`, src: s, purpose: "doomReigns", card: c });
          if (ok && await g.castWithoutPaying(p, c)) { cast++; await g.settle(); }
        }
      }
    }],
    ai: { priority: 7, confirm: () => true }
  });
  D({
    name: "Criminal Enterprise", cost: "{2}{B}", type: "Enchantment",
    text: "When this enchantment enters, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)\nWhenever a Villain you control dies, this enchantment deals 1 damage to each opponent and you gain 1 life.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.doomVillain) },
      {
        on: "dies", when: (g, s, ev) => !!ev.lki && ev.lki.controller === s.controller && ev.lki.creature && (ev.lki.subtypes || []).includes("Villain"),
        do: (g, s, ev, { p }) => { let n = 0; for (const q of g.opponents(p)) { g.damage(s, q, 1); n++; } if (n) g.gainLife(p, 1, s); }
      }
    ],
    ai: { priority: 7 }
  });
  const oppPower = (g, p) => g.opponents(p).reduce((n, q) => n + g.creatures(q).reduce((m, o) => m + Math.max(0, g.power(o)), 0), 0);
  D({
    name: "Disrupt Decorum", cost: "{2}{R}{R}", type: "Sorcery",
    text: "Goad all creatures you don't control. (Until your next turn, those creatures attack each combat if able and attack a player other than you if able.)",
    spell: {
      do: (g, ctx) => {
        const list = g.battlefield.filter(o => g.isCreature(o) && o.controller !== ctx.p);
        g.quiet = (g.quiet || 0) + 1;
        try { for (const o of list) g.goad(o, ctx.p); } finally { g.quiet = Math.max(0, g.quiet - 1); }
        log(g, `${ctx.p.name} goads ${list.length} creature${list.length === 1 ? "" : "s"} (Disrupt Decorum).`, ctx.p, ["Disrupt Decorum"]);
      }
    },
    ai: { priority: 6, cast: (g, p) => (oppPower(g, p) >= 10 && g.opponents(p).filter(q => g.creatures(q).length).length >= 2 ? undefined : false) }
  });
  D({
    name: "Kang Dynasty", cost: "{3}{U}", type: "Enchantment — Saga",
    text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI, II — For each opponent, tap up to one target creature that player controls. Goad those creatures. Until your next turn, whenever any of those creatures deals combat damage to a player, draw a card.\nIII — Target creature you control gets +1/+1 until end of turn for each card in your hand and can't be blocked this turn.",
    note: "The card draw lasts while the Saga is on the battlefield (until it is sacrificed after chapter III).",
    saga: (function () {
      const goadEach = async (g, s, p) => {
        const marks = s.state.kangMarks = (s.state.kangMarks || []).filter(m => m.turn >= g.turn - 8);
        for (const q of g.opponents(p)) {
          const t = await g.chooseTarget(p, trig({ kind: "creature", optional: true, purpose: "harm", prompt: `Kang Dynasty: tap and goad a creature ${q.name} controls`, filter: (g2, o) => o.controller === q }), s);
          if (!t || t.zone !== "battlefield") continue;
          g.tap(t);
          g.goad(t, p);
          marks.push({ id: t.id, zc: t.zc, turn: g.turn });
        }
      };
      return [goadEach, goadEach, async (g, s, p) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Kang Dynasty: +1/+1 for each card in your hand and can't be blocked", filter: (g2, o) => o.controller === p }), s);
        if (!t || t.zone !== "battlefield") return;
        const n = p.hand.length;
        g.addEffect({ objs: [t], pt: [n, n], unblockable: true });
      }];
    })(),
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => !!ev.src && (s.state.kangMarks || []).some(m => m.id === ev.src.id && m.zc === ev.src.zc) && !!ev.src.state.goad && ev.src.state.goad.by === s.controller,
      do: (g, s, ev, { p }) => g.draw(p, 1)
    }],
    ai: { priority: 6, cast: (g, p) => (g.opponents(p).some(q => g.creatures(q).length) ? undefined : false), target: helpHook }
  });
  D({
    name: "Avengers: Under Siege", cost: "{2}{B}{R}", type: "Enchantment — Saga",
    text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Create two 2/1 black Villain creature tokens with menace.\nII — This Saga deals 2 damage to each non-Villain creature and each opponent.\nIII — Create a Treasure token for each Villain you control.",
    saga: [
      (g, s, p) => g.createToken(p, T.doomVillain, { count: 2 }),
      (g, s, p) => {
        for (const o of g.battlefield.filter(c => g.isCreature(c) && !g.hasSub(c, "Villain"))) g.damage(s, o, 2);
        for (const q of g.opponents(p)) g.damage(s, q, 2);
      },
      (g, s, p) => { const n = villainsOf(g, p).length; if (n) g.createToken(p, T.treasure, { count: n }); }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Age of Ultron", cost: "{4}{B}", type: "Enchantment — Saga",
    text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — For each opponent, destroy up to one target nonartifact creature that player controls.\nII — For each opponent, you create a 2/2 colorless Robot Villain artifact creature token.\nIII — Artifact creatures you control gain deathtouch until end of turn. Put a +1/+1 counter on each of them.",
    saga: [
      async (g, s, p) => {
        for (const q of g.opponents(p)) {
          const t = await g.chooseTarget(p, trig({ kind: "creature", optional: true, purpose: "harm", prompt: `Age of Ultron: destroy a nonartifact creature ${q.name} controls`, filter: (g2, o) => o.controller === q && !g2.isArtifact(o) }), s);
          if (t && t.zone === "battlefield") g.destroy(t, s);
        }
      },
      (g, s, p) => { const n = g.opponents(p).length; if (n) g.createToken(p, T.doomRobot, { count: n }); },
      (g, s, p) => { const list = g.controlled(p, o => g.isCreature(o) && g.isArtifact(o)); if (!list.length) return; g.grant(list, ["deathtouch"]); for (const o of list) g.addCounters(o, "p1", 1, s); }
    ],
    ai: { priority: 7, cast: (g, p) => (g.opponents(p).some(q => g.creatures(q).some(o => !g.isArtifact(o))) ? undefined : false) }
  });
  D({
    name: "Endless Ranks of HYDRA", cost: "{3}{B}", type: "Sorcery",
    text: "For each opponent, you create a 2/1 black Villain creature token with menace.\nWhenever your commander enters or attacks, you may pay {1}{B}. If you do, return this card from your graveyard to your hand.",
    spell: { do: (g, ctx) => { const n = g.opponents(ctx.p).length; if (n) g.createToken(ctx.p, T.doomVillain, { count: n }); } },
    triggers: ["enters", "attacks"].map(on => ({
      on, zone: "graveyard",
      when: (g, s, ev) => !!ev.o && ev.o.isCommander && ev.o.controller === s.owner,
      do: async (g, s, ev) => {
        const p = s.owner;
        const cost = MK.parseCost("{1}{B}");
        if (s.zone !== "graveyard" || !g.canPay(p, cost)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Pay {1}{B} to return Endless Ranks of HYDRA to your hand?", src: s, purpose: "doomRanks" });
        if (ok && s.zone === "graveyard" && g.pay(p, cost)) { g.moveTo(s, "hand"); log(g, `${p.name} returns Endless Ranks of HYDRA to their hand.`, p, ["Endless Ranks of HYDRA"]); }
      }
    })),
    ai: { priority: 6, confirm: () => true }
  });
  /* Discard n cards (one at a time, so the bots pick each with the deck's brain). */
  async function discardN(g, p, n, src, except) {
    for (let i = 0; i < n; i++) {
      const opts = p.hand.filter(c => c !== except);
      if (!opts.length) return;
      const pick = await g.ask(p, { type: "cards", prompt: `${src.def.name}: discard a card`, options: opts, min: 1, max: 1, purpose: "discard", src });
      const c = (pick && pick[0] && pick[0].zone === "hand" && pick[0] !== except) ? pick[0] : opts[opts.length - 1];
      g.discard(p, c);
    }
  }
  /* A spell that loots: worth casting when we have a spare land to feed Doom or nothing better to do. */
  const lootCast = (g, p, o, ctx) => (ctx && ctx.window === "main1" && p.hand.filter(c => c !== o && !isLandCard(c)).some(c => g.castOptions(p, c).length) ? false : undefined);
  D({
    name: "Faithless Looting", cost: "{R}", type: "Sorcery",
    flashback: "{2}{R}",
    text: "Draw two cards, then discard two cards.\nFlashback {2}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    spell: { do: async (g, ctx) => { g.draw(ctx.p, 2); await discardN(g, ctx.p, 2, ctx.o); } },
    ai: { priority: 5, draw: true, cast: lootCast }
  });
  D({
    name: "Cathartic Reunion", cost: "{1}{R}", type: "Sorcery",
    text: "As an additional cost to cast this spell, discard two cards.\nDraw three cards.",
    canCast: (g, p, o) => p.hand.filter(c => c !== o).length >= 2,
    onCast: async (g, p, o) => { await discardN(g, p, 2, o, o); },
    spell: { do: (g, ctx) => { g.draw(ctx.p, 3); } },
    ai: { priority: 5, draw: true, cast: (g, p, o, ctx) => (p.hand.filter(c => c !== o).length >= 2 ? lootCast(g, p, o, ctx) : false) }
  });
  D({
    name: "Big Score", cost: "{3}{R}", type: "Instant",
    text: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    canCast: (g, p, o) => p.hand.some(c => c !== o),
    onCast: async (g, p, o) => { await discardN(g, p, 1, o, o); },
    spell: { do: (g, ctx) => { g.draw(ctx.p, 2); g.createToken(ctx.p, T.treasure, { count: 2 }); } },
    ai: { priority: 6, draw: true, cast: (g, p, o, ctx) => (ctx && (ctx.window === "main1" || ctx.window === "main2" || ctx.window === "end") ? undefined : false) }
  });
  D({
    name: "Unexpected Windfall", cost: "{2}{R}{R}", type: "Instant",
    text: "As an additional cost to cast this spell, discard a card.\nDraw two cards and create two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    canCast: (g, p, o) => p.hand.some(c => c !== o),
    onCast: async (g, p, o) => { await discardN(g, p, 1, o, o); },
    spell: { do: (g, ctx) => { g.draw(ctx.p, 2); g.createToken(ctx.p, T.treasure, { count: 2 }); } },
    ai: { priority: 6, draw: true, cast: (g, p, o, ctx) => (ctx && (ctx.window === "main1" || ctx.window === "main2" || ctx.window === "end") ? undefined : false) }
  });
  D({
    name: "Visions of Villainy", cost: "{2}{B}", type: "Instant",
    text: "This spell costs {1} less to cast if you control a Villain.\nYou draw two cards and lose 2 life.",
    costReduce: (g, p) => (hasVillain(g, p) ? 1 : 0),
    spell: { do: (g, ctx) => { g.draw(ctx.p, 2); g.loseLife(ctx.p, 2, ctx.o); } },
    ai: { priority: 6, draw: true, instantEnd: true }
  });
  D({
    name: "Venom's Hunger", cost: "{4}{B}", type: "Sorcery",
    text: "This spell costs {2} less to cast if you control a Villain.\nDestroy target creature. You gain 2 life.",
    costReduce: (g, p) => (hasVillain(g, p) ? 2 : 0),
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy" }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); g.gainLife(ctx.p, 2, ctx.o); } },
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "Bedevil", cost: "{B}{B}{R}", type: "Instant",
    text: "Destroy target artifact, creature, or planeswalker.",
    spell: { targets: [{ kind: "permanent", purpose: "harm", prompt: "Destroy", filter: (g, o) => g.isArtifact(o) || g.isCreature(o) || g.isPlaneswalker(o) }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); } },
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "Withering Torment", cost: "{2}{B}", type: "Instant",
    text: "Destroy target creature or enchantment. You lose 2 life.",
    spell: { targets: [{ kind: "creatureOrEnchantment", purpose: "harm", prompt: "Destroy" }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); g.loseLife(ctx.p, 2, ctx.o); } },
    ai: { removal: true, minThreat: 4 }
  });
  D({
    name: "Patchwork Banner", cost: "{3}", type: "Artifact",
    text: "As Patchwork Banner enters, choose a creature type.\nCreatures you control of the chosen type get +1/+1.\n{T}: Add one mana of any color.",
    note: "The chosen type is always Villain.",
    etbState: () => ({ chosenType: "Villain" }),
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && (o.def.subtypes || []).includes("Villain"), pt: [1, 1] }],
    mana: [{ tap: true, produce: "any" }],
    ai: { ramp: true, priority: 7 }
  });
  D({
    name: "Talisman of Creativity", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{T}: Add {U} or {R}. Talisman of Creativity deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["U", "R"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });

  /* ================================================================ lands */
  const land = (name, over) => D(Object.assign({ name, type: "Land" }, over));
  const villainSpell = (g, card) => villainCard(card);
  land("Villainous Hideout", {
    text: "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a Villain spell or to activate an ability of a Villain source.\n{3}, {T}: Target Villain you control connives. Activate only as a sorcery. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on that creature.)",
    note: "Its colored mana only pays for Villain spells.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: villainSpell }],
    abilities: [{
      label: "Villain connives", cost: "{3}", tap: true, timing: "sorcery",
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "A Villain you control connives", filter: (g, o, p) => o.controller === p && isVillain(g, o) }],
      do: async (g, s, ctx) => { if (ctx.legal[0]) await connive(g, ctx.targets[0], s); },
      ai: { use: (g, p, o, { window }) => window === "main2" && !p.hand.some(c => !isLandCard(c) && g.castOptions(p, c).length) }
    }],
    ai: { target: helpHook }
  });
  land("Unclaimed Territory", {
    text: "As Unclaimed Territory enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type.",
    note: "The chosen type is always Villain.",
    etbState: () => ({ chosenType: "Villain" }),
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: "any", spellOnly: (g, card) => villainCard(card) && card.def.types.includes("Creature") }]
  });
  land("Luxury Suite", {
    text: "Luxury Suite enters tapped unless you have two or more opponents.\n{T}: Add {B} or {R}.",
    etbTapped: (g, o) => g.opponents(o.controller).length < 2,
    mana: [{ tap: true, produce: ["B", "R"] }]
  });
  land("Crumbling Necropolis", {
    text: "Crumbling Necropolis enters tapped.\n{T}: Add {U}, {B}, or {R}.",
    etbTapped: true, mana: [{ tap: true, produce: ["U", "B", "R"] }]
  });
  land("Sulfur Falls", {
    text: "Sulfur Falls enters tapped unless you control an Island or a Mountain.\n{T}: Add {U} or {R}.",
    etbTapped: (g, o) => !g.controlled(o.controller, x => x !== o && g.isLand(x) && (x.def.subtypes.includes("Island") || x.def.subtypes.includes("Mountain"))).length,
    mana: [{ tap: true, produce: ["U", "R"] }]
  });
  const basicsTwo = (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x) && g.isBasic(x)).length < 2;
  land("Smoldering Marsh", {
    type: "Land — Swamp Mountain",
    text: "({T}: Add {B} or {R}.)\nSmoldering Marsh enters tapped unless you control two or more basic lands.",
    etbTapped: basicsTwo, mana: [{ tap: true, produce: ["B", "R"] }]
  });
  land("Scorched Geyser", {
    type: "Land — Island Mountain",
    text: "({T}: Add {U} or {R}.)\nThis land enters tapped unless you control two or more basic lands.",
    etbTapped: basicsTwo, mana: [{ tap: true, produce: ["U", "R"] }]
  });
  const reveal = (name, a, b, sa, sb) => land(name, {
    text: `As ${name} enters, you may reveal a ${sa} or ${sb} card from your hand. If you don't, ${name} enters tapped.\n{T}: Add {${a}} or {${b}}.`,
    note: "It reveals a card for you when it can.",
    etbTapped: (g, o) => !o.controller.hand.some(c => c !== o && (c.def.subtypes.includes(sa) || c.def.subtypes.includes(sb))),
    mana: [{ tap: true, produce: [a, b] }]
  });
  reveal("Foreboding Ruins", "B", "R", "Swamp", "Mountain");
  reveal("Frostboil Snarl", "U", "R", "Island", "Mountain");
  const cycler = (name, a, b, sa, sb) => land(name, {
    type: `Land — ${sa} ${sb}`,
    text: `({T}: Add {${a}} or {${b}}.)\n${name} enters tapped.\nCycling {2} ({2}, Discard this card: Draw a card.)`,
    etbTapped: true, cycling: "{2}", mana: [{ tap: true, produce: [a, b] }]
  });
  cycler("Fetid Pools", "U", "B", "Island", "Swamp");
  cycler("Canyon Slough", "B", "R", "Swamp", "Mountain");
  cycler("Coastal Peak", "U", "R", "Island", "Mountain");

  /* ================================================================ the deck's brain */
  /* Cycle a spare cycling land while Doom is out (each opponent loses 2), in the second main phase
     or at the end of the turn before ours. */
  function brainPlan(g, p, ctx) {
    const win = ctx.window;
    if (win !== "main2" && !(win === "end" && g.active !== p && g.nextPlayer(g.active) === p)) return null;
    const act = (ctx.actions || []).find(a => a.type === "cycle" && isLandCard(a.card));
    if (!act) return null;
    const doomOut = named(g, p, DOOM);
    const lands = landCount(g, p), inHand = p.hand.filter(isLandCard).length;
    if (doomOut ? lands >= 4 || inHand >= 2 : lands >= 6) return act;
    return null;
  }
  function brainChoose(g, p, req) {
    // "choose a creature type" (Kindred Discovery): Villain
    if (req.type === "option" && req.purpose === "creatureType" && (req.options || []).some(o => o.id === "Villain")) return "Villain";
    // Lightning Greaves keeps Doom safe
    if (req.type === "target" && req.purpose === "equip" && req.src && req.src.def.name === "Lightning Greaves") {
      const doom = (req.options || []).find(o => !g.isPlayer(o) && o.def.name === DOOM && o.controller === p);
      if (doom) return doom;
    }
    // Skullclamp goes on a token or a small Villain, never on Doom
    if (req.type === "target" && req.purpose === "equip" && req.src && req.src.def.name === "Skullclamp") {
      const opts = (req.options || []).filter(o => !g.isPlayer(o) && !o.isCommander);
      const t = opts.filter(o => g.toughness(o) === 1).sort((a, b) => V(g, a) - V(g, b))[0] || opts.filter(o => o.isToken).sort((a, b) => V(g, a) - V(g, b))[0];
      return t || undefined;
    }
    if (req.type === "cards" && req.purpose === "discard" && (req.min || 0) <= 1 && (req.max == null || req.max >= 1)) {
      const r = discardPick(g, p, req.options || []);
      return r || undefined;
    }
    return undefined;
  }
  /* Doom stays home unless the attack kills: his trigger is worth more than 3 damage. */
  function keepHome(g, p, c) { return c.def.name === DOOM && c.isCommander; }
  /* What the tutors fetch: The Squadron Sinister once Villains are out, Doom's engine pieces otherwise. */
  function tutorBonus(g, p, c) {
    const n = villainsOf(g, p).length, nm = c.def.name;
    if (nm === "The Squadron Sinister") return n >= 3 ? 10 : 2;
    if (nm === "Iron Monger, Sadistic Tycoon" || nm === "Prowler, Clawed Thief") return named(g, p, DOOM) ? 5 : 2;
    if (nm === "Rhystic Study" || nm === "Kindred Discovery") return n >= 2 ? 3 : 1;
    return 0;
  }
  (MK.DECK_TYPES = MK.DECK_TYPES || {})[DECK_ID] = "Villain";
  (MK.DECK_BRAINS = MK.DECK_BRAINS || {})[DECK_ID] = { plan: brainPlan, choose: brainChoose, keepHome, tutorBonus };

  /* ================================================================ the list */
  const I = n => Array(n).fill("Island"), B = n => Array(n).fill("Swamp"), R = n => Array(n).fill("Mountain");
  const LIST = [
    // Villains
    "Prowler, Clawed Thief", "Baron Strucker, HYDRA Overlord", "Tombstone, Career Criminal", "Madame Hydra",
    "Kang, Temporal Tyrant", "Iron Monger, Sadistic Tycoon", "Ultron, Unlimited", "Unexpected Windfall",
    "Thanos, Death's Consort", "Red Ghost, Intangible Genius", "Loki, the Deceiver", "The Squadron Sinister",
    "Abomination, World Ravager", "Goldspan Dragon", "Vampire Nighthawk",
    "Shocker, Unshakable", "Doctor Doom, Unrivaled", "Terror of the Peaks", "The Masters of Evil", "Red Hulk",
    "Thran Dynamo", "Ultimate Green Goblin", "Crimson Cowl, Master of Evil", "Doctor Octopus, Master Planner",
    "Thundermaw Hellkite", "Glorybringer", "Swamp", "Green Goblin, Back for More", "Ultron the Annihilator", "Radioactive Man",
    // mana
    "Sol Ring", "Arcane Signet", "Talisman of Dominance", "Talisman of Indulgence", "Talisman of Creativity",
    "Fellwar Stone", "Dimir Signet", "Rakdos Signet",
    // cards
    "Rhystic Study", "Siege-Gang Commander", "Big Score", "Cathartic Reunion", "Frantic Search", "Blasphemous Act",
    "Avengers: Under Siege", "Beetleback Chief", "Skullclamp", "Demonic Tutor",
    // removal
    "Terminate", "Bedevil", "Island", "Infernal Grasp", "Go for the Throat", "Chaos Warp", "Cyclonic Rift",
    "Venom's Hunger", "Age of Ultron", "Baleful Mastery",
    // counterspells
    "Counterspell", "Exsanguinate",
    // the rest
    "Venom, Eddie Brock", "Massacre Wurm", "Dragonlord Kolaghan", "Patchwork Banner",
    // lands
    "Villainous Hideout", "Command Tower", "Exotic Orchard", "Darkslick Shores", "Blackcleave Cliffs", "Luxury Suite",
    "Watery Grave", "Blood Crypt", "Steam Vents", "Polluted Delta", "Bloodstained Mire",
    "Scalding Tarn", "Drowned Catacomb", "Dragonskull Summit", "Sulfur Falls", "Sunken Hollow", "Smoldering Marsh",
    "Scorched Geyser", "Choked Estuary", "Foreboding Ruins", "Frostboil Snarl", "Fetid Pools", "Canyon Slough",
    "Coastal Peak", "Underground River", "Sulfurous Springs"
  ].concat(I(3), B(4), R(2));

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: DECK_ID, name: "Doctor Doom", title: DOOM, commander: DOOM,
    identity: ["U", "B", "R"], bracket: 3, aggression: 0.7,
    style: "Grixis Villains: connive, discard, drain",
    blurb: "Doctor Doom makes a Villain connive every combat. Discarded lands drain the table, discarded Mayhem monsters come right back, and every connive grows the Villain army.",
    watch: [DOOM, "Prowler, Clawed Thief", "Abomination, World Ravager", "The Squadron Sinister", "Madame Hydra", "Iron Monger, Sadistic Tycoon"],
    list: LIST
  });
})(typeof window !== "undefined" ? window : globalThis);
