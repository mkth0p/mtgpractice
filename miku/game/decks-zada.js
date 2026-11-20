/* Goblin Storm (Secret Lair Commander Deck, 2026): Zada, Hedron Grinder and her mono-red Goblins.
   How it wins: Goblin token makers go wide, then cheap spells aimed only at Zada are copied once for
   each other creature (a card, a Treasure or haste per creature). Rituals and Treasures chain spells
   into Grapeshot and Empty the Warrens, Storm-Kiln Artist turns every cast or copy into a Treasure
   (with Haze of Rage and buyback that's a loop), and Impact Tremors, Kreat, Goblin Bombardment and
   Pashalik Mons turn the swarm into damage.
   This file loads after every other deck file, so the 31 cards other decks already define (Krenko,
   Skullclamp, Impact Tremors...) keep their definitions; Roaming Throne gets its Goblin choice here.
   A player can pilot it from the Play tab (MK.HERO_DECKS) and it also sits at the table as a bot.
   Card text follows the Oracle text; `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const pc = s => MK.parseCost(s);
  const ZADA = "Zada, Hedron Grinder", ARTIST = "Storm-Kiln Artist", HAZE = "Haze of Rage";
  const isGoblin = (g, o) => g.hasSub(o, "Goblin");
  const gobQuick = (g, o) => o.def.subtypes.includes("Goblin") || !!o.def.changeling;
  const isSpellCard = o => o.def.types.includes("Instant") || o.def.types.includes("Sorcery");
  const named = (g, p, n) => g.battlefield.find(o => o.controller === p && o.def.name === n && o.zone === "battlefield") || null;
  const inHand = (p, n) => p.hand.some(c => c.def.name === n);
  const others = (g, p, s) => g.creatures(p).filter(c => c !== s);
  const value = (g, o) => (AI().value ? AI().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const lowestLife = list => list.slice().sort((a, b) => a.life - b.life)[0] || null;
  const manaLeft = (g, p) => g.maxX(p, pc(""), 1);
  const attackedThisTurn = (g, p, o) => g.players.some(q => (q.attackedBy || []).some(e => e.by === p && e.turn === g.turn && (!o || e.o === o)));
  const say = (g, p, text, cards) => g.log(text, { p, cards: cards || [] });

  /* ---------- tokens */
  T.gsRat = MK.tokenDef({ key: "rat-b-noblock", name: "Rat", pt: [1, 1], colors: "B", subtypes: ["Rat"], text: "This creature can't block.", statics: [{ applies: (g, s, o) => o === s, cantBlock: true }] });
  T.gsKobold = MK.tokenDef({ key: "kobolds-of-kher-keep", name: "Kobolds of Kher Keep", pt: [0, 1], colors: "R", subtypes: ["Kobold"] });
  T.gsSoldier = MK.tokenDef({ key: "soldier-r-haste", name: "Soldier", pt: [1, 1], colors: "R", subtypes: ["Soldier"], keywords: ["haste"] });
  T.gsDwarf = MK.tokenDef({ key: "dwarf-r", name: "Dwarf", pt: [1, 1], colors: "R", subtypes: ["Dwarf"] });
  T.gsFish = MK.tokenDef({ key: "fish-u", name: "Fish", pt: [1, 1], colors: "U", subtypes: ["Fish"] });
  T.gsSpawn = MK.tokenDef({ key: "eldrazi-spawn", name: "Eldrazi Spawn", pt: [0, 1], colors: [], subtypes: ["Eldrazi", "Spawn"], text: "Sacrifice this creature: Add {C}.", mana: [{ sacSelf: true, produce: "C", last: true }] });
  T.gsEldrazi = MK.tokenDef({ key: "eldrazi-10", name: "Eldrazi", pt: [10, 10], colors: [], subtypes: ["Eldrazi"] });

  /* ---------- shared helpers */
  /* Storm: copy the spell once for each spell cast before it this turn. Grapeshot and Spreading
     Insurrection pick new targets for each copy (a person may send them all at the first target). */
  async function storm(g, p, o, item, retarget) {
    const n = Math.min(item.storm || 0, 60);
    if (n <= 0 || item.isCopy) return;
    say(g, p, `Storm: ${p.name} copies ${o.def.name} ${n} time${n > 1 ? "s" : ""}.`, [o.def.name]);
    let same = !retarget;
    if (retarget && n >= 3 && item.targets[0]) same = !!(await g.ask(p, { type: "confirm", prompt: `${o.def.name}: send all ${n} copies at ${g.nameOf(item.targets[0])}?`, purpose: "stormSame", src: o }));
    for (let i = 0; i < n && !g.over; i++) await g.copySpell(item, p, same ? false : undefined);
  }
  /* Steal t until end of turn (Spreading Insurrection), the same way Zealous Conscripts does. */
  function stealUntilEot(g, p, t) {
    if (t.controller === p) return;
    const prev = t.controller, zc = t.zc;
    if (g.combat) g.removeFromCombat(t);
    t.controller = p; t.sick = true; t.state.dieAtEnd = true;
    g.bump();
    say(g, p, `${p.name} gains control of ${t.def.name} until end of turn.`, [t.def.name]);
    let done = false;
    const giveBack = g2 => {
      if (done) return; done = true;
      if (t.zone !== "battlefield" || t.zc !== zc || t.controller !== p || prev.lost) return;
      if (g2.combat) g2.removeFromCombat(t);
      t.controller = prev; t.sick = true; delete t.state.dieAtEnd;
      g2.bump();
      g2.log(`${t.def.name} returns to ${prev.name}.`, { p: prev, cards: [t.def.name] });
    };
    g.delayed.push({ at: "endStep", once: true, controller: p, do: giveBack });
    g.delayed.push({ at: "upkeep", once: true, controller: p, do: giveBack });
  }
  /* One trigger per batch of creatures entering (General Kreat), like Impact Tremors. */
  const batchSeen = new WeakMap();
  function firstOfBatch(s, ev) {
    if (!ev.batch) return true;
    let set = batchSeen.get(ev.batch);
    if (!set) { set = new Set(); batchSeen.set(ev.batch, set); }
    if (set.has(s.id)) return false;
    set.add(s.id);
    return true;
  }
  const enteredCount = (g, s, ev) => (ev.batch ? ev.batch.map(b => b.o) : [ev.o]).filter(o => o.controller === s.controller && o !== s && g.isCreature(o)).length;

  /* ---------- Zada targeting, for the bots */
  /* A creature spell target: Zada when she's out with company (every other creature is a copy). */
  function zadaFor(g, p, req) {
    const z = req.options.find(o => o && o.def && o.def.name === ZADA && o.controller === p);
    if (z && others(g, p, z).length >= 1) return z;
    return undefined;
  }
  const helpTarget = (g, p, req) => (req.purpose === "help" ? zadaFor(g, p, req) : undefined);
  /* How many copies Zada makes for this spell now. */
  function zadaCopies(g, p, z, spellCard) {
    if (!z) return 0;
    const n = others(g, p, z).length;
    return named(g, p, "Roaming Throne") && (named(g, p, "Roaming Throne").state.chosenType === "Goblin") ? n * 2 : n;
  }
  /* Bots cast the Zada spells only on Zada with at least `min` other creatures, or for their plain
     effect when `alone` says so. */
  function zadaCast(min, alone) {
    return (g, p, o, ctx) => {
      const z = named(g, p, ZADA);
      if (z && (ctx.window === "main1" || ctx.window === "main2") && g.active === p) {
        const n = zadaCopies(g, p, z, o);
        if (n >= min) return 30 + n * 3;
      }
      return alone ? alone(g, p, o, ctx) : false;
    };
  }

  /* ================================================================ the commander */
  D({
    name: ZADA, cost: "{3}{R}", type: "Legendary Creature — Goblin Ally", pt: "3/3",
    text: "Whenever you cast an instant or sorcery spell that targets only Zada, Hedron Grinder, copy that spell for each other creature you control that the spell could target. Each copy targets a different one of those creatures.",
    triggers: [{
      // late: Frontline Heroism's Soldier is made first, so Zada copies onto it too
      on: "cast", late: true,
      when: (g, s, ev) => {
        const it = ev.item;
        if (!it || ev.p !== s.controller || it.isCopy || !isSpellCard(it.o)) return false;
        const ts = (it.targets || []).filter(Boolean);
        return ts.length === 1 && ts[0] === s;
      },
      do: async (g, s, ev, { p }) => {
        const item = ev.item;
        if (!g.stack.includes(item)) return;
        const specs = g.spellTargets(item.o, item);
        const idx = item.targets.indexOf(s);
        const spec = specs[idx];
        if (!spec) return;
        const list = g.battlefield.filter(c => c.controller === p && c !== s && g.isCreature(c) && g.legalTarget(p, spec, c, item.o));
        if (!list.length) return;
        say(g, p, `Zada copies ${item.name} for ${list.length} other creature${list.length > 1 ? "s" : ""}.`, [ZADA, item.o.def.name]);
        for (const c of list) {
          if (g.over) return;
          const copy = await g.copySpell(item, p, false);
          copy.targets = item.targets.map((t, i) => (i === idx ? c : null));
          copy.name = `${item.o.def.name} (copy on ${c.def.name})`;
        }
      }
    }],
    ai: { priority: 7, threat: 3, attack: (g, p, a, bl) => (bl.length ? false : undefined), plan: (g, p, o, ctx) => brain(g, p, o, ctx) }
  });

  /* ================================================================ creatures */
  D({
    name: "Broadside Bombardiers", cost: "{2}{R}", type: "Creature — Goblin Pirate", pt: "2/2",
    keywords: ["menace", "haste"],
    text: "Menace, haste\nBoast — Sacrifice another creature or artifact: Broadside Bombardiers deals damage equal to 2 plus the sacrificed permanent's mana value to any target. (Activate only if this creature attacked this turn and only once each turn.)",
    abilities: [{
      label: "Boast: sacrifice, deal 2 + its mana value", once: true,
      condition: (g, o, p) => attackedThisTurn(g, o.controller, o),
      sacCost: { filter: (g, c, src) => c !== src && c.controller === src.controller && (g.isCreature(c) || g.isArtifact(c)), prompt: "Sacrifice another creature or artifact" },
      targets: [{ kind: "any", purpose: "harm", amount: 2, prompt: "Broadside Bombardiers deals damage to" }],
      do: (g, s, ctx) => {
        const sac = ctx.sacrificed && ctx.sacrificed[0];
        const n = 2 + (sac ? sac.mv || 0 : 0);
        if (ctx.legal[0]) g.damage(s, ctx.targets[0], n);
      },
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && g.battlefield.some(c => c.controller === p && c !== o && (c.def.name === "Treasure" || (c.isToken && g.isCreature(c) && g.power(c) <= 1))) }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Conspicuous Snoop", cost: "{R}{R}", type: "Creature — Goblin Rogue", pt: "2/2",
    text: "Play with the top card of your library revealed.\nYou may cast Goblin spells from the top of your library.\nAs long as the top card of your library is a Goblin card, Conspicuous Snoop has all activated abilities of that card.",
    note: "Casting a Goblin from the top of your library is an ability on Snoop here (you still pay for the spell). It doesn't gain the top card's activated abilities.",
    abilities: [{
      label: "Cast the Goblin on top of your library", manaAbility: true,
      condition: (g, o) => { const p = o.controller, c = p.library[0]; return !!c && gobQuick(g, c) && !c.def.types.includes("Land") && g.castOptions(p, c).length > 0; },
      do: async (g, s, ctx) => { const c = ctx.p.library[0]; if (c && gobQuick(g, c)) await g.cast(ctx.p, c); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" || ctx.window === "main2" }
    }],
    ai: { priority: 5, draw: true }
  });
  D({
    name: "Gempalm Incinerator", cost: "{2}{R}", type: "Creature — Goblin", pt: "2/1",
    cycling: "{1}{R}",
    text: "Cycling {1}{R} ({1}{R}, Discard this card: Draw a card.)\nWhen you cycle Gempalm Incinerator, you may have it deal X damage to target creature, where X is the number of Goblins on the battlefield.",
    triggers: [{
      on: "cycle", zone: "graveyard", when: (g, s, ev) => ev.o === s,
      do: async (g, s, ev, { p }) => {
        const n = g.battlefield.filter(o => isGoblin(g, o)).length;
        if (!n) return;
        const t = await g.chooseTarget(p, { kind: "creature", opp: true, purpose: "harm", amount: n, optional: true, trigger: true, prompt: `Gempalm Incinerator deals ${n} damage to target creature` }, s);
        if (t && t.zone === "battlefield") g.damage(s, t, n);
      }
    }],
    ai: { priority: 4 }
  });
  D({
    name: "General Kreat, the Boltbringer", cost: "{2}{R}", type: "Legendary Creature — Goblin Soldier", pt: "2/2",
    text: "Whenever one or more Goblins you control attack, create a 1/1 red Goblin creature token that's tapped and attacking.\nWhenever another creature you control enters, General Kreat, the Boltbringer deals 1 damage to each opponent.",
    note: "Creatures that enter at the same time make one trigger that deals all the damage. The attacking token attacks the player the first attacking Goblin attacks.",
    triggers: [
      {
        on: "attack", when: (g, s, ev) => ev.p === s.controller && ev.attackers.some(a => isGoblin(g, a)),
        do: (g, s, ev, { p }) => { const a = ev.attackers.find(x => isGoblin(g, x) && x.combat); if (a) g.createToken(p, T.goblin, { tapped: true, attacking: a.combat.attacking }); }
      },
      {
        on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && firstOfBatch(s, ev),
        do: (g, s, ev, { p }) => { const n = enteredCount(g, s, ev); if (n > 0) for (const q of g.opponents(p)) g.damage(s, q, n); }
      }
    ],
    ai: { priority: 8, threat: 3 }
  });
  D({
    name: "Goblin Dark-Dwellers", cost: "{3}{R}{R}", type: "Creature — Goblin", pt: "4/4",
    keywords: ["menace"],
    text: "Menace\nWhen Goblin Dark-Dwellers enters, you may cast target instant or sorcery card with mana value 3 or less from your graveyard without paying its mana cost. If that spell would be put into your graveyard this turn, exile it instead.",
    note: "X is 0 for a spell cast this way.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "card", trigger: true, optional: true, purpose: "reanimate", prompt: "Goblin Dark-Dwellers: cast an instant or sorcery with mana value 3 or less from your graveyard", from: (g2, pl) => pl.graveyard.filter(c => isSpellCard(c) && c.def.mv <= 3) }, s);
        if (!t || t.zone !== "graveyard") return;
        await g.castWithoutPaying(p, t, { exileAfter: true });
      }
    }],
    ai: { priority: 5, cards: null, target: (g, p, req) => (req.purpose === "reanimate" ? dwellerPick(g, p, req.options) : helpTarget(g, p, req)) }
  });
  function dwellerPick(g, p, opts) {
    const order = ["Grapeshot", "Seething Song", "Brightstone Ritual", "Ancestors' Aid", "Expedite", "Crimson Wisps", "Wild Ride", "Krenko's Command", "Dragon Fodder", "Witch's Mark", "Faithless Looting"];
    for (const n of order) { const c = opts.find(o => o.def.name === n); if (c) return c; }
    return opts.find(o => o.def.name !== "Goblin Negotiation") || null;
  }
  D({
    name: "Goblin Trashmaster", cost: "{2}{R}{R}", type: "Creature — Goblin Warrior", pt: "3/3",
    text: "Other Goblins you control get +1/+1.\nSacrifice a Goblin: Destroy target artifact.",
    statics: [{ applies: (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o) && gobQuick(g, o), pt: [1, 1] }],
    abilities: [{
      label: "Sacrifice a Goblin: destroy target artifact",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && isGoblin(g, c), prompt: "Sacrifice a Goblin" },
      targets: [{ kind: "artifact", opp: true, purpose: "harm", prompt: "Destroy target artifact" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], s); },
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && g.battlefield.some(a => a.controller !== p && g.isArtifact(a) && (AI().threat ? AI().threat(g, a, p) : 3) >= 5) && g.creatures(p).some(c => c.isToken && isGoblin(g, c)) }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Grenzo, Havoc Raiser", cost: "{R}{R}", type: "Legendary Creature — Goblin Rogue", pt: "2/2",
    text: "Whenever a creature you control deals combat damage to a player, choose one —\n• Goad target creature that player controls.\n• Exile the top card of that player's library. Until end of turn, you may cast that card and you may spend mana as though it were mana of any color to cast that spell.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src && ev.src.controller === s.controller && ev.p && ev.p !== s.controller,
      do: async (g, s, ev, { p }) => {
        const q = ev.p;
        const theirs = g.creatures(q).filter(c => g.canTarget(p, c, s));
        const pick = await g.ask(p, { type: "option", prompt: "Grenzo: choose one", options: [{ id: 0, label: "Goad a creature of theirs" }, { id: 1, label: "Exile their top card, you may cast it this turn" }].filter(o => o.id === 1 || theirs.length), purpose: "grenzoMode", src: s });
        if (pick === 0 && theirs.length) {
          const t = await g.chooseTarget(p, { kind: "creature", purpose: "harm", trigger: true, filter: (g2, c) => c.controller === q, prompt: "Goad target creature" }, s);
          if (t) g.goad(t, p);
        } else if (q.library.length) {
          const c = q.library[0];
          g.moveTo(c, "exile");
          c.playable = { by: p, turn: g.turn, anyColor: true };
          say(g, p, `${p.name} exiles ${c.def.name} from ${q.name}'s library and may cast it this turn.`, [c.def.name]);
        }
      }
    }],
    ai: { priority: 5, option: (g, p, req) => (req.purpose === "grenzoMode" ? req.options[req.options.length - 1].id : undefined) }
  });
  D({
    name: "Howlsquad Heavy", cost: "{2}{R}", type: "Creature — Goblin Mercenary", pt: "2/3",
    text: "Start your engines!\nOther Goblins you control have haste.\nAt the beginning of combat on your turn, create a 1/1 red Goblin creature token. That token attacks this combat if able.\nMax speed — {T}: Add {R} for each Goblin you control.",
    note: "Speed is kept on the player: it starts at 1 when Howlsquad Heavy enters and goes up once on each of your turns when an opponent loses life, to 4.",
    etbState: (g, o) => { const p = o.controller; if (p && !p.gsSpeed) p.gsSpeed = 1; return {}; },
    statics: [{ applies: (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o) && gobQuick(g, o), kw: ["haste"] }],
    triggers: [
      {
        on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
        do: (g, s, ev, { p }) => {
          const made = g.createToken(p, T.goblin);
          const v = lowestLife(g.opponents(p));
          for (const o of made) if (v) o.state.mustAttack = v;
        }
      },
      {
        on: "loseLife", when: (g, s, ev) => g.active === s.controller && ev.p !== s.controller && (s.controller.gsSpeed || 0) < 4 && s.controller.gsSpeedTurn !== g.turn,
        do: (g, s, ev, { p }) => { if (p.gsSpeedTurn === g.turn || (p.gsSpeed || 0) >= 4) return; p.gsSpeedTurn = g.turn; p.gsSpeed = (p.gsSpeed || 1) + 1; say(g, p, `${p.name}'s speed is now ${p.gsSpeed}${p.gsSpeed === 4 ? " (max speed)" : ""}.`, ["Howlsquad Heavy"]); }
      }
    ],
    mana: [{ tap: true, condition: (g, o) => (o.controller.gsSpeed || 0) >= 4, produce: (g, o) => "R".repeat(Math.max(1, g.creatures(o.controller).filter(c => isGoblin(g, c)).length)) }],
    ai: { priority: 7 }
  });
  D({
    name: "Impulsive Pilferer", cost: "{R}", type: "Creature — Goblin Pirate", pt: "1/1",
    text: "When Impulsive Pilferer dies, create a Treasure token.\nEncore {3}{R} ({3}{R}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.treasure) }],
    gyAbilities: [{
      label: "Encore", cost: "{3}{R}", timing: "sorcery", exileSelf: true,
      do: (g, s, ctx) => {
        for (const q of g.opponents(ctx.p)) {
          const made = g.copyToken(ctx.p, s, { haste: true, sacEnd: true });
          for (const o of made || []) o.state.mustAttack = q;
        }
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && manaLeft(g, p) >= 6 }
    }],
    ai: { priority: 5 }
  });
  D({
    name: "Redcap Gutter-Dweller", cost: "{2}{R}{R}", type: "Creature — Goblin Warrior", pt: "3/3",
    keywords: ["menace"],
    text: "Menace\nWhen Redcap Gutter-Dweller enters, create two 1/1 black Rat creature tokens with \"This creature can't block.\"\nAt the beginning of your upkeep, you may sacrifice another creature. If you do, put a +1/+1 counter on Redcap Gutter-Dweller and exile the top card of your library. You may play that card this turn.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.gsRat, { count: 2 }) },
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const opts = g.creatures(p).filter(c => c !== s);
          if (!opts.length) return;
          const pick = await g.ask(p, { type: "target", prompt: "Redcap Gutter-Dweller: sacrifice another creature? (a +1/+1 counter and play your top card this turn)", options: opts, optional: true, purpose: "sacrifice", src: s });
          if (!pick || !opts.includes(pick)) return;
          g.sacrifice(pick);
          if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
          g.impulse(p, 1);
        }
      }
    ],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "sacrifice" ? (req.options.filter(c => c.isToken && g.power(c) <= 1).sort((a, b) => value(g, a) - value(g, b))[0] || null) : undefined) }
  });
  D({
    name: "Rundvelt Hordemaster", cost: "{1}{R}", type: "Creature — Goblin Warrior", pt: "1/1",
    text: "Other Goblins you control get +1/+1.\nWhenever Rundvelt Hordemaster or another Goblin you control dies, exile the top card of your library. If it's a Goblin creature card, you may cast that card until the end of your next turn.",
    note: "Several Goblins dying at once each exile a card.",
    statics: [{ applies: (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o) && gobQuick(g, o), pt: [1, 1] }],
    triggers: [{
      on: "dies", when: (g, s, ev) => (ev.o === s || (ev.lki && ev.lki.controller === s.controller && (ev.lki.subtypes || []).includes("Goblin"))),
      do: (g, s, ev, { p }) => {
        if (!p.library.length) return;
        const c = p.library[0];
        g.moveTo(c, "exile");
        const ok = c.def.types.includes("Creature") && gobQuick(g, c);
        if (ok) c.playable = { by: p, turn: g.turn };
        say(g, p, `${p.name} exiles ${c.def.name}${ok ? " and may cast it until the end of their next turn" : ""}.`, [c.def.name]);
        if (ok) rundveltKeep(g, p, c);
      }
    }],
    ai: { priority: 6 }
  });
  /* "until the end of your next turn": keep the exiled Goblin castable through p's next turn. */
  function rundveltKeep(g, p, c) {
    const zc = c.zc;
    const refresh = g2 => { if (c.zone === "exile" && c.zc === zc && c.playable && c.playable.by === p) c.playable.turn = g2.turn; };
    g.delayed.push({ at: "upkeep", once: true, player: p, controller: p, do: refresh });
  }
  D({
    name: "Searslicer Goblin", cost: "{1}{R}", type: "Creature — Goblin Warrior", pt: "2/1",
    text: "Raid — At the beginning of your end step, if you attacked this turn, create a 1/1 red Goblin creature token.",
    triggers: [{ on: "endStep", when: (g, s, ev) => ev.p === s.controller && attackedThisTurn(g, s.controller), do: (g, s, ev, { p }) => g.createToken(p, T.goblin) }],
    ai: { priority: 6 }
  });
  D({
    name: "Siege-Gang Lieutenant", cost: "{3}{R}", type: "Creature — Goblin", pt: "2/2",
    text: "Lieutenant — At the beginning of combat on your turn, if you control your commander, create two 1/1 red Goblin creature tokens. Those tokens gain haste until end of turn.\n{2}, Sacrifice a Goblin: Siege-Gang Lieutenant deals 1 damage to any target.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller && g.battlefield.some(o => o.isCommander && o.controller === s.controller && o.owner === s.controller),
      do: (g, s, ev, { p }) => { const made = g.createToken(p, T.goblin, { count: 2 }); if (made.length) g.grant(made, ["haste"]); }
    }],
    abilities: [{
      label: "Sacrifice a Goblin: 1 damage", cost: "{2}",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && isGoblin(g, c), prompt: "Sacrifice a Goblin" },
      targets: [{ kind: "any", purpose: "harm", amount: 1, prompt: "Siege-Gang Lieutenant deals 1 damage to" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && manaLeft(g, p) >= 4 && g.creatures(p).filter(c => c.isToken && isGoblin(g, c)).length >= 3 }
    }],
    ai: { priority: 6 }
  });
  D({
    name: ARTIST, cost: "{3}{R}", type: "Creature — Dwarf Shaman", pt: "2/2",
    text: "Storm-Kiln Artist gets +1/+0 for each artifact you control.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a Treasure token.",
    statics: [{ applies: (g, s, o) => o === s, pt: (g, s) => [g.battlefield.filter(a => a.controller === s.controller && g.isArtifact(a)).length, 0] }],
    triggers: [
      { on: "cast", when: (g, s, ev) => ev.p === s.controller && ev.item && isSpellCard(ev.item.o), do: (g, s, ev, { p }) => g.createToken(p, T.treasure) },
      { on: "copied", when: (g, s, ev) => ev.p === s.controller && ev.item && isSpellCard(ev.item.o), do: (g, s, ev, { p }) => g.createToken(p, T.treasure) }
    ],
    ai: { priority: 8, threat: 3, attack: (g, p, a, bl) => (bl.length ? false : undefined) }
  });

  /* ================================================================ instants */
  const creatureYou = (prompt, purpose) => ({ kind: "creature", you: true, purpose: purpose || "help", prompt });
  D({
    name: "Ancestors' Aid", cost: "{1}{R}", type: "Instant",
    text: "Target creature gets +2/+0 and gains first strike until end of turn.\nCreate a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    spell: { targets: [{ kind: "creature", purpose: "help", prompt: "+2/+0 and first strike" }], do: (g, ctx) => { if (ctx.legal[0]) g.pump(ctx.targets[0], 2, 0, ["first strike"]); g.createToken(ctx.p, T.treasure); } },
    ai: { priority: 6, target: helpTarget, cast: zadaCast(2, (g, p, o, ctx) => (ctx.window === "combat" ? 12 : false)), trick: true }
  });
  D({
    name: "Battle Hymn", cost: "{1}{R}", type: "Instant",
    text: "Add {R} for each creature you control.",
    spell: { do: (g, ctx) => { const n = g.creatures(ctx.p).length; if (n > 0) { ctx.p.pool.R += n; g.bump(); say(g, ctx.p, `${ctx.p.name} adds ${n} red mana.`, ["Battle Hymn"]); } } },
    ai: { priority: 2, cast: () => false }
  });
  const hasteDraw = (name, cost, extra, note) => D(Object.assign({
    name, cost, type: "Instant",
    text: extra,
    spell: { targets: [{ kind: "creature", purpose: "help", prompt: name }], do: (g, ctx) => { if (ctx.legal[0]) g.grant([ctx.targets[0]], ["haste"]); g.draw(ctx.p, 1); } },
    ai: { priority: 5, target: helpTarget, cast: zadaCast(2, (g, p, o, ctx) => (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p ? 6 : false)) }
  }, note ? { note } : {}));
  hasteDraw("Expedite", "{R}", "Target creature gains haste until end of turn.\nDraw a card.");
  hasteDraw("Crimson Wisps", "{R}", "Target creature becomes red and gains haste until end of turn.\nDraw a card.");
  D({
    name: "Fists of Flame", cost: "{1}{R}", type: "Instant",
    text: "Draw a card. Until end of turn, target creature gains trample and gets +1/+0 for each card you've drawn this turn.",
    spell: { targets: [{ kind: "creature", purpose: "help", prompt: "Trample and +1/+0 per card drawn" }], do: (g, ctx) => { g.draw(ctx.p, 1); const n = (ctx.p.drawnThisTurn || []).length; if (ctx.legal[0]) g.pump(ctx.targets[0], n, 0, ["trample"]); } },
    ai: { priority: 5, target: helpTarget, cast: zadaCast(3, null) }
  });
  D({
    name: "Great Train Heist", cost: "{R}", type: "Instant",
    text: "Spree (Choose one or more additional costs.)\n+ {2}{R} — Untap all creatures you control. If it's your combat phase, there is an additional combat phase after this phase.\n+ {2} — Creatures you control get +1/+0 and gain first strike until end of turn.\n+ {R} — Choose target opponent. Whenever a creature you control deals combat damage to that player this turn, create a tapped Treasure token.",
    note: "The spree choices are offered as four ways to cast it: untap, pump, both, or all three.",
    altOnly: true,
    altCosts: [
      { label: "Untap, extra combat", cost: "{2}{R}{R}" },
      { label: "+1/+0 and first strike", cost: "{2}{R}" },
      { label: "Untap and pump", cost: "{4}{R}{R}" },
      { label: "All three", cost: "{4}{R}{R}{R}", targets: [{ kind: "opponent", purpose: "harm", prompt: "Treasures for each hit on target opponent" }] }
    ],
    spell: {
      do: async (g, ctx) => {
        const alt = ctx.item.alt, p = ctx.p;
        const untap = alt === 1 || alt === 3 || alt === 4, pump = alt === 2 || alt === 3 || alt === 4;
        if (pump) { g.addEffect({ objs: g.creatures(p), pt: [1, 0], kw: ["first strike"] }); say(g, p, `Creatures ${p.name} controls get +1/+0 and first strike.`, ["Great Train Heist"]); }
        if (untap) {
          for (const c of g.creatures(p)) g.untap(c);
          if (g.active === p && g.combat) g.addExtraCombat(p);
        }
        if (alt === 4 && ctx.legal[0]) {
          const q = ctx.targets[0], turn = g.turn;
          g.addEmblem(p, { name: "Great Train Heist", text: `Treasures for combat damage to ${q.name} this turn.`, triggers: [{ on: "combatDamagePlayer", when: (g2, s, ev) => g2.turn === turn && ev.p === q && ev.src && ev.src.controller === p, do: (g2, s, ev) => g2.createToken(p, T.treasure, { tapped: true }) }] });
        }
      }
    },
    ai: { priority: 5, cast: (g, p, o, ctx) => (ctx.window === "combat" && g.active === p && g.combat && g.combat.attackers.filter(a => a.controller === p).length >= 3 ? 20 : false) }
  });
  D({
    name: "Sazacap's Brew", cost: "{1}{R}", type: "Instant",
    text: "Gift a tapped Fish (You may promise an opponent a gift as you cast this spell. If you do, they create a tapped 1/1 blue Fish creature token before its other effects.)\nAs an additional cost to cast this spell, discard a card.\nTarget player draws two cards. If the gift was promised, target creature you control gets +2/+0 until end of turn.",
    note: "The card is discarded and the gift chosen right after you cast it. The gift goes to the next opponent in turn order.",
    canCast: (g, p, o) => p.hand.some(c => c !== o),
    spell: {
      targets: [{ kind: "player", purpose: "help", prompt: "Target player draws two cards", playerFilter: (g, pl, p) => true }, { kind: "creature", you: true, optional: true, purpose: "help", prompt: "+2/+0 if the gift was promised" }],
      do: (g, ctx) => {
        if (ctx.item.gift) { const q = g.opponents(ctx.p)[0]; if (q) g.createToken(q, T.gsFish, { tapped: true }); }
        if (ctx.legal[0]) g.draw(ctx.targets[0], 2);
        if (ctx.item.gift && ctx.legal[1]) g.pump(ctx.targets[1], 2, 0);
      }
    },
    onCast: async (g, p, o, item) => {
      const opts = p.hand.filter(c => c !== o);
      if (opts.length) {
        const pick = await g.ask(p, { type: "cards", prompt: "Sazacap's Brew: discard a card", options: opts, min: 1, max: 1, purpose: "discard", src: o });
        const c = (pick && pick[0]) || opts[opts.length - 1];
        if (c && c.zone === "hand") g.discard(p, c);
      }
      if (item.targets[1]) item.gift = !!(await g.ask(p, { type: "confirm", prompt: "Promise a gift (an opponent gets a tapped Fish) for +2/+0?", purpose: "gift", src: o }));
    },
    ai: { priority: 3, target: (g, p, req) => (req.spec && req.spec.kind === "player" ? (req.options.includes(p) ? p : undefined) : null), confirm: () => false, cast: (g, p, o, ctx) => (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && p.hand.some(c => c.def.types.includes("Land")) ? 4 : false) }
  });
  D({
    name: "Seething Song", cost: "{2}{R}", type: "Instant",
    text: "Add {R}{R}{R}{R}{R}.",
    spell: { do: (g, ctx) => { ctx.p.pool.R += 5; g.bump(); say(g, ctx.p, `${ctx.p.name} adds {R}{R}{R}{R}{R}.`, ["Seething Song"]); } },
    ai: { priority: 2, cast: () => false }
  });

  /* ================================================================ sorceries */
  D({
    name: "Daring Discovery", cost: "{4}{R}", type: "Sorcery",
    text: "Up to three target creatures can't block this turn.\nDiscover 4. (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
    spell: {
      targets: [
        { kind: "creature", optional: true, purpose: "help", prompt: "Can't block this turn (1 of up to 3; Zada alone copies it)" },
        { kind: "creature", optional: true, opp: true, purpose: "harm", prompt: "Can't block this turn (2 of 3)" },
        { kind: "creature", optional: true, opp: true, purpose: "harm", prompt: "Can't block this turn (3 of 3)" }
      ],
      do: async (g, ctx) => {
        const list = ctx.targets.filter((t, i) => t && ctx.legal[i]);
        if (list.length) g.addEffect({ objs: list, cantBlock: true });
        await g.discover(ctx.p, 4, ctx.o);
      }
    },
    ai: {
      priority: 6,
      target: (g, p, req) => {
        const z = g.battlefield.find(o => o.controller === p && o.def.name === ZADA);
        if (z && others(g, p, z).length >= 2) return req.options.includes(z) ? z : null;
        return undefined;
      },
      cast: zadaCast(2, (g, p, o, ctx) => (ctx.window === "main1" ? 10 : false))
    }
  });
  D({
    name: "Glimpse the Impossible", cost: "{2}{R}", type: "Sorcery",
    text: "Exile the top three cards of your library. You may play those cards this turn.\nAt the beginning of the next end step, if any of those cards remain exiled, put them into your graveyard, then create a 0/1 colorless Eldrazi Spawn creature token for each card put into your graveyard this way. Those tokens have \"Sacrifice this creature: Add {C}.\"",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p, list = g.impulse(p, 3), zcs = list.map(c => c.zc);
        g.delayed.push({ at: "endStep", once: true, controller: p, do: g2 => {
          let n = 0;
          list.forEach((c, i) => { if (c.zone === "exile" && c.zc === zcs[i]) { g2.moveTo(c, "graveyard"); n++; } });
          if (n) g2.createToken(p, T.gsSpawn, { count: n });
        } });
      }
    },
    ai: { priority: 4, draw: true, cast: (g, p, o, ctx) => (ctx.window === "main1" && manaLeft(g, p) >= 6 ? 8 : false) }
  });
  D({
    name: "Goblin Negotiation", cost: "{X}{R}{R}", type: "Sorcery",
    text: "Goblin Negotiation deals X damage to target creature. Create a number of 1/1 red Goblin creature tokens equal to the amount of excess damage dealt to that creature this way.",
    minX: 1,
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Goblin Negotiation deals X damage to" }],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0], need = Math.max(0, g.toughness(t) - (t.damage || 0));
        const dealt = g.damage(ctx.o, t, ctx.x);
        const excess = Math.max(0, (typeof dealt === "number" ? dealt : ctx.x) - need);
        if (excess > 0) g.createToken(ctx.p, T.goblin, { count: excess });
      }
    },
    ai: { priority: 4, removal: true, minThreat: 4, x: (g, p, o, xMax) => xMax, target: (g, p, req) => req.options.filter(o => o.controller !== p).sort((a, b) => g.toughness(a) - g.toughness(b))[0] || null }
  });
  D({
    name: "Grapeshot", cost: "{1}{R}", type: "Sorcery",
    keywords: ["storm"],
    text: "Grapeshot deals 1 damage to any target.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    spell: { targets: [{ kind: "any", purpose: "harm", amount: 1, prompt: "Grapeshot deals 1 damage to" }], do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.o, ctx.targets[0], 1); } },
    onCast: (g, p, o, item) => storm(g, p, o, item, true),
    ai: { priority: 3, confirm: (g, p, req) => (req.purpose === "stormSame" ? true : undefined), target: (g, p, req) => grapeTarget(g, p, req), cast: (g, p, o, ctx) => grapeCast(g, p, ctx) }
  });
  /* Grapeshot: at the lowest opponent it can kill, or its most dangerous small creature. */
  function grapeTarget(g, p, req) {
    const n = (g.spellsThisTurn || 0) + 1;
    const opps = req.options.filter(x => g.isPlayer(x) && x !== p);
    const kill = opps.filter(q => q.life <= n).sort((a, b) => a.life - b.life)[0];
    if (kill) return kill;
    return lowestLife(opps) || undefined;
  }
  function grapeCast(g, p, ctx) {
    const n = (g.spellsThisTurn || 0) + 1;
    const low = lowestLife(g.opponents(p).filter(q => !g.playerHexproof(q)));
    if (low && low.life <= n) return 60;
    return ctx.window === "main2" && n >= 6 ? 15 : false;
  }
  D({
    name: HAZE, cost: "{1}{R}", type: "Sorcery",
    keywords: ["storm"],
    kicker: "{2}", kickerName: "buyback",
    text: "Buyback {2} (You may pay an additional {2} as you cast this spell. If you do, put this card into your hand as it resolves.)\nCreatures you control get +1/+0 until end of turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
    note: "Buyback is asked like a kicker.",
    spell: { do: (g, ctx) => { g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 0] }); if (ctx.kicked && !ctx.item.isCopy) ctx.item.toHand = true; } },
    onCast: (g, p, o, item) => storm(g, p, o, item, false),
    ai: { priority: 2, cast: () => false }
  });
  D({
    name: "Mana Geyser", cost: "{3}{R}{R}", type: "Sorcery",
    text: "Add {R} for each tapped land your opponents control.",
    spell: { do: (g, ctx) => { const n = g.battlefield.filter(o => o.controller !== ctx.p && g.isLand(o) && o.tapped).length; if (n) { ctx.p.pool.R += n; g.bump(); say(g, ctx.p, `${ctx.p.name} adds ${n} red mana.`, ["Mana Geyser"]); } } },
    ai: { priority: 1, cast: () => false }
  });
  D({
    name: "Past in Flames", cost: "{3}{R}", type: "Sorcery",
    flashback: "{4}{R}",
    text: "Each instant and sorcery card in your graveyard gains flashback until end of turn. The flashback cost is equal to its mana cost.\nFlashback {4}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    spell: { do: (g, ctx) => { ctx.p.flashbackAll = g.turn; g.bump(); say(g, ctx.p, `Instants and sorceries in ${ctx.p.name}'s graveyard have flashback this turn.`, ["Past in Flames"]); } },
    ai: { priority: 2, cast: (g, p, o, ctx) => (ctx.window === "main1" && g.active === p && p.graveyard.filter(c => isSpellCard(c) && c !== o).length >= 4 && (g.spellsThisTurn || 0) >= 2 ? 18 : false) }
  });
  D({
    name: "Renegade Tactics", cost: "{R}", type: "Sorcery",
    text: "Target creature can't block this turn.\nDraw a card.",
    spell: { targets: [{ kind: "creature", purpose: "help", prompt: "Can't block this turn" }], do: (g, ctx) => { if (ctx.legal[0]) g.addEffect({ objs: [ctx.targets[0]], cantBlock: true }); g.draw(ctx.p, 1); } },
    ai: { priority: 5, target: (g, p, req) => zadaFor(g, p, req) || req.options.filter(o => o.controller !== p).sort((a, b) => value(g, b) - value(g, a))[0] || undefined, cast: zadaCast(2, (g, p, o, ctx) => (ctx.window === "main1" ? 5 : false)) }
  });
  D({
    name: "Spreading Insurrection", cost: "{4}{R}", type: "Sorcery",
    keywords: ["storm"],
    text: "Gain control of target creature you don't control until end of turn. Untap that creature. It gains haste until end of turn.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    spell: { targets: [{ kind: "creature", opp: true, purpose: "harm", prompt: "Gain control until end of turn" }], do: (g, ctx) => { const t = ctx.targets[0]; if (!ctx.legal[0] || t.controller === ctx.p) return; stealUntilEot(g, ctx.p, t); g.untap(t); g.grant([t], ["haste"]); } },
    onCast: (g, p, o, item) => storm(g, p, o, item, true),
    ai: { priority: 3, confirm: (g, p, req) => (req.purpose === "stormSame" ? false : undefined), target: (g, p, req) => req.options.filter(o => o.controller !== p && o.zone === "battlefield").sort((a, b) => value(g, b) - value(g, a))[0] || undefined, cast: (g, p, o, ctx) => (ctx.window === "main1" && (g.spellsThisTurn || 0) >= 3 ? 14 : false) }
  });
  D({
    name: "Wild Ride", cost: "{R}", type: "Sorcery",
    flashback: "{4}{R}",
    text: "Target creature gets +3/+0 and gains haste until end of turn.\nHarmonize {4}{R} (You may cast this card from your graveyard for its harmonize cost. You may tap a creature you control to reduce that cost by {X}, where X is its power. Then exile this spell.)",
    note: "Harmonize is played as flashback {4}{R}: tapping a creature to lower the cost isn't modeled.",
    spell: { targets: [{ kind: "creature", purpose: "help", prompt: "+3/+0 and haste" }], do: (g, ctx) => { if (ctx.legal[0]) g.pump(ctx.targets[0], 3, 0, ["haste"]); } },
    ai: { priority: 5, target: helpTarget, cast: zadaCast(4, null) }
  });
  D({
    name: "Witch's Mark", cost: "{1}{R}", type: "Sorcery",
    text: "You may discard a card. If you do, draw two cards.\nCreate a Wicked Role token attached to up to one target creature you control. (If you control another Role on it, put that one into the graveyard. Enchanted creature gets +1/+1. When this Aura is put into a graveyard, each opponent loses 1 life.)",
    note: "The Wicked Role is a +1/+1 counter here (one per creature); each opponent loses 1 life when that creature dies.",
    spell: {
      targets: [{ kind: "creature", you: true, optional: true, purpose: "help", prompt: "Wicked Role on target creature you control" }],
      do: async (g, ctx) => {
        const p = ctx.p;
        if (p.hand.length) {
          const pick = await g.ask(p, { type: "cards", prompt: "Witch's Mark: discard a card to draw two? (pick none to skip)", options: p.hand.slice(), min: 0, max: 1, purpose: "discard", src: ctx.o });
          const c = pick && pick[0];
          if (c && c.zone === "hand") { g.discard(p, c); g.draw(p, 2); }
        }
        const t = ctx.targets[0];
        if (t && ctx.legal[0] && !t.state.wickedRole) { t.state.wickedRole = true; g.addCounters(t, "p1", 1, ctx.o); wickedEmblem(g, p); }
      }
    },
    ai: {
      priority: 4, target: helpTarget,
      cards: (g, p, req) => (req.purpose === "discard" ? [req.options.filter(c => c.def.types.includes("Land")).pop() || req.options.slice().sort((a, b) => a.def.mv - b.def.mv)[0]].filter(Boolean) : null),
      cast: zadaCast(2, (g, p, o, ctx) => (ctx.window === "main2" && p.hand.length >= 6 ? 4 : false))
    }
  });
  function wickedEmblem(g, p) {
    if (p.gsWicked) return;
    p.gsWicked = true;
    g.addEmblem(p, { name: "Wicked Role", text: "When a creature with a Wicked Role dies, each opponent loses 1 life.", triggers: [{ on: "dies", when: (g2, s, ev) => ev.o && ev.o.state && ev.o.state.wickedRole && ev.lki && ev.lki.controller === p, do: (g2, s, ev) => { for (const q of g2.opponents(p)) g2.loseLife(q, 1, s); } }] });
  }

  /* ================================================================ artifacts and enchantments */
  D({
    name: "Throne of Eldraine", cost: "{5}", type: "Legendary Artifact",
    text: "As Throne of Eldraine enters, choose a color.\n{T}: Add four mana of the chosen color. Spend this mana only to cast monocolored spells of that color.\n{3}, {T}: Draw two cards. Spend only mana of the chosen color to activate this ability.",
    note: "The color is always red. The draw ability costs {R}{R}{R} here.",
    mana: [{ tap: true, produce: "RRRR", spellOnly: (g, spell) => { const c = g.colorsOf(spell); return c.size === 1 && c.has("R"); } }],
    abilities: [{ label: "Draw two", cost: "{R}{R}{R}", tap: true, do: (g, s, ctx) => g.draw(ctx.p, 2), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p } }],
    ai: { priority: 6, ramp: true }
  });
  D({
    name: "Frontline Heroism", cost: "{2}{R}", type: "Enchantment",
    text: "When Frontline Heroism enters, create a 1/1 red Soldier creature token with haste.\nWhenever you cast a spell that targets only a single creature you control, create a 1/1 red Soldier creature token with haste, then copy that spell. The copy targets that token.",
    note: "Only instants and sorceries are copied. Its trigger resolves before Zada's, so Zada copies onto the new Soldier too.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.gsSoldier) },
      {
        on: "cast",
        when: (g, s, ev) => { const it = ev.item; if (!it || ev.p !== s.controller || it.isCopy || !isSpellCard(it.o)) return false; const ts = (it.targets || []).filter(Boolean); return ts.length === 1 && !g.isPlayer(ts[0]) && ts[0].controller === s.controller && g.isCreature(ts[0]); },
        do: async (g, s, ev, { p }) => {
          const item = ev.item;
          const made = g.createToken(p, T.gsSoldier);
          if (!g.stack.includes(item) || !made.length) return;
          const idx = item.targets.findIndex(Boolean);
          const copy = await g.copySpell(item, p, false);
          copy.targets = item.targets.map((t, i) => (i === idx ? made[0] : null));
        }
      }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Quest for the Goblin Lord", cost: "{R}", type: "Enchantment",
    text: "Whenever a Goblin you control enters, you may put a quest counter on Quest for the Goblin Lord.\nAs long as Quest for the Goblin Lord has five or more quest counters on it, creatures you control get +2/+0.",
    note: "It always takes the counter. Goblins that enter at the same time each add one.",
    triggers: [{ on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && isGoblin(g, ev.o) && (s.counters.quest || 0) < 5, do: (g, s) => g.addCounters(s, "quest", 1, s) }],
    statics: [{ applies: (g, s, o) => (s.counters.quest || 0) >= 5 && o.controller === s.controller && g.isCreature(o), pt: [2, 0] }],
    ai: { priority: 7 }
  });

  /* ================================================================ lands */
  D({
    name: "Arena of Glory", type: "Land",
    text: "Arena of Glory enters tapped unless you control a Mountain.\n{T}: Add {R}.\n{R}, {T}, Exert this land: Add {R}{R}. If any of that mana is spent on a creature spell, it gains haste until end of turn. (An exerted permanent won't untap during your next untap step.)",
    note: "The exert ability isn't used.",
    etbTapped: (g, o) => !g.battlefield.some(c => c !== o && c.controller === o.controller && g.hasSub(c, "Mountain")),
    mana: [{ tap: true, produce: "R" }]
  });
  D({
    name: "Dwarven Mine", type: "Land — Mountain",
    text: "({T}: Add {R}.)\nDwarven Mine enters tapped unless you control three or more other Mountains.\nWhen Dwarven Mine enters untapped, create a 1/1 red Dwarf creature token.",
    etbTapped: (g, o) => g.battlefield.filter(c => c !== o && c.controller === o.controller && g.hasSub(c, "Mountain")).length < 3,
    mana: [{ tap: true, produce: "R" }],
    triggers: [{ on: "enters", self: true, when: (g, s) => !s.tapped, do: (g, s, ev, { p }) => g.createToken(p, T.gsDwarf) }]
  });
  const cycler = (name, cost, text) => D({ name, type: "Land", text, etbTapped: true, cycling: cost, mana: [{ tap: true, produce: "R" }] });
  cycler("Forgotten Cave", "{R}", "Forgotten Cave enters tapped.\n{T}: Add {R}.\nCycling {R} ({R}, Discard this card: Draw a card.)");
  cycler("Smoldering Crater", "{2}", "Smoldering Crater enters tapped.\n{T}: Add {R}.\nCycling {2} ({2}, Discard this card: Draw a card.)");
  D({
    name: "Fountainport", type: "Land",
    text: "{T}: Add {C}.\n{2}, {T}, Sacrifice a token: Draw a card.\n{3}, {T}, Pay 1 life: Create a 1/1 blue Fish creature token.\n{4}, {T}: Create a Treasure token.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [
      { label: "Sacrifice a token: draw", cost: "{2}", tap: true, sacCost: { filter: (g, c, src) => c.controller === src.controller && c.isToken, prompt: "Sacrifice a token" }, do: (g, s, ctx) => g.draw(ctx.p, 1), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && g.battlefield.some(c => c.controller === p && c.isToken && (c.def.name === "Eldrazi Spawn" || c.def.name === "Kobolds of Kher Keep")) } },
      { label: "Make a Fish", cost: "{3}", tap: true, payLife: 1, do: (g, s, ctx) => g.createToken(ctx.p, T.gsFish), ai: { use: () => false } },
      { label: "Make a Treasure", cost: "{4}", tap: true, do: (g, s, ctx) => g.createToken(ctx.p, T.treasure), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && manaLeft(g, p) >= 6 } }
    ]
  });
  D({
    name: "Goblin Burrows", type: "Land",
    text: "{T}: Add {C}.\n{1}{R}, {T}: Target Goblin creature gets +2/+0 until end of turn.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{ label: "A Goblin gets +2/+0", cost: "{1}{R}", tap: true, targets: [{ kind: "creature", purpose: "help", filter: (g, o) => isGoblin(g, o), prompt: "+2/+0" }], do: (g, s, ctx) => { if (ctx.legal[0]) g.pump(ctx.targets[0], 2, 0); }, ai: { use: (g, p, o, ctx) => ctx.window === "combat" && g.active === p && !!g.combat && g.combat.attackers.some(a => a.controller === p && !a.combat.blockedBy.length && isGoblin(g, a)) } }]
  });
  D({
    name: "Hidden Volcano", type: "Land — Cave",
    text: "Hidden Volcano enters tapped.\n{T}: Add {R}.\n{4}{R}, {T}, Sacrifice Hidden Volcano: Discover 4. Activate only as a sorcery. (Exile cards from the top of your library until you exile a nonland card with mana value 4 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
    etbTapped: true,
    mana: [{ tap: true, produce: "R" }],
    abilities: [{ label: "Discover 4", cost: "{4}{R}", tap: true, sacSelf: true, timing: "sorcery", do: (g, s, ctx) => g.discover(ctx.p, 4, s), ai: { use: (g, p, o, ctx) => ctx.window === "main2" && manaLeft(g, p) >= 7 && g.controlled(p, x => g.isLand(x)).length >= 8 } }]
  });
  D({
    name: "Kher Keep", type: "Legendary Land",
    text: "{T}: Add {C}.\n{1}{R}, {T}: Create a 0/1 red Kobold creature token named Kobolds of Kher Keep.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{ label: "Make a Kobold", cost: "{1}{R}", tap: true, do: (g, s, ctx) => g.createToken(ctx.p, T.gsKobold), ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p && manaLeft(g, p) >= 3 } }]
  });
  D({
    name: "Shinka, the Bloodsoaked Keep", type: "Legendary Land",
    text: "{T}: Add {R}.\n{R}, {T}: Target legendary creature gains first strike until end of turn.",
    mana: [{ tap: true, produce: "R" }],
    abilities: [{ label: "First strike", cost: "{R}", tap: true, targets: [{ kind: "creature", purpose: "help", filter: (g, o) => o.def.supertypes.includes("Legendary"), prompt: "First strike" }], do: (g, s, ctx) => { if (ctx.legal[0]) g.grant([ctx.targets[0]], ["first strike"]); }, ai: { use: () => false } }]
  });
  D({
    name: "Spinerock Knoll", type: "Land",
    text: "Hideaway 4 (When this permanent enters, look at the top four cards of your library, exile one face down, then put the rest on the bottom of your library.)\nSpinerock Knoll enters tapped.\n{T}: Add {R}.\n{R}, {T}: You may play the exiled card without paying its mana cost if an opponent was dealt 7 or more damage this turn.",
    etbTapped: true,
    mana: [{ tap: true, produce: "R" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 4);
        if (!top.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Hideaway: exile one card face down", options: top, min: 1, max: 1, purpose: "hideaway", src: s });
        const c = (pick && pick[0]) || top[0];
        g.moveTo(c, "exile");
        c.state.hiddenBy = s.id;
        s.state.hidden = c;
        for (const x of top) if (x !== c && x.zone === "library") { g.removeFromZone(x); p.library.push(x); }
        g.bump();
        say(g, p, `${p.name} exiles a card face down with Spinerock Knoll.`, ["Spinerock Knoll"]);
      }
    }],
    abilities: [{
      label: "Play the hidden card", cost: "{R}", tap: true,
      condition: (g, o) => !!o.state.hidden && o.state.hidden.zone === "exile" && g.opponents(o.controller).some(q => (q.damageTakenThisTurn || 0) >= 7),
      do: async (g, s, ctx) => { const c = s.state.hidden; if (!c || c.zone !== "exile") return; s.state.hidden = null; if (c.def.types.includes("Land")) { c.playable = { by: ctx.p, turn: g.turn }; } else await g.castWithoutPaying(ctx.p, c); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" || ctx.window === "main2" }
    }],
    ai: { cards: (g, p, req) => (req.purpose === "hideaway" ? [req.options.slice().sort((a, b) => b.def.mv - a.def.mv)[0]] : null) }
  });

  /* ================================================================ Roaming Throne: Goblin for this deck */
  (function () {
    const rt = MK.get("Roaming Throne");
    if (!rt) return;
    const prevState = rt.etbState;
    rt.note = "The chosen type is Goblin in a deck with more Goblins than Assassins, otherwise Assassin.";
    rt.etbState = (g, o, opts) => {
      const p = o.controller || o.owner;
      const all = p ? p.library.concat(p.hand, p.graveyard, g.battlefield.filter(c => c.controller === p), p.command) : [];
      const gob = all.filter(c => c.def && c.def.subtypes.includes("Goblin")).length, ass = all.filter(c => c.def && c.def.subtypes.includes("Assassin")).length;
      const base = prevState ? prevState(g, o, opts) || {} : {};
      return gob > ass ? Object.assign({}, base, { chosenType: "Goblin" }) : base;
    };
    rt.statics = rt.statics.concat([
      { applies: (g, s, o) => o === s && s.state.chosenType === "Goblin", subtypes: ["Goblin"] },
      { triggerExtra: (g, s, f) => (s.state.chosenType === "Goblin" && f.src && f.src !== s && !f.src.emblem && f.src.def && f.controller === s.controller && f.src.controller === s.controller && f.src.zone === "battlefield" && g.isCreature(f.src) && gobQuick(g, f.src) && !f.src.def.subtypes.includes("Assassin") ? 1 : 0) }
    ]);
  })();

  /* ================================================================ the bot's brain
     Runs first each time Zada's controller could act (from the command zone or the battlefield):
     the Haze of Rage loop with Storm-Kiln Artist, rituals that unlock a spell, and Zada spells. */
  function wouldCastNow(g, p, o) {
    const n = o.def.name;
    if (["Brightstone Ritual", "Battle Hymn", "Seething Song", "Mana Geyser", HAZE].includes(n)) return false;
    return true;
  }
  function unlocks(g, p, extra, except) {
    for (const o of g.castZones(p)) {
      if (o === except || o.def.types.includes("Land") || o.def.mv < 2) continue;
      if (!wouldCastNow(g, p, o) && !o.isCommander) continue;
      if (g.castOptions(p, o).length) continue;
      p.pool.R += extra;
      let ok = false;
      try { ok = g.castOptions(p, o).length > 0; } finally { p.pool.R -= extra; }
      if (ok) return o;
    }
    return null;
  }
  // games recorded before engine 10 replay with the first bot (no storm turns, Zada spells from 2 copies, any Blasphemous Act)
  const legacy = g => !!(g.opts && g.opts.legacyGstorm);
  const FINISHERS = ["Grapeshot", "Empty the Warrens"];
  // net red mana a ritual adds, as it would resolve now (it costs its mana value)
  const RITUALS = {
    "Seething Song": () => 5,
    "Brightstone Ritual": (g, p) => g.battlefield.filter(o => isGoblin(g, o)).length,
    "Battle Hymn": (g, p) => g.creatures(p).length,
    "Mana Geyser": (g, p) => g.battlefield.filter(x => x.controller !== p && g.isLand(x) && x.tapped).length
  };
  // cheap spells a storm turn can spend on raising the count (they do something on their own too; no discard spells)
  const FODDER = ["Expedite", "Crimson Wisps", "Renegade Tactics", "Krenko's Command", "Dragon Fodder", "Ancestors' Aid", "Witch's Mark", "Fists of Flame", "Wild Ride", HAZE];
  /* A storm turn: count the mana in play and in the rituals, the cheap spells that raise the storm
     count and the finishers, and go when Grapeshot kills someone, Empty the Warrens makes a real army
     (or pings someone out with Impact Tremors and Kreat), or the Haze loop with Storm-Kiln Artist can
     start. Then cast the pieces in order: rituals when the mana is short, cheap spells, finishers last. */
  function stormTurn(g, p, acts, win) {
    const m = M(p);
    const cast = n => acts.find(a => a.type === "cast" && a.card.def.name === n && !a.alt) || null;
    const inH = n => p.hand.filter(c => c.def.name === n);
    const fin = FINISHERS.filter(n => inH(n).length);
    const loop = named(g, p, ARTIST) && inH(HAZE).length && win === "main1";
    // without Artist, Haze of Rage is a pump before combat: each copy is +1/+0 on every attacker
    const att = g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste"))).length;
    const pump = !loop && inH(HAZE).length && win === "main1" && att >= 3;
    if (!fin.length && !loop && !pump) return null;
    const s = g.spellsThisTurn || 0;
    const medal = g.battlefield.some(x => x.controller === p && x.def.name === "Ruby Medallion") ? 1 : 0;
    const cost = c => Math.max(c.def.name === "Empty the Warrens" ? 1 : c.def.mv > 0 ? 1 : 0, c.def.mv - medal);
    let mana = manaLeft(g, p);
    const finCost = fin.reduce((t, n) => t + cost(inH(n)[0]), 0) + (pump ? cost(inH(HAZE)[0]) : 0);
    // rituals first in the count (only the ones that add more than they cost), then the cheapest spells
    const rit = Object.keys(RITUALS).flatMap(inH).map(c => ({ c, net: RITUALS[c.def.name](g, p) - cost(c) })).filter(r => r.net > 0);
    let plan = 0;
    for (const r of rit) if (mana >= cost(r.c)) { mana += r.net; plan++; }
    const fodder = FODDER.flatMap(inH).filter(c => !(c.def.name === HAZE && (loop || pump))).sort((a, b) => cost(a) - cost(b));
    for (const c of fodder) if (mana - finCost >= cost(c)) { mana -= cost(c); plan++; }
    const st = s + plan; // storm count when the first finisher is cast
    const opps = g.opponents(p).filter(q => !q.lost);
    const low = lowestLife(opps);
    const pingers = (named(g, p, "Impact Tremors") ? 1 : 0) + (named(g, p, "General Kreat, the Boltbringer") ? (named(g, p, "Roaming Throne") && named(g, p, "Roaming Throne").state.chosenType === "Goblin" ? 2 : 1) : 0);
    const hasE = fin.includes("Empty the Warrens"), hasG = fin.includes("Grapeshot");
    const gob = hasE ? 2 * (st + 1) : 0;
    const grape = hasG ? st + 1 + (hasE ? 1 : 0) : 0;
    const enough = mana >= finCost;
    let go = m.stormTurn === g.turn;
    if (!go && enough && low) {
      if (hasG && grape + gob * pingers >= low.life) go = true;                   // someone dies
      else if (hasE && gob * pingers >= low.life) go = true;
      else if (hasE && win === "main1" && gob >= 10) go = true;                   // a real army
      else if (hasE && win === "main2" && gob >= 8) go = true;
      else if (hasG && win === "main2" && grape >= 8 && !hasE) go = !!opps.find(q => q.life <= grape + 4) && p.hand.length <= 3;
    }
    if (!go && loop) go = s + plan >= 3 && enough;
    if (!go && pump && enough) go = (st + 1) * att >= 12;
    if (!go) return null;
    m.stormTurn = g.turn;
    // the next piece
    const avail = manaLeft(g, p);
    const restCost = fodder.filter(c => cast(c.def.name)).reduce((t, c) => t + cost(c), 0) + finCost;
    for (const r of rit) { const a = cast(r.c.def.name); if (a && avail < restCost) return { type: "cast", card: a.card, tag: "storm-ritual" }; }
    for (const c of fodder) {
      const a = cast(c.def.name);
      if (!a || avail - cost(c) < finCost) continue;
      const z = named(g, p, ZADA), specs = g.spellTargets(a.card, {});
      if (z && specs.length && g.legalTarget(p, specs[0], z, a.card) && /Expedite|Crimson Wisps|Renegade Tactics|Ancestors' Aid|Witch's Mark|Fists of Flame|Wild Ride/.test(c.def.name)) return { type: "cast", card: a.card, targets: specs.map((sp, i) => (i === 0 ? z : null)), tag: "storm-zada" };
      return { type: "cast", card: a.card, tag: "storm-fodder" };
    }
    for (const r of rit) { const a = cast(r.c.def.name); if (a) return { type: "cast", card: a.card, tag: "storm-ritual" }; }
    const e = cast("Empty the Warrens"); if (e) return { type: "cast", card: e.card, tag: "storm-finish" };
    const hz = pump && cast(HAZE);
    if (hz) return { type: "cast", card: hz.card, kicked: g.canPay(p, g.spellCost(p, hz.card, { kicked: true }), { spell: hz.card }), tag: "storm-pump" };
    const gr = cast("Grapeshot"); if (gr) return { type: "cast", card: gr.card, tag: "storm-finish" };
    return null;
  }
  /* Blasphemous Act kills Zada too: only when the table's creatures are far ahead of ours and
     they're hurting us. */
  function blasphemousOk(g, p) {
    const hit = c => g.isCreature(c) && !g.kw(c, "indestructible");
    const v = c => value(g, c) + (c.def.name === ZADA ? 10 : 0);
    const mine = g.battlefield.filter(c => c.controller === p && hit(c)).reduce((t, c) => t + v(c), 0);
    const theirs = g.battlefield.filter(c => c.controller !== p && hit(c));
    const tv = theirs.reduce((t, c) => t + value(g, c), 0), tp = theirs.reduce((t, c) => t + Math.max(0, g.power(c)), 0);
    return tv >= 16 && tv >= mine * 2 + 8 && (p.life <= 25 || tp >= 14);
  }
  /* Goblin Bombardment, the deck's sacrifice outlet (engine 10). Each Goblin sacrificed is 1 damage
     from Bombardment, 1 more from Pashalik Mons (twice with Roaming Throne naming Goblin) and 1 from
     Boggart Shenanigans. The bot cashes the board in when that kills an opponent, when a wipe or a
     removal spell would take the creatures anyway, and for creatures that die in this combat. */
  const OUTLET = "Goblin Bombardment";
  function perSac(g, p, c) {
    let n = 1;
    if (isGoblin(g, c)) {
      const mons = named(g, p, "Pashalik Mons"), rt = named(g, p, "Roaming Throne");
      if (mons) n += rt && rt.state.chosenType === "Goblin" && c !== mons ? 2 : 1;
      if (named(g, p, "Boggart Shenanigans")) n += 1;
    }
    return n;
  }
  function keepScore(g, p, c) {
    if (c.def.name === ZADA) return 100;
    if (c.def.name === "Pashalik Mons") return 60;
    if (["Krenko, Mob Boss", ARTIST, "General Kreat, the Boltbringer", "Goblin Chieftain", "Goblin Warchief"].includes(c.def.name)) return 30 + value(g, c);
    return (c.isToken ? 0 : 5) + value(g, c);
  }
  function outletOf(g, p) { return named(g, p, OUTLET); }
  function outletPlan(g, p, ctx) {
    const bomb = outletOf(g, p);
    if (!bomb || legacy(g)) return null;
    const m = M(p), win = ctx.window;
    const fodder = () => g.creatures(p).slice().sort((a, b) => keepScore(g, p, a) - keepScore(g, p, b));
    const foes = g.opponents(p).filter(q => !q.lost && !g.playerHexproof(q));
    const act = (n, stop) => ({ type: "activate", card: bomb, idx: 0, repeat: n, maxTries: 3, stop });
    // 1. lethal: fling Goblins (never Zada) at the opponent closest to dying
    {
      const list = fodder().filter(c => c.def.name !== ZADA);
      for (const q of foes.slice().sort((a, b) => a.life - b.life)) {
        let dmg = 0, n = 0;
        for (const c of list) { dmg += perSac(g, p, c); n++; if (dmg >= q.life) break; }
        if (dmg >= q.life && n <= list.length) {
          Object.assign(m, { focus: q, focusTurn: g.turn, dying: null });
          return act(n + 1, () => q.lost);
        }
      }
    }
    const low = lowestLife(foes);
    // 2. an opponent's wipe or removal on the stack
    const top = g.stack[g.stack.length - 1];
    if (top && top.p !== p && !top.countered && top.o && (win === "stack" || win === "ability")) {
      const d = top.o.def, A = MK.AI;
      const mass = d.ai && d.ai.wipe ? { hit: g.creatures(p).filter(c => !g.kw(c, "indestructible")) } : (A && A.massHarm ? A.massHarm(g, p, top) : null);
      const dying = mass && mass.hit ? mass.hit.filter(c => g.isCreature(c) && c.controller === p && c.zone === "battlefield") : [];
      if (dying.length >= 2) {
        Object.assign(m, { focus: low, focusTurn: g.turn, dying: new Set(dying.map(c => c.id)) });
        const zc = new Map(dying.map(c => [c.id, c.zc]));
        return act(dying.length, () => !dying.some(c => c.zone === "battlefield" && c.zc === zc.get(c.id)));
      }
      const specs = top.kind === "spell" ? g.spellTargets(top.o, top) : [];
      const hit = (top.targets || []).find((t, i) => t && !g.isPlayer(t) && t.zone === "battlefield" && t.controller === p && g.isCreature(t) && specs[i] && specs[i].purpose === "harm" && !g.kw(t, "indestructible"));
      if (hit) { Object.assign(m, { focus: low, focusTurn: g.turn, dying: new Set([hit.id]) }); return act(1); }
    }
    // 3. after blocks: creatures of ours that die in this combat anyway
    if (g.combat && win === "blockers") {
      const dies = [];
      for (const c of g.creatures(p)) {
        if (!c.combat || g.kw(c, "indestructible")) continue;
        const foesOn = c.combat.blocking ? [c.combat.blocking] : (c.combat.blockedBy || []);
        const hurt = foesOn.reduce((t, x) => t + Math.max(0, g.power(x)), 0);
        if (foesOn.length && hurt >= g.toughness(c) - (c.damage || 0) && c.def.name !== ZADA) dies.push(c);
      }
      if (dies.length) {
        Object.assign(m, { focus: low, focusTurn: g.turn, dying: new Set(dies.map(c => c.id)) });
        const zc = new Map(dies.map(c => [c.id, c.zc]));
        return act(dies.length, () => !dies.some(c => c.zone === "battlefield" && c.zc === zc.get(c.id)));
      }
    }
    return null;
  }
  // which creature to sacrifice, and where the damage goes
  function outletChoose(g, p, req) {
    if (legacy(g) || !req.src) return undefined;
    const m = M(p), name = req.src.def && req.src.def.name;
    if (req.purpose === "sacrifice" && name === OUTLET && req.options && req.options.length) {
      const opts = req.options.slice().sort((a, b) => keepScore(g, p, a) - keepScore(g, p, b));
      if (m.dying && m.focusTurn === g.turn) { const d = opts.find(c => m.dying.has(c.id)); if (d) return d; }
      return opts[0];
    }
    if ((name === OUTLET || name === "Pashalik Mons" || name === "Boggart Shenanigans") && (req.type === "target" || req.type === "player") && req.options) {
      const f = m.focus && m.focusTurn === g.turn && !m.focus.lost && req.options.includes(m.focus) ? m.focus : null;
      if (f) return f;
      const opp = req.options.filter(x => g.isPlayer(x) && x !== p && !x.lost);
      const kill = opp.filter(q => q.life <= 1)[0];
      return kill || undefined;
    }
    return undefined;
  }
  function brain(g, p, o, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    if (g.active !== p || (win !== "main1" && win !== "main2")) return null;
    const cast = n => acts.find(a => a.type === "cast" && a.card.def.name === n && !a.alt) || null;
    // 1. Storm-Kiln Artist + Haze of Rage with buyback, once it pays for itself
    const artist = named(g, p, ARTIST), haze = cast(HAZE);
    if (artist && haze && win === "main1") {
      const s = g.spellsThisTurn || 0;
      const attackers = g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste"))).length;
      const need = g.opponents(p).reduce((t, q) => t + q.life, 0);
      const power = g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste"))).reduce((t, c) => t + Math.max(0, g.power(c)), 0);
      const m = M(p);
      if (m.hazeTurn !== g.turn) { m.hazeTurn = g.turn; m.hazeN = 0; }
      if (s >= 3 && attackers >= 2 && power < need * 2 && m.hazeN < 40 && g.canPay(p, g.spellCost(p, haze.card, { kicked: true }), { spell: haze.card })) {
        m.hazeN++;
        return { type: "cast", card: haze.card, kicked: true, tag: "haze-loop" };
      }
    }
    // 1b. a storm turn, once it's worth it (engine 10)
    if (!legacy(g)) { const st = stormTurn(g, p, acts, win); if (st) return st; }
    // 2. a spell on Zada, after a cheap token spell when the mana covers both
    const z = named(g, p, ZADA);
    if (z) {
      const zHand = ["Ancestors' Aid", "Expedite", "Crimson Wisps", "Renegade Tactics", "Witch's Mark", "Daring Discovery"].map(cast).filter(Boolean);
      if (zHand.length) {
        for (const n of ["Krenko's Command", "Dragon Fodder", "Mogg War Marshal", "Empty the Warrens"]) {
          const t = cast(n);
          if (t && manaLeft(g, p) >= t.card.def.mv + Math.min(...zHand.map(a => a.card.def.mv))) return { type: "cast", card: t.card, tag: "bodies" };
        }
      }
      const n = zadaCopies(g, p, z);
      const order = ["Ancestors' Aid", "Daring Discovery", "Witch's Mark", "Expedite", "Crimson Wisps", "Renegade Tactics", "Fists of Flame", "Wild Ride"];
      const minFor = { "Ancestors' Aid": 2, "Daring Discovery": 2, "Witch's Mark": 2, "Expedite": 2, "Crimson Wisps": 2, "Renegade Tactics": 2, "Fists of Flame": 4, "Wild Ride": 4 };
      // engine 10: a cantrip on Zada already draws two with one other creature
      if (!legacy(g)) Object.assign(minFor, { "Expedite": 1, "Crimson Wisps": 1, "Renegade Tactics": 1 });
      for (const name of order) {
        const a = cast(name);
        if (!a || n < minFor[name]) continue;
        if ((name === "Wild Ride" || name === "Fists of Flame") && win !== "main1") continue;
        const specs = g.spellTargets(a.card, {});
        const targets = specs.map((sp, i) => (i === 0 ? z : null));
        if (!g.legalTarget(p, specs[0], z, a.card)) continue;
        return { type: "cast", card: a.card, targets, tag: "zada" };
      }
    }
    // 3. a ritual that unlocks a spell we can't cast yet
    const rituals = [["Seething Song", () => 2], ["Battle Hymn", () => g.creatures(p).length - 2], ["Mana Geyser", () => g.battlefield.filter(x => x.controller !== p && g.isLand(x) && x.tapped).length - 5]];
    for (const [name, gain] of rituals) {
      const a = cast(name);
      if (!a) continue;
      const extra = gain();
      if (extra < 1) continue;
      if (unlocks(g, p, extra, a.card)) return { type: "cast", card: a.card, tag: "ritual" };
    }
    return null;
  }
  const memo = new WeakMap();
  const M = p => { let m = memo.get(p); if (!m) { m = {}; memo.set(p, m); } return m; };

  /* ================================================================ coach (the Play tab's light bulb) */
  function coachTips(g, p) {
    const out = [];
    const myTurn = g.active === p, main = myTurn && (g.phase === "main1" || g.phase === "main2");
    const z = named(g, p, ZADA);
    const castable = n => p.hand.some(c => c.def.name === n && g.castOptions(p, c).length > 0);
    const s = g.spellsThisTurn || 0;
    const zSpells = ["Expedite", "Crimson Wisps", "Renegade Tactics", "Fists of Flame", "Ancestors' Aid", "Wild Ride", "Witch's Mark", "Daring Discovery"];
    if (z && main) {
      const n = zadaCopies(g, p, z);
      const ready = zSpells.filter(castable);
      if (ready.length && n >= 2) out.push({ level: "now", title: `Zada makes ${n} copies`, text: `Aim ${ready.slice(0, 3).join(", ")} at Zada and only Zada: each copy goes to one of your other creatures.${named(g, p, ARTIST) ? ` Storm-Kiln Artist makes ${n + 1} Treasures from each one.` : ""}`, cards: [ZADA].concat(ready.slice(0, 2)) });
      const tokenMakers = p.hand.filter(c => ["Krenko's Command", "Dragon Fodder", "Empty the Warrens", "Siege-Gang Commander", "Mogg War Marshal"].includes(c.def.name) && g.castOptions(p, c).length).map(c => c.def.name);
      const krenko = named(g, p, "Krenko, Mob Boss");
      if (ready.length && (tokenMakers.length || (krenko && !krenko.tapped && (!krenko.sick || g.kw(krenko, "haste"))))) out.push({ level: "plan", title: "Bodies first, then Zada's spells", text: "Every new creature is one more copy. Tap Krenko or cast your token spells before the spells on Zada.", cards: (krenko ? ["Krenko, Mob Boss"] : []).concat(tokenMakers.slice(0, 2)) });
    }
    if (!z && main && p.commanders[0] && p.commanders[0].zone === "command" && g.castOptions(p, p.commanders[0]).length && g.creatures(p).length >= 3) out.push({ level: "now", title: "Cast Zada", text: `You have ${g.creatures(p).length} creatures: every cheap spell aimed at her will be copied that many times.`, cards: [ZADA] });
    if (named(g, p, ARTIST) && inHand(p, HAZE) && main) out.push(s >= 3 ? { level: "win", title: "The Haze of Rage loop is on", text: `Storm is ${s}. Cast Haze of Rage with buyback: Storm-Kiln Artist makes ${s + 1} Treasures, more than the {3}{R} it costs. Repeat, then attack.`, cards: [ARTIST, HAZE] } : { level: "plan", title: "Haze loop: cast cheap spells first", text: `Storm is ${s}. Once three spells have been cast this turn, a buyback Haze of Rage pays for itself with Storm-Kiln Artist out.`, cards: [ARTIST, HAZE] });
    if (castable("Grapeshot")) {
      const dmg = s + 1, low = lowestLife(g.opponents(p));
      if (low && low.life <= dmg) out.push({ level: "win", title: `Grapeshot kills ${low.name}`, text: `Storm is ${s}: Grapeshot deals ${dmg} damage.`, cards: ["Grapeshot"] });
      else if (main) out.push({ level: "info", title: `Grapeshot would deal ${dmg}`, text: "Cast it last, after your cheap spells and rituals.", cards: ["Grapeshot"] });
    }
    if (castable("Empty the Warrens") && main && s >= 2) out.push({ level: "now", title: `Empty the Warrens makes ${2 * (s + 1)} Goblins`, text: named(g, p, "Impact Tremors") || named(g, p, "General Kreat, the Boltbringer") ? "Each one also pings every opponent." : "Cast it after your other spells.", cards: ["Empty the Warrens"] });
    const wipeWarn = g.opponents(p).some(q => q.hand.length >= 3) && g.creatures(p).length >= 8 && !named(g, p, "Goblin Bombardment") && !named(g, p, "Skirk Prospector");
    if (wipeWarn) out.push({ level: "warn", title: "Big board, no sac outlet", text: "A board wipe would take everything. Goblin Bombardment or Skirk Prospector turn a wipe into damage or mana.", cards: ["Goblin Bombardment", "Skirk Prospector"] });
    return out;
  }

  /* ================================================================ the deck */
  const singles = [
    // creatures (25)
    "Broadside Bombardiers", "Conspicuous Snoop", "Gempalm Incinerator", "General Kreat, the Boltbringer", "Goblin Bushwhacker",
    "Goblin Chieftain", "Goblin Dark-Dwellers", "Goblin Lackey", "Goblin Matron", "Goblin Trashmaster", "Goblin Warchief",
    "Grenzo, Havoc Raiser", "Howlsquad Heavy", "Impulsive Pilferer", "Krenko, Mob Boss", "Mogg War Marshal", "Pashalik Mons",
    "Redcap Gutter-Dweller", "Roaming Throne", "Rundvelt Hordemaster", "Searslicer Goblin", "Siege-Gang Commander",
    "Siege-Gang Lieutenant", "Skirk Prospector", ARTIST,
    // instants (10)
    "Ancestors' Aid", "Battle Hymn", "Brightstone Ritual", "Chaos Warp", "Crimson Wisps", "Expedite", "Fists of Flame",
    "Great Train Heist", "Sazacap's Brew", "Seething Song",
    // sorceries (17)
    "Blasphemous Act", "Daring Discovery", "Dragon Fodder", "Empty the Warrens", "Faithless Looting", "Glimpse the Impossible",
    "Goblin Negotiation", "Grapeshot", HAZE, "Krenko's Command", "Mana Geyser", "Past in Flames", "Renegade Tactics",
    "Spreading Insurrection", "Vandalblast", "Wild Ride", "Witch's Mark",
    // artifacts (6)
    "Idol of Oblivion", "Ruby Medallion", "Skullclamp", "Sol Ring", "Swiftfoot Boots", "Throne of Eldraine",
    // enchantments (5)
    "Boggart Shenanigans", "Frontline Heroism", "Goblin Bombardment", "Impact Tremors", "Quest for the Goblin Lord",
    // lands (14 + 22 Mountains)
    "Arena of Glory", "Castle Embereth", "Den of the Bugbear", "Dwarven Mine", "Forgotten Cave", "Fountainport", "Goblin Burrows",
    "Hidden Volcano", "Kher Keep", "Reliquary Tower", "Shinka, the Bloodsoaked Keep", "Smoldering Crater", "Spinerock Knoll", "War Room"
  ];
  const LIST = singles.concat(Array(22).fill("Mountain"));
  MK.GSTORM_DECK = {
    id: "goblin-storm", hero: "goblin-storm", label: "Goblin Storm", name: "Goblin Storm", title: ZADA,
    commander: ZADA, identity: ["R"], bracket: 3, aggression: 0.65,
    style: "Goblin storm",
    precon: "Secret Lair Commander Deck: Goblin Storm (2026)",
    blurb: "Zada copies every cheap spell aimed at her once per creature: cards, Treasures and haste for the whole swarm. Rituals and Treasures chain into Grapeshot and Empty the Warrens, and Storm-Kiln Artist with Haze of Rage is a loop.",
    watch: [ZADA, "Krenko, Mob Boss", ARTIST, "Impact Tremors", "Goblin Bombardment", "Grapeshot"],
    list: LIST,
    coach: { tips: coachTips, checklist: "gstorm" }
  };
  MK.GSTORM_AI = { brain, coachTips, zadaCopies, stormTurn, blasphemousOk, outletPlan, perSac };
  // the deck's brain for the shared cards: Blasphemous Act waits for a real reason (engine 10)
  (MK.DECK_BRAINS = MK.DECK_BRAINS || {})["goblin-storm"] = {
    plan: outletPlan,
    choose: outletChoose,
    castOk: (g, p, card) => (card.def.name === "Blasphemous Act" && !legacy(g) ? blasphemousOk(g, p) : undefined)
  };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.GSTORM_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.GSTORM_DECK);
})(typeof window !== "undefined" ? window : globalThis);
