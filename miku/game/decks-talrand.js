/* Talrand, Sky Summoner: a mono-blue spellslinger bot deck (Bracket 4).
   Talrand makes a 2/2 flying Drake for every instant and sorcery. The deck plays cheap cantrips,
   a wall of counterspells, fast mana, and wins with Isochron Scepter + Dramatic Reversal (infinite
   mana and Drakes with three mana from rocks): the loop gains life with Aetherflux Reservoir and
   shoots each opponent, or draws out the library with Blue Sun's Zenith or Stroke of Genius for
   Thassa's Oracle. The bot's decisions live in `brain` (Talrand's plan): counter wars in the stack
   window, the combo and the kill in main phases and at the end of the turn before ours.
   Card text follows the printed Oracle text; `note` says where the engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const definedBefore = new Set(MK.defs.keys());
  const pc = s => MK.parseCost(s);
  const costMV = c => MK.util.costMV(c);
  const isBot = p => !!(p && p.agent && p.agent.bot);
  const typeOf = (c, t) => !!c && !!c.def && c.def.types.includes(t);
  const isIS = c => typeOf(c, "Instant") || typeOf(c, "Sorcery");
  const isLandCard = c => typeOf(c, "Land");
  const isBlueCard = c => !!c && (c.def.colors || []).includes("U");
  const byName = (list, n) => list.find(c => c.def.name === n) || null;
  const ctrl = (g, p, n) => g.controlled(p, o => o.def.name === n);
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards, extra) => g.log(text, Object.assign({ p, cards: cards || [] }, extra || {}));

  /* ---------- tokens */
  T.talrandDrake = MK.tokenDef({ key: "talrand-drake", name: "Drake", pt: [2, 2], colors: "U", subtypes: ["Drake"], keywords: ["flying"] });
  T.talrandBirdIllusion = MK.tokenDef({ key: "talrand-bird-illusion", name: "Bird Illusion", pt: [1, 1], colors: "U", subtypes: ["Bird", "Illusion"], keywords: ["flying"] });
  T.talrandSwanBird = MK.tokenDef({ key: "talrand-swan-bird", name: "Bird", pt: [2, 2], colors: "U", subtypes: ["Bird"], keywords: ["flying"] });

  /* ---------- mana */
  const manaNow = (g, p) => g.maxX(p, pc(""), 1);
  /* The best mana ability of o that only needs {T} (no other cost, no sacrifice, no damage). */
  function freeTap(g, o) {
    let best = null;
    for (const ab of g.manaAbilities(o)) {
      if (!ab.tap || ab.cost || ab.sacSelf || ab.tapCreature || ab.after || ab.noAuto) continue;
      if (ab.condition && !ab.condition(g, o)) continue;
      const prod = typeof ab.produce === "function" ? ab.produce(g, o) : ab.produce;
      if (!prod) continue;
      const opts = g.expandProduce(prod, o.controller);
      const units = opts.find(u => u.includes("U")) || opts[0];
      if (units && (!best || units.length > best.length)) best = units;
    }
    return best;
  }
  const floatable = (g, o, p) => o.controller === p && !g.isLand(o) && !(g.isCreature(o) && o.sick && !g.kw(o, "haste"));
  /* Mana the nonland permanents of p make each time they are all untapped (Dramatic Reversal loops). */
  function rockOutput(g, p) {
    let n = 0;
    for (const o of g.battlefield) if (floatable(g, o, p)) { const u = freeTap(g, o); if (u) n += u.length; }
    return n;
  }
  /* The same, split into blue and other mana. */
  function rockSplit(g, p) {
    let u = 0, c = 0;
    for (const o of g.battlefield) if (floatable(g, o, p)) { const us = freeTap(g, o); if (us) for (const k of us) { if (k === "U") u++; else c++; } }
    return { u, c };
  }
  /* Tap every untapped nonland mana source that only needs {T}; the mana goes to the pool. */
  function floatRocks(g, p) {
    let n = 0;
    for (const o of g.battlefield.slice()) {
      if (o.tapped || !floatable(g, o, p)) continue;
      const u = freeTap(g, o);
      if (!u) continue;
      g.tap(o);
      for (const k of u) p.pool[k] = (p.pool[k] || 0) + 1;
      n += u.length;
    }
    if (n) g.bump();
    return n;
  }
  const blueSources = (g, p) => g.controlled(p, o => (o.def.mana || []).some(m => { const pr = typeof m.produce === "function" ? "" : m.produce; return pr === "any" || pr === "any5" || (Array.isArray(pr) ? pr.join("") : String(pr || "")).includes("U"); })).length;

  /* ---------- what the bot wants in hand */
  const WORTH = {
    "Dramatic Reversal": 8.5, "Isochron Scepter": 8.5, "Force of Will": 9, "Fierce Guardianship": 8.5, "Counterspell": 8,
    "Mystical Tutor": 8, "Rhystic Study": 8, "Force of Negation": 7.5, "Pact of Negation": 6.5, "Mana Leak": 6,
    "Thassa's Oracle": 5.5, "Blue Sun's Zenith": 6.5, "Stroke of Genius": 6.5, "Cyclonic Rift": 7.5, "Merchant Scroll": 7,
    "Essence Scatter": 6.5, "Exclude": 7, "Evacuation": 6, "Gilded Lotus": 6.5, "Hedron Archive": 5.5, "Swan Song": 6, "Negate": 6.5, "Mystic Remora": 6, "Archmage Emeritus": 7,
    "Brainstorm": 6.5, "Ponder": 6, "Preordain": 6, "Opt": 5, "Consider": 5, "Sleight of Hand": 5,
    "Impulse": 5.5, "Snap": 5.5, "Chain of Vapor": 5, "Whir of Invention": 7,
    "Into the Roil": 5.5, "Aetherize": 5.5, "Solve the Equation": 6.5, "Repulse": 5.5, "Thirst for Knowledge": 5.5,
    "Arcane Denial": 7, "Transmute Artifact": 6.5, "Thran Dynamo": 6, "Aetherflux Reservoir": 6, "Gush": 6, "Dig Through Time": 6, "Aetherspouts": 6, "Cryptic Command": 7.5,
    "Mystic Confluence": 7, "Treasure Cruise": 5, "Deep Analysis": 5,
    "Frantic Search": 5.5, "Murmuring Mystic": 6.5, "Baral, Chief of Compliance": 6.5,
    "Spellseeker": 6.5, "Tribute Mage": 6, "Trinket Mage": 5.5, "Archaeomancer": 5, "Fabricate": 6
  };
  function cardWorth(g, p, c) {
    const d = c.def;
    const lands = g.controlled(p, o => g.isLand(o)).length;
    const inHand = p.hand.filter(x => x !== c && isLandCard(x)).length;
    if (isLandCard(c)) { const have = lands + inHand; return have < 3 ? 10 : have < 5 ? 7.5 : have < 7 ? 4.5 : 2; }
    let s = WORTH[d.name] != null ? WORTH[d.name] : (d.ai && d.ai.counter ? 6.5 : 5);
    if (d.ai && d.ai.ramp) s += lands < 5 ? 2.5 : -1.5;
    const sc = comboState(g, p);
    if (d.name === "Dramatic Reversal" && sc.scepter && !sc.reversal) s += 2;
    if (d.name === "Isochron Scepter" && sc.reversalInHand && !sc.scepter) s += 2;
    if (d.name === FLUX && sc.revScepter) s += 2.5;
    if (d.name === "Thassa's Oracle" && (sc.ready || p.library.length < 20)) s += 3;
    if (d.mv > lands + 3 && !(d.altCosts && d.altCosts.length)) s -= 1.5;
    return s;
  }
  const worstFirst = (g, p, list) => list.slice().sort((a, b) => cardWorth(g, p, a) - cardWorth(g, p, b));
  const bestFirst = (g, p, list) => list.slice().sort((a, b) => cardWorth(g, p, b) - cardWorth(g, p, a));

  /* ---------- library manipulation */
  function moveInLibrary(p, c, toTop) {
    const i = p.library.indexOf(c);
    if (i < 0) return;
    p.library.splice(i, 1);
    if (toTop) p.library.unshift(c); else p.library.push(c);
  }
  /* Scry n. The cards you keep stay on top in the order they were. */
  async function scry(g, p, n, src) {
    const top = p.library.slice(0, n);
    if (!top.length) return;
    let bottom;
    if (isBot(p)) { const bar = scryBar(g, p); bottom = top.filter(c => cardWorth(g, p, c) < bar); }
    else bottom = (await g.ask(p, { type: "cards", prompt: `Scry ${top.length}: choose the cards to put on the bottom of your library. The others stay on top in this order: ${top.map(c => c.def.name).join(", ")}.`, options: top, min: 0, max: top.length, purpose: "scry", src })) || [];
    for (const c of bottom) if (c.zone === "library") moveInLibrary(p, c, false);
    g.bump();
    log(g, `${p.name} scries ${top.length}${bottom.length ? ` and puts ${bottom.length} on the bottom` : " and keeps " + (top.length > 1 ? "them" : "it") + " on top"}.`, p, [], { kind: "scry" });
  }
  function scryBar(g, p) { return 5.4; }
  /* Surveil n: any of the top n cards can go to the graveyard. */
  async function surveil(g, p, n, src) {
    const top = p.library.slice(0, n);
    if (!top.length) return;
    let gy;
    if (isBot(p)) gy = top.filter(c => cardWorth(g, p, c) < scryBar(g, p));
    else gy = (await g.ask(p, { type: "cards", prompt: `Surveil ${top.length}: choose the cards to put into your graveyard (top card: ${top.map(c => c.def.name).join(", ")}).`, options: top, min: 0, max: top.length, purpose: "surveil", src })) || [];
    for (const c of gy) if (c.zone === "library") g.moveTo(c, "graveyard");
    log(g, gy.length ? `${p.name} surveils and puts ${gy.map(c => c.def.name).join(" and ")} into the graveyard.` : `${p.name} surveils and keeps the card on top.`, p, gy.map(c => c.def.name), { kind: "scry" });
  }
  /* Pick one card of `cards` (bots decide here, people get a cards prompt). */
  async function pickOne(g, p, cards, prompt, src, botPick, optional) {
    if (!cards.length) return null;
    if (isBot(p)) return botPick ? botPick(cards) : bestFirst(g, p, cards)[0];
    const a = await g.ask(p, { type: "cards", prompt, options: cards, min: optional ? 0 : 1, max: 1, purpose: "pick", src });
    return (a && a[0]) || (optional ? null : cards[0]);
  }
  /* Discard n cards: bots discard their least useful cards. */
  async function discardN(g, p, n, src) {
    n = Math.min(n, p.hand.length);
    if (n <= 0) return;
    let pick;
    if (isBot(p)) pick = worstFirst(g, p, p.hand).slice(0, n);
    else pick = ((await g.ask(p, { type: "cards", prompt: `Discard ${n} card${n > 1 ? "s" : ""}`, options: p.hand.slice(), min: n, max: n, purpose: "discard", src })) || []).slice(0, n);
    while (pick.length < n) { const c = p.hand.find(x => !pick.includes(x)); if (!c) break; pick.push(c); }
    for (const c of pick) g.discard(p, c);
  }
  /* Search the library for one card matching filter; to "hand" or "top". */
  async function tutor(g, p, src, filter, to, what) {
    const pool = (g.librarySearch ? g.librarySearch(p) : p.library).filter(c => filter(c));
    let pick = null;
    if (pool.length) {
      if (isBot(p)) pick = bestTutor(g, p, pool);
      else { const a = await g.ask(p, { type: "cards", prompt: `${src.def.name}: search your library for ${what}`, options: pool, min: 0, max: 1, purpose: "tutor", to, src }); pick = (a && a[0]) || null; }
    }
    g.shuffle(p);
    if (pick && pick.zone === "library") {
      if (to === "top") { moveInLibrary(p, pick, true); g.bump(); }
      else g.moveTo(pick, "hand");
      log(g, `${p.name} searches and finds ${pick.def.name}${to === "top" ? ", then puts it on top of the library" : ""}.`, p, [pick.def.name], { kind: "search" });
    } else log(g, `${p.name} searches and finds nothing.`, p, [], { kind: "search" });
    return pick;
  }

  /* ---------- the combo: Isochron Scepter with Dramatic Reversal plus three mana from rocks */
  const imprintOf = o => (o && o.state && o.state.imprint) || null;
  function comboState(g, p) {
    const scepters = ctrl(g, p, "Isochron Scepter");
    const revScepter = scepters.find(o => imprintOf(o) && imprintOf(o).def.name === "Dramatic Reversal") || null;
    const scepterInHand = byName(p.hand, "Isochron Scepter");
    const reversalInHand = byName(p.hand, "Dramatic Reversal");
    const out = rockOutput(g, p);
    return {
      revScepter, scepterInHand, reversalInHand, out,
      scepter: !!(revScepter || scepterInHand), reversal: !!(revScepter || reversalInHand),
      ready: !!revScepter && out >= 2, infinite: !!revScepter && out >= 3
    };
  }
  /* Aetherflux Reservoir (a shared card): the Scepter loop gains life with it, then it shoots each opponent */
  const FLUX = "Aetherflux Reservoir";
  const fluxOf = (g, p) => ctrl(g, p, FLUX)[0] || null;
  const ROCKS = ["Mana Vault", "Grim Monolith", "Basalt Monolith", "Thran Dynamo", "Gilded Lotus", "Sol Ring", "Hedron Archive", "Arcane Signet", "Mind Stone", "Thought Vessel", "Lotus Petal", "Chrome Mox", "Mox Diamond"];
  function tutorWant(g, p) {
    const s = comboState(g, p);
    const want = [];
    if (s.revScepter) {
      if (s.out < 2) want.push(...ROCKS.slice(0, 9));
      if (!fluxOf(g, p) && !byName(p.hand, FLUX)) want.push(FLUX);
      if (s.out < 3) want.push(...ROCKS.slice(0, 9));
      if (!xDrawCards(p).length) want.push(...XDRAW);
      want.push("Thassa's Oracle", "Archmage Emeritus");
    } else if (s.reversalInHand && !s.scepterInHand) want.push("Isochron Scepter");
    else if (s.scepterInHand && !s.reversalInHand) want.push("Dramatic Reversal");
    else if (s.scepterInHand && s.reversalInHand) { if (s.out < 3) want.push(...ROCKS.slice(0, 9)); }
    else want.push("Isochron Scepter", "Dramatic Reversal");
    if (!ctrl(g, p, "Rhystic Study").length) want.push("Rhystic Study");
    want.push("Force of Will", "Fierce Guardianship", "Counterspell", "Sol Ring", "Mana Vault", "Cyclonic Rift", "Arcane Signet", "Mystic Remora");
    return want;
  }
  function bestTutor(g, p, pool) {
    for (const n of tutorWant(g, p)) { const c = byName(pool, n); if (c && !byName(p.hand, n)) return c; }
    return bestFirst(g, p, pool)[0];
  }
  const XDRAW = ["Stroke of Genius", "Blue Sun's Zenith"];
  const xDrawCards = p => p.hand.filter(c => XDRAW.includes(c.def.name)).sort((a, b) => XDRAW.indexOf(a.def.name) - XDRAW.indexOf(b.def.name));
  const castAct = (acts, card) => acts.find(a => a.type === "cast" && a.card === card && !a.alt) || null;
  const oracleReachable = p => byName(p.hand, "Thassa's Oracle") || byName(p.library, "Thassa's Oracle");
  const oppValue = (g, q) => g.battlefield.filter(o => o.controller === q).reduce((s, o) => s + (MK.AI && MK.AI.value ? MK.AI.value(g, o) : 2), 0);

  /* ---------- how dangerous a spell is to Talrand, and how much Talrand's own spells matter */
  function myValue(g, p, o) {
    const n = o.def.name;
    if (o.isCommander) return 8;
    if (n === "Isochron Scepter") return imprintOf(o) && imprintOf(o).def.name === "Dramatic Reversal" ? 9 : 4;
    if (n === FLUX) return 7;
    if (["Rhystic Study", "Archmage Emeritus", "Murmuring Mystic", "Baral, Chief of Compliance", "Mystic Remora"].includes(n)) return 6;
    if (o.isToken) return 1 + (g.isCreature(o) ? g.power(o) * 0.3 : 0);
    if (g.isLand(o)) return 2;
    return 2 + (o.def.mv || 0) * 0.6;
  }
  /* How hard the table can hit p: the biggest army, plus a bit of the others, against p's life. */
  function pressure(g, p) {
    const pw = g.opponents(p).map(q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((n, c) => n + Math.max(0, g.power(c)), 0)).sort((a, b) => b - a);
    if (!pw.length) return 0;
    return (pw[0] + pw.slice(1).reduce((a, b) => a + b, 0) * 0.3) / Math.max(1, p.life);
  }
  function spellThreat(g, p, item, depth) {
    depth = depth || 0;
    const d = item.o.def, ai = d.ai || {};
    const mine = item.targets.filter(t => t && t.kind === "spell" && t.p === p && g.stack.includes(t));
    if (mine.length) return depth > 3 ? 4 : Math.max(...mine.map(s => spellImportance(g, p, s, depth + 1)));
    let s = d.mv * 0.75 + (item.x || 0) * 0.5;
    if (ai.wipe) s += 2 + g.battlefield.filter(o => o.controller === p && g.isCreature(o) && !(ai.spares && ai.spares(o))).reduce((n, o) => n + myValue(g, p, o), 0) * 0.6;
    if (ai.finisher) s += 10;
    if (ai.tutor) s += 2.5;
    if (ai.threat) s += ai.threat;
    if (item.o.isCommander) s += 3;
    if (d.types.includes("Creature")) {
      const pt = d.pt || [0, 0];
      s += Math.max(0, pt[0] - 2) * 0.35;
      if (item.p !== p && pressure(g, p) >= 0.4) s += 1 + Math.max(0, pt[0]) * 0.3;
      for (const k of ["flying", "lifelink", "trample", "double strike", "infect", "hexproof", "indestructible"]) if (d.keywords.includes(k)) s += 0.5;
      if (d.triggers.length) s += 1;
    }
    if (d.types.includes("Planeswalker")) s += 2.5;
    if ((d.abilities || []).some(a => (a.payLife || 0) >= 20)) s += 3;
    if ((d.abilities || []).some(a => a.ai && a.ai.first)) s += 8;
    if (!d.types.includes("Creature") && (d.statics.length || d.triggers.length) && !d.types.includes("Land")) s += 1;
    for (const t of item.targets) {
      if (!t || t.kind === "spell") continue;
      if (g.isPlayer(t)) { if (t === p && (ai.removal || ai.finisher)) s += 2; continue; }
      if (t.zone === "battlefield" && t.controller === p) s += 2 + myValue(g, p, t);
    }
    return s;
  }
  function spellImportance(g, p, item, depth) {
    const n = item.o.def.name;
    if (n === "Thassa's Oracle") return p.library.length <= g.devotion(p, "U") + 2 ? 25 : 3;
    if (n === "Dramatic Reversal") return item.isCopy ? 12 : 6;
    if (n === "Talrand, Sky Summoner") return 9;
    if (n === "Isochron Scepter") return byName(p.hand, "Dramatic Reversal") ? 11 : 5;
    if (n === FLUX) return comboState(g, p).revScepter ? 12 : 6;
    if (XDRAW.includes(n)) {
      const t = item.targets[0];
      if (t && t !== p && item.x >= t.library.length + 1) return 20;
      if (t === p && item.x >= p.library.length - 1) return 18;
      return 4;
    }
    if (n === "Cyclonic Rift") return item.alt ? 10 : 4;
    if (["Rhystic Study", "Archmage Emeritus", "Murmuring Mystic", "Mystic Remora"].includes(n)) return 7;
    const hit = item.targets.filter(t => t && t.kind === "spell" && t.p !== p && g.stack.includes(t));
    if (hit.length) return depth > 3 ? 4 : Math.max(...hit.map(t => spellThreat(g, p, t, depth + 1)));
    return 2 + item.o.def.mv * 0.5;
  }

  /* ---------- counterspells */
  function counterSpecOf(d) {
    if (d.spell && d.spell.targets && d.spell.targets[0] && d.spell.targets[0].kind === "spell") return { spec: d.spell.targets[0], mode: null };
    if (d.modes) { const i = d.modes.findIndex(m => m.counterMode); if (i >= 0) return { spec: d.modes[i].targets[0], mode: i }; }
    return null;
  }
  const SOFT = { "Mana Leak": 3 };
  /* Mana p will have at its next upkeep: lands and rocks that untap (not Grim Monolith, Mana Vault...). */
  function upkeepMana(g, p) {
    let n = 0, u = 0;
    for (const o of g.controlled(p)) {
      if (!g.isLand(o) && !floatable(g, o, p)) continue;
      if (o.def.doesntUntap && o.def.doesntUntap(g, o) && o.tapped) continue;
      const us = freeTap(g, o);
      if (!us) continue;
      n += us.length;
      if (us.includes("U")) u++;
    }
    return { n, u };
  }
  function pactSafe(g, p) {
    if (g.delayed.some(d => d.pact && d.controller === p)) return false;
    const m = upkeepMana(g, p);
    return m.n >= 6 && m.u >= 2;
  }
  function counterOptions(g, p, top, acts) {
    const out = [];
    for (const a of acts) {
      if (a.type === "cast") {
        const d = a.card.def;
        const cs = counterSpecOf(d);
        if (!cs || !g.targetOptions(p, cs.spec, a.card).includes(top)) continue;
        let mode = cs.mode, pen = 0;
        const soft = SOFT[d.name] || 0;
        if (soft && g.canPay(top.p, pc(`{${soft}}`))) continue;
        if (d.name === "Mystic Confluence") {
          if (!g.canPay(top.p, pc("{3}"))) mode = 1;
          else if (!g.canPay(top.p, pc("{9}"))) mode = 3;
          else continue;
          pen = 1;
        }
        if (a.alt) { const alt = d.altCosts[a.alt - 1]; if (alt.exileFromHand) pen += 4; }
        if (d.name === "Pact of Negation") { if (!pactSafe(g, p)) continue; pen += 4; }
        if (d.name === "Force of Will" && !a.alt) pen += 1.5;
        out.push({ act: a, card: a.card, mode, pen, score: costMV(a.cost) + pen });
      } else if (a.type === "activate" && a.card.def.name === "Isochron Scepter" && a.idx === 0) {
        const im = imprintOf(a.card);
        const cs = im && counterSpecOf(im.def);
        if (!cs || cs.mode != null || SOFT[im.def.name] || !g.targetOptions(p, cs.spec, a.card).includes(top)) continue;
        out.push({ act: a, card: a.card, scepter: true, pen: 0, score: 1.5 });
      }
    }
    return out.sort((x, y) => x.score - y.score);
  }
  function stackBrain(g, p, acts) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return null;
    const opts = counterOptions(g, p, top, acts);
    if (!opts.length) return null;
    const threat = spellThreat(g, p, top);
    const held = p.hand.filter(c => counterSpecOf(c.def)).length;
    let need = held >= 5 ? 4.5 : held >= 3 ? 5.2 : held >= 2 ? 5.8 : 6.5;
    if (ctrl(g, p, "Talrand, Sky Summoner").length) need -= 0.4;
    need -= Math.min(1.2, pressure(g, p));
    for (const o of opts) {
      if (threat < need + o.pen) continue;
      if (o.scepter) return { type: "activate", card: o.card, idx: 0, maxTries: 2 };
      const act = { type: "cast", card: o.card, targets: [top], alt: o.act.alt, maxTries: 2 };
      if (o.mode != null) act.mode = o.mode;
      return act;
    }
    return null;
  }
  /* Counterspell copies (Isochron Scepter) and people's targeting: the newest opposing spell. */
  const topOpposing = (g, p, req) => {
    const opts = req.options.filter(o => o && o.kind === "spell");
    if (!opts.length) return undefined;
    return opts.slice().sort((a, b) => g.stack.indexOf(b) - g.stack.indexOf(a))[0];
  };

  /* ---------- winning: Thassa's Oracle, X draw spells at an opponent, Scepter loops */
  function killNow(g, p, acts, win) {
    const oracle = byName(p.hand, "Thassa's Oracle");
    if (oracle && castAct(acts, oracle) && p.library.length <= g.devotion(p, "U") + 2) return { type: "cast", card: oracle, maxTries: 2 };
    /* drawing our library for Thassa's Oracle wins outright, so it comes before decking one opponent */
    if ((win === "main1" || win === "main2") && g.active === p && oracleReachable(p)) {
      const L = selfDrawX(g, p), o = oracleReachable(p);
      for (const c of xDrawCards(p)) {
        const a = castAct(acts, c);
        if (!a || L < 1 || L > a.xMax) continue;
        if (canDrawThenOracle(g, p, g.spellCost(p, c, { x: L }), g.spellCost(p, o, {}))) return { type: "cast", card: c, x: L, targets: [p], maxTries: 2 };
      }
    }
    const opps = g.opponents(p).filter(q => !g.playerHexproof(q)).sort((a, b) => oppValue(g, b) - oppValue(g, a));
    for (const c of xDrawCards(p)) {
      const a = castAct(acts, c);
      if (!a) continue;
      for (const q of opps) { const x = q.library.length + 1; if (x <= a.xMax) return { type: "cast", card: c, x, targets: [q], maxTries: 2 }; }
    }
    return null;
  }
  /* X for drawing out our own library: Archmage Emeritus draws one more as the spell is cast. */
  const selfDrawX = (g, p) => Math.max(0, p.library.length - ctrl(g, p, "Archmage Emeritus").length);
  /* The pool after paying cost from it the way the engine does (colors first, then generic from
     colorless, then from the color we have most of); null if the pool alone can't pay. */
  function afterPool(pool, cost) {
    const q = Object.assign({}, pool);
    for (const k of ["W", "U", "B", "R", "G", "C"]) { const n = cost[k] || 0; if ((q[k] || 0) < n) return null; q[k] -= n; }
    let gen = cost.g || 0;
    const c = Math.min(q.C || 0, gen); q.C -= c; gen -= c;
    while (gen > 0) {
      const k = Object.keys(q).filter(x => q[x] > 0).sort((a, b) => q[b] - q[a])[0];
      if (!k) return null;
      q[k]--; gen--;
    }
    return q;
  }
  /* Can p cast the X draw spell and then Thassa's Oracle? The draw spell is paid from the pool
     first, then from our sources, lands (Islands) before rocks, which can eat the blue the Oracle
     needs: count what the pool doesn't cover as paid with blue. */
  function canDrawThenOracle(g, p, xdCost, oracleCost) {
    if (!g.canPay(p, MK.util.addCost(xdCost, oracleCost))) return false;
    let blue = 0, other = 0;
    for (const o of g.controlled(p, x => !x.tapped)) { const us = freeTap(g, o); if (us) for (const k of us) { if (k === "U") blue++; else other++; } }
    const q = afterPool(p.pool, xdCost);
    if (q) { blue += q.U || 0; other += Object.values(q).reduce((a, b) => a + b, 0) - (q.U || 0); }
    else {
      const needU = Math.max(0, (xdCost.U || 0) - (p.pool.U || 0));
      const rest = Math.max(0, costMV(xdCost) - g.poolTotal(p) - needU);
      const fromBlue = Math.min(blue, needU + rest);
      blue -= fromBlue;
      other -= needU + rest - fromBlue;
    }
    return blue >= (oracleCost.U || 0) && blue + other >= costMV(oracleCost);
  }
  /* Enough Drakes to kill the opponent with the least life through their fliers (the attack goes at one player). */
  function drakesWanted(g, p) {
    const opps = g.opponents(p);
    if (!opps.length) return 0;
    const q = opps.slice().sort((a, b) => a.life - b.life)[0];
    const fliers = g.creatures(q).filter(c => g.kw(c, "flying") || g.kw(c, "reach")).length;
    return Math.max(10, Math.min(30, Math.ceil(Math.max(0, q.life) / 2) + fliers + 3));
  }
  /* Per-player memory for the bot's loops (reset each turn). */
  const MEMO = new WeakMap();
  function memo(g, p) {
    let m = MEMO.get(p);
    if (!m) MEMO.set(p, m = {});
    if (m.turn !== g.turn) { m.turn = g.turn; m.loops = 0; m.done = {}; }
    return m;
  }
  /* Would casting a spell right now trigger an opponent's permanent (Voice of Resurgence and friends)? */
  function castPunished(g, p) {
    const d = MK.defs.get("Dramatic Reversal");
    const o = { def: d, controller: p, owner: p, zone: "stack", state: {}, counters: {} };
    const ev = { type: "cast", p, o, item: { kind: "spell", o, p, targets: [], x: 0, isCopy: true }, spell: null };
    for (const s of g.battlefield) {
      if (s.controller === p) continue;
      for (const tr of s.def.triggers || []) {
        if (tr.on !== "cast") continue;
        try { if (!tr.when || tr.when(g, s, ev)) return true; } catch (e) { return true; }
      }
    }
    return false;
  }
  /* The tokens the loops make: Drakes (Talrand) and Bird Illusions (Murmuring Mystic). */
  const MAKERS = ["Talrand, Sky Summoner", "Murmuring Mystic"];
  const isArmy = o => !!o.isToken && ["Drake", "Bird Illusion", "Construct"].includes(o.def.name);
  const drakeCount = (g, p) => g.controlled(p, isArmy).length;
  const openDrakes = (g, p) => g.controlled(p, o => isArmy(o) && !o.tapped).length;
  const makersOut = (g, p) => MAKERS.reduce((n, nm) => n + ctrl(g, p, nm).length, 0);
  /* Untapped fliers wanted as blockers: enough for the biggest opposing army. */
  function blockNeed(g, p) {
    const most = Math.max(0, ...g.opponents(p).map(q => g.creatures(q).filter(c => g.power(c) > 0).length));
    return Math.min(30, most + 2);
  }
  /* How many Scepter loops (each nets out-2 mana) until p can pay cost; -1 if the loops can't get there (not enough blue). */
  /* Blue mana each Scepter loop adds (the {2} is paid with colorless first). */
  function blueGain(g, p) { const sp = rockSplit(g, p); return sp.u - Math.max(0, 2 - sp.c); }
  /* Blue we still have after the loop's first {2}. The loop taps the rocks for mana first
     (floatRocks) so the pool pays it; what the pool can't pay the engine takes from lands,
     colorless ones first, then Islands. */
  function blueAfterScepter(g, p) {
    const q = Object.assign({}, p.pool);
    for (const o of g.battlefield) if (!o.tapped && floatable(g, o, p)) { const u = freeTap(g, o); if (u) for (const k of u) q[k] = (q[k] || 0) + 1; }
    const lands = g.controlled(p, o => g.isLand(o) && !o.tapped).map(o => freeTap(g, o) || []);
    const landU = lands.filter(u => u.includes("U")).length;
    const after = afterPool(q, pc("{2}"));
    if (after) return (after.U || 0) + landU;
    const rest = 2 - Object.values(q).reduce((a, b) => a + b, 0);
    const plain = lands.filter(u => u.length && !u.includes("U")).length;
    return landU - Math.max(0, rest - plain);
  }
  /* Could the loop still make the blue a finisher needs? */
  const blueHope = (g, p, needU) => !(needU > 0) || blueGain(g, p) > 0 || blueAfterScepter(g, p) >= needU;
  function loopsFor(g, p, cost, out) {
    if (g.canPay(p, cost)) return 0;
    const gain = out - 2;
    if (gain <= 0) return -1;
    const gainU = blueGain(g, p);
    const haveU = blueAfterScepter(g, p);
    const needU = cost.U || 0;
    if (gainU <= 0 && haveU < needU) return -1;
    const short = costMV(cost) - manaNow(g, p);
    const n = Math.ceil(Math.max(0, short) / gain) + (gainU > 0 ? Math.ceil(Math.max(0, needU - haveU) / gainU) : 0) + 2;
    return n > 400 ? -1 : n;
  }
  /* Life that lets Aetherflux Reservoir shoot every opponent out (50 per shot) and leaves 1. */
  function fluxLife(g, p) {
    return g.opponents(p).filter(q => !g.playerHexproof(q)).reduce((n, q) => n + 50 * Math.ceil(Math.max(1, q.life) / 50), 0) + 1;
  }
  /* Spells to cast for that life: the k-th spell this turn gains k life. 0 if there is enough already. */
  function fluxLoops(g, p) {
    const need = fluxLife(g, p) - p.life;
    if (need <= 0 || fluxLife(g, p) <= 1) return 0;
    let k = 0, got = 0;
    while (got < need && k < 400) { k++; got += p.spellsCast + k; }
    return got >= need ? k : 0;
  }
  /* Shoot with Aetherflux Reservoir: an opponent it kills (keeping some life), or anyone once life is high. */
  const SCRIPTED = new WeakMap();
  function shootPlan(g, p, acts) {
    const res = fluxOf(g, p);
    if (!res || p.life < 51) return null;
    const a = acts.find(x => x.type === "activate" && x.card === res);
    if (!a) return null;
    const opps = g.opponents(p).filter(q => !g.playerHexproof(q));
    if (!opps.length) return null;
    const last = g.opponents(p).length === 1;
    const kill = opps.filter(q => q.life <= 50).sort((x, y) => oppValue(g, y) - oppValue(g, x))[0];
    let t = null;
    if (kill && (p.life - 50 >= (last ? 1 : 8) || p.life >= fluxLife(g, p))) t = kill;
    else if (p.life >= 60) t = opps.slice().sort((x, y) => x.life - y.life)[0];
    if (!t) return null;
    p.script = [t];
    SCRIPTED.set(p, p.script);
    return { type: "activate", card: res, idx: a.idx, maxTries: 30 };
  }
  function comboPlan(g, p, acts, win, mineNext) {
    const s = comboState(g, p);
    const sc = s.revScepter;
    if (!sc || sc.tapped) return null;
    if (!acts.some(a => a.type === "activate" && a.card === sc && a.idx === 0)) return null;
    const m = memo(g, p);
    if (m.loops >= 8) return null;
    const ourMain = (win === "main1" || win === "main2") && g.active === p;
    const net = s.out - 2;
    const talrand = ctrl(g, p, "Talrand, Sky Summoner").length > 0;
    const archmage = ctrl(g, p, "Archmage Emeritus").length > 0;
    const xds = xDrawCards(p).filter(c => ourMain || typeOf(c, "Instant"));
    /* With Archmage Emeritus every copy draws a card: keep `keep` cards in the library (the
       Archmage line itself draws down to the Oracle). */
    /* needU: blue the finisher needs; the loop stops once it can no longer make it */
    const loop = (key, stop, n, once, keep, needU) => {
      if (!(n > 0) || (m.done[key] || 0) >= (once ? 1 : 2)) return null;
      if (!blueHope(g, p, needU)) return null;
      const floor = archmage ? (keep == null ? 3 : keep) : -1;
      const stop2 = g2 => (floor >= 0 && p.library.length <= floor) || (stop ? stop(g2) : false) || !blueHope(g2, p, needU);
      if (stop2(g)) return null;
      m.loops++;
      m.done[key] = (m.done[key] || 0) + 1;
      if (g.poolTotal(p) < 2) floatRocks(g, p);
      return { type: "activate", card: sc, idx: 0, repeat: Math.min(n, 400), stop: stop2, maxTries: 12 };
    };
    /* loops that win: gain life with Aetherflux Reservoir, draw out for Thassa's Oracle, or deck an opponent */
    if (fluxOf(g, p) && (ourMain || win === "end")) {
      const k = fluxLoops(g, p);
      const affordable = net >= 0 ? 400 : Math.floor(Math.max(0, manaNow(g, p) - 2) / -net);
      if (k > 0 && k <= affordable) { const r = loop("flux", g2 => !fluxOf(g2, p) || p.life >= fluxLife(g2, p), k + 3); if (r) return r; }
    }
    const oracle = oracleReachable(p);
    if (net >= 1 && ourMain && oracle && xds.length) {
      const xd = xds[0];
      const need = g2 => MK.util.addCost(g2.spellCost(p, xd, { x: selfDrawX(g2, p) }), g2.spellCost(p, oracleReachable(p) || oracle, {}));
      const ready = g2 => canDrawThenOracle(g2, p, g2.spellCost(p, xd, { x: selfDrawX(g2, p) }), g2.spellCost(p, oracleReachable(p) || oracle, {}));
      const n = loopsFor(g, p, need(g), s.out);
      const needU = (xd.def.costObj.U || 0) + 2;
      if (n > 0) { const r = loop("oracle", g2 => !oracleReachable(p) || (archmage && p.library.length <= 2) || ready(g2), n + 25, false, undefined, needU); if (r) return r; }
    }
    if (net >= 0 && ourMain && archmage && oracle) {
      /* each copy draws a card: go until the Oracle is in hand and can win (never draw from an empty library) */
      const oracleOut = g2 => {
        const o = byName(p.hand, "Thassa's Oracle"), L = p.library.length;
        if (!o && !byName(p.library, "Thassa's Oracle")) return true;
        if (o && L <= g2.devotion(p, "U") + 2 && g2.canPay(p, pc("{U}{U}"))) return true;
        return L <= (o ? 1 : 0);
      };
      const r = loop("archmage", oracleOut, p.library.length + 2, false, 0, 2);
      if (r) return r;
    }
    if (archmage && p.library.length < 3) return null;
    const punished = castPunished(g, p);
    if (punished) return null;
    if (net >= 1 && xds.length && g.opponents(p).length) {
      const xd = xds[0];
      const need = g2 => { const qs = g2.opponents(p); const x = qs.length ? Math.min(...qs.map(q => q.library.length)) + 1 : 0; return g2.spellCost(p, xd, { x }); };
      const n = loopsFor(g, p, need(g), s.out);
      if (n > 0) { const r = loop("deck", g2 => (archmage && p.library.length <= 4) || !g2.opponents(p).length || g2.canPay(p, need(g2)), n, false, undefined, need(g).U || 0); if (r) return r; }
    }
    /* value loops: mana to dig for a finisher, Drakes to attack and block with */
    if (net >= 1 && ourMain && blueHope(g, p, 2) && p.hand.some(c => DIG.includes(c.def.name))) {
      const r = loop("dig", g2 => g2.poolTotal(p) >= 24 || (archmage && p.library.length <= 8), Math.min(40, Math.ceil(24 / net) + 1), true, undefined, 1);
      if (r) return r;
    }
    /* Aetherflux Reservoir in hand: make the mana to cast it */
    const fluxCard = byName(p.hand, FLUX);
    if (fluxCard && net >= 1 && ourMain && !fluxOf(g, p)) {
      const n = loopsFor(g, p, plusScepter(g, p, fluxCard), s.out);
      if (n > 0) { const r = loop("fluxcast", g2 => g2.canPay(p, plusScepter(g2, p, fluxCard)), n, true); if (r) return r; }
    }
    /* no Talrand yet: make the mana to cast him */
    if (!talrand && net >= 1 && ourMain) {
      const tal = [...p.command, ...p.hand].find(c => c.def.name === "Talrand, Sky Summoner");
      if (tal) {
        const n = loopsFor(g, p, plusScepter(g, p, tal), s.out);
        if (n > 0) { const r = loop("talrand", g2 => g2.canPay(p, plusScepter(g2, p, tal)), n, true, undefined, 2); if (r) return r; }
      }
    }
    const makers = makersOut(g, p);
    if (!makers) return null;
    const army = drakeCount(g, p), open = openDrakes(g, p);
    let want = 0;
    if ((win === "end" && mineNext) || (win === "main2" && g.active === p && net >= 0)) want = Math.max(drakesWanted(g, p) - army, blockNeed(g, p) - open);
    else if (win === "end" || (win === "main2" && g.active === p)) want = blockNeed(g, p) - open;
    let n = Math.ceil(want / makers);
    if (net < 0) n = Math.min(n, Math.floor((manaNow(g, p) - (win === "end" && mineNext ? 0 : 2)) / -net));
    if (n < 1 || want < 2) return null;
    return loop("drakes:" + win, archmage ? (() => p.library.length <= 8) : null, n, true);
  }
  /* Our Scepter loop is about to be destroyed: use it first. */
  function salvagePlan(g, p, acts) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return null;
    const s = comboState(g, p);
    const sc = s.revScepter;
    if (!sc || sc.tapped || s.out < 2 || !top.targets.includes(sc)) return null;
    if (!acts.some(a => a.type === "activate" && a.card === sc && a.idx === 0)) return null;
    const m = memo(g, p);
    if (m.done.salvage) return null;
    m.done.salvage = 1;
    const archmage = ctrl(g, p, "Archmage Emeritus").length > 0;
    const low = () => archmage && p.library.length <= 3;
    if (low()) return null;
    if (fluxOf(g, p)) { const k = fluxLoops(g, p); if (k > 0) return { type: "activate", card: sc, idx: 0, repeat: k + 3, stop: g2 => low() || p.life >= fluxLife(g2, p), maxTries: 2 }; }
    const makers = makersOut(g, p);
    if (!makers) return null;
    const want = Math.max(drakesWanted(g, p) - drakeCount(g, p), blockNeed(g, p) - openDrakes(g, p));
    const n = Math.ceil(Math.max(0, want) / makers);
    return n >= 1 ? { type: "activate", card: sc, idx: 0, repeat: n, stop: low, maxTries: 2 } : null;
  }
  /* Lots of floating mana after a loop: dig for a finisher. */
  const DIG = ["Mystical Tutor", "Merchant Scroll", "Brainstorm", "Ponder", "Preordain", "Impulse", "Sleight of Hand", "Opt", "Consider", "Frantic Search", "Deep Analysis", "Treasure Cruise"];
  function burnPlan(g, p, acts) {
    if (g.poolTotal(p) < 6 || p.library.length < 8) return null;
    for (const n of DIG) {
      const a = acts.find(x => x.type === "cast" && x.card.def.name === n);
      if (a) return { type: "cast", card: a.card, alt: a.alt, maxTries: 1 };
    }
    const mc = byName(p.hand, "Mystic Confluence");
    if (mc && castAct(acts, mc)) return { type: "cast", card: mc, mode: 0, maxTries: 1 };
    return null;
  }
  /* End of the turn before ours: overload Cyclonic Rift, draw with the big instants. */
  function riftPlan(g, p, acts) {
    const a = acts.find(x => x.type === "cast" && x.card.def.name === "Cyclonic Rift" && x.alt === 1);
    if (!a) return null;
    const theirs = g.battlefield.filter(o => o.controller !== p && !g.isLand(o));
    const val = theirs.reduce((s, o) => s + (MK.AI && MK.AI.value ? MK.AI.value(g, o) : 3), 0);
    const mineVal = g.battlefield.filter(o => o.controller === p && !g.isLand(o)).length;
    if (val < 28 && !(theirs.length >= 6 && val >= 18)) return null;
    if (val < mineVal * 2) return null;
    return { type: "cast", card: a.card, alt: 1, targets: [null], maxTries: 1 };
  }
  function endValue(g, p, acts) {
    const spare = manaNow(g, p);
    const gush = byName(p.hand, "Gush");
    if (gush) {
      const lands = g.controlled(p, o => g.isLand(o)).length, landsInHand = p.hand.filter(isLandCard).length;
      const free = acts.find(a => a.type === "cast" && a.card === gush && a.alt === 1);
      if (free && lands >= 5 && landsInHand <= 1) return { type: "cast", card: gush, alt: 1, maxTries: 1 };
      if (castAct(acts, gush) && spare >= 5) return { type: "cast", card: gush, maxTries: 1 };
    }
    const mc = byName(p.hand, "Mystic Confluence");
    if (mc && spare >= 5 && p.hand.length <= 6 && castAct(acts, mc)) return { type: "cast", card: mc, mode: 0, maxTries: 1 };
    const cc = byName(p.hand, "Cryptic Command");
    if (cc && spare >= 4 && castAct(acts, cc)) {
      const t = g.battlefield.filter(o => o.controller !== p && !g.isLand(o) && g.canTarget(p, o) && MK.AI && MK.AI.threat && MK.AI.threat(g, o, p) >= 7).sort((a, b) => MK.AI.threat(g, b, p) - MK.AI.threat(g, a, p))[0];
      if (t) return { type: "cast", card: cc, mode: 3, targets: [t], maxTries: 1 };
    }
    const bsz = byName(p.hand, "Blue Sun's Zenith");
    if (bsz && castAct(acts, bsz) && p.library.length >= 25 && p.hand.length <= 5) {
      const x = Math.min(castAct(acts, bsz).xMax, 7 - p.hand.length);
      if (x >= 3) return { type: "cast", card: bsz, x, targets: [p], maxTries: 1 };
    }
    return null;
  }
  /* Being attacked hard: Aetherize, or overload Cyclonic Rift. */
  function incomingDamage(g, p) {
    const c = g.combat;
    if (!c || c.attacker === p) return 0;
    let dmg = 0;
    for (const a of c.attackers) {
      if (a.zone !== "battlefield" || !a.combat || g.defenderOf(a.combat.attacking) !== p) continue;
      const pw = Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1);
      const bl = a.combat.blockedBy.filter(b => b.zone === "battlefield");
      if (!a.combat.wasBlocked) dmg += pw;
      else if (g.kw(a, "trample")) dmg += Math.max(0, pw - bl.reduce((n, b) => n + g.lethalDamageLeft(b), 0));
    }
    return dmg;
  }
  function combatPlan(g, p, acts) {
    const dmg = incomingDamage(g, p);
    if (!dmg || (dmg < p.life && dmg < Math.max(12, p.life * 0.5))) return null;
    for (const n of ["Aetherize", "Aetherspouts", "Evacuation"]) {
      const ae = acts.find(a => a.type === "cast" && a.card.def.name === n);
      if (ae) return { type: "cast", card: ae.card, maxTries: 1 };
    }
    const rift = acts.find(a => a.type === "cast" && a.card.def.name === "Cyclonic Rift" && a.alt === 1);
    if (rift) return { type: "cast", card: rift.card, alt: 1, targets: [null], maxTries: 1 };
    return null;
  }
  /* An opponent casts a spell before combat with a big army: Cryptic Command taps their creatures. */
  function armyPower(g, q) { return g.creatures(q).filter(c => !c.tapped && !g.kw(c, "defender")).reduce((n, c) => n + Math.max(0, g.power(c)), 0); }
  function tapAllPlan(g, p, acts) {
    const q = g.active;
    if (!q || q === p || g.phase !== "main1") return null;
    const pow = armyPower(g, q);
    if (pow < Math.max(10, p.life * 0.4)) return null;
    const cc = acts.find(a => a.type === "cast" && a.card.def.name === "Cryptic Command" && !a.alt);
    if (!cc) return null;
    const top = g.stack[g.stack.length - 1];
    if (top && top.p !== p && g.targetOptions(p, counterSpecOf(cc.card.def).spec, cc.card).includes(top)) return { type: "cast", card: cc.card, mode: 4, targets: [top], maxTries: 1 };
    return { type: "cast", card: cc.card, mode: 2, maxTries: 1 };
  }
  /* With a Scepter loop running, cast Aetherflux Reservoir and Talrand as soon as the mana is there. */
  function castTalrand(g, p, acts) {
    const s = comboState(g, p);
    if (!s.ready) return null;
    const ok = x => x.type === "cast" && !x.alt && (s.revScepter.tapped || g.canPay(p, plusScepter(g, p, x.card)));
    const a = acts.find(x => ok(x) && x.card.def.name === FLUX) || acts.find(x => ok(x) && x.card.def.name === "Talrand, Sky Summoner");
    return a ? { type: "cast", card: a.card, maxTries: 2 } : null;
  }
  /* A card's cost plus {2} for the next Scepter activation. */
  const plusScepter = (g, p, card) => MK.util.addCost(g.spellCost(p, card, {}), pc("{2}"));
  /* Talrand's plan: the bot's whole game. */
  function brain(g, p, o, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    if (SCRIPTED.get(p) && p.script === SCRIPTED.get(p)) p.script = null;
    SCRIPTED.delete(p);
    const shot = shootPlan(g, p, acts);
    if (shot) return shot;
    if (win === "stack") return stackBrain(g, p, acts) || salvagePlan(g, p, acts) || tapAllPlan(g, p, acts);
    if (win === "combat") return combatPlan(g, p, acts);
    if (win === "end") {
      const mineNext = g.nextPlayer(g.active) === p;
      return killNow(g, p, acts, win) || comboPlan(g, p, acts, win, mineNext) || whirPlan(g, p, acts, win, mineNext) || (mineNext ? burnPlan(g, p, acts) || riftPlan(g, p, acts) || endValue(g, p, acts) : null);
    }
    if (win === "main1" || win === "main2") return killNow(g, p, acts, win) || castTalrand(g, p, acts) || comboPlan(g, p, acts, win, false) || whirPlan(g, p, acts, win, false) || burnPlan(g, p, acts);
    return null;
  }

  /* ---------- card helpers */
  const specSpell = (prompt, f) => ({ kind: "spell", purpose: "counter", prompt, filter: (g, item, p) => item.p !== p && (!f || f(item)) });
  const nonCreature = it => !it.o.def.types.includes("Creature");
  const instOrSorc = it => it.o.def.types.includes("Instant") || it.o.def.types.includes("Sorcery");
  const hasSpellToCounter = (g, p) => g.stack.some(it => it.kind === "spell" && it.p !== p);
  function counterTarget(g, ctx, after) {
    const it = ctx.targets[0];
    if (!ctx.legal[0] || !it || !g.stack.includes(it)) return false;
    const ok = g.counterSpell(it, ctx.o);
    if (ok && after) after(it);
    return ok;
  }
  async function counterUnless(g, ctx, n) {
    const it = ctx.targets[0];
    if (!ctx.legal[0] || !it || !g.stack.includes(it)) return false;
    const q = it.p, cost = pc(`{${n}}`);
    if (!q.lost && g.canPay(q, cost)) {
      const ok = await g.ask(q, { type: "confirm", prompt: `${ctx.o.def.name}: pay {${n}} so ${it.name} isn't countered?`, purpose: "payOrCounter", src: ctx.o, item: it, amount: n });
      if (ok && g.pay(q, cost)) { log(g, `${q.name} pays {${n}}, so ${it.name} isn't countered.`, q, [ctx.o.def.name]); return false; }
    }
    return g.counterSpell(it, ctx.o);
  }
  const toZoneIfCountered = (g, zone) => it => { if (!it.isCopy && it.o.zone === "graveyard") { g.moveTo(it.o, zone); log(g, `${it.o.def.name} goes ${zone === "library" ? "on top of its owner's library" : zone === "hand" ? "back to its owner's hand" : "to exile"}.`, it.p, [it.o.def.name]); } };
  function untapLands(g, p, n) {
    const tapped = g.controlled(p, o => g.isLand(o) && o.tapped).sort((a, b) => (b.def.mana || []).some(m => String(m.produce).includes("U")) - (a.def.mana || []).some(m => String(m.produce).includes("U")));
    const list = tapped.slice(0, n);
    for (const o of list) g.untap(o);
    if (list.length) log(g, `${p.name} untaps ${list.length} land${list.length > 1 ? "s" : ""}.`, p);
  }
  /* "Whenever an opponent casts a spell, you may draw unless that player pays": bots pay when they have mana to spare. */
  function taxPays(g, q, n) {
    const m = manaNow(g, q);
    if (m < n) return false;
    return m - n >= 2 || g.random() < (n <= 1 ? 0.5 : 0.2);
  }
  const bestSpellIn = (g, p, cards) => {
    const list = cards.filter(c => c.def);
    if (!list.length) return null;
    const s = comboState(g, p);
    if (!s.reversal && s.scepter) { const r = byName(list, "Dramatic Reversal"); if (r) return r; }
    return bestFirst(g, p, list)[0];
  };
  const forceTarget = (g, p, req) => (req.purpose === "altExile" ? worstFirst(g, p, req.options)[0] : topOpposing(g, p, req));
  function imprintPick(g, p, cards) {
    const order = ["Dramatic Reversal", "Counterspell", "Arcane Denial", "Negate", "Brainstorm", "Impulse", "Opt", "Snap"];
    for (const n of order) { const c = byName(cards, n); if (c) return c; }
    return null;
  }
  /* A copy of a card, cast without paying its mana cost (Isochron Scepter). */
  async function castCopy(g, p, card, src) {
    const d = card.def;
    if (g.over || d.types.includes("Land")) return false;
    const o = g.newObj(d, p, "new");
    const item = { kind: "spell", o, p, x: 0, door: 0, alt: 0, targets: [], mode: null, id: ++g.ts, name: d.name + " (copy)", free: true, isCopy: true };
    if (d.modes) {
      const avail = d.modes.map((m, i) => ({ id: i, label: m.label, ok: !m.canChoose || m.canChoose(g, p, o) })).filter(m => m.ok);
      if (!avail.length) return false;
      item.mode = await g.ask(p, { type: "option", prompt: `Choose a mode for ${d.name}`, options: avail, purpose: "mode", src: o });
    }
    for (const spec of g.spellTargets(o, item)) {
      const t = await g.chooseTarget(p, spec, o);
      if (!t && !spec.optional) { log(g, `${d.name} has no target, so the copy isn't cast.`, p, [d.name]); return false; }
      item.targets.push(t);
    }
    return g.putOnStack(p, o, item);
  }
  const endBeforeMine = (g, p, ctx) => ctx.window === "end" && g.nextPlayer(g.active) === p;

  /* ================================================================ commander */
  D({
    name: "Talrand, Sky Summoner", cost: "{2}{U}{U}", type: "Legendary Creature — Merfolk Wizard", pt: "2/2",
    text: "Whenever you cast an instant or sorcery spell, create a 2/2 blue Drake creature token with flying.",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && isIS(ev.o), do: (g, s, ev, { p }) => g.createToken(p, T.talrandDrake) }],
    ai: { priority: 9, plan: brain }
  });

  /* ================================================================ creatures */
  D({
    name: "Thassa's Oracle", cost: "{U}{U}", type: "Creature — Merfolk Wizard", pt: "1/3",
    text: "When Thassa's Oracle enters, look at the top X cards of your library, where X is your devotion to blue. Put up to one of them on top of your library and the rest on the bottom of your library in any order. If X is greater than or equal to the number of cards in your library, you win the game.",
    note: "The cards that go to the bottom keep their order.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const x = g.devotion(p, "U");
        const top = p.library.slice(0, x);
        if (top.length > 1) {
          const keep = await pickOne(g, p, top, "Thassa's Oracle: choose up to one card to keep on top of your library. The rest go to the bottom.", s, cards => bestFirst(g, p, cards)[0], true);
          for (const c of top) if (c !== keep) moveInLibrary(p, c, false);
          g.bump();
        }
        log(g, `Thassa's Oracle: devotion to blue ${x}, ${p.library.length} card${p.library.length === 1 ? "" : "s"} in the library.`, p, [s.def.name]);
        if (x >= p.library.length) g.win(p, "Thassa's Oracle");
      }
    }],
    ai: { cast: (g, p) => (p.library.length <= g.devotion(p, "U") + 2 ? 60 : false) }
  });

  D({
    name: "Murmuring Mystic", cost: "{3}{U}", type: "Creature — Human Wizard", pt: "1/5",
    text: "Whenever you cast an instant or sorcery spell, create a 1/1 blue Bird Illusion creature token with flying.",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && isIS(ev.o), do: (g, s, ev, { p }) => g.createToken(p, T.talrandBirdIllusion) }],
    ai: { priority: 7 }
  });

  D({
    name: "Archmage Emeritus", cost: "{2}{U}{U}", type: "Creature — Human Wizard", pt: "2/2",
    text: "Magecraft — Whenever you cast or copy an instant or sorcery spell, draw a card.",
    note: "Spells copied by other effects (not cast) don't trigger it.",
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && isIS(ev.o), do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 7 }
  });

  D({
    name: "Baral, Chief of Compliance", cost: "{1}{U}", type: "Legendary Creature — Human Wizard", pt: "1/3",
    text: "Instant and sorcery spells you cast cost {1} less to cast.\nWhenever a spell or ability you control counters a spell, you may draw a card. If you do, discard a card.",
    statics: [{ costMod: (g, s, card) => (isIS(card) ? 1 : 0) }],
    triggers: [{
      on: "countered", when: (g, s, ev) => !!ev.by && ev.by.controller === s.controller,
      do: async (g, s, ev, { p }) => { if (!p.library.length) return; g.draw(p, 1); await discardN(g, p, 1, s); }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Spellseeker", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "1/1",
    text: "When Spellseeker enters, you may search your library for an instant or sorcery card with mana value 2 or less, reveal it, put it into your hand, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => tutor(g, p, s, c => isIS(c) && c.def.mv <= 2, "hand", "an instant or sorcery card with mana value 2 or less") }],
    ai: { priority: 7, tutor: true }
  });

  D({
    name: "Tribute Mage", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "2/2",
    text: "When Tribute Mage enters, you may search your library for an artifact card with mana value 2, reveal it, put it into your hand, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => tutor(g, p, s, c => typeOf(c, "Artifact") && c.def.mv === 2, "hand", "an artifact card with mana value 2") }],
    ai: { priority: 6, tutor: true }
  });

  D({
    name: "Trinket Mage", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "2/2",
    text: "When Trinket Mage enters, you may search your library for an artifact card with mana value 1 or less, reveal it, put it into your hand, then shuffle.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => tutor(g, p, s, c => typeOf(c, "Artifact") && c.def.mv <= 1, "hand", "an artifact card with mana value 1 or less") }],
    ai: { priority: 6, tutor: true }
  });

  D({
    name: "Archaeomancer", cost: "{2}{U}{U}", type: "Creature — Human Wizard", pt: "1/2",
    text: "When Archaeomancer enters, return target instant or sorcery card from your graveyard to your hand.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", from: (g2, pl) => pl.graveyard.filter(isIS), purpose: "reanimate", prompt: "Archaeomancer: return an instant or sorcery card from your graveyard to your hand" }), s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "hand"); log(g, `${p.name} returns ${t.def.name} to hand.`, p, [t.def.name]); }
      }
    }],
    ai: { priority: 5, target: (g, p, req) => bestSpellIn(g, p, req.options), cast: (g, p) => (p.graveyard.some(c => isIS(c) && cardWorth(g, p, c) >= 6) ? undefined : false) }
  });

  /* ================================================================ artifacts */
  D({
    name: "Isochron Scepter", cost: "{2}", type: "Artifact",
    text: "Imprint — When Isochron Scepter enters, you may exile an instant card with mana value 2 or less from your hand.\n{2}, {T}: You may copy the exiled card. If you do, you may cast the copy without paying its mana cost.",
    note: "Activating it always casts the copy. With Dramatic Reversal imprinted, the {2} is paid with your rocks before your lands.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = p.hand.filter(c => typeOf(c, "Instant") && c.def.mv <= 2);
        if (!opts.length) return;
        const pick = await pickOne(g, p, opts, "Isochron Scepter: exile an instant with mana value 2 or less from your hand (imprint), or pick none", s, cards => imprintPick(g, p, cards), true);
        if (!pick || pick.zone !== "hand") return;
        g.moveTo(pick, "exile");
        s.state.imprint = pick;
        g.bump();
        log(g, `${p.name} imprints ${pick.def.name} on Isochron Scepter.`, p, [s.def.name, pick.def.name]);
      }
    }],
    abilities: [{
      label: "{2}, {T}: Cast a copy of the imprinted card", tap: true,
      condition: (g, o, p) => !!imprintOf(o) && g.canPay(p, pc("{2}")),
      do: async (g, s, ctx) => {
        const card = imprintOf(s), p = ctx.p;
        if (!card) return;
        const cost = pc("{2}");
        const lands = g.controlled(p, x => g.isLand(x)).map(x => x.id);
        const rocksFirst = card.def.name === "Dramatic Reversal" && g.canPay(p, cost, { exclude: lands });
        if (!(rocksFirst ? g.pay(p, cost, { exclude: lands }) : g.pay(p, cost))) { log(g, `${p.name} can't pay {2} for Isochron Scepter.`, p); return; }
        await castCopy(g, p, card, s);
      },
      ai: {
        use: (g, p, o, ctx) => {
          const im = imprintOf(o);
          if (!im || im.def.name === "Dramatic Reversal" || counterSpecOf(im.def)) return false;
          return endBeforeMine(g, p, ctx) && manaNow(g, p) >= 2;
        }
      }
    }],
    ai: {
      priority: 8,
      cast: (g, p) => {
        if (byName(p.hand, "Dramatic Reversal")) return 30;
        const reachable = p.library.some(c => c.def.name === "Dramatic Reversal");
        if (reachable && p.turnsTaken < 14) return false;
        if (!reachable && p.graveyard.some(c => c.def.name === "Dramatic Reversal") && (ctrl(g, p, "Archaeomancer").length || p.hand.some(c => c.def.name === "Archaeomancer"))) return false;
        return imprintPick(g, p, p.hand.filter(c => typeOf(c, "Instant") && c.def.mv <= 2)) ? 12 : false;
      }
    }
  });

  D({
    name: "Mana Vault", cost: "{1}", type: "Artifact",
    text: "Mana Vault doesn't untap during your untap step.\nAt the beginning of your upkeep, you may pay {4}. If you do, untap Mana Vault.\nAt the beginning of your draw step, if Mana Vault is tapped, it deals 1 damage to you.\n{T}: Add {C}{C}{C}.",
    note: "Mana is paid from it only after your lands and other rocks.",
    doesntUntap: () => true,
    mana: [{ tap: true, produce: "CCC", last: true }],
    triggers: [
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller && s.tapped,
        do: async (g, s, ev, { p }) => {
          const c = pc("{4}");
          if (!g.canPay(p, c)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: "Mana Vault: pay {4} to untap it?", purpose: "vaultUntap", src: s });
          if (ok && g.pay(p, c)) { g.untap(s); log(g, `${p.name} pays {4} to untap Mana Vault.`, p, [s.def.name]); }
        }
      },
      { on: "drawStep", when: (g, s, ev) => ev.p === s.controller, intervening: (g, s) => s.tapped, do: (g, s, ev, { p }) => g.damage(s, p, 1) }
    ],
    ai: { ramp: true, priority: 9, confirm: () => false }
  });

  const monolith = (name, n, cost) => D({
    name, cost, type: "Artifact",
    text: `${name} doesn't untap during your untap step.\n{T}: Add {C}{C}{C}.\n{${n}}: Untap ${name}.`,
    note: "Mana is paid from it only after your lands and other rocks.",
    doesntUntap: () => true,
    mana: [{ tap: true, produce: "CCC", last: true }],
    abilities: [{ label: `{${n}}: Untap ${name}`, cost: `{${n}}`, untapSelf: true, ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) && manaNow(g, p) >= n }, do: (g, s) => { g.untap(s); } }],
    ai: { ramp: true, priority: 8 }
  });
  monolith("Grim Monolith", 4, "{2}");
  monolith("Basalt Monolith", 3, "{3}");

  D({
    name: "Lotus Petal", cost: "{0}", type: "Artifact",
    text: "{T}, Sacrifice Lotus Petal: Add one mana of any color.",
    mana: [{ tap: true, sacSelf: true, produce: "any", last: true }],
    ai: { ramp: true, priority: 6 }
  });

  const chromeFodder = (g, p) => worstFirst(g, p, p.hand.filter(c => c.def.name !== "Chrome Mox" && !typeOf(c, "Artifact") && !isLandCard(c) && (c.def.colors || []).length)).find(c => cardWorth(g, p, c) <= 5.5) || null;
  D({
    name: "Chrome Mox", cost: "{0}", type: "Artifact",
    text: "Imprint — When Chrome Mox enters, you may exile a nonartifact, nonland card from your hand.\n{T}: Add one mana of any of the exiled card's colors.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = p.hand.filter(c => !typeOf(c, "Artifact") && !isLandCard(c));
        if (!opts.length) return;
        const pick = await pickOne(g, p, opts, "Chrome Mox: exile a nonartifact, nonland card from your hand (imprint), or pick none", s, () => chromeFodder(g, p), true);
        if (!pick || pick.zone !== "hand") return;
        g.moveTo(pick, "exile");
        s.state.moxColors = (pick.def.colors || []).slice();
        g.bump();
        log(g, `${p.name} imprints ${pick.def.name} on Chrome Mox.`, p, [s.def.name, pick.def.name]);
      }
    }],
    mana: [{ tap: true, produce: (g, o) => (o.state.moxColors && o.state.moxColors.length ? "choice:" + o.state.moxColors.join("") : null) }],
    ai: { ramp: true, priority: 7, cast: (g, p) => (chromeFodder(g, p) ? undefined : false) }
  });

  D({
    name: "Mox Diamond", cost: "{0}", type: "Artifact",
    text: "If Mox Diamond would enter, you may discard a land card instead. If you do, put Mox Diamond onto the battlefield. If you don't, put it into its owner's graveyard.\n{T}: Add one mana of any color.",
    note: "Mox Diamond enters first, then you choose the land to discard.",
    mana: [{ tap: true, produce: "any" }],
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const lands = p.hand.filter(isLandCard);
        const pick = lands.length ? await pickOne(g, p, lands, "Mox Diamond: discard a land card, or pick none and Mox Diamond goes to your graveyard", s, cards => worstFirst(g, p, cards)[0], true) : null;
        if (pick && pick.zone === "hand") { g.discard(p, pick); return; }
        if (s.zone === "battlefield") { g.moveTo(s, "graveyard"); log(g, "Mox Diamond goes to the graveyard.", p, [s.def.name]); }
      }
    }],
    ai: { ramp: true, priority: 7, cast: (g, p) => { const n = p.hand.filter(isLandCard).length; return n >= 2 || (n >= 1 && p.landsPlayed > 0) ? undefined : false; } }
  });

  D({
    name: "Mind Stone", cost: "{2}", type: "Artifact",
    text: "{T}: Add {C}.\n{1}, {T}, Sacrifice Mind Stone: Draw a card.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "{1}, {T}, Sacrifice: Draw a card", cost: "{1}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.draw(ctx.p, 1),
      ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) && g.controlled(p, x => g.isLand(x)).length >= 9 && !comboState(g, p).revScepter && p.library.length >= 5 }
    }],
    ai: { ramp: true }
  });

  D({
    name: "Hedron Archive", cost: "{4}", type: "Artifact",
    text: "{T}: Add {C}{C}.\n{2}, {T}, Sacrifice Hedron Archive: Draw two cards.",
    mana: [{ tap: true, produce: "CC" }],
    abilities: [{
      label: "{2}, {T}, Sacrifice: Draw two cards", cost: "{2}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.draw(ctx.p, 2),
      ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) && g.controlled(p, x => g.isLand(x)).length >= 9 && !comboState(g, p).revScepter && p.library.length >= 5 }
    }],
    ai: { ramp: true }
  });
  D({
    name: "Gilded Lotus", cost: "{5}", type: "Artifact",
    text: "{T}: Add three mana of any one color.",
    mana: [{ tap: true, produce: ["WWW", "UUU", "BBB", "RRR", "GGG"] }],
    ai: { ramp: true, priority: 7 }
  });
  D({
    name: "Thran Dynamo", cost: "{4}", type: "Artifact",
    text: "{T}: Add {C}{C}{C}.",
    mana: [{ tap: true, produce: "CCC" }],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Thought Vessel", cost: "{2}", type: "Artifact",
    text: "You have no maximum hand size.\n{T}: Add {C}.",
    statics: [{ noMaxHand: true }],
    mana: [{ tap: true, produce: "C" }],
    ai: { ramp: true }
  });

  D({
    name: "Sapphire Medallion", cost: "{2}", type: "Artifact",
    text: "Blue spells you cast cost {1} less to cast.",
    statics: [{ costMod: (g, s, card) => ((card.def.colors || []).includes("U") ? 1 : 0) }],
    ai: { ramp: true, priority: 6 }
  });

  /* ================================================================ enchantments */
  D({
    name: "Rhystic Study", cost: "{2}{U}", type: "Enchantment",
    text: "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.",
    note: "You always draw when they don't pay, unless your library is empty.",
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p !== s.controller,
      do: async (g, s, ev, { p }) => {
        const q = ev.p;
        if (q.lost || p.lost) return;
        const cost = pc("{1}");
        if (g.canPay(q, cost)) {
          const pay = await g.ask(q, { type: "confirm", prompt: `Rhystic Study: pay {1} so ${p.name} doesn't draw a card?`, purpose: "rhysticPay", src: s });
          if (pay && g.pay(q, cost)) { log(g, `${q.name} pays {1} for Rhystic Study.`, q, [s.def.name]); return; }
        }
        if (!p.library.length) return;
        g.draw(p, 1);
        log(g, `${p.name} draws a card (Rhystic Study).`, p, [s.def.name]);
      }
    }],
    ai: { priority: 9, confirm: (g, q, req) => (req.purpose === "rhysticPay" ? taxPays(g, q, 1) : true) }
  });

  D({
    name: "Mystic Remora", cost: "{U}", type: "Enchantment",
    text: "Cumulative upkeep {1}\nWhenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.",
    note: "You always draw when they don't pay, unless your library is empty.",
    triggers: [
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          g.addCounters(s, "age", 1, s);
          const n = s.counters.age || 0, cost = pc(`{${n}}`);
          let keep = false;
          if (g.canPay(p, cost)) keep = await g.ask(p, { type: "confirm", prompt: `Mystic Remora: pay {${n}} cumulative upkeep? If you don't, sacrifice it.`, purpose: "remoraUpkeep", src: s, amount: n });
          if (keep && g.pay(p, cost)) return;
          g.sacrifice(s);
        }
      },
      {
        on: "cast", when: (g, s, ev) => ev.p !== s.controller && !typeOf(ev.o, "Creature"),
        do: async (g, s, ev, { p }) => {
          const q = ev.p;
          if (q.lost || p.lost) return;
          const cost = pc("{4}");
          if (g.canPay(q, cost)) {
            const pay = await g.ask(q, { type: "confirm", prompt: `Mystic Remora: pay {4} so ${p.name} doesn't draw a card?`, purpose: "remoraPay", src: s });
            if (pay && g.pay(q, cost)) { log(g, `${q.name} pays {4} for Mystic Remora.`, q, [s.def.name]); return; }
          }
          if (!p.library.length) return;
          g.draw(p, 1);
          log(g, `${p.name} draws a card (Mystic Remora).`, p, [s.def.name]);
        }
      }
    ],
    ai: {
      priority: 8,
      confirm: (g, q, req) => {
        if (req.purpose === "remoraPay") return taxPays(g, q, 4);
        if (req.purpose === "remoraUpkeep") { const n = req.amount || 1; return n <= 2 || (n <= 4 && g.controlled(q, o => g.isLand(o)).length >= n + 4); }
        return true;
      }
    }
  });

  /* ================================================================ counterspells */
  const hardCounter = { counter: true, target: topOpposing };
  const brainOnly = { never: true, target: topOpposing };
  // Talrand's brain casts these; any other deck holding one counters like with Counterspell
  const brainCounter = Object.assign({ brain: "talrand", otherwise: { counter: true } }, brainOnly);
  D({
    name: "Counterspell", cost: "{U}{U}", type: "Instant", text: "Counter target spell.",
    spell: { targets: [specSpell("Counter target spell")], do: (g, ctx) => counterTarget(g, ctx) },
    ai: hardCounter
  });
  D({
    name: "Force of Will", cost: "{3}{U}{U}", type: "Instant",
    text: "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target spell.",
    altCosts: [{ label: "Pay 1 life, exile a blue card", cost: "", payLife: 1, exileFromHand: { filter: (g, c) => isBlueCard(c), prompt: "Force of Will: exile a blue card from your hand" } }],
    spell: { targets: [specSpell("Counter target spell")], do: (g, ctx) => counterTarget(g, ctx) },
    ai: { never: true, target: forceTarget, brain: "talrand", otherwise: { counter: true } }
  });
  D({
    name: "Force of Negation", cost: "{1}{U}{U}", type: "Instant",
    text: "If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
    altCosts: [{ label: "Exile a blue card (not your turn)", cost: "", condition: (g, p) => g.active !== p, exileFromHand: { filter: (g, c) => isBlueCard(c), prompt: "Force of Negation: exile a blue card from your hand" } }],
    spell: { targets: [specSpell("Counter target noncreature spell", nonCreature)], do: (g, ctx) => counterTarget(g, ctx, toZoneIfCountered(g, "exile")) },
    ai: { never: true, target: forceTarget, brain: "talrand", otherwise: { counter: true } }
  });
  D({
    name: "Fierce Guardianship", cost: "{2}{U}", type: "Instant",
    text: "If you control a commander, you may cast this spell without paying its mana cost.\nCounter target noncreature spell.",
    altCosts: [{ label: "Free (you control a commander)", cost: "", condition: (g, p) => g.battlefield.some(o => o.controller === p && o.isCommander) }],
    spell: { targets: [specSpell("Counter target noncreature spell", nonCreature)], do: (g, ctx) => counterTarget(g, ctx) },
    ai: brainCounter
  });
  D({
    name: "Pact of Negation", cost: "{0}", type: "Instant",
    text: "Counter target spell.\nAt the beginning of your next upkeep, pay {3}{U}{U}. If you don't, you lose the game.",
    note: "At that upkeep the {3}{U}{U} is paid for you when you can pay it.",
    spell: {
      targets: [specSpell("Counter target spell")],
      do: (g, ctx) => {
        counterTarget(g, ctx);
        const p = ctx.p;
        g.delayed.push({
          at: "upkeep", once: true, player: p, controller: p, pact: true, src: { def: { name: "Pact of Negation" }, controller: p },
          do: async g2 => {
            const c = pc("{3}{U}{U}");
            if (g2.canPay(p, c) && g2.pay(p, c)) { log(g2, `${p.name} pays {3}{U}{U} for Pact of Negation.`, p, ["Pact of Negation"]); return; }
            log(g2, `${p.name} can't pay for Pact of Negation.`, p, ["Pact of Negation"], { loud: true });
            g2.lose(p, "pact");
          }
        });
      }
    },
    ai: brainOnly
  });
  D({
    name: "Mana Leak", cost: "{1}{U}", type: "Instant", text: "Counter target spell unless its controller pays {3}.",
    spell: { targets: [specSpell("Counter target spell")], do: (g, ctx) => counterUnless(g, ctx, 3) },
    ai: brainCounter
  });
  const creatureSpell = it => it.o.def.types.includes("Creature");
  D({
    name: "Essence Scatter", cost: "{1}{U}", type: "Instant", text: "Counter target creature spell.",
    spell: { targets: [specSpell("Counter target creature spell", creatureSpell)], do: (g, ctx) => counterTarget(g, ctx) },
    ai: hardCounter
  });
  D({
    name: "Exclude", cost: "{2}{U}", type: "Instant", text: "Counter target creature spell.\nDraw a card.",
    spell: { targets: [specSpell("Counter target creature spell", creatureSpell)], do: (g, ctx) => { if (!ctx.legal[0]) return; counterTarget(g, ctx); g.draw(ctx.p, 1); } },
    ai: hardCounter
  });
  D({
    name: "Negate", cost: "{1}{U}", type: "Instant", text: "Counter target noncreature spell.",
    spell: { targets: [specSpell("Counter target noncreature spell", nonCreature)], do: (g, ctx) => counterTarget(g, ctx) },
    ai: hardCounter
  });
  D({
    name: "Swan Song", cost: "{U}", type: "Instant",
    text: "Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with flying.",
    spell: {
      targets: [specSpell("Counter target enchantment, instant, or sorcery spell", it => instOrSorc(it) || it.o.def.types.includes("Enchantment"))],
      do: (g, ctx) => { const it = ctx.targets[0]; if (!ctx.legal[0] || !it) return; counterTarget(g, ctx); if (!it.p.lost) g.createToken(it.p, T.talrandSwanBird); }
    },
    ai: hardCounter
  });
  D({
    name: "Arcane Denial", cost: "{1}{U}", type: "Instant",
    text: "Counter target spell. Its controller may draw up to two cards at the beginning of the next turn's upkeep.\nYou draw a card at the beginning of the next turn's upkeep.",
    note: "The spell's controller always draws both cards.",
    spell: {
      targets: [specSpell("Counter target spell")],
      do: (g, ctx) => {
        const it = ctx.targets[0], p = ctx.p;
        if (!ctx.legal[0] || !it) return;
        counterTarget(g, ctx);
        const q = it.p;
        g.delayed.push({ at: "upkeep", once: true, controller: p, src: { def: { name: "Arcane Denial" }, controller: p }, do: g2 => { if (!q.lost) g2.draw(q, 2); if (!p.lost) g2.draw(p, 1); log(g2, `Arcane Denial: ${q.name} draws two cards and ${p.name} draws a card.`, p, ["Arcane Denial"]); } });
      }
    },
    ai: hardCounter
  });
  const crypticCan = (g, p) => hasSpellToCounter(g, p);
  function tapOpposing(g, p) {
    for (const o of g.battlefield) if (o.controller !== p && g.isCreature(o)) g.tap(o);
    log(g, `${p.name} taps all creatures their opponents control.`, p, ["Cryptic Command"]);
  }
  D({
    name: "Cryptic Command", cost: "{1}{U}{U}{U}", type: "Instant",
    text: "Choose two —\n• Counter target spell.\n• Return target permanent to its owner's hand.\n• Tap all creatures your opponents control.\n• Draw a card.",
    note: "Five of the six pairs of modes are offered (not bounce plus tap).",
    modes: [
      { label: "Counter target spell and draw a card", counterMode: true, canChoose: crypticCan, targets: [specSpell("Counter target spell")], do: (g, ctx) => { counterTarget(g, ctx); g.draw(ctx.p, 1); } },
      { label: "Counter target spell and return target permanent to its owner's hand", canChoose: crypticCan, targets: [specSpell("Counter target spell"), { kind: "permanent", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { counterTarget(g, ctx); if (ctx.legal[1] && ctx.targets[1]) g.bounce(ctx.targets[1]); } },
      { label: "Tap all creatures your opponents control and draw a card", do: (g, ctx) => { tapOpposing(g, ctx.p); g.draw(ctx.p, 1); } },
      { label: "Return target permanent to its owner's hand and draw a card", targets: [{ kind: "permanent", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); g.draw(ctx.p, 1); } },
      { label: "Counter target spell and tap all creatures your opponents control", canChoose: crypticCan, targets: [specSpell("Counter target spell")], do: (g, ctx) => { counterTarget(g, ctx); tapOpposing(g, ctx.p); } }
    ],
    ai: { counter: true, mode: (g, p) => (hasSpellToCounter(g, p) ? 0 : 3), target: (g, p, req) => topOpposing(g, p, req) }
  });
  D({
    name: "Mystic Confluence", cost: "{3}{U}{U}", type: "Instant",
    text: "Choose three. You may choose the same mode more than once.\n• Counter target spell unless its controller pays {3}.\n• Return target creature to its owner's hand.\n• Target player draws a card.",
    note: "The most useful sets of modes are offered, and the cards are drawn by you.",
    modes: [
      { label: "Draw three cards", do: (g, ctx) => g.draw(ctx.p, 3) },
      { label: "Counter target spell unless its controller pays {3}, then draw two cards", counterMode: true, canChoose: crypticCan, targets: [specSpell("Counter target spell")], do: async (g, ctx) => { await counterUnless(g, ctx, 3); g.draw(ctx.p, 2); } },
      { label: "Return target creature to its owner's hand, then draw two cards", targets: [{ kind: "creature", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); g.draw(ctx.p, 2); } },
      { label: "Counter target spell unless its controller pays {3} three times", canChoose: crypticCan, targets: [specSpell("Counter target spell")], do: (g, ctx) => counterUnless(g, ctx, 9) }
    ],
    ai: { never: true, mode: () => 0, target: (g, p, req) => topOpposing(g, p, req) }
  });

  /* ================================================================ bounce and removal */
  D({
    name: "Cyclonic Rift", cost: "{1}{U}", type: "Instant",
    text: "Return target nonland permanent you don't control to its owner's hand.\nOverload {6}{U} (You may cast this spell for its overload cost. If you do, change its text by replacing all instances of \"target\" with \"each.\")",
    note: "Overload is an alternative cost. When you overload, a target you picked is ignored.",
    altCosts: [{ label: "Overload", cost: "{6}{U}" }],
    spell: {
      targets: [{ kind: "nonland", opp: true, optional: true, purpose: "harm", prompt: "Return to its owner's hand (skip this when you overload)" }],
      do: (g, ctx) => {
        if (ctx.item.alt === 1) {
          const list = g.battlefield.filter(o => o.controller !== ctx.p && !g.isLand(o));
          for (const o of list) g.bounce(o);
          log(g, `Cyclonic Rift returns ${list.length} nonland permanent${list.length === 1 ? "" : "s"} to their owners' hands.`, ctx.p, ["Cyclonic Rift"], { kind: "big" });
          return;
        }
        if (ctx.targets[0] && ctx.legal[0]) g.bounce(ctx.targets[0]);
      }
    },
    ai: { removal: true, minThreat: 6 }
  });
  D({
    name: "Snap", cost: "{1}{U}", type: "Instant",
    text: "Return target creature to its owner's hand. Untap up to two lands.",
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); untapLands(g, ctx.p, 2); } },
    ai: { removal: true, minThreat: 4.5 }
  });
  D({
    name: "Repulse", cost: "{2}{U}", type: "Instant",
    text: "Return target creature to its owner's hand.\nDraw a card.",
    spell: { targets: [{ kind: "creature", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (!ctx.legal[0]) return; g.bounce(ctx.targets[0]); g.draw(ctx.p, 1); } },
    ai: { removal: true, minThreat: 4.5 }
  });
  const roil = name => D({
    name, cost: "{1}{U}", type: "Instant", kicker: "{1}{U}",
    text: "Kicker {1}{U} (You may pay an additional {1}{U} as you cast this spell.)\nReturn target nonland permanent to its owner's hand. If this spell was kicked, draw a card.",
    spell: { targets: [{ kind: "nonland", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); if (ctx.kicked) g.draw(ctx.p, 1); } },
    ai: { removal: true, minThreat: 5 }
  });
  roil("Into the Roil");
  D({
    name: "Chain of Vapor", cost: "{U}", type: "Instant",
    text: "Return target nonland permanent to its owner's hand. Then that permanent's controller may sacrifice a land of their choice. If the player does, they may copy this spell and may choose a new target for that copy.",
    note: "The sacrifice-a-land copy is not offered.",
    spell: { targets: [{ kind: "nonland", purpose: "harm", prompt: "Return to its owner's hand" }], do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); } },
    ai: { removal: true, minThreat: 5 }
  });
  D({
    name: "Aetherize", cost: "{3}{U}", type: "Instant",
    text: "Return all attacking creatures to their owner's hand.",
    spell: { do: (g, ctx) => { const list = g.combat ? g.combat.attackers.filter(a => a.zone === "battlefield") : []; for (const o of list) g.bounce(o); log(g, `Aetherize returns ${list.length} attacking creature${list.length === 1 ? "" : "s"}.`, ctx.p, ["Aetherize"], { kind: "big" }); } },
    ai: {
      cast: () => false,
      combat: (g, p) => {
        const c = g.combat;
        if (!c || c.attacker === p) return false;
        const atMe = c.attackers.filter(a => a.zone === "battlefield" && a.combat && g.defenderOf(a.combat.attacking) === p && !a.combat.wasBlocked);
        const dmg = atMe.reduce((s, a) => s + Math.max(0, g.power(a)) * (g.kw(a, "double strike") ? 2 : 1), 0);
        return dmg >= p.life || dmg >= 12 || (atMe.length >= 4 && dmg >= 8);
      }
    }
  });
  D({
    name: "Evacuation", cost: "{3}{U}{U}", type: "Instant", text: "Return all creatures to their owners' hands.",
    spell: { do: (g, ctx) => { const list = g.battlefield.filter(o => g.isCreature(o)); for (const o of list) g.bounce(o); log(g, `Evacuation returns ${list.length} creature${list.length === 1 ? "" : "s"} to their owners' hands.`, ctx.p, ["Evacuation"], { kind: "big" }); } },
    ai: { cast: () => false }
  });
  D({
    name: "Aetherspouts", cost: "{3}{U}{U}", type: "Instant",
    text: "For each attacking creature, its owner puts it on the top or bottom of their library.",
    note: "Each owner chooses for all of their attacking creatures at once.",
    spell: {
      do: async (g, ctx) => {
        const list = g.combat ? g.combat.attackers.filter(a => a.zone === "battlefield") : [];
        for (const q of [...new Set(list.map(a => a.owner))]) {
          const mine = list.filter(a => a.owner === q && a.zone === "battlefield");
          let bottom;
          if (isBot(q)) bottom = mine.filter(a => a.isToken || (MK.AI && MK.AI.value ? MK.AI.value(g, a) : 3) < 5);
          else bottom = (await g.ask(q, { type: "cards", prompt: "Aetherspouts: choose which of your attacking creatures go on the bottom of your library (the rest go on top)", options: mine, min: 0, max: mine.length, purpose: "aetherspouts", src: ctx.o })) || [];
          for (const a of mine) if (a.zone === "battlefield") g.moveTo(a, "library", { bottom: bottom.includes(a) });
        }
        log(g, `Aetherspouts puts ${list.length} attacking creature${list.length === 1 ? "" : "s"} into their owners' libraries.`, ctx.p, ["Aetherspouts"], { kind: "big" });
      }
    },
    ai: { cast: () => false }
  });

  /* ================================================================ card draw and tutors */
  D({
    name: "Brainstorm", cost: "{U}", type: "Instant",
    text: "Draw three cards, then put two cards from your hand on top of your library in any order.",
    note: "The first card you pick ends up on top.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        g.draw(p, 3);
        const n = Math.min(2, p.hand.length);
        if (!n) return;
        let pick;
        if (isBot(p)) pick = worstFirst(g, p, p.hand).slice(0, n).reverse();
        else pick = ((await g.ask(p, { type: "cards", prompt: "Brainstorm: put two cards from your hand on top of your library (the first one you pick ends up on top)", options: p.hand.slice(), min: n, max: n, purpose: "brainstorm", src: ctx.o })) || []).slice(0, n);
        while (pick.length < n) pick.push(p.hand.find(c => !pick.includes(c)));
        for (const c of pick.slice().reverse()) if (c && c.zone === "hand") g.moveTo(c, "library");
        log(g, `${p.name} puts ${n} card${n > 1 ? "s" : ""} back on top of the library.`, p);
      }
    },
    ai: { instantEnd: true, draw: true, priority: 6 }
  });
  D({
    name: "Ponder", cost: "{U}", type: "Sorcery",
    text: "Look at the top three cards of your library, then put them back in any order. You may shuffle.\nDraw a card.",
    note: "You choose the card to leave on top (the other two stay under it in their order), or shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 3);
        if (top.length) {
          let choice;
          if (isBot(p)) { const best = bestFirst(g, p, top)[0]; choice = cardWorth(g, p, best) >= 5.5 ? top.indexOf(best) : "shuffle"; }
          else choice = await g.ask(p, { type: "option", prompt: `Ponder: the top three cards are ${top.map(c => c.def.name).join(", ")}.`, options: top.map((c, i) => ({ id: i, label: `Keep ${c.def.name} on top` })).concat([{ id: "shuffle", label: "Shuffle your library" }]), purpose: "ponder", src: ctx.o });
          if (choice === "shuffle") { g.shuffle(p); log(g, `${p.name} shuffles.`, p); }
          else if (top[choice]) { moveInLibrary(p, top[choice], true); g.bump(); }
        }
        g.draw(p, 1);
      }
    },
    ai: { draw: true, priority: 6 }
  });
  D({
    name: "Preordain", cost: "{U}", type: "Sorcery",
    text: "Scry 2, then draw a card.",
    spell: { do: async (g, ctx) => { await scry(g, ctx.p, 2, ctx.o); g.draw(ctx.p, 1); } },
    ai: { draw: true, priority: 6 }
  });
  D({
    name: "Opt", cost: "{U}", type: "Instant",
    text: "Scry 1.\nDraw a card.",
    spell: { do: async (g, ctx) => { await scry(g, ctx.p, 1, ctx.o); g.draw(ctx.p, 1); } },
    ai: { instantEnd: true, draw: true, priority: 5 }
  });
  D({
    name: "Consider", cost: "{U}", type: "Instant",
    text: "Look at the top card of your library. You may put that card into your graveyard.\nDraw a card.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, top = p.library[0];
        if (top) {
          let mill;
          if (isBot(p)) mill = cardWorth(g, p, top) < scryBar(g, p);
          else mill = ((await g.ask(p, { type: "cards", prompt: `Consider: choose ${top.def.name} to put it into your graveyard, or nothing to keep it on top.`, options: [top], min: 0, max: 1, purpose: "surveil", src: ctx.o })) || []).includes(top);
          if (mill && top.zone === "library") { g.moveTo(top, "graveyard"); log(g, `${p.name} puts ${top.def.name} from the top of the library into the graveyard.`, p, [top.def.name], { kind: "scry" }); }
          else log(g, `${p.name} looks at the top card and keeps it there.`, p, [], { kind: "scry" });
        }
        g.draw(p, 1);
      }
    },
    ai: { instantEnd: true, draw: true, priority: 5 }
  });
  D({
    name: "Sleight of Hand", cost: "{U}", type: "Sorcery",
    text: "Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 2);
        if (!top.length) return;
        const pick = await pickOne(g, p, top, "Sleight of Hand: put one card into your hand; the other goes to the bottom of your library", ctx.o);
        for (const c of top) if (c !== pick) moveInLibrary(p, c, false);
        if (pick && pick.zone === "library") g.moveTo(pick, "hand");
        g.bump();
      }
    },
    ai: { draw: true, priority: 5 }
  });
  D({
    name: "Impulse", cost: "{1}{U}", type: "Instant",
    text: "Look at the top four cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 4);
        if (!top.length) return;
        const pick = await pickOne(g, p, top, "Impulse: put one card into your hand; the rest go to the bottom of your library", ctx.o);
        for (const c of top) if (c !== pick) moveInLibrary(p, c, false);
        if (pick && pick.zone === "library") g.moveTo(pick, "hand");
        g.bump();
      }
    },
    ai: { instantEnd: true, draw: true, priority: 5 }
  });
  D({
    name: "Frantic Search", cost: "{2}{U}", type: "Instant",
    text: "Draw two cards, then discard two cards. Untap up to three lands.",
    spell: { do: async (g, ctx) => { g.draw(ctx.p, 2); await discardN(g, ctx.p, 2, ctx.o); untapLands(g, ctx.p, 3); } },
    ai: { draw: true, priority: 6, cast: (g, p, o, { window }) => (window === "main1" && g.controlled(p, x => g.isLand(x)).length >= 3 ? 17 : false) }
  });
  D({
    name: "Deep Analysis", cost: "{3}{U}", type: "Sorcery",
    text: "Target player draws two cards.\nFlashback—{1}{U}, Pay 3 life. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashback: "{1}{U}",
    canCast: (g, p, o) => o.zone !== "graveyard" || p.life > 3,
    onCast: (g, p, o, item) => { if (item.exileAfter) g.payLife(p, 3); },
    spell: { targets: [{ kind: "player", purpose: "help", prompt: "Target player draws two cards" }], do: (g, ctx) => { if (ctx.legal[0]) g.draw(ctx.targets[0], 2); } },
    ai: { draw: true, priority: 5, target: (g, p, req) => (req.options.includes(p) ? p : undefined) }
  });
  D({
    name: "Treasure Cruise", cost: "{7}{U}", type: "Sorcery",
    text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nDraw three cards.",
    note: "Delve exiles cards from your graveyard for you, lands and permanents first.",
    keywords: ["delve"],
    costReduce: (g, p, o) => { const n = o.zone === "hand" ? Math.min(p.graveyard.length, 7) : 0; o._delve = n; return n; },
    onCast: (g, p, o) => {
      const n = Math.min(o._delve || 0, p.graveyard.length);
      const order = p.graveyard.slice().sort((a, b) => isIS(a) - isIS(b));
      for (const c of order.slice(0, n)) g.moveTo(c, "exile");
      if (n) log(g, `${p.name} exiles ${n} card${n > 1 ? "s" : ""} from the graveyard to delve.`, p);
    },
    spell: { do: (g, ctx) => g.draw(ctx.p, 3) },
    ai: { draw: true, priority: 5 }
  });
  D({
    name: "Dig Through Time", cost: "{6}{U}{U}", type: "Instant",
    text: "Delve (Each card you exile from your graveyard while casting this spell pays for {1}.)\nLook at the top seven cards of your library. Put two of them into your hand and the rest on the bottom of your library in any order.",
    note: "Delve exiles cards from your graveyard for you, lands and permanents first.",
    keywords: ["delve"],
    costReduce: (g, p, o) => { const n = o.zone === "hand" ? Math.min(p.graveyard.length, 6) : 0; o._delve = n; return n; },
    onCast: (g, p, o) => {
      const n = Math.min(o._delve || 0, p.graveyard.length);
      const order = p.graveyard.slice().sort((a, b) => isIS(a) - isIS(b));
      for (const c of order.slice(0, n)) g.moveTo(c, "exile");
      if (n) log(g, `${p.name} exiles ${n} card${n > 1 ? "s" : ""} from the graveyard to delve.`, p);
    },
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, top = p.library.slice(0, 7);
        if (!top.length) return;
        let keep;
        if (isBot(p)) keep = bestFirst(g, p, top).slice(0, 2);
        else keep = ((await g.ask(p, { type: "cards", prompt: "Dig Through Time: put two of these into your hand (the rest go on the bottom of your library)", options: top, min: Math.min(2, top.length), max: 2, purpose: "dig", src: ctx.o })) || []).slice(0, 2);
        for (const c of top) if (!keep.includes(c) && c.zone === "library") moveInLibrary(p, c, false);
        for (const c of keep) if (c.zone === "library") g.moveTo(c, "hand");
        log(g, `${p.name} puts two cards into their hand and ${top.length - keep.length} on the bottom of the library.`, p, ["Dig Through Time"]);
      }
    },
    ai: { instantEnd: true, draw: true, priority: 6 }
  });
  D({
    name: "Gush", cost: "{4}{U}", type: "Instant",
    text: "You may return two Islands you control to their owner's hand rather than pay this spell's mana cost.\nDraw two cards.",
    note: "With the alternative cost, the Islands go back to your hand as the spell is cast (tapped Islands first).",
    altCosts: [{ label: "Return two Islands", cost: "", condition: (g, p) => g.controlled(p, o => o.def.subtypes.includes("Island")).length >= 2 }],
    onCast: async (g, p, o, item) => {
      if (item.alt !== 1) return;
      const isl = g.controlled(p, x => x.def.subtypes.includes("Island"));
      let pick;
      if (isBot(p)) pick = isl.slice().sort((a, b) => (b.tapped ? 1 : 0) - (a.tapped ? 1 : 0) || (a.def.name === "Island" ? -1 : 1)).slice(0, 2);
      else pick = ((await g.ask(p, { type: "cards", prompt: "Gush: return two Islands you control to your hand", options: isl, min: Math.min(2, isl.length), max: 2, purpose: "gush", src: o })) || []).slice(0, 2);
      for (const x of pick) if (x.zone === "battlefield") g.moveTo(x, "hand");
      if (pick.length) log(g, `${p.name} returns ${pick.length} Island${pick.length > 1 ? "s" : ""} to hand for Gush.`, p, ["Gush"]);
    },
    spell: { do: (g, ctx) => g.draw(ctx.p, 2) },
    ai: { never: true }
  });
  const xDrawSpell = (name, cost, text, after) => D({
    name, cost, type: "Instant", text,
    spell: {
      targets: [{ kind: "player", purpose: "help", prompt: "Target player draws X cards" }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (ctx.legal[0] && t) g.draw(t, ctx.x); if (after) after(g, ctx); }
    },
    ai: { never: true, target: (g, p, req) => (req.options.includes(p) ? p : undefined), x: (g, p, o, xMax) => Math.max(0, Math.min(xMax, p.library.length - 10, 4)) }
  });
  xDrawSpell("Blue Sun's Zenith", "{X}{U}{U}{U}", "Target player draws X cards. Shuffle Blue Sun's Zenith into its owner's library.", (g, ctx) => {
    if (ctx.item.isCopy || ctx.o.zone !== "stack") return;
    g.moveTo(ctx.o, "library");
    g.shuffle(ctx.o.owner);
    log(g, "Blue Sun's Zenith is shuffled into its owner's library.", ctx.p, ["Blue Sun's Zenith"]);
  });
  xDrawSpell("Stroke of Genius", "{X}{2}{U}", "Target player draws X cards.");
  D({
    name: "Mystical Tutor", cost: "{U}", type: "Instant",
    text: "Search your library for an instant or sorcery card, reveal it, then shuffle and put that card on top.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, isIS, "top", "an instant or sorcery card") },
    ai: { instantEnd: true, tutor: true, priority: 7 }
  });
  D({
    name: "Merchant Scroll", cost: "{1}{U}", type: "Sorcery",
    text: "Search your library for a blue instant card, reveal that card, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, c => typeOf(c, "Instant") && isBlueCard(c), "hand", "a blue instant card") },
    ai: { tutor: true, priority: 7 }
  });
  D({
    name: "Fabricate", cost: "{2}{U}", type: "Sorcery",
    text: "Search your library for an artifact card, reveal it, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, c => typeOf(c, "Artifact"), "hand", "an artifact card") },
    ai: { tutor: true, priority: 6, cast: (g, p) => (p.library.some(c => c.def.name === "Isochron Scepter") || g.controlled(p, x => g.isLand(x)).length < 5 ? undefined : false) }
  });
  D({
    name: "Solve the Equation", cost: "{2}{U}", type: "Sorcery",
    text: "Search your library for an instant or sorcery card, reveal it, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => tutor(g, ctx.p, ctx.o, isIS, "hand", "an instant or sorcery card") },
    ai: { tutor: true, priority: 6 }
  });
  D({
    name: "Thirst for Knowledge", cost: "{2}{U}", type: "Instant",
    text: "Draw three cards. Then discard two cards unless you discard an artifact card.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        g.draw(p, 3);
        if (!p.hand.length) return;
        if (isBot(p)) {
          const arts = worstFirst(g, p, p.hand.filter(c => typeOf(c, "Artifact")));
          const two = worstFirst(g, p, p.hand).slice(0, 2);
          if (arts.length && cardWorth(g, p, arts[0]) <= two.reduce((n, c) => n + cardWorth(g, p, c), 0)) { g.discard(p, arts[0]); return; }
          await discardN(g, p, 2, ctx.o);
          return;
        }
        const pick = (await g.ask(p, { type: "cards", prompt: "Thirst for Knowledge: discard an artifact card, or two cards", options: p.hand.slice(), min: 1, max: 2, purpose: "discard", src: ctx.o })) || [];
        if (pick.length === 1 && typeOf(pick[0], "Artifact")) { g.discard(p, pick[0]); return; }
        for (const c of pick.slice(0, 2)) if (c.zone === "hand") g.discard(p, c);
        if (pick.length < 2) await discardN(g, p, 2 - pick.length, ctx.o);
      }
    },
    ai: { instantEnd: true, draw: true, priority: 5 }
  });
  /* Transmute Artifact: which artifact to sacrifice and which to find (bots). */
  function transmutePlan(g, p, spare) {
    const arts = g.controlled(p, o => g.isArtifact(o) && !(o.def.name === "Isochron Scepter" && imprintOf(o)));
    if (!arts.length) return null;
    const lib = p.library.filter(c => typeOf(c, "Artifact"));
    const s = comboState(g, p);
    let find = null;
    if (!s.scepter && !s.scepterInHand && (s.reversalInHand || s.reversal)) find = byName(lib, "Isochron Scepter");
    if (!find && s.revScepter && s.out >= 2 && !fluxOf(g, p) && !byName(p.hand, FLUX)) find = byName(lib, FLUX);
    if (!find && s.revScepter && s.out < 3) find = ["Grim Monolith", "Basalt Monolith", "Mana Vault", "Gilded Lotus"].map(n => byName(lib, n)).find(Boolean) || null;
    if (!find) return null;
    const worth = o => (o.isToken ? 0 : 2 + (o.def.mv || 0)) + (g.isCreature(o) ? 3 : 0) + (o.def.name === "Sol Ring" ? 3 : 0) + (o.def.name === "Mana Vault" && !o.tapped ? 2 : 0);
    const ok = arts.filter(o => Math.max(0, (find.def.mv || 0) - (o.isToken ? 0 : o.def.mv || 0)) <= spare).sort((a, b) => worth(a) - worth(b));
    return ok.length ? { sac: ok[0], find } : null;
  }
  D({
    name: "Transmute Artifact", cost: "{U}{U}", type: "Sorcery",
    text: "Sacrifice an artifact. If you do, search your library for an artifact card. If that card's mana value is less than or equal to the sacrificed artifact's mana value, put it onto the battlefield. If it's greater, you may pay {X}, where X is the difference. If you do, put it onto the battlefield. If you don't, put it into its owner's graveyard. Then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const arts = g.controlled(p, o => g.isArtifact(o));
        if (!arts.length) { log(g, `${p.name} has no artifact to sacrifice.`, p, ["Transmute Artifact"]); return; }
        const plan = isBot(p) ? transmutePlan(g, p, manaNow(g, p)) : null;
        const sac = await pickOne(g, p, arts, "Transmute Artifact: sacrifice an artifact", ctx.o, list => (plan && list.includes(plan.sac) ? plan.sac : worstFirst(g, p, list)[0]));
        if (!sac || sac.zone !== "battlefield") return;
        const mv = sac.isToken ? 0 : (sac.def.mv || 0);
        g.sacrifice(sac);
        const pool = g.librarySearch(p).filter(c => typeOf(c, "Artifact"));
        let pick = null;
        if (pool.length) {
          if (isBot(p)) pick = plan && pool.includes(plan.find) ? plan.find : bestTutor(g, p, pool);
          else { const a = await g.ask(p, { type: "cards", prompt: `Transmute Artifact: search your library for an artifact card (you sacrificed one with mana value ${mv})`, options: pool, min: 0, max: 1, purpose: "tutor", src: ctx.o }); pick = (a && a[0]) || null; }
        }
        if (pick && pick.zone === "library") {
          const diff = (pick.def.mv || 0) - mv;
          let ok = diff <= 0;
          if (!ok && g.canPay(p, pc(`{${diff}}`))) {
            const yes = isBot(p) ? true : await g.ask(p, { type: "confirm", prompt: `Transmute Artifact: pay {${diff}} to put ${pick.def.name} onto the battlefield? If you don't, it goes to your graveyard.`, purpose: "transmutePay", src: ctx.o, amount: diff });
            if (yes && g.pay(p, pc(`{${diff}}`))) ok = true;
          }
          if (ok) { log(g, `${p.name} finds ${pick.def.name} and puts it onto the battlefield.`, p, [pick.def.name], { kind: "search" }); g.putOntoBattlefield([pick], p); }
          else { g.moveTo(pick, "graveyard"); log(g, `${p.name} finds ${pick.def.name}, but it goes to the graveyard.`, p, [pick.def.name], { kind: "search" }); }
        } else log(g, `${p.name} searches and finds nothing.`, p, [], { kind: "search" });
        g.shuffle(p);
      }
    },
    ai: { tutor: true, priority: 7, cast: (g, p) => (transmutePlan(g, p, Math.max(0, manaNow(g, p) - 2)) ? 28 : false) }
  });
  /* Improvise: untapped artifacts that don't make mana (rocks pay with their mana instead); a Scepter last. */
  const improvisers = (g, p) => g.controlled(p, o => g.isArtifact(o) && !o.tapped && !freeTap(g, o)).sort((a, b) => (a.def.name === "Isochron Scepter" ? 1 : 0) - (b.def.name === "Isochron Scepter" ? 1 : 0));
  D({
    name: "Whir of Invention", cost: "{X}{U}{U}{U}", type: "Instant",
    text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nSearch your library for an artifact card with mana value X or less, put it onto the battlefield, then shuffle.",
    note: "Improvise taps your untapped artifacts that don't make mana (an Isochron Scepter last). It lowers the cost, but X can't be more than the mana you have.",
    keywords: ["improvise"],
    costReduce: (g, p, o, ch) => (o.zone === "hand" ? Math.min(improvisers(g, p).length, (ch && ch.x) || 0) : 0),
    onCast: (g, p, o, item) => {
      const list = improvisers(g, p).slice(0, item.x || 0);
      for (const a of list) g.tap(a);
      if (list.length) log(g, `${p.name} taps ${list.length} artifact${list.length > 1 ? "s" : ""} to improvise.`, p, ["Whir of Invention"]);
    },
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.item.x || 0;
        const pool = g.librarySearch(p).filter(c => typeOf(c, "Artifact") && (c.def.mv || 0) <= x);
        let pick = null;
        if (pool.length) {
          if (isBot(p)) pick = whirTarget(g, p, x) || bestTutor(g, p, pool);
          else { const a = await g.ask(p, { type: "cards", prompt: `Whir of Invention: search your library for an artifact card with mana value ${x} or less`, options: pool, min: 0, max: 1, purpose: "tutor", src: ctx.o }); pick = (a && a[0]) || null; }
        }
        if (pick && pick.zone === "library") { log(g, `${p.name} finds ${pick.def.name} and puts it onto the battlefield.`, p, [pick.def.name], { kind: "search" }); g.putOntoBattlefield([pick], p); }
        else log(g, `${p.name} searches and finds nothing.`, p, [], { kind: "search" });
        g.shuffle(p);
      }
    },
    ai: { never: true }
  });
  /* What Whir of Invention should find (bots): the Scepter when Dramatic Reversal is in hand, else mana for the loop. */
  function whirTarget(g, p, xMax) {
    const s = comboState(g, p);
    const lib = p.library.filter(c => typeOf(c, "Artifact") && (c.def.mv || 0) <= xMax);
    if (!s.scepter && s.reversalInHand) return byName(lib, "Isochron Scepter");
    if (s.revScepter && s.out >= 2 && !fluxOf(g, p) && !byName(p.hand, FLUX) && byName(lib, FLUX)) return byName(lib, FLUX);
    if (s.revScepter && s.out < 3) return ["Mana Vault", "Grim Monolith", "Basalt Monolith", "Sol Ring", "Hedron Archive", "Gilded Lotus"].map(n => byName(lib, n)).find(Boolean) || null;
    return null;
  }
  function whirPlan(g, p, acts, win, mineNext) {
    const w = byName(p.hand, "Whir of Invention");
    if (!w) return null;
    const a = castAct(acts, w);
    if (!a) return null;
    const t = whirTarget(g, p, a.xMax);
    if (!t) return null;
    const x = t.def.mv || 0;
    if (win === "end" && mineNext) return { type: "cast", card: w, x, maxTries: 1 };
    if ((win === "main1" || win === "main2") && g.active === p) {
      const after = manaNow(g, p) - costMV(g.spellCost(p, w, { x }));
      if (t.def.name !== "Isochron Scepter" || after >= 2) return { type: "cast", card: w, x, maxTries: 1 };
    }
    return null;
  }
  D({
    name: "Dramatic Reversal", cost: "{1}{U}", type: "Instant",
    text: "Untap all nonland permanents you control.",
    note: "Before the untap, your untapped nonland mana sources that need only {T} are tapped for mana (as you would in response). That mana stays in your pool until the end of the step.",
    spell: {
      do: (g, ctx) => {
        const p = ctx.p;
        const n = floatRocks(g, p);
        for (const o of g.controlled(p, x => !g.isLand(x))) g.untap(o);
        log(g, `${p.name} untaps all nonland permanents${n ? ` (${n} mana floating)` : ""}.`, p, ["Dramatic Reversal"]);
      }
    },
    ai: { never: true }
  });

  /* ================================================================ lands */
  D({ name: "Island", type: "Basic Land — Island", text: "({T}: Add {U}.)", mana: [{ tap: true, produce: "U" }] });
  D({ name: "Reliquary Tower", type: "Land", text: "You have no maximum hand size.\n{T}: Add {C}.", statics: [{ noMaxHand: true }], mana: [{ tap: true, produce: "C" }] });
  D({
    name: "Ancient Tomb", type: "Land", text: "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.",
    note: "It is tapped for mana only after your other mana sources, and not while you have 2 or less life.",
    mana: [{ tap: true, produce: "CC", last: true, condition: (g, o) => o.controller.life > 2, after: (g, o) => g.damage(o, o.controller, 2) }]
  });
  const otherIslands = (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x) && x.def.subtypes.includes("Island")).length;
  D({
    name: "Mystic Sanctuary", type: "Land — Island",
    text: "({T}: Add {U}.)\nMystic Sanctuary enters tapped unless you control three or more other Islands.\nWhen Mystic Sanctuary enters untapped, you may put target instant or sorcery card from your graveyard on top of your library.",
    etbTapped: (g, o) => otherIslands(g, o) < 3,
    mana: [{ tap: true, produce: "U" }],
    triggers: [{
      on: "enters", self: true, when: (g, s) => !s.tapped,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", optional: true, from: (g2, pl) => pl.graveyard.filter(isIS), purpose: "reanimate", prompt: "Mystic Sanctuary: put an instant or sorcery card from your graveyard on top of your library" }), s);
        if (t && t.zone === "graveyard") { g.moveTo(t, "library"); log(g, `${p.name} puts ${t.def.name} on top of the library.`, p, [t.def.name]); }
      }
    }],
    ai: { target: (g, p, req) => { const c = bestSpellIn(g, p, req.options); return c && cardWorth(g, p, c) >= 6 ? c : null; } }
  });
  D({
    name: "Castle Vantress", type: "Land",
    text: "Castle Vantress enters tapped unless you control an Island.\n{T}: Add {U}.\n{2}{U}{U}, {T}: Scry 2.",
    etbTapped: (g, o) => otherIslands(g, o) < 1,
    mana: [{ tap: true, produce: "U" }],
    abilities: [{ label: "Scry 2", cost: "{2}{U}{U}", tap: true, do: (g, s, ctx) => scry(g, ctx.p, 2, s), ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) && manaNow(g, p) >= 5 } }]
  });
  D({
    name: "Academy Ruins", type: "Legendary Land",
    text: "{T}: Add {C}.\n{1}{U}, {T}: Put target artifact card from your graveyard on top of your library.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Artifact card from graveyard to the top of your library", cost: "{1}{U}", tap: true,
      targets: [{ kind: "card", from: (g, pl) => pl.graveyard.filter(c => typeOf(c, "Artifact")), purpose: "reanimate", prompt: "Put an artifact card from your graveyard on top of your library" }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && t.zone === "graveyard") { g.moveTo(t, "library"); log(g, `${ctx.p.name} puts ${t.def.name} on top of the library.`, ctx.p, [t.def.name]); } },
      ai: { use: (g, p, o, ctx) => endBeforeMine(g, p, ctx) && manaNow(g, p) >= 3 && p.graveyard.some(c => ["Isochron Scepter", "Mana Vault", "Sol Ring", "Grim Monolith"].includes(c.def.name)) }
    }],
    ai: { target: (g, p, req) => byName(req.options, "Isochron Scepter") || byName(req.options, "Mana Vault") || byName(req.options, "Sol Ring") || undefined }
  });

  /* ================================================================ the deck */
  const singles = [
    // mana
    "Sol Ring", "Arcane Signet", "Mana Vault", "Grim Monolith", "Basalt Monolith", "Lotus Petal", "Chrome Mox", "Mox Diamond", "Mind Stone", "Thought Vessel", "Hedron Archive", "Gilded Lotus", "Sapphire Medallion",
    // combo and payoffs
    "Isochron Scepter", "Dramatic Reversal", "Aetherflux Reservoir", "Thassa's Oracle", "Blue Sun's Zenith", "Stroke of Genius", "Thran Dynamo", "Transmute Artifact", "Murmuring Mystic", "Archmage Emeritus", "Whir of Invention",
    // creatures
    "Baral, Chief of Compliance", "Spellseeker", "Tribute Mage", "Trinket Mage", "Archaeomancer",
    // tutors and card draw
    "Mystical Tutor", "Merchant Scroll", "Fabricate", "Solve the Equation", "Thirst for Knowledge", "Brainstorm", "Ponder", "Preordain", "Opt", "Consider", "Sleight of Hand", "Impulse", "Frantic Search", "Deep Analysis", "Treasure Cruise", "Dig Through Time", "Gush", "Mystic Remora", "Rhystic Study", "Mystic Confluence",
    // counterspells
    "Counterspell", "Force of Will", "Force of Negation", "Fierce Guardianship", "Pact of Negation", "Mana Leak", "Essence Scatter", "Exclude", "Negate", "Swan Song", "Arcane Denial", "Cryptic Command",
    // bounce and removal
    "Cyclonic Rift", "Snap", "Into the Roil", "Repulse", "Chain of Vapor", "Aetherize", "Aetherspouts", "Evacuation",
    // lands
    "Command Tower", "Reliquary Tower", "Ancient Tomb", "Mystic Sanctuary", "Castle Vantress", "Academy Ruins"
  ];
  const list = singles.slice();
  while (list.length < 99) list.push("Island");

  /* Keep mana for Aetherize, Aetherspouts or Evacuation when the table can hit hard: the bot
     holds its other main-phase spells (only the cards this file defines). */
  const FOGS = { "Aetherize": 4, "Aetherspouts": 5, "Evacuation": 5 };
  function rockGain(o) {
    let best = 0;
    for (const m of o.def.mana || []) {
      if (!m.tap || m.cost || m.tapCreature) continue;
      const pr = typeof m.produce === "function" ? "U" : m.produce;
      const n = Array.isArray(pr) ? Math.max(...pr.map(x => x.length)) : pr === "any" || pr === "any5" ? 1 : String(pr || "").length;
      if (n > best) best = n;
    }
    return best;
  }
  /* Don't cast card draw with (almost) no library left: Archmage Emeritus draws for every spell too. */
  function decksSelf(g, p, o) {
    const L = p.library.length;
    if (L >= 3) return false;
    if (o.def.ai && o.def.ai.draw) return true;
    return isIS(o) && ctrl(g, p, "Archmage Emeritus").length > 0 && L < 2;
  }
  function holdForDefense(g, p, o) {
    if (decksSelf(g, p, o)) return true;
    if (g.active !== p || isLandCard(o)) return false;
    let r = 0;
    for (const c of p.hand) { const n = FOGS[c.def.name]; if (n && c !== o && (!r || n < r)) r = n; }
    if (!r || pressure(g, p) < 0.3) return false;
    const have = manaNow(g, p);
    if (have < r) return false;
    return have - costMV(g.spellCost(p, o, {})) + rockGain(o) < r;
  }
  for (const name of new Set(list.concat("Talrand, Sky Summoner"))) {
    if (definedBefore.has(name)) continue;
    const d = MK.get(name);
    if (d.types.includes("Land") || FOGS[name]) continue;
    const old = d.ai.hold;
    if (old && old.talrandReserve) continue;
    d.ai.hold = old ? (g, p, o) => old(g, p, o) || holdForDefense(g, p, o) : holdForDefense;
    d.ai.hold.talrandReserve = true;
  }

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "talrand", name: "Talrand", title: "Talrand, Sky Summoner", commander: "Talrand, Sky Summoner",
    identity: ["U"], bracket: 4, aggression: 0.45,
    style: "Spellslinger counter control",
    blurb: "Talrand holds up counterspells, turns every instant and sorcery into a 2/2 flying Drake, and loops Isochron Scepter with Dramatic Reversal into Aetherflux Reservoir or Thassa's Oracle.",
    watch: ["Isochron Scepter", "Dramatic Reversal", "Aetherflux Reservoir", "Thassa's Oracle", "Rhystic Study"],
    list
  });
})(typeof window !== "undefined" ? window : globalThis);
