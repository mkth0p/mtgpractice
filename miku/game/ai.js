/* Bots for Miku Commander. One agent object per bot seat, with the same interface as the human
   table (mulligan, main, attack, block, respond, choose). The bots use rules of thumb, not search:
   value and threat scores for permanents, simple combat maths, and per-card hints (`def.ai`,
   `ability.ai`) written next to each card. They never look at hidden cards of other players. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const AI = MK.AI = MK.AI || {};

  /* ------------------------------------------------------------ scores */
  function kwScore(g, o) {
    const k = g.ch(o).kws;
    let s = 0;
    if (k.has("flying")) s += 1.5;
    if (k.has("trample")) s += 0.8;
    if (k.has("lifelink")) s += 1;
    if (k.has("deathtouch")) s += 1.5;
    if (k.has("first strike")) s += 1;
    if (k.has("double strike")) s += 3;
    if (k.has("hexproof")) s += 1;
    if (k.has("indestructible")) s += 2.5;
    if (k.has("vigilance")) s += 0.5;
    if (k.has("menace")) s += 1;
    if (k.has("infect")) s += 2.5;
    if (k.has("unblockable")) s += 2;
    return s;
  }
  /* How much a permanent is worth to its controller. */
  function value(g, o) {
    if (!o || o.zone !== "battlefield") return 0;
    const d = o.def;
    let v = 0;
    if (g.isCreature(o)) {
      v += Math.max(0, g.power(o)) * 1.2 + Math.max(0, g.toughness(o)) * 0.6 + kwScore(g, o);
      if (d.triggers.length) v += 1.5;
      if (d.abilities.length) v += 1;
      if (d.mana.length) v += 1.5;
      if (d.statics.length) v += 2;
    } else if (g.isPlaneswalker(o)) v += 5 + (o.counters.loyalty || 0);
    else if (g.isLand(o)) v += 1 + (d.abilities.length ? 1 : 0) + (d.mana.some(m => typeof m.produce === "string" && m.produce.length > 1) ? 1 : 0);
    else {
      v += 1 + d.mv * 0.8;
      if (d.mana.length) v += 2;
      if (d.statics.length || d.triggers.length) v += 1.5;
    }
    if (o.isCommander) v += 4;
    if (o.isToken && g.isCreature(o)) v -= 0.4;
    if (d.ai && d.ai.threat) v += d.ai.threat;
    return v;
  }
  /* How much p wants o (an opponent's permanent) gone. */
  function threat(g, o, p) {
    let t = value(g, o);
    const d = o.def;
    if (!g.isCreature(o) && !g.isLand(o) && (d.statics.length || d.triggers.length)) t += 2;
    if (o.isCommander) t += 3;
    if (g.isLand(o)) t -= 2;
    if (o.isToken && !g.isCreature(o)) t -= 2;
    return t;
  }
  AI.value = value;
  AI.threat = threat;

  function boardValue(g, q) { return g.battlefield.filter(o => o.controller === q).reduce((s, o) => s + value(g, o), 0); }
  function power(g, list) { return list.reduce((s, o) => s + Math.max(0, g.power(o)), 0); }
  function untappedMana(g, p) { return g.maxX(p, MK.parseCost(""), 1); }
  function isInstant(g, p, o) { return g.isInstantSpeed(p, o); }
  function lethalFor(g, o) { return Math.max(1, g.lethalDamageLeft(o)); }

  /* The table leader by the old rough score (board, life, hand). Only games recorded before
     engine 3 still use it, through the old attack code, so their replays match. */
  function leaderOld(g, p) {
    const opps = g.opponents(p);
    let best = null, bs = -1e9;
    for (const q of opps) {
      const s = boardValue(g, q) * 0.6 + q.life * 0.25 - q.poison * 2 + (q.hand.length * 0.5);
      if (s > bs) { bs = s; best = q; }
    }
    return best;
  }

  /* ------------------------------------------------------------ the table's threats */
  /* How close q is to a combo kill (MK.COMBOS) with what's on their battlefield: a whole combo
     wins any moment, one piece short is close (more so with cards in hand to find it). The hand
     itself is hidden, so only public cards count. */
  function comboThreat(g, q) {
    const combos = MK.COMBOS;
    if (!combos || !combos.length) return 0;
    const names = new Set(g.battlefield.filter(o => o.controller === q).map(o => o.def.name));
    let best = 0;
    for (const c of combos) {
      const held = c.pieces.filter(n => names.has(n)).length;
      if (!held) continue;
      const miss = c.pieces.length - held;
      const s = (miss === 0 ? 30 : miss === 1 ? 3 + Math.min(2, q.hand.length * 0.5) : 0) * (c.kill === false ? 0.5 : 1);
      if (s > best) best = s;
    }
    return best;
  }
  /* A permanent that completes or nearly completes a combo on its controller's side: removal
     goes there first. */
  function comboPieceThreat(g, o) {
    const combos = MK.COMBOS;
    if (!combos || !combos.length || !o.controller) return 0;
    const names = new Set(g.battlefield.filter(x => x.controller === o.controller && x !== o).map(x => x.def.name));
    let best = 0;
    for (const c of combos) {
      if (!c.pieces.includes(o.def.name)) continue;
      const miss = c.pieces.filter(n => n !== o.def.name && !names.has(n)).length;
      const s = (miss === 0 ? 14 : miss === 1 ? 5 : 1) * (c.kill === false ? 0.5 : 1);
      if (s > best) best = s;
    }
    return best;
  }
  /* The damage a creature's attack would deal if nothing blocked it. */
  function hitDamage(g, a) { return Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1); }
  function evasive(g, a) { return g.kw(a, "flying") || g.ch(a).unblockable || g.kw(a, "menace") || g.kw(a, "shadow") || g.kw(a, "fear"); }
  /* How likely opponent q is to win, from what p can see, as a log-odds score (higher is more
     dangerous; one point is about e times as likely). The weights were fitted on bot games (who
     went on to win from each round's position): lands, how close their attacks are to killing the
     weakest player at the table (evasive power counts extra), board value (engines, commander),
     cards in hand, life, commander damage already dealt, and combo pieces on the battlefield. An
     attack that can kill us next turn counts a little extra: we're the one at risk. */
  function playerThreat(g, p, q) {
    if (!q || q.lost) return 0;
    let val = 0, lands = 0, atk = 0, eva = 0, infect = 0;
    for (const o of g.battlefield) {
      if (o.controller !== q) continue;
      if (g.isLand(o)) { lands++; continue; }
      val += Math.max(0, threat(g, o, p));
      if (g.isCreature(o) && !g.kw(o, "defender")) {
        const d = hitDamage(g, o);
        if (g.kw(o, "infect")) infect += d;
        else { atk += d; if (evasive(g, o) || g.kw(o, "trample")) eva += d; }
      }
    }
    const others = g.players.filter(x => x !== q && !x.lost);
    let t = Math.min(lands, 10) * 0.09 + Math.min(val, 60) * 0.026 + Math.min(atk, 60) * 0.013 + Math.min(eva, 60) * 0.013 + Math.min(q.hand.length, 10) * 0.06 + Math.min(q.life, 60) * 0.014;
    if (others.length) {
      const minLife = Math.max(1, Math.min(...others.map(x => x.life)));
      const minPoison = Math.max(1, Math.min(...others.map(x => 10 - x.poison)));
      t += Math.min(2, Math.max(atk / minLife, infect / minPoison)) * 0.35;
    }
    if (atk >= p.life || infect >= 10 - p.poison) t += 0.3;
    // commander damage they've already stacked on someone
    let cmd = 0;
    for (const x of others) for (const o of g.battlefield) if (o.controller === q && o.isCommander && x.cmdDmg[o.id]) cmd = Math.max(cmd, x.cmdDmg[o.id]);
    t += Math.min(cmd, 21) * 0.05;
    return t + comboThreat(g, q) * 0.08;
  }
  /* Every opponent's threat as a share of the table's: their chance to win (a softmax of the
     scores) against the average opponent's (1 is average, 2 twice as likely, kept within 0.3-3). */
  function threatModel(g, p) {
    const opps = g.opponents(p);
    const abs = new Map(opps.map(q => [q, playerThreat(g, p, q)]));
    const mx = Math.max(0, ...abs.values());
    const e = new Map(opps.map(q => [q, Math.exp(abs.get(q) - mx)]));
    const avg = opps.length ? [...e.values()].reduce((s, x) => s + x, 0) / opps.length : 1;
    const rel = new Map(opps.map(q => [q, Math.max(0.3, Math.min(3, e.get(q) / avg))]));
    let top = null;
    for (const q of opps) if (!top || abs.get(q) > abs.get(top)) top = q;
    return { abs, rel, top };
  }
  AI.playerThreat = playerThreat;
  AI.comboThreat = comboThreat;
  AI.threatModel = threatModel;
  /* Who the table leader is, from p's point of view: the most dangerous opponent. */
  function leader(g, p) { return threatModel(g, p).top; }
  /* What a creature's combat damage to a player is worth beyond the damage: its own triggers and
     the ones on p's other permanents ("whenever a creature you control deals combat damage to a
     player": Etrata cloaks, card draw, treasure, copies). A card can price its hit with
     `ai.hitValue(g, p, attacker, q)`. */
  function hitTriggerValue(g, p, a, q) {
    let v = 0;
    const ev = { src: a, p: q, amount: Math.max(1, g.power(a)) };
    for (const s of g.battlefield) {
      if (s.controller !== p) continue;
      for (const tr of s.def.triggers) {
        if (tr.on !== "combatDamagePlayer") continue;
        let ok = false;
        try { ok = !tr.when || !!tr.when(g, s, ev); } catch (e) { ok = false; }
        if (!ok) continue;
        const hv = s.def.ai && s.def.ai.hitValue;
        let w = 2.5;
        if (typeof hv === "function") { try { w = +hv(g, p, a, q) || 0; } catch (e) { w = 2.5; } }
        else if (typeof hv === "number") w = hv;
        v += w;
      }
    }
    return v;
  }
  AI.hitTriggerValue = hitTriggerValue;

  /* One creature fighting another (a attacks, b blocks). */
  function fight(g, a, b) {
    const aP = Math.max(0, g.power(a)), bP = Math.max(0, g.power(b));
    const aFS = g.kw(a, "first strike") || g.kw(a, "double strike");
    const bFS = g.kw(b, "first strike") || g.kw(b, "double strike");
    const aDmg = g.kw(a, "double strike") ? aP * 2 : aP;
    const aKillsB = aP > 0 && !g.kw(b, "indestructible") && (g.kw(a, "deathtouch") || aDmg >= lethalFor(g, b) || g.kw(a, "infect") && aP >= g.toughness(b));
    const bKillsA = bP > 0 && !g.kw(a, "indestructible") && (g.kw(b, "deathtouch") || bP >= lethalFor(g, a));
    if (aFS && !bFS) return { aDies: aKillsB && aP >= lethalFor(g, b) ? false : bKillsA, bDies: aKillsB };
    if (bFS && !aFS) return { aDies: bKillsA, bDies: bKillsA ? false : aKillsB };
    return { aDies: bKillsA, bDies: aKillsB };
  }
  AI.fight = fight;

  /* ------------------------------------------------------------ targeting */
  function isPlayer(g, x) { return g.isPlayer(x); }
  function pickHarm(g, p, options, req) {
    const src = req && req.src;
    const amount = req && req.spec && req.spec.amount;
    const creatures = options.filter(o => !isPlayer(g, o) && o.controller !== p);
    const players = options.filter(o => isPlayer(g, o) && o !== p);
    // the table's threats: a permanent is worth more to remove when its controller is the
    // biggest danger, or when it's a combo piece; a player is the target by the same measure
    const tm = threatModel(g, p);
    const relOf = q => tm.rel.get(q) || 1;
    // (a spell or ability on the stack, a card in no zone: no score, the first one stays first)
    const sc = new Map(creatures.map(o => [o, o.zone === "battlefield" && o.def ? threat(g, o, p) * (0.7 + 0.3 * relOf(o.controller)) + comboPieceThreat(g, o) : 0]));
    const byScore = list => list.slice().sort((a, b) => sc.get(b) - sc.get(a));
    const playerScore = q => relOf(q) * 10 + (amount != null ? amount * 6 / Math.max(4, q.life) : 0);
    const bestPlayer = () => {
      // a player this damage kills goes first, then the most dangerous one
      const dead = amount != null ? players.filter(q => q.life <= amount) : [];
      const pool = dead.length ? dead : players;
      return pool.slice().sort((a, b) => (playerScore(b) - playerScore(a)) || (a.life - b.life))[0];
    };
    // damage effects: kill a creature if we can, else the most dangerous opponent
    if (amount != null) {
      const killable = byScore(creatures.filter(o => g.isCreature(o) && !g.kw(o, "indestructible") && lethalFor(g, o) <= amount));
      if (killable.length && sc.get(killable[0]) >= 3 && !(players.length && players.some(q => q.life <= amount))) return killable[0];
      if (players.length) return bestPlayer();
    }
    if (creatures.length) return byScore(creatures)[0];
    if (players.length) return bestPlayer();
    // only our own things are legal: pick the least valuable (a forced target)
    const own = options.filter(o => !isPlayer(g, o));
    if (own.length && !(req && req.optional)) return own.slice().sort((a, b) => value(g, a) - value(g, b))[0];
    return req && req.optional ? null : options[0];
  }
  function pickHelp(g, p, options, req) {
    const own = options.filter(o => !isPlayer(g, o) && o.controller === p);
    const src = req && req.src;
    if (src && src.def && src.def.name === "Heliod, Sun-Crowned") {
      const bal = own.find(o => o.def.name === "Walking Ballista" && (o.counters.p1 || 0) > 0);
      if (bal) return bal;
      const att = own.filter(o => o.combat && o.combat.attacking && !o.combat.wasBlocked).sort((a, b) => g.power(b) - g.power(a));
      if (att.length) return att[0];
    }
    if (g.loopHint && own.includes(g.loopHint)) return g.loopHint;
    if (!own.length) return req && req.optional ? null : options.find(o => isPlayer(g, o) && o === p) || options[0];
    const inCombat = own.filter(o => o.combat);
    const pool = inCombat.length && req && req.purpose === "help" ? inCombat : own;
    return pool.slice().sort((a, b) => helpScore(g, b) - helpScore(g, a))[0];
  }
  function helpScore(g, o) {
    let s = value(g, o);
    if (g.kw(o, "flying") || g.ch(o).unblockable) s += 2;
    if (g.kw(o, "trample")) s += 1;
    if (g.kw(o, "defender")) s -= 4;
    if (o.def.mana.length && g.power(o) <= 1) s -= 1;
    return s;
  }
  function pickCounter(g, p, options, req) {
    if (g.loopHint && options.includes(g.loopHint)) return g.loopHint;
    // a counter on the creature Trostani checks next comes back as life too
    const waiting = g.waitingTriggers();
    for (let i = waiting.length - 1; i >= 0; i--) {
      const t = waiting[i];
      if (t.controller === p && t.tr.checksToughness && t.ev && options.includes(t.ev.o)) return t.ev.o;
    }
    const src = req && req.src;
    const own = options.filter(o => !isPlayer(g, o) && o.controller === p && g.isCreature(o));
    if (!own.length) return options.find(o => o.controller === p) || (req && req.optional ? null : options[0]);
    // grow the creature that turns counters into the most: evasive, lifelink, already big
    return own.slice().sort((a, b) => helpScore(g, b) - helpScore(g, a))[0];
  }
  function pickCheapest(g, p, options) {
    return options.slice().sort((a, b) => value(g, a) - value(g, b))[0];
  }
  function tokenPick(g, p, options) {
    return options.slice().sort((a, b) => value(g, b) - value(g, a))[0];
  }

  /* ------------------------------------------------------------ card picks (search, discard, bottom) */
  function colorSources(g, p) {
    const n = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    for (const o of g.controlled(p)) for (const m of o.def.mana) {
      const prod = typeof m.produce === "function" ? "" : m.produce;
      const units = Array.isArray(prod) ? prod.join("") : prod === "any" || prod === "any5" ? g.identityOf(p).join("") : String(prod || "");
      for (const k of "WUBRG") if (units.includes(k)) n[k]++;
    }
    return n;
  }
  function landScore(g, p, o) {
    const need = colorSources(g, p);
    let s = 1;
    for (const m of o.def.mana) {
      const prod = typeof m.produce === "function" ? "" : m.produce;
      const units = Array.isArray(prod) ? prod.join("") : prod === "any" || prod === "any5" ? g.identityOf(p).join("") : String(prod || "");
      for (const k of g.identityOf(p)) if (units.includes(k)) s += 3 / (1 + need[k]);
      if (units.length > 1 && !Array.isArray(prod)) s += 1;
    }
    if (o.def.abilities.length) s += 0.5;
    return s;
  }
  function cardScore(g, p, o, req) {
    const d = o.def;
    if (d.types.includes("Land")) return landScore(g, p, o);
    let s = (d.ai && d.ai.priority != null ? d.ai.priority : 5) + d.mv * 0.6;
    if (req && req.purpose === "tutor" && d.ai && d.ai.finisher) s += 4;
    if (req && req.purpose === "tutor") s += comboBonus(g, p, o);
    return s;
  }
  /* Combo pieces (MK.COMBOS, registered by the deck files): a tutor fetches the card that
     completes a combo first, then a piece of a combo that's half there, then any kill piece. */
  function comboBonus(g, p, o) {
    // a deck with its own brain says what its tutors want
    const db = deckBrain(p);
    if (db && db.tutorBonus) return db.tutorBonus(g, p, o) || 0;
    const combos = MK.COMBOS;
    if (!combos || !combos.length) return 0;
    const name = o.def.name;
    const have = n => p.hand.some(c => c !== o && c.def.name === n) || g.battlefield.some(c => c.controller === p && c.def.name === n);
    if (have(name)) return 0;
    let best = 0;
    for (const c of combos) {
      if (!c.pieces.includes(name)) continue;
      const others = c.pieces.filter(n => n !== name);
      const held = others.filter(have).length;
      const b = (held === others.length ? 12 : 3 + held * 4) * (c.kill === false ? 0.6 : 1);
      if (b > best) best = b;
    }
    return best;
  }
  AI.comboBonus = comboBonus;
  /* A deck's own brain (MK.DECK_BRAINS[deck id], registered by its card file): plan(g, p, ctx) runs
     before the card plans, attack(g, p, candidates, targets) can declare the attack ({ decl }) or
     keep creatures home ({ home }), tutor(g, p, cards) picks for the shared tutors (tutors: true
     lets the deck's own choose pick), choose(g, p, req) before the generic choices (undefined: no say),
     tutorBonus(g, p, card) replaces the generic combo bonus, keepHome(g, p, creature) keeps a
     creature out of an attack that doesn't kill ("always": even one that does), mulligan(g, p,
     { hand, mulls }) keeps or not. */
  function deckBrain(p) {
    const b = MK.DECK_BRAINS;
    return b && p && p.deckId && b[p.deckId] ? b[p.deckId] : null;
  }
  AI.deckBrain = deckBrain;
  /* A card's hints for this player. A card one bot deck casts through its own plan says so
     (`ai.brain`: that deck's id, `ai.never`); any other deck plays it by `ai.otherwise`, so a Force
     of Will in an Etrata list isn't a dead card. */
  function hintOf(p, o) {
    const ai = o.def.ai || {};
    return ai.brain && ai.otherwise && p && p.deckId && p.deckId !== ai.brain ? Object.assign({ target: ai.target }, ai.otherwise) : ai;
  }
  AI.hintOf = hintOf;
  /* A tutor to hand: a card that costs more than we can pay next turn waits in the hand, so it
     loses value with every missing mana; ramp is worth more while we're short; lands while we
     have too few. A finisher or a combo piece the deck marks (`ai.tutorBonus`) comes first. */
  function tutorScore(g, p, o, req) {
    const d = o.def, ai = d.ai || {};
    const sources = g.battlefield.filter(x => x.controller === p && (g.isLand(x) || (x.def.mana && x.def.mana.length))).length;
    const lands = g.controlled(p, x => g.isLand(x)).length + p.hand.filter(x => x.def.types.includes("Land")).length;
    const next = sources + (p.hand.some(x => x.def.types.includes("Land")) ? 1 : 0);
    if (d.types.includes("Land")) return lands < 4 ? 9 : 1;
    let s = cardScore(g, p, o, req);
    if (d.mv > next) s -= (d.mv - next) * 1.6;
    if (ai.ramp) s += sources < 5 ? 2.5 : -1.5;
    if (ai.tutorBonus) s += typeof ai.tutorBonus === "function" ? ai.tutorBonus(g, p, o) || 0 : ai.tutorBonus;
    s += comboBonus(g, p, o);
    if (ai.never) s -= 20;
    return s;
  }
  function pickCards(g, p, req) {
    const opts = req.options.slice();
    const min = req.min || 0, max = req.max == null ? opts.length : req.max;
    const pur = req.purpose;
    if (pur === "bottom" || pur === "discard") {
      const lands = p.hand.filter(o => o.def.types.includes("Land")).length;
      const onField = g.controlled(p, o => g.isLand(o)).length;
      const worst = opts.slice().sort((a, b) => keepScore(g, p, a, lands, onField) - keepScore(g, p, b, lands, onField));
      return worst.slice(0, min || max);
    }
    if (pur === "crew") {
      const need = req.need || 1;
      const sorted = opts.slice().sort((a, b) => (b.sick - a.sick) || (value(g, a) - value(g, b)));
      const out = []; let pw = 0;
      for (const c of sorted) { if (pw >= need) break; out.push(c); pw += Math.max(0, g.power(c)); }
      return out;
    }
    if (pur === "scry" || pur === "surveil") {
      // keep what we need: lands while short of them, cheap spells otherwise
      const lands = g.controlled(p, o => g.isLand(o)).length + p.hand.filter(o => o.def.types.includes("Land")).length;
      return opts.filter(o => o.def.types.includes("Land") ? lands >= 6 : o.def.mv > lands + 2 || (o.def.ai && o.def.ai.never));
    }
    if (pur === "dread") {
      // manifest dread: the creature we'd most like to turn face up, else anything but a land we need
      const cre = opts.filter(o => o.def.types.includes("Creature")).sort((a, b) => cardScore(g, p, b, req) - cardScore(g, p, a, req));
      if (cre.length) return [cre[0]];
      return [opts.slice().sort((a, b) => cardScore(g, p, a, req) - cardScore(g, p, b, req))[0]];
    }
    if (pur === "manifestHand") {
      const w = AI.manifestWorth || (() => 0);
      return [opts.slice().sort((a, b) => w(g, p, b) - w(g, p, a))[0]];
    }
    if (pur === "plumbSac") {
      // Unstoppable Slasher comes back if it has no counters; face-down lands are only 2/2s
      return opts.filter(o => (o.def.name === "Unstoppable Slasher" && !Object.values(o.counters).some(n => n > 0)) || (o.faceDown && o.cardDef.types.includes("Land") && p.hand.length < 3));
    }
    if (pur === "phaseOut") {
      const mineOnly = opts.filter(o => o.controller === p);
      const silencer = mineOnly.find(o => o.def.name === "Etrata, the Silencer" && g.waitingTriggers().some(t => t.src === o));
      if (silencer) return [silencer];
      return mineOnly.sort((a, b) => value(g, b) - value(g, a)).slice(0, max);
    }
    if (pur === "tapCost") return opts.slice().sort((a, b) => value(g, a) - value(g, b)).slice(0, min);
    if (pur === "untapCost") return opts.slice().sort((a, b) => value(g, b) - value(g, a)).slice(0, min);
    if (pur === "cultivate") {
      const src = colorSources(g, p);
      const sorted = opts.slice().sort((a, b) => landScore(g, p, b) - landScore(g, p, a));
      const first = sorted[0];
      if (!first) return [];
      const firstColor = first.def.mana[0] && String(first.def.mana[0].produce);
      const second = sorted.find(o => o !== first && String(o.def.mana[0] && o.def.mana[0].produce) !== firstColor) || sorted.find(o => o !== first);
      return second ? [first, second] : [first];
    }
    // tutors: the best card we can cast soon
    if (pur === "tutor" && req.to !== "battlefield") {
      const sorted = opts.slice().sort((a, b) => tutorScore(g, p, b, req) - tutorScore(g, p, a, req));
      return sorted.slice(0, Math.max(min, Math.min(max, sorted.length)));
    }
    // generic picks: the best cards
    const sorted = opts.slice().sort((a, b) => cardScore(g, p, b, req) - cardScore(g, p, a, req));
    return sorted.slice(0, Math.max(min, Math.min(max, sorted.length)));
  }
  function keepScore(g, p, o, landsInHand, landsOnField) {
    const d = o.def;
    if (d.types.includes("Land")) {
      if (landsOnField + landsInHand <= 4) return 9;
      if (landsOnField >= 7) return 1;
      return landsInHand >= 3 ? 3 : 6;
    }
    let s = (d.ai && d.ai.priority != null ? d.ai.priority : 5);
    if (d.ai && d.ai.ramp) s += landsOnField < 5 ? 3 : -2;
    if (d.mv > landsOnField + 3) s -= 2;
    if (d.mv <= 2) s += 1;
    return s;
  }

  /* ------------------------------------------------------------ Miku combo hints (used by cards-miku.js) */
  function heliodOn(g, p) { return g.controlled(p, o => o.def.name === "Heliod, Sun-Crowned").length > 0; }
  AI.heliodLoop = function (g, p, o) {
    if (!heliodOn(g, p) || !(o.counters.p1 > 0)) return false;
    const mem = p.agent && p.agent.mem;
    if (mem && mem.loopTurn === g.turn) return false;
    if (mem) mem.loopTurn = g.turn;
    const thune = g.controlled(p, x => x.def.name === "Archangel of Thune").length > 0;
    return { repeat: thune ? 60 : 25 };
  };
  AI.ballistaPing = function (g, p, o, ctx) {
    const n = o.counters.p1 || 0;
    if (!n) return false;
    const opps = g.opponents(p);
    if (heliodOn(g, p) && g.kw(o, "lifelink")) {
      // the last counter can't be removed: a 0/0 Ballista dies before the ping resolves
      if (n < 2) return false;
      const total = opps.reduce((s, q) => s + Math.max(0, q.life), 0);
      return { repeat: Math.min(400, total + 5) };
    }
    // finish a player
    const low = opps.filter(q => q.life <= n && !g.playerHexproof(q));
    if (low.length) return { repeat: low[0].life };
    // kill an x/1 worth killing (only with spare counters)
    if (ctx.window === "main2" || ctx.window === "end") {
      const small = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible") && lethalFor(g, c) <= 1 && threat(g, c, p) >= 4);
      if (small.length && n >= 2) return true;
    }
    return false;
  };
  /* Ballista needs two counters for the Heliod loop, so buy one with {4} first. */
  AI.ballistaGrow = function (g, p, o, ctx) {
    return heliodOn(g, p) && (o.counters.p1 || 0) === 1 && (ctx.window === "main1" || ctx.window === "main2");
  };
  AI.heliodLifelink = function (g, p, o, ctx) {
    const bal = g.controlled(p, x => x.def.name === "Walking Ballista" && (x.counters.p1 || 0) >= 2 && !g.kw(x, "lifelink"));
    if (bal.length && (ctx.window === "main1" || ctx.window === "main2" || ctx.window === "end")) return true;
    return false;
  };
  AI.finaleX = function (g, p, xMax) {
    if (xMax >= 10 && g.creatures(p).length >= 3) return xMax;
    // X creatures (Walking Ballista) would enter with no counters and die
    const pool = p.library.concat(p.graveyard).filter(o => o.def.types.includes("Creature") && o.def.mv <= xMax && !/\{X\}/.test(o.def.cost || ""));
    if (!pool.length) return 0;
    const best = pool.sort((a, b) => cardScore(g, p, b, { purpose: "tutor" }) - cardScore(g, p, a, { purpose: "tutor" }))[0];
    return best.def.mv;
  };

  /* ------------------------------------------------------------ the agent */
  const CASUAL = globalThis.__CASUAL || { life: 0.3, blockers: 0.3, lead: 8, spread: 6, home: 1, homeFrom: 1 };
  /* The brain a deck registered for its bots (see deckBrain), or null. */
  const brainOf = deckBrain;
  AI.brainOf = brainOf;

  AI.create = function (opts) {
    opts = opts || {};
    const skill = opts.skill == null ? 0.85 : opts.skill;
    const aggro = opts.aggression == null ? 0.5 : opts.aggression;
    // a casual (precon) table: attacks spread around and lean on whoever is ahead instead of piling
    // onto the weakest, and a blocker stays home. Real precon pods lose their first player later.
    const casual = !!opts.casual;
    const mem = { tried: new Map(), turn: -1, grudge: {}, loopTurn: -1, usedWindow: new Map() };
    const chance = (g, pr) => g.random() < pr;

    function resetTurn(g) {
      if (mem.turn !== g.turn) { mem.turn = g.turn; mem.tried = new Map(); mem.usedWindow = new Map(); }
    }
    function tryKey(act, phase) { return `${act.type}:${act.card.id}:${act.idx == null ? "" : act.idx}:${act.door == null ? "" : act.door}:${phase}`; }
    function attempts(act, phase) { return mem.tried.get(tryKey(act, phase)) || 0; }
    function noteTry(act, phase) { const k = tryKey(act, phase); mem.tried.set(k, (mem.tried.get(k) || 0) + 1); }

    /* ---------------- mulligan */
    function mulligan(g, p, { hand, mulls }) {
      const db = deckBrain(p);
      if (db && db.mulligan) { const r = db.mulligan(g, p, { hand, mulls }); if (r !== undefined) return r; }
      const lands = hand.filter(o => o.def.types.includes("Land")).length;
      const ramp = hand.filter(o => !o.def.types.includes("Land") && o.def.ai && o.def.ai.ramp && o.def.mv <= 2).length;
      if (mulls >= 2) return lands >= 1 && lands <= 6;
      if (lands >= 3 && lands <= 5) return true;
      if (lands === 2 && ramp >= 1) return true;
      if (lands === 6 && mulls >= 1) return true;
      return false;
    }

    /* ---------------- choosing a land to play */
    function landChoice(g, p, lands) {
      if (!lands.length) return null;
      const castNow = spellsCastable(g, p);
      const scored = lands.map(act => {
        const o = act.card; const d = o.def;
        let tapped = d.etbTapped === true;
        if (typeof d.etbTapped === "function") { try { tapped = !!d.etbTapped(g, { controller: p, def: d, id: -1 }); } catch (e) { tapped = true; } }
        let s = landScore(g, p, o);
        if (d.name === "Selesnya Sanctuary" && g.controlled(p, x => g.isLand(x)).length < 2) s -= 20;
        if (tapped) s += castNow ? -4 : 3;
        return { act, s };
      }).sort((a, b) => b.s - a.s);
      return scored[0].act;
    }
    function spellsCastable(g, p) {
      return p.hand.some(o => !o.def.types.includes("Land") && g.castOptions(p, o).length);
    }

    /* ---------------- scoring casts */
    /* What a removal card could hit: its spell's targets, an Aura's enchant target, or (a creature
       whose enters trigger picks the target, like Solitude) any opposing creature it can target. */
    function harmTargetsFor(g, p, o) {
      const d = o.def;
      const specs = (d.spell && d.spell.targets) || (d.aura && d.targets) || [];
      const spec = specs[0];
      if (!spec) {
        if (!d.types.includes("Creature")) return [];
        return g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c));
      }
      return g.targetOptions(p, spec, o).filter(t => !g.isPlayer(t) ? t.controller !== p : t !== p);
    }
    function bestThreat(g, p, list) {
      let best = null, bs = -1e9;
      for (const t of list) { if (g.isPlayer(t)) continue; const s = threat(g, t, p); if (s > bs) { bs = s; best = t; } }
      return { best, score: bs };
    }
    function alphaDamage(g, p, bonus) {
      // rough damage if everything attacks after a pump of +bonus
      const atk = g.creatures(p).filter(c => (!c.sick || g.kw(c, "haste")) && !c.tapped && !g.kw(c, "defender"));
      return atk.reduce((s, c) => s + Math.max(0, g.power(c) + bonus), 0);
    }
    function finisherGood(g, p, o) {
      const n = g.creatures(p).length;
      const opps = g.opponents(p);
      const minLife = Math.min(...opps.map(q => q.life));
      const name = o.def.name;
      let bonus = 0;
      if (name === "Craterhoof Behemoth") bonus = n + 1;
      else if (name === "Overwhelming Stampede") bonus = Math.max(0, ...g.creatures(p).map(c => g.power(c)));
      else if (name === "Triumph of the Hordes") return alphaDamage(g, p, 1) >= 10 && g.creatures(p).filter(c => !c.sick).length >= 4;
      else bonus = 2;
      const dmg = alphaDamage(g, p, bonus) + (name === "Craterhoof Behemoth" ? 5 + bonus : 0);
      const blockers = Math.max(...opps.map(q => g.creatures(q).filter(c => !c.tapped).length));
      return dmg - blockers * (bonus + 2) >= minLife || (n >= 6 && dmg >= minLife * 1.5);
    }
    function wipeGood(g, p, o) {
      const spares = o.def.ai && o.def.ai.spares;
      const hit = c => g.isCreature(c) && !g.kw(c, "indestructible") && !(spares && spares(c));
      const mine = g.battlefield.filter(c => c.controller === p && hit(c)).reduce((s, c) => s + value(g, c), 0);
      const theirs = g.battlefield.filter(c => c.controller !== p && hit(c)).reduce((s, c) => s + value(g, c), 0);
      return theirs >= 14 && theirs >= mine * 2 + 6;
    }
    function scoreCast(g, p, act, win) {
      const o = act.card, d = o.def, ai = hintOf(p, o);
      if (ai.never) return -1;
      if (ai.cast) { const r = ai.cast(g, p, o, { window: win }); if (r === false) return -1; if (typeof r === "number") return r; }
      const instant = isInstant(g, p, o);
      let s = 10 + (ai.priority != null ? ai.priority : 5) + d.mv * 0.6;
      if (ai.ramp) s += g.controlled(p, x => g.isLand(x)).length < 6 ? 6 : -3;
      if (ai.removal) {
        const { best, score } = bestThreat(g, p, harmTargetsFor(g, p, o));
        if (!best || score < (ai.minThreat || 3)) return -1;
        s += score * 0.5;
      }
      if (ai.wipe && !wipeGood(g, p, o)) return -1;
      if (ai.finisher && !finisherGood(g, p, o)) return win === "main1" && p.hand.length >= 6 && !d.types.includes("Sorcery") ? s - 8 : -1;
      if (ai.counter || ai.protection) return -1;
      if (ai.minCreatures && g.creatures(p).length < ai.minCreatures && p.hand.length > 1) return -1;
      if (ai.draw && p.hand.length >= 6) s -= 4;
      if (ai.instantEnd && instant && (win === "main1" || win === "main2")) return -1;
      if (ai.trick) return -1;
      if (o.isCommander) s += 5 - g.commanderTax(p, o) * 0.5;
      if (d.types.includes("Creature") && g.kw && d.keywords.includes("haste") && win === "main2") s -= 3;
      if (ai.hold && ai.hold(g, p, o)) return -1;
      // keep counter mana up in the second main phase
      if (win === "main2" && mem.keepUp && !o.isCommander) {
        const left = untappedMana(g, p) - MK.util.costMV(act.cost);
        if (left < mem.keepUp) s -= 12;
      }
      return s;
    }
    /* Casting a morph card face down: only when its hint says so. */
    function morphScore(g, p, act) {
      const ai = act.card.def.ai || {};
      if (!ai.morph) return -1;
      const r = ai.morph(g, p, act.card);
      return typeof r === "number" ? r : -1;
    }
    function chooseX(g, p, o, xMax) {
      const ai = o.def.ai || {};
      if (ai.x) return Math.max(0, Math.min(xMax, ai.x(g, p, o, xMax) | 0));
      return xMax;
    }

    /* ---------------- abilities */
    function abilityUse(g, p, act, win, turnOf) {
      const ab = act.ab, o = act.card;
      if (act.ab.loyalty != null) return null; // handled separately
      if (ab.ai && ab.ai.use) {
        let r;
        try { r = ab.ai.use(g, p, o, { window: win, turnOf }); } catch (e) { r = false; }
        if (!r) return null;
        return typeof r === "object" ? r : {};
      }
      // engine-made abilities
      if (ab.levelUp) return win === "main2" || win === "main1" ? {} : null;
      if (ab.unlock != null) return win === "main2" ? {} : null;
      if (ab.crew) return win === "main1" ? crewWorth(g, p, o, ab.crew) : null;
      if (ab.label === "Equip") return win === "main1" ? equipWorth(g, p, o) : null;
      return null;
    }
    function crewWorth(g, p, o, n) {
      if (o.sick) return null;
      const free = g.creatures(p).filter(c => !c.tapped && c !== o);
      const sickPow = power(g, free.filter(c => c.sick));
      if (sickPow >= n) return {};
      const weak = free.filter(c => !c.sick).sort((a, b) => g.power(a) - g.power(b));
      let pw = sickPow, used = 0;
      for (const c of weak) { if (pw >= n) break; pw += Math.max(0, g.power(c)); used += Math.max(0, g.power(c)); }
      return pw >= n && used + 1 < g.ch(o).p ? {} : null;
    }
    function equipWorth(g, p, o) {
      const cands = g.creatures(p).filter(c => c !== o.attachedTo);
      if (!cands.length) return null;
      if (!o.attachedTo) return {};
      if (o.def.name === "Skullclamp" && cands.some(c => g.toughness(c) === 1)) return {};
      return null;
    }
    function loyaltyChoice(g, p, acts) {
      // highest minus that says yes, else the best plus
      const sorted = acts.slice().sort((a, b) => a.ab.loyalty - b.ab.loyalty);
      for (const a of sorted) {
        if (a.ab.loyalty < 0 && a.ab.ai && a.ab.ai.use) { try { if (a.ab.ai.use(g, p, a.card, { window: "main1" })) return a; } catch (e) { } }
      }
      const plus = acts.filter(a => a.ab.loyalty >= 0).sort((a, b) => b.ab.loyalty - a.ab.loyalty);
      return plus[0] || null;
    }

    /* ---------------- deck plans: def.ai.plan(g, p, o, {window, actions}) returns an action or null.
       A deck's own brain (deckBrain) plans first. */
    function runPlans(g, p, win, acts) {
      const br = brainOf(p);
      if (br && br.plan) {
        let a = null;
        try { a = br.plan(g, p, { window: win, actions: acts }); } catch (e) { if (g.warn) g.warn(e); a = null; }
        if (a) {
          const key = `brain:${a.type}:${a.card && a.card.id}:${a.idx}:${a.alt}`;
          const n = mem.tried.get(key) || 0;
          if (n < (a.maxTries || 2)) { mem.tried.set(key, n + 1); return a; }
        }
      }
      const seen = new Set();
      const holders = g.controlled(p).concat(p.hand, p.command);
      for (const o of holders) {
        const plan = o.def.ai && o.def.ai.plan;
        if (!plan || seen.has(o.def.name)) continue;
        seen.add(o.def.name);
        let a = null;
        try { a = plan(g, p, o, { window: win, actions: acts }); } catch (e) { a = null; }
        if (!a) continue;
        const key = `plan:${o.def.name}:${a.type}:${a.card && a.card.id}:${a.idx}`;
        const n = mem.tried.get(key) || 0;
        if (n >= (a.maxTries || 2)) continue;
        mem.tried.set(key, n + 1);
        return a;
      }
      return null;
    }

    /* ---------------- main phase */
    function main(g, p, { phase }) {
      resetTurn(g);
      const win = phase;
      if (win === "main2") mem.keepUp = p.hand.some(o => hintOf(p, o).counter) ? 2 : 0;
      const acts = g.legalActions(p);
      if (!acts.length) return { type: "pass" };
      const fresh = a => attempts(a, win) < 2;
      // 0. deck plans (combos and sequencing written next to the cards)
      const planned = runPlans(g, p, win, acts);
      if (planned) return planned;
      // 1. winning abilities first
      for (const a of acts) if (a.type === "activate" && a.ab.ai && a.ab.ai.first && fresh(a)) {
        const u = abilityUse(g, p, a, win);
        if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
      }
      // 2. land
      const lands = acts.filter(a => a.type === "land" && fresh(a));
      if (lands.length && (win === "main1" || !spellsCastable(g, p) || true)) {
        const l = landChoice(g, p, lands);
        if (l) { noteTry(l, win); return l; }
      }
      // 3. spells
      const casts = acts.filter(a => a.type === "cast" && fresh(a)).map(a => ({ a, s: a.faceDown ? morphScore(g, p, a) : scoreCast(g, p, a, win) - (a.alt ? 2 : 0) })).filter(x => x.s > 0);
      // rooms: keep only the door the hint prefers
      const byCard = new Map();
      for (const c of casts) {
        const prev = byCard.get(c.a.card.id);
        if (c.a.door != null && c.a.card.def.ai && c.a.card.def.ai.door) { const want = c.a.card.def.ai.door(g, p); if (c.a.door === want) byCard.set(c.a.card.id, c); else if (!prev) byCard.set(c.a.card.id, c); }
        else if (!prev || c.s > prev.s) byCard.set(c.a.card.id, c);
      }
      const list = [...byCard.values()].sort((x, y) => y.s - x.s);
      if (list.length) {
        const pick = list[0].a;
        noteTry(pick, win);
        const out = { type: "cast", card: pick.card, door: pick.door, alt: pick.alt, faceDown: pick.faceDown };
        if (pick.xCount) out.x = chooseX(g, p, pick.card, pick.xMax);
        return out;
      }
      // 4. planeswalkers
      const pw = new Map();
      for (const a of acts) if (a.type === "activate" && a.ab.loyalty != null && fresh(a)) { if (!pw.has(a.card.id)) pw.set(a.card.id, []); pw.get(a.card.id).push(a); }
      for (const [, list2] of pw) {
        const a = loyaltyChoice(g, p, list2);
        if (a) { noteTry(a, win); return { type: "activate", card: a.card, idx: a.idx }; }
      }
      // 5. other abilities
      for (const a of acts) {
        if (a.type !== "activate" || a.ab.loyalty != null || !fresh(a)) continue;
        const u = abilityUse(g, p, a, win);
        if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
      }
      return { type: "pass" };
    }

    /* ---------------- attacking */
    function blockersOf(g, q) { return g.creatures(q).filter(c => !c.tapped); }
    function canBeBlockedBySome(g, a, blockers) { return blockers.filter(b => g.canBlock(b, a)); }
    /* Each attacker goes where its hit is worth the most. A hit is scored by the damage that gets
       past the blockers that defender has left (one blocker stops one attacker), the step it makes
       toward killing that player (life, commander damage or poison; a kill removes a seat), its
       combat-damage triggers, and the creature a bad block would cost us, all weighed by how
       dangerous that player is (threatModel). Attackers are placed biggest first, so a player
       whose blockers are used up starts to look open, and a lethal swing piles on. Against a
       runaway leader, attackers with only chip damage elsewhere stay home, and the whole team
       goes at the leader when that beats splitting up. Casual (precon) bots still lean on the
       leader, spread their attacks and keep a blocker home. */
    function attack(g, p, ctx) {
      if (g.opts && g.opts.legacyAttackSort) return attackOld(g, p, ctx);
      let { candidates } = ctx;
      const { targets } = ctx;
      resetTurn(g);
      const opps = g.opponents(p).filter(q => targets.includes(q));
      if (!opps.length) return [];
      // the deck's brain can declare the whole attack, or keep some creatures home
      const br = deckBrain(p);
      if (br && br.attack) {
        let r = null;
        try { r = br.attack(g, p, candidates, targets); } catch (e) { if (g.warn) g.warn(e); r = null; }
        if (r && r.decl) return r.decl;
        if (r && r.home) candidates = candidates.filter(c => !r.home.includes(c));
      }
      const tm = threatModel(g, p);
      // a runaway leader: well over a fair share of the opponents' chances to win
      const runaway = opps.length >= 2 && tm.top && tm.rel.get(tm.top) >= 1.8;
      // one roll per opponent, in seat order: weaker bots misjudge the table more
      const noise = new Map(opps.map(q => [q, g.random() * 3 * (1 - skill + 0.3)]));
      // crack-back risk: how hard the table can hit us next turn
      const threatIn = Math.max(...opps.map(o => power(g, g.creatures(o).filter(c => !g.kw(c, "defender")))));
      const danger = p.life <= threatIn * 1.2 + 4;
      // a swing that could kill someone keeps nothing home
      const atkPower = power(g, candidates);
      const infectPower = power(g, candidates.filter(c => g.kw(c, "infect")));
      const alphaAny = opps.some(q => atkPower - blockersOf(g, q).length * (atkPower / Math.max(1, candidates.length)) >= q.life || (infectPower > 0 && q.poison + infectPower >= 10));
      const keepBack = [];
      // the brain's pieces stay out of an attack that doesn't kill ("always": even one that does)
      if (br && br.keepHome) for (const c of candidates) { const k = br.keepHome(g, p, c); if (k === "always" || (k && !alphaAny)) keepBack.push(c); }
      const homeOrder = () => candidates.filter(c => !g.kw(c, "vigilance") && g.power(c) < 10).sort((a, b) => ((g.toughness(b) + g.power(b)) - (g.toughness(a) + g.power(a))) || (a.id - b.id));
      if (casual && !alphaAny && !danger && candidates.length >= CASUAL.homeFrom) keepBack.push(...homeOrder().slice(0, CASUAL.home));
      if (danger && !alphaAny) {
        // keep our best blockers home (vigilance ones can go); a finisher goes on offence
        const home = homeOrder();
        const need = Math.min(home.length, Math.max(1, Math.ceil(opps.reduce((n, o) => n + g.creatures(o).length, 0) / 3)));
        for (const c of home.slice(0, need)) if (!keepBack.includes(c)) keepBack.push(c);
      }
      // what each defending player has left as we place attackers
      let st = null, loySent = null;
      const reset = () => { st = new Map(opps.map(q => [q, { blk: blockersOf(g, q), dmg: 0, poison: 0, cmd: {}, n: 0 }])); loySent = new Map(); };
      reset();
      const hitVals = new Map();
      const hitOf = (a, q) => { const k = a.id + ":" + q.id; if (!hitVals.has(k)) hitVals.set(k, hitTriggerValue(g, p, a, q)); return hitVals.get(k); };
      /* The defender's likely block on a, from the blockers it has left: what it costs us, what it
         costs them, and how much damage still gets through. */
      function blockOf(a, q) {
        const s = st.get(q);
        const dmg = hitDamage(g, a);
        const cands = s.blk.filter(b => g.canBlock(b, a));
        const out = { pBlock: 0, loss: 0, gain: 0, stopper: null, through: dmg };
        if (!cands.length || (g.kw(a, "menace") && cands.length < 2)) return out;
        let bad = null, wall = null, trade = null, chump = null;
        for (const b of cands) {
          const f = fight(g, a, b);
          if (f.aDies && !f.bDies) { if (!bad) bad = b; }
          else if (!f.aDies && !f.bDies) { if (!wall) wall = b; }
          else if (f.aDies && f.bDies) { if (!trade) trade = b; }
          else if (!chump || value(g, b) < value(g, chump)) chump = b;
        }
        const lethal = s.dmg + dmg >= q.life || (a.isCommander && (q.cmdDmg[a.id] || 0) + (s.cmd[a.id] || 0) + dmg >= 21);
        const keep = g.kw(a, "indestructible") ? 0 : value(g, a);
        if (bad) { out.pBlock = 0.85; out.stopper = bad; out.loss = keep * 0.85; }
        else if (wall) { out.pBlock = 0.7; out.stopper = wall; }
        else if (trade) { out.pBlock = 0.5; out.stopper = trade; out.loss = keep * 0.5; out.gain = value(g, trade) * 0.5; }
        else { out.pBlock = lethal ? 0.9 : 0.2; out.stopper = chump; out.gain = value(g, chump) * out.pBlock * 0.8; }
        const over = g.kw(a, "trample") ? Math.max(0, dmg - (g.kw(a, "deathtouch") ? 1 : lethalFor(g, out.stopper))) : 0;
        out.through = dmg * (1 - out.pBlock) + over * out.pBlock;
        out.connect = over > 0 ? 1 : 1 - out.pBlock;
        return out;
      }
      /* What sending a at target t gains. */
      function hitScore(a, t) {
        const q = g.defenderOf(t), s = st.get(q);
        if (!s) return { score: -1e9 };
        const rel = tm.rel.get(q) || 1;
        // damage is worth what it takes off that player's chance to win: hitting a player who is
        // out of the race helps whoever is winning
        const m = rel;
        const b = blockOf(a, q);
        if (b.connect == null) b.connect = 1;
        let score = b.gain - b.loss + noise.get(q) + Math.min(2, (mem.grudge[q.id] || 0) * 0.05);
        if (casual) score += (q === tm.top ? CASUAL.lead * 0.3 : 0) - (mem.lastTarget === q.id ? CASUAL.spread * 0.3 : 0);
        if (!g.isPlayer(t)) {
          // a planeswalker: killing it is worth its threat, a dent is worth a share of it
          const left = (t.counters.loyalty || 0) - (loySent.get(t) || 0);
          if (left <= 0) return { score: -1e9 };
          const pv = threat(g, t, p) * (0.7 + 0.3 * rel);
          score += b.through >= left ? pv : pv * 0.4 * b.through / left;
          return { score, b };
        }
        let dv = 0, kill = false;
        if (g.kw(a, "infect")) {
          const left = Math.max(1, 10 - q.poison - s.poison);
          dv = Math.min(b.through, left) * 4 * (0.6 + 12 / (left * 4 + 8));
          kill = b.through >= left;
        } else {
          const lifeLeft = q.life - s.dmg;
          const cmdLeft = a.isCommander ? 21 - (q.cmdDmg[a.id] || 0) - (s.cmd[a.id] || 0) : Infinity;
          const left = Math.max(1, Math.min(lifeLeft, cmdLeft));
          // damage counts for more as the player nears death; casual players care less about that
          const lw = casual ? 0.8 + 6 / (left + 8) : 0.6 + 12 / (left + 8);
          dv = Math.min(b.through, left) * lw;
          kill = lifeLeft > 0 && b.through >= left;
        }
        score += dv * m + hitOf(a, q) * b.connect * (0.8 + 0.2 * rel);
        if (kill) score += 6 + 6 * rel;
        return { score, b, kill };
      }
      function commit(a, t, b) {
        const q = g.defenderOf(t), s = st.get(q);
        if (!s || !b) return;
        s.n++;
        if (b.stopper && b.pBlock >= 0.5) s.blk = s.blk.filter(x => x !== b.stopper);
        if (!g.isPlayer(t)) { loySent.set(t, (loySent.get(t) || 0) + b.through); return; }
        if (g.kw(a, "infect")) s.poison += b.through;
        else { s.dmg += b.through; if (a.isCommander) s.cmd[a.id] = (s.cmd[a.id] || 0) + b.through; }
      }
      // place the attackers, biggest first
      const order = candidates.filter(a => !keepBack.includes(a) && (g.power(a) > 0 || a.def.triggers.some(t => t.on === "attacks"))).sort((x, y) => (hitDamage(g, y) - hitDamage(g, x)) || (x.id - y.id));
      // a card's own say (Etrata, the Silencer stacks hit counters on one player)
      const hook = new Map();
      for (const a of order) if (a.def.ai && a.def.ai.attackTarget) { const t = a.def.ai.attackTarget(g, p, a, targets); if (t && targets.includes(t)) hook.set(a, t); }
      // plan 1: each attacker where it's worth the most, given the attackers placed before it
      let plan = [], total = 0;
      for (const a of order) {
        let target = hook.get(a) || null, best = target ? hitScore(a, target) : null;
        if (!target) {
          for (const t of targets) {
            if (!g.isPlayer(t) && !st.has(t.controller)) continue;
            const h = hitScore(a, t);
            if (!best || h.score > best.score) { best = h; target = t; }
          }
        }
        if (!target) continue;
        // with a runaway leader at the table, chip damage on anyone else only helps the leader:
        // an attacker with nothing better to do stays home to block (vigilance ones can go)
        if (runaway && !hook.has(a) && g.defenderOf(target) !== tm.top && !best.kill && best.score < 2 && !g.kw(a, "vigilance")) continue;
        commit(a, target, best.b);
        plan.push({ a, target });
        total += best.score;
      }
      // plan 2: everyone at the most dangerous player. A defender blocks one attacker per blocker,
      // so a big blocker that scares off each attacker alone eats one of them and lets the rest
      // through. Worth it when the whole swing beats plan 1 and we aren't left open to die.
      let swarm = false;
      const top = tm.top;
      if (top && !danger && order.length >= 2) {
        const keep = { st, loySent };
        reset();
        const plan2 = [];
        let total2 = 0;
        for (const a of order) {
          if (a.def.mana.length && g.power(a) <= 1) continue;
          const t = hook.get(a) || top;
          const h = hitScore(a, t);
          commit(a, t, h.b);
          plan2.push({ a, target: t });
          total2 += h.score;
        }
        if (plan2.filter(x => x.target === top).length >= 2 && total2 > total + 1) { plan = plan2; swarm = true; }
        else { st = keep.st; loySent = keep.loySent; }
      }
      // a player the planned damage kills: everyone aimed there goes in
      const lethalAt = q => { const s = st.get(q); return !!s && (s.dmg >= q.life || q.poison + s.poison >= 10 || Object.keys(s.cmd).some(id => (q.cmdDmg[id] || 0) + s.cmd[id] >= 21)); };
      const decl = [];
      for (const { a, target } of plan) {
        const tq = g.defenderOf(target);
        const bl = canBeBlockedBySome(g, a, blockersOf(g, tq));
        const alpha = lethalAt(tq);
        let go;
        if (alpha) go = true;
        else if (!bl.length) go = true;
        else if (swarm && tq === top) go = true;
        else {
          const bad = bl.some(b => { const f = fight(g, a, b); return f.aDies && !f.bDies; });
          const trade = bl.some(b => { const f = fight(g, a, b); return f.aDies && f.bDies; });
          if (!bad && !trade) go = true;
          else if (!bad && trade) go = chance(g, aggro * 0.8) || value(g, a) < 3 || pushed(g, p, a);
          else go = g.kw(a, "indestructible") || (a.isToken && g.power(a) <= 1 && chance(g, aggro * 0.3));
        }
        if (a.def.mana.length && g.power(a) <= 1 && !alpha) go = false;
        // a card's own say: false keeps it home (an engine commander), true sends it (a creature whose hit wins)
        if (!alpha && a.def.ai && a.def.ai.attack) { const say = a.def.ai.attack(g, p, a, bl); if (say === false) go = false; else if (say === true) go = true; }
        if (go) decl.push({ attacker: a, target });
      }
      // remember the player we sent the most at (casual tables spread their attacks)
      const count = new Map();
      for (const d of decl) { const tq = g.defenderOf(d.target); count.set(tq, (count.get(tq) || 0) + 1); }
      let most = null;
      for (const [tq, n] of count) if (!most || n > count.get(most)) most = tq;
      if (most) mem.lastTarget = most.id;
      return decl;
    }
    /* The attack before per-attacker judgment: one opponent for the whole attack. Games recorded
       before engine 3 (legacyAttackSort) still play it, so their replays match. */
    function attackOld(g, p, { candidates, targets }) {
      resetTurn(g);
      const opps = g.opponents(p);
      if (!opps.length) return [];
      // the deck's brain can declare the whole attack, or keep some creatures home
      const br = brainOf(p);
      if (br && br.attack) {
        let r = null;
        try { r = br.attack(g, p, candidates, targets); } catch (e) { if (g.warn) g.warn(e); r = null; }
        if (r && r.decl) return r.decl;
        if (r && r.home) candidates = candidates.filter(c => !r.home.includes(c));
      }
      // who to hit: low life, weak defence, grudges, a bit of the leader
      const lead = leaderOld(g, p);
      const scoreQ = q => {
        const bl = blockersOf(g, q);
        let s = 40 - q.life + (mem.grudge[q.id] || 0) * 0.4 - bl.length * 2 + (q === lead ? 4 : 0);
        if (casual) s = (40 - q.life) * CASUAL.life + (mem.grudge[q.id] || 0) * 0.4 - bl.length * 2 * CASUAL.blockers + (q === lead ? CASUAL.lead : 0) - (mem.lastTarget === q.id ? CASUAL.spread : 0);
        s += g.random() * 6 * (1 - skill + 0.3);
        return s;
      };
      // score each opponent once: a comparator that rolls dice makes the number of rolls depend on
      // the browser's sort, so the same seed played out differently in Chrome and Node. Games
      // recorded before engine 3 keep the old order so their replays still match.
      let ranked;
      if (g.opts && g.opts.legacyAttackSort) ranked = opps.slice().sort((a, b) => scoreQ(b) - scoreQ(a));
      else { const sc = new Map(opps.map(q => [q, scoreQ(q)])); ranked = opps.slice().sort((a, b) => sc.get(b) - sc.get(a)); }
      const q = ranked[0];
      const qBlockers = blockersOf(g, q);
      // crack-back risk: how hard the table can hit us next turn
      const threatIn = Math.max(...opps.map(o => power(g, g.creatures(o).filter(c => !g.kw(c, "defender")))));
      const danger = p.life <= threatIn * 1.2 + 4;
      const decl = [];
      const atkPower = power(g, candidates);
      const absorb = qBlockers.length * (atkPower / Math.max(1, candidates.length));
      const alpha = atkPower - absorb >= q.life || (q.poison + power(g, candidates.filter(c => g.kw(c, "infect"))) >= 10 && candidates.some(c => g.kw(c, "infect")));
      const keepBack = [];
      const db = deckBrain(p), keep = db && db.keepHome;
      if (casual && !alpha && !danger && candidates.length >= CASUAL.homeFrom) {
        // a casual player keeps a blocker home
        const home = candidates.filter(c => !g.kw(c, "vigilance") && g.power(c) < 10).sort((a, b) => (g.toughness(b) + g.power(b)) - (g.toughness(a) + g.power(a)));
        keepBack.push(...home.slice(0, CASUAL.home));
      }
      if (danger && !alpha) {
        // keep our best blockers home (vigilance ones can go)
        // a finisher (Marit Lage, a huge flier) goes on offence: keeping it home loses the race
        const home = candidates.filter(c => !g.kw(c, "vigilance") && g.power(c) < 10).sort((a, b) => (g.toughness(b) + g.power(b)) - (g.toughness(a) + g.power(a)));
        const need = Math.min(home.length, Math.max(1, Math.ceil(opps.reduce((n, o) => n + g.creatures(o).length, 0) / 3)));
        keepBack.push(...home.slice(0, need));
      }
      for (const a of candidates) {
        if (keepBack.includes(a)) continue;
        if (g.power(a) <= 0 && !a.def.triggers.some(t => t.on === "attacks")) continue;
        const target = pickAttackTarget(g, p, a, q, targets);
        const tq = g.defenderOf(target);
        const bl = canBeBlockedBySome(g, a, blockersOf(g, tq));
        let go;
        if (alpha) go = true;
        else if (!bl.length) go = true;
        else {
          const bad = bl.some(b => { const f = fight(g, a, b); return f.aDies && !f.bDies; });
          const trade = bl.some(b => { const f = fight(g, a, b); return f.aDies && f.bDies; });
          if (!bad && !trade) go = true;
          else if (!bad && trade) go = chance(g, aggro * 0.8) || value(g, a) < 3 || pushed(g, p, a);
          else go = g.kw(a, "indestructible") || (a.isToken && g.power(a) <= 1 && chance(g, aggro * 0.3));
        }
        if (a.def.mana.length && g.power(a) <= 1 && !alpha) go = false;
        // a card's own say: false keeps it home (an engine commander), true sends it (a creature whose hit wins)
        if (!alpha && a.def.ai && a.def.ai.attack) { const say = a.def.ai.attack(g, p, a, bl); if (say === false) go = false; else if (say === true) go = true; }
        if (keep) { const k = keep(g, p, a); if (k === "always" || (k && !alpha)) go = false; }
        if (go) decl.push({ attacker: a, target });
      }
      for (const d of decl) { const tq = g.defenderOf(d.target); mem.lastTarget = tq.id; }
      return decl;
    }
    /* A permanent can ask for an attacker to go in even into a trade (ai.pushAttack): Etrata wants
       every Assassin connecting, because each hit cloaks another card. */
    function pushed(g, p, a) { return g.controlled(p, s => s.def.ai && s.def.ai.pushAttack).some(s => { try { return s.def.ai.pushAttack(g, p, a); } catch (e) { return false; } }); }
    function pickAttackTarget(g, p, a, q, targets) {
      // a card's own say (Etrata, the Silencer stacks hit counters on one player)
      if (a.def.ai && a.def.ai.attackTarget) { const t = a.def.ai.attackTarget(g, p, a, targets); if (t && targets.includes(t)) return t; }
      // a finisher hits whoever it kills, else whoever can't block it
      if (g.power(a) >= 10) {
        const opps = g.opponents(p).filter(o => targets.includes(o));
        const open = opps.filter(o => !canBeBlockedBySome(g, a, blockersOf(g, o)).length);
        const pool = open.length ? open : opps;
        const kill = pool.filter(o => o.life <= g.power(a));
        if (kill.length) return kill.sort((x, y) => x.life - y.life)[0];
        if (open.length && !open.includes(q)) return open.sort((x, y) => x.life - y.life)[0];
      }
      // a planeswalker we can kill outright is worth it
      // an attacker that wants to connect goes where nobody can block it
      if (pushed(g, p, a) && canBeBlockedBySome(g, a, blockersOf(g, q)).length) {
        const open = g.opponents(p).filter(o => targets.includes(o) && !canBeBlockedBySome(g, a, blockersOf(g, o)).length);
        if (open.length) return open.sort((x, y) => x.life - y.life)[0];
      }
      const pws = targets.filter(t => !g.isPlayer(t) && t.controller === q);
      for (const w of pws) if ((w.counters.loyalty || 0) <= g.power(a) && threat(g, w, p) >= 6) return w;
      return q;
    }

    /* ---------------- blocking */
    function block(g, q, { attackers }) {
      resetTurn(g);
      const mine = g.creatures(q).filter(c => !c.tapped);
      const used = new Set();
      const blocks = [];
      const incoming = attackers.slice().sort((a, b) => g.power(b) - g.power(a));
      for (const a of incoming) mem.grudge[a.controller.id] = (mem.grudge[a.controller.id] || 0) + Math.max(0, g.power(a));
      const unblocked = () => incoming.filter(a => !blocks.some(b => b.attacker === a));
      // 1. good blocks: we survive and kill it, or we survive
      for (const a of incoming) {
        if (g.kw(a, "menace")) continue;
        const cands = mine.filter(b => !used.has(b.id) && g.canBlock(b, a));
        let best = null, bs = -1e9;
        for (const b of cands) {
          const f = fight(g, a, b);
          let s = -1e9;
          if (!f.bDies && f.aDies) s = 10 + value(g, a) - value(g, b) * 0.2;
          else if (!f.bDies && g.power(a) >= 3) s = 4 + g.power(a) * 0.5 - value(g, b) * 0.1;
          else if (f.bDies && f.aDies && value(g, b) + 1 < value(g, a)) s = 2 + value(g, a) - value(g, b);
          if (s > bs) { bs = s; best = b; }
        }
        if (best && bs > 0 && chance(g, 0.6 + skill * 0.4)) { used.add(best.id); blocks.push({ blocker: best, attacker: a }); }
      }
      // 2. survive: chump the biggest unblocked hits if they would kill us
      const dmgOf = list => list.reduce((s, a) => s + (g.kw(a, "infect") ? 0 : Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1)), 0);
      const poisonOf = list => list.reduce((s, a) => s + (g.kw(a, "infect") ? Math.max(0, g.power(a)) : 0), 0);
      const cmdDanger = a => a.isCommander && (q.cmdDmg[a.id] || 0) + g.power(a) >= 21;
      let rest = unblocked();
      let guard = 0;
      while ((dmgOf(rest) >= q.life || q.poison + poisonOf(rest) >= 10 || rest.some(cmdDanger)) && guard++ < 20) {
        const a = rest.filter(x => !g.kw(x, "menace")).sort((x, y) => (cmdDanger(y) - cmdDanger(x)) || (g.power(y) - g.power(x)))[0];
        if (!a) break;
        const cands = mine.filter(b => !used.has(b.id) && g.canBlock(b, a)).sort((x, y) => value(g, x) - value(g, y));
        if (!cands.length) { rest = rest.filter(x => x !== a); continue; }
        used.add(cands[0].id);
        blocks.push({ blocker: cands[0], attacker: a });
        rest = unblocked();
      }
      return blocks;
    }

    /* ---------------- responding */
    function isOppSpell(g, q, item) { return item && item.p !== q; }
    function spellDanger(g, q, item) {
      const d = item.o.def, ai = d.ai || {};
      let s = d.mv;
      if (ai.wipe) s += 8;
      if (ai.finisher) s += 8;
      if (ai.removal && item.targets.some(t => t && !g.isPlayer(t) && t.controller === q)) s += 4 + Math.max(...item.targets.filter(t => t && !g.isPlayer(t)).map(t => value(g, t)));
      if (item.o.isCommander) s += 3;
      if (ai.threat) s += ai.threat;
      if (ai.tutor) s += 3;
      return s;
    }
    /* The counterspell can target that spell (Dispel, An Offer You Can't Refuse, Wash Away). */
    function counterFits(g, q, act, top) {
      const d = act.card.def;
      if (d.modes) return true;
      const specs = act.alt && d.altCosts && d.altCosts[act.alt - 1].targets ? d.altCosts[act.alt - 1].targets : ((d.spell && d.spell.targets) || []);
      const spec = specs[0];
      if (!spec || spec.kind !== "spell") return true;
      return g.legalTarget(q, spec, top, act.card);
    }
    /* Instant removal on the biggest unblocked attacker coming at q, when the attack hurts. */
    function killAttacker(g, q, acts, win) {
      const c = g.combat;
      const atMe = c.attackers.filter(a => a.combat && g.defenderOf(a.combat.attacking) === q && !a.combat.wasBlocked);
      const dmg = power(g, atMe);
      if (!atMe.length || !(dmg >= q.life || dmg >= 8)) return null;
      const rem = acts.filter(a => a.type === "cast" && hintOf(q, a.card).removal && isInstant(g, q, a.card));
      for (const r of rem) {
        const spec = (r.card.def.spell && r.card.def.spell.targets || [])[0];
        if (!spec) continue;
        const opts = g.targetOptions(q, spec, r.card).filter(t => atMe.includes(t));
        if (!opts.length || attempts(r, "combat") >= 1) continue;
        const t = opts.sort((x, y) => g.power(y) - g.power(x))[0];
        noteTry(r, "combat");
        return { type: "cast", card: r.card, targets: [t], alt: r.alt };
      }
      return null;
    }
    function respond(g, q, ctx) {
      resetTurn(g);
      const acts = ctx.actions || [];
      const win = ctx.window;
      const planned = runPlans(g, q, win, acts);
      if (planned) return planned;
      // winning abilities
      for (const a of acts) if (a.type === "activate" && a.ab.ai && a.ab.ai.first) {
        const u = abilityUse(g, q, a, win, ctx.turnOf);
        if (u && attempts(a, win) < 1) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
      }
      if (win === "stack") {
        const top = ctx.top;
        if (!top || !isOppSpell(g, q, top)) return null;
        const danger = spellDanger(g, q, top);
        // counterspells
        const counters = acts.filter(a => a.type === "cast" && hintOf(q, a.card).counter && counterFits(g, q, a, top));
        // a hand full of counterspells spends them on smaller threats too
        const held = q.hand.filter(o => hintOf(q, o).counter).length;
        const bar = Math.max(3, 6 * (1.2 - skill * 0.4) - Math.max(0, held - 1) * 1.5);
        if (counters.length && danger >= bar) {
          const c = counters.sort((x, y) => x.card.def.mv - y.card.def.mv)[0];
          if (attempts(c, win) < 1) { noteTry(c, win); return { type: "cast", card: c.card, targets: [top], alt: c.alt }; }
        }
        // abilities that answer a spell (turning Kheru Spellsnatcher or Willbender face up)
        for (const a of acts) {
          if (a.type !== "activate" || !a.ab.ai || !a.ab.ai.inStack || attempts(a, win) >= 1) continue;
          const u = abilityUse(g, q, a, win, ctx.turnOf);
          if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
        }
        // protection against a wipe or removal on our best creature
        const hurts = (top.o.def.ai && top.o.def.ai.wipe) || (top.o.def.ai && top.o.def.ai.removal && top.targets.some(t => t && !g.isPlayer(t) && t.controller === q && value(g, t) >= 6));
        if (hurts) {
          const prot = acts.filter(a => { const h = a.type === "cast" && hintOf(q, a.card); return h && h.protection && (!h.protects || h.protects(g, q, top)); });
          const cmdHit = top.targets.some(t => t && !g.isPlayer(t) && t.controller === q && t.isCommander);
          if (prot.length && (boardValue(g, q) >= 12 || cmdHit)) {
            const c = prot[0];
            if (attempts(c, win) < 1) { noteTry(c, win); const out = { type: "cast", card: c.card, alt: c.alt }; if (c.xCount) out.x = chooseX(g, q, c.card, c.xMax); return out; }
          }
        }
        return null;
      }
      // an opponent's activated or triggered ability on the stack
      if (win === "ability") {
        const top = ctx.top;
        if (!top || top.p === q) return null;
        // abilities that answer one (turning Willbender face up)
        for (const a of acts) {
          if (a.type !== "activate" || !a.ab.ai || !a.ab.ai.inStack || attempts(a, win) >= 1) continue;
          const u = abilityUse(g, q, a, win, ctx.turnOf);
          if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
        }
        // protection when the ability would destroy, exile or bounce our best creature
        const harm = top.kind === "ability" && (top.ab.targets || []).some(sp => sp.purpose === "harm");
        const hit = harm && top.targets.some(t => t && !g.isPlayer(t) && !t.kind && t.controller === q && (value(g, t) >= 6 || t.isCommander));
        if (!hit) return null;
        const prot = acts.filter(a => { const h = a.type === "cast" && hintOf(q, a.card); return h && h.protection && (!h.protects || h.protects(g, q, top)); });
        const c = prot[0];
        if (!c || attempts(c, win) >= 1) return null;
        noteTry(c, win);
        const out = { type: "cast", card: c.card, alt: c.alt };
        if (c.xCount) out.x = chooseX(g, q, c.card, c.xMax);
        return out;
      }
      // attackers are declared, blockers aren't yet: remove a big one coming at us
      if (win === "attackers") return g.combat && g.combat.attacker !== q ? killAttacker(g, q, acts, win) : null;
      if (win === "combat") {
        const c = g.combat;
        if (!c) return null;
        // defending: remove a big attacker coming at us
        if (c.attacker !== q) { const k = killAttacker(g, q, acts, win); if (k) return k; }
        // tricks
        for (const a of acts) {
          if (a.type === "cast" && a.card.def.ai && a.card.def.ai.trick && attempts(a, win) < 1) {
            const ok = a.card.def.ai.trick === true ? c.attacker === q && c.attackers.some(x => x.controller === q && x.combat && x.combat.wasBlocked) : a.card.def.ai.trick(g, q, a.card);
            if (ok) { noteTry(a, win); return { type: "cast", card: a.card, alt: a.alt }; }
          }
        }
        // instants that pick a mode for combat (Return of the Wildspeaker)
        for (const a of acts) {
          if (a.type !== "cast" || attempts(a, win) >= 1) continue;
          const ai = a.card.def.ai || {};
          if (ai.combat && ai.combat(g, q, a.card)) { noteTry(a, win); return { type: "cast", card: a.card, alt: a.alt }; }
        }
        for (const a of acts) {
          if (a.type !== "activate" || attempts(a, win) >= 3) continue;
          const u = abilityUse(g, q, a, win, ctx.turnOf);
          if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
        }
        return null;
      }
      if (win === "end") {
        const mineNext = g.nextPlayer(ctx.turnOf) === q;
        // flash and end-of-turn instants, just before our turn
        if (mineNext) {
          const cands = acts.filter(a => a.type === "cast" && attempts(a, win) < 1).map(a => {
            const ai = hintOf(q, a.card);
            if (ai.counter || ai.never || ai.trick) return null;
            if (ai.protection && !ai.instantEnd) return null;
            if (ai.removal) { const { best, score } = bestThreat(g, q, harmTargetsFor(g, q, a.card)); if (!best || score < (ai.minThreat || 3) + 1) return null; return { a, s: 20 + score }; }
            if (ai.instantEnd || a.card.def.keywords.includes("flash") || !a.card.def.types.includes("Instant")) return { a, s: 10 + (ai.priority || 5) + a.card.def.mv };
            return null;
          }).filter(Boolean).sort((x, y) => y.s - x.s);
          if (cands.length) {
            const pick = cands[0].a;
            noteTry(pick, win);
            const out = { type: "cast", card: pick.card, alt: pick.alt };
            if (pick.xCount) out.x = chooseX(g, q, pick.card, pick.xMax);
            return out;
          }
        }
        for (const a of acts) {
          if (a.type !== "activate" || attempts(a, win) >= 3) continue;
          const u = abilityUse(g, q, a, win, ctx.turnOf);
          if (u) { noteTry(a, win); return Object.assign({ type: "activate", card: a.card, idx: a.idx }, u); }
        }
        return null;
      }
      return null;
    }

    /* ---------------- all other choices */
    function choose(g, p, req) {
      const pur = req.purpose;
      const src = req.src;
      const def = src && src.def;
      // the deck's brain answers first (undefined: no opinion)
      const br = deckBrain(p);
      if (br && br.choose) {
        let r;
        try { r = br.choose(g, p, req); } catch (e) { if (g.warn) g.warn(e); r = undefined; }
        if (r !== undefined) return r;
      }
      switch (req.type) {
        case "confirm": {
          if (pur === "demonstrate") return false;
          if (pur === "brambleCopy") return !!req.target && req.target.controller === p && !req.target.def.supertypes.includes("Legendary") && value(g, req.target) >= 4;
          if (def && def.ai && def.ai.confirm) { try { return !!def.ai.confirm(g, p, req); } catch (e) { return true; } }
          return true;
        }
        case "number": {
          if (pur === "x" && src && src.def) {
            if (req.ability && req.ability.ai && req.ability.ai.x) return Math.max(req.min, Math.min(req.max, req.ability.ai.x(g, p, src, req.max) | 0));
            return chooseX(g, p, src, req.max);
          }
          return req.max;
        }
        case "option": {
          if (pur === "mode" && def && def.ai && def.ai.mode) {
            const m = def.ai.mode(g, p, src);
            if (req.options.some(o => o.id === m)) return m;
          }
          if (pur === "ghaltaMode") return req.big >= req.count * 1.5 + 2 ? 0 : 1;
          if (def && def.ai && def.ai.option) { const m = def.ai.option(g, p, req); if (req.options.some(o => o.id === m)) return m; }
          return req.options[0].id;
        }
        case "player": {
          const opts = req.options;
          if (pur === "demonstrateOpponent") return opts.slice().sort((a, b) => boardValue(g, a) - boardValue(g, b))[0];
          if (pur === "harm" || !pur) { const lead = leader(g, p); return opts.includes(lead) ? lead : opts[0]; }
          return opts[0];
        }
        case "target": {
          const opts = req.options;
          if (!opts.length) return null;
          if (def && def.ai && def.ai.target) { const t = def.ai.target(g, p, req); if (t !== undefined && (t === null ? req.optional : opts.includes(t))) return t; }
          // a spell on the stack (counterspells): the most dangerous opponent's spell, never our own
          if (req.spec && req.spec.kind === "spell" && pur !== "redirect") {
            const theirs = opts.filter(it => it && it.p && it.p !== p);
            return theirs.sort((a, b) => spellDanger(g, p, b) - spellDanger(g, p, a))[0] || null;
          }
          switch (pur) {
            case "harm": return pickHarm(g, p, opts, req);
            case "help": case "equip":
              if (pur === "equip" && def && def.ai && def.ai.equipTarget) { const t = def.ai.equipTarget(g, p, opts); if (t) return t; }
              if (pur === "equip" && def && def.name === "Skullclamp") { const t = opts.filter(o => g.toughness(o) === 1).sort((a, b) => value(g, a) - value(g, b))[0]; if (t) return t; }
              return pickHelp(g, p, opts, req);
            case "counter": return pickCounter(g, p, opts, req);
            case "populate": case "copy": return tokenPick(g, p, opts);
            case "sacrifice": return pickCheapest(g, p, opts);
            case "reanimate": return opts.slice().sort((a, b) => cardScore(g, p, b, req) - cardScore(g, p, a, req))[0];
            case "bounceOwnLand": {
              const s = opts.filter(o => o !== src && o.tapped && !o.def.abilities.length).sort((a, b) => (g.isBasic(b) - g.isBasic(a)));
              return s[0] || opts.find(o => o !== src) || opts[0];
            }
            default: {
              // unknown purpose: own things for friendly effects, else harm
              if (opts.every(o => !g.isPlayer(o) && o.controller === p)) return pickHelp(g, p, opts, req);
              return pickHarm(g, p, opts, req);
            }
          }
        }
        case "targets": return (req.options || []).slice(0, req.max || 1);
        case "cards": {
          // a card can pick for itself (Azusa's land searches find the missing Dark Depths piece)
          if (def && def.ai && def.ai.cards) { try { const r = def.ai.cards(g, p, req); if (r) return r; } catch (e) { /* fall back */ } }
          return pickCards(g, p, req);
        }
        case "distribute": {
          const opts = req.options.slice().sort((a, b) => helpScore(g, b) - helpScore(g, a));
          const top = opts.slice(0, Math.min(3, opts.length));
          const map = {};
          for (let i = 0; i < req.total; i++) { const o = top[i % top.length]; map[o.id] = (map[o.id] || 0) + 1; }
          return map;
        }
        default: return null;
      }
    }

    const agent = { bot: true, skill, aggression: aggro, mem, mulligan, main, attack, block, respond, choose };
    return agent;
  };

})(typeof window !== "undefined" ? window : globalThis);
