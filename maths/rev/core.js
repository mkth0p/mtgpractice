/* Révision Outils Maths 3 — moteur de la page (routage, progression, vérification, figures). */
(function () {
  'use strict';

  var OM = window.OM = {
    chapters: [], byCh: {}, exos: {}, gens: [], genById: {}, mcqs: [], exam: null, tools: [], tables: null,
    EXAM_DATE: new Date(2026, 11, 11, 8, 0, 0)
  };

  /* ---------- helpers exposed to the content files ---------- */
  function fr(x, d) {
    if (typeof x !== 'number' || !isFinite(x)) return String(x);
    var s = d == null ? String(+x.toPrecision(12)) : x.toFixed(d);
    if (s.indexOf('e') >= 0) return s;
    var neg = s.charAt(0) === '-';
    if (neg) s = s.slice(1);
    var parts = s.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    s = parts.join(',');
    if (neg && /[1-9]/.test(s)) s = '−' + s;
    return s;
  }
  function F(a, b) { return '<span class="fr"><span>' + a + '</span><span>' + b + '</span></span>'; }
  function R(x) { return '<span class="rt">√<span>' + x + '</span></span>'; }
  function ov(x) { return '<span class="ov">' + x + '</span>'; }
  function M(x) { return '<span class="m">' + x + '</span>'; }
  function MB(x) { return '<span class="mb">' + x + '</span>'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* tbl(rows, {head: true, cls: '', hl: [[r,c]], left: true}) — rows are arrays of cell html */
  function tbl(rows, o) {
    o = o || {};
    var h = '<div class="tw"><table class="t ' + (o.cls || '') + '">';
    rows.forEach(function (r, i) {
      h += '<tr>';
      r.forEach(function (c, j) {
        var tag = (o.head !== false && i === 0) || (o.side && j === 0) ? 'th' : 'td';
        var cls = [];
        if (o.left && j === 0) cls.push('l');
        if (o.hl && o.hl.some(function (p) { return p[0] === i && p[1] === j; })) cls.push('hl');
        h += '<' + tag + (cls.length ? ' class="' + cls.join(' ') + '"' : '') + '>' + c + '</' + tag + '>';
      });
      h += '</tr>';
    });
    return h + '</table></div>';
  }
  var H = OM.h = { fr: fr, F: F, R: R, ov: ov, M: M, MB: MB, esc: esc, tbl: tbl };

  /* ---------- SVG figures ---------- */
  function svgText(x, y, s, cls, anchor) {
    var over = false;
    if (s && s.charAt(0) === '!') { over = true; s = s.slice(1); }
    var t = '<text x="' + x + '" y="' + y + '" class="' + (cls || 's-txt') + '" text-anchor="' + (anchor || 'middle') + '">' + esc(s) + '</text>';
    if (over) {
      var w = s.length * 7.2;
      var x0 = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
      t += '<line x1="' + (x0 + .5) + '" y1="' + (y - 13) + '" x2="' + (x0 + w - .5) + '" y2="' + (y - 13) + '" class="s-ax" />';
    }
    return t;
  }
  /* tree({root:[{l:'F', p:'0,30', c:[{l:'R', p:'0,38', x:'0,114'}, ...]}, ...]}) ; '!R' draws R with a bar */
  function tree(spec) {
    var L1 = spec.root, leaves = 0;
    L1.forEach(function (n) { leaves += (n.c && n.c.length) || 1; });
    var gap = spec.gap || 34, W = spec.w || 340, Hh = leaves * gap + 16;
    var x0 = 14, x1 = spec.prod ? 118 : 150, x2 = spec.prod ? 220 : 290, y = 8 + gap / 2;
    var out = '';
    var rootY = 0, pos1 = [];
    L1.forEach(function (n) {
      var kids = n.c || [], ys = [];
      if (!kids.length) { ys.push(y); y += gap; }
      kids.forEach(function () { ys.push(y); y += gap; });
      var ny = ys.reduce(function (a, b) { return a + b; }, 0) / ys.length;
      pos1.push({ n: n, y: ny, ys: ys });
      rootY += ny;
    });
    rootY /= pos1.length;
    pos1.forEach(function (p) {
      out += '<line x1="' + (x0 + 6) + '" y1="' + rootY + '" x2="' + (x1 - 14) + '" y2="' + p.y + '" class="s-br" />';
      out += svgText((x0 + x1) / 2 - 4, (rootY + p.y) / 2 - 5, p.n.p, 's-prob');
      out += svgText(x1, p.y + 5, p.n.l, 's-node');
      (p.n.c || []).forEach(function (k, i) {
        var ky = p.ys[i];
        out += '<line x1="' + (x1 + 14) + '" y1="' + p.y + '" x2="' + (x2 - 14) + '" y2="' + ky + '" class="s-br" />';
        out += svgText((x1 + x2) / 2, (p.y + ky) / 2 - 5, k.p, 's-prob');
        out += svgText(x2, ky + 5, k.l, 's-node');
        if (k.x) out += svgText(x2 + 22, ky + 5, '→ ' + k.x, 's-mut', 'start');
      });
    });
    out += '<circle cx="' + x0 + '" cy="' + rootY + '" r="4" class="s-dot" />';
    return '<div class="figure"><svg viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" role="img" aria-label="' + esc(spec.alt || 'Arbre pondéré') + '">' + out + '</svg></div>';
  }
  function niceTicks(lo, hi, n) {
    var span = hi - lo, step = Math.pow(10, Math.floor(Math.log10(span / n)));
    var err = span / n / step;
    if (err >= 7.5) step *= 10; else if (err >= 3.5) step *= 5; else if (err >= 1.5) step *= 2;
    var t = [], v = Math.ceil(lo / step) * step;
    for (; v <= hi + step * 1e-9; v += step) t.push(+v.toFixed(10));
    return t;
  }
  function frame(o) {
    var W = o.W || 340, Hh = o.H || 210, ml = o.ml || 42, mr = 12, mt = 12, mb = o.xl ? 40 : 26;
    var X = function (v) { return ml + (v - o.x0) / (o.x1 - o.x0) * (W - ml - mr); };
    var Y = function (v) { return mt + (1 - (v - o.y0) / (o.y1 - o.y0)) * (Hh - mt - mb); };
    var g = '';
    (o.yt || []).forEach(function (t) { g += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + Y(t) + '" y2="' + Y(t) + '" class="s-grid" />' + svgText(ml - 6, Y(t) + 4, fr(t), 's-mut', 'end'); });
    (o.xt || []).forEach(function (t) { g += '<line y1="' + (Hh - mb) + '" y2="' + (Hh - mb + 4) + '" x1="' + X(t) + '" x2="' + X(t) + '" class="s-ax" />' + svgText(X(t), Hh - mb + 16, fr(t), 's-mut'); });
    g += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + (Hh - mb) + '" y2="' + (Hh - mb) + '" class="s-ax" />';
    g += '<line x1="' + ml + '" x2="' + ml + '" y1="' + mt + '" y2="' + (Hh - mb) + '" class="s-ax" />';
    if (o.xl) g += svgText((ml + W - mr) / 2, Hh - 6, o.xl, 's-mut');
    if (o.yl) g += svgText(ml + 4, mt + 2, o.yl, 's-mut', 'start');
    return { X: X, Y: Y, g: g, W: W, H: Hh };
  }
  function wrapSvg(f, body, alt) {
    return '<div class="figure"><svg viewBox="0 0 ' + f.W + ' ' + f.H + '" width="' + f.W + '" role="img" aria-label="' + esc(alt || 'Graphique') + '">' + f.g + body + '</svg></div>';
  }
  /* hist({b:[bornes], h:[hauteurs], xl, yl, yt}) */
  function hist(s) {
    var top = Math.max.apply(null, s.h) * 1.12;
    var f = frame({ x0: s.b[0], x1: s.b[s.b.length - 1], y0: 0, y1: top, xt: s.xt || s.b, yt: s.yt || niceTicks(0, top, 4), xl: s.xl, yl: s.yl, W: s.W, H: s.H });
    var body = '';
    s.h.forEach(function (h, i) {
      var xa = f.X(s.b[i]), xb = f.X(s.b[i + 1]), ya = f.Y(h);
      body += '<rect x="' + xa + '" y="' + ya + '" width="' + (xb - xa) + '" height="' + (f.Y(0) - ya) + '" class="s-bar" />';
      if (s.lab) body += svgText((xa + xb) / 2, ya - 4, s.lab[i], 's-mut');
    });
    return wrapSvg(f, body, s.alt || 'Histogramme');
  }
  /* curve({pts:[[x,y]], pts2, xt, yt, xl, yl, mark:[x,y]}) */
  function curve(s) {
    var all = s.pts.concat(s.pts2 || []);
    var xs = all.map(function (p) { return p[0]; }), ys = all.map(function (p) { return p[1]; });
    var x0 = s.x0 != null ? s.x0 : Math.min.apply(null, xs), x1 = s.x1 != null ? s.x1 : Math.max.apply(null, xs);
    var y1 = s.y1 != null ? s.y1 : Math.max.apply(null, ys) * 1.08, y0 = s.y0 != null ? s.y0 : 0;
    var f = frame({ x0: x0, x1: x1, y0: y0, y1: y1, xt: s.xt || niceTicks(x0, x1, 6), yt: s.yt || niceTicks(y0, y1, 4), xl: s.xl, yl: s.yl, W: s.W, H: s.H });
    function line(pts, cls) {
      return '<polyline points="' + pts.map(function (p) { return f.X(p[0]) + ',' + f.Y(p[1]); }).join(' ') + '" class="' + cls + '" />' +
        pts.map(function (p) { return '<circle cx="' + f.X(p[0]) + '" cy="' + f.Y(p[1]) + '" r="3" class="' + (cls === 's-line2' ? 's-dot2' : 's-dot') + '" />'; }).join('');
    }
    var body = line(s.pts, 's-line');
    if (s.pts2) body += line(s.pts2, 's-line2');
    if (s.mark) {
      body += '<line x1="' + f.X(s.mark[0]) + '" x2="' + f.X(s.mark[0]) + '" y1="' + f.Y(s.mark[1]) + '" y2="' + f.Y(y0) + '" class="s-dash" />';
      body += '<line x1="' + f.X(x0) + '" x2="' + f.X(s.mark[0]) + '" y1="' + f.Y(s.mark[1]) + '" y2="' + f.Y(s.mark[1]) + '" class="s-dash" />';
      if (s.markLabel) body += svgText(f.X(s.mark[0]) + 4, f.Y(y0) - 6, s.markLabel, 's-txt', 'start');
    }
    return wrapSvg(f, body, s.alt || 'Courbe');
  }
  /* scat({pts:[[x,y]], fn: x=>y, xt, yt, xl, yl}) */
  function scat(s) {
    var xs = s.pts.map(function (p) { return p[0]; }), ys = s.pts.map(function (p) { return p[1]; });
    var x0 = s.x0 != null ? s.x0 : Math.min.apply(null, xs), x1 = s.x1 != null ? s.x1 : Math.max.apply(null, xs);
    var y0 = s.y0 != null ? s.y0 : 0, y1 = s.y1 != null ? s.y1 : Math.max.apply(null, ys) * 1.1;
    var f = frame({ x0: x0, x1: x1, y0: y0, y1: y1, xt: s.xt || niceTicks(x0, x1, 6), yt: s.yt || niceTicks(y0, y1, 4), xl: s.xl, yl: s.yl, W: s.W, H: s.H });
    var body = '';
    if (s.fn) {
      var pts = [];
      for (var i = 0; i <= 60; i++) {
        var x = x0 + (x1 - x0) * i / 60, y = s.fn(x);
        if (isFinite(y) && y >= y0 && y <= y1) pts.push(f.X(x) + ',' + f.Y(y));
      }
      body += '<polyline points="' + pts.join(' ') + '" class="s-line" />';
    }
    s.pts.forEach(function (p) { body += '<circle cx="' + f.X(p[0]) + '" cy="' + f.Y(p[1]) + '" r="3.6" class="s-dot2" />'; });
    return wrapSvg(f, body, s.alt || 'Nuage de points');
  }
  H.tree = tree; H.hist = hist; H.curve = curve; H.scat = scat;

  /* ---------- math helpers ---------- */
  function erf(x) {
    var s = x < 0 ? -1 : 1; x = Math.abs(x);
    var t = 1 / (1 + 0.5 * x);
    var y = 1 - t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return s * y;
  }
  function Phi(t) { return 0.5 * (1 + erf(t / Math.SQRT2)); }
  function pi4(t) { return Math.round(Phi(t) * 1e4) / 1e4; }               /* valeur de table, 4 décimales */
  function piTab(t) { var r = Math.round(t * 100) / 100; return r >= 0 ? pi4(r) : Math.round((1 - pi4(-r)) * 1e4) / 1e4; }
  function comb(n, k) { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); var c = 1; for (var i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; }
  function fact(n) { var f = 1; for (var i = 2; i <= n; i++) f *= i; return f; }
  function binom(n, p, k) { return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k); }
  function pois(l, k) { return Math.exp(-l) * Math.pow(l, k) / fact(k); }
  function round(x, d) { var m = Math.pow(10, d); return Math.round(x * m) / m; }
  OM.math = { erf: erf, Phi: Phi, pi4: pi4, piTab: piTab, comb: comb, fact: fact, binom: binom, pois: pois, round: round };

  /* ---------- storage ---------- */
  var KEY = 'om3.v2';
  var S = { prog: {}, plan: {}, err: {}, gs: {}, notes: '', exam: null, quizCh: 'all', lastEx: null };
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); for (var k in o) S[k] = o[k]; } } catch (e) { /* stockage indisponible */ }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }
  OM.S = S; OM.save = save;

  /* ---------- registration ---------- */
  OM.chapter = function (c) {
    OM.chapters.push(c); OM.byCh[c.id] = c;
    (c.td || []).forEach(function (ex) { ex.ch = c.id; ex.id = c.id + '-' + ex.n; OM.exos[ex.id] = ex; });
    (c.ex || []).forEach(function (ex) { ex.ch = c.id; ex.id = c.id + '-' + ex.n; ex.guided = true; OM.exos[ex.id] = ex; });
  };
  OM.gen = function (g) { OM.gens.push(g); OM.genById[g.id] = g; };
  OM.mcq = function (ch, list) {
    list.forEach(function (m, i) {
      var g = { id: 'mcq' + ch + '-' + i, ch: ch, t: 'Question de cours', mcq: true, make: function (R) {
        var idx = R.shuffle(m[1].map(function (_, j) { return j; }));
        return { q: m[0], c: idx.map(function (j) { return m[1][j]; }), a: idx.indexOf(m[2]), sol: [m[3]] };
      } };
      OM.gens.push(g); OM.genById[g.id] = g;
    });
  };

  /* ---------- answers ---------- */
  /* Lecteur de calculs (repris de la première version de la page) : + − × / ^ ( ) √ e ln log exp n! %,
     C(n ; k), A(n ; k) et π(t) = valeur de la table de la loi normale. Les parenthèses oubliées à la fin sont fermées. */
  OM.expr = (function () {
    function table(t) { var a = Math.round(Math.abs(t) * 100) / 100; var v = Math.round(Phi(a) * 10000) / 10000; return t < 0 ? Math.round((1 - v) * 10000) / 10000 : v; }
    function whole(n) { return isFinite(n) && Math.abs(n - Math.round(n)) < 1e-9; }
    function fct(n) { if (!whole(n) || n < 0 || n > 170) throw new Error('n! demande un entier positif.'); n = Math.round(n); var r = 1; for (var i = 2; i <= n; i++) r *= i; return r; }
    function cmb(n, k) { if (!whole(n) || !whole(k) || k < 0 || k > n) throw new Error('C(n ; k) demande deux entiers avec 0 ≤ k ≤ n.'); n = Math.round(n); k = Math.round(Math.min(k, n - k)); var r = 1; for (var i = 1; i <= k; i++) r = r * (n - k + i) / i; return r < 9e15 ? Math.round(r) : r; }
    function arr(n, k) { if (!whole(n) || !whole(k) || k < 0 || k > n) throw new Error('A(n ; k) demande deux entiers avec 0 ≤ k ≤ n.'); n = Math.round(n); k = Math.round(k); var r = 1; for (var i = n - k + 1; i <= n; i++) r *= i; return r; }
    var F1 = { sqrt: Math.sqrt, racine: Math.sqrt, rac: Math.sqrt, exp: Math.exp, ln: Math.log, log: function (x) { return Math.log(x) / Math.LN10; }, pi: table, phi: table };
    var F2 = { c: cmb, comb: cmb, binom: cmb, ncr: cmb, a: arr, npr: arr };
    var NAMES = ['racine', 'binom', 'sqrt', 'comb', 'exp', 'log', 'rac', 'phi', 'ncr', 'npr', 'ln', 'pi', 'c', 'a', 'e', 'x'];
    var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
    function norm(s) {
      s = s.replace(/[−–—]/g, '-').replace(/[×·⋅∙✕]/g, '*').replace(/[÷:]/g, '/').replace(/[\[{]/g, '(').replace(/[\]}]/g, ')');
      s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g, function (m) { return '^(' + m.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, function (c) { return String(SUP.indexOf(c)); }).replace(/⁻/g, '-').replace(/⁺/g, '+') + ')'; });
      s = s.replace(/^\s*[=≈]+/, '').replace(/[=≈]+\s*$/, '');
      s = s.replace(/(\d)\s+(?=\d{3}(?!\d))/g, '$1');
      s = s.replace(/(^|[^\d.,])(\d+)\s*(?:[nN][cC][rR]|C)\s*(\d+)/g, '$1C($2;$3)');
      return s;
    }
    function lex(s) {
      var out = [], i = 0, m;
      while (i < s.length) {
        var ch = s.charAt(i), rest = s.slice(i);
        if (/\s/.test(ch)) { i++; continue; }
        if ((m = /^(?:\d+(?:[.,]\d+)?|\.\d+)/.exec(rest))) { out.push({ t: 'n', v: Number(m[0].replace(',', '.')), raw: m[0] }); i += m[0].length; continue; }
        if ((m = /^[a-zA-Z]+/.exec(rest))) {
          var w = m[0].toLowerCase(), j = 0;
          while (j < w.length) {
            var hit = '';
            for (var k = 0; k < NAMES.length; k++) if (NAMES[k].length > hit.length && w.substr(j, NAMES[k].length) === NAMES[k]) hit = NAMES[k];
            if (!hit) throw new Error('Je ne connais pas « ' + m[0] + ' ».');
            out.push(hit === 'x' ? { t: 'o', v: '*' } : { t: 'f', v: hit });
            j += hit.length;
          }
          i += m[0].length; continue;
        }
        if (ch === 'π' || ch === 'Π') { out.push({ t: 'f', v: 'pi' }); i++; continue; }
        if (ch === 'Φ' || ch === 'φ') { out.push({ t: 'f', v: 'phi' }); i++; continue; }
        if (ch === '√') { out.push({ t: 'f', v: 'sqrt' }); i++; continue; }
        if ('+-*/^()!%'.indexOf(ch) >= 0) { out.push({ t: 'o', v: ch }); i++; continue; }
        if (ch === ';' || ch === ',') { out.push({ t: 'o', v: ';', raw: ch }); i++; continue; }
        throw new Error('Signe non reconnu : « ' + ch + ' ».');
      }
      return out;
    }
    function parse(tk) {
      var p = 0;
      function is(v) { var t = tk[p]; return !!t && t.t === 'o' && t.v === v; }
      function eat(v) { if (is(v)) { p++; return true; } return false; }
      function stuck() { var t = tk[p]; if (!t) return 'Calcul incomplet.'; if (t.t === 'n') return 'Il manque un signe entre deux nombres.'; if (t.v === ';') return t.raw === ',' ? 'Écris les décimales sans espace, par exemple 0,6.' : 'Le « ; » sert seulement dans C(n ; k).'; if (t.v === ')') return 'Parenthèse fermante en trop.'; return 'Calcul incomplet.'; }
      function close() { if (!eat(')')) throw new Error(stuck()); }
      function expr() { var v = term(); for (;;) { if (eat('+')) v += term(); else if (eat('-')) v -= term(); else return v; } }
      function term() {
        var v = unary();
        for (;;) {
          if (eat('*')) v *= unary();
          else if (eat('/')) v /= unary();
          else if (tk[p] && (tk[p].t === 'f' || is('(') || (tk[p].t === 'n' && tk[p - 1] && tk[p - 1].t === 'o' && (tk[p - 1].v === ')' || tk[p - 1].v === '!')))) v *= power();
          else return v;
        }
      }
      function unary() { if (eat('-')) return -unary(); if (eat('+')) return unary(); return power(); }
      function power() { var b = post(); return eat('^') ? Math.pow(b, unary()) : b; }
      function post() { var v = prim(); for (;;) { if (eat('!')) v = fct(v); else if (eat('%')) v /= 100; else return v; } }
      function prim() {
        var t = tk[p];
        if (!t) throw new Error('Calcul incomplet.');
        if (t.t === 'n') { p++; return t.v; }
        if (eat('(')) { var v = expr(); close(); return v; }
        if (t.t !== 'f') throw new Error('Calcul incomplet.');
        p++;
        var f = t.v;
        if (f === 'e') return Math.E;
        if (f === 'pi' && !is('(')) return Math.PI;
        if (F2[f]) {
          var L = (f === 'a' || f === 'npr') ? 'A' : 'C', how = 'Écris ' + L + '(n ; k), par exemple ' + L + '(10;3).';
          if (!eat('(')) throw new Error(how);
          var a, b, n1 = tk[p], n2 = tk[p + 1];
          if (n1 && n1.t === 'n' && n1.raw.indexOf(',') > 0 && n2 && n2.t === 'o' && n2.v === ')') { var parts = n1.raw.split(','); a = +parts[0]; b = +parts[1]; p += 2; }
          else { a = expr(); if (!eat(';')) throw new Error(how); b = expr(); close(); }
          return F2[f](a, b);
        }
        if (eat('(')) { var x = expr(); close(); return F1[f](x); }
        if (f === 'phi') throw new Error('Écris π(t) avec des parenthèses, par exemple π(1,25).');
        return F1[f](unary());
      }
      var v = expr();
      if (p < tk.length) throw new Error(stuck());
      return v;
    }
    function read(s) {
      var src = String(s == null ? '' : s).trim();
      if (!src) return { v: NaN, err: '', expr: false };
      try {
        var tk = lex(norm(src));
        if (!tk.length) return { v: NaN, err: '', expr: false };
        var plain = (tk.length === 1 && tk[0].t === 'n') || (tk.length === 2 && tk[0].t === 'o' && (tk[0].v === '-' || tk[0].v === '+') && tk[1].t === 'n');
        var depth = 0; tk.forEach(function (t) { if (t.t === 'o' && t.v === '(') depth++; else if (t.t === 'o' && t.v === ')') depth--; });
        for (; depth > 0; depth--) tk.push({ t: 'o', v: ')' });
        var v = parse(tk);
        if (!isFinite(v)) return { v: NaN, err: isNaN(v) ? 'Ce calcul ne donne pas un nombre (racine ou ln d\'un nombre négatif ?).' : 'Ce calcul ne donne pas un nombre (division par zéro ?).', expr: true };
        return { v: v, err: '', expr: !plain };
      } catch (e) { return { v: NaN, err: (e && e.message) || 'Calcul incomplet.', expr: true }; }
    }
    function show(v) {
      if (!isFinite(v)) return '—';
      var a = Math.abs(v), d = a < 1e-12 ? 0 : Math.max(0, Math.min(8, 4 - Math.floor(Math.log(a) / Math.LN10)));
      var s = v.toFixed(d);
      if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
      if (s === '-0') s = '0';
      return s.replace('.', ',');
    }
    return { read: read, show: show };
  })();
  function parseNum(s) {
    if (s == null) return null;
    var raw = String(s);
    s = raw.trim().replace(/[\s  ]/g, '').replace(/[€$]|euros?|cm|mm|kg|g$|h$|min$|s$|jours?$/gi, '').replace(/^[≈~=]+/, '');
    var pct = false;
    if (/%$/.test(s)) { pct = true; s = s.slice(0, -1); }
    s = s.replace(/,/g, '.').replace(/[−–]/g, '-');
    var v, m = s.match(/^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/);
    if (m) v = parseFloat(m[1]) / parseFloat(m[2]);
    else if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) v = parseFloat(s);
    else {
      var r = OM.expr.read(raw);
      if (!isFinite(r.v)) return null;
      return { v: r.v, pct: false, expr: true };
    }
    return { v: v, pct: pct };
  }
  function close(input, ans, d, tol) {
    var p = parseNum(input);
    if (!p || !isFinite(p.v)) return null;
    var t = tol != null ? tol : d != null ? 0.6 * Math.pow(10, -d) : Math.max(1e-9, Math.abs(ans) * 0.002);
    t = Math.max(t, Math.abs(ans) * 1e-7);
    var cands = [p.v];
    if (p.pct) cands.push(p.v / 100);
    return cands.some(function (v) { return Math.abs(v - ans) <= t + 1e-12; });
  }
  /* returns true / false / null(unreadable) for a question object and an array of input strings */
  function checkQ(q, values) {
    var answers = Array.isArray(q.a) ? q.a : [q.a];
    var ds = Array.isArray(q.d) ? q.d : answers.map(function () { return q.d; });
    var all = true;
    for (var i = 0; i < answers.length; i++) {
      var ok = close(values[i], answers[i], ds[i], q.tol);
      if (ok === null) return null;
      if (!ok && q.alt) ok = [].concat(q.alt).some(function (alt) { return close(values[i], Array.isArray(alt) ? alt[i] : alt, ds[i], q.tol); });
      if (!ok) all = false;
    }
    return all;
  }
  OM.check = { parseNum: parseNum, close: close, checkQ: checkQ };
  function qType(q) { return q.c ? 'choice' : q.a === undefined ? 'paper' : 'num'; }
  function fmtAns(q) {
    if (qType(q) === 'choice') return q.c[q.a];
    var a = Array.isArray(q.a) ? q.a : [q.a], l = q.l || [], ds = Array.isArray(q.d) ? q.d : a.map(function () { return q.d; });
    return a.map(function (v, i) { return (l[i] ? l[i] + ' = ' : '') + fr(v, ds[i] != null ? ds[i] : undefined) + (q.u ? ' ' + q.u : ''); }).join(' ; ');
  }

  /* ---------- small UI helpers ---------- */
  var view;
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2200);
  }
  function setTitle(t) { document.title = t ? t + ' · Révision Outils Maths 3' : 'Révision Outils Maths 3'; }
  function ring(p) {
    var r = 14, c = 2 * Math.PI * r, d = Math.max(0, Math.min(1, p)) * c;
    return '<svg class="ring" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="' + r + '" class="s-ringbg" /><circle cx="17" cy="17" r="' + r + '" class="s-ring" stroke-dasharray="' + d + ' ' + c + '" transform="rotate(-90 17 17)" /></svg>';
  }
  OM.ui = { toast: toast, ring: ring, $: $, $$: $$ };

  /* ---------- progress ---------- */
  function exStats(ex) {
    var n = ex.q.length, ok = 0, done = 0;
    ex.q.forEach(function (q, i) { var s = S.prog[ex.id + '.' + i]; if (s) done++; if (s === 'ok') ok++; });
    return { n: n, ok: ok, done: done };
  }
  function chStats(ch) {
    var n = 0, done = 0, ok = 0;
    (ch.td || []).concat(ch.ex || []).forEach(function (ex) { var s = exStats(ex); n += s.n; done += s.done; ok += s.ok; });
    var g = 0, gt = 0;
    OM.gens.forEach(function (gen) { if (gen.ch === ch.id && S.gs[gen.id]) { g += S.gs[gen.id][0]; gt += S.gs[gen.id][1]; } });
    return { n: n, done: done, ok: ok, quizOk: g, quizN: gt };
  }
  function orderedExos() {
    var list = [];
    OM.chapters.forEach(function (c) { (c.td || []).concat(c.ex || []).forEach(function (ex) { list.push(ex); }); });
    return list;
  }
  function nextTodo(skipOpt) {
    var list = orderedExos();
    for (var i = 0; i < list.length; i++) {
      var ex = list[i];
      if (skipOpt && ex.opt) continue;
      for (var j = 0; j < ex.q.length; j++) if (!S.prog[ex.id + '.' + j]) return { ex: ex, qi: j };
    }
    return null;
  }
  OM.progress = { exStats: exStats, chStats: chStats, nextTodo: nextTodo };

  /* ---------- router ---------- */
  var routes = {};
  OM.route = function (name, fn) { routes[name] = fn; };
  var TABS = { accueil: 'accueil', cours: 'cours', express: 'cours', td: 'td', quiz: 'quiz', examen: 'quiz', tables: 'tables', outils: 'tables' };
  function render() {
    var h = (location.hash || '#accueil').slice(1) || 'accueil';
    var parts = h.split('-'), base = parts[0];
    var fn = routes[h] || routes[base] || routes.accueil;
    $$('.tabs a').forEach(function (a) { if (a.dataset.tab === (TABS[base] || 'accueil')) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    view.innerHTML = '';
    view.classList.remove('fadein'); void view.offsetWidth; view.classList.add('fadein');
    try { fn(view, parts.slice(1)); } catch (e) { view.innerHTML = '<div class="card"><h2>Erreur d\'affichage</h2><p class="muted">' + esc(e.message) + '</p></div>'; console.error(e); }
    if (!OM._keepScroll) window.scrollTo(0, 0);
    OM._keepScroll = false;
  }
  OM.go = function (h) { if (location.hash === '#' + h) render(); else location.hash = h; };
  OM.render = render;

  /* ---------- countdown + notes ---------- */
  function daysLeft() {
    var now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var d1 = new Date(OM.EXAM_DATE.getFullYear(), OM.EXAM_DATE.getMonth(), OM.EXAM_DATE.getDate());
    return Math.round((d1 - d0) / 864e5);
  }
  OM.daysLeft = daysLeft;
  function initChrome() {
    var cd = $('#countdown'), n = daysLeft();
    cd.textContent = n > 1 ? 'DE J−' + n : n === 1 ? 'DE demain' : n === 0 ? 'DE : jour J' : 'DE passé';
    cd.title = n > 0 ? 'DE vendredi 11 décembre, 8 h 00, salle B010 : dans ' + n + ' jour' + (n > 1 ? 's' : '') : 'DE vendredi 11 décembre';
    var now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), ni = Math.round((new Date(2026, 10, 13) - t0) / 864e5);
    if (ni === 1 || ni === 0) { cd.textContent = ni === 1 ? 'Interro demain' : 'Interro aujourd\'hui'; cd.title = 'Interrogation chapitres I et II, vendredi 13 novembre (séance de 13 h 40)'; cd.classList.add('warn'); }
    var dr = $('#drawer'), ta = $('#notesArea');
    ta.value = S.notes || '';
    ta.addEventListener('input', function () { S.notes = ta.value; save(); });
    $('#notesBtn').addEventListener('click', function () { dr.hidden = !dr.hidden; if (!dr.hidden) ta.focus(); });
    $('#drawerClose').addEventListener('click', function () { dr.hidden = true; });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') dr.hidden = true; });
  }

  /* ---------- touches de calcul (téléphone) + aperçu du résultat d'un calcul ---------- */
  var KEYS = [['(', '('], [')', ')'], ['×', '×'], ['/', '/'], ['^', '^'], ['√', '√(', 'racine carrée'], ['eˣ', 'e^(', 'exponentielle'], ['ln', 'ln(', 'logarithme népérien'], ['n!', '!', 'factorielle'], ['C(n;k)', 'C(', 'combinaisons'], ['π(t)', 'π(', 'valeur de la table de la loi normale'], [';', ';', 'séparateur dans C(n ; k)']];
  function keysHtml() {
    return '<div class="keys" role="group" aria-label="Symboles pour écrire un calcul">' + KEYS.map(function (k) { return '<button type="button" data-ins="' + esc(k[1]) + '"' + (k[2] ? ' title="' + k[2] + '" aria-label="' + k[2] + '"' : '') + '>' + k[0] + '</button>'; }).join('') + '</div>';
  }
  function wireKeys(root) {
    var inputs = $$('input', root), last = inputs[0];
    function upd(inp) {
      var pv = inp.parentNode.querySelector('.prev'); if (!pv) return;
      var v = inp.value.trim(); if (!v) { pv.textContent = ''; pv.className = 'prev'; return; }
      var p = parseNum(v);
      if (p && (p.expr || /\//.test(v))) { pv.textContent = '= ' + OM.expr.show(p.v); pv.className = 'prev val'; }
      else if (!p) { var r = OM.expr.read(v); pv.textContent = r.err || ''; pv.className = 'prev'; }
      else { pv.textContent = ''; pv.className = 'prev'; }
    }
    inputs.forEach(function (inp) {
      inp.addEventListener('focus', function () { last = inp; });
      inp.addEventListener('input', function () { upd(inp); });
    });
    $$('[data-ins]', root).forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        if (!last) return;
        var ins = b.getAttribute('data-ins'), a = last.selectionStart, z = last.selectionEnd;
        if (typeof a !== 'number') { a = z = last.value.length; }
        last.value = last.value.slice(0, a) + ins + last.value.slice(z);
        last.focus(); try { last.setSelectionRange(a + ins.length, a + ins.length); } catch (e) { /* ignore */ }
        last.dispatchEvent(new Event('input', { bubbles: true }));
      });
    });
  }
  OM.keysHtml = keysHtml; OM.wireKeys = wireKeys;

  /* ---------- question widget (shared by TD, quiz, exam) ---------- */
  /* opts: {key, onResult(status), showKnown: html, mode:'td'|'quiz'|'exam', number, total} */
  function questionCard(q, opts) {
    var type = qType(q), el = document.createElement('section');
    el.className = 'card qcard stack';
    var head = opts.label ? '<p class="eyebrow">' + opts.label + '</p>' : '';
    var html = head + '<div class="qtext prose">' + q.q + '</div>';
    if (q.e2) html += '<div class="prose">' + q.e2 + '</div>';
    var ids = [];
    if (type === 'num') {
      var a = Array.isArray(q.a) ? q.a : [q.a], labels = q.l || [];
      html += '<form class="answer" autocomplete="off" novalidate>';
      a.forEach(function (v, i) {
        var id = 'in-' + (opts.key || 'q').replace(/[^\w-]/g, '_') + '-' + i; ids.push(id);
        html += '<label for="' + id + '"><span>' + (labels[i] || (a.length > 1 ? 'Valeur ' + (i + 1) : 'Ta réponse')) + (q.u ? ' (' + q.u + ')' : '') + '</span><input id="' + id + '" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="done" placeholder="' + (q.ph || 'nombre ou calcul') + '"><span class="prev" aria-live="polite"></span></label>';
      });
      html += '<button class="btn primary" type="submit">Vérifier</button></form>' + keysHtml();
    } else if (type === 'choice') {
      html += '<div class="choices" role="group" aria-label="Choix de réponse">' + q.c.map(function (c, i) { return '<button type="button" data-i="' + i + '">' + c + '</button>'; }).join('') + '</div>';
    } else {
      html += '<p class="small muted">Réponds sur ta feuille, comme le jour du DE, puis compare avec la correction.</p>';
    }
    html += '<p class="fb" aria-live="polite"></p>';
    html += '<div class="row qbtns">' +
      (q.hint ? '<button class="btn sm" type="button" data-act="hint">Indice</button>' : '') +
      '<button class="btn sm soft" type="button" data-act="step">Correction pas à pas</button>' +
      '<button class="btn sm" type="button" data-act="all">Toute la correction</button></div>';
    html += '<div class="hint" hidden>' + (q.hint || '') + '</div>';
    html += '<div class="sol" hidden><p class="eyebrow">Correction</p><ol></ol><div class="figs"></div><p class="ans"></p><div class="rate row" hidden><span class="small muted">Sur ta feuille, c\'était :</span><button class="btn sm" type="button" data-rate="ok">Juste</button><button class="btn sm" type="button" data-rate="ko">À revoir</button></div></div>';
    el.innerHTML = html;

    var fb = $('.fb', el), sol = $('.sol', el), ol = $('ol', sol), shown = 0, steps = q.sol || [];
    var status = opts.status || null;
    function report(st) {
      if (status === 'ok' && st !== 'ok') return;
      status = st; if (opts.onResult) opts.onResult(st);
    }
    function showSol(all) {
      sol.hidden = false;
      var until = all ? steps.length : Math.min(steps.length, shown + 1);
      for (; shown < until; shown++) { var li = document.createElement('li'); li.innerHTML = steps[shown]; ol.appendChild(li); }
      if (shown >= steps.length) {
        $('.ans', sol).innerHTML = (type === 'paper' ? '' : 'Réponse : ' + fmtAns(q));
        if (q.fig && !$('.figs', sol).innerHTML) $('.figs', sol).innerHTML = q.fig;
        if (type === 'paper' && opts.mode !== 'exam') $('.rate', sol).hidden = false;
        $('[data-act="step"]', el).disabled = true; $('[data-act="all"]', el).disabled = true;
      }
      if (!status && type !== 'paper') report('seen');
      if (!status && type === 'paper') report('seen');
    }
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !el.contains(b)) return;
      if (b.dataset.act === 'hint') { $('.hint', el).hidden = false; b.disabled = true; }
      if (b.dataset.act === 'step') showSol(false);
      if (b.dataset.act === 'all') showSol(true);
      if (b.dataset.rate) { report(b.dataset.rate); fb.className = 'fb ' + b.dataset.rate; fb.textContent = b.dataset.rate === 'ok' ? 'Noté : juste.' : 'Noté : à revoir. Cette question reviendra dans « Mes erreurs ».'; }
      if (b.dataset.i != null && type === 'choice') {
        var i = +b.dataset.i, right = i === q.a;
        $$('.choices button', el).forEach(function (x) { x.classList.remove('right', 'wrong'); });
        b.classList.add(right ? 'right' : 'wrong');
        if (right) { fb.className = 'fb ok'; fb.textContent = 'Juste.'; report('ok'); showSol(true); }
        else { fb.className = 'fb ko'; fb.textContent = 'Non. Relis les propositions ou ouvre la correction.'; report('ko'); }
      }
    });
    var form = $('form', el);
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var vals = ids.map(function (id) { return $('#' + id, el).value; });
      var r = checkQ(q, vals);
      if (r === null) { fb.className = 'fb ko'; fb.textContent = 'Écris un nombre ou un calcul : 0,25 ; 3/8 ; 12 % ; 0,3*0,38 ; e^(-0,73) ; π(1,29).'; return; }
      if (r) { fb.className = 'fb ok'; fb.textContent = 'Juste. ' + (steps.length ? 'La correction détaillée est dessous.' : ''); report('ok'); showSol(true); }
      else { fb.className = 'fb ko'; fb.textContent = 'Pas encore. Vérifie l\'arrondi demandé, puis réessaie ou prends l\'indice.'; report('ko'); }
    });
    if (opts.mode === 'exam') { $('.qbtns', el).hidden = true; }
    if (type === 'num') wireKeys(el);
    el._reveal = function () { showSol(true); };
    el._values = function () { return ids.map(function (id) { return $('#' + id, el).value; }); };
    return el;
  }
  OM.questionCard = questionCard;
  OM.qType = qType; OM.fmtAns = fmtAns;

  /* ---------- start ---------- */
  OM.start = function () {
    load();
    view = $('#view');
    initChrome();
    window.addEventListener('hashchange', render);
    render();
  };
})();
