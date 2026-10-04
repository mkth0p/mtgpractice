/* Miku Commander: the table on the Play tab. It draws the game, runs the human seat (every
   engine question becomes a tap), paces the bots so their turns can be followed, and keeps a
   small record of your games. Needs engine.js, the card files, ai.js and ../kit.js. */
(function (root) {
  "use strict";
  const MK = root.MK, K = root.MikuKit;
  const esc = K.esc, mana = K.mana;

  /* The site that hosts the table sets MK_SITE before loading this file (the Etrata pages do):
     its storage prefix, which hero decks the player picks from, and the lobby's words. */
  const SITE = Object.assign({
    key: "mikuWiki", hero: "miku", defaultHero: "miku", heroOrder: ["miku-precon", "miku-budget", "miku", "azusa", "corrupted"],
    title: "Take Miku to a<br><span>four-player pod</span>",
    lede: "Your Miku deck against bots dealt at random: precons for a fair fight, or Bracket 4 decks when you want to be punished. Pick the precon, the budget upgrade, the full upgrade or the Bracket 4 Azusa build. Mana is paid for you, everything else is real Commander: the stack, combat, commander tax and damage, and every card in your deck."
  }, root.MK_SITE || {});
  const SETTINGS_KEY = SITE.key + ".game.settings.v1";
  const STATS_KEY = SITE.key + ".game.stats.v1";
  const DEFAULTS = { opponents: 3, level: "sharp", speed: "normal", pool: "precon", askTriggers: false, stopOnSpells: false, companion: true, picks: [], hero: SITE.defaultHero };
  // which bot decks can be dealt: precons and upgraded decks (Brackets 2 and 3), Bracket 4 decks, or both
  const POOLS = [["precon", "Casual", "Precons and upgraded decks (Brackets 2 and 3)"], ["mixed", "Mixed", "Every deck"], ["b4", "Bracket 4", "Bracket 4 decks"]];
  const bracketOf = d => d.bracket || 4;
  const inPool = (d, pool) => pool === "mixed" || (pool === "b4" ? bracketOf(d) >= 4 : bracketOf(d) < 4);
  // "Elven Empire (Kaldheim Commander, 2021)" becomes "Precon: Elven Empire, Kaldheim Commander, 2021" with the name in bold
  const preconLine = t => { const m = /^(.*?)\s*\((.*)\)$/.exec(t); return m ? `Precon: <b>${esc(m[1])}</b>, ${esc(m[2])}` : `Precon: <b>${esc(t)}</b>`; };
  const SPEED = {
    slow: { think: 650, cast: 1500, attack: 950, damage: 850, banner: 1300, block: 700 },
    normal: { think: 360, cast: 950, attack: 620, damage: 560, banner: 1050, block: 420 },
    fast: { think: 110, cast: 460, attack: 300, damage: 280, banner: 650, block: 160 }
  };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduced = () => root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const settings = () => Object.assign({}, DEFAULTS, K.store.json(SETTINGS_KEY, {}));
  const saveSettings = s => K.store.put(SETTINGS_KEY, s);
  const WHEN = { now: "This turn", next: "Next turn", later: "Later", blocked: "Blocked" };
  const PLAYER_COLORS = ["#39c5bb", "#ff3d8b", "#ffd166", "#8fb8ff", "#b58cff", "#7ee0a1"];
  const COLOR_BG = { W: "#7d6f45", U: "#2d5a80", B: "#3e3542", R: "#86382a", G: "#2c6a3d", C: "#50575e" };
  // mana floating in your pool (Devoted Druid's loop)
  const poolHTML = p => {
    const ks = ["W", "U", "B", "R", "G", "C"].filter(k => (p.pool[k] || 0) > 0);
    return ks.length ? `<div class="mg-pool" title="Mana in your pool">${ks.map(k => `<span>${mana("{" + k + "}")}<b>${p.pool[k]}</b></span>`).join("")}</div>` : "";
  };
  const KW_ICON = { flying: "✈", trample: "⇶", lifelink: "♥", deathtouch: "☠", "first strike": "⚔", "double strike": "⚔", vigilance: "◎", hexproof: "◇", indestructible: "⛨", haste: "»", menace: "⩚", infect: "☣", reach: "↟", defender: "▣" };

  /* ------------------------------------------------------------ card data for the screen */
  // the wiki's card data (Oracle text as printed), by full name and by front face
  const MIKU = new Map();
  for (const c of (root.MIKU_CARDS || []).concat(root.ETRATA_CARDS || [], root.CORRUPTED_CARDS || [])) { MIKU.set(c.name, c); if (c.name.includes(" // ")) MIKU.set(c.name.split(" // ")[0], c); }
  function textOf(def) {
    const m = MIKU.get(def.name);
    if (m && !def.token && !def.faceDownOf) {
      const t = m.text || (!def.doors && m.faces ? m.faces.map(f => f.name + "\n" + (f.text || "")).join("\n") : "");
      if (t || !def.doors) return t;
    }
    if (def.doors) return def.doors.map(d => d.name + " " + d.cost + "\n" + (d.text || "")).join("\n");
    if (def.text) return def.text;
    const bits = [];
    if (def.keywords && def.keywords.length) bits.push(def.keywords.map(k => k[0].toUpperCase() + k.slice(1)).join(", "));
    for (const ab of def.abilities || []) bits.push((ab.cost ? ab.cost + (ab.tap ? ", {T}" : "") : ab.tap ? "{T}" : "") + ": " + (ab.label || "Ability"));
    for (const m2 of def.mana || []) bits.push("{T}: Add mana.");
    return bits.join("\n");
  }
  /* Rules text as HTML. A Room shows each door as its own block, with its cost and, for one on
     the battlefield, whether that door is unlocked. */
  function rulesOf(def, o) {
    if (!def.doors) return K.rules(textOf(def));
    const m = MIKU.get(def.name);
    const faces = m && m.faces ? m.faces : def.doors;
    const open = o && o.zone === "battlefield" ? (o.state.doors || []) : null;
    const note = /^\(You may cast either half[^)]*\)\n?/;
    return def.doors.map((d, i) => {
      const f = faces.find(x => x.name === d.name) || d;
      const state = open ? `<span class="door ${open[i] ? "on" : ""}">${open[i] ? "unlocked" : "locked"}</span>` : "";
      return `<div class="door-h"><b>${esc(d.name)}</b> ${mana(d.cost)}${state}</div>${K.rules(String(f.text || "").replace(note, ""))}`;
    }).join("");
  }
  /* Mana cost as HTML; a Room shows both doors' costs. */
  function costOf(def) {
    if (def.cost) return mana(def.cost);
    return def.doors ? def.doors.map(d => mana(d.cost)).join(`<span class="or">/</span>`) : "";
  }
  function colorKey(def) {
    const c = def.colors || [];
    if (!c.length) return def.types && def.types.includes("Land") ? "C" : "C";
    return c.length > 1 ? "M" : c[0];
  }
  function bgFor(def) {
    const c = def.colors || [];
    if (c.length > 1) return `linear-gradient(135deg, ${COLOR_BG[c[0]]}, ${COLOR_BG[c[1]] || COLOR_BG.C})`;
    return COLOR_BG[c[0]] || COLOR_BG.C;
  }
  function artFor(def, kind) {
    if (def.token) return null;
    const a = K.art(def.name);
    return a ? a[kind || "crop"] : null;
  }
  function artStyle(def) {
    const u = artFor(def, "crop");
    return u ? `background-image:url('${u.replace(/'/g, "%27")}')` : `--c-bg:${bgFor(def)};background:${bgFor(def)}`;
  }
  const shortName = n => n.split(" // ")[0].replace(/,.*$/, "");
  /* The cost shown on a cast button: X first, then the rest ({X}{X} for Walking Ballista). */
  function wayCost(w) {
    const base = MK.costString(w.cost, null);
    return (w.xCount ? "{X}".repeat(w.xCount) : "") + (w.xCount && base === "{0}" ? "" : base);
  }
  function ptOf(g, o) {
    if (!g.isCreature(o)) return null;
    return [g.power(o), g.toughness(o)];
  }

  /* The human seat is called "You", and the engine writes "You casts". Fix the verb. */
  function youText(t) {
    t = String(t);
    if (!/\bYou\b/.test(t)) return t;
    t = t.replace(/\bYou's\b/g, "Your");
    t = t.replace(/(^|[.!?:]\s+)You (has|is|was|\w+?)(?=[\s.,!:;)]|$)/g, (m, pre, v) => {
      let w = v;
      if (v === "has") w = "have"; else if (v === "is") w = "are"; else if (v === "was") w = "were";
      else if (/ies$/.test(v)) w = v.slice(0, -3) + "y";
      else if (/(ch|sh|ss|x|z)es$/.test(v)) w = v.slice(0, -2);
      else if (/[^s]s$/.test(v)) w = v.slice(0, -1);
      return pre + "You " + w;
    });
    if (/^You /.test(t)) t = t.replace(/ and is /, " and are ").replace(/ and finds /, " and find ").replace(/ and gets /, " and get ").replace(/(,? but) (has|is|was)\b/, (m, b, v) => b + " " + { has: "have", is: "are", was: "were" }[v]);
    t = t.replace(/([^.!?:]\s)You\b/g, "$1you").replace(/([^.!?:]\s)Your\b/g, "$1your");
    // "Creatures you controls get +5/+5", "each creature you owns"
    t = t.replace(/\byou (controls|owns)\b/g, (m, v) => "you " + v.slice(0, -1));
    return t;
  }

  /* ------------------------------------------------------------ the record of your games */
  function loadStats() { return K.store.json(STATS_KEY, { games: 0, wins: 0, losses: 0, draws: 0, best: null, most: 0, life: 0, decks: {}, recent: [] }); }
  function saveStats(s) { K.store.put(STATS_KEY, s); }

  /* ================================================================ the table */
  class Table {
    constructor(opts) {
      this.opts = opts;
      this.s = settings();
      this.sp = SPEED[this.s.speed] || SPEED.normal;
      this.mode = "wait";
      this.resolver = null;
      this.focusId = null;
      this.atk = new Map();          // attacker id -> target (player or planeswalker)
      this.blk = new Map();          // blocker id -> attacker
      this.sel = null;               // selected incoming attacker when blocking
      this.floats = 0;
      this.ticker = "";
      this.elMap = new Map();
      this.build();
    }

    /* -------------------------------------------------------- DOM skeleton */
    build() {
      const el = this.el = document.createElement("div");
      el.className = "mg";
      el.setAttribute("role", "application");
      el.setAttribute("aria-label", "Commander game");
      el.innerHTML = `
        <header class="mg-top">
          <button class="mg-icon" data-act="menu" aria-label="Game menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
          <div class="mg-phase" aria-live="polite"></div>
          <button class="mg-icon mg-coachbtn" data-act="coach" aria-label="Coach: what to look for" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.4 1 1.1 1 1.8V16h5v-.3c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3z"/></svg><i class="badge"></i></button>
          <button class="mg-icon" data-act="log" aria-label="Game log"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg></button>
        </header>
        <div class="mg-seats"></div>
        <section class="mg-board opp" aria-label="Opponent's board"></section>
        <div class="mg-mid"></div>
        <section class="mg-board me" aria-label="Your board">
          <div class="mg-row cre" data-empty="Your creatures appear here"></div>
          <div class="mg-row small oth"></div>
        </section>
        <div class="mg-mybar"></div>
        <div class="mg-hand"><div class="fan"></div></div>
        <div class="mg-actions"></div>
        <div class="mg-scrim"></div>
        <div class="mg-sheet" role="dialog" aria-modal="true"><div class="grab"></div><div class="hd"></div><div class="bd"></div><div class="ft"></div></div>
        <div class="mg-rail">
          <aside class="mg-companion" aria-live="polite" hidden></aside>
          <aside class="mg-log" aria-label="Game log"><div class="hd"><h3>Game log</h3><button class="mg-icon" data-act="log" aria-label="Close log"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><ol></ol></aside>
        </div>
        <div class="mg-menu" role="menu"></div>
        <div class="mg-fx" aria-hidden="true"></div>`;
      const $ = s => el.querySelector(s);
      this.$ = { phase: $(".mg-phase"), coachBtn: $(".mg-coachbtn"), comp: $(".mg-companion"), seats: $(".mg-seats"), opp: $(".mg-board.opp"), mid: $(".mg-mid"), meCre: $(".mg-board.me .cre"), meOth: $(".mg-board.me .oth"), mybar: $(".mg-mybar"), hand: $(".mg-hand"), fan: $(".mg-hand .fan"), actions: $(".mg-actions"), scrim: $(".mg-scrim"), sheet: $(".mg-sheet"), log: $(".mg-log"), logList: $(".mg-log ol"), menu: $(".mg-menu"), fx: $(".mg-fx") };
      el.addEventListener("click", e => this.onClick(e));
      // hover (mouse) or press and hold (touch) any card for its full text
      if (K.bindPreview) K.bindPreview(el, t => this.previewFor(t), { hoverSel: ".mc[data-oid], .hc[data-oid], .mg-cmd[data-oid], [data-card]" });
      this.$.scrim.addEventListener("click", () => this.scrimTap());
      this.bindSheetSwipe();
      document.body.appendChild(el);
      document.documentElement.classList.add("mg-open");
      this.onResize = () => this.render();
      root.addEventListener("resize", this.onResize);
    }
    destroy() {
      this.dead = true;
      root.removeEventListener("resize", this.onResize);
      document.documentElement.classList.remove("mg-open");
      this.el.remove();
      if (this.resolver) { const r = this.resolver; this.resolver = null; r(null); }
    }

    /* -------------------------------------------------------- starting a game */
    /* mode (practice, optional): { kind: "assess" } records your choices for the review;
       { kind: "retry", rec, at } replays a recorded game to answer `at`, then hands it to you;
       { kind: "puzzle", puzzle } sets up a board for a one-turn puzzle. Each takes onDone(rec or
       result) and onReview(rec). */
    start(seats, mode) {
      const pm = this.gm = mode || null;
      const PR = MK.Practice;
      if (pm && pm.kind === "retry") seats = pm.rec.seats.map((s, i) => i === pm.rec.hero ? { human: true, deck: PR.deckById(s.deck) } : { deck: PR.deckById(s.deck), skill: s.skill, aggression: s.aggression, casual: !!s.casual });
      this.seats = seats;
      const lvl = this.s.level === "casual" ? { skill: 0.55 } : { skill: 0.9 };
      const skillOf = d => d.skill != null ? d.skill : lvl.skill;
      const aggrOf = d => d.aggression != null ? d.aggression : d.deck.aggression == null ? 0.55 : d.deck.aggression;
      // precon (Bracket 1-2) bots play like a casual table: see ai.js
      const casualOf = d => d.casual != null ? d.casual : (d.deck.bracket || 4) <= 2;
      const players = pm && pm.kind === "puzzle" ? pm.puzzle.players(this) : seats.map((d, i) => {
        if (d.human) return { name: "You", commander: d.deck.commander, list: d.deck.list, identity: d.deck.identity, human: true, agent: this.humanAgent(), deckId: d.deck.id };
        // watching: your deck is a bot too, named apart from a bot of the same deck
        if (d.watch) { const bot = MK.AI.create({ skill: 1, aggression: aggrOf(d), casual: false }); return { name: `${d.deck.name} (your deck)`, commander: d.deck.commander, list: d.deck.list, identity: d.deck.identity, agent: this.paced(bot), deckId: d.deck.id }; }
        const bot = MK.AI.create({ skill: skillOf(d), aggression: aggrOf(d), casual: casualOf(d) });
        return { name: d.deck.name, commander: d.deck.commander, list: d.deck.list, identity: d.deck.identity, agent: this.paced(bot), deckId: d.deck.id };
      });
      this.helper = MK.AI.create({ skill: 1 });
      // a deck with a coach (Corrupted Miku) shows live tips and a turn checklist
      const mine = seats.find(d => d.human);
      // practice games are played without the coach: they measure what you'd do on your own
      this.coach = pm && pm.kind !== "retry" ? null : mine && mine.deck.coach || null;
      this.$.coachBtn.hidden = !this.coach;
      // Companion (ticked in the game setup): a panel that walks you through each stage of the game
      this.companionOn = !!(this.coach && this.coach.companion && this.s.companion !== false);
      const seed = pm && pm.kind === "retry" ? pm.rec.seed : pm && pm.kind === "puzzle" ? (pm.puzzle.seed || 1) : Math.floor(Math.random() * 2 ** 31);
      const heroIdx = Math.max(0, players.findIndex(p => p.human));
      this.rec = null;
      if (pm && (pm.kind === "assess" || pm.kind === "retry") && PR) {
        const rec = this.rec = PR.newRecord({ deck: mine.deck.id, mode: pm.kind, seed, hero: heroIdx, seats: seats.map(d => d.human ? { deck: d.deck.id, name: "You" } : { deck: d.deck.id, name: d.deck.name, skill: skillOf(d), aggression: aggrOf(d), casual: casualOf(d) }) });
        let agent = players[heroIdx].agent;
        if (pm.kind === "retry") { rec.parent = pm.rec.id; rec.from = pm.at; agent = this.replayFirst(pm.rec, pm.at, agent); }
        players[heroIdx].agent = PR.record(agent, { rec, replayedUntil: pm.kind === "retry" ? pm.at : 0 });
      }
      const gopts = { seed, players, endOnHumanLoss: true, maxTurns: 160, ui: { log: e => this.onLog(e), anim: (k, d) => this.onAnim(k, d), pace: (k, d) => this.onPace(k, d) } };
      if (pm && pm.kind === "puzzle") Object.assign(gopts, { setup: g => pm.puzzle.setup(g), stopAtTurn: pm.puzzle.stopAtTurn || 1, round: pm.puzzle.round || 1, maxTurns: 40 });
      const g = this.g = new MK.Game(gopts);
      g.players.forEach((p, i) => { p.color = PLAYER_COLORS[i % PLAYER_COLORS.length]; p.deckId = players[i].deckId || "miku"; });
      // a bot game (Watch) has no human: the screen follows one bot's seat instead
      this.watching = !g.players.some(p => p.human);
      this.me = g.players.find(p => p.human) || g.players[Math.max(0, seats.findIndex(d => d.follow))];
      this.el.classList.toggle("watching", this.watching);
      this.el.style.setProperty("--me-label", JSON.stringify(this.watching ? this.me.name : "You"));
      this.el.style.setProperty("--me-turn", JSON.stringify(this.watching ? this.me.name + " · their turn" : "You · your turn"));
      this.el.querySelector(".mg-board.me .cre").dataset.empty = this.watching ? "No creatures" : "Your creatures appear here";
      // the same draw of the game's dice the practice replays make (practice.js buildGame)
      g.activeIdx = pm && pm.kind === "puzzle" ? heroIdx : g.rand(g.players.length);
      if (this.rec) this.rec.first = g.activeIdx;
      if (pm && pm.kind === "puzzle") this.puzzleBar();
      const opp = this.opps();
      this.focusId = opp[0] && opp[0].id;
      const names = new Set();
      for (const p of g.players) { for (const o of p.library) names.add(o.def.name); for (const o of p.command) names.add(o.def.name); }
      K.ensure([...names], { miku: true }).then(() => this.render());
      K.onArt(() => this.render());
      this.render();
      this.startedAt = Date.now();
      g.play().then(() => this.finish()).catch(err => this.crash(err));
    }
    /* Retry: the recorded answers up to `at`, played at full speed, then you. */
    replayFirst(prev, at, human) {
      const t = this;
      let i = 0;
      const a = {};
      for (const k of MK.Practice.KINDS) a[k] = (g, p, ctx) => {
        if (i < at && i < prev.answers.length) { const v = prev.answers[i++]; t.fastForward = true; return MK.Practice.deAnswer(g, v, ctx); }
        if (i++ === at) { t.fastForward = false; t.toast("Your move: this is the moment you picked."); }
        return human[k](g, p, ctx);
      };
      return a;
    }
    /* Puzzle goal and hint, above the boards. */
    puzzleBar() {
      const pz = this.gm.puzzle;
      let bar = this.el.querySelector(".mg-puzzle");
      if (!bar) { bar = document.createElement("div"); bar.className = "mg-puzzle"; this.el.querySelector(".mg-top").after(bar); }
      this.hintN = this.hintN || 0;
      const hints = pz.hints || [];
      bar.innerHTML = `<div class="pz-goal"><span class="pz-tag">Puzzle</span><b>${esc(pz.title)}</b><span>${mana(esc(pz.goal))}</span></div>
        ${this.hintN ? `<ol class="pz-hints">${hints.slice(0, this.hintN).map(h => `<li>${mana(esc(h))}</li>`).join("")}</ol>` : ""}
        ${this.hintN < hints.length ? `<button class="pz-hint" data-act="pzhint">Hint ${this.hintN + 1} of ${hints.length}</button>` : ""}`;
    }
    toast(text) {
      if (!this.el || this.dead) return;
      const n = document.createElement("div");
      n.className = "mg-toast";
      n.textContent = text;
      this.el.appendChild(n);
      setTimeout(() => n.remove(), 3200);
    }
    opps() {
      const g = this.g, me = this.me, out = [];
      for (let k = 1; k < g.players.length; k++) out.push(g.players[(me.idx + k) % g.players.length]);
      return out;
    }

    /* -------------------------------------------------------- bots, slowed down to be watchable */
    paced(bot) {
      const t = this;
      return Object.assign({}, bot, {
        async mulligan(g, p, ctx) { return bot.mulligan(g, p, ctx); },
        async main(g, p, ctx) { await t.beat(t.sp.think); return bot.main(g, p, ctx); },
        async attack(g, p, ctx) { t.focusOn(p); await t.beat(t.sp.think); return bot.attack(g, p, ctx); },
        async block(g, p, ctx) { await t.beat(t.sp.block); return bot.block(g, p, ctx); },
        async respond(g, p, ctx) { return bot.respond(g, p, ctx); },
        async choose(g, p, req) { return bot.choose(g, p, req); }
      });
    }
    async beat(ms) { this.render(); if (!this.dead) await sleep(this.fastForward ? 0 : ms); }
    focusOn(p) { if (p && p !== this.me) { this.focusId = p.id; this.render(); } }

    /* -------------------------------------------------------- the human seat */
    humanAgent() {
      const t = this;
      return {
        mulligan: (g, p, ctx) => t.askMulligan(ctx),
        main: (g, p, ctx) => t.askMain(ctx),
        attack: (g, p, ctx) => t.askAttack(ctx),
        block: (g, p, ctx) => t.askBlock(ctx),
        respond: (g, p, ctx) => t.askRespond(ctx),
        choose: (g, p, req) => t.askChoice(req)
      };
    }
    wait(mode) {
      if (mode === "block" || mode === "respond") this.$.fx.querySelectorAll(".mg-banner").forEach(x => x.remove());
      if (this.spotItem && !this.g.stack.includes(this.spotItem)) this.spotOut();
      this.mode = mode;
      this.fastForward = false;
      const p = new Promise(res => { this.resolver = res; });
      this.render();
      return p;
    }
    resolve(v) {
      const r = this.resolver;
      if (!r) return;
      this.resolver = null;
      this.mode = "wait";
      this.closeSheet(true);
      this.atk.clear(); this.blk.clear(); this.sel = null;
      r(v);
      this.render();
    }

    /* -------------------------------------------------------- engine hooks */
    onLog(e) {
      if (this.dead) return;
      const important = ["cast", "attack", "block", "die", "exile", "search", "win", "lose", "token", "counter", "big", "repeat", "land", "emblem", "bounce", "impulse"].includes(e.kind) || !e.kind;
      if (important && e.kind !== "turn") { this.ticker = youText(e.text); this.tickNew = true; }
      this.appendLog(e);
      this.soon();
    }
    onAnim(kind, d) {
      if (this.dead) return;
      const g = this.g;
      switch (kind) {
        case "turn": this.banner(d.p); if (d.p !== this.me) this.focusOn(d.p); break;
        case "cast": this.spotlight(d.o, d.p, d.item); break;
        case "resolve": this.spotOut(); break;
        case "countered": case "fizzle": this.spotOut(true); break;
        case "life": this.floatLife(d.p, d.delta); break;
        case "poison": this.floatAt(this.seatEl(d.p), `+${d.n}☣`, "hurt"); break;
        case "damage": this.floatAt(this.cardEl(d.o), `-${d.n}`, "hurt"); break;
        case "counter": if (d.kind === "p1" && d.n > 0) this.floatAt(this.cardEl(d.o), `+${d.n}`, "ctr"); break;
        case "lose": this.soon(); break;
        case "ability": { const el = this.cardEl(d.o); if (el && !reduced()) { el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse"); } break; }
        default: break;
      }
      this.soon();
    }
    async onPace(kind, d) {
      if (this.dead) return;
      this.render();
      const human = d && d.p && d.p.human;
      let ms = 0;
      if (kind === "cast") ms = human ? Math.min(420, this.sp.cast) : this.sp.cast;
      else if (kind === "attack") ms = this.sp.attack;
      else if (kind === "damage") ms = this.sp.damage;
      if (this.fastForward) ms = 0;
      if (ms) await sleep(ms);
    }
    soon() {
      if (this.raf || this.dead) return;
      this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); });
    }

    /* -------------------------------------------------------- rendering */
    render() {
      if (this.dead || !this.g) return;
      if (this.raf) { cancelAnimationFrame(this.raf); this.raf = 0; }
      const g = this.g;
      this.canCache = null;
      if (this.el.dataset.mode !== this.mode) this.el.dataset.mode = this.mode;
      // one part that fails to draw must not freeze the rest of the table (or the buttons)
      for (const part of ["renderPhase", "renderSeats", "renderOpp", "renderMid", "renderMine", "renderMyBar", "renderHand", "renderActions", "renderCoach", "renderCompanion"]) {
        try { this[part](); } catch (err) { this.drawError(part, err); }
      }
    }
    drawError(part, err) {
      console.error("[miku game] " + part, err);
      const msg = `${part}: ${err && err.message || err}`;
      if (this.lastDrawError === msg) return;
      this.lastDrawError = msg;
      this.appendLog({ text: `Display error (${msg}). The game goes on; please report it.`, kind: "big" });
    }
    renderPhase() {
      const g = this.g;
      const steps = ["untap", "upkeep", "draw", "main1", "combat", "main2", "end"];
      const ph = { untap: 0, upkeep: 1, draw: 2, main1: 3, combat: 4, attackers: 4, blockers: 4, damage: 4, endCombat: 4, main2: 5, end: 6, cleanup: 6, setup: -1 }[g.phase];
      const label = { setup: "Getting ready", untap: "Untap", upkeep: "Upkeep", draw: "Draw", main1: "Main phase", combat: "Combat", attackers: "Attackers", blockers: "Blockers", damage: "Combat damage", endCombat: "End of combat", main2: "Second main", end: "End step", cleanup: "Cleanup" }[g.phase] || g.phase;
      const mine = g.phase !== "setup" && g.active === this.me;
      const who = g.phase === "setup" ? "Mulligans" : mine && !this.watching ? "Your turn" : esc(g.active.name) + "'s turn";
      // two short lines: whose turn it is, then where in the turn we are (nothing gets cut off on a phone)
      const html = `<span class="l1"><b>Turn ${Math.max(1, g.round)}</b><span class="who${mine ? " me" : ""}" style="--pc:${mine || !g.active ? "var(--miku)" : g.active.color}">${who}</span></span><span class="l2"><span class="steps">${steps.map((s, i) => `<i class="${i === ph ? "on" : i < ph ? "done" : ""}"></i>`).join("")}</span><span class="step">${esc(label)}</span></span>`;
      if (this.$.phase._html !== html) { this.$.phase.innerHTML = html; this.$.phase._html = html; }
      this.el.classList.toggle("my-turn", mine);
    }
    seatEl(p) { return p === this.me ? this.$.mybar.querySelector(".mg-life") : this.$.seats.querySelector(`[data-pid="${p.id}"]`); }
    renderSeats() {
      const g = this.g;
      const attackMode = this.mode === "attack";
      const incoming = {};
      if (g.combat) for (const a of g.combat.attackers) if (a.combat) { const q = g.defenderOf(a.combat.attacking); incoming[q.id] = (incoming[q.id] || 0) + 1; }
      if (attackMode) for (const [, tg] of this.atk) { const q = g.defenderOf(tg); incoming[q.id] = (incoming[q.id] || 0) + 1; }
      this.$.seats.innerHTML = this.opps().map(p => {
        const cmd = p.commanders[0];
        const a = cmd && K.art(cmd.def.name);
        const cls = ["mg-seat", p.id === this.focusId ? "focus" : "", g.active === p ? "active" : "", p.lost ? "out" : "", attackMode && !p.lost ? "pick" : "", attackMode && this.atkTarget === p ? "target" : ""].join(" ");
        const myCmd = this.me.commanders[0];
        const cmdDmg = myCmd && p.cmdDmg[myCmd.id] ? `<span class="cmd" title="Commander damage from ${esc(myCmd.def.name)}">⚔${p.cmdDmg[myCmd.id]}</span>` : "";
        const taken = cmd && this.me.cmdDmg[cmd.id] ? `<span class="cmd" title="Commander damage you took from ${esc(cmd.def.name)}">↓${this.me.cmdDmg[cmd.id]}</span>` : "";
        return `<button class="${cls}" data-pid="${p.id}" style="--c1:${p.color}" aria-label="${esc(p.name)}, ${p.life} life${p.lost ? ", out" : ""}">
          <span class="av" style="${a ? `background-image:url('${a.crop}')` : `background:${bgFor(cmd ? cmd.def : { colors: [] })}`}"></span>
          <span class="who"><span class="nm">${esc(p.name)}</span><span class="life">${p.lost ? "Out" : p.life}</span>
          <span class="meta"><span title="Cards in hand">✋${p.hand.length}</span><span title="Cards in library">▤${p.library.length}</span>${p.poison ? `<span class="psn">☣${p.poison}</span>` : ""}${g.hitCount(p) ? `<span class="psn" title="Exiled cards with hit counters (three and they lose)">◎${g.hitCount(p)}</span>` : ""}${cmdDmg}${taken}</span></span>
          ${incoming[p.id] && g.combat && g.combat.attacker !== p ? `<span class="inc">${incoming[p.id]}⚔</span>` : ""}
        </button>`;
      }).join("");
    }
    /* Permanents grouped: identical tokens (and identical lands) share one pile with a count. */
    pileKey(o, loose) {
      const g = this.g;
      if (o.zone !== "battlefield") return "c:" + o.def.name;
      if (!o.isToken && !g.isLand(o)) return "o" + o.id;
      const pt = ptOf(g, o);
      const kws = g.isCreature(o) ? [...g.ch(o).kws].sort().join(",") : "";
      const c = o.combat ? (o.combat.attacking ? "A" + o.combat.attacking.id : "B" + (o.combat.blocking ? o.combat.blocking.id : "")) : "";
      const mine = loose ? "" : [this.atk.has(o.id) ? "atk" : "", this.blk.has(o.id) ? "blk" + this.blk.get(o.id).id : ""].join("");
      return [o.def.name, o.def.__token || "", o.controller.id, o.tapped, o.sick, pt ? pt.join("/") : "", JSON.stringify(o.counters), c, kws, o.attachedTo ? o.attachedTo.id : "", o.damage, mine].join("|");
    }
    groups(p) {
      const out = new Map();
      for (const o of this.g.battlefield) {
        if (o.controller !== p) continue;
        const key = this.pileKey(o);
        if (!out.has(key)) out.set(key, []);
        out.get(key).push(o);
      }
      return [...out.values()];
    }
    split(p) {
      const g = this.g;
      const cre = [], oth = [], lands = [];
      for (const grp of this.groups(p)) {
        const o = grp[0];
        if (g.isCreature(o)) cre.push(grp);
        else if (g.isLand(o)) lands.push(grp);
        else oth.push(grp);
      }
      const order = o => (o.isCommander ? 0 : 1) * 1000 + (o.isToken ? 500 : 0) + o.ts * 1e-9;
      cre.sort((a, b) => order(a[0]) - order(b[0]));
      return { cre, oth, lands };
    }
    cardHTML(grp, opts) {
      const g = this.g, o = grp[0], d = o.def;
      opts = opts || {};
      const pt = ptOf(g, o);
      const base = d.pt || [0, 0];
      const cls = ["mc"];
      if (o.tapped) cls.push("tapped");
      if (o.sick && g.isCreature(o) && !g.kw(o, "haste") && o.controller === g.active) cls.push("sick");
      if (o.combat && o.combat.attacking) cls.push("attacking");
      if (o.combat && o.combat.blocking) cls.push("blocking");
      if (this.atk.has(o.id)) cls.push("attacking");
      if (this.blk.has(o.id)) cls.push("blocking");
      if (opts.can) cls.push("can");
      if (opts.sel) cls.push("sel");
      if (opts.dim) cls.push("dim");
      // face down: a card back; you may look at your own
      const fd = o.faceDown && o.zone === "battlefield";
      const peekDef = fd && o.controller === this.me ? o.cardDef : null;
      if (fd) cls.push("fd");
      const art = fd ? null : artFor(d, "crop");
      const counters = o.counters.loyalty != null && g.isPlaneswalker(o) ? `<span class="ct loy">${o.counters.loyalty}</span>` : o.counters.p1 ? `<span class="ct">+${o.counters.p1}</span>` : o.counters.m1 ? `<span class="ct" style="background:#ff5a6e">-${o.counters.m1}</span>` : o.counters.quest ? `<span class="ct q">${o.counters.quest}</span>` : "";
      const kws = pt ? [...g.ch(o).kws].filter(k => KW_ICON[k]).slice(0, 3).map(k => `<i title="${esc(k)}">${KW_ICON[k]}</i>`).join("") : "";
      const ptCls = pt ? (pt[0] > base[0] || pt[1] > base[1] ? "up" : pt[0] < base[0] || pt[1] < base[1] ? "down" : "") : "";
      const n = opts.count != null ? opts.count : grp.length;
      // a Room on the battlefield goes by its unlocked doors
      const label = fd ? (peekDef ? shortName(peekDef.name) : "Face down") : d.doors && o.zone === "battlefield" ? d.doors.filter((_, i) => (o.state.doors || [])[i]).map(x => x.name).join(" + ") || shortName(d.name) : shortName(d.name);
      return `<button class="${cls.join(" ")}" data-oid="${o.id}" data-n="${grp.length}" aria-label="${esc(d.name)}${n > 1 ? " times " + n : ""}${o.tapped ? ", tapped" : ""}">
        ${fd ? `<span class="art fdb">${peekDef ? `<span class="fdn">${esc(label)}</span>` : ""}</span>` : `<span class="art${art ? "" : " txt"}" style="${artStyle(d)}">${art ? "" : esc(label)}</span>`}
        ${art || d.token ? `<span class="nm">${esc(label)}</span>` : ""}
        ${kws ? `<span class="kws">${kws}</span>` : ""}
        ${pt ? `<span class="pt ${ptCls}">${pt[0]}/${pt[1]}</span>` : ""}
        ${counters}
        ${n > 1 ? `<span class="qty">×${n}</span>` : ""}
        ${o.damage > 0 && pt ? `<span class="dmg">${o.damage}</span>` : ""}
        ${opts.dot ? `<span class="dot"></span>` : ""}
      </button>`;
    }
    landsHTML(p, lands) {
      const g = this.g;
      const all = lands.flat();
      if (!all.length) return "";
      const ready = all.filter(o => !o.tapped).length;
      const pips = all.slice(0, 16).map(o => {
        const prod = (o.def.mana[0] && o.def.mana[0].produce) || "C";
        const k = Array.isArray(prod) ? prod[0] : String(prod)[0];
        const col = { W: "#f3e3b0", U: "#8ec4ee", B: "#b9aeb4", R: "#f39a80", G: "#8fd0a0", C: "#c8c2bc", a: "#e9d7ff" }[k] || "#c8c2bc";
        return `<i class="${o.tapped ? "used" : ""}" style="background:${col}"></i>`;
      }).join("");
      return `<button class="mg-lands" data-lands="${p.id}" aria-label="${all.length} lands, ${ready} untapped"><b>${all.length}</b><span>${ready} ready</span><span class="pips">${pips}</span></button>`;
    }
    syncRow(row, grps, optsFn) {
      // keyed by the first object of each pile, so piles keep their element (and animations)
      const keep = new Map();
      for (const el of [...row.children]) if (el.dataset.oid) keep.set(el.dataset.oid, el);
      const frag = [];
      for (const grp of grps) {
        const html = this.cardHTML(grp, optsFn ? optsFn(grp) : {});
        const id = String(grp[0].id);
        let el = keep.get(id);
        if (el) {
          keep.delete(id);
          if (el._html !== html) { const tmp = document.createElement("div"); tmp.innerHTML = html; const nu = tmp.firstElementChild; nu._html = html; el.replaceWith(nu); el = nu; }
        } else {
          const tmp = document.createElement("div"); tmp.innerHTML = html; el = tmp.firstElementChild; el._html = html; el.classList.add("enter");
          setTimeout(() => el.classList.remove("enter"), 600);
        }
        frag.push(el);
      }
      for (const [, el] of keep) { el.classList.add("gone"); setTimeout(() => el.remove(), 480); }
      // after the lands pile when the row has one: moving it back and forth on every render made
      // the row scroll by itself and hide the pile's left edge
      let prev = row.querySelector(":scope > .mg-lands");
      for (const el of frag) {
        const at = prev ? prev.nextSibling : row.firstChild;
        if (at !== el) row.insertBefore(el, at);
        prev = el;
      }
    }
    renderOpp() {
      const g = this.g;
      const wide = root.innerWidth >= 900;
      const box = this.$.opp;
      const opps = this.opps();
      if (!opps.some(p => p.id === this.focusId)) this.focusId = (opps.find(p => !p.lost) || opps[0]).id;
      const cols = wide ? opps : opps.filter(p => p.id === this.focusId);
      box.classList.toggle("desk", wide);
      box.style.setProperty("--n", cols.length);
      const fp = opps.find(p => p.id === this.focusId);
      if (fp) box.style.setProperty("--pc", fp.color);
      // one column per shown opponent, rebuilt only when the set of columns changes
      const sig = cols.map(p => p.id).join(",") + (wide ? "w" : "n");
      if (box._sig !== sig) {
        box._sig = sig;
        box.innerHTML = cols.map(p => `<div class="col" data-col="${p.id}" style="--pc:${p.color}"><span class="label"><i></i>${esc(p.name)}</span><div class="mg-row cre" data-empty="No creatures"></div><div class="mg-row small oth"></div></div>`).join("");
      }
      for (const p of cols) {
        const col = box.querySelector(`[data-col="${p.id}"]`);
        col.classList.toggle("focus", p.id === this.focusId);
        const { cre, oth, lands } = this.split(p);
        const pickable = this.mode === "attack" ? grp => ({ can: g.isPlaneswalker(grp[0]) }) : null;
        this.syncRow(col.querySelector(".cre"), cre, pickable);
        const othRow = col.querySelector(".oth");
        this.syncRow(othRow, oth, pickable);
        let lc = othRow.querySelector(".mg-lands");
        const lh = this.landsHTML(p, lands);
        if (lh) {
          if (!lc || lc._html !== lh) { const tmp = document.createElement("div"); tmp.innerHTML = lh; const nu = tmp.firstElementChild; nu._html = lh; if (lc) lc.replaceWith(nu); else othRow.insertBefore(nu, othRow.firstChild); }
          else if (othRow.firstChild !== lc) othRow.insertBefore(lc, othRow.firstChild);
        } else if (lc) lc.remove();
      }
    }
    renderMine() {
      const g = this.g, me = this.me;
      const { cre, oth, lands } = this.split(me);
      const acting = this.acting();
      let optsFn = null;
      if (this.mode === "attack") {
        const cands = new Set((this.atkCands || []).map(o => o.id));
        optsFn = grp => ({ can: grp.some(o => cands.has(o.id)) && !grp.some(o => this.atk.has(o.id)), sel: grp.some(o => this.atk.has(o.id)) });
      } else if (this.mode === "block") {
        const att = this.sel;
        optsFn = grp => ({ can: !!att && grp.some(o => !this.blk.has(o.id) && g.canBlock(o, att)), sel: grp.some(o => this.blk.has(o.id)) });
      } else if (acting) {
        optsFn = grp => ({ dot: this.hasAbility(grp[0]) });
      }
      this.syncRow(this.$.meCre, cre, optsFn);
      this.syncRow(this.$.meOth, oth, acting ? grp => ({ dot: this.hasAbility(grp[0]) }) : null);
      const row = this.$.meOth;
      let lc = row.querySelector(".mg-lands");
      const lh = this.landsHTML(me, lands);
      if (lh) {
        if (!lc || lc._html !== lh) { const tmp = document.createElement("div"); tmp.innerHTML = lh; const nu = tmp.firstElementChild; nu._html = lh; if (lc) lc.replaceWith(nu); else row.insertBefore(nu, row.firstChild); }
        else if (row.firstChild !== lc) row.insertBefore(lc, row.firstChild);
      } else if (lc) lc.remove();
    }
    zoneLive(zone) {
      if (!this.acting()) return false;
      const g = this.g, me = this.me, can = this.castable();
      return me[zone].some(o => can.has(o.id) || (zone === "graveyard" && g.graveyardAbilities(o).some(e => g.canActivate(me, o, e, { instant: this.mode !== "main" }))));
    }
    acting() { return (this.mode === "main" || this.mode === "respond") && !!this.resolver; }
    hasAbility(o) {
      const g = this.g, me = this.me;
      const instant = this.mode !== "main";
      return g.abilitiesOf(o).some(e => g.canActivate(me, o, e, { instant }));
    }
    castable() {
      if (this.canCache) return this.canCache;
      const g = this.g, me = this.me, set = new Set();
      if (this.acting()) {
        const instant = this.mode !== "main";
        for (const a of g.legalActions(me, { instant })) if (a.type === "cast" || a.type === "land" || a.type === "cycle" || a.type === "channel") set.add(a.card.id);
      }
      return (this.canCache = set);
    }
    renderMid() {
      const g = this.g, box = this.$.mid;
      if (this.mode === "block") {
        const att = (this.blockCtx || []);
        box.innerHTML = `<div class="mg-incoming">${att.map(a => {
          const by = [...this.blk].filter(([, x]) => x === a).map(([id]) => g.find(+id)).filter(Boolean);
          return `<div class="blk">${this.cardHTML([a], { sel: this.sel === a, can: this.sel !== a })}<span class="by">${by.length ? "⛨ " + esc(by.map(b => shortName(b.def.name)).join(", ")) : esc(this.targetName(a))}</span></div>`;
        }).join("")}</div>`;
        return;
      }
      let text = this.ticker ? esc(this.ticker) : "";
      if (g.stack.length > 1) text = `On the stack: ${g.stack.slice().reverse().map((it, i) => i ? esc(it.name) : `<b>${esc(it.name)}</b>`).join(" ← ")}`;
      if (this.mode === "respond" && this.respondCtx) {
        const c = this.respondCtx;
        const tg = (c.window === "stack" || c.window === "ability") && c.top.targets && c.top.targets.filter(Boolean).length ? ` targeting ${esc(youText(c.top.targets.filter(Boolean).map(t => g.nameOf(t)).join(" and ")).replace(/^You$/, "you"))}` : "";
        const ab = c.window === "ability" ? (c.top.kind === "trigger" ? `<b>${esc(c.top.o.def.name)}</b>'s triggered ability${tg} is on the stack. Respond?` : `<b>${esc(c.top.p.name)}</b> activates <b>${esc(c.top.name)}</b>${tg}. Respond?`) : "";
        text = c.window === "trigger" ? `<b>${esc(c.src.def.name)}</b>'s ability is about to resolve. Respond?` : c.window === "stack" ? `<b>${esc(c.top.p.name)}</b> casts <b>${esc(c.top.name)}</b>${tg}. Respond?` : ab || (c.window === "attackers" ? `Attackers are declared. Anything before blocks?` : c.window === "combat" ? `Blockers are set. Anything before damage?` : `End of <b>${esc(c.turnOf.name)}</b>'s turn. Anything before yours?`);
      }
      const html = `<div class="mg-ticker${this.tickNew ? " new" : ""}">${text || "&nbsp;"}</div>`;
      if (box._html !== html) { box.innerHTML = html; box._html = html; }
      this.tickNew = false;
    }
    targetName(a) { const t = a.combat && a.combat.attacking; return t ? (this.g.isPlayer(t) ? (t === this.me && !this.watching ? "at you" : "at " + t.name) : "at " + t.def.name) : ""; }
    renderMyBar() {
      const g = this.g, me = this.me;
      const cmd = me.commanders[0];
      const inZone = cmd && cmd.zone === "command";
      const tax = inZone ? g.commanderTax(me, cmd) : 0;
      const can = inZone && this.castable().has(cmd.id);
      const a = cmd && K.art(cmd.def.name);
      const html = `<div class="mg-life"><b>${me.life}</b><span>life${me.poison ? ` · ☣${me.poison}` : ""}${me.energy ? ` · ⚡${me.energy}` : ""}</span></div>
        ${inZone ? `<button class="mg-cmd${can ? " can" : ""}" data-oid="${cmd.id}" aria-label="${esc(cmd.def.name)} in the command zone${tax ? ", tax " + tax : ""}"><span class="av" style="${a ? `background-image:url('${a.crop}')` : `background:${bgFor(cmd.def)}`}"></span><span>Command<br><span class="tax">${tax ? "+" + tax + " tax" : "no tax"}</span></span></button>` : ""}
        ${poolHTML(me)}
        <div class="mg-zones">
          <button class="mg-zone${this.zoneLive("graveyard") ? " can" : ""}" data-zone="graveyard" aria-label="Your graveyard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 21V9a6 6 0 0 1 12 0v12zM4 21h16"/></svg>${me.graveyard.length}</button>
          <button class="mg-zone${this.zoneLive("exile") ? " can" : ""}" data-zone="exile" aria-label="Your exile"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M8 8l8 8"/></svg>${me.exile.length}</button>
          <span class="mg-zone" title="Cards in your library">▤ ${me.library.length}</span>
        </div>`;
      const box = this.$.mybar;
      if (box._html !== html) {
        const old = box.querySelector(".mg-life b");
        const oldLife = old ? +old.textContent : me.life;
        box.innerHTML = html; box._html = html;
        if (oldLife !== me.life) { const l = box.querySelector(".mg-life"); l.classList.add("bump"); }
      }
    }
    renderHand() {
      const g = this.g, me = this.me;
      const can = this.castable();
      const acting = this.acting();
      const fan = this.$.fan;
      const hand = me.hand.slice();
      const w = this.$.hand.clientWidth - 20;
      const hw = parseFloat(getComputedStyle(this.el).getPropertyValue("--hw")) || 76;
      const ov = hand.length > 1 && hand.length * (hw + 4) > w ? Math.min(Math.ceil((hand.length * hw - w) / (hand.length - 1)), Math.round(hw * .72)) : -4;
      fan.style.setProperty("--ov", ov + "px");
      const keep = new Map([...fan.children].map(el => [el.dataset.oid, el]));
      const els = hand.map(o => {
        const cls = ["hc", acting ? (can.has(o.id) ? "can" : "no") : ""].join(" ");
        const art = artFor(o.def, "crop");
        const html = `<button class="${cls}" data-oid="${o.id}" aria-label="${esc(o.def.name)}${acting && can.has(o.id) ? ", can be played" : ""}"><span class="art" style="${artStyle(o.def)}"></span><span class="cost">${costOf(o.def)}</span><span class="nm">${esc(o.def.name.split(" // ")[0])}</span></button>`;
        let el = keep.get(String(o.id));
        if (el) { keep.delete(String(o.id)); if (el._html !== html) { el.className = cls; el.innerHTML = html.replace(/^<button[^>]*>|<\/button>$/g, ""); el._html = html; } }
        else { const tmp = document.createElement("div"); tmp.innerHTML = html; el = tmp.firstElementChild; el._html = html; el.classList.add("enter"); setTimeout(() => el.classList.remove("enter"), 500); }
        return el;
      });
      for (const [, el] of keep) el.remove();
      els.forEach((el, i) => { if (fan.children[i] !== el) fan.insertBefore(el, fan.children[i] || null); });
      let empty = this.$.hand.querySelector(".empty");
      if (!hand.length && !empty) { empty = document.createElement("span"); empty.className = "empty"; empty.textContent = "No cards in hand"; this.$.hand.appendChild(empty); }
      if (hand.length && empty) empty.remove();
    }
    renderActions() {
      const g = this.g, box = this.$.actions;
      let html = "";
      const m = this.mode;
      if (m === "main") {
        const p1 = g.phase === "main1";
        const tip = this.topTip();
        html = `<div class="hint">${tip || (p1 ? "Play a land, cast spells, then attack." : "Anything else before you pass the turn?")}</div>
          ${p1 ? `<button class="mg-btn" data-act="endturn">End turn</button><button class="mg-btn go" data-act="pass">Attack ▸</button>` : `<button class="mg-btn go wide" data-act="pass">End turn ▸</button>`}`;
      } else if (m === "attack") {
        const n = this.atk.size;
        const pw = [...this.atk.keys()].map(id => g.find(+id)).filter(Boolean).reduce((s, o) => s + Math.max(0, g.power(o)), 0);
        const tgt = this.atkTarget ? (g.isPlayer(this.atkTarget) ? this.atkTarget.name : this.atkTarget.def.name) : "";
        html = `<div class="hint">${n ? `${n} attacking, ${pw} power` : `Tap creatures to attack <b>${esc(tgt)}</b>. Tap a seat to switch.`}</div>
          <button class="mg-btn" data-act="atkall">All</button>
          <button class="mg-btn go" data-act="atkgo">${n ? "Attack" : "No attack"}</button>`;
      } else if (m === "block") {
        const inc = (this.blockCtx || []).filter(a => ![...this.blk.values()].includes(a));
        const dmg = inc.reduce((s, a) => s + Math.max(0, g.power(a)), 0);
        html = `<div class="hint">${this.sel ? `Tap your creatures to block <b>${esc(shortName(this.sel.def.name))}</b>.` : "Tap an attacker, then your blockers."} Unblocked: ${dmg}</div>
          <button class="mg-btn" data-act="blkauto">Suggest</button>
          <button class="mg-btn go" data-act="blkgo">${this.blk.size ? "Block" : "No blocks"}</button>`;
      } else if (m === "respond") {
        const n = this.respondCtx ? this.respondCtx.actions.length : 0;
        const tip = this.topTip(true);
        html = `<div class="hint">${tip || `Tap a glowing card, or see all ${n} option${n === 1 ? "" : "s"}.`}</div><button class="mg-btn" data-act="respond">Options</button><button class="mg-btn go" data-act="rpass">Pass</button>`;
      } else if (m === "wait") {
        const who = this.watching ? `Watching <b>${esc(this.me.name)}</b>` : g.active === this.me ? "Resolving..." : `${esc(g.active.name)} is playing.`;
        html = `<div class="hint">${who}</div>${this.watching ? `<button class="mg-btn" data-act="follow" aria-label="Follow the next player">Follow next</button>` : ""}<button class="mg-btn" data-act="ff" aria-label="Skip the animations for this turn">Skip ▸▸</button>`;
      } else if (m === "prompt") {
        html = `<div class="hint">Answer the question to go on.</div><button class="mg-btn go" data-act="prompt">Show question</button>`;
      } else html = `<div class="hint"></div>`;
      if (box._html !== html) { box.innerHTML = html; box._html = html; }
    }

    /* -------------------------------------------------------- log */
    appendLog(e) {
      const li = document.createElement("li");
      const p = e.p;
      // the header counts rounds (everyone's turn once), so the log does too: "Turn 3 · Kaalia"
      if (e.kind === "turn") { li.className = "turn"; li.textContent = p && this.g ? `Turn ${Math.max(1, this.g.round)} · ${p === this.me && !this.watching ? "You" : p.name}${e.extra ? " · extra turn" : ""}` : e.text.replace(/\.$/, ""); if (p && p.color) li.style.setProperty("--pc", p === this.me ? "var(--miku)" : p.color); }
      else {
        // prefixed: a bare "search" line used to pick up the site's search box style
        li.className = e.kind ? "k-" + e.kind : "";
        if (p && p.color) li.style.setProperty("--pc", p.color);
        let t = esc(youText(e.text));
        for (const n of e.cards || []) t = t.split(esc(n)).join(`<b data-card="${esc(n)}">${esc(n)}</b>`);
        li.innerHTML = t;
      }
      const ol = this.$.logList;
      // follow the newest line, unless you scrolled back to read (the log is docked open on wide screens)
      const atEnd = ol.scrollHeight - ol.scrollTop - ol.clientHeight < 60;
      ol.appendChild(li);
      while (ol.children.length > 400) ol.removeChild(ol.firstChild);
      if (this.$.log.classList.contains("on") || (root.innerWidth >= 1240 && atEnd)) ol.scrollTop = ol.scrollHeight;
    }

    /* -------------------------------------------------------- effects */
    cardEl(o) { return o && this.el.querySelector(`.mc[data-oid="${o.id}"]`); }
    floatAt(el, text, cls) {
      if (!el || reduced()) return;
      if (this.floats > 14) return;
      const r = el.getBoundingClientRect(), R = this.el.getBoundingClientRect();
      const f = document.createElement("span");
      f.className = "mg-float " + cls;
      f.textContent = text;
      f.style.left = (r.left + r.width / 2 - R.left) + "px";
      f.style.top = (r.top + r.height / 2 - R.top) + "px";
      this.$.fx.appendChild(f);
      this.floats++;
      setTimeout(() => { f.remove(); this.floats--; }, 1150);
    }
    floatLife(p, delta) {
      if (!p || !delta) return;
      this.floatAt(this.seatEl(p), (delta > 0 ? "+" : "") + delta, delta > 0 ? "gain" : "hurt");
      if (delta < 0 && p !== this.me) { const s = this.seatEl(p); if (s) { s.classList.remove("hit"); void s.offsetWidth; s.classList.add("hit"); } }
    }
    banner(p) {
      if (reduced() || this.fastForward) return;
      this.$.fx.querySelectorAll(".mg-banner").forEach(x => x.remove());
      const b = document.createElement("div");
      b.className = "mg-banner" + (p === this.me ? " me" : "");
      b.innerHTML = `<b>TURN ${Math.max(1, this.g.round)}</b><span>${p === this.me && !this.watching ? "Your turn" : esc(p.name)}</span>`;
      this.$.fx.appendChild(b);
      setTimeout(() => b.remove(), 1500);
    }
    spotlight(o, p, item) {
      if (this.fastForward) return;
      this.spotOut();
      const d = o.def;
      const a = artFor(d, "normal");
      const s = document.createElement("div");
      s.className = "mg-spot";
      const tg = item && item.targets && item.targets.filter(Boolean).length ? " → " + item.targets.filter(Boolean).map(t => this.g.nameOf(t)).join(", ") : "";
      s.innerHTML = a ? `<div class="card" style="background-image:url('${a}')"></div>` : `<div class="card frame" style="--c-bg:${bgFor(d)}"><b>${esc(item ? item.name : d.name)}</b><span>${d.doors && item ? mana(d.doors[item.door || 0].cost) : costOf(d)}</span><span>${esc(d.type)}</span><div>${rulesOf(d)}</div></div>`;
      s.insertAdjacentHTML("beforeend", `<div class="cap">${esc(p.name === "You" ? "You cast" : p.name + " casts")} ${esc(item ? item.name : d.name)}${esc(tg)}</div>`);
      this.$.fx.appendChild(s);
      this.spot = s;
      this.spotItem = item || null;
    }
    spotOut(countered) {
      const s = this.spot;
      if (!s) return;
      this.spot = null;
      this.spotItem = null;
      s.classList.add(countered ? "countered" : "out");
      setTimeout(() => s.remove(), 520);
    }
    notes() {
      if (reduced()) return;
      for (let i = 0; i < 16; i++) {
        const n = document.createElement("span");
        n.className = "mg-note";
        n.textContent = ["♪", "♫", "♬", "♩"][i % 4];
        n.style.left = (5 + Math.random() * 90) + "%";
        n.style.top = (80 + Math.random() * 20) + "%";
        n.style.animationDelay = (Math.random() * 1.2) + "s";
        n.style.color = i % 3 ? "#39c5bb" : "#ff3d8b";
        this.$.fx.appendChild(n);
        setTimeout(() => n.remove(), 4200);
      }
    }

    /* -------------------------------------------------------- clicks */
    onClick(e) {
      const t = e.target;
      const act = t.closest("[data-act]");
      if (act) return this.action(act.dataset.act, act);
      if (t.closest(".mg-menu")) return;
      const named = t.closest(".mg-log [data-card], .mg-spot [data-card], .mg-companion [data-card]");
      if (named) { const info = this.infoByName(named.dataset.card); if (info) K.preview.show(info); return; }
      this.$.menu.classList.remove("on");
      const seat = t.closest(".mg-seat");
      if (seat) return this.seatTap(this.g.players.find(p => p.id === seat.dataset.pid));
      const lands = t.closest("[data-lands]");
      if (lands) return this.showLands(this.g.players.find(p => p.id === lands.dataset.lands));
      const zone = t.closest("[data-zone]");
      if (zone) return this.showZone(this.me, zone.dataset.zone);
      const card = t.closest("[data-oid]");
      if (card && !t.closest(".mg-sheet")) return this.cardTap(+card.dataset.oid, card);
    }
    findObj(id) {
      const g = this.g;
      return g.find(id) || this.me.hand.find(o => o.id === id) || this.me.command.find(o => o.id === id) || (this.blockCtx || []).find(o => o.id === id) || null;
    }
    /* Any object the screen can show (sheets list graveyards, exile and searched libraries). */
    findAny(id) {
      const g = this.g;
      const hit = this.findObj(id);
      if (hit) return hit;
      for (const p of g.players) for (const z of ["graveyard", "exile", "command", "library"]) { const o = p[z].find(x => x.id === id); if (o) return o; }
      for (const it of g.stack) if (it.o.id === id) return it.o;
      return null;
    }
    /* What the preview shows for the card under el. */
    previewFor(el) {
      const named = el.closest("[data-card]");
      if (named) return this.infoByName(named.dataset.card);
      const b = el.closest("[data-oid]");
      if (!b) return null;
      const o = this.findAny(+b.dataset.oid);
      return o ? this.infoFor(o) : null;
    }
    infoByName(name) {
      const d = MK.defs.get(name) || MK.defs.get(String(name).split(" // ")[0]);
      if (!d) return { name };
      return { name: d.name, img: artFor(d, "normal"), cost: d.cost || "", type: d.type, text: rulesOf(d), html: true, pt: d.pt && d.types.includes("Creature") ? d.pt.join("/") : "", note: d.note ? "In this game: " + d.note : "" };
    }
    infoFor(o) {
      const g = this.g, me = this.me;
      const lines = [];
      const onField = o.zone === "battlefield";
      if (onField) {
        if (o.tapped) lines.push("tapped");
        if (o.sick && g.isCreature(o) && !g.kw(o, "haste")) lines.push("summoning sick");
        for (const k in o.counters) if (o.counters[k]) lines.push(`${o.counters[k]} ${k === "p1" ? "+1/+1" : k === "m1" ? "-1/-1" : k} counter${o.counters[k] > 1 ? "s" : ""}`);
        if (o.damage) lines.push(`${o.damage} damage`);
        if (g.isCreature(o)) { const kws = [...g.ch(o).kws].filter(k => k !== "changeling"); if (kws.length) lines.push(kws.join(", ")); }
        if (o.attachedTo) lines.push("on " + (o.attachedTo.faceDown ? "a face-down creature" : o.attachedTo.def.name));
        if (o.controller !== me) lines.push(o.controller.name + "'s");
      }
      if (o.hitCounter) lines.push("hit counter");
      if (o.playable && o.playable.by === me && o.zone === "exile") lines.push(o.playable.free ? "you may cast it for free" : "you may play it");
      const pt = onField ? ptOf(g, o) : null;
      if (o.faceDown && onField) {
        if (o.controller !== me) return { name: "Face-down creature", text: o.def.text, pt: pt ? pt.join("/") : "2/2", type: "Creature", lines };
        const c = o.cardDef;
        lines.unshift("face down: a 2/2" + (o.faceDown.kind === "cloak" ? " with ward {2}" : ""));
        return { name: c.name, img: artFor(c, "normal"), cost: c.cost || "", type: c.type, text: rulesOf(c), html: true, pt: pt ? pt.join("/") : "", lines, note: c.types.includes("Creature") || c.morph ? "Turn it face up for its " + (c.morph ? "morph cost " + c.morph + (c.cost ? " or its mana cost" : "") : "mana cost") + "." : "It can't be turned face up on its own." };
      }
      const d = o.def;
      return { name: d.name, img: artFor(d, "normal"), cost: d.cost || "", type: d.type, text: rulesOf(d, o), html: true, pt: pt ? pt.join("/") : (d.pt && d.types.includes("Creature") ? d.pt.join("/") : ""), lines, note: d.note ? "In this game: " + d.note : "" };
    }
    pile(o) {
      const grp = this.groups(o.controller).find(gr => gr.includes(o));
      return grp || [o];
    }
    cardTap(id) {
      const g = this.g, o = this.findObj(id);
      if (!o) return;
      if (this.mode === "attack" && o.zone === "battlefield") {
        if (o.controller === this.me) return this.toggleAttack(o);
        if (g.isPlaneswalker(o) && o.controller !== this.me) { this.atkTarget = o; this.render(); return; }
      }
      if (this.mode === "block") {
        if ((this.blockCtx || []).includes(o)) { this.sel = this.sel === o ? null : o; this.render(); return; }
        if (o.controller === this.me && g.isCreature(o)) return this.toggleBlock(o);
      }
      this.inspect(o);
    }
    seatTap(p) {
      if (!p || p === this.me) return;
      if (this.mode === "attack" && !p.lost) { this.atkTarget = p; }
      this.focusId = p.id;
      this.render();
    }
    scrimTap() {
      if (this.sheetMode === "prompt" && this.sheetCancel) { const c = this.sheetCancel; this.sheetCancel = null; c(); return; }
      if (this.sheetMode === "prompt") return; // a question must be answered
      this.closeSheet();
    }
    action(a, el) {
      const g = this.g;
      switch (a) {
        case "menu": this.toggleMenu(); break;
        case "log": { const on = !this.$.log.classList.contains("on"); this.$.log.classList.toggle("on", on); if (on) this.$.logList.scrollTop = this.$.logList.scrollHeight; break; }
        case "pass": if (this.mode === "main") this.resolve({ type: "pass" }); break;
        case "endturn": if (this.mode === "main") { this.skipMain2 = g.turn; this.resolve({ type: "pass", skipCombat: true }); } break;
        case "atkall": for (const o of this.atkCands || []) if (!this.atk.has(o.id)) this.atk.set(o.id, this.atkTarget); this.render(); break;
        case "atkgo": { const decl = [...this.atk].map(([id, tg]) => ({ attacker: g.find(+id), target: tg })).filter(d => d.attacker); this.resolve(decl); break; }
        case "blkauto": { const sug = this.helper.block(g, this.me, { attackers: this.blockCtx }); this.blk.clear(); for (const b of sug) this.blk.set(b.blocker.id, b.attacker); this.render(); break; }
        case "blkgo": { const out = [...this.blk].map(([id, att]) => ({ blocker: g.find(+id), attacker: att })).filter(b => b.blocker); this.resolve(out); break; }
        case "respond": this.showResponses(); break;
        case "coach": this.showCoach(); break;
        case "pzhint": this.hintN = (this.hintN || 0) + 1; if (this.gm && this.gm.puzzle) this.gm.puzzleHints = this.hintN; this.puzzleBar(); break;
        case "compmin": this.compMin = !this.compMin; this.compHTML = ""; this.render(); break;
        case "compclose": this.compHidden = this.compKey; this.render(); break;
        case "coachplan": this.coachTab = "plan"; this.showCoach(); break;
        case "rpass": this.resolve(null); break;
        case "ff": this.fastForward = true; this.spotOut(); this.render(); break;
        case "follow": { if (!this.watching) break; const ps = g.players; this.me = ps[(this.me.idx + 1) % ps.length]; const o = this.opps(); this.focusId = o[0] && o[0].id; this.el.style.setProperty("--me-label", JSON.stringify(this.me.name)); this.el.style.setProperty("--me-turn", JSON.stringify(this.me.name + " · their turn")); this.toast(`Following ${this.me.name}`); this.render(); break; }
        case "concede": this.$.menu.classList.remove("on"); if (this.watching) break; if (confirm("Concede this game?")) { this.conceded = true; g.lose(this.me, "concede"); if (!g.over) g.end(null, { humanLost: true }); this.resolve(null); } break;
        case "leave": this.$.menu.classList.remove("on"); if (g.over || this.watching || confirm("Leave this game? It won't be saved.")) { this.left = true; if (!g.over && this.watching) g.end(null, { left: true }); if (!g.over) { this.conceded = true; g.lose(this.me, "concede"); if (!g.over) g.end(null, { humanLost: true }); } this.resolve(null); this.destroy(); if (this.opts.onExit) this.opts.onExit(); } break;
        case "rules": this.$.menu.classList.remove("on"); this.showRules(); break;
        case "close": this.closeSheet(); break;
        case "prompt": this.showPrompt(); break;
        default: break;
      }
    }
    toggleMenu() {
      const m = this.$.menu, s = this.s;
      if (m.classList.contains("on")) { m.classList.remove("on"); return; }
      m.innerHTML = `
        <label>Speed <select data-set="speed"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select></label>
        <label><input type="checkbox" data-set="stopOnSpells"${s.stopOnSpells ? " checked" : ""}> Stop on every opponent spell and ability</label>
        <label><input type="checkbox" data-set="askTriggers"${s.askTriggers ? " checked" : ""}> Choose targets for my triggers</label>
        ${this.coach && this.coach.companion ? `<label><input type="checkbox" data-set="companion"${this.companionOn ? " checked" : ""}> Companion: guide me each stage</label>` : ""}
        <div class="sep"></div>
        <button data-act="rules">What's simplified</button>
        <button data-act="concede">Concede</button>
        <button data-act="leave">Leave game</button>`;
      m.querySelector("select").value = s.speed;
      m.querySelectorAll("[data-set]").forEach(inp => inp.addEventListener("change", () => {
        const k = inp.dataset.set;
        s[k] = inp.type === "checkbox" ? inp.checked : inp.value;
        saveSettings(Object.assign(settings(), { [k]: s[k] }));
        this.sp = SPEED[s.speed] || SPEED.normal;
        if (k === "companion") { this.companionOn = !!(this.coach && this.coach.companion && s.companion); this.compHidden = null; this.render(); }
      }));
      m.classList.add("on");
    }

    /* -------------------------------------------------------- sheet */
    openSheet(mode, head, body, foot, cancel) {
      const sh = this.$.sheet;
      // a question is waiting for an answer: nothing else may take its place
      if (this.asking && mode !== "prompt") { this.showPrompt(); return document.createElement("div"); }
      this.sheetMode = mode;
      this.sheetCancel = cancel || null;
      sh.querySelector(".hd").innerHTML = head;
      sh.querySelector(".bd").innerHTML = body;
      const ft = sh.querySelector(".ft");
      ft.innerHTML = foot || "";
      ft.style.display = foot ? "" : "none";
      sh.querySelector(".bd").scrollTop = 0;
      sh.style.transform = "";   // a swipe the browser cut short must not leave the sheet off screen
      sh.classList.add("on");
      this.$.scrim.classList.add("on");
      return sh;
    }
    closeSheet(force) {
      if (this.sheetMode === "prompt" && !force) return;
      if (this.asking && force !== "answered") { this.showPrompt(); return; }
      this.sheetMode = null;
      this.sheetCancel = null;
      this.$.sheet.classList.remove("on");
      this.$.scrim.classList.remove("on");
    }
    /* Bring the open question back on screen (it can't be dismissed without an answer). */
    showPrompt() {
      if (!this.asking || this.dead) return;
      this.sheetMode = "prompt";
      this.$.sheet.style.transform = "";
      this.$.sheet.classList.add("on");
      this.$.scrim.classList.add("on");
    }
    bindSheetSwipe() {
      const sh = this.$.sheet;
      let y0 = null, dy = 0;
      sh.addEventListener("touchstart", e => { if (sh.querySelector(".bd").scrollTop > 0) return; y0 = e.touches[0].clientY; dy = 0; }, { passive: true });
      sh.addEventListener("touchmove", e => { if (y0 == null) return; dy = Math.max(0, e.touches[0].clientY - y0); if (dy > 0 && this.sheetMode !== "prompt") sh.style.transform = `translateY(${dy}px)`; }, { passive: true });
      sh.addEventListener("touchend", () => { if (y0 == null) return; sh.style.transform = ""; if (dy > 90 && this.sheetMode !== "prompt") this.closeSheet(); y0 = null; });
      sh.addEventListener("touchcancel", () => { sh.style.transform = ""; y0 = null; });
    }

    /* the card inspector: what it is, its state, and what you can do with it right now */
    inspect(o) {
      const g = this.g, me = this.me;
      // your own face-down permanents show the card underneath
      const d = o.faceDown && o.zone === "battlefield" && o.controller === me ? o.cardDef : o.def;
      const grp = o.zone === "battlefield" ? this.pile(o) : [o];
      const big = artFor(d, "normal");
      const pt = o.zone === "battlefield" ? ptOf(g, o) : d.pt;
      const state = [];
      if (o.zone === "battlefield") {
        if (grp.length > 1) state.push(`${grp.length} identical`);
        if (o.tapped) state.push("tapped");
        if (o.sick && g.isCreature(o) && !g.kw(o, "haste")) state.push("summoning sick");
        for (const k in o.counters) if (o.counters[k]) state.push(`${o.counters[k]} ${k === "p1" ? "+1/+1" : k === "m1" ? "-1/-1" : k} counter${o.counters[k] > 1 ? "s" : ""}`);
        if (o.damage) state.push(`${o.damage} damage`);
        if (g.isCreature(o)) { const kws = [...g.ch(o).kws]; if (kws.length) state.push(kws.join(", ")); }
        if (o.attachedTo) state.push("attached to " + o.attachedTo.def.name);
        if (o.controller !== me) state.push(o.controller.name + "'s");
      }
      if (o.faceDown && o.zone === "battlefield") state.unshift(o.controller === me ? `face down (a 2/2${o.faceDown.kind === "cloak" ? " with ward {2}" : ""})` : "face down");
      if (o.hitCounter) state.push("hit counter");
      if (o.playable && o.playable.by === me && o.zone === "exile") state.push(o.playable.free ? "you may cast it for free" : "you may play it");
      if (o.isCommander && o.zone === "command") state.push(`commander tax ${g.commanderTax(me, o)}`);
      const acts = this.actionsFor(o);
      const body = `<div class="mg-insp">
        ${big ? `<div class="big" style="background-image:url('${big}')"></div>` : `<div class="big frame" style="--c-bg:${bgFor(d)}"><b>${esc(d.name)}</b><span>${costOf(d)}</span><span>${esc(d.type)}</span>${pt ? `<b>${pt[0]}/${pt[1]}</b>` : ""}</div>`}
        <div><div class="type">${costOf(d)} ${esc(d.type)}${pt ? ` · <b>${pt[0]}/${pt[1]}</b>` : ""}</div>
        <div class="text">${rulesOf(d, o)}</div>
        ${state.length ? `<div class="state">${state.map(s => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
        ${d.note ? `<div class="note">In this game: ${esc(d.note)}</div>` : ""}
        </div></div>
        ${acts.length ? `<div class="mg-abil">${acts.map((a, i) => `<div class="row"><button class="use${a.primary ? " go" : ""}" data-i="${i}"${a.ok ? "" : " disabled"}><span>${a.label}</span>${a.cost ? `<span>${mana(a.cost)}</span>` : ""}</button>${a.repeat && a.ok ? `<button class="rep" data-rep="${i}" aria-label="Repeat">×N</button>` : ""}</div>`).join("")}</div>` : ""}`;
      const sh = this.openSheet("inspect", `<h3>${esc(d.doors ? d.name : shortName(d.name))}</h3><button class="mg-icon" data-act="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`, body, "");
      sh.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { const a = acts[+b.dataset.i]; if (a && a.ok) { this.closeSheet(); a.run(); } }));
      sh.querySelectorAll("[data-rep]").forEach(b => b.addEventListener("click", () => { const a = acts[+b.dataset.rep]; if (a) this.askRepeat(a); }));
    }
    actionsFor(o) {
      const g = this.g, me = this.me;
      const out = [];
      const acting = this.acting();
      const instant = this.mode !== "main";
      if (!acting || !this.resolver) return out;
      if (o.zone === "hand" || o.zone === "command" || o.zone === "graveyard" || o.zone === "exile") {
        if (o.def.types.includes("Land")) {
          const ok = !instant && g.canPlayLand(me, o);
          out.push({ label: "Play this land", ok, primary: true, run: () => this.resolve({ type: "land", card: o }) });
          // channel (Boseiju, Eiganjo): discard it from your hand for its effect, at instant speed
          if (o.def.channel && o.zone === "hand") out.push({ label: esc(o.def.channel.label), cost: MK.costString(g.channelCost(me, o), null), ok: g.canChannel(me, o), run: () => this.resolve({ type: "channel", card: o }) });
        } else {
          // a modal double-faced card's land face (Boggart Trawler // Boggart Bog)
          if (o.def.mdfcLand && o.zone === "hand") {
            const ok = !instant && g.canSorcery(me) && me.landsPlayed < g.landDrops(me);
            out.push({ label: `Play as ${esc(o.def.mdfcLand.name)} (land)`, ok, run: () => this.resolve({ type: "land", card: o, back: true }) });
          }
          const ways = g.castOptions(me, o);
          if (!ways.length) out.push({ label: instant && !g.isInstantSpeed(me, o) ? "Only at sorcery speed" : "Can't cast now", ok: false });
          for (const w of ways) {
            const cost = wayCost(w);
            const how = o.zone === "command" ? "Cast from the command zone" : o.zone === "exile" ? "Cast from exile" : "Cast";
            out.push({ label: w.faceDown ? "Cast face down (a 2/2)" : w.free ? "Cast without paying its mana cost" : w.label ? `Cast ${esc(w.label)}` : how, cost, ok: true, primary: !w.faceDown, run: () => this.resolve({ type: "cast", card: o, door: w.door, alt: w.alt, faceDown: !!w.faceDown }) });
          }
          if (o.def.cycling && o.zone === "hand") {
            const ok = g.canPay(me, MK.parseCost(o.def.cycling));
            out.push({ label: "Cycle (discard it, draw a card)", cost: o.def.cycling, ok, run: () => this.resolve({ type: "cycle", card: o }) });
          }
          // transmute and other discard-from-hand abilities on spells (Muddle the Mixture)
          if (o.def.channel && o.zone === "hand") out.push({ label: esc(o.def.channel.label), cost: MK.costString(g.channelCost(me, o), null), ok: g.canChannel(me, o), run: () => this.resolve({ type: "channel", card: o }) });
        }
        if (o.zone === "graveyard") for (const e of g.graveyardAbilities(o)) {
          const ok = g.canActivate(me, o, e, { instant });
          out.push({ label: esc(e.ab.label || "Ability"), cost: e.ab.cost || "", ok, run: () => this.resolve({ type: "activate", card: o, idx: e.i }) });
        }
        return out;
      }
      if (o.zone !== "battlefield" || o.controller !== me) return out;
      for (const e of g.abilitiesOf(o)) {
        const ab = e.ab;
        const ok = g.canActivate(me, o, e, { instant });
        const cost = (ab.cost || "") + (ab.tap ? "{T}" : "");
        const extra = [ab.loyalty != null ? (ab.loyalty > 0 ? "+" : "") + ab.loyalty + " loyalty" : "", ab.removeCounters ? "remove a counter" : "", ab.payLife ? `pay ${ab.payLife} life` : "", ab.sacSelf ? "sacrifice it" : "", ab.untapCreatures ? `untap ${ab.untapCreatures}` : "", ab.tapCreatures ? `tap ${ab.tapCreatures} creatures` : ""].filter(Boolean).join(", ");
        const repeat = !ab.tap && ab.loyalty == null && !ab.once && !ab.sacSelf && !ab.exileSelf && !ab.crew && !ab.levelUp && ab.unlock == null;
        out.push({ label: esc(ab.label || "Ability") + (extra ? ` <small>(${esc(extra)})</small>` : ""), cost, ok, repeat, run: (n) => this.resolve({ type: "activate", card: o, idx: e.i, repeat: n || 1, record: (n || 1) > 1 }) });
      }
      return out;
    }
    askRepeat(a) {
      this.closeSheet();
      this.numberSheet("How many times?", 1, 99, 10, "Repeat", n => { if (n > 0) a.run(n); }, true);
    }
    showLands(p) {
      const g = this.g;
      const lands = g.battlefield.filter(o => o.controller === p && g.isLand(o));
      const grps = this.groups(p).filter(gr => g.isLand(gr[0]));
      const body = `<div class="mg-grid">${grps.map(gr => this.cardHTML(gr, { dot: p === this.me && this.acting() && this.hasAbility(gr[0]) })).join("")}</div>`;
      const sh = this.openSheet("inspect", `<h3>${p === this.me ? "Your lands" : esc(p.name) + "'s lands"}</h3><p>${lands.length} lands, ${lands.filter(o => !o.tapped).length} untapped</p>`, body, `<button class="mg-btn wide" data-act="close">Close</button>`);
      sh.querySelectorAll(".bd [data-oid]").forEach(b => b.addEventListener("click", () => { const o = g.find(+b.dataset.oid); if (o) this.inspect(o); }));
    }
    showZone(p, zone) {
      const list = p[zone].slice().reverse();
      const body = list.length ? `<div class="mg-grid">${list.map(o => `<div class="opt">${this.cardHTML([o], { dot: false })}</div>`).join("")}</div>` : `<p style="color:var(--dim)">Nothing here yet.</p>`;
      const sh = this.openSheet("inspect", `<h3>${zone === "graveyard" ? "Graveyard" : "Exile"}</h3><p>${list.length} card${list.length === 1 ? "" : "s"}</p>`, body, `<button class="mg-btn wide" data-act="close">Close</button>`);
      sh.querySelectorAll(".bd [data-oid]").forEach(b => b.addEventListener("click", () => { const o = list.find(x => x.id === +b.dataset.oid); if (o) this.inspect(o); }));
    }
    /* Every instant-speed thing you can do right now, as one list. */
    showResponses() {
      const acts = (this.respondCtx && this.respondCtx.actions) || [];
      const rows = acts.map((a, i) => {
        const o = a.card;
        const label = a.type === "cast" ? `Cast ${o.def.name}${a.label ? " (" + a.label + ")" : ""}` : a.type === "cycle" ? `Cycle ${o.def.name}` : a.type === "channel" ? `${o.def.channel.label}: ${shortName(o.def.name)}` : `${a.ab.label || "Ability"}: ${shortName(o.def.name)}`;
        const cost = a.type === "cast" ? wayCost(a) : a.type === "cycle" || a.type === "channel" ? MK.costString(a.cost, null) : (a.ab.cost || "") + (a.ab.tap ? "{T}" : "");
        return `<div class="row"><button class="use${a.type === "cast" ? " go" : ""}" data-i="${i}"><span>${esc(label)}</span>${cost ? `<span>${mana(cost)}</span>` : ""}</button></div>`;
      }).join("");
      const sh = this.openSheet("inspect", `<h3>Your options</h3><button class="mg-icon" data-act="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`, `<div class="mg-abil">${rows}</div>`, "");
      sh.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => {
        const a = acts[+b.dataset.i];
        if (!a) return;
        this.closeSheet();
        this.resolve({ type: a.type, card: a.card, idx: a.idx, door: a.door, alt: a.alt, faceDown: a.faceDown });
      }));
    }
    /* -------------------------------------------------------- the coach (decks with coach tips) */
    coachTips() {
      if (!this.coach || !this.g || this.g.phase === "setup") return [];
      const key = this.g.v + ":" + this.mode;
      if (this.tipKey === key) return this.tipCache;
      let tips = [];
      try { tips = this.coach.tips(this.g, this.me) || []; } catch (err) { console.error("[miku game] coach", err); }
      this.tipKey = key; this.tipCache = tips;
      return tips;
    }
    // the most urgent tip, for the hint line: a win, or something to do now
    topTip(respond) {
      if (!this.coach || this.s.coachHints === false) return "";
      const t = this.coachTips().find(x => x.level === "win" || x.level === "now" || (x.level === "warn" && !respond));
      return t ? `<span class="mg-tiphint lv-${t.level}" data-act="coach">💡 ${esc(t.title)}</span>` : "";
    }
    renderCoach() {
      const b = this.$.coachBtn;
      if (!this.coach) return;
      const urgent = this.coachTips().filter(x => x.level === "win" || x.level === "now").length;
      const badge = b.querySelector(".badge");
      const txt = urgent ? String(urgent) : "";
      if (badge.textContent !== txt) badge.textContent = txt;
      b.classList.toggle("hot", this.coachTips().some(x => x.level === "win"));
      if (this.sheetMode === "coach") this.fillCoach();
    }
    docked() { return root.innerWidth >= 1240; }
    /* The deck's turn planner (Corrupted Miku): ranked lines, threats and who can respond. */
    coachPlan() {
      if (!this.coach || !this.coach.plan || !this.g || this.g.phase === "setup") return null;
      try { return this.coach.plan(this.g, this.me); } catch (err) { console.error("[miku game] plan", err); return null; }
    }
    /* The companion: one stage of the game plan at a time, with the steps for this moment. */
    companionCtx() {
      const m = this.mode, c = this.respondCtx;
      if (m === "attack") return { mode: "attack", candidates: this.atkCands || [] };
      if (m === "block") return { mode: "block", attackers: this.blockCtx || [] };
      if (m === "respond" && c) return { mode: "respond", window: c.window, top: c.top, turnOf: c.turnOf, can: (c.actions || []).map(a => a.card && a.card.def.name).filter(Boolean) };
      if (m === "main") return { mode: "main" };
      return { mode: "wait" };
    }
    companionAdvice(ctx) {
      ctx = ctx || this.companionCtx();
      if (!this.companionOn || !this.g || (this.g.phase === "setup" && ctx.mode !== "mulligan")) return null;
      const key = this.g.v + ":" + ctx.mode + ":" + (ctx.top ? ctx.top.id : "") + ":" + (ctx.window || "");
      if (this.compCacheKey === key) return this.compCache;
      let r = null;
      try { r = this.coach.companion(this.g, this.me, ctx); } catch (err) { console.error("[miku game] companion", err); }
      this.compCacheKey = key; this.compCache = r;
      return r;
    }
    renderCompanion() {
      const box = this.$.comp;
      const g = this.g;
      // while your own spells resolve, keep the advice you were reading
      let a = (this.mode === "wait" || this.mode === "prompt") && g.active === this.me && this.compLast ? this.compLast : this.companionAdvice();
      if (a && a.steps && a.steps.length) this.compLast = a;
      const show = !!(a && a.steps && a.steps.length) && !g.over;
      const key = show ? a.stage + "|" + a.title : "";
      this.compKey = key;
      const hide = !show || this.compHidden === key || (this.sheetMode && !this.docked());
      if (box.hidden !== hide) box.hidden = hide;
      if (hide) return;
      const chips = list => (list || []).length ? `<span class="cards">${list.map(n => `<b data-card="${esc(n)}">${esc(shortName(n))}</b>`).join("")}</span>` : "";
      // wide screens: the companion is docked in the rail above the log, so it has room for every step and the lines
      const docked = this.docked();
      const plan = docked && !this.compMin ? this.coachPlan() : null;
      const lines = plan ? plan.lines.slice(0, 3) : [];
      const html = `<div class="hd" data-act="compmin"><span class="stage">${esc(a.stage)}</span><b>${esc(a.title || "")}</b><span class="tog" aria-hidden="true">${this.compMin ? "▴" : "▾"}</span></div>
        ${this.compMin ? "" : `<ol>${a.steps.slice(0, docked ? 8 : 4).map(st => `<li>${mana(st.text)}${chips(st.cards)}</li>`).join("")}</ol>`}
        ${lines.length ? `<div class="lines"><h4>Your lines</h4>${lines.map(l => `<button class="ln w-${l.when}" data-act="coachplan"><span class="when">${esc(WHEN[l.when] || l.when)}</span><b>${esc(l.short || l.title)}</b><span class="cost">${l.when === "blocked" ? esc("by " + l.blockedBy.map(h => shortName(h.name)).join(", ")) : mana(l.cost)}</span></button>`).join("")}</div>` : ""}
        <div class="ft"><button data-act="coach">Coach and checklist</button><button data-act="compclose" aria-label="Hide until the next stage">Hide</button></div>`;
      box.classList.toggle("urgent", !!a.urgent);
      box.classList.toggle("docked", docked);
      if (this.compHTML !== html) { box.innerHTML = html; this.compHTML = html; }
      if (docked) { if (box._b != null) { box.style.bottom = ""; box._b = null; } return; }
      // sits just above the line between the boards, over the opponents' side
      const mid = this.$.mid;
      const bottom = this.el.clientHeight - mid.offsetTop + 4;
      if (box._b !== bottom) { box.style.bottom = bottom + "px"; box._b = bottom; }
    }
    showCoach() {
      if (!this.coach) return;
      this.coachTab = this.coachTab || (this.coach.plan ? "plan" : "tips");
      const sh = this.openSheet("coach", `<h3>Coach</h3><div class="mg-tabs">${this.coach.plan ? `<button data-ct="plan">Plan</button>` : ""}<button data-ct="tips">Look for</button><button data-ct="list">Checklist</button></div><button class="mg-icon" data-act="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`, `<div class="mg-coach"></div>`, "");
      sh.querySelectorAll("[data-ct]").forEach(b => b.addEventListener("click", () => { this.coachTab = b.dataset.ct; this.coachHTML = ""; this.fillCoach(); }));
      this.coachHTML = "";
      this.fillCoach();
    }
    fillCoach() {
      const sh = this.$.sheet, box = sh.querySelector(".mg-coach");
      if (!box) return;
      sh.querySelectorAll("[data-ct]").forEach(b => b.classList.toggle("on", b.dataset.ct === this.coachTab));
      const cardLinks = list => (list || []).length ? `<div class="cards">${list.map(n => `<b data-card="${esc(n)}">${esc(shortName(n))}</b>`).join("")}</div>` : "";
      let html;
      if (this.coachTab === "plan") {
        const r = this.coachPlan();
        if (!r) html = `<p>The plan shows once the game starts.</p>`;
        else {
          const st = r.state || {};
          const lines = r.lines.map(l => `<div class="pl w-${l.when}"><div class="pl-hd"><span class="when">${esc(WHEN[l.when] || l.when)}</span><b>${esc(l.title)}</b>${l.kill ? "" : `<small>not a kill alone</small>`}<span class="cost">${l.when === "blocked" ? "" : l.early ? `${mana(l.early)} at their end step, ${mana(l.onTurn)} on your turn` : `${mana(l.cost)} · ${l.mana} mana`}</span></div>
            ${l.blockedBy.length ? `<p class="why">Switched off by ${l.blockedBy.map(h => `${esc(h.owner)}'s <b data-card="${esc(h.name)}">${esc(shortName(h.name))}</b>`).join(", ")}.</p>` : ""}
            <ol>${l.steps.map(x => `<li>${mana(x.text)}${cardLinks(x.cards)}</li>`).join("")}</ol></div>`).join("");
          const threats = r.threats.map(t => `<div class="tip lv-${t.level === "high" ? "warn" : "info"}"><span class="lv">${esc({ hate: "Hate piece", lethal: "Can kill you", pressure: "Pressure", threat: "Biggest threat" }[t.kind] || "Threat")}</span><b>${esc(t.title)}</b><p>${mana(t.text)}${t.answerText ? " " + mana(t.answerText) : ""}</p>${cardLinks([t.kind === "hate" || t.kind === "threat" ? t.name : null].concat(t.answers.slice(0, 2)).filter(Boolean))}</div>`).join("");
          const who = r.risk.who;
          html = `<p class="pl-mana">Mana: <b>${st.manaNow}</b> now, <b>${st.manaNext}</b> once you untap.${r.risk.quiet ? ` ${esc(r.risk.quiet)} keeps opponents quiet on your turn.` : who.length ? ` ${esc(who.join(", "))} ${who.length > 1 ? "have" : "has"} cards and open mana.` : ""}</p>
            <h4 class="pl-h">Lines, best first</h4>${lines || `<p class="pl-none">No combo piece or tutor in reach yet: draw, ramp and dig.</p>`}
            ${threats ? `<h4 class="pl-h">Threats</h4>${threats}` : ""}`;
        }
      } else if (this.coachTab === "list") {
        const g = this.g, mine = g.active === this.me;
        const now = g.phase === "setup" ? "mulligan" : !mine ? "theirs" : g.phase === "upkeep" || g.phase === "untap" ? "upkeep" : g.phase === "draw" ? "draw" : g.phase === "main1" ? "main1" : g.phase === "main2" ? "main2" : /attack|block|damage|combat/i.test(g.phase) ? "combat" : "";
        const list = (root.MK_CHECKLISTS || {})[this.coach.checklist] || [];
        html = list.map(sec => `<section class="${sec.phase === now ? "now" : ""}"><h4>${esc(sec.when)}${sec.phase === now ? " <small>now</small>" : ""}</h4><ul>${sec.items.map(it => `<li>${mana(it.text)}${cardLinks(it.cards)}</li>`).join("")}</ul></section>`).join("") || `<p>No checklist for this deck.</p>`;
      } else {
        const tips = this.coachTips();
        const LV = { win: "You can win", now: "Do it now", plan: "Plan", warn: "Watch out", info: "Good to know" };
        html = tips.map(t => `<div class="tip lv-${t.level}"><span class="lv">${LV[t.level] || ""}</span><b>${esc(t.title)}</b><p>${mana(t.text)}</p>${cardLinks(t.cards)}</div>`).join("") + `<label class="opt"><input type="checkbox" data-coachhints${this.s.coachHints === false ? "" : " checked"}> Show the top tip in the hint line</label>`;
      }
      if (this.coachHTML === html) return;
      this.coachHTML = html;
      box.innerHTML = html;
      const cb = box.querySelector("[data-coachhints]");
      if (cb) cb.addEventListener("change", () => { this.s.coachHints = cb.checked; saveSettings(this.s); this.render(); });
    }
    showRules() {
      const body = `<ol style="padding-left:18px;margin:0;display:flex;flex-direction:column;gap:8px;font-size:.84rem;line-height:1.4">${MK.SIMPLIFICATIONS.map(s => `<li>${esc(s)}</li>`).join("")}</ol>`;
      this.openSheet("inspect", `<h3>How this game differs from paper Magic</h3>`, body, `<button class="mg-btn wide" data-act="close">Got it</button>`);
    }

    /* -------------------------------------------------------- the questions the engine asks */
    async askMulligan(ctx) {
      this.mode = "mulligan";
      this.render();
      const hand = ctx.hand;
      const lands = hand.filter(o => o.def.types.includes("Land")).length;
      const ramp = hand.filter(o => !o.def.types.includes("Land") && o.def.ai && o.def.ai.ramp).length;
      const comp = this.companionOn ? this.companionAdvice({ mode: "mulligan", hand, mulls: ctx.mulls }) : null;
      const verdict = comp ? comp.title + "." : lands >= 3 && lands <= 5 ? `A keep: enough lands to cast ${shortName(this.me.commanders[0] ? this.me.commanders[0].def.name : "your commander")} on time.` : lands === 2 && ramp ? "Two lands and ramp: a fine keep." : lands < 2 ? "Too few lands. Mulligan unless you feel lucky." : lands > 5 ? "Very land-heavy. A mulligan is reasonable." : "Two lands and no ramp: risky.";
      const over = document.createElement("div");
      over.className = "mg-over";
      over.innerHTML = `<div class="mg-mull"><h2 style="font-size:1.6rem">Opening hand</h2>
        <div class="hand7">${hand.map(o => `<div class="hc" data-oid="${o.id}"><span class="art" style="${artStyle(o.def)}"></span><span class="cost">${costOf(o.def)}</span><span class="nm">${esc(o.def.name.split(" // ")[0])}</span></div>`).join("")}</div>
        <p class="facts">${lands} land${lands === 1 ? "" : "s"}${ramp ? `, ${ramp} ramp` : ""}. ${esc(verdict)}</p>
        ${comp ? `<ul class="mg-compmull">${comp.steps.map(st => `<li>${mana(st.text)}</li>`).join("")}</ul>` : ""}</div>
        <div class="btns"><button class="mg-btn" data-m="0">Mulligan${ctx.mulls === 0 ? " (free)" : ""}</button><button class="mg-btn go" data-m="1">Keep ${7 - Math.max(0, ctx.mulls - 1)}</button></div>`;
      this.el.appendChild(over);
      over.querySelectorAll(".hc").forEach(c => c.addEventListener("click", () => { const o = hand.find(x => x.id === +c.dataset.oid); if (o) this.inspect(o); }));
      const keep = await new Promise(res => over.querySelectorAll("[data-m]").forEach(b => b.addEventListener("click", () => res(b.dataset.m === "1"))));
      over.remove();
      this.closeSheet(true);
      this.mode = "wait";
      return keep;
    }
    async askMain(ctx) {
      const g = this.g;
      if (ctx.phase === "main2" && this.skipMain2 === g.turn) return { type: "pass" };
      this.closeSheet(true);
      return this.wait("main");
    }
    async askAttack(ctx) {
      this.atkCands = ctx.candidates;
      const opps = this.opps().filter(p => !p.lost);
      this.atkTarget = opps.find(p => p.id === this.focusId) || opps[0];
      this.atk.clear();
      const r = await this.wait("attack");
      this.atkCands = null;
      return r || [];
    }
    toggleAttack(o) {
      const cands = new Set((this.atkCands || []).map(x => x.id));
      if (!cands.has(o.id)) return;
      const key = this.pileKey(o, true);
      const mates = (this.atkCands || []).filter(x => this.pileKey(x, true) === key);
      const inNow = mates.filter(x => this.atk.has(x.id));
      if (!this.atk.has(o.id)) { mates.forEach(x => { if (!this.atk.has(x.id)) this.atk.set(x.id, this.atkTarget); }); this.render(); return; }
      if (mates.length < 2) { this.atk.delete(o.id); this.render(); return; }
      this.numberSheet(`How many ${shortName(o.def.name)} attack?`, 0, mates.length, inNow.length, "Set", n => {
        mates.forEach((x, i) => { if (i < n) { if (!this.atk.has(x.id)) this.atk.set(x.id, this.atkTarget); } else this.atk.delete(x.id); });
        this.render();
      }, true);
    }
    async askBlock(ctx) {
      // nothing of yours can block any of them: no question to answer
      const g = this.g;
      if (!g.creatures(this.me).some(b => ctx.attackers.some(a => g.canBlock(b, a)))) return [];
      this.blockCtx = ctx.attackers;
      this.sel = ctx.attackers[0] || null;
      this.blk.clear();
      const r = await this.wait("block");
      this.blockCtx = null;
      return r || [];
    }
    toggleBlock(o) {
      const g = this.g;
      if (this.blk.has(o.id)) { this.blk.delete(o.id); this.render(); return; }
      if (!this.sel) return;
      const grp = this.pile(o).filter(x => !this.blk.has(x.id) && g.canBlock(x, this.sel));
      if (!grp.length) return;
      this.blk.set(grp[0].id, this.sel);
      this.render();
    }
    async askRespond(ctx) {
      const g = this.g, me = this.me;
      const acts = ctx.actions || [];
      const spells = acts.filter(a => a.type === "cast");
      // the companion stops the game when it has advice for this moment (a Giver save, a wipe, an end-step tutor)
      const help = acts.length && ctx.window !== "trigger" && this.companionOn ? this.companionAdvice({ mode: "respond", window: ctx.window, top: ctx.top, turnOf: ctx.turnOf, can: acts.map(a => a.card && a.card.def.name).filter(Boolean) }) : null;
      if (help && help.urgent) { /* stop */ }
      else if (ctx.window === "stack") {
        if (!spells.length && !this.s.stopOnSpells) return null;
        if (!acts.length) return null;
      } else if (ctx.window === "ability") {
        // an ability on the stack: stop when it targets you or yours and an instant could answer it,
        // or always with "Stop on every opponent spell"
        const mine = (ctx.top.targets || []).some(t => t && (t === me || (!t.kind && !g.isPlayer(t) && t.controller === me)));
        if (!acts.length || !(this.s.stopOnSpells || (mine && spells.length))) return null;
      } else if (ctx.window === "attackers") {
        const c = g.combat;
        const atMe = c && c.attacker !== me && c.attackers.some(a => a.combat && g.defenderOf(a.combat.attacking) === me);
        if (!atMe || !spells.length) return null;
      } else if (ctx.window === "combat") {
        const c = g.combat;
        const involved = c && (c.attacker === me || c.attackers.some(a => a.combat && g.defenderOf(a.combat.attacking) === me));
        if (!involved || !acts.length) return null;
      } else if (ctx.window === "end") {
        if (g.nextPlayer(ctx.turnOf) !== me || !acts.length) return null;
      } else if (ctx.window === "trigger") {
        if (!spells.length) return null;
      }
      if (this.fastForward) this.fastForward = false;
      this.respondCtx = ctx;
      const r = await this.wait("respond");
      this.respondCtx = null;
      return r;
    }

    /* One sheet per question type. Trigger targets are picked for you unless you asked for them. */
    async askChoice(req) {
      const g = this.g;
      const fromTrigger = (req.spec && req.spec.trigger) || (req.type === "distribute" && req.src && req.src.zone === "battlefield");
      if (fromTrigger && !this.s.askTriggers) return this.helper.choose(g, this.me, req);
      if (req.auto && req.options && req.options.length === 1) return req.type === "cards" ? req.options.slice() : req.options[0];
      if (req.purpose === "manaColor" || req.purpose === "altExile" && req.options.length === 1) return this.helper.choose(g, this.me, req);
      const prev = this.mode;
      this.mode = "prompt";
      this.render();
      let r;
      this.asking = (this.asking || 0) + 1;
      try {
      switch (req.type) {
        case "confirm": r = await this.confirmSheet(req); break;
        case "number": r = req.min === req.max ? req.min : await new Promise(res => this.numberSheet(req.prompt, req.min, req.max, req.max, "OK", res, false)); break;
        case "option": r = await this.optionSheet(req); break;
        case "target": case "player": r = await this.targetSheet(req); break;
        case "cards": case "targets": r = await this.cardsSheet(req); break;
        case "distribute": r = await this.distributeSheet(req); break;
        default: r = this.helper.choose(g, this.me, req);
      }
      } catch (err) {
        // a question that can't be drawn is answered for you rather than leaving the game waiting
        console.error("[miku game] question", err);
        this.appendLog({ text: `Display error (${err && err.message || err}). That choice was made for you.`, kind: "big" });
        r = this.helper.choose(g, this.me, req);
      } finally { this.asking--; }
      if (!this.asking) this.closeSheet("answered");
      this.mode = prev === "prompt" ? "wait" : prev;
      this.render();
      return r;
    }
    srcLine(req) { return req.src && req.src.def ? `<p>${esc(req.src.def.name)}</p>` : ""; }
    confirmSheet(req) {
      return new Promise(res => {
        const sh = this.openSheet("prompt", `<div><h3>${esc(req.prompt)}</h3>${this.srcLine(req)}</div>`, "", `<button class="mg-btn wide" data-y="0">No</button><button class="mg-btn go wide" data-y="1">Yes</button>`);
        sh.querySelectorAll("[data-y]").forEach(b => b.addEventListener("click", () => res(b.dataset.y === "1"), { once: true }));
      });
    }
    numberSheet(title, min, max, start, ok, done, cancellable) {
      let v = Math.max(min, Math.min(max, start));
      const body = `<div class="mg-num"><button data-d="-1" aria-label="Less">−</button><b>${v}</b><button data-d="1" aria-label="More">+</button></div>
        <input class="mg-range" type="range" min="${min}" max="${max}" value="${v}" aria-label="Amount">
        <div class="mg-quick">${[min, Math.floor((min + max) / 2), max].filter((x, i, a) => a.indexOf(x) === i).map(x => `<button data-q="${x}">${x}</button>`).join("")}</div>`;
      const sh = this.openSheet("prompt", `<div><h3>${esc(title)}</h3><p>From ${min} to ${max}</p></div>`, body, `${cancellable ? `<button class="mg-btn wide" data-c>Cancel</button>` : ""}<button class="mg-btn go wide" data-ok>${esc(ok)}</button>`, cancellable ? () => { this.closeSheet(true); } : null);
      const b = sh.querySelector(".mg-num b"), range = sh.querySelector(".mg-range");
      const set = x => { v = Math.max(min, Math.min(max, x)); b.textContent = v; range.value = v; };
      sh.querySelectorAll("[data-d]").forEach(x => x.addEventListener("click", () => set(v + +x.dataset.d)));
      sh.querySelectorAll("[data-q]").forEach(x => x.addEventListener("click", () => set(+x.dataset.q)));
      range.addEventListener("input", () => set(+range.value));
      sh.querySelector("[data-ok]").addEventListener("click", () => { if (cancellable) this.closeSheet(true); done(v); }, { once: true });
      const c = sh.querySelector("[data-c]");
      if (c) c.addEventListener("click", () => this.closeSheet(true), { once: true });
    }
    optionSheet(req) {
      return new Promise(res => {
        const sh = this.openSheet("prompt", `<div><h3>${esc(req.prompt)}</h3>${this.srcLine(req)}</div>`, `<div class="mg-opts">${req.options.map(o => `<button data-o="${esc(o.id)}">${esc(o.label)}</button>`).join("")}</div>`, "");
        sh.querySelectorAll("[data-o]").forEach(b => b.addEventListener("click", () => { const o = req.options.find(x => String(x.id) === b.dataset.o); res(o ? o.id : req.options[0].id); }, { once: true }));
      });
    }
    playerChip(p, sel) {
      const cmd = p.commanders[0], a = cmd && K.art(cmd.def.name);
      return `<button class="mg-pl${sel ? " sel" : ""}" data-p="${p.id}"><span class="av" style="${a ? `background-image:url('${a.crop}')` : ""}"></span><span>${esc(p === this.me && !this.watching ? "You" : p.name)}</span><b>${p.life}</b></button>`;
    }
    targetSheet(req) {
      const g = this.g;
      return new Promise(res => {
        const players = req.options.filter(o => g.isPlayer(o));
        // spells on the stack (counterspells) are shown by the card being cast
        const spells = req.options.filter(o => o && o.kind === "spell" && o.o);
        const objs = req.options.filter(o => !g.isPlayer(o) && !spells.includes(o));
        const byOwner = new Map();
        for (const o of objs) { const k = o.zone === "battlefield" ? o.controller : o.owner; if (!byOwner.has(k)) byOwner.set(k, []); byOwner.get(k).push(o); }
        let body = players.length ? `<div class="mg-players">${players.map(p => this.playerChip(p)).join("")}</div>` : "";
        if (spells.length) body += `<div class="mg-sub">On the stack</div><div class="mg-grid">${spells.map(it => `<div class="opt" data-spell="${it.id}">${this.cardHTML([it.o], {})}<span class="who">${esc(it.p === this.me ? "Yours" : it.p.name)}: ${esc(it.name)}</span></div>`).join("")}</div>`;
        for (const [owner, list] of byOwner) {
          body += `<div class="mg-sub">${owner === this.me ? (list[0].zone === "graveyard" ? "Your graveyard" : "Yours") : esc(owner ? owner.name : "") + (list[0].zone === "graveyard" ? "'s graveyard" : "")}</div><div class="mg-grid">${list.map(o => `<div class="opt">${this.cardHTML([o], {})}</div>`).join("")}</div>`;
        }
        const foot = req.optional ? `<button class="mg-btn wide" data-none>Skip</button>` : "";
        const sh = this.openSheet("prompt", `<div><h3>${esc(req.prompt || "Choose a target")}</h3>${this.srcLine(req)}</div>`, body, foot);
        sh.querySelectorAll("[data-p]").forEach(b => b.addEventListener("click", () => res(players.find(p => p.id === b.dataset.p)), { once: true }));
        sh.querySelectorAll(".bd [data-spell]").forEach(b => b.addEventListener("click", () => res(spells.find(it => it.id === +b.dataset.spell)), { once: true }));
        sh.querySelectorAll(".bd .opt:not([data-spell]) [data-oid]").forEach(b => b.addEventListener("click", () => res(objs.find(o => o.id === +b.dataset.oid)), { once: true }));
        const none = sh.querySelector("[data-none]");
        if (none) none.addEventListener("click", () => res(null), { once: true });
      });
    }
    cardsSheet(req) {
      const g = this.g;
      return new Promise(res => {
        const min = req.min || 0, max = req.max == null ? req.options.length : req.max;
        // identical cards share a tile with a count (seven Plains, twenty Soldier tokens)
        const piles = new Map();
        for (const o of req.options) { const k = this.pileKey(o, true); if (!piles.has(k)) piles.set(k, []); piles.get(k).push(o); }
        const keys = [...piles.keys()];
        const chosen = new Map();
        const picked = () => { const out = []; for (const [k, n] of chosen) out.push(...piles.get(k).slice(0, n)); return out; };
        const total = () => [...chosen.values()].reduce((a, b) => a + b, 0);
        const crew = req.purpose === "crew" ? req.need : 0;
        const power = () => picked().reduce((a, o) => a + Math.max(0, g.power(o)), 0);
        const body = `<div class="mg-grid">${keys.map((k, i) => `<div class="opt" data-k="${i}">${this.cardHTML([piles.get(k)[0]], { count: piles.get(k).length })}${piles.get(k)[0].zone === "battlefield" && piles.get(k)[0].controller !== this.me ? `<span class="who">${esc(piles.get(k)[0].controller.name)}</span>` : ""}</div>`).join("")}</div>`;
        const label = crew ? `Tap creatures with total power ${crew} or more` : min === max ? `Choose ${min}` : max >= req.options.length && min === 0 ? "Choose any number" : `Choose ${min ? min + " to " : "up to "}${max}`;
        const auto = min > 0 || req.purpose === "cultivate" || req.purpose === "tutor";
        const sh = this.openSheet("prompt", `<div><h3>${esc(req.prompt || "Choose cards")}</h3><p>${label}</p></div>`, body, `${auto ? `<button class="mg-btn" data-auto>Pick for me</button>` : ""}<button class="mg-btn go wide" data-ok>Done</button>`);
        const okBtn = sh.querySelector("[data-ok]");
        const ok = () => { const n = total(); return n >= min && n <= max && (!crew || power() >= crew); };
        const refresh = () => {
          const n = total();
          okBtn.disabled = !ok();
          okBtn.textContent = crew ? `Crew (${power()}/${crew})` : n ? `Done (${n})` : min ? `Choose ${min}` : "None";
          sh.querySelectorAll(".opt").forEach(el => {
            const k = keys[+el.dataset.k], list = piles.get(k), c = chosen.get(k) || 0;
            const mc = el.querySelector(".mc");
            mc.classList.toggle("sel", c > 0);
            let q = mc.querySelector(".qty");
            if (list.length > 1) { if (!q) { q = document.createElement("span"); q.className = "qty"; mc.appendChild(q); } q.textContent = c ? `${c}/${list.length}` : "×" + list.length; }
          });
        };
        sh.querySelectorAll(".opt").forEach(el => el.addEventListener("click", () => {
          const k = keys[+el.dataset.k], list = piles.get(k);
          const c = chosen.get(k) || 0;
          if (max === 1) { const was = c; chosen.clear(); if (!was) chosen.set(k, 1); }
          else if (c >= list.length || total() >= max) chosen.set(k, 0);
          else chosen.set(k, c + 1);
          refresh();
          if (max === 1 && min === 1 && total() === 1) res(picked());
        }));
        okBtn.addEventListener("click", () => { if (ok()) res(picked()); });
        const a = sh.querySelector("[data-auto]");
        if (a) a.addEventListener("click", () => {
          let r = this.helper.choose(g, this.me, req);
          if (!Array.isArray(r)) r = r ? [r] : [];
          r = r.filter(o => req.options.includes(o)).slice(0, max);
          if (r.length < min) for (const o of req.options) { if (r.length >= min) break; if (!r.includes(o)) r.push(o); }
          res(r);
        });
        refresh();
      });
    }
    distributeSheet(req) {
      return new Promise(res => {
        const opts = req.options;
        const map = {};
        let left = req.total;
        const body = `<p style="margin:0 0 10px;color:var(--soft);font-size:.8rem"><b data-left>${left}</b> left to place</p><div class="mg-dist">${opts.map(o => `<div class="row" data-id="${o.id}">${this.cardHTML([o], {})}<span class="nm2">${esc(o.def.name)}</span><span class="step"><button data-d="-1">−</button><b>0</b><button data-d="1">+</button></span></div>`).join("")}</div>`;
        const sh = this.openSheet("prompt", `<div><h3>${esc(req.prompt)}</h3>${this.srcLine(req)}</div>`, body, `<button class="mg-btn wide" data-auto>Spread for me</button><button class="mg-btn go wide" data-ok>Done</button>`);
        const paint = () => { sh.querySelector("[data-left]").textContent = left; sh.querySelectorAll(".row").forEach(r => { r.querySelector(".step b").textContent = map[r.dataset.id] || 0; }); };
        sh.querySelectorAll(".row").forEach(r => r.querySelectorAll("[data-d]").forEach(b => b.addEventListener("click", () => {
          const id = r.dataset.id, d = +b.dataset.d, cur = map[id] || 0;
          if (d > 0 && left <= 0) return;
          if (d < 0 && cur <= 0) return;
          map[id] = cur + d; left -= d; paint();
        })));
        sh.querySelector("[data-auto]").addEventListener("click", () => res(this.helper.choose(this.g, this.me, req)), { once: true });
        sh.querySelector("[data-ok]").addEventListener("click", () => res(map), { once: true });
      });
    }

    /* -------------------------------------------------------- the end */
    finish() {
      if (this.dead) return;
      const g = this.g, me = this.me;
      this.mode = "over";
      this.render();
      const win = g.winner === me;
      const draw = !g.winner && g.endInfo && g.endInfo.draw;
      const rounds = Math.max(1, g.round);
      const killer = !win && !draw ? youText((g.logs.slice().reverse().find(e => e.kind === "lose" && e.p === me) || {}).text || "") : "";
      if (this.gm && this.gm.kind === "puzzle") return this.finishPuzzle();
      if (this.watching) return this.finishWatch();
      if (this.rec && !this.left) {
        const rec = this.rec;
        rec.result = { win, draw, rounds, turn: g.turn, conceded: !!this.conceded, killer, winner: g.winner ? g.winner.idx : null, out: g.players.map(p => p.lost ? p.lostReason : ""), life: g.players.map(p => p.life), dmg: me.stats.dmg, ms: Date.now() - this.startedAt };
        // the log, compact: turn lines and the plays, for the review's timeline
        rec.log = g.logs.filter(e => e.kind !== "mana").slice(-900).map(e => [e.kind || "", e.p ? e.p.idx : -1, String(e.text || "").slice(0, 220), e.turn]);
        try { if (this.gm.onDone) this.gm.onDone(rec); } catch (err) { console.error("[miku game] practice save", err); }
      }
      const st = loadStats();
      st.games++;
      if (win) { st.wins++; if (!st.best || rounds < st.best) st.best = rounds; } else if (draw) st.draws++; else st.losses++;
      st.most = Math.max(st.most || 0, me.stats.dmg);
      st.life = Math.max(st.life || 0, me.life);
      for (const p of this.opps()) {
        const id = p.deckId || p.name;
        st.decks[id] = st.decks[id] || { w: 0, l: 0 };
        if (win) st.decks[id].w++; else if (!draw) st.decks[id].l++;
      }
      st.recent = [{ t: Date.now(), win, draw, rounds, vs: this.opps().map(p => p.deckId), dmg: me.stats.dmg, gained: me.stats.gained, tokens: me.stats.tokens }].concat(st.recent || []).slice(0, 20);
      if (!this.left) saveStats(st);
      if (this.left) return;
      const over = document.createElement("div");
      over.className = "mg-over";
      const title = win ? "Victory" : draw ? "Draw" : "Defeated";
      const sub = win ? `You won in ${rounds} round${rounds === 1 ? "" : "s"}.` : draw ? "The game hit the turn limit." : this.conceded ? "You conceded." : esc(killer || "You're out of the game.");
      over.innerHTML = `<h2 class="${win ? "win" : "loss"}">${title}</h2><p>${sub}</p>
        <div class="stats">
          <div><b>${me.stats.dmg}</b><span>damage dealt</span></div>
          <div><b>${me.stats.gained}</b><span>life gained</span></div>
          <div><b>${me.stats.tokens}</b><span>tokens made</span></div>
          <div><b>${Object.values(me.stats.cast).reduce((a, b) => a + b, 0)}</b><span>spells cast</span></div>
        </div>
        <p>Record: ${st.wins} win${st.wins === 1 ? "" : "s"} in ${st.games} game${st.games === 1 ? "" : "s"}.</p>
        ${this.rec ? `<div class="btns"><button class="mg-btn" data-e="log">Game log</button><button class="mg-btn" data-e="lobby">Back</button><button class="mg-btn go" data-e="review">Review this game</button></div>` : `<div class="btns"><button class="mg-btn" data-e="log">Game log</button><button class="mg-btn" data-e="lobby">Lobby</button><button class="mg-btn go" data-e="again">Rematch</button></div>`}`;
      this.el.appendChild(over);
      if (win) this.notes();
      over.addEventListener("click", e => {
        const b = e.target.closest("[data-e]");
        if (!b) return;
        if (b.dataset.e === "log") { over.style.display = "none"; this.$.log.classList.add("on"); const back = () => { over.style.display = ""; this.$.log.removeEventListener("transitionend", back); }; this.$.log.querySelector("[data-act]").addEventListener("click", () => { over.style.display = ""; }, { once: true }); }
        if (b.dataset.e === "lobby") { this.destroy(); if (this.opts.onExit) this.opts.onExit(); }
        if (b.dataset.e === "again") { this.destroy(); if (this.opts.onRematch) this.opts.onRematch(this.seats); }
        if (b.dataset.e === "review") { const rec = this.rec, gm = this.gm; this.destroy(); if (this.opts.onExit) this.opts.onExit(); if (gm && gm.onReview) gm.onReview(rec); }
      });
    }
    /* A bot game you watched: who won, and how the seat you followed did. Not counted in your record. */
    finishWatch() {
      if (this.left) return;
      const g = this.g, me = this.me;
      const rounds = Math.max(1, g.round);
      const over = document.createElement("div");
      over.className = "mg-over";
      const title = g.winner ? `${esc(g.winner.name)} wins` : "Draw";
      const line = p => `<li><b>${esc(p.name)}</b>: ${p === g.winner ? `won in round ${rounds}` : p.lost ? `out (${esc({ life: "life", poison: "poison", commander: "commander damage", library: "empty library", concede: "conceded" }[p.lostReason] || p.lostReason || "lost")})` : `${p.life} life at the end`}, ${p.stats.dmg} damage dealt, ${Object.values(p.stats.cast).reduce((a, b) => a + b, 0)} spells</li>`;
      over.innerHTML = `<h2 class="${g.winner === me ? "win" : "loss"}">${title}</h2><p>${g.winner ? `Round ${rounds}.` : "The game hit the turn limit."} You were following ${esc(me.name)}.</p>
        <ol class="watch-sum">${g.players.map(line).join("")}</ol>
        <p class="muted small">Bot games don't count in your record.</p>
        <div class="btns"><button class="mg-btn" data-e="log">Game log</button><button class="mg-btn" data-e="lobby">Lobby</button><button class="mg-btn go" data-e="again">Watch again</button></div>`;
      this.el.appendChild(over);
      over.addEventListener("click", e => {
        const b = e.target.closest("[data-e]");
        if (!b) return;
        if (b.dataset.e === "log") { over.style.display = "none"; this.$.log.classList.add("on"); this.$.log.querySelector("[data-act]").addEventListener("click", () => { over.style.display = ""; }, { once: true }); }
        if (b.dataset.e === "lobby") { this.destroy(); if (this.opts.onExit) this.opts.onExit(); }
        if (b.dataset.e === "again") { this.destroy(); if (this.opts.onRematch) this.opts.onRematch(this.seats); }
      });
    }
    /* A puzzle ends with the turn: solved when the goal check says so. */
    finishPuzzle() {
      const g = this.g, me = this.me, pz = this.gm.puzzle;
      let solved = false;
      try { solved = !!pz.check(g, me); } catch (err) { console.error("[miku game] puzzle check", err); }
      const res = { id: pz.id, solved, hints: this.hintN || 0, ms: Date.now() - this.startedAt };
      try { if (this.gm.onDone) this.gm.onDone(res); } catch (err) { console.error(err); }
      const over = document.createElement("div");
      over.className = "mg-over";
      over.innerHTML = `<h2 class="${solved ? "win" : "loss"}">${solved ? "Solved" : "Not this time"}</h2><p>${esc(solved ? pz.win || "Puzzle solved." : pz.fail || "The goal wasn't met by the end of the turn.")}</p>
        ${solved || this.gm.showSolution ? `<div class="pz-sol"><b>The line</b><ol>${(pz.solution || []).map(x => `<li>${mana(esc(x))}</li>`).join("")}</ol>${pz.lesson ? `<p>${mana(esc(pz.lesson))}</p>` : ""}</div>` : ""}
        <div class="btns"><button class="mg-btn" data-e="log">Game log</button>${solved ? "" : `<button class="mg-btn" data-e="sol">Show the line</button>`}<button class="mg-btn" data-e="lobby">Back</button><button class="mg-btn go" data-e="again">Try again</button></div>`;
      this.el.appendChild(over);
      over.addEventListener("click", e => {
        const b = e.target.closest("[data-e]");
        if (!b) return;
        if (b.dataset.e === "log") { over.style.display = "none"; this.$.log.classList.add("on"); this.$.log.querySelector("[data-act]").addEventListener("click", () => { over.style.display = ""; }, { once: true }); }
        if (b.dataset.e === "sol") { this.gm.showSolution = true; over.remove(); this.finishPuzzle(); }
        if (b.dataset.e === "lobby") { this.destroy(); if (this.opts.onExit) this.opts.onExit(); }
        if (b.dataset.e === "again") { const gm = this.gm; this.destroy(); if (this.opts.onRematch) this.opts.onRematch(null, gm); }
      });
    }
    crash(err) {
      if (this.dead) return;
      console.error(err);
      const over = document.createElement("div");
      over.className = "mg-over";
      over.innerHTML = `<h2 class="loss" style="font-size:2rem">Something broke</h2><p>The game hit an error it couldn't recover from. Sorry. You can start a new one.</p><p style="font-family:var(--f-mono,monospace);font-size:.7rem;color:var(--dim)">${esc(err && err.message || err)}</p><div class="btns"><button class="mg-btn go" data-e="lobby">Back to the lobby</button></div>`;
      this.el.appendChild(over);
      over.querySelector("[data-e]").addEventListener("click", () => { this.destroy(); if (this.opts.onExit) this.opts.onExit(); });
    }
  }

  /* ================================================================ the lobby on the Play tab */
  const Lobby = {
    host: null,
    table: null,
    mount(host) {
      this.host = host;
      this.render();
    },
    /* The decks you can pilot on this site (Miku: precon, budget, full upgrades, Azusa, Corrupted Miku). */
    heroes() {
      const list = (MK.HERO_DECKS || []).filter(d => (d.hero || "miku") === SITE.hero || (d.alsoOn || []).includes(SITE.hero));
      if (!list.length && MK.MIKU_DECK) list.push(MK.MIKU_DECK);
      const at = d => { const i = SITE.heroOrder ? SITE.heroOrder.indexOf(d.id) : -1; return i < 0 ? 99 : i; };
      return list.slice().sort((a, b) => at(a) - at(b));
    },
    hero(s) {
      const hs = this.heroes();
      return hs.find(d => d.id === (s || settings()).hero) || hs.find(d => d.id === SITE.defaultHero) || hs[0];
    },
    /* Bot decks, minus the one you're playing. */
    decks() {
      const h = this.hero();
      return (MK.BOT_DECKS || []).filter(d => !h || (d.id !== h.id && d.commander !== h.commander)).sort((a, b) => bracketOf(a) - bracketOf(b));
    },
    /* the decks the current setting deals from; falls back to every deck if that pool is empty */
    pool(s) {
      const all = this.decks(), mine = all.filter(d => inPool(d, (s || settings()).pool));
      return mine.length ? mine : all;
    },
    render() {
      const host = this.host;
      if (!host) return;
      const s = settings();
      const decks = this.pool(s);
      // the switch only makes sense once both precons and Bracket 4 decks are loaded
      const all = this.decks(), both = all.some(d => bracketOf(d) < 4) && all.some(d => bracketOf(d) >= 4);
      const poolInfo = both ? POOLS.find(p => p[0] === s.pool) || POOLS[0] : ["", "", all.every(d => bracketOf(d) >= 4) ? "Bracket 4 decks" : "Precons"];
      const heroes = this.heroes(), hero = this.hero(s);
      const st = loadStats();
      const rate = st.games ? Math.round(100 * st.wins / st.games) : 0;
      const colorDots = ids => (ids || []).map(k => `<i class="pip ${k.toLowerCase()}"></i>`).join("");
      host.innerHTML = `
        <div class="lobby">
          <div class="lobby-hero">
            <p class="eyebrow">Play</p>
            <h2 class="lobby-title">${SITE.title}</h2>
            <p class="lede">${esc(SITE.lede)}</p>
          </div>
          <div class="lobby-setup">
            ${heroes.length > 1 ? `<div class="set-row col"><span class="set-label">Your deck</span><div class="seg small hero-seg" role="radiogroup" aria-label="Which deck you play">${heroes.map(d => `<button role="radio" aria-checked="${d === hero}" data-hero="${esc(d.id)}">${esc(d.label || d.name)}</button>`).join("")}</div>
              ${hero ? `<p class="hero-blurb"><span class="bc-br${bracketOf(hero) < 4 ? " soft" : ""}">B${bracketOf(hero)}</span> <b>${esc(hero.title || hero.commander)}</b>. ${esc(hero.blurb || "")}</p>` : ""}</div>` : ""}
            ${both ? `<div class="set-row"><span class="set-label">Decks</span><div class="seg small" role="radiogroup" aria-label="Which bot decks to face">${POOLS.map(([k, l, t]) => `<button role="radio" aria-checked="${s.pool === k}" data-pool="${k}" title="${t}">${l}</button>`).join("")}</div></div>` : ""}
            <div class="set-row"><span class="set-label">Opponents</span><div class="seg small" role="radiogroup" aria-label="Number of opponents">${[1, 2, 3].map(n => `<button role="radio" aria-checked="${s.opponents === n}" data-opp="${n}">${n}</button>`).join("")}</div></div>
            <div class="set-row"><span class="set-label">Bots</span><div class="seg small" role="radiogroup" aria-label="Bot skill">${[["casual", "Casual"], ["sharp", "Sharp"]].map(([k, l]) => `<button role="radio" aria-checked="${s.level === k}" data-level="${k}">${l}</button>`).join("")}</div></div>
            <div class="set-row"><span class="set-label">Speed</span><div class="seg small" role="radiogroup" aria-label="Game speed">${[["slow", "Slow"], ["normal", "Normal"], ["fast", "Fast"]].map(([k, l]) => `<button role="radio" aria-checked="${s.speed === k}" data-speed="${k}">${l}</button>`).join("")}</div></div>
            ${hero && hero.coach && hero.coach.companion ? `<div class="set-row col"><label class="set-check"><input type="checkbox" data-companion${s.companion !== false ? " checked" : ""}> <span><b>Companion</b> ${esc(hero.coach.companionBlurb || "guides you through each stage of the game: the mulligan, ramp, Shalai, the combo, and what to answer on their turns. It stops the game when it has advice.")}</span></label></div>` : ""}
            <div class="set-row col"><span class="set-label">Who you face <small>${decks.some(d => (s.picks || []).includes(d.id)) ? "picked" : "random each game"}</small></span>
              <div class="bot-picks">${decks.map(d => `<button class="bot-pick${(s.picks || []).includes(d.id) ? " on" : ""}" data-pick="${esc(d.id)}" aria-pressed="${(s.picks || []).includes(d.id)}"><span class="bp-art" data-art-crop="${esc(d.commander)}"></span><span class="bp-name">${esc(d.name)}</span><span class="bp-dots">${colorDots(d.identity)}</span></button>`).join("")}</div></div>
            <button class="btn primary big start" data-start>Shuffle up and play</button>
            <div class="set-row col watch-row"><span class="set-label">Watch a bot game <small>every seat is a bot, with the decks above</small></span>
              ${(() => { const fol = this.followable(s); const cur = fol.find(d => d.id === s.follow) || fol[0]; return fol.length > 1 ? `<div class="seg small" role="radiogroup" aria-label="Which bot to follow">${fol.map(d => `<button role="radio" aria-checked="${d === cur}" data-follow="${esc(d.id)}">${esc(d === hero ? `${d.label || d.name} (your deck)` : d.name)}</button>`).join("")}</div>` : ""; })()}
              <button class="btn big watch" data-watch>Watch bots play</button></div>
          </div>
          <div class="lobby-record">
            <div class="rec"><b>${st.games}</b><span>games</span></div>
            <div class="rec"><b>${st.wins}</b><span>wins</span></div>
            <div class="rec"><b>${st.games ? rate + "%" : "–"}</b><span>win rate</span></div>
            <div class="rec"><b>${st.best ? "R" + st.best : "–"}</b><span>fastest win</span></div>
          </div>
          <section class="bot-pool" aria-label="The decks you can be dealt">
            <div class="pool-head"><b>${esc(poolInfo[2])}</b><span class="muted mono">${decks.length} decks</span></div>
            <div class="bot-gallery">
            ${decks.map(d => `<article class="bot-card">
              <div class="bc-art" data-art-crop="${esc(d.commander)}"></div>
              <div class="bc-body"><p class="eyebrow"><span class="bc-br${bracketOf(d) < 4 ? " soft" : ""}">B${bracketOf(d)}</span> ${esc(d.style || "")} · ${colorDots(d.identity)}</p><h3>${esc(d.title || d.commander)}</h3><p>${esc(d.blurb || "")}</p>
              ${d.precon ? `<p class="bc-precon">${preconLine(d.precon)}</p>` : ""}
              ${d.watch && d.watch.length ? `<p class="watch"><span>Watch out for</span> ${d.watch.map(n => `<b>${esc(n)}</b>`).join(", ")}</p>` : ""}
              ${st.decks[d.id] ? `<p class="bc-rec">You're ${st.decks[d.id].w}–${st.decks[d.id].l} against it</p>` : ""}</div>
            </article>`).join("")}
            </div>
          </section>
          <details class="panel simp"><summary>How this game differs from paper Magic</summary><ol>${MK.SIMPLIFICATIONS.map(x => `<li>${esc(x)}</li>`).join("")}</ol></details>
        </div>`;
      const paint = () => host.querySelectorAll("[data-art-crop]").forEach(el => { const a = K.art(el.dataset.artCrop); if (a) el.style.backgroundImage = `url('${a.crop}')`; });
      paint();
      K.ensure(decks.map(d => d.commander).concat(heroes.map(d => d.commander)), { miku: true }).then(paint);
      host.querySelectorAll("[data-hero]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { hero: b.dataset.hero })); this.render(); }));
      host.querySelectorAll("[data-pool]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { pool: b.dataset.pool })); this.render(); }));
      host.querySelectorAll("[data-opp]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { opponents: +b.dataset.opp })); this.render(); }));
      host.querySelectorAll("[data-level]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { level: b.dataset.level })); this.render(); }));
      host.querySelectorAll("[data-speed]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { speed: b.dataset.speed })); this.render(); }));
      const cb = host.querySelector("[data-companion]");
      if (cb) cb.addEventListener("change", () => saveSettings(Object.assign(settings(), { companion: cb.checked })));
      host.querySelectorAll("[data-pick]").forEach(b => b.addEventListener("click", () => {
        const cur = settings(); const picks = new Set(cur.picks || []);
        if (picks.has(b.dataset.pick)) picks.delete(b.dataset.pick); else picks.add(b.dataset.pick);
        saveSettings(Object.assign(cur, { picks: [...picks] })); this.render();
      }));
      host.querySelector("[data-start]").addEventListener("click", () => this.start());
      host.querySelectorAll("[data-follow]").forEach(b => b.addEventListener("click", () => { saveSettings(Object.assign(settings(), { follow: b.dataset.follow })); this.render(); }));
      host.querySelector("[data-watch]").addEventListener("click", () => this.start(this.seats(true)));
    },
    /* who a bot game can follow: your deck, or one of the decks you picked to face */
    followable(s) {
      const hero = this.hero(s);
      return [hero].concat(this.pool(s).filter(d => (s.picks || []).includes(d.id))).filter(Boolean);
    },
    seats(watch) {
      const s = settings();
      const decks = this.pool(s);
      const n = Math.max(1, Math.min(3, s.opponents || 3));
      let pool = decks.filter(d => (s.picks || []).includes(d.id));
      const out = [];
      const rnd = a => a.splice(Math.floor(Math.random() * a.length), 1)[0];
      const left = decks.slice();
      while (out.length < n && pool.length) { const d = rnd(pool); out.push(d); left.splice(left.indexOf(d), 1); }
      while (out.length < n && left.length) out.push(rnd(left));
      while (out.length < n) out.push(decks[out.length % decks.length] || MK.MIKU_DECK);
      const mine = this.hero(s) || MK.MIKU_DECK;
      if (!watch) return [{ human: true, deck: mine }].concat(out.map(d => ({ deck: d })));
      // a bot game: your deck plays as a bot, and the screen follows the deck you chose
      const seats = [{ watch: true, deck: mine }].concat(out.map(d => ({ deck: d })));
      const f = seats.find(x => x.deck.id === s.follow) || seats[0];
      f.follow = true;
      return seats;
    },
    start(seats) {
      if (this.table) this.table.destroy();
      const t = this.table = new Table({ onExit: () => { this.table = null; this.render(); }, onRematch: prev => this.start(prev) });
      t.start(seats || this.seats());
    }
  };

  root.MikuGame = { Table, Lobby, mount: host => Lobby.mount(host), loadStats, SPEED, SITE };
})(window);
