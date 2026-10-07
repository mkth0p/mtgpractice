/* The bot brain for the Miku decks (Trostani: "miku-precon", "miku-budget", "miku") in the Miku tournament research
   (research/miku-tournament/). Sim only: the site's file lists (app.js GAME_FILES, sw.js) don't load this file, so the
   Play tab is unchanged; tools/sim/run.js and wrap.js load every decks-*.js by themselves.
   It plays the deck's combo lines the way the pilot sheet tells a person to:
   - Walking Ballista is cast for X >= 2 only (a 1-counter Ballista can't loop with Heliod) and never attacks or blocks
     while Heliod is in the deck; Spike Feeder stays home too.
   - Spike Feeder loops with Archangel of Thune as well as with Heliod (the engine's helper only looped with Heliod),
     and loops until Aetherflux Reservoir can shoot every opponent, or 60 times for Thune counters before combat.
   - Aetherflux Reservoir shoots an opponent it kills first, else the most life it can take, and never a creature.
   - Scurry Oak + Trostani + a "whenever you gain life, put a counter" engine is noted in its card (cards-miku-tourney.js).
   MIKU_OFF=ballista,feeder,flux,home turns parts off for ablations. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const IDS = ["miku-precon", "miku-budget", "miku"];
  const ON = new Set(String((root.process && root.process.env && root.process.env.MIKU_ON) || "").split(",").filter(Boolean));
  const OFF = new Set(String((root.process && root.process.env && root.process.env.MIKU_OFF) || "").split(",").filter(Boolean));
  const on = (g, p, name) => g.controlled(p, o => o.def.name === name);
  const has = (g, p, name) => on(g, p, name).length > 0;
  const inDeck = (p, name) => p.library.concat(p.hand).some(o => o.def.name === name);
  const isMiku = p => p && IDS.includes(p.deckId);
  const mem = (g, p) => { const m = g.__mikuBrain || (g.__mikuBrain = {}); return m[p.id] || (m[p.id] = {}); };

  function plan(g, p, ctx) {
    const acts = ctx.actions || [];
    const opps = g.opponents(p);
    // Heliod + Ballista: lifelink on a 2+-counter Ballista before anything else spends the {1}{W}
    if (!OFF.has("ballista") && has(g, p, "Heliod, Sun-Crowned") && on(g, p, "Walking Ballista").some(b => (b.counters.p1 || 0) >= 2 && !g.kw(b, "lifelink"))) {
      const a = acts.find(x => x.type === "activate" && x.card.def.name === "Heliod, Sun-Crowned" && x.ab && /lifelink/i.test(x.ab.label || ""));
      if (a) return { type: "activate", card: a.card, idx: a.idx, maxTries: 2 };
    }
    // Spike Feeder loops: with Heliod (its counter comes back) or Archangel of Thune (a counter on every creature)
    if (!OFF.has("feeder")) {
      const feeder = on(g, p, "Spike Feeder").find(o => (o.counters.p1 || 0) >= 1);
      const engine = has(g, p, "Archangel of Thune") || (has(g, p, "Heliod, Sun-Crowned") && !on(g, p, "Walking Ballista").some(b => (b.counters.p1 || 0) > 0));
      const m = mem(g, p);
      if (feeder && engine && m.feederTurn !== g.turn) {
        const a = acts.find(x => x.type === "activate" && x.card === feeder && x.ab && /gain 2 life/.test(x.ab.label || ""));
        if (a) {
          m.feederTurn = g.turn;
          const flux = has(g, p, "Aetherflux Reservoir");
          const need = flux ? opps.length * 50 + 25 : 0;
          const reps = flux ? Math.max(30, Math.min(500, Math.ceil((need - p.life) / 2) + 2)) : 60;
          return { type: "activate", card: a.card, idx: a.idx, repeat: reps, maxTries: 1 };
        }
      }
    }
    // Aetherflux Reservoir: shoot whoever 50 kills first, while we stay above 0
    // (flux2: only when the shot kills someone and leaves us at 15+, or we're the last two, or we stay at 40+)
    if (!OFF.has("flux") && p.life > 50 && (!ON.has("flux2") || fluxOk(g, p))) {
      const a = acts.find(x => x.type === "activate" && x.card.def.name === "Aetherflux Reservoir");
      if (a && opps.length) return { type: "activate", card: a.card, idx: a.idx, maxTries: 3 };
    }
    return null;
  }
  function fluxOk(g, p) {
    const opps = g.opponents(p), after = p.life - 50;
    return after >= 40 || (opps.some(q => q.life <= 50) && (after >= 15 || opps.length === 1));
  }
  function choose(g, p, req) {
    const src = req && req.src;
    if (!OFF.has("flux") && src && src.def && src.def.name === "Aetherflux Reservoir" && req.options) {
      const players = req.options.filter(o => o && o.life != null && o !== p && !o.lost);
      if (!players.length) return undefined;
      const dead = players.filter(q => q.life <= 50).sort((a, b) => b.life - a.life);
      return dead[0] || players.sort((a, b) => a.life - b.life)[0];
    }
    // a search that puts a creature onto the battlefield (Finale of Devastation): never an X creature (Walking Ballista
    // enters with no counters and dies); the missing combo piece first
    if (!OFF.has("finale") && src && src.def && /Finale of Devastation|Chord of Calling|Green Sun's Zenith|Eladamri's Call|Worldly Tutor|Enlightened Tutor|Natural Order/.test(src.def.name) && req.options && req.options.length && req.options.every(o => o && o.def)) {
      const toBf = /Finale|Chord|Zenith|Natural Order/.test(src.def.name);
      const opts = req.options.filter(o => !(toBf && /\{X\}/.test(o.def.cost || "")));
      const find = n => opts.find(o => o.def.name === n);
      const heliod = has(g, p, "Heliod, Sun-Crowned"), thune = has(g, p, "Archangel of Thune"), feeder = has(g, p, "Spike Feeder");
      const ballista = on(g, p, "Walking Ballista").some(b => (b.counters.p1 || 0) >= 2) || p.hand.some(o => o.def.name === "Walking Ballista");
      const pick = (heliod || thune) && find("Spike Feeder") || (ballista || feeder) && find("Heliod, Sun-Crowned") || feeder && find("Archangel of Thune")
        || (has(g, p, "Trostani, Selesnya's Voice") && (heliod || thune) && find("Scurry Oak")) || null;
      if (pick) return req.type === "cards" ? [pick] : pick;
      if (opts.length < req.options.length) { const best = opts.slice().sort((a, b) => b.def.mv - a.def.mv)[0]; if (best) return req.type === "cards" ? [best] : best; }
    }
    // Skullclamp: never on a combo piece or the commander; a 1-toughness token first
    if (!OFF.has("clamp") && src && src.def && src.def.name === "Skullclamp" && req.options && req.options.some(o => o && PIECES.has(o.def && o.def.name))) {
      const ok = req.options.filter(o => o && o.def && !PIECES.has(o.def.name) && o.controller === p);
      if (!ok.length) return null;
      return ok.slice().sort((a, b) => (g.toughness(a) === 1 ? 0 : 1) - (g.toughness(b) === 1 ? 0 : 1) || (a.isToken ? 0 : 1) - (b.isToken ? 0 : 1))[0];
    }
    return undefined;
  }
  const PIECES = new Set(["Walking Ballista", "Spike Feeder", "Heliod, Sun-Crowned", "Archangel of Thune", "Trostani, Selesnya's Voice", "Scurry Oak"]);
  function keepHome(g, p, c) {
    if (OFF.has("home")) return false;
    if (c.def.name === "Walking Ballista" && (has(g, p, "Heliod, Sun-Crowned") || inDeck(p, "Heliod, Sun-Crowned"))) return "always";
    if (c.def.name === "Spike Feeder") return "always";
    return false;
  }
  /* mull2 (MIKU_ON=mull2): the Bracket 4 keep rule of the pilot sheet. 2–4 lands with a play by turn 2 (a 1–2-mana
     ramp piece or creature), or 3–4 lands with both colors for Trostani by turn 4; 5 lands only with ramp. After two
     mulligans, any 2–5 lands. */
  function mulligan(g, p, { hand, mulls }) {
    if (!ON.has("mull2")) return undefined;
    const lands = hand.filter(o => o.def.types.includes("Land"));
    const non = hand.filter(o => !o.def.types.includes("Land"));
    const cheap = non.filter(o => o.def.mv <= 2 && ((o.def.ai && o.def.ai.ramp) || o.def.types.includes("Creature") || o.def.name === "Sol Ring" || o.def.name === "Cleric Class"));
    const colors = new Set(); for (const o of lands) for (const m of o.def.mana || []) for (const c of [].concat(m.produce || [])) colors.add(c === "any" ? "GW" : c);
    const both = [...colors].join("").includes("G") && [...colors].join("").includes("W");
    const n = lands.length;
    if (mulls >= 2) return n >= 2 && n <= 5;
    if (n >= 2 && n <= 4 && cheap.length) return true;
    if (n >= 3 && n <= 4 && both) return true;
    if (n === 5 && cheap.some(o => o.def.ai && o.def.ai.ramp)) return true;
    return false;
  }
  const brain = { plan, choose, keepHome, mulligan };
  MK.DECK_BRAINS = MK.DECK_BRAINS || {};
  for (const id of IDS) MK.DECK_BRAINS[id] = brain;

  // Walking Ballista: a Miku deck casts it for X >= 2 only (gated on the deck, so other decks play it as before)
  const bal = MK.defs.get("Walking Ballista");
  if (bal && !OFF.has("ballista") && !bal.__mikuHold) {
    bal.ai = Object.assign({}, bal.ai);
    const prev = bal.ai.hold, prevX = bal.ai.x;
    const xm = (g, p, o) => g.maxX(p, g.spellCost(p, o, { x: 0 }), 2);
    // with Heliod out, wait until X >= 2 and {1}{W} for the lifelink fit in the same turn (6 mana)
    bal.ai.hold = (g, p, o) => (isMiku(p) && (xm(g, p, o) < 2 || (has(g, p, "Heliod, Sun-Crowned") && xm(g, p, o) < 3))) || (prev ? prev(g, p, o) : false);
    bal.ai.x = (g, p, o, xMax) => isMiku(p) && has(g, p, "Heliod, Sun-Crowned") && xMax >= 3 ? xMax - 1 : (prevX ? prevX(g, p, o, xMax) : xMax);
    // no stray pings while Heliod waits for the lifelink: the counters are the combo (a ping that kills a player still goes)
    const ping = bal.abilities && bal.abilities[1];
    if (ping && ping.ai && ping.ai.use) {
      const use0 = ping.ai.use;
      ping.ai = Object.assign({}, ping.ai, { use: (g, p, o, ctx) => {
        if (isMiku(p) && has(g, p, "Heliod, Sun-Crowned") && !g.kw(o, "lifelink") && !g.opponents(p).some(q => q.life <= (o.counters.p1 || 0) - 1)) return false;
        return use0(g, p, o, ctx);
      } });
    }
    bal.__mikuHold = true;
  }
  // flux2: the card's own hint (shoot at 60+ life) follows the same rule for a Miku deck
  const flux = MK.defs.get("Aetherflux Reservoir");
  if (flux && ON.has("flux2") && flux.abilities && flux.abilities[0] && !flux.__miku) {
    const ab = flux.abilities[0], use0 = ab.ai && ab.ai.use;
    ab.ai = Object.assign({}, ab.ai, { use: (g, p, o, ctx) => isMiku(p) ? fluxOk(g, p) && p.life > 50 : (use0 ? use0(g, p, o, ctx) : false) });
    flux.__miku = true;
  }
  MK.MIKU_BRAIN = { plan, choose, keepHome, IDS };
})(typeof window !== "undefined" ? window : globalThis);
