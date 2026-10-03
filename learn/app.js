/* Learn Magic: router, lesson player, quizzes and progress. Content is in lessons.js, the
   interactive pieces in widgets.js. Progress stays in this browser only (localStorage). */
(function () {
  "use strict";
  const L = window.LEARN, W = window.LW = window.LW || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const KEY = "learnMagic.v1";

  /* ---------- helpers shared with widgets.js ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const SYM = { W: "☀", U: "💧", B: "💀", R: "🔥", G: "🌳", C: "◇", T: "↷" };
  const NAMES = { W: "white", U: "blue", B: "black", R: "red", G: "green", C: "colorless", T: "tap" };
  function pip(s, cls) {
    const k = /^\d+$|^X$/.test(s) ? "N" : s;
    const label = k === "N" ? s + " mana of any color" : NAMES[s] + (s === "T" ? "" : " mana");
    return `<span class="pip ${k === "N" ? "" : s} ${cls || ""}" role="img" aria-label="${label}" title="${label}">${k === "N" ? s : SYM[s]}</span>`;
  }
  // "{2}{G}" -> pip spans. Also used on all lesson text, so {G} in content becomes a symbol.
  const pips = (str, cls) => String(str).replace(/\{([0-9]+|[WUBRGCTX])\}/g, (m, s) => pip(s, cls));
  const fmt = html => pips(html);
  const parseCost = str => (String(str).match(/\{([0-9]+|[WUBRGCX])\}/g) || []).map(t => t.slice(1, -1));

  function card(c, opts) {
    if (typeof c === "string") c = L.cards[c];
    opts = opts || {};
    const tag = opts.button ? "button" : "div";
    const cls = ["mcard", c.c, opts.sm ? "sm" : "", c.makes && !c.pt ? "land" : "", opts.cls || ""].join(" ");
    const pt = c.pt ? `<span class="pt">${c.pt[0]}/${c.pt[1]}</span>` : "";
    const data = opts.data ? Object.entries(opts.data).map(([k, v]) => ` data-${k}="${esc(v)}"`).join("") : "";
    return `<${tag} class="${cls}"${tag === "button" ? ' type="button"' : ""}${data} aria-label="${esc(c.name)}">
      <div class="in">
        <div class="bar1"><span class="nm">${esc(c.name)}</span><span class="cost">${pips(c.cost || "")}</span></div>
        <div class="art" aria-hidden="true">${c.art || ""}</div>
        <div class="tl">${esc(c.type)}</div>
        <div class="tx">${fmt(c.text || "")}${c.flavor ? `<br><i>${esc(c.flavor)}</i>` : ""}</div>
      </div>${pt}</${tag}>`;
  }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  // One multiple-choice question. Wrong answers explain themselves and stay tappable until the
  // right one is found, so nobody gets stuck: the lesson only moves on once the idea landed.
  function quiz(el, q, onAnswer) {
    const opts = q.keep ? q.options.slice() : shuffle(q.options);
    el.classList.add("quiz");
    el.innerHTML = `<div class="q">${fmt(q.q)}</div>${q.cards ? `<div class="cards">${q.cards.map(c => card(c, { sm: true })).join("")}</div>` : ""}<div class="opts"></div><div class="why" hidden></div>`;
    const box = $(".opts", el), why = $(".why", el);
    let tries = 0, solved = false;
    opts.forEach(o => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.innerHTML = fmt(o.t);
      b.onclick = () => {
        if (solved) return;
        tries++;
        why.hidden = false;
        if (o.ok) {
          solved = true;
          b.classList.add("right");
          box.querySelectorAll(".opt").forEach(x => x.disabled = true);
          why.className = "why good";
          why.innerHTML = `<b>${tries === 1 ? pickOne(["Yes! 🎉", "Exactly right ✨", "Nailed it 👏", "Correct 💚"]) : "That's it 👍"}</b>${fmt(o.why || q.why || "")}`;
        } else {
          b.classList.add("wrong"); b.disabled = true;
          why.className = "why bad";
          why.innerHTML = `<b>Not quite, and that's fine.</b>${fmt(o.why || "Have another look and try a different answer.")}`;
        }
        if (onAnswer) onAnswer(!!o.ok, tries);
      };
      box.appendChild(b);
    });
  }
  const pickOne = a => a[Math.floor(Math.random() * a.length)];

  Object.assign(W, { _: { esc, pips, fmt, card, quiz, shuffle, parseCost, pip } });

  /* ---------- progress ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: progress just isn't kept */ } }
  };
  let P = store.get(); P.done = P.done || {}; P.at = P.at || {};
  const save = () => store.set(P);
  const lessons = L.lessons;
  const byId = id => lessons.find(l => l.id === id);
  const nextLesson = () => lessons.find(l => !P.done[l.id]);

  /* ---------- views ---------- */
  const app = $("#app");
  function setNav(which) {
    document.querySelectorAll(".top nav a").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === which));
  }

  function viewHome() {
    setNav("home");
    const n = lessons.filter(l => P.done[l.id]).length, nx = nextLesson();
    const pct = Math.round(n / lessons.length * 100);
    let html = `<header class="stage"><div class="wrap">
      <p class="kicker">Zero to your first game</p>
      <h1>Learn <span>Magic</span></h1>
      <p class="lede">The card game explained from the very beginning, one small step at a time. You don't need to like board games, and you don't need to be good at maths.</p>
      <ul class="promises"><li>🐢 Tiny lessons, about 5 minutes each</li><li>👆 Try every idea yourself</li><li>🧮 Counting only, no sums</li><li>💚 You can't fail a quiz here</li></ul>
    </div></header>
    <main class="wrap">
      <div class="progress-card">
        <div class="row"><b>${n === 0 ? "Start here" : n === lessons.length ? "Course finished 🎉" : "Welcome back"}</b><span class="muted small" style="margin-left:auto">${n} of ${lessons.length} lessons done</span></div>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Course progress"><i style="width:${pct}%"></i></div>
        <div class="row">${nx ? `<a class="btn go" href="#/l/${nx.id}">${n === 0 ? "Start lesson 1" : "Continue: " + esc(nx.title)} →</a>` : `<a class="btn go" href="#/exam">Take the final quiz →</a>`}
        ${n === 0 ? `<span class="muted small">Your progress is saved in this browser.</span>` : ""}</div>
      </div>`;
    L.units.forEach((u, ui) => {
      const ls = lessons.filter(l => l.unit === u.id);
      html += `<section class="unit"><header><span class="n">Part ${ui + 1}</span><h2>${esc(u.title)}</h2></header><p>${esc(u.blurb)}</p><div class="lessons">`;
      ls.forEach(l => {
        const num = lessons.indexOf(l) + 1, done = P.done[l.id], isNext = nx && nx.id === l.id;
        html += `<a class="ltile ${done ? "done" : ""} ${isNext ? "next" : ""}" href="#/l/${l.id}"><span class="em" aria-hidden="true">${l.emoji}</span>
          <span class="t"><b>${num}. ${esc(l.title)}</b><span>${esc(l.blurb)}</span></span>
          <span class="st">${done ? "✓ Done" : isNext ? "Next" : l.steps.length + 1 + " steps"}</span></a>`;
      });
      html += `</div></section>`;
    });
    html += `<div class="extras">
      <a href="#/exam"><span aria-hidden="true">🏆</span><b>Final quiz</b><span>15 random questions from the whole course.</span></a>
      <a href="#/cheat"><span aria-hidden="true">📋</span><b>Cheat sheet</b><span>A whole turn on one screen. Keep it open during your first games.</span></a>
      <a href="#/glossary"><span aria-hidden="true">📖</span><b>Word list</b><span>Every Magic word in plain English.</span></a>
      <a href="../miku/#play"><span aria-hidden="true">🎮</span><b>Play a real game</b><span>When you're ready: the Hatsune Miku deck against friendly bots.</span></a>
    </div>
    ${n ? `<p class="small muted">Want to start over? <button class="btn sm" type="button" id="reset">Reset my progress</button></p>` : ""}
    <footer>Unofficial fan page. Magic: The Gathering is © Wizards of the Coast. The cards in the lessons are drawn simply, not real card images.</footer></main>`;
    app.innerHTML = html;
    const r = $("#reset");
    if (r) r.onclick = () => { if (confirm("Forget which lessons you finished?")) { P = { done: {}, at: {} }; save(); viewHome(); } };
  }

  function viewLesson(id, stepArg) {
    const l = byId(id);
    if (!l) return viewHome();
    setNav("");
    const idx = lessons.indexOf(l), total = l.steps.length;
    let i = stepArg != null ? stepArg : 0;
    i = Math.max(0, Math.min(i, total));
    P.at[id] = i; save();
    const unit = L.units.find(u => u.id === l.unit);
    let dots = "";
    for (let k = 0; k <= total; k++) dots += `<i class="${k < i ? "on" : k === i ? "cur" : ""}"></i>`;
    app.innerHTML = `<div class="wrap lesson">
      <div class="lhead"><span class="em" aria-hidden="true">${l.emoji}</span><div><div class="u">Lesson ${idx + 1} · ${esc(unit.title)}</div><h1>${esc(l.title)}</h1></div></div>
      <div class="dots" aria-label="Step ${i + 1} of ${total + 1}">${dots}</div>
      <div class="screen" id="screen"></div></div>
      <div class="navbar"><div class="wrap">
        <button class="btn" type="button" id="back" aria-label="Back">←</button>
        <span class="hint" id="hint" hidden></span>
        <button class="btn go" type="button" id="next">Next →</button>
      </div></div>`;
    const screen = $("#screen"), next = $("#next"), back = $("#back"), hint = $("#hint");
    const go = k => { location.hash = `#/l/${id}/${k}`; };
    back.onclick = () => i === 0 ? (location.hash = "#/") : go(i - 1);

    if (i === total) return finish(l, screen, next, back);

    const s = l.steps[i];
    let html = s.title ? `<h2>${fmt(s.title)}</h2>` : "";
    if (s.html) html += fmt(s.html);
    if (s.cards) html += `<div class="cards">${s.cards.map(c => card(c)).join("")}</div>`;
    if (s.after) html += fmt(s.after);
    if (s.widget) html += `<div class="w" id="wbox"></div>`;
    if (s.quiz) html += `<div id="qbox"></div>`;
    ["tip", "math", "warn", "mem"].forEach(k => {
      if (s[k]) html += `<div class="callout ${k}"><i aria-hidden="true">${{ tip: "💡", math: "🧮", warn: "⚠️", mem: "🧠" }[k]}</i><div>${fmt(s[k])}</div></div>`;
    });
    screen.innerHTML = html;

    const lock = (msg, skip) => {
      next.hidden = true; hint.hidden = false;
      hint.innerHTML = esc(msg) + (skip ? ` · <button class="linkish" type="button">skip</button>` : "");
      if (skip) $(".linkish", hint).onclick = unlock;
    };
    const unlock = () => { next.disabled = false; hint.hidden = true; next.hidden = false; };
    next.onclick = () => go(i + 1);

    if (s.widget) {
      const [name, opts] = Array.isArray(s.widget) ? s.widget : [s.widget, {}];
      const box = $("#wbox");
      box.dataset.widget = name;
      if (s.gate) lock(s.gate, true);
      if (W[name]) W[name](box, opts || {}, { done: unlock });
      else box.textContent = "Missing widget " + name;
    }
    if (s.quiz) {
      lock("Pick an answer");
      quiz($("#qbox"), s.quiz, ok => { if (ok) unlock(); });
    }
    if (i === total - 1) next.textContent = "Finish ✓";
    window.scrollTo(0, 0);
  }

  function finish(l, screen, next, back) {
    const first = !P.done[l.id];
    P.done[l.id] = true; delete P.at[l.id]; save();
    const nx = lessons[lessons.indexOf(l) + 1];
    screen.classList.add("finish");
    screen.innerHTML = `<div class="trophy" aria-hidden="true">${first ? "🎉" : "⭐"}</div>
      <h2>Lesson done!</h2><p class="muted">${first ? "Saved. " : ""}Here is everything from this lesson in one place:</p>
      <ul>${l.recap.map(r => `<li>${fmt(r)}</li>`).join("")}</ul>
      <div class="acts">${nx ? `<a class="btn go" href="#/l/${nx.id}">Next: ${esc(nx.title)} →</a>` : `<a class="btn go" href="#/exam">Final quiz 🏆</a>`}<a class="btn" href="#/">Course map</a></div>`;
    next.hidden = true;
    back.onclick = () => { location.hash = `#/l/${l.id}/${l.steps.length - 1}`; };
    window.scrollTo(0, 0);
  }

  function viewGlossary() {
    setNav("glossary");
    app.innerHTML = `<main class="wrap"><h1 class="page-title">Word list</h1><p class="muted">Every Magic word from the course, in plain English. Type to search.</p>
      <input class="search" type="search" placeholder="Search a word, like “tap” or “stack”" aria-label="Search the word list">
      <div class="gloss"></div><footer>Unofficial fan page. Magic: The Gathering is © Wizards of the Coast.</footer></main>`;
    const list = $(".gloss"), inp = $(".search");
    const terms = L.glossary.slice().sort((a, b) => a[0].localeCompare(b[0]));
    const draw = () => {
      const q = inp.value.trim().toLowerCase();
      const hits = terms.filter(t => !q || (t[0] + " " + t[1]).toLowerCase().includes(q));
      list.innerHTML = hits.map(t => {
        const l = t[2] && byId(t[2]);
        return `<div><b>${esc(t[0])}</b><span>${fmt(t[1])}</span>${l ? `<br><a href="#/l/${l.id}">Lesson ${lessons.indexOf(l) + 1}: ${esc(l.title)}</a>` : ""}</div>`;
      }).join("") || `<p class="muted">No word matches “${esc(q)}”.</p>`;
    };
    inp.oninput = draw; draw();
  }

  function viewCheat() {
    setNav("cheat");
    app.innerHTML = `<main class="wrap"><h1 class="page-title">Cheat sheet</h1><p class="muted">Keep this open during your first games. Nobody minds.</p>
      <div class="cheat">${L.cheat.map(s => `<section><h2>${fmt(s[0])}</h2>${fmt(s[1])}</section>`).join("")}</div>
      <footer>Unofficial fan page. Magic: The Gathering is © Wizards of the Coast.</footer></main>`;
  }

  function viewExam() {
    setNav("exam");
    const pool = [];
    lessons.forEach(l => l.steps.forEach(s => { if (s.quiz && !s.quiz.noExam) pool.push(s.quiz); }));
    L.exam.forEach(q => pool.push(q));
    const qs = shuffle(pool).slice(0, 15);
    let i = 0, score = 0;
    app.innerHTML = `<main class="wrap lesson"><h1 class="page-title">Final quiz 🏆</h1><p class="muted">15 questions from the whole course. A first-try answer earns a star. You can retake it as often as you like, the questions change.</p>
      <div class="dots" id="edots"></div><div class="screen" id="screen"></div></main>
      <div class="navbar"><div class="wrap"><a class="btn" href="#/" aria-label="Back to the course map">←</a><span class="hint" id="hint">Pick an answer</span><button class="btn go" type="button" id="next" hidden>Next →</button></div></div>`;
    const screen = $("#screen"), next = $("#next"), hint = $("#hint"), dots = $("#edots");
    function show() {
      dots.innerHTML = qs.map((_, k) => `<i class="${k < i ? "on" : k === i ? "cur" : ""}"></i>`).join("");
      if (i === qs.length) {
        const stars = score >= 14 ? 3 : score >= 10 ? 2 : score >= 6 ? 1 : 0;
        const best = Math.max(P.best || 0, score); P.best = best; save();
        screen.className = "screen finish";
        screen.innerHTML = `<div class="score">${score} / ${qs.length}</div><div class="stars" aria-label="${stars} stars">${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</div>
          <h2>${stars === 3 ? "You're ready to play!" : stars === 2 ? "Really solid!" : stars === 1 ? "Good start!" : "Every expert started here."}</h2>
          <p class="muted">${score} questions right on the first try. Your best so far: ${best}. ${stars < 3 ? "The lessons are always there to peek at, and the quiz picks new questions each time." : "Time for a real game against the bots."}</p>
          <div class="acts"><button class="btn go" type="button" id="again">Another round</button><a class="btn" href="../miku/#play">Play a game 🎮</a><a class="btn" href="#/">Course map</a></div>`;
        $("#again").onclick = viewExam;
        next.hidden = true; hint.hidden = true;
        return;
      }
      screen.className = "screen"; screen.innerHTML = "";
      next.hidden = true; hint.hidden = false;
      quiz(screen, qs[i], (ok, tries) => {
        if (!ok) return;
        if (tries === 1) score++;
        next.hidden = false; hint.hidden = true;
      });
      window.scrollTo(0, 0);
    }
    next.onclick = () => { i++; show(); };
    show();
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "l" && h[1]) {
      const step = h[2] != null && h[2] !== "" ? +h[2] : (P.at[h[1]] && !P.done[h[1]] ? P.at[h[1]] : 0);
      return viewLesson(h[1], isNaN(step) ? 0 : step);
    }
    if (h[0] === "glossary") return viewGlossary();
    if (h[0] === "cheat") return viewCheat();
    if (h[0] === "exam") return viewExam();
    viewHome();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
