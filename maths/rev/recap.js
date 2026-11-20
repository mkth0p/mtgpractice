/* Fiche récap du contrôle : chapitres III et IV, tout ce qu'il faut savoir et savoir faire, sur une page. */
(function () {
  var S = OM.S, H = OM.h, tbl = H.tbl;
  var XB = 'x̄';

  function sec(id, h, body) { return '<section class="card flat stack rc" id="' + id + '"><h2>' + h + '</h2>' + body + '</section>'; }
  function dl(rows) { return '<dl class="formulas">' + rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>'; }
  function steps(h, list) { return '<div class="method"><h3>' + h + '</h3><ol>' + list.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>'; }

  /* savoir-faire : cochable, lien vers la leçon qui l'entraîne */
  var CAN = [
    ['zero-1', 'Écrire la loi d\'une variable discrète (tableau, somme = 1)'],
    ['zero-1', 'Calculer E(X), E(X²), V(X), σ ; utiliser E(aX + b) et V(aX + b)'],
    ['zero-2', 'Écrire la fonction de répartition F en escalier ; P(X ≥ t) = 1 − P(X ≤ t − 1)'],
    ['zero-3', 'Reconnaître une binomiale (3 justifications) et calculer P(X = k), P(X ≥ 1)'],
    ['zero-4', 'Calculer avec Poisson, adapter λ à la durée'],
    ['zero-5', 'Loi géométrique : rang du premier succès'],
    ['zero-6', 'Loi uniforme : longueur / longueur totale, E, V'],
    ['zero-7', 'Exponentielle : λ = 1/MTBF, fiabilité e<sup>−λt</sup>, durée t = −ln(r)/λ'],
    ['zero-8', 'Loi normale : centrer-réduire, lire π(t), symétrie'],
    ['zero-9', 'Justifier une approximation (Poisson ou normale) avec les conditions chiffrées'],
    ['zero-10', 'Estimer m, p et σ̂ (n − 1) à partir d\'un échantillon'],
    ['zero-11', 'Intervalle de confiance d\'une moyenne (z ou Student) + taille d\'échantillon'],
    ['zero-12', 'Intervalle de confiance d\'une proportion + conclure (valeur dans l\'IC ou pas)'],
    ['zero-13', 'Test : H<sub>0</sub>/H<sub>1</sub>, zone d\'acceptation, décision, phrase'],
    ['zero-14', 'Khi-deux d\'ajustement (TD ex. 11, 14)'],
    ['zero-15', 'Khi-deux d\'indépendance (TD ex. 12, 13)']
  ];

  OM.route('recap', function (v) {
    var html = '<div class="view-title"><p class="eyebrow">Contrôle · chapitres III et IV</p><h1>Fiche récap</h1><p class="muted">Tout ce qu\'il faut savoir et savoir faire, sur une page. Coche ce que tu sais faire ; chaque ligne mène à la leçon qui l\'entraîne.</p></div>';
    html += '<nav class="toc" aria-label="Plan de la fiche"><a href="#recap" data-jump="rc-can">Savoir-faire</a><a href="#recap" data-jump="rc-loi">Quelle loi ?</a><a href="#recap" data-jump="rc-va">Variables aléatoires</a><a href="#recap" data-jump="rc-lois">Lois</a><a href="#recap" data-jump="rc-norm">Normale</a><a href="#recap" data-jump="rc-est">Estimation</a><a href="#recap" data-jump="rc-ic">IC</a><a href="#recap" data-jump="rc-test">Tests</a><a href="#recap" data-jump="rc-chi">Khi-deux</a><a href="#recap" data-jump="rc-val">Valeurs à connaître</a><a href="#recap" data-jump="rc-pie">Pièges</a></nav><div class="stack-lg" style="margin-top:16px">';

    /* 1. savoir-faire */
    html += sec('rc-can', 'Ce que tu dois savoir faire', '<ul class="items" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px">' + CAN.map(function (c, i) {
      var id = 'rc-' + i;
      return '<li class="check"><input type="checkbox" id="' + id + '" data-rc="' + i + '"' + (S.plan['rc-' + i] ? ' checked' : '') + '><label for="' + id + '"><a href="#' + c[0] + '">' + c[1] + '</a></label></li>';
    }).join('') + '</ul><p class="small muted rc-count"></p>');

    /* 2. quelle loi */
    html += sec('rc-loi', 'Quelle loi ? Lis l\'énoncé et repère…', tbl([
      ['Dans l\'énoncé', 'Loi', 'Paramètres'],
      ['Une seule épreuve, succès / échec', 'Bernoulli ℬ(p)', 'p'],
      ['n épreuves identiques et indépendantes, on <b>compte</b> les succès', 'Binomiale ℬ(n, p)', 'n, p'],
      ['Événements <b>rares</b> par durée / zone, « en moyenne λ par… »', 'Poisson 𝒫(λ)', 'λ = moyenne'],
      ['On répète <b>jusqu\'au premier</b> succès, X = rang', 'Géométrique 𝒢(p)', 'p'],
      ['Valeur « au hasard » entre a et b, rien de préféré', 'Uniforme 𝒰[a ; b]', 'a, b'],
      ['<b>Durée de vie</b>, MTBF, fiabilité, temps d\'attente', 'Exponentielle ℰ(λ)', 'λ = 1/MTBF'],
      ['Mesure continue, « cloche », moyenne m et écart-type σ donnés', 'Normale N(m ; σ²)', 'm, σ']
    ]) + '<p class="small">Sur ta copie, écris toujours d\'abord « X suit la loi … de paramètres … » avec la justification.</p>');

    /* 3. VA */
    html += sec('rc-va', 'III · Variable aléatoire', dl([
      ['Loi', 'tableau x<sub>i</sub> → p<sub>i</sub> = P(X = x<sub>i</sub>), avec Σp<sub>i</sub> = 1'],
      ['Espérance', 'E(X) = Σ x<sub>i</sub>p<sub>i</sub> (moyenne à long terme)'],
      ['Variance', 'V(X) = E(X²) − E(X)², avec E(X²) = Σ x<sub>i</sub>²p<sub>i</sub> ; σ = √V'],
      ['Affine', 'E(aX + b) = aE(X) + b ; V(aX + b) = a²V(X)'],
      ['Somme', 'E(X + Y) = E(X) + E(Y) ; V(X + Y) = V(X) + V(Y) si indépendantes'],
      ['Répartition', 'F(x) = P(X ≤ x) ; P(a &lt; X ≤ b) = F(b) − F(a) ; P(X &gt; x) = 1 − F(x)'],
      ['Discret', 'P(X ≥ t) = 1 − P(X ≤ t − 1)'],
      ['Continu', 'densité f, probabilité = aire ; P(X = a) = 0, donc ≤ et &lt; c\'est pareil']
    ]));

    /* 4. lois */
    html += sec('rc-lois', 'III · Les lois usuelles', tbl([
      ['Loi', 'P(X = k) ou probabilité', 'E(X)', 'V(X)'],
      ['ℬ(p)', 'P(1) = p ; P(0) = 1 − p', 'p', 'p(1 − p)'],
      ['ℬ(n, p)', 'C(n;k) p<sup>k</sup>(1 − p)<sup>n−k</sup>', 'np', 'np(1 − p)'],
      ['𝒫(λ)', 'e<sup>−λ</sup> λ<sup>k</sup>/k!', 'λ', 'λ'],
      ['𝒢(p)', '(1 − p)<sup>k−1</sup>p ; P(X ≤ k) = 1 − (1 − p)<sup>k</sup>', '1/p', '(1 − p)/p²'],
      ['𝒰[a ; b]', '(x<sub>2</sub> − x<sub>1</sub>)/(b − a)', '(a + b)/2', '(b − a)²/12'],
      ['ℰ(λ)', 'P(T &gt; t) = e<sup>−λt</sup> ; P(T ≤ t) = 1 − e<sup>−λt</sup>', '1/λ', '1/λ²']
    ]) + dl([
      ['« Au moins un »', '1 − P(X = 0)'],
      ['Fiabilité r', 'durée t = −ln(r)/λ'],
      ['Sans mémoire', 'P<sub>T &gt; s</sub>(T &gt; s + t) = P(T &gt; t)'],
      ['ℬ → Poisson', 'n ≥ 30, p ≤ 0,1, np &lt; 15 : λ = np'],
      ['ℬ → normale', 'n ≥ 30, np &gt; 5, n(1 − p) &gt; 5 : m = np, σ = √(np(1 − p))']
    ]));

    /* 5. normale */
    html += sec('rc-norm', 'III · Loi normale en 4 lignes', steps('Méthode', [
      'Écris ce que tu cherches : P(X ≤ a), P(X ≥ a) ou P(a ≤ X ≤ b).',
      'Centre et réduis : t = (x − m)/σ, arrondi à 0,01.',
      'Lis π(|t|) dans la table (onglet Tables).',
      'Applique la bonne règle ci-dessous.'
    ]) + dl([
      ['P(T ≤ t)', 'π(t)'],
      ['P(T ≥ t)', '1 − π(t)'],
      ['t négatif', 'π(−t) = 1 − π(t)'],
      ['Entre a et b', 'π(b) − π(a)'],
      ['Symétrique', 'P(−t ≤ T ≤ t) = 2π(t) − 1'],
      ['Repères', '±σ : 68 % ; ±2σ : 95 % ; ±3σ : 99,7 %']
    ]));

    /* 6. estimation */
    html += sec('rc-est', 'IV · Estimation ponctuelle', dl([
      ['Moyenne', 'm ≈ ' + XB],
      ['Proportion', 'p ≈ f = (nombre de cas)/n'],
      ['Écart-type', 'σ̂ = √(n/(n − 1)) × σ<sub>observé</sub> (divise par n − 1)'],
      ['n ou n − 1 ?', 'décrire un groupe entier : n ; estimer, IC, tests : n − 1'],
      ['Déjà corrigé', '« écart-type estimé » dans l\'énoncé = σ̂ : ne corrige pas deux fois']
    ]));

    /* 7. IC */
    html += sec('rc-ic', 'IV · Intervalles de confiance', dl([
      ['Principe', 'estimation ± marge'],
      ['Moyenne (n ≥ 30)', XB + ' ± z σ/√n'],
      ['Moyenne (petit n, σ inconnu)', XB + ' ± t<sub>n−1 ; α</sub> σ̂/√n (table de Student, α bilatéral)'],
      ['Proportion', 'f ± z √(f(1 − f)/n), si n ≥ 30, nf ≥ 5, n(1 − f) ≥ 5'],
      ['Taille (moyenne)', 'amplitude 2zσ/√n &lt; L ⇔ n &gt; (2zσ/L)², on arrondit au-dessus'],
      ['Taille (proportion)', 'n &gt; (z √(f(1 − f)) / marge voulue)²'],
      ['Conclure', 'valeur clé dans l\'IC : on ne peut pas trancher ; dehors : on conclut'],
      ['Deux groupes', 'IC qui se chevauchent : pas de différence prouvée']
    ]) + '<p class="small">Phrase type : « Avec une confiance de 95 %, la moyenne de la population est comprise entre … et … ».</p>');

    /* 8. tests */
    html += sec('rc-test', 'IV · Tests d\'hypothèses', steps('Les 5 temps', [
      'H<sub>0</sub> : l\'affirmation (m = m<sub>0</sub> ou p = p<sub>0</sub>) ; H<sub>1</sub> : m ≠ m<sub>0</sub> (bilatéral) ou m &lt; / &gt; m<sub>0</sub> (unilatéral).',
      'Choisis z : bilatéral 5 % → 1,96 ; unilatéral 5 % → 1,645 ; bilatéral 10 % → 1,645.',
      'Zone d\'acceptation : m<sub>0</sub> ± z σ/√n, ou p<sub>0</sub> ± z √(p<sub>0</sub>(1 − p<sub>0</sub>)/n). En unilatéral, une seule borne.',
      'Compare ' + XB + ' (ou f) : dans la zone → on ne rejette pas H<sub>0</sub> ; dehors → on rejette H<sub>0</sub>.',
      'Phrase dans le contexte, avec le risque α.'
    ]) + '<p class="small">Ne pas rejeter H<sub>0</sub> ne prouve pas H<sub>0</sub> : on dit « pas assez de preuves ». Rejeter H<sub>0</sub> laisse un risque α de se tromper.</p>');

    /* 9. khi-deux */
    html += sec('rc-chi', 'IV · Khi-deux (TD ex. 11 à 14)', tbl([
      ['', 'Ajustement', 'Indépendance'],
      ['Quand', 'une variable, répartition annoncée', 'tableau à double entrée, deux variables'],
      ['H<sub>0</sub>', 'les données suivent la répartition', 'les deux variables ne sont pas liées'],
      ['E', 'total × proportion attendue', 'total ligne × total colonne / total général'],
      ['ddl', 'k − 1 (k catégories)', '(r − 1)(c − 1)'],
      ['Exemple TD', 'ex. 11 : E = 200, χ² = 52,75, 4 ddl', 'ex. 12 : χ² ≈ 65,01, 3 ddl']
    ]) + steps('Les 7 étapes du poly', [
      'Conditions : au moins 50 valeurs, au moins 5 attendues par case.',
      'Degrés de liberté.',
      'H<sub>0</sub> et H<sub>1</sub>.',
      'Effectifs attendus E.',
      'χ² = Σ (O − E)²/E sur toutes les cases.',
      'Valeur critique dans la table (ddl, α).',
      'χ² &gt; valeur critique → on rejette H<sub>0</sub> ; sinon on ne peut pas la rejeter.'
    ]));

    /* 10. valeurs */
    html += sec('rc-val', 'Valeurs à connaître', tbl([
      ['Confiance', '90 %', '95 %', '99 %'],
      ['z bilatéral', '1,645', '1,96', '2,576']
    ], { side: true }) + tbl([
      ['ddl', '1', '2', '3', '4', '5', '6'],
      ['χ² critique à 5 %', '3,841', '5,991', '7,815', '9,488', '11,07', '12,592']
    ], { side: true }) + dl([
      ['π(1)', '0,8413'], ['π(1,645)', '0,95'], ['π(1,96)', '0,975'], ['π(2)', '0,9772'], ['π(2,576)', '0,995'],
      ['Student 95 %', 't<sub>9</sub> = 2,262 ; t<sub>19</sub> ≈ 2,093 ; t<sub>29</sub> ≈ 2,045 (voir onglet <a href="#tables">Tables</a>)']
    ]));

    /* 11. pièges */
    html += sec('rc-pie', 'Pièges', '<ul class="traps">' + [
      '<b>Discret :</b> P(X ≥ 4) = 1 − P(X ≤ 3), pas 1 − P(X ≤ 4).',
      '<b>Variance :</b> V(aX + b) = a²V(X), le b disparaît.',
      '<b>Exponentielle :</b> P(T ≤ MTBF) = 1 − e<sup>−1</sup> ≈ 0,632, pas 0,5.',
      '<b>Poisson :</b> λ suit la durée ; 2 par mois = 6 par trimestre.',
      '<b>Normale :</b> arrondis t à 0,01 avant de lire la table ; un t négatif passe par 1 − π.',
      '<b>Approximations :</b> écris les conditions avec les nombres.',
      '<b>n ou n − 1 :</b> IC et tests utilisent σ̂ (n − 1).',
      '<b>Unilatéral :</b> à 5 %, z = 1,645 et une seule borne.',
      '<b>Khi-deux :</b> on divise par E, jamais par O ; on compte toutes les cases.',
      '<b>Conclusion :</b> toujours une phrase dans le contexte, avec le risque.'
    ].map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>');

    html += '<div class="navrow"><a class="btn" href="#zero">Leçons « Partir de zéro »</a><a class="btn primary" href="#td-4-11">S\'entraîner : TD IV ex. 11</a></div></div>';
    v.innerHTML = html;

    function count() {
      var n = CAN.filter(function (c, i) { return S.plan['rc-' + i]; }).length;
      v.querySelector('.rc-count').textContent = n + ' / ' + CAN.length + ' savoir-faire cochés.';
    }
    count();
    OM.ui.$$('[data-rc]', v).forEach(function (cb) { cb.addEventListener('change', function () { S.plan['rc-' + cb.dataset.rc] = cb.checked; OM.save(); count(); }); });
    OM.ui.$$('[data-jump]', v).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var t = document.getElementById(a.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }); });
  });
})();
