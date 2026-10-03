/* The Ur-Dragon bot deck (five-color Dragons, bracket 4) for the Miku Commander engine.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   Staples already defined in cards-miku.js (Sol Ring, Arcane Signet, Command Tower, Swords to
   Plowshares, Path to Exile, Beast Within, Farseek, Cultivate, Nature's Lore, Plains, Forest)
   are only listed in the deck.
   Every definition uses MK.defineOnce, so a card another deck file defined first is shared. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce;
  const U = MK.util;

  /* ================================================================ helpers */
  const isDragonDef = d => !!d && ((d.subtypes || []).includes("Dragon") || !!d.changeling);
  const isDragon = (g, o) => (o.zone === "battlefield" ? g.hasSub(o, "Dragon") : isDragonDef(o.def));
  const dragonCount = (g, p) => g.battlefield.filter(o => o.controller === p && g.hasSub(o, "Dragon")).length;
  const myDragonsNow = (g, p) => g.battlefield.filter(o => o.controller === p && g.isCreature(o) && g.hasSub(o, "Dragon"));
  const trig = spec => Object.assign({ trigger: true }, spec);
  const costMV = c => U.costMV(c);
  const valueOf = (g, o) => (MK.AI && MK.AI.value ? MK.AI.value(g, o) : 0);
  const threatOf = (g, o, p) => (MK.AI && MK.AI.threat ? MK.AI.threat(g, o, p) : 0);
  const isBot = p => !!(p.agent && p.agent.bot);
  const greatestPower = (g, p) => g.creatures(p).reduce((m, o) => Math.max(m, g.power(o)), 0);
  const drawLog = (g, p, n, src) => {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, { p, cards: [src.def.name], kind: "draw" });
    return got;
  };
  const roll20 = (g, p, src) => {
    const r = 1 + g.rand(20);
    g.log(`${p.name} rolls a d20 for ${src.def.name}: ${r}.`, { p, cards: [src.def.name], kind: "roll" });
    return r;
  };

  /* Tokens this deck makes. Kept local (keys prefixed) so other deck files can't clash. */
  /* Whether p controls Goldspan Dragon, cached per state version (asked once per Treasure per payment plan). */
  const goldspanCache = new WeakMap();
  const goldspanFor = (g, p) => {
    let c = goldspanCache.get(g);
    if (!c || c.v !== g.v) { c = { v: g.v, by: new Map() }; goldspanCache.set(g, c); }
    if (!c.by.has(p)) c.by.set(p, g.battlefield.some(o => o.controller === p && o.def.name === "Goldspan Dragon"));
    return c.by.get(p);
  };
  /* The automatic payment takes each source's first listed option before trying another, so a
     Treasure that listed white first would be spent on every {R} cost. Each Treasure lists the
     colors of the spells in hand first (most wanted first), and the lead color rotates between
     Treasures in proportion to how much each color is wanted. Cached per state version. */
  const treasureOrderCache = new WeakMap();
  function treasureOrders(g, p) {
    const hit = treasureOrderCache.get(g);
    if (hit && hit.v === g.v && hit.p === p) return hit.map;
    const want = { W: 0.3, U: 0.3, B: 0.3, R: 0.3, G: 0.3 };
    const cards = p.hand.filter(c => !c.def.types.includes("Land")).concat(p.command.filter(c => c.isCommander));
    for (const c of cards) {
      const k = c.def.costObj;
      for (const col of "WUBRG") want[col] += k[col] || 0;
      for (const h of k.hyb || []) for (const col of h) want[col] += 0.5;
    }
    const byWant = "WUBRG".split("").sort((a, b) => want[b] - want[a]);
    const credit = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    const total = Object.values(want).reduce((a, b) => a + b, 0);
    const map = new Map();
    for (const o of g.battlefield) {
      if (o.controller !== p || o.def.name !== "Treasure" || !o.def.urdTreasure) continue;
      // smooth weighted round robin: the lead color for this Treasure
      for (const col of "WUBRG") credit[col] += want[col];
      const lead = byWant.slice().sort((a, b) => credit[b] - credit[a])[0];
      credit[lead] -= total;
      map.set(o.id, [lead].concat(byWant.filter(c => c !== lead)));
    }
    treasureOrderCache.set(g, { v: g.v, p, map });
    return map;
  }
  const treasureOrder = (g, o) => treasureOrders(g, o.controller).get(o.id) || ["R", "G", "W", "U", "B"];
  const dragonTok = n => MK.tokenDef({ key: "urd-dragon-" + n, name: "Dragon", pt: [n, n], colors: "R", subtypes: ["Dragon"], keywords: ["flying"] });
  const TK = {
    dragon4: dragonTok(4), dragon5: dragonTok(5), dragon6: dragonTok(6),
    faerieDragon: MK.tokenDef({ key: "urd-faerie-dragon", name: "Faerie Dragon", pt: [1, 1], colors: "U", subtypes: ["Faerie", "Dragon"], keywords: ["flying"] }),
    karox: MK.tokenDef({ key: "urd-karox", name: "Karox Bladewing", pt: [4, 4], colors: "R", supertypes: ["Legendary"], subtypes: ["Dragon"], keywords: ["flying"] }),
    /* A Treasure that also has Goldspan Dragon's granted ability while you control Goldspan. */
    treasure: MK.tokenDef({
      key: "urd-treasure", name: "Treasure", types: ["Artifact"], subtypes: ["Treasure"], colors: [], urdTreasure: true,
      text: "{T}, Sacrifice this artifact: Add one mana of any color.",
      mana: [
        { tap: true, sacSelf: true, last: true, produce: (g, o) => treasureOrder(g, o) },
        { sacSelf: true, last: true, produce: (g, o) => (goldspanFor(g, o.controller) ? treasureOrder(g, o).map(c => c + c) : null) }
      ]
    })
  };

  /* "Choose a creature type" (Kindred Discovery, Herald's Horn, Urza's Incubator): offered types are the ones among
     your own creature cards, most common first. */
  async function chooseCreatureType(g, p, s, prompt) {
    const counts = new Map();
    const pool = p.library.concat(p.hand, p.graveyard, p.command, g.battlefield.filter(o => o.controller === p));
    for (const c of pool) if (c.def.types.includes("Creature")) for (const t of c.def.subtypes) counts.set(t, (counts.get(t) || 0) + 1);
    if (!counts.has("Dragon")) counts.set("Dragon", 0);
    const opts = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => ({ id: t, label: t }));
    const pick = await g.ask(p, { type: "option", prompt, options: opts, purpose: "creatureType", src: s });
    const t = opts.some(o => o.id === pick) ? pick : opts[0].id;
    if (s.zone === "battlefield") s.state.chosenType = t;
    g.bump();
    g.log(`${p.name} chooses ${t} for ${s.def.name}.`, { p, cards: [s.def.name] });
    return t;
  }
  const chosenType = (g, s, o) => !!s.state.chosenType && g.hasSub(o, s.state.chosenType);

  /* "It deals X damage to any target, where X is the number of Dragons you control." */
  async function dragonBlast(g, p, dragon, src) {
    const x = dragonCount(g, p);
    if (x <= 0) return;
    const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: x, prompt: `${dragon.def.name} deals ${x} damage to` }), src);
    if (t) g.damage(dragon, t, x);
  }

  /* ---------- bot helpers: mana, colors, lands, tutors */
  /* Mana we can make now without Treasures. */
  function freeMana(g, p) {
    let n = g.poolTotal(p);
    for (const s of g.manaSources(p)) if (!s.last && !s.hasCost && !s.tapCreature) n += s.options[0].units.length * s.mult;
    return n;
  }
  const spellCards = p => p.hand.filter(c => !c.def.types.includes("Land")).concat(p.command.filter(c => c.isCommander));
  /* Is there a spell we can't cast now but could with one more untapped mana? */
  function needsOneMore(g, p) {
    const avail = freeMana(g, p);
    return spellCards(p).some(c => {
      const n = costMV(g.spellCost(p, c));
      return n <= avail + 1 && !g.castOptions(p, c).length;
    });
  }
  function producedColors(d) {
    const set = new Set();
    for (const m of (d && d.mana) || []) {
      const prod = typeof m.produce === "function" ? null : m.produce;
      if (!prod) continue;
      const units = Array.isArray(prod) ? prod.join("") : (prod === "any" || prod === "any5") ? "WUBRG" : String(prod);
      for (const k of "WUBRG") if (units.includes(k)) set.add(k);
    }
    return [...set];
  }
  function colorSources(g, p) {
    const have = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    for (const o of g.controlled(p)) if (!o.isToken) for (const k of producedColors(o.def)) have[k]++;
    return have;
  }
  const fetchFilter = types => (g, o) => o.def.types.includes("Land") && types.some(t => o.def.subtypes.includes(t));
  /* Colors a land card gives us; a fetch land counts as everything it could find. */
  function landColors(g, p, c) {
    if (c.def.fetchTypes) {
      const set = new Set();
      const f = fetchFilter(c.def.fetchTypes);
      for (const x of p.library) if (f(g, x)) producedColors(x.def).forEach(k => set.add(k));
      return [...set];
    }
    return producedColors(c.def);
  }
  function landPickScore(g, p, c, wantUntapped, have) {
    let s = 0;
    for (const k of landColors(g, p, c)) s += 3 / (1 + have[k]);
    const tapped = c.def.etbTapped === true;
    if (tapped) s += wantUntapped ? -5 : 1;
    if (c.def.shock && wantUntapped && p.life <= 12) s -= 2;
    if (c.def.fetchTypes) s -= 0.3;
    return s;
  }
  /* The land to play this turn (fetch lands count as the lands they find). */
  function chooseLand(g, p, landActs) {
    const want = needsOneMore(g, p);
    const have = colorSources(g, p);
    let best = null, bs = -1e9;
    for (const a of landActs) {
      const s = landPickScore(g, p, a.card, want, have);
      if (s > bs) { bs = s; best = a; }
    }
    return best;
  }
  /* Bots search with their own scoring: the search is limited to the cards they would pick. */
  async function smartSearch(g, p, opts, scorer) {
    if (isBot(p) && scorer) {
      const pool = p.library.filter(o => opts.filter(g, o));
      const n = opts.count == null ? 1 : opts.count;
      const set = new Set(pool.sort((a, b) => scorer(g, p, b) - scorer(g, p, a)).slice(0, n));
      return g.search(p, Object.assign({}, opts, { filter: (g2, o) => set.has(o) }));
    }
    return g.search(p, opts);
  }
  function tutorScore(g, p, c) {
    const d = c.def;
    if (d.types.includes("Land")) return 0;
    const have = freeMana(g, p) + g.controlled(p, o => o.def.mana.length > 0 && o.tapped).length + 1;
    let s = (d.ai && d.ai.priority != null ? d.ai.priority : 5) + Math.min(d.mv, have) * 0.5;
    const cost = costMV(g.spellCost(p, c));
    if (cost > have + 1) s -= (cost - have - 1) * 1.5;
    if (d.ai && d.ai.ramp) s += have < 5 ? 3 : -4;
    if (isDragonDef(d)) s += 1;
    return s;
  }
  /* Pump abilities in combat ({R}: +1/+0 and friends): use them when the extra damage kills a
     player, or when there is nothing left in hand to spend the mana on. `gainFor(a)` is the
     extra damage one activation adds for attacker a. */
  function combatPump(g, p, costN, gainFor) {
    const c = g.combat;
    if (!c || c.attacker !== p) return false;
    const mana = freeMana(g, p);
    const n = Math.floor(mana / costN);
    if (n <= 0) return false;
    const byQ = new Map();
    for (const a of c.attackers) {
      if (a.controller !== p || a.zone !== "battlefield" || !a.combat || a.combat.wasBlocked) continue;
      if (!g.isPlayer(a.combat.attacking)) continue;
      const q = a.combat.attacking;
      const ds = g.kw(a, "double strike") ? 2 : 1;
      const e = byQ.get(q) || { dmg: 0, gain: 0 };
      e.dmg += Math.max(0, g.power(a)) * ds;
      e.gain += gainFor(a) * ds;
      byQ.set(q, e);
    }
    let any = false;
    for (const [q, e] of byQ) {
      if (e.gain <= 0) continue;
      any = true;
      if (e.dmg < q.life && e.dmg + n * e.gain >= q.life) return { repeat: Math.ceil((q.life - e.dmg) / e.gain) };
    }
    if (!any) return false;
    const spare = spellCards(p).every(o => costMV(g.spellCost(p, o)) > mana);
    return spare ? { repeat: n } : false;
  }

  /* ================================================================ commander */
  const urCostMod = (g, s, card) => (card !== s && isDragonDef(card.def) ? 1 : 0);
  function putScore(g, p, c) {
    const d = c.def;
    if (d.types.includes("Land")) return g.controlled(p, o => g.isLand(o)).length < 8 ? 2 : 0.5;
    let s = d.mv + (d.ai && d.ai.priority != null ? d.ai.priority : 5) * 0.3;
    if (isDragonDef(d)) s += 3;
    if (d.types.includes("Creature")) s += 1;
    if (d.name === "Tiamat") s -= 4; // its search needs it to be cast
    return s;
  }
  D({
    name: "The Ur-Dragon", cost: "{4}{W}{U}{B}{R}{G}", type: "Legendary Creature — Dragon Avatar", pt: "10/10",
    keywords: ["flying"],
    text: "Eminence — As long as The Ur-Dragon is in the command zone or on the battlefield, other Dragon spells you cast cost {1} less to cast.\nFlying\nWhenever one or more Dragons you control attack, draw that many cards, then you may put a permanent card from your hand onto the battlefield.",
    commandStatics: [{ costMod: urCostMod }],
    statics: [{ costMod: urCostMod }],
    triggers: [{
      on: "attack",
      when: (g, s, ev) => ev.p === s.controller && ev.attackers.some(a => isDragon(g, a)),
      do: async (g, s, ev, { p }) => {
        const n = ev.attackers.filter(a => isDragon(g, a)).length;
        drawLog(g, p, n, s);
        const opts = p.hand.filter(c => g.isPermanentCard(c));
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "The Ur-Dragon: you may put a permanent card from your hand onto the battlefield", options: opts, optional: true, purpose: "urDragonPut", src: s });
        if (!pick || pick.zone !== "hand") return;
        g.log(`${p.name} puts ${pick.def.name} onto the battlefield (The Ur-Dragon).`, { p, cards: [pick.def.name] });
        g.putOntoBattlefield([pick], p);
      }
    }],
    ai: {
      priority: 8,
      target: (g, p, req) => (req.purpose === "urDragonPut" ? req.options.slice().sort((a, b) => putScore(g, p, b) - putScore(g, p, a))[0] || null : undefined),
      /* Deck-wide sequencing: the land drop (fetch lands count as what they find). */
      plan: (g, p, o, { window, actions }) => {
        if (window !== "main1" && window !== "main2") return null;
        const lands = actions.filter(a => a.type === "land");
        return lands.length ? chooseLand(g, p, lands) : null;
      }
    }
  });

  /* ================================================================ dragon helpers */
  const wardTrigger = MK.wardTrigger;
  /* Look at the top n cards, put one into your hand and the rest on the bottom. */
  async function lookPickOne(g, p, s, n) {
    const cards = p.library.slice(0, n);
    if (!cards.length) return;
    const pick = await g.ask(p, { type: "cards", prompt: `${s.def.name}: put one of these into your hand and the rest on the bottom of your library`, options: cards, min: 1, max: 1, purpose: "lookPick", src: s });
    const chosen = ((pick || []).find(c => cards.includes(c))) || cards[0];
    g.moveTo(chosen, "hand");
    for (const c of cards) if (c !== chosen && c.zone === "library") g.moveTo(c, "library", { bottom: true });
    g.log(`${p.name} looks at the top ${cards.length} cards of their library and puts one into their hand (${s.def.name}).`, { p, cards: [s.def.name] });
  }
  /* "N damage divided as you choose among any number of target creatures and/or planeswalkers
     your opponents control": targets are picked one at a time and each gets what it needs to die. */
  async function dividedDamage(g, p, s, total) {
    const hits = [];
    let left = total;
    const legal = o => o.zone === "battlefield" && o.controller !== p && (g.isCreature(o) || g.isPlaneswalker(o)) && g.canTarget(p, o);
    while (left > 0) {
      const opts = g.battlefield.filter(o => legal(o) && !hits.some(h => h.t === o));
      if (!opts.length) break;
      const t = await g.ask(p, { type: "target", prompt: `${s.def.name}: choose a target for damage (${left} left)`, options: opts, optional: hits.length > 0, purpose: "harm", src: s, spec: { kind: "creatureOrPlaneswalker", amount: left } });
      if (!t || !opts.includes(t)) break;
      const need = g.isCreature(t) ? (g.kw(t, "indestructible") ? 1 : g.lethalDamageLeft(t)) : (t.counters.loyalty || 0);
      const n = Math.max(1, Math.min(left, need));
      hits.push({ t, n });
      left -= n;
    }
    if (left > 0 && hits.length) hits[hits.length - 1].n += left;
    for (const h of hits) if (h.t.zone === "battlefield") g.damage(s, h.t, h.n);
  }
  /* Korvold: the cheapest thing to sacrifice. */
  function sacFodder(g, p, opts) {
    const lands = g.controlled(p, x => g.isLand(x)).length;
    const score = o => {
      if (o.def.name === "Treasure") return 0;
      if (o.isToken && g.isCreature(o)) return 1 + valueOf(g, o) * 0.2;
      if (o.def.fetchTypes && !o.tapped) return 12;
      if (g.isLand(o)) return lands >= 8 ? 3 : lands >= 6 ? 6 : 15;
      if (g.isCreature(o) && o.def.mana.length && g.power(o) <= 2) return lands >= 6 ? 2.5 : 8;
      if (!g.isCreature(o) && o.def.mana.length) return lands >= 7 ? 4 : 9;
      return 10 + valueOf(g, o);
    };
    return opts.slice().sort((a, b) => score(a) - score(b))[0] || null;
  }
  async function korvoldSac(g, p, s) {
    const opts = g.battlefield.filter(o => o.controller === p && o !== s);
    if (!opts.length) return;
    let pick = await g.ask(p, { type: "target", prompt: "Korvold: sacrifice another permanent", options: opts, purpose: "korvoldSac", src: s });
    if (!pick || !opts.includes(pick) || pick.zone !== "battlefield") pick = sacFodder(g, p, opts);
    if (pick) g.sacrifice(pick);
  }
  const glorySpec = () => trig({ kind: "creature", purpose: "harm", amount: 4, prompt: "Glorybringer deals 4 damage to", filter: (g, o, pl) => o.controller !== pl && !g.hasSub(o, "Dragon") });
  function gloryTarget(g, p, s) {
    const opts = g.targetOptions(p, glorySpec(), s).filter(o => !g.kw(o, "indestructible") && g.lethalDamageLeft(o) <= 4);
    return opts.sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p)).find(o => threatOf(g, o, p) >= 3) || null;
  }
  const isFlyingAttacker = (g, p) => g.combat && g.combat.attacker === p;

  /* ================================================================ dragons */
  D({
    name: "Scourge of Valkas", cost: "{2}{R}{R}{R}", type: "Creature — Dragon", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Scourge of Valkas or another Dragon you control enters, it deals X damage to any target, where X is the number of Dragons you control.\n{R}: Scourge of Valkas gets +1/+0 until end of turn.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"),
      do: (g, s, ev, { p }) => dragonBlast(g, p, ev.o, s)
    }],
    abilities: [{
      label: "+1/+0", cost: "{R}",
      do: (g, s) => g.pump(s, 1, 0),
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && isFlyingAttacker(g, p) && combatPump(g, p, 1, a => (a === o ? 1 : 0)) }
    }],
    ai: { priority: 9 }
  });

  D({
    name: "Terror of the Peaks", cost: "{3}{R}{R}", type: "Creature — Dragon", pt: "5/4",
    keywords: ["flying"],
    text: "Flying\nSpells your opponents cast that target Terror of the Peaks cost an additional 3 life to cast.\nWhenever another creature you control enters, Terror of the Peaks deals damage equal to that creature's power to any target.",
    note: "The extra 3 life is paid right after the spell is cast. A player who can't pay has the spell countered.",
    triggers: [
      {
        on: "cast", when: (g, s, ev) => ev.p !== s.controller && !!ev.item && ev.item.targets.includes(s),
        do: (g, s, ev) => {
          const q = ev.p;
          if (!g.stack.includes(ev.item) || q.lost) return;
          if (g.payLife(q, 3)) g.log(`${q.name} pays 3 life to target Terror of the Peaks.`, { p: q, cards: [s.def.name] });
          else { g.log(`${q.name} can't pay 3 life for Terror of the Peaks.`, { p: q, cards: [s.def.name] }); g.counterSpell(ev.item, s); }
        }
      },
      {
        on: "enters",
        when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && ((ev["tp" + s.id] = g.power(ev.o)), true),
        do: async (g, s, ev, { p }) => {
          const n = ev.o.zone === "battlefield" ? g.power(ev.o) : ev["tp" + s.id];
          if (!(n > 0)) return;
          const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `Terror of the Peaks deals ${n} damage to` }), s);
          if (t) g.damage(s, t, n);
        }
      }
    ],
    ai: { priority: 9 }
  });

  D({
    name: "Utvara Hellkite", cost: "{6}{R}{R}", type: "Creature — Dragon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhenever a Dragon you control attacks, create a 6/6 red Dragon creature token with flying.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"),
      do: (g, s, ev, { p }) => g.createToken(p, TK.dragon6)
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Old Gnawbone", cost: "{5}{G}{G}", type: "Legendary Creature — Dragon", pt: "7/7",
    keywords: ["flying"],
    text: "Flying\nWhenever a creature you control deals combat damage to a player, create that many Treasure tokens.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && ev.amount > 0,
      do: (g, s, ev, { p }) => g.createToken(p, TK.treasure, { count: ev.amount })
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Lathliss, Dragon Queen", cost: "{4}{R}{R}", type: "Legendary Creature — Dragon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhenever another nontoken Dragon you control enters, create a 5/5 red Dragon creature token with flying.\n{1}{R}: Dragons you control get +1/+0 until end of turn.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && !ev.o.isToken && ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"),
      do: (g, s, ev, { p }) => g.createToken(p, TK.dragon5)
    }],
    abilities: [{
      label: "Dragons get +1/+0", cost: "{1}{R}",
      do: (g, s, ctx) => g.addEffect({ objs: g.battlefield.filter(o => o.controller === ctx.p && g.hasSub(o, "Dragon")), pt: [1, 0] }),
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && isFlyingAttacker(g, p) && combatPump(g, p, 2, a => (g.hasSub(a, "Dragon") ? 1 : 0)) }
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Miirym, Sentinel Wyrm", cost: "{3}{G}{U}{R}", type: "Legendary Creature — Dragon Spirit", pt: "6/6",
    keywords: ["flying", "ward"],
    text: "Flying, ward {2}\nWhenever another nontoken Dragon you control enters, create a token that's a copy of it, except the token isn't legendary.",
    triggers: [
      wardTrigger(2),
      {
        on: "enters", when: (g, s, ev) => ev.o !== s && !ev.o.isToken && ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"),
        do: (g, s, ev, { p }) => {
          const base = ev.o.copyDef || ev.o.def;
          g.copyToken(p, ev.o, { except: { legendary: false, supertypes: base.supertypes.filter(x => x !== "Legendary"), type: String(base.type).replace(/^Legendary /, "") } });
        }
      }
    ],
    ai: { priority: 8 }
  });

  D({
    name: "Dragonlord Ojutai", cost: "{3}{W}{U}", type: "Legendary Creature — Elder Dragon", pt: "5/4",
    keywords: ["flying"],
    text: "Flying\nDragonlord Ojutai has hexproof as long as it's untapped.\nWhenever Dragonlord Ojutai deals combat damage to a player, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order.",
    statics: [{ applies: (g, s, o) => o === s && !s.tapped, kw: ["hexproof"] }],
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => lookPickOne(g, p, s, 3) }],
    ai: { priority: 7 }
  });

  D({
    name: "Dragonlord Atarka", cost: "{5}{R}{G}", type: "Legendary Creature — Elder Dragon", pt: "8/8",
    keywords: ["flying", "trample"],
    text: "Flying, trample\nWhen Dragonlord Atarka enters, it deals 5 damage divided as you choose among any number of target creatures and/or planeswalkers your opponents control.",
    note: "You pick the targets one at a time. Each gets the damage it needs to die (a planeswalker: its loyalty) and any damage left over goes to the last one.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => dividedDamage(g, p, s, 5) }],
    ai: { priority: 8 }
  });

  D({
    name: "Atarka, World Render", cost: "{5}{R}{G}", type: "Legendary Creature — Dragon", pt: "6/4",
    keywords: ["flying", "trample"],
    text: "Flying, trample\nWhenever a Dragon you control attacks, it gains double strike until end of turn.",
    triggers: [{
      on: "attacks", when: (g, s, ev) => ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"),
      do: (g, s, ev) => {
        if (ev.o.zone !== "battlefield") return;
        g.grant(ev.o, ["double strike"]);
        g.log(`${ev.o.def.name} gains double strike.`, { p: s.controller, cards: [ev.o.def.name] });
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Tiamat", cost: "{2}{W}{U}{B}{R}{G}", type: "Legendary Creature — Dragon God", pt: "7/7",
    keywords: ["flying"],
    text: "Flying\nWhen Tiamat enters, if you cast it, search your library for up to five Dragon cards not named Tiamat that each have different names, reveal them, put them into your hand, then shuffle.",
    onResolve: (g, p, o) => { if (o.zone === "battlefield") o.state.wasCast = true; },
    triggers: [{
      on: "enters", self: true, intervening: (g, s) => !!s.state.wasCast,
      do: (g, s, ev, { p }) => smartSearch(g, p, { filter: (g2, o) => isDragonDef(o.def) && o.def.name !== "Tiamat", count: 5, to: "hand", prompt: "Tiamat: choose up to five Dragon cards with different names", src: s }, tutorScore)
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Korvold, Fae-Cursed King", cost: "{2}{B}{R}{G}", type: "Legendary Creature — Dragon Noble", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Korvold enters or attacks, sacrifice another permanent.\nWhenever you sacrifice a permanent, put a +1/+1 counter on Korvold and draw a card.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => korvoldSac(g, p, s) },
      { on: "attacks", self: true, do: (g, s, ev, { p }) => korvoldSac(g, p, s) },
      {
        on: "sacrifice", when: (g, s, ev) => ev.p === s.controller,
        do: (g, s, ev, { p }) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); drawLog(g, p, 1, s); }
      }
    ],
    ai: { priority: 8, target: (g, p, req) => (req.purpose === "korvoldSac" ? sacFodder(g, p, req.options) : undefined) }
  });

  D({
    name: "Goldspan Dragon", cost: "{3}{R}{R}", type: "Creature — Dragon", pt: "4/4",
    keywords: ["flying", "haste"],
    text: "Flying, haste\nWhenever Goldspan Dragon attacks or becomes the target of a spell, create a Treasure token.\nTreasures you control have \"Sacrifice this artifact: Add two mana of any one color.\"",
    note: "The two-mana ability works on the Treasures this deck makes.",
    triggers: [
      { on: "attacks", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.treasure) },
      { on: "cast", when: (g, s, ev) => !!ev.item && ev.item.targets.includes(s), do: (g, s, ev, { p }) => g.createToken(p, TK.treasure) }
    ],
    ai: { priority: 8 }
  });

  D({
    name: "Thundermaw Hellkite", cost: "{3}{R}{R}", type: "Creature — Dragon", pt: "5/5",
    keywords: ["flying", "haste"],
    text: "Flying\nHaste\nWhen Thundermaw Hellkite enters, it deals 1 damage to each creature with flying your opponents control. Tap those creatures.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const list = g.battlefield.filter(o => o.controller !== p && g.isCreature(o) && g.kw(o, "flying"));
        for (const o of list) g.damage(s, o, 1);
        for (const o of list) if (o.zone === "battlefield") g.tap(o);
        if (list.length) g.log(`Thundermaw Hellkite taps ${list.length} flying creature${list.length === 1 ? "" : "s"}.`, { p, cards: [s.def.name] });
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Glorybringer", cost: "{3}{R}{R}", type: "Creature — Dragon", pt: "4/4",
    keywords: ["flying", "haste"],
    text: "Flying, haste\nYou may exert Glorybringer as it attacks. When you do, it deals 4 damage to target non-Dragon creature an opponent controls. (An exerted creature won't untap during your next untap step.)",
    doesntUntap: (g, o) => { if (o.state.exerted) { o.state.exerted = false; return true; } return false; },
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        if (!g.targetOptions(p, glorySpec(), s).length) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Exert Glorybringer? It won't untap during your next untap step.", src: s, purpose: "exert" });
        if (!ok || s.zone !== "battlefield") return;
        s.state.exerted = true; g.bump();
        g.log(`${p.name} exerts Glorybringer.`, { p, cards: [s.def.name] });
        const t = await g.chooseTarget(p, glorySpec(), s);
        if (t && t.zone === "battlefield") g.damage(s, t, 4);
      }
    }],
    ai: {
      priority: 7,
      confirm: (g, p, req) => (req.purpose === "exert" ? !!gloryTarget(g, p, req.src) : true),
      target: (g, p, req) => (req.purpose === "harm" ? gloryTarget(g, p, req.src) || undefined : undefined)
    }
  });

  D({
    name: "Balefire Dragon", cost: "{5}{R}{R}", type: "Creature — Dragon", pt: "6/6",
    keywords: ["flying"],
    text: "Flying\nWhenever Balefire Dragon deals combat damage to a player, it deals that much damage to each creature that player controls.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: (g, s, ev) => {
        const n = ev.amount;
        for (const o of g.creatures(ev.p)) g.damage(s, o, n);
      }
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Ancient Copper Dragon", cost: "{4}{R}{R}", type: "Creature — Elder Dragon", pt: "6/5",
    keywords: ["flying"],
    text: "Flying\nWhenever Ancient Copper Dragon deals combat damage to a player, roll a d20. You create a number of Treasure tokens equal to the result.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.createToken(p, TK.treasure, { count: roll20(g, p, s) }) }],
    ai: { priority: 7 }
  });

  D({
    name: "Ancient Gold Dragon", cost: "{5}{W}{W}", type: "Creature — Elder Dragon", pt: "7/10",
    keywords: ["flying"],
    text: "Flying\nWhenever Ancient Gold Dragon deals combat damage to a player, roll a d20. You create a number of 1/1 blue Faerie Dragon creature tokens with flying equal to the result.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.createToken(p, TK.faerieDragon, { count: roll20(g, p, s) }) }],
    ai: { priority: 7 }
  });

  D({
    name: "Lozhan, Dragons' Legacy", cost: "{3}{U}{R}", type: "Legendary Creature — Dragon", pt: "4/2",
    keywords: ["flying"],
    text: "Flying\nWhenever you cast an Adventure or Dragon spell, Lozhan, Dragons' Legacy deals damage equal to that spell's mana value to any target that isn't a commander.",
    note: "The engine has no Adventure cards, so only Dragon spells trigger it.",
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && isDragonDef(ev.o.def) && ev.o.def.mv > 0,
      do: async (g, s, ev, { p }) => {
        const n = ev.o.def.mv;
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, filter: (g2, o) => !o.isCommander, prompt: `Lozhan deals ${n} damage to (not a commander)` }), s);
        if (t) g.damage(s, t, n);
      }
    }],
    ai: { priority: 8 }
  });

  D({
    name: "Ancient Bronze Dragon", cost: "{5}{G}{G}", type: "Creature — Elder Dragon", pt: "7/7",
    keywords: ["flying", "trample"],
    text: "Flying, trample\nWhenever Ancient Bronze Dragon deals combat damage to a player, roll a d20. When you do, put a number of +1/+1 counters equal to the result on each of up to two target creatures.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const n = roll20(g, p, s);
        const first = await g.chooseTarget(p, trig({ kind: "creature", purpose: "counter", optional: true, prompt: `Put ${n} +1/+1 counters on` }), s);
        if (!first) return;
        const second = await g.chooseTarget(p, trig({ kind: "creature", purpose: "counter", optional: true, prompt: `Also put ${n} +1/+1 counters on`, filter: (g2, o) => o !== first }), s);
        for (const t of [first, second]) if (t && t.zone === "battlefield") g.addCounters(t, "p1", n, s);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Bladewing the Risen", cost: "{3}{B}{B}{R}{R}", type: "Legendary Creature — Zombie Dragon", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhen Bladewing the Risen enters, you may return target Dragon permanent card from your graveyard to the battlefield.\n{B}{R}: Dragon creatures get +1/+1 until end of turn.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "card", optional: true, purpose: "reanimate", prompt: "Bladewing the Risen: return a Dragon permanent card from your graveyard", from: (g2, pl) => pl.graveyard.filter(c => isDragonDef(c.def) && g2.isPermanentCard(c)) }), s);
        if (!t || t.zone !== "graveyard") return;
        g.log(`${p.name} returns ${t.def.name} to the battlefield (Bladewing the Risen).`, { p, cards: [t.def.name] });
        g.putOntoBattlefield([t], p);
      }
    }],
    abilities: [{
      label: "Dragon creatures get +1/+1", cost: "{B}{R}",
      do: (g, s) => g.addEffect({ objs: g.battlefield.filter(o => g.isCreature(o) && g.hasSub(o, "Dragon")), pt: [1, 1] }),
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && isFlyingAttacker(g, p) && combatPump(g, p, 2, a => (g.hasSub(a, "Dragon") ? 1 : 0)) }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Verix Bladewing", cost: "{2}{R}{R}", type: "Legendary Creature — Dragon", pt: "4/4",
    keywords: ["flying"],
    kicker: "{3}",
    text: "Kicker {3} (You may pay an additional {3} as you cast this spell.)\nFlying\nWhen Verix Bladewing enters, if it was kicked, create Karox Bladewing, a legendary 4/4 red Dragon creature token with flying.",
    onResolve: (g, p, o, item) => { if (item && item.kicked && o.zone === "battlefield") o.state.kicked = true; },
    triggers: [{ on: "enters", self: true, intervening: (g, s) => !!s.state.kicked, do: (g, s, ev, { p }) => g.createToken(p, TK.karox) }],
    ai: { priority: 6 }
  });

  D({
    name: "Dragonlord Kolaghan", cost: "{4}{B}{R}", type: "Legendary Creature — Elder Dragon", pt: "6/4",
    keywords: ["flying", "haste"],
    text: "Flying, haste\nOther creatures you control have haste.\nWhenever an opponent casts a creature or planeswalker spell with the same name as a card in their graveyard, that player loses 10 life.",
    statics: [{ applies: (g, s, o) => o !== s && o.controller === s.controller && g.isCreature(o), kw: ["haste"] }],
    triggers: [{
      on: "cast",
      when: (g, s, ev) => ev.p !== s.controller && !!ev.o && (ev.o.def.types.includes("Creature") || ev.o.def.types.includes("Planeswalker")) && ev.p.graveyard.some(c => c.def.name === ev.o.def.name),
      do: (g, s, ev) => g.loseLife(ev.p, 10, s)
    }],
    ai: { priority: 7 }
  });

  D({
    name: "Broodmate Dragon", cost: "{3}{B}{R}{G}", type: "Creature — Dragon", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhen Broodmate Dragon enters, create a 4/4 red Dragon creature token with flying.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.dragon4) }],
    ai: { priority: 7 }
  });

  /* ================================================================ other creatures */
  const exalted = {
    on: "attack", when: (g, s, ev) => ev.p === s.controller && ev.attackers.length === 1,
    do: (g, s, ev) => {
      const a = ev.attackers[0];
      if (a.zone !== "battlefield") return;
      g.pump(a, 1, 1);
      g.log(`Exalted: ${a.def.name} gets +1/+1 (${s.def.name}).`, { p: s.controller, cards: [s.def.name] });
    }
  };
  const dragonDiscount = n => ({ costMod: (g, s, card) => (isDragonDef(card.def) ? n : 0) });

  D({
    name: "Birds of Paradise", cost: "{G}", type: "Creature — Bird", pt: "0/1",
    keywords: ["flying"],
    text: "Flying\n{T}: Add one mana of any color.",
    mana: [{ tap: true, produce: "any5" }],
    ai: { ramp: true, priority: 9 }
  });
  D({
    name: "Noble Hierarch", cost: "{G}", type: "Creature — Human Druid", pt: "0/1",
    keywords: ["exalted"],
    text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{T}: Add {G}, {W}, or {U}.",
    mana: [{ tap: true, produce: ["G", "W", "U"] }],
    triggers: [exalted],
    ai: { ramp: true, priority: 9 }
  });
  D({
    name: "Ignoble Hierarch", cost: "{G}", type: "Creature — Goblin Shaman", pt: "0/1",
    keywords: ["exalted"],
    text: "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)\n{T}: Add {B}, {R}, or {G}.",
    mana: [{ tap: true, produce: ["B", "R", "G"] }],
    triggers: [exalted],
    ai: { ramp: true, priority: 9 }
  });
  D({
    name: "Draconic Disciple", cost: "{1}{R}{G}", type: "Creature — Human Shaman", pt: "2/2",
    text: "{T}: Add one mana of any color.\n{7}, {T}, Sacrifice Draconic Disciple: Create a 5/5 red Dragon creature token with flying.",
    mana: [{ tap: true, produce: "any5" }],
    abilities: [{
      label: "Create a 5/5 Dragon", cost: "{7}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.createToken(ctx.p, TK.dragon5),
      ai: { use: (g, p, o, ctx) => (ctx.window === "end" && !!ctx.turnOf && g.nextPlayer(ctx.turnOf) === p) || (ctx.window === "main2" && p.hand.length === 0) }
    }],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Dragonlord's Servant", cost: "{1}{R}", type: "Creature — Goblin Shaman", pt: "1/3",
    text: "Dragon spells you cast cost {1} less to cast.",
    statics: [dragonDiscount(1)],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Dragonspeaker Shaman", cost: "{1}{R}{R}", type: "Creature — Human Barbarian Shaman", pt: "2/2",
    text: "Dragon spells you cast cost {2} less to cast.",
    statics: [dragonDiscount(2)],
    ai: { ramp: true, priority: 8 }
  });
  D({
    name: "Dragonmaster Outcast", cost: "{R}", type: "Creature — Human Shaman", pt: "1/1",
    text: "At the beginning of your upkeep, if you control six or more lands, create a 5/5 red Dragon creature token with flying.",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
      intervening: (g, s) => g.controlled(s.controller, o => g.isLand(o)).length >= 6,
      do: (g, s, ev, { p }) => g.createToken(p, TK.dragon5)
    }],
    ai: { priority: 6 }
  });

  /* ================================================================ planeswalker */
  function neededColor(g, p) {
    const have = colorSources(g, p);
    const want = { W: 0, U: 0, B: 0, R: 0, G: 0 };
    for (const c of spellCards(p)) for (const k of c.def.colors || []) want[k]++;
    let best = "R", bs = -1e9;
    for (const k of "WUBRG") { const s = want[k] * 2 - have[k]; if (s > bs) { bs = s; best = k; } }
    return best;
  }
  async function chooseManaColor(g, p, s) {
    const opts = ["W", "U", "B", "R", "G"].map(k => ({ id: k, label: MK.COLOR_NAME[k] }));
    const pick = await g.ask(p, { type: "option", prompt: `${s.def.name}: choose a color of mana to add`, options: opts, purpose: "manaColor", src: s });
    return opts.some(o => o.id === pick) ? pick : "R";
  }
  D({
    name: "Sarkhan Unbroken", cost: "{2}{G}{U}{R}", type: "Legendary Planeswalker — Sarkhan", loyalty: 4,
    text: "+1: Draw a card, then add one mana of any color.\n−2: Create a 4/4 red Dragon creature token with flying.\n−8: Search your library for any number of Dragon creature cards, put them onto the battlefield, then shuffle.",
    abilities: [
      {
        label: "+1: Draw a card, add one mana", loyalty: 1,
        do: async (g, s, ctx) => {
          drawLog(g, ctx.p, 1, s);
          const k = await chooseManaColor(g, ctx.p, s);
          ctx.p.pool[k]++;
          g.bump();
          g.log(`${ctx.p.name} adds {${k}} (Sarkhan Unbroken).`, { p: ctx.p, cards: [s.def.name] });
        }
      },
      {
        label: "−2: Create a 4/4 Dragon", loyalty: -2,
        do: (g, s, ctx) => g.createToken(ctx.p, TK.dragon4),
        ai: { use: (g, p, o) => myDragonsNow(g, p).length === 0 && (o.counters.loyalty || 0) >= 4 }
      },
      {
        label: "−8: Dragons onto the battlefield", loyalty: -8,
        do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, o) => o.def.types.includes("Creature") && isDragonDef(o.def), count: 99, to: "battlefield", prompt: "Sarkhan Unbroken: choose any number of Dragon creature cards", src: s }),
        ai: { use: () => true }
      }
    ],
    ai: { priority: 8, option: (g, p, req) => (req.purpose === "manaColor" ? neededColor(g, p) : undefined) }
  });

  /* ================================================================ artifacts */
  const talisman = (name, a, b) => D({
    name, cost: "{2}", type: "Artifact",
    text: `{T}: Add {C}.\n{T}: Add {${a}} or {${b}}. ${name} deals 1 damage to you.`,
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: [a, b], after: (g, o) => g.damage(o, o.controller, 1) }],
    ai: { ramp: true, priority: 8 }
  });
  talisman("Talisman of Impulse", "R", "G");
  talisman("Talisman of Indulgence", "B", "R");

  D({
    name: "Herald's Horn", cost: "{3}", type: "Artifact",
    text: "As Herald's Horn enters, choose a creature type.\nCreature spells you cast of the chosen type cost {1} less to cast.\nAt the beginning of your upkeep, look at the top card of your library. If it's a creature card of the chosen type, you may reveal it and put it into your hand.",
    note: "The creature type is chosen right after it enters.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => chooseCreatureType(g, p, s, "Herald's Horn: choose a creature type") },
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const top = p.library[0], t = s.state.chosenType;
          if (!top || !t || !top.def.types.includes("Creature")) return;
          if (!(top.def.subtypes.includes(t) || top.def.changeling)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: `Herald's Horn: reveal ${top.def.name} and put it into your hand?`, src: s, purpose: "heraldReveal" });
          if (!ok || top.zone !== "library") return;
          g.moveTo(top, "hand");
          g.log(`${p.name} reveals ${top.def.name} and puts it into their hand (Herald's Horn).`, { p, cards: [top.def.name] });
        }
      }
    ],
    statics: [{ costMod: (g, s, card) => (s.state.chosenType && card.def.types.includes("Creature") && (card.def.subtypes.includes(s.state.chosenType) || card.def.changeling) ? 1 : 0) }],
    ai: { priority: 7, ramp: true, option: (g, p, req) => (req.purpose === "creatureType" ? "Dragon" : undefined) }
  });

  D({
    name: "Urza's Incubator", cost: "{3}", type: "Artifact",
    text: "As Urza's Incubator enters, choose a creature type.\nCreature spells of the chosen type cost {2} less to cast.",
    note: "The creature type is chosen right after it enters. The engine only makes its controller's spells cheaper.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => chooseCreatureType(g, p, s, "Urza's Incubator: choose a creature type") }],
    statics: [{ costMod: (g, s, card) => (s.state.chosenType && card.def.types.includes("Creature") && (card.def.subtypes.includes(s.state.chosenType) || card.def.changeling) ? 2 : 0) }],
    ai: { priority: 8, ramp: true, option: (g, p, req) => (req.purpose === "creatureType" ? "Dragon" : undefined) }
  });

  D({
    name: "Dragon's Hoard", cost: "{3}", type: "Artifact",
    text: "Whenever a Dragon you control enters, put a gold counter on Dragon's Hoard.\n{T}, Remove a gold counter from Dragon's Hoard: Draw a card.\n{T}: Add one mana of any color.",
    triggers: [{ on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"), do: (g, s) => g.addCounters(s, "gold", 1, s) }],
    mana: [{ tap: true, produce: "any5" }],
    abilities: [{
      label: "Draw a card", tap: true, removeCounters: { kind: "gold", n: 1 },
      do: (g, s, ctx) => drawLog(g, ctx.p, 1, s),
      ai: { use: (g, p, o, ctx) => (ctx.window === "end" && !!ctx.turnOf && g.nextPlayer(ctx.turnOf) === p) || (ctx.window === "main2" && p.hand.length <= 1) }
    }],
    ai: { priority: 7, ramp: true }
  });

  function bootsTarget(g, p, opts) {
    const score = c => (c.sick && !g.kw(c, "haste") ? 10 : 0) + g.power(c) + (isDragon(g, c) ? 3 : 0) + (c.isCommander ? 4 : 0) - (c.def.mana.length && g.power(c) <= 1 ? 20 : 0);
    return opts.slice().sort((a, b) => score(b) - score(a))[0];
  }
  D({
    name: "Swiftfoot Boots", cost: "{2}", type: "Artifact — Equipment",
    text: "Equipped creature has hexproof and haste.\nEquip {1}",
    equip: "{1}",
    statics: [{ applies: (g, s, o) => s.attachedTo === o, kw: ["hexproof", "haste"] }],
    ai: {
      priority: 5,
      equipTarget: (g, p, opts) => bootsTarget(g, p, opts),
      /* Move the Boots to a big creature that just arrived, so it can attack this turn. */
      plan: (g, p, o, { window, actions }) => {
        if (window !== "main1" || o.zone !== "battlefield" || !o.attachedTo || o.attachedTo.sick) return null;
        if (!actions.some(a => a.type === "activate" && a.card === o && a.idx === 600)) return null;
        const fresh = g.creatures(p).filter(c => c !== o.attachedTo && c.sick && !g.kw(c, "haste") && !g.kw(c, "defender") && g.power(c) >= 4);
        return fresh.length ? { type: "activate", card: o, idx: 600 } : null;
      }
    }
  });

  /* ================================================================ enchantments */
  D({
    name: "Dragon Tempest", cost: "{1}{R}", type: "Enchantment",
    text: "Whenever a creature you control with flying enters, it gains haste until end of turn.\nWhenever a Dragon you control enters, it deals X damage to any target, where X is the number of Dragons you control.",
    triggers: [
      {
        on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.isCreature(ev.o) && g.kw(ev.o, "flying"),
        do: (g, s, ev) => { if (ev.o.zone === "battlefield") g.grant(ev.o, ["haste"]); }
      },
      { on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.hasSub(ev.o, "Dragon"), do: (g, s, ev, { p }) => dragonBlast(g, p, ev.o, s) }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Crucible of Fire", cost: "{3}{R}", type: "Enchantment",
    text: "Dragon creatures you control get +3/+3.",
    statics: [{ applies: (g, s, o) => o.controller === s.controller && isDragonDef(o.def) && g.isCreature(o), pt: [3, 3] }],
    ai: { priority: 6 }
  });

  D({
    name: "Kindred Discovery", cost: "{3}{U}{U}", type: "Enchantment",
    text: "As Kindred Discovery enters, choose a creature type.\nWhenever a creature you control of the chosen type enters or attacks, draw a card.",
    note: "The creature type is chosen right after it enters.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => chooseCreatureType(g, p, s, "Kindred Discovery: choose a creature type") },
      { on: "enters", when: (g, s, ev) => ev.o !== s && ev.o.controller === s.controller && g.isCreature(ev.o) && chosenType(g, s, ev.o), do: (g, s, ev, { p }) => drawLog(g, p, 1, s) },
      { on: "attacks", when: (g, s, ev) => ev.o.controller === s.controller && chosenType(g, s, ev.o), do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }
    ],
    ai: { priority: 7, option: (g, p, req) => (req.purpose === "creatureType" ? "Dragon" : undefined) }
  });

  /* A creature spell's power on the stack is its printed power. */
  const spellPower = o => (o && o.def.pt ? o.def.pt[0] : 0);
  const castCreature = (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.types.includes("Creature");
  D({
    name: "Sarkhan's Unsealing", cost: "{3}{R}", type: "Enchantment",
    text: "Whenever you cast a creature spell with power 4, 5, or 6, Sarkhan's Unsealing deals 4 damage to any target.\nWhenever you cast a creature spell with power 7 or greater, Sarkhan's Unsealing deals 4 damage to each opponent and each creature and planeswalker they control.",
    triggers: [
      {
        on: "cast", when: (g, s, ev) => castCreature(g, s, ev) && spellPower(ev.o) >= 4 && spellPower(ev.o) <= 6,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: 4, prompt: "Sarkhan's Unsealing deals 4 damage to" }), s);
          if (t) g.damage(s, t, 4);
        }
      },
      {
        on: "cast", when: (g, s, ev) => castCreature(g, s, ev) && spellPower(ev.o) >= 7,
        do: (g, s, ev, { p }) => {
          for (const q of g.opponents(p)) {
            g.damage(s, q, 4);
            for (const o of g.battlefield.filter(x => x.controller === q && (g.isCreature(x) || g.isPlaneswalker(x)))) g.damage(s, o, 4);
          }
        }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Temur Ascendancy", cost: "{G}{U}{R}", type: "Enchantment",
    text: "Creatures you control have haste.\nWhenever a creature with power 4 or greater you control enters, you may draw a card.",
    statics: [{ applies: (g, s, o) => o.controller === s.controller && g.isCreature(o), kw: ["haste"] }],
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o.controller === s.controller && g.isCreature(ev.o) && g.power(ev.o) >= 4,
      optional: "Temur Ascendancy: draw a card?",
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    /* The draws are optional: skip them once the library gets short (big Dragon attacks draw a lot). */
    ai: { priority: 7, confirm: (g, p) => p.hand.length < 8 && p.library.length > 12 + 2 * dragonCount(g, p) }
  });

  /* ================================================================ instants */
  /* How much an opponent's spell on the stack is worth countering. */
  function spellWorth(g, p, item) {
    const d = item.o.def, ai = d.ai || {};
    let s = d.mv;
    if (ai.wipe) s += 10;
    if (ai.finisher) s += 8;
    const mineHit = item.targets.filter(t => t && !g.isPlayer(t) && t.kind !== "spell" && t.controller === p);
    if (mineHit.length) s += 3 + Math.max(...mineHit.map(t => valueOf(g, t))) * 0.6;
    if (item.targets.some(t => t && t.kind === "spell" && t.p === p)) s += 6;
    if (item.o.isCommander) s += 3;
    if (ai.tutor) s += 2;
    return s;
  }
  /* Fierce Guardianship: counter a noncreature spell worth it (free when our commander is out). */
  function guardianshipPlan(g, p, o, { window, actions }) {
    if (window !== "stack" || o.zone !== "hand") return null;
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p || top.o.def.types.includes("Creature")) return null;
    const ways = actions.filter(a => a.type === "cast" && a.card === o);
    if (!ways.length) return null;
    const way = ways.find(a => a.alt) || ways[0];
    if (spellWorth(g, p, top) < (way.alt ? 5 : 7)) return null;
    return { type: "cast", card: o, targets: [top], alt: way.alt };
  }

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
    ai: { removal: true, minThreat: 6 }
  });

  D({
    name: "Anguished Unmaking", cost: "{1}{W}{B}", type: "Instant",
    text: "Exile target nonland permanent. You lose 3 life.",
    spell: {
      targets: [{ kind: "nonland", purpose: "harm", prompt: "Exile" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], ctx.o); g.loseLife(ctx.p, 3, ctx.o); }
    },
    ai: { removal: true, minThreat: 6 }
  });

  D({
    name: "Assassin's Trophy", cost: "{B}{G}", type: "Instant",
    text: "Destroy target permanent an opponent controls. Its controller may search their library for a basic land card, put it onto the battlefield, then shuffle.",
    spell: {
      targets: [{ kind: "permanent", opp: true, purpose: "harm", prompt: "Destroy" }],
      do: async (g, ctx) => {
        if (!ctx.legal[0]) return;
        const t = ctx.targets[0], who = t.controller;
        g.destroy(t, ctx.o);
        const ok = await g.ask(who, { type: "confirm", prompt: "Assassin's Trophy: search your library for a basic land card?", src: ctx.o, purpose: "trophyLand" });
        if (ok) await g.search(who, { filter: (g2, o) => g2.isBasic(o) && o.def.types.includes("Land"), to: "battlefield", prompt: "Choose a basic land card", src: ctx.o });
      }
    },
    ai: { removal: true, minThreat: 5 }
  });

  D({
    name: "Utter End", cost: "{2}{W}{B}", type: "Instant",
    text: "Exile target nonland permanent.",
    spell: {
      targets: [{ kind: "nonland", purpose: "harm", prompt: "Exile" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], ctx.o); }
    },
    ai: { removal: true, minThreat: 5 }
  });

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

  D({
    name: "Fierce Guardianship", cost: "{2}{U}", type: "Instant",
    text: "If you control a commander, you may cast this spell without paying its mana cost.\nCounter target noncreature spell.",
    altCosts: [{ label: "Free (you control a commander)", cost: "", condition: (g, p) => g.battlefield.some(o => o.controller === p && o.isCommander) }],
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target noncreature spell", filter: (g, item) => !item.o.def.types.includes("Creature") }],
      do: (g, ctx) => { const t = ctx.targets[0]; if (ctx.legal[0] && t && !t.o.def.types.includes("Creature")) g.counterSpell(t, ctx.o); }
    },
    ai: { priority: 8, cast: () => false, plan: guardianshipPlan }
  });

  D({
    name: "Counterspell", cost: "{U}{U}", type: "Instant",
    text: "Counter target spell.",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target spell" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.counterSpell(ctx.targets[0], ctx.o); }
    },
    ai: { counter: true }
  });

  D({
    name: "Sarkhan's Triumph", cost: "{2}{R}", type: "Instant",
    text: "Search your library for a Dragon creature card, reveal it, put it into your hand, then shuffle.",
    spell: { do: (g, ctx) => smartSearch(g, ctx.p, { filter: (g2, o) => o.def.types.includes("Creature") && isDragonDef(o.def), to: "hand", prompt: "Sarkhan's Triumph: choose a Dragon creature card", src: ctx.o }, tutorScore) },
    ai: { tutor: true, instantEnd: true, priority: 6 }
  });

  /* ================================================================ sorceries */
  const rampLandScore = (g, p, c) => landPickScore(g, p, c, false, colorSources(g, p));

  D({
    name: "Three Visits", cost: "{1}{G}", type: "Sorcery",
    text: "Search your library for a Forest card, put it onto the battlefield, then shuffle.",
    spell: { do: (g, ctx) => smartSearch(g, ctx.p, { filter: (g2, o) => o.def.types.includes("Land") && o.def.subtypes.includes("Forest"), to: "battlefield", prompt: "Three Visits: choose a Forest card", src: ctx.o }, rampLandScore) },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Kodama's Reach", cost: "{2}{G}", type: "Sorcery — Arcane",
    text: "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const pool = p.library.filter(o => g.isBasic(o) && o.def.types.includes("Land"));
        let picks = [];
        if (pool.length) picks = (await g.ask(p, { type: "cards", prompt: "Kodama's Reach: choose up to two basic lands. The first goes onto the battlefield tapped, the second into your hand.", options: pool, min: 0, max: 2, purpose: "cultivate", src: ctx.o })) || [];
        picks = picks.filter(o => pool.includes(o)).slice(0, 2);
        if (picks[0]) g.putOntoBattlefield([picks[0]], p, { tapped: true });
        if (picks[1]) g.moveTo(picks[1], "hand");
        g.shuffle(p);
        g.log(picks.length ? `${p.name} finds ${picks.map(o => o.def.name).join(" and ")}.` : `${p.name} finds no basic land.`, { p, kind: "search" });
      }
    },
    ai: { ramp: true, priority: 9 }
  });

  D({
    name: "Demonic Tutor", cost: "{1}{B}", type: "Sorcery",
    text: "Search your library for a card, put that card into your hand, then shuffle.",
    spell: { do: (g, ctx) => smartSearch(g, ctx.p, { filter: () => true, to: "hand", hidden: true, prompt: "Demonic Tutor: choose a card", src: ctx.o }, tutorScore) },
    ai: { tutor: true, priority: 7 }
  });

  D({
    name: "Vindicate", cost: "{1}{W}{B}", type: "Sorcery",
    text: "Destroy target permanent.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Destroy" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
    },
    ai: { removal: true, minThreat: 5 }
  });

  /* Toxic Deluge: the X that kills the most opposing creature value while sparing ours
     (most of our Dragons have toughness 4 or more). */
  function delugePlan(g, p) {
    const creatures = g.battlefield.filter(c => g.isCreature(c));
    const maxX = Math.min(15, p.life - 10);
    let best = { x: 0, net: 0 };
    for (let x = 1; x <= maxX; x++) {
      let net = -x * 0.4;
      for (const c of creatures) {
        if (g.toughness(c) > x) continue;
        const v = Math.max(1, valueOf(g, c));
        net += c.controller === p ? -1.5 * v : v;
      }
      if (net > best.net) best = { x, net };
    }
    return best;
  }
  D({
    name: "Toxic Deluge", cost: "{2}{B}", type: "Sorcery",
    text: "As an additional cost to cast this spell, pay X life.\nAll creatures get -X/-X until end of turn.",
    note: "X is chosen and the life paid as the spell resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const options = [];
        for (let x = 0; x <= Math.min(p.life, 20); x++) options.push({ id: x, label: `X = ${x}` });
        const x = +(await g.ask(p, { type: "option", prompt: "Toxic Deluge: pay X life, then all creatures get -X/-X", options, purpose: "delugeX", src: ctx.o })) || 0;
        if (x <= 0 || !g.payLife(p, x)) { g.log(`${p.name} pays no life for Toxic Deluge.`, { p, cards: [ctx.o.def.name] }); return; }
        g.log(`${p.name} pays ${x} life. All creatures get -${x}/-${x} until end of turn.`, { p, cards: [ctx.o.def.name], kind: "big" });
        g.addEffect({ objs: g.battlefield.filter(c => g.isCreature(c)), pt: [-x, -x] });
      }
    },
    ai: {
      cast: (g, p) => { const b = delugePlan(g, p); return b.x > 0 && b.net >= 12 ? 25 : false; },
      option: (g, p, req) => (req.purpose === "delugeX" ? delugePlan(g, p).x : undefined)
    }
  });

  D({
    name: "Crux of Fate", cost: "{3}{B}{B}", type: "Sorcery",
    text: "Choose one —\n• Destroy all non-Dragon creatures.\n• Destroy all Dragon creatures.",
    modes: [
      {
        label: "Destroy all non-Dragon creatures",
        do: (g, ctx) => { const n = g.destroyAll(g.battlefield.filter(o => g.isCreature(o) && !g.hasSub(o, "Dragon"))); g.log(`${n} non-Dragon creature${n === 1 ? "" : "s"} destroyed.`, { p: ctx.p }); }
      },
      {
        label: "Destroy all Dragon creatures",
        do: (g, ctx) => { const n = g.destroyAll(g.battlefield.filter(o => g.isCreature(o) && g.hasSub(o, "Dragon"))); g.log(`${n} Dragon${n === 1 ? "" : "s"} destroyed.`, { p: ctx.p }); }
      }
    ],
    ai: { wipe: true, priority: 10, spares: o => isDragonDef(o.def), mode: () => 0 }
  });

  function bestFreeCast(g, p, opts) {
    const ok = opts.filter(c => {
      const ai = c.def.ai || {};
      if (c.def.costObj.x || ai.counter || ai.protection || ai.never) return false;
      if (ai.removal) { const spec = (c.def.spell && c.def.spell.targets || [])[0]; return !!spec && g.targetOptions(p, spec, c).some(t => !g.isPlayer(t) && t.controller !== p && threatOf(g, t, p) >= (ai.minThreat || 3)); }
      return true;
    });
    const score = c => c.def.mv + (isDragonDef(c.def) ? 2 : 0) + (c.def.types.includes("Creature") ? 1 : 0);
    return ok.sort((a, b) => score(b) - score(a))[0] || null;
  }
  D({
    name: "Rishkar's Expertise", cost: "{4}{G}{G}", type: "Sorcery",
    text: "Draw cards equal to the greatest power among creatures you control.\nYou may cast a spell with mana value 5 or less from your hand without paying its mana cost.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        drawLog(g, p, Math.max(0, greatestPower(g, p)), ctx.o);
        const opts = p.hand.filter(c => !c.def.types.includes("Land") && c.def.mv <= 5);
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Rishkar's Expertise: you may cast a spell with mana value 5 or less without paying its mana cost", options: opts, optional: true, purpose: "freeCast", src: ctx.o });
        if (pick && pick.zone === "hand") await g.castWithoutPaying(p, pick);
      }
    },
    ai: {
      draw: true, priority: 7,
      cast: (g, p) => greatestPower(g, p) >= 4,
      target: (g, p, req) => (req.purpose === "freeCast" ? bestFreeCast(g, p, req.options) : undefined)
    }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const article = w => (/^[AEIOU]/.test(w) ? "an" : "a");

  land("Island", { type: "Basic Land — Island", text: "({T}: Add {U}.)", mana: [{ tap: true, produce: "U" }] });
  land("Swamp", { type: "Basic Land — Swamp", text: "({T}: Add {B}.)", mana: [{ tap: true, produce: "B" }] });
  land("Mountain", { type: "Basic Land — Mountain", text: "({T}: Add {R}.)", mana: [{ tap: true, produce: "R" }] });

  land("City of Brass", {
    text: "Whenever City of Brass becomes tapped, it deals 1 damage to you.\n{T}: Add one mana of any color.",
    note: "It deals the damage when it's tapped for mana, the only way it gets tapped in this game.",
    mana: [{ tap: true, produce: "any5", after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  land("Mana Confluence", {
    text: "{T}, Pay 1 life: Add one mana of any color.",
    note: "The automatic mana payment pays the life. It isn't tapped while you're at 1 life.",
    mana: [{ tap: true, produce: "any5", condition: (g, o) => o.controller.life > 1, after: (g, o) => g.payLife(o.controller, 1) }]
  });

  /* Shock lands: pay 2 life as it enters, or it enters tapped. */
  function shockWanted(g, p, s) {
    if (g.active !== p || !(g.phase === "main1" || g.phase === "main2") || p.life <= 5) return false;
    return spellCards(p).some(c => {
      const cost = g.spellCost(p, c);
      return g.canPay(p, cost) && !g.canPay(p, cost, { exclude: [s.id] });
    });
  }
  const shockTrigger = {
    on: "enters", self: true,
    do: async (g, s, ev, { p }) => {
      if (s.zone !== "battlefield" || s.tapped) return;
      let paid = false;
      if (p.life >= 2) {
        const ok = await g.ask(p, { type: "confirm", prompt: `Pay 2 life so ${s.def.name} enters untapped?`, src: s, purpose: "shockPay" });
        if (ok) paid = g.payLife(p, 2);
      }
      if (paid) g.log(`${p.name} pays 2 life for ${s.def.name}.`, { p, cards: [s.def.name] });
      else g.tap(s);
    }
  };
  const shock = (name, a, b, types) => land(name, {
    type: "Land — " + types, shock: true,
    text: `({T}: Add {${a}} or {${b}}.)\nAs ${name} enters, you may pay 2 life. If you don't, it enters tapped.`,
    note: "You decide about the 2 life right after it enters, before anything else can happen.",
    mana: [{ tap: true, produce: [a, b] }],
    triggers: [shockTrigger],
    ai: { confirm: (g, p, req) => (req.purpose === "shockPay" ? shockWanted(g, p, req.src) : true) }
  });
  shock("Hallowed Fountain", "W", "U", "Plains Island");
  shock("Watery Grave", "U", "B", "Island Swamp");
  shock("Blood Crypt", "B", "R", "Swamp Mountain");
  shock("Stomping Ground", "R", "G", "Mountain Forest");
  shock("Temple Garden", "G", "W", "Forest Plains");
  shock("Godless Shrine", "W", "B", "Plains Swamp");
  shock("Steam Vents", "U", "R", "Island Mountain");
  shock("Overgrown Tomb", "B", "G", "Swamp Forest");
  shock("Sacred Foundry", "R", "W", "Mountain Plains");
  shock("Breeding Pool", "G", "U", "Forest Island");

  const triome = (name, a, b, c, types) => land(name, {
    type: "Land — " + types, etbTapped: true,
    text: `({T}: Add {${a}}, {${b}}, or {${c}}.)\n${name} enters tapped.\nCycling {3} ({3}, Discard this card: Draw a card.)`,
    cycling: "{3}",
    mana: [{ tap: true, produce: [a, b, c] }]
  });
  triome("Ketria Triome", "G", "U", "R", "Forest Island Mountain");
  triome("Raugrin Triome", "U", "R", "W", "Island Mountain Plains");
  triome("Savai Triome", "R", "W", "B", "Mountain Plains Swamp");
  triome("Zagoth Triome", "B", "G", "U", "Swamp Forest Island");
  triome("Ziatora's Proving Ground", "B", "R", "G", "Swamp Mountain Forest");
  triome("Jetmir's Garden", "R", "G", "W", "Mountain Forest Plains");
  triome("Xander's Lounge", "U", "B", "R", "Island Swamp Mountain");

  /* Fetch lands: the bots crack them in their own main phase and pick the land that fits best. */
  const fetchWanted = (g, p) => g.active === p && (g.phase === "main1" || g.phase === "main2") && needsOneMore(g, p);
  const fetch = (name, a, b) => land(name, {
    fetchTypes: [a, b],
    text: `{T}, Pay 1 life, Sacrifice ${name}: Search your library for ${article(a)} ${a} or ${b} card, put it onto the battlefield, then shuffle.`,
    abilities: [{
      label: `Find ${article(a)} ${a} or ${b}`, tap: true, payLife: 1, sacSelf: true,
      do: async (g, s, ctx) => {
        const p = ctx.p, want = fetchWanted(g, p), have = colorSources(g, p);
        await smartSearch(g, p, { filter: fetchFilter([a, b]), to: "battlefield", prompt: `Choose ${article(a)} ${a} or ${b} card`, src: s }, (g2, p2, c) => landPickScore(g2, p2, c, want, have));
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && p.life > 2 }
    }],
    ai: {
      plan: (g, p, o, { window }) => (o.zone === "battlefield" && !o.tapped && o.controller === p && p.life > 2 && g.active === p && (window === "main1" || window === "main2") ? { type: "activate", card: o, idx: 0 } : null)
    }
  });
  fetch("Flooded Strand", "Plains", "Island");
  fetch("Polluted Delta", "Island", "Swamp");
  fetch("Bloodstained Mire", "Swamp", "Mountain");
  fetch("Wooded Foothills", "Mountain", "Forest");
  fetch("Windswept Heath", "Forest", "Plains");
  fetch("Scalding Tarn", "Island", "Mountain");
  fetch("Verdant Catacombs", "Swamp", "Forest");
  fetch("Arid Mesa", "Mountain", "Plains");

  /* ================================================================ the deck */
  const singles = [
    // Dragons
    "Scourge of Valkas", "Terror of the Peaks", "Utvara Hellkite", "Old Gnawbone", "Lathliss, Dragon Queen",
    "Miirym, Sentinel Wyrm", "Dragonlord Ojutai", "Dragonlord Atarka", "Atarka, World Render", "Tiamat",
    "Korvold, Fae-Cursed King", "Goldspan Dragon", "Thundermaw Hellkite", "Glorybringer", "Balefire Dragon",
    "Ancient Copper Dragon", "Ancient Gold Dragon", "Ancient Bronze Dragon", "Lozhan, Dragons' Legacy",
    "Bladewing the Risen", "Verix Bladewing", "Dragonlord Kolaghan", "Broodmate Dragon",
    // other creatures and a planeswalker
    "Birds of Paradise", "Noble Hierarch", "Ignoble Hierarch", "Draconic Disciple", "Dragonlord's Servant",
    "Dragonspeaker Shaman", "Dragonmaster Outcast", "Sarkhan Unbroken",
    // artifacts
    "Sol Ring", "Arcane Signet", "Talisman of Impulse", "Talisman of Indulgence", "Herald's Horn", "Urza's Incubator", "Dragon's Hoard", "Swiftfoot Boots",
    // enchantments
    "Dragon Tempest", "Crucible of Fire", "Kindred Discovery", "Temur Ascendancy", "Sarkhan's Unsealing",
    // instants
    "Swords to Plowshares", "Path to Exile", "Chaos Warp", "Anguished Unmaking", "Beast Within", "Assassin's Trophy",
    "Utter End", "Heroic Intervention", "Fierce Guardianship", "Counterspell", "Sarkhan's Triumph",
    // sorceries
    "Farseek", "Nature's Lore", "Three Visits", "Cultivate", "Kodama's Reach", "Demonic Tutor", "Vindicate",
    "Toxic Deluge", "Crux of Fate", "Rishkar's Expertise",
    // lands
    "Command Tower", "City of Brass", "Mana Confluence",
    "Hallowed Fountain", "Watery Grave", "Blood Crypt", "Stomping Ground", "Temple Garden",
    "Godless Shrine", "Steam Vents", "Overgrown Tomb", "Sacred Foundry", "Breeding Pool",
    "Ketria Triome", "Raugrin Triome", "Savai Triome", "Zagoth Triome", "Ziatora's Proving Ground", "Jetmir's Garden", "Xander's Lounge",
    "Flooded Strand", "Polluted Delta", "Bloodstained Mire", "Wooded Foothills", "Windswept Heath", "Scalding Tarn", "Verdant Catacombs", "Arid Mesa"
  ];
  const basics = { Mountain: 2, Forest: 1, Island: 1, Swamp: 1, Plains: 1 };
  const list = singles.slice();
  for (const n in basics) for (let i = 0; i < basics[n]; i++) list.push(n);

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "urdragon", name: "Ur-Dragon", title: "The Ur-Dragon", commander: "The Ur-Dragon",
    identity: ["W", "U", "B", "R", "G"], bracket: 4, aggression: 0.6,
    style: "Dragon ramp",
    blurb: "Ramps into huge flying Dragons that The Ur-Dragon makes cheaper, draws a card for every Dragon that attacks, and burns the table each time another Dragon arrives.",
    watch: ["The Ur-Dragon", "Scourge of Valkas", "Terror of the Peaks", "Utvara Hellkite", "Miirym, Sentinel Wyrm"],
    list
  });
})(typeof window !== "undefined" ? window : globalThis);
