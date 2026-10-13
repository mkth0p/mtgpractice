/* The Fantastic Four: a "between Bracket 3 and Bracket 4" bot deck built on the retail "The Fantastic
   Four" precon (Marvel Super Heroes Commander, 2026), Temur plus white (RGWU).
   How it plays: noncreature spells first. Mister Fantastic, Invisible Woman, Human Torch, The Thing,
   Lockjaw, Alicia Masters, Council of Reeds and Franklin Richards all pay off "at the beginning of
   combat on your turn, if you've cast a noncreature spell this turn", so the deck's brain casts a
   cheap noncreature spell (a cantrip, a rock, a ramp spell) in the first main phase before combat.
   The Fantastic Four themselves trigger on every spell with power, toughness or mana value 4
   (3 damage to each opponent, a card, two +1/+1 counters or a 0/4 Wall), and Annie Joins Up and
   Mister Fantastic make the team's legendary triggers happen again. Valeria, Medusa, Namor, Crystal,
   Black Bolt, The Fantasticar, Whirlwind of Thought and Cosmic Crucible reward every noncreature
   spell, and rebound spells (Invisible Force Field, Fantastic Elasticity, It's Clobberin' Time!,
   Into the Time Vortex) count twice. Silver Surfer fetches Galactus for the top end.
   Upgrades over the retail list: a fetch/shock/triome mana base, Sol Ring and Talismans, cheap
   green ramp, Rhystic Study, Smothering Tithe, Cyclonic Rift and Fierce Guardianship (the four game
   changers), counterspells, efficient removal, board wipes and Aetherize against the wide decks,
   and a few strong four-power or four-mana staples (Questing Beast, Hero of Bladehold, Goldspan
   Dragon, Esika's Chariot) that also trigger the commander. No infinite combos, no extra turns.
   Cut from the retail list: the weakest and the clunkiest cards (Ultimate Nullification, Tragic
   Arrogance, Promise of Loyalty, Monologue Tax, Cut a Deal, Mind's Dilation, Mirage Mirror, Genesis
   Ultimatum, Seize the Day, Taunt from the Rampart, Willie Lumpkin, Dragon Man, Nova Flame, Flame On!...).
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AI = () => MK.AI || {};

  /* ================================================================ helpers */
  const FF = "The Fantastic Four", MF = "Mister Fantastic";
  const RGWU = "{R}{G}{W}{U}";
  const value = (g, o) => (AI().value ? AI().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AI().threat ? AI().threat(g, o, p) : value(g, o));
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isNC = o => !!o && !o.def.types.includes("Creature");
  const isIS = o => o.def.types.includes("Instant") || o.def.types.includes("Sorcery");
  /* Noncreature spells p cast this turn. */
  const ncCount = (g, p) => g.castThisTurn(p, e => e.nc);
  /* "Whenever you cast a noncreature spell" */
  const youCastNC = (g, s, ev) => ev.p === s.controller && isNC(ev.o);
  /* "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, ..." */
  const combatNC = (doFn, extra) => Object.assign({
    on: "beginCombat",
    when: (g, s, ev) => ev.p === s.controller,
    intervening: (g, s) => ncCount(g, s.controller) > 0,
    do: doFn
  }, extra || {});
  const opponentsOf = (g, p) => g.opponents(p).filter(q => !q.lost);
  const memo = new WeakMap();
  const M = p => { let m = memo.get(p); if (!m) { m = {}; memo.set(p, m); } return m; };
  function manaLeft(g, p) {
    const m = M(p);
    if (m.manaV !== g.v) { m.manaV = g.v; try { m.mana = g.maxX(p, MK.parseCost(""), 1); } catch (e) { m.mana = 0; } }
    return m.mana;
  }
  const canPayStr = (g, p, cost) => { try { return g.canPay(p, MK.parseCost(cost)); } catch (e) { return false; } };
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) log(g, `${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, p, [src.def.name]);
    return got;
  }
  /* "you may pay {R}{G}{W}{U}" inside a trigger */
  async function mayPay(g, p, s, prompt, purpose) {
    const cost = MK.parseCost(RGWU);
    if (!g.canPay(p, cost)) return false;
    const ok = await g.ask(p, { type: "confirm", prompt, purpose, src: s });
    if (!ok || !g.pay(p, cost)) return false;
    log(g, `${p.name} pays ${RGWU} (${s.def.name}).`, p, [s.def.name]);
    return true;
  }
  /* A spell with power, toughness or mana value 4 (The Fantastic Four). */
  function isFourSpell(item) {
    const d = item.o.def;
    const mv = d.mv + (item.x || 0) * ((d.costObj && d.costObj.x) || 0);
    if (mv === 4) return true;
    return Array.isArray(d.pt) && (d.types.includes("Creature") || d.subtypes.includes("Vehicle")) && (d.pt[0] === 4 || d.pt[1] === 4);
  }
  const myAttackers = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield" && a.combat) : []);
  const bestOf = (list, f) => list.slice().sort((a, b) => f(b) - f(a))[0] || null;

  /* ---------------- tokens */
  const WALL04 = MK.tokenDef({ key: "ff-wall04", name: "Wall", pt: [0, 4], colors: [], subtypes: ["Wall"], keywords: ["defender"] });
  const WALL03R = MK.tokenDef({ key: "ff-wall03reach", name: "Wall", pt: [0, 3], colors: [], subtypes: ["Wall"], keywords: ["defender", "reach"] });
  const MERFOLK = MK.tokenDef({ key: "ff-merfolk11u", name: "Merfolk", pt: [1, 1], colors: ["U"], subtypes: ["Merfolk"] });
  const OX = MK.tokenDef({ key: "ff-ox22w", name: "Ox", pt: [2, 2], colors: ["W"], subtypes: ["Ox"] });
  const CONSTRUCT = MK.tokenDef({ key: "ff-construct44", name: "Construct", types: ["Artifact", "Creature"], pt: [4, 4], colors: [], subtypes: ["Construct"], keywords: ["flying", "haste"] });

  /* ================================================================ the commander */
  const FF_MODES = [
    { label: "Create a 0/4 Wall with defender", do: (g, s, p) => g.createToken(p, WALL04) },
    { label: "Deal 3 damage to each opponent", do: (g, s, p) => { for (const q of opponentsOf(g, p)) g.damage(s, q, 3); } },
    { label: "Two +1/+1 counters on target creature", do: async (g, s, p) => {
      const t = await g.chooseTarget(p, { kind: "creature", purpose: "ffCounters", trigger: true, prompt: "The Fantastic Four: put two +1/+1 counters on target creature" }, s);
      if (t && t.zone === "battlefield") g.addCounters(t, "p1", 2, s);
    } },
    { label: "Draw a card", do: (g, s, p) => drawLog(g, p, 1, s) }
  ];
  function ffPick(g, p, ids) {
    const has = i => ids.includes(i);
    const opps = opponentsOf(g, p);
    if (has(1) && opps.some(q => q.life <= 3)) return 1;
    const incoming = g.battlefield.filter(o => o.controller !== p && g.isCreature(o)).reduce((t, o) => t + Math.max(0, g.power(o)), 0);
    if (has(0) && p.life <= 12 && incoming >= p.life / 2) return 0;
    if (has(1)) return 1;
    if (has(3) && p.library.length > 8) return 3;
    if (has(2) && g.creatures(p).length) return 2;
    if (has(0)) return 0;
    return ids[0];
  }
  async function ffCharm(g, s, p) {
    const st = s.state.ff && s.state.ff.turn === g.turn ? s.state.ff : (s.state.ff = { turn: g.turn, used: [] });
    const opts = FF_MODES.map((m, i) => ({ id: i, label: m.label })).filter(m => !st.used.includes(m.id));
    if (!opts.length) { log(g, "The Fantastic Four: every mode was already chosen this turn.", p, [FF]); return; }
    let id = await g.ask(p, { type: "option", prompt: "The Fantastic Four: choose one that hasn't been chosen this turn", options: opts, purpose: "ffMode", src: s });
    if (!opts.some(m => m.id === id)) id = opts[0].id;
    st.used.push(id);
    log(g, `The Fantastic Four: ${FF_MODES[id].label.toLowerCase()}.`, p, [FF]);
    await FF_MODES[id].do(g, s, p);
  }
  D({
    name: FF, cost: "{R}{G}{W}{U}", type: "Legendary Creature — Human Hero", pt: "4/4",
    text: "When The Fantastic Four enter and whenever you cast a spell with power, toughness, or mana value 4, choose one that hasn't been chosen this turn.\n• Create a 0/4 colorless Wall creature token with defender.\n• The Fantastic Four deal 3 damage to each opponent.\n• Put two +1/+1 counters on target creature.\n• Draw a card.",
    note: "The mode (and the creature for the counters) is chosen as the ability resolves.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => ffCharm(g, s, p) },
      { on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.item && isFourSpell(ev.item), do: (g, s, ev, { p }) => ffCharm(g, s, p) }
    ],
    ai: {
      priority: 8, threat: 1,
      option: (g, p, req) => (req.purpose === "ffMode" ? ffPick(g, p, req.options.map(o => o.id)) : undefined),
      target: (g, p, req) => (req.purpose === "ffCounters" ? counterHost(g, p, req.options) : undefined)
    }
  });
  /* The creature that gets the most from +1/+1 counters: evasive, big, ours. */
  function counterHost(g, p, options) {
    const own = options.filter(c => !g.isPlayer(c) && c.controller === p && g.isCreature(c) && !g.kw(c, "defender"));
    const sc = c => Math.max(0, g.power(c)) + (g.kw(c, "flying") ? 4 : 0) + (g.kw(c, "trample") ? 2 : 0) + (c.def.legendary ? 2 : 0) - (c.isToken ? 2 : 0);
    return bestOf(own, sc) || options.find(c => !g.isPlayer(c) && c.controller === p) || options[0];
  }

  /* ================================================================ the Fantastic Four */
  /* Mister Fantastic's boost: the chosen legendary creature's next triggered ability this turn
     triggers two additional times (a stand-in for "copy target triggered ability twice"). */
  const MF_BOOST = {
    triggerExtra: (g, s, f) => {
      const src = f.src;
      if (!src || src.emblem || !src.state || f.controller !== s.controller) return 0;
      const b = src.state.mfBoost;
      if (!b || b.turn !== g.turn || src.zone !== "battlefield") return 0;
      delete src.state.mfBoost;
      log(g, `Mister Fantastic copies ${src.def.name}'s triggered ability twice.`, s.controller, [MF, src.def.name]);
      return 2;
    }
  };
  /* The legendary creature whose next trigger is worth three: begin-combat payoffs first. */
  const BOOST_ORDER = ["Franklin Richards, Ascendant", "The Thing", "Council of Reeds", "Invisible Woman", "Alicia Masters, Skilled Sculptor", MF, "Lockjaw, Slobbering Teleporter"];
  function boostTarget(g, p, options) {
    const opts = (options || g.creatures(p)).filter(c => !g.isPlayer(c) && c.controller === p && c.def.legendary && !(c.state.mfBoost && c.state.mfBoost.turn === g.turn));
    if (g.active === p && g.phase === "main1" && ncCount(g, p) > 0) {
      for (const n of BOOST_ORDER) { const c = opts.find(o => o.def.name === n); if (c) return c; }
    }
    const ff = opts.find(o => o.def.name === FF);
    if (ff && fourSpellReady(g, p, 4)) return ff;
    return null;
  }
  /* A spell in hand that triggers The Fantastic Four and that p could still cast after spending `spend`. */
  function fourSpellReady(g, p, spend) {
    const left = manaLeft(g, p) - spend;
    return p.hand.some(c => !c.def.types.includes("Land") && isFourSpell({ o: c, x: 0 }) && c.def.mv <= left);
  }
  D({
    name: MF, cost: "{2}{U}", type: "Legendary Creature — Human Scientist Hero", pt: "2/4",
    keywords: ["vigilance", "reach"],
    text: "Vigilance, reach\nAt the beginning of combat on your turn, if you've cast a noncreature spell this turn, draw a card.\n{R}{G}{W}{U}, {T}: Copy target triggered ability you control twice. You may choose new targets for the copies.",
    note: "The copy ability is simplified: it targets a legendary creature you control, and the next triggered ability of that creature this turn triggers two additional times.",
    statics: [MF_BOOST],
    triggers: [combatNC((g, s, ev, { p }) => drawLog(g, p, 1, s))],
    abilities: [{
      label: "Copy its next trigger twice", cost: RGWU, tap: true,
      targets: [{ kind: "creature", you: true, purpose: "mfBoost", prompt: "Mister Fantastic: the next triggered ability of this legendary creature this turn triggers twice more", filter: (g, o) => o.def.legendary }],
      do: (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t) return;
        t.state.mfBoost = { turn: g.turn };
        log(g, `Mister Fantastic will copy ${t.def.name}'s next triggered ability twice this turn.`, ctx.p, [MF, t.def.name]);
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !!boostTarget(g, p) }
    }],
    ai: {
      priority: 7, threat: 1,
      target: (g, p, req) => (req.purpose === "mfBoost" ? boostTarget(g, p, req.options) || req.options[0] : undefined)
    }
  });

  D({
    name: "Invisible Woman", cost: "{2}{W}", type: "Legendary Creature — Human Hero", pt: "3/3",
    text: "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a 0/3 colorless Wall creature token with defender and reach.\nWhenever you attack, you may pay {R}{G}{W}{U}. When you do, target creature gets +1/+0 until end of turn for each creature you control and can't be blocked this turn.",
    triggers: [
      combatNC((g, s, ev, { p }) => g.createToken(p, WALL03R)),
      { on: "attack", when: (g, s, ev) => ev.p === s.controller, do: async (g, s, ev, { p }) => {
        if (!myAttackers(g, p).length) return;
        if (!await mayPay(g, p, s, `Invisible Woman: pay ${RGWU} to make a creature bigger and unblockable?`, "ffPay")) return;
        const t = await g.chooseTarget(p, { kind: "creature", purpose: "iwBoost", trigger: true, prompt: "Invisible Woman: target creature gets +1/+0 for each creature you control and can't be blocked" }, s);
        if (!t || t.zone !== "battlefield") return;
        const n = g.creatures(p).length;
        g.addEffect({ objs: [t], pt: [n, 0], unblockable: true });
        log(g, `${t.def.name} gets +${n}/+0 and can't be blocked this turn.`, p, [s.def.name, t.def.name]);
      } }
    ],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.purpose !== "iwBoost") return undefined;
        const at = myAttackers(g, p).filter(a => req.options.includes(a));
        return bestOf(at, a => Math.max(0, g.power(a)) + (g.kw(a, "double strike") ? 4 : 0) + (g.kw(a, "flying") ? -1 : 0)) || req.options.find(o => o.controller === p) || req.options[0];
      }
    }
  });

  D({
    name: "Human Torch", cost: "{3}{R}", type: "Legendary Creature — Human Hero", pt: "3/2",
    text: "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, Human Torch gains flying, double strike, and haste until end of turn.\nWhenever Human Torch attacks, you may pay {R}{G}{W}{U}. If you do, until end of turn, whenever he deals combat damage to an opponent, he deals that much damage to each other opponent.",
    triggers: [
      combatNC((g, s) => { if (s.zone !== "battlefield") return; g.grant([s], ["flying", "double strike", "haste"]); log(g, "Human Torch flames on: flying, double strike and haste until end of turn.", s.controller, [s.def.name]); }),
      { on: "attacks", self: true, do: async (g, s, ev, { p }) => {
        if (await mayPay(g, p, s, `Human Torch: pay ${RGWU} so his combat damage to an opponent hits each other opponent too?`, "ffPay")) s.state.torch = g.turn;
      } },
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && s.state.torch === g.turn && ev.p !== s.controller, do: (g, s, ev, { p }) => {
        for (const q of opponentsOf(g, p)) if (q !== ev.p) g.damage(s, q, ev.amount);
      } }
    ],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "The Thing", cost: "{5}{G}", type: "Legendary Creature — Human Hero", pt: "5/5",
    keywords: ["trample"],
    text: "Trample\nAt the beginning of combat on your turn, if you've cast a noncreature spell this turn, put four +1/+1 counters on The Thing.\nWhenever The Thing attacks, you may pay {R}{G}{W}{U}. When you do, double the number of each kind of counter on any number of target permanents you control.",
    note: "The doubling affects every permanent you control that has counters.",
    triggers: [
      combatNC((g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 4, s); }),
      { on: "attacks", self: true, do: async (g, s, ev, { p }) => {
        const has = g.battlefield.filter(o => o.controller === p && Object.values(o.counters || {}).some(n => n > 0));
        if (!has.length) return;
        if (!await mayPay(g, p, s, `The Thing: pay ${RGWU} to double the counters on your permanents?`, "ffPay")) return;
        for (const o of has) for (const [k, n] of Object.entries(o.counters)) if (n > 0 && o.zone === "battlefield") g.addCounters(o, k, n, s);
        log(g, `${p.name} doubles the counters on ${has.length} permanent${has.length === 1 ? "" : "s"}.`, p, [s.def.name]);
      } }
    ],
    ai: { priority: 6, threat: 1 }
  });

  /* ================================================================ Galactus and his herald */
  const GALACTUS = "Galactus, Devourer of Worlds", SURFER = "Silver Surfer, Galactus's Herald";
  D({
    name: SURFER, cost: "{5}", type: "Legendary Creature — Alien Hero", pt: "4/5",
    keywords: ["flying"],
    text: "Flying\nWhen Silver Surfer enters, you may search your library for a card named Galactus, Devourer of Worlds, reveal it, put it into your hand, then shuffle.\nWhenever Silver Surfer deals combat damage to a player, until the end of your next turn, target creature attacks that player each combat if able.",
    note: "The creature that must attack is chosen among that player's opponents' creatures (an opponent's, when there is one).",
    triggers: [
      { on: "enters", self: true, optional: "Silver Surfer: search your library for Galactus, Devourer of Worlds?", do: (g, s, ev, { p }) => g.search(p, { filter: (g2, c) => c.def.name === GALACTUS, count: 1, to: "hand", prompt: "Search for Galactus, Devourer of Worlds" }) },
      { on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && ev.p !== s.controller, do: async (g, s, ev, { p }) => {
        const who = ev.p;
        const t = await g.chooseTarget(p, { kind: "creature", purpose: "surfer", trigger: true, prompt: `Silver Surfer: target creature attacks ${who.name} each combat if able`, filter: (g2, o) => o.controller !== who }, s);
        if (!t || t.zone !== "battlefield") return;
        t.state.mustAttack = who;
        const zc = t.zc;
        log(g, `${t.def.name} attacks ${who.name} each combat if able until the end of ${p.name}'s next turn.`, p, [s.def.name, t.def.name]);
        g.delayed.push({ at: "endStep", once: true, player: p, controller: p, turn: g.turn + 1, src: s, do: () => { if (t.zc === zc && t.state.mustAttack === who) delete t.state.mustAttack; } });
      } }
    ],
    ai: {
      priority: 6,
      target: (g, p, req) => {
        if (req.purpose !== "surfer") return undefined;
        const theirs = req.options.filter(c => c.controller !== p);
        return bestOf(theirs, c => g.power(c)) || null;
      }
    }
  });
  D({
    name: GALACTUS, cost: "{10}", type: "Legendary Creature — Elder Alien", pt: "12/12",
    keywords: ["flying", "trample", "indestructible"],
    text: "Flying, trample, indestructible\nWhen Galactus enters, exile target permanent.\nInsatiable Hunger — Galactus attacks an opponent with the most life among your opponents each combat if able unless you control a creature named Silver Surfer, Galactus's Herald.",
    triggers: [
      { on: "enters", self: true, do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, { kind: "permanent", purpose: "harm", trigger: true, prompt: "Galactus: exile target permanent" }, s);
        if (t && t.zone === "battlefield") g.exile(t, s);
      } },
      { on: "beginCombat", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        if (g.creatures(p).some(c => c.def.name === SURFER)) { delete s.state.mustAttack; return; }
        const opps = opponentsOf(g, p);
        const top = Math.max(...opps.map(q => q.life));
        s.state.mustAttack = opps.find(q => q.life === top) || null;
      } }
    ],
    ai: { priority: 9, threat: 2 }
  });

  /* ================================================================ family and friends */
  const NO_LEGEND = { noLegendRule: true };
  D({
    name: "Council of Reeds", cost: "{2}{U}", type: "Legendary Creature — Human Scientist Hero", pt: "2/2",
    text: "The \"legend rule\" doesn't apply to creatures you control.\nAt the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a token that's a copy of Council of Reeds.",
    note: "The legend rule is turned off for all your permanents, not only creatures.",
    statics: [NO_LEGEND],
    triggers: [combatNC((g, s, ev, { p }) => { if (s.zone === "battlefield") g.copyToken(p, s); })],
    ai: { priority: 6, threat: 2 }
  });

  D({
    name: "Lockjaw, Slobbering Teleporter", cost: "{1}{U}", type: "Legendary Creature — Inhuman Dog Hero", pt: "1/1",
    keywords: ["vigilance"],
    text: "Vigilance\nAt the beginning of combat on your turn, if you've cast a noncreature spell this turn, put a +1/+1 counter on Lockjaw. When you do, Lockjaw and up to one other target creature you control can't be blocked this turn.",
    triggers: [combatNC(async (g, s, ev, { p }) => {
      if (s.zone !== "battlefield") return;
      g.addCounters(s, "p1", 1, s);
      const t = await g.chooseTarget(p, { kind: "creature", you: true, other: true, optional: true, purpose: "lockjaw", trigger: true, prompt: "Lockjaw: up to one other creature you control can't be blocked this turn" }, s);
      const objs = [s].concat(t && t.zone === "battlefield" ? [t] : []);
      g.addEffect({ objs, unblockable: true });
      log(g, `${objs.map(o => o.def.name).join(" and ")} can't be blocked this turn.`, p, [s.def.name]);
    })],
    ai: {
      priority: 7,
      target: (g, p, req) => {
        if (req.purpose !== "lockjaw") return undefined;
        const ok = req.options.filter(c => c.controller === p && !g.kw(c, "defender") && (!c.sick || g.kw(c, "haste")) && !c.tapped);
        return bestOf(ok, c => Math.max(0, g.power(c)) * (g.kw(c, "double strike") ? 2 : 1) - (g.kw(c, "flying") ? 2 : 0)) || null;
      }
    }
  });

  D({
    name: "Valeria Richards, Precocious", cost: "{3}{U}", type: "Legendary Creature — Human Scientist Hero", pt: "3/3",
    text: "Noncreature spells you cast cost {1} less to cast.\nWhenever you cast your first noncreature spell each turn, draw a card.",
    statics: [{ costMod: (g, s, card) => (isNC(card) && !card.def.types.includes("Land") ? 1 : 0) }],
    triggers: [{ on: "cast", when: (g, s, ev) => youCastNC(g, s, ev) && ncCount(g, s.controller) === 1, do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }],
    ai: { priority: 8, threat: 1 }
  });

  D({
    name: "Alicia Masters, Skilled Sculptor", cost: "{1}{R}", type: "Legendary Creature — Human Artificer", pt: "0/4",
    text: "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a Treasure token.\nSense the Good — At the beginning of your end step, each player gains control of all creatures they own.",
    note: "Sense the Good does nothing here: the engine's control changes already end at end of turn.",
    triggers: [combatNC((g, s, ev, { p }) => g.createToken(p, T.treasure))],
    ai: { priority: 6, ramp: true }
  });

  D({
    name: "Franklin Richards, Ascendant", cost: "{5}{R}", type: "Legendary Creature — Mutant Hero", pt: "6/6",
    text: "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, discover 6. (Exile cards from the top of your library until you exile a nonland card with mana value 6 or less. Cast it without paying its mana cost or put it into your hand. Put the rest on the bottom in a random order.)",
    triggers: [combatNC((g, s, ev, { p }) => g.discover(p, 6, s))],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Medusa, Inhuman Queen", cost: "{2}{G}", type: "Legendary Creature — Inhuman Noble Hero", pt: "2/2",
    keywords: ["vigilance", "reach"],
    text: "Vigilance, reach\nWhenever a player casts a noncreature spell, put a +1/+1 counter on Medusa.",
    triggers: [{ on: "cast", when: (g, s, ev) => isNC(ev.o), do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); } }],
    ai: { priority: 6 }
  });

  D({
    name: "Black Bolt, Inhuman King", cost: "{2}{W}{U}", type: "Legendary Creature — Inhuman Noble Hero", pt: "3/3",
    keywords: ["flying"],
    text: "Flying\nWhenever you cast a noncreature spell, Black Bolt gets +2/+2 until end of turn.\nLethal Voice — Whenever Black Bolt becomes the target of a spell or ability an opponent controls, destroy target nonland permanent that player controls.",
    triggers: [
      { on: "cast", when: youCastNC, do: (g, s) => { if (s.zone === "battlefield") g.pump([s], 2, 2); } },
      { on: "becameTarget", when: (g, s, ev) => ev.o === s && !!ev.p && ev.p !== s.controller, do: async (g, s, ev, { p }) => {
        const who = ev.p;
        const t = await g.chooseTarget(p, { kind: "nonland", purpose: "harm", trigger: true, prompt: `Lethal Voice: destroy target nonland permanent ${who.name} controls`, filter: (g2, o) => o.controller === who }, s);
        if (t && t.zone === "battlefield") g.destroy(t, s);
      } }
    ],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Crystal, Inhuman Princess", cost: "{1}{R}{G}", type: "Legendary Creature — Inhuman Noble Hero", pt: "2/3",
    keywords: ["flying"],
    text: "Flying\nWhenever you cast a noncreature spell, Crystal deals X damage to each opponent, where X is the number of colors that spell is.\n{T}: Add {R}, {G}, {W}, or {U}.",
    mana: [{ tap: true, produce: ["R", "G", "W", "U"] }],
    triggers: [{ on: "cast", when: (g, s, ev) => youCastNC(g, s, ev) && g.colorsOf(ev.o).size > 0, do: (g, s, ev, { p }) => {
      const n = g.colorsOf(ev.o).size;
      for (const q of opponentsOf(g, p)) g.damage(s, q, n);
    } }],
    ai: { priority: 8, ramp: true }
  });

  D({
    name: "Namor, Atlantean King", cost: "{1}{W}{U}", type: "Legendary Creature — Mutant Merfolk Noble", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nWhenever you cast a noncreature spell, create a 1/1 blue Merfolk creature token.\nWhenever Namor attacks a player who has more life than you, other creatures you control attacking that player get +2/+0 until end of turn.",
    triggers: [
      { on: "cast", when: youCastNC, do: (g, s, ev, { p }) => g.createToken(p, MERFOLK) },
      { on: "attacks", self: true, when: (g, s, ev) => g.isPlayer(ev.target) && ev.target.life > s.controller.life, do: (g, s, ev, { p }) => {
        const who = ev.target;
        const others = myAttackers(g, p).filter(a => a !== s && g.defenderOf(a.combat.attacking) === who && a.combat.attacking === who);
        if (others.length) { g.pump(others, 2, 0); log(g, `Creatures attacking ${who.name} get +2/+0 (Namor).`, p, [s.def.name]); }
      } }
    ],
    ai: { priority: 7, threat: 2 }
  });

  D({
    name: "Power Pack", cost: "{1}{R}{G}{W}{U}", type: "Legendary Creature — Human Hero", pt: "4/4",
    keywords: ["flying", "vigilance", "trample", "haste"],
    text: "Flying, vigilance, trample, haste\nWhenever Power Pack deals combat damage to a player, exile target instant or sorcery card from your graveyard chosen at random. At the beginning of your next upkeep, you may cast that card without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => {
      const pool = p.graveyard.filter(isIS);
      if (!pool.length) return;
      const c = pool[Math.floor(g.random() * pool.length)];
      g.moveTo(c, "exile");
      const zc = c.zc;
      log(g, `Power Pack exiles ${c.def.name} at random; ${p.name} may cast it next upkeep.`, p, [s.def.name, c.def.name]);
      g.delayed.push({ at: "upkeep", once: true, player: p, controller: p, turn: g.turn + 1, src: c, do: async g2 => {
        if (c.zone !== "exile" || c.zc !== zc || p.lost) return;
        const ok = await g2.ask(p, { type: "confirm", prompt: `Power Pack: cast ${c.def.name} without paying its mana cost?`, purpose: "powerPack", src: c });
        if (ok) await g2.castWithoutPaying(p, c, { exileAfter: true });
      } });
    } }],
    ai: { priority: 7, threat: 1 }
  });

  D({
    name: "Mister Fantastic, Reed Richards", cost: "{3}{U}", type: "Legendary Creature — Human Scientist Hero", pt: "2/4",
    keywords: ["reach"],
    text: "Reach\nWhenever one or more tokens you control enter, you may draw a card.",
    triggers: [{
      on: "enters", optional: "Mister Fantastic, Reed Richards: draw a card?",
      when: (g, s, ev) => {
        if (!ev.token || ev.p !== s.controller) return false;
        if (!ev.batch) return true;
        const first = ev.batch.find(b => b.o.isToken && b.o.controller === s.controller);
        return !!first && first.o === ev.o;
      },
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 7, confirm: (g, p) => p.library.length > 10 }
  });

  D({
    name: "The Fantasticar", cost: "{3}", type: "Legendary Artifact — Vehicle", pt: "4/4",
    keywords: ["flying"],
    text: "Flying\nWhenever you cast a noncreature spell, you may have The Fantasticar become an artifact creature until end of turn.\nWhenever you cast your fourth noncreature spell each turn, you may sacrifice The Fantasticar. If you do, create four 4/4 colorless Construct artifact creature tokens with flying and haste.",
    triggers: [
      { on: "cast", when: (g, s, ev) => youCastNC(g, s, ev) && s.state.crewed !== g.turn, optional: "The Fantasticar: become an artifact creature until end of turn?",
        do: (g, s) => { if (s.zone !== "battlefield") return; s.state.crewed = g.turn; g.bump(); log(g, "The Fantasticar becomes an artifact creature until end of turn.", s.controller, [s.def.name]); } },
      { on: "cast", when: (g, s, ev) => youCastNC(g, s, ev) && ncCount(g, s.controller) === 4, optional: "The Fantasticar: sacrifice it for four 4/4 flying Constructs?",
        do: (g, s, ev, { p }) => { if (s.zone !== "battlefield") return; g.sacrifice(s); g.createToken(p, CONSTRUCT, { count: 4 }); } }
    ],
    ai: { priority: 6, confirm: () => true }
  });

  /* ================================================================ noncreature spells */
  D({
    name: "Invisible Force Field", cost: "{1}{W}", type: "Instant",
    text: "Up to four target permanents you control gain indestructible until end of turn.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
    note: "The four permanents (your most valuable nonland ones) are chosen as it resolves.",
    rebound: true,
    spell: { do: (g, ctx) => {
      const list = g.controlled(ctx.p, o => !g.isLand(o)).sort((a, b) => (b.isCommander - a.isCommander) || (value(g, b) - value(g, a))).slice(0, 4);
      if (!list.length) return;
      g.grant(list, ["indestructible"]);
      log(g, `${list.map(o => o.def.name).join(", ")} gain indestructible until end of turn.`, ctx.p, ["Invisible Force Field"]);
    } },
    ai: { protection: true, shields: ["destroy", "damage"], combat: (g, p) => !!AI().combatSave && AI().combatSave(g, p) >= 5 }
  });

  /* A modal spell needs a mode it can choose (the engine would otherwise offer it with none). */
  const anyMode = (g, p, o) => o.def.modes.some(m => !m.canChoose || m.canChoose(g, p, o));
  const graveIS = (g, p) => p.graveyard.filter(c => isIS(c));
  D({
    name: "Fantastic Elasticity", cost: "{2}{U}", type: "Sorcery",
    text: "Choose one —\n• Return target nonland permanent to its owner's hand.\n• Return target instant or sorcery card from your graveyard to your hand.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
    rebound: true, canCast: anyMode,
    modes: [
      { label: "Bounce a nonland permanent",
        canChoose: (g, p, o) => g.targetOptions(p, { kind: "nonland" }, o).length > 0,
        targets: [{ kind: "nonland", purpose: "harm", prompt: "Return target nonland permanent to its owner's hand" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.bounce(ctx.targets[0]); } },
      { label: "Regrow an instant or sorcery", canChoose: (g, p) => graveIS(g, p).length > 0,
        targets: [{ kind: "card", purpose: "reanimate", prompt: "Return target instant or sorcery card from your graveyard", from: (g, p) => graveIS(g, p) }],
        do: (g, ctx) => { const c = ctx.targets[0]; if (c && c.zone === "graveyard") g.moveTo(c, "hand"); } }
    ],
    ai: {
      priority: 5,
      mode: (g, p, o) => {
        const best = g.battlefield.filter(c => c.controller !== p && !g.isLand(c) && g.canTarget(p, c)).map(c => threatOf(g, c, p)).sort((a, b) => b - a)[0] || 0;
        if (best >= 5 || !graveIS(g, p).length) return 0;
        return 1;
      },
      cast: (g, p, o) => {
        const best = g.battlefield.filter(c => c.controller !== p && !g.isLand(c) && !c.isToken && g.canTarget(p, c)).map(c => threatOf(g, c, p)).sort((a, b) => b - a)[0] || 0;
        if (best >= 5 || graveIS(g, p).some(c => c.def.mv >= 2)) return 12;
        return false;
      }
    }
  });

  D({
    name: "It's Clobberin' Time!", cost: "{2}{G}", type: "Sorcery",
    text: "Choose one —\n• Target creature you control deals damage equal to its power to target creature an opponent controls.\n• Destroy target artifact or enchantment.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
    rebound: true, canCast: anyMode,
    modes: [
      { label: "Your creature hits theirs",
        canChoose: (g, p, o) => g.targetOptions(p, { kind: "creature", you: true }, o).length > 0 && g.targetOptions(p, { kind: "creature", opp: true }, o).length > 0,
        targets: [
        { kind: "creature", you: true, purpose: "help", prompt: "Target creature you control" },
        { kind: "creature", opp: true, purpose: "harm", prompt: "Target creature an opponent controls" }],
        do: (g, ctx) => { const [a, b] = ctx.targets; if (ctx.legal[0] && ctx.legal[1] && a && b) g.damage(a, b, Math.max(0, g.power(a))); } },
      { label: "Destroy an artifact or enchantment",
        canChoose: (g, p, o) => g.targetOptions(p, { kind: "artifactOrEnchantment" }, o).length > 0,
        targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Destroy target artifact or enchantment" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0]); } }
    ],
    ai: {
      priority: 5,
      mode: (g, p) => (clobberCreature(g, p) ? 0 : 1),
      cast: (g, p) => {
        if (clobberCreature(g, p)) return 13;
        const ae = g.battlefield.filter(c => c.controller !== p && (g.isArtifact(c) || g.isEnchantment(c)) && g.canTarget(p, c) && !c.isToken).map(c => threatOf(g, c, p)).sort((a, b) => b - a)[0] || 0;
        return ae >= 4 ? 12 : false;
      },
      target: (g, p, req) => {
        if (req.purpose === "help" && req.src && req.src.def.name === "It's Clobberin' Time!") return bestOf(req.options.filter(c => c.controller === p), c => g.power(c)) || undefined;
        return undefined;
      }
    }
  });
  /* A worthwhile opposing creature our biggest creature can kill. */
  function clobberCreature(g, p) {
    const mine = g.creatures(p);
    if (!mine.length) return null;
    const pow = Math.max(...mine.map(c => g.power(c)));
    const killable = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.canTarget(p, c) && !g.kw(c, "indestructible") && g.toughness(c) - (c.damage || 0) <= pow);
    return bestOf(killable.filter(c => threatOf(g, c, p) >= 4), c => threatOf(g, c, p));
  }

  D({
    name: "Cosmic Crucible", cost: "{4}{G}{U}", type: "Enchantment",
    text: "At the beginning of your first main phase, add four mana in any combination of colors.\nWhenever you cast a noncreature spell, you may copy it. You may choose new targets for the copy. Do this only once each turn. (A copy of a permanent spell becomes a token.)",
    note: "The four mana is {R}{G}{W}{U}. A copied permanent spell makes its token copy right away, while the spell is still on the stack.",
    triggers: [
      { on: "precombatMain", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => {
        for (const k of ["R", "G", "W", "U"]) p.pool[k] += 1;
        g.bump();
        log(g, `${p.name} adds {R}{G}{W}{U} (Cosmic Crucible).`, p, [s.def.name]);
      } },
      { on: "cast", when: (g, s, ev) => youCastNC(g, s, ev) && s.state.crucible !== g.turn && !!ev.item, optional: "Cosmic Crucible: copy that spell?", do: async (g, s, ev, { p }) => {
        if (s.state.crucible === g.turn) return;
        s.state.crucible = g.turn;
        const item = ev.item, o = item.o;
        if (g.isPermanentCard(o)) { g.copyToken(p, o); return; }
        if (!g.stack.includes(item)) return;
        await g.copySpell(item, p);
      } }
    ],
    ai: {
      priority: 7, ramp: true,
      confirm: (g, p, req) => {
        if (req.purpose === "may" || req.purpose === undefined) {
          const it = req.ev && req.ev.item;
          if (!it) return false;
          const d = it.o.def;
          if (g.isPermanentCard(it.o)) return !d.legendary && d.mv >= 2;
          if ((d.ai || {}).counter) return false;
          return d.mv >= 2 || isFourSpell(it);
        }
        return true;
      }
    }
  });

  const colorsAmong = (g, p) => {
    const set = new Set();
    for (const o of g.controlled(p)) for (const c of g.colorsOf(o)) set.add(c);
    if (g.castLog && g.castLog.turn === g.turn) for (const e of g.castLog) if (e.p === p) for (const c of e.colors || []) set.add(c);
    return [...set].filter(c => "WUBRG".includes(c)).length;
  };
  D({
    name: "First Family", cost: "{2}{G}{U}", type: "Instant",
    text: "You draw X cards and gain X life, where X is the number of colors among permanents you control and spells you've cast this turn.",
    spell: { do: (g, ctx) => {
      const n = colorsAmong(g, ctx.p);
      if (!n) return;
      drawLog(g, ctx.p, n, ctx.o);
      g.gainLife(ctx.p, n, ctx.o);
    } },
    ai: { priority: 6, draw: true, instantEnd: true, hold: (g, p) => p.library.length < 10 }
  });

  D({
    name: "Annie Joins Up", cost: "{1}{R}{G}{W}", type: "Legendary Enchantment",
    text: "When Annie Joins Up enters, it deals 5 damage to target creature or planeswalker an opponent controls.\nIf a triggered ability of a legendary creature you control triggers, that ability triggers an additional time.",
    statics: [{ triggerExtra: (g, s, f) => {
      const src = f.src;
      if (!src || src.emblem || !src.def || f.controller !== s.controller || src.controller !== s.controller || src.zone !== "battlefield") return 0;
      return g.isCreature(src) && src.def.legendary ? 1 : 0;
    } }],
    triggers: [{ on: "enters", self: true, do: async (g, s, ev, { p }) => {
      const t = await g.chooseTarget(p, { kind: "creatureOrPlaneswalker", opp: true, purpose: "harm", amount: 5, trigger: true, prompt: "Annie Joins Up: 5 damage to target creature or planeswalker an opponent controls" }, s);
      if (t && t.zone === "battlefield") g.damage(s, t, 5);
    } }],
    ai: { priority: 8, threat: 1 }
  });

  D({
    name: "Into the Time Vortex", cost: "{4}{R}", type: "Sorcery",
    text: "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
    rebound: true,
    onCast: async (g, p, o) => { await g.discover(p, 5, o, { cascade: true }); },
    spell: { do: () => {} },
    ai: { priority: 6 }
  });

  D({
    name: "Whirlwind of Thought", cost: "{1}{U}{R}{W}", type: "Enchantment",
    text: "Whenever you cast a noncreature spell, draw a card.",
    triggers: [{ on: "cast", when: youCastNC, do: (g, s, ev, { p }) => { if (p.library.length > 3) drawLog(g, p, 1, s); } }],
    ai: { priority: 8, draw: true }
  });

  D({
    name: "Bovine Intervention", cost: "{1}{W}", type: "Instant",
    text: "Destroy target artifact or creature. Its controller creates a 2/2 white Ox creature token.",
    spell: {
      targets: [{ kind: "permanent", purpose: "harm", prompt: "Destroy target artifact or creature", filter: (g, o) => g.isCreature(o) || g.isArtifact(o) }],
      do: (g, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0]) return;
        const who = t.controller;
        g.destroy(t, ctx.o);
        if (!who.lost) g.createToken(who, OX);
      }
    },
    ai: { removal: true, minThreat: 5, priority: 6 }
  });

  D({
    name: "Baxter Building", type: "Land",
    text: "{T}: Add {C}.\n{4}, {T}: Add four mana in any combination of colors.\n{4}, {T}: Draw a card. Activate only if you control a creature with toughness 4 or greater.",
    note: "The {4}, {T} mana ability (it only changes colors) is left out.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Draw a card", cost: "{4}", tap: true,
      condition: (g, s, p) => g.creatures(p).some(c => g.toughness(c) >= 4),
      do: (g, s, ctx) => drawLog(g, ctx.p, 1, s),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.hand.length < 8 && p.library.length > 10 }
    }]
  });

  /* ================================================================ the deck's brain */
  const COMBAT_PAYOFFS = new Set(["Invisible Woman", MF, "Human Torch", "The Thing", "Council of Reeds", "Lockjaw, Slobbering Teleporter", "Alicia Masters, Skilled Sculptor", "Franklin Richards, Ascendant"]);
  /* Before combat with no noncreature spell cast yet and begin-combat payoffs out: cast the cheapest
     noncreature spell that isn't held for a reason (counters, protection, removal, wipes). */
  function enablerAction(g, p, acts) {
    const payoffs = g.creatures(p).filter(c => COMBAT_PAYOFFS.has(c.def.name)).length;
    if (!payoffs || ncCount(g, p) > 0) return null;
    const ok = acts.filter(a => {
      if (a.type !== "cast" || !a.card || !isNC(a.card) || a.card.def.types.includes("Land")) return false;
      const h = a.card.def.ai || {};
      if (h.counter || h.protection || h.wipe || h.removal || h.never || h.finisher) return false;
      if (h.cast) { try { if (h.cast(g, p, a.card, { window: "main1" }) === false) return false; } catch (e) { return false; } }
      return true;
    });
    if (!ok.length) return null;
    const pick = ok.sort((a, b) => a.card.def.mv - b.card.def.mv)[0];
    return { type: "cast", card: pick.card, alt: pick.alt, maxTries: 1 };
  }
  function brainPlan(g, p, ctx) {
    if (ctx.window !== "main1" || g.active !== p) return null;
    const acts = ctx.actions || [];
    const en = enablerAction(g, p, acts);
    if (en) return en;
    // Mister Fantastic: copy the best begin-combat payoff (or The Fantastic Four's next trigger)
    const mf = acts.find(a => a.type === "activate" && a.card && a.card.def.name === MF && a.idx === 0);
    if (mf && boostTarget(g, p)) return { type: "activate", card: mf.card, idx: 0, maxTries: 1 };
    return null;
  }
  MK.DECK_BRAINS = MK.DECK_BRAINS || {};
  /* The engines stay home unless the attack is safe: The Fantastic Four's value is the triggers, not
     the 4/4 body, and a double block kills it (then the tax makes every recast slower). */
  const ENGINES = new Set([FF, "Valeria Richards, Precocious", "Mister Fantastic, Reed Richards", "Crystal, Inhuman Princess", "Alicia Masters, Skilled Sculptor", MF]);
  function keepHome(g, p, o) {
    if (!ENGINES.has(o.def.name)) return false;
    // safe enough: it can't be blocked, or nobody has a creature that could block and survive or trade
    if (g.effects.some(e => e.unblockable && g.affects && g.affects(e, o))) return false;
    const pw = g.power(o);
    const blockers = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && !c.tapped && (!g.kw(o, "flying") || g.kw(c, "flying") || g.kw(c, "reach")));
    const risky = blockers.some(c => g.power(c) >= g.toughness(o) || g.toughness(c) > pw) || blockers.length >= 2;
    return risky;
  }
  MK.DECK_BRAINS.fantastic4 = { plan: brainPlan, keepHome };

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "fantastic4", name: "Fantastic Four", title: FF, commander: FF,
    identity: ["W", "U", "R", "G"], bracket: 3, aggression: 0.4,
    style: "Noncreature spells and legendary triggers",
    blurb: "Marvel's First Family casts a noncreature spell every turn so Mister Fantastic, Invisible Woman, Human Torch and The Thing all power up at the beginning of combat, while The Fantastic Four burn the table whenever a four-mana spell is cast.",
    watch: [FF, "Annie Joins Up", "Franklin Richards, Ascendant", "Cosmic Crucible", "Valeria Richards, Precocious"],
    precon: "The Fantastic Four (Marvel Super Heroes Commander, 2026), upgraded",
    list: (function () {
      const singles = [
        // the Fantastic Four, family and friends (17)
        "Invisible Woman", MF, "Human Torch", "The Thing", "Council of Reeds",
        "Lockjaw, Slobbering Teleporter", "Valeria Richards, Precocious", "Alicia Masters, Skilled Sculptor",
        "Franklin Richards, Ascendant", "Medusa, Inhuman Queen", "Black Bolt, Inhuman King",
        "Crystal, Inhuman Princess", "Namor, Atlantean King", "Power Pack",
        "Mister Fantastic, Reed Richards", "Silver Surfer, Galactus's Herald",
        "Galactus, Devourer of Worlds",
        // other creatures (5)
        "Birds of Paradise", "Noble Hierarch", "Questing Beast", "Hero of Bladehold", "Goldspan Dragon",
        // artifacts (8)
        "The Fantasticar", "Esika's Chariot", "Sol Ring", "Arcane Signet", "Talisman of Progress",
        "Talisman of Impulse", "Talisman of Conviction", "Lightning Greaves",
        // enchantments (5)
        "Cosmic Crucible", "Annie Joins Up", "Whirlwind of Thought", "Rhystic Study", "Smothering Tithe",
        // planeswalkers (2)
        "Elspeth, Sun's Champion", "Sarkhan Unbroken",
        // instants (15)
        "Invisible Force Field", "First Family", "Bovine Intervention", "Counterspell", "Swan Song",
        "Fierce Guardianship", "Swords to Plowshares", "Path to Exile", "Beast Within", "Chaos Warp",
        "Generous Gift", "Lightning Bolt", "Cyclonic Rift", "Heroic Intervention", "Aetherize",
        // sorceries (12)
        "Fantastic Elasticity", "It's Clobberin' Time!", "Into the Time Vortex", "Three Visits", "Farseek",
        "Cultivate", "Rampant Growth", "Preordain", "Harmonize", "Wrath of God", "Cleansing Nova",
        "Austere Command",
        // lands (29 + 6 basics) (29)
        "Command Tower", "Exotic Orchard", "Baxter Building", "Mana Confluence", "Hallowed Fountain",
        "Breeding Pool", "Steam Vents", "Sacred Foundry", "Stomping Ground", "Temple Garden",
        "Flooded Strand", "Misty Rainforest", "Scalding Tarn", "Windswept Heath", "Wooded Foothills",
        "Arid Mesa", "Raugrin Triome", "Ketria Triome", "Jungle Shrine", "Jetmir's Garden", "Canopy Vista",
        "Cinder Glade", "Prairie Stream", "Rootbound Crag", "Sunpetal Grove", "Clifftop Retreat",
        "Fabled Passage", "Plateau", "Savannah"
      ];
      const list = singles.slice();
      for (const [b, n] of [["Island", 2], ["Forest", 2], ["Mountain", 1], ["Plains", 1]]) for (let i = 0; i < n; i++) list.push(b);
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
