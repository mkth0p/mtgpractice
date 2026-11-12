/* Tables (loi normale, Student, khi-deux) et calculatrices pour vérifier un calcul. */
(function () {
  'use strict';
  var H = OM.h, fr = H.fr, esc = H.esc, m = OM.math, $ = OM.ui.$, $$ = OM.ui.$$;

  /* ======================= TABLES ======================= */
  function normalTable(hl) {
    var h = '<div class="tw tall"><table class="t big"><thead><tr><th>t</th>';
    for (var c = 0; c < 10; c++) h += '<th>0,0' + c + '</th>';
    h += '</tr></thead><tbody>';
    for (var r = 0; r < 40; r++) {
      h += '<tr><td><b>' + fr(r / 10, 1) + '</b></td>';
      for (c = 0; c < 10; c++) {
        var t = (r * 10 + c) / 100, on = hl != null && Math.abs(hl - t) < 1e-9;
        h += '<td' + (on ? ' class="hl" id="hlcell"' : '') + '>' + fr(m.pi4(t), 4) + '</td>';
      }
      h += '</tr>';
    }
    return h + '</tbody></table></div>';
  }
  function studentTable(hd, ha) {
    var T = OM.tables, h = '<div class="tw tall"><table class="t big"><thead><tr><th>α unilatéral</th>' + T.studentUni.map(function (a) { return '<th>' + fr(a) + '</th>'; }).join('') + '</tr><tr><th>α bilatéral</th>' + T.studentBi.map(function (a) { return '<th>' + fr(a) + '</th>'; }).join('') + '</tr></thead><tbody>';
    T.student.forEach(function (row) {
      h += '<tr><td><b>' + row[0] + '</b></td>' + row.slice(1).map(function (v, i) { var on = String(row[0]) === String(hd) && i === ha; return '<td' + (on ? ' class="hl" id="hlcell"' : '') + '>' + fr(v, 3) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }
  function chiTable(hd, ha) {
    var T = OM.tables, h = '<div class="tw tall"><table class="t big"><thead><tr><th>ddl \\ α</th>' + T.chiAlpha.map(function (a) { return '<th>' + fr(a) + '</th>'; }).join('') + '</tr></thead><tbody>';
    T.chi2.forEach(function (row) {
      h += '<tr><td><b>' + row[0] + '</b></td>' + row.slice(1).map(function (v, i) { var on = row[0] === hd && i === ha; return '<td' + (on ? ' class="hl" id="hlcell"' : '') + '>' + fr(v, 3) + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }
  OM.route('tables', function (v) {
    var which = OM.tableTab || 'normale';
    var html = '<div class="view-title"><p class="eyebrow">Annexes du poly, p. 70–72</p><h1>Tables</h1><p class="muted">Même présentation que le poly. Tape une valeur pour la trouver dans la table.</p></div>' +
      '<div class="seg" role="group" aria-label="Choisir une table"><button type="button" data-tt="normale" aria-pressed="' + (which === 'normale') + '">Loi normale</button><button type="button" data-tt="student" aria-pressed="' + (which === 'student') + '">Student</button><button type="button" data-tt="khi" aria-pressed="' + (which === 'khi') + '">Khi-deux</button><a class="btn sm soft" href="#outils">Vérifier un calcul</a></div><div class="stack" style="margin-top:14px">';
    if (which === 'normale') {
      html += '<div class="card flat stack"><p>π(t) = P(T ≤ t) pour T ∼ N(0 ; 1). Lecture : ligne = unité et dixième, colonne = centième. Exemple : π(1,45) = 0,9265.</p>' +
        '<div class="fields"><label for="lkT">t (de −3,99 à 3,99)<input id="lkT" inputmode="decimal" placeholder="1,45"></label><label for="lkP">ou une probabilité p (lecture inverse)<input id="lkP" inputmode="decimal" placeholder="0,975"></label></div><p class="out-line mono" aria-live="polite"></p></div><div class="tslot">' + normalTable(null) + '</div>';
    } else if (which === 'student') {
      html += '<div class="card flat stack"><p>Coefficient t<sub>ddl ; α</sub>. Pour un intervalle de confiance au niveau 1 − α, lis la colonne « α bilatéral » avec ddl = n − 1. Exemple : 9 ddl, 95 % → 2,262.</p>' +
        '<div class="fields"><label for="lkD">ddl<input id="lkD" inputmode="numeric" placeholder="9"></label><label for="lkA">α bilatéral<select id="lkA">' + OM.tables.studentBi.map(function (a, i) { return '<option value="' + i + '"' + (a === 0.05 ? ' selected' : '') + '>' + fr(a) + '</option>'; }).join('') + '</select></label></div><p class="out-line mono" aria-live="polite"></p></div><div class="tslot">' + studentTable() + '</div>';
    } else {
      html += '<div class="card flat stack"><p>Valeur critique χ²<sub>ddl ; α</sub> (probabilité α d\'être dépassée). Pour un test au seuil de 5 %, colonne 0,05. Exemple : 2 ddl → 5,991.</p>' +
        '<div class="fields"><label for="lkD">ddl<input id="lkD" inputmode="numeric" placeholder="2"></label><label for="lkA">α<select id="lkA">' + OM.tables.chiAlpha.map(function (a, i) { return '<option value="' + i + '"' + (a === 0.05 ? ' selected' : '') + '>' + fr(a) + '</option>'; }).join('') + '</select></label></div><p class="out-line mono" aria-live="polite"></p></div><div class="tslot">' + chiTable() + '</div>';
    }
    v.innerHTML = html + '</div>';
    $$('[data-tt]', v).forEach(function (b) { b.addEventListener('click', function () { OM.tableTab = b.dataset.tt; OM.render(); }); });
    var out = $('.out-line', v), slot = $('.tslot', v);
    function scrollHl() { var c = $('#hlcell', v); if (c) c.scrollIntoView({ block: 'center', inline: 'center' }); }
    if (which === 'normale') {
      $('#lkT', v).addEventListener('input', function () {
        var p = OM.check.parseNum(this.value); if (!p) { out.textContent = ''; return; }
        var t = Math.round(p.v * 100) / 100, at = Math.abs(t);
        if (at >= 4) { out.textContent = 'Au-delà de 3,99 : π(t) ≈ ' + (t > 0 ? '1' : '0') + '.'; return; }
        var val = m.pi4(at);
        out.innerHTML = t >= 0 ? 'π(' + fr(t) + ') = ' + fr(val, 4) : 'π(' + fr(t) + ') = 1 − π(' + fr(at) + ') = 1 − ' + fr(val, 4) + ' = ' + fr(m.round(1 - val, 4), 4);
        slot.innerHTML = normalTable(at); scrollHl();
      });
      $('#lkP', v).addEventListener('input', function () {
        var p = OM.check.parseNum(this.value); if (!p || p.v <= 0 || p.v >= 1) { out.textContent = ''; return; }
        var best = 0, bd = 9;
        for (var i = 0; i < 400; i++) { var d = Math.abs(m.pi4(i / 100) - (p.v < 0.5 ? 1 - p.v : p.v)); if (d < bd - 1e-12) { bd = d; best = i / 100; } }
        out.innerHTML = p.v >= 0.5 ? 'π(t) = ' + fr(p.v) + ' pour t ≈ ' + fr(best) + ' (valeur la plus proche : π(' + fr(best) + ') = ' + fr(m.pi4(best), 4) + ')' : 'p &lt; 0,5 : t est négatif. π(t) = ' + fr(p.v) + ' ⇔ π(−t) = ' + fr(m.round(1 - p.v, 4)) + ' ⇒ t ≈ −' + fr(best);
        slot.innerHTML = normalTable(best); scrollHl();
      });
    } else {
      var D = $('#lkD', v), A = $('#lkA', v);
      var look = function () {
        var d = parseInt(D.value, 10), a = +A.value; if (!d || d < 1) { out.textContent = ''; return; }
        if (which === 'student') {
          var row = OM.tables.student.filter(function (r) { return r[0] === d; })[0];
          if (!row) { var bigger = OM.tables.student.filter(function (r) { return typeof r[0] === 'number' && r[0] > d; })[0]; row = bigger || OM.tables.student[OM.tables.student.length - 1]; out.textContent = 'ddl ' + d + ' absent de la table : ligne la plus proche au-dessus, ' + row[0] + ' → ' + fr(row[a + 1], 3) + '.'; }
          else out.textContent = 't(' + d + ' ddl ; α bilatéral ' + fr(OM.tables.studentBi[a]) + ') = ' + fr(row[a + 1], 3);
          slot.innerHTML = studentTable(row[0], a);
        } else {
          var rowc = OM.tables.chi2.filter(function (r) { return r[0] === d; })[0];
          if (!rowc) { out.textContent = 'ddl ' + d + ' absent de la table du poly.'; return; }
          out.textContent = 'χ²(' + d + ' ddl ; α = ' + fr(OM.tables.chiAlpha[a]) + ') = ' + fr(rowc[a + 1], 3);
          slot.innerHTML = chiTable(d, a);
        }
        scrollHl();
      };
      D.addEventListener('input', look); A.addEventListener('change', look);
    }
  });

  /* ======================= CALCULATRICES ======================= */
  function nums(s) {
    if (!s || !String(s).trim()) return [];
    return String(s).trim().split(/[\s;]+/).filter(Boolean).map(function (x) { var p = OM.check.parseNum(x); if (!p) throw new Error('« ' + x + ' » n\'est pas un nombre.'); return p.v; });
  }
  function num(s, name) { var p = OM.check.parseNum(s); if (!p) throw new Error('Indique ' + name + '.'); return p.v; }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
  function F4(x) { return fr(m.round(x, 4)); }
  function quant(xs, ns, q) { var N = sum(ns), c = 0; for (var i = 0; i < xs.length; i++) { c += ns[i]; if (c >= q * N - 1e-9) return xs[i]; } return xs[xs.length - 1]; }
  function rankVal(xs, ns, r) { var c = 0; for (var i = 0; i < xs.length; i++) { c += ns[i]; if (c >= r) return xs[i]; } return xs[xs.length - 1]; }
  function interp(b, ns, q) {
    var N = sum(ns), target = q * N, c = 0;
    for (var i = 0; i < ns.length; i++) { if (c + ns[i] >= target) return b[i] + (target - c) / ns[i] * (b[i + 1] - b[i]); c += ns[i]; }
    return b[b.length - 1];
  }
  /* racines d'un polynôme (Durand–Kerner), coefficients du plus haut degré au plus bas, normalisés */
  function roots(coef) {
    var n = coef.length - 1, a0 = coef[0]; coef = coef.map(function (c) { return c / a0; });
    var z = []; for (var i = 0; i < n; i++) z.push([Math.cos(0.4 + 2 * Math.PI * i / n) * 1.5, Math.sin(0.4 + 2 * Math.PI * i / n) * 1.5]);
    function mul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
    function div(a, b) { var d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
    for (var it = 0; it < 500; it++) {
      for (i = 0; i < n; i++) {
        var p = [1, 0]; for (var k = 1; k <= n; k++) { p = mul(p, z[i]); p = [p[0] + coef[k], p[1]]; }
        var den = [1, 0]; for (var j = 0; j < n; j++) if (j !== i) den = mul(den, [z[i][0] - z[j][0], z[i][1] - z[j][1]]);
        var d = div(p, den); z[i] = [z[i][0] - d[0], z[i][1] - d[1]];
      }
    }
    return z;
  }
  function cfmt(z) { var re = m.round(z[0], 4), im = m.round(z[1], 4); if (Math.abs(im) < 1e-6) return fr(re); return fr(re) + (im > 0 ? ' + ' : ' − ') + fr(Math.abs(im)) + ' i'; }

  var TOOLS = [
    { id: 'serie', t: 'Série statistique (valeurs et effectifs)', ch: 'II',
      f: [['vals', 'Valeurs x<sub>i</sub>', '14 15 16 17 18 19 20 21 22 23 24 25', 'wide'], ['eff', 'Effectifs n<sub>i</sub> (vide = tous 1)', '1 2 4 4 5 7 8 7 6 5 2 1', 'wide']],
      run: function (g) {
        var xs = nums(g.vals), ns = nums(g.eff); if (!xs.length) throw new Error('Saisis au moins une valeur.');
        if (!ns.length) ns = xs.map(function () { return 1; });
        if (ns.length !== xs.length) throw new Error('Il faut autant d\'effectifs que de valeurs.');
        var idx = xs.map(function (_, i) { return i; }).sort(function (a, b) { return xs[a] - xs[b]; }); xs = idx.map(function (i) { return xs[i]; }); ns = idx.map(function (i) { return ns[i]; });
        var N = sum(ns), mean = sum(xs.map(function (x, i) { return x * ns[i]; })) / N, v = sum(xs.map(function (x, i) { return x * x * ns[i]; })) / N - mean * mean;
        var me = N % 2 ? rankVal(xs, ns, (N + 1) / 2) : (rankVal(xs, ns, N / 2) + rankVal(xs, ns, N / 2 + 1)) / 2;
        var mx = Math.max.apply(null, ns), modes = xs.filter(function (_, i) { return ns[i] === mx; });
        return [['N', fr(N)], ['Moyenne', F4(mean)], ['Variance (÷ N)', F4(v)], ['Écart-type', F4(Math.sqrt(Math.max(0, v)))], ['Médiane', fr(me)], ['Q<sub>1</sub> ; Q<sub>3</sub>', fr(quant(xs, ns, 0.25)) + ' ; ' + fr(quant(xs, ns, 0.75))], ['Étendue', fr(xs[xs.length - 1] - xs[0])], ['Mode', modes.map(function (x) { return fr(x); }).join(', ')]];
      } },
    { id: 'classes', t: 'Série en classes', ch: 'II',
      f: [['b', 'Bornes (k + 1 nombres)', '150 250 350 450 550 850', 'wide'], ['n', 'Effectifs (k nombres)', '320 500 700 280 200', 'wide']],
      run: function (g) {
        var b = nums(g.b), ns = nums(g.n); if (b.length !== ns.length + 1) throw new Error('Il faut une borne de plus que d\'effectifs.');
        var c = ns.map(function (_, i) { return (b[i] + b[i + 1]) / 2; }), N = sum(ns), mean = sum(c.map(function (x, i) { return x * ns[i]; })) / N, v = sum(c.map(function (x, i) { return x * x * ns[i]; })) / N - mean * mean;
        var dens = ns.map(function (n, i) { return n / (b[i + 1] - b[i]); }), k = dens.indexOf(Math.max.apply(null, dens));
        var cum = [], s = 0; ns.forEach(function (n) { s += n; cum.push(s); });
        return [['N', fr(N)], ['Centres', c.map(function (x) { return fr(x); }).join(' ; ')], ['ECC', cum.join(' ; ')], ['Moyenne', F4(mean)], ['Écart-type', F4(Math.sqrt(Math.max(0, v)))], ['Médiane (interpolation)', F4(interp(b, ns, 0.5))], ['Q<sub>1</sub> ; Q<sub>3</sub>', F4(interp(b, ns, 0.25)) + ' ; ' + F4(interp(b, ns, 0.75))], ['Classe modale (densité)', '[' + fr(b[k]) + ' ; ' + fr(b[k + 1]) + '[']];
      } },
    { id: 'reg', t: 'Deux variables : covariance, droite, r', ch: 'II',
      f: [['x', 'x', '1 2 3 4 5 6 7 8', 'wide'], ['y', 'y', '148 155 165 170 185 190 198 205', 'wide'], ['tr', 'Transformer y', ['aucune', 'z = ln y', 'z = e^y', 'z = ln(y / x)']], ['x0', 'Estimer y pour x = (facultatif)', '9']],
      run: function (g) {
        var x = nums(g.x), y = nums(g.y); if (x.length !== y.length || x.length < 2) throw new Error('x et y doivent avoir le même nombre de valeurs (au moins 2).');
        var lab = 'y';
        if (g.tr === 'z = ln y') { y = y.map(function (v) { if (v <= 0) throw new Error('ln impossible pour y ≤ 0.'); return Math.log(v); }); lab = 'z'; }
        if (g.tr === 'z = e^y') { y = y.map(Math.exp); lab = 'z'; }
        if (g.tr === 'z = ln(y / x)') { y = y.map(function (v, i) { return Math.log(v / x[i]); }); lab = 'z'; }
        var n = x.length, mx = sum(x) / n, my = sum(y) / n, sxy = 0, sxx = 0, syy = 0;
        for (var i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); syy += (y[i] - my) * (y[i] - my); }
        var a = sxy / sxx, b = my - a * mx, r = sxy / Math.sqrt(sxx * syy);
        var out = [];
        if (lab === 'z') out.push(['Valeurs de z', y.map(function (v) { return fr(m.round(v, 3)); }).join(' ; ')]);
        var x0p = OM.check.parseNum(g.x0);
        if (x0p) {
          var z0 = a * x0p.v + b, y0 = g.tr === 'z = ln y' ? Math.exp(z0) : g.tr === 'z = e^y' ? (z0 > 0 ? Math.log(z0) : NaN) : g.tr === 'z = ln(y / x)' ? x0p.v * Math.exp(z0) : z0;
          out.push(['Estimation de y pour x = ' + fr(x0p.v), isFinite(y0) ? F4(y0) : 'impossible']);
        }
        return out.concat([['x̄ ; ' + lab + '̄', F4(mx) + ' ; ' + F4(my)], ['Σ produits', F4(sxy)], ['Σ(x − x̄)²', F4(sxx)], ['Σ(' + lab + ' − ' + lab + '̄)²', F4(syy)], ['Cov', F4(sxy / n)], ['a', F4(a)], ['b', F4(b)], ['r', F4(r)], ['r²', F4(r * r)]]);
      } },
    { id: 'tree', t: 'Arbre à deux niveaux et Bayes', ch: 'I',
      f: [['pa', 'P(A)', '0,6'], ['pab', 'P<sub>A</sub>(B)', '0,02'], ['pnab', 'P<sub>Ā</sub>(B)', '0,04']],
      run: function (g) {
        var a = num(g.pa, 'P(A)'), b1 = num(g.pab, 'P_A(B)'), b2 = num(g.pnab, 'P_Ā(B)'); if (a < 0 || a > 1 || b1 < 0 || b1 > 1 || b2 < 0 || b2 > 1) throw new Error('Les probabilités sont entre 0 et 1.');
        var pb = a * b1 + (1 - a) * b2;
        return [['P(A ∩ B)', F4(a * b1)], ['P(Ā ∩ B)', F4((1 - a) * b2)], ['P(B)', F4(pb)], ['P<sub>B</sub>(A)', F4(a * b1 / pb)], ['P<sub>B̄</sub>(A)', F4(a * (1 - b1) / (1 - pb))], ['A et B indépendants ?', Math.abs(a * b1 - a * pb) < 1e-12 ? 'oui' : 'non']];
      } },
    { id: 'binom', t: 'Loi binomiale', ch: 'III',
      f: [['n', 'n', '150'], ['p', 'p', '0,02'], ['k', 'k', '4']],
      run: function (g) {
        var n = Math.round(num(g.n, 'n')), p = num(g.p, 'p'), k = Math.round(num(g.k, 'k')); if (n > 2000) throw new Error('n ≤ 2 000 ici.');
        var cdf = 0; for (var j = 0; j <= k; j++) cdf += m.binom(n, p, j);
        var appr = n >= 30 && p <= 0.1 && n * p < 15 ? 'Poisson λ = ' + fr(m.round(n * p, 4)) : n >= 30 && n * p > 5 && n * p * (1 - p) > 5 ? 'normale m = ' + fr(m.round(n * p, 4)) + ', σ = ' + F4(Math.sqrt(n * p * (1 - p))) : 'aucune (conditions non remplies)';
        return [['P(X = k)', F4(m.binom(n, p, k))], ['P(X ≤ k)', F4(cdf)], ['P(X ≥ k)', F4(1 - cdf + m.binom(n, p, k))], ['P(X &gt; k)', F4(1 - cdf)], ['E(X) ; σ(X)', F4(n * p) + ' ; ' + F4(Math.sqrt(n * p * (1 - p)))], ['Approximation', appr]];
      } },
    { id: 'pois', t: 'Loi de Poisson', ch: 'III',
      f: [['l', 'λ', '3'], ['k', 'k', '4']],
      run: function (g) {
        var l = num(g.l, 'λ'), k = Math.round(num(g.k, 'k')), cdf = 0; for (var j = 0; j <= k; j++) cdf += m.pois(l, j);
        return [['P(X = k)', F4(m.pois(l, k))], ['P(X ≤ k)', F4(cdf)], ['P(X ≥ k)', F4(1 - cdf + m.pois(l, k))], ['P(X &gt; k)', F4(1 - cdf)]];
      } },
    { id: 'norm', t: 'Loi normale', ch: 'III',
      f: [['mu', 'm', '100'], ['s', 'σ (écart-type)', '7,75'], ['a', 'a', '90'], ['b', 'b', '110'], ['p', 'p (facultatif) : lecture inverse', '0,95']],
      run: function (g) {
        var mu = num(g.mu, 'm'), s = num(g.s, 'σ'), a = num(g.a, 'a'), b = num(g.b, 'b'); if (s <= 0) throw new Error('σ doit être positif.');
        var ta = (a - mu) / s, tb = (b - mu) / s;
        var out = [['t pour a ; pour b', F4(ta) + ' ; ' + F4(tb)], ['P(X ≤ b) (table)', fr(m.piTab(tb), 4)], ['P(X ≥ a) (table)', fr(m.round(1 - m.piTab(ta), 4), 4)], ['P(a ≤ X ≤ b) (table)', fr(m.round(m.piTab(tb) - m.piTab(ta), 4), 4)], ['P(a ≤ X ≤ b) (valeur exacte)', F4(m.Phi(tb) - m.Phi(ta))]];
        var pp = OM.check.parseNum(g.p);
        if (pp && pp.v > 0 && pp.v < 1) {
          var inv = function (q) { var lo = -6, hi = 6; for (var i = 0; i < 80; i++) { var mid = (lo + hi) / 2; if (m.Phi(mid) < q) lo = mid; else hi = mid; } return (lo + hi) / 2; };
          var tz = inv((1 + pp.v) / 2), tq = inv(pp.v);
          out.push(['a tel que P(m − a ≤ X ≤ m + a) = ' + fr(pp.v), F4(tz * s) + ' (t ≈ ' + fr(m.round(tz, 3)) + ')']);
          out.push(['x tel que P(X ≤ x) = ' + fr(pp.v), F4(mu + tq * s) + ' (t ≈ ' + fr(m.round(tq, 3)) + ')']);
        }
        return out;
      } },
    { id: 'expo', t: 'Loi exponentielle et fiabilité', ch: 'III',
      f: [['mtbf', 'MTBF (= 1/λ)', '500'], ['t', 'Durée t', '365'], ['r', 'Fiabilité visée (facultatif)', '0,94']],
      run: function (g) {
        var M = num(g.mtbf, 'la MTBF'), t = num(g.t, 't'), l = 1 / M, out = [['λ', fr(m.round(l, 8))], ['R(t) = P(T &gt; t)', F4(Math.exp(-l * t))], ['F(t) = P(T ≤ t)', F4(1 - Math.exp(-l * t))]];
        var rp = OM.check.parseNum(g.r); if (rp && rp.v > 0 && rp.v < 1) out.push(['Durée t telle que R(t) = ' + fr(rp.v), F4(-Math.log(rp.v) / l)]);
        return out;
      } },
    { id: 'unif', t: 'Loi uniforme', ch: 'III',
      f: [['a', 'a', '4'], ['b', 'b', '16'], ['c', 'c', '6'], ['d', 'd', '12']],
      run: function (g) {
        var a = num(g.a, 'a'), b = num(g.b, 'b'), c = num(g.c, 'c'), d = num(g.d, 'd'); if (b <= a) throw new Error('Il faut a &lt; b.');
        var lo = Math.max(a, Math.min(c, d)), hi = Math.min(b, Math.max(c, d));
        return [['Densité sur [a ; b]', F4(1 / (b - a))], ['P(c ≤ X ≤ d)', F4(Math.max(0, hi - lo) / (b - a))], ['E(X)', F4((a + b) / 2)], ['V(X) ; σ(X)', F4((b - a) * (b - a) / 12) + ' ; ' + F4((b - a) / Math.sqrt(12))]];
      } },
    { id: 'ic', t: 'Intervalle de confiance', ch: 'IV',
      f: [['type', 'Paramètre', ['moyenne (σ connu)', 'moyenne (Student, σ̂)', 'proportion']], ['est', 'x̄ ou f', '52'], ['s', 'σ ou σ̂ (moyenne)', '8'], ['n', 'n', '100'], ['lv', 'Niveau', ['95 %', '90 %', '99 %']]],
      run: function (g) {
        var est = num(g.est, 'l\'estimation'), n = Math.round(num(g.n, 'n')), lv = g.lv, alphaI = { '90 %': 4, '95 %': 5, '99 %': 7 }[lv], z = { '90 %': 1.645, '95 %': 1.96, '99 %': 2.576 }[lv], mg, coef;
        if (g.type === 'proportion') { if (est <= 0 || est >= 1) throw new Error('f doit être entre 0 et 1.'); coef = z; mg = z * Math.sqrt(est * (1 - est) / n); }
        else if (g.type.indexOf('Student') >= 0) {
          var s = num(g.s, 'σ̂'), d = n - 1, row = OM.tables.student.filter(function (r) { return r[0] === d; })[0] || OM.tables.student.filter(function (r) { return typeof r[0] === 'number' && r[0] > d; })[0] || OM.tables.student[OM.tables.student.length - 1];
          coef = row[alphaI + 1]; mg = coef * s / Math.sqrt(n);
        } else { coef = z; mg = z * num(g.s, 'σ') / Math.sqrt(n); }
        return [['Coefficient', fr(coef)], ['Marge', F4(mg)], ['Intervalle', '[' + F4(est - mg) + ' ; ' + F4(est + mg) + ']']];
      } },
    { id: 'chi', t: 'Khi-deux (ajustement ou indépendance)', ch: 'IV',
      f: [['obs', 'Effectifs observés : une ligne par ligne du tableau', '5 6\n5 14\n17 10', 'wide area'], ['th', 'Probabilités attendues (ajustement sur une seule ligne, vide = équiprobable)', '', 'wide']],
      run: function (g) {
        var rows = String(g.obs).trim().split(/\n+/).map(nums).filter(function (r) { return r.length; });
        if (!rows.length) throw new Error('Saisis les effectifs observés.');
        var chi = 0, ddl, Es = [];
        if (rows.length === 1) {
          var O = rows[0], N = sum(O), th = nums(g.th); if (!th.length) th = O.map(function () { return 1 / O.length; });
          if (th.length !== O.length) throw new Error('Autant de probabilités que de catégories.');
          O.forEach(function (o, i) { var e = N * th[i]; Es.push(e); chi += (o - e) * (o - e) / e; }); ddl = O.length - 1;
        } else {
          var c = rows[0].length; if (rows.some(function (r) { return r.length !== c; })) throw new Error('Toutes les lignes doivent avoir le même nombre de colonnes.');
          var rt = rows.map(sum), ct = rows[0].map(function (_, j) { return sum(rows.map(function (r) { return r[j]; })); }), T = sum(rt);
          rows.forEach(function (r, i) { r.forEach(function (o, j) { var e = rt[i] * ct[j] / T; Es.push(e); chi += (o - e) * (o - e) / e; }); });
          ddl = (rows.length - 1) * (c - 1);
        }
        var row = OM.tables.chi2.filter(function (r) { return r[0] === ddl; })[0], crit = row ? row[6] : null;
        return [['Effectifs attendus', Es.map(function (e) { return fr(m.round(e, 2)); }).join(' ; ')], ['χ²', F4(chi)], ['ddl', fr(ddl)], ['Seuil 5 %', crit ? fr(crit) + (chi > crit ? ' → on rejette H₀' : ' → on ne rejette pas H₀') : 'hors table'], ['Attendus ≥ 5 partout ?', Es.every(function (e) { return e >= 5; }) ? 'oui' : 'non : le test n\'est pas valable']];
      } },
    { id: 'mat', t: 'Matrice : déterminant, trace, valeurs propres', ch: 'V',
      f: [['a', 'Matrice 2 × 2 ou 3 × 3, une ligne par ligne', '-1 0 8\n2 3 -4\n1 0 1', 'wide area']],
      run: function (g) {
        var A = String(g.a).trim().split(/\n+/).map(nums).filter(function (r) { return r.length; }), n = A.length;
        if (!(n === 2 || n === 3) || A.some(function (r) { return r.length !== n; })) throw new Error('Saisis une matrice carrée 2 × 2 ou 3 × 3.');
        var tr = n === 2 ? A[0][0] + A[1][1] : A[0][0] + A[1][1] + A[2][2], det, poly;
        if (n === 2) { det = A[0][0] * A[1][1] - A[0][1] * A[1][0]; poly = [1, -tr, det]; }
        else {
          var a = A[0], b = A[1], c = A[2];
          det = a[0] * b[1] * c[2] + a[1] * b[2] * c[0] + a[2] * b[0] * c[1] - a[2] * b[1] * c[0] - a[0] * b[2] * c[1] - a[1] * b[0] * c[2];
          var m2 = (a[0] * b[1] - a[1] * b[0]) + (a[0] * c[2] - a[2] * c[0]) + (b[1] * c[2] - b[2] * c[1]);
          poly = [1, -tr, m2, -det];
        }
        var ev = roots(poly);
        return [['Déterminant', F4(det)], ['Trace', F4(tr)], ['Polynôme caractéristique', n === 2 ? 'λ² − ' + F4(tr) + 'λ + ' + F4(det) : '−λ³ + ' + F4(tr) + 'λ² − ' + F4(poly[2]) + 'λ + ' + F4(det)], ['Valeurs propres', ev.map(cfmt).join(' ; ')]];
      } }
  ];

  OM.route('outils', function (v) {
    var html = '<div class="view-title"><p class="eyebrow">Pour vérifier tes calculs à la maison</p><h1>Vérifier un calcul</h1><p class="muted">Le jour du DE, seule la calculatrice collège est autorisée. Ici, tu contrôles un résultat de TD ou d\'entraînement. Sépare les nombres par des espaces ou des points-virgules.</p></div><div class="stack">';
    TOOLS.forEach(function (t) {
      html += '<section class="card flat tool"><details' + (OM.openTool === t.id ? ' open' : '') + ' data-tool="' + t.id + '"><summary><span>' + t.t + ' <span class="chip ghost">' + t.ch + '</span></span></summary><form class="fields" novalidate>';
      t.f.forEach(function (f) {
        var id = 'tl-' + t.id + '-' + f[0], cls = f[3] ? ' class="' + (f[3].indexOf('wide') >= 0 ? 'wide' : '') + '"' : '';
        if (Array.isArray(f[2])) html += '<label for="' + id + '"' + cls + '>' + f[1] + '<select id="' + id + '" name="' + f[0] + '">' + f[2].map(function (o) { return '<option>' + esc(o) + '</option>'; }).join('') + '</select></label>';
        else if (f[3] && f[3].indexOf('area') >= 0) html += '<label for="' + id + '"' + cls + '>' + f[1] + '<textarea id="' + id + '" name="' + f[0] + '">' + esc(f[2]) + '</textarea></label>';
        else html += '<label for="' + id + '"' + cls + '>' + f[1] + '<input id="' + id + '" name="' + f[0] + '" value="' + esc(f[2]) + '" inputmode="' + (/^[\d\s,;.\-]*$/.test(f[2]) ? 'decimal' : 'text') + '"></label>';
      });
      html += '<button class="btn primary wide" type="submit">Calculer</button></form><div class="res"></div></details></section>';
    });
    v.innerHTML = html + '</div>';
    $$('details[data-tool]', v).forEach(function (d) {
      var tool = TOOLS.filter(function (t) { return t.id === d.dataset.tool; })[0], form = $('form', d), res = $('.res', d);
      function go() {
        var g = {}; $$('input, select, textarea', form).forEach(function (el) { g[el.name] = el.value; });
        try { var rows = tool.run(g); res.innerHTML = '<dl class="out">' + rows.map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('') + '</dl>'; }
        catch (e) { res.innerHTML = '<p class="err">' + e.message + '</p>'; }
      }
      form.addEventListener('submit', function (e) { e.preventDefault(); go(); });
      d.addEventListener('toggle', function () { if (d.open) { OM.openTool = tool.id; if (!res.innerHTML) go(); } });
      if (d.open) go();
    });
  });
})();
