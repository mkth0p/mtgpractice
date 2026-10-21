/* Cognitive test practice: router, practice and test runners, full test, progress over time,
   data export.
   All data stays in this browser (localStorage) until the person exports it. */
(function () {
  "use strict";
  const G = window.IQGEN, T = window.IQTASKS, C = window.IQCONTENT, U = window.IQUI, NM = window.IQNORMS;
  const { esc, $, $$, sleep } = U;
  const KEY = "iqPractice.v1";
  const app = $("#app");

  /* ---------- storage ---------- */
  const fresh = () => ({ sessions: [], full: null, prefs: {}, levels: {}, forms: {} });
  const load = () => { try { return Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return fresh(); } };
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked: data lives until the tab closes */ } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const INDEXES = [
    { id: "fluid", name: "Fluid reasoning", note: "Solve new problems from rules you work out on the spot." },
    { id: "spatial", name: "Visual spatial", note: "Picture, turn and put together shapes in your head." },
    { id: "memory", name: "Working memory", note: "Hold information and work with it at the same time." },
    { id: "speed", name: "Processing speed", note: "Simple visual decisions, done quickly and accurately." },
    { id: "verbal", name: "Verbal comprehension", note: "Word knowledge and verbal reasoning; scored by an examiner in the real tests." },
  ];
  const ORDER = ["matrix", "weights", "series", "puzzle", "blocks", "dsf", "dsb", "dss", "lns", "running", "symspan", "spatialadd", "arith", "coding", "dsm", "symsearch", "nsq", "similar", "vocab"];
  /* Every standard test uses a form nobody has seen before: items come from the form's seed, so a
     new form number means new items at the same difficulty steps. Practice never uses form seeds. */
  const nextForm = id => { S.forms[id] = (S.forms[id] || 0) + 1; save(); return String(S.forms[id]); };
  // the full test: the seven tasks behind the WAIS-5 FSIQ, or all ten primary subtests
  const BATTERIES = {
    estimate: { name: "Open-norms estimate (short)", tasks: ["dsf", "dsb", "dsm"] },
    core: { name: "Core (like the WAIS-5 FSIQ)", tasks: ["similar", "vocab", "blocks", "matrix", "weights", "dss", "coding"] },
    primary: { name: "All primary subtests", tasks: ["similar", "vocab", "blocks", "puzzle", "matrix", "weights", "dss", "running", "coding", "symsearch"] },
    nonverbal: { name: "Nonverbal (no typed answers)", tasks: ["blocks", "puzzle", "matrix", "weights", "dss", "running", "coding", "symsearch"] },
  };

  /* ---------- the runner ---------- */
  function timer(seconds, bar, onEnd, soft) {
    if (!seconds) { if (bar) bar.classList.add("off"); return { stop() {}, elapsed: () => 0 }; }
    const t0 = performance.now(); let raf = 0, stopped = false;
    const tick = () => {
      if (stopped) return;
      const left = Math.max(0, seconds * 1000 - (performance.now() - t0));
      if (bar) { bar.firstElementChild.style.transform = `scaleX(${left / (seconds * 1000)})`; bar.classList.toggle("low", left < 5000); }
      if (left <= 0) { stopped = true; onEnd(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return { stop() { stopped = true; cancelAnimationFrame(raf); }, elapsed: () => performance.now() - t0 };
  }

  /* Runs one item; returns { correct, response, rt, timedOut, points? } */
  async function runItem(task, item, opts) {
    const host = $("#stage");
    const bar = $("#tb");
    let onTo = null, timedOut = false;
    const limit = opts.limit;
    const ctx = { practice: opts.practice, prefs: S.prefs, rng: G.rng(uid()), onTimeout: f => { onTo = f; } };
    const t0 = performance.now();
    const sn = $("#softnote"); if (sn) { sn.hidden = true; sn.textContent = "Time guide passed. In the real test the examiner would now encourage you to give your best answer."; }
    window.__iqItem = item; // read by the screen test (tools/iq/iq-walk.js)
    const p = task.render(host, item, ctx);
    // the clock starts once the item is on screen (span lists are not timed)
    if (opts.warnAt && limit > opts.warnAt) setTimeout(() => { const w = $("#softnote"); if (w && !w._done) { w.textContent = "Do you have an answer? (10 seconds left)"; w.hidden = false; } }, (limit - opts.warnAt) * 1000);
    const tm = timer(limit, bar, () => { timedOut = !opts.soft; if (opts.soft) { const w = $("#softnote"); if (w) w.hidden = false; return; } if (onTo) onTo(); });
    const res = await p;
    tm.stop();
    res.rt = Math.round(performance.now() - t0);
    res.timedOut = timedOut;
    return res;
  }

  function stageHtml(task, mode, label) {
    return `<div class="wrap runner"><div class="rhead"><span>${esc(task.name)} · ${mode === "test" ? "standard rules" : "practice"}</span><span class="q" id="qn">${label || ""}</span><button class="btn quiet x" type="button" id="quit">Stop</button></div><div class="timebar" id="tb"><i></i></div><p class="note warn small" id="softnote" hidden>Time guide passed. In the real test the examiner would now encourage you to give your best answer.</p><div id="stage"></div><div id="fb"></div></div>`;
  }

  async function feedback(task, item, res, final) {
    const fb = $("#fb");
    const ok = res.correct === true;
    const exp = task.explain ? task.explain(item) : "";
    fb.innerHTML = `<div class="feedback note ${ok ? "good" : "bad"}"><b>${ok ? "Right." : res.timedOut ? "Out of time." : "Not this time."}</b> ${Array.isArray(exp) ? `<ul>${exp.map(e => `<li>${esc(e)}</li>`).join("")}</ul>` : esc(exp)}</div><div class="next"><button class="btn go" type="button" id="nx">${final ? "See results" : "Next"}</button></div>`;
    $("#nx").focus();
    await new Promise(r => { $("#nx").onclick = r; });
    fb.innerHTML = "";
  }

  /* LADDER: test = fixed items per level from a form seed, stop after a run of misses.
     practice = adaptive (two right in a row: harder; one miss: easier), with feedback. */
  async function runLadder(task, mode, form, nPractice) {
    const A = task.admin, items = [];
    let quit = false;
    $("#quit").onclick = () => { quit = true; const h = $("#stage"); h._abort = true; if (h._res) h._res(); location.hash = "#/task/" + task.id; };
    const limitFor = lv => A.limitFor ? A.limitFor(lv) : A.limit;
    if (mode === "test") {
      let miss = 0, n = 0;
      const total = A.levels * A.perLevel;
      for (let lv = 1; lv <= A.levels && miss < A.stopAfter && !quit; lv++) {
        for (let k = 0; k < A.perLevel && miss < A.stopAfter && !quit; k++) {
          n++;
          const seed = `form${form}|${task.id}|${k}`;
          const item = task.item(seed, lv, k);
          $("#qn").textContent = `item ${n} of up to ${total}`;
          const res = await runItem(task, item, { limit: limitFor(lv), soft: A.softLimit, warnAt: A.warnAt, practice: false });
          if (quit) return null;
          let points = res.correct ? 1 : 0;
          if (A.speedBonus && res.correct) points = blockPoints(item, res.rt);
          items.push({ level: lv, k, correct: !!res.correct, points, rt: res.rt, timedOut: res.timedOut, response: res.response, answer: answerOf(item) });
          miss = res.correct ? 0 : miss + 1;
          await sleep(250);
        }
      }
      return { items, raw: items.reduce((s, x) => s + x.points, 0), max: maxRaw(task), stoppedEarly: miss >= A.stopAfter };
    }
    // practice
    let lv = Math.max(1, (S.levels[task.id] || 1)), streak = 0, best = 0;
    const N = nPractice || 12;
    for (let n = 0; n < N && !quit; n++) {
      const item = task.item("p" + uid(), lv, n);
      $("#qn").textContent = `${n + 1} / ${N} · level ${lv} of ${A.levels}`;
      const res = await runItem(task, item, { limit: limitFor(lv), soft: !S.prefs.practiceTimed, practice: true });
      if (quit) return null;
      items.push({ level: lv, correct: !!res.correct, rt: res.rt, timedOut: res.timedOut, response: res.response, answer: answerOf(item) });
      if (res.correct) best = Math.max(best, lv);
      await feedback(task, item, res, n === N - 1);
      if (res.correct) { if (++streak >= 2) { lv = Math.min(A.levels, lv + 1); streak = 0; } } else { lv = Math.max(1, lv - 1); streak = 0; }
    }
    S.levels[task.id] = Math.max(1, lv);
    return { items, raw: items.filter(x => x.correct).length, max: items.length, levelEnd: lv, best };
  }
  // Block design: points for a correct design; the larger designs earn time bonus points (see Method)
  function blockPoints(item, rt) {
    if (item.n === 2) return item.level <= 2 ? 2 : 4;
    const s = rt / 1000, L = item.limit;
    return s <= L * 0.25 ? 7 : s <= L * 0.4 ? 6 : s <= L * 0.6 ? 5 : 4;
  }
  const answerOf = it => it.correct !== undefined ? it.correct : it.answer !== undefined ? it.answer : it.faces ? it.faces.join("") : null;
  function maxRaw(task) { const A = task.admin; if (A.speedBonus) { let m = 0; for (let lv = 1; lv <= A.levels; lv++) m += A.perLevel * (G.genBlocks("x", lv).n === 2 ? (lv <= 2 ? 2 : 4) : 7); return m; } return A.levels * A.perLevel; }

  /* SPAN: lengths go up; each length has 2 (or 3) tries; stop when every try at a length fails. */
  async function runSpan(task, mode, form, nPractice) {
    const A = task.admin, items = [];
    let quit = false;
    $("#quit").onclick = () => { quit = true; $("#stage")._abort = true; location.hash = "#/task/" + task.id; };
    if (mode === "test") {
      // the open-norms full test lets spans run past the WAIS top length, so a long span is measured, not capped
      const top = S.full && S.full.active && S.full.battery === "estimate" && A.normMax ? A.normMax : A.max;
      let longest = 0;
      for (let len = A.min; len <= top && !quit; len++) {
        let anyRight = false;
        for (let t = 1; t <= A.trials && !quit; t++) {
          const item = task.item(`form${form}|${task.id}`, len, t);
          $("#qn").textContent = `length ${len}, try ${t}`;
          $("#tb").classList.add("off");
          const res = await runItem(task, item, { limit: 0, practice: false });
          if (quit) return null;
          items.push({ level: len, trial: t, correct: !!res.correct, points: res.correct ? 1 : 0, rt: res.rt, response: res.response, answer: item.answer ? item.answer.join("") : "" });
          if (res.correct) { anyRight = true; longest = len; }
          await sleep(500);
        }
        if (!anyRight) break;
      }
      return { items, raw: items.filter(x => x.correct).length, max: (top - A.min + 1) * A.trials, longest, ceiling: top };
    }
    let len = Math.max(A.min, S.levels[task.id] || A.min + 1), streak = 0, best = 0;
    const N = nPractice || 12;
    for (let n = 0; n < N && !quit; n++) {
      const item = task.item("p" + uid(), len, 1);
      $("#qn").textContent = `${n + 1} / ${N} · length ${len}`;
      $("#tb").classList.add("off");
      const res = await runItem(task, item, { limit: 0, practice: true });
      if (quit) return null;
      items.push({ level: len, correct: !!res.correct, rt: res.rt, response: res.response, answer: item.answer ? item.answer.join("") : "" });
      if (res.correct) best = Math.max(best, len);
      await feedback(task, item, res, n === N - 1);
      if (res.correct) { if (++streak >= 2) { len = Math.min(A.max + 2, len + 1); streak = 0; } } else { len = Math.max(A.min, len - 1); streak = 0; }
    }
    S.levels[task.id] = len;
    return { items, raw: items.filter(x => x.correct).length, max: items.length, levelEnd: len, best };
  }

  /* SPEED: one long timed sheet. */
  async function runSpeed(task, mode, form) {
    const A = task.admin;
    let quit = false;
    $("#quit").onclick = () => { quit = true; location.hash = "#/task/" + task.id; };
    const seconds = mode === "test" ? A.seconds : A.practiceSeconds || 45;
    $("#qn").textContent = `${seconds} seconds`;
    const item = task.item(mode === "test" ? `form${form}|${task.id}` : "p" + uid());
    $("#stage").innerHTML = `<div class="card" style="text-align:center"><p>${esc(task.short)} You have <b>${seconds} seconds</b>. Work quickly without making mistakes.</p><button class="btn go" type="button" id="go">Start</button></div>`;
    await new Promise(r => { $("#go").onclick = r; });
    const res = await runItem(task, item, { limit: seconds, practice: mode !== "test" });
    if (quit) return null;
    const log = res.response || [];
    const rts = log.map(x => x.rt).sort((a, b) => a - b);
    const rtc = log.filter(x => x.ok).map(x => x.rt).sort((a, b) => a - b);
    const med = a => a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : Math.round((a[a.length / 2 - 1] + a[a.length / 2]) / 2)) : null;
    return { items: log, raw: res.points, right: res.correct, wrong: res.wrong, seconds, medianRt: rts.length ? rts[Math.floor(rts.length / 2)] : null, medianRtc: med(rtc) };
  }

  async function runTask(id, mode, form) {
    const task = T[id] || (C.verbal && C.verbal[id]);
    if (!task) return home();
    const full = mode === "test" && S.full && S.full.active ? S.full : null;
    if (mode === "test" && !form) form = full ? full.form : nextForm(id);
    document.body.classList.add("testing");
    app.innerHTML = stageHtml(task, mode);
    const started = new Date().toISOString();
    const runner = task.admin.kind === "ladder" ? runLadder : task.admin.kind === "span" ? runSpan : task.admin.kind === "speed" ? runSpeed : task.run;
    const out = await runner(task, mode, form, +(S.prefs.practiceN || 12));
    document.body.classList.remove("testing");
    if (!out) return;
    // how much this task was practised before this test (for reading gains honestly)
    const before = S.sessions.filter(x => x.task === id && x.mode !== "test");
    const sess = { id: uid(), task: id, mode, form: mode === "test" ? form : null, started, ended: new Date().toISOString(), fullTest: full ? full.id : null, device: NM.device(), age: S.prefs.age || null, practiceBefore: mode === "test" ? { sessions: before.length, minutes: Math.round(before.reduce((m, x) => m + (new Date(x.ended) - new Date(x.started)), 0) / 60000) } : null, prefs: { audio: !!S.prefs.audio, arithListen: !!S.prefs.arithListen }, result: out };
    S.sessions.push(sess); save();
    if (full) return fullNext();
    showResult(sess);
  }

  /* ---------- views ---------- */
  function nav(cur) { $$(".top nav a").forEach(a => a.toggleAttribute("aria-current", a.dataset.nav === cur)); }
  function taskStats(id) {
    const ss = S.sessions.filter(s => s.task === id);
    const tests = ss.filter(s => s.mode === "test"), prac = ss.filter(s => s.mode !== "test");
    return { n: ss.length, tests, prac, last: tests[tests.length - 1] };
  }
  function home() {
    nav("home");
    const all = Object.assign({}, T, C.verbal || {});
    app.innerHTML = `<div class="wrap">
      <h1>Cognitive test practice</h1>
      <p class="muted">Practice tasks built on the published formats of the main adult intelligence batteries (WAIS-5, WAIS-IV, WASI-II, Raven's matrices) and the public-domain ICAR items, with the same kinds of time limits, start rules and stop rules. Every item here is original and generated; none is copied from a real test.</p>
      <div class="note warn"><b>This is not an IQ test.</b> It gives raw scores only. Real IQ scores come from a trained examiner giving a standardized test and comparing you with a large norm sample. Training on these formats will raise practice scores, and part of that carries over to real tests as a practice effect, not a change in ability. The <a href="#/method">Method</a> page explains what the research says, which matters for reading your own gains over time.</div>
      <div class="btns"><a class="btn go" href="#/full">Take a full test</a><a class="btn" href="#/progress">My progress</a><a class="btn" href="#/method">Method &amp; evidence</a><a class="btn" href="#/data">My data</a><a class="btn quiet" href="#/settings">Settings</a></div>
      ${INDEXES.map(ix => `<div class="idx"><h2>${ix.name}</h2><span>${ix.note}</span></div><div class="grid2">${ORDER.filter(id => all[id] && all[id].index === ix.id).map(id => { const t = all[id], st = taskStats(id); return `<a class="task" href="#/task/${id}"><span class="tag">${esc(t.tag || "")}</span><b>${esc(t.name)}</b><p>${esc(t.short)}</p><div class="stat">${st.n ? `${st.prac.length} practice · ${st.tests.length} standard${st.last ? ` · last raw ${st.last.result.raw}` : ""}` : "not tried yet"}</div></a>`; }).join("")}</div>`).join("")}
      <p class="foot">Hidden page: not linked from the deck sites. Data stays in this browser until you export it.</p></div>`;
  }

  function taskPage(id) {
    nav("home");
    const t = T[id] || (C.verbal && C.verbal[id]);
    if (!t) return home();
    const info = (C.tasks && C.tasks[id]) || {};
    const st = taskStats(id);
    const A = t.admin;
    const rule = A.kind === "ladder" ? `Items get harder; ${A.perLevel} per level, ${A.levels} levels. Stops after ${A.stopAfter} misses in a row.${A.limit ? ` Time: ${A.limit} s per item${A.softLimit ? " (a guide, not a cut-off)" : ""}.` : A.limitFor ? " Time limit per item grows with difficulty." : ""}`
      : A.kind === "span" ? `Lists get longer, ${A.trials} tries per length, from ${A.min} to ${A.max}. Stops when every try at a length is wrong.`
      : A.kind === "speed" ? `${A.seconds} seconds; score is ${A.metric === "rt" ? "the median time of your correct answers (lower is better)" : `the number done right${id === "symsearch" ? " minus the number done wrong" : ""}`}.` : (A.text || "");
    app.innerHTML = `<div class="wrap">
      <p class="small"><a href="#/">← All tasks</a></p>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(t.models)}</p>
      ${info.what ? `<h2>What the real subtest asks</h2><p>${info.what}</p>` : ""}
      ${info.admin ? `<h2>How it is given</h2><p>${info.admin}</p>` : ""}
      <div class="card"><b>Rules on this page</b><p class="small" style="margin:6px 0 0">${esc(rule)}</p>${info.differs ? `<p class="small muted" style="margin:6px 0 0"><b>How this version differs:</b> ${info.differs}</p>` : ""}</div>
      <div class="btns"><a class="btn go" href="#/run/${id}/practice">Practice with feedback</a><a class="btn" href="#/run/${id}/test">Standard test (new form)</a></div>
      ${info.strategy ? `<h2>How skilled test takers approach it</h2>${info.strategy}` : ""}
      ${info.trains ? `<h2>What practice changes</h2><p>${info.trains}</p>` : ""}
      ${st.n ? `<h2>Your history</h2>${historyTable(st)}` : ""}
    </div>`;
  }

  function historyTable(st) {
    const rows = st.tests.concat(st.prac).sort((a, b) => a.started < b.started ? -1 : 1);
    return `<div class="tscroll"><table><tr><th>When</th><th>Mode</th><th>Raw</th><th>Detail</th></tr>${rows.slice(-20).reverse().map(s => `<tr><td>${new Date(s.started).toLocaleString()}</td><td>${s.mode === "test" ? `standard <span class="pill a">form ${s.form}</span>` : "practice"}${s.fullTest ? ` <span class="pill">full test</span>` : ""}</td><td>${s.result.raw}${s.result.max ? ` / ${s.result.max}` : ""}</td><td class="small">${detail(s)}</td></tr>`).join("")}</table></div>`;
  }
  const detail = s => { const r = s.result; return r.longest !== undefined ? `longest ${r.longest}` : r.seconds ? `${r.right} right, ${r.wrong} wrong${r.medianRtc ? `, median correct ${r.medianRtc} ms` : r.medianRt ? `, median ${r.medianRt} ms` : ""}` : r.levelEnd ? `ended at level ${r.levelEnd}` : r.items ? `${r.items.length} items${r.stoppedEarly ? ", stop rule reached" : ""}` : ""; };

  /* ---------- open-norms estimate ---------- */
  const ageOf = s => s.age || S.prefs.age || null;
  const fmt = v => Math.round(v);
  // the latest standard test of each normed task taken before `when` (or ever)
  const latestScores = when => NM.IDS.map(id => S.sessions.filter(s => s.task === id && s.mode === "test" && (!when || s.started <= when)).pop()).filter(Boolean).map(s => NM.score(s, ageOf(s))).filter(Boolean);
  const fullScores = f => S.sessions.filter(s => s.fullTest === f.id && NM.TABLE[s.task]).map(s => NM.score(s, ageOf(s))).filter(Boolean);
  function estimateCard(c, parts, title) {
    if (!c) return "";
    const warn = [...new Set(parts.flatMap(p => p.warn))];
    return `<div class="card est"><p class="small muted" style="margin:0">${esc(title)} · IQ-scale estimate from open adult norms</p>
      <div class="big">${c.lowerBound ? "≥ " : ""}${fmt(c.iq)}</div><p class="muted" style="margin-top:0">90% range ${fmt(c.lo)} to ${c.lowerBound ? "above " : ""}${fmt(c.hi)}</p>
      <div class="tscroll"><table><tr><th>Task</th><th>Your score</th><th>Percentile</th><th>IQ scale</th></tr>${parts.map(p => `<tr><td>${esc(p.name)}</td><td>${p.atMax ? "≥ " : ""}${p.x} ${esc(p.unit)}</td><td>${p.atMax ? "≥ " : ""}${p.pct < 1 ? "<1" : p.pct > 99 ? ">99" : Math.round(p.pct)}</td><td>${p.atMax ? "≥ " : ""}${fmt(p.iq)} <span class="small muted">(${fmt(p.lo)} to ${fmt(p.hi)})</span></td></tr>`).join("")}</table></div>
      ${warn.length ? `<div class="note warn small">Check: ${esc(warn.join("; "))}. ${warn.some(w => /no age/.test(w)) ? `Set your age in <a href="#/settings">Settings</a>.` : ""}</div>` : ""}
      ${c.lowerBound ? `<p class="small">You reached the longest list the standard rules give, so the true score is higher than shown.</p>` : ""}
      <p class="small muted">This covers short-term memory and processing speed only${c.complete ? "" : `, and only ${c.k} of the ${NM.IDS.length} normed tasks`}. It is not a full-scale IQ: memory and speed tasks correlate only moderately with a full IQ, so a person with a very high full-scale IQ usually scores lower here. Scores on tasks you have practised are inflated by practice. <a href="#/method#norms">How this is computed</a>.</p></div>`;
  }

  function showResult(s) {
    const t = T[s.task] || C.verbal[s.task];
    const r = s.result;
    const prev = S.sessions.filter(x => x.task === s.task && x.mode === s.mode && x.id !== s.id);
    const last = prev[prev.length - 1];
    app.innerHTML = `<div class="wrap"><p class="small"><a href="#/task/${s.task}">← ${esc(t.name)}</a></p>
      <h1>${s.mode === "test" ? "Raw score" : "Practice done"}</h1>
      <div class="result-big">${r.raw}${r.max ? `<span class="muted" style="font-size:1rem"> / ${r.max}</span>` : ""}</div>
      <p class="muted">${detail(s)}${last ? ` · previous: ${last.result.raw}` : ""}</p>
      ${s.mode === "test" && NM.score(s, ageOf(s)) ? estimateCard(NM.composite([NM.score(s, ageOf(s))]), [NM.score(s, ageOf(s))], "This task alone") : ""}
      ${s.mode === "test" && !NM.TABLE[s.task] ? `<div class="note small">A raw score is not an IQ or a scaled score. Real scaled scores need the publisher's norm tables for your age group, which are not public. Use raw scores to compare yourself with yourself, on different forms. Only ${NM.IDS.map(id => esc(NM.TABLE[id].name)).join(", ")} have open adult norms (see <a href="#/method#norms">Method</a>).</div>` : ""}
      ${r.items && r.items.length && r.items[0].level !== undefined ? `<div class="tscroll"><table><tr><th>#</th><th>Level</th><th>Result</th><th>Time</th></tr>${r.items.map((x, i) => `<tr><td>${i + 1}</td><td>${x.level}${x.trial ? `.${x.trial}` : ""}</td><td>${x.correct ? "✓" : x.timedOut ? "time" : "✗"}${x.points > 1 ? ` (${x.points} pts)` : ""}</td><td>${(x.rt / 1000).toFixed(1)} s</td></tr>`).join("")}</table></div>` : ""}
      <div class="btns"><a class="btn go" href="#/task/${s.task}">Back to the task</a><a class="btn" href="#/">All tasks</a></div></div>`;
  }

  /* ---------- full test: several standard tests in one sitting, on new forms ---------- */
  function fullPage() {
    nav("full");
    const tasksAll = Object.assign({}, T, C.verbal || {});
    const fulls = fullTests();
    const pick = S.prefs.battery || "core";
    app.innerHTML = `<div class="wrap"><h1>Full test</h1>
      <p>Takes a battery of tasks under standard rules in one sitting, each on a form you have never seen. Repeat it every few weeks to track yourself over time on the <a href="#/progress">progress page</a>.</p>
      <div class="note small">For a fair before/after comparison: take the full test <b>two or three times before you start training</b>. Scores rise on their own for the first two or three takes and then level off (Scharfen et al. 2018), so the last of those is your real starting point. Take it at the same time of day, on the same device, with the same settings.</div>
      <div class="card">${Object.entries(BATTERIES).map(([k, b]) => `<label class="chk"><input type="radio" name="bat" value="${k}" ${k === pick ? "checked" : ""}> <span><b>${esc(b.name)}</b><br><span class="small muted">${b.tasks.map(id => esc(tasksAll[id].name)).join(", ")} · about ${b.tasks.length * 5} minutes</span></span></label>`).join("")}
      <div class="btns"><button class="btn go" type="button" id="go">Start full test ${fulls.length + 1}</button></div></div>
      ${S.full && S.full.active ? `<div class="note warn small">A full test was left unfinished. <button class="btn quiet" type="button" id="resume">Resume it</button></div>` : ""}
      ${fulls.length ? `<h2>Past full tests</h2>${fullTable(fulls)}` : ""}</div>`;
    $("#go").onclick = () => {
      const bat = $("input[name=bat]:checked").value; S.prefs.battery = bat;
      const n = fulls.length + 1;
      S.full = { id: "full-" + uid(), n, battery: bat, form: "full" + n, queue: BATTERIES[bat].tasks.slice(), total: BATTERIES[bat].tasks.length, active: true, started: new Date().toISOString() };
      save(); fullNext();
    };
    if ($("#resume")) $("#resume").onclick = fullNext;
  }
  async function fullNext() {
    const f = S.full;
    if (!f.queue.length) { f.active = false; S.fullDone = (S.fullDone || []).concat([{ id: f.id, n: f.n, battery: f.battery, started: f.started, ended: new Date().toISOString() }]); save(); location.hash = "#/progress"; progressPage(); return; }
    const id = f.queue[0];
    const t = T[id] || C.verbal[id];
    app.innerHTML = `<div class="wrap"><h1>${esc(t.name)}</h1><p class="muted">Full test ${f.n} · task ${f.total - f.queue.length + 1} of ${f.total}</p><p>${esc(t.short)}</p><div class="btns"><button class="btn go" type="button" id="go">Begin</button><button class="btn quiet" type="button" id="skip">Skip this task</button><button class="btn quiet" type="button" id="stop">Stop the full test</button></div></div>`;
    $("#go").onclick = () => { f.queue.shift(); save(); runTask(id, "test", f.form); };
    $("#skip").onclick = () => { f.queue.shift(); save(); fullNext(); };
    $("#stop").onclick = () => { f.active = false; f.queue = []; save(); fullPage(); };
  }
  // the score to show for a test: median correct time for the matching task, raw score otherwise
  const shown = s => s.task === "dsm" && s.result.medianRtc ? s.result.medianRtc : s.result.raw;
  const fullTests = () => (S.fullDone || []).filter(f => S.sessions.some(s => s.fullTest === f.id));
  function fullTable(fulls) {
    const tasksAll = Object.assign({}, T, C.verbal || {});
    const ids = ORDER.filter(id => fulls.some(f => S.sessions.some(s => s.fullTest === f.id && s.task === id)));
    const cell = (f, id) => { const x = S.sessions.find(s => s.fullTest === f.id && s.task === id); return x ? shown(x) + (x.task === "dsm" ? " ms" : "") : "–"; };
    return `<div class="tscroll"><table><tr><th>Task</th>${fulls.map(f => `<th>#${f.n}<br><span class="small">${new Date(f.started).toLocaleDateString()}</span></th>`).join("")}</tr>${ids.map(id => `<tr><td>${esc(tasksAll[id].name)}</td>${fulls.map(f => `<td>${cell(f, id)}</td>`).join("")}</tr>`).join("")}${fulls.some(f => fullScores(f).length) ? `<tr><td><b>Open-norms estimate</b></td>${fulls.map(f => { const c = NM.composite(fullScores(f)); return `<td>${c ? `<b>${c.lowerBound ? "≥" : ""}${fmt(c.iq)}</b><br><span class="small muted">${fmt(c.lo)}–${fmt(c.hi)}</span>` : "–"}</td>`; }).join("")}</tr>` : ""}<tr><td class="muted small">Practice before (hours)</td>${fulls.map(f => `<td class="small muted">${(practiceMinutesBefore(f.started) / 60).toFixed(1)}</td>`).join("")}</tr></table></div>`;
  }
  const practiceMinutesBefore = when => Math.round(S.sessions.filter(s => s.mode !== "test" && s.started < when).reduce((m, s) => m + (new Date(s.ended) - new Date(s.started)), 0) / 60000);

  /* ---------- progress over time ---------- */
  function lineChart(points, opts) {
    // one series: standard-test raw scores over time; dots carry a native tooltip
    const W = 640, H = 170, L = 38, R = 12, T0 = 12, B = 26;
    if (!points.length) return "";
    const xs = points.map(p => p.t), ys = points.map(p => p.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs) === x0 ? x0 + 864e5 : Math.max(...xs);
    const ymax = Math.max(opts.max || 0, ...ys) || 1, ymin = Math.min(opts.min || 0, ...ys);
    const X = t => L + (t - x0) / (x1 - x0) * (W - L - R), Y = v => T0 + (1 - (v - ymin) / (ymax - ymin)) * (H - T0 - B);
    const ticks = [ymin, (ymin + ymax) / 2, ymax].map(v => Math.round(v));
    const path = points.map((p, i) => `${i ? "L" : "M"}${X(p.t).toFixed(1)},${Y(p.y).toFixed(1)}`).join("");
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label)}">
      ${ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${v}</text>`).join("")}
      <text x="${L}" y="${H - 6}" font-size="11" fill="var(--muted)">${new Date(x0).toLocaleDateString()}</text><text x="${W - R}" y="${H - 6}" font-size="11" fill="var(--muted)" text-anchor="end">${new Date(x1).toLocaleDateString()}</text>
      <path d="${path}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>
      ${points.map(p => `<g><circle cx="${X(p.t)}" cy="${Y(p.y)}" r="${p.full ? 5 : 4}" fill="${p.full ? "var(--accent)" : "var(--surface)"}" stroke="var(--accent)" stroke-width="2"/><circle cx="${X(p.t)}" cy="${Y(p.y)}" r="12" fill="transparent"><title>${esc(p.tip)}</title></circle></g>`).join("")}
    </svg>`;
  }
  function progressPage() {
    nav("progress");
    const tasksAll = Object.assign({}, T, C.verbal || {});
    const tests = S.sessions.filter(s => s.mode === "test" && typeof s.result.raw === "number");
    const prac = S.sessions.filter(s => s.mode !== "test");
    const mins = Math.round(prac.reduce((m, s) => m + (new Date(s.ended) - new Date(s.started)), 0) / 60000);
    const fulls = fullTests();
    // practice minutes per week, last 12 weeks
    const wk = 7 * 864e5, now = Date.now();
    const weeks = Array.from({ length: 12 }, (_, i) => prac.filter(s => { const a = now - (12 - i) * wk, t = +new Date(s.started); return t >= a && t < a + wk; }).reduce((m, s) => m + (new Date(s.ended) - new Date(s.started)) / 60000, 0));
    const wmax = Math.max(30, ...weeks);
    const bars = `<svg class="spark" viewBox="0 0 640 120" role="img" aria-label="Practice minutes per week, last 12 weeks">${weeks.map((m, i) => { const h = m / wmax * 90; return `<rect x="${40 + i * 50}" y="${100 - h}" width="34" height="${Math.max(h, 0)}" rx="4" fill="var(--accent)"><title>${Math.round(m)} min</title></rect>`; }).join("")}<line x1="36" x2="636" y1="100" y2="100" stroke="var(--line)"/><text x="40" y="116" font-size="11" fill="var(--muted)">12 weeks ago</text><text x="636" y="116" font-size="11" fill="var(--muted)" text-anchor="end">this week</text><text x="32" y="14" font-size="11" fill="var(--muted)" text-anchor="end">${Math.round(wmax)}</text></svg>`;
    const ids = ORDER.filter(id => tests.some(s => s.task === id));
    app.innerHTML = `<div class="wrap"><h1>My progress</h1>
      <dl class="kv"><dt>Full tests</dt><dd>${fulls.length}</dd><dt>Standard tests</dt><dd>${tests.length}</dd><dt>Practice</dt><dd>${prac.length} sessions, ${(mins / 60).toFixed(1)} hours</dd></dl>
      <div class="btns"><a class="btn go" href="#/full">Take a full test</a><a class="btn" href="#/data">Export my data</a></div>
      ${(() => {
        const now = latestScores(), c = NM.composite(now);
        const occ = fulls.map(f => ({ f, c: NM.composite(fullScores(f)) })).filter(o => o.c);
        const pts = occ.map(o => ({ t: +new Date(o.f.started), y: Math.round(o.c.iq), full: true, tip: `Full test ${o.f.n}, ${new Date(o.f.started).toLocaleDateString()}: ${fmt(o.c.iq)} (${fmt(o.c.lo)} to ${fmt(o.c.hi)}), ${(practiceMinutesBefore(o.f.started) / 60).toFixed(1)} h practice before` }));
        return c ? `<h2>IQ-scale estimate</h2>${estimateCard(c, now, "Your latest standard test of each normed task")}${pts.length > 1 ? `<div class="card"><b>Estimate over full tests</b>${lineChart(pts, { label: "Open-norms estimate over full tests", min: 70, max: 145 })}</div>` : ""}`
          : `<h2>IQ-scale estimate</h2><p class="muted">Take the <a href="#/full">Open-norms estimate</a> full test (Digits Forward, Digits Backward, Digit Symbol Matching, about 10 minutes) to get one.</p>`;
      })()}
      <h2>Practice per week</h2>${bars}
      ${fulls.length ? `<h2>Full tests</h2>${fullTable(fulls)}` : ""}
      <h2>Standard test scores by task</h2>
      ${ids.length ? "" : `<p class="muted">No standard tests yet. Take a full test, or a standard test from any task page.</p>`}
      ${ids.map(id => {
        const t = tasksAll[id], xs = tests.filter(s => s.task === id).sort((a, b) => a.started < b.started ? -1 : 1);
        const first = shown(xs[0]), last = shown(xs[xs.length - 1]);
        const pts = xs.map(s => ({ t: +new Date(s.started), y: shown(s), full: !!s.fullTest, tip: `${new Date(s.started).toLocaleDateString()}: ${shown(s)}${id === "dsm" ? " ms (lower is better)" : s.result.max ? " / " + s.result.max : ""}${s.fullTest ? " (full test)" : ""}${s.practiceBefore ? `, after ${s.practiceBefore.sessions} practice sessions` : ""}` }));
        return `<div class="card"><b>${esc(t.name)}</b> <span class="small muted">${xs.length} test${xs.length > 1 ? "s" : ""} · first ${first}, latest ${last}${xs.length > 1 ? ` (${last - first >= 0 ? "+" : ""}${last - first})` : ""}</span>${id === "dsm" ? `<span class="small muted"> · median correct time in ms, lower is better</span>` : ""}${lineChart(pts, { label: t.name + " scores over time", max: id === "dsm" ? 0 : xs[0].result.max })}</div>`;
      }).join("")}
      <p class="small muted">Filled dots are full tests, open dots single standard tests. Each test uses new items, so some up and down from form to form is expected; look at the trend over several tests. Gains on the tasks you practise are mostly practice effects (see <a href="#/method#practice">Method</a>).</p></div>`;
  }

  function trialsCsv(sessions) {
    const q = v => { const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const out = [["session", "full_test", "task", "mode", "form", "started", "practice_before_min", "device", "age", "trial", "level", "try", "correct", "points", "rt_ms", "timed_out", "response", "answer"].join(",")];
    for (const s of sessions) (s.result.items || []).forEach((x, i) => out.push([s.id, s.fullTest, s.task, s.mode, s.form, s.started, s.practiceBefore ? s.practiceBefore.minutes : "", s.device, s.age, i + 1, x.level, x.trial, x.correct === undefined ? x.ok : x.correct, x.points, x.rt, x.timedOut, x.response, x.answer].map(q).join(",")));
    return out.join("\n");
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function dataPage() {
    nav("data");
    const tasksAll = Object.assign({}, T, C.verbal || {});
    app.innerHTML = `<div class="wrap"><h1>My data</h1><p class="muted">${S.sessions.length} sessions saved in this browser.</p>
      <div class="btns"><button class="btn" type="button" id="exj">Export everything (JSON)</button><button class="btn" type="button" id="exc">Export trials (CSV)</button><label class="btn quiet" for="imp">Import JSON</label><input type="file" id="imp" accept="application/json" hidden><button class="btn quiet" type="button" id="clr">Delete all data</button></div>
      <div class="tscroll"><table><tr><th>When</th><th>Task</th><th>Mode</th><th></th><th>Raw</th></tr>${S.sessions.slice().reverse().slice(0, 200).map(s => `<tr><td class="small">${new Date(s.started).toLocaleString()}</td><td>${esc(tasksAll[s.task] ? tasksAll[s.task].name : s.task)}</td><td>${s.mode === "test" ? "standard " + s.form : "practice"}</td><td>${s.fullTest ? `<span class="pill">full test</span>` : ""}</td><td>${s.result.raw}</td></tr>`).join("")}</table></div></div>`;
    $("#exj").onclick = () => download("iq-practice-data.json", JSON.stringify({ exported: new Date().toISOString(), app: "iq-practice", version: 1, data: S }, null, 1), "application/json");
    $("#exc").onclick = () => download("iq-practice-trials.csv", trialsCsv(S.sessions), "text/csv");
    $("#clr").onclick = () => { if (confirm("Delete every session in this browser? Export first if you need it.")) { S = Object.assign(fresh(), { prefs: S.prefs }); save(); dataPage(); } };
    $("#imp").onchange = e => { const f = e.target.files[0]; if (!f) return; f.text().then(txt => { try { const d = JSON.parse(txt); const sess = d.data ? d.data.sessions : d.sessions; const have = new Set(S.sessions.map(s => s.id)); sess.forEach(s => { if (!have.has(s.id)) S.sessions.push(s); }); save(); dataPage(); } catch (err) { alert("That file is not an export from this page."); } }); };
  }

  function settingsPage() {
    nav("settings");
    const P = S.prefs;
    app.innerHTML = `<div class="wrap"><h1>Settings</h1>
      <div class="card">
      <label class="chk"><input type="checkbox" id="audio" ${P.audio ? "checked" : ""}> <span><b>Read digits and letters aloud</b> while they show. The real span tasks are spoken by the examiner, one item per second. ${U.speakOK() ? "" : "<i>(not supported in this browser)</i>"}</span></label>
      <label class="chk"><input type="checkbox" id="arithListen" ${P.arithListen ? "checked" : ""}> <span><b>Arithmetic by ear:</b> the problem is read aloud and not shown, closer to the real subtest.</span></label>
      <label class="chk"><input type="checkbox" id="practiceTimed" ${P.practiceTimed ? "checked" : ""}> <span><b>Hard time limits in practice</b> (otherwise practice only shows the clock).</span></label>
      <label class="f" for="age">Your age in years (for the open-norms estimate)</label><input id="age" type="number" min="16" max="99" inputmode="numeric" value="${P.age || ""}" style="max-width:120px">
      <label class="f" for="pn">Items per practice session</label><select id="pn">${[8, 12, 20, 30].map(n => `<option ${+(P.practiceN || 12) === n ? "selected" : ""}>${n}</option>`).join("")}</select>
      </div><p class="small muted">Keep the same settings from test to test; they are saved with each session.</p></div>`;
    ["audio", "arithListen", "practiceTimed"].forEach(k => $("#" + k).onchange = e => { P[k] = e.target.checked; save(); });
    $("#pn").onchange = e => { P.practiceN = +e.target.value; save(); };
    $("#age").onchange = e => { const a = Math.round(+e.target.value); P.age = a >= 16 && a <= 99 ? a : null; save(); };
  }

  function methodPage(anchor) {
    nav("method");
    app.innerHTML = `<div class="wrap method">${C.method}</div>`;
    if (anchor) { const el = document.getElementById(anchor); if (el) el.scrollIntoView(); } else scrollTo(0, 0);
  }

  /* ---------- router ---------- */
  function route() {
    const h = (location.hash || "#/").slice(1);
    const [path, anchor] = h.split("#");
    const parts = path.split("/").filter(Boolean);
    document.body.classList.remove("testing");
    if (!parts.length) home();
    else if (parts[0] === "task") taskPage(parts[1]);
    else if (parts[0] === "run") { scrollTo(0, 0); runTask(parts[1], parts[2] === "test" ? "test" : "practice", /^[\w-]+$/.test(parts[3] || "") ? parts[3] : null); }
    else if (parts[0] === "full") fullPage();
    else if (parts[0] === "progress") progressPage();
    else if (parts[0] === "data") dataPage();
    else if (parts[0] === "settings") settingsPage();
    else if (parts[0] === "method") methodPage(anchor);
    else home();
    if (parts[0] !== "method" && parts[0] !== "run") scrollTo(0, 0);
  }
  addEventListener("hashchange", route);
  route();
  window.IQAPP = { state: () => S };
})();
