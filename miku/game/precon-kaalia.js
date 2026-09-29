/* Kaalia of the Vast: a Bracket 2 bot deck built like the retail "Heavenly Inferno" precon
   (Commander 2011). Mardu Angels, Demons and Dragons. Kaalia attacks and puts one of them from
   her hand onto the battlefield tapped and attacking, so a seven-drop can join the fight on turn
   five. Around that: removal (Path to Exile, Terminate, Mortify, Comet Storm...), three board
   wipes (Earthquake, Wrath of God, Austere Command), a few ways to give Kaalia haste (Anger,
   Lightning Greaves, Boros Guildmage), the Commander 2014 lieutenants that love a commander on
   the battlefield, two drain spells, and slow mana: karoos, gain lands, Signets and 19 basics.
   How it wins: big fliers. Kaalia sneaks one in on each attack; the others are cast the fair way,
   and Exsanguinate or Debt to the Deathless finishes a long game.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   The `ai` hints keep it a casual deck: cast Kaalia early, give her haste when there is something
   to put in, attack with her when no flier can eat her (or when the payoff is huge), keep the
   Angels, Demons and Dragons in hand before combat while she can bring them in for free, use
   removal on real threats, wipes only when the table is well ahead, and flash Angel of the Dire
   Hour in when an attack would hurt. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const KAALIA = "Kaalia of the Vast";
  const cost = s => MK.parseCost(s);

  /* ================================================================ helpers */
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));
  const fightOf = (g, a, b) => (AIX().fight ? AIX().fight(g, a, b) : { aDies: g.power(b) >= g.lethalDamageLeft(a), bDies: g.power(a) >= g.lethalDamageLeft(b) });
  const trig = spec => Object.assign({ trigger: true }, spec);
  const maxBy = (list, f) => { let best = null, bs = -Infinity; for (const x of list) { const s = f(x); if (s > bs) { bs = s; best = x; } } return best; };
  const manaNow = (g, p) => g.maxX(p, cost(""), 1);
  const isLandCard = c => c.def.types.includes("Land");
  const landCount = (g, p) => g.controlled(p, o => g.isLand(o)).length;
  const landsOfType = (g, p, t) => g.controlled(p, o => g.isLand(o) && o.def.subtypes.includes(t)).length;
  const oppCreatures = (g, p) => g.battlefield.filter(c => c.controller !== p && g.isCreature(c));
  const isADDDef = d => d.types.includes("Creature") && (!!d.changeling || ["Angel", "Demon", "Dragon"].some(t => d.subtypes.includes(t)));
  const isADDCard = c => isADDDef(c.def);
  const kaaliaOf = (g, p) => g.controlled(p, o => o.def.name === KAALIA)[0] || null;
  /* The end step of the player just before us: mana left open is wasted otherwise. */
  const beforeMyTurn = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;
  const myMain = (g, p, ctx) => g.active === p && (ctx.window === "main1" || ctx.window === "main2");
  const castAct = (ctx, o) => (ctx.actions || []).find(a => a.type === "cast" && a.card === o) || null;
  /* Kaalia can be cast from the command zone right now: sweepers wait for her in main phase 1. */
  const kaaliaCastable = ctx => (ctx.actions || []).some(a => a.type === "cast" && a.card.def.name === KAALIA && a.card.zone === "command");
  /* How many times we could pay one mana of a color right now. */
  function colorUnits(g, p, color, cap) {
    let n = 0;
    while (n < cap && g.canPay(p, cost(`{${color}}`.repeat(n + 1)))) n++;
    return n;
  }
  /* Mana to keep for the best spell still in hand (so a pump doesn't eat the second main phase). */
  function reserveFor(g, p, avail) {
    const mvs = p.hand.filter(c => !isLandCard(c) && c.def.mv <= avail).map(c => c.def.mv);
    return mvs.length ? Math.max(...mvs) : 0;
  }
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, { p, cards: [src.def.name] });
    return got;
  }
  /* Net value of damaging creatures: what dies on the other side minus what dies on ours. */
  function damageSweep(g, p, n, skip) {
    let s = 0;
    for (const c of g.creatures()) {
      if (skip && skip(c)) continue;
      if (g.kw(c, "indestructible") || g.lethalDamageLeft(c) > n) continue;
      s += (c.controller === p ? -1.3 : 1) * valueOf(g, c);
    }
    return s;
  }
  /* Harm target for "destroy": the biggest threat that can actually die. */
  function destroyTarget(g, p, req) {
    if (req.purpose !== "harm") return undefined;
    const opts = req.options.filter(o => !g.isPlayer(o) && o.controller !== p && !g.kw(o, "indestructible"));
    return opts.length ? maxBy(opts, o => threatOf(g, o, p)) : undefined;
  }

  /* ================================================================ Kaalia */
  /* Blockers of q that would kill an attacking Kaalia. */
  function kaaliaKillers(g, k, q) {
    return g.creatures(q).filter(b => !b.tapped && g.canBlock(b, k) && fightOf(g, k, b).aDies);
  }
  /* The best opposing permanent for Angel of Despair: a flier about to eat Kaalia, else the biggest threat. */
  function despairTarget(g, p, options) {
    const opp = (options || g.battlefield.filter(o => g.canTarget(p, o))).filter(o => !g.isPlayer(o) && o.controller !== p && !g.kw(o, "indestructible"));
    const k = kaaliaOf(g, p);
    if (k && k.combat && k.combat.attacking) {
      const killers = kaaliaKillers(g, k, g.defenderOf(k.combat.attacking)).filter(b => opp.includes(b));
      if (killers.length) return maxBy(killers, b => threatOf(g, b, p));
    }
    return maxBy(opp, o => threatOf(g, o, p));
  }
  /* Nonblack, nonartifact creatures Reiver Demon would kill: theirs minus ours. */
  function reiverSwing(g, p, self) {
    let s = 0;
    for (const c of g.creatures()) {
      if (c === self || g.colorsOf(c).has("B") || g.isArtifact(c) || g.kw(c, "indestructible")) continue;
      s += (c.controller === p ? -1 : 1) * valueOf(g, c);
    }
    return s;
  }
  /* Creatures of q that could block a flier. */
  const skyBlockers = (g, q) => g.creatures(q).filter(b => !b.tapped && (g.kw(b, "flying") || g.kw(b, "reach")));
  /* How much Kaalia wants to put a card in: big, flying, and the enters abilities that matter.
     q is the player Kaalia attacks, when known. */
  function putScore(g, p, c, q) {
    const d = c.def;
    const pw = d.pt ? d.pt[0] : 0, th = d.pt ? d.pt[1] : 0;
    let s = d.mv * 0.8 + pw * 0.7 + th * 0.2;
    if (d.keywords.includes("flying")) s += 1.5;
    if (d.keywords.includes("trample")) s += 0.5;
    switch (d.name) {
      case "Balefire Dragon": {
        // on an unblocked hit it deals 6 damage to each of that player's creatures
        const foes = q ? [q] : g.opponents(p);
        const best = Math.max(0, ...foes.filter(x => !skyBlockers(g, x).length).map(x => g.creatures(x).filter(o => !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= 6).reduce((a, o) => a + valueOf(g, o), 0)));
        s += Math.min(8, best * 0.25);
        break;
      }
      case "Archangel of Strife": if (strifeRisk(g, p) > 0) s -= 4; break;
      case "Angel of Despair": { const t = despairTarget(g, p, null); s += t ? Math.min(6, threatOf(g, t, p) * 0.6) : -1; break; }
      case "Malfegor": {
        const n = p.hand.filter(x => x !== c).length;
        const kills = g.opponents(p).reduce((a, q) => a + Math.min(n, g.creatures(q).length), 0);
        s += kills * 1.2 - n * 2.5;
        break;
      }
      case "Bladewing the Risen": if (p.graveyard.some(x => g.isPermanentCard(x) && x.def.subtypes.includes("Dragon"))) s += 3; break;
      case "Reiver Demon": if (landCount(g, p) >= 7 && reiverSwing(g, p, null) >= 6) s -= 6; break;
      case "Dread Cacodemon": if (landCount(g, p) >= 9 && oppCreatures(g, p).length >= 3) s -= 6; break;
      case "Lightkeeper of Emeria": s -= 1; break;
      // with the mana to flash it in, it is worth more in hand as a way to stop an attack
      case "Angel of the Dire Hour": if (landCount(g, p) >= 7) s -= 3; break;
      default: break;
    }
    return s;
  }
  /* Whom Kaalia should attack this combat, or null when the attack isn't worth it.
     Safe: no untapped flier or reach creature of that player would kill her (Angel of Despair in
     hand can remove one). Risky: still worth it for a six-drop or bigger while she is cheap to recast. */
  function attackPlan(g, p, k) {
    const adds = p.hand.filter(isADDCard);
    if (!adds.length) return null;
    const opps = g.opponents(p);
    if (!opps.length) return null;
    const despair = adds.some(c => c.def.name === "Angel of Despair");
    const rated = opps.map(q => ({ q, n: kaaliaKillers(g, k, q).length }));
    const first = list => list.slice().sort((a, b) => (a.n - b.n) || (a.q.life - b.q.life))[0].q;
    const safe = rated.filter(r => r.n === 0 || (despair && r.n === 1));
    if (safe.length) return first(safe);
    const best = maxBy(adds, c => c.def.mv);
    const tax = 2 * (p.cmdCasts[k.id] || 0);
    if (best.def.mv >= 6 && tax <= 4) return first(rated);
    return null;
  }
  /* Kaalia can attack this turn (her controller's main phase or combat). */
  function kaaliaReady(g, p) {
    const k = kaaliaOf(g, p);
    if (!k || g.active !== p || k.tapped || (k.sick && !g.kw(k, "haste")) || g.ch(k).cantAttack) return null;
    return k;
  }
  /* Angels, Demons and Dragons wait in hand before combat while Kaalia can put them in for free. */
  function holdForKaalia(g, p) {
    if (g.phase !== "main1") return false;
    const k = kaaliaReady(g, p);
    return !!k && !!attackPlan(g, p, k);
  }
  /* The bot seat's hidden hand on the attack: at the beginning of its combat, decide whether Kaalia
     attacks and whom (the engine's "attacks that player this turn if able"). Nothing is queued. */
  function kaaliaCombatHook(g, s, ev) {
    const p = s.controller;
    if (ev.p !== p) return;
    if (s.state.mustAttack) delete s.state.mustAttack;
    if (!p.agent || !p.agent.bot || !g.canAttack(s, p)) return;
    const q = attackPlan(g, p, s);
    if (q) s.state.mustAttack = q;
  }
  async function kaaliaAttacks(g, s, ev, { p }) {
    const q = ev.target;
    if (!g.combat || !q || q.lost) return;
    const options = p.hand.filter(isADDCard);
    if (!options.length) return;
    const pick = await g.ask(p, { type: "target", prompt: `Kaalia of the Vast: put an Angel, Demon, or Dragon from your hand onto the battlefield tapped and attacking ${q.name}`, options, optional: true, purpose: "kaaliaPut", src: s, defender: q });
    if (!pick || !options.includes(pick) || pick.zone !== "hand" || !g.combat || q.lost) return;
    g.log(`${p.name} puts ${pick.def.name} onto the battlefield tapped and attacking ${q.name} (Kaalia of the Vast).`, { p, cards: [pick.def.name], kind: "big" });
    g.putOntoBattlefield([pick], p, { tapped: true, attacking: q });
  }

  /* ---------------------------------------------------------------- deck plan (runs from Kaalia) */
  const KAROOS = new Set(["Boros Garrison", "Orzhov Basilica", "Rakdos Carnarium"]);
  /* A karoo with no other land bounces itself, and Rupture Spire dies without {1} to pay. */
  function landPlan(g, p, ctx) {
    const lands = (ctx.actions || []).filter(a => a.type === "land");
    if (!lands.length) return null;
    const have = landCount(g, p);
    const spare = manaNow(g, p);
    const bad = a => (KAROOS.has(a.card.def.name) && have === 0) || (a.card.def.name === "Rupture Spire" && spare < 1);
    if (!lands.some(bad)) return null;
    const good = lands.filter(a => !bad(a));
    if (!good.length) return { type: "pass", maxTries: 6 };
    const wantUntapped = p.hand.some(c => c.def.name === "Sol Ring" || c.def.name === "Soul Snare");
    const pick = maxBy(good, a => {
      const d = a.card.def;
      let s = 0;
      if (d.etbTapped === true) s += wantUntapped ? -2 : 2;
      if (d.name === "Evolving Wilds" || d.name === "Terramorphic Expanse") s += 1;
      if (d.name === "Command Tower") s += 1.5;
      return s;
    });
    return { type: "land", card: pick.card };
  }
  /* Main phase 1: give a summoning-sick Kaalia haste when she has something to put in. */
  function hastePlan(g, p, ctx) {
    const k = kaaliaOf(g, p);
    if (!k || k.tapped || !k.sick || g.kw(k, "haste") || !attackPlan(g, p, k)) return null;
    for (const a of ctx.actions || []) {
      if (a.type !== "activate" || !a.ab || a.ab.label !== "Equip") continue;
      const eq = a.card;
      if (eq.attachedTo === k || eq.def.name !== "Lightning Greaves") continue;
      const opts = g.targetOptions(p, a.ab.targets[0], eq);
      const pickFn = eq.def.ai && eq.def.ai.equipTarget;
      if (opts.includes(k) && pickFn && pickFn(g, p, opts) === k) return { type: "activate", card: eq, idx: a.idx };
    }
    const gm = (ctx.actions || []).find(a => a.type === "activate" && a.card.def.name === "Boros Guildmage" && a.ab && a.ab.label === "Haste");
    return gm ? { type: "activate", card: gm.card, idx: gm.idx } : null;
  }
  /* Kaalia is the engine: keep Lightning Greaves on her once she is out. */
  function protectPlan(g, p, ctx) {
    const k = kaaliaOf(g, p);
    if (!k || g.kw(k, "shroud") || g.kw(k, "hexproof")) return null;
    for (const a of ctx.actions || []) {
      if (a.type !== "activate" || !a.ab || a.ab.label !== "Equip") continue;
      const eq = a.card;
      if (eq.attachedTo === k || eq.def.name !== "Lightning Greaves") continue;
      const opts = g.targetOptions(p, a.ab.targets[0], eq);
      const pickFn = eq.def.ai && eq.def.ai.equipTarget;
      // the equip target is asked for later: only go when that choice lands on Kaalia
      if (opts.includes(k) && pickFn && pickFn(g, p, opts) === k) return { type: "activate", card: eq, idx: a.idx };
    }
    return null;
  }
  /* Main phase 1 with Kaalia ready to attack: Angels, Demons and Dragons defined in other files carry
     no `hold` hint, so go to combat rather than hard-cast one (Kaalia puts it in for free). Other
     spells wait for the second main phase. */
  function holdForeignPlan(g, p, ctx) {
    if (ctx.window !== "main1" || !holdForKaalia(g, p)) return null;
    const acts = ctx.actions || [];
    if (acts.some(a => a.type === "land")) return null;
    const foreign = acts.some(a => a.type === "cast" && isADDCard(a.card) && !(a.card.def.ai && a.card.def.ai.hold));
    return foreign ? { type: "pass", maxTries: 3 } : null;
  }
  function kaaliaPlan(g, p, o, ctx) {
    if (!myMain(g, p, ctx)) return null;
    const land = landPlan(g, p, ctx);
    if (land) return land;
    if (ctx.window === "main1") return hastePlan(g, p, ctx) || protectPlan(g, p, ctx) || holdForeignPlan(g, p, ctx);
    return protectPlan(g, p, ctx);
  }

  D({
    name: KAALIA, cost: "{1}{R}{W}{B}", type: "Legendary Creature — Human Cleric", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever Kaalia of the Vast attacks an opponent, you may put an Angel, Demon, or Dragon creature card from your hand onto the battlefield tapped and attacking that opponent.",
    triggers: [
      { on: "attacks", self: true, when: (g, s, ev) => g.isPlayer(ev.target) && ev.target !== s.controller, do: kaaliaAttacks },
      // bot hint, not a card ability: decides the attack, queues nothing
      { on: "beginCombat", when: (g, s, ev) => { kaaliaCombatHook(g, s, ev); return false; }, do: () => {} }
    ],
    ai: {
      priority: 9, plan: kaaliaPlan,
      target: (g, p, req) => (req.purpose === "kaaliaPut" ? maxBy(req.options, c => putScore(g, p, c, req.defender)) || undefined : undefined)
    }
  });

  /* ================================================================ creatures */
  const addAI = extra => Object.assign({ hold: holdForKaalia }, extra || {});

  D({
    name: "Boros Guildmage", cost: "{R/W}{R/W}", type: "Creature — Human Wizard", pt: "2/2",
    text: "{1}{R}: Target creature gains haste until end of turn.\n{1}{W}: Target creature gains first strike until end of turn.",
    abilities: [
      {
        label: "Haste", cost: "{1}{R}",
        targets: [{ kind: "creature", purpose: "haste", prompt: "Boros Guildmage: target creature gains haste" }],
        do: (g, s, ctx) => {
          const t = ctx.targets[0];
          if (!t || !ctx.legal[0]) return;
          g.grant(t, ["haste"]);
          g.log(`${t.def.name} gains haste until end of turn.`, { p: ctx.p, cards: [t.def.name] });
        },
        ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !!hasteTarget(g, p) }
      },
      {
        label: "First strike", cost: "{1}{W}",
        targets: [{ kind: "creature", purpose: "firstStrike", prompt: "Boros Guildmage: target creature gains first strike" }],
        do: (g, s, ctx) => {
          const t = ctx.targets[0];
          if (!t || !ctx.legal[0]) return;
          g.grant(t, ["first strike"]);
          g.log(`${t.def.name} gains first strike until end of turn.`, { p: ctx.p, cards: [t.def.name] });
        },
        ai: { use: (g, p, o, ctx) => ctx.window === "combat" && !!firstStrikeTarget(g, p) }
      }
    ],
    ai: {
      priority: 5,
      target: (g, p, req) => {
        if (req.purpose === "haste") return hasteTarget(g, p) || undefined;
        if (req.purpose === "firstStrike") return firstStrikeTarget(g, p) || undefined;
        return undefined;
      }
    }
  });
  /* A summoning-sick creature worth giving haste: Kaalia with something to put in, else a big one. */
  function hasteTarget(g, p) {
    const sick = g.creatures(p).filter(c => c.sick && !g.kw(c, "haste") && !c.tapped && !g.kw(c, "defender") && g.canTarget(p, c));
    const k = sick.find(c => c.def.name === KAALIA);
    if (k && attackPlan(g, p, k)) return k;
    return maxBy(sick.filter(c => c.def.name !== KAALIA && g.power(c) >= 4), c => g.power(c));
  }
  /* A creature of ours in a one-on-one fight that first strike turns from a trade into a win. */
  function firstStrikeTarget(g, p) {
    if (!g.combat) return null;
    for (const c of g.creatures(p)) {
      if (!c.combat || g.kw(c, "first strike") || g.kw(c, "double strike") || !g.canTarget(p, c)) continue;
      const foes = c.combat.attacking ? c.combat.blockedBy : c.combat.blocking ? [c.combat.blocking] : [];
      if (foes.length !== 1) continue;
      const e = foes[0];
      if (e.zone !== "battlefield" || g.kw(e, "first strike") || g.kw(e, "double strike")) continue;
      const f = fightOf(g, c, e);
      if (f.aDies && f.bDies) return c;
    }
    return null;
  }

  const HM_ARTIFACT = trig({ kind: "artifact", purpose: "harm", optional: true, prompt: "Duergar Hedge-Mage: you may destroy target artifact" });
  const HM_ENCHANT = trig({ kind: "enchantment", purpose: "harm", optional: true, prompt: "Duergar Hedge-Mage: you may destroy target enchantment" });
  const twoMountains = (g, s) => landsOfType(g, s.controller, "Mountain") >= 2;
  const twoPlains = (g, s) => landsOfType(g, s.controller, "Plains") >= 2;
  D({
    name: "Duergar Hedge-Mage", cost: "{2}{R/W}", type: "Creature — Dwarf Shaman", pt: "2/2",
    text: "When Duergar Hedge-Mage enters, if you control two or more Mountains, you may destroy target artifact.\nWhen Duergar Hedge-Mage enters, if you control two or more Plains, you may destroy target enchantment.",
    triggers: [
      {
        on: "enters", self: true, when: twoMountains, intervening: twoMountains,
        do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, HM_ARTIFACT, s); if (t && t.zone === "battlefield") g.destroy(t, s); }
      },
      {
        on: "enters", self: true, when: twoPlains, intervening: twoPlains,
        do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, HM_ENCHANT, s); if (t && t.zone === "battlefield") g.destroy(t, s); }
      }
    ],
    ai: { priority: 5 }
  });

  /* Anger's graveyard ability: one effect for the whole game, live while its owner has Anger in the
     graveyard and a Mountain on the battlefield. Hooks on Anger install it (they queue nothing). */
  function angerPlayers(g) {
    if (g._kaaliaAngerV === g.v && g._kaaliaAngerSet) return g._kaaliaAngerSet;
    const set = new Set();
    for (const q of g.players) {
      if (q.lost || !q.graveyard.some(c => c.def.name === "Anger")) continue;
      if (g.battlefield.some(o => o.controller === q && o.def.subtypes.includes("Mountain") && g.isLand(o))) set.add(q);
    }
    g._kaaliaAngerV = g.v; g._kaaliaAngerSet = set;
    return set;
  }
  function angerOn(g) {
    if (!g._kaaliaAngerFx) {
      g._kaaliaAngerFx = true;
      g.addEffect({ until: "game", kw: ["haste"], filter: (g2, o) => g2.isCreature(o) && angerPlayers(g2).has(o.controller) });
    }
    return false;
  }
  D({
    name: "Anger", cost: "{3}{R}", type: "Creature — Incarnation", pt: "2/2",
    keywords: ["haste"],
    text: "Haste\nAs long as Anger is in your graveyard and you control a Mountain, creatures you control have haste.",
    triggers: [
      { on: "dies", self: true, when: angerOn, do: () => {} },
      { on: "discard", zone: "graveyard", self: true, when: angerOn, do: () => {} },
      { on: "upkeep", zone: "graveyard", when: angerOn, do: () => {} },
      { on: "beginCombat", zone: "graveyard", when: angerOn, do: () => {} },
      { on: "enters", zone: "graveyard", when: angerOn, do: () => {} }
    ],
    ai: { priority: 4 }
  });

  /* Firebreathing in combat: pump an unblocked attacker with red mana we won't need later, or with
     everything when it finishes the player. */
  function breathUse(cap) {
    return (g, p, o, ctx) => {
      if (ctx.window !== "combat" || !g.combat || g.combat.attacker !== p) return false;
      if (!o.combat || !o.combat.attacking || o.combat.wasBlocked) return false;
      const red = colorUnits(g, p, "R", 12);
      if (!red) return false;
      const q = o.combat.attacking;
      let n = Math.min(red, Math.max(0, manaNow(g, p) - reserveFor(g, p, manaNow(g, p))));
      if (g.isPlayer(q)) {
        const through = g.combat.attackers.filter(a => a.controller === p && a.combat && !a.combat.wasBlocked && a.combat.attacking === q).reduce((s, a) => s + Math.max(0, g.power(a)), 0);
        if (through < q.life && through + red >= q.life) n = red;
      }
      n = Math.min(n, cap(g, o));
      return n > 0 ? { repeat: n } : false;
    };
  }
  D({
    name: "Dragon Whelp", cost: "{2}{R}{R}", type: "Creature — Dragon", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\n{R}: Dragon Whelp gets +1/+0 until end of turn. If this ability has been activated four or more times this turn, sacrifice Dragon Whelp at the beginning of the next end step.",
    abilities: [{
      label: "+1/+0", cost: "{R}",
      do: (g, s, ctx) => {
        if (s.zone !== "battlefield") return;
        g.pump(s, 1, 0);
        if (s.state.whelpTurn !== g.turn) { s.state.whelpTurn = g.turn; s.state.whelpUses = 0; }
        s.state.whelpUses++;
        if (s.state.whelpUses === 4) {
          const zc = s.zc;
          g.log("Dragon Whelp will be sacrificed at the beginning of the next end step.", { p: ctx.p, cards: [s.def.name] });
          g.delayed.push({ at: "endStep", once: true, controller: ctx.p, do: g2 => { if (s.zone === "battlefield" && s.zc === zc) g2.sacrifice(s); } });
        }
      },
      ai: { use: breathUse((g, o) => (o.state.whelpTurn === g.turn ? Math.max(0, 3 - (o.state.whelpUses || 0)) : 3)) }
    }],
    ai: addAI({ priority: 5 })
  });
  D({
    name: "Furnace Whelp", cost: "{2}{R}{R}", type: "Creature — Dragon", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\n{R}: Furnace Whelp gets +1/+0 until end of turn.",
    abilities: [{ label: "+1/+0", cost: "{R}", do: (g, s) => { if (s.zone === "battlefield") g.pump(s, 1, 0); }, ai: { use: breathUse(() => 20) } }],
    ai: addAI({ priority: 5 })
  });
  D({
    name: "Shivan Dragon", cost: "{4}{R}{R}", type: "Creature — Dragon", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\n{R}: Shivan Dragon gets +1/+0 until end of turn.",
    abilities: [{ label: "+1/+0", cost: "{R}", do: (g, s) => { if (s.zone === "battlefield") g.pump(s, 1, 0); }, ai: { use: breathUse(() => 20) } }],
    ai: addAI({ priority: 7 })
  });

  D({
    name: "Lightkeeper of Emeria", cost: "{3}{W}", type: "Creature — Angel", pt: "2/4",
    keywords: ["flying"],
    text: "Multikicker {W} (You may pay an additional {W} any number of times as you cast this spell.)\nFlying\nWhen Lightkeeper of Emeria enters, you gain 2 life for each time it was kicked.",
    note: "The multikicker is paid right after the spell is cast.",
    onCast: async (g, p, o, item) => {
      let max = 0;
      while (max < 10 && g.canPay(p, cost("{W}".repeat(max + 1)))) max++;
      if (!max) return;
      const options = [];
      for (let k = 0; k <= max; k++) options.push({ id: k, label: k ? `Pay {W} ${k} time${k > 1 ? "s" : ""}` : "Don't kick it" });
      const k = await g.ask(p, { type: "option", prompt: "Lightkeeper of Emeria: multikicker {W}", options, purpose: "multikicker", src: o });
      const n = Math.max(0, Math.min(max, k | 0));
      if (n && g.pay(p, cost("{W}".repeat(n)))) {
        item.kicks = n;
        g.log(`${p.name} kicks Lightkeeper of Emeria ${n} time${n > 1 ? "s" : ""}.`, { p, cards: [o.def.name] });
      }
    },
    onResolve: (g, p, o, item) => { o.state.kicks = item.kicks || 0; },
    triggers: [{ on: "enters", self: true, intervening: (g, s) => (s.state.kicks || 0) > 0, do: (g, s, ev, { p }) => g.gainLife(p, 2 * s.state.kicks, s) }],
    ai: addAI({ priority: 4, option: (g, p, req) => (req.purpose === "multikicker" ? Math.min(req.options[req.options.length - 1].id, 2) : undefined) })
  });

  D({ name: "Serra Angel", cost: "{3}{W}{W}", type: "Creature — Angel", pt: "4/4", keywords: ["flying", "vigilance"], text: "Flying\nVigilance", ai: addAI({ priority: 6 }) });
  D({ name: "Seraph of Dawn", cost: "{2}{W}{W}", type: "Creature — Angel", pt: "2/4", keywords: ["flying", "lifelink"], text: "Flying\nLifelink", ai: addAI({ priority: 6 }) });
  D({ name: "Archangel", cost: "{5}{W}{W}", type: "Creature — Angel", pt: "5/5", keywords: ["flying", "vigilance"], text: "Flying, vigilance", ai: addAI({ priority: 6 }) });

  const ANGEL3 = MK.tokenDef({ key: "kaalia-angel-w3", name: "Angel", pt: [3, 3], colors: "W", subtypes: ["Angel"], keywords: ["flying"] });
  const oppMoreLife = (g, s) => g.opponents(s.controller).some(q => q.life > s.controller.life);
  const oppMoreCreatures = (g, s) => g.opponents(s.controller).some(q => g.creatures(q).length > g.creatures(s.controller).length);
  D({
    name: "Linvala, the Preserver", cost: "{4}{W}{W}", type: "Legendary Creature — Angel", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Linvala, the Preserver enters, if an opponent has more life than you, you gain 5 life.\nWhen Linvala enters, if an opponent controls more creatures than you, create a 3/3 white Angel creature token with flying.",
    triggers: [
      { on: "enters", self: true, when: oppMoreLife, intervening: oppMoreLife, do: (g, s, ev, { p }) => g.gainLife(p, 5, s) },
      { on: "enters", self: true, when: oppMoreCreatures, intervening: oppMoreCreatures, do: (g, s, ev, { p }) => g.createToken(p, ANGEL3) }
    ],
    ai: addAI({ priority: 7 })
  });

  D({
    name: "Shattered Angel", cost: "{3}{W}{W}", type: "Creature — Angel", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever a land enters under an opponent's control, you may gain 3 life.",
    note: "The life is always gained.",
    triggers: [{ on: "enters", when: (g, s, ev) => g.isLand(ev.o) && ev.o.controller !== s.controller, do: (g, s, ev, { p }) => g.gainLife(p, 3, s) }],
    ai: addAI({ priority: 6 })
  });

  D({
    name: "Malfegor", cost: "{2}{B}{B}{R}{R}", type: "Legendary Creature — Demon Dragon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhen Malfegor enters, discard your hand. Each opponent sacrifices a creature of their choice for each card discarded this way.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const cards = p.hand.slice();
        for (const c of cards) g.discard(p, c);
        const n = cards.length;
        if (!n) { g.log(`${p.name} has no cards to discard (Malfegor).`, { p, cards: [s.def.name] }); return; }
        for (const q of g.opponents(p)) {
          for (let i = 0; i < n; i++) {
            const cs = g.creatures(q);
            if (!cs.length) break;
            const pick = await g.ask(q, { type: "target", prompt: `Malfegor: sacrifice a creature (${n - i} to go)`, options: cs, purpose: "sacrifice", src: s });
            g.sacrifice(cs.includes(pick) ? pick : cs[0]);
          }
        }
      }
    }],
    ai: {
      priority: 6,
      // hard-cast only when the discard costs little or the sacrifices are worth it
      cast: (g, p, o) => {
        if (holdForKaalia(g, p)) return false;
        const n = p.hand.filter(c => c !== o).length;
        if (n <= 1) return undefined;
        const kills = g.opponents(p).reduce((a, q) => a + Math.min(n, g.creatures(q).length), 0);
        return kills >= n * 2 ? undefined : false;
      }
    }
  });

  /* Join forces: each player may pay mana; the bots other than the Dragon's controller never do. */
  async function joinForces(g, s, ev, { p }) {
    let total = 0;
    for (const q of g.orderFrom(p)) {
      if (s.zone !== "battlefield") return;
      const max = manaNow(g, q);
      if (max <= 0) continue;
      const n = await g.ask(q, { type: "number", prompt: q === p ? "Join forces: pay any amount of mana to pump your Mana-Charged Dragon" : `Join forces: pay any amount of mana to give ${p.name}'s Mana-Charged Dragon +1/+0 for each`, min: 0, max, purpose: "x", src: s });
      const k = Math.max(0, Math.min(max, n | 0));
      if (k > 0 && g.pay(q, cost(`{${k}}`))) { total += k; g.log(`${q.name} pays ${k} mana (join forces).`, { p: q, cards: [s.def.name] }); }
    }
    if (total > 0 && s.zone === "battlefield") { g.pump(s, total, 0); g.log(`Mana-Charged Dragon gets +${total}/+0 until end of turn.`, { p, cards: [s.def.name] }); }
  }
  D({
    name: "Mana-Charged Dragon", cost: "{4}{R}{R}", type: "Creature — Dragon", pt: "5/5",
    keywords: ["flying", "trample"],
    text: "Flying, trample\nJoin forces — Whenever Mana-Charged Dragon attacks or blocks, each player starting with you may pay any amount of mana. Mana-Charged Dragon gets +X/+0 until end of turn, where X is the total amount of mana paid this way.",
    triggers: [{ on: "attacks", self: true, do: joinForces }, { on: "blocks", self: true, do: joinForces }],
    ai: addAI({
      priority: 7,
      x: (g, p, o, xMax) => {
        if (!o || o.controller !== p) return 0;
        if (g.active !== p) return xMax;
        return Math.max(0, xMax - reserveFor(g, p, xMax));
      }
    })
  });

  /* Oros: 3 damage to each nonwhite creature, worth {2}{W} when it kills more of theirs than ours. */
  const orosSwing = (g, p) => damageSweep(g, p, 3, c => g.colorsOf(c).has("W"));
  D({
    name: "Oros, the Avenger", cost: "{3}{R}{W}{B}", type: "Legendary Creature — Dragon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhenever Oros, the Avenger deals combat damage to a player, you may pay {2}{W}. If you do, Oros deals 3 damage to each nonwhite creature.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const c = cost("{2}{W}");
        if (!g.canPay(p, c)) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Oros, the Avenger: pay {2}{W} to deal 3 damage to each nonwhite creature?", purpose: "oros", src: s });
        if (!ok || !g.pay(p, c)) return;
        g.log(`Oros, the Avenger deals 3 damage to each nonwhite creature.`, { p, cards: [s.def.name], kind: "big" });
        for (const t of g.creatures().filter(x => !g.colorsOf(x).has("W"))) g.damage(s, t, 3);
      }
    }],
    ai: addAI({ priority: 7, confirm: (g, p, req) => (req.purpose === "oros" ? orosSwing(g, p) >= 4 : true) })
  });

  D({
    name: "Angel of Despair", cost: "{3}{W}{W}{B}{B}", type: "Creature — Angel", pt: "5/5",
    keywords: ["flying"],
    text: "Flying\nWhen Angel of Despair enters, destroy target permanent.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "permanent", purpose: "harm", prompt: "Angel of Despair: destroy target permanent" }), s);
        if (t && t.zone === "battlefield") g.destroy(t, s);
      }
    }],
    ai: addAI({ priority: 8, target: (g, p, req) => (req.purpose === "harm" ? despairTarget(g, p, req.options) || undefined : undefined) })
  });

  /* How much war would help the table more than us: opponents' creatures minus ours. */
  function strifeRisk(g, p) {
    const theirs = oppCreatures(g, p).length;
    return theirs - 2 * (g.creatures(p).length + 1);
  }
  function strifeChoice(g, q, src) {
    if (!src || src.controller === q) return "war";
    const mine = g.creatures(q).reduce((s, c) => s + Math.max(0, g.power(c)), 0);
    const theirs = g.creatures(src.controller).reduce((s, c) => s + Math.max(0, g.power(c)), 0);
    return mine >= theirs ? "war" : "peace";
  }
  const strifeOf = (s, pl) => (s.state.strife ? s.state.strife[pl.id] : null);
  D({
    name: "Archangel of Strife", cost: "{5}{W}{W}", type: "Creature — Angel", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nAs Archangel of Strife enters, each player chooses war or peace.\nCreatures controlled by players who chose war get +3/+0.\nCreatures controlled by players who chose peace get +0/+3.",
    note: "Each player chooses right after it enters.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const choices = {};
        for (const q of g.orderFrom(p)) {
          const a = await g.ask(q, { type: "option", prompt: "Archangel of Strife: choose war or peace", options: [{ id: "war", label: "War: your creatures get +3/+0" }, { id: "peace", label: "Peace: your creatures get +0/+3" }], purpose: "strife", src: s });
          choices[q.id] = a === "peace" ? "peace" : "war";
          g.log(`${q.name} chooses ${choices[q.id]}.`, { p: q, cards: [s.def.name] });
        }
        if (s.zone === "battlefield") { s.state.strife = choices; g.bump(); }
      }
    }],
    statics: [
      { applies: (g, s, o) => g.isCreature(o) && strifeOf(s, o.controller) === "war", pt: [3, 0] },
      { applies: (g, s, o) => g.isCreature(o) && strifeOf(s, o.controller) === "peace", pt: [0, 3] }
    ],
    ai: addAI({
      priority: 7,
      // +3/+0 for a table of token armies is worse than no Angel at all
      cast: (g, p) => (strifeRisk(g, p) > 0 ? false : undefined),
      option: (g, p, req) => (req.purpose === "strife" ? strifeChoice(g, p, req.src) : undefined)
    })
  });

  /* Tariel: the opponent whose graveyard has the best creature cards on average. */
  function tarielTarget(g, p) {
    let best = null, bs = 0;
    for (const q of g.opponents(p)) {
      if (g.playerHexproof(q)) continue;
      const cs = q.graveyard.filter(c => c.def.types.includes("Creature"));
      if (!cs.length) continue;
      const avg = cs.reduce((s, c) => s + c.def.mv, 0) / cs.length;
      if (avg > bs) { bs = avg; best = q; }
    }
    return best;
  }
  D({
    name: "Tariel, Reckoner of Souls", cost: "{4}{R}{W}{B}", type: "Legendary Creature — Angel", pt: "4/7",
    keywords: ["flying", "vigilance"],
    text: "Flying, vigilance\n{T}: Choose a creature card at random from target opponent's graveyard. Put that card onto the battlefield under your control.",
    abilities: [{
      label: "Take a creature card", tap: true,
      targets: [{ kind: "opponent", purpose: "tariel", prompt: "Tariel, Reckoner of Souls: choose an opponent's graveyard" }],
      do: (g, s, ctx) => {
        const q = ctx.targets[0];
        if (!q || !ctx.legal[0]) return;
        const cs = q.graveyard.filter(c => c.def.types.includes("Creature"));
        if (!cs.length) { g.log(`${q.name} has no creature card in their graveyard.`, { p: ctx.p, cards: [s.def.name] }); return; }
        const pick = cs[g.rand(cs.length)];
        g.log(`${ctx.p.name} puts ${pick.def.name} from ${q.name}'s graveyard onto the battlefield (Tariel, Reckoner of Souls).`, { p: ctx.p, cards: [pick.def.name], kind: "big" });
        g.putOntoBattlefield([pick], ctx.p);
      },
      ai: { use: (g, p, o, ctx) => beforeMyTurn(g, p, ctx) && !!tarielTarget(g, p) }
    }],
    ai: addAI({ priority: 7, target: (g, p, req) => (req.purpose === "tariel" ? tarielTarget(g, p) || undefined : undefined) })
  });

  /* "If you cast it from your hand": a card cast from exile carries `playable`, a free cast `free`. */
  const castFromHand = {
    onCast: (g, p, o, item) => { item.fromHand = !o.playable && !item.free; },
    onResolve: (g, p, o, item) => { o.state.castFromHand = !!item.fromHand; }
  };
  D(Object.assign({
    name: "Reiver Demon", cost: "{4}{B}{B}{B}{B}", type: "Creature — Demon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhen Reiver Demon enters, if you cast it from your hand, destroy all nonartifact, nonblack creatures. They can't be regenerated.",
    note: "There is no regeneration in this game, so the last sentence changes nothing.",
    triggers: [{
      on: "enters", self: true, intervening: (g, s) => !!s.state.castFromHand,
      do: (g, s, ev, { p }) => {
        const n = g.destroyAll(g.creatures().filter(c => !g.isArtifact(c) && !g.colorsOf(c).has("B")), s);
        g.log(`Reiver Demon destroys ${n} creature${n === 1 ? "" : "s"}.`, { p, cards: [s.def.name], kind: "big" });
      }
    }],
    ai: addAI({
      priority: 7,
      cast: (g, p, o) => {
        const swing = reiverSwing(g, p, o);
        if (swing >= 8) return 30;
        if (swing <= -6) return false;
        return holdForKaalia(g, p) ? false : undefined;
      }
    })
  }, castFromHand));
  D(Object.assign({
    name: "Dread Cacodemon", cost: "{7}{B}{B}{B}", type: "Creature — Demon", pt: "8/8",
    text: "When Dread Cacodemon enters, if you cast it from your hand, destroy all creatures your opponents control, then tap all other creatures you control.",
    triggers: [{
      on: "enters", self: true, intervening: (g, s) => !!s.state.castFromHand,
      do: (g, s, ev, { p }) => {
        const n = g.destroyAll(g.creatures().filter(c => c.controller !== p), s);
        g.log(`Dread Cacodemon destroys ${n} creature${n === 1 ? "" : "s"}.`, { p, cards: [s.def.name], kind: "big" });
        for (const c of g.creatures(p)) if (c !== s) g.tap(c);
      }
    }],
    ai: addAI({
      priority: 7,
      cast: (g, p) => {
        const theirs = oppCreatures(g, p).reduce((s, c) => s + valueOf(g, c), 0);
        if (theirs >= 8) return 30;
        return holdForKaalia(g, p) ? false : undefined;
      }
    })
  }, castFromHand));

  D({
    name: "Firemane Avenger", cost: "{2}{R}{W}", type: "Creature — Angel", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nBattalion — Whenever Firemane Avenger and at least two other creatures attack, Firemane Avenger deals 3 damage to any target and you gain 3 life.",
    triggers: [{
      on: "attacks", self: true,
      when: (g, s) => !!g.combat && g.combat.attackers.filter(a => a !== s && a.controller === s.controller && a.combat && a.combat.declared).length >= 2,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: 3, prompt: "Firemane Avenger: 3 damage to any target" }), s);
        if (t) g.damage(s, t, 3);
        g.gainLife(p, 3, s);
      }
    }],
    ai: addAI({ priority: 6 })
  });

  /* ---------------------------------------------------------------- lieutenants (Commander 2014) */
  /* "As long as you control your commander". */
  const commanderOut = (g, p) => g.battlefield.some(o => o.isCommander && o.owner === p && o.controller === p);
  /* The same, looking back in time for a "dies" trigger: the commander may have died in the same event. */
  function commanderLKI(g, p, ev) {
    if (commanderOut(g, p)) return true;
    const was = b => !!b && !!b.o && b.o.isCommander && b.o.owner === p && (!b.lki || b.lki.controller === p);
    return was(ev) || (ev.batch || []).some(was);
  }
  D({
    name: "Angelic Field Marshal", cost: "{2}{W}{W}", type: "Creature — Angel", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nLieutenant — As long as you control your commander, Angelic Field Marshal gets +2/+2 and creatures you control have vigilance.",
    statics: [
      { applies: (g, s, o) => o === s && commanderOut(g, s.controller), pt: [2, 2] },
      { applies: (g, s, o) => g.isCreature(o) && o.controller === s.controller && commanderOut(g, s.controller), kw: ["vigilance"] }
    ],
    ai: addAI({ priority: 7 })
  });

  /* Tyrant's Familiar: a blocker that would eat Kaalia, else the best creature 7 damage kills. */
  function familiarTarget(g, p, options) {
    const opp = options.filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o));
    const k = kaaliaOf(g, p);
    if (k && k.combat && k.combat.attacking) {
      const killers = kaaliaKillers(g, k, g.defenderOf(k.combat.attacking)).filter(b => opp.includes(b) && !g.kw(b, "indestructible") && g.lethalDamageLeft(b) <= 7);
      if (killers.length) return maxBy(killers, b => threatOf(g, b, p));
    }
    const dies = opp.filter(o => !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= 7);
    return maxBy(dies.length ? dies : opp, o => threatOf(g, o, p));
  }
  D({
    name: "Tyrant's Familiar", cost: "{5}{R}{R}", type: "Creature — Dragon", pt: "5/5",
    keywords: ["flying", "haste"],
    text: "Flying, haste\nLieutenant — As long as you control your commander, Tyrant's Familiar gets +2/+2 and has \"Whenever Tyrant's Familiar attacks, it deals 7 damage to target creature defending player controls.\"",
    statics: [{ applies: (g, s, o) => o === s && commanderOut(g, s.controller), pt: [2, 2] }],
    triggers: [{
      on: "attacks", self: true, when: (g, s) => commanderOut(g, s.controller),
      do: async (g, s, ev, { p }) => {
        const q = ev.target ? g.defenderOf(ev.target) : null;
        if (!q || !g.isPlayer(q) || !g.creatures(q).length) return;
        const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "familiar", amount: 7, prompt: "Tyrant's Familiar: 7 damage to target creature defending player controls", filter: (g2, o) => o.controller === q }), s);
        if (t && t.zone === "battlefield") g.damage(s, t, 7);
      }
    }],
    // it has haste, so cast it before combat rather than wait for Kaalia
    ai: { priority: 7, hold: () => false, target: (g, p, req) => (req.purpose === "familiar" ? familiarTarget(g, p, req.options) || undefined : undefined) }
  });

  D({
    name: "Demon of Wailing Agonies", cost: "{3}{B}{B}", type: "Creature — Demon", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nLieutenant — As long as you control your commander, Demon of Wailing Agonies gets +2/+2 and has \"Whenever a nontoken creature you control dies, each opponent sacrifices a creature of their choice.\"",
    statics: [{ applies: (g, s, o) => o === s && commanderOut(g, s.controller), pt: [2, 2] }],
    triggers: [{
      on: "dies", when: (g, s, ev) => ev.p === s.controller && !!ev.o && !ev.o.isToken && commanderLKI(g, s.controller, ev),
      do: async (g, s, ev, { p }) => {
        for (const q of g.opponents(p)) {
          const cs = g.creatures(q);
          if (!cs.length) continue;
          const pick = await g.ask(q, { type: "target", prompt: "Demon of Wailing Agonies: sacrifice a creature", options: cs, purpose: "sacrifice", src: s });
          g.sacrifice(cs.includes(pick) ? pick : cs[0]);
        }
      }
    }],
    ai: addAI({ priority: 7 })
  });

  /* Angel of the Dire Hour: flash it in when an attack would hurt, exiling the whole army. */
  function direHourPlan(g, p, o, ctx) {
    if (!castAct(ctx, o)) return null;
    if (ctx.window === "combat" && g.combat && g.combat.attacker !== p && g.active !== p) {
      const atk = g.combat.attackers.filter(a => a.zone === "battlefield" && a.combat && a.combat.attacking && a.controller !== p);
      const atMe = atk.filter(a => g.defenderOf(a.combat.attacking) === p);
      const dmg = atMe.filter(a => !a.combat.wasBlocked).reduce((n, a) => n + Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1), 0);
      const worth = atk.reduce((n, a) => n + (a.isToken ? 0.5 : 1) * threatOf(g, a, p), 0);
      if ((atMe.length && (dmg >= p.life || dmg >= 8 || worth >= 16)) || worth >= 26) return { type: "cast", card: o };
      return null;
    }
    // mana nobody used by the last end step before our turn: a 5/4 flier ready to attack
    return beforeMyTurn(g, p, ctx) ? { type: "cast", card: o } : null;
  }
  D(Object.assign({
    name: "Angel of the Dire Hour", cost: "{5}{W}{W}", type: "Creature — Angel", pt: "5/4",
    keywords: ["flash", "flying"],
    text: "Flash\nFlying\nWhen Angel of the Dire Hour enters, if you cast it from your hand, exile all attacking creatures.",
    triggers: [{
      on: "enters", self: true, intervening: (g, s) => !!s.state.castFromHand,
      do: (g, s, ev, { p }) => {
        const list = g.creatures().filter(c => c.combat && c.combat.attacking);
        for (const c of list) g.exile(c, s);
        g.log(`Angel of the Dire Hour exiles ${list.length} attacking creature${list.length === 1 ? "" : "s"}.`, { p, cards: [s.def.name], kind: "big" });
      }
    }],
    ai: { never: true, plan: direHourPlan, priority: 7 }
  }, castFromHand));

  /* ================================================================ instants */
  D({
    name: "Mortify", cost: "{1}{W}{B}", type: "Instant",
    text: "Destroy target creature or enchantment.",
    spell: { targets: [{ kind: "creatureOrEnchantment", purpose: "harm", prompt: "Mortify: destroy target creature or enchantment" }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); } },
    ai: { removal: true, minThreat: 4, target: destroyTarget }
  });

  D({
    name: "Wrecking Ball", cost: "{2}{B}{R}", type: "Instant",
    text: "Destroy target creature or land.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Wrecking Ball: destroy target creature or land", filter: (g, o) => g.isCreature(o) || g.isLand(o) }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
    },
    ai: { removal: true, minThreat: 4, target: destroyTarget }
  });

  const ART_ENCH = { kind: "artifactOrEnchantment", purpose: "harm", prompt: "Destroy target artifact or enchantment" };
  const bestArtEnch = (g, p, options) => maxBy(options.filter(o => !g.isPlayer(o) && o.controller !== p), o => threatOf(g, o, p));
  function orimCreature(g, p, options, n) {
    const kill = options.filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o) && !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= n);
    return maxBy(kill, o => threatOf(g, o, p));
  }
  D({
    name: "Orim's Thunder", cost: "{2}{W}", type: "Instant",
    text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nDestroy target artifact or enchantment. If this spell was kicked, it deals damage equal to that permanent's mana value to target creature.",
    note: "The creature is chosen right after the spell is cast.",
    kicker: "{R}",
    spell: {
      targets: [Object.assign({}, ART_ENCH, { prompt: "Orim's Thunder: destroy target artifact or enchantment" })],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0];
        const mv = g.mvOf(t);
        g.destroy(t, ctx.o);
        const c = ctx.item.second;
        if (ctx.kicked && c && mv > 0 && g.legalTarget(ctx.p, { kind: "creature" }, c, ctx.o)) g.damage(ctx.o, c, mv);
      }
    },
    onCast: async (g, p, o, item) => {
      if (!item.kicked || !item.targets[0]) return;
      const n = g.mvOf(item.targets[0]);
      const t = await g.chooseTarget(p, { kind: "creature", purpose: "orimCreature", amount: n, prompt: `Orim's Thunder: ${n} damage to target creature` }, o);
      if (t) { item.second = t; g.log(`Orim's Thunder will also deal ${n} damage to ${t.def.name}.`, { p, cards: [o.def.name] }); }
    },
    ai: {
      removal: true, minThreat: 4,
      confirm: (g, p, req) => {
        if (req.purpose !== "kicker") return true;
        const t = bestArtEnch(g, p, g.targetOptions(p, ART_ENCH, req.src));
        return !!t && !!orimCreature(g, p, g.battlefield.filter(o => g.canTarget(p, o)), g.mvOf(t));
      },
      target: (g, p, req) => {
        if (req.purpose === "harm") return bestArtEnch(g, p, req.options) || undefined;
        if (req.purpose === "orimCreature") return orimCreature(g, p, req.options, (req.spec && req.spec.amount) || 0) || undefined;
        return undefined;
      }
    }
  });

  D({
    name: "Congregate", cost: "{3}{W}", type: "Instant",
    text: "Target player gains 2 life for each creature on the battlefield.",
    spell: {
      targets: [{ kind: "player", purpose: "help", prompt: "Congregate: target player gains 2 life for each creature" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.gainLife(ctx.targets[0], 2 * g.creatures().length, ctx.o); }
    },
    ai: {
      never: true,
      plan: (g, p, o, ctx) => {
        if (!castAct(ctx, o)) return null;
        const gain = 2 * g.creatures().length;
        // after blocks: survive an attack that would kill us or take half our life
        if (ctx.window === "combat" && g.combat && g.combat.attacker !== p) {
          const dmg = g.combat.attackers.filter(a => a.combat && !a.combat.wasBlocked && !g.kw(a, "infect") && g.defenderOf(a.combat.attacking) === p)
            .reduce((n, a) => n + Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1), 0);
          return (dmg >= p.life && p.life + gain > dmg) || (dmg * 2 >= p.life && gain >= 10) ? { type: "cast", card: o, targets: [p] } : null;
        }
        const lowest = g.opponents(p).every(q => q.life >= p.life);
        // low on life: gain it before the mana goes to anything else
        if (ctx.window === "main1" && g.active === p && p.life <= 15 && gain >= 6) return { type: "cast", card: o, targets: [p] };
        if (!(beforeMyTurn(g, p, ctx) || (ctx.window === "main2" && g.active === p))) return null;
        return gain >= 10 || (lowest && gain >= 6) ? { type: "cast", card: o, targets: [p] } : null;
      }
    }
  });

  /* Comet Storm: finish a player, else kill the biggest threat X can kill, and kick for a second one. */
  const COMET = { kind: "any", purpose: "harm", prompt: "Comet Storm: choose a target" };
  const cometPlans = new WeakMap();
  function cometPlan(g, p, o) {
    const mana = g.maxX(p, g.spellCost(p, o, { x: 0 }), 1);
    if (mana < 1) return null;
    const opps = g.opponents(p).filter(q => !g.playerHexproof(q));
    const reach = opps.filter(q => q.life <= mana).sort((a, b) => a.life - b.life);
    if (reach.length) {
      const x = reach[0].life;
      const extra = [];
      let left = mana - x;
      for (const q of reach.slice(1)) if (q.life <= x && left >= 1) { extra.push(q); left--; }
      return { x, target: reach[0], extra, lethal: true };
    }
    const cands = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible"))
      .map(c => ({ c, need: g.lethalDamageLeft(c), t: threatOf(g, c, p) }))
      .filter(e => e.need <= mana && e.t >= 6)
      .sort((a, b) => b.t - a.t);
    if (!cands.length) return null;
    const x = cands[0].need;
    const extra = [];
    for (const e of cands.slice(1)) if (e.need <= x && mana - x > extra.length && extra.length < 2) extra.push(e.c);
    return { x, target: cands[0].c, extra, lethal: false };
  }
  D({
    name: "Comet Storm", cost: "{X}{R}{R}", type: "Instant",
    text: "Multikicker {1} (You may pay an additional {1} any number of times as you cast this spell.)\nChoose any target, then choose another target for each time this spell was kicked. Comet Storm deals X damage to each of them.",
    note: "The multikicker is paid, and the other targets chosen, right after the spell is cast. If the first target is gone when it resolves, the spell does nothing.",
    spell: {
      targets: [COMET],
      do: (g, ctx) => {
        const x = ctx.x;
        if (x <= 0) return;
        const list = [];
        if (ctx.legal[0] && ctx.targets[0]) list.push(ctx.targets[0]);
        for (const t of ctx.item.extra || []) if (g.legalTarget(ctx.p, COMET, t, ctx.o)) list.push(t);
        for (const t of list) g.damage(ctx.o, t, x);
      }
    },
    onCast: async (g, p, o, item) => {
      const first = item.targets[0];
      const others = () => g.targetOptions(p, COMET, o).filter(t => t !== first && !(item.extra || []).includes(t));
      let max = 0;
      const n0 = others().length;
      while (max < n0 && max < 8 && g.canPay(p, cost(`{${max + 1}}`))) max++;
      if (!max) return;
      const options = [];
      for (let k = 0; k <= max; k++) options.push({ id: k, label: k ? `Pay {1} ${k} time${k > 1 ? "s" : ""}` : "Don't kick it" });
      const k = await g.ask(p, { type: "option", prompt: "Comet Storm: multikicker {1}, one more target each time", options, purpose: "multikicker", src: o });
      const n = Math.max(0, Math.min(max, k | 0));
      if (!n || !g.pay(p, cost(`{${n}}`))) return;
      item.extra = [];
      for (let i = 0; i < n; i++) {
        const opts = others();
        if (!opts.length) break;
        const t = await g.ask(p, { type: "target", prompt: `Comet Storm: choose another target (${i + 1} of ${n})`, options: opts, purpose: "cometExtra", src: o, spec: Object.assign({ amount: item.x }, COMET) });
        if (t && opts.includes(t)) item.extra.push(t);
      }
      g.log(`${p.name} kicks Comet Storm ${n} time${n > 1 ? "s" : ""}${item.extra.length ? ", adding " + item.extra.map(t => g.nameOf(t)).join(" and ") : ""}.`, { p, cards: [o.def.name] });
    },
    ai: {
      never: true,
      plan: (g, p, o, ctx) => {
        if (!castAct(ctx, o)) return null;
        const plan = cometPlan(g, p, o);
        if (!plan) return null;
        if (!plan.lethal && !beforeMyTurn(g, p, ctx) && !(ctx.window === "main2" && g.active === p)) return null;
        cometPlans.set(o, plan);
        return { type: "cast", card: o, x: plan.x, targets: [plan.target] };
      },
      option: (g, p, req) => {
        if (req.purpose !== "multikicker") return undefined;
        const plan = cometPlans.get(req.src);
        return plan ? Math.min(plan.extra.length, req.options[req.options.length - 1].id) : 0;
      },
      target: (g, p, req) => {
        const plan = cometPlans.get(req.src);
        if (!plan) return undefined;
        if (req.purpose === "harm" && req.options.includes(plan.target)) return plan.target;
        if (req.purpose === "cometExtra") return plan.extra.find(t => req.options.includes(t)) || undefined;
        return undefined;
      }
    }
  });

  /* ================================================================ sorceries */
  function quakePlan(g, p, xMax) {
    let best = null;
    const opps = g.opponents(p);
    for (let x = 1; x <= xMax; x++) {
      if (p.life <= x) break;
      let s;
      if (opps.every(q => q.life <= x)) s = 1000;
      else {
        s = damageSweep(g, p, x, c => g.kw(c, "flying")) + opps.filter(q => q.life <= x).length * 12 + x * 0.3 * (opps.length - 1);
        if (p.life - x < 10) s -= 6;
      }
      if (!best || s > best.s) best = { x, s };
    }
    return best && best.s >= 9 ? best : null;
  }
  D({
    name: "Earthquake", cost: "{X}{R}", type: "Sorcery",
    text: "Earthquake deals X damage to each creature without flying and each player.",
    spell: {
      do: (g, ctx) => {
        const x = ctx.x;
        if (x <= 0) return;
        const players = g.living();
        for (const c of g.creatures().filter(c => !g.kw(c, "flying"))) g.damage(ctx.o, c, x);
        for (const q of players) g.damage(ctx.o, q, x);
      }
    },
    ai: {
      never: true,
      plan: (g, p, o, ctx) => {
        const act = castAct(ctx, o);
        if (!act || !myMain(g, p, ctx)) return null;
        const q = quakePlan(g, p, act.xMax);
        if (q && q.s < 1000 && ctx.window === "main1" && kaaliaCastable(ctx)) return null;
        return q ? { type: "cast", card: o, x: q.x } : null;
      }
    }
  });

  /* Diabolic Tutor: a land when short, an Angel, Demon or Dragon for Kaalia, else the best card. */
  function tutorPick(g, p) {
    const lib = p.library;
    if (landCount(g, p) + p.hand.filter(isLandCard).length < 4) {
      const l = lib.filter(isLandCard);
      if (l.length) return maxBy(l, c => (c.def.name === "Command Tower" ? 3 : 0) + (c.def.etbTapped === true ? 0 : 1));
    }
    if (!p.hand.some(isADDCard)) {
      const adds = lib.filter(isADDCard);
      if (adds.length) return maxBy(adds, c => putScore(g, p, c));
    }
    return null;
  }
  D({
    name: "Diabolic Tutor", cost: "{2}{B}{B}", type: "Sorcery",
    text: "Search your library for a card, put that card into your hand, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const want = p.agent && p.agent.bot ? tutorPick(g, p) : null;
        await g.search(p, { filter: (g2, c) => !want || c === want, count: 1, to: "hand", hidden: true, purpose: "tutor", prompt: "Diabolic Tutor: search for a card", src: ctx.o });
      }
    },
    ai: { tutor: true, priority: 5 }
  });

  D({
    name: "Syphon Mind", cost: "{3}{B}", type: "Sorcery",
    text: "Each other player discards a card. You draw a card for each card discarded this way.",
    spell: {
      do: async (g, ctx) => {
        let n = 0;
        for (const q of g.orderFrom(ctx.p).slice(1)) {
          if (!q.hand.length) continue;
          const pick = await g.ask(q, { type: "cards", prompt: "Syphon Mind: discard a card", options: q.hand.slice(), min: 1, max: 1, purpose: "discard", src: ctx.o });
          const c = pick && pick[0] && q.hand.includes(pick[0]) ? pick[0] : q.hand[q.hand.length - 1];
          g.discard(q, c);
          n++;
        }
        if (n) drawLog(g, ctx.p, n, ctx.o);
      }
    },
    ai: { draw: true, priority: 6, cast: (g, p) => (g.opponents(p).filter(q => q.hand.length).length >= Math.min(2, g.opponents(p).length) ? undefined : false) }
  });

  D({
    name: "Syphon Flesh", cost: "{4}{B}", type: "Sorcery",
    text: "Each other player sacrifices a creature of their choice. You create a 2/2 black Zombie creature token for each creature sacrificed this way.",
    spell: {
      do: async (g, ctx) => {
        let n = 0;
        for (const q of g.orderFrom(ctx.p).slice(1)) {
          const cs = g.creatures(q);
          if (!cs.length) continue;
          const pick = await g.ask(q, { type: "target", prompt: "Syphon Flesh: sacrifice a creature", options: cs, purpose: "sacrifice", src: ctx.o });
          if (g.sacrifice(cs.includes(pick) ? pick : cs[0])) n++;
        }
        if (n) g.createToken(ctx.p, T.zombie, { count: n });
      }
    },
    ai: { priority: 6, cast: (g, p) => (g.opponents(p).filter(q => g.creatures(q).length).length >= Math.min(2, g.opponents(p).length) ? undefined : false) }
  });

  D({
    name: "Wrath of God", cost: "{2}{W}{W}", type: "Sorcery",
    text: "Destroy all creatures. They can't be regenerated.",
    note: "There is no regeneration in this game, so the second sentence changes nothing.",
    spell: {
      do: (g, ctx) => {
        const n = g.destroyAll(g.creatures(), ctx.o);
        g.log(`Wrath of God destroys ${n} creature${n === 1 ? "" : "s"}.`, { p: ctx.p, cards: ["Wrath of God"], kind: "big" });
      }
    },
    // not in the turn we put a big creature onto the battlefield (cast it before combat instead)
    ai: { wipe: true, priority: 5, cast: (g, p) => (g.creatures(p).some(c => c.sick && valueOf(g, c) >= 6) ? false : undefined) }
  });

  /* Austere Command: the two modes that hurt the table most and us least (usually small creatures
     and enchantments: tokens and anthems go, the Angels, Demons and Dragons stay). */
  const AUSTERE = [
    { id: "artifacts", label: "Destroy all artifacts", hit: (g, o) => g.isArtifact(o) },
    { id: "enchantments", label: "Destroy all enchantments", hit: (g, o) => g.isEnchantment(o) },
    { id: "small", label: "Destroy all creatures with mana value 3 or less", hit: (g, o) => g.isCreature(o) && g.mvOf(o) <= 3 },
    { id: "big", label: "Destroy all creatures with mana value 4 or greater", hit: (g, o) => g.isCreature(o) && g.mvOf(o) >= 4 }
  ];
  function austereValue(g, p, ids) {
    let s = 0;
    for (const o of g.battlefield) {
      if (g.kw(o, "indestructible") || !AUSTERE.some(m => ids.includes(m.id) && m.hit(g, o))) continue;
      s += o.controller === p ? -1.3 * valueOf(g, o) : threatOf(g, o, p);
    }
    return s;
  }
  function austerePick(g, p) {
    let best = null;
    for (let i = 0; i < AUSTERE.length; i++) for (let j = i + 1; j < AUSTERE.length; j++) {
      const ids = [AUSTERE[i].id, AUSTERE[j].id];
      const s = austereValue(g, p, ids);
      if (!best || s > best.s) best = { ids, s };
    }
    return best;
  }
  D({
    name: "Austere Command", cost: "{4}{W}{W}", type: "Sorcery",
    text: "Choose two —\n• Destroy all artifacts.\n• Destroy all enchantments.\n• Destroy all creatures with mana value 3 or less.\n• Destroy all creatures with mana value 4 or greater.",
    note: "The two modes are chosen right after the spell is cast.",
    onCast: async (g, p, o, item) => {
      const chosen = [];
      for (let k = 0; k < 2; k++) {
        const options = AUSTERE.filter(m => !chosen.includes(m.id)).map(m => ({ id: m.id, label: m.label }));
        const a = await g.ask(p, { type: "option", prompt: `Austere Command: choose the ${k ? "second" : "first"} mode`, options, purpose: "austere", src: o });
        chosen.push(options.some(x => x.id === a) ? a : options[0].id);
      }
      item.austere = chosen;
      g.log(`Austere Command: ${chosen.map(id => AUSTERE.find(m => m.id === id).label.toLowerCase()).join(", and ")}.`, { p, cards: [o.def.name] });
    },
    spell: {
      do: (g, ctx) => {
        const ids = ctx.item.austere || [];
        const n = g.destroyAll(g.battlefield.filter(o => AUSTERE.some(m => ids.includes(m.id) && m.hit(g, o))), ctx.o);
        g.log(`Austere Command destroys ${n} permanent${n === 1 ? "" : "s"}.`, { p: ctx.p, cards: ["Austere Command"], kind: "big" });
      }
    },
    ai: {
      wipe: true, priority: 6,
      cast: (g, p) => { const b = austerePick(g, p); return b && b.s >= 12 ? 26 : false; },
      option: (g, p, req) => {
        if (req.purpose !== "austere") return undefined;
        const b = austerePick(g, p);
        const ids = req.options.map(x => x.id);
        return (b && b.ids.find(id => ids.includes(id))) || ids[0];
      }
    }
  });

  const oppMoreLifeP = (g, p) => g.opponents(p).some(q => q.life > p.life);
  const oppMoreCreaturesP = (g, p) => g.opponents(p).some(q => g.creatures(q).length > g.creatures(p).length);
  D({
    name: "Timely Reinforcements", cost: "{2}{W}", type: "Sorcery",
    text: "If you have less life than an opponent, you gain 6 life. If you control fewer creatures than an opponent, create three 1/1 white Soldier creature tokens.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        const life = oppMoreLifeP(g, p), bodies = oppMoreCreaturesP(g, p);
        if (life) g.gainLife(p, 6, ctx.o);
        if (bodies) g.createToken(p, T.soldier, { count: 3 });
        if (!life && !bodies) g.log("Timely Reinforcements does nothing.", { p, cards: [ctx.o.def.name] });
      }
    },
    ai: {
      priority: 7,
      cast: (g, p) => {
        if (!oppMoreLifeP(g, p) && !oppMoreCreaturesP(g, p)) return false;
        // under pressure it comes before rocks and the rest
        return p.life <= 25 && g.opponents(p).every(q => q.life >= p.life) ? 30 : undefined;
      }
    }
  });

  /* Drain spells: X as big as the mana allows, when it kills someone or the swing is worth a turn. */
  function drainPlan(perX, minLoss) {
    return (g, p, o, ctx) => {
      const act = castAct(ctx, o);
      if (!act || !myMain(g, p, ctx) || !act.xMax) return null;
      const opps = g.opponents(p);
      const loss = act.xMax * perX;
      if (opps.some(q => q.life <= loss)) return { type: "cast", card: o, x: act.xMax };
      if (ctx.window !== "main2") return null;
      return loss >= minLoss || (p.life <= 15 && loss * opps.length >= 6) ? { type: "cast", card: o, x: act.xMax } : null;
    };
  }
  function drainAll(g, ctx, n) {
    if (n <= 0) return;
    let lost = 0;
    for (const q of g.opponents(ctx.p)) lost += g.loseLife(q, n, ctx.o);
    if (lost) g.gainLife(ctx.p, lost, ctx.o);
  }
  D({
    name: "Exsanguinate", cost: "{X}{B}{B}", type: "Sorcery",
    text: "Each opponent loses X life. You gain life equal to the life lost this way.",
    spell: { do: (g, ctx) => drainAll(g, ctx, ctx.x) },
    ai: { never: true, plan: drainPlan(1, 4) }
  });
  D({
    name: "Debt to the Deathless", cost: "{X}{W}{W}{B}{B}", type: "Sorcery",
    text: "Each opponent loses two times X life. You gain life equal to the life lost this way.",
    spell: { do: (g, ctx) => drainAll(g, ctx, 2 * ctx.x) },
    ai: { never: true, plan: drainPlan(2, 4) }
  });

  D({
    name: "Night's Whisper", cost: "{1}{B}", type: "Sorcery",
    text: "You draw two cards and you lose 2 life.",
    spell: { do: (g, ctx) => { g.draw(ctx.p, 2); g.loseLife(ctx.p, 2, ctx.o); } },
    ai: { draw: true, priority: 6, hold: (g, p) => p.life <= 10 || p.library.length < 10 }
  });

  /* ================================================================ artifacts */
  D({ name: "Boros Signet", cost: "{2}", type: "Artifact", text: "{1}, {T}: Add {R}{W}.", mana: [{ tap: true, cost: "{1}", produce: "RW" }], ai: { ramp: true, priority: 8 } });
  D({ name: "Orzhov Signet", cost: "{2}", type: "Artifact", text: "{1}, {T}: Add {W}{B}.", mana: [{ tap: true, cost: "{1}", produce: "WB" }], ai: { ramp: true, priority: 8 } });
  D({ name: "Rakdos Signet", cost: "{2}", type: "Artifact", text: "{1}, {T}: Add {B}{R}.", mana: [{ tap: true, cost: "{1}", produce: "BR" }], ai: { ramp: true, priority: 8 } });
  const basicLand = (g, c) => g.isBasic(c) && isLandCard(c);
  D({
    name: "Armillary Sphere", cost: "{2}", type: "Artifact",
    text: "{2}, {T}, Sacrifice Armillary Sphere: Search your library for up to two basic land cards, reveal them, put them into your hand, then shuffle.",
    abilities: [{
      label: "Search for two basic lands", cost: "{2}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: basicLand, count: 2, to: "hand", purpose: "tutor", prompt: "Armillary Sphere: choose up to two basic land cards", src: s }),
      ai: { use: (g, p, o, ctx) => (beforeMyTurn(g, p, ctx) || (ctx.window === "main2" && g.active === p)) && p.hand.filter(isLandCard).length <= 1 && p.library.some(c => basicLand(g, c)) }
    }],
    ai: { ramp: true, priority: 6 }
  });

  D({
    name: "Commander's Sphere", cost: "{3}", type: "Artifact",
    text: "{T}: Add one mana of any color in your commander's color identity.\nSacrifice Commander's Sphere: Draw a card.",
    mana: [{ tap: true, produce: "any" }],
    abilities: [{
      label: "Sacrifice: draw a card", sacSelf: true,
      do: (g, s, ctx) => drawLog(g, ctx.p, 1, s),
      ai: { use: (g, p, o, ctx) => beforeMyTurn(g, p, ctx) && landCount(g, p) >= 8 && p.hand.length <= 1 && p.library.length > 5 }
    }],
    ai: { ramp: true, priority: 7 }
  });

  /* ================================================================ enchantments */
  D({
    name: "Soul Snare", cost: "{W}", type: "Enchantment",
    text: "{W}, Sacrifice Soul Snare: Exile target creature that's attacking you or a planeswalker you control.",
    abilities: [{
      label: "Exile an attacker", cost: "{W}", sacSelf: true,
      targets: [{ kind: "creature", purpose: "harm", prompt: "Soul Snare: exile target creature that's attacking you", filter: (g, o, p) => !!o.combat && !!o.combat.attacking && g.defenderOf(o.combat.attacking) === p }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) g.exile(t, s); },
      ai: {
        use: (g, p, o, ctx) => {
          if (ctx.window !== "combat" || !g.combat || g.combat.attacker === p) return false;
          const at = g.combat.attackers.filter(a => a.combat && g.defenderOf(a.combat.attacking) === p && g.canTarget(p, a));
          return at.some(a => g.power(a) >= 5 || threatOf(g, a, p) >= 9 || (a.isCommander && g.power(a) >= 3));
        }
      }
    }],
    ai: { priority: 3, target: (g, p, req) => (req.purpose === "harm" ? maxBy(req.options, o => g.power(o) + threatOf(g, o, p) * 0.3) || undefined : undefined) }
  });

  /* The Vows: on our own creatures only (Kaalia first). */
  const VOW_SPEC = { kind: "creature", you: true, purpose: "help", prompt: "Enchant a creature you control" };
  function vowTarget(g, p, req) {
    const opts = req.options.filter(o => !g.isPlayer(o) && o.controller === p);
    const k = opts.find(o => o.def.name === KAALIA);
    if (k) return k;
    return maxBy(opts, o => g.power(o) + (g.kw(o, "flying") ? 2 : 0) - (o.isToken ? 2 : 0)) || undefined;
  }
  const vow = (name, color, kw, kwText) => D({
    name, cost: `{2}{${color}}`, type: "Enchantment — Aura",
    text: `Enchant creature\nEnchanted creature gets +2/+2, has ${kwText}, and can't attack you or planeswalkers you control.`,
    note: "In this game it can only enchant a creature you control, so the last part never matters.",
    aura: true, enchant: "creature", targets: [VOW_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, VOW_SPEC, o).length > 0,
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [2, 2], kw: [kw] }],
    ai: { priority: 4, target: vowTarget }
  });
  vow("Vow of Duty", "W", "vigilance", "vigilance");
  vow("Vow of Lightning", "R", "first strike", "first strike");

  D({
    name: "Always Watching", cost: "{1}{W}{W}", type: "Enchantment",
    text: "Nontoken creatures you control get +1/+1 and have vigilance.",
    statics: [{ applies: (g, s, o) => g.isCreature(o) && o.controller === s.controller && !o.isToken, pt: [1, 1], kw: ["vigilance"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Righteous Cause", cost: "{3}{W}{W}", type: "Enchantment",
    text: "Whenever a creature attacks, you gain 1 life.",
    triggers: [{ on: "attacks", do: (g, s, ev, { p }) => g.gainLife(p, 1, s) }],
    ai: { priority: 6 }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const gainOnEnter = { on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 1, s) };
  const gainland = (name, a, b) => land(name, {
    text: `${name} enters tapped.\nWhen ${name} enters, you gain 1 life.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: true, triggers: [gainOnEnter], mana: [{ tap: true, produce: [a, b] }]
  });
  gainland("Akoum Refuge", "B", "R");
  gainland("Scoured Barrens", "W", "B");
  gainland("Wind-Scarred Crag", "R", "W");
  land("Kabira Crossroads", {
    text: "Kabira Crossroads enters tapped.\nWhen Kabira Crossroads enters, you gain 2 life.\n{T}: Add {W}.",
    etbTapped: true, triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 2, s) }], mana: [{ tap: true, produce: "W" }]
  });

  const karoo = (name, a, b) => land(name, {
    text: `${name} enters tapped.\nWhen ${name} enters, return a land you control to its owner's hand.\n{T}: Add {${a}}{${b}}.`,
    etbTapped: true,
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const lands = g.controlled(p, o => g.isLand(o));
        if (!lands.length) return;
        const pick = await g.ask(p, { type: "target", prompt: `${name}: return a land you control to its owner's hand`, options: lands, src: s, purpose: "bounceOwnLand" });
        const t = lands.includes(pick) ? pick : lands[0];
        if (t.zone === "battlefield") g.bounce(t);
      }
    }],
    mana: [{ tap: true, produce: a + b }]
  });
  karoo("Boros Garrison", "R", "W");
  karoo("Orzhov Basilica", "W", "B");
  karoo("Rakdos Carnarium", "B", "R");

  const fetcher = name => land(name, {
    text: `{T}, Sacrifice ${name}: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.`,
    abilities: [{
      label: "Search for a basic land", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: basicLand, count: 1, to: "battlefield", tapped: true, purpose: "tutor", prompt: `${name}: choose a basic land card`, src: s }),
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && ctx.window !== "combat" }
    }]
  });
  fetcher("Evolving Wilds");
  fetcher("Terramorphic Expanse");

  land("Rupture Spire", {
    text: "Rupture Spire enters tapped.\nWhen Rupture Spire enters, sacrifice it unless you pay {1}.\n{T}: Add one mana of any color.",
    etbTapped: true,
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const c = cost("{1}");
        if (g.canPay(p, c)) {
          const ok = await g.ask(p, { type: "confirm", prompt: "Rupture Spire: pay {1}? If you don't, it is sacrificed.", purpose: "ruptureSpire", src: s });
          if (ok && g.pay(p, c)) return;
        }
        if (s.zone === "battlefield") g.sacrifice(s);
      }
    }],
    mana: [{ tap: true, produce: "any5" }]
  });

  const vivid = (name, c) => land(name, {
    text: `${name} enters tapped with two charge counters on it.\n{T}: Add {${c}}.\n{T}, Remove a charge counter from ${name}: Add one mana of any color.`,
    etbTapped: true,
    etbCounters: () => ({ charge: 2 }),
    mana: [
      { tap: true, produce: c },
      { tap: true, produce: "any5", condition: (g, o) => (o.counters.charge || 0) > 0, after: (g, o) => g.removeCounters(o, "charge", 1) }
    ]
  });
  vivid("Vivid Meadow", "W");
  vivid("Vivid Marsh", "B");
  vivid("Vivid Crag", "R");

  const gate = (name, a, b) => land(name, { type: "Land — Gate", text: `${name} enters tapped.\n{T}: Add {${a}} or {${b}}.`, etbTapped: true, mana: [{ tap: true, produce: [a, b] }] });
  gate("Boros Guildgate", "R", "W");
  gate("Orzhov Guildgate", "W", "B");

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "kaalia", name: "Kaalia", title: KAALIA, commander: KAALIA,
    identity: ["R", "W", "B"], bracket: 2, precon: "Heavenly Inferno (Commander 2011)", aggression: 0.6,
    style: "Angel ambush",
    blurb: "Kaalia swings in the air and drops an Angel, Demon or Dragon from her hand straight into the attack, backed by a pile of removal and three board wipes.",
    watch: [KAALIA, "Utvara Hellkite", "Balefire Dragon", "Dread Cacodemon", "Exsanguinate"],
    list: (function () {
      const singles = [
        // creatures (30)
        "Boros Guildmage", "Duergar Hedge-Mage", "Anger", "Dragon Whelp", "Furnace Whelp", "Vampire Nighthawk",
        "Lightkeeper of Emeria", "Angelic Field Marshal", "Seraph of Dawn", "Firemane Avenger", "Balefire Dragon",
        "Scourge of Valkas", "Serra Angel", "Shattered Angel", "Demon of Wailing Agonies", "Malfegor",
        "Mana-Charged Dragon", "Shivan Dragon", "Linvala, the Preserver", "Oros, the Avenger", "Utvara Hellkite",
        "Angel of Despair", "Archangel of Strife", "Archangel", "Angel of the Dire Hour", "Tyrant's Familiar",
        "Tariel, Reckoner of Souls", "Bladewing the Risen", "Reiver Demon", "Dread Cacodemon",
        // instants (8)
        "Path to Exile", "Swords to Plowshares", "Terminate", "Mortify", "Orim's Thunder", "Wrecking Ball",
        "Comet Storm", "Congregate",
        // sorceries (10)
        "Night's Whisper", "Syphon Mind", "Diabolic Tutor", "Syphon Flesh", "Earthquake", "Wrath of God",
        "Austere Command", "Timely Reinforcements", "Exsanguinate", "Debt to the Deathless",
        // artifacts (9)
        "Sol Ring", "Arcane Signet", "Armillary Sphere", "Boros Signet", "Orzhov Signet", "Rakdos Signet",
        "Talisman of Indulgence", "Commander's Sphere", "Lightning Greaves",
        // enchantments (6)
        "Soul Snare", "Vow of Duty", "Vow of Lightning", "Always Watching", "Phyrexian Arena", "Righteous Cause",
        // lands (17 + 6 Plains, 7 Swamps, 6 Mountains = 36)
        "Command Tower", "Evolving Wilds", "Terramorphic Expanse", "Rupture Spire", "Nomad Outpost",
        "Boros Garrison", "Orzhov Basilica", "Rakdos Carnarium", "Akoum Refuge", "Scoured Barrens", "Wind-Scarred Crag",
        "Vivid Meadow", "Vivid Marsh", "Vivid Crag", "Boros Guildgate", "Orzhov Guildgate", "Kabira Crossroads"
      ];
      const list = singles.slice();
      for (let i = 0; i < 6; i++) list.push("Plains");
      for (let i = 0; i < 7; i++) list.push("Swamp");
      for (let i = 0; i < 6; i++) list.push("Mountain");
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
