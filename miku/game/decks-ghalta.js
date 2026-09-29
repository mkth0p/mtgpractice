/* Ghalta, Primal Hunger: a mono-green stompy bot deck (Bracket 4) for the Miku Commander engine.
   Mana elves and land ramp make Ghalta cheap, card-draw engines keep the hand full, green tutors
   find Craterhoof Behemoth or the right threat, and trample closes the game.
   Card text follows the Oracle text; where the engine simplifies a card, its `note` says how.
   Shared staples (Llanowar Elves, Craterhoof Behemoth, Sol Ring...) come from cards-miku.js, and
   every card here uses MK.defineOnce, so the first definition of a name wins. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};
  const GHALTA = "Ghalta, Primal Hunger";

  /* ================================================================ helpers */
  const mine = (s, o) => o.controller === s.controller;
  const myCreature = (g, s, o) => mine(s, o) && g.isCreature(o);
  const trig = spec => Object.assign({ trigger: true }, spec);
  const safe = (fn, d) => { try { return fn(); } catch (e) { return d; } };
  const maxBy = (list, f) => { let best = null, bs = -Infinity; for (const x of list) { const s = f(x); if (s > bs) { bs = s; best = x; } } return best; };
  const isCreatureCard = c => c.def.types.includes("Creature");
  const isLandCard = c => c.def.types.includes("Land");
  const isGreenCard = c => (c.def.colors || []).includes("G");
  /* Elf check from the card itself (safe to call while characteristics are being computed). */
  const isElf = o => (o.def.subtypes || []).includes("Elf") || !!o.def.changeling;
  const greatestPower = (g, p) => g.creatures(p).reduce((m, o) => Math.max(m, g.power(o)), 0);
  const totalPower = (g, p) => Math.max(0, g.creatures(p).reduce((s, o) => s + g.power(o), 0));
  const landsOf = (g, p) => g.controlled(p, o => g.isLand(o));
  const count = (g, p, name) => g.controlled(p, o => o.def.name === name).length;
  const forestCard = (g, c) => isLandCard(c) && c.def.subtypes.includes("Forest");
  const basicLandCard = (g, c) => g.isBasic(c) && isLandCard(c);
  const anyColors = p => (p.identity.length ? p.identity : MK.COLORS);
  const colorRun = (p, n) => anyColors(p).map(k => k.repeat(n));
  const controlsCommander = (g, p) => g.battlefield.some(o => o.isCommander && o.controller === p && p.commanders.includes(o));
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : 0);
  const valueOf = (g, o) => (AI().value ? AI().value(g, o) : 0);

  function fight(g, a, b) {
    const pa = Math.max(0, g.power(a)), pb = Math.max(0, g.power(b));
    if (pa) g.damage(a, b, pa);
    if (pb) g.damage(b, a, pb);
  }

  /* Search the library for one card. Asked as a "target" question so each tutor's ai.target picks
     for the bots; the table shows the cards to a human. to: "hand" | "top" | "battlefield". */
  async function tutor(g, p, src, o) {
    const pool = p.library.filter(c => o.filter(c));
    let pick = null;
    if (pool.length) pick = await g.ask(p, { type: "target", prompt: o.prompt, options: pool, optional: true, purpose: "tutor", src, dest: o.to });
    if (pick && !pool.includes(pick)) pick = null;
    g.shuffle(p);
    if (!pick) { g.log(`${p.name} searches and finds nothing.`, { p, kind: "search" }); return null; }
    if (o.to === "battlefield") {
      g.log(`${p.name} searches and puts ${pick.def.name} onto the battlefield.`, { p, cards: [pick.def.name], kind: "search" });
      g.putOntoBattlefield([pick], p, { tapped: !!o.tapped });
    } else if (o.to === "top") {
      g.removeFromZone(pick); pick.zone = "library"; p.library.unshift(pick); g.bump();
      g.log(`${p.name} reveals ${pick.def.name} and puts it on top of their library.`, { p, cards: [pick.def.name], kind: "search" });
    } else {
      g.moveTo(pick, "hand");
      g.log(`${p.name} reveals ${pick.def.name} and puts it into their hand.`, { p, cards: [pick.def.name], kind: "search" });
    }
    return pick;
  }

  /* "As an additional cost to cast this spell, sacrifice a creature": paid right after casting. */
  async function sacrificeAsCost(g, p, src, filter, prompt) {
    const opts = g.creatures(p).filter(filter);
    if (!opts.length) { g.log(`${p.name} has no creature to sacrifice for ${src.def.name}.`, { p }); return null; }
    let pick = await g.ask(p, { type: "target", prompt, options: opts, purpose: "sacrifice", src });
    if (!pick || !opts.includes(pick)) pick = opts[0];
    const info = { mv: g.mvOf(pick), name: pick.def.name };
    g.sacrifice(pick);
    return info;
  }

  /* Tokens this deck makes (keys are unique so other decks' tokens never collide). */
  const TOK = {
    plant: MK.tokenDef({ key: "ghalta-plant", name: "Plant", pt: [0, 1], colors: "G", subtypes: ["Plant"] }),
    insect: MK.tokenDef({ key: "ghalta-insect", name: "Insect", pt: [1, 1], colors: "G", subtypes: ["Insect"], keywords: ["flying", "deathtouch"] }),
    beast4: MK.tokenDef({ key: "ghalta-beast4", name: "Beast", pt: [4, 4], colors: "G", subtypes: ["Beast"] }),
    wurm: MK.tokenDef({ key: "ghalta-wurm6", name: "Wurm", pt: [6, 6], colors: "G", subtypes: ["Wurm"] }),
    clue: MK.tokenDef({
      key: "ghalta-clue", name: "Clue", types: ["Artifact"], subtypes: ["Clue"], colors: [],
      text: "{2}, Sacrifice this artifact: Draw a card.",
      abilities: [{
        label: "Draw a card", cost: "{2}", sacSelf: true,
        do: (g, s, ctx) => g.draw(ctx.p, 1),
        ai: { use: (g, p, o, ctx) => p.library.length > 10 && (ctx.window === "main2" || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p)) }
      }]
    })
  };

  /* ================================================================ bot brain
     Rules of thumb shared by the tutors, the commander's sequencing plan and the finishers. */
  function manaNow(g, p) { return g.maxX(p, MK.parseCost(""), 1); }
  /* Rough mana we make next turn: every mana ability, best option each, plus a land drop. */
  function manaPotential(g, p) {
    let n = 0;
    for (const o of g.controlled(p)) {
      const abs = g.manaAbilities(o);
      if (!abs.length) continue;
      let best = 0;
      for (const ab of abs) {
        if (ab.noAuto) continue;
        if (ab.condition && !safe(() => ab.condition(g, o), false)) continue;
        const prod = typeof ab.produce === "function" ? safe(() => ab.produce(g, o), "") : ab.produce;
        let u = 0;
        if (Array.isArray(prod)) u = prod.reduce((m, x) => Math.max(m, x.length), 0);
        else if (prod === "any" || prod === "any5") u = 1;
        else if (typeof prod === "string") u = prod.startsWith("choice:") ? 1 : prod.length;
        if (ab.cost) u -= MK.util.costMV(MK.parseCost(ab.cost));
        if (ab.sacSelf) u = Math.min(u, 0.5);
        best = Math.max(best, u);
      }
      n += best;
    }
    return n + (p.hand.some(isLandCard) ? 1 : 0);
  }
  function canAttackSoon(g, c) { return !g.kw(c, "defender") && !g.ch(c).cantAttack; }
  function readyAttackers(g, p) { return g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")) && canAttackSoon(g, c)); }
  /* Creatures still able to attack after paying `cost` mana this main phase (mana creatures tap last). */
  function attackersAfterPaying(g, p, cost, exclude) {
    let list = readyAttackers(g, p).filter(c => !(exclude || []).includes(c));
    const creatureIds = g.creatures(p).map(c => c.id);
    const other = g.maxX(p, MK.parseCost(""), 1, { exclude: creatureIds });
    let short = Math.max(0, cost - other);
    if (short > 0) {
      const dorks = list.filter(c => g.manaAbilities(c).length).sort((a, b) => g.power(a) - g.power(b));
      for (const d of dorks) { if (short <= 0) break; list = list.filter(x => x !== d); short--; }
    }
    return list;
  }
  /* Damage that gets through q's untapped creatures if they block to soak as much as they can. */
  function throughDamage(g, q, atk) {
    const blockers = g.creatures(q).filter(b => !b.tapped && !g.ch(b).cantBlock).map(b => Math.max(1, g.lethalDamageLeft(b))).sort((a, b) => b - a);
    const list = atk.map(a => ({ pow: Math.max(0, a.pow), trample: a.trample, used: false }));
    let total = list.reduce((s, a) => s + a.pow, 0);
    for (const t of blockers) {
      let best = null, bv = 0;
      for (const a of list) {
        if (a.used) continue;
        const v = a.trample ? Math.min(a.pow, t) : a.pow;
        if (v > bv) { bv = v; best = a; }
      }
      if (!best) break;
      best.used = true; total -= bv;
    }
    return total;
  }
  function killsSomeone(g, p, atk, infect) {
    if (!atk.length) return false;
    return g.opponents(p).some(q => infect ? q.poison + throughDamage(g, q, atk) >= 10 : throughDamage(g, q, atk) >= q.life);
  }
  /* Would Craterhoof win a fight now ("now": it enters this main phase before combat) or next turn? */
  function hoofLethal(g, p, when, opts) {
    opts = opts || {};
    const list = when === "now" ? attackersAfterPaying(g, p, opts.cost || 0, opts.exclude) : g.creatures(p).filter(c => canAttackSoon(g, c) && !(opts.exclude || []).includes(c));
    const n = g.creatures(p).length + 1 - (opts.exclude ? opts.exclude.length : 0);
    const atk = list.map(c => ({ pow: g.power(c) + n, trample: true }));
    atk.push({ pow: 5 + n, trample: true });
    return killsSomeone(g, p, atk);
  }
  /* A pump card in hand that wins this combat if cast now. */
  function finisherLethal(g, p, card, cost) {
    const name = card.def.name;
    if (name === "Craterhoof Behemoth") return hoofLethal(g, p, "now", { cost });
    const ready = attackersAfterPaying(g, p, cost);
    if (name === "Overwhelming Stampede") { const x = greatestPower(g, p); return killsSomeone(g, p, ready.map(c => ({ pow: g.power(c) + x, trample: true }))); }
    if (name === "Triumph of the Hordes") return killsSomeone(g, p, ready.map(c => ({ pow: g.power(c) + 1, trample: true })), true);
    if (name === "End-Raze Forerunners") { const atk = ready.map(c => ({ pow: g.power(c) + 2, trample: true })); atk.push({ pow: 7, trample: true }); return killsSomeone(g, p, atk); }
    return false;
  }
  function underPressure(g, p) {
    const most = Math.max(0, ...g.opponents(p).map(q => g.creatures(q).reduce((s, c) => s + Math.max(0, g.power(c)), 0)));
    return most >= p.life * 0.5;
  }
  function koglaVictim(g, p, pw, options) {
    const list = (options || g.battlefield).filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o) && g.canTarget(p, o) && !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= pw);
    const good = list.filter(o => threatOf(g, o, p) >= 3);
    return maxBy(good, o => threatOf(g, o, p) + (g.power(o) < 6 ? 2 : 0));
  }
  function terastodonTargets(g, p) {
    return g.battlefield.filter(o => o.controller !== p && !g.isCreature(o) && !g.isLand(o) && g.canTarget(p, o) && threatOf(g, o, p) >= 4).length;
  }

  /* How much a creature card is worth fetching right now (the bots' tutor picks). */
  const TV = {
    "Craterhoof Behemoth": 6, "Avenger of Zendikar": 8, "Hornet Queen": 7, "Elder Gargaroth": 8, "Beast Whisperer": 7,
    "Soul of the Harvest": 6, "Tireless Tracker": 5, "Priest of Titania": 5,
    "Elvish Archdruid": 5, "Selvala, Heart of the Wilds": 6, "Marwyn, the Nurturer": 4, "Fanatic of Rhonas": 5,
    "Ilysian Caryatid": 4, "Paradise Druid": 4, "Llanowar Elves": 3, "Elvish Mystic": 3, "Fyndhorn Elves": 3,
    "Arbor Elf": 3, "Birds of Paradise": 3, "Sakura-Tribe Elder": 3, "Wood Elves": 4, "Dryad Arbor": 0,
    "Gigantosaurus": 6, "Ghalta, Stampede Tyrant": 6, "Carnage Tyrant": 7, "Pelakka Wurm": 5,
    "End-Raze Forerunners": 7, "Aggressive Mammoth": 7, "Rampaging Baloths": 7, "Goreclaw, Terror of Qal Sisma": 5,
    "Questing Beast": 6, "Thunderfoot Baloth": 6, "Vorinclex, Voice of Hunger": 7, "Thragtusk": 5,
    "Kogla, the Titan Ape": 6, "Terastodon": 5, "Surrak, the Hunt Caller": 5
  };
  const RAMP = new Set(["Priest of Titania", "Elvish Archdruid", "Selvala, Heart of the Wilds", "Marwyn, the Nurturer", "Fanatic of Rhonas", "Ilysian Caryatid", "Paradise Druid", "Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Arbor Elf", "Birds of Paradise", "Sakura-Tribe Elder", "Wood Elves", "Dryad Arbor"]);
  const DRAWERS = new Set(["Beast Whisperer", "Soul of the Harvest", "Tireless Tracker", "Elder Gargaroth"]);
  function tutorCtx(g, p) {
    return {
      pot: manaPotential(g, p), now: g.active === p && g.phase === "main1", lands: landsOf(g, p).length,
      nCre: g.creatures(p).length, hand: p.hand.length, pressure: underPressure(g, p),
      elves: g.battlefield.filter(o => g.isCreature(o) && isElf(o)).length
    };
  }
  function tutorScore(g, p, c, dest, ctx) {
    ctx = ctx || tutorCtx(g, p);
    const d = c.def, name = d.name, ai = d.ai || {};
    let s = TV[name] != null ? TV[name] : (ai.priority != null ? ai.priority : 5) * 0.6 + Math.min(4, d.mv * 0.5) + (ai.finisher ? 2 : 0);
    const early = ctx.pot < 5, late = ctx.pot >= 8;
    if (RAMP.has(name) || (TV[name] == null && ai.ramp)) s += early ? 3 : late ? -3 : 0;
    if (DRAWERS.has(name) && ctx.hand <= 2) s += 2;
    if ((DRAWERS.has(name) || DRAW_ENGINES.has(name)) && p.library.length < 25) s -= 4;
    if (name === "Priest of Titania" || name === "Elvish Archdruid") s += Math.min(3, Math.max(0, ctx.elves - 1));
    if (name === "Craterhoof Behemoth") {
      let lethal;
      if (dest === "battlefield") lethal = ctx.now && hoofLethal(g, p, "now", { cost: 0 });
      else if (dest === "hand" && ctx.now && manaNow(g, p) >= 8) lethal = hoofLethal(g, p, "now", { cost: 8 });
      else lethal = ctx.pot >= 8 && hoofLethal(g, p, "next");
      if (lethal) s += 100;
      else if (ctx.nCre >= 5) s += 2;
    }
    if (name === "Avenger of Zendikar") s += ctx.lands >= 6 ? 2 : ctx.lands < 4 ? -3 : 0;
    if (name === "Hornet Queen" && ctx.pressure) s += 3;
    if (name === "Thragtusk" && p.life <= 15) s += 3;
    if (name === "Kogla, the Titan Ape") s += koglaVictim(g, p, 7) ? 3 : -1;
    if (name === "Terastodon") s += terastodonTargets(g, p) >= 2 ? 3 : -2;
    if (name === "Ghalta, Stampede Tyrant" && dest === "battlefield") s += Math.min(4, p.hand.filter(isCreatureCard).length * 1.5);
    if (d.legendary && g.controlled(p, o => o.def.name === name).length) s -= 10;
    if (dest !== "battlefield" && d.mv > ctx.pot) s -= 1.5 * (d.mv - ctx.pot);
    return s;
  }
  function pickTutor(g, p, options, dest) {
    const ctx = tutorCtx(g, p);
    return maxBy(options.filter(c => !g.isPlayer(c)), c => tutorScore(g, p, c, dest, ctx));
  }
  const tutorTarget = dest => (g, p, req) => (req.purpose === "tutor" ? pickTutor(g, p, req.options, dest) : undefined);

  /* Sacrifice fodder: tokens first, then the cheapest creature, never the commander if avoidable. */
  function fodderScore(g, p, c) {
    let s = valueOf(g, c);
    if (c.isToken) s -= 2;
    if (c.isCommander) s += 50;
    if (g.isLand(c)) s += 3;
    if (RAMP.has(c.def.name) && manaPotential(g, p) >= 8) s -= 1;
    return s;
  }
  const cheapestFodder = (g, p, list) => maxBy(list, c => -fodderScore(g, p, c));

  /* Natural Order: cast when a cheap green creature buys a strong one (or Craterhoof wins now). */
  function naturalOrderCast(g, p) {
    const fodder = g.creatures(p).filter(c => g.colorsOf(c).has("G"));
    const sac = cheapestFodder(g, p, fodder);
    if (!sac || fodderScore(g, p, sac) > 7) return false;
    const pool = p.library.filter(c => isCreatureCard(c) && isGreenCard(c));
    if (!pool.length) return false;
    const ctx = tutorCtx(g, p);
    const best = maxBy(pool, c => tutorScore(g, p, c, "battlefield", ctx));
    let s = tutorScore(g, p, best, "battlefield", ctx);
    if (best.def.name === "Craterhoof Behemoth" && s >= 100 && !hoofLethal(g, p, "now", { cost: 4, exclude: [sac] })) s -= 100;
    if (s >= 100) return 40;
    if (s < 7) return false;
    return 12 + s;
  }
  function naturalOrderTarget(g, p, req) {
    if (req.purpose === "sacrifice") return cheapestFodder(g, p, req.options);
    if (req.purpose === "tutor") return pickTutor(g, p, req.options, "battlefield");
    return undefined;
  }

  /* Eldritch Evolution: the sacrifice and the creature it can reach (mana value + 2). */
  function evoChoice(g, p, options) {
    const ctx = tutorCtx(g, p);
    const lib = p.library.filter(isCreatureCard);
    let best = null;
    for (const c of options || g.creatures(p)) {
      if (c.isCommander) continue;
      const cap = g.mvOf(c) + 2;
      const t = maxBy(lib.filter(x => x.def.mv <= cap), x => tutorScore(g, p, x, "battlefield", ctx));
      if (!t) continue;
      const loss = c.isToken ? valueOf(g, c) * 0.3 : Math.max(1, tutorScore(g, p, c, "battlefield", ctx)) * 0.8;
      const gain = tutorScore(g, p, t, "battlefield", ctx) - loss;
      if (!best || gain > best.gain) best = { sac: c, target: t, gain };
    }
    return best;
  }

  /* Survival of the Fittest: discard the weakest creature card for the best one in the library. */
  function survivalChoice(g, p) {
    const hand = p.hand.filter(isCreatureCard);
    const lib = p.library.filter(isCreatureCard);
    if (!hand.length || !lib.length) return null;
    const ctx = tutorCtx(g, p);
    const worst = maxBy(hand, c => -tutorScore(g, p, c, "hand", ctx));
    const best = maxBy(lib, c => tutorScore(g, p, c, "hand", ctx));
    if (tutorScore(g, p, best, "hand", ctx) < tutorScore(g, p, worst, "hand", ctx) + 3) return null;
    return { discard: worst, fetch: best };
  }

  /* Green Sun's Zenith, Chord of Calling: the best creature we can reach for X. */
  function xTutorBest(g, p, xMax, green) {
    const ctx = tutorCtx(g, p);
    const pool = p.library.filter(c => isCreatureCard(c) && (!green || isGreenCard(c)) && c.def.mv <= xMax);
    const best = maxBy(pool, c => tutorScore(g, p, c, "battlefield", ctx));
    return best ? { card: best, score: tutorScore(g, p, best, "battlefield", ctx) } : null;
  }

  /* Draw engines that fire when a creature enters or is cast. With several of them out, a few
     creature spells can empty the library, so near the bottom of the library the bot only casts
     spells that keep enough cards to draw. */
  const DRAW_ENGINES = new Set(["The Great Henge", "Guardian Project", "Garruk's Uprising", "Beast Whisperer"]);
  function enterDraws(g, p, card, cast) {
    let n = 0;
    for (const o of g.controlled(p)) {
      const nm = o.def.name;
      if (nm === "The Great Henge" || nm === "Guardian Project") n++;
      else if (nm === "Garruk's Uprising" && entryPower(g, p, card) >= 4) n++;
      else if (nm === "Beast Whisperer" && cast) n++;
    }
    return n;
  }
  const TUTOR_TO_BATTLEFIELD = new Set(["Green Sun's Zenith", "Natural Order", "Eldritch Evolution", "Chord of Calling", "Finale of Devastation"]);
  const LAND_SEARCH = { "Nature's Lore": 1, "Three Visits": 1, "Skyshroud Claim": 2, "Wood Elves": 1, "Sakura-Tribe Elder": 1 };
  /* Cards a spell takes from the library (draws, searches, and draws from the engines above). */
  function libraryCost(g, p, card) {
    const name = card.def.name;
    const engines = g.controlled(p, o => DRAW_ENGINES.has(o.def.name)).length;
    const handCreatures = p.hand.filter(x => x !== card && isCreatureCard(x));
    let n = LAND_SEARCH[name] || 0;
    if (isCreatureCard(card)) {
      n += enterDraws(g, p, card, true);
      if (name === "Ghalta, Stampede Tyrant") n += handCreatures.reduce((t, x) => t + enterDraws(g, p, x, false), 0);
    } else if (TUTOR_TO_BATTLEFIELD.has(name)) n += 1 + engines * (1 + (p.library.some(c => c.def.name === "Ghalta, Stampede Tyrant") ? handCreatures.length : 0));
    else if (name === "Harmonize") n += 3;
    else if (name === "Rishkar's Expertise") n += greatestPower(g, p);
    else if (name === "Traverse the Outlands") n += greatestPower(g, p) * (1 + count(g, p, "Garruk's Uprising") * count(g, p, "Rampaging Baloths"));
    else if (name === "Garruk's Uprising") n += 1;
    return n;
  }
  const LIBRARY_FLOOR = 12;
  const tooDeep = (g, p, card) => { const n = libraryCost(g, p, card); return n > 0 && p.library.length - n < LIBRARY_FLOOR; };
  /* The best spell among the safe ones, when some spells would dig too deep. */
  function safeCastPick(g, p, casts) {
    const ok = casts.filter(a => {
      const d = a.card.def, ai = d.ai || {};
      if (a.xCount || ai.instantEnd || ai.trick || ai.finisher || (ai.hold && safe(() => ai.hold(g, p, a.card), true))) return false;
      return true;
    });
    const card = freeCastPick(g, p, ok.map(a => a.card));
    return card ? ok.find(a => a.card === card) : null;
  }
  /* Per-player memory of the plans (a finisher cast this turn means: go to combat now). */
  const planMemory = new WeakMap();
  const memOf = p => { let m = planMemory.get(p); if (!m) { m = {}; planMemory.set(p, m); } return m; };
  const ROTW = "Return of the Wildspeaker";
  /* Return of the Wildspeaker as a combat trick: non-Human attackers get +3/+3 after blocks. */
  function rotwCombatLethal(g, p) {
    const c = g.combat;
    if (!c || c.attacker !== p) return false;
    const mineAtk = c.attackers.filter(a => a.controller === p && a.zone === "battlefield" && a.combat);
    const dealt = bonus => {
      const per = new Map();
      for (const a of mineAtk) {
        const q = g.defenderOf(a.combat.attacking);
        if (!g.isPlayer(q) || q === p || !g.isPlayer(a.combat.attacking)) continue;
        const pw = Math.max(0, g.power(a) + (g.hasSub(a, "Human") ? 0 : bonus));
        const blockers = (a.combat.blockedBy || []).filter(b => b.zone === "battlefield");
        let n = 0;
        if (!a.combat.wasBlocked) n = pw;
        else if (g.kw(a, "trample")) n = Math.max(0, pw - blockers.reduce((s, b) => s + (g.kw(a, "deathtouch") ? 1 : Math.max(1, g.lethalDamageLeft(b))), 0));
        per.set(q, (per.get(q) || 0) + n);
      }
      return per;
    };
    const before = dealt(0), after = dealt(3);
    for (const [q, n] of after) if (n >= q.life && (before.get(q) || 0) < q.life) return true;
    return false;
  }

  /* The commander's plan: cast finishers that win now (then go straight to combat), keep enough
     cards in the library, and cast creatures before Ghalta while Ghalta stays affordable (every
     point of power makes it one mana cheaper). */
  function entryPower(g, p, card) {
    const d = card.def;
    if (d.cda || !d.pt) return 0;
    let pw = d.pt[0];
    if (isElf(card)) pw += g.controlled(p, o => o.def.name === "Elvish Archdruid").length;
    if (controlsCommander(g, p)) pw += 2 * g.controlled(p, o => o.def.name === "Thunderfoot Baloth").length;
    return Math.max(0, pw);
  }
  function ghaltaPlan(g, p, o, { window, actions }) {
    const rotw = actions.find(a => a.type === "cast" && a.card.def.name === ROTW);
    // Return of the Wildspeaker: a pump that wins this combat, and no big draw into an empty library
    if (window === "combat" && rotw && rotwCombatLethal(g, p)) return { type: "cast", card: rotw.card, mode: 1 };
    if (window === "end") {
      const n = g.creatures(p).filter(c => !g.hasSub(c, "Human")).reduce((m, c) => Math.max(m, g.power(c)), 0);
      if (rotw && beforeMyTurn(g, p) && p.library.length - n < 15) return { type: "pass", maxTries: 99 };
      return null;
    }
    if ((window !== "main1" && window !== "main2") || g.active !== p) return null;
    if (actions.some(a => a.type === "land")) return null;
    const mem = memOf(p);
    if (window === "main1" && mem.finisherTurn === g.turn) return { type: "pass", maxTries: 99 };
    const casts = actions.filter(a => a.type === "cast");
    if (window === "main1") {
      for (const a of casts) {
        const d = a.card.def;
        if (!(d.ai && d.ai.finisher) && d.name !== "End-Raze Forerunners") continue;
        if (finisherLethal(g, p, a.card, MK.util.costMV(a.cost))) { mem.finisherTurn = g.turn; return { type: "cast", card: a.card, alt: a.alt }; }
      }
    }
    if (casts.some(a => tooDeep(g, p, a.card))) {
      const pick = safeCastPick(g, p, casts.filter(a => !tooDeep(g, p, a.card)));
      return pick ? { type: "cast", card: pick.card, alt: pick.alt } : { type: "pass", maxTries: 99 };
    }
    if (o.zone !== "command") return null;
    const ghCost = MK.util.costMV(g.spellCost(p, o, {}));
    if (ghCost <= 2) return null;
    const avail = manaNow(g, p);
    let best = null, bs = -Infinity;
    for (const a of casts) {
      if (a.card === o || a.alt || a.xCount) continue;
      const d = a.card.def;
      if (!d.types.includes("Creature") || (d.ai && (d.ai.never || d.ai.finisher))) continue;
      const c = MK.util.costMV(a.cost);
      const pw = entryPower(g, p, a.card);
      if (avail - c < Math.max(2, ghCost - pw)) continue;
      const s = pw * 2 - c;
      if (s > bs) { bs = s; best = a; }
    }
    return best ? { type: "cast", card: best.card } : null;
  }

  /* Equipment that grants haste: move it to a summoning-sick fatty before combat. */
  function hasteCandidates(g, p, options) {
    return (options || g.creatures(p)).filter(c => !g.isPlayer(c) && c.controller === p && g.isCreature(c) && c.sick && !g.kw(c, "haste") && canAttackSoon(g, c));
  }
  function bestEquipTarget(g, p, options) {
    const sick = maxBy(hasteCandidates(g, p, options), c => g.power(c) + (c.isCommander ? 3 : 0));
    if (sick && g.power(sick) >= 3) return sick;
    return maxBy(options.filter(c => !g.isPlayer(c) && c.controller === p), c => g.power(c) + (c.isCommander ? 5 : 0) - (g.manaAbilities(c).length ? 3 : 0));
  }
  function equipPlan(g, p, o, { window, actions }) {
    if (window !== "main1" || g.active !== p) return null;
    const act = actions.find(a => a.type === "activate" && a.card === o && a.ab && a.ab.label === "Equip");
    if (!act || !o.attachedTo) return null; // the generic bot already equips an unattached one
    const cur = o.attachedTo;
    const want = maxBy(hasteCandidates(g, p).filter(c => c !== cur && g.canTarget(p, c)), c => g.power(c) + (c.isCommander ? 3 : 0));
    if (!want || g.power(want) < 4) return null;
    const curNeeds = cur.sick && !g.kw(cur, "haste") ? g.power(cur) : 0;
    if (g.power(want) <= curNeeds) return null;
    return { type: "activate", card: o, idx: act.idx };
  }

  /* Instants the bot casts at the end of the turn just before its own. */
  const beforeMyTurn = (g, p) => g.nextPlayer(g.active) === p && g.active !== p;

  /* ================================================================ the commander */
  D({
    name: GHALTA, cost: "{10}{G}{G}", type: "Legendary Creature — Elder Dinosaur", pt: "12/12",
    keywords: ["trample"],
    text: "This spell costs {X} less to cast, where X is the total power of creatures you control.\nTrample",
    costReduce: (g, p) => totalPower(g, p),
    ai: { priority: 7, plan: ghaltaPlan }
  });

  /* ================================================================ mana creatures */
  D({ name: "Fyndhorn Elves", cost: "{G}", type: "Creature — Elf Druid", pt: "1/1", text: "{T}: Add {G}.", mana: [{ tap: true, produce: "G" }], ai: { ramp: true } });

  D({
    name: "Arbor Elf", cost: "{G}", type: "Creature — Elf Druid", pt: "1/1",
    text: "{T}: Untap target Forest.",
    note: "mana is paid for you, so untapping a Forest is shown as Arbor Elf tapping for {G} while you control a Forest.",
    mana: [{ tap: true, produce: "G", condition: (g, o) => g.controlled(o.controller, x => g.isLand(x) && x.def.subtypes.includes("Forest")).length > 0 }],
    ai: { ramp: true }
  });

  D({ name: "Birds of Paradise", cost: "{G}", type: "Creature — Bird", pt: "0/1", keywords: ["flying"], text: "Flying\n{T}: Add one mana of any color.", mana: [{ tap: true, produce: "any5" }], ai: { ramp: true } });

  D({
    name: "Priest of Titania", cost: "{1}{G}", type: "Creature — Elf Druid", pt: "1/1",
    text: "{T}: Add {G} for each Elf on the battlefield.",
    mana: [{ tap: true, produce: (g, o) => "G".repeat(g.battlefield.filter(x => g.isCreature(x) && isElf(x)).length) }],
    ai: { ramp: true, priority: 7 }
  });

  D({
    name: "Elvish Archdruid", cost: "{1}{G}{G}", type: "Creature — Elf Druid", pt: "2/2",
    text: "Other Elf creatures you control get +1/+1.\n{T}: Add {G} for each Elf you control.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isElf(o), pt: [1, 1] }],
    mana: [{ tap: true, produce: (g, o) => "G".repeat(g.controlled(o.controller, x => g.isCreature(x) && isElf(x)).length) }],
    ai: { ramp: true, priority: 7 }
  });

  /* Selvala's {G} is paid from the pool mid-payment, so it needs another green source to use. */
  function otherGreenSource(g, o) {
    return g.controlled(o.controller, x => x !== o && !x.tapped && !(g.isCreature(x) && x.sick && !g.kw(x, "haste")) && g.manaAbilities(x).some(ab => {
      if (ab.cost) return false;
      const prod = typeof ab.produce === "function" ? "G" : ab.produce;
      if (Array.isArray(prod)) return prod.some(k => k.includes("G"));
      return prod === "any" || prod === "any5" || (typeof prod === "string" && prod.includes("G"));
    })).length > 0;
  }
  D({
    name: "Selvala, Heart of the Wilds", cost: "{1}{G}{G}", type: "Legendary Creature — Elf Scout", pt: "2/3",
    text: "Whenever another creature enters, its controller may draw a card if its power is greater than each other creature's power.\n{G}, {T}: Add X mana in any combination of colors, where X is the greatest power among creatures you control.",
    note: "the mana from Selvala is all one color.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && g.isCreature(ev.o),
      do: async (g, s, ev) => {
        const o = ev.o;
        if (o.zone !== "battlefield" || !g.isCreature(o)) return;
        const pw = g.power(o);
        if (g.battlefield.some(c => c !== o && g.isCreature(c) && g.power(c) >= pw)) return;
        const who = o.controller;
        if (who.lost) return;
        const ok = await g.ask(who, { type: "confirm", prompt: `Selvala: ${o.def.name} is the most powerful creature. Draw a card?`, src: s, purpose: "selvalaDraw" });
        if (ok) { g.draw(who, 1); g.log(`${who.name} draws a card (Selvala, Heart of the Wilds).`, { p: who, cards: [s.def.name] }); }
      }
    }],
    mana: [{
      tap: true, cost: "{G}",
      produce: (g, o) => { const x = greatestPower(g, o.controller); return x > 1 ? colorRun(o.controller, x) : ""; },
      condition: (g, o) => otherGreenSource(g, o)
    }],
    ai: { ramp: true, priority: 7, confirm: (g, p) => p.library.length > 10 }
  });

  D({
    name: "Marwyn, the Nurturer", cost: "{2}{G}", type: "Legendary Creature — Elf Druid", pt: "1/1",
    text: "Whenever another Elf you control enters, put a +1/+1 counter on Marwyn, the Nurturer.\n{T}: Add an amount of {G} equal to Marwyn's power.",
    triggers: [{ on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o) && isElf(ev.o), do: (g, s) => g.addCounters(s, "p1", 1, s) }],
    mana: [{ tap: true, produce: (g, o) => "G".repeat(Math.max(0, g.power(o))) }],
    ai: { ramp: true, priority: 6 }
  });

  D({
    name: "Ilysian Caryatid", cost: "{1}{G}", type: "Creature — Plant", pt: "0/1",
    text: "{T}: Add one mana of any color. If you control a creature with power 4 or greater, add two mana of any one color instead.",
    mana: [
      { tap: true, produce: "any5" },
      { tap: true, produce: (g, o) => colorRun(o.controller, 2), condition: (g, o) => g.creatures(o.controller).some(c => g.power(c) >= 4) }
    ],
    ai: { ramp: true }
  });

  D({
    name: "Paradise Druid", cost: "{1}{G}", type: "Creature — Elf Druid", pt: "2/1",
    text: "Paradise Druid has hexproof as long as it's untapped.\n{T}: Add one mana of any color.",
    statics: [{ applies: (g, s, o) => o === s && !s.tapped, kw: ["hexproof"] }],
    mana: [{ tap: true, produce: "any5" }],
    ai: { ramp: true }
  });

  D({
    name: "Sakura-Tribe Elder", cost: "{1}{G}", type: "Creature — Snake Shaman", pt: "1/1",
    text: "Sacrifice Sakura-Tribe Elder: Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
    abilities: [{
      label: "Sacrifice: basic land", sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: basicLandCard, to: "battlefield", tapped: true, prompt: "Sakura-Tribe Elder: choose a basic land card", src: s }),
      ai: { use: (g, p, o, ctx) => (ctx.window === "combat" && !!(o.combat && o.combat.blocking)) || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p) }
    }],
    ai: { ramp: true }
  });

  D({
    name: "Wood Elves", cost: "{2}{G}", type: "Creature — Elf Scout", pt: "1/1",
    text: "When Wood Elves enters, search your library for a Forest card, put that card onto the battlefield, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.search(p, { filter: forestCard, to: "battlefield", prompt: "Wood Elves: choose a Forest card", src: s }) }],
    ai: { ramp: true }
  });

  /* ================================================================ card draw creatures */
  D({
    name: "Beast Whisperer", cost: "{2}{G}{G}", type: "Creature — Elf Druid", pt: "4/3",
    text: "Whenever you cast a creature spell, draw a card.",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.types.includes("Creature"), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 8 }
  });

  D({
    name: "Soul of the Harvest", cost: "{4}{G}{G}", type: "Creature — Elemental", pt: "6/6", keywords: ["trample"],
    text: "Trample\nWhenever another nontoken creature you control enters, you may draw a card.",
    triggers: [{ on: "enters", optional: true, when: (g, s, ev) => ev.o !== s && myCreature(g, s, ev.o) && !ev.o.isToken, do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 7, confirm: (g, p) => p.library.length > 15 }
  });

  async function gargarothMode(g, s, p) {
    const opts = [{ id: 0, label: "Create a 3/3 green Beast creature token" }, { id: 1, label: "You gain 3 life" }, { id: 2, label: "Draw a card" }];
    const m = await g.ask(p, { type: "option", prompt: "Elder Gargaroth: choose one", options: opts, src: s, purpose: "gargaroth" });
    if (m === 1) g.gainLife(p, 3, s);
    else if (m === 2) { g.draw(p, 1); g.log(`${p.name} draws a card (Elder Gargaroth).`, { p, cards: [s.def.name] }); }
    else g.createToken(p, T.beast);
  }
  D({
    name: "Elder Gargaroth", cost: "{3}{G}{G}", type: "Creature — Elemental Beast", pt: "6/6",
    keywords: ["vigilance", "reach", "trample"],
    text: "Vigilance, reach, trample\nWhenever Elder Gargaroth attacks or blocks, choose one —\n• Create a 3/3 green Beast creature token.\n• You gain 3 life.\n• Draw a card.",
    triggers: [
      { on: "attacks", self: true, do: (g, s, ev, { p }) => gargarothMode(g, s, p) },
      { on: "blocks", self: true, do: (g, s, ev, { p }) => gargarothMode(g, s, p) }
    ],
    ai: { priority: 8, option: (g, p) => (p.life <= 12 ? 1 : p.hand.length <= 3 && p.library.length > 15 ? 2 : 0) }
  });

  D({
    name: "Tireless Tracker", cost: "{2}{G}", type: "Creature — Human Scout", pt: "3/2",
    text: "Landfall — Whenever a land you control enters, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")\nWhenever you sacrifice a Clue, put a +1/+1 counter on Tireless Tracker.",
    triggers: [
      { on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isLand(ev.o), do: (g, s, ev, { p }) => g.createToken(p, TOK.clue) },
      { on: "sacrifice", when: (g, s, ev) => ev.p === s.controller && ev.o.def.subtypes.includes("Clue"), do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); } }
    ],
    ai: { priority: 6 }
  });

  /* ================================================================ threats */
  D({ name: "Gigantosaurus", cost: "{G}{G}{G}{G}{G}", type: "Creature — Dinosaur", pt: "10/10", text: "", ai: { priority: 7 } });

  D({
    name: "Ghalta, Stampede Tyrant", cost: "{5}{G}{G}{G}", type: "Legendary Creature — Elder Dinosaur", pt: "12/12",
    keywords: ["trample"],
    text: "Trample\nWhen Ghalta, Stampede Tyrant enters, put any number of creature cards from your hand onto the battlefield.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = p.hand.filter(isCreatureCard);
        if (!opts.length) return;
        const pick = (await g.ask(p, { type: "cards", prompt: "Ghalta, Stampede Tyrant: put any number of creature cards from your hand onto the battlefield", options: opts, min: 0, max: opts.length, purpose: "stampede", src: s })) || [];
        const list = pick.filter(c => opts.includes(c) && c.zone === "hand");
        if (!list.length) return;
        g.log(`${p.name} puts ${list.map(c => c.def.name).join(", ")} onto the battlefield.`, { p, cards: list.map(c => c.def.name), kind: "big" });
        g.putOntoBattlefield(list, p);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Avenger of Zendikar", cost: "{5}{G}{G}", type: "Creature — Elemental", pt: "5/5",
    text: "When Avenger of Zendikar enters, create a 0/1 green Plant creature token for each land you control.\nLandfall — Whenever a land you control enters, you may put a +1/+1 counter on each Plant creature you control.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TOK.plant, { count: landsOf(g, p).length }) },
      {
        on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isLand(ev.o) && g.creatures(s.controller).some(c => g.hasSub(c, "Plant")),
        optional: "Avenger of Zendikar: put a +1/+1 counter on each Plant creature you control?",
        do: (g, s, ev, { p }) => { for (const o of g.creatures(p).filter(c => g.hasSub(c, "Plant"))) g.addCounters(o, "p1", 1, s); }
      }
    ],
    ai: { priority: 8 }
  });

  D({
    name: "Hornet Queen", cost: "{4}{G}{G}{G}", type: "Creature — Insect", pt: "2/2", keywords: ["flying", "deathtouch"],
    text: "Flying\nDeathtouch\nWhen Hornet Queen enters, create four 1/1 green Insect creature tokens with flying and deathtouch.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TOK.insect, { count: 4 }) }],
    ai: { priority: 7 }
  });

  D({
    name: "Carnage Tyrant", cost: "{4}{G}{G}", type: "Creature — Dinosaur", pt: "7/6", keywords: ["trample", "hexproof"], cantBeCountered: true,
    text: "This spell can't be countered.\nTrample, hexproof",
    ai: { priority: 7 }
  });

  D({
    name: "Pelakka Wurm", cost: "{4}{G}{G}{G}", type: "Creature — Wurm", pt: "7/7", keywords: ["trample"],
    text: "Trample\nWhen Pelakka Wurm enters, you gain 7 life.\nWhen Pelakka Wurm dies, draw a card.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 7, s) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "End-Raze Forerunners", cost: "{5}{G}{G}{G}", type: "Creature — Boar", pt: "7/7", keywords: ["vigilance", "trample", "haste"],
    text: "Vigilance, trample, haste\nWhen End-Raze Forerunners enters, other creatures you control get +2/+2 and gain vigilance and trample until end of turn.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p).filter(c => c !== s);
        if (!list.length) return;
        g.addEffect({ objs: list, pt: [2, 2], kw: ["vigilance", "trample"] });
        g.log(`Other creatures ${p.name} controls get +2/+2 and gain vigilance and trample.`, { p, cards: [s.def.name], kind: "big" });
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Aggressive Mammoth", cost: "{3}{G}{G}{G}", type: "Creature — Elephant", pt: "8/8", keywords: ["trample"],
    text: "Trample\nOther creatures you control have trample.",
    statics: [{ applies: (g, s, o) => o !== s && myCreature(g, s, o), kw: ["trample"] }],
    ai: { priority: 7 }
  });

  D({
    name: "Rampaging Baloths", cost: "{4}{G}{G}", type: "Creature — Beast", pt: "6/6", keywords: ["trample"],
    text: "Trample\nLandfall — Whenever a land you control enters, you may create a 4/4 green Beast creature token.",
    triggers: [{ on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isLand(ev.o), optional: "Rampaging Baloths: create a 4/4 green Beast creature token?", do: (g, s, ev, { p }) => g.createToken(p, TOK.beast4) }],
    ai: { priority: 7, confirm: (g, p) => !count(g, p, "Garruk's Uprising") || p.library.length > LIBRARY_FLOOR }
  });

  D({
    name: "Goreclaw, Terror of Qal Sisma", cost: "{3}{G}", type: "Legendary Creature — Bear", pt: "4/3",
    text: "Creature spells you cast with power 4 or greater cost {2} less to cast.\nWhenever Goreclaw, Terror of Qal Sisma attacks, each creature you control with power 4 or greater gets +1/+1 and gains trample until end of turn.",
    statics: [{ costMod: (g, s, card) => (card.def.types.includes("Creature") && card.def.pt && card.def.pt[0] >= 4 ? 2 : 0) }],
    triggers: [{
      on: "attacks", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.creatures(p).filter(c => g.power(c) >= 4);
        if (!list.length) return;
        g.addEffect({ objs: list, pt: [1, 1], kw: ["trample"] });
        g.log(`Creatures ${p.name} controls with power 4 or greater get +1/+1 and gain trample.`, { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Questing Beast", cost: "{2}{G}{G}", type: "Legendary Creature — Beast", pt: "4/4", keywords: ["vigilance", "deathtouch", "haste"],
    text: "Vigilance, deathtouch, haste\nQuesting Beast can't be blocked by creatures with power 2 or less.\nCombat damage that would be dealt by creatures you control can't be prevented.\nWhenever Questing Beast deals combat damage to an opponent, it deals that much damage to target planeswalker that player controls.",
    canBeBlockedBy: (g, a, b) => g.power(b) > 2,
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && ev.p !== s.controller,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "planeswalker", purpose: "harm", prompt: "Questing Beast deals that much damage to target planeswalker that player controls", filter: (g2, o) => o.controller === ev.p }), s);
        if (t) g.damage(s, t, ev.amount);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Thunderfoot Baloth", cost: "{4}{G}{G}", type: "Creature — Beast", pt: "5/5", keywords: ["trample"],
    text: "Trample\nLieutenant — As long as you control your commander, Thunderfoot Baloth gets +2/+2 and other creatures you control get +2/+2 and have trample.",
    statics: [
      { applies: (g, s, o) => o === s && controlsCommander(g, s.controller), pt: [2, 2] },
      { applies: (g, s, o) => o !== s && myCreature(g, s, o) && controlsCommander(g, s.controller), pt: [2, 2], kw: ["trample"] }
    ],
    ai: { priority: 7 }
  });

  function koglaInDanger(g, p, o, ctx) {
    if (ctx.window !== "combat" || !o.combat || g.kw(o, "indestructible")) return false;
    let foes = [];
    if (o.combat.attacking) foes = (o.combat.blockedBy || []).filter(b => b.zone === "battlefield");
    else if (o.combat.blocking && o.combat.blocking.zone === "battlefield") foes = [o.combat.blocking];
    if (!foes.length) return false;
    const dmg = foes.reduce((s, b) => s + Math.max(0, g.power(b)), 0);
    return dmg >= g.lethalDamageLeft(o) || foes.some(b => g.kw(b, "deathtouch") && g.power(b) > 0);
  }
  D({
    name: "Kogla, the Titan Ape", cost: "{3}{G}{G}{G}", type: "Legendary Creature — Ape", pt: "7/6",
    text: "When Kogla, the Titan Ape enters, it fights up to one target creature you don't control.\nWhenever Kogla attacks, destroy target artifact or enchantment defending player controls.\n{1}{G}: Return target Human you control to its owner's hand. Kogla gains indestructible until end of turn.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          if (s.zone !== "battlefield") return;
          const t = await g.chooseTarget(p, trig({ kind: "creature", opp: true, optional: true, purpose: "harm", prompt: "Kogla fights up to one target creature you don't control" }), s);
          if (!t || t.zone !== "battlefield" || s.zone !== "battlefield") return;
          g.log(`Kogla, the Titan Ape fights ${t.def.name}.`, { p, cards: [s.def.name, t.def.name] });
          fight(g, s, t);
        }
      },
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const who = g.defenderOf(ev.target);
          const t = await g.chooseTarget(p, trig({ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Kogla: destroy target artifact or enchantment defending player controls", filter: (g2, o) => o.controller === who }), s);
          if (t) g.destroy(t, s);
        }
      }
    ],
    abilities: [{
      label: "Return a Human, gain indestructible", cost: "{1}{G}",
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Return target Human you control to its owner's hand", filter: (g, o) => g.hasSub(o, "Human") }],
      do: (g, s, ctx) => {
        if (!ctx.legal[0]) return;
        g.bounce(ctx.targets[0]);
        if (s.zone === "battlefield") { g.grant(s, ["indestructible"]); g.log("Kogla, the Titan Ape gains indestructible until end of turn.", { p: ctx.p, cards: [s.def.name] }); }
      },
      ai: { use: (g, p, o, ctx) => koglaInDanger(g, p, o, ctx) }
    }],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.spec && req.spec.kind === "creature" && req.purpose === "harm") {
          const me = req.src && req.src.zone === "battlefield" ? req.src : null;
          return koglaVictim(g, p, me ? g.power(me) : 7, req.options) || null;
        }
        return undefined;
      }
    }
  });

  function terastodonPick(g, p, req) {
    const opts = req.options.filter(o => !g.isPlayer(o));
    const theirs = opts.filter(o => o.controller !== p && !g.isLand(o) && threatOf(g, o, p) >= 3.5);
    if (theirs.length) return maxBy(theirs, o => threatOf(g, o, p));
    // spare lands of our own turn into 3/3 Elephants once the mana is no longer needed
    const lands = landsOf(g, p).length;
    if (lands >= 9) {
      const own = opts.filter(o => o.controller === p && g.isLand(o) && g.isBasic(o));
      if (own.length) return maxBy(own, o => (o.tapped ? 1 : 0));
    }
    return null;
  }
  D({
    name: "Terastodon", cost: "{6}{G}{G}", type: "Creature — Elephant", pt: "9/9",
    text: "When Terastodon enters, you may destroy up to three target noncreature permanents. For each permanent put into a graveyard this way, its controller creates a 3/3 green Elephant creature token.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const chosen = [];
        for (let i = 0; i < 3; i++) {
          const t = await g.chooseTarget(p, trig({ kind: "noncreature", optional: true, purpose: "harm", prompt: `Terastodon: destroy target noncreature permanent (${i + 1} of up to 3)`, filter: (g2, o) => !chosen.includes(o) }), s);
          if (!t) break;
          chosen.push(t);
        }
        const elephants = [];
        for (const t of chosen) {
          if (t.zone !== "battlefield") continue;
          const who = t.controller;
          if (g.destroy(t, s)) elephants.push(who);
        }
        for (const who of elephants) if (!who.lost) g.createToken(who, T.elephant);
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.spec && req.spec.kind === "noncreature" ? terastodonPick(g, p, req) : undefined) }
  });

  D({
    name: "Thragtusk", cost: "{4}{G}", type: "Creature — Beast", pt: "5/3",
    text: "When Thragtusk enters, you gain 5 life.\nWhen Thragtusk leaves the battlefield, create a 3/3 green Beast creature token.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 5, s) },
      { on: "leaves", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.beast) }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Surrak, the Hunt Caller", cost: "{2}{G}{G}", type: "Legendary Creature — Human Warrior", pt: "5/4",
    text: "Formidable — At the beginning of combat on your turn, if creatures you control have total power 8 or greater, target creature you control gains haste until end of turn.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller && totalPower(g, s.controller) >= 8,
      intervening: (g, s) => totalPower(g, s.controller) >= 8,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Surrak: target creature you control gains haste until end of turn" }), s);
        if (t) { g.grant(t, ["haste"]); g.log(`${t.def.name} gains haste until end of turn.`, { p, cards: [t.def.name] }); }
      }
    }],
    ai: { priority: 7, target: (g, p, req) => (req.purpose === "help" ? bestEquipTarget(g, p, req.options) || undefined : undefined) }
  });

  /* ================================================================ artifacts */
  D({
    name: "Swiftfoot Boots", cost: "{2}", type: "Artifact — Equipment", equip: "{1}",
    text: "Equipped creature has hexproof and haste.\nEquip {1}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["hexproof", "haste"] }],
    ai: { priority: 6, plan: equipPlan, equipTarget: (g, p, opts) => bestEquipTarget(g, p, opts) }
  });

  D({
    name: "Lightning Greaves", cost: "{2}", type: "Artifact — Equipment", equip: "{0}",
    text: "Equipped creature has haste and shroud.\nEquip {0}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["haste", "shroud"] }],
    ai: { priority: 6, plan: equipPlan, equipTarget: (g, p, opts) => bestEquipTarget(g, p, opts) }
  });

  D({
    name: "The Great Henge", cost: "{7}{G}{G}", type: "Legendary Artifact",
    text: "This spell costs {X} less to cast, where X is the greatest power among creatures you control.\n{T}: Add {G}{G}. You gain 2 life.\nWhenever a nontoken creature you control enters, put a +1/+1 counter on it and draw a card.",
    costReduce: (g, p) => greatestPower(g, p),
    mana: [{ tap: true, produce: "GG", after: (g, o) => g.gainLife(o.controller, 2, o) }],
    triggers: [{
      on: "enters", when: (g, s, ev) => myCreature(g, s, ev.o) && !ev.o.isToken,
      do: (g, s, ev, { p }) => { if (ev.o.zone === "battlefield") g.addCounters(ev.o, "p1", 1, s); g.draw(p, 1); }
    }],
    ai: { priority: 9 }
  });

  /* ================================================================ enchantments */
  const hasBigCreature = (g, p) => g.creatures(p).some(c => g.power(c) >= 4);
  D({
    name: "Garruk's Uprising", cost: "{2}{G}", type: "Enchantment",
    text: "When Garruk's Uprising enters, if you control a creature with power 4 or greater, draw a card.\nCreatures you control have trample. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nWhenever a creature you control with power 4 or greater enters, draw a card.",
    statics: [{ applies: myCreature, kw: ["trample"] }],
    triggers: [
      { on: "enters", self: true, when: (g, s) => hasBigCreature(g, s.controller), intervening: (g, s) => hasBigCreature(g, s.controller), do: (g, s, ev, { p }) => g.draw(p, 1) },
      { on: "enters", when: (g, s, ev) => myCreature(g, s, ev.o) && g.power(ev.o) >= 4, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: { priority: 8 }
  });

  const sameNameAround = (g, p, o) => g.controlled(p, x => x !== o && g.isCreature(x) && x.def.name === o.def.name).length > 0 || p.graveyard.some(c => isCreatureCard(c) && c.def.name === o.def.name);
  D({
    name: "Guardian Project", cost: "{3}{G}", type: "Enchantment",
    text: "Whenever a nontoken creature you control enters, if it doesn't have the same name as another creature you control or a creature card in your graveyard, draw a card.",
    triggers: [{
      on: "enters", when: (g, s, ev) => myCreature(g, s, ev.o) && !ev.o.isToken && !sameNameAround(g, s.controller, ev.o),
      intervening: (g, s, ev) => !sameNameAround(g, s.controller, ev.o),
      do: (g, s, ev, { p }) => g.draw(p, 1)
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Colossal Majesty", cost: "{2}{G}", type: "Enchantment",
    text: "At the beginning of your upkeep, if you control a creature with power 4 or greater, draw a card.",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller && hasBigCreature(g, s.controller),
      intervening: (g, s) => hasBigCreature(g, s.controller),
      do: (g, s, ev, { p }) => { g.draw(p, 1); g.log(`${p.name} draws a card (Colossal Majesty).`, { p, cards: [s.def.name] }); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Survival of the Fittest", cost: "{1}{G}", type: "Enchantment",
    text: "{G}, Discard a creature card: Search your library for a creature card, reveal that card, put it into your hand, then shuffle.",
    abilities: [{
      label: "Discard a creature card: find a creature", cost: "{G}",
      condition: (g, o, p) => p.hand.some(isCreatureCard),
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const opts = p.hand.filter(isCreatureCard);
        if (!opts.length) return;
        let c = await g.ask(p, { type: "target", prompt: "Survival of the Fittest: discard a creature card", options: opts, purpose: "survivalDiscard", src: s });
        if (!c || !opts.includes(c)) c = opts[0];
        g.discard(p, c);
        await tutor(g, p, s, { filter: isCreatureCard, to: "hand", prompt: "Survival of the Fittest: search for a creature card" });
      },
      ai: { use: (g, p, o, ctx) => p.library.length > LIBRARY_FLOOR && (ctx.window === "main1" || ctx.window === "main2" || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p)) && !!survivalChoice(g, p) }
    }],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.purpose === "survivalDiscard") { const ch = survivalChoice(g, p); return ch && req.options.includes(ch.discard) ? ch.discard : maxBy(req.options, c => -tutorScore(g, p, c, "hand")); }
        if (req.purpose === "tutor") return pickTutor(g, p, req.options, "hand");
        return undefined;
      }
    }
  });

  /* ================================================================ instants */
  D({
    name: "Heroic Intervention", cost: "{1}{G}", type: "Instant",
    text: "Permanents you control gain hexproof and indestructible until end of turn.",
    spell: {
      do: (g, ctx) => {
        g.grant(g.controlled(ctx.p), ["hexproof", "indestructible"]);
        g.log(`Permanents ${ctx.p.name} controls gain hexproof and indestructible until end of turn.`, { p: ctx.p });
      }
    },
    ai: { protection: true }
  });

  function ramThroughPlan(g, p) {
    const mineC = g.creatures(p).filter(c => g.canTarget(p, c) && g.power(c) >= 2);
    let best = null;
    for (const src of mineC) {
      const pw = g.power(src), dt = g.kw(src, "deathtouch");
      const victims = g.battlefield.filter(o => o.controller !== p && g.isCreature(o) && g.canTarget(p, o) && !g.kw(o, "indestructible") && (dt || g.lethalDamageLeft(o) <= pw));
      const v = maxBy(victims, o => threatOf(g, o, p));
      if (!v) continue;
      const score = threatOf(g, v, p) + (g.kw(src, "trample") ? Math.min(6, pw - g.lethalDamageLeft(v)) * 0.3 : 0);
      if (!best || score > best.score) best = { src, victim: v, score };
    }
    return best;
  }
  D({
    name: "Ram Through", cost: "{1}{G}", type: "Instant",
    text: "Target creature you control deals damage equal to its power to target creature you don't control. If the creature you control has trample, excess damage is dealt to that creature's controller instead.",
    spell: {
      targets: [
        { kind: "creature", you: true, purpose: "help", prompt: "Ram Through: choose a creature you control" },
        { kind: "creature", opp: true, purpose: "harm", prompt: "Ram Through: choose a creature you don't control" }
      ],
      do: (g, ctx) => {
        const [a, b] = ctx.targets;
        if (!a || !b || !ctx.legal[0] || !ctx.legal[1]) return;
        const n = Math.max(0, g.power(a));
        if (!n) return;
        if (g.kw(a, "trample")) {
          const lethal = g.kw(a, "deathtouch") ? 1 : g.lethalDamageLeft(b);
          const toB = Math.min(n, lethal), rest = n - toB, who = b.controller;
          if (toB > 0) g.damage(a, b, toB);
          if (rest > 0 && !who.lost) g.damage(a, who, rest);
        } else g.damage(a, b, n);
      }
    },
    ai: {
      cast: (g, p, o, { window }) => {
        if (window !== "main1" && window !== "main2") return false;
        const r = ramThroughPlan(g, p);
        return r && r.score >= 4 ? 14 + r.score : false;
      },
      target: (g, p, req) => {
        const r = ramThroughPlan(g, p);
        if (!r) return undefined;
        if (req.spec && req.spec.purpose === "help") return req.options.includes(r.src) ? r.src : undefined;
        return req.options.includes(r.victim) ? r.victim : undefined;
      }
    }
  });

  /* Force of Vigor picks two different targets: remember the first pick for the second. */
  let vigorFirst = null;
  function cheapestGreenCard(g, p, options) {
    return maxBy(options.filter(c => !g.isPlayer(c)), c => {
      if (isLandCard(c)) return -20;
      if (isCreatureCard(c)) return -tutorScore(g, p, c, "hand");
      const ai = c.def.ai || {};
      return -((ai.priority != null ? ai.priority : 5) + (ai.finisher ? 4 : 0));
    });
  }
  D({
    name: "Force of Vigor", cost: "{2}{G}{G}", type: "Instant",
    text: "If it's not your turn, you may exile a green card from your hand rather than pay this spell's mana cost.\nDestroy up to two target artifacts and/or enchantments.",
    note: "the first target is required, the second is optional.",
    altCosts: [{ label: "Exile a green card", cost: "", condition: (g, p) => g.active !== p, exileFromHand: { filter: (g, c) => isGreenCard(c), prompt: "Force of Vigor: exile a green card from your hand" } }],
    spell: {
      targets: [
        { kind: "artifactOrEnchantment", purpose: "harm", prompt: "Force of Vigor: destroy target artifact or enchantment" },
        { kind: "artifactOrEnchantment", purpose: "harm", optional: true, prompt: "Force of Vigor: destroy a second target artifact or enchantment" }
      ],
      do: (g, ctx) => { ctx.targets.forEach((t, i) => { if (t && ctx.legal[i] && t.zone === "battlefield") g.destroy(t, ctx.o); }); }
    },
    ai: {
      removal: true, minThreat: 4,
      target: (g, p, req) => {
        if (req.purpose === "altExile") return cheapestGreenCard(g, p, req.options);
        const theirs = req.options.filter(o => !g.isPlayer(o) && o.controller !== p);
        if (!req.spec || !req.spec.optional) { vigorFirst = maxBy(theirs, o => threatOf(g, o, p)); return vigorFirst || undefined; }
        return maxBy(theirs.filter(o => o !== vigorFirst && threatOf(g, o, p) >= 3), o => threatOf(g, o, p)) || null;
      }
    }
  });

  D({
    name: "Worldly Tutor", cost: "{G}", type: "Instant",
    text: "Search your library for a creature card, reveal it, then shuffle and put the card on top.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, { filter: isCreatureCard, to: "top", prompt: "Worldly Tutor: search for a creature card" }) },
    ai: {
      tutor: true, cast: () => false, target: tutorTarget("top"),
      plan: (g, p, o, { window, actions }) => (window === "end" && beforeMyTurn(g, p) && o.zone === "hand" && p.library.some(isCreatureCard) && actions.some(a => a.type === "cast" && a.card === o) ? { type: "cast", card: o } : null)
    }
  });

  async function pactUpkeep(g, src, ev, { p }) {
    const c = MK.parseCost("{2}{G}{G}");
    if (g.canPay(p, c)) {
      const ok = await g.ask(p, { type: "confirm", prompt: "Summoner's Pact: pay {2}{G}{G}? If you don't, you lose the game.", src, purpose: "pactPay" });
      if (ok && g.pay(p, c)) { g.log(`${p.name} pays {2}{G}{G} for Summoner's Pact.`, { p, cards: ["Summoner's Pact"] }); return; }
    }
    g.log(`${p.name} doesn't pay for Summoner's Pact.`, { p, cards: ["Summoner's Pact"], loud: true });
    g.lose(p, "pact");
  }
  function pactPlan(g, p, o, { window, actions }) {
    if (window !== "main1" || g.active !== p || o.zone !== "hand") return null;
    if (actions.some(a => a.type === "land") || !actions.some(a => a.type === "cast" && a.card === o)) return null;
    // next upkeep needs {2}{G}{G} from lands alone, with a spare
    if (g.controlled(p, x => g.isLand(x) && g.manaAbilities(x).length).length < 5) return null;
    // look once per turn (the search below is the slow part)
    const mem = memOf(p);
    if (mem.pactLooked === g.turn) return null;
    mem.pactLooked = g.turn;
    const avail = manaNow(g, p);
    const ctx = tutorCtx(g, p);
    const pool = p.library.filter(c => isCreatureCard(c) && isGreenCard(c) && MK.util.costMV(g.spellCost(p, c, {})) <= avail);
    const best = maxBy(pool, c => tutorScore(g, p, c, "hand", ctx));
    if (!best) return null;
    const s = tutorScore(g, p, best, "hand", ctx);
    return s >= 8 ? { type: "cast", card: o } : null;
  }
  D({
    name: "Summoner's Pact", cost: "{0}", type: "Instant", colors: "G",
    text: "Search your library for a green creature card, reveal it, put it into your hand, then shuffle.\nAt the beginning of your next upkeep, pay {2}{G}{G}. If you don't, you lose the game.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        await tutor(g, p, ctx.o, { filter: c => isCreatureCard(c) && isGreenCard(c), to: "hand", prompt: "Summoner's Pact: search for a green creature card" });
        g.delayed.push({ at: "upkeep", once: true, player: p, controller: p, turn: g.turn + 1, src: ctx.o, do: pactUpkeep });
      }
    },
    ai: {
      tutor: true, cast: () => false, plan: pactPlan, confirm: () => true,
      target: (g, p, req) => {
        if (req.purpose !== "tutor") return undefined;
        const avail = manaNow(g, p), ctx = tutorCtx(g, p);
        return maxBy(req.options, c => tutorScore(g, p, c, "hand", ctx) + (MK.util.costMV(g.spellCost(p, c, {})) <= avail ? 3 : 0));
      }
    }
  });

  function chordPlan(g, p, o, { window, actions }) {
    if (window !== "end" || !beforeMyTurn(g, p) || o.zone !== "hand") return null;
    const act = actions.find(a => a.type === "cast" && a.card === o && !a.alt);
    if (!act || tooDeep(g, p, o)) return null;
    const best = xTutorBest(g, p, act.xMax, false);
    if (!best || best.score < 6) return null;
    return { type: "cast", card: o, x: best.card.def.mv };
  }
  D({
    name: "Chord of Calling", cost: "{X}{G}{G}{G}", type: "Instant", keywords: ["convoke"],
    text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nSearch your library for a creature card with mana value X or less, put it onto the battlefield, then shuffle.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, { filter: c => isCreatureCard(c) && c.def.mv <= (ctx.x || 0), to: "battlefield", prompt: `Chord of Calling: search for a creature card with mana value ${ctx.x || 0} or less` }) },
    ai: {
      tutor: true, cast: () => false, plan: chordPlan, target: tutorTarget("battlefield"),
      x: (g, p, o, xMax) => { const b = xTutorBest(g, p, xMax, false); return b ? b.card.def.mv : xMax; }
    }
  });

  /* ================================================================ sorceries */
  D({
    name: "Natural Order", cost: "{2}{G}{G}", type: "Sorcery",
    text: "As an additional cost to cast this spell, sacrifice a green creature.\nSearch your library for a green creature card, put it onto the battlefield, then shuffle.",
    canCast: (g, p) => g.creatures(p).some(c => g.colorsOf(c).has("G")),
    onCast: async (g, p, o, item) => { if (!item.isCopy) item.sacrificed = await sacrificeAsCost(g, p, o, c => g.colorsOf(c).has("G"), "Natural Order: sacrifice a green creature"); },
    spell: {
      do: async (g, ctx) => {
        if (!ctx.item.sacrificed) return;
        await tutor(g, ctx.p, ctx.o, { filter: c => isCreatureCard(c) && isGreenCard(c), to: "battlefield", prompt: "Natural Order: search for a green creature card" });
      }
    },
    ai: { tutor: true, cast: (g, p) => naturalOrderCast(g, p), target: naturalOrderTarget }
  });

  D({
    name: "Eldritch Evolution", cost: "{1}{G}{G}", type: "Sorcery",
    text: "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a creature card with mana value less than or equal to 2 plus the sacrificed creature's mana value, put that card onto the battlefield, then shuffle. Exile Eldritch Evolution.",
    canCast: (g, p) => g.creatures(p).length > 0,
    onCast: async (g, p, o, item) => { if (!item.isCopy) item.sacrificed = await sacrificeAsCost(g, p, o, () => true, "Eldritch Evolution: sacrifice a creature"); },
    spell: {
      do: async (g, ctx) => {
        if (!ctx.item.isCopy) ctx.item.exileAfter = true;
        const s = ctx.item.sacrificed;
        if (!s) return;
        const cap = s.mv + 2;
        await tutor(g, ctx.p, ctx.o, { filter: c => isCreatureCard(c) && c.def.mv <= cap, to: "battlefield", prompt: `Eldritch Evolution: search for a creature card with mana value ${cap} or less` });
      }
    },
    ai: {
      tutor: true,
      cast: (g, p) => { const b = evoChoice(g, p); return b && b.gain >= 4 ? 12 + Math.min(20, b.gain) : false; },
      target: (g, p, req) => {
        if (req.purpose === "sacrifice") { const b = evoChoice(g, p, req.options); return b ? b.sac : cheapestFodder(g, p, req.options); }
        if (req.purpose === "tutor") return pickTutor(g, p, req.options, "battlefield");
        return undefined;
      }
    }
  });

  D({
    name: "Green Sun's Zenith", cost: "{X}{G}", type: "Sorcery",
    text: "Search your library for a green creature card with mana value X or less, put it onto the battlefield, then shuffle. Shuffle Green Sun's Zenith into its owner's library.",
    spell: {
      do: async (g, ctx) => {
        const x = ctx.x || 0;
        await tutor(g, ctx.p, ctx.o, { filter: c => isCreatureCard(c) && isGreenCard(c) && c.def.mv <= x, to: "battlefield", prompt: `Green Sun's Zenith: search for a green creature card with mana value ${x} or less` });
        if (!ctx.item.isCopy && ctx.o.zone === "stack") {
          const owner = ctx.o.owner;
          g.moveTo(ctx.o, "library");
          g.shuffle(owner);
          g.log(`Green Sun's Zenith is shuffled into ${owner.name}'s library.`, { p: owner, cards: ["Green Sun's Zenith"] });
        }
      }
    },
    ai: {
      tutor: true, target: tutorTarget("battlefield"),
      cast: (g, p, o) => {
        const xMax = g.maxX(p, g.spellCost(p, o, { x: 0 }), 1);
        const b = xTutorBest(g, p, xMax, true);
        return b && b.score >= 6 ? 12 + Math.min(20, b.score) : false;
      },
      x: (g, p, o, xMax) => { const b = xTutorBest(g, p, xMax, true); return b ? b.card.def.mv : xMax; }
    }
  });

  D({
    name: "Three Visits", cost: "{1}{G}", type: "Sorcery",
    text: "Search your library for a Forest card, put that card onto the battlefield, then shuffle.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: forestCard, to: "battlefield", prompt: "Three Visits: choose a Forest card", src: ctx.o }) },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Skyshroud Claim", cost: "{3}{G}", type: "Sorcery",
    text: "Search your library for up to two Forest cards, put them onto the battlefield, then shuffle.",
    spell: { do: (g, ctx) => g.search(ctx.p, { filter: forestCard, count: 2, to: "battlefield", prompt: "Skyshroud Claim: choose up to two Forest cards", src: ctx.o }) },
    ai: { ramp: true, priority: 8 }
  });

  D({
    name: "Traverse the Outlands", cost: "{4}{G}", type: "Sorcery",
    text: "Search your library for up to X basic land cards, where X is the greatest power among creatures you control. Put those cards onto the battlefield tapped, then shuffle.",
    spell: {
      do: (g, ctx) => {
        const x = greatestPower(g, ctx.p);
        if (x <= 0) { g.shuffle(ctx.p); g.log(`${ctx.p.name} controls no creature with power, so Traverse the Outlands finds nothing.`, { p: ctx.p }); return; }
        return g.search(ctx.p, { filter: basicLandCard, count: x, to: "battlefield", tapped: true, prompt: `Traverse the Outlands: choose up to ${x} basic land cards`, src: ctx.o });
      }
    },
    ai: { ramp: true, cast: (g, p) => { const x = greatestPower(g, p); return x >= 4 && p.library.length >= x + 15 ? 16 + Math.min(10, x) : false; } }
  });

  D({ name: "Harmonize", cost: "{2}{G}{G}", type: "Sorcery", text: "Draw three cards.", spell: { do: (g, ctx) => g.draw(ctx.p, 3) }, ai: { draw: true, priority: 6, hold: (g, p) => p.library.length < 12 } });

  function freeCastPick(g, p, options) {
    const ok = options.filter(c => {
      const d = c.def, ai = d.ai || {};
      if (g.isPlayer(c) || isLandCard(c) || d.costObj.x || ai.never || ai.protection || ai.counter) return false;
      if (["Worldly Tutor", "Chord of Calling", "Summoner's Pact"].includes(d.name)) return false;
      if (ai.removal && !ai.cast) { const spec = d.spell && d.spell.targets && d.spell.targets[0]; if (!spec || !g.targetOptions(p, spec, c).some(t => !g.isPlayer(t) && t.controller !== p && threatOf(g, t, p) >= (ai.minThreat || 3))) return false; }
      if (ai.cast) { const r = safe(() => ai.cast(g, p, c, { window: "main1" }), false); if (r === false) return false; }
      return true;
    });
    return maxBy(ok, c => c.def.mv * 2 + (isCreatureCard(c) ? 3 : 0) + (c.def.ai && c.def.ai.priority != null ? c.def.ai.priority : 5) * 0.3) || null;
  }
  D({
    name: "Rishkar's Expertise", cost: "{4}{G}{G}", type: "Sorcery",
    text: "Draw cards equal to the greatest power among creatures you control.\nYou may cast a spell with mana value 5 or less from your hand without paying its mana cost.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const n = greatestPower(g, p);
        if (n > 0) g.draw(p, n);
        const opts = p.hand.filter(c => !isLandCard(c) && g.mvOf(c) <= 5 && (!c.def.canCast || c.def.canCast(g, p, c)));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Rishkar's Expertise: you may cast a spell with mana value 5 or less without paying its mana cost", options: opts, optional: true, purpose: "freeCast", src: ctx.o });
        if (pick && opts.includes(pick) && pick.zone === "hand") await g.castWithoutPaying(p, pick);
      }
    },
    ai: {
      draw: true,
      cast: (g, p) => { const n = greatestPower(g, p); return n >= 4 && p.hand.length <= 4 && p.library.length >= n + 20 ? 14 + Math.min(10, n) : false; },
      target: (g, p, req) => (req.purpose === "freeCast" ? freeCastPick(g, p, req.options) : undefined)
    }
  });

  /* ================================================================ planeswalker */
  D({
    name: "Garruk, Primal Hunter", cost: "{2}{G}{G}{G}", type: "Legendary Planeswalker — Garruk", loyalty: 3,
    text: "+1: Create a 3/3 green Beast creature token.\n−3: Draw cards equal to the greatest power among creatures you control.\n−6: Create a 6/6 green Wurm creature token for each land you control.",
    abilities: [
      { label: "+1: Create a 3/3 Beast", loyalty: 1, do: (g, s, ctx) => g.createToken(ctx.p, T.beast) },
      {
        label: "−3: Draw cards equal to the greatest power", loyalty: -3,
        do: (g, s, ctx) => { const n = greatestPower(g, ctx.p); if (n > 0) g.draw(ctx.p, n); },
        ai: { use: (g, p) => { const n = greatestPower(g, p); return n >= 4 && p.hand.length <= 1 && p.library.length >= n + 25 + 10 * g.controlled(p, o => DRAWERS.has(o.def.name)).length; } }
      },
      {
        label: "−6: A 6/6 Wurm for each land", loyalty: -6,
        do: (g, s, ctx) => g.createToken(ctx.p, TOK.wurm, { count: landsOf(g, ctx.p).length }),
        // with Garruk's Uprising every Wurm draws a card
        ai: { use: (g, p) => !count(g, p, "Garruk's Uprising") || p.library.length > landsOf(g, p).length * count(g, p, "Garruk's Uprising") + 10 }
      }
    ],
    ai: { priority: 8 }
  });

  /* ================================================================ lands */
  D({
    name: "Dryad Arbor", type: "Land Creature — Forest Dryad", pt: "1/1", colors: "G",
    text: "(Dryad Arbor isn't a spell, it's affected by summoning sickness, and it has \"{T}: Add {G}.\")",
    mana: [{ tap: true, produce: "G" }]
  });

  D({
    name: "Gaea's Cradle", type: "Legendary Land",
    text: "{T}: Add {G} for each creature you control.",
    mana: [{ tap: true, produce: (g, o) => "G".repeat(g.creatures(o.controller).length) }]
  });

  D({
    name: "Nykthos, Shrine to Nyx", type: "Legendary Land",
    text: "{T}: Add {C}.\n{2}, {T}: Choose a color. Add an amount of mana of that color equal to your devotion to that color. (Each mana symbol in the mana costs of permanents you control counts toward your devotion to that color.)",
    note: "the second ability is offered only for a color you have devotion 3 or more to, since less would not add more mana than it costs.",
    mana: [
      { tap: true, produce: "C" },
      {
        tap: true, cost: "{2}",
        produce: (g, o) => { const out = []; for (const k of MK.COLORS) { const n = g.devotion(o.controller, k); if (n >= 3) out.push(k.repeat(n)); } return out.length ? out : ""; }
      }
    ]
  });

  D({
    name: "Myriad Landscape", type: "Land", etbTapped: true,
    text: "Myriad Landscape enters tapped.\n{T}: Add {C}.\n{2}, {T}, Sacrifice Myriad Landscape: Search your library for up to two basic land cards that share a land type, put them onto the battlefield tapped, then shuffle.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Fetch two basic lands", cost: "{2}", tap: true, sacSelf: true,
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const pool = p.library.filter(c => basicLandCard(g, c));
        const picks = [];
        if (pool.length) {
          const a = ((await g.ask(p, { type: "cards", prompt: "Myriad Landscape: choose a basic land card", options: pool, min: 0, max: 1, purpose: "tutor", src: s })) || []).filter(c => pool.includes(c))[0];
          if (a) {
            picks.push(a);
            const share = pool.filter(c => c !== a && c.def.subtypes.some(t => a.def.subtypes.includes(t)));
            const b = share.length ? ((await g.ask(p, { type: "cards", prompt: "Myriad Landscape: choose a second basic land card that shares a land type", options: share, min: 0, max: 1, purpose: "tutor", src: s })) || []).filter(c => share.includes(c))[0] : null;
            if (b) picks.push(b);
          }
        }
        if (picks.length) g.putOntoBattlefield(picks, p, { tapped: true });
        g.shuffle(p);
        g.log(picks.length ? `${p.name} finds ${picks.map(c => c.def.name).join(" and ")}.` : `${p.name} finds no basic land.`, { p, kind: "search", cards: picks.map(c => c.def.name) });
      },
      ai: { use: (g, p, o, ctx) => p.library.length > LIBRARY_FLOOR && (ctx.window === "main2" || (ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p)) }
    }]
  });

  /* ================================================================ the deck */
  const singles = [
    // mana creatures
    "Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Arbor Elf", "Birds of Paradise", "Priest of Titania",
    "Elvish Archdruid", "Selvala, Heart of the Wilds", "Fanatic of Rhonas", "Paradise Druid", "Sakura-Tribe Elder",
    "Wood Elves", "Ilysian Caryatid", "Marwyn, the Nurturer",
    // mana rocks and land ramp
    "Sol Ring", "Arcane Signet", "Nature's Lore", "Three Visits", "Skyshroud Claim", "Traverse the Outlands",
    // card advantage
    "Garruk's Uprising", "Guardian Project", "Beast Whisperer", "Return of the Wildspeaker", "Rishkar's Expertise",
    "Colossal Majesty", "Soul of the Harvest", "The Great Henge", "Garruk, Primal Hunter", "Tireless Tracker", "Harmonize",
    // tutors
    "Natural Order", "Worldly Tutor", "Survival of the Fittest", "Green Sun's Zenith", "Chord of Calling",
    "Finale of Devastation", "Eldritch Evolution", "Summoner's Pact",
    // haste and protection
    "Swiftfoot Boots", "Lightning Greaves", "Heroic Intervention", "Surrak, the Hunt Caller",
    // answers
    "Beast Within", "Ram Through", "Kogla, the Titan Ape", "Terastodon", "Force of Vigor",
    // threats and finishers
    "Craterhoof Behemoth", "Gigantosaurus", "Ghalta, Stampede Tyrant", "Avenger of Zendikar", "Hornet Queen",
    "Carnage Tyrant", "Pelakka Wurm", "End-Raze Forerunners", "Aggressive Mammoth", "Rampaging Baloths",
    "Goreclaw, Terror of Qal Sisma", "Questing Beast", "Thunderfoot Baloth", "Vorinclex, Voice of Hunger",
    "Elder Gargaroth", "Esika's Chariot", "Thragtusk", "Overwhelming Stampede", "Triumph of the Hordes",
    // lands
    "Gaea's Cradle", "Nykthos, Shrine to Nyx", "Dryad Arbor", "Myriad Landscape", "Rogue's Passage"
  ];
  const list = singles.slice();
  for (let i = 0; i < 27; i++) list.push("Forest");

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "ghalta", name: "Ghalta", title: "Ghalta, Primal Hunger", commander: GHALTA,
    identity: ["G"], bracket: 4, aggression: 0.8,
    style: "Green stompy",
    blurb: "Mana elves and ramp make a 12/12 trampling Ghalta cost only a few mana, and green tutors find Craterhoof Behemoth to end the game.",
    watch: ["Craterhoof Behemoth", "Natural Order", "Gaea's Cradle", "The Great Henge", "Triumph of the Hordes"],
    list
  });
})(typeof window !== "undefined" ? window : globalThis);
