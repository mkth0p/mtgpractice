/* Krenko, Mob Boss: a Bracket 4 mono-red Goblins deck for the bots.
   How it wins: Krenko doubles the Goblin count every turn, and Impact Tremors, Purphoros, Goblin
   Bombardment, Pashalik Mons and Boggart Shenanigans turn those Goblins into damage. Kiki-Jiki or
   Splinter Twin with Zealous Conscripts is an untap loop (as many hasty copies as it wants), and
   Thornbite Staff untaps Krenko or Kiki-Jiki whenever a creature dies. Lords, haste, menace and
   Shared Animosity make the swarm lethal in combat.
   Card text follows the Oracle text. Where the engine simplifies a card, `note` says how.
   Krenko's `ai.plan` (brain() below) is the deck's brain: combos, lethal burn, responses,
   Skullclamp, haste equipment and rituals. See ENGINE.md. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};

  /* ================================================================ helpers */
  const KRENKO = "Krenko, Mob Boss", KIKI = "Kiki-Jiki, Mirror Breaker", CONSCRIPTS = "Zealous Conscripts";
  const BOMB = "Goblin Bombardment", TWIN = "Splinter Twin", STAFF = "Thornbite Staff";
  const HASTE_GEAR = ["Swiftfoot Boots", "Lightning Greaves"];
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const isGoblin = (g, o) => g.hasSub(o, "Goblin");
  /* A cheap Goblin test for static abilities: g.hasSub inside `applies` would recurse into ch(). */
  const gobQuick = (g, o) => o.def.subtypes.includes("Goblin") || !!o.def.changeling ||
    !!(o.state.animated && o.state.animated.turn === g.turn && (o.state.animated.subtypes || []).includes("Goblin"));
  const goblinsOf = (g, p) => g.controlled(p, o => isGoblin(g, o));
  const mineNamed = (g, p, name) => g.battlefield.find(o => o.controller === p && o.def.name === name) || null;
  const nextIsMe = (g, p) => g.active !== p && g.nextPlayer(g.active) === p;
  const attackingMine = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield") : []);
  const value = (g, o) => (AI().value ? AI().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : value(g, o));
  const lowestLife = list => list.slice().sort((a, b) => a.life - b.life)[0] || null;
  const memo = new WeakMap();
  const M = p => { let m = memo.get(p); if (!m) { m = {}; memo.set(p, m); } return m; };
  /* Mana p could still make this step (cached per game state version). */
  function manaLeft(g, p) {
    const m = M(p);
    if (m.manaV !== g.v) { m.manaV = g.v; m.mana = g.maxX(p, MK.parseCost(""), 1); }
    return m.mana;
  }
  const findAct = (acts, f) => acts.find(a => { try { return f(a); } catch (e) { return false; } }) || null;
  const bombAct = acts => findAct(acts, a => a.type === "activate" && a.card.def.name === BOMB && a.ab.sacCost);
  /* "Tap: ..." on a creature can be used now (the engine's summoning-sickness rule). */
  const canTapNow = (g, o) => !o.tapped && (!o.sick || g.kw(o, "haste"));

  /* ---------- sacrifices and damage targets */
  const KEYS = new Set([KRENKO, KIKI, CONSCRIPTS, "Purphoros, God of the Forge", "Pashalik Mons", "Goblin Sharpshooter",
    "Muxus, Goblin Grandee", "Goblin Chieftain", "Goblin Warchief", "Goblin King", "Siege-Gang Commander", "Legion Warboss",
    "Krenko, Tin Street Kingpin", "Hellrider"]);
  /* Lower means "sacrifice this first". */
  function sacScore(g, p, o) {
    const m = M(p);
    if (m.sacFirst && m.sacFirstTurn === g.turn && m.sacFirst.has(o.id)) return -100;
    if (o.owner !== p) return -60;                  // stolen with Zealous Conscripts: it leaves anyway
    if (o.state.dieAtEnd) return -50;               // Kiki-Jiki and Splinter Twin copies
    if (!g.isCreature(o)) return 80;                // a Kindred Goblin card paying "sacrifice a Goblin"
    let s = value(g, o);
    if (o.isToken) s -= 2;
    if (KEYS.has(o.def.name)) s += 25;
    if (o.isCommander) s += 40;
    return s;
  }
  function sacPick(g, p, options) { return options.slice().sort((a, b) => sacScore(g, p, a) - sacScore(g, p, b))[0]; }
  /* The opponent this deck is burning out right now (set by the plans below). */
  function victimOf(g, p) {
    const m = M(p);
    if (m.victimTurn !== g.turn) return null;
    if (m.victim && !m.victim.lost) return m.victim;
    if (m.killAll) return lowestLife(g.opponents(p).filter(q => !g.playerHexproof(q)));
    return null;
  }
  function setVictim(g, p, q, all) { const m = M(p); m.victim = q; m.victimTurn = g.turn; m.killAll = !!all; }
  /* Answers for "sacrifice X: N damage to any target", worked out again before every repetition
     (engine.perform copies act.script with slice()): the victim, then the creature to sacrifice.
     It works whichever deck file's definition of the card was loaded. */
  function sacScript(g, p, q, all, goblinsOnly) {
    return {
      slice: () => {
        const v = q && !q.lost ? q : all ? lowestLife(g.opponents(p).filter(x => !g.playerHexproof(x))) : null;
        if (!v) return [];
        const pool = g.battlefield.filter(c => c.controller === p && (goblinsOnly ? isGoblin(g, c) : g.isCreature(c)));
        return pool.length ? [v, sacPick(g, p, pool)] : [v];
      }
    };
  }
  /* ai.target for this deck's damage sources: what to sacrifice, and the player we are finishing. */
  function dmgTarget(g, p, req) {
    if (req.purpose === "sacrifice") return sacPick(g, p, req.options);
    const v = victimOf(g, p);
    if (v && req.options.includes(v)) return v;
    return undefined;
  }
  /* Extra damage per creature of p's that dies: Pashalik Mons, Boggart Shenanigans, Outpost Siege. */
  function deathBonus(g, p) {
    const b = { gob: 0, any: 0 };
    for (const s of g.battlefield) {
      if (s.controller !== p) continue;
      const nm = s.def.name;
      if (nm === "Pashalik Mons" || nm === "Boggart Shenanigans") b.gob++;
      else if (nm === "Outpost Siege" && s.state.siege === "Dragons") b.any++;
    }
    return b;
  }
  const perDeath = (g, b, o) => 1 + b.any + (isGoblin(g, o) ? b.gob : 0);
  /* Damage that happens when a creature enters under p's control. */
  function enterDamage(g, p) {
    let n = 0;
    for (const o of g.battlefield) {
      if (o.controller !== p) continue;
      if (o.def.name === "Impact Tremors") n += 1;
      else if (o.def.name === "Purphoros, God of the Forge") n += 2;
    }
    return n;
  }

  /* ---------- Kiki-Jiki copies, Zealous Conscripts targets, tutors */
  const COPY_VALUE = {
    "Siege-Gang Commander": 9, "Beetleback Chief": 7, "Goblin Matron": 6, "Imperial Recruiter": 5, "Goblin Ringleader": 5,
    "Mogg War Marshal": 5, "Goblin Instigator": 4, "Hellrider": 4, "Goblin Chieftain": 4, "Goblin King": 4, "Wily Goblin": 3,
    "Goblin Warchief": 2, "Legion Warboss": 3, "Battle Cry Goblin": 2
  };
  function copyScore(g, p, o) {
    if (o.def.name === CONSCRIPTS) return 50;
    const s = COPY_VALUE[o.def.name];
    return s != null ? s : Math.max(0, g.power(o)) * 0.8 + (o.isToken ? 0 : 0.5);
  }
  function bestCopy(g, p, options) {
    const opts = options.filter(o => !g.isPlayer(o) && o.controller === p && !o.def.legendary);
    return opts.sort((a, b) => copyScore(g, p, b) - copyScore(g, p, a))[0] || null;
  }
  function conscriptsTarget(g, p, opts) {
    const tappedMine = o => !g.isPlayer(o) && o.controller === p && o.tapped;
    const twinned = o => g.battlefield.some(a => a.def.name === TWIN && a.attachedTo === o && a.controller === p);
    // 1. the untap loop: Kiki-Jiki, or the creature our Splinter Twin enchants
    let t = opts.find(o => tappedMine(o) && (o.def.name === KIKI || twinned(o)));
    if (t) return t;
    // 2. Krenko makes another batch of Goblins
    t = opts.find(o => tappedMine(o) && o.def.name === KRENKO);
    if (t) return t;
    // 3. steal the opponents' best creature: it attacks, or feeds Goblin Bombardment
    const theirs = opts.filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p));
    if (theirs.length) return theirs[0];
    t = opts.filter(tappedMine).sort((a, b) => value(g, b) - value(g, a))[0];
    return t || opts[0];
  }
  /* How much this deck wants a card it could search for right now. */
  function wantScore(g, p, o) {
    const nm = o.def.name;
    const onBf = n => g.battlefield.some(x => x.controller === p && x.def.name === n);
    const have = n => onBf(n) || p.hand.some(x => x.def.name === n) || (n === KRENKO && p.command.some(x => x.def.name === n));
    const lands = g.controlled(p, x => g.isLand(x)).length;
    const d = o.def;
    if (d.types.includes("Land")) return lands < 4 && !p.hand.some(x => x.def.types.includes("Land")) ? 40 : 1;
    let s = (d.ai && d.ai.priority != null ? d.ai.priority : 5) + d.mv * 0.3;
    const outlet = have(BOMB) || have("Impact Tremors") || have("Purphoros, God of the Forge");
    if (nm === KIKI) s = have(CONSCRIPTS) ? 100 : have(STAFF) && have(BOMB) ? 80 : 30;
    else if (nm === CONSCRIPTS) s = have(KIKI) || onBf(TWIN) ? 100 : 18;
    else if (nm === TWIN) s = have(CONSCRIPTS) && !have(KIKI) ? 70 : 4;
    else if (nm === STAFF) s = have(BOMB) ? 60 : 12;
    else if (nm === BOMB) s = have(KIKI) && have(CONSCRIPTS) ? 95 : have(STAFF) ? 75 : 34;
    else if (nm === "Impact Tremors" || nm === "Purphoros, God of the Forge") s = have(KIKI) && have(CONSCRIPTS) ? 96 : outlet ? 26 : 36;
    else if (nm === "Skullclamp") s = lands >= 3 ? 30 : 20;
    if (d.types.includes("Creature") && (nm === "Goblin Warchief" || nm === "Goblin Chieftain") && !onBf("Goblin Warchief") && !onBf("Goblin Chieftain")) s += 8;
    if (d.mv > lands + 3) s -= 10;
    return s;
  }
  function tutorPick(g, p, options) {
    return options.slice().sort((a, b) => wantScore(g, p, b) - wantScore(g, p, a))[0] || null;
  }
  /* Search the library for one card (a "target" question, so ai.target can choose). */
  async function tutor(g, p, src, filter, prompt, to, hidden) {
    const pool = p.library.filter(o => filter(g, o));
    let pick = null;
    if (pool.length) pick = await g.ask(p, { type: "target", prompt, options: pool, optional: true, purpose: "tutor", src });
    if (pick && pick.zone === "library") {
      if (to === "battlefield") g.putOntoBattlefield([pick], p);
      else g.moveTo(pick, "hand");
      if (hidden) g.log(`${p.name} searches their library and puts a card into their hand.`, { p, kind: "search" });
      else g.log(`${p.name} searches and ${to === "battlefield" ? "puts" : "reveals"} ${pick.def.name}${to === "battlefield" ? " onto the battlefield" : ""}.`, { p, cards: [pick.def.name], kind: "search" });
    } else { pick = null; g.log(`${p.name} searches and finds nothing.`, { p, kind: "search" }); }
    g.shuffle(p);
    return pick;
  }
  const tutorHook = (g, p, req) => (req.purpose === "tutor" ? tutorPick(g, p, req.options) : undefined);

  /* ---------- "until end of turn" control (Zealous Conscripts) */
  function stealUntilEot(g, p, t) {
    if (t.controller === p) return;
    const prev = t.controller, zc = t.zc;
    if (g.combat) g.removeFromCombat(t);
    t.controller = p; t.sick = true; t.state.dieAtEnd = true;
    g.bump();
    g.log(`${p.name} gains control of ${t.def.name} until end of turn.`, { p, cards: [t.def.name] });
    let done = false;
    const giveBack = g2 => {
      if (done) return; done = true;
      if (t.zone !== "battlefield" || t.zc !== zc || t.controller !== p || prev.lost) return;
      if (g2.combat) g2.removeFromCombat(t);
      t.controller = prev; t.sick = true; delete t.state.dieAtEnd;
      g2.bump();
      g2.log(`${t.def.name} returns to ${prev.name}.`, { p: prev, cards: [t.def.name] });
    };
    // "until end of turn": back at the next end step, or at the next upkeep if the end step has passed
    g.delayed.push({ at: "endStep", once: true, controller: p, do: giveBack });
    g.delayed.push({ at: "upkeep", once: true, controller: p, do: giveBack });
  }
  function exileAtNextEnd(g, list) {
    for (const o of list) {
      o.state.dieAtEnd = true;
      g.delayed.push({ at: "endStep", once: true, controller: o.controller, do: g2 => { if (o.zone === "battlefield") g2.exile(o); } });
    }
  }

  /* ---------- one damage event per batch of creatures entering (Impact Tremors, Purphoros) */
  const batchSeen = new WeakMap();
  function firstOfBatch(s, ev) {
    if (!ev.batch) return true;
    let set = batchSeen.get(ev.batch);
    if (!set) { set = new Set(); batchSeen.set(ev.batch, set); }
    if (set.has(s.id)) return false;
    set.add(s.id);
    return true;
  }
  function enteredCount(g, s, ev, other) {
    const list = ev.batch ? ev.batch.map(b => b.o) : [ev.o];
    return list.filter(o => o.controller === s.controller && (!other || o !== s) && g.isCreature(o)).length;
  }
  /* Attack triggers that only care about who is attacked (Hellrider, Raid Bombardment): one damage event per defender. */
  function damageByDefender(g, s, list, n) {
    const by = new Map();
    for (const a of list) {
      if (!a.combat || !a.combat.attacking) continue;
      const t = a.combat.attacking;
      by.set(t, (by.get(t) || 0) + n);
    }
    for (const [t, k] of by) { const live = g.liveTarget(t); if (live) g.damage(s, live, k); }
  }

  /* ================================================================ the brain (Krenko's ai.plan) */
  /* Each plan action may run `limit` times a turn; a spent one lets the next plan speak. */
  function once(g, p, act, limit) {
    if (!act) return null;
    const m = M(p);
    if (m.triesTurn !== g.turn) { m.triesTurn = g.turn; m.tries = new Map(); }
    const key = `${act.tag || act.type}:${act.card ? act.card.id : ""}:${act.idx == null ? "" : act.idx}`;
    const n = m.tries.get(key) || 0;
    if (n >= limit) return null;
    m.tries.set(key, n + 1);
    act.maxTries = 100000;
    return act;
  }
  function brain(g, p, o, ctx) {
    if (g.over || p.lost) return null;
    const win = ctx.window, acts = ctx.actions || [];
    if (!acts.length || !g.opponents(p).length) return null;
    let act = null;
    try {
      if (win === "stack") act = once(g, p, stackPlan(g, p, acts), 3);
      else {
        act = once(g, p, comboPlan(g, p, win, acts), 150) ||
          once(g, p, finishPlan(g, p, win, acts), 40) ||
          (win === "combat" ? once(g, p, combatPlan(g, p, acts), 3) : null) ||
          (win === "main1" || win === "main2" ?
            once(g, p, wipePlan(g, p, win, acts), 2) ||
            once(g, p, hasteGearPlan(g, p, win, acts), 1) ||
            once(g, p, fodderPlan(g, p, win, acts), 2) ||
            once(g, p, ritualPlan(g, p, win, acts), 2) ||
            once(g, p, vandalPlan(g, p, win, acts), 1) ||
            once(g, p, clampPlan(g, p, win, acts), 4) : null);
      }
    } catch (e) {
      if (MK.DEBUG_PLANS) throw e;
      act = null;
    }
    if (!act) return null;
    // damage abilities: the victim is answered to the target question of every repetition
    if (act.presetScript) { p.script = act.presetScript.slice(); act.script = act.presetScript; }
    if (act.say) g.log(act.say, { p, cards: act.sayCards || [] });
    return act;
  }
  function wouldCast(g, p, o, win) {
    const ai = o.def.ai || {};
    if (ai.never || ai.removal || ai.wipe || ai.counter || ai.protection || ai.trick || ai.finisher) return false;
    try {
      if (ai.cast) return ai.cast(g, p, o, { window: win }) !== false;
      if (ai.hold && ai.hold(g, p, o)) return false;
    } catch (e) { return false; }
    return true;
  }

  /* An opponent's spell is on the stack: Krenko makes Goblins before he leaves, and creatures that
     are about to die go to Goblin Bombardment first. */
  function stackPlan(g, p, acts) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return null;
    const ai = top.o.def.ai || {};
    const hitsMine = (top.targets || []).filter(t => t && !g.isPlayer(t) && t.zone === "battlefield" && t.controller === p && g.isCreature(t));
    const spares = c => { try { return !!(ai.spares && ai.spares(c)); } catch (e) { return false; } };
    const wipe = !!ai.wipe;
    const kr = mineNamed(g, p, KRENKO);
    const krAct = kr && findAct(acts, a => a.type === "activate" && a.card === kr && a.ab.krenkoMake);
    const token = { isToken: true, def: T.goblin, controller: p, owner: p, zone: "battlefield", counters: {}, state: {} };
    if (krAct && (hitsMine.includes(kr) || (wipe && spares(token)))) return { type: "activate", card: kr, idx: krAct.idx, tag: "krenkoRespond" };
    const bomb = bombAct(acts);
    if (!bomb) return null;
    let doomed = [];
    if (wipe) doomed = g.creatures(p).filter(c => !g.kw(c, "indestructible") && !spares(c));
    else doomed = hitsMine.filter(c => !c.isCommander);
    if (!doomed.length) return null;
    const q = victimOf(g, p) || lowestLife(g.opponents(p).filter(x => !g.playerHexproof(x)));
    if (!q) return null;
    const m = M(p); m.sacFirst = new Set(doomed.map(c => c.id)); m.sacFirstTurn = g.turn;
    setVictim(g, p, q, true);
    return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: doomed.length, presetScript: sacScript(g, p, q, true), tag: "respondSac",
      stop: () => !doomed.some(c => c.zone === "battlefield" && c.controller === p) };
  }

  /* The infinite combos. */
  function comboPlan(g, p, win, acts) {
    const opps = g.opponents(p);
    const targets = opps.filter(q => !g.playerHexproof(q));
    const total = targets.reduce((s, q) => s + Math.max(0, q.life), 0);
    const maxLife = Math.max(0, ...opps.map(q => q.life));
    const perEnter = enterDamage(g, p);
    const bombHere = !!mineNamed(g, p, BOMB) && targets.length > 0;
    const myTurnish = win === "main1" || (win === "end" && nextIsMe(g, p));
    // 1. Kiki-Jiki (or the creature Splinter Twin enchants) copies Zealous Conscripts, whose copy untaps it again.
    //    The loop runs in chunks; with Goblin Bombardment each chunk of copies is sacrificed before the next.
    if (g.creatures(p).some(c => c.def.name === CONSCRIPTS)) {
      const m = M(p);
      if (m.loopTurn !== g.turn) { m.loopTurn = g.turn; m.loops = 0; }
      const loop = findAct(acts, a => a.type === "activate" && ((a.ab.kikiCopy && a.card.def.name === KIKI) ||
        (a.ab.twinCopy && a.card.attachedTo && a.card.attachedTo.def.name === CONSCRIPTS)));
      const kill = perEnter > 0 || bombHere;
      const bomb0 = bombHere && bombAct(acts);
      if (kill && bomb0) {
        const copies = g.creatures(p).filter(c => (c.state.dieAtEnd || c.owner !== p) && c.def.name !== KIKI);
        if (copies.length && (copies.length >= 20 || !loop || m.loops >= 12)) {
          const q = lowestLife(targets);
          const ms = M(p); ms.sacFirst = new Set(copies.map(c => c.id)); ms.sacFirstTurn = g.turn;
          setVictim(g, p, q, true);
          return { type: "activate", card: bomb0.card, idx: bomb0.idx, repeat: copies.length, presetScript: sacScript(g, p, q, true), tag: "loopSac",
            stop: g2 => g2.opponents(p).length === 0 || !copies.some(c => c.zone === "battlefield" && c.controller === p) };
        }
      }
      let n = 0;
      if (loop && kill && m.loops < 12) n = bombHere ? 24 : Math.ceil(maxLife / perEnter) + 1;
      else if (loop && myTurnish && m.loops === 0) n = 24;
      n = Math.min(n, 80);
      if (n > 0) {
        m.loops++;
        const kiki = loop.card.def.name === KIKI;
        return { type: "activate", card: loop.card, idx: loop.idx, repeat: n, tag: "loop", stop: g2 => g2.opponents(p).length === 0,
          say: m.loops === 1 ? `${p.name} goes off: every ${CONSCRIPTS} copy untaps ${kiki ? KIKI : "the creature enchanted by Splinter Twin"}.` : null,
          sayCards: [loop.card.def.name, CONSCRIPTS] };
      }
    }
    // 2. Thornbite Staff on Krenko or Kiki-Jiki + Goblin Bombardment: every sacrifice untaps the holder
    const bomb = bombAct(acts);
    const staff = bomb && g.battlefield.find(s => s.controller === p && s.def.name === STAFF && s.attachedTo &&
      s.attachedTo.controller === p && (s.attachedTo.def.name === KRENKO || s.attachedTo.def.name === KIKI));
    if (staff && targets.length) {
      const holder = staff.attachedTo;
      const b = deathBonus(g, p);
      const fodder = g.creatures(p).filter(c => c !== holder && sacScore(g, p, c) < 20);
      const dmg = fodder.reduce((s, c) => s + perDeath(g, b, c), 0);
      const holderAct = findAct(acts, a => a.type === "activate" && a.card === holder && (a.ab.krenkoMake || a.ab.kikiCopy));
      const q = lowestLife(targets);
      const say = M(p).staffSaid === g.turn ? null : `${p.name} goes off: every creature that dies untaps ${holder.def.name} (Thornbite Staff).`;
      M(p).staffSaid = g.turn;
      if (dmg > total || (!holderAct && fodder.length && dmg >= total)) {
        setVictim(g, p, q, true);
        return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: fodder.length, presetScript: sacScript(g, p, q, true), tag: "staffBurn", say,
          stop: g2 => g2.opponents(p).length === 0 };
      }
      if (holderAct) return { type: "activate", card: holder, idx: holderAct.idx, tag: "staffMake", say, sayCards: [STAFF] };
      if (fodder.length) {
        setVictim(g, p, q, true);
        // Krenko: one sacrifice untaps him and the Goblins keep doubling. Kiki-Jiki: burn what the copy brought.
        const k = holder.def.name === KIKI ? fodder.length : 1;
        return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: k, presetScript: sacScript(g, p, q, true), tag: "staffUntap", say,
          stop: g2 => g2.opponents(p).length === 0 };
      }
    }
    return null;
  }

  /* Burn out an opponent when the damage on hand is enough. */
  const BURN = { "Lightning Bolt": 3, "Goblin Grenade": 5 };
  function finishPlan(g, p, win, acts) {
    if (win !== "main1" && win !== "main2" && win !== "end" && win !== "combat") return null;
    const targets = g.opponents(p).filter(q => !g.playerHexproof(q)).sort((a, b) => a.life - b.life);
    if (!targets.length) return null;
    const bomb = bombAct(acts);
    const siege = findAct(acts, a => a.type === "activate" && a.card.def.name === "Siege-Gang Commander" && a.ab.sacCost);
    const burns = acts.filter(a => a.type === "cast" && BURN[a.card.def.name] && !a.alt);
    if (!bomb && !siege && !burns.length) return null;
    const b = deathBonus(g, p);
    const pool = g.creatures(p).sort((x, y) => sacScore(g, p, x) - sacScore(g, p, y));
    const cheap = pool.filter(c => sacScore(g, p, c) < 8);
    const burnDmg = burns.slice(0, 2).reduce((s, a) => s + BURN[a.card.def.name], 0);
    const dmgOf = list => list.reduce((s, c) => s + perDeath(g, b, c), 0);
    for (const q of targets) {
      const life = q.life;
      if (life <= 0) continue;
      const burn = burns.find(a => BURN[a.card.def.name] >= life);
      if (burn) { setVictim(g, p, q); return { type: "cast", card: burn.card, targets: [q], tag: "burn" }; }
      if (bomb && dmgOf(cheap) + burnDmg >= life) {
        setVictim(g, p, q);
        if (burns.length) return { type: "cast", card: burns[0].card, targets: [q], tag: "burn" };
        let n = 0, acc = 0;
        for (const c of cheap) { if (acc >= life) break; acc += perDeath(g, b, c); n++; }
        return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: n + 1, presetScript: sacScript(g, p, q, false), tag: "finish", stop: () => q.lost };
      }
      if (siege) {
        const k = Math.min(cheap.filter(c => isGoblin(g, c)).length, Math.floor(manaLeft(g, p) / 2));
        if (k > 0 && k * (2 + b.any + b.gob) + burnDmg >= life) {
          setVictim(g, p, q);
          if (burns.length) return { type: "cast", card: burns[0].card, targets: [q], tag: "burn" };
          return { type: "activate", card: siege.card, idx: siege.idx, repeat: k, presetScript: sacScript(g, p, q, false, true), tag: "siege", stop: () => q.lost };
        }
      }
    }
    // all in: everything we have kills every opponent
    if (bomb) {
      const need = targets.reduce((s, q) => s + Math.max(0, q.life), 0);
      if (dmgOf(pool) + burnDmg >= need) {
        setVictim(g, p, targets[0], true);
        if (burns.length) return { type: "cast", card: burns[0].card, targets: [targets[0]], tag: "burn" };
        return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: pool.length, presetScript: sacScript(g, p, targets[0], true), tag: "finishAll",
          stop: g2 => g2.opponents(p).length === 0 };
      }
    }
    return null;
  }

  /* After blocks: a creature of ours that dies without killing anything goes to Goblin Bombardment. */
  function combatPlan(g, p, acts) {
    const c = g.combat, bomb = bombAct(acts);
    if (!c || !bomb) return null;
    const kills = (x, y) => g.power(x) > 0 && !g.kw(y, "indestructible") && (g.kw(x, "deathtouch") || g.power(x) >= g.lethalDamageLeft(y));
    const doomed = [];
    for (const a of c.attackers) {
      if (a.zone !== "battlefield" || !a.combat) continue;
      const blockers = a.combat.blockedBy.filter(x => x.zone === "battlefield");
      if (!blockers.length) continue;
      if (a.controller === p) {
        const incoming = blockers.reduce((s, x) => s + Math.max(0, g.power(x)), 0);
        if (!g.kw(a, "indestructible") && incoming >= g.lethalDamageLeft(a) && !blockers.some(x => kills(a, x))) doomed.push(a);
      } else if (blockers.length === 1 && blockers[0].controller === p && !g.kw(a, "trample")) {
        const x = blockers[0];
        if (kills(a, x) && !kills(x, a)) doomed.push(x);
      }
    }
    if (!doomed.length) return null;
    const q = victimOf(g, p) || lowestLife(g.opponents(p).filter(x => !g.playerHexproof(x)));
    if (!q) return null;
    const m = M(p); m.sacFirst = new Set(doomed.map(x => x.id)); m.sacFirstTurn = g.turn;
    return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: doomed.length, presetScript: sacScript(g, p, q, true), tag: "doomed",
      stop: () => !doomed.some(x => x.zone === "battlefield") };
  }

  /* Main phase 2: copies that leave at the end step and stolen creatures feed Goblin Bombardment. */
  function fodderPlan(g, p, win, acts) {
    if (win !== "main2") return null;
    const bomb = bombAct(acts);
    if (!bomb) return null;
    const list = g.creatures(p).filter(c => c.state.dieAtEnd || c.owner !== p);
    if (!list.length) return null;
    const q = victimOf(g, p) || lowestLife(g.opponents(p).filter(x => !g.playerHexproof(x)));
    if (!q) return null;
    const m = M(p); m.sacFirst = new Set(list.map(c => c.id)); m.sacFirstTurn = g.turn;
    return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: list.length, presetScript: sacScript(g, p, q, true), tag: "fodder",
      stop: () => !list.some(c => c.zone === "battlefield" && c.controller === p) };
  }

  /* Blasphemous Act with Goblin Bombardment out: our creatures die anyway, so they are sacrificed
     first (as many as keeps the Act affordable), then the Act is cast. Same test as the AI's wipes. */
  function wipePlan(g, p, win, acts) {
    if (win !== "main1" && win !== "main2") return null;
    const act = acts.find(a => a.type === "cast" && a.card.def.name === "Blasphemous Act");
    if (!act) return null;
    const m = M(p);
    const hit = c => g.isCreature(c) && !g.kw(c, "indestructible");
    const mine = g.creatures(p).filter(hit);
    const mineV = mine.reduce((sum, c) => sum + value(g, c), 0);
    const theirs = g.battlefield.filter(c => c.controller !== p && hit(c)).reduce((sum, c) => sum + value(g, c), 0);
    const good = theirs >= 14 && theirs >= mineV * 2 + 6;
    if (m.wipeTurn === g.turn) { m.wipeTurn = -1; return good ? { type: "cast", card: act.card, tag: "wipe" } : null; }
    const bomb = bombAct(acts);
    if (!bomb || !good) return null;
    const k = Math.min(mine.length, manaLeft(g, p) - 9 + g.creatures().length);
    const q = lowestLife(g.opponents(p).filter(x => !g.playerHexproof(x)));
    if (k <= 0 || !q) return null;
    m.sacFirst = new Set(mine.map(c => c.id)); m.sacFirstTurn = g.turn;
    m.wipeTurn = g.turn;
    setVictim(g, p, q, true);
    return { type: "activate", card: bomb.card, idx: bomb.idx, repeat: k, presetScript: sacScript(g, p, q, true), tag: "preWipe",
      stop: g2 => g2.opponents(p).length === 0 };
  }

  /* Lightning Greaves or Swiftfoot Boots belong on Krenko. */
  function hasteGearPlan(g, p, win, acts) {
    if (win !== "main1") return null;
    const kr = g.battlefield.find(o => o.controller === p && o.owner === p && o.def.name === KRENKO);
    if (!kr || !g.canTarget(p, kr)) return null;
    if (g.battlefield.some(e => e.attachedTo === kr && HASTE_GEAR.includes(e.def.name))) return null;
    for (const nm of HASTE_GEAR) {
      const eq = mineNamed(g, p, nm);
      const act = eq && findAct(acts, a => a.type === "activate" && a.card === eq && /^Equip/.test(a.ab.label || ""));
      if (act) { M(p).equipTo = kr; return { type: "activate", card: eq, idx: act.idx, presetScript: [kr], tag: "gear" }; }
    }
    return null;
  }

  /* Brightstone Ritual when its mana casts something we can't cast yet. */
  function ritualPlan(g, p, win, acts) {
    const rit = findAct(acts, a => a.type === "cast" && a.card.def.name === "Brightstone Ritual");
    if (!rit) return null;
    const gobs = g.battlefield.filter(o => isGoblin(g, o)).length;
    if (gobs < 3 || !unlocks(g, p, gobs - 1, rit.card, win)) return null;
    return { type: "cast", card: rit.card, tag: "ritual" };
  }
  function unlocks(g, p, extra, except, win) {
    for (const o of g.castZones(p)) {
      if (o === except || o.def.types.includes("Land") || o.def.mv < 3) continue;
      if (!wouldCast(g, p, o, win) && !o.isCommander) continue;
      if (g.castOptions(p, o).length) continue;
      p.pool.R += extra;
      let ok = false;
      try { ok = g.castOptions(p, o).length > 0; } finally { p.pool.R -= extra; }
      if (ok) return o;
    }
    return null;
  }

  /* Vandalblast: overload it when the table has several artifacts worth breaking. */
  function vandalPlan(g, p, win, acts) {
    const casts = acts.filter(a => a.type === "cast" && a.card.def.name === "Vandalblast");
    if (!casts.length) return null;
    const theirs = g.battlefield.filter(o => o.controller !== p && g.isArtifact(o));
    if (!theirs.length) return null;
    const over = casts.find(a => a.alt === 1);
    const total = theirs.reduce((s, o) => s + Math.max(0, threatOf(g, o, p)), 0);
    if (over && theirs.length >= 2 && total >= 9) return { type: "cast", card: over.card, alt: 1, targets: [null], tag: "vandal" };
    const single = casts.find(a => !a.alt);
    const best = theirs.filter(o => g.canTarget(p, o)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
    if (single && best && threatOf(g, best, p) >= 5) return { type: "cast", card: single.card, targets: [best], tag: "vandal" };
    return null;
  }

  /* Skullclamp: draw two for each spare 1-toughness creature, after the spells are cast. */
  function clampPlan(g, p, win, acts) {
    if (win !== "main2") return null;
    const clamp = mineNamed(g, p, "Skullclamp");
    const eq = clamp && findAct(acts, a => a.type === "activate" && a.card === clamp && /^Equip/.test(a.ab.label || ""));
    if (!eq || p.library.length < 20 || p.hand.length >= 6) return null;
    if (acts.some(a => a.type === "cast" && g.isPermanentCard(a.card) && wouldCast(g, p, a.card, win))) return null;
    const fodder = g.creatures(p).filter(c => c !== clamp.attachedTo && g.toughness(c) === 1 && sacScore(g, p, c) < 8);
    return fodder.length ? { type: "activate", card: clamp, idx: eq.idx, tag: "clamp" } : null;
  }

  /* ================================================================ AI helpers for single cards */
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && !!ctx.turnOf && g.nextPlayer(ctx.turnOf) === p;
  const oppCreatures = (g, p) => g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible"));
  function attackPump(g, p) {
    if (!g.combat || g.combat.attacker !== p) return false;
    return attackingMine(g, p).filter(a => a.combat && !a.combat.wasBlocked).length >= 3;
  }
  function pumpUse(g, p, ctx, cost) {
    if (ctx.window !== "combat" || !attackPump(g, p)) return false;
    const n = Math.floor(manaLeft(g, p) / cost);
    return n > 0 ? { repeat: Math.min(n, 6) } : false;
  }
  /* The creature of ours that most wants haste now: Krenko first, he taps for Goblins. */
  function hasteWant(g, p, options) {
    const pool = (options || g.creatures(p)).filter(c => !g.isPlayer(c) && c.controller === p && c.sick && !c.tapped && !g.kw(c, "haste"));
    const score = c => (c.def.name === KRENKO ? 100 : c.def.name === "Goblin Sharpshooter" ? 20 : 0) + Math.max(0, g.power(c));
    const best = pool.sort((a, b) => score(b) - score(a))[0];
    return best && score(best) >= 3 ? best : null;
  }
  /* o is about to die: blocked by enough power, or targeted by an opponent's spell. */
  function doomedNow(g, p, o, ctx) {
    if (ctx.window === "stack") {
      const top = g.stack[g.stack.length - 1];
      return !!(top && top.p !== p && ((top.targets || []).includes(o) || (top.o.def.ai && top.o.def.ai.wipe)));
    }
    if (ctx.window === "combat" && o.combat) {
      const bl = (o.combat.blockedBy || []).filter(x => x.zone === "battlefield");
      if (bl.length && bl.reduce((s, x) => s + Math.max(0, g.power(x)), 0) >= g.lethalDamageLeft(o)) return true;
      if (o.combat.blocking && o.combat.blocking.zone === "battlefield" && g.power(o.combat.blocking) >= g.lethalDamageLeft(o)) return true;
    }
    return false;
  }
  function burnTarget(g, p, dmg, minThreat) {
    return oppCreatures(g, p).filter(c => g.lethalDamageLeft(c) <= dmg && threatOf(g, c, p) >= minThreat)
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0] || null;
  }
  function burnCast(g, p, dmg, minThreat) { const t = burnTarget(g, p, dmg, minThreat); return t ? 18 + threatOf(g, t, p) * 0.5 : false; }
  /* Sacrifice-me pingers (Mogg Fanatic, Ember Hauler, Fanatical Firebrand). */
  function selfSacUse(g, p, o, ctx, dmg) {
    const v = victimOf(g, p);
    if (v && v.life <= dmg) return true;
    const low = g.opponents(p).find(q => q.life <= dmg && !g.playerHexproof(q));
    if (low) { setVictim(g, p, low); return true; }
    if (doomedNow(g, p, o, ctx)) return true;
    return ctx.window !== "stack" && !!burnTarget(g, p, dmg, 5);
  }
  function killUse(g, p, o, ctx, dmg) {
    if (doomedNow(g, p, o, ctx)) return oppCreatures(g, p).length > 0;
    return ctx.window !== "stack" && !!burnTarget(g, p, dmg, 5);
  }
  function colorlessUse(g, p, o, ctx) {
    if (ctx.window === "stack") return false;
    return g.battlefield.some(c => c.controller !== p && !g.isLand(c) && g.colorsOf(c).size === 0 && g.canTarget(p, c) && !g.kw(c, "indestructible") && threatOf(g, c, p) >= 6);
  }
  function siegeUse(g, p, o, ctx) {
    if (!endBeforeMe(g, p, ctx)) return false;
    const mana = manaLeft(g, p);
    if (mana < 2) return false;
    if (burnTarget(g, p, 2, 5)) return true;
    const spare = g.creatures(p).filter(c => isGoblin(g, c)).length - 10;
    return spare > 0 ? { repeat: Math.min(spare, Math.floor(mana / 2), 5) } : false;
  }
  function prospectorUse(g, p, o, ctx) {
    if (ctx.window !== "main1" && ctx.window !== "main2") return false;
    const spare = g.creatures(p).filter(c => isGoblin(g, c) && sacScore(g, p, c) < 8).length;
    for (let k = 1; k <= Math.min(2, spare); k++) if (unlocks(g, p, k, null, ctx.window)) return true;
    return false;
  }
  /* Kicked Goblin Bushwhacker: several creatures that could not attack otherwise. */
  function rushReady(g, p) {
    if (g.phase !== "main1" || g.active !== p) return false;
    const ours = g.creatures(p).filter(c => !c.tapped && !g.kw(c, "defender"));
    return ours.length >= 4 && ours.filter(c => c.sick && !g.kw(c, "haste")).length >= 2;
  }
  function abradePlan(g, p) {
    const t = burnTarget(g, p, 3, 5);
    if (t) return { mode: 0, t };
    const art = g.battlefield.filter(c => c.controller !== p && g.isArtifact(c) && g.canTarget(p, c) && !g.kw(c, "indestructible"))
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
    return art && threatOf(g, art, p) >= 5 ? { mode: 1, t: art } : null;
  }
  /* Equipment and Auras go on creatures we own: a stolen one goes back at end of turn. */
  const ownedFirst = (p, opts) => { const own = opts.filter(c => c.owner === p); return own.length ? own : opts; };
  function twinTarget(g, p, options) {
    const pool = (options || g.creatures(p)).filter(c => !g.isPlayer(c) && c.controller === p && c.owner === p && g.isCreature(c) && !c.def.legendary && (options || g.canTarget(p, c)));
    const cons = pool.find(c => c.def.name === CONSCRIPTS);
    if (cons) return cons;
    const best = pool.sort((a, b) => copyScore(g, p, b) - copyScore(g, p, a))[0];
    if (best && copyScore(g, p, best) >= 5) return best;
    return options ? best || options[0] : null;
  }
  function gearTarget(g, p, opts) {
    const m = M(p);
    if (m.equipTo && opts.includes(m.equipTo)) return m.equipTo;
    const score = c => (c.def.name === KRENKO ? 100 : c.def.name === KIKI ? 40 : 0) + (c.sick ? 5 : 0) + value(g, c) * 0.5;
    return ownedFirst(p, opts).sort((a, b) => score(b) - score(a))[0];
  }
  function staffTarget(g, p, opts) {
    const score = c => (c.def.name === KRENKO ? 100 : c.def.name === KIKI ? 80 : c.def.name === "Goblin Sharpshooter" ? 30 : 0) + value(g, c) * 0.3;
    return ownedFirst(p, opts).sort((a, b) => score(b) - score(a))[0];
  }
  function comboNeed(g, p) {
    const have = n => g.battlefield.some(x => x.controller === p && x.def.name === n) || p.hand.some(x => x.def.name === n);
    return (have(KIKI) || have(TWIN)) !== have(CONSCRIPTS);
  }
  const packPower = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield" && a.combat && a.combat.declared)
    .reduce((s, a) => s + Math.max(0, g.power(a)), 0) : 0);
  const makeGoblins = n => ({ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.goblin, { count: n }) });
  const sacGoblin = { filter: (g, c, src) => c.controller === src.controller && isGoblin(g, c), prompt: "Sacrifice a Goblin" };
  const anyTarget = (n, who) => ({ kind: "any", purpose: "harm", amount: n, prompt: `${who} deals ${n} damage to` });

  /* ================================================================ commander */
  D({
    name: KRENKO, cost: "{2}{R}{R}", type: "Legendary Creature — Goblin Warrior", pt: "3/3",
    text: "{T}: Create X 1/1 red Goblin creature tokens, where X is the number of Goblins you control.",
    abilities: [{
      label: "Create a Goblin for each Goblin", tap: true, krenkoMake: true,
      do: (g, s, ctx) => {
        const x = goblinsOf(g, ctx.p).length;
        if (x > 0) g.createToken(ctx.p, T.goblin, { count: x });
      },
      ai: {
        use: (g, p, o, ctx) => {
          const w = ctx.window;
          if (w !== "main1" && w !== "main2" && w !== "end") return false;
          return goblinsOf(g, p).length < 64 || enterDamage(g, p) > 0;
        }
      }
    }],
    ai: { priority: 9, threat: 4, plan: brain }
  });

  /* ================================================================ creatures */
  D({
    name: KIKI, cost: "{2}{R}{R}{R}", type: "Legendary Creature — Goblin Shaman", pt: "2/2",
    keywords: ["haste"],
    text: "Haste\n{T}: Create a token that's a copy of target nonlegendary creature you control, except it has haste. Sacrifice it at the beginning of the next end step.",
    abilities: [{
      label: "Copy a creature", tap: true, kikiCopy: true,
      targets: [{ kind: "creature", you: true, purpose: "copy", prompt: "Kiki-Jiki: copy target nonlegendary creature you control", filter: (g, o) => !o.def.legendary }],
      do: (g, s, ctx) => {
        if (!ctx.legal[0]) return;
        for (const t of g.copyToken(ctx.p, ctx.targets[0], { haste: true, sacEnd: true })) t.state.dieAtEnd = true;
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (g.creatures(p).some(c => c.def.name === CONSCRIPTS)) return false;   // the brain runs that loop
          if (ctx.window !== "main1" && !endBeforeMe(g, p, ctx)) return false;
          const best = bestCopy(g, p, g.targetOptions(p, o.def.abilities[0].targets[0], o));
          return !!best && copyScore(g, p, best) >= 3;
        }
      }
    }],
    ai: {
      priority: 9, threat: 5,
      target: (g, p, req) => (req.purpose === "copy" ? bestCopy(g, p, req.options) || undefined : undefined),
      cast: (g, p) => (g.creatures(p).some(c => c.def.name === CONSCRIPTS) ? 40 : undefined)
    }
  });

  D({
    name: CONSCRIPTS, cost: "{4}{R}", type: "Creature — Human Warrior", pt: "3/3",
    keywords: ["haste"],
    text: "Haste\nWhen Zealous Conscripts enters, gain control of target permanent until end of turn. Untap that permanent. It gains haste until end of turn.",
    note: "Control comes back at the next end step (or the next upkeep if that end step has passed).",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "permanent", purpose: "conscripts", prompt: "Zealous Conscripts: gain control of target permanent until end of turn, untap it, it gains haste" }), s);
        if (!t || t.zone !== "battlefield") return;
        stealUntilEot(g, p, t);
        g.untap(t);
        g.grant([t], ["haste"]);
      }
    }],
    ai: {
      priority: 7, threat: 3,
      target: (g, p, req) => (req.purpose === "conscripts" ? conscriptsTarget(g, p, req.options) : undefined),
      cast: (g, p, o, { window }) => (mineNamed(g, p, KIKI) ? 40 : window === "main1" ? 21 : false)
    }
  });

  D({
    name: "Purphoros, God of the Forge", cost: "{3}{R}", type: "Legendary Enchantment Creature — God", pt: "6/5",
    keywords: ["indestructible"],
    text: "Indestructible\nAs long as your devotion to red is less than five, Purphoros isn't a creature.\nWhenever another creature you control enters, Purphoros deals 2 damage to each opponent.\n{2}{R}: Creatures you control get +1/+0 until end of turn.",
    note: "Creatures that enter at the same time make one trigger that deals all the damage.",
    notCreatureUnless: (g, o) => g.devotion(o.controller, "R") >= 5,
    triggers: [{
      on: "enters",
      when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && firstOfBatch(s, ev),
      do: (g, s, ev, { p }) => { const n = enteredCount(g, s, ev, true); if (n > 0) for (const q of g.opponents(p)) g.damage(s, q, 2 * n); }
    }],
    abilities: [{
      label: "Creatures get +1/+0", cost: "{2}{R}",
      do: (g, s, ctx) => { g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 0] }); g.log(`Creatures ${ctx.p.name} controls get +1/+0.`, { p: ctx.p, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => pumpUse(g, p, ctx, 3) }
    }],
    ai: { priority: 8, threat: 4 }
  });

  D({
    name: "Pashalik Mons", cost: "{2}{R}", type: "Legendary Creature — Goblin Warlock", pt: "2/2",
    text: "Whenever Pashalik Mons or another Goblin you control dies, Pashalik Mons deals 1 damage to any target.\n{3}{R}, Sacrifice a Goblin: Create two 1/1 red Goblin creature tokens.",
    triggers: [{
      on: "dies",
      when: (g, s, ev) => ev.o === s || !!(ev.lki && ev.lki.controller === s.controller && ev.lki.subtypes.includes("Goblin")),
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig(anyTarget(1, "Pashalik Mons")), s);
        if (t) g.damage(s, t, 1);
      }
    }],
    abilities: [{
      label: "Sacrifice a Goblin: two Goblins", cost: "{3}{R}", sacCost: sacGoblin,
      do: (g, s, ctx) => g.createToken(ctx.p, T.goblin, { count: 2 }),
      ai: { use: (g, p, o, ctx) => { if (!endBeforeMe(g, p, ctx)) return false; const n = Math.floor(manaLeft(g, p) / 4); return n > 0 ? { repeat: Math.min(n, 4) } : false; } }
    }],
    ai: { priority: 7, threat: 3, target: dmgTarget }
  });

  D({
    name: "Goblin Matron", cost: "{2}{R}", type: "Creature — Goblin", pt: "1/1",
    text: "When Goblin Matron enters, you may search your library for a Goblin card, reveal that card, put it into your hand, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => tutor(g, p, s, (g2, c) => c.def.subtypes.includes("Goblin"), "Goblin Matron: search for a Goblin card") }],
    ai: { priority: 7, tutor: true, target: tutorHook }
  });

  D({
    name: "Imperial Recruiter", cost: "{2}{R}", type: "Creature — Human Advisor", pt: "1/1",
    text: "When Imperial Recruiter enters, search your library for a creature card with power 2 or less, reveal it, put it into your hand, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => tutor(g, p, s, (g2, c) => c.def.types.includes("Creature") && !!c.def.pt && c.def.pt[0] <= 2, "Imperial Recruiter: search for a creature card with power 2 or less") }],
    ai: { priority: 6, tutor: true, target: tutorHook }
  });

  D({
    name: "Muxus, Goblin Grandee", cost: "{4}{R}{R}", type: "Legendary Creature — Goblin Noble", pt: "4/4",
    text: "When Muxus enters, reveal the top six cards of your library. Put all Goblin creature cards with mana value 5 or less from among them onto the battlefield and the rest on the bottom of your library in a random order.\nWhenever Muxus attacks, it gets +1/+1 until end of turn for each other Goblin you control.",
    triggers: [
      {
        on: "enters", self: true,
        do: (g, s, ev, { p }) => {
          const top = p.library.slice(0, 6);
          if (!top.length) return;
          g.log(`${p.name} reveals ${top.map(o => o.def.name).join(", ")}.`, { p, cards: top.map(o => o.def.name) });
          const hits = top.filter(o => o.def.types.includes("Creature") && o.def.subtypes.includes("Goblin") && o.def.mv <= 5);
          for (const o of g.shuffleArr(top.filter(o => !hits.includes(o)))) g.moveTo(o, "library", { bottom: true });
          if (hits.length) g.putOntoBattlefield(hits, p);
        }
      },
      {
        on: "attacks", self: true, late: true,
        do: (g, s, ev, { p }) => {
          const n = goblinsOf(g, p).filter(o => o !== s).length;
          if (n > 0 && s.zone === "battlefield") { g.pump(s, n, n); g.log(`Muxus gets +${n}/+${n}.`, { p, cards: [s.def.name] }); }
        }
      }
    ],
    ai: { priority: 8, threat: 4 }
  });

  D({
    name: "Goblin Chieftain", cost: "{1}{R}{R}", type: "Creature — Goblin", pt: "2/2",
    keywords: ["haste"],
    text: "Haste\nOther Goblin creatures you control get +1/+1 and have haste.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && gobQuick(g, o), pt: [1, 1], kw: ["haste"] }],
    ai: { priority: 7 }
  });

  D({
    name: "Goblin Warchief", cost: "{1}{R}{R}", type: "Creature — Goblin Warrior", pt: "2/2",
    text: "Goblin spells you cast cost {1} less to cast.\nGoblins you control have haste.",
    statics: [
      { costMod: (g, s, card) => (card.def.subtypes.includes("Goblin") ? 1 : 0) },
      { applies: (g, s, o) => mine(s, o) && gobQuick(g, o), kw: ["haste"] }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Goblin King", cost: "{1}{R}{R}", type: "Creature — Goblin", pt: "2/2",
    text: "Other Goblins get +1/+1 and have mountainwalk. (They can't be blocked as long as defending player controls a Mountain.)",
    statics: [{ applies: (g, s, o) => o !== s && g.isCreature(o) && gobQuick(g, o), pt: [1, 1], kw: ["mountainwalk"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Skirk Prospector", cost: "{R}", type: "Creature — Goblin", pt: "1/1",
    text: "Sacrifice a Goblin: Add {R}.",
    note: "Automatic mana payment never sacrifices a Goblin: you use this ability yourself.",
    abilities: [{
      label: "Sacrifice a Goblin: add {R}", sacCost: sacGoblin,
      do: (g, s, ctx) => { ctx.p.pool.R++; g.bump(); },
      ai: { use: (g, p, o, ctx) => prospectorUse(g, p, o, ctx) }
    }],
    ai: { priority: 4, target: dmgTarget }
  });

  D({
    name: "Goblin Lackey", cost: "{R}", type: "Creature — Goblin", pt: "1/1",
    text: "Whenever Goblin Lackey deals damage to a player, you may put a Goblin permanent card from your hand onto the battlefield.",
    triggers: [{
      on: "damage", when: (g, s, ev) => ev.src === s && ev.toPlayer,
      do: async (g, s, ev, { p }) => {
        const opts = p.hand.filter(c => c.def.subtypes.includes("Goblin") && g.isPermanentCard(c));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Goblin Lackey: put a Goblin permanent card from your hand onto the battlefield", options: opts, optional: true, purpose: "lackey", src: s });
        if (pick && pick.zone === "hand") { g.log(`${p.name} puts ${pick.def.name} onto the battlefield.`, { p, cards: [pick.def.name] }); g.putOntoBattlefield([pick], p); }
      }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "lackey" ? req.options.slice().sort((a, b) => b.def.mv - a.def.mv)[0] : undefined) }
  });

  D({ name: "Goblin Instigator", cost: "{1}{R}", type: "Creature — Goblin Rogue", pt: "1/1",
    text: "When Goblin Instigator enters, create a 1/1 red Goblin creature token.", triggers: [makeGoblins(1)], ai: { priority: 6 } });
  D({ name: "Beetleback Chief", cost: "{2}{R}{R}", type: "Creature — Goblin Warrior", pt: "2/2",
    text: "When Beetleback Chief enters, create two 1/1 red Goblin creature tokens.", triggers: [makeGoblins(2)], ai: { priority: 7 } });

  D({
    name: "Siege-Gang Commander", cost: "{3}{R}{R}", type: "Creature — Goblin", pt: "2/2",
    text: "When Siege-Gang Commander enters, create three 1/1 red Goblin creature tokens.\n{1}{R}, Sacrifice a Goblin: Siege-Gang Commander deals 2 damage to any target.",
    triggers: [makeGoblins(3)],
    abilities: [{
      label: "Sacrifice a Goblin: 2 damage", cost: "{1}{R}", sacCost: sacGoblin,
      targets: [anyTarget(2, "Siege-Gang Commander")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 2); },
      ai: { use: (g, p, o, ctx) => siegeUse(g, p, o, ctx) }
    }],
    ai: { priority: 8, threat: 3, target: dmgTarget }
  });

  D({
    name: "Mogg War Marshal", cost: "{1}{R}", type: "Creature — Goblin Warrior", pt: "1/1",
    keywords: ["echo"],
    text: "Echo {1}{R} (At the beginning of your upkeep, if this came under your control since the beginning of your last upkeep, sacrifice it unless you pay its echo cost.)\nWhen Mogg War Marshal enters or dies, create a 1/1 red Goblin creature token.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => { s.state.echo = true; g.createToken(p, T.goblin); } },
      { on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.goblin) },
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller && !!s.state.echo,
        do: async (g, s, ev, { p }) => {
          s.state.echo = false;
          const cost = MK.parseCost("{1}{R}");
          if (g.canPay(p, cost) && (await g.ask(p, { type: "confirm", prompt: "Pay echo {1}{R} for Mogg War Marshal? (If you don't, sacrifice it.)", src: s, purpose: "echo" })) && g.pay(p, cost)) {
            g.log(`${p.name} pays the echo for Mogg War Marshal.`, { p, cards: [s.def.name] });
            return;
          }
          g.sacrifice(s);
        }
      }
    ],
    ai: { priority: 6, confirm: (g, p, req) => req.purpose !== "echo" }
  });

  D({
    name: "Goblin Sharpshooter", cost: "{2}{R}", type: "Creature — Goblin", pt: "1/1",
    text: "Goblin Sharpshooter doesn't untap during your untap step.\nWhenever a creature dies, untap Goblin Sharpshooter.\n{T}: Goblin Sharpshooter deals 1 damage to any target.",
    doesntUntap: () => true,
    triggers: [{ on: "dies", when: (g, s) => s.tapped, do: (g, s) => g.untap(s) }],
    abilities: [{
      label: "1 damage", tap: true,
      targets: [anyTarget(1, "Goblin Sharpshooter")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" }
    }],
    ai: { priority: 6, threat: 3, target: dmgTarget }
  });

  D({
    name: "Mogg Fanatic", cost: "{R}", type: "Creature — Goblin", pt: "1/1",
    text: "Sacrifice Mogg Fanatic: It deals 1 damage to any target.",
    abilities: [{
      label: "Sacrifice: 1 damage", sacSelf: true,
      targets: [anyTarget(1, "Mogg Fanatic")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: (g, p, o, ctx) => selfSacUse(g, p, o, ctx, 1) }
    }],
    ai: { priority: 4, target: dmgTarget }
  });

  D({
    name: "Ember Hauler", cost: "{R}{R}", type: "Creature — Goblin", pt: "2/2",
    text: "{1}, Sacrifice Ember Hauler: It deals 2 damage to any target.",
    abilities: [{
      label: "Sacrifice: 2 damage", cost: "{1}", sacSelf: true,
      targets: [anyTarget(2, "Ember Hauler")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 2); },
      ai: { use: (g, p, o, ctx) => selfSacUse(g, p, o, ctx, 2) }
    }],
    ai: { priority: 5, target: dmgTarget }
  });

  D({
    name: "Fanatical Firebrand", cost: "{R}", type: "Creature — Goblin Pirate", pt: "1/1",
    keywords: ["haste"],
    text: "Haste\n{T}, Sacrifice Fanatical Firebrand: It deals 1 damage to any target.",
    abilities: [{
      label: "Sacrifice: 1 damage", tap: true, sacSelf: true,
      targets: [anyTarget(1, "Fanatical Firebrand")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: (g, p, o, ctx) => selfSacUse(g, p, o, ctx, 1) }
    }],
    ai: { priority: 4, target: dmgTarget }
  });

  D({
    name: "Goblin Cratermaker", cost: "{1}{R}", type: "Creature — Goblin Warrior", pt: "2/2",
    text: "{1}, Sacrifice Goblin Cratermaker: Choose one —\n• Goblin Cratermaker deals 2 damage to target creature.\n• Destroy target colorless nonland permanent.",
    note: "The two modes are shown as two abilities.",
    abilities: [
      {
        label: "Sacrifice: 2 damage to a creature", cost: "{1}", sacSelf: true,
        targets: [{ kind: "creature", purpose: "harm", amount: 2, prompt: "Goblin Cratermaker deals 2 damage to" }],
        do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 2); },
        ai: { use: (g, p, o, ctx) => killUse(g, p, o, ctx, 2) }
      },
      {
        label: "Sacrifice: destroy a colorless permanent", cost: "{1}", sacSelf: true,
        targets: [{ kind: "nonland", purpose: "harm", prompt: "Destroy target colorless nonland permanent", filter: (g, o) => g.colorsOf(o).size === 0 }],
        do: (g, s, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], s); },
        ai: { use: (g, p, o, ctx) => colorlessUse(g, p, o, ctx) }
      }
    ],
    ai: { priority: 5 }
  });

  D({
    name: "Goblin Bushwhacker", cost: "{R}", type: "Creature — Goblin Warrior", pt: "1/1",
    kicker: "{R}",
    text: "Kicker {R} (You may pay an additional {R} as you cast this spell.)\nWhen Goblin Bushwhacker enters, if it was kicked, creatures you control get +1/+0 and gain haste until end of turn.",
    onResolve: (g, p, o, item) => {
      if (!item.kicked || o.zone !== "battlefield") return;
      g.addEffect({ objs: g.creatures(p), pt: [1, 0], kw: ["haste"] });
      g.log(`Creatures ${p.name} controls get +1/+0 and gain haste.`, { p, cards: [o.def.name], kind: "big" });
    },
    ai: {
      priority: 5,
      confirm: (g, p, req) => req.purpose !== "kicker" || rushReady(g, p),
      cast: (g, p, o, { window }) => {
        if (window === "main1" && rushReady(g, p) && g.canPay(p, MK.parseCost("{R}{R}"))) return 24;
        return g.controlled(p, x => g.isLand(x)).length <= 2 ? 11 : false;
      }
    }
  });

  D({
    name: "Legion Warboss", cost: "{2}{R}", type: "Creature — Goblin Soldier", pt: "2/2",
    keywords: ["mentor"],
    text: "Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\nAt the beginning of combat on your turn, create a 1/1 red Goblin creature token. That token gains haste until end of turn and attacks this combat if able.",
    note: "The new token attacks the opponent chosen when it is made.",
    triggers: [
      {
        on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const [tok] = g.createToken(p, T.goblin);
          if (!tok) return;
          g.grant([tok], ["haste"]);
          const opts = g.opponents(p);
          const q = opts.length > 1 ? await g.ask(p, { type: "player", prompt: "Legion Warboss: which player does the new Goblin attack?", options: opts, purpose: "harm", src: s }) : opts[0];
          if (!q) return;
          tok.state.mustAttack = q;
          g.delayed.push({ at: "endStep", once: true, controller: p, do: () => { if (tok.zone === "battlefield") delete tok.state.mustAttack; } });
        }
      },
      {
        on: "attacks", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "counter", prompt: "Mentor: put a +1/+1 counter on target attacking creature with lesser power", filter: (g2, o) => !!(o.combat && o.combat.attacking) && g2.power(o) < g2.power(s) }), s);
          if (t) g.addCounters(t, "p1", 1, s);
        }
      }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Krenko, Tin Street Kingpin", cost: "{2}{R}", type: "Legendary Creature — Goblin Warrior", pt: "1/2",
    text: "Whenever Krenko, Tin Street Kingpin attacks, put a +1/+1 counter on it, then create a number of 1/1 red Goblin creature tokens equal to Krenko's power.",
    triggers: [{
      on: "attacks", self: true,
      do: (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        g.addCounters(s, "p1", 1, s);
        const n = Math.max(0, g.power(s));
        if (n > 0) g.createToken(p, T.goblin, { count: n });
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Goblin Motivator", cost: "{R}", type: "Creature — Goblin Warrior", pt: "1/1",
    text: "{T}: Target creature gains haste until end of turn. (It can attack and {T} this turn.)",
    abilities: [{
      label: "Give haste", tap: true,
      targets: [{ kind: "creature", purpose: "help", prompt: "Target creature gains haste until end of turn" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) { g.grant(ctx.targets[0], ["haste"]); g.log(`${ctx.targets[0].def.name} gains haste.`, { p: ctx.p, cards: [ctx.targets[0].def.name] }); } },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !!hasteWant(g, p) }
    }],
    ai: { priority: 4, target: (g, p, req) => (req.purpose === "help" ? hasteWant(g, p, req.options) || undefined : undefined) }
  });

  D({
    name: "Hellrider", cost: "{2}{R}{R}", type: "Creature — Devil", pt: "3/3",
    keywords: ["haste"],
    text: "Haste\nWhenever a creature you control attacks, Hellrider deals 1 damage to the player or planeswalker it's attacking.",
    note: "One trigger per combat deals the damage for all your attackers.",
    triggers: [{ on: "attack", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev) => damageByDefender(g, s, ev.attackers.filter(a => a.zone === "battlefield"), 1) }],
    ai: { priority: 7 }
  });

  D({
    name: "Battle Cry Goblin", cost: "{1}{R}", type: "Creature — Goblin", pt: "2/2",
    text: "{1}{R}: Goblins you control get +1/+0 until end of turn.\nPack tactics — Whenever Battle Cry Goblin attacks, if you attacked with creatures with total power 6 or greater this combat, create a 1/1 red Goblin creature token that's tapped and attacking.",
    abilities: [{
      label: "Goblins get +1/+0", cost: "{1}{R}",
      do: (g, s, ctx) => {
        g.addEffect({ objs: g.creatures(ctx.p).filter(o => isGoblin(g, o)), pt: [1, 0] });
        g.log(`Goblins ${ctx.p.name} controls get +1/+0.`, { p: ctx.p, cards: [s.def.name] });
      },
      ai: { use: (g, p, o, ctx) => pumpUse(g, p, ctx, 2) }
    }],
    triggers: [{
      on: "attacks", self: true, intervening: (g, s) => packPower(g, s.controller) >= 6,
      do: (g, s, ev, { p }) => g.createToken(p, T.goblin, { tapped: true, attacking: ev.target })
    }],
    ai: { priority: 5 }
  });

  D({
    name: "Wily Goblin", cost: "{R}{R}", type: "Creature — Goblin Pirate", pt: "1/1",
    text: "When Wily Goblin enters, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this artifact: Add one mana of any color.\")",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, T.treasure) }],
    ai: { priority: 6, ramp: true }
  });

  D({
    name: "Goblin Ringleader", cost: "{3}{R}", type: "Creature — Goblin", pt: "2/2",
    keywords: ["haste"],
    text: "Haste\nWhen Goblin Ringleader enters, reveal the top four cards of your library. Put all Goblin cards revealed this way into your hand and the rest on the bottom of your library in any order.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const top = p.library.slice(0, 4);
        if (!top.length) return;
        g.log(`${p.name} reveals ${top.map(o => o.def.name).join(", ")}.`, { p, cards: top.map(o => o.def.name) });
        for (const o of top) { if (o.def.subtypes.includes("Goblin")) g.moveTo(o, "hand"); else g.moveTo(o, "library", { bottom: true }); }
      }
    }],
    ai: { priority: 6, draw: true }
  });

  /* ================================================================ artifacts */
  const botLow = (p, n) => !!(p.agent && p.agent.bot) && p.life <= n;
  D({
    name: "Mana Vault", cost: "{1}", type: "Artifact",
    text: "Mana Vault doesn't untap during your untap step.\nAt the beginning of your upkeep, you may pay {4}. If you do, untap Mana Vault.\nAt the beginning of your draw step, if Mana Vault is tapped, it deals 1 damage to you.\n{T}: Add {C}{C}{C}.",
    doesntUntap: () => true,
    mana: [{ tap: true, produce: "CCC", last: true }],
    triggers: [
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller && s.tapped,
        do: async (g, s, ev, { p }) => {
          const cost = MK.parseCost("{4}");
          if (!s.tapped || !g.canPay(p, cost)) return;
          if (!(await g.ask(p, { type: "confirm", prompt: "Pay {4} to untap Mana Vault?", src: s, purpose: "vaultUntap" }))) return;
          if (g.pay(p, cost)) { g.untap(s); g.log(`${p.name} pays {4} and untaps Mana Vault.`, { p, cards: [s.def.name] }); }
        }
      },
      { on: "drawStep", when: (g, s, ev) => ev.p === s.controller && s.tapped, intervening: (g, s) => s.tapped && s.zone === "battlefield", do: (g, s, ev, { p }) => g.damage(s, p, 1) }
    ],
    ai: { ramp: true, priority: 8, confirm: (g, p, req) => req.purpose !== "vaultUntap" }
  });
  D({
    name: "Lotus Petal", cost: "{0}", type: "Artifact",
    text: "{T}, Sacrifice Lotus Petal: Add one mana of any color.",
    mana: [{ tap: true, sacSelf: true, produce: "any5", last: true }],
    ai: { ramp: true, priority: 4 }
  });
  D({
    name: "Mind Stone", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{1}, {T}, Sacrifice Mind Stone: Draw a card.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Draw a card", cost: "{1}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.draw(ctx.p, 1),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && g.controlled(p, x => g.isLand(x)).length >= 7 }
    }],
    ai: { ramp: true, priority: 7 }
  });
  D({ name: "Fire Diamond", cost: "{2}", type: "Artifact", text: "Fire Diamond enters tapped.\n{T}: Add {R}.", etbTapped: true, mana: [{ tap: true, produce: "R" }], ai: { ramp: true, priority: 6 } });
  D({
    name: "Ruby Medallion", cost: "{2}", type: "Artifact",
    text: "Red spells you cast cost {1} less to cast.",
    statics: [{ costMod: (g, s, card) => (card.def.colors.includes("R") ? 1 : 0) }],
    ai: { ramp: true, priority: 7 }
  });

  /* The creature type a bot names for Herald's Horn: the most common one among its cards. */
  function topType(g, p) {
    const counts = new Map();
    const pool = p.library.concat(p.hand, p.graveyard, p.command, g.battlefield.filter(o => o.controller === p));
    for (const c of pool) if (c.def.types.includes("Creature")) for (const t of c.def.subtypes) counts.set(t, (counts.get(t) || 0) + 1);
    const best = [...counts].sort((a, b) => b[1] - a[1])[0];
    return best ? best[0] : "Human";
  }
  D({
    name: "Herald's Horn", cost: "{3}", type: "Artifact",
    text: "As Herald's Horn enters, choose a creature type.\nCreature spells you cast of the chosen type cost {1} less to cast.\nAt the beginning of your upkeep, look at the top card of your library. If it's a creature card of the chosen type, you may reveal it and put it into your hand.",
    note: "The creature type is chosen right after it enters.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const counts = new Map();
          const pool = p.library.concat(p.hand, p.graveyard, p.command, g.battlefield.filter(o => o.controller === p));
          for (const c of pool) if (c.def.types.includes("Creature")) for (const t of c.def.subtypes) counts.set(t, (counts.get(t) || 0) + 1);
          const opts = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => ({ id: t, label: t }));
          if (!opts.length) opts.push({ id: "Human", label: "Human" });
          const pick = await g.ask(p, { type: "option", prompt: "Herald's Horn: choose a creature type", options: opts, purpose: "creatureType", src: s });
          const t = opts.some(o => o.id === pick) ? pick : opts[0].id;
          if (s.zone === "battlefield") s.state.chosenType = t;
          g.bump();
          g.log(`${p.name} chooses ${t} for Herald's Horn.`, { p, cards: [s.def.name] });
        }
      },
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller && !!s.state.chosenType,
        do: async (g, s, ev, { p }) => {
          const top = p.library[0], t = s.state.chosenType;
          if (!top || !t || !top.def.types.includes("Creature") || !(top.def.subtypes.includes(t) || top.def.changeling)) return;
          if (!(await g.ask(p, { type: "confirm", prompt: `Herald's Horn: reveal ${top.def.name} and put it into your hand?`, src: s, purpose: "heraldReveal" })) || top.zone !== "library") return;
          g.moveTo(top, "hand");
          g.log(`${p.name} reveals ${top.def.name} and puts it into their hand (Herald's Horn).`, { p, cards: [top.def.name] });
        }
      }
    ],
    statics: [{ costMod: (g, s, card) => (s.state.chosenType && card.def.types.includes("Creature") && (card.def.subtypes.includes(s.state.chosenType) || card.def.changeling) ? 1 : 0) }],
    ai: { priority: 6, ramp: true, option: (g, p, req) => (req.purpose === "creatureType" ? topType(g, p) : undefined) }
  });

  function staffPingUse(g, p, o, ctx) {
    const c = o.attachedTo;
    if (!c || c.def.name === KRENKO || c.def.name === KIKI || ctx.window === "stack") return false;
    const v = victimOf(g, p);
    if (v && v.life <= 1) return true;
    return !!burnTarget(g, p, 1, 5) || (endBeforeMe(g, p, ctx) && manaLeft(g, p) >= 2);
  }
  D({
    name: STAFF, cost: "{2}", type: "Kindred Artifact — Shaman Equipment", equip: "{4}",
    text: "Equipped creature has \"{2}, {T}: This creature deals 1 damage to any target\" and \"Whenever a creature dies, untap this creature.\"\nWhenever a Shaman creature enters, you may attach Thornbite Staff to it.\nEquip {4}",
    note: "The equipped creature's abilities are shown on Thornbite Staff. It only attaches itself to Shamans you control. Creatures that die at the same time untap it once.",
    abilities: [{
      label: "Equipped creature deals 1 damage", cost: "{2}", staffPing: true,
      condition: (g, s, p) => !!s.attachedTo && s.attachedTo.controller === p && canTapNow(g, s.attachedTo),
      targets: [anyTarget(1, "The equipped creature")],
      do: (g, s, ctx) => {
        const c = s.attachedTo;
        if (!c || c.zone !== "battlefield" || !canTapNow(g, c)) return;
        g.tap(c);
        if (ctx.legal[0]) g.damage(c, ctx.targets[0], 1);
      },
      ai: { use: (g, p, o, ctx) => staffPingUse(g, p, o, ctx) }
    }],
    triggers: [
      { on: "dies", when: (g, s) => !!s.attachedTo && s.attachedTo.tapped, do: (g, s) => { if (s.attachedTo && s.attachedTo.zone === "battlefield") g.untap(s.attachedTo); } },
      {
        on: "enters", optional: "Attach Thornbite Staff to the new Shaman?", ai: "staffAttach",
        when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && g.hasSub(ev.o, "Shaman"),
        do: (g, s, ev) => {
          if (ev.o.zone !== "battlefield" || s.zone !== "battlefield" || ev.o.controller !== s.controller) return;
          s.attachedTo = ev.o; g.bump();
          g.log(`Thornbite Staff is attached to ${ev.o.def.name}.`, { p: s.controller, cards: [s.def.name, ev.o.def.name] });
        }
      }
    ],
    ai: {
      priority: 6, target: dmgTarget,
      equipTarget: (g, p, opts) => staffTarget(g, p, opts),
      confirm: (g, p, req) => req.purpose !== "staffAttach" || !req.src.attachedTo || req.src.attachedTo.def.name !== KRENKO || !mineNamed(g, p, BOMB)
    }
  });

  const ELDRAZI = MK.tokenDef({ key: "eldrazi-c10", name: "Eldrazi", pt: [10, 10], colors: [], subtypes: ["Eldrazi"] });
  D({
    name: "Idol of Oblivion", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{T}: Draw a card. Activate only if you created a token this turn.\n{8}, {T}, Sacrifice Idol of Oblivion: Create a 10/10 colorless Eldrazi creature token.",
    note: "Tokens count from the moment Idol of Oblivion is on the battlefield.",
    mana: [{ tap: true, produce: "C" }],
    triggers: [{ on: "enters", when: (g, s, ev) => { if (ev.o.isToken && ev.o.controller === s.controller) s.state.tokTurn = g.turn; return false; }, do: () => {} }],
    abilities: [
      {
        label: "Draw a card", tap: true, condition: (g, s) => s.state.tokTurn === g.turn,
        do: (g, s, ctx) => g.draw(ctx.p, 1),
        ai: { use: (g, p, o, ctx) => ctx.window === "main2" || ctx.window === "end" }
      },
      {
        label: "Create a 10/10 Eldrazi", cost: "{8}", tap: true, sacSelf: true,
        do: (g, s, ctx) => g.createToken(ctx.p, ELDRAZI),
        ai: { use: (g, p, o, ctx) => (ctx.window === "main2" || endBeforeMe(g, p, ctx)) && manaLeft(g, p) >= 10 }
      }
    ],
    ai: { priority: 5, ramp: true }
  });

  D({
    name: "Throne of the God-Pharaoh", cost: "{2}", type: "Legendary Artifact",
    text: "At the beginning of your end step, each opponent loses life equal to the number of tapped creatures you control.",
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => {
        const n = g.creatures(p).filter(c => c.tapped).length;
        if (n > 0) for (const q of g.opponents(p)) g.loseLife(q, n, s);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Lightning Greaves", cost: "{2}", type: "Artifact — Equipment", equip: "{0}",
    text: "Equipped creature has haste and shroud. (It can't be the target of spells or abilities.)\nEquip {0}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["haste", "shroud"] }],
    ai: { priority: 6, equipTarget: (g, p, opts) => gearTarget(g, p, opts) }
  });
  D({
    name: "Swiftfoot Boots", cost: "{2}", type: "Artifact — Equipment", equip: "{1}",
    text: "Equipped creature has hexproof and haste. (It can't be the target of spells or abilities your opponents control.)\nEquip {1}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["hexproof", "haste"] }],
    ai: { priority: 6, equipTarget: (g, p, opts) => gearTarget(g, p, opts) }
  });

  /* ================================================================ enchantments */
  D({
    name: BOMB, cost: "{1}{R}", type: "Enchantment",
    text: "Sacrifice a creature: Goblin Bombardment deals 1 damage to any target.",
    abilities: [{
      label: "Sacrifice a creature: 1 damage",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
      targets: [anyTarget(1, "Goblin Bombardment")],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: () => false }
    }],
    ai: { priority: 7, threat: 2, target: dmgTarget }
  });

  D({
    name: "Impact Tremors", cost: "{1}{R}", type: "Enchantment",
    text: "Whenever a creature you control enters, Impact Tremors deals 1 damage to each opponent.",
    note: "Creatures that enter at the same time make one trigger that deals all the damage.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.isCreature(ev.o) && firstOfBatch(s, ev),
      do: (g, s, ev, { p }) => { const n = enteredCount(g, s, ev, false); if (n > 0) for (const q of g.opponents(p)) g.damage(s, q, n); }
    }],
    ai: { priority: 8, threat: 3 }
  });

  const oppFirst = (g, p, req) => {
    const v = dmgTarget(g, p, req);
    if (v !== undefined) return v;
    return lowestLife(req.options.filter(q => g.isPlayer(q) && q !== p)) || undefined;
  };
  D({
    name: "Boggart Shenanigans", cost: "{2}{R}", type: "Kindred Enchantment — Goblin",
    text: "Whenever another Goblin you control dies, you may have Boggart Shenanigans deal 1 damage to target player or planeswalker.",
    triggers: [{
      on: "dies", when: (g, s, ev) => ev.o !== s && !!ev.lki && ev.lki.controller === s.controller && ev.lki.subtypes.includes("Goblin"),
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: 1, optional: true, filter: (g2, o) => g2.isPlaneswalker(o), prompt: "Boggart Shenanigans deals 1 damage to target player or planeswalker" }), s);
        if (t) g.damage(s, t, 1);
      }
    }],
    ai: { priority: 6, target: oppFirst }
  });

  /* Shared Animosity for all attackers at once: attackers are grouped by their creature types. */
  function animosity(g, p) {
    if (!g.combat) return;
    const atk = g.combat.attackers.filter(a => a.zone === "battlefield" && a.controller === p && a.combat);
    const groups = new Map();
    for (const a of atk) {
      const c = g.ch(a);
      const types = c.allTypes ? null : [...c.subtypes].sort();
      const key = types ? types.join(",") : "*";
      if (!groups.has(key)) groups.set(key, { types, n: 0, declared: [] });
      const grp = groups.get(key);
      grp.n++;
      if (a.combat.declared) grp.declared.push(a);
    }
    const list = [...groups.values()];
    const share = (x, y) => (!x.types ? !!(y.types === null || y.types.length) : !y.types ? x.types.length > 0 : x.types.some(t => y.types.includes(t)));
    const byBonus = new Map();
    for (const x of list) {
      if (!x.declared.length) continue;
      let n = 0;
      for (const y of list) if (share(x, y)) n += y.n;
      if (share(x, x)) n -= 1;
      if (n <= 0) continue;
      byBonus.set(n, (byBonus.get(n) || []).concat(x.declared));
    }
    for (const [n, objs] of byBonus) g.pump(objs, n, 0);
    if (byBonus.size) g.log(`Shared Animosity: ${[...byBonus].map(([n, o]) => `${o.length} attacker${o.length > 1 ? "s" : ""} get +${n}/+0`).join(", ")}.`, { p, cards: ["Shared Animosity"] });
  }
  D({
    name: "Shared Animosity", cost: "{2}{R}", type: "Enchantment",
    text: "Whenever a creature you control attacks, it gets +1/+0 until end of turn for each other attacking creature that shares a creature type with it.",
    note: "One trigger handles all your attackers, after the other attack triggers.",
    triggers: [{ on: "attack", late: true, when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => animosity(g, p) }],
    ai: { priority: 7 }
  });

  D({
    name: "Goblin War Drums", cost: "{2}{R}", type: "Enchantment",
    text: "Each creature you control can't be blocked except by two or more creatures.",
    note: "Shown as menace on your creatures.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["menace"] }],
    ai: { priority: 6 }
  });
  D({
    name: "Fervor", cost: "{2}{R}", type: "Enchantment",
    text: "Creatures you control have haste.",
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o), kw: ["haste"] }],
    ai: { priority: 7 }
  });

  function siegeMode(g, p) {
    const outlet = [BOMB, "Pashalik Mons", "Siege-Gang Commander", "Goblin Sharpshooter"].some(n => mineNamed(g, p, n));
    return outlet || g.creatures(p).length >= 10 ? "Dragons" : "Khans";
  }
  D({
    name: "Outpost Siege", cost: "{3}{R}", type: "Enchantment",
    text: "As Outpost Siege enters, choose Khans or Dragons.\n• Khans — At the beginning of your upkeep, exile the top card of your library. Until end of turn, you may play that card.\n• Dragons — Whenever a creature you control leaves the battlefield, Outpost Siege deals 1 damage to any target.",
    note: "The choice is made right after it enters.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const opts = [{ id: "Khans", label: "Khans: exile the top card each upkeep, you may play it" }, { id: "Dragons", label: "Dragons: 1 damage when a creature of yours leaves" }];
          const pick = await g.ask(p, { type: "option", prompt: "Outpost Siege: choose Khans or Dragons", options: opts, purpose: "siege", src: s });
          if (s.zone !== "battlefield") return;
          s.state.siege = pick === "Dragons" ? "Dragons" : "Khans";
          g.bump();
          g.log(`${p.name} chooses ${s.state.siege} for Outpost Siege.`, { p, cards: [s.def.name] });
        }
      },
      { on: "upkeep", when: (g, s, ev) => ev.p === s.controller && s.state.siege === "Khans", do: (g, s, ev, { p }) => g.impulse(p, 1) },
      {
        on: "leaves", when: (g, s, ev) => s.state.siege === "Dragons" && !!ev.lki && ev.lki.controller === s.controller && ev.lki.creature,
        do: async (g, s, ev, { p }) => { const t = await g.chooseTarget(p, trig(anyTarget(1, "Outpost Siege")), s); if (t) g.damage(s, t, 1); }
      }
    ],
    ai: { priority: 6, target: dmgTarget, option: (g, p, req) => (req.purpose === "siege" ? siegeMode(g, p) : undefined) }
  });

  const raidSnap = new WeakMap();
  D({
    name: "Raid Bombardment", cost: "{2}{R}", type: "Enchantment",
    text: "Whenever a creature you control with power 2 or less attacks, Raid Bombardment deals 1 damage to the player or planeswalker that creature's attacking.",
    note: "One trigger per combat deals the damage for all those attackers.",
    triggers: [{
      on: "attack",
      when: (g, s, ev) => {
        if (ev.p !== s.controller) return false;
        const list = ev.attackers.filter(a => a.zone === "battlefield" && g.power(a) <= 2);
        raidSnap.set(ev, list);
        return list.length > 0;
      },
      do: (g, s, ev) => damageByDefender(g, s, (raidSnap.get(ev) || []).filter(a => a.zone === "battlefield"), 1)
    }],
    ai: { priority: 6 }
  });

  function twinUse(g, p, o, ctx) {
    const c = o.attachedTo;
    if (!c || c.def.name === CONSCRIPTS) return false;   // the brain runs that loop
    return (ctx.window === "main1" || endBeforeMe(g, p, ctx)) && copyScore(g, p, c) >= 3;
  }
  const TWIN_SPEC = { kind: "creature", purpose: "twin", prompt: "Splinter Twin: enchant target creature" };
  D({
    name: TWIN, cost: "{2}{R}{R}", type: "Enchantment — Aura",
    aura: true, enchant: "creature", targets: [TWIN_SPEC],
    canCast: (g, p, o) => g.targetOptions(p, TWIN_SPEC, o).length > 0,
    text: "Enchant creature\nEnchanted creature has \"{T}: Create a token that's a copy of this creature, except it has haste. Exile it at the beginning of the next end step.\"",
    note: "The enchanted creature's ability is shown on Splinter Twin.",
    abilities: [{
      label: "Enchanted creature copies itself", twinCopy: true,
      condition: (g, s, p) => !!s.attachedTo && s.attachedTo.controller === p && canTapNow(g, s.attachedTo),
      do: (g, s, ctx) => {
        const c = s.attachedTo;
        if (!c || c.zone !== "battlefield" || !canTapNow(g, c)) return;
        g.tap(c);
        exileAtNextEnd(g, g.copyToken(ctx.p, c, { haste: true }));
      },
      ai: { use: (g, p, o, ctx) => twinUse(g, p, o, ctx) }
    }],
    ai: {
      priority: 7,
      target: (g, p, req) => (req.purpose === "twin" ? twinTarget(g, p, req.options) : undefined),
      cast: (g, p) => { const t = twinTarget(g, p); return !t ? false : t.def.name === CONSCRIPTS ? 40 : 20; }
    }
  });

  /* ================================================================ instants */
  D({
    name: "Chaos Warp", cost: "{2}{R}", type: "Instant",
    text: "The owner of target permanent shuffles it into their library, then reveals the top card of their library. If it's a permanent card, they put it onto the battlefield.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Shuffle into its owner's library" }],
      do: (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0], owner = t.owner;
        g.log(t.isCommander ? `${t.def.name} returns to the command zone.` : `${t.def.name} is shuffled into ${owner.name}'s library.`, { p: owner, cards: [t.def.name] });
        g.tuck(t, false);
        g.shuffle(owner);
        const top = owner.library[0];
        if (!top) return;
        g.log(`${owner.name} reveals ${top.def.name}${g.isPermanentCard(top) ? " and puts it onto the battlefield" : ""}.`, { p: owner, cards: [top.def.name] });
        if (g.isPermanentCard(top)) g.putOntoBattlefield([top], owner);
      }
    },
    ai: { removal: true, minThreat: 6, priority: 5 }
  });

  D({
    name: "Abrade", cost: "{1}{R}", type: "Instant",
    text: "Choose one —\n• Abrade deals 3 damage to target creature.\n• Destroy target artifact.",
    canCast: (g, p, o) => o.def.modes.some(m => m.canChoose(g, p, o)),
    modes: [
      {
        label: "3 damage to target creature",
        canChoose: (g, p) => g.battlefield.some(c => g.isCreature(c) && g.canTarget(p, c)),
        targets: [{ kind: "creature", purpose: "harm", amount: 3, prompt: "Abrade deals 3 damage to" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.src, ctx.targets[0], 3); }
      },
      {
        label: "Destroy target artifact",
        canChoose: (g, p) => g.battlefield.some(c => g.isArtifact(c) && g.canTarget(p, c)),
        targets: [{ kind: "artifact", purpose: "harm", prompt: "Destroy target artifact" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.src); }
      }
    ],
    ai: {
      priority: 5,
      mode: (g, p) => { const pl = abradePlan(g, p); return pl ? pl.mode : 0; },
      target: (g, p, req) => { const pl = abradePlan(g, p); return pl && req.options.includes(pl.t) ? pl.t : undefined; },
      cast: (g, p) => (abradePlan(g, p) ? 17 : false)
    }
  });

  D({
    name: "Lightning Bolt", cost: "{R}", type: "Instant",
    text: "Lightning Bolt deals 3 damage to any target.",
    spell: { targets: [anyTarget(3, "Lightning Bolt")], do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.src, ctx.targets[0], 3); } },
    ai: { priority: 4, target: dmgTarget, cast: (g, p) => burnCast(g, p, 3, 5) }
  });

  D({
    name: "Brightstone Ritual", cost: "{R}", type: "Instant",
    text: "Add {R} for each Goblin on the battlefield.",
    spell: {
      do: (g, ctx) => {
        const n = g.battlefield.filter(o => isGoblin(g, o)).length;
        if (n <= 0) return;
        ctx.p.pool.R += n; g.bump();
        g.log(`${ctx.p.name} adds ${"{R}".repeat(Math.min(n, 12))}${n > 12 ? ` (${n})` : ""}.`, { p: ctx.p, cards: ["Brightstone Ritual"] });
      }
    },
    ai: { priority: 2, cast: () => false }
  });

  /* ================================================================ sorceries */
  D({
    name: "Blasphemous Act", cost: "{8}{R}", type: "Sorcery",
    text: "This spell costs {1} less to cast for each creature on the battlefield.\nBlasphemous Act deals 13 damage to each creature.",
    costReduce: (g, p) => g.creatures().length,
    spell: {
      do: (g, ctx) => {
        const list = g.creatures();
        g.log(`Blasphemous Act deals 13 damage to each creature (${list.length}).`, { p: ctx.p, cards: ["Blasphemous Act"], kind: "big" });
        g.quiet = (g.quiet || 0) + 1;
        try { for (const c of list) g.damage(ctx.src, c, 13); } finally { g.quiet = Math.max(0, g.quiet - 1); }
      }
    },
    ai: { priority: 4, wipe: true }
  });

  D({
    name: "Vandalblast", cost: "{R}", type: "Sorcery",
    text: "Destroy target artifact you don't control.\nOverload {4}{R} (You may cast this spell for its overload cost. If you do, change its text by replacing all instances of \"target\" with \"each.\")",
    note: "Cast for its overload cost, it ignores the target.",
    altCosts: [{ label: "Overload", cost: "{4}{R}" }],
    canCast: (g, p) => g.battlefield.some(x => x.controller !== p && g.isArtifact(x)),
    spell: {
      targets: [{ kind: "artifact", opp: true, optional: true, purpose: "harm", prompt: "Destroy target artifact you don't control" }],
      do: (g, ctx) => {
        if (ctx.item && ctx.item.alt === 1) {
          const list = g.battlefield.filter(x => x.controller !== ctx.p && g.isArtifact(x));
          g.log(`Vandalblast destroys each artifact ${ctx.p.name} doesn't control (${list.length}).`, { p: ctx.p, cards: ["Vandalblast"], kind: "big" });
          g.destroyAll(list, ctx.src);
        } else if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.src);
      }
    },
    ai: { never: true }
  });

  D({
    name: "Gamble", cost: "{R}", type: "Sorcery",
    text: "Search your library for a card, put that card into your hand, discard a card at random, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        await tutor(g, p, ctx.src, () => true, "Gamble: search your library for a card", "hand", true);
        if (p.hand.length) g.discard(p, p.hand[g.rand(p.hand.length)]);
      }
    },
    ai: { priority: 6, tutor: true, target: tutorHook, cast: (g, p) => (p.library.length > 10 && (p.hand.length <= 2 || (p.hand.length <= 4 && comboNeed(g, p))) ? 15 : false) }
  });

  function jeskaCast(g, p, o, win) {
    if (win !== "main1" && win !== "main2") return false;
    const cmd = g.battlefield.some(x => x.controller === p && x.isCommander);
    const most = Math.max(0, ...g.opponents(p).map(q => q.hand.length));
    if (cmd && win === "main1") return 17;
    if (p.hand.length <= 2 && p.library.length > 10) return win === "main1" ? 15 : 11;
    return most >= 5 && p.hand.some(c => c !== o && !c.def.types.includes("Land") && c.def.mv >= 5) ? 14 : false;
  }
  D({
    name: "Jeska's Will", cost: "{2}{R}", type: "Sorcery",
    text: "Choose one. If you control a commander as you cast this spell, you may choose both instead.\n• Add {R} for each card in target opponent's hand.\n• Exile the top three cards of your library. You may play them this turn.",
    note: "The target opponent is chosen even if only the second mode is used, and the mode is chosen as it resolves.",
    spell: {
      targets: [{ kind: "opponent", purpose: "jeska", prompt: "Jeska's Will: target opponent" }],
      do: async (g, ctx) => {
        const p = ctx.p, q = ctx.legal[0] ? ctx.targets[0] : null;
        let mode = ctx.item && ctx.item.jeskaBoth ? "both" : null;
        if (!mode) {
          const opts = [{ id: "mana", label: "Add {R} for each card in target opponent's hand" }, { id: "exile", label: "Exile the top three cards, play them this turn" }];
          mode = await g.ask(p, { type: "option", prompt: "Jeska's Will: choose one", options: opts, purpose: "jeskaMode", src: ctx.src, target: q });
        }
        if ((mode === "both" || mode === "mana") && q) {
          const n = q.hand.length;
          if (n > 0) { p.pool.R += n; g.bump(); g.log(`${p.name} adds ${n} red mana (Jeska's Will).`, { p, cards: ["Jeska's Will"] }); }
        }
        if (mode === "both" || mode !== "mana") g.impulse(p, 3);
      }
    },
    onCast: (g, p, o, item) => { item.jeskaBoth = g.battlefield.some(x => x.controller === p && x.isCommander); },
    ai: {
      priority: 7,
      target: (g, p, req) => (req.purpose === "jeska" ? req.options.slice().sort((a, b) => b.hand.length - a.hand.length)[0] : undefined),
      option: (g, p, req) => (req.purpose === "jeskaMode" ? (req.target && req.target.hand.length >= 5 && p.hand.length >= 3 ? "mana" : "exile") : undefined),
      cast: (g, p, o, { window }) => jeskaCast(g, p, o, window)
    }
  });

  D({
    name: "Wheel of Fortune", cost: "{2}{R}", type: "Sorcery",
    text: "Each player discards their hand, then draws seven cards.",
    spell: {
      do: (g, ctx) => {
        const players = g.orderFrom(ctx.p).filter(q => !q.lost);
        g.log("Each player discards their hand, then draws seven cards.", { p: ctx.p, cards: ["Wheel of Fortune"], kind: "big" });
        g.quiet = (g.quiet || 0) + 1;
        try {
          for (const q of players) for (const o of q.hand.slice()) g.discard(q, o);
          for (const q of players) g.draw(q, 7);
        } finally { g.quiet = Math.max(0, g.quiet - 1); }
      }
    },
    ai: { priority: 6, draw: true, cast: (g, p) => (p.hand.length <= 2 && p.library.length >= 20 ? 17 : false) }
  });

  const tokenSorcery = (name, cost, n, prio) => D({
    name, cost, type: "Sorcery",
    text: `Create ${["", "a", "two", "three", "four"][n]} 1/1 red Goblin creature token${n > 1 ? "s" : ""}.`,
    spell: { do: (g, ctx) => g.createToken(ctx.p, T.goblin, { count: n }) },
    ai: { priority: prio }
  });
  tokenSorcery("Hordeling Outburst", "{1}{R}{R}", 3, 7);
  tokenSorcery("Goblin Rally", "{3}{R}{R}", 4, 6);
  tokenSorcery("Dragon Fodder", "{1}{R}", 2, 6);

  function pumpNow(g, p) {
    if (g.phase !== "main1" || g.active !== p) return false;
    return g.creatures(p).filter(c => !c.tapped && (!c.sick || g.kw(c, "haste")) && !g.kw(c, "defender")).length >= 6;
  }
  D({
    name: "Krenko's Command", cost: "{1}{R}", type: "Sorcery",
    text: "Choose one —\n• Create two 1/1 red Goblin creature tokens.\n• Creatures you control get +1/+1 until end of turn.",
    modes: [
      { label: "Create two 1/1 red Goblins", do: (g, ctx) => g.createToken(ctx.p, T.goblin, { count: 2 }) },
      {
        label: "Creatures you control get +1/+1",
        do: (g, ctx) => { g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 1] }); g.log(`Creatures ${ctx.p.name} controls get +1/+1.`, { p: ctx.p, cards: ["Krenko's Command"] }); }
      }
    ],
    ai: { priority: 6, mode: (g, p) => (pumpNow(g, p) ? 1 : 0) }
  });

  D({
    name: "Empty the Warrens", cost: "{3}{R}", type: "Sorcery",
    keywords: ["storm"],
    text: "Create two 1/1 red Goblin creature tokens.\nStorm (When you cast this spell, copy it for each spell cast before it this turn.)",
    spell: { do: (g, ctx) => g.createToken(ctx.p, T.goblin, { count: 2 }) },
    onCast: async (g, p, o, item) => {
      const n = Math.min(item.storm || 0, 40);
      if (n <= 0 || item.isCopy) return;
      g.log(`Storm: ${p.name} copies Empty the Warrens ${n} time${n > 1 ? "s" : ""}.`, { p, cards: [o.def.name] });
      for (let i = 0; i < n; i++) await g.copySpell(item, p, false);
    },
    ai: { priority: 5, cast: g => 8 + (g.spellsThisTurn || 0) * 5 }
  });

  D({
    name: "Goblin Grenade", cost: "{R}", type: "Sorcery",
    text: "As an additional cost to cast this spell, sacrifice a Goblin.\nGoblin Grenade deals 5 damage to any target.",
    note: "The Goblin is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.battlefield.some(o => o.controller === p && isGoblin(g, o)),
    spell: { targets: [anyTarget(5, "Goblin Grenade")], do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.src, ctx.targets[0], 5); } },
    onCast: async (g, p, o) => {
      const opts = g.battlefield.filter(x => x.controller === p && isGoblin(g, x));
      if (!opts.length) return;
      let pick = await g.ask(p, { type: "target", prompt: "Goblin Grenade: sacrifice a Goblin", options: opts, purpose: "sacrifice", src: o });
      if (!pick || !opts.includes(pick)) pick = opts[0];
      g.sacrifice(pick);
    },
    ai: { priority: 4, target: dmgTarget, cast: (g, p) => burnCast(g, p, 5, 6) }
  });

  /* ================================================================ lands */
  D({ name: "Mountain", type: "Basic Land — Mountain", text: "({T}: Add {R}.)", mana: [{ tap: true, produce: "R" }] });

  D({
    name: "Ancient Tomb", type: "Land",
    text: "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.",
    note: "Bots don't tap it for mana at 5 life or less.",
    mana: [{ tap: true, produce: "CC", last: true, condition: (g, o) => !botLow(o.controller, 5), after: (g, o) => g.damage(o, o.controller, 2) }]
  });

  D({
    name: "Castle Embereth", type: "Land",
    text: "Castle Embereth enters tapped unless you control a Mountain.\n{T}: Add {R}.\n{1}{R}{R}, {T}: Creatures you control get +1/+0 until end of turn.",
    etbTapped: (g, o) => !g.battlefield.some(x => x !== o && x.controller === o.controller && x.def.subtypes.includes("Mountain")),
    mana: [{ tap: true, produce: "R" }],
    abilities: [{
      label: "Creatures get +1/+0", cost: "{1}{R}{R}", tap: true,
      do: (g, s, ctx) => { g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 0] }); g.log(`Creatures ${ctx.p.name} controls get +1/+0.`, { p: ctx.p, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && attackPump(g, p) }
    }]
  });

  D({
    name: "Hanweir Battlements", type: "Land",
    text: "{T}: Add {C}.\n{R}, {T}: Target creature gains haste until end of turn.\n{3}{R}{R}, {T}: If you both own and control Hanweir Battlements and a land named Hanweir Garrison, exile them, then meld them into Hanweir, the Writhing Township. Activate only as a sorcery.",
    note: "The meld ability is left out: this deck has no Hanweir Garrison, so it would do nothing.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Give haste", cost: "{R}", tap: true,
      targets: [{ kind: "creature", purpose: "help", prompt: "Target creature gains haste until end of turn" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) { g.grant(ctx.targets[0], ["haste"]); g.log(`${ctx.targets[0].def.name} gains haste.`, { p: ctx.p, cards: [ctx.targets[0].def.name] }); } },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !!hasteWant(g, p) }
    }],
    ai: { target: (g, p, req) => (req.purpose === "help" ? hasteWant(g, p, req.options) || undefined : undefined) }
  });

  const identityColors = p => (p.identity || []).filter(c => "WUBRG".includes(c)).length;
  D({
    name: "War Room", type: "Land",
    text: "{T}: Add {C}.\n{3}, {T}, Pay life equal to the number of colors in your commanders' color identity: Draw a card.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Draw a card", cost: "{3}", tap: true,
      condition: (g, s, p) => p.life >= identityColors(p),
      do: (g, s, ctx) => { const n = identityColors(ctx.p); if (n > 0) g.payLife(ctx.p, n); g.draw(ctx.p, 1); },
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.life >= 10 && p.hand.length < 7 }
    }]
  });

  const DEN = { pt: [3, 2], subtypes: ["Goblin"], colors: ["R"] };
  const denAnimated = (g, s) => !!(s.state.animated && s.state.animated.turn === g.turn);
  D({
    name: "Den of the Bugbear", type: "Land",
    text: "If you control two or more other lands, Den of the Bugbear enters tapped.\n{T}: Add {R}.\n{3}{R}: Until end of turn, Den of the Bugbear becomes a 3/2 red Goblin creature with \"Whenever this creature attacks, create a 1/1 red Goblin creature token that's tapped and attacking.\" It's still a land.",
    etbTapped: (g, o) => g.battlefield.filter(x => x !== o && x.controller === o.controller && g.isLand(x)).length >= 2,
    mana: [{ tap: true, produce: "R" }],
    abilities: [{
      label: "Becomes a 3/2 Goblin", cost: "{3}{R}", noSelfMana: true,
      do: (g, s) => { s.state.animated = Object.assign({ turn: g.turn }, DEN); g.bump(); g.log("Den of the Bugbear becomes a 3/2 Goblin creature.", { p: s.controller, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && !o.sick && !o.tapped && !denAnimated(g, o) && manaLeft(g, p) >= 5 }
    }],
    triggers: [{
      on: "attacks", self: true, when: (g, s) => denAnimated(g, s),
      do: (g, s, ev, { p }) => g.createToken(p, T.goblin, { tapped: true, attacking: ev.target })
    }]
  });

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "krenko", name: "Krenko", title: "Krenko, Mob Boss", commander: KRENKO,
    identity: ["R"], bracket: 4, aggression: 0.7,
    style: "Goblin swarm combo",
    blurb: "Krenko doubles his Goblin horde every turn while Impact Tremors and Goblin Bombardment turn it into damage, and Kiki-Jiki with Zealous Conscripts wins on the spot.",
    watch: [KRENKO, KIKI, CONSCRIPTS, "Impact Tremors", BOMB],
    list: (function () {
      const singles = [
        // creatures (29)
        KIKI, CONSCRIPTS, "Purphoros, God of the Forge", "Pashalik Mons", "Goblin Matron", "Imperial Recruiter",
        "Muxus, Goblin Grandee", "Goblin Chieftain", "Goblin Warchief", "Goblin King", "Skirk Prospector", "Goblin Lackey",
        "Goblin Instigator", "Beetleback Chief", "Siege-Gang Commander", "Mogg War Marshal", "Goblin Sharpshooter",
        "Mogg Fanatic", "Goblin Bushwhacker", "Legion Warboss", "Krenko, Tin Street Kingpin", "Goblin Motivator",
        "Goblin Cratermaker", "Hellrider", "Battle Cry Goblin", "Wily Goblin", "Goblin Ringleader", "Ember Hauler",
        "Fanatical Firebrand",
        // artifacts (14)
        "Sol Ring", "Mana Vault", "Arcane Signet", "Mind Stone", "Fire Diamond", "Lotus Petal", "Ruby Medallion",
        "Herald's Horn", "Skullclamp", "Lightning Greaves", "Swiftfoot Boots", STAFF, "Idol of Oblivion",
        "Throne of the God-Pharaoh",
        // enchantments (9)
        BOMB, "Impact Tremors", "Boggart Shenanigans", "Shared Animosity", "Goblin War Drums", "Fervor", "Outpost Siege",
        "Raid Bombardment", TWIN,
        // instants (4)
        "Chaos Warp", "Abrade", "Lightning Bolt", "Brightstone Ritual",
        // sorceries (11)
        "Blasphemous Act", "Vandalblast", "Gamble", "Jeska's Will", "Wheel of Fortune", "Hordeling Outburst",
        "Krenko's Command", "Empty the Warrens", "Goblin Rally", "Dragon Fodder", "Goblin Grenade",
        // lands (6 + 26 Mountains)
        "Command Tower", "Ancient Tomb", "Castle Embereth", "Hanweir Battlements", "War Room", "Den of the Bugbear"
      ];
      const list = singles.slice();
      for (let i = 0; i < 26; i++) list.push("Mountain");
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
