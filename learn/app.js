/* Learn Magic: router, lesson player, quizzes, progress, reading aids and celebrations.
   Content is in lessons.js, the interactive pieces in widgets.js. Progress and settings stay in
   this browser only (localStorage). */
(function () {
  "use strict";
  const L = window.LEARN, W = window.LW = window.LW || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const KEY = "learnMagic.v1", PREFS = "learnMagic.prefs";

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
  const pickOne = a => a[Math.floor(Math.random() * a.length)];

  /* ---------- settings: bigger text, easier spacing, calm mode, sounds ---------- */
  const prefs = (() => { try { return JSON.parse(localStorage.getItem(PREFS)) || {}; } catch (e) { return {}; } })();
  const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify(prefs)); } catch (e) { /* not kept */ } };
  const calm = () => prefs.calm || matchMedia("(prefers-reduced-motion: reduce)").matches;
  function applyPrefs() {
    const h = document.documentElement;
    h.classList.toggle("big", !!prefs.big);
    h.classList.toggle("spaced", !!prefs.spaced);
    h.classList.toggle("calm", !!prefs.calm);
  }
  applyPrefs();
  const OPTIONS = [
    ["big", "🔠", "Bigger text", "Everything a little larger."],
    ["spaced", "📏", "Easier reading", "More space between lines and letters."],
    ["calm", "🌙", "Calm mode", "Fewer animations and no confetti."],
    ["sound", "🔔", "Sounds", "A soft chime for right answers."]
  ];
  function settingsPanel() {
    let pop = $("#prefs");
    if (pop) { pop.remove(); return; }
    pop = document.createElement("div");
    pop.id = "prefs"; pop.className = "prefs"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", "Reading settings");
    pop.innerHTML = `<b>Make it comfy</b>${OPTIONS.map(o => `<label><input type="checkbox" data-p="${o[0]}" ${prefs[o[0]] ? "checked" : ""}><span class="em" aria-hidden="true">${o[1]}</span><span><b>${o[2]}</b><small>${o[3]}</small></span></label>`).join("")}<button class="btn sm" type="button" id="prefs-x">Done</button>`;
    document.body.appendChild(pop);
    $$("input", pop).forEach(i => i.onchange = () => { prefs[i.dataset.p] = i.checked; savePrefs(); applyPrefs(); if (i.dataset.p === "sound" && i.checked) sfx("ok"); });
    $("#prefs-x").onclick = () => pop.remove();
  }
  $("#aa").onclick = settingsPanel;

  /* tiny sounds, made on the fly (off unless switched on) */
  let actx = null;
  function sfx(kind) {
    if (!prefs.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { ok: [660, 880], bad: [220], done: [523, 659, 784, 1047], tap: [520] }[kind] || [440];
      notes.forEach((f, k) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + k * 0.09;
        o.type = kind === "bad" ? "triangle" : "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(kind === "bad" ? 0.06 : 0.09, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.3);
      });
    } catch (e) { /* no audio here */ }
  }

  /* floating "-3", "+🌳" and friends over an element */
  function pop(node, text, cls) {
    if (!node || calm()) return;
    const r = node.getBoundingClientRect(), s = document.createElement("span");
    s.className = "popnum " + (cls || ""); s.innerHTML = fmt(text);
    s.style.left = r.left + r.width / 2 + "px"; s.style.top = r.top + r.height / 3 + "px";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1100);
  }

  function confetti(n) {
    if (calm()) return;
    const box = document.createElement("div");
    box.className = "confetti"; box.setAttribute("aria-hidden", "true");
    const cols = ["#39c5bb", "#ff3d8b", "#7b6cf0", "#f4c430", "#3fbf72", "#e2553b"];
    for (let i = 0; i < (n || 70); i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "%";
      p.style.background = pickOne(cols);
      p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
      p.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
      p.style.animationDelay = Math.random() * 0.35 + "s";
      p.style.animationDuration = 1.6 + Math.random() * 1.2 + "s";
      if (Math.random() < 0.4) p.style.borderRadius = "50%";
      box.appendChild(p);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3400);
  }

  /* ---------- read aloud ---------- */
  const canSpeak = "speechSynthesis" in window;
  function speakText(root) {
    const c = root.cloneNode(true);
    $$(".pip", c).forEach(p => p.replaceWith(" " + p.getAttribute("aria-label") + " "));
    $$(".mcard, .art, script, .readaloud, [aria-hidden=true]", c).forEach(x => x.remove());
    const parts = [];
    $$("h2, p, li, .callout, .q, .opt, .msg, .task, .explain", c).forEach((x, k, all) => {
      if (all.some(o => o !== x && o.contains(x))) return; // already read as part of its parent
      const t = x.textContent.replace(/\s+/g, " ").trim();
      if (t) parts.push((x.classList.contains("opt") ? "Answer: " : "") + t);
    });
    return parts.join(". ").replace(/\.\s*\./g, ".");
  }
  function stopSpeaking() { if (canSpeak) speechSynthesis.cancel(); $$(".readaloud").forEach(b => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); }); }
  function readButton(root) {
    if (!canSpeak) return "";
    setTimeout(() => {
      const b = $(".readaloud", root);
      if (!b) return;
      b.onclick = () => {
        if (b.classList.contains("on")) return stopSpeaking();
        stopSpeaking();
        const u = new SpeechSynthesisUtterance(speakText(root));
        u.lang = "en-US"; u.rate = 0.92;
        u.onend = u.onerror = () => { b.classList.remove("on"); b.setAttribute("aria-pressed", "false"); };
        b.classList.add("on"); b.setAttribute("aria-pressed", "true");
        speechSynthesis.speak(u);
      };
    });
    return `<button class="readaloud" type="button" aria-pressed="false" title="Read this screen out loud"><span aria-hidden="true">🔊</span> Read to me</button>`;
  }

  // One multiple-choice question. Wrong answers explain themselves and stay tappable until the
  // right one is found, so nobody gets stuck. A hint button hides one wrong answer.
  function quiz(el, q, onAnswer) {
    const opts = q.keep ? q.options.slice() : shuffle(q.options);
    el.classList.add("quiz");
    el.innerHTML = `<div class="q">${fmt(q.q)}</div>${q.cards ? `<div class="cards">${q.cards.map(c => card(c, { sm: true })).join("")}</div>` : ""}<div class="opts"></div>
      ${opts.length > 2 ? `<button class="hintbtn" type="button">💡 Help me: hide a wrong answer</button>` : ""}<div class="why" hidden aria-live="polite"></div>`;
    const box = $(".opts", el), why = $(".why", el), hb = $(".hintbtn", el);
    let tries = 0, solved = false;
    opts.forEach((o, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "opt"; b.innerHTML = `<span class="letter" aria-hidden="true">${"ABCD"[k]}</span><span>${fmt(o.t)}</span>`;
      b._ok = !!o.ok;
      b.style.setProperty("--d", k * 70 + "ms");
      b.onclick = () => {
        if (solved) return;
        tries++;
        why.hidden = false;
        if (o.ok) {
          solved = true;
          b.classList.add("right");
          $$(".opt", box).forEach(x => x.disabled = true);
          if (hb) hb.remove();
          why.className = "why good";
          why.innerHTML = `<b>${tries === 1 ? pickOne(["Yes! 🎉", "Exactly right ✨", "Nailed it 👏", "Correct 💚"]) : "That's it 👍"}</b>${fmt(o.why || q.why || "")}`;
          sfx("ok");
          if (tries === 1) pop(b, "⭐", "star");
        } else {
          b.classList.add("wrong"); b.disabled = true;
          why.className = "why bad";
          why.innerHTML = `<b>Not quite, and that's fine.</b>${fmt(o.why || "Have another look and try a different answer.")}`;
          sfx("bad");
        }
        if (onAnswer) onAnswer(!!o.ok, tries);
      };
      box.appendChild(b);
    });
    if (hb) hb.onclick = () => {
      const wrong = $$(".opt", box).filter(b => !b._ok && !b.disabled);
      if (wrong.length) { const w = pickOne(wrong); w.disabled = true; w.classList.add("gone"); }
      if ($$(".opt", box).filter(b => !b._ok && !b.disabled).length < 1 || wrong.length <= 1) hb.remove();
    };
  }

  Object.assign(W, { _: { esc, pips, fmt, card, quiz, shuffle, parseCost, pip, pop, sfx, confetti, calm } });

  /* ---------- progress ---------- */
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: progress just isn't kept */ } }
  };
  let P = store.get(); P.done = P.done || {}; P.at = P.at || {}; P.stars = P.stars || {};
  const save = () => store.set(P);
  const lessons = L.lessons;
  const byId = id => lessons.find(l => l.id === id);
  const nextLesson = () => lessons.find(l => !P.done[l.id]);
  const starStr = n => `<span class="stars-mini" aria-label="${n} of 3 stars">${"★".repeat(n)}<s>${"★".repeat(3 - n)}</s></span>`;
  const minutes = l => Math.max(2, Math.round(l.steps.length * 0.7));
  // first-try answers in the lesson being played, for its stars
  let RUN = { id: null, first: {}, quizzes: 0 };
  let last = { id: null, i: -1 };

  /* ---------- views ---------- */
  const app = $("#app");
  function setNav(which) { $$(".top nav a").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === which)); }
  document.addEventListener("keydown", e => {
    if (e.target.closest("input, textarea, select") || e.altKey || e.ctrlKey || e.metaKey) return;
    const next = $("#next"), back = $("#back");
    if (e.key === "ArrowRight" && next && !next.hidden && !next.disabled) { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft" && back) { e.preventDefault(); back.click(); }
  });

  function viewHome() {
    setNav("home");
    const n = lessons.filter(l => P.done[l.id]).length, nx = nextLesson();
    const pct = Math.round(n / lessons.length * 100);
    const totalStars = Object.values(P.stars).reduce((a, b) => a + b, 0);
    let html = `<header class="stage"><div class="wrap">
      <p class="kicker">Zero to your first game</p>
      <h1>Learn <span>Magic</span></h1>
      <p class="lede">The card game explained from the very beginning, one small step at a time. You don't need to like board games, and you don't need to be good at maths.</p>
      <ul class="promises"><li>🐢 Tiny lessons, a few minutes each</li><li>👆 Try every idea yourself</li><li>🔊 Every screen can be read to you</li><li>💚 You can't fail a quiz here</li></ul>
      <div class="floaters" aria-hidden="true"><span>🌳</span><span>⚡</span><span>👼</span><span>🐻</span><span>💧</span></div>
    </div></header>
    <main class="wrap">
      <div class="progress-card">
        <div class="row"><b>${n === 0 ? "Start here 👋" : n === lessons.length ? "Course finished 🎉" : "Welcome back 👋"}</b><span class="muted small" style="margin-left:auto">${n} of ${lessons.length} lessons${totalStars ? ` · ★ ${totalStars}` : ""}</span></div>
        <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Course progress"><i style="--w:${pct}%"></i></div>
        <div class="row">${nx ? `<a class="btn go big-cta" href="#/l/${nx.id}">${n === 0 ? "Start lesson 1" : "Continue: " + esc(nx.title)} →</a>` : `<a class="btn go big-cta" href="#/exam">Take the final quiz →</a>`}
        <button class="btn sm" type="button" id="aa2">🔠 Reading settings</button></div>
        ${n === 0 ? `<p class="muted small" style="margin:0">Your progress is saved in this browser. Lessons are in order, but you can open any of them.</p>` : ""}
      </div>`;
    let gi = 0;
    L.units.forEach((u, ui) => {
      const ls = lessons.filter(l => l.unit === u.id);
      const ud = ls.filter(l => P.done[l.id]).length;
      html += `<section class="unit u${ui % 6}"><header class="banner"><span class="n">Part ${ui + 1} · ${ud}/${ls.length}</span><h2>${esc(u.title)}</h2><p>${esc(u.blurb)}</p></header><ol class="path">`;
      ls.forEach((l, k) => {
        const num = lessons.indexOf(l) + 1, done = P.done[l.id], isNext = nx && nx.id === l.id, st = P.stars[l.id] || 0;
        const off = [0, 1, 1.4, 1, 0, -1, -1.4, -1][k % 8];
        html += `<li style="--off:${off};--i:${gi++}"><a class="node ${done ? "done" : ""} ${isNext ? "next" : ""}" href="#/l/${l.id}" aria-label="Lesson ${num}: ${esc(l.title)}${done ? ", done, " + st + " stars" : isNext ? ", up next" : ""}">
          ${isNext ? `<span class="go-bubble" aria-hidden="true">${n === 0 ? "Start!" : "Next"}</span>` : ""}
          <span class="disc" aria-hidden="true">${l.emoji}${done ? '<i class="tick">✓</i>' : ""}</span>
          <span class="lbl"><b>${num}. ${esc(l.title)}</b><span>${esc(l.blurb)}</span>${done ? starStr(st) : `<span class="mins">⏱ ${minutes(l)} min</span>`}</span></a></li>`;
      });
      html += `</ol></section>`;
    });
    html += `<div class="extras">
      <a href="#/exam"><span aria-hidden="true">🏆</span><b>Final quiz</b><span>15 random questions from the whole course.${P.best ? ` Your best: ${P.best}/15.` : ""}</span></a>
      <a href="#/cheat"><span aria-hidden="true">📋</span><b>Cheat sheet</b><span>A whole turn on one screen. Keep it open during your first games.</span></a>
      <a href="#/glossary"><span aria-hidden="true">📖</span><b>Word list</b><span>Every Magic word in plain English.</span></a>
      <a href="../miku/#play"><span aria-hidden="true">🎮</span><b>Play a real game</b><span>When you're ready: the Hatsune Miku deck against friendly bots.</span></a>
    </div>
    ${n ? `<p class="small muted">Want to start over? <button class="btn sm" type="button" id="reset">Reset my progress</button></p>` : ""}
    <footer>Unofficial fan page. Magic: The Gathering is © Wizards of the Coast. The cards in the lessons are drawn simply, not real card images. <a href="../">All decks</a></footer></main>`;
    app.innerHTML = html;
    $("#aa2").onclick = settingsPanel;
    const r = $("#reset");
    if (r) r.onclick = () => { if (confirm("Forget which lessons you finished?")) { P = { done: {}, at: {}, stars: {} }; save(); viewHome(); } };
    const nxt = $(".node.next");
    if (nxt && n > 0) setTimeout(() => nxt.scrollIntoView({ block: "center", behavior: calm() ? "auto" : "smooth" }), 250);
  }

  function viewLesson(id, stepArg) {
    const l = byId(id);
    if (!l) return viewHome();
    stopSpeaking();
    setNav("");
    const idx = lessons.indexOf(l), total = l.steps.length;
    let i = Math.max(0, Math.min(stepArg != null ? stepArg : 0, total));
    if (RUN.id !== id || i === 0) RUN = { id, first: {}, quizzes: l.steps.filter(s => s.quiz).length };
    const dir = last.id === id && i < last.i ? "back" : "fwd";
    last = { id, i };
    P.at[id] = i; save();
    const unit = L.units.find(u => u.id === l.unit);
    let dots = "";
    for (let k = 0; k <= total; k++) dots += `<i class="${k < i ? "on" : k === i ? "cur" : ""}"></i>`;
    app.innerHTML = `<div class="wrap lesson">
      <div class="lhead"><a class="em" href="#/" aria-label="Back to the course map">${l.emoji}</a><div><div class="u">Lesson ${idx + 1} of ${lessons.length} · ${esc(unit.title)}</div><h1>${esc(l.title)}</h1></div></div>
      <div class="dots" role="progressbar" aria-valuemin="1" aria-valuemax="${total + 1}" aria-valuenow="${i + 1}" aria-label="Screen ${i + 1} of ${total + 1}">${dots}</div>
      <div class="screen ${dir}" id="screen"></div></div>
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
    let html = `<div class="sbar"><span class="count">${i + 1} / ${total}</span>${readButton(screen)}</div>`;
    if (i === 0) html += `<div class="guide"><span class="mascot" aria-hidden="true">✨</span><p>${total} short screens, about ${minutes(l)} minutes. ${idx === 0 ? "Tap <b>Next</b> at the bottom when you're ready to move on. Nothing is timed." : pickOne(["Take your time.", "No rush.", "You've got this.", "Nice to see you!"])}</p></div>`;
    html += s.title ? `<h2>${fmt(s.title)}</h2>` : "";
    if (s.html) html += fmt(s.html);
    if (s.cards) html += `<div class="cards">${s.cards.map(c => card(c)).join("")}</div>`;
    if (s.after) html += fmt(s.after);
    if (s.widget) html += `<div class="w" id="wbox"></div>`;
    if (s.quiz) html += `<div id="qbox"></div>`;
    ["tip", "math", "warn", "mem"].forEach(k => {
      if (s[k]) html += `<div class="callout ${k}"><i aria-hidden="true">${{ tip: "💡", math: "🧮", warn: "⚠️", mem: "🧠" }[k]}</i><div>${k === "mem" ? "<b>Remember:</b> " : ""}${fmt(s[k])}</div></div>`;
    });
    screen.innerHTML = html;
    $$(":scope > *", screen).forEach((c, k) => c.style.setProperty("--d", Math.min(k, 8) * 70 + "ms"));

    const lock = (msg, skip) => {
      next.hidden = true; hint.hidden = false;
      hint.innerHTML = esc(msg) + (skip ? ` · <button class="linkish" type="button">skip</button>` : "");
      if (skip) $(".linkish", hint).onclick = unlock;
    };
    const unlock = () => {
      const was = next.hidden;
      next.disabled = false; hint.hidden = true; next.hidden = false;
      if (was) { next.classList.remove("ready"); void next.offsetWidth; next.classList.add("ready"); }
    };
    next.onclick = () => go(i + 1);

    if (s.widget) {
      const [name, opts] = Array.isArray(s.widget) ? s.widget : [s.widget, {}];
      const box = $("#wbox");
      box.dataset.widget = name;
      if (s.gate) lock(s.gate, true);
      if (W[name]) W[name](box, opts || {}, { done: () => { if (next.hidden) sfx("ok"); unlock(); } });
      else box.textContent = "Missing widget " + name;
    }
    if (s.quiz) {
      lock("Pick an answer");
      quiz($("#qbox"), s.quiz, (ok, tries) => { if (ok) { if (!(i in RUN.first)) RUN.first[i] = tries === 1; unlock(); } });
    }
    if (i === total - 1) next.textContent = "Finish ✓";
    window.scrollTo(0, 0);
  }

  function finish(l, screen, next, back) {
    const first = !P.done[l.id];
    const firsts = Object.values(RUN.first), right = firsts.filter(Boolean).length;
    // stars: 3 when every quiz was right first time, 2 for at least half, 1 for finishing
    let stars = 1;
    if (RUN.id === l.id && firsts.length) stars = right === RUN.quizzes ? 3 : right * 2 >= RUN.quizzes ? 2 : 1;
    else if (RUN.id === l.id && !RUN.quizzes) stars = 3;
    stars = Math.max(stars, P.stars[l.id] || 0);
    P.done[l.id] = true; P.stars[l.id] = stars; delete P.at[l.id]; save();
    const nx = lessons[lessons.indexOf(l) + 1];
    const n = lessons.filter(x => P.done[x.id]).length;
    screen.classList.add("finish");
    screen.innerHTML = `<div class="sbar"><span class="count">Done!</span>${readButton(screen)}</div><div class="trophy" aria-hidden="true">${first ? "🎉" : "⭐"}</div>
      <h2>Lesson done!</h2>
      <div class="bigstars" aria-label="${stars} of 3 stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "on" : ""}" style="--d:${300 + k * 220}ms">★</span>`).join("")}</div>
      <p class="muted">${stars === 3 ? "Every question right on the first try!" : "Every star counts. Replay any time to collect more."} ${n} of ${lessons.length} lessons done.</p>
      <div class="recap"><b>What you learned</b><ul>${l.recap.map(r => `<li>${fmt(r)}</li>`).join("")}</ul></div>
      <div class="acts">${nx ? `<a class="btn go" href="#/l/${nx.id}">Next: ${esc(nx.title)} →</a>` : `<a class="btn go" href="#/exam">Final quiz 🏆</a>`}<a class="btn" href="#/">Course map</a></div>`;
    next.hidden = true;
    back.onclick = () => { location.hash = `#/l/${l.id}/${l.steps.length - 1}`; };
    window.scrollTo(0, 0);
    sfx("done");
    confetti(first ? 90 : 40);
  }

  function viewGlossary() {
    stopSpeaking();
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
    stopSpeaking();
    setNav("cheat");
    app.innerHTML = `<main class="wrap"><h1 class="page-title">Cheat sheet</h1><p class="muted">Keep this open during your first games. Nobody minds.</p>
      <div class="cheat" id="cheat">${canSpeak ? `<div class="sbar"><button class="readaloud" type="button" aria-pressed="false"><span aria-hidden="true">🔊</span> Read to me</button></div>` : ""}${L.cheat.map(s => `<section><h2>${fmt(s[0])}</h2>${fmt(s[1])}</section>`).join("")}</div>
      <footer>Unofficial fan page. Magic: The Gathering is © Wizards of the Coast.</footer></main>`;
    const b = $(".readaloud");
    if (b) b.onclick = () => readSheet($("#cheat"), b);
  }
  function readSheet(root, b) {
    if (b.classList.contains("on")) return stopSpeaking();
    stopSpeaking();
    const u = new SpeechSynthesisUtterance(speakText(root)); u.lang = "en-US"; u.rate = 0.92;
    u.onend = u.onerror = () => b.classList.remove("on");
    b.classList.add("on"); speechSynthesis.speak(u);
  }

  function viewExam() {
    stopSpeaking();
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
      stopSpeaking();
      dots.innerHTML = qs.map((_, k) => `<i class="${k < i ? "on" : k === i ? "cur" : ""}"></i>`).join("");
      if (i === qs.length) {
        const stars = score >= 14 ? 3 : score >= 10 ? 2 : score >= 6 ? 1 : 0;
        const best = Math.max(P.best || 0, score); P.best = best; save();
        screen.className = "screen finish";
        screen.innerHTML = `<div class="score">${score} / ${qs.length}</div><div class="bigstars" aria-label="${stars} stars">${[0, 1, 2].map(k => `<span class="${k < stars ? "on" : ""}" style="--d:${300 + k * 220}ms">★</span>`).join("")}</div>
          <h2>${stars === 3 ? "You're ready to play!" : stars === 2 ? "Really solid!" : stars === 1 ? "Good start!" : "Every expert started here."}</h2>
          <p class="muted">${score} questions right on the first try. Your best so far: ${best}. ${stars < 3 ? "The lessons are always there to peek at, and the quiz picks new questions each time." : "Time for a real game against the bots."}</p>
          <div class="acts"><button class="btn go" type="button" id="again">Another round</button><a class="btn" href="../miku/#play">Play a game 🎮</a><a class="btn" href="#/">Course map</a></div>`;
        $("#again").onclick = viewExam;
        next.hidden = true; hint.hidden = true;
        sfx("done"); if (stars) confetti(stars * 30);
        return;
      }
      screen.className = "screen fwd"; screen.innerHTML = `<div class="sbar"><span class="count">Question ${i + 1} of ${qs.length}</span>${readButton(screen)}</div><div id="qbox"></div>`;
      next.hidden = true; hint.hidden = false;
      quiz($("#qbox"), qs[i], (ok, tries) => {
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
    $("#prefs") && $("#prefs").remove();
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "l" && h[1]) {
      const step = h[2] != null && h[2] !== "" ? +h[2] : (P.at[h[1]] && !P.done[h[1]] ? P.at[h[1]] : 0);
      return viewLesson(h[1], isNaN(step) ? 0 : step);
    }
    stopSpeaking();
    if (h[0] === "glossary") return viewGlossary();
    if (h[0] === "cheat") return viewCheat();
    if (h[0] === "exam") return viewExam();
    viewHome();
    if (!$(".node.next")) window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  route();
})();
