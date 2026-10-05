/* The Arena tab: bot tournaments between every deck the sites know (tournament.js does the
   rules and the numbers). Games run in workers (tournament-worker.js), several at once, and the
   pages redraw as results come in:
     New        format, decks, pod size, length, bot level
     Live       progress, the race for first, the cup bracket, the latest games
     Standings  the table with ratings and win-rate intervals, and the rating over time
     Matchups   who finishes above whom, turn order, game lengths
     Decks      one deck's profile: how and when it wins, its best and worst matchups
     Games      every game, with highlights; any of them can be watched on the Play table
     Saved      past tournaments, export and import
   Tournaments are kept in localStorage under "mtgArena", shared by every deck site. */
(function (root) {
  "use strict";
  const MK = root.MK, T = MK.Tournament, K = root.MikuKit;
  const esc = K.esc;
  const KEY = "mtgArena";
  const LS = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* private mode */ } }
  };
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const pct = (x, d = 0) => (100 * x).toFixed(d) + "%";
  const plural = (n, w, ws) => `${n} ${n === 1 ? w : ws || w + "s"}`;
  const fmtTime = s => !isFinite(s) ? "–" : s < 60 ? Math.max(1, Math.round(s)) + "s" : s < 3600 ? Math.round(s / 60) + " min" : (s / 3600).toFixed(1) + " h";
  const ago = t => { const s = (Date.now() - t) / 1000; return s < 90 ? "just now" : s < 5400 ? Math.round(s / 60) + " min ago" : s < 129600 ? Math.round(s / 3600) + " h ago" : new Date(t).toLocaleDateString(); };
  // the reference categorical order (dataviz palette), one slot per deck on the rating chart
  const SERIES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];
  const HOW = { life: "Damage", commander: "Commander damage", poison: "Poison", alt: "Alternate win", library: "Decking", concede: "Concession" };
  const GROUPS = [["yours", "Your decks"], ["b4", "Bracket 4 bots"], ["precon", "Precons"]];

  /* ------------------------------------------------------------ state */
  const R = {
    st: null,           // the tournament on screen (running or opened)
    running: false, pausing: false, ending: false,
    slots: [], ready: null, size: 0,
    t0: 0, done0: 0, rate: LS.get(KEY + ".rate", 0) || 0,
    recent: [], lastSave: 0, saveTimer: 0, drawTimer: 0, A: null, Akey: "",
    seg: "setup", hosts: {}, sort: { k: "rank", dir: 1 }, chart: null, deck: LS.get(KEY + ".deck", null),
    gamesFilter: { deck: "", only: "all", limit: 60 }, cell: null
  };
  const cfg = Object.assign(T.defaults(), LS.get(KEY + ".cfg.v1", {}));
  {
    const ids = new Set(T.entrants().map(e => e.id));
    cfg.entrants = (cfg.entrants || []).filter(id => ids.has(id));
    if (!cfg.entrants.length) cfg.entrants = [...ids];
    if (!T.FORMATS[cfg.format]) cfg.format = "league";
  }
  const saveCfg = () => LS.set(KEY + ".cfg.v1", cfg);
  const name = id => (R.st && R.st.names[id]) || (T.entrant(id) || {}).name || id;
  const ent = id => T.entrant(id) || { id, name: id, commander: "", identity: [], bracket: 4 };

  /* ------------------------------------------------------------ saving */
  function index() { return LS.get(KEY + ".list.v1", []); }
  function save(now, which) {
    const st = which || R.st; if (!st) return;
    if (st !== R.st) now = true;
    else clearTimeout(R.saveTimer);
    if (!now && Date.now() - R.lastSave < 3000) { R.saveTimer = setTimeout(() => save(true), 3000); return; }
    R.lastSave = Date.now();
    const row = { id: st.id, created: st.created, format: st.cfg.format, pod: st.cfg.pod, decks: st.cfg.entrants.length, games: T.playedGames(st), status: st.status, champion: st.champion };
    let list = index().filter(x => x.id !== st.id);
    list.unshift(row);
    // the oldest tournaments make room when storage is full
    for (let tries = 0; tries < 8; tries++) {
      if (LS.set(KEY + ".t." + st.id, st)) break;
      const old = list.filter(x => x.id !== st.id).pop();
      if (!old) { row.unsaved = true; break; }
      LS.del(KEY + ".t." + old.id); list = list.filter(x => x !== old);
    }
    LS.set(KEY + ".list.v1", list.slice(0, 12));
    if (st === R.st) LS.set(KEY + ".cur.v1", st.id);
  }
  function load(id) { const st = LS.get(KEY + ".t." + id, null); return st && st.v === T.VERSION ? st : null; }

  /* ------------------------------------------------------------ workers */
  function pool() {
    if (R.ready) return R.ready;
    R.ready = new Promise(res => {
      const info = root.MikuApp && root.MikuApp.gameInfo;
      if (!info || typeof Worker === "undefined") { res(0); return; }
      const n = Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 2) - 1));
      const files = info.files.filter(f => !/game-ui|arena/.test(f)).map(f => f.replace(/^game\//, "") + "?v=" + info.v);
      const made = [];
      for (let k = 0; k < n; k++) made.push(new Promise(ok => {
        let w;
        try { w = new Worker(info.base + "tournament-worker.js?v=" + info.v); } catch (e) { ok(null); return; }
        const slot = { w, cb: null };
        w.onmessage = e => {
          const m = e.data || {};
          if (m.type === "ready") { ok(slot); return; }
          if (m.type === "failed") { ok(null); return; }
          if (m.type === "result" && slot.cb) { const cb = slot.cb; slot.cb = null; cb(m.res); }
        };
        w.onerror = () => { if (slot.cb) { const cb = slot.cb; slot.cb = null; cb({ error: "worker error" }); } ok(null); };
        slot.play = job => new Promise(done => { slot.cb = done; w.postMessage({ type: "game", job }); });
        w.postMessage({ type: "init", files });
        setTimeout(() => ok(null), 30000);
      }));
      Promise.all(made).then(xs => { R.slots = xs.filter(Boolean); R.size = R.slots.length; res(R.size); });
    });
    return R.ready;
  }

  /* ------------------------------------------------------------ running */
  function onResult(st, job, res) {
    if (!res || res.error) res = { x: 1, msg: res && res.error, f: 0, w: -1, draw: true, rd: 0, tn: 0, ms: 0, pl: job.seats.map(() => 1), out: job.seats.map(() => 0), why: job.seats.map(() => ""), dmg: job.seats.map(() => 0), cast: job.seats.map(() => 0), tok: job.seats.map(() => 0), mull: job.seats.map(() => 0), life: job.seats.map(() => 0), err: 1 };
    const g = T.record(st, job, res);
    if (st !== R.st) return;
    R.recent.unshift(g); if (R.recent.length > 12) R.recent.pop();
    save();
    draw();
  }
  async function run() {
    const st = R.st;
    if (!st || R.running || st.status === "done") return;
    R.running = true; R.pausing = false; R.ending = false;
    st.status = "running";
    draw(true);
    const n = await pool();
    R.t0 = performance.now(); R.done0 = T.playedGames(st);
    const t0 = Date.now();
    try {
      while (!R.pausing && R.st === st) {
        let round = st.rounds.find(r => !T.roundDone(st, r));
        if (!round) {
          const last = st.rounds[st.rounds.length - 1];
          if (last && !last.closed) { T.closeRound(st, last); last.closed = true; }
          round = T.nextRound(st);
          if (!round) { T.finish(st); break; }
        }
        const queue = T.jobs(st, round).filter(j => !st.games[j.gi]);
        if (n) {
          await Promise.all(R.slots.map(async slot => {
            while (!R.pausing && R.st === st && queue.length) { const job = queue.shift(); onResult(st, job, await slot.play(job)); }
          }));
        } else {
          // no workers (an old browser): one game at a time on the page, yielding between games
          while (!R.pausing && R.st === st && queue.length) {
            const job = queue.shift();
            let res; try { res = await T.playGame(job); } catch (e) { res = { error: String(e.message || e) }; }
            onResult(st, job, res);
            await new Promise(r => setTimeout(r, 0));
          }
        }
      }
    } finally {
      st.ms = (st.ms || 0) + (Date.now() - t0);
      const played = T.playedGames(st) - R.done0, secs = (performance.now() - R.t0) / 1000;
      if (played >= 20 && secs > 2) { R.rate = played / secs; LS.set(KEY + ".rate", R.rate); }
      if (R.ending) T.finish(st);
      else if (st.status === "running") st.status = R.pausing ? "paused" : st.status;
      R.running = false; R.pausing = false; R.ending = false;
      save(true, st);
      draw(true);
    }
  }
  function start() {
    const err = T.check(cfg);
    if (err) { toast(err); return; }
    if (R.running && !confirm("A tournament is running. Stop it and start a new one?")) return;
    if (R.running) { R.pausing = true; if (R.st) R.st.status = "paused"; save(true); }
    const st = T.create(JSON.parse(JSON.stringify(cfg)));
    R.st = st; R.recent = []; R.A = null; R.cell = null;
    save(true);
    location.hash = "arena/live";
    const go = () => (R.running ? setTimeout(go, 50) : run());
    go();
  }
  function pause() { if (R.running) { R.pausing = true; draw(true); } }
  function endNow() {
    if (!R.st) return;
    if (R.running) { R.ending = true; R.pausing = true; draw(true); return; }
    T.finish(R.st); save(true); draw(true);
  }
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "ar-toast"; t.textContent = msg; t.setAttribute("role", "status");
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3200);
  }

  /* ------------------------------------------------------------ drawing */
  function analysis() {
    const st = R.st; if (!st) return null;
    const key = st.id + ":" + T.playedGames(st) + ":" + st.status;
    if (R.A && R.Akey === key) return R.A;
    R.Akey = key; R.A = T.analyze(st);
    return R.A;
  }
  const dirty = new Set();
  // redraw the page on screen (at most a few times a second while games pour in); the others when shown
  function draw(now) {
    Object.keys(PAGES).forEach(k => dirty.add(k));
    if (now) { clearTimeout(R.drawTimer); R.drawTimer = 0; paint(); return; }
    if (R.drawTimer) return;
    R.drawTimer = setTimeout(() => { R.drawTimer = 0; paint(); }, R.seg === "live" ? 250 : 900);
  }
  function paint() {
    const seg = R.seg, host = R.hosts[seg];
    if (!host || !PAGES[seg] || !host.offsetParent && document.body.dataset.view !== "arena") return;
    dirty.delete(seg);
    PAGES[seg](host);
    art(host);
  }
  function art(scope) {
    const fill = () => $$("[data-art-crop]", scope).forEach(el => { if (el.style.backgroundImage) return; const a = K.art(el.dataset.artCrop); if (a) el.style.backgroundImage = `url('${a.crop}')`; });
    fill();
    const names = [...new Set($$("[data-art-crop]", scope).map(el => el.dataset.artCrop))];
    if (names.length) K.ensure(names, { miku: true }).then(fill);
  }
  const av = id => `<span class="ar-av" data-art-crop="${esc(ent(id).commander)}" aria-hidden="true"></span>`;
  const dots = ids => (ids || []).map(k => `<i class="pip ${k.toLowerCase()}"></i>`).join("");
  const br = e => `<span class="bc-br${e.bracket < 4 ? " soft" : ""}">B${e.bracket}</span>`;
  const deckTag = id => `<span class="ar-deck">${av(id)}<b>${esc(name(id))}</b></span>`;
  const empty = (title, text, link) => `<div class="empty-state ar-empty"><b>${title}</b><p class="muted">${text}</p>${link ? `<a class="btn primary" href="#arena/setup">${link}</a>` : ""}</div>`;
  const noTournament = () => empty("No tournament yet", "Pick a format and the decks on the New page, and the bots play it out here, hundreds of games in a few minutes.", "Set one up");
  const roundLabel = st => { const r = st.rounds[st.rounds.length - 1]; if (!r) return "Dealing the first round"; const tot = st.cfg.format === "swiss" || st.cfg.format === "cup" ? st.cfg.rounds : 0; return r.kind === "swiss" && tot ? `${r.label} of ${tot}` : r.label; };
  const statusOf = st => st.status === "done" ? ["done", "Finished"] : R.running && R.st === st ? (R.pausing ? ["pausing", R.ending ? "Ending" : "Pausing"] : ["run", "Running"]) : ["paused", "Paused"];

  /* ---------------- New */
  function pageSetup(host) {
    const all = T.entrants(), on = new Set(cfg.entrants);
    const F = cfg.format;
    const n = cfg.entrants.length;
    const tops = T.koTops(cfg.pod, n);
    if (F === "cup" && !tops.includes(cfg.top) && tops.length) cfg.top = tops.includes(8) ? 8 : tops[tops.length - 1];
    if (F === "gauntlet" && (!cfg.hero || !on.has(cfg.hero))) cfg.hero = cfg.entrants.find(id => ent(id).group === "yours") || cfg.entrants[0] || null;
    const err = T.check(cfg);
    const planned = err ? 0 : T.plannedGames(cfg);
    const threads = R.size || Math.max(1, Math.min(8, (navigator.hardwareConcurrency || 2) - 1));
    const rate = R.rate || threads * 3;
    const seg = (key, opts, val, label) => `<div class="seg small" role="radiogroup" aria-label="${esc(label)}">${opts.map(([v, l]) => `<button type="button" role="radio" aria-checked="${String(v) === String(val)}" data-set="${key}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const resume = R.st && R.st.status !== "done" ? `<div class="ar-resume"><div><b>${esc(T.FORMATS[R.st.cfg.format].name)} in progress</b><span class="muted">${T.playedGames(R.st)} games played · ${esc(roundLabel(R.st))}</span></div><a class="btn" href="#arena/live">${R.running ? "Watch it" : "Resume"}</a></div>` : "";
    host.innerHTML = `
      <div class="ar ar-new">
        <div class="lobby-hero ar-hero">
          <p class="eyebrow">Arena</p>
          <h2 class="lobby-title">Bot <span>tournament</span></h2>
          <p class="lede">Every deck on the four sites, piloted by the bots, over hundreds of games. Pick a format and a field, then watch the standings settle.</p>
          <div class="ar-hero-stats"><span><b>${all.length}</b> decks</span><span><b>${threads}</b> ${threads === 1 ? "thread" : "threads"}</span><span><b>~${Math.round(rate)}</b> games/s</span></div>
        </div>
        ${resume}
        <section class="ar-card">
          <h3 class="ar-h">Format</h3>
          <div class="ar-formats" role="radiogroup" aria-label="Format">
            ${Object.entries(T.FORMATS).map(([k, f]) => `<button type="button" role="radio" class="ar-format${k === F ? " on" : ""}" aria-checked="${k === F}" data-set="format" data-v="${k}"><span class="ar-fi" aria-hidden="true">${FICON[k]}</span><b>${f.name}</b><span>${esc(f.blurb)}</span></button>`).join("")}
          </div>
        </section>
        <section class="ar-card ar-decks">
          <div class="ar-row-h"><h3 class="ar-h">Decks <small>${n} of ${all.length}</small></h3>
            <div class="ar-quick">${[["all", "All"]].concat(GROUPS).concat([["none", "None"]]).map(([k, l]) => `<button type="button" class="chip" data-group="${k}">${l}</button>`).join("")}</div></div>
          ${GROUPS.map(([g, label]) => {
            const es = all.filter(e => e.group === g); if (!es.length) return "";
            return `<p class="set-label ar-gl">${label}</p><div class="ar-picks">${es.map(e => `<button type="button" class="bot-pick ar-pick${on.has(e.id) ? " on" : ""}" aria-pressed="${on.has(e.id)}" data-pick="${esc(e.id)}"><span class="bp-art" data-art-crop="${esc(e.commander)}"></span><span class="bp-name">${esc(e.name)}</span><span class="bp-dots">${br(e)}${dots(e.identity)}</span></button>`).join("")}</div>`;
          }).join("")}
        </section>
        <section class="ar-card ar-setup">
          ${F === "gauntlet" ? `<div class="set-row col"><span class="set-label">Runs the gauntlet</span><select class="ar-select" data-hero aria-label="The deck in every pod">${cfg.entrants.map(id => `<option value="${esc(id)}"${id === cfg.hero ? " selected" : ""}>${esc(name(id))}</option>`).join("")}</select></div>` : ""}
          <div class="set-row"><span class="set-label">Pod size</span>${seg("pod", [[2, "1 v 1"], [3, "3"], [4, "4"]], cfg.pod, "Players per game")}</div>
          ${F === "league" || F === "gauntlet" ? `<div class="set-row"><span class="set-label">Games</span>${seg("games", [[100, "100"], [300, "300"], [600, "600"], [1200, "1.2k"], [2400, "2.4k"]], cfg.games, "Games to play")}</div>` : `
          <div class="set-row"><span class="set-label">${F === "cup" ? "Qualifiers" : "Rounds"}</span>${seg("rounds", [[3, "3"], [5, "5"], [7, "7"], [10, "10"]], cfg.rounds, "Swiss rounds")}</div>
          <div class="set-row"><span class="set-label">Games per pod</span>${seg("series", [[1, "1"], [3, "3"], [5, "5"], [9, "9"]], cfg.series, "Games each pod plays per round")}</div>`}
          ${F === "cup" ? `<div class="set-row"><span class="set-label">Knockout</span>${tops.length ? seg("top", tops.map(t => [t, "Top " + t]), cfg.top, "Decks in the knockout") : `<span class="muted small">needs more decks</span>`}</div>
          <div class="set-row"><span class="set-label">Knockout series</span>${seg("koSeries", [[3, "3"], [5, "5"], [7, "7"], [11, "11"]], cfg.koSeries, "Games per knockout pod")}</div>` : ""}
          <div class="set-row"><span class="set-label">Bots</span>${seg("level", [["casual", "Casual"], ["sharp", "Sharp"], ["best", "Best"]], cfg.level, "Bot skill")}</div>
          <div class="set-row col"><label class="set-check"><input type="checkbox" data-casual${cfg.casual ? " checked" : ""}> <span><b>Precons play casual</b> as on the Play tab: they spread their attacks and keep a blocker home.</span></label></div>
          <div class="set-row"><span class="set-label">Seed</span><span class="ar-seed"><input type="number" inputmode="numeric" min="1" value="${cfg.seed}" data-seed aria-label="Seed"><button type="button" class="chip" data-reseed aria-label="New seed">New</button></span></div>
          <p class="ar-plan${err ? " bad" : ""}" aria-live="polite">${err ? esc(err) : `About <b>${planned.toLocaleString()}</b> games in pods of ${cfg.pod}, roughly <b>${fmtTime(planned / rate)}</b> on this device. The same seed plays the same tournament.`}</p>
          <button class="btn primary big start" type="button" data-start${err ? " disabled" : ""}>Start the tournament</button>
        </section>
      </div>`;
    host.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.set) {
        const k = b.dataset.set, v = b.dataset.v;
        cfg[k] = ["format", "level"].includes(k) ? v : +v;
        saveCfg(); pageSetup(host); art(host); return;
      }
      if (b.dataset.pick) {
        const id = b.dataset.pick, s = new Set(cfg.entrants);
        if (s.has(id)) s.delete(id); else s.add(id);
        cfg.entrants = T.entrants().map(x => x.id).filter(x => s.has(x));
        saveCfg(); pageSetup(host); art(host); return;
      }
      if (b.dataset.group) {
        const g = b.dataset.group, ids = T.entrants();
        if (g === "all") cfg.entrants = ids.map(x => x.id);
        else if (g === "none") cfg.entrants = [];
        else { const grp = ids.filter(x => x.group === g).map(x => x.id); const allOn = grp.every(id => cfg.entrants.includes(id)); const s = new Set(cfg.entrants); grp.forEach(id => (allOn ? s.delete(id) : s.add(id))); cfg.entrants = ids.map(x => x.id).filter(x => s.has(x)); }
        saveCfg(); pageSetup(host); art(host); return;
      }
      if (b.hasAttribute("data-reseed")) { cfg.seed = 1 + Math.floor(Math.random() * 999999); saveCfg(); pageSetup(host); art(host); return; }
      if (b.hasAttribute("data-start")) start();
    };
    host.onchange = e => {
      const t = e.target;
      if (t.matches("[data-casual]")) { cfg.casual = t.checked; saveCfg(); }
      if (t.matches("[data-seed]")) { cfg.seed = Math.max(1, Math.floor(+t.value) || 1); saveCfg(); }
      if (t.matches("[data-hero]")) { cfg.hero = t.value; saveCfg(); }
    };
  }
  const FICON = {
    league: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="1.5" fill="currentColor"/><circle cx="14" cy="12" r="1.5" fill="currentColor"/><circle cx="11" cy="18" r="1.5" fill="currentColor"/></svg>',
    swiss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h7l3 5-3 5H4M20 7h-3M20 17h-3"/></svg>',
    gauntlet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"/><circle cx="4.5" cy="5" r="1.6"/><circle cx="19.5" cy="5" r="1.6"/><circle cx="4.5" cy="19" r="1.6"/><circle cx="19.5" cy="19" r="1.6"/><path d="M6 6.5l3.4 3.4M18 6.5l-3.4 3.4M6 17.5l3.4-3.4M18 17.5l-3.4-3.4"/></svg>',
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/></svg>'
  };

  /* ---------------- Live */
  function pageLive(host) {
    const st = R.st;
    if (!st) { host.innerHTML = noTournament(); return; }
    const A = analysis();
    const played = T.playedGames(st);
    const planned = Math.max(played, T.plannedGames(st.cfg));
    const [sk, sl] = statusOf(st);
    const secs = R.running ? (performance.now() - R.t0) / 1000 : 0;
    const rate = R.running ? (secs > 1.5 ? (played - R.done0) / secs : 0) : st.status === "done" && st.ms > 0 ? played / (st.ms / 1000) : 0;
    const left = rate ? (planned - played) / rate : NaN;
    const champ = st.champion;
    let shell = $(".ar-live", host);
    if (!shell || shell.dataset.t !== st.id) {
      host.innerHTML = `<div class="ar ar-live" data-t="${st.id}">
        <div class="ar-board">
          <div class="ar-board-top"><p class="eyebrow" data-f></p><span class="ar-pill" data-pill></span></div>
          <h2 class="ar-board-h" data-h></h2>
          <div class="ar-prog" role="progressbar" aria-label="Games played" aria-valuemin="0"><i data-bar></i></div>
          <div class="ar-kpis" data-kpis></div>
          <div class="btn-row ar-ctl" data-ctl></div>
        </div>
        <div data-bracket></div>
        <section class="ar-card"><div class="ar-row-h"><h3 class="ar-h">The race</h3><span class="muted small" data-race-note></span></div><ol class="ar-race" data-race></ol></section>
        <section class="ar-card"><div class="ar-row-h"><h3 class="ar-h">Latest games</h3><a class="ar-more" href="#arena/games">All games</a></div><ol class="ar-ticker" data-ticker></ol></section>
      </div>`;
      shell = $(".ar-live", host);
    }
    $("[data-f]", shell).textContent = `${T.FORMATS[st.cfg.format].name} · pods of ${st.cfg.pod} · ${plural(st.cfg.entrants.length, "deck")}`;
    const pill = $("[data-pill]", shell); pill.textContent = sl; pill.className = "ar-pill " + sk;
    $("[data-h]", shell).innerHTML = st.status === "done" && champ ? `${av(champ)}<span><small>Champion</small>${esc(name(champ))}</span>` : `<span>${esc(roundLabel(st))}</span>`;
    const bar = $("[data-bar]", shell); bar.style.width = pct(planned ? played / planned : 0, 2);
    $(".ar-prog", shell).setAttribute("aria-valuenow", played); $(".ar-prog", shell).setAttribute("aria-valuemax", planned);
    $("[data-kpis]", shell).innerHTML = [
      [played.toLocaleString(), `of ${planned.toLocaleString()} games`],
      [rate ? rate.toFixed(1) : "–", "games / s"],
      [R.running ? fmtTime(left) : st.status === "done" ? fmtTime((st.ms || 0) / 1000) : "–", R.running ? "left" : st.status === "done" ? "took" : "left"],
      [A.lengths.median == null ? "–" : "R" + A.lengths.median, "median win"]
    ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("");
    const ctl = $("[data-ctl]", shell);
    const want = st.status === "done" ? "done" : R.running ? (R.pausing ? "pausing" : "run") : "paused";
    if (ctl.dataset.s !== want) {
      ctl.dataset.s = want;
      ctl.innerHTML = want === "run" ? `<button class="btn" type="button" data-a="pause">Pause</button><button class="btn ghost" type="button" data-a="end">End now</button>`
        : want === "pausing" ? `<button class="btn" type="button" disabled>Finishing the games in play…</button>`
        : want === "paused" ? `<button class="btn primary" type="button" data-a="resume">Resume</button><button class="btn ghost" type="button" data-a="end">End here</button>`
        : `<a class="btn primary" href="#arena/standings">Standings</a><a class="btn" href="#arena/setup">New tournament</a><button class="btn ghost" type="button" data-a="again">Run it again</button>`;
    }
    $("[data-bracket]", shell).innerHTML = st.cfg.format === "cup" ? bracketHTML(st) : "";
    race($("[data-race]", shell), A, st);
    $("[data-race-note]", shell).textContent = A.games ? "by points, then rating" : "";
    const recent = (R.recent.length && R.st === st ? R.recent : st.games.filter(Boolean).slice(-10).reverse()).slice(0, 10);
    $("[data-ticker]", shell).innerHTML = recent.length ? recent.map(g => gameLi(st, g)).join("") : `<li class="muted">The first games are being dealt…</li>`;
    host.onclick = e => {
      const b = e.target.closest("[data-a],[data-watch]"); if (!b) return;
      if (b.dataset.watch) { watch(+b.dataset.watch); return; }
      const a = b.dataset.a;
      if (a === "pause") pause();
      if (a === "resume") run();
      if (a === "end") endNow();
      if (a === "again") { Object.assign(cfg, JSON.parse(JSON.stringify(st.cfg)), { seed: 1 + Math.floor(Math.random() * 999999) }); saveCfg(); start(); }
    };
  }
  // the standings as a race: rows keep their element and slide to their new place
  function race(ol, A, st) {
    const rows = A.standings, H = 46;
    ol.style.height = rows.length * H + "px";
    const lo = Math.min(...rows.map(r => r.rating)), hi = Math.max(...rows.map(r => r.rating));
    const have = new Map($$("li", ol).map(li => [li.dataset.id, li]));
    rows.forEach((r, i) => {
      let li = have.get(r.id);
      if (!li) { li = document.createElement("li"); li.dataset.id = r.id; li.innerHTML = `<span class="ar-rk"></span>${av(r.id)}<span class="ar-rn"><b>${esc(r.name)}</b><span class="ar-rbar"><i></i></span></span><span class="ar-rv"></span>`; ol.appendChild(li); art(li); }
      have.delete(r.id);
      li.style.transform = `translateY(${i * H}px)`;
      li.classList.toggle("lead", i === 0 && r.n > 0);
      li.classList.toggle("champ", st.champion === r.id && st.status === "done");
      $(".ar-rk", li).textContent = i + 1;
      $(".ar-rbar i", li).style.width = pct(hi > lo ? 0.08 + 0.92 * (r.rating - lo) / (hi - lo) : 0.5, 1);
      $(".ar-rv", li).innerHTML = `<span><b>${r.pts}</b> pts</span><small>${r.wins}/${r.n} · ${Math.round(r.rating)}</small>`;
    });
    have.forEach(li => li.remove());
  }
  function gameLi(st, g) {
    if (g.x) return `<li class="ar-g err"><span class="ar-gn">#${g.gi + 1}</span><span>This game hit an engine error and was skipped.</span></li>`;
    const r = st.rounds[g.r];
    const res = g.w >= 0 ? `<b>${esc(name(g.d[g.w]))}</b> won in round ${g.rd}` : `Draw at the turn limit`;
    return `<li class="ar-g"><span class="ar-gn">#${g.gi + 1}</span><span class="ar-gb"><span class="ar-gr">${res}</span><span class="ar-gs">${g.d.map((id, i) => `<span class="${i === g.w ? "w" : g.out[i] ? "o" : ""}">${i === g.f ? '<i title="Went first">1st</i>' : ""}${esc(name(id))}</span>`).join("")}</span><span class="ar-gm muted">${esc(r ? r.label : "")}${g.k ? ` · game ${g.k + 1}` : ""}</span></span><button class="chip ar-w" type="button" data-watch="${g.gi}" aria-label="Watch game ${g.gi + 1}">Watch</button></li>`;
  }
  function bracketHTML(st) {
    const sizes = T.koSizes(st.cfg.top, st.cfg.pod) || [];
    const ko = st.ko;
    const cols = sizes.map((n, s) => {
      const stage = ko && ko.stages[s];
      const round = stage && st.rounds.find(r => r.kind === "ko" && r.stage === s);
      const label = stage ? stage.label : s === sizes.length - 1 ? "Final" : `Top ${n}`;
      const pods = stage ? round.pods.map(pod => {
        const rows = T.series(st, round, pod);
        const through = new Set(stage.through || []);
        return `<div class="ar-bpod">${rows.map(x => `<div class="ar-bs${through.has(x.id) ? " up" : stage.through ? " down" : ""}${st.champion === x.id && s === sizes.length - 1 ? " champ" : ""}">${av(x.id)}<span>${esc(name(x.id))}</span><b>${x.wins}</b></div>`).join("")}<p class="ar-bfoot">${pod.res.length}/${pod.games} games</p></div>`;
      }).join("") : Array.from({ length: n / st.cfg.pod }, () => `<div class="ar-bpod wait">${Array.from({ length: st.cfg.pod }, () => `<div class="ar-bs"><span class="ar-av"></span><span class="muted">${s === 0 ? "Qualifier" : "Winner"}</span></div>`).join("")}</div>`).join("");
      return `<div class="ar-bcol"><p class="set-label">${esc(label)}</p>${pods}</div>`;
    }).join("");
    return `<section class="ar-card ar-bracket"><div class="ar-row-h"><h3 class="ar-h">Knockout</h3><span class="muted small">top ${st.cfg.top} after ${st.cfg.rounds} qualifiers · series of ${st.cfg.koSeries}, wins decide</span></div><div class="ar-bcols">${cols}</div></section>`;
  }

  /* ---------------- Standings */
  const COLS = [
    ["rank", "#", null], ["name", "Deck", r => r.name], ["rating", "Rating", r => -r.rating], ["n", "Games", r => -r.n], ["wins", "Wins", r => -r.wins],
    ["winRate", "Win rate", r => -r.winRate], ["edge", "Vs fair", r => -r.edge], ["avgPlace", "Avg place", r => r.avgPlace || 9], ["ppg", "Pts/game", r => -r.ppg],
    ["avgWin", "Wins in", r => r.avgWin == null ? 99 : r.avgWin], ["medOut", "Out in", r => r.medOut == null ? -99 : -r.medOut], ["dmgPer", "Dmg (median)", r => -r.dmgPer]
  ];
  function pageStandings(host) {
    const st = R.st;
    if (!st) { host.innerHTML = noTournament(); return; }
    const A = analysis();
    if (!A.games) { host.innerHTML = empty("No games yet", "The table fills in as soon as the first games are in."); return; }
    const rows = A.standings.map((r, i) => Object.assign({ rank: i + 1 }, r));
    const col = COLS.find(c => c[0] === R.sort.k);
    if (col && col[2]) rows.sort((a, b) => { const x = col[2](a), y = col[2](b); return (x < y ? -1 : x > y ? 1 : a.rank - b.rank) * R.sort.dir; });
    else if (R.sort.dir < 0) rows.reverse();
    const P = st.cfg.pod, fair = 1 / P;
    const ci = r => `<span class="ar-ci" title="95% interval ${pct(r.ci[0])} to ${pct(r.ci[1])}"><i style="left:${pct(r.ci[0], 1)};width:${pct(r.ci[1] - r.ci[0], 1)}"></i><u style="left:${pct(fair, 1)}"></u><b style="left:${pct(r.winRate, 1)}"></b></span>`;
    const keep = R.chart && R.chart.t === st.id ? R.chart.ids.filter(id => st.cfg.entrants.includes(id)) : null;
    const top = A.standings.filter(r => r.n).slice(0, 5).map(r => r.id);
    R.chart = { t: st.id, ids: keep && keep.length ? keep : top };
    host.innerHTML = `<div class="ar">
      <div class="ar-head"><div><p class="eyebrow">Standings</p><h2 class="ar-title">${esc(T.FORMATS[st.cfg.format].name)}, ${A.games.toLocaleString()} games</h2></div>${statusChip(st)}</div>
      <div class="ar-tiles">${podium(st, A).map((r, i) => `<div class="ar-tile${i === 0 ? " gold" : ""}">${av(r.id)}<span class="ar-tk">${podium.ko ? ["Champion", "Final, 2nd", "Final, 3rd"][i] : ["1st", "2nd", "3rd"][i]}</span><b>${esc(r.name)}</b><span>${r.pts} pts · ${pct(r.winRate)} wins · ${Math.round(r.rating)}</span></div>`).join("")}</div>
      <section class="ar-card ar-tablecard"><div class="ar-tablewrap"><table class="ar-table">
        <thead><tr>${COLS.map(([k, l]) => `<th scope="col" class="c-${k}"><button type="button" data-sort="${k}" aria-sort="${R.sort.k === k ? (R.sort.dir > 0 ? "ascending" : "descending") : "none"}">${l}${R.sort.k === k ? (R.sort.dir > 0 ? " ▾" : " ▴") : ""}</button></th>`).join("")}</tr></thead>
        <tbody>${rows.map(r => { const e = ent(r.id); return `<tr data-deck="${esc(r.id)}"><td class="c-rank">${r.rank}</td><td class="c-name"><span class="ar-deck">${av(r.id)}<b>${esc(r.name)}</b>${br(e)}</span></td><td class="c-rating mono">${Math.round(r.rating)}</td><td class="mono">${r.n}</td><td class="mono">${r.wins}</td><td class="c-winRate"><span class="mono">${pct(r.winRate, 1)}</span>${ci(r)}</td><td class="mono">${r.n ? r.edge.toFixed(2) + "×" : "–"}</td><td class="mono">${r.n ? r.avgPlace.toFixed(2) : "–"}</td><td class="mono">${r.ppg.toFixed(2)}</td><td class="mono">${r.avgWin == null ? "–" : "R" + r.avgWin.toFixed(1)}</td><td class="mono">${r.medOut == null ? "–" : "R" + r.medOut}</td><td class="mono">${Math.round(r.dmgPer)}</td></tr>`; }).join("")}</tbody>
      </table></div>
      <p class="ar-note muted">Points: 3 for a win, 1 for still standing at a draw. <b>Rating</b> is a Bradley-Terry strength on the Elo scale from every pair at every table (finishing above counts as beating). <b>Win rate</b> shows its 95% interval, with a tick at a fair share (${pct(fair)} in pods of ${P}). <b>Vs fair</b>: wins over a fair share, 1.00× is average. <b>Wins in</b>: average round of its wins. <b>Out in</b>: median round it was knocked out. Tap a deck for its profile.</p></section>
      <section class="ar-card"><div class="ar-row-h"><h3 class="ar-h">Rating over the tournament</h3><span class="muted small">Elo after each game</span></div>
        <div class="ar-legend" data-legend></div><div class="ar-chart" data-chart></div>
        <p class="ar-note muted">Tap decks above to add or remove lines (up to 8).</p></section>
    </div>`;
    chart(host, A, st);
    host.onclick = e => {
      const s = e.target.closest("[data-sort]");
      if (s) { const k = s.dataset.sort; R.sort = { k, dir: R.sort.k === k ? -R.sort.dir : 1 }; pageStandings(host); art(host); return; }
      const lg = e.target.closest("[data-line]");
      if (lg) {
        const id = lg.dataset.line, ids = R.chart.ids;
        if (ids.includes(id)) R.chart.ids = ids.filter(x => x !== id); else if (ids.length < 8) R.chart.ids = ids.concat(id); else toast("Eight lines at most: remove one first.");
        chart(host, A, st); art(host); return;
      }
      const tr = e.target.closest("tr[data-deck]");
      if (tr) { R.deck = tr.dataset.deck; LS.set(KEY + ".deck", R.deck); location.hash = "arena/decks"; }
    };
  }
  // the top three: a finished cup's final pod in its series order, else the standings
  function podium(st, A) {
    const fin = st.cfg.format === "cup" && st.status === "done" && st.rounds.find(r => r.label === "Final");
    podium.ko = !!(fin && T.roundDone(st, fin));
    const ids = podium.ko ? T.series(st, fin, fin.pods[0]).map(x => x.id) : A.standings.map(r => r.id);
    return ids.slice(0, 3).map(id => A.standings.find(r => r.id === id));
  }
  function statusChip(st) { const [k, l] = statusOf(st); return `<span class="ar-pill ${k}">${l}</span>`; }
  /* Rating lines: one slot of the categorical order per deck, a legend that toggles them, and a crosshair. */
  function chart(host, A, st) {
    const ids = R.chart.ids, H = A.elo.hist, N = A.elo.n;
    const color = id => SERIES[ids.indexOf(id) % SERIES.length];
    $("[data-legend]", host).innerHTML = A.standings.filter(r => r.n).map(r => { const on = ids.includes(r.id); return `<button type="button" class="ar-lg${on ? " on" : ""}" data-line="${esc(r.id)}" aria-pressed="${on}"${on ? ` style="--c:${color(r.id)}"` : ""}><i></i>${esc(r.name)}</button>`; }).join("");
    const box = $("[data-chart]", host);
    const W = 640, Ht = 240, L = 44, Rt = 12, Tp = 12, B = 26;
    let lo = Infinity, hi = -Infinity;
    for (const id of ids) for (const [, v] of H[id] || []) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
    if (!isFinite(lo)) { box.innerHTML = ""; return; }
    lo = Math.floor((Math.min(lo, 1500) - 20) / 50) * 50; hi = Math.ceil((Math.max(hi, 1500) + 20) / 50) * 50;
    const x = n => L + (W - L - Rt) * (N ? n / N : 0), y = v => Tp + (Ht - Tp - B) * (1 - (v - lo) / (hi - lo));
    const ticks = []; const step = (hi - lo) > 400 ? 100 : 50; for (let v = lo; v <= hi; v += step) ticks.push(v);
    const thin = pts => { if (pts.length <= 240) return pts; const k = pts.length / 240, out = []; for (let i = 0; i < 240; i++) out.push(pts[Math.floor(i * k)]); out.push(pts[pts.length - 1]); return out; };
    const lines = ids.map(id => { const pts = thin(H[id] || []); return `<path d="${pts.map(([n, v], i) => `${i ? "L" : "M"}${x(n).toFixed(1)},${y(v).toFixed(1)}`).join("")}" fill="none" stroke="${color(id)}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`; }).join("");
    // direct labels at the line ends, nudged apart
    const ends = ids.map(id => { const h = H[id] || []; const v = h.length ? h[h.length - 1][1] : 1500; return { id, v, y: y(v) }; }).sort((a, b) => a.y - b.y);
    for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
    box.innerHTML = `<svg viewBox="0 0 ${W} ${Ht}" class="ar-svg" role="img" aria-label="Rating of ${ids.map(name).join(", ")} after each game">
      ${ticks.map(v => `<line x1="${L}" x2="${W - Rt}" y1="${y(v)}" y2="${y(v)}" class="${v === 1500 ? "base" : "grid"}"/><text x="${L - 6}" y="${y(v) + 3.5}" text-anchor="end" class="tk">${v}</text>`).join("")}
      <text x="${W - Rt}" y="${Ht - 6}" text-anchor="end" class="tk">game ${N}</text><text x="${L}" y="${Ht - 6}" class="tk">0</text>
      ${lines}<line class="xh" y1="${Tp}" y2="${Ht - B}" x1="-10" x2="-10"/>
    </svg><div class="ar-tip" hidden></div>`;
    const svg = $("svg", box), tip = $(".ar-tip", box), xh = $(".xh", svg);
    const at = (id, n) => { const h = H[id] || []; let lo2 = 0, hi2 = h.length - 1; if (hi2 < 0) return null; while (lo2 < hi2) { const m = (lo2 + hi2 + 1) >> 1; if (h[m][0] <= n) lo2 = m; else hi2 = m - 1; } return h[lo2][1]; };
    const move = ev => {
      const r = svg.getBoundingClientRect(), px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * W / r.width;
      if (px < L || px > W - Rt) { tip.hidden = true; xh.setAttribute("x1", -10); xh.setAttribute("x2", -10); return; }
      const n = Math.round((px - L) / (W - L - Rt) * N);
      xh.setAttribute("x1", x(n)); xh.setAttribute("x2", x(n));
      tip.hidden = false;
      tip.innerHTML = `<b>After game ${n}</b>` + ids.map(id => ({ id, v: at(id, n) })).sort((a, b) => b.v - a.v).map(o => `<span><i style="background:${color(o.id)}"></i>${esc(name(o.id))}<b>${Math.round(o.v)}</b></span>`).join("");
      const left = (x(n) / W) * r.width;
      tip.style.left = Math.min(r.width - tip.offsetWidth - 4, Math.max(4, left + 12)) + "px";
    };
    svg.addEventListener("pointermove", move);
    svg.addEventListener("pointerleave", () => { tip.hidden = true; xh.setAttribute("x1", -10); xh.setAttribute("x2", -10); });
    // end labels as HTML over the chart so they stay legible at any width
    const lab = document.createElement("div");
    lab.className = "ar-ends";
    lab.innerHTML = ends.map(e => `<span style="top:${(e.y / Ht * 100).toFixed(2)}%;--c:${color(e.id)}">${esc(name(e.id))}</span>`).join("");
    box.appendChild(lab);
  }

  /* ---------------- Matchups */
  function pageMatchups(host) {
    const st = R.st;
    if (!st) { host.innerHTML = noTournament(); return; }
    const A = analysis();
    if (!A.games) { host.innerHTML = empty("No games yet", "Matchups appear once decks have shared a few tables."); return; }
    const ids = A.standings.filter(r => r.n).map(r => r.id), M = A.matrix;
    const cell = (a, b) => {
      if (a === b) return `<td class="self"></td>`;
      const c = M[a][b];
      if (!c.n) return `<td class="none" aria-label="never met"></td>`;
      const p = c.above / c.n, d = Math.round(Math.min(1, Math.abs(p - 0.5) * 2) * 85);
      const bg = p >= 0.5 ? `color-mix(in oklab, var(--teal-fill) ${d}%, var(--ar-mid))` : `color-mix(in oklab, var(--pink-fill) ${d}%, var(--ar-mid))`;
      return `<td><button type="button" data-cell="${esc(a)}|${esc(b)}" style="background:${bg}" class="${d > 55 ? "strong" : ""}${R.cell === a + "|" + b ? " sel" : ""}" aria-label="${esc(name(a))} above ${esc(name(b))} ${pct(p)} of ${c.n}">${Math.round(p * 100)}</button></td>`;
    };
    const sel = R.cell && R.cell.split("|");
    const selLine = sel && M[sel[0]] && M[sel[0]][sel[1]] ? (() => { const c = M[sel[0]][sel[1]], d = M[sel[1]][sel[0]]; return `<b>${esc(name(sel[0]))}</b> finished above <b>${esc(name(sel[1]))}</b> in ${pct(c.above / c.n)} of their ${plural(c.n, "shared game")}. ${esc(name(sel[0]))} won ${c.wins} of them, ${esc(name(sel[1]))} won ${d.wins}.`; })() : "Tap a square for the details.";
    const P = A.seats[0];
    const lens = A.lengths, maxL = Math.max(1, ...Object.values(lens.h));
    const rmax = Math.max(...Object.keys(lens.h).map(Number), 1);
    host.innerHTML = `<div class="ar">
      <div class="ar-head"><div><p class="eyebrow">Matchups</p><h2 class="ar-title">Who finishes above whom</h2></div>${statusChip(st)}</div>
      <section class="ar-card"><p class="muted small ar-note">Each square: how often the row deck finished above the column deck when they shared a table. Teal is better for the row, pink worse; 50 is even. Decks are in standings order.</p>
        <div class="ar-heatwrap"><table class="ar-heat"><thead><tr><th></th>${ids.map(b => `<th scope="col" title="${esc(name(b))}">${av(b)}</th>`).join("")}</tr></thead>
        <tbody>${ids.map(a => `<tr><th scope="row">${av(a)}<span>${esc(name(a))}</span></th>${ids.map(b => cell(a, b)).join("")}</tr>`).join("")}</tbody></table></div>
        <p class="ar-cellnote" aria-live="polite">${selLine}</p>
        <div class="ar-scale" aria-hidden="true"><span>worse</span><i></i><span>better</span></div></section>
      <div class="ar-two">
        ${P ? `<section class="ar-card"><h3 class="ar-h">Turn order</h3><p class="muted small">Who won, by when they took their first turn (${plural(P.n, "game")} in pods of ${P.P}). The tick is a fair share.</p>
          <div class="ar-bars">${P.wins.map((w, i) => `<div class="ar-bar"><span>${["Went first", "Second", "Third", "Fourth"][i] || i + 1 + "th"}</span><span class="ar-track"><i style="width:${pct(P.n ? w / P.n : 0, 1)}"></i><u style="left:${pct(1 / P.P, 1)}"></u></span><b>${pct(P.n ? w / P.n : 0, 1)}</b></div>`).join("")}</div></section>` : ""}
        <section class="ar-card"><h3 class="ar-h">Game length</h3><p class="muted small">The round each won game ended in. Median: round ${lens.median == null ? "–" : lens.median}${lens.draws ? `; ${plural(lens.draws, "game")} hit the turn limit` : ""}.</p>
          <div class="ar-hist" role="img" aria-label="Games won by round">${Array.from({ length: rmax }, (_, i) => i + 1).map(r => `<span class="ar-hb" title="Round ${r}: ${lens.h[r] || 0} games"><i style="height:${pct((lens.h[r] || 0) / maxL, 1)}"></i><small>${r % 2 || rmax < 14 ? r : ""}</small></span>`).join("")}</div></section>
      </div>
    </div>`;
    host.onclick = e => {
      const b = e.target.closest("[data-cell]"); if (!b) return;
      R.cell = b.dataset.cell;
      $$(".ar-heat button.sel", host).forEach(x => x.classList.remove("sel")); b.classList.add("sel");
      const [a, c] = R.cell.split("|"); const m = M[a][c], d = M[c][a];
      $(".ar-cellnote", host).innerHTML = `<b>${esc(name(a))}</b> finished above <b>${esc(name(c))}</b> in ${pct(m.above / m.n)} of their ${plural(m.n, "shared game")}. ${esc(name(a))} won ${m.wins} of them, ${esc(name(c))} won ${d.wins}.`;
    };
  }

  /* ---------------- Decks */
  function pageDecks(host) {
    const st = R.st;
    if (!st) { host.innerHTML = noTournament(); return; }
    const A = analysis();
    if (!A.games) { host.innerHTML = empty("No games yet", "Each deck's profile fills in as it plays."); return; }
    const ids = A.standings.map(r => r.id);
    if (!R.deck || !ids.includes(R.deck)) R.deck = ids[0];
    const id = R.deck, e = ent(id), row = A.standings.find(r => r.id === id), rank = A.standings.indexOf(row) + 1;
    const pr = T.profile(st, id, { matrix: A.matrix });
    const bars = (obj, total, labels) => { const ks = Object.keys(obj).sort((a, b) => obj[b] - obj[a]); return ks.length ? ks.map(k => `<div class="ar-bar"><span>${esc(labels[k] || k)}</span><span class="ar-track"><i style="width:${pct(obj[k] / total, 1)}"></i></span><b>${obj[k]}</b></div>`).join("") : `<p class="muted small">None yet.</p>`; };
    const P = st.cfg.pod, maxR = Math.max(1, ...Object.values(pr.rounds)), rmax = Math.max(1, ...Object.keys(pr.rounds).map(Number));
    const opp = pr.opp.filter(o => o.n >= 2);
    const mu = list => list.length ? list.map(o => `<li>${deckTag(o.id)}<span class="mono">${pct(o.above)}</span><small class="muted">${o.n} games</small></li>`).join("") : `<li class="muted">Not enough shared games yet.</li>`;
    const site = e.site ? `<a class="btn" href="../${e.site}/">Open its site</a>` : "";
    // why it wins and loses (T.breakdown); tournaments from before it was recorded show only the endings
    const bd = T.breakdown(st, id), verdict = T.verdict(st, id, bd);
    const untracked = `<p class="muted small ar-old">Not recorded in this tournament: it was played before the Arena kept track of this. Run a new one to see it.</p>`;
    const partly = bd.tracked && bd.tracked < bd.n ? ` <span class="muted small">(from the ${bd.tracked} games that recorded it)</span>` : "";
    const kpis = list => `<div class="ar-kpis light">${list.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("")}</div>`;
    const num = (x, d) => (x == null ? "–" : x.toFixed(d));
    const LOSSL = { life: "Ran out of life", commander: "Commander damage", poison: "Poison", alt: "Alternate win", library: "Decked", concede: "Conceded", draw: "Draw (turn limit)" };
    const killers = bd.killers.slice(0, 5);
    const whoCard = !bd.tracked ? untracked : killers.length || bd.noKiller ? `<ol class="ar-mu ar-kill">${killers.map(k => `<li>${deckTag(k.id)}<span class="mono">${k.n}×</span><small class="muted">round ${Math.round(k.round)}</small></li>`).join("")}${bd.noKiller ? `<li><span class="muted">No one (it decked or its own cards did it)</span><span class="mono">${bd.noKiller}×</span><span></span></li>` : ""}</ol>` : `<p class="muted small">It hasn't been knocked out yet.</p>`;
    const cardRows = bd.cards.slice(0, 8).sort((a, b) => b.gap - a.gap);
    const cell = (x, k) => `<span class="ar-kc ${k}"><span class="ar-track"><i style="width:${pct(x || 0, 1)}"></i></span><b>${x == null ? "–" : pct(x)}</b></span>`;
    const cardsCard = !bd.tracked ? untracked : cardRows.length ? `<div class="ar-keys"><div class="ar-key ar-key-h"><span>Card</span><span>In its wins</span><span>In its losses</span></div>${cardRows.map(c => `<div class="ar-key${c.gap >= 0.2 ? " up" : c.gap <= -0.2 ? " down" : ""}"><span title="${esc(c.name)}">${esc(c.name)}</span>${cell(c.inWins, "w")}${cell(c.inLosses, "l")}</div>`).join("")}</div>` : `<p class="muted small">No spells cast yet.</p>`;
    const cmdName = [].concat(e.commander || [])[0] || "its commander";
    const cmdCard = !bd.cmd ? untracked : kpis([[num(bd.cmd.casts, 1), "casts per game"], [num(bd.cmd.off, 1), "times it was killed or removed, per game"], [num(bd.cmd.inWins, 1) + " / " + num(bd.cmd.inLosses, 1), "casts per win / per loss"]]);
    const mm = bd.mull, manaCard = kpis([
      [bd.mana ? num(bd.mana.all, 1) : "–", "mana left unused per turn"], [bd.mana ? num(bd.mana.win, 1) + " / " + num(bd.mana.loss, 1) : "–", "unused in wins / in losses"],
      [mm ? num(mm.per, 2) : "–", "mulligans per game"], [mm && mm.keptRate != null ? pct(mm.keptRate) : "–", `won keeping seven${mm ? ` (${mm.kept})` : ""}`],
      [mm && mm.mulledRate != null ? pct(mm.mulledRate) : "–", `won after a mulligan${mm ? ` (${mm.mulled})` : ""}`]]) + (bd.mana ? "" : `<p class="muted small ar-old">Unused mana wasn't recorded in this tournament: it was played before the Arena kept track of it.</p>`);
    const outCard = kpis([[row.n ? pct(bd.firstOut / row.n) : "–", `first one out (fair share ${pct(1 / P)})`], [bd.medFirstOut == null ? "–" : "Round " + Math.round(bd.medFirstOut), "when it's first out (median)"], [bd.medOut == null ? "–" : "Round " + Math.round(bd.medOut), "when it goes out at all (median)"]]);
    host.innerHTML = `<div class="ar">
      <div class="ar-chips" role="tablist" aria-label="Deck">${A.standings.map(r => `<button type="button" role="tab" class="ar-dchip${r.id === id ? " on" : ""}" aria-selected="${r.id === id}" data-deck="${esc(r.id)}">${av(r.id)}${esc(r.name)}</button>`).join("")}</div>
      <div class="bot-card ar-prof">
        <div class="bc-art" data-art-crop="${esc(e.commander)}"></div>
        <div class="bc-body"><p class="eyebrow">${br(e)} ${esc(e.style || "")} · ${dots(e.identity)}</p><h3>${esc(name(id))}</h3>
          <div class="ar-pk"><div><b>#${rank}</b><span>of ${A.standings.length}</span></div><div><b>${Math.round(row.rating)}</b><span>rating</span></div><div><b>${pct(row.winRate, 1)}</b><span>${row.wins} of ${row.n} won</span></div><div><b>${row.n ? row.edge.toFixed(2) + "×" : "–"}</b><span>a fair share</span></div></div>
          <p class="bc-precon">95% interval for its win rate: ${pct(row.ci[0])} to ${pct(row.ci[1])}. ${row.n < 30 ? "Few games yet, so treat it loosely." : ""}</p>
          <div class="btn-row">${site}<button class="btn ghost" type="button" data-games="${esc(id)}">Its games</button></div></div>
      </div>
      <section class="ar-card ar-why"><h3 class="ar-h">Why it wins and loses</h3>
        ${verdict.length ? `<ul class="ar-verdict">${verdict.map(v => `<li class="${v.tone}">${esc(v.text)}</li>`).join("")}</ul>` : `<p class="muted small">Not enough games yet.</p>`}
        ${!bd.tracked ? `<p class="ar-note muted">This tournament was played before the Arena recorded who knocks a deck out, its cards, its commander and its mana; those parts fill in for new tournaments.</p>` : ""}</section>
      <div class="ar-two">
        <section class="ar-card"><h3 class="ar-h">How it loses</h3><p class="muted small">How each of its ${plural(bd.losses, "loss", "losses")} ended for it.</p><div class="ar-bars wrap">${bars(bd.lossHow, Math.max(1, bd.losses), LOSSL)}</div></section>
        <section class="ar-card"><h3 class="ar-h">Who knocks it out</h3><p class="muted small">The deck that dealt the final blow, and the median round it happened.${partly}</p>${whoCard}</section>
        <section class="ar-card"><h3 class="ar-h">When it goes out</h3><p class="muted small">Where it sits when it dies: out before everyone else, and how soon.</p>${outCard}</section>
        <section class="ar-card"><h3 class="ar-h">How it wins</h3><p class="muted small">How the last opponent went out in each of its ${plural(pr.wins, "win")}.</p><div class="ar-bars">${bars(pr.how, Math.max(1, pr.wins), HOW)}</div></section>
        <section class="ar-card ar-wide"><h3 class="ar-h">Its key cards</h3><p class="muted small">Its most-cast spells (not the commander) and how often each was cast in the games it won and the games it lost. A card cast much more in wins is one it needs; much more in losses, one that doesn't pull its weight.${partly}</p>${cardsCard}</section>
        <section class="ar-card"><h3 class="ar-h">Its commander</h3><p class="muted small">${esc(cmdName)}: how often it's cast, and how often it gets killed or removed.${partly}</p>${cmdCard}</section>
        <section class="ar-card"><h3 class="ar-h">Mana and mulligans</h3><p class="muted small">Mana it could still have made going into its end step, and how its opening hands went.${partly}</p>${manaCard}</section>
        <section class="ar-card"><h3 class="ar-h">When it wins</h3><p class="muted small">Its wins by round${bd.medWin != null ? `; usually around round ${Math.round(bd.medWin)} (median)` : ""}.</p>
          <div class="ar-hist small">${Array.from({ length: rmax }, (_, i) => i + 1).map(r => `<span class="ar-hb" title="Round ${r}: ${pr.rounds[r] || 0}"><i style="height:${pct((pr.rounds[r] || 0) / maxR, 1)}"></i><small>${r % 2 || rmax < 14 ? r : ""}</small></span>`).join("")}</div></section>
        <section class="ar-card"><h3 class="ar-h">By turn order</h3><p class="muted small">Its win rate by when it took its first turn. The tick is a fair share.</p>
          <div class="ar-bars">${Array.from({ length: P }, (_, i) => pr.seat[i] || { n: 0, wins: 0 }).map((s, i) => `<div class="ar-bar"><span>${["First", "Second", "Third", "Fourth"][i]} <small class="muted">${s.n}</small></span><span class="ar-track"><i style="width:${pct(s.n ? s.wins / s.n : 0, 1)}"></i><u style="left:${pct(1 / P, 1)}"></u></span><b>${s.n ? pct(s.wins / s.n) : "–"}</b></div>`).join("")}</div></section>
        <section class="ar-card"><h3 class="ar-h">Best matchups</h3><p class="muted small">How often it finished above them.</p><ol class="ar-mu">${mu(opp.slice(0, 4))}</ol></section>
        <section class="ar-card"><h3 class="ar-h">Worst matchups</h3><p class="muted small">How often it finished above them.</p><ol class="ar-mu">${mu(opp.slice(-4).reverse())}</ol></section>
      </div>
      <section class="ar-card"><h3 class="ar-h">Per game</h3><div class="ar-kpis light">${[[Math.round(row.dmgPer), "damage to players (median)"], [row.castPer.toFixed(1), "spells cast"], [row.tokPer.toFixed(1), "tokens made"], [(row.n ? row.mull / row.n : 0).toFixed(2), "mulligans"], [row.n ? row.avgPlace.toFixed(2) : "–", "average place"], [row.n ? pct(row.firstOut / row.n) : "–", "first one out"]].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join("")}</div></section>
    </div>`;
    host.onclick = ev => {
      const c = ev.target.closest("[data-deck]");
      if (c) { R.deck = c.dataset.deck; LS.set(KEY + ".deck", R.deck); pageDecks(host); art(host); const on = $(".ar-dchip.on", host); if (on) on.scrollIntoView({ block: "nearest", inline: "center" }); return; }
      const g = ev.target.closest("[data-games]");
      if (g) { R.gamesFilter = { deck: g.dataset.games, only: "all", limit: 60 }; location.hash = "arena/games"; }
    };
  }

  /* ---------------- Games */
  function pageGames(host) {
    const st = R.st;
    if (!st) { host.innerHTML = noTournament(); return; }
    const A = analysis();
    const f = R.gamesFilter;
    let list = st.games.filter(Boolean).slice().reverse();
    if (f.deck) list = list.filter(g => g.d.includes(f.deck));
    if (f.deck && f.only === "wins") list = list.filter(g => g.w >= 0 && g.d[g.w] === f.deck);
    if (f.deck && f.only === "losses") list = list.filter(g => g.w >= 0 && g.d[g.w] !== f.deck);
    if (f.only === "draws") list = list.filter(g => g.w < 0 && !g.x);
    const shown = list.slice(0, f.limit);
    host.innerHTML = `<div class="ar">
      <div class="ar-head"><div><p class="eyebrow">Games</p><h2 class="ar-title">${plural(T.playedGames(st), "game")}</h2></div>${statusChip(st)}</div>
      ${A.highlights.length ? `<div class="ar-hl">${A.highlights.map(h => `<button type="button" class="ar-hlc" data-watch="${h.g.gi}"><span class="set-label">${esc(h.title)}</span><b>${esc(h.line)}</b><span class="ar-hlw">Watch game ${h.g.gi + 1} ▸</span></button>`).join("")}</div>` : ""}
      <section class="ar-card">
        <div class="ar-filters"><select class="ar-select" data-f="deck" aria-label="Deck"><option value="">Every deck</option>${A.standings.map(r => `<option value="${esc(r.id)}"${r.id === f.deck ? " selected" : ""}>${esc(r.name)}</option>`).join("")}</select>
          <div class="seg small" role="radiogroup" aria-label="Which games">${[["all", "All"], ...(f.deck ? [["wins", "Its wins"], ["losses", "Its losses"]] : []), ["draws", "Draws"]].map(([k, l]) => `<button type="button" role="radio" aria-checked="${f.only === k}" data-only="${k}">${l}</button>`).join("")}</div></div>
        <p class="muted small ar-note">${plural(list.length, "game")}. Every game replays from its seed: Watch plays it again on the table, move by move.</p>
        <ol class="ar-ticker">${shown.map(g => gameLi(st, g)).join("") || `<li class="muted">No games match.</li>`}</ol>
        ${list.length > shown.length ? `<button class="btn ghost ar-moreb" type="button" data-more>Show more</button>` : ""}
      </section></div>`;
    host.onclick = e => {
      const w = e.target.closest("[data-watch]"); if (w) { watch(+w.dataset.watch); return; }
      const o = e.target.closest("[data-only]"); if (o) { f.only = o.dataset.only; f.limit = 60; pageGames(host); return; }
      if (e.target.closest("[data-more]")) { f.limit += 120; pageGames(host); }
    };
    host.onchange = e => { if (e.target.matches("[data-f=deck]")) { f.deck = e.target.value; if (!f.deck && (f.only === "wins" || f.only === "losses")) f.only = "all"; f.limit = 60; pageGames(host); } };
  }

  /* ---------------- Saved */
  function pageSaved(host) {
    const list = index();
    host.innerHTML = `<div class="ar">
      <div class="ar-head"><div><p class="eyebrow">Saved</p><h2 class="ar-title">Your tournaments</h2></div></div>
      <section class="ar-card">${list.length ? `<ol class="ar-saved">${list.map(x => `<li class="${R.st && R.st.id === x.id ? "on" : ""}">
          ${x.champion ? av(x.champion) : `<span class="ar-av ar-av-q" aria-hidden="true">?</span>`}
          <span class="ar-sv"><b>${esc((T.FORMATS[x.format] || {}).name || x.format)} · ${x.decks} decks · pods of ${x.pod}</b><span class="muted small">${x.games.toLocaleString()} games · ${x.status === "done" ? (x.champion ? "won by " + esc(name(x.champion)) : "finished") : "unfinished"} · ${ago(x.created)}${x.unsaved ? " · too big to keep" : ""}</span></span>
          <span class="ar-svb">${R.st && R.st.id === x.id ? `<span class="ar-pill done">On screen</span>` : `<button class="chip" type="button" data-open="${x.id}">Open</button>`}<button class="chip" type="button" data-export="${x.id}">Export</button><button class="chip" type="button" data-del="${x.id}" aria-label="Delete">Delete</button></span></li>`).join("")}</ol>` : `<p class="muted">Finished and unfinished tournaments are kept here, on this device.</p>`}
        <div class="btn-row ar-io"><label class="btn"><input type="file" accept="application/json,.json" data-import hidden>Import a tournament</label></div>
        <p class="ar-note muted small">The Arena keeps the latest tournaments on this device; when space runs out the oldest go first. Export one to keep it, or to rerun it with <code>tools/sim/tournament.js</code>.</p></section>
    </div>`;
    host.onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.dataset.open) {
        if (R.running && !confirm("A tournament is running. Pause it and open this one?")) return;
        if (R.running) R.pausing = true;
        const st = load(b.dataset.open);
        if (!st) { toast("That tournament couldn't be read."); return; }
        const go = () => { if (R.running) return setTimeout(go, 50); R.st = st; R.recent = []; R.A = null; R.cell = null; LS.set(KEY + ".cur.v1", st.id); location.hash = "arena/" + (st.status === "done" ? "standings" : "live"); draw(true); };
        go();
      }
      if (b.dataset.export) { const st = R.st && R.st.id === b.dataset.export ? R.st : load(b.dataset.export); if (st) download(st); }
      if (b.dataset.del) {
        if (!confirm("Delete this tournament?")) return;
        const id = b.dataset.del;
        if (R.st && R.st.id === id) { if (R.running) R.pausing = true; R.st = null; LS.del(KEY + ".cur.v1"); }
        LS.del(KEY + ".t." + id); LS.set(KEY + ".list.v1", index().filter(x => x.id !== id));
        draw(true);
      }
    };
    host.onchange = e => {
      const inp = e.target.closest("[data-import]"); if (!inp || !inp.files[0]) return;
      inp.files[0].text().then(txt => {
        const st = JSON.parse(txt);
        if (!st || st.v !== T.VERSION || !st.cfg || !Array.isArray(st.games)) throw new Error("not an Arena tournament");
        if (R.running) R.pausing = true;
        st.status = st.status === "running" ? "paused" : st.status;
        const go = () => { if (R.running) return setTimeout(go, 50); R.st = st; R.recent = []; R.A = null; save(true); location.hash = "arena/standings"; draw(true); };
        go();
      }).catch(err => toast("Couldn't import: " + err.message));
    };
  }
  function download(st) {
    const blob = new Blob([JSON.stringify(st)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `arena-${st.cfg.format}-${new Date(st.created).toISOString().slice(0, 10)}-${st.id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  /* ------------------------------------------------------------ watching a game on the table */
  function watch(gi) {
    const st = R.st, g = st && st.games[gi];
    if (!g || g.x || !root.MikuGame) return;
    const skill = T.LEVELS[st.cfg.level] == null ? 0.9 : T.LEVELS[st.cfg.level];
    const follow = st.cfg.format === "gauntlet" ? g.d.indexOf(st.cfg.hero) : R.gamesFilter.deck && g.d.includes(R.gamesFilter.deck) ? g.d.indexOf(R.gamesFilter.deck) : 0;
    const seats = g.d.map((id, i) => { const e = ent(id); return { deck: e.deck, name: e.name, skill, aggression: e.aggression, casual: !!st.cfg.casual && e.bracket <= 2, follow: i === follow }; });
    const want = g.w >= 0 ? `${name(g.d[g.w])} won in round ${g.rd}` : "a draw";
    const mode = () => ({
      kind: "watch", seed: g.seed,
      note: `Game ${gi + 1} of the ${T.FORMATS[st.cfg.format].name.toLowerCase()}. In the tournament: ${want}.`,
      onDone: r => { R.lastWatch = { gi, same: r.winner === g.w && r.rounds === g.rd }; }
    });
    const t = new root.MikuGame.Table({ exitLabel: "Back to the Arena", onExit: () => draw(true), onRematch: (s) => { const t2 = new root.MikuGame.Table(t.opts); t2.start(s, mode()); } });
    t.start(seats, mode());
  }

  /* ------------------------------------------------------------ the tab */
  const PAGES = { setup: pageSetup, live: pageLive, standings: pageStandings, matchups: pageMatchups, decks: pageDecks, games: pageGames, saved: pageSaved };
  let mounted = false;
  function mount(view) {
    if (mounted) return;
    mounted = true;
    $$("[data-arena]", view).forEach(h => { R.hosts[h.dataset.arena] = h; });
    const cur = LS.get(KEY + ".cur.v1", null);
    const st = cur && load(cur);
    if (st) { if (st.status === "running") st.status = "paused"; R.st = st; }
    K.onArt(() => { const h = R.hosts[R.seg]; if (h) art(h); });
    // a tournament in progress keeps its place when you leave the page
    addEventListener("pagehide", () => { if (R.st && R.running) { R.st.status = "paused"; save(true); R.st.status = "running"; } });
  }
  function show(seg, view) {
    mount(view || document.getElementById("view-arena"));
    R.seg = PAGES[seg] ? seg : "setup";
    dirty.add(R.seg);
    paint();
  }
  root.MikuArena = { show, start, pause, run, watch, state: () => R, cfg };
})(window);
