/* Spider-Verse: a five-color Spider tribal bot deck led by Cosmic Spider-Man (Marvel's Spider-Man).
   How it wins: a low curve of legendary Spider heroes (Spider-Punk, Spider-Girl, Spider-Ham, Araña,
   Silk, Spider-Man India...) goes wide, and at the beginning of each of our combats Cosmic
   Spider-Man gives every other Spider flying, first strike, trample, lifelink and haste. Spider-Ham,
   Coat of Arms, Shared Animosity, Aunt May and the +1/+1 counter cards make that air force big;
   Mary Jane Watson, Kindred Discovery, Coastal Piracy, Ohran Frostfang and Spider-UK refill the hand;
   web-slinging recasts the creatures that already attacked (their enters abilities again) for a
   cheap cost, and Craterhoof Behemoth ends the game.
   Around it: a five-color mana base (Command Tower, triomes, shocks, fetches, Mana Confluence...),
   dorks and rocks, efficient removal, and protection for the commander (Lightning Greaves,
   Swiftfoot Boots, Giver of Runes, Fierce Guardianship, Flawless Maneuver, Teferi's Protection).
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   Cosmic Spider-Man's hints (they run from the command zone too) are the deck's brain: web-slinging
   in main phase 2 (ai.plan), where the Equipment goes (ai.targetPlan) and an attack plan that sends
   the Spiders he made safe fliers with lifelink instead of keeping them home (ai.attackPlan). */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};
  const DECK_ID = "spiderverse", COSMIC = "Cosmic Spider-Man";
  const cost = s => MK.parseCost(s);

  /* ================================================================ helpers */
  const mine = (s, o) => o.controller === s.controller;
  const trig = spec => Object.assign({ trigger: true }, spec);
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));
  const manaNow = (g, p) => g.maxX(p, cost(""), 1);
  const isLandCard = c => c.def.types.includes("Land");
  const landCount = (g, p) => g.controlled(p, o => g.isLand(o)).length;
  const isSpider = (g, o) => g.hasSub(o, "Spider");
  const spiderCard = c => c.def.types.includes("Creature") && (c.def.subtypes.includes("Spider") || !!c.def.changeling);
  const named = (g, p, n) => g.battlefield.some(o => o.controller === p && o.def.name === n);
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;
  const log = (g, text, p, cards) => g.log(text, { p, cards: cards || [] });
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) log(g, `${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, p, [src.def.name]);
    return got;
  }
  /* "Modified": it has a counter, or an Equipment or an Aura its controller controls is attached. */
  const modified = (g, o) => Object.values(o.counters || {}).some(n => n > 0) ||
    g.battlefield.some(a => a.attachedTo === o && a.controller === o.controller);
  const humanCitizen = MK.tokenDef({ key: "citizen-gw-human", name: "Human Citizen", pt: [1, 1], colors: "GW", subtypes: ["Human", "Citizen"] });
  const spiderToken = MK.tokenDef({ key: "spider-g21-reach", name: "Spider", pt: [2, 1], colors: "G", subtypes: ["Spider"], keywords: ["reach"] });
  const food = T.food || MK.tokenDef({
    key: "food", name: "Food", types: ["Artifact"], subtypes: ["Food"], colors: [], text: "{2}, {T}, Sacrifice this token: You gain 3 life.",
    abilities: [{ label: "Gain 3 life", cost: "{2}", tap: true, sacSelf: true, do: (g, s, ctx) => g.gainLife(ctx.p, 3, s), ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && p.life < 25 } }]
  });
  /* The best opposing permanent among the options and its threat score. */
  function bestOpposing(g, p, list) {
    let best = null, score = -1e9;
    for (const t of list) {
      if (g.isPlayer(t) || t.controller === p) continue;
      const s = threatOf(g, t, p);
      if (s > score) { score = s; best = t; }
    }
    return { best, score };
  }
  const etbRemovalCast = (spec, minThreat) => (g, p, o) => {
    const { best, score } = bestOpposing(g, p, g.targetOptions(p, spec, o));
    if (!best || score < minThreat) return false;
    return 15 + o.def.mv * 0.6 + score * 0.5;
  };
  /* A card the deck is glad to discard (Spider-Gwen, Kaine): a mayhem card,
     or a land when there are enough on the battlefield. null when nothing is spare. */
  function spareCard(g, p, exclude) {
    const hand = p.hand.filter(c => c !== exclude);
    const may = hand.find(c => c.def.mayhem);
    if (may) return may;
    const lands = hand.filter(isLandCard);
    if (lands.length && (landCount(g, p) >= 5 || lands.length >= 3)) return lands[0];
    const dead = hand.filter(c => !isLandCard(c) && c.def.mv >= landCount(g, p) + 4).sort((a, b) => b.def.mv - a.def.mv);
    return dead[0] || null;
  }
  /* The stack's top item is an opponent's that would take away much of p's board. */
  function boardThreatened(g, p) {
    const top = g.stack[g.stack.length - 1];
    if (!top || top.p === p) return false;
    const mh = AIX().massHarm ? AIX().massHarm(g, p, top) : null;
    if (mh && (mh.kind === "destroy" || mh.kind === "damage") && (mh.value >= 10 || mh.hit.some(o => o.isCommander))) return true;
    const ai = (top.o && top.o.def && top.o.def.ai) || {};
    return !!ai.removal && (top.targets || []).some(t => t && !g.isPlayer(t) && t.controller === p && (t.isCommander || valueOf(g, t) >= 7));
  }

  /* ================================================================ the commander */
  const COSMIC_KW = ["flying", "first strike", "trample", "lifelink", "haste"];
  D({
    name: COSMIC, cost: "{W}{U}{B}{R}{G}", type: "Legendary Creature — Spider Human Hero", pt: "5/5",
    keywords: COSMIC_KW.slice(),
    text: "Flying, first strike, trample, lifelink, haste\nAt the beginning of combat on your turn, other Spiders you control gain flying, first strike, trample, lifelink, and haste until end of turn.",
    triggers: [{
      on: "beginCombat", when: (g, s, ev) => ev.p === s.controller,
      do: (g, s, ev, { p }) => {
        const list = g.controlled(p, o => o !== s && g.isCreature(o) && isSpider(g, o));
        if (!list.length) return;
        g.addEffect({ objs: list, kw: COSMIC_KW.slice() });
        log(g, `${COSMIC}: ${list.length} other Spider${list.length > 1 ? "s" : ""} gain flying, first strike, trample, lifelink and haste.`, p, [COSMIC]);
      }
    }],
    ai: { priority: 9, plan: (g, p, o, ctx) => webPlan(g, p, ctx), targetPlan: equipPick, attackPlan }
  });

  /* Equipment for the bots: Lightning Greaves and Swiftfoot Boots go on Cosmic Spider-Man, Skullclamp
     on a creature it kills (a token first), never on the commander. */
  function equipPick(g, p, req) {
    if (req.purpose !== "equip" || !req.src) return undefined;
    const eq = req.src.def.name, opts = req.options.filter(o => !g.isPlayer(o) && o.controller === p);
    const worn = o => g.battlefield.some(a => a !== req.src && a.attachedTo === o && (a.def.name === "Lightning Greaves" || a.def.name === "Swiftfoot Boots"));
    if (eq === "Lightning Greaves" || eq === "Swiftfoot Boots") {
      const cosmic = opts.find(o => o.def.name === COSMIC && !worn(o));
      if (cosmic) return cosmic;
      return opts.filter(o => !worn(o)).sort((a, b) => valueOf(g, b) - valueOf(g, a))[0];
    }
    if (eq === "Skullclamp") {
      const ok = opts.filter(o => !o.isCommander);
      const dies = ok.filter(o => g.toughness(o) <= 1).sort((a, b) => (b.isToken - a.isToken) || valueOf(g, a) - valueOf(g, b));
      if (dies.length) return dies[0];
      return ok.sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];
    }
    return undefined;
  }

  /* Attacks for the bots. Once Cosmic Spider-Man has handed out his keywords, a Spider that no
     untapped blocker of some opponent can kill goes in at that opponent: lifelink pays back the
     crack-back the rules of thumb fear, so the deck doesn't keep its air force home. */
  function attackPlan(g, p, ctx) {
    if (!named(g, p, COSMIC)) return null;
    const fight = AIX().fight;
    if (!fight) return null;
    const decl = ctx.decl.slice();
    const sent = new Set(decl.map(d => d.attacker));
    const players = ctx.targets.filter(t => g.isPlayer(t) && !t.lost);
    if (!players.length) return null;
    const threatIn = Math.max(0, ...g.opponents(p).map(q => g.creatures(q).filter(c => !g.kw(c, "defender")).reduce((n, c) => n + Math.max(0, g.power(c)), 0)));
    const lifelinkPower = ctx.candidates.filter(c => g.kw(c, "lifelink")).reduce((n, c) => n + Math.max(0, g.power(c)), 0);
    // stay home only when the table could kill us next turn even after the life we gain
    if (p.life + lifelinkPower <= threatIn) return null;
    const safeAt = (a, q) => !g.creatures(q).some(b => !b.tapped && g.canBlock(b, a) && fight(g, a, b).aDies);
    // the opponent the rest of the attack already goes at, then the lowest life
    const count = new Map();
    for (const d of decl) { const q = g.defenderOf(d.target); count.set(q, (count.get(q) || 0) + 1); }
    for (const a of ctx.candidates) {
      if (sent.has(a) || g.power(a) <= 0 || (a.def.mana.length && g.power(a) <= 1)) continue;
      if (!g.kw(a, "flying") && !g.kw(a, "lifelink")) continue;
      const ok = players.filter(q => safeAt(a, q));
      if (!ok.length) continue;
      const q = ok.slice().sort((x, y) => ((count.get(y) || 0) - (count.get(x) || 0)) || (x.life - y.life))[0];
      decl.push({ attacker: a, target: q });
      sent.add(a);
      count.set(q, (count.get(q) || 0) + 1);
    }
    return decl.length > ctx.decl.length ? decl : null;
  }

  /* Web-slinging for the bots. The engine already casts with web-slinging when the full cost can't be
     paid (it scores the alternative 2 lower). This plan, in main phase 2, also takes the web-slinging
     cost when it is the better deal: Spiders-Man's horde and Scarlet Spider's counters. (Saving mana
     with web-slinging tested worse: the bounced creature costs a card's worth of tempo.) */
  function webPlan(g, p, ctx) {
    if (ctx.window !== "main2" || g.active !== p) return null;
    const acts = ctx.actions || [];
    const webs = acts.filter(a => a.type === "cast" && a.alt && a.card.zone === "hand" && ((a.card.def.altCosts || [])[a.alt - 1] || {}).bounceTapped);
    if (!webs.length) return null;
    for (const a of webs) {
      const n = a.card.def.name;
      const back = g.webSlingers(p, a.card).filter(c => !c.isCommander);
      if (!back.length) continue;
      if (n === "Spiders-Man, Heroic Horde") return { type: "cast", card: a.card, alt: a.alt };
      if (n === "Scarlet Spider, Ben Reilly" && back.some(c => !c.isToken && g.mvOf(c) >= 2)) return { type: "cast", card: a.card, alt: a.alt };
    }
    return null;
  }
  /* Which tapped creature goes back to the hand: one with an enters ability, cheap to recast. */
  function webPick(g, p, req, prefer) {
    if (req.purpose !== "webSling") return undefined;
    const opts = req.options.filter(o => !o.isCommander);
    if (!opts.length) return undefined;
    const etb = o => ((o.def.triggers || []).some(t => t.on === "enters" && t.self) ? 3 : 0);
    const score = o => (prefer ? prefer(o) : 0) + etb(o) - valueOf(g, o) * 0.4 - g.mvOf(o) * 0.5 - (o.isToken ? 30 : 0);
    return opts.slice().sort((a, b) => score(b) - score(a))[0];
  }
  const webAI = extra => Object.assign({ target: (g, p, req) => webPick(g, p, req) }, extra || {});
  const web = c => [{ label: "Web-slinging", cost: c, bounceTapped: true }];

  /* ================================================================ one- and two-drops */
  D({
    name: "Spinneret and Spiderling", cost: "{R}", type: "Legendary Creature — Spider Human Hero", pt: "1/2",
    text: "Whenever you attack with two or more Spiders, put a +1/+1 counter on Spinneret and Spiderling.\nWhenever Spinneret and Spiderling deals 4 or more damage, exile the top card of your library. Until the end of your next turn, you may play that card.",
    triggers: [
      {
        on: "attack", when: (g, s, ev) => ev.p === s.controller && (ev.attackers || []).filter(a => isSpider(g, a)).length >= 2,
        do: (g, s) => { if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s); }
      },
      {
        on: "damage", when: (g, s, ev) => ev.src === s && ev.amount >= 4,
        do: (g, s, ev, { p }) => {
          const got = g.impulse(p, 1);
          for (const c of got) {
            c.playable = { by: p, turn: g.turn, forever: true };
            const zc = c.zc;
            g.delayed.push({ at: "endStep", once: true, player: p, controller: p, turn: g.active === p ? g.turn + 1 : g.turn, do: async () => { if (c.zone === "exile" && c.zc === zc && c.playable) c.playable = null; } });
          }
        }
      }
    ],
    ai: { priority: 8 }
  });
  D({
    name: "Radioactive Spider", cost: "{G}", type: "Creature — Spider", pt: "1/1",
    keywords: ["reach", "deathtouch"],
    text: "Reach, deathtouch\nFateful Bite — {2}, Sacrifice this creature: Search your library for a Spider Hero card, reveal it, put it into your hand, then shuffle. Activate only as a sorcery.",
    abilities: [{
      label: "Fateful Bite: find a Spider Hero", cost: "{2}", sacSelf: true, timing: "sorcery",
      do: async (g, s, ctx) => {
        const p = ctx.p;
        const got = await g.search(p, { filter: (g2, c) => c.def.subtypes.includes("Spider") && c.def.subtypes.includes("Hero"), to: "hand", prompt: "Search for a Spider Hero card", src: s, purpose: "spiderTutor" });
        if (got && got.length) log(g, `${p.name} reveals ${got.map(c => c.def.name).join(", ")} (Radioactive Spider).`, p, got.map(c => c.def.name));
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main2" && g.turn > 2 && manaNow(g, p) >= 2 && p.hand.filter(c => !isLandCard(c)).length <= 2 }
    }],
    ai: {
      priority: 6,
      cards: (g, p, req) => {
        if (req.purpose !== "spiderTutor") return null;
        const lands = landCount(g, p) + 1;
        const score = c => (c.def.mv <= lands ? c.def.mv + ((c.def.ai && c.def.ai.priority) || 5) * 0.5 : c.def.mv - 10);
        return [req.options.slice().sort((a, b) => score(b) - score(a))[0]];
      }
    }
  });
  D({
    name: "Aunt May", cost: "{W}", type: "Legendary Creature — Human Citizen", pt: "0/2",
    text: "Whenever another creature you control enters, you gain 1 life. If it's a Spider, put a +1/+1 counter on it.",
    triggers: [{
      on: "enters", when: (g, s, ev) => ev.o !== s && mine(s, ev.o) && g.isCreature(ev.o),
      do: (g, s, ev, { p }) => {
        g.gainLife(p, 1, s);
        if (ev.o.zone === "battlefield" && isSpider(g, ev.o)) g.addCounters(ev.o, "p1", 1, s);
      }
    }],
    ai: { priority: 8 }
  });
  /* Riot, as a trigger: the Spider gets a +1/+1 counter or haste (until end of turn: haste only
     matters the turn it arrives). */
  async function riot(g, s, o, p) {
    if (o.zone !== "battlefield") return;
    const k = await g.ask(p, { type: "option", prompt: `Riot (${o.def.name}): a +1/+1 counter or haste?`, options: [{ id: "counter", label: "+1/+1 counter" }, { id: "haste", label: "Haste" }], purpose: "riot", src: s, subject: o });
    if (o.zone !== "battlefield") return;
    if (k === "haste") { g.addEffect({ objs: [o], kw: ["haste"] }); log(g, `${o.def.name} gains haste (riot).`, p, [o.def.name]); }
    else g.addCounters(o, "p1", 1, s);
  }
  function riotPick(g, p, req) {
    if (req.purpose !== "riot") return undefined;
    const o = req.subject;
    if (!o || g.active !== p || g.phase !== "main1") return "counter";
    if (named(g, p, COSMIC) || g.kw(o, "haste") || g.kw(o, "defender")) return "counter";
    return g.power(o) >= 2 ? "haste" : "counter";
  }
  D({
    name: "Spider-Punk", cost: "{1}{R}", type: "Legendary Creature — Spider Human Hero", pt: "2/1",
    keywords: ["riot"],
    text: "Riot (This creature enters with your choice of a +1/+1 counter or haste.)\nOther Spiders you control have riot.\nSpells and abilities can't be countered.\nDamage can't be prevented.",
    note: "Riot is a trigger as the Spider enters, and its haste lasts until end of turn. \"Damage can't be prevented\" is not implemented.",
    triggers: [{
      on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o) && (ev.o === s || isSpider(g, ev.o)),
      do: (g, s, ev, { p }) => riot(g, s, ev.o, p)
    }],
    statics: [{ uncounterable: () => true }],
    ai: { priority: 9, option: riotPick }
  });
  D({
    name: "Spider-Girl, Legacy Hero", cost: "{G}{W}", type: "Legendary Creature — Spider Human Hero", pt: "2/2",
    text: "During your turn, Spider-Girl has flying.\nWhen Spider-Girl leaves the battlefield, create a 1/1 green and white Human Citizen creature token.",
    statics: [{ applies: (g, s, o) => o === s && g.active === s.controller, kw: ["flying"] }],
    triggers: [{ on: "leaves", self: true, do: (g, s, ev, { p }) => g.createToken(ev.lki && ev.lki.controller ? ev.lki.controller : p, humanCitizen) }],
    ai: { priority: 7 }
  });
  const HAM_TYPES = ["Spider", "Boar", "Bat", "Bear", "Bird", "Cat", "Dog", "Frog", "Jackal", "Lizard", "Mouse", "Otter", "Rabbit", "Raccoon", "Rat", "Squirrel", "Turtle", "Wolf"];
  D({
    name: "Spider-Ham, Peter Porker", cost: "{1}{G}", type: "Legendary Creature — Spider Boar Hero", pt: "2/2",
    text: "When Spider-Ham enters, create a Food token. (It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")\nAnimal May-Ham — Other Spiders, Boars, Bats, Bears, Birds, Cats, Dogs, Frogs, Jackals, Lizards, Mice, Otters, Rabbits, Raccoons, Rats, Squirrels, Turtles, and Wolves you control get +1/+1.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, food) }],
    statics: [{ applies: (g, s, o) => o !== s && mine(s, o) && g.isCreature(o) && (!!o.def.changeling || HAM_TYPES.some(t => o.def.subtypes.includes(t))), pt: [1, 1] }],
    ai: { priority: 9 }
  });
  D({
    name: "Spectacular Spider-Man", cost: "{1}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/2",
    keywords: ["flash"],
    text: "Flash\n{1}: Spectacular Spider-Man gains flying until end of turn.\n{1}, Sacrifice Spectacular Spider-Man: Creatures you control gain hexproof and indestructible until end of turn.",
    abilities: [
      {
        label: "Gain flying", cost: "{1}",
        do: (g, s) => { if (s.zone === "battlefield") g.addEffect({ objs: [s], kw: ["flying"] }); },
        ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && !o.sick && !o.tapped && !g.kw(o, "flying") && !named(g, p, COSMIC) && manaNow(g, p) >= 1 }
      },
      {
        label: "Sacrifice: hexproof and indestructible", cost: "{1}", sacSelf: true,
        do: (g, s, ctx) => {
          const list = g.creatures(ctx.p);
          if (list.length) g.addEffect({ objs: list, kw: ["hexproof", "indestructible"] });
          log(g, `${ctx.p.name}'s creatures gain hexproof and indestructible (Spectacular Spider-Man).`, ctx.p, ["Spectacular Spider-Man"]);
        },
        ai: {
          inStack: true,
          use: (g, p, o, ctx) => ((ctx.window === "stack" || ctx.window === "ability") && boardThreatened(g, p)) ||
            (ctx.window === "combat" && (AIX().combatSave ? AIX().combatSave(g, p) : 0) >= 9)
        }
      }
    ],
    ai: { priority: 7 }
  });
  D({
    name: "Scarlet Spider, Kaine", cost: "{B}{R}", type: "Legendary Creature — Spider Human Hero", pt: "2/1",
    keywords: ["menace"],
    mayhem: "{B/R}",
    text: "Menace (This creature can't be blocked except by two or more creatures.)\nWhen Scarlet Spider enters, you may discard a card. If you do, put a +1/+1 counter on him.\nMayhem {B/R} (You may cast this card from your graveyard for {B/R} if you discarded it this turn. Timing rules still apply.)",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        if (!p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Scarlet Spider: you may discard a card (he gets a +1/+1 counter)", options: p.hand.slice(), min: 0, max: 1, purpose: "kaineDiscard", src: s });
        const c = (pick || [])[0];
        if (!c || c.zone !== "hand") return;
        g.discard(p, c);
        if (s.zone === "battlefield") g.addCounters(s, "p1", 1, s);
      }
    }],
    ai: { priority: 7, cards: (g, p, req) => { if (req.purpose !== "kaineDiscard") return null; const c = spareCard(g, p); return c ? [c] : []; } }
  });
  D({
    name: "Spider-Man 2099", cost: "{U}{R}", type: "Legendary Creature — Spider Human Hero", pt: "2/3",
    keywords: ["double strike", "vigilance"],
    text: "From the Future — You can't cast Spider-Man 2099 during your first, second, or third turns of the game.\nDouble strike, vigilance\nAt the beginning of your end step, if you've played a land or cast a spell this turn from anywhere other than your hand, Spider-Man 2099 deals damage equal to his power to any target.",
    note: "The end step counts spells cast from anywhere other than the hand (the command zone, a graveyard, exile, the library); lands played from elsewhere are not counted.",
    canCast: (g, p) => (p.turnsTaken || 0) > 3 || g.active !== p,
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      intervening: (g, s) => g.castThisTurn(s.controller, e => !!e.from && e.from !== "hand") > 0,
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield") return;
        const n = Math.max(0, g.power(s));
        if (!n) return;
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `Spider-Man 2099 deals ${n} damage to any target` }), s);
        if (t) g.damage(s, t, n);
      }
    }],
    ai: { priority: 7 }
  });
  D({
    name: "Spiders-Man, Heroic Horde", cost: "{1}{G}", type: "Legendary Creature — Spider Hero", pt: "2/3",
    text: "Web-slinging {4}{G}{G} (You may cast this spell for {4}{G}{G} if you also return a tapped creature you control to its owner's hand.)\nWhen Spiders-Man enters, if they were cast using web-slinging, you gain 3 life and create two 2/1 green Spider creature tokens with reach.",
    altCosts: web("{4}{G}{G}"),
    etbState: (g, o, opts) => ({ webbed: !!(opts && opts.web != null) }),
    triggers: [{
      on: "enters", self: true, intervening: (g, s) => !!s.state.webbed,
      do: (g, s, ev, { p }) => { g.gainLife(p, 3, s); g.createToken(p, spiderToken, { count: 2 }); }
    }],
    // with six mana it waits for main phase 2, where the attackers are tapped and web-slinging pays off
    ai: webAI({ priority: 6, cast: (g, p, o, ctx) => (ctx.window === "main1" && g.active === p && manaNow(g, p) >= 6 && g.creatures(p).length > 0 ? false : undefined) })
  });
  D({
    name: "Spider Manifestation", cost: "{1}{R/G}", type: "Creature — Spider Avatar", pt: "2/2",
    keywords: ["reach"],
    text: "Reach\n{T}: Add {R} or {G}.\nWhenever you cast a spell with mana value 4 or greater, untap this creature.",
    mana: [{ tap: true, produce: ["R", "G"] }],
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.mv >= 4 && s.tapped, do: (g, s) => { if (s.zone === "battlefield") g.untap(s); } }],
    ai: { priority: 7, ramp: true }
  });

  /* ================================================================ three-drops */
  D({
    name: "Mary Jane Watson", cost: "{1}{G/W}", type: "Legendary Creature — Human Performer", pt: "2/2",
    text: "Whenever a Spider you control enters, draw a card. This ability triggers only once each turn.",
    triggers: [{
      on: "enters", when: (g, s, ev) => mine(s, ev.o) && g.isCreature(ev.o) && isSpider(g, ev.o) && s.state.mjTurn !== g.turn,
      do: (g, s, ev, { p }) => { s.state.mjTurn = g.turn; drawLog(g, p, 1, s); }
    }],
    ai: { priority: 8 }
  });
  D({
    name: "Spider-Man, Web-Slinger", cost: "{2}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/3",
    text: "Web-slinging {W} (You may cast this spell for {W} if you also return a tapped creature you control to its owner's hand.)",
    altCosts: web("{W}"),
    ai: webAI({ priority: 6 })
  });
  const NONCREATURE_TYPES = ["Instant", "Sorcery", "Artifact", "Enchantment", "Planeswalker", "Battle", "Kindred"];
  /* Arachne's tax lives in one emblem per player: spells of a type named by an Arachne on the
     battlefield cost {1} more for each such Arachne. */
  const ARACHNE_EMBLEM = "Arachne's web";
  function arachneEmblem(g) {
    for (const pl of g.players) {
      if (pl.emblems.some(e => e.name === ARACHNE_EMBLEM)) continue;
      pl.emblems.push({
        name: ARACHNE_EMBLEM, text: "Spells of the card type named by an Arachne, Psionic Weaver on the battlefield cost {1} more to cast.",
        statics: [{ costMod: (g2, s, card) => -g2.battlefield.filter(a => a.def.name === "Arachne, Psionic Weaver" && a.state.arachneType && card.def.types.includes(a.state.arachneType)).length }]
      });
    }
    g.ts++;
    g.bump();
  }
  D({
    name: "Arachne, Psionic Weaver", cost: "{2}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/3",
    text: "Web-slinging {W} (You may cast this spell for {W} if you also return a tapped creature you control to its owner's hand.)\nAs Arachne enters, look at an opponent's hand, then choose a card type other than creature.\nSpells of the chosen type cost {1} more to cast.",
    note: "The opponent and the card type are chosen right after she enters.",
    altCosts: web("{W}"),
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opps = g.opponents(p);
        if (!opps.length) return;
        const q = opps.length === 1 ? opps[0] : await g.ask(p, { type: "player", prompt: "Arachne: look at an opponent's hand", options: opps, purpose: "arachneLook", src: s });
        const who = opps.includes(q) ? q : opps[0];
        const opts = NONCREATURE_TYPES.map(t => ({ id: t, label: t }));
        const k = await g.ask(p, { type: "option", prompt: `Arachne (${who.name}'s hand: ${who.hand.map(c => c.def.name).join(", ") || "empty"}): choose a card type`, options: opts, purpose: "arachneType", src: s, look: who });
        const t = NONCREATURE_TYPES.includes(k) ? k : "Instant";
        if (s.zone !== "battlefield") return;
        s.state.arachneType = t;
        arachneEmblem(g);
        log(g, `${p.name} looks at ${who.name}'s hand and names ${t} (Arachne): those spells cost {1} more.`, p, [s.def.name]);
      }
    }],
    ai: webAI({
      priority: 6,
      option: (g, p, req) => {
        if (req.purpose !== "arachneType") return undefined;
        const n = {};
        const cards = (req.look ? req.look.hand : []).concat(...g.opponents(p).map(q => q.hand));
        for (const c of cards) for (const t of c.def.types) if (NONCREATURE_TYPES.includes(t)) n[t] = (n[t] || 0) + 1;
        return Object.keys(n).sort((a, b) => n[b] - n[a])[0] || "Instant";
      }
    })
  });
  D({
    name: "Spider-Byte, Web Warden", cost: "{2}{U}", type: "Legendary Creature — Spider Avatar Hero", pt: "2/2",
    text: "When Spider-Byte enters, return up to one target nonland permanent to its owner's hand.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "nonland", purpose: "harm", optional: true, prompt: "Spider-Byte: return up to one nonland permanent to its owner's hand" }), s);
        if (t && t.zone === "battlefield") g.bounce(t);
      }
    }],
    ai: {
      priority: 6,
      target: (g, p, req) => {
        if (req.purpose !== "harm") return undefined;
        const { best } = bestOpposing(g, p, req.options);
        return best || null;
      }
    }
  });
  D({
    name: "Spider-Gwen, Free Spirit", cost: "{2}{R}", type: "Legendary Creature — Spider Human Hero", pt: "2/3",
    keywords: ["reach"],
    text: "Reach\nWhenever Spider-Gwen becomes tapped, you may discard a card. If you do, draw a card.",
    triggers: [{
      on: "becomesTapped", when: (g, s, ev) => ev.o === s,
      do: async (g, s, ev, { p }) => {
        if (!p.hand.length) return;
        const pick = await g.ask(p, { type: "cards", prompt: "Spider-Gwen: you may discard a card to draw a card", options: p.hand.slice(), min: 0, max: 1, purpose: "gwenRummage", src: s });
        const c = (pick || [])[0];
        if (!c || c.zone !== "hand") return;
        g.discard(p, c);
        drawLog(g, p, 1, s);
      }
    }],
    ai: { priority: 6, cards: (g, p, req) => { if (req.purpose !== "gwenRummage") return null; const c = spareCard(g, p); return c ? [c] : []; } }
  });
  D({
    name: "Scarlet Spider, Ben Reilly", cost: "{1}{R}{G}", type: "Legendary Creature — Spider Human Hero", pt: "4/3",
    keywords: ["trample"],
    text: "Web-slinging {R}{G} (You may cast this spell for {R}{G} if you also return a tapped creature you control to its owner's hand.)\nTrample\nSensational Save — If Scarlet Spider was cast using web-slinging, he enters with X +1/+1 counters on him, where X is the mana value of the returned creature.",
    altCosts: web("{R}{G}"),
    etbCounters: (g, o, opts) => (opts && opts.web ? { p1: opts.web } : {}),
    ai: { priority: 7, target: (g, p, req) => webPick(g, p, req, o => g.mvOf(o) * 1.2) }
  });
  D({
    name: "Araña, Heart of the Spider", cost: "{1}{R}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/3",
    text: "Whenever you attack, put a +1/+1 counter on target attacking creature.\nWhenever a modified creature you control deals combat damage to a player, exile the top card of your library. You may play that card this turn. (Equipment, Auras you control, and counters are modifications.)",
    triggers: [
      {
        on: "attack", when: (g, s, ev) => ev.p === s.controller,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "help", prompt: "Araña: put a +1/+1 counter on target attacking creature", filter: (g2, o) => !!(o.combat && o.combat.attacking) }), s);
          if (t && t.zone === "battlefield") g.addCounters(t, "p1", 1, s);
        }
      },
      {
        on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && ev.p !== s.controller && g.isCreature(ev.src) && modified(g, ev.src),
        do: (g, s, ev, { p }) => { g.impulse(p, 1); }
      }
    ],
    ai: {
      priority: 8,
      target: (g, p, req) => {
        if (req.purpose !== "help") return undefined;
        // the evasive attacker that will connect: one with flying, or the biggest
        const opts = req.options.filter(o => !g.isPlayer(o) && o.controller === p);
        const sc = o => (g.kw(o, "flying") ? 5 : 0) + (g.kw(o, "trample") ? 2 : 0) + (modified(g, o) ? -1 : 2) + g.power(o) * 0.3;
        return opts.sort((a, b) => sc(b) - sc(a))[0];
      }
    }
  });
  D({
    name: "Spider-Woman, Stunning Savior", cost: "{1}{W/U}", type: "Legendary Creature — Spider Human Hero", pt: "2/2",
    keywords: ["flying"],
    text: "Flying\nVenom Blast — Artifacts and creatures your opponents control enter tapped.",
    statics: [{ entersTapped: (g, s, o) => !!o.controller && o.controller !== s.controller && (o.def.types.includes("Creature") || o.def.types.includes("Artifact")) }],
    ai: { priority: 7 }
  });
  D({
    name: "Spider-Man, Web-Spinner", cost: "{3}{R}", type: "Legendary Creature — Spider Human Hero", pt: "2/3",
    keywords: ["double strike", "haste"],
    text: "Double strike (This creature deals both first-strike and regular combat damage.)\nHaste (This creature can attack and {T} as soon as he comes under your control.)\nWhenever Spider-Man attacks, target creature can't block this turn.",
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", purpose: "harm", prompt: "Spider-Man: target creature can't block this turn", filter: (g2, o) => o.controller !== p && !o.tapped }), s);
        if (t && t.zone === "battlefield") { g.addEffect({ objs: [t], cantBlock: true }); log(g, `${t.def.name} can't block this turn (Spider-Man, Web-Spinner).`, p, [t.def.name]); }
      }
    }],
    ai: { priority: 7 }
  });

  /* ================================================================ four-drops */
  D({
    name: "Silk, Web Weaver", cost: "{2}{G}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/5",
    text: "Web-slinging {1}{G}{W} (You may cast this spell for {1}{G}{W} if you also return a tapped creature you control to its owner's hand.)\nWhenever you cast a creature spell, create a 1/1 green and white Human Citizen creature token.\n{3}{G}{W}: Creatures you control get +2/+2 and gain vigilance until end of turn.",
    altCosts: web("{1}{G}{W}"),
    triggers: [{ on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.types.includes("Creature"), do: (g, s, ev, { p }) => g.createToken(p, humanCitizen) }],
    abilities: [{
      label: "Creatures get +2/+2 and vigilance", cost: "{3}{G}{W}",
      do: (g, s, ctx) => { const list = g.creatures(ctx.p); if (list.length) g.pump(list, 2, 2, ["vigilance"]); },
      ai: { use: (g, p, o, ctx) => ctx.window === "combat" && g.active === p && !!g.combat && g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield").length >= 2 }
    }],
    ai: webAI({ priority: 8 })
  });
  /* Find New Host: the creature it's put on carries Symbiote Spider-Man's combat damage ability. */
  async function symbioteDig(g, p, n, src) {
    const top = p.library.slice(0, n);
    if (!top.length) return;
    const pick = await g.ask(p, { type: "cards", prompt: `Symbiote Spider-Man: put one of the top ${top.length} cards into your hand, the rest into your graveyard`, options: top, min: 1, max: 1, purpose: "symbioteDig", src });
    const keep = (pick || [])[0] || top[0];
    if (keep.zone === "library") g.moveTo(keep, "hand");
    for (const c of top) if (c !== keep && c.zone === "library") g.moveTo(c, "graveyard");
    log(g, `${p.name} puts a card into their hand and ${top.length - 1} into the graveyard (Symbiote Spider-Man).`, p, ["Symbiote Spider-Man"]);
  }
  function digPick(g, p, req) {
    if (req.purpose !== "symbioteDig") return null;
    const lands = landCount(g, p) + p.hand.filter(isLandCard).length;
    const score = c => (isLandCard(c) ? (lands < 5 ? 8 : 0) : 4 + Math.min(c.def.mv, lands) + (spiderCard(c) ? 2 : 0) - (c.def.mv > lands + 1 ? 4 : 0));
    return [req.options.slice().sort((a, b) => score(b) - score(a))[0]];
  }
  const SYMBIOTE_EMBLEM = "Find New Host";
  D({
    name: "Symbiote Spider-Man", cost: "{2}{U/B}", type: "Legendary Creature — Symbiote Spider Hero", pt: "2/4",
    text: "Whenever this creature deals combat damage to a player, look at that many cards from the top of your library. Put one of them into your hand and the rest into your graveyard.\nFind New Host — {2}{U/B}, Exile this card from your graveyard: Put a +1/+1 counter on target creature you control. It gains this card's other abilities. Activate only as a sorcery.",
    note: "The creature that finds a new host keeps the combat damage ability until it leaves the battlefield.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s && ev.amount > 0, do: (g, s, ev, { p }) => symbioteDig(g, p, ev.amount, s) }],
    gyAbilities: [{
      label: "Find New Host", cost: "{2}{U/B}", exileSelf: true, timing: "sorcery",
      targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Find New Host: target creature you control" }],
      do: (g, s, ctx) => {
        const t = ctx.targets[0], p = ctx.p;
        if (!ctx.legal[0] || !t || t.zone !== "battlefield") return;
        g.addCounters(t, "p1", 1, s);
        t.state.symbioteHost = true;
        if (!p.emblems.some(e => e.name === SYMBIOTE_EMBLEM)) {
          g.addEmblem(p, {
            name: SYMBIOTE_EMBLEM, text: "Creatures you control that found a new host have Symbiote Spider-Man's combat damage ability.",
            triggers: [{ on: "combatDamagePlayer", when: (g2, s2, ev) => !!ev.src && ev.src.state && ev.src.state.symbioteHost && ev.src.controller === p && ev.amount > 0, do: (g2, s2, ev) => symbioteDig(g2, p, ev.amount, { def: { name: "Symbiote Spider-Man", ai: { cards: digPick } }, controller: p }) }]
          });
        }
        log(g, `${t.def.name} becomes Symbiote Spider-Man's new host.`, p, [t.def.name]);
      },
      ai: { use: (g, p, o, ctx) => ctx.window === "main2" && manaNow(g, p) >= 3 && g.creatures(p).some(c => g.kw(c, "flying") || named(g, p, COSMIC)) }
    }],
    ai: { priority: 6, cards: digPick }
  });
  D({
    name: "Spider-Man, To the Rescue", cost: "{2}{G/W}", type: "Legendary Creature — Spider Human Hero", pt: "3/2",
    keywords: ["flash", "vigilance", "reach"],
    text: "Flash\nVigilance, reach\nNo One Dies! — When Spider-Man enters, you may tap him. When you do, another target nonattacking creature you control gains indestructible until end of turn.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        if (s.zone !== "battlefield" || s.tapped) return;
        const ok = await g.ask(p, { type: "confirm", prompt: "Spider-Man: tap him to give another creature indestructible?", purpose: "rescueTap", src: s });
        if (!ok || s.zone !== "battlefield") return;
        g.tap(s);
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, other: true, purpose: "help", prompt: "Another target nonattacking creature you control gains indestructible", filter: (g2, o) => o !== s && !(o.combat && o.combat.attacking) }), s);
        if (t && t.zone === "battlefield") g.addEffect({ objs: [t], kw: ["indestructible"] });
      }
    }],
    ai: {
      priority: 6, protection: true, instantEnd: true, shields: ["destroy", "damage"],
      confirm: (g, p, req) => req.purpose !== "rescueTap" || g.stack.length > 0 || (!!g.combat && g.combat.attacker !== p),
      target: (g, p, req) => {
        if (req.purpose !== "help") return undefined;
        const opts = req.options.filter(o => !g.isPlayer(o));
        const top = g.stack[g.stack.length - 1];
        const hit = top && (top.targets || []).find(t => opts.includes(t));
        if (hit) return hit;
        return opts.sort((a, b) => (b.isCommander ? 10 : 0) + valueOf(g, b) - (a.isCommander ? 10 : 0) - valueOf(g, a))[0];
      }
    }
  });
  D({
    name: "Spider-UK", cost: "{3}{W}", type: "Legendary Creature — Spider Human Hero", pt: "3/4",
    text: "Web-slinging {2}{W} (You may cast this spell for {2}{W} if you also return a tapped creature you control to its owner's hand.)\nAt the beginning of your end step, if two or more creatures entered the battlefield under your control this turn, you draw a card and gain 2 life.",
    note: "Counts the creatures you control that entered this turn and are still on the battlefield.",
    altCosts: web("{2}{W}"),
    triggers: [{
      on: "endStep", when: (g, s, ev) => ev.p === s.controller,
      intervening: (g, s) => g.controlled(s.controller, o => g.isCreature(o) && o.enteredTurn === g.turn).length >= 2,
      do: (g, s, ev, { p }) => { drawLog(g, p, 1, s); g.gainLife(p, 2, s); }
    }],
    ai: webAI({ priority: 6 })
  });


  /* ================================================================ five-drops and up */
  D({
    name: "Spider-Man India", cost: "{3}{G}{W}", type: "Legendary Creature — Spider Human Hero", pt: "4/4",
    text: "Web-slinging {1}{G}{W} (You may cast this spell for {1}{G}{W} if you also return a tapped creature you control to its owner's hand.)\nPavitr's Sevā — Whenever you cast a creature spell, put a +1/+1 counter on target creature you control. It gains flying until end of turn.",
    altCosts: web("{1}{G}{W}"),
    triggers: [{
      on: "cast", when: (g, s, ev) => ev.p === s.controller && !!ev.o && ev.o.def.types.includes("Creature"),
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", you: true, purpose: "help", prompt: "Spider-Man India: +1/+1 counter and flying until end of turn" }), s);
        if (t && t.zone === "battlefield") { g.addCounters(t, "p1", 1, s); g.addEffect({ objs: [t], kw: ["flying"] }); }
      }
    }],
    ai: webAI({ priority: 8 })
  });
  D({
    name: "Gwenom, Remorseless", cost: "{3}{B}{B}", type: "Legendary Creature — Symbiote Spider Hero", pt: "4/4",
    keywords: ["deathtouch", "lifelink"],
    text: "Deathtouch, lifelink\nWhenever Gwenom attacks, until end of turn, you may look at the top card of your library any time and you may play cards from the top of your library. If you cast a spell this way, pay life equal to its mana value rather than pay its mana cost.",
    note: "As the attack trigger resolves you may cast spells from the top of your library one after another, paying life equal to each one's mana value; it stops at a land or when you stop.",
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        for (let i = 0; i < 6 && p.library.length && !g.over; i++) {
          const c = p.library[0];
          if (isLandCard(c) || c.def.mv >= p.life) break;
          const ok = await g.ask(p, { type: "confirm", prompt: `Gwenom: cast ${c.def.name} from the top of your library for ${c.def.mv} life?`, purpose: "gwenomCast", src: s, card: c });
          if (!ok || c.zone !== "library") break;
          g.loseLife(p, c.def.mv, s);
          const cast = await g.castWithoutPaying(p, c);
          if (!cast) break;
          await g.settle();
        }
      }
    }],
    ai: { priority: 6, confirm: (g, p, req) => req.purpose !== "gwenomCast" || !req.card || p.life - req.card.def.mv >= 16 || (req.card.def.mv <= 2 && p.life - req.card.def.mv >= 10) }
  });
  D({
    name: "Amazing Spider-Girl", cost: "{3}{W}{W}", type: "Legendary Creature — Spider Human Hero", pt: "5/4",
    keywords: ["flying", "vigilance"],
    text: "Web-slinging {2}{W} (You may cast this spell for {2}{W} if you also return a tapped creature you control to its owner's hand.)\nFlying, vigilance",
    altCosts: web("{2}{W}"),
    ai: webAI({ priority: 6 })
  });
  D({
    name: "Web-Warriors", cost: "{4}{G/W}", type: "Creature — Spider Hero", pt: "4/3",
    text: "When this creature enters, put a +1/+1 counter on each other creature you control.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => { for (const o of g.creatures(p)) if (o !== s) g.addCounters(o, "p1", 1, s); } }],
    ai: { priority: 6, minCreatures: 2 }
  });
  D({
    name: "Spider-Rex, Daring Dino", cost: "{4}{G}{G}", type: "Legendary Creature — Spider Dinosaur Hero", pt: "6/6",
    keywords: ["reach", "trample", "ward"],
    text: "Reach, trample\nWard {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)",
    triggers: [MK.wardTrigger(2)],
    ai: { priority: 6 }
  });

  /* ================================================================ other spells */
  const WEBUP_SPEC = trig({ kind: "nonland", opp: true, purpose: "harm", prompt: "Web Up: exile target nonland permanent an opponent controls" });
  D({
    name: "Web Up", cost: "{2}{W}", type: "Enchantment",
    text: "When this enchantment enters, exile target nonland permanent an opponent controls until this enchantment leaves the battlefield.",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          const t = await g.chooseTarget(p, WEBUP_SPEC, s);
          if (!t || t.zone !== "battlefield" || s.zone !== "battlefield") return;
          g.exile(t, s);
          if (t.zone === "exile" && !t.isToken) s.state.webbed = { card: t, zc: t.zc };
        }
      },
      {
        on: "leaves", self: true,
        do: (g, s, ev) => {
          const l = (ev.lki && ev.lki.state && ev.lki.state.webbed) || (s.state && s.state.webbed);
          if (!l || l.card.zone !== "exile" || l.card.zc !== l.zc || l.card.owner.lost) return;
          log(g, `${l.card.def.name} returns to the battlefield (Web Up left).`, l.card.owner, [l.card.def.name]);
          g.putOntoBattlefield([l.card], l.card.owner);
        }
      }
    ],
    ai: { priority: 6, cast: etbRemovalCast(WEBUP_SPEC, 5) }
  });
  D({
    name: "Spectacular Tactics", cost: "{1}{W}", type: "Instant",
    text: "Choose one —\n• Put a +1/+1 counter on target creature you control. It gains hexproof until end of turn.\n• Destroy target creature with power 4 or greater.",
    // a mode needs a legal target (the engine asks for a mode among those that have one)
    canCast: (g, p) => g.creatures(p).some(o => g.canTarget(p, o)) || g.battlefield.some(o => g.isCreature(o) && g.power(o) >= 4 && g.canTarget(p, o)),
    modes: [
      {
        label: "+1/+1 counter and hexproof",
        canChoose: (g, p) => g.creatures(p).some(o => g.canTarget(p, o)),
        targets: [{ kind: "creature", you: true, purpose: "help", prompt: "Put a +1/+1 counter on target creature you control" }],
        do: (g, ctx) => { const t = ctx.targets[0]; if (ctx.legal[0] && t) { g.addCounters(t, "p1", 1, ctx.o); g.addEffect({ objs: [t], kw: ["hexproof"] }); } }
      },
      {
        label: "Destroy a creature with power 4 or greater",
        canChoose: (g, p) => g.battlefield.some(o => g.isCreature(o) && g.power(o) >= 4 && g.canTarget(p, o)),
        targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy target creature with power 4 or greater", filter: (g, o) => g.power(o) >= 4 }],
        do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); }
      }
    ],
    ai: {
      priority: 6,
      mode: () => 1,
      cast: (g, p, o) => {
        const opts = g.battlefield.filter(c => c.controller !== p && g.isCreature(c) && g.power(c) >= 4 && g.canTarget(p, c) && !g.kw(c, "indestructible"));
        const { best, score } = bestOpposing(g, p, opts);
        if (!best || score < 5) return false;
        return 16 + score * 0.5;
      },
      target: (g, p, req) => {
        if (req.purpose !== "harm") return undefined;
        return bestOpposing(g, p, req.options.filter(o => !g.isPlayer(o) && o.controller !== p)).best || undefined;
      }
    }
  });
  D({
    name: "Chromatic Lantern", cost: "{3}", type: "Artifact",
    text: "Lands you control have \"{T}: Add one mana of any color.\"\n{T}: Add one mana of any color.",
    mana: [{ tap: true, produce: "any" }],
    statics: [{ applies: (g, s, o) => mine(s, o) && g.isLand(o), grantMana: [{ tap: true, produce: "any" }] }],
    ai: { priority: 7, ramp: true }
  });

  /* Kindred Discovery (and other "choose a creature type" cards that read it) name Spider. */
  MK.DECK_TYPES = MK.DECK_TYPES || {};
  MK.DECK_TYPES[DECK_ID] = "Spider";

  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: DECK_ID, name: "Spider-Verse", title: COSMIC, commander: COSMIC,
    identity: ["W", "U", "B", "R", "G"], bracket: 3, aggression: 0.8,
    style: "Spider tribal aggro",
    blurb: "Every Spider from across the multiverse swings together: Cosmic Spider-Man hands them all flying, first strike, trample, lifelink and haste at the start of each combat.",
    watch: [COSMIC, "Spider-Punk", "Spider-Ham, Peter Porker", "Silk, Web Weaver", "Spider-Man India", "Coat of Arms"],
    list: (function () {
      const singles = [
        // Marvel Spiders and friends (29)
        "Spinneret and Spiderling", "Radioactive Spider", "Aunt May", "Spider-Punk", "Spider-Girl, Legacy Hero",
        "Spider-Ham, Peter Porker", "Spectacular Spider-Man", "Scarlet Spider, Kaine", "Spider-Man 2099",
        "Spiders-Man, Heroic Horde", "Spider Manifestation", "Mary Jane Watson", "Spider-Man, Web-Slinger",
        "Arachne, Psionic Weaver", "Spider-Byte, Web Warden", "Spider-Gwen, Free Spirit", "Scarlet Spider, Ben Reilly",
        "Araña, Heart of the Spider", "Spider-Woman, Stunning Savior", "Spider-Man, Web-Spinner", "Silk, Web Weaver",
        "Symbiote Spider-Man", "Spider-Man, To the Rescue", "Spider-UK", "Spider-Man India", "Gwenom, Remorseless",
        "Amazing Spider-Girl", "Web-Warriors", "Spider-Rex, Daring Dino",
        // other creatures (7)
        "Ohran Frostfang", "Giver of Runes", "Birds of Paradise", "Noble Hierarch", "Ignoble Hierarch", "Delighted Halfling",
        "Craterhoof Behemoth",
        // tribal payoffs and card advantage (10)
        "Beastmaster Ascension", "Cathars' Crusade", "Coat of Arms", "Shared Animosity", "Kindred Discovery", "Skullclamp",
        "Smothering Tithe", "Rhystic Study", "Coastal Piracy", "Web Up",
        // mana rocks, ramp and equipment (6)
        "Sol Ring", "Arcane Signet", "Chromatic Lantern", "Nature's Lore", "Lightning Greaves", "Swiftfoot Boots",
        // removal (10)
        "Swords to Plowshares", "Path to Exile", "Assassin's Trophy", "Anguished Unmaking", "Beast Within", "Chaos Warp",
        "Cyclonic Rift", "Vindicate", "Infernal Grasp", "Spectacular Tactics",
        // protection (5)
        "Teferi's Protection", "Heroic Intervention", "Swan Song", "Flawless Maneuver", "Fierce Guardianship",
        // lands (32)
        "Command Tower", "Path of Ancestry", "Cavern of Souls", "Mana Confluence", "Exotic Orchard",
        "Jetmir's Garden", "Ketria Triome", "Raugrin Triome", "Savai Triome", "Xander's Lounge", "Zagoth Triome",
        "Ziatora's Proving Ground", "Blood Crypt", "Breeding Pool", "Godless Shrine", "Hallowed Fountain", "Overgrown Tomb",
        "Sacred Foundry", "Steam Vents", "Stomping Ground", "Temple Garden", "Watery Grave", "Arid Mesa",
        "Bloodstained Mire", "Flooded Strand", "Marsh Flats", "Misty Rainforest", "Polluted Delta", "Scalding Tarn",
        "Verdant Catacombs", "Windswept Heath", "Wooded Foothills"
      ];
      return singles;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
