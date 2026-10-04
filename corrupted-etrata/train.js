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
  const SK = { train: KEY + ".train.v1", games: KEY + ".games.v1", an: KEY + ".analysis.v2" };
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
        <p>No coach, no companion: every choice you make is recorded. When the game ends, the analysis engine replays every decision you made against the alternatives, hundreds of times, with the shuffles and the other players' hands dealt fresh each time, and tells you what each choice was worth, why, and how much of the result was luck.</p>
        <div class="seg small" role="radiogroup" aria-label="Opponents">${[["precon", "Casual decks"], ["mixed", "Mixed"], ["b4", "Bracket 4"]].map(([k, l]) => `<button role="radio" aria-checked="${pool === k}" data-pool="${k}">${l}</button>`).join("")}</div>
        <div class="btn-row"><button class="btn primary big" type="button" data-assess>Start an assessment game</button></div>
      </div>
      <section class="tn-glist">
        <h3>Your recorded games</h3>
        ${list.length ? list.map(g => {
          const res = g.result || {};
          const sm = (anStore()[g.id] || {}).sum;
          return `<button class="tn-gi" type="button" data-rec="${esc(g.id)}">
            <span class="tn-res ${res.win ? "w" : res.draw ? "d" : "l"}">${res.win ? "Won" : res.draw ? "Draw" : res.conceded ? "Conceded" : "Lost"}</span>
            <span class="tn-gm"><b>${g.mode === "retry" ? "Retry from a moment" : "Assessment"} · round ${res.rounds || "?"}</b><span class="muted small">vs ${g.seats.filter((s, i) => i !== g.hero).map(s => esc(s.name)).join(", ")} · ${ago(g.t)}</span></span>
            <span class="tn-acc mono">${sm && sm.accuracy != null ? Math.round(sm.accuracy) + "%" : "–"}<small>${sm ? "accuracy" : "not analyzed"}</small></span>
            ${sparkWP(g, sm)}
          </button>`;
        }).join("") : `<p class="muted">No games yet. Play an assessment game: it takes a normal game's time, and the analysis starts when it ends.</p>`}
        ${list.length ? `<div class="tn-export"><button class="btn ghost small" type="button" data-export>Export all games and analysis</button><span class="muted small">A JSON file with every game (seed, seats, each answer you gave and how long you took, the log), every analysis result, the models' versions and a replay check: everything needed to rerun and judge the analysis.</span></div>` : ""}
      </section>
      ${journalHTML(ts)}`;
    el.onclick = e => {
      const p = e.target.closest("[data-pool]"); if (p) { st.pool = p.dataset.pool; renderGames(el, st); return; }
      const a = e.target.closest("[data-assess]"); if (a) { a.disabled = true; a.textContent = "Loading…"; startAssessment(pool).then(() => { a.disabled = false; a.textContent = "Start an assessment game"; }).catch(err => { console.error(err); a.textContent = "Couldn't load the game"; }); return; }
      const g = e.target.closest("[data-rec]"); if (g) { openReview(g.dataset.rec); return; }
      const x = e.target.closest("[data-export]"); if (x) { x.disabled = true; x.textContent = "Checking replays…"; exportAll(f => { x.textContent = `Checking replays… ${Math.round(f * 100)}%`; }).then(() => { x.textContent = "Exported"; }).catch(err => { console.error(err); x.textContent = "Export failed: " + (err && err.message || err); }).finally(() => { setTimeout(() => { x.disabled = false; x.textContent = "Export all games and analysis"; }, 2500); }); return; }
      journalClick(e, el, st);
    };
    el.onsubmit = e => journalSubmit(e, el, st);
  }
  /* Everything the analysis saw and said, in one file: the raw saved data (every cetrataWiki key),
     the versions of the engine and models that produced it, and for each game a replay check (does
     replaying the seed with the recorded answers give the same game?) and an index of decisions with
     their grades. tools/sim/judge-export.js reruns the analysis on it. */
  async function exportAll(progress) {
    await engine();
    const MK = MKG(), An = MK.Analysis, P = MK.Practice;
    const raw = {};
    for (let k = 0; k < localStorage.length; k++) { const key = localStorage.key(k); if (key && key.startsWith(KEY + ".")) raw[key] = load(key, null); }
    const list = games(), store = anStore();
    const info = window.MikuApp && window.MikuApp.gameInfo;
    const out = {
      kind: "cetrata-analysis-export", format: 1, exportedAt: new Date().toISOString(), tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      site: { asset: info ? info.v : null, files: info ? info.files : null, url: location.href.replace(/#.*/, "") },
      engine: {
        analysis: An.VERSION, anchors: An.ANCHORS, valueModel: (MK.Value && MK.Value.getModel() || {}).meta || null,
        valueFeatures: MK.Value ? MK.Value.FEATURES : null, wpModel: TR() && TR().getWP ? TR().getWP() : null
      },
      device: { ua: navigator.userAgent, cores: navigator.hardwareConcurrency || null, workers: pool.size, lang: navigator.language },
      notes: "storage drops the oldest games' typical lines (deep.lines) when localStorage is full; moments[].ms is think time in ms; answers are relative to g.idBase",
      games: [], raw
    };
    for (let k = 0; k < list.length; k++) {
      const rec = list[k], an = store[rec.id] || null;
      const g0 = { id: rec.id, t: rec.t, when: new Date(rec.t).toISOString(), mode: rec.mode, result: rec.result, seats: rec.seats, deck: rec.deck, hero: rec.hero, seed: rec.seed, decisions: (rec.moments || []).filter(m => !m.replayed).length, answers: (rec.answers || []).length };
      // the replay check: the recorded answers on the same seed must give the same game
      try {
        const r = await P.replay(rec, { at: (rec.answers || []).length + 1 });
        const g = r.g, me = g && g.players[rec.hero];
        g0.replay = { diverged: r.diverged || null, error: r.error || null, branched: !!r.branched, rounds: g ? g.round : null, won: g ? g.winner === me : null, matches: !r.diverged && !r.error && !!g && (!rec.result || rec.result.conceded || ((g.winner === me) === !!rec.result.win)) };
      } catch (err) { g0.replay = { error: String(err && err.message || err) }; }
      if (an && an.sum) g0.decisionIndex = an.sum.rows.map(x => ({ i: x.i, round: x.r, kind: x.k, yours: x.ans, best: x.best, cls: x.cls, acc: x.acc, loss: x.loss, se: x.se, rel: x.rel, before: x.before, after: x.after, stakes: x.stakes, cat: x.cat, ms: x.ms, deep: x.deep }));
      g0.analysis = an;
      g0.analyzedWith = an ? { at: an.at ? new Date(an.at).toISOString() : null, model: an.model || null } : null;
      g0.rec = rec;
      out.games.push(g0);
      if (progress) progress((k + 1) / list.length);
    }
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `etrata-analysis-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-")}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return out;
  }
  function sparkWP(g, sm) {
    const pts = sm && sm.rows ? sm.rows.filter(x => x.before != null).map(x => x.before) : [];
    if (pts.length < 2) return `<svg class="tn-spark" viewBox="0 0 100 28" aria-hidden="true"></svg>`;
    const max = Math.max(0.3, ...pts);
    const d = pts.map((v, i) => `${(i / (pts.length - 1) * 100).toFixed(1)},${(26 - v / max * 24).toFixed(1)}`).join(" ");
    return `<svg class="tn-spark" viewBox="0 0 100 28" aria-hidden="true"><polyline points="${d}" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`;
  }

  /* ---------------------------------------------------------------- the analysis: workers and storage */
  // { [recId]: { v, quick: { [i]: r }, deep: { [i]: r }, sum } }
  function anStore() { return load(SK.an, {}); }
  function putAn(recId, f) {
    const all = anStore();
    const cur = all[recId] = all[recId] || { v: 2, quick: {}, deep: {} };
    f(cur);
    const ids = new Set(games().map(g => g.id));
    for (const k of Object.keys(all)) if (!ids.has(k)) delete all[k];
    // localStorage is small: drop the oldest games' typical lines, then whole analyses, until it fits
    let tries = 0;
    while (!save(SK.an, all) && tries++ < 20) {
      const victim = Object.keys(all).filter(k => k !== recId).find(k => all[k].deep && Object.values(all[k].deep).some(d => d.lines));
      if (victim) { for (const d of Object.values(all[victim].deep)) delete d.lines; continue; }
      const other = Object.keys(all).find(k => k !== recId);
      if (other) delete all[other]; else break;
    }
    return cur;
  }
  // only what a replay needs goes to a worker
  const slim = rec => ({ id: rec.id, v: rec.v, engine: rec.engine, deck: rec.deck, seed: rec.seed, seats: rec.seats, hero: rec.hero, maxTurns: rec.maxTurns, answers: rec.answers, kinds: rec.kinds });
  const pool = { workers: [], queue: [], started: null, size: 0, seq: 0, jobs: new Map() };
  function startPool() {
    if (pool.started) return pool.started;
    pool.started = engine().then(() => {
      const info = window.MikuApp && window.MikuApp.gameInfo;
      if (!info || typeof Worker === "undefined") return 0;
      const n = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
      const files = info.files.filter(f => !/game-ui/.test(f)).map(f => f.replace(/^game\//, "") + "?v=" + info.v);
      const made = [];
      for (let k = 0; k < n; k++) {
        made.push(new Promise(res => {
          let w;
          try { w = new Worker(info.base + "practice-worker.js?v=" + info.v); } catch (e) { res(null); return; }
          const slot = { w, busy: null };
          w.onmessage = e => {
            const m = e.data;
            if (m.type === "ready") { pool.workers.push(slot); res(slot); pump(); return; }
            const j = pool.jobs.get(m.id);
            if (!j) return;
            if (m.type === "progress" && j.progress) j.progress(m.f);
            if (m.type === "result") { pool.jobs.delete(m.id); slot.busy = null; j.done(m.r); pump(); }
          };
          w.onerror = () => { res(null); };
          w.postMessage({ type: "init", files });
          setTimeout(() => res(null), 20000);
        }));
      }
      return Promise.all(made).then(xs => (pool.size = xs.filter(Boolean).length));
    }).catch(() => 0);
    return pool.started;
  }
  function pump() {
    for (const slot of pool.workers) {
      if (slot.busy || !pool.queue.length) continue;
      const j = pool.queue.shift();
      slot.busy = j;
      pool.jobs.set(j.id, j);
      slot.w.postMessage({ type: j.type, id: j.id, rec: j.rec, i: j.i, opts: j.opts });
    }
  }
  /* One analysis job, in a worker when there is one, else on the page. */
  function job(type, rec, i, opts, progress) {
    return startPool().then(n => {
      if (!n) return MKG().Analysis[type](rec, i, Object.assign({}, opts, { onProgress: progress }));
      return new Promise(done => { pool.queue.push({ id: ++pool.seq, type, rec: slim(rec), i, opts, progress, done }); pump(); });
    });
  }
  const runs = new Map();   // recId -> { phase, done, total, t0 }
  /* The whole analysis of a game: the quick pass on every decision, then the deep pass on the ones
     that cost the most (and any the review rules flagged). Results are saved as they come. */
  function analyzeGame(rec, opts) {
    opts = opts || {};
    if (runs.has(rec.id)) return runs.get(rec.id).p;
    const run = { phase: "quick", done: 0, total: 0, t0: Date.now() };
    runs.set(rec.id, run);
    let last = 0;
    const tick = () => { const now = Date.now(); if (now - last > 400) { last = now; bus(); } };
    run.p = engine().then(async () => {
      const An = MKG().Analysis, T = TR();
      const ms = (rec.moments || []).filter(m => !m.replayed);
      let cur = anStore()[rec.id] || { quick: {}, deep: {} };
      const todo = ms.filter(m => !cur.quick || !cur.quick[m.i]);
      run.total = todo.length; run.done = 0;
      await Promise.all(todo.map(m => job("quick", rec, m.i, {}).then(r => {
        putAn(rec.id, a => { a.quick[m.i] = r; });
        run.done++; tick();
      })));
      cur = anStore()[rec.id];
      let sum = An.summarize(rec, cur.quick, cur.deep);
      // deep: the decisions that cost the most, plus flagged ones the quick pass couldn't judge
      let rv = null; try { rv = T.review(rec); } catch (e) { rv = null; }
      const flagged = rv ? rv.flags.filter(f => !f.info && f.i != null && f.id !== "mull").map(f => f.i) : [];
      const pick = [...new Set(sum.worst.slice(0, opts.deep || 5).concat(flagged.slice(0, 2)))].filter(i => !cur.deep[i]);
      run.phase = "deep"; run.total = pick.length; run.done = 0; run.frac = {};
      bus();
      await Promise.all(pick.map(i => job("deep", rec, i, { budget: 90 }, f => { run.frac[i] = f; tick(); }).then(r => {
        putAn(rec.id, a => { a.deep[i] = r; });
        run.done++; tick();
      })));
      cur = anStore()[rec.id];
      sum = An.summarize(rec, cur.quick, cur.deep);
      putAn(rec.id, a => { a.sum = sum; a.at = Date.now(); a.model = (MKG().Value && MKG().Value.getModel() || {}).meta || null; });
      runs.delete(rec.id);
      bus();
      return sum;
    }).catch(err => { console.error(err); runs.delete(rec.id); bus(); });
    return run.p;
  }
  function deepOne(rec, i) {
    const key = rec.id + ":" + i;
    if (runs.has(key)) return;
    const run = { phase: "one", i, frac: 0 };
    runs.set(key, run);
    bus();
    job("deep", rec, i, { budget: 120 }, f => { run.frac = f; }).then(r => {
      putAn(rec.id, a => { a.deep[i] = r; a.sum = MKG().Analysis.summarize(rec, a.quick, a.deep); });
      runs.delete(key); bus();
    });
  }

  /* ---------------------------------------------------------------- the review of one game */
  const CLASS = { best: ["Best", "c-best", "★"], good: ["Good", "c-good", "✓"], inaccuracy: ["Inaccuracy", "c-inacc", "?!"], mistake: ["Mistake", "c-mistake", "?"], blunder: ["Blunder", "c-blunder", "??"] };
  const KIND = { mulligan: "Mulligan", main: "Your play", attack: "Attack", block: "Blocks", respond: "Response", choose: "Choice" };
  const momentByI = (rec, i) => (rec.moments || []).find(m => m.i === i);
  function renderReview(el, st, rec) {
    const T = TR(), An = MKG() && MKG().Analysis;
    if (!T || !An) { el.innerHTML = `<p class="muted">Loading the analysis engine…</p>`; engine().then(() => bus()); return; }
    const store = anStore()[rec.id] || { quick: {}, deep: {} };
    const run = runs.get(rec.id);
    const moments = (rec.moments || []).filter(m => !m.replayed);
    const haveAll = moments.every(m => store.quick && store.quick[m.i]);
    if (!run && (!haveAll || !store.sum)) { analyzeGame(rec); return renderReview(el, st, rec); }
    const sum = store.sum && haveAll ? store.sum : An.summarize(rec, store.quick || {}, store.deep || {});
    st.rvd = st.rvd && st.rvd.id === rec.id ? st.rvd : { id: rec.id, rv: T.review(rec), open: null };
    const rv = st.rvd.rv;
    const res = rec.result || {};
    const opp = rec.seats.filter((s, i) => i !== rec.hero).map(s => s.name);
    const rowsBy = new Map(sum.rows.map(x => [x.i, x]));
    const deepIs = Object.keys(store.deep || {}).map(Number).filter(i => store.deep[i] && !store.deep[i].error)
      .sort((a, b) => ((rowsBy.get(b) || {}).rel || 0) - ((rowsBy.get(a) || {}).rel || 0));
    if (st.rvd.open == null && deepIs.length) st.rvd.open = deepIs[0];
    const prog = run ? (run.phase === "quick" ? { t: `Replaying your ${run.total} decisions against the alternatives…`, f: run.total ? run.done / run.total : 0 } : { t: `Looking deeper at the ${run.total} moments that cost the most…`, f: run.total ? (run.done + Object.values(run.frac || {}).reduce((a, b) => a + b, 0) - run.done) / run.total : 0 }) : null;
    el.innerHTML = `<div class="tn-review">
      <div class="tn-rvh"><button class="btn ghost small" type="button" data-close>All games</button><span class="muted small">${ago(rec.t)} · vs ${opp.map(esc).join(", ")}</span></div>
      ${prog ? `<div class="tn-progress panel"><span>${esc(prog.t)}</span><div class="sp-bar"><i style="--w:${(Math.min(1, Math.max(0, prog.f)) * 100).toFixed(0)}%"></i></div><span class="muted small">${pool.size ? `${pool.size} analysis worker${pool.size > 1 ? "s" : ""} in the background. You can leave this page; it carries on.` : "Running on this page."}</span></div>` : ""}
      <div class="tn-rvtop panel">
        <div class="tn-rvscore">
          <div class="tn-big"><b class="${res.win ? "w" : "l"}">${res.win ? "Won" : res.draw ? "Draw" : "Lost"}</b><span>round ${res.rounds || "?"}${res.killer ? ` · ${esc(res.killer)}` : ""}</span></div>
          <div class="tn-accbig"><b>${sum.accuracy != null ? Math.round(sum.accuracy) : "–"}</b><span>accuracy</span></div>
        </div>
        <div class="tn-counts">${["best", "good", "inaccuracy", "mistake", "blunder"].map(c => `<span class="tn-count ${CLASS[c][1]}"><b>${sum.counts[c] || 0}</b>${CLASS[c][0]}</span>`).join("")}</div>
        ${luckBar(sum, res)}
      </div>
      <section class="tn-sec"><h3>Your win chance, decision by decision</h3>${curveChart(rec, sum)}
        <p class="muted small">Each dot is one of your decisions, colored by its grade; the line is your chance of winning the game before it (a fair share at a four-player table is 25%). Drops between dots are the draws and the other players.</p></section>
      <section class="tn-sec"><h3>The moments that decided it</h3>
        ${deepIs.length ? `<div class="tn-moments">${deepIs.map(i => deepCard(rec, i, store.deep[i], rowsBy.get(i), st)).join("")}</div>` : `<p class="muted">${run ? "Coming up once the decisions are replayed." : "No decision stood out: well played."}</p>`}
      </section>
      ${sum.swings && sum.swings.length ? `<section class="tn-sec"><h3>What wasn't up to you</h3><div class="tn-swings">${sum.swings.slice(0, 4).map(s => swingHTML(rec, s)).join("")}</div></section>` : ""}
      ${breakdownHTML(sum)}
      ${rv.flags.length ? `<section class="tn-sec"><h3>Habits the review rules noticed</h3><div class="tn-flags">${rv.flags.map(f => `<div class="tn-flag sev${f.sev}${f.info ? " info" : ""}"><div class="tn-fh"><span class="tn-skill">${esc(SKILL_NAME[f.skill] || f.skill)}</span><b>${esc(f.title)}</b><span class="mono small">${f.r ? "round " + f.r : "opening"}</span></div><p>${cnText(esc(f.text))}</p><div class="tn-fa">${f.i != null && f.id !== "mull" ? `<button class="btn ghost small" type="button" data-retry="${f.i}">Retry from here</button>` : ""}${f.i != null && !(store.deep || {})[f.i] && f.id !== "mull" ? `<button class="btn ghost small" type="button" data-one="${f.i}">Analyze this moment</button>` : ""}</div></div>`).join("")}</div></section>` : ""}
      <section class="tn-sec"><details class="tn-timeline"${st.rvd.tl ? " open" : ""}><summary>Every decision (${moments.length})</summary>${timelineHTML(rec, sum, store)}</details></section>
    </div>`;
    el.onclick = e => {
      if (e.target.closest("[data-close]")) { reviewId = null; st.rvd = null; bus(); return; }
      const r = e.target.closest("[data-retry]"); if (r) { startRetry(rec, +r.dataset.retry); return; }
      const one = e.target.closest("[data-one]"); if (one) { deepOne(rec, +one.dataset.one); return; }
      const t = e.target.closest("[data-mopen]"); if (t) { st.rvd.open = st.rvd.open === +t.dataset.mopen ? -1 : +t.dataset.mopen; renderReview(el, st, rec); finish(el); return; }
      const tl = e.target.closest(".tn-timeline summary"); if (tl) st.rvd.tl = !st.rvd.tl;
    };
  }
  /* Start, what your decisions cost, what the rest did, the result. */
  function luckBar(sum, res) {
    if (sum.start == null) return "";
    const pts = x => (x >= 0 ? "+" : "−") + Math.abs(Math.round(x * 100));
    const skill = sum.skill, luck = sum.luck;
    const verdict = res.win ? (luck > Math.abs(skill) ? "You won, with the table's help." : "You won it.") : (Math.abs(skill) > Math.abs(luck) && skill < -0.05 ? "Your decisions cost you more than the luck did." : luck < -0.1 ? "The draws and the table went against you." : "A fair game that got away.");
    return `<div class="tn-luck">
      <div class="tn-lk"><span>Started at</span><b>${pct(sum.start)}</b></div>
      <div class="tn-lk ${skill < -0.005 ? "neg" : "zero"}"><span>Your decisions</span><b>${pts(skill)}</b></div>
      <div class="tn-lk ${luck < 0 ? "neg" : "pos"}"><span>Draws and the table</span><b>${pts(luck)}</b></div>
      <div class="tn-lk ${res.win ? "pos" : "neg"}"><span>Result</span><b>${res.win ? "100%" : "0%"}</b></div>
      <p class="muted small">${esc(verdict)} Points are percentage points of win chance: your decisions are what you gave up against the best option found; the rest is everything else.</p>
    </div>`;
  }
  function curveChart(rec, sum) {
    const pts = sum.rows.filter(x => x.before != null);
    if (pts.length < 2) return `<p class="muted">Not enough decisions to chart yet.</p>`;
    const W = 420, H = 190, pad = 26;
    const max = Math.min(1, Math.max(0.3, ...pts.map(x => x.before)) * 1.1);
    const X = k => pad + (k / (pts.length - 1)) * (W - pad * 2);
    const Y = v => H - pad - (v / max) * (H - pad * 2);
    const line = pts.map((x, k) => `${X(k).toFixed(1)},${Y(x.before).toFixed(1)}`).join(" ");
    const area = `${X(0)},${H - pad} ${line} ${X(pts.length - 1)},${H - pad}`;
    const rounds = [];
    pts.forEach((x, k) => { if (!k || x.r !== pts[k - 1].r) rounds.push({ k, r: x.r }); });
    const ticks = [0.1, 0.25, 0.5, 0.75, 1].filter(v => v < max);
    const col = { best: "c-best", good: "c-good", inaccuracy: "c-inacc", mistake: "c-mistake", blunder: "c-blunder" };
    return `<div class="tn-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Win chance by decision">
      ${ticks.map(v => `<line x1="${pad}" x2="${W - pad}" y1="${Y(v)}" y2="${Y(v)}" class="grid${v === 0.25 ? " fair" : ""}"/><text x="2" y="${Y(v) + 3}" class="lab">${Math.round(v * 100)}%</text>`).join("")}
      ${rounds.map(o => `<line x1="${X(o.k)}" x2="${X(o.k)}" y1="${pad - 6}" y2="${H - pad}" class="rnd"/><text x="${X(o.k) + 2}" y="${pad - 8}" class="lab">R${o.r}</text>`).join("")}
      <polygon points="${area}" class="area"/>
      <polyline points="${line}" class="ln"/>
      ${pts.map((x, k) => `<circle cx="${X(k).toFixed(1)}" cy="${Y(x.before).toFixed(1)}" r="${x.cls === "mistake" || x.cls === "blunder" ? 4.6 : x.cls === "inaccuracy" ? 3.6 : 2.4}" class="dot ${col[x.cls] || ""}"><title>Round ${x.r}: ${esc(x.ans || "")} (${CLASS[x.cls] ? CLASS[x.cls][0] : ""}, ${pct(x.before)})</title></circle>`).join("")}
    </svg></div>`;
  }
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
  const CAT_TIP = {
    mull: "Mulligans: count lands and a line, and ship hands that do nothing by turn 3.",
    tempo: "Mana and tempo: land first, rocks next, Etrata on curve; mana you don't spend is gone.",
    lines: "Seeing the win: check every turn which line is live and what it still needs.",
    tutor: "Tutoring: fetch what you can cast this turn, or what completes a line.",
    etrata: "Etrata: a face-down noncreature card is a free spell for four mana.",
    stack: "The stack: counters are for wipes, removal on your pieces and the spell that wins.",
    combat: "Combat: keep Etrata home unless no blocker can kill her; attack where your cloaks live.",
    rules: "Rules: read what the card actually lets you choose."
  };
  function deepCard(rec, i, d, row, st) {
    const m = momentByI(rec, i);
    if (!m || !d) return "";
    const g = MKG().Analysis.grade(d.loss, d.se, (d.cands[0] || {}).eq);
    const c = CLASS[g.cls];
    const open = st.rvd.open === i;
    const run = runs.get(rec.id + ":" + i);
    return `<article class="tn-mo${open ? " open" : ""}">
      <button class="tn-moh" type="button" data-mopen="${i}">
        <span class="tn-mr mono">R${m.r}</span>
        <span class="tn-mt"><b>${esc(KIND[m.k] || m.k)}: ${esc(m.ans || "")}</b><span class="muted small">${d.best && d.best !== d.mine ? `Best: ${esc(d.best)}` : "Your choice was the best found"}${g.rel >= 0.06 ? ` · gave up ${Math.round(g.rel * 100)}% of your chances` : ""}</span></span>
        <span class="tn-cls ${c[1]}">${c[2]} ${c[0]}</span>
      </button>
      ${open ? deepDetail(rec, m, d, row, g) : ""}
      ${run ? `<div class="sp-bar"><i style="--w:${Math.round((run.frac || 0) * 100)}%"></i></div>` : ""}
    </article>`;
  }
  function deepDetail(rec, m, d, row, g) {
    const hand = (m.hand || []).map(cn).join(", ");
    const bf = (m.bf || []).map(n => n.startsWith("↓") ? (n === "↓?" ? "a face-down card" : cn(n.slice(1)) + " <small>(face down)</small>") : cn(n)).join(", ");
    const best = d.cands[0];
    const verdict = d.mine && d.best !== d.mine
      ? (g.cls === "good" || g.cls === "best" ? `“${esc(d.best)}” scored a little higher, inside the noise: your choice was fine.` : `“${esc(d.best)}” keeps ${pct(best.eq)} win chance; “${esc(d.mine)}” keeps ${pct(best.eq - d.loss)}. That's ${Math.round(d.loss * 100)} points, ${Math.round(g.rel * 100)}% of your chances.`)
      : `Your choice was the best of the ${d.cands.length} options tried.`;
    const why = (d.why || []).map(w => `<li><span>${esc(w.text)}</span><b>${fmtFeat(w, w.a)}</b><span class="muted">vs</span><b>${fmtFeat(w, w.b)}</b></li>`).join("");
    const lines = d.lines && d.lines.best && d.lines.mine ? `<div class="tn-lines"><div><p class="tn-k">If you play ${esc(d.best)}</p>${logHTML(d.lines.best)}</div><div><p class="tn-k">What you did</p>${logHTML(d.lines.mine)}</div></div><p class="muted small">One playout of each from the same shuffle, picked as typical: the two differ about as much there as they do on average.</p>` : "";
    const tags = [row ? `<span class="tn-tag2">${esc(SKILL_NAME[row.cat] || row.cat)}</span>` : "", m.ms != null ? `<span class="tn-tag2">${m.ms < 2500 ? "decided in " + (m.ms / 1000).toFixed(1) + " s: a slip?" : "thought for " + (m.ms / 1000).toFixed(0) + " s"}</span>` : "", row && row.dir ? `<span class="tn-tag2">${row.dir === "passive" ? "too passive" : "too hasty"}</span>` : ""].join("");
    return `<div class="tn-mod">
      <p class="tn-verdict ${g.cls}">${verdict}</p>
      <div class="tn-tags">${tags}</div>
      <p><span class="tn-k">Hand</span>${hand || "empty"}</p>
      <p><span class="tn-k">Your board</span>${bf || "empty"}</p>
      <p><span class="tn-k">Table</span>${(m.opp || []).filter(o => !o.lost).map(o => `${esc(o.n)} ${o.life} life, ${o.cr} creature${o.cr === 1 ? "" : "s"} (${o.pw} power), ${o.open} open`).join(" · ")}</p>
      ${situation(m) ? `<p><span class="tn-k">Situation</span>${situation(m)}</p>` : ""}
      <div class="table-wrap"><table class="stack tn-cands"><thead><tr><th>Option</th><th>Win chance</th><th>vs best</th><th>Playouts</th></tr></thead><tbody>${d.cands.map(c => `<tr class="${c.tags.includes("you") ? "you" : ""}${c === best ? " best" : ""}${c.pruned ? " pruned" : ""}"><td>${esc(c.label)}${c.tags.includes("you") ? " <span class='tn-tag'>you</span>" : ""}${c.tags.includes("bot") ? " <span class='tn-tag b'>engine</span>" : ""}</td><td class="mono">${pct(c.eq)}</td><td class="mono">${c === best ? "best" : "−" + (c.loss * 100).toFixed(1) + (c.se ? ` ±${(c.se * 200).toFixed(1)}` : "")}</td><td class="mono">${c.n}${c.pruned ? " <span class='muted'>(dropped)</span>" : ""}</td></tr>`).join("")}</tbody></table></div>
      <p class="muted small">${d.spent} playouts, ${d.horizon} rounds deep, every library reshuffled and every opponent's hand dealt fresh from the cards you couldn't see. Options that fell clearly behind were dropped early so the close ones got more playouts. ± is two standard errors.</p>
      ${why ? `<div class="tn-why"><p class="tn-k">What the better option changes${d.whyVs ? ` (against ${esc(d.whyVs)})` : ""}</p><ul>${why}</ul></div>` : ""}
      ${lines}
      ${row && CAT_TIP[row.cat] && (g.cls === "mistake" || g.cls === "blunder" || g.cls === "inaccuracy") ? `<p class="tn-principle"><span>Principle</span>${esc(CAT_TIP[row.cat])}</p>` : ""}
      <div class="btn-row"><button class="btn small" type="button" data-retry="${m.i}">Retry from here</button></div>
    </div>`;
  }
  function fmtFeat(w, v) {
    if (w.unit === "%") return Math.round(v * 100) + "%";
    if (w.unit === "x") return v.toFixed(2) + "×";
    return (Math.round(v * 10) / 10).toString();
  }
  function logHTML(o) {
    const lines = (o.log || []).filter(l => l.k !== "mana").slice(0, 14);
    return `<ol class="tn-log">${lines.map(l => `<li class="${l.me ? "me" : ""}${l.k === "turn" ? " turn" : ""}">${esc(l.t)}</li>`).join("")}</ol><p class="muted small">Ended at ${pct(o.eq)}${o.won ? " (won)" : o.lost ? " (dead)" : ""}.</p>`;
  }
  function swingHTML(rec, s) {
    const a = momentByI(rec, s.from), b = momentByI(rec, s.to);
    const t0 = a ? a.t : 0, t1 = b ? b.t : 999;
    const log = (rec.log || []).filter(e => e[3] != null && e[3] >= t0 && e[3] <= t1 && e[1] !== rec.hero && e[0] !== "turn").slice(-5);
    return `<div class="tn-swing ${s.dv < 0 ? "neg" : "pos"}"><b>${s.dv < 0 ? "−" : "+"}${Math.abs(Math.round(s.dv * 100))} pts</b><span>round ${s.r}</span>${log.length ? `<ul>${log.map(e => `<li>${esc(e[2])}</li>`).join("")}</ul>` : `<p class="muted small">Between two of your decisions: draws and the other players.</p>`}</div>`;
  }
  function breakdownHTML(sum) {
    const tbl = (title, g, names) => {
      const keys = Object.keys(g).filter(k => g[k].n);
      if (!keys.length) return "";
      return `<div class="tn-bd"><p class="tn-k">${title}</p>${keys.map(k => `<div class="tn-bdr"><span>${esc(names[k] || k)}</span><span class="tn-bar"><i style="--w:${g[k].acc}%"></i></span><b class="mono">${Math.round(g[k].acc)}</b><span class="muted small">${g[k].n}</span></div>`).join("")}</div>`;
    };
    return `<section class="tn-sec"><h3>Where your accuracy went</h3><div class="tn-bds">
      ${tbl("By phase", sum.byPhase, { early: "Rounds 1-3", middle: "Rounds 4-6", late: "Round 7+" })}
      ${tbl("By skill", sum.byCat, SKILL_NAME)}
      ${tbl("By time taken", sum.bySpeed, { fast: "Under 2.5 s", normal: "2.5-10 s", slow: "Over 10 s", "?": "Unknown" })}
    </div>${sum.dirs.passive || sum.dirs.rushed ? `<p class="small">Mistakes from passing when acting was better: <b>${sum.dirs.passive}</b>. From acting when holding back was better: <b>${sum.dirs.rushed}</b>.</p>` : ""}</section>`;
  }
  function timelineHTML(rec, sum, store) {
    let out = "", lastR = -1;
    for (const x of sum.rows) {
      if (x.r !== lastR) { out += `<h4>Round ${x.r}</h4>`; lastR = x.r; }
      const c = CLASS[x.cls];
      out += `<div class="tn-tl${x.cls === "mistake" || x.cls === "blunder" ? " flag" : ""}"><span class="mono">${esc(KIND[x.k] || x.k)}</span><span>${esc(x.ans || "")}${x.best && x.best !== x.ans && x.adj > 0 ? ` <span class="muted small">· better: ${esc(x.best)}</span>` : ""}</span>${c ? `<span class="tn-cls ${c[1]}">${c[2]}</span>` : ""}<span class="mono small">${x.before != null ? pct(x.before) : ""}</span></div>`;
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
    // recorded games: the review rules' evidence and every graded decision
    const ans = anStore();
    for (const g of p.gs) {
      let rv = null;
      try { rv = T ? T.review(g) : null; } catch (e) { rv = null; }
      if (rv) for (const k of Object.keys(rv.ev)) { const e = rv.ev[k]; if (e.n) add(k, e.ok / e.n, e.n * 0.8, `Game ${ago(g.t)}: ${Math.round(e.ok * 10) / 10}/${Math.round(e.n * 10) / 10}`); }
      const sm = (ans[g.id] || {}).sum;
      if (!sm) continue;
      const byCat = {};
      for (const x of sm.rows) { const b = byCat[x.cat] = byCat[x.cat] || { n: 0, s: 0, w: 0 }; const w = x.deep ? 2 : 0.7; b.n++; b.s += x.acc / 100 * w; b.w += w; }
      for (const k of Object.keys(byCat)) add(k, byCat[k].s / byCat[k].w, byCat[k].w, `Game ${ago(g.t)}: ${byCat[k].n} decision${byCat[k].n > 1 ? "s" : ""} graded`);
    }
    for (const k of Object.keys(S)) {
      const s = S[k];
      // a weak prior at 60 so one data point can't say 0 or 100
      s.score = Math.round(100 * (s.x + 0.6 * 1.5) / (s.w + 1.5));
      s.conf = s.w;
    }
    return S;
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
    const ans = anStore();
    const examples = k => {
      const out = [];
      for (const { g, rv } of reviews) {
        const sm = (ans[g.id] || {}).sum, rows = sm ? new Map(sm.rows.map(x => [x.i, x])) : new Map();
        for (const f of rv.flags.filter(f => f.skill === k && !f.info)) out.push({ g, f, r: rows.get(f.i) });
      }
      return out.sort((a, b) => (b.r && b.r.rel || 0) - (a.r && a.r.rel || 0) || b.f.sev - a.f.sev).slice(0, 2);
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
    const G = gameStats(p.gs, ans);
    const accs = G.accs;
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
      ${engineHTML(G)}
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
          ${examples(k).map(x => `<div class="tn-ex"><p><b>${esc(x.f.title)}</b> <span class="muted small">round ${x.f.r || "–"}, ${ago(x.g.t)}${x.r && x.r.rel >= 0.06 ? ` · gave up ${Math.round(x.r.rel * 100)}% of your chances` : ""}</span></p><p>${cnText(esc(x.f.text))}</p><div class="btn-row"><button class="btn ghost small" type="button" data-goto="${esc(x.g.id)}">Open the game</button>${x.f.i != null && x.f.id !== "mull" ? `<button class="btn ghost small" type="button" data-retry="${esc(x.g.id)}|${x.f.i}">Retry that moment</button>` : ""}</div></div>`).join("") || `<p class="muted small">No flagged moment in your games for this one yet: the score comes from drills and puzzles.</p>`}
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
      if (e.target.closest("[data-analyze-all]")) { p.gs.filter(g => !(anStore()[g.id] || {}).sum).reduce((pr, g) => pr.then(() => analyzeGame(g)), Promise.resolve()); bus(); return; }
      const g = e.target.closest("[data-goto]"); if (g) { location.hash = "train/games"; setTimeout(() => openReview(g.dataset.goto), 60); return; }
      const r = e.target.closest("[data-retry]"); if (r) { const [id, i] = r.dataset.retry.split("|"); const rec = games().find(x => x.id === id); if (rec) startRetry(rec, +i); }
    };
  }
  /* ---------------------------------------------------------------- the engine's verdict over all games */
  // situations a leak can hide in, read from each decision's snapshot
  const LEAKS = [
    { id: "live", t: "when a win line was live", f: m => !!(m.lines || []).some(l => l.w === "now") },
    { id: "close", t: "when a line was one turn away", f: m => !(m.lines || []).some(l => l.w === "now") && (m.lines || []).some(l => l.w === "next") },
    { id: "noet", t: "while Etrata was off the battlefield", f: m => m.k !== "mulligan" && m.etrata === false },
    { id: "et", t: "with Etrata on the battlefield", f: m => m.etrata === true },
    { id: "tutor", t: "with a tutor in hand", f: m => (m.hand || []).some(n => /Tutor|Seal of|Demonic|Vampiric|Imperial|Lim-D|Beseech|Wishclaw|Intuition/.test(n)) },
    { id: "ctr", t: "holding a counterspell", f: m => (m.ctrs || []).length > 0 },
    { id: "stack", t: "with a spell on the stack", f: m => m.k === "respond" },
    { id: "attack", t: "in combat", f: m => m.k === "attack" || m.k === "block" },
    { id: "late", t: "from round 6 on", f: m => m.r >= 6 },
    { id: "early", t: "in rounds 1 to 3", f: m => m.r <= 3 && m.k !== "mulligan" },
    { id: "rich", t: "with 5 or more mana", f: m => m.mana >= 5 },
    { id: "poor", t: "with 2 mana or less", f: m => m.mana != null && m.mana <= 2 && m.k === "main" },
    { id: "urgent", t: "when a threat needed an answer", f: m => !!m.urgent },
    { id: "fast", t: "when you decided in under 2.5 seconds", f: m => m.ms != null && m.ms < 2500 },
    { id: "slow", t: "after thinking more than 15 seconds", f: m => m.ms != null && m.ms > 15000 }
  ];
  function gameStats(gs, ans) {
    const sums = gs.map(g => ({ g, sm: (ans[g.id] || {}).sum })).filter(x => x.sm && x.sm.rows && x.sm.rows.length);
    const rows = [];
    for (const { g, sm } of sums) for (const x of sm.rows) rows.push({ x, m: momentByI(g, x.i) || {}, g });
    const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
    const n = sums.length;
    const out = { n, missing: gs.length - n, rows: rows.length, accs: sums.map(s => s.sm.accuracy).filter(x => x != null) };
    if (!n) return out;
    out.acc = mean(out.accs);
    out.skill = mean(sums.map(s => s.sm.skill));
    out.luck = mean(sums.map(s => s.sm.luck).filter(x => x != null));
    out.start = mean(sums.map(s => s.sm.start).filter(x => x != null));
    out.wins = sums.filter(s => s.g.result && s.g.result.win).length;
    const anch = (MKG() && MKG().Analysis && MKG().Analysis.ANCHORS) || { random: 83, bot: 98.6 };
    out.anch = anch;
    out.strength = Math.round(100 * (out.acc - anch.random) / Math.max(1, anch.bot - anch.random));
    // points of win chance lost per game, by skill
    const cats = {};
    for (const { x } of rows) { const c = cats[x.cat] = cats[x.cat] || { n: 0, lost: 0, rel: 0, errs: 0 }; c.n++; c.lost += x.adj; c.rel += x.rel; if (x.rel >= 0.15) c.errs++; }
    out.cats = Object.keys(cats).map(k => ({ k, n: cats[k].n, perGame: cats[k].lost / n * 100, rel: cats[k].rel / cats[k].n, errs: cats[k].errs })).sort((a, b) => b.perGame - a.perGame);
    const errs = rows.filter(r => r.x.rel >= 0.15);
    out.errs = errs.length;
    out.slips = errs.filter(r => r.x.err === "slip").length;
    out.passive = errs.filter(r => r.x.dir === "passive").length;
    out.rushed = errs.filter(r => r.x.dir === "rushed").length;
    const sp = k => { const xs = rows.filter(r => r.x.speed === k); return xs.length ? { n: xs.length, acc: mean(xs.map(r => r.x.acc)) } : null; };
    out.speed = { fast: sp("fast"), normal: sp("normal"), slow: sp("slow") };
    const ph = k => { const xs = rows.filter(r => r.x.phase === k); return xs.length ? { n: xs.length, acc: mean(xs.map(r => r.x.acc)) } : null; };
    out.phase = { early: ph("early"), middle: ph("middle"), late: ph("late") };
    // the leak finder: situations where your share of chances given up is well above your average
    const avgRel = mean(rows.map(r => r.x.rel)) || 0;
    out.avgRel = avgRel;
    out.leaks = LEAKS.map(L => {
      const inn = rows.filter(r => { try { return L.f(r.m); } catch (e) { return false; } });
      if (inn.length < 4) return null;
      const rel = mean(inn.map(r => r.x.rel)), acc = mean(inn.map(r => r.x.acc));
      const worst = inn.slice().sort((a, b) => b.x.rel - a.x.rel)[0];
      return { id: L.id, t: L.t, n: inn.length, rel, acc, lift: avgRel > 0.002 ? rel / avgRel : 1, worst };
    }).filter(Boolean).filter(l => l.lift >= 1.4 && l.rel >= 0.04).sort((a, b) => b.lift * Math.sqrt(b.n) - a.lift * Math.sqrt(a.n)).slice(0, 4);
    // your own mistakes, as a drill: replay each one from the moment it happened
    out.mine = errs.sort((a, b) => b.x.rel - a.x.rel).slice(0, 8);
    return out;
  }
  function engineHTML(G) {
    if (!G.n) return `<section class="tn-sec"><h3>What the analysis engine sees</h3><p class="muted">${G.missing ? `${G.missing} game${G.missing > 1 ? "s are" : " is"} waiting to be analyzed.` : "Play an assessment game first."}</p>${G.missing ? `<button class="btn primary small" type="button" data-analyze-all>Analyze my games</button>` : ""}</section>`;
    const pp = x => (x >= 0 ? "+" : "−") + Math.abs(x * 100).toFixed(0);
    const bar = (v, max) => `<span class="tn-bar"><i style="--w:${Math.max(2, Math.min(100, v / max * 100)).toFixed(0)}%"></i></span>`;
    const maxCat = Math.max(1, ...G.cats.map(c => c.perGame));
    const sp = G.speed, ph = G.phase;
    const strengthTxt = G.strength >= 100 ? "as accurate as the engine's own bot, or better" : G.strength >= 70 ? "close to the engine's bot" : G.strength >= 40 ? "halfway between random play and the engine's bot" : G.strength >= 15 ? "learning the deck: clearly better than random, far from the bot" : "close to random play: the basics first";
    const tips = [];
    if (G.errs >= 3 && G.slips / G.errs >= 0.5) tips.push("More than half of your real mistakes came in under 2.5 seconds: they are slips, not gaps in knowledge. Take a breath on every decision that spends a card.");
    if (G.errs >= 3 && G.slips / G.errs < 0.25) tips.push("Your real mistakes come after thinking: these are judgment calls. The drills and puzzles for the skills below train exactly that.");
    if (G.passive >= 2 && G.passive > G.rushed * 2) tips.push(`You lose most by doing too little: ${G.passive} of your mistakes were passing when acting was better. When in doubt, use your mana.`);
    if (G.rushed >= 2 && G.rushed > G.passive * 2) tips.push(`You lose most by acting too soon: ${G.rushed} of your mistakes were acting when holding back was better. Ask what the table can do in response first.`);
    if (sp.fast && sp.slow && sp.fast.n >= 4 && sp.slow.n >= 4 && sp.slow.acc - sp.fast.acc >= 8) tips.push(`You're ${Math.round(sp.slow.acc - sp.fast.acc)} points more accurate when you take your time: slow down.`);
    if (ph.late && ph.early && ph.late.n >= 4 && ph.early.acc - ph.late.acc >= 8) tips.push("Your accuracy drops in the late game, where the table is complex and every choice matters most: count the lines before each turn.");
    return `<section class="tn-sec tn-engine"><h3>What the analysis engine sees</h3>
      <div class="tn-engtop">
        <div class="tn-strength"><div class="tn-sscale"><span class="tn-smark r" style="--x:0%">random</span><span class="tn-smark b" style="--x:100%">bot</span><i style="--x:${Math.max(0, Math.min(108, G.strength))}%"></i></div><p><b>${G.strength}</b> on a scale where random clicks score 0 and the engine's bot 100: ${esc(strengthTxt)}.</p></div>
        <div class="tn-kpis">
          <div><b>${Math.round(G.acc)}%</b><span>accuracy over ${G.n} game${G.n > 1 ? "s" : ""} (${G.rows} decisions)</span></div>
          <div><b>${pp(G.skill)}</b><span>win chance your decisions cost per game</span></div>
          <div><b>${pp(G.luck)}</b><span>luck and the table, per game</span></div>
          <div><b>${G.errs}</b><span>real mistakes (${G.slips} slips, ${G.errs - G.slips} judgment)</span></div>
        </div>
      </div>
      ${G.missing ? `<p class="muted small">${G.missing} more game${G.missing > 1 ? "s" : ""} not analyzed yet. <button class="btn ghost small" type="button" data-analyze-all>Analyze ${G.missing > 1 ? "them" : "it"}</button></p>` : ""}
      ${tips.length ? `<div class="tn-tips">${tips.map(t => `<p class="tn-principle"><span>Pattern</span>${esc(t)}</p>`).join("")}</div>` : ""}
      <div class="tn-bds">
        <div class="tn-bd"><p class="tn-k">Win chance lost per game, by skill</p>${G.cats.map(c => `<div class="tn-bdr"><span>${esc(SKILL_NAME[c.k] || c.k)}</span>${bar(c.perGame, maxCat)}<b class="mono">${c.perGame.toFixed(1)}</b><span class="muted small">${c.n}</span></div>`).join("")}<p class="muted small">Points of win chance per game; the small number is decisions.</p></div>
        <div class="tn-bd"><p class="tn-k">Accuracy by time taken</p>${[["fast", "Under 2.5 s"], ["normal", "2.5-10 s"], ["slow", "Over 10 s"]].filter(([k]) => sp[k]).map(([k, l]) => `<div class="tn-bdr"><span>${l}</span>${bar(sp[k].acc, 100)}<b class="mono">${Math.round(sp[k].acc)}</b><span class="muted small">${sp[k].n}</span></div>`).join("")}
          <p class="tn-k">By phase</p>${[["early", "Rounds 1-3"], ["middle", "Rounds 4-6"], ["late", "Round 7+"]].filter(([k]) => ph[k]).map(([k, l]) => `<div class="tn-bdr"><span>${l}</span>${bar(ph[k].acc, 100)}<b class="mono">${Math.round(ph[k].acc)}</b><span class="muted small">${ph[k].n}</span></div>`).join("")}</div>
      </div>
      <h4>Where your leaks hide</h4>
      ${G.leaks.length ? `<div class="tn-leakfind">${G.leaks.map(l => `<div class="tn-lf panel"><p><b>${esc(l.t[0].toUpperCase() + l.t.slice(1))}</b>, you give up <b>${(l.lift).toFixed(1)}×</b> as much as usual <span class="muted small">(${l.n} decisions, accuracy ${Math.round(l.acc)})</span></p>${l.worst ? `<p class="muted small">Worst: round ${l.worst.x.r}, ${esc(l.worst.x.ans || "")}${l.worst.x.best && l.worst.x.best !== l.worst.x.ans ? `, where ${esc(l.worst.x.best)} was better` : ""}.</p><div class="btn-row"><button class="btn ghost small" type="button" data-goto="${esc(l.worst.g.id)}">Open the game</button>${l.worst.x.k !== "mulligan" ? `<button class="btn ghost small" type="button" data-retry="${esc(l.worst.g.id)}|${l.worst.x.i}">Retry it</button>` : ""}</div>` : ""}</div>`).join("")}</div>` : `<p class="muted small">${G.rows < 40 ? "The leak finder compares your decisions across situations; it needs a few more games to tell a pattern from chance." : "No situation stands out: your mistakes are spread evenly."}</p>`}
      ${G.mine.length ? `<h4>Your own mistakes, as a drill</h4><p class="muted small">The decisions where you gave up the largest share of your chances. Retry each from the exact moment until you find the better play.</p><ol class="tn-mine">${G.mine.map(r => `<li><span class="mono">R${r.x.r}</span><span>${esc(r.x.ans || "")}${r.x.best && r.x.best !== r.x.ans ? ` <span class="muted small">· better: ${esc(r.x.best)}</span>` : ""}</span><span class="tn-cls ${CLASS[r.x.cls][1]}">${Math.round(r.x.rel * 100)}%</span>${r.x.k !== "mulligan" ? `<button class="btn ghost small" type="button" data-retry="${esc(r.g.id)}|${r.x.i}">Retry</button>` : `<button class="btn ghost small" type="button" data-goto="${esc(r.g.id)}">Open</button>`}</li>`).join("")}</ol>` : ""}
    </section>`;
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
