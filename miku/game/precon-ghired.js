/* Ghired, Conclave Exile: a Bracket 2 bot deck built from the retail "Primal Genesis" precon
   (Commander 2019). Naya tokens: Ghired's 4/4 Rhino, Beasts, Birds, Eggs and Sculptures, and
   populate, which copies the best creature token again and again. The copy Ghired makes when he
   attacks enters tapped and attacking.
   How it wins: combat. Growing Ranks, Song of the Worldsoul, Vitu-Ghazi Guildmage and Ghired's own
   attacks widen the token board, Intangible Virtue and Commander's Insignia pump it, and card draw
   (Elemental Bond, Garruk's Packleader, Ohran Frostfang, Shamanic Revelation) keeps it fed.
   The list is the retail one except for cards the engine can't play or a Bracket 2 table avoids:
   Cliffside Rescuer (protection from players) -> Selesnya Guildmage, Emmara Tandris (damage
   prevention) -> Trostani Discordant, Marisi (goad) -> Armada Wurm, Tahngarth (control swap) ->
   Conclave Cavalier, Tectonic Hellion (land destruction) -> Hellrider, Scaretiller (its text
   couldn't be checked) -> Solemn Simulacrum, Druid's Deliverance (damage prevention) ->
   Selesnya Charm, Ash Barrens (cycling) -> Mountain, and Boros Garrison and Gruul Turf (bounce
   lands the bots can't play) -> Wind-Scarred Crag and Rootbound Crag.
   Card text follows the Oracle text. Where the engine simplifies a card, its `note` says how.
   The `ai` hints keep it a casual deck: creatures and token makers on curve, removal on real
   threats, mana sinks at the end of the turn before its own, and a board wipe only when behind. */
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  const AIX = () => MK.AI || {};

  /* ================================================================ helpers */
  const GHIRED = "Ghired, Conclave Exile";
  const mine = (s, o) => o.controller === s.controller;
  const myCreature = (g, s, o) => mine(s, o) && g.isCreature(o);
  const trig = spec => Object.assign({ trigger: true }, spec);
  const valueOf = (g, o) => (AIX().value ? AIX().value(g, o) : Math.max(0, g.power(o)) + Math.max(0, g.toughness(o)));
  const threatOf = (g, o, p) => (AIX().threat ? AIX().threat(g, o, p) : valueOf(g, o));
  const isLandCard = c => c.def.types.includes("Land");
  const basicLandCard = (g, c) => g.isBasic(c) && isLandCard(c);
  const creatureCards = list => list.filter(c => c.def.types.includes("Creature"));
  const landCount = (g, p) => g.controlled(p, o => g.isLand(o)).length;
  const manaNow = (g, p) => g.maxX(p, MK.parseCost(""), 1);
  /* Enough cards left to draw without drifting toward an empty library. */
  const deckOK = (p, n) => p.library.length > (n == null ? 10 : n);
  /* The end step of the player just before us: mana we left open is wasted otherwise. */
  const endBeforeMe = (g, p, ctx) => ctx.window === "end" && g.active !== p && g.nextPlayer(g.active) === p;
  /* Mana sinks: then, or in our second main phase once the spells are cast. */
  const sinkTime = (g, p, ctx) => endBeforeMe(g, p, ctx) || (ctx.window === "main2" && g.active === p);
  const myMain = (g, p, ctx) => (ctx.window === "main1" || ctx.window === "main2") && g.active === p;
  /* Past this many creatures another small token adds little (and slows the table down). */
  const crowded = (g, p, n) => g.creatures(p).length >= (n || 20);
  const creatureTokens = (g, p) => g.controlled(p, o => o.isToken && g.isCreature(o));
  const tokenValue = (g, p) => creatureTokens(g, p).reduce((s, o) => s + valueOf(g, o), 0);
  const attackingMine = (g, p) => (g.combat ? g.combat.attackers.filter(a => a.controller === p && a.zone === "battlefield") : []);
  const ourCombat = (g, p, ctx) => ctx.window === "combat" && !!g.combat && g.combat.attacker === p;
  const unblockedMine = (g, p) => attackingMine(g, p).filter(a => a.combat && !a.combat.wasBlocked);
  const oppCreatures = (g, p) => g.battlefield.filter(c => c.controller !== p && g.isCreature(c));
  const hasETB = c => c.def.triggers.some(t => t.on === "enters" && t.self);
  const castable = (ctx, o) => ctx.actions.some(a => a.type === "cast" && a.card === o);
  /* A token copy of this legendary card or creature would die at once: we control one of that name. */
  const legendClash = (g, p, c) => !!c && c.def.legendary && g.controlled(p, o => o.def.name === c.def.name).length > 0;
  function drawLog(g, p, n, src) {
    const got = g.draw(p, n);
    if (got) g.log(`${p.name} draws ${got === 1 ? "a card" : got + " cards"} (${src.def.name}).`, { p, cards: [src.def.name] });
    return got;
  }
  const fetchBasic = (g, p, src, prompt) => g.search(p, { filter: basicLandCard, to: "battlefield", tapped: true, prompt, src });

  /* Tokens this deck makes (keys are unique, so other decks' tokens never collide). */
  const isSculpture = o => o.def.subtypes.includes("Sculpture");
  const TK = {
    rhinoWarrior: MK.tokenDef({ key: "ghired-rhino-warrior", name: "Rhino Warrior", pt: [4, 4], colors: "G", subtypes: ["Rhino", "Warrior"] }),
    egg: MK.tokenDef({ key: "ghired-egg", name: "Egg", pt: [0, 1], colors: "G", subtypes: ["Egg"], keywords: ["defender"] }),
    knight: MK.tokenDef({ key: "ghired-knight-vigilance", name: "Knight", pt: [2, 2], colors: "W", subtypes: ["Knight"], keywords: ["vigilance"] }),
    centaur: MK.tokenDef({ key: "ghired-centaur", name: "Centaur", pt: [3, 3], colors: "G", subtypes: ["Centaur"] }),
    wurm: MK.tokenDef({ key: "ghired-wurm-trample", name: "Wurm", pt: [5, 5], colors: "G", subtypes: ["Wurm"], keywords: ["trample"] }),
    saproling: MK.tokenDef({ key: "ghired-saproling", name: "Saproling", pt: [1, 1], colors: "G", subtypes: ["Saproling"] }),
    soldierLL: MK.tokenDef({ key: "ghired-soldier-w-lifelink", name: "Soldier", pt: [1, 1], colors: "W", subtypes: ["Soldier"], keywords: ["lifelink"] }),
    elk: MK.tokenDef({ key: "ghired-elk", name: "Elk", pt: [2, 2], colors: "GW", subtypes: ["Elk"] }),
    bird3: MK.tokenDef({ key: "ghired-bird-w3", name: "Bird", pt: [3, 3], colors: "W", subtypes: ["Bird"], keywords: ["flying"] }),
    bird34: MK.tokenDef({ key: "ghired-bird-w34", name: "Bird", pt: [3, 4], colors: "W", subtypes: ["Bird"], keywords: ["flying"] }),
    eldrazi: MK.tokenDef({ key: "ghired-eldrazi-10", name: "Eldrazi", pt: [10, 10], colors: [], subtypes: ["Eldrazi"] }),
    gargoyle: MK.tokenDef({ key: "ghired-gargoyle", name: "Gargoyle", types: ["Artifact", "Creature"], pt: [3, 4], colors: [], subtypes: ["Gargoyle"], keywords: ["flying"] }),
    sculpture: MK.tokenDef({
      key: "ghired-sculpture", name: "Sculpture", types: ["Artifact", "Creature"], colors: [], subtypes: ["Sculpture"],
      text: "This creature's power and toughness are each equal to the number of Sculptures you control.",
      cda: (g, o) => { const n = g.controlled(o.controller, isSculpture).length; return [n, n]; }
    })
  };
  const horrorToken = x => MK.tokenDef({ key: "ghired-horror-" + x, name: "Phyrexian Horror", types: ["Artifact", "Creature"], pt: [x, x], colors: [], subtypes: ["Phyrexian", "Horror"] });

  /* Which creature token a populate copies. While Doomed Artisan holds the Sculptures back they
     can't attack or block, so another token is better. */
  function populatePick(g, p, options) {
    const held = g.controlled(p, o => o.def.name === "Doomed Artisan").length > 0;
    const pool = held && options.some(o => !isSculpture(o)) ? options.filter(o => !isSculpture(o)) : options;
    return pool.slice().sort((a, b) => valueOf(g, b) - valueOf(g, a))[0];
  }
  const populateHint = (g, p, req) => (req.purpose === "populate" ? populatePick(g, p, req.options) : undefined);

  /* The turn record: whether a player attacked this turn (Wingmate Roc's raid) and how many
     creatures they controlled died this turn (Fresh Meat). The commander keeps it, since it is
     always in the command zone or on the battlefield. These `when` tests only take notes and
     never trigger anything (Idol of Oblivion counts tokens the same way). */
  function turnRecord(g, p) {
    let r = p.ghiredTurn;
    if (!r || r.turn !== g.turn) r = p.ghiredTurn = { turn: g.turn, attacked: false, died: 0 };
    return r;
  }
  const noteAttack = (g, s, ev) => { if (ev.p === s.owner) turnRecord(g, ev.p).attacked = true; return false; };
  const noteDeath = (g, s, ev) => {
    const key = "ghiredNoted" + s.owner.idx;
    if (ev[key] || !ev.lki || !ev.lki.creature || ev.lki.controller !== s.owner) return false;
    ev[key] = true;
    turnRecord(g, s.owner).died++;
    return false;
  };
  const bookkeeping = [
    { on: "attack", when: noteAttack, do: () => {} },
    { on: "attack", zone: "command", when: noteAttack, do: () => {} },
    { on: "dies", when: noteDeath, do: () => {} },
    { on: "dies", zone: "command", when: noteDeath, do: () => {} }
  ];

  /* "Exile it until this leaves the battlefield": the card is remembered on the object with its
     zone count, and comes back when the object leaves. Tokens and commanders never come back. */
  function exileUntilLeaves(g, s, t) {
    if (!t || t.zone !== "battlefield" || s.zone !== "battlefield") return;
    g.exile(t, s);
    if (t.zone === "exile" && !t.isToken) (s.ghiredLinked || (s.ghiredLinked = [])).push({ card: t, zc: t.zc });
  }
  function returnLinked(g, s) {
    const links = s.ghiredLinked || [];
    s.ghiredLinked = null;
    for (const l of links) {
      const c = l.card;
      if (c.zone !== "exile" || c.zc !== l.zc || c.owner.lost) continue;
      g.log(`${c.def.name} returns to the battlefield under ${c.owner.name}'s control.`, { p: c.owner, cards: [c.def.name] });
      g.putOntoBattlefield([c], c.owner);
    }
  }

  /* Embalm: exile the card from the graveyard for a white Zombie token copy with no mana cost. */
  const embalm = (cost, sub) => ({
    label: "Embalm", cost, timing: "sorcery", exileSelf: true,
    do: (g, s, ctx) => g.copyToken(ctx.p, s, { except: { colors: ["W"], subtypes: ["Zombie", sub], type: `Creature — Zombie ${sub}`, cost: "" } }),
    ai: { use: (g, p, o, ctx) => myMain(g, p, ctx) }
  });

  /* How much a creature card is worth copying (Mimic Vat, Soul Foundry, Feldon). */
  const copyScore = c => (c ? c.def.mv + (c.def.pt ? c.def.pt[0] * 0.5 : 0) + (hasETB(c) ? 3 : 0) : -1);

  /* ================================================================ commander */
  /* Populate for Ghired: the copy enters tapped and attacking what Ghired attacks. */
  async function populateAttacking(g, p, src, target) {
    const opts = creatureTokens(g, p);
    if (!opts.length) { g.log(`${p.name} populates, but has no creature token to copy.`, { p, cards: [src.def.name] }); return null; }
    const pick = await g.ask(p, { type: "target", prompt: "Ghired: populate. Choose a creature token to copy; the copy enters tapped and attacking.", options: opts, purpose: "populate", src, auto: true });
    if (!pick || pick.zone !== "battlefield") return null;
    let tgt = target ? g.liveTarget(target) : null;
    if (!tgt && target && !g.isPlayer(target) && target.controller && !target.controller.lost) tgt = target.controller;
    if (!tgt) tgt = g.opponents(p)[0] || null;
    const attacking = !!(g.combat && tgt);
    const made = g.copyToken(p, pick, attacking ? { tapped: true, attacking: tgt } : { tapped: true });
    if (made[0] && attacking) g.log(`The copy of ${pick.def.name} enters tapped and attacking ${g.nameOf(tgt)}.`, { p, cards: [pick.def.name] });
    return made[0] || null;
  }

  D({
    name: GHIRED, cost: "{2}{R}{G}{W}", type: "Legendary Creature — Human Shaman", pt: "4/5",
    text: "When Ghired, Conclave Exile enters, create a 4/4 green Rhino Warrior creature token.\nWhenever Ghired attacks, populate. The token enters tapped and attacking. (To populate, create a token that's a copy of a creature token you control.)",
    note: "The populated token attacks the same player or planeswalker as Ghired.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.rhinoWarrior) },
      { on: "attacks", self: true, do: async (g, s, ev, { p }) => { await populateAttacking(g, p, s, ev.target); } }
    ].concat(bookkeeping),
    ai: { priority: 8, target: populateHint }
  });

  /* ================================================================ creatures */
  D({
    name: "Angel of Sanctions", cost: "{3}{W}{W}", type: "Creature — Angel", pt: "3/4",
    keywords: ["flying"],
    text: "Flying\nWhen Angel of Sanctions enters, you may exile target nonland permanent an opponent controls until Angel of Sanctions leaves the battlefield.\nEmbalm {5}{W} ({5}{W}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Angel with no mana cost. Embalm only as a sorcery.)",
    triggers: [
      {
        on: "enters", self: true,
        do: async (g, s, ev, { p }) => {
          if (s.zone !== "battlefield") return;
          const t = await g.chooseTarget(p, trig({ kind: "nonland", opp: true, optional: true, purpose: "harm", prompt: "Angel of Sanctions: you may exile target nonland permanent an opponent controls" }), s);
          exileUntilLeaves(g, s, t);
        }
      },
      { on: "leaves", self: true, do: (g, s) => returnLinked(g, s) }
    ],
    note: "An Aura that comes back this way has nothing to enchant, so it goes to its owner's graveyard.",
    gyAbilities: [embalm("{5}{W}", "Angel")],
    ai: { priority: 7 }
  });

  /* Atla Palani: an Egg that dies turns into the next creature card of the library. */
  function hatch(g, p, src) {
    const lib = p.library;
    const i = lib.findIndex(c => c.def.types.includes("Creature"));
    const hit = i >= 0 ? lib[i] : null;
    const rest = i >= 0 ? lib.slice(0, i) : lib.slice();
    const n = rest.length + (hit ? 1 : 0);
    if (!n) return;
    g.log(`${p.name} reveals ${n} card${n === 1 ? "" : "s"}${hit ? ` and puts ${hit.def.name} onto the battlefield` : " and finds no creature card"} (${src.def.name}).`, { p, cards: hit ? [hit.def.name] : [] });
    if (hit) g.putOntoBattlefield([hit], p);
    for (const c of g.shuffleArr(rest)) if (c.zone === "library") g.moveTo(c, "library", { bottom: true });
  }
  D({
    name: "Atla Palani, Nest Tender", cost: "{1}{R}{G}{W}", type: "Legendary Creature — Human Shaman", pt: "2/3",
    text: "{2}, {T}: Create a 0/1 green Egg creature token with defender.\nWhenever an Egg you control dies, reveal cards from the top of your library until you reveal a creature card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.",
    abilities: [{
      label: "Create a 0/1 Egg", cost: "{2}", tap: true,
      do: (g, s, ctx) => g.createToken(ctx.p, TK.egg),
      ai: { use: (g, p, o, ctx) => sinkTime(g, p, ctx) && !crowded(g, p, 25) }
    }],
    triggers: [{
      on: "dies",
      when: (g, s, ev) => !!ev.lki && ev.lki.controller === s.controller && ev.lki.subtypes.includes("Egg"),
      do: (g, s, ev, { p }) => hatch(g, p, s)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Desolation Twin", cost: "{10}", type: "Creature — Eldrazi", pt: "10/10",
    text: "When you cast this spell, create a 10/10 colorless Eldrazi creature token.",
    note: "The token is made as the spell is cast.",
    onCast: (g, p, o, item) => { if (!item || !item.isCopy) g.createToken(p, TK.eldrazi); },
    ai: { priority: 6 }
  });

  D({
    name: "Doomed Artisan", cost: "{2}{W}", type: "Creature — Human Artificer", pt: "1/1",
    text: "Sculptures you control can't attack or block.\nAt the beginning of your end step, create a colorless Sculpture artifact creature token with \"This creature's power and toughness are each equal to the number of Sculptures you control.\"",
    statics: [{ applies: (g, s, o) => mine(s, o) && isSculpture(o), cantAttack: true, cantBlock: true }],
    triggers: [{ on: "endStep", when: (g, s, ev) => ev.p === s.controller, do: (g, s, ev, { p }) => g.createToken(p, TK.sculpture) }],
    ai: { priority: 4 }
  });

  /* Feldon of the Third Path: the artifacts it can spare (artifact tokens, and Solemn Simulacrum,
     which draws a card when it dies) and the creature card worth a hasty copy. */
  const feldonTarget = (g, p) => creatureCards(p.graveyard)
    .filter(c => !c.def.legendary || !g.controlled(p, o => o.def.name === c.def.name).length)
    .sort((a, b) => copyScore(b) - copyScore(a))[0] || null;
  D({
    name: "Feldon of the Third Path", cost: "{1}{R}{R}", type: "Legendary Creature — Human Artificer", pt: "2/3",
    text: "{2}, {T}: Create a token that's a copy of target creature card in your graveyard, except it's an artifact in addition to its other types. It gains haste. Sacrifice it at the beginning of the next end step. Activate only as a sorcery.",
    abilities: [{
      label: "Copy a creature card from your graveyard", cost: "{2}", tap: true, timing: "sorcery",
      targets: [{ kind: "card", from: (g, p) => creatureCards(p.graveyard), purpose: "reanimate", prompt: "Feldon of the Third Path: target creature card in your graveyard" }],
      do: (g, s, ctx) => {
        const c = ctx.targets[0];
        if (!ctx.legal[0] || !c || c.zone !== "graveyard") return;
        const types = c.def.types.includes("Artifact") ? c.def.types.slice() : c.def.types.concat("Artifact");
        g.copyToken(ctx.p, c, { except: { types }, haste: true, sacEnd: true });
      },
      // before combat, so the copy can attack
      ai: { use: (g, p, o, ctx) => ctx.window === "main1" && g.active === p && copyScore(feldonTarget(g, p)) >= 6 }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => {
        if (req.purpose === "reanimate") { const t = feldonTarget(g, p); return t && req.options.includes(t) ? t : undefined; }
        return undefined;
      }
    }
  });

  /* Flamerush Rider copies the best other attacker, never a legendary one (the copy would die to the legend rule). */
  const flameCopyPick = (g, p, options) => options.filter(c => !c.def.legendary).sort((a, b) => valueOf(g, b) - valueOf(g, a))[0] || null;
  D({
    name: "Flamerush Rider", cost: "{4}{R}", type: "Creature — Human Warrior", pt: "3/3",
    text: "Whenever Flamerush Rider attacks, create a token that's a copy of another target attacking creature and that's tapped and attacking. Exile the token at end of combat.\nDash {2}{R}{R} (You may cast this spell for its dash cost. If you do, it gains haste, and it's returned from the battlefield to its owner's hand at the beginning of the next end step.)",
    note: "The token attacks the same player or planeswalker as the creature it copies.",
    altCosts: [{ cost: "{2}{R}{R}", label: "Dash" }],
    onResolve: (g, p, o, item) => {
      if (!item || item.alt !== 1 || o.zone !== "battlefield") return;
      o.state.selfKw = (o.state.selfKw || []).concat("haste");
      g.bump();
      const zc = o.zc;
      g.log(`${o.def.name} was dashed: it has haste and returns to its owner's hand at the next end step.`, { p, cards: [o.def.name] });
      g.delayed.push({ at: "endStep", once: true, controller: p, src: o, do: g2 => { if (o.zone === "battlefield" && o.zc === zc) g2.bounce(o); } });
    },
    triggers: [{
      on: "attacks", self: true,
      do: async (g, s, ev, { p }) => {
        const t = await g.chooseTarget(p, trig({ kind: "creature", other: true, filter: (g2, c) => !!c.combat && !!c.combat.attacking, purpose: "copy", prompt: "Flamerush Rider: copy another target attacking creature" }), s);
        if (!t || t.zone !== "battlefield" || !t.combat || !g.combat) return;
        const at = g.liveTarget(t.combat.attacking) || g.liveTarget(ev.target);
        if (at) g.copyToken(p, t, { tapped: true, attacking: at, exileEoc: true });
      }
    }],
    ai: {
      priority: 5,
      target: (g, p, req) => (req.purpose === "copy" ? flameCopyPick(g, p, req.options) || undefined : undefined),
      // a dash after combat only sends it back to hand: in main 2 only the full cost is worth it
      cast: (g, p, o, { window }) => (window === "main2" && !g.canPay(p, g.spellCost(p, o, {})) ? false : undefined)
    }
  });

  D({
    name: "Garruk's Packleader", cost: "{4}{G}", type: "Creature — Beast", pt: "4/4",
    text: "Whenever another creature you control with power 3 or greater enters, you may draw a card.",
    triggers: [{
      on: "enters", optional: "Garruk's Packleader: draw a card?",
      when: (g, s, ev) => ev.o !== s && myCreature(g, s, ev.o) && g.power(ev.o) >= 3,
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 6, confirm: (g, p) => deckOK(p, 10) }
  });

  D({
    name: "Giant Adephage", cost: "{5}{G}{G}", type: "Creature — Insect", pt: "7/7",
    keywords: ["trample"],
    text: "Trample\nWhenever Giant Adephage deals combat damage to a player, create a token that's a copy of Giant Adephage.",
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: (g, s, ev, { p }) => g.copyToken(p, s) }],
    ai: { priority: 6 }
  });

  /* The creature Heart-Piercer Manticore sacrifices, if any: Roc Egg (it becomes a 3/3 flier), an
     Egg while Atla Palani is out (it hatches), a Sculpture Doomed Artisan holds back, a token that
     finishes a player, or a token whose power kills a much better creature. */
  function manticorePick(g, p, options) {
    const roc = options.find(o => o.def.name === "Roc Egg");
    if (roc) return roc;
    const atla = g.controlled(p, o => o.def.name === "Atla Palani, Nest Tender").length > 0;
    const egg = atla && options.find(o => o.isToken && g.hasSub(o, "Egg"));
    if (egg) return egg;
    const held = g.controlled(p, o => o.def.name === "Doomed Artisan").length > 0;
    const sculpture = held && options.filter(isSculpture)[0];
    if (sculpture && g.power(sculpture) >= 3) return sculpture;
    const finishes = n => g.opponents(p).some(q => q.life <= n && !g.playerHexproof(q));
    const kills = (n, worth) => oppCreatures(g, p).some(c => g.canTarget(p, c) && !g.kw(c, "indestructible") && g.lethalDamageLeft(c) <= n && threatOf(g, c, p) >= worth);
    const toks = options.filter(o => o.isToken && g.power(o) > 0).sort((a, b) => g.power(b) - g.power(a));
    for (const t of toks) if (finishes(g.power(t)) || kills(g.power(t), valueOf(g, t) + 3)) return t;
    return null;
  }
  /* Damage to any target: a player it finishes first, else the usual choice (the best creature it kills). */
  const lethalAim = (g, p, options, n) => options.filter(t => g.isPlayer(t) && t !== p && t.life <= n).sort((a, b) => a.life - b.life)[0];
  D({
    name: "Heart-Piercer Manticore", cost: "{2}{R}{R}", type: "Creature — Manticore", pt: "4/3",
    text: "When Heart-Piercer Manticore enters, you may sacrifice another creature. When you do, Heart-Piercer Manticore deals damage equal to that creature's power to any target.\nEmbalm {5}{R} ({5}{R}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a white Zombie Manticore with no mana cost. Embalm only as a sorcery.)",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = g.creatures(p).filter(c => c !== s);
        if (!opts.length) return;
        const pick = await g.ask(p, { type: "target", prompt: "Heart-Piercer Manticore: you may sacrifice another creature", options: opts, optional: true, purpose: "manticoreSacrifice", src: s });
        if (!pick || pick.zone !== "battlefield" || pick.controller !== p) return;
        const n = Math.max(0, g.power(pick));
        g.sacrifice(pick);
        if (n <= 0) return;
        const t = await g.chooseTarget(p, trig({ kind: "any", purpose: "harm", amount: n, prompt: `Heart-Piercer Manticore deals ${n} damage to any target` }), s);
        if (t) g.damage(s, t, n);
      }
    }],
    gyAbilities: [embalm("{5}{R}", "Manticore")],
    ai: {
      priority: 6,
      target: (g, p, req) => {
        if (req.purpose === "manticoreSacrifice") return manticorePick(g, p, req.options);
        if (req.purpose === "harm" && req.spec && req.spec.amount) return lethalAim(g, p, req.options, req.spec.amount);
        return undefined;
      }
    }
  });

  D({
    name: "Ohran Frostfang", cost: "{3}{G}{G}", type: "Snow Creature — Snake", pt: "2/6",
    text: "Attacking creatures you control have deathtouch.\nWhenever a creature you control deals combat damage to a player, draw a card.",
    statics: [{ applies: (g, s, o) => myCreature(g, s, o) && !!o.combat && !!o.combat.attacking, kw: ["deathtouch"] }],
    triggers: [{
      on: "combatDamagePlayer", when: (g, s, ev) => !!ev.src && ev.src.controller === s.controller && g.isCreature(ev.src),
      do: (g, s, ev, { p }) => drawLog(g, p, 1, s)
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Roc Egg", cost: "{2}{W}", type: "Creature — Bird Egg", pt: "0/3",
    keywords: ["defender"],
    text: "Defender\nWhen Roc Egg dies, create a 3/3 white Bird creature token with flying.",
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.bird3) }],
    ai: { priority: 4 }
  });

  const graveyardCreatures = g => g.players.filter(q => !q.lost).reduce((a, q) => a.concat(creatureCards(q.graveyard)), []);
  /* The creature card Selesnya Eulogist exiles: the best one in an opponent's graveyard, else a
     cheap one of ours (the populate is the point). */
  function eulogyTarget(g, p) {
    const theirs = graveyardCreatures(g).filter(c => c.owner !== p).sort((a, b) => b.def.mv - a.def.mv);
    if (theirs.length) return theirs[0];
    return creatureCards(p.graveyard).filter(c => c.def.mv <= 3).sort((a, b) => a.def.mv - b.def.mv)[0] || null;
  }
  D({
    name: "Selesnya Eulogist", cost: "{2}{G}", type: "Creature — Centaur Druid", pt: "3/3",
    text: "{2}{G}: Exile target creature card from a graveyard, then populate.",
    abilities: [{
      label: "Exile a creature card, then populate", cost: "{2}{G}",
      targets: [{ kind: "card", from: g => graveyardCreatures(g), purpose: "eulogy", prompt: "Selesnya Eulogist: exile target creature card from a graveyard" }],
      do: async (g, s, ctx) => {
        const c = ctx.targets[0];
        if (!ctx.legal[0] || !c || c.zone !== "graveyard") return;
        g.moveTo(c, "exile");
        g.log(`${c.def.name} is exiled from ${c.owner.name}'s graveyard.`, { p: ctx.p, cards: [c.def.name] });
        await g.populate(ctx.p, s);
      },
      ai: {
        use: (g, p, o, ctx) => {
          if (!sinkTime(g, p, ctx) || crowded(g, p, 30) || !creatureTokens(g, p).length || !eulogyTarget(g, p)) return false;
          const n = Math.min(3, Math.floor(manaNow(g, p) / 3));
          return n > 0 ? { repeat: n } : false;
        }
      }
    }],
    ai: { priority: 6, target: (g, p, req) => (req.purpose === "eulogy" ? eulogyTarget(g, p) || undefined : populateHint(g, p, req)) }
  });

  D({
    name: "Soul of Zendikar", cost: "{4}{G}{G}", type: "Creature — Avatar", pt: "6/6",
    keywords: ["reach"],
    text: "Reach\n{3}{G}{G}: Create a 3/3 green Beast creature token.\n{3}{G}{G}, Exile Soul of Zendikar from your graveyard: Create a 3/3 green Beast creature token.",
    abilities: [{
      label: "Create a 3/3 Beast", cost: "{3}{G}{G}",
      do: (g, s, ctx) => g.createToken(ctx.p, T.beast),
      ai: { use: (g, p, o, ctx) => sinkTime(g, p, ctx) && !crowded(g, p) }
    }],
    gyAbilities: [{
      label: "Exile it: create a 3/3 Beast", cost: "{3}{G}{G}", exileSelf: true,
      do: (g, s, ctx) => g.createToken(ctx.p, T.beast),
      ai: { use: (g, p, o, ctx) => sinkTime(g, p, ctx) }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Vitu-Ghazi Guildmage", cost: "{G}{W}", type: "Creature — Dryad Shaman", pt: "2/2",
    text: "{4}{G}{W}: Create a 3/3 green Centaur creature token.\n{2}{G}{W}: Populate. (Create a token that's a copy of a creature token you control.)",
    abilities: [
      {
        label: "Create a 3/3 Centaur", cost: "{4}{G}{W}",
        do: (g, s, ctx) => g.createToken(ctx.p, TK.centaur),
        // a 3/3 is only worth it when there is no better token to populate
        ai: { use: (g, p, o, ctx) => { if (!sinkTime(g, p, ctx) || crowded(g, p)) return false; const b = populatePick(g, p, creatureTokens(g, p)); return !b || valueOf(g, b) < 4; } }
      },
      {
        label: "Populate", cost: "{2}{G}{W}",
        condition: (g, o, p) => creatureTokens(g, p).length > 0,
        do: (g, s, ctx) => g.populate(ctx.p, s),
        ai: { use: (g, p, o, ctx) => { if (!sinkTime(g, p, ctx) || crowded(g, p, 30)) return false; const n = Math.min(3, Math.floor(manaNow(g, p) / 4)); return n > 0 ? { repeat: n } : false; } }
      }
    ],
    ai: { priority: 6, target: populateHint }
  });

  D({
    name: "Voice of Many", cost: "{2}{G}{G}", type: "Creature — Elf Druid", pt: "3/3",
    text: "When Voice of Many enters, draw a card for each opponent who controls fewer creatures than you.",
    triggers: [{
      on: "enters", self: true,
      do: (g, s, ev, { p }) => {
        const n = g.creatures(p).length;
        const k = g.opponents(p).filter(q => g.creatures(q).length < n).length;
        if (k > 0) drawLog(g, p, k, s);
      }
    }],
    ai: { priority: 6 }
  });

  D({
    name: "Wayfaring Temple", cost: "{1}{G}{W}", type: "Creature — Elemental", pt: "*/*",
    text: "Wayfaring Temple's power and toughness are each equal to the number of creatures you control.\nWhenever Wayfaring Temple deals combat damage to a player, populate.",
    cda: (g, o) => { const n = g.creatures(o.controller).length; return [n, n]; },
    triggers: [{ on: "combatDamagePlayer", when: (g, s, ev) => ev.src === s, do: async (g, s, ev, { p }) => { await g.populate(p, s); } }],
    ai: { priority: 6, target: populateHint }
  });

  const attackedThisTurn = (g, p) => turnRecord(g, p).attacked;
  D({
    name: "Wingmate Roc", cost: "{3}{W}{W}", type: "Creature — Bird", pt: "3/4",
    keywords: ["flying"],
    text: "Flying\nRaid — When Wingmate Roc enters, if you attacked this turn, create a 3/4 white Bird creature token with flying.\nWhenever Wingmate Roc attacks, you gain 1 life for each attacking creature.",
    note: "Whether you attacked this turn is noted by the deck's commander, Ghired.",
    triggers: [
      {
        on: "enters", self: true, when: (g, s) => attackedThisTurn(g, s.controller), intervening: (g, s) => attackedThisTurn(g, s.controller),
        do: (g, s, ev, { p }) => g.createToken(p, TK.bird34)
      },
      { on: "attacks", self: true, do: (g, s, ev, { p }) => { const n = attackingMine(g, p).length; if (n > 0) g.gainLife(p, n, s); } }
    ],
    // raid: after an attack, in main 2; before combat only when nothing of ours can attack
    ai: { priority: 7, cast: (g, p, o, { window }) => (window === "main1" && !attackedThisTurn(g, p) && g.creatures(p).some(c => g.canAttack(c, p)) ? false : undefined) }
  });

  /* ---------------------------------------------------------------- stand-ins for retail cards */
  D({
    name: "Selesnya Guildmage", cost: "{G/W}{G/W}", type: "Creature — Elf Wizard", pt: "2/2",
    text: "{3}{G}: Create a 1/1 green Saproling creature token.\n{3}{W}: Creatures you control get +1/+1 until end of turn.",
    abilities: [
      {
        label: "Create a 1/1 Saproling", cost: "{3}{G}",
        do: (g, s, ctx) => g.createToken(ctx.p, TK.saproling),
        ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && !crowded(g, p) }
      },
      {
        label: "Creatures get +1/+1", cost: "{3}{W}",
        do: (g, s, ctx) => { g.addEffect({ objs: g.creatures(ctx.p), pt: [1, 1] }); g.log(`Creatures ${ctx.p.name} controls get +1/+1 until end of turn.`, { p: ctx.p, cards: [s.def.name] }); },
        // after blocks, when at least two attackers are getting through
        ai: { use: (g, p, o, ctx) => { if (!ourCombat(g, p, ctx) || unblockedMine(g, p).length < 2) return false; const n = Math.min(4, Math.floor(manaNow(g, p) / 4)); return n > 0 ? { repeat: n } : false; } }
      }
    ],
    ai: { priority: 5 }
  });

  D({
    name: "Trostani Discordant", cost: "{3}{G}{W}", type: "Legendary Creature — Dryad", pt: "1/4",
    text: "Other creatures you control get +1/+1.\nWhen Trostani Discordant enters, create two 1/1 white Soldier creature tokens with lifelink.\nAt the beginning of your end step, each player gains control of all creatures they own.",
    statics: [{ applies: (g, s, o) => o !== s && myCreature(g, s, o), pt: [1, 1] }],
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.soldierLL, { count: 2 }) },
      {
        on: "endStep", when: (g, s, ev) => ev.p === s.controller,
        do: (g) => {
          for (const o of g.battlefield.slice()) {
            if (!g.isCreature(o) || o.controller === o.owner || o.owner.lost) continue;
            if (g.combat) g.removeFromCombat(o);
            o.controller = o.owner; o.sick = true;
            g.log(`${o.owner.name} gains control of ${o.def.name} again.`, { p: o.owner, cards: [o.def.name] });
          }
          g.bump();
        }
      }
    ],
    ai: { priority: 7 }
  });

  D({
    name: "Armada Wurm", cost: "{2}{G}{G}{W}{W}", type: "Creature — Wurm", pt: "5/5",
    keywords: ["trample"],
    text: "Trample\nWhen Armada Wurm enters, create a 5/5 green Wurm creature token with trample.",
    triggers: [{ on: "enters", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.wurm) }],
    ai: { priority: 7 }
  });

  D({
    name: "Conclave Cavalier", cost: "{G}{G}{W}{W}", type: "Creature — Centaur Knight", pt: "4/4",
    keywords: ["vigilance"],
    text: "Vigilance\nWhen Conclave Cavalier dies, create two 2/2 green and white Elk creature tokens.",
    triggers: [{ on: "dies", self: true, do: (g, s, ev, { p }) => g.createToken(p, TK.elk, { count: 2 }) }],
    ai: { priority: 6 }
  });

  D({
    name: "Solemn Simulacrum", cost: "{4}", type: "Artifact Creature — Golem", pt: "2/2",
    text: "When Solemn Simulacrum enters, you may search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.\nWhen Solemn Simulacrum dies, you may draw a card.",
    triggers: [
      { on: "enters", self: true, do: (g, s, ev, { p }) => fetchBasic(g, p, s, "Solemn Simulacrum: choose a basic land card") },
      { on: "dies", self: true, optional: "Solemn Simulacrum: draw a card?", do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }
    ],
    ai: { ramp: true, priority: 6, confirm: (g, p) => deckOK(p, 5) }
  });

  /* ================================================================ instants */
  D({
    name: "Fresh Meat", cost: "{3}{G}", type: "Instant",
    text: "Create a 3/3 green Beast creature token for each creature you controlled that was put into a graveyard from the battlefield this turn.",
    note: "The creatures that died this turn are counted by the deck's commander, Ghired.",
    spell: {
      do: (g, ctx) => {
        const n = turnRecord(g, ctx.p).died;
        if (n > 0) g.createToken(ctx.p, T.beast, { count: n });
        else g.log(`No creature ${ctx.p.name} controlled died this turn.`, { p: ctx.p, cards: ["Fresh Meat"] });
      }
    },
    ai: {
      priority: 5,
      cast: (g, p) => { const n = turnRecord(g, p).died; return n >= 2 ? 14 + n * 2 : false; },
      // at the end of any turn in which two or more of our creatures died
      plan: (g, p, o, ctx) => (o.zone === "hand" && ctx.window === "end" && turnRecord(g, p).died >= 2 && castable(ctx, o) ? { type: "cast", card: o, maxTries: 1 } : null)
    }
  });

  /* The creature Momentous Fall sacrifices: one an opponent's spell is about to destroy, else our
     biggest token. */
  function fallPick(g, p) {
    // the newest spell an opponent put on the stack (Momentous Fall itself sits above it while it is cast)
    const top = g.stack.slice().reverse().find(it => it.p !== p);
    const ours = g.creatures(p);
    if (top) {
      const hit = (top.targets || []).filter(t => t && !g.isPlayer(t) && ours.includes(t));
      if (hit.length) return hit.sort((a, b) => g.power(b) - g.power(a))[0];
      const ai = top.o.def.ai || {};
      if (ai.wipe) return ours.filter(c => !g.kw(c, "indestructible") && !(ai.spares && ai.spares(c))).sort((a, b) => g.power(b) - g.power(a))[0] || null;
    }
    return creatureTokens(g, p).sort((a, b) => g.power(b) - g.power(a))[0] || null;
  }
  const fallWorth = (g, p, c) => !!c && g.power(c) >= 3 && deckOK(p, g.power(c) + 10);
  D({
    name: "Momentous Fall", cost: "{2}{G}{G}", type: "Instant",
    text: "As an additional cost to cast this spell, sacrifice a creature.\nYou draw cards equal to the sacrificed creature's power, then you gain life equal to its toughness.",
    note: "The creature is sacrificed right after the spell is cast.",
    canCast: (g, p) => g.creatures(p).length > 0,
    onCast: async (g, p, o, item) => {
      if (item && item.isCopy) return;
      const opts = g.creatures(p);
      if (!opts.length) return;
      let pick = await g.ask(p, { type: "target", prompt: "Momentous Fall: sacrifice a creature (additional cost)", options: opts, purpose: "sacrifice", src: o });
      if (!pick || !opts.includes(pick)) pick = opts.slice().sort((a, b) => valueOf(g, a) - valueOf(g, b))[0];
      if (item) item.fallPT = [Math.max(0, g.power(pick)), Math.max(0, g.toughness(pick))];
      g.sacrifice(pick);
    },
    spell: {
      do: (g, ctx) => {
        const [n, life] = (ctx.item && ctx.item.fallPT) || [0, 0];
        if (n > 0) drawLog(g, ctx.p, n, ctx.o);
        if (life > 0) g.gainLife(ctx.p, life, ctx.o);
      }
    },
    ai: {
      priority: 4,
      target: (g, p, req) => { if (req.purpose !== "sacrifice") return undefined; const c = fallPick(g, p); return c && req.options.includes(c) ? c : undefined; },
      cast: (g, p, o, { window }) => (window === "main2" && p.hand.length <= 3 && creatureTokens(g, p).length >= 2 && fallWorth(g, p, fallPick(g, p)) ? 12 : false),
      // in response to removal or a wipe that would take the creature anyway
      plan: (g, p, o, ctx) => {
        if (o.zone !== "hand" || ctx.window !== "stack" || !castable(ctx, o)) return null;
        const top = g.stack[g.stack.length - 1];
        if (!top || top.p === p) return null;
        const c = fallPick(g, p);
        const doomed = !!c && ((top.targets || []).includes(c) || !!(top.o.def.ai || {}).wipe);
        return doomed && fallWorth(g, p, c) ? { type: "cast", card: o, maxTries: 1 } : null;
      }
    }
  });

  /* Naya Charm: kill a real threat, tap out the blockers of a player we can kill this turn, or
     get a big creature back when the hand is empty. */
  function nayaPlan(g, p) {
    // with a full hand in main 2 the charm is better spent on a small creature than discarded
    const full = p.hand.length >= 7 && g.active === p && g.phase === "main2";
    const kill = oppCreatures(g, p).filter(c => g.canTarget(p, c) && !g.kw(c, "indestructible") && g.lethalDamageLeft(c) <= 3 && threatOf(g, c, p) >= (full ? 2 : 4))
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
    if (kill) return { mode: 0, t: kill };
    if (g.active === p && g.phase === "main1") {
      const ready = g.creatures(p).filter(c => g.canAttack(c, p));
      const power = ready.reduce((s, c) => s + Math.max(0, g.power(c)), 0);
      const foe = g.opponents(p).filter(q => !g.playerHexproof(q) && q.life <= power && g.creatures(q).some(c => !c.tapped))
        .sort((a, b) => a.life - b.life)[0];
      if (foe && ready.length >= 2) return { mode: 2, t: foe };
    }
    if (p.hand.length <= 2) {
      const back = creatureCards(p.graveyard).filter(c => c.def.mv >= 4).sort((a, b) => b.def.mv - a.def.mv)[0];
      if (back) return { mode: 1, t: back };
    }
    return null;
  }
  D({
    name: "Naya Charm", cost: "{R}{G}{W}", type: "Instant",
    text: "Choose one —\n• Naya Charm deals 3 damage to target creature.\n• Return target card from a graveyard to its owner's hand.\n• Tap all creatures target player controls.",
    modes: [
      {
        label: "3 damage to target creature",
        canChoose: (g, p) => g.battlefield.some(c => g.isCreature(c) && g.canTarget(p, c)),
        targets: [{ kind: "creature", purpose: "harm", amount: 3, prompt: "Naya Charm deals 3 damage to" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.damage(ctx.src, ctx.targets[0], 3); }
      },
      {
        label: "Return target card from a graveyard to its owner's hand",
        canChoose: g => g.players.some(q => !q.lost && q.graveyard.length > 0),
        targets: [{ kind: "card", from: g => g.players.filter(q => !q.lost).reduce((a, q) => a.concat(q.graveyard), []), purpose: "reanimate", prompt: "Naya Charm: return target card from a graveyard to its owner's hand" }],
        do: (g, ctx) => {
          const t = ctx.targets[0];
          if (!ctx.legal[0] || !t || t.zone !== "graveyard") return;
          g.moveTo(t, "hand");
          g.log(`${t.def.name} returns to ${t.owner.name}'s hand.`, { p: t.owner, cards: [t.def.name] });
        }
      },
      {
        label: "Tap all creatures target player controls",
        targets: [{ kind: "player", purpose: "harm", prompt: "Naya Charm: tap all creatures target player controls" }],
        do: (g, ctx) => {
          const q = ctx.targets[0];
          if (!ctx.legal[0] || !q) return;
          for (const c of g.creatures(q)) g.tap(c);
          g.log(`All creatures ${q.name} controls become tapped.`, { p: ctx.p, cards: ["Naya Charm"] });
        }
      }
    ],
    ai: {
      priority: 5,
      mode: (g, p) => { const pl = nayaPlan(g, p); return pl ? pl.mode : 0; },
      target: (g, p, req) => { const pl = nayaPlan(g, p); return pl && req.options.includes(pl.t) ? pl.t : undefined; },
      cast: (g, p) => (nayaPlan(g, p) ? 17 : false)
    }
  });

  D({
    name: "Second Harvest", cost: "{2}{G}{G}", type: "Instant",
    text: "For each token you control, create a token that's a copy of that permanent.",
    spell: {
      do: (g, ctx) => {
        const groups = new Map();
        for (const t of g.controlled(ctx.p, o => o.isToken)) {
          const key = t.copyDef || t.def;
          const e = groups.get(key);
          if (e) e.n++; else groups.set(key, { src: t, n: 1 });
        }
        for (const { src, n } of groups.values()) if (src.zone === "battlefield") g.copyToken(ctx.p, src, { count: n });
      }
    },
    // the copies can't attack this turn: after combat, or at the end of the turn before ours
    ai: {
      priority: 6,
      cast: (g, p, o, { window }) => { const v = tokenValue(g, p); return window !== "main1" && v >= 12 && !crowded(g, p, 40) ? 16 + v * 0.1 : false; },
      plan: (g, p, o, ctx) => (o.zone === "hand" && endBeforeMe(g, p, ctx) && tokenValue(g, p) >= 12 && !crowded(g, p, 40) && castable(ctx, o) ? { type: "cast", card: o, maxTries: 1 } : null)
    }
  });

  D({
    name: "Slice in Twain", cost: "{2}{G}{G}", type: "Instant",
    text: "Destroy target artifact or enchantment.\nDraw a card.",
    spell: {
      targets: [{ kind: "artifactOrEnchantment", purpose: "harm", prompt: "Slice in Twain: destroy target artifact or enchantment" }],
      do: (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0], ctx.o); drawLog(g, ctx.p, 1, ctx.o); }
    },
    ai: { removal: true, minThreat: 4, priority: 5 }
  });

  D({
    name: "Trostani's Judgment", cost: "{5}{W}", type: "Instant",
    text: "Exile target creature, then populate. (Create a token that's a copy of a creature token you control.)",
    spell: {
      targets: [{ kind: "creature", purpose: "harm", prompt: "Trostani's Judgment: exile target creature" }],
      do: async (g, ctx) => {
        if (!ctx.legal[0]) return;
        g.exile(ctx.targets[0], ctx.o);
        await g.populate(ctx.p, ctx.o);
      }
    },
    ai: { removal: true, minThreat: 5, priority: 5, target: populateHint }
  });

  /* Selesnya Charm (standing in for Druid's Deliverance): exile a big threat; late in the game a
     spare one makes a Knight. */
  function charmExileTarget(g, p) {
    return oppCreatures(g, p).filter(c => g.canTarget(p, c) && g.power(c) >= 5 && threatOf(g, c, p) >= 6)
      .sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0] || null;
  }
  D({
    name: "Selesnya Charm", cost: "{G}{W}", type: "Instant",
    text: "Choose one —\n• Target creature gets +2/+2 and gains trample until end of turn.\n• Exile target creature with power 5 or greater.\n• Create a 2/2 white Knight creature token with vigilance.",
    modes: [
      {
        label: "Target creature gets +2/+2 and trample",
        canChoose: (g, p) => g.battlefield.some(c => g.isCreature(c) && g.canTarget(p, c)),
        targets: [{ kind: "creature", purpose: "help", prompt: "Selesnya Charm: target creature gets +2/+2 and gains trample" }],
        do: (g, ctx) => {
          const t = ctx.targets[0];
          if (!ctx.legal[0] || !t) return;
          g.pump(t, 2, 2, ["trample"]);
          g.log(`${t.def.name} gets +2/+2 and trample until end of turn.`, { p: ctx.p, cards: [t.def.name] });
        }
      },
      {
        label: "Exile target creature with power 5 or greater",
        canChoose: (g, p) => g.battlefield.some(c => g.isCreature(c) && g.power(c) >= 5 && g.canTarget(p, c)),
        targets: [{ kind: "creature", purpose: "harm", filter: (g, c) => g.power(c) >= 5, prompt: "Selesnya Charm: exile target creature with power 5 or greater" }],
        do: (g, ctx) => { if (ctx.legal[0]) g.exile(ctx.targets[0], ctx.o); }
      },
      { label: "Create a 2/2 white Knight with vigilance", do: (g, ctx) => g.createToken(ctx.p, TK.knight) }
    ],
    ai: {
      priority: 5,
      mode: (g, p) => (charmExileTarget(g, p) ? 1 : 2),
      target: (g, p, req) => { if (req.purpose !== "harm") return undefined; const t = charmExileTarget(g, p); return t && req.options.includes(t) ? t : undefined; },
      cast: (g, p, o, { window }) => (charmExileTarget(g, p) ? 18 : window === "main2" && landCount(g, p) >= 7 && p.hand.length <= 2 ? 9 : false)
    }
  });

  /* ================================================================ sorceries */
  D({
    name: "Explore", cost: "{1}{G}", type: "Sorcery",
    text: "You may play an additional land this turn.\nDraw a card.",
    spell: {
      do: (g, ctx) => {
        ctx.p.landsPlayed -= 1;
        g.log(`${ctx.p.name} may play an additional land this turn.`, { p: ctx.p, cards: ["Explore"] });
        drawLog(g, ctx.p, 1, ctx.o);
      }
    },
    ai: { ramp: true, priority: 7 }
  });

  D({
    name: "Full Flowering", cost: "{X}{X}{G}", type: "Sorcery",
    text: "Populate X times.",
    minX: 1,
    spell: {
      do: async (g, ctx) => {
        for (let i = 0; i < ctx.x && !g.over; i++) if (!(await g.populate(ctx.p, ctx.o))) break;
      }
    },
    ai: {
      priority: 6,
      target: populateHint,
      // past about forty creatures more copies add little
      x: (g, p, o, xMax) => Math.max(1, Math.min(xMax, 40 - g.creatures(p).length)),
      cast: (g, p, o) => {
        if (!creatureTokens(g, p).length || crowded(g, p, 38)) return false;
        const xMax = g.maxX(p, g.spellCost(p, o, { x: 0 }), 2);
        return xMax >= 2 ? 14 + xMax * 2 : false;
      }
    }
  });

  /* Ghired's Belligerence: the creatures X damage can kill, most threat per point of damage first. */
  function belligerencePlan(g, p, x) {
    const cands = oppCreatures(g, p).filter(c => g.canTarget(p, c) && !g.kw(c, "indestructible"))
      .map(c => ({ c, need: Math.max(1, g.lethalDamageLeft(c)), t: threatOf(g, c, p) }))
      .filter(e => e.t >= 3)
      .sort((a, b) => (b.t / b.need - a.t / a.need) || (b.t - a.t));
    const kills = [];
    let left = x, value = 0;
    for (const e of cands) if (e.need <= left) { kills.push(e); left -= e.need; value += e.t; }
    return { kills, used: x - left, value };
  }
  D({
    name: "Ghired's Belligerence", cost: "{X}{2}{R}", type: "Sorcery",
    text: "Ghired's Belligerence deals X damage divided as you choose among any number of target creatures. Whenever a creature dealt damage this way dies this turn, populate.",
    note: "The creatures and the split are chosen as it resolves. It populates once for each creature it damaged that dies right away.",
    minX: 1,
    canCast: (g, p) => g.battlefield.some(c => g.isCreature(c) && g.canTarget(p, c)),
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p, x = ctx.x;
        const opts = g.battlefield.filter(c => g.isCreature(c) && g.canTarget(p, c));
        if (x <= 0 || !opts.length) return;
        let map = {};
        if (p.agent && p.agent.bot) {
          const plan = belligerencePlan(g, p, x);
          let left = x;
          for (const e of plan.kills) { map[e.c.id] = e.need; left -= e.need; }
          if (left > 0) {
            // spare damage goes to an opposing creature, never to our own
            const extra = plan.kills.length ? plan.kills[0].c : opts.filter(c => c.controller !== p).sort((a, b) => threatOf(g, b, p) - threatOf(g, a, p))[0];
            if (extra) map[extra.id] = (map[extra.id] || 0) + left;
          }
        } else {
          map = (await g.ask(p, { type: "distribute", prompt: `Ghired's Belligerence: divide ${x} damage among any number of creatures`, total: x, options: opts, purpose: "damage", src: ctx.o })) || {};
        }
        const hit = [];
        let used = 0;
        for (const c of opts) {
          const n = Math.max(0, Math.min(x - used, map[c.id] | 0));
          if (n <= 0 || c.zone !== "battlefield") continue;
          used += n;
          g.damage(ctx.src, c, n);
          hit.push({ c, zc: c.zc });
        }
        g.checkSBA();
        const died = hit.filter(h => h.c.zone !== "battlefield" || h.c.zc !== h.zc).length;
        for (let i = 0; i < died && !g.over; i++) await g.populate(p, ctx.src);
      }
    },
    ai: {
      priority: 6,
      target: populateHint,
      x: (g, p, o, xMax) => Math.max(1, belligerencePlan(g, p, xMax).used),
      cast: (g, p, o) => {
        const xMax = g.maxX(p, g.spellCost(p, o, { x: 0 }), 1);
        if (xMax < 1) return false;
        const plan = belligerencePlan(g, p, xMax);
        return plan.kills.length >= 2 || plan.value >= 8 ? 16 + plan.value * 0.4 : false;
      }
    }
  });

  /* Hate Mirage borrows the two best attackers (or best enters-the-battlefield effects) at the table. */
  function miragePicks(g, p, opts) {
    const score = c => Math.max(0, g.power(c)) * 1.2 + (hasETB(c) ? 3 : 0) - (g.kw(c, "defender") ? 6 : 0);
    const out = [];
    for (const c of opts.slice().sort((a, b) => score(b) - score(a))) {
      if (out.length >= 2 || score(c) <= 0) break;
      // a copy of a legendary creature we already have (or took once) would die to the legend rule
      if (legendClash(g, p, c) || (c.def.legendary && out.some(x => x.def.name === c.def.name))) continue;
      out.push(c);
    }
    return out;
  }
  const mirageOptions = (g, p) => g.battlefield.filter(c => g.isCreature(c) && c.controller !== p && g.canTarget(p, c));
  D({
    name: "Hate Mirage", cost: "{3}{R}", type: "Sorcery",
    text: "Choose up to two target creatures you don't control. For each of those creatures, create a token that's a copy of that creature. Those tokens gain haste. Exile them at the beginning of the next end step.",
    note: "The creatures are chosen as it resolves.",
    spell: {
      do: async (g, ctx) => {
        const p = ctx.p;
        const opts = mirageOptions(g, p);
        if (!opts.length) return;
        const picks = p.agent && p.agent.bot ? miragePicks(g, p, opts)
          : ((await g.ask(p, { type: "targets", prompt: "Hate Mirage: choose up to two creatures you don't control", options: opts, min: 0, max: 2, purpose: "copy", src: ctx.o })) || []);
        for (const c of picks.slice(0, 2)) {
          if (c.zone !== "battlefield") continue;
          const [tok] = g.copyToken(p, c, { haste: true });
          if (tok) g.delayed.push({ at: "endStep", once: true, controller: p, src: ctx.o, do: g2 => { if (tok.zone === "battlefield") g2.exile(tok); } });
        }
      }
    },
    // before combat, when the borrowed creatures hit hard
    ai: {
      priority: 5,
      cast: (g, p, o, { window }) => {
        if (window !== "main1") return false;
        const pw = miragePicks(g, p, mirageOptions(g, p)).reduce((s, c) => s + Math.max(0, g.power(c)), 0);
        return pw >= 6 ? 14 + pw * 0.5 : false;
      }
    }
  });

  D({
    name: "Phyrexian Rebirth", cost: "{4}{W}{W}", type: "Sorcery",
    text: "Destroy all creatures, then create an X/X colorless Phyrexian Horror artifact creature token, where X is the number of creatures destroyed this way.",
    spell: {
      do: (g, ctx) => {
        const n = g.destroyAll(g.battlefield.filter(c => g.isCreature(c)), ctx.o);
        g.log(`Phyrexian Rebirth destroys ${n} creature${n === 1 ? "" : "s"}.`, { p: ctx.p, cards: ["Phyrexian Rebirth"], kind: "big" });
        if (n > 0) g.createToken(ctx.p, horrorToken(n));
      }
    },
    ai: { wipe: true, priority: 5 }
  });

  /* ================================================================ artifacts */
  const vatCard = s => { const l = s.state && s.state.vat; return l && l.card.zone === "exile" && l.card.zc === l.zc ? l.card : null; };
  D({
    name: "Mimic Vat", cost: "{3}", type: "Artifact",
    text: "Imprint — Whenever a nontoken creature dies, you may exile that card. If you do, return each other card exiled with Mimic Vat to its owner's graveyard.\n{3}, {T}: Create a token that's a copy of a card exiled with Mimic Vat. It gains haste. Exile it at the beginning of the next end step.",
    triggers: [{
      on: "dies", when: (g, s, ev) => !!ev.lki && !ev.lki.isToken && ev.o !== s,
      do: async (g, s, ev, { p }) => {
        const c = ev.o;
        if (s.zone !== "battlefield" || c.zone !== "graveyard") return;
        const ok = await g.ask(p, { type: "confirm", prompt: `Mimic Vat: exile ${c.def.name}?`, src: s, purpose: "mimicVat", card: c });
        if (!ok || c.zone !== "graveyard" || s.zone !== "battlefield") return;
        const old = vatCard(s);
        g.moveTo(c, "exile");
        s.state.vat = { card: c, zc: c.zc };
        g.log(`${p.name} exiles ${c.def.name} with Mimic Vat.`, { p, cards: [c.def.name] });
        if (old) { g.moveTo(old, "graveyard"); g.log(`${old.def.name} goes back to ${old.owner.name}'s graveyard.`, { p: old.owner, cards: [old.def.name] }); }
      }
    }],
    abilities: [{
      label: "Copy the exiled card", cost: "{3}", tap: true,
      condition: (g, o) => !!vatCard(o),
      do: (g, s, ctx) => {
        const c = vatCard(s);
        if (!c) return;
        const [tok] = g.copyToken(ctx.p, c, { haste: true });
        if (tok) g.delayed.push({ at: "endStep", once: true, controller: ctx.p, src: s, do: g2 => { if (tok.zone === "battlefield") g2.exile(tok); } });
      },
      // at the end of the turn before ours the copy lasts through our turn
      ai: { use: (g, p, o, ctx) => copyScore(vatCard(o)) >= 5 && !legendClash(g, p, vatCard(o)) && (endBeforeMe(g, p, ctx) || (ctx.window === "main1" && g.active === p)) }
    }],
    ai: { priority: 5, confirm: (g, p, req) => req.purpose !== "mimicVat" || copyScore(req.card) > copyScore(vatCard(req.src)) }
  });

  const foundryCard = s => { const l = s.state && s.state.foundry; return l && l.card.zone === "exile" && l.card.zc === l.zc ? l.card : null; };
  /* The creature card Soul Foundry keeps: the best one we can afford to copy, never a legendary one. */
  const foundryPick = (g, p, options) => options.filter(c => !c.def.legendary && c.def.mv >= 2 && c.def.mv <= landCount(g, p) + 1)
    .sort((a, b) => copyScore(b) - copyScore(a))[0] || null;
  D({
    name: "Soul Foundry", cost: "{4}", type: "Artifact",
    text: "Imprint — When Soul Foundry enters, you may exile a creature card from your hand.\n{X}, {T}: Create a token that's a copy of the exiled card. X is the mana value of the exiled card.",
    triggers: [{
      on: "enters", self: true,
      do: async (g, s, ev, { p }) => {
        const opts = creatureCards(p.hand);
        if (!opts.length || s.zone !== "battlefield") return;
        const pick = await g.ask(p, { type: "target", prompt: "Soul Foundry: you may exile a creature card from your hand", options: opts, optional: true, purpose: "imprint", src: s });
        if (!pick || pick.zone !== "hand" || s.zone !== "battlefield") return;
        g.moveTo(pick, "exile");
        s.state.foundry = { card: pick, zc: pick.zc };
        g.log(`${p.name} exiles ${pick.def.name} with Soul Foundry.`, { p, cards: [pick.def.name] });
      }
    }],
    abilities: [{
      label: "Copy the exiled card", cost: "{X}", tap: true,
      condition: (g, o) => !!foundryCard(o),
      xFrom: (g, ctx) => { const c = foundryCard(ctx.src); return c ? c.def.mv : 0; },
      minXFn: (g, o) => { const c = foundryCard(o); return c ? c.def.mv : 0; },
      do: (g, s, ctx) => { const c = foundryCard(s); if (c) g.copyToken(ctx.p, c); },
      ai: { use: (g, p, o, ctx) => sinkTime(g, p, ctx) }
    }],
    ai: { priority: 5, target: (g, p, req) => (req.purpose === "imprint" ? foundryPick(g, p, req.options) : undefined) }
  });

  /* ================================================================ enchantments */
  const commanderCasts = p => Object.values(p.cmdCasts || {}).reduce((a, b) => a + b, 0);
  D({
    name: "Commander's Insignia", cost: "{2}{W}{W}", type: "Enchantment",
    text: "Creatures you control get +1/+1 for each time you've cast your commander from the command zone this game.",
    statics: [{ applies: (g, s, o) => myCreature(g, s, o), pt: (g, s) => { const n = commanderCasts(s.controller); return [n, n]; } }],
    ai: { priority: 5, cast: (g, p) => (commanderCasts(p) >= 1 && g.creatures(p).length >= 2 ? undefined : false) }
  });

  D({
    name: "Elemental Bond", cost: "{2}{G}", type: "Enchantment",
    text: "Whenever a creature you control with power 3 or greater enters, draw a card.",
    triggers: [{ on: "enters", when: (g, s, ev) => myCreature(g, s, ev.o) && g.power(ev.o) >= 3, do: (g, s, ev, { p }) => drawLog(g, p, 1, s) }],
    ai: { priority: 6 }
  });

  D({
    name: "Growing Ranks", cost: "{2}{G/W}{G/W}", type: "Enchantment",
    text: "At the beginning of your upkeep, populate. (Create a token that's a copy of a creature token you control.)",
    triggers: [{
      on: "upkeep", when: (g, s, ev) => ev.p === s.controller,
      do: async (g, s, ev, { p }) => { if (creatureTokens(g, p).length) await g.populate(p, s); }
    }],
    ai: { priority: 6, target: populateHint }
  });

  /* ================================================================ lands */
  const land = (name, extra) => D(Object.assign({ name, type: "Land" }, extra));
  const gainOnEnter = { on: "enters", self: true, do: (g, s, ev, { p }) => g.gainLife(p, 1, s) };
  const fetcher = name => land(name, {
    text: `{T}, Sacrifice ${name}: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.`,
    abilities: [{
      label: "Search for a basic land", tap: true, sacSelf: true,
      do: (g, s, ctx) => fetchBasic(g, ctx.p, s, `${name}: choose a basic land card`),
      ai: { use: (g, p, o, ctx) => ctx.window !== "stack" && ctx.window !== "combat" }
    }]
  });
  fetcher("Evolving Wilds");
  fetcher("Terramorphic Expanse");

  land("Cinder Glade", {
    type: "Land — Mountain Forest",
    text: "({T}: Add {R} or {G}.)\nCinder Glade enters tapped unless you control two or more basic lands.",
    etbTapped: (g, o) => g.controlled(o.controller, x => x !== o && g.isLand(x) && g.isBasic(x)).length < 2,
    mana: [{ tap: true, produce: ["R", "G"] }]
  });

  /* Exotic Orchard: the colors the opponents' lands could make. Other lands whose mana is worked
     out on the fly (another Exotic Orchard) are skipped, so two Orchards don't ask each other forever. */
  function orchardColors(g, o) {
    const out = new Set();
    for (const q of g.opponents(o.controller)) {
      for (const l of g.controlled(q, x => g.isLand(x))) {
        for (const ab of l.def.mana || []) {
          const pr = ab.produce;
          if (!pr || typeof pr === "function") continue;
          const list = Array.isArray(pr) ? pr.join("") : pr === "any" ? g.identityOf(q).join("") : pr === "any5" ? "WUBRG" : String(pr);
          for (const k of list) if ("WUBRG".includes(k)) out.add(k);
        }
      }
    }
    return [...out];
  }
  land("Exotic Orchard", {
    text: "{T}: Add one mana of any color that a land an opponent controls could produce.",
    mana: [{ tap: true, produce: (g, o) => orchardColors(g, o) }]
  });

  land("Gargoyle Castle", {
    text: "{T}: Add {C}.\n{5}, {T}, Sacrifice Gargoyle Castle: Create a 3/4 colorless Gargoyle artifact creature token with flying.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Create a 3/4 Gargoyle", cost: "{5}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.createToken(ctx.p, TK.gargoyle),
      ai: { use: (g, p, o, ctx) => endBeforeMe(g, p, ctx) && landCount(g, p) >= 8 }
    }]
  });

  land("Jungle Shrine", { text: "Jungle Shrine enters tapped.\n{T}: Add {R}, {G}, or {W}.", etbTapped: true, mana: [{ tap: true, produce: ["R", "G", "W"] }] });

  land("Naya Panorama", {
    text: "{T}: Add {C}.\n{1}, {T}, Sacrifice Naya Panorama: Search your library for a basic Mountain, Forest, or Plains card, put it onto the battlefield tapped, then shuffle.",
    mana: [{ tap: true, produce: "C" }],
    abilities: [{
      label: "Search for a basic land", cost: "{1}", tap: true, sacSelf: true,
      do: (g, s, ctx) => g.search(ctx.p, { filter: (g2, c) => basicLandCard(g2, c) && ["Mountain", "Forest", "Plains"].some(t => c.def.subtypes.includes(t)), to: "battlefield", tapped: true, prompt: "Naya Panorama: choose a basic Mountain, Forest or Plains card", src: s }),
      ai: { use: (g, p, o, ctx) => ctx.window === "main2" || endBeforeMe(g, p, ctx) }
    }]
  });

  const gainland = (name, a, b) => land(name, {
    text: `${name} enters tapped.\nWhen ${name} enters, you gain 1 life.\n{T}: Add {${a}} or {${b}}.`,
    etbTapped: true, triggers: [gainOnEnter], mana: [{ tap: true, produce: [a, b] }]
  });
  gainland("Rugged Highlands", "R", "G");
  gainland("Kazandu Refuge", "R", "G");
  gainland("Wind-Scarred Crag", "R", "W");
  land("Rootbound Crag", {
    text: "Rootbound Crag enters tapped unless you control a Mountain or a Forest.\n{T}: Add {R} or {G}.",
    etbTapped: (g, o) => !g.controlled(o.controller, x => x !== o && g.isLand(x) && (x.def.subtypes.includes("Mountain") || x.def.subtypes.includes("Forest"))).length,
    mana: [{ tap: true, produce: ["R", "G"] }]
  });

  /* ================================================================ the deck */
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "ghired", name: "Ghired", title: GHIRED, commander: GHIRED,
    identity: ["R", "G", "W"], bracket: 2, precon: "Primal Genesis (Commander 2019)", aggression: 0.55,
    style: "Naya populate tokens",
    blurb: "Ghired makes a 4/4 Rhino and copies the best creature token every time he attacks, while Growing Ranks and Song of the Worldsoul keep the copies coming.",
    watch: [GHIRED, "Growing Ranks", "Song of the Worldsoul", "Garruk, Primal Hunter", "Phyrexian Rebirth"],
    list: (function () {
      const singles = [
        // creatures (28): the retail ones, with Selesnya Guildmage, Trostani Discordant, Armada Wurm,
        // Conclave Cavalier, Hellrider and Solemn Simulacrum standing in for cards the engine can't play
        "Angel of Sanctions", "Atla Palani, Nest Tender", "Selesnya Guildmage", "Desolation Twin", "Doomed Artisan",
        "Dragonmaster Outcast", "Trostani Discordant", "Feldon of the Third Path", "Flamerush Rider", "Garruk's Packleader",
        "Giant Adephage", "Heart-Piercer Manticore", "Armada Wurm", "Ohran Frostfang", "Rampaging Baloths", "Roc Egg",
        "Sakura-Tribe Elder", "Solemn Simulacrum", "Selesnya Eulogist", "Soul of Zendikar", "Conclave Cavalier", "Hellrider",
        "Thragtusk", "Trostani, Selesnya's Voice", "Vitu-Ghazi Guildmage", "Voice of Many", "Wayfaring Temple", "Wingmate Roc",
        // planeswalker (1)
        "Garruk, Primal Hunter",
        // instants (10)
        "Beast Within", "Selesnya Charm", "Fresh Meat", "Momentous Fall", "Naya Charm", "Rootborn Defenses", "Second Harvest",
        "Slice in Twain", "Sundering Growth", "Trostani's Judgment",
        // sorceries (10)
        "Cultivate", "Explore", "Farseek", "Full Flowering", "Ghired's Belligerence", "Harmonize", "Hate Mirage",
        "Hour of Reckoning", "Phyrexian Rebirth", "Shamanic Revelation",
        // artifacts (5)
        "Idol of Oblivion", "Lightning Greaves", "Mimic Vat", "Sol Ring", "Soul Foundry",
        // enchantments (6)
        "Colossal Majesty", "Commander's Insignia", "Elemental Bond", "Growing Ranks", "Intangible Virtue", "Song of the Worldsoul",
        // lands (19 + 8 Forests + 5 Mountains + 7 Plains)
        "Blossoming Sands", "Wind-Scarred Crag", "Cinder Glade", "Command Tower", "Evolving Wilds", "Exotic Orchard",
        "Gargoyle Castle", "Graypelt Refuge", "Rootbound Crag", "Jungle Shrine", "Kazandu Refuge", "Krosan Verge",
        "Myriad Landscape", "Naya Panorama", "Rogue's Passage", "Rugged Highlands", "Selesnya Sanctuary", "Sungrass Prairie",
        "Terramorphic Expanse"
      ];
      const list = singles.slice();
      for (let i = 0; i < 8; i++) list.push("Forest");
      for (let i = 0; i < 5; i++) list.push("Mountain");
      for (let i = 0; i < 7; i++) list.push("Plains");
      return list;
    })()
  });
})(typeof window !== "undefined" ? window : globalThis);
