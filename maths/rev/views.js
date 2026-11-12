/* Révision Outils Maths 3 — vues (accueil, cours, TD, entraînement, examen blanc). */
(function () {
  'use strict';
  var OM = window.OM, H = OM.h, S = OM.S, fr = H.fr, esc = H.esc, $ = OM.ui.$, $$ = OM.ui.$$;

  var PLAN = [
    { id: 'w1', from: '2026-11-12', to: '2026-11-15', when: '12 → 15 nov.', h: 'Chapitre I · Probabilités', items: [
      ['cours-1', 'Lire la fiche du chapitre I : vocabulaire, formules, pièges'],
      ['td-1-1', 'TD I, exercices 1 à 7 (indépendance, arbres, Bayes)'],
      ['td-1-8', 'TD I, exercices 8 à 13']] },
    { id: 'w2', from: '2026-11-16', to: '2026-11-22', when: '16 → 22 nov.', h: 'Chapitre II · Statistiques descriptives', items: [
      ['cours-2', 'Lire la fiche du chapitre II'],
      ['td-2-1', 'TD II, une variable : exercices 1 à 12'],
      ['td-2-13', 'TD II, deux variables : exercices 13 à 20']] },
    { id: 'w3', from: '2026-11-23', to: '2026-11-29', when: '23 → 29 nov.', h: 'Chapitre III · Variables aléatoires', items: [
      ['cours-3', 'Lire la fiche du chapitre III et apprendre à lire la table'],
      ['td-3-0a', 'TD III, exercice 0 : les 30 calculs d\'entraînement'],
      ['td-3-1', 'TD III, exercices 1 à 8 (lois discrètes, approximations)'],
      ['td-3-9', 'TD III, exercices 9 à 15 (uniforme, exponentielle)']] },
    { id: 'w4', from: '2026-11-30', to: '2026-12-06', when: '30 nov. → 6 déc.', h: 'Chapitres IV et V · Inférence, matrices', items: [
      ['cours-4', 'Fiche IV : estimation, intervalles de confiance, tests, khi-deux'],
      ['td-4-A', 'Exemples guidés du chapitre IV'],
      ['cours-5', 'Fiche V : matrices de données, déterminant, valeurs propres'],
      ['td-5-A', 'Exemples guidés du chapitre V']] },
    { id: 'w5', from: '2026-12-07', to: '2026-12-10', when: '7 → 10 déc.', h: 'Dernière ligne droite', items: [
      ['examen-de', 'Examen blanc chronométré (1 h 50)'],
      ['quiz', 'Entraînement « Mes erreurs » jusqu\'à vider la liste'],
      ['express', 'Fiche express la veille au soir']] }
  ];
  var JOURJ = [
    'Calculatrice scientifique type collège (Casio fx-92 ou celle de l\'Efrei). Graphique et programmable interdites.',
    'Téléphone éteint et rangé : il est interdit pendant le DE.',
    'Salle B010, bâtiment B : début à 8 h 00, sois là vers 7 h 45.',
    'Deux stylos, une règle pour les arbres et les histogrammes, une montre.'
  ];
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  /* Interrogation sur les chapitres I et II, vendredi 13/11 (séance de 13 h 40 sur MyEfrei). */
  var INTERRO = {
    date: '2026-11-13',
    soir: [
      ['cours-1', 'Fiche du chapitre I : vocabulaire, formules, pièges', 10, false],
      ['td-1-4', 'Arbres et Bayes : TD I, exercices 4, 5 et 12', 25, true],
      ['td-1-1', 'Indépendance et « au moins un » : TD I, exercices 1, 2 et 6', 10, false],
      ['cours-2', 'Fiche du chapitre II', 10, false],
      ['td-2-3', 'Séries en classes (moyenne, écart-type, médiane) : TD II, exercices 3, 8 et 9', 25, true],
      ['td-2-7', 'Quartiles et effectifs cumulés : TD II, exercices 7 et 12', 10, false],
      ['td-2-14', 'Deux variables (covariance, droite, r) : TD II, exercices 14, 15 et 16', 25, true],
      ['td-2-17', 'Changements de variable : TD II, exercices 17 et 20', 15, false],
      ['examen-interro', 'Interro blanche chronométrée sur I et II', 50, true],
      ['quiz', 'Entraînement « Mes erreurs », filtre I + II', 10, false]
    ],
    plus: 'S\'il te reste du temps : TD I, exercices 7, 8, 10 et 13 ; TD II, exercices 1, 2, 4, 5, 6, 10, 11, 13, 18 et 19.',
    matin: [
      ['quiz', 'Cartes mémoire chapitres I et II', 10, 'flash'],
      ['express', 'Fiche express : relis les blocs I et II', 5, ''],
      ['', 'Calculatrice collège dans le sac. Graphique, programmable et téléphone interdits.', 0, '']
    ]
  };
  function interroHtml(today) {
    var tomorrow = today < INTERRO.date, next = null;
    INTERRO.soir.forEach(function (it, i) { if (!next && !S.plan['ii-' + i]) next = { it: it, i: i }; });
    var item = function (it, key, i) {
      var id = key + i, link = it[0] ? '<a href="#' + it[0] + '"' + (it[0] === 'quiz' ? ' data-qch="1,2"' : '') + (it[3] === 'flash' ? ' data-flash="1"' : '') + '>' + esc(it[1]) + '</a>' : esc(it[1]);
      return '<li class="check"><input type="checkbox" id="' + id + '" data-plan="' + id + '"' + (S.plan[id] ? ' checked' : '') + '><label for="' + id + '">' + link +
        (it[2] ? ' <span class="mins">' + it[2] + ' min</span>' : '') + (it[3] === true ? ' <span class="chip warn">prioritaire</span>' : '') + '</label></li>';
    };
    return '<section class="card interro stack">' +
      '<p class="eyebrow">Interrogation · chapitres I et II</p>' +
      '<div class="row" style="align-items:flex-end;gap:14px"><span class="big2">' + (tomorrow ? 'Demain' : 'Aujourd\'hui') + '</span><span class="muted">vendredi 13 novembre<br>séance d\'Outils Maths à 13 h 40 (MyEfrei)</span></div>' +
      '<p class="small">Probabilités (arbres, Bayes, indépendance) et statistiques descriptives (une et deux variables). Calculatrice collège ; graphique, programmable et téléphone interdits.</p>' +
      '<div class="row">' + (next ? '<a class="btn primary" href="#' + next.it[0] + '"' + (next.it[0] === 'quiz' ? ' data-qch="1,2"' : '') + '>Continuer : étape ' + (next.i + 1) + '</a>' : '<a class="btn primary" href="#quiz" data-qch="1,2" data-flash="1">Cartes mémoire I + II</a>') +
      '<a class="btn soft" href="#examen-interro">Interro blanche (50 min)</a></div>' +
      (tomorrow ? '<h3>Ce soir, dans l\'ordre</h3><p class="small muted">Environ 3 h en tout. Peu de temps ? Fais d\'abord les étapes marquées « prioritaire ». Le minuteur en haut cadence 15 min de travail et 3 min de pause.</p>' +
        '<ul class="todo">' + INTERRO.soir.map(function (it, i) { return item(it, 'ii-', i); }).join('') + '</ul><p class="small muted">' + INTERRO.plus + '</p>' : '') +
      '<h3>' + (tomorrow ? 'Demain matin' : 'Ce matin') + ', 15 minutes</h3><ul class="todo">' + INTERRO.matin.map(function (it, i) { return item(it, 'im-', i); }).join('') + '</ul></section>';
  }

  /* ================= ACCUEIL ================= */
  OM.route('accueil', function (v) {
    var n = OM.daysLeft(), next = OM.progress.nextTodo(true), today = iso(new Date());
    var big = n > 0 ? 'J−' + n : n === 0 ? 'Jour J' : 'Passé';
    var html = '<div class="stack-lg">';
    if (today <= INTERRO.date) html += interroHtml(today);
    html += '<section class="card exam-card stack">' +
      '<svg class="bell" viewBox="0 0 180 110" aria-hidden="true"><path d="M0 108 C40 108 55 8 90 8 S140 108 180 108" fill="none" stroke="currentColor" stroke-width="3"/></svg>' +
      '<p class="eyebrow" style="color:inherit;opacity:.75">Devoir écrit · Outils Mathématiques 3</p>' +
      '<div class="row" style="align-items:flex-end;gap:14px"><span class="big">' + big + '</span><span class="muted">vendredi 11 décembre<br>8 h 00 → 9 h 50 · salle B010</span></div>' +
      '<p class="muted small">Tout le cours : probabilités, statistiques descriptives, variables aléatoires, inférence, matrices. Les chapitres IV et V sont vus en cours les 13, 19 et 20 novembre.</p>' +
      '<div class="row">' +
      (next ? '<a class="btn primary" href="#td-' + next.ex.id + '" data-q="' + next.qi + '">Continuer : ' + esc(OM.byCh[next.ex.ch].num) + ' · ex. ' + esc(next.ex.n) + '</a>' : '<a class="btn primary" href="#examen">Faire l\'examen blanc</a>') +
      '<a class="btn soft" href="#quiz" data-quick="1">Séance de 15 min</a></div></section>';

    /* plan */
    html += '<section class="stack"><div class="row"><h2 style="flex:1">Plan jusqu\'au DE</h2><span class="chip ghost">coche au fur et à mesure</span></div><ol class="plan">';
    PLAN.forEach(function (w) {
      var now = today >= w.from && today <= w.to;
      html += '<li class="' + (now ? 'now' : '') + '"><p class="when">' + w.when + (now ? ' · cette semaine' : '') + '</p><h3>' + w.h + '</h3><ul class="items">';
      w.items.forEach(function (it, i) {
        var id = 'plan-' + w.id + '-' + i;
        html += '<li class="check"><input type="checkbox" id="' + id + '" data-plan="' + w.id + '-' + i + '"' + (S.plan[w.id + '-' + i] ? ' checked' : '') + '><label for="' + id + '"><a href="#' + it[0] + '">' + esc(it[1]) + '</a></label></li>';
      });
      html += '</ul></li>';
    });
    html += '<li><p class="when">11 déc. · jour J</p><h3>Dans le sac</h3><ul class="items">' + JOURJ.map(function (t, i) {
      var id = 'jj-' + i; return '<li class="check"><input type="checkbox" id="' + id + '" data-plan="jj-' + i + '"' + (S.plan['jj-' + i] ? ' checked' : '') + '><label for="' + id + '">' + esc(t) + '</label></li>';
    }).join('') + '</ul><p class="small" style="margin-top:10px"><b>Pendant l\'épreuve :</b> lis tout le sujet, commence par l\'exercice qui te semble le plus facile, écris la loi et ses paramètres avant de calculer, et arrondis seulement à la fin. Le matin même : <a href="#quiz" data-flash="1">cartes mémoire</a>, 15 minutes.</p></li></ol></section>';

    /* progress */
    html += '<section class="stack"><h2>Où tu en es</h2><div class="grid2">';
    OM.chapters.forEach(function (c) {
      var st = OM.progress.chStats(c), p = st.n ? st.done / st.n : 0;
      html += '<a class="card chapcard flat" href="#td" data-ch="' + c.id + '"><div class="row"><span class="rn">' + c.num + '</span><b style="flex:1">' + esc(c.short) + '</b></div>' +
        '<div class="progress" aria-hidden="true"><i style="width:' + Math.round(p * 100) + '%"></i></div>' +
        '<span class="small muted">' + st.done + ' / ' + st.n + ' questions de TD faites' + (st.done ? ', ' + st.ok + ' justes du premier coup ou après correction' : '') +
        (st.quizN ? ' · entraînement : ' + st.quizOk + ' / ' + st.quizN : '') + '</span></a>';
    });
    html += '</div></section>';

    html += '<section class="grid2">' +
      '<a class="card flat chapcard" href="#examen"><span class="eyebrow">1 h 50</span><b>Examen blanc</b><span class="small muted">Un sujet complet, chronométré, corrigé à la fin.</span></a>' +
      '<a class="card flat chapcard" href="#express"><span class="eyebrow">la veille</span><b>Fiche express</b><span class="small muted">Toutes les formules sur une page.</span></a></section>';
    html += '<details class="card flat"><summary><b>Comment travailler avec cette page</b></summary><ul class="prose small" style="margin-top:10px">' +
      '<li>Répondre à des questions et voir la correction tout de suite aide à retenir, mieux que relire, y compris chez les étudiants avec un TDAH (<a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10397724/" target="_blank" rel="noopener">Frontiers in Psychology, 2023</a>).</li>' +
      '<li>Un exemple corrigé pas à pas, puis une question à faire seul, allège la mémoire de travail (<a href="https://escholarship.org/uc/item/2854h4v0" target="_blank" rel="noopener">recherche sur les exemples résolus</a>) : c\'est le rôle de « Correction pas à pas ».</li>' +
      '<li>Des pauses courtes en bougeant aident l\'attention : le bouton minuteur en haut lance 15 minutes de travail puis 3 minutes de pause.</li>' +
      '<li>Pas de calculatrice sous la main ? Tape le calcul dans la case (0,25*0,98/0,836, e^(-0,73), π(1,29), C(150;4)) : le résultat s\'affiche dessous.</li></ul></details>';
    html += '</div>';
    v.innerHTML = html;
    OM.ui.$$('[data-plan]', v).forEach(function (cb) { cb.addEventListener('change', function () { S.plan[cb.dataset.plan] = cb.checked; OM.save(); }); });
    var q = $('[data-q]', v);
    if (q) q.addEventListener('click', function () { OM.pendingQ = +q.dataset.q; });
    var quick = $('[data-quick]', v);
    if (quick) quick.addEventListener('click', function () { OM.quickStart = true; });
    $$('[data-flash]', v).forEach(function (a) { a.addEventListener('click', function () { OM.flashStart = true; }); });
    $$('[data-qch]', v).forEach(function (a) { a.addEventListener('click', function () { S.quizCh = a.dataset.qch; OM.save(); }); });
    OM.ui.$$('[data-ch]', v).forEach(function (a) { a.addEventListener('click', function () { OM.tdFilter = +a.dataset.ch; }); });
  });

  /* ================= COURS ================= */
  OM.route('cours', function (v, args) {
    if (args.length) return chapterView(v, +args[0]);
    var html = '<div class="view-title"><p class="eyebrow">Polycopié ARAC72 · 72 pages</p><h1>Cours</h1><p class="muted">Chaque fiche reprend tout le chapitre du poly : définitions, formules, méthodes et pièges.</p></div><div class="stack">';
    OM.chapters.forEach(function (c) {
      html += '<a class="card chapcard flat" href="#cours-' + c.id + '"><div class="row"><span class="rn">' + c.num + '</span><b style="flex:1">' + esc(c.title) + '</b><span class="chip ghost">' + esc(c.pages) + '</span></div><span class="small muted">' + esc(c.summary || '') + '</span></a>';
    });
    html += '<a class="card chapcard flat" href="#express"><b>Fiche express</b><span class="small muted">Toutes les formules des cinq chapitres, pour la veille et le matin du DE.</span></a>';
    html += '<section class="card flat stack"><h2>Erreurs repérées dans le poly et les TD</h2><ul class="traps">' + (OM.errata || []).map(function (e) { return '<li>' + e + '</li>'; }).join('') + '</ul></section>';
    v.innerHTML = html + '</div>';
  });

  function chapterView(v, id) {
    var c = OM.byCh[id];
    if (!c) { v.innerHTML = '<p>Chapitre introuvable.</p>'; return; }
    var html = '<div class="view-title"><p class="eyebrow">Chapitre ' + c.num + ' · ' + esc(c.pages) + (c.sessions ? ' · ' + esc(c.sessions) : '') + '</p><h1>' + esc(c.title) + '</h1>' + (c.intro ? '<p class="muted">' + c.intro + '</p>' : '') + '</div>';
    html += '<nav class="toc" aria-label="Plan du chapitre">' + c.cours.map(function (s, i) { return '<a href="#cours-' + id + '" data-jump="s' + i + '">' + esc(s.h) + '</a>'; }).join('') +
      '<a href="#cours-' + id + '" data-jump="formules">Formules</a><a href="#cours-' + id + '" data-jump="methodes">Méthodes</a><a href="#cours-' + id + '" data-jump="pieges">Pièges</a></nav><div class="stack-lg" style="margin-top:16px">';
    c.cours.forEach(function (s, i) { html += '<section class="sec card flat" id="s' + i + '"><h2>' + esc(s.h) + '</h2><div class="prose">' + s.html + '</div></section>'; });
    html += '<section class="sec card flat" id="formules"><h2>Formules</h2><dl class="formulas">' + c.formules.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl></section>';
    html += '<section class="sec card flat stack" id="methodes"><h2>Méthodes</h2>' + c.methodes.map(function (m) { return '<div class="method"><h3>' + m.h + '</h3><ol>' + m.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>'; }).join('') + '</section>';
    html += '<section class="sec stack" id="pieges"><h2>Pièges</h2><ul class="traps">' + c.pieges.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul></section>';
    var first = (c.td && c.td[0]) || (c.ex && c.ex[0]);
    html += '<div class="navrow">' + (OM.byCh[id - 1] ? '<a class="btn" href="#cours-' + (id - 1) + '">← Chapitre ' + OM.byCh[id - 1].num + '</a>' : '') +
      (first ? '<a class="btn primary" href="#td-' + first.id + '">' + (c.td && c.td.length ? 'TD du chapitre ' : 'Exemples du chapitre ') + c.num + '</a>' : '') +
      (OM.byCh[id + 1] ? '<a class="btn" href="#cours-' + (id + 1) + '">Chapitre ' + OM.byCh[id + 1].num + ' →</a>' : '') + '</div></div>';
    v.innerHTML = html;
    $$('[data-jump]', v).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
  }

  OM.route('express', function (v) {
    var html = '<div class="view-title"><p class="eyebrow">À relire la veille</p><h1>Fiche express</h1><p class="muted">Toutes les formules, chapitre par chapitre. Les pièges sont en bas.</p></div><div class="stack-lg">';
    OM.chapters.forEach(function (c) {
      html += '<section class="card flat"><h2>' + c.num + ' · ' + esc(c.short) + '</h2><dl class="formulas" style="margin-top:8px">' + c.formules.map(function (f) { return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>'; }).join('') + '</dl></section>';
    });
    html += '<section class="stack"><h2>Les pièges, tous chapitres</h2><ul class="traps">';
    OM.chapters.forEach(function (c) { c.pieges.forEach(function (p) { html += '<li>' + p + '</li>'; }); });
    v.innerHTML = html + '</ul></section></div>';
  });

  /* ================= TD ================= */
  OM.route('td', function (v, args) {
    if (args.length >= 2) return exerciseView(v, args[0] + '-' + args.slice(1).join('-'));
    var f = OM.tdFilter || 0;
    var html = '<div class="view-title"><p class="eyebrow">Feuilles de TD Moodle, corrigées</p><h1>TD corrigés</h1><p class="muted">Chaque exercice reprend l\'énoncé complet. Chaque question rappelle les valeurs dont elle a besoin.</p></div>';
    html += '<div class="seg" role="group" aria-label="Filtrer par chapitre"><button type="button" data-f="0" aria-pressed="' + (f === 0) + '">Tous</button>' +
      OM.chapters.map(function (c) { return '<button type="button" data-f="' + c.id + '" aria-pressed="' + (f === c.id) + '">' + c.num + '</button>'; }).join('') + '</div><div class="stack-lg" style="margin-top:16px">';
    OM.chapters.forEach(function (c) {
      if (f && f !== c.id) return;
      var list = (c.td || []).concat(c.ex || []);
      html += '<section class="stack"><h2>' + c.num + ' · ' + esc(c.short) + '</h2>' + (c.tdNote ? '<p class="small muted">' + c.tdNote + '</p>' : '') + '<ul class="exlist">';
      list.forEach(function (ex) {
        var st = OM.progress.exStats(ex);
        html += '<li><a href="#td-' + ex.id + '"><span class="n">' + esc(ex.n) + '</span><span class="t"><b>' + ex.t + (ex.opt ? ' <span class="chip ghost">facultatif</span>' : '') + '</b><span>' + esc(ex.tags || '') + ' · ' + st.n + ' question' + (st.n > 1 ? 's' : '') + '</span></span>' + OM.ui.ring(st.n ? st.done / st.n : 0) + '</a></li>';
      });
      html += '</ul></section>';
    });
    v.innerHTML = html + '</div>';
    $$('[data-f]', v).forEach(function (b) { b.addEventListener('click', function () { OM.tdFilter = +b.dataset.f; OM.render(); }); });
  });

  function exerciseView(v, id) {
    var ex = OM.exos[id];
    if (!ex) { v.innerHTML = '<div class="card"><p>Exercice introuvable.</p><a class="btn" href="#td">Retour aux TD</a></div>'; return; }
    var c = OM.byCh[ex.ch];
    var qi = OM.pendingQ != null ? OM.pendingQ : (function () { for (var j = 0; j < ex.q.length; j++) if (!S.prog[ex.id + '.' + j]) return j; return 0; })();
    OM.pendingQ = null;
    S.lastEx = ex.id; OM.save();
    var list = (c.td || []).concat(c.ex || []), idx = list.indexOf(ex);
    var nextEx = list[idx + 1] || (OM.byCh[ex.ch + 1] && ((OM.byCh[ex.ch + 1].td || []).concat(OM.byCh[ex.ch + 1].ex || []))[0]);
    v.innerHTML = '<div class="stack">' +
      '<div class="view-title"><p class="eyebrow"><a href="#td">TD corrigés</a> · chapitre ' + c.num + (ex.guided ? ' · exemple guidé' : ' · exercice ' + esc(ex.n)) + (ex.opt ? ' · facultatif' : '') + '</p><h1>' + ex.t + '</h1><p class="small muted">' + esc(ex.tags || '') + (ex.src ? ' · ' + esc(ex.src) : '') + '</p></div>' +
      '<div class="copie"><details open><summary>Énoncé</summary><div class="body prose">' + ex.e + '</div></details></div>' +
      '<div class="dots" role="group" aria-label="Questions"></div>' +
      '<div class="known" hidden></div><div class="qslot"></div>' +
      '<div class="navrow"><button class="btn" type="button" data-nav="-1">← Question précédente</button><button class="btn primary" type="button" data-nav="1">Question suivante →</button></div>' +
      '</div>';
    var dots = $('.dots', v), slot = $('.qslot', v), known = $('.known', v);
    function paintDots() {
      dots.innerHTML = ex.q.map(function (q, i) {
        var s = S.prog[ex.id + '.' + i];
        return '<button type="button" data-qi="' + i + '" class="' + (s || '') + '"' + (i === qi ? ' aria-current="step"' : '') + ' aria-label="Question ' + (i + 1) + (s === 'ok' ? ', juste' : s === 'ko' ? ', à revoir' : s === 'seen' ? ', correction vue' : '') + '">' + (i + 1) + '</button>';
      }).join('');
    }
    function show(i, focus) {
      qi = Math.max(0, Math.min(ex.q.length - 1, i));
      paintDots();
      var prev = ex.q.slice(0, qi).filter(function (q) { return q.r; });
      known.hidden = !prev.length;
      known.innerHTML = prev.length ? '<p class="eyebrow">Résultats des questions précédentes</p><ul>' + prev.map(function (q) { return '<li>' + q.r + '</li>'; }).join('') + '</ul>' : '';
      var q = ex.q[qi], key = ex.id + '.' + qi;
      var card = OM.questionCard(q, {
        key: key, mode: 'td', label: 'Question ' + (qi + 1) + ' sur ' + ex.q.length, status: S.prog[key],
        onResult: function (st) { if (S.prog[key] === 'ok' && st !== 'ok') return; S.prog[key] = st; if (st === 'ko') S.err['td:' + key] = { td: key, t: Date.now() }; if (st === 'ok') delete S.err['td:' + key]; OM.save(); paintDots(); }
      });
      slot.innerHTML = ''; slot.appendChild(card);
      $('[data-nav="-1"]', v).disabled = qi === 0;
      var nb = $('[data-nav="1"]', v);
      if (qi === ex.q.length - 1) { nb.textContent = nextEx ? 'Exercice suivant →' : 'Retour aux TD'; nb.dataset.next = nextEx ? nextEx.id : ''; }
      else { nb.textContent = 'Question suivante →'; delete nb.dataset.next; }
      if (focus) { var inp = $('input', card); if (inp && window.matchMedia('(min-width: 900px)').matches) inp.focus(); card.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }
    dots.addEventListener('click', function (e) { var b = e.target.closest('[data-qi]'); if (b) show(+b.dataset.qi, true); });
    $$('[data-nav]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.next !== undefined) { if (b.dataset.next) OM.go('td-' + b.dataset.next); else OM.go('td'); return; }
        show(qi + (+b.dataset.nav), true);
      });
    });
    show(qi, false);
    OM._keepScroll = false;
  }
  OM.exerciseView = exerciseView;

  /* ================= ENTRAÎNEMENT ================= */
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rndApi(seed) {
    var r = mulberry(seed);
    return {
      r: r,
      int: function (a, b) { return a + Math.floor(r() * (b - a + 1)); },
      pick: function (arr) { return arr[Math.floor(r() * arr.length)]; },
      step: function (a, b, s) { var n = Math.round((b - a) / s); return +(a + Math.floor(r() * (n + 1)) * s).toFixed(6); },
      shuffle: function (arr) { arr = arr.slice(); for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
    };
  }
  OM.rndApi = rndApi;
  function makeItem(gid, seed) {
    var g = OM.genById[gid]; if (!g) return null;
    var it = g.make(rndApi(seed)); it.gid = gid; it.seed = seed; it.ch = g.ch; it.title = g.t; return it;
  }
  function buildSession(mode, ch, n) {
    var items = [];
    if (mode === 'err') {
      Object.keys(S.err).forEach(function (k) { var e = S.err[k]; if (e.gid && (!ch || OM.genById[e.gid] && ch.indexOf(OM.genById[e.gid].ch) >= 0)) items.push(makeItem(e.gid, e.seed)); });
      Object.keys(S.err).forEach(function (k) {
        var e = S.err[k]; if (!e.td) return;
        var parts = e.td.split('.'), ex = OM.exos[parts[0]]; if (!ex || (ch && ch.indexOf(ex.ch) < 0)) return;
        var q = ex.q[+parts[1]]; if (!q) return;
        var it = Object.assign({}, q); it.q = '<p class="small muted">' + ex.t + ' (TD ' + OM.byCh[ex.ch].num + ', exercice ' + ex.n + ')</p><div class="copie" style="margin:6px 0 10px"><div class="prose">' + ex.e + '</div></div>' +
          (ex.q.slice(0, +parts[1]).filter(function (x) { return x.r; }).length ? '<div class="known"><p class="eyebrow">Résultats des questions précédentes</p><ul>' + ex.q.slice(0, +parts[1]).filter(function (x) { return x.r; }).map(function (x) { return '<li>' + x.r + '</li>'; }).join('') + '</ul></div>' : '') + q.q;
        it.tdKey = e.td; it.ch = ex.ch; it.title = 'TD ' + OM.byCh[ex.ch].num + ' · ex. ' + ex.n; items.push(it);
      });
      return items.filter(Boolean);
    }
    var pool = OM.gens.filter(function (g) { return !ch || ch.indexOf(g.ch) >= 0; });
    var weighted = [];
    pool.forEach(function (g) { var st = S.gs[g.id], w = g.mcq ? 1 : 3; if (st && st[1]) w += Math.round(4 * (1 - st[0] / st[1])); for (var i = 0; i < w; i++) weighted.push(g.id); });
    var used = {};
    for (var k = 0; k < n * 6 && items.length < n; k++) {
      var gid = weighted[Math.floor(Math.random() * weighted.length)];
      if (used[gid] && Object.keys(used).length < pool.length) continue;
      used[gid] = 1;
      items.push(makeItem(gid, Math.floor(Math.random() * 1e9)));
    }
    return items;
  }
  OM.route('quiz', function (v) {
    var ch = S.quizCh === 'all' || S.quizCh == null ? null : String(S.quizCh).split(',').map(Number);
    var nErr = Object.keys(S.err).length;
    if (OM.quickStart) { OM.quickStart = false; return runQuiz(v, buildSession('mix', ch, 8), 'Séance de 15 min'); }
    if (OM.flashStart) { OM.flashStart = false; return runFlash(v, ch); }
    var html = '<div class="view-title"><p class="eyebrow">Questions générées, nouvelles valeurs à chaque fois</p><h1>Entraînement</h1><p class="muted">Chaque question donne toutes ses données. Les compétences que tu rates reviennent plus souvent.</p></div><div class="stack">';
    html += '<div class="card flat stack"><h3>Chapitres</h3><div class="seg" role="group" aria-label="Chapitres"><button type="button" data-ch="all" aria-pressed="' + (S.quizCh === 'all') + '">Tous</button><button type="button" data-ch="1,2" aria-pressed="' + (String(S.quizCh) === '1,2') + '">I + II (interro)</button>' +
      OM.chapters.map(function (c) { return '<button type="button" data-ch="' + c.id + '" aria-pressed="' + (String(S.quizCh) === String(c.id)) + '">' + c.num + ' · ' + esc(c.short) + '</button>'; }).join('') + '</div>' +
      '<div class="grid2"><button class="btn primary" type="button" data-go="10">Série de 10 questions</button><button class="btn soft" type="button" data-go="err"' + (nErr ? '' : ' disabled') + '>Mes erreurs (' + nErr + ')</button><button class="btn" type="button" data-go="flash">Cartes mémoire</button></div></div>';
    html += '<a class="card flat chapcard" href="#examen"><span class="eyebrow">1 h 50 · tous chapitres</span><b>Examen blanc</b><span class="small muted">Un sujet de DE complet, chronométré, avec la correction et la note à la fin.</span></a>';
    html += '<section class="card flat stack"><h3>Compétences travaillées</h3><div class="tw"><table class="t"><tr><th class="l">Compétence</th><th>Ch.</th><th>Réussite</th></tr>' +
      OM.gens.filter(function (g) { return !g.mcq && (!ch || ch.indexOf(g.ch) >= 0); }).map(function (g) { var st = S.gs[g.id]; return '<tr><td class="l">' + esc(g.t) + '</td><td>' + OM.byCh[g.ch].num + '</td><td class="num">' + (st ? st[0] + ' / ' + st[1] : '—') + '</td></tr>'; }).join('') + '</table></div></section>';
    v.innerHTML = html + '</div>';
    $$('[data-ch]', v).forEach(function (b) { b.addEventListener('click', function () { S.quizCh = b.dataset.ch; OM.save(); OM.render(); }); });
    $$('[data-go]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.go === 'err') runQuiz(v, buildSession('err', ch), 'Mes erreurs');
        else if (b.dataset.go === 'flash') runFlash(v, ch);
        else runQuiz(v, buildSession('mix', ch, +b.dataset.go), 'Série de ' + b.dataset.go + ' questions');
      });
    });
  });
  function runQuiz(v, items, title) {
    var i = 0, score = 0, results = [];
    if (!items.length) { v.innerHTML = '<div class="card stack"><h2>Rien à revoir</h2><p class="muted">Ta liste d\'erreurs est vide. Lance une série pour en trouver de nouvelles.</p><a class="btn primary" href="#quiz">Retour</a></div>'; return; }
    function step() {
      if (i >= items.length) return end();
      var it = items[i], first = null;
      v.innerHTML = '<div class="stack"><div class="row"><p class="eyebrow" style="flex:1">' + esc(title) + ' · ' + (i + 1) + ' / ' + items.length + '</p><span class="chip">' + score + ' juste' + (score > 1 ? 's' : '') + '</span></div>' +
        '<div class="progress"><i style="width:' + Math.round(i / items.length * 100) + '%"></i></div><div class="qslot"></div>' +
        '<div class="navrow"><a class="btn" href="#quiz">Arrêter</a><button class="btn primary" type="button" data-next>' + (i === items.length - 1 ? 'Voir le bilan' : 'Question suivante →') + '</button></div></div>';
      var card = OM.questionCard(it, {
        key: 'quiz' + i, mode: 'quiz', label: 'Chapitre ' + OM.byCh[it.ch].num + ' · ' + esc(it.title),
        onResult: function (st) {
          if (first === null && (st === 'ok' || st === 'ko' || st === 'seen')) {
            first = st;
            var good = st === 'ok';
            if (good) score++;
            results.push(good);
            if (it.gid) { var gs = S.gs[it.gid] || [0, 0]; gs[1]++; if (good) gs[0]++; S.gs[it.gid] = gs; }
            var key = it.gid ? it.gid + ':' + it.seed : 'td:' + it.tdKey;
            if (good) delete S.err[key];
            else S.err[key] = it.gid ? { gid: it.gid, seed: it.seed, t: Date.now() } : { td: it.tdKey, t: Date.now() };
            OM.save();
            $('.chip', v).textContent = score + ' juste' + (score > 1 ? 's' : '');
          } else if (first !== 'ok' && st === 'ok' && it.tdKey) { /* corrected later: keep in errors until right first time */ }
        }
      });
      $('.qslot', v).appendChild(card);
      $('[data-next]', v).addEventListener('click', function () {
        if (first === null) { results.push(false); first = 'skip'; }
        i++; step(); window.scrollTo(0, 0);
      });
    }
    function end() {
      var nErr = Object.keys(S.err).length;
      v.innerHTML = '<div class="card stack"><p class="eyebrow">' + esc(title) + '</p><p class="score">' + score + ' / ' + items.length + '</p>' +
        '<p class="muted">' + (score === items.length ? 'Tout juste.' : 'Les questions ratées sont dans « Mes erreurs » (' + nErr + ' en tout). Elles reviennent avec d\'autres valeurs.') + '</p>' +
        '<div class="grid2"><a class="btn primary" href="#quiz">Nouvelle série</a><a class="btn" href="#accueil">Accueil</a></div></div>';
    }
    step();
  }

  /* ================= CARTES MÉMOIRE ================= */
  var FLASH = [
    [1, 'Contraire de A', 'P(Ā) = 1 − P(A)'], [1, 'P(A ∪ B)', 'P(A) + P(B) − P(A ∩ B)'], [1, 'A et B indépendants', 'P(A ∩ B) = P(A) × P(B)'],
    [1, 'Probabilités totales : P(B)', 'P(A)P<sub>A</sub>(B) + P(Ā)P<sub>Ā</sub>(B)'], [1, 'Bayes : P<sub>B</sub>(A)', 'P(A) × P<sub>A</sub>(B) / P(B)'],
    [2, 'Variance d\'une série', 'moyenne des carrés − carré de la moyenne'], [2, 'Médiane avec des classes', 'borne inf + (N/2 − cumulé avant)/effectif × amplitude'],
    [2, 'Droite des moindres carrés', 'a = Cov(x, y)/V(x) ; b = ȳ − a x̄'], [2, 'Coefficient de corrélation r', 'Cov/(σ<sub>x</sub>σ<sub>y</sub>), entre −1 et 1'],
    [2, 'z = ln y = ax + b, donc y = ?', 'y = e<sup>b</sup> × e<sup>ax</sup>'], [2, 'Hauteur d\'un rectangle d\'histogramme', 'effectif / amplitude'],
    [3, 'V(aX + b)', 'a² V(X)'], [3, 'Binomiale : E et V', 'E = np ; V = np(1 − p)'], [3, 'Poisson : P(X = k)', 'e<sup>−λ</sup> λ<sup>k</sup>/k! ; E = V = λ'],
    [3, 'Approximation par Poisson : conditions', 'n ≥ 30, p ≤ 0,1, np &lt; 15 ; λ = np'], [3, 'Approximation par la normale : conditions', 'n ≥ 30, np &gt; 5, np(1 − p) &gt; 5 ; m = np, σ = √(np(1 − p))'],
    [3, 'Centrer-réduire', 't = (x − m)/σ puis π(t) dans la table'], [3, 'π(−t)', '1 − π(t)'], [3, 'a tel que P(m − a ≤ X ≤ m + a) = 0,95', 'a = 1,96 σ'],
    [3, 'Exponentielle : R(t) et MTBF', 'R(t) = e<sup>−λt</sup> ; MTBF = 1/λ'], [3, 'Uniforme U[a ; b] : E et V', '(a + b)/2 et (b − a)²/12'],
    [4, 'Écart-type corrigé σ̂', '√(n/(n − 1)) × σ observé'], [4, 'IC d\'une moyenne, σ connu', 'x̄ ± z σ/√n ; z = 1,96 à 95 %'], [4, 'IC d\'une proportion', 'f ± z √(f(1 − f)/n)'],
    [4, 'Khi-deux : statistique et décision', 'χ² = Σ(O − E)²/E ; on rejette H<sub>0</sub> si χ² &gt; valeur critique'], [4, 'Effectif attendu (indépendance)', 'total ligne × total colonne / total général'],
    [4, 'Degrés de liberté', 'ajustement : k − 1 ; tableau r × c : (r − 1)(c − 1)'],
    [5, 'Déterminant 2 × 2', 'ad − bc'], [5, 'Valeurs propres', 'racines de Det(A − λI) = 0'], [5, 'Trace et déterminant', 'Tr = somme des λ ; Det = produit des λ'],
    [5, 'A diagonalisable si…', 'n valeurs propres distinctes, ou dim de chaque sous-espace propre = multiplicité']
  ];
  function runFlash(v, ch) {
    var deck = rndApi(Date.now() % 1e9).shuffle(FLASH.filter(function (c) { return !ch || ch.indexOf(c[0]) >= 0; }));
    var i = 0, ok = 0, again = [];
    function show() {
      if (i >= deck.length) {
        if (again.length) { deck = again; again = []; i = 0; return show(); }
        v.innerHTML = '<div class="card stack"><p class="eyebrow">Cartes mémoire</p><p class="score">' + ok + ' sues du premier coup</p><p class="muted">Les cartes ratées sont repassées jusqu\'à ce que tu les saches.</p><div class="grid2"><a class="btn primary" href="#quiz">Retour</a><a class="btn" href="#express">Fiche express</a></div></div>';
        return;
      }
      var c = deck[i];
      v.innerHTML = '<div class="stack"><p class="eyebrow">Cartes mémoire · ' + (i + 1) + ' / ' + deck.length + ' · chapitre ' + OM.byCh[c[0]].num + '</p>' +
        '<div class="card stack flash"><p class="flash-q">' + c[1] + '</p><p class="flash-a" hidden>' + c[2] + '</p><p class="small muted flash-h">Dis la réponse dans ta tête, puis retourne la carte.</p></div>' +
        '<div class="grid2 act"><button class="btn primary" type="button" data-flip>Retourner la carte</button></div></div>';
      $('[data-flip]', v).addEventListener('click', function () {
        $('.flash-a', v).hidden = false; $('.flash-h', v).hidden = true;
        $('.act', v).innerHTML = '<button class="btn primary" type="button" data-r="ok">Je savais</button><button class="btn" type="button" data-r="ko">À revoir</button>';
        $$('[data-r]', v).forEach(function (b) { b.addEventListener('click', function () { if (b.dataset.r === 'ok') { if (!c.seen) ok++; } else { c.seen = true; again.push(c); } i++; show(); }); });
      });
    }
    show();
  }

  /* ================= MINUTEUR DE TRAVAIL ================= */
  var BREAK_IDEAS = ['Lève-toi et marche dans la pièce.', 'Bois un grand verre d\'eau.', 'Étire les bras, le dos et la nuque.', 'Regarde au loin par la fenêtre.', 'Fais 10 squats ou monte un étage à pied.', 'Respire lentement : 4 secondes, puis 6 secondes.'];
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function sprintUi() {
    var b = document.getElementById('sprintBtn'), ov = document.getElementById('breakOv'), st = S.sprint, now = Date.now();
    if (!b) return;
    if (!st) { b.textContent = '15 min'; b.setAttribute('aria-label', 'Lancer 15 minutes de travail'); if (ov) ov.hidden = true; return; }
    if (st.phase === 'work') {
      if (now >= st.end) { S.sprint = { phase: 'break', end: now + 3 * 60000, idea: BREAK_IDEAS[Math.floor(Math.random() * BREAK_IDEAS.length)] }; OM.save(); return sprintUi(); }
      b.textContent = mmss(st.end - now); b.setAttribute('aria-label', 'Arrêter le minuteur'); if (ov) ov.hidden = true;
    } else {
      b.textContent = 'pause';
      if (ov) {
        ov.hidden = false;
        var done = now >= st.end;
        $('#breakTitle').textContent = done ? 'C\'est reparti' : st.idea;
        $('#breakTime').textContent = mmss(st.end - now);
        $('#breakGo').textContent = done ? 'Nouveau bloc de 15 min' : 'Reprendre maintenant';
      }
    }
  }
  OM.sprintInit = function () {
    var b = document.getElementById('sprintBtn');
    if (!b) return;
    b.addEventListener('click', function () {
      if (S.sprint && S.sprint.phase === 'work') { S.sprint = null; OM.save(); OM.ui.toast('Minuteur arrêté'); }
      else { S.sprint = { phase: 'work', end: Date.now() + 15 * 60000 }; OM.save(); OM.ui.toast('15 minutes de travail : c\'est parti'); }
      sprintUi();
    });
    $('#breakGo').addEventListener('click', function () { S.sprint = { phase: 'work', end: Date.now() + 15 * 60000 }; OM.save(); sprintUi(); });
    $('#breakStop').addEventListener('click', function () { S.sprint = null; OM.save(); sprintUi(); });
    setInterval(function () { if (!document.hidden) sprintUi(); }, 1000);
    sprintUi();
  };

  /* ================= EXAMEN BLANC ================= */
  OM.route('examen', function (v, args) {
    S.exams = S.exams || {};
    if (S.exam && !S.exams.de) { S.exams.de = S.exam; S.exam = null; OM.save(); }
    var id = args[0];
    if (!id || !OM.exams[id]) {
      var html = '<div class="view-title"><p class="eyebrow">Dans les conditions de l\'épreuve</p><h1>Examens blancs</h1><p class="muted">Chronométrés, sans indice ni correction pendant l\'épreuve. Note et correction détaillée à la fin.</p></div><div class="stack">';
      ['interro', 'de'].forEach(function (k) {
        var X = OM.exams[k], st = S.exams[k];
        html += '<a class="card flat chapcard" href="#examen-' + k + '"><span class="eyebrow">' + X.duration + ' min · ' + examTotal(X) + ' points · ' + esc(X.scope) + '</span><b>' + esc(X.title) + '</b><span class="small muted">' + esc(X.blurb) + (st && st.done ? ' Dernière note : ' + fr(st.score, 1) + ' / ' + examTotal(X) + '.' : st ? ' En cours.' : '') + '</span></a>';
      });
      v.innerHTML = html + '</div>';
      return;
    }
    var X = OM.exams[id], st = S.exams[id];
    if (!st || st.done && !OM.examShowResult) return examIntro(v, X, st);
    if (st.done) return examResult(v, X, st);
    examRun(v, X, st);
  });
  function examTotal(X) { var t = 0; X.parts.forEach(function (p) { p.q.forEach(function (q) { t += q.pts || 1; }); }); return t; }
  function examIntro(v, X, st) {
    var html = '<div class="view-title"><p class="eyebrow"><a href="#examen">Examens blancs</a> · ' + X.duration + ' minutes · ' + examTotal(X) + ' points</p><h1>' + esc(X.title) + '</h1><p class="muted">' + X.intro + '</p></div><div class="stack">';
    html += '<div class="card flat stack"><h3>Au programme</h3><ul class="prose">' + X.parts.map(function (p) { return '<li>' + p.h + '</li>'; }).join('') + '</ul>' +
      '<p class="small muted">Pas d\'indice ni de correction pendant l\'épreuve. Tu peux ouvrir l\'onglet Tables : le jour J, renseigne-toi pour savoir si elles sont fournies.</p>' +
      '<button class="btn primary block" type="button" data-start>Commencer (' + X.duration + ' min)</button></div>';
    if (st && st.done) html += '<div class="card flat stack"><h3>Dernière tentative</h3><p class="score">' + fr(st.score, 1) + ' / ' + examTotal(X) + '</p><button class="btn" type="button" data-see>Revoir la correction</button></div>';
    v.innerHTML = html + '</div>';
    $('[data-start]', v).addEventListener('click', function () { S.exams[X.id] = { start: Date.now(), ans: {}, done: false }; OM.save(); OM.render(); });
    var see = $('[data-see]', v); if (see) see.addEventListener('click', function () { OM.examShowResult = true; OM.render(); OM.examShowResult = false; });
  }
  function examRun(v, X, st) {
    var end = st.start + X.duration * 60000;
    var html = '<div class="stack"><div class="card flat row sticky-sub"><span class="timer" aria-live="off"></span><span class="spacer" style="flex:1"></span><button class="btn sm primary" type="button" data-submit>Rendre ma copie</button></div>';
    X.parts.forEach(function (p, pi) {
      html += '<section class="stack"><h2>' + p.h + '</h2><div class="copie"><div class="prose">' + p.e + '</div></div><div class="card flat stack">';
      p.q.forEach(function (q, qi) {
        var k = pi + '.' + qi, type = OM.qType(q), val = st.ans[k];
        html += '<div class="examq"><p class="eyebrow">Question ' + (qi + 1) + ' · ' + (q.pts || 1) + ' pt' + ((q.pts || 1) > 1 ? 's' : '') + '</p><div class="prose">' + q.q + '</div>';
        if (type === 'num') {
          var a = Array.isArray(q.a) ? q.a : [q.a];
          html += '<div class="answer">' + a.map(function (_, i) { var id = 'ex-' + pi + '-' + qi + '-' + i; return '<label for="' + id + '"><span>' + ((q.l && q.l[i]) || 'Ta réponse') + (q.u ? ' (' + q.u + ')' : '') + '</span><input id="' + id + '" data-k="' + k + '" data-i="' + i + '" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="nombre ou calcul" value="' + esc((val && val[i]) || '') + '"><span class="prev" aria-live="polite"></span></label>'; }).join('') + '</div>' + OM.keysHtml();
        } else if (type === 'choice') {
          html += '<div class="choices">' + q.c.map(function (c, i) { return '<button type="button" data-k="' + k + '" data-c="' + i + '" class="' + (val === i ? 'right' : '') + '">' + c + '</button>'; }).join('') + '</div>';
        } else html += '<p class="small muted">Rédige sur ta feuille. Tu t\'auto-évalueras avec la correction.</p>';
        html += '</div>';
      });
      html += '</div></section>';
    });
    v.innerHTML = html + '<button class="btn primary block" type="button" data-submit>Rendre ma copie</button></div>';
    var timer = $('.timer', v);
    function tick() {
      var left = Math.max(0, end - Date.now()), m = Math.floor(left / 60000), s = Math.floor(left % 60000 / 1000);
      timer.textContent = (left ? 'Reste ' + m + ' min ' + String(s).padStart(2, '0') : 'Temps écoulé : rends ta copie');
      if (!document.body.contains(timer)) clearInterval(iv);
    }
    var iv = setInterval(tick, 1000); tick();
    $$('.examq', v).forEach(function (q) { if ($('input', q)) OM.wireKeys(q); });
    function store(inp) { var a = st.ans[inp.dataset.k] || []; a[+inp.dataset.i] = inp.value; st.ans[inp.dataset.k] = a; OM.save(); }
    $$('input[data-k]', v).forEach(function (inp) { inp.addEventListener('input', function () { store(inp); }); });
    $$('.examq .keys button', v).forEach(function (b) { b.addEventListener('click', function () { var inp = b.closest('.examq').querySelector('input:focus') || document.activeElement; if (inp && inp.dataset && inp.dataset.k) store(inp); }); });
    $$('button[data-c]', v).forEach(function (b) { b.addEventListener('click', function () { st.ans[b.dataset.k] = +b.dataset.c; OM.save(); $$('button[data-k="' + b.dataset.k + '"]', v).forEach(function (x) { x.classList.toggle('right', x === b); }); }); });
    $$('[data-submit]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.confirm !== '1') { b.dataset.confirm = '1'; b.textContent = 'Confirmer : rendre la copie'; setTimeout(function () { b.dataset.confirm = ''; b.textContent = 'Rendre ma copie'; }, 4000); return; }
        clearInterval(iv); st.done = true; st.end = Date.now(); st.self = {}; grade(X, st); OM.save(); OM.examShowResult = true; OM.render(); OM.examShowResult = false;
      });
    });
  }
  function grade(X, st) {
    var score = 0;
    X.parts.forEach(function (p, pi) {
      p.q.forEach(function (q, qi) {
        var k = pi + '.' + qi, type = OM.qType(q), pts = q.pts || 1, ok = false;
        if (type === 'num') ok = OM.check.checkQ(q, st.ans[k] || []) === true;
        else if (type === 'choice') ok = st.ans[k] === q.a;
        else ok = st.self && st.self[k] === 'ok';
        if (ok) score += pts;
      });
    });
    st.score = score;
  }
  function examResult(v, X, st) {
    grade(X, st);
    var mins = Math.round(((st.end || Date.now()) - st.start) / 60000);
    var html = '<div class="stack"><div class="card stack"><p class="eyebrow">Examen blanc · rendu en ' + mins + ' min</p><p class="score" data-score>' + fr(st.score, 1) + ' / ' + examTotal(X) + '</p><p class="muted small">Les questions « sur ta feuille » comptent quand tu les marques justes après avoir lu la correction.</p>' +
      '<div class="grid2"><button class="btn" type="button" data-retry>Recommencer</button><a class="btn" href="#quiz">Entraînement</a></div></div>';
    X.parts.forEach(function (p, pi) {
      html += '<section class="stack"><h2>' + p.h + '</h2><details class="copie"><summary>Énoncé</summary><div class="body prose">' + p.e + '</div></details><div class="card flat stack">';
      p.q.forEach(function (q, qi) {
        var k = pi + '.' + qi, type = OM.qType(q), pts = q.pts || 1, ok, given = st.ans[k];
        if (type === 'num') ok = OM.check.checkQ(q, given || []) === true;
        else if (type === 'choice') ok = given === q.a;
        else ok = st.self[k] === 'ok';
        html += '<div class="examq"><p class="eyebrow">Question ' + (qi + 1) + ' · ' + pts + ' pt' + (pts > 1 ? 's' : '') + '</p><div class="prose">' + q.q + '</div>';
        if (type === 'num') html += '<p>Ta réponse : <span class="mono">' + esc((given || []).join(' ; ') || '—') + '</span> · <span class="' + (ok ? 'pill-ok' : 'pill-ko') + '">' + (ok ? 'juste' : 'faux') + '</span></p>';
        if (type === 'choice') html += '<p>Ta réponse : ' + (given != null ? q.c[given] : '—') + ' · <span class="' + (ok ? 'pill-ok' : 'pill-ko') + '">' + (ok ? 'juste' : 'faux') + '</span></p>';
        html += '<div class="sol"><ol>' + (q.sol || []).map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol>' + (q.fig || '') + (type !== 'paper' ? '<p class="ans">Réponse : ' + OM.fmtAns(q) + '</p>' : '') + '</div>';
        if (type === 'paper') html += '<div class="row"><span class="small muted">Sur ta feuille :</span><button class="btn sm" type="button" data-self="' + k + '" data-v="ok"' + (st.self[k] === 'ok' ? ' aria-pressed="true"' : '') + '>Juste</button><button class="btn sm" type="button" data-self="' + k + '" data-v="ko">À revoir</button></div>';
        html += '</div>';
      });
      html += '</div></section>';
    });
    v.innerHTML = html + '</div>';
    $$('[data-self]', v).forEach(function (b) { b.addEventListener('click', function () { st.self[b.dataset.self] = b.dataset.v; grade(X, st); OM.save(); $('[data-score]', v).textContent = fr(st.score, 1) + ' / ' + examTotal(X); OM.ui.toast(b.dataset.v === 'ok' ? 'Point compté' : 'Noté à revoir'); }); });
    $('[data-retry]', v).addEventListener('click', function () { S.exams[X.id] = null; OM.save(); OM.render(); });
  }
})();
