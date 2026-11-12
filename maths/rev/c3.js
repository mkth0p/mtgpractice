/* Chapitre III — Variables aléatoires (poly p. 22–36, TD séances 4–5). */
(function () {
  var H = OM.h, F = H.F, R = H.R, ov = H.ov, tbl = H.tbl, MB = H.MB, curve = H.curve, fr = H.fr;
  var m = OM.math;
  OM.errata.push('<b>Poly p. 29 :</b> « P(X ≥ t) = 1 − P(X ≤ t) » est faux pour une loi discrète. C\'est P(X ≥ t) = 1 − P(X ≤ t − 1) ; et P(X &gt; t) = 1 − P(X ≤ t).');
  OM.errata.push('<b>Poly p. 35 :</b> F et R sont inversées. Défaillance F(t) = P(T ≤ t) = 1 − e<sup>−λt</sup> ; fiabilité R(t) = P(T &gt; t) = e<sup>−λt</sup>.');
  OM.errata.push('<b>Poly p. 71 :</b> table de Student, ligne ddl = 1, colonne α = 0,001 : la valeur est 636,62, pas 63,662.');

  /* ---- Exercice 0 : loi normale et Poisson ---- */
  var NORM = [[50, 8, '≤', 34], [100, 20, '≥', 135], [20, 4, '≤', 14], [80, 8, '≥', 90], [60, 12, '≥', 63], [500, 50, '≤', 500], [24, 8, '≤', 26], [120, 16, '≤', 132], [45, 5, '≥', 40], [300, 40, '≤', 350], [100, 12, '≥', 82], [60, 8, '≤', 74], [25, 4, '≥', 17], [80, 8, '≤', 98]];
  var normQ = NORM.map(function (c, i) {
    var mu = c[0], s = c[1], op = c[2], x = c[3], t = (x - mu) / s, at = Math.abs(t), p = m.pi4(at), res;
    var steps = ['t = (' + fr(x) + ' − ' + fr(mu) + ') / ' + fr(s) + ' = ' + fr(t) + '.'];
    if (op === '≤') {
      if (t >= 0) { res = p; steps.push('P(X ≤ ' + fr(x) + ') = π(' + fr(t) + ') = ' + fr(p, 4) + '.'); }
      else { res = 1 - p; steps.push('P(X ≤ ' + fr(x) + ') = π(' + fr(t) + ') = 1 − π(' + fr(at) + ') = 1 − ' + fr(p, 4) + ' = ' + fr(res, 4) + '.'); }
    } else {
      if (t >= 0) { res = 1 - p; steps.push('P(X ≥ ' + fr(x) + ') = 1 − π(' + fr(t) + ') = 1 − ' + fr(p, 4) + ' = ' + fr(res, 4) + '.'); }
      else { res = p; steps.push('P(X ≥ ' + fr(x) + ') = 1 − π(' + fr(t) + ') = 1 − (1 − π(' + fr(at) + ')) = π(' + fr(at) + ') = ' + fr(p, 4) + '.'); }
    }
    return { q: (i + 1) + '. X ∼ N(' + fr(mu) + ' ; ' + fr(s) + '²). Calcule P(X ' + op + ' ' + fr(x) + ') à 10<sup>−4</sup>.', a: m.round(res, 4), d: 4, sol: steps };
  });
  normQ.push({ q: '15. X ∼ N(30 ; 5²). Calcule P(25 ≤ X ≤ 35) à 10<sup>−4</sup>.', a: 0.6826, d: 4, sol: ['Bornes centrées réduites : (25 − 30)/5 = −1 et (35 − 30)/5 = 1.', 'P(−1 ≤ T ≤ 1) = 2π(1) − 1 = 2 × 0,8413 − 1 = 0,6826.'] });
  normQ.push({ q: '16. X ∼ N(200 ; 20²). Calcule P(170 ≤ X ≤ 210) à 10<sup>−4</sup>.', a: 0.6247, d: 4, sol: ['Bornes : (170 − 200)/20 = −1,5 et (210 − 200)/20 = 0,5.', 'P = π(0,5) − π(−1,5) = 0,6915 − (1 − 0,9332) = 0,6915 − 0,0668 = 0,6247.'] });

  function poisSum(l, a, b) { var s = 0; for (var k = a; k <= b; k++) s += m.pois(l, k); return s; }
  var POIS = [
    [2, 'P(X = 0)', function () { return m.pois(2, 0); }, 'e<sup>−2</sup> ≈ 0,135.'],
    [3, 'P(X = 1)', function () { return m.pois(3, 1); }, '3 e<sup>−3</sup> ≈ 0,149.'],
    [4, 'P(X = 2)', function () { return m.pois(4, 2); }, 'e<sup>−4</sup> × 4²/2! = 8 e<sup>−4</sup> ≈ 0,147.'],
    [5, 'P(X = 3)', function () { return m.pois(5, 3); }, 'e<sup>−5</sup> × 5³/3! = (125/6) e<sup>−5</sup> ≈ 0,140.'],
    [3, 'P(X = 4)', function () { return m.pois(3, 4); }, 'e<sup>−3</sup> × 3⁴/4! = (81/24) e<sup>−3</sup> ≈ 0,168.'],
    [2, 'P(X ≤ 1)', function () { return poisSum(2, 0, 1); }, 'P(X = 0) + P(X = 1) = e<sup>−2</sup>(1 + 2) = 3e<sup>−2</sup> ≈ 0,406.'],
    [3, 'P(X ≤ 2)', function () { return poisSum(3, 0, 2); }, 'e<sup>−3</sup>(1 + 3 + 4,5) = 8,5 e<sup>−3</sup> ≈ 0,423.'],
    [3, 'P(X &lt; 4)', function () { return poisSum(3, 0, 3); }, 'P(X &lt; 4) = P(X ≤ 3) = e<sup>−3</sup>(1 + 3 + 4,5 + 4,5) = 13 e<sup>−3</sup> ≈ 0,647.'],
    [2, 'P(X ≥ 1)', function () { return 1 - m.pois(2, 0); }, '1 − P(X = 0) = 1 − e<sup>−2</sup> ≈ 0,865.'],
    [4, 'P(X ≥ 3)', function () { return 1 - poisSum(4, 0, 2); }, '1 − P(X ≤ 2) = 1 − e<sup>−4</sup>(1 + 4 + 8) = 1 − 13 e<sup>−4</sup> ≈ 0,762.'],
    [3, 'P(X &gt; 3)', function () { return 1 - poisSum(3, 0, 3); }, '1 − P(X ≤ 3) = 1 − 13 e<sup>−3</sup> ≈ 0,353.'],
    [4, 'P(1 ≤ X ≤ 3)', function () { return poisSum(4, 1, 3); }, 'e<sup>−4</sup>(4 + 8 + 10,667) ≈ 22,667 e<sup>−4</sup> ≈ 0,415.'],
    [3, 'P(2 ≤ X ≤ 4)', function () { return poisSum(3, 2, 4); }, 'e<sup>−3</sup>(4,5 + 4,5 + 3,375) = 12,375 e<sup>−3</sup> ≈ 0,616.'],
    [5, 'P(3 ≤ X ≤ 5)', function () { return poisSum(5, 3, 5); }, 'e<sup>−5</sup>(20,833 + 26,042 + 26,042) ≈ 72,917 e<sup>−5</sup> ≈ 0,491.']
  ];
  var poisQ = POIS.map(function (c, i) {
    return { q: (i + 1) + '. X suit la loi de Poisson de paramètre λ = ' + c[0] + '. Calcule ' + c[1] + ' au millième.', a: m.round(c[2](), 3), d: 3, sol: ['P(X = k) = e<sup>−λ</sup> λ<sup>k</sup> / k!', c[3]] };
  });

  var EXPO_FIG = curve({ pts: [[0, 1], [250, Math.exp(-0.5)], [500, Math.exp(-1)], [750, Math.exp(-1.5)], [1000, Math.exp(-2)], [1250, Math.exp(-2.5)], [1500, Math.exp(-3)]], xt: [0, 250, 500, 750, 1000, 1250, 1500], yt: [0, 0.25, 0.5, 0.75, 1], x0: 0, x1: 1500, y1: 1.05, xl: 'jours', yl: 'R(t)', alt: 'Fiabilité R(t) = e^(−0,002 t)' });

  OM.chapter({
    id: 3, num: 'III', short: 'Variables aléatoires', title: 'Variables aléatoires', pages: 'poly p. 22–36', sessions: 'séances 4 et 5',
    summary: 'Loi, fonction de répartition, espérance, variance ; lois de Bernoulli, binomiale, Poisson, géométrique, uniforme, exponentielle, normale ; approximations.',
    intro: 'Le chapitre le plus calculatoire : reconnaître la loi, écrire ses paramètres, puis appliquer la bonne formule ou la table.',
    cours: [
      { h: 'Variable aléatoire et loi de probabilité', html: `
        <p>Une <strong>variable aléatoire</strong> (v.a.) X associe un nombre réel à chaque issue de Ω. Sa <strong>loi</strong> associe à chaque valeur x<sub>i</sub> sa probabilité p<sub>i</sub> = P(X = x<sub>i</sub>), avec Σp<sub>i</sub> = 1. Une v.a. <strong>discrète</strong> prend des valeurs isolées ; une v.a. <strong>continue</strong> prend ses valeurs dans des intervalles.</p>
        <p>Exemple du poly : on lance un dé équilibré. 6 : on gagne 18 € ; nombre impair : on gagne 10 € ; sinon (2 ou 4) on perd 30 €.</p>
        ${tbl([['Gain x<sub>i</sub>', '−30', '10', '18'], ['P(X = x<sub>i</sub>)', '1/3', '1/2', '1/6']], { side: true })}` },
      { h: 'Fonction de répartition', html: `
        <p class="def">F(x) = P(X ≤ x), de ℝ dans [0 ; 1].</p>
        <ul><li>F est croissante, tend vers 0 en −∞ et vers 1 en +∞.</li>
        <li>P(a &lt; X ≤ b) = F(b) − F(a).</li>
        <li>Pour une v.a. discrète, F est constante par morceaux (en escalier). Exemple du dé : F(x) = 0 si x &lt; −30 ; 1/3 si −30 ≤ x &lt; 10 ; 5/6 si 10 ≤ x &lt; 18 ; 1 si x ≥ 18.</li></ul>
        <p><strong>V.a. continue</strong> : F(x) = ∫<sub>−∞</sub><sup>x</sup> f(t) dt, où f est la <strong>densité</strong> : f ≥ 0, continue sauf en un nombre fini de points, ∫<sub>−∞</sub><sup>+∞</sup> f = 1. Alors P(a ≤ X ≤ b) = F(b) − F(a) = ∫<sub>a</sub><sup>b</sup> f(t) dt, une aire sous la courbe de f. Conséquence : P(X = a) = 0, donc ≤ et &lt; donnent la même probabilité.</p>` },
      { h: 'Espérance, variance, écart-type', html: `
        <p>L'<strong>espérance</strong> est la moyenne des valeurs pondérée par leurs probabilités.</p>
        ${MB('E(X) = Σ x<sub>i</sub> p<sub>i</sub>      (continue : E(X) = ∫ t f(t) dt)')}
        <p>Exemple du dé : E(X) = −30 × 1/3 + 10 × 1/2 + 18 × 1/6 = −10 + 5 + 3 = −2 : en moyenne on perd 2 € par partie.</p>
        ${MB('V(X) = E[(X − E(X))²] = E(X²) − [E(X)]²      σ(X) = √V(X)')}
        <ul><li>E(aX + b) = aE(X) + b et E[X − E(X)] = 0.</li><li>V(aX + b) = a²V(X) ; V(X) ≥ 0.</li>
        <li>C'est la même formule « moyenne des carrés moins carré de la moyenne » qu'au chapitre II.</li></ul>` },
      { h: 'Couple de variables aléatoires', html: `
        <p>La loi du couple (X, Y) est donnée par les P((X = x) ∩ (Y = y)) ; les lois de X et de Y seules sont les lois <strong>marginales</strong>.</p>
        <ul><li>X et Y <strong>indépendantes</strong> ⇔ P(X = x et Y = y) = P(X = x) × P(Y = y) pour tous x, y.</li>
        <li>E(X + Y) = E(X) + E(Y), toujours.</li>
        <li>Si X et Y sont indépendantes : V(X + Y) = V(X) + V(Y), donc σ(X + Y) = ${R('σ²(X) + σ²(Y)')}.</li>
        <li>Loi conditionnelle : P<sub>(Y = y)</sub>(X = x) = P((X = x) ∩ (Y = y)) / P(Y = y).</li>
        <li>Cov(X, Y) = E[(X − E(X))(Y − E(Y))] = E(XY) − E(X)E(Y).</li></ul>` },
      { h: 'Lois discrètes usuelles', html: `
        ${tbl([['Loi', 'X compte…', 'Valeurs', 'P(X = k)', 'E(X)', 'V(X)'], ['Bernoulli ℬ(p)', 'succès (1) / échec (0)', '{0 ; 1}', 'p<sup>k</sup>(1 − p)<sup>1−k</sup>', 'p', 'p(1 − p)'], ['Binomiale ℬ(n, p)', 'les succès en n épreuves indépendantes', '{0, …, n}', '(<sup>n</sup><sub>k</sub>) p<sup>k</sup>(1 − p)<sup>n−k</sup>', 'np', 'np(1 − p)'], ['Poisson 𝒫(λ)', 'des événements rares sur une durée ou un espace', 'ℕ', 'e<sup>−λ</sup> λ<sup>k</sup> / k!', 'λ', 'λ'], ['Géométrique 𝒢(p)', 'le rang du premier succès', 'ℕ*', '(1 − p)<sup>k−1</sup> p', '1/p', '(1 − p)/p²']])}
        <ul><li>Binomiale et Poisson : P(X ≤ t) = P(X = 0) + … + P(X = t) ; P(X ≥ t) = 1 − P(X ≤ t − 1) ; P(X &gt; t) = 1 − P(X ≤ t).</li>
        <li>Poisson : λ est le nombre moyen d'occurrences sur l'intervalle considéré.</li>
        <li>Géométrique : P(X ≤ k) = 1 − (1 − p)<sup>k</sup>.</li></ul>` },
      { h: 'Lois continues usuelles', html: `
        ${tbl([['Loi', 'Densité f', 'Répartition F', 'E(X)', 'V(X)', 'σ'], ['Uniforme 𝒰[a ; b]', '1/(b − a) sur [a ; b]', '(x − a)/(b − a) sur [a ; b]', '(a + b)/2', '(b − a)²/12', '(b − a)/(2√3)'], ['Exponentielle ℰ(λ)', 'λe<sup>−λx</sup> pour x ≥ 0', '1 − e<sup>−λx</sup>', '1/λ', '1/λ²', '1/λ'], ['Normale N(m ; σ²)', 'courbe en cloche', 'table', 'm', 'σ²', 'σ']])}
        <p><strong>Uniforme</strong> : P(X ∈ [x<sub>1</sub> ; x<sub>2</sub>]) = (x<sub>2</sub> − x<sub>1</sub>)/(b − a) pour [x<sub>1</sub> ; x<sub>2</sub>] ⊂ [a ; b].</p>
        <p><strong>Exponentielle</strong> (durée de vie, temps d'attente, taux d'avarie λ constant) : fiabilité R(t) = P(T &gt; t) = e<sup>−λt</sup> ; défaillance F(t) = P(T ≤ t) = 1 − e<sup>−λt</sup> ; MTBF = E(T) = 1/λ. Sans mémoire : P<sub>T &gt; s</sub>(T &gt; s + t) = P(T &gt; t).</p>
        <p><strong>Normale</strong> N(m ; σ²) (beaucoup de petites causes indépendantes qui s'additionnent) : P(X ≤ m) = 0,5 ; P(m − σ ≤ X ≤ m + σ) ≈ 0,68 ; à 2σ ≈ 0,95 ; à 3σ ≈ 0,997.</p>
        <p class="def">On <strong>centre et réduit</strong> : T = (X − m)/σ suit N(0 ; 1), et π(t) = P(T ≤ t) se lit dans la table. π(−t) = 1 − π(t) ; P(T ≥ t) = 1 − π(t) ; P(a &lt; T &lt; b) = π(b) − π(a) ; P(−t &lt; T &lt; t) = 2π(t) − 1.</p>` },
      { h: 'Approximations', html: `
        <p><strong>Binomiale → Poisson</strong> : si n ≥ 30, p ≤ 0,1 et np &lt; 15 (ou p ≤ 0,1 et np ≤ 10), ℬ(n, p) ≈ 𝒫(λ) avec λ = np.</p>
        <p><strong>Binomiale → normale</strong> : si n ≥ 30, np &gt; 5 et np(1 − p) &gt; 5, ℬ(n, p) ≈ N(np ; np(1 − p)), donc m = np et σ = ${R('np(1 − p)')}.</p>
        <p class="small muted">Dans les TD, on calcule directement P(Y ≤ 20) avec la loi normale, sans correction de continuité.</p>` }
    ],
    formules: [
      ['Espérance', 'E(X) = Σ x<sub>i</sub> p<sub>i</sub>'],
      ['Variance', 'V(X) = E(X²) − E(X)² ; σ = √V'],
      ['Transformation affine', 'E(aX + b) = aE(X) + b ; V(aX + b) = a²V(X)'],
      ['Somme', 'E(X + Y) = E(X) + E(Y) ; V(X + Y) = V(X) + V(Y) si indépendantes'],
      ['Binomiale ℬ(n, p)', 'P(X = k) = (<sup>n</sup><sub>k</sub>) p<sup>k</sup>(1 − p)<sup>n−k</sup> ; E = np ; σ = √(np(1 − p))'],
      ['Poisson 𝒫(λ)', 'P(X = k) = e<sup>−λ</sup> λ<sup>k</sup>/k! ; E = V = λ'],
      ['Uniforme 𝒰[a ; b]', 'P(c ≤ X ≤ d) = (d − c)/(b − a) ; E = (a + b)/2 ; V = (b − a)²/12'],
      ['Exponentielle ℰ(λ)', 'R(t) = e<sup>−λt</sup> ; F(t) = 1 − e<sup>−λt</sup> ; MTBF = 1/λ'],
      ['Normale', 'T = (X − m)/σ ; π(−t) = 1 − π(t) ; P(−t ≤ T ≤ t) = 2π(t) − 1'],
      ['Seuils usuels', '2π(t) − 1 = 0,90 → t = 1,645 ; 0,95 → 1,96 ; 0,99 → 2,576'],
      ['Approx. Poisson', 'n ≥ 30, p ≤ 0,1, np &lt; 15 : λ = np'],
      ['Approx. normale', 'n ≥ 30, np &gt; 5, np(1 − p) &gt; 5 : m = np, σ = √(np(1 − p))']
    ],
    methodes: [
      { h: 'Reconnaître la loi', steps: ['n épreuves identiques et indépendantes, deux issues, on compte les succès : binomiale ℬ(n, p). Justifie les trois points.', 'Événements rares sur une durée ou une zone (pannes par mois, défauts) : Poisson 𝒫(λ).', 'Rang du premier succès : géométrique.', 'Toutes les valeurs d\'un intervalle sont également probables : uniforme.', 'Durée de vie, MTBF, fiabilité : exponentielle.', 'Mesure physique (taille, masse, diamètre) ou binomiale avec n grand : normale.', 'Pour une approximation, écris toujours la phrase : « n = …, p = … et np = … donc on peut approcher par … de paramètre(s) … ».'] },
      { h: 'Loi normale en 4 lignes', steps: ['Écris ce que tu cherches : P(X ≤ a), P(X ≥ a) ou P(a ≤ X ≤ b).', 'Centre et réduis chaque borne : t = (x − m)/σ, arrondi à 0,01.', 'Lis π(|t|) dans la table ; applique 1 − … si t &lt; 0 ou si c\'est un « ≥ ».', 'Intervalle symétrique P(m − a ≤ X ≤ m + a) = p : 2π(a/σ) − 1 = p, puis lecture inverse de la table.'] },
      { h: 'Variable discrète', steps: ['Liste les valeurs possibles de X.', 'Calcule chaque P(X = x<sub>i</sub>) et vérifie que la somme vaut 1.', 'E(X) = Σx<sub>i</sub>p<sub>i</sub>, puis E(X²) = Σx<sub>i</sub>²p<sub>i</sub>.', 'V(X) = E(X²) − E(X)², σ = √V.', 'F(x) : cumule les probabilités dans l\'ordre croissant des valeurs.'] },
      { h: 'Fiabilité (loi exponentielle)', steps: ['λ = 1/MTBF.', 'Sans panne jusqu\'à t : R(t) = e<sup>−λt</sup>. Panne avant t : 1 − e<sup>−λt</sup>.', 'Durée pour une fiabilité donnée r : e<sup>−λt</sup> = r ⇒ t = −ln(r)/λ.', 'Montage en série : R<sub>1</sub> × R<sub>2</sub>. En parallèle : 1 − (1 − R<sub>1</sub>)(1 − R<sub>2</sub>).'] }
    ],
    pieges: [
      '<b>Binomiale :</b> P(X ≥ k) = 1 − P(X ≤ k − 1), pas 1 − P(X ≤ k).',
      '<b>V(aX + b) = a²V(X)</b> : le b disparaît et le a passe au carré.',
      '<b>Les écarts-types ne s\'additionnent pas :</b> σ(X + Y) = √(σ<sub>X</sub>² + σ<sub>Y</sub>²) si X et Y sont indépendantes.',
      '<b>Notation de la normale :</b> le poly écrit N(m ; σ²). N(50 ; 8²) donne σ = 8. Certains énoncés de type BTS écrivent N(30 ; 4) avec l\'écart-type : lis bien la phrase.',
      '<b>La table ne donne π(t) que pour t ≥ 0</b> : pour t négatif, π(−t) = 1 − π(t).',
      '<b>Loi continue :</b> P(X = a) = 0, donc P(X &lt; a) = P(X ≤ a).',
      '<b>Exponentielle :</b> la fiabilité est R(t) = e<sup>−λt</sup> (probabilité de durer plus que t). Le poly p. 35 a inversé F et R.'
    ],
    td: [
      { n: '0a', t: 'Entraînement : 16 calculs avec la loi normale', tags: 'table de N(0 ; 1)',
        e: '<p>Dans chaque cas, calculer la probabilité demandée avec la table de la loi normale centrée réduite. Résultat à 10<sup>−4</sup> près.</p><p class="small muted">La table est dans l\'onglet Tables. Ici les t tombent juste sur les valeurs de la table.</p>',
        q: normQ },
      { n: '0b', t: 'Entraînement : 14 calculs avec la loi de Poisson', tags: 'Poisson',
        e: '<p>Dans chaque cas, calculer la probabilité demandée, arrondie au millième. P(X = k) = e<sup>−λ</sup> λ<sup>k</sup> / k!</p>',
        q: poisQ },
      { n: 1, t: 'Quatre clés, une seule ouvre', tags: 'loi discrète · E · V',
        e: '<p>Une personne a 4 clés dont une seule ouvre la porte. Elle les essaie au hasard en éliminant celles qui ne marchent pas. X est le nombre d\'essais pour ouvrir.</p>',
        q: [
          { q: 'Calcule P(X = 2) (première clé fausse, deuxième bonne).', a: 0.25, d: 3, r: 'P(X = k) = 1/4 pour k = 1, 2, 3, 4',
            sol: ['P(X = 1) = 1/4.', 'P(X = 2) = 3/4 × 1/3 = 1/4 (première fausse parmi 4, puis la bonne parmi les 3 restantes).', 'De même P(X = 3) = 3/4 × 2/3 × 1/2 = 1/4 et P(X = 4) = 1/4 : la loi est uniforme sur {1, 2, 3, 4}.'] },
          { q: 'E(X), avec P(X = k) = 1/4 pour k = 1, 2, 3, 4 ?', a: 2.5, d: 2, r: 'E(X) = 2,5',
            sol: ['E(X) = (1 + 2 + 3 + 4) / 4 = 2,5.'] },
          { q: 'Var(X) ? (E(X) = 2,5)', a: 1.25, d: 3, r: 'V(X) = 1,25',
            sol: ['E(X²) = (1 + 4 + 9 + 16) / 4 = 7,5.', 'V(X) = 7,5 − 2,5² = 7,5 − 6,25 = 1,25.'] }
        ] },
      { n: 2, t: 'Classes de revenu du fisc', tags: 'fonction de répartition · E · V',
        e: `<p>Le fisc répartit les ménages en 5 classes de revenu (année 2025). X est la classe d'appartenance d'un ménage pris au hasard.</p>${tbl([['Classe', '1', '2', '3', '4', '5', 'Total'], ['Ménages', '19 000', '45 000', '28 000', '9 000', '2 000', '103 000']], { side: true })}`,
        q: [
          { q: 'Fonction de répartition : donne F(3) = P(X ≤ 3) à 10<sup>−4</sup>.', a: 0.8932, d: 4, r: 'F : 0,1845 ; 0,6214 ; 0,8932 ; 0,9806 ; 1',
            sol: ['Loi : P(X = k) = effectif / 103 000 : 0,1845 ; 0,4369 ; 0,2718 ; 0,0874 ; 0,0194.', 'F(3) = (19 000 + 45 000 + 28 000) / 103 000 = 92 000 / 103 000 ≈ 0,8932.',
              tbl([['x', 'x &lt; 1', '[1 ; 2[', '[2 ; 3[', '[3 ; 4[', '[4 ; 5[', 'x ≥ 5'], ['F(x)', '0', '0,1845', '0,6214', '0,8932', '0,9806', '1']], { side: true })] },
          { q: 'P(2 ≤ X ≤ 4) et P(X &gt; 4), à 10<sup>−4</sup> ?', a: [0.7961, 0.0194], l: ['P(2 ≤ X ≤ 4)', 'P(X > 4)'], d: 4, r: 'P(2 ≤ X ≤ 4) ≈ 0,7961 ; P(X &gt; 4) ≈ 0,0194',
            sol: ['P(2 ≤ X ≤ 4) = (45 000 + 28 000 + 9 000) / 103 000 = 82 000 / 103 000 ≈ 0,7961.', 'P(X &gt; 4) = P(X = 5) = 2 000 / 103 000 ≈ 0,0194.'] },
          { q: 'E(X) et Var(X) ? (Σ k × effectif = 239 000 ; Σ k² × effectif = 645 000 ; total 103 000)', a: [2.3204, 0.8779], l: ['E(X)', 'V(X)'], tol: 0.001, r: 'E(X) ≈ 2,320 ; V(X) ≈ 0,878',
            sol: ['E(X) = 239 000 / 103 000 ≈ 2,3204.', 'E(X²) = 645 000 / 103 000 ≈ 6,2621.', 'V(X) = 6,2621 − 2,3204² ≈ 0,8779.'] }
        ] },
      { n: 3, t: 'Le feu vert : binomiale vers normale', tags: 'binomiale · approximation normale',
        e: '<p>À un carrefour, le feu est vert avec probabilité 0,4, rouge 0,5, orange 0,1. M. Germain passe devant ce feu 250 jours par an, de façon indépendante. X est le nombre de jours où il trouve le feu vert.</p>',
        q: [
          { q: 'Quelle loi suit X ?', c: ['ℬ(250 ; 0,4)', '𝒫(0,4)', 'ℬ(250 ; 0,6)', 'N(250 ; 0,4)'], a: 0, r: 'X ∼ ℬ(250 ; 0,4)',
            sol: ['250 épreuves identiques et indépendantes, deux issues (vert / pas vert), succès de probabilité 0,4 : X ∼ ℬ(250 ; 0,4).'] },
          { q: 'On approche X par X<sub>1</sub> de loi normale. Justifie m = 100 et σ ≈ 7,75 : donne σ à 10<sup>−2</sup>.', a: 7.75, d: 2, r: 'm = 100 ; σ ≈ 7,75',
            sol: ['m = np = 250 × 0,4 = 100.', 'σ = √(np(1 − p)) = √(250 × 0,4 × 0,6) = √60 ≈ 7,75.', 'Conditions : n = 250 ≥ 30, np = 100 &gt; 5, np(1 − p) = 60 &gt; 5.'] },
          { q: 'P(X<sub>1</sub> ≤ 80) au millième, avec m = 100 et σ = 7,75 ?', a: 0.005, d: 3, r: 'P(X<sub>1</sub> ≤ 80) ≈ 0,005',
            sol: ['t = (80 − 100) / 7,75 ≈ −2,58.', 'P = 1 − π(2,58) = 1 − 0,9951 = 0,0049 ≈ 0,005.'] },
          { q: 'P(90 ≤ X<sub>1</sub> ≤ 110) au millième ?', a: 0.803, d: 3, r: 'P(90 ≤ X<sub>1</sub> ≤ 110) ≈ 0,803',
            sol: ['t = ±10 / 7,75 ≈ ±1,29.', 'P = 2π(1,29) − 1 = 2 × 0,9015 − 1 = 0,803.'] },
          { q: 'Réel a tel que P(100 − a ≤ X<sub>1</sub> ≤ 100 + a) = 0,95, arrondi à l\'entier ? Interprète.', a: 15, d: 0, r: 'a ≈ 15',
            sol: ['2π(a/σ) − 1 = 0,95 ⇒ π(a/σ) = 0,975 ⇒ a/σ = 1,96.', 'a = 1,96 × 7,75 ≈ 15,19 ≈ 15.', 'Il y a 95 % de chances que M. Germain trouve le feu vert entre 85 et 115 jours dans l\'année.'] }
        ] },
      { n: 4, t: 'Soudures : binomiale vers Poisson', tags: 'binomiale · approximation de Poisson',
        e: '<p>Chaque point de soudure est défectueux avec probabilité 0,001. Un composant nécessite 300 points de soudure, défectueux ou non de façon indépendante. X est le nombre de soudures défectueuses d\'un composant. Probabilités au millième.</p>',
        q: [
          { q: 'Loi suivie par X ?', c: ['ℬ(300 ; 0,001)', '𝒫(300)', 'ℬ(0,001 ; 300)', 'N(0,3 ; 0,3)'], a: 0, r: 'X ∼ ℬ(300 ; 0,001)',
            sol: ['300 soudures identiques et indépendantes, défectueuse ou non, p = 0,001 : X ∼ ℬ(300 ; 0,001).'] },
          { q: 'P(X ≥ 1) au millième, avec X ∼ ℬ(300 ; 0,001) ?', a: 0.259, d: 3, r: 'P(X ≥ 1) ≈ 0,259',
            sol: ['P(X ≥ 1) = 1 − P(X = 0) = 1 − 0,999<sup>300</sup> ≈ 1 − 0,7407 = 0,259.'] },
          { q: 'On approche X par Y de loi de Poisson. Quel paramètre λ ?', a: 0.3, d: 2, r: 'Y ∼ 𝒫(0,3)',
            sol: ['n = 300 ≥ 30, p = 0,001 ≤ 0,1, np = 0,3 &lt; 15 : λ = np = 0,3.'] },
          { q: 'P(Y ≥ 3) au millième, avec Y ∼ 𝒫(0,3) ?', a: 0.004, d: 3, r: 'P(Y ≥ 3) ≈ 0,004',
            sol: ['P(Y ≥ 3) = 1 − P(Y ≤ 2) = 1 − e<sup>−0,3</sup>(1 + 0,3 + 0,045).', '= 1 − 0,7408 × 1,345 ≈ 1 − 0,9964 = 0,0036 ≈ 0,004.'] }
        ] },
      { n: 5, t: 'Composants défectueux : 150 puis 1 500', tags: 'binomiale · Poisson · normale',
        e: '<p>2 % des composants produits sont défectueux. Probabilités au millième.</p><p>1. Un client commande 150 composants (tirages indépendants avec remise). X : nombre de défectueux.</p><p>2. Une société commande 1 500 composants. Y : nombre de défectueux.</p>',
        q: [
          { q: 'Loi de X (150 composants, 2 % défectueux) ?', c: ['ℬ(150 ; 0,02)', '𝒫(150)', 'ℬ(150 ; 0,98)'], a: 0, r: 'X ∼ ℬ(150 ; 0,02)',
            sol: ['150 tirages indépendants avec remise, défectueux ou non, p = 0,02 : X ∼ ℬ(150 ; 0,02).'] },
          { q: 'Espérance et écart-type de X ∼ ℬ(150 ; 0,02) ?', a: [3, 1.715], l: ['E(X)', 'σ(X)'], d: [2, 3], r: 'E(X) = 3 ; σ ≈ 1,715',
            sol: ['E(X) = 150 × 0,02 = 3.', 'σ = √(150 × 0,02 × 0,98) = √2,94 ≈ 1,715.'] },
          { q: 'Probabilité que le lot contienne exactement 4 composants défectueux ?', a: 0.170, d: 3, r: 'P(X = 4) ≈ 0,170',
            sol: ['P(X = 4) = (<sup>150</sup><sub>4</sub>) × 0,02⁴ × 0,98<sup>146</sup> ≈ 0,170.'] },
          { q: 'On approche X par une loi de Poisson. Quel paramètre ?', a: 3, d: 2, r: 'Approximation 𝒫(3)',
            sol: ['n = 150 ≥ 30, p = 0,02 ≤ 0,1, np = 3 &lt; 15 : λ = np = 3.'] },
          { q: 'Avec 𝒫(3), probabilité que le lot contienne strictement plus de 4 défectueux ?', a: 0.185, d: 3, r: 'P(X &gt; 4) ≈ 0,185',
            sol: ['P(X &gt; 4) = 1 − P(X ≤ 4) = 1 − e<sup>−3</sup>(1 + 3 + 4,5 + 4,5 + 3,375).', '= 1 − 16,375 e<sup>−3</sup> ≈ 1 − 0,815 = 0,185.'] },
          { q: '1 500 composants : Y ∼ ℬ(1 500 ; 0,02). On l\'approche par une loi normale : moyenne et écart-type ?', a: [30, 5.42], l: ['m', 'σ'], d: [1, 2], r: 'Y ≈ N(30 ; 5,42²)',
            sol: ['n ≥ 30, np = 30 &gt; 5, np(1 − p) = 29,4 &gt; 5.', 'm = np = 30 ; σ = √29,4 ≈ 5,42.'] },
          { q: 'Approximation de P(Y ≤ 20) avec N(30 ; 5,42²) ?', a: 0.033, d: 3, r: 'P(Y ≤ 20) ≈ 0,033',
            sol: ['t = (20 − 30) / 5,42 ≈ −1,84.', 'P = 1 − π(1,84) = 1 − 0,9671 = 0,0329 ≈ 0,033.'] },
          { q: 'Avec l\'approximation normale, P(25 ≤ Y ≤ 35) ?', a: 0.642, d: 3, r: 'P(25 ≤ Y ≤ 35) ≈ 0,642',
            sol: ['t = ±5 / 5,42 ≈ ±0,92.', 'P = 2π(0,92) − 1 = 2 × 0,8212 − 1 = 0,6424 ≈ 0,642.'] }
        ] },
      { n: 6, t: 'Usages numériques au lycée', tags: 'binomiale · normale · Poisson', opt: true,
        e: '<p>I. 50 % des étudiants post-bac se connectent chaque jour à la plateforme depuis un ordinateur. On interroge 64 étudiants de façon indépendante ; X compte ceux qui se connectent.</p><p>II. 5 % des élèves pré-bac utilisent chaque jour un ordinateur du lycée hors cours. On interroge 100 élèves ; Y compte ces élèves. Probabilités au millième.</p>',
        q: [
          { q: 'X ∼ ℬ(64 ; 0,5) : espérance et écart-type ?', a: [32, 4], l: ['E(X)', 'σ(X)'], d: 2, r: 'E(X) = 32 ; σ = 4',
            sol: ['E = 64 × 0,5 = 32 ; σ = √(64 × 0,5 × 0,5) = √16 = 4.'] },
          { q: 'Avec l\'approximation N(32 ; 4²), probabilité qu\'au plus 36 étudiants se connectent ?', a: 0.841, d: 3, r: 'P(X ≤ 36) ≈ 0,841',
            sol: ['t = (36 − 32) / 4 = 1 ; P = π(1) = 0,8413 ≈ 0,841.'] },
          { q: 'Y ∼ ℬ(100 ; 0,05) : probabilité qu\'exactement 5 élèves utilisent un ordinateur du lycée ?', a: 0.180, d: 3, r: 'P(Y = 5) ≈ 0,180',
            sol: ['P(Y = 5) = (<sup>100</sup><sub>5</sub>) × 0,05⁵ × 0,95<sup>95</sup> ≈ 0,180.'] },
          { q: 'Approximation de Poisson de Y : paramètre, puis P(Y ≥ 3) ?', a: [5, 0.875], l: ['λ', 'P(Y ≥ 3)'], d: [1, 3], r: 'λ = 5 ; P(Y ≥ 3) ≈ 0,875',
            sol: ['λ = np = 100 × 0,05 = 5.', 'P(Y ≥ 3) = 1 − e<sup>−5</sup>(1 + 5 + 12,5) = 1 − 18,5 e<sup>−5</sup> ≈ 0,875.'] }
        ] },
      { n: 7, t: 'Troncs de sapins (suite du TD I)', tags: 'binomiale · Poisson · normale', opt: true,
        e: '<p>Un tronc présente au moins un défaut avec probabilité p = 0,06, indépendamment des autres. Les troncs sont vendus par lots de n ; Y compte les troncs défectueux d\'un lot. Probabilités à 10<sup>−4</sup>.</p>',
        q: [
          { q: 'Lot de 50 troncs : Y ∼ ℬ(50 ; 0,06). Calcule P(Y = 6).', a: 0.0487, d: 4, r: 'P(Y = 6) ≈ 0,0487',
            sol: ['50 troncs indépendants, défaut ou non, p = 0,06 : Y ∼ ℬ(50 ; 0,06).', 'P(Y = 6) = (<sup>50</sup><sub>6</sub>) × 0,06⁶ × 0,94<sup>44</sup> ≈ 0,0487.'] },
          { q: 'On approche Y par une loi de Poisson. Paramètre ?', a: 3, d: 2, r: 'λ = 3',
            sol: ['λ = np = 50 × 0,06 = 3.'] },
          { q: 'M. Landry affirme avoir plus de 90 % de chances d\'avoir au plus 5 troncs défectueux par lot. Calcule P(Y ≤ 5) avec 𝒫(3).', a: 0.9161, d: 4, r: 'P(Y ≤ 5) ≈ 0,9161 : il a raison',
            sol: ['P(Y ≤ 5) = e<sup>−3</sup>(1 + 3 + 4,5 + 4,5 + 3,375 + 2,025) = 18,4 e<sup>−3</sup> ≈ 0,9161.', '0,9161 &gt; 0,90 : il a raison.'] },
          { q: 'Lots de 450 troncs, Y ≈ N(27 ; 5²). Calcule P(Y ≤ 24).', a: 0.2743, d: 4, r: 'P(Y ≤ 24) ≈ 0,2743',
            sol: ['Paramètres : np = 450 × 0,06 = 27 ; √(np(1 − p)) = √25,38 ≈ 5,04 ≈ 5.', 't = (24 − 27) / 5 = −0,6 ; P = 1 − π(0,6) = 1 − 0,7257 = 0,2743.'] },
          { q: 'Avec N(27 ; 5²), calcule P(25 ≤ Y ≤ 31).', a: 0.4435, d: 4, r: 'P(25 ≤ Y ≤ 31) ≈ 0,4435',
            sol: ['Bornes : (25 − 27)/5 = −0,4 ; (31 − 27)/5 = 0,8.', 'P = π(0,8) − (1 − π(0,4)) = 0,7881 − 0,3446 = 0,4435.'] }
        ] },
      { n: 8, t: 'Fréquentation d\'une pharmacie', tags: 'binomiale · normale · somme', opt: true,
        e: '<p>Partie A. Un passant entre dans la pharmacie avec probabilité 0,15. On observe 40 usagers (tirage avec remise) ; X compte ceux qui entrent.</p><p>Partie B. Y, nombre de clients entre 18 h et 19 h, suit la loi normale N(30 ; 4). <em>Ici le 4 est l\'écart-type</em> (convention de l\'énoncé, différente du poly).</p><p>Partie C. Z<sub>1</sub> (clients par la galerie) suit N(20 ; 2), Z<sub>2</sub> (par le parking) suit N(15 ; 3), indépendantes (écarts-types 2 et 3).</p>',
        q: [
          { q: 'X ∼ ℬ(40 ; 0,15) : E(X), puis P(X = 0) et P(X ≥ 1) à 10<sup>−4</sup> ?', a: [6, 0.0015, 0.9985], l: ['E(X)', 'P(X = 0)', 'P(X ≥ 1)'], d: [1, 4, 4], r: 'E(X) = 6 ; P(X = 0) ≈ 0,0015',
            sol: ['E(X) = 40 × 0,15 = 6 : en moyenne 6 personnes sur 40 entrent.', 'P(X = 0) = 0,85<sup>40</sup> ≈ 0,0015 ; P(X ≥ 1) = 1 − 0,0015 = 0,9985.'] },
          { q: 'P(Y ≥ 34) et P(26 ≤ Y ≤ 34), avec m = 30 et σ = 4 ?', a: [0.1587, 0.6826], l: ['P(Y ≥ 34)', 'P(26 ≤ Y ≤ 34)'], d: 4, r: 'P(Y ≥ 34) = 0,1587 ; P(26 ≤ Y ≤ 34) = 0,6826',
            sol: ['t = (34 − 30)/4 = 1 : P(Y ≥ 34) = 1 − π(1) = 0,1587.', 'P(26 ≤ Y ≤ 34) = 2π(1) − 1 = 0,6826.'] },
          { q: 'Réel a tel que P(Y ≥ a) = 0,04 (valeur la plus proche dans la table), arrondi à l\'entier ?', a: 37, d: 0, r: 'a ≈ 37',
            sol: ['P(Y ≥ a) = 0,04 ⇒ π(t) = 0,96 ; la table donne π(1,75) = 0,9599, la plus proche.', 'a = 30 + 4 × 1,75 = 37 : il y a 4 % de chances qu\'au moins 37 clients entrent entre 18 h et 19 h.'] },
          { q: 'Z = Z<sub>1</sub> + Z<sub>2</sub> suit une loi normale : moyenne et écart-type ?', a: [35, 3.61], l: ['moyenne', 'écart-type'], d: [1, 2], r: 'Z ∼ N(35 ; 3,61²)',
            sol: ['Z compte tous les clients entrés entre 18 h et 19 h.', 'E(Z) = 20 + 15 = 35. Indépendance : V(Z) = 2² + 3² = 13, σ = √13 ≈ 3,61.'] }
        ] },
      { n: 9, t: 'Lois uniformes sur [−2 ; 8] et [0 ; 4]', tags: 'uniforme',
        e: '<p>I. U suit la loi uniforme sur [−2 ; 8]. II. X suit la loi uniforme sur [0 ; 4].</p>',
        q: [
          { q: 'Densité de U ∼ 𝒰[−2 ; 8] : valeur de f(x) pour x dans [−2 ; 8] ?', a: 0.1, d: 3, r: 'f(x) = 1/10 sur [−2 ; 8], 0 ailleurs',
            sol: ['f(x) = 1/(b − a) = 1/(8 − (−2)) = 1/10 sur [−2 ; 8], et 0 en dehors.'] },
          { q: 'P(U ∈ [0 ; 3]), P(−1 ≤ U ≤ 4), P(U ≤ 5), P(U = 2) ?', a: [0.3, 0.5, 0.7, 0], l: ['P(U ∈ [0 ; 3])', 'P(−1 ≤ U ≤ 4)', 'P(U ≤ 5)', 'P(U = 2)'], d: 3,
            sol: ['Longueur de l\'intervalle / 10 : 3/10 = 0,3 ; 5/10 = 0,5.', 'P(U ≤ 5) = (5 − (−2))/10 = 0,7. P(U = 2) = 0 (loi continue).'] },
          { q: 'E(U) ? Interprète.', a: 3, d: 2, r: 'E(U) = 3',
            sol: ['E(U) = (−2 + 8)/2 = 3 : sur un grand nombre de tirages, la moyenne des valeurs est proche de 3, le milieu de l\'intervalle.'] },
          { q: 'X ∼ 𝒰[0 ; 4] : P(X ∈ [1 ; 3]), P(X ≤ 2,5), P(0,2 ≤ X ≤ 3,5) ?', a: [0.5, 0.625, 0.825], l: ['P(X ∈ [1 ; 3])', 'P(X ≤ 2,5)', 'P(0,2 ≤ X ≤ 3,5)'], d: 3,
            sol: ['2/4 = 0,5 ; 2,5/4 = 0,625 ; 3,3/4 = 0,825.'] },
          { q: 'X ∼ 𝒰[0 ; 4] : P(X ≤ 1), P(X = 1), P(X &gt; 1) ?', a: [0.25, 0, 0.75], l: ['P(X ≤ 1)', 'P(X = 1)', 'P(X > 1)'], d: 3,
            sol: ['P(X ≤ 1) = 1/4 = 0,25 ; P(X = 1) = 0 ; P(X &gt; 1) = 1 − 0,25 = 0,75.'] }
        ] },
      { n: 10, t: 'Standard téléphonique : attente uniforme', tags: 'uniforme · E · V',
        e: '<p>La durée d\'attente T (en secondes) d\'un appel suit la loi uniforme sur [10 ; 60].</p>',
        q: [
          { q: 'Densité de T : valeur de f(t) sur [10 ; 60] ?', a: 0.02, d: 3, r: 'f(t) = 1/50 sur [10 ; 60]',
            sol: ['f(t) = 1/(60 − 10) = 1/50 = 0,02 sur [10 ; 60], 0 ailleurs.'] },
          { q: 'P(A) : attente inférieure à 20 s ; P(B) : supérieure à 40 s ; P(C) : entre 20 et 40 s ?', a: [0.2, 0.4, 0.4], l: ['P(A)', 'P(B)', 'P(C)'], d: 3, r: 'P(A) = 0,2 ; P(B) = 0,4 ; P(C) = 0,4',
            sol: ['P(A) = (20 − 10)/50 = 0,2 ; P(B) = (60 − 40)/50 = 0,4 ; P(C) = (40 − 20)/50 = 0,4.'] },
          { q: 'E(T) ? Interprète.', a: 35, d: 1, u: 's', r: 'E(T) = 35 s',
            sol: ['E(T) = (10 + 60)/2 = 35 s : en moyenne, l\'attente dure 35 secondes.'] },
          { q: 'V(T) et σ(T) ?', a: [208.33, 14.43], l: ['V(T)', 'σ(T)'], d: 2, r: 'V(T) ≈ 208,33 ; σ ≈ 14,43 s',
            sol: ['V(T) = (60 − 10)²/12 = 2 500/12 ≈ 208,33.', 'σ = √208,33 ≈ 14,43 s.'] }
        ] },
      { n: 11, t: 'Erreurs d\'arrondi', tags: 'uniforme centrée', opt: true,
        e: '<p>y est la valeur de x arrondie à l\'unité, et e = x − y est l\'erreur d\'arrondi. X est l\'erreur d\'arrondi d\'un réel tiré au hasard : X suit la loi uniforme sur [−0,5 ; 0,5[.</p>',
        q: [
          { q: 'Donne y et e pour x = 4,23 ; 3,6 ; 4,004 ; 3,999 ; 4,499 ; 3,5.',
            sol: [tbl([['x', '4,23', '3,6', '4,004', '3,999', '4,499', '3,5'], ['y', '4', '4', '4', '4', '4', '4'], ['e = x − y', '0,23', '−0,4', '0,004', '−0,001', '0,499', '−0,5']], { side: true })] },
          { q: 'Densité de X sur [−0,5 ; 0,5[ ? Puis P(X = 0), P(X &lt; 0), P(X &gt; 0).', a: [1, 0, 0.5, 0.5], l: ['f(x)', 'P(X = 0)', 'P(X < 0)', 'P(X > 0)'], d: 3,
            sol: ['f(x) = 1/(0,5 − (−0,5)) = 1 sur l\'intervalle.', 'P(X = 0) = 0 ; P(X &lt; 0) = 0,5 ; P(X &gt; 0) = 0,5.'] },
          { q: 'P(X ∈ [−0,25 ; 0,2]), P(|X| ≤ 0,1), P(|X| ≤ 0,01) ?', a: [0.45, 0.2, 0.02], l: ['[−0,25 ; 0,2]', '|X| ≤ 0,1', '|X| ≤ 0,01'], d: 3,
            sol: ['0,45 × 1 = 0,45 ; |X| ≤ 0,1 ⇔ X ∈ [−0,1 ; 0,1] : 0,2 ; de même 0,02.'] },
          { q: 'E(X) ? Pouvait-on le prévoir ?', a: 0, d: 2, r: 'E(X) = 0',
            sol: ['E(X) = (−0,5 + 0,5)/2 = 0.', 'Prévisible par symétrie : en moyenne, les erreurs d\'arrondi se compensent.'] }
        ] },
      { n: 12, t: 'Durée de téléchargement uniforme', tags: 'uniforme · conditionnelle',
        e: '<p>La durée T (secondes) d\'un téléchargement suit la loi uniforme sur [4 ; 16].</p>',
        q: [
          { q: 'Densité de T : valeur de f(t) sur [4 ; 16] (à 10<sup>−4</sup>) ?', a: 1 / 12, d: 4, r: 'f(t) = 1/12 sur [4 ; 16]',
            sol: ['f(t) = 1/(16 − 4) = 1/12 ≈ 0,0833.'] },
          { q: 'P(T ≤ 7), P(T &gt; 10), P(6 ≤ T ≤ 12), P(T = 8) ?', a: [0.25, 0.5, 0.5, 0], l: ['P(T ≤ 7)', 'P(T > 10)', 'P(6 ≤ T ≤ 12)', 'P(T = 8)'], d: 3, r: 'P(T &gt; 8) = 8/12',
            sol: ['3/12 = 0,25 ; 6/12 = 0,5 ; 6/12 = 0,5 ; P(T = 8) = 0.'] },
          { q: 'Sachant que le téléchargement dure plus de 8 s, probabilité qu\'il dure moins de 14 s ?', a: 0.75, d: 3, r: 'P<sub>T &gt; 8</sub>(T &lt; 14) = 0,75',
            sol: ['P(8 &lt; T &lt; 14) = 6/12 ; P(T &gt; 8) = 8/12.', 'P = (6/12)/(8/12) = 6/8 = 0,75.'] },
          { q: 'E(T), V(T) et σ(T) ?', a: [10, 12, 3.46], l: ['E(T)', 'V(T)', 'σ(T)'], d: [1, 2, 2], r: 'E(T) = 10 s ; σ ≈ 3,46 s',
            sol: ['E(T) = (4 + 16)/2 = 10 s : durée moyenne d\'un téléchargement.', 'V(T) = (16 − 4)²/12 = 12 ; σ = √12 ≈ 3,46 s.'] }
        ] },
      { n: 13, t: 'Garantie après réparation : MTBF de 500 jours', tags: 'exponentielle · fiabilité',
        e: '<p>La durée de bon fonctionnement X (jours) d\'un appareil réparé suit une loi exponentielle. La moyenne des durées est 500 jours. Probabilités au centième, durées au jour.</p>' + EXPO_FIG,
        q: [
          { q: 'Montre que λ = 0,002 (moyenne 500 jours).', a: 0.002, d: 4, r: 'λ = 0,002',
            sol: ['Pour une loi exponentielle, E(X) = 1/λ = 500, donc λ = 1/500 = 0,002.'] },
          { q: 'Probabilité qu\'un appareil n\'ait pas de défaillance dans l\'année (365 jours) qui suit la réparation ?', a: 0.48, d: 2, r: 'P(X &gt; 365) ≈ 0,48',
            sol: ['P(X &gt; 365) = e<sup>−0,002 × 365</sup> = e<sup>−0,73</sup> ≈ 0,48.'] },
          { q: 'Probabilité qu\'il tombe en panne dans les deux années (730 jours) qui suivent ?', a: 0.77, d: 2, r: 'P(X ≤ 730) ≈ 0,77',
            sol: ['P(X ≤ 730) = 1 − e<sup>−0,002 × 730</sup> = 1 − e<sup>−1,46</sup> ≈ 1 − 0,232 = 0,77.'] },
          { q: 'Pour limiter à 6 % les retours sous garantie, quelle durée de garantie proposer (en jours) ?', a: 30, alt: [31, 30.94], tol: 0.06, u: 'jours', r: 'Garantie ≈ 30 jours',
            sol: ['On veut P(X ≤ t) = 0,06 : 1 − e<sup>−0,002t</sup> = 0,06 ⇒ e<sup>−0,002t</sup> = 0,94.', 't = −ln(0,94)/0,002 ≈ 30,94 jours.', 'Avec 30 jours, on reste sous 6 % ; avec 31 jours on dépasse très légèrement (6,01 %). Les corrigés acceptent souvent 31 en arrondissant.'] }
        ] },
      { n: 14, t: 'Circuits intégrés : MTBF de 100 000 h', tags: 'exponentielle · sans mémoire',
        e: '<p>La durée de vie T (heures) d\'un circuit intégré suit une loi exponentielle de paramètre λ. La MTBF vaut 100 000 heures. Probabilités au millième.</p>',
        q: [
          { q: 'Calcule λ (MTBF = 100 000 h).', a: 0.00001, tol: 1e-7, r: 'λ = 10<sup>−5</sup>',
            sol: ['λ = 1/MTBF = 1/100 000 = 0,00001 = 10<sup>−5</sup>.'] },
          { q: 'Probabilité qu\'un circuit n\'ait pas de défaillance pendant les 90 000 premières heures (λ = 10<sup>−5</sup>) ?', a: 0.407, d: 3, r: 'R(90 000) ≈ 0,407',
            sol: ['R(90 000) = e<sup>−10<sup>−5</sup> × 90 000</sup> = e<sup>−0,9</sup> ≈ 0,407.'] },
          { q: 'Durée de bon fonctionnement avec une fiabilité de 0,8, à l\'heure près ?', a: 22314, tol: 1.01, u: 'h', r: 't ≈ 22 314 h',
            sol: ['e<sup>−λt</sup> = 0,8 ⇒ t = −ln(0,8)/10<sup>−5</sup> ≈ 22 314 h.'] },
          { q: 'Probabilité qu\'un circuit fonctionne encore à 110 000 h, sachant qu\'il fonctionnait à 90 000 h ?', a: 0.819, d: 3, r: '≈ 0,819',
            hint: 'La loi exponentielle est sans mémoire.',
            sol: ['P<sub>T &gt; 90 000</sub>(T &gt; 110 000) = e<sup>−λ × 110 000</sup> / e<sup>−λ × 90 000</sup> = e<sup>−λ × 20 000</sup>.', '= e<sup>−0,2</sup> ≈ 0,819 : c\'est P(T &gt; 20 000), comme pour un circuit neuf.'] }
        ] },
      { n: 15, t: 'Composants en série et en parallèle', tags: 'exponentielle · montages', opt: true,
        e: '<p>La durée de vie T (heures) d\'un composant suit une loi exponentielle de paramètre λ. R est sa fonction de fiabilité, F sa fonction de défaillance. Deux composants identiques fonctionnent indépendamment. Un montage en série fonctionne si les deux fonctionnent ; en parallèle, si au moins un fonctionne.</p>',
        q: [
          { q: 'Expressions de R(t) et F(t) ?', c: ['R(t) = e<sup>−λt</sup> et F(t) = 1 − e<sup>−λt</sup>', 'R(t) = 1 − e<sup>−λt</sup> et F(t) = e<sup>−λt</sup>', 'R(t) = λe<sup>−λt</sup> et F(t) = 1 − λe<sup>−λt</sup>'], a: 0, r: 'R(t) = e<sup>−λt</sup> ; F(t) = 1 − e<sup>−λt</sup>',
            sol: ['R(t) = P(T &gt; t) = e<sup>−λt</sup> et F(t) = P(T ≤ t) = 1 − e<sup>−λt</sup>. (Le poly p. 35 les inverse.)'] },
          { q: 'Sachant R(2 000) = 0,8, calcule λ à la sixième décimale.', a: 0.000112, d: 6, r: 'λ ≈ 0,000112',
            sol: ['e<sup>−2 000λ</sup> = 0,8 ⇒ λ = −ln(0,8)/2 000 ≈ 0,000112.'] },
          { q: 'Avec λ = 0,00011 : MTBF (à l\'heure) et P(T &gt; 3 000) (au millième) ?', a: [9091, 0.719], l: ['MTBF (h)', 'P(T > 3 000)'], tol: 0.6, d: [0, 3], r: 'MTBF ≈ 9 091 h ; R(3 000) ≈ 0,719',
            sol: ['MTBF = 1/0,00011 ≈ 9 091 h.', 'P(T &gt; 3 000) = e<sup>−0,33</sup> ≈ 0,719.'] },
          { q: 'Montage en série puis en parallèle : probabilité de fonctionner au-delà de 3 000 h (R(3 000) ≈ 0,7189) ?', a: [0.517, 0.921], l: ['série', 'parallèle'], d: 3, r: 'série ≈ 0,517 ; parallèle ≈ 0,921',
            sol: ['Série : R² = 0,7189² ≈ 0,517.', 'Parallèle : 1 − (1 − 0,7189)² = 1 − 0,2811² ≈ 0,921.'] }
        ] }
    ]
  });
  /* tolérance des questions multi-valeurs de l'ex. 15 : MTBF à l'unité, proba au millième */
  var ex15 = OM.exos['3-15']; ex15.q[2].tol = undefined;
})();
