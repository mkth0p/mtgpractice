/* Learn Arcs: all the course content. Base game only, checked against the official rulebook.
   A step is one screen: { title, html, cards, pics, after, widget: [name, opts], gate, quiz, tip, math, warn, mem }.
   cards: action cards like "agg5" (suit + number) or {s, n, zero, down}. pics: [file in img/, alt text, caption].
   {fuel} {material} {weapon} {relic} {psionic} and {hit} {self} {intercept} {bhit} {key} become the real icons.
   `gate` makes the widget's own "done" unlock Next (with a skip link); a quiz always has to be answered. */
window.LEARN = (function () {
  "use strict";

  const units = [
    { id: "basics", title: "Welcome to the Reach", blurb: "What Arcs is, what's in the box, and how to read the map." },
    { id: "cards", title: "Cards and turns", blurb: "The action cards, and the clever way everyone follows the leader." },
    { id: "actions", title: "The actions", blurb: "Moving, building, taxing, the Court, battles, and spending resources." },
    { id: "ambitions", title: "Ambitions and winning", blurb: "How you actually score points, and when the game ends." },
    { id: "play", title: "Your first game", blurb: "Setting up the box, a guided round, and tips for game one." }
  ];

  const lessons = [
    /* ---------------- Part 1 ---------------- */
    {
      id: "welcome", unit: "basics", emoji: "🌌", title: "What is Arcs?", blurb: "The goal in one sentence.",
      steps: [
        { title: "Welcome! Let's start very small.",
          html: `<p class="big">Arcs is a board game for <b>2 to 4 players</b>, set in a corner of space called the Reach.</p><p>Each player leads a small space empire: ships, cities and secret agents. You'll learn one small idea per screen, and try most of them yourself.</p>`,
          pics: [["box-cover.jpg", "The Arcs box cover", "The box. Art by Kyle Ferrin, © Leder Games."]],
          tip: "Take your time. You can go back with the ← button, and your progress is saved in this browser." },
        { title: "How do you win?",
          html: `<p class="big">You win by having the most <b>Power</b>.</p><p>Power is just Arcs' word for points. There's a Power track around the board, and each player has a marker on it that starts at 0.</p>`,
          mem: "Power = points. Most Power wins." },
        { title: "Where does Power come from?",
          html: `<p>Here's the surprise: you don't get Power for owning planets or winning fights.</p><p class="big">Power comes only from <b>ambitions</b>.</p><p>An ambition is a contest, like "who has the most trophies?". During the game, players announce which contests count this time. At the end of each chapter, the winners of those contests score Power.</p>`,
          tip: "Everything else you do (moving, building, fighting) is a way to win the contests. Keep that in mind and the whole game makes sense." },
        { title: "Chapters",
          html: `<p>The game is split into <b>chapters</b>. A chapter is a bunch of rounds of card play. When everyone's cards run out, the chapter ends and the ambitions are scored.</p><p>There are at most <b>5 chapters</b>. Most games last 3 to 5.</p>` },
        { title: "When does it end?",
          html: `<p>At the end of a chapter, the game stops if someone has reached a Power target:</p><table class="tbl"><tr><th>Players</th><th>Power to end the game</th></tr><tr><td>4</td><td><b>27</b></td></tr><tr><td>3</td><td><b>30</b></td></tr><tr><td>2</td><td><b>33</b></td></tr></table><p>If nobody gets there, the game ends after chapter 5 anyway. Either way, <b>most Power wins</b>.</p>`,
          math: "The game only checks at the end of a chapter. If you pass 27 in the middle of a chapter, nothing happens yet." },
        { title: "Quick check",
          quiz: { q: "How do you get Power in Arcs?", options: [
            { t: "By winning ambitions at the end of a chapter", ok: true, why: "Power comes only from ambitions, scored at the end of each chapter." },
            { t: "One Power for every planet you own", why: "Owning planets gives no Power by itself. It only helps you win ambitions." },
            { t: "One Power for every ship you destroy", why: "Destroying ships gives you trophies, which can help you win an ambition, but not Power directly." }] } }
      ],
      recap: ["Arcs is for 2 to 4 players.", "Power = points. Most Power wins.", "Power comes only from ambitions, scored at the end of each chapter.", "The game ends at 27 / 30 / 33 Power (4 / 3 / 2 players) or after chapter 5."]
    },
    {
      id: "pieces", unit: "basics", emoji: "🧩", title: "What's in the box", blurb: "Ships, cities, starports, agents and resources.",
      steps: [
        { title: "Your pieces",
          html: `<p>Each player picks a colour (red, blue, white or yellow) and takes:</p>`,
          pics: [["ship-red.png", "A red ship", "<b>15 ships</b>. They move around and fight."], ["city-red.png", "A red city", "<b>5 cities</b>. They give you resources."], ["starport-red.png", "A red starport", "<b>5 starports</b>. They build ships."], ["agent-red.png", "A red agent", "<b>10 agents</b>. They go on Court cards."]],
          after: `<p>Cities and starports together are called <b>buildings</b>.</p>` },
        { title: "Your player board",
          html: `<p>You also get a <b>player board</b>. Your 5 cities start on it, in a row of slots at the top. When you build a city, you take it from the board. That uncovers spaces underneath that make your empire stronger.</p><p>The board also has places for your <b>resources</b>, your <b>trophies</b> and your <b>captives</b>. You'll meet those soon.</p>` },
        { title: "The five resources",
          html: `<p>There are 5 kinds of resource token, 5 of each:</p><ul class="res-list"><li>{material} <b>Material</b></li><li>{fuel} <b>Fuel</b></li><li>{weapon} <b>Weapon</b></li><li>{relic} <b>Relic</b></li><li>{psionic} <b>Psionic</b></li></ul><p>Every planet on the map makes one of these. A city on a planet lets you collect that planet's resource.</p>`,
          pics: [["res-material.png", "Material token", ""], ["res-fuel.png", "Fuel token", ""], ["res-weapon.png", "Weapon token", ""], ["res-relic.png", "Relic token", ""], ["res-psionic.png", "Psionic token", ""]] },
        { title: "Cards and dice",
          html: `<ul><li><b>28 action cards</b>: you play these to do things. Part 2 is all about them.</li><li><b>The Court</b>: 31 cards (25 Guild cards and 6 Vox cards). A few lie face up in a row, and players compete to take them.</li><li><b>18 dice</b> in 3 kinds, used for battles.</li><li>Some markers: the <b>initiative marker</b>, 3 <b>ambition markers</b>, a <b>zero marker</b> and a <b>chapter marker</b>.</li></ul>`,
          pics: [["initiative.png", "The initiative marker", "The initiative marker: whoever has it leads the round."], ["amb-front-5-3.png", "An ambition marker", "An ambition marker."]] },
        { title: "Name that piece",
          html: `<p>Tap the right name for each piece. Mistakes are fine.</p>`,
          widget: ["pieces", {}], gate: "Name every piece" }
      ],
      recap: ["Each player has 15 ships, 5 cities, 5 starports and 10 agents.", "Cities and starports are buildings.", "Five resources: {material} Material, {fuel} Fuel, {weapon} Weapon, {relic} Relic, {psionic} Psionic.", "28 action cards, a Court of Guild and Vox cards, and 18 dice."]
    },
    {
      id: "map", unit: "basics", emoji: "🗺️", title: "The map", blurb: "Clusters, gates, planets, and what 'next to' means.",
      steps: [
        { title: "Clusters and systems",
          html: `<p>The map is split into <b>6 clusters</b>. Each cluster has <b>4 systems</b>:</p><ul><li><b>3 planets</b></li><li><b>1 gate</b>, with a number on it</li></ul><p>A "system" just means one space on the map, planet or gate. Pieces always sit in a system.</p>`,
          widget: ["mapdemo", { show: "parts" }] },
        { title: "What's on a planet",
          html: `<p>Each planet shows:</p><ul><li>a <b>resource type</b> ({material} {fuel} {weapon} {relic} or {psionic}): what a city there produces</li><li><b>1 or 2 building slots</b>: the places where a city or starport can go</li></ul><p>Gates have no building slots. Ships can be on planets and on gates.</p>` },
        { title: "What's next to what",
          html: `<p>Two systems are <b>adjacent</b> (next to each other) when they share a <b>thin border</b>. A thick, jagged border means they are <i>not</i> adjacent.</p><ul><li>A gate is adjacent to its 3 planets, and to the 2 gates of the neighbouring clusters.</li><li>A planet is adjacent to its own gate, and to 1 or 2 neighbouring planets.</li></ul>`,
          tip: "Gates are the highways: gates connect to gates all around the map. Planets are the side streets." },
        { title: "Try it: tap the neighbours",
          html: `<p>This is a small made-up map to practise on. One system is glowing. Tap every system that is adjacent to it.</p>`,
          widget: ["adjacent", {}], gate: "Find all the neighbours" },
        { title: "Out of play",
          html: `<p>With fewer players, the map gets smaller:</p><ul><li><b>4 players</b>: 1 cluster is out of play.</li><li><b>2 or 3 players</b>: 2 clusters are out of play.</li></ul><p>The setup card tells you which. You cover their planets with out-of-play markers and put a <b>path marker</b> on the gate. Nobody can enter those systems, but the path marker joins the two gates on each side, so the highway still goes round.</p>` },
        { title: "Quick check",
          quiz: { q: "A gate is adjacent to...", options: [
            { t: "Its 3 planets and the 2 neighbouring gates", ok: true },
            { t: "Only its 3 planets", why: "Gates also connect to the gates of the neighbouring clusters. That's how ships travel around." },
            { t: "Every system on the map", why: "Only to systems that share a thin border with it: its 3 planets and the 2 neighbouring gates." }] } }
      ],
      recap: ["6 clusters, each with 3 planets and 1 gate.", "Planets make one resource and have 1 or 2 building slots.", "Adjacent = sharing a thin border.", "Gates link to their planets and to the neighbouring gates.", "1 cluster is out of play with 4 players, 2 with 2 or 3."]
    },
    {
      id: "control", unit: "basics", emoji: "🛡️", title: "Fresh, damaged, control", blurb: "Who is in charge of a system.",
      steps: [
        { title: "Fresh and damaged",
          html: `<p>Every ship and building is either <b>fresh</b> or <b>damaged</b>.</p><ul><li>A fresh <b>ship</b> stands upright. A damaged ship is tipped onto its side.</li><li>A fresh <b>building</b> shows its light side. A damaged building is flipped to its dark side.</li></ul><p>If a damaged piece is hit again, it is <b>destroyed</b> and leaves the map.</p>`,
          pics: [["city-blue.png", "A fresh blue city", "Fresh city"], ["city-back-blue.png", "A damaged blue city", "Damaged city (flipped)"], ["starport-blue.png", "A fresh blue starport", "Fresh starport"], ["starport-back-blue.png", "A damaged blue starport", "Damaged starport"]] },
        { title: "Loyal and Rival",
          html: `<p>Two words you'll see everywhere:</p><ul><li><b>Loyal</b> = yours, your colour.</li><li><b>Rival</b> = another player's.</li></ul>` },
        { title: "Control",
          html: `<p class="big">You <b>control</b> a system when you have <b>more fresh ships</b> there than each Rival.</p><p>Only <b>fresh ships</b> count. Damaged ships and buildings don't. If two players tie for the most, <b>nobody</b> controls it.</p><p>Controlling a system lets you tax Rival cities there, block Rival ships moving through gates, and makes Rivals' new pieces there arrive damaged. You'll see each of those later.</p>`,
          warn: "Control gives no Power on its own. It's a tool." },
        { title: "Try it: who controls it?",
          html: `<p>Look at each system and tap who controls it.</p>`,
          widget: ["control", {}], gate: "Answer all the systems" },
        { title: "Quick check",
          quiz: { q: "Red has 3 damaged ships in a system. Blue has 1 fresh ship. Who controls it?", options: [
            { t: "Blue", ok: true, why: "Only fresh ships count. Blue has 1, Red has 0." },
            { t: "Red", why: "Damaged ships don't count for control. Red has 0 fresh ships." },
            { t: "Nobody", why: "Nobody would be right if they tied. But damaged ships don't count, so it's 1 to 0." }] } }
      ],
      recap: ["Pieces are fresh (upright / light side) or damaged (tipped / flipped).", "A damaged piece that's hit again is destroyed.", "Loyal = yours, Rival = someone else's.", "Control = more fresh ships than each Rival. A tie means nobody."]
    },

    /* ---------------- Part 2 ---------------- */
    {
      id: "cards", unit: "cards", emoji: "🃏", title: "Action cards", blurb: "Suit, number, pips.",
      steps: [
        { title: "Four suits",
          html: `<p>Action cards come in <b>4 suits</b>. Each suit lets you do different actions:</p>`,
          cards: ["adm4", "agg4", "con4", "mob4"],
          after: `<table class="tbl"><tr><th>Suit</th><th>Actions</th></tr><tr><td>📜 Administration</td><td>Tax, Repair, Influence</td></tr><tr><td>⚔️ Aggression</td><td>Battle, Move, Secure</td></tr><tr><td>🏗️ Construction</td><td>Build, Repair</td></tr><tr><td>🚀 Mobilization</td><td>Move, Influence</td></tr></table>`,
          tip: "These are drawn cards, simplified so they're easy to read. The real cards have beautiful art, and show the same things." },
        { title: "Number and pips",
          html: `<p>Each card has a <b>number</b> (1 to 7) and some <b>pips</b> (little marks under the number).</p><p class="big">Each pip = <b>one action</b>.</p><p>Higher numbers have <b>fewer</b> pips. A high number is good for taking control of the round, a low number is good for doing lots of things.</p>`,
          cards: ["con2", "con4", "con6"] },
        { title: "Ambition icon",
          html: `<p>Cards numbered 2 to 6 also show an <b>ambition</b> in the corner. You'll use it in Part 4 to announce a contest. Ignore it for now.</p>` },
        { title: "How many cards?",
          html: `<ul><li>The deck has <b>28 cards</b>: each suit from 1 to 7.</li><li>With <b>4 players</b> you use all 28.</li><li>With <b>2 or 3 players</b> you take out the 1s and 7s, leaving 20 cards.</li></ul><p>At the start of each chapter, everyone gets <b>6 cards</b>.</p>` },
        { title: "Try it: read a card",
          html: `<p>Tap a card, and see what it lets you do.</p>`,
          widget: ["readcard", {}], gate: "Read three cards" },
        { title: "Quick check",
          quiz: { q: "Which suit lets you Build?", options: [
            { t: "🏗️ Construction", ok: true, why: "Construction: Build and Repair." },
            { t: "📜 Administration", why: "Administration is Tax, Repair and Influence." },
            { t: "🚀 Mobilization", why: "Mobilization is Move and Influence." },
            { t: "⚔️ Aggression", why: "Aggression is Battle, Move and Secure." }] } }
      ],
      recap: ["4 suits: Administration, Aggression, Construction, Mobilization.", "Each pip = one action of the card's suit.", "High number = few pips. Low number = many pips.", "6 cards each per chapter. 2–3 players remove the 1s and 7s."]
    },
    {
      id: "lead", unit: "cards", emoji: "👑", title: "Leading a round", blurb: "The player with initiative goes first.",
      steps: [
        { title: "Rounds",
          html: `<p>A chapter is made of <b>rounds</b>. In a round, every player plays <b>one card</b> and takes one turn, going clockwise.</p>`,
          pics: [["initiative.png", "The initiative marker", "The initiative marker"]],
          after: `<p>The player with the <b>initiative marker</b> goes first. They are the <b>leader</b> this round.</p>` },
        { title: "The leader plays a card",
          html: `<p>The leader plays any card from their hand <b>face up</b>. This is the <b>lead card</b>.</p><p>Then they take <b>one action per pip</b>, choosing from the actions of that suit. They can repeat the same action, or mix them.</p>`,
          cards: ["mob2"],
          after: `<p>For example, with this card the leader could Move 4 times, or Move twice and Influence twice.</p>` },
        { title: "The lead card sets the suit",
          html: `<p>The lead card is very important: it decides what everyone else can easily do this round. Next lesson shows how.</p>`,
          tip: "When you lead, think: which suit do I want, and which suit do my Rivals NOT want?" },
        { title: "Passing",
          html: `<p>The leader can also <b>pass</b> instead of playing a card (and must pass if they have no cards). Then the initiative goes to the next player clockwise who still has cards, and the round ends at once.</p><p>If everyone who has cards passes in a row, the chapter ends.</p>` },
        { title: "Quick check",
          quiz: { q: "You lead with a card that has 3 pips. What can you do?", options: [
            { t: "3 actions from that card's suit", ok: true },
            { t: "3 actions of any kind", why: "Only actions of that card's suit. (Resources can add other actions, you'll see that later.)" },
            { t: "1 action", why: "Each pip is one action, so 3 pips = 3 actions." }] } }
      ],
      recap: ["Each round, everyone plays one card, clockwise.", "The initiative holder leads: plays the lead card face up.", "One action per pip, from the card's suit."]
    },
    {
      id: "follow", unit: "cards", emoji: "🔁", title: "Surpass, Copy, Pivot", blurb: "The heart of Arcs.",
      steps: [
        { title: "Your turn after the leader",
          html: `<p>When it's your turn and you're not the leader, you <b>must</b> play a card in one of three ways:</p>`,
          cards: ["agg4"],
          after: `<p class="muted small">Imagine this is the lead card: Aggression 4.</p>` },
        { title: "1. Surpass",
          html: `<p class="big"><b>Same suit, higher number.</b></p><p>You get <b>all your card's pips</b> as actions. This is the best result!</p>`,
          cards: ["agg4", "agg5"],
          after: `<p>Aggression 5 beats Aggression 4, so it Surpasses. You get its 2 pips: 2 actions from Aggression.</p>`,
          mem: "You only have to beat the LEAD card, not the other players' cards." },
        { title: "2. Copy",
          html: `<p class="big"><b>Any card, face down.</b></p><p>You get <b>1 action</b> from the <b>lead card's suit</b>. Nobody sees which card you threw away.</p>`,
          cards: ["agg4", { down: true }],
          after: `<p>Useful when you don't have the right suit, or want to hide or get rid of a card.</p>` },
        { title: "3. Pivot",
          html: `<p class="big"><b>A different suit, face up.</b></p><p>You get <b>1 action</b> from <b>your own card's suit</b>. Any number works.</p>`,
          cards: ["agg4", "con6"],
          after: `<p>Pivoting with Construction 6 gives you 1 Construction action (Build or Repair), even though the lead suit is Aggression.</p>` },
        { title: "Side by side",
          html: `<table class="tbl"><tr><th></th><th>Which card</th><th>You get</th></tr><tr><td><b>Surpass</b></td><td>Same suit, higher number, face up</td><td>All its pips</td></tr><tr><td><b>Copy</b></td><td>Any card, face down</td><td>1 action of the lead suit</td></tr><tr><td><b>Pivot</b></td><td>Other suit, face up</td><td>1 action of your suit</td></tr></table>`,
          warn: "A card of the same suit but LOWER number can't Surpass. You could still play it face down to Copy." },
        { title: "Try it",
          html: `<p>Here's the lead card and your hand. Pick a card, then pick how to play it. The widget tells you what you'd get.</p>`,
          widget: ["follow", {}], gate: "Make three good plays" },
        { title: "Quick check",
          quiz: { q: "The lead card is Construction 4. You play Mobilization 2 face up. What do you get?", cards: ["con4", "mob2"], options: [
            { t: "1 Mobilization action (a Pivot)", ok: true, why: "Different suit, face up = Pivot: 1 action from your own card's suit." },
            { t: "4 Mobilization actions", why: "Only a Surpass gives all the pips, and a Surpass must be the same suit as the lead." },
            { t: "1 Construction action", why: "That would be a Copy (face down). Face up in another suit is a Pivot, so you use your own suit." }] } }
      ],
      recap: ["Surpass: same suit, higher number, all pips.", "Copy: any card face down, 1 action of the lead suit.", "Pivot: other suit face up, 1 action of your suit.", "You only need to beat the lead card."]
    },
    {
      id: "initiative", unit: "cards", emoji: "🏁", title: "Who leads next?", blurb: "Winning and seizing the initiative.",
      steps: [
        { title: "The initiative moves",
          html: `<p>At the end of each round, the initiative marker may change hands:</p><ol><li>If someone <b>seized</b> it (see next screen), they get it.</li><li>Otherwise, the player who <b>Surpassed with the highest number</b> gets it.</li><li>If nobody Surpassed, it <b>stays</b> with the leader.</li></ol>`,
          mem: "Copy and Pivot never win the initiative. Only Surpassing (or seizing) does." },
        { title: "Seizing the initiative",
          html: `<p>Sometimes you really want to lead next round. You can <b>seize</b> the initiative, right after playing your card and before doing any action:</p><ul><li>Play <b>one extra card face down</b>. It gives no actions, it's the price.</li><li>Or, in a <b>4-player</b> game, Surpass with a <b>7</b>. You keep the 7's actions.</li></ul><p>Lay the marker on its side to show it's been seized. <b>Only one player</b> can seize per round, and the leader can't seize (they already hold it).</p>` },
        { title: "Why does it matter?",
          html: `<p>The leader chooses the suit for the round, and only the leader can announce ambitions. Leading at the right moment is a big part of the game.</p>`,
          tip: "Seizing costs a whole card, so you'll have fewer turns this chapter. Do it when it really counts." },
        { title: "Try it: who gets it?",
          html: `<p>For each round, tap who holds the initiative next.</p>`,
          widget: ["initiative", {}], gate: "Solve all the rounds" },
        { title: "End of the round",
          html: `<p>Everyone's played cards (including seizing cards) are discarded face down. If anyone still has cards, a new round starts with the initiative holder leading.</p>` },
        { title: "Quick check",
          quiz: { q: "Lead: Aggression 2. Blue Surpasses with Aggression 4, Yellow Surpasses with Aggression 6, nobody seizes. Who leads next?", options: [
            { t: "Yellow", ok: true, why: "The highest Surpass wins the initiative: 6 beats 4." },
            { t: "Blue", why: "Blue Surpassed, but Yellow's 6 is higher than Blue's 4." },
            { t: "The same leader", why: "That only happens when nobody Surpasses." }] } }
      ],
      recap: ["Next leader: the seizer, else the highest Surpass, else nobody changes.", "Seize by adding an extra face-down card (or Surpassing with a 7 in 4-player games).", "One seize per round."]
    },
    {
      id: "chapter", unit: "cards", emoji: "📖", title: "A chapter, start to end", blurb: "Putting rounds together.",
      steps: [
        { title: "A chapter in 4 beats",
          html: `<ol class="steps"><li><b>Deal</b>: shuffle all the action cards, 6 to each player.</li><li><b>Play rounds</b>: lead, follow, pass the initiative, again and again.</li><li><b>Cards run out</b>: when nobody has cards left (or everyone with cards passes in a row), the chapter ends.</li><li><b>Score</b> the ambitions, tidy up, and start the next chapter.</li></ol>` },
        { title: "Not everyone runs out together",
          html: `<p>Seizing uses an extra card, so a player can run out early. A player with no cards simply skips their turn for the rest of the chapter.</p>` },
        { title: "Try it: a whole round",
          html: `<p>Here's a full round with 3 players. You are <b>Red</b>. Make your play, then watch the others.</p>`,
          widget: ["round", {}], gate: "Finish the round" },
        { title: "Quick check",
          quiz: { q: "When does a chapter end?", options: [
            { t: "When nobody has cards left, or everyone with cards passes in a row", ok: true },
            { t: "After 6 rounds exactly", why: "Usually about 6 rounds, but seizing and passing can change that. It ends when the cards run out." },
            { t: "When someone wins a battle", why: "Battles don't end chapters. Running out of cards does." }] } }
      ],
      recap: ["Deal 6 each, play rounds until cards run out, then score.", "A player with no cards skips their turns.", "Up to 5 chapters."],
      checkpoint: "You now know how turns work, which is the hardest part. If you have the box, this is a good moment to watch Leder's official how-to-play video, then carry on with the actions."
    },

    /* ---------------- Part 3 ---------------- */
    {
      id: "move", unit: "actions", emoji: "🚀", title: "Move and Catapult", blurb: "Getting your ships around.",
      steps: [
        { title: "Move",
          html: `<p class="big">One Move action: take <b>any number</b> of your ships from one system and move them to <b>one adjacent</b> system.</p><p>You find Move on 🚀 Mobilization and ⚔️ Aggression cards.</p>`,
          tip: "Moving costs nothing. (Fuel can give you an extra Move, you'll see that later.)" },
        { title: "Catapult: the long jump",
          html: `<p>If your ships <b>start</b> in a system with one of <b>your starports</b>, they can keep going after the first step, along a chain of systems. You may drop off ships along the way.</p><p>They must stop when they:</p><ul><li>enter any <b>planet</b>, or</li><li>enter a <b>gate controlled by someone else</b>.</li></ul>`,
          pics: [["starport-yellow.png", "A yellow starport", "Ships leaving a Loyal starport can Catapult."]],
          warn: "Control is checked before you enter a gate. And you can't enter out-of-play systems at all." },
        { title: "Try it: plan a trip",
          html: `<p>Move your ships to the target. Tap a system next to your ships to move there.</p>`,
          widget: ["move", {}], gate: "Reach both targets" },
        { title: "Quick check",
          quiz: { q: "Your ships start on a planet with your starport. They Catapult to the gate, then try to go on to the next gate, which Blue controls. What happens?", options: [
            { t: "They must stop when they enter Blue's gate", ok: true, why: "Catapulting ships stop on entering a gate someone else controls." },
            { t: "They can't enter Blue's gate at all", why: "They can enter it, but the Catapult stops there." },
            { t: "They keep going, Catapult ignores control", why: "Gates controlled by someone else stop a Catapult." }] } }
      ],
      recap: ["Move: any number of your ships from one system to one adjacent system.", "Catapult: ships starting at your starport may keep moving.", "A Catapult stops on any planet or a gate someone else controls."]
    },
    {
      id: "build", unit: "actions", emoji: "🏗️", title: "Build", blurb: "Cities, starports and new ships.",
      steps: [
        { title: "Build, three ways",
          html: `<p>One Build action (🏗️ Construction) lets you do <b>one</b> of these:</p><ul><li><b>Build a city</b> in an empty building slot, in a system where you have a piece. Take the <b>leftmost</b> city from your board.</li><li><b>Build a starport</b> in an empty building slot, in a system where you have a piece.</li><li><b>Build a ship</b> at one of your starports. Each starport makes at most <b>1 ship per turn</b>.</li></ul>`,
          pics: [["city-white.png", "A white city", "City"], ["starport-white.png", "A white starport", "Starport"], ["ship-white.png", "A white ship", "Ship"]],
          tip: "Building costs nothing but the action." },
        { title: "Building under pressure",
          html: `<p>If <b>someone else controls</b> the system, your new piece arrives <b>damaged</b>.</p>`,
          warn: "So it's often worth moving ships in first, to take control." },
        { title: "Why build cities?",
          html: `<p>A city does two things:</p><ul><li>You can <b>Tax</b> it for that planet's resource (next lesson).</li><li>Taking it off your board <b>uncovers</b> new spaces: more resource slots, and bonuses that add Power when you win an ambition outright.</li></ul>` },
        { title: "Repair",
          html: `<p><b>Repair</b> is on 🏗️ Construction and 📜 Administration cards. One Repair action fixes <b>one</b> damaged ship or building of yours, <b>anywhere</b> on the map. Stand the ship up, or flip the building back.</p>` },
        { title: "Quick check",
          quiz: { q: "You have 2 starports. How many ships can you make with 3 Build actions this turn?", options: [
            { t: "2", ok: true, why: "Each starport makes at most 1 ship per turn. The third Build could make a city or a starport instead." },
            { t: "3", why: "Each starport can only build 1 ship per turn, and you have 2 starports." },
            { t: "6", why: "One Build makes one thing, and each starport makes at most 1 ship a turn." }] } }
      ],
      recap: ["Build a city or starport in an empty slot where you have a piece.", "Build a ship at your starport, 1 per starport per turn.", "In a system someone else controls, new pieces arrive damaged.", "Repair fixes one damaged piece anywhere."]
    },
    {
      id: "tax", unit: "actions", emoji: "💰", title: "Tax and resources", blurb: "Collecting what your planets make.",
      steps: [
        { title: "Tax",
          html: `<p class="big">One Tax action (📜 Administration): choose one of your cities and gain <b>1 resource</b> of that planet's type.</p><p>Each city can be taxed <b>once per turn</b>.</p>`,
          pics: [["city-red.png", "A red city", "Tax a city to gain the planet's resource."]] },
        { title: "Taxing a Rival's city",
          html: `<p>You can also tax a <b>Rival's city</b> in a system <b>you control</b>. You gain the resource, <b>and</b> you capture one of that Rival's agents from their supply.</p><p>Captured agents go to your <b>Captives</b>. Captives matter for the Tyrant ambition.</p>`,
          pics: [["agent-blue.png", "A blue agent", "A captured agent becomes a captive."]] },
        { title: "Where resources go",
          html: `<p>Resources sit in the round <b>resource slots</b> on your player board. Some slots start covered by your cities, so building cities opens more.</p><p>When you gain a resource you can rearrange your tokens, but if you have no room, you must <b>discard</b> one.</p>`,
          tip: "Resources do two jobs: they count for ambitions, and you can spend them for extra actions (lesson 16)." },
        { title: "Try it: tax your cities",
          html: `<p>Tap cities to tax them. Watch your resource slots fill up.</p>`,
          widget: ["tax", {}], gate: "Fill your slots" },
        { title: "Quick check",
          quiz: { q: "You tax Yellow's city in a system you control. What happens?", options: [
            { t: "You gain the resource and capture a Yellow agent", ok: true },
            { t: "You gain the resource only", why: "Taxing a Rival city also captures one of their agents." },
            { t: "You can't tax a Rival's city", why: "You can, if you control that system." }] } }
      ],
      recap: ["Tax: 1 resource from one of your cities, each city once per turn.", "Tax a Rival city in a system you control: also capture one of their agents.", "Resources live in slots on your board. No room = discard."]
    },
    {
      id: "court", unit: "actions", emoji: "🏛️", title: "The Court", blurb: "Influence, Secure, and Guild cards.",
      steps: [
        { title: "The Court",
          html: `<p>A row of cards lies face up next to the map: <b>4 cards</b> with 3 or 4 players, <b>3</b> with 2 players. This is the <b>Court</b>.</p><ul><li><b>Guild cards</b> give you a new ability, and show a resource icon that counts for ambitions.</li><li><b>Vox cards</b> are events: something happens at once when you take one.</li></ul>`,
          pics: [["court-back.png", "The back of a Court card", "The back of a Court card. The fronts show a Guild or Vox card with its ability."]] },
        { title: "Influence",
          html: `<p class="big">One Influence action (📜 Administration or 🚀 Mobilization): put <b>1 agent</b> on <b>any</b> Court card.</p>`,
          pics: [["agent-yellow.png", "A yellow agent", "Agents sit on Court cards."]] },
        { title: "Secure",
          html: `<p class="big">One Secure action (⚔️ Aggression): take a Court card where you have <b>more agents than each Rival</b>.</p><ul><li>Your agents on it go back to your supply.</li><li>Rival agents on it become <b>your captives</b>.</li><li>Do what the card says when secured, then fill the empty space from the Court deck.</li></ul>`,
          warn: "A tie is not enough. You need strictly more agents than every Rival on that card." },
        { title: "Try it: can you Secure?",
          html: `<p>For each Court card, decide if Red can Secure it.</p>`,
          widget: ["secure", {}], gate: "Check every card" },
        { title: "Quick check",
          quiz: { q: "On a Court card: Red 2 agents, Blue 2 agents. Red Secures. What happens?", options: [
            { t: "Red can't Secure it: it's a tie", ok: true },
            { t: "Red takes it and captures Blue's 2 agents", why: "That needs Red to have MORE agents than Blue. 2 vs 2 is a tie." },
            { t: "Red and Blue share it", why: "Cards aren't shared. With a tie, nobody can Secure it." }] } }
      ],
      recap: ["The Court: a face-up row of Guild and Vox cards.", "Influence: put 1 agent on any Court card.", "Secure: take a card where you have more agents than each Rival.", "Rival agents on a secured card become your captives."]
    },
    {
      id: "battle", unit: "actions", emoji: "🎲", title: "Battle", blurb: "Dice, hits and trophies.",
      steps: [
        { title: "Starting a battle",
          html: `<p>One Battle action (⚔️ Aggression):</p><ol><li>Pick a system where you have ships.</li><li>Pick <b>one</b> Rival there to attack.</li><li>Take up to <b>1 die per attacking ship</b> (any mix of kinds, but at most 6 of one kind).</li><li>Roll!</li></ol>` },
        { title: "The dice icons",
          html: `<ul class="dice-key"><li>{hit} <b>Hit</b>: damages one of the defender's pieces.</li><li>{self} <b>Self-hit</b>: damages one of <i>your</i> attacking ships.</li><li>{intercept} <b>Intercept</b>: the defender hits back, once per fresh defending ship.</li><li>{bhit} <b>Building hit</b>: hits a defending building directly.</li><li>{key} <b>Key</b>: used to raid (next lesson).</li></ul>` },
        { title: "Three kinds of dice",
          html: `<p>Each kind has its own personality:</p>`,
          widget: ["dicefaces", {}],
          after: `<ul><li><b>Skirmish</b>: safe but weak. Only hits or blanks.</li><li><b>Assault</b>: lots of hits, but you get hurt too.</li><li><b>Raid</b>: hits buildings and steals, but it's risky.</li></ul>`,
          warn: "You can only roll Raid dice if the defender has a building in this system, or has no buildings anywhere." },
        { title: "Resolving, in order",
          html: `<p>The attacker sorts everything out in this order:</p><ol class="steps"><li>{self} Self-hits on your own ships.</li><li>{intercept} If any intercept came up: you take 1 hit per <b>fresh</b> defending ship (once per battle, however many intercepts).</li><li>{hit} Hits on the defender's ships. When they have no ships left, hits go on their buildings.</li><li>{bhit} Building hits on the defender's buildings.</li><li>{key} Raid with keys, if you still have ships there.</li></ol>`,
          tip: "Hits on a fresh piece damage it. Hits on a damaged piece destroy it. The attacker chooses which of their own ships take hits." },
        { title: "Trophies",
          html: `<p>When you destroy a Rival's piece in battle, it goes into your <b>Trophies</b>. If your ships are destroyed by self-hits or intercepts, they go to the <b>defender's</b> trophies.</p><p>Trophies matter for the Warlord ambition.</p>` },
        { title: "Try it: roll a battle",
          html: `<p>Red attacks Blue. Choose your dice and roll, then follow the steps.</p>`,
          widget: ["battle", {}], gate: "Fight a battle" },
        { title: "Quick check",
          quiz: { q: "You roll two intercepts. The defender has 3 fresh ships. How many hits do you take from intercepts?", options: [
            { t: "3", ok: true, why: "Intercept happens once per battle: 1 hit per fresh defending ship, so 3." },
            { t: "6", why: "Intercept only counts once per battle, however many came up." },
            { t: "2", why: "It isn't one hit per intercept. It's one hit per fresh defending ship, once." }] } }
      ],
      recap: ["Battle one Rival in a system with your ships.", "Up to 1 die per attacking ship.", "Order: self-hits, intercept, hits, building hits, raid.", "Destroyed Rival pieces become your trophies."]
    },
    {
      id: "raid", unit: "actions", emoji: "🗝️", title: "Raids and ruined cities", blurb: "Stealing, Outrage and Ransack.",
      steps: [
        { title: "Raiding",
          html: `<p>Keys {key} let you steal from the player you attacked. Above each of their resource slots, and in the corner of each Guild card, there is a <b>raid cost</b> in keys.</p><p>Spend that many keys to steal that resource or that Guild card. Steal one item at a time, as long as your keys last.</p>`,
          warn: "You can only raid if you still have attacking ships in the system after the hits." },
        { title: "Destroying a city: Outrage",
          html: `<p>Destroying a Rival's city is a big deal. The city becomes your trophy, but you become <b>Outraged</b> for that planet's resource:</p><ul><li>Discard all your resources and Guild cards of that type.</li><li>Put one of your agents on that resource's Outrage space on your board.</li><li>From now on you can't spend that resource for extra actions. (You can still tax it, and it still counts for ambitions.)</li></ul>` },
        { title: "...and Ransack",
          html: `<p>The good news: you then <b>Ransack</b> the Court. Take one Court card that has any of the defender's agents on it. All Rival agents on it become your <b>trophies</b> (not captives).</p>`,
          tip: "So burning a city hurts you a little and the defender a lot. Use it when the prize is worth it." },
        { title: "Quick check",
          quiz: { q: "You destroy a Rival's city on a Fuel planet. What happens to you?", options: [
            { t: "You're Outraged for Fuel, then you Ransack the Court", ok: true },
            { t: "You gain all their Fuel", why: "Destroying a city doesn't give you resources. Raiding with keys does." },
            { t: "Nothing special, it's just a trophy", why: "It is a trophy, but you also get Outrage (bad) and a Ransack (good)." }] } }
      ],
      recap: ["Keys pay the raid cost to steal a resource or Guild card.", "Destroying a city makes you Outraged for that resource.", "Then you Ransack: take a Court card with the defender's agents, which become your trophies."]
    },
    {
      id: "prelude", unit: "actions", emoji: "✨", title: "Spending resources", blurb: "Extra actions before your pips.",
      steps: [
        { title: "The Prelude",
          html: `<p>Right after you play your card, before you use its first pip, there's a moment called the <b>Prelude</b>.</p><p>In your Prelude you may <b>spend</b> any number of resources (put them back in the supply). Each one gives you an extra boost, whatever card you played:</p>` },
        { title: "What each resource gives",
          html: `<table class="tbl res-tbl"><tr><td>{material}</td><td><b>Material</b></td><td>1 Build or Repair</td></tr><tr><td>{fuel}</td><td><b>Fuel</b></td><td>1 Move</td></tr><tr><td>{weapon}</td><td><b>Weapon</b></td><td>this turn, your card's pips may also Battle</td></tr><tr><td>{relic}</td><td><b>Relic</b></td><td>1 Secure</td></tr><tr><td>{psionic}</td><td><b>Psionic</b></td><td>1 action from the <b>lead</b> card</td></tr></table>`,
          tip: "This is how a Copy or a Pivot can turn into a big turn: a weak card plus a few resources." },
        { title: "Try it: match them up",
          html: `<p>Tap a resource, then the action it gives.</p>`,
          widget: ["prelude", {}], gate: "Match all five" },
        { title: "The small print",
          html: `<ul><li>Decide whether to declare an ambition or seize the initiative <b>before</b> spending.</li><li>If you pass or have no cards, you can't spend resources.</li><li>You can't spend a resource you're Outraged for.</li></ul>`,
          warn: "Spending a resource also means it no longer counts for ambitions. Think before you spend!" },
        { title: "Quick check",
          quiz: { q: "You Copy (1 action), and you have 2 Fuel. In your Prelude you spend both. How many Moves can you make this turn, at most?", options: [
            { t: "3: 2 from Fuel, 1 from the Copy (if the lead suit has Move)", ok: true },
            { t: "2", why: "The Fuel gives 2, and the Copy still gives its own action too." },
            { t: "1", why: "Each Fuel spent in the Prelude adds a Move." }] } }
      ],
      recap: ["Prelude: right after playing your card, before the first pip.", "{material} Build/Repair, {fuel} Move, {weapon} lets your pips Battle, {relic} Secure, {psionic} a lead-card action.", "Spent resources stop counting for ambitions."]
    },

    /* ---------------- Part 4 ---------------- */
    {
      id: "ambitions", unit: "ambitions", emoji: "🏆", title: "The five ambitions", blurb: "The contests that give Power.",
      steps: [
        { title: "Five contests",
          html: `<p>These are the five ambitions. At the end of a chapter, only the ones that were <b>declared</b> (announced) are scored.</p><table class="tbl amb-tbl"><tr><th>Ambition</th><th>Who wins it</th></tr><tr><td><b>Tycoon</b></td><td>most {fuel} Fuel + {material} Material</td></tr><tr><td><b>Tyrant</b></td><td>most captives</td></tr><tr><td><b>Warlord</b></td><td>most trophies</td></tr><tr><td><b>Keeper</b></td><td>most {relic} Relics</td></tr><tr><td><b>Empath</b></td><td>most {psionic} Psionics</td></tr></table>` },
        { title: "What counts",
          html: `<ul><li>Resource tokens on your board, <b>and</b> the resource icons on your Guild cards both count.</li><li>{weapon} Weapons don't count for any ambition.</li><li>You need at least 1 of the thing to score at all.</li></ul>` },
        { title: "Match the ambition",
          html: `<p>Tap the ambition each player is trying to win.</p>`,
          widget: ["ambmatch", {}], gate: "Match them all" },
        { title: "Quick check",
          quiz: { q: "Which ambition do trophies help you win?", options: [
            { t: "Warlord", ok: true },
            { t: "Tyrant", why: "Tyrant is about captives (agents you captured)." },
            { t: "Tycoon", why: "Tycoon is about Fuel and Material." }] } }
      ],
      recap: ["Tycoon: Fuel + Material. Tyrant: captives. Warlord: trophies. Keeper: Relics. Empath: Psionics.", "Tokens and Guild card icons both count. Weapons never count.", "Only declared ambitions are scored."]
    },
    {
      id: "declare", unit: "ambitions", emoji: "📣", title: "Declaring an ambition", blurb: "Choosing which contests count.",
      steps: [
        { title: "Only the leader declares",
          html: `<p>When you lead, before doing any action, you may <b>declare</b> the ambition shown on your lead card:</p><ol><li>Put the <b>highest available</b> ambition marker in that ambition's box on the board.</li><li>Put the <b>zero marker</b> on your lead card. It now counts as <b>0</b>, but keeps its pips.</li></ol>`,
          pics: [["amb-front-5-3.png", "Ambition marker 5/3", "5 / 3"], ["amb-front-3-2.png", "Ambition marker 3/2", "3 / 2"], ["amb-front-2-0.png", "Ambition marker 2/0", "2 / 0"]] },
        { title: "Which ambition?",
          html: `<p>Your lead card's number tells you which ambition you may declare:</p><table class="tbl"><tr><th>Card</th><th>Ambition</th></tr><tr><td>1</td><td>none</td></tr><tr><td>2</td><td>Tycoon</td></tr><tr><td>3</td><td>Tyrant</td></tr><tr><td>4</td><td>Warlord</td></tr><tr><td>5</td><td>Keeper</td></tr><tr><td>6</td><td>Empath</td></tr><tr><td>7</td><td>any one</td></tr></table>` },
        { title: "The markers",
          html: `<p>Each ambition marker shows two numbers: Power for <b>1st place</b> and for <b>2nd place</b>. There are 3 markers, and once all 3 are placed in a chapter, nobody can declare any more.</p><p>You can declare an ambition that already has a marker: it then has two, and is worth more.</p>`,
          cards: [{ s: "agg", n: 4, zero: true }],
          after: `<p class="muted small">A declared lead card: the zero marker makes it a 0.</p>` },
        { title: "The price of declaring",
          html: `<p>Your lead card becomes a <b>0</b>. So <b>any</b> card of that suit can Surpass it, and someone will probably take the initiative from you.</p>`,
          tip: "Declare an ambition you're likely to win, ideally when Rivals can't easily Surpass your suit." },
        { title: "Quick check",
          quiz: { q: "You lead Construction 4 and declare Warlord. Then Blue plays Construction 2 face up. What is it?", options: [
            { t: "A Surpass: your card now counts as 0", ok: true, why: "Declaring makes the lead card 0, so even a low card of that suit beats it." },
            { t: "A Pivot", why: "It's the same suit, so it's not a Pivot." },
            { t: "Not allowed", why: "It's allowed: 2 is higher than 0." }] } }
      ],
      recap: ["Only the leader declares, before any action.", "The lead card's number shows which ambition (2 Tycoon, 3 Tyrant, 4 Warlord, 5 Keeper, 6 Empath, 7 any).", "Place the highest available marker; your card becomes 0.", "At most 3 declarations per chapter."]
    },
    {
      id: "scoring", unit: "ambitions", emoji: "🧮", title: "Scoring a chapter", blurb: "Who gets how much Power.",
      steps: [
        { title: "Scoring each declared ambition",
          html: `<p>At the end of the chapter, look at each ambition box that has at least one marker:</p><ul><li><b>1st place</b> gets the <b>big</b> numbers of all markers in that box, added up.</li><li><b>2nd place</b> gets the <b>small</b> numbers, added up.</li></ul><p>Anyone can score, not just the player who declared it.</p>` },
        { title: "Ties",
          html: `<ul><li>A <b>tie for 1st</b>: the tied players all get <b>2nd-place</b> Power, and nobody else scores.</li><li>A <b>tie for 2nd</b>: nobody gets 2nd place Power.</li><li>You need at least 1 of the counted thing to score.</li></ul>`,
          warn: "Ties are common in Arcs. Even one extra resource can make a big difference." },
        { title: "City bonuses",
          html: `<p>Remember the spaces uncovered by building cities? Some of them say <b>+2</b> and <b>+3</b>. If you win an ambition <b>outright</b> (1st place, no tie), you add the bonuses you've uncovered: +2, or +5 with both. Once per ambition.</p>` },
        { title: "Try it: score a chapter",
          html: `<p>Work out each player's Power for this ambition.</p>`,
          widget: ["score", {}], gate: "Score all the examples" },
        { title: "Quick check",
          quiz: { q: "Keeper has the 5/3 marker. Red has 2 Relics, Blue has 2 Relics, Yellow has 1. Who scores what?", options: [
            { t: "Red 3, Blue 3, Yellow 0", ok: true, why: "A tie for 1st: both get 2nd-place Power (3), and nobody else scores." },
            { t: "Red 5, Blue 5, Yellow 3", why: "Tied first places get the 2nd-place number, and then nobody else scores." },
            { t: "Red 5, Blue 3, Yellow 0", why: "Red and Blue are tied, so neither gets 1st place." }] } }
      ],
      recap: ["1st place: sum of the big numbers. 2nd place: sum of the small numbers.", "Tie for 1st: they get 2nd-place Power, nobody else scores.", "City bonuses (+2, +3) only for an outright win."]
    },
    {
      id: "endgame", unit: "ambitions", emoji: "🔚", title: "End of chapter, end of game", blurb: "The tidy-up between chapters.",
      steps: [
        { title: "After scoring",
          html: `<ol class="steps"><li>If <b>Warlord</b> was scored, everyone returns <b>all</b> their trophies. If <b>Tyrant</b> was scored, everyone returns <b>all</b> their captives. Otherwise they stay for next chapter!</li><li>All ambition markers go back to the available area. Then flip the <b>lowest-value</b> marker that hasn't been flipped yet: it's worth more from now on.</li><li>Check the end of the game (27 / 30 / 33 Power, or chapter 5).</li><li>If it goes on: move the chapter marker, shuffle all the action cards, deal 6 each.</li></ol>`,
          pics: [["amb-front-2-0.png", "Marker 2/0, front", "2 / 0 becomes..."], ["amb-back-4-2.png", "Marker 4/2, back", "4 / 2"]] },
        { title: "The markers grow",
          html: `<table class="tbl"><tr><th>Marker</th><th>Start side</th><th>Flipped side</th></tr><tr><td>Low</td><td>2 / 0</td><td>4 / 2</td></tr><tr><td>Middle</td><td>3 / 2</td><td>6 / 3</td></tr><tr><td>High</td><td>5 / 3</td><td>9 / 4</td></tr></table><p>So later chapters are worth more Power. A player who is behind can still catch up!</p>` },
        { title: "Who wins",
          html: `<p>When the game ends, <b>most Power wins</b>. If tied, the tied player who comes first in turn order (starting from the initiative holder) wins.</p>` },
        { title: "Quick check",
          quiz: { q: "In chapter 1 only Tycoon and Keeper were scored. What happens to everyone's trophies?", options: [
            { t: "They stay for the next chapter", ok: true, why: "Trophies are only returned when Warlord is scored." },
            { t: "Everyone returns them", why: "That only happens when Warlord is scored." },
            { t: "They turn into Power", why: "Trophies never turn into Power directly. They count for Warlord." }] } }
      ],
      recap: ["Warlord scored: return all trophies. Tyrant scored: return all captives.", "Flip the lowest unflipped ambition marker each chapter.", "End at 27 / 30 / 33 Power or after chapter 5. Most Power wins."]
    },

    /* ---------------- Part 5 ---------------- */
    {
      id: "setup", unit: "play", emoji: "📦", title: "Setting up", blurb: "Getting the box onto the table.",
      steps: [
        { title: "The table",
          html: `<ol class="steps"><li>Lay out the map. The dice and resource tokens make the supply.</li><li>Give the initiative marker to a random player.</li><li>Make the action deck: the 2–6 cards, plus the 1s and 7s with 4 players only.</li><li>Ambition markers go in the available area, on their starting side. Chapter marker on 1. Zero marker in its slot.</li><li>Shuffle the Court deck (Guild and Vox cards together). Deal the Court: 4 cards face up (3 with 2 players).</li><li>Draw a setup card for your number of players, and cover the out-of-play cluster(s).</li></ol>`,
          tip: "With 2 players there's one extra step: put the 6 resources that match the covered planets on the ambition boxes. They act like a third player in scoring." },
        { title: "The players",
          html: `<ol class="steps"><li>Each player takes a colour: board, 5 cities, 5 starports, 15 ships, 10 agents. Cities go in the slots at the top of the board.</li><li>Power markers on 0.</li><li>The setup card shows where everyone starts. The initiative holder is player 1, then clockwise.<ul><li><b>A</b>: 3 ships + 1 city</li><li><b>B</b>: 3 ships + 1 starport</li><li><b>C</b>: 2 ships</li></ul></li><li>Each player gains 2 resources: one matching the planet of their A system, one matching their B system.</li><li>Shuffle the action cards and deal <b>6</b> to each player.</li></ol>`,
          warn: "Don't add the Leaders & Lore cards in your first game. The rulebook says to save them for later." },
        { title: "Put it in order",
          html: `<p>Tap the setup steps in the right order.</p>`,
          widget: ["order", {}], gate: "Get the order right" },
        { title: "Quick check",
          quiz: { q: "How many starting resources does each player get?", options: [
            { t: "2: one for the A planet, one for the B planet", ok: true },
            { t: "None", why: "Each player gains 2, matching the planets of their A and B systems." },
            { t: "5: one of each", why: "Just 2, matching the planets where they start." }] } }
      ],
      recap: ["Initiative to a random player, who is player 1.", "Use the setup card for starting positions: A = 3 ships + city, B = 3 ships + starport, C = 2 ships.", "2 starting resources each, 6 cards each.", "No Leaders & Lore in the first game."]
    },
    {
      id: "firstround", unit: "play", emoji: "🎬", title: "A first chapter, guided", blurb: "Thinking like a player.",
      steps: [
        { title: "A plan for chapter 1",
          html: `<p>A simple, solid plan for your first chapter:</p><ol><li>Look at your hand. Which ambition could you win? Count your resources.</li><li>Build a second city early (Construction). More cities = more resources and more slots.</li><li>Tax your cities (Administration) to grow your resources.</li><li>Declare an ambition you're ahead in, when you lead.</li></ol>` },
        { title: "Try it: what would you do?",
          html: `<p>A few situations from a real-feeling game. Pick the best play.</p>`,
          widget: ["choices", {}], gate: "Answer every situation" },
        { title: "Quick check",
          quiz: { q: "You lead and declare Tycoon. Blue has 3 Fuel, you have 1. Is that a good idea?", options: [
            { t: "Probably not: Blue is ahead and will likely score it", ok: true },
            { t: "Yes: the player who declares wins it", why: "Declaring doesn't win it for you. Whoever has the most at chapter end wins." },
            { t: "Yes: Blue can't score it because you declared", why: "Anyone can score any declared ambition." }] } }
      ],
      recap: ["Build cities early, tax them, and declare ambitions you can win.", "Anyone can score a declared ambition, not just the declarer."]
    },
    {
      id: "tips", unit: "play", emoji: "🌟", title: "Tips and next steps", blurb: "What to do after your first game.",
      steps: [
        { title: "Five beginner tips",
          html: `<ol><li><b>Watch the lead suit.</b> Before you lead, check which suits your Rivals seem to have.</li><li><b>Count before you declare.</b> You don't win by declaring, you win by having the most.</li><li><b>Copy is fine.</b> One action plus resources from your Prelude can be a great turn.</li><li><b>Guard your cities.</b> A few fresh ships nearby keep Rivals from taxing them.</li><li><b>Keep an eye on ties.</b> One extra token can turn a tie (2nd-place Power) into a win.</li></ol>` },
        { title: "After a few games",
          html: `<p>The base box also has <b>Leaders & Lore</b>: each player picks a Leader (with its own starting position, resources and power) and a Lore card (a permanent power). The rulebook says not to use them in your first game, so save them for game two or later.</p><p>And there's a whole campaign expansion, <i>The Blighted Reach</i>. That's for much later!</p>` },
        { title: "Quick check",
          quiz: { q: "When should you add Leaders & Lore?", options: [
            { t: "After your first game", ok: true },
            { t: "In your very first game", why: "The rulebook says not to use them in your first game." },
            { t: "Never, they're an expansion", why: "They're in the base box, as an optional way to play." }] } }
      ],
      recap: ["Watch suits, count before declaring, don't fear Copy, guard cities, mind ties.", "Leaders & Lore come in the base box: try them after game one."]
    }
  ];

  const glossary = [
    ["Adjacent", "Two systems sharing a thin border.", "map"],
    ["Ambition", "A contest (Tycoon, Tyrant, Warlord, Keeper, Empath). Declared ones score Power at chapter end.", "ambitions"],
    ["Agent", "A small piece you put on Court cards with Influence. Rivals can capture them.", "court"],
    ["Building", "A city or a starport.", "pieces"],
    ["Captive", "A Rival's agent that you captured. Counts for Tyrant.", "tax"],
    ["Catapult", "Ships starting at your starport may keep moving past the first system.", "move"],
    ["Chapter", "Rounds of card play until the cards run out, then scoring. Up to 5.", "chapter"],
    ["City", "A building that you can Tax for its planet's resource.", "build"],
    ["Cluster", "A group of 3 planets and 1 gate. The map has 6.", "map"],
    ["Control", "Having more fresh ships in a system than each Rival. A tie means nobody.", "control"],
    ["Copy", "Play any card face down to take 1 action of the lead card's suit.", "follow"],
    ["Court", "The face-up row of Guild and Vox cards.", "court"],
    ["Damaged", "A tipped ship or a flipped building. Hit again, it's destroyed.", "control"],
    ["Declare", "The leader puts an ambition marker on an ambition and makes the lead card 0.", "declare"],
    ["Fresh", "An upright ship or a building on its light side.", "control"],
    ["Gate", "The numbered system in each cluster. Gates link to other gates.", "map"],
    ["Guild card", "A Court card with an ability and a resource icon.", "court"],
    ["Influence", "Put 1 agent on any Court card.", "court"],
    ["Initiative", "Who leads the round. Shown by the initiative marker.", "initiative"],
    ["Lead card", "The card the leader plays face up. Sets the suit for the round.", "lead"],
    ["Loyal", "Yours, your colour.", "control"],
    ["Outrage", "What happens to you when you destroy a city: you lose that resource type and can't spend it.", "raid"],
    ["Pip", "A mark on an action card. One pip = one action.", "cards"],
    ["Pivot", "Play a card of another suit face up to take 1 action of your own suit.", "follow"],
    ["Power", "Points. Most Power wins.", "welcome"],
    ["Prelude", "The moment after playing your card and before its first pip, when you can spend resources.", "prelude"],
    ["Raid", "Spend keys from Raid dice to steal resources or Guild cards.", "raid"],
    ["Ransack", "After destroying a city, take a Court card with the defender's agents.", "raid"],
    ["Rival", "Another player, or their pieces.", "control"],
    ["Secure", "Take a Court card where you have more agents than each Rival.", "court"],
    ["Seize", "Take the initiative by playing an extra card face down (or a 7 Surpass with 4 players).", "initiative"],
    ["Starport", "A building that makes ships and lets ships Catapult.", "build"],
    ["Surpass", "Play a card of the lead suit with a higher number. You get all its pips.", "follow"],
    ["System", "One space on the map: a planet or a gate.", "map"],
    ["Tax", "Gain 1 resource from a city. A Rival's city also gives you a captive.", "tax"],
    ["Trophy", "A Rival piece you destroyed. Counts for Warlord.", "battle"],
    ["Vox card", "A Court card with an event that happens when you take it.", "court"]
  ];

  const cheat = [
    ["🎯 Goal", "<p>Most Power wins. Power comes only from ambitions. The game ends at chapter end with 27 / 30 / 33 Power (4 / 3 / 2 players), or after chapter 5.</p>"],
    ["🔁 A round", "<ol><li><b>Leader</b> (initiative): may declare, Prelude, then 1 action per pip. Or pass.</li><li><b>Others</b>, clockwise: <b>Surpass</b> (same suit, higher: all pips), <b>Copy</b> (face down: 1 lead action) or <b>Pivot</b> (other suit: 1 own action). One player may seize (extra face-down card, or a 7 Surpass with 4 players).</li><li><b>Initiative</b>: seizer, else highest Surpass, else stays.</li><li>Discard, next round.</li></ol>"],
    ["🃏 Suits", "<p>📜 Administration: Tax, Repair, Influence<br>⚔️ Aggression: Battle, Move, Secure<br>🏗️ Construction: Build, Repair<br>🚀 Mobilization: Move, Influence</p>"],
    ["✨ Prelude", "<p>{material} Build/Repair · {fuel} Move · {weapon} pips may Battle · {relic} Secure · {psionic} 1 lead-card action</p>"],
    ["🎲 Battle order", "<p>{self} self-hits → {intercept} intercept (1 hit per fresh defender, once) → {hit} hits (ships first) → {bhit} building hits → {key} raid</p>"],
    ["🏆 Ambitions", "<p><b>Tycoon</b> {fuel}+{material} · <b>Tyrant</b> captives · <b>Warlord</b> trophies · <b>Keeper</b> {relic} · <b>Empath</b> {psionic}<br>1st: big numbers. 2nd: small numbers. Tie for 1st: they get 2nd, nobody else scores.</p>"],
    ["🔚 Chapter end", "<p>Score → return trophies if Warlord scored, captives if Tyrant scored → flip the lowest unflipped marker → check game end → deal 6 each.</p>"]
  ];

  // extra final-quiz questions
  const exam = [
    { q: "How many cards does each player get at the start of a chapter?", options: [{ t: "6", ok: true }, { t: "7", why: "6 cards each." }, { t: "5", why: "6 cards each." }] },
    { q: "What does a Weapon let you do in your Prelude?", options: [{ t: "Your card's pips may also Battle this turn", ok: true }, { t: "Roll one extra die", why: "Weapons let your pips be used to Battle, whatever the suit." }, { t: "Steal a resource", why: "Stealing needs keys from Raid dice." }] },
    { q: "Which pieces count for control?", options: [{ t: "Fresh ships only", ok: true }, { t: "All ships", why: "Damaged ships don't count." }, { t: "Ships and buildings", why: "Only fresh ships count." }] },
    { q: "Who can declare an ambition?", options: [{ t: "Only the leader, on their lead card", ok: true }, { t: "Anyone who Surpasses", why: "Only the leader declares." }, { t: "Anyone, at the end of the chapter", why: "Ambitions are declared during play, by the leader." }] },
    { q: "With 3 players, which action cards are removed?", options: [{ t: "The 1s and 7s", ok: true }, { t: "None", why: "The 1s and 7s are only used with 4 players." }, { t: "The 6s and 7s", why: "It's the 1s and 7s." }] },
    { q: "What happens when the Tyrant ambition is scored?", options: [{ t: "Everyone returns all their captives", ok: true }, { t: "Everyone returns their trophies", why: "That's when Warlord is scored." }, { t: "Nothing", why: "Captives are returned when Tyrant is scored." }] }
  ];

  return { units, lessons, glossary, cheat, exam };
})();
