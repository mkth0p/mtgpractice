/* Chapitre II — Statistiques descriptives (poly p. 10–21, TD séances 2–3). */
(function () {
  var H = OM.h, F = H.F, R = H.R, ov = H.ov, tbl = H.tbl, MB = H.MB, hist = H.hist, curve = H.curve, scat = H.scat;
  var XB = 'x̄', YB = 'ȳ';
  var TIP_REG = 'Tableau : colonnes x − x̄, y − ȳ, leur produit, (x − x̄)², puis les totaux.';

  OM.chapter({
    id: 2, num: 'II', short: 'Statistiques descriptives', title: 'Statistiques descriptives', pages: 'poly p. 10–21', sessions: 'séances 2 et 3',
    summary: 'Vocabulaire, graphiques, moyenne, médiane, quartiles, variance, écart-type ; deux variables : covariance, moindres carrés, r, R², changements de variable.',
    intro: 'Une variable : résumer une série (position, dispersion). Deux variables : chercher une relation y = f(x) et mesurer sa qualité.',
    cours: [
      { h: 'Vocabulaire et tableaux', html: `
        <p>On étudie une <strong>population</strong> dont les éléments sont les <strong>individus</strong> (ou unités statistiques) : voitures, étudiants, connexions… Si elle est grande, on travaille sur un <strong>échantillon</strong> (une partie de la population).</p>
        <p>On observe un <strong>caractère</strong> (la propriété étudiée), qui prend des <strong>modalités</strong>. Le caractère est <strong>qualitatif</strong> si ses modalités ne sont pas des nombres mesurables (couleur, ville), <strong>quantitatif</strong> sinon : <strong>discret</strong> (valeurs isolées : nombre d'enfants) ou <strong>continu</strong> (valeurs regroupées en <strong>classes</strong> [a ; b[ : durée, masse).</p>
        <ul>
          <li><strong>Effectif</strong> n<sub>i</sub> : nombre d'individus de modalité x<sub>i</sub>. <strong>Effectif total</strong> N = n<sub>1</sub> + … + n<sub>k</sub>.</li>
          <li><strong>Fréquence</strong> f<sub>i</sub> = n<sub>i</sub> / N ; la somme des fréquences vaut 1 (100 %).</li>
          <li><strong>Mode</strong> : modalité de plus grand effectif. Avec des classes on parle de <strong>classe modale</strong> ; si les amplitudes sont différentes, c'est la classe de plus grande densité n<sub>i</sub> / amplitude (le plus haut rectangle de l'histogramme). Il peut y avoir plusieurs modes.</li>
          <li><strong>Effectifs cumulés croissants</strong> (ECC) : nombre d'individus de valeur ≤ x<sub>i</sub> ; <strong>décroissants</strong> (ECD) : nombre d'individus de valeur ≥ x<sub>i</sub>.</li>
        </ul>` },
      { h: 'Représentations graphiques', html: `
        <ul>
          <li><strong>Caractère qualitatif</strong> : diagramme circulaire ou semi-circulaire, diagramme en barres (tuyaux d'orgue), diagramme en bande. Pas d'axe gradué : les modalités ne s'ordonnent pas comme des nombres.</li>
          <li><strong>Quantitatif discret</strong> : diagramme en bâtons.</li>
          <li><strong>Quantitatif continu</strong> : <strong>histogramme</strong>. Les effectifs sont proportionnels à l'<strong>aire</strong> des rectangles. Si une classe est deux fois plus large, sa hauteur est divisée par deux : hauteur = effectif / amplitude (densité).</li>
          <li><strong>Courbe des effectifs (ou fréquences) cumulés</strong> : on relie les points (borne supérieure de la classe ; ECC). La médiane se lit à l'ordonnée N/2 ; les courbes croissante et décroissante se coupent au point d'abscisse la médiane.</li>
        </ul>` },
      { h: 'Moyenne', html: `
        <p>Moyenne = somme des valeurs prises / nombre d'éléments. Trois cas :</p>
        ${MB(XB + ' = ' + F('Σ x<sub>i</sub>', 'n') + ' (liste)      ' + XB + ' = ' + F('Σ n<sub>i</sub> x<sub>i</sub>', 'N') + ' (tableau)      ' + XB + ' = ' + F('Σ n<sub>i</sub> c<sub>i</sub>', 'N') + ' avec c<sub>i</sub> = ' + F('a<sub>i</sub> + b<sub>i</sub>', '2'))}
        <p>Avec des classes, on suppose les valeurs concentrées au centre : la moyenne obtenue est une <strong>approximation</strong>, d'autant moins précise que les classes sont larges (TD II, exercice 3).</p>
        <p class="def"><strong>Effet de structure</strong> : quand une population est répartie en sous-populations, une moyenne peut évoluer dans un sens sur chaque sous-population et dans l'autre sur l'ensemble, à cause de la répartition (TD II, exercice 5).</p>` },
      { h: 'Médiane et quantiles', html: `
        <p>La <strong>médiane</strong> Me partage la série rangée en deux moitiés : 50 % des individus en dessous, 50 % au-dessus. On la lit sur les effectifs cumulés au rang N/2.</p>
        <ul>
          <li>N pair : moyenne des valeurs de rangs N/2 et N/2 + 1 (si cela a un sens), sinon l'une des deux.</li>
          <li>N impair : valeur de rang (N + 1)/2.</li>
          <li>Données en classes : <strong>interpolation linéaire</strong> dans la classe médiane (celle où les ECC franchissent N/2).</li>
        </ul>
        ${MB('Me = borne inf + ' + F('N/2 − ECC avant la classe', 'effectif de la classe') + ' × amplitude')}
        <p><strong>Quartiles</strong> : Q<sub>1</sub> (25 % en dessous), Q<sub>2</sub> = Me, Q<sub>3</sub> (75 % en dessous). Pour une série discrète, Q<sub>1</sub> est la plus petite valeur dont l'ECC atteint N/4, Q<sub>3</sub> celle dont l'ECC atteint 3N/4. L'<strong>écart interquartile</strong> Q<sub>3</sub> − Q<sub>1</sub> mesure la dispersion du « milieu » de la série. En coupant en 10 ou 100 parts : <strong>déciles</strong>, <strong>centiles</strong>.</p>` },
      { h: 'Dispersion : étendue, variance, écart-type', html: `
        <p><strong>Étendue</strong> = plus grande valeur − plus petite valeur (avec des classes : borne max − borne min).</p>
        <p><strong>Variance</strong> : moyenne des carrés des écarts à la moyenne (au carré, sinon les écarts se compensent et la moyenne des écarts est nulle).</p>
        ${MB('V(x) = ' + F('1', 'N') + ' Σ n<sub>i</sub>(x<sub>i</sub> − ' + XB + ')² = ' + ov('x²') + ' − ' + XB + '²')}
        <p>Forme développée : moyenne des carrés moins carré de la moyenne. Démonstration (poly p. 16) : on développe (x<sub>i</sub> − ${XB})² = x<sub>i</sub>² − 2x<sub>i</sub>${XB} + ${XB}², on sépare la somme : ${F('1', 'n')}Σx<sub>i</sub>² − 2${XB} × ${F('1', 'n')}Σx<sub>i</sub> + ${XB}² = ${ov('x²')} − 2${XB}² + ${XB}² = ${ov('x²')} − ${XB}².</p>
        <ul><li>V ≥ 0, nulle seulement si la série est constante. Elle s'exprime dans l'unité au carré.</li>
        <li><strong>Écart-type</strong> σ = √V, dans la même unité que la variable : l'écart « moyen » à la moyenne.</li>
        <li>Défauts de σ : on ne peut pas comparer des séries d'unités différentes, et σ dépend de l'échelle des valeurs.</li></ul>` },
      { h: 'Deux variables : moindres carrés', html: `
        <p>On étudie deux caractères ensemble parce qu'on pense qu'ils sont liés. Un <strong>modèle</strong> y = f(x) suppose que x agit sur y : x est la <strong>variable explicative</strong>, y la <strong>variable expliquée</strong>. Cas particulier : une <strong>série chronologique</strong> y = f(t), dont on cherche la tendance (le trend).</p>
        <p>On représente le <strong>nuage de points</strong> (x<sub>i</sub> ; y<sub>i</sub>) et le <strong>point moyen</strong> G(${XB} ; ${YB}).</p>
        <p class="def"><strong>Ajustement affine</strong> y = ax + b. Les observations ne sont jamais exactement alignées : y<sub>i</sub> = ax<sub>i</sub> + b + u<sub>i</sub>, où u<sub>i</sub> est le <strong>résidu</strong>. La méthode des moindres carrés choisit a et b qui rendent minimale la somme des carrés des résidus Σu<sub>i</sub>².</p>
        ${MB('a = ' + F('Σ(x<sub>i</sub> − ' + XB + ')(y<sub>i</sub> − ' + YB + ')', 'Σ(x<sub>i</sub> − ' + XB + ')²') + ' = ' + F('Cov(x, y)', 'V(x)') + '      b = ' + YB + ' − a' + XB)}
        <p>La droite passe toujours par G. <strong>Covariance</strong> : Cov(x, y) = ${F('1', 'n')}Σ(x<sub>i</sub> − ${XB})(y<sub>i</sub> − ${YB}) = ${F('Σ x<sub>i</sub>y<sub>i</sub>', 'n')} − ${XB}${YB}. Positive : x et y augmentent ensemble ; négative : y diminue quand x augmente ; proche de 0 : pas de relation linéaire. Elle dépend des unités, donc elle ne mesure pas la force du lien.</p>` },
      { h: 'Qualité de l\'ajustement : R² et r', html: `
        <p>La <strong>variance expliquée</strong> est celle des valeurs estimées ŷ<sub>i</sub> = ax<sub>i</sub> + b. Le <strong>coefficient de détermination</strong> :</p>
        ${MB('R² = ' + F('variance expliquée', 'variance totale') + ' = ' + F('SCE', 'SCT') + ' = 1 − ' + F('SCR', 'SCT'))}
        <p>SCE : somme des carrés expliquée Σ(ŷ<sub>i</sub> − ${YB})² ; SCT : totale Σ(y<sub>i</sub> − ${YB})² ; SCR : des résidus. R² = 0 : le modèle n'explique rien de la distribution des points ; R² = 1 : il l'explique entièrement.</p>
        ${MB('r = ' + F('Σ(x<sub>i</sub> − ' + XB + ')(y<sub>i</sub> − ' + YB + ')', R('Σ(x<sub>i</sub> − ' + XB + ')² · Σ(y<sub>i</sub> − ' + YB + ')²')) + ' = ' + F('Cov(x, y)', 'σ<sub>x</sub> σ<sub>y</sub>'))}
        <ul><li>−1 ≤ r ≤ 1 ; r &lt; 0 : pente négative ; r &gt; 0 : pente positive ; plus |r| est proche de 1, meilleure est la corrélation linéaire.</li>
        <li>r est le même si on échange x et y. <strong>Corrélation n'est pas causalité.</strong></li>
        <li>R² = r² <em>seulement</em> pour la régression linéaire. Pour un ajustement logarithmique, exponentiel… ce n'est plus vrai : d'où les notations r minuscule, R² majuscule.</li></ul>` },
      { h: 'Ajustements non linéaires', html: `
        <p>On peut toujours calculer une droite, mais elle peut être absurde : trace d'abord le nuage. Si le nuage est courbe, on fait un <strong>changement de variable</strong> qui le rend à peu près rectiligne, puis un ajustement affine sur la nouvelle variable.</p>
        ${tbl([['Changement', 'Droite obtenue', 'Retour à y'], ['z = ln y', 'z = ax + b', 'y = e<sup>b</sup> e<sup>ax</sup> = B e<sup>ax</sup>'], ['z = e<sup>y</sup>', 'z = ax + b', 'y = ln(ax + b)'], ['y = ln(z / x)', 'y = ax + b', 'z = x e<sup>ax + b</sup>']])}
        <p>Entre plusieurs modèles, on garde celui dont le R² est le plus proche de 1 (calculatrice, tableur), à condition que la tendance ait un sens.</p>` }
    ],
    formules: [
      ['Fréquence', 'f<sub>i</sub> = n<sub>i</sub> / N'],
      ['Moyenne', XB + ' = ' + F('Σ n<sub>i</sub> x<sub>i</sub>', 'N') + ' ; classes : x<sub>i</sub> = centre'],
      ['Variance', 'V = ' + F('Σ n<sub>i</sub>(x<sub>i</sub> − ' + XB + ')²', 'N') + ' = ' + F('Σ n<sub>i</sub> x<sub>i</sub>²', 'N') + ' − ' + XB + '²'],
      ['Écart-type', 'σ = √V'],
      ['Médiane (classes)', 'Me = borne inf + ' + F('N/2 − ECC avant', 'effectif classe') + ' × amplitude'],
      ['Quartiles', 'Q<sub>1</sub> : rang N/4 ; Q<sub>3</sub> : rang 3N/4 ; écart interquartile Q<sub>3</sub> − Q<sub>1</sub>'],
      ['Histogramme', 'hauteur = effectif / amplitude'],
      ['Covariance', 'Cov = ' + F('Σ(x − ' + XB + ')(y − ' + YB + ')', 'n') + ' = ' + F('Σ xy', 'n') + ' − ' + XB + YB],
      ['Droite des moindres carrés', 'a = ' + F('Cov(x, y)', 'V(x)') + ' ; b = ' + YB + ' − a' + XB],
      ['Corrélation', 'r = ' + F('Cov(x, y)', 'σ<sub>x</sub>σ<sub>y</sub>') + ' ∈ [−1 ; 1]'],
      ['Détermination', 'R² = SCE/SCT = 1 − SCR/SCT ; R² = r² en linéaire'],
      ['Exponentiel', 'z = ln y = ax + b ⇒ y = e<sup>b</sup> e<sup>ax</sup>']
    ],
    methodes: [
      { h: 'Série en classes : moyenne, variance, médiane', steps: ['Ajoute les colonnes centre c<sub>i</sub>, n<sub>i</sub>c<sub>i</sub>, n<sub>i</sub>c<sub>i</sub>², ECC.', XB + ' = Σn<sub>i</sub>c<sub>i</sub> / N ; V = Σn<sub>i</sub>c<sub>i</sub>² / N − ' + XB + '² ; σ = √V.', 'Classe médiane : la première dont l\'ECC dépasse N/2, puis interpolation linéaire.', 'Même méthode pour Q<sub>1</sub> (N/4) et Q<sub>3</sub> (3N/4).'] },
      { h: 'Régression à la main', steps: ['Calcule ' + XB + ' et ' + YB + '.', TIP_REG, 'a = Σ produits / Σ(x − ' + XB + ')², b = ' + YB + ' − a' + XB + '.', 'r = Σ produits / √(Σ(x − ' + XB + ')² × Σ(y − ' + YB + ')²) ; commente : |r| proche de 1 = forte liaison linéaire.', 'Estimation : remplace x dans y = ax + b.'] },
      { h: 'Ajustement exponentiel', steps: ['Justifie : le nuage n\'est pas rectiligne, la croissance s\'accélère.', 'Calcule z<sub>i</sub> = ln y<sub>i</sub> (arrondi demandé).', 'Droite de z en x : z = ax + b.', 'Reviens à y : y = e<sup>ax + b</sup> = e<sup>b</sup> × e<sup>ax</sup>.', 'Estimation : calcule z puis y = e<sup>z</sup>.'] }
    ],
    pieges: [
      '<b>Classes d\'amplitudes inégales.</b> La hauteur d\'un rectangle est effectif / amplitude, et la classe modale est celle de plus grande densité, pas forcément celle de plus grand effectif.',
      '<b>Variance en statistique descriptive :</b> on divise par N, pas par N − 1 (le n − 1 sert au chapitre IV pour estimer).',
      '<b>Covariance :</b> son signe donne le sens de la liaison, pas sa force (elle change avec l\'unité). Pour la force, calcule r.',
      '<b>Corrélation n\'est pas causalité</b>, et R² = r² seulement pour une régression linéaire.',
      '<b>Effet de structure :</b> une moyenne globale peut monter alors qu\'aucune catégorie ne bouge.',
      '<b>Arrondis :</b> pour les changements de variable, arrondis les z<sub>i</sub> comme demandé, mais garde les coefficients a et b donnés par l\'énoncé pour les estimations.'
    ],
    td: [
      { n: 1, t: 'Moyenne d\'une liste de notes', tags: 'moyenne',
        e: '<p>Un élève a obtenu les notes : 4 ; 6 ; 3 ; 9 ; 10 ; 8 ; 12 ; 10 ; 19 ; 12 ; 20 ; 12 ; 18. Calculer sa moyenne.</p>',
        q: [{ q: 'Moyenne des 13 notes 4 ; 6 ; 3 ; 9 ; 10 ; 8 ; 12 ; 10 ; 19 ; 12 ; 20 ; 12 ; 18 ?', a: 11, d: 2, r: XB + ' = 11',
          sol: ['Somme : 4 + 6 + 3 + 9 + 10 + 8 + 12 + 10 + 19 + 12 + 20 + 12 + 18 = 143.', XB + ' = 143 / 13 = 11.'] }] },
      { n: 2, t: 'Notes de 35 élèves : fréquences et cumuls', tags: 'fréquences · effectifs cumulés',
        e: `<p>Les 35 élèves d'une classe ont composé. Compléter le tableau avec les fréquences à 10<sup>−3</sup> près et les effectifs cumulés croissants et décroissants.</p>${tbl([['Note', '2', '4', '5', '6', '9', '11', '12', '14', '15', '16', '18'], ['Effectif', '1', '3', '2', '2', '6', '4', '4', '5', '3', '3', '2']], { side: true })}`,
        q: [
          { q: 'Fréquence de la note 9 (effectif 6 sur 35), à 10<sup>−3</sup> près ?', a: 0.171, d: 3, r: 'f(9) ≈ 0,171',
            sol: ['f = 6 / 35 = 0,1714… ≈ 0,171.'] },
          { q: 'Effectif cumulé croissant de la note 12 (nombre d\'élèves ayant 12 ou moins) ? Effectifs : 2→1, 4→3, 5→2, 6→2, 9→6, 11→4, 12→4.', a: 22, d: 0, r: 'ECC(12) = 22',
            sol: ['1 + 3 + 2 + 2 + 6 + 4 + 4 = 22 élèves ont 12 ou moins.'] },
          { q: 'Effectif cumulé décroissant de la note 14 (nombre d\'élèves ayant 14 ou plus) ? Effectifs : 14→5, 15→3, 16→3, 18→2.', a: 13, d: 0, r: 'ECD(14) = 13',
            sol: ['5 + 3 + 3 + 2 = 13 élèves ont 14 ou plus. Vérification : 35 − ECC(12) = 35 − 22 = 13.'] },
          { q: 'Recopie et complète tout le tableau (fréquences, ECC, ECD).',
            sol: ['Fréquence = effectif / 35 ; ECC : on additionne de gauche à droite ; ECD : de droite à gauche.',
              tbl([['Note', '2', '4', '5', '6', '9', '11', '12', '14', '15', '16', '18'], ['Effectif', '1', '3', '2', '2', '6', '4', '4', '5', '3', '3', '2'], ['Fréquence', '0,029', '0,086', '0,057', '0,057', '0,171', '0,114', '0,114', '0,143', '0,086', '0,086', '0,057'], ['ECC', '1', '4', '6', '8', '14', '18', '22', '27', '30', '33', '35'], ['ECD', '35', '34', '31', '29', '27', '21', '17', '13', '8', '5', '2']], { side: true })] }
        ] },
      { n: 3, t: 'Durée moyenne d\'un appel', tags: 'moyenne en classes',
        e: `<p>Durées des communications d'un central téléphonique (en minutes) :</p>${tbl([['Durée', '[0 ; 2[', '[2 ; 4[', '[4 ; 6[', '[6 ; 8[', '[8 ; 10[', '[10 ; 12['], ['Effectif', '14', '16', '25', '15', '17', '13']], { side: true })}`,
        q: [
          { q: 'Durée moyenne d\'un appel ? Centres 1, 3, 5, 7, 9, 11 ; effectifs 14, 16, 25, 15, 17, 13.', a: 5.88, d: 2, u: 'min', r: XB + ' = 5,88 min',
            sol: ['N = 100. Σn<sub>i</sub>c<sub>i</sub> = 14 + 48 + 125 + 105 + 153 + 143 = 588.', XB + ' = 588 / 100 = 5,88 min.'] },
          { q: 'On regroupe les classes par deux : [0 ; 4[ (30 appels), [4 ; 8[ (40), [8 ; 12[ (30). Nouvelle durée moyenne ?', a: 6, d: 2, u: 'min', r: 'Avec les classes regroupées : ' + XB + ' = 6 min',
            sol: ['Centres 2, 6, 10 : (30 × 2 + 40 × 6 + 30 × 10) / 100 = (60 + 240 + 300) / 100 = 6 min.'] },
          { q: 'Quelle conclusion tires-tu de 5,88 min et 6 min ?',
            sol: ['Les deux résultats diffèrent : avec des classes, on remplace chaque valeur par le centre de sa classe, donc la moyenne est une approximation.', 'Plus les classes sont larges, moins l\'approximation est précise.'] }
        ] },
      { n: 4, t: 'Taille moyenne de trois sous-groupes', tags: 'moyenne pondérée',
        e: '<p>Sous-groupe 1 : 40 personnes, taille moyenne 170 cm. Sous-groupe 2 : 10 personnes, 180 cm. Sous-groupe 3 : 50 personnes, 175 cm.</p>',
        q: [
          { q: 'Taille moyenne du groupe complet (40 × 170 cm, 10 × 180 cm, 50 × 175 cm) ?', a: 173.5, d: 1, u: 'cm', r: 'Moyenne du groupe : 173,5 cm',
            sol: ['Moyenne pondérée par les effectifs : (40 × 170 + 10 × 180 + 50 × 175) / 100.', '= (6 800 + 1 800 + 8 750) / 100 = 173,5 cm.'] },
          { q: 'Taille moyenne si les trois sous-groupes avaient le même effectif ?', a: 175, d: 1, u: 'cm', r: 'Effectifs égaux : 175 cm',
            sol: ['Les poids sont égaux : (170 + 180 + 175) / 3 = 175 cm.', 'La moyenne globale dépend de la répartition des effectifs.'] }
        ] },
      { n: 5, t: 'Salaires : effet de structure', tags: 'moyenne pondérée · effet de structure',
        e: `<p>Salaire mensuel moyen : 2 000 € pour les employés, 4 000 € pour les cadres, inchangés entre 2025 et 2026.</p>${tbl([['', 'Employés', 'Cadres'], ['2025', '80', '20'], ['2026', '60', '40']], { side: true })}`,
        q: [
          { q: 'Salaire moyen de l\'ensemble en 2025 (80 employés à 2 000 €, 20 cadres à 4 000 €) ?', a: 2400, d: 0, u: '€', r: '2025 : 2 400 €',
            sol: ['(80 × 2 000 + 20 × 4 000) / 100 = (160 000 + 80 000) / 100 = 2 400 €.'] },
          { q: 'Salaire moyen de l\'ensemble en 2026 (60 employés à 2 000 €, 40 cadres à 4 000 €) ?', a: 2800, d: 0, u: '€', r: '2026 : 2 800 €',
            sol: ['(60 × 2 000 + 40 × 4 000) / 100 = (120 000 + 160 000) / 100 = 2 800 €.'] },
          { q: 'Taux d\'évolution du salaire moyen entre 2025 (2 400 €) et 2026 (2 800 €), en % ?', a: 16.67, d: 2, alt: [0.1667], u: '%', r: 'Taux : +16,67 %',
            sol: ['(2 800 − 2 400) / 2 400 = 400 / 2 400 ≈ 0,1667, soit +16,67 %.'] },
          { q: 'Les salariés de chaque catégorie ont-ils été augmentés ?', c: ['Oui, tout le monde a été augmenté de 16,67 %', 'Non : les salaires de chaque catégorie sont inchangés, seule la proportion de cadres a augmenté'], a: 1,
            sol: ['Les salaires par catégorie n\'ont pas bougé. La moyenne monte parce qu\'il y a plus de cadres (40 au lieu de 20) : c\'est un effet de structure.'] }
        ] },
      { n: 6, t: 'Lot de 40 pièces : accepté ou refusé ?', tags: 'moyenne · pourcentage',
        e: `<p>Un lot de 40 pièces doit avoir un diamètre de 80 mm. Il est accepté si les deux conditions sont réunies : (1) l'écart entre 80 mm et la moyenne ${XB} est inférieur à 0,05 mm ; (2) au moins 60 % des pièces ont un diamètre d tel que 79,95 ≤ d ≤ 80,05.</p>${tbl([['d (mm)', '79,75', '79,80', '79,85', '79,90', '79,95', '80', '80,05', '80,10', '80,15', '80,20'], ['Effectif', '1', '2', '3', '5', '6', '14', '5', '2', '1', '1']], { side: true })}`,
        q: [
          { q: 'Moyenne ' + XB + ' des 40 mesures (voir le tableau) ?', a: 79.9725, tol: 0.003, u: 'mm', r: XB + ' = 79,9725 mm',
            sol: ['Σn<sub>i</sub>d<sub>i</sub> = 79,75 + 2 × 79,80 + 3 × 79,85 + 5 × 79,90 + 6 × 79,95 + 14 × 80 + 5 × 80,05 + 2 × 80,10 + 80,15 + 80,20 = 3 198,9.', XB + ' = 3 198,9 / 40 = 79,9725 mm.'] },
          { q: 'Pourcentage des pièces avec 79,95 ≤ d ≤ 80,05 (effectifs 6, 14 et 5 sur 40) ?', a: 62.5, d: 1, alt: [0.625], u: '%', r: '62,5 % des pièces dans la tolérance',
            sol: ['6 + 14 + 5 = 25 pièces sur 40 : 25 / 40 = 62,5 %.'] },
          { q: 'Le lot est-il accepté ? (' + XB + ' = 79,9725 mm ; 62,5 % des pièces dans la tolérance)', c: ['Accepté', 'Refusé : la moyenne s\'écarte trop de 80', 'Refusé : moins de 60 % des pièces sont conformes'], a: 0,
            sol: ['|80 − 79,9725| = 0,0275 mm &lt; 0,05 mm : condition 1 vérifiée.', '62,5 % ≥ 60 % : condition 2 vérifiée. Le lot est accepté.'] }
        ] },
      { n: 7, t: 'Interventions journalières : médiane et quartiles', tags: 'médiane · quartiles (discret)',
        e: `<p>Relevé des interventions journalières d'une entreprise de plomberie et d'électricité sur 52 jours ouvrables. Déterminer la médiane et les quartiles Q<sub>1</sub> et Q<sub>3</sub>, puis interpréter.</p>${tbl([['Interventions', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25'], ['Jours', '1', '2', '4', '4', '5', '7', '8', '7', '6', '5', '2', '1']], { side: true })}`,
        q: [
          { q: 'Médiane du nombre d\'interventions (N = 52) ? Effectifs cumulés : 14→1, 15→3, 16→7, 17→11, 18→16, 19→23, 20→31, 21→38, 22→44, 23→49, 24→51, 25→52.', a: 20, d: 1, r: 'Me = 20 interventions',
            sol: ['N = 52 est pair : médiane = moyenne des valeurs de rangs 26 et 27.', 'L\'ECC passe de 23 (valeur 19) à 31 (valeur 20) : les rangs 26 et 27 valent 20. Me = 20.'] },
          { q: 'Premier quartile Q<sub>1</sub> ? (N/4 = 13 ; mêmes effectifs cumulés : 17→11, 18→16)', a: 18, d: 1, r: 'Q<sub>1</sub> = 18',
            sol: ['Q<sub>1</sub> est la plus petite valeur dont l\'ECC atteint 13 : ECC(17) = 11 &lt; 13 ≤ ECC(18) = 16. Q<sub>1</sub> = 18.'] },
          { q: 'Troisième quartile Q<sub>3</sub> ? (3N/4 = 39 ; effectifs cumulés : 21→38, 22→44)', a: 22, d: 1, r: 'Q<sub>3</sub> = 22',
            sol: ['ECC(21) = 38 &lt; 39 ≤ ECC(22) = 44 : Q<sub>3</sub> = 22.'] },
          { q: 'Interprète Me = 20, Q<sub>1</sub> = 18 et Q<sub>3</sub> = 22.',
            sol: ['La moitié des jours compte au plus 20 interventions, l\'autre moitié au moins 20.', 'Au moins 25 % des jours : 18 interventions ou moins ; au moins 75 % des jours : 22 ou moins.', 'La moitié centrale des jours est entre 18 et 22 interventions : écart interquartile 4.'] }
        ] },
      { n: 8, t: 'Barils de lessive : machine bien réglée ?', tags: 'moyenne · écart-type en classes',
        e: `<p>Masse de 80 barils de lessive (marqués 1 kg net), en grammes :</p>${tbl([['Masse', 'Effectif n<sub>i</sub>', 'Fréquence %', 'Centre x<sub>i</sub>', 'n<sub>i</sub>x<sub>i</sub>', 'n<sub>i</sub>x<sub>i</sub>²'], ['[1000 ; 1020[', '', '7,5', '', '', '6 120 600'], ['[1020 ; 1040[', '', '10', '', '', '8 487 200'], ['[1040 ; 1060[', '', '22,5', '', '', '19 845 000*'], ['[1060 ; 1080[', '', '40', '', '', '36 636 800'], ['[1080 ; 1100[', '', '20', '', '', '19 009 600'], ['Total', '80', '', '', '', '90 099 200']], { side: true })}<p class="small muted">* Le TD imprime 19 845 500 : c'est une coquille, 18 × 1050² = 19 845 000.</p><p>La machine est bien réglée si la masse moyenne est entre 1 050 et 1 070 g et si l'écart-type est inférieur à 10 g.</p>`,
        q: [
          { q: 'Complète le tableau : effectifs, centres et n<sub>i</sub>x<sub>i</sub>.', r: 'Effectifs 6, 8, 18, 32, 16 ; Σn<sub>i</sub>x<sub>i</sub> = 84 880',
            sol: ['Effectif = 80 × fréquence : 6, 8, 18, 32, 16. Centres : 1010, 1030, 1050, 1070, 1090.',
              tbl([['Masse', 'n<sub>i</sub>', 'x<sub>i</sub>', 'n<sub>i</sub>x<sub>i</sub>', 'n<sub>i</sub>x<sub>i</sub>²'], ['[1000 ; 1020[', '6', '1010', '6 060', '6 120 600'], ['[1020 ; 1040[', '8', '1030', '8 240', '8 487 200'], ['[1040 ; 1060[', '18', '1050', '18 900', '19 845 000'], ['[1060 ; 1080[', '32', '1070', '34 240', '36 636 800'], ['[1080 ; 1100[', '16', '1090', '17 440', '19 009 600'], ['Total', '80', '', '84 880', '90 099 200']])] },
          { q: 'Montre que la masse moyenne est 1 061 g (Σn<sub>i</sub>x<sub>i</sub> = 84 880, N = 80).', a: 1061, d: 1, u: 'g', r: XB + ' = 1 061 g',
            sol: [XB + ' = 84 880 / 80 = 1 061 g.'] },
          { q: 'Écart-type de la série (à 10<sup>−2</sup> g) ? Données : Σn<sub>i</sub>x<sub>i</sub>² = 90 099 200, N = 80, ' + XB + ' = 1 061.', a: 22.78, d: 2, u: 'g', r: 'σ ≈ 22,78 g',
            sol: ['V = Σn<sub>i</sub>x<sub>i</sub>² / N − ' + XB + '² = 90 099 200 / 80 − 1 061² = 1 126 240 − 1 125 721 = 519.', 'σ = √519 ≈ 22,78 g.'] },
          { q: 'Conclusion : ' + XB + ' = 1 061 g et σ ≈ 22,78 g. La machine est-elle bien réglée ?', c: ['Oui, la moyenne est dans [1 050 ; 1 070]', 'Non : la moyenne convient mais l\'écart-type dépasse 10 g', 'Non : la moyenne est hors de [1 050 ; 1 070]'], a: 1,
            sol: ['1 050 ≤ 1 061 ≤ 1 070 : la moyenne convient.', 'σ ≈ 22,78 g ≥ 10 g : les masses sont trop dispersées. La machine est mal réglée.'] }
        ] },
      { n: 9, t: 'Montants des chèques d\'un supermarché', tags: 'classes inégales · mode · σ · médiane',
        e: `<p>Montants des chèques reçus en une journée :</p>${tbl([['Montant (€)', '[10 ; 15[', '[15 ; 20[', '[20 ; 30[', '[30 ; 50[', '[50 ; 70[', '[70 ; 100[', '[100 ; 150[', '[150 ; 200['], ['Effectif', '13', '57', '70', '88', '152', '81', '60', '12']], { side: true })}`,
        q: [
          { q: 'Montant moyen d\'un chèque ? (N = 533 ; centres 12,5 ; 17,5 ; 25 ; 40 ; 60 ; 85 ; 125 ; 175)', a: 60.10, d: 2, u: '€', r: XB + ' ≈ 60,10 €',
            sol: ['Σn<sub>i</sub>c<sub>i</sub> = 13 × 12,5 + 57 × 17,5 + 70 × 25 + 88 × 40 + 152 × 60 + 81 × 85 + 60 × 125 + 12 × 175 = 32 035.', XB + ' = 32 035 / 533 ≈ 60,10 €.'] },
          { q: 'Classe modale ? Attention : les amplitudes ne sont pas toutes égales.', c: ['[15 ; 20[ : plus grande densité, 57 / 5 = 11,4 chèques par euro', '[50 ; 70[ : plus grand effectif, 152', '[20 ; 30[ : 70 chèques'], a: 0, r: 'Classe modale [15 ; 20[ (densité 11,4)',
            sol: ['Avec des amplitudes différentes, on compare les densités effectif / amplitude, c\'est-à-dire les hauteurs de l\'histogramme.', 'Densités : 2,6 ; 11,4 ; 7 ; 4,4 ; 7,6 ; 2,7 ; 1,2 ; 0,24. La plus grande est 11,4 pour [15 ; 20[.', 'Si ton prof attend « la classe de plus grand effectif », ce serait [50 ; 70[ : signale la différence d\'amplitude sur ta copie.'] },
          { q: 'Étendue de la distribution (classes de 10 € à 200 €) ?', a: 190, d: 0, u: '€', r: 'Étendue : 190 €',
            sol: ['Étendue = 200 − 10 = 190 €.'] },
          { q: 'Écart-type ? Données : Σn<sub>i</sub>c<sub>i</sub>² = 2 641 462,5 ; N = 533 ; ' + XB + ' ≈ 60,1032.', a: 36.65, d: 2, u: '€', r: 'σ ≈ 36,65 €',
            sol: ['V = 2 641 462,5 / 533 − 60,1032² ≈ 4 955,85 − 3 612,39 ≈ 1 343,45.', 'σ = √1 343,45 ≈ 36,65 €.'] },
          { q: 'Montant médian ? (N/2 = 266,5 ; ECC : 13, 70, 140, 228, 380… ; classe [50 ; 70[ d\'effectif 152)', a: 55.07, d: 2, u: '€', r: 'Me ≈ 55,07 €',
            sol: ['L\'ECC passe de 228 à 380 dans [50 ; 70[ : c\'est la classe médiane.', 'Me = 50 + (266,5 − 228) / 152 × 20 ≈ 50 + 5,07 = 55,07 €.', 'La moitié des chèques sont inférieurs à environ 55 €, l\'autre moitié supérieurs.'] }
        ] },
      { n: 10, t: 'Histogramme à classes inégales', tags: 'histogramme',
        e: `<p>Représenter cette série par un histogramme :</p>${tbl([['Modalités', '0-50', '50-100', '100-150', '150-250', '250-300', '300-350', '350-450', '450-550'], ['Effectifs', '5', '15', '10', '25', '25', '15', '7', '13']], { side: true })}<p>Puis on regroupe des classes, avec les mêmes individus :</p>${tbl([['Modalités', '0-150', '150-250', '250-300', '300-350', '350-550'], ['Effectifs', '30', '25', '25', '15', '20']], { side: true })}`,
        q: [
          { q: 'On prend une amplitude de 50 comme unité. Quelle hauteur donner au rectangle [150 ; 250[ (effectif 25, amplitude 100) ?', a: 12.5, d: 1, r: 'Hauteur [150 ; 250[ : 12,5',
            sol: ['La classe est deux fois plus large que l\'unité : hauteur = 25 × 50 / 100 = 12,5.'] },
          { q: 'Trace l\'histogramme de la première série.',
            sol: ['Hauteurs (pour une amplitude de 50) : 5 ; 15 ; 10 ; 12,5 ; 25 ; 15 ; 3,5 ; 6,5.'],
            fig: hist({ b: [0, 50, 100, 150, 250, 300, 350, 450, 550], h: [5, 15, 10, 12.5, 25, 15, 3.5, 6.5], xt: [0, 100, 200, 300, 400, 500], yl: 'effectif pour 50', alt: 'Histogramme de la série initiale' }) },
          { q: 'Série regroupée : hauteur du rectangle [350 ; 550[ (effectif 20, amplitude 200), toujours pour une amplitude de 50 ?', a: 5, d: 1, r: 'Hauteur [350 ; 550[ : 5',
            sol: ['20 × 50 / 200 = 5.'] },
          { q: 'Trace l\'histogramme de la série regroupée. Que remarques-tu ?',
            sol: ['Hauteurs : 10 ; 12,5 ; 25 ; 15 ; 5.', 'Le regroupement lisse la forme : le creux de [100 ; 150[ et la remontée de [450 ; 550[ disparaissent. On perd de l\'information, mais l\'aire totale (l\'effectif) est conservée.'],
            fig: hist({ b: [0, 150, 250, 300, 350, 550], h: [10, 12.5, 25, 15, 5], xt: [0, 100, 200, 300, 400, 500], yl: 'effectif pour 50', alt: 'Histogramme de la série regroupée' }) }
        ] },
      { n: 11, t: 'Âge des acheteurs à crédit : courbe des ECC', tags: 'effectifs cumulés · médiane graphique',
        e: `<p>Une enquête sur l'âge des clients « acheteurs à crédit » donne la courbe des effectifs cumulés croissants (ECC) ci-dessous. Valeurs lues sur la courbe :</p>${tbl([['Âge', '20', '25', '30', '40', '50', '60', '70'], ['ECC', '0', '112', '304', '544', '696', '760', '800']], { side: true })}${curve({ pts: [[20, 0], [25, 112], [30, 304], [40, 544], [50, 696], [60, 760], [70, 800]], xt: [20, 25, 30, 40, 50, 60, 70], yt: [0, 200, 400, 600, 800], x0: 20, x1: 70, y1: 840, xl: 'âge', yl: 'ECC', alt: 'Courbe des effectifs cumulés croissants' })}<p>Présenter un tableau (âge, effectifs, fréquence %, ECC, ECD), puis répondre aux questions.</p>`,
        q: [
          { q: 'Construis le tableau des classes [20 ; 25[, [25 ; 30[, [30 ; 40[, [40 ; 50[, [50 ; 60[, [60 ; 70[ avec effectifs, fréquences et cumuls.', r: 'Effectifs 112, 192, 240, 152, 64, 40 (N = 800)',
            sol: ['Effectif d\'une classe = différence de deux ECC successifs.', tbl([['Âge', 'Effectif', 'Fréq. %', 'ECC', 'ECD'], ['[20 ; 25[', '112', '14', '112', '800'], ['[25 ; 30[', '192', '24', '304', '688'], ['[30 ; 40[', '240', '30', '544', '496'], ['[40 ; 50[', '152', '19', '696', '256'], ['[50 ; 60[', '64', '8', '760', '104'], ['[60 ; 70[', '40', '5', '800', '40']])] },
          { q: 'Nombre d\'acheteurs à crédit de 40 ans ou plus ? (ECC à 40 ans : 544 sur 800)', a: 256, d: 0, r: '256 acheteurs ont 40 ans ou plus',
            sol: ['800 − 544 = 256. C\'est aussi l\'ECD de la classe [40 ; 50[.'] },
          { q: 'Âge médian ? (N/2 = 400 ; ECC 304 à 30 ans et 544 à 40 ans)', a: 34, d: 1, u: 'ans', r: 'Me = 34 ans',
            sol: ['La classe médiane est [30 ; 40[ (l\'ECC passe de 304 à 544).', 'Me = 30 + (400 − 304) / 240 × 10 = 30 + 4 = 34 ans.'] },
          { q: 'Porte la courbe des ECD sur le graphique. Que constates-tu ?',
            sol: ['Points (borne inférieure ; ECD) : (20 ; 800), (25 ; 688), (30 ; 496), (40 ; 256), (50 ; 104), (60 ; 40), (70 ; 0).', 'Les deux courbes se coupent au point (Me ; N/2) = (34 ; 400) : l\'abscisse du croisement est la médiane.'],
            fig: curve({ pts: [[20, 0], [25, 112], [30, 304], [40, 544], [50, 696], [60, 760], [70, 800]], pts2: [[20, 800], [25, 688], [30, 496], [40, 256], [50, 104], [60, 40], [70, 0]], mark: [34, 400], markLabel: 'Me = 34', xt: [20, 30, 40, 50, 60, 70], yt: [0, 200, 400, 600, 800], x0: 20, x1: 70, y1: 840, xl: 'âge', alt: 'Courbes ECC et ECD qui se croisent à la médiane' }) }
        ] },
      { n: 12, t: 'Prix des tables vendues', tags: 'mode · étendue · σ · médiane · quartiles',
        e: `<p>Nombre de tables vendues selon leur prix :</p>${tbl([['Prix (€)', '[150 ; 250[', '[250 ; 350[', '[350 ; 450[', '[450 ; 550[', '[550 ; 850['], ['Effectif', '320', '500', '700', '280', '200']], { side: true })}`,
        q: [
          { q: 'Classe modale ? (la dernière classe est trois fois plus large que les autres)', c: ['[350 ; 450[', '[550 ; 850[', '[250 ; 350['], a: 0, r: 'Classe modale [350 ; 450[',
            sol: ['Densités : 3,2 ; 5 ; 7 ; 2,8 ; 0,67 tables par euro. La plus grande : [350 ; 450[, qui a aussi le plus grand effectif (700).'] },
          { q: 'Étendue de la série (prix de 150 € à 850 €) ?', a: 700, d: 0, u: '€', r: 'Étendue : 700 €',
            sol: ['850 − 150 = 700 €.'] },
          { q: 'Prix moyen ' + XB + ' ? (N = 2 000 ; centres 200, 300, 400, 500, 700)', a: 387, d: 1, u: '€', r: XB + ' = 387 €',
            sol: ['Σn<sub>i</sub>c<sub>i</sub> = 320 × 200 + 500 × 300 + 700 × 400 + 280 × 500 + 200 × 700 = 774 000.', XB + ' = 774 000 / 2 000 = 387 €.'] },
          { q: 'Écart-type σ ? Données : Σn<sub>i</sub>c<sub>i</sub>² = 337 800 000 ; N = 2 000 ; ' + XB + ' = 387.', a: 138.31, d: 2, u: '€', r: 'σ ≈ 138,31 €',
            sol: ['V = 337 800 000 / 2 000 − 387² = 168 900 − 149 769 = 19 131.', 'σ = √19 131 ≈ 138,31 €.'] },
          { q: 'Tableau des fréquences cumulées croissantes et décroissantes.', r: 'FCC : 0,16 ; 0,41 ; 0,76 ; 0,90 ; 1',
            sol: [tbl([['Prix', 'Fréq.', 'FCC', 'FCD'], ['[150 ; 250[', '0,16', '0,16', '1'], ['[250 ; 350[', '0,25', '0,41', '0,84'], ['[350 ; 450[', '0,35', '0,76', '0,59'], ['[450 ; 550[', '0,14', '0,90', '0,24'], ['[550 ; 850[', '0,10', '1', '0,10']])] },
          { q: 'Trace la courbe des fréquences cumulées croissantes et lis la médiane.',
            sol: ['Points (borne supérieure ; FCC) : (150 ; 0), (250 ; 0,16), (350 ; 0,41), (450 ; 0,76), (550 ; 0,90), (850 ; 1).', 'On lit l\'abscisse du point d\'ordonnée 0,5 : environ 376 €.'],
            fig: curve({ pts: [[150, 0], [250, 0.16], [350, 0.41], [450, 0.76], [550, 0.9], [850, 1]], mark: [375.7, 0.5], markLabel: 'Me ≈ 376', xt: [150, 250, 350, 450, 550, 650, 750, 850], yt: [0, 0.25, 0.5, 0.75, 1], x0: 150, x1: 850, y1: 1.05, xl: 'prix (€)', alt: 'Courbe des fréquences cumulées croissantes' }) },
          { q: 'Calcule la médiane. (FCC 0,41 à 350 € et 0,76 à 450 €)', a: 375.71, d: 2, u: '€', r: 'Me ≈ 375,71 €',
            sol: ['Me = 350 + (0,5 − 0,41) / 0,35 × 100 ≈ 350 + 25,71 = 375,71 €.', 'La moitié des tables vendues coûtent moins de 375,71 €.'] },
          { q: 'Premier quartile Q<sub>1</sub> ? (FCC 0,16 à 250 € et 0,41 à 350 €)', a: 286, d: 1, u: '€', r: 'Q<sub>1</sub> = 286 €',
            sol: ['Q<sub>1</sub> = 250 + (0,25 − 0,16) / 0,25 × 100 = 250 + 36 = 286 €. Q<sub>2</sub> = Me ≈ 375,71 €.'] },
          { q: 'Troisième quartile Q<sub>3</sub> ? (FCC 0,41 à 350 € et 0,76 à 450 €)', a: 447.14, d: 2, u: '€', r: 'Q<sub>3</sub> ≈ 447,14 €',
            sol: ['Q<sub>3</sub> = 350 + (0,75 − 0,41) / 0,35 × 100 ≈ 350 + 97,14 = 447,14 €.'] }
        ] },
      { n: 13, t: 'Temps de révision et note : covariance', tags: 'deux variables · covariance',
        e: `<p>Pour 6 étudiants, temps de révision x (heures) et note y (/20) :</p>${tbl([['x', '1', '2', '3', '4', '5', '6'], ['y', '8', '11', '10', '14', '15', '17']], { side: true })}`,
        q: [
          { q: 'Calcule ' + XB + ' et ' + YB + '.', a: [3.5, 12.5], l: [XB, YB], d: 2, r: XB + ' = 3,5 ; ' + YB + ' = 12,5',
            sol: [XB + ' = 21 / 6 = 3,5 ; ' + YB + ' = 75 / 6 = 12,5.'] },
          { q: 'Covariance de x et y ? (' + XB + ' = 3,5 ; ' + YB + ' = 12,5 ; Σx<sub>i</sub>y<sub>i</sub> = 293)', a: 5.083, d: 3, r: 'Cov(x, y) ≈ 5,083',
            sol: ['Σx<sub>i</sub>y<sub>i</sub> = 8 + 22 + 30 + 56 + 75 + 102 = 293.', 'Cov = 293 / 6 − 3,5 × 12,5 = 48,833 − 43,75 ≈ 5,083.'] },
          { q: 'La covariance (≈ 5,083) est-elle positive ou négative ? Interprète.', c: ['Positive : plus on révise, plus la note a tendance à être haute', 'Négative : plus on révise, plus la note baisse', 'Positive : réviser cause une meilleure note'], a: 0,
            sol: ['Cov &gt; 0 : x et y varient dans le même sens. On ne peut pas parler de cause avec une covariance seule.'] },
          { q: 'Peut-on conclure, avec la seule covariance, que la liaison est forte ?', c: ['Oui, 5,083 est une grande valeur', 'Non : la covariance dépend des unités (en minutes elle vaudrait 60 × 5,083 ≈ 305)'], a: 1,
            sol: ['En minutes, les écarts x − ' + XB + ' sont multipliés par 60, la covariance aussi : ≈ 305 pour le même lien.', 'La force se mesure avec r (ici r ≈ 0,961).'] }
        ] },
      { n: 14, t: 'Publicité et chiffre d\'affaires', tags: 'covariance · coefficient r',
        e: `<p>Pendant 5 mois, dépenses publicitaires x et chiffre d'affaires y (en k€) :</p>${tbl([['Mois', '1', '2', '3', '4', '5'], ['x (k€)', '2', '3', '5', '6', '9'], ['y (k€)', '22', '25', '31', '30', '37']], { side: true })}`,
        q: [
          { q: 'Calcule ' + XB + ' et ' + YB + '.', a: [5, 29], l: [XB, YB], d: 2, r: XB + ' = 5 ; ' + YB + ' = 29',
            sol: [XB + ' = 25 / 5 = 5 ; ' + YB + ' = 145 / 5 = 29.'] },
          { q: 'Covariance ? (' + XB + ' = 5 ; ' + YB + ' = 29 ; Σx<sub>i</sub>y<sub>i</sub> = 787)', a: 12.4, d: 2, r: 'Cov(x, y) = 12,4',
            sol: ['Σx<sub>i</sub>y<sub>i</sub> = 44 + 75 + 155 + 180 + 333 = 787.', 'Cov = 787 / 5 − 5 × 29 = 157,4 − 145 = 12,4.'] },
          { q: 'Interprète le signe de Cov = 12,4.', c: ['Les mois où la pub augmente, le chiffre d\'affaires a tendance à augmenter', 'Le chiffre d\'affaires baisse quand la pub augmente'], a: 0,
            sol: ['Cov &gt; 0 : les deux variables évoluent dans le même sens.'] },
          { q: 'Coefficient de corrélation r (à 10<sup>−3</sup>) ? Données : Cov = 12,4 ; V(x) = 6 ; V(y) = 26,8.', a: 0.978, d: 3, r: 'r ≈ 0,978',
            sol: ['V(x) = Σx²/5 − 5² = 155/5 − 25 = 6 ; V(y) = Σy²/5 − 29² = 4 339/5 − 841 = 26,8.', 'r = 12,4 / √(6 × 26,8) = 12,4 / 12,681 ≈ 0,978.', 'r est proche de 1 : forte liaison linéaire positive, ce que la covariance seule ne permettait pas d\'affirmer.'] }
        ] },
      { n: 15, t: 'Dépenses marketing 2018–2025 : droite de tendance', tags: 'moindres carrés · r · série chronologique',
        e: `<p>Dépenses marketing annuelles de la société E. (milliers d'euros) :</p>${tbl([['Année', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'], ['Rang x<sub>i</sub>', '1', '2', '3', '4', '5', '6', '7', '8'], ['y<sub>i</sub> (k€)', '148', '155', '165', '170', '185', '190', '198', '205']], { side: true })}`,
        q: [
          { q: 'Équation de la droite de tendance y = ax + b (a à 10<sup>−3</sup>, b à 10<sup>−2</sup>). ' + TIP_REG, a: [8.381, 139.29], l: ['a', 'b'], d: [3, 2], r: 'y = 8,381x + 139,29',
            sol: [XB + ' = 4,5 ; ' + YB + ' = 1 416 / 8 = 177.',
              tbl([['x<sub>i</sub>', 'y<sub>i</sub>', 'x − ' + XB, 'y − ' + YB, 'produit', '(x − ' + XB + ')²', '(y − ' + YB + ')²'], ['1', '148', '−3,5', '−29', '101,5', '12,25', '841'], ['2', '155', '−2,5', '−22', '55', '6,25', '484'], ['3', '165', '−1,5', '−12', '18', '2,25', '144'], ['4', '170', '−0,5', '−7', '3,5', '0,25', '49'], ['5', '185', '0,5', '8', '4', '0,25', '64'], ['6', '190', '1,5', '13', '19,5', '2,25', '169'], ['7', '198', '2,5', '21', '52,5', '6,25', '441'], ['8', '205', '3,5', '28', '98', '12,25', '784'], ['Total', '', '0', '0', '352', '42', '2 976']]),
              'a = 352 / 42 ≈ 8,381 ; b = 177 − 8,381 × 4,5 ≈ 139,29.'] },
          { q: 'Coefficient de corrélation r (à 10<sup>−3</sup>) ? Données : Σ produits = 352 ; Σ(x − ' + XB + ')² = 42 ; Σ(y − ' + YB + ')² = 2 976.', a: 0.996, d: 3, r: 'r ≈ 0,996',
            sol: ['r = 352 / √(42 × 2 976) = 352 / 353,54 ≈ 0,996.', 'Très proche de 1 : l\'ajustement affine est très bon.'] },
          { q: 'Question en plus : estimation des dépenses en 2026 (rang 9) avec y = 8,381x + 139,29 ?', a: 214.72, tol: 0.1, u: 'k€', r: 'Estimation 2026 : ≈ 214,7 k€',
            sol: ['y = 8,381 × 9 + 139,29 ≈ 214,72 k€.'] }
        ] },
      { n: 16, t: 'Connexions et commandes de 10 sites', tags: 'moindres carrés · r',
        e: `<p>Dix sites de commerce électronique : connexions x et commandes y sur une semaine.</p>${tbl([['Site', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], ['x', '80', '100', '115', '110', '70', '125', '105', '90', '110', '95'], ['y', '32', '50', '62', '56', '8', '80', '62', '50', '62', '38']], { side: true })}`,
        q: [
          { q: 'Droite des moindres carrés de y en x : donne a et b. ' + TIP_REG, a: [1.14, -64], l: ['a', 'b'], d: [2, 1], r: 'y = 1,14x − 64',
            sol: [XB + ' = 1 000 / 10 = 100 ; ' + YB + ' = 500 / 10 = 50 : les écarts sont des nombres ronds.',
              tbl([['x', 'y', 'x − ' + XB, 'y − ' + YB, 'produit', '(x − ' + XB + ')²', '(y − ' + YB + ')²'], ['80', '32', '−20', '−18', '360', '400', '324'], ['100', '50', '0', '0', '0', '0', '0'], ['115', '62', '15', '12', '180', '225', '144'], ['110', '56', '10', '6', '60', '100', '36'], ['70', '8', '−30', '−42', '1 260', '900', '1 764'], ['125', '80', '25', '30', '750', '625', '900'], ['105', '62', '5', '12', '60', '25', '144'], ['90', '50', '−10', '0', '0', '100', '0'], ['110', '62', '10', '12', '120', '100', '144'], ['95', '38', '−5', '−12', '60', '25', '144'], ['Total', '', '0', '0', '2 850', '2 500', '3 600']]),
              'a = 2 850 / 2 500 = 1,14 ; b = 50 − 1,14 × 100 = −64.'],
            fig: scat({ pts: [[80, 32], [100, 50], [115, 62], [110, 56], [70, 8], [125, 80], [105, 62], [90, 50], [110, 62], [95, 38]], fn: function (x) { return 1.14 * x - 64; }, x0: 65, x1: 130, y0: 0, y1: 90, xt: [70, 80, 90, 100, 110, 120, 130], yt: [0, 20, 40, 60, 80], xl: 'connexions', yl: 'commandes', alt: 'Nuage et droite y = 1,14x − 64' }) },
          { q: 'Coefficient de corrélation r ? Données : Σ produits = 2 850 ; Σ(x − ' + XB + ')² = 2 500 ; Σ(y − ' + YB + ')² = 3 600.', a: 0.95, d: 3, r: 'r = 0,95',
            sol: ['r = 2 850 / √(2 500 × 3 600) = 2 850 / 3 000 = 0,95.', 'Forte corrélation linéaire positive : plus un site a de connexions, plus il a de commandes.'] }
        ] },
      { n: 17, t: 'Coût de production : ajustement exponentiel', tags: 'changement de variable z = ln y',
        e: `<p>Coût total de production y (centaines d'euros) selon le nombre d'articles x (capacité maximale : 80 articles) :</p>${tbl([['x', '10', '20', '30', '50', '70', '80'], ['y', '2', '3', '5', '8,5', '18', '38']], { side: true })}${scat({ pts: [[10, 2], [20, 3], [30, 5], [50, 8.5], [70, 18], [80, 38]], x0: 0, x1: 85, y0: 0, y1: 42, xt: [0, 10, 20, 30, 40, 50, 60, 70, 80], yt: [0, 10, 20, 30, 40], xl: 'articles', yl: 'coût', alt: 'Nuage de points du coût de production' })}`,
        q: [
          { q: 'On renonce à un ajustement affine. Justifie ce choix à partir du nuage.',
            sol: ['Les points ne sont pas alignés : le coût augmente de plus en plus vite (forme exponentielle). Une droite donnerait de mauvaises estimations aux extrémités.'] },
          { q: 'On pose z = ln y. Calcule z pour x = 50 (y = 8,5) et pour x = 80 (y = 38), à 10<sup>−2</sup>.', a: [2.14, 3.64], l: ['z(50)', 'z(80)'], d: 2, r: 'z : 0,69 ; 1,10 ; 1,61 ; 2,14 ; 2,89 ; 3,64',
            sol: ['ln 8,5 ≈ 2,14 ; ln 38 ≈ 3,64.', 'Tableau complet : z = 0,69 ; 1,10 ; 1,61 ; 2,14 ; 2,89 ; 3,64.'] },
          { q: '(Facultatif) Montre que la droite de régression de z en x est z = 0,04x + 0,31. Données : x = 10, 20, 30, 50, 70, 80 ; z = 0,69 ; 1,10 ; 1,61 ; 2,14 ; 2,89 ; 3,64.',
            sol: [XB + ' ≈ 43,33 ; z̄ ≈ 2,012 ; Σ produits ≈ 154,67 ; Σ(x − ' + XB + ')² ≈ 3 933,33.', 'a ≈ 154,67 / 3 933,33 ≈ 0,039 ≈ 0,04 ; b ≈ 2,012 − 0,0393 × 43,33 ≈ 0,31.'] },
          { q: 'Déduis y en fonction de x sous la forme y = B e<sup>0,04x</sup> : donne B à 10<sup>−2</sup> (z = 0,04x + 0,31).', a: 1.36, d: 2, r: 'y = e<sup>0,31</sup> e<sup>0,04x</sup> ≈ 1,36 e<sup>0,04x</sup>',
            sol: ['y = e<sup>z</sup> = e<sup>0,04x + 0,31</sup> = e<sup>0,31</sup> × e<sup>0,04x</sup>.', 'e<sup>0,31</sup> ≈ 1,36, donc y ≈ 1,36 e<sup>0,04x</sup>.'] },
          { q: 'Estimation, à un euro près, du coût de production de 60 articles ? (y en centaines d\'euros, y = e<sup>0,04x + 0,31</sup>)', a: 1503, tol: 1.01, u: '€', r: 'Coût de 60 articles ≈ 1 503 €',
            sol: ['z = 0,04 × 60 + 0,31 = 2,71 ; y = e<sup>2,71</sup> ≈ 15,03 centaines d\'euros.', 'Soit environ 1 503 €.'] }
        ] },
      { n: 18, t: 'Minerai rare : ajustement exponentiel', tags: 'z = ln y · r · estimation',
        e: `<p>Production annuelle x (tonnes, au plus 2 t) et coût total y (milliers d'euros) :</p>${tbl([['x (t)', '0,52', '0,77', '1,01', '1,36', '1,81'], ['y (k€)', '186,7', '230,9', '283,1', '381,3', '558,9']], { side: true })}<p>La nature de l'activité suggère un ajustement exponentiel. On pose z = ln y.</p>`,
        q: [
          { q: 'Calcule z = ln y pour x = 0,52 (y = 186,7) et pour x = 1,81 (y = 558,9), à 10<sup>−3</sup>.', a: [5.230, 6.326], l: ['z(0,52)', 'z(1,81)'], d: 3, r: 'z : 5,230 ; 5,442 ; 5,646 ; 5,944 ; 6,326',
            sol: ['ln 186,7 ≈ 5,230 ; ln 558,9 ≈ 6,326.', 'Tableau complet : 5,230 ; 5,442 ; 5,646 ; 5,944 ; 6,326.'] },
          { q: 'Coefficient de corrélation linéaire entre x et z (à 10<sup>−3</sup>) ? Données : x = 0,52 ; 0,77 ; 1,01 ; 1,36 ; 1,81 et z = 5,230 ; 5,442 ; 5,646 ; 5,944 ; 6,326.', a: 1, d: 3, r: 'r(x, z) ≈ 1,000',
            sol: ['À la calculatrice ou avec le tableau : Σ produits ≈ 0,8710 ; Σ(x − ' + XB + ')² ≈ 1,0249 ; Σ(z − z̄)² ≈ 0,7402.', 'r ≈ 0,8710 / √(1,0249 × 0,7402) ≈ 0,99999… ≈ 1,000 : la relation x ↦ ln y est presque parfaitement affine.'] },
          { q: 'Par les moindres carrés, montre qu\'on obtient z = 0,85x + 4,79 (coefficients à 10<sup>−2</sup>).',
            sol: [XB + ' = 1,094 ; z̄ = 5,7176.', 'a = 0,8710 / 1,0249 ≈ 0,85 ; b = 5,7176 − 0,8498 × 1,094 ≈ 4,79.'] },
          { q: 'Déduis y = B e<sup>ax</sup> : quelle valeur de B (entier le plus proche) avec z = 0,85x + 4,79 ?', a: 120, d: 0, r: 'y ≈ 120 e<sup>0,85x</sup>',
            sol: ['y = e<sup>0,85x + 4,79</sup> = e<sup>4,79</sup> × e<sup>0,85x</sup> ; e<sup>4,79</sup> ≈ 120,3, donc B = 120.'] },
          { q: 'Estimation du coût de production pour 2 tonnes, avec y = 120 e<sup>0,85x</sup> (en k€) ?', a: 656.87, tol: 0.6, u: 'k€', r: 'Coût pour 2 t ≈ 656,9 k€',
            sol: ['y = 120 × e<sup>1,7</sup> ≈ 120 × 5,474 ≈ 656,9 k€, soit environ 656 900 €.'] }
        ] },
      { n: 19, t: 'Ventes de logiciels : y = ln(z / x)', tags: 'changement de variable · r négatif',
        e: `<p>Nombre de logiciels vendus chaque mois par des concurrents (extrait du graphique du TD) :</p>${tbl([['Rang du mois x', '1', '6', '11', '16', '21', '26', '31', '36'], ['Logiciels vendus z', '60', '250', '340', '360', '320', '270', '220', '200']], { side: true })}${scat({ pts: [[1, 60], [6, 250], [11, 340], [16, 360], [21, 320], [26, 270], [31, 220], [36, 200]], x0: 0, x1: 40, y0: 0, y1: 400, xt: [0, 5, 10, 15, 20, 25, 30, 35, 40], yt: [0, 100, 200, 300, 400], xl: 'rang du mois', yl: 'ventes', alt: 'Ventes mensuelles : hausse puis baisse' })}<p>On pose y = ln(z / x). La corrélation entre x et y est forte (r ≈ −0,999).</p>`,
        q: [
          { q: 'Sans calcul, pourquoi un ajustement linéaire de z en x n\'est-il pas approprié ?',
            sol: ['Les ventes montent jusqu\'au 16ᵉ mois environ puis redescendent : le nuage n\'est pas monotone, aucune droite ne peut le représenter.'] },
          { q: 'Calcule y = ln(z / x) pour x = 6 (z = 250) et pour x = 21 (z = 320), au centième.', a: [3.73, 2.72], l: ['y(6)', 'y(21)'], d: 2, r: 'y : 4,09 ; 3,73 ; 3,43 ; 3,11 ; 2,72 ; 2,34 ; 1,96 ; 1,71',
            sol: ['ln(250 / 6) = ln 41,67 ≈ 3,73 ; ln(320 / 21) = ln 15,24 ≈ 2,72.', 'Tableau complet : 4,09 ; 3,73 ; 3,43 ; 3,11 ; 2,72 ; 2,34 ; 1,96 ; 1,71.'] },
          { q: 'Avec ln(z / x) = −0,07x + 4, exprime z en fonction de x. Donne la constante e<sup>4</sup> (à 0,1 près) dans z = e<sup>4</sup> x e<sup>−0,07x</sup>.', a: 54.6, tol: 0.06, r: 'z = x e<sup>4 − 0,07x</sup> ≈ 54,6 x e<sup>−0,07x</sup>',
            sol: ['z / x = e<sup>−0,07x + 4</sup>, donc z = x e<sup>4 − 0,07x</sup> = e<sup>4</sup> × x × e<sup>−0,07x</sup>.', 'e<sup>4</sup> ≈ 54,6. (La régression exacte donne a ≈ −0,069 et b ≈ 4,17 : l\'énoncé arrondit plus largement.)'] },
          { q: 'Question en plus : ventes estimées au 40ᵉ mois avec z = x e<sup>4 − 0,07x</sup> ?', a: 132.8, tol: 1, r: 'Estimation au 40ᵉ mois : ≈ 133 logiciels',
            sol: ['z = 40 × e<sup>4 − 2,8</sup> = 40 × e<sup>1,2</sup> ≈ 40 × 3,320 ≈ 133 logiciels.'] }
        ] },
      { n: 20, t: 'Forum : changement de variable z = e<sup>y</sup>', tags: 'z = e^y · y = ln(ax + b)',
        e: `<p>n : mois écoulés depuis le lancement du forum ; x<sub>n</sub> : visiteurs du site (milliers) ; y<sub>n</sub> : visiteurs ayant posté un message (milliers).</p>${tbl([['n', '1', '2', '3', '4', '5', '6'], ['x<sub>n</sub>', '0,8', '1,0', '1,1', '1,5', '2,5', '3,1'], ['y<sub>n</sub>', '0,4', '0,4', '0,6', '0,8', '1,0', '1,1']], { side: true })}<p>On pose z<sub>n</sub> = e<sup>y<sub>n</sub></sup>, valeurs arrondies au dixième.</p>`,
        q: [
          { q: 'Calcule z = e<sup>y</sup> pour y = 0,6 et pour y = 1,1, au dixième.', a: [1.8, 3.0], l: ['z(n = 3)', 'z(n = 6)'], d: 1, r: 'z : 1,5 ; 1,5 ; 1,8 ; 2,2 ; 2,7 ; 3,0',
            sol: ['e<sup>0,6</sup> ≈ 1,82 → 1,8 ; e<sup>1,1</sup> ≈ 3,00 → 3,0.', 'Tableau complet : 1,5 ; 1,5 ; 1,8 ; 2,2 ; 2,7 ; 3,0.'] },
          { q: 'Montre que la droite de régression de z en x est z = 0,7x + 1,0. Données : x = 0,8 ; 1,0 ; 1,1 ; 1,5 ; 2,5 ; 3,1 et z = 1,5 ; 1,5 ; 1,8 ; 2,2 ; 2,7 ; 3,0.',
            sol: [XB + ' ≈ 1,667 ; z̄ ≈ 2,117 ; Σ produits ≈ 2,863 ; Σ(x − ' + XB + ')² ≈ 4,293.', 'a ≈ 2,863 / 4,293 ≈ 0,667 ≈ 0,7 ; b ≈ 2,117 − 0,667 × 1,667 ≈ 1,0.'] },
          { q: 'Déduis y en fonction de x à partir de z = e<sup>y</sup> = 0,7x + 1,0.', c: ['y = e<sup>0,7x + 1</sup>', 'y = ln(0,7x + 1)', 'y = 0,7 ln x + 1'], a: 1, r: 'y = ln(0,7x + 1)',
            sol: ['e<sup>y</sup> = 0,7x + 1 ⇒ y = ln(0,7x + 1) (possible car 0,7x + 1 &gt; 0).'] },
          { q: 'Estimation du nombre de visiteurs ayant posté un message quand le site aura 10 000 visiteurs (x = 10), à l\'unité, avec y = ln(0,7x + 1) en milliers ?', a: 2079, tol: 1.01, r: '≈ 2 079 visiteurs',
            sol: ['y = ln(0,7 × 10 + 1) = ln 8 ≈ 2,079 milliers.', 'Soit environ 2 079 visiteurs.'] }
        ] }
    ]
  });
})();
