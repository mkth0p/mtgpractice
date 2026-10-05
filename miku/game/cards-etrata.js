/* Etrata, Deadly Fugitive (Dimir Assassins and face-down creatures) for the game engine: the cards
   of the list that no other deck defines, and `MK.ETRATA_DECK`, the deck a player can pilot from the
   Etrata section (it also sits at the table as a Bracket 3 bot).
   Card text follows the printed Oracle text. Where the engine simplifies a card, its `note` says how.
   Staples the list shares with the bot decks (Counterspell, Sol Ring, Toxic Deluge...) come from
   those files: cards-etrata.js loads before them, so it only defines what nobody else has. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const pc = s => MK.parseCost(s);
  const AI = () => MK.AI || {};

  /* ---------- helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isOpp = (g, p, q) => !!q && q !== p && g.opponents(p).includes(q);
  const mainWin = ctx => ctx.window === "main1" || ctx.window === "main2";
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(ctx.turnOf) === p;
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  /* Permanents that make creatures Assassins: Roshan (other creatures), and Leyline of
     Transformation / Arcane Adaptation (the chosen type is always Assassin here). */
  function makesAssassin(g, o) {
    for (const s of g.battlefield) {
      if (s.controller !== o.controller || !s.def.makesAssassins) continue;
      if (s.def.makesAssassins(g, s, o)) return true;
    }
    return false;
  }
  /* Is o an Assassin? Reads the card and the permanents above, never the full characteristics, so
     it is safe inside statics (Cover of Darkness, Ramses). */
  function isAssassin(g, o) {
    if (!o || !o.def) return false;
    if (o.def.changeling || o.def.subtypes.includes("Assassin")) return true;
    if (o.zone === "battlefield" && g.isCreature(o)) {
      if (makesAssassin(g, o)) return true;
      for (const s of g.battlefield) if (s.controller === o.controller && s.def.name === "Maskwood Nexus") return true;
    }
    return false;
  }
  MK.isAssassin = isAssassin;
  const faceDownMine = (g, p) => g.controlled(p, o => !!o.faceDown);
  const assassinCard = c => !!c && !!c.def && (c.def.changeling || c.def.subtypes.includes("Assassin"));

  /* ---------- bot helpers */
  function spellDanger(g, p, item) {
    if (!item || item.p === p) return 0;
    const d = item.o.def, ai = d.ai || {};
    let s = d.mv;
    if (item.faceDown) s = 2;
    if (ai.wipe) s += 8;
    if (ai.finisher) s += 8;
    if (ai.tutor) s += 2;
    if (ai.removal && item.targets.some(t => t && !g.isPlayer(t) && t.controller === p)) s += 5;
    if (item.o.isCommander) s += 3;
    return s;
  }
  const topOpp = (g, p) => { const t = g.stack[g.stack.length - 1]; return t && t.p !== p ? t : null; };
  /* Counterspell targeting: the most dangerous opposing spell among the options. */
  const counterPick = (g, p, req) => {
    if (req.purpose !== "counter" && req.purpose !== "etrataCounter") return undefined;
    const opts = req.options.filter(it => it && it.p !== p);
    if (!opts.length) return req.optional ? null : req.options[0];
    return opts.sort((a, b) => spellDanger(g, p, b) - spellDanger(g, p, a))[0];
  };
  /* Attack-target helpers. Opponents a creature can reach, and the ones with no untapped creature
     that could block it. */
  const oppTargets = (g, p, targets) => targets.filter(t => g.isPlayer(t) && isOpp(g, p, t));
  const openFor = (g, o, qs) => qs.filter(q => !g.creatures(q).some(b => !b.tapped && g.canBlock(b, o)));
  /* The creature to make unblockable (Access Tunnel, Rogue's Passage, Aqueous Form): Unstoppable
     Slasher first (its hit halves a life total), then Assassins, then the biggest. */
  const unblockRank = (g, c) => (c.def.name === "Unstoppable Slasher" ? 100 : 0) + (isAssassin(g, c) ? 10 : 0) + g.power(c);
  const slasherReady = (g, p) => g.creatures(p).some(c => c.def.name === "Unstoppable Slasher" && !c.sick && !c.tapped && !(c.counters.stun > 0) && !g.ch(c).unblockable && !openFor(g, c, g.opponents(p)).length);
  /* The opponent the Guildmage + Mindcrank loop kills: it drains life until the library is empty,
     so life at most library + 2; the lowest life first. */
  const guildVictim = (g, p, opts) => g.opponents(p).filter(q => (!opts || opts.includes(q)) && q.life <= q.library.length + 2).sort((a, b) => a.life - b.life)[0] || null;
  /* Turning face-down creatures into Assassins is the deck's engine: cast the first enabler ahead of
     everything else (Roshan, Arcane Adaptation, Leyline of Transformation, Maskwood Nexus). */
  const enablerCast = (g, p) => (g.controlled(p, s => !!s.def.makesAssassins || s.def.name === "Maskwood Nexus").length ? undefined : 24);
  const specSpell = (prompt, f) => ({ kind: "spell", purpose: "counter", prompt, filter: (g, item, p) => item.p !== p && (!f || f(item, g)) });
  const counterAi = { counter: true, target: counterPick };
  function counterIt(g, ctx) {
    const it = ctx.targets[0];
    if (!ctx.legal[0] || !it || !g.stack.includes(it)) return null;
    return g.counterSpell(it, ctx.o) ? it : null;
  }

  /* ================================================================ bot brain
     The plan the bots follow with the three Etrata lists (base, stage 1 and B4). Other decks that
     play Etrata, Deadly Fugitive (Corrupted Etrata) keep their own plans: every hook below checks
     the deck first. */
  const BRAIN_DECKS = new Set(["etrata", "etrata-aggro", "etrata-b4"]);
  const brainOn = p => !!p && BRAIN_DECKS.has(p.deckId) && !!p.agent && !!p.agent.bot;
  const onField = (g, p, name) => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === name);
  const hitOf = (g, a) => Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1);
  const HALVERS = ["Unstoppable Slasher", "Virtus the Veiled"];
  // the creatures that make the deck win: they stay out of risky fights
  const ENGINE = ["Ramses, Assassin Lord", "Interceptor, Shadow's Hound", "Roshan, Hidden Magister"];

  /* The brain's newer reads (gang blocks...) are gated so practice games recorded before them
     replay as they were played: `legacyBots` (engine < 4) and `legacyEtrata` (engine < 5). */
  const sharp = g => !(g.opts && (g.opts.legacyBots || g.opts.legacyEtrata));
  /* Several blockers on one attacker (ai.js gangFight): which blockers it kills and whether the
     ones left alive kill it. */
  function gangFight(g, a, bs) {
    const lethal = o => Math.max(1, g.lethalDamageLeft(o));
    const ds = g.kw(a, "double strike");
    let dmg = Math.max(0, g.power(a)) * (ds ? 2 : 1);
    const lost = [];
    for (const b of bs.slice().sort((x, y) => lethal(x) - lethal(y))) {
      const need = g.kw(a, "deathtouch") ? 1 : lethal(b);
      if (dmg <= 0) break;
      if (dmg >= need && !g.kw(b, "indestructible")) lost.push(b);
      dmg -= need;
    }
    const firstA = g.kw(a, "first strike") || ds;
    const hitters = bs.filter(b => !(firstA && lost.includes(b) && !g.kw(b, "first strike") && !g.kw(b, "double strike")));
    const sum = hitters.reduce((s, b) => s + Math.max(0, g.power(b)), 0);
    const aDies = !g.kw(a, "indestructible") && (sum >= lethal(a) || hitters.some(b => g.kw(b, "deathtouch") && g.power(b) > 0));
    return { aDies, lost };
  }
  /* How a bot defender blocks: the same tests as ai.js block(). It blocks with a creature that
     survives and kills the attacker, survives a 3-power hit, or trades up; it puts two blockers
     on an attacker they kill together when that's worth it (the only way to block menace); and it
     chumps the biggest attackers when the rest would kill it. A person may block anything, and
     menace only with two. Returns the attackers that get blocked; `evade` holds attackers we plan
     to make unblockable first. */
  function predictBlocks(g, q, attackers, evade) {
    const A = AI();
    const bot = !q.agent || !!q.agent.bot;
    const mine = g.creatures(q).filter(c => !c.tapped);
    const used = new Set(), blocked = new Set();
    const incoming = attackers.slice().sort((a, b) => g.power(b) - g.power(a));
    const canStop = (a, pool) => !pool.length ? false : bot ? !g.kw(a, "menace") : pool.filter(b => g.canBlock(b, a)).length >= (g.kw(a, "menace") ? 2 : 1);
    for (const a of incoming) {
      const pool = evade && evade.has(a) ? [] : mine.filter(b => !used.has(b.id) && g.canBlock(b, a));
      if (!pool.length || !canStop(a, pool)) continue;
      let best = null, bs = -1e9;
      for (const b of pool) {
        const f = A.fight(g, a, b);
        let s = -1e9;
        if (!f.bDies && f.aDies) s = 10;
        else if (!f.bDies && g.power(a) >= 3) s = 4;
        else if (f.bDies && f.aDies && A.value(g, b) + 1 < A.value(g, a)) s = 2;
        else if (!bot) s = 1;
        if (s > bs) { bs = s; best = b; }
      }
      if (best && bs > 0) { used.add(best.id); blocked.add(a); }
    }
    // two blockers that together kill an attacker worth more than what it kills back (engine 4
    // bots gang-block; a person may too). The only way to block menace.
    if (sharp(g)) {
      for (const a of incoming) {
        if (blocked.has(a) || (evade && evade.has(a))) continue;
        const cands = mine.filter(b => !used.has(b.id) && g.canBlock(b, a)).sort((x, y) => A.value(g, x) - A.value(g, y)).slice(0, 8);
        let best = null, bs = bot ? 1.5 : 0;
        for (let i = 0; i < cands.length; i++) for (let j = i + 1; j < cands.length; j++) {
          const r = gangFight(g, a, [cands[i], cands[j]]);
          if (!r.aDies) continue;
          const s = A.value(g, a) + (a.isCommander ? 2 : 0) - r.lost.reduce((t, b) => t + A.value(g, b), 0);
          if (s > bs) { bs = s; best = [cands[i], cands[j]]; }
        }
        if (best) { for (const b of best) used.add(b.id); blocked.add(a); }
      }
    }
    let rest = incoming.filter(a => !blocked.has(a));
    let guard = 0;
    while (rest.reduce((s, a) => s + hitOf(g, a), 0) >= q.life && guard++ < 20) {
      const a = rest.filter(x => !(evade && evade.has(x)) && canStop(x, mine.filter(b => !used.has(b.id) && g.canBlock(b, x))))[0];
      if (!a) break;
      const b = mine.find(c => !used.has(c.id) && g.canBlock(c, a));
      used.add(b.id); blocked.add(a);
      rest = rest.filter(x => x !== a);
    }
    return blocked;
  }
  /* What a group of attackers does to q: the damage that gets through and whether q is out after
     it (life, Slasher and Virtus halving what's left, Etrata the Silencer's third hit counter,
     Strixhaven Stadium's tenth point counter). */
  function attackOutcome(g, p, q, attackers, evade) {
    const blocked = predictBlocks(g, q, attackers, evade);
    const through = attackers.filter(a => !blocked.has(a));
    const dmg = through.reduce((s, a) => s + hitOf(g, a), 0);
    let life = q.life - dmg;
    for (const a of through) if (HALVERS.includes(a.def.name) && life > 0) life -= Math.ceil(life / 2);
    // Wound Reflection takes the life they lost this turn again at the end step
    if (onField(g, p, "Wound Reflection")) life -= (q.life - life) + (q.lifeLostThisTurn || 0);
    let kill = life <= 0;
    if (!kill && through.some(a => a.def.name === "Etrata, the Silencer") && g.hitCount(q) >= 2 && g.creatures(q).length) kill = true;
    const stadium = g.battlefield.find(o => o.controller === p && o.def.name === "Strixhaven Stadium");
    if (!kill && stadium && (stadium.counters.point || 0) + through.length >= 10) kill = true;
    return { blocked, through, dmg, kill };
  }
  /* What a hit with this attacker is worth beyond its damage: a cloaked card when it's an Assassin
     and Etrata is out, the cards the deck draws on a hit, its own hit trigger. */
  function hitGain(g, p, a) {
    const assassin = isAssassin(g, a);
    let s = hitOf(g, a);
    if (assassin && onField(g, p, "Etrata, Deadly Fugitive")) s += 3;
    if (assassin && (onField(g, p, "Ezio, Blade of Vengeance") || onField(g, p, "Mari, the Killing Quill"))) s += 1.5;
    if (g.kw(a, "deathtouch") && onField(g, p, "Black Widow, Deadly Hunter")) s += 1.5;
    if (!a.faceDown && a.def.triggers.some(t => t.on === "combatDamagePlayer")) s += 2;
    return s;
  }
  /* How good a creature is at home: deathtouch stops anything, toughness soaks a hit. */
  const blockWorth = (g, o) => (g.ch(o).cantBlock ? -10 : 0) + (g.kw(o, "deathtouch") ? 4 : 0) + Math.max(0, g.toughness(o)) + Math.max(0, g.power(o)) * 0.5;

  /* The attack. A kill comes first: with Ramses out, a player who dies after an Assassin attacked
     them wins the game, so everything goes at the player it can kill (the attackers the kill
     doesn't need stay home). Otherwise each attacker goes where it gets through (each hit cloaks a
     card and draws), and stays home where it would be blocked: a creature that stays back keeps
     the crack-back off us. When the table can hit us hard, the best blockers stay home too. */
  function etrataAttack(g, p, ctx) {
    if (!brainOn(p)) return undefined;
    const A = AI();
    const { candidates, targets } = ctx;
    const opps = g.opponents(p).filter(q => targets.includes(q) && !q.lost);
    if (!opps.length) return undefined;
    const ramses = onField(g, p, "Ramses, Assassin Lord");
    const able = candidates.filter(a => g.power(a) > 0);
    // 1. a kill
    let kill = null, ks = -1e9;
    for (const q of opps) {
      const r = attackOutcome(g, p, q, able);
      if (!r.kill) continue;
      if (ramses && !r.through.concat(able).some(a => g.hasSub(a, "Assassin"))) continue;
      const sc = (ramses ? 100 : 0) - q.life * 0.1;
      if (sc > ks) { ks = sc; kill = q; }
    }
    if (kill) {
      // keep home whatever the kill doesn't need: the engine pieces first, then the best blockers
      // (with Ramses, one Assassin must still attack that player)
      let team = able.slice();
      const order = able.slice().sort((x, y) => (ENGINE.includes(y.def.name) - ENGINE.includes(x.def.name)) || (blockWorth(g, y) - blockWorth(g, x)));
      for (const a of order) {
        const without = team.filter(x => x !== a);
        if (without.length && attackOutcome(g, p, kill, without).kill && (!ramses || without.some(x => g.hasSub(x, "Assassin")))) team = without;
      }
      return team.map(a => ({ attacker: a, target: kill }));
    }
    // 2. who gets through where. The target: with Ramses out, the player closest to dying (one kill
    // wins the game); otherwise the strongest player (biggest board and hand), healthier ones a bit less
    const bv = q => g.battlefield.filter(o => o.controller === q).reduce((s, o) => s + A.value(g, o), 0);
    const focus = ramses ? (q => q.life) : (q => -bv(q) * 0.6 - q.hand.length * 0.5 + q.life * 0.25);
    const plan = [];
    for (const a of able) {
      const open = opps.filter(q => !predictBlocks(g, q, [a]).has(a));
      if (!open.length) continue;
      let t = null;
      if (a.def.ai && a.def.ai.attackTarget) { try { t = a.def.ai.attackTarget(g, p, a, open); } catch (e) { t = null; } }
      if (!t || !open.includes(t)) t = open.slice().sort((x, y) => focus(x) - focus(y))[0];
      plan.push({ attacker: a, target: t, gain: hitGain(g, p, a) });
    }
    // 3. enough blockers stay home when the table can hit us hard
    const threatIn = Math.max(0, ...opps.map(q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((s, c) => s + Math.max(0, g.power(c)), 0)));
    if (p.life <= threatIn * 1.2 + 4) {
      const need = Math.max(1, Math.ceil(opps.reduce((n, q) => n + g.creatures(q).length, 0) / 3));
      const going = new Set(plan.map(d => d.attacker));
      let home = g.creatures(p).filter(c => !going.has(c) && !c.tapped && !g.ch(c).cantBlock).length;
      const pull = plan.filter(d => !g.kw(d.attacker, "vigilance") && !g.ch(d.attacker).cantBlock).sort((x, y) => (blockWorth(g, y.attacker) - y.gain * 0.5) - (blockWorth(g, x.attacker) - x.gain * 0.5));
      for (const d of pull) { if (home >= need) break; plan.splice(plan.indexOf(d), 1); home++; }
    }
    return plan.map(d => ({ attacker: d.attacker, target: d.target }));
  }

  /* Blocks: Ramses and Roshan don't block where they'd die, unless the hit would kill us. Then
     (engine 4 blocks) a spare deathtouch creature trades with a big attacker, and a face-down
     creature hiding a land or a cheap card chumps a big hit. */
  function etrataBlock(g, q, ctx) {
    if (!brainOn(q)) return undefined;
    // engine 4 games recorded before the smart blocks asked the brain keep their own blocks
    if (ctx.smart && !sharp(g)) return undefined;
    const A = AI();
    let blocks = ctx.blocks.slice();
    const lethal = list => ctx.attackers.filter(a => !list.some(b => b.attacker === a)).reduce((s, a) => s + hitOf(g, a), 0) >= q.life;
    for (const b of ctx.blocks) {
      if (!ENGINE.includes(b.blocker.def.name) || !A.fight(g, b.attacker, b.blocker).bDies) continue;
      const without = blocks.filter(x => x !== b);
      if (!lethal(without)) blocks = without;
    }
    if (ctx.smart) blocks = junkBlocks(g, q, ctx.attackers, dtBlocks(g, q, ctx.attackers, blocks));
    return blocks;
  }
  /* A face-down creature hiding a land or a cheap card (or a small token) does little else: it
     stands in front of a big hit. With life to spare it only meets the biggest hits; the lower
     our life, the smaller the hits it takes. */
  const junk = (g, c) => (c.faceDown && c.cardDef && (c.cardDef.types.includes("Land") || c.cardDef.mv <= (c.cardDef.types.includes("Creature") ? 2 : 3))) || (c.isToken && g.power(c) <= 2);
  /* A deathtouch creature that isn't an engine piece trades with the biggest attacker it can stop:
     Unstoppable Slasher even comes back. */
  function dtBlocks(g, q, attackers, blocks) {
    const A = AI();
    const used = new Set(blocks.map(b => b.blocker.id));
    const isBlocked = a => blocks.some(b => b.attacker === a);
    const pool = g.creatures(q).filter(c => !c.tapped && !used.has(c.id) && !g.ch(c).cantBlock && g.kw(c, "deathtouch") && g.power(c) > 0 && !ENGINE.includes(c.def.name) && !c.isCommander);
    const open = attackers.filter(a => !isBlocked(a) && !g.kw(a, "menace") && hitOf(g, a) >= 4).sort((x, y) => A.value(g, y) - A.value(g, x));
    for (const a of open) {
      const b = pool.find(c => !used.has(c.id) && g.canBlock(c, a) && A.fight(g, a, c).aDies && A.value(g, c) < A.value(g, a));
      if (!b) continue;
      used.add(b.id); blocks = blocks.concat([{ blocker: b, attacker: a }]);
    }
    return blocks;
  }
  function junkBlocks(g, q, attackers, blocks) {
    const used = new Set(blocks.map(b => b.blocker.id));
    const isBlocked = a => blocks.some(b => b.attacker === a);
    const pool = g.creatures(q).filter(c => !c.tapped && !used.has(c.id) && !g.ch(c).cantBlock && junk(g, c));
    if (!pool.length) return blocks;
    const open = attackers.filter(a => !isBlocked(a) && !g.kw(a, "menace") && !g.kw(a, "trample")).sort((x, y) => hitOf(g, y) - hitOf(g, x));
    let incoming = attackers.filter(a => !isBlocked(a)).reduce((s, a) => s + hitOf(g, a), 0);
    for (const a of open) {
      const hit = hitOf(g, a);
      const bar = q.life - incoming <= 15 ? 3 : q.life - incoming <= 25 ? 4 : 6;
      if (hit < bar) continue;
      const b = pool.find(c => !used.has(c.id) && g.canBlock(c, a));
      if (!b) continue;
      used.add(b.id); blocks = blocks.concat([{ blocker: b, attacker: a }]); incoming -= hit;
    }
    return blocks;
  }
  /* Who wears Swiftfoot Boots or Lightning Greaves: the piece the deck can least afford to lose. */
  const PROTECT = { "Ramses, Assassin Lord": 100, "Interceptor, Shadow's Hound": 70, "Roshan, Hidden Magister": 60, "Etrata, Deadly Fugitive": 40, "Black Widow, Deadly Hunter": 25, "Ezio, Blade of Vengeance": 25, "Achilles Davenport": 20 };
  const HEXERS = ["Swiftfoot Boots", "Lightning Greaves"];
  const protectRank = (g, c) => (PROTECT[c.def.name] || 0) + Math.max(0, g.power(c)) - (c.faceDown ? 5 : 0);
  // a creature already safe from targeted removal by something other than this equipment
  const shielded = (g, c, eq) => (g.kw(c, "hexproof") || g.kw(c, "shroud")) && !(eq && eq.attachedTo === c);
  /* Targets the deck picks itself: the equipment above, and Spark Double copies Ramses (a second
     "you win the game" trigger and +1/+1 lord) or the best engine piece. */
  const COPY = ["Ramses, Assassin Lord", "Interceptor, Shadow's Hound", "Achilles Davenport", "Ezio, Blade of Vengeance", "Black Widow, Deadly Hunter", "Roshan, Hidden Magister"];
  function etrataTargets(g, p, req) {
    if (!brainOn(p)) return undefined;
    const src = req.src;
    const ev = evadeWant.get(p);
    if (ev && ev.turn === g.turn && src && EVADE[src.def.name] && req.options.includes(ev.o)) return ev.o;
    if (req.purpose === "equip" && src && HEXERS.includes(src.def.name)) {
      return req.options.filter(c => c.controller === p && !shielded(g, c, src)).sort((a, b) => protectRank(g, b) - protectRank(g, a))[0];
    }
    if (req.purpose === "sparkCopy") {
      for (const n of COPY) { const c = req.options.find(x => !x.faceDown && x.def.name === n); if (c) return c; }
    }
    return undefined;
  }
  /* After blockers: turn an unblocked face-down creature face up when the card hits harder than a
     2/2 (its own cost or Etrata's {2}{U}{B}, whichever is cheaper), the biggest first. */
  function combatFlip(g, p, acts) {
    let best = null, bs = 1;
    for (const a of acts) {
      if (a.type !== "activate" || !a.ab || !(a.ab.faceUp || a.ab.etrata)) continue;
      const o = a.card;
      if (!o.faceDown || !o.combat || !o.combat.attacking || o.combat.wasBlocked) continue;
      const d = o.cardDef;
      if (!d.types.includes("Creature") || !d.pt) continue;
      const gain = (d.pt[0] || 0) - 2 + (d.keywords.includes("double strike") ? d.pt[0] : 0);
      const cost = MK.util.costMV(g.abilityCost(p, o, a.ab, 0));
      const s = gain - cost * 0.1;
      if (gain >= 2 && s > bs) { bs = s; best = a; }
    }
    return best ? { type: "activate", card: best.card, idx: best.idx } : null;
  }
  /* Creatures that change this turn's combat: lords and type changers (statics), and the ones that
     draw when another creature connects. The rest can wait for the second main phase. */
  const ON_HIT = ["Black Widow, Deadly Hunter", "Ezio, Blade of Vengeance", "Mari, the Killing Quill", "Gix, Yawgmoth Praetor", "Grazilaxx, Illithid Scholar", "Glitch Interpreter", "Spark Double"];
  const combatCard = d => !d.types.includes("Creature") || d.keywords.includes("haste") || d.keywords.includes("flash") || d.statics.length > 0 || !!d.makesAssassins || ON_HIT.includes(d.name);
  /* A face-down attacker we could turn face up into something bigger, and the mana to do it. */
  function flipReady(g, p) {
    const etrata = onField(g, p, "Etrata, Deadly Fugitive");
    const mana = manaNow(g, p);
    return g.creatures(p).some(o => {
      if (!o.faceDown || o.tapped || (o.sick && !g.kw(o, "haste"))) return false;
      const d = o.cardDef;
      if (!d.types.includes("Creature") || !d.pt || d.pt[0] < 4) return false;
      return (etrata && mana >= 4) || (d.cost && g.canPay(p, d.costObj, { for: "special" }));
    });
  }
  /* The first main phase holds the creatures that don't change this combat while a face-down
     attacker could be turned face up in it: the mana stays open for the flip, and they come down
     in the second main phase. */
  function etrataCast(g, p, o, ctx) {
    if (!brainOn(p) || ctx.window !== "main1" || g.active !== p || o.isCommander) return undefined;
    if (combatCard(o.def)) return undefined;
    return flipReady(g, p) ? false : undefined;
  }
  /* Before combat: when one more unblockable attacker turns this attack into a kill, make it so
     (Rogue's Passage, Access Tunnel, Key to the City, or Brotherhood Regalia's equip). */
  const EVADE = { "Rogue's Passage": () => true, "Access Tunnel": (g, c) => g.power(c) <= 3, "Key to the City": () => true, "Brotherhood Regalia": () => true };
  const evadeWant = new WeakMap();
  function evasionPlan(g, p, acts) {
    const able = g.creatures(p).filter(c => g.canAttack(c, p) && g.power(c) > 0);
    const opps = g.opponents(p).filter(q => !q.lost);
    if (!able.length || opps.some(q => attackOutcome(g, p, q, able).kill)) return null;
    for (const a of acts) {
      if (a.type !== "activate" || !EVADE[a.card.def.name] || (a.card.def.name === "Brotherhood Regalia" && a.ab.label !== "Equip" && a.ab.label !== "Equip legendary creature")) continue;
      for (const c of able) {
        if (g.ch(c).unblockable || !EVADE[a.card.def.name](g, c) || (a.ab.label === "Equip legendary creature" && !c.def.legendary)) continue;
        if (a.card.def.name === "Key to the City" && p.hand.length < 1) continue;
        if (opps.some(q => attackOutcome(g, p, q, able, new Set([c])).kill)) {
          evadeWant.set(p, { o: c, turn: g.turn });
          return { type: "activate", card: a.card, idx: a.idx };
        }
      }
    }
    return null;
  }
  /* The plan outside the attack: after blockers, turn unblocked face-down attackers face up; in the
     first main phase, move Boots or Greaves onto the piece that matters most when it's bare, and
     make an attacker unblockable when that sets up a kill. */
  function etrataPlan(g, p, o, ctx) {
    if (!brainOn(p)) return null;
    const win = ctx.window, acts = ctx.actions || [];
    if (win === "combat" && g.active === p && g.phase === "damage") return combatFlip(g, p, acts);
    if (win === "main1" && g.active === p) {
      for (const eq of g.controlled(p, x => HEXERS.includes(x.def.name))) {
        const act = acts.find(a => a.type === "activate" && a.card === eq && a.ab && a.ab.label === "Equip");
        if (!act) continue;
        const want = g.creatures(p).filter(c => !shielded(g, c, eq) && g.canTarget(p, c)).sort((a, b) => protectRank(g, b) - protectRank(g, a))[0];
        const cur = eq.attachedTo && eq.attachedTo.zone === "battlefield" ? eq.attachedTo : null;
        if (!want || want === cur || (PROTECT[want.def.name] || 0) < 20) continue;
        if (cur && protectRank(g, cur) >= protectRank(g, want)) continue;
        return { type: "activate", card: eq, idx: act.idx };
      }
      return evasionPlan(g, p, acts);
    }
    return null;
  }

  /* What the deck's tutors fetch: a land while short of them, then Ramses (a player who dies after
     an Assassin attacked them wins the game), then Interceptor and Roshan (menace for Assassins and
     for face-down creatures, and the bots never block menace), then whatever else turns hits into
     cards and kills. Other decks' tutors (Demonic Tutor, Imperial Seal) ask MK.DECK_TUTORS. */
  const TUTOR_WANT = ["Ramses, Assassin Lord", "Interceptor, Shadow's Hound", "Roshan, Hidden Magister", "Etrata, the Silencer", "Black Widow, Deadly Hunter", "Ezio, Blade of Vengeance", "Achilles Davenport",
    "Unstoppable Slasher", "Virtus the Veiled", "Rhystic Study", "Cover of Darkness", "Maskwood Nexus", "Leyline of Transformation", "Arcane Adaptation", "Mari, the Killing Quill"];
  function etrataTutorPick(g, p, cands) {
    if (!cands.length) return null;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (lands < 3 && !p.hand.some(c => c.def.types.includes("Land"))) {
      const l = cands.find(c => c.def.types.includes("Land") && !c.def.supertypes.includes("Basic")) || cands.find(c => c.def.types.includes("Land"));
      if (l) return l;
    }
    const have = n => g.battlefield.some(o => o.controller === p && !o.faceDown && o.def.name === n) || p.hand.some(c => c.def.name === n);
    // a player with two hit counters dies to Etrata, the Silencer's next hit
    if (g.opponents(p).some(q => g.hitCount(q) >= 2) && !have("Etrata, the Silencer")) {
      const si = cands.find(x => x.def.name === "Etrata, the Silencer");
      if (si) return si;
    }
    // a second Assassin enabler is only worth it without the first
    const enabled = g.battlefield.some(o => o.controller === p && (o.def.makesAssassins || o.def.name === "Maskwood Nexus")) || p.hand.some(c => c.def.makesAssassins || c.def.name === "Maskwood Nexus");
    for (const n of TUTOR_WANT) {
      if (have(n)) continue;
      if (enabled && ["Maskwood Nexus", "Leyline of Transformation", "Arcane Adaptation"].includes(n)) continue;
      const c = cands.find(x => x.def.name === n);
      if (c) return c;
    }
    return null;
  }
  MK.DECK_TUTORS = MK.DECK_TUTORS || {};
  MK.DECK_TYPES = MK.DECK_TYPES || {};
  for (const id of BRAIN_DECKS) { MK.DECK_TUTORS[id] = etrataTutorPick; MK.DECK_TYPES[id] = "Assassin"; }
  // for the tests (tools/sim/test-etrata.js)
  MK.ETRATA_BRAIN = { decks: BRAIN_DECKS, predictBlocks, attackOutcome, attack: etrataAttack, tutorPick: etrataTutorPick };

  /* Etrata's ability for her face-down creatures. It isn't a special action, so Training Grounds
     makes it {U}{B}. */
  const ETRATA_UP = {
    label: "Etrata: turn face up, or exile and cast it", cost: "{2}{U}{B}", etrata: true,
    do: async (g, src, ctx) => {
      const p = ctx.p;
      if (src.zone !== "battlefield" || !src.faceDown) return;
      if (g.canTurnFaceUp(src)) { g.turnFaceUp(src); return; }
      const card = src.cardDef;
      g.exile(src, src);
      if (src.zone !== "exile") return;
      log(g, `${p.name} can't turn it face up: ${card.name} is exiled.`, p, [card.name]);
      if (card.types.includes("Land")) return;
      const ok = await g.ask(p, { type: "confirm", prompt: `Cast ${card.name} without paying its mana cost?`, src, purpose: "etrataCast", card: src });
      if (ok) await g.castWithoutPaying(p, src);
    },
    ai: { use: (g, p, o, ctx) => etrataUpUse(g, p, o, ctx), inStack: true }
  };
  function etrataUpUse(g, p, o, ctx) {
    const d = o.cardDef;
    if (!d || d.types.includes("Land")) return false;
    const t = d.types;
    if (t.includes("Instant") || t.includes("Sorcery")) {
      const ai = d.ai || {};
      if (ai.counter) { const top = topOpp(g, p); return ctx.window === "stack" && !!top && spellDanger(g, p, top) >= 5; }
      if (ai.removal) return (mainWin(ctx) || endBeforeMe(g, p, ctx)) && g.battlefield.some(c => c.controller !== p && g.isCreature(c) && AI().threat && AI().threat(g, c, p) >= 5);
      if (ai.wipe) return false;
      return mainWin(ctx) || endBeforeMe(g, p, ctx);
    }
    if (!(mainWin(ctx) || endBeforeMe(g, p, ctx))) return false;
    if (t.includes("Creature")) return d.mv >= 5 || !g.canPay(p, d.costObj, { for: "special" });
    return true;   // artifacts and enchantments: a free permanent
  }

  /* Tokens */
  T.etrataShapeshifter = MK.tokenDef({ key: "etrata-shapeshifter", name: "Shapeshifter", pt: [2, 2], colors: "U", subtypes: ["Shapeshifter"], changeling: true, text: "Changeling" });

  /* ================================================================ commander */
  D({
    name: "Etrata, Deadly Fugitive", cost: "{1}{U}{B}", type: "Legendary Creature — Vampire Assassin", pt: "1/4",
    keywords: ["deathtouch"],
    text: "Deathtouch\nFace-down creatures you control have \"{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.\"\nWhenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library.",
    statics: [{ applies: (g, s, o) => mine(s, o) && !!o.faceDown, grantAbilities: [ETRATA_UP] }],
    triggers: [{
      on: "combatDamagePlayer",
      when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && isOpp(g, s.controller, ev.p) && isAssassin(g, ev.src),
      do: (g, s, ev, { p }) => { if (!ev.p.lost) g.cloakTop(p, ev.p, s); }
    }],
    ai: {
      priority: 9,
      attackPlan: etrataAttack, blockPlan: etrataBlock, targetPlan: etrataTargets, castPlan: etrataCast, plan: etrataPlan,
      // every Assassin that connects cloaks a card, so a face-down or cheap Assassin trading is fine
      pushAttack: (g, p, a) => isAssassin(g, a) && (!!a.faceDown || g.power(a) <= 2) && a.def.name !== "Etrata, Deadly Fugitive",
      // she's the engine: attack only where no untapped blocker can kill her
      attack: (g, p, o, blockers) => (blockers.some(b => (AI().fight ? AI().fight(g, o, b).aDies : true)) ? false : undefined)
    }
  });

  /* ================================================================ creatures */
  D({
    name: "Omen Hawker", cost: "{U}", type: "Creature — Advisor Octopus", pt: "1/1",
    text: "{T}: Add {C}{U}. Spend this mana only to activate abilities.",
    note: "Its mana is only offered for activated abilities (Etrata's, equip, Scroll of Fate), never for spells or for turning a card face up.",
    mana: [{ tap: true, produce: "CU", onlyFor: "ability" }],
    ai: { priority: 6, ramp: true }
  });
  D({
    name: "Changeling Outcast", cost: "{B}", type: "Creature — Shapeshifter", pt: "1/1", changeling: true,
    keywords: ["changeling"],
    text: "Changeling (This card is every creature type.)\nThis creature can't block and can't be blocked.",
    cantBlock: true,
    statics: [{ applies: (g, s, o) => o === s, unblockable: true }],
    ai: { priority: 7 }
  });
  D({
    name: "Mothdust Changeling", cost: "{U}", type: "Creature — Shapeshifter", pt: "1/1", changeling: true,
    keywords: ["changeling"],
    text: "Changeling (This card is every creature type.)\nTap an untapped creature you control: This creature gains flying until end of turn.",
    abilities: [{
      label: "Gain flying", tapCreatures: 1,
      condition: (g, o) => !g.kw(o, "flying"),
      do: (g, src) => { if (src.zone === "battlefield") g.grant(src, ["flying"]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !o.sick && !o.tapped && g.creatures(p).some(c => c !== o && !c.tapped && c.sick) }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Universal Automaton", cost: "{1}", type: "Artifact Creature — Shapeshifter", pt: "1/1", changeling: true,
    keywords: ["changeling"],
    text: "Changeling (This card is every creature type.)",
    ai: { priority: 5 }
  });
  D({
    name: "Hookblade Veteran", cost: "{U}", type: "Creature — Human Assassin", pt: "1/2",
    text: "During your turn, this creature has flying. (It can't be blocked except by creatures with flying or reach.)",
    statics: [{ applies: (g, s, o) => o === s && g.active === s.controller, kw: ["flying"] }],
    ai: { priority: 6 }
  });
  D({
    name: "Brotherhood Spy", cost: "{1}{U}", type: "Creature — Human Assassin", pt: "1/3",
    text: "At the beginning of combat on your turn, if you control a legendary Assassin, this creature gets +1/+0 until end of turn and can't be blocked this turn.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
      intervening: (g, s) => g.controlled(s.controller, o => o.def.legendary && g.isCreature(o) && isAssassin(g, o)).length > 0,
      do: (g, s) => { if (s.zone !== "battlefield") return; g.pump(s, 1, 0); g.addEffect({ objs: [s], unblockable: true }); }
    }],
    ai: { priority: 6 }
  });
  const mvKinds = p => new Set(p.graveyard.map(c => c.def.mv)).size;
  D({
    name: "Aven Heartstabber", cost: "{U}{B}", type: "Creature — Bird Assassin", pt: "1/1",
    keywords: ["flying"],
    text: "Flying\nAs long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2 and has deathtouch.\nWhen this creature dies, mill two cards, then draw a card.",
    statics: [{ applies: (g, s, o) => o === s && mvKinds(s.controller) >= 5, pt: [2, 2], kw: ["deathtouch"] }],
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => { g.mill(p, 2); g.draw(p, 1); } }],
    ai: { priority: 6 }
  });
  D({
    name: "Desmond Miles", cost: "{1}{B}", type: "Legendary Creature — Human Assassin", pt: "1/3",
    keywords: ["menace"],
    text: "Menace\nDesmond Miles gets +1/+0 for each other Assassin you control and each Assassin card in your graveyard.\nWhenever Desmond Miles deals combat damage to a player, surveil X, where X is the amount of damage it dealt to that player.",
    cda: (g, o) => [1 + g.controlled(o.controller, c => c !== o && g.isCreature(c) && isAssassin(g, c)).length + o.controller.graveyard.filter(assassinCard).length, null],
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.surveil(p, ev.amount, s) }],
    ai: { priority: 7 }
  });
  const historic = c => c.def.types.includes("Artifact") || c.def.legendary || !!c.def.saga;
  D({
    name: "Basim Ibn Ishaq", cost: "{U}{B}", type: "Legendary Creature — Human Assassin", pt: "2/2",
    text: "Whenever you cast a historic spell, draw a card. Basim Ibn Ishaq can't be blocked this turn. This ability triggers only once each turn. (Artifacts, legendaries, and Sagas are historic.)\nWhenever Basim Ibn Ishaq deals combat damage to a player, put a +1/+1 counter on it.",
    triggers: [
      {
        on: "cast", when: (g, s, ev) => ev.p === s.controller && !(ev.item && ev.item.faceDown) && historic(ev.o) && s.state.basim !== g.turn,
        do: (g, s, ev, { p }) => { s.state.basim = g.turn; g.draw(p, 1); if (s.zone === "battlefield") g.addEffect({ objs: [s], unblockable: true }); }
      },
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s) => g.addCounters(s, "p1", 1, s) }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Silent Hallcreeper", cost: "{1}{U}", type: "Enchantment Creature — Horror", pt: "1/1",
    text: "This creature can't be blocked.\nWhenever this creature deals combat damage to a player, choose one that hasn't been chosen —\n• Put two +1/+1 counters on this creature.\n• Draw a card.\n• This creature becomes a copy of another target creature you control.",
    statics: [{ applies: (g, s, o) => o === s, unblockable: true }],
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && (s.state.modes || []).length < 3,
      do: async (g, s, ev, { p }) => {
        const used = s.state.modes || (s.state.modes = []);
        const others = g.creatures(p).filter(c => c !== s && !c.faceDown);
        const options = [
          { id: 0, label: "Put two +1/+1 counters on it" },
          { id: 1, label: "Draw a card" },
          { id: 2, label: "Become a copy of another creature you control" }
        ].filter(m => !used.includes(m.id) && (m.id !== 2 || others.length));
        if (!options.length) return;
        const m = options.length === 1 ? options[0].id : await g.ask(p, { type: "option", prompt: "Silent Hallcreeper: choose one that hasn't been chosen", options, purpose: "hallcreeper", src: s });
        const mode = options.some(o => o.id === m) ? m : options[0].id;
        used.push(mode);
        if (mode === 0) g.addCounters(s, "p1", 2, s);
        else if (mode === 1) g.draw(p, 1);
        else {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "copy", prompt: "Silent Hallcreeper becomes a copy of", filter: (g2, c) => c !== s && !c.faceDown }), s);
          if (t && s.zone === "battlefield") { s.def = t.copyDef || t.def; g.ts++; g.bump(); log(g, `Silent Hallcreeper becomes a copy of ${t.def.name}.`, p, [t.def.name]); }
        }
      }
    }],
    ai: {
      priority: 7,
      option: (g, p, req) => {
        const ids = req.options.map(o => o.id);
        const src = req.src;
        const best = g.creatures(p).filter(c => c !== src && !c.faceDown && !c.def.legendary).sort((a, b) => AI().value(g, b) - AI().value(g, a))[0];
        if (ids.includes(2) && best && AI().value(g, best) >= 8) return 2;
        if (ids.includes(0)) return 0;
        return ids.includes(1) ? 1 : ids[0];
      },
      target: (g, p, req) => req.purpose === "copy" ? req.options.filter(c => !c.def.legendary).sort((a, b) => AI().value(g, b) - AI().value(g, a))[0] || req.options[0] : undefined
    }
  });
  D({
    name: "Unstoppable Slasher", cost: "{2}{B}", type: "Creature — Zombie Assassin", pt: "2/3",
    keywords: ["deathtouch"],
    text: "Deathtouch\nWhenever this creature deals combat damage to a player, they lose half their life, rounded up.\nWhen this creature dies, if it had no counters on it, return it to the battlefield tapped under its owner's control with two stun counters on it.",
    triggers: [
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev) => { const q = ev.p; if (!q.lost && q.life > 0) g.loseLife(q, Math.ceil(q.life / 2), s); } },
      {
        on: "dies", self: true, intervening: (g, s, ev) => !Object.values((ev.lki && ev.lki.counters) || {}).some(n => n > 0),
        do: (g, s) => {
          if (s.zone !== "graveyard") return;
          g.putOntoBattlefield([s], s.owner, { tapped: true });
          if (s.zone === "battlefield") { s.counters.stun = 2; g.bump(); log(g, `Unstoppable Slasher returns tapped with two stun counters.`, s.owner, [s.def.name]); }
        }
      }
    ],
    ai: {
      priority: 8, threat: 3,
      // halving the biggest life total does the most; an open player first so it connects
      attackTarget: (g, p, o, targets) => { const qs = oppTargets(g, p, targets), open = openFor(g, o, qs); return (open.length ? open : qs).sort((a, b) => b.life - a.life)[0]; },
      attack: (g, p, o, blockers) => (!blockers.length ? true : undefined),
      unblock: (g, p, o) => !(o.counters.stun > 0) && !g.ch(o).unblockable && !openFor(g, o, g.opponents(p)).length
    }
  });
  D({
    name: "Ramses, Assassin Lord", cost: "{2}{U}{B}", type: "Legendary Creature — Human Assassin", pt: "4/4",
    keywords: ["deathtouch"],
    text: "Deathtouch\nOther Assassins you control get +1/+1.\nWhenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && isAssassin(g, o), pt: [1, 1] }],
    triggers: [{
      on: "playerLost",
      when: (g, s, ev) => ev.p !== s.controller && (ev.p.attackedBy || []).some(a => a.by === s.controller && a.assassin && a.turn === g.turn),
      do: (g, s, ev, { p }) => { if (!g.over && !p.lost) g.win(p, "Ramses, Assassin Lord"); }
    }],
    ai: { priority: 8, threat: 3 }
  });
  D({
    name: "Roshan, Hidden Magister", cost: "{3}{B}", type: "Legendary Creature — Human Assassin", pt: "4/4",
    text: "Other creatures you control are Assassins in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.\nFace-down creatures you control have menace.\nWhenever a permanent you control is turned face up, you draw a card and you lose 1 life.",
    note: "Only creatures on the battlefield become Assassins (nothing in this deck cares about Assassin cards elsewhere except Desmond Miles).",
    makesAssassins: (g, s, o) => o !== s,
    statics: [
      { applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o), subtypes: ["Assassin"] },
      { applies: (g, s, o) => mine(s, o) && !!o.faceDown, kw: ["menace"] }
    ],
    triggers: [{ on: "turnedFaceUp", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { g.draw(p, 1); g.loseLife(p, 1, s); } }],
    ai: { priority: 8, cast: enablerCast }
  });
  D({
    name: "Etrata, the Silencer", cost: "{2}{U}{B}", type: "Legendary Creature — Vampire Assassin", pt: "3/5",
    text: "Etrata can't be blocked.\nWhenever Etrata deals combat damage to a player, exile target creature that player controls and put a hit counter on that card. That player loses the game if they own three or more exiled cards with hit counters on them. Etrata's owner shuffles Etrata into their library.",
    note: "Before the trigger resolves you get a window to respond (phase her out with March of Swirling Mist and she stays).",
    statics: [{ applies: (g, s, o) => o === s, unblockable: true }],
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, respond: true,
      do: async (g, s, ev, { p }) => {
        const q = ev.p;
        if (!q.lost) {
          const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", prompt: `Etrata, the Silencer: exile a creature ${q.name} controls`, filter: (g2, c) => c.controller === q }), s);
          if (t && t.zone === "battlefield") g.exileWithHit(t, s);
          if (!q.lost && g.hitCount(q) >= 3) { log(g, `${q.name} owns three exiled cards with hit counters.`, q, [s.def.name]); g.lose(q, "alt"); }
        }
        if (s.zone === "battlefield") { g.tuck(s, false); g.shuffle(s.owner); log(g, `${s.owner.name} shuffles Etrata, the Silencer into their library.`, s.owner, [s.def.name]); }
      }
    }],
    ai: {
      priority: 8, threat: 4,
      // three hit counters on one player wins, so keep hitting whoever has the most (and has a creature to exile)
      attackTarget: (g, p, o, targets) => oppTargets(g, p, targets).filter(q => g.creatures(q).length).sort((a, b) => (g.hitCount(b) - g.hitCount(a)) || (a.life - b.life))[0],
      attack: () => true
    }
  });
  D({
    name: "Kheru Spellsnatcher", cost: "{3}{U}", type: "Creature — Wizard Snake", pt: "3/3",
    morph: "{4}{U}{U}",
    text: "Morph {4}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may cast that card without paying its mana cost for as long as it remains exiled.",
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: async (g, s, ev, { p }) => {
        const it = await g.chooseTarget(p, trig({ kind: "spell", purpose: "counter", prompt: "Kheru Spellsnatcher: counter target spell", filter: (g2, item, pl) => item.p !== pl }), s);
        if (!it || !g.stack.includes(it)) return;
        const card = it.o, copy = it.isCopy;
        if (!g.counterSpell(it, s) || copy) return;
        if (card.zone === "graveyard" || card.zone === "command") {
          g.moveTo(card, "exile");
          if (card.zone === "exile") { card.playable = { by: p, free: true, forever: true }; log(g, `${card.def.name} is exiled. ${p.name} may cast it for free.`, p, [card.def.name]); }
        }
      }
    }],
    faceUpAi: { inStack: true, use: (g, p, o, ctx) => { const top = topOpp(g, p); return ctx.window === "stack" && !!top && spellDanger(g, p, top) >= 5; } },
    ai: { priority: 5, target: counterPick, morph: (g, p) => g.turn >= 6 ? 13 : -1, cast: (g, p) => (g.turn >= 6 ? false : undefined) }
  });
  D({
    name: "Willbender", cost: "{1}{U}", type: "Creature — Human Wizard", pt: "1/2",
    morph: "{1}{U}",
    text: "Morph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, change the target of target spell or ability with a single target.",
    triggers: [{
      on: "turnedFaceUp", self: true,
      do: async (g, s, ev, { p }) => {
        const it = await g.chooseTarget(p, trig({ kind: "spell", orAbility: true, purpose: "redirect", prompt: "Willbender: change the target of target spell or ability", filter: (g2, item) => item.targets.length === 1 && !!item.targets[0] }), s);
        if (!it || !g.stack.includes(it)) return;
        const spec = g.stackTargets(it)[0];
        if (!spec) return;
        const opts = g.targetOptions(it.p, spec, it.o).filter(t => t !== it.targets[0]);
        if (!opts.length) { log(g, `Willbender finds no other target for ${it.name}.`, p); return; }
        const pick = await g.ask(p, { type: "target", prompt: `New target for ${it.name}`, options: opts, purpose: "willbenderNew", src: s, item: it });
        if (pick && opts.includes(pick)) { it.targets[0] = pick; g.bump(); log(g, `Willbender changes the target of ${it.name} to ${g.nameOf(pick)}.`, p, ["Willbender"]); }
      }
    }],
    faceUpAi: { inStack: true, use: (g, p, o, ctx) => (ctx.window === "stack" || ctx.window === "ability") && willbenderWorth(g, p) },
    ai: {
      priority: 5, morph: (g, p) => 11, cast: () => false,
      target: (g, p, req) => {
        if (req.purpose === "redirect") { const top = topOpp(g, p); return top && req.options.includes(top) ? top : undefined; }
        if (req.purpose === "willbenderNew") {
          const it = req.item;
          if (it && it.kind === "spell" && req.options.some(t => t && t.kind === "spell")) return req.options.find(t => t && t.kind === "spell" && t.p !== p) || req.options[0];
          const opp = req.options.filter(t => !g.isPlayer(t) && t.controller !== p).sort((a, b) => AI().threat(g, b, p) - AI().threat(g, a, p));
          return opp[0] || req.options.find(t => g.isPlayer(t) && t !== p) || req.options[0];
        }
        return undefined;
      }
    }
  });
  function willbenderWorth(g, p) {
    const top = topOpp(g, p);
    if (!top || top.targets.length !== 1) return false;
    const t = top.targets[0];
    if (!t) return false;
    if (t.kind === "spell") return t.p === p;
    if (g.isPlayer(t)) return false;
    return t.controller === p && AI().value(g, t) >= 4;
  }
  D({
    name: "Duskmantle Guildmage", cost: "{U}{B}", type: "Creature — Human Wizard", pt: "2/2",
    text: "{1}{U}{B}: Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.\n{2}{U}{B}: Target player mills two cards.",
    abilities: [
      {
        label: "This turn, cards to opponents' graveyards cost them life", cost: "{1}{U}{B}",
        do: (g, src, ctx) => {
          const p = ctx.p;
          g.tempTriggers.push({ controller: p, def: { name: "Duskmantle Guildmage", triggers: [{
            on: "putInGraveyard", when: (g2, t, ev) => ev.p !== t.controller && g2.opponents(t.controller).includes(ev.p),
            do: (g2, t, ev) => { if (!ev.p.lost) g2.loseLife(ev.p, 1, { def: { name: "Duskmantle Guildmage" }, controller: p }); }
          }] } });
          g.ts++; g.bump();
          log(g, `${p.name}: this turn, each card put into an opponent's graveyard costs them 1 life.`, p, ["Duskmantle Guildmage"]);
        },
        ai: { use: (g, p, o, ctx) => ctx.window === "main1" && o.state.dusk !== g.turn && g.controlled(p, c => c.def.name === "Mindcrank").length > 0 && (o.state.dusk = g.turn) }
      },
      {
        label: "Target player mills two", cost: "{2}{U}{B}",
        targets: [{ kind: "player", purpose: "harm", prompt: "Mill two cards" }],
        do: (g, src, ctx) => { const q = ctx.targets[0]; if (q && ctx.legal[0] && !q.lost) { g.mill(q, 2); log(g, `${q.name} mills two cards.`, ctx.p, ["Duskmantle Guildmage"]); } },
        ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && manaNow(g, p) >= 6 }
      }
    ],
    ai: {
      priority: 6,
      // With Mindcrank out, the life-loss ability plus "mills two" loops until that player is dead or
      // out of cards. Do it after combat, so Ramses sees an attacked player lose.
      plan: (g, p, o, ctx) => {
        if (ctx.window !== "main2" || !g.controlled(p, c => c.def.name === "Mindcrank").length) return null;
        if (!guildVictim(g, p)) return null;
        const live = o.state.dusk === g.turn;
        const act = ctx.actions.find(a => a.type === "activate" && a.card === o && a.idx === (live ? 1 : 0));
        if (!act || (!live && manaNow(g, p) < 7)) return null;
        if (!live) o.state.dusk = g.turn;
        return { type: "activate", card: o, idx: act.idx };
      },
      target: (g, p, req) => {
        if (req.purpose !== "harm" || !req.options.some(t => g.isPlayer(t))) return undefined;
        return guildVictim(g, p, req.options) || undefined;
      }
    }
  });
  D({
    name: "Gix, Yawgmoth Praetor", cost: "{1}{B}{B}", type: "Legendary Creature — Praetor Phyrexian", pt: "3/3",
    text: "Whenever a creature deals combat damage to one of your opponents, its controller may pay 1 life. If they do, they draw a card.\n{4}{B}{B}{B}, Discard X cards: Exile the top X cards of target opponent's library. You may play lands and cast spells from among cards exiled this way without paying their mana costs.",
    note: "The first ability only helps you (other players' creatures hitting your opponents don't draw them cards).",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && isOpp(g, s.controller, ev.p),
      optional: "Gix: pay 1 life to draw a card?",
      do: (g, s, ev, { p }) => { if (g.payLife(p, 1)) g.draw(p, 1); }
    }],
    abilities: [{
      label: "Discard X: exile their top X, play them free", cost: "{4}{B}{B}{B}",
      targets: [{ kind: "opponent", purpose: "harm", prompt: "Exile the top cards of" }],
      condition: (g, o, p) => p.hand.length > 0,
      do: async (g, src, ctx) => {
        const p = ctx.p, q = ctx.targets[0];
        if (!q || !ctx.legal[0] || q.lost) return;
        const max = p.hand.length;
        const x = Math.max(0, Math.min(max, (await g.ask(p, { type: "number", prompt: "Gix: discard how many cards (X)?", min: 1, max, purpose: "gixX", src })) | 0));
        const out = x ? await g.ask(p, { type: "cards", prompt: `Discard ${x}`, options: p.hand.slice(), min: x, max: x, purpose: "discard", src }) : [];
        const disc = (out || []).filter(c => p.hand.includes(c)).slice(0, x);
        for (const c of disc) g.discard(p, c);
        const top = q.library.slice(0, disc.length);
        for (const c of top) { g.moveTo(c, "exile"); if (c.zone === "exile") c.playable = { by: p, free: !c.def.types.includes("Land"), forever: true }; }
        if (top.length) log(g, `${p.name} exiles ${top.map(c => c.def.name).join(", ")} from ${q.name}'s library and may play them for free.`, p, top.map(c => c.def.name));
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && p.hand.length >= 2 }
    }],
    ai: { priority: 8, confirm: (g, p) => p.life > 8 }
  });
  D({
    name: "Glitch Interpreter", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "2/3",
    text: "When this creature enters, if you control no face-down permanents, return this creature to its owner's hand and manifest dread.\nWhenever one or more colorless creatures you control deal combat damage to a player, draw a card.",
    triggers: [
      {
        on: "enters", self: true, intervening: (g, s) => faceDownMine(g, s.controller).length === 0,
        do: async (g, s, ev, { p }) => { if (s.zone === "battlefield") g.bounce(s); await g.manifestDread(p, s); }
      },
      {
        on: "combatDamageStep", when: (g, s, ev) => ev.hits.some(h => h.controller === s.controller && h.src.zone === "battlefield" && g.isCreature(h.src) && g.colorsOf(h.src).size === 0),
        do: (g, s, ev, { p }) => g.draw(p, 1)
      }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Grazilaxx, Illithid Scholar", cost: "{1}{U}{U}", type: "Legendary Creature — Horror", pt: "3/2",
    text: "Whenever a creature you control becomes blocked, you may return it to its owner's hand.\nWhenever one or more creatures you control deal combat damage to a player, draw a card.",
    triggers: [
      {
        on: "blocked", when: (g, s, ev) => !!ev.o && ev.o.controller === s.controller,
        optional: "Grazilaxx: return the blocked creature to its owner's hand?",
        do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.bounce(ev.o); }
      },
      { on: "combatDamageStep", when: (g, s, ev) => ev.hits.some(h => h.controller === s.controller), do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: {
      priority: 7,
      confirm: (g, p, req) => {
        const a = req.ev && req.ev.o;
        if (!a || a.isToken) return false;
        if (a.faceDown) return !a.cardDef.types.includes("Land") && a.cardDef.mv <= 3;
        return (a.combat && a.combat.blockedBy || []).some(b => AI().fight(g, a, b).aDies);
      }
    }
  });
  D({
    name: "Spark Double", cost: "{3}{U}", type: "Creature — Illusion", pt: "0/0",
    text: "You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary.",
    asEnters: async (g, p, o, item, eo) => {
      const opts = g.battlefield.filter(c => c.controller === p && c !== o && (g.isCreature(c) || g.isPlaneswalker(c)));
      if (!opts.length) return;
      const pick = await g.ask(p, { type: "target", prompt: "Spark Double: enter as a copy of", options: opts, optional: true, purpose: "sparkCopy", src: o });
      if (!pick || !opts.includes(pick)) return;
      const base = pick.copyDef || pick.def;
      o.def = MK.derive(base, { supertypes: base.supertypes.filter(t => t !== "Legendary"), legendary: false });
      eo.counters = g.isPlaneswalker(pick) ? { loyalty: 1 } : { p1: 1 };
      g.ts++;
      log(g, `Spark Double enters as a copy of ${base.name}.`, p, [base.name]);
    },
    ai: {
      priority: 6, hold: (g, p) => !g.creatures(p).some(c => !c.faceDown && AI().value(g, c) >= 5),
      target: (g, p, req) => req.purpose === "sparkCopy" ? req.options.filter(c => !c.faceDown).sort((a, b) => AI().value(g, b) - AI().value(g, a))[0] || null : undefined
    }
  });
  D({
    name: "Ravenloft Adventurer", cost: "{3}{B}", type: "Creature — Human Rogue Assassin", pt: "3/4",
    text: "When this creature enters, you take the initiative.\nIf a creature an opponent controls would die, instead exile it and put a hit counter on it.\nWhenever this creature attacks, if you've completed a dungeon, defending player loses 1 life for each card they own in exile with a hit counter on it.",
    note: "The initiative is simplified: you search your library for a basic land card and put it into your hand (the Undercity's first room). Dungeons are never completed.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => { log(g, `${p.name} takes the initiative (Secret Entrance: search for a basic land).`, p, [s.def.name]); await g.search(p, { filter: (g2, c) => c.def.types.includes("Land") && c.def.supertypes.includes("Basic"), count: 1, to: "hand", prompt: "Search for a basic land card" }); }
    }],
    statics: [{ exileInsteadOfDying: (g, s, o) => g.isCreature(o) && isOpp(g, s.controller, o.controller) }],
    ai: { priority: 6 }
  });
  const BOG = MK.define({
    name: "Boggart Bog", type: "Land", cost: "",
    text: "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {B}.",
    note: "You pay the 3 life when you have more than 12.",
    etbTapped: (g, o) => { if (!o || o.id === -1) return false; const p = o.controller; if (p && p.life > 12 && g.payLife(p, 3)) { log(g, `${p.name} pays 3 life so Boggart Bog enters untapped.`, p, ["Boggart Bog"]); return false; } return true; },
    mana: [{ tap: true, produce: "B" }]
  });
  D({
    name: "Boggart Trawler", cost: "{2}{B}", type: "Creature — Goblin", pt: "3/1",
    text: "When this creature enters, exile target player's graveyard.\n//\nBoggart Bog (land): As this land enters, you may pay 3 life. If you don't, it enters tapped. {T}: Add {B}.",
    note: "A modal double-faced card: play it as the land Boggart Bog from your hand instead of casting it.",
    mdfcLand: BOG,
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const q = await g.chooseTarget(p, trig({ kind: "player", purpose: "gy", prompt: "Exile target player's graveyard" }), s);
        if (!q || q.lost || !q.graveyard.length) return;
        const n = q.graveyard.length;
        for (const c of q.graveyard.slice()) g.moveTo(c, "exile");
        log(g, `${q.name}'s graveyard (${n} cards) is exiled.`, p, ["Boggart Trawler"]);
      }
    }],
    ai: { priority: 5, target: (g, p, req) => req.purpose === "gy" ? req.options.filter(q => q !== p).sort((a, b) => b.graveyard.length - a.graveyard.length)[0] || req.options[0] : undefined }
  });

  /* ================================================================ artifacts */
  D({
    name: "Dimir Signet", cost: "{2}", type: "Artifact",
    text: "{1}, {T}: Add {U}{B}.",
    mana: [{ tap: true, cost: "{1}", produce: "UB" }],
    ai: { ramp: true, priority: 8 }
  });
  function fellwarColors(g, o) {
    const out = new Set();
    for (const l of g.battlefield) {
      if (l.controller === o.controller || !g.isLand(l)) continue;
      for (const m of l.def.mana) {
        const prod = typeof m.produce === "function" ? "" : m.produce;
        const units = Array.isArray(prod) ? prod.join("") : prod === "any" ? g.identityOf(l.controller).join("") : prod === "any5" ? "WUBRG" : String(prod || "");
        for (const k of "WUBRG") if (units.includes(k)) out.add(k);
      }
    }
    return [...out];
  }
  D({
    name: "Fellwar Stone", cost: "{2}", type: "Artifact",
    text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
    mana: [{ tap: true, produce: (g, o) => { const c = fellwarColors(g, o); return c.length ? c : null; } }],
    ai: { ramp: true, priority: 7 }
  });
  D({
    name: "Strixhaven Stadium", cost: "{3}", type: "Artifact",
    text: "{T}: Add {C}. Put a point counter on this artifact.\nWhenever a creature deals combat damage to you, remove a point counter from this artifact.\nWhenever a creature you control deals combat damage to an opponent, put a point counter on this artifact. Then if it has ten or more point counters on it, remove them all and that player loses the game.",
    mana: [{ tap: true, produce: "C", after: (g, o) => g.addCounters(o, "point", 1, o) }],
    triggers: [
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.p === s.controller, do: (g, s) => g.removeCounters(s, "point", 1) },
      {
        on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && isOpp(g, s.controller, ev.p),
        do: (g, s, ev) => {
          if (s.zone !== "battlefield") return;
          g.addCounters(s, "point", 1, s);
          if ((s.counters.point || 0) >= 10) {
            s.counters.point = 0; g.bump();
            if (!ev.p.lost) { log(g, `Strixhaven Stadium reaches ten point counters: ${ev.p.name} loses the game.`, s.controller, [s.def.name]); g.lose(ev.p, "alt"); }
          }
        }
      }
    ],
    ai: { ramp: true, priority: 7, threat: 3 }
  });
  D({
    name: "Mindcrank", cost: "{2}", type: "Artifact",
    text: "Whenever an opponent loses life, that player mills that many cards. (Damage causes loss of life.)",
    triggers: [{ on: "loseLife", when: (g, s, ev) => isOpp(g, s.controller, ev.p) && ev.amount > 0, do: (g, s, ev) => { if (!ev.p.lost) g.mill(ev.p, ev.amount); } }],
    ai: { priority: 5 }
  });
  D({
    name: "Scroll of Fate", cost: "{3}", type: "Artifact",
    text: "{T}: Manifest a card from your hand. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
    abilities: [{
      label: "Manifest a card from your hand", tap: true,
      condition: (g, o, p) => p.hand.length > 0,
      do: async (g, src, ctx) => {
        const p = ctx.p;
        const pick = await g.ask(p, { type: "cards", prompt: "Manifest a card from your hand", options: p.hand.slice(), min: 1, max: 1, purpose: "manifestHand", src });
        const c = (pick || []).find(x => p.hand.includes(x));
        if (c) g.putFaceDown(p, [c], { kind: "manifest", what: "a card from their hand" });
      },
      ai: { use: (g, p, o, ctx) => (endBeforeMe(g, p, ctx) || ctx.window === "main2") && p.hand.some(c => manifestWorth(g, p, c) > 0) }
    }],
    ai: { priority: 6 }
  });
  /* Which card of the hand to put face down: noncreature spells Etrata can cast for free, big creatures. */
  function manifestWorth(g, p, c) {
    const d = c.def;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (d.types.includes("Land")) return p.hand.filter(x => x.def.types.includes("Land")).length >= 2 || lands >= 6 ? 1 : 0;
    const etrata = g.controlled(p, o => o.def.name === "Etrata, Deadly Fugitive").length > 0;
    // a spell Etrata can later cast for free: only worth hiding when it costs more than her {2}{U}{B}
    if (!d.types.includes("Creature")) return etrata && d.mv >= 5 && !(d.ai && (d.ai.counter || d.ai.protection)) ? 1 + d.mv * 0.3 : 0;
    // a creature too expensive to cast now but cheap to flip later
    return d.mv >= 5 && lands < d.mv ? 1 + d.mv * 0.3 : 0;
  }
  AI().manifestWorth = manifestWorth;
  D({
    name: "Cryptic Coat", cost: "{2}{U}", type: "Artifact — Equipment",
    text: "When this Equipment enters, cloak the top card of your library, then attach this Equipment to it. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)\nEquipped creature gets +1/+0 and can't be blocked.\n{1}{U}: Return this Equipment to its owner's hand.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { const c = g.cloakTop(p); if (c && s.zone === "battlefield") { s.attachedTo = c; g.bump(); } } }],
    statics: [{ applies: (g, s, o) => s.attachedTo === o, pt: [1, 0], unblockable: true }],
    abilities: [{
      label: "Return to hand", cost: "{1}{U}",
      do: (g, src) => { if (src.zone === "battlefield") g.bounce(src); },
      // back to hand at the end of the turn before ours, to cloak another card when it's cast again
      ai: { use: (g, p, o, ctx) => ((ctx.window === "main2" && (!o.attachedTo || o.attachedTo.zone !== "battlefield") && manaNow(g, p) >= 5) || (endBeforeMe(g, p, ctx) && manaNow(g, p) >= 2)) }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Cursed Windbreaker", cost: "{2}{U}", type: "Artifact — Equipment",
    text: "When this Equipment enters, manifest dread, then attach this Equipment to that creature. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nEquipped creature has flying.\nEquip {3}",
    equip: "{3}",
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => { const c = await g.manifestDread(p, s); if (c && s.zone === "battlefield" && c.zone === "battlefield") { s.attachedTo = c; g.bump(); } } }],
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["flying"] }],
    ai: { priority: 7 }
  });
  D({
    name: "Maskwood Nexus", cost: "{4}", type: "Artifact",
    text: "Creatures you control are every creature type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.\n{3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling. (It is every creature type.)",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), allTypes: true }],
    abilities: [{ label: "Create a 2/2 Shapeshifter", cost: "{3}", tap: true, do: (g, src, ctx) => g.createToken(ctx.p, T.etrataShapeshifter), ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) } }],
    ai: { priority: 5, cast: enablerCast }
  });
  D({
    name: "Key to the City", cost: "{2}", type: "Artifact",
    text: "{T}, Discard a card: Up to one target creature can't be blocked this turn.\nWhenever this artifact becomes untapped, you may pay {2}. If you do, draw a card.",
    note: "The \"becomes untapped\" trigger is checked in your untap step.",
    abilities: [{
      label: "Discard: a creature can't be blocked", tap: true, discard: 1,
      targets: [{ kind: "creature", you: true, optional: true, purpose: "help", prompt: "Can't be blocked this turn" }],
      do: (g, src, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") { g.addEffect({ objs: [t], unblockable: true }); log(g, `${t.def.name} can't be blocked this turn.`, ctx.p, ["Key to the City"]); } },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && p.hand.filter(c => c.def.types.includes("Land")).length >= 2 && g.creatures(p).some(c => !c.sick && !c.tapped && g.power(c) >= 2 && isAssassin(g, c)) }
    }],
    triggers: [{
      on: "untapStep", when: (g, s, ev) => ev.p === s.controller && ev.untapped.includes(s),
      do: async (g, s, ev, { p }) => {
        if (!g.canPay(p, pc("{2}"))) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Key to the City: pay {2} to draw a card?", src: s, purpose: "keyDraw" });
        if (ok && g.pay(p, pc("{2}"))) g.draw(p, 1);
      }
    }],
    ai: { priority: 5, confirm: (g, p, req) => req.purpose !== "keyDraw" || g.controlled(p, o => g.isLand(o)).length >= 6 }
  });
  D({
    name: "Mask of Memory", cost: "{2}", type: "Artifact — Equipment",
    text: "Whenever equipped creature deals combat damage to a player, you may draw two cards. If you do, discard a card.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
    equip: "{1}",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src === s.attachedTo,
      optional: "Mask of Memory: draw two cards, then discard a card?",
      do: async (g, s, ev, { p }) => {
        g.draw(p, 2);
        if (!p.hand.length) return;
        const d = await g.ask(p, { type: "cards", prompt: "Discard a card", options: p.hand.slice(), min: 1, max: 1, purpose: "discard", src: s });
        const c = (d || []).find(x => p.hand.includes(x)) || p.hand[p.hand.length - 1];
        g.discard(p, c);
      }
    }],
    ai: { priority: 6, equipTarget: (g, p, opts) => opts.filter(c => g.ch(c).unblockable || g.kw(c, "flying")).sort((a, b) => g.power(b) - g.power(a))[0] }
  });

  /* ================================================================ enchantments */
  D({
    name: "Training Grounds", cost: "{U}", type: "Enchantment",
    text: "Activated abilities of creatures you control cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.",
    statics: [{ abilityCostMod: () => 2 }],
    ai: { priority: 6 }
  });
  const assassinType = (name, cost, extra) => D(Object.assign({
    name, cost, type: "Enchantment",
    text: "As this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
    note: "The chosen type is always Assassin. Only creatures on the battlefield change type.",
    etbState: () => ({ chosenType: "Assassin" }),
    makesAssassins: () => true,
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), subtypes: (g, s) => [s.state.chosenType || "Assassin"] }],
    ai: { priority: 6, cast: enablerCast }
  }, extra || {}));
  assassinType("Arcane Adaptation", "{2}{U}");
  assassinType("Leyline of Transformation", "{2}{U}{U}", {
    openingHand: true,
    text: "If this card is in your opening hand, you may begin the game with it on the battlefield.\nAs this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield."
  });
  D({
    name: "Cover of Darkness", cost: "{1}{B}", type: "Enchantment",
    text: "As this enchantment enters, choose a creature type.\nCreatures of the chosen type have fear. (They can't be blocked except by artifact creatures and/or black creatures.)",
    note: "The chosen type is always Assassin (every player's Assassins get fear).",
    etbState: () => ({ chosenType: "Assassin" }),
    statics: [{ applies: (g, s, o) => g.isCreature(o) && isAssassin(g, o), kw: ["fear"] }],
    ai: { priority: 7, cast: (g, p) => (g.controlled(p, s => s.def.name === "Cover of Darkness").length ? undefined : 24) }
  });
  D({
    name: "Reconnaissance Mission", cost: "{2}{U}{U}", type: "Enchantment",
    cycling: "{2}",
    text: "Whenever a creature you control deals combat damage to a player, you may draw a card.\nCycling {2} ({2}, Discard this card: Draw a card.)",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller, optional: "Reconnaissance Mission: draw a card?", do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 6, draw: true }
  });
  D({
    name: "They Came from the Pipes", cost: "{4}{U}", type: "Enchantment",
    text: "When this enchantment enters, manifest dread twice. (To manifest dread, look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nWhenever a face-down creature you control enters, draw a card.",
    triggers: [
      { on: "enters", self: true, do: async (g, s, ev, { p }) => { await g.manifestDread(p, s); await g.manifestDread(p, s); } },
      { on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && !!ev.o.faceDown, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Chthonian Nightmare", cost: "{1}{B}", type: "Enchantment",
    text: "When this enchantment enters, you get {E}{E}{E} (three energy counters).\nPay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.addEnergy(p, 3) }],
    abilities: [{
      label: "Pay X energy: reanimate", timing: "sorcery",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
      targets: [{ kind: "card", purpose: "reanimate", prompt: "Return to the battlefield", from: (g, p) => p.graveyard.filter(c => c.def.types.includes("Creature") && c.def.mv <= (p.energy || 0)) }],
      do: (g, src, ctx) => {
        const p = ctx.p, c = ctx.targets[0];
        if (src.zone === "battlefield") g.bounce(src);
        if (!c || c.zone !== "graveyard" || c.def.mv > (p.energy || 0)) return;
        p.energy -= c.def.mv; g.bump();
        g.putOntoBattlefield([c], p);
        log(g, `${p.name} pays ${c.def.mv} energy and returns ${c.def.name} to the battlefield.`, p, [c.def.name]);
      },
      ai: {
        use: (g, p, o, ctx) => ctx.window === "main1"
          && p.graveyard.some(c => c.def.types.includes("Creature") && c.def.mv <= (p.energy || 0) && c.def.mv >= 3)
          && g.creatures(p).some(c => c.isToken || (c.faceDown && c.cardDef.types.includes("Land")) || AI().value(g, c) < 3)
      }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => req.purpose === "reanimate" ? req.options.slice().sort((a, b) => b.def.mv - a.def.mv)[0] : req.purpose === "sacrifice" ? req.options.slice().sort((a, b) => AI().value(g, a) - AI().value(g, b))[0] : undefined
    }
  });
  D({
    name: "Wound Reflection", cost: "{5}{B}", type: "Enchantment",
    text: "At the beginning of each end step, each opponent loses life equal to the life they lost this turn. (Damage causes loss of life.)",
    triggers: [{
      on: "endStep",
      do: (g, s, ev, { p }) => { for (const q of g.opponents(p).map(q => [q, q.lifeLostThisTurn || 0])) if (q[1] > 0) g.loseLife(q[0], q[1], s); }
    }],
    ai: { priority: 6 }
  });
  const AQ_SPEC = { kind: "creature", you: true, purpose: "help", prompt: "Aqueous Form: enchant creature" };
  D({
    name: "Aqueous Form", cost: "{U}", type: "Enchantment — Aura",
    aura: true, enchant: "creature", targets: [AQ_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, AQ_SPEC, o).length > 0,
    text: "Enchant creature\nEnchanted creature can't be blocked.\nWhenever enchanted creature attacks, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, unblockable: true }],
    triggers: [{ on: "attacks", when: (g, s, ev) => ev.o === s.attachedTo, do: (g, s, ev, { p }) => g.scry(p, 1, s) }],
    ai: {
      priority: 6,
      target: (g, p, req) => req.options.filter(c => c.controller === p && !g.ch(c).unblockable).sort((a, b) => unblockRank(g, b) - unblockRank(g, a))[0] || undefined
    }
  });

  /* ================================================================ instants and sorceries */
  D({
    name: "Plumb the Forbidden", cost: "{1}{B}", type: "Instant",
    text: "As an additional cost to cast this spell, you may sacrifice one or more creatures. When you do, copy this spell for each creature sacrificed this way.\nYou draw a card and lose 1 life.",
    note: "The creatures are sacrificed as it resolves, and each one adds one more card and 1 life lost.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const cands = g.creatures(p);
        let sac = [];
        if (cands.length) sac = ((await g.ask(p, { type: "cards", prompt: "Plumb the Forbidden: sacrifice any number of creatures (one copy each)", options: cands, min: 0, max: cands.length, purpose: "plumbSac", src: ctx.o })) || []).filter(c => c.zone === "battlefield" && c.controller === p);
        for (const c of sac) g.sacrifice(c);
        const n = 1 + sac.length;
        g.draw(p, n); g.loseLife(p, n, ctx.o);
      }
    },
    ai: { priority: 3, draw: true, instantEnd: true }
  });
  D({
    name: "Supernatural Stamina", cost: "{B}", type: "Instant",
    text: "Until end of turn, target creature gets +2/+0 and gains \"When this creature dies, return it to the battlefield tapped under its owner's control.\"",
    spell: {
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "+2/+0 and comes back when it dies" }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "battlefield") return;
        g.pump(t, 2, 0);
        const entry = { controller: ctx.p, def: { name: "Supernatural Stamina", triggers: [{
          on: "dies", when: (g2, e, ev) => ev.o === t && g2.tempTriggers.includes(e),
          do: (g2, e) => {
            g2.tempTriggers = g2.tempTriggers.filter(x => x !== e); g2.ts++;
            if (t.zone === "graveyard") { g2.putOntoBattlefield([t], t.owner, { tapped: true }); log(g2, `${t.def.name} returns to the battlefield tapped.`, t.owner, [t.def.name]); }
          }
        }] } };
        g.tempTriggers.push(entry); g.ts++; g.bump();
      }
    },
    ai: {
      priority: 4, protection: true, trick: true,
      // it only brings back a creature that dies: useless against exile, bounce or tuck
      protects: (g, p, top) => !/exile|owner's (hand|library)|put .* on (the )?(top|bottom)/i.test(top.o.def.text || ""),
      target: (g, p, req) => {
        const top = g.stack[g.stack.length - 1];
        const hit = top && top.p !== p && top.targets.find(t => t && !g.isPlayer(t) && t.controller === p && req.options.includes(t));
        if (hit) return hit;
        const blocked = req.options.filter(c => c.combat && (c.combat.wasBlocked || c.combat.blocking)).sort((a, b) => AI().value(g, b) - AI().value(g, a));
        return blocked[0] || undefined;
      }
    }
  });
  D({
    name: "An Offer You Can't Refuse", cost: "{U}", type: "Instant",
    text: "Counter target noncreature spell. Its controller creates two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
    spell: {
      targets: [specSpell("Counter target noncreature spell", it => !it.o.def.types.includes("Creature"))],
      do: (g, ctx) => { const it = counterIt(g, ctx); if (it && !it.p.lost) g.createToken(it.p, T.treasure, { count: 2 }); }
    },
    ai: counterAi
  });
  D({
    name: "Wash Away", cost: "{U}", type: "Instant",
    text: "Cleave {1}{U}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nCounter target spell [that wasn't cast from its owner's hand].",
    altCosts: [{ label: "Cleave", cost: "{1}{U}{U}", targets: [specSpell("Counter target spell")] }],
    spell: {
      targets: [specSpell("Counter target spell that wasn't cast from its owner's hand", it => it.from !== "hand" || it.p !== it.o.owner)],
      do: (g, ctx) => { counterIt(g, ctx); }
    },
    ai: counterAi
  });
  D({
    name: "Dispel", cost: "{U}", type: "Instant",
    text: "Counter target instant spell.",
    spell: { targets: [specSpell("Counter target instant spell", it => it.o.def.types.includes("Instant"))], do: (g, ctx) => { counterIt(g, ctx); } },
    ai: counterAi
  });
  D({
    name: "Reality Shift", cost: "{1}{U}", type: "Instant",
    text: "Exile target creature. Its controller manifests the top card of their library. (That player puts the top card of their library onto the battlefield face down as a 2/2 creature. If it's a creature card, it can be turned face up any time for its mana cost.)",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Exile" }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!t || !ctx.legal[0] || t.zone !== "battlefield") return;
        const q = t.controller;
        g.exile(t, ctx.o);
        if (!q.lost && q.library.length) g.putFaceDown(q, [q.library[0]], { kind: "manifest", what: "the top card of their library" });
      }
    },
    ai: { removal: true, minThreat: 5 }
  });
  D({
    name: "March of Swirling Mist", cost: "{X}{U}", type: "Instant",
    text: "As an additional cost to cast this spell, you may exile any number of blue cards from your hand. This spell costs {2} less to cast for each card exiled this way.\nUp to X target creatures phase out. (While they're phased out, they're treated as though they don't exist. Each one phases in before its controller untaps during their next untap step.)",
    note: "Exiling blue cards to pay isn't offered, and the creatures are chosen as it resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.x || 0;
        if (!x) return;
        const cands = g.battlefield.filter(o => g.isCreature(o) && (o.controller === p || g.canTarget(p, o)));
        if (!cands.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: `Choose up to ${x} creature${x > 1 ? "s" : ""} to phase out`, options: cands, min: 0, max: Math.min(x, cands.length), purpose: "phaseOut", src: ctx.o });
        g.phaseOut((pick || []).filter(o => cands.includes(o)).slice(0, x));
      }
    },
    ai: {
      priority: 4, protection: true,
      x: (g, p, o, xMax) => (g.waitingTriggers().some(t => t.src && t.src.def && t.src.def.name === "Etrata, the Silencer" && t.controller === p) ? 1 : xMax),
      plan: (g, p, o, ctx) => {
        if (ctx.window !== "trigger" || o.zone !== "hand") return null;
        if (!g.battlefield.some(s => s.controller === p && s.def.name === "Etrata, the Silencer" && s.combat)) return null;
        const act = ctx.actions.find(a => a.type === "cast" && a.card === o && a.xMax >= 1);
        return act ? { type: "cast", card: o, x: 1 } : null;
      }
    }
  });
  D({
    name: "Dark Ritual", cost: "{B}", type: "Instant",
    text: "Add {B}{B}{B}.",
    note: "The mana stays until the end of the step or phase.",
    spell: { do: (g, ctx) => { ctx.p.pool.B += 3; g.bump(); log(g, `${ctx.p.name} adds {B}{B}{B}.`, ctx.p, ["Dark Ritual"]); } },
    ai: {
      cast: (g, p, o, { window }) => {
        if (window !== "main1") return false;
        const have = manaNow(g, p);
        const big = p.hand.some(c => c !== o && !c.def.types.includes("Land") && c.def.mv >= have + 1 && c.def.mv <= have + 2 && !g.castOptions(p, c).length && (c.def.colors.length === 0 || c.def.colors.includes("B")));
        return big ? 40 : false;
      }
    }
  });

  /* ================================================================ lands */
  D({
    name: "Underground River", type: "Land",
    text: "{T}: Add {C}.\n{T}: Add {U} or {B}. This land deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["U", "B"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  D({
    name: "Drowned Catacomb", type: "Land",
    text: "This land enters tapped unless you control an Island or a Swamp.\n{T}: Add {U} or {B}.",
    etbTapped: (g, o) => !g.controlled(o.controller, l => l !== o && g.isLand(l) && (l.def.subtypes.includes("Island") || l.def.subtypes.includes("Swamp"))).length,
    mana: [{ tap: true, produce: ["U", "B"] }]
  });
  D({
    name: "Darkslick Shores", type: "Land",
    text: "This land enters tapped unless you control two or fewer other lands.\n{T}: Add {U} or {B}.",
    etbTapped: (g, o) => g.controlled(o.controller, l => l !== o && g.isLand(l)).length > 2,
    mana: [{ tap: true, produce: ["U", "B"] }]
  });
  D({
    name: "River of Tears", type: "Land",
    text: "{T}: Add {U}. If you played a land this turn, add {B} instead.",
    mana: [{ tap: true, produce: (g, o) => (g.active === o.controller && o.controller.landsPlayed > 0 ? "B" : "U") }]
  });
  D({
    name: "Access Tunnel", type: "Land",
    text: "{T}: Add {C}.\n{3}, {T}: Target creature with power 3 or less can't be blocked this turn.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Power 3 or less can't be blocked", cost: "{3}", tap: true, noSelfMana: true,
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Can't be blocked this turn", filter: (g, c) => g.power(c) <= 3 }],
      do: (g, src, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] && t.zone === "battlefield") g.addEffect({ objs: [t], unblockable: true }); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && (slasherReady(g, p) || (g.creatures(p).some(c => !c.sick && !c.tapped && g.power(c) <= 3 && isAssassin(g, c) && !g.ch(c).unblockable) && manaNow(g, p) >= 6)) }
    }],
    ai: { target: (g, p, req) => (req.purpose === "help" ? req.options.filter(c => c.controller === p && !c.sick && !c.tapped && !g.ch(c).unblockable).sort((a, b) => unblockRank(g, b) - unblockRank(g, a))[0] || undefined : undefined) }
  });

  /* ================================================================ the deck */
  MK.ETRATA_DECK = {
    id: "etrata", hero: "etrata", variant: "etrata", label: "Etrata", name: "Etrata", title: "Etrata, Deadly Fugitive",
    commander: "Etrata, Deadly Fugitive", identity: ["U", "B"], bracket: 3, aggression: 0.65,
    style: "Dimir Assassins and face-down creatures",
    blurb: "Cheap evasive Assassins cloak the top of each opponent's library. Etrata then turns those cards face up, or exiles and casts them for free.",
    watch: ["Etrata, Deadly Fugitive", "Etrata, the Silencer", "Ramses, Assassin Lord", "Unstoppable Slasher", "Strixhaven Stadium"],
    list: ["Omen Hawker", "Changeling Outcast", "Mothdust Changeling", "Universal Automaton", "Hookblade Veteran", "Brotherhood Spy", "Aven Heartstabber", "Desmond Miles", "Basim Ibn Ishaq", "Silent Hallcreeper", "Unstoppable Slasher", "Ramses, Assassin Lord", "Roshan, Hidden Magister", "Etrata, the Silencer", "Kheru Spellsnatcher", "Willbender", "Duskmantle Guildmage", "Gix, Yawgmoth Praetor", "Glitch Interpreter", "Grazilaxx, Illithid Scholar", "Spark Double", "Ravenloft Adventurer", "Boggart Trawler", "Sol Ring", "Arcane Signet", "Dimir Signet", "Talisman of Dominance", "Fellwar Stone", "Mind Stone", "Springleaf Drum", "Strixhaven Stadium", "Mindcrank", "Scroll of Fate", "Cryptic Coat", "Cursed Windbreaker", "Maskwood Nexus", "Key to the City", "Mask of Memory", "Training Grounds", "Arcane Adaptation", "Leyline of Transformation", "Cover of Darkness", "Reconnaissance Mission", "They Came from the Pipes", "Chthonian Nightmare", "Wound Reflection", "Aqueous Form", "Consider", "Preordain", "Plumb the Forbidden", "Night's Whisper", "Frantic Search", "Supernatural Stamina", "Counterspell", "Arcane Denial", "An Offer You Can't Refuse", "Wash Away", "Dispel", "Infernal Grasp", "Reality Shift", "Feed the Swarm", "Toxic Deluge", "March of Swirling Mist", "Dark Ritual", "Command Tower", "Exotic Orchard", "Underground River", "Drowned Catacomb", "Sunken Hollow", "Choked Estuary", "Darkwater Catacombs", "Darkslick Shores", "Tainted Isle", "River of Tears", "Path of Ancestry", "Access Tunnel", "Rogue's Passage", "Bojuka Bog",
      "Island", "Island", "Island", "Island", "Island", "Island", "Island", "Island", "Island", "Island", "Island",
      "Swamp", "Swamp", "Swamp", "Swamp", "Swamp", "Swamp", "Swamp", "Swamp", "Swamp", "Swamp"]
  };
  (MK.HERO_DECKS = MK.HERO_DECKS || []).push(MK.ETRATA_DECK);
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.ETRATA_DECK);
})(typeof window !== "undefined" ? window : globalThis);
