/* Parcours « Partir de zéro » : chapitres III et IV en 15 leçons courtes (idée, exemple corrigé, à retenir, vérifications). */
(function () {
  var H = OM.h, F = H.F, R = H.R, tbl = H.tbl, MB = H.MB;
  var XB = 'x̄';
  var S = OM.S;

  var L = [
    /* ===================== CHAPITRE III ===================== */
    { ch: 3, h: 'Variable aléatoire, loi, espérance, variance', min: 25, cours: 'cours-3',
      idee: `<p>Une <strong>variable aléatoire</strong> X, c'est un nombre qui dépend du hasard : le gain à un jeu, le nombre de pannes, une durée… Sa <strong>loi</strong> est le tableau « chaque valeur possible → sa probabilité ». Les probabilités du tableau font toujours 1 au total.</p>
        <p>L'<strong>espérance</strong> E(X) est la moyenne qu'on obtiendrait en répétant l'expérience une infinité de fois. La <strong>variance</strong> V(X) mesure la dispersion autour de cette moyenne ; l'<strong>écart-type</strong> σ = √V est dans la même unité que X.</p>`,
      exemple: `<p>On lance un dé équilibré. 6 : on gagne 18 €. Nombre impair : on gagne 10 €. Sinon (2 ou 4) on perd 30 €. X = gain.</p>
        ${tbl([['x<sub>i</sub>', '−30', '10', '18'], ['P(X = x<sub>i</sub>)', '2/6 = 1/3', '3/6 = 1/2', '1/6']], { side: true })}
        <p>Vérification : 1/3 + 1/2 + 1/6 = 1.</p>
        <p>E(X) = Σ x<sub>i</sub>p<sub>i</sub> = −30 × 1/3 + 10 × 1/2 + 18 × 1/6 = −10 + 5 + 3 = <strong>−2</strong> : en moyenne on perd 2 € par partie.</p>
        <p>E(X²) = 900 × 1/3 + 100 × 1/2 + 324 × 1/6 = 300 + 50 + 54 = 404.</p>
        <p>V(X) = E(X²) − E(X)² = 404 − 4 = <strong>400</strong>, donc σ = <strong>20 €</strong>.</p>`,
      retiens: ['E(X) = Σ x<sub>i</sub> p<sub>i</sub>', 'V(X) = E(X²) − [E(X)]² (moyenne des carrés moins carré de la moyenne) ; σ = √V', 'E(aX + b) = aE(X) + b ; V(aX + b) = a²V(X) : le « + b » disparaît, le a passe au carré', 'E(X + Y) = E(X) + E(Y) toujours ; V(X + Y) = V(X) + V(Y) seulement si X et Y sont indépendantes'],
      q: [
        { q: 'Même jeu, mais tous les gains sont doublés et on reçoit un bonus de 5 € : Y = 2X + 5. E(Y) ?', a: 1, d: 2, sol: ['E(Y) = 2E(X) + 5 = 2 × (−2) + 5 = 1.'] },
        { q: 'V(Y) pour Y = 2X + 5 (on sait V(X) = 400) ?', a: 1600, d: 1, sol: ['V(Y) = 2² × V(X) = 4 × 400 = 1 600 (le + 5 ne change pas la dispersion).'] },
        { q: 'Une loi : X prend 0, 1, 2 avec P = 0,5 ; 0,3 ; 0,2. Calcule E(X).', a: 0.7, d: 2, sol: ['E(X) = 0 × 0,5 + 1 × 0,3 + 2 × 0,2 = 0,3 + 0,4 = 0,7.'] },
        { q: 'Même loi (0, 1, 2 avec 0,5 ; 0,3 ; 0,2). Calcule V(X).', a: 0.61, d: 2, hint: 'Calcule d\'abord E(X²) = Σ x<sub>i</sub>² p<sub>i</sub>.', sol: ['E(X²) = 0 + 1 × 0,3 + 4 × 0,2 = 1,1.', 'V(X) = 1,1 − 0,7² = 1,1 − 0,49 = 0,61.'] }
      ] },

    { ch: 3, h: 'Fonction de répartition, discret et continu', min: 15, cours: 'cours-3',
      idee: `<p>La <strong>fonction de répartition</strong> F(x) = P(X ≤ x) : la probabilité d'être <em>au plus</em> x. Elle part de 0 et monte jusqu'à 1.</p>
        <p><strong>Discrète</strong> (valeurs isolées : 0, 1, 2…) : F est un escalier, elle saute à chaque valeur.</p>
        <p><strong>Continue</strong> (n'importe quelle valeur d'un intervalle : une durée, une masse) : on a une <strong>densité</strong> f, et une probabilité est une <em>aire</em> sous la courbe : P(a ≤ X ≤ b) = F(b) − F(a). Une valeur exacte a une probabilité nulle : P(X = a) = 0, donc ≤ ou &lt;, c'est pareil.</p>`,
      exemple: `<p>Avec le jeu de dé (−30 ; 10 ; 18 avec 1/3 ; 1/2 ; 1/6) :</p>
        <p>F(x) = 0 si x &lt; −30 · 1/3 si −30 ≤ x &lt; 10 · 1/3 + 1/2 = 5/6 si 10 ≤ x &lt; 18 · 1 si x ≥ 18.</p>
        <p>P(X ≤ 10) = F(10) = 5/6. P(X &gt; 10) = 1 − F(10) = 1/6.</p>`,
      retiens: ['F(x) = P(X ≤ x) ; P(a &lt; X ≤ b) = F(b) − F(a)', 'P(X &gt; x) = 1 − F(x)', 'Discret : P(X ≥ t) = 1 − P(X ≤ t − 1) (attention au −1)', 'Continu : P(X = a) = 0'],
      q: [
        { q: 'Jeu de dé : P(X ≤ 10), au millième ?', a: 5 / 6, d: 3, sol: ['F(10) = 1/3 + 1/2 = 5/6 ≈ 0,833.'] },
        { q: 'X est une durée (variable continue). P(X = 3) vaut :', c: ['0', 'F(3)', '1 − F(3)'], a: 0, sol: ['Pour une variable continue, une valeur isolée a une probabilité nulle.'] },
        { q: 'X discrète à valeurs entières. P(X ≥ 4) s\'écrit :', c: ['1 − P(X ≤ 4)', '1 − P(X ≤ 3)', 'P(X ≤ 4)'], a: 1, sol: ['X ≥ 4 est le contraire de X ≤ 3 (les entiers 0, 1, 2, 3).'] }
      ] },

    { ch: 3, h: 'Loi de Bernoulli et loi binomiale', min: 25, cours: 'cours-3', td: 'td-3-4',
      idee: `<p><strong>Bernoulli ℬ(p)</strong> : une seule épreuve, deux issues. Succès (X = 1) avec probabilité p, échec (X = 0) avec 1 − p.</p>
        <p><strong>Binomiale ℬ(n, p)</strong> : on répète n fois la même épreuve, de façon <strong>identique et indépendante</strong>, et X <strong>compte les succès</strong>. Pour l'utiliser, justifie toujours ces trois points : n épreuves identiques et indépendantes, deux issues, p constant.</p>
        ${MB('P(X = k) = (<sup>n</sup><sub>k</sub>) p<sup>k</sup> (1 − p)<sup>n−k</sup>')}
        <p>(<sup>n</sup><sub>k</sub>) = « k parmi n » = nombre de façons de placer les k succès : touche nCr de la calculatrice, ou C(n;k) dans les cases de réponse.</p>`,
      exemple: `<p>QCM de 5 questions, 4 réponses chacune, on répond au hasard. X = nombre de bonnes réponses. Chaque question : succès avec p = 1/4, indépendantes, donc X suit ℬ(5 ; 0,25).</p>
        <p>P(X = 2) = C(5;2) × 0,25² × 0,75³ = 10 × 0,0625 × 0,421875 ≈ <strong>0,264</strong>.</p>
        <p>P(X = 0) = 0,75⁵ ≈ 0,237, donc P(X ≥ 1) = 1 − 0,237 = <strong>0,763</strong> (« au moins un » : passe par le contraire).</p>
        <p>E(X) = np = 1,25 ; V(X) = np(1 − p) = 0,9375.</p>`,
      retiens: ['ℬ(n, p) : P(X = k) = C(n;k) p<sup>k</sup>(1 − p)<sup>n−k</sup>', 'E = np ; V = np(1 − p) ; σ = √(np(1 − p))', '« Au moins un » : 1 − P(X = 0)'],
      q: [
        { q: 'X suit ℬ(10 ; 0,3). P(X = 3), au millième ?', a: 0.267, d: 3, hint: 'C(10;3) = 120.', sol: ['C(10;3) × 0,3³ × 0,7⁷ = 120 × 0,027 × 0,08235 ≈ 0,267.'] },
        { q: 'X suit ℬ(10 ; 0,3). E(X) ?', a: 3, d: 2, sol: ['E = np = 10 × 0,3 = 3.'] },
        { q: 'X suit ℬ(10 ; 0,3). V(X) ?', a: 2.1, d: 2, sol: ['V = np(1 − p) = 10 × 0,3 × 0,7 = 2,1.'] },
        { q: 'X suit ℬ(10 ; 0,3). P(X ≥ 1), au millième ?', a: 1 - Math.pow(0.7, 10), d: 3, sol: ['P(X = 0) = 0,7¹⁰ ≈ 0,028.', 'P(X ≥ 1) = 1 − 0,028 ≈ 0,972.'] }
      ] },

    { ch: 3, h: 'Loi de Poisson', min: 20, cours: 'cours-3', td: 'td-3-0b',
      idee: `<p><strong>Poisson 𝒫(λ)</strong> : on compte des <strong>événements rares</strong> sur une durée ou une zone (pannes par mois, appels par minute, défauts par mètre). λ est le <strong>nombre moyen</strong> d'événements sur cette durée.</p>
        ${MB('P(X = k) = e<sup>−λ</sup> ' + F('λ<sup>k</sup>', 'k!'))}
        <p>Particularité : E(X) = V(X) = λ. Si λ = 2 pannes par mois, alors sur 3 mois λ = 6.</p>`,
      exemple: `<p>Un serveur tombe en panne en moyenne 2 fois par mois : X suit 𝒫(2).</p>
        <p>P(X = 0) = e<sup>−2</sup> ≈ 0,1353. P(X = 1) = e<sup>−2</sup> × 2 ≈ 0,2707.</p>
        <p>P(X ≤ 1) = 0,1353 + 0,2707 = <strong>0,4060</strong>. P(X ≥ 2) = 1 − P(X ≤ 1) = <strong>0,5940</strong>.</p>`,
      retiens: ['P(X = k) = e<sup>−λ</sup>λ<sup>k</sup>/k! ; E = V = λ', 'P(X ≥ t) = 1 − [P(0) + … + P(t − 1)]', 'λ s\'adapte à la durée : double durée, double λ'],
      q: [
        { q: 'X suit 𝒫(3). P(X = 2), au millième ?', a: 0.224, d: 3, sol: ['e<sup>−3</sup> × 3²/2! = 0,0498 × 4,5 ≈ 0,224.'] },
        { q: 'X suit 𝒫(3). P(X ≥ 1), au millième ?', a: 0.95, d: 3, sol: ['1 − P(X = 0) = 1 − e<sup>−3</sup> ≈ 1 − 0,0498 = 0,950.'] },
        { q: 'X suit 𝒫(3). V(X) ?', a: 3, d: 2, sol: ['Pour Poisson, V(X) = λ = 3.'] }
      ] },

    { ch: 3, h: 'Loi géométrique', min: 10, cours: 'cours-3',
      idee: `<p><strong>Géométrique 𝒢(p)</strong> : on répète une épreuve jusqu'au premier succès, et X est le <strong>rang du premier succès</strong> (1, 2, 3…).</p>
        ${MB('P(X = k) = (1 − p)<sup>k−1</sup> p        P(X ≤ k) = 1 − (1 − p)<sup>k</sup>        E(X) = 1/p')}
        <p>Lecture : k − 1 échecs d'abord, puis un succès.</p>`,
      exemple: `<p>On lance un dé jusqu'au premier 6 (p = 1/6).</p>
        <p>P(X = 3) = (5/6)² × 1/6 = 25/216 ≈ <strong>0,116</strong>. P(X ≤ 3) = 1 − (5/6)³ ≈ <strong>0,421</strong>. En moyenne, il faut E(X) = 6 lancers.</p>`,
      retiens: ['P(X = k) = (1 − p)<sup>k−1</sup>p', 'E = 1/p ; V = (1 − p)/p²'],
      q: [
        { q: 'p = 0,2. P(X = 4), au dix-millième ?', a: 0.1024, d: 4, sol: ['0,8³ × 0,2 = 0,512 × 0,2 = 0,1024.'] },
        { q: 'p = 0,2. E(X) ?', a: 5, d: 2, sol: ['E = 1/p = 1/0,2 = 5.'] }
      ] },

    { ch: 3, h: 'Loi uniforme', min: 15, cours: 'cours-3', td: 'td-3-9',
      idee: `<p><strong>Uniforme 𝒰[a ; b]</strong> : X prend n'importe quelle valeur entre a et b, sans préférence. La probabilité d'un morceau est sa <strong>longueur divisée par la longueur totale</strong>.</p>
        ${MB('P(x<sub>1</sub> ≤ X ≤ x<sub>2</sub>) = ' + F('x<sub>2</sub> − x<sub>1</sub>', 'b − a') + '        E = ' + F('a + b', '2') + '        V = ' + F('(b − a)²', '12'))}`,
      exemple: `<p>Le bus passe toutes les 20 min ; on arrive au hasard. L'attente X suit 𝒰[0 ; 20].</p>
        <p>P(5 ≤ X ≤ 12) = (12 − 5)/20 = <strong>0,35</strong>. E(X) = 10 min. V(X) = 20²/12 ≈ 33,33 ; σ ≈ <strong>5,77</strong> min.</p>`,
      retiens: ['Probabilité = longueur / (b − a)', 'E = (a + b)/2 ; V = (b − a)²/12 ; σ = (b − a)/(2√3)', 'Densité f = 1/(b − a) sur [a ; b], 0 ailleurs'],
      q: [
        { q: 'X suit 𝒰[2 ; 10]. P(X ≤ 5) ?', a: 0.375, d: 3, sol: ['(5 − 2)/(10 − 2) = 3/8 = 0,375.'] },
        { q: 'X suit 𝒰[2 ; 10]. E(X) ?', a: 6, d: 2, sol: ['(2 + 10)/2 = 6.'] },
        { q: 'X suit 𝒰[2 ; 10]. V(X), au centième ?', a: 64 / 12, d: 2, sol: ['(10 − 2)²/12 = 64/12 ≈ 5,33.'] }
      ] },

    { ch: 3, h: 'Loi exponentielle et fiabilité', min: 20, cours: 'cours-3', td: 'td-3-13',
      idee: `<p><strong>Exponentielle ℰ(λ)</strong> : une <strong>durée de vie</strong> ou un temps d'attente, quand le taux de panne λ est constant. Le <strong>MTBF</strong> (durée moyenne entre pannes) vaut 1/λ, donc λ = 1/MTBF.</p>
        ${MB('Fiabilité R(t) = P(T &gt; t) = e<sup>−λt</sup>        Défaillance F(t) = P(T ≤ t) = 1 − e<sup>−λt</sup>')}
        <p>« Sans mémoire » : un appareil qui a déjà tenu s heures a la même chance de tenir t heures de plus qu'un neuf.</p>`,
      exemple: `<p>Un composant a un MTBF de 500 h, donc λ = 1/500 = 0,002.</p>
        <p>Il fonctionne encore après 200 h : R(200) = e<sup>−0,002 × 200</sup> = e<sup>−0,4</sup> ≈ <strong>0,670</strong>. Panne avant 200 h : 1 − 0,670 = 0,330.</p>
        <p>Durée pour une fiabilité de 90 % : e<sup>−0,002t</sup> = 0,9 ⇒ t = −ln(0,9)/0,002 ≈ <strong>52,7 h</strong>.</p>`,
      retiens: ['λ = 1/MTBF ; E(T) = 1/λ', 'Tient au-delà de t : e<sup>−λt</sup> ; panne avant t : 1 − e<sup>−λt</sup>', 'Durée pour une fiabilité r : t = −ln(r)/λ'],
      q: [
        { q: 'MTBF = 1 000 h. Probabilité de fonctionner encore après 500 h, au millième ?', a: 0.607, d: 3, sol: ['λ = 0,001 ; R(500) = e<sup>−0,5</sup> ≈ 0,607.'] },
        { q: 'MTBF = 1 000 h. Probabilité de panne avant 1 000 h, au millième ?', a: 0.632, d: 3, sol: ['1 − e<sup>−1</sup> ≈ 0,632 (piège : avant le MTBF, ce n\'est pas 0,5).'] }
      ] },

    { ch: 3, h: 'Loi normale et lecture de la table', min: 35, cours: 'cours-3', td: 'td-3-0a',
      idee: `<p><strong>Normale N(m ; σ²)</strong> : la courbe en cloche, centrée sur la moyenne m, de largeur σ. Elle décrit ce qui résulte de nombreuses petites causes (tailles, masses, erreurs de mesure).</p>
        <p>On ne calcule pas à la main : on <strong>centre et on réduit</strong> pour se ramener à N(0 ; 1), puis on lit la table de π (onglet Tables).</p>
        ${MB('t = ' + F('x − m', 'σ') + '        P(X ≤ x) = π(t)')}
        <p>La table ne donne que t ≥ 0. Pour le reste, on utilise la symétrie de la cloche.</p>`,
      exemple: `<p>X suit N(50 ; 4²), soit m = 50 et σ = 4.</p>
        <p>P(X ≤ 56) : t = (56 − 50)/4 = 1,5 ; π(1,5) = <strong>0,9332</strong>.</p>
        <p>P(X ≥ 46) : t = (46 − 50)/4 = −1 ; P(T ≥ −1) = P(T ≤ 1) = π(1) = <strong>0,8413</strong>.</p>
        <p>P(46 ≤ X ≤ 56) = π(1,5) − π(−1) = 0,9332 − (1 − 0,8413) = <strong>0,7745</strong>.</p>`,
      retiens: ['P(T ≤ t) = π(t) ; P(T ≥ t) = 1 − π(t)', 'π(−t) = 1 − π(t)', 'P(a ≤ T ≤ b) = π(b) − π(a) ; P(−t ≤ T ≤ t) = 2π(t) − 1', 'Repères : 68 % à ±σ, 95 % à ±2σ, 99,7 % à ±3σ'],
      q: [
        { q: 'X suit N(100 ; 15²). P(X ≤ 130), à 10<sup>−4</sup> ?', a: 0.9772, d: 4, sol: ['t = 30/15 = 2 ; π(2) = 0,9772.'] },
        { q: 'X suit N(100 ; 15²). P(X ≥ 85), à 10<sup>−4</sup> ?', a: 0.8413, d: 4, sol: ['t = −1 ; P(T ≥ −1) = π(1) = 0,8413.'] },
        { q: 'X suit N(100 ; 15²). P(85 ≤ X ≤ 115), à 10<sup>−4</sup> ?', a: 0.6826, d: 4, sol: ['t entre −1 et 1 : 2π(1) − 1 = 2 × 0,8413 − 1 = 0,6826.'] },
        { q: 'X suit N(100 ; 15²). P(X ≥ 120), à 10<sup>−4</sup> ?', a: 0.0918, d: 4, tol: 0.0007, hint: 'Arrondis t à 0,01 avant de lire la table.', sol: ['t = 20/15 ≈ 1,33 ; π(1,33) = 0,9082.', 'P = 1 − 0,9082 = 0,0918.'] }
      ] },

    { ch: 3, h: 'Approximations : binomiale vers Poisson ou normale', min: 15, cours: 'cours-3', td: 'td-3-3',
      idee: `<p>Quand n est grand, la binomiale devient pénible à calculer. On la remplace :</p>
        <ul><li><strong>Vers Poisson</strong> si n ≥ 30, p ≤ 0,1 et np &lt; 15 (succès rares) : λ = np.</li>
        <li><strong>Vers la normale</strong> si n ≥ 30, np &gt; 5 et n(1 − p) &gt; 5 : m = np et σ = √(np(1 − p)).</li></ul>
        <p>Écris toujours les conditions vérifiées avec les nombres : elles rapportent des points.</p>`,
      exemple: `<p>X suit ℬ(100 ; 0,03) : n = 100 ≥ 30, p = 0,03 ≤ 0,1, np = 3 &lt; 15. Donc X ≈ 𝒫(3) : P(X = 0) ≈ e<sup>−3</sup> ≈ <strong>0,0498</strong>.</p>
        <p>Y suit ℬ(400 ; 0,5) : np = 200 &gt; 5, n(1 − p) = 200 &gt; 5. Donc Y ≈ N(200 ; 10²) car √(400 × 0,25) = 10. P(Y ≤ 210) ≈ π(1) = <strong>0,8413</strong>.</p>`,
      retiens: ['Poisson : λ = np (n grand, p petit)', 'Normale : m = np, σ = √(np(1 − p))'],
      q: [
        { q: 'X suit ℬ(50 ; 0,04). On l\'approche par Poisson. Quel λ ?', a: 2, d: 2, sol: ['λ = np = 50 × 0,04 = 2.'] },
        { q: 'X suit ℬ(100 ; 0,5), approchée par une normale. σ ?', a: 5, d: 2, sol: ['σ = √(100 × 0,5 × 0,5) = √25 = 5.'] },
        { q: 'X suit ℬ(100 ; 0,5) ≈ N(50 ; 5²). P(X ≤ 55), à 10<sup>−4</sup> ?', a: 0.8413, d: 4, sol: ['t = (55 − 50)/5 = 1 ; π(1) = 0,8413.'] }
      ] },

    /* ===================== CHAPITRE IV ===================== */
    { ch: 4, h: 'Échantillon et estimation : n ou n − 1 ?', min: 20, cours: 'cours-4', td: 'td-4-1',
      idee: `<p>On ne peut pas mesurer toute la population (tous les employés, toutes les pièces). On prend un <strong>échantillon</strong> de n individus et on <strong>estime</strong> :</p>
        <ul><li>la moyenne m de la population par la moyenne de l'échantillon ${XB} ;</li>
        <li>une proportion p par la fréquence observée f = (nombre de cas) / n ;</li>
        <li>l'écart-type par l'<strong>écart-type corrigé</strong> σ̂, qui divise par n − 1 au lieu de n.</li></ul>
        ${MB('σ̂ = ' + R(F('n', 'n − 1')) + ' × σ<sub>observé</sub>')}
        <p>Pourquoi n − 1 : on mesure les écarts à ${XB}, pas à la vraie moyenne, ce qui les rend un peu trop petits. On corrige en divisant par un nombre plus petit.</p>`,
      exemple: `<p>Échantillon : 8 ; 10 ; 12 ; 9 ; 11. ${XB} = 50/5 = 10.</p>
        <p>Écarts à 10 : −2, 0, 2, −1, 1 ; carrés : 4, 0, 4, 1, 1 ; somme 10.</p>
        <p>σ observé = √(10/5) = √2 ≈ 1,414. σ̂ corrigé = √(10/4) ≈ <strong>1,581</strong> (= √(5/4) × 1,414).</p>`,
      retiens: ['Décrire un groupe complet : divise par n', 'Estimer une population, IC, tests : divise par n − 1', 'Si l\'énoncé donne « écart-type estimé », c\'est déjà σ̂ : ne corrige pas deux fois'],
      q: [
        { q: 'Échantillon de n = 100, écart-type observé 40. Écart-type corrigé σ̂, au centième ?', a: 40.2, d: 2, sol: ['σ̂ = √(100/99) × 40 ≈ 1,00504 × 40 ≈ 40,20.'] },
        { q: 'Sondage : 52 personnes sur 100 voteront A. Estimation ponctuelle de p ?', a: 0.52, d: 2, sol: ['f = 52/100 = 0,52.'] }
      ] },

    { ch: 4, h: 'Intervalle de confiance d\'une moyenne', min: 30, cours: 'cours-4', td: 'td-4-1',
      idee: `<p>Au lieu d'une seule valeur, on donne un intervalle qui contient la vraie moyenne avec une confiance de 95 % (risque α = 5 %). Toujours : <strong>estimation ± marge</strong>.</p>
        ${MB('[ ' + XB + ' − z ' + F('σ', '√n') + ' ; ' + XB + ' + z ' + F('σ', '√n') + ' ]')}
        ${tbl([['Confiance', '90 %', '95 %', '99 %'], ['z', '1,645', '1,96', '2,576']], { side: true })}
        <p>Si n est petit (moins de 30) et σ inconnu : même formule avec σ̂ et t de Student à n − 1 degrés de liberté (onglet Tables, colonne α bilatéral) à la place de z.</p>
        <p><strong>Taille d'échantillon</strong> : l'amplitude (largeur) vaut 2zσ/√n. Pour qu'elle soit &lt; L : n &gt; (2zσ/L)².</p>`,
      exemple: `<p>100 employés, ${XB} = 210 cg, σ̂ = 50. À 95 % : marge = 1,96 × 50/√100 = 1,96 × 5 = 9,8.</p>
        <p>IC = [210 − 9,8 ; 210 + 9,8] = <strong>[200,2 ; 219,8]</strong>. Phrase : « avec une confiance de 95 %, le taux moyen de l'entreprise est entre 200,2 et 219,8 cg ».</p>
        <p>Pour une amplitude &lt; 10 : n &gt; (2 × 1,96 × 50/10)² = 19,6² = 384,16, donc <strong>n = 385</strong>.</p>
        <p>Petit échantillon (exemple de la page) : n = 10, ${XB} = 12, σ̂ ≈ 1,826, t<sub>9 ; 0,05</sub> = 2,262 : marge = 2,262 × 1,826/√10 ≈ 1,31, IC [10,69 ; 13,31].</p>`,
      retiens: ['IC = ' + XB + ' ± z σ/√n (n ≥ 30) ; ' + XB + ' ± t<sub>n−1</sub> σ̂/√n sinon', 'z : 1,645 / 1,96 / 2,576', 'Plus de confiance → intervalle plus large ; plus grand n → plus étroit'],
      q: [
        { q: 'n = 64, ' + XB + ' = 50, σ = 8. IC à 95 % (bornes au centième) ?', a: [48.04, 51.96], l: ['borne basse', 'borne haute'], d: 2, sol: ['σ/√n = 8/8 = 1 ; marge = 1,96.', '[48,04 ; 51,96].'] },
        { q: 'Même échantillon (n = 64, ' + XB + ' = 50, σ = 8), à 99 % ?', a: [47.42, 52.58], l: ['borne basse', 'borne haute'], d: 2, sol: ['marge = 2,576 × 1 ≈ 2,58.', '[47,42 ; 52,58] : plus large qu\'à 95 %.'] },
        { q: 'σ = 20, à 95 %. Taille minimale n pour une amplitude inférieure à 5 ?', a: 246, d: 0, sol: ['n &gt; (2 × 1,96 × 20/5)² = 15,68² ≈ 245,9.', 'Donc n = 246.'] }
      ] },

    { ch: 4, h: 'Intervalle de confiance d\'une proportion', min: 25, cours: 'cours-4', td: 'td-4-2',
      idee: `<p>Même principe avec une fréquence f observée sur n individus (conditions : n ≥ 30, nf ≥ 5, n(1 − f) ≥ 5) :</p>
        ${MB('[ f − z ' + R(F('f(1 − f)', 'n')) + ' ; f + z ' + R(F('f(1 − f)', 'n')) + ' ]')}
        <p>Pour conclure, regarde si une valeur clé (50 %, 80 %…) est <strong>dans</strong> l'intervalle (on ne peut pas trancher) ou <strong>dehors</strong> (on peut conclure).</p>`,
      exemple: `<p>TD IV ex. 2 : 52 personnes sur 100 voteront A. f = 0,52.</p>
        <p>√(0,52 × 0,48/100) ≈ 0,0500 ; marge = 1,96 × 0,0500 ≈ 0,098. IC = <strong>[0,422 ; 0,618]</strong>.</p>
        <p>0,5 est dans l'intervalle : on ne peut pas affirmer que A gagne.</p>
        <p>Taille pour conclure : il faut f − marge &gt; 0,5, soit 1,96 × √(0,2496/n) &lt; 0,02 ⇒ √n &gt; 48,96 ⇒ n &gt; 2 397,2, donc <strong>n = 2 398</strong>.</p>`,
      retiens: ['IC = f ± z √(f(1 − f)/n)', 'Valeur testée dans l\'IC → on ne peut pas conclure ; dehors → on conclut'],
      q: [
        { q: '300 clients satisfaits sur 400. IC à 95 % de la proportion (au millième) ?', a: [0.708, 0.792], l: ['borne basse', 'borne haute'], d: 3, sol: ['f = 0,75 ; √(0,75 × 0,25/400) ≈ 0,02165 ; marge ≈ 0,0424.', 'IC ≈ [0,708 ; 0,792].'] },
        { q: 'La direction dit « 80 % de satisfaits ». 0,80 est-il dans [0,708 ; 0,792] ?', c: ['Oui, on ne peut rien contester', 'Non, l\'échantillon contredit les 80 %'], a: 1, sol: ['0,80 &gt; 0,792 : la valeur annoncée est hors de l\'intervalle.'] }
      ] },

    { ch: 4, h: 'Tests d\'hypothèses : moyenne et proportion', min: 30, cours: 'cours-4', td: 'td-4-9',
      idee: `<p>On veut savoir si une affirmation (« autonomie de 12 h », « 90 % de réussite ») tient face à un échantillon. Méthode en 5 temps :</p>
        <ol><li><strong>H<sub>0</sub></strong> : l'affirmation (m = m<sub>0</sub> ou p = p<sub>0</sub>). <strong>H<sub>1</sub></strong> : le contraire (m ≠ m<sub>0</sub> en bilatéral ; m &lt; m<sub>0</sub> ou m &gt; m<sub>0</sub> en unilatéral).</li>
        <li><strong>Zone d'acceptation</strong> autour de la valeur annoncée, calculée en supposant H<sub>0</sub> vraie :
          ${MB('moyenne : m<sub>0</sub> ± z ' + F('σ', '√n') + '        proportion : p<sub>0</sub> ± z ' + R(F('p<sub>0</sub>(1 − p<sub>0</sub>)', 'n')))}</li>
        <li>Règle : si ${XB} (ou f) tombe <strong>dans</strong> la zone, on ne rejette pas H<sub>0</sub> ; <strong>dehors</strong>, on rejette H<sub>0</sub>.</li>
        <li>Calcule et compare.</li>
        <li>Conclus par une phrase dans le contexte, avec le risque α.</li></ol>
        <p><strong>Unilatéral</strong> (« au moins », « inférieur à ») : une seule borne, et z = 1,645 à 5 % (tout le risque d'un côté).</p>`,
      exemple: `<p>TD IV ex. 9 : annonce 12 h ; 40 batteries, ${XB} = 11,5 h, σ̂ = 1,8 h ; confiance 90 % (z = 1,645).</p>
        <p>H<sub>0</sub> : m = 12 ; H<sub>1</sub> : m ≠ 12. σ/√n = 1,8/√40 ≈ 0,285 ; marge = 1,645 × 0,285 ≈ 0,47.</p>
        <p>Zone d'acceptation : [11,53 ; 12,47]. 11,5 est <strong>dehors</strong> : on rejette H<sub>0</sub>, au risque de 10 % l'affirmation du fabricant est remise en cause.</p>`,
      retiens: ['Zone d\'acceptation = valeur annoncée ± z × écart-type de l\'échantillon', 'Dans la zone → on ne rejette pas H<sub>0</sub> (ce n\'est pas une preuve que H<sub>0</sub> est vraie)', 'Unilatéral 5 % : z = 1,645 ; bilatéral 5 % : z = 1,96'],
      q: [
        { q: 'TD IV ex. 10 : un prof annonce 90 % de réussite ; 170 réussites sur 200. Zone d\'acceptation à 95 % (au millième) ?', a: [0.858, 0.942], l: ['borne basse', 'borne haute'], d: 3, sol: ['p<sub>0</sub> = 0,9 ; √(0,9 × 0,1/200) ≈ 0,02121 ; marge = 1,96 × 0,02121 ≈ 0,0416.', 'Zone : [0,858 ; 0,942].'] },
        { q: 'f = 170/200 = 0,85. Décision ?', c: ['On ne rejette pas H<sub>0</sub>', 'On rejette H<sub>0</sub> : on peut contester les 90 %'], a: 1, sol: ['0,85 &lt; 0,858 : f est hors de la zone, on rejette H<sub>0</sub> au risque 5 %.'] },
        { q: 'TD IV ex. 7 en unilatéral : H<sub>0</sub> p = 0,8, H<sub>1</sub> p &lt; 0,8, n = 400, risque 5 %. Borne basse de la zone d\'acceptation (au millième) ?', a: 0.767, d: 3, sol: ['√(0,8 × 0,2/400) = 0,02 ; 0,8 − 1,645 × 0,02 = 0,767.', 'f = 0,75 &lt; 0,767 : on rejette « au moins 80 % de satisfaits ».'] }
      ] },

    { ch: 4, h: 'Khi-deux d\'ajustement (TD ex. 11 et 14)', min: 30, cours: 'cours-4', td: 'td-4-11',
      idee: `<p>Le test du <strong>khi-deux</strong> compare des effectifs <strong>observés O</strong> à des effectifs <strong>attendus E</strong> (ce qu'on aurait si H<sub>0</sub> était vraie).</p>
        <p><strong>Ajustement</strong> : <em>une seule</em> variable (faces d'un dé, saveurs, couleurs). Les données suivent-elles la répartition annoncée ?</p>
        ${MB('χ² = Σ ' + F('(O − E)²', 'E') + '        ddl = nombre de catégories − 1')}
        <p>Les 7 étapes du poly : 1. conditions (au moins 50 en tout, au moins 5 attendus par case) ; 2. ddl ; 3. H<sub>0</sub> et H<sub>1</sub> ; 4. effectifs attendus E ; 5. χ² ; 6. valeur critique dans la table (ddl, α) ; 7. si χ² &gt; valeur critique, on rejette H<sub>0</sub>, sinon on ne peut pas la rejeter.</p>`,
      exemple: `<p>Exemple du poly : 60 lancers de dé, observés 8, 12, 15, 10, 9, 6. H<sub>0</sub> : dé équilibré, donc E = 60/6 = 10 par face.</p>
        <p>χ² = (8−10)²/10 + (12−10)²/10 + (15−10)²/10 + 0 + (9−10)²/10 + (6−10)²/10 = 0,4 + 0,4 + 2,5 + 0 + 0,1 + 1,6 = <strong>5</strong>.</p>
        <p>ddl = 6 − 1 = 5 ; valeur critique à 5 % : 11,07. 5 ≤ 11,07 : on ne rejette pas H<sub>0</sub>, les écarts peuvent venir du hasard.</p>`,
      retiens: ['On divise par E, jamais par O', 'E = total × proportion attendue', 'χ² &gt; valeur critique → on rejette H<sub>0</sub>'],
      q: [
        { q: '<b>TD ex. 11.</b> 10 sacs de 100 bonbons (1 000 bonbons) : pomme 180, citron 250, cerise 120, orange 225, raisin 225. H<sub>0</sub> : les 5 saveurs sont en proportions égales. Effectif attendu E par saveur ?', a: 200, d: 1, sol: ['1 000 / 5 = 200 par saveur. Toutes les cases attendues sont ≥ 5 et n = 1 000 ≥ 50 : test valable.'] },
        { q: 'TD ex. 11 : calcule χ² (observés 180, 250, 120, 225, 225 ; E = 200).', a: 52.75, d: 2, sol: ['(−20)²/200 = 2 ; 50²/200 = 12,5 ; (−80)²/200 = 32 ; 25²/200 = 3,125 ; 3,125.', 'χ² = 2 + 12,5 + 32 + 3,125 + 3,125 = 52,75.'] },
        { q: 'TD ex. 11 : degrés de liberté ?', a: 4, d: 0, sol: ['5 saveurs − 1 = 4.'] },
        { q: 'TD ex. 11 : valeur critique (4 ddl, 5 %) = 9,488. Décision ?', c: ['On ne rejette pas H<sub>0</sub>', 'On rejette H<sub>0</sub> : les saveurs ne sont pas en proportions égales'], a: 1, sol: ['52,75 &gt; 9,488 : on rejette H<sub>0</sub> au risque 5 %. Les saveurs ne sont pas présentes en proportions égales (trop de citron, pas assez de cerise).'] },
        { q: '<b>TD ex. 14.</b> Attendu : rouge 30 %, bleu 40 %, vert 20 %, blanc 10 % ; 500 voitures ; observé 150, 200, 100, 50. Calcule χ².', a: 0, d: 2, sol: ['E = 500 × 0,30 = 150 ; 500 × 0,40 = 200 ; 100 ; 50.', 'Tous les O sont égaux aux E : χ² = 0.', 'ddl = 3, valeur critique 7,815 : 0 ≤ 7,815, on ne rejette pas H<sub>0</sub>. Les ventes sont conformes au plan marketing.'] }
      ] },

    { ch: 4, h: 'Khi-deux d\'indépendance (TD ex. 12 et 13)', min: 35, cours: 'cours-4', td: 'td-4-12',
      idee: `<p><strong>Indépendance</strong> : <em>deux</em> variables dans un tableau à double entrée (type de film × snacks). H<sub>0</sub> : les deux variables ne sont <strong>pas liées</strong>. H<sub>1</sub> : elles sont liées.</p>
        ${MB('E = ' + F('total ligne × total colonne', 'total général') + '        ddl = (lignes − 1) × (colonnes − 1)')}
        <p>Ensuite, comme toujours : χ² = Σ(O − E)²/E sur <strong>toutes</strong> les cases, puis comparaison avec la table.</p>`,
      exemple: `<p>Exemple du poly (fini sur la page) : notes de deux classes A et B, 57 élèves.</p>
        ${tbl([['Observés', 'A', 'B', 'Total'], ['note &lt; 10', '5', '6', '11'], ['10 à 15', '5', '14', '19'], ['≥ 15', '17', '10', '27'], ['Total', '27', '30', '57']], { side: true })}
        <p>E(A, &lt; 10) = 11 × 27/57 ≈ 5,21 ; E(B, &lt; 10) = 11 × 30/57 ≈ 5,79 ; puis 9 ; 10 ; 12,79 ; 14,21.</p>
        <p>χ² ≈ 0,008 + 0,008 + 1,778 + 1,6 + 1,39 + 1,25 ≈ <strong>6,03</strong>. ddl = (3 − 1)(2 − 1) = 2 ; valeur critique 5,99.</p>
        <p>6,03 &gt; 5,99 : on rejette H<sub>0</sub>, la répartition des notes dépend de la classe (de justesse).</p>`,
      retiens: ['E = total ligne × total colonne / total général', 'ddl = (r − 1)(c − 1)', 'Chaque ligne de E a le même total que la ligne observée : bonne vérification'],
      q: [
        { q: '<b>TD ex. 12.</b> 600 spectateurs. Snacks / pas de snack : Action 50 / 75 ; Comédie 125 / 175 ; Familial 90 / 30 ; Horreur 45 / 10. Totaux colonnes : snacks 310, pas de snack 290. Effectif attendu pour (Action, snacks), au centième ?', a: 64.58, d: 2, sol: ['Total ligne Action = 125. E = 125 × 310 / 600 ≈ 64,58.', tbl([['Attendus', 'Snacks', 'Pas de snack'], ['Action (125)', '64,58', '60,42'], ['Comédie (300)', '155', '145'], ['Familial (120)', '62', '58'], ['Horreur (55)', '28,42', '26,58']], { side: true })] },
        { q: 'TD ex. 12 : calcule χ² (au centième).', a: 65.01, d: 2, tol: 0.1, hint: 'Huit cases : (O − E)²/E pour chacune, avec les attendus 64,58 / 60,42 / 155 / 145 / 62 / 58 / 28,42 / 26,58.', sol: ['Action : 3,29 + 3,52 ; Comédie : 900/155 = 5,81 + 900/145 = 6,21 ; Familial : 784/62 = 12,65 + 784/58 = 13,52 ; Horreur : 9,68 + 10,35.', 'χ² ≈ 65,01.'] },
        { q: 'TD ex. 12 : degrés de liberté ?', a: 3, d: 0, sol: ['(4 − 1) × (2 − 1) = 3.'] },
        { q: 'TD ex. 12 : valeur critique (3 ddl, 5 %) = 7,815. Décision ?', c: ['On ne rejette pas H<sub>0</sub> : film et snacks indépendants', 'On rejette H<sub>0</sub> : le type de film et l\'achat de snacks sont liés'], a: 1, sol: ['65,01 &gt; 7,815 : on rejette l\'indépendance au risque 5 %. Les familles achètent beaucoup plus de snacks : l\'estimation doit tenir compte du type de film.'] },
        { q: '<b>TD ex. 13.</b> Homme : A 30, B 10 (total 40). Femme : A 20, B 30 (total 50). Totaux : A 50, B 40, général 90. Calcule χ² (au centième).', a: 11.025, d: 2, tol: 0.03, sol: ['Attendus : Homme-A = 40 × 50/90 ≈ 22,22 ; Homme-B ≈ 17,78 ; Femme-A ≈ 27,78 ; Femme-B ≈ 22,22.', 'Chaque écart vaut ±7,78, donc (7,78)² ≈ 60,49 divisé par chaque E : 2,72 + 3,40 + 2,18 + 2,72 ≈ 11,03.', 'ddl = 1, valeur critique 3,841 : 11,03 &gt; 3,841, on rejette H<sub>0</sub>. Le genre et la préférence de produit sont liés.'] }
      ] }
  ];
  L.forEach(function (l, i) { l.i = i + 1; });
  OM.zero = L;

  function key(l, j) { return 'z' + l.i + '.' + j; }
  function stats(l) { var d = 0, ok = 0; l.q.forEach(function (q, j) { var s = S.prog[key(l, j)]; if (s) d++; if (s === 'ok') ok++; }); return { n: l.q.length, done: d, ok: ok }; }

  OM.route('zero', function (v, args) {
    if (args.length) return lesson(v, +args[0]);
    var tot = L.reduce(function (a, l) { return a + l.min; }, 0);
    var html = '<div class="view-title"><p class="eyebrow">Chapitres III et IV · 15 leçons</p><h1>Partir de zéro</h1><p class="muted">15 leçons dans l\'ordre. Chacune : l\'idée, un exemple corrigé, ce qu\'il faut retenir, puis des questions vérifiées tout de suite. Le khi-deux (TD IV ex. 11 à 14) est à la fin.</p></div><div class="stack-lg">';
    [3, 4].forEach(function (ch) {
      html += '<section class="stack"><h2>' + (ch === 3 ? 'III · Variables aléatoires' : 'IV · Statistiques inférentielles') + '</h2><ul class="exlist">';
      L.filter(function (l) { return l.ch === ch; }).forEach(function (l) {
        var st = stats(l);
        html += '<li><a href="#zero-' + l.i + '"><span class="n">' + l.i + '</span><span class="t"><b>' + l.h + '</b><span>' + l.min + ' min · ' + st.n + ' question' + (st.n > 1 ? 's' : '') + '</span></span>' + OM.ui.ring(st.n ? st.done / st.n : 0) + '</a></li>';
      });
      html += '</ul></section>';
    });
    v.innerHTML = html + '</div>';
  });

  function lesson(v, i) {
    var l = L[i - 1];
    if (!l) { v.innerHTML = '<div class="card"><p>Leçon introuvable.</p><a class="btn" href="#zero">Retour</a></div>'; return; }
    var prev = L[i - 2], next = L[i];
    var html = '<div class="stack-lg"><div class="view-title"><p class="eyebrow"><a href="#zero">Partir de zéro</a> · leçon ' + l.i + ' sur ' + L.length + ' · chapitre ' + (l.ch === 3 ? 'III' : 'IV') + ' · ' + l.min + ' min</p><h1>' + l.h + '</h1></div>';
    html += '<section class="card flat"><h2>L\'idée</h2><div class="prose">' + l.idee + '</div></section>';
    html += '<section class="card flat"><h2>Exemple corrigé</h2><div class="prose">' + l.exemple + '</div></section>';
    html += '<section class="card flat"><h2>À retenir</h2><ul class="traps">' + l.retiens.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ul>' +
      '<p class="small muted" style="margin-top:10px">Pour aller plus loin : <a href="#' + l.cours + '">fiche du chapitre ' + (l.ch === 3 ? 'III' : 'IV') + '</a>' + (l.td ? ' · <a href="#' + l.td + '">exercice de TD lié</a>' : '') + ' · <a href="#tables">tables</a>.</p></section>';
    html += '<h2>À toi</h2><div class="stack zq"></div>';
    html += '<div class="navrow">' + (prev ? '<a class="btn" href="#zero-' + prev.i + '">← Leçon ' + prev.i + '</a>' : '<a class="btn" href="#zero">Sommaire</a>') +
      (next ? '<a class="btn primary" href="#zero-' + next.i + '">Leçon ' + next.i + ' →</a>' : '<a class="btn primary" href="#examen">Finir par l\'examen blanc</a>') + '</div></div>';
    v.innerHTML = html;
    var box = v.querySelector('.zq');
    l.q.forEach(function (q, j) {
      var k = key(l, j);
      box.appendChild(OM.questionCard(q, {
        key: k, mode: 'td', label: 'Question ' + (j + 1) + ' sur ' + l.q.length, status: S.prog[k],
        onResult: function (st) { if (S.prog[k] === 'ok' && st !== 'ok') return; S.prog[k] = st; OM.save(); }
      }));
    });
  }
})();
