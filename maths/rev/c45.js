/* Chapitres IV (statistiques inférentielles, poly p. 37–50) et V (statistiques à p variables, poly p. 51–69). */
(function () {
  var H = OM.h, F = H.F, R = H.R, ov = H.ov, tbl = H.tbl, MB = H.MB;
  var XB = 'x̄';
  function mat(rows) {
    return '<span class="m" style="display:inline-flex;align-items:center;gap:2px;vertical-align:middle"><span style="font-size:2.2em;font-weight:300;line-height:1">(</span><span style="display:inline-grid;grid-template-columns:repeat(' + rows[0].length + ',auto);gap:2px 10px;text-align:center;font-family:var(--f-mono);font-size:.92em">' +
      rows.map(function (r) { return r.map(function (c) { return '<span>' + c + '</span>'; }).join(''); }).join('') + '</span><span style="font-size:2.2em;font-weight:300;line-height:1">)</span></span>';
  }
  OM.errata.push('<b>Poly p. 51 :</b> le titre « Chapitre IV – Statistiques à p variables » est le cinquième chapitre ; la page l\'appelle chapitre V.');
  OM.errata.push('<b>Poly p. 63 :</b> A<sub>2</sub> a pour polynôme caractéristique (1 − λ)³ : sa valeur propre triple est 1, pas −1 (la suite du poly utilise bien 1).');
  OM.errata.push('<b>Poly p. 65–66 :</b> (4 ; −1) est vecteur propre de A<sub>1</sub> associé à −3, et (4 ; −2 ; −1) vecteur propre de A<sub>3</sub> associé à −3 (le poly écrit « associé à 3 »).');
  OM.errata.push('<b>Poly p. 50 :</b> l\'exemple du khi-deux d\'indépendance s\'arrête à « Ici, … ». Il est terminé dans le chapitre IV, exemple B : χ² ≈ 6,03 &gt; 5,99.');

  /* ======================= CHAPITRE IV ======================= */
  OM.chapter({
    id: 4, num: 'IV', short: 'Inférence', title: 'Statistiques inférentielles', pages: 'poly p. 37–50', sessions: 'séances 5 à 7',
    summary: 'Estimation ponctuelle (variance corrigée), intervalles de confiance d\'une moyenne et d\'une proportion, tests d\'hypothèses, test du khi-deux.',
    intro: 'Passer d\'un échantillon à la population : estimer, encadrer avec un niveau de confiance, décider avec un risque α.',
    tdNote: 'Pas encore de feuille de TD sur Moodle pour ce chapitre : voici les exemples du poly, complétés, et des exercices types. La page sera mise à jour quand le TD sera publié.',
    cours: [
      { h: 'Estimation ponctuelle', html: `
        <p>La statistique inférentielle tire des conclusions sur une population entière à partir d'un échantillon de n valeurs (x<sub>1</sub>, …, x<sub>n</sub>), en mesurant l'incertitude. Plus l'échantillon est grand et bien choisi, plus l'estimation est proche de la réalité (loi des grands nombres), mais il reste toujours une marge d'erreur.</p>
        <ul><li><strong>Moyenne m inconnue</strong> : on l'estime par la moyenne de l'échantillon, μ̂ = ${XB}.</li>
        <li><strong>Proportion p inconnue</strong> : par la fréquence observée, p̂ = f = n<sub>i</sub>/n.</li></ul>
        <p><strong>Variance</strong> : deux formules.</p>
        <ul><li>Variance observée (non corrigée, biaisée) σ² = ${F('1', 'n')} Σ(x<sub>i</sub> − ${XB})² : pour décrire des données qui forment toute la population étudiée (une classe, un groupe complet).</li>
        <li>Variance corrigée (sans biais) σ̂² = ${F('1', 'n − 1')} Σ(x<sub>i</sub> − ${XB})² : pour estimer la variance d'une population à partir d'un échantillon, et pour les intervalles de confiance et les tests.</li></ul>
        ${MB('σ̂² = ' + F('n', 'n − 1') + ' σ²        σ̂ = ' + R(F('n', 'n − 1')) + ' σ')}
        <p>Diviser par n − 1 (correction de Bessel) compense le fait qu'on utilise ${XB} à la place de la vraie moyenne, ce qui rend la variance calculée un peu trop petite en moyenne. L'écart-type corrigé est un peu plus grand que l'écart-type observé.</p>` },
      { h: 'Intervalles de confiance', html: `
        <p>Un intervalle de confiance au niveau 1 − α est une plage de valeurs calculée sur un échantillon, qui contient le paramètre inconnu avec une probabilité 1 − α ; α est le risque d'erreur. Principe : <strong>estimation ± marge d'erreur</strong>. La marge grandit avec la dispersion et le niveau de confiance, et diminue quand n augmente.</p>
        ${tbl([['Confiance 1 − α', '90 %', '95 %', '99 %'], ['Risque α', '10 %', '5 %', '1 %'], ['z (quantile de N(0 ; 1))', '1,645', '1,96', '2,576']], { side: true })}
        <p><strong>Moyenne, σ connu, n ≥ 30</strong> (loi normale) :</p>${MB('[ ' + XB + ' − z ' + F('σ', '√n') + ' ; ' + XB + ' + z ' + F('σ', '√n') + ' ]')}
        <p><strong>Moyenne, σ inconnu ou petit échantillon</strong> : loi de Student à n − 1 degrés de liberté, avec l'écart-type corrigé σ̂ :</p>${MB('[ ' + XB + ' − t<sub>n−1 ; α</sub> ' + F('σ̂', '√n') + ' ; ' + XB + ' + t<sub>n−1 ; α</sub> ' + F('σ̂', '√n') + ' ]')}
        <p class="small muted">t<sub>n−1 ; α</sub> se lit dans la table de Student (onglet Tables), colonne « risque α en bilatéral ».</p>
        <p><strong>Proportion</strong> (n ≥ 30, nf ≥ 5 et n(1 − f) ≥ 5) :</p>${MB('[ f − z ' + R(F('f(1 − f)', 'n')) + ' ; f + z ' + R(F('f(1 − f)', 'n')) + ' ]')}` },
      { h: 'Tests d\'hypothèses', html: `
        <p>Un test vérifie si une affirmation sur une population (une moyenne, une proportion) est compatible avec un échantillon.</p>
        <ol><li><strong>Hypothèses</strong> : H<sub>0</sub>, l'hypothèse nulle, souvent une égalité (« pas de différence ») ; H<sub>1</sub>, l'alternative (« il y a une différence »).</li>
        <li><strong>Région critique au seuil α</strong> : test <strong>bilatéral</strong> (on encadre la valeur testée, α est réparti des deux côtés) ou <strong>unilatéral</strong> (une seule borne, α d'un seul côté).</li>
        <li><strong>Règle de décision</strong> : si la valeur de l'échantillon tombe dans la région critique, on rejette H<sub>0</sub> (différence significative) ; sinon on ne rejette pas H<sub>0</sub> (pas assez de preuves).</li>
        <li><strong>Statistique de test</strong> : comparer les données observées à ce qu'on attendrait si H<sub>0</sub> était vraie.</li>
        <li><strong>Conclusion</strong>, en phrase, dans le contexte.</li></ol>
        <p class="def">Test bilatéral sur une moyenne (σ connu) : sous H<sub>0</sub> : m = m<sub>0</sub>, ${XB} suit N(m<sub>0</sub> ; σ²/n). Zone d'acceptation au seuil α : [m<sub>0</sub> − z ${F('σ', '√n')} ; m<sub>0</sub> + z ${F('σ', '√n')}]. Si ${XB} est dedans, on ne rejette pas H<sub>0</sub>.</p>
        <p>Rejeter H<sub>0</sub> montre une preuve statistique, jamais une certitude : il reste le risque α de se tromper.</p>` },
      { h: 'Test du khi-deux (χ²)', html: `
        <p>On compare des effectifs observés O<sub>i</sub> aux effectifs attendus E<sub>i</sub> si H<sub>0</sub> est vraie :</p>
        ${MB('χ² = Σ ' + F('(O<sub>i</sub> − E<sub>i</sub>)²', 'E<sub>i</sub>'))}
        <ul><li><strong>Ajustement</strong> (une variable) : les données suivent-elles une loi donnée ? ddl = nombre de modalités − 1.</li>
        <li><strong>Indépendance</strong> (tableau à double entrée, r lignes et c colonnes) : les deux variables sont-elles liées ? E = total ligne × total colonne / total général ; ddl = (r − 1)(c − 1).</li>
        <li>Conditions : au moins 50 valeurs en tout et au moins 5 attendues par case.</li>
        <li>Décision : si χ² &gt; valeur critique de la table (ddl, α), on rejette H<sub>0</sub> ; sinon on ne peut pas la rejeter.</li></ul>
        <p>Les <strong>degrés de liberté</strong> comptent les valeurs qui peuvent varier librement une fois les contraintes fixées : trois nombres de somme 100 n'ont que 2 degrés de liberté.</p>` }
    ],
    formules: [
      ['Estimations ponctuelles', 'm ≈ ' + XB + ' ; p ≈ f'],
      ['Écart-type corrigé', 'σ̂ = √(n/(n − 1)) × σ<sub>observé</sub>'],
      ['IC moyenne, σ connu', XB + ' ± z σ/√n'],
      ['IC moyenne, Student', XB + ' ± t<sub>n−1 ; α</sub> σ̂/√n'],
      ['IC proportion', 'f ± z √(f(1 − f)/n)'],
      ['Coefficients z', '90 % : 1,645 ; 95 % : 1,96 ; 99 % : 2,576'],
      ['Test bilatéral moyenne', 'zone d\'acceptation m<sub>0</sub> ± z σ/√n'],
      ['Khi-deux', 'χ² = Σ(O − E)²/E'],
      ['Effectif attendu', 'E = total ligne × total colonne / total général'],
      ['Degrés de liberté', 'ajustement : k − 1 ; indépendance : (r − 1)(c − 1)']
    ],
    methodes: [
      { h: 'Intervalle de confiance', steps: ['Repère le paramètre : moyenne ou proportion.', 'Moyenne : σ connu et n ≥ 30 → z ; sinon σ̂ et Student à n − 1 ddl.', 'Calcule la marge : z σ/√n, t σ̂/√n ou z √(f(1 − f)/n).', 'Écris l\'intervalle estimation ± marge, arrondi comme demandé.', 'Phrase : « avec une confiance de 95 %, la moyenne de la population est entre … et … ».'] },
      { h: 'Test du khi-deux en 7 étapes (poly p. 45)', steps: ['Vérifie les conditions : n ≥ 50 et au moins 5 attendus par catégorie.', 'Détermine les degrés de liberté.', 'Pose H<sub>0</sub> et H<sub>1</sub>.', 'Calcule les effectifs théoriques E.', 'Calcule χ² = Σ(O − E)²/E.', 'Lis la valeur critique dans la table (ddl, α).', 'Conclus : χ² &gt; seuil → on rejette H<sub>0</sub> ; sinon H<sub>0</sub> reste plausible.'] }
    ],
    pieges: [
      '<b>n ou n − 1 ?</b> Pour décrire une population entière : n. Pour estimer à partir d\'un échantillon (IC, tests) : n − 1.',
      '<b>Student :</b> lis la colonne « risque α en bilatéral » pour un intervalle de confiance, avec n − 1 degrés de liberté.',
      '<b>Ne pas rejeter H<sub>0</sub> ne prouve pas H<sub>0</sub></b> : on dit qu\'on n\'a pas assez de preuves pour la rejeter.',
      '<b>Khi-deux :</b> on divise par l\'effectif attendu E, pas par l\'observé O.'
    ],
    ex: [
      { n: 'A', t: 'Le dé est-il équilibré ?', tags: 'khi-deux d\'ajustement', src: 'exemple du poly p. 47–48',
        e: `<p>On lance un dé 60 fois. Ces résultats sont-ils compatibles avec un dé équilibré, au seuil de 5 % ?</p>${tbl([['Face', '1', '2', '3', '4', '5', '6', 'Total'], ['Observé O', '8', '12', '15', '10', '9', '6', '60']], { side: true })}`,
        q: [
          { q: 'Si le dé est équilibré (H<sub>0</sub>), quel est l\'effectif attendu E pour chaque face (60 lancers, 6 faces) ?', a: 10, d: 1, r: 'E = 10 pour chaque face',
            sol: ['E = 60 / 6 = 10. Conditions : n = 60 ≥ 50 et 10 ≥ 5 par case.'] },
          { q: 'Nombre de degrés de liberté (6 catégories) ?', a: 5, d: 0, r: 'ddl = 5',
            sol: ['ddl = nombre de catégories − 1 = 6 − 1 = 5.'] },
          { q: 'Calcule χ² = Σ(O − E)²/E avec O = 8, 12, 15, 10, 9, 6 et E = 10.', a: 5, d: 2, r: 'χ² = 5',
            sol: ['(8 − 10)²/10 = 0,4 ; (12 − 10)²/10 = 0,4 ; (15 − 10)²/10 = 2,5 ; 0 ; 0,1 ; (6 − 10)²/10 = 1,6.', 'χ² = 0,4 + 0,4 + 2,5 + 0 + 0,1 + 1,6 = 5.'] },
          { q: 'La valeur critique pour 5 ddl au seuil 5 % est 11,07. Décision, avec χ² = 5 ?', c: ['On rejette H<sub>0</sub> : le dé est truqué', 'On ne peut pas rejeter H<sub>0</sub> : les écarts peuvent venir du hasard'], a: 1,
            sol: ['5 ≤ 11,07 : on ne rejette pas l\'hypothèse que le dé est équilibré. Les écarts observés ne sont pas assez grands pour conclure qu\'il est truqué.'] }
        ] },
      { n: 'B', t: 'Deux classes ont-elles la même répartition des notes ?', tags: 'khi-deux d\'indépendance', src: 'exemple du poly p. 49–50, terminé',
        e: `<p>Les classes A et B ont passé la même interrogation. La répartition des notes dépend-elle de la classe ? Seuil 5 %.</p>${tbl([['Note \\ Classe', 'A', 'B', 'Total'], ['note &lt; 10', '5', '6', '11'], ['10 ≤ note &lt; 15', '5', '14', '19'], ['note ≥ 15', '17', '10', '27'], ['Total', '27', '30', '57']], { side: true })}`,
        q: [
          { q: 'Effectif attendu pour la case (classe A, note &lt; 10) : total ligne 11, total colonne 27, total général 57 (à 10<sup>−2</sup>) ?', a: 5.21, d: 2, r: 'E(A, &lt; 10) ≈ 5,21',
            sol: ['E = 11 × 27 / 57 ≈ 5,21.', tbl([['Attendus', 'A', 'B'], ['note &lt; 10', '5,21', '5,79'], ['10 ≤ note &lt; 15', '9', '10'], ['note ≥ 15', '12,79', '14,21']], { side: true }), 'Toutes les cases attendues sont ≥ 5 et n = 57 ≥ 50 : le test est valable.'] },
          { q: 'Calcule χ² (à 10<sup>−2</sup>). Observés 5, 6 / 5, 14 / 17, 10 ; attendus 5,21, 5,79 / 9, 10 / 12,79, 14,21.', a: 6.03, d: 2, r: 'χ² ≈ 6,03',
            sol: ['Contributions : 0,0085 ; 0,0077 ; 1,7778 ; 1,6 ; 1,3862 ; 1,2476.', 'χ² ≈ 6,03.'] },
          { q: 'Nombre de degrés de liberté (3 lignes, 2 colonnes) ?', a: 2, d: 0, r: 'ddl = 2 ; seuil 5,99',
            sol: ['(3 − 1) × (2 − 1) = 2. La table donne 5,99 pour 2 ddl au seuil 5 %.'] },
          { q: 'Conclusion avec χ² ≈ 6,03 et une valeur critique de 5,99 ?', c: ['On rejette H<sub>0</sub> : la répartition des notes diffère selon la classe', 'On ne rejette pas H<sub>0</sub> : même répartition'], a: 0,
            sol: ['6,03 &gt; 5,99 : on rejette H<sub>0</sub> au seuil de 5 %, de justesse. Au seuil de 1 % (9,21), on ne la rejetterait pas.'] }
        ] },
      { n: 'C', t: 'Durée de vie de batteries : IC d\'une moyenne', tags: 'intervalle de confiance · z',
        e: '<p>Sur un échantillon de 100 batteries, la durée de vie moyenne est ' + XB + ' = 52 h. On admet que l\'écart-type de la population vaut σ = 8 h.</p>',
        q: [
          { q: 'Calcule σ/√n (σ = 8, n = 100).', a: 0.8, d: 2, r: 'σ/√n = 0,8',
            sol: ['8 / √100 = 8 / 10 = 0,8.'] },
          { q: 'Intervalle de confiance à 95 % de la durée de vie moyenne (' + XB + ' = 52, σ/√n = 0,8) ? Bornes à 10<sup>−2</sup>.', a: [50.43, 53.57], l: ['borne basse', 'borne haute'], d: 2, r: 'IC 95 % : [50,43 ; 53,57]',
            sol: ['z = 1,96 ; marge = 1,96 × 0,8 = 1,568.', '[52 − 1,568 ; 52 + 1,568] ≈ [50,43 ; 53,57].', 'Avec une confiance de 95 %, la durée de vie moyenne de toutes les batteries est entre 50,43 h et 53,57 h.'] },
          { q: 'Même calcul à 99 % ?', a: [49.94, 54.06], l: ['borne basse', 'borne haute'], d: 2, r: 'IC 99 % : [49,94 ; 54,06]',
            sol: ['z = 2,576 ; marge = 2,576 × 0,8 ≈ 2,061.', '[49,94 ; 54,06] : plus de confiance, intervalle plus large.'] }
        ] },
      { n: 'D', t: 'Sondage : IC d\'une proportion', tags: 'intervalle de confiance · proportion',
        e: '<p>Sur 400 salariés interrogés au hasard, 120 utilisent un gestionnaire de mots de passe.</p>',
        q: [
          { q: 'Fréquence observée f ?', a: 0.3, d: 3, r: 'f = 0,30',
            sol: ['f = 120 / 400 = 0,30. Conditions : n = 400 ≥ 30, nf = 120 ≥ 5, n(1 − f) = 280 ≥ 5.'] },
          { q: 'Intervalle de confiance à 95 % de la proportion (f = 0,30, n = 400), bornes à 10<sup>−3</sup> ?', a: [0.255, 0.345], l: ['borne basse', 'borne haute'], d: 3, r: 'IC 95 % : [0,255 ; 0,345]',
            sol: ['√(0,3 × 0,7 / 400) = √0,000525 ≈ 0,02291.', 'Marge : 1,96 × 0,02291 ≈ 0,0449.', 'IC ≈ [0,255 ; 0,345] : entre 25,5 % et 34,5 % des salariés, avec 95 % de confiance.'] }
        ] },
      { n: 'E', t: 'Temps de réponse d\'un serveur : Student', tags: 'variance corrigée · Student',
        e: `<p>Dix mesures du temps de réponse d'un serveur (ms) : 12 ; 15 ; 9 ; 11 ; 14 ; 10 ; 13 ; 12 ; 11 ; 13. On veut un intervalle de confiance à 95 % de la moyenne. σ est inconnu.</p>`,
        q: [
          { q: 'Moyenne ' + XB + ' des 10 mesures ?', a: 12, d: 2, r: XB + ' = 12 ms',
            sol: ['Somme = 120 ; ' + XB + ' = 120 / 10 = 12 ms.'] },
          { q: 'Écart-type observé σ (division par n) puis corrigé σ̂ (division par n − 1), à 10<sup>−3</sup> ? Σ(x − ' + XB + ')² = 30.', a: [1.732, 1.826], l: ['σ observé', 'σ̂ corrigé'], d: 3, r: 'σ ≈ 1,732 ; σ̂ ≈ 1,826',
            sol: ['Écarts à 12 : 0, 3, −3, −1, 2, −2, 1, 0, −1, 1 ; carrés : somme 30.', 'σ = √(30/10) = √3 ≈ 1,732 ; σ̂ = √(30/9) ≈ 1,826 (= √(10/9) × 1,732).'] },
          { q: 'Coefficient de Student pour 9 ddl, risque 5 % bilatéral ?', a: 2.262, d: 3, r: 't<sub>9 ; 0,05</sub> = 2,262',
            sol: ['Table de Student : ligne ddl = n − 1 = 9, colonne 0,05 en bilatéral : 2,262.'] },
          { q: 'Intervalle de confiance à 95 % (' + XB + ' = 12, σ̂ ≈ 1,826, n = 10, t = 2,262), bornes à 10<sup>−2</sup> ?', a: [10.69, 13.31], l: ['borne basse', 'borne haute'], d: 2, r: 'IC 95 % : [10,69 ; 13,31]',
            sol: ['Marge = 2,262 × 1,826 / √10 ≈ 2,262 × 0,5774 ≈ 1,306.', 'IC ≈ [10,69 ; 13,31] ms.'] }
        ] },
      { n: 'F', t: 'Paquets de 500 g : test bilatéral', tags: 'test d\'hypothèse · moyenne',
        e: '<p>Une machine remplit des paquets de 500 g ; l\'écart-type des masses est σ = 12 g. Sur un échantillon de 36 paquets, la masse moyenne est ' + XB + ' = 503,5 g. La machine est-elle bien réglée, au seuil de 5 % ?</p>',
        q: [
          { q: 'Hypothèses du test bilatéral ?', c: ['H<sub>0</sub> : m = 500 ; H<sub>1</sub> : m ≠ 500', 'H<sub>0</sub> : m = 503,5 ; H<sub>1</sub> : m ≠ 503,5', 'H<sub>0</sub> : m ≠ 500 ; H<sub>1</sub> : m = 500'], a: 0, r: 'H<sub>0</sub> : m = 500 ; H<sub>1</sub> : m ≠ 500',
            sol: ['On teste la valeur annoncée : H<sub>0</sub> : m = 500 g contre H<sub>1</sub> : m ≠ 500 g (écart dans les deux sens).'] },
          { q: 'Zone d\'acceptation au seuil 5 % (m<sub>0</sub> = 500, σ = 12, n = 36), bornes à 10<sup>−2</sup> ?', a: [496.08, 503.92], l: ['borne basse', 'borne haute'], d: 2, r: 'Zone d\'acceptation [496,08 ; 503,92]',
            sol: ['σ/√n = 12/6 = 2 ; marge = 1,96 × 2 = 3,92.', 'Zone : [500 − 3,92 ; 500 + 3,92] = [496,08 ; 503,92].'] },
          { q: 'Décision, avec ' + XB + ' = 503,5 g ?', c: ['503,5 est dans la zone : on ne rejette pas H<sub>0</sub>, la machine est considérée bien réglée', '503,5 ≠ 500 : on rejette H<sub>0</sub>'], a: 0,
            sol: ['496,08 ≤ 503,5 ≤ 503,92 : l\'écart peut s\'expliquer par le hasard de l\'échantillon. On ne rejette pas H<sub>0</sub> au seuil de 5 %.'] }
        ] }
    ]
  });

  /* ======================= CHAPITRE V ======================= */
  var M0 = [['12', '150', '140', '2'], ['3', '850', '20', '18'], ['45', '320', '310', '3'], ['2', '1200', '15', '25']];
  OM.chapter({
    id: 5, num: 'V', short: 'Matrices', title: 'Statistiques à p variables et algèbre linéaire', pages: 'poly p. 51–69', sessions: 'séances 7 et 8',
    summary: 'Matrice des données, centrée, centrée réduite ; matrices de variance-covariance et de corrélation ; rang, déterminant, inverse, valeurs propres, diagonalisation.',
    intro: 'On étudie p variables à la fois sur n individus, en matrices. Puis les rappels d\'algèbre linéaire du poly : déterminant, valeurs et vecteurs propres.',
    tdNote: 'Pas encore de feuille de TD sur Moodle pour ce chapitre : voici les exemples du poly sous forme d\'exercices guidés.',
    cours: [
      { h: 'Matrice des données', html: `
        <p>On observe p variables sur n individus. La matrice des données brutes M a <strong>n lignes</strong> (un individu par ligne) et <strong>p colonnes</strong> (une variable par colonne) : x<sub>i,j</sub> est la valeur de la variable j pour l'individu i.</p>
        <p>Exemple du poly : 4 connexions réseau, avec durée, paquets envoyés, paquets reçus, ports contactés.</p>
        ${MB('M = ' + mat(M0))}` },
      { h: 'Centrer et réduire', html: `
        <p>Les variables ont des unités et des échelles différentes : sans précaution, la plus grande échelle écrase les autres.</p>
        <ul><li><strong>Matrice centrée</strong> M<sub>c</sub> : on remplace x<sub>i,j</sub> par x<sub>i,j</sub> − ${XB}<sub>j</sub>. Chaque colonne a une moyenne nulle : on lit les écarts à la moyenne (au-dessus ou au-dessous).</li>
        <li><strong>Matrice centrée réduite</strong> M<sub>CR</sub> : on divise en plus par l'écart-type σ<sub>j</sub> de la colonne. Chaque colonne a une moyenne 0 et un écart-type 1 ; on compare en « nombre d'écarts-types ».</li></ul>
        <p>Exemple : moyennes des colonnes 15,5 ; 630 ; 121,25 ; 12 et écarts-types ≈ 17,47 ; 418,27 ; 119,92 ; 9,82. Pour la première valeur : (12 − 15,5)/17,47 ≈ −0,20, soit 0,20 écart-type sous la moyenne.</p>` },
      { h: 'Variance-covariance et corrélation', html: `
        ${MB('Σ = ' + F('1', 'n') + ' M<sub>c</sub><sup>T</sup> × M<sub>c</sub>        R = ' + F('1', 'n') + ' M<sub>CR</sub><sup>T</sup> × M<sub>CR</sub>')}
        <ul><li>Σ est carrée d'ordre p et symétrique : sa diagonale contient les variances σ<sub>j</sub>², les autres termes les covariances σ<sub>i,j</sub> = σ<sub>j,i</sub>.</li>
        <li>Covariance positive : les variables augmentent ensemble ; négative : quand l'une augmente l'autre baisse ; proche de 0 : pas de lien linéaire apparent.</li>
        <li>R est la matrice des corrélations : diagonale de 1, autres termes entre −1 et 1. Elle compare les liens indépendamment des unités.</li>
        <li>Exemple : σ<sub>1,2</sub> = −4 477,5 (durée et paquets envoyés varient en sens contraire) ; r<sub>2,4</sub> ≈ 0,99 (paquets envoyés et ports contactés évoluent presque parfaitement ensemble). Corrélation n'est pas causalité.</li></ul>
        <p class="small muted">L'ACP, qui résume p variables en quelques-unes avec les valeurs propres, est hors programme.</p>` },
      { h: 'Rang d\'une matrice', html: `
        <p>Les colonnes C<sub>1</sub>, …, C<sub>n</sub> sont <strong>liées</strong> (linéairement dépendantes) s'il existe x<sub>1</sub>, …, x<sub>n</sub> non tous nuls avec x<sub>1</sub>C<sub>1</sub> + … + x<sub>n</sub>C<sub>n</sub> = 0 : l'une est combinaison linéaire des autres. Sinon elles sont <strong>libres</strong> : AX = 0 n'a que la solution X = 0.</p>
        <p class="def">Le <strong>rang</strong> de A est le nombre maximum de lignes (ou de colonnes) linéairement indépendantes. Rang A ≤ min(nombre de lignes ; nombre de colonnes). Une matrice carrée de rang égal à son ordre est régulière (de plein rang).</p>
        <ul><li>Le rang ne change pas si on permute des lignes ou des colonnes, ni si on remplace une ligne par une combinaison d'elle-même (coefficient non nul) et d'une autre : on le calcule par le pivot.</li>
        <li>AX = U a au moins une solution ⇔ Rang(A | U) = Rang A (unique si A est de plein rang) ; aucune solution ⇔ Rang(A | U) = Rang A + 1.</li></ul>` },
      { h: 'Déterminant et inverse', html: `
        <p>Le déterminant |A| d'une matrice carrée vérifie Det(I<sub>n</sub>) = 1 et c'est une fonction multilinéaire alternée des colonnes (ou des lignes).</p>
        <ul><li>Matrice diagonale (ou triangulaire) : produit des termes diagonaux.</li>
        <li>Une colonne (ou ligne) nulle, deux colonnes égales ou proportionnelles, des colonnes liées : déterminant nul. |A| = 0 ⇔ A singulière (pas de plein rang).</li>
        <li>Échanger deux colonnes change le signe ; ajouter à une colonne une combinaison des autres ne change rien (pivot).</li>
        <li>|A<sup>T</sup>| = |A| ; |AB| = |A| × |B| = |BA|, même si AB ≠ BA.</li></ul>
        ${MB('Ordre 2 : ' + mat([['a', 'b'], ['c', 'd']]) + ' → ad − bc')}
        <p><strong>Sarrus</strong> (ordre 3 uniquement) : on recopie les deux premières colonnes à droite, on ajoute les trois produits des diagonales descendantes et on retranche les trois des diagonales montantes : |A| = a<sub>1</sub>b<sub>2</sub>c<sub>3</sub> + a<sub>2</sub>b<sub>3</sub>c<sub>1</sub> + a<sub>3</sub>b<sub>1</sub>c<sub>2</sub> − a<sub>3</sub>b<sub>2</sub>c<sub>1</sub> − a<sub>1</sub>b<sub>3</sub>c<sub>2</sub> − a<sub>2</sub>b<sub>1</sub>c<sub>3</sub>.</p>
        <p><strong>Cofacteurs</strong> (tout ordre) : cofacteur de a<sub>ij</sub> = (−1)<sup>i+j</sup> × déterminant de la sous-matrice sans la ligne i ni la colonne j. |A| = somme des termes d'une ligne (ou colonne) multipliés par leurs cofacteurs : choisis la ligne qui a le plus de zéros.</p>
        <p><strong>Inverse</strong> : si |A| ≠ 0, A<sup>−1</sup> = ${F('1', 'Det(A)')} Adj(A), où Adj(A) est la transposée de la comatrice (matrice des cofacteurs).</p>` },
      { h: 'Valeurs propres et vecteurs propres', html: `
        <p class="def">λ est <strong>valeur propre</strong> de A s'il existe un vecteur colonne P <strong>non nul</strong> tel que AP = λP ; P est un <strong>vecteur propre</strong> associé à λ.</p>
        <ul><li>AP = λP ⇔ (A − λI)P = 0 avec P ≠ 0 ⇔ <strong>Det(A − λI) = 0</strong>. Det(A − λI) est le polynôme caractéristique, de degré n : n racines complexes, distinctes ou confondues.</li>
        <li>Une matrice triangulaire a ses termes diagonaux pour valeurs propres. A et A<sup>T</sup> ont les mêmes valeurs propres. Si une ligne ou colonne n'a que des zéros hors de la diagonale, a<sub>ii</sub> est une valeur propre « évidente ».</li>
        <li>Matrice réelle : si z est valeur propre complexe, son conjugué aussi (vecteurs propres conjugués).</li>
        <li>Le sous-espace propre associé à λ est Ker(A − λI). dim Ker(A − λI) = n − Rang(A − λI), et 1 ≤ dim ≤ multiplicité de λ (une valeur propre simple donne une dimension 1).</li></ul>
        <p>Exemple du poly : A = ${mat([['1', '4'], ['1', '1']])} ; A(2 ; −1) = (−2 ; 1) = −1 × (2 ; −1) et A(2 ; 1) = (6 ; 3) = 3 × (2 ; 1) : valeurs propres −1 et 3.</p>` },
      { h: 'Diagonalisation', html: `
        <p>Si A d'ordre n a n vecteurs propres linéairement indépendants P<sub>1</sub>, …, P<sub>n</sub>, la matrice P = (P<sub>1</sub> … P<sub>n</sub>) est inversible et</p>
        ${MB('A = P D P<sup>−1</sup>    avec D diagonale des valeurs propres')}
        <ul><li>Condition suffisante : n valeurs propres distinctes ⇒ diagonalisable.</li>
        <li>Condition nécessaire et suffisante : pour chaque valeur propre, la dimension du sous-espace propre est égale à sa multiplicité.</li>
        <li>Méthode : spectre Sp(A) ; si les valeurs propres sont distinctes, c'est fini ; sinon compare dim Ker(A − λI) et multiplicité.</li>
        <li>|A| = produit des valeurs propres ; Tr(A) (somme de la diagonale) = somme des valeurs propres, même si A n'est pas diagonalisable. Tr(AB) = Tr(BA).</li>
        <li>Puissances : A<sup>n</sup> = P D<sup>n</sup> P<sup>−1</sup>.</li></ul>` }
    ],
    formules: [
      ['Centrée réduite', '(x<sub>i,j</sub> − ' + XB + '<sub>j</sub>) / σ<sub>j</sub>'],
      ['Variance-covariance', 'Σ = (1/n) M<sub>c</sub><sup>T</sup> M<sub>c</sub> (symétrique, variances sur la diagonale)'],
      ['Corrélation', 'R = (1/n) M<sub>CR</sub><sup>T</sup> M<sub>CR</sub> (diagonale de 1)'],
      ['Déterminant 2 × 2', 'ad − bc'],
      ['Sarrus 3 × 3', 'a<sub>1</sub>b<sub>2</sub>c<sub>3</sub> + a<sub>2</sub>b<sub>3</sub>c<sub>1</sub> + a<sub>3</sub>b<sub>1</sub>c<sub>2</sub> − a<sub>3</sub>b<sub>2</sub>c<sub>1</sub> − a<sub>1</sub>b<sub>3</sub>c<sub>2</sub> − a<sub>2</sub>b<sub>1</sub>c<sub>3</sub>'],
      ['Cofacteur', '(−1)<sup>i+j</sup> × det(sous-matrice sans ligne i et colonne j)'],
      ['Inverse', 'A<sup>−1</sup> = Adj(A) / Det(A)'],
      ['Valeurs propres', 'Det(A − λI) = 0'],
      ['Sous-espace propre', 'dim Ker(A − λI) = n − Rang(A − λI)'],
      ['Diagonalisation', 'A = PDP<sup>−1</sup> ; A<sup>n</sup> = PD<sup>n</sup>P<sup>−1</sup>'],
      ['Contrôles', 'Det(A) = produit des λ ; Tr(A) = somme des λ']
    ],
    methodes: [
      { h: 'Diagonaliser une matrice', steps: ['Calcule Det(A − λI) et factorise-le (cherche des valeurs propres évidentes, fais apparaître des zéros par pivot).', 'Vérifie : somme des λ = Tr(A), produit = Det(A).', 'Pour chaque λ : rang de A − λI, puis dim Ker = n − rang.', 'Cherche les vecteurs propres en repérant une combinaison nulle des colonnes de A − λI (ex. 2C<sub>1</sub> + C<sub>2</sub> = 0 donne (2 ; 1)).', 'Diagonalisable si chaque dimension égale la multiplicité ; P = vecteurs propres en colonnes, D = valeurs propres dans le même ordre.'] },
      { h: 'Déterminant d\'ordre 4', steps: ['Repère une ligne ou une colonne avec des zéros.', 'Fais apparaître d\'autres zéros par pivot (L<sub>i</sub> ← L<sub>i</sub> − kL<sub>1</sub>), ce qui ne change pas le déterminant.', 'Développe selon cette colonne avec les cofacteurs (signes alternés + − + −).', 'Termine par Sarrus ou par ad − bc.'] }
    ],
    pieges: [
      '<b>Sarrus ne marche que pour l\'ordre 3.</b> Au-delà : cofacteurs ou pivot.',
      '<b>Un vecteur propre n\'est jamais nul</b>, et tout multiple non nul d\'un vecteur propre en est un aussi.',
      '<b>Valeur propre double ≠ diagonalisable automatiquement :</b> vérifie que dim Ker(A − λI) = 2 (A<sub>3</sub> oui, A<sub>2</sub> non).',
      '<b>AB ≠ BA en général</b>, mais |AB| = |BA| et Tr(AB) = Tr(BA).',
      '<b>Matrice de corrélation :</b> des 1 sur la diagonale ; si tu trouves autre chose, il y a une erreur de calcul.'
    ],
    ex: [
      { n: 'A', t: 'Connexions réseau : centrer, réduire, interpréter', tags: 'matrices de données', src: 'exemple du poly p. 51–56',
        e: `<p>4 connexions, 4 variables : durée, paquets envoyés, paquets reçus, ports contactés.</p>${MB('M = ' + mat(M0))}<p>Écarts-types des colonnes (division par n = 4) : σ<sub>1</sub> ≈ 17,47 ; σ<sub>2</sub> ≈ 418,27 ; σ<sub>3</sub> ≈ 119,92 ; σ<sub>4</sub> ≈ 9,82.</p>`,
        q: [
          { q: 'Moyenne de la colonne « paquets envoyés » (150 ; 850 ; 320 ; 1 200) ?', a: 630, d: 1, r: XB + '<sub>2</sub> = 630 (moyennes : 15,5 ; 630 ; 121,25 ; 12)',
            sol: ['(150 + 850 + 320 + 1 200) / 4 = 2 520 / 4 = 630.', 'Les quatre moyennes : 15,5 ; 630 ; 121,25 ; 12.'] },
          { q: 'Terme de la matrice centrée pour la durée de C<sub>2</sub> (durée 3, moyenne des durées 15,5) ?', a: -12.5, d: 2, r: 'M<sub>c</sub> : durée de C<sub>2</sub> → −12,5',
            sol: ['3 − 15,5 = −12,5 : la connexion C<sub>2</sub> dure 12,5 de moins que la moyenne.', 'Matrice centrée : ' + mat([['−3,5', '−480', '18,75', '−10'], ['−12,5', '220', '−101,25', '6'], ['29,5', '−310', '188,75', '−9'], ['−13,5', '570', '−106,25', '13']])] },
          { q: 'Terme centré réduit pour la durée de C<sub>1</sub> (durée 12, moyenne 15,5, σ<sub>1</sub> ≈ 17,47), à 10<sup>−2</sup> ?', a: -0.2, d: 2, r: 'M<sub>CR</sub> : durée de C<sub>1</sub> → −0,20',
            sol: ['(12 − 15,5) / 17,47 ≈ −0,20 : la durée de C<sub>1</sub> est 0,20 écart-type sous la moyenne.'] },
          { q: 'Dans Σ, on lit σ<sub>1,2</sub> = Cov(durée, paquets envoyés) = −4 477,5. Que signifie le signe ?', c: ['Les connexions longues ont tendance à envoyer peu de paquets', 'Les connexions longues envoient beaucoup de paquets', 'Les deux variables sont indépendantes'], a: 0,
            sol: ['Covariance négative : les valeurs élevées de la durée vont avec des valeurs faibles des paquets envoyés.', 'Les variances (305,25 ; 174 950…) sont d\'échelles très différentes : pour comparer les liens, on passe à la matrice de corrélation.'] },
          { q: 'Dans R, r<sub>2,4</sub> ≈ 0,99 (paquets envoyés, ports contactés). Quelle lecture est correcte ?', c: ['Ces deux variables évoluent presque parfaitement dans le même sens dans cet échantillon', 'Envoyer des paquets fait contacter plus de ports', 'Les deux variables ont presque la même variance'], a: 0,
            sol: ['Corrélation positive très forte : association linéaire presque parfaite. Ce n\'est pas une preuve de cause à effet.'] }
        ] },
      { n: 'B', t: 'Déterminants : 2 × 2, Sarrus, ordre 4', tags: 'déterminant',
        e: `<p>Calculer les déterminants suivants.</p>${MB('A = ' + mat([['1', '2'], ['3', '4']]) + '    B = ' + mat([['2', '1', '3'], ['0', '−1', '4'], ['1', '2', '1']]) + '    C = ' + mat([['1', '2', '−1', '3'], ['−1', '1', '0', '−2'], ['2', '1', '0', '1'], ['1', '−1', '2', '−3']]))}<p class="small muted">C est l'exemple du poly p. 60–61.</p>`,
        q: [
          { q: 'Det(A) pour A = ((1, 2), (3, 4)) ?', a: -2, d: 1, r: 'Det(A) = −2',
            sol: ['ad − bc = 1 × 4 − 2 × 3 = 4 − 6 = −2.'] },
          { q: 'Det(B) par la règle de Sarrus, B = ((2, 1, 3), (0, −1, 4), (1, 2, 1)) ?', a: -11, d: 1, r: 'Det(B) = −11',
            sol: ['Diagonales descendantes : 2 × (−1) × 1 + 1 × 4 × 1 + 3 × 0 × 2 = −2 + 4 + 0 = 2.', 'Diagonales montantes : 3 × (−1) × 1 + 2 × 4 × 2 + 1 × 0 × 1 = −3 + 16 + 0 = 13.', 'Det(B) = 2 − 13 = −11.'] },
          { q: 'Det(C) (ordre 4) par pivot puis développement ?', a: 9, d: 1, r: 'Det(C) = 9',
            sol: ['L<sub>2</sub> ← L<sub>2</sub> + L<sub>1</sub>, L<sub>3</sub> ← L<sub>3</sub> − 2L<sub>1</sub>, L<sub>4</sub> ← L<sub>4</sub> − L<sub>1</sub> : la première colonne devient (1, 0, 0, 0).', 'Det(C) = 1 × det((3, −1, 1), (−3, 2, −5), (−3, 3, −6)).', 'L<sub>2</sub> ← L<sub>2</sub> + L<sub>1</sub>, L<sub>3</sub> ← L<sub>3</sub> + L<sub>1</sub> : 3 × det((1, −4), (2, −5)) = 3 × (−5 + 8) = 9.'] }
        ] },
      { n: 'C', t: 'A₁ : valeurs propres et diagonalisation', tags: 'valeurs propres · diagonalisation', src: 'exemple du poly p. 63–68',
        e: `${MB('A<sub>1</sub> = ' + mat([['−1', '8'], ['1', '1']]))}`,
        q: [
          { q: 'Det(A<sub>1</sub> − λI) = (−1 − λ)(1 − λ) − 8 = λ² − 9. Donne les deux valeurs propres.', a: [3, -3], l: ['λ₁ (la plus grande)', 'λ₂'], d: 1, r: 'Valeurs propres : 3 et −3',
            sol: ['λ² − 9 = (3 − λ)(3 + λ) : λ = 3 ou λ = −3.', 'Contrôle : somme 0 = Tr(A<sub>1</sub>) = −1 + 1 ; produit −9 = Det(A<sub>1</sub>) = −1 − 8.'] },
          { q: 'A<sub>1</sub> − 3I = ((−4, 8), (1, −2)). Quel vecteur est propre pour λ = 3 ?', c: ['(2 ; 1)', '(4 ; −1)', '(1 ; 2)'], a: 0, r: 'Vecteur propre pour 3 : (2 ; 1) ; pour −3 : (4 ; −1)',
            sol: ['2C<sub>1</sub> + C<sub>2</sub> = 2(−4 ; 1) + (8 ; −2) = (0 ; 0), donc (2 ; 1) convient. Vérification : A<sub>1</sub>(2 ; 1) = (6 ; 3) = 3(2 ; 1).', 'Pour −3 : A<sub>1</sub> + 3I = ((2, 8), (1, 4)) et 4C<sub>1</sub> − C<sub>2</sub> = 0, d\'où (4 ; −1).'] },
          { q: 'A<sub>1</sub> est-elle diagonalisable ? Si oui, avec quelles matrices ?', c: ['Oui : A<sub>1</sub> = PDP<sup>−1</sup> avec P = ((2, 4), (1, −1)) et D = diag(3 ; −3)', 'Non : il faudrait une valeur propre double', 'Oui, avec P = I'], a: 0,
            sol: ['Deux valeurs propres distinctes pour une matrice d\'ordre 2 : diagonalisable.', 'P a pour colonnes (2 ; 1) et (4 ; −1), D = diag(3 ; −3) dans le même ordre.'] }
        ] },
      { n: 'D', t: 'A₂ et A₃ : valeurs propres multiples', tags: 'multiplicité · dimension', src: 'exemples du poly p. 63–68',
        e: `${MB('A<sub>2</sub> = ' + mat([['2', '−1', '2'], ['−1', '2', '−2'], ['−1', '1', '−1']]) + '    A<sub>3</sub> = ' + mat([['−1', '0', '8'], ['2', '3', '−4'], ['1', '0', '1']]))}<p>Det(A<sub>2</sub> − λI) = (1 − λ)³ et Det(A<sub>3</sub> − λI) = (3 − λ)²(3 + λ).</p>`,
        q: [
          { q: 'Valeur propre triple de A<sub>2</sub> ?', a: 1, d: 1, r: 'A<sub>2</sub> : λ = 1 triple',
            sol: ['(1 − λ)³ = 0 ⇔ λ = 1 (le poly écrit −1 par erreur). Contrôle : Tr(A<sub>2</sub>) = 2 + 2 − 1 = 3 = 1 + 1 + 1.'] },
          { q: 'A<sub>2</sub> − I = ((1, −1, 2), (−1, 1, −2), (−1, 1, −2)) : ses colonnes sont proportionnelles, son rang est 1. Dimension de Ker(A<sub>2</sub> − I) ?', a: 2, d: 0, r: 'dim Ker(A<sub>2</sub> − I) = 2',
            sol: ['dim Ker = ordre − rang = 3 − 1 = 2.'] },
          { q: 'A<sub>2</sub> est-elle diagonalisable ?', c: ['Non : dimension 2 &lt; multiplicité 3', 'Oui : toute matrice 3 × 3 l\'est', 'Oui : sa valeur propre est réelle'], a: 0,
            sol: ['Il faudrait dim Ker(A<sub>2</sub> − I) = 3. Avec 2, A<sub>2</sub> n\'est pas diagonalisable.'] },
          { q: 'A<sub>3</sub> : rang de A<sub>3</sub> − 3I = ((−4, 0, 8), (2, 0, −4), (1, 0, −2)) ? En déduire dim Ker(A<sub>3</sub> − 3I).', a: [1, 2], l: ['rang', 'dim Ker'], d: 0, r: 'dim Ker(A<sub>3</sub> − 3I) = 2',
            sol: ['Les trois lignes sont proportionnelles : rang 1. dim Ker = 3 − 1 = 2.'] },
          { q: 'A<sub>3</sub> est-elle diagonalisable ? Contrôle avec Det(A<sub>3</sub>).', c: ['Oui : dim 2 pour λ = 3 (double) et dim 1 pour λ = −3 (simple)', 'Non : 3 est une valeur propre double'], a: 0,
            sol: ['Chaque dimension égale la multiplicité : diagonalisable, avec D = diag(3 ; 3 ; −3) et P = ((0, 2, 4), (1, 0, −2), (0, 1, −1)).', 'Det(A<sub>3</sub>) = 3 × 3 × (−3) = −27 et Tr(A<sub>3</sub>) = −1 + 3 + 1 = 3 = 3 + 3 − 3.'] }
        ] }
    ]
  });
})();
