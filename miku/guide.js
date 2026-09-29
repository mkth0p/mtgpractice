/* The long-form playing guide for the Miku (Trostani, Selesnya's Voice) deck.
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Card mentions use <i-c>Exact Card Name</i-c>; mana symbols are written as {G}, {W}, {1}, {T}. */
window.MIKU_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "What the deck does, the three ways it wins, and whether it's the deck for you.",
    blocks: [
      { t: "p", html: "This is a green-white creature deck led by <i-c>Trostani, Selesnya's Voice</i-c>, printed here as <i>Miku, Song of the People</i>. You make lots of creatures, most of them tokens, and every one that enters gains you life." },
      { t: "p", html: "The life isn't the point by itself. Cards like <i-c>Archangel of Thune</i-c> turn each bit of lifegain into +1/+1 counters on your whole team, so your board grows every time something enters." },
      { t: "h", text: "The loop in four beats" },
      { t: "steps", items: [
        { title: "Creatures enter", html: "Tokens from <i-c>Hero of Bladehold</i-c>, <i-c>Adeline, Resplendent Cathar</i-c>, <i-c>Elspeth, Sun's Champion</i-c>, <i-c>Grand Crescendo</i-c> and Trostani's populate. Each body is its own trigger." },
        { title: "You gain life", html: "Trostani gains you life equal to each new creature's toughness. <i-c>Soul Warden</i-c> and <i-c>Prosperous Innkeeper</i-c> add 1 more each time." },
        { title: "The team grows", html: "<i-c>Archangel of Thune</i-c>, <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Nykthos Paragon</i-c> and <i-c>Cathars' Crusade</i-c> turn those events into +1/+1 counters." },
        { title: "You overrun", html: "<i-c>Craterhoof Behemoth</i-c>, <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c> and friends turn a wide board into lethal damage." }
      ] },
      { t: "cards", names: ["Trostani, Selesnya's Voice", "Archangel of Thune", "Craterhoof Behemoth"], caption: "The commander, the best payoff, and the classic finisher." },
      { t: "h", text: "Three ways to win" },
      { t: "list", items: [
        "<b>Go wide, then pump.</b> Most games end this way. In a 5,000-game speed test, 68% of wins were plain combat damage and another 27% came from a finisher cast for exact lethal.",
        "<b>An infinite combo.</b> <i-c>Heliod, Sun-Crowned</i-c> plus <i-c>Walking Ballista</i-c> deals infinite damage. <i-c>Spike Feeder</i-c> plus Heliod, <i-c>Archangel of Thune</i-c> or <i-c>Cleric Class</i-c> at level 2 gains infinite life, which <i-c>Aetherflux Reservoir</i-c> turns into damage. They're backups for stalled boards: they decided about 3% of test games.",
        "<b>Halo Fountain.</b> Pay {W}{W}{W}{W}{W}, tap <i-c>Halo Fountain</i-c> and untap fifteen tapped creatures you control: you win the game. Rare, but real once your board is huge."
      ] },
      { t: "h", text: "How fast and how strong" },
      { t: "p", html: "In the speed test (5,000 solo games, no blockers, no removal) the deck won 13% of games by turn 7, 31% by turn 8 and 55% by turn 9. The median kill turn was 9." },
      { t: "p", html: "Real opponents block and wipe the board, so treat those numbers as a ceiling. At a real table, expect to win around turns 7 to 9 when things go well." },
      { t: "p", html: "It's a solid Bracket 3 deck, the 'Upgraded' bracket, roughly 6.5 to 7 on the old 1 to 10 scale. Strong at a casual or upgraded-precon table, nowhere near cEDH." },
      { t: "callout", tone: "key", title: "Tell the table first", html: "Bracket 3 allows two-card combos as long as they aren't early-game ones, and this deck fits. Still, mention Heliod plus Walking Ballista in the pregame talk, since some groups ban any infinite." },
      { t: "h", text: "Is it for you?" },
      { t: "list", items: [
        "You'll enjoy it if you like building a board over a few turns and then taking one huge turn.",
        "You'll enjoy it if you like trigger math. A single token can mean four or five triggers.",
        "It's less fun if you like counterspells and stopping other people's plans. You have eight removal spells and no counterspells.",
        "Your turns get long. Learn to announce triggers in batches: the chapter on tricky interactions helps."
      ] },
      { t: "callout", tone: "tip", title: "How to use this guide", html: "Read the engine and commander chapters first. Play a few games, then come back for the turn-by-turn chapters, the combos and the rules questions." }
    ]
  },
  {
    id: "the-engine",
    title: "The engine, piece by piece",
    kicker: "How it works",
    minutes: 6,
    summary: "How one creature entering turns into life, counters and eventually lethal, and why the order of your triggers matters.",
    blocks: [
      { t: "p", html: "Everything in this deck feeds one loop: creatures enter, you gain life, your team grows, then you attack. Learn the four roles and you can read any board state." },
      { t: "h", text: "Role 1: bodies" },
      { t: "p", html: "You want many creatures entering, not a few big ones. Tokens are perfect: they're cheap and they arrive in groups." },
      { t: "cards", names: ["Hero of Bladehold", "Adeline, Resplendent Cathar", "Elspeth, Sun's Champion", "Grand Crescendo"], caption: "Hero makes two Soldiers per attack, Adeline one Human per opponent, Elspeth three Soldiers a turn, Crescendo X Citizens at instant speed." },
      { t: "list", items: [
        "<b>Every attack:</b> <i-c>Hero of Bladehold</i-c>, <i-c>Adeline, Resplendent Cathar</i-c>, <i-c>Ghalta and Mavren</i-c>, <i-c>Esika's Chariot</i-c>, <i-c>Conclave Evangelist</i-c>.",
        "<b>Every turn:</b> <i-c>Elspeth, Sun's Champion</i-c>, <i-c>Speaker of the Heavens</i-c>, <i-c>Resplendent Angel</i-c>, <i-c>Halo Fountain</i-c>.",
        "<b>Instant speed:</b> <i-c>Grand Crescendo</i-c>, <i-c>Rootborn Defenses</i-c>, Trostani's populate.",
        "<b>Copies:</b> <i-c>Bramble Sovereign</i-c>, <i-c>Song of the Worldsoul</i-c>, <i-c>Sundering Growth</i-c>.",
        "<b>When they die:</b> <i-c>Voice of Resurgence</i-c>, <i-c>Elenda's Hierophant</i-c>.",
        "<b>One big one:</b> <i-c>Grove of the Guardian</i-c> makes an 8/8."
      ] },
      { t: "h", text: "Role 2: lifegain sources" },
      { t: "p", html: "These turn bodies into lifegain events. The number of events matters more than the size of each one, because most payoffs trigger once per event." },
      { t: "cards", names: ["Trostani, Selesnya's Voice", "Soul Warden", "Prosperous Innkeeper", "Cleric Class"], caption: "The four that matter most." },
      { t: "list", items: [
        "<i-c>Trostani, Selesnya's Voice</i-c>: life equal to the toughness of each other creature you control that enters.",
        "<i-c>Soul Warden</i-c>: 1 life whenever any other creature enters, even an opponent's.",
        "<i-c>Prosperous Innkeeper</i-c>: 1 life whenever another creature you control enters.",
        "<i-c>Cleric Class</i-c>: every gain is 1 bigger.",
        "Lifelink: <i-c>Archangel of Thune</i-c>, <i-c>Lathiel, the Bounteous Dawn</i-c>, <i-c>Speaker of the Heavens</i-c>, and the Vampire tokens from <i-c>Ghalta and Mavren</i-c> and <i-c>Elenda's Hierophant</i-c>.",
        "Small extras: gain lands (<i-c>Blossoming Sands</i-c>, <i-c>Graypelt Refuge</i-c>, <i-c>Brokers Hideout</i-c>), <i-c>Spike Feeder</i-c> and <i-c>Aetherflux Reservoir</i-c>.",
        "Big single gains: <i-c>Camaraderie</i-c> and <i-c>Shamanic Revelation</i-c>. One big gain is exactly what <i-c>Nykthos Paragon</i-c> wants."
      ] },
      { t: "h", text: "Role 3: payoffs" },
      { t: "p", html: "These turn events into counters. Most count lifegain events. <i-c>Cathars' Crusade</i-c> counts creatures entering instead, so it needs no lifegain at all." },
      { t: "cards", names: ["Archangel of Thune", "Heliod, Sun-Crowned", "Nykthos Paragon", "Cathars' Crusade"], caption: "The team-wide growers." },
      { t: "list", items: [
        "<i-c>Archangel of Thune</i-c>: each lifegain event puts a +1/+1 counter on <b>each</b> creature you control. The best card in the deck.",
        "<i-c>Heliod, Sun-Crowned</i-c>: each lifegain event puts a counter on one target creature or enchantment you control.",
        "<i-c>Nykthos Paragon</i-c>: once each turn, a gain of N life can put N counters on each creature you control.",
        "<i-c>Cathars' Crusade</i-c>: each creature entering puts a counter on each creature you control.",
        "Single-creature growers: <i-c>Ajani's Pridemate</i-c>, <i-c>Voice of the Blessed</i-c>, <i-c>Elenda's Hierophant</i-c> and <i-c>Cleric Class</i-c> at level 2. <i-c>Lathiel, the Bounteous Dawn</i-c> spreads counters at each end step."
      ] },
      { t: "h", text: "Role 4: the overrun" },
      { t: "p", html: "Once the board is wide, one card turns it into damage. The closing chapter covers which one to pick for which board." },
      { t: "cards", names: ["Craterhoof Behemoth", "Overwhelming Stampede", "Triumph of the Hordes", "Beastmaster Ascension", "Jazal Goldmane"], caption: "Five of the finishers." },
      { t: "h", text: "Every creature is its own trigger" },
      { t: "p", html: "Trostani, Soul Warden, Prosperous Innkeeper and Cathars' Crusade trigger once for <b>each</b> creature that enters." },
      { t: "p", html: "Elspeth's three Soldiers enter at the same moment, but they still cause three Trostani triggers, three Soul Warden triggers and three Crusade triggers." },
      { t: "p", html: "Each lifegain trigger is a separate event, so Archangel of Thune triggers once for each. That's why the counters pile up so fast." },
      { t: "h", text: "Why trigger order matters" },
      { t: "p", html: "When several of your abilities trigger at the same time, you choose the order they go on the stack. The last one you put on resolves first." },
      { t: "p", html: "Trostani checks the creature's toughness when her trigger <b>resolves</b>, not when it triggers. So put her trigger on the stack first, at the bottom. Let the counters land, then Trostani sees a bigger creature." },
      { t: "h", text: "Worked example 1" },
      { t: "p", html: "You control <i-c>Trostani, Selesnya's Voice</i-c>, <i-c>Soul Warden</i-c> and <i-c>Archangel of Thune</i-c>, and a single 1/1 Soldier token enters. That triggers Trostani and Soul Warden. Put Trostani's trigger on the bottom." },
      { t: "math", items: [
        { label: "Soul Warden resolves", value: "+1 life" },
        { label: "That triggers Archangel of Thune: a counter on each creature", value: "token is 2/2" },
        { label: "Trostani resolves, and the token's toughness is now 2", value: "+2 life" },
        { label: "Archangel of Thune triggers again", value: "token is 3/3" }
      ], total: "<b>3 life</b>, and every creature you control gets <b>two</b> +1/+1 counters. In the other order you'd gain only 2." },
      { t: "h", text: "Worked example 2: add Cathars' Crusade" },
      { t: "p", html: "Same board plus <i-c>Cathars' Crusade</i-c>. The token now makes three triggers. Put Trostani's at the bottom, then Soul Warden's, then Crusade's on top." },
      { t: "math", items: [
        { label: "Cathars' Crusade resolves: a counter on each creature", value: "token is 2/2" },
        { label: "Soul Warden resolves", value: "+1 life" },
        { label: "Archangel of Thune: a counter on each creature", value: "token is 3/3" },
        { label: "Trostani resolves, toughness 3", value: "+3 life" },
        { label: "Archangel of Thune again", value: "token is 4/4" }
      ], total: "<b>4 life</b> and <b>three</b> counters on every creature you control, all from one 1/1 token." },
      { t: "callout", tone: "key", title: "Scale it up", html: "Now make it Elspeth's +1 with the same board: three Soldiers at once. That's nine enter triggers and nine counters on every creature you control. Resolve all the Crusade and Soul Warden triggers first and the three Trostani triggers see 7, 8 and 9 toughness: 27 life in all. Put the Trostani triggers first instead and you gain only 9." },
      { t: "callout", tone: "tip", title: "Soul Warden watches everyone", html: "Soul Warden triggers on opponents' creatures too. With Archangel of Thune out, every creature an opponent casts or creates puts a counter on each of yours." },
      { t: "h", text: "Saying it at the table" },
      { t: "p", html: "You don't need to narrate every trigger. Group them and give the result." },
      { t: "p", html: "For the Elspeth example: 'Three Soldiers. Crusade and Warden first: six counters on everything and 3 life. Then Trostani three times for 7, 8 and 9: 27 life in all, nine counters on each creature.' Track the counters with dice." },
      { t: "widget", id: "engineCalc" },
      { t: "p", html: "Toggle the engines you have out and see what one creature entering does with that board." }
    ]
  },
  {
    id: "your-commander",
    title: "Your commander",
    kicker: "Meet Trostani",
    minutes: 5,
    summary: "When to cast Trostani, how and when to populate, and how to keep her alive.",
    blocks: [
      { t: "cards", names: ["Trostani, Selesnya's Voice"], caption: "{G}{G}{W}{W}, 2/5. Printed as Miku, Song of the People." },
      { t: "p", html: "Trostani has two jobs. Her first ability gains you life whenever another creature you control enters, equal to that creature's toughness." },
      { t: "p", html: "Her second, {1}{G}{W} and {T}, is populate: you create a token that's a copy of a creature token you control." },
      { t: "p", html: "She isn't a threat by herself. She's the engine that makes every other card better, so treat her like one." },
      { t: "h", text: "When to cast her" },
      { t: "steps", items: [
        { title: "Turn 3 if you ramped on turn 1", html: "A turn-1 <i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c> or <i-c>Avacyn's Pilgrim</i-c> plus three lands is 4 mana on turn 3. That's the dream start." },
        { title: "Turn 4 otherwise", html: "Four lands, or three lands and a Signet. Don't skip a land drop to hold her." },
        { title: "Before your token makers", html: "She only counts creatures that enter after she's out. Cast her before <i-c>Hero of Bladehold</i-c>, not after." },
        { title: "Mind the colors", html: "Her cost is {G}{G}{W}{W}: two of each color. The duals, <i-c>Command Tower</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Selesnya Signet</i-c> and <i-c>Sungrass Prairie</i-c> fix it. <i-c>Sol Ring</i-c> alone can't pay any of it, but it can pay the {1} for Selesnya Signet." }
      ] },
      { t: "h", text: "Populate, step by step" },
      { t: "p", html: "Populate copies a creature <b>token</b> you control. With no creature token out, it does nothing." },
      { t: "p", html: "The copy is a new creature entering, so Trostani triggers on it too. Every populate is also lifegain." },
      { t: "steps", items: [
        { title: "Wait for the right window", html: "Populate has no timing restriction. The best time is the end of the opponent's turn right before yours." },
        { title: "Leave {1}{G}{W} open", html: "During their turns the open mana looks like a trick. If a wipe comes, you can spend it on <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> instead." },
        { title: "Nothing happened? Populate", html: "In that last end step, tap Trostani and pay. The copy enters and Trostani gains you life equal to its toughness." },
        { title: "Untap and use it", html: "The token has been yours since before your turn began, so it can attack right away. Trostani untaps too." }
      ] },
      { t: "callout", tone: "warn", title: "Summoning sickness", html: "Populate costs {T}, so Trostani can't use it until she's been under your control since the start of your most recent turn. That includes the opponents' turns right after you cast her. Her first populate comes on your next turn at the earliest. <i-c>Crashing Drawbridge</i-c> gives haste, which lets her tap the turn she comes down." },
      { t: "h", text: "Best populate targets" },
      { t: "p", html: "The copy gets what's printed on the token, not its counters or pumps. So pick the token with the best base stats." },
      { t: "table", head: ["Token", "From", "Trostani gains"], rows: [
        ["8/8 Elemental, vigilance", "<i-c>Grove of the Guardian</i-c>", "8"],
        ["Elemental, size = your creature count", "<i-c>Voice of Resurgence</i-c>", "Your creature count, the copy included"],
        ["4/4 flying Angel", "<i-c>Resplendent Angel</i-c>, <i-c>Speaker of the Heavens</i-c>", "4"],
        ["2/2 Cat", "<i-c>Esika's Chariot</i-c>", "2"],
        ["1/1 lifelink Vampire", "<i-c>Ghalta and Mavren</i-c>, <i-c>Elenda's Hierophant</i-c>", "1"],
        ["1/1 Soldier, Human or Citizen", "Hero, Elspeth, Adeline, Crescendo", "1"]
      ] },
      { t: "p", html: "With <i-c>Intangible Virtue</i-c> out, add 1 to each: the copy is a token, so it gets the bonus too." },
      { t: "p", html: "The Voice of Resurgence Elemental gets better with every copy. Each copy counts every creature you control, including the other copies, so they all grow together. With eight or more creatures already out, a Voice copy is bigger than the 8/8." },
      { t: "h", text: "Protecting her" },
      { t: "list", items: [
        "Don't attack with her into open blockers. A 2/5 that dies in combat costs you 2 more mana next time.",
        "<i-c>Shalai, Voice of Plenty</i-c> gives her hexproof. <i-c>Grand Crescendo</i-c> and <i-c>Rootborn Defenses</i-c> save her from destroy effects.",
        "When she goes to your graveyard or into exile, you may move her to the command zone. Always do it.",
        "Give opponents better targets. Hero, Adeline and Archangel of Thune demand removal more urgently than she does."
      ] },
      { t: "h", text: "Commander tax and recasting" },
      { t: "p", html: "Each time you cast her from the command zone, she costs {2} more: 4, then 6, then 8." },
      { t: "list", items: [
        "Recast her right away if you have creatures to follow up with this turn or next. Every creature after her is worth more.",
        "Recast her if she enables a combo. With <i-c>Heliod, Sun-Crowned</i-c> out, she lets you cast <i-c>Walking Ballista</i-c> for X=1: her trigger gains 1 life, and Heliod adds the second counter the loop needs.",
        "Wait a turn if an opponent is clearly holding another wipe. Losing her twice in a row is how games slip away.",
        "At 8 mana or more, compare her with the best threat in your hand. Late in the game, a finisher is often the better use of the mana."
      ] },
      { t: "callout", tone: "tip", title: "Commander damage", html: "Trostani's combat damage counts as commander damage: 21 from her to one player over the game kills them, whatever their life total. It rarely matters, but a pumped Trostani late in the game can do it in one hit." },
      { t: "qa", items: [
        { q: "Does a populated copy trigger Trostani?", a: "Yes. Populate creates a token, and a token entering is a creature entering. It also triggers <i-c>Soul Warden</i-c>, <i-c>Prosperous Innkeeper</i-c> and <i-c>Cathars' Crusade</i-c>." },
        { q: "Does the copy keep counters?", a: "No. It copies only what's printed on the original token. Anthems like <i-c>Intangible Virtue</i-c> still apply because they affect every creature token you control." },
        { q: "Can I populate a Treasure or Junk token?", a: "No. Populate copies creature tokens only." },
        { q: "Can I copy a token that's tapped and attacking?", a: "Yes, but the copy enters untapped and isn't attacking." }
      ] }
    ]
  },
  {
    id: "mulligans",
    title: "Mulligans and opening hands",
    kicker: "Keep or ship",
    minutes: 6,
    summary: "How to judge an opening seven, with example hands, their verdicts and the odds behind them.",
    blocks: [
      { t: "p", html: "The deck runs 34 lands and 11 ramp pieces that cost 2 or less. That's plenty, but a 99-card deck still deals ugly hands. Knowing when to send one back wins more games than any combo." },
      { t: "list", items: [
        "<b>1 mana:</b> <i-c>Sol Ring</i-c>, <i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Avacyn's Pilgrim</i-c>, <i-c>Springleaf Drum</i-c>.",
        "<b>2 mana:</b> <i-c>Arcane Signet</i-c>, <i-c>Selesnya Signet</i-c>, <i-c>Fanatic of Rhonas</i-c>, <i-c>Nature's Lore</i-c>, <i-c>Farseek</i-c>, <i-c>Prosperous Innkeeper</i-c>."
      ] },
      { t: "h", text: "The mulligan rules you're using" },
      { t: "steps", items: [
        { title: "Draw seven", html: "Trostani starts in the command zone, so you draw from the other 99." },
        { title: "Your first mulligan is free", html: "In a multiplayer game the first mulligan doesn't cost a card. Shuffle, draw a new seven, keep all seven." },
        { title: "After that, bottom one per mulligan", html: "This is the London mulligan: you always draw seven, then put cards on the bottom. Second mulligan, bottom 1. Third, bottom 2." },
        { title: "Choose the bottom cards last", html: "Decide which cards go to the bottom only after you've seen the whole seven." }
      ] },
      { t: "callout", tone: "tip", title: "What to bottom", html: "Bottom the most expensive cards first, then extra removal. Keep lands up to four, cheap ramp and your lifegain sources. <i-c>Craterhoof Behemoth</i-c> in an opening hand is usually the first card to go." },
      { t: "h", text: "The numbers" },
      { t: "p", html: "With 34 lands in 99 cards, a random seven has 2.4 lands on average. Here's how often each land count shows up:" },
      { t: "table", head: ["Lands in 7", "How often", "Verdict"], rows: [
        ["0 or 1", "23.5%", "Mulligan"],
        ["2", "31.1%", "Keep only with cheap ramp"],
        ["3 or 4", "40.8%", "Usually keep"],
        ["5 or more", "4.5%", "Keep 5 with good spells, ship 6 or 7"]
      ] },
      { t: "p", html: "About one hand in four has 0 or 1 land. That's what the free mulligan is for." },
      { t: "p", html: "A two-lander with no ramp is worse than it looks. On the play, you'll find a land in your next two draws only 57.7% of the time, and you'll have four lands on turn 4 just 27.6% of the time." },
      { t: "h", text: "What a keep looks like" },
      { t: "list", items: [
        "3 or 4 lands with at least one ramp piece.",
        "2 lands plus <i-c>Sol Ring</i-c> or a mana creature, and cheap plays.",
        "Anything that casts Trostani by turn 4."
      ] },
      { t: "h", text: "What a mulligan looks like" },
      { t: "list", items: [
        "0 or 1 land, even with ramp.",
        "6 or 7 lands.",
        "Only cards that cost 5 or more.",
        "2 lands and no ramp, while your free mulligan is still available."
      ] },
      { t: "callout", tone: "warn", title: "Don't mulligan for combo pieces", html: "The deck wins most games without them. A hand with <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Walking Ballista</i-c> but one land is still a one-land hand." },
      { t: "h", text: "Example hand 1" },
      { t: "cards", names: ["Forest", "Plains", "Sunpetal Grove", "Llanowar Elves", "Soul Warden", "Arcane Signet", "Hero of Bladehold"], caption: "Three lands, a turn-1 mana creature, a lifegain source, a Signet and a strong 4-drop." },
      { t: "callout", tone: "key", title: "Keep. This is the ideal start.", html: "Turn 1 Elves. Turn 2 Signet and Soul Warden. Turn 3 Trostani with a mana to spare. Turn 4 Hero, with Trostani and Warden already out to gain you 5." },
      { t: "h", text: "Example hand 2" },
      { t: "cards", names: ["Command Tower", "Forest", "Sol Ring", "Elvish Mystic", "Ajani's Pridemate", "Grand Crescendo", "Craterhoof Behemoth"], caption: "Two lands, but two fast mana pieces." },
      { t: "callout", tone: "key", title: "Keep, carefully.", html: "Turn 1 Sol Ring, turn 2 Command Tower gives you 4 mana: Mystic and Pridemate with one to spare. You still need a second white source for Trostani's {G}{G}{W}{W}, and Craterhoof is dead weight for now. If you had to bottom a card, it would be the Hoof." },
      { t: "h", text: "Example hand 3" },
      { t: "cards", names: ["Command Tower", "Heliod, Sun-Crowned", "Walking Ballista", "Spike Feeder", "Swords to Plowshares", "Aetherflux Reservoir", "Finale of Devastation"], caption: "Both combos, a tutor, removal. One land." },
      { t: "callout", tone: "warn", title: "Mulligan.", html: "It looks exciting, but miss your next two land drops and none of it matters. Take the free mulligan." },
      { t: "h", text: "Example hand 4" },
      { t: "cards", names: ["Forest", "Plains", "Soul Warden", "Voice of the Blessed", "Ajani's Pridemate", "Intangible Virtue", "Swords to Plowshares"], caption: "All cheap, two lands, no ramp." },
      { t: "callout", tone: "warn", title: "Mulligan if it's free. Keep it after a paid mulligan.", html: "On the play, you'll have four lands on turn 4 only about a quarter of the time. <i-c>Voice of the Blessed</i-c> needs {W}{W}, which these two lands can't make, and <i-c>Intangible Virtue</i-c> does nothing without tokens. With the free mulligan available, ship it. If you've already paid for a mulligan, keep it and bottom the Virtue." },
      { t: "h", text: "Practice" },
      { t: "widget", id: "handTrainer" },
      { t: "p", html: "Deal hands until your verdicts match the trainer's. Then use the odds tool to check any draw you're unsure about." },
      { t: "widget", id: "drawOdds" }
    ]
  },
  {
    id: "turns-1-3",
    title: "Turns 1 to 3: the setup",
    kicker: "Early game",
    minutes: 5,
    summary: "What to play on each of your first three turns, in what order, and what to hold back.",
    blocks: [
      { t: "p", html: "Your first three turns decide how fast Trostani and your payoffs arrive. The goal is simple: be able to cast a 4-drop on turn 3, with a lifegain source already out." },
      { t: "h", text: "Turn 1" },
      { t: "steps", items: [
        { title: "Play the land that fits", html: "If you have a 1-drop, play an untapped land that makes its color. If you don't, this is the turn for a tapped land like <i-c>Blossoming Sands</i-c> or <i-c>Graypelt Refuge</i-c>." },
        { title: "Cast your best 1-drop", html: "In order: <i-c>Sol Ring</i-c>, then a mana creature (<i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Avacyn's Pilgrim</i-c>), then <i-c>Soul Warden</i-c> or <i-c>Cleric Class</i-c>." },
        { title: "Hold the rest", html: "<i-c>Skullclamp</i-c> and <i-c>Springleaf Drum</i-c> can wait until you have creatures to use them with." }
      ] },
      { t: "callout", tone: "tip", title: "Why a mana creature over Soul Warden", html: "Soul Warden only pays off once creatures start arriving. A turn-1 Elves turns turn 3 into a 4-mana turn, which is worth far more. Warden can come down on turn 2 or 3 alongside something else." },
      { t: "callout", tone: "warn", title: "Never lead with Selesnya Sanctuary", html: "<i-c>Selesnya Sanctuary</i-c> returns a land you control to your hand when it enters. As your only land, it has to return itself." },
      { t: "h", text: "Turn 2" },
      { t: "steps", items: [
        { title: "Ramp first", html: "<i-c>Arcane Signet</i-c>, <i-c>Selesnya Signet</i-c>, <i-c>Nature's Lore</i-c>, <i-c>Farseek</i-c>, <i-c>Fanatic of Rhonas</i-c> or <i-c>Prosperous Innkeeper</i-c>. Any of them gets you to 4 mana on turn 3." },
        { title: "Add a cheap engine if the mana allows", html: "After a turn-1 mana creature you have 3 mana. A 2-mana ramp piece plus <i-c>Soul Warden</i-c> or <i-c>Cleric Class</i-c> is perfect." },
        { title: "Prefer land ramp over rocks", html: "Lands survive board wipes and artifact removal. <i-c>Nature's Lore</i-c> puts a basic Forest onto the battlefield untapped, so you can use it right away." }
      ] },
      { t: "p", html: "<i-c>Farseek</i-c> can fetch <i-c>Canopy Vista</i-c>, because it's a Plains. It enters tapped either way, so you lose nothing and gain a dual land." },
      { t: "h", text: "Signet or a 2-drop creature?" },
      { t: "p", html: "This comes up a lot. Ask one question: what will I cast on turn 3?" },
      { t: "list", items: [
        "If you have a 4-drop (Trostani, <i-c>Hero of Bladehold</i-c>, <i-c>Shalai, Voice of Plenty</i-c>, <i-c>Esika's Chariot</i-c>, <i-c>Bramble Sovereign</i-c>), play the Signet. A turn-3 four-drop wins games.",
        "If your hand is 2- and 3-drops anyway, play the creature. <i-c>Ajani's Pridemate</i-c> and <i-c>Voice of the Blessed</i-c> are best when <i-c>Soul Warden</i-c> is already out, so they start growing at once.",
        "<i-c>Prosperous Innkeeper</i-c> does both jobs: a 2-drop creature, a lifegain source and a Treasure for later."
      ] },
      { t: "h", text: "Turn 3" },
      { t: "steps", items: [
        { title: "Have 4 mana? Cast Trostani", html: "If a mana creature or rock got you there, Trostani comes down now. Every creature you play afterwards gains you life." },
        { title: "Have 3 mana? Pick the best 3-drop", html: "<i-c>Adeline, Resplendent Cathar</i-c> is the strongest. <i-c>Cultivate</i-c> sets up a big turn 4. <i-c>Elenda's Hierophant</i-c> and <i-c>Resplendent Angel</i-c> are fine too." },
        { title: "Lifegain before bodies", html: "If you're casting two things, the lifegain source goes first: Soul Warden, then the creature." },
        { title: "Plan Adeline's attacks", html: "She can't attack the turn she arrives, but her trigger already works: attack with any creature and you get a Human attacking each opponent. From next turn she attacks too, and vigilance keeps her ready to block." }
      ] },
      { t: "h", text: "What to hold" },
      { t: "list", items: [
        "<b>Combo pieces.</b> <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Walking Ballista</i-c> and <i-c>Spike Feeder</i-c> are best cast when you can use or protect them. The exception is a small Ballista that kills an opponent's mana creature.",
        "<b>Finishers.</b> <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c>, <i-c>Craterhoof Behemoth</i-c> and <i-c>Return of the Wildspeaker</i-c> wait for the kill turn.",
        "<b>Removal.</b> Save <i-c>Swords to Plowshares</i-c> and <i-c>Path to Exile</i-c> for something that matters. An early Path also ramps the opponent.",
        "<b>Grand Crescendo.</b> It's your wipe insurance. Don't cast it for two tokens on turn 3.",
        "<b>Intangible Virtue.</b> It does nothing without tokens. Cast it once tokens are coming."
      ] },
      { t: "h", text: "Land sequencing" },
      { t: "table", head: ["Land", "Best time to play it"], rows: [
        ["<i-c>Razorverge Thicket</i-c>", "Turns 1 to 3: untapped while you have two or fewer other lands"],
        ["<i-c>Overgrown Farmland</i-c>", "Turn 3 on: untapped once you have two other lands"],
        ["<i-c>Sunpetal Grove</i-c>", "After any Forest or Plains"],
        ["<i-c>Canopy Vista</i-c>", "After two basics, or fetched tapped by Farseek at any time"],
        ["<i-c>Bountiful Promenade</i-c>, <i-c>Command Tower</i-c>", "Any time: always untapped in a multiplayer game"],
        ["<i-c>Blossoming Sands</i-c>, <i-c>Graypelt Refuge</i-c>, <i-c>Restless Prairie</i-c>, <i-c>Scattered Groves</i-c>", "They enter tapped: a turn you don't need all your mana"],
        ["<i-c>Krosan Verge</i-c>", "Early. Pay {2} and sacrifice it for a Forest and a Plains"],
        ["<i-c>Selesnya Sanctuary</i-c>", "Turn 3 or later, returning a land you've already used"],
        ["Colorless lands like <i-c>Gavony Township</i-c> and <i-c>Rogue's Passage</i-c>", "Once you have both colors covered"]
      ] },
      { t: "callout", tone: "tip", title: "The Sanctuary trick", html: "Before you play <i-c>Selesnya Sanctuary</i-c>, tap the land you'll return for mana. The mana stays in your pool until the end of the phase, so the bounce costs you nothing this turn. Return a gain land like <i-c>Blossoming Sands</i-c>, and replaying it next turn gives another lifegain trigger." },
      { t: "h", text: "Example: turns 1 to 3" },
      { t: "p", html: "You're on the play. Your opening hand: <i-c>Forest</i-c>, <i-c>Plains</i-c>, <i-c>Razorverge Thicket</i-c>, <i-c>Llanowar Elves</i-c>, <i-c>Soul Warden</i-c>, <i-c>Arcane Signet</i-c> and <i-c>Grand Crescendo</i-c>. You draw <i-c>Hero of Bladehold</i-c> and a Plains." },
      { t: "turns", items: [
        { turn: "T1", play: "Forest, <i-c>Llanowar Elves</i-c>.", note: "Mana creature first." },
        { turn: "T2", play: "Plains. <i-c>Arcane Signet</i-c> with Forest and Elves, <i-c>Soul Warden</i-c> with the Plains.", note: "5 mana next turn." },
        { turn: "T3", play: "<i-c>Razorverge Thicket</i-c>, untapped because you have only two other lands. <i-c>Trostani, Selesnya's Voice</i-c> with Forest, Elves, Plains and Thicket. Soul Warden gains you 1.", note: "Engine online, one mana spare." }
      ] },
      { t: "p", html: "Notice what stayed in hand: Hero, the spare Plains and Grand Crescendo. The next chapter picks up from here." }
    ]
  },
  {
    id: "turns-4-6",
    title: "Turns 4 to 6: building the engine",
    kicker: "The build",
    minutes: 6,
    summary: "Which payoffs to cast first, how to bait removal, how much to commit before a wipe, and when to draw cards.",
    blocks: [
      { t: "p", html: "By turn 4 Trostani should be out or coming. Now you build a board that can win in two or three turns, without losing everything to one wipe." },
      { t: "h", text: "Payoff priority" },
      { t: "steps", items: [
        { title: "Trostani, if she isn't out yet", html: "Everything else is better with her on the battlefield." },
        { title: "A must-answer threat as bait", html: "<i-c>Hero of Bladehold</i-c>, <i-c>Adeline, Resplendent Cathar</i-c> or <i-c>Elspeth, Sun's Champion</i-c>. Each one wins the game if ignored, so opponents spend removal on them." },
        { title: "Then Archangel of Thune", html: "Cast it once the first removal spell is gone, when <i-c>Shalai, Voice of Plenty</i-c> is out, or when you can hold up <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c>." },
        { title: "Cathars' Crusade before a burst of tokens", html: "<i-c>Cathars' Crusade</i-c> does nothing on its own. Cast it when Elspeth, Hero or a big Grand Crescendo comes right after." },
        { title: "Nykthos Paragon with Trostani out", html: "Paragon's own arrival gains you 6 from Trostani, and Paragon is already there to see it: six +1/+1 counters on every creature you control, right away. Decline the small Soul Warden trigger and take the 6." }
      ] },
      { t: "h", text: "Bait, then the Angel" },
      { t: "p", html: "<i-c>Archangel of Thune</i-c> is the card every opponent knows. If it lands into open removal, it dies." },
      { t: "p", html: "So lead with the second-best threat. Hero, Adeline and Elspeth end games on their own, and a player holding one removal spell usually can't afford to wait. Once that spell is used, the Angel is much safer." },
      { t: "h", text: "How much to commit" },
      { t: "p", html: "A wipe against a full board is how this deck loses. Ask three questions before you cast your next creature." },
      { t: "steps", items: [
        { title: "Can I already win in two turns?", html: "If yes, more creatures add little. Hold the extras." },
        { title: "What do I have after a wipe?", html: "Keep at least one way to rebuild: a token maker in hand, <i-c>Elspeth, Sun's Champion</i-c>, <i-c>Grand Crescendo</i-c>, or a death trigger on board like <i-c>Voice of Resurgence</i-c>." },
        { title: "Is someone likely to wipe?", html: "A control player with open mana and a full hand is the warning sign. Commit two threats and keep the rest." }
      ] },
      { t: "callout", tone: "key", title: "Grand Crescendo for X=0", html: "You don't need tokens to use <i-c>Grand Crescendo</i-c>. For {W}{W} it's an instant that makes your creatures indestructible, which beats any destroy-all wipe. Keep two white mana open once your board is worth protecting." },
      { t: "h", text: "Spend your mana on their turn" },
      { t: "p", html: "Your mana untaps on your turn anyway. If you didn't need it during the round, spend it at the end of the turn right before yours." },
      { t: "list", items: [
        "Populate with Trostani ({1}{G}{W}).",
        "<i-c>Grand Crescendo</i-c> for X, making attackers for your turn.",
        "<i-c>Gavony Township</i-c> ({2}{G}{W}): a counter on every creature.",
        "<i-c>Walking Ballista</i-c>'s {4}: another counter."
      ] },
      { t: "p", html: "You kept protection up the whole round and still got full value." },
      { t: "callout", tone: "warn", title: "Resplendent Angel and Lathiel check early", html: "<i-c>Resplendent Angel</i-c> and <i-c>Lathiel, the Bounteous Dawn</i-c> look at the life you gained this turn at the <b>beginning</b> of the end step. Life gained during the end step comes too late. If you want the Angel on an opponent's turn, populate during their combat or when they pass in their second main phase. They'll get to act again after it, so weigh that." },
      { t: "h", text: "Skullclamp" },
      { t: "p", html: "<i-c>Skullclamp</i-c> is the deck's best card draw. Equip it to a 1/1 and the creature becomes a 2/0 and dies: two cards for {1}." },
      { t: "steps", items: [
        { title: "Attack first", html: "Let your 1/1 tokens deal their damage, then clamp them in your second main phase." },
        { title: "Clamp as many as you can afford", html: "Equip costs {1} each time, and the clamp stays on the battlefield after the creature dies. Three spare mana is six cards." },
        { title: "Stop before the kill turn", html: "Every token is damage for your overrun. When you're one turn from winning, keep the bodies." },
        { title: "Mind Intangible Virtue", html: "With <i-c>Intangible Virtue</i-c> out, tokens are 2/2, and a clamped one is a 3/1 that lives. Clamp a nontoken 1/1 instead, like a <i-c>Llanowar Elves</i-c> you no longer need, or skip it." }
      ] },
      { t: "callout", tone: "tip", title: "Clamp first, Virtue later", html: "With both in hand, clamp your 1/1s for a turn or two, then cast Virtue when you're ready to go wide." },
      { t: "h", text: "Your other card draw" },
      { t: "list", items: [
        "<i-c>Camaraderie</i-c>: draw cards and gain life equal to your creature count, and your team gets +1/+1 until end of turn. With <i-c>Nykthos Paragon</i-c> out, that one big gain is also that many counters on everything.",
        "<i-c>Shamanic Revelation</i-c>: a card per creature, plus 4 life for each one with 4 or more power.",
        "<i-c>Return of the Wildspeaker</i-c>: at instant speed, draw cards equal to your biggest non-Human's power.",
        "<i-c>Halo Fountain</i-c>: {W}{W} and untap two tapped creatures to draw one."
      ] },
      { t: "p", html: "Card draw is the deck's thinnest resource, so make each spell count. Camaraderie with three creatures is a weak card. With eight, it can win the game." },
      { t: "h", text: "Example: turns 4 to 6" },
      { t: "p", html: "Picking up the game from the last chapter. You have Trostani, <i-c>Soul Warden</i-c>, <i-c>Llanowar Elves</i-c> and <i-c>Arcane Signet</i-c> out, and <i-c>Hero of Bladehold</i-c>, <i-c>Grand Crescendo</i-c> and a Plains in hand." },
      { t: "p", html: "Over the next three turns you draw <i-c>Archangel of Thune</i-c>, <i-c>Sunpetal Grove</i-c> and <i-c>Elspeth, Sun's Champion</i-c>." },
      { t: "turns", items: [
        { turn: "T4", play: "Plains. <i-c>Hero of Bladehold</i-c>: Warden gains 1, Trostani 4. Thicket and Signet stay open for Crescendo. The Angel stays in hand.", note: "+5 life. Bait is out." },
        { turn: "Opp", play: "An opponent exiles Hero with a removal spell. You let it go: Crescendo is for the wipe.", note: "Their removal is spent." },
        { turn: "T5", play: "<i-c>Sunpetal Grove</i-c>. <i-c>Archangel of Thune</i-c>. Warden's 1 life resolves first, so Thune's counter makes it a 4/5, then Trostani gains 5. Two white mana stay open.", note: "+6 life, two counters on everything." },
        { turn: "Opp", play: "An opponent casts a destroy-all wipe. You respond with <i-c>Grand Crescendo</i-c> for X=0.", note: "Only your board survives." },
        { turn: "T6", play: "<i-c>Elspeth, Sun's Champion</i-c>, +1 for three Soldiers. The three Warden triggers go first, so Trostani sees 4, 5 and 6 toughness. Then Archangel of Thune, now 11/12, attacks in the air.", note: "+18 life, six more counters on everything." }
      ] },
      { t: "p", html: "Look at what you didn't do: you never put Hero and the Angel into the same removal window, and you had {W}{W} open on both turns that mattered." },
      { t: "p", html: "Next turn your creatures are huge and the other boards are still rebuilding. That's where the closing chapter starts." }
    ]
  },
  {
    id: "closing",
    title: "Turn 7 and later: closing",
    kicker: "The kill turn",
    minutes: 6,
    summary: "How to count lethal, which finisher fits which board, and how to split one attack across three opponents.",
    blocks: [
      { t: "p", html: "Most games end with one big attack. The difference between a win and a blowout is counting before you cast anything." },
      { t: "h", text: "Count lethal, step by step" },
      { t: "steps", items: [
        { title: "Count your attackers", html: "Untapped creatures that have been yours since the start of the turn, plus anything with haste. Tokens you made this turn can't attack unless something gives them haste." },
        { title: "Add the pump", html: "Work out the bonus from your finisher, and check which creatures it will actually reach." },
        { title: "Add the attack triggers", html: "<i-c>Hero of Bladehold</i-c> adds two attacking Soldiers and gives the other attackers +1/+0. <i-c>Adeline, Resplendent Cathar</i-c> adds one attacking Human per opponent." },
        { title: "Subtract the blockers", html: "Each untapped potential blocker can stop one attacker. With trample, a blocker only soaks up its toughness." },
        { title: "Split the attack", html: "Send each opponent at least their life plus their blockers' toughness. Send the rest at whoever is most dangerous." }
      ] },
      { t: "h", text: "A worked example" },
      { t: "p", html: "Your opponents are at 40, 28 and 19 life, and each has one untapped 3/3. You control Trostani, a 5/6 <i-c>Archangel of Thune</i-c> and seven 2/2 tokens. You cast <i-c>Craterhoof Behemoth</i-c>." },
      { t: "math", items: [
        { label: "Creatures you control with Hoof in", value: "10" },
        { label: "Hoof enters: Trostani gains you 5, so Thune puts a counter on each creature", value: "+1/+1 each" },
        { label: "Craterhoof's bonus to each", value: "+10/+10, trample" },
        { label: "Seven tokens, now 3/3, at 13 power", value: "91" },
        { label: "Archangel of Thune at 16 power", value: "16" },
        { label: "Craterhoof itself, with haste, at 16 power", value: "16" },
        { label: "Trostani at 13 power", value: "13" },
        { label: "Three 3/3 blockers soak 3 each from tramplers", value: "-9" }
      ], total: "<b>127</b> damage against <b>87</b> total life. Lethal on the whole table if you split it well." },
      { t: "p", html: "Blockers can only block creatures attacking their own controller, so plan each opponent's share with their blocker in mind." },
      { t: "table", head: ["Opponent", "Send", "After their block"], rows: [
        ["40 life", "Craterhoof and 3 tokens: 55", "52"],
        ["28 life", "Archangel and 2 tokens: 42", "39"],
        ["19 life", "Trostani and 2 tokens: 39", "36"]
      ] },
      { t: "callout", tone: "warn", title: "Tokens made after the pump don't get it", html: "Craterhoof, <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c>, <i-c>Return of the Wildspeaker</i-c> and <i-c>Finale of Devastation</i-c> pump only the creatures you control when they resolve. Hero's and Adeline's attack tokens arrive later and fight as 1/1s. <i-c>Jazal Goldmane</i-c> and <i-c>Beastmaster Ascension</i-c> do reach them." },
      { t: "widget", id: "lethalCalc" },
      { t: "p", html: "The calculator assumes nobody blocks, so subtract the blockers yourself." },
      { t: "h", text: "Which finisher for which board" },
      { t: "table", head: ["Finisher", "Best board", "Watch out"], rows: [
        ["<i-c>Craterhoof Behemoth</i-c>", "8 or more creatures that can attack", "Tokens made after it resolves get nothing"],
        ["<i-c>Overwhelming Stampede</i-c>", "One huge creature and a wide team", "X is your biggest power before the pump"],
        ["<i-c>Triumph of the Hordes</i-c>", "10 or more small attackers, opponents at high life", "Poison: 10 per player, so focus it"],
        ["<i-c>Beastmaster Ascension</i-c>", "7 or more creatures that can attack this turn", "Only declared attackers add counters"],
        ["<i-c>Jazal Goldmane</i-c>", "A wide attack and lots of spare mana", "{3}{W}{W} per activation"],
        ["<i-c>Return of the Wildspeaker</i-c>", "Mostly non-Humans, cast after blocks", "Humans get nothing"],
        ["<i-c>Mirror Entity</i-c>", "Many small creatures and lots of mana", "One big activation, not several small ones"],
        ["<i-c>Finale of Devastation</i-c>", "12 mana: X=10 and a free Craterhoof", "Below X=10 there's no pump"],
        ["<i-c>Blossoming Bogbeast</i-c>", "A turn where you gained a lot of life", "X is all the life gained this turn"],
        ["<i-c>Aetherflux Reservoir</i-c>", "Over 50 life, one player to finish", "Each shot costs 50 life"]
      ] },
      { t: "h", text: "Before combat or after blocks?" },
      { t: "p", html: "Sorcery-speed finishers go before combat, so opponents see them before they block. Instant-speed ones wait until blockers are declared, so opponents block blind." },
      { t: "list", items: [
        "<b>Before combat:</b> <i-c>Craterhoof Behemoth</i-c>, <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c>, <i-c>Finale of Devastation</i-c>, <i-c>Beastmaster Ascension</i-c>. <i-c>Rogue's Passage</i-c> also has to be used before blocks.",
        "<b>After blocks:</b> <i-c>Jazal Goldmane</i-c>, <i-c>Mirror Entity</i-c>, <i-c>Return of the Wildspeaker</i-c>, <i-c>Gavony Township</i-c>."
      ] },
      { t: "callout", tone: "tip", title: "Make them block blind", html: "With an instant-speed pump, attack with everything and let them assign blocks to a board of small creatures. Then pump, and count only the damage that gets through: unblocked creatures and tramplers." },
      { t: "h", text: "Splitting across opponents" },
      { t: "list", items: [
        "Kill who you can kill. A dead opponent can't wipe you or block next turn.",
        "If you can't kill anyone, hit the player most likely to beat you, usually the combo player.",
        "Put evasive creatures, like a flying Archangel of Thune, at the player with the most ground blockers.",
        "Adeline sends her Humans at every opponent automatically. Count one extra attacker per player."
      ] },
      { t: "h", text: "Commander damage" },
      { t: "p", html: "Trostani deals commander damage: 21 combat damage from her to one player over the game kills that player, whatever their life total." },
      { t: "p", html: "That matters when one opponent has gained a lot of life. Trostani pumped to 21 power only needs to connect once." },
      { t: "h", text: "Poison with Triumph of the Hordes" },
      { t: "p", html: "<i-c>Triumph of the Hordes</i-c> gives your creatures +1/+1, trample and infect until end of turn. Infect damage to a player becomes poison counters, and 10 poison kills. Life totals don't matter." },
      { t: "math", items: [
        { label: "12 attackers at 2 power, +1/+1 from Triumph", value: "3 poison each" },
        { label: "Four attackers at each opponent", value: "12 poison each" },
        { label: "Each opponent blocks one with a 2/2: trample lets 1 through", value: "-2 each" }
      ], total: "<b>10 poison</b> on every opponent. Exactly lethal on all three." },
      { t: "callout", tone: "warn", title: "Poison doesn't add up across players", html: "Each player needs 10 of their own. Nine poison on everyone kills nobody, so concentrate when you can't cover the whole table." },
      { t: "h", text: "Finale of Devastation for X=10" },
      { t: "steps", items: [
        { title: "Pay {X}{G}{G} with X=10", html: "That's 12 mana. <i-c>Fanatic of Rhonas</i-c> and <i-c>Vorinclex, Voice of Hunger</i-c> make it realistic." },
        { title: "Fetch the best creature", html: "Usually <i-c>Craterhoof Behemoth</i-c>. It's put onto the battlefield before the pump, so it gets the bonus too." },
        { title: "Everything gets +10/+10 and haste", html: "Even tokens you made this turn can attack." },
        { title: "Then Craterhoof's own trigger", html: "Another +X/+X and trample, where X is your creature count." }
      ] },
      { t: "p", html: "With six creatures before Finale, you have seven with Hoof. That's +10 and then +7: every creature gets +17/+17, haste and trample." }
    ]
  },
  {
    id: "combo-heliod-ballista",
    title: "Combo: Heliod and Walking Ballista",
    kicker: "Combo 1",
    minutes: 6,
    summary: "The infinite-damage combo from setup to announcement, and what to do when opponents respond.",
    blocks: [
      { t: "cards", names: ["Heliod, Sun-Crowned", "Walking Ballista"], caption: "Two cards, infinite damage, at instant speed." },
      { t: "p", html: "<i-c>Heliod, Sun-Crowned</i-c> puts a +1/+1 counter on a creature whenever you gain life, and for {1}{W} it gives another creature lifelink." },
      { t: "p", html: "<i-c>Walking Ballista</i-c> removes a counter to deal 1 damage. With lifelink, each ping gains 1 life, and each gain puts the counter back." },
      { t: "h", text: "What you need" },
      { t: "list", items: [
        "Heliod on the battlefield. It doesn't need to be a creature: its abilities work at any devotion.",
        "Walking Ballista with at least two +1/+1 counters.",
        "{1}{W} for the lifelink."
      ] },
      { t: "h", text: "The loop" },
      { t: "steps", items: [
        { title: "Give Ballista lifelink", html: "Pay {1}{W} and activate Heliod, targeting Walking Ballista. Let it resolve." },
        { title: "Ping", html: "Remove a counter from Ballista: it deals 1 damage to any target. Pick an opponent." },
        { title: "Gain 1", html: "Lifelink gains you 1 life." },
        { title: "Heliod puts the counter back", html: "Heliod's trigger puts a +1/+1 counter on target creature or enchantment you control. Target Ballista." },
        { title: "Repeat", html: "Ballista has as many counters as it started with. Go back to step 2 until every opponent is at 0." }
      ] },
      { t: "callout", tone: "key", title: "Why two counters, not one", html: "If Ballista has one counter and you remove it, it's a 0/0 and dies before the ping resolves. You still deal the damage and gain the life, but Heliod's trigger has no Ballista to target, and the loop ends." },
      { t: "widget", id: "ballistaSim" },
      { t: "h", text: "Setups from different starting points" },
      { t: "table", head: ["You start with", "Do this", "Mana"], rows: [
        ["Heliod out", "Cast Ballista with X=2, then pay {1}{W}", "6"],
        ["Heliod plus Trostani, <i-c>Soul Warden</i-c>, <i-c>Prosperous Innkeeper</i-c> or <i-c>Cathars' Crusade</i-c>", "Cast Ballista with X=1. Its arrival gains you life, so Heliod adds a second counter (Crusade adds one directly). Then {1}{W}", "4"],
        ["Ballista out with 2 or more counters", "Cast Heliod, then {1}{W}", "5"],
        ["Ballista out with 1 counter", "Cast Heliod, then gain any life, like a gain land or a creature entering with Trostani out. Or pay {4} for Ballista's own counter. Then {1}{W}", "5 to 9"],
        ["Ballista out with 2 or more counters, Heliod in your library or graveyard", "<i-c>Finale of Devastation</i-c> with X=3 puts Heliod onto the battlefield. Then {1}{W}", "7"],
        ["Ballista in your graveyard, Heliod and Trostani out", "<i-c>Lazotep Quarry</i-c> for X=0: a 4/4 Zombie copy of Ballista with no counters. Trostani gains 4, Heliod gives it a counter. Then {1}{W}", "4"]
      ] },
      { t: "p", html: "The Lazotep Quarry line works because the Zombie copy is a 4/4 on its own. Removing its only counter doesn't kill it, so a single counter is enough to loop. The Quarry ability is sorcery speed." },
      { t: "h", text: "What to announce" },
      { t: "steps", items: [
        { title: "Name the pieces", html: "'Heliod is out and Ballista has two counters. I pay {1}{W} to give Ballista lifelink.' Then stop and let people respond." },
        { title: "Once it resolves, state the loop", html: "'I remove a counter to ping, gain 1, and Heliod puts it back. I'll do that 40 times at each of you.'" },
        { title: "Use their real life totals", html: "The number of loops is simply the total life of the opponents you're killing. At 40, 28 and 19, that's 87." },
        { title: "Shortcut it", html: "Nobody wants 87 separate pings. Opponents can still respond during the loop, and the loop stops wherever they do." }
      ] },
      { t: "h", text: "What opponents can do" },
      { t: "qa", items: [
        { q: "They try to kill Ballista in response to the lifelink activation?", a: "Remove all its counters in response and ping with each one. Lifelink hasn't resolved yet, so you gain nothing, but the damage still happens. Aim it where it hurts most." },
        { q: "They try to kill Ballista mid-loop?", a: "Same answer: in response, remove its remaining counters and ping. You keep all the damage you've already dealt." },
        { q: "They exile or bounce Heliod?", a: "The loop stops once Heliod is gone, though any Heliod trigger already on the stack still resolves. Destroy effects do nothing: Heliod is indestructible." },
        { q: "They counter Ballista or Heliod?", a: "Cast the second piece when the blue player is tapped out, or after they've spent a counterspell on something else. Heliod's lifelink and Ballista's pings are abilities, so ordinary counterspells can't stop them once the pieces are down." },
        { q: "Someone has a 'players can't gain life' effect out?", a: "Then lifelink gains nothing and Heliod never triggers. Remove that permanent first with <i-c>Beast Within</i-c> or <i-c>Generous Gift</i-c>." },
        { q: "How do I protect the pieces?", a: "<i-c>Shalai, Voice of Plenty</i-c> gives Ballista hexproof, and Heliod too while it's a creature. As a noncreature enchantment, Heliod isn't covered." }
      ] },
      { t: "callout", tone: "tip", title: "Order the pieces", html: "Heliod is a strong engine by itself, so it draws removal. Ballista for X=2 looks harmless. Often the best line is to land one piece quietly, then cast the other on a turn when you also have {1}{W} spare, so the whole combo happens at once." },
      { t: "h", text: "Finding the pieces" },
      { t: "p", html: "<i-c>Finale of Devastation</i-c> with X=3 ({3}{G}{G}) puts Heliod onto the battlefield from your library or graveyard. Heliod is an enchantment creature card, so Finale can find it." },
      { t: "callout", tone: "warn", title: "Never Finale for Walking Ballista", html: "Ballista's counters come from the X you pay when you <b>cast</b> it. Put onto the battlefield by Finale, its X is 0, so it enters with no counters and dies at once." },
      { t: "p", html: "Without Finale, just play normally and let the combo come to you. It's a bonus: in the speed test it decided about 2.6% of games." }
    ]
  },
  {
    id: "combo-spike-feeder",
    title: "Combo: Spike Feeder loops",
    kicker: "Combo 2",
    minutes: 5,
    summary: "How Spike Feeder turns Heliod, Archangel of Thune or Cleric Class into infinite life, and how to turn that life into a win.",
    blocks: [
      { t: "cards", names: ["Spike Feeder", "Heliod, Sun-Crowned", "Archangel of Thune", "Cleric Class"], caption: "Spike Feeder plus any one of the three engines." },
      { t: "p", html: "<i-c>Spike Feeder</i-c> enters with two +1/+1 counters. Removing one gains you 2 life, and it costs no mana." },
      { t: "p", html: "Each engine puts a counter back whenever you gain life. So the Feeder never runs out, and you can repeat the loop as often as you like." },
      { t: "h", text: "The loop with each engine" },
      { t: "steps", items: [
        { title: "With Heliod", html: "Remove a counter: gain 2. Heliod's trigger targets Spike Feeder and the counter comes back. Infinite life." },
        { title: "With Archangel of Thune", html: "Remove a counter: gain 2. Thune puts a counter on <b>each</b> creature you control, Feeder included. Infinite life, and every creature you control gets +1/+1 per loop." },
        { title: "With Cleric Class at level 2", html: "Level 1 makes each gain 1 bigger, so you gain 3. Level 2 puts a counter on target creature you control: target Feeder. Infinite life." }
      ] },
      { t: "callout", tone: "key", title: "Keep two counters", html: "Start with Feeder at two or more counters. Removing its last counter makes it a 0/0 that dies before the counter comes back." },
      { t: "p", html: "The loop needs no mana and works at instant speed. You can do it in response to removal, or at the end of an opponent's turn." },
      { t: "p", html: "Setup cost: Feeder is {1}{G}{G}. Heliod is 3 mana, Archangel of Thune 5, and Cleric Class 1 plus {3}{W} to reach level 2, at sorcery speed." },
      { t: "p", html: "<i-c>Finale of Devastation</i-c> with X=3 finds either Feeder or Heliod." },
      { t: "widget", id: "feederSim" },
      { t: "h", text: "What infinite life does" },
      { t: "list", items: [
        "Damage and life loss can't bring you down any more. The exception is 21 commander damage, covered below.",
        "It turns on <i-c>Speaker of the Heavens</i-c> (47 or more life) and makes <i-c>Resplendent Angel</i-c> trigger at the end step.",
        "It powers the payoffs below."
      ] },
      { t: "h", text: "What it doesn't do" },
      { t: "list", items: [
        "It doesn't win by itself.",
        "It doesn't stop poison, 21 commander damage from one commander, or effects that say you lose the game.",
        "It doesn't stop exile, sacrifice or bounce.",
        "A 'players can't gain life' effect shuts the whole loop off."
      ] },
      { t: "h", text: "The payoffs" },
      { t: "steps", items: [
        { title: "Aetherflux Reservoir", html: "Pay 50 life: 50 damage to any target. Loop until you have enough, then shoot each opponent. Three opponents at 40 need three shots, so 150 life plus a cushion to stay alive." },
        { title: "Archangel of Thune plus Walking Ballista", html: "If Thune is the engine and <i-c>Walking Ballista</i-c> is on the battlefield, every loop gives Ballista a counter too. Loop 120 times, then remove the counters to ping every opponent to death. No attack needed." },
        { title: "Archangel of Thune and an attack", html: "Every creature you control gets as big as you like. Blockers can still stop non-tramplers, so add <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c> or <i-c>Rogue's Passage</i-c>." },
        { title: "Soul of Eternity", html: "<i-c>Soul of Eternity</i-c>'s power and toughness equal your life total. Make it unblockable with <i-c>Rogue's Passage</i-c>, or cast <i-c>Overwhelming Stampede</i-c>: X is Soul's power, so every creature gets that bonus and trample." },
        { title: "Lathiel, the Bounteous Dawn", html: "At the beginning of each end step, if you gained life this turn, <i-c>Lathiel, the Bounteous Dawn</i-c> distributes that many +1/+1 counters. Loop before the end step starts, then put the counters on Walking Ballista and ping, or on your attackers for next turn." },
        { title: "Shalai, Voice of Plenty", html: "Not a win, but the best way to keep the loop alive. <i-c>Shalai, Voice of Plenty</i-c> gives Feeder, Thune and Ballista hexproof, and gives you hexproof too." }
      ] },
      { t: "callout", tone: "tip", title: "Heliod's version needs a second payoff", html: "With Heliod as the engine, each loop's counter has to go back on Feeder, so nothing else grows. You'll need <i-c>Aetherflux Reservoir</i-c>, <i-c>Soul of Eternity</i-c> or <i-c>Lathiel, the Bounteous Dawn</i-c> to finish." },
      { t: "h", text: "Announcing it" },
      { t: "p", html: "You can't say 'infinite'. Name a number: 'I loop 200 times and go to 440 life,' then use the payoff. With Thune as the engine, say how big the team gets too." },
      { t: "qa", items: [
        { q: "Can Spike Feeder use counters from other cards?", a: "Yes. Any +1/+1 counter on it can be removed, whether it came from Feeder's own entry, Archangel of Thune, <i-c>Cathars' Crusade</i-c> or Lathiel." },
        { q: "Can I loop in response to a board wipe?", a: "Yes, it's instant speed and free. The creatures still die, but you can gain the life and fire <i-c>Aetherflux Reservoir</i-c> before the wipe resolves." },
        { q: "Does Nykthos Paragon go infinite with it?", a: "No. <i-c>Nykthos Paragon</i-c> works once per turn, so it gives one round of counters from one gain, not infinite." },
        { q: "What about Feeder's other ability?", a: "{2} and a counter moves a counter to target creature. It's a slow way to grow an evasive attacker. In the loop you only use the free lifegain ability." }
      ] }
    ]
  },
  {
    id: "halo-fountain",
    title: "The alternate win: Halo Fountain",
    kicker: "Fifteen untaps",
    minutes: 4,
    summary: "How to set up Halo Fountain's fifteen-untap win, when to use its smaller abilities, and the Intangible Virtue trap.",
    blocks: [
      { t: "cards", names: ["Halo Fountain"], caption: "Printed as Cascade of Song in this deck." },
      { t: "p", html: "<i-c>Halo Fountain</i-c> has three abilities. Each one taps the Fountain and untaps some of your tapped creatures." },
      { t: "list", items: [
        "{W}, {T}, untap one tapped creature: create a 1/1 Citizen.",
        "{W}{W}, {T}, untap two tapped creatures: draw a card.",
        "{W}{W}{W}{W}{W}, {T}, untap fifteen tapped creatures: you win the game."
      ] },
      { t: "p", html: "The Fountain only untaps in your untap step, so you get one activation per round. Using a small ability means no win that round." },
      { t: "h", text: "The win, step by step" },
      { t: "steps", items: [
        { title: "Have the Fountain untapped", html: "It's an artifact, so summoning sickness doesn't apply. You can use it the turn you cast it." },
        { title: "Have five white mana", html: "Plains, dual lands, <i-c>Command Tower</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Avacyn's Pilgrim</i-c>, a Treasure. Count it before combat." },
        { title: "Get fifteen creatures tapped", html: "The easy way is to attack with them. Creatures without vigilance tap when they're declared as attackers." },
        { title: "Activate once attackers are declared", html: "The win ability has no timing restriction. As soon as your attackers are declared and tapped, activate it in the declare attackers step, before anyone blocks." },
        { title: "Untap fifteen and win", html: "Pay {W}{W}{W}{W}{W}, tap the Fountain and untap fifteen tapped creatures you control. The game is over." }
      ] },
      { t: "math", items: [
        { label: "Attackers without vigilance, Hero of Bladehold among them", value: "10" },
        { label: "Hero's two Soldiers, created tapped and attacking", value: "2" },
        { label: "Adeline's Humans, one per opponent, tapped and attacking", value: "3" },
        { label: "Adeline herself: vigilance, so she stays untapped", value: "0" }
      ], total: "<b>15</b> tapped creatures. Activate the Fountain before blockers and win." },
      { t: "callout", tone: "warn", title: "The Intangible Virtue trap", html: "<i-c>Intangible Virtue</i-c> gives your tokens vigilance. Vigilant attackers don't tap, so with Virtue out, attacking with twenty tokens might tap none of them." },
      { t: "p", html: "Tokens that are <b>created</b> tapped and attacking still count. Hero of Bladehold's Soldiers and Adeline's Humans enter tapped, vigilance or not." },
      { t: "h", text: "Other ways to tap your creatures" },
      { t: "list", items: [
        "<b>Convoke.</b> <i-c>Hour of Reckoning</i-c> has it, and <i-c>Dazzling Theater // Prop Room</i-c> gives it to your creature spells. Each creature you tap pays {1} or one mana of its color.",
        "<b>Mana creatures.</b> Tapping <i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Avacyn's Pilgrim</i-c> or <i-c>Fanatic of Rhonas</i-c> for mana leaves them tapped. Pilgrim's {W} can even help pay for the Fountain.",
        "<b>Springleaf Drum.</b> <i-c>Springleaf Drum</i-c> taps a creature for one mana of any color.",
        "<b>Crew.</b> Crewing <i-c>Esika's Chariot</i-c> taps creatures with total power 4 or more.",
        "<b>Grove of the Guardian.</b> <i-c>Grove of the Guardian</i-c>'s cost taps two creatures.",
        "<b>Tap abilities.</b> Trostani's populate, <i-c>Speaker of the Heavens</i-c> and <i-c>Crashing Drawbridge</i-c> tap themselves."
      ] },
      { t: "callout", tone: "tip", title: "Summoning sickness doesn't matter here", html: "Convoke, crew, Springleaf Drum and Grove of the Guardian can all tap creatures that arrived this turn, and the Fountain can untap them. Only a creature's own {T} abilities need it to have been yours since your turn began." },
      { t: "h", text: "Using the small abilities" },
      { t: "p", html: "Most games you'll use the Fountain for value. After combat, pay {W} and untap an attacker to make a Citizen. That's two untapped blockers and a Trostani trigger for one mana." },
      { t: "p", html: "Or pay {W}{W}, untap two attackers and draw a card. If you're close to fifteen tapped creatures next turn, save it for the win instead." },
      { t: "qa", items: [
        { q: "Do the fifteen need to have attacked?", a: "No. They only need to be tapped creatures you control, however they got tapped." },
        { q: "Can I win on an opponent's turn?", a: "The ability works at instant speed, so yes, if you have fifteen tapped creatures and five white mana then. That's rare, because your creatures untap in your untap step, and with Prop Room during everyone's." },
        { q: "Do Conclave Evangelist's myriad copies count?", a: "Yes, while they exist. They enter tapped and attacking and are exiled at end of combat, so activate the Fountain during combat." },
        { q: "Why not wait for combat damage?", a: "The win doesn't care about damage, and waiting only gives opponents time. Blocks can kill some of your tapped attackers, and a dead creature can't be untapped." },
        { q: "Can I use Halo Fountain twice in one turn?", a: "Not unless something untaps it. Every ability costs {T}, and nothing in this deck untaps artifacts." }
      ] }
    ]
  },
  {
    id: "defense",
    title: "Defense: wipes, removal and protection",
    kicker: "Staying alive",
    minutes: 4,
    summary: "How to handle board wipes and removal, how to rebuild, and where to aim your own removal.",
    blocks: [
      { t: "p", html: "This deck spreads its value across many permanents. That makes it hard to beat with spot removal and easy to hurt with a board wipe. Most of your defense is about the wipe." },
      { t: "h", text: "Know the wipe" },
      { t: "table", head: ["Wipe type", "What saves you", "What doesn't"], rows: [
        ["Destroy all creatures", "<i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> in response. Heliod is indestructible anyway", "<i-c>Shalai, Voice of Plenty</i-c>: wipes don't target"],
        ["-X/-X, like Toxic Deluge", "<i-c>Voice of Resurgence</i-c>: its Elemental arrives after the wipe. Cards in hand", "Indestructible. <i-c>Elenda's Hierophant</i-c> shrinks too, so it leaves few Vampires or none"],
        ["Exile all creatures", "Cards in hand and your noncreature permanents", "Indestructible and death triggers"],
        ["Return all to hand", "Nontoken creatures come back to your hand to recast", "Tokens: they're gone for good"],
        ["Each player sacrifices", "Sacrifice a token", "Hexproof and indestructible"]
      ] },
      { t: "h", text: "When an opponent casts a wipe" },
      { t: "steps", items: [
        { title: "Check the type", html: "A destroy effect? Indestructible saves you. Anything else? Let it resolve and plan the rebuild." },
        { title: "Respond with protection", html: "<i-c>Grand Crescendo</i-c> (X can be 0) or <i-c>Rootborn Defenses</i-c>. Both are instants that make your creatures indestructible until end of turn." },
        { title: "Cash in what dies anyway", html: "Before it resolves, remove <i-c>Spike Feeder</i-c>'s counters for life, ping with <i-c>Walking Ballista</i-c>'s counters, and sacrifice a creature to <i-c>Lazotep Quarry</i-c> for mana." },
        { title: "Send Trostani to the command zone", html: "She comes back for 2 more mana." }
      ] },
      { t: "callout", tone: "tip", title: "Crescendo's X still matters", html: "When you cast <i-c>Grand Crescendo</i-c> in response to a destroy wipe, the Citizens are created before the indestructible part, so they survive too. Each one is also a Trostani trigger." },
      { t: "h", text: "What survives a creature wipe" },
      { t: "p", html: "Your noncreature permanents stay. That's <i-c>Cathars' Crusade</i-c>, <i-c>Intangible Virtue</i-c>, <i-c>Beastmaster Ascension</i-c>, <i-c>Elspeth, Sun's Champion</i-c> and <i-c>Halo Fountain</i-c>. Also <i-c>Esika's Chariot</i-c> when it isn't crewed, and Heliod while it isn't a creature." },
      { t: "p", html: "Rebuild around them. A wipe that leaves you Elspeth, Crusade and Virtue is a setback, not a loss." },
      { t: "h", text: "Rebuilding, step by step" },
      { t: "steps", items: [
        { title: "Recast Trostani first", html: "At 6 mana she's still the best card to restart with, because every creature after her gains you life." },
        { title: "Then the token makers", html: "Elspeth's +1, <i-c>Esika's Chariot</i-c> and <i-c>Hero of Bladehold</i-c> rebuild a board in a turn or two." },
        { title: "Use instant speed", html: "<i-c>Grand Crescendo</i-c> at the end of the turn before yours gives you attackers without exposing them to a sorcery-speed wipe first." },
        { title: "Don't dump your hand again", html: "The player who wiped may have another. Rebuild to threatening, not to everything you have." }
      ] },
      { t: "h", text: "Hour of Reckoning is your wipe" },
      { t: "p", html: "<i-c>Hour of Reckoning</i-c> destroys all <b>nontoken</b> creatures. When your board is tokens and theirs is real cards, it's one-sided." },
      { t: "steps", items: [
        { title: "Check what you lose", html: "Trostani, Archangel of Thune and your other nontoken creatures die too. Heliod survives: it's indestructible." },
        { title: "Or protect your own", html: "Cast Hour, then cast <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> in response. Your creatures are indestructible when Hour resolves. Theirs aren't." },
        { title: "Pay with convoke", html: "Tap tokens to help pay its {4}{W}{W}{W}. Convoke taps them, so cast it on a turn you won't attack, or after combat with creatures that are still untapped." },
        { title: "Collect the death triggers", html: "If <i-c>Voice of Resurgence</i-c> dies to it, you get an Elemental sized to your board." }
      ] },
      { t: "h", text: "Spot removal on your creatures" },
      { t: "list", items: [
        "<i-c>Shalai, Voice of Plenty</i-c> gives you and your other creatures hexproof. Opponents will aim at Shalai first, which is fine: that's one less spell for your Angel.",
        "Against a destroy spell on a key creature, <i-c>Grand Crescendo</i-c> for X=0 saves it. Only spend it that way on Thune, Trostani or a combo piece.",
        "In response to removal, sacrifice the target to <i-c>Lazotep Quarry</i-c> for mana. If it's <i-c>Voice of Resurgence</i-c> or <i-c>Elenda's Hierophant</i-c>, you still get their tokens.",
        "Against exile, <i-c>Beast Within</i-c> on your own creature at least leaves you a 3/3 Beast."
      ] },
      { t: "h", text: "Where to aim your removal" },
      { t: "table", head: ["Card", "Best targets"], rows: [
        ["<i-c>Swords to Plowshares</i-c>, <i-c>Path to Exile</i-c>", "Combo creatures, a commander that runs the other deck, a lethal attacker. Early on, prefer Swords: Path gives them a land."],
        ["<i-c>Beast Within</i-c>, <i-c>Generous Gift</i-c>", "Anything: a combo artifact or enchantment, a planeswalker, a stax piece, even a key land. They're instants, so hold them for the combo turn."],
        ["<i-c>Break Down</i-c>, <i-c>Sundering Growth</i-c>", "Artifacts and enchantments: a runaway player's mana rocks, equipment, stax."],
        ["<i-c>Excavation Technique</i-c>", "Any nonland permanent, at sorcery speed. It gives them two Treasures."],
        ["<i-c>Walking Ballista</i-c>", "Mana creatures and other X/1s."],
        ["<i-c>Elspeth, Sun's Champion</i-c>'s -3", "Big creatures, when your own are small."]
      ] },
      { t: "callout", tone: "warn", title: "Don't fire at the first creature you see", html: "You have eight removal spells in 99 cards. Spend them on things that would beat you, not on things that are merely annoying." }
    ]
  },
  {
    id: "reading-the-table",
    title: "Reading the table",
    kicker: "Threats and matchups",
    minutes: 3,
    summary: "How to decide who the threat is, who to attack, what to say, and how to play against each kind of deck.",
    blocks: [
      { t: "p", html: "In a four-player game you're not just racing. You're deciding who to slow down, and trying not to look like the biggest threat until you are one." },
      { t: "h", text: "Threat assessment, in order" },
      { t: "steps", items: [
        { title: "Who can win soonest?", html: "A combo player with their pieces nearly assembled, or a board that kills next turn. That's your first target for removal and attacks." },
        { title: "Who can stop you?", html: "The player with wipes and open mana. You want them tapped out on your big turn." },
        { title: "Who's ahead on resources?", html: "The most cards in hand, the most mana, the best engine on board." },
        { title: "Who's out of the game?", html: "Leave them alone unless killing them is free. A player at 5 life with no cards isn't why you'll lose." }
      ] },
      { t: "h", text: "What the table sees" },
      { t: "p", html: "Lifegain makes you look safe, and a wide board makes you look scary. Opponents will point at your 60 life." },
      { t: "p", html: "Answer with facts. The board that kills next turn is the threat, not your life total." },
      { t: "list", items: [
        "Don't overstate your position, and don't make promises you'll break.",
        "Deals that cost you nothing are fine: 'I won't attack you this turn if you leave my Angel alone.'",
        "Your life total is a resource. At 70 life, take the hit instead of chump-blocking with tokens you need for the overrun."
      ] },
      { t: "h", text: "Who to attack" },
      { t: "list", items: [
        "The combo player, early and often. Damage forces them to spend cards and blockers on defense.",
        "The player with the fewest untapped blockers, when you just want damage in.",
        "Not the player who can crack back hardest, unless you can kill them.",
        "Adeline sends a Human at each opponent anyway, so she spreads pressure for you.",
        "Finish a player when you can. A dead opponent can't wipe the board."
      ] },
      { t: "h", text: "Against control and board wipes" },
      { t: "list", items: [
        "Commit two or three threats at a time, not your whole hand.",
        "<i-c>Voice of Resurgence</i-c> punishes instant-speed removal on your turn.",
        "Cast <i-c>Grand Crescendo</i-c> at the end of their turn: an army from nothing, after their sorcery window has passed.",
        "Keep Grand Crescendo or <i-c>Rootborn Defenses</i-c> up once your board is worth protecting."
      ] },
      { t: "h", text: "Against combo decks" },
      { t: "list", items: [
        "You have no counterspells. Your answers are pressure and instant-speed removal.",
        "Attack the combo player first. Save <i-c>Beast Within</i-c>, <i-c>Generous Gift</i-c> and <i-c>Swords to Plowshares</i-c> for their key piece.",
        "<i-c>Walking Ballista</i-c> can snipe small combo creatures.",
        "Race when you can: your own combos also win at instant speed."
      ] },
      { t: "h", text: "Against aggro and voltron" },
      { t: "list", items: [
        "Your life total is a resource, and tokens make good chump blockers when it matters.",
        "Keep gaining: every creature entering buys you time.",
        "<i-c>Swords to Plowshares</i-c> or <i-c>Path to Exile</i-c> on a suited-up commander is a huge swing.",
        "<i-c>Shalai, Voice of Plenty</i-c> stops targeted burn at your face.",
        "<i-c>Elspeth, Sun's Champion</i-c>'s -3 kills big creatures and usually spares your tokens."
      ] },
      { t: "h", text: "Against stax and artifacts" },
      { t: "list", items: [
        "<i-c>Break Down</i-c>, <i-c>Sundering Growth</i-c>, <i-c>Excavation Technique</i-c>, <i-c>Beast Within</i-c> and <i-c>Generous Gift</i-c> handle rocks, equipment and stax pieces.",
        "Your land ramp (<i-c>Nature's Lore</i-c>, <i-c>Farseek</i-c>, <i-c>Cultivate</i-c>) dodges artifact hate.",
        "Kill the piece that hurts you most, not the one that hurts everyone. Let the others spend removal on shared problems."
      ] },
      { t: "h", text: "Quick reference" },
      { t: "table", head: ["Opponent", "Your plan", "Key cards"], rows: [
        ["Control", "Commit in waves, rebuild at instant speed", "<i-c>Voice of Resurgence</i-c>, <i-c>Grand Crescendo</i-c>"],
        ["Combo", "Pressure them and hold removal", "<i-c>Swords to Plowshares</i-c>, <i-c>Beast Within</i-c>"],
        ["Aggro, voltron", "Chump, keep gaining, remove the big one", "<i-c>Path to Exile</i-c>, <i-c>Shalai, Voice of Plenty</i-c>"],
        ["Stax, artifacts", "Remove the piece that hurts you", "<i-c>Break Down</i-c>, <i-c>Generous Gift</i-c>"]
      ] }
    ]
  },
  {
    id: "bracket-4",
    title: "Against Bracket 4 tables",
    kicker: "Punching up",
    minutes: 3,
    summary: "What changes when the table has fast mana, free counterspells, tutors and compact combos, and how to adjust.",
    blocks: [
      { t: "p", html: "Bracket 4 decks play the strongest cards with few limits: fast mana, free counterspells, tutors, and two-card combos that can win in the midgame." },
      { t: "p", html: "This is a Bracket 3 deck, so against them you're the underdog. You can still win, but you play a different game: faster, tighter, and more patient with your removal." },
      { t: "h", text: "What changes" },
      { t: "table", head: ["They have", "What it means", "Your adjustment"], rows: [
        ["Fast mana", "Big threats on turns 2 and 3", "Mulligan harder for turn-1 ramp"],
        ["Free counterspells", "Your key spell can be countered even when they're tapped out", "Bait with a lesser threat first"],
        ["Tutors", "Their combo shows up on schedule", "Hold removal for the combo piece"],
        ["Compact combos", "They can win out of nowhere", "Keep 1 to 3 mana open on their turns"],
        ["Efficient wipes", "Toxic Deluge style wipes ignore indestructible", "Commit less, keep rebuilds in hand"]
      ] },
      { t: "h", text: "Plan 1: race" },
      { t: "steps", items: [
        { title: "Keep fast hands", html: "A turn-1 mana creature or <i-c>Sol Ring</i-c> matters more here. A hand that does nothing until turn 4 rarely catches up." },
        { title: "Pressure early", html: "<i-c>Adeline, Resplendent Cathar</i-c> and <i-c>Hero of Bladehold</i-c> attack from the turn after they land. Damage forces combo players to spend cards on blockers and defense." },
        { title: "Aim for your combo", html: "Heliod plus <i-c>Walking Ballista</i-c> is your fastest kill, and once the pieces are down it's all abilities." }
      ] },
      { t: "h", text: "Plan 2: hold interaction" },
      { t: "steps", items: [
        { title: "Know their pieces", html: "Ask what their commander does. Most Bracket 4 combos need a specific creature, artifact or enchantment to stay on the battlefield." },
        { title: "Keep mana up on their turn", html: "<i-c>Swords to Plowshares</i-c> and <i-c>Path to Exile</i-c> cost one {W}. Leave it open when a combo player could go off." },
        { title: "Hit the piece that's already down", html: "When they try to add the last piece, remove the one already on the battlefield. <i-c>Beast Within</i-c> and <i-c>Generous Gift</i-c> hit any permanent at instant speed." },
        { title: "Don't fire early for nothing", html: "Removal on a harmless creature is removal you won't have for the combo." }
      ] },
      { t: "h", text: "Don't overextend" },
      { t: "p", html: "Toxic Deluge style wipes shrink every creature until it dies. Indestructible doesn't help, so <i-c>Grand Crescendo</i-c> and <i-c>Rootborn Defenses</i-c> won't save you." },
      { t: "list", items: [
        "Keep two or three threats on board and the rest in hand.",
        "<i-c>Voice of Resurgence</i-c> still leaves an Elemental behind, because the token arrives after the wipe.",
        "<i-c>Elspeth, Sun's Champion</i-c>, an uncrewed <i-c>Esika's Chariot</i-c> and enchantments like <i-c>Cathars' Crusade</i-c> survive creature wipes."
      ] },
      { t: "h", text: "Baiting counterspells" },
      { t: "steps", items: [
        { title: "Lead with the second-best spell", html: "Cast <i-c>Hero of Bladehold</i-c> before <i-c>Archangel of Thune</i-c>, and <i-c>Elspeth, Sun's Champion</i-c> before <i-c>Craterhoof Behemoth</i-c>." },
        { title: "Win with abilities, not spells", html: "Heliod's lifelink, Ballista's pings, <i-c>Jazal Goldmane</i-c>, <i-c>Mirror Entity</i-c> and <i-c>Gavony Township</i-c> are activated abilities. A normal counterspell can't touch them." },
        { title: "Act in the end step before your turn", html: "Cast <i-c>Grand Crescendo</i-c> in the end step of the player before you. Mana an opponent spends to counter it stays tapped through your turn, so your big spells are safer." },
        { title: "Punish them with Voice", html: "<i-c>Voice of Resurgence</i-c> makes an Elemental whenever an opponent casts a spell during your turn. Counterspells count." }
      ] },
      { t: "callout", tone: "warn", title: "Be honest about the matchup", html: "The speed test's median kill is turn 9, against opponents who do nothing. Many Bracket 4 decks aim to win before that. Your best games come from stopping one combo attempt and killing before the next one." },
      { t: "p", html: "Want practice? The Play tab deals you Bracket 4 bots, or retail precons to warm up on." },
      { t: "widget", id: "playCta" }
    ]
  },
  {
    id: "tricky-interactions",
    title: "Tricky interactions",
    kicker: "Rules Q&A",
    minutes: 13,
    summary: "The rules questions that actually come up with this list, answered precisely.",
    blocks: [
      { t: "p", html: "Every answer here is about cards in this deck. Use it as a reference: skim the headings and open what you need." },
      { t: "h", text: "Triggers and lifegain" },
      { t: "qa", items: [
        { q: "Does Trostani use the creature's toughness when it enters, or when her trigger resolves?", a: "When the trigger resolves. That's why you let counter triggers resolve first. If the creature has already left the battlefield, she uses its toughness as it last existed there." },
        { q: "Tokens that enter together: one trigger or several?", a: "Several. Three Soldiers from Elspeth are three Trostani triggers, three <i-c>Soul Warden</i-c> triggers and three <i-c>Cathars' Crusade</i-c> triggers." },
        { q: "What counts as one lifegain event?", a: "Each trigger or effect that gains you life is one event, however big. Each creature with lifelink that deals damage is its own event too, even when several deal combat damage at once. <i-c>Archangel of Thune</i-c>, Heliod and <i-c>Ajani's Pridemate</i-c> trigger once per event." },
        { q: "Does Cleric Class add 1 to every gain?", a: "Yes. At level 1, <i-c>Cleric Class</i-c> adds 1 to each separate lifegain event. <i-c>Soul Warden</i-c> gains 2, <i-c>Spike Feeder</i-c> gains 3, and Trostani seeing a 4-toughness creature gains 5." },
        { q: "Does Soul Warden trigger on opponents' creatures?", a: "Yes, on any other creature entering. With Archangel of Thune out, each creature that enters under an opponent's control puts a counter on each of yours. <i-c>Prosperous Innkeeper</i-c> only counts your own creatures." },
        { q: "Do I have to use a Nykthos Paragon trigger?", a: "No, it's optional, and it works only once each turn. Decline the small gains and take a big one. That's once on your turn and once on each opponent's turn." },
        { q: "What happens when Nykthos Paragon enters with Trostani out?", a: "Trostani gains you 6, the toughness of <i-c>Nykthos Paragon</i-c>, and Paragon is already on the battlefield to see it. You can put six +1/+1 counters on each creature you control at once." },
        { q: "I populated in an opponent's end step and gained 8. Why no Resplendent Angel token?", a: "<i-c>Resplendent Angel</i-c> checks at the beginning of the end step. Life gained during the end step is too late for that turn. <i-c>Lathiel, the Bounteous Dawn</i-c> works the same way." },
        { q: "What does Walking Ballista for X=0 do?", a: "It enters with no counters and dies at once. It still counts as a spell cast (<i-c>Aetherflux Reservoir</i-c>, <i-c>Song of the Worldsoul</i-c>) and as a creature entering (Soul Warden, Innkeeper, Cathars' Crusade). Trostani gains nothing from a 0-toughness creature. You lose a combo piece, so it's rarely worth it." },
        { q: "When does Speaker of the Heavens work?", a: "At 47 life or more, which is 7 above the starting 40. The Angel ability is sorcery speed and taps <i-c>Speaker of the Heavens</i-c>, so it's once per turn." },
        { q: "Which spells does Aetherflux Reservoir count?", a: "Each trigger gains 1 life for each spell you cast before that one this turn, including spells cast before the Reservoir arrived. The first spell of a turn gains nothing. Every trigger that gains life is its own lifegain event, so Archangel of Thune sees each one." },
        { q: "Can I pay Aetherflux Reservoir's 50 life with exactly 50?", a: "You can, but you drop to 0 and lose the game. You can't pay it at all with less than 50." }
      ] },
      { t: "h", text: "Tokens and copies" },
      { t: "qa", items: [
        { q: "What does populate copy?", a: "Only what's printed on the original token: name, color, types, base power and toughness, and abilities. Not counters, not temporary pumps, not tapped or attacking status. <i-c>Intangible Virtue</i-c> still applies to the copy, because it's a token." },
        { q: "Why is the Voice of Resurgence Elemental such a good populate target?", a: "Its power and toughness equal the number of creatures you control. Every copy has the same ability, so each copy counts all the others. Trostani gains you your whole creature count for each new copy." },
        { q: "Can Bramble Sovereign copy a legendary creature?", a: "Yes, but the legend rule makes you keep only one of the two right away. The copy still entered, so Trostani, Soul Warden and Crusade trigger, but that's rarely worth {1}{G}. The legendary creatures here: Trostani, Adeline, Heliod, Jazal, Shalai, Lathiel, Ghalta and Mavren, and Vorinclex." },
        { q: "What happens if Bramble Sovereign copies Walking Ballista?", a: "The copy wasn't cast, so its X is 0: it enters with no counters and dies. The exception is <i-c>Intangible Virtue</i-c>, which makes the token a 1/1 that survives. <i-c>Spike Feeder</i-c> copies work fine, because Feeder always enters with two counters." },
        { q: "And Bramble Sovereign copying Craterhoof Behemoth?", a: "That's the dream. Let Bramble's trigger resolve first, so the copy is on the battlefield before the original Hoof trigger resolves. Both Hoof triggers then count both Hoofs, and every creature gets the bonus twice. The copy has haste too." },
        { q: "Can the Cats crew Esika's Chariot the turn they're made?", a: "Yes. Crewing taps creatures as a cost, and summoning sickness doesn't stop that. <i-c>Esika's Chariot</i-c> itself can't attack the turn you cast it unless it has haste." },
        { q: "Do Conclave Evangelist's myriad copies make copies?", a: "Yes. They're copies of <i-c>Conclave Evangelist</i-c>, ability included. Each one that deals combat damage to a player makes a new, permanent copy, even though the myriad copy itself is exiled at end of combat." },
        { q: "What does Soul of Eternity do with Trostani out?", a: "Trostani gains you life equal to its toughness, which is your life total, so casting it doubles your life. Encore is bigger still: one copy per opponent, and each copy's Trostani trigger doubles your life again. From 40 life, three copies take you to 80, 160, then 320." },
        { q: "How does Soul of Eternity's encore work?", a: "Pay {7}{W}{W} and exile <i-c>Soul of Eternity</i-c> from your graveyard, at sorcery speed. You get one token copy per opponent, each with haste and each forced to attack its opponent this turn. They're sacrificed at the beginning of the next end step." }
      ] },
      { t: "h", text: "Combat" },
      { t: "qa", items: [
        { q: "How do I order Hero of Bladehold's two triggers?", a: "Put battle cry on the stack first and the token trigger on top. The Soldiers are created first, then battle cry gives every other attacker, the new Soldiers included, +1/+0." },
        { q: "Does Adeline have to attack?", a: "No. Her trigger is 'whenever you attack', so any attack makes one Human attacking each opponent. Her power counts every creature you control, the new Humans included." },
        { q: "Does Beastmaster Ascension count Hero's and Adeline's tokens?", a: "No. Only creatures declared as attackers trigger it, and those tokens are created already attacking. Once it has seven counters, though, its +5/+5 is a constant bonus, so the tokens get it." },
        { q: "Can Beastmaster Ascension turn on mid-attack?", a: "Yes. Declare seven or more attackers and the counters go on during the declare attackers step, so the +5/+5 applies before blockers." },
        { q: "Does Craterhoof count itself?", a: "Yes. X is the number of creatures you control when the trigger resolves, Hoof included. Creatures that arrive afterwards, like attack tokens, don't get the bonus." },
        { q: "Which creatures does Crashing Drawbridge give haste?", a: "Only the creatures you control when its ability resolves. Make your tokens and crew your Chariot first, then tap <i-c>Crashing Drawbridge</i-c>. Drawbridge itself must have been yours since the start of the turn to tap." },
        { q: "How big is Blossoming Bogbeast's X?", a: "All the life you gained this turn, counted when its trigger resolves, its own 2 included. If Hero, Adeline or Ghalta trigger in the same attack, put Bogbeast's trigger on the bottom: their tokens arrive first, their Trostani life counts toward X, and they get the pump too." },
        { q: "How does Ghalta and Mavren count X?", a: "X is checked when its trigger resolves: the number of other attacking creatures for the Vampires, or the greatest power among them for the Dinosaur. Let Hero's and Adeline's token triggers resolve first so their tokens count." },
        { q: "Does infect stop lifelink?", a: "No. <i-c>Triumph of the Hordes</i-c> changes what the damage does to players, but it's still damage, so lifelink still gains you life." },
        { q: "Heliod gives Jazal Goldmane lifelink. Anything special?", a: "Yes. <i-c>Jazal Goldmane</i-c> has first strike, so it deals damage in an earlier combat damage step. The lifegain triggers Archangel of Thune or Heliod, and the counters land before your other creatures deal damage." },
        { q: "Does Jazal Goldmane's pump stack?", a: "Yes. Each activation adds +X/+X, where X is the number of attacking creatures when it resolves. Two activations with ten attackers is +20/+20 each. Jazal doesn't need to be attacking." }
      ] },
      { t: "h", text: "Mirror Entity and Return of the Wildspeaker" },
      { t: "qa", items: [
        { q: "How does Mirror Entity work with counters?", a: "<i-c>Mirror Entity</i-c> sets base power and toughness to X/X. Counters and anthems apply on top. A token with three counters and Intangible Virtue becomes (X+4)/(X+4)." },
        { q: "Can I activate Mirror Entity twice and add them up?", a: "No. Each activation sets the base again, and the last one to resolve wins. X=3 and then X=4 gives 4/4, not 7/7. Put all your mana into one activation." },
        { q: "Can Mirror Entity make something smaller?", a: "Yes. It overrides 'equal to' sizes: Adeline, <i-c>Soul of Eternity</i-c> and the Voice of Resurgence Elementals all become X/X. Don't turn a 60/60 Soul of Eternity into a 10/10." },
        { q: "Why does Return of the Wildspeaker miss after Mirror Entity?", a: "Mirror Entity gives your creatures every creature type, Human included, and <i-c>Return of the Wildspeaker</i-c> only counts non-Humans. Cast Wildspeaker first: its +3/+3 stays on the creatures it pumped, even after Mirror Entity makes them Human." },
        { q: "Which of my creatures are Humans?", a: "Adeline and her tokens, Hero of Bladehold, Soul Warden, Speaker of the Heavens, Avacyn's Pilgrim, Nykthos Paragon, and Mirror Entity itself, since changeling means every creature type. The Soldiers from Hero and Elspeth aren't Humans." }
      ] },
      { t: "h", text: "Skullclamp and Intangible Virtue" },
      { t: "qa", items: [
        { q: "Why does Skullclamp kill a 1/1?", a: "<i-c>Skullclamp</i-c> gives +1/-1. A 1/1 becomes a 2/0, dies, and you draw two." },
        { q: "And with Intangible Virtue out?", a: "Tokens are 2/2, so a clamped one is a 3/1 and lives. Clamp a nontoken 1/1 with no counters instead, like <i-c>Llanowar Elves</i-c> or <i-c>Elvish Mystic</i-c>, or skip it." },
        { q: "Skullclamp on Elenda's Hierophant?", a: "If it has no counters, <i-c>Elenda's Hierophant</i-c> dies as a 2/0. Its death trigger uses its last power, 2, so you draw two and get two lifelink Vampires." },
        { q: "Why doesn't attacking with my tokens help Halo Fountain?", a: "With <i-c>Intangible Virtue</i-c> out they have vigilance, so they don't tap. Tokens created tapped and attacking, like Hero's and Adeline's, still count." }
      ] },
      { t: "h", text: "Heliod" },
      { t: "qa", items: [
        { q: "Heliod isn't a creature. Does it still work?", a: "Yes. Its lifegain trigger and its lifelink ability work at any devotion. <i-c>Heliod, Sun-Crowned</i-c> becomes a 5/5 indestructible creature only while your devotion to white is 5 or more." },
        { q: "How do I count devotion to white?", a: "Count the {W} symbols in the mana costs of permanents you control. Heliod counts 1, Trostani 2, Archangel of Thune 2. Hybrid {G/W} symbols count, so <i-c>Conclave Evangelist</i-c> adds 2. Tokens made from scratch, like Soldiers and Citizens, add nothing, but a token copy of a card, like one from <i-c>Bramble Sovereign</i-c>, keeps its mana cost and counts." },
        { q: "What removal can hit Heliod?", a: "Exile, bounce and sacrifice effects. Destroy effects miss, because it's indestructible whether or not it's a creature. Creature removal like <i-c>Swords to Plowshares</i-c> only works while Heliod is a creature." },
        { q: "Does Shalai protect Heliod?", a: "Only while Heliod is a creature. <i-c>Shalai, Voice of Plenty</i-c> covers you, your planeswalkers and your other creatures." }
      ] },
      { t: "h", text: "Mana and lands" },
      { t: "qa", items: [
        { q: "What does Vorinclex double?", a: "Only lands. Each time you tap a land for mana, <i-c>Vorinclex, Voice of Hunger</i-c> adds one more mana of a type that land produced. Mana creatures, Sol Ring and the Signets aren't doubled. <i-c>Selesnya Sanctuary</i-c> makes {G}{W} plus one more {G} or {W}." },
        { q: "What does Vorinclex do to opponents?", a: "Any land an opponent taps for mana doesn't untap during their next untap step." },
        { q: "Which land does Selesnya Sanctuary return?", a: "One you control, chosen when the trigger resolves. It can be Sanctuary itself. Return a gain land you've already tapped for mana, and replay it next turn for another lifegain trigger." },
        { q: "How does Fanatic of Rhonas turn on?", a: "The ability that adds {G}{G}{G}{G} needs you to control a creature with power 4 or more, and <i-c>Fanatic of Rhonas</i-c> can be that creature. Three counters make it a 4/7 that turns itself on. An eternalized Fanatic is a 4/4 and does it alone." },
        { q: "Can summoning-sick creatures convoke?", a: "Yes. Convoke doesn't use a creature's own {T} ability, so creatures that arrived this turn can pay. Each pays {1} or one mana of its color, so a green-white Citizen pays either." },
        { q: "Can I convoke Trostani?", a: "Yes, once Dazzling Theater is unlocked, because she's a creature spell. Convoke can pay the commander tax too." },
        { q: "Should I convoke Craterhoof Behemoth?", a: "Careful. Convoking taps your creatures, and tapped creatures can't attack. Pay for Hoof with lands and with creatures you weren't going to attack with." },
        { q: "What does Prop Room do?", a: "Your creatures untap during each other player's untap step. You can attack with everything and still have blockers, and Trostani and your mana creatures untap for each opponent's turn. Artifacts like <i-c>Springleaf Drum</i-c> don't untap." }
      ] },
      { t: "h", text: "Combos, removal and protection" },
      { t: "qa", items: [
        { q: "Why can't Finale of Devastation get Walking Ballista?", a: "Ballista's counters come from the X you pay when you cast it. Put onto the battlefield by <i-c>Finale of Devastation</i-c>, its X is 0, so it enters with no counters and dies." },
        { q: "Can Finale of Devastation get Heliod?", a: "Yes. Heliod is an enchantment creature card, so it counts as a creature card in your library or graveyard. X=3 finds it." },
        { q: "Does the creature Finale fetches get the X=10 pump?", a: "Yes. It's put onto the battlefield first, then your creatures get +X/+X and haste." },
        { q: "Are Grand Crescendo's new Citizens indestructible?", a: "Yes. <i-c>Grand Crescendo</i-c> creates the tokens first, then gives indestructible to all your creatures, new ones included. Creatures that arrive later that turn aren't covered. <i-c>Rootborn Defenses</i-c> works the same way: it populates first." },
        { q: "Does Voice of Resurgence's token survive the wipe that killed Voice?", a: "Yes. The token is created after the wipe has finished, so the wipe can't touch it, even a -X/-X one." },
        { q: "What does Hour of Reckoning do to my board?", a: "It destroys Trostani and your other nontoken creatures, so move Trostani to the command zone. Heliod survives because it's indestructible, and your tokens survive because <i-c>Hour of Reckoning</i-c> spares tokens." },
        { q: "Does Elspeth's -3 hit my creatures?", a: "Yes, every creature with power 4 or greater, yours included. Counters count, so check your own board first." },
        { q: "What happens if I demonstrate Excavation Technique?", a: "You copy it, then choose an opponent who also copies it and picks their own target. Only do it when nothing of yours is worth them destroying." }
      ] }
    ]
  },
  {
    id: "habits",
    title: "Ten habits and common mistakes",
    kicker: "Good habits",
    minutes: 3,
    summary: "The ten habits that win games with this deck, and the mistakes that lose them.",
    blocks: [
      { t: "p", html: "Most games with this deck are won or lost on small sequencing choices. Build these habits and the deck gets much easier to play." },
      { t: "h", text: "Ten habits" },
      { t: "steps", items: [
        { title: "Lifegain first, bodies second", html: "Soul Warden, Trostani and Prosperous Innkeeper only count creatures that enter after them." },
        { title: "Put Trostani's trigger at the bottom", html: "Let the counters land first. Trostani reads toughness when her trigger resolves." },
        { title: "Populate at the end of the turn before yours", html: "Hold the mana, keep your options, and still get the token." },
        { title: "Bait before the Angel", html: "Hero, Adeline and Elspeth must be answered. Once they've eaten removal, Archangel of Thune lives longer." },
        { title: "Keep {W}{W} up for Grand Crescendo", html: "X=0 is enough to beat a destroy-all wipe." },
        { title: "Don't overextend", html: "Two or three threats on board, a rebuild in hand." },
        { title: "Skip small Nykthos Paragon triggers", html: "It works once per turn and it's optional. Wait for the big gain." },
        { title: "Order Hero of Bladehold's triggers", html: "Tokens first, then battle cry, so the new Soldiers get +1/+0." },
        { title: "Count before you cast the finisher", html: "Attackers, pump, attack tokens, blockers, then the split." },
        { title: "Announce clearly", html: "Group your triggers, name the number of loops, and give opponents a clear moment to respond." }
      ] },
      { t: "h", text: "Common mistakes" },
      { t: "table", head: ["Mistake", "Do this instead"], rows: [
        ["Attacking with Trostani into blockers", "Keep her home. She's worth more untapped for populate."],
        ["Clamping 2/2 tokens with Intangible Virtue out", "They survive as 3/1s. Clamp nontoken 1/1s, or skip it."],
        ["Convoking Craterhoof with your attackers", "Tapped creatures can't attack. Pay with lands and spare creatures."],
        ["Counting attack tokens in Craterhoof's bonus", "Hero's and Adeline's tokens arrive after the pump. Count them as 1/1s."],
        ["Finale of Devastation for Walking Ballista", "It enters with 0 counters and dies. Fetch Heliod or Spike Feeder."],
        ["Mirror Entity, then Return of the Wildspeaker", "Everything is Human by then. Cast Wildspeaker first."],
        ["Two small Mirror Entity activations", "The last one wins. Make one big activation."],
        ["Elspeth's -3 with a grown board", "It kills your 4-power creatures too. Count first."],
        ["Expecting attack tokens to add Beastmaster counters", "Only declared attackers add counters."],
        ["Attacking for Halo Fountain with Virtue out", "Vigilant tokens stay untapped. Tap them another way."],
        ["Paying Aetherflux Reservoir down to 0", "You lose. Keep at least 51 before you pay."],
        ["Populating in the end step for Resplendent Angel", "Too late for that turn. Gain the 5 before the end step."],
        ["Starting the Ballista loop with one counter", "It dies on the first ping. Start with two."],
        ["Copying a legend with Bramble Sovereign", "The legend rule takes one away at once."]
      ] },
      { t: "callout", tone: "tip", title: "Bring dice and a pen", html: "This deck's triggers are simple one at a time and brutal to track from memory. Dice for counters, a pen or an app for life, and a quick count out loud before each big turn." }
    ]
  },
  {
    id: "glossary",
    title: "Glossary",
    kicker: "Quick reference",
    minutes: 4,
    summary: "Every keyword and mechanic in this deck, in plain words.",
    blocks: [
      { t: "p", html: "Short definitions for the terms used in this guide, with the cards that use them." },
      { t: "h", text: "Mechanics on these cards" },
      { t: "qa", items: [
        { q: "Populate", a: "Create a token that's a copy of a creature token you control. The copy enters, so it triggers Trostani, Soul Warden and Cathars' Crusade. Used by Trostani, <i-c>Rootborn Defenses</i-c>, <i-c>Sundering Growth</i-c> and <i-c>Song of the Worldsoul</i-c>." },
        { q: "Convoke", a: "Your creatures can help pay: each one you tap pays {1} or one mana of its color. <i-c>Hour of Reckoning</i-c> has it, and <i-c>Dazzling Theater // Prop Room</i-c> gives it to your creature spells." },
        { q: "Devotion", a: "The number of mana symbols of one color among the mana costs of your permanents. <i-c>Heliod, Sun-Crowned</i-c> is a creature only at five or more devotion to white. Its abilities work either way." },
        { q: "Myriad", a: "Whenever the creature attacks, for each opponent other than the defending player, you may make a token copy of it that is tapped and attacking that player. The copies are exiled at end of combat. On <i-c>Conclave Evangelist</i-c>." },
        { q: "Demonstrate", a: "When you cast the spell, you may copy it. If you do, an opponent you choose also gets a copy. On <i-c>Excavation Technique</i-c>." },
        { q: "Encore", a: "Pay the encore cost and exile the card from your graveyard, at sorcery speed. For each opponent you get a hasty token copy that must attack that player this turn. The tokens are sacrificed at the next end step. On <i-c>Soul of Eternity</i-c>." },
        { q: "Eternalize", a: "Pay the eternalize cost and exile the card from your graveyard, at sorcery speed, to make a 4/4 black Zombie token copy of it. On <i-c>Fanatic of Rhonas</i-c>." },
        { q: "Infect and poison", a: "Infect damage to a player gives them poison counters instead of costing life. Ten poison and they lose. Damage to creatures becomes -1/-1 counters. <i-c>Triumph of the Hordes</i-c> gives it to your team." },
        { q: "Battle cry", a: "When this creature attacks, each other attacking creature gets +1/+0. On <i-c>Hero of Bladehold</i-c>." },
        { q: "Ferocious", a: "A bonus that turns on if you control a creature with power 4 or greater. <i-c>Fanatic of Rhonas</i-c> and <i-c>Shamanic Revelation</i-c> both check it." },
        { q: "Crew", a: "Tap creatures with enough total power to turn a Vehicle into an artifact creature until end of turn. Summoning-sick creatures can crew. <i-c>Esika's Chariot</i-c> has crew 4." },
        { q: "Changeling", a: "The card is every creature type at all times. On <i-c>Mirror Entity</i-c>." },
        { q: "Rooms", a: "One enchantment card with two doors. You cast one door, and later you can unlock the other by paying its cost at sorcery speed. <i-c>Dazzling Theater // Prop Room</i-c> is the Room here." },
        { q: "Classes", a: "An enchantment that starts at level 1. Pay to level it up at sorcery speed, and each level adds an ability while keeping the old ones. <i-c>Cleric Class</i-c> is the Class here." },
        { q: "Treasure and Junk", a: "Artifact tokens. A Treasure sacrifices for one mana of any color. A Junk token, from <i-c>Break Down</i-c>, sacrifices at sorcery speed to exile your top card, which you may play that turn." }
      ] },
      { t: "h", text: "Keywords and game terms" },
      { t: "qa", items: [
        { q: "Lifelink", a: "Damage this creature deals also gains you that much life. Each lifelink creature that deals damage is a separate lifegain event." },
        { q: "Vigilance", a: "Attacking doesn't tap this creature. Great for defense, bad for <i-c>Halo Fountain</i-c>." },
        { q: "Trample", a: "If blocked, the attacker only has to assign lethal damage to its blockers. The rest goes to the player." },
        { q: "Hexproof", a: "Can't be the target of spells or abilities your opponents control. You can still target your own." },
        { q: "Indestructible", a: "Destroy effects and lethal damage don't kill it. Exile, sacrifice, bounce and -X/-X still do." },
        { q: "Haste and summoning sickness", a: "A creature can't attack or use {T} abilities until you've controlled it since the start of your most recent turn. Haste removes that limit. Other cards can still tap it as a cost: convoke, crew, <i-c>Springleaf Drum</i-c>." },
        { q: "Tapped and attacking", a: "Tokens created this way join the attack without being declared as attackers. They don't trigger 'whenever a creature attacks' abilities, and they're tapped even with vigilance." },
        { q: "Commander tax", a: "Each time you cast your commander from the command zone, it costs {2} more than the last time." },
        { q: "Commander damage", a: "21 combat damage from one commander to one player over the game kills that player, whatever their life total." },
        { q: "Legend rule", a: "If you control two legendary permanents with the same name, you choose one and the other goes to the graveyard." }
      ] }
    ]
  },
];
