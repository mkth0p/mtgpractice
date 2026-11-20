/* Building blocks of the Origins TCG page: DOM helpers, the tooltip, the chart forms, card chips and the pool of
   simulation workers. Everything hangs on OT.ui so that app.js only has to describe the sections. */
(function (root) {
  'use strict';
  const OT = root.OT, D = OT.data;

  // ---- DOM
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k === 'style') el.style.cssText = v;
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat(3)) if (kid != null && kid !== false) el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    return el;
  }
  const $ = (s, el) => (el || document).querySelector(s);
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
  const pct = (x, d) => (100 * x).toFixed(d == null ? 1 : d) + '%';
  const pts = (x, d) => (x >= 0 ? '+' : '−') + Math.abs(100 * x).toFixed(d == null ? 1 : d);
  const num = (x) => Math.round(x).toLocaleString('en-US');

  // ---- names
  const SHORT = { 'van-helsing': 'Van Helsing', 'three-not-so-little-pigs': 'Pigs', 'legion-of-the-dead': 'Legion', dracula: 'Dracula', 'robin-hood': 'Robin Hood', 'king-arthur': 'King Arthur',
    'queen-of-hearts': 'Queen of Hearts', dorothy: 'Dorothy', merlin: 'Merlin', mulan: 'Mulan', 'wicked-stepmother': 'Stepmother', 'dr-frank': 'Dr. Frank' };
  const TINY = { 'van-helsing': 'V. Helsing', 'three-not-so-little-pigs': 'Pigs', 'legion-of-the-dead': 'Legion', dracula: 'Dracula', 'robin-hood': 'Robin', 'king-arthur': 'Arthur',
    'queen-of-hearts': 'Q. Hearts', dorothy: 'Dorothy', merlin: 'Merlin', mulan: 'Mulan', 'wicked-stepmother': 'Stepmother', 'dr-frank': 'Dr. Frank' };
  const cname = (id) => (D.CARDS[id] ? D.CARDS[id].name : id);
  const KW = { defender: 'Defender', deathtouch: 'Deathtouch', trample: 'Trample', first: 'First Strike', double: 'Double Attack', rebirth: 'Rebirth', move: 'Move', shield: 'Shield' };

  // ---- tooltip: one element for the whole page, shown on hover and on keyboard focus
  const tipEl = $('#tip');
  let tipFor = null;
  function showTip(target, content, ev) {
    clear(tipEl);
    if (content.title) tipEl.append(h('b', { text: content.title }));
    for (const r of content.rows || []) tipEl.append(h('div', { class: 'r' }, h('span', { text: r[0] }), h('span', { text: r[1] })));
    if (content.note) tipEl.append(h('p', { text: content.note }));
    tipEl.classList.add('on');
    tipFor = target;
    const b = target.getBoundingClientRect(), t = tipEl.getBoundingClientRect();
    const cx = ev && ev.clientX != null && ev.pointerType !== 'touch' ? ev.clientX : b.left + b.width / 2;
    let x = cx - t.width / 2, y = b.top - t.height - 10;
    if (y < 8) y = b.bottom + 10;
    x = Math.max(8, Math.min(window.innerWidth - t.width - 8, x));
    tipEl.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  }
  function hideTip(target) { if (!target || tipFor === target) { tipEl.classList.remove('on'); tipFor = null; } }
  function tip(el, fn) {
    if (!el.hasAttribute('tabindex') && !/^(BUTTON|A|INPUT|SELECT)$/.test(el.tagName)) el.tabIndex = 0;
    el.addEventListener('pointerenter', (e) => showTip(el, fn(), e));
    el.addEventListener('pointermove', (e) => { if (tipFor === el && e.pointerType !== 'touch') showTip(el, fn(), e); });
    el.addEventListener('pointerleave', () => hideTip(el));
    el.addEventListener('focus', () => showTip(el, fn()));
    el.addEventListener('blur', () => hideTip(el));
    return el;
  }
  window.addEventListener('scroll', () => hideTip(), { passive: true });

  // ---- card chip
  function cardTip(id) {
    const c = D.CARDS[id];
    if (!c) return { title: id };
    const rows = [['Cost', String(c.cost)]];
    if (!c.spell && c.p != null) rows.push(['Power / health', c.p + ' / ' + c.h]);
    rows.push(['Kind', c.leg ? 'Legendary' : c.spell ? 'Spell' : 'Character']);
    return { title: c.name, rows, note: c.text || 'No ability.' };
  }
  function chip(id, opt) {
    opt = opt || {};
    const c = D.CARDS[id];
    const el = h(opt.button ? 'button' : 'div', { class: 'chip' + (c.leg ? ' leg' : '') + (opt.cls ? ' ' + opt.cls : ''), type: opt.button ? 'button' : null },
      h('span', { class: 'cost', text: c.cost }), h('span', { class: 'nm', text: c.name }),
      h('span', { class: 'st', text: opt.right != null ? opt.right : (c.spell || c.p == null ? 'spell' : c.p + '/' + c.h) }));
    return tip(el, () => { const t = cardTip(id); if (opt.extra) t.rows = t.rows.concat(opt.extra()); return t; });
  }
  const byCost = (a, b) => D.CARDS[a].cost - D.CARDS[b].cost || D.CARDS[a].name.localeCompare(D.CARDS[b].name);
  function cardGrid(ids, opt) { return h('div', { class: 'cards' }, ids.slice().sort(byCost).map((id) => chip(id, opt && opt(id)))); }

  // ---- table
  // cols: [{ t: header, n: numeric?, f: row => text | node }]
  function table(cols, rows, opt) {
    opt = opt || {};
    const tb = h('tbody');
    for (const r of rows) {
      const tr = h('tr', { class: opt.mark && opt.mark(r) ? 'you' : null });
      for (const c of cols) { const v = c.f(r); tr.append(h('td', { class: c.n ? 'n' : null }, v == null ? '–' : v)); }
      tb.append(tr);
    }
    // w: the least width of a text column in px, so that a wide table scrolls sideways before its sentences are squeezed into tall cells
    return h('table', null, h('thead', null, h('tr', null, cols.map((c) => h('th', { class: c.n ? 'n' : null, style: c.w ? `min-width:${c.w}px` : null, text: c.t })))), tb);
  }

  // ---- dot rows: values on one shared axis, with an interval or a second value
  // opt: { lo, hi, ticks: [..], ref, fmt, minor(t): tick label hidden on a narrow screen }   rows: [{ name, sub, tag, a, lo, hi, b, em, val, tip }]
  function dots(host, rows, opt) {
    clear(host);
    const x = (v) => 100 * (v - opt.lo) / (opt.hi - opt.lo);
    const clampX = (v) => Math.max(0, Math.min(100, x(v)));
    const grid = () => opt.ticks.map((t) => h('i', { class: 'g' + (t === opt.ref ? ' ref' : ''), style: `left:${x(t)}%` }));
    host.append(h('div', { class: 'axis', 'aria-hidden': 'true' }, h('span'), h('div', { class: 'track' }, opt.ticks.map((t) => h('span', { class: (opt.minor ? opt.minor(t) : Math.round(100 * t) % 20 === 0) ? 'minor' : null, style: `left:${x(t)}%`, text: opt.fmt ? opt.fmt(t) : pct(t, 0) }))), h('span')));
    for (const r of rows) {
      const track = h('div', { class: 'track' }, grid());
      if (r.lo != null) track.append(h('i', { class: 'whisk', style: `left:${clampX(r.lo)}%;width:${clampX(r.hi) - clampX(r.lo)}%` }));
      if (r.b != null && r.a != null) { const l = Math.min(clampX(r.a), clampX(r.b)), w = Math.abs(clampX(r.a) - clampX(r.b)); track.append(h('i', { class: 'link', style: `left:${l}%;width:${w}%` })); }
      if (r.a != null) track.append(h('i', { class: 'dot' + (opt.two ? ' a' : ''), style: `left:${clampX(r.a)}%` }));
      if (r.b != null) track.append(h('i', { class: 'dot b', style: `left:${clampX(r.b)}%` }));      // an outline, drawn last: both marks stay visible when they meet
      const name = h('div', { class: 'name' }, r.name, r.sub ? h('small', { text: ' ' + r.sub }) : null, r.tag ? h('span', { class: 'tag' + (r.tagPlain ? ' plain' : ''), text: r.tag }) : null);
      const row = h('div', { class: 'row' + (r.em ? ' em' : ''), role: 'img', 'aria-label': r.label || (r.name + ': ' + (r.val || '')) }, name, track, h('div', { class: 'val', text: r.val || '' }));
      if (r.tip) tip(row, r.tip);
      if (r.onclick) { row.style.cursor = 'pointer'; row.addEventListener('click', r.onclick); }
      host.append(row);
    }
  }

  // an axis in steps of 10 points that holds every value given and the 50% line
  function axisFor(values) {
    const lo = Math.min(0.4, Math.floor((Math.min(...values) - 0.02) * 10) / 10), hi = Math.max(0.6, Math.ceil((Math.max(...values) + 0.02) * 10) / 10);
    const ticks = [];
    for (let t = lo; t <= hi + 1e-9; t += 0.1) ticks.push(+t.toFixed(1));
    return { lo: lo - 0.03, hi: hi + 0.03, ticks, ref: 0.5 };
  }

  // ---- meters: one share from zero. rows: [{ name, v (0..1), on, val, tip }]
  function meters(host, rows, max) {
    clear(host);
    const m = max || Math.max(...rows.map((r) => r.v), 0.0001);
    host.classList.add('meters');
    for (const r of rows) {
      const el = h('div', { class: 'meter' }, h('span', { class: 'nm' + (r.on ? ' on' : ''), text: r.name }), h('div', { class: 'trk' }, h('i', { class: 'fill' + (r.on ? ' on' : ''), style: `width:${100 * r.v / m}%` })), h('span', { class: 'v', text: r.val }));
      if (r.tip) tip(el, r.tip);
      host.append(el);
    }
  }

  // ---- diverging bars around zero. rows: [{ name, v, val, tip }], span = the value at the end of the axis
  function divs(host, rows, span) {
    clear(host);
    const s = span || Math.max(...rows.map((r) => Math.abs(r.v)), 0.0001);
    host.classList.add('divs');
    for (const r of rows) {
      const w = Math.min(50, 50 * Math.abs(r.v) / s);
      const el = h('div', { class: 'div' }, h('span', { class: 'nm', text: r.name }),
        h('div', { class: 'trk' }, h('i', { class: 'zero' }), h('i', { class: 'fill ' + (r.v >= 0 ? 'pos' : 'neg') + (r.dim ? ' dim' : ''), style: `width:${w}%` })), h('span', { class: 'v', text: r.val }));
      if (r.tip) tip(el, r.tip);
      host.append(el);
    }
  }

  // ---- heatmap of win rates, diverging around 50%
  const STEPS = [0.03, 0.08, 0.16, 0.28];     // distance from 50% where each step starts
  const stepOf = (p) => { const d = p - 0.5, a = Math.abs(d); let k = 0; while (k < STEPS.length && a >= STEPS[k]) k++; return k ? (d > 0 ? 'b' : 'r') + k : ''; };
  function heat(host, items, wr, tipFn) {
    clear(host);
    host.style.setProperty('--n', items.length);
    host.append(h('div'));
    for (const it of items) host.append(h('div', { class: 'ch' }, h('span', { text: it.short })));
    items.forEach((a, i) => {
      host.append(h('div', { class: 'rh', text: a.short }));
      items.forEach((b, j) => {
        if (i === j) { host.append(h('div', { class: 'c self', 'aria-hidden': 'true' })); return; }
        const p = wr(i, j);
        const c = h('div', { class: 'c ' + stepOf(p), role: 'img', 'aria-label': `${a.name} against ${b.name}: ${pct(p, 0)}` }, h('span', { text: Math.round(100 * p) }));
        tip(c, () => tipFn(i, j, p));
        host.append(c);
      });
    });
  }
  function ramp(host) {
    clear(host);
    for (const k of ['r4', 'r3', 'r2', 'r1', '', 'b1', 'b2', 'b3', 'b4']) host.append(h('i', { class: 'c ' + k, style: 'aspect-ratio:auto;height:12px;width:16px;border-radius:2px' }));
    host.classList.add('hm'); host.style.display = 'inline-flex'; host.style.gap = '2px';
  }

  // ---- scatter with the line of equality. points: [{ x, y, label, tip }], both axes in percent
  function scatter(host, points, opt) {
    clear(host);
    const W = 420, H = 380, m = { l: 44, r: 16, t: 14, b: 42 };
    const lo = opt.lo, hi = opt.hi;
    const sx = (v) => m.l + (W - m.l - m.r) * (v - lo) / (hi - lo), sy = (v) => H - m.b - (H - m.t - m.b) * (v - lo) / (hi - lo);
    const NS = 'http://www.w3.org/2000/svg';
    const s = (tag, attrs, text) => { const el = document.createElementNS(NS, tag); for (const k in attrs) el.setAttribute(k, attrs[k]); if (text != null) el.textContent = text; return el; };
    const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': opt.label || 'Scatter plot' });
    for (let t = lo; t <= hi; t += opt.step || 10) {
      svg.append(s('line', { class: 'gl', x1: sx(t), x2: sx(t), y1: sy(lo), y2: sy(hi) }), s('line', { class: 'gl', x1: sx(lo), x2: sx(hi), y1: sy(t), y2: sy(t) }));
      svg.append(s('text', { x: sx(t), y: H - m.b + 16, 'text-anchor': 'middle' }, t + '%'), s('text', { x: m.l - 8, y: sy(t) + 3, 'text-anchor': 'end' }, t + '%'));
    }
    svg.append(s('line', { class: 'ax', x1: sx(lo), x2: sx(hi), y1: sy(lo), y2: sy(lo) }), s('line', { class: 'ax', x1: sx(lo), x2: sx(lo), y1: sy(lo), y2: sy(hi) }));
    svg.append(s('line', { class: 'diag', x1: sx(lo), y1: sy(lo), x2: sx(hi), y2: sy(hi) }));
    svg.append(s('text', { class: 'ttl', x: sx((lo + hi) / 2), y: H - 6, 'text-anchor': 'middle' }, opt.xt), s('text', { class: 'ttl', x: 12, y: sy((lo + hi) / 2), 'text-anchor': 'middle', transform: `rotate(-90 12 ${sy((lo + hi) / 2)})` }, opt.yt));
    // labels: tried to the right, left, above and below each point; the first spot that touches no point and no
    // earlier label wins, otherwise the spot that touches the fewest
    const boxes = points.map((p) => ({ x: sx(p.x) - 8, y: sy(p.y) - 8, w: 16, h: 16 }));
    const hits = (b) => boxes.filter((q) => b.x < q.x + q.w && q.x < b.x + b.w && b.y < q.y + q.h && q.y < b.y + b.h).length;
    points.forEach((p, i) => {
      const cx = sx(p.x), cy = sy(p.y), w = p.label.length * 6.3 + 2;
      const spots = [{ x: cx + 10, y: cy - 6 }, { x: cx - 10 - w, y: cy - 6 }, { x: cx - w / 2, y: cy - 22 }, { x: cx - w / 2, y: cy + 10 }, { x: cx + 9, y: cy - 19 }, { x: cx + 9, y: cy + 7 }, { x: cx - 9 - w, y: cy - 19 }, { x: cx - 9 - w, y: cy + 7 }]
        .map((o) => ({ x: o.x, y: o.y, w, h: 13 })).filter((q) => q.x >= m.l && q.x + q.w <= W - 2 && q.y >= 0 && q.y + q.h <= H - m.b);
      const own = boxes[i];
      boxes[i] = { x: -99, y: -99, w: 0, h: 0 };
      let best = spots[0] || { x: cx + 10, y: cy - 6, w, h: 13 }, bestN = Infinity;
      for (const q of spots) { const n = hits(q); if (n < bestN) { best = q; bestN = n; if (!n) break; } }
      boxes[i] = own;
      boxes.push(best);
      svg.append(s('text', { class: 'lb', x: best.x, y: best.y + 10 }, p.label));
    });
    for (const p of points) {
      const c = s('circle', { class: 'pt', cx: sx(p.x), cy: sy(p.y), r: 6, tabindex: 0, role: 'img', 'aria-label': p.aria || p.label });
      tip(c, p.tip);
      svg.append(c);
    }
    host.append(svg);
  }

  // ---- segmented control
  function seg(host, items, value, onChange) {
    clear(host);
    for (const it of items) {
      const b = h('button', { type: 'button', 'aria-pressed': String(it.v === value), text: it.t });
      b.addEventListener('click', () => { for (const x of host.children) x.setAttribute('aria-pressed', String(x === b)); onChange(it.v); });
      host.append(b);
    }
  }
  function bindSeg(host, onChange) {
    for (const b of host.querySelectorAll('button')) b.addEventListener('click', () => { for (const x of host.querySelectorAll('button')) x.setAttribute('aria-pressed', String(x === b)); onChange(b.dataset.v); });
  }

  // ---- simulation workers
  const Sim = (() => {
    const workers = [];
    const cbs = new Map();
    let seq = 0;
    const size = () => Math.max(1, Math.min(6, (navigator.hardwareConcurrency || 4) - 1));
    function ensure(n) {
      while (workers.length < n) {
        const w = new Worker('worker.js?v=1');
        w.onmessage = (e) => { const cb = cbs.get(e.data.id); if (cb) cb(e.data); };
        w.onerror = (e) => { for (const cb of cbs.values()) cb({ type: 'error', error: e.message || 'worker failed' }); };
        workers.push(w);
      }
    }
    function stop() { for (const w of workers) w.postMessage({ type: 'stop' }); cbs.clear(); }
    // deck against a list of opponents; onProgress gets the per-opponent tallies so far
    function vs(deck, opps, n, bot, seed, onProgress) {
      const nw = Math.min(size(), opps.length);
      ensure(nw);
      const tally = opps.map((o) => ({ key: o.key, w: 0, n: 0, rounds: 0 }));
      const parts = Array.from({ length: nw }, () => []);
      opps.forEach((o, j) => parts[j % nw].push({ key: o.key, legend: o.legend, cards: o.cards, j }));
      const total = opps.length * n * 2;
      return new Promise((resolve, reject) => {
        let left = nw;
        const done = new Array(nw).fill(0);
        parts.forEach((part, k) => {
          const id = ++seq;
          cbs.set(id, (m) => {
            if (m.type === 'error') { stop(); reject(new Error(m.error)); return; }
            for (const r of m.res) { const t = tally[part.find((o) => o.key === r.key).j]; t.w = r.w; t.n = r.n; t.rounds = r.rounds; }
            done[k] = m.done;
            if (onProgress) onProgress(tally, done.reduce((a, b) => a + b, 0) / total);
            if (m.type === 'done') { cbs.delete(id); if (--left === 0) resolve(tally); }
          });
          workers[k].postMessage({ type: 'vs', id, deck: { legend: deck.legend, cards: deck.cards }, opps: part, n, bot, seed });
        });
      });
    }
    function game(a, b, bot, seed) {
      ensure(1);
      const id = ++seq;
      return new Promise((resolve, reject) => {
        cbs.set(id, (m) => { cbs.delete(id); if (m.type === 'error') reject(new Error(m.error)); else resolve(m); });
        workers[0].postMessage({ type: 'game', id, a: { legend: a.legend, cards: a.cards }, b: { legend: b.legend, cards: b.cards }, bot, seed });
      });
    }
    return { vs, game, stop, size };
  })();

  // weighted win rate of a tally against opponents with weights w
  function fieldRate(tally, opps) {
    let s = 0, t = 0, v = 0, games = 0;
    tally.forEach((r, j) => { if (!r.n) return; const p = r.w / r.n, w = opps[j].w == null ? 1 : opps[j].w; s += w * p; t += w; v += w * w * p * (1 - p) / r.n; games += r.n; });
    return t ? { p: s / t, se: Math.sqrt(v) / t, games } : { p: 0.5, se: 0, games: 0 };
  }

  OT.ui = { h, $, clear, pct, pts, num, SHORT, TINY, KW, cname, tip, hideTip, cardTip, chip, cardGrid, byCost, table, dots, axisFor, meters, divs, heat, ramp, stepOf, STEPS, scatter, seg, bindSeg, Sim, fieldRate };
})(typeof self !== 'undefined' ? self : this);
