/* Learn Magic: all the course content. {G}, {2}, {T}... in any text become mana symbols.
   A step is one screen: { title, html, cards, after, widget: [name, opts], gate, quiz, tip, math, warn, mem }.
   `gate` makes the widget's own "done" unlock Next (with a skip link); a quiz always has to be answered. */
window.LEARN = (function () {
  "use strict";

  /* Simple, real cards drawn with CSS. Rules text matches the printed cards. */
  const cards = {
    forest: { name: "Forest", cost: "", type: "Basic Land — Forest", text: "{T}: Add {G}.", c: "G", art: "🌳", makes: "G" },
    plains: { name: "Plains", cost: "", type: "Basic Land — Plains", text: "{T}: Add {W}.", c: "W", art: "☀️", makes: "W" },
    island: { name: "Island", cost: "", type: "Basic Land — Island", text: "{T}: Add {U}.", c: "U", art: "🏝️", makes: "U" },
    swamp: { name: "Swamp", cost: "", type: "Basic Land — Swamp", text: "{T}: Add {B}.", c: "B", art: "🪦", makes: "B" },
    mountain: { name: "Mountain", cost: "", type: "Basic Land — Mountain", text: "{T}: Add {R}.", c: "R", art: "⛰️", makes: "R" },
    bears: { name: "Grizzly Bears", cost: "{1}{G}", type: "Creature — Bear", text: "", flavor: "Just two friendly bears.", c: "G", art: "🐻", pt: [2, 2] },
    angel: { name: "Serra Angel", cost: "{3}{W}{W}", type: "Creature — Angel", text: "Flying, vigilance", flavor: "Born with wings of light.", c: "W", art: "👼", pt: [4, 4], kw: ["Flying", "Vigilance"] },
    elves: { name: "Llanowar Elves", cost: "{G}", type: "Creature — Elf Druid", text: "{T}: Add {G}.", c: "G", art: "🧝", pt: [1, 1], makes: "G" },
    goblin: { name: "Raging Goblin", cost: "{R}", type: "Creature — Goblin Berserker", text: "Haste", c: "R", art: "👺", pt: [1, 1], kw: ["Haste"] },
    giant: { name: "Hill Giant", cost: "{3}{R}", type: "Creature — Giant", text: "", flavor: "Big, slow and grumpy.", c: "R", art: "🗿", pt: [3, 3] },
    spider: { name: "Giant Spider", cost: "{3}{G}", type: "Creature — Spider", text: "Reach", c: "G", art: "🕷️", pt: [2, 4], kw: ["Reach"] },
    rats: { name: "Typhoid Rats", cost: "{B}", type: "Creature — Rat", text: "Deathtouch", c: "B", art: "🐀", pt: [1, 1], kw: ["Deathtouch"] },
    nighthawk: { name: "Vampire Nighthawk", cost: "{1}{B}{B}", type: "Creature — Vampire Shaman", text: "Flying, deathtouch, lifelink", c: "B", art: "🦇", pt: [2, 3], kw: ["Flying", "Deathtouch", "Lifelink"] },
    dreadmaw: { name: "Colossal Dreadmaw", cost: "{4}{G}{G}", type: "Creature — Dinosaur", text: "Trample", c: "G", art: "🦖", pt: [6, 6], kw: ["Trample"] },
    dragon: { name: "Shivan Dragon", cost: "{4}{R}{R}", type: "Creature — Dragon", text: "Flying<br>{R}: Shivan Dragon gets +1/+0 until end of turn.", c: "R", art: "🐉", pt: [5, 5], kw: ["Flying"] },
    bolt: { name: "Lightning Bolt", cost: "{R}", type: "Instant", text: "Lightning Bolt deals 3 damage to any target.", c: "R", art: "⚡" },
    growth: { name: "Giant Growth", cost: "{G}", type: "Instant", text: "Target creature gets +3/+3 until end of turn.", c: "G", art: "💪" },
    murder: { name: "Murder", cost: "{1}{B}{B}", type: "Instant", text: "Destroy target creature.", c: "B", art: "🗡️" },
    counter: { name: "Counterspell", cost: "{U}{U}", type: "Instant", text: "Counter target spell.", c: "U", art: "🚫" },
    divination: { name: "Divination", cost: "{2}{U}", type: "Sorcery", text: "Draw two cards.", c: "U", art: "🔮" },
    swords: { name: "Swords to Plowshares", cost: "{W}", type: "Instant", text: "Exile target creature. Its controller gains life equal to its power.", c: "W", art: "⚔️" },
    pacifism: { name: "Pacifism", cost: "{1}{W}", type: "Enchantment — Aura", text: "Enchant creature<br>Enchanted creature can't attack or block.", c: "W", art: "🕊️" },
    solring: { name: "Sol Ring", cost: "{1}", type: "Artifact", text: "{T}: Add {C}{C}.", c: "C", art: "💍" },
    signet: { name: "Arcane Signet", cost: "{2}", type: "Artifact", text: "{T}: Add one mana of any color in your commander's color identity.", c: "C", art: "🔆" },
    trostani: { name: "Trostani, Selesnya's Voice", cost: "{G}{G}{W}{W}", type: "Legendary Creature — Dryad", text: "Whenever another creature you control enters, you gain life equal to that creature's toughness.<br>{1}{G}{W}, {T}: Populate. <i>(Create a token that's a copy of a creature token you control.)</i>", c: "M", art: "🌸", pt: [2, 5] },
    pridemate: { name: "Ajani's Pridemate", cost: "{1}{W}", type: "Creature — Cat Soldier", text: "Whenever you gain life, put a +1/+1 counter on Ajani's Pridemate.", c: "W", art: "🐱", pt: [2, 2] },
    crusade: { name: "Cathars' Crusade", cost: "{3}{W}{W}", type: "Enchantment", text: "Whenever a creature you control enters, put a +1/+1 counter on each creature you control.", c: "W", art: "🚩" },
    crescendo: { name: "Grand Crescendo", cost: "{X}{W}{W}", type: "Instant", text: "Create X 1/1 green and white Citizen creature tokens. Creatures you control gain indestructible until end of turn.", c: "W", art: "🎶" },
    rootborn: { name: "Rootborn Defenses", cost: "{2}{W}", type: "Instant", text: "Populate. Creatures you control gain indestructible until end of turn. <i>(To populate, create a token that's a copy of a creature token you control.)</i>", c: "W", art: "🌱" },
    skullclamp: { name: "Skullclamp", cost: "{1}", type: "Artifact — Equipment", text: "Equipped creature gets +1/-1.<br>Whenever equipped creature dies, draw two cards.<br>Equip {1}", c: "C", art: "🗜️" },
    reckoning: { name: "Hour of Reckoning", cost: "{4}{W}{W}{W}", type: "Sorcery", text: "Convoke <i>(Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)</i><br>Destroy all nontoken creatures.", c: "W", art: "⏳" }
  };

  const anatomy = {
    name: ["The name", "Just what the card is called. Two cards with the same name are the same card. You'll mostly say the name out loud when you play it: “I cast Serra Angel.”"],
    cost: ["The mana cost", "What it costs to play the card. The cost is paid in <b>mana</b>, the game's energy (lesson 4 shows where it comes from). {3}{W}{W} means <b>3 mana of any color</b> plus <b>2 white</b>. Lesson 6 is all about paying, and it's just matching symbols."],
    art: ["The picture", "Pure decoration! It never changes how the card works. Enjoy it."],
    type: ["The type line", "What kind of card it is. “Creature — Angel” means it's a creature, and the angel part is just its family. The type tells you the card's basic rules."],
    text: ["The text box", "The card's special rules. Read it like an instruction. Here, “Flying, vigilance” are two superpowers you'll learn in lesson 13. Words in <i>italics</i> are either a little story (flavor) or a reminder in brackets: they add no new rules."],
    pt: ["Power / Toughness", "Only creatures have this. The <b>first number</b> is how hard it hits (power). The <b>second</b> is how much damage it can take before dying (toughness). A 4/4 hits for 4, and 4 damage in one turn is enough to kill it."]
  };

  const turn5 = [
    ["☀️", "Wake up", "<b>Untap</b>: everything you used last turn stands back up, ready again."],
    ["🃏", "Draw", "Take the top card of your deck into your hand. A new card every turn!"],
    ["🌳", "Play", "Your <b>first main phase</b>: play a land and cast cards using your mana."],
    ["⚔️", "Attack", "<b>Combat</b>: your creatures can attack your opponent. Optional!"],
    ["🌗", "Play again", "Your <b>second main phase</b>: after combat you can play cards again, and your land if you haven't yet."],
    ["🌙", "Done", "<b>End</b>: you say “done”, and the next player takes their turn."]
  ];

  const colorInfo = [
    { k: "W", name: "White", land: "Plains", likes: "Order, rules and teamwork. Lots of small soldiers, angels, protecting and healing.", ex: "Serra Angel" },
    { k: "U", name: "Blue", land: "Island", likes: "Knowledge and tricks. Draws extra cards, says “no” to your spells, flying birds and sea creatures.", ex: "Counterspell" },
    { k: "B", name: "Black", land: "Swamp", likes: "Power at any price. Destroys creatures, brings back the dead, trades life for advantages.", ex: "Murder" },
    { k: "R", name: "Red", land: "Mountain", likes: "Speed and feelings. Fire, goblins, dragons, fast attacks and direct damage.", ex: "Lightning Bolt" },
    { k: "G", name: "Green", land: "Forest", likes: "Nature and growth. Huge beasts, elves, and extra lands to get more mana.", ex: "Colossal Dreadmaw" }
  ];

  const zones = [
    { em: "📚", name: "Library", text: "Your deck, face down. You draw from the top. Nobody may look inside or change the order (unless a card says so)." },
    { em: "✋", name: "Hand", text: "The cards you're holding. Only you can see them. You play cards from here." },
    { em: "🪦", name: "Graveyard", text: "The discard pile, face up. Used spells and dead creatures go here. Anyone can look at anyone's graveyard." },
    { em: "⚔️", name: "Battlefield", cls: "bf", text: "The table in the middle. Lands, creatures and everything that stays in play lives here. When a card is “in play”, it's here." },
    { em: "🌀", name: "Exile", text: "Removed from the game, set aside. Usually a card that's exiled never comes back. It's harsher than the graveyard." },
    { em: "👑", name: "Command zone", text: "Only in Commander: a special spot for your commander, your favourite creature, which you can cast from here at any time you could cast it." }
  ];

  const units = [
    { id: "basics", title: "The very basics", blurb: "What the game is, what a card says, and what a turn looks like." },
    { id: "mana", title: "Mana: the energy", blurb: "Lands, colors and paying for cards. Just matching symbols, no sums." },
    { id: "types", title: "Kinds of cards", blurb: "Creatures, one-shot spells and the things that stay on the table." },
    { id: "combat", title: "Fighting", blurb: "Attacking, blocking and the creature superpowers." },
    { id: "deeper", title: "How it all fits", blurb: "Where cards go, how to answer a spell, and the full turn." },
    { id: "commander", title: "Commander, the way you'll play", blurb: "The four-player format the decks on this site are built for." }
  ];

  const L = [];

  /* ---------------- Part 1: the very basics ---------------- */
  L.push({
    id: "goal", unit: "basics", emoji: "🎯", title: "What is Magic?", blurb: "The goal, in one sentence.",
    steps: [
      { title: "Picture this", html: `<p class="big">A Friday evening. You and three friends around a table, snacks out. Everyone has their own deck of cards, and each deck is a little team of characters with its own style.</p><p>Yours could be Hatsune Miku and her crowd of singers, filling the stage and cheering each other on. That's the deck this site is built around.</p><p>That's Magic. Nobody needs to be a games person: it's mostly reading cards and making small choices.</p>`, cards: ["trostani"] },
      { title: "Welcome! Let's start very small.", html: `<p class="big">Magic is a card game for 2 or more people. Each player has their own deck of cards.</p><p>You don't need to know anything else yet. Every lesson adds <b>one</b> small idea, and you'll try each one yourself.</p>`, tip: "Take your time. You can go back to any screen with the ← button, and your progress is saved." },
      { title: "The goal", html: `<p class="big">Everyone starts with some <b>life</b>, like points in a video game.</p><p>In a normal game it's <b>20 life</b>. Your goal is to bring your opponent's life down to <b>0</b>. When it hits 0, they lose.</p><p>That's it. Everything else in Magic is about <i>how</i> you do that.</p>`, math: "You never have to calculate in your head here. The site counts for you. In real games, people use a phone app or a die to track life." },
      { title: "Try it", widget: ["life", { start: 20, hits: [["🐻 Attack with Bears", 2, "Your Bears hit them!"], ["⚡ Lightning Bolt", 3, "Zap!"], ["🐉 Attack with Dragon", 5, "The dragon breathes fire!"]] }], gate: "Bring their life to 0" },
      { title: "How do you hit them?", html: `<p>With your <b>cards</b>. Some cards are creatures that attack. Some are spells, like a lightning bolt. Some help you in other ways.</p><p>You get cards by <b>drawing</b> them from the top of your deck, one each turn.</p>`, cards: ["bears", "bolt"] },
      { title: "Three words you'll hear a lot", html: `<ul><li><b>Battlefield</b>: the table in the middle, where cards in play sit. (People also just say “the table”.)</li><li><b>Cast</b>: to play a card from your hand by paying for it. (Lands are the exception: you just “play” them.)</li><li><b>Spell</b>: any card you cast. A creature is a spell too while you're casting it.</li></ul>`, mem: "Battlefield = the table. Cast = play a card by paying for it." },
      { title: "Quick check", quiz: { q: "What is the goal of Magic?", options: [{ t: "Bring your opponent's life to 0", ok: true, why: "Exactly. That's the whole game." }, { t: "Have the most cards on the battlefield at the end", why: "Lots of cards help, but they don't win by themselves. Bringing their life to 0 does." }, { t: "Get through your whole deck first", why: "You'll never play your whole deck! The goal is bringing the opponent's life to 0." }] } },
      { title: "One more", quiz: { q: "How much life does each player start with in a normal game?", options: [{ t: "20", ok: true, why: "Yes, 20. (In Commander, the format you'll play later, it's 40, because games are bigger.)" }, { t: "7", why: "7 is the number of cards you draw at the start of a game. Life is 20." }, { t: "100", why: "100 is the size of a Commander deck! Life is 20." }] } }
    ],
    recap: ["Each player has a deck of cards.", "Everyone starts with <b>20 life</b> (40 in Commander).", "Bring your opponent to <b>0 life</b> and you win."]
  });

  L.push({
    id: "card", unit: "basics", emoji: "🃏", title: "Reading a card", blurb: "Six parts, all easy.",
    steps: [
      { title: "A card has six parts", html: `<p>Every Magic card is laid out the same way. Once you know where to look, you can read any card.</p><p>Here's a real card, <b>Serra Angel</b>. Let's explore it.</p>` },
      { title: "Explore the card", widget: ["anatomy", { card: "angel" }], gate: "Find all six parts" },
      { title: "The two numbers", html: `<p>The two numbers at the bottom are the most important thing on a creature.</p><ul><li><b>4</b> / 4: the first is <b>power</b>, how hard it hits. Think “⚔️ punches”.</li><li>4 / <b>4</b>: the second is <b>toughness</b>, how much damage it takes to die. Think “❤️ health”.</li></ul>`, cards: ["bears", "spider"], math: "You only ever compare: is the damage <b>as big as or bigger than</b> the health? If yes, it dies. You can count it on your fingers or with the boxes the site draws." },
      { title: "Quick check", quiz: { q: "Giant Spider is 2/4. What does the 4 mean?", cards: ["spider"], options: [{ t: "It dies once it has taken 4 damage: that's its health", ok: true, why: "Yes, 4 is its toughness: it survives 1, 2 or 3 damage, and dies at 4 or more." }, { t: "It hits for 4", why: "That's the first number, power. The spider hits for 2." }, { t: "It costs 4 mana", why: "The cost is the symbols in the top corner. The bottom numbers are power and toughness." }] } },
      { title: "One more", quiz: { q: "Two cards have the same rules but different pictures. Do they work differently?", options: [{ t: "No, the picture is just decoration", ok: true, why: "Right! Only the text, type, cost and numbers matter for the rules. That's why Miku cards work exactly like the normal versions." }, { t: "Yes, a scarier picture means a stronger card", why: "Nope, only the numbers and text matter. A tiny-looking card can be very strong." }, { t: "Only if the colors of the pictures differ", why: "The picture never matters for the rules, whatever its colors. The mana symbols do." }] } }
    ],
    recap: ["Top: <b>name</b> and <b>mana cost</b>.", "Middle: the <b>picture</b> (decoration) and the <b>type line</b>.", "Text box: the card's <b>rules</b>. Italic text is just story.", "Creatures have <b>power / toughness</b>: punches / health."]
  });

  L.push({
    id: "turn", unit: "basics", emoji: "🔁", title: "Your turn in six steps", blurb: "Wake up, draw, play, attack, play again, done.",
    steps: [
      { title: "Players take turns", html: `<p class="big">Like most games, you take turns. On your turn, you do your things; then the next player does theirs.</p><p>Every turn has the same rhythm, in the same order. Here it is, simplified into six steps.</p>` },
      { title: "The six steps", widget: ["wheel"], gate: "Tap all six steps" },
      { title: "A way to remember it", html: `<p>Think of a morning routine:</p><ol><li>☀️ <b>Wake up</b> (untap your cards)</li><li>🃏 <b>Get the mail</b> (draw a card)</li><li>🌳 <b>Do your chores</b> (play a land, cast cards)</li><li>⚔️ <b>Go out</b> (attack)</li><li>🏠 <b>Back home, a few more chores</b> (cast cards again, after combat)</li><li>🌙 <b>Go to bed</b> (end your turn)</li></ol>`, tip: "You'll learn the full, detailed version in lesson 16. For now, these six steps are enough to play." },
      { title: "Put them in order", widget: ["order", { items: ["☀️ Untap", "🃏 Draw a card", "🌳 Play a land and cast cards", "⚔️ Attack", "🌗 Cast more cards", "🌙 End the turn"], done: "That's a turn of Magic!" }], gate: "Put the steps in order" },
      { title: "Quick check", quiz: { q: "When do you draw a card?", options: [{ t: "Near the start of your turn, right after untapping", ok: true }, { t: "At the end of your turn", why: "You draw near the start, right after untapping. That way you can use the new card this turn." }, { t: "Whenever you want", why: "No, you draw once, at the start of your turn (unless a card lets you draw more)." }] } }
    ],
    recap: ["Players take turns, one after another.", "Your turn: <b>untap → draw → play → attack → play again → end</b>.", "There are two main phases, one before combat and one after.", "Attacking is optional."]
  });

  /* ---------------- Part 2: mana ---------------- */
  L.push({
    id: "lands", unit: "mana", emoji: "🌳", title: "Lands: one per turn", blurb: "Where mana comes from.",
    steps: [
      { title: "Cards cost energy", html: `<p class="big">To play a card, you pay its cost in <b>mana</b>. Mana is the game's energy.</p><p>Where does mana come from? Mostly from <b>lands</b>, a special kind of card.</p>`, cards: ["forest", "mountain"] },
      { title: "How a land works", html: `<p>A land sits on the table. You can turn it sideways (that's called <b>tapping</b>) to get one mana. Then it stays sideways until your next turn, when it stands back up.</p><p>Read the Forest: “{T}: Add {G}.” The {T} symbol means “tap this”, and {G} is one green mana.</p>`, cards: ["forest"] },
      { title: "The big rule", html: `<p class="big">You can play <b>one land per turn</b>. Only on your own turn.</p><p>Playing a land is free: it doesn't cost mana. You just put it on the table.</p>`, mem: "One land per turn. If you remember just one rule today, remember this one." },
      { title: "Try it", widget: ["lands"], gate: "Play four turns" },
      { title: "Why it matters", html: `<p>Because you add one land each turn, you have:</p><ul><li>Turn 1: 1 mana</li><li>Turn 2: 2 mana</li><li>Turn 3: 3 mana</li><li>…and so on.</li></ul><p>So cheap cards come out first, and big cards come later. The game naturally builds up.</p>`, math: "The turn number and the number of lands match (if you played one every turn). No counting needed: just look at your lands." },
      { title: "Quick check", quiz: { q: "It's your turn and you've already played a Forest. You have a Mountain in your hand. Can you play it?", options: [{ t: "No, one land per turn. Keep it for next turn", ok: true }, { t: "Yes, if you pay for it", why: "Lands don't cost mana, and the limit is one per turn, no matter what." }, { t: "Yes, lands are free", why: "They are free, but you can still only play one per turn." }] } }
    ],
    recap: ["Cards cost <b>mana</b>.", "<b>Lands</b> make mana: tap ({T}) one for one mana.", "<b>One land per turn</b>, on your turn, for free."]
  });

  L.push({
    id: "colors", unit: "mana", emoji: "🎨", title: "The five colors", blurb: "White, blue, black, red and green.",
    steps: [
      { title: "Mana has colors", html: `<p class="big">There are five colors of mana. Each one has a symbol:</p><p style="font-size:1.6rem;text-align:center">{W} {U} {B} {R} {G}</p><p>White ☀️, blue 💧, black 💀, red 🔥 and green 🌳.</p>`, tip: "Blue is “U”, not “B”, because B was taken by black. That's the only odd one." },
      { title: "Each color has a land", html: `<p>Each basic land makes one color:</p><ul><li>Plains → {W} white</li><li>Island → {U} blue</li><li>Swamp → {B} black</li><li>Mountain → {R} red</li><li>Forest → {G} green</li></ul>`, cards: ["plains", "island", "swamp", "mountain", "forest"] },
      { title: "Meet the colors", widget: ["colors"], gate: "Tap all five colors" },
      { title: "Match the land", widget: ["sort", { title: "Which color does it make?", buckets: ["{W} White", "{U} Blue", "{B} Black", "{R} Red", "{G} Green"], items: [{ t: "🏝️ Island", b: 1 }, { t: "⛰️ Mountain", b: 3 }, { t: "🌳 Forest", b: 4 }, { t: "☀️ Plains", b: 0 }, { t: "🪦 Swamp", b: 2 }] }], gate: "Sort the five lands" },
      { title: "Most decks use 1 to 3 colors", html: `<p>You don't play all five at once. A deck usually uses one, two or three colors that work well together.</p><p>For example, the Hatsune Miku deck on this site is <b>green and white</b> {G}{W}: lots of creatures (green) that grow your life (white).</p>` },
      { title: "Quick check", quiz: { q: "Which land makes red mana {R}?", options: [{ t: "Mountain", ok: true, why: "Yes: Mountain → red, fire and volcanoes." }, { t: "Swamp", why: "Swamp makes black {B}. Red comes from Mountains." }, { t: "Plains", why: "Plains make white {W}. Red comes from Mountains." }] } }
    ],
    recap: ["Five colors: {W} white, {U} blue, {B} black, {R} red, {G} green.", "Plains, Island, Swamp, Mountain, Forest make them.", "Each color has a personality. Decks usually use 1 to 3."]
  });

  L.push({
    id: "cost", unit: "mana", emoji: "🧩", title: "Paying for a card", blurb: "It's just matching symbols.",
    steps: [
      { title: "Reading a cost", html: `<p>Look at the top-right of Grizzly Bears: {1}{G}.</p><ul><li>{G} means: <b>one green</b> mana. It must be green.</li><li>{1} (a grey circle with a number) means: <b>one mana of any color</b>.</li></ul><p>So Grizzly Bears costs 2 mana in total, and at least 1 must be green.</p>`, cards: ["bears"] },
      { title: "Think of it like slots", html: `<p>Each symbol is a slot to fill.</p><ul><li>A <b>colored</b> slot ({G}, {R}…) only takes that color.</li><li>A <b>grey number</b> slot takes any color. {3} is three slots like that.</li></ul><p>Serra Angel {3}{W}{W} is 5 slots: 3 “anything” and 2 white.</p>`, cards: ["angel"], math: "No sums: just fill circles. When every circle is filled, you can cast. The site draws the circles for you." },
      { title: "Mana puzzles", html: `<p>Tap your lands to fill the circles. If you think it's impossible, say so!</p>`, tip: "The trick: fill the <b>colored</b> circles first, then the grey ones. Grey circles take any mana, so they're easy to fill at the end.", widget: ["pay", { puzzles: [
        { card: "bears", lands: ["forest", "mountain", "forest"], possible: true, ok: "A green land filled the {G} circle, and any other land filled the grey one." },
        { card: "bolt", lands: ["forest", "island"], possible: false, why: "Lightning Bolt needs {R}, and neither a Forest nor an Island makes red. You'd need a Mountain." },
        { card: "angel", lands: ["plains", "island", "plains", "forest", "mountain"], possible: true, hint: "Use the two Plains for the white circles, and anything for the three grey ones.", ok: "Two Plains for {W}{W}, and the other three lands for the grey {3}." },
        { card: "counter", lands: ["island", "forest", "forest"], possible: false, why: "Counterspell needs {U}{U}: two blue. You have only one Island. Three lands, but the wrong colors." },
        { card: "divination", lands: ["swamp", "island", "plains"], possible: true, hint: "The Island pays {U}, and the other two pay the grey {2}.", ok: "The Island paid {U}, the other two paid {2}." }
      ] }], gate: "Solve the five puzzles" },
      { title: "Colors matter", html: `<p class="big">Having enough lands isn't always enough: you also need the <b>right colors</b>.</p><p>That's why most decks use only two or three colors. Fewer colors means your lands match your cards more often.</p>` },
      { title: "Quick check", quiz: { q: "You have 2 Forests and 1 Plains. Can you cast a card that costs {1}{W}{W}?", options: [{ t: "No, it needs two white and you have only one Plains", ok: true }, { t: "Yes, 3 lands for a 3-mana card", why: "Three lands, yes, but {W}{W} means two white. Only Plains make white, and you have just one." }] } },
      { title: "One more", quiz: { q: "What does the grey {2} mean in a cost like {2}{U}?", options: [{ t: "Two mana of any color", ok: true }, { t: "Two blue mana", why: "Blue would be shown with blue symbols. A grey number means any kind of mana." }, { t: "Draw two cards", why: "That's what Divination does, but in the cost, {2} is two mana of any color." }] } }
    ],
    recap: ["Each symbol in a cost is a slot to fill.", "Colored slots need that color. Grey number slots take any color.", "Fill colored slots first. Right <b>colors</b> matter as much as the number of lands."]
  });

  L.push({
    id: "tap", unit: "mana", emoji: "↷", title: "Tapping and untapping", blurb: "Sideways means used.",
    steps: [
      { title: "Sideways = used", html: `<p class="big">When you use a card, you turn it sideways. That's called <b>tapping</b>.</p><p>A tapped card has been used this turn. It can't be tapped again until it <b>untaps</b> (stands back up) at the start of your next turn.</p>` },
      { title: "Try it", widget: ["tapper"], gate: "Tap your cards, then go to the next turn" },
      { title: "Mana doesn't keep", html: `<p>When you tap a land, the mana appears right away. If you don't spend it soon, it <b>disappears</b>.</p><p>So the habit is: decide what you want to cast, then tap exactly the lands you need.</p>`, warn: "Don't tap all your lands “just in case”. Unused mana vanishes, and untapped lands can also bluff your opponents." },
      { title: "Not just lands", html: `<p>Anything with {T} in its text can be tapped: some creatures like Llanowar Elves, and artifacts like Sol Ring.</p><p>Creatures also tap when they attack. That's why a creature that attacked usually can't block on your opponent's turn.</p>`, cards: ["elves", "solring"] },
      { title: "Quick check", quiz: { q: "When do your tapped cards stand back up?", options: [{ t: "At the start of your next turn", ok: true }, { t: "At the end of your turn", why: "They stay tapped through your opponent's turn and untap at the start of yours." }, { t: "At the start of the next player's turn", why: "Each player untaps only their own cards, at the start of their own turn." }] } }
    ],
    recap: ["Tapping = turning a card sideways to use it.", "Everything you control untaps at the start of your turn.", "Mana vanishes if you don't use it, so tap only what you need."]
  });

  /* ---------------- Part 3: kinds of cards ---------------- */
  L.push({
    id: "creatures", unit: "types", emoji: "🐻", title: "Creatures", blurb: "Your army.",
    steps: [
      { title: "Your army", html: `<p class="big">Creatures are the most common cards. They stay on the table and fight for you.</p><p>They attack your opponents and block their attacks. Most games are won by creatures.</p>`, cards: ["bears", "giant", "angel"] },
      { title: "Power and toughness again", html: `<p>Remember: <b>power</b> ⚔️ (first number) is how hard it hits, <b>toughness</b> ❤️ (second number) is how much damage kills it.</p><p>Hill Giant 3/3 hits for 3, and dies if it takes 3 damage or more in one turn.</p>`, cards: ["giant"] },
      { title: "Sleepy newcomers 💤", html: `<p>A creature <b>can't attack</b> on the turn it arrives. It needs to be on your side since the start of your turn.</p><p>This is called <b>summoning sickness</b>. Think: it's tired from the trip.</p><p>It can still <b>block</b> on your opponent's turn though!</p>`, tip: "Some creatures have <b>haste</b>, like Raging Goblin: they can attack right away. More on that in lesson 13." },
      { title: "Damage heals when the turn ends", html: `<p>If a creature takes damage but survives, the damage goes away at the <b>end of that turn</b> (every turn, whoever's turn it is).</p><p>So a 3/3 that took 2 damage is back to full health on the next turn.</p>` },
      { title: "Quick check", quiz: { q: "You cast Grizzly Bears this turn. What can they do before your next turn?", options: [{ t: "Block on an opponent's turn, but not attack yet", ok: true, why: "Right. Summoning sickness only stops attacking (and {T} abilities). Blocking is fine." }, { t: "Attack right away", why: "Not without haste. A creature needs to start your turn on your side before it can attack." }, { t: "Nothing at all until your next turn", why: "They can't attack yet, but they can already block when someone attacks you." }] } },
      { title: "One more", quiz: { q: "Hill Giant (3/3) takes 2 damage. What happens?", options: [{ t: "It survives, and the damage heals at the end of the turn", ok: true }, { t: "It dies", why: "It needs 3 damage to die (its toughness). 2 isn't enough." }, { t: "It becomes a 3/1 forever", why: "Damage isn't permanent: it goes away at the end of the turn." }] } }
    ],
    recap: ["Creatures stay on the table, attack and block.", "Power ⚔️ hits, toughness ❤️ is health.", "New creatures can't attack the turn they arrive (summoning sickness).", "Damage on creatures heals at the end of each turn."]
  });

  L.push({
    id: "spells", unit: "types", emoji: "⚡", title: "Instants and sorceries", blurb: "One-shot spells.",
    steps: [
      { title: "One-shot spells", html: `<p class="big">Some cards do one thing, then go to the discard pile (the <b>graveyard</b>).</p><p>There are two kinds: <b>sorceries</b> and <b>instants</b>. The only difference is <b>when</b> you can cast them.</p>`, cards: ["divination", "bolt"] },
      { title: "Sorcery: on your turn only", html: `<p>A <b>sorcery</b> is like a big planned action. You can only cast it during <b>your own turn</b>, in your main phase, when nothing else is happening.</p><p>Same timing as creatures, by the way.</p>`, cards: ["divination"] },
      { title: "Instant: any time!", html: `<p>An <b>instant</b> can be cast <b>at almost any moment</b>: on your turn, on your opponent's turn, even in the middle of a fight.</p><p>That makes them surprises. Your opponent attacks with a big creature? Zap it with Lightning Bolt.</p>`, cards: ["bolt", "growth"], mem: "Instant = “in an instant”, any time. Sorcery = only on my turn." },
      { title: "Sort them", widget: ["sort", { title: "When can you cast it?", buckets: ["Any time (instant)", "Only my turn"], items: [
        { t: "⚡ Lightning Bolt · Instant", b: 0, why: "It says Instant: any time." },
        { t: "🔮 Divination · Sorcery", b: 1, why: "Sorcery: only in your own main phase." },
        { t: "💪 Giant Growth · Instant", b: 0, why: "Instant. Great as a surprise during a fight." },
        { t: "🐻 Grizzly Bears · Creature", b: 1, why: "Creatures use sorcery timing: only on your turn." },
        { t: "🗡️ Murder · Instant", b: 0, why: "Instant, so you can kill an attacker mid-fight." }
      ] }], gate: "Sort the five cards" },
      { title: "Quick check", quiz: { q: "It's your opponent's turn and they attack you. Which card could you cast right now?", options: [{ t: "Lightning Bolt (instant)", ok: true, why: "Yes, instants work on anyone's turn." }, { t: "Divination (sorcery)", why: "Sorceries only work on your own turn." }, { t: "Grizzly Bears (creature)", why: "Creatures can only be cast on your own turn." }] } }
    ],
    recap: ["Instants and sorceries do something once, then go to the graveyard.", "<b>Sorcery</b>: only on your turn, when nothing else is happening.", "<b>Instant</b>: any time, even on the opponent's turn."]
  });

  L.push({
    id: "perms", unit: "types", emoji: "💍", title: "Things that stay", blurb: "Artifacts, enchantments and the rest.",
    steps: [
      { title: "Stays or goes?", html: `<p>Every card either <b>stays on the table</b> or is <b>used once</b>.</p><ul><li>Stays: lands, creatures, artifacts, enchantments, planeswalkers. These are called <b>permanents</b>.</li><li>Used once: instants and sorceries.</li></ul>` },
      { title: "Artifacts", html: `<p><b>Artifacts</b> are magic objects: rings, swords, machines. Most are colorless, so any deck can play them.</p><p>Sol Ring costs {1} and taps for {C}{C}: two colorless mana. It's one of the best cards in Commander.</p>`, cards: ["solring", "signet"], tip: "{C} is colorless mana: it pays grey number slots, but not colored ones." },
      { title: "Enchantments", html: `<p><b>Enchantments</b> are lasting magic effects. Some sit on their own, some (called <b>Auras</b>) attach to a creature.</p><p>Pacifism attaches to an enemy creature and stops it from attacking or blocking. It's still alive, just peaceful 🕊️.</p>`, cards: ["pacifism"] },
      { title: "Planeswalkers (just so you know)", html: `<p>Planeswalkers are powerful allies with their own little life total (loyalty) and a menu of abilities. You use one ability per turn.</p><p>You'll meet them later; you don't need them for your first games.</p>` },
      { title: "Sort them", widget: ["sort", { title: "Stays on the table, or used once?", buckets: ["Stays (permanent)", "Used once"], items: [
        { t: "🌳 Forest · Land", b: 0 }, { t: "⚡ Lightning Bolt · Instant", b: 1 }, { t: "💍 Sol Ring · Artifact", b: 0 },
        { t: "🕊️ Pacifism · Enchantment", b: 0 }, { t: "🔮 Divination · Sorcery", b: 1 }, { t: "👼 Serra Angel · Creature", b: 0 }
      ] }], gate: "Sort the six cards" },
      { title: "Quick check", quiz: { q: "What happens to Pacifism after you cast it on a creature?", options: [{ t: "It stays attached and keeps working", ok: true, why: "Yes, it's an enchantment, a permanent. It keeps working as long as it stays." }, { t: "It goes to the graveyard right away", why: "That's what instants and sorceries do. Enchantments stay." }, { t: "It stops the creature until the end of the turn only", why: "There's no “until end of turn” on it: Pacifism lasts as long as it stays on the battlefield." }] } }
    ],
    recap: ["<b>Permanents</b> stay: lands, creatures, artifacts, enchantments, planeswalkers.", "Instants and sorceries are used once.", "Artifacts are usually colorless. Auras are enchantments that attach to something."]
  });

  /* ---------------- Part 4: fighting ---------------- */
  L.push({
    id: "attack", unit: "combat", emoji: "⚔️", title: "Attacking", blurb: "Sending creatures at your opponent.",
    steps: [
      { title: "How to attack", html: `<p>On your turn, after your first main phase, you can attack. (Your second main phase comes after the fight.)</p><ol><li>Choose which creatures attack. You don't have to use all of them, or any.</li><li>Tap them (turn them sideways).</li><li>They each deal damage equal to their <b>power</b> to your opponent, unless they're blocked.</li></ol>` },
      { title: "Try it", html: `<p>Nobody is blocking yet. Attack a few times and watch the life go down.</p>`, widget: ["combat", { title: "Attack an open opponent", attackers: ["bears", "giant", "angel", "goblin"], blockers: [null], need: 2, prompt: "Pick an attacker and tap <b>Fight!</b>" }], gate: "Attack twice" },
      { title: "The catch", html: `<p>A creature that attacked is <b>tapped</b>. On your opponent's turn, tapped creatures can't block.</p><p>So attacking with everything leaves you open. Attacking is always a little choice: hit them now, or stay home to defend?</p>`, tip: "When unsure, attack with creatures that wouldn't die if blocked, and keep the rest home." },
      { title: "Quick check", quiz: { q: "You attack with Grizzly Bears (2/2) and nobody blocks. What happens?", options: [{ t: "Your opponent loses 2 life", ok: true, why: "Unblocked creatures deal their power to the player." }, { t: "Your opponent loses 4 life", why: "Only the first number (power) counts: 2." }, { t: "Nothing, attacks need a target creature", why: "You attack the player. If no one blocks, they take the damage." }] } }
    ],
    checkpoint: true,
    recap: ["Attack in the combat step, between your two main phases.", "Attacking taps your creatures, so they can't block next turn.", "Unblocked attackers deal their <b>power</b> as damage to the player."]
  });

  L.push({
    id: "block", unit: "combat", emoji: "🛡️", title: "Blocking", blurb: "Standing in the way.",
    steps: [
      { title: "Blocking", html: `<p>When someone attacks you, your <b>untapped</b> creatures can block.</p><ul><li>Each of your creatures can block <b>one</b> attacker.</li><li>A blocked attacker doesn't hit you. It fights the blocker instead.</li></ul>` },
      { title: "The fight", html: `<p>An attacker and its blocker hit each other <b>at the same time</b>:</p><ul><li>Each deals damage equal to its power ⚔️ to the other.</li><li>If a creature takes damage <b>equal to or more than</b> its toughness ❤️, it dies.</li></ul><p>Both can die, one can die, or neither.</p>`, math: "Just compare two numbers: the punches ⚔️ against the health ❤️. The lab below draws them as boxes so you can count them." },
      { title: "Combat lab", html: `<p>Try different fights. Predict the result first, then tap <b>Fight!</b></p>`, widget: ["combat", { attackers: ["bears", "giant", "angel"], blockers: [null, "bears", "giant", "spider"], b: "bears", need: 3 }], gate: "Try three fights" },
      { title: "Quick check", quiz: { q: "Hill Giant (3/3) attacks. You block with Grizzly Bears (2/2). What happens?", cards: ["giant", "bears"], options: [{ t: "The Bears die, the Giant survives", ok: true, why: "The Giant deals 3 to the Bears (2 health): dead. The Bears deal 2 to the Giant (3 health): it survives." }, { t: "Both die", why: "The Bears only deal 2, and the Giant has 3 health. It survives." }, { t: "The Giant dies", why: "The Bears hit for 2, the Giant has 3 health. Not enough." }] } },
      { title: "Chump blocks", html: `<p>Sometimes you block with a small creature that will surely die, just to stop a big hit. That's a <b>chump block</b>.</p><p>It's a fair trade when the attacker would hurt you a lot. Your life is a resource, but so are your creatures.</p>` },
      { title: "One more", quiz: { q: "Serra Angel (4/4) attacks. You block with Giant Spider (2/4). Who dies?", cards: ["angel", "spider"], options: [{ t: "The Spider dies, the Angel survives", ok: true, why: "The Angel deals 4 to the Spider (4 health): dead. The Spider deals 2 to the Angel (4 health): fine." }, { t: "Nobody", why: "The Angel deals 4, and the Spider's health is 4. Equal counts: the Spider dies." }, { t: "Both", why: "The Spider only deals 2 to an Angel with 4 health." }] } }
    ],
    recap: ["Untapped creatures can block. Each blocker stops one attacker.", "Attacker and blocker hit each other at the same time.", "Damage ≥ toughness → it dies. Blocked attackers don't hurt the player."]
  });

  L.push({
    id: "keywords", unit: "combat", emoji: "🦸", title: "Keywords: creature superpowers", blurb: "Flying, trample, deathtouch and friends.",
    steps: [
      { title: "One word, one rule", html: `<p>Some creatures have a single word in their text box, like <b>Flying</b>. These <b>keywords</b> are shortcuts for a rule that shows up on many cards.</p><p>Learn them once, and you can read thousands of cards. Here are the seven you'll see most. (A few rarer ones, like first strike or menace, are in the <a href="#/glossary">word list</a> for later.)</p>` },
      { title: "The first four (the Miku deck uses these)", widget: ["flip", { cards: [
        ["🪽", "Flying", "Can only be blocked by creatures with <b>flying</b> or <b>reach</b>. (A flyer can still block ground creatures.)"],
        ["🕸️", "Reach", "Can block creatures with flying. Usually spiders and archers."],
        ["💗", "Lifelink", "Damage it deals also gains you that much life."],
        ["👁️", "Vigilance", "Attacking doesn't tap it, so it can still block next turn."]
      ] }], gate: "Flip all four cards" },
      { title: "Three more", widget: ["flip", { cards: [
        ["☠️", "Deathtouch", "Any damage it deals to a creature, even 1, kills that creature."],
        ["🦶", "Trample", "When it's blocked, the damage that's more than the blocker needs to die goes through to the player."],
        ["⚡", "Haste", "Can attack (and use {T}) the turn it arrives. No summoning sickness."]
      ] }], gate: "Flip all three cards" },
      { title: "Keyword lab", html: `<p>Try these. Some good ones: Dreadmaw blocked by Bears (trample), Rats blocked by Giant (deathtouch), Angel against Giant (flying).</p>`, widget: ["combat", { attackers: ["angel", "dreadmaw", "rats", "nighthawk", "bears"], blockers: [null, "giant", "spider", "bears", "angel"], a: "dreadmaw", b: "bears", need: 3 }], gate: "Try three fights" },
      { title: "Quick check", quiz: { q: "Typhoid Rats (1/1, deathtouch) blocks Colossal Dreadmaw (6/6). What happens to the Dreadmaw?", cards: ["rats", "dreadmaw"], options: [{ t: "It dies: any damage from deathtouch is deadly", ok: true }, { t: "It survives: 1 damage isn't enough for 6 health", why: "Normally yes, but deathtouch makes any damage lethal." }] } },
      { title: "One more", quiz: { q: "Serra Angel (flying) attacks. Which of your creatures can block it?", options: [{ t: "Giant Spider (reach)", ok: true, why: "Reach lets it block flyers." }, { t: "Hill Giant", why: "No flying or reach, so it can't block a flyer." }, { t: "Grizzly Bears", why: "No flying or reach, so it can't block a flyer." }] } },
      { title: "One last one", quiz: { q: "Colossal Dreadmaw (trample) is blocked by little Grizzly Bears. What happens to its damage?", cards: ["dreadmaw", "bears"], options: [{ t: "Enough goes to the Bears to kill them, and the rest hits the player", ok: true, why: "That's trample: the blocker only soaks up what it needs to die." }, { t: "It all goes to the Bears", why: "That's what happens without trample. With trample, the extra goes through." }, { t: "It all hits the player, the Bears are ignored", why: "The blocker still gets its share first: just enough to kill it." }] } }
    ],
    recap: ["Keywords are one-word rules printed on many cards.", "Flying/reach decide who can block flyers.", "Deathtouch: any damage kills. Trample: extra damage goes through. Lifelink: gain that much life.", "Haste: attack right away. Vigilance: attack without tapping."]
  });

  /* ---------------- Part 5: how it all fits ---------------- */
  L.push({
    id: "zones", unit: "deeper", emoji: "🗺️", title: "Where cards live", blurb: "Library, hand, battlefield, graveyard, exile.",
    steps: [
      { title: "Every card is somewhere", html: `<p>Magic has a few named places, called <b>zones</b>. Cards move between them. Card texts often name them (“return a creature from your graveyard to your hand”).</p>` },
      { title: "The table", widget: ["zones"], gate: "Visit every zone" },
      { title: "Graveyard vs exile", html: `<p>Both are “gone”, but they're different:</p><ul><li><b>Graveyard</b> 🪦: dead or used. Some cards can bring things back from here.</li><li><b>Exile</b> 🌀: removed from the game. Almost nothing brings it back.</li></ul><p>That's why <b>exile</b> is the stronger way to get rid of something.</p>`, cards: ["murder", "swords"], after: `<p class="small muted">Murder sends a creature to the graveyard. Swords to Plowshares exiles it.</p>` },
      { title: "Where does it go?", widget: ["sort", { title: "Where does the card end up?", buckets: ["📚 Library", "✋ Hand", "⚔️ Battlefield", "🪦 Graveyard", "🌀 Exile"], items: [
        { t: "You cast Lightning Bolt. After it deals its damage…", b: 3, why: "Used instants and sorceries go to the graveyard." },
        { t: "You draw a card. It goes to your…", b: 1 },
        { t: "You cast Grizzly Bears. They go to the…", b: 2, why: "Permanents go on the battlefield." },
        { t: "Your Bears are hit by Swords to Plowshares", b: 4, why: "Swords says “exile”." },
        { t: "Your Bears die in a fight", b: 3, why: "“Dies” means “goes to the graveyard from the battlefield”." }
      ] }], gate: "Sort the five events" },
      { title: "Quick check", quiz: { q: "Your opponent's scariest creature keeps coming back from the graveyard. Which removal is best against it?", options: [{ t: "Swords to Plowshares (exile)", ok: true, why: "Exile removes it from the game, out of reach of graveyard tricks." }, { t: "Murder (destroy)", why: "Destroy sends it to the graveyard, exactly where it comes back from." }, { t: "Blocking it until it dies", why: "Dying also sends it to the graveyard. Exile is the answer." }] } }
    ],
    recap: ["Library (deck), hand, battlefield (table), graveyard (discard), exile (removed). Commander adds the command zone.", "“Dies” = from the battlefield to the graveyard.", "Exile is harsher than the graveyard."]
  });

  L.push({
    id: "stack", unit: "deeper", emoji: "🍽️", title: "Responding: the stack", blurb: "Last in, first out.",
    steps: [
      { title: "Spells don't happen right away", html: `<p>When someone casts a spell, it doesn't happen immediately. First it waits in a pile called <b>the stack</b>.</p><p>While it waits, every player gets a chance to <b>respond</b> with an instant.</p>` },
      { title: "A stack of plates", html: `<p>Picture a stack of plates 🍽️. Each new spell is a plate put on <b>top</b>.</p><p>When nobody wants to add a plate, the <b>top</b> one comes off and happens. Then everyone gets another chance to add a plate before the next one comes off. So the <b>last spell cast happens first</b>.</p>`, mem: "Last in, first out. The newest plate comes off first." },
      { title: "Try it", widget: ["stack"], gate: "Save your Bears, then try Murder" },
      { title: "Why it matters", html: `<p>Responding lets you save your creatures, counter spells (Counterspell!), or use mana right before it's too late.</p><p>In a real game you just say <b>“In response…”</b>. And when you're done, say <b>“OK”</b> or <b>“pass”</b> so others know they can go on.</p>`, cards: ["counter"], tip: "Not sure if someone wants to respond? Ask “Any responses?” before moving on. Everyone does it." },
      { title: "Quick check", quiz: { q: "Your opponent casts Lightning Bolt. You respond with Giant Growth. Which happens first?", options: [{ t: "Giant Growth, it's on top", ok: true, why: "Last in, first out. Your Growth resolves, then the Bolt." }, { t: "Lightning Bolt, it was cast first", why: "It was cast first, so it's at the bottom of the stack. The top (Growth) happens first." }, { t: "Both at the same time", why: "Spells on the stack happen one at a time, top plate first." }] } },
      { title: "One more", quiz: { q: "Murder targets your Grizzly Bears. Does Giant Growth save them?", options: [{ t: "No, Murder destroys, it doesn't deal damage", ok: true, why: "“Destroy” ignores toughness. Bigger doesn't help." }, { t: "Yes, a 5/5 survives", why: "Size helps against damage, but Murder says “destroy”: no damage involved." }, { t: "Only if you cast Growth before Murder was cast", why: "Timing doesn't matter here: “destroy” ignores size whenever it happens." }] } }
    ],
    recap: ["Spells wait on <b>the stack</b>; players can respond with instants.", "The last spell added happens first.", "“Destroy” ignores size; damage doesn't."]
  });

  L.push({
    id: "phases", unit: "deeper", emoji: "🕰️", title: "The full turn, in detail", blurb: "The real names of each step.",
    steps: [
      { title: "Zooming in", html: `<p>Remember the six steps: wake up, draw, play, attack, play again, done. The real turn has the same shape, with a few more named moments.</p>` },
      { title: "The start of the turn", html: `<ol><li><b>Untap</b>: untap all your stuff.</li><li><b>Upkeep</b>: some cards say “at the beginning of your upkeep”. Otherwise nothing happens.</li><li><b>Draw</b>: draw a card.</li></ol>`, tip: "“Upkeep” is just a name for a moment. Most turns, nothing happens there." },
      { title: "The rest of the turn", html: `<ol start="4"><li><b>Main phase 1</b>: play a land, cast creatures and sorceries.</li><li><b>Combat</b>: choose attackers, then the defender chooses blockers, then damage.</li><li><b>Main phase 2</b>: another main phase! You can cast things after combat too.</li><li><b>End</b>: “at the beginning of the end step” cards trigger, then damage heals and the turn passes.</li></ol>` },
      { title: "Second main phase trick", html: `<p>Since there are two main phases, it's often smart to <b>attack first</b> and cast creatures <b>after</b> combat.</p><p>That way your opponent doesn't know what you're holding when they decide how to block.</p>`, tip: "The one exception: creatures that help your attack (like ones that pump your team) go in main phase 1." },
      { title: "Put them in order", widget: ["order", { items: ["Untap", "Upkeep", "Draw", "Main phase 1", "Combat", "Main phase 2", "End"], done: "That's the full turn. You know what pros know." }], gate: "Order the seven steps" },
      { title: "Quick check", quiz: { q: "You hold a creature and want to attack with the ones already on the battlefield. When is the smart time to cast the new one?", options: [{ t: "Main phase 2, after combat", ok: true, why: "Your opponent decides blocks without knowing what you're holding. The new creature couldn't attack this turn anyway." }, { t: "Main phase 1, before combat", why: "That works, but it shows your hand before the fight, and the new creature can't attack this turn anyway." }, { t: "During combat", why: "Creatures can only be cast in a main phase, unless they have flash." }] } },
      { title: "One more", quiz: { q: "You attacked and forgot to play your land this turn. Can you still play it?", options: [{ t: "Yes, in main phase 2", ok: true, why: "Main phase 2 works like main phase 1: one land per turn, in either." }, { t: "No, lands only go in main phase 1", why: "Either main phase works, as long as it's your first land this turn." }, { t: "Only during the end step", why: "Lands are only played in a main phase." }] } }
    ],
    recap: ["Untap → upkeep → draw → main 1 → combat → main 2 → end.", "“Upkeep” and “end step” mostly matter when a card mentions them.", "You can often attack first and cast creatures after combat."]
  });

  L.push({
    id: "words", unit: "deeper", emoji: "🔤", title: "Tricky words", blurb: "Target, tokens, counters and other card-speak.",
    steps: [
      { title: "Cards use precise words", html: `<p>Card text is written very carefully. A few words come back all the time. Knowing them makes any card readable.</p>` },
      { title: "The card dictionary, part 1", widget: ["flip", { cards: [
        ["🎯", "Target", "You choose one specific thing when you cast it. If that thing is gone when the spell resolves, the spell does nothing."],
        ["💀", "Dies", "Goes from the battlefield to the graveyard."],
        ["🗡️", "Destroy", "Put it in the graveyard. Ignores toughness. (Indestructible stops it.)"],
        ["🌀", "Exile", "Remove it from the game. Stronger than destroy."]
      ] }], gate: "Flip all four cards" },
      { title: "The card dictionary, part 2", widget: ["flip", { cards: [
        ["🪙", "Token", "A creature (or other thing) made by a card, not a real card. Use a coin, a die or a printed token. If it leaves the battlefield, it stops existing and can never come back."],
        ["➕", "+1/+1 counter", "A little marker that adds 1 to both power and toughness, for as long as the creature stays on the battlefield. Three counters on a 2/2 make it a 5/5."],
        ["⏳", "Until end of turn", "The effect lasts only this turn, then wears off."],
        ["👆", "Enters", "Comes onto the battlefield. “When this enters…” triggers once, when it arrives."],
        ["🔁", "Whenever", "Triggers every single time the thing happens."]
      ] }], gate: "Flip all the cards" },
      { title: "Destroy or damage?", widget: ["sort", { title: "Damage or destroy?", buckets: ["Damage (size matters)", "Destroy / exile (size doesn't matter)"], items: [
        { t: "⚡ Lightning Bolt", b: 0, why: "3 damage: big creatures survive it." },
        { t: "🗡️ Murder", b: 1, why: "“Destroy target creature”: any size." },
        { t: "⚔️ Swords to Plowshares", b: 1, why: "Exile: any size, and even indestructible ones." },
        { t: "🐻 A creature blocking", b: 0, why: "Combat is damage." }
      ] }], gate: "Sort the four cards" },
      { title: "Quick check", quiz: { q: "One of your token creatures dies. What happens to it?", options: [{ t: "It's gone for good", ok: true, why: "A token that leaves the battlefield stops existing. It can never come back." }, { t: "It goes to your graveyard and can be brought back later", why: "It touches the graveyard for a moment, then stops existing. Nothing can bring it back." }, { t: "It goes back to your hand", why: "Tokens never go to your hand: they stop existing once they leave the battlefield." }] } },
      { title: "One more", quiz: { q: "Your Ajani's Pridemate gets a +1/+1 counter. How long does it stay bigger?", cards: ["pridemate"], options: [{ t: "As long as it stays on the battlefield", ok: true, why: "Counters stay. Each one makes it a bit bigger, both numbers at once." }, { t: "Until the end of the turn", why: "That's how Giant Growth works. Counters are markers that stay." }, { t: "Until it attacks", why: "Attacking doesn't remove counters. They stay while the creature does." }] }, math: "Tip: count the markers. Each one is one more punch and one more health. The game on this site does the counting for you." }
    ],
    recap: ["<b>Target</b>: you pick it when casting.", "<b>Destroy</b> and <b>exile</b> ignore size; <b>damage</b> doesn't.", "<b>Tokens</b> vanish when they leave the battlefield; <b>counters</b> stay."]
  });

  /* ---------------- Part 6: Commander ---------------- */
  L.push({
    id: "commander", unit: "commander", emoji: "👑", title: "What makes Commander special", blurb: "100 cards, 40 life, one legendary leader.",
    steps: [
      { title: "The friendliest way to play", html: `<p class="big"><b>Commander</b> is the most popular way to play Magic with friends. Usually <b>4 players</b>, everyone against everyone.</p><p>All the decks on this site are Commander decks.</p>` },
      { title: "The rules that change", html: `<ul><li>🃏 Your deck has exactly <b>100 cards</b>.</li><li>1️⃣ Only <b>one copy</b> of each card (except basic lands like Forest).</li><li>❤️ Everyone starts at <b>40 life</b>.</li><li>👑 You pick one <b>legendary creature</b> as your <b>commander</b>, your deck's leader.</li></ul>` },
      { title: "Your commander", html: `<p>Your commander starts in the <b>command zone</b>, face up, next to you. It's like a card always in your hand: you can cast it whenever you could cast that creature.</p><p>In the Hatsune Miku deck, the commander is <b>Trostani, Selesnya's Voice</b>.</p>`, cards: ["trostani"] },
      { title: "It always comes back", html: `<p>If your commander dies or is exiled, it goes to the graveyard or exile as usual, and then you may move it back to the command zone. Almost everyone does.</p><p>But each time you cast it from there, it costs <b>{2} more</b>. That extra is the <b>commander tax</b>.</p>`, widget: ["tax"], gate: "Cast Trostani, then send her back twice" },
      { title: "Colors: the identity rule", html: `<p>Look at every mana symbol on your commander, in its cost and in its text. Those colors are its <b>color identity</b>, and every card in your deck must fit inside them, symbols in its text included.</p><p>Trostani shows only {G} and {W}, so her deck only plays green, white and colorless cards. That's also why <b>Arcane Signet</b> and <b>Command Tower</b> make “any color in your commander's color identity”.</p>`, cards: ["signet"] },
      { title: "Commander damage", html: `<p>One extra way to lose: if a <b>single commander</b> deals you <b>21 combat damage</b> over the game, you lose, even with life left.</p><p>And one rare one: if you have to draw a card and your library is empty, you lose.</p><p>Big commanders can be scary for that reason.</p>`, math: "Players track it on paper or in a life app, one tally per commander. The game on this site tracks it for you." },
      { title: "Quick check", quiz: { q: "How many copies of Lightning Bolt can a Commander deck have?", options: [{ t: "One", ok: true, why: "Commander decks are singleton: one of each card, except basic lands." }, { t: "Four", why: "Four is the limit in other formats. Commander allows one." }, { t: "As many as you want", why: "That's only true for basic lands like Forest or Mountain." }] } },
      { title: "One more", quiz: { q: "Trostani died and you moved her back to the command zone. What changes when you cast her again?", options: [{ t: "She costs {2} more than last time", ok: true, why: "That's the commander tax: {2} extra for each earlier cast from the command zone." }, { t: "Nothing, same cost as before", why: "Each cast from the command zone adds {2} to her cost." }, { t: "She's free, she came back", why: "She comes back, but each recast costs {2} more." }] } }
    ],
    recap: ["4 players, 100 cards, one of each, 40 life.", "Your commander waits in the command zone; you can cast it any time you could cast that creature.", "It can always return there, but costs {2} more each time (commander tax).", "Only your commander's colors. 21 combat damage from one commander knocks you out."]
  });

  L.push({
    id: "tricks", unit: "commander", emoji: "🎤", title: "Your deck's tricks", blurb: "Triggers, tokens, populate and the Miku engine.",
    steps: [
      { title: "Why is Miku called Trostani?", html: `<p class="big">The Miku deck is a <b>Secret Lair</b>: real Magic cards with new Miku pictures and names.</p><p>Your commander's Miku version is called <b>“Miku, Song of the People”</b>, but underneath it's the normal card <b>Trostani, Selesnya's Voice</b>. Same rules, new art. This course uses the normal names, because that's what other players and rules websites use.</p>`, cards: ["trostani"] },
      { title: "Two kinds of abilities", html: `<p>Card text comes in two kinds. Spotting which is which is most of reading a card.</p><ul><li>🔔 <b>Triggers</b> start with <b>“Whenever…”</b>, <b>“When…”</b> or <b>“At…”</b>. They happen <b>by themselves</b>: you don't pay anything.</li><li>🔑 <b>Activated abilities</b> look like <b>cost : effect</b>. You choose when to use them and pay what's before the colon.</li></ul>`, cards: ["trostani"], tip: "Trostani has one of each: the first line is a trigger, the second (“{1}{G}{W}, {T}: Populate”) is an activated ability." },
      { title: "Tokens: creatures without a card", html: `<p>Lots of Miku cards say “create a 1/1 Citizen creature <b>token</b>”. A token is a creature that isn't a real card: use a coin, a die or a small paper to show it.</p><p>Tokens fight, block and count as creatures, just like cards. When one leaves the battlefield, it's gone for good.</p>`, cards: ["crescendo"] },
      { title: "Populate: copy a token", html: `<p><b>Populate</b> means: pick one of your creature tokens and make another one just like it.</p><p>Got a 1/1 Citizen? Populate makes another 1/1 Citizen. Got a big 4/4 Angel token? Populate makes another 4/4 Angel. Pick the best one!</p>`, cards: ["rootborn"], warn: "Populate only copies <b>tokens</b>, never a real card. No token on your side means populate does nothing." },
      { title: "Try the engine", html: `<p>Here's what makes the deck tick. Trostani gains you life when a creature enters. Ajani's Pridemate grows when you gain life. Make a few creatures enter, and use populate at least once.</p>`, widget: ["engine"], gate: "Make creatures enter, including one populate" },
      { title: "One trigger leads to another", html: `<p>Did you see it? <b>One</b> creature entering caused <b>two</b> things: Trostani gave you life, and that life made the Pridemate grow.</p><p>Nobody had to remember a sum. You just follow the cards: “something happened, who says <b>whenever</b> about that?”</p>`, math: "Tip: when a creature enters, look around your side for every card that says “Whenever”. Each one that matches does its thing." },
      { title: "Quick check", quiz: { q: "Which line of Trostani happens by itself, without paying?", cards: ["trostani"], options: [{ t: "“Whenever another creature you control enters…”", ok: true, why: "“Whenever” means a trigger: it just happens." }, { t: "“{1}{G}{W}, {T}: Populate”", why: "That one has a cost before the colon: you choose to pay it." }, { t: "Both of them", why: "Only the “Whenever” line is free. The colon one needs mana and tapping." }] } },
      { title: "Convoke: creatures help pay", html: `<p>Some big Miku spells have <b>convoke</b>. While casting one, you can <b>tap your creatures</b> to help pay: each tapped creature pays for one grey circle, or one circle of its color.</p><p>With a crowd of Citizens, an expensive spell can cost almost nothing in lands.</p>`, cards: ["reckoning"], tip: "Hour of Reckoning destroys all creatures that aren't tokens. Your token crowd survives it, and it can pay for it too." },
      { title: "Equip: gear for creatures", html: `<p>An <b>Equipment</b> is an artifact you attach to one of your creatures. Pay its <b>Equip</b> cost to attach it (only in your main phase).</p><p>If the creature leaves, the Equipment stays on the battlefield, waiting to be moved to another creature.</p>`, cards: ["skullclamp"], tip: "Skullclamp on a 1/1 token makes it a 2/0: it dies at once, and you draw two cards. A classic Miku-deck trick." },
      { title: "Quick check", quiz: { q: "You have one 1/1 Citizen token and you populate. What do you get?", options: [{ t: "A second 1/1 Citizen token", ok: true, why: "Populate copies a token you already have." }, { t: "A copy of Trostani", why: "Populate only copies tokens, never real cards like Trostani." }, { t: "A +1/+1 counter on the Citizen", why: "That's a different effect. Populate makes a new token." }] } },
      { title: "One more", quiz: { q: "Your Ajani's Pridemate dies. What happens to Skullclamp, which was attached to it?", cards: ["skullclamp"], options: [{ t: "It stays, and you draw two cards", ok: true, why: "Equipment stays behind. And Skullclamp's trigger draws you two." }, { t: "It goes to the graveyard with the Pridemate", why: "Equipment stays on the battlefield when its creature leaves." }, { t: "It goes back to your hand", why: "It stays on the battlefield, ready to be equipped again." }] } }
    ],
    recap: ["Miku cards are normal Magic cards with new art: Trostani is “Miku, Song of the People”.", "“Whenever” = a trigger, it happens by itself. “cost: effect” = you choose to pay.", "Tokens are creatures without a card; populate copies one of your tokens.", "Convoke lets creatures help pay; Equip attaches gear to a creature."]
  });

  L.push({
    id: "firstturn", unit: "commander", emoji: "🎬", title: "Starting a game and your first turn", blurb: "Shuffle, seven cards, and go.",
    steps: [
      { title: "Setting up", html: `<ol><li>Shuffle your deck well. It becomes your <b>library</b>, face down.</li><li>Put your commander in the command zone.</li><li>Set your life to 40.</li><li>Draw <b>7 cards</b>. That's your opening hand.</li><li>Pick who goes first (a die roll is the usual way).</li></ol>` },
      { title: "Not happy with your hand?", html: `<p>If your 7 cards look bad (like 0 or 1 land, or 6 lands and nothing else), you can <b>mulligan</b>: shuffle them back and draw a new 7.</p><p>Then put one card from that hand on the bottom of your library for each mulligan you took.</p>`, tip: "With 3 or more players, your <b>first mulligan is free</b>: that time, you don't put any card on the bottom. It's the official rule.", math: "A good opening hand usually has <b>2 to 4 lands</b>. Just count the lands: 2, 3 or 4? Keep it." },
      { title: "Keep or mulligan?", widget: ["sort", { title: "Keep or mulligan?", buckets: ["👍 Keep", "🔄 Mulligan"], items: [
        { t: "3 lands + 4 spells", b: 0, why: "Classic keep: you can play cards right away." },
        { t: "0 lands + 7 spells", b: 1, why: "You can't cast anything without lands." },
        { t: "7 lands", b: 1, why: "Nothing to cast! You'd just play lands for a week." },
        { t: "2 lands + Sol Ring + 4 spells", b: 0, why: "Two lands and Sol Ring is a great start." },
        { t: "1 land + 6 expensive spells", b: 1, why: "One land is too risky, and everything costs a lot." }
      ] }], gate: "Decide on five hands" },
      { title: "Now play a whole turn", html: `<p>Here's a turn, guided step by step. The glowing thing is what to tap next.</p>`, widget: ["guided"], gate: "Play the whole turn" },
      { title: "Quick check", quiz: { q: "How many cards do you draw for your opening hand?", options: [{ t: "7", ok: true }, { t: "5", why: "Opening hands are 7 cards." }, { t: "6", why: "Opening hands are 7 cards. You only end up with fewer after a mulligan." }] } },
      { title: "One more", quiz: { q: "Your opening hand has 3 lands, a creature and 3 spells. What do you do?", options: [{ t: "Keep it", ok: true, why: "3 lands and things to cast: a fine hand." }, { t: "Mulligan, you want more lands", why: "No need: 2 to 4 lands with spells to cast is a hand to keep." }, { t: "Mulligan, you want more creatures", why: "Hands are judged mostly by their lands. 3 lands with things to cast is a keep." }] } }
    ],
    recap: ["Shuffle, 40 life, commander in the command zone, draw 7.", "Mulligan a hand with too few or too many lands (2 to 4 is the sweet spot).", "Every turn: untap, draw, land, cast, attack, cast more, end."]
  });

  L.push({
    id: "others", unit: "commander", emoji: "🔄", title: "While others play", blurb: "Most of the game is someone else's turn.",
    steps: [
      { title: "Whose turn is it?", html: `<p class="big">Turns go <b>clockwise</b>: to the player on your left, then around the table.</p><p>With four players, three out of every four turns belong to someone else. That's fine: you still have things to do.</p>` },
      { title: "What you can do on their turn", html: `<ul><li>🛡️ <b>Block</b>, if they attack you, with your untapped creatures.</li><li>⚡ Cast <b>instants</b> and use abilities like Trostani's populate.</li><li>👀 Read their cards. Ask what something does!</li></ul><p>What you can't do: play lands, cast creatures or sorceries, or attack.</p>` },
      { title: "Saying “OK”", html: `<p>When someone casts a spell, they pause so others can respond. If you don't want to, just say <b>“OK”</b> or <b>“go ahead”</b>. Players often say <b>“pass”</b> or <b>“go”</b> at the end of their turn.</p>`, tip: "If you want to respond but need time to think, say “wait, let me look”. Nobody minds." },
      { title: "Your turn to defend", html: `<p>Sam attacks you. Decide how to block, then whether to use your trick. There's a best answer, but nothing bad happens if you miss it: try again.</p>`, widget: ["defend"], gate: "Find the best defense" },
      { title: "Quick check", quiz: { q: "It's Alex's turn. Which of these can you do?", options: [{ t: "Cast Giant Growth on a blocker", ok: true, why: "Instants can be cast on anyone's turn." }, { t: "Play a land", why: "Lands only go down in your own main phase." }, { t: "Cast Grizzly Bears", why: "Creatures without flash wait for your own main phase." }] } },
      { title: "One more", quiz: { q: "Your Giant Spider blocked last turn. Can it attack on your turn?", options: [{ t: "Yes, blocking doesn't tap it", ok: true, why: "Blocking is free: no tapping. It's ready for your turn." }, { t: "No, it's tired from blocking", why: "Blocking doesn't tap creatures, so it's ready to go." }, { t: "Only if it survived without damage", why: "Damage heals at the end of each turn anyway. It can attack." }] } }
    ],
    recap: ["Turns go clockwise, to your left.", "On others' turns you can block, cast instants and use abilities.", "Say “OK” to let a spell happen, and “wait” if you need a moment."]
  });

  L.push({
    id: "readboard", unit: "commander", emoji: "🔍", title: "Reading the board", blurb: "Three little puzzles, no counting.",
    steps: [
      { title: "Look before you leap", html: `<p class="big">Before attacking or blocking, good players look at the board and ask three questions.</p><ol><li>Who can block this?</li><li>Who flies, who has reach?</li><li>What would die?</li></ol><p>Let's try three puzzles.</p>` },
      { title: "Puzzle 1", quiz: { q: "You attack with Serra Angel. Your opponent only has Hill Giant. What happens?", cards: ["angel", "giant"], options: [{ t: "The Giant can't block her: she flies", ok: true, why: "Hill Giant has no flying or reach. The Angel's damage goes straight to the player." }, { t: "The Giant blocks and they fight", why: "Look for flying: the Giant can't block a flyer." }, { t: "The Angel can't attack because of vigilance", why: "Vigilance only means she doesn't tap when attacking." }] } },
      { title: "Puzzle 2", quiz: { q: "Your opponent attacks with Shivan Dragon. Which of your creatures can block it?", cards: ["dragon", "spider", "bears"], options: [{ t: "Giant Spider, it has reach", ok: true, why: "Reach can block flyers. The Bears can't." }, { t: "Grizzly Bears", why: "The Dragon flies. Bears have no flying or reach." }, { t: "Nobody can block a dragon", why: "Creatures with flying or reach can. The Spider has reach." }] } },
      { title: "Puzzle 3", quiz: { q: "Typhoid Rats (deathtouch) attack you. You have Colossal Dreadmaw untapped. Should you block?", cards: ["rats", "dreadmaw"], options: [{ t: "Probably not: deathtouch would kill the Dreadmaw", ok: true, why: "Any damage from deathtouch kills. Taking a little damage is better than losing your biggest creature." }, { t: "Yes, the Dreadmaw is way bigger", why: "Size doesn't help against deathtouch: even 1 damage kills." }, { t: "You can't block a creature with deathtouch", why: "You can, it's just risky." }] } }
    ],
    recap: ["Look for flying and reach first: they decide who can block.", "Deathtouch makes size not matter.", "Losing a little life can be better than losing a good creature."]
  });

  L.push({
    id: "table", unit: "commander", emoji: "🤝", title: "Playing with four people", blurb: "Who to attack, and table manners.",
    steps: [
      { title: "Everyone against everyone", html: `<p>In a four-player game, you choose <b>who</b> to attack, every time. You can even split your attackers between players.</p><p>The last player standing wins. When a player loses, their cards leave the game.</p>` },
      { title: "Who should you attack?", html: `<p>A simple rule of thumb: attack whoever is <b>most dangerous</b> right now, not whoever is weakest.</p>`, widget: ["table", { players: [
        ["Alex", 40, "Lots of lands, nothing scary yet", false, "Alex isn't a danger yet. Attacking them now helps whoever is ahead."],
        ["Sam", 22, "Low life, few creatures", false, "Tempting, but Sam isn't the danger. Knocking Sam out helps the strongest player, and Sam might have helped you against them."],
        ["Jo", 38, "A huge dragon and 6 creatures", true, "Yes! Jo is the threat: if nobody slows Jo down, Jo wins. Hitting Jo now keeps the game fair and keeps you alive."]] }], gate: "Pick who to attack" },
      { title: "Quick check", quiz: { q: "Who is usually the best player to attack?", options: [{ t: "Whoever is closest to winning", ok: true, why: "Slowing the leader keeps the game fair and keeps you alive." }, { t: "Whoever has the lowest life", why: "Knocking out a weak player can help the strongest one win. Aim at the threat." }, { t: "Whoever attacked you last", why: "Revenge is fun, but the real danger is whoever is closest to winning." }] } },
      { title: "Table manners", html: `<ul><li>🗣️ Say what you're doing out loud: “I cast Grizzly Bears.”</li><li>⏸️ Pause after casting a spell so others can respond.</li><li>❓ Ask questions any time. Everyone was new once, and people love explaining their cards.</li><li>🔍 You can always ask to read someone's card.</li><li>🤝 Deals and alliances are allowed (“don't attack me and I won't attack you”), but they're not binding.</li></ul>` },
      { title: "Power levels: brackets", html: `<p>Decks are rated in <b>brackets</b> from 1 (very casual) to 5 (as strong as possible). Before a game, people say which bracket their deck is, so games stay fair and fun.</p><p>Bracket 2 is where store-bought precon decks sit: the best place to start. The upgraded Hatsune Miku deck on this site is Bracket 3, a step stronger, so tell the table when you play it.</p>`, tip: "If you lose a lot to one deck, it's not you: it may just be a higher bracket. It's fine to ask." },
      { title: "You're ready", html: `<p class="big">You now know enough to play a real game of Commander. 🎉</p><p>The best next step: play against the friendly bots in the <a href="../miku/#play">Hatsune Miku deck's Play tab</a>. It handles the counting and shows what you can do.</p><p>And the <a href="#/cheat">cheat sheet</a> is always here.</p>` }
    ],
    recap: ["Last player standing wins; you choose who to attack.", "Attack the biggest threat, not the weakest player.", "Say what you do, pause for responses, ask questions freely.", "Brackets 1–5 describe a deck's power. Start casual."]
  });

  const glossary = [
    ["Life", "Your health points. 20 in a normal game, 40 in Commander. At 0 you lose.", "goal"],
    ["Mana", "The energy you spend to cast cards. Mostly made by tapping lands.", "lands"],
    ["Mana cost", "The symbols in the top-right corner of a card: what you pay to cast it.", "cost"],
    ["Generic mana", "A grey circle with a number, like {2}: that much mana of any kind, colored or colorless.", "cost"],
    ["Colorless mana", "Mana with no color, made by cards like Sol Ring. It pays grey number slots, never colored ones.", "perms"],
    ["Land", "A card that makes mana. You can play one per turn, for free.", "lands"],
    ["Basic land", "Plains, Island, Swamp, Mountain or Forest. The only cards a Commander deck can have many copies of.", "colors"],
    ["Tap / untap", "Turn a card sideways to use it ({T}). It stands back up (untaps) at the start of your turn.", "tap"],
    ["Power / toughness", "A creature's two numbers: how hard it hits / how much damage kills it.", "card"],
    ["Creature", "A permanent that can attack and block.", "creatures"],
    ["Summoning sickness", "A creature can't attack or use {T} abilities the turn it arrives (unless it has haste).", "creatures"],
    ["Instant", "A one-shot spell you can cast at almost any time, even on other players' turns.", "spells"],
    ["Sorcery", "A one-shot spell you can only cast in your own main phase, when nothing else is happening.", "spells"],
    ["Permanent", "Any card that stays on the battlefield: lands, creatures, artifacts, enchantments, planeswalkers.", "perms"],
    ["Artifact", "A magic object. Usually colorless.", "perms"],
    ["Enchantment", "A lasting magic effect that stays on the battlefield.", "perms"],
    ["Aura", "An enchantment that attaches to something, like Pacifism.", "perms"],
    ["Planeswalker", "A powerful ally with loyalty counters and abilities you use once per turn.", "perms"],
    ["Attack", "Send untapped creatures at a player in combat. Attacking taps them (unless vigilance).", "attack"],
    ["Block", "Put an untapped creature in front of an attacker so it fights your creature instead of hitting you.", "block"],
    ["Chump block", "Blocking with a creature that will surely die, just to save life.", "block"],
    ["Flying", "Can only be blocked by flying or reach creatures.", "keywords"],
    ["Reach", "Can block flying creatures.", "keywords"],
    ["Deathtouch", "Any damage it deals to a creature kills it.", "keywords"],
    ["Trample", "Extra combat damage beyond what kills the blocker hits the player.", "keywords"],
    ["Lifelink", "Damage it deals also gains you that much life.", "keywords"],
    ["Haste", "Can attack and tap the turn it arrives.", "keywords"],
    ["Vigilance", "Doesn't tap to attack.", "keywords"],
    ["First strike", "Deals combat damage before creatures without it.", "keywords"],
    ["Menace", "Must be blocked by two or more creatures.", "keywords"],
    ["Hexproof", "Can't be targeted by opponents' spells and abilities.", "keywords"],
    ["Indestructible", "Can't be destroyed by damage or destroy effects. Exile still works.", "keywords"],
    ["Library", "Your deck, face down. You draw from it.", "zones"],
    ["Hand", "The cards you hold. Hidden from other players.", "zones"],
    ["Battlefield", "The table in the middle, where permanents are.", "zones"],
    ["Graveyard", "Your discard pile, face up.", "zones"],
    ["Exile", "Removed from the game. Very hard to come back from.", "zones"],
    ["Command zone", "Where your commander waits in Commander games.", "zones"],
    ["Stack", "The waiting line for spells and abilities. The last one added happens first.", "stack"],
    ["Respond", "Cast an instant (or use an ability) while something else is waiting on the stack.", "stack"],
    ["Resolve", "When a spell comes off the stack and actually happens.", "stack"],
    ["Counter (a spell)", "Cancel a spell on the stack, like Counterspell does. It goes to the graveyard without doing anything.", "stack"],
    ["Upkeep", "The step after untapping. Matters only when a card says “at the beginning of your upkeep”.", "phases"],
    ["Main phase", "The part of your turn where you play lands and cast creatures and sorceries. There are two.", "phases"],
    ["End step", "The last part of a turn. Damage heals right after it.", "phases"],
    ["Target", "A specific thing you choose for a spell or ability.", "words"],
    ["Dies", "Goes from the battlefield to the graveyard.", "words"],
    ["Destroy", "Put into the graveyard, whatever its size.", "words"],
    ["Token", "A creature or object made by a card. It vanishes when it leaves the battlefield.", "words"],
    ["Trigger", "Card text starting with “Whenever”, “When” or “At”. It happens by itself, no payment.", "tricks"],
    ["Activated ability", "Card text shaped like “cost: effect”. You choose when to pay and use it.", "tricks"],
    ["Populate", "Create a copy of a creature token you control.", "tricks"],
    ["Convoke", "While casting the spell, tap your creatures to help pay: each pays one grey circle or one of its color.", "tricks"],
    ["Equip", "Pay the Equip cost in your main phase to attach an Equipment to one of your creatures.", "tricks"],
    ["Pass / OK", "What you say to let a spell happen, or to end your turn.", "others"],
    ["+1/+1 counter", "A marker that permanently adds 1 to power and toughness.", "words"],
    ["Enters", "Comes onto the battlefield.", "words"],
    ["Commander", "Your deck's legendary leader, and the name of the 4-player format.", "commander"],
    ["Commander tax", "Each time you cast your commander from the command zone, it costs {2} more than the time before.", "commander"],
    ["Color identity", "Every color in the mana symbols on your commander, in its cost and its text. Your deck can only use those.", "commander"],
    ["Commander damage", "21 combat damage from a single commander makes you lose.", "commander"],
    ["Singleton", "Only one copy of each card (Commander rule, basic lands excepted).", "commander"],
    ["Mulligan", "Shuffle a bad opening hand away and draw a new one, then put a card on the bottom for each mulligan. With 3 or more players the first one is free.", "firstturn"],
    ["Opening hand", "The 7 cards you draw at the start of a game.", "firstturn"],
    ["Bracket", "A deck's power level from 1 (casual) to 5 (maximum).", "table"],
    ["Precon", "A preconstructed deck, sold ready to play.", "table"],
    ["Threat", "The player or card most likely to win the game soon.", "table"]
  ];

  const cheat = [
    ["🎯 Goal", "<p>Bring opponents to 0 life. Commander: 40 life, 21 commander damage also knocks someone out.</p>"],
    ["🔁 Your turn", "<ol><li><b>Untap</b> everything.</li><li><b>Upkeep</b>: “at the beginning of your upkeep” cards trigger.</li><li><b>Draw</b> a card.</li><li><b>Main phase 1</b>: one land, creatures, sorceries, anything.</li><li><b>Combat</b>: tap attackers, choose who they attack, blockers are declared, damage.</li><li><b>Main phase 2</b>: same as main 1.</li><li><b>End</b>: end-step triggers, damage heals, next player.</li></ol>"],
    ["🌳 Mana", "<ul><li>One land per turn, on your turn.</li><li>Colored symbols need that color: {W} {U} {B} {R} {G}. Grey numbers take any.</li><li>Pay colored symbols first.</li><li>Unused mana vanishes between steps.</li></ul>"],
    ["⏱️ When can I cast it?", "<ul><li><b>Instants</b> and most abilities: any time.</li><li><b>Everything else</b>: your main phase, with nothing on the stack.</li><li>Your commander: from the command zone, {2} more for each earlier cast from there.</li></ul>"],
    ["⚔️ Combat", "<ul><li>New creatures can't attack (unless haste).</li><li>Unblocked: the player takes damage = power.</li><li>Blocked: both hit each other at once. Damage ≥ toughness → dies.</li><li>Flying: only flying/reach can block it. Deathtouch: any damage kills. Trample: extra goes through.</li></ul>"],
    ["🍽️ The stack", "<p>Spells wait on the stack. Anyone can respond. The last one added resolves first. Say “pass” when you're done responding.</p>"],
    ["🗣️ At the table", "<ul><li>Say what you cast, and pause for responses.</li><li>Ask to read any card, any time.</li><li>Attack the biggest threat, not the weakest player.</li><li>Keep a hand with 2–4 lands.</li></ul>"]
  ];

  const exam = [
    { q: "What does {T} mean on a card?", options: [{ t: "Tap this card (turn it sideways)", ok: true }, { t: "Target", why: "{T} is the tap symbol." }, { t: "Two mana", why: "{T} is the tap symbol. Two mana would be {2}." }] },
    { q: "You attack with Serra Angel (flying, vigilance). Is she tapped afterwards?", options: [{ t: "No, vigilance means she doesn't tap to attack", ok: true }, { t: "Yes, attackers always tap", why: "Vigilance is the exception: no tapping." }, { t: "Only if she gets blocked", why: "Blocking doesn't change tapping. Vigilance means she never taps to attack." }] },
    { q: "What happens to damage on a creature that survived?", options: [{ t: "It heals at the end of the turn", ok: true }, { t: "It stays until the creature dies", why: "Damage wears off at the end of each turn." }, { t: "It heals at the start of your next turn", why: "Sooner than that: damage wears off at the end of every turn." }] },
    { q: "Vampire Nighthawk (2/3, lifelink) attacks and isn't blocked. What happens?", cards: ["nighthawk"], options: [{ t: "The opponent loses 2 and you gain 2", ok: true, why: "The first number (2) is the damage, and lifelink gains you the same." }, { t: "The opponent loses 3", why: "The first number (power) is the damage: 2. The 3 is its health." }, { t: "The opponent loses 2, and that's all", why: "Lifelink also gains you as much life as the damage: 2." }] },
    { q: "Which zone holds a card that is “removed from the game”?", options: [{ t: "Exile", ok: true }, { t: "Graveyard", why: "The graveyard is the discard pile. Removed from the game = exile." }, { t: "Library", why: "The library is your deck. Removed from the game = exile." }] },
    { q: "Can you play a land on an opponent's turn?", options: [{ t: "No, only on your own turn", ok: true }, { t: "Yes, if you didn't play one on your turn", why: "Lands are played only in your own main phase, one per turn." }, { t: "Yes, but only during combat", why: "Lands are played only in your own main phase." }] },
    { q: "Which of these can't you cast on your opponent's turn?", options: [{ t: "A creature without special text", ok: true, why: "Creatures need your own main phase." }, { t: "Lightning Bolt", why: "It's an instant: any time." }, { t: "Giant Growth", why: "It's an instant: any time." }] },
    { q: "How many players in a usual Commander game?", options: [{ t: "4", ok: true }, { t: "2", why: "Commander is usually played with 4 people." }, { t: "6", why: "Commander is usually played with 4 people." }] },
    { q: "Hill Giant (3/3) is blocked by Giant Spider (2/4). What happens?", cards: ["giant", "spider"], options: [{ t: "Both survive", ok: true, why: "3 damage to a 4-health Spider, 2 damage to a 3-health Giant: no one dies." }, { t: "The Spider dies", why: "3 damage isn't enough for 4 health." }, { t: "Both die", why: "Neither deals enough damage." }] },
    { q: "Your hand: 1 land and 6 expensive cards. Good opening hand?", options: [{ t: "No, mulligan it", ok: true }, { t: "Yes, keep it and hope to draw lands", why: "One land and expensive cards: you probably won't cast anything for many turns." }, { t: "Keep it, then mulligan next turn if it's bad", why: "You can only mulligan before the game starts." }] },
    { q: "Which symbol is blue mana?", options: [{ t: "{U}", ok: true, why: "U, because B was already taken by black." }, { t: "{B}", why: "{B} is black. Blue is {U}." }, { t: "{G}", why: "{G} is green. Blue is {U}." }] },
    { q: "Your commander was exiled. What can you do?", options: [{ t: "Move it back to the command zone", ok: true }, { t: "Nothing, it's gone", why: "After it's exiled or dies, you may move your commander back to the command zone." }, { t: "Put it in your hand", why: "It goes back to the command zone, where you can cast it again (with tax)." }] },
    { q: "Which part of a card happens by itself, without you paying?", options: [{ t: "A line starting with “Whenever”", ok: true, why: "That's a trigger." }, { t: "A line like “{1}{G}{W}, {T}: Populate”", why: "The part before the colon is a cost you choose to pay." }, { t: "The mana cost in the corner", why: "That's what you pay to cast the card." }] },
    { q: "It's another player's turn and they attack you. What can you do?", options: [{ t: "Block with untapped creatures", ok: true }, { t: "Cast a creature to block with", why: "Creatures (without flash) wait for your own main phase." }, { t: "Nothing until your turn", why: "You can block, and cast instants." }] }
  ];

  return { cards, anatomy, turn5, colorInfo, zones, units, lessons: L, glossary, cheat, exam };
})();
