/* Cognitive test practice: router, practice and test runners, study mode, data export.
   All data stays in this browser (localStorage) until the person exports it. */
(function () {
  "use strict";
  const G = window.IQGEN, T = window.IQTASKS, C = window.IQCONTENT, U = window.IQUI;
  const { esc, $, $$, sleep } = U;
  const KEY = "iqPractice.v1";
  const app = $("#app");

  /* ---------- storage ---------- */
  const load = () => { try { return Object.assign({ sessions: [], study: null, prefs: {}, levels: {} }, JSON.parse(localStorage.getItem(KEY)) || {}); } catch (e) { return { sessions: [], study: null, prefs: {}, levels: {} }; } };
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage full or blocked: data lives until the tab closes */ } };
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  const INDEXES = [
    { id: "fluid", name: "Fluid reasoning", note: "Solve new problems from rules you work out on the spot." },
    { id: "spatial", name: "Visual spatial", note: "Picture, turn and put together shapes in your head." },
    { id: "memory", name: "Working memory", note: "Hold information and work with it at the same time." },
    { id: "speed", name: "Processing speed", note: "Simple visual decisions, done quickly and accurately." },
    { id: "verbal", name: "Verbal comprehension", note: "Word knowledge and verbal reasoning; scored by an examiner in the real tests." },
    { id: "control", name: "Control activity", note: "" },
  ];
  const ORDER = ["matrix", "weights", "series", "puzzle", "blocks", "dsf", "dsb", "dss", "lns", "running", "symspan", "spatialadd", "arith", "coding", "symsearch", "nsq", "similar", "vocab", "vsearch"];
  const FORMS = ["A", "B", "C", "D"];
  // four sessions, four forms; the order is one row of a Latin square, picked from the participant code
  const PHASES = [["baseline-1", "Baseline 1"], ["baseline-2", "Baseline 2"], ["post", "Post-test"], ["follow-up", "Follow-up"]];
  const SQUARE = ["ABCD", "BCDA", "CDAB", "DABC"];

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
      let longest = 0;
      for (let len = A.min; len <= A.max && !quit; len++) {
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
      return { items, raw: items.filter(x => x.correct).length, max: (A.max - A.min + 1) * A.trials, longest };
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
    return { items: log, raw: res.points, right: res.correct, wrong: res.wrong, seconds, medianRt: rts.length ? rts[Math.floor(rts.length / 2)] : null };
  }

  async function runTask(id, mode, form) {
    const task = T[id] || (C.verbal && C.verbal[id]);
    if (!task) return home();
    document.body.classList.add("testing");
    app.innerHTML = stageHtml(task, mode);
    const study = mode === "test" && S.study && S.study.active ? S.study : null;
    const started = new Date().toISOString();
    const runner = task.admin.kind === "ladder" ? runLadder : task.admin.kind === "span" ? runSpan : task.admin.kind === "speed" ? runSpeed : task.run;
    const out = await runner(task, mode, form || "A", +(S.prefs.practiceN || 12));
    document.body.classList.remove("testing");
    if (!out) return;
    const sess = { id: uid(), task: id, mode, form: mode === "test" ? form || "A" : null, started, ended: new Date().toISOString(), pid: study ? study.pid : (S.study ? S.study.pid : null), phase: study ? study.phase : (S.study && S.study.pid ? (S.study.group === "active-control" ? "control-activity" : "training") : null), prefs: { audio: !!S.prefs.audio, arithListen: !!S.prefs.arithListen }, result: out };
    S.sessions.push(sess); save();
    if (study) return studyNext();
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
      <div class="note warn"><b>This is not an IQ test.</b> It gives raw scores only. Real IQ scores come from a trained examiner giving a standardized test and comparing you with a large norm sample. Training on these formats will raise practice scores, and part of that carries over to real tests as a practice effect, not a change in ability. The <a href="#/method">Method</a> page explains what the research says, which matters for any before/after study.</div>
      <div class="btns"><a class="btn go" href="#/study">Study mode (before / after)</a><a class="btn" href="#/method">Method &amp; evidence</a><a class="btn" href="#/data">My data</a><a class="btn quiet" href="#/settings">Settings</a></div>
      ${INDEXES.filter(ix => ix.id !== "control").map(ix => `<div class="idx"><h2>${ix.name}</h2><span>${ix.note}</span></div><div class="grid2">${ORDER.filter(id => all[id] && all[id].index === ix.id).map(id => { const t = all[id], st = taskStats(id); return `<a class="task" href="#/task/${id}"><span class="tag">${esc(t.tag || "")}</span><b>${esc(t.name)}</b><p>${esc(t.short)}</p><div class="stat">${st.n ? `${st.prac.length} practice · ${st.tests.length} standard${st.last ? ` · last raw ${st.last.result.raw}` : ""}` : "not tried yet"}</div></a>`; }).join("")}</div>`).join("")}
      <p class="small">Study control group activity: <a href="#/task/vsearch">visual search</a>.</p><p class="foot">Hidden page: not linked from the deck sites. Data stays in this browser until you export it.</p></div>`;
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
      : A.kind === "speed" ? `${A.seconds} seconds; score is the number done right${id === "symsearch" ? " minus the number done wrong" : ""}.` : (A.text || "");
    app.innerHTML = `<div class="wrap">
      <p class="small"><a href="#/">← All tasks</a></p>
      <h1>${esc(t.name)}</h1>
      <p class="muted">${esc(t.models)}</p>
      ${info.what ? `<h2>What the real subtest asks</h2><p>${info.what}</p>` : ""}
      ${info.admin ? `<h2>How it is given</h2><p>${info.admin}</p>` : ""}
      <div class="card"><b>Rules on this page</b><p class="small" style="margin:6px 0 0">${esc(rule)}</p>${info.differs ? `<p class="small muted" style="margin:6px 0 0"><b>How this version differs:</b> ${info.differs}</p>` : ""}</div>
      <div class="btns"><a class="btn go" href="#/run/${id}/practice">Practice with feedback</a>${A.kind !== "self" ? `<a class="btn" href="#/run/${id}/test/A">Standard rules · form A</a><a class="btn" href="#/run/${id}/test/B">Form B</a><a class="btn quiet" href="#/run/${id}/test/C">C</a><a class="btn quiet" href="#/run/${id}/test/D">D</a>` : ""}</div>
      ${info.strategy ? `<h2>How skilled test takers approach it</h2>${info.strategy}` : ""}
      ${info.trains ? `<h2>What practice changes</h2><p>${info.trains}</p>` : ""}
      ${st.n ? `<h2>Your history</h2>${historyTable(st)}` : ""}
    </div>`;
  }

  function historyTable(st) {
    const rows = st.tests.concat(st.prac).sort((a, b) => a.started < b.started ? -1 : 1);
    return `<div class="tscroll"><table><tr><th>When</th><th>Mode</th><th>Raw</th><th>Detail</th></tr>${rows.slice(-20).reverse().map(s => `<tr><td>${new Date(s.started).toLocaleString()}</td><td>${s.mode === "test" ? `standard <span class="pill a">form ${s.form}</span>` : "practice"}${s.phase ? ` <span class="pill">${esc(s.phase)}</span>` : ""}</td><td>${s.result.raw}${s.result.max ? ` / ${s.result.max}` : ""}</td><td class="small">${detail(s)}</td></tr>`).join("")}</table></div>`;
  }
  const detail = s => { const r = s.result; return r.longest !== undefined ? `longest ${r.longest}` : r.seconds ? `${r.right} right, ${r.wrong} wrong${r.medianRt ? `, median ${r.medianRt} ms` : ""}` : r.levelEnd ? `ended at level ${r.levelEnd}` : r.items ? `${r.items.length} items${r.stoppedEarly ? ", stop rule reached" : ""}` : ""; };

  function showResult(s) {
    const t = T[s.task] || C.verbal[s.task];
    const r = s.result;
    const prev = S.sessions.filter(x => x.task === s.task && x.mode === s.mode && x.id !== s.id);
    const last = prev[prev.length - 1];
    app.innerHTML = `<div class="wrap"><p class="small"><a href="#/task/${s.task}">← ${esc(t.name)}</a></p>
      <h1>${s.mode === "test" ? "Raw score" : "Practice done"}</h1>
      <div class="result-big">${r.raw}${r.max ? `<span class="muted" style="font-size:1rem"> / ${r.max}</span>` : ""}</div>
      <p class="muted">${detail(s)}${last ? ` · previous: ${last.result.raw}` : ""}</p>
      ${s.mode === "test" ? `<div class="note small">A raw score is not an IQ or a scaled score. Real scaled scores need the publisher's norm tables for your age group, which are not public. Use raw scores to compare yourself with yourself, on different forms.</div>` : ""}
      ${r.items && r.items.length && r.items[0].level !== undefined ? `<div class="tscroll"><table><tr><th>#</th><th>Level</th><th>Result</th><th>Time</th></tr>${r.items.map((x, i) => `<tr><td>${i + 1}</td><td>${x.level}${x.trial ? `.${x.trial}` : ""}</td><td>${x.correct ? "✓" : x.timedOut ? "time" : "✗"}${x.points > 1 ? ` (${x.points} pts)` : ""}</td><td>${(x.rt / 1000).toFixed(1)} s</td></tr>`).join("")}</table></div>` : ""}
      <div class="btns"><a class="btn go" href="#/task/${s.task}">Back to the task</a><a class="btn" href="#/">All tasks</a></div></div>`;
  }

  /* ---------- study mode: before / after with parallel forms ---------- */
  const BATTERY = ["matrix", "weights", "puzzle", "blocks", "dsf", "dsb", "dss", "arith", "coding", "symsearch"];
  function studyPage() {
    nav("study");
    const st = S.study;
    const tasksAll = Object.assign({}, T, C.verbal || {});
    if (!st || !st.pid) {
      app.innerHTML = `<div class="wrap"><h1>Study mode</h1>
        <p>For a before/after design. It gives a fixed battery under standard rules on one form before training and a parallel form after, logs every training session with its date and length, and exports trial-level data for analysis.</p>
        <div class="note warn small">Read the <a href="#/method#design">study design notes</a> first. Without a control group that also retests, a before/after gain mostly measures the practice effect, which is expected even with no training at all.</div>
        <div class="card">
          <label class="f" for="pid">Participant code (no names)</label><input type="text" id="pid" placeholder="e.g. P07" autocomplete="off">
          <label class="f" for="grp">Group</label><select id="grp"><option value="training">Training (practises on this site)</option><option value="active-control">Active control (other task of equal time)</option><option value="retest-control">Retest-only control (no training)</option></select>
          <label class="f" for="ord">Form order</label><select id="ord"><option value="auto">Counterbalanced from the code (Latin square)</option>${SQUARE.map(o => `<option value="${o}">${o.split("").join(" → ")}</option>`).join("")}</select>
          <p class="f">Battery (standard rules, in this order)</p>
          ${ORDER.filter(id => tasksAll[id] && tasksAll[id].admin.kind !== "self").map(id => `<label class="chk"><input type="checkbox" value="${id}" ${BATTERY.includes(id) ? "checked" : ""}> <span>${esc(tasksAll[id].name)}</span></label>`).join("")}
          <div class="btns"><button class="btn go" type="button" id="mk">Create participant</button></div>
        </div></div>`;
      $("#mk").onclick = () => {
        const pid = $("#pid").value.trim();
        if (!pid) { $("#pid").focus(); return; }
        let ord = $("#ord").value;
        if (ord === "auto") ord = SQUARE[G.hash(pid) % 4];
        S.study = { pid, group: $("#grp").value, order: ord, battery: $$("input[type=checkbox]:checked", app).map(x => x.value), phase: null, created: new Date().toISOString(), active: false, queue: [] };
        save(); studyPage();
      };
      return;
    }
    if (st.order.length < 4) st.order = SQUARE.find(o => o.startsWith(st.order)) || SQUARE[0];
    const mine = S.sessions.filter(s => s.pid === st.pid);
    const done = ph => mine.filter(s => s.phase === ph);
    const firstTest = mine.filter(s => s.mode === "test").map(s => s.started).sort()[0];
    const train = mine.filter(s => s.mode !== "test" && (!firstTest || s.started > firstTest));
    const mins = Math.round(train.reduce((m, s) => m + (new Date(s.ended) - new Date(s.started)), 0) / 60000);
    const raw = (ph, id) => { const x = done(ph).filter(s => s.task === id).pop(); return x ? x.result.raw : null; };
    const next = PHASES.findIndex(([ph]) => !done(ph).length);
    const row = id => { const t = tasksAll[id]; const v = PHASES.map(([ph]) => raw(ph, id)); const ch = v[1] !== null && v[2] !== null && typeof v[1] === "number" ? v[2] - v[1] : null; return `<tr><td>${esc(t ? t.name : id)}</td>${v.map(x => `<td>${x === null ? "–" : x}</td>`).join("")}<td>${ch === null ? "" : (ch > 0 ? "+" : "") + ch}</td></tr>`; };
    app.innerHTML = `<div class="wrap"><h1>Participant ${esc(st.pid)}</h1>
      <dl class="kv"><dt>Group</dt><dd>${esc(st.group)}</dd><dt>Forms</dt><dd>${PHASES.map(([, nm], i) => `${nm}: ${st.order[i]}`).join(" · ")}</dd><dt>Battery</dt><dd>${st.battery.map(id => esc(tasksAll[id] ? tasksAll[id].name : id)).join(", ")}</dd><dt>${st.group === "active-control" ? "Control activity" : "Training"} logged</dt><dd>${train.length} sessions, about ${mins} minutes</dd></dl>
      <div class="btns">${PHASES.map(([ph, nm], i) => `<button class="btn ${i === next ? "go" : "quiet"}" type="button" data-ph="${ph}" data-i="${i}" ${i > next && next >= 0 ? "disabled" : ""}>${done(ph).length ? "Redo " : ""}${nm} (form ${st.order[i]})</button>`).join("")}</div>
      <p class="small muted">Suggested schedule: baseline 1 a week before training, baseline 2 just before it, the post-test right after training, the follow-up about 6 months later. Give each battery in one sitting, at the same time of day, on the same device and with the same settings.</p>
      ${st.group === "active-control" ? `<div class="note small">Active control: do the <a href="#/run/vsearch/practice">visual search activity</a> on the same schedule and for the same minutes as the training group. It is logged here.</div>` : st.group === "retest-control" ? `<div class="note small">Retest-only control: no practice between tests.</div>` : `<div class="note small">Training: practise the tasks from the <a href="#/">task list</a>; each session is logged here.</div>`}
      <h2>Raw scores</h2><div class="tscroll"><table><tr><th>Task</th>${PHASES.map(([, nm]) => `<th>${nm}</th>`).join("")}<th>Post − B2</th></tr>${st.battery.map(row).join("")}</table></div>
      <div class="btns"><button class="btn" type="button" id="exj">Export JSON</button><button class="btn" type="button" id="exc">Export trials CSV</button><button class="btn quiet" type="button" id="new">New participant</button></div>
      <p class="small muted">Practice sessions done while this participant is open are logged to them.</p></div>`;
    $$("[data-ph]").forEach(b => b.onclick = () => {
      const ph = b.dataset.ph, form = st.order[+b.dataset.i];
      if (!confirm(`Start the ${ph} battery on form ${form}? It has ${st.battery.length} tasks and takes roughly ${Math.round(st.battery.length * 4)} minutes.`)) return;
      Object.assign(st, { active: true, phase: ph, form, queue: st.battery.slice() });
      save(); studyNext();
    });
    $("#exj").onclick = () => download(`study-${st.pid}.json`, JSON.stringify({ exported: new Date().toISOString(), app: "iq-practice", version: 1, study: st, sessions: S.sessions.filter(s => s.pid === st.pid) }, null, 1), "application/json");
    $("#exc").onclick = () => download(`trials-${st.pid}.csv`, trialsCsv(S.sessions.filter(s => s.pid === st.pid)), "text/csv");
    $("#new").onclick = () => { if (confirm("Close this participant? Their data stays in My data.")) { S.study = null; save(); studyPage(); } };
  }
  async function studyNext() {
    const st = S.study;
    if (!st.queue.length) { st.active = false; save(); location.hash = "#/study"; studyPage(); return; }
    const id = st.queue.shift(); save();
    const t = T[id] || C.verbal[id];
    app.innerHTML = `<div class="wrap"><h1>${esc(t.name)}</h1><p class="muted">${st.phase} battery · form ${st.form} · ${st.battery.length - st.queue.length} of ${st.battery.length}</p><p>${esc(t.short)}</p><div class="btns"><button class="btn go" type="button" id="go">Begin</button><button class="btn quiet" type="button" id="skip">Skip this task</button><button class="btn quiet" type="button" id="stop">Stop the battery</button></div></div>`;
    $("#go").onclick = () => runTask(id, "test", st.form);
    $("#skip").onclick = () => studyNext();
    $("#stop").onclick = () => { st.active = false; st.queue = []; save(); studyPage(); };
  }
  function trialsCsv(sessions) {
    const q = v => { const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    const out = [["pid", "phase", "session", "task", "mode", "form", "started", "trial", "level", "try", "correct", "points", "rt_ms", "timed_out", "response", "answer"].join(",")];
    for (const s of sessions) (s.result.items || []).forEach((x, i) => out.push([s.pid, s.phase, s.id, s.task, s.mode, s.form, s.started, i + 1, x.level, x.trial, x.correct === undefined ? x.ok : x.correct, x.points, x.rt, x.timedOut, x.response, x.answer].map(q).join(",")));
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
      <div class="tscroll"><table><tr><th>When</th><th>Task</th><th>Mode</th><th>Participant</th><th>Raw</th></tr>${S.sessions.slice().reverse().slice(0, 200).map(s => `<tr><td class="small">${new Date(s.started).toLocaleString()}</td><td>${esc(tasksAll[s.task] ? tasksAll[s.task].name : s.task)}</td><td>${s.mode === "test" ? "standard " + s.form : "practice"}</td><td>${esc(s.pid || "")} ${s.phase ? `<span class="pill">${esc(s.phase)}</span>` : ""}</td><td>${s.result.raw}</td></tr>`).join("")}</table></div></div>`;
    $("#exj").onclick = () => download("iq-practice-data.json", JSON.stringify({ exported: new Date().toISOString(), app: "iq-practice", version: 1, data: S }, null, 1), "application/json");
    $("#exc").onclick = () => download("iq-practice-trials.csv", trialsCsv(S.sessions), "text/csv");
    $("#clr").onclick = () => { if (confirm("Delete every session in this browser? Export first if you need it.")) { S = { sessions: [], study: null, prefs: S.prefs, levels: {} }; save(); dataPage(); } };
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
      <label class="f" for="pn">Items per practice session</label><select id="pn">${[8, 12, 20, 30].map(n => `<option ${+(P.practiceN || 12) === n ? "selected" : ""}>${n}</option>`).join("")}</select>
      </div><p class="small muted">For a study, keep the same settings for the pre-test and the post-test; they are saved with each session.</p></div>`;
    ["audio", "arithListen", "practiceTimed"].forEach(k => $("#" + k).onchange = e => { P[k] = e.target.checked; save(); });
    $("#pn").onchange = e => { P.practiceN = +e.target.value; save(); };
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
    else if (parts[0] === "run") { scrollTo(0, 0); runTask(parts[1], parts[2] === "test" ? "test" : "practice", FORMS.includes(parts[3]) ? parts[3] : "A"); }
    else if (parts[0] === "study") studyPage();
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
