/* Edgar Markov (Mardu Vampires), a Bracket 4 bot deck for the Miku Commander engine.
   The plan: cheap Vampires make 1/1 tokens through Edgar's eminence (it works from the command zone
   too), anthems and Edgar's attack trigger grow the army, sacrifice outlets turn creatures into
   drains, and two combos win on the spot: Vito, Thorn of the Dusk Rose or Sanguine Bond together with
   Exquisite Blood or Bloodthirsty Conqueror is an endless drain loop.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   The bot's decisions live in the `ai` hints and in Edgar's `plan`, which runs every time the bot may
   act: it finds lethal sacrifice chains, pokes the drain loop, answers removal by sacrificing the
   target, feeds creatures that are about to die in combat to an outlet, and casts free spells. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : 0);
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));

  /* ---------------------------------------------------------------- tokens */
  const TK = {
    vampire: MK.tokenDef({ key: "edgar-vampire-b", name: "Vampire", pt: [1, 1], colors: "B", subtypes: ["Vampire"] }),
    flier: MK.tokenDef({ key: "edgar-vampire-b-flying", name: "Vampire", pt: [2, 2], colors: "B", subtypes: ["Vampire"], keywords: ["flying"] }),
    lifelinker: MK.tokenDef({ key: "edgar-vampire-b-lifelink", name: "Vampire", pt: [1, 1], colors: "B", subtypes: ["Vampire"], keywords: ["lifelink"] }),
    faerie: MK.tokenDef({ key: "edgar-faerie-rogue", name: "Faerie Rogue", pt: [1, 1], colors: "B", subtypes: ["Faerie", "Rogue"], keywords: ["flying"] }),
    humanSoldier: MK.tokenDef({ key: "edgar-human-soldier", name: "Human Soldier", pt: [1, 1], colors: "W", subtypes: ["Human", "Soldier"] })
  };

  /* ---------------------------------------------------------------- small helpers */
  const mine = (s, o) => o.controller === s.controller;
  const isVampire = (g, o) => g.isCreature(o) && g.hasSub(o, "Vampire");
  const vampireCard = (g, o) => g.hasSub(o, "Vampire");                 // a spell or a card in any zone
  const trig = spec => Object.assign({ trigger: true }, spec);
  const has = (g, p, name) => g.battlefield.some(o => o.controller === p && o.def.name === name);
  const landInHand = p => p.hand.some(o => o.def.types.includes("Land"));
  const st = p => p._edgar || (p._edgar = { sacNext: null, dying: null, dyingTurn: -1, keepTop: null, lethalTurn: -1, sorinSac: -1 });
  const oppLostLife = (g, p) => g.opponents(p).some(q => q.lifeLostThisTurn > 0);
  const liveFoes = (g, p) => g.opponents(p).filter(q => !q.lost);
  const targetableFoes = (g, p) => liveFoes(g, p).filter(q => !g.playerHexproof(q));
  const byLife = (a, b) => (a.life - b.life) || (b.hand.length - a.hand.length);
  function drainEach(g, s, p, n) {
    for (const q of g.opponents(p)) g.loseLife(q, n, s);
    g.gainLife(p, n, s);
  }
  /* Ascend: the city's blessing stays once you have it. */
  function cityBlessing(g, p) {
    if (p._cityBlessing) return true;
    if (g.battlefield.filter(o => o.controller === p).length >= 10) { p._cityBlessing = true; return true; }
    return false;
  }
  const topIsBlack = p => { const c = p.library[0]; return !!c && c.def.colors.includes("B"); };

  /* Scry 1 (Viscera Seer). */
  function keepOnTop(g, p, card) {
    const S = st(p);
    if (S.keepTop === card.id) return true;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    const inHand = p.hand.filter(o => o.def.types.includes("Land")).length;
    if (card.def.types.includes("Land")) return lands + inHand < 6;
    if (lands + inHand < 3 && card.def.mv >= 4) return false;
    return true;
  }
  async function scry1(g, p, src) {
    const top = p.library[0];
    if (!top) return;
    const bottom = await g.ask(p, { type: "confirm", prompt: `Scry 1: put ${top.def.name} on the bottom of your library?`, src, purpose: "scryBottom", card: top });
    if (bottom && p.library[0] === top) {
      p.library.shift(); p.library.push(top); g.bump();
      g.log(`${p.name} scries 1 and puts the card on the bottom.`, { p });
    } else g.log(`${p.name} scries 1 and leaves the card on top.`, { p });
  }

  /* ---------------------------------------------------------------- the combos and the engines */
  const GAIN_SIDE = ["Vito, Thorn of the Dusk Rose", "Sanguine Bond"];      // whenever you gain life, an opponent loses that much
  const LOSS_SIDE = ["Exquisite Blood", "Bloodthirsty Conqueror"];           // whenever an opponent loses life, you gain that much
  const COMBO = new Set(GAIN_SIDE.concat(LOSS_SIDE));
  const DRAINERS = new Set(["Blood Artist", "Falkenrath Noble", "Vein Ripper", "Cruel Celebrant", "Zulaport Cutthroat", "Bastion of Remembrance"]);
  const PINGERS = new Set(["Mayhem Devil", "Judith, the Scourge Diva"]);
  const OUTLETS = { "Goblin Bombardment": 0, "Viscera Seer": 1, "Carrion Feeder": 2, "Bloodthrone Vampire": 3, "Falkenrath Aristocrat": 4, "Yahenni, Undying Partisan": 5 };
  const KEY = new Set(["Drana, Liberator of Malakir", "Legion Lieutenant", "Stromkirk Captain", "Vampire Nocturnus", "Welcoming Vampire", "Elenda, the Dusk Rose", "Sanctum Seeker", "Bloodline Keeper", "Twilight Prophet", "Mavren Fein, Dusk Apostle", "Cordial Vampire", "Vampire Socialite", "Skullclamp"]);

  function comboLive(g, p) {
    return GAIN_SIDE.some(n => has(g, p, n)) && LOSS_SIDE.some(n => has(g, p, n)) && targetableFoes(g, p).length > 0;
  }
  /* Free "Sacrifice a creature:" abilities we can use right now, best first (all at ability index 0). */
  function freeOutlets(g, p) {
    const out = [];
    for (const o of g.battlefield) {
      if (o.controller !== p || OUTLETS[o.def.name] == null) continue;
      const e = g.findAbility(o, 0);
      if (e && g.canActivate(p, o, e)) out.push(o);
    }
    return out.sort((a, b) => OUTLETS[a.def.name] - OUTLETS[b.def.name]);
  }

  /* How keen we are to keep a permanent when something must be sacrificed (low goes first). */
  function keepScore(g, p, o, src) {
    const S = st(p);
    if (S.sacNext && S.sacNext.o === o && S.sacNext.turn === g.turn) return -100;
    if (S.dying && S.dyingTurn === g.turn && S.dying.has(o.id)) return -60;
    if (o.def.name === "Treasure") return -4;
    let v = g.isCreature(o) ? valueOf(g, o) : 3 + o.def.mv;
    if (o.isToken) v -= 2;
    if (o.def.name === "Bloodghast") v -= landInHand(p) ? 5 : 1;
    if (o.def.name === "Elenda, the Dusk Rose") v -= Math.max(0, g.power(o)) * 1.5;
    if (DRAINERS.has(o.def.name) || PINGERS.has(o.def.name)) v += 12;
    if (COMBO.has(o.def.name)) v += 20;
    if (OUTLETS[o.def.name] != null) v += 8;
    if (KEY.has(o.def.name)) v += 5;
    if (o.isCommander) v += 10;
    if (o === src) v += 40;
    return v;
  }
  /* Answer for "sacrifice" questions asked by this deck's cards (ai.target hook). */
  function sacPick(g, p, req) {
    if (req.purpose !== "sacrifice") return undefined;
    const opts = req.options.filter(o => !g.isPlayer(o));
    if (!opts.length) return undefined;
    const S = st(p);
    const pick = opts.slice().sort((a, b) => keepScore(g, p, a, req.src) - keepScore(g, p, b, req.src))[0];
    if (S.sacNext && S.sacNext.o === pick) S.sacNext = null;
    return pick;
  }
  /* "Target player/opponent loses life": the opponent closest to dying. */
  function foePick(g, p, req) {
    const foes = req.options.filter(q => g.isPlayer(q) && q !== p && !q.lost);
    if (!foes.length) return undefined;
    return foes.slice().sort(byLife)[0];
  }
  /* "Deals N damage to any target": finish a player, start the drain loop, kill a creature worth it,
     or hit the opponent closest to dying. */
  function pingPick(g, p, req, amount) {
    const opts = req.options;
    const foes = opts.filter(q => g.isPlayer(q) && q !== p && !q.lost).sort(byLife);
    const S = st(p);
    if (foes.length && (foes[0].life <= amount || S.lethalTurn === g.turn || comboLive(g, p))) return foes[0];
    const kill = opts.filter(o => !g.isPlayer(o) && o.controller !== p && g.isCreature(o) && !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= amount)
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
    if (kill && threatOf(g, kill, p) >= 4) return kill;
    if (foes.length) return foes[0];
    const walkers = opts.filter(o => !g.isPlayer(o) && o.controller !== p);
    return walkers[0] || undefined;
  }
  const targetHook = amount => (g, p, req) => (req.purpose === "sacrifice" ? sacPick(g, p, req) : g.isPlayer(req.options[0]) && req.spec && (req.spec.kind === "player" || req.spec.kind === "opponent") ? foePick(g, p, req) : pingPick(g, p, req, amount));

  /* ---------------------------------------------------------------- tutoring */
  const WISH = ["Goblin Bombardment", "Skullclamp", "Blood Artist", "Cruel Celebrant", "Zulaport Cutthroat", "Viscera Seer", "Bitterblossom", "Legion Lieutenant", "Vampire Nocturnus", "Bastion of Remembrance", "Drana, Liberator of Malakir", "Welcoming Vampire"];
  function tutorPick(g, p, cands) {
    if (!cands.length) return null;
    const got = n => has(g, p, n) || p.hand.some(o => o.def.name === n);
    const find = names => { for (const n of names) { const c = cands.find(o => o.def.name === n); if (c) return c; } return null; };
    const lands = g.controlled(p, o => g.isLand(o)).length;
    if (lands < 3 && !landInHand(p)) {
      const l = cands.filter(o => o.def.types.includes("Land"))[0];
      if (l) return l;
    }
    const gainHave = GAIN_SIDE.some(got), lossHave = LOSS_SIDE.some(got);
    let c = null;
    if (gainHave && !lossHave) c = find(LOSS_SIDE);
    else if (lossHave && !gainHave) c = find(GAIN_SIDE);
    else if (!gainHave && !lossHave) c = find(["Vito, Thorn of the Dusk Rose", "Exquisite Blood", "Bloodthirsty Conqueror", "Sanguine Bond"]);
    if (c) return c;
    for (const n of WISH) if (!got(n)) { const w = cands.find(o => o.def.name === n); if (w) return w; }
    return cands.slice().sort((a, b) => ((b.def.ai && b.def.ai.priority) || 5) + b.def.mv * 0.3 - ((a.def.ai && a.def.ai.priority) || 5) - a.def.mv * 0.3)[0];
  }
  /* Search with this deck's picks for the bots (the generic card picker doesn't know the combos). */
  async function tutor(g, p, src, opts) {
    const filter = opts.filter || (() => true);
    let f = filter;
    // a deck with its own brain (ai.js deckBrain) or tutor picks (MK.DECK_TUTORS) picks for itself
    const br = MK.AI && MK.AI.deckBrain ? MK.AI.deckBrain(p) : null;
    const own = (MK.DECK_TUTORS && MK.DECK_TUTORS[p.deckId]) || (br && br.tutor);
    if (p.agent && p.agent.bot && !(br && br.tutors && !own)) {
      const cands = p.library.filter(o => filter(g, o));
      const pick = (own && own(g, p, cands)) || tutorPick(g, p, cands);
      if (pick) f = (g2, o) => o === pick;
    }
    const got = await g.search(p, { filter: f, to: opts.to || "hand", prompt: opts.prompt, src, hidden: opts.hidden !== false, purpose: "tutor" });
    if (opts.to === "top" && got[0]) st(p).keepTop = got[0].id;
    return got;
  }

  /* ---------------------------------------------------------------- the bot brain (Edgar's plan) */
  /* Life each opponent loses when one of our creatures dies to `outlet`, with the engines in play. */
  function deathYield(g, p, dying, engines, outlet) {
    let each = 0, tgt = 0, gain = 0, bonds = 0;
    for (const e of engines) {
      switch (e.def.name) {
        case "Blood Artist": case "Falkenrath Noble": tgt += 1; gain += 1; break;
        case "Vein Ripper": tgt += 2; gain += 2; break;
        case "Cruel Celebrant": case "Zulaport Cutthroat": case "Bastion of Remembrance": each += 1; gain += 1; break;
        case "Judith, the Scourge Diva": if (!dying.isToken) tgt += 1; break;
        case "Mayhem Devil": tgt += 1; break;
        case "Vito, Thorn of the Dusk Rose": case "Sanguine Bond": if (e !== dying) bonds++; break;
      }
    }
    if (outlet && outlet.def.name === "Goblin Bombardment") tgt += 1;
    return { each, tgt: tgt + gain * bonds };
  }
  /* Sacrifice our creatures one by one (cheapest first, engines and the outlet last) and count the
     opponents that die. Targeted damage goes to the targetable opponent closest to dying. */
  function simulateSacs(g, p, outlet) {
    const engines = g.battlefield.filter(o => o.controller === p && (DRAINERS.has(o.def.name) || PINGERS.has(o.def.name) || GAIN_SIDE.includes(o.def.name)));
    const selfOk = g.isCreature(outlet) && outlet.def.name !== "Yahenni, Undying Partisan";
    const order = g.creatures(p).filter(c => c !== outlet).sort((a, b) => keepScore(g, p, a, outlet) - keepScore(g, p, b, outlet));
    if (selfOk) order.push(outlet);
    const foes = liveFoes(g, p).map(q => ({ q, life: q.life, hex: g.playerHexproof(q) }));
    let alive = engines.slice();
    const steps = [];
    for (let i = 0; i < order.length; i++) {
      const c = order[i];
      const y = deathYield(g, p, c, alive, outlet);
      for (const f of foes) f.life -= y.each;
      let t = y.tgt;
      while (t > 0) {
        const f = foes.filter(x => x.life > 0 && !x.hex).sort((a, b) => a.life - b.life)[0];
        if (!f) break;
        f.life -= 1; t--;
      }
      alive = alive.filter(e => e !== c);
      const dead = foes.filter(f => f.life <= 0).length;
      steps.push({ n: i + 1, dead });
      if (dead === foes.length) break;
    }
    return steps;
  }
  function sacLethal(g, p) {
    const outs = freeOutlets(g, p);
    if (!outs.length) return null;
    const outlet = outs[0];
    const steps = simulateSacs(g, p, outlet);
    if (!steps.length) return null;
    const n0 = liveFoes(g, p).length;
    const last = steps[steps.length - 1];
    let n = 0, all = false;
    if (last.dead >= n0) { n = last.n; all = true; }
    else {
      const first = steps.find(s => s.dead >= 1);
      const board = g.creatures(p).length;
      if (first && first.n <= Math.max(2, Math.floor(board / 2))) n = first.n;
    }
    if (!n) return null;
    st(p).lethalTurn = g.turn;
    return { type: "activate", card: outlet, idx: 0, repeat: n + 1, maxTries: 3, stop: g2 => (all ? liveFoes(g2, p).length === 0 : liveFoes(g2, p).length < n0) };
  }
  const STARTERS = new Set(["Blood Artist", "Falkenrath Noble", "Vein Ripper", "Cruel Celebrant", "Zulaport Cutthroat", "Bastion of Remembrance", "Mayhem Devil"]);
  function castAct(actions, name, alt) {
    return (actions || []).find(a => a.type === "cast" && a.card.def.name === name && (alt == null || !!a.alt === !!alt)) || null;
  }
  /* The drain loop is on the table: make one opponent lose life (or us gain life) to start it. */
  function comboStart(g, p, window, actions) {
    const S = st(p);
    const outs = freeOutlets(g, p);
    const bomb = outs.find(o => o.def.name === "Goblin Bombardment");
    S.lethalTurn = g.turn;
    if (bomb) return { type: "activate", card: bomb, idx: 0, maxTries: 2 };
    if (outs.length && g.battlefield.some(o => o.controller === p && STARTERS.has(o.def.name))) return { type: "activate", card: outs[0], idx: 0, maxTries: 2 };
    const sorin = g.battlefield.find(o => o.controller === p && o.def.name === "Sorin, Imperious Bloodlord");
    if (sorin && g.canSorcery(p) && sorin.state.loyaltyUsed !== g.turn && g.creatures(p).some(c => isVampire(g, c))) {
      S.sorinSac = g.turn;
      return { type: "activate", card: sorin, idx: 1, maxTries: 1 };
    }
    const bc = castAct(actions, "Boros Charm");
    const foe = targetableFoes(g, p).sort(byLife)[0];
    if (bc && foe) return { type: "cast", card: bc.card, mode: 0, targets: [foe], maxTries: 1 };
    return null;
  }
  /* Boros Charm to finish an opponent who has 4 life or less. */
  function charmFinish(g, p, actions) {
    const bc = castAct(actions, "Boros Charm");
    if (!bc) return null;
    const foe = targetableFoes(g, p).filter(q => q.life <= 4).sort(byLife)[0];
    return foe ? { type: "cast", card: bc.card, mode: 0, targets: [foe], maxTries: 1 } : null;
  }
  const GIFTS = new Set(["Beast Within", "Generous Gift", "Excavation Technique"]);
  /* An opponent's spell on the stack: save the board from a wipe, or cash in a creature it targets. */
  function stackAnswer(g, p, actions) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p || top.countered) return null;
    const S = st(p);
    const d = top.o.def;
    // engine 9: also mass removal the bots read off the spell (Toxic Deluge, Evacuation); indestructible
    // only saves the board from destroy and damage
    const AI = MK.AI;
    const mass = AI && AI.newWipes && AI.newWipes(g) && !(d.ai && d.ai.wipe) ? AI.massHarm(g, p, top) : null;
    if ((d.ai && d.ai.wipe) || mass) {
      const spares = d.ai && d.ai.spares;
      const dying = mass ? mass.hit.filter(c => g.isCreature(c) && (mass.kind === "minus" || mass.kind === "bounce" || mass.kind === "exile" || !g.kw(c, "indestructible")))
        : g.creatures(p).filter(c => !g.kw(c, "indestructible") && !(spares && spares(c)));
      if (dying.length < 2) return null;
      const worth = dying.reduce((s, c) => s + valueOf(g, c), 0);
      const indest = !mass || mass.kind === "destroy" || mass.kind === "damage";
      const fm = indest && (castAct(actions, "Flawless Maneuver", true) || castAct(actions, "Flawless Maneuver"));
      if (fm && worth >= 8) return { type: "cast", card: fm.card, alt: fm.alt, maxTries: 1 };
      const bc = indest && castAct(actions, "Boros Charm");
      if (bc && worth >= 10) return { type: "cast", card: bc.card, mode: 1, maxTries: 1 };
      const bomb = freeOutlets(g, p).find(o => o.def.name === "Goblin Bombardment");
      if (bomb) {
        S.dying = new Set(dying.map(c => c.id)); S.dyingTurn = g.turn;
        const zc = new Map(dying.map(c => [c.id, c.zc]));
        return { type: "activate", card: bomb, idx: 0, repeat: dying.length, maxTries: 2, stop: () => !dying.some(c => c.zone === "battlefield" && c.zc === zc.get(c.id)) };
      }
      return null;
    }
    if (GIFTS.has(d.name)) return null;               // these give us a token or Treasures: let them resolve
    const specs = g.spellTargets(top.o, top);
    const hit = top.targets.find((t, i) => t && !g.isPlayer(t) && t.zone === "battlefield" && t.controller === p && g.isCreature(t) && specs[i] && specs[i].purpose === "harm");
    if (!hit || g.kw(hit, "indestructible")) return null;
    S.sacNext = { o: hit, turn: g.turn };
    for (const name of ["Deadly Dispute", "Village Rites"]) {
      const a = castAct(actions, name);
      if (a) return { type: "cast", card: a.card, maxTries: 2 };
    }
    const out = freeOutlets(g, p).find(o => !(o === hit && o.def.name === "Yahenni, Undying Partisan"));
    if (out) return { type: "activate", card: out, idx: 0, maxTries: 4 };
    return null;
  }
  /* After blockers: creatures of ours that will die without killing anything go to an outlet first. */
  function combatSacs(g, p) {
    const c = g.combat;
    if (!c) return null;
    const outs = freeOutlets(g, p);
    if (!outs.length) return null;
    const lethalTo = (src, o) => !g.kw(o, "indestructible") && g.power(src) > 0 && (g.power(src) >= g.lethalDamageLeft(o) || g.kw(src, "deathtouch"));
    const doomed = [];
    for (const a of c.attackers) {
      if (a.zone !== "battlefield" || !a.combat) continue;
      if (a.controller === p) {
        if (!a.combat.wasBlocked) continue;
        const bl = a.combat.blockedBy.filter(b => b.zone === "battlefield");
        if (!bl.length) continue;
        const dmgIn = bl.reduce((s, b) => s + Math.max(0, g.power(b)), 0);
        const dies = !g.kw(a, "indestructible") && dmgIn > 0 && (dmgIn >= g.lethalDamageLeft(a) || bl.some(b => g.kw(b, "deathtouch")));
        if (dies && !bl.some(b => lethalTo(a, b))) doomed.push(a);
      } else {
        const bl = a.combat.blockedBy.filter(b => b.zone === "battlefield");
        if (bl.length !== 1 || bl[0].controller !== p || g.kw(a, "trample")) continue;
        const b = bl[0];
        if (lethalTo(a, b) && !lethalTo(b, a)) doomed.push(b);
      }
    }
    if (!doomed.length) return null;
    const S = st(p);
    const yah = doomed.find(o => o.def.name === "Yahenni, Undying Partisan" && outs.includes(o));
    if (yah) {
      // Yahenni lives: it sacrifices another creature (a doomed one first) and gains indestructible
      S.dying = new Set(doomed.filter(o => o !== yah).map(o => o.id)); S.dyingTurn = g.turn;
      return { type: "activate", card: yah, idx: 0, maxTries: 2 };
    }
    const outlet = outs[0];
    const list = doomed.filter(o => !(o === outlet && outlet.def.name === "Yahenni, Undying Partisan"));
    if (!list.length) return null;
    S.dying = new Set(list.map(o => o.id)); S.dyingTurn = g.turn;
    const zc = new Map(list.map(o => [o.id, o.zc]));
    return { type: "activate", card: outlet, idx: 0, repeat: list.length, maxTries: 3, stop: () => !list.some(o => o.zone === "battlefield" && o.zc === zc.get(o.id)) };
  }
  /* Deadly Rollick for free while Edgar is out; paid only for a big threat at the end of the turn before ours. */
  function rollick(g, p, window, actions) {
    const free = castAct(actions, "Deadly Rollick", true);
    const paid = castAct(actions, "Deadly Rollick", false);
    if (!free && !paid) return null;
    const t = g.battlefield.filter(o => o.controller !== p && g.isCreature(o) && g.canTarget(p, o)).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
    if (!t) return null;
    const th = threatOf(g, t, p);
    if (free && th >= 4) return { type: "cast", card: free.card, alt: free.alt, targets: [t], maxTries: 2 };
    const endBeforeUs = window === "end" && g.nextPlayer(g.active) === p;
    if (paid && th >= 6 && (endBeforeUs || (window === "main1" && th >= 8))) return { type: "cast", card: paid.card, targets: [t], maxTries: 2 };
    return null;
  }
  /* End of the turn before ours: Bloodghast comes back with our land drop, so cash it in first. */
  function endValue(g, p, window) {
    if (window !== "end" || g.nextPlayer(g.active) !== p || !landInHand(p)) return null;
    const ghast = g.battlefield.find(o => o.controller === p && o.def.name === "Bloodghast");
    if (!ghast) return null;
    const out = freeOutlets(g, p)[0];
    if (!out) return null;
    const engines = g.battlefield.filter(o => o.controller === p && (DRAINERS.has(o.def.name) || PINGERS.has(o.def.name)));
    const y = deathYield(g, p, ghast, engines, out);
    if (y.each * liveFoes(g, p).length + y.tgt < 2) return null;
    st(p).sacNext = { o: ghast, turn: g.turn };
    return { type: "activate", card: out, idx: 0, maxTries: 1 };
  }
  /* Land drop: the generic picker plays a tapped land when nothing is castable before the drop.
     Play the untapped land that lets us cast the most (then the biggest) spell this turn instead. */
  function castableWith(g, p, land) {
    const score = () => {
      let n = 0, best = 0;
      for (const c of p.hand) {
        if (c === land || c.def.types.includes("Land") || (c.def.ai && c.def.ai.never)) continue;
        if (g.castOptions(p, c).length) { n++; best = Math.max(best, c.def.mv); }
      }
      for (const c of p.command) if (c.isCommander && g.castOptions(p, c).length) { n++; best = Math.max(best, c.def.mv); }
      return n * 10 + best;
    };
    if (!land) return score();
    const saved = { zone: land.zone, tapped: land.tapped, sick: land.sick, controller: land.controller };
    g.battlefield.push(land); land.zone = "battlefield"; land.tapped = false; land.sick = false; land.controller = p; g.bump();
    try { return score(); }
    finally {
      const i = g.battlefield.indexOf(land); if (i >= 0) g.battlefield.splice(i, 1);
      Object.assign(land, saved); g.bump();
    }
  }
  function entersTapped(g, p, d) {
    if (d.etbTapped === true) return true;
    if (typeof d.etbTapped !== "function") return false;
    try { return !!d.etbTapped(g, { controller: p, owner: p, def: d, id: -1 }); } catch (e) { return true; }
  }
  function landPlan(g, p, actions) {
    const lands = (actions || []).filter(a => a.type === "land" && a.card.zone === "hand");
    if (lands.length < 2) return null;
    // fetch lands have no mana ability of their own: the generic picker handles them
    const untapped = lands.filter(a => a.card.def.mana.length && !entersTapped(g, p, a.card.def));
    if (!untapped.length) return null;
    let best = null, bs = castableWith(g, p, null);
    for (const a of untapped) {
      const s = castableWith(g, p, a.card);
      if (s > bs) { bs = s; best = a; }
    }
    return best ? { type: "land", card: best.card, maxTries: 1 } : null;
  }
  function edgarPlan(g, p, o, ctx) {
    if (p.lost || g.over || !liveFoes(g, p).length) return null;
    const window = ctx.window, actions = ctx.actions;
    if (window === "main1") { const l = landPlan(g, p, actions); if (l) return l; }
    const fin = charmFinish(g, p, actions);
    if (fin) return fin;
    if (comboLive(g, p)) { const a = comboStart(g, p, window, actions); if (a) return a; }
    const lethal = sacLethal(g, p);
    if (lethal) return lethal;
    if (window === "stack") return stackAnswer(g, p, actions);
    if (window === "combat") return combatSacs(g, p) || charmStrike(g, p, actions);
    return rollick(g, p, window, actions) || endValue(g, p, window);
  }

  /* ---------------------------------------------------------------- more bot helpers */
  /* A combo piece whose partner is already out is cast right away. */
  function comboCast(g, p, o) {
    const other = GAIN_SIDE.includes(o.def.name) ? LOSS_SIDE : GAIN_SIDE;
    return other.some(n => has(g, p, n)) ? 40 : undefined;
  }
  /* Lifelink for the team (Vito, Vault of the Archangel): when enough damage is getting through. */
  function lifelinkWorth(g, p, ctx) {
    if (ctx.window !== "combat" || !g.combat || g.combat.attacker !== p) return false;
    const S = st(p);
    if (S.linkTurn === g.turn) return false;
    const dmg = g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield" && a.combat && (!a.combat.wasBlocked || g.kw(a, "trample")) && !g.kw(a, "lifelink"))
      .reduce((s, a) => s + Math.max(0, g.power(a)), 0);
    if (dmg >= (GAIN_SIDE.some(n => has(g, p, n)) ? 3 : 6)) { S.linkTurn = g.turn; return true; }
    return false;
  }
  /* Boros Charm: double strike on an unblocked attacker when that is lethal. */
  function charmStrike(g, p, actions) {
    const bc = castAct(actions, "Boros Charm");
    if (!bc || !g.combat || g.combat.attacker !== p) return null;
    const att = g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield" && a.combat && !a.combat.wasBlocked && !g.kw(a, "double strike"));
    for (const q of liveFoes(g, p)) {
      const at = att.filter(a => g.defenderOf(a.combat.attacking) === q);
      const dmg = at.reduce((s, a) => s + Math.max(0, g.power(a)), 0);
      if (!at.length || dmg >= q.life) continue;
      const best = at.slice().sort((a, b) => g.power(b) - g.power(a))[0];
      if (dmg + g.power(best) >= q.life && g.canTarget(p, best)) return { type: "cast", card: bc.card, mode: 2, targets: [best], maxTries: 1 };
    }
    return null;
  }
  const sacCost = { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" };
  const counterVampires = (g, s, p) => { for (const c of g.creatures(p).filter(c => isVampire(g, c))) g.addCounters(c, "p1", 1, s); };
  async function targetDrain(g, s, p, n, kind) {
    const t = await g.chooseTarget(p, trig({ kind, purpose: "harm", prompt: `${s.def.name}: target ${kind === "opponent" ? "opponent" : "player"} loses ${n} life` }), s);
    if (!t) return;
    g.loseLife(t, n, s);
    g.gainLife(p, n, s);
  }
  async function ping(g, s, p, n) {
    const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `${s.def.name} deals ${n} damage to` }), s);
    if (t) g.damage(s, t, n);
  }

  /* ================================================================ commander */
  const eminence = zone => Object.assign({
    on: "cast",
    when: (g, s, ev) => ev.p === s.controller && ev.o !== s && vampireCard(g, ev.o),
    intervening: (g, s) => s.zone === "command" || s.zone === "battlefield",
    do: (g, s, ev, { p }) => g.createToken(p, TK.vampire)
  }, zone ? { zone } : {});
  D({
    name: "Edgar Markov", cost: "{3}{R}{W}{B}", type: "Legendary Creature — Vampire Knight", pt: "4/4",
    keywords: ["first strike", "haste"],
    text: "Eminence — Whenever you cast another Vampire spell, if Edgar Markov is in the command zone or on the battlefield, create a 1/1 black Vampire creature token.\nFirst strike, haste\nWhenever Edgar Markov attacks, put a +1/+1 counter on each Vampire you control.",
    triggers: [
      eminence("command"),
      eminence(null),
      {
        on: "attacks", self: true,
        do: (g, s, ev, { p }) => {
          counterVampires(g, s, p);
          g.log(`Edgar Markov puts a +1/+1 counter on each Vampire ${p.name} controls.`, { p, cards: [s.def.name] });
        }
      }
    ],
    ai: { priority: 8, threat: 2, plan: edgarPlan }
  });

  /* ================================================================ creatures */
  D({
    name: "Viscera Seer", cost: "{B}", type: "Creature — Vampire Wizard", pt: "1/1",
    text: "Sacrifice a creature: Scry 1.",
    abilities: [{ label: "Sacrifice a creature: scry 1", sacCost, do: (g, s, ctx) => scry1(g, ctx.p, s), ai: { use: () => false } }],
    ai: { priority: 7, target: targetHook(1), confirm: (g, p, req) => (req.purpose === "scryBottom" ? !keepOnTop(g, p, req.card) : true) }
  });

  D({
    name: "Carrion Feeder", cost: "{B}", type: "Creature — Zombie", pt: "1/1",
    cantBlock: true,
    text: "Carrion Feeder can't block.\nSacrifice a creature: Put a +1/+1 counter on Carrion Feeder.",
    abilities: [{ label: "Sacrifice a creature: +1/+1 counter", sacCost, do: (g, s) => g.addCounters(s, "p1", 1, s), ai: { use: () => false } }],
    ai: { priority: 6, target: targetHook(1) }
  });

  D({
    name: "Vampire of the Dire Moon", cost: "{B}", type: "Creature — Vampire", pt: "1/1",
    keywords: ["deathtouch", "lifelink"],
    text: "Deathtouch\nLifelink",
    ai: { priority: 6 }
  });

  D({
    name: "Knight of the Ebon Legion", cost: "{B}", type: "Creature — Vampire Knight", pt: "1/2",
    text: "{2}{B}: Knight of the Ebon Legion gets +3/+3 and gains deathtouch until end of turn.\nAt the beginning of your end step, if a player lost 4 or more life this turn, put a +1/+1 counter on Knight of the Ebon Legion. (Damage causes loss of life.)",
    abilities: [{
      label: "+3/+3 and deathtouch", cost: "{2}{B}",
      do: (g, s) => { if (s.zone === "battlefield") { g.pump(s, 3, 3, ["deathtouch"]); g.log("Knight of the Ebon Legion gets +3/+3 and deathtouch.", { p: s.controller, cards: [s.def.name] }); } },
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && !!o.combat && o.state.pumped !== g.turn && ((o.state.pumped = g.turn), true) }
    }],
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      intervening: g => g.players.some(q => q.lifeLostThisTurn >= 4),
      do: (g, s) => g.addCounters(s, "p1", 1, s)
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Indulgent Aristocrat", cost: "{B}", type: "Creature — Vampire", pt: "1/1",
    keywords: ["lifelink"],
    text: "Lifelink\n{2}, Sacrifice a creature: Put a +1/+1 counter on each Vampire you control.",
    abilities: [{
      label: "Sacrifice a creature: counters on Vampires", cost: "{2}", sacCost,
      do: (g, s, ctx) => counterVampires(g, s, ctx.p),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(g.active) === p && g.creatures(p).filter(c => isVampire(g, c)).length >= 5 && g.creatures(p).some(c => c !== o && keepScore(g, p, c, o) < 2) }
    }],
    ai: { priority: 6, target: targetHook(1) }
  });

  D({
    name: "Skymarcher Aspirant", cost: "{W}", type: "Creature — Vampire Soldier", pt: "2/1",
    keywords: ["ascend"],
    text: "Ascend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nSkymarcher Aspirant has flying as long as you have the city's blessing.",
    statics: [{ applies: (g, s, o) => o === s && cityBlessing(g, s.controller), kw: ["flying"] }],
    ai: { priority: 6 }
  });

  D({
    name: "Cruel Celebrant", cost: "{W}{B}", type: "Creature — Vampire", pt: "1/2",
    text: "Whenever Cruel Celebrant or another creature or planeswalker you control dies, each opponent loses 1 life and you gain 1 life.",
    triggers: [
      { on: "dies", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => drainEach(g, s, p, 1) },
      { on: "leaves", when: (g, s, ev) => ev.to === "graveyard" && ev.p === s.controller && ev.lki && !ev.lki.creature && ev.lki.types.includes("Planeswalker"), do: (g, s, ev, { p }) => drainEach(g, s, p, 1) }
    ],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Legion Lieutenant", cost: "{W}{B}", type: "Creature — Vampire Knight", pt: "2/2",
    text: "Other Vampires you control get +1/+1.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && isVampire(g, o), pt: [1, 1] }],
    ai: { priority: 7 }
  });

  D({
    name: "Vampire Socialite", cost: "{B}{R}", type: "Creature — Vampire Noble", pt: "2/2",
    keywords: ["menace"],
    text: "Menace\nWhen Vampire Socialite enters, if an opponent lost life this turn, put a +1/+1 counter on each other Vampire you control.\nAs long as an opponent has lost life this turn, each other Vampire you control enters with an additional +1/+1 counter on it.",
    note: "The extra counter on a Vampire that enters later is put on right after it enters.",
    triggers: [
      {
        on: "enters", self: true, intervening: (g, s) => oppLostLife(g, s.controller),
        do: (g, s, ev, { p }) => { for (const c of g.creatures(p).filter(c => c !== s && isVampire(g, c))) g.addCounters(c, "p1", 1, s); }
      },
      {
        on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && isVampire(g, ev.o) && oppLostLife(g, s.controller),
        do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.addCounters(ev.o, "p1", 1, s); }
      }
    ],
    ai: { priority: 6 }
  });

  D({
    name: "Blood Artist", cost: "{1}{B}", type: "Creature — Vampire", pt: "0/1",
    text: "Whenever Blood Artist or another creature dies, target player loses 1 life and you gain 1 life.",
    triggers: [{ on: "dies", do: (g, s, ev, { p }) => targetDrain(g, s, p, 1, "player") }],
    ai: { priority: 8, threat: 2, target: targetHook(1) }
  });

  D({
    name: "Zulaport Cutthroat", cost: "{1}{B}", type: "Creature — Human Rogue Ally", pt: "1/1",
    text: "Whenever Zulaport Cutthroat or another creature you control dies, each opponent loses 1 life and you gain 1 life.",
    triggers: [{ on: "dies", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => drainEach(g, s, p, 1) }],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Bloodghast", cost: "{B}{B}", type: "Creature — Vampire Spirit", pt: "2/1",
    cantBlock: true,
    text: "Bloodghast can't block.\nBloodghast has haste as long as an opponent has 10 or less life.\nLandfall — Whenever a land you control enters, you may return Bloodghast from your graveyard to the battlefield.",
    statics: [{ applies: (g, s, o) => o === s && g.opponents(s.controller).some(q => q.life <= 10), kw: ["haste"] }],
    triggers: [{
      on: "enters", zone: "graveyard",
      when: (g, s, ev) => ev.p === s.owner && g.isLand(ev.o),
      optional: "Return Bloodghast from your graveyard to the battlefield?",
      do: (g, s, ev, { p }) => {
        if (s.zone !== "graveyard") return;
        g.putOntoBattlefield([s], p);
        g.log("Bloodghast returns to the battlefield.", { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Bloodthrone Vampire", cost: "{1}{B}", type: "Creature — Vampire", pt: "1/1",
    text: "Sacrifice a creature: Bloodthrone Vampire gets +2/+2 until end of turn.",
    abilities: [{ label: "Sacrifice a creature: +2/+2", sacCost, do: (g, s) => { if (s.zone === "battlefield") g.pump(s, 2, 2); }, ai: { use: () => false } }],
    ai: { priority: 6, target: targetHook(1) }
  });

  D({
    name: "Cordial Vampire", cost: "{B}{B}", type: "Creature — Vampire", pt: "1/1",
    text: "Whenever Cordial Vampire or another creature dies, put a +1/+1 counter on each Vampire you control.",
    triggers: [{ on: "dies", do: (g, s, ev, { p }) => counterVampires(g, s, p) }],
    ai: { priority: 7 }
  });

  D({
    name: "Vampire Nighthawk", cost: "{1}{B}{B}", type: "Creature — Vampire Shaman", pt: "2/3",
    keywords: ["flying", "deathtouch", "lifelink"],
    text: "Flying\nDeathtouch\nLifelink",
    ai: { priority: 6 }
  });

  D({
    name: "Stromkirk Captain", cost: "{1}{B}{R}", type: "Creature — Vampire Soldier", pt: "2/2",
    keywords: ["first strike"],
    text: "First strike\nOther Vampire creatures you control get +1/+1 and have first strike.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && isVampire(g, o), pt: [1, 1], kw: ["first strike"] }],
    ai: { priority: 7 }
  });

  D({
    name: "Drana, Liberator of Malakir", cost: "{1}{B}{R}", type: "Legendary Creature — Vampire Ally", pt: "2/3",
    keywords: ["flying", "first strike"],
    text: "Flying, first strike\nWhenever one or more creatures you control deal combat damage to a player, put a +1/+1 counter on each attacking creature you control.",
    triggers: [{
      on: "combatDamagePlayer",
      // "one or more": the first hit in a damage step queues the trigger, the rest of that step doesn't
      when: (g, s, ev) => {
        if (!ev.src || ev.src.controller !== s.controller || s.state.dranaQueued) return false;
        s.state.dranaQueued = true;
        return true;
      },
      do: (g, s, ev, { p }) => {
        s.state.dranaQueued = false;
        const list = g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield") : [];
        for (const a of list) g.addCounters(a, "p1", 1, s);
        if (list.length) g.log("Drana puts a +1/+1 counter on each attacking creature.", { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 8, threat: 1 }
  });

  D({
    name: "Mayhem Devil", cost: "{1}{B}{R}", type: "Creature — Devil", pt: "3/3",
    text: "Whenever a player sacrifices a permanent, Mayhem Devil deals 1 damage to any target.",
    triggers: [{ on: "sacrifice", do: (g, s, ev, { p }) => ping(g, s, p, 1) }],
    ai: { priority: 7, threat: 1, target: targetHook(1) }
  });

  D({
    name: "Judith, the Scourge Diva", cost: "{1}{B}{R}", type: "Legendary Creature — Human Shaman", pt: "2/2",
    text: "Other creatures you control get +1/+0.\nWhenever a nontoken creature you control dies, Judith deals 1 damage to any target.",
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o), pt: [1, 0] }],
    triggers: [{ on: "dies", when: (g, s, ev) => ev.p === s.controller && ev.lki && !ev.lki.isToken, do: (g, s, ev, { p }) => ping(g, s, p, 1) }],
    ai: { priority: 7, target: targetHook(1) }
  });

  D({
    name: "Yahenni, Undying Partisan", cost: "{2}{B}", type: "Legendary Creature — Aetherborn Vampire", pt: "2/2",
    keywords: ["haste"],
    text: "Haste\nWhenever a creature an opponent controls dies, put a +1/+1 counter on Yahenni, Undying Partisan.\nSacrifice another creature: Yahenni gains indestructible until end of turn.",
    triggers: [{ on: "dies", when: (g, s, ev) => ev.p !== s.controller && s.zone === "battlefield", do: (g, s) => g.addCounters(s, "p1", 1, s) }],
    abilities: [{
      label: "Sacrifice another creature: indestructible",
      sacCost: { filter: (g, c, src) => c.controller === src.controller && c !== src && g.isCreature(c), prompt: "Sacrifice another creature" },
      do: (g, s) => { if (s.zone === "battlefield") { g.grant(s, ["indestructible"]); g.log("Yahenni gains indestructible until end of turn.", { p: s.controller, cards: [s.def.name] }); } },
      ai: { use: () => false }
    }],
    ai: { priority: 7, target: targetHook(1) }
  });

  D({
    name: "Vito, Thorn of the Dusk Rose", cost: "{2}{B}", type: "Legendary Creature — Vampire Cleric", pt: "1/3",
    text: "Whenever you gain life, target opponent loses that much life.\n{3}{B}{B}: Creatures you control gain lifelink until end of turn.",
    triggers: [{
      on: "gainLife", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "opponent", purpose: "harm", prompt: `Vito: target opponent loses ${ev.amount} life` }), s);
        if (t) g.loseLife(t, ev.amount, s);
      }
    }],
    abilities: [{
      label: "Creatures gain lifelink", cost: "{3}{B}{B}",
      do: (g, s, ctx) => { g.grant(g.creatures(ctx.p), ["lifelink"]); g.log(`Creatures ${ctx.p.name} controls gain lifelink.`, { p: ctx.p, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => lifelinkWorth(g, p, ctx) }
    }],
    ai: { priority: 7, threat: 3, target: targetHook(1), cast: comboCast }
  });

  D({
    name: "Mavren Fein, Dusk Apostle", cost: "{2}{W}", type: "Legendary Creature — Vampire Cleric", pt: "2/2",
    text: "Whenever one or more nontoken Vampires you control attack, create a 1/1 white Vampire creature token with lifelink.",
    triggers: [{
      on: "attack", when: (g, s, ev) => ev.p === s.controller && ev.attackers.some(a => !a.isToken && isVampire(g, a)),
      do: (g, s, ev, { p }) => g.createToken(p, T.vampireLL)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Welcoming Vampire", cost: "{2}{W}", type: "Creature — Vampire", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\nWhenever one or more other creatures you control with power 2 or less enter, draw a card. This ability triggers only once each turn.",
    triggers: [{
      on: "enters",
      when: (g, s, ev) => {
        if (ev.o === s || !mine(s, ev.o) || !g.isCreature(ev.o) || g.power(ev.o) > 2 || s.state.welcomed === g.turn) return false;
        s.state.welcomed = g.turn;
        return true;
      },
      do: (g, s, ev, { p }) => g.draw(p, 1)
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Falkenrath Aristocrat", cost: "{2}{B}{R}", type: "Creature — Vampire", pt: "4/1",
    keywords: ["flying", "haste"],
    text: "Flying, haste\nSacrifice a creature: Falkenrath Aristocrat gains indestructible until end of turn. If the sacrificed creature was a Human, put a +1/+1 counter on Falkenrath Aristocrat.",
    triggers: [{
      // remembers whether the last creature its controller sacrificed was a Human (never triggers)
      on: "sacrifice", when: (g, s, ev) => { if (ev.p === s.controller) s.state.lastSacHuman = g.hasSub(ev.o, "Human"); return false; }, do: () => {}
    }],
    abilities: [{
      label: "Sacrifice a creature: indestructible", sacCost,
      do: (g, s) => {
        if (s.zone !== "battlefield") return;
        g.grant(s, ["indestructible"]);
        if (s.state.lastSacHuman) g.addCounters(s, "p1", 1, s);
        g.log("Falkenrath Aristocrat gains indestructible until end of turn.", { p: s.controller, cards: [s.def.name] });
      },
      ai: { use: () => false }
    }],
    ai: { priority: 7, target: targetHook(1) }
  });

  D({
    name: "Elenda, the Dusk Rose", cost: "{2}{W}{B}", type: "Legendary Creature — Vampire Knight", pt: "1/1",
    keywords: ["lifelink"],
    text: "Lifelink\nWhenever another creature dies, put a +1/+1 counter on Elenda, the Dusk Rose.\nWhen Elenda dies, create X 1/1 white Vampire creature tokens with lifelink, where X is Elenda's power.",
    triggers: [
      { on: "dies", when: (g, s, ev) => ev.o !== s && s.zone === "battlefield", do: (g, s) => g.addCounters(s, "p1", 1, s) },
      { on: "dies", self: true, do: (g, s, ev, { p }) => { const x = Math.max(0, ev.lki.power); if (x) g.createToken(p, T.vampireLL, { count: x }); } }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Sanctum Seeker", cost: "{2}{B}{B}", type: "Creature — Vampire Knight", pt: "3/4",
    text: "Whenever a Vampire you control attacks, each opponent loses 1 life and you gain 1 life.",
    triggers: [{ on: "attacks", when: (g, s, ev) => mine(s, ev.o) && isVampire(g, ev.o), do: (g, s, ev, { p }) => drainEach(g, s, p, 1) }],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Bloodline Keeper", cost: "{2}{B}{B}", type: "Creature — Vampire", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\n{T}: Create a 2/2 black Vampire creature token with flying.\n{B}: Transform Bloodline Keeper. Activate only if you control five or more Vampires.\n// Lord of Lineage (5/5): Flying. Other Vampire creatures you control get +2/+2. {T}: Create a 2/2 black Vampire creature token with flying.",
    note: "Transforms in place: it keeps the name Bloodline Keeper and becomes Lord of Lineage, a 5/5 flier that gives other Vampire creatures you control +2/+2. It is the front face again if it leaves the battlefield.",
    cda: (g, o) => (o.state.lord ? [5, 5] : [3, 3]),
    statics: [{ applies: (g, s, o) => !!s.state.lord && o !== s && mine(s, o) && isVampire(g, o), pt: [2, 2] }],
    abilities: [
      {
        label: "Create a 2/2 flying Vampire", tap: true,
        do: (g, s, ctx) => g.createToken(ctx.p, TK.flier),
        ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(g.active) === p }
      },
      {
        label: "Transform into Lord of Lineage", cost: "{B}",
        condition: (g, o, p) => !o.state.lord && g.creatures(p).filter(c => isVampire(g, c)).length >= 5,
        do: (g, s) => { if (s.zone !== "battlefield") return; s.state.lord = true; g.bump(); g.log("Bloodline Keeper transforms into Lord of Lineage.", { p: s.controller, cards: [s.def.name], kind: "big" }); },
        ai: { use: () => true }
      }
    ],
    ai: { priority: 8, threat: 2 }
  });

  D({
    name: "Twilight Prophet", cost: "{2}{B}{B}", type: "Creature — Vampire Cleric", pt: "2/2",
    keywords: ["flying", "ascend"],
    text: "Flying\nAscend (If you control ten or more permanents, you get the city's blessing for the rest of the game.)\nAt the beginning of your upkeep, if you have the city's blessing, reveal the top card of your library and put it into your hand. Each opponent loses X life and you gain X life, where X is that card's mana value.",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller, intervening: (g, s) => cityBlessing(g, s.controller),
      do: (g, s, ev, { p }) => {
        const top = p.library[0];
        if (!top) return;
        g.moveTo(top, "hand");
        g.log(`${p.name} reveals ${top.def.name} and puts it into their hand.`, { p, cards: [top.def.name] });
        if (top.def.mv > 0) drainEach(g, s, p, top.def.mv);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Vampire Nocturnus", cost: "{1}{B}{B}{B}", type: "Creature — Vampire", pt: "3/3",
    text: "Play with the top card of your library revealed.\nAs long as the top card of your library is black, Vampire Nocturnus and other Vampire creatures you control get +2/+1 and have flying.",
    note: "The table doesn't show the top card of the library; the bonus still depends on it.",
    statics: [{ applies: (g, s, o) => mine(s, o) && isVampire(g, o) && topIsBlack(s.controller), pt: [2, 1], kw: ["flying"] }],
    ai: { priority: 7 }
  });

  D({
    name: "Falkenrath Noble", cost: "{3}{B}", type: "Creature — Vampire Warrior", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever Falkenrath Noble or another creature dies, target player loses 1 life and you gain 1 life.",
    triggers: [{ on: "dies", do: (g, s, ev, { p }) => targetDrain(g, s, p, 1, "player") }],
    ai: { priority: 7, threat: 1, target: targetHook(1) }
  });

  D({
    name: "Bloodthirsty Conqueror", cost: "{3}{B}{B}", type: "Creature — Vampire Knight", pt: "5/5",
    keywords: ["flying", "deathtouch"],
    text: "Flying, deathtouch\nWhenever an opponent loses life, you gain that much life. (Damage causes loss of life.)",
    triggers: [{ on: "loseLife", when: (g, s, ev) => ev.p !== s.controller && g.opponents(s.controller).includes(ev.p), do: (g, s, ev, { p }) => g.gainLife(p, ev.amount, s) }],
    ai: { priority: 8, threat: 3, cast: comboCast }
  });

  D({
    name: "Vein Ripper", cost: "{3}{B}{B}{B}", type: "Creature — Vampire Assassin", pt: "6/5",
    keywords: ["flying", "ward"],
    text: "Flying\nWard—Sacrifice a creature.\nWhenever a creature dies, target opponent loses 2 life and you gain 2 life.",
    triggers: [
      { on: "dies", do: (g, s, ev, { p }) => targetDrain(g, s, p, 2, "opponent") },
      {
        on: "becameTarget", self: true, when: (g, s, ev) => ev.p !== s.controller && !!ev.item,
        do: async (g, s, ev) => {
          const q = ev.p, item = ev.item;
          if (!g.stack.includes(item) || q.lost) return;
          const opts = g.creatures(q);
          const pick = opts.length ? await g.ask(q, { type: "target", prompt: `Ward: sacrifice a creature, or ${item.name} is countered`, options: opts, optional: true, purpose: "ward", src: s }) : null;
          if (pick && pick.zone === "battlefield" && opts.includes(pick)) { g.sacrifice(pick); g.log(`${q.name} pays the ward cost.`, { p: q }); }
          else g.counterSpell(item, s);
        }
      }
    ],
    ai: {
      priority: 7, threat: 3,
      target: (g, p, req) => (req.purpose === "ward" ? req.options.slice().sort((a, b) => valueOf(g, a) - valueOf(g, b))[0] : foePick(g, p, req))
    }
  });

  /* ================================================================ planeswalkers */
  function sorinPlan(g, p, o) {
    if (o.zone !== "battlefield" || o.controller !== p || !g.canSorcery(p) || o.state.loyaltyUsed === g.turn) return null;
    const loy = o.counters.loyalty || 0;
    const S = st(p);
    if (loy >= 3) {
      const big = p.hand.filter(c => c.def.types.includes("Creature") && vampireCard(g, c) && c.def.mv >= 4 && !g.castOptions(p, c).length).sort((a, b) => b.def.mv - a.def.mv)[0];
      if (big && (loy >= 4 || big.def.mv >= 5)) return { type: "activate", card: o, idx: 2, maxTries: 1 };
    }
    const fodder = g.creatures(p).filter(c => isVampire(g, c) && keepScore(g, p, c) < 2);
    if (fodder.length) {
      const foes = targetableFoes(g, p);
      const finish = foes.some(q => q.life <= 3);
      const kill = g.battlefield.some(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible") && g.lethalDamageLeft(c) <= 3 && threatOf(g, c, p) >= 5);
      const drains = g.battlefield.some(c => c.controller === p && (DRAINERS.has(c.def.name) || PINGERS.has(c.def.name)));
      if (finish || kill || drains) { S.sorinSac = g.turn; return { type: "activate", card: o, idx: 1, maxTries: 1 }; }
    }
    if (g.creatures(p).length) return { type: "activate", card: o, idx: 0, maxTries: 1 };
    return { type: "activate", card: o, idx: 1, maxTries: 1 };
  }
  function sorinTarget(g, p, req) {
    if (req.purpose === "sacrifice") return st(p).sorinSac === g.turn ? sacPick(g, p, req) : null;
    if (req.purpose === "sorinPut") return req.options.slice().sort((a, b) => b.def.mv - a.def.mv)[0];
    if (req.purpose === "harm") return pingPick(g, p, req, 3);
    return undefined;
  }
  D({
    name: "Sorin, Imperious Bloodlord", cost: "{2}{B}", type: "Legendary Planeswalker — Sorin", loyalty: 4,
    text: "+1: Target creature you control gains deathtouch and lifelink until end of turn. If it's a Vampire, put a +1/+1 counter on it.\n+1: You may sacrifice a Vampire. When you do, Sorin, Imperious Bloodlord deals 3 damage to any target and you gain 3 life.\n−3: You may put a Vampire creature card from your hand onto the battlefield.",
    abilities: [
      {
        label: "+1: Deathtouch and lifelink", loyalty: 1,
        targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Give deathtouch and lifelink to" }],
        do: (g, s, ctx) => {
          const t = ctx.targets[0];
          if (!ctx.legal[0] || !t) return;
          g.grant(t, ["deathtouch", "lifelink"]);
          if (isVampire(g, t)) g.addCounters(t, "p1", 1, s);
          g.log(`${t.def.name} gains deathtouch and lifelink until end of turn.`, { p: ctx.p, cards: [t.def.name] });
        }
      },
      {
        label: "+1: Sacrifice a Vampire, 3 damage", loyalty: 1,
        do: async (g, s, ctx) => {
          const p = ctx.p;
          const vamps = g.creatures(p).filter(c => isVampire(g, c));
          if (!vamps.length) return;
          const pick = await g.ask(p, { type: "target", prompt: "Sorin: you may sacrifice a Vampire", options: vamps, optional: true, purpose: "sacrifice", src: s });
          if (!pick || pick.zone !== "battlefield" || !vamps.includes(pick)) return;
          g.sacrifice(pick);
          const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: 3, prompt: "Sorin deals 3 damage to" }), s);
          if (t) g.damage(s, t, 3);
          g.gainLife(p, 3, s);
        }
      },
      {
        label: "−3: Put a Vampire onto the battlefield", loyalty: -3,
        do: async (g, s, ctx) => {
          const p = ctx.p;
          const opts = p.hand.filter(c => c.def.types.includes("Creature") && vampireCard(g, c));
          if (!opts.length) return;
          const pick = await g.ask(p, { type: "target", prompt: "Sorin: you may put a Vampire creature card from your hand onto the battlefield", options: opts, optional: true, purpose: "sorinPut", src: s });
          if (pick && pick.zone === "hand" && opts.includes(pick)) g.putOntoBattlefield([pick], p);
        }
      }
    ],
    ai: { priority: 7, plan: sorinPlan, target: sorinTarget }
  });

  D({
    name: "Sorin, Lord of Innistrad", cost: "{2}{W}{B}", type: "Legendary Planeswalker — Sorin", loyalty: 3,
    text: "+1: Create a 1/1 black Vampire creature token with lifelink.\n−3: You get an emblem with \"Creatures you control get +1/+0.\"\n−7: Destroy up to three target creatures and/or other planeswalkers. Return each card put into a graveyard this way to the battlefield under your control.",
    note: "The −7 targets are chosen as the ability resolves.",
    abilities: [
      { label: "+1: 1/1 Vampire with lifelink", loyalty: 1, do: (g, s, ctx) => g.createToken(ctx.p, TK.lifelinker) },
      {
        label: "−3: Emblem, creatures get +1/+0", loyalty: -3,
        do: (g, s, ctx) => g.addEmblem(ctx.p, { name: "Sorin emblem", text: "Creatures you control get +1/+0.", statics: [{ applies: (g2, src, o) => o.controller === src.controller && g2.isCreature(o), pt: [1, 0] }] }),
        ai: { use: (g, p, o) => (o.counters.loyalty || 0) >= 5 && g.creatures(p).length >= 5 }
      },
      {
        label: "−7: Destroy up to three, take them", loyalty: -7,
        do: async (g, s, ctx) => {
          const p = ctx.p, chosen = [];
          for (let i = 0; i < 3; i++) {
            const t = await g.chooseTarget(p, { kind: "creatureOrPlaneswalker", purpose: "harm", optional: true, prompt: `Sorin: destroy target creature or planeswalker (${i + 1} of up to 3)`, filter: (g2, o) => o !== s && !chosen.includes(o) }, s);
            if (!t) break;
            chosen.push(t);
          }
          const hit = chosen.filter(o => o.zone === "battlefield");
          g.destroyAll(hit);
          const back = hit.filter(o => o.zone === "graveyard" && !o.isToken);
          if (back.length) { g.putOntoBattlefield(back, p); g.log(`${p.name} returns ${back.map(o => o.def.name).join(", ")} under their control.`, { p, cards: back.map(o => o.def.name) }); }
        },
        ai: { use: (g, p) => g.battlefield.some(c => c.controller !== p && (g.isCreature(c) || g.isPlaneswalker(c)) && !g.kw(c, "indestructible") && threatOf(g, c, p) >= 5) }
      }
    ],
    ai: { priority: 7, target: (g, p, req) => (req.purpose === "harm" ? (req.options.filter(o => !g.isPlayer(o) && o.controller !== p && !g.kw(o, "indestructible")).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0] || null) : undefined) }
  });

  /* ================================================================ artifacts */
  const talisman = (name, a, b) => D({
    name, cost: "{2}", type: "Artifact",
    text: `{T}: Add {C}.\n{T}: Add {${a}} or {${b}}. ${name} deals 1 damage to you.`,
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: [a, b], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });
  talisman("Talisman of Conviction", "R", "W");
  talisman("Talisman of Hierarchy", "W", "B");
  talisman("Talisman of Indulgence", "B", "R");

  D({
    name: "Mind Stone", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{1}, {T}, Sacrifice Mind Stone: Draw a card.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Draw a card", cost: "{1}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.draw(ctx.p, 1),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && g.nextPlayer(g.active) === p && g.controlled(p, x => g.isLand(x)).length >= 7 }
    }],
    ai: { ramp: true, priority: 7 }
  });

  function bannerColor(g, p) {
    const n = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    for (const o of g.creatures(p).concat(p.hand.filter(c => c.def.types.includes("Creature")))) for (const k of o.def.colors) n[k]++;
    return Object.keys(n).sort((a, b) => n[b] - n[a] || (b === "B") - (a === "B"))[0];
  }
  D({
    name: "Heraldic Banner", cost: "{3}", type: "Artifact",
    text: "As Heraldic Banner enters, choose a color.\nCreatures you control of the chosen color get +1/+0.\n{T}: Add one mana of the chosen color.",
    note: "The color is chosen right after it enters (black until then).",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = MK.COLORS.map(k => ({ id: k, label: MK.COLOR_NAME[k] }));
        const k = await g.ask(p, { type: "option", prompt: "Heraldic Banner: choose a color", options: opts, src: s, purpose: "bannerColor" });
        s.state.color = opts.some(x => x.id === k) ? k : "B";
        g.bump();
        g.log(`${p.name} chooses ${MK.COLOR_NAME[s.state.color]} for Heraldic Banner.`, { p, cards: [s.def.name] });
      }
    }],
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isCreature(o) && g.colorsOf(o).has(s.state.color || "B"), pt: [1, 0] }],
    mana: [{ tap: true, produce: (g, o) => o.state.color || "B" }],
    ai: { ramp: true, priority: 7, option: (g, p, req) => (req.purpose === "bannerColor" ? bannerColor(g, p) : undefined) }
  });

  /* ================================================================ enchantments */
  D({
    name: "Goblin Bombardment", cost: "{1}{R}", type: "Enchantment",
    text: "Sacrifice a creature: Goblin Bombardment deals 1 damage to any target.",
    abilities: [{
      label: "Sacrifice a creature: 1 damage", sacCost,
      targets: [{ kind: "any", purpose: "harm", amount: 1, prompt: "Goblin Bombardment deals 1 damage to" }],
      do: (g, s, ctx) => { if (ctx.legal[0]) g.damage(s, ctx.targets[0], 1); },
      ai: { use: () => false }
    }],
    ai: { priority: 7, threat: 2, target: targetHook(1) }
  });

  D({
    name: "Bastion of Remembrance", cost: "{2}{B}", type: "Enchantment",
    text: "When Bastion of Remembrance enters, create a 1/1 white Human Soldier creature token.\nWhenever a creature you control dies, each opponent loses 1 life and you gain 1 life.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.humanSoldier) },
      { on: "dies", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => drainEach(g, s, p, 1) }
    ],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Exquisite Blood", cost: "{4}{B}", type: "Enchantment",
    text: "Whenever an opponent loses life, you gain that much life.",
    triggers: [{ on: "loseLife", when: (g, s, ev) => ev.p !== s.controller && g.opponents(s.controller).includes(ev.p), do: (g, s, ev, { p }) => g.gainLife(p, ev.amount, s) }],
    ai: { priority: 6, threat: 3, cast: comboCast }
  });

  D({
    name: "Sanguine Bond", cost: "{3}{B}{B}", type: "Enchantment",
    text: "Whenever you gain life, target opponent loses that much life.",
    triggers: [{
      on: "gainLife", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "opponent", purpose: "harm", prompt: `Sanguine Bond: target opponent loses ${ev.amount} life` }), s);
        if (t) g.loseLife(t, ev.amount, s);
      }
    }],
    ai: { priority: 6, threat: 3, target: targetHook(1), cast: comboCast }
  });

  function sharesType(g, a, b) {
    const ca = g.ch(a), cb = g.ch(b);
    if (ca.allTypes) return cb.allTypes || cb.subtypes.size > 0;
    if (cb.allTypes) return ca.subtypes.size > 0;
    for (const t of ca.subtypes) if (cb.subtypes.has(t)) return true;
    return false;
  }
  D({
    name: "Shared Animosity", cost: "{2}{R}", type: "Enchantment",
    text: "Whenever a creature you control attacks, it gets +1/+0 until end of turn for each other attacking creature that shares a creature type with it.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => mine(s, ev.o),
      do: (g, s, ev) => {
        const a = ev.o;
        if (a.zone !== "battlefield" || !g.combat) return;
        const n = g.combat.attackers.filter(b => b !== a && b.zone === "battlefield" && sharesType(g, a, b)).length;
        if (n > 0) g.pump(a, n, 0);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Bitterblossom", cost: "{1}{B}", type: "Kindred Enchantment — Faerie",
    text: "At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.",
    triggers: [{ on: "upkeep", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { g.loseLife(p, 1, s); g.createToken(p, TK.faerie); } }],
    ai: { priority: 7 }
  });

  D({
    name: "Phyrexian Arena", cost: "{1}{B}{B}", type: "Enchantment",
    text: "At the beginning of your upkeep, you draw a card and you lose 1 life.",
    triggers: [{ on: "upkeep", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => { g.draw(p, 1); g.loseLife(p, 1, s); } }],
    ai: { priority: 6, draw: true }
  });

  /* An opponent pays for Smothering Tithe when the mana would sit unused anyway. */
  function titheShouldPay(g, q) {
    const avail = g.maxX(q, MK.parseCost(""), 1);
    if (avail < 2) return false;
    return g.active !== q ? avail >= 3 : avail >= 6;
  }
  D({
    name: "Smothering Tithe", cost: "{3}{W}", type: "Enchantment",
    text: "Whenever an opponent draws a card, that player may pay {2}. If the player doesn't, you create a Treasure token.",
    triggers: [{
      on: "draw", when: (g, s, ev) => ev.p !== s.controller && g.opponents(s.controller).includes(ev.p),
      do: async (g, s, ev, { p }) => {
        const q = ev.p, cost = MK.parseCost("{2}");
        if (!q.lost && g.canPay(q, cost)) {
          const pay = await g.ask(q, { type: "confirm", prompt: `Smothering Tithe: pay {2}? If you don't, ${p.name} creates a Treasure.`, src: s, purpose: "tithe" });
          if (pay && g.pay(q, cost)) { g.log(`${q.name} pays {2} for Smothering Tithe.`, { p: q, cards: [s.def.name] }); return; }
        }
        g.createToken(p, T.treasure);
      }
    }],
    ai: { priority: 8, ramp: true, threat: 1, confirm: (g, p, req) => (req.purpose === "tithe" ? titheShouldPay(g, p) : true) }
  });

  /* ================================================================ instants and sorceries */
  const commanderOut = (g, p) => g.battlefield.some(o => o.controller === p && o.isCommander);
  /* Destroy effects: the opponents' biggest threat that isn't indestructible. */
  function destroyPick(g, p, req) {
    if (req.purpose !== "harm") return undefined;
    const opts = req.options.filter(o => !g.isPlayer(o) && o.controller !== p && !g.kw(o, "indestructible"));
    return opts.length ? opts.sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0] : undefined;
  }
  const destroyWorth = (kind, min) => (g, p, o) => {
    const t = g.battlefield.filter(x => x.controller !== p && g.kindMatch(x, kind) && g.canTarget(p, x) && !g.kw(x, "indestructible"));
    return t.some(x => threatOf(g, x, p) >= min) ? undefined : false;
  };

  D({
    name: "Anguished Unmaking", cost: "{1}{W}{B}", type: "Instant",
    text: "Exile target nonland permanent. You lose 3 life.",
    spell: {
      targets: [{ kind: "nonland", purpose: "harm", prompt: "Exile" }],
      do: (g, ctx) => { if (!ctx.legal[0]) return; g.exile(ctx.targets[0], ctx.o); g.loseLife(ctx.p, 3, ctx.o); }
    },
    ai: { removal: true, minThreat: 6 }
  });

  D({
    name: "Vindicate", cost: "{1}{W}{B}", type: "Sorcery",
    text: "Destroy target permanent.",
    spell: { targets: [{ kind: "permanent", purpose: "harm", prompt: "Destroy" }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); } },
    ai: { removal: true, minThreat: 6, cast: destroyWorth("permanent", 6), target: destroyPick }
  });

  D({
    name: "Terminate", cost: "{B}{R}", type: "Instant",
    text: "Destroy target creature. It can't be regenerated.",
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy" }], do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o, { noRegen: true }); } },
    ai: { removal: true, minThreat: 4, cast: destroyWorth("creature", 4), target: destroyPick }
  });

  D({
    name: "Infernal Grasp", cost: "{1}{B}", type: "Instant",
    text: "Destroy target creature. You lose 2 life.",
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy" }], do: (g, ctx) => { if (!ctx.legal[0]) return; g.destroy(ctx.targets[0], ctx.o); g.loseLife(ctx.p, 2, ctx.o); } },
    ai: { removal: true, minThreat: 4, cast: destroyWorth("creature", 4), target: destroyPick }
  });

  D({
    name: "Deadly Rollick", cost: "{3}{B}", type: "Instant",
    text: "If you control a commander, you may cast this spell without paying its mana cost.\nExile target creature.",
    altCosts: [{ label: "Free (you control a commander)", cost: "", condition: (g, p) => commanderOut(g, p) }],
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Exile" }], do: (g, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], ctx.o); } },
    ai: { never: true, brain: "edgar", otherwise: { removal: true, minThreat: 5 } }   // cast by Edgar's plan, for free when it can
  });

  D({
    name: "Flawless Maneuver", cost: "{2}{W}", type: "Instant",
    text: "If you control a commander, you may cast this spell without paying its mana cost.\nCreatures you control gain indestructible until end of turn.",
    altCosts: [{ label: "Free (you control a commander)", cost: "", condition: (g, p) => commanderOut(g, p) }],
    spell: { do: (g, ctx) => { g.grant(g.creatures(ctx.p), ["indestructible"]); g.log(`Creatures ${ctx.p.name} controls gain indestructible until end of turn.`, { p: ctx.p }); } },
    ai: { never: true, brain: "edgar", otherwise: { protection: true, protects: (g, q, top) => !!(top.o && top.o.def.ai && top.o.def.ai.wipe) || !!(MK.AI && MK.AI.newWipes && MK.AI.newWipes(g) && MK.AI.massHarm(g, q, top)) } }   // cast by Edgar's plan in response to a board wipe
  });

  D({
    name: "Boros Charm", cost: "{R}{W}", type: "Instant",
    text: "Choose one —\n• Boros Charm deals 4 damage to target player or planeswalker.\n• Permanents you control gain indestructible until end of turn.\n• Target creature gains double strike until end of turn.",
    modes: [
      {
        label: "4 damage to target player or planeswalker",
        targets: [{ kind: "any", purpose: "harm", amount: 4, prompt: "Boros Charm deals 4 damage to", filter: (g, o) => g.isPlaneswalker(o) }],
        do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.o, ctx.targets[0], 4); }
      },
      {
        label: "Your permanents gain indestructible",
        do: (g, ctx) => { g.grant(g.controlled(ctx.p), ["indestructible"]); g.log(`Permanents ${ctx.p.name} controls gain indestructible until end of turn.`, { p: ctx.p }); }
      },
      {
        label: "Target creature gains double strike",
        targets: [{ kind: "creature", purpose: "help", prompt: "Give double strike to" }],
        do: (g, ctx) => { if (ctx.legal[0]) { g.grant(ctx.targets[0], ["double strike"]); g.log(`${ctx.targets[0].def.name} gains double strike.`, { p: ctx.p }); } }
      }
    ],
    ai: { never: true }   // cast by Edgar's plan: finish a player, save the board, or double strike for lethal
  });

  D({
    name: "Demonic Tutor", cost: "{1}{B}", type: "Sorcery",
    text: "Search your library for a card, put that card into your hand, then shuffle.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, { prompt: "Demonic Tutor: search for a card" }) },
    ai: { tutor: true, priority: 8 }
  });

  D({
    name: "Vampiric Tutor", cost: "{B}", type: "Instant",
    text: "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
    spell: { do: async (g, ctx) => { await tutor(g, ctx.p, ctx.o, { to: "top", prompt: "Vampiric Tutor: search for a card to put on top" }); g.loseLife(ctx.p, 2, ctx.o); } },
    ai: { tutor: true, instantEnd: true, priority: 7 }
  });

  D({
    name: "Enlightened Tutor", cost: "{W}", type: "Instant",
    text: "Search your library for an artifact or enchantment card, reveal it, then shuffle and put that card on top.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, { to: "top", hidden: false, filter: (g2, o) => o.def.types.includes("Artifact") || o.def.types.includes("Enchantment"), prompt: "Enlightened Tutor: search for an artifact or enchantment card" }) },
    ai: { tutor: true, instantEnd: true, priority: 6 }
  });

  /* "As an additional cost, sacrifice ...": the engine takes it right after the spell is cast. */
  const sacAsCost = artifactsToo => async (g, p, o, item) => {
    if (item && item.isCopy) return;
    const opts = g.battlefield.filter(c => c.controller === p && (g.isCreature(c) || (artifactsToo && g.isArtifact(c))));
    if (!opts.length) return;
    let pick = await g.ask(p, { type: "target", prompt: `${o.def.name}: sacrifice ${artifactsToo ? "an artifact or creature" : "a creature"} (additional cost)`, options: opts, purpose: "sacrifice", src: o });
    if (!pick || !opts.includes(pick)) pick = opts.slice().sort((a, b) => keepScore(g, p, a) - keepScore(g, p, b))[0];
    g.sacrifice(pick);
  };
  const cheapFodder = (g, p, artifactsToo) => g.battlefield.some(o => o.controller === p && ((g.isCreature(o) && keepScore(g, p, o) < 2) || (artifactsToo && o.def.name === "Treasure")));

  D({
    name: "Diabolic Intent", cost: "{1}{B}", type: "Sorcery",
    text: "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a card, put that card into your hand, then shuffle.",
    note: "The creature is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.creatures(p).length > 0,
    onCast: sacAsCost(false),
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, { prompt: "Diabolic Intent: search for a card" }) },
    ai: { tutor: true, priority: 7, cast: (g, p) => (cheapFodder(g, p, false) ? undefined : false), target: sacPick }
  });

  D({
    name: "Village Rites", cost: "{B}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice a creature.\nDraw two cards.",
    note: "The creature is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.creatures(p).length > 0,
    onCast: sacAsCost(false),
    spell: { do: (g, ctx) => g.draw(ctx.p, 2) },
    ai: { draw: true, priority: 5, cast: (g, p) => (cheapFodder(g, p, false) && p.hand.length <= 3 ? undefined : false), target: sacPick }
  });

  D({
    name: "Deadly Dispute", cost: "{1}{B}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice an artifact or creature.\nDraw two cards and create a Treasure token.",
    note: "The artifact or creature is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.battlefield.some(c => c.controller === p && (g.isCreature(c) || g.isArtifact(c))),
    onCast: sacAsCost(true),
    spell: { do: (g, ctx) => { g.draw(ctx.p, 2); g.createToken(ctx.p, T.treasure); } },
    ai: { draw: true, priority: 6, cast: (g, p) => (cheapFodder(g, p, true) && p.hand.length <= 4 ? undefined : false), target: sacPick }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const alive = (g, o) => o.controller.life > 1;
  D({ name: "Swamp", type: "Basic Land — Swamp", text: "({T}: Add {B}.)", mana: [{ tap: true, produce: "B" }] });
  D({ name: "Mountain", type: "Basic Land — Mountain", text: "({T}: Add {R}.)", mana: [{ tap: true, produce: "R" }] });

  land("Nomad Outpost", { text: "Nomad Outpost enters tapped.\n{T}: Add {R}, {W}, or {B}.", etbTapped: true, mana: [{ tap: true, produce: ["R", "W", "B"] }] });

  const dual = (name, types, a, b) => land(name, { type: "Land — " + types, text: `({T}: Add {${a}} or {${b}}.)`, mana: [{ tap: true, produce: [a, b] }] });
  dual("Plateau", "Mountain Plains", "R", "W");
  dual("Scrubland", "Plains Swamp", "W", "B");
  dual("Badlands", "Swamp Mountain", "B", "R");

  /* Shock lands: a bot pays 2 life when it has a spell to use the mana on this turn. */
  const shockPay = (g, p) => g.active === p && p.life >= 10 && p.hand.some(c => !c.def.types.includes("Land") && c.def.mv <= g.controlled(p, x => g.isLand(x)).length + 1);
  const shock = (name, types, a, b) => land(name, {
    type: "Land — " + types,
    text: `({T}: Add {${a}} or {${b}}.)\nAs ${name} enters, you may pay 2 life. If you don't, it enters tapped.`,
    note: "You choose right after it enters: pay 2 life, or it becomes tapped.",
    mana: [{ tap: true, produce: [a, b] }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const ok = p.life > 2 && await g.ask(p, { type: "confirm", prompt: `${name}: pay 2 life so it enters untapped?`, src: s, purpose: "shock" });
        if (ok && g.payLife(p, 2)) g.log(`${p.name} pays 2 life for ${name}.`, { p, cards: [name] });
        else g.tap(s);
      }
    }],
    ai: { confirm: (g, p) => shockPay(g, p) }
  });
  shock("Sacred Foundry", "Mountain Plains", "R", "W");
  shock("Godless Shrine", "Plains Swamp", "W", "B");
  shock("Blood Crypt", "Swamp Mountain", "B", "R");

  /* Fetch lands: cracked as soon as the bot may (Edgar's deck wants the colors now). */
  const fetchPlan = (g, p, o, ctx) => (o.zone === "battlefield" && o.controller === p && !o.tapped && p.life > 3 && (ctx.window === "main1" || ctx.window === "main2" || ctx.window === "end") ? { type: "activate", card: o, idx: 0, maxTries: 1 } : null);
  const fetch = (name, a, b) => land(name, {
    text: `{T}, Pay 1 life, Sacrifice ${name}: Search your library for a ${a} or ${b} card, put it onto the battlefield, then shuffle.`,
    abilities: [{
      label: `Search for a ${a} or ${b}`, tap: true, payLife: 1, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && (o.def.subtypes.includes(a) || o.def.subtypes.includes(b)), to: "battlefield", prompt: `${name}: choose a ${a} or ${b} card`, src: s }),
      ai: { use: () => false }
    }],
    ai: { plan: fetchPlan }
  });
  fetch("Marsh Flats", "Plains", "Swamp");
  fetch("Arid Mesa", "Mountain", "Plains");
  fetch("Bloodstained Mire", "Swamp", "Mountain");

  const pain = (name, a, b) => land(name, {
    text: `{T}: Add {C}.\n{T}: Add {${a}} or {${b}}. ${name} deals 1 damage to you.`,
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: [a, b], condition: alive, after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  pain("Battlefield Forge", "R", "W");
  pain("Caves of Koilos", "W", "B");
  pain("Sulfurous Springs", "B", "R");

  const fast = (name, a, b) => land(name, {
    text: `${name} enters tapped unless you control two or fewer other lands.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x)).length > 2,
    mana: [{ tap: true, produce: [a, b] }]
  });
  fast("Inspiring Vantage", "R", "W");
  fast("Concealed Courtyard", "W", "B");
  fast("Blackcleave Cliffs", "B", "R");

  const check = (name, a, b, sa, sb) => land(name, {
    text: `${name} enters tapped unless you control a ${sa} or a ${sb}.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: (g, o) => !g.controlled(o.controller, x => x !== o && g.isLand(x) && (x.def.subtypes.includes(sa) || x.def.subtypes.includes(sb))).length,
    mana: [{ tap: true, produce: [a, b] }]
  });
  check("Clifftop Retreat", "R", "W", "Mountain", "Plains");
  check("Isolated Chapel", "W", "B", "Plains", "Swamp");
  check("Dragonskull Summit", "B", "R", "Swamp", "Mountain");

  land("City of Brass", {
    text: "Whenever City of Brass becomes tapped, it deals 1 damage to you.\n{T}: Add one mana of any color.",
    note: "It only becomes tapped for mana here, and it isn't tapped for mana while you're at 1 life.",
    mana: [{ tap: true, produce: "any5", condition: alive, after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  land("Mana Confluence", {
    text: "{T}, Pay 1 life: Add one mana of any color.",
    note: "It isn't tapped for mana while you're at 1 life.",
    mana: [{ tap: true, produce: "any5", condition: alive, after: (g, o) => g.payLife(o.controller, 1) }]
  });
  land("Vault of the Archangel", {
    text: "{T}: Add {C}.\n{2}{W}{B}, {T}: Creatures you control gain deathtouch and lifelink until end of turn.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Creatures gain deathtouch and lifelink", cost: "{2}{W}{B}", tap: true,
      do: (g, s, ctx) => { g.grant(g.creatures(ctx.p), ["deathtouch", "lifelink"]); g.log(`Creatures ${ctx.p.name} controls gain deathtouch and lifelink.`, { p: ctx.p, cards: [s.def.name] }); },
      ai: { use: (g, p, o, ctx) => lifelinkWorth(g, p, ctx) }
    }]
  });

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "edgar", name: "Edgar", title: "Edgar Markov", commander: "Edgar Markov",
    identity: ["W", "B", "R"], bracket: 4, aggression: 0.65,
    style: "Vampire aristocrats",
    blurb: "Edgar makes a Vampire token every time a Vampire spell is cast, even from the command zone, then sacrifices the army to drain the table or loops Vito with Exquisite Blood for the win.",
    watch: ["Edgar Markov", "Exquisite Blood", "Vito, Thorn of the Dusk Rose", "Goblin Bombardment", "Blood Artist"],
    list: (function () {
      const singles = [
        // creatures (32)
        "Viscera Seer", "Carrion Feeder", "Vampire of the Dire Moon", "Knight of the Ebon Legion", "Indulgent Aristocrat",
        "Skymarcher Aspirant", "Cruel Celebrant", "Legion Lieutenant", "Vampire Socialite", "Blood Artist", "Zulaport Cutthroat",
        "Bloodghast", "Bloodthrone Vampire", "Cordial Vampire", "Vampire Nighthawk", "Stromkirk Captain",
        "Drana, Liberator of Malakir", "Mayhem Devil", "Judith, the Scourge Diva", "Yahenni, Undying Partisan",
        "Vito, Thorn of the Dusk Rose", "Mavren Fein, Dusk Apostle", "Welcoming Vampire", "Falkenrath Aristocrat",
        "Elenda, the Dusk Rose", "Sanctum Seeker", "Bloodline Keeper", "Twilight Prophet", "Vampire Nocturnus",
        "Falkenrath Noble", "Bloodthirsty Conqueror", "Vein Ripper",
        // artifacts (8)
        "Sol Ring", "Arcane Signet", "Talisman of Conviction", "Talisman of Hierarchy", "Talisman of Indulgence", "Mind Stone",
        "Heraldic Banner", "Skullclamp",
        // enchantments (8)
        "Smothering Tithe", "Goblin Bombardment", "Bastion of Remembrance", "Exquisite Blood", "Sanguine Bond",
        "Shared Animosity", "Bitterblossom", "Phyrexian Arena",
        // planeswalkers (2)
        "Sorin, Imperious Bloodlord", "Sorin, Lord of Innistrad",
        // instants and sorceries (16)
        "Swords to Plowshares", "Path to Exile", "Anguished Unmaking", "Vindicate", "Terminate", "Infernal Grasp",
        "Deadly Rollick", "Generous Gift", "Demonic Tutor", "Vampiric Tutor", "Diabolic Intent", "Enlightened Tutor",
        "Village Rites", "Deadly Dispute", "Boros Charm", "Flawless Maneuver",
        // lands (23 + 10 basics)
        "Command Tower", "Nomad Outpost", "Sacred Foundry", "Godless Shrine", "Blood Crypt", "Plateau", "Scrubland", "Badlands",
        "Marsh Flats", "Arid Mesa", "Bloodstained Mire", "Battlefield Forge", "Caves of Koilos", "Sulfurous Springs",
        "Inspiring Vantage", "Concealed Courtyard", "Blackcleave Cliffs", "Clifftop Retreat", "Isolated Chapel",
        "Dragonskull Summit", "City of Brass", "Mana Confluence", "Vault of the Archangel"
      ];
      const counts = { Swamp: 6, Plains: 2, Mountain: 2 };
      const out = singles.slice();
      for (const n in counts) for (let i = 0; i < counts[n]; i++) out.push(n);
      return out;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
