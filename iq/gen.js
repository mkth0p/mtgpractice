/* Cognitive test practice: item generators. Every item is original and built from a seed, so the
   same seed always gives the same item (that is how Form A and Form B stay fixed for a study) and
   an unlimited supply of fresh items exists for training. Nothing here copies a published or
   secure test item: the generators follow the published FORMAT and the documented difficulty
   rules of each task type (see the Method page). Runs in the browser and in Node (tests). */
(function (root) {
  "use strict";
  const G = {};

  /* ---------- seeded randomness (mulberry32 over a string hash) ---------- */
  function hash(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
  function rng(seed) {
    let a = typeof seed === "number" ? seed >>> 0 : hash(String(seed));
    const next = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const r = {
      next,
      int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),
      pick: a => a[Math.floor(next() * a.length)],
      shuffle: a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
      chance: p => next() < p,
      sample: (a, n) => r.shuffle(a).slice(0, n),
    };
    return r;
  }
  G.hash = hash; G.rng = rng;
  const range = n => Array.from({ length: n }, (_, i) => i);
  const sameSet = (a, b) => a.length === b.length && a.every(x => b.includes(x));

  /* =====================================================================================
     MATRIX REASONING (3 x 3, the bottom-right cell missing, 8 answer choices)
     Rules follow Carpenter, Just & Shell (1990): constant in a row, quantitative pairwise
     progression, distribution of three values, figure addition / subtraction and distribution of
     two values (exclusive or). Difficulty grows with the number of rules and with the harder
     rule types, which is what predicts item difficulty in rule-based matrix research
     (Carpenter et al. 1990; Embretson 1998; Matzen et al. 2010).
     Answer choices use attribute bisection (as in I-RAVEN, Hu et al. 2021): three attributes each
     take the right or a wrong value in all 2 x 2 x 2 combinations, so every value appears in half
     the choices and the answer cannot be found by looking at the choices alone.
     ===================================================================================== */
  const SHAPES = ["triangle", "square", "pentagon", "hexagon", "circle"];
  const FILLS = 5;     // white, light, mid, dark, black
  const SIZES = 5;     // 0 small .. 4 large
  
  /* Each config lists attributes, their number of levels and whether they are ordered. */
  const ATTR = {
    shape: { n: 5, ordered: false }, size: { n: SIZES, ordered: true }, fill: { n: FILLS, ordered: true },
    rot: { n: 4, ordered: true }, number: { n: 9, ordered: true }, pos: { set: 9 }, lines: { set: 8 },
    ishape: { n: 5, ordered: false }, isize: { n: 3, ordered: true }, ifill: { n: FILLS, ordered: true },
  };

  /* A rule produces the 3 x 3 table of values for one attribute (rows are independent rows). */
  function ruleValues(r, kind, attr, levels) {
    const n = levels;
    if (kind === "constant") {
      const vals = r.sample(range(n), 3);
      return vals.map(v => [v, v, v]);
    }
    if (kind === "progression") {
      for (let t = 0; t < 50; t++) {
        const d = r.pick(n >= 5 ? [1, -1, 2, -2] : [1, -1]);
        const rows = [];
        for (let i = 0; i < 3; i++) {
          const lo = Math.max(0, -2 * d), hi = Math.min(n - 1, n - 1 - 2 * d);
          if (lo > hi) break;
          const s = r.int(lo, hi);
          rows.push([s, s + d, s + 2 * d]);
        }
        if (rows.length === 3 && !(rows[0][0] === rows[1][0] && rows[1][0] === rows[2][0])) return rows;
      }
      return [[0, 1, 2], [1, 2, 3], [2, 3, 4]].map(x => x.map(v => Math.min(v, n - 1)));
    }
    if (kind === "distribute3") {
      const vals = r.sample(range(n), 3), shift = r.pick([1, 2]);
      return range(3).map(i => range(3).map(j => vals[(j + i * shift) % 3]));
    }
    if (kind === "arith") { // number: third = first + second (or first - second)
      const plus = r.chance(0.5), rows = [];
      while (rows.length < 3) {
        const a = r.int(1, plus ? 5 : 8), b = r.int(1, plus ? 9 - a : a - 1);
        if (b < 1) continue;
        rows.push(plus ? [a, b, a + b] : [a, b, a - b]);
      }
      return rows.map(x => x.map(v => v - 1)); // stored as count-1
    }
    throw new Error("rule " + kind);
  }
  /* Set rules for positions in a 3 x 3 sub-grid or line segments: exclusive or, union, subtraction. */
  function setRule(r, kind, size) {
    const rows = [];
    for (let i = 0; i < 3; i++) {
      for (let t = 0; t < 100; t++) {
        const a = range(size).filter(() => r.chance(0.45)), b = range(size).filter(() => r.chance(0.45));
        let c;
        if (kind === "xor") c = range(size).filter(k => a.includes(k) !== b.includes(k));
        else if (kind === "or") c = range(size).filter(k => a.includes(k) || b.includes(k));
        else if (kind === "sub") c = a.filter(k => !b.includes(k));
        else if (kind === "and") c = a.filter(k => b.includes(k));
        const ok = a.length && b.length && c.length && !sameSet(a, b) && !sameSet(a, c) && !sameSet(b, c) &&
          (kind !== "sub" || b.some(k => a.includes(k))) && (kind !== "or" || (a.some(k => !b.includes(k)) && b.some(k => !a.includes(k)))) &&
          (kind !== "and" || (a.length > c.length && b.length > c.length));
        if (ok) { rows.push([a, b, c]); break; }
      }
    }
    return rows;
  }
  const SET_RULE_TEXT = { xor: "the third cell keeps what appears in exactly one of the first two (shared parts cancel out)", or: "the third cell is the first two laid on top of each other", sub: "the third cell is the first with the parts of the second taken away", and: "the third cell keeps only what the first two share" };

  /* Difficulty levels 1..12: which configuration and which rules. */
  const MATRIX_LEVELS = [
    null,
    { config: "center", rules: { size: "progression" } },
    { config: "center", rules: { shape: "distribute3" } },
    { config: "center", rules: { fill: "progression", shape: "constant" } },
    { config: "center", rules: { shape: "distribute3", size: "progression" } },
    { config: "grid", rules: { number: "progression" } },
    { config: "center", rules: { shape: "distribute3", fill: "distribute3", rot: "progression" } },
    { config: "grid", rules: { pos: "or", fill: "distribute3" } },
    { config: "outin", rules: { shape: "distribute3", ishape: "distribute3", ifill: "progression" } },
    { config: "grid", rules: { pos: "xor", shape: "distribute3" } },
    { config: "lines", rules: { lines: "xor", shape: "distribute3", fill: "progression" } },
    { config: "outin", rules: { shape: "distribute3", rot: "progression", ishape: "distribute3", ifill: "distribute3", isize: "progression" } },
    { config: "grid", rules: { pos: "sub", shape: "distribute3", fill: "progression" } },
  ];
  G.MATRIX_MAX = MATRIX_LEVELS.length - 1;

  function genMatrix(seed, level) {
    const r = rng(seed + "|mx|" + level);
    const spec = MATRIX_LEVELS[Math.max(1, Math.min(G.MATRIX_MAX, level))];
    const cfg = spec.config;
    const attrs = { center: ["shape", "size", "fill", "rot"], grid: ["shape", "fill", "number", "pos"], outin: ["shape", "rot", "ishape", "isize", "ifill"], lines: ["lines", "shape", "fill"] }[cfg];
    const table = {}; const rules = Object.assign({}, spec.rules);
    // a grid uses positions OR number, never both
    if (cfg === "grid" && !rules.pos && !rules.number) rules.number = "constant";
    for (const a of attrs) {
      if (cfg === "grid" && a === "pos" && !rules.pos) continue;
      if (cfg === "grid" && a === "number" && rules.pos) continue;
      let kind = rules[a];
      const meta = ATTR[a];
      if (meta.set) { table[a] = setRule(r, kind || "xor", meta.set); continue; }
      let levels = meta.n;
      if (a === "number") levels = 6;
      // turning only shows on shapes that change when turned, so no circles when a turn rule is used
      if (a === "shape" && rules.rot) levels = 4;
      if (!kind) { // attributes without a rule stay the same across the whole matrix
        const v = a === "rot" ? 0 : a === "fill" || a === "ifill" ? r.pick([0, 2, 4]) : a === "size" ? r.int(2, 4) : a === "isize" ? 1 : r.int(0, levels - 1);
        table[a] = [[v, v, v], [v, v, v], [v, v, v]];
        continue;
      }
      table[a] = ruleValues(r, kind, a, levels);
    }
    const cells = range(9).map(k => {
      const i = Math.floor(k / 3), j = k % 3, c = {};
      for (const a in table) c[a] = table[a][i][j];
      return c;
    });
    const answer = cells[8];
    const options = bisectOptions(r, cfg, table, answer, rules);
    const order = r.shuffle(range(options.length));
    const opts = order.map(k => options[k]);
    const correct = order.indexOf(0);
    const explain = Object.entries(rules).map(([a, k]) => describeRule(a, k)).filter(Boolean);
    return { type: "matrix", level, config: cfg, cells: cells.slice(0, 8), options: opts, correct, rules, ruleCount: Object.keys(rules).filter(a => rules[a] !== "constant").length, explain };
  }
  const ATTR_NAME = { shape: "shape", size: "size", fill: "shading", rot: "turn", number: "number of shapes", pos: "positions", lines: "lines", ishape: "inner shape", isize: "inner size", ifill: "inner shading" };
  function describeRule(a, k) {
    const nm = ATTR_NAME[a];
    if (k === "constant") return `The ${nm} stays the same along each row.`;
    if (k === "progression") return `The ${nm} changes by the same step from left to right.`;
    if (k === "distribute3") return `Each row uses the same three ${nm === "shape" ? "shapes" : nm + " values"}, each once, in a different order.`;
    if (k === "arith") return `The ${nm} in the third cell is the first two added (or the second taken from the first).`;
    if (SET_RULE_TEXT[k]) return `For the ${nm}: ${SET_RULE_TEXT[k]}.`;
    return "";
  }
  function bisectOptions(r, cfg, table, ans, rules) {
    // candidate attributes to vary: rule attributes first, then constant ones
    const candidates = [];
    const ruleAttrs = Object.keys(table).filter(a => rules[a] && rules[a] !== "constant");
    const rest = Object.keys(table).filter(a => !ruleAttrs.includes(a) && !(a === "rot" && ans.shape === 4) && !(a === "number" && cfg === "grid" && rules.pos));
    for (const a of r.shuffle(ruleAttrs).concat(r.shuffle(rest))) candidates.push(a);
    const axes = [];
    const altFor = a => {
      const meta = ATTR[a], v = ans[a];
      if (meta.set) {
        // flip one position / line; prefer one that looks plausible (seen elsewhere in the row)
        const size = meta.set;
        for (let t = 0; t < 30; t++) { const k = r.int(0, size - 1); const alt = v.includes(k) ? v.filter(x => x !== k) : v.concat([k]).sort((x, y) => x - y); if (alt.length) return alt; }
        return null;
      }
      let levels = a === "number" ? 6 : meta.n;
      const seen = Array.from(new Set(table[a].flat())).filter(x => x !== v && x < levels);
      const pool = seen.length ? seen : range(levels).filter(x => x !== v);
      if (!pool.length) return null;
      // ordered attributes: prefer a neighbour value (the classic near-miss)
      if (meta.ordered && r.chance(0.6)) { const near = [v - 1, v + 1].filter(x => x >= 0 && x < levels); if (near.length) return r.pick(near); }
      return r.pick(pool);
    };
    for (const a of candidates) {
      if (axes.length === 3) break;
      if (a === "pos" && axes.filter(x => x.a === "pos").length >= 2) continue;
      const alt = altFor(a);
      if (alt === null || alt === undefined) continue;
      axes.push({ a, alt });
      // positions and lines can carry two axes (two different flips)
      if ((a === "pos" || a === "lines") && axes.length < 3 && candidates.length < 4) {
        for (let t = 0; t < 10; t++) { const alt2 = altFor(a); if (alt2 && !sameSet(alt2, alt)) { axes.push({ a, alt: alt2, second: true }); break; } }
      }
    }
    // fewer than three usable attributes (tiny configs): add second flips of a set attribute
    while (axes.length < 3) {
      const setA = Object.keys(table).find(a => ATTR[a].set);
      if (!setA) { const a = candidates.find(c => !axes.some(x => x.a === c)) || candidates[0]; axes.push({ a, alt: altFor(a), extra: true }); continue; }
      const alt2 = altFor(setA); if (alt2) axes.push({ a: setA, alt: alt2, second: true });
    }
    const opts = [];
    for (let m = 0; m < 8; m++) {
      const o = JSON.parse(JSON.stringify(ans));
      axes.forEach((ax, i) => {
        if (!(m & (1 << i))) return;
        const meta = ATTR[ax.a];
        if (meta.set && ax.second) {
          // apply the second flip as a toggle relative to the current value
          const diff = ax.alt.filter(k => !ans[ax.a].includes(k)).concat(ans[ax.a].filter(k => !ax.alt.includes(k)));
          let cur = o[ax.a].slice();
          diff.forEach(k => { cur = cur.includes(k) ? cur.filter(x => x !== k) : cur.concat([k]); });
          o[ax.a] = cur.sort((x, y) => x - y);
        } else if (meta.set) {
          const diff = ax.alt.filter(k => !ans[ax.a].includes(k)).concat(ans[ax.a].filter(k => !ax.alt.includes(k)));
          let cur = o[ax.a].slice();
          diff.forEach(k => { cur = cur.includes(k) ? cur.filter(x => x !== k) : cur.concat([k]); });
          o[ax.a] = cur.sort((x, y) => x - y);
        } else o[ax.a] = ax.alt;
      });
      opts.push(o);
    }
    // make sure every choice draws differently; replace any duplicate with a fresh near-miss
    const key = o => JSON.stringify(o);
    const seen = new Set();
    for (let m = 0; m < opts.length; m++) {
      let k = key(opts[m]);
      let guard = 0;
      while ((seen.has(k) || (m > 0 && k === key(ans)) || (opts[m].pos && !opts[m].pos.length) || (opts[m].lines && !opts[m].lines.length)) && guard++ < 50) {
        const a = r.pick(Object.keys(ans).filter(x => !(x === "rot" && ans.shape === 4)));
        const alt = altFor(a);
        if (alt !== null && alt !== undefined) { opts[m] = JSON.parse(JSON.stringify(opts[m])); opts[m][a] = alt; }
        k = key(opts[m]);
      }
      seen.add(k);
    }
    return opts;
  }

  /* ---------- matrix drawing (SVG, always on a white "booklet" background) ---------- */
  const FILL_COL = ["#ffffff", "#d9d9d9", "#a6a6a6", "#595959", "#111111"];
  function poly(n, cx, cy, rad, rotDeg) {
    const pts = [];
    const base = -90 + (rotDeg || 0);
    for (let i = 0; i < n; i++) { const t = (base + i * 360 / n) * Math.PI / 180; pts.push((cx + rad * Math.cos(t)).toFixed(2) + "," + (cy + rad * Math.sin(t)).toFixed(2)); }
    return pts.join(" ");
  }
  function shapeSvg(shape, cx, cy, rad, fill, rotStep, extra) {
    const f = FILL_COL[fill], sw = extra && extra.sw || 2.2;
    if (shape === 4) return `<circle cx="${cx}" cy="${cy}" r="${rad.toFixed(2)}" fill="${f}" stroke="#111" stroke-width="${sw}"/>`;
    const n = [3, 4, 5, 6][shape];
    // the turn step is 45 deg for triangles/pentagons, 22.5 for squares (a square at 90 looks unturned), 15 for hexagons
    const step = n === 4 ? 22.5 : n === 6 ? 15 : n === 5 ? 18 : 45;
    const rot = (n === 4 ? 45 : 0) + (rotStep || 0) * step;
    return `<polygon points="${poly(n, cx, cy, rad, rot)}" fill="${f}" stroke="#111" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }
  const LINE_SEGS = [[10, 50, 90, 50], [50, 10, 50, 90], [14, 14, 86, 86], [86, 14, 14, 86], [10, 22, 90, 22], [10, 78, 90, 78], [22, 10, 22, 90], [78, 10, 78, 90]];
  function cellSvg(c, cfg) {
    let s = "";
    if (cfg === "center") s += shapeSvg(c.shape, 50, 52, 14 + c.size * 6.5, c.fill, c.rot);
    else if (cfg === "grid") {
      const positions = c.pos ? c.pos : [[4], [0, 8], [0, 4, 8], [0, 2, 6, 8], [0, 2, 4, 6, 8], [0, 2, 3, 5, 6, 8]][c.number] || [4];
      for (const p of positions) s += shapeSvg(c.shape, 22 + (p % 3) * 28, 22 + Math.floor(p / 3) * 28, 10.5, c.fill, 0, { sw: 1.8 });
    } else if (cfg === "outin") {
      s += shapeSvg(c.shape, 50, 52, 40, 0, c.rot);
      s += shapeSvg(c.ishape, 50, 52, 9 + c.isize * 4, c.ifill, 0, { sw: 1.8 });
    } else if (cfg === "lines") {
      for (const k of c.lines) { const L = LINE_SEGS[k]; s += `<line x1="${L[0]}" y1="${L[1]}" x2="${L[2]}" y2="${L[3]}" stroke="#111" stroke-width="3" stroke-linecap="round"/>`; }
      s += shapeSvg(c.shape, 50, 50, 11, c.fill, 0, { sw: 1.8 });
    }
    return s;
  }
  G.matrixCellSvg = (c, cfg, label) => `<svg viewBox="0 0 100 100" role="img" aria-label="${label || "figure"}"><rect x="1" y="1" width="98" height="98" fill="#fff" stroke="#888" stroke-width="1"/>${c ? cellSvg(c, cfg) : `<text x="50" y="64" text-anchor="middle" font-size="44" font-family="system-ui" fill="#888">?</text>`}</svg>`;

  /* =====================================================================================
     FIGURE WEIGHTS (balance scales; pick what keeps the last scale level)
     Hidden integer weights; the shown scales are chosen so the system has exactly one solution up
     to scale (rank = number of shape kinds - 1), so the answer follows from the scales alone.
     Wrong choices weigh 1 or 2 units more or less, with a similar number of pieces.
     ===================================================================================== */
  const WEIGHT_KINDS = [
    { name: "red circle", col: "#d6453d", shape: 4 }, { name: "blue square", col: "#2f6fd0", shape: 1 },
    { name: "yellow triangle", col: "#e8b923", shape: 0 }, { name: "green pentagon", col: "#2f9a57", shape: 2 },
    { name: "purple hexagon", col: "#7b4fc9", shape: 3 },
  ];
  G.WEIGHT_KINDS = WEIGHT_KINDS;
  const WEIGHT_LEVELS = [null,
    { kinds: 2, scales: 1 }, { kinds: 2, scales: 1, mult: true }, { kinds: 3, scales: 2 }, { kinds: 3, scales: 2, mix: true },
    { kinds: 3, scales: 2, mix: true, big: true }, { kinds: 4, scales: 3 }, { kinds: 4, scales: 3, mix: true }, { kinds: 4, scales: 3, mix: true, big: true },
    { kinds: 4, scales: 3, mix: true, big: true, mult: true }, { kinds: 5, scales: 4, mix: true, big: true }];
  G.WEIGHT_MAX = WEIGHT_LEVELS.length - 1;
  function rankOf(rows, n) {
    const m = rows.map(r => r.slice());
    let rank = 0;
    for (let c = 0; c < n && rank < m.length; c++) {
      let p = m.findIndex((row, i) => i >= rank && Math.abs(row[c]) > 1e-9);
      if (p < 0) continue;
      [m[rank], m[p]] = [m[p], m[rank]];
      for (let i = 0; i < m.length; i++) if (i !== rank && Math.abs(m[i][c]) > 1e-9) { const f = m[i][c] / m[rank][c]; for (let k = 0; k < n; k++) m[i][k] -= f * m[rank][k]; }
      rank++;
    }
    return rank;
  }
  function genWeights(seed, level) {
    const L = WEIGHT_LEVELS[Math.max(1, Math.min(G.WEIGHT_MAX, level))];
    for (let attempt = 0; attempt < 400; attempt++) {
      const r = rng(seed + "|fw|" + level + "|" + attempt);
      const kinds = r.sample(range(WEIGHT_KINDS.length), L.kinds);
      // weights: the lightest is 1, the rest grow (distinct, small numbers)
      const w = {}; let last = 1;
      const order = r.shuffle(kinds);
      order.forEach((k, i) => { w[k] = i === 0 ? r.int(1, 2) : last + r.int(1, L.big ? 3 : 2); last = w[k]; });
      const tot = ms => ms.reduce((s, k) => s + w[k], 0);
      const scales = [];
      // chain the kinds so each new scale links one new kind to known ones
      for (let s = 0; s < L.scales; s++) {
        const heavy = order[s + 1 < order.length ? s + 1 : order.length - 1];
        const known = order.slice(0, s + 1);
        let left = [heavy];
        if (L.mult && r.chance(0.6)) left = [heavy, heavy];
        if (L.mix && s > 0 && r.chance(0.5)) left = left.concat([r.pick(known)]);
        const target = tot(left);
        // right side: make target from known kinds (prefer a mixture)
        let right = null;
        for (let t = 0; t < 60 && !right; t++) {
          const cand = []; let sum = 0;
          while (sum < target && cand.length < 7) { const k = r.pick(known); if (sum + w[k] <= target) { cand.push(k); sum += w[k]; } else if (known.every(q => sum + w[q] > target)) break; }
          if (sum === target && cand.length <= 6 && !(cand.length === left.length && sameSet(cand, left))) right = cand;
        }
        if (!right) break;
        scales.push([left.sort(), right.sort()]);
      }
      if (scales.length !== L.scales) continue;
      const rows = scales.map(([a, b]) => kinds.map(k => a.filter(x => x === k).length - b.filter(x => x === k).length));
      if (rankOf(rows, kinds.length) !== kinds.length - 1) continue;
      // the question: the heaviest kind (plus a helper on harder levels) on the left
      let q = [order[order.length - 1]];
      if (L.mix) q = q.concat(r.chance(0.5) ? [r.pick(order.slice(0, -1))] : [order[order.length - 1]]);
      if (L.big) q = q.concat([r.pick(order)]);
      const qw = tot(q);
      // build answers from the kinds as pieces; correct = same weight, not the same pieces
      const combos = new Map();
      const pieces = kinds;
      const gen = n => { const out = []; const rec = (start, cur) => { if (cur.length === n) { out.push(cur.slice()); return; } for (let i = start; i < pieces.length; i++) { cur.push(pieces[i]); rec(i, cur); cur.pop(); } }; rec(0, []); return out; };
      for (let n = 1; n <= 5; n++) for (const c of gen(n)) { const key = c.slice().sort().join(","); if (!combos.has(key)) combos.set(key, c.slice().sort()); }
      const all = Array.from(combos.values()).filter(c => !(sameSet(c, q) && c.length === q.length));
      // the correct answer must not be read straight off a shown scale side, so the scales must be combined
      const shown = new Set(scales.flatMap(s => s.map(x => x.slice().sort().join(","))));
      const right = all.filter(c => tot(c) === qw && c.length <= 5);
      const rightHard = right.filter(c => !shown.has(c.join(",")));
      const pool = (rightHard.length ? rightHard : right);
      if (!pool.length) continue;
      const ans = r.pick(pool);
      const wrong = r.shuffle(all.filter(c => tot(c) !== qw && Math.abs(tot(c) - qw) <= 3 && Math.abs(c.length - ans.length) <= 1));
      if (wrong.length < 4) continue;
      const options = r.shuffle([ans].concat(wrong.slice(0, 4)));
      return {
        type: "weights", level, scales, question: q.sort(), options, correct: options.indexOf(ans), kinds,
        explain: `Weights that fit every scale: ${order.map(k => `${WEIGHT_KINDS[k].name} = ${w[k]}`).join(", ")}. The left side weighs ${qw}, and so does the right answer.`,
        weightsHidden: w,
      };
    }
    throw new Error("could not build a figure weights item");
  }

  /* =====================================================================================
     VISUAL PUZZLES (pick the three pieces that together make the figure)
     The figure is a shape on a square grid with some half-cell triangles; it is cut into three
     connected pieces. Three decoy pieces are cut from a different shape. Pieces may be shown
     turned but never flipped. A search checks that no other set of three fills the figure.
     ===================================================================================== */
  // a cell is [x, y, t]: t = 0 full square, 1..4 half square with the triangle on a corner (NE, SE, SW, NW)
  const rotCell = ([x, y, t]) => [-y, x, t ? (t % 4) + 1 : 0]; // 90 deg clockwise (screen y down)
  function norm(cells) {
    const mx = Math.min(...cells.map(c => c[0])), my = Math.min(...cells.map(c => c[1]));
    return cells.map(([x, y, t]) => [x - mx, y - my, t]).sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]);
  }
  const key = cells => norm(cells).map(c => c.join(".")).join("|");
  function rotations(cells) { const out = []; let c = cells; for (let i = 0; i < 4; i++) { out.push(norm(c)); c = c.map(rotCell); } return out; }
  // two half cells in the same square with opposite triangles make a full square (for covering)
  const area = cells => cells.reduce((s, c) => s + (c[2] ? 0.5 : 1), 0);
  function coverKey(cells) {
    // split every cell into its 4 quarter triangles (N, E, S, W) so halves add up correctly
    const q = [];
    const QS = { 0: [0, 1, 2, 3], 1: [0, 1], 2: [1, 2], 3: [2, 3], 4: [3, 0] };
    for (const [x, y, t] of cells) for (const k of QS[t]) q.push(x + "," + y + "," + k);
    return q;
  }
  function connected(cells) {
    if (!cells.length) return false;
    const set = new Set(cells.map(c => c[0] + "," + c[1]));
    const seen = new Set([cells[0][0] + "," + cells[0][1]]); const st = [cells[0]];
    while (st.length) { const [x, y] = st.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + "," + (y + dy); if (set.has(k) && !seen.has(k)) { seen.add(k); st.push([x + dx, y + dy]); } } }
    return seen.size === set.size;
  }
  function growShape(r, n) {
    const cells = [[0, 0]]; const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
    while (cells.length < n) { const [x, y] = r.pick(cells); const [dx, dy] = r.pick([[1, 0], [-1, 0], [0, 1], [0, -1]]); if (!has(x + dx, y + dy) && Math.abs(x + dx) < 3 && Math.abs(y + dy) < 3) cells.push([x + dx, y + dy]); }
    return cells;
  }
  function splitInto3(r, cells) {
    for (let t = 0; t < 200; t++) {
      const seeds = r.sample(cells, 3); const lab = new Map(); seeds.forEach((c, i) => lab.set(c[0] + "," + c[1], i));
      let changed = true;
      while (changed) { changed = false; for (const c of r.shuffle(cells)) { const k = c[0] + "," + c[1]; if (lab.has(k)) continue; const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => lab.get((c[0] + dx) + "," + (c[1] + dy))).filter(v => v !== undefined); if (nb.length) { lab.set(k, r.pick(nb)); changed = true; } } }
      const parts = [0, 1, 2].map(i => cells.filter(c => lab.get(c[0] + "," + c[1]) === i));
      if (parts.every(p => p.length >= 3) && parts.every(connected)) return parts;
    }
    return null;
  }
  // the 3 pieces may tile the target in rotation; search placements
  function canTile(target, pieces) {
    const tq = coverKey(target); const need = new Set(tq);
    const total = pieces.reduce((s, p) => s + coverKey(p).length, 0);
    if (total !== tq.length) return false;
    const cand = pieces.map(p => {
      const out = [];
      for (const rot of rotations(p)) {
        const q0 = coverKey(rot);
        for (const [tx, ty] of target.map(c => [c[0], c[1]])) for (const [ax, ay] of rot.map(c => [c[0], c[1]])) {
          const dx = tx - ax, dy = ty - ay;
          const q = q0.map(s => { const [x, y, k] = s.split(","); return (+x + dx) + "," + (+y + dy) + "," + k; });
          if (q.every(s => need.has(s))) out.push(q);
        }
      }
      return out;
    });
    const used = new Set();
    const rec = i => {
      if (i === pieces.length) return used.size === need.size;
      for (const q of cand[i]) { if (q.some(s => used.has(s))) continue; q.forEach(s => used.add(s)); if (rec(i + 1)) return true; q.forEach(s => used.delete(s)); }
      return false;
    };
    return rec(0);
  }
  function addTriangles(r, cells, k) {
    // replace k outer full squares by half squares whose triangle keeps an outside corner shape
    const out = cells.map(c => [c[0], c[1], 0]);
    const has = (x, y) => out.some(c => c[0] === x && c[1] === y);
    for (let n = 0; n < k; n++) {
      const corners = [];
      out.forEach((c, i) => {
        if (c[2]) return;
        const N = has(c[0], c[1] - 1), S = has(c[0], c[1] + 1), E = has(c[0] + 1, c[1]), W = has(c[0] - 1, c[1]);
        // a corner cell with two free sides can be cut on the diagonal
        if (!N && !E && (S || W)) corners.push([i, 3]); // keep SW triangle
        if (!S && !E && (N || W)) corners.push([i, 4]); // keep NW
        if (!S && !W && (N || E)) corners.push([i, 1]); // keep NE
        if (!N && !W && (S || E)) corners.push([i, 2]); // keep SE
      });
      if (!corners.length) break;
      const [i, t] = r.pick(corners); out[i][2] = t;
    }
    return out;
  }
  const VP_LEVELS = [null, { n: 10, tri: 0 }, { n: 11, tri: 1 }, { n: 12, tri: 1 }, { n: 12, tri: 2 }, { n: 13, tri: 2 }, { n: 14, tri: 3 }, { n: 15, tri: 3 }, { n: 16, tri: 4 }];
  G.VP_MAX = VP_LEVELS.length - 1;
  function genPuzzle(seed, level) {
    const L = VP_LEVELS[Math.max(1, Math.min(G.VP_MAX, level))];
    for (let attempt = 0; attempt < 300; attempt++) {
      const r = rng(seed + "|vp|" + level + "|" + attempt);
      const base = growShape(r, L.n), parts = splitInto3(r, base);
      if (!parts) continue;
      const target = addTriangles(r, base, L.tri);
      const tk = new Map(target.map(c => [c[0] + "," + c[1], c[2]]));
      const real = parts.map(p => p.map(c => [c[0], c[1], tk.get(c[0] + "," + c[1])]));
      if (real.some(p => !connected(p))) continue;
      // decoys: other pieces with the same areas as the real ones, so counting squares never gives the answer away
      const pkey = p => rotations(p).map(x => key(x)).sort()[0];
      const keys = new Set(real.map(pkey));
      if (keys.size !== 3) continue;
      const decoys = [];
      for (const p of r.shuffle(real)) {
        for (let t = 0; t < 120; t++) {
          const full = p.filter(c => !c[2]).length, halves = p.length - full;
          let d = growShape(r, p.length + (t > 60 ? 1 : 0)).map(c => [c[0], c[1], 0]);
          if (halves) { d = addTriangles(r, d, halves); if (d.filter(c => c[2]).length !== halves) continue; }
          if (!connected(d) || keys.has(pkey(d))) continue;
          keys.add(pkey(d)); decoys.push(d); break;
        }
      }
      if (decoys.length !== 3) continue;
      const allP = real.concat(decoys);
      // exactly one triple fills the figure
      let fits = 0, ans = null;
      for (let a = 0; a < 6; a++) for (let b = a + 1; b < 6; b++) for (let c = b + 1; c < 6; c++) {
        if (canTile(target, [allP[a], allP[b], allP[c]])) { fits++; ans = [a, b, c]; }
      }
      if (fits !== 1 || ans.join() !== "0,1,2") continue;
      const order = r.shuffle(range(6));
      const shown = order.map(k => { const rots = rotations(allP[k]); return rots[r.int(0, 3)]; });
      return { type: "puzzle", level, target: norm(target), pieces: shown, correct: [0, 1, 2].map(k => order.indexOf(k)).sort((x, y) => x - y), explain: "The three marked pieces cover the figure exactly once, with turning allowed and no flipping." };
    }
    throw new Error("could not build a visual puzzle");
  }
  function cellPath([x, y, t], s, ox, oy) {
    const X = ox + x * s, Y = oy + y * s;
    const P = { NW: [X, Y], NE: [X + s, Y], SE: [X + s, Y + s], SW: [X, Y + s] };
    const pts = t === 0 ? [P.NW, P.NE, P.SE, P.SW] : t === 1 ? [P.NW, P.NE, P.SE] : t === 2 ? [P.NE, P.SE, P.SW] : t === 3 ? [P.SE, P.SW, P.NW] : [P.SW, P.NW, P.NE];
    return "M" + pts.map(p => p.map(v => v.toFixed(1)).join(",")).join("L") + "Z";
  }
  G.cellsSvg = (cells, opts) => {
    opts = opts || {}; const s = opts.s || 20, pad = 6;
    const w = Math.max(...cells.map(c => c[0])) + 1, h = Math.max(...cells.map(c => c[1])) + 1;
    const W = opts.box || Math.max(w, h) * s + pad * 2, ox = (W - w * s) / 2, oy = (W - h * s) / 2;
    const col = opts.fill || "#e8483f";
    // draw the union without inner grid lines: fill each cell with a matching stroke, then an outline pass
    const d = cells.map(c => cellPath(c, s, ox, oy)).join("");
    return `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="${opts.label || "shape"}"><rect width="${W}" height="${W}" fill="#fff"/><path d="${d}" fill="${col}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/>${opts.edges ? `<path d="${d}" fill="none" stroke="rgba(0,0,0,.28)" stroke-width=".8"/>` : ""}</svg>`;
  };

  /* =====================================================================================
     BLOCK DESIGN (rebuild a red and white pattern from two-color blocks)
     Block faces: 0 all white, 1 all red, 2..5 half red on a diagonal (red corner at NE, SE, SW, NW).
     ===================================================================================== */
  const BD_LEVELS = [null, { n: 2, halves: 1 }, { n: 2, halves: 2 }, { n: 2, halves: 3 }, { n: 2, halves: 4, sym: true }, { n: 3, halves: 3, sym: true }, { n: 3, halves: 5 }, { n: 3, halves: 6 }, { n: 3, halves: 8 }];
  G.BD_MAX = BD_LEVELS.length - 1;
  function genBlocks(seed, level) {
    const L = BD_LEVELS[Math.max(1, Math.min(G.BD_MAX, level))];
    const r = rng(seed + "|bd|" + level);
    const n = L.n, cells = n * n;
    for (let t = 0; t < 200; t++) {
      let faces = range(cells).map(() => r.pick([0, 1]));
      const halfAt = r.sample(range(cells), L.halves);
      halfAt.forEach(k => faces[k] = r.int(2, 5));
      if (L.sym) { // mirror symmetric designs (gestalt cues) like early real items
        faces = faces.map((f, k) => { const x = k % n, y = Math.floor(k / n); if (x < (n - 1) / 2) return f; const mk = y * n + (n - 1 - x); if (mk === k) return f; const g = faces[mk]; return g < 2 ? g : [0, 0, 5, 4, 3, 2][g]; });
      }
      const halves = faces.filter(f => f >= 2).length;
      if (halves < Math.min(L.halves, cells) - 1) continue;
      if (faces.every(f => f === faces[0])) continue;
      const limit = n === 2 ? (level <= 2 ? 30 : 60) : 120;
      return { type: "blocks", level, n, faces, limit, explain: "Match each block's face and turn. A half block has its red triangle in one of four corners." };
    }
    throw new Error("could not build a block design");
  }
  G.blockFaceSvg = (f, s, x, y) => {
    const R = "#d0342c", Wc = "#ffffff";
    const X = x, Y = y;
    if (f === 0) return `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${Wc}"/>`;
    if (f === 1) return `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${R}"/>`;
    const P = { NW: [X, Y], NE: [X + s, Y], SE: [X + s, Y + s], SW: [X, Y + s] };
    const tri = { 2: [P.NW, P.NE, P.SE], 3: [P.NE, P.SE, P.SW], 4: [P.SE, P.SW, P.NW], 5: [P.SW, P.NW, P.NE] }[f];
    return `<rect x="${X}" y="${Y}" width="${s}" height="${s}" fill="${Wc}"/><path d="M${tri.map(p => p.join(",")).join("L")}Z" fill="${R}"/>`;
  };

  /* =====================================================================================
     WORKING MEMORY
     ===================================================================================== */
  const noRuns = (r, len, pool) => { // no immediate repeats, no runs like 4-5-6 (as test manuals avoid)
    for (let t = 0; t < 500; t++) {
      const s = range(len).map(() => r.pick(pool));
      let ok = true;
      for (let i = 1; i < len; i++) { if (s[i] === s[i - 1]) ok = false; if (i > 1 && typeof s[i] === "number" && s[i] - s[i - 1] === s[i - 1] - s[i - 2] && Math.abs(s[i] - s[i - 1]) === 1) ok = false; }
      if (ok) return s;
    }
    return range(len).map(() => r.pick(pool));
  };
  const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // span items: two trials per length, as in the digit span tasks of the Wechsler scales
  G.genSpan = (seed, mode, len, trial) => {
    const r = rng(seed + "|span|" + mode + "|" + len + "|" + trial);
    let seq;
    if (mode === "sequencing") { // repeats allowed, so the ordered answer needs care
      seq = range(len).map(() => r.pick(DIGITS));
      for (let i = 1; i < len; i++) if (seq[i] === seq[i - 1]) seq[i] = (seq[i] % 9) + 1;
    } else seq = noRuns(r, len, DIGITS);
    const answer = mode === "forward" ? seq.slice() : mode === "backward" ? seq.slice().reverse() : seq.slice().sort((a, b) => a - b);
    return { type: "span", mode, len, trial, seq, answer };
  };
  const LETTERS = "ABCDEFGHJKLMNPQRSTUVZ".split(""); // no I/O (look like 1/0), no W/X/Y (long names when read aloud)
  G.genLNS = (seed, len, trial) => {
    const r = rng(seed + "|lns|" + len + "|" + trial);
    for (let t = 0; t < 200; t++) {
      const nNum = Math.max(1, Math.round(len / 2) - (r.chance(0.5) ? 0 : (len > 2 ? 1 : 0))), nLet = len - nNum;
      if (nLet < 1) continue;
      const nums = r.sample(DIGITS, nNum), lets = r.sample(LETTERS, nLet);
      const seq = r.shuffle(nums.map(String).concat(lets));
      let ok = true; for (let i = 1; i < seq.length; i++) if (/\d/.test(seq[i]) && /\d/.test(seq[i - 1]) && Math.abs(seq[i] - seq[i - 1]) === 1) ok = false;
      if (!ok) continue;
      const answer = nums.slice().sort((a, b) => a - b).map(String).concat(lets.slice().sort());
      return { type: "lns", len, trial, seq, answer };
    }
  };
  // running digits: a list of unknown length; recall only the last n
  G.genRunning = (seed, n, trial) => {
    const r = rng(seed + "|run|" + n + "|" + trial);
    const len = n + r.int(2, 6);
    const seq = noRuns(r, len, DIGITS);
    return { type: "running", n, trial, seq, answer: seq.slice(-n) };
  };
  // spatial addition: add two grids; blue in one grid only stays blue, blue in both turns white, red is ignored
  G.genSpatialAdd = (seed, level, trial) => {
    const r = rng(seed + "|sa|" + level + "|" + trial);
    const size = level <= 3 ? 3 : 4, cells = size * size;
    const blues = Math.min(cells - 2, 1 + level), reds = level >= 3 ? Math.min(3, level - 2) : 0;
    const mk = () => { const g = range(cells).map(() => 0); r.sample(range(cells), blues).forEach(k => g[k] = 1); r.sample(range(cells).filter(k => !g[k]), reds).forEach(k => g[k] = 2); return g; };
    const a = mk(), b = mk();
    const answer = range(cells).map(k => (a[k] === 1) !== (b[k] === 1) ? 1 : (a[k] === 1 && b[k] === 1) ? 3 : 0); // 1 blue, 3 white, 0 empty
    return { type: "spatialadd", level, trial, size, a, b, answer };
  };
  // symbol span: abstract designs to remember in order, then find them among look-alikes
  G.genSymbolSpan = (seed, len, trial) => {
    const r = rng(seed + "|ss|" + len + "|" + trial);
    const pool = range(len + Math.max(3, Math.ceil(len * 0.8))).map(k => symbolGlyph(seed + "|ssg|" + len + "|" + trial + "|" + k));
    return { type: "symbolspan", len, trial, shown: pool.slice(0, len), choices: r.shuffle(range(pool.length)), pool };
  };

  /* ---------- abstract glyphs for symbol span, symbol search and coding ---------- */
  function symbolGlyph(seed) {
    const r = rng(seed);
    const pts = [[15, 15], [50, 10], [85, 15], [90, 50], [85, 85], [50, 90], [15, 85], [10, 50], [50, 50], [32, 32], [68, 32], [68, 68], [32, 68]];
    const strokes = []; const n = r.int(2, 4);
    for (let i = 0; i < n; i++) {
      const a = r.pick(pts), b = r.pick(pts.filter(p => p !== a));
      if (r.chance(0.3)) strokes.push(`<path d="M${a[0]},${a[1]} Q${r.int(10, 90)},${r.int(10, 90)} ${b[0]},${b[1]}" fill="none"/>`);
      else strokes.push(`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`);
    }
    if (r.chance(0.45)) { const c = r.pick(pts); strokes.push(`<circle cx="${c[0]}" cy="${c[1]}" r="${r.int(6, 14)}" fill="none"/>`); }
    return strokes.join("");
  }
  G.glyph = symbolGlyph;
  G.glyphSvg = (g, label) => `<svg viewBox="0 0 100 100" role="img" aria-label="${label || "symbol"}"><g stroke="#111" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none">${g}</g></svg>`;

  /* =====================================================================================
     ARITHMETIC (heard or read once, solved without paper, 30 seconds)
     Templates in everyday settings; difficulty = number of steps and the kind of operation.
     ===================================================================================== */
  const NAMES = ["Sam", "Lea", "Omar", "Ines", "Tom", "Yuki", "Ana", "Marc", "Nora", "Theo"];
  const ARITH = [
    null,
    r => { const a = r.int(3, 9), b = r.int(2, 6); return [`${r.pick(NAMES)} has ${a} pens and buys ${b} more. How many pens are there now?`, a + b]; },
    r => { const a = r.int(12, 20), b = r.int(3, 9); return [`A shelf holds ${a} books. ${b} are taken away. How many books are left?`, a - b]; },
    r => { const a = r.int(3, 9), b = r.int(3, 6); return [`Tickets cost ${a} euros each. How much do ${b} tickets cost?`, a * b]; },
    r => { const b = r.int(3, 8), q = r.int(3, 9); return [`${b * q} chairs are set out in ${b} equal rows. How many chairs are in each row?`, q]; },
    r => { const p = r.int(2, 6), n = r.int(3, 7), pay = Math.ceil(p * n / 10) * 10 + (r.chance(0.5) ? 10 : 0); return [`Bread costs ${p} euros a loaf. You buy ${n} loaves and pay with ${pay} euros. How much change do you get?`, pay - p * n]; },
    r => { const s = r.int(40, 80) , h = r.int(2, 4), m = r.pick([30, 15]); return [`A train travels at ${s} km per hour. How far does it go in ${h} hours and ${m} minutes?`, s * h + s * m / 60]; },
    r => { const w = r.pick([3, 4, 5, 6]), d = r.pick([6, 8, 10, 12]), w2 = r.pick([2, 3]) * w; return [`${w} workers paint a fence in ${d} hours. How many hours would ${w2} workers take at the same speed?`, w * d / w2]; },
    r => { const price = r.pick([40, 60, 80, 120, 150, 200]), pct = r.pick([10, 15, 20, 25]); return [`A coat costs ${price} euros. It is reduced by ${pct} percent. What is the new price?`, price * (100 - pct) / 100]; },
    r => { const a = r.int(2, 5), b = r.int(2, 5), t = r.int(30, 60); return [`A recipe uses flour and sugar in the ratio ${a} to ${b}. A batch uses ${t * (a + b)} grams in total. How many grams of flour is that?`, t * a]; },
    r => { const x = r.int(5, 15), y = r.int(2, 6); return [`${r.pick(NAMES)} is ${y} times as old as a cousin. In ${x} years the sum of their ages will be ${(y + 1) * x + 2 * x}. How old is the cousin now?`, x]; },
    r => { const a = r.pick([20, 30, 40, 60]), b = r.pick([30, 60, 90]); return [`One tap fills a tank in ${a} minutes, another in ${b} minutes. Both run together. How many minutes does the tank take to fill?`, a * b / (a + b)]; },
  ];
  G.ARITH_MAX = ARITH.length - 1;
  G.genArith = (seed, level, trial) => {
    const lv = Math.max(1, Math.min(G.ARITH_MAX, level));
    for (let t = 0; t < 100; t++) {
      const r = rng(seed + "|ar|" + lv + "|" + trial + "|" + t);
      const [text, ans] = ARITH[lv](r);
      if (Number.isInteger(ans) && ans > 0) return { type: "arith", level: lv, trial, text, answer: ans };
    }
  };

  /* =====================================================================================
     PROCESSING SPEED
     ===================================================================================== */
  // coding: a key of 9 simple, clearly different symbols (original designs, drawn from a pool of 18)
  const CODE_GLYPHS = [
    '<line x1="20" y1="50" x2="80" y2="50"/><line x1="50" y1="20" x2="50" y2="50"/>',
    '<circle cx="50" cy="50" r="24"/><circle cx="50" cy="50" r="4"/>',
    '<polyline points="20,75 50,25 80,75"/>',
    '<line x1="25" y1="25" x2="75" y2="75"/><line x1="75" y1="25" x2="25" y2="75"/>',
    '<rect x="28" y="28" width="44" height="44"/>',
    '<line x1="30" y1="20" x2="30" y2="80"/><line x1="70" y1="20" x2="70" y2="80"/>',
    '<polyline points="25,30 50,70 75,30"/><line x1="25" y1="78" x2="75" y2="78"/>',
    '<path d="M25,65 Q50,15 75,65"/>',
    '<line x1="20" y1="35" x2="80" y2="35"/><line x1="20" y1="65" x2="80" y2="65"/><line x1="50" y1="35" x2="50" y2="65"/>',
    '<polyline points="30,20 70,50 30,80"/>',
    '<circle cx="50" cy="35" r="14"/><line x1="50" y1="49" x2="50" y2="82"/>',
    '<line x1="20" y1="80" x2="80" y2="20"/><line x1="50" y1="80" x2="80" y2="80"/>',
    '<polyline points="25,25 25,75 75,75"/><circle cx="58" cy="42" r="6"/>',
    '<path d="M20,50 Q35,25 50,50 T80,50"/>',
    '<polygon points="50,20 80,50 50,80 20,50"/>',
    '<line x1="50" y1="20" x2="50" y2="80"/><line x1="30" y1="40" x2="50" y2="20"/><line x1="70" y1="40" x2="50" y2="20"/>',
    '<polyline points="20,30 40,70 60,30 80,70"/>',
    '<rect x="30" y="30" width="40" height="40"/><line x1="30" y1="30" x2="70" y2="70"/>',
  ];
  G.genCoding = seed => {
    const r = rng(seed + "|code");
    const key = r.sample(CODE_GLYPHS, 9);
    const digits = []; for (let i = 0; i < 160; i++) { let d; do d = r.int(1, 9); while (d === digits[digits.length - 1]); digits.push(d); }
    return { type: "coding", key, digits };
  };
  // symbol search: two targets, a search group of five; is either target present?
  G.genSymbolSearch = seed => {
    const r = rng(seed + "|ssr");
    const bank = range(40).map(k => symbolGlyph(seed + "|ssrg|" + k));
    const items = range(80).map(i => {
      const targets = r.sample(range(bank.length), 2);
      const yes = r.chance(0.5);
      let group = r.sample(range(bank.length).filter(k => !targets.includes(k)), 5);
      if (yes) group[r.int(0, 4)] = r.pick(targets);
      return { targets, group, yes };
    });
    return { type: "symbolsearch", bank, items };
  };

  // naming speed quantity: boxes holding one to four squares in loose positions
  G.genQuantity = seed => {
    const r = rng(seed + "|nsq");
    const boxes = []; let last = 0;
    for (let i = 0; i < 200; i++) {
      let n; do n = r.int(1, 4); while (n === last); last = n;
      boxes.push(r.sample(range(9), n));
    }
    return { type: "quantity", boxes };
  };
  G.quantitySvg = pos => `<svg viewBox="0 0 100 100" role="img" aria-label="box"><rect x="3" y="3" width="94" height="94" fill="#fff" stroke="#111" stroke-width="3"/>${pos.map(p => `<rect x="${12 + (p % 3) * 27}" y="${12 + Math.floor(p / 3) * 27}" width="22" height="22" fill="#111"/>`).join("")}</svg>`;

  /* =====================================================================================
     SERIES (number and letter-number series, in the style of public-domain ICAR items)
     ===================================================================================== */
  const SERIES = [
    null,
    r => { const a = r.int(1, 9), d = r.int(2, 7); return range(6).map(i => a + d * i); },
    r => { const d = r.int(3, 9), a = 6 * d + r.int(2, 20); return range(6).map(i => a - d * i); },
    r => { const a = r.int(1, 4), m = r.pick([2, 3]); return range(6).map(i => a * Math.pow(m, i)); },
    r => { const a = r.int(1, 9), d = r.int(1, 3); let v = a, out = [v]; for (let i = 1; i < 6; i++) { v += d * i; out.push(v); } return out; },
    r => { const a = r.int(1, 9), b = r.int(20, 40), d = r.int(2, 5), e = r.int(1, 4); return range(7).map(i => i % 2 ? b - e * (i - 1) / 2 : a + d * i / 2); },
    r => { const a = r.int(1, 3), b = r.int(1, 4); const out = [a, b]; while (out.length < 7) out.push(out[out.length - 1] + out[out.length - 2]); return out; },
    r => { const a = r.int(2, 5), m = r.pick([2, 3]), d = r.int(1, 3); let v = a, out = [v]; for (let i = 1; i < 6; i++) { v = i % 2 ? v * m : v + d; out.push(v); } return out; },
    r => { const s = r.int(1, 4), c = r.int(0, 3); return range(6).map(i => (s + i) * (s + i) + c); },
    r => { const a = r.int(3, 6), c = r.int(1, 2); let v = a, out = [v]; for (let i = 1; i < 6; i++) { v = v * 2 - c; out.push(v); } return out; },
  ];
  G.SERIES_MAX = SERIES.length - 1;
  const LETTER = i => String.fromCharCode(65 + ((i % 26) + 26) % 26);
  G.genSeries = (seed, level) => {
    const lv = Math.max(1, Math.min(G.SERIES_MAX, level));
    const r = rng(seed + "|se|" + lv);
    const seq = SERIES[lv](r);
    // letters stand for their place in the alphabet (A = 1); only used when no letter would wrap past Z
    const useLetters = lv <= 5 && seq.every(v => v >= 1 && v <= 26) && r.chance(0.4);
    const answer = seq[seq.length - 1], shown = seq.slice(0, -1);
    const ok = v => v !== answer && (useLetters ? v >= 1 && v <= 26 : v >= 0);
    const wrong = [];
    const near = [answer + 1, answer - 1, answer + 2, answer - 2, answer + (seq[seq.length - 2] - seq[seq.length - 3]), seq[seq.length - 2] * 2, answer + 3, answer - 3, answer + 4];
    for (const v of r.shuffle(near)) if (ok(v) && !wrong.includes(v) && wrong.length < 4) wrong.push(v);
    const opts = r.shuffle([answer].concat(wrong));
    const show = v => useLetters ? LETTER(v - 1) : String(v);
    return { type: "series", level: lv, letters: useLetters, shown: shown.map(show), options: opts.map(show), correct: opts.indexOf(answer), explain: useLetters ? "Turn the letters into their places in the alphabet (A = 1, B = 2...), then look for the number pattern." : "Look at the differences between neighbours, then the differences of those differences, and check alternate positions." };
  };

  /* ---------- the matrices, weights and puzzles under one name for the task runner ---------- */
  G.genMatrix = genMatrix; G.genWeights = genWeights; G.genPuzzle = genPuzzle; G.genBlocks = genBlocks;
  G.canTile = canTile; G.rotations = rotations;

  if (typeof module !== "undefined" && module.exports) module.exports = G;
  else root.IQGEN = G;
})(typeof window !== "undefined" ? window : globalThis);
