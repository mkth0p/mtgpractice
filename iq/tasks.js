/* Cognitive test practice: the tasks. Each task says what real subtest format it follows, how
   that subtest is given (time limits, start and stop rules) and how to draw and score one item.
   The facts about the real batteries are in research/ and on the Method page, with sources. */
(function () {
  "use strict";
  const G = window.IQGEN;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const speakOK = () => "speechSynthesis" in window;
  function say(text, rate) {
    return new Promise(res => {
      if (!speakOK()) return res();
      const u = new SpeechSynthesisUtterance(String(text));
      u.rate = rate || 1; u.lang = "en-US";
      let done = false; const fin = () => { if (!done) { done = true; res(); } };
      u.onend = fin; u.onerror = fin; setTimeout(fin, 4000 + String(text).length * 90);
      speechSynthesis.speak(u);
    });
  }

  /* A choice grid: resolves with the chosen index. */
  function choiceGrid(host, svgs, cls, onPick) {
    host.innerHTML = `<div class="choices ${cls || ""}">${svgs.map((s, i) => `<button type="button" class="choice${/^</.test(s) ? "" : " txt"}" data-i="${i}" aria-label="Choice ${i + 1}"><span class="n">${i + 1}</span>${s}</button>`).join("")}</div>`;
    $$(".choice", host).forEach(b => b.onclick = () => onPick(+b.dataset.i, b));
  }
  const mark = (host, correct, picked) => {
    $$(".choice", host).forEach((b, i) => { b.disabled = true; if (i === correct) b.classList.add("right"); else if (i === picked) b.classList.add("wrong"); });
  };

  /* ---------- drawing helpers ---------- */
  function weightSide(ms, x0, y, cell) {
    let s = "";
    ms.forEach((k, i) => {
      const K = G.WEIGHT_KINDS[k], cx = x0 + (i % 3) * cell + cell / 2, cy = y - cell / 2 - Math.floor(i / 3) * cell, rad = cell * 0.4;
      if (K.shape === 4) s += `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${K.col}" stroke="#111" stroke-width="1.5"/>`;
      else { const n = [3, 4, 5, 6][K.shape], pts = []; for (let j = 0; j < n; j++) { const t = (-90 + (n === 4 ? 45 : 0) + j * 360 / n) * Math.PI / 180; pts.push((cx + rad * 1.1 * Math.cos(t)).toFixed(1) + "," + (cy + rad * 1.1 * Math.sin(t)).toFixed(1)); } s += `<polygon points="${pts.join(" ")}" fill="${K.col}" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/>`; }
    });
    return s;
  }
  const label = ms => ms.map(k => G.WEIGHT_KINDS[k].name).join(", ");
  function scaleSvg(left, right, q) {
    const cell = 26, W = 340, panW = 3 * cell + 12, H = 40 + cell * Math.max(Math.ceil(left.length / 3), Math.ceil((right || []).length / 3), 1);
    const yPan = H - 26;
    let s = `<svg viewBox="0 0 ${W} ${H + 6}" role="img" aria-label="${esc(label(left))} balance ${right ? esc(label(right)) : "an empty pan"}">`;
    s += `<rect width="${W}" height="${H + 6}" fill="#fff"/>`;
    s += `<line x1="40" y1="${yPan}" x2="${W - 40}" y2="${yPan}" stroke="#333" stroke-width="3"/>`;
    s += `<polygon points="${W / 2 - 14},${H + 4} ${W / 2 + 14},${H + 4} ${W / 2},${yPan}" fill="#333"/>`;
    s += `<rect x="${40}" y="${yPan - 4}" width="${panW}" height="5" fill="#333"/><rect x="${W - 40 - panW}" y="${yPan - 4}" width="${panW}" height="5" fill="#333"/>`;
    s += weightSide(left, 46, yPan - 5, cell);
    if (right) s += weightSide(right, W - 34 - panW, yPan - 5, cell);
    else s += `<text x="${W - 40 - panW / 2}" y="${yPan - 14}" text-anchor="middle" font-size="26" font-family="system-ui" fill="#999">?</text>`;
    return s + "</svg>";
  }
  function optionSvg(ms) {
    const cell = 26, n = ms.length, cols = Math.min(3, n), rows = Math.ceil(n / 3), W = cols * cell + 10, H = rows * cell + 10;
    return `<svg viewBox="0 0 ${Math.max(W, 60)} ${Math.max(H, 40)}" role="img" aria-label="${esc(label(ms))}"><rect width="100%" height="100%" fill="#fff"/>${weightSide(ms, (Math.max(W, 60) - cols * cell) / 2, Math.max(H, 40) - (Math.max(H, 40) - rows * cell) / 2, cell)}</svg>`;
  }
  function blocksSvg(faces, n, size, grid) {
    const s = size / n; let out = `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="pattern">`;
    faces.forEach((f, k) => { out += G.blockFaceSvg(f, s, (k % n) * s, Math.floor(k / n) * s); });
    if (grid) for (let i = 1; i < n; i++) out += `<line x1="${i * s}" y1="0" x2="${i * s}" y2="${size}" stroke="#555" stroke-width="1"/><line x1="0" y1="${i * s}" x2="${size}" y2="${i * s}" stroke="#555" stroke-width="1"/>`;
    return out + "</svg>";
  }
  const faceSvg = f => `<svg viewBox="0 0 40 40">${G.blockFaceSvg(f, 40, 0, 0)}</svg>`;

  /* ---------- a keypad for span answers ---------- */
  function keypad(host, keys, len, onDone, opts) {
    opts = opts || {};
    const typed = [];
    host.innerHTML = `<div class="entry" aria-live="polite"></div><div class="pad${opts.letters ? " letters" : ""}">${keys.map(k => `<button type="button" data-k="${k}">${k}</button>`).join("")}<button type="button" class="wide" data-k="del">Delete</button><button type="button" class="wide go" data-k="ok">Done</button></div>`;
    const show = () => { $(".entry", host).innerHTML = typed.map(t => `<span>${t}</span>`).join("") || `<span class="muted" style="border:0">${opts.hint || "type your answer"}</span>`; };
    show();
    const press = k => {
      if (k === "del") typed.pop();
      else if (k === "ok") { cleanup(); return onDone(typed.slice()); }
      else if (typed.length < (len || 20)) typed.push(k);
      show();
    };
    $$("button", host).forEach(b => b.onclick = () => press(b.dataset.k));
    const onKey = e => { const k = e.key.toUpperCase(); if (keys.map(String).includes(k)) press(k); else if (e.key === "Backspace") press("del"); else if (e.key === "Enter") press("ok"); };
    document.addEventListener("keydown", onKey);
    const cleanup = () => document.removeEventListener("keydown", onKey);
    return { cleanup, typed };
  }
  async function presentSeq(host, seq, prefs) {
    host.innerHTML = `<div class="stim"><div class="seqshow" aria-live="assertive"></div></div>`;
    const box = $(".seqshow", host);
    await sleep(600);
    for (const d of seq) {
      if (host._abort) return;
      box.textContent = d;
      const t0 = Date.now();
      if (prefs.audio && speakOK()) say(d, 1.05);
      // one item per second, as in the Wechsler span tasks
      await sleep(Math.max(0, 750 - (Date.now() - t0)));
      box.textContent = "";
      await sleep(250);
    }
  }

  /* =========================================================================================
     THE TASKS
     admin.kind: "ladder" (items get harder, stop after a run of misses), "span" (lists get longer,
     two or three tries each, stop when every try at a length fails) or "speed" (as many as you can).
     ========================================================================================= */
  const T = {};

  T.matrix = {
    id: "matrix", tag: "WAIS-5 FRI · FSIQ", name: "Matrix Reasoning", index: "fluid", short: "Find the missing piece of a 3 x 3 pattern.",
    models: "Matrix Reasoning (WAIS-5, WAIS-IV, WASI-II) and Raven's Progressive Matrices",
    admin: { kind: "ladder", levels: G.MATRIX_MAX, perLevel: 2, stopAfter: 3, limit: 30, softLimit: true },
    item: (seed, lv) => G.genMatrix(seed, lv),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">Which choice completes the pattern?</p><div class="stim"><div class="mx">${it.cells.map(c => G.matrixCellSvg(c, it.config)).join("")}${G.matrixCellSvg(null, it.config, "missing")}</div></div><div id="ch"></div>`;
      return new Promise(res => {
        ctx.onTimeout(() => res({ response: null, correct: false }));
        choiceGrid($("#ch", host), it.options.map(o => G.matrixCellSvg(o, it.config, "choice").replace('<svg ', '<svg ')), "", i => {
          if (ctx.practice) mark($("#ch", host), it.correct, i);
          res({ response: i, correct: i === it.correct });
        });
      });
    },
    explain: it => it.explain,
  };

  T.weights = {
    id: "weights", tag: "WAIS-5 FRI · FSIQ", name: "Figure Weights", index: "fluid", short: "Keep the last scale level using what the other scales show.",
    models: "Figure Weights (WAIS-5, WAIS-IV)",
    admin: { kind: "ladder", levels: G.WEIGHT_MAX, perLevel: 2, stopAfter: 3, limitFor: lv => lv <= 4 ? 20 : 40 },
    item: (seed, lv) => G.genWeights(seed, lv),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">Which choice keeps the last scale balanced?</p><div class="stim scales">${it.scales.map(([a, b]) => `<div class="scale">${scaleSvg(a, b)}</div>`).join("")}<div class="scale">${scaleSvg(it.question, null)}</div></div><div id="ch" class="fw-opts"></div>`;
      return new Promise(res => {
        ctx.onTimeout(() => res({ response: null, correct: false }));
        choiceGrid($("#ch", host), it.options.map(optionSvg), "five", i => { if (ctx.practice) mark($("#ch", host), it.correct, i); res({ response: i, correct: i === it.correct }); });
      });
    },
    explain: it => it.explain,
  };

  T.series = {
    id: "series", tag: "ICAR style", name: "Number & Letter Series", index: "fluid", short: "What comes next in the sequence?",
    models: "Letter and number series (ICAR, public domain); series items in group ability tests",
    admin: { kind: "ladder", levels: G.SERIES_MAX, perLevel: 2, stopAfter: 4, limit: 60, softLimit: true },
    item: (seed, lv) => G.genSeries(seed, lv),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">What comes next?</p><div class="stim"><div class="seqshow small">${it.shown.join("&ensp;")}&ensp;?</div></div><div id="ch"></div>`;
      return new Promise(res => {
        ctx.onTimeout(() => res({ response: null, correct: false }));
        choiceGrid($("#ch", host), it.options.map(esc), "five", i => { if (ctx.practice) mark($("#ch", host), it.correct, i); res({ response: i, correct: i === it.correct }); });
      });
    },
    explain: it => it.explain,
  };

  T.puzzle = {
    id: "puzzle", tag: "WAIS-5 VSI", name: "Visual Puzzles", index: "spatial", short: "Pick the three pieces that make the shape.",
    models: "Visual Puzzles (WAIS-5, WAIS-IV)",
    admin: { kind: "ladder", levels: G.VP_MAX, perLevel: 3, stopAfter: 3, limitFor: lv => lv <= 2 ? 20 : 30, warnAt: 10 },
    item: (seed, lv) => G.genPuzzle(seed, lv),
    async render(host, it, ctx) {
      // pieces are drawn at the same scale as the figure, as in the real subtest
      const unit = 20, ext = c => Math.max(Math.max(...c.map(x => x[0])), Math.max(...c.map(x => x[1]))) + 1;
      const pbox = Math.max(...it.pieces.map(ext)) * unit + 12;
      host.innerHTML = `<p class="prompt">Pick the three pieces that together make this shape. Pieces may be turned, not flipped.</p><div class="stim"><div class="vp-target" style="max-width:${(6 * unit + 12) * 1.25}px">${G.cellsSvg(it.target, { s: unit, box: 6 * unit + 12, label: "target shape" })}</div><div class="choices six pieces" id="pc">${it.pieces.map((p, i) => `<button type="button" class="choice" data-i="${i}" aria-pressed="false" aria-label="Piece ${i + 1}"><span class="n">${i + 1}</span>${G.cellsSvg(p, { s: unit, box: pbox, fill: "#e8483f", label: "piece" })}</button>`).join("")}</div></div><div class="next"><button type="button" class="btn go" id="ok" disabled>Done</button></div>`;
      const sel = new Set();
      $$("#pc .choice", host).forEach(b => b.onclick = () => {
        const i = +b.dataset.i;
        if (sel.has(i)) sel.delete(i); else if (sel.size < 3) sel.add(i);
        $$("#pc .choice", host).forEach(x => x.setAttribute("aria-pressed", sel.has(+x.dataset.i)));
        $("#ok", host).disabled = sel.size !== 3;
      });
      return new Promise(res => {
        const finish = to => {
          const pick = Array.from(sel).sort((a, b) => a - b), ok = !to && pick.join() === it.correct.join();
          if (ctx.practice) $$("#pc .choice", host).forEach((b, i) => { b.disabled = true; if (it.correct.includes(i)) b.classList.add("right"); else if (sel.has(i)) b.classList.add("wrong"); });
          res({ response: pick, correct: ok });
        };
        ctx.onTimeout(() => finish(true));
        $("#ok", host).onclick = () => finish(false);
      });
    },
    explain: it => it.explain,
  };

  T.blocks = {
    id: "blocks", tag: "WAIS-5 VSI · FSIQ", name: "Block Design (on screen)", index: "spatial", short: "Rebuild a red and white pattern block by block.",
    models: "Block Design (WAIS-5, WAIS-IV, WASI-II), here with on-screen blocks instead of real cubes",
    admin: { kind: "ladder", levels: G.BD_MAX, perLevel: 2, stopAfter: 2, limitFor: lv => G.genBlocks("x", lv).limit, speedBonus: true },
    item: (seed, lv) => G.genBlocks(seed, lv),
    async render(host, it, ctx) {
      const n = it.n, faces = Array(n * n).fill(0);
      let cur = 1;
      const size = n === 2 ? 150 : 210;
      const draw = () => {
        $("#build", host).innerHTML = faces.map((f, k) => `<button type="button" data-k="${k}" aria-label="Block ${k + 1}">${faceSvg(f)}</button>`).join("");
        $$("#build button", host).forEach(b => b.onclick = () => {
          const k = +b.dataset.k;
          // tapping a half block that already shows the chosen face turns it a quarter
          if (faces[k] === cur && cur >= 2) cur = cur === 5 ? 2 : cur + 1;
          faces[k] = cur; draw(); pickDraw();
        });
      };
      host.innerHTML = `<p class="prompt">Make your blocks look like the pattern. Pick a face below, then tap a square. Tap a half block again to turn it.</p><div class="stim"><div class="bdrow"><div><div class="bd" style="width:${size}px">${blocksSvg(it.faces, n, size, it.level <= 4)}</div><p class="small" style="text-align:center;color:#666;margin:6px 0 0">pattern</p></div><div><div class="bd build" id="build" style="width:${size}px;grid-template-columns:repeat(${n},1fr)"></div><p class="small" style="text-align:center;color:#666;margin:6px 0 0">your blocks</p></div></div><div class="facepick" id="fp"></div></div><div class="next"><button type="button" class="btn go" id="ok">Done</button></div>`;
      const pickDraw = () => { $("#fp", host).innerHTML = [0, 1, 2, 3, 4, 5].map(f => `<button type="button" data-f="${f}" aria-pressed="${f === cur}" aria-label="${["white", "red", "half, red top right", "half, red bottom right", "half, red bottom left", "half, red top left"][f]}">${faceSvg(f)}</button>`).join(""); $$("#fp button", host).forEach(b => b.onclick = () => { cur = +b.dataset.f; pickDraw(); }); };
      draw(); pickDraw();
      return new Promise(res => {
        const finish = to => { const ok = !to && faces.every((f, k) => f === it.faces[k]); res({ response: faces.slice(), correct: ok }); };
        ctx.onTimeout(() => finish(true));
        $("#ok", host).onclick = () => finish(false);
      });
    },
    explain: it => it.explain,
  };

  /* --------- working memory (span tasks) --------- */
  function spanTask(id, name, mode, short, models) {
    return {
      id, name, index: "memory", short, models, tag: mode === "sequencing" ? "WAIS-5 WMI · FSIQ" : "WAIS-5 secondary",
      admin: { kind: "span", min: 2, max: mode === "backward" ? 8 : 9, normMax: mode === "forward" ? 12 : mode === "backward" ? 10 : null, trials: 2 },
      item: (seed, len, trial) => G.genSpan(seed, mode, len, trial),
      async render(host, it, ctx) {
        host.innerHTML = `<p class="prompt">${{ forward: "Remember the digits in the same order.", backward: "Remember the digits, then give them in reverse order.", sequencing: "Remember the digits, then give them from smallest to largest." }[mode]}</p><div id="s"></div>`;
        await presentSeq($("#s", host), it.seq, ctx.prefs);
        host.innerHTML = `<p class="prompt">${{ forward: "Type them in the same order.", backward: "Type them backwards.", sequencing: "Type them smallest to largest (repeats included)." }[mode]}</p><div id="k"></div>`;
        return new Promise(res => {
          keypad($("#k", host), [1, 2, 3, 4, 5, 6, 7, 8, 9], it.len, typed => res({ response: typed.join(""), correct: typed.join("") === it.answer.join("") }));
        });
      },
      explain: it => `The list was ${it.seq.join(" ")}; the answer was ${it.answer.join(" ")}.`,
    };
  }
  T.dsf = spanTask("dsf", "Digits Forward", "forward", "Repeat a list of digits in order.", "Digits Forward (WAIS-5; part of Digit Span in the WAIS-IV)");
  T.dsb = spanTask("dsb", "Digits Backward", "backward", "Repeat a list of digits in reverse.", "Digits Backward (WAIS-5; part of Digit Span in the WAIS-IV)");
  T.dss = spanTask("dss", "Digit Sequencing", "sequencing", "Put a list of digits in order, smallest first.", "Digit Sequencing (WAIS-5 primary and FSIQ subtest; part of Digit Span in the WAIS-IV)");

  T.lns = {
    id: "lns", tag: "WAIS-5 secondary", name: "Letter-Number Sequencing", index: "memory", short: "Hear numbers and letters; give numbers in order, then letters in order.",
    models: "Letter-Number Sequencing (WAIS-IV supplemental, WAIS-5)",
    admin: { kind: "span", min: 2, max: 8, trials: 3 },
    item: (seed, len, trial) => G.genLNS(seed, len, trial),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">Remember the numbers and letters. Then give the numbers from smallest to largest, then the letters in alphabetical order.</p><div id="s"></div>`;
      await presentSeq($("#s", host), it.seq, ctx.prefs);
      host.innerHTML = `<p class="prompt">Numbers first (smallest up), then letters (A to Z).</p><div id="k"></div>`;
      return new Promise(res => keypad($("#k", host), [1, 2, 3, 4, 5, 6, 7, 8, 9].map(String).concat("ABCDEFGHJKLMNPQRSTUVZ".split("")), it.len, t => res({ response: t.join(""), correct: t.join("") === it.answer.join("") }), { letters: true }));
    },
    explain: it => `The list was ${it.seq.join(" ")}; the answer was ${it.answer.join(" ")}.`,
  };

  T.running = {
    id: "running", tag: "WAIS-5 WMI", name: "Running Digits", index: "memory", short: "A list of unknown length; give only the last few digits.",
    models: "Running Digits (WAIS-5, new in that edition)",
    admin: { kind: "span", min: 2, max: 8, trials: 2 },
    item: (seed, n, trial) => G.genRunning(seed, n, trial),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">Digits will keep coming. When they stop, give the <b>last ${it.n}</b> in order.</p><div id="s"></div>`;
      await presentSeq($("#s", host), it.seq, ctx.prefs);
      host.innerHTML = `<p class="prompt">The last ${it.n} digits, in order.</p><div id="k"></div>`;
      return new Promise(res => keypad($("#k", host), [1, 2, 3, 4, 5, 6, 7, 8, 9], it.n, t => res({ response: t.join(""), correct: t.join("") === it.answer.join("") })));
    },
    explain: it => `The list was ${it.seq.join(" ")}; the last ${it.n} were ${it.answer.join(" ")}.`,
  };

  T.symspan = {
    id: "symspan", tag: "WAIS-5 secondary", name: "Symbol Span", index: "memory", short: "Remember abstract designs in order, then find them.",
    models: "Symbol Span (WAIS-5; first in the WMS-IV)",
    admin: { kind: "span", min: 1, max: 7, trials: 2 },
    item: (seed, len, trial) => G.genSymbolSpan(seed, len, trial),
    async render(host, it, ctx) {
      host.innerHTML = `<p class="prompt">Remember these designs and their order.</p><div class="stim"><div class="ss-row">${it.shown.map(g => G.glyphSvg(g)).join("")}</div></div>`;
      await sleep(Math.max(2000, it.len * 1500));
      const order = [];
      host.innerHTML = `<p class="prompt">Tap the designs you saw, in the same order.</p><div class="stim"><div class="symgrid" id="sg">${it.choices.map(k => `<button type="button" data-k="${k}" aria-pressed="false">${G.glyphSvg(it.pool[k])}<span class="o"></span></button>`).join("")}</div></div><div class="next"><button type="button" class="btn quiet" id="undo">Undo</button><button type="button" class="btn go" id="ok">Done</button></div>`;
      const draw = () => $$("#sg button", host).forEach(b => { const p = order.indexOf(+b.dataset.k); b.setAttribute("aria-pressed", p >= 0); $(".o", b).textContent = p >= 0 ? p + 1 : ""; });
      $$("#sg button", host).forEach(b => b.onclick = () => { const k = +b.dataset.k; if (!order.includes(k) && order.length < it.len) order.push(k); draw(); });
      $("#undo", host).onclick = () => { order.pop(); draw(); };
      return new Promise(res => { $("#ok", host).onclick = () => { const right = order.length === it.len && order.every((k, i) => k === i); const items = order.filter((k, i) => k < it.len).length === it.len; res({ response: order.join(","), correct: right, partial: items && !right }); }; });
    },
    explain: () => "Designs are scored for the right ones in the right order.",
  };

  T.spatialadd = {
    id: "spatialadd", tag: "WAIS-5 secondary", name: "Spatial Addition", index: "memory", short: "Combine two grids in your head with a simple rule.",
    models: "Spatial Addition (WMS-IV, and the WAIS-5 working memory subtests)",
    admin: { kind: "ladder", levels: 8, perLevel: 2, stopAfter: 3, limit: 0 },
    item: (seed, lv, k) => G.genSpatialAdd(seed, lv, k),
    async render(host, it, ctx) {
      const grid = (g, cls) => `<div class="sa" style="grid-template-columns:repeat(${it.size},1fr)">${g.map(v => `<div class="${v ? "b" + v : ""}"></div>`).join("")}</div>`;
      host.innerHTML = `<p class="prompt">First grid. Remember where the blue dots are (ignore red).</p><div class="stim" style="max-width:260px">${grid(it.a)}</div>`;
      await sleep(5000);
      host.innerHTML = `<p class="prompt">Second grid.</p><div class="stim" style="max-width:260px">${grid(it.b)}</div>`;
      await sleep(5000);
      const ans = Array(it.size * it.size).fill(0);
      host.innerHTML = `<p class="prompt">Add them: blue in only one grid stays <b>blue</b>; blue in both becomes a <b>white</b> ring; red does not count. Tap to cycle empty, blue, white.</p><div class="stim" style="max-width:260px"><div class="sa" id="sa" style="grid-template-columns:repeat(${it.size},1fr)"></div></div><div class="next"><button type="button" class="btn go" id="ok">Done</button></div>`;
      const draw = () => { $("#sa", host).innerHTML = ans.map((v, k) => `<button type="button" data-k="${k}" class="${v ? "b" + v : ""}" aria-label="cell ${k + 1}: ${["empty", "blue", "", "white"][v]}"></button>`).join(""); $$("#sa button", host).forEach(b => b.onclick = () => { const k = +b.dataset.k; ans[k] = { 0: 1, 1: 3, 3: 0 }[ans[k]]; draw(); }); };
      draw();
      return new Promise(res => { $("#ok", host).onclick = () => res({ response: ans.join(""), correct: ans.every((v, k) => v === it.answer[k]) }); });
    },
    explain: () => "Blue in exactly one grid stays blue, blue in both turns white, red is a distractor.",
  };

  T.arith = {
    id: "arith", tag: "WAIS-5 secondary", name: "Arithmetic", index: "fluid", short: "Word problems solved in your head, against the clock.",
    models: "Arithmetic (WAIS-5 quantitative reasoning; WAIS-IV working memory)",
    admin: { kind: "ladder", levels: G.ARITH_MAX, perLevel: 2, stopAfter: 3, limit: 30 },
    item: (seed, lv, k) => G.genArith(seed, lv, k),
    async render(host, it, ctx) {
      const listen = ctx.prefs.arithListen && speakOK();
      host.innerHTML = `<p class="prompt">${listen ? "Listen to the problem. No paper." : "Solve it in your head. No paper, no calculator."}</p><div class="stim"><p style="font-size:1.15rem;margin:6px 4px" id="txt">${listen ? "<span style='color:#888'>(listening)</span>" : esc(it.text)}</p></div><div class="next" style="flex-wrap:wrap"><input type="number" inputmode="decimal" id="ans" aria-label="Your answer" style="max-width:160px;font-size:1.2rem"><button type="button" class="btn go" id="ok">Answer</button>${listen ? '<button type="button" class="btn quiet" id="rep">Repeat once</button>' : ""}</div>`;
      if (listen) { say(it.text, 0.95); const rep = $("#rep", host); rep.onclick = () => { rep.disabled = true; say(it.text, 0.95); }; }
      $("#ans", host).focus();
      return new Promise(res => {
        const fin = () => { const v = parseFloat($("#ans", host).value); res({ response: isNaN(v) ? null : v, correct: v === it.answer }); };
        ctx.onTimeout(() => { const v = parseFloat($("#ans", host).value); res({ response: isNaN(v) ? null : v, correct: false }); });
        $("#ok", host).onclick = fin;
        $("#ans", host).onkeydown = e => { if (e.key === "Enter") fin(); };
      });
    },
    explain: it => `The answer was ${it.answer}.`,
  };

  /* --------- processing speed --------- */
  T.coding = {
    id: "coding", tag: "WAIS-5 PSI · FSIQ", name: "Coding (on screen)", index: "speed", short: "Match digits to symbols with a key, as fast as you can.",
    models: "Coding (WAIS-5, WAIS-IV) and the digit-symbol substitution test; here tapped, not drawn",
    admin: { kind: "speed", seconds: 120 },
    item: seed => G.genCoding(seed),
    async render(host, it, ctx) {
      let i = 0, right = 0, wrong = 0; const log = [];
      const keyOrder = ctx.rng.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      host.innerHTML = `<div class="stim"><div class="code-key">${it.key.map((g, k) => `<div><b>${k + 1}</b>${G.glyphSvg(g, "symbol " + (k + 1))}</div>`).join("")}</div><div class="code-trail" id="tr"></div><div class="code-cur" id="cur"></div><div class="code-ans">${keyOrder.map(k => `<button type="button" data-k="${k}" aria-label="symbol">${G.glyphSvg(it.key[k])}</button>`).join("")}</div></div>`;
      const draw = () => { $("#cur", host).textContent = it.digits[i]; $("#tr", host).innerHTML = it.digits.slice(i, i + 8).map((d, j) => `<span class="${j ? "" : "now"}">${d}</span>`).join(""); };
      draw();
      let t = performance.now();
      $$(".code-ans button", host).forEach(b => b.onclick = () => {
        const ok = +b.dataset.k === it.digits[i] - 1; ok ? right++ : wrong++;
        log.push({ d: it.digits[i], ok, rt: Math.round(performance.now() - t) }); t = performance.now();
        i++; if (i >= it.digits.length) i = 0; draw();
      });
      return new Promise(res => ctx.onTimeout(() => res({ response: log, correct: right, wrong, points: right })));
    },
  };
  T.dsm = {
    id: "dsm", tag: "open norms", name: "Digit Symbol Matching", index: "speed", short: "Which digit goes with the symbol? Tap 1, 2 or 3, fast.",
    models: "TestMyBrain Digit Symbol Matching (Passell et al. 2021), a short digit-symbol test with open adult norms; scored by median correct response time",
    admin: { kind: "speed", seconds: 90, metric: "rt" },
    item: seed => G.genDSM(seed),
    async render(host, it, ctx) {
      let i = 0, right = 0, wrong = 0, busy = false; const log = [];
      host.innerHTML = `<div class="stim"><div class="dsm-probe" id="pr"></div><div class="code-key dsm-key">${it.key.map((g, k) => `<div>${G.glyphSvg(g, "symbol")}<b>${it.digit[k]}</b></div>`).join("")}</div></div><div class="pad" style="grid-template-columns:repeat(3,minmax(0,72px))">${[1, 2, 3].map(n => `<button type="button" data-n="${n}">${n}</button>`).join("")}</div><p class="small muted" style="text-align:center">Keys 1 to 3 work too.</p>`;
      const draw = () => { $("#pr", host).innerHTML = G.glyphSvg(it.key[it.probes[i % it.probes.length]], "symbol to match"); t = performance.now(); };
      let t = 0; draw();
      const answer = n => {
        if (busy) return;
        const ok = n === it.digit[it.probes[i % it.probes.length]]; ok ? right++ : wrong++;
        log.push({ ok, rt: Math.round(performance.now() - t) }); i++;
        // the chosen digit is highlighted for 300 ms before the next symbol, as in the source
        const b = $(`[data-n="${n}"]`, host); busy = true; if (b) b.classList.add("hit");
        setTimeout(() => { busy = false; if (b) b.classList.remove("hit"); if (host.isConnected) draw(); }, 300);
      };
      $$("[data-n]", host).forEach(b => b.onclick = () => answer(+b.dataset.n));
      const onKey = e => { if (/^[1-3]$/.test(e.key)) answer(+e.key); };
      document.addEventListener("keydown", onKey);
      return new Promise(res => ctx.onTimeout(() => { document.removeEventListener("keydown", onKey); res({ response: log, correct: right, wrong, points: right }); }));
    },
  };
  T.symsearch = {
    id: "symsearch", tag: "WAIS-5 PSI", name: "Symbol Search", index: "speed", short: "Is either target symbol in the row? Yes or no, fast.",
    models: "Symbol Search (WAIS-5, WAIS-IV)",
    admin: { kind: "speed", seconds: 120 },
    item: seed => G.genSymbolSearch(seed),
    async render(host, it, ctx) {
      let i = 0, right = 0, wrong = 0; const log = [];
      host.innerHTML = `<p class="prompt">Is either symbol on the left in the row on the right?</p><div class="stim"><div class="ss-row" id="row"></div></div><div class="next"><button type="button" class="btn" id="yes" style="min-width:110px">Yes</button><button type="button" class="btn" id="no" style="min-width:110px">No</button></div><p class="small muted" style="text-align:center">Keys: Y / N, or ← / →</p>`;
      const draw = () => { const q = it.items[i % it.items.length]; $("#row", host).innerHTML = q.targets.map(k => `<span class="targ">${G.glyphSvg(it.bank[k])}</span>`).join("") + `<span class="sep"></span>` + q.group.map(k => G.glyphSvg(it.bank[k])).join(""); };
      draw();
      let t = performance.now();
      const answer = yes => { const q = it.items[i % it.items.length]; const ok = q.yes === yes; ok ? right++ : wrong++; log.push({ ok, rt: Math.round(performance.now() - t) }); t = performance.now(); i++; draw(); };
      $("#yes", host).onclick = () => answer(true); $("#no", host).onclick = () => answer(false);
      const onKey = e => { if (/^(y|ArrowLeft)$/i.test(e.key)) answer(true); if (/^(n|ArrowRight)$/i.test(e.key)) answer(false); };
      document.addEventListener("keydown", onKey);
      return new Promise(res => ctx.onTimeout(() => { document.removeEventListener("keydown", onKey); res({ response: log, correct: right, wrong, points: Math.max(0, right - wrong) }); }));
    },
  };

  T.nsq = {
    id: "nsq", tag: "WAIS-5 secondary", name: "Naming Speed Quantity (tapped)", index: "speed", short: "Say how many squares are in each box, as fast as you can.",
    models: "Naming Speed Quantity (WAIS-5, new); here you tap the number instead of saying it",
    admin: { kind: "speed", seconds: 60 },
    item: seed => G.genQuantity(seed),
    async render(host, it, ctx) {
      let i = 0, right = 0, wrong = 0; const log = [];
      host.innerHTML = `<p class="prompt">How many squares are in the box?</p><div class="stim" style="max-width:220px"><div id="box"></div></div><div class="pad" style="grid-template-columns:repeat(4,minmax(0,64px))">${[1, 2, 3, 4].map(n => `<button type="button" data-n="${n}">${n}</button>`).join("")}</div><p class="small muted" style="text-align:center">Keys 1 to 4 work too.</p>`;
      const draw = () => { $("#box", host).innerHTML = G.quantitySvg(it.boxes[i % it.boxes.length]); };
      draw();
      let t = performance.now();
      const answer = n => { const ok = n === it.boxes[i % it.boxes.length].length; ok ? right++ : wrong++; log.push({ ok, rt: Math.round(performance.now() - t) }); t = performance.now(); i++; draw(); };
      $$("[data-n]", host).forEach(b => b.onclick = () => answer(+b.dataset.n));
      const onKey = e => { if (/^[1-4]$/.test(e.key)) answer(+e.key); };
      document.addEventListener("keydown", onKey);
      return new Promise(res => ctx.onTimeout(() => { document.removeEventListener("keydown", onKey); res({ response: log, correct: right, wrong, points: right }); }));
    },
  };

  window.IQTASKS = T;
  window.IQUI = { esc, $, $$, sleep, say, speakOK };
})();
