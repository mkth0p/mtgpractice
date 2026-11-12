/* Entraînement : générateurs de questions (nouvelles valeurs à chaque tirage) et questions de cours. */
(function () {
  var H = OM.h, F = H.F, ov = H.ov, tbl = H.tbl, tree = H.tree, fr = H.fr, m = OM.math;
  var PA = function (a, b) { return 'P<sub>' + a + '</sub>(' + b + ')'; };
  function r2(x, d) { return m.round(x, d); }
  function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }

  /* ------------------------------ Chapitre I ------------------------------ */
  OM.gen({ id: 'c1-union', ch: 1, t: 'Réunion et contraire', make: function (R) {
    var a = R.step(0.2, 0.6, 0.05), b = R.step(0.2, 0.6, 0.05), c = R.step(0.05, Math.min(a, b) - 0.05, 0.05), u = a + b - c, v = R.int(0, 1);
    if (v === 0) return { q: 'P(A) = ' + fr(a) + ', P(B) = ' + fr(b) + ' et P(A ∩ B) = ' + fr(c) + '. Calcule P(A ∪ B).', a: r2(u, 4), d: 2, sol: ['P(A ∪ B) = P(A) + P(B) − P(A ∩ B) = ' + fr(a) + ' + ' + fr(b) + ' − ' + fr(c) + ' = ' + fr(r2(u, 4)) + '.'] };
    return { q: 'P(A) = ' + fr(a) + ', P(B) = ' + fr(b) + ' et P(A ∩ B) = ' + fr(c) + '. Calcule P(' + ov('A') + ' ∩ ' + ov('B') + '), la probabilité qu\'aucun des deux ne se réalise.', a: r2(1 - u, 4), d: 2,
      sol: [ov('A') + ' ∩ ' + ov('B') + ' est le contraire de A ∪ B.', 'P(A ∪ B) = ' + fr(a) + ' + ' + fr(b) + ' − ' + fr(c) + ' = ' + fr(r2(u, 4)) + '.', 'P(' + ov('A') + ' ∩ ' + ov('B') + ') = 1 − ' + fr(r2(u, 4)) + ' = ' + fr(r2(1 - u, 4)) + '.'] };
  } });
  OM.gen({ id: 'c1-indep', ch: 1, t: 'Indépendance', make: function (R) {
    var a = R.step(0.2, 0.8, 0.1), b = R.step(0.2, 0.8, 0.1), ind = R.int(0, 1) === 1, c = ind ? r2(a * b, 4) : r2(a * b + R.pick([-0.06, -0.04, 0.04, 0.06]), 4);
    if (c <= 0) c = 0;
    return { q: 'P(A) = ' + fr(a) + ', P(B) = ' + fr(b) + ', P(A ∩ B) = ' + fr(c) + '. A et B sont-ils indépendants ?', c: ['Indépendants', 'Pas indépendants'], a: ind ? 0 : 1,
      sol: ['P(A) × P(B) = ' + fr(a) + ' × ' + fr(b) + ' = ' + fr(r2(a * b, 4)) + '.', ind ? 'C\'est égal à P(A ∩ B) : indépendants.' : 'C\'est différent de P(A ∩ B) = ' + fr(c) + ' : pas indépendants.'] };
  } });
  function tree2(R) {
    var a = R.step(0.2, 0.8, 0.05), b1 = R.step(0.02, 0.3, 0.01), b2 = R.step(0.02, 0.3, 0.01);
    var pb = a * b1 + (1 - a) * b2;
    var txt = 'Dans une usine, une machine A produit ' + fr(a * 100) + ' % des pièces, la machine ' + ov('A') + ' le reste. ' + fr(b1 * 100) + ' % des pièces de A sont défectueuses (D), et ' + fr(b2 * 100) + ' % de celles de ' + ov('A') + '.';
    var fig = tree({ root: [{ l: 'A', p: fr(a), c: [{ l: 'D', p: fr(b1) }, { l: '!D', p: fr(r2(1 - b1, 2)) }] }, { l: '!A', p: fr(r2(1 - a, 2)), c: [{ l: 'D', p: fr(b2) }, { l: '!D', p: fr(r2(1 - b2, 2)) }] }] });
    return { a: a, b1: b1, b2: b2, pb: pb, txt: txt, fig: fig };
  }
  OM.gen({ id: 'c1-total', ch: 1, t: 'Probabilités totales', make: function (R) {
    var t = tree2(R);
    return { q: t.txt + ' On choisit une pièce au hasard. Calcule P(D) (à 10<sup>−4</sup>).', a: r2(t.pb, 4), d: 4, fig: t.fig,
      sol: ['P(D) = P(A) × ' + PA('A', 'D') + ' + P(' + ov('A') + ') × ' + PA(ov('A'), 'D') + '.', '= ' + fr(t.a) + ' × ' + fr(t.b1) + ' + ' + fr(r2(1 - t.a, 2)) + ' × ' + fr(t.b2) + ' = ' + fr(r2(t.a * t.b1, 4)) + ' + ' + fr(r2((1 - t.a) * t.b2, 4)) + ' = ' + fr(r2(t.pb, 4)) + '.'] };
  } });
  OM.gen({ id: 'c1-bayes', ch: 1, t: 'Formule de Bayes', make: function (R) {
    var t = tree2(R), res = t.a * t.b1 / t.pb;
    return { q: t.txt + ' Une pièce est défectueuse. Probabilité qu\'elle vienne de A (au millième) ?', a: r2(res, 3), d: 3, fig: t.fig,
      hint: 'Chemin A puis D, divisé par P(D).',
      sol: ['P(A ∩ D) = ' + fr(t.a) + ' × ' + fr(t.b1) + ' = ' + fr(r2(t.a * t.b1, 4)) + '.', 'P(D) = ' + fr(r2(t.a * t.b1, 4)) + ' + ' + fr(r2(1 - t.a, 2)) + ' × ' + fr(t.b2) + ' = ' + fr(r2(t.pb, 4)) + '.', PA('D', 'A') + ' = ' + fr(r2(t.a * t.b1, 4)) + ' / ' + fr(r2(t.pb, 4)) + ' ≈ ' + fr(r2(res, 3)) + '.'] };
  } });
  OM.gen({ id: 'c1-tree3', ch: 1, t: 'Partition en trois et Bayes', make: function (R) {
    var p1 = R.step(0.2, 0.5, 0.05), p2 = R.step(0.15, 0.4, 0.05); if (p1 + p2 > 0.85) p2 = r2(0.85 - p1, 2); var p3 = r2(1 - p1 - p2, 2);
    var q1 = R.step(0.02, 0.2, 0.01), q2 = R.step(0.02, 0.2, 0.01), q3 = R.step(0.02, 0.2, 0.01), pm = p1 * q1 + p2 * q2 + p3 * q3, v = R.int(0, 1);
    var txt = 'Les clients d\'un site viennent de trois canaux : moteur de recherche (' + fr(p1 * 100) + ' %), réseaux sociaux (' + fr(p2 * 100) + ' %), lien direct (' + fr(p3 * 100) + ' %). Ils achètent (événement M) avec probabilité ' + fr(q1) + ', ' + fr(q2) + ' et ' + fr(q3) + ' selon le canal.';
    if (v === 0) return { q: txt + ' Probabilité qu\'un client achète (à 10<sup>−4</sup>) ?', a: r2(pm, 4), d: 4, sol: ['P(M) = ' + fr(p1) + ' × ' + fr(q1) + ' + ' + fr(p2) + ' × ' + fr(q2) + ' + ' + fr(p3) + ' × ' + fr(q3) + ' = ' + fr(r2(pm, 4)) + '.'] };
    return { q: txt + ' Un client a acheté. Probabilité qu\'il vienne d\'un moteur de recherche (au millième) ?', a: r2(p1 * q1 / pm, 3), d: 3,
      sol: ['P(M) = ' + fr(r2(p1 * q1, 4)) + ' + ' + fr(r2(p2 * q2, 4)) + ' + ' + fr(r2(p3 * q3, 4)) + ' = ' + fr(r2(pm, 4)) + '.', 'P = ' + fr(r2(p1 * q1, 4)) + ' / ' + fr(r2(pm, 4)) + ' ≈ ' + fr(r2(p1 * q1 / pm, 3)) + '.'] };
  } });
  OM.gen({ id: 'c1-atleast', ch: 1, t: 'Au moins un', make: function (R) {
    var n = R.int(3, 12), p = R.step(0.01, 0.1, 0.01), res = 1 - Math.pow(1 - p, n);
    return { q: 'Un serveur a ' + n + ' disques qui tombent en panne indépendamment, chacun avec probabilité ' + fr(p) + ' dans l\'année. Probabilité qu\'au moins un disque tombe en panne (à 10<sup>−4</sup>) ?', a: r2(res, 4), d: 4,
      sol: ['Contraire : aucun disque en panne, probabilité (1 − ' + fr(p) + ')<sup>' + n + '</sup> = ' + fr(r2(Math.pow(1 - p, n), 4)) + '.', 'P(au moins un) = 1 − ' + fr(r2(Math.pow(1 - p, n), 4)) + ' ≈ ' + fr(r2(res, 4)) + '.'] };
  } });
  OM.gen({ id: 'c1-cards', ch: 1, t: 'Équiprobabilité (32 cartes)', make: function (R) {
    var c = R.pick([['un as', 'un cœur', 4, 8, 1], ['une figure', 'un pique', 12, 8, 3], ['un roi', 'une carte rouge', 4, 16, 2], ['un 7', 'un trèfle', 4, 8, 1], ['une dame', 'une carte noire', 4, 16, 2]]);
    var n = c[2] + c[3] - c[4];
    return { q: 'On tire une carte d\'un jeu de 32 (4 couleurs de 8 : 7, 8, 9, 10, valet, dame, roi, as). Probabilité de tirer ' + c[0] + ' ou ' + c[1] + ' (fraction ou décimal) ?', a: n / 32, d: 4,
      sol: ['A = « ' + c[0] + ' » : ' + c[2] + ' cartes ; B = « ' + c[1] + ' » : ' + c[3] + ' cartes ; A ∩ B : ' + c[4] + ' carte' + (c[4] > 1 ? 's' : '') + '.', 'P(A ∪ B) = (' + c[2] + ' + ' + c[3] + ' − ' + c[4] + ') / 32 = ' + n + '/32 ≈ ' + fr(r2(n / 32, 4)) + '.'] };
  } });

  /* ------------------------------ Chapitre II ------------------------------ */
  function discreteSeries(R) {
    var x0 = R.int(0, 10), st = R.pick([1, 2, 5]), xs = [], ns = [];
    for (var i = 0; i < 5; i++) { xs.push(x0 + i * st); ns.push(R.int(1, 12)); }
    return { xs: xs, ns: ns, N: sum(ns) };
  }
  OM.gen({ id: 'c2-mean', ch: 2, t: 'Moyenne d\'une série', make: function (R) {
    var s = discreteSeries(R), snx = sum(s.xs.map(function (x, i) { return x * s.ns[i]; })), mean = snx / s.N;
    return { q: 'Calcule la moyenne de la série (à 10<sup>−2</sup>) :' + tbl([['x<sub>i</sub>'].concat(s.xs.map(String)), ['n<sub>i</sub>'].concat(s.ns.map(String))], { side: true }), a: r2(mean, 2), d: 2,
      sol: ['N = ' + s.N + ' ; Σn<sub>i</sub>x<sub>i</sub> = ' + snx + '.', 'x̄ = ' + snx + ' / ' + s.N + ' ≈ ' + fr(r2(mean, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-sd', ch: 2, t: 'Variance et écart-type', make: function (R) {
    var s = discreteSeries(R), snx = sum(s.xs.map(function (x, i) { return x * s.ns[i]; })), snx2 = sum(s.xs.map(function (x, i) { return x * x * s.ns[i]; }));
    var mean = snx / s.N, v = snx2 / s.N - mean * mean;
    return { q: 'Calcule l\'écart-type σ de la série (à 10<sup>−2</sup>) :' + tbl([['x<sub>i</sub>'].concat(s.xs.map(String)), ['n<sub>i</sub>'].concat(s.ns.map(String))], { side: true }), a: r2(Math.sqrt(v), 2), d: 2,
      sol: ['N = ' + s.N + ' ; Σn<sub>i</sub>x<sub>i</sub> = ' + snx + ' ; Σn<sub>i</sub>x<sub>i</sub>² = ' + snx2 + '.', 'x̄ = ' + fr(r2(mean, 4)) + ' ; V = ' + snx2 + '/' + s.N + ' − x̄² ≈ ' + fr(r2(v, 4)) + '.', 'σ = √V ≈ ' + fr(r2(Math.sqrt(v), 2)) + '.'] };
  } });
  function classSeries(R) {
    var a0 = R.pick([0, 10, 20, 50, 100]), w = R.pick([5, 10, 20]), ns = [], b = [];
    for (var i = 0; i < 5; i++) ns.push(R.int(3, 30));
    for (i = 0; i <= 5; i++) b.push(a0 + i * w);
    return { b: b, ns: ns, N: sum(ns), w: w };
  }
  function classTable(s) { return tbl([['Classe'].concat(s.ns.map(function (_, i) { return '[' + s.b[i] + ' ; ' + s.b[i + 1] + '['; })), ['Effectif'].concat(s.ns.map(String))], { side: true }); }
  OM.gen({ id: 'c2-median', ch: 2, t: 'Médiane par interpolation', make: function (R) {
    var s = classSeries(R), half = s.N / 2, cum = 0, k = 0;
    while (cum + s.ns[k] < half) { cum += s.ns[k]; k++; }
    var me = s.b[k] + (half - cum) / s.ns[k] * s.w;
    return { q: 'Calcule la médiane par interpolation linéaire (à 10<sup>−2</sup>) :' + classTable(s), a: r2(me, 2), d: 2,
      sol: ['N = ' + s.N + ', N/2 = ' + fr(half) + '. Effectifs cumulés : ' + s.ns.map(function (_, i) { return sum(s.ns.slice(0, i + 1)); }).join(', ') + '.', 'Classe médiane : [' + s.b[k] + ' ; ' + s.b[k + 1] + '[ (ECC avant : ' + cum + ', effectif ' + s.ns[k] + ').', 'Me = ' + s.b[k] + ' + (' + fr(half) + ' − ' + cum + ') / ' + s.ns[k] + ' × ' + s.w + ' ≈ ' + fr(r2(me, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-mean-classes', ch: 2, t: 'Moyenne d\'une série en classes', make: function (R) {
    var s = classSeries(R), c = s.ns.map(function (_, i) { return (s.b[i] + s.b[i + 1]) / 2; }), snc = sum(c.map(function (x, i) { return x * s.ns[i]; }));
    return { q: 'Calcule la moyenne de cette série en classes (à 10<sup>−2</sup>) :' + classTable(s), a: r2(snc / s.N, 2), d: 2,
      sol: ['Centres : ' + c.map(function (x) { return fr(x); }).join(' ; ') + '.', 'Σn<sub>i</sub>c<sub>i</sub> = ' + fr(snc) + ' ; N = ' + s.N + '.', 'x̄ = ' + fr(snc) + ' / ' + s.N + ' ≈ ' + fr(r2(snc / s.N, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-quartile', ch: 2, t: 'Quartiles d\'une série discrète', make: function (R) {
    var xs = [1, 2, 3, 4, 5, 6], ns = xs.map(function () { return R.int(2, 12); }), N = sum(ns), which = R.pick(['Q<sub>1</sub>', 'Q<sub>3</sub>', 'la médiane']);
    var cum = [], c = 0; ns.forEach(function (n) { c += n; cum.push(c); });
    var target = which === 'Q<sub>1</sub>' ? N / 4 : which === 'Q<sub>3</sub>' ? 3 * N / 4 : null, ans, expl;
    if (target !== null) { var k = 0; while (cum[k] < target) k++; ans = xs[k]; expl = 'Plus petite valeur dont l\'ECC atteint ' + fr(target) + ' : ' + ans + '.'; }
    else {
      var rank = function (r) { var k = 0; while (cum[k] < r) k++; return xs[k]; };
      if (N % 2) { ans = rank((N + 1) / 2); expl = 'N impair : valeur de rang ' + (N + 1) / 2 + ' = ' + ans + '.'; }
      else { var v1 = rank(N / 2), v2 = rank(N / 2 + 1); ans = (v1 + v2) / 2; expl = 'N pair : moyenne des rangs ' + N / 2 + ' et ' + (N / 2 + 1) + ' : (' + v1 + ' + ' + v2 + ')/2 = ' + fr(ans) + '.'; }
    }
    return { q: 'Nombre de pannes par semaine relevé sur ' + N + ' semaines. Donne ' + which + '.' + tbl([['Pannes'].concat(xs.map(String)), ['Semaines'].concat(ns.map(String))], { side: true }), a: ans, d: 1,
      sol: ['Effectifs cumulés croissants : ' + cum.join(', ') + ' (N = ' + N + ').', expl] };
  } });
  function pairSeries(R) {
    var xs = [1, 2, 3, 4, 5].map(function (i) { return i * R.pick([1, 2]) + R.int(0, 2); });
    xs = xs.sort(function (a, b) { return a - b; });
    var a = R.pick([1.5, 2, 2.5, 3, -1.5, -2]), b = R.int(5, 20);
    var ys = xs.map(function (x) { return Math.round(a * x + b + R.int(-3, 3)); });
    return { xs: xs, ys: ys };
  }
  function regStats(xs, ys) {
    var n = xs.length, mx = sum(xs) / n, my = sum(ys) / n, sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += Math.pow(xs[i] - mx, 2); syy += Math.pow(ys[i] - my, 2); }
    return { n: n, mx: mx, my: my, sxy: sxy, sxx: sxx, syy: syy, cov: sxy / n, a: sxy / sxx, b: my - sxy / sxx * mx, r: sxy / Math.sqrt(sxx * syy) };
  }
  function pairTable(p) { return tbl([['x'].concat(p.xs.map(String)), ['y'].concat(p.ys.map(String))], { side: true }); }
  OM.gen({ id: 'c2-cov', ch: 2, t: 'Covariance', make: function (R) {
    var p = pairSeries(R), s = regStats(p.xs, p.ys);
    return { q: 'Calcule la covariance de x et y (à 10<sup>−2</sup>) :' + pairTable(p), a: r2(s.cov, 2), d: 2,
      sol: ['x̄ = ' + fr(s.mx) + ' ; ȳ = ' + fr(s.my) + '.', 'Σ(x − x̄)(y − ȳ) = ' + fr(r2(s.sxy, 4)) + '.', 'Cov = ' + fr(r2(s.sxy, 4)) + ' / ' + s.n + ' ≈ ' + fr(r2(s.cov, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-reg', ch: 2, t: 'Droite des moindres carrés', make: function (R) {
    var p = pairSeries(R), s = regStats(p.xs, p.ys);
    return { q: 'Droite des moindres carrés y = ax + b : donne a (à 10<sup>−3</sup>) et b (à 10<sup>−2</sup>).' + pairTable(p), a: [r2(s.a, 3), r2(s.b, 2)], l: ['a', 'b'], d: [3, 2], tol: 0.006,
      sol: ['x̄ = ' + fr(s.mx) + ' ; ȳ = ' + fr(s.my) + '.', 'Σ(x − x̄)(y − ȳ) = ' + fr(r2(s.sxy, 4)) + ' ; Σ(x − x̄)² = ' + fr(r2(s.sxx, 4)) + '.', 'a = ' + fr(r2(s.sxy, 4)) + ' / ' + fr(r2(s.sxx, 4)) + ' ≈ ' + fr(r2(s.a, 3)) + ' ; b = ȳ − a x̄ ≈ ' + fr(r2(s.b, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-r', ch: 2, t: 'Coefficient de corrélation r', make: function (R) {
    var p = pairSeries(R), s = regStats(p.xs, p.ys);
    return { q: 'Calcule le coefficient de corrélation r (à 10<sup>−3</sup>) :' + pairTable(p), a: r2(s.r, 3), d: 3,
      sol: ['Σ(x − x̄)(y − ȳ) = ' + fr(r2(s.sxy, 4)) + ' ; Σ(x − x̄)² = ' + fr(r2(s.sxx, 4)) + ' ; Σ(y − ȳ)² = ' + fr(r2(s.syy, 4)) + '.', 'r = ' + fr(r2(s.sxy, 4)) + ' / √(' + fr(r2(s.sxx, 4)) + ' × ' + fr(r2(s.syy, 4)) + ') ≈ ' + fr(r2(s.r, 3)) + '.', Math.abs(s.r) > 0.9 ? 'Forte corrélation linéaire.' : 'Corrélation linéaire modérée.'] };
  } });
  OM.gen({ id: 'c2-expo', ch: 2, t: 'Ajustement exponentiel', make: function (R) {
    var a = R.step(0.02, 0.3, 0.01), b = R.step(0.5, 3, 0.05), x0 = R.int(5, 20), v = R.int(0, 1);
    if (v === 0) return { q: 'Après le changement de variable z = ln y, on obtient z = ' + fr(a) + 'x + ' + fr(b) + '. Écris y = B e<sup>' + fr(a) + 'x</sup> : donne B à 10<sup>−2</sup>.', a: r2(Math.exp(b), 2), d: 2,
      sol: ['y = e<sup>z</sup> = e<sup>' + fr(a) + 'x + ' + fr(b) + '</sup> = e<sup>' + fr(b) + '</sup> × e<sup>' + fr(a) + 'x</sup>.', 'B = e<sup>' + fr(b) + '</sup> ≈ ' + fr(r2(Math.exp(b), 2)) + '.'] };
    var y = Math.exp(a * x0 + b);
    return { q: 'Avec z = ln y = ' + fr(a) + 'x + ' + fr(b) + ', estime y pour x = ' + x0 + ' (à 10<sup>−2</sup>).', a: r2(y, 2), tol: Math.max(0.006, y * 0.001),
      sol: ['z = ' + fr(a) + ' × ' + x0 + ' + ' + fr(b) + ' = ' + fr(r2(a * x0 + b, 4)) + '.', 'y = e<sup>z</sup> ≈ ' + fr(r2(y, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-hist', ch: 2, t: 'Hauteur d\'histogramme', make: function (R) {
    var ref = R.pick([10, 20, 50]), k = R.pick([2, 3, 4, 0.5]), amp = ref * k, n = R.int(6, 60);
    return { q: 'Histogramme à classes inégales, amplitude de référence ' + ref + '. Une classe d\'amplitude ' + fr(amp) + ' a un effectif de ' + n + '. Quelle hauteur lui donner ?', a: r2(n * ref / amp, 2), d: 2,
      sol: ['Hauteur = effectif × amplitude de référence / amplitude de la classe.', '= ' + n + ' × ' + ref + ' / ' + fr(amp) + ' = ' + fr(r2(n * ref / amp, 2)) + '.'] };
  } });
  OM.gen({ id: 'c2-struct', ch: 2, t: 'Moyenne de sous-groupes', make: function (R) {
    var n1 = R.int(10, 60), n2 = R.int(10, 60), m1 = R.int(8, 14), m2 = R.int(9, 16), mean = (n1 * m1 + n2 * m2) / (n1 + n2);
    return { q: 'Groupe 1 : ' + n1 + ' étudiants, moyenne ' + m1 + '/20. Groupe 2 : ' + n2 + ' étudiants, moyenne ' + m2 + '/20. Moyenne de l\'ensemble (à 10<sup>−2</sup>) ?', a: r2(mean, 2), d: 2,
      sol: ['Moyenne pondérée par les effectifs : (' + n1 + ' × ' + m1 + ' + ' + n2 + ' × ' + m2 + ') / ' + (n1 + n2) + '.', '= ' + (n1 * m1 + n2 * m2) + ' / ' + (n1 + n2) + ' ≈ ' + fr(r2(mean, 2)) + '. Ce n\'est pas (' + m1 + ' + ' + m2 + ')/2 sauf si les effectifs sont égaux.'] };
  } });

  /* ------------------------------ Chapitre III ------------------------------ */
  OM.gen({ id: 'c3-ev', ch: 3, t: 'Espérance et variance d\'une loi discrète', make: function (R) {
    var xs = [R.int(-20, -5), R.int(0, 5), R.int(6, 15), R.int(16, 40)], tenth = [R.int(1, 4), R.int(1, 3), R.int(1, 3)];
    tenth.push(10 - sum(tenth)); if (tenth[3] < 1) { tenth = [3, 3, 2, 2]; }
    var ps = tenth.map(function (t) { return t / 10; }), E = sum(xs.map(function (x, i) { return x * ps[i]; })), E2 = sum(xs.map(function (x, i) { return x * x * ps[i]; })), v = R.int(0, 1);
    var t = tbl([['x<sub>i</sub>'].concat(xs.map(String)), ['P(X = x<sub>i</sub>)'].concat(ps.map(function (p) { return fr(p); }))], { side: true });
    if (v === 0) return { q: 'Gain X d\'un jeu (en €) :' + t + 'Calcule E(X).', a: r2(E, 4), d: 2, sol: ['E(X) = Σx<sub>i</sub>p<sub>i</sub> = ' + xs.map(function (x, i) { return fr(x) + ' × ' + fr(ps[i]); }).join(' + ') + ' = ' + fr(r2(E, 4)) + '.'] };
    return { q: 'Gain X d\'un jeu (en €) :' + t + 'Calcule V(X) (à 10<sup>−2</sup>).', a: r2(E2 - E * E, 2), d: 2,
      sol: ['E(X) = ' + fr(r2(E, 4)) + ' ; E(X²) = ' + xs.map(function (x, i) { return fr(x) + '² × ' + fr(ps[i]); }).join(' + ') + ' = ' + fr(r2(E2, 4)) + '.', 'V(X) = E(X²) − E(X)² = ' + fr(r2(E2, 4)) + ' − ' + fr(r2(E, 4)) + '² ≈ ' + fr(r2(E2 - E * E, 2)) + '.'] };
  } });
  OM.gen({ id: 'c3-affine', ch: 3, t: 'E(aX + b) et V(aX + b)', make: function (R) {
    var e = R.int(2, 20), v = R.int(1, 16), a = R.pick([-3, -2, 2, 3, 4, 5]), b = R.int(-10, 10);
    return { q: 'E(X) = ' + e + ' et V(X) = ' + v + '. Pour Y = ' + a + 'X ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + ', calcule E(Y) et V(Y).', a: [a * e + b, a * a * v], l: ['E(Y)', 'V(Y)'], d: 1,
      sol: ['E(aX + b) = aE(X) + b = ' + a + ' × ' + e + ' ' + (b < 0 ? '− ' + (-b) : '+ ' + b) + ' = ' + (a * e + b) + '.', 'V(aX + b) = a²V(X) = ' + (a * a) + ' × ' + v + ' = ' + (a * a * v) + ' (le b disparaît).'] };
  } });
  OM.gen({ id: 'c3-binom', ch: 3, t: 'Loi binomiale', make: function (R) {
    var n = R.int(5, 20), p = R.step(0.05, 0.5, 0.05), k = R.int(1, Math.min(4, n)), v = R.int(0, 2), res, q, sol;
    if (v === 0) { res = m.binom(n, p, k); q = 'P(X = ' + k + ')'; sol = ['P(X = ' + k + ') = (<sup>' + n + '</sup><sub>' + k + '</sub>) × ' + fr(p) + '<sup>' + k + '</sup> × ' + fr(r2(1 - p, 2)) + '<sup>' + (n - k) + '</sup>.', '(<sup>' + n + '</sup><sub>' + k + '</sub>) = ' + m.comb(n, k) + ', donc P ≈ ' + fr(r2(res, 4)) + '.']; }
    else if (v === 1) { res = 1 - Math.pow(1 - p, n); q = 'P(X ≥ 1)'; sol = ['P(X ≥ 1) = 1 − P(X = 0) = 1 − ' + fr(r2(1 - p, 2)) + '<sup>' + n + '</sup> ≈ ' + fr(r2(res, 4)) + '.']; }
    else { res = 0; for (var j = 0; j <= k; j++) res += m.binom(n, p, j); q = 'P(X ≤ ' + k + ')'; sol = ['P(X ≤ ' + k + ') = P(X = 0) + … + P(X = ' + k + ').', 'Valeurs : ' + Array.apply(null, { length: k + 1 }).map(function (_, j) { return fr(r2(m.binom(n, p, j), 4)); }).join(' + ') + ' ≈ ' + fr(r2(res, 4)) + '.']; }
    return { q: 'X ∼ ℬ(' + n + ' ; ' + fr(p) + '). Calcule ' + q + ' (à 10<sup>−4</sup>).', a: r2(res, 4), d: 4, sol: sol };
  } });
  OM.gen({ id: 'c3-binom-es', ch: 3, t: 'Espérance et écart-type d\'une binomiale', make: function (R) {
    var n = R.int(20, 400), p = R.step(0.02, 0.6, 0.02);
    return { q: 'On contrôle ' + n + ' pièces, chacune défectueuse avec probabilité ' + fr(p) + ', indépendamment. X compte les défectueuses. Donne E(X) et σ(X) (à 10<sup>−2</sup>).', a: [r2(n * p, 2), r2(Math.sqrt(n * p * (1 - p)), 2)], l: ['E(X)', 'σ(X)'], d: 2,
      sol: ['X ∼ ℬ(' + n + ' ; ' + fr(p) + ').', 'E(X) = np = ' + fr(r2(n * p, 2)) + ' ; σ = √(np(1 − p)) = √' + fr(r2(n * p * (1 - p), 4)) + ' ≈ ' + fr(r2(Math.sqrt(n * p * (1 - p)), 2)) + '.'] };
  } });
  OM.gen({ id: 'c3-poisson', ch: 3, t: 'Loi de Poisson', make: function (R) {
    var l = R.step(0.5, 6, 0.5), k = R.int(0, 5), v = R.int(0, 2), res, q, terms = [];
    for (var j = 0; j <= k; j++) terms.push(m.pois(l, j));
    if (v === 0) { res = m.pois(l, k); q = 'P(X = ' + k + ')'; }
    else if (v === 1) { res = sum(terms); q = 'P(X ≤ ' + k + ')'; }
    else { k = Math.max(1, k); terms = []; for (j = 0; j < k; j++) terms.push(m.pois(l, j)); res = 1 - sum(terms); q = 'P(X ≥ ' + k + ')'; }
    var sol = v === 0 ? ['P(X = ' + k + ') = e<sup>−' + fr(l) + '</sup> × ' + fr(l) + '<sup>' + k + '</sup> / ' + k + '! ≈ ' + fr(r2(res, 3)) + '.'] :
      v === 1 ? ['Somme des P(X = j) pour j = 0 à ' + k + ' : ' + terms.map(function (t) { return fr(r2(t, 4)); }).join(' + ') + ' ≈ ' + fr(r2(res, 3)) + '.'] :
        ['P(X ≥ ' + k + ') = 1 − P(X ≤ ' + (k - 1) + ').', 'P(X ≤ ' + (k - 1) + ') ≈ ' + fr(r2(1 - res, 4)) + ', donc P ≈ ' + fr(r2(res, 3)) + '.'];
    return { q: 'Le nombre de pannes par mois suit la loi de Poisson de paramètre λ = ' + fr(l) + '. Calcule ' + q + ' (au millième).', a: r2(res, 3), d: 3, sol: sol };
  } });
  OM.gen({ id: 'c3-normal', ch: 3, t: 'Loi normale et table', make: function (R) {
    var mu = R.pick([20, 50, 80, 100, 250, 500, 1000]), s = R.pick([2, 4, 5, 8, 10, 12, 20, 25]), v = R.int(0, 2);
    var t1 = R.step(-2.5, 2.5, 0.05), t2 = R.step(0.1, 2.5, 0.05);
    var x = r2(mu + t1 * s, 2), q, res, sol;
    if (v === 0) { res = m.piTab(t1); q = 'P(X ≤ ' + fr(x) + ')'; sol = ['t = (' + fr(x) + ' − ' + mu + ') / ' + s + ' = ' + fr(r2(t1, 2)) + '.', t1 >= 0 ? 'P = π(' + fr(r2(t1, 2)) + ') = ' + fr(res, 4) + '.' : 'P = π(' + fr(r2(t1, 2)) + ') = 1 − π(' + fr(r2(-t1, 2)) + ') = 1 − ' + fr(m.pi4(r2(-t1, 2)), 4) + ' = ' + fr(res, 4) + '.']; }
    else if (v === 1) { res = r2(1 - m.piTab(t1), 4); q = 'P(X ≥ ' + fr(x) + ')'; sol = ['t = (' + fr(x) + ' − ' + mu + ') / ' + s + ' = ' + fr(r2(t1, 2)) + '.', 'P = 1 − π(' + fr(r2(t1, 2)) + ') = 1 − ' + fr(m.piTab(t1), 4) + ' = ' + fr(res, 4) + '.']; }
    else { res = r2(2 * m.pi4(t2) - 1, 4); var lo = r2(mu - t2 * s, 2), hi = r2(mu + t2 * s, 2); q = 'P(' + fr(lo) + ' ≤ X ≤ ' + fr(hi) + ')'; sol = ['Bornes centrées réduites : ±' + fr(r2(t2, 2)) + '.', 'P = 2π(' + fr(r2(t2, 2)) + ') − 1 = 2 × ' + fr(m.pi4(t2), 4) + ' − 1 = ' + fr(res, 4) + '.']; }
    return { q: 'X ∼ N(' + mu + ' ; ' + s + '²). Calcule ' + q + ' avec la table (à 10<sup>−4</sup>).', a: res, d: 4, tol: 0.0003, sol: sol };
  } });
  OM.gen({ id: 'c3-normal-inv', ch: 3, t: 'Intervalle centré de la loi normale', make: function (R) {
    var mu = R.pick([50, 100, 200, 500]), s = R.pick([4, 5, 8, 10, 15, 20]), lv = R.pick([[0.9, 1.645], [0.95, 1.96], [0.99, 2.576]]);
    return { q: 'X ∼ N(' + mu + ' ; ' + s + '²). Trouve a tel que P(' + mu + ' − a ≤ X ≤ ' + mu + ' + a) = ' + fr(lv[0]) + ' (à 10<sup>−2</sup>).', a: r2(lv[1] * s, 2), tol: 0.06,
      sol: ['2π(a/σ) − 1 = ' + fr(lv[0]) + ' ⇒ π(a/σ) = ' + fr(r2((1 + lv[0]) / 2, 3)) + ' ⇒ a/σ = ' + fr(lv[1]) + '.', 'a = ' + fr(lv[1]) + ' × ' + s + ' = ' + fr(r2(lv[1] * s, 2)) + '.'] };
  } });
  OM.gen({ id: 'c3-uniform', ch: 3, t: 'Loi uniforme', make: function (R) {
    var a = R.int(0, 20), b = a + R.int(5, 40), c = R.int(a, b - 2), d = R.int(c + 1, b), v = R.int(0, 2);
    if (v === 0) return { q: 'T suit la loi uniforme sur [' + a + ' ; ' + b + ']. Calcule P(' + c + ' ≤ T ≤ ' + d + ') (au millième).', a: r2((d - c) / (b - a), 3), d: 3, sol: ['P = (' + d + ' − ' + c + ') / (' + b + ' − ' + a + ') = ' + (d - c) + '/' + (b - a) + ' ≈ ' + fr(r2((d - c) / (b - a), 3)) + '.'] };
    if (v === 1) return { q: 'T suit la loi uniforme sur [' + a + ' ; ' + b + ']. Donne E(T) et V(T) (à 10<sup>−2</sup>).', a: [(a + b) / 2, r2(Math.pow(b - a, 2) / 12, 2)], l: ['E(T)', 'V(T)'], d: 2, sol: ['E(T) = (' + a + ' + ' + b + ')/2 = ' + fr((a + b) / 2) + '.', 'V(T) = (' + b + ' − ' + a + ')²/12 = ' + Math.pow(b - a, 2) + '/12 ≈ ' + fr(r2(Math.pow(b - a, 2) / 12, 2)) + '.'] };
    return { q: 'T suit la loi uniforme sur [' + a + ' ; ' + b + ']. Sachant T &gt; ' + c + ', probabilité que T ≤ ' + d + ' (au millième) ?', a: r2((d - c) / (b - c), 3), d: 3, sol: ['P(' + c + ' &lt; T ≤ ' + d + ') = ' + (d - c) + '/' + (b - a) + ' ; P(T &gt; ' + c + ') = ' + (b - c) + '/' + (b - a) + '.', 'Quotient : ' + (d - c) + '/' + (b - c) + ' ≈ ' + fr(r2((d - c) / (b - c), 3)) + '.'] };
  } });
  OM.gen({ id: 'c3-expo', ch: 3, t: 'Loi exponentielle et fiabilité', make: function (R) {
    var mtbf = R.pick([200, 400, 500, 800, 1000, 2000, 5000]), l = 1 / mtbf, t = Math.round(mtbf * R.step(0.1, 1.5, 0.1)), v = R.int(0, 3);
    var base = 'La durée de vie T (heures) d\'un équipement suit une loi exponentielle de MTBF ' + mtbf + ' h. ';
    if (v === 0) return { q: base + 'Probabilité qu\'il fonctionne encore après ' + t + ' h (au millième) ?', a: r2(Math.exp(-l * t), 3), d: 3, sol: ['λ = 1/' + mtbf + '.', 'R(' + t + ') = e<sup>−' + t + '/' + mtbf + '</sup> = e<sup>−' + fr(r2(t / mtbf, 4)) + '</sup> ≈ ' + fr(r2(Math.exp(-l * t), 3)) + '.'] };
    if (v === 1) return { q: base + 'Probabilité qu\'il tombe en panne avant ' + t + ' h (au millième) ?', a: r2(1 - Math.exp(-l * t), 3), d: 3, sol: ['F(' + t + ') = 1 − e<sup>−' + fr(r2(t / mtbf, 4)) + '</sup> ≈ ' + fr(r2(1 - Math.exp(-l * t), 3)) + '.'] };
    if (v === 2) { var rr = R.pick([0.5, 0.8, 0.9, 0.95]); return { q: base + 'Durée de fonctionnement assurée avec une fiabilité de ' + fr(rr) + ' (à l\'heure près) ?', a: Math.round(-Math.log(rr) * mtbf), tol: 1.01, sol: ['e<sup>−λt</sup> = ' + fr(rr) + ' ⇒ t = −ln(' + fr(rr) + ') × ' + mtbf + '.', 't ≈ ' + Math.round(-Math.log(rr) * mtbf) + ' h.'] }; }
    var s = Math.round(mtbf * 0.5);
    return { q: base + 'Il fonctionne depuis ' + s + ' h. Probabilité qu\'il fonctionne encore ' + t + ' h de plus (au millième) ?', a: r2(Math.exp(-l * t), 3), d: 3, hint: 'Loi sans mémoire.', sol: ['Sans mémoire : P<sub>T &gt; ' + s + '</sub>(T &gt; ' + (s + t) + ') = P(T &gt; ' + t + ').', '= e<sup>−' + fr(r2(t / mtbf, 4)) + '</sup> ≈ ' + fr(r2(Math.exp(-l * t), 3)) + '.'] };
  } });
  OM.gen({ id: 'c3-approx', ch: 3, t: 'Choisir une approximation', make: function (R) {
    var c = R.pick([[200, 0.01], [500, 0.004], [100, 0.05], [400, 0.3], [1000, 0.2], [60, 0.5], [20, 0.1], [25, 0.4], [300, 0.02]]), n = c[0], p = c[1], np = n * p, ans;
    if (n < 30) ans = 2; else if (p <= 0.1 && np < 15) ans = 0; else if (np > 5 && np * (1 - p) > 5) ans = 1; else ans = 2;
    return { q: 'X ∼ ℬ(' + n + ' ; ' + fr(p) + '). Quelle approximation utiliser (conditions du poly) ?', c: ['Poisson de paramètre λ = ' + fr(r2(np, 3)), 'Normale N(' + fr(r2(np, 3)) + ' ; ' + fr(r2(np * (1 - p), 3)) + ')', 'Aucune : on garde la binomiale'], a: ans,
      sol: ['n = ' + n + ', p = ' + fr(p) + ', np = ' + fr(r2(np, 3)) + ', np(1 − p) = ' + fr(r2(np * (1 - p), 3)) + '.', ans === 0 ? 'n ≥ 30, p ≤ 0,1 et np &lt; 15 : Poisson de paramètre np.' : ans === 1 ? 'n ≥ 30, np &gt; 5 et np(1 − p) &gt; 5 (et p n\'est pas petit) : normale de moyenne np et de variance np(1 − p).' : 'n &lt; 30 (ou conditions non remplies) : pas d\'approximation.'] };
  } });

  /* ------------------------------ Chapitre IV ------------------------------ */
  OM.gen({ id: 'c4-ic-mean', ch: 4, t: 'IC d\'une moyenne', make: function (R) {
    var n = R.pick([36, 49, 64, 100, 144, 400]), s = R.pick([4, 6, 8, 10, 12, 15]), xb = R.int(40, 300), lv = R.pick([[90, 1.645], [95, 1.96], [99, 2.576]]), mg = lv[1] * s / Math.sqrt(n);
    return { q: 'Échantillon de ' + n + ' mesures : moyenne x̄ = ' + xb + ', écart-type de la population σ = ' + s + '. Intervalle de confiance à ' + lv[0] + ' % de la moyenne (bornes à 10<sup>−2</sup>) ?', a: [r2(xb - mg, 2), r2(xb + mg, 2)], l: ['borne basse', 'borne haute'], d: 2,
      sol: ['σ/√n = ' + s + '/' + Math.sqrt(n) + ' = ' + fr(r2(s / Math.sqrt(n), 4)) + ' ; z = ' + fr(lv[1]) + '.', 'Marge = ' + fr(lv[1]) + ' × ' + fr(r2(s / Math.sqrt(n), 4)) + ' ≈ ' + fr(r2(mg, 3)) + '.', 'IC ≈ [' + fr(r2(xb - mg, 2)) + ' ; ' + fr(r2(xb + mg, 2)) + '].'] };
  } });
  OM.gen({ id: 'c4-ic-prop', ch: 4, t: 'IC d\'une proportion', make: function (R) {
    var n = R.pick([100, 200, 400, 500, 800, 1000]), k = Math.round(n * R.step(0.1, 0.7, 0.05)), f = k / n, se = Math.sqrt(f * (1 - f) / n), mg = 1.96 * se;
    return { q: 'Sur ' + n + ' personnes interrogées, ' + k + ' répondent oui. Intervalle de confiance à 95 % de la proportion (bornes à 10<sup>−3</sup>) ?', a: [r2(f - mg, 3), r2(f + mg, 3)], l: ['borne basse', 'borne haute'], d: 3,
      sol: ['f = ' + k + '/' + n + ' = ' + fr(r2(f, 4)) + '.', '√(f(1 − f)/n) ≈ ' + fr(r2(se, 5)) + ' ; marge = 1,96 × ' + fr(r2(se, 5)) + ' ≈ ' + fr(r2(mg, 4)) + '.', 'IC ≈ [' + fr(r2(f - mg, 3)) + ' ; ' + fr(r2(f + mg, 3)) + '].'] };
  } });
  OM.gen({ id: 'c4-sigmahat', ch: 4, t: 'Écart-type corrigé', make: function (R) {
    var n = R.int(5, 40), s = R.step(1, 20, 0.5), sh = Math.sqrt(n / (n - 1)) * s;
    return { q: 'Sur un échantillon de ' + n + ' valeurs, l\'écart-type observé (division par n) vaut ' + fr(s) + '. Estimation sans biais σ̂ de l\'écart-type de la population (à 10<sup>−3</sup>) ?', a: r2(sh, 3), d: 3,
      sol: ['σ̂ = √(n/(n − 1)) × σ = √(' + n + '/' + (n - 1) + ') × ' + fr(s) + ' ≈ ' + fr(r2(sh, 3)) + '.'] };
  } });
  var CHI5 = { 1: 3.841, 2: 5.991, 3: 7.815, 4: 9.488, 5: 11.07, 6: 12.592, 7: 14.067, 8: 15.507, 9: 16.919 };
  OM.gen({ id: 'c4-chi2', ch: 4, t: 'Khi-deux d\'ajustement', make: function (R) {
    var k = R.int(4, 6), each = R.pick([10, 15, 20, 25]), N = k * each, obs = [];
    for (var i = 0; i < k; i++) obs.push(each);
    for (i = 0; i < k; i++) { var i1 = R.int(0, k - 1), i2 = R.int(0, k - 1), dv = R.int(1, Math.floor(each / 2)); if (i1 !== i2 && obs[i2] - dv >= 1) { obs[i1] += dv; obs[i2] -= dv; } }
    var chi = sum(obs.map(function (o) { return Math.pow(o - each, 2) / each; })), crit = CHI5[k - 1];
    return { q: 'Un générateur doit produire ' + k + ' catégories équiprobables. Sur ' + N + ' tirages, on observe :' + tbl([['Catégorie'].concat(obs.map(function (_, i) { return String(i + 1); })), ['Observé'].concat(obs.map(String))], { side: true }) + 'Calcule χ² (à 10<sup>−2</sup>).', a: r2(chi, 2), d: 2,
      sol: ['Effectif attendu par catégorie : ' + N + '/' + k + ' = ' + each + '.', 'χ² = Σ(O − ' + each + ')²/' + each + ' = ' + obs.map(function (o) { return fr(r2(Math.pow(o - each, 2) / each, 3)); }).join(' + ') + ' ≈ ' + fr(r2(chi, 2)) + '.', 'ddl = ' + (k - 1) + ', valeur critique à 5 % : ' + fr(crit) + '. ' + (chi > crit ? 'χ² &gt; ' + fr(crit) + ' : on rejette l\'équiprobabilité.' : 'χ² ≤ ' + fr(crit) + ' : on ne rejette pas l\'équiprobabilité.')] };
  } });
  OM.gen({ id: 'c4-ddl', ch: 4, t: 'Degrés de liberté et seuil', make: function (R) {
    var r = R.int(2, 4), c = R.int(2, 4), d = (r - 1) * (c - 1);
    return { q: 'Test d\'indépendance sur un tableau de ' + r + ' lignes et ' + c + ' colonnes (sans les totaux). Nombre de degrés de liberté, et valeur critique du χ² au seuil de 5 % ?', a: [d, CHI5[d]], l: ['ddl', 'valeur critique'], d: [0, 2],
      sol: ['ddl = (' + r + ' − 1)(' + c + ' − 1) = ' + d + '.', 'Table du khi-deux, ligne ' + d + ', colonne 0,05 : ' + fr(CHI5[d]) + '.'] };
  } });

  /* ------------------------------ Chapitre V ------------------------------ */
  function matHtml(rows) { return tbl(rows.map(function (r) { return r.map(function (x) { return fr(x); }); }), { head: false, cls: 'big' }); }
  OM.gen({ id: 'c5-det2', ch: 5, t: 'Déterminant 2 × 2', make: function (R) {
    var a = R.int(-6, 9), b = R.int(-6, 9), c = R.int(-6, 9), d = R.int(-6, 9);
    return { q: 'Calcule le déterminant de :' + matHtml([[a, b], [c, d]]), a: a * d - b * c, d: 0,
      sol: ['ad − bc = ' + fr(a) + ' × ' + fr(d) + ' − ' + fr(b) + ' × ' + fr(c) + ' = ' + fr(a * d) + ' − ' + fr(b * c) + ' = ' + fr(a * d - b * c) + '.'] };
  } });
  OM.gen({ id: 'c5-det3', ch: 5, t: 'Déterminant 3 × 3 (Sarrus)', make: function (R) {
    var A = [0, 1, 2].map(function () { return [0, 1, 2].map(function () { return R.int(-3, 4); }); });
    var a = A[0], b = A[1], c = A[2];
    var p = a[0] * b[1] * c[2] + a[1] * b[2] * c[0] + a[2] * b[0] * c[1], n = a[2] * b[1] * c[0] + a[0] * b[2] * c[1] + a[1] * b[0] * c[2];
    return { q: 'Calcule le déterminant par la règle de Sarrus :' + matHtml(A), a: p - n, d: 0,
      sol: ['Diagonales descendantes : ' + fr(a[0] * b[1] * c[2]) + ' + ' + fr(a[1] * b[2] * c[0]) + ' + ' + fr(a[2] * b[0] * c[1]) + ' = ' + fr(p) + '.', 'Diagonales montantes : ' + fr(a[2] * b[1] * c[0]) + ' + ' + fr(a[0] * b[2] * c[1]) + ' + ' + fr(a[1] * b[0] * c[2]) + ' = ' + fr(n) + '.', 'Det = ' + fr(p) + ' − ' + fr(n) + ' = ' + fr(p - n) + '.'] };
  } });
  OM.gen({ id: 'c5-eig2', ch: 5, t: 'Valeurs propres 2 × 2', make: function (R) {
    var l1, l2, a, d, K, b, c, tries = 0;
    do {
      l1 = R.int(-4, 6); l2 = R.int(-4, 6); a = R.int(-3, 6); d = l1 + l2 - a; K = a * d - l1 * l2;
      var divs = []; for (var x = 1; x <= Math.abs(K); x++) if (K % x === 0) { divs.push(x); divs.push(-x); }
      if (K === 0) { b = R.int(1, 5); c = 0; } else { b = R.pick(divs); c = K / b; }
      tries++;
    } while ((l1 === l2 || Math.abs(b) > 9 || Math.abs(c) > 9) && tries < 50);
    var hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return { q: 'Valeurs propres de la matrice :' + matHtml([[a, b], [c, d]]) + 'Donne-les de la plus grande à la plus petite.', a: [hi, lo], l: ['λ₁', 'λ₂'], d: 0,
      sol: ['Det(A − λI) = (' + fr(a) + ' − λ)(' + fr(d) + ' − λ) − (' + fr(b) + ')(' + fr(c) + ') = λ² − ' + fr(a + d) + 'λ + ' + fr(a * d - b * c) + '.', 'Somme des racines = Tr(A) = ' + fr(a + d) + ', produit = Det(A) = ' + fr(a * d - b * c) + ' : λ = ' + fr(hi) + ' et ' + fr(lo) + '.'] };
  } });
  OM.gen({ id: 'c5-cr', ch: 5, t: 'Valeur centrée réduite', make: function (R) {
    var mu = R.int(10, 500), s = R.step(2, 60, 0.5), x = r2(mu + R.step(-2.5, 2.5, 0.05) * s, 2);
    return { q: 'Une variable a pour moyenne ' + mu + ' et écart-type ' + fr(s) + '. Valeur centrée réduite de ' + fr(x) + ' (à 10<sup>−2</sup>) ?', a: r2((x - mu) / s, 2), d: 2,
      sol: ['(x − x̄)/σ = (' + fr(x) + ' − ' + mu + ')/' + fr(s) + ' ≈ ' + fr(r2((x - mu) / s, 2)) + '.', ((x - mu) >= 0 ? 'La valeur est ' + fr(Math.abs(r2((x - mu) / s, 2))) + ' écart-type au-dessus de la moyenne.' : 'La valeur est ' + fr(Math.abs(r2((x - mu) / s, 2))) + ' écart-type au-dessous de la moyenne.')] };
  } });
  OM.gen({ id: 'c5-tracedet', ch: 5, t: 'Trace et déterminant par les valeurs propres', make: function (R) {
    var ls = [R.int(-4, 5), R.int(-4, 5), R.int(-4, 5)];
    return { q: 'Une matrice 3 × 3 a pour valeurs propres ' + ls.map(function (x) { return fr(x); }).join(', ') + ' (avec multiplicité). Donne sa trace et son déterminant.', a: [sum(ls), ls[0] * ls[1] * ls[2]], l: ['Tr(A)', 'Det(A)'], d: 0,
      sol: ['Tr(A) = somme des valeurs propres = ' + fr(sum(ls)) + '.', 'Det(A) = produit = ' + fr(ls[0] * ls[1] * ls[2]) + '. Vrai même si A n\'est pas diagonalisable.'] };
  } });

  /* ------------------------------ Questions de cours ------------------------------ */
  OM.mcq(1, [
    ['Deux événements incompatibles, de probabilités non nulles, peuvent-ils être indépendants ?', ['Oui, toujours', 'Non, jamais', 'Seulement si P(A) = P(B)'], 1, 'Incompatibles : P(A ∩ B) = 0. Indépendants : P(A ∩ B) = P(A)P(B) &gt; 0. Les deux sont impossibles en même temps.'],
    ['Sur un arbre pondéré, la probabilité d\'un chemin est…', ['la somme des branches', 'le produit des branches', 'la dernière branche'], 1, 'P(A ∩ B) = P(A) × ' + PA('A', 'B') + ' : on multiplie le long du chemin.'],
    ['Que vaut ' + PA('A', 'Ω') + ' ?', ['0', 'P(A)', '1'], 2, 'Sachant A, l\'événement certain reste certain.'],
    ['Si A ⊂ B, alors…', ['P(A) ≤ P(B)', 'P(A) ≥ P(B)', 'P(A) = P(B)'], 0, 'Propriété du poly p. 7.'],
    ['La loi faible des grands nombres dit que…', ['la fréquence d\'un événement se rapproche de sa probabilité quand le nombre d\'expériences augmente', 'après une série de pile, face devient plus probable', 'toute probabilité vaut ½ à la longue'], 0, 'La fréquence observée se stabilise autour de la probabilité théorique p quand n est grand.'],
    ['Formule de Bayes : ' + PA('B', 'A') + ' = …', [F('P(A) × ' + PA('A', 'B'), 'P(B)'), F('P(B) × ' + PA('A', 'B'), 'P(A)'), 'P(A) × P(B)'], 0, 'P(A ∩ B) = P(A)' + PA('A', 'B') + ' = P(B)' + PA('B', 'A') + '.'],
    ['A et B sont incompatibles, P(A) = 0,3 et P(B) = 0,4. Que vaut P(A ∪ B) ?', ['0,7', '0,58', '0,12'], 0, 'Incompatibles : P(A ∩ B) = 0, donc P(A ∪ B) = 0,3 + 0,4.'],
    ['P(A) = 0,2, ' + PA('A', 'B') + ' = 0,5 et ' + PA(ov('A'), 'B') + ' = 0,25. Que vaut P(B) ?', ['0,3', '0,75', '0,1'], 0, '0,2 × 0,5 + 0,8 × 0,25 = 0,1 + 0,2 = 0,3.'],
    ['P(A) = 0,2, ' + PA('A', 'B') + ' = 0,5, ' + PA(ov('A'), 'B') + ' = 0,25, donc P(B) = 0,3. Que vaut ' + PA('B', 'A') + ' ?', ['1/3', '0,5', '0,1'], 0, 'P(A ∩ B) / P(B) = 0,1 / 0,3 = 1/3.']
  ]);
  OM.mcq(2, [
    ['Quel graphique pour un caractère qualitatif (ex. système d\'exploitation) ?', ['Histogramme', 'Diagramme circulaire ou en barres', 'Courbe des effectifs cumulés'], 1, 'Qualitatif : circulaire, barres (tuyaux d\'orgue) ou bande. Histogramme : quantitatif continu.'],
    ['Quel graphique pour un caractère quantitatif continu (ex. durée d\'appel) ?', ['Histogramme', 'Diagramme en bâtons', 'Diagramme circulaire'], 0, 'Continu : histogramme ; discret : bâtons.'],
    ['Cov(x, y) = 12. Que peut-on dire de la force du lien ?', ['Le lien est fort', 'Rien sans r : la covariance dépend des unités', 'Le lien est faible'], 1, 'Le signe donne le sens ; la force se lit avec r.'],
    ['r = −0,98 signifie…', ['forte liaison linéaire décroissante', 'aucune liaison', 'forte liaison croissante'], 0, '|r| proche de 1 : forte liaison ; r &lt; 0 : pente négative.'],
    ['Si on échange les rôles de x et y, le coefficient r…', ['change de signe', 'reste le même', 'est inversé (1/r)'], 1, 'r est symétrique en x et y.'],
    ['R² = r² est vrai…', ['pour tout ajustement', 'seulement pour la régression linéaire', 'jamais'], 1, 'Pour un ajustement exponentiel, logarithmique… R² n\'est plus r².'],
    ['En statistique descriptive, la variance se calcule en divisant par…', ['N', 'N − 1', 'N + 1'], 0, 'N − 1 sert à estimer la variance d\'une population (chapitre IV).'],
    ['Dans le modèle y = f(x), x est…', ['la variable expliquée', 'la variable explicative', 'le résidu'], 1, 'On suppose que x agit sur y : x explique y.'],
    ['Dans un histogramme à classes inégales, l\'effectif d\'une classe est proportionnel à…', ['l\'aire de son rectangle', 'la hauteur de son rectangle', 'la largeur de la classe'], 0, 'Hauteur = effectif / amplitude : c\'est l\'aire qui représente l\'effectif.'],
    ['Ajustement de z = ln y : z = 0,5x + 2. Expression de y ?', ['y = e² e<sup>0,5x</sup>', 'y = 0,5 e<sup>x</sup> + 2', 'y = ln(0,5x + 2)'], 0, 'y = e<sup>z</sup> = e<sup>0,5x + 2</sup> = e² × e<sup>0,5x</sup>.'],
    ['On exprime x en minutes au lieu d\'heures. Alors…', ['la covariance est multipliée par 60, r ne change pas', 'la covariance et r ne changent pas', 'r est multiplié par 60'], 0, 'La covariance dépend des unités, r non : c\'est r qui mesure la force du lien.']
  ]);
  OM.mcq(3, [
    ['X ∼ ℬ(n, p). P(X ≥ 3) = …', ['1 − P(X ≤ 3)', '1 − P(X ≤ 2)', 'P(X = 3)'], 1, 'Le contraire de « X ≥ 3 » est « X ≤ 2 ».'],
    ['X suit une loi continue. P(X = 2) = …', ['0', 'f(2)', 'F(2)'], 0, 'Pour une variable continue, la probabilité d\'une valeur isolée est nulle.'],
    ['V(3X + 2) = …', ['3V(X) + 2', '9V(X)', '9V(X) + 2'], 1, 'V(aX + b) = a²V(X).'],
    ['Pour une loi exponentielle de paramètre λ, la MTBF vaut…', ['λ', '1/λ', 'e<sup>−λ</sup>'], 1, 'MTBF = E(T) = 1/λ.'],
    ['π(−1,2) = …', ['−π(1,2)', '1 − π(1,2)', 'π(1,2) − 1'], 1, 'Symétrie : π(−t) = 1 − π(t).'],
    ['La loi géométrique modélise…', ['le nombre de succès en n essais', 'le rang du premier succès', 'un temps d\'attente continu'], 1, 'X ∼ 𝒢(p) : P(X = k) = (1 − p)<sup>k−1</sup>p.'],
    ['X et Y indépendantes, σ(X) = 3, σ(Y) = 4. σ(X + Y) = …', ['7', '5', '25'], 1, 'V(X + Y) = 9 + 16 = 25, σ = 5. Les écarts-types ne s\'additionnent pas.'],
    ['Pour une variable aléatoire discrète, F(x) = P(X ≤ x) est…', ['décroissante', 'constante par morceaux et croissante', 'toujours continue'], 1, 'Une fonction en escalier, croissante, de 0 à 1.'],
    ['ℬ(100 ; 0,03) peut être approchée par…', ['𝒫(3)', 'N(3 ; 2,91)', '𝒫(0,03)'], 0, 'n ≥ 30, p ≤ 0,1, np = 3 &lt; 15 : Poisson de paramètre λ = np = 3.'],
    ['ℬ(200 ; 0,5) peut être approchée par une loi normale de paramètres…', ['m = 100 et σ ≈ 7,07', 'm = 100 et σ = 50', 'm = 0,5 et σ = 200'], 0, 'm = np = 100 ; σ = √(np(1 − p)) = √50 ≈ 7,07.'],
    ['MTBF d\'un composant : 2 000 h (loi exponentielle). λ vaut…', ['0,0005', '2 000', '0,002'], 0, 'λ = 1/MTBF = 1/2 000.'],
    ['Loi exponentielle : P(T &gt; 150 sachant T &gt; 100) est égale à…', ['P(T &gt; 50)', 'P(T &gt; 150)', 'P(T &gt; 250)'], 0, 'Sans mémoire : après 100, on repart de zéro.'],
    ['Pour X ∼ N(m ; σ²), P(m − 1,96σ ≤ X ≤ m + 1,96σ) vaut…', ['0,95', '0,68', '0,99'], 0, '2π(1,96) − 1 = 2 × 0,975 − 1 = 0,95.'],
    ['E(X) = 5. Que vaut E(3X + 2) ?', ['17', '15', '7'], 0, 'E(aX + b) = aE(X) + b = 15 + 2.']
  ]);
  OM.mcq(4, [
    ['Pour estimer la variance d\'une population à partir d\'un échantillon, on divise par…', ['n', 'n − 1', 'n + 1'], 1, 'Variance corrigée (sans biais) : correction de Bessel.'],
    ['Plus le niveau de confiance est élevé, plus l\'intervalle de confiance est…', ['étroit', 'large', 'inchangé'], 1, 'z passe de 1,645 (90 %) à 1,96 (95 %) puis 2,576 (99 %).'],
    ['Si la taille de l\'échantillon est multipliée par 4, la marge d\'erreur d\'un IC de moyenne est…', ['divisée par 2', 'divisée par 4', 'multipliée par 2'], 0, 'La marge contient 1/√n.'],
    ['χ² calculé = 3,2 ; valeur critique 5,99. Conclusion ?', ['On rejette H<sub>0</sub>', 'On ne rejette pas H<sub>0</sub>', 'On ne peut rien dire'], 1, '3,2 ≤ 5,99 : les écarts peuvent venir du hasard.'],
    ['Degrés de liberté d\'un test d\'indépendance sur un tableau 3 × 4 ?', ['12', '6', '7'], 1, '(3 − 1)(4 − 1) = 6.'],
    ['« On ne rejette pas H<sub>0</sub> » veut dire…', ['H<sub>0</sub> est prouvée', 'on n\'a pas assez de preuves pour la rejeter', 'H<sub>1</sub> est vraie'], 1, 'Un test ne prouve jamais H<sub>0</sub>.'],
    ['Pour un IC de moyenne avec σ inconnu et petit échantillon, on utilise…', ['la loi de Student à n − 1 ddl', 'la loi de Poisson', 'le khi-deux'], 0, 'Avec l\'écart-type corrigé σ̂.']
  ]);
  OM.mcq(5, [
    ['Une matrice a deux colonnes proportionnelles. Son déterminant…', ['est nul', 'vaut 1', 'change de signe'], 0, 'Colonnes liées : déterminant nul.'],
    ['Les valeurs propres d\'une matrice triangulaire sont…', ['ses termes diagonaux', 'les termes de sa première ligne', 'toujours 0 et 1'], 0, 'Det(A − λI) est le produit des (a<sub>ii</sub> − λ).'],
    ['La somme des valeurs propres d\'une matrice est égale…', ['à son déterminant', 'à sa trace', 'à son rang'], 1, 'Tr(A) = somme des λ ; Det(A) = produit.'],
    ['Une matrice 3 × 3 avec trois valeurs propres distinctes est…', ['toujours diagonalisable', 'jamais diagonalisable', 'diagonalisable seulement si elle est symétrique'], 0, 'Condition suffisante du poly p. 67.'],
    ['Sur la diagonale de la matrice de corrélation R, on trouve…', ['les variances', 'des 1', 'des 0'], 1, 'Chaque variable est parfaitement corrélée avec elle-même.'],
    ['La règle de Sarrus s\'applique aux matrices d\'ordre…', ['2', '3 uniquement', 'tout ordre'], 1, 'Au-delà de 3 : cofacteurs ou pivot.'],
    ['Dans la matrice des données brutes, une ligne correspond à…', ['une variable', 'un individu', 'une covariance'], 1, 'n lignes (individus), p colonnes (variables).']
  ]);
})();
