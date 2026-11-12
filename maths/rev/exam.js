/* Examens blancs : interro chapitres I–II (50 min) et sujet complet du DE (1 h 50). */
(function () {
  var H = OM.h, tbl = H.tbl, tree = H.tree, ov = H.ov;
  var PA = function (a, b) { return 'P<sub>' + a + '</sub>(' + b + ')'; };
  OM.exams = OM.exams || {};

  OM.exams.interro = {
    id: 'interro', title: 'Interro blanche : chapitres I et II', scope: 'chapitres I et II', duration: 50,
    blurb: 'Arbre et Bayes, série en classes, régression : le format probable de l\'interro.',
    intro: 'Trois exercices sur les chapitres I et II seulement. Calculatrice collège, pas de téléphone. Arrondis comme demandé.',
    parts: [
      { h: 'Exercice 1 · Probabilités (8 points)',
        e: '<p>Dans une entreprise, 40 % des postes de travail sont des portables (P), les autres sont des fixes (F). L\'antivirus détecte une menace (événement M) sur 15 % des portables et sur 5 % des fixes. On choisit un poste au hasard.</p>',
        q: [
          { pts: 1, q: 'Construis un arbre pondéré de la situation.', sol: ['P (0,4) puis M (0,15) / M̄ (0,85) ; F (0,6) puis M (0,05) / M̄ (0,95).'],
            fig: tree({ root: [{ l: 'P', p: '0,4', c: [{ l: 'M', p: '0,15' }, { l: '!M', p: '0,85' }] }, { l: 'F', p: '0,6', c: [{ l: 'M', p: '0,05' }, { l: '!M', p: '0,95' }] }] }) },
          { pts: 1.5, q: 'Calcule P(P ∩ M).', a: 0.06, d: 3, sol: ['P(P ∩ M) = P(P) × ' + PA('P', 'M') + ' = 0,4 × 0,15 = 0,06.'] },
          { pts: 1.5, q: 'Calcule P(M).', a: 0.09, d: 3, sol: ['Probabilités totales : P(M) = 0,06 + 0,6 × 0,05 = 0,06 + 0,03 = 0,09.'] },
          { pts: 2, q: 'Une menace est détectée. Probabilité que ce soit sur un portable (au millième) ?', a: 2 / 3, d: 3, sol: [PA('M', 'P') + ' = P(P ∩ M) / P(M) = 0,06 / 0,09 = 2/3 ≈ 0,667.'] },
          { pts: 1, q: 'Les événements P et M sont-ils indépendants ?', c: ['Oui', 'Non'], a: 1, sol: ['P(P) × P(M) = 0,4 × 0,09 = 0,036 ≠ P(P ∩ M) = 0,06 : pas indépendants.'] },
          { pts: 1, q: 'On choisit 3 postes au hasard, de façon indépendante (P(M) = 0,09 pour chacun). Probabilité qu\'au moins un ait une menace détectée (au millième) ?', a: 0.246, d: 3, sol: ['Contraire : aucun des trois, (1 − 0,09)³ = 0,91³ ≈ 0,7536.', '1 − 0,7536 ≈ 0,246.'] }
        ] },
      { h: 'Exercice 2 · Statistiques à une variable (6 points)',
        e: '<p>Temps de réponse (en ms) de 200 requêtes envoyées à un serveur :</p>' + tbl([['Temps (ms)', '[0 ; 20[', '[20 ; 40[', '[40 ; 60[', '[60 ; 80[', '[80 ; 120['], ['Effectif', '18', '46', '70', '42', '24']], { side: true }),
        q: [
          { pts: 1.5, q: 'Temps de réponse moyen ?', a: 52, d: 2, u: 'ms', sol: ['Centres : 10, 30, 50, 70, 100. Σn<sub>i</sub>c<sub>i</sub> = 180 + 1 380 + 3 500 + 2 940 + 2 400 = 10 400.', 'x̄ = 10 400 / 200 = 52 ms.'] },
          { pts: 1.5, q: 'Écart-type (à 10<sup>−2</sup>) ?', a: 24.82, d: 2, u: 'ms', sol: ['Σn<sub>i</sub>c<sub>i</sub>² = 1 800 + 41 400 + 175 000 + 205 800 + 240 000 = 664 000.', 'V = 664 000 / 200 − 52² = 3 320 − 2 704 = 616 ; σ = √616 ≈ 24,82 ms.'] },
          { pts: 1.5, q: 'Médiane par interpolation linéaire (à 10<sup>−2</sup>) ?', a: 50.29, d: 2, u: 'ms', sol: ['N/2 = 100 ; ECC : 18, 64, 134… La classe médiane est [40 ; 60[.', 'Me = 40 + (100 − 64)/70 × 20 ≈ 40 + 10,29 = 50,29 ms.'] },
          { pts: 1.5, q: 'Premier quartile Q<sub>1</sub> par interpolation (à 10<sup>−2</sup>) ?', a: 33.91, d: 2, u: 'ms', sol: ['N/4 = 50 ; l\'ECC passe de 18 à 64 dans [20 ; 40[.', 'Q<sub>1</sub> = 20 + (50 − 18)/46 × 20 ≈ 20 + 13,91 = 33,91 ms.'] }
        ] },
      { h: 'Exercice 3 · Statistiques à deux variables (6 points)',
        e: '<p>Charge du processeur x (en %) et temps de réponse y (en ms) d\'un serveur :</p>' + tbl([['x (%)', '10', '20', '30', '40', '50'], ['y (ms)', '52', '61', '68', '80', '89']], { side: true }),
        q: [
          { pts: 1, q: 'Covariance de x et y ?', a: 186, d: 1, sol: ['x̄ = 30 ; ȳ = 70.', 'Écarts : x − x̄ = −20, −10, 0, 10, 20 ; y − ȳ = −18, −9, −2, 10, 19 ; produits : 360, 90, 0, 100, 380.', 'Cov = 930 / 5 = 186.'] },
          { pts: 2, q: 'Droite des moindres carrés y = ax + b ?', a: [0.93, 42.1], l: ['a', 'b'], d: [2, 1], sol: ['Σ(x − x̄)² = 400 + 100 + 0 + 100 + 400 = 1 000.', 'a = 930 / 1 000 = 0,93 ; b = 70 − 0,93 × 30 = 42,1.'] },
          { pts: 1, q: 'Coefficient de corrélation r (à 10<sup>−3</sup>) ?', a: 0.997, d: 3, sol: ['Σ(y − ȳ)² = 324 + 81 + 4 + 100 + 361 = 870.', 'r = 930 / √(1 000 × 870) ≈ 0,997 : très forte liaison linéaire positive.'] },
          { pts: 1, q: 'Temps de réponse estimé pour une charge de 70 %, avec y = 0,93x + 42,1 ?', a: 107.2, d: 1, u: 'ms', sol: ['y = 0,93 × 70 + 42,1 = 65,1 + 42,1 = 107,2 ms.'] },
          { pts: 1, q: 'Un autre ajustement donne z = ln y = 0,012x + 3,9. On écrit y = B e<sup>0,012x</sup> : donne B à 10<sup>−2</sup>.', a: 49.4, d: 2, sol: ['y = e<sup>0,012x + 3,9</sup> = e<sup>3,9</sup> × e<sup>0,012x</sup> ; B = e<sup>3,9</sup> ≈ 49,40.'] }
        ] }
    ]
  };

  OM.exams.de = {
    id: 'de', title: 'Examen blanc du DE', scope: 'tout le cours', duration: 110,
    blurb: 'Un sujet complet sur les cinq chapitres, même durée que le DE du 11 décembre.',
    intro: 'Même durée que le DE (8 h 00 → 9 h 50). Calculatrice collège, pas de téléphone, réponses sur ta feuille puis dans les cases. Arrondis comme demandé.',
    parts: [
      { h: 'Exercice 1 · Probabilités (4 points)',
        e: '<p>Un filtre anti-spam analyse les mails d\'une entreprise. 30 % des mails reçus sont des spams (événement S). Le filtre marque comme spam (événement M) 95 % des spams et, par erreur, 4 % des mails légitimes. On choisit un mail au hasard.</p>',
        q: [
          { pts: 0.5, q: 'Construis un arbre pondéré de la situation.', sol: ['S (0,3) puis M (0,95) / M̄ (0,05) ; S̄ (0,7) puis M (0,04) / M̄ (0,96).'],
            fig: tree({ root: [{ l: 'S', p: '0,3', c: [{ l: 'M', p: '0,95' }, { l: '!M', p: '0,05' }] }, { l: '!S', p: '0,7', c: [{ l: 'M', p: '0,04' }, { l: '!M', p: '0,96' }] }] }) },
          { pts: 1, q: 'Calcule P(S ∩ M).', a: 0.285, d: 3, sol: ['P(S ∩ M) = 0,3 × 0,95 = 0,285.'] },
          { pts: 1, q: 'Calcule P(M).', a: 0.313, d: 3, sol: ['P(M) = 0,285 + 0,7 × 0,04 = 0,285 + 0,028 = 0,313.'] },
          { pts: 1, q: 'Un mail est marqué comme spam. Probabilité qu\'il soit légitime (au millième) ?', a: 0.089, d: 3, sol: [PA('M', ov('S')) + ' = P(' + ov('S') + ' ∩ M) / P(M) = 0,028 / 0,313 ≈ 0,089.'] },
          { pts: 0.5, q: 'Les événements S et M sont-ils indépendants ?', c: ['Oui', 'Non'], a: 1, sol: ['P(S) × P(M) = 0,3 × 0,313 = 0,0939 ≠ P(S ∩ M) = 0,285 : pas indépendants (heureusement pour un filtre).'] }
        ] },
      { h: 'Exercice 2 · Statistiques descriptives (5 points)',
        e: '<p><b>Partie A.</b> Durées de connexion (minutes) de 100 utilisateurs :</p>' + tbl([['Durée', '[0 ; 10[', '[10 ; 20[', '[20 ; 30[', '[30 ; 40[', '[40 ; 60['], ['Effectif', '12', '28', '35', '17', '8']], { side: true }) +
          '<p><b>Partie B.</b> Nombre d\'utilisateurs simultanés x (centaines) et temps de réponse y (ms) d\'un serveur :</p>' + tbl([['x', '1', '2', '3', '4', '5', '6'], ['y', '110', '125', '150', '165', '185', '205']], { side: true }),
        q: [
          { pts: 1, q: 'A. Durée moyenne de connexion ?', a: 23.5, d: 2, u: 'min', sol: ['Centres 5, 15, 25, 35, 50 : Σn<sub>i</sub>c<sub>i</sub> = 60 + 420 + 875 + 595 + 400 = 2 350.', 'x̄ = 2 350 / 100 = 23,5 min.'] },
          { pts: 1, q: 'A. Écart-type (à 10<sup>−2</sup>) ?', a: 11.86, d: 2, u: 'min', sol: ['Σn<sub>i</sub>c<sub>i</sub>² = 300 + 6 300 + 21 875 + 20 825 + 20 000 = 69 300.', 'V = 693 − 23,5² = 140,75 ; σ ≈ 11,86 min.'] },
          { pts: 1, q: 'A. Durée médiane (à 10<sup>−2</sup>) ?', a: 22.86, d: 2, u: 'min', sol: ['N/2 = 50 ; ECC : 12, 40, 75… Classe médiane [20 ; 30[.', 'Me = 20 + (50 − 40)/35 × 10 ≈ 22,86 min.'] },
          { pts: 1, q: 'B. Droite des moindres carrés y = ax + b : a et b à 10<sup>−2</sup>.', a: [19.14, 89.67], l: ['a', 'b'], d: 2, sol: ['x̄ = 3,5 ; ȳ ≈ 156,67 ; Σ(x − x̄)(y − ȳ) = 335 ; Σ(x − x̄)² = 17,5.', 'a = 335 / 17,5 ≈ 19,14 ; b = 156,67 − 19,143 × 3,5 ≈ 89,67.'] },
          { pts: 0.5, q: 'B. Coefficient de corrélation r (à 10<sup>−3</sup>) ?', a: 0.998, d: 3, sol: ['Σ(y − ȳ)² ≈ 6 433,33 ; r = 335 / √(17,5 × 6 433,33) ≈ 0,998 : ajustement affine justifié.'] },
          { pts: 0.5, q: 'B. Temps de réponse estimé pour 800 utilisateurs simultanés (x = 8), à 0,1 ms ?', a: 242.8, tol: 0.15, u: 'ms', sol: ['y = 19,143 × 8 + 89,667 ≈ 242,8 ms.'] }
        ] },
      { h: 'Exercice 3 · Variables aléatoires (6 points)',
        e: '<p><b>Partie A.</b> Chaque requête reçue par un serveur échoue avec probabilité 0,02, indépendamment des autres. On observe 200 requêtes ; X compte les échecs.</p><p><b>Partie B.</b> La durée de traitement D d\'une requête (ms) suit la loi normale N(80 ; 6²).</p><p><b>Partie C.</b> La durée de vie d\'un disque (heures) suit une loi exponentielle de MTBF 40 000 h.</p>',
        q: [
          { pts: 0.5, q: 'A. Loi de X ?', c: ['ℬ(200 ; 0,02)', '𝒫(200)', 'N(4 ; 3,92)'], a: 0, sol: ['200 épreuves identiques et indépendantes à deux issues, p = 0,02 : X ∼ ℬ(200 ; 0,02).'] },
          { pts: 1, q: 'A. P(X = 3) (au millième) ?', a: 0.196, d: 3, sol: ['(<sup>200</sup><sub>3</sub>) × 0,02³ × 0,98<sup>197</sup> ≈ 0,196.'] },
          { pts: 1, q: 'A. Avec l\'approximation de Poisson (à justifier), calcule P(X ≤ 2) au millième.', a: 0.238, d: 3, sol: ['n = 200 ≥ 30, p ≤ 0,1, np = 4 &lt; 15 : λ = 4.', 'P(X ≤ 2) = e<sup>−4</sup>(1 + 4 + 8) = 13 e<sup>−4</sup> ≈ 0,238.'] },
          { pts: 1, q: 'B. P(D ≤ 89) à 10<sup>−4</sup> ?', a: 0.9332, d: 4, sol: ['t = (89 − 80)/6 = 1,5 ; P = π(1,5) = 0,9332.'] },
          { pts: 1, q: 'B. P(74 ≤ D ≤ 92) à 10<sup>−4</sup> ?', a: 0.8185, d: 4, sol: ['Bornes : −1 et 2.', 'P = π(2) − (1 − π(1)) = 0,9772 − 0,1587 = 0,8185.'] },
          { pts: 0.5, q: 'C. Paramètre λ de la loi exponentielle ?', a: 0.000025, tol: 1e-7, sol: ['λ = 1/40 000 = 2,5 × 10<sup>−5</sup>.'] },
          { pts: 1, q: 'C. Probabilité que le disque fonctionne encore après 10 000 h (au millième) ?', a: 0.779, d: 3, sol: ['R(10 000) = e<sup>−10 000/40 000</sup> = e<sup>−0,25</sup> ≈ 0,779.'] }
        ] },
      { h: 'Exercice 4 · Statistiques inférentielles (3 points)',
        e: '<p><b>Partie A.</b> Sur un échantillon de 225 sessions, la durée moyenne est 42 min. On admet que l\'écart-type de la population est σ = 15 min.</p><p><b>Partie B.</b> Un générateur doit tirer 1, 2, 3 ou 4 avec la même probabilité. Sur 120 tirages : 25 fois 1, 35 fois 2, 28 fois 3, 32 fois 4.</p>',
        q: [
          { pts: 1.5, q: 'A. Intervalle de confiance à 95 % de la durée moyenne (bornes à 10<sup>−2</sup>) ?', a: [40.04, 43.96], l: ['borne basse', 'borne haute'], d: 2, sol: ['σ/√n = 15/15 = 1 ; marge = 1,96 × 1 = 1,96.', 'IC = [40,04 ; 43,96].'] },
          { pts: 1, q: 'B. Calcule χ² (à 10<sup>−2</sup>).', a: 1.93, d: 2, sol: ['Effectif attendu : 120/4 = 30.', 'χ² = (25 + 25 + 4 + 4)/30 = 58/30 ≈ 1,93.'] },
          { pts: 0.5, q: 'B. Conclusion au seuil de 5 % (3 ddl, valeur critique 7,815) ?', c: ['On rejette l\'équiprobabilité', 'On ne rejette pas l\'équiprobabilité'], a: 1, sol: ['1,93 ≤ 7,815 : rien ne permet de dire que le générateur est biaisé.'] }
        ] },
      { h: 'Exercice 5 · Matrices (2 points)',
        e: '<p>A = ((4, 1), (2, 3)) et B = ((1, 2, 0), (3, −1, 2), (0, 1, 4)), écrites ligne par ligne.</p>',
        q: [
          { pts: 1, q: 'Valeurs propres de A (de la plus grande à la plus petite) ?', a: [5, 2], l: ['λ₁', 'λ₂'], d: 0, sol: ['Det(A − λI) = (4 − λ)(3 − λ) − 2 = λ² − 7λ + 10 = (λ − 5)(λ − 2).', 'Contrôle : 5 + 2 = 7 = Tr(A) ; 5 × 2 = 10 = Det(A).'] },
          { pts: 1, q: 'Déterminant de B (Sarrus) ?', a: -30, d: 0, sol: ['Descendantes : 1 × (−1) × 4 + 2 × 2 × 0 + 0 × 3 × 1 = −4.', 'Montantes : 0 × (−1) × 0 + 1 × 2 × 1 + 2 × 3 × 4 = 26.', 'Det(B) = −4 − 26 = −30.'] }
        ] }
    ]
  };
  OM.exam = OM.exams.de;
})();
