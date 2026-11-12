/* Chapitre I — Fondamentaux des probabilités (poly p. 5–9, TD séances 1–2). */
(function () {
  var H = OM.h, F = H.F, ov = H.ov, tbl = H.tbl, tree = H.tree, MB = H.MB;
  var PA = function (a, b) { return 'P<sub>' + a + '</sub>(' + b + ')'; };
  OM.errata = OM.errata || [];
  OM.errata.push('<b>TD II, exercice 8 :</b> le tableau imprime 19 845 500 pour la classe [1040 ; 1060[. La bonne valeur est 18 × 1050² = 19 845 000. Le total 90 099 200 est juste.');

  var CARTES = '<p>Rappel : un jeu de 32 cartes a 4 couleurs de 8 cartes (7, 8, 9, 10, valet, dame, roi, as). Cœur et carreau sont rouges, pique et trèfle sont noirs. Les figures sont valet, dame, roi : il y en a 12.</p>';
  var CHOIX = ['Indépendants, pas incompatibles', 'Indépendants et incompatibles', 'Pas indépendants, pas incompatibles', 'Pas indépendants, incompatibles'];

  OM.chapter({
    id: 1, num: 'I', short: 'Probabilités', title: 'Fondamentaux des probabilités', pages: 'poly p. 5–9', sessions: 'séances 1 et 2',
    summary: 'Vocabulaire, calcul des probabilités, probabilités conditionnelles, arbres, Bayes, indépendance, loi des grands nombres.',
    intro: 'Le chapitre le plus « rentable » du DE : presque chaque sujet commence par un arbre, des probabilités totales et une formule de Bayes.',
    cours: [
      { h: 'Vocabulaire', html: `
        <p>Une <strong>expérience aléatoire</strong> (ou épreuve aléatoire) a des résultats possibles connus, mais on ne peut pas prévoir lequel sortira. Exemple : jet de dé.</p>
        <ul>
          <li>Une <strong>issue</strong> (un résultat) est un élément ω de l'<strong>univers</strong> Ω, l'ensemble de tous les résultats possibles.</li>
          <li>Un <strong>événement</strong> est une partie de Ω : à la fin de l'expérience, on sait s'il est réalisé ou non. L'ensemble des événements est l'ensemble des parties 𝒫(Ω).</li>
          <li>Un <strong>événement élémentaire</strong> ne contient qu'une seule issue.</li>
        </ul>
        <p class="def"><strong>Opérations</strong> : A ⊂ B (tous les éléments de A sont dans B) ; A ∪ B (A <em>ou</em> B) ; A ∩ B (A <em>et</em> B) ; le contraire ${ov('A')} se réalise quand A ne se réalise pas, avec A ∩ ${ov('A')} = ∅ et A ∪ ${ov('A')} = Ω.</p>
        <p class="def">A et B sont <strong>incompatibles</strong> (disjoints) si A ∩ B = ∅ : ils ne peuvent pas se produire ensemble.</p>` },
      { h: 'Calcul des probabilités', html: `
        <p><strong>Définition</strong> (Ω fini) : une probabilité est une application P de 𝒫(Ω) dans [0 ; 1] telle que P(A) ≥ 0 pour tout A, P(Ω) = 1, et P(A ∪ B) = P(A) + P(B) quand A et B sont disjoints (vrai aussi pour n événements disjoints deux à deux).</p>
        <ul>
          <li>P(∅) = 0 et P(Ω) = 1.</li>
          <li>P(${ov('A')}) = 1 − P(A).</li>
          <li>Si A ⊂ B, alors P(A) ≤ P(B).</li>
          <li>Pour tous A, B : P(A ∪ B) = P(A) + P(B) − P(A ∩ B).</li>
          <li>Si A<sub>1</sub>, …, A<sub>n</sub> forment une partition de Ω (disjoints, de réunion Ω), les p<sub>i</sub> = P(A<sub>i</sub>) vérifient 0 ≤ p<sub>i</sub> ≤ 1 et Σ p<sub>i</sub> = 1.</li>
        </ul>
        <p><strong>Équiprobabilité</strong> : si les n issues ont la même probabilité, chacune vaut ${F('1', 'n')} et ${MB('P(A) = ' + F('nombre de cas favorables', 'nombre de cas possibles'))}</p>` },
      { h: 'Probabilité conditionnelle et arbres', html: `
        <p>La probabilité de B <em>sachant</em> A (avec P(A) ≠ 0) se note ${PA('A', 'B')} (anciennement P(B/A)) :</p>
        ${MB(PA('A', 'B') + ' = ' + F('P(A ∩ B)', 'P(A)') + '  donc  P(A ∩ B) = P(A) × ' + PA('A', 'B'))}
        <p>Sur un arbre pondéré : la somme des branches issues d'un même nœud vaut 1, et la probabilité d'un chemin est le <strong>produit</strong> des branches.</p>
        <p class="def"><strong>Probabilités totales</strong> : P(B) = P(A) × ${PA('A', 'B')} + P(${ov('A')}) × ${PA(ov('A'), 'B')}. Avec une partition en plus de deux événements, on additionne tous les chemins qui mènent à B.</p>
        <ul><li>${PA('A', 'Ω')} = 1.</li><li>${PA('A', 'B ∪ C')} = ${PA('A', 'B')} + ${PA('A', 'C')} si B et C sont incompatibles.</li></ul>
        <p class="def"><strong>Formule de Bayes</strong> (A et B de probabilités non nulles) : P(A ∩ B) = P(A) × ${PA('A', 'B')} = P(B) × ${PA('B', 'A')}, donc ${MB(PA('B', 'A') + ' = ' + F(PA('A', 'B') + ' × P(A)', 'P(B)'))}</p>` },
      { h: 'Événements indépendants', html: `
        <p class="def">A et B sont <strong>indépendants</strong> si et seulement si P(A ∩ B) = P(A) × P(B).</p>
        <ul>
          <li>Si P(A) ≠ 0 et P(B) ≠ 0 : indépendants ⇔ ${PA('A', 'B')} = P(B) ⇔ ${PA('B', 'A')} = P(A). Savoir que A est réalisé ne change pas la probabilité de B.</li>
          <li>Si A et B sont indépendants, A et ${ov('B')}, ${ov('A')} et B, ${ov('A')} et ${ov('B')} le sont aussi (rappelé dans le TD, exercice 6).</li>
          <li>À ne pas confondre : indépendants, c'est P(A ∩ B) = P(A) P(B) ; incompatibles, c'est P(A ∩ B) = 0.</li>
        </ul>` },
      { h: 'Loi faible des grands nombres', html: `
        <p>On lance un dé : la probabilité d'obtenir un nombre pair est p = ½. Si on répète l'expérience n fois et qu'on note la fréquence des résultats pairs, plus n est grand, plus cette fréquence se stabilise autour de ½.</p>
        <p class="def"><strong>Théorème</strong> : au cours de n expériences indépendantes, la fréquence d'apparition d'un événement A est aussi proche que l'on veut de sa probabilité p, pourvu que n soit assez grand.</p>
        <p>C'est ce résultat qui justifie l'estimation d'une proportion par une fréquence au chapitre IV.</p>` }
    ],
    formules: [
      ['Contraire', `P(${ov('A')}) = 1 − P(A)`],
      ['Réunion', 'P(A ∪ B) = P(A) + P(B) − P(A ∩ B)'],
      ['Équiprobabilité', 'P(A) = ' + F('cas favorables', 'cas possibles')],
      ['Conditionnelle', PA('A', 'B') + ' = ' + F('P(A ∩ B)', 'P(A)')],
      ['Intersection (chemin)', 'P(A ∩ B) = P(A) × ' + PA('A', 'B')],
      ['Probabilités totales', `P(B) = P(A) ${PA('A', 'B')} + P(${ov('A')}) ${PA(ov('A'), 'B')}`],
      ['Bayes', PA('B', 'A') + ' = ' + F('P(A) × ' + PA('A', 'B'), 'P(B)')],
      ['Indépendance', 'P(A ∩ B) = P(A) × P(B)'],
      ['Au moins un', '1 − P(aucun) ; pour n événements indépendants de probabilité p : 1 − (1 − p)<sup>n</sup>']
    ],
    methodes: [
      { h: 'Indépendants ? Incompatibles ?', steps: ['Calcule P(A), P(B) et P(A ∩ B).', 'Compare P(A ∩ B) avec le produit P(A) × P(B) : égalité ⇒ indépendants.', 'Regarde si A ∩ B est vide : oui ⇒ incompatibles.', 'Conclus séparément sur les deux questions.'] },
      { h: 'Arbre pondéré', steps: ['Nomme les événements avec les lettres de l\'énoncé.', 'Premier niveau : la partition (fixe / portable / tablette, vacciné / non vacciné…).', 'Deuxième niveau : l\'événement étudié, avec les probabilités « parmi les … ».', 'Vérifie que chaque groupe de branches issues d\'un nœud fait 1.'] },
      { h: 'Probabilités totales puis Bayes', steps: ['P(chemin) = produit des branches.', 'P(B) = somme de tous les chemins qui finissent par B.', '« Sachant B, quelle probabilité de A ? » : chemin A puis B, divisé par P(B).', 'Arrondis seulement à la fin, à la précision demandée.'] },
      { h: 'Tableau à double entrée', steps: ['Complète les totaux de lignes et de colonnes.', 'P(case) = effectif de la case / effectif total.', 'Probabilité « sachant » une ligne : effectif de la case / total de la ligne.'] }
    ],
    pieges: [
      '<b>Indépendants ≠ incompatibles.</b> Deux événements incompatibles de probabilités non nulles ne sont jamais indépendants.',
      `<b>${PA('A', 'B')} ≠ ${PA('B', 'A')}.</b> Ce qui suit « sachant que » va au dénominateur.`,
      '<b>« Au moins un »</b> se calcule par le contraire : 1 − P(aucun).',
      '<b>Arrondis.</b> Garde 4 ou 5 décimales dans les calculs, arrondis seulement la réponse finale.',
      '<b>Pourcentage d\'une sous-population.</b> « 2 % des drones à deux hélices » est une probabilité conditionnelle, pas P(A ∩ D).'
    ],
    td: [
      { n: 1, t: 'Cartes : indépendance ou incompatibilité', tags: 'indépendance · incompatibilité',
        e: `<p>On tire une carte dans un jeu de 32 cartes. Dans chacun des cas, dire si A et B sont indépendants, puis s'ils sont incompatibles.</p>${CARTES}`,
        q: [
          { q: 'Cas 1 : A « la carte est une figure », B « la carte est rouge ».', c: CHOIX, a: 0, r: 'Cas 1 : indépendants, pas incompatibles',
            sol: ['P(A) = 12/32 = 3/8 et P(B) = 16/32 = 1/2.', 'A ∩ B = les figures rouges : 6 cartes, donc P(A ∩ B) = 6/32 = 3/16.', 'P(A) × P(B) = 3/8 × 1/2 = 3/16 = P(A ∩ B) : indépendants.', 'A ∩ B n\'est pas vide : pas incompatibles.'] },
          { q: 'Cas 2 : A « la carte est noire », B « la carte est rouge ».', c: CHOIX, a: 3, r: 'Cas 2 : pas indépendants, incompatibles',
            sol: ['Une carte ne peut pas être noire et rouge : A ∩ B = ∅, P(A ∩ B) = 0. Incompatibles.', 'P(A) × P(B) = 1/2 × 1/2 = 1/4 ≠ 0 : pas indépendants.'] },
          { q: 'Cas 3 : A « la carte est un as », B « la carte est un trèfle ».', c: CHOIX, a: 0, r: 'Cas 3 : indépendants, pas incompatibles',
            sol: ['P(A) = 4/32 = 1/8 et P(B) = 8/32 = 1/4.', 'A ∩ B = l\'as de trèfle : P(A ∩ B) = 1/32.', '1/8 × 1/4 = 1/32 : indépendants. L\'as de trèfle existe : pas incompatibles.'] },
          { q: 'Cas 4 : A « la carte est rouge », B « la carte est un trèfle ».', c: CHOIX, a: 3, r: 'Cas 4 : pas indépendants, incompatibles',
            sol: ['Un trèfle est noir : A ∩ B = ∅. Incompatibles.', 'P(A) × P(B) = 1/2 × 1/4 = 1/8 ≠ 0 : pas indépendants.'] },
          { q: 'Cas 5 : A « la carte est noire », B « la carte est un trèfle ».', c: CHOIX, a: 2, r: 'Cas 5 : pas indépendants, pas incompatibles',
            sol: ['Tout trèfle est noir : B ⊂ A, donc A ∩ B = B et P(A ∩ B) = 1/4.', 'P(A) × P(B) = 1/2 × 1/4 = 1/8 ≠ 1/4 : pas indépendants.', 'A ∩ B = B n\'est pas vide : pas incompatibles.'] }
        ] },
      { n: 2, t: 'Sapins : deux défauts indépendants', tags: 'indépendance · réunion',
        e: `<p>Les sapins de la société JURABOIS peuvent présenter deux défauts invisibles, indépendants l'un de l'autre : I « défaut dû à un insecte », C « défaut dû à un champignon ». D est l'événement « le sapin présente au moins un défaut ».</p><p>P(I) = 0,0358 et P(C) = 0,0249. Les probabilités sont arrondies à la quatrième décimale.</p>`,
        q: [
          { q: 'Avec P(I) = 0,0358 et P(C) = 0,0249, calcule P(I ∩ C) (arrondi à 10<sup>−4</sup>).', a: 0.0009, d: 4, r: 'P(I ∩ C) = 0,00089142 ≈ 0,0009',
            hint: 'I et C sont indépendants : multiplie.', sol: ['I et C sont indépendants, donc P(I ∩ C) = P(I) × P(C).', '= 0,0358 × 0,0249 = 0,00089142 ≈ 0,0009.'] },
          { q: 'D = I ∪ C. Avec P(I) = 0,0358, P(C) = 0,0249 et P(I ∩ C) = 0,00089142, calcule P(D) (arrondi à 10<sup>−4</sup>).', a: 0.0598, d: 4, r: 'P(D) ≈ 0,0598',
            sol: ['« Au moins un défaut » = I ∪ C.', 'P(D) = P(I) + P(C) − P(I ∩ C) = 0,0358 + 0,0249 − 0,00089142 = 0,05980858 ≈ 0,0598.', 'Autre méthode : 1 − P(aucun défaut) = 1 − 0,9642 × 0,9751 = 0,0598.'] }
        ] },
      { n: 3, t: 'Composants : deux défauts', tags: 'indépendance · contraire',
        e: `<p>Un composant électronique peut présenter au maximum deux défauts indépendants. Défaut 1 (puce mal placée) : 2 % des composants. Défaut 2 (surdimensionné) : 5 %. Un composant avec au moins un défaut est hors d'usage, sans défaut il est conforme.</p><p>A : « le composant présente le défaut 1 » ; B : « il présente le défaut 2 ».</p>`,
        q: [
          { q: 'P(A) = 0,02, P(B) = 0,05, A et B indépendants. Probabilité que le composant ait les deux défauts ?', a: 0.001, d: 4, r: 'P(A ∩ B) = 0,001',
            sol: ['P(A ∩ B) = P(A) × P(B) = 0,02 × 0,05 = 0,001.'] },
          { q: 'Probabilité que le composant soit hors d\'usage, avec P(A) = 0,02, P(B) = 0,05 et P(A ∩ B) = 0,001 ?', a: 0.069, d: 4, r: 'P(hors d\'usage) = 0,069',
            sol: ['Hors d\'usage = au moins un défaut = A ∪ B.', 'P(A ∪ B) = 0,02 + 0,05 − 0,001 = 0,069.'] },
          { q: 'Probabilité que le composant soit conforme (sachant que P(hors d\'usage) = 0,069) ?', a: 0.931, d: 4, r: 'P(conforme) = 0,931',
            sol: ['Conforme = contraire de hors d\'usage : 1 − 0,069 = 0,931.', 'Vérification : 0,98 × 0,95 = 0,931 (aucun des deux défauts, indépendants).'] }
        ] },
      { n: 4, t: 'Ordinateurs reconditionnés', tags: 'arbre · probabilités totales · Bayes',
        e: `<p>Dans le stock d'un revendeur : 30 % d'ordinateurs fixes, 45 % de portables, le reste en tablettes. Sont reconditionnés : 38 % des fixes, 10 % des portables et 2 % des tablettes. On choisit un ordinateur au hasard.</p><p>F : fixe ; B : portable ; T : tablette ; R : reconditionné.</p>`,
        q: [
          { q: 'Résume la situation par un arbre pondéré.', r: 'P(F) = 0,30, P(B) = 0,45, P(T) = 0,25 ; P<sub>F</sub>(R) = 0,38, P<sub>B</sub>(R) = 0,10, P<sub>T</sub>(R) = 0,02',
            sol: ['Premier niveau : F (0,30), B (0,45), T (1 − 0,30 − 0,45 = 0,25).', 'Deuxième niveau : R ou R̄ avec 0,38 / 0,62 après F, 0,10 / 0,90 après B, 0,02 / 0,98 après T.'],
            fig: tree({ root: [{ l: 'F', p: '0,30', c: [{ l: 'R', p: '0,38' }, { l: '!R', p: '0,62' }] }, { l: 'B', p: '0,45', c: [{ l: 'R', p: '0,10' }, { l: '!R', p: '0,90' }] }, { l: 'T', p: '0,25', c: [{ l: 'R', p: '0,02' }, { l: '!R', p: '0,98' }] }] }) },
          { q: 'Avec P(F) = 0,30 et ' + PA('F', 'R') + ' = 0,38, calcule la probabilité que l\'ordinateur soit un fixe reconditionné.', a: 0.114, d: 3, r: 'P(F ∩ R) = 0,114',
            sol: ['C\'est le chemin F puis R : P(F ∩ R) = P(F) × ' + PA('F', 'R') + ' = 0,30 × 0,38 = 0,114.'] },
          { q: 'Montre que P(R) = 0,164. Données : P(F ∩ R) = 0,114 ; P(B) = 0,45 et ' + PA('B', 'R') + ' = 0,10 ; P(T) = 0,25 et ' + PA('T', 'R') + ' = 0,02.', r: 'P(R) = 0,164',
            sol: ['F, B, T forment une partition : formule des probabilités totales.', 'P(R) = P(F ∩ R) + P(B ∩ R) + P(T ∩ R) = 0,114 + 0,45 × 0,10 + 0,25 × 0,02.', '= 0,114 + 0,045 + 0,005 = 0,164.'] },
          { q: 'L\'ordinateur n\'est pas reconditionné. Probabilité que ce soit une tablette (à 0,001 près) ? Données : P(T) = 0,25, ' + PA('T', ov('R')) + ' = 0,98, P(R) = 0,164.', a: 0.293, d: 3, r: PA(ov('R'), 'T') + ' ≈ 0,293',
            hint: 'On cherche ' + PA(ov('R'), 'T') + ' : chemin T puis R̄, divisé par P(R̄).',
            sol: ['P(' + ov('R') + ') = 1 − 0,164 = 0,836.', 'P(T ∩ ' + ov('R') + ') = 0,25 × 0,98 = 0,245.', PA(ov('R'), 'T') + ' = 0,245 / 0,836 ≈ 0,293.'] }
        ] },
      { n: 5, t: 'Drones défectueux', tags: 'arbre · Bayes',
        e: `<p>Une entreprise a deux chaînes de production : drones à deux hélices et drones à quatre hélices. On prélève 500 drones : 300 ont deux hélices ; parmi eux, 2 % sont défectueux ; parmi les drones à quatre hélices, 96 % n'ont aucun défaut. On choisit un drone au hasard parmi les 500.</p><p>A : « le drone a deux hélices » ; D : « le drone est défectueux ».</p>`,
        q: [
          { q: 'Représente la situation par un arbre pondéré.', r: 'P(A) = 0,6 ; ' + PA('A', 'D') + ' = 0,02 ; ' + PA(ov('A'), 'D') + ' = 0,04',
            sol: ['P(A) = 300/500 = 0,6, donc P(' + ov('A') + ') = 0,4.', PA('A', 'D') + ' = 0,02 et ' + PA(ov('A'), 'D') + ' = 1 − 0,96 = 0,04.'],
            fig: tree({ root: [{ l: 'A', p: '0,6', c: [{ l: 'D', p: '0,02' }, { l: '!D', p: '0,98' }] }, { l: '!A', p: '0,4', c: [{ l: 'D', p: '0,04' }, { l: '!D', p: '0,96' }] }] }) },
          { q: 'Avec P(A) = 0,6 et ' + PA('A', 'D') + ' = 0,02 : probabilité que le drone ait deux hélices et soit défectueux ?', a: 0.012, d: 3, r: 'P(A ∩ D) = 0,012',
            sol: ['P(A ∩ D) = P(A) × ' + PA('A', 'D') + ' = 0,6 × 0,02 = 0,012.'] },
          { q: 'Probabilité qu\'un drone pris au hasard soit défectueux ? Données : P(A ∩ D) = 0,012, P(' + ov('A') + ') = 0,4, ' + PA(ov('A'), 'D') + ' = 0,04.', a: 0.028, d: 3, r: 'P(D) = 0,028',
            sol: ['Probabilités totales : P(D) = P(A ∩ D) + P(' + ov('A') + ' ∩ D).', '= 0,012 + 0,4 × 0,04 = 0,012 + 0,016 = 0,028.'] },
          { q: 'Sachant que le drone est défectueux, probabilité qu\'il ait quatre hélices (au millième) ? Données : P(' + ov('A') + ' ∩ D) = 0,016, P(D) = 0,028.', a: 0.571, d: 3, r: PA('D', ov('A')) + ' ≈ 0,571',
            sol: [PA('D', ov('A')) + ' = P(' + ov('A') + ' ∩ D) / P(D) = 0,016 / 0,028 ≈ 0,571.'] }
        ] },
      { n: 6, t: 'Deux escalators', tags: 'indépendance · au moins un',
        e: `<p>Deux escalators E<sub>1</sub> et E<sub>2</sub> fonctionnent de façon indépendante pendant une année. F<sub>1</sub> : « E<sub>1</sub> fonctionne sans panne », F<sub>2</sub> : « E<sub>2</sub> fonctionne sans panne ». Les événements F<sub>1</sub> et ${ov('F<sub>2</sub>')}, ainsi que ${ov('F<sub>1</sub>')} et F<sub>2</sub>, sont aussi indépendants.</p><p>P(F<sub>1</sub>) = 0,95 et P(F<sub>2</sub>) = 0,98. F : « les deux fonctionnent sans panne » ; G : « au moins un fonctionne sans panne » ; H : « un seul fonctionne sans panne ».</p>`,
        q: [
          { q: 'Montre que P(F) = 0,931, avec P(F<sub>1</sub>) = 0,95 et P(F<sub>2</sub>) = 0,98.', r: 'P(F) = 0,931',
            sol: ['F = F<sub>1</sub> ∩ F<sub>2</sub>, avec F<sub>1</sub> et F<sub>2</sub> indépendants.', 'P(F) = 0,95 × 0,98 = 0,931.'] },
          { q: 'Calcule P(G), avec P(F<sub>1</sub>) = 0,95 et P(F<sub>2</sub>) = 0,98.', a: 0.999, d: 3, r: 'P(G) = 0,999',
            hint: 'Le contraire de « au moins un fonctionne » est « les deux tombent en panne ».',
            sol: ['Contraire de G : les deux tombent en panne, P = 0,05 × 0,02 = 0,001.', 'P(G) = 1 − 0,001 = 0,999.'] },
          { q: 'Traduis F<sub>1</sub> ∩ ' + ov('F<sub>2</sub>') + ' par une phrase et calcule sa probabilité.', a: 0.019, d: 3, r: 'P(F<sub>1</sub> ∩ ' + ov('F<sub>2</sub>') + ') = 0,019',
            sol: ['« E<sub>1</sub> fonctionne sans panne toute l\'année et E<sub>2</sub> tombe en panne au moins une fois. »', 'Indépendance : 0,95 × (1 − 0,98) = 0,95 × 0,02 = 0,019.'] },
          { q: 'Calcule P(H). Données : P(F<sub>1</sub> ∩ ' + ov('F<sub>2</sub>') + ') = 0,019 ; P(' + ov('F<sub>1</sub>') + ') = 0,05 ; P(F<sub>2</sub>) = 0,98.', a: 0.068, d: 3, r: 'P(H) = 0,068',
            sol: ['H = (F<sub>1</sub> ∩ ' + ov('F<sub>2</sub>') + ') ∪ (' + ov('F<sub>1</sub>') + ' ∩ F<sub>2</sub>), deux événements incompatibles.', 'P(' + ov('F<sub>1</sub>') + ' ∩ F<sub>2</sub>) = 0,05 × 0,98 = 0,049.', 'P(H) = 0,019 + 0,049 = 0,068. Vérification : P(G) − P(F) = 0,999 − 0,931 = 0,068.'] }
        ] },
      { n: 7, t: 'Disque dur A100 : tableau à double entrée', tags: 'tableau · conditionnelle',
        e: `<p>Enquête sur 1 280 acheteurs du disque dur A100. On choisit une personne au hasard. Les résultats sont arrondis au millième.</p>${tbl([['', 'Usage personnel', 'Usage professionnel', 'Total'], ['Homme', '360', '480', '840'], ['Femme', '160', '280', '440'], ['Total', '520', '760', '1 280']], { side: true })}<p class="small muted">Les totaux sont ajoutés pour toi : le TD ne donne que les quatre cases.</p>`,
        q: [
          { q: 'Probabilité que la personne soit une femme ? (440 femmes sur 1 280)', a: 0.344, d: 3, r: 'P(F) = 440/1280 ≈ 0,344',
            sol: ['P(F) = 440 / 1 280 = 0,34375 ≈ 0,344.'] },
          { q: 'Probabilité que la personne soit un homme à usage personnel ? (360 personnes sur 1 280)', a: 0.281, d: 3, r: 'P(H ∩ perso) ≈ 0,281',
            sol: ['P = 360 / 1 280 = 0,28125 ≈ 0,281.'] },
          { q: 'La personne est une femme. Probabilité qu\'elle ait un usage professionnel ? (280 femmes « pro » sur 440 femmes)', a: 0.636, d: 3, r: PA('F', 'pro') + ' ≈ 0,636',
            sol: ['On se restreint à la ligne « Femme » : 280 / 440 ≈ 0,636.', 'Avec la formule : P(F ∩ pro) / P(F) = (280/1280) / (440/1280) = 280/440.'] }
        ] },
      { n: 8, t: 'Démission dans trois entrepôts', tags: 'Bayes · partition en 3',
        e: `<p>Trois entrepôts A, B, C comptent 50, 75 et 100 employés, avec respectivement 50 %, 60 % et 70 % de femmes. Une démission a la même chance de venir de n'importe quel employé. Une employée (une femme) donne sa démission.</p>`,
        q: [
          { q: 'Combien de femmes y a-t-il au total dans les trois entrepôts ?', a: 140, d: 0, r: '25 + 45 + 70 = 140 femmes',
            sol: ['A : 50 × 0,5 = 25 ; B : 75 × 0,6 = 45 ; C : 100 × 0,7 = 70.', 'Total : 140 femmes sur 225 employés.'] },
          { q: 'Une femme démissionne : probabilité qu\'elle vienne de l\'entrepôt C ? (70 femmes à C, 140 femmes en tout)', a: 0.5, d: 3, r: PA('Femme', 'C') + ' = 0,5',
            sol: ['Chaque employé a la même chance : on compte parmi les femmes.', PA('Femme', 'C') + ' = 70 / 140 = 0,5.', 'Avec Bayes : (100/225 × 0,7) / (140/225) = 0,5.'] }
        ] },
      { n: 9, t: 'Assurance : trois classes de risque', tags: 'probabilités totales · Bayes', opt: true,
        e: `<p>Une compagnie classe ses assurés : bas risque (20 %), risque moyen (50 %), haut risque (30 %). La probabilité d'avoir au moins un accident dans l'année est 0,05, 0,15 et 0,30 selon la classe.</p>`,
        q: [
          { q: 'Proportion d\'assurés ayant eu au moins un accident dans l\'année ?', a: 0.175, d: 3, r: 'P(accident) = 0,175',
            sol: ['Probabilités totales : 0,2 × 0,05 + 0,5 × 0,15 + 0,3 × 0,30.', '= 0,01 + 0,075 + 0,09 = 0,175.'] },
          { q: 'Un assuré n\'a pas eu d\'accident. Probabilité qu\'il soit à bas risque ? (P(accident) = 0,175)', a: 0.2303, tol: 0.0006, r: 'P<sub>pas d\'accident</sub>(bas) ≈ 0,230',
            sol: ['P(bas ∩ pas d\'accident) = 0,2 × 0,95 = 0,19.', 'P(pas d\'accident) = 1 − 0,175 = 0,825.', 'P = 0,19 / 0,825 ≈ 0,2303.'] }
        ] },
      { n: 10, t: 'Pluie à Londres et parapluie', tags: 'arbre à trois niveaux · Bayes',
        e: `<p>À Londres, la météo prévoit de la pluie un jour sur deux. Ses prévisions sont justes 2 fois sur 3 : il pleut avec probabilité 2/3 quand elle prévoit la pluie, et il fait sec avec probabilité 2/3 quand elle prévoit du sec. M. X prend toujours son parapluie quand la pluie est prévue, et avec probabilité 1/3 quand le sec est prévu.</p>
          ${tbl([['Prévision', 'Temps réel', 'Probabilité', 'Parapluie'], ['pluie (1/2)', 'pluie', '1/2 × 2/3 = 1/3', 'toujours'], ['pluie (1/2)', 'sec', '1/2 × 1/3 = 1/6', 'toujours'], ['sec (1/2)', 'pluie', '1/2 × 1/3 = 1/6', 'avec proba 1/3'], ['sec (1/2)', 'sec', '1/2 × 2/3 = 1/3', 'avec proba 1/3']])}
          <p class="small muted">Le parapluie ne dépend que de la prévision, pas du temps réel.</p>`,
        q: [
          { q: 'Probabilité que M. X prenne son parapluie un jour quelconque ?', a: 2 / 3, d: 3, r: 'P(parapluie) = 2/3',
            sol: ['Pluie prévue (1/2) : parapluie sûr ; sec prévu (1/2) : parapluie avec 1/3.', 'P = 1/2 × 1 + 1/2 × 1/3 = 1/2 + 1/6 = 2/3 ≈ 0,667.'] },
          { q: 'Probabilité qu\'il n\'ait pas pris son parapluie un jour de pluie ? Indication : P(pluie) = 1/3 + 1/6 = 1/2.', a: 2 / 9, d: 3, r: 'P<sub>pluie</sub>(pas de parapluie) = 2/9',
            hint: 'Sans parapluie, il faut que le sec ait été prévu.',
            sol: ['Pas de parapluie un jour de pluie : sec prévu, pluie quand même, et il ne prend pas le parapluie.', 'P = 1/2 × 1/3 × 2/3 = 1/9.', 'P<sub>pluie</sub>(pas de parapluie) = (1/9) / (1/2) = 2/9 ≈ 0,222.'] },
          { q: 'Probabilité qu\'il ne pleuve pas sachant qu\'il a son parapluie ? Données : P(parapluie) = 2/3.', a: 5 / 12, d: 3, r: 'P<sub>parapluie</sub>(sec) = 5/12',
            sol: ['Sec et parapluie : pluie prévue puis sec (1/6, parapluie sûr) ou sec prévu puis sec (1/3) avec parapluie (1/3).', 'P(sec ∩ parapluie) = 1/6 + 1/3 × 1/3 = 1/6 + 1/9 = 5/18.', 'P<sub>parapluie</sub>(sec) = (5/18) / (2/3) = 5/12 ≈ 0,417.'] }
        ] },
      { n: 11, t: 'Tribunal de trois juges', tags: 'conditionnelle · indépendance conditionnelle', opt: true,
        e: `<p>Un tribunal de 3 juges déclare coupable si au moins 2 juges votent coupable. Si l'accusé est coupable, chaque juge vote coupable avec probabilité 0,7, indépendamment des autres ; s'il est innocent, avec probabilité 0,2. 70 % des accusés sont coupables.</p><p>On note V<sub>i</sub> : « le juge i vote coupable ».</p>`,
        q: [
          { q: 'Probabilité que le juge 3 vote coupable sachant que les juges 1 et 2 l\'ont fait ?', a: 0.6831, tol: 0.0006, r: 'P(V<sub>3</sub> | V<sub>1</sub> ∩ V<sub>2</sub>) ≈ 0,683',
            hint: 'Les votes ne sont indépendants que sachant coupable ou innocent : conditionne d\'abord sur la culpabilité.',
            sol: ['P(V<sub>1</sub> ∩ V<sub>2</sub> ∩ V<sub>3</sub>) = 0,7 × 0,7³ + 0,3 × 0,2³ = 0,2401 + 0,0024 = 0,2425.', 'P(V<sub>1</sub> ∩ V<sub>2</sub>) = 0,7 × 0,7² + 0,3 × 0,2² = 0,343 + 0,012 = 0,355.', 'P = 0,2425 / 0,355 ≈ 0,683.'] },
          { q: 'Probabilité que le juge 3 vote coupable sachant que le juge 1 ou le juge 2 a voté coupable ?', a: 0.6275, tol: 0.0006, r: 'P(V<sub>3</sub> | V<sub>1</sub> ∪ V<sub>2</sub>) ≈ 0,628',
            sol: ['P(V<sub>1</sub> ∪ V<sub>2</sub>) = 1 − P(aucun des deux) = 1 − (0,7 × 0,3² + 0,3 × 0,8²) = 1 − 0,255 = 0,745.', 'P(V<sub>3</sub>) = 0,7 × 0,7 + 0,3 × 0,2 = 0,55 ; P(V<sub>3</sub> et ni 1 ni 2) = 0,7 × 0,09 × 0,7 + 0,3 × 0,64 × 0,2 = 0,0825.', 'P(V<sub>3</sub> ∩ (V<sub>1</sub> ∪ V<sub>2</sub>)) = 0,55 − 0,0825 = 0,4675, donc P = 0,4675 / 0,745 ≈ 0,628.'] },
          { q: 'Probabilité que le juge 3 vote coupable sachant que les juges 1 et 2 ont voté non coupable ?', a: 0.3235, tol: 0.0006, r: 'P(V<sub>3</sub> | ni 1 ni 2) ≈ 0,324',
            sol: ['P(ni 1 ni 2) = 0,255 et P(V<sub>3</sub> et ni 1 ni 2) = 0,0825 (question précédente).', 'P = 0,0825 / 0,255 ≈ 0,324.'] }
        ] },
      { n: 12, t: 'Vaccination et test de dépistage', tags: 'arbre · Bayes · faux positifs',
        e: `<p>70 % d'une population est vaccinée. Parmi les vaccinés, 4 % contractent la maladie ; parmi les non-vaccinés, 15 %. On note V « la personne est vaccinée » et M « la personne est malade ».</p><p>Un test de dépistage donne un faux négatif pour 8 % des malades (partie A). Partie B : P(M) = 0,073 ; 8 % des malades ont un test négatif ; 3 % des non-malades ont un test positif. T : « le test est positif ».</p>`,
        q: [
          { q: 'Partie A. Représente la situation vaccination / maladie par un arbre pondéré.', r: 'P(V) = 0,7 ; ' + PA('V', 'M') + ' = 0,04 ; ' + PA(ov('V'), 'M') + ' = 0,15',
            sol: ['Premier niveau V (0,7), V̄ (0,3). Deuxième niveau M / M̄ : 0,04 / 0,96 après V, 0,15 / 0,85 après V̄.'],
            fig: tree({ root: [{ l: 'V', p: '0,7', c: [{ l: 'M', p: '0,04' }, { l: '!M', p: '0,96' }] }, { l: '!V', p: '0,3', c: [{ l: 'M', p: '0,15' }, { l: '!M', p: '0,85' }] }] }) },
          { q: 'Probabilité qu\'une personne soit vaccinée et malade (P(V) = 0,7, ' + PA('V', 'M') + ' = 0,04) ?', a: 0.028, d: 3, r: 'P(V ∩ M) = 0,028',
            sol: ['P(V ∩ M) = 0,7 × 0,04 = 0,028.'] },
          { q: 'Montre que P(M) = 0,073. Données : P(V ∩ M) = 0,028, P(' + ov('V') + ') = 0,3, ' + PA(ov('V'), 'M') + ' = 0,15.', r: 'P(M) = 0,073',
            sol: ['Probabilités totales : P(M) = P(V ∩ M) + P(' + ov('V') + ' ∩ M) = 0,028 + 0,3 × 0,15 = 0,028 + 0,045 = 0,073.'] },
          { q: 'Sachant qu\'une personne est malade, probabilité qu\'elle soit vaccinée (au millième) ? Données : P(V ∩ M) = 0,028, P(M) = 0,073.', a: 0.384, d: 3, r: PA('M', 'V') + ' ≈ 0,384',
            sol: [PA('M', 'V') + ' = 0,028 / 0,073 ≈ 0,384.', 'Plus d\'un malade sur trois est vacciné, simplement parce que les vaccinés sont nombreux (70 %).'] },
          { q: 'On fait passer le test à une personne malade. Probabilité que le test soit négatif ?', a: 0.08, d: 3, r: PA('M', ov('T')) + ' = 0,08',
            sol: ['C\'est donné : 8 % des malades ont un test négatif, ' + PA('M', ov('T')) + ' = 0,08.'] },
          { q: 'Comment appelle-t-on ce résultat (test négatif chez un malade) ?', c: ['Un faux positif', 'Un faux négatif', 'Un vrai négatif'], a: 1,
            sol: ['Le test dit « négatif » alors que la personne est malade : c\'est un faux négatif.'] },
          { q: 'Partie B. Complète un arbre pondéré M / T avec P(M) = 0,073, ' + PA('M', ov('T')) + ' = 0,08 et ' + PA(ov('M'), 'T') + ' = 0,03.', r: PA('M', 'T') + ' = 0,92 ; ' + PA(ov('M'), 'T') + ' = 0,03',
            sol: ['M (0,073) puis T (0,92) / T̄ (0,08) ; M̄ (0,927) puis T (0,03) / T̄ (0,97).'],
            fig: tree({ root: [{ l: 'M', p: '0,073', c: [{ l: 'T', p: '0,92' }, { l: '!T', p: '0,08' }] }, { l: '!M', p: '0,927', c: [{ l: 'T', p: '0,03' }, { l: '!T', p: '0,97' }] }] }) },
          { q: 'Probabilité qu\'une personne soit malade et ait un test positif (P(M) = 0,073, ' + PA('M', 'T') + ' = 0,92) ?', a: 0.06716, tol: 0.0002, r: 'P(M ∩ T) = 0,06716',
            sol: ['P(M ∩ T) = 0,073 × 0,92 = 0,06716.'] },
          { q: 'Probabilité qu\'une personne ait un test positif ? Données : P(M ∩ T) = 0,06716, P(' + ov('M') + ') = 0,927, ' + PA(ov('M'), 'T') + ' = 0,03.', a: 0.09497, tol: 0.0002, r: 'P(T) = 0,09497',
            sol: ['P(' + ov('M') + ' ∩ T) = 0,927 × 0,03 = 0,02781.', 'P(T) = 0,06716 + 0,02781 = 0,09497.'] },
          { q: 'Une personne a un test positif. Probabilité qu\'elle ne soit pas malade (au millième) ? Données : P(' + ov('M') + ' ∩ T) = 0,02781, P(T) = 0,09497.', a: 0.293, d: 3, r: PA('T', ov('M')) + ' ≈ 0,293',
            sol: [PA('T', ov('M')) + ' = 0,02781 / 0,09497 ≈ 0,293.', 'Près de 3 tests positifs sur 10 sont de faux positifs : la maladie est rare, les non-malades sont nombreux.'] }
        ] },
      { n: 13, t: 'Lettre mensuelle : Atout, Boutan, Codin', tags: 'partition en 3 · Bayes · interprétation',
        e: `<p>Parmi les internautes des trois communes qui se connectent au site en 2025 : 45 % habitent Atout, 20 % Boutan, les autres Codin. 10 % des habitants d'Atout s'abonnent à la lettre mensuelle, 15 % de ceux de Boutan, 5 % de ceux de Codin. On choisit un internaute au hasard.</p><p>A, B, C : l'internaute habite Atout, Boutan, Codin ; M : il s'abonne.</p>`,
        q: [
          { q: 'Détermine P(C), avec P(A) = 0,45 et P(B) = 0,20.', a: 0.35, d: 2, r: 'P(C) = 0,35',
            sol: ['A, B, C forment une partition : P(C) = 1 − 0,45 − 0,20 = 0,35.'],
            fig: tree({ root: [{ l: 'A', p: '0,45', c: [{ l: 'M', p: '0,10' }, { l: '!M', p: '0,90' }] }, { l: 'B', p: '0,20', c: [{ l: 'M', p: '0,15' }, { l: '!M', p: '0,85' }] }, { l: 'C', p: '0,35', c: [{ l: 'M', p: '0,05' }, { l: '!M', p: '0,95' }] }] }) },
          { q: 'Probabilité que l\'internaute habite Atout et s\'abonne (valeur exacte) ? P(A) = 0,45, ' + PA('A', 'M') + ' = 0,10.', a: 0.045, d: 4, r: 'P(A ∩ M) = 0,045',
            sol: ['P(A ∩ M) = 0,45 × 0,10 = 0,045.'] },
          { q: 'Probabilité que l\'internaute s\'abonne (valeur exacte) ? P(A ∩ M) = 0,045 ; P(B) = 0,20 avec ' + PA('B', 'M') + ' = 0,15 ; P(C) = 0,35 avec ' + PA('C', 'M') + ' = 0,05.', a: 0.0925, d: 4, r: 'P(M) = 0,0925',
            sol: ['P(M) = 0,045 + 0,20 × 0,15 + 0,35 × 0,05 = 0,045 + 0,03 + 0,0175 = 0,0925.'] },
          { q: 'Sachant qu\'il s\'abonne, probabilité qu\'il habite Atout (au centième) ? P(A ∩ M) = 0,045, P(M) = 0,0925.', a: 0.49, d: 2, r: PA('M', 'A') + ' ≈ 0,49',
            sol: [PA('M', 'A') + ' = 0,045 / 0,0925 ≈ 0,4865 ≈ 0,49.'] },
          { q: 'L\'administrateur affirme qu\'Atout devra payer plus de la moitié du coût d\'envoi des lettres en 2025. A-t-il raison ? (' + PA('M', 'A') + ' ≈ 0,49)', c: ['Oui : Atout représente plus de la moitié des abonnés', 'Non : Atout représente environ 49 % des abonnés, un peu moins de la moitié'], a: 1,
            sol: ['Le coût se répartit au prorata des abonnés. ' + PA('M', 'A') + ' ≈ 0,49 < 0,5 : les abonnés d\'Atout font un peu moins de la moitié. L\'administrateur a tort.'] }
        ] }
    ]
  });
})();
