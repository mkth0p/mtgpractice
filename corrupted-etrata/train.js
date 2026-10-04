/* Corrupted Etrata: the Train tab. Drills, puzzles in the real game engine, assessment games that
   record every choice you make, a review of each game with "what if" replays, and a personal
   analysis once you've done the drills. The engine side lives in ../miku/game/practice.js (record,
   replay, rollouts) and ../miku/game/train-cetrata.js (the model, the drills, the review rules).
   Everything is kept on this device. */
(function () {
  "use strict";
  const D = window.DECK_SITE;
  if (!D) return;
  const baseWidgets = D.widgets;
  D.widgets = api => Object.assign(baseWidgets(api), {
    trainPath: el => mount(el, api, renderPath),
    drills: el => mount(el, api, renderDrills),
    puzzles: el => mount(el, api, renderPuzzles),
    games: el => mount(el, api, renderGames),
    report: el => mount(el, api, renderReport)
  });

  /* ================================================================ state on this device */
  const KEY = "cetrataWiki";
  const SK = { train: KEY + ".train.v1", games: KEY + ".games.v1", an: KEY + ".analysis.v1" };
  const MAX_GAMES = 14;
  let A = null;   // the shell's helpers, set by the first widget
  const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
  function trainState() { return Object.assign({ drills: {}, puzzles: {}, prating: 1200, journal: [], seen: 0 }, load(SK.train, {})); }
  function putTrain(st) { save(SK.train, st); bus(); }
  function games() { return load(SK.games, []); }
  function putGames(list) {
    // localStorage is small: drop the oldest games until it fits
    let l = list.slice(0, MAX_GAMES);
    while (l.length && !save(SK.games, l)) l = l.slice(0, l.length - 1);
    bus();
  }
  function analyses() { return load(SK.an, {}); }
  function putAnalysis(recId, i, r) {
    const a = analyses();
    a[recId] = a[recId] || {};
    a[recId][i] = r;
    const ids = new Set(games().map(g => g.id));
    for (const k of Object.keys(a)) if (!ids.has(k)) delete a[k];
    save(SK.an, a);
  }

  /* ================================================================ small helpers */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const short = n => String(n).split(",")[0];
  const pct = x => x == null ? "–" : Math.round(x * 100) + "%";
  const cn = n => A && A.byName && A.byName.has(n) ? `<i-c>${esc(n)}</i-c>` : `<b>${esc(n)}</b>`;
  const cnText = s => String(s).replace(/<i-c>(.*?)<\/i-c>/g, (m, n) => cn(n));
  const ago = t => { const d = (Date.now() - t) / 1000; return d < 90 ? "just now" : d < 3600 ? Math.round(d / 60) + " min ago" : d < 86400 ? Math.round(d / 3600) + " h ago" : Math.round(d / 86400) + " d ago"; };
  const MKG = () => window.MK;
  const TR = () => window.MK && window.MK.TRAIN && window.MK.TRAIN["corrupted-etrata"];
  const refreshers = new Set();
  function bus() { for (const f of refreshers) { try { f(); } catch (e) { console.error(e); } } }
  window.addEventListener("hashchange", () => { if (/^#train/.test(location.hash)) bus(); });
  function finish(el) { if (A.linkMentions) A.linkMentions(el); if (A.paintArt) A.paintArt(el); }
  function engine() { return (window.MikuApp && window.MikuApp.loadGame ? window.MikuApp.loadGame() : Promise.reject(new Error("no game"))); }
  function mount(el, api, render) {
    A = A || api;
    const st = { el };
    const run = () => { if (!el.isConnected) return; render(el, st); finish(el); };
    refreshers.add(() => { if (!st.busy) run(); });
    run();
  }
  const SKILL_NAME = { mull: "Mulligans", tempo: "Mana and tempo", lines: "Seeing the win", tutor: "Tutoring", etrata: "Etrata and face-down play", stack: "The stack", combat: "Combat and threats", rules: "Rules knowledge" };
  const SKILL_SHORT = { mull: "Mulligans", tempo: "Tempo", lines: "Lines", tutor: "Tutoring", etrata: "Etrata", stack: "Stack", combat: "Combat", rules: "Rules" };
  const SKILL_TRACK = { mull: "mana", tempo: "mana", lines: "combos", tutor: "tutors", etrata: "etrata", stack: "interaction", combat: "board", rules: "etrata" };

  /* ================================================================ drills */
  const DRILLS = [
    { id: "mulligan", name: "Mulligan Lab", skill: "mull", n: 12, icon: "🂠", blurb: "Twelve opening hands from the real 99. Keep or ship, graded by 400 goldfish games per hand." },
    { id: "lines", name: "Line Spotter", skill: "lines", n: 10, icon: "◎", blurb: "Boards built in the game engine. Is a win live this turn, and which one? Against the clock." },
    { id: "tutor", name: "Tutor Target", skill: "tutor", n: 8, icon: "⌕", blurb: "One tutor, four candidates. Fetch the card that wins soonest, with the mana you have. Transmute counts mana values." },
    { id: "stack", name: "Stack Sentinel", skill: "stack", n: 10, icon: "⛉", blurb: "An opponent casts something. Counter it, with what, or let it go?" },
    { id: "math", name: "Clock Math", skill: "rules", n: 10, icon: "∑", blurb: "Virtus halves, Bloodletter doubles, Mindcrank mills, Training Grounds discounts. Numbers that decide games." },
    { id: "threat", name: "Threat Read", skill: "combat", n: 8, icon: "⚑", blurb: "Four players, one choice: who to attack, who to rob, who gets the gift." }
  ];
  const drillDone = (st, id) => ((st.drills[id] || {}).sessions || []).length > 0;
  const drillBest = (st, id) => Math.max(0, ...((st.drills[id] || {}).sessions || []).map(s => s.score));
  const DATA = () => window.CETRATA_TRAIN_DATA || { stack: [], threat: [] };
  /* A question for drill d, seed s: { q, options, answer, any, explain, view, cards, hand, close } */
  function makeQuestion(d, s) {
    const T = TR();
    if (d.id === "mulligan") {
      const mulls = s % 5 === 4 ? 1 : 0;
      const hand = T.dealHand(4000 + s * 7);
      const adv = T.mulliganAdvice(hand, mulls);
      const st = adv.stats;
      return { kind: "mulligan", hand, mulls, q: mulls ? "Your free mulligan is spent. Keep this seven, or mulligan to six?" : "Your opening seven. Keep, or take the free mulligan?",
        options: ["Keep", "Mulligan"], answer: adv.close ? [0, 1] : [adv.keep ? 0 : 1], close: adv.close,
        explain: `${adv.close ? "Close call: either is fine. " : adv.keep ? "Keep. " : "Mulligan. "}In 400 goldfish games this hand finds a win line by turn 6 in ${pct(st.w6)} and by turn 8 in ${pct(st.w8)}, and has Etrata out by turn 4 in ${pct(st.e4)}${st.l3 < 0.6 ? `; it reaches three lands by turn 3 only ${pct(st.l3)} of the time` : ""}. Hand value ${Math.round(adv.value * 100)} against ${Math.round(adv.mull * 100)} for ${mulls ? "a mulligan to six" : "the free mulligan"}.`,
        adv };
    }
    if (d.id === "lines") return T.lineSpotter(s);
    if (d.id === "tutor") return T.tutorTarget(s);
    if (d.id === "math") return T.clockMath(s);
    const bank = d.id === "stack" ? DATA().stack : DATA().threat;
    if (!bank.length) return null;
    const it = bank[s % bank.length];
    return Object.assign({ kind: d.id }, it, { answer: [].concat(it.answer) });
  }
  function sessionSeeds(d, st) {
    const base = ((st.drills[d.id] || {}).sessions || []).length * 101 + 7;
    if (d.id === "stack" || d.id === "threat") {
      // every scenario once before any repeats, in a shuffled order
      const bank = d.id === "stack" ? DATA().stack : DATA().threat;
      const idx = bank.map((_, i) => i);
      let r = base * 9301 + 49297;
      for (let i = idx.length - 1; i > 0; i--) { r = (r * 9301 + 49297) % 233280; const j = Math.floor(r / 233280 * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
      const off = (((st.drills[d.id] || {}).sessions || []).length * d.n) % Math.max(1, idx.length);
      return Array.from({ length: Math.min(d.n, idx.length) }, (_, k) => idx[(off + k) % idx.length]);
    }
    return Array.from({ length: d.n }, (_, k) => base * 1000 + k * 17 + 3);
  }
  function viewHTML(v) {
    if (!v) return "";
    const list = a => a.length ? a.map(n => cn(n.replace(/ \(face down\)$/, "")) + (/ \(face down\)$/.test(n) ? " <small>(face down)</small>" : "")).join(", ") : "<span class='muted'>nothing</span>";
    return `<div class="tn-view">
      <div class="tn-me"><p><span class="tn-k">Battlefield</span>${list(v.bf)}</p>
      <p><span class="tn-k">Hand</span>${list(v.hand)}</p>
      <p><span class="tn-k">Mana</span><b>${v.mana}</b> available (${v.lands.length} land${v.lands.length === 1 ? "" : "s"})${v.cmd ? " · Etrata is in the command zone" : ""} · you're at ${v.life}</p></div>
      <div class="tn-opps">${v.opps.map(o => `<div class="tn-opp"><b>${esc(o.n)}</b> <span class="mono">${o.life} life · ${o.hand} cards · ${o.open} open</span><span class="muted small">${o.bf.length ? o.bf.map(n => esc(short(n))).join(", ") : "no creatures"}</span></div>`).join("")}</div>
    </div>`;
  }
  function handHTML(hand) {
    return `<div class="tn-hand">${hand.map(n => `<button type="button" class="tn-hc" data-card="${esc(n)}"><span class="mini-card" data-art="${esc(n)}"></span><span class="nm">${esc(short(n))}</span></button>`).join("")}</div>`;
  }
  function renderDrills(el, st) {
    const ts = trainState();
    if (st.run) return renderRunner(el, st);
    el.innerHTML = `<div class="tn-grid">${DRILLS.map(d => {
      const ses = (ts.drills[d.id] || {}).sessions || [];
      const best = drillBest(ts, d.id);
      const tier = best >= 95 ? "gold" : best >= 80 ? "silver" : best >= 60 ? "bronze" : "";
      return `<article class="tn-drill${ses.length ? " done" : ""}">
        <div class="tn-dh"><span class="tn-ic" aria-hidden="true">${d.icon}</span><div><b>${esc(d.name)}</b><span class="muted small">${esc(SKILL_NAME[d.skill])} · ${d.n} questions</span></div>${tier ? `<span class="tn-tier ${tier}">${tier}</span>` : ""}</div>
        <p>${esc(d.blurb)}</p>
        <div class="tn-dm mono">${ses.length ? `best ${best}% · ${ses.length} session${ses.length > 1 ? "s" : ""} · last ${ses[ses.length - 1].score}%` : "not done yet"}</div>
        <button class="btn ${ses.length ? "" : "primary"}" type="button" data-start="${d.id}">${ses.length ? "Go again" : "Start"}</button>
      </article>`;
    }).join("")}</div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-start]");
      if (!b) return;
      const d = DRILLS.find(x => x.id === b.dataset.start);
      b.disabled = true; b.textContent = "Loading the engine…";
      engine().then(() => {
        st.busy = true;
        st.run = { d, seeds: sessionSeeds(d, trainState()), k: 0, results: [], t0: Date.now() };
        nextQuestion(st);
        renderDrills(el, st); finish(el);
        el.scrollIntoView({ block: "start", behavior: "smooth" });
      }).catch(err => { b.disabled = false; b.textContent = "Couldn't load the game engine"; console.error(err); });
    };
  }
  function nextQuestion(st) {
    const r = st.run;
    r.q = null;
    for (let tries = 0; tries < 5 && !r.q; tries++) r.q = makeQuestion(r.d, r.seeds[r.k] + tries * 7919);
    r.picked = null; r.qt = Date.now();
  }
  function renderRunner(el, st) {
    const r = st.run, d = r.d;
    if (r.k >= r.seeds.length || !r.q) return renderSummary(el, st);
    const q = r.q;
    const answered = r.picked != null;
    const right = answered && (q.answer.includes(r.picked));
    el.innerHTML = `<div class="tn-run panel">
      <div class="tn-rh"><button class="btn ghost small" type="button" data-quit>Stop</button><b>${esc(d.name)}</b><span class="mono">${r.k + 1} / ${r.seeds.length}</span></div>
      <div class="sp-bar"><i style="--w:${(r.k / r.seeds.length) * 100}%"></i></div>
      ${q.hand ? handHTML(q.hand) : ""}
      ${q.context ? `<p class="tn-ctx">${cnText(q.context)}</p>` : ""}
      ${viewHTML(q.view)}
      <h3 class="qz-q">${cnText(q.q)}</h3>
      <ol class="qz-opts">${q.options.map((o, i) => `<li><button type="button" class="qz-opt${answered ? (q.answer.includes(i) ? " right" : i === r.picked ? " wrong" : "") : ""}" data-opt="${i}"${answered ? " disabled" : ""}>${esc(String(o).replace(/<i-c>(.*?)<\/i-c>/g, "$1"))}</button></li>`).join("")}</ol>
      ${answered ? `<div class="qz-explain"><p><b>${right ? (q.close ? "Fine." : "Right.") : "Not quite."}</b> ${cnText(q.explain || "")}</p>${q.principle ? `<p class="tn-principle"><span>Principle</span>${esc(q.principle)}</p>` : ""}</div>
        <div class="btn-row"><button class="btn primary" type="button" data-next>${r.k + 1 >= r.seeds.length ? "See the result" : "Next"}</button></div>` : ""}
    </div>`;
    el.onclick = e => {
      if (e.target.closest("[data-quit]")) { st.run = null; st.busy = false; renderDrills(el, st); finish(el); return; }
      const o = e.target.closest("[data-opt]");
      if (o && !answered) {
        r.picked = +o.dataset.opt;
        r.results.push({ ok: q.answer.includes(r.picked), ms: Date.now() - r.qt, q: String(q.q).slice(0, 140), kind: q.kind, picked: q.options[r.picked], right: q.options[q.answer[0]], close: !!q.close });
        renderRunner(el, st); finish(el);
        return;
      }
      if (e.target.closest("[data-next]")) { r.k++; if (r.k < r.seeds.length) nextQuestion(st); renderRunner(el, st); finish(el); }
    };
  }
  function renderSummary(el, st) {
    const r = st.run, d = r.d;
    const n = r.results.length, ok = r.results.filter(x => x.ok).length;
    const score = n ? Math.round(100 * ok / n) : 0;
    const avg = n ? Math.round(r.results.reduce((a, x) => a + x.ms, 0) / n / 100) / 10 : 0;
    if (!r.saved) {
      const ts = trainState();
      const dd = ts.drills[d.id] = ts.drills[d.id] || { sessions: [] };
      dd.sessions.push({ t: Date.now(), score, n, ok, avg, miss: r.results.filter(x => !x.ok).slice(0, 6) });
      dd.sessions = dd.sessions.slice(-30);
      r.saved = true;
      putTrain(ts);
    }
    const tier = score >= 95 ? "Gold" : score >= 80 ? "Silver" : score >= 60 ? "Bronze" : "";
    el.innerHTML = `<div class="tn-run panel tn-sum">
      <p class="eyebrow">${esc(d.name)}</p>
      <div class="tn-big"><b>${score}%</b><span>${ok} of ${n} right · ${avg}s a question${tier ? ` · ${tier}` : ""}</span></div>
      ${r.results.some(x => !x.ok) ? `<h4>To look at again</h4><ul class="tn-miss">${r.results.filter(x => !x.ok).map(x => `<li><span>${cnText(esc(x.q))}</span><span class="muted small">You: ${esc(x.picked)} · Best: ${esc(x.right)}</span></li>`).join("")}</ul>` : `<p>Clean sheet.</p>`}
      <div class="btn-row"><button class="btn" type="button" data-back>All drills</button><button class="btn primary" type="button" data-again>Go again</button></div>
    </div>`;
    el.onclick = e => {
      if (e.target.closest("[data-back]")) { st.run = null; st.busy = false; renderDrills(el, st); finish(el); bus(); }
      if (e.target.closest("[data-again]")) { st.run = { d, seeds: sessionSeeds(d, trainState()), k: 0, results: [], t0: Date.now() }; nextQuestion(st); renderDrills(el, st); finish(el); }
    };
  }

  /* ================================================================ launching the game table */
  function openTable(mode, seats) {
    return engine().then(() => {
      // the table registers as the lobby's, so the Play tab and the screen tests see one game at a time
      const L = window.MikuGame.Lobby;
      if (L.table) L.table.destroy();
      const t = L.table = new window.MikuGame.Table({
        onExit: () => { if (L.table === t) L.table = null; if (L.host) L.render(); bus(); },
        onRematch: (prev, gm) => { if (gm) openTable(gm, null); else if (prev) openTable(mode, prev); }
      });
      t.start(seats, mode);
      return t;
    });
  }
  function assessSeats(pool) {
    const MK = MKG();
    const hero = MK.CETRATA_DECK;
    const all = (MK.BOT_DECKS || []).filter(d => d.id !== hero.id && d.commander !== hero.commander);
    const inPool = d => pool === "mixed" ? true : pool === "b4" ? (d.bracket || 4) >= 4 : (d.bracket || 4) < 4;
    const list = all.filter(inPool);
    const out = [];
    const left = list.slice();
    while (out.length < 3 && left.length) out.push(left.splice(Math.floor(Math.random() * left.length), 1)[0]);
    return [{ human: true, deck: hero }].concat(out.map(d => ({ deck: d, skill: 0.9 })));
  }
  function startAssessment(pool) {
    return engine().then(() => openTable({
      kind: "assess",
      onDone: rec => { const list = games(); list.unshift(rec); putGames(list); },
      onReview: rec => { location.hash = "train/games"; setTimeout(() => openReview(rec.id), 60); }
    }, assessSeats(pool)));
  }
  function startRetry(rec, at) {
    return openTable({
      kind: "retry", rec, at,
      onDone: r2 => { const list = games(); list.unshift(r2); putGames(list); },
      onReview: r2 => { location.hash = "train/games"; setTimeout(() => openReview(r2.id), 60); }
    }, null);
  }

  /* ================================================================ puzzles */
  function renderPuzzles(el) {
    const ts = trainState();
    const T = TR();
    if (!T) {
      el.innerHTML = `<div class="tn-load"><p class="muted">Puzzles run in the game engine.</p><button class="btn primary" type="button" data-load>Load the puzzles</button></div>`;
      el.onclick = e => { if (e.target.closest("[data-load]")) { e.target.textContent = "Loading…"; engine().then(() => bus()); } };
      return;
    }
    const pr = Math.round(ts.prating || 1200);
    const solved = T.PUZZLES.filter(p => (ts.puzzles[p.id] || {}).solved).length;
    el.innerHTML = `<div class="tn-pzhead"><div class="tn-big"><b>${pr}</b><span>puzzle rating · ${solved} of ${T.PUZZLES.length} solved</span></div><p class="muted small">Each puzzle is one turn in the real game: the bots block and respond. Solving one without hints moves your rating like a won game against a player of the puzzle's rating.</p></div>
      <div class="tn-pzlist">${T.PUZZLES.slice().sort((a, b) => a.rating - b.rating).map(p => {
        const s = ts.puzzles[p.id] || {};
        return `<article class="tn-pz${s.solved ? " solved" : s.tries ? " tried" : ""}">
          <div class="tn-pzr mono">${p.rating}</div>
          <div class="tn-pzb"><b>${esc(p.title)}</b><span>${A.mana(esc(p.goal))}</span><span class="muted small">${"★".repeat(p.level)}${"☆".repeat(5 - p.level)} · ${esc(SKILL_NAME[p.skill] || "")}${s.tries ? ` · ${s.solved ? `solved${s.hints ? ` with ${s.hints} hint${s.hints > 1 ? "s" : ""}` : " clean"}` : `${s.tries} tr${s.tries > 1 ? "ies" : "y"}`}` : ""}</span></div>
          <button class="btn ${s.solved ? "" : "primary"} small" type="button" data-pz="${p.id}">${s.solved ? "Replay" : s.tries ? "Try again" : "Play"}</button>
        </article>`;
      }).join("")}</div>`;
    el.onclick = e => {
      const b = e.target.closest("[data-pz]");
      if (!b) return;
      const pz = T.PUZZLES.find(p => p.id === b.dataset.pz);
      openPuzzle(pz);
    };
  }
  function openPuzzle(pz) {
    const T = TR();
    const mode = { kind: "puzzle", puzzle: T.puzzleFor(pz), onDone: res => recordPuzzle(pz, res) };
    return openTable(mode, [{ human: true, deck: MKG().CETRATA_DECK }]);
  }
  function recordPuzzle(pz, res) {
    const ts = trainState();
    const s = ts.puzzles[pz.id] = ts.puzzles[pz.id] || { tries: 0, solved: false, hints: 0 };
    const first = !s.rated;
    s.tries++;
    if (res.solved && !s.solved) { s.solved = true; s.hints = res.hints; s.ms = res.ms; }
    // Elo on the first attempt only: a hint counts as half a loss
    if (first) {
      const R = ts.prating || 1200, E = 1 / (1 + Math.pow(10, (pz.rating - R) / 400));
      const score = res.solved ? Math.max(0, 1 - 0.25 * res.hints) : 0;
      ts.prating = Math.round(R + 40 * (score - E));
      s.rated = true;
    }
    putTrain(ts);
  }

  /* ================================================================ games: assessment and review */
  let reviewId = null;
  function openReview(id) { reviewId = id; bus(); const el = document.querySelector(".w-games"); if (el) el.scrollIntoView({ block: "start" }); }
  function renderGames(el, st) {
    if (reviewId) {
      const rec = games().find(g => g.id === reviewId);
      if (rec) return renderReview(el, st, rec);
      reviewId = null;
    }
    const list = games();
    const ts = trainState();
    const pool = st.pool || "precon";
    el.innerHTML = `<div class="tn-assess panel">
        <p class="eyebrow">Assessment game</p>
        <h3>Play a game the way you'd play it at the table</h3>
        <p>No coach, no companion: every choice you make is recorded with what the planner saw at that moment. After the game you get a review, and the key moments are replayed many times each way to measure what your choice cost.</p>
        <div class="seg small" role="radiogroup" aria-label="Opponents">${[["precon", "Casual decks"], ["mixed", "Mixed"], ["b4", "Bracket 4"]].map(([k, l]) => `<button role="radio" aria-checked="${pool === k}" data-pool="${k}">${l}</button>`).join("")}</div>
        <div class="btn-row"><button class="btn primary big" type="button" data-assess>Start an assessment game</button></div>
      </div>
      <section class="tn-glist">
        <h3>Your recorded games</h3>
        ${list.length ? list.map(g => {
          const res = g.result || {};
          const an = analyses()[g.id] || {};
          const acc = accuracyOf(g, an);
          return `<button class="tn-gi" type="button" data-rec="${esc(g.id)}">
            <span class="tn-res ${res.win ? "w" : res.draw ? "d" : "l"}">${res.win ? "Won" : res.draw ? "Draw" : res.conceded ? "Conceded" : "Lost"}</span>
            <span class="tn-gm"><b>${g.mode === "retry" ? "Retry from a moment" : "Assessment"} · round ${res.rounds || "?"}</b><span class="muted small">vs ${g.seats.filter((s, i) => i !== g.hero).map(s => esc(s.name)).join(", ")} · ${ago(g.t)}</span></span>
            <span class="tn-acc mono">${acc != null ? acc + "%" : "–"}<small>accuracy</small></span>
            ${sparkWP(g)}
          </button>`;
        }).join("") : `<p class="muted">No games yet. Play an assessment game: it takes a normal game's time, and the review is ready when it ends.</p>`}
      </section>
      ${journalHTML(ts)}`;
    el.onclick = e => {
      const p = e.target.closest("[data-pool]"); if (p) { st.pool = p.dataset.pool; renderGames(el, st); return; }
      const a = e.target.closest("[data-assess]"); if (a) { a.disabled = true; a.textContent = "Loading…"; startAssessment(pool).then(() => { a.disabled = false; a.textContent = "Start an assessment game"; }).catch(err => { console.error(err); a.textContent = "Couldn't load the game"; }); return; }
      const g = e.target.closest("[data-rec]"); if (g) { openReview(g.dataset.rec); return; }
      journalClick(e, el, st);
    };
    el.onsubmit = e => journalSubmit(e, el, st);
  }
  function sparkWP(g) {
    const pts = (g.moments || []).filter(m => m.wp != null && m.mine && m.k === "main");
    if (pts.length < 2) return `<svg class="tn-spark" viewBox="0 0 100 28" aria-hidden="true"></svg>`;
    const max = Math.max(0.5, ...pts.map(m => m.wp));
    const d = pts.map((m, i) => `${(i / (pts.length - 1) * 100).toFixed(1)},${(26 - m.wp / max * 24).toFixed(1)}`).join(" ");
    return `<svg class="tn-spark" viewBox="0 0 100 28" aria-hidden="true"><polyline points="${d}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
  }
  /* Accuracy over the analyzed moments: Lichess's formula on the win chance each choice gave up. */
  function accuracyOf(rec, an) {
    const P = MKG() && MKG().Practice;
    const xs = Object.values(an || {}).filter(r => r && !r.error && r.loss != null);
    if (!xs.length) return null;
    const f = P ? P.accuracy : (l => Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * l) - 3.1669)));
    // a loss inside the noise counts as none
    const acc = xs.map(r => f(r.loss > 2 * (r.se || 0) ? r.loss * 100 : 0));
    return Math.round(acc.reduce((a, b) => a + b, 0) / acc.length);
  }

  /* ---------------------------------------------------------------- the review of one game */
  let worker = null, workerReady = null;
  const jobs = new Map();
  function getWorker() {
    if (workerReady) return workerReady;
    workerReady = engine().then(() => new Promise((res, rej) => {
      const info = window.MikuApp && window.MikuApp.gameInfo;
      if (!info || typeof Worker === "undefined") { rej(new Error("no worker")); return; }
      try { worker = new Worker(info.base + "practice-worker.js?v=" + info.v); } catch (e) { rej(e); return; }
      worker.onmessage = e => {
        const m = e.data;
        if (m.type === "ready") { res(worker); return; }
        const j = jobs.get(m.id);
        if (!j) return;
        if (m.type === "progress" && j.progress) j.progress(m.k, m.total);
        if (m.type === "result") { jobs.delete(m.id); j.done(m.r); }
      };
      worker.onerror = e => { rej(e); };
      worker.postMessage({ type: "init", files: info.files.filter(f => !/game-ui|checklist/.test(f)).map(f => f.replace(/^game\//, "") + "?v=" + info.v) });
    }));
    workerReady.catch(() => { workerReady = null; });
    return workerReady;
  }
  let jobSeq = 0;
  /* Deep analysis of one moment: in the worker when there is one, else on the page. */
  function analyze(rec, i, progress) {
    const opts = { n: 16, horizon: 3, maxCands: 8 };
    return getWorker().then(w => new Promise(done => {
      const id = ++jobSeq;
      jobs.set(id, { done, progress });
      w.postMessage(Object.assign({ type: "moment", id, rec, i }, opts));
    })).catch(() => engine().then(() => MKG().Practice.analyzeMoment(rec, i, Object.assign({ onProgress: progress }, opts))));
  }
  const CLASS = { best: ["Best", "c-best"], good: ["Good", "c-good"], inaccuracy: ["Inaccuracy", "c-inacc"], mistake: ["Mistake", "c-mistake"], blunder: ["Blunder", "c-blunder"] };
  function classOf(r) { const P = MKG() && MKG().Practice; return r && !r.error && P ? P.classify(r.loss, r.se) : null; }
  function renderReview(el, st, rec) {
    const T = TR();
    if (!T) { el.innerHTML = `<p class="muted">Loading the review…</p>`; engine().then(() => bus()); return; }
    st.rv = st.rv && st.rv.id === rec.id ? st.rv : { id: rec.id, data: T.review(rec), open: null };
    const rv = st.rv.data;
    const an = analyses()[rec.id] || {};
    const res = rec.result || {};
    const acc = accuracyOf(rec, an);
    const moments = (rec.moments || []).filter(m => !m.replayed);
    const crit = T.criticalMoments(rec, rv, 6);
    const pending = crit.filter(i => !an[i]);
    const flagsAt = new Map(rv.flags.map(f => [f.i, f]));
    const opp = rec.seats.filter((s, i) => i !== rec.hero).map(s => s.name);
    el.innerHTML = `<div class="tn-review">
      <div class="tn-rvh"><button class="btn ghost small" type="button" data-close>All games</button><span class="muted small">${ago(rec.t)} · vs ${opp.map(esc).join(", ")}</span></div>
      <div class="tn-rvtop panel">
        <div class="tn-big"><b class="${res.win ? "w" : "l"}">${res.win ? "Won" : res.draw ? "Draw" : "Lost"}</b><span>round ${res.rounds || "?"}${res.killer ? ` · ${esc(res.killer)}` : ""}</span></div>
        <div class="tn-kpis">
          <div><b>${acc != null ? acc + "%" : "–"}</b><span>accuracy${Object.keys(an).length ? ` (${Object.keys(an).length} moments)` : ""}</span></div>
          <div><b>${rv.stats.etrataTurn ? "T" + rv.stats.etrataTurn : "–"}</b><span>Etrata out</span></div>
          <div><b>${rv.stats.cloaks}</b><span>cloaks</span></div>
          <div><b>${rv.stats.spells}</b><span>spells cast</span></div>
          <div><b>${moments.length}</b><span>decisions</span></div>
          <div><b>${rv.flags.filter(f => !f.info).length}</b><span>flags</span></div>
        </div>
      </div>
      <section class="tn-sec"><h3>Win chance through the game</h3>${wpChart(rec, rv, an)}<p class="muted small">From a model fitted on 4,000 bot games of this deck: life totals, boards, mana, cards and how close your lines are. Dots are your decisions; red ones are flagged.</p></section>
      <section class="tn-sec"><div class="tn-sech"><h3>Key moments</h3>${pending.length ? `<button class="btn primary small" type="button" data-deep>Replay the ${pending.length} key moment${pending.length > 1 ? "s" : ""} (${pending.length * 8 * 16} games)</button>` : ""}</div>
        <p class="muted small">Each moment is replayed from the seed with every option you had, 16 times each with the libraries reshuffled the same way for every option, then three rounds are played out by the bots and scored by the model.</p>
        <div class="tn-moments">${crit.map(i => momentCard(rec, i, an[i], flagsAt.get(i), st)).join("") || `<p class="muted">Nothing stood out.</p>`}</div>
      </section>
      ${rv.flags.length ? `<section class="tn-sec"><h3>What the review rules noticed</h3><div class="tn-flags">${rv.flags.map(f => `<div class="tn-flag sev${f.sev}${f.info ? " info" : ""}"><div class="tn-fh"><span class="tn-skill">${esc(SKILL_NAME[f.skill] || f.skill)}</span><b>${esc(f.title)}</b><span class="mono small">${f.r ? "round " + f.r : "opening"}</span></div><p>${cnText(esc(f.text))}</p><div class="tn-fa">${f.i != null && f.id !== "mull" ? `<button class="btn ghost small" type="button" data-retry="${f.i}">Retry from here</button>` : ""}${f.i != null && !an[f.i] && f.id !== "mull" ? `<button class="btn ghost small" type="button" data-one="${f.i}">Replay this moment</button>` : ""}</div></div>`).join("")}</div></section>` : ""}
      <section class="tn-sec"><details class="tn-timeline"><summary>Every decision (${moments.length})</summary>${timelineHTML(rec, an, flagsAt)}</details></section>
    </div>`;
    el.onclick = e => {
      if (e.target.closest("[data-close]")) { reviewId = null; st.rv = null; bus(); return; }
      const r = e.target.closest("[data-retry]");
      if (r) { startRetry(rec, +r.dataset.retry); return; }
      const one = e.target.closest("[data-one]");
      if (one) { runDeep(el, st, rec, [+one.dataset.one]); return; }
      if (e.target.closest("[data-deep]")) { runDeep(el, st, rec, pending); return; }
      const t = e.target.closest("[data-mopen]");
      if (t) { st.rv.open = st.rv.open === +t.dataset.mopen ? null : +t.dataset.mopen; renderReview(el, st, rec); finish(el); }
    };
  }
  function runDeep(el, st, rec, list) {
    if (st.busy) return;
    st.busy = true;
    const box = el.querySelector(".tn-moments");
    const bar = document.createElement("div");
    bar.className = "tn-progress";
    bar.innerHTML = `<span>Replaying…</span><div class="sp-bar"><i style="--w:0%"></i></div>`;
    if (box) box.before(bar);
    let k = 0;
    const step = () => {
      if (k >= list.length) { st.busy = false; renderReview(el, st, rec); finish(el); bus(); return; }
      const i = list[k];
      bar.querySelector("span").textContent = `Replaying moment ${k + 1} of ${list.length}…`;
      analyze(rec, i, (a, b) => { const w = ((k + a / b) / list.length) * 100; bar.querySelector("i").style.setProperty("--w", w + "%"); }).then(r => {
        putAnalysis(rec.id, i, r || { error: "no result" });
        k++; step();
      });
    };
    step();
  }
  function momentByI(rec, i) { return (rec.moments || []).find(m => m.i === i); }
  const KIND = { mulligan: "Mulligan", main: "Your play", attack: "Attack", block: "Blocks", respond: "Response", choose: "Choice" };
  function situation(m) {
    if (!m) return "";
    const bits = [];
    if (m.k === "respond" && m.top) bits.push(`${esc(m.top.n)} on the stack`);
    if (m.k === "choose" && m.q) bits.push(esc(m.q.prompt || ""));
    if (m.k === "attack" && m.cands) bits.push(`could attack with ${m.cands.slice(0, 4).map(esc).join(", ")}`);
    if (m.mana != null) bits.push(`${m.mana} mana`);
    if (m.lines && m.lines[0]) bits.push(`closest line ${esc(m.lines[0].k)} (${esc(m.lines[0].w)})`);
    return bits.join(" · ");
  }
  function momentCard(rec, i, r, f, st) {
    const m = momentByI(rec, i);
    if (!m) return "";
    const cls = classOf(r);
    const open = st.rv && st.rv.open === i;
    const c = cls ? CLASS[cls] : null;
    return `<article class="tn-mo${open ? " open" : ""}">
      <button class="tn-moh" type="button" data-mopen="${i}">
        <span class="tn-mr mono">R${m.r}</span>
        <span class="tn-mt"><b>${esc(KIND[m.k] || m.k)}: ${esc(m.ans || "")}</b><span class="muted small">${situation(m)}</span></span>
        ${c ? `<span class="tn-cls ${c[1]}">${c[0]}</span>` : r && r.error ? `<span class="tn-cls">n/a</span>` : `<span class="tn-cls pend">not replayed</span>`}
      </button>
      ${open ? momentDetail(rec, m, r, f) : ""}
    </article>`;
  }
  function momentDetail(rec, m, r, f) {
    const hand = (m.hand || []).map(cn).join(", ");
    const bf = (m.bf || []).map(n => n.startsWith("↓") ? (n === "↓?" ? "a face-down card" : cn(n.slice(1)) + " <small>(face down)</small>") : cn(n)).join(", ");
    let table = "";
    if (r && !r.error && r.cands) {
      const best = r.cands[0];
      table = `<div class="table-wrap"><table class="stack tn-cands"><thead><tr><th>Option</th><th>Score</th><th>vs best</th></tr></thead><tbody>${r.cands.map(c => `<tr class="${c.tags.includes("you") ? "you" : ""}${c === best ? " best" : ""}"><td>${esc(c.label)}${c.tags.includes("you") ? " <span class='tn-tag'>you</span>" : ""}${c.tags.includes("bot") ? " <span class='tn-tag b'>bot</span>" : ""}</td><td class="mono">${pct(c.eq)}</td><td class="mono">${c === best ? "best" : "−" + Math.round(c.loss * 100) + (c.se ? ` ±${Math.round(c.se * 200)}` : "")}</td></tr>`).join("")}</tbody></table></div>
        <p class="muted small">${r.n} replays per option, ${r.horizon} rounds deep${r.ms ? `, ${(r.ms / 1000).toFixed(1)} s` : ""}. Score: win chance at the end of the replay (wins count 100%, losses 0%). ± is two standard errors of the paired difference.</p>`;
      const P = MKG().Practice;
      const cls = P.classify(r.loss, r.se);
      if (r.mine && r.best && r.mine !== r.best) table += `<p class="tn-verdict ${cls}">${cls === "good" || cls === "best" ? `“${esc(r.best)}” scored a little higher, but inside the noise: your choice was fine.` : `“${esc(r.best)}” would have kept about ${Math.round(r.loss * 100)} points more win chance than “${esc(r.mine)}”.`}</p>`;
      else if (r.mine) table += `<p class="tn-verdict best">Your choice was the best of the options tried.</p>`;
    } else if (r && r.error) table = `<p class="muted">${esc(r.error)}</p>`;
    return `<div class="tn-mod">
      <p><span class="tn-k">Hand</span>${hand || "empty"}</p>
      <p><span class="tn-k">Your board</span>${bf || "empty"}</p>
      <p><span class="tn-k">Table</span>${(m.opp || []).filter(o => !o.lost).map(o => `${esc(o.n)} ${o.life} life, ${o.cr} creature${o.cr === 1 ? "" : "s"} (${o.pw} power), ${o.open} open`).join(" · ")}</p>
      ${m.stage ? `<p><span class="tn-k">Coach would say</span><b>${esc(m.stage)}${m.ctitle ? ": " + esc(m.ctitle) : ""}</b>${(m.csteps || []).length ? `<br><span class="muted small">${A.mana(esc(m.csteps[0]))}</span>` : ""}</p>` : ""}
      ${m.wp != null ? `<p><span class="tn-k">Win chance</span>${pct(m.wp)}${m.ms ? ` · you took ${(m.ms / 1000).toFixed(1)} s` : ""}</p>` : ""}
      ${f ? `<p class="tn-flagline">${esc(f.title)}: ${cnText(esc(f.text))}</p>` : ""}
      ${table}
      <div class="btn-row"><button class="btn small" type="button" data-retry="${m.i}">Retry from here</button>${!r ? `<button class="btn primary small" type="button" data-one="${m.i}">Replay this moment</button>` : ""}</div>
    </div>`;
  }
  function wpChart(rec, rv, an) {
    const pts = (rec.moments || []).filter(m => m.wp != null && !m.replayed);
    if (pts.length < 2) return `<p class="muted">Not enough decisions to chart.</p>`;
    const W = 420, H = 190, pad = 26;
    const max = Math.max(0.4, ...pts.map(m => m.wp)) * 1.08;
    const x = k => pad + (k / (pts.length - 1)) * (W - pad * 2);
    const y = v => H - pad - (v / max) * (H - pad * 2);
    const flagged = new Set(rv.flags.filter(f => !f.info).map(f => f.i));
    const line = pts.map((m, k) => `${x(k).toFixed(1)},${y(m.wp).toFixed(1)}`).join(" ");
    const area = `${x(0)},${H - pad} ${line} ${x(pts.length - 1)},${H - pad}`;
    // round boundaries
    const rounds = [];
    pts.forEach((m, k) => { if (!k || m.r !== pts[k - 1].r) rounds.push({ k, r: m.r }); });
    const ticks = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1].filter(v => v < max);
    return `<div class="tn-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Win chance by decision">
      ${ticks.map(v => `<line x1="${pad}" x2="${W - pad}" y1="${y(v)}" y2="${y(v)}" class="grid"/><text x="2" y="${y(v) + 3}" class="lab">${Math.round(v * 100)}%</text>`).join("")}
      ${rounds.map(o => `<line x1="${x(o.k)}" x2="${x(o.k)}" y1="${pad - 6}" y2="${H - pad}" class="rnd"/><text x="${x(o.k) + 2}" y="${pad - 8}" class="lab">R${o.r}</text>`).join("")}
      <polygon points="${area}" class="area"/>
      <polyline points="${line}" class="ln"/>
      ${pts.map((m, k) => m.mine || flagged.has(m.i) ? `<circle cx="${x(k).toFixed(1)}" cy="${y(m.wp).toFixed(1)}" r="${flagged.has(m.i) ? 4.5 : 2.4}" class="${flagged.has(m.i) ? "fl" : "pt"}"><title>Round ${m.r}: ${esc(m.ans || "")} (${pct(m.wp)})</title></circle>` : "").join("")}
    </svg></div>`;
  }
  function timelineHTML(rec, an, flagsAt) {
    const ms = (rec.moments || []).filter(m => !m.replayed);
    let out = "", lastR = -1;
    for (const m of ms) {
      if (m.r !== lastR) { out += `<h4>Round ${m.r}</h4>`; lastR = m.r; }
      const r = an[m.i], cls = classOf(r), f = flagsAt.get(m.i);
      out += `<div class="tn-tl${f ? " flag" : ""}"><span class="mono">${esc(KIND[m.k] || m.k)}</span><span>${esc(m.ans || "")}${m.stage && m.k === "main" ? ` <span class="muted small">· coach: ${esc(m.stage)}</span>` : ""}</span>${cls ? `<span class="tn-cls ${CLASS[cls][1]}">${CLASS[cls][0]}</span>` : ""}<span class="mono small">${m.wp != null ? pct(m.wp) : ""}</span></div>`;
    }
    return `<div class="tn-tlw">${out}</div>`;
  }

  /* ---------------------------------------------------------------- paper games */
  function journalHTML(ts) {
    const j = ts.journal || [];
    return `<section class="tn-journal panel">
      <p class="eyebrow">Real table</p>
      <h3>Log a paper game</h3>
      <p class="muted small">Thirty seconds after a game at the table. These feed the personal analysis next to the recorded games.</p>
      <form class="tn-jf">
        <label>Result<select name="res"><option value="win">Won</option><option value="loss">Lost</option><option value="draw">Draw</option></select></label>
        <label>Mulligans<select name="mull"><option>0</option><option>1</option><option>2</option><option>3</option></select></label>
        <label>Etrata out on turn<input name="et" type="number" min="1" max="20" placeholder="3"></label>
        <label>Game ended on turn<input name="end" type="number" min="1" max="40" placeholder="8"></label>
        <label>Line that won (or tried)<select name="line"><option value="">None</option><option value="vampire">Vampire loop</option><option value="mindcrank">Mindcrank + Guildmage</option><option value="doubletap">Double tap</option><option value="brine">Brine lock</option><option value="manta">Infinite turns</option><option value="hitlist">Hit list</option><option value="combat">Combat</option></select></label>
        <label>What beat you<select name="why"><option value="">Nothing / I won</option><option value="speed">Someone was faster</option><option value="interaction">My combo got answered</option><option value="removal">Etrata kept dying</option><option value="mana">Mana problems</option><option value="flood">Flood or no action</option><option value="target">The table ganged up on me</option><option value="misplay">My own misplay</option></select></label>
        <label class="wide">One thing I'd do differently<input name="note" maxlength="200" placeholder="e.g. hold Swan Song for the wipe"></label>
        <div class="btn-row wide"><button class="btn primary" type="submit">Save the game</button></div>
      </form>
      ${j.length ? `<ul class="tn-jl">${j.slice(0, 8).map((x, k) => `<li><span class="tn-res ${x.res === "win" ? "w" : x.res === "draw" ? "d" : "l"}">${x.res === "win" ? "Won" : x.res === "draw" ? "Draw" : "Lost"}</span><span>${x.end ? "Turn " + x.end : ""}${x.line ? " · " + esc(x.line) : ""}${x.why ? " · " + esc(x.why) : ""}${x.note ? `<br><span class="muted small">${esc(x.note)}</span>` : ""}</span><button type="button" class="btn ghost small" data-jdel="${k}" aria-label="Delete">×</button></li>`).join("")}</ul>` : ""}
    </section>`;
  }
  function journalSubmit(e, el, st) {
    const f = e.target.closest(".tn-jf");
    if (!f) return;
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const ts = trainState();
    ts.journal = [{ t: Date.now(), res: d.res, mull: +d.mull || 0, et: +d.et || null, end: +d.end || null, line: d.line || "", why: d.why || "", note: (d.note || "").slice(0, 200) }].concat(ts.journal || []).slice(0, 60);
    putTrain(ts);
    if (A.toast) A.toast("Game saved");
  }
  function journalClick(e) {
    const b = e.target.closest("[data-jdel]");
    if (!b) return;
    const ts = trainState();
    ts.journal.splice(+b.dataset.jdel, 1);
    putTrain(ts);
  }

  /* ================================================================ the path and the report */
  const REQ = { drills: DRILLS.length, puzzles: 6, games: 3 };
  function progress() {
    const ts = trainState(), gs = games().filter(g => g.mode === "assess" && g.result);
    const drills = DRILLS.filter(d => drillDone(ts, d.id)).length;
    const puzzles = Object.values(ts.puzzles).filter(p => p.tries).length;
    const quiz = load(KEY + ".quiz.v1", {});
    return { ts, gs, drills, puzzles, games: gs.length, quizSeen: quiz.seen || 0, quizRight: quiz.right || 0, unlocked: drills >= REQ.drills && puzzles >= REQ.puzzles && gs.length >= REQ.games };
  }
  function renderPath(el) {
    const p = progress();
    const ring = (n, of, label) => { const f = Math.min(1, n / of); return `<div class="tn-ring" style="--f:${f}"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15.9" class="bg"/><circle cx="18" cy="18" r="15.9" class="fg" stroke-dasharray="${(f * 100).toFixed(1)} 100"/></svg><b>${Math.min(n, of)}/${of}</b><span>${label}</span></div>`; };
    const next = !p.drills ? ["Start with the Mulligan Lab", "#train/drills"] : p.drills < REQ.drills ? [`Finish the drills: ${DRILLS.filter(d => !drillDone(p.ts, d.id)).map(d => d.name).join(", ")}`, "#train/drills"] : p.puzzles < REQ.puzzles ? ["Try the puzzles", "#train/puzzles"] : p.games < REQ.games ? ["Play an assessment game", "#train/games"] : ["Read your analysis", "#train/report"];
    el.innerHTML = `<div class="tn-path">
      <div class="tn-rings">${ring(p.drills, REQ.drills, "drills")}${ring(p.puzzles, REQ.puzzles, "puzzles")}${ring(p.games, REQ.games, "assessment games")}</div>
      <a class="tn-next panel" href="${next[1]}"><span class="eyebrow">Next</span><b>${esc(next[0])}</b><span class="muted small">${p.unlocked ? "Your personal analysis is unlocked." : "Do all six drills once, try six puzzles and play three assessment games to unlock your personal analysis."}</span></a>
      <ol class="tn-steps">
        <li class="${p.drills >= REQ.drills ? "done" : ""}"><b>Drills</b><span>Six drills, each a short session: mulligans, spotting the win, tutoring, the stack, the numbers and reading the table. Generated from the real engine, so they never run out.</span></li>
        <li class="${p.puzzles >= REQ.puzzles ? "done" : ""}"><b>Puzzles</b><span>Eleven one-turn puzzles in the real game, rated like chess puzzles. Each one hides a rule or a trap this deck runs into.</span></li>
        <li class="${p.quizSeen >= 30 ? "done" : ""}"><b>Quiz</b><span>The rules and the lines, on spaced repetition: what you miss comes back.</span></li>
        <li class="${p.games >= REQ.games ? "done" : ""}"><b>Assessment games</b><span>Real games with no coach. Every decision is recorded with what the planner saw, then the key moments are replayed every way you could have played them.</span></li>
        <li class="${p.unlocked ? "done" : ""}"><b>Personal analysis</b><span>Your eight skills scored from everything above, your leaks with the exact moments they cost you, your play style next to the targets, and a training plan.</span></li>
      </ol>
    </div>`;
  }

  /* Skill scores from every source: drills, puzzles, quiz, the review rules and the replays. */
  function skillScores() {
    const p = progress();
    const T = TR();
    const S = {};
    Object.keys(SKILL_NAME).forEach(k => { S[k] = { w: 0, x: 0, src: [] }; });
    const add = (k, x, w, label) => { if (!S[k] || !(w > 0)) return; S[k].w += w; S[k].x += x * w; S[k].src.push({ label, x, w }); };
    // drills: the last three sessions
    for (const d of DRILLS) {
      const ses = ((p.ts.drills[d.id] || {}).sessions || []).slice(-3);
      if (!ses.length) continue;
      const n = ses.reduce((a, s) => a + s.n, 0), ok = ses.reduce((a, s) => a + s.ok, 0);
      add(d.skill, ok / n, n * 0.6, `${d.name}: ${ok}/${n}`);
    }
    // puzzles
    if (T) for (const pz of T.PUZZLES) { const s = p.ts.puzzles[pz.id]; if (s && s.tries) add(pz.skill, s.solved ? (s.hints ? 0.7 : 1) : 0.2, 2, `Puzzle ${pz.title}: ${s.solved ? "solved" : "not solved"}`); }
    // quiz, by topic
    const quiz = load(KEY + ".quiz.v1", {});
    const QS = window.CETRATA_QUIZ || [];
    const TOPIC = { combos: "lines", tutors: "tutor", theft: "etrata", cards: "rules", rules: "rules", plan: "lines", mana: "tempo", rulings: "rules" };
    const byT = {};
    for (const q of QS) { const b = (quiz.box || {})[q.id]; if (b == null) continue; const k = TOPIC[q.topic] || "rules"; byT[k] = byT[k] || { n: 0, s: 0 }; byT[k].n++; byT[k].s += Math.min(1, b / 3); }
    for (const k of Object.keys(byT)) add(k, byT[k].s / byT[k].n, Math.min(8, byT[k].n * 0.3), `Quiz: ${byT[k].n} questions seen`);
    // recorded games: the review rules' evidence and the replays
    const ans = analyses();
    for (const g of p.gs) {
      let rv = null;
      try { rv = T ? T.review(g) : null; } catch (e) { rv = null; }
      if (rv) for (const k of Object.keys(rv.ev)) { const e = rv.ev[k]; if (e.n) add(k, e.ok / e.n, e.n * 1.2, `Game ${ago(g.t)}: ${Math.round(e.ok * 10) / 10}/${Math.round(e.n * 10) / 10}`); }
      const an = ans[g.id] || {};
      for (const i of Object.keys(an)) {
        const r = an[i]; if (!r || r.error || r.loss == null) continue;
        const m = momentByI(g, +i); if (!m) continue;
        const k = skillOfMoment(m);
        const lossPct = r.loss > 2 * (r.se || 0) ? r.loss * 100 : 0;
        add(k, MKG().Practice.accuracy(lossPct) / 100, 3, `Replayed moment, round ${m.r}`);
      }
    }
    for (const k of Object.keys(S)) {
      const s = S[k];
      // a weak prior at 60 so one data point can't say 0 or 100
      s.score = Math.round(100 * (s.x + 0.6 * 1.5) / (s.w + 1.5));
      s.conf = s.w;
    }
    return S;
  }
  function skillOfMoment(m) {
    if (m.k === "mulligan") return "mull";
    if (m.k === "attack" || m.k === "block") return "combat";
    if (m.k === "respond") return "stack";
    if (m.k === "choose") return m.q && m.q.purpose === "tutor" ? "tutor" : "rules";
    const a = m.ans || "";
    if (/^Play /.test(a) || /Sol Ring|Signet|Talisman of|Fellwar|Mind Stone|Mox Amber|Dark Ritual|Etrata, Deadly Fugitive$/.test(a)) return "tempo";
    if (/Tutor|Seal|Intent|Beseech|Vault|Symmetry|Wishclaw|Tribute Mage|Dizzy|Shred|Muddle|Drift|House Guard/.test(a)) return "tutor";
    if (/face down|Face-down|turn face up/i.test(a)) return "etrata";
    return "lines";
  }
  function radar(S) {
    const keys = Object.keys(SKILL_NAME);
    const R = 92, cx = 130, cy = 120;
    const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / keys.length; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
    const poly = keys.map((k, i) => pt(i, S[k].score / 100).map(n => n.toFixed(1)).join(",")).join(" ");
    return `<svg class="tn-radar" viewBox="-34 0 328 245" role="img" aria-label="Skill scores">
      ${[0.25, 0.5, 0.75, 1].map(f => `<polygon points="${keys.map((k, i) => pt(i, f).join(",")).join(" ")}" class="ring"/>`).join("")}
      ${keys.map((k, i) => { const [x, y] = pt(i, 1); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="ax"/>`; }).join("")}
      <polygon points="${poly}" class="you"/>
      ${keys.map((k, i) => { const [x, y] = pt(i, 1.16); return `<text x="${x}" y="${y}" text-anchor="middle" class="lab">${esc(SKILL_SHORT[k])} ${S[k].conf > 0.5 ? S[k].score : "–"}</text>`; }).join("")}
    </svg>`;
  }
  function renderReport(el, st) {
    const p = progress();
    const T = TR();
    if (!T) { el.innerHTML = `<div class="tn-load"><p class="muted">The analysis reads your games with the game engine.</p><button class="btn primary" type="button" data-load>Load it</button></div>`; el.onclick = e => { if (e.target.closest("[data-load]")) engine().then(() => bus()); }; return; }
    if (!p.unlocked && !st.peek) {
      el.innerHTML = `<div class="tn-lock panel"><p class="eyebrow">Personal analysis</p><h3>Locked until you've done the work</h3>
        <ul class="tn-req"><li class="${p.drills >= REQ.drills ? "ok" : ""}">All six drills, one session each: <b>${p.drills}/${REQ.drills}</b></li><li class="${p.puzzles >= REQ.puzzles ? "ok" : ""}">Six puzzles tried: <b>${Math.min(p.puzzles, REQ.puzzles)}/${REQ.puzzles}</b></li><li class="${p.games >= REQ.games ? "ok" : ""}">Three assessment games: <b>${Math.min(p.games, REQ.games)}/${REQ.games}</b></li></ul>
        <p class="muted small">The analysis needs your decisions in real games, not just quiz answers. Three games is the minimum for patterns; it gets sharper with every game you add.</p>
        <button class="btn ghost small" type="button" data-peek>Show what I have so far</button></div>`;
      el.onclick = e => { if (e.target.closest("[data-peek]")) { st.peek = true; renderReport(el, st); finish(el); } };
      return;
    }
    const S = skillScores();
    const keys = Object.keys(SKILL_NAME).filter(k => S[k].conf > 0.5);
    const ranked = keys.slice().sort((a, b) => S[a].score - S[b].score);
    const leaks = ranked.slice(0, 3), strengths = ranked.slice(3).slice(-2).reverse();
    const overall = keys.length ? Math.round(keys.reduce((a, k) => a + S[k].score * Math.min(1, S[k].conf / 6), 0) / keys.reduce((a, k) => a + Math.min(1, S[k].conf / 6), 0)) : null;
    // the games: stats, flags and examples
    const reviews = p.gs.map(g => { try { return { g, rv: T.review(g) }; } catch (e) { return null; } }).filter(Boolean);
    const ans = analyses();
    const examples = k => {
      const out = [];
      for (const { g, rv } of reviews) for (const f of rv.flags.filter(f => f.skill === k && !f.info)) out.push({ g, f, r: (ans[g.id] || {})[f.i] });
      return out.sort((a, b) => (b.r && b.r.loss || 0) - (a.r && a.r.loss || 0) || b.f.sev - a.f.sev).slice(0, 2);
    };
    const avg = f => { const xs = reviews.map(f).filter(x => x != null); return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null; };
    const prof = {
      etrata: avg(x => x.rv.stats.etrataTurn), lost: avg(x => x.rv.stats.etrataLost), cloaks: avg(x => x.rv.stats.cloaks), spells: avg(x => x.rv.stats.spells),
      land: avg(x => x.rv.flags.filter(f => f.id === "land").length), float: avg(x => x.rv.flags.filter(f => f.id === "float").length),
      ctr: reviews.reduce((a, x) => a + x.rv.flags.filter(f => f.id === "nocounter").length, 0), waste: reviews.reduce((a, x) => a + x.rv.flags.filter(f => f.id === "wastecounter").length, 0),
      missed: reviews.reduce((a, x) => a + x.rv.flags.filter(f => f.id === "missedwin").length, 0),
      thinkKey: avg(x => { const ms = x.g.moments.filter(m => (m.stage === "Go off" || m.urgent) && m.ms != null && !m.replayed); return ms.length ? ms.reduce((a, m) => a + m.ms, 0) / ms.length / 1000 : null; }),
      thinkAll: avg(x => { const ms = x.g.moments.filter(m => m.ms != null && !m.replayed && m.k === "main"); return ms.length ? ms.reduce((a, m) => a + m.ms, 0) / ms.length / 1000 : null; }),
      wins: p.gs.filter(g => g.result && g.result.win).length, rounds: avg(x => x.g.result && x.g.result.rounds)
    };
    const accs = p.gs.map(g => accuracyOf(g, ans[g.id])).filter(x => x != null);
    const journal = p.ts.journal || [];
    const PLAN = {
      mull: ["Mulligan Lab until Silver (80%).", "Before each keep, name the turn Etrata comes down and the line you're digging for."],
      tempo: ["Every turn: land, then rocks, then Etrata. Check the land drop before you pass.", "Clock Math for the costs, and play two assessment games watching only your mana."],
      lines: ["Line Spotter until you answer in under 8 seconds.", "Puzzles: Court is in session, Crank the whole table, Ramses' contract.", "In games, open the Plan in your head at the start of each of your turns: what's live, what's one card away."],
      tutor: ["Tutor Target until Silver.", "Rule: tutor for the piece you can cast this turn; a stronger card next turn is worth less."],
      etrata: ["Puzzles: Three cloaks, Nobody untaps, Their wipe, your turn.", "Look at your face-down cards at the start of every turn: a stolen spell is a free cast."],
      stack: ["Stack Sentinel until Gold.", "Counters are for wipes, removal on your pieces and winning spells. Say which before you pass priority."],
      combat: ["Threat Read until Silver.", "Keep Etrata home unless no blocker can kill her; she's your engine."],
      rules: ["Clock Math and the Quiz's rules topic until box 3.", "Puzzles: Milling isn't losing life, The third hit."]
    };
    el.innerHTML = `<div class="tn-report">
      ${p.unlocked ? "" : `<p class="tn-peek">A preview: the analysis isn't unlocked yet, so some skills have little data.</p>`}
      <div class="tn-rephead panel">
        <div class="tn-big"><b>${overall != null ? overall : "–"}</b><span>overall, out of 100</span></div>
        <div class="tn-kpis">
          <div><b>${p.gs.length}</b><span>assessment games</span></div>
          <div><b>${p.gs.length ? Math.round(100 * prof.wins / p.gs.length) + "%" : "–"}</b><span>won (25% is par at a 4-player table)</span></div>
          <div><b>${accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) + "%" : "–"}</b><span>replay accuracy</span></div>
          <div><b>${Math.round(p.ts.prating || 1200)}</b><span>puzzle rating</span></div>
        </div>
      </div>
      <section class="tn-sec tn-skills"><h3>Your eight skills</h3>
        <div class="tn-skgrid">${radar(S)}
          <ul class="tn-sklist">${Object.keys(SKILL_NAME).map(k => `<li><span>${esc(SKILL_NAME[k])}</span><span class="tn-bar"><i style="--w:${S[k].conf > 0.5 ? S[k].score : 0}%"></i></span><b class="mono">${S[k].conf > 0.5 ? S[k].score : "–"}</b></li>`).join("")}</ul>
        </div>
        <p class="muted small">Each score blends your drills, puzzles, quiz, the review rules over your games and the replayed moments, weighted by how much evidence each gives. Few data points pull toward 60.</p>
      </section>
      <section class="tn-sec"><h3>Your biggest leaks</h3>
        ${leaks.length ? "" : `<p class="muted">Nothing to go on yet: do a drill or play an assessment game.</p>`}
        ${leaks.map(k => `<article class="tn-leak panel"><div class="tn-lh"><b>${esc(SKILL_NAME[k])}</b><span class="mono">${S[k].score}</span></div>
          <p class="muted small">${S[k].src.slice(-4).map(s => esc(s.label)).join(" · ")}</p>
          ${examples(k).map(x => `<div class="tn-ex"><p><b>${esc(x.f.title)}</b> <span class="muted small">round ${x.f.r || "–"}, ${ago(x.g.t)}${x.r && x.r.loss != null ? ` · cost about ${Math.round(x.r.loss * 100)} points of win chance` : ""}</span></p><p>${cnText(esc(x.f.text))}</p><div class="btn-row"><button class="btn ghost small" type="button" data-goto="${esc(x.g.id)}">Open the game</button>${x.f.i != null && x.f.id !== "mull" ? `<button class="btn ghost small" type="button" data-retry="${esc(x.g.id)}|${x.f.i}">Retry that moment</button>` : ""}</div></div>`).join("") || `<p class="muted small">No flagged moment in your games for this one yet: the score comes from drills and puzzles.</p>`}
          <ul class="tn-plan">${PLAN[k].map(t => `<li>${esc(t)}</li>`).join("")}</ul>
        </article>`).join("")}
      </section>
      <section class="tn-sec"><h3>What you do well</h3>${strengths.length ? "" : `<p class="muted">Not enough data yet.</p>`}<div class="tn-strong">${strengths.map(k => `<div class="panel"><b>${esc(SKILL_NAME[k])}</b><span class="mono">${S[k].score}</span><p class="muted small">${S[k].src.slice(-3).map(s => esc(s.label)).join(" · ")}</p></div>`).join("")}</div></section>
      <section class="tn-sec"><h3>How you play this deck</h3>
        <div class="table-wrap"><table class="stack tn-prof"><thead><tr><th>Habit</th><th>You</th><th>Target</th></tr></thead><tbody>
          ${profRow("Etrata comes down on your turn", prof.etrata, x => "T" + x.toFixed(1), "T3 or sooner", x => x <= 3.2)}
          ${profRow("Etrata removed per game", prof.lost, x => x.toFixed(1), "under 1", x => x < 1)}
          ${profRow("Cards cloaked per game", prof.cloaks, x => x.toFixed(1), "2+", x => x >= 2)}
          ${profRow("Spells cast per game", prof.spells, x => x.toFixed(1), "12+", x => x >= 12)}
          ${profRow("Missed land drops per game", prof.land, x => x.toFixed(1), "0", x => x < 0.5)}
          ${profRow("Turns passed with 3+ unused mana", prof.float, x => x.toFixed(1), "under 1", x => x < 1)}
          <tr><td>Threats you didn't counter / counters spent on nothing</td><td class="mono">${reviews.length ? `${prof.ctr} / ${prof.waste}` : "–"}</td><td>0 / 0</td></tr>
          <tr><td>Live wins not taken</td><td class="mono ${reviews.length ? (prof.missed ? "bad" : "good") : ""}">${reviews.length ? prof.missed : "–"}</td><td>0</td></tr>
          ${profRow("Seconds on key moments (vs a normal play)", prof.thinkKey, x => x.toFixed(1) + (prof.thinkAll != null ? ` (vs ${prof.thinkAll.toFixed(1)})` : ""), "longer than a normal play", x => prof.thinkAll == null || x > prof.thinkAll)}
          ${profRow("Game length in rounds", prof.rounds, x => x.toFixed(1), "win by round 7-8", x => x <= 8)}
        </tbody></table></div>
      </section>
      ${journal.length ? journalReport(journal) : ""}
      ${accs.length > 1 ? `<section class="tn-sec"><h3>Accuracy by game</h3>${trend(accs.slice().reverse())}</section>` : ""}
      <section class="tn-sec"><h3>Your next five sessions</h3><ol class="tn-next5">${nextFive(leaks, PLAN).map(t => `<li>${esc(t)}</li>`).join("")}</ol></section>
    </div>`;
    el.onclick = e => {
      const g = e.target.closest("[data-goto]"); if (g) { location.hash = "train/games"; setTimeout(() => openReview(g.dataset.goto), 60); return; }
      const r = e.target.closest("[data-retry]"); if (r) { const [id, i] = r.dataset.retry.split("|"); const rec = games().find(x => x.id === id); if (rec) startRetry(rec, +i); }
    };
  }
  function profRow(label, v, fmt, target, good) {
    if (v == null) return `<tr><td>${esc(label)}</td><td class="mono">–</td><td>${esc(target)}</td></tr>`;
    return `<tr><td>${esc(label)}</td><td class="mono ${good(v) ? "good" : "bad"}">${esc(fmt(v))}</td><td>${esc(target)}</td></tr>`;
  }
  function journalReport(j) {
    const n = j.length, wins = j.filter(x => x.res === "win").length;
    const count = k => { const m = {}; for (const x of j) if (x[k]) m[x[k]] = (m[x[k]] || 0) + 1; return Object.entries(m).sort((a, b) => b[1] - a[1]); };
    const WHY = { speed: "someone was faster", interaction: "your combo got answered", removal: "Etrata kept dying", mana: "mana problems", flood: "flood or no action", target: "the table ganged up", misplay: "your own misplay" };
    const ets = j.filter(x => x.et).map(x => x.et), ends = j.filter(x => x.res === "win" && x.end).map(x => x.end);
    const why = count("why"), lines = count("line");
    return `<section class="tn-sec"><h3>At the real table</h3><div class="panel tn-paper">
      <p><b>${wins} of ${n}</b> paper games won${ets.length ? `, Etrata out on turn ${(ets.reduce((a, b) => a + b, 0) / ets.length).toFixed(1)} on average` : ""}${ends.length ? `, wins on turn ${(ends.reduce((a, b) => a + b, 0) / ends.length).toFixed(1)}` : ""}.</p>
      ${why.length ? `<p>What beats you most: <b>${esc(WHY[why[0][0]] || why[0][0])}</b> (${why[0][1]} of ${n})${why[1] ? `, then ${esc(WHY[why[1][0]] || why[1][0])} (${why[1][1]})` : ""}.</p>` : ""}
      ${lines.length ? `<p>Lines you go for: ${lines.map(([k, v]) => `${esc(k)} ${v}`).join(", ")}.</p>` : ""}
      ${why.length && why[0][0] === "interaction" ? `<p class="tn-principle"><span>From your table</span>Your combos get answered: wait a turn for a counter of your own, or bait their interaction with a lesser threat first. Stack Sentinel trains exactly this.</p>` : ""}
      ${why.length && why[0][0] === "removal" ? `<p class="tn-principle"><span>From your table</span>Etrata keeps dying: cast her when you can protect her or when the table is tapped out, and keep her home as a blocker.</p>` : ""}
      ${why.length && why[0][0] === "speed" ? `<p class="tn-principle"><span>From your table</span>The table is faster: mulligan harder for hands with a line, and keep a counter for their win.</p>` : ""}
      ${j.filter(x => x.note).slice(0, 3).map(x => `<p class="muted small">“${esc(x.note)}”</p>`).join("")}
    </div></section>`;
  }
  function trend(xs) {
    const W = 300, H = 70;
    const d = xs.map((v, i) => `${(10 + i / Math.max(1, xs.length - 1) * (W - 20)).toFixed(1)},${(H - 8 - v / 100 * (H - 16)).toFixed(1)}`).join(" ");
    return `<svg class="tn-trend" viewBox="0 0 ${W} ${H}" role="img" aria-label="Accuracy by game"><polyline points="${d}" fill="none" stroke="currentColor" stroke-width="2"/>${xs.map((v, i) => `<circle cx="${(10 + i / Math.max(1, xs.length - 1) * (W - 20)).toFixed(1)}" cy="${(H - 8 - v / 100 * (H - 16)).toFixed(1)}" r="3"><title>${v}%</title></circle>`).join("")}</svg>`;
  }
  function nextFive(leaks, PLAN) {
    const out = [];
    const d = k => DRILLS.find(x => x.skill === k);
    for (const k of leaks) { const dr = d(k); if (dr) out.push(`${dr.name}: one session, then read every explanation you got wrong.`); }
    out.push(`One assessment game. Before each of your turns, say which line is closest and what it costs.`);
    if (leaks[0]) out.push(PLAN[leaks[0]][1] || PLAN[leaks[0]][0]);
    out.push("Replay the key moments of your last game, then retry the worst one until you find the better line.");
    return out.slice(0, 5);
  }
})();
