/* Cards for the upgraded Goblin Storm lists (research of 29 Oct 2026: Krenko, Mob Boss or Zada in
   command, a high Bracket 3 list and a Bracket 4 list). Krenko's own brain (decks-krenko.js) and
   Zada's (decks-zada.js) play the deck; these cards bring their own hints.
   Card text follows the Oracle text. Where the engine simplifies a card, `note` says how. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const KRENKO = "Krenko, Mob Boss";
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const trig = spec => Object.assign({ trigger: true }, spec);
  const isGoblin = (g, o) => g.hasSub(o, "Goblin");
  /* A cheap Goblin test for static abilities: g.hasSub inside `applies` would recurse into ch(). */
  const gobQuick = (g, o) => o.def.subtypes.includes("Goblin") || !!o.def.changeling;
  const goblinsOf = (g, p) => g.controlled(p, o => isGoblin(g, o));
  const value = (g, o) => (AI().value ? AI().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : value(g, o));
  const lowestLife = list => list.slice().sort((a, b) => a.life - b.life)[0] || null;
  const foes = (g, p) => g.opponents(p).filter(q => !q.lost && !g.playerHexproof(q));
  const manaLeft = (g, p) => g.maxX(p, MK.parseCost(""), 1);
  const myMain = (g, p, w) => g.active === p && (w === "main1" || w === "main2");
  const controlsCommander = (g, p) => g.battlefield.some(o => o.controller === p && o.isCommander);
  const isBlue = o => !!o && !!o.def && (o.def.colors || []).includes("U");
  const M = p => p.__gsUp || (p.__gsUp = {});
  /* A target picked when the bot decided to cast, answered when the spell asks (this turn only). */
  const plan = (g, p, key, t) => { M(p)[key] = { t, turn: g.turn }; return t; };
  const planned = (g, p, key, opts) => { const m = M(p)[key]; return m && m.turn === g.turn && opts.includes(m.t) ? m.t : undefined; };

  /* Evoke: an alternative cost that exiles a card of a color from your hand, then the creature is
     sacrificed when it enters (after its enters ability). */
  const evoke = color => ({
    altCosts: [{ label: `Evoke (exile a ${MK.COLOR_NAME[color]} card from your hand)`, cost: "", exileFromHand: { filter: (g, c) => (c.def.colors || []).includes(color), prompt: `Evoke: exile a ${MK.COLOR_NAME[color]} card from your hand` } }],
    onResolve: async (g, p, o, item) => {
      if (item.alt !== 1) return;
      g.pending.unshift({ src: o, controller: p, ev: {}, tr: { do: async g2 => { if (o.zone === "battlefield") { log(g2, `${o.def.name} was evoked and is sacrificed.`, p, [o.def.name]); g2.sacrifice(o); } } } });
    }
  });
  /* Damage divided among targets: each pick gets what kills it, the last one the rest. */
  async function divided(g, p, s, total, spec, max) {
    let left = total;
    const picks = [];
    while (left > 0 && picks.length < (max || 99)) {
      const t = await g.chooseTarget(p, Object.assign({}, spec, { amount: left, optional: picks.length > 0 || spec.optional, prompt: `${spec.prompt} (${left} damage left)`, filter: (g2, o, pl, src) => !picks.some(x => x.t === o) && (!spec.filter || spec.filter(g2, o, pl, src)) }), s);
      if (!t) break;
      const need = g.isCreature(t) ? Math.max(1, g.lethalDamageLeft(t)) : Math.max(1, t.counters.loyalty || 1);
      const d = Math.min(left, need);
      picks.push({ t, d });
      left -= d;
    }
    if (left > 0 && picks.length) picks[picks.length - 1].d += left;
    for (const { t, d } of picks) if (t.zone === "battlefield") g.damage(s, t, d);
  }

  /* ================================================================ creatures */
  D(Object.assign({
    name: "Fury", cost: "{3}{R}{R}", type: "Creature — Elemental Incarnation", pt: "3/3",
    keywords: ["double strike"],
    text: "Double strike\nWhen Fury enters, it deals 4 damage divided as you choose among any number of target creatures and/or planeswalkers.\nEvoke—Exile a red card from your hand.",
    note: "The bots aim the 4 damage at opponents' creatures and planeswalkers: enough to kill each one in turn, the rest on the last.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => divided(g, p, s, 4, trig({ kind: "creatureOrPlaneswalker", opp: true, purpose: "harm", optional: true, prompt: "Fury deals damage to" }))
    }],
    ai: { priority: 5, removal: true, minThreat: 3 }
  }, evoke("R")));
  D({
    name: "Goblin Chirurgeon", cost: "{R}", type: "Creature — Goblin Shaman", pt: "0/2",
    text: "Sacrifice a Goblin: Regenerate target creature.",
    abilities: [{
      label: "Sacrifice a Goblin: regenerate target creature",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && isGoblin(g, c), prompt: "Sacrifice a Goblin" },
      targets: [{ kind: "creature", you: true, purpose: "regen", prompt: "Regenerate" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.regenerate(ctx.targets[0], s); },
      ai: { inStack: true, use: (g, p) => !!regenWant(g, p) }
    }],
    ai: {
      priority: 4,
      target: (g, p, req) => (req.purpose === "regen" ? (req.options.includes(regenWant(g, p)) ? regenWant(g, p) : null) : undefined)
    }
  });
  /* The creature an opponent's spell or ability is about to destroy: the one it targets (our
     commander or something worth 6), or our commander under a wipe. Once per creature per turn. */
  function regenWant(g, p) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p || top.countered) return null;
    const ok = c => c && !g.isPlayer(c) && !c.kind && c.zone === "battlefield" && c.controller === p && g.isCreature(c) &&
      !g.kw(c, "indestructible") && !(c.state.regen && c.state.regen.turn === g.turn && c.state.regen.n > 0);
    const ai = (top.o && top.o.def && top.o.def.ai) || {};
    const harm = top.kind === "spell" ? !!ai.removal : (top.ab && (top.ab.targets || []).some(sp => sp.purpose === "harm"));
    const hit = (top.targets || []).filter(ok).filter(c => c.isCommander || value(g, c) >= 6);
    if (harm && hit.length) return hit.sort((a, b) => (b.isCommander ? 99 : value(g, b)) - (a.isCommander ? 99 : value(g, a)))[0];
    const mass = ai.wipe || (AI().massHarm && top.kind === "spell" ? AI().massHarm(g, p, top) : null);
    if (mass) return g.creatures(p).filter(ok).filter(c => c.isCommander)[0] || null;
    return null;
  }
  D({
    name: "Hexing Squelcher", cost: "{1}{R}", type: "Creature — Goblin Sorcerer", pt: "2/2",
    text: "This spell can't be countered.\nWard—Pay 2 life.\nSpells you control can't be countered.\nOther creatures you control have \"Ward—Pay 2 life.\"",
    cantBeCountered: true,
    statics: [
      { applies: (g, s, o) => o.controller === s.controller && g.isCreature(o), wardLife: 2 },
      { uncounterable: (g, s, item) => item.kind === "spell" && item.p === s.controller }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Hobgoblin Bandit Lord", cost: "{1}{R}{R}", type: "Creature — Goblin Rogue", pt: "2/3",
    text: "Other Goblins you control get +1/+1.\n{R}, {T}: Hobgoblin Bandit Lord deals damage equal to the number of Goblins that entered the battlefield under your control this turn to any target.",
    note: "It counts the Goblins you control that entered this turn and are still on the battlefield.",
    statics: [{ applies: (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o) && gobQuick(g, o), pt: [1, 1] }],
    abilities: [{
      label: "Damage equal to the Goblins that entered this turn", cost: "{R}", tap: true,
      targets: [{ kind: "any", purpose: "bandit", prompt: "Hobgoblin Bandit Lord deals damage to" }],
      do: (g, s, ctx) => { const n = enteredGoblins(g, ctx.p); if (ctx.legal[0] && n > 0) g.damage(s, ctx.targets[0], n); },
      ai: {
        use: (g, p, o, ctx) => {
          const n = enteredGoblins(g, p), w = ctx.window;
          if (n < 2) return false;
          // late on our turn, so the Goblins that still come this turn count too
          const late = (w === "main2" && g.active === p) || (w === "end" && ctx.turnOf === p);
          return (late || n >= 8) && !!banditPick(g, p, n);
        }
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "bandit" ? banditPick(g, p, enteredGoblins(g, p), req.options) : undefined) }
  });
  function enteredGoblins(g, p) { return g.battlefield.filter(o => o.controller === p && o.enteredTurn === g.turn && isGoblin(g, o)).length; }
  /* Damage n to any target: an opponent it kills, else a creature or planeswalker worth it, else the lowest-life opponent. */
  function bestBurn(g, p, n, opts) {
    const fs = foes(g, p).filter(q => !opts || opts.includes(q));
    const kill = fs.filter(q => q.life <= n).sort((a, b) => b.life - a.life)[0];
    if (kill) return kill;
    const bodies = g.battlefield.filter(o => o.controller !== p && (g.isCreature(o) || o.def.types.includes("Planeswalker")) && (!opts || opts.includes(o)) && g.canTarget(p, o) &&
      (g.isCreature(o) ? g.lethalDamageLeft(o) <= n && !g.kw(o, "indestructible") : (o.counters.loyalty || 0) <= n))
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    if (bodies[0] && threatOf(g, bodies[0], p) >= 6) return bodies[0];
    return lowestLife(fs);
  }
  function banditPick(g, p, n, opts) { return bestBurn(g, p, n, opts); }
  D({
    name: "Marvin, Murderous Mimic", cost: "{2}", type: "Legendary Artifact Creature — Toy", pt: "2/2",
    text: "Marvin, Murderous Mimic has all activated abilities of creatures you control that don't have the same name as this creature.",
    note: "Marvin gets the printed activated abilities (not mana abilities) of your other creatures, one copy per name.",
    statics: [{ applies: (g, s, o) => o === s, grantAbilities: (g, s) => marvinAbilities(g, s) }],
    ai: { priority: 6 }
  });
  function marvinAbilities(g, s) {
    const out = [], seen = new Set([s.def.name]);
    for (const c of g.battlefield) {
      if (c === s || c.controller !== s.controller || seen.has(c.def.name) || !(c.def.types || []).includes("Creature")) continue;
      seen.add(c.def.name);
      for (const ab of c.def.abilities || []) if (ab.loyalty == null && !ab.manaAbility) out.push(ab);
    }
    return out;
  }
  D({
    name: "Simian Spirit Guide", cost: "{2}{R}", type: "Creature — Ape Spirit", pt: "2/2",
    text: "Exile Simian Spirit Guide from your hand: Add {R}.",
    note: "Its {R} from your hand is used only when nothing else can pay, and only for spells and abilities you pay for.",
    handMana: "R",
    ai: { priority: 1 }
  });

  /* ================================================================ artifacts */
  /* The creature an untapper should untap now: Krenko (or Marvin with his ability) once he has used
     his ability, Hobgoblin Bandit Lord after a big turn, Kiki-Jiki. */
  function untapPick(g, p, opts, w) {
    const mine = (opts || g.creatures(p)).filter(c => c && !g.isPlayer(c) && c.controller === p && c.tapped && c.zone === "battlefield");
    const score = c => {
      const abs = g.abilitiesOf(c).map(e => e.ab);
      if (abs.some(ab => ab.krenkoMake)) return 100 + goblinsOf(g, p).length;
      if (c.def.name === "Kiki-Jiki, Mirror Breaker") return 60;
      if (c.def.name === "Hobgoblin Bandit Lord" && enteredGoblins(g, p) >= 4) return 40 + enteredGoblins(g, p);
      return 0;
    };
    const best = mine.map(c => ({ c, s: score(c) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s)[0];
    return best ? best.c : null;
  }
  const untapWindow = (g, p, w, turnOf) => myMain(g, p, w) || (w === "end" && g.nextPlayer(turnOf) === p);
  const untapper = (label, filter) => ({
    label, cost: "{1}", tap: true,
    targets: [{ kind: "creature", purpose: "untap", prompt: "Untap", filter }],
    do: (g, s, ctx) => { if (ctx.legal[0]) { g.untap(ctx.targets[0]); log(g, `${s.def.name} untaps ${ctx.targets[0].def.name}.`, ctx.p, [s.def.name, ctx.targets[0].def.name]); } },
    ai: { use: (g, p, o, ctx) => untapWindow(g, p, ctx.window, ctx.turnOf) && !!untapPick(g, p, null, ctx.window) }
  });
  D({
    name: "Magewright's Stone", cost: "{2}", type: "Artifact",
    text: "{1}, {T}: Untap target creature that has an activated ability with {T} in its cost.",
    abilities: [untapper("Untap a creature with a {T} ability", (g, o) => g.abilitiesOf(o).some(e => e.ab.tap) || (o.def.mana || []).some(m => m.tap))],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "untap" ? untapPick(g, p, req.options) : undefined) }
  });
  D({
    name: "Thousand-Year Elixir", cost: "{3}", type: "Artifact",
    text: "You may activate abilities of creatures you control as though those creatures had haste.\n{1}, {T}: Untap target creature.",
    statics: [{ abilityHaste: (g, s, o) => o.controller === s.controller }],
    abilities: [untapper("Untap target creature", null)],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "untap" ? untapPick(g, p, req.options) : undefined) }
  });
  D({
    name: "Sting, the Glinting Dagger", cost: "{2}", type: "Legendary Artifact — Equipment", equip: "{2}",
    text: "Equipped creature gets +1/+1 and has haste.\nAt the beginning of each combat, untap equipped creature.\nEquipped creature has first strike as long as it's blocking or blocked by a Goblin or Orc.\nEquip {2}",
    note: "The first strike against Goblins and Orcs is not shown.",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 1], kw: ["haste"] }],
    triggers: [{
      on: "beginCombat", when: (g, s) => !!(s.attachedTo && s.attachedTo.zone === "battlefield" && s.attachedTo.tapped),
      do: (g, s) => { const c = s.attachedTo; if (c && c.zone === "battlefield" && c.tapped) { g.untap(c); log(g, `Sting untaps ${c.def.name}.`, s.controller, [s.def.name, c.def.name]); } }
    }],
    ai: { priority: 7, equipTarget: (g, p, opts) => stingTarget(g, p, opts) }
  });
  function stingTarget(g, p, opts) {
    const score = c => (g.abilitiesOf(c).some(e => e.ab.krenkoMake) ? 100 : g.abilitiesOf(c).some(e => e.ab.tap) ? 30 : 0) + value(g, c) * 0.3;
    return opts.filter(c => c.controller === p).sort((a, b) => score(b) - score(a))[0] || opts[0];
  }

  /* ================================================================ instants */
  D({
    name: "Deflecting Swat", cost: "{2}{R}", type: "Instant",
    text: "If you control a commander, you may cast this spell without paying its mana cost.\nYou may choose new targets for target spell or ability.",
    note: "It changes one target: the one aimed at your permanent or at you.",
    altCosts: [{ label: "Free (you control a commander)", cost: "", condition: (g, p) => controlsCommander(g, p) }],
    spell: {
      targets: [{ kind: "spell", orAbility: true, purpose: "redirect", prompt: "Deflecting Swat: choose new targets for target spell or ability", filter: (g, item) => (item.targets || []).some(Boolean) }],
      do: async (g, ctx) => {
        const it = ctx.targets[0], p = ctx.p;
        if (!ctx.legal[0] || !it || !g.stack.includes(it)) return;
        const specs = g.stackTargets(it);
        // the target to move: one of ours first
        let i = it.targets.findIndex(t => t && (t === p || (!g.isPlayer(t) && !t.kind && t.controller === p)));
        if (i < 0) i = it.targets.findIndex(Boolean);
        const spec = specs[i];
        if (i < 0 || !spec) return;
        const opts = g.targetOptions(it.p, spec, it.o).filter(t => t !== it.targets[i]);
        if (!opts.length) { log(g, `Deflecting Swat finds no other target for ${it.name}.`, p, ["Deflecting Swat"]); return; }
        const pick = await g.ask(p, { type: "target", prompt: `New target for ${it.name}`, options: opts, purpose: "swatNew", src: ctx.o, item: it });
        if (pick && opts.includes(pick)) { it.targets[i] = pick; g.bump(); log(g, `Deflecting Swat changes the target of ${it.name} to ${g.nameOf(pick)}.`, p, ["Deflecting Swat"]); }
      }
    },
    ai: {
      priority: 6, protection: true,
      protects: (g, q, top) => !!top && top.p !== q && (top.targets || []).some(t => t && !g.isPlayer(t) && !t.kind && t.controller === q && (t.isCommander || value(g, t) >= 6)),
      target: (g, p, req) => {
        if (req.purpose === "redirect") { const top = g.stack[g.stack.length - 1]; return top && req.options.includes(top) ? top : undefined; }
        if (req.purpose === "swatNew") {
          const opp = req.options.filter(t => !g.isPlayer(t) && !t.kind && t.controller !== p).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
          return opp[0] || req.options.find(t => g.isPlayer(t) && t !== p) || req.options.find(t => !g.isPlayer(t) && !t.kind && t.isToken) || req.options[0];
        }
        return undefined;
      }
    }
  });
  D({
    name: "Massive Raid", cost: "{1}{R}{R}", type: "Instant",
    text: "Massive Raid deals damage to any target equal to the number of creatures you control.",
    spell: {
      targets: [{ kind: "any", purpose: "raid", prompt: "Massive Raid deals damage to" }],
      do: (g, ctx) => { const n = g.creatures(ctx.p).length; if (ctx.legal[0] && n > 0) g.damage(ctx.o, ctx.targets[0], n); }
    },
    ai: {
      priority: 5,
      cast: (g, p, o, ctx) => {
        const n = g.creatures(p).length;
        const t = bestBurn(g, p, n);
        if (!t) return false;
        if (g.isPlayer(t) && t.life <= n) { plan(g, p, "raid", t); return 60; }
        if (!g.isPlayer(t)) { plan(g, p, "raid", t); return 18 + threatOf(g, t, p) * 0.5; }
        if (n >= 12 && myMain(g, p, ctx.window)) { plan(g, p, "raid", t); return 16; }
        return false;
      },
      target: (g, p, req) => (req.purpose === "raid" ? (planned(g, p, "raid", req.options) || bestBurn(g, p, g.creatures(p).length, req.options)) : undefined)
    }
  });
  /* Red Elemental Blast and Pyroblast: counter a blue spell, or destroy a blue permanent. */
  const blast = (name, text, anySpell) => D({
    name, cost: "{R}", type: "Instant", text,
    note: anySpell ? "The bots only aim it at blue spells." : undefined,
    modes: [
      {
        label: "Counter a blue spell",
        canChoose: (g, p) => g.stack.some(it => it.kind === "spell" && it.p !== p && isBlue(it.o)),
        targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target blue spell", filter: (g, item) => item.kind === "spell" && isBlue(item.o) }],
        do: (g, ctx) => { if (ctx.legal[0] && g.stack.includes(ctx.targets[0]) && isBlue(ctx.targets[0].o)) g.counterSpell(ctx.targets[0], ctx.o); }
      },
      {
        label: "Destroy a blue permanent",
        canChoose: (g, p) => g.battlefield.some(o => o.controller !== p && isBlue(o)),
        targets: [{ kind: "permanent", opp: true, purpose: "harm", prompt: "Destroy target blue permanent", filter: (g, o) => isBlue(o) }],
        do: (g, ctx) => { if (ctx.legal[0] && isBlue(ctx.targets[0])) g.destroy(ctx.targets[0], ctx.o); }
      }
    ],
    ai: {
      priority: 5, counter: true,
      counterFits: (g, q, top) => !!top && top.kind === "spell" && top.p !== q && isBlue(top.o),
      // the main phase: a blue permanent worth a card
      cast: (g, p, o, ctx) => {
        if (!myMain(g, p, ctx.window)) return false;
        const t = g.battlefield.filter(x => x.controller !== p && isBlue(x) && g.canTarget(p, x)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
        return t && threatOf(g, t, p) >= 5 ? (plan(g, p, "blast", t), 18 + threatOf(g, t, p) * 0.5) : false;
      },
      mode: (g, p) => { const top = g.stack[g.stack.length - 1]; return top && top.kind === "spell" && top.p !== p && isBlue(top.o) ? 0 : 1; },
      target: (g, p, req) => (req.purpose === "harm" ? planned(g, p, "blast", req.options) : undefined)
    }
  });
  blast("Red Elemental Blast", "Choose one —\n• Counter target blue spell.\n• Destroy target blue permanent.", false);
  blast("Pyroblast", "Choose one —\n• Counter target spell if it's blue.\n• Destroy target permanent if it's blue.", true);
  D({
    name: "Tibalt's Trickery", cost: "{1}{R}", type: "Instant",
    text: "Counter target spell. Choose 1, 2, or 3 at random. Its controller mills that many cards, then exiles cards from the top of their library until they exile a nonland card with a different name than that spell. They may cast that card without paying its mana cost. Then they put the exiled cards on the bottom of their library in a random order.",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell", filter: (g, item, p) => item.kind === "spell" }],
      do: async (g, ctx) => {
        const it = ctx.targets[0];
        if (!ctx.legal[0] || !it || !g.stack.includes(it)) return;
        const q = it.p, name = it.name;
        if (g.counterSpell(it, ctx.o) === false) return;
        const k = 1 + g.rand(3);
        g.mill(q, k);
        const exiled = [];
        let hit = null;
        while (q.library.length) {
          const c = q.library[0];
          g.moveTo(c, "exile");
          exiled.push(c);
          if (!c.def.types.includes("Land") && c.def.name !== name) { hit = c; break; }
        }
        log(g, `${q.name} mills ${k} and exiles ${exiled.length} card${exiled.length === 1 ? "" : "s"}${hit ? `, finding ${hit.def.name}` : ""} (Tibalt's Trickery).`, ctx.p, ["Tibalt's Trickery"]);
        if (hit && !q.lost && await g.ask(q, { type: "confirm", prompt: `Cast ${hit.def.name} without paying its mana cost?`, src: ctx.o, purpose: "trickeryCast" })) {
          try { await g.castWithoutPaying(q, hit); } catch (e) { g.warn(e, ctx.o); }
        }
        for (const c of g.shuffleArr(exiled.filter(c => c.zone === "exile"))) g.moveTo(c, "library", { bottom: true });
      }
    },
    ai: { priority: 5, counter: true }
  });

  /* ================================================================ sorceries */
  D({
    name: "Goblin War Strike", cost: "{R}", type: "Sorcery",
    text: "Goblin War Strike deals damage to target player or planeswalker equal to the number of Goblins you control.",
    note: "It targets a player.",
    spell: {
      targets: [{ kind: "player", purpose: "strike", prompt: "Goblin War Strike deals damage to" }],
      do: (g, ctx) => { const n = goblinsOf(g, ctx.p).length; if (ctx.legal[0] && n > 0) g.damage(ctx.o, ctx.targets[0], n); }
    },
    ai: {
      priority: 4,
      cast: (g, p) => {
        const n = goblinsOf(g, p).length, fs = foes(g, p);
        const kill = fs.filter(q => q.life <= n).sort((a, b) => b.life - a.life)[0];
        if (kill) { plan(g, p, "strike", kill); return 60; }
        if (n >= 10) { plan(g, p, "strike", lowestLife(fs)); return 20; }
        return false;
      },
      target: (g, p, req) => (req.purpose === "strike" ? (planned(g, p, "strike", req.options) || lowestLife(req.options.filter(q => q !== p)) || req.options[0]) : undefined)
    }
  });
  D({
    name: "Fiery Confluence", cost: "{2}{R}{R}", type: "Sorcery",
    text: "Choose three. You may choose the same mode more than once.\n• Fiery Confluence deals 1 damage to each creature.\n• Fiery Confluence deals 2 damage to each opponent.\n• Destroy target artifact.",
    note: "The three modes and the artifacts are chosen as it resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, o = ctx.o;
        for (let i = 0; i < 3; i++) {
          const arts = g.battlefield.filter(x => g.isArtifact(x) && g.canTarget(p, x));
          const options = [{ id: 0, label: "1 damage to each creature" }, { id: 1, label: "2 damage to each opponent" }].concat(arts.length ? [{ id: 2, label: "Destroy target artifact" }] : []);
          const m = await g.ask(p, { type: "option", prompt: `Fiery Confluence: mode ${i + 1} of 3`, options, purpose: "confluence", src: o });
          if (m === 0) for (const c of g.battlefield.filter(x => g.isCreature(x))) g.damage(o, c, 1);
          else if (m === 2) {
            const t = await g.chooseTarget(p, { kind: "artifact", purpose: "harm", prompt: "Destroy target artifact" }, o);
            if (t && t.zone === "battlefield") g.destroy(t, o);
          } else for (const q of g.opponents(p)) g.damage(o, q, 2);
        }
      }
    },
    ai: {
      priority: 5,
      cast: (g, p, o, ctx) => {
        if (!myMain(g, p, ctx.window)) return false;
        const fs = foes(g, p);
        if (fs.some(q => q.life <= 6)) return 60;
        if (confluenceArts(g, p).length) return 20;
        return g.turn >= 24 ? 12 : false;
      },
      option: (g, p, req) => {
        if (req.purpose !== "confluence") return undefined;
        if (foes(g, p).some(q => q.life <= 6)) return 1;
        return confluenceArts(g, p).length && req.options.some(x => x.id === 2) ? 2 : 1;
      }
    }
  });
  const confluenceArts = (g, p) => g.battlefield.filter(x => x.controller !== p && g.isArtifact(x) && g.canTarget(p, x) && threatOf(g, x, p) >= 5);
  /* Volcanic Fissure and Shatterskull, the Hammer Pass: pay 3 life or the land enters tapped. */
  const payLand = name => MK.define({
    name, type: "Land", cost: "",
    text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {R}.",
    note: "You pay the 3 life when you have more than 12.",
    etbTapped: (g, o) => { if (!o || o.id === -1) return false; const p = o.controller; if (p && p.life > 12 && g.payLife(p, 3)) { log(g, `${p.name} pays 3 life so ${name} enters untapped.`, p, [name]); return false; } return true; },
    mana: [{ tap: true, produce: "R" }]
  });
  D({
    name: "Shatterskull Smashing", cost: "{X}{R}{R}", type: "Sorcery",
    text: "Shatterskull Smashing deals X damage divided as you choose among up to two target creatures and/or planeswalkers. If X is 6 or more, Shatterskull Smashing deals twice X damage divided as you choose among them instead.\n//\nShatterskull, the Hammer Pass (land): As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {R}.",
    note: "A modal double-faced card: play it as the land from your hand instead of casting it. The damage is divided as it resolves.",
    mdfcLand: payLand("Shatterskull, the Hammer Pass"),
    minX: 1,
    spell: { do: (g, ctx) => divided(g, ctx.p, ctx.o, ctx.x >= 6 ? ctx.x * 2 : ctx.x, { kind: "creatureOrPlaneswalker", opp: true, purpose: "harm", prompt: "Shatterskull Smashing deals damage to" }, 2) },
    ai: {
      priority: 4,
      cast: (g, p, o, ctx) => {
        if (!myMain(g, p, ctx.window)) return false;
        const x = manaLeft(g, p) - 2, dmg = x >= 6 ? 2 * x : x;
        const t = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible") && g.lethalDamageLeft(c) <= dmg).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
        return t && threatOf(g, t, p) >= 6 ? 14 + threatOf(g, t, p) * 0.5 : false;
      }
    }
  });
  D({
    name: "Sundering Eruption", cost: "{2}{R}", type: "Sorcery",
    text: "Destroy target land. Its controller may search their library for a basic land card, put it onto the battlefield tapped, then shuffle. Creatures without flying can't block this turn.\n//\nVolcanic Fissure (land): As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {R}.",
    note: "A modal double-faced card: play it as the land from your hand instead of casting it. The bots cast it before an attack that kills an opponent.",
    mdfcLand: payLand("Volcanic Fissure"),
    spell: {
      targets: [{ kind: "land", purpose: "harm", prompt: "Destroy target land" }],
      do: async (g, ctx) => {
        const t = ctx.targets[0];
        if (ctx.legal[0] && t && t.zone === "battlefield") {
          const q = t.controller;
          g.destroy(t, ctx.o);
          await g.search(q, { filter: (g2, c) => c.def.types.includes("Land") && c.def.supertypes.includes("Basic"), to: "battlefield", tapped: true, prompt: "You may search for a basic land card (it enters tapped)", src: ctx.o });
        }
        const walls = g.battlefield.filter(c => g.isCreature(c) && !g.kw(c, "flying"));
        if (walls.length) g.addEffect({ objs: walls, cantBlock: true });
        log(g, "Creatures without flying can't block this turn.", ctx.p, ["Sundering Eruption"]);
      }
    },
    ai: {
      priority: 4,
      cast: (g, p, o, ctx) => {
        if (ctx.window !== "main1" || g.active !== p) return false;
        const ready = g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")) && !g.kw(c, "defender"));
        const dmg = ready.reduce((s, c) => s + Math.max(0, g.power(c)), 0);
        const fs = foes(g, p);
        const total = fs.reduce((s, q) => s + Math.max(0, q.life), 0);
        const walls = fs.some(q => g.creatures(q).some(c => !c.tapped && !g.kw(c, "flying")));
        return walls && ready.length >= 4 && (fs.some(q => q.life <= dmg && g.creatures(q).filter(c => !c.tapped).length >= 2) || dmg >= total) ? 45 : false;
      },
      target: (g, p, req) => {
        if (req.purpose !== "harm") return undefined;
        const theirs = req.options.filter(l => l.controller !== p);
        return theirs.sort((a, b) => (g.isBasic(a) ? 0 : 1) - (g.isBasic(b) ? 0 : 1)).pop() || req.options[0];
      }
    }
  });

  /* ================================================================ lands */
  T.spiritC = MK.tokenDef({ key: "spirit-c", name: "Spirit", pt: [1, 1], colors: [], subtypes: ["Spirit"] });
  D({
    name: "Sokenzan, Crucible of Defiance", type: "Legendary Land", cost: "",
    text: "{T}: Add {R}.\nChannel — {3}{R}, Discard Sokenzan, Crucible of Defiance: Create two 1/1 colorless Spirit creature tokens. They gain haste until end of turn. This ability costs {1} less to activate for each legendary creature you control.",
    note: "The bots play it as a land.",
    mana: [{ tap: true, produce: "R" }],
    channel: {
      label: "Channel: two hasty 1/1 Spirits", cost: "{3}{R}",
      costReduce: (g, p) => g.controlled(p, o => g.isCreature(o) && o.def.supertypes.includes("Legendary")).length,
      do: (g, s, ctx) => { const made = g.createToken(ctx.p, T.spiritC, { count: 2 }); if (made.length) g.grant(made, ["haste"]); }
    }
  });
  D({
    name: "Hanweir Battlements", type: "Land", cost: "",
    text: "{T}: Add {C}.\n{R}, {T}: Target creature gains haste until end of turn.\n{3}{R}{R}, {T}: If you both own and control Hanweir Battlements and a creature named Hanweir Garrison, exile them, then meld them into Hanweir, the Writhing Township.",
    note: "The meld ability is left out (no Hanweir Garrison in these decks).",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Target creature gains haste", cost: "{R}", tap: true, noSelfMana: true,
      targets: [{ kind: "creature", you: true, purpose: "hasteGive", prompt: "Gains haste", filter: (g, o) => o.sick && !g.kw(o, "haste") }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.grant([ctx.targets[0]], ["haste"]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !!hastePick(g, p) }
    }],
    ai: { target: (g, p, req) => (req.purpose === "hasteGive" ? (req.options.includes(hastePick(g, p)) ? hastePick(g, p) : null) : undefined) }
  });
  /* The new creature that wants haste most: one with a {T} ability (Krenko), else a big attacker. */
  function hastePick(g, p) {
    const sick = g.creatures(p).filter(c => c.sick && !c.tapped && !g.kw(c, "haste") && !g.abilityHaste(c));
    const score = c => (g.abilitiesOf(c).some(e => e.ab.krenkoMake) ? 100 : g.abilitiesOf(c).some(e => e.ab.tap) ? 20 : 0) + Math.max(0, g.power(c));
    const best = sick.sort((a, b) => score(b) - score(a))[0];
    return best && score(best) >= 4 ? best : null;
  }
  D({
    name: "Three Tree City", type: "Legendary Land", cost: "",
    text: "As Three Tree City enters, choose a creature type.\n{T}: Add {C}.\n{2}, {T}: Choose a color. Add an amount of mana of that color equal to the number of creatures you control of the chosen type.",
    note: "The type is the most common creature type among your creatures and cards (Goblin in these decks). The second ability adds red.",
    etbState: (g, o) => ({ chosenType: commonType(g, o.controller) }),
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Add {R} for each creature of the chosen type", cost: "{2}", tap: true, noSelfMana: true,
      do: (g, s, ctx) => {
        const n = treeCount(g, s);
        ctx.p.pool.R += n;
        g.bump();
        log(g, `${ctx.p.name} adds ${n} red mana (Three Tree City).`, ctx.p, [s.def.name]);
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (!myMain(g, p, ctx.window)) return false;
          const gain = treeCount(g, o) - 3;
          if (gain < 2) return false;
          const left = manaLeft(g, p);
          return p.hand.some(c => !c.def.types.includes("Land") && c.def.mv > left && c.def.mv <= left + gain && g.castOptions(p, c).length === 0);
        }
      }
    }]
  });
  function commonType(g, p) {
    const n = {};
    for (const c of p.library.concat(p.hand, p.command, g.creatures(p))) for (const t of (c.def.types.includes("Creature") ? c.def.subtypes : [])) n[t] = (n[t] || 0) + 1;
    return Object.entries(n).sort((a, b) => b[1] - a[1])[0] ? Object.entries(n).sort((a, b) => b[1] - a[1])[0][0] : "Goblin";
  }
  const treeCount = (g, s) => g.creatures(s.controller).filter(c => g.hasSub(c, s.state.chosenType || "Goblin")).length;
})(typeof window !== "undefined" ? window : globalThis);
