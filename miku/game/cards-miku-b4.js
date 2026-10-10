/* The Miku high-Bracket-4 research decks (research/miku-b4/): the cards of the Brago, King Eternal
   and Shalai, Voice of Plenty lists that no other deck had, the Brago deck (MK.BRAGO_DECK) and its
   bot brain (MK.DECK_BRAINS.brago). The Shalai lists are played by the Corrupted Miku deck and brain
   (cards-corrupted.js), which know the new Shalai lines (Swift Reconfiguration, Fauna Shaman,
   Sylvan Tutor, Mother of Runes).
   The two Brago lists are Bracket 4 bot decks (lobby and Arena); the Shalai lists are measured
   with tools/sim/bench/wrap.js. Card text follows the printed Oracle text; `note` says where the
   engine simplifies a card. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const pc = s => MK.parseCost(s);
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  const isBot = p => !!(p && p.agent && p.agent.bot);
  const typeOf = (c, t) => !!c && !!c.def && c.def.types.includes(t);
  const isCreatureCard = c => typeOf(c, "Creature");
  const isIS = c => typeOf(c, "Instant") || typeOf(c, "Sorcery");
  const value = (g, o) => (MK.AI && MK.AI.value ? MK.AI.value(g, o) : 2 + (o.def.mv || 0));
  const threat = (g, o, p) => (MK.AI && MK.AI.threat ? MK.AI.threat(g, o, p) : value(g, o));
  const onBf = (g, p, n) => g.controlled(p, o => o.def.name === n);
  const otherLands = (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x)).length;
  const hasLandType = (g, p, t) => g.controlled(p, x => g.isLand(x) && g.hasSub(x, t)).length > 0;
  const myEndBeforeTurn = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;

  /* ---------- flicker: exile permanents, then return them (new objects: tokens are gone, counters,
     damage and attachments are lost, they come back untapped). A commander comes back too: the
     command-zone move is optional and nobody makes it when the card returns at once. An Aura that
     returns this way is attached to something it can enchant as it enters (the bot picks an
     opposing permanent for Reality Acid), or stays in exile with nothing to enchant. */
  async function flicker(g, list, p, src, opts) {
    opts = opts || {};
    const back = [];
    for (const t of list) {
      if (!t || t.zone !== "battlefield") continue;
      const info = g.lki(t);
      g.moveTo(t, "exile", { noCommandZone: true });
      g.emit("leaves", { o: t, lki: info, p: info.controller, to: "exile" });
      if (!t.isToken && t.zone === "exile" && g.isPermanentCard(t)) back.push({ o: t, ctl: opts.owner ? t.owner : p });
    }
    if (!list.length) return [];
    log(g, `${list.map(o => o.def.name).join(", ")} ${list.length > 1 ? "are" : "is"} exiled${back.length ? " and return" + (back.length > 1 ? "" : "s") + " to the battlefield" : ""}.`, p, list.map(o => o.def.name).concat(src ? [src.def.name] : []));
    const out = [];
    for (const { o, ctl } of back) {
      if (o.zone !== "exile") continue;
      if (o.def.aura) {
        const spec = (o.def.targets || [])[0] || { kind: o.def.enchant || "permanent" };
        const opts2 = g.battlefield.filter(x => g.kindMatch(x, spec.kind || "permanent") && (!spec.filter || spec.filter(g, x, ctl, o)) && (!spec.you || x.controller === ctl));
        if (!opts2.length) continue;
        const pick = await g.ask(ctl, { type: "target", prompt: `${o.def.name} returns: choose what it enchants`, options: opts2, purpose: spec.purpose || "help", src: o });
        o.attachedTo = opts2.includes(pick) ? pick : opts2[0];
      }
      out.push(o);
    }
    const groups = new Map();
    for (const o of out) { const ctl = back.find(b => b.o === o).ctl; if (!groups.has(ctl)) groups.set(ctl, []); groups.get(ctl).push(o); }
    for (const [ctl, objs] of groups) {
      const att = objs.map(o => o.attachedTo);
      g.putOntoBattlefield(objs, ctl);
      objs.forEach((o, i) => { if (att[i]) o.attachedTo = att[i]; });
    }
    return out;
  }
  MK.flicker = flicker;

  /* Untap up to n lands p controls: the tapped ones that make the most mana, blue first. */
  async function untapLands(g, p, n, src) {
    const tapped = g.controlled(p, o => g.isLand(o) && o.tapped);
    if (!tapped.length) return;
    const out = o => Math.max(1, ...g.manaAbilities(o).map(ab => { const pr = typeof ab.produce === "function" ? ab.produce(g, o) : ab.produce; return pr ? Math.max(...g.expandProduce(pr, p).map(u => u.length)) : 0; }));
    const blue = o => g.manaAbilities(o).some(ab => { const pr = typeof ab.produce === "function" ? "" : ab.produce; return pr === "any" || pr === "any5" || (Array.isArray(pr) ? pr.join("") : String(pr || "")).includes("U"); });
    let pick;
    if (isBot(p) || tapped.length <= n) pick = tapped.slice().sort((a, b) => out(b) - out(a) || blue(b) - blue(a)).slice(0, n);
    else pick = ((await g.ask(p, { type: "cards", prompt: `${src.def.name}: untap up to ${n} lands`, options: tapped, min: 0, max: n, purpose: "untapLands", src })) || []).filter(o => tapped.includes(o)).slice(0, n);
    for (const o of pick) g.untap(o);
    if (pick.length) log(g, `${p.name} untaps ${pick.length} land${pick.length > 1 ? "s" : ""} (${src.def.name}).`, p, [src.def.name]);
  }
  /* Look at the top n cards, put one into the hand and the rest on the bottom (Sea Gate Oracle). */
  function bestLook(g, p, cards) {
    const lands = g.controlled(p, o => g.isLand(o)).length + p.hand.filter(c => typeOf(c, "Land")).length;
    const land = cards.find(c => typeOf(c, "Land"));
    if (land && lands < 5) return land;
    const spells = cards.filter(c => !typeOf(c, "Land"));
    return spells.sort((a, b) => ((b.def.ai && b.def.ai.priority) || 5) - ((a.def.ai && a.def.ai.priority) || 5))[0] || cards[0];
  }
  /* Counter target spell unless its controller pays {n}. */
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
  /* The opposing spell on top of the stack, the one a counterspell aims at. */
  const topOpposing = (g, p, req) => {
    const opts = (req.options || []).filter(o => o && o.kind === "spell");
    if (!opts.length) return undefined;
    return opts.slice().sort((a, b) => g.stack.indexOf(b) - g.stack.indexOf(a))[0];
  };
  /* Evoke with a mana cost (Mulldrifter): the creature is sacrificed when it enters. */
  const evokeFor = cost => ({
    altCosts: [{ label: `Evoke (${cost})`, cost }],
    onResolve: async (g, p, o, item) => {
      if (item.alt !== 1) return;
      g.pending.unshift({ src: o, controller: p, ev: {}, tr: { do: async g2 => { if (o.zone === "battlefield") { log(g2, `${o.def.name} was evoked and is sacrificed.`, p, [o.def.name]); g2.sacrifice(o); } } } });
    }
  });
  const COLORS_OF = { W: "white", U: "blue", B: "black", R: "red", G: "green" };
  /* The color of p's identity its sources make least of (Coldsteel Heart, Utopia Sprawl). */
  function scarceColor(g, p) {
    const ids = (p.identity && p.identity.length ? p.identity : ["G"]).filter(k => COLORS_OF[k]);
    const count = k => g.controlled(p, o => g.manaAbilities(o).some(ab => { const pr = typeof ab.produce === "function" ? "" : ab.produce; return (Array.isArray(pr) ? pr.join("") : String(pr || "")).includes(k) || pr === "any" || pr === "any5"; })).length;
    return ids.slice().sort((a, b) => count(a) - count(b))[0] || "G";
  }
  async function chooseColor(g, p, src, purpose) {
    const guess = scarceColor(g, p);
    const ids = (p.identity && p.identity.length ? p.identity : Object.keys(COLORS_OF)).filter(k => COLORS_OF[k]);
    const k = await g.ask(p, { type: "option", prompt: `${src.def.name}: choose a color`, options: ids.map(id => ({ id, label: COLORS_OF[id][0].toUpperCase() + COLORS_OF[id].slice(1) })), purpose: purpose || "color", src, guess });
    return COLORS_OF[k] ? k : guess;
  }

  /* ---------- tokens */
  T.b4Bird = MK.tokenDef({ key: "b4-bird-w", name: "Bird", pt: [1, 1], colors: "W", subtypes: ["Bird"], keywords: ["flying"] });
  const illusion = x => MK.tokenDef({ key: "b4-illusion-u-" + x, name: "Illusion", pt: [x, x], colors: "U", subtypes: ["Illusion"] });
  T.b4Squirrel = MK.tokenDef({ key: "b4-squirrel-g", name: "Squirrel", pt: [1, 1], colors: "G", subtypes: ["Squirrel"] });

  /* ================================================================ Brago */
  /* Which of p's nonland permanents Brago should flicker: those that come back better. */
  function bragoWorth(g, p, o) {
    if (g.isLand(o) || o.isToken) return -1;
    const n = o.def.name;
    if (o.def.aura) return n === "Reality Acid" && o.attachedTo && o.attachedTo.controller !== p ? 6 : -1;
    if (o.isCommander) return -1;
    // these lose what they hold, or cost a card, when they come back
    if (["Chrome Mox", "Mox Diamond", "Isochron Scepter", "Lightning Greaves", "Strionic Resonator"].includes(n)) return -1;
    if (n === "The One Ring") return (o.counters.burden || 0) >= 2 ? 4 : -1;   // a fresh Ring: protection again, no burden
    let s = 0;
    // mana rocks and dorks that are tapped come back untapped; Mana Vault and Monoliths too
    if (o.tapped && g.manaAbilities(o).length) s += 2 + (["Mana Vault", "Grim Monolith", "Basalt Monolith", "Sol Ring"].includes(n) ? 2 : 0);
    if (n === "Isochron Scepter" && o.tapped) s += 1;
    const etb = (o.def.triggers || []).some(t => t.on === "enters" && t.self) || !!(o.def.etbCounters);
    if (etb) s += BRAGO_ETB[n] != null ? BRAGO_ETB[n] : 2;
    if ((o.def.triggers || []).some(t => t.on === "leaves" && t.self)) s += 1;
    if (o.counters && (o.counters.p1 || 0) > 0) s -= 3;
    if (o.counters && (o.counters.m1 || 0) > 0) s += 1;
    if (o.counters && (o.counters.stun || 0) > 0) s += 1;
    if (o.damage) s += 0.5;
    if (n === "Strionic Resonator") s -= 5;   // it's copying the trigger
    if (n === "Walking Ballista") s -= 5;
    if (n === "Skyclave Apparition") s += 1;
    return s;
  }
  const BRAGO_ETB = {
    "Peregrine Drake": 6, "Mulldrifter": 4, "Archaeomancer": 4, "Reflector Mage": 4, "Skyclave Apparition": 3, "Venser, Shaper Savant": 3,
    "Wall of Omens": 2, "Sea Gate Oracle": 3, "Cryogen Relic": 3, "Omen of the Sea": 1.5, "Aether Channeler": 3, "Cloud of Faeries": 2.5,
    "Solemn Simulacrum": 3, "Loran of the Third Path": 2, "Recruiter of the Guard": 3, "Spellseeker": 3, "Trinket Mage": 2.5, "Tribute Mage": 2.5,
    "Deadeye Navigator": 0, "Soulherder": 0, "Elesh Norn, Mother of Machines": -1, "Isochron Scepter": -1, "Grand Abolisher": -1
  };
  D({
    name: "Brago, King Eternal", cost: "{2}{W}{U}", type: "Legendary Creature — Spirit Noble", pt: "2/4",
    keywords: ["flying"],
    text: "Flying\nWhenever Brago deals combat damage to a player, exile any number of target nonland permanents you control, then return those cards to the battlefield under their owner's control.",
    note: "The targets are chosen as the trigger resolves. An Aura that returns is attached to something it can enchant as it enters.",
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s,
      do: async (g, s, ev, { p }) => {
        const opts = g.controlled(p, o => !g.isLand(o));
        if (!opts.length) return;
        let pick;
        if (isBot(p)) pick = opts.filter(o => bragoWorth(g, p, o) > 0);
        else pick = ((await g.ask(p, { type: "cards", prompt: "Brago: exile any number of nonland permanents you control, then return them", options: opts, min: 0, max: opts.length, purpose: "brago", src: s })) || []).filter(o => opts.includes(o));
        if (!pick.length) return;
        await flicker(g, pick, p, s, { owner: true });
      }
    }],
    ai: { priority: 9, threat: 3 }
  });
  D({
    name: "Peregrine Drake", cost: "{4}{U}", type: "Creature — Drake", pt: "2/3", keywords: ["flying"],
    text: "Flying\nWhen this creature enters, untap up to five lands.",
    note: "It untaps lands you control (the ones that make the most mana, for the bots).",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => untapLands(g, p, 5, s) }],
    ai: { priority: 7, ramp: true }
  });
  /* Soulbond: the pair is stored on both creatures (id and zone count), so it breaks when either leaves. */
  const partnerOf = (g, o) => {
    const st = o.state.pair;
    if (!st) return null;
    const q = g.battlefield.find(x => x.id === st.id && x.zc === st.zc);
    if (!q || q.controller !== o.controller || !q.state.pair || q.state.pair.id !== o.id || q.state.pair.zc !== o.zc) return null;
    return q;
  };
  const pairable = (g, o) => o.zone === "battlefield" && g.isCreature(o) && !partnerOf(g, o);
  const pair = (g, a, b) => { a.state.pair = { id: b.id, zc: b.zc }; b.state.pair = { id: a.id, zc: a.zc }; g.bump(); log(g, `${a.def.name} and ${b.def.name} are paired.`, a.controller, [a.def.name, b.def.name]); };
  const drakeLater = p => p.hand.concat(p.library).some(c => c.def.name === "Peregrine Drake");
  const deadeyeBlink = {
    label: "{1}{U}: Exile this creature, then return it", cost: "{1}{U}",
    do: async (g, s, ctx) => { if (s.zone === "battlefield") await flicker(g, [s], ctx.p, s); },
    ai: { use: (g, p, o, ctx) => deadeyeUse(g, p, o, ctx) }
  };
  function deadeyeUse(g, p, o, ctx) {
    // in response to removal aimed at it, or the Drake at the end of the turn before ours
    const top = g.stack[g.stack.length - 1];
    if (top && top.p !== p && (top.targets || []).includes(o)) return true;
    return false;
  }
  D({
    name: "Deadeye Navigator", cost: "{4}{U}{U}", type: "Creature — Spirit", pt: "5/5",
    keywords: ["soulbond"],
    text: "Soulbond (You may pair this creature with another unpaired creature when either enters. They remain paired for as long as you control both of them.)\nAs long as Deadeye Navigator is paired with another creature, each of those creatures has \"{1}{U}: Exile this creature, then return it to the battlefield under your control.\"",
    triggers: [{
      on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o) && (ev.o === s || !partnerOf(g, s)),
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield" || partnerOf(g, s)) return;
        let other;
        if (ev.o === s) {
          const opts = g.creatures(p).filter(o => o !== s && pairable(g, o));
          if (!opts.length) return;
          other = await g.chooseTarget(p, trig({ kind: "creature", you: true, optional: true, purpose: "soulbond", prompt: "Soulbond: pair Deadeye Navigator with", filter: (g2, o) => o !== s && pairable(g2, o) }), s);
        } else {
          if (!pairable(g, ev.o)) return;
          const ok = await g.ask(p, { type: "confirm", prompt: `Soulbond: pair Deadeye Navigator with ${ev.o.def.name}?`, purpose: "soulbond", src: s });
          other = ok ? ev.o : null;
        }
        if (other && pairable(g, other) && other !== s) pair(g, s, other);
      }
    }],
    statics: [{ applies: (g, s, o) => o === s ? !!partnerOf(g, s) : partnerOf(g, s) === o, grantAbilities: [deadeyeBlink] }],
    ai: {
      priority: 6,
      // the bots keep the Navigator for Peregrine Drake while the Drake can still come; else they pair with the best creature to protect
      target: (g, p, req) => (req.purpose === "soulbond" ? (req.options.find(o => o.def.name === "Peregrine Drake") || (drakeLater(p) ? null : req.options.slice().sort((a, b) => value(g, b) - value(g, a))[0])) : undefined),
      confirm: (g, p, req) => (req.purpose === "soulbond" ? (/Peregrine Drake/.test(req.prompt) || !drakeLater(p)) : undefined)
    }
  });
  D({
    name: "Aether Channeler", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "2/1",
    text: "When this creature enters, choose one —\n• Create a 1/1 white Bird creature token with flying.\n• Return target nonland permanent to its owner's hand.\n• Draw a card.",
    note: "The mode and the target are chosen as the trigger resolves.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opp = g.battlefield.filter(o => o.controller !== p && !g.isLand(o) && g.canTarget(p, o, s));
        const guess = isBot(p) ? (opp.some(o => threat(g, o, p) >= 6) ? 1 : 2) : 2;
        const k = await g.ask(p, { type: "option", prompt: "Aether Channeler: choose one", options: [{ id: 0, label: "Create a 1/1 flying Bird" }, { id: 1, label: "Return a nonland permanent to its owner's hand" }, { id: 2, label: "Draw a card" }], purpose: "channelerMode", src: s, guess });
        const mode = [0, 1, 2].includes(k) ? k : guess;
        if (mode === 0) g.createToken(p, T.b4Bird);
        else if (mode === 2) g.draw(p, 1);
        else {
          const t = await g.chooseTarget(p, trig({ kind: "nonland", purpose: "harm", prompt: "Aether Channeler: return to its owner's hand" }), s);
          if (t && t.zone === "battlefield") g.bounce(t);
        }
      }
    }],
    ai: { priority: 5, option: (g, p, req) => (req.purpose === "channelerMode" ? req.guess : undefined) }
  });
  D({
    name: "Cloud of Faeries", cost: "{1}{U}", type: "Creature — Faerie", pt: "1/1", keywords: ["flying"],
    text: "Flying\nWhen this creature enters, untap up to two lands.\nCycling {2} ({2}, Discard this card: Draw a card.)",
    cycling: "{2}",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => untapLands(g, p, 2, s) }],
    ai: { priority: 6, ramp: true }
  });
  /* Flicker spells: protection (in response to removal) or value (an enters ability) */
  function flickerTarget(g, p, req) {
    const top = g.stack[g.stack.length - 1];
    if (top && top.p !== p) { const hit = req.options.find(o => (top.targets || []).includes(o)); if (hit) return hit; }
    return req.options.slice().sort((a, b) => bragoWorth(g, p, b) - bragoWorth(g, p, a))[0];
  }
  function flickerCast(g, p, o, ctx) {
    const top = g.stack[g.stack.length - 1];
    if ((ctx.window === "stack" || ctx.window === "ability") && top && top.p !== p && (top.targets || []).some(t => t && t.zone === "battlefield" && t.controller === p && g.isCreature(t) && value(g, t) >= 4)) return 30;
    if (myEndBeforeTurn(g, p, ctx) && g.creatures(p).some(c => bragoWorth(g, p, c) >= 3)) return 12;
    return false;
  }
  const flickerSpell = (name, text, rebound) => D({
    name, cost: "{W}", type: "Instant", text,
    note: rebound ? "Rebound only happens when it was cast from your hand." : undefined,
    spell: {
      targets: [{ kind: "creature", you: true, purpose: "flicker", prompt: `${name}: exile a creature you control, then return it` }],
      do: async (g, ctx) => {
        const t = ctx.targets[0];
        if (rebound && ctx.item && !ctx.item.free && !ctx.item.isCopy) {
          ctx.item.exileAfter = true;
          const card = ctx.o, p = ctx.p;
          g.delayed.push({ at: "upkeep", once: true, player: p, controller: p, do: async g2 => { if (card.zone === "exile" && !p.lost) { log(g2, `${p.name} casts ${name} from exile (rebound).`, p, [name]); await g2.castWithoutPaying(p, card); } } });
        }
        if (!ctx.legal[0] || !t || t.zone !== "battlefield") return;
        await flicker(g, [t], ctx.p, ctx.o);
      }
    },
    ai: { priority: 4, protection: true, cast: flickerCast, target: (g, p, req) => (req.purpose === "flicker" ? flickerTarget(g, p, req) : undefined) }
  });
  flickerSpell("Cloudshift", "Exile target creature you control, then return that card to the battlefield under your control.", false);
  flickerSpell("Ephemerate", "Exile target creature you control, then return it to the battlefield under its owner's control.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)", true);
  D({
    name: "Cryogen Relic", cost: "{1}{U}", type: "Artifact",
    text: "When this artifact enters or leaves the battlefield, draw a card.\n{1}{U}, Sacrifice this artifact: Put a stun counter on up to one target tapped creature. (If a permanent with a stun counter would become untapped, remove one from it instead.)",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) },
      { on: "leaves", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) }
    ],
    abilities: [{
      label: "Stun a tapped creature", cost: "{1}{U}", sacSelf: true,
      targets: [{ kind: "creature", optional: true, purpose: "harm", prompt: "Cryogen Relic: put a stun counter on a tapped creature", filter: (g, o) => o.tapped }],
      do: (g, s, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0]) { g.addCounters(t, "stun", 1, s); log(g, `${t.def.name} gets a stun counter.`, ctx.p, [t.def.name]); } },
      ai: { use: (g, p, o, ctx) => myEndBeforeTurn(g, p, ctx) && g.battlefield.some(c => c.controller !== p && c.tapped && g.isCreature(c) && threat(g, c, p) >= 7) }
    }],
    ai: { priority: 6, draw: true }
  });
  const nonCreatureSpell = (g, item, p) => item.p !== p && !item.o.def.types.includes("Creature");
  D({
    name: "Dovin's Veto", cost: "{W}{U}", type: "Instant",
    text: "This spell can't be countered.\nCounter target noncreature spell.",
    cantBeCountered: true,
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target noncreature spell", filter: nonCreatureSpell }],
      do: (g, ctx) => { const it = ctx.targets[0]; if (ctx.legal[0] && it && g.stack.includes(it)) g.counterSpell(it, ctx.o); }
    },
    ai: { counter: true, priority: 6, target: topOpposing }
  });
  D({
    name: "Flusterstorm", cost: "{U}", type: "Instant",
    text: "Counter target instant or sorcery spell unless its controller pays {1}.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. You may choose new targets for the copies.)",
    note: "The copies keep the target (each one asks for another {1}).",
    spell: {
      targets: [{ kind: "spell", purpose: "counter", prompt: "Counter target instant or sorcery spell unless its controller pays {1}", filter: (g, item, p) => item.p !== p && isIS(item.o) }],
      do: (g, ctx) => counterUnless(g, ctx, 1)
    },
    onCast: async (g, p, o, item) => {
      const n = Math.max(0, item.storm || 0);
      for (let k = 0; k < n && k < 30; k++) await g.copySpell(item, p, false);
    },
    ai: { counter: true, priority: 6, target: topOpposing }
  });
  D({
    name: "Elesh Norn, Mother of Machines", cost: "{4}{W}", type: "Legendary Creature — Phyrexian Praetor", pt: "4/7",
    keywords: ["vigilance"],
    text: "Vigilance\nPermanents entering the battlefield cause abilities of permanents you control to trigger an additional time.\nPermanents entering the battlefield don't cause abilities of permanents your opponents control to trigger.",
    statics: [{
      triggerExtra: (g, s, f) => (f.tr.on === "enters" && f.controller === s.controller && f.src && !f.src.emblem && f.src.zone === "battlefield" ? 1 : 0),
      stopTrigger: (g, s, f) => f.tr.on === "enters" && f.controller !== s.controller && g.opponents(s.controller).includes(f.controller) && !!f.src && !f.src.emblem && f.src.zone === "battlefield"
    }],
    ai: { priority: 7, threat: 3 }
  });
  D({
    name: "Loran of the Third Path", cost: "{2}{W}", type: "Legendary Creature — Human Artificer", pt: "2/1",
    text: "When Loran enters, destroy up to one target artifact or enchantment.\n{T}: You and target opponent each draw a card.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "artifactOrEnchantment", optional: true, purpose: "harm", prompt: "Loran: destroy up to one artifact or enchantment", filter: (g2, o) => o.controller !== p }), s);
        if (t && t.zone === "battlefield") g.destroy(t, s);
      }
    }],
    abilities: [{
      label: "You and an opponent each draw", tap: true,
      targets: [{ kind: "opponent", purpose: "help", prompt: "Loran: target opponent draws a card too" }],
      do: (g, s, ctx) => { g.draw(ctx.p, 1); const q = ctx.targets[0]; if (q && ctx.legal[0]) g.draw(q, 1); },
      ai: { use: (g, p, o, ctx) => myEndBeforeTurn(g, p, ctx) }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "help" && req.options.length ? req.options.slice().sort((a, b) => a.hand.length - b.hand.length)[0] : undefined) }
  });
  D(Object.assign({
    name: "Mulldrifter", cost: "{4}{U}", type: "Creature — Elemental", pt: "2/2", keywords: ["flying"],
    text: "Flying\nWhen this creature enters, draw two cards.\nEvoke {2}{U} (You may cast this spell for its evoke cost. If you do, it's sacrificed when it enters.)",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 2) }],
    ai: { priority: 5, draw: true }
  }, evokeFor("{2}{U}")));
  D({
    name: "Omen of the Sea", cost: "{1}{U}", type: "Enchantment",
    keywords: ["flash"],
    text: "Flash\nWhen this enchantment enters, scry 2.\n{2}{U}, Sacrifice this enchantment: Scry 2.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.scry(p, 2, s) }],
    abilities: [{ label: "Scry 2", cost: "{2}{U}", sacSelf: true, do: (g, s, ctx) => g.scry(ctx.p, 2, s), ai: { use: (g, p, o, ctx) => myEndBeforeTurn(g, p, ctx) && g.maxX(p, pc(""), 1) >= 5 } }],
    ai: { priority: 4, instantEnd: true }
  });
  D({
    name: "Reality Acid", cost: "{2}{U}", type: "Enchantment — Aura",
    text: "Enchant permanent\nVanishing 3 (This Aura enters with three time counters on it. At the beginning of your upkeep, remove a time counter from it. When the last is removed, sacrifice it.)\nWhen this Aura leaves the battlefield, enchanted permanent's controller sacrifices it.",
    aura: true, enchant: "permanent",
    targets: [{ kind: "permanent", purpose: "harm", prompt: "Enchant a permanent" }],
    etbCounters: () => ({ time: 3 }),
    triggers: [
      {
        on: "upkeep", when: (g, s, ev) => ev.p === s.controller && (s.counters.time || 0) > 0,
        do: (g, s) => { if (s.zone !== "battlefield") return; g.removeCounters(s, "time", 1); if (!(s.counters.time > 0)) { log(g, "The last time counter comes off Reality Acid: it's sacrificed.", s.controller, [s.def.name]); g.sacrifice(s); } }
      },
      {
        on: "leaves", self: true,
        do: (g, s, ev) => {
          const on = ev.lki && ev.lki.attachedTo;
          if (on && on.zone === "battlefield" && on.zc === ev.lki.attachedToZc) { log(g, `${on.controller.name} sacrifices ${on.def.name} (Reality Acid).`, on.controller, [on.def.name]); g.sacrifice(on); }
        }
      }
    ],
    ai: { removal: true, minThreat: 5, priority: 5 }
  });
  D({
    name: "Reflector Mage", cost: "{1}{W}{U}", type: "Creature — Human Wizard", pt: "2/3",
    text: "When this creature enters, return target creature an opponent controls to its owner's hand. That creature's owner can't cast spells with the same name as that creature until your next turn.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", opp: true, purpose: "harm", prompt: "Reflector Mage: return a creature an opponent controls to its owner's hand" }), s);
        if (!t || t.zone !== "battlefield") return;
        const name = t.def.name, owner = t.owner, token = t.isToken;
        g.bounce(t);
        if (!token) { g.banCasting((g2, q, card) => q === owner && card.def.name === name, "Reflector Mage", { until: p }); log(g, `${owner.name} can't cast ${name} until ${p.name}'s next turn.`, p, [name]); }
      }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Sea Gate Oracle", cost: "{2}{U}", type: "Creature — Human Wizard", pt: "1/3",
    text: "When this creature enters, look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const top = p.library.slice(0, 2);
        if (!top.length) return;
        let pick;
        if (isBot(p) || top.length === 1) pick = bestLook(g, p, top);
        else pick = ((await g.ask(p, { type: "cards", prompt: "Sea Gate Oracle: put one into your hand (the other goes to the bottom)", options: top, min: 1, max: 1, purpose: "pick", src: s })) || [])[0] || top[0];
        g.moveTo(pick, "hand");
        for (const c of top) if (c !== pick && c.zone === "library") { g.removeFromZone(c); p.library.push(c); }
        g.bump();
        log(g, `${p.name} looks at the top two cards and takes one (Sea Gate Oracle).`, p, [s.def.name]);
      }
    }],
    ai: { priority: 5, draw: true }
  });
  D({
    name: "Skyclave Apparition", cost: "{1}{W}{W}", type: "Creature — Kor Spirit", pt: "2/2",
    text: "When this creature enters, exile up to one target nonland, nontoken permanent you don't control with mana value 4 or less.\nWhen this creature leaves the battlefield, the exiled card's owner creates an X/X blue Illusion creature token, where X is the mana value of the exiled card.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "nonland", optional: true, purpose: "harm", prompt: "Skyclave Apparition: exile a nonland permanent (mana value 4 or less)", filter: (g2, o) => o.controller !== p && !o.isToken && g2.mvOf(o) <= 4 }), s);
          if (!t || t.zone !== "battlefield") return;
          const mv = g.mvOf(t), owner = t.owner;
          g.exile(t, s);
          (s.skyclave = s.skyclave || []).push({ zc: s.zc, mv, owner, card: t });
        }
      },
      {
        // the cards it exiled while it was on the battlefield this time (it has left: its zone count moved on by one)
        on: "leaves", self: true,
        when: (g, s, ev) => { ev.skyList = (s.skyclave || []).filter(x => x.zc === s.zc - 1); s.skyclave = (s.skyclave || []).filter(x => !ev.skyList.includes(x)); return ev.skyList.length > 0; },
        do: (g, s, ev) => {
          for (const x of ev.skyList || []) {
            if (x.owner.lost) continue;
            g.createToken(x.owner, illusion(x.mv));
            log(g, `${x.owner.name} gets a ${x.mv}/${x.mv} Illusion (Skyclave Apparition).`, x.owner, [s.def.name]);
          }
        }
      }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Soulherder", cost: "{1}{W}{U}", type: "Creature — Spirit", pt: "1/1",
    text: "Whenever a creature is exiled from the battlefield, put a +1/+1 counter on Soulherder.\nAt the beginning of your end step, you may exile another target creature you control, then return that card to the battlefield under its owner's control.",
    triggers: [
      { on: "leaves", when: (g, s, ev) => ev.to === "exile" && ev.lki && ev.lki.creature && ev.o !== s, do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); } },
      {
        on: "endStep", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, other: true, optional: true, purpose: "flicker", prompt: "Soulherder: exile another creature you control, then return it" }), s);
          if (t && t.zone === "battlefield") await flicker(g, [t], p, s, { owner: true });
        }
      }
    ],
    ai: { priority: 6, target: (g, p, req) => { if (req.purpose !== "flicker") return undefined; const best = req.options.slice().sort((a, b) => bragoWorth(g, p, b) - bragoWorth(g, p, a))[0]; return best && bragoWorth(g, p, best) > 0 ? best : null; } }
  });
  D({
    name: "Supreme Verdict", cost: "{1}{W}{W}{U}", type: "Sorcery",
    text: "This spell can't be countered.\nDestroy all creatures.",
    cantBeCountered: true,
    spell: { do: (g, ctx) => g.destroyAll(g.battlefield.filter(o => g.isCreature(o)), ctx.o) },
    ai: { wipe: true, priority: 5 }
  });
  D({
    name: "Venser, Shaper Savant", cost: "{2}{U}{U}", type: "Legendary Creature — Human Wizard", pt: "2/2",
    keywords: ["flash"],
    text: "Flash\nWhen Venser enters, return target spell or permanent to its owner's hand.",
    note: "The target is chosen as the trigger resolves.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const spells = g.stack.filter(it => it.kind === "spell" && !it.countered);
        const perms = g.battlefield.filter(o => o !== s && g.canTarget(p, o, s));
        const opts = spells.concat(perms);
        if (!opts.length) return;
        let t;
        if (isBot(p)) t = venserPick(g, p, spells, perms);
        else t = await g.ask(p, { type: "target", prompt: "Venser: return a spell or permanent to its owner's hand", options: opts, purpose: "venser", src: s, optional: true });
        if (!t || !opts.includes(t)) return;
        if (t.kind === "spell") {
          const i = g.stack.indexOf(t);
          if (i < 0) return;
          g.stack.splice(i, 1); t.countered = true;
          if (!t.isCopy && t.o.zone === "stack") { t.o.zone = "new"; g.moveTo(t.o, "hand"); }
          log(g, `${t.name} returns to ${t.p.name}'s hand (Venser).`, p, [t.o.def.name]);
          g.bump();
        } else if (t.zone === "battlefield") g.bounce(t);
      }
    }],
    ai: { priority: 5, cast: (g, p, o, ctx) => venserCast(g, p, o, ctx) }
  });
  function venserPick(g, p, spells, perms) {
    const sp = spells.filter(it => it.p !== p).sort((a, b) => (b.o.def.mv || 0) - (a.o.def.mv || 0))[0];
    if (sp) return sp;
    const opp = perms.filter(o => o.controller !== p && !g.isLand(o)).sort((a, b) => threat(g, b, p) - threat(g, a, p))[0];
    if (opp) return opp;
    return null;
  }
  function venserCast(g, p, o, ctx) {
    const top = g.stack[g.stack.length - 1];
    if (ctx.window === "stack" && top && top.kind === "spell" && top.p !== p) {
      const d = top.o.def, ai = d.ai || {};
      if (ai.wipe || ai.finisher || ai.tutor || (d.mv || 0) >= 4 || (top.targets || []).some(t => t && t.controller === p)) return 25;
      return false;
    }
    if (myEndBeforeTurn(g, p, ctx)) return g.battlefield.some(x => x.controller !== p && !g.isLand(x) && threat(g, x, p) >= 6) ? 10 : false;
    return false;
  }
  D({
    name: "Wall of Omens", cost: "{1}{W}", type: "Creature — Wall", pt: "0/4", keywords: ["defender"],
    text: "Defender\nWhen this creature enters, draw a card.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.draw(p, 1) }],
    ai: { priority: 6, draw: true }
  });
  D({
    name: "Coldsteel Heart", cost: "{2}", type: "Snow Artifact",
    text: "This artifact enters tapped.\nAs this artifact enters, choose a color.\n{T}: Add one mana of the chosen color.",
    etbTapped: true,
    etbState: (g, o) => ({ color: scarceColor(g, o.controller) }),
    mana: [{ tap: true, produce: (g, o) => o.state.color || "C" }],
    ai: { ramp: true, priority: 7 }
  });

  /* ---------- lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  land("Prismatic Vista", {
    text: "{T}, Pay 1 life: Add {C}.\n{T}, Pay 1 life, Sacrifice this land: Search your library for a basic land card, put it onto the battlefield, then shuffle.",
    note: "Its {T}, pay 1 life: Add {C} isn't in the game: it is always cracked for a basic.",
    abilities: [{
      label: "Find a basic land", tap: true, payLife: 1, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => typeOf(c, "Land") && c.def.supertypes.includes("Basic"), to: "battlefield", prompt: "Prismatic Vista: choose a basic land", src: s, purpose: "fetchBasic" }),
      ai: { use: (g, p, o, ctx) => ctx.window === "end" && p.life > 2 }
    }],
    ai: {
      plan: (g, p, o, { window }) => (o.zone === "battlefield" && !o.tapped && o.controller === p && p.life > 2 && g.active === p && (window === "main1" || window === "main2") ? { type: "activate", card: o, idx: 0 } : null),
      cards: (g, p, req) => {
        if (req.purpose !== "fetchBasic") return null;
        const k = scarceColor(g, p), basic = { W: "Plains", U: "Island", B: "Swamp", R: "Mountain", G: "Forest" }[k];
        const hit = req.options.find(c => c.def.name === basic) || req.options[0];
        return hit ? [hit] : [];
      }
    }
  });
  land("Adarkar Wastes", {
    text: "{T}: Add {C}.\n{T}: Add {W} or {U}. This land deals 1 damage to you.",
    note: "Its colored mana isn't used while you're at 1 life.",
    mana: [{ tap: true, produce: "C" }, { tap: true, produce: ["W", "U"], condition: (g, o) => o.controller.life > 1, after: (g, o) => g.damage(o, o.controller, 1) }]
  });
  land("Celestial Colonnade", {
    text: "This land enters tapped.\n{T}: Add {W} or {U}.\n{3}{W}{U}: Until end of turn, this land becomes a 4/4 white and blue Elemental creature with flying and vigilance. It's still a land.",
    etbTapped: true,
    mana: [{ tap: true, produce: ["W", "U"] }],
    abilities: [{
      label: "Becomes a 4/4 flier", cost: "{3}{W}{U}", noSelfMana: true,
      condition: (g, o) => !(o.state.animated && o.state.animated.turn === g.turn),
      do: (g, s) => { s.state.animated = { turn: g.turn, pt: [4, 4], subtypes: ["Elemental"], colors: ["W", "U"], keywords: ["flying", "vigilance"] }; g.bump(); log(g, "Celestial Colonnade becomes a 4/4 flying, vigilant Elemental.", s.controller, [s.def.name]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !o.sick && !o.tapped && g.turn >= 8 && g.maxX(p, pc(""), 1) >= 7 }
    }]
  });
  land("Deserted Beach", { text: "This land enters tapped unless you control two or more other lands.\n{T}: Add {W} or {U}.", etbTapped: (g, o) => otherLands(g, o) < 2, mana: [{ tap: true, produce: ["W", "U"] }] });
  land("Glacial Fortress", { text: "This land enters tapped unless you control a Plains or an Island.\n{T}: Add {W} or {U}.", etbTapped: (g, o) => !hasLandType(g, o.controller, "Plains") && !hasLandType(g, o.controller, "Island"), mana: [{ tap: true, produce: ["W", "U"] }] });
  land("Irrigated Farmland", { type: "Land — Plains Island", text: "({T}: Add {W} or {U}.)\nThis land enters tapped.\nCycling {2} ({2}, Discard this card: Draw a card.)", etbTapped: true, cycling: "{2}", mana: [{ tap: true, produce: ["W", "U"] }] });
  land("Sea of Clouds", { text: "This land enters tapped unless you have two or more opponents.\n{T}: Add {W} or {U}.", etbTapped: (g, o) => g.opponents(o.controller).length < 2, mana: [{ tap: true, produce: ["W", "U"] }] });
  land("Tundra", { type: "Land — Plains Island", text: "({T}: Add {W} or {U}.)", mana: [{ tap: true, produce: ["W", "U"] }] });

  /* ================================================================ Shalai */
  D({
    name: "Scurry Oak", cost: "{2}{G}", type: "Creature — Treefolk", pt: "1/2",
    keywords: ["evolve"],
    text: "Evolve (Whenever a creature you control enters, if that creature has greater power or toughness than this creature, put a +1/+1 counter on this creature.)\nWhenever one or more +1/+1 counters are put on this creature, you may create a 1/1 green Squirrel creature token.",
    note: "With Trostani and Archangel of Thune (or Heliod) the Squirrels loop forever: the engine stops at 60 Squirrels a turn.",
    triggers: [
      {
        on: "enters",
        when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o) && (g.power(ev.o) > g.power(s) || g.toughness(ev.o) > g.toughness(s)),
        intervening: (g, s, ev) => {
          const o = ev.o, lk = o.zone === "battlefield" ? { p: g.power(o), t: g.toughness(o) } : { p: (ev.lki && ev.lki.power) || 0, t: (ev.lki && ev.lki.toughness) || 0 };
          return lk.p > g.power(s) || lk.t > g.toughness(s);
        },
        do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); }
      },
      {
        on: "counters", when: (g, s, ev) => ev.o === s && ev.kind === "p1" && ev.n > 0,
        optional: "Scurry Oak: create a 1/1 Squirrel?",
        do: (g, s, ev, { p }) => {
          const k = "oak" + g.turn;
          s.state[k] = (s.state[k] || 0) + 1;
          if (s.state[k] > 60) return;
          g.createToken(p, T.b4Squirrel);
        }
      }
    ],
    ai: { priority: 6 }
  });
  D({
    name: "Swift Reconfiguration", cost: "{W}", type: "Enchantment — Aura",
    keywords: ["flash"],
    text: "Flash\nEnchant creature or Vehicle\nEnchanted permanent is a Vehicle artifact with crew 5 and it loses all other card types. (It's not a creature unless it's crewed.)",
    note: "Devoted Druid under it is a noncreature artifact: it can tap the turn it arrives, and its -1/-1 counters don't kill it.",
    aura: true, enchant: "permanent",
    targets: [{ kind: "permanent", purpose: "swift", prompt: "Swift Reconfiguration: enchant a creature or Vehicle", filter: (g, o) => g.isCreature(o) || !!o.def.crew || (o.def.subtypes || []).includes("Vehicle") }],
    statics: [{
      applies: (g, s, o) => s.attachedTo === o, becomesVehicle: true,
      grantAbilities: [{ label: "Crew 5", crew: 5, timing: "instant", do: (g, src) => { src.state.crewed = g.turn; g.bump(); log(g, `${src.controller.name} crews ${src.def.name}.`, src.controller, [src.def.name]); } }]
    }],
    ai: { priority: 3, never: true, brain: "corrupted", otherwise: { removal: true, minThreat: 7 } }
  });
  D({
    name: "Allosaurus Shepherd", cost: "{G}", type: "Creature — Elf Shaman", pt: "1/1",
    text: "This spell can't be countered.\nGreen spells you control can't be countered.\n{4}{G}{G}: Until end of turn, each Elf creature you control has base power and toughness 5/5 and becomes a Dinosaur in addition to its other creature types.",
    note: "The Elves keep their creature types (Dinosaur isn't added).",
    cantBeCountered: true,
    statics: [{ uncounterable: (g, s, item) => item.p === s.controller && item.kind === "spell" && (item.o.def.colors || []).includes("G") }],
    abilities: [{
      label: "Elves become 5/5", cost: "{4}{G}{G}",
      do: (g, s, ctx) => { const elves = g.creatures(ctx.p).filter(o => g.hasSub(o, "Elf")); if (elves.length) g.addEffect({ objs: elves, setPT: [5, 5] }); log(g, `${ctx.p.name}'s Elves have base power and toughness 5/5 this turn.`, ctx.p, [s.def.name]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && g.creatures(p).filter(c => g.hasSub(c, "Elf") && !c.sick).length >= 3 && g.maxX(p, pc(""), 1) >= 8 }
    }],
    ai: { priority: 6 }
  });
  D({
    name: "Archon of Emeria", cost: "{2}{W}", type: "Creature — Archon", pt: "2/3", keywords: ["flying"],
    text: "Flying\nEach player can't cast more than one spell each turn.\nNonbasic lands your opponents control enter tapped.",
    statics: [{
      cantCast: (g, s, p) => (p.spellsCast || 0) >= 1,
      entersTapped: (g, s, o) => g.isLand(o) && !g.isBasic(o) && g.opponents(s.controller).includes(o.controller)
    }],
    ai: { priority: 6, threat: 2, cast: (g, p, o, ctx) => ((p.spellsCast || 0) === 0 && (ctx.window === "main2" || g.creatures(p).length >= 2) ? undefined : false) }
  });
  D({
    name: "Aura Shards", cost: "{1}{G}{W}", type: "Enchantment",
    text: "Whenever a creature you control enters, you may destroy target artifact or enchantment.",
    triggers: [{
      on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o),
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "artifactOrEnchantment", optional: true, purpose: "harm", prompt: "Aura Shards: destroy an artifact or enchantment", filter: (g2, o) => o.controller !== p }), s);
        if (t && t.zone === "battlefield") g.destroy(t, s);
      }
    }],
    ai: { priority: 6, threat: 2, target: (g, p, req) => (req.purpose === "harm" && req.src && req.src.def.name === "Aura Shards" ? (req.options.slice().sort((a, b) => threat(g, b, p) - threat(g, a, p))[0] || null) : undefined) }
  });
  D({
    name: "Fauna Shaman", cost: "{1}{G}", type: "Creature — Elf Shaman", pt: "2/2",
    text: "{G}, {T}, Discard a creature card: Search your library for a creature card, reveal it, put it into your hand, then shuffle.",
    note: "The creature card is discarded as the ability resolves (the same as a cost here: nothing can respond in between).",
    abilities: [{
      label: "Discard a creature card: find a creature", cost: "{G}", tap: true,
      condition: (g, o, p) => p.hand.some(isCreatureCard),
      do: async (g, s, ctx) => {
        const p = ctx.p, opts = p.hand.filter(isCreatureCard);
        if (!opts.length) return;
        let c = await g.ask(p, { type: "target", prompt: "Fauna Shaman: discard a creature card", options: opts, purpose: "survivalDiscard", src: s });
        if (!c || !opts.includes(c)) c = opts[0];
        g.discard(p, c);
        await g.search(p, { filter: (g2, x) => isCreatureCard(x), to: "hand", prompt: "Fauna Shaman: search for a creature card", src: s, purpose: "tutor" });
      },
      ai: { use: (g, p, o, ctx) => (ctx.window === "main1" || ctx.window === "main2" || myEndBeforeTurn(g, p, ctx)) && p.hand.filter(isCreatureCard).length >= 1 && p.library.length > 10 && g.maxX(p, pc(""), 1) >= 1 && p.hand.some(c => isCreatureCard(c) && c.def.mv >= 5) }
    }],
    ai: { priority: 7, tutor: true }
  });
  const PROT = [["W", "white"], ["U", "blue"], ["B", "black"], ["R", "red"], ["G", "green"]];
  D({
    name: "Mother of Runes", cost: "{W}", type: "Creature — Human Cleric", pt: "1/1",
    text: "{T}: Target creature you control gains protection from the color of your choice until end of turn.",
    note: "Protection here means: it can't be targeted, damaged or blocked by anything of that color until end of turn.",
    abilities: [{
      label: "Give protection", tap: true,
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Give protection to" }],
      do: async (g, s, ctx) => {
        const t = ctx.targets[0];
        if (!ctx.legal[0] || !t) return;
        const top = g.stack[g.stack.length - 1];
        const guess = top && top.p !== ctx.p ? ([...g.colorsOf(top.o)][0] || "B") : "B";
        const k = await g.ask(ctx.p, { type: "option", prompt: "Protection from which color?", options: PROT.map(([id, label]) => ({ id, label: label[0].toUpperCase() + label.slice(1) })), purpose: "protColor", src: s, guess });
        const col = PROT.some(x => x[0] === k) ? k : guess;
        g.addEffect({ objs: [t], prot: [col] });
        log(g, `${t.def.name} gains protection from ${PROT.find(x => x[0] === col)[1]} until end of turn.`, ctx.p, [s.def.name, t.def.name]);
      },
      ai: { use: () => false }
    }],
    ai: { priority: 6, option: (g, p, req) => (req.purpose === "protColor" ? req.guess : undefined) }
  });
  D({
    name: "Sylvan Tutor", cost: "{G}", type: "Sorcery",
    text: "Search your library for a creature card, reveal that card, then shuffle and put the card on top.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const got = await g.search(p, { filter: (g2, c) => isCreatureCard(c), to: "hand", prompt: "Sylvan Tutor: search for a creature card", src: ctx.o, purpose: "tutor" });
        // "shuffle, then put it on top": the search shuffled already
        for (const c of got) if (c.zone === "hand") { g.removeFromZone(c); c.zone = "library"; p.library.unshift(c); }
        g.bump();
      }
    },
    ai: { tutor: true, priority: 6 }
  });
  /* Faster-kill pass (2026-10-11): a third Devoted Druid partner and two more tutors for the Shalai list. */
  D({
    name: "Melira, Sylvok Outcast", cost: "{1}{W}", type: "Legendary Creature — Human Scout", pt: "2/2",
    text: "You can't get poison counters.\nCreatures you control can't have -1/-1 counters put on them.\nCreatures your opponents control lose infect.",
    note: "\"Lose infect\" is not modelled; the poison and -1/-1 parts are.",
    statics: [{
      counterPlus: (g, s, o, kind) => (kind === "m1" && o.controller === s.controller && g.isCreature(o) ? -1000 : 0),
      noPoison: (g, s, p) => p === s.controller
    }],
    ai: { priority: 5 }
  });
  D({
    name: "Congregation at Dawn", cost: "{G}{G}{W}", type: "Instant",
    text: "Search your library for up to three creature cards, reveal them, then shuffle and put those cards on top in any order.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const got = await g.search(p, { filter: (g2, c) => isCreatureCard(c), to: "hand", count: 3, prompt: "Congregation at Dawn: search for up to three creature cards", src: ctx.o, purpose: "tutor" });
        // the first card chosen ends on top
        for (const c of got.slice().reverse()) if (c.zone === "hand") { g.removeFromZone(c); c.zone = "library"; p.library.unshift(c); }
        g.bump();
      }
    },
    ai: { tutor: true, priority: 6 }
  });
  D({
    name: "Idyllic Tutor", cost: "{2}{W}", type: "Sorcery",
    text: "Search your library for an enchantment card, reveal it, put it into your hand, then shuffle.",
    spell: {
      do: async (g, ctx) => {
        await g.search(ctx.p, { filter: (g2, c) => typeOf(c, "Enchantment"), to: "hand", prompt: "Idyllic Tutor: search for an enchantment card", src: ctx.o, purpose: "tutor" });
      }
    },
    ai: { tutor: true, priority: 6 }
  });
  const landAura = (name, text, filter, bonus, extra) => D(Object.assign({
    name, cost: "{G}", type: "Enchantment — Aura", text,
    aura: true, enchant: "land",
    targets: [{ kind: "land", you: true, purpose: "help", prompt: `${name}: enchant a land`, filter }],
    statics: [{ tapManaBonus: (g, s, o) => (s.attachedTo === o ? bonus(g, s) : "") }],
    ai: {
      ramp: true, priority: 8,
      target: (g, p, req) => (req.purpose === "help" && req.src && req.src.def.name === name ? (req.options.filter(o => o.controller === p && !g.controlled(p, a => a.attachedTo === o).length).sort((a, b) => (a.tapped - b.tapped))[0] || req.options[0]) : undefined)
    }
  }, extra || {}));
  landAura("Wild Growth", "Enchant land\nWhenever enchanted land is tapped for mana, its controller adds an additional {G}.", null, () => "G");
  landAura("Utopia Sprawl", "Enchant Forest\nAs this Aura enters, choose a color.\nWhenever enchanted Forest is tapped for mana, its controller adds an additional one mana of the chosen color.",
    (g, o) => g.hasSub(o, "Forest"), (g, s) => s.state.color || "G",
    { etbState: (g, o) => ({ color: scarceColor(g, o.controller) }) });

  /* ================================================================ the Brago brain */
  /* Bot plan for the Brago list: protect and attack with Brago, and run the loops it holds:
     - Peregrine Drake + Deadeye Navigator: blink the Drake for {1}{U}, it untaps five lands (infinite mana);
     - Peregrine Drake + Archaeomancer + Ghostly Flicker (infinite mana, one Flicker cast at a time);
     - Isochron Scepter + Dramatic Reversal with three mana of rocks (infinite mana);
     then Walking Ballista with a huge X; or Heliod + Ballista (Ballista with two counters and
     lifelink). Infinite Scepter mana with no Ballista digs for it. The tutors fetch Ballista and the
     missing pair piece (tutorBonus, also for Trinket and Tribute Mage), Ballista, the Scepter and
     Mox Diamond wait for their moment (castOk), and The One Ring stops at a small burden (useOk).
     The counterspells, removal and value cards play by their own hints. */
  const BALLISTA = "Walking Ballista", DRAKE = "Peregrine Drake", DEADEYE = "Deadeye Navigator";
  const inHand = (p, n) => p.hand.find(c => c.def.name === n) || null;
  const castOf = (acts, c) => c && acts.find(a => a.type === "cast" && a.card === c && !a.alt);
  const pingable = (g, p) => g.opponents(p).filter(q => !q.lost && !g.playerHexproof(q));
  const killNeed = (g, p) => pingable(g, p).reduce((s, q) => s + Math.max(0, q.life), 0);
  const BMEMO = new WeakMap();
  function bmem(g, p) { let m = BMEMO.get(p); if (!m || m.g !== g || m.turn !== g.turn) { m = { g, turn: g.turn, loops: 0, ping: false }; BMEMO.set(p, m); } return m; }
  /* Tap every untapped land and nonland mana source that needs only {T}: the mana floats. */
  function floatAll(g, p, landsOnly) {
    let n = 0;
    for (const o of g.battlefield.slice()) {
      if (o.controller !== p || o.tapped) continue;
      if (landsOnly && !g.isLand(o)) continue;
      if (g.isCreature(o) && o.sick && !g.kw(o, "haste")) continue;
      const src = g.manaSources(p).find(s => s.o === o);
      if (!src) continue;
      const oi = src.options.findIndex(opt => !opt.cost && !opt.ab.sacSelf && !opt.ab.after && !opt.tapCreature);
      if (oi < 0) continue;
      g.activateMana(p, src, oi);
      n += src.options[oi].units.length * (src.mult || 1);
    }
    return n;
  }
  /* The mana the Drake's five lands make when they untap (the best five). */
  function drakeLands(g, p) {
    const outs = g.controlled(p, o => g.isLand(o)).map(o => { const s = g.manaSources(p).find(x => x.o === o); return s ? s.options[0].units.length * (s.mult || 1) : 1; }).sort((a, b) => b - a);
    const norn = onBf(g, p, "Elesh Norn, Mother of Machines").length ? 2 : 1;
    return outs.slice(0, 5 * norn).reduce((a, b) => a + b, 0);
  }
  /* Infinite mana is here: pour it into Walking Ballista and shoot. */
  function ballistaKill(g, p, acts, m) {
    const need = killNeed(g, p);
    if (!need) return null;
    const bal = onBf(g, p, BALLISTA).sort((a, b) => (b.counters.p1 || 0) - (a.counters.p1 || 0))[0];
    if (bal) {
      if ((bal.counters.p1 || 0) >= need) { m.ping = true; return { type: "activate", card: bal, idx: 1, repeat: Math.min(400, need + 2), stop: g2 => !pingable(g2, p).length || !(bal.counters.p1 > 0), maxTries: 4 }; }
      if (g.poolTotal(p) >= 4) return { type: "activate", card: bal, idx: 0, repeat: Math.min(need - (bal.counters.p1 || 0), Math.floor(g.poolTotal(p) / 4)), maxTries: 4 };
      return null;
    }
    const bh = inHand(p, BALLISTA), a = castOf(acts, bh);
    if (a && a.xMax >= Math.min(need, 60)) return { type: "cast", card: bh, x: Math.min(a.xMax, need), maxTries: 3 };
    return null;
  }
  /* The loops that make mana. Each returns an action, or null when it can't run. want: the mana to stop at. */
  /* Stop a loop that stopped making mana (an opponent's Rhystic Study tax eats the gain). */
  function progress(p) {
    let best = -1, flat = 0;
    return g2 => { const n = g2.poolTotal(p); if (n > best) { best = n; flat = 0; } else flat++; return flat >= 3; };
  }
  function drakeDeadeye(g, p, acts, m, want) {
    const drake = onBf(g, p, DRAKE).find(o => partnerOf(g, o) && partnerOf(g, o).def.name === DEADEYE);
    if (!drake || drakeLands(g, p) < 3) return null;
    const a = acts.find(x => x.type === "activate" && x.card === drake && x.ab && x.ab.label && x.ab.label.startsWith("{1}{U}"));
    if (!a) return null;
    m.loops++;
    floatAll(g, p, true);
    const stuck = progress(p);
    return { type: "activate", card: drake, idx: a.idx, repeat: 400, stop: g2 => { floatAll(g2, p, true); return g2.poolTotal(p) >= want || stuck(g2) || !(p.pool.U > 0 || g2.controlled(p, o => g2.isLand(o) && !o.tapped).length); }, maxTries: 6 };
  }
  function scepterLoop(g, p, acts, m, want) {
    const sc = g.controlled(p, o => o.def.name === "Isochron Scepter" && o.state.imprint && o.state.imprint.def.name === "Dramatic Reversal" && !o.tapped)[0];
    if (!sc) return null;
    if (rockMana(g, p) < 3) return null;
    const a = acts.find(x => x.type === "activate" && x.card === sc && x.idx === 0);
    if (!a) return null;
    m.loops++;
    floatAll(g, p, false);
    const stuck = progress(p);
    return { type: "activate", card: sc, idx: 0, repeat: 400, stop: g2 => { floatAll(g2, p, false); return g2.poolTotal(p) >= want || stuck(g2); }, maxTries: 6 };
  }
  /* The mana p's nonland permanents make each time Dramatic Reversal untaps them (tapped or not). */
  function rockMana(g, p) {
    let n = 0;
    for (const o of g.controlled(p, x => !g.isLand(x) && x.def.name !== "Isochron Scepter")) {
      if (g.isCreature(o) && o.sick && !g.kw(o, "haste")) continue;
      let best = 0;
      for (const ab of g.manaAbilities(o)) {
        if (!ab.tap || ab.cost || ab.sacSelf || ab.after || ab.tapCreature) continue;
        let prod = typeof ab.produce === "function" ? ab.produce(g, o) : ab.produce;
        if (!prod) continue;
        best = Math.max(best, Array.isArray(prod) ? prod[0].length : prod === "any" || prod === "any5" ? 1 : prod.startsWith("choice:") ? 1 : prod.length);
      }
      n += best;
    }
    return n;
  }
  function flickerLoop(g, p, acts, m, want) {
    const drake = onBf(g, p, DRAKE)[0], arch = onBf(g, p, "Archaeomancer")[0], gf = inHand(p, "Ghostly Flicker");
    if (!drake || !arch || !gf || drakeLands(g, p) < 4 || g.poolTotal(p) >= want || m.loops > 120) return null;
    const a = castOf(acts, gf);
    if (!a) return null;
    m.loops++;
    floatAll(g, p, true);
    return { type: "cast", card: gf, targets: [drake, arch], maxTries: 2 };
  }
  /* Heliod + Walking Ballista: Ballista with two counters and lifelink pings forever (each ping
     gains 1 life, and Heliod puts the counter back). Cast Ballista with the {1}{W} left over, grow a
     one-counter Ballista, give it lifelink, then shoot. */
  function heliodRoute(g, p, acts, m) {
    if (!onBf(g, p, "Heliod, Sun-Crowned").length) return null;
    const need = killNeed(g, p);
    const bal = onBf(g, p, BALLISTA).sort((a, b) => (b.counters.p1 || 0) - (a.counters.p1 || 0))[0];
    if (bal) {
      const c = bal.counters.p1 || 0;
      if (c >= 2 && g.kw(bal, "lifelink")) { m.ping = true; return { type: "activate", card: bal, idx: 1, repeat: Math.min(400, need + 5), stop: g2 => !pingable(g2, p).length || !(bal.counters.p1 > 0) || bal.zone !== "battlefield", maxTries: 4 }; }
      if (c >= 2) { const h = acts.find(x => x.type === "activate" && x.card.def.name === "Heliod, Sun-Crowned" && x.idx === 0); return h ? { type: "activate", card: h.card, idx: 0, maxTries: 2 } : null; }
      if (c === 1 && g.canPay(p, pc("{5}{W}"))) { const gr = acts.find(x => x.type === "activate" && x.card === bal && x.idx === 0); return gr ? { type: "activate", card: bal, idx: 0, maxTries: 2 } : null; }
      return null;
    }
    const bh = inHand(p, BALLISTA), a = castOf(acts, bh);
    if (!a) return null;
    for (let x = a.xMax; x >= 2; x--) if (g.canPay(p, pc(`{${2 * x + 1}}{W}`))) return { type: "cast", card: bh, x, maxTries: 2 };
    return null;
  }
  /* Infinite mana from the Scepter but no Walking Ballista yet: spend it digging. The tutors that
     find Ballista first (tutorBonus), then every draw: The One Ring (Reversal untaps it), Mind Stone,
     Mulldrifter and the cantrip creatures. The Scepter refills the pool between them. */
  const DIG_CASTS = ["Trinket Mage", "Recruiter of the Guard", "Enlightened Tutor", "Mulldrifter", "Sea Gate Oracle", "Wall of Omens", "Omen of the Sea", "Cryogen Relic", "Mind Stone", "Solemn Simulacrum", "Aether Channeler", "Mystic Remora"];
  function dig(g, p, acts, m) {
    m.dig = true;
    if ((m.digN = (m.digN || 0) + 1) > 60) return null;
    const sc = g.controlled(p, x => x.def.name === "Isochron Scepter" && x.state.imprint && x.state.imprint.def.name === "Dramatic Reversal")[0];
    const ring = onBf(g, p, "The One Ring")[0];
    const refill = () => {
      if (!sc || sc.tapped) return null;
      const a = acts.find(x => x.type === "activate" && x.card === sc && x.idx === 0);
      if (!a) return null;
      floatAll(g, p, false);
      const stuck = progress(p);
      return { type: "activate", card: sc, idx: 0, repeat: 400, stop: g2 => { floatAll(g2, p, false); return g2.poolTotal(p) >= 40 || stuck(g2); }, maxTries: 30 };
    };
    if (g.poolTotal(p) < 12) return refill();
    for (const n of DIG_CASTS) { const c = inHand(p, n), a = castOf(acts, c); if (a) return { type: "cast", card: c, maxTries: 1 }; }
    for (const a of acts) {
      if (a.type !== "activate" || !a.ab || !a.ab.label) continue;
      const n = a.card.def.name;
      if (n === "The One Ring" && a.ab.label.startsWith("Burden") && p.library.length > (a.card.counters.burden || 0) + 3) return { type: "activate", card: a.card, idx: a.idx, maxTries: 30 };
      if (n === "Cryogen Relic" && a.ab.sacSelf) return { type: "activate", card: a.card, idx: a.idx, maxTries: 1 };
    }
    // the Ring is tapped: one more Scepter activation untaps it
    if (ring && ring.tapped && p.library.length > (ring.counters.burden || 0) + 3) { const a = sc && !sc.tapped && acts.find(x => x.type === "activate" && x.card === sc && x.idx === 0); if (a) return { type: "activate", card: sc, idx: 0, maxTries: 30 }; }
    return null;
  }
  function bragoPlan(g, p, ctx) {
    const win = ctx.window, acts = ctx.actions || [];
    const m = bmem(g, p);
    if (!(win === "main1" || win === "main2") || g.active !== p || g.stack.length) return null;
    const need = killNeed(g, p);
    if (!need) return null;
    const hasSink = onBf(g, p, BALLISTA).length > 0 || !!inHand(p, BALLISTA);
    if (!hasSink) return scepterReady(g, p) && rockMana(g, p) >= 3 && p.library.some(c => c.def.name === BALLISTA) ? dig(g, p, acts, m) : null;
    const hel = heliodRoute(g, p, acts, m);
    if (hel) return hel;
    const kill = ballistaKill(g, p, acts, m);
    if (kill) return kill;
    if (m.loops > 150) return null;
    const want = 2 * Math.min(need, 120) + 8;
    if (m.loops >= 3 && g.poolTotal(p) < want) return null;
    return drakeDeadeye(g, p, acts, m, want) || scepterLoop(g, p, acts, m, want) || flickerLoop(g, p, acts, m, want);
  }
  function bragoChoose(g, p, req) {
    const m = bmem(g, p), sn = req.src && req.src.def && req.src.def.name;
    if (req.type === "target" && sn === BALLISTA && m.ping) { const q = (req.options || []).filter(o => g.isPlayer(o) && o !== p).sort((a, b) => a.life - b.life)[0]; if (q) return q; }
    if (sn === "Ghostly Flicker" && req.type === "target") {
      const want = req.purpose === "flicker" ? DRAKE : "Archaeomancer";
      const hit = (req.options || []).find(o => o.def && o.def.name === want);
      if (hit) return hit;
    }
    if (sn === "Archaeomancer" && req.type === "target") { const gf = (req.options || []).find(o => o.def.name === "Ghostly Flicker"); if (gf && onBf(g, p, DRAKE).length) return gf; }
    return undefined;
  }
  /* Brago, the Drake loop pieces and Ballista stay home unless the attack kills; Brago attacks when
     it can connect (no untapped flier or reach creature that could block it profitably). */
  function bragoKeepHome(g, p, a) {
    const n = a.def.name;
    if ([DRAKE, DEADEYE, "Archaeomancer", BALLISTA, "Heliod, Sun-Crowned", "Elesh Norn, Mother of Machines", "Soulherder"].includes(n)) return true;
    return false;
  }
  MK.DECK_BRAINS = MK.DECK_BRAINS || {};
  /* What the tutors fetch. Walking Ballista is the only kill, so it comes first once a partner is
     ready (Heliod, or a mana loop), and early anyway; then the card that completes a pair; then a
     half of the two-card pairs (Heliod + Ballista, Scepter + Reversal) over the three-card loops. */
  function bragoTutorBonus(g, p, o) {
    const n = o.def.name;
    const on = x => onBf(g, p, x).length > 0, held = x => on(x) || p.hand.some(c => c !== o && c.def.name === x);
    if (held(n)) return 0;
    const sc = scepterReady(g, p), scHalf = held("Isochron Scepter") || held("Dramatic Reversal");
    const loopReady = sc || (held("Isochron Scepter") && held("Dramatic Reversal")) || (held(DRAKE) && held(DEADEYE)) || (held(DRAKE) && held("Archaeomancer") && held("Ghostly Flicker"));
    switch (n) {
      case BALLISTA: return held("Heliod, Sun-Crowned") || loopReady ? 40 : 18;
      case "Heliod, Sun-Crowned": return held(BALLISTA) ? 34 : 15;
      case "Isochron Scepter": return held("Dramatic Reversal") ? 30 : sc ? 0 : 13;
      case "Dramatic Reversal": return held("Isochron Scepter") && !onBf(g, p, "Isochron Scepter").some(x => x.state.imprint) ? 30 : 12;
      case DRAKE: return held(DEADEYE) || (held("Archaeomancer") && held("Ghostly Flicker")) ? 24 : 6;
      case DEADEYE: return held(DRAKE) ? 24 : 4;
      case "Archaeomancer": case "Ghostly Flicker": return held(DRAKE) ? 10 : 2;
    }
    // the Scepter needs three mana of rocks to go infinite
    if (scHalf && rockMana(g, p) < 3) { const r = ROCK_WANT[n]; if (r) return r; }
    // a tutor is worth most of the best card it can still find (Spellseeker for Enlightened Tutor,
    // Recruiter for Trinket Mage)
    const finds = CHAIN[n];
    if (finds && !chaining) {
      chaining = true;
      try { return 0.7 * p.library.filter(c => c !== o && finds(c)).reduce((b, c) => Math.max(b, bragoTutorBonus(g, p, c)), 0); } finally { chaining = false; }
    }
    return 0;
  }
  let chaining = false;
  const isArt = c => c.def.types.includes("Artifact"), isEnch = c => c.def.types.includes("Enchantment");
  const CHAIN = {
    "Enlightened Tutor": c => isArt(c) || isEnch(c),
    "Mystical Tutor": c => isIS(c),
    "Trinket Mage": c => isArt(c) && c.def.mv <= 1,
    "Tribute Mage": c => isArt(c) && c.def.mv === 2,
    "Recruiter of the Guard": c => isCreatureCard(c) && (c.def.pt ? c.def.pt[1] : 0) <= 2,
    "Spellseeker": c => isIS(c) && c.def.mv <= 2
  };
  const ROCK_WANT = { "Grim Monolith": 22, "Mana Vault": 21, "Sol Ring": 20, "Basalt Monolith": 18, "Thought Vessel": 8, "Talisman of Progress": 8, "Azorius Signet": 8, "Arcane Signet": 8, "Fellwar Stone": 7, "Mind Stone": 7, "Coldsteel Heart": 7 };
  /* The tutors that take their own pick (Trinket Mage, Tribute Mage) ask here: the best fetch by
     tutorBonus, or null to leave it to their default. */
  function bragoTutor(g, p, pool) {
    let best = null, bs = 0;
    for (const c of pool) { const v = bragoTutorBonus(g, p, c); if (v > bs) { bs = v; best = c; } }
    return best;
  }
  function scepterReady(g, p) { return g.controlled(p, x => x.def.name === "Isochron Scepter" && x.state.imprint && x.state.imprint.def.name === "Dramatic Reversal").length > 0; }
  /* Cards the bot holds back: Isochron Scepter until Dramatic Reversal can go under it, Reversal
     itself while a Scepter could still carry it, and Walking Ballista until it kills (the brain
     casts it for the Heliod loop or a mana loop; a Ballista spent on a 1/1 loses the game's only
     kill). */
  function bragoCastOk(g, p, o, win) {
    const n = o.def.name, gone = x => p.graveyard.concat(p.exile).some(c => c.def.name === x);
    // Mox Diamond pitches a land: only a spare one (one more land still in hand, or plenty out)
    if (n === "Mox Diamond") return p.hand.filter(c => c !== o && g.isLand(c)).length >= 2 || g.controlled(p, x => g.isLand(x)).length >= 4;
    if (n === "Isochron Scepter") return !!inHand(p, "Dramatic Reversal") || gone("Dramatic Reversal");
    if (n === "Dramatic Reversal") return gone("Isochron Scepter") && !onBf(g, p, "Isochron Scepter").length;
    if (n === BALLISTA) {
      const low = Math.min(...pingable(g, p).map(q => q.life));
      return low <= Math.max(0, Math.floor(manaGuess(g, p) / 2)) || g.round >= 14;
    }
    return undefined;
  }
  const manaGuess = (g, p) => g.manaSources(p).reduce((n, s) => n + Math.max(0, ...s.options.filter(x => !x.cost).map(x => x.units.length)) * (s.mult || 1), 0) + g.poolTotal(p);
  /* Keep a seven with lands, mana, and something that moves toward a kill: a tutor, a combo piece or
     a draw engine. Six and fewer: any hand with two to five lands. */
  const B_TUTORS = ["Enlightened Tutor", "Mystical Tutor", "Recruiter of the Guard", "Trinket Mage", "Tribute Mage", "Spellseeker", "Urza's Saga"];
  const B_PIECES = [BALLISTA, "Heliod, Sun-Crowned", "Isochron Scepter", "Dramatic Reversal", DRAKE, DEADEYE];
  const B_ENGINES = ["Rhystic Study", "Mystic Remora", "Esper Sentinel", "Smothering Tithe", "The One Ring"];
  function bragoMulligan(g, p, { hand, mulls }) {
    const lands = hand.filter(o => o.def.types.includes("Land")).length;
    if (mulls >= 1) return mulls >= 2 ? lands >= 1 && lands <= 6 : lands >= 2 && lands <= 5;
    const accel = hand.filter(o => !o.def.types.includes("Land") && ROCK_WANT[o.def.name] != null || ["Chrome Mox", "Mox Diamond", "Ancient Tomb"].includes(o.def.name)).length;
    const action = hand.filter(o => B_TUTORS.includes(o.def.name) || B_PIECES.includes(o.def.name) || B_ENGINES.includes(o.def.name)).length;
    if (lands < 2 || lands > 5) return false;
    if (lands === 2 && accel === 0) return false;
    return action >= 1;
  }
  /* The One Ring draws while the burden stays small: its upkeep loss grows with every use. */
  function bragoUseOk(g, p, o, ab, win) {
    if (o.def.name === "The One Ring" && ab.label && ab.label.startsWith("Burden")) {
      const b = o.counters.burden || 0;
      if (bmem(g, p).dig) return true;
      return b <= 1 || (b === 2 && p.life >= 25);
    }
    return undefined;
  }
  MK.DECK_BRAINS.brago = { plan: bragoPlan, choose: bragoChoose, keepHome: bragoKeepHome, tutorBonus: bragoTutorBonus, tutor: bragoTutor, mulligan: bragoMulligan, castOk: bragoCastOk, useOk: bragoUseOk };

  /* ================================================================ the decks */
  const listOf = text => text.trim().split("\n").map(s => s.trim()).filter(Boolean);
  MK.BRAGO_LISTS = {
    uncapped: listOf(`Peregrine Drake
Deadeye Navigator
Isochron Scepter
Dramatic Reversal
Heliod, Sun-Crowned
Walking Ballista
Archaeomancer
Ghostly Flicker
Strionic Resonator
Sol Ring
Mana Vault
Grim Monolith
Basalt Monolith
Chrome Mox
Mox Diamond
Arcane Signet
Talisman of Progress
Azorius Signet
Fellwar Stone
Thought Vessel
Mind Stone
Force of Will
Force of Negation
Fierce Guardianship
Mana Drain
Swan Song
Counterspell
An Offer You Can't Refuse
Dovin's Veto
Flusterstorm
Swords to Plowshares
Path to Exile
Generous Gift
Cyclonic Rift
Reality Acid
Skyclave Apparition
Reflector Mage
Supreme Verdict
Enlightened Tutor
Mystical Tutor
Recruiter of the Guard
Trinket Mage
Tribute Mage
Muddle the Mixture
Spellseeker
Aether Channeler
Ephemerate
Cloudshift
Wall of Omens
Omen of the Sea
Mulldrifter
Cloud of Faeries
Venser, Shaper Savant
Soulherder
Elesh Norn, Mother of Machines
Solemn Simulacrum
Sea Gate Oracle
Cryogen Relic
Loran of the Third Path
Mystic Remora
Rhystic Study
Esper Sentinel
Smothering Tithe
The One Ring
Lightning Greaves
Teferi's Protection
Flawless Maneuver
Grand Abolisher
Command Tower
Tundra
Hallowed Fountain
Sea of Clouds
Adarkar Wastes
Flooded Strand
Marsh Flats
Arid Mesa
Scalding Tarn
Polluted Delta
Misty Rainforest
Prismatic Vista
Glacial Fortress
Port Town
Otawara, Soaring City
Ancient Tomb
Urza's Saga
Deserted Beach
Celestial Colonnade
Irrigated Farmland
Mystic Sanctuary
Island
Island
Island
Island
Island
Island
Plains
Plains
Plains
Plains`)
  };
  /* The 1,500 € list: Coldsteel Heart and an Island for Mox Diamond and Tundra. */
  MK.BRAGO_LISTS["1500"] = MK.BRAGO_LISTS.uncapped.map(n => (n === "Mox Diamond" ? "Coldsteel Heart" : n === "Tundra" ? "Island" : n));
  const bragoDeck = (id, name, list, extra) => Object.assign({
    id, name, title: "Brago, King Eternal", commander: "Brago, King Eternal",
    identity: ["W", "U"], bracket: 4, aggression: 0.5,
    style: "Azorius blink and control",
    blurb: "Bracket 4 Azorius blink: Brago flickers mana rocks and enters-the-battlefield creatures every time it connects, counterspells protect it, and Peregrine Drake loops (with Deadeye Navigator, or Archaeomancer + Ghostly Flicker) or Isochron Scepter + Dramatic Reversal make infinite mana for Walking Ballista.",
    watch: ["Peregrine Drake", "Deadeye Navigator", "Isochron Scepter"],
    list
  }, extra || {});
  /* Two bot decks from ju's Miku high-B4 research (research/miku-b4/decklist-brago-*.txt). */
  MK.BRAGO_DECK = bragoDeck("brago", "Brago", MK.BRAGO_LISTS.uncapped);
  MK.BRAGO_1500_DECK = bragoDeck("brago-1500", "Brago 1500", MK.BRAGO_LISTS["1500"], { blurb: "The 1,500 € Brago list: the same blink and Drake loops, with Coldsteel Heart and an Island for Mox Diamond and Tundra." });
  MK.DECK_BRAINS["brago-1500"] = MK.DECK_BRAINS.brago;
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push(MK.BRAGO_DECK, MK.BRAGO_1500_DECK);
})(typeof window !== "undefined" ? window : globalThis);
