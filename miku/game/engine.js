/* Miku Commander: a client-side rules engine for Commander games against bots.
   The same file runs in the browser and in Node (tools/sim), so the bots can be tested for
   thousands of games without a screen. Card behaviour lives in cards-*.js and decks-*.js,
   the bots' decisions in ai.js, and the table in game-ui.js.

   Shape of the engine
   - Cards are definitions (MK.define) and objects (one per physical card or token in a game).
   - Every change goes through a Game method that bumps a version number, logs, and queues any
     triggered abilities. Triggers resolve after the action that caused them, newest first.
   - Decisions are asked of a player's agent (human UI or bot) through one async `choose`.
   - Characteristics (types, power, toughness, keywords) are computed on demand from the card,
     its counters, static abilities on the battlefield and until-end-of-turn effects. */
(function (root) {
  "use strict";
  const MK = root.MK = root.MK || {};
  MK.ENGINE_VERSION = 6;   // 3: the bots' attack target is scored once per opponent (no dice inside a sort)
                           // 4: the bots gang-block, chump only where it saves life, pick lands for the colors their hand needs, and counter combo pieces
                           //    and judge the table's threats per attacker; deck brains steer the bots of your decks
                           // 5: priority windows in upkeep, draw, beginning of combat, each combat damage step and end of combat; the end
                           //    of combat step happens with no attackers too; a person divides combat damage among two or more blockers
                           //    (games recorded before 5 replay without these: legacySteps)
                           //    and the Etrata bots expect double blocks and run their own block plan (legacyEtrata)
                           // 6: the bots gang up on a runaway leader: removal and counterspells aim at the most dangerous player, a runaway
                           //    is called sooner and the whole team swings at it, and a weak seat isn't finished off while the leader runs away

  MK.SIMPLIFICATIONS = [
    "Mana is paid for you from your untapped lands and mana sources, so you never tap lands by hand.",
    "Spells, activated abilities and triggered abilities all use the stack, and the other players can respond to each one. Mana abilities and special actions (turning a card face up, unlocking a door) don't use it.",
    "You get a chance to respond when an opponent casts a spell or puts an ability on the stack, after attackers are declared, after blockers are declared, and at the end of each opponent's turn. The bots get the same windows. Every player also gets priority in upkeep, draw, beginning of combat, each combat damage step and end of combat; the game stops there for you only with \"Stop in upkeep, draw and every combat step\" on. There's no priority in the main phases of an opponent's turn except in response to something.",
    "Triggered abilities that happen at the same time go on the stack in a sensible fixed order (the active player's first, so they resolve last) instead of the order you pick. Their targets are chosen as they resolve.",
    "Targets for your own triggered abilities (Heliod, Lathiel, Cleric Class) are picked for you unless you switch on \"Ask me for trigger targets\".",
    "With two or more blockers, you divide your attacker's combat damage among them (with trample, each blocker needs lethal damage before the rest goes past). The bots use lethal damage to each blocker in turn, the easiest first.",
    "A commander that would go to the graveyard, exile or a library goes to the command zone. One that would go to your hand stays there, so you can recast it without commander tax.",
    "Bots never look at your hand or library. They follow simple rules of thumb, not a search of every line.",
    "Face-down creatures (cloak, manifest, morph) are hidden from your opponents. Turning one face up is a special action: no stack, any time you could cast an instant.",
    "Extra turns, skipped turns, additional combat phases (right after the regular combat) and regeneration work. A few rules none of these decks need aren't in the game: split second and the initiative's dungeon. Where a card is simplified, its details say how, under \"In this game\".",
    "Protection from a color (Giver of Runes) means the creature can't be targeted, dealt damage or blocked by anything of that color. \"Protection from everything\" on a player (Teferi's Protection, The One Ring) stops targeting and damage.",
    "Mana you make with an ability that untaps its source (Devoted Druid) stays in your pool until the step ends. Other mana is spent as you pay, so it never floats.",
    "There is no undo, and there are no timers."
  ];


  /* ============================================================ helpers */
  const COLORS = ["W", "U", "B", "R", "G"];
  MK.COLORS = COLORS;
  MK.COLOR_NAME = { W: "white", U: "blue", B: "black", R: "red", G: "green", C: "colorless" };
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  MK.rng = mulberry32;

  function parseCost(str) {
    const c = { g: 0, W: 0, U: 0, B: 0, R: 0, G: 0, C: 0, hyb: [], phy: [], x: 0 };
    if (!str) return c;
    const re = /\{([^}]+)\}/g; let m;
    while ((m = re.exec(str))) {
      const s = m[1].toUpperCase();
      if (/^\d+$/.test(s)) c.g += +s;
      else if (s === "X") c.x++;
      else if (COLORS.includes(s) || s === "C") c[s]++;
      else if (/^[WUBRG]\/P$/.test(s)) c.phy.push(s[0]);
      else if (/^[WUBRG]\/[WUBRG]$/.test(s)) c.hyb.push([s[0], s[2]]);
    }
    return c;
  }
  MK.parseCost = parseCost;
  const costMV = c => c.g + COLORS.reduce((s, k) => s + c[k], 0) + c.C + c.hyb.length + c.phy.length;
  const costColors = c => COLORS.filter(k => c[k] > 0 || c.hyb.some(h => h.includes(k)) || c.phy.includes(k));
  function cloneCost(c) { return { g: c.g, W: c.W, U: c.U, B: c.B, R: c.R, G: c.G, C: c.C, hyb: c.hyb.map(h => h.slice()), phy: c.phy.slice(), x: c.x }; }
  function addCost(a, b) { const c = cloneCost(a); c.g += b.g; for (const k of COLORS) c[k] += b[k]; c.C += b.C; c.hyb.push(...b.hyb); c.phy.push(...b.phy); return c; }
  function costString(c, x) {
    let s = "";
    const gen = c.g + (x ? c.x * x : 0);
    if (c.x && x == null) s += "{X}".repeat(c.x);
    if (gen || (!s && !COLORS.some(k => c[k]) && !c.C && !c.hyb.length && !c.phy.length)) s += `{${gen}}`;
    for (const h of c.hyb) s += `{${h[0]}/${h[1]}}`;
    for (const k of ["C", "W", "U", "B", "R", "G"]) s += `{${k}}`.repeat(c[k]);
    for (const k of c.phy) s += `{${k}/P}`;
    return s;
  }
  MK.costString = costString;

  const SUPER = ["Legendary", "Basic", "Snow", "World"];
  const TYPES = ["Artifact", "Creature", "Enchantment", "Instant", "Land", "Planeswalker", "Sorcery", "Battle", "Kindred"];
  function parseType(line) {
    const parts = String(line || "").split(/\s+[—-]\s+/);
    const words = parts[0].split(/\s+/).filter(Boolean);
    return {
      supertypes: words.filter(w => SUPER.includes(w)),
      types: words.filter(w => TYPES.includes(w)),
      subtypes: parts[1] ? parts[1].split(/\s+/).filter(Boolean) : []
    };
  }

  /* ============================================================ card definitions */
  MK.defs = new Map();
  function normalize(d, isToken) {
    const def = Object.assign({ keywords: [], triggers: [], abilities: [], mana: [], statics: [], ai: {} }, d);
    def.costObj = parseCost(def.cost || "");
    def.mv = def.mvOverride != null ? def.mvOverride : costMV(def.costObj);
    if (!def.types) {
      const t = parseType(def.type || "");
      def.supertypes = def.supertypes || t.supertypes; def.types = t.types; def.subtypes = def.subtypes || t.subtypes;
    }
    def.supertypes = def.supertypes || [];
    def.subtypes = def.subtypes || [];
    if (!def.type) def.type = [...def.supertypes, ...def.types].join(" ") + (def.subtypes.length ? " — " + def.subtypes.join(" ") : "");
    if (typeof def.colors === "string") def.colors = def.colors.split("").filter(k => COLORS.includes(k));
    if (!def.colors) def.colors = costColors(def.costObj);
    if (typeof def.pt === "string") {
      const [p, t] = def.pt.split("/");
      def.pt = [isNaN(+p) ? 0 : +p, isNaN(+t) ? 0 : +t];
    }
    def.keywords = def.keywords.map(k => k.toLowerCase());
    def.legendary = def.supertypes.includes("Legendary");
    def.token = !!isToken || !!def.token;
    if (def.types.includes("Planeswalker") && def.loyalty == null) def.loyalty = 3;
    return def;
  }
  MK.define = function (d) { const def = normalize(d, false); MK.defs.set(def.name, def); return def; };
  /* Bot deck files share staples: the first definition of a name wins. */
  MK.defineOnce = function (d) { return MK.defs.has(d.name) ? MK.defs.get(d.name) : MK.define(d); };
  MK.get = function (name) {
    const d = MK.defs.get(name);
    if (!d) throw new Error("Unknown card: " + name);
    return d;
  };
  const tokenCache = new Map();
  let tokenSeq = 0;
  MK.tokenDef = function (spec) {
    if (spec && spec.__token) return spec;
    const key = spec.key || JSON.stringify(spec, (k, v) => (typeof v === "function" ? String(v) : v));
    if (tokenCache.has(key)) return tokenCache.get(key);
    const def = normalize(Object.assign({ types: spec.types || ["Creature"], cost: "" }, spec), true);
    def.__token = ++tokenSeq;
    tokenCache.set(key, def);
    return def;
  };
  /* A token copy of a card, "except" some characteristics (eternalize, Lazotep Quarry, Esika's copies). */
  MK.derive = function (def, over) {
    const d = Object.create(def);
    Object.assign(d, over || {});
    if (over && over.pt) d.pt = over.pt.slice();
    if (over && over.cost != null) { d.costObj = parseCost(over.cost); d.mv = costMV(d.costObj); }
    return d;
  };

  /* Common tokens. */
  const T = MK.T = {};
  T.treasure = MK.tokenDef({ key: "treasure", name: "Treasure", types: ["Artifact"], subtypes: ["Treasure"], colors: [], mana: [{ tap: true, sacSelf: true, produce: "any5", last: true }] });
  T.soldier = MK.tokenDef({ key: "soldier-w", name: "Soldier", pt: [1, 1], colors: "W", subtypes: ["Soldier"] });
  T.human = MK.tokenDef({ key: "human-w", name: "Human", pt: [1, 1], colors: "W", subtypes: ["Human"] });
  T.citizen = MK.tokenDef({ key: "citizen-gw", name: "Citizen", pt: [1, 1], colors: "GW", subtypes: ["Citizen"] });
  T.cat = MK.tokenDef({ key: "cat-g", name: "Cat", pt: [2, 2], colors: "G", subtypes: ["Cat"] });
  T.beast = MK.tokenDef({ key: "beast-g3", name: "Beast", pt: [3, 3], colors: "G", subtypes: ["Beast"] });
  T.elephant = MK.tokenDef({ key: "elephant-g3", name: "Elephant", pt: [3, 3], colors: "G", subtypes: ["Elephant"] });
  T.angel = MK.tokenDef({ key: "angel-w4", name: "Angel", pt: [4, 4], colors: "W", subtypes: ["Angel"], keywords: ["flying"] });
  T.angelV = MK.tokenDef({ key: "angel-w4v", name: "Angel", pt: [4, 4], colors: "W", subtypes: ["Angel"], keywords: ["flying", "vigilance"] });
  T.vampireLL = MK.tokenDef({ key: "vampire-w-ll", name: "Vampire", pt: [1, 1], colors: "W", subtypes: ["Vampire"], keywords: ["lifelink"] });
  T.goblin = MK.tokenDef({ key: "goblin-r", name: "Goblin", pt: [1, 1], colors: "R", subtypes: ["Goblin"] });
  T.zombie = MK.tokenDef({ key: "zombie-b2", name: "Zombie", pt: [2, 2], colors: "B", subtypes: ["Zombie"] });

  /* Ward {n}: whenever this becomes the target of a spell or ability an opponent controls, counter
     it unless that player pays {n}. */
  MK.wardTrigger = n => ({
    on: "becameTarget", self: true, when: (g, s, ev) => ev.p !== s.controller && !!ev.item,
    do: async (g, s, ev) => {
      const q = ev.p, item = ev.item;
      if (!g.stack.includes(item) || q.lost) return;
      const cost = parseCost(`{${n}}`);
      let paid = false;
      if (g.canPay(q, cost)) {
        const ok = await g.ask(q, { type: "confirm", prompt: `Ward {${n}}: pay {${n}}, or ${item.name} is countered`, src: s, purpose: "wardPay" });
        if (ok) paid = g.pay(q, cost);
      }
      if (paid) g.log(`${q.name} pays {${n}} for ward.`, { p: q, cards: [s.def.name] });
      else { g.log(`${q.name} doesn't pay for ward.`, { p: q, cards: [s.def.name] }); g.counterSpell(item, s); }
    }
  });

  /* ============================================================ face-down permanents
     Cloak, manifest, manifest dread and morph put a card onto the battlefield face down: a nameless,
     colorless 2/2 creature with no creature types (a cloaked one also has ward {2}). The object keeps
     its card in `o.cardDef`; `o.def` is the face-down definition until the card is turned face up or
     leaves the battlefield. The bots only ever read `o.def`, so they never learn what it is. */
  const FACE_KIND = { cloak: "Cloaked", manifest: "Manifested", dread: "Manifested", morph: "Morph" };
  MK.FACE_DOWN_NAME = "Face-down creature";
  MK.faceDownDef = function (card, kind) {
    const abilities = [];
    const creature = card.types.includes("Creature");
    const upAi = card.faceUpAi || { use: (g, p, o, ctx) => AIfaceUp(g, p, o, ctx) };
    // turning a face-down permanent face up is a special action: no stack, any time you have priority
    if (creature && card.cost) abilities.push({ label: "Turn face up", cost: card.cost, special: true, faceUp: true, do: (g, src) => g.turnFaceUp(src), ai: upAi });
    if (card.morph) abilities.push({ label: "Turn face up (morph)", cost: card.morph, special: true, faceUp: true, do: (g, src) => g.turnFaceUp(src), ai: upAi });
    const def = normalize({
      name: MK.FACE_DOWN_NAME, types: ["Creature"], subtypes: [], pt: [2, 2], colors: [], faceDownOf: card, faceKind: kind,
      keywords: kind === "cloak" ? ["ward"] : [],
      text: `${FACE_KIND[kind] || "Face-down"} 2/2 with no name, color or creature type.${kind === "cloak" ? "\nWard {2}" : ""}`,
      triggers: kind === "cloak" ? [MK.wardTrigger(2)] : [],
      abilities
    });
    return def;
  };
  /* Default bot rule for turning its own face-down creature up: in a main phase, when the card is a
     real improvement on a 2/2 and the mana is spare. */
  function AIfaceUp(g, p, o, ctx) {
    if (!(ctx.window === "main1" || ctx.window === "main2")) return false;
    const d = o.cardDef;
    if (!d.types.includes("Creature")) return false;
    const pt = d.pt || [0, 0];
    return pt[0] + pt[1] >= 5 || d.statics.length > 0 || d.triggers.some(t => t.on === "turnedFaceUp");
  }

  /* ============================================================ the game */
  let objSeq = 0;
  // practice.js rewinds the counter after a person's decision so a recorded game's ids match its replay
  MK.objSeq = { get: () => objSeq, set: v => { objSeq = v; } };
  class Game {
    constructor(opts) {
      this.opts = opts || {};
      this.seed = this.opts.seed != null ? this.opts.seed : Math.floor(Math.random() * 2 ** 31);
      this.random = mulberry32(this.seed);
      this.ui = this.opts.ui || null;
      this.v = 0;                     // state version, for caches and the screen
      this.turn = 0;                  // counts every player's turn
      this.round = 0;
      this.activeIdx = 0;
      this.phase = "setup";
      this.battlefield = [];
      this.stack = [];
      this.effects = [];              // until-end-of-turn and until-end-of-combat effects
      this.delayed = [];              // "at the beginning of the next end step" and friends
      this.pending = [];              // triggered abilities waiting to resolve (a stack)
      this.logs = [];
      this.over = false;
      this.winner = null;
      this.combat = null;
      this.ts = 0;
      this.startingLife = this.opts.life || 40;
      this.maxTurns = this.opts.maxTurns || 60;
      this.guard = 0;
      this.stats = { spells: 0, triggers: 0 };
      this.tempTriggers = [];         // triggers that last until end of turn (Duskmantle Guildmage)
      this.phased = [];               // phased-out permanents (March of Swirling Mist)
      this.castBans = [];             // "can't cast spells this turn" (Silence, Orim's Chant, Ranger-Captain of Eos)
      this.itemSeq = 0;               // ids of abilities on the stack
      this.extraTurns = [];           // extra turns to take after this one (the newest first)
      this.extraCombats = [];         // additional combat phases this turn
      // object ids are global; ids relative to idBase are the same each time a game is replayed
      // from the same seed and the same choices (the practice recorder relies on it)
      this.idBase = objSeq;
      this.players = (this.opts.players || []).map((cfg, i) => this.makePlayer(cfg, i));
    }

    /* ------------------------------------------------ setup */
    makePlayer(cfg, i) {
      const p = {
        idx: i, id: "p" + i, name: cfg.name || "Player " + (i + 1), agent: cfg.agent, human: !!cfg.human,
        deck: cfg.deck || null, life: this.startingLife, poison: 0, cmdDmg: {},
        library: [], hand: [], graveyard: [], exile: [], command: [], emblems: [],
        pool: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 }, landsPlayed: 0, gained: 0, lifeLostThisTurn: 0,
        spellsCast: 0, lost: false, lostReason: "", identity: [], commanders: [], cmdCasts: {},
        mulls: 0, turnsTaken: 0, dealt: 0, energy: 0, attackedBy: [], stats: { cast: {}, dmg: 0, gained: 0, tokens: 0, kills: 0 }
      };
      const cmdNames = [].concat(cfg.commander || []);
      for (const n of cmdNames) {
        const o = this.newObj(MK.get(n), p, "command");
        o.isCommander = true;
        p.command.push(o); p.commanders.push(o);
        for (const k of o.def.identity || o.def.colors) if (!p.identity.includes(k)) p.identity.push(k);
      }
      if (cfg.identity) p.identity = cfg.identity.slice();
      for (const n of cfg.list || []) {
        const o = this.newObj(MK.get(n), p, "library");
        p.library.push(o);
      }
      return p;
    }
    newObj(def, owner, zone) {
      return {
        id: ++objSeq, def, owner, controller: owner, zone, isToken: !!def.token, tapped: false, sick: false,
        counters: {}, damage: 0, dtDamage: false, attachedTo: null, state: {}, ts: ++this.ts, zc: 0,
        isCommander: false, combat: null, x: 0, playable: null, cardDef: def
      };
    }
    bump() { this.v++; }

    /* ------------------------------------------------ queries */
    get active() { return this.players[this.activeIdx]; }
    living() { return this.players.filter(p => !p.lost); }
    opponents(p) { return this.players.filter(q => q !== p && !q.lost); }
    isOpp(p, q) { return p !== q; }
    controlled(p, f) { return this.battlefield.filter(o => o.controller === p && (!f || f(o))); }
    creatures(p) { return this.battlefield.filter(o => (!p || o.controller === p) && this.isCreature(o)); }
    /* Who takes the turn after p's: an extra turn waiting comes first, then the next seat. */
    nextPlayer(p) {
      if (p === this.active && this.extraTurns && this.extraTurns.length) {
        for (let i = this.extraTurns.length - 1; i >= 0; i--) if (!this.extraTurns[i].p.lost) return this.extraTurns[i].p;
      }
      return this.seatAfter(p);
    }
    /* The next living player in seat order. */
    seatAfter(p) {
      for (let k = 1; k <= this.players.length; k++) {
        const q = this.players[(p.idx + k) % this.players.length];
        if (!q.lost) return q;
      }
      return p;
    }
    /* turn order starting with the player after p (APNAP-ish helper) */
    orderFrom(p) {
      const out = [];
      for (let k = 0; k < this.players.length; k++) { const q = this.players[(p.idx + k) % this.players.length]; if (!q.lost) out.push(q); }
      return out;
    }
    find(id) { return this.battlefield.find(o => o.id === id) || null; }
    /* Any object of this game by id, in any zone or on the stack (for replays). */
    findAny(id) {
      const hit = o => o && o.id === id;
      let o = this.battlefield.find(hit) || (this.phased || []).find(hit);
      if (o) return o;
      for (const p of this.players) for (const z of ["hand", "library", "graveyard", "exile", "command"]) { o = p[z].find(hit); if (o) return o; }
      for (const it of this.stack) if (hit(it.o)) return it.o;
      return null;
    }
    rand(n) { return Math.floor(this.random() * n); }
    shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = this.rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

    /* ------------------------------------------------ characteristics */
    /* permanents with static abilities, cached per state version (every change to the battlefield bumps it) */
    staticSources() {
      if (this._ssv === this.v && this._ss) return this._ss;
      const out = [];
      for (const o of this.battlefield) if (o.def.statics.length || o.def.levels || this.roomStatics(o).length) out.push(o);
      this._ss = out; this._ssv = this.v;
      this._grantsMana = out.some(o => o.def.statics.some(st => st.grantMana));
      return out;
    }
    roomStatics(o) {
      const d = o.def;
      if (!d.doors) return [];
      const doors = o.state.doors || [];
      const out = [];
      d.doors.forEach((door, i) => { if (doors[i] && door.statics) out.push(...door.statics); });
      return out;
    }
    staticsOf(o) {
      if (!o.def.doors && !o.def.levels) return o.def.statics;
      const out = o.def.statics.slice();
      if (o.def.doors) out.push(...this.roomStatics(o));
      if (o.def.levels) { const lv = o.state.level || 1; o.def.levels.forEach((L, i) => { if (i < lv && L.statics) out.push(...L.statics); }); }
      return out;
    }
    typesOf(o) {
      if (o._tv === this.v && o._types) return o._types;
      const d = o.def;
      const types = new Set(d.types);
      if (o.zone === "battlefield") {
        if (o.state.crewed === this.turn) { types.add("Creature"); types.add("Artifact"); }
        if (o.state.animated && o.state.animated.turn === this.turn) types.add("Creature");
        if (o.state.earth) types.add("Creature"); // earthbend: a land that stays a creature
        if (d.notCreatureUnless && !d.notCreatureUnless(this, o)) types.delete("Creature");
      }
      o._types = types; o._tv = this.v;
      return types;
    }
    isCreature(o) { return this.typesOf(o).has("Creature"); }
    isLand(o) { return this.typesOf(o).has("Land"); }
    isArtifact(o) { return this.typesOf(o).has("Artifact"); }
    isEnchantment(o) { return this.typesOf(o).has("Enchantment"); }
    isPlaneswalker(o) { return this.typesOf(o).has("Planeswalker"); }
    isInstantOrSorcery(o) { const t = o.def.types; return t.includes("Instant") || t.includes("Sorcery"); }
    isPermanentCard(o) { return !this.isInstantOrSorcery(o); }
    isType(o, t) { return this.typesOf(o).has(t); }
    hasSub(o, s) {
      const c = this.ch(o);
      return c.allTypes ? this.isCreature(o) || o.def.types.includes("Kindred") : c.subtypes.has(s);
    }
    isBasic(o) { return o.def.supertypes.includes("Basic"); }
    mvOf(o) {
      if (o.def.doors && o.zone === "battlefield") {
        return o.def.doors.reduce((s, d, i) => s + ((o.state.doors || [])[i] ? costMV(parseCost(d.cost)) : 0), 0);
      }
      return o.def.mv;
    }
    colorsOf(o) { return this.ch(o).colors; }

    /* full characteristics, cached per state version */
    ch(o) {
      if (o._cv === this.v && o._ch) return o._ch;
      if (o._computing) return { p: 0, t: 0, kws: new Set(o.def.keywords), subtypes: new Set(o.def.subtypes), colors: new Set(o.def.colors), allTypes: false };
      o._computing = true;
      try {
        const d = o.def;
        const kws = new Set(d.keywords);
        const subtypes = new Set(d.subtypes);
        const colors = new Set(d.colors);
        let allTypes = !!d.changeling;
        let cantBlock = !!d.cantBlock, unblockable = false, cantAttack = false;
        let p = 0, t = 0;
        const creature = this.isCreature(o);
        if (d.pt) { p = d.pt[0]; t = d.pt[1]; }
        if (o.zone === "battlefield" && o.state.animated && o.state.animated.turn === this.turn) {
          const a = o.state.animated;
          p = a.pt[0]; t = a.pt[1];
          (a.subtypes || []).forEach(s => subtypes.add(s)); (a.colors || []).forEach(c => colors.add(c));
          (a.keywords || []).forEach(k => kws.add(k));
        }
        if (o.zone === "battlefield" && o.state.earth) { p = 0; t = 0; kws.add("haste"); }
        if (d.cda && o.zone === "battlefield") { const r = d.cda(this, o); if (r[0] != null) p = r[0]; if (r[1] != null) t = r[1]; }
        let prot = null; // protection from colors ("W"... or "C" for colorless), from Giver of Runes and friends
        let modP = 0, modT = 0;
        if (o.zone === "battlefield") {
          const effs = [];
          for (const s of this.staticSources()) {
            for (const st of this.staticsOf(s)) {
              if (!st.applies) continue;
              if (!st.applies(this, s, o)) continue;
              effs.push({ st, s });
            }
          }
          for (const pl of this.players) for (const em of pl.emblems) for (const st of em.statics || []) if (st.applies && st.applies(this, { controller: pl, emblem: true }, o)) effs.push({ st, s: { controller: pl } });
          // layer 7b: set base power and toughness (Mirror Entity), in timestamp order
          for (const e of this.effects) if (e.setPT && this.affects(e, o)) { p = e.setPT[0]; t = e.setPT[1]; if (e.allTypes) allTypes = true; }
          // counters
          const c = o.counters;
          p += (c.p1 || 0) - (c.m1 || 0); t += (c.p1 || 0) - (c.m1 || 0);
          // modifications from statics and effects
          for (const { st, s } of effs) {
            if (st.pt) { const v = typeof st.pt === "function" ? st.pt(this, s, o) : st.pt; if (v) { modP += v[0]; modT += v[1]; } }
            if (st.kw) { const v = typeof st.kw === "function" ? st.kw(this, s, o) : st.kw; if (v) v.forEach(k => kws.add(k)); }
            if (st.cantBlock) cantBlock = true;
            if (st.cantAttack) cantAttack = true;
            if (st.allTypes) allTypes = true;
            if (st.unblockable) unblockable = true;
            if (st.subtypes) { const v = typeof st.subtypes === "function" ? st.subtypes(this, s, o) : st.subtypes; if (v) v.forEach(x => subtypes.add(x)); }
          }
          for (const e of this.effects) {
            if (!this.affects(e, o)) continue;
            if (e.pt) { modP += e.pt[0]; modT += e.pt[1]; }
            if (e.kw) e.kw.forEach(k => kws.add(k));
            if (e.unblockable) unblockable = true;
            if (e.cantBlock) cantBlock = true;
            if (e.prot) { prot = prot || new Set(); e.prot.forEach(k => prot.add(k)); }
          }
          if (o.state.selfKw) o.state.selfKw.forEach(k => kws.add(k));
        }
        p += modP; t += modT;
        if (!creature && !d.pt && !(o.state.animated)) { p = 0; t = 0; }
        const res = { p, t, kws, subtypes, colors, allTypes, cantBlock, unblockable, cantAttack, prot };
        o._ch = res; o._cv = this.v;
        return res;
      } finally { o._computing = false; }
    }
    power(o) { return this.ch(o).p; }
    toughness(o) { return this.ch(o).t; }
    kw(o, k) { return this.ch(o).kws.has(k); }
    affects(e, o) {
      if (e.objs) return e.objs.has(o.id) && (!e.zc || e.zc[o.id] === o.zc);
      if (e.filter) return e.filter(this, o);
      return false;
    }
    playerHexproof(pl) {
      // protection from everything (Teferi's Protection, The One Ring) and Veil of Summer
      if (pl.shield || pl.hexTurn === this.turn) return true;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.playerHexproof && st.playerHexproof(this, s, pl)) return true;
      return false;
    }
    devotion(p, color) {
      let n = 0;
      for (const o of this.battlefield) {
        if (o.controller !== p) continue;
        const c = o.def.costObj;
        n += c[color] || 0;
        n += c.hyb.filter(h => h.includes(color)).length;
        n += c.phy.filter(k => k === color).length;
      }
      return n;
    }
    lethalDamageLeft(o) { return Math.max(0, this.toughness(o) - o.damage); }
    /* Protection from a color: o can't be targeted, damaged or blocked by src of that color. */
    protectedFrom(o, src) {
      if (!o || !src || !src.def || o.zone !== "battlefield") return false;
      const pr = this.ch(o).prot;
      if (!pr || !pr.size) return false;
      const cols = [...this.colorsOf(src)];
      return cols.length ? cols.some(k => pr.has(k)) : pr.has("C");
    }
    /* "Can't cast spells": statics with cantCast (Grand Abolisher, Drannith Magistrate, Deafening
       Silence) and this turn's bans (Silence, Orim's Chant). Returns why, or false. */
    castBlocked(p, o) {
      for (const b of this.castBans) if (b.turn === this.turn && b.test(this, p, o)) return b.label || "can't cast spells this turn";
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.cantCast && st.cantCast(this, s, p, o)) return s.def.name;
      return false;
    }
    banCasting(test, label) { this.castBans.push({ turn: this.turn, test, label }); this.bump(); }
    /* "Can't activate abilities" (Grand Abolisher, Linvala, Keeper of Silence): statics with cantActivate. */
    activateBlocked(p, o, ab) {
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.cantActivate && st.cantActivate(this, s, p, o, ab)) return true;
      return false;
    }
    uncounterable(item) {
      if (item.p && item.p.noCounterTurn === this.turn) return true; // Veil of Summer
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.uncounterable && st.uncounterable(this, s, item)) return true;
      return false;
    }
    /* The cards a search of p's library can find: all of it, or the top four under Aven Mindcensor.
       Card files with their own search code call this, so "whenever a player searches" triggers too. */
    librarySearch(p) {
      const lim = this.searchLimit(p);
      this.emit("searchLibrary", { p });
      if (lim < Infinity) this.log(`${p.name} searches only the top ${lim} cards.`, { p });
      return lim < Infinity ? p.library.slice(0, lim) : p.library;
    }
    searchLimit(p) {
      let n = Infinity;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.searchLimit) { const k = st.searchLimit(this, s, p); if (k != null) n = Math.min(n, k); }
      return n;
    }

    /* ------------------------------------------------ log and events */
    log(text, extra) {
      if (this.quiet && !(extra && (extra.kind === "lose" || extra.kind === "win" || extra.kind === "turn" || extra.loud))) return null;
      // n keeps counting after old entries are dropped, so it always orders the log
      this.logN = this.logN == null ? this.logs.length : this.logN;
      const e = Object.assign({ n: this.logN++, turn: this.turn, text }, extra || {});
      this.logs.push(e);
      if (this.logs.length > 600) this.logs.splice(0, this.logs.length - 600);
      if (this.ui && this.ui.log) this.ui.log(e);
      return e;
    }
    anim(kind, data) { if (this.ui && this.ui.anim) this.ui.anim(kind, data || {}); }
    async pace(kind, data) { if (this.ui && this.ui.pace) await this.ui.pace(kind, data || {}); }

    /* Queue every trigger that matches an event. Sources: the battlefield, the command zone
       and graveyards for abilities that work there, emblems, and (for leave events) the object
       that left, using what it looked like on the battlefield. */
    listening(type) {
      if (this._ltv !== this.ts) {
        const set = new Set();
        const add = d => { for (const t of d.triggers || []) set.add(t.on); if (d.levels) d.levels.forEach(L => (L.triggers || []).forEach(t => set.add(t.on))); };
        for (const o of this.battlefield) add(o.def);
        for (const p of this.players) { for (const o of p.graveyard) add(o.def); for (const o of p.command) add(o.def); for (const em of p.emblems) add(em); }
        for (const t of this.tempTriggers) add(t.def);
        this._lt = set; this._ltv = this.ts;
      }
      return this._lt.has(type);
    }
    emit(type, ev) {
      ev = ev || {};
      ev.type = type;
      this.bump();
      if (this.ui && this.ui.event) this.ui.event(type, ev);
      if (!this.listening(type) && !(ev.lki && ev.o) && !ev.batch) return;
      const found = [];
      const scan = (o, lki) => {
        for (const tr of o.def.triggers) {
          if (tr.on !== type) continue;
          if (tr.zone && tr.zone !== (lki ? "battlefield" : o.zone)) continue;
          if (!tr.zone && o.zone !== "battlefield" && !lki) continue;
          if (tr.self && ev.o !== o) continue;
          try { if (tr.when && !tr.when(this, o, ev)) continue; } catch (err) { this.warn(err, o); continue; }
          found.push({ src: o, tr, ev, controller: lki ? (lki.controller || o.controller) : o.controller });
        }
        if (o.def.levels && o.zone === "battlefield") {
          const lv = o.state.level || 1;
          o.def.levels.forEach((L, i) => {
            if (i >= lv) return;
            for (const tr of L.triggers || []) {
              if (tr.on !== type) continue;
              if (tr.when && !tr.when(this, o, ev)) continue;
              found.push({ src: o, tr, ev, controller: o.controller });
            }
          });
        }
      };
      for (const o of this.battlefield) scan(o);
      for (const p of this.players) {
        if (p.lost) continue;
        for (const o of p.command) if (o.def.triggers.some(t => t.zone === "command")) scan(o);
        for (const o of p.graveyard) if (o.def.triggers.some(t => t.zone === "graveyard")) scan(o);
        for (const em of p.emblems) for (const tr of em.triggers || []) if (tr.on === type && (!tr.when || tr.when(this, { controller: p, emblem: true }, ev))) found.push({ src: { controller: p, def: em, emblem: true }, tr, ev, controller: p });
      }
      // "this turn" triggers made by an ability (Duskmantle Guildmage)
      for (const t of this.tempTriggers) {
        if (t.controller.lost) continue;
        for (const tr of t.def.triggers) if (tr.on === type && (!tr.when || tr.when(this, t, ev))) found.push({ src: t, tr, ev, controller: t.controller });
      }
      // a face-down creature that leaves had no abilities, so its card's own leave triggers don't fire
      if (ev.lki && ev.o && ev.o.zone !== "battlefield" && !ev.lki.faceDown) scan(ev.o, ev.lki);
      if (ev.batch) for (const b of ev.batch) if (b.o !== ev.o && b.o.zone !== "battlefield" && !(b.lki && b.lki.faceDown)) scanBatch(this, b, type, ev, found);
      if (!found.length) return;
      // APNAP: the active player's triggers go on the stack first, so they resolve last.
      const order = this.orderFrom(this.active);
      found.sort((a, b) => order.indexOf(b.controller) - order.indexOf(a.controller));
      for (let i = found.length - 1; i >= 0; i--) this.pending.push(found[i]);
    }
    warn(err, o) {
      if (typeof console !== "undefined") console.error("[miku engine]", o && o.def ? o.def.name : "", err);
      this.errors = (this.errors || 0) + 1;
      if (this.opts.strict) throw err;
    }

    /* Triggered abilities use the stack. Waiting triggers are put on it (the active player's first,
       so they resolve last; "late" ones under the others), every other player gets a chance to
       respond to each one, and the stack resolves down to where it was. State-based actions are
       checked before anyone gets priority. */
    async settle() {
      await this.resolveDown(this.stack.length);
    }
    /* Triggered abilities that haven't resolved yet, the next one to resolve last: those on the
       stack (bottom to top), then those about to go on it, then the one resolving now. */
    waitingTriggers() {
      const out = [];
      for (const it of this.stack) if (it.kind === "trigger" && !it.countered) out.push(it.trig);
      out.push(...this.pending);
      if (this.resolving) out.push(this.resolving.trig);
      return out;
    }
    /* Put the waiting triggers on the stack, in the order that makes them resolve newest first. */
    pushPending() {
      const batch = this.pending.splice(0);
      const order = [];
      while (batch.length) {
        // "late" triggers (battle cry, "creatures you control get +X/+X") wait for the others
        let idx = batch.length - 1;
        if (batch[idx].tr.late) { for (let j = idx - 1; j >= 0; j--) if (!batch[j].tr.late) { idx = j; break; } }
        order.push(batch.splice(idx, 1)[0]);
      }
      for (let i = order.length - 1; i >= 0; i--) {
        const t = order[i];
        const name = t.src && t.src.def ? t.src.def.name : "Delayed trigger";
        this.stack.push({ kind: "trigger", o: t.src, p: t.controller, trig: t, targets: [], id: "t" + (++this.itemSeq), name: `${name} (trigger)` });
      }
      if (order.length) this.bump();
      return order.length;
    }
    /* Resolve the stack down to `base` items: SBAs, then waiting triggers go on the stack, then the
       players after the top item's controller may respond, then it resolves. */
    async resolveDown(base) {
      let n = 0, asked = 0;
      for (;;) {
        if (this.over) return;
        this.checkSBA();
        if (this.over) return;
        await this.legendRule();
        if (this.over) return;
        if (this.pending.length) {
          n += this.pushPending();
          if (n > 4000) {
            this.log("The loop was stopped after 4,000 triggers.");
            this.pending = [];
            while (this.stack.length > base && this.stack[this.stack.length - 1].kind === "trigger") this.stack.pop();
            this.bump();
          }
          continue;
        }
        if (this.stack.length <= base) return;
        const top = this.stack[this.stack.length - 1];
        // inside a repeated loop (Druid ×N) the table shortcuts: no windows for its abilities and triggers
        if (!(this.quiet && top.kind !== "spell") && asked < 80) {
          let acted = false;
          for (const q of this.orderFrom(top.p).slice(1)) {
            if (q.lost || this.over) continue;
            const act = await this.askRespond(q, { window: top.kind === "spell" ? "stack" : "ability", top });
            if (!act) continue;
            asked++;
            const ok = await this.perform(q, act);
            if (ok || !q.agent.bot) { acted = true; break; }
          }
          if (this.over) return;
          if (acted) continue; // look at the stack again
        }
        await this.resolveTop();
      }
    }
    async resolveTrigger(item) {
      const { src, tr, ev, controller } = item.trig;
      if (controller.lost) return;
      this.stats.triggers++;
      if (tr.intervening && !tr.intervening(this, src, ev)) return;
      // a trigger its controller may answer before it resolves (Etrata, the Silencer and March of Swirling Mist)
      if (tr.respond) {
        let k = 0;
        while (k++ < 4 && !this.over) {
          const act = await this.askRespond(controller, { window: "trigger", src, trigger: tr, ev, top: item });
          if (!act) break;
          await this.perform(controller, act);
        }
        if (this.over || controller.lost) return;
      }
      try {
        if (tr.optional) {
          const ok = await this.ask(controller, { type: "confirm", prompt: tr.optional === true ? `Use ${src.def.name}?` : tr.optional, src, purpose: tr.ai || "may", ev, trigger: tr });
          if (!ok) return;
        }
        this.resolving = item;
        await tr.do(this, src, ev, { p: controller, item });
      } catch (err) { this.warn(err, src); }
      finally { if (this.resolving === item) this.resolving = null; }
    }
    /* Legend rule: a player with two or more legendary permanents of the same name keeps one of
       them (they choose; the bots keep the newest) and puts the rest into the graveyard. */
    async legendRule() {
      let groups = null;
      for (const o of this.battlefield) {
        if (!o.def.legendary) continue;
        const key = o.controller.id + "|" + o.def.name;
        groups = groups || new Map();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(o);
      }
      if (!groups) return;
      for (const list of groups.values()) {
        if (list.length < 2) continue;
        const p = list[0].controller;
        const newest = list.slice().sort((a, b) => b.ts - a.ts)[0];
        let keep = newest;
        if (!p.agent || !p.agent.bot) {
          const pick = await this.ask(p, { type: "target", prompt: `Legend rule: choose the ${list[0].def.name} to keep (the others go to the graveyard)`, options: list, purpose: "legendKeep", src: newest });
          if (pick && list.includes(pick)) keep = pick;
        }
        const out = list.filter(o => o !== keep && o.zone === "battlefield");
        if (out.length) { this.log(`Legend rule: ${p.name} keeps one ${list[0].def.name}.`, { p, cards: [list[0].def.name] }); this.toGraveyardFromBattlefield(out, "sba"); }
      }
    }

    /* ------------------------------------------------ choices */
    async ask(p, req) {
      req.player = p;
      if (p.script && p.script.length) {
        const a = p.script.shift();
        if (this.validAnswer(req, a)) { if (p.recording) p.recording.push(a); return a; }
        p.script = null;
      }
      let ans;
      if (req.type !== "confirm" && req.options && req.options.length === 0) ans = req.type === "target" || req.type === "player" ? null : [];
      else ans = await p.agent.choose(this, p, req);
      if (p.recording) p.recording.push(ans);
      return ans;
    }
    validAnswer(req, a) {
      if (req.type === "target" || req.type === "player") return a == null ? !!req.optional : req.options.includes(a);
      if (req.type === "cards" || req.type === "targets") return Array.isArray(a) && a.every(x => req.options.includes(x)) && a.length >= (req.min || 0) && a.length <= (req.max == null ? a.length : req.max);
      if (req.type === "number") return typeof a === "number" && a >= req.min && a <= req.max;
      if (req.type === "option") return req.options.some(o => o.id === a);
      if (req.type === "confirm") return typeof a === "boolean";
      return a != null;
    }
    async chooseTarget(p, spec, src) {
      const options = this.targetOptions(p, spec, src);
      if (!options.length) return null;
      return this.ask(p, { type: "target", prompt: spec.prompt || "Choose a target", options, optional: !!spec.optional, purpose: spec.purpose || "neutral", src, spec });
    }

    /* ------------------------------------------------ targeting */
    canTarget(p, o, src) {
      if (o.zone !== "battlefield") return true;
      if (this.kw(o, "shroud")) return false;
      if (o.controller !== p && this.kw(o, "hexproof")) return false;
      if (src && this.protectedFrom(o, src)) return false;
      return true;
    }
    kindMatch(o, kind) {
      switch (kind) {
        case "creature": return this.isCreature(o);
        case "permanent": return true;
        case "nonland": return !this.isLand(o);
        case "noncreature": return !this.isCreature(o);
        case "artifact": return this.isArtifact(o);
        case "enchantment": return this.isEnchantment(o);
        case "artifactOrEnchantment": return this.isArtifact(o) || this.isEnchantment(o);
        case "creatureOrEnchantment": return this.isCreature(o) || this.isEnchantment(o);
        case "creatureOrPlaneswalker": case "any": return this.isCreature(o) || this.isPlaneswalker(o);
        case "planeswalker": return this.isPlaneswalker(o);
        case "land": return this.isLand(o);
        case "token": return o.isToken;
        case "creatureToken": return o.isToken && this.isCreature(o);
        case "nonlandToken": return o.isToken && !this.isLand(o);
        default: return false;
      }
    }
    targetOptions(p, spec, src) {
      const kind = spec.kind || "creature";
      const out = [];
      if (kind === "spell") {
        // "target spell" means spells; `orAbility` lets a spec take abilities too (Willbender)
        for (const it of this.stack) if (it !== spec.self && (it.kind === "spell" || (spec.orAbility && it.kind === "ability")) && (!spec.filter || spec.filter(this, it, p, src))) out.push(it);
        return out;
      }
      if (kind === "card") return (spec.from ? spec.from(this, p, src) : []).filter(o => !spec.filter || spec.filter(this, o, p, src));
      if (kind !== "player" && kind !== "opponent") {
        for (const o of this.battlefield) {
          if (spec.other && o === src) continue;
          if (spec.you && o.controller !== p) continue;
          if (spec.opp && o.controller === p) continue;
          if (!this.kindMatch(o, kind)) continue;
          if (spec.filter && !spec.filter(this, o, p, src)) continue;
          if (!this.canTarget(p, o, src)) continue;
          out.push(o);
        }
      }
      if (kind === "any" || kind === "player" || kind === "opponent") {
        for (const pl of this.players) {
          if (pl.lost) continue;
          if ((kind === "opponent" || spec.opp) && pl === p) continue;
          if (spec.playerFilter && !spec.playerFilter(this, pl, p)) continue;
          if (pl !== p && this.playerHexproof(pl)) continue;
          out.push(pl);
        }
      }
      return out;
    }
    isPlayer(x) { return x && x.pool !== undefined && x.library !== undefined; }
    legalTarget(p, spec, t, src) {
      if (!t) return false;
      if (this.isPlayer(t)) return !t.lost && this.targetOptions(p, spec, src).includes(t);
      if (spec.kind === "spell") return this.stack.includes(t);
      if (spec.kind === "card") return this.targetOptions(p, spec, src).includes(t);
      return t.zone === "battlefield" && this.targetOptions(p, spec, src).includes(t);
    }

    /* ------------------------------------------------ zones */
    zoneArr(o, zone) {
      zone = zone || o.zone;
      if (zone === "battlefield") return this.battlefield;
      if (zone === "stack") return null;
      return o.owner[zone];
    }
    removeFromZone(o) {
      const arr = this.zoneArr(o);
      if (arr) { const i = arr.indexOf(o); if (i >= 0) arr.splice(i, 1); }
    }
    lki(o) {
      return { controller: o.controller, power: this.power(o), toughness: this.toughness(o), counters: Object.assign({}, o.counters), isToken: o.isToken, creature: this.isCreature(o), name: o.def.name, types: [...this.typesOf(o)], subtypes: [...this.ch(o).subtypes], attached: this.battlefield.filter(a => a.attachedTo === o), mv: this.mvOf(o), colors: [...this.colorsOf(o)], faceDown: !!o.faceDown };
    }
    /* Move an object between zones. Returns where it ended up. Leaving the battlefield resets it. */
    moveTo(o, zone, opts) {
      opts = opts || {};
      const from = o.zone;
      let to = zone;
      let info = null;
      if (from === "battlefield") info = this.lki(o);
      // an earthbent land comes back when it dies or is exiled (Badgermole Cub)
      const earthBack = from === "battlefield" && o.earthReturn && (zone === "graveyard" || zone === "exile") && !o.isToken;
      o.earthReturn = false;
      // a commander that would go to the graveyard, exile or a library goes to the command zone
      // instead (always the better choice); one that would go to its owner's hand stays there,
      // since casting it from the hand costs no commander tax
      if (o.isCommander && ["graveyard", "exile", "library"].includes(to) && !opts.noCommandZone) to = to === "graveyard" && opts.dies ? "graveyard" : "command";
      this.removeFromZone(o);
      if (from === "battlefield") {
        for (const a of this.battlefield) if (a.attachedTo === o) a.attachedTo = null;
        o.attachedTo = null;
        if (this.combat) this.removeFromCombat(o);
      }
      o.zone = to; o.zc++;
      o.tapped = false; o.sick = false; o.counters = {}; o.damage = 0; o.dtDamage = false; o.state = {}; o.combat = null;
      o.controller = o.owner; o.playable = null;
      // a face-down card, a copy (Spark Double, Thespian's Stage) or a land face goes back to being its card
      if (o.cardDef && o.def !== o.cardDef && !o.isToken) { o.def = o.cardDef; this.ts++; }
      o.faceDown = null;
      if (from === "exile") o.hitCounter = false;
      if (o.isToken && to !== "battlefield") {
        o.gone = true; // tokens stop existing outside the battlefield
      } else if (to === "library") {
        if (opts.bottom) o.owner.library.push(o); else o.owner.library.unshift(o);
      } else if (to !== "stack") {
        const arr = this.zoneArr(o, to);
        arr.push(o);
      }
      o.ts = ++this.ts;
      this.bump();
      this.anim("move", { o, from, to, info });
      if (earthBack) {
        const zc = o.zc, there = to;
        this.pending.push({ src: o, controller: o.owner, ev: {}, tr: { do: async g => {
          if (o.zone !== there || o.zc !== zc) return;
          g.putOntoBattlefield([o], o.owner, { tapped: true });
          g.log(`${o.def.name} returns to the battlefield tapped.`, { p: o.owner, cards: [o.def.name] });
        } } });
      }
      if (to === "graveyard" && !o.isToken) this.emit("putInGraveyard", { o, p: o.owner, from });
      return { to, info, from };
    }

    /* ------------------------------------------------ entering the battlefield */
    enterBattlefield(o, controller, opts) {
      opts = opts || {};
      if (o.zone !== "battlefield") {
        if (o.zone !== "stack" && o.zone !== "new") this.removeFromZone(o);
        o.zone = "battlefield"; o.zc++;
        this.battlefield.push(o);
      }
      o.controller = controller || o.owner;
      o.sick = true; o.damage = 0; o.state = {}; o.counters = {}; o.combat = null; o.gone = false;
      o.ts = ++this.ts;
      const d = o.def;
      let tapped = !!opts.tapped;
      if (d.etbTapped === true) tapped = true;
      else if (typeof d.etbTapped === "function" && d.etbTapped(this, o)) tapped = true;
      // "creatures your opponents control enter tapped" (Thalia, Heretic Cathar; Blind Obedience)
      if (!tapped) for (const s of this.staticSources()) { if (s === o || tapped) continue; for (const st of this.staticsOf(s)) if (st.entersTapped && st.entersTapped(this, s, o)) { tapped = true; break; } }
      o.tapped = tapped;
      if (d.types.includes("Planeswalker")) o.counters.loyalty = d.loyalty;
      if (d.doors) o.state.doors = d.doors.map((_, i) => i === (opts.door || 0));
      if (d.levels) o.state.level = 1;
      if (d.saga) o.counters.lore = 1;
      // "as this enters, choose a creature type" and other choices kept on the permanent
      if (d.etbState) { try { Object.assign(o.state, d.etbState(this, o, opts) || {}); } catch (e) { this.warn(e, o); } }
      if (d.etbCounters) { const add = d.etbCounters(this, o, opts); for (const k in add) if (add[k] > 0) o.counters[k] = (o.counters[k] || 0) + add[k]; }
      if (opts.counters) for (const k in opts.counters) o.counters[k] = (o.counters[k] || 0) + opts.counters[k];
      o.x = opts.x || 0;
      this.bump();
      this.anim("enter", { o, token: o.isToken });
      if (opts.attacking && this.combat) {
        o.tapped = true;
        o.combat = { attacking: opts.attacking, blockedBy: [], wasBlocked: false };
        this.combat.attackers.push(o);
      }
      return o;
    }
    /* Put several objects onto the battlefield at once, then fire one enters event each. */
    enterMany(list) {
      for (const it of list) this.enterBattlefield(it.o, it.controller, it.opts);
      for (const it of list) this.emit("enters", { o: it.o, p: it.o.controller, token: it.o.isToken, batch: list.length > 1 ? list : null });
      for (const it of list) if (it.o.def.saga && it.o.zone === "battlefield") this.sagaChapter(it.o);
      return list.map(it => it.o);
    }
    /* A Saga's chapter ability for its current lore count. After the last one it's sacrificed. */
    sagaChapter(o) {
      const n = o.counters.lore || 0, chapters = o.def.saga;
      const ch = chapters[n - 1];
      this.pending.push({ src: o, controller: o.controller, ev: {}, tr: { do: async (g, src, ev, ctx) => {
        if (ch) { g.log(`${src.def.name}: chapter ${["I", "II", "III", "IV", "V"][n - 1] || n}.`, { p: ctx.p, cards: [src.def.name] }); await ch(g, src, ctx.p); }
        if ((src.counters.lore || 0) >= chapters.length && src.zone === "battlefield") g.sacrifice(src);
      } } });
    }
    createToken(p, spec, opts) {
      opts = opts || {};
      const def = spec.__token ? spec : MK.tokenDef(spec);
      const n = opts.count == null ? 1 : opts.count;
      if (n <= 0) return [];
      const list = [];
      for (let i = 0; i < n; i++) {
        const o = this.newObj(def, p, "new");
        o.isToken = true;
        if (opts.copyOf) o.copyOf = opts.copyOf;
        list.push({ o, controller: p, opts: { tapped: opts.tapped, attacking: opts.attacking, counters: opts.counters } });
      }
      p.stats.tokens += n;
      const made = this.enterMany(list);
      if (opts.exileEoc) for (const o of made) o.state.exileEoc = true;
      if (opts.sacEnd) for (const o of made) this.delayed.push({ at: "endStep", once: true, do: g => { if (o.zone === "battlefield") g.sacrifice(o); } });
      this.log(`${p.name} creates ${n > 1 ? n + " " : /^[AEIOU]/i.test(def.name) ? "an " : "a "}${def.name}${def.pt && def.types.includes("Creature") ? " " + def.pt.join("/") : ""} token${n > 1 ? "s" : ""}.`, { p, cards: [def.name], kind: "token" });
      return made;
    }
    /* Token copy of an object's copiable values (not counters, damage or tapped state). */
    copyToken(p, source, opts) {
      opts = opts || {};
      const base = source.copyDef || source.def;
      const def = opts.except ? MK.derive(base, opts.except) : base;
      const n = opts.count == null ? 1 : opts.count;
      const list = [];
      for (let i = 0; i < n; i++) {
        const o = this.newObj(def, p, "new");
        o.isToken = true; o.copyDef = def;
        list.push({ o, controller: p, opts: { tapped: opts.tapped, attacking: opts.attacking } });
      }
      p.stats.tokens += n;
      const made = this.enterMany(list);
      if (opts.exileEoc) for (const o of made) o.state.exileEoc = true;
      if (opts.sacEnd) for (const o of made) this.delayed.push({ at: "endStep", once: true, do: g => { if (o.zone === "battlefield") g.sacrifice(o); } });
      if (opts.haste) for (const o of made) o.state.selfKw = (o.state.selfKw || []).concat("haste");
      this.log(`${p.name} creates ${n > 1 ? n + " token copies" : "a token copy"} of ${base.name}.`, { p, cards: [base.name], kind: "token" });
      return made;
    }
    async populate(p, src) {
      const opts = this.battlefield.filter(o => o.controller === p && o.isToken && this.isCreature(o));
      if (!opts.length) { this.log(`${p.name} populates, but has no creature token to copy.`, { p }); return null; }
      const pick = await this.ask(p, { type: "target", prompt: "Populate: choose a creature token to copy", options: opts, purpose: "populate", src, auto: true });
      if (!pick) return null;
      return this.copyToken(p, pick)[0];
    }

    /* ------------------------------------------------ leaving the battlefield */
    /* opts.noRegen: "it can't be regenerated" */
    destroy(o, src, opts) {
      if (o.zone !== "battlefield") return false;
      if (this.kw(o, "indestructible")) { this.log(`${o.def.name} is indestructible.`, { cards: [o.def.name] }); return false; }
      if (!(opts && opts.noRegen) && this.useRegen(o)) return false;
      this.toGraveyardFromBattlefield([o], "destroy");
      return true;
    }
    destroyAll(list, src, opts) {
      const hit = list.filter(o => o.zone === "battlefield" && !this.kw(o, "indestructible") && ((opts && opts.noRegen) || !this.useRegen(o)));
      this.toGraveyardFromBattlefield(hit, "destroy");
      return hit.length;
    }
    /* Regenerate: the next time o would be destroyed this turn, instead it's tapped, all damage is
       removed from it and it's removed from combat. */
    regenerate(o, src) {
      if (!o || o.zone !== "battlefield") return false;
      const r = o.state.regen;
      o.state.regen = { turn: this.turn, n: (r && r.turn === this.turn ? r.n : 0) + 1 };
      this.log(`${o.def.name} gets a regeneration shield.`, { p: o.controller, cards: [o.def.name] });
      this.bump();
      return true;
    }
    useRegen(o) {
      const r = o.state.regen;
      if (!r || r.turn !== this.turn || r.n <= 0) return false;
      r.n--;
      o.tapped = true; o.damage = 0; o.dtDamage = false;
      if (this.combat) this.removeFromCombat(o);
      this.log(`${o.def.name} regenerates.`, { p: o.controller, cards: [o.def.name], kind: "regen" });
      this.bump();
      return true;
    }
    sacrifice(o) {
      if (o.zone !== "battlefield") return false;
      this.emit("sacrifice", { o, p: o.controller });
      this.toGraveyardFromBattlefield([o], "sacrifice");
      return true;
    }
    /* Everything that dies at the same time sees everything else die (Blood Artist and friends). */
    toGraveyardFromBattlefield(list, why) {
      const batch = [];
      for (const o of list) {
        if (o.zone !== "battlefield") continue;
        const wasCreature = this.isCreature(o);
        // "if a creature an opponent controls would die, instead exile it with a hit counter"
        if (wasCreature && why !== "destroyed-noreplace") {
          const rep = this.staticSources().find(s => this.staticsOf(s).some(st => st.exileInsteadOfDying && st.exileInsteadOfDying(this, s, o)));
          if (rep) { this.exileWithHit(o, rep); continue; }
        }
        const info = this.lki(o);
        const owner = o.owner;
        const r = this.moveTo(o, "graveyard", { dies: wasCreature });
        batch.push({ o, lki: info, wasCreature, owner });
        if (wasCreature) this.diedThisTurn = (this.diedThisTurn || 0) + 1;
        if (why === "destroy" || why === "sba") this.log(`${o.def.name} ${wasCreature ? "dies" : "is destroyed"}.`, { cards: [o.def.name], kind: "die", p: info.controller });
        else if (why === "sacrifice") this.log(`${info.controller.name} sacrifices ${o.def.name}.`, { cards: [o.def.name], kind: "die", p: info.controller });
      }
      for (const b of batch) {
        if (b.wasCreature) this.emit("dies", { o: b.o, lki: b.lki, p: b.lki.controller, batch: batch.length > 1 ? batch : null });
        this.emit("leaves", { o: b.o, lki: b.lki, p: b.lki.controller, to: "graveyard", batch: batch.length > 1 ? batch : null });
      }
      // commanders: after "dies" triggers are queued, go home
      for (const b of batch) if (b.o.isCommander && b.o.zone === "graveyard") this.moveTo(b.o, "command");
      return batch;
    }
    exile(o, src) {
      if (o.zone === "battlefield") {
        const info = this.lki(o);
        this.moveTo(o, "exile");
        this.log(`${o.def.name} is exiled.`, { cards: [o.def.name], kind: "exile", p: info.controller });
        this.emit("leaves", { o, lki: info, p: info.controller, to: "exile" });
        return info;
      }
      this.moveTo(o, "exile");
      return null;
    }
    bounce(o) {
      if (o.zone !== "battlefield") return;
      const info = this.lki(o);
      this.moveTo(o, "hand");
      this.log(`${o.def.name} returns to ${o.owner.name}'s hand.`, { cards: [o.def.name], kind: "bounce" });
      this.emit("leaves", { o, lki: info, p: info.controller, to: "hand" });
    }
    tuck(o, bottom) {
      const info = o.zone === "battlefield" ? this.lki(o) : null;
      this.moveTo(o, "library", { bottom, noCommandZone: false });
      if (info) this.emit("leaves", { o, lki: info, p: info.controller, to: "library" });
    }
    /* Exile a permanent and put a hit counter on the exiled card (Etrata, the Silencer, Ravenloft
       Adventurer). Tokens stop existing, so only cards keep a hit counter. */
    exileWithHit(o, src) {
      if (o.zone !== "battlefield") return null;
      const owner = o.owner;
      const info = this.exile(o, src);
      if (o.zone === "exile" && !o.isToken) { o.hitCounter = true; this.log(`${o.def.name} gets a hit counter (${owner.name} has ${this.hitCount(owner)}).`, { p: owner, cards: [o.def.name], kind: "exile" }); }
      this.bump();
      return info;
    }
    hitCount(p) { return p.exile.filter(o => o.hitCounter).length; }

    /* Phasing (March of Swirling Mist): the permanent and anything attached to it are treated as
       though they don't exist until its controller's next untap step. No leave or enter events. */
    phaseOut(list) {
      const all = [];
      for (const o of [].concat(list)) {
        if (!o || o.zone !== "battlefield" || all.includes(o)) continue; // already in as an attachment
        all.push(o);
        for (const a of this.battlefield) if (a.attachedTo === o && !all.includes(a)) all.push(a);
      }
      for (const o of all) {
        if (this.combat) this.removeFromCombat(o);
        this.removeFromZone(o);
        o.zone = "phased"; o.phasedBy = o.controller;
        this.phased.push(o);
        this.log(`${o.def.name} phases out.`, { p: o.controller, cards: [o.def.name], kind: "phase" });
      }
      this.bump();
      return all;
    }
    phaseIn(p) {
      const back = this.phased.filter(o => o.phasedBy === p);
      if (!back.length) return;
      this.phased = this.phased.filter(o => o.phasedBy !== p);
      for (const o of back) { o.zone = "battlefield"; o.phasedBy = null; this.battlefield.push(o); }
      this.log(`${back.map(o => o.def.name).join(", ")} phase${back.length > 1 ? "" : "s"} in.`, { p, cards: back.map(o => o.def.name), kind: "phase" });
      this.bump();
    }

    /* ------------------------------------------------ face down */
    /* Put cards (from a library, hand or anywhere) onto the battlefield face down under p's control.
       kind: "cloak" (ward {2}), "manifest", "dread" (manifest dread) or "morph". */
    putFaceDown(p, list, opts) {
      opts = opts || {};
      const kind = opts.kind || "manifest";
      const items = [];
      for (const o of [].concat(list).filter(Boolean)) {
        if (o.zone !== "new") this.removeFromZone(o);
        o.zone = "new";
        o.def = MK.faceDownDef(o.cardDef, kind);
        o.faceDown = { kind };
        items.push({ o, controller: p, opts: { tapped: !!opts.tapped } });
      }
      if (!items.length) return [];
      this.ts++;
      const verb = { cloak: "cloaks", manifest: "manifests", dread: "manifests", morph: "casts face down" }[kind] || "puts face down";
      if (opts.log !== false) this.log(`${p.name} ${verb} ${opts.what || (items.length > 1 ? items.length + " cards" : "a card")}.`, { p, kind: "faceDown" });
      return this.enterMany(items);
    }
    /* Look at the top two, one goes onto the battlefield face down, the other into the graveyard. */
    async manifestDread(p, src) {
      const top = p.library.slice(0, 2);
      if (!top.length) return null;
      let pick = top[0];
      if (top.length > 1) {
        const ans = await this.ask(p, { type: "cards", prompt: "Manifest dread: choose the card to put onto the battlefield face down (the other goes to your graveyard)", options: top, min: 1, max: 1, purpose: "dread", src });
        pick = (ans && ans[0] && top.includes(ans[0])) ? ans[0] : top[0];
      }
      const made = this.putFaceDown(p, [pick], { kind: "dread", what: "a card (manifest dread)" });
      for (const o of top) if (o !== pick && o.zone === "library") this.moveTo(o, "graveyard");
      return made[0] || null;
    }
    cloakTop(p, from, src) {
      const lib = (from || p).library;
      if (!lib.length) return null;
      return this.putFaceDown(p, [lib[0]], { kind: "cloak", what: from && from !== p ? `the top card of ${from.name}'s library` : "the top card of their library" })[0] || null;
    }
    canTurnFaceUp(o) { return !!o.faceDown && o.zone === "battlefield" && (o.cardDef.types.includes("Creature") || !!o.cardDef.morph); }
    turnFaceUp(o) {
      if (!o.faceDown || o.zone !== "battlefield") return false;
      const p = o.controller;
      o.def = o.cardDef; o.faceDown = null;
      this.ts++; this.bump();
      this.log(`${p.name} turns ${o.def.name} face up.`, { p, cards: [o.def.name], kind: "faceup" });
      this.anim("faceUp", { o });
      this.emit("turnedFaceUp", { o, p });
      return true;
    }

    /* ------------------------------------------------ small helpers for card files */
    async scry(p, n, src) {
      const top = p.library.slice(0, n);
      if (!top.length) return;
      const bottom = await this.ask(p, { type: "cards", prompt: `Scry ${top.length}: choose the cards to put on the bottom of your library`, options: top, min: 0, max: top.length, purpose: "scry", src });
      for (const o of (bottom || []).filter(x => top.includes(x))) { this.removeFromZone(o); p.library.push(o); }
      const k = (bottom || []).length;
      this.log(`${p.name} scries ${top.length}${k ? `, ${k} to the bottom` : ""}.`, { p, kind: "scry" });
      this.bump();
    }
    async surveil(p, n, src) {
      const top = p.library.slice(0, n);
      if (!top.length) return;
      const out = await this.ask(p, { type: "cards", prompt: `Surveil ${top.length}: choose the cards to put into your graveyard`, options: top, min: 0, max: top.length, purpose: "surveil", src });
      const list = (out || []).filter(x => top.includes(x));
      for (const o of list) this.moveTo(o, "graveyard");
      this.log(`${p.name} surveils ${top.length}${list.length ? `, ${list.map(o => o.def.name).join(" and ")} to the graveyard` : ""}.`, { p, kind: "scry", cards: list.map(o => o.def.name) });
    }
    addEnergy(p, n) { p.energy = (p.energy || 0) + n; this.bump(); this.log(`${p.name} gets ${n} energy (${p.energy}).`, { p, kind: "energy" }); }

    /* ------------------------------------------------ life, damage, counters */
    gainLife(p, n, src) {
      if (p.lost || n <= 0 || p.lifeLock) return 0;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.lifeGainPlus) n += st.lifeGainPlus(this, s, p) || 0;
      // "you gain twice that much life instead" (Boon Reflection)
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.lifeGainTimes && s.controller === p) n *= st.lifeGainTimes;
      if (this.cantGainLife && this.cantGainLife(p)) return 0;
      p.life += n; p.gained += n; p.stats.gained += n;
      this.log(`${p.name} gains ${n} life${src && src.def && !src.emblem ? " (" + src.def.name + ")" : ""}.`, { p, kind: "life", n });
      this.anim("life", { p, delta: n, src });
      this.emit("gainLife", { p, amount: n, src });
      return n;
    }
    loseLife(p, n, src) {
      if (p.lost || n <= 0 || p.lifeLock) return 0;
      p.life -= n; p.lifeLostThisTurn += n;
      this.log(`${p.name} loses ${n} life${src && src.def ? " (" + src.def.name + ")" : ""}.`, { p, kind: "life", n: -n });
      this.anim("life", { p, delta: -n, src });
      this.emit("loseLife", { p, amount: n, src });
      return n;
    }
    payLife(p, n) {
      if (p.life < n) return false;
      p.life -= n; p.lifeLostThisTurn += n;
      this.anim("life", { p, delta: -n });
      this.emit("loseLife", { p, amount: n, paid: true });
      return true;
    }
    /* Damage from src to a player or a permanent. Lifelink and infect handled here. */
    damage(src, target, n, opts) {
      opts = opts || {};
      if (n <= 0 || !target) return 0;
      const srcObj = src && src.def ? src : null;
      const infect = srcObj && srcObj.zone === "battlefield" && this.kw(srcObj, "infect");
      const lifelink = srcObj && (srcObj.zone === "battlefield" ? this.kw(srcObj, "lifelink") : !!(opts.kws && opts.kws.has("lifelink")));
      const ctrl = srcObj ? srcObj.controller : (src && src.controller) || null;
      if (this.isPlayer(target) && (target.shield || target.lifeLock)) { this.log(`Damage to ${target.name} is prevented.`, { p: target }); return 0; }
      if (!this.isPlayer(target) && srcObj && this.protectedFrom(target, srcObj)) { this.log(`${target.def.name} has protection: the damage is prevented.`, { cards: [target.def.name] }); return 0; }
      if (this.isPlayer(target)) {
        if (target.lost) return 0;
        if (infect) { target.poison += n; this.anim("poison", { p: target, n }); }
        else { target.life -= n; target.lifeLostThisTurn += n; this.anim("life", { p: target, delta: -n, src: srcObj, combat: opts.combat }); }
        if (opts.combat && srcObj && srcObj.isCommander) target.cmdDmg[srcObj.id] = (target.cmdDmg[srcObj.id] || 0) + n;
        // freerunning: combat damage to a player this turn with an Assassin or a commander
        if (opts.combat && srcObj && ctrl && (srcObj.isCommander || this.hasSub(srcObj, "Assassin"))) ctrl.freerun = this.turn;
        if (ctrl) { ctrl.dealt += n; ctrl.stats.dmg += n; }
        this.emit("damage", { src: srcObj, target, amount: n, combat: !!opts.combat, toPlayer: true });
        if (!infect) this.emit("loseLife", { p: target, amount: n, fromDamage: true });
        if (opts.combat) this.emit("combatDamagePlayer", { src: srcObj, p: target, amount: n });
      } else {
        if (target.zone !== "battlefield") return 0;
        if (this.isPlaneswalker(target) && !this.isCreature(target)) {
          target.counters.loyalty = Math.max(0, (target.counters.loyalty || 0) - n);
        } else if (infect) {
          target.counters.m1 = (target.counters.m1 || 0) + n;
        } else {
          target.damage += n;
          if (srcObj && this.kw(srcObj, "deathtouch")) target.dtDamage = true;
        }
        this.bump();
        this.anim("damage", { o: target, n, src: srcObj });
        this.emit("damage", { src: srcObj, target, amount: n, combat: !!opts.combat });
      }
      if (!opts.combat) this.log(`${srcObj ? srcObj.def.name : "Damage"}: ${n} damage to ${this.nameOf(target)}.`, { p: ctrl, kind: "damage", cards: srcObj ? [srcObj.def.name] : [] });
      if (lifelink && ctrl && !opts.deferLifelink) this.gainLife(ctrl, n, srcObj);
      return n;
    }
    addCounters(o, kind, n, src) {
      if (!o || n <= 0 || o.zone !== "battlefield") return 0;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.counterPlus) n += st.counterPlus(this, s, o, kind) || 0;
      if (n <= 0) return 0; // Vizier of Remedies: "that many minus one"
      o.counters[kind] = (o.counters[kind] || 0) + n;
      this.bump();
      this.anim("counter", { o, kind, n });
      this.emit("counters", { o, kind, n, src });
      return n;
    }
    removeCounters(o, kind, n) {
      const have = o.counters[kind] || 0;
      const k = Math.min(have, n);
      if (k <= 0) return 0;
      o.counters[kind] = have - k;
      this.bump();
      this.anim("counter", { o, kind, n: -k });
      return k;
    }
    counterEach(p, kind, n, src) { for (const o of this.creatures(p)) this.addCounters(o, kind, n, src); }
    tap(o) { if (o && !o.tapped) { o.tapped = true; this.bump(); this.anim("tap", { o }); } }
    untap(o) { if (o && o.tapped) { o.tapped = false; this.bump(); this.anim("untap", { o }); } }
    /* Until-end-of-turn effect on a fixed set of objects (rule 611.2c) or a live filter. */
    addEffect(e) {
      e.until = e.until || "eot";
      e.turn = this.turn;
      if (e.objs && !(e.objs instanceof Set)) {
        const list = e.objs;
        e.objs = new Set(list.map(o => o.id));
        e.zc = {}; for (const o of list) e.zc[o.id] = o.zc;
      }
      this.effects.push(e);
      this.bump();
      return e;
    }
    pump(objs, p, t, kw, extra) { return this.addEffect(Object.assign({ objs: [].concat(objs), pt: [p, t], kw: kw || null }, extra || {})); }
    grant(objs, kw, extra) { return this.addEffect(Object.assign({ objs: [].concat(objs), kw }, extra || {})); }

    /* ------------------------------------------------ drawing and searching */
    draw(p, n, src) {
      n = n == null ? 1 : n;
      let got = 0;
      for (let i = 0; i < n; i++) {
        if (!p.library.length) { p.drewFromEmpty = true; break; }
        const o = p.library.shift();
        o.zone = "hand"; o.zc++;
        p.hand.push(o);
        (p.drawnThisTurn = p.drawnThisTurn || []).push(o);
        got++;
        this.anim("draw", { p, o });
        this.emit("draw", { p, o });
      }
      if (got) this.bump();
      return got;
    }
    shuffle(p) { this.shuffleArr(p.library); this.bump(); }
    /* Exile the top n cards; p may play them this turn (Junk tokens and friends). */
    impulse(p, n) {
      const out = [];
      for (let i = 0; i < n && p.library.length; i++) {
        const o = p.library[0];
        this.moveTo(o, "exile");
        o.playable = { by: p, turn: this.turn };
        out.push(o);
        this.log(`${p.name} exiles ${o.def.name} and may play it this turn.`, { p, cards: [o.def.name], kind: "impulse" });
      }
      this.bump();
      return out;
    }
    /* Put cards from any zone onto the battlefield at once. */
    putOntoBattlefield(list, p, opts) {
      list = [].concat(list).filter(Boolean);
      const items = list.map(o => { if (o.zone !== "new") this.removeFromZone(o); o.zone = "new"; return { o, controller: p || o.owner, opts: opts || {} }; });
      return this.enterMany(items);
    }
    addEmblem(p, em) {
      p.emblems.push(em);
      this.ts++;
      this.bump();
      this.log(`${p.name} gets an emblem: ${em.text || em.name}.`, { p, kind: "emblem" });
    }
    /* Put n counters of a kind spread over targets chosen by p (Lathiel). */
    async distribute(p, total, options, src, prompt) {
      if (!options.length || total <= 0) return {};
      const ans = await this.ask(p, { type: "distribute", prompt: prompt || `Distribute ${total} +1/+1 counters`, total, options, purpose: "counters", src });
      const map = ans || {};
      let used = 0;
      for (const o of options) {
        const k = Math.max(0, Math.min(total - used, map[o.id] | 0));
        if (k > 0) { this.addCounters(o, "p1", k, src); used += k; }
      }
      return map;
    }
    discard(p, o) {
      if (o.zone !== "hand") return;
      this.moveTo(o, "graveyard");
      this.log(`${p.name} discards ${o.def.name}.`, { p, cards: [o.def.name], kind: "discard" });
      this.emit("discard", { p, o });
    }
    mill(p, n) { for (let i = 0; i < n && p.library.length; i++) this.moveTo(p.library[0], "graveyard"); }
    /* Search a zone (library by default) for cards matching filter. Returns the chosen cards,
       already moved. to: "hand" | "battlefield" | "top" | "graveyard". */
    async search(p, opts) {
      const from = opts.from || ["library"];
      let pool = [];
      // Aven Mindcensor: an opponent searches only the top four
      const lim = from.includes("library") ? this.searchLimit(p) : Infinity;
      for (const z of from) pool = pool.concat((z === "library" && lim < Infinity ? p.library.slice(0, lim) : p[z]).filter(o => !opts.filter || opts.filter(this, o)));
      if (from.includes("library")) this.emit("searchLibrary", { p }); // Archivist of Oghma
      if (lim < Infinity) this.log(`${p.name} searches only the top ${lim} cards.`, { p });
      const max = opts.count == null ? 1 : opts.count;
      let chosen = [];
      if (pool.length) {
        chosen = await this.ask(p, { type: "cards", prompt: opts.prompt || "Search your library", options: pool, min: opts.min || 0, max, purpose: opts.purpose || "tutor", to: opts.to, src: opts.src });
        chosen = (chosen || []).slice(0, max);
      }
      if (from.includes("library")) this.shuffle(p);
      const moved = [];
      if (opts.to === "battlefield") {
        const list = chosen.map(o => ({ o, controller: p, opts: { tapped: !!opts.tapped } }));
        for (const it of list) this.removeFromZone(it.o), it.o.zone = "new";
        this.enterMany(list);
        moved.push(...chosen);
      } else {
        for (const o of chosen) {
          if (opts.to === "top") { this.removeFromZone(o); o.zone = "library"; p.library.unshift(o); }
          else this.moveTo(o, opts.to || "hand");
          moved.push(o);
        }
      }
      if (chosen.length) this.log(`${p.name} searches and finds ${opts.hidden && opts.to !== "battlefield" ? chosen.length + " card" + (chosen.length > 1 ? "s" : "") : chosen.map(o => o.def.name).join(" and ")}.`, { p, cards: opts.hidden && opts.to !== "battlefield" ? [] : chosen.map(o => o.def.name), kind: "search" });
      else this.log(`${p.name} searches and finds nothing.`, { p, kind: "search" });
      this.bump();
      return moved;
    }

    /* ------------------------------------------------ mana */
    identityOf(p) { return p.identity.length ? p.identity : ["C"]; }
    /* Every way p could produce mana right now: [{o, ab, units: [["G"], ...] options, cost}] */
    /* forWhat: "spell" (default), "ability" or "special"; mana that can only be spent on abilities
       (Omen Hawker) is left out of everything else. */
    manaSources(p, exclude, forWhat, spell) {
      const out = [];
      const ex = exclude instanceof Set ? exclude : new Set(exclude || []);
      const vorinclex = this.battlefield.some(o => o.controller === p && o.def.doublesLandMana);
      // statics that stop mana abilities (Linvala, Grand Abolisher) or add to them (Badgermole Cub)
      const stops = [], bonus = [];
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) { if (st.cantActivate) stops.push([s, st]); if (st.creatureManaBonus) bonus.push([s, st]); }
      for (const o of this.battlefield) {
        if (o.controller !== p || ex.has(o.id)) continue;
        const abs = this.manaAbilities(o);
        if (!abs.length) continue;
        const options = [];
        for (const ab of abs) {
          if (stops.length && stops.some(([s, st]) => st.cantActivate(this, s, p, o, ab))) continue;
          if (ab.tap && o.tapped) continue;
          if (ab.tap && this.isCreature(o) && o.sick && !this.kw(o, "haste")) continue;
          if (ab.condition && !ab.condition(this, o)) continue;
          if (ab.noAuto) continue;
          if (ab.onlyFor && ab.onlyFor !== (forWhat || "spell")) continue;
          // mana that can only pay for some spells (Cavern of Souls): spellOnly(g, spell card, source)
          if (ab.spellOnly && !(spell && (forWhat || "spell") === "spell" && ab.spellOnly(this, spell, o))) continue;
          const prod = typeof ab.produce === "function" ? ab.produce(this, o) : ab.produce;
          if (!prod) continue;
          for (const units of this.expandProduce(prod, p)) options.push({ units, ab, cost: ab.cost ? parseCost(ab.cost) : null, tapCreature: ab.tapCreature || 0 });
        }
        if (!options.length) continue;
        if (bonus.length && this.isCreature(o)) {
          let extra = "";
          for (const [s, st] of bonus) extra += st.creatureManaBonus(this, s, o) || "";
          if (extra) for (const opt of options) if (opt.ab.tap) opt.units = opt.units.concat(extra.split(""));
        }
        // bigger outputs first (Fanatic of Rhonas: GGGG before G)
        options.sort((a, b) => b.units.length - a.units.length);
        const mult = vorinclex && this.isLand(o) ? 2 : 1;
        const any = options[0].ab;
        out.push({ o, options, mult, last: !!any.last, hasCost: options.some(x => x.cost), tapCreature: Math.min(...options.map(x => x.tapCreature)) });
      }
      // "exile this card from your hand: add {G}" (Elvish Spirit Guide), used last
      for (const o of p.hand) {
        if (!o.def.handMana || ex.has(o.id) || o === spell) continue;
        const ab = { hand: true, produce: o.def.handMana };
        out.push({ o, options: this.expandProduce(o.def.handMana, p).map(units => ({ units, ab, cost: null, tapCreature: 0 })), mult: 1, last: true, hasCost: false, tapCreature: 0 });
      }
      return out;
    }
    manaAbilities(o) {
      const out = o.def.mana.slice();
      // mana abilities a static gives (Song of Freyalise: "creatures you control gain {T}: Add one mana of any color")
      if (o.zone === "battlefield" && (this.staticSources(), this._grantsMana)) for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.grantMana && st.applies && st.applies(this, s, o)) out.push(...st.grantMana);
      if (o.def.levels) (o.def.levels || []).forEach((L, i) => { if (i < (o.state.level || 1) && L.mana) out.push(...L.mana); });
      return out;
    }
    /* produce strings: "G", "GW" (both), "CC", ["G","W"] (one of), "any" (commander identity), "any5" (any color) */
    expandProduce(prod, p) {
      if (Array.isArray(prod)) return prod.map(x => x.split(""));
      if (prod === "any") return this.identityOf(p).map(k => [k]);
      if (prod === "any5") return (p.identity.length ? p.identity : COLORS).map(k => [k]);
      if (prod.startsWith("choice:")) return prod.slice(7).split("").map(k => [k]);
      return [prod.split("")];
    }
    poolTotal(p) { return Object.values(p.pool).reduce((a, b) => a + b, 0); }
    emptyPools() { for (const p of this.players) for (const k in p.pool) p.pool[k] = 0; }

    /* Plan how to pay a cost. Returns {steps, convoke} or null. Mana already floating is used first.
       Search: sources in order of preference, each used (with one of its outputs) or skipped. */
    planPayment(p, cost, opts) {
      opts = opts || {};
      const need = { g: cost.g, W: cost.W, U: cost.U, B: cost.B, R: cost.R, G: cost.G, C: cost.C, hyb: cost.hyb.map(h => h.slice()), phy: cost.phy.slice() };
      // pay Phyrexian with mana when we can, else life (decided below)
      const pool = Object.assign({}, p.pool);
      const takeColor = (k) => { if (pool[k] > 0) { pool[k]--; return true; } return false; };
      for (const k of [...COLORS, "C"]) while (need[k] > 0 && takeColor(k)) need[k]--;
      need.hyb = need.hyb.filter(h => !(h.some(k => takeColor(k))));
      need.phy = need.phy.filter(k => !takeColor(k));
      let poolLeft = Object.values(pool).reduce((a, b) => a + b, 0);
      const fromPool = Math.min(poolLeft, need.g);
      need.g -= fromPool;
      const exclude = new Set(opts.exclude || []);
      let sources = this.manaSources(p, exclude, opts.for, opts.spell);
      // Which colors to keep open: the ones the hand and the commander still need, over how many
      // untapped sources make them. Generic mana then comes from the spare color (a Forest, not
      // the only Plains, pays the {2} of a green spell). A tie-break worth well under 1 rank point.
      const keep = {};
      {
        const demand = {}, supply = {};
        for (const o of p.hand.concat(p.command)) {
          const c = o.def.costObj;
          if (!c || o.def.types.includes("Land")) continue;
          for (const k of COLORS) demand[k] = (demand[k] || 0) + (c[k] || 0);
          for (const h of c.hyb) for (const k of h) demand[k] = (demand[k] || 0) + 0.5;
        }
        for (const s of sources) for (const k of new Set(s.options.map(x => x.units).flat())) supply[k] = (supply[k] || 0) + 1;
        for (const k of COLORS) keep[k] = ((demand[k] || 0) + 0.25) / ((supply[k] || 0) + 1);
      }
      const keepCost = s => {
        const ks = new Set(s.options.map(x => x.units).flat());
        let v = 0;
        for (const k of ks) if (keep[k] != null) v = Math.max(v, keep[k]);
        return Math.min(0.9, v) / Math.max(20, sources.length);
      };
      const rank = s => {
        if (s.rank != null) return s.rank;
        let r = 1;
        if (s.last) r += 50;
        if (s.tapCreature) r += 40;
        if (!this.isLand(s.o)) r += this.isCreature(s.o) ? 12 : 1;
        if (s.hasCost) r += 4;
        const colorsOut = new Set(s.options.map(x => x.units).flat());
        colorsOut.delete("C");
        r += colorsOut.size;
        if (s.options.length > 1) r += 1;
        r += keepCost(s);
        return (s.rank = r);
      };
      sources.sort((a, b) => rank(a) - rank(b));
      const creaturesForTap = this.battlefield.filter(o => o.controller === p && this.isCreature(o) && !o.tapped && !exclude.has(o.id));
      const lifeOK = p.life;
      // requirement check against a multiset of produced units
      // life paid for Phyrexian symbols if these units cover the cost, else -1
      const lifeFor = (units, extraGeneric) => {
        const u = units.slice();
        const need2 = { W: need.W, U: need.U, B: need.B, R: need.R, G: need.G, C: need.C };
        const takeU = (k) => { const i = u.indexOf(k); if (i >= 0) { u.splice(i, 1); return true; } return false; };
        for (const k of [...COLORS, "C"]) { while (need2[k] > 0) { if (!takeU(k)) return -1; need2[k]--; } }
        for (const h of need.hyb) { if (!h.some(k => takeU(k))) return -1; }
        let lifePaid = 0;
        for (const k of need.phy) { if (!takeU(k)) lifePaid += 2; }
        if (lifePaid && lifePaid >= lifeOK) return -1;
        const left = u.length - need.g - extraGeneric;
        if (left < 0) return -1;
        lastWaste = left;
        return lifePaid;
      };
      let lastWaste = 0;
      const covers = (units, extraGeneric) => lifeFor(units, extraGeneric) >= 0;
      // Would this output help? Only use a source for a color still missing or while generic is short,
      // so the plan doesn't tap extra lands (two Forests and two Plains for {1}{W}{W}).
      const useful = (units, extraGeneric, opt, mult) => {
        const u = units.slice();
        const takeU = (k) => { const i = u.indexOf(k); if (i >= 0) { u.splice(i, 1); return true; } return false; };
        const missing = new Set();
        for (const k of [...COLORS, "C"]) for (let n = need[k]; n > 0; n--) if (!takeU(k)) missing.add(k);
        for (const h of need.hyb) if (!h.some(k => takeU(k))) h.forEach(k => missing.add(k));
        for (const k of need.phy) if (!takeU(k)) missing.add(k);
        if (opt.units.some(k => missing.has(k))) return true;
        const addGen = opt.cost ? costMV(opt.cost) : 0;
        return need.g + extraGeneric - u.length > 0 && opt.units.length * mult > addGen;
      };
      const total = need.g + need.W + need.U + need.B + need.R + need.G + need.C + need.hyb.length;
      if (total === 0 && covers([], 0)) return { steps: [], fromPool: true };
      const chosen = [];
      let best = null, bestScore = Infinity;
      let budget = 20000;
      // pay() looks for the cheapest plan: no life for Phyrexian symbols if mana can do it, then
      // no wasted mana, then lands before rocks, rocks before creatures, Treasures last.
      // canPay() only needs to know a plan exists, so it stops at the first one.
      const optimize = !!opts.optimize;
      const dfs = (i, units, extraGen, tapCreatures, rankSum) => {
        if (--budget < 0 || (best && !optimize)) return;
        if (optimize && rankSum >= bestScore) return;
        const life = lifeFor(units, extraGen);
        if (life >= 0) {
          const score = life * 1000 + lastWaste * 60 + rankSum;
          if (score < bestScore) { bestScore = score; best = chosen.slice(); }
          if (!optimize || life === 0) return;
        }
        if (i >= sources.length) return;
        const s = sources[i];
        // remaining potential
        let potential = units.length;
        for (let j = i; j < sources.length; j++) potential += sources[j].options[0].units.length * sources[j].mult;
        if (potential < total + extraGen - (need.phy.length)) return;
        for (let oi = 0; oi < s.options.length; oi++) {
          const opt = s.options[oi];
          if (opt.tapCreature && tapCreatures + opt.tapCreature > creaturesForTap.length) continue;
          if (!useful(units, extraGen, opt, s.mult)) continue;
          const out = [];
          for (let m = 0; m < s.mult; m++) out.push(...opt.units);
          const addGen = opt.cost ? costMV(opt.cost) : 0;
          chosen.push({ s, oi });
          dfs(i + 1, units.concat(out), extraGen + addGen, tapCreatures + opt.tapCreature, rankSum + rank(s));
          chosen.pop();
          if (best && !optimize) return;
        }
        dfs(i + 1, units, extraGen, tapCreatures, rankSum);
      };
      dfs(0, [], 0, 0, 0);
      if (!best) {
        if (optimize && budget < 0) return this.planPayment(p, cost, Object.assign({}, opts, { optimize: false }));
        if (opts.convoke) return this.planConvoke(p, cost, opts);
        return null;
      }
      if (!optimize) {
        // drop sources the plan doesn't need, costliest first (a Treasure before a land)
        const evalSteps = steps => {
          const units = [];
          let extra = 0;
          for (const st of steps) { const opt = st.s.options[st.oi]; for (let m = 0; m < st.s.mult; m++) units.push(...opt.units); extra += opt.cost ? costMV(opt.cost) : 0; }
          return lifeFor(units, extra);
        };
        const life0 = evalSteps(best);
        for (const st of best.slice().sort((a, b) => rank(b.s) - rank(a.s))) {
          const rest = best.filter(x => x !== st);
          const life = evalSteps(rest);
          if (life >= 0 && life <= life0) best = rest;
        }
      }
      return { steps: best };
    }
    /* Convoke: tap creatures to pay part of the cost, lands for the rest. */
    planConvoke(p, cost, opts) {
      const creatures = this.battlefield.filter(o => o.controller === p && this.isCreature(o) && !o.tapped && !(opts.exclude || []).includes(o.id));
      creatures.sort((a, b) => (b.sick - a.sick) || (b.isToken - a.isToken) || (this.power(a) - this.power(b)));
      const c = cloneCost(cost);
      const tapped = [];
      for (const cr of creatures) {
        const cols = [...this.colorsOf(cr)];
        let used = false;
        for (const k of cols) if (c[k] > 0) { c[k]--; used = true; break; }
        if (!used) { const h = c.hyb.findIndex(hh => hh.some(k => cols.includes(k))); if (h >= 0) { c.hyb.splice(h, 1); used = true; } }
        if (!used && c.g > 0) { c.g--; used = true; }
        if (used) tapped.push(cr);
        const plan = this.planPayment(p, c, Object.assign({}, opts, { convoke: false, exclude: (opts.exclude || []).concat(tapped.map(o => o.id)) }));
        if (plan) return Object.assign(plan, { convoke: tapped.slice() });
      }
      return null;
    }
    canPay(p, cost, opts) { return !!this.planPayment(p, cost, opts); }
    /* What p's permanents make once they untap (next upkeep): { total, by color, can: payable cost }.
       Permanents that don't untap stay tapped; creatures are no longer summoning sick. */
    manaAfterUntap(p, cost) {
      const saved = [];
      for (const o of this.battlefield) {
        if (o.controller !== p) continue;
        saved.push([o, o.tapped, o.sick]);
        if (!(o.tapped && o.def.doesntUntap && o.def.doesntUntap(this, o))) o.tapped = false;
        o.sick = false;
      }
      const pool = Object.assign({}, p.pool);
      for (const k in p.pool) p.pool[k] = 0;
      try {
        const out = { total: 0, G: 0, W: 0, sources: [] };
        for (const s of this.manaSources(p)) {
          const units = s.options[0].units;
          out.total += units.length * (s.mult || 1);
          if (s.options.some(x => x.units.includes("G"))) out.G += Math.max(...s.options.map(x => x.units.filter(u => u === "G").length)) * (s.mult || 1);
          out.sources.push(s.o.def.name);
        }
        out.can = cost ? this.canPay(p, cost) : null;
        return out;
      } finally {
        for (const [o, t, sk] of saved) { o.tapped = t; o.sick = sk; }
        Object.assign(p.pool, pool);
      }
    }
    /* Actually pay: run the planned mana abilities (with their side effects), then spend from pool. */
    pay(p, cost, opts) {
      opts = opts || {};
      const plan = this.planPayment(p, cost, Object.assign({}, opts, { optimize: true }));
      if (!plan) return false;
      if (plan.convoke) for (const o of plan.convoke) this.tap(o);
      if (plan.convoke) {
        // convoke creatures paid part of the cost: rebuild the remaining cost for the pool step
        cost = this.convokeRemainder(p, cost, plan.convoke);
      }
      const steps = (plan.steps || []).slice().sort((a, b) => (a.s.options[a.oi].cost ? 1 : 0) - (b.s.options[b.oi].cost ? 1 : 0));
      for (const st of steps) this.activateMana(p, st.s, st.oi, cost);
      return this.spendPool(p, cost);
    }
    convokeRemainder(p, cost, tapped) {
      const c = cloneCost(cost);
      for (const cr of tapped) {
        const cols = [...this.colorsOf(cr)];
        let used = false;
        for (const k of cols) if (c[k] > 0) { c[k]--; used = true; break; }
        if (!used) { const h = c.hyb.findIndex(hh => hh.some(k => cols.includes(k))); if (h >= 0) { c.hyb.splice(h, 1); used = true; } }
        if (!used && c.g > 0) c.g--;
      }
      return c;
    }
    activateMana(p, s, oi, reserveFor) {
      const o = s.o;
      const opt = s.options[oi];
      const ab = opt.ab;
      if (ab.hand) {
        if (o.zone !== "hand") return;
        this.moveTo(o, "exile");
        this.log(`${p.name} exiles ${o.def.name} from their hand for mana.`, { p, cards: [o.def.name] });
      }
      if (ab.tap) this.tap(o);
      if (opt.cost) this.spendPool(p, opt.cost, reserveFor);
      if (opt.tapCreature) {
        const cands = this.battlefield.filter(c => c.controller === p && this.isCreature(c) && !c.tapped && c !== o);
        cands.sort((a, b) => (b.sick - a.sick) || (b.isToken - a.isToken) || (this.power(a) - this.power(b)));
        for (let k = 0; k < opt.tapCreature && cands[k]; k++) this.tap(cands[k]);
      }
      for (let m = 0; m < s.mult; m++) for (const k of opt.units) p.pool[k]++;
      if (ab.sacSelf) this.sacrifice(o);
      if (ab.after) ab.after(this, o);
      if (this.isLand(o)) this.emit("tapForMana", { o, p });
      this.bump();
    }
    /* Pay from the pool. `reserve` is a cost we still have to pay afterwards (a Signet paying its
       own {1} mid-payment), so generic mana comes from the colors that cost doesn't need. */
    spendPool(p, cost, reserve) {
      const pool = p.pool;
      const take = k => { if (pool[k] > 0) { pool[k]--; return true; } return false; };
      const want = k => (reserve ? (reserve[k] || 0) + (reserve.hyb || []).filter(h => h.includes(k)).length : 0);
      for (const k of [...COLORS, "C"]) for (let i = 0; i < (cost[k] || 0); i++) if (!take(k)) return false;
      for (const h of cost.hyb || []) {
        const order = h.slice().sort((a, b) => (pool[b] - want(b)) - (pool[a] - want(a)));
        if (!order.some(k => take(k))) return false;
      }
      for (const k of cost.phy || []) if (!take(k)) { if (!this.payLife(p, 2)) return false; }
      // generic: colorless first, then whichever color we have the most spare of
      for (let i = 0; i < (cost.g || 0); i++) {
        if (take("C")) continue;
        const k = Object.keys(pool).filter(c => pool[c] > 0).sort((a, b) => (pool[b] - want(b)) - (pool[a] - want(a)))[0];
        if (!k || !take(k)) return false;
      }
      this.bump();
      return true;
    }
    /* Total mana p could make now, for X spells. */
    maxX(p, baseCost, xCount, opts) {
      if (!xCount) return 0;
      let lo = 0, hi = 0;
      const sources = this.manaSources(p, new Set(opts && opts.exclude || []), opts && opts.for);
      hi = this.poolTotal(p) + sources.reduce((s, x) => s + x.options[0].units.length * x.mult, 0);
      if (opts && opts.convoke) hi += this.creatures(p).filter(o => !o.tapped).length;
      hi = Math.max(0, Math.floor(hi / xCount));
      while (hi > lo) {
        const mid = Math.ceil((lo + hi) / 2);
        const c = cloneCost(baseCost); c.g += mid * xCount;
        if (this.canPay(p, c, opts)) lo = mid; else hi = mid - 1;
      }
      return lo;
    }

    /* ------------------------------------------------ timing */
    canSorcery(p) { return this.active === p && (this.phase === "main1" || this.phase === "main2") && this.stack.length === 0 && !this.over; }
    landDrops(p) {
      let n = 1;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.extraLands && s.controller === p) n += st.extraLands;
      return n;
    }
    canPlayLand(p, o) {
      if (!this.canSorcery(p)) return false;
      if (p.landsPlayed >= this.landDrops(p)) return false;
      if (!o.def.types.includes("Land")) return false;
      return o.zone === "hand" || this.playableFromExile(p, o) || (o.zone === "graveyard" && o.owner === p && this.landsFrom(p, "graveyard")) || (o.zone === "library" && o.owner === p && p.library[0] === o && this.landsFrom(p, "top"));
    }
    playableFromExile(p, o) { return o.zone === "exile" && !!o.playable && o.playable.by === p && (o.playable.turn === this.turn || o.playable.forever); }
    /* Lands p may play from other zones: "graveyard" (Ramunap Excavator), "top" (Oracle of Mul Daya, Courser of Kruphix). */
    landsFrom(p, zone) {
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.playLandsFrom && s.controller === p && st.playLandsFrom.includes(zone)) return true;
      return false;
    }
    playLand(p, o, back) {
      if (back && o.def.mdfcLand) { if (!this.canSorcery(p) || p.landsPlayed >= this.landDrops(p) || !(o.zone === "hand" || this.playableFromExile(p, o))) return false; }
      else if (!this.canPlayLand(p, o)) return false;
      p.landsPlayed++;
      this.removeFromZone(o); o.zone = "new";
      // a modal double-faced card played as its land face
      if (back && o.def.mdfcLand) o.def = o.def.mdfcLand;
      this.log(`${p.name} plays ${o.def.name}.`, { p, cards: [o.def.name], kind: "land" });
      this.enterMany([{ o, controller: p, opts: {} }]);
      this.emit("landPlayed", { o, p });
      return true;
    }

    /* ------------------------------------------------ casting spells */
    castZones(p) {
      const out = p.hand.slice();
      for (const o of p.command) if (o.isCommander) out.push(o);
      for (const o of p.exile) if (this.playableFromExile(p, o)) out.push(o);
      for (const o of p.graveyard) if (o.def.flashback || (o.def.castFromGraveyard && o.def.castFromGraveyard(this, p, o))) out.push(o);
      return out;
    }
    morphCost(p) { return parseCost("{3}"); }
    commanderTax(p, o) { return o.isCommander && o.zone === "command" ? 2 * (p.cmdCasts[o.id] || 0) : 0; }
    /* Total cost of casting o with choices (x, door, alt). */
    spellCost(p, o, ch) {
      ch = ch || {};
      const d = o.def;
      let base = d.costObj;
      if (d.doors) base = parseCost(d.doors[ch.door || 0].cost);
      if (o.zone === "graveyard" && d.flashback) base = parseCost(d.flashback);
      if (ch.alt && d.altCosts) base = parseCost(d.altCosts[ch.alt - 1].cost || "");
      const c = cloneCost(base);
      if (c.x) { c.g += (ch.x || 0) * c.x; }
      c.g += this.commanderTax(p, o);
      if (ch.kicked && d.kicker) { const k = parseCost(d.kicker); Object.assign(c, addCost(c, k)); }
      // reductions reduce generic only
      let red = 0;
      if (d.costReduce) red += d.costReduce(this, p, o, ch) || 0;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.costMod && s.controller === p) red += st.costMod(this, s, o) || 0;
      for (const em of p.emblems) for (const st of em.statics || []) if (st.costMod) red += st.costMod(this, { controller: p }, o) || 0;
      for (const cm of p.command) for (const st of (cm.def.commandStatics || [])) if (st.costMod) red += st.costMod(this, cm, o) || 0;
      c.g = Math.max(0, c.g - red);
      c.x = 0;
      return c;
    }
    hasConvoke(p, o) {
      if (o.def.keywords.includes("convoke")) return true;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.giveConvoke && s.controller === p && st.giveConvoke(this, s, o)) return true;
      return false;
    }
    isInstantSpeed(p, o) {
      if (o.def.types.includes("Instant") || o.def.keywords.includes("flash")) return true;
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.giveFlash && st.giveFlash(this, s, o, p)) return true;
      return false;
    }
    /* Returns the ways o can be cast right now: [{door?, alt?, xMax, cost}] or [] */
    castOptions(p, o, opts) {
      opts = opts || {};
      if (this.over || p.lost) return [];
      if (o.def.types.includes("Land")) return [];
      const sorc = this.canSorcery(p);
      if (!sorc && !this.isInstantSpeed(p, o)) return [];
      if (o.def.canCast && !o.def.canCast(this, p, o)) return [];
      if (this.castBlocked(p, o)) return [];
      // no legal target for the normal spell: only an alternative cost with its own targets (cleave) can be cast
      let noTargets = false;
      const needs = (o.def.spell && o.def.spell.targets) || (o.def.aura && o.def.targets);
      if (needs) {
        for (const spec of needs) if (!spec.optional && !this.targetOptions(p, spec, o).length) noTargets = true;
        if (noTargets && !(o.def.altCosts || []).some(a => a.targets)) return [];
      }
      const altOk = alt => !alt.targets || alt.targets.every(spec => spec.optional || this.targetOptions(p, spec, o).length > 0);
      const ways = [];
      // "you may cast it without paying its mana cost" for as long as it stays exiled (Kheru Spellsnatcher, Gix)
      if (o.zone === "exile" && o.playable && o.playable.free && o.playable.by === p) {
        return [{ door: o.def.doors ? 0 : null, xMax: 0, xCount: 0, cost: parseCost(""), convoke: false, free: true, label: "Without paying its mana cost" }];
      }
      // morph: cast it face down as a 2/2 for {3}
      if (o.def.morph && o.zone === "hand" && sorc && !noTargets && this.canPay(p, this.morphCost(p))) ways.push({ door: null, xMax: 0, xCount: 0, cost: this.morphCost(p), convoke: false, faceDown: true, label: "Face down" });
      const doors = o.def.doors ? o.def.doors.map((_, i) => i) : [null];
      for (const door of noTargets ? [] : doors) {
        const ch = { door: door == null ? 0 : door, x: 0 };
        const base = this.spellCost(p, o, ch);
        const conv = this.hasConvoke(p, o);
        const xCount = o.def.doors ? 0 : (o.zone === "graveyard" && o.def.flashback ? parseCost(o.def.flashback).x : o.def.costObj.x);
        if (!this.canPay(p, base, { convoke: conv, spell: o })) continue;
        const xMax = xCount ? this.maxX(p, base, xCount, { convoke: conv, spell: o }) : 0;
        if (xCount && o.def.minX && xMax < o.def.minX) continue;
        ways.push({ door, xMax, xCount, cost: base, convoke: conv, label: o.def.doors ? o.def.doors[door].name : (o.zone === "graveyard" && o.def.flashback ? "Flashback" : null) });
      }
      // alternative costs (Fierce Guardianship, Force of Will...)
      (o.def.altCosts || []).forEach((alt, i) => {
        if (o.zone === "graveyard") return;
        if (noTargets && !alt.targets) return;
        if (!altOk(alt)) return;
        if (alt.condition && !alt.condition(this, p, o)) return;
        if (alt.payLife && p.life <= alt.payLife) return;
        if (alt.exileFromHand && !p.hand.some(c => c !== o && alt.exileFromHand.filter(this, c))) return;
        const base = this.spellCost(p, o, { alt: i + 1 });
        if (!this.canPay(p, base, { spell: o })) return;
        ways.push({ door: null, alt: i + 1, xMax: 0, xCount: 0, cost: base, convoke: false, label: alt.label || "Alternative cost" });
      });
      return ways;
    }
    /* Cast a spell. choice: {door, x, targets, mode, kicked}. Missing choices are asked. */
    async cast(p, o, choice) {
      choice = choice || {};
      const ways = this.castOptions(p, o);
      if (!ways.length) return false;
      let way = ways[0];
      if (choice.faceDown) way = ways.find(w => w.faceDown) || null;
      else if (choice.alt) way = ways.find(w => w.alt === choice.alt) || null;
      else if (choice.door != null) way = ways.find(w => w.door === choice.door && !w.alt && !w.faceDown) || ways.find(w => !w.alt && !w.faceDown) || null;
      else way = ways.find(w => !w.alt && !w.faceDown) || ways[0];
      if (!way) return false;
      if (way.faceDown) return this.castFaceDown(p, o, way);
      if (way.free) { const ok = await this.castWithoutPaying(p, o, { forever: true }); return ok; }
      const d = o.def;
      const item = { kind: "spell", o, p, x: 0, door: way.door || 0, alt: way.alt || 0, targets: [], mode: null, id: ++this.ts, name: d.doors ? d.doors[way.door || 0].name : d.name };
      // X
      if (way.xCount) {
        let x = choice.x;
        if (x == null) x = await this.ask(p, { type: "number", prompt: `Choose X for ${d.name}`, min: d.minX || 0, max: way.xMax, purpose: "x", src: o });
        item.x = Math.max(0, Math.min(way.xMax, x | 0));
      }
      // modes
      if (d.modes) {
        let mode = choice.mode;
        const avail = d.modes.map((m, i) => ({ id: i, label: m.label, ok: !m.canChoose || m.canChoose(this, p, o) })).filter(m => m.ok);
        if (mode == null) mode = await this.ask(p, { type: "option", prompt: `Choose a mode for ${d.name}`, options: avail, purpose: "mode", src: o });
        item.mode = mode;
      }
      // kicker
      if (d.kicker && choice.kicked == null) {
        const kc = addCost(this.spellCost(p, o, { x: item.x }), parseCost(d.kicker));
        if (this.canPay(p, kc, { convoke: way.convoke, spell: o })) item.kicked = await this.ask(p, { type: "confirm", prompt: `Pay the kicker for ${d.name}?`, purpose: "kicker", src: o });
      } else item.kicked = !!choice.kicked;
      // targets
      const specs = this.spellTargets(o, item);
      for (let i = 0; i < specs.length; i++) {
        const spec = specs[i];
        let t = choice.targets ? choice.targets[i] : undefined;
        if (t === undefined) t = await this.chooseTarget(p, spec, o);
        if (!t && !spec.optional) return false;
        item.targets.push(t);
      }
      // pay
      const cost = this.spellCost(p, o, { x: item.x, door: item.door, kicked: item.kicked, alt: item.alt });
      const fromZone = o.zone;
      let altExile = null;
      if (item.alt) {
        const alt = d.altCosts[item.alt - 1];
        if (alt.exileFromHand) {
          const opts = p.hand.filter(c => c !== o && alt.exileFromHand.filter(this, c));
          const pick = await this.ask(p, { type: "target", prompt: alt.exileFromHand.prompt || "Exile a card from your hand", options: opts, purpose: "altExile", src: o });
          if (!pick) return false;
          altExile = pick;
        }
      }
      if (!this.pay(p, cost, { convoke: way.convoke, spell: o })) { this.log(`${p.name} can't pay for ${d.name}.`, { p }); return false; }
      if (item.alt) {
        const alt = d.altCosts[item.alt - 1];
        if (alt.payLife) this.payLife(p, alt.payLife);
        if (altExile) this.moveTo(altExile, "exile");
      }
      if (o.isCommander && fromZone === "command") p.cmdCasts[o.id] = (p.cmdCasts[o.id] || 0) + 1;
      if (fromZone === "graveyard" && d.flashback) item.exileAfter = true;
      return this.putOnStack(p, o, item);
    }
    /* Morph: a face-down 2/2 creature spell for {3}. Nobody else sees what it is. */
    async castFaceDown(p, o, way) {
      if (!this.pay(p, way.cost, {})) return false;
      o.def = MK.faceDownDef(o.cardDef, "morph");
      o.faceDown = { kind: "morph" };
      const item = { kind: "spell", o, p, x: 0, door: 0, alt: 0, targets: [], mode: null, id: ++this.ts, name: "a face-down creature", faceDown: true };
      return this.putOnStack(p, o, item);
    }
    /* A spell that has been paid for (or is free) goes on the stack, triggers "cast", and gets a
       priority round. Returns once it has resolved or been countered. */
    async putOnStack(p, o, item) {
      const d = o.def;
      item.from = item.from || o.zone;       // where it was cast from (Wash Away)
      this.removeFromZone(o);
      o.zone = "stack"; o.zc++;
      this.stack.push(item);
      p.spellsCast++;
      if (!d.types.includes("Creature")) p.ncCast = (p.ncCast || 0) + 1; // Deafening Silence, Esper Sentinel
      // spells cast this turn and their colors (Veil of Summer)
      if (!this.castLog || this.castLog.turn !== this.turn) this.castLog = Object.assign([], { turn: this.turn });
      this.castLog.push({ turn: this.turn, p, colors: [...this.colorsOf(o)] });
      this.spellsThisTurn = (this.spellsThisTurn || 0) + 1;
      item.storm = this.spellsThisTurn - 1;
      p.stats.cast[d.name] = (p.stats.cast[d.name] || 0) + 1;
      this.stats.spells++;
      this.bump();
      this.log(`${p.name} casts ${item.name}${item.free ? " without paying its mana cost" : ""}${item.x ? ` (X=${item.x})` : ""}${item.targets.filter(Boolean).length ? " targeting " + item.targets.filter(Boolean).map(t => this.nameOf(t)).join(" and ") : ""}.`, { p, cards: [d.name], kind: "cast", item });
      this.anim("cast", { p, o, item });
      this.emit("cast", { p, o, item, spell: item });
      this.targeted(item);
      if (d.onCast) { try { await d.onCast(this, p, o, item); } catch (e) { this.warn(e, o); } }
      await this.settle();
      await this.pace("cast", { p, o, item });
      // priority: others may respond, then it resolves (unless countered)
      await this.priorityRound(p, item);
      return true;
    }
    /* Cascade, "you may cast it without paying its mana cost". Targets and modes are asked. */
    async castWithoutPaying(p, o, opts) {
      opts = opts || {};
      const d = o.def;
      if (d.types.includes("Land") || this.over) return false;
      const ban = this.castBlocked(p, o);
      if (ban) { this.log(`${p.name} can't cast ${d.name} (${ban}).`, { p, cards: [d.name] }); return false; }
      const item = { kind: "spell", o, p, x: 0, door: 0, alt: 0, targets: [], mode: null, id: ++this.ts, name: d.doors ? d.doors[0].name : d.name, free: true };
      if (d.modes) {
        const avail = d.modes.map((m, i) => ({ id: i, label: m.label, ok: !m.canChoose || m.canChoose(this, p, o) })).filter(m => m.ok);
        if (!avail.length) return false;
        item.mode = await this.ask(p, { type: "option", prompt: `Choose a mode for ${d.name}`, options: avail, purpose: "mode", src: o });
      }
      const specs = this.spellTargets(o, item);
      for (const spec of specs) {
        const t = await this.chooseTarget(p, spec, o);
        if (!t && !spec.optional) { this.log(`${d.name} has no target, so it isn't cast.`, { p }); return false; }
        item.targets.push(t);
      }
      if (opts.exileAfter) item.exileAfter = true;
      return this.putOnStack(p, o, item);
    }
    spellTargets(o, item) {
      const d = o.def;
      // an alternative cost can change the targets (cleave)
      if (item && item.alt && d.altCosts && d.altCosts[item.alt - 1] && d.altCosts[item.alt - 1].targets) return d.altCosts[item.alt - 1].targets;
      if (d.modes && item.mode != null && d.modes[item.mode].targets) return d.modes[item.mode].targets;
      if (d.doors) return [];
      return (d.spell && d.spell.targets) || d.targets || [];
    }
    /* "Whenever this becomes the target of a spell or ability" (ward): one event per permanent targeted. */
    targeted(item) {
      const seen = new Set();
      for (const t of item.targets || []) {
        if (!t || this.isPlayer(t) || t.kind || seen.has(t) || t.zone !== "battlefield") continue;
        seen.add(t);
        this.emit("becameTarget", { o: t, p: item.p, item });
        // ward a static ability gives (Brotherhood Regalia's equipped creature)
        if (item.p !== t.controller) {
          let n = 0;
          for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.ward && st.applies && st.applies(this, s, t)) n = Math.max(n, st.ward);
          if (n > 0) { const tr = MK.wardTrigger(n); this.pending.push({ src: t, tr, ev: { o: t, p: item.p, item }, controller: t.controller }); }
        }
      }
    }
    nameOf(t) { if (!t) return "nothing"; if (this.isPlayer(t)) return t.name; if (t.kind === "spell") return t.name; return t.def.name; }

    /* Everyone gets a chance to respond, in turn order after the caster. Resolves the stack. */
    async priorityRound(caster, item) {
      // countered while its cast triggers resolved (ward): nothing to wait for, and the spells
      // below it belong to the rounds already running for them
      const base = this.stack.indexOf(item);
      if (base < 0) return;
      await this.resolveDown(base);
    }
    async askRespond(q, ctx) {
      if (!q.agent.respond) return null;
      const acts = this.legalActions(q, { instant: true });
      if (!acts.length) return null;
      ctx.actions = acts;
      const act = await q.agent.respond(this, q, ctx);
      return act && act.type !== "pass" ? act : null;
    }
    async resolveTop() {
      const item = this.stack.pop();
      if (!item) return;
      this.bump();
      if (item.countered) return;
      if (item.kind === "trigger") return this.resolveTrigger(item);
      if (item.kind === "ability") return this.resolveAbility(item);
      const o = item.o, p = item.p, d = o.def;
      // targets: if every target is gone or illegal, the spell does nothing
      const specs = this.spellTargets(o, item);
      if (specs.length) {
        const legal = item.targets.map((t, i) => t && this.legalTarget(p, specs[i], t, o));
        if (item.targets.length && legal.every(x => !x) && specs.every(s => !s.optional)) {
          this.log(`${item.name} has no legal target left and does nothing.`, { cards: [d.name] });
          this.anim("fizzle", { item });
          this.finishSpell(item);
          return;
        }
        item.legal = legal;
      }
      this.anim("resolve", { item });
      if (this.isPermanentCard(o) && !item.isCopy) {
        o.zone = "new";
        if (d.aura && item.targets[0]) o.attachedTo = item.targets[0];
        const eo = { x: item.x, door: item.door };
        // "as this enters" choices (Spark Double's copy); they can change what enters
        if (d.asEnters && !item.faceDown) { try { await d.asEnters(this, p, o, item, eo); } catch (e) { this.warn(e, o); } }
        this.enterMany([{ o, controller: p, opts: eo }]);
        if (d.onResolve) { try { await d.onResolve(this, p, o, item); } catch (e) { this.warn(e, o); } }
      } else {
        try {
          const fx = d.modes && item.mode != null ? d.modes[item.mode] : d.spell;
          if (fx && fx.do) await fx.do(this, { p, o, src: o, targets: item.targets, legal: item.legal || [], x: item.x, item, kicked: item.kicked });
        } catch (e) { this.warn(e, o); }
        this.finishSpell(item);
      }
      // the triggers it caused go on the stack in resolveDown, which called this
    }
    /* An activated ability on the stack. Its targets are checked again; with every target gone it
       does nothing. Abilities exist apart from their source, so it resolves even if that left. */
    async resolveAbility(item) {
      const { o, p, ab, ctx } = item;
      if (p.lost) return;
      const specs = ab.targets || [];
      specs.forEach((spec, i) => { const t = ctx.targets[i]; ctx.legal[i] = !!t && this.legalTarget(p, spec, t, o); });
      if (specs.length && ctx.targets.some(Boolean) && specs.every((s, i) => !ctx.legal[i] && !s.optional)) {
        this.log(`${item.name} has no legal target left and does nothing.`, { p, cards: [o.def.name] });
        return;
      }
      try { await ab.do(this, o, ctx); } catch (e) { this.warn(e, o); }
    }
    /* What an item on the stack targets: a spell's specs, or an ability's. */
    stackTargets(item) {
      if (item.kind === "ability") return item.ab.targets || [];
      if (item.kind === "trigger") return [];
      return this.spellTargets(item.o, item);
    }
    finishSpell(item) {
      const o = item.o;
      if (item.isCopy) { o.gone = true; return; }
      if (o.zone !== "stack") return;
      if (o.cardDef && o.def !== o.cardDef) { o.def = o.cardDef; o.faceDown = null; this.ts++; }
      if (this.isPermanentCard(o)) { o.zone = "graveyard"; o.owner.graveyard.push(o); }
      else if (item.exileAfter) { o.zone = "exile"; o.owner.exile.push(o); }
      else { o.zone = "graveyard"; o.owner.graveyard.push(o); }
      if (o.isCommander && o.zone !== "command") this.moveTo(o, "command");
      else if (o.zone === "graveyard") this.emit("putInGraveyard", { o, p: o.owner, from: "stack" });
      this.bump();
    }
    counterSpell(item, by) {
      const i = this.stack.indexOf(item);
      if (i < 0) return false;
      if (item.kind === "ability" || item.kind === "trigger") {
        // abilities (ward against an ability, Stifle effects): it's removed, nothing else happens
        this.stack.splice(i, 1);
        item.countered = true;
        this.log(`${item.name} is countered.`, { cards: [item.o && item.o.def ? item.o.def.name : ""].filter(Boolean), kind: "counter" });
        this.bump();
        return true;
      }
      if (item.o.def.cantBeCountered || item.cantBeCountered || this.uncounterable(item)) { this.log(`${item.name} can't be countered.`, {}); return false; }
      this.stack.splice(i, 1);
      item.countered = true;
      this.log(`${item.name} is countered.`, { cards: [item.o.def.name], kind: "counter" });
      this.anim("countered", { item });
      this.finishSpell(item);
      this.emit("countered", { item, by });
      return true;
    }
    /* Copy a spell on the stack (demonstrate and friends). The copy's controller may pick new targets. */
    async copySpell(item, p, newTargets) {
      const copy = Object.assign({}, item, { p, isCopy: true, id: ++this.ts, targets: item.targets.slice(), name: item.name + " (copy)" });
      copy.o = Object.assign(Object.create(Object.getPrototypeOf(item.o)), item.o);
      copy.o.owner = p; copy.o.controller = p; copy.o.id = ++objSeq;
      if (newTargets !== false) {
        const specs = this.spellTargets(item.o, item);
        copy.targets = [];
        for (const spec of specs) copy.targets.push(await this.chooseTarget(p, spec, copy.o));
      }
      this.stack.push(copy);
      this.bump();
      this.log(`${p.name} gets a copy of ${item.name}.`, { p, cards: [item.o.def.name] });
      return copy;
    }

    /* ------------------------------------------------ activated abilities */
    abilitiesOf(o) {
      const out = o.def.abilities.map((ab, i) => ({ ab, i, key: "a" + i }));
      if (o.def.doors && o.zone === "battlefield") {
        o.def.doors.forEach((door, i) => {
          if (!(o.state.doors || [])[i]) out.push({ ab: { label: `Unlock ${door.name}`, cost: door.cost, timing: "sorcery", unlock: i, do: (g, src) => { src.state.doors[i] = true; g.bump(); g.log(`${src.controller.name} unlocks ${door.name}.`, { p: src.controller, cards: [src.def.name] }); if (door.onUnlock) return door.onUnlock(g, src); } }, i: 100 + i, key: "u" + i });
          if ((o.state.doors || [])[i] && door.abilities) door.abilities.forEach((ab, k) => out.push({ ab, i: 200 + i * 10 + k, key: "d" + i + k }));
        });
      }
      if (o.def.levels && o.zone === "battlefield") {
        const lv = o.state.level || 1;
        const next = o.def.levels[lv];
        if (next) out.push({ ab: { label: `Level ${lv + 1}`, cost: next.cost, timing: "sorcery", levelUp: lv + 1, do: async (g, src) => { src.state.level = lv + 1; g.bump(); g.log(`${src.def.name} becomes level ${lv + 1}.`, { p: src.controller, cards: [src.def.name] }); if (next.onLevel) await next.onLevel(g, src); } }, i: 300 + lv, key: "l" + lv });
        o.def.levels.forEach((L, li) => { if (li < lv && L.abilities) L.abilities.forEach((ab, k) => out.push({ ab, i: 400 + li * 10 + k, key: "L" + li + k })); });
      }
      if (o.def.crew && o.zone === "battlefield") out.push({ ab: { label: `Crew ${o.def.crew}`, crew: o.def.crew, timing: "instant", do: (g, src) => { src.state.crewed = g.turn; g.bump(); g.log(`${src.controller.name} crews ${src.def.name}.`, { p: src.controller, cards: [src.def.name] }); } }, i: 500, key: "crew" });
      // abilities a static gives this object (Etrata, Deadly Fugitive gives face-down creatures one)
      if (o.zone === "battlefield") {
        let k = 0;
        for (const s of this.staticSources()) for (const st of this.staticsOf(s)) {
          if (!st.grantAbilities || !st.applies || !st.applies(this, s, o)) continue;
          const list = typeof st.grantAbilities === "function" ? st.grantAbilities(this, s, o) : st.grantAbilities;
          for (const ab of list || []) { out.push({ ab, i: 800 + k, key: "G" + k, grantedBy: s }); k++; }
        }
      }
      if (o.def.equip && o.zone === "battlefield") out.push({ ab: { label: `Equip`, cost: o.def.equip, timing: "sorcery", targets: [{ kind: "creature", you: true, prompt: `Attach ${o.def.name} to`, purpose: "equip", filter: (g, t, p, src) => t.id !== (src.attachedTo && src.attachedTo.id) }], do: (g, src, ctx) => { const t = ctx.targets[0]; if (t && ctx.legal[0] !== false && t.zone === "battlefield") { src.attachedTo = t; g.bump(); g.log(`${src.def.name} is attached to ${t.def.name}.`, { cards: [src.def.name, t.def.name] }); } } }, i: 600, key: "equip" });
      return out;
    }
    /* Creatures that can be tapped for an ability's "tap N untapped creatures you control" cost:
       `tapFilter` narrows them (Elves), and the source itself counts only with `tapSelfOk`
       (summoning sickness doesn't matter for this cost). */
    tapCandidates(p, o, ab) {
      // with a filter, any permanent it accepts counts ("untapped Elves": a Kindred Elf enchantment too)
      const base = ab.tapFilter ? this.controlled(p) : this.creatures(p);
      return base.filter(c => !c.tapped && (c !== o || (ab.tapSelfOk && !ab.tap)) && (!ab.tapFilter || ab.tapFilter(this, c, o)));
    }
    graveyardAbilities(o) { return (o.def.gyAbilities || []).map((ab, i) => ({ ab, i: 700 + i, key: "g" + i, fromGraveyard: true })); }
    findAbility(o, i) {
      if (o.zone === "graveyard") return this.graveyardAbilities(o).find(a => a.i === i);
      return this.abilitiesOf(o).find(a => a.i === i);
    }
    abilityCost(p, o, ab, x) {
      if (!ab.cost) return parseCost("");
      const c = parseCost(ab.cost);
      if (c.x) c.g += (x || 0) * c.x;
      if (ab.costReduce) c.g = Math.max(0, c.g - ab.costReduce(this, o));
      c.x = 0;
      // "activated abilities of creatures you control cost {2} less" (Training Grounds): generic mana
      // only, never below one mana in total, and not special actions like turning a card face up
      if (!ab.special && o.zone === "battlefield" && this.isCreature(o)) {
        let red = 0;
        for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.abilityCostMod && s.controller === p) red += st.abilityCostMod(this, s, o, ab) || 0;
        if (red > 0) c.g -= Math.max(0, Math.min(red, c.g, costMV(c) - 1));
      }
      return c;
    }
    canActivate(p, o, entry, opts) {
      opts = opts || {};
      const ab = entry.ab;
      if (this.over || p.lost) return false;
      if (entry.fromGraveyard) { if (o.zone !== "graveyard" || o.owner !== p) return false; }
      else if (o.zone !== "battlefield" || o.controller !== p) return false;
      const sorc = this.canSorcery(p);
      if ((ab.timing === "sorcery" || ab.loyalty != null) && !sorc) return false;
      if (opts.instant && (ab.timing === "sorcery" || ab.loyalty != null)) return false;
      if (ab.loyalty != null) {
        if (o.state.loyaltyUsed === this.turn) return false;
        if (ab.loyalty < 0 && (o.counters.loyalty || 0) < -ab.loyalty) return false;
      }
      if (ab.once && o.state["once" + entry.key] === this.turn) return false;
      if (ab.tap) {
        if (o.tapped) return false;
        if (this.isCreature(o) && o.sick && !this.kw(o, "haste")) return false;
      }
      if (ab.untapSelf && !o.tapped) return false;
      if (ab.condition && !ab.condition(this, o, p)) return false;
      if (!ab.special && this.activateBlocked(p, o, ab)) return false;
      if (ab.removeCounters && (o.counters[ab.removeCounters.kind] || 0) < ab.removeCounters.n) return false;
      if (ab.payLife && p.life < ab.payLife) return false;
      if (ab.untapCreatures && this.creatures(p).filter(c => c.tapped).length < ab.untapCreatures) return false;
      const excl = ab.tap || ab.noSelfMana ? [o.id] : [];
      if (ab.tapCreatures && this.tapCandidates(p, o, ab).length < ab.tapCreatures) return false;
      if (ab.sacCost) { if (!this.battlefield.some(c => c.controller === p && ab.sacCost.filter(this, c, o))) return false; }
      if (ab.crew) {
        const pow = this.creatures(p).filter(c => !c.tapped && c !== o).reduce((s, c) => s + Math.max(0, this.power(c)), 0);
        if (pow < ab.crew) return false;
        if (o.state.crewed === this.turn) return false;
      }
      if (ab.discard && p.hand.length < ab.discard) return false;
      if (ab.targets) for (const spec of ab.targets) if (!spec.optional && !this.targetOptions(p, spec, o).length) return false;
      const cost = this.abilityCost(p, o, ab, ab.minXFn ? ab.minXFn(this, o, p) : (ab.minX || 0));
      if (!this.canPay(p, cost, { exclude: excl, for: ab.special ? "special" : "ability" })) return false;
      return true;
    }
    /* Activate an ability. It resolves right away (see SIMPLIFICATIONS). */
    async activate(p, o, idx, choice) {
      choice = choice || {};
      const entry = this.findAbility(o, idx);
      if (!entry || !this.canActivate(p, o, entry)) return false;
      const ab = entry.ab;
      const ctx = { p, src: o, targets: [], legal: [], x: 0, ability: ab, kws: new Set(o.zone === "battlefield" ? this.ch(o).kws : []), lki: o.zone === "battlefield" ? this.lki(o) : null };
      const excl = ab.tap || ab.noSelfMana ? [o.id] : [];
      const forWhat = ab.special ? "special" : "ability";
      // X
      const baseC = parseCost(ab.cost || "");
      if (baseC.x && !ab.xFrom) {
        const base0 = this.abilityCost(p, o, ab, 0);
        const xMax = this.maxX(p, base0, baseC.x, { exclude: excl, for: forWhat });
        let x = choice.x;
        if (x == null) x = await this.ask(p, { type: "number", prompt: `Choose X for ${ab.label || o.def.name}`, min: ab.minX || 0, max: xMax, purpose: "x", src: o, ability: ab });
        ctx.x = Math.max(ab.minX || 0, Math.min(xMax, x | 0));
      }
      for (const spec of ab.targets || []) {
        const t = await this.chooseTarget(p, spec, o);
        if (!t && !spec.optional) return false;
        ctx.targets.push(t);
      }
      if (ab.xFrom) {
        ctx.x = ab.xFrom(this, ctx);
        if (!this.canPay(p, this.abilityCost(p, o, ab, ctx.x), { exclude: excl, for: forWhat })) { this.log(`${p.name} can't pay for that.`, { p }); return false; }
      }
      // non-mana costs
      let sacrificed = null;
      if (ab.sacCost) {
        const opts = this.battlefield.filter(c => c.controller === p && ab.sacCost.filter(this, c, o));
        const pick = await this.ask(p, { type: "target", prompt: ab.sacCost.prompt || "Sacrifice", options: opts, purpose: "sacrifice", src: o });
        if (!pick) return false;
        sacrificed = pick;
      }
      // creatures tapped for a cost can't also tap for mana: leave out the ones the mana needs,
      // as long as enough others remain (Grove of the Guardian with Llanowar Elves in play)
      const manaCost = this.abilityCost(p, o, ab, ctx.x);
      const spare = (cands, n, enough) => {
        const ok = cands.filter(c => this.canPay(p, manaCost, { exclude: excl.concat([c.id]), for: forWhat }));
        return enough(ok) ? ok : cands;
      };
      let crewers = null;
      if (ab.crew) {
        const cands = spare(this.creatures(p).filter(c => !c.tapped && c !== o), 0, l => l.reduce((s, c) => s + Math.max(0, this.power(c)), 0) >= ab.crew);
        crewers = await this.ask(p, { type: "cards", prompt: `Crew ${ab.crew}: tap creatures with total power ${ab.crew} or more`, options: cands, min: 1, max: cands.length, purpose: "crew", need: ab.crew, src: o });
        if (!crewers || crewers.reduce((s, c) => s + Math.max(0, this.power(c)), 0) < ab.crew) return false;
      }
      let tappers = null;
      if (ab.tapCreatures) {
        const cands = spare(this.tapCandidates(p, o, ab), 0, l => l.length >= ab.tapCreatures);
        tappers = await this.ask(p, { type: "cards", prompt: ab.tapPrompt || `Tap ${ab.tapCreatures} untapped creatures`, options: cands, min: ab.tapCreatures, max: ab.tapCreatures, purpose: "tapCost", src: o });
        if (!tappers || tappers.length !== ab.tapCreatures) return false;
      }
      let untappers = null;
      if (ab.untapCreatures) {
        const cands = this.creatures(p).filter(c => c.tapped);
        untappers = await this.ask(p, { type: "cards", prompt: `Untap ${ab.untapCreatures} tapped creature${ab.untapCreatures > 1 ? "s" : ""}`, options: cands, min: ab.untapCreatures, max: ab.untapCreatures, purpose: "untapCost", src: o });
        if (!untappers || untappers.length !== ab.untapCreatures) return false;
      }
      let discarded = null;
      if (ab.discard) {
        discarded = await this.ask(p, { type: "cards", prompt: `Discard ${ab.discard}`, options: p.hand.slice(), min: ab.discard, max: ab.discard, purpose: "discard", src: o });
      }
      const cost = this.abilityCost(p, o, ab, ctx.x);
      if (!this.pay(p, cost, { exclude: excl.concat(tappers ? tappers.map(c => c.id) : []).concat(crewers ? crewers.map(c => c.id) : []), for: forWhat })) {
        this.log(`${p.name} can't pay for ${ab.label || o.def.name}${tappers || crewers ? " with those creatures tapped (they were needed for mana)" : ""}.`, { p, cards: [o.def.name] });
        return false;
      }
      if (ab.tap) this.tap(o);
      if (ab.untapSelf) this.untap(o);
      if (ab.loyalty != null) {
        o.state.loyaltyUsed = this.turn;
        if (ab.loyalty > 0) this.addCounters(o, "loyalty", ab.loyalty); else o.counters.loyalty -= -ab.loyalty;
        this.bump();
      }
      if (ab.once) o.state["once" + entry.key] = this.turn;
      if (ab.removeCounters) { this.removeCounters(o, ab.removeCounters.kind, ab.removeCounters.n); this.loopHint = o; }
      if (ab.payLife) this.payLife(p, ab.payLife);
      if (crewers) crewers.forEach(c => this.tap(c));
      if (tappers) tappers.forEach(c => this.tap(c));
      if (untappers) untappers.forEach(c => this.untap(c));
      if (discarded) discarded.forEach(c => this.discard(p, c));
      if (sacrificed) this.sacrifice(sacrificed);
      if (ab.sacSelf) this.sacrifice(o);
      if (ab.exileSelf) this.moveTo(o, "exile");
      ctx.targets.forEach((t, i) => { ctx.legal[i] = !!t; });
      this.log(`${p.name} uses ${ab.label ? ab.label + " (" + o.def.name + ")" : o.def.name}${ctx.x ? ` with X=${ctx.x}` : ""}${ctx.targets.filter(Boolean).length ? " on " + ctx.targets.filter(Boolean).map(t => this.nameOf(t)).join(" and ") : ""}.`, { p, cards: [o.def.name], kind: "ability" });
      this.anim("ability", { p, o, ab });
      // everything but mana abilities and special actions (turning a card face up, unlocking a
      // door) goes on the stack, where other players may respond before it resolves
      if (!ab.special && !ab.manaAbility && ab.unlock == null && !ab.faceUp) {
        const item = { kind: "ability", o, p, ab, ctx, targets: ctx.targets, id: "a" + (++this.itemSeq), name: `${o.def.name}: ${ab.label || "ability"}` };
        this.stack.push(item);
        this.bump();
        this.emit("activated", { p, o, ab, item });
        this.targeted(item);
        await this.priorityRound(p, item);
        return true;
      }
      await this.settle();
      if (this.over) return true;
      try {
        // re-check targets at resolution
        (ab.targets || []).forEach((spec, i) => { const t = ctx.targets[i]; ctx.legal[i] = !!t && this.legalTarget(p, spec, t, o); });
        await ab.do(this, o, ctx);
      } catch (e) { this.warn(e, o); }
      await this.settle();
      return true;
    }

    /* ------------------------------------------------ legal actions (screen and bots) */
    legalActions(p, opts) {
      opts = opts || {};
      if (this.over || p.lost) return [];
      const acts = [];
      const sorc = !opts.instant && this.canSorcery(p);
      if (sorc) {
        for (const o of p.hand) if (this.canPlayLand(p, o)) acts.push({ type: "land", card: o });
        for (const o of p.exile) if (o.def.types.includes("Land") && this.canPlayLand(p, o)) acts.push({ type: "land", card: o });
        for (const o of p.graveyard) if (o.def.types.includes("Land") && this.canPlayLand(p, o)) acts.push({ type: "land", card: o });
        if (p.library[0] && p.library[0].def.types.includes("Land") && this.canPlayLand(p, p.library[0])) acts.push({ type: "land", card: p.library[0] });
        // the land face of a modal double-faced card (Boggart Trawler // Boggart Bog)
        if (p.landsPlayed < this.landDrops(p)) for (const o of p.hand) if (o.def.mdfcLand) acts.push({ type: "land", card: o, back: true });
      }
      for (const o of this.castZones(p)) {
        if (o.def.types.includes("Land")) continue;
        const ways = this.castOptions(p, o);
        for (const w of ways) {
          if (opts.instant && !this.isInstantSpeed(p, o)) continue;
          acts.push({ type: "cast", card: o, door: w.door, alt: w.alt, faceDown: !!w.faceDown, free: !!w.free, xMax: w.xMax, xCount: w.xCount, cost: w.cost, label: w.label });
        }
      }
      // cycling and channel from hand
      for (const o of p.hand) if (o.def.cycling && this.canPay(p, parseCost(o.def.cycling))) acts.push({ type: "cycle", card: o, cost: parseCost(o.def.cycling) });
      for (const o of p.hand) if (o.def.channel && this.canChannel(p, o)) acts.push({ type: "channel", card: o, cost: this.channelCost(p, o) });
      for (const o of this.battlefield) {
        if (o.controller !== p) continue;
        for (const entry of this.abilitiesOf(o)) {
          if (opts.instant && (entry.ab.timing === "sorcery" || entry.ab.loyalty != null)) continue;
          if (this.canActivate(p, o, entry, opts)) acts.push({ type: "activate", card: o, idx: entry.i, ab: entry.ab });
        }
      }
      for (const o of p.graveyard) for (const entry of this.graveyardAbilities(o)) if (this.canActivate(p, o, entry, opts)) acts.push({ type: "activate", card: o, idx: entry.i, ab: entry.ab });
      return acts;
    }
    /* Cycling: pay, discard it, draw a card. */
    async cycle(p, o) {
      if (o.zone !== "hand" || !o.def.cycling || this.over) return false;
      if (!this.pay(p, parseCost(o.def.cycling), {})) return false;
      this.log(`${p.name} cycles ${o.def.name}.`, { p, cards: [o.def.name], kind: "cycle" });
      this.discard(p, o);
      this.draw(p, 1);
      this.emit("cycle", { p, o });
      await this.settle();
      return true;
    }
    /* Channel: pay, discard the card from your hand, then the ability happens (Boseiju, Eiganjo). */
    channelCost(p, o) {
      const c = parseCost(o.def.channel.cost);
      if (o.def.channel.costReduce) c.g = Math.max(0, c.g - o.def.channel.costReduce(this, p, o));
      return c;
    }
    canChannel(p, o) {
      const ch = o.def.channel;
      if (!ch || this.over || p.lost || o.zone !== "hand") return false;
      for (const spec of ch.targets || []) if (!spec.optional && !this.targetOptions(p, spec, o).length) return false;
      return this.canPay(p, this.channelCost(p, o), { for: "ability" });
    }
    async channel(p, o, choice) {
      if (!this.canChannel(p, o)) return false;
      const ch = o.def.channel, ctx = { p, src: o, targets: [], legal: [], x: 0 };
      for (const spec of ch.targets || []) {
        const t = await this.chooseTarget(p, spec, o);
        if (!t && !spec.optional) return false;
        ctx.targets.push(t);
      }
      if (!this.pay(p, this.channelCost(p, o), { for: "ability" })) return false;
      this.log(`${p.name} channels ${o.def.name}${ctx.targets.filter(Boolean).length ? " targeting " + ctx.targets.filter(Boolean).map(t => this.nameOf(t)).join(" and ") : ""}.`, { p, cards: [o.def.name], kind: "ability" });
      this.discard(p, o);
      await this.settle();
      try {
        (ch.targets || []).forEach((spec, i) => { const t = ctx.targets[i]; ctx.legal[i] = !!t && this.legalTarget(p, spec, t, o); });
        await ch.do(this, o, ctx);
      } catch (e) { this.warn(e, o); }
      await this.settle();
      return true;
    }
    async perform(p, act) {
      if (!act || this.over) return false;
      if (act.type === "land") return this.playLand(p, act.card, act.back);
      if (act.type === "channel") return this.channel(p, act.card, act);
      if (act.type === "cast") return this.cast(p, act.card, act);
      if (act.type === "cycle") return this.cycle(p, act.card);
      if (act.type === "activate") {
        const n = Math.max(1, act.repeat || 1);
        let ok = false, done = 0, raised = false;
        const life0 = this.players.map(q => q.life);
        try {
          for (let k = 0; k < n; k++) {
            if (k > 0) {
              const entry = this.findAbility(act.card, act.idx);
              if (!entry || !this.canActivate(p, act.card, entry)) break;
              if (act.script) p.script = act.script.slice();
              if (act.stop && act.stop(this)) break;
              if (!raised) { raised = true; this.quiet = (this.quiet || 0) + 1; }
            }
            if (act.record) p.recording = [];
            ok = await this.activate(p, act.card, act.idx, act);
            if (act.record) { act.script = p.recording; p.recording = null; }
            if (ok) done++;
            if (!ok || this.over) break;
          }
        } finally {
          if (raised) this.quiet = Math.max(0, (this.quiet || 0) - 1);
        }
        if (done > 1) {
          const moved = this.players.map((q, i) => ({ q, d: q.life - life0[i] })).filter(x => x.d).map(x => `${x.q.name} ${x.d > 0 ? "+" : ""}${x.d}`).join(", ");
          this.log(`${p.name} repeats that ${done} times${moved ? " (life: " + moved + ")" : ""}.`, { p, kind: "repeat", cards: [act.card.def.name] });
        }
        p.script = null;
        return ok;
      }
      return false;
    }

    /* ------------------------------------------------ combat */
    attackTargets(p) {
      const out = [];
      for (const q of this.opponents(p)) {
        out.push(q);
        for (const o of this.battlefield) if (o.controller === q && this.isPlaneswalker(o)) out.push(o);
      }
      return out;
    }
    canAttack(o, p) {
      if (this.noAttackTurn === this.turn) return false; // a kicked Orim's Chant
      return o.controller === p && o.zone === "battlefield" && this.isCreature(o) && !o.tapped && (!o.sick || this.kw(o, "haste")) && !this.kw(o, "defender") && !this.ch(o).cantAttack;
    }
    canBlock(b, a) {
      if (!this.isCreature(b) || b.tapped || b.zone !== "battlefield") return false;
      if (this.ch(b).cantBlock) return false;
      if (this.ch(a).unblockable) return false;
      if (this.protectedFrom(a, b)) return false;
      if (this.kw(a, "flying") && !this.kw(b, "flying") && !this.kw(b, "reach")) return false;
      if (this.kw(a, "shadow") && !this.kw(b, "shadow")) return false;
      if (this.kw(a, "fear") && !this.isArtifact(b) && !this.colorsOf(b).has("B")) return false;
      if (a.def.canBeBlockedBy && !a.def.canBeBlockedBy(this, a, b)) return false;
      if (this.kw(a, "mountainwalk") && this.battlefield.some(x => x.controller === b.controller && x.def.subtypes.includes("Mountain"))) return false;
      if (this.kw(a, "islandwalk") && this.battlefield.some(x => x.controller === b.controller && x.def.subtypes.includes("Island"))) return false;
      if (this.kw(a, "forestwalk") && this.battlefield.some(x => x.controller === b.controller && x.def.subtypes.includes("Forest"))) return false;
      if (this.kw(a, "plainswalk") && this.battlefield.some(x => x.controller === b.controller && x.def.subtypes.includes("Plains"))) return false;
      if (this.kw(a, "swampwalk") && this.battlefield.some(x => x.controller === b.controller && x.def.subtypes.includes("Swamp"))) return false;
      return true;
    }
    defenderOf(t) { return this.isPlayer(t) ? t : t.controller; }
    removeFromCombat(o) {
      const c = this.combat; if (!c) return;
      c.attackers = c.attackers.filter(a => a !== o);
      for (const a of c.attackers) if (a.combat) a.combat.blockedBy = a.combat.blockedBy.filter(b => b !== o);
      o.combat = null;
    }
    async doCombat(p, opts) {
      this.combat = { attacker: p, attackers: [], blocks: [] };
      this.phase = "combat";
      this.bump();
      this.emit("beginCombat", { p });
      await this.settle();
      if (this.over) return;
      // beginning of combat step: the players may act before attackers are declared (tap or kill a would-be attacker)
      await this.stepWindow(p, "beginCombat");
      if (this.over || !this.combat) return;
      // declare attackers
      const candidates = this.creatures(p).filter(o => this.canAttack(o, p));
      if (!candidates.length || (opts && opts.noAttack)) { if (this.opts.legacySteps) { this.combat = null; return; } return this.endCombat(p, true); }
      this.phase = "attackers";
      this.bump();
      let decl = await p.agent.attack(this, p, { candidates, targets: this.attackTargets(p) });
      decl = (decl || []).filter(d => d && d.attacker && this.canAttack(d.attacker, p) && this.attackTargets(p).includes(d.target));
      const seen = new Set();
      decl = decl.filter(d => !seen.has(d.attacker.id) && seen.add(d.attacker.id));
      // "attacks that player this turn if able"
      for (const o of candidates) {
        const must = o.state.mustAttack;
        if (!must || must.lost) continue;
        const d = decl.find(x => x.attacker === o);
        if (d) d.target = must; else decl.push({ attacker: o, target: must });
      }
      if (!decl.length) { if (this.opts.legacySteps) { this.combat = null; this.phase = "main2"; this.bump(); return; } return this.endCombat(p, true); }
      for (const d of decl) {
        const a = d.attacker;
        if (!this.kw(a, "vigilance")) a.tapped = true;
        a.combat = { attacking: d.target, blockedBy: [], wasBlocked: false, declared: true };
        this.combat.attackers.push(a);
        // who attacked whom this turn, and with what (Ramses, Assassin Lord)
        const q = this.defenderOf(d.target);
        q.attackedBy.push({ by: p, o: a, assassin: this.hasSub(a, "Assassin"), turn: this.turn });
      }
      this.bump();
      const byTarget = new Map();
      for (const d of decl) { const k = this.nameOf(d.target); byTarget.set(k, (byTarget.get(k) || 0) + 1); }
      this.log(`${p.name} attacks with ${decl.length} creature${decl.length > 1 ? "s" : ""}: ${[...byTarget].map(([k, n]) => `${n} at ${k}`).join(", ")}.`, { p, kind: "attack", cards: decl.map(d => d.attacker.def.name) });
      this.anim("attack", { p, decl });
      this.emit("attack", { p, attackers: decl.map(d => d.attacker) });
      for (const d of decl) this.emit("attacks", { o: d.attacker, target: d.target, p });
      await this.settle();
      await this.pace("attack", { p });
      if (this.over) return;
      // declare attackers step: the players may act before blockers (kill an attacker, tap a blocker)
      await this.trickWindow(p, "attackers");
      if (this.over) return;
      if (!this.combat.attackers.length) return this.endCombat(p);
      // declare blockers, each defending player in turn order
      this.phase = "blockers";
      this.bump();
      const defenders = this.orderFrom(p).slice(1);
      for (const q of defenders) {
        const incoming = this.combat.attackers.filter(a => a.combat && this.defenderOf(a.combat.attacking) === q);
        if (!incoming.length || q.lost) continue;
        let blocks = await q.agent.block(this, q, { attackers: incoming });
        blocks = this.validateBlocks(q, incoming, blocks || []);
        for (const b of blocks) {
          b.attacker.combat.blockedBy.push(b.blocker);
          b.attacker.combat.wasBlocked = true;
          b.blocker.combat = { blocking: b.attacker };
        }
        if (blocks.length) {
          this.log(`${q.name} blocks: ${blocks.map(b => `${b.blocker.def.name} blocks ${b.attacker.def.name}`).join(", ")}.`, { p: q, kind: "block", cards: blocks.map(b => b.blocker.def.name) });
          this.anim("block", { q, blocks });
          for (const b of blocks) this.emit("blocks", { o: b.blocker, attacker: b.attacker, p: q });
          for (const a of new Set(blocks.map(b => b.attacker))) this.emit("blocked", { o: a, blockers: a.combat.blockedBy, p: a.controller });
        }
      }
      await this.settle();
      if (this.over) return;
      // combat tricks: active player first, then the others
      this.phase = "damage";
      this.bump();
      await this.trickWindow(p);
      if (this.over) return;
      // damage
      const fs = this.combat.attackers.some(a => this.kw(a, "first strike") || this.kw(a, "double strike")) ||
        this.combat.attackers.some(a => a.combat && a.combat.blockedBy.some(b => this.kw(b, "first strike") || this.kw(b, "double strike")));
      // each combat damage step ends with a priority window (510.3)
      if (fs) { await this.damageStep(true); if (this.over) return; await this.trickWindow(p, "damage"); if (this.over || !this.combat) return; }
      await this.damageStep(false);
      if (this.over) return;
      await this.trickWindow(p, "damage");
      if (this.over) return;
      await this.endCombat(p);
    }
    /* End of combat step: its triggers, then a priority window (511.1-2), then creatures leave
       combat. It happens even when no creature attacked (508.8). */
    async endCombat(p, noAttack) {
      this.phase = "endCombat";
      this.bump();
      this.emit("endCombat", { p, noAttack: !!noAttack });
      for (const o of this.battlefield.slice()) if (o.state.exileEoc) this.exile(o);
      if (!this.opts.legacySteps) {
        await this.settle();
        if (this.over) return;
        await this.stepWindow(p, "endCombat");
        if (this.over) return;
      }
      this.effects = this.effects.filter(e => e.until !== "eoc");
      for (const o of this.battlefield) o.combat = null;
      this.combat = null;
      this.bump();
      await this.settle();
    }
    /* Priority in a step where the stack is empty (upkeep, draw, beginning and end of combat):
       each player in turn order from the active player may cast instants and activate abilities.
       Games recorded before engine 5 (legacySteps) had no such windows. */
    async stepWindow(active, win) {
      if (this.opts.legacySteps) return;
      for (const q of this.orderFrom(active)) {
        if (this.over || q.lost) continue;
        let n = 0;
        while (n++ < 12) {
          const act = await this.askRespond(q, { window: win, turnOf: active });
          if (!act) break;
          const ok = await this.perform(q, act);
          if (this.over) return;
          if (!ok && q.agent.bot) break;
        }
      }
    }
    validateBlocks(q, incoming, blocks) {
      const used = new Set();
      const out = [];
      for (const b of blocks) {
        if (!b || !b.blocker || !b.attacker) continue;
        if (b.blocker.controller !== q || used.has(b.blocker.id)) continue;
        if (!incoming.includes(b.attacker)) continue;
        if (!this.canBlock(b.blocker, b.attacker)) continue;
        used.add(b.blocker.id);
        out.push(b);
      }
      // menace: needs two or more blockers
      const fixed = [];
      for (const b of out) {
        if (this.kw(b.attacker, "menace") && out.filter(x => x.attacker === b.attacker).length < 2) continue;
        fixed.push(b);
      }
      return fixed;
    }
    async trickWindow(active, win) {
      if (win === "damage" && this.opts.legacySteps) return;
      for (const q of this.orderFrom(active)) {
        if (this.over || q.lost) continue;
        let n = 0;
        while (n++ < 12) {
          if (!this.combat) return;
          const act = await this.askRespond(q, { window: win || "combat", turnOf: active });
          if (!act) break;
          const ok = await this.perform(q, act);
          if (this.over) return;
          if (!ok && q.agent.bot) break;
        }
      }
    }
    /* One combat damage step. All damage is dealt at once, then lifelink, then SBAs. */
    async damageStep(first) {
      const c = this.combat;
      if (!c) return;
      // the regular step: creatures that didn't strike in this combat's first-strike step, and double strikers (510.4).
      // Kept per combat, so a creature that struck first in an earlier combat this turn still deals damage in a later one.
      const struck = c.struckFirst || (c.struckFirst = new Set());
      const strikes = o => first ? (this.kw(o, "first strike") || this.kw(o, "double strike")) : (!struck.has(o) || this.kw(o, "double strike"));
      const events = [];
      for (const a of c.attackers) {
        if (a.zone !== "battlefield" || !a.combat) continue;
        const blockers = a.combat.blockedBy.filter(b => b.zone === "battlefield");
        if (strikes(a)) {
          let dmg = Math.max(0, this.power(a));
          if (a.combat.wasBlocked) {
            if (!blockers.length) {
              if (this.kw(a, "trample") && dmg > 0) events.push({ src: a, target: this.liveTarget(a.combat.attacking), n: dmg });
            } else {
              const split = await this.assignCombatDamage(a, blockers, dmg);
              for (const [b, n] of split.blockers) events.push({ src: a, target: b, n });
              if (split.player > 0) events.push({ src: a, target: this.liveTarget(a.combat.attacking), n: split.player });
            }
          } else if (dmg > 0) {
            events.push({ src: a, target: this.liveTarget(a.combat.attacking), n: dmg });
          }
          if (first) struck.add(a);
        }
        for (const b of blockers) {
          if (!strikes(b)) continue;
          if (first) struck.add(b);
          const n = Math.max(0, this.power(b));
          if (n > 0) events.push({ src: b, target: a, n });
        }
      }
      if (!events.length) return;
      // deal it all
      const lifelinkBySource = new Map();
      for (const e of events) {
        if (!e.target) continue;
        const dealt = this.damage(e.src, e.target, e.n, { combat: true, deferLifelink: true });
        if (dealt > 0 && this.kw(e.src, "lifelink")) lifelinkBySource.set(e.src, (lifelinkBySource.get(e.src) || 0) + dealt);
      }
      for (const [src, n] of lifelinkBySource) this.gainLife(src.controller, n, src);
      this.anim("combatDamage", { events });
      // "whenever one or more creatures you control deal combat damage to a player"
      const hits = events.filter(e => e.target && this.isPlayer(e.target) && e.n > 0 && e.src);
      if (hits.length) this.emit("combatDamageStep", { hits: hits.map(e => ({ src: e.src, p: e.target, amount: e.n, controller: e.src.controller })) });
      await this.settle();
      await this.pace("damage", {});
    }
    /* How a blocked attacker's combat damage is divided among its blockers (510.1c-d). The attacking
       player divides it as they like; with trample, each blocker must be assigned lethal damage
       (1 with deathtouch, counting damage already marked) before the rest can go to the player or
       planeswalker it attacks. The bots, and a person with one blocker, get the default: lethal
       damage to each blocker in turn, the easiest first, then the rest to the last one or, with
       trample, past them. A person with two or more blockers chooses (purpose "combatDamage"). */
    async assignCombatDamage(a, blockers, dmg) {
      const tr = this.kw(a, "trample");
      const lethal = b => (this.kw(a, "deathtouch") ? 1 : Math.max(1, this.lethalDamageLeft(b)));
      const auto = new Map();
      let left = dmg;
      const order = blockers.slice().sort((x, y) => this.lethalDamageLeft(x) - this.lethalDamageLeft(y));
      for (let i = 0; i < order.length && left > 0; i++) {
        const b = order[i];
        let give = Math.min(left, lethal(b));
        if (i === order.length - 1 && !tr) give = left;
        auto.set(b, give);
        left -= give;
      }
      const def = { blockers: [...auto], player: tr ? left : 0 };
      const p = a.controller;
      if (blockers.length < 2 || dmg <= 0 || !p.agent || p.agent.bot || this.opts.legacySteps) return def;
      const suggest = {};
      for (const [b, n] of auto) suggest[b.id] = n;
      const into = tr ? this.liveTarget(a.combat.attacking) : null;
      const ans = await this.ask(p, {
        type: "distribute", total: dmg, options: blockers.slice(), purpose: "combatDamage", src: a, suggest, trample: tr,
        prompt: `${a.def.name}: divide ${dmg} combat damage among its blockers` + (tr ? ` (lethal damage to each first; the rest tramples over to ${into ? this.nameOf(into) : "nothing"})` : "")
      });
      if (!ans || typeof ans !== "object") return def;
      // the answer, made legal: amounts in range, then any damage left unassigned placed
      const got = new Map();
      let used = 0;
      for (const b of blockers) { const n = Math.max(0, Math.min(dmg - used, Math.floor(+ans[b.id] || 0))); got.set(b, n); used += n; }
      left = dmg - used;
      if (tr) {
        for (const b of blockers) { const k = Math.min(Math.max(0, lethal(b) - got.get(b)), left); got.set(b, got.get(b) + k); left -= k; }
      } else if (left > 0) {
        const most = blockers.reduce((m, b) => (got.get(b) > got.get(m) ? b : m), blockers[0]);
        got.set(most, got.get(most) + left); left = 0;
      }
      return { blockers: [...got].filter(([, n]) => n > 0), player: left };
    }
    liveTarget(t) {
      if (this.isPlayer(t)) return t.lost ? null : t;
      return t.zone === "battlefield" ? t : null;
    }

    /* ------------------------------------------------ state-based actions */
    checkSBA() {
      let loops = 0;
      while (loops++ < 50) {
        let changed = false;
        // players
        for (const p of this.players) {
          if (p.lost) continue;
          let why = "";
          if (p.life <= 0) why = "life";
          else if (p.poison >= 10) why = "poison";
          else if (Object.values(p.cmdDmg).some(n => n >= 21)) why = "commander";
          else if (p.drewFromEmpty) why = "library";
          if (why) { this.lose(p, why); changed = true; }
        }
        if (this.over) return;
        const dead = [];
        for (const o of this.battlefield) {
          if (this.isCreature(o)) {
            const t = this.toughness(o);
            if (t <= 0) { dead.push(o); continue; }
            if ((o.damage >= t || (o.dtDamage && o.damage > 0)) && !this.kw(o, "indestructible")) {
              if (this.useRegen(o)) { changed = true; continue; }
              dead.push(o); continue;
            }
          }
          if (this.isPlaneswalker(o) && !this.isCreature(o) && (o.counters.loyalty || 0) <= 0) { dead.push(o); continue; }
          if (o.counters.p1 && o.counters.m1) { const k = Math.min(o.counters.p1, o.counters.m1); o.counters.p1 -= k; o.counters.m1 -= k; changed = true; this.bump(); }
          if (o.def.aura) {
            const t = o.attachedTo;
            if (!t || t.zone !== "battlefield" || (o.def.enchant && !this.kindMatch(t, o.def.enchant))) { dead.push(o); continue; }
          } else if (o.attachedTo && (o.attachedTo.zone !== "battlefield" || !this.isCreature(o.attachedTo))) { o.attachedTo = null; changed = true; this.bump(); }
        }
        // the legend rule is a choice, so it's applied by legendRule() before each priority
        if (dead.length) {
          this.toGraveyardFromBattlefield(dead, "sba");
          changed = true;
        }
        if (!changed) break;
      }
    }
    lose(p, why) {
      if (p.lost) return;
      p.lost = true; p.lostReason = why;
      const text = { life: "has no life left", poison: "has 10 poison counters", commander: "took 21 commander damage", library: "had to draw from an empty library", concede: "conceded", alt: "lost to an alternate win" }[why] || "lost";
      this.log(`${p.name} ${text} and is out of the game.`, { p, kind: "lose" });
      this.anim("lose", { p, why });
      // their things leave the game, and things they control but don't own go back to their owners
      for (const o of this.battlefield.slice()) {
        if (o.owner !== p && o.controller !== p) continue;
        if (this.combat) this.removeFromCombat(o);
        if (o.owner === p || o.owner.lost) { this.removeFromZone(o); o.zone = "gone"; continue; }
        o.controller = o.owner; o.sick = true; delete o.state.dieAtEnd;
        this.log(`${o.def.name} returns to ${o.owner.name}.`, { p: o.owner, cards: [o.def.name] });
      }
      // Equipment left on the battlefield falls off whatever just left, and Auras on it go to the graveyard
      for (const o of this.battlefield) if (o.attachedTo && o.attachedTo.zone !== "battlefield" && !o.def.aura) o.attachedTo = null;
      const orphans = this.battlefield.filter(o => o.def.aura && o.attachedTo && o.attachedTo.zone !== "battlefield");
      if (orphans.length) this.toGraveyardFromBattlefield(orphans, "sba");
      this.stack = this.stack.filter(it => it.p !== p);
      this.bump();
      this.emit("playerLost", { p });
      const alive = this.living();
      if (alive.length <= 1) this.end(alive[0] || null);
      else if (p.human && this.opts.endOnHumanLoss) this.end(null, { humanLost: true });
    }
    win(p, why) {
      this.log(`${p.name} wins the game${why ? " with " + why : ""}!`, { p, kind: "win" });
      for (const q of this.opponents(p)) { q.lost = true; q.lostReason = "alt"; }
      this.end(p);
    }
    end(winner, extra) {
      if (this.over) return;
      this.over = true;
      this.winner = winner;
      this.endInfo = extra || {};
      this.bump();
      this.anim("gameOver", { winner });
      if (winner) this.log(`${winner.name} wins.`, { p: winner, kind: "win" });
    }

    /* ------------------------------------------------ turn structure */
    async play() {
      // a puzzle (the practice drills) sets up its own board instead of shuffling and mulligans
      if (this.opts.setup) { await this.opts.setup(this); await this.settle(); this.bump(); }
      else await this.mulligans();
      this.round = this.opts.round || 1;
      // a round ends when play passes the seat that went first, which need not be seat 0
      const n = this.players.length, first = this.activeIdx, seat = i => (i - first + n) % n;
      let normal = this.active;       // whose regular turn it is or was last (extra turns come after it)
      let extra = false;
      while (!this.over) {
        const p = this.active;
        if (!p.lost) {
          // "skip your next turn" (Wormfang Manta) applies to the next turn, extra or not
          if (p.skipTurns > 0) { p.skipTurns--; this.log(`${p.name} skips ${extra ? "that extra" : "their"} turn.`, { p, kind: "skip" }); }
          else await this.takeTurn(p, { extra });
        }
        if (this.over) break;
        if (this.opts.stopAtTurn && this.turn >= this.opts.stopAtTurn) { this.log("The puzzle's turn is over."); this.end(null, { puzzleEnd: true }); break; }
        if (this.turn >= this.maxTurns) { this.log("The turn limit was reached. The game is a draw."); this.end(null, { draw: true }); break; }
        // extra turns are taken right after this one, the most recently created first
        let e = null;
        while (this.extraTurns.length && !e) { const c = this.extraTurns.pop(); if (!c.p.lost) e = c; }
        if (e) { this.activeIdx = e.p.idx; extra = true; continue; }
        extra = false;
        const next = this.seatAfter(normal);
        if (seat(next.idx) <= seat(normal.idx)) this.round++;
        normal = next;
        this.activeIdx = next.idx;
      }
      return this.winner;
    }
    /* "Take an extra turn after this one" (Wormfang Manta, Time Warp). */
    addExtraTurn(p, src) {
      this.extraTurns.push({ p, src });
      this.log(`${p.name} will take an extra turn after this one${src && src.def ? " (" + src.def.name + ")" : ""}.`, { p, cards: src && src.def ? [src.def.name] : [], kind: "extraTurn" });
      this.bump();
    }
    /* "You skip your next turn." */
    skipNextTurn(p, src) {
      p.skipTurns = (p.skipTurns || 0) + 1;
      this.log(`${p.name} will skip their next turn${src && src.def ? " (" + src.def.name + ")" : ""}.`, { p, cards: src && src.def ? [src.def.name] : [] });
      this.bump();
    }
    /* "After this phase, there is an additional combat phase" (opts.main: "followed by an
       additional main phase"). Simplified: it comes right after this turn's regular combat. */
    addExtraCombat(p, opts) {
      this.extraCombats.push(Object.assign({ p, turn: this.turn }, opts || {}));
      this.log(`${p.name} gets an additional combat phase this turn.`, { p });
      this.bump();
    }
    async mulligans() {
      for (const p of this.players) { this.shuffle(p); }
      for (const p of this.players) {
        let mulls = 0;
        for (;;) {
          this.draw(p, 7);
          const keep = mulls >= 5 ? true : await p.agent.mulligan(this, p, { hand: p.hand.slice(), mulls });
          if (keep) break;
          mulls++;
          this.log(`${p.name} mulligans${mulls === 1 ? " (the first one is free)" : ""}.`, { p, kind: "mull" });
          for (const o of p.hand.slice()) { this.removeFromZone(o); o.zone = "library"; p.library.push(o); }
          this.shuffle(p);
        }
        p.mulls = mulls;
        const bottom = Math.max(0, mulls - 1);
        if (bottom > 0) {
          const pick = await this.ask(p, { type: "cards", prompt: `Put ${bottom} card${bottom > 1 ? "s" : ""} on the bottom of your library`, options: p.hand.slice(), min: bottom, max: bottom, purpose: "bottom" });
          for (const o of (pick || []).slice(0, bottom)) { this.removeFromZone(o); o.zone = "library"; p.library.push(o); }
          while (p.hand.length > 7 - bottom) { const o = p.hand[p.hand.length - 1]; this.removeFromZone(o); o.zone = "library"; p.library.push(o); }
        }
        this.log(`${p.name} keeps ${p.hand.length} cards.`, { p, kind: "keep" });
      }
      // "if this card is in your opening hand, you may begin the game with it on the battlefield"
      for (const p of this.players) for (const o of p.hand.slice()) {
        if (!o.def.openingHand) continue;
        if (o.def.openingHandIf && !o.def.openingHandIf(this, p)) continue;
        const ok = await this.ask(p, { type: "confirm", prompt: `Begin the game with ${o.def.name} on the battlefield?`, src: o, purpose: "leyline" });
        if (!ok) continue;
        this.putOntoBattlefield([o], p);
        this.log(`${p.name} begins the game with ${o.def.name} on the battlefield.`, { p, cards: [o.def.name] });
        if (o.def.onOpeningHand) { try { await o.def.onOpeningHand(this, p, o); } catch (e) { this.warn(e, o); } }
      }
      await this.settle();
      this.bump();
    }
    async takeTurn(p, opts) {
      opts = opts || {};
      this.turn++;
      p.turnsTaken++;
      this.extraCombats = [];
      for (const q of this.players) { q.gained = 0; q.lifeLostThisTurn = 0; q.spellsCast = 0; q.ncCast = 0; q.attackedBy = []; q.drawnThisTurn = []; }
      // "until your next turn" protection ends (Teferi's Protection, The One Ring)
      if (p.shield || p.lifeLock) { p.shield = null; p.lifeLock = null; this.log(`${p.name}'s protection ends.`, { p }); }
      this.diedThisTurn = 0;
      this.spellsThisTurn = 0;
      p.landsPlayed = 0;
      this.loopHint = null;
      this.effects = this.effects.filter(e => !(e.until === "yourNextTurn" && e.player === p));
      this.log(`Turn ${this.turn}: ${p.name}${opts.extra ? " (extra turn)" : ""}.`, { p, kind: "turn", extra: !!opts.extra });
      this.anim("turn", { p });
      // untap (phased-out permanents phase in first)
      this.phase = "untap";
      this.phaseIn(p);
      const untapped = [];
      for (const o of this.battlefield) {
        if (o.controller === p) {
          o.sick = false;
          if (o.skipUntap) { o.skipUntap = false; continue; }
          if (o.def.doesntUntap && o.def.doesntUntap(this, o)) continue;
          if (o.tapped && o.counters.stun > 0) { o.counters.stun--; continue; } // a stun counter comes off instead
          if (o.tapped) untapped.push(o);
          o.tapped = false;
        }
      }
      // "untap each creature you control during each other player's untap step" (Prop Room and friends)
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.untapOnOthersTurn && s.controller !== p) for (const c of this.creatures(s.controller)) c.tapped = false;
      this.bump();
      if (untapped.length) this.emit("untapStep", { p, untapped });
      // upkeep
      this.phase = "upkeep";
      this.bump();
      this.emit("upkeep", { p });
      this.runDelayed("upkeep", p);
      await this.settle();
      if (this.over || p.lost) return this.endTurnEarly(p);
      await this.stepWindow(p, "upkeep");
      if (this.over || p.lost) return this.endTurnEarly(p);
      // draw
      this.phase = "draw";
      const skipDraw = this.turn === 1 && (this.players.length === 2 || !!this.opts.setup);   // a puzzle starts after the draw
      if (!skipDraw) this.draw(p, 1);
      this.emit("drawStep", { p });
      await this.settle();
      if (this.over || p.lost) return this.endTurnEarly(p);
      await this.stepWindow(p, "draw");
      if (this.over || p.lost) return this.endTurnEarly(p);
      // main 1 (Sagas get their lore counter first)
      this.phase = "main1";
      this.emptyPools();
      this.bump();
      for (const o of this.battlefield.slice()) if (o.controller === p && o.def.saga) { o.counters.lore = (o.counters.lore || 0) + 1; this.sagaChapter(o); }
      this.emit("precombatMain", { p });
      await this.settle();
      if (this.over || p.lost) return this.endTurnEarly(p);
      const res = await this.mainPhase(p);
      if (this.over || p.lost) return this.endTurnEarly(p);
      // combat
      this.emptyPools();
      // "End the turn" in the first main phase still goes through the combat phase, with no attackers,
      // so "at the beginning of combat" triggers happen (records before engine 5 skipped it)
      if (!res || !res.skipCombat) await this.doCombat(p);
      else if (!this.opts.legacySteps) await this.doCombat(p, { noAttack: true });
      if (this.over || p.lost) return this.endTurnEarly(p);
      // additional combat phases (and main phases) added this turn
      for (let k = 0; k < 10 && this.extraCombats.length; k++) {
        const ec = this.extraCombats.shift();
        if (ec.p !== p || ec.turn !== this.turn) continue;
        this.emptyPools();
        await this.doCombat(p);
        if (this.over || p.lost) return this.endTurnEarly(p);
        if (ec.main) {
          this.phase = "main2"; this.emptyPools(); this.bump();
          await this.mainPhase(p);
          if (this.over || p.lost) return this.endTurnEarly(p);
        }
      }
      // main 2
      this.phase = "main2";
      this.emptyPools();
      this.bump();
      await this.mainPhase(p);
      if (this.over || p.lost) return this.endTurnEarly(p);
      // end step
      this.phase = "end";
      this.emptyPools();
      this.bump();
      this.emit("endStep", { p });
      this.runDelayed("endStep", p);
      await this.settle();
      if (this.over || p.lost) return this.endTurnEarly(p);
      // others may act at the end of the turn (instants, populate, flash)
      for (const q of this.orderFrom(p).slice(1)) {
        if (this.over) return;
        let n = 0;
        while (n++ < 12) {
          const act = await this.askRespond(q, { window: "end", turnOf: p });
          if (!act) break;
          const ok = await this.perform(q, act);
          if (!ok && q.agent.bot) break;
        }
      }
      if (this.over) return;
      // cleanup
      this.phase = "cleanup";
      const max = this.maxHand(p);
      if (p.hand.length > max) {
        const n = p.hand.length - max;
        const pick = await this.ask(p, { type: "cards", prompt: `Discard ${n} card${n > 1 ? "s" : ""} down to ${max}`, options: p.hand.slice(), min: n, max: n, purpose: "discard" });
        for (const o of (pick || []).slice(0, n)) this.discard(p, o);
        while (p.hand.length > max) this.discard(p, p.hand[p.hand.length - 1]);
      }
      this.cleanupEffects();
      await this.settle();
    }
    cleanupEffects() {
      for (const o of this.battlefield) { o.damage = 0; o.dtDamage = false; }
      if (this.castBans.length) this.castBans = [];
      if (this.tempTriggers.length) { this.tempTriggers = []; this.ts++; }
      this.effects = this.effects.filter(e => e.until !== "eot" && e.until !== "eoc");
      this.combat = null;
      this.emptyPools();
      this.bump();
    }
    endTurnEarly(p) {
      if (!this.over) this.cleanupEffects();
    }
    maxHand(p) {
      for (const s of this.staticSources()) for (const st of this.staticsOf(s)) if (st.noMaxHand && s.controller === p) return Infinity;
      return 7;
    }
    runDelayed(at, p) {
      const due = this.delayed.filter(d => d.at === at && (!d.player || d.player === p) && (!d.turn || d.turn <= this.turn));
      this.delayed = this.delayed.filter(d => !due.includes(d) || !d.once);
      for (const d of due) this.pending.push({ src: d.src || { def: { name: "Delayed trigger" }, controller: d.controller || p }, tr: { do: d.do }, ev: { p }, controller: d.controller || p });
    }
    async mainPhase(p) {
      let n = 0;
      while (!this.over && !p.lost && n++ < 400) {
        const act = await p.agent.main(this, p, { phase: this.phase });
        if (!act || act.type === "pass") return act || { type: "pass" };
        await this.perform(p, act);
        await this.settle();
      }
      return { type: "pass" };
    }
  }

  function scanBatch(g, b, type, ev, found) {
    for (const tr of b.o.def.triggers) {
      if (tr.on !== type || tr.self) continue;
      if (tr.zone && tr.zone !== "battlefield") continue;
      try { if (tr.when && !tr.when(g, b.o, ev, b.lki)) continue; } catch (e) { continue; }
      found.push({ src: b.o, tr, ev, controller: b.lki.controller });
    }
  }

  MK.Game = Game;
  MK.util = { parseCost, cloneCost, addCost, costMV, costColors, parseType };
})(typeof window !== "undefined" ? window : globalThis);
