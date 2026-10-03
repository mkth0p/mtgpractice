/* The long-form playing guide for the Corrupted Etrata deck ("Etrata's Shadow Market v2", Etrata, Deadly Fugitive).
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Card mentions use <i-c>Exact Card Name</i-c>; mana symbols are written as {U}, {B}, {2}, {T}.
   Cards that are not in the deck (opponents' cards, cut cards) are written as plain text. */
window.CETRATA_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "What the deck is, its six ways to win, how fast it is, what it costs, and what to tell the table.",
    blocks: [
      { t: "p", html: "Corrupted Etrata is a blue-black Bracket 4 deck led by <i-c>Etrata, Deadly Fugitive</i-c>. It's the second Etrata list, built to be odd, creative and greedy: it steals a lot, plays cards few people know, and aims to win on turns 6 to 7." },
      { t: "p", html: "Etrata turns face-down creatures face up for {2}{U}{B}. That one ability makes a few seven-drops cost four, and it's what most of the strange combos are built on." },
      { t: "cards", names: ["Etrata, Deadly Fugitive", "Exquisite Blood", "Mindcrank", "Brine Elemental"], caption: "The commander and three of the six engines." },
      { t: "h", text: "The plan in four beats" },
      { t: "steps", items: [
        { title: "Set up", html: "Rocks, <i-c>Mox Amber</i-c> and card draw on turns 1 to 3. <i-c>Rhystic Study</i-c>, <i-c>Mystic Remora</i-c> and <i-c>Necropotence</i-c> fill your hand." },
        { title: "Steal", html: "Etrata, <i-c>Gonti, Night Minister</i-c>, <i-c>Thief of Sanity</i-c> and <i-c>Opposition Agent</i-c> take cards from the other players. You play their best spells against them." },
        { title: "Tutor", html: "Fifteen tutors, five of them transmute cards. Most combos need two cards, so one tutor plus one piece is often enough." },
        { title: "Win", html: "Usually on turn 6 to 8. Six different lines, so one piece of hate rarely stops all of them." }
      ] },
      { t: "h", text: "Six ways to win" },
      { t: "list", items: [
        "<b>1. The vampire court.</b> A drain (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>) plus a payoff (<i-c>Marauding Blight-Priest</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c> or <i-c>Sanguine Bond</i-c>). Six possible pairs. Any opponent losing life drains the whole table.",
        "<b>2. Mindcrank and the Guildmage.</b> <i-c>Mindcrank</i-c> plus <i-c>Duskmantle Guildmage</i-c>. Every card in their graveyard costs a life, every life lost mills a card.",
        "<b>3. The Brine lock.</b> <i-c>Brine Elemental</i-c> and <i-c>Vesuvan Shapeshifter</i-c>. Opponents never untap again.",
        "<b>4. The double tap.</b> <i-c>Bloodletter of Aclazotz</i-c> plus <i-c>Virtus the Veiled</i-c> kills a player in one hit. With <i-c>Ramses, Assassin Lord</i-c>, that wins the game.",
        "<b>5. Infinite turns.</b> <i-c>Scroll of Fate</i-c>, <i-c>Wormfang Manta</i-c> and <i-c>Crystal Shard</i-c>, with Etrata flipping the Manta for four.",
        "<b>6. The hit list.</b> <i-c>Mari, the Killing Quill</i-c>, <i-c>Toxic Deluge</i-c>, <i-c>Etrata, the Silencer</i-c> and <i-c>Ramses, Assassin Lord</i-c>."
      ] },
      { t: "widget", id: "comboFinder" },
      { t: "h", text: "How fast it is" },
      { t: "p", html: "The write-up's simulator played 8,000 games for each setting. It doesn't count stolen cards or most combat damage, so treat these as a floor." },
      { t: "table", head: ["Opponents", "Won by turn 6", "By turn 7", "By turn 8"], rows: [
        ["Answer 30% of combo attempts", "25%", "40%", "52%"],
        ["Never answer", "32%", "50%", "64%"],
        ["The old v1 list, answering", "13%", "25%", "34%"]
      ] },
      { t: "p", html: "The median win is turn 7 against a table that never answers, and turn 8 against one that does. The old v1 list's median was turn 10." },
      { t: "h", text: "Is it for you?" },
      { t: "list", items: [
        "You'll enjoy it if you like playing other people's cards. A lot of your best turns use their spells.",
        "You'll enjoy it if you like knowing obscure cards. Transmute, morph, manifest and an old Dimir Guildmage all matter here.",
        "You need to track hidden information: which face-down card is which, who owns what. The Etrata chapter covers it.",
        "It's less fun if you want a single clean combo. This deck wins many small ways, and you pick the line each game."
      ] },
      { t: "callout", tone: "key", title: "Tell the table first", html: "Bracket 4 with 9 Game Changers, two-card infinite combos, a permanent untap lock and infinite turns. Say all of that before you shuffle. The last chapter has a script." },
      { t: "callout", tone: "tip", title: "Cost", html: "About $1,108, or roughly 940€. The big cards are <i-c>Imperial Seal</i-c> ($180) and <i-c>Mox Amber</i-c> ($87). Or proxy it: 45 cards, 16 basics included, carry over from the current Etrata deck, and the other 55 can be proxies. The Shop's \"Proxy it\" section lists them. The buy list is in the mana chapter." }
    ]
  },
  {
    id: "how-etrata-works",
    title: "How Etrata works",
    kicker: "The commander",
    minutes: 7,
    summary: "Cloak, morph and manifest, Etrata's {2}{U}{B} flip, what happens to instants and sorceries, and why Training Grounds matters.",
    blocks: [
      { t: "cards", names: ["Etrata, Deadly Fugitive"], caption: "{1}{U}{B}, a 1/4 deathtouch Vampire Assassin." },
      { t: "p", html: "Etrata has three abilities. Each does a different job in this deck." },
      { t: "steps", items: [
        { title: "Deathtouch", html: "A 1/4 deathtouch creature is a great blocker. She usually stays home." },
        { title: "The granted ability", html: "Face-down creatures you control have '{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.' It only exists while Etrata is on the battlefield." },
        { title: "The cloak trigger", html: "Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library. One trigger for each Assassin that connects." }
      ] },
      { t: "h", text: "What a face-down creature is" },
      { t: "p", html: "A face-down creature is a 2/2 with no name, no creature types, no mana cost and no color. Its mana value is 0. It has none of the text of the card underneath." },
      { t: "table", head: ["Way in", "What it does", "In this deck"], rows: [
        ["Cloak", "Put a card onto the battlefield face down as a 2/2 with ward {2}", "Etrata's trigger, from the damaged opponent's library"],
        ["Manifest", "Put a card onto the battlefield face down as a 2/2, no ward", "<i-c>Scroll of Fate</i-c>, from your hand, at instant speed"],
        ["Morph", "Cast the card face down for {3}", "<i-c>Brine Elemental</i-c>, <i-c>Vesuvan Shapeshifter</i-c>"]
      ] },
      { t: "h", text: "Turning a card face up" },
      { t: "table", head: ["Route", "Cost", "Works on", "Uses the stack?"], rows: [
        ["Natural flip", "The card's mana cost", "Manifested or cloaked creature cards", "No: special action"],
        ["Morph", "The morph cost", "Cards with morph", "No: special action"],
        ["Etrata's granted ability", "{2}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>", "Any face-down creature you control, while Etrata is out", "Yes: an activated ability"]
      ] },
      { t: "p", html: "This is where the deck's engines come from. <i-c>Wormfang Manta</i-c> costs {5}{U}{U}. <i-c>Brine Elemental</i-c>'s morph cost is {5}{U}{U}. Through Etrata, either one flips for four mana." },
      { t: "h", text: "What the card becomes" },
      { t: "steps", items: [
        { title: "A creature card", html: "It turns face up and stays on the battlefield as that creature." },
        { title: "An artifact, enchantment or land", html: "Only Etrata's ability can turn it face up. It stays on the battlefield as that permanent and stops being a creature." },
        { title: "An instant or sorcery", html: "It can't be turned face up. Etrata's ability exiles it, and you may cast it right away for free. Timing rules like 'sorcery speed' don't matter, because you cast it while the ability resolves." }
      ] },
      { t: "callout", tone: "key", title: "Turning face up isn't entering", html: "The permanent was already on the battlefield. Enters triggers don't happen and 'as this enters' choices are never made. That's why a manifested <i-c>Wormfang Manta</i-c> never makes you skip a turn. 'When this is turned face up' triggers, like <i-c>Brine Elemental</i-c>'s, do happen." },
      { t: "h", text: "Training Grounds" },
      { t: "cards", names: ["Training Grounds"], caption: "{U}. Activated abilities of your creatures cost {2} less, never below one mana." },
      { t: "p", html: "Etrata's flip is an ability of your face-down creatures, so <i-c>Training Grounds</i-c> cuts it from {2}{U}{B} to {U}{B}. It only removes generic mana. The Guildmage's {1}{U}{B} drops to {U}{B} too." },
      { t: "list", items: [
        "It doesn't reduce a natural flip or a morph cost. Those are special actions, not abilities.",
        "It doesn't reduce <i-c>Crystal Shard</i-c>. That's an artifact's ability, not a creature's.",
        "<i-c>Dizzy Spell</i-c> transmutes for it. It's the cheapest way to make every combo turn two mana cheaper."
      ] },
      { t: "h", text: "Making Assassins" },
      { t: "p", html: "Etrata only triggers for Assassins. A cloak has no creature types, even if the card under it is an Assassin." },
      { t: "list", items: [
        "<i-c>Changeling Outcast</i-c>: every creature type, can't be blocked. A turn-1 Assassin that connects every turn.",
        "<i-c>Roshan, Hidden Magister</i-c>: your other creatures are Assassins, face-down ones get menace, and each flip draws a card for 1 life.",
        "<i-c>Leyline of Transformation</i-c>: name Assassin. Free if it's in your opening hand.",
        "<i-c>Black Market Connections</i-c>: its 3/2 Shapeshifter tokens have changeling, so they're Assassins.",
        "Real Assassins: Etrata herself, <i-c>Ramses, Assassin Lord</i-c>, <i-c>Mari, the Killing Quill</i-c>, <i-c>Etrata, the Silencer</i-c>, <i-c>Virtus the Veiled</i-c>."
      ] },
      { t: "h", text: "Who owns a cloak" },
      { t: "list", items: [
        "You control the cloak. The player whose library it came from owns it.",
        "If it dies, it goes to its owner's graveyard. If it's bounced, it goes to its owner's hand.",
        "You may look at your face-down permanents at any time. Opponents can't.",
        "If a face-down permanent leaves the battlefield, it's revealed. All of them are revealed at the end of the game.",
        "Keep them easy to tell apart. Line them up or mark them with dice."
      ] },
      { t: "callout", tone: "tip", title: "Read before you flip", html: "Look at your cloaks at the start of each turn. A stolen wipe or tutor is worth more on the right turn than on the first turn you can afford it." },
      { t: "h", text: "Commander tax" },
      { t: "p", html: "Etrata costs 3, then 5, then 7. She's cheap, so recasting her once or twice is fine. Without her, your Assassins stop cloaking, your face-down creatures lose the flip ability, and the Brine lock and the Manta loop get much more expensive." }
    ]
  },
  {
    id: "vampire-court",
    title: "Win line 1: The vampire court",
    kicker: "Combo 1",
    minutes: 6,
    summary: "Two drains, three payoffs, six two-card pairs. How the loop runs and how to start it.",
    blocks: [
      { t: "p", html: "This is the deck's most flexible combo. You need one card from each column. All five cards are Vampires or Vampire-themed, which is where the name comes from." },
      { t: "table", head: ["Drain (gain when they lose)", "Payoff (they lose when you gain)"], rows: [
        ["<i-c>Exquisite Blood</i-c>, {4}{B} enchantment: whenever an opponent loses life, you gain that much life.", "<i-c>Marauding Blight-Priest</i-c>, {2}{B} 3/2: whenever you gain life, each opponent loses 1 life."],
        ["<i-c>Bloodthirsty Conqueror</i-c>, {3}{B}{B} 5/5 flying, deathtouch: same text as Exquisite Blood.", "<i-c>Vito, Thorn of the Dusk Rose</i-c>, {2}{B} 1/3: whenever you gain life, target opponent loses that much life."],
        ["", "<i-c>Sanguine Bond</i-c>, {3}{B}{B} enchantment: same text as Vito."]
      ] },
      { t: "h", text: "How the loop runs" },
      { t: "steps", items: [
        { title: "An opponent loses life", html: "Any amount, from any source." },
        { title: "The drain triggers", html: "You gain that much life." },
        { title: "The payoff triggers", html: "Blight-Priest makes each opponent lose 1. Vito or Bond makes one target opponent lose as much as you gained." },
        { title: "Back to step 2", html: "Each of those losses triggers the drain again. It doesn't stop until every opponent is dead." }
      ] },
      { t: "callout", tone: "key", title: "It kills the whole table, not one player", html: "With Blight-Priest, every loop hits every opponent. With Vito or Bond, each new trigger picks a new target. When one opponent dies, the next trigger targets someone still alive." },
      { t: "h", text: "Starting it" },
      { t: "list", items: [
        "<b>Your attacks.</b> Any creature that deals combat damage to an opponent. <i-c>Changeling Outcast</i-c> can't be blocked.",
        "<b>Their own lands.</b> Paying life is losing life. A fetchland, a shockland, a painland they tap for color: all start the loop.",
        "<b>Their fights with each other.</b> If one opponent attacks another, the damaged player loses life and the loop starts.",
        "<b>Your own life gain.</b> With the payoff out, any life you gain starts it too. <i-c>Vito, Thorn of the Dusk Rose</i-c>'s {3}{B}{B} ability gives your creatures lifelink.",
        "<b>The Conqueror itself.</b> <i-c>Bloodthirsty Conqueror</i-c> is a 5/5 flier. If it connects, its own damage starts the loop."
      ] },
      { t: "callout", tone: "tip", title: "Wait for the trigger", html: "You often don't need to do anything. Put both pieces out and let the table's fetchlands and attacks kill them. It's a combo that works on every player's turn." },
      { t: "h", text: "Why these cards" },
      { t: "list", items: [
        "Blight-Priest and Vito cost three. Few people play them, so few people see them coming.",
        "Two drains and three payoffs is six pairs. Commander Spellbook lists Exquisite + Blight-Priest, Exquisite + Bond, Exquisite + Vito and Conqueror + Blight-Priest. Conqueror + Vito and Conqueror + Bond work the same way.",
        "Vito has 1 power, so <i-c>Tetsuko Umezawa, Fugitive</i-c> makes him unblockable.",
        "<i-c>Mindcrank</i-c> also mills them during the loop. It doesn't matter, they're dying anyway."
      ] },
      { t: "h", text: "Getting the pieces" },
      { t: "table", head: ["Piece", "Mana value", "Found by"], rows: [
        ["<i-c>Exquisite Blood</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Sanguine Bond</i-c>", "5", "Any open tutor. No transmute card reaches mana value 5."],
        ["<i-c>Marauding Blight-Priest</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>", "3", "Any open tutor, or <i-c>Drift of Phantasms</i-c>' transmute"]
      ] },
      { t: "callout", tone: "warn", title: "What stops it", html: "Effects that say opponents can't lose life, or that you can't gain life, stop the loop. So does removing either piece in response to the first trigger. The enchantments are safe from creature removal, the creatures aren't." }
    ]
  },
  {
    id: "mindcrank",
    title: "Win line 2: Mindcrank and the Guildmage",
    kicker: "Combo 2",
    minutes: 6,
    summary: "A two-mana artifact and a two-mana Guildmage. The sim's most common win. How to start it and how to hit everyone.",
    blocks: [
      { t: "cards", names: ["Mindcrank", "Duskmantle Guildmage"], caption: "Two cards, both mana value 2." },
      { t: "p", html: "<i-c>Mindcrank</i-c>: whenever an opponent loses life, that player mills that many cards. <i-c>Duskmantle Guildmage</i-c>'s first ability, {1}{U}{B}: this turn, whenever a card is put into an opponent's graveyard from anywhere, that player loses 1 life." },
      { t: "h", text: "The loop" },
      { t: "steps", items: [
        { title: "Activate the Guildmage", html: "{1}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>. The effect lasts until end of turn." },
        { title: "A card hits their graveyard", html: "They lose 1 life." },
        { title: "Mindcrank triggers", html: "They mill 1 card. That card goes to their graveyard." },
        { title: "Back to step 2", html: "It repeats until they're at 0 life. A Commander library almost always has more cards than its owner has life." }
      ] },
      { t: "callout", tone: "key", title: "One player at a time", html: "The loop only runs for the opponent whose graveyard got a card, or who lost life. Each other opponent needs their own starter in the same turn. Plan for that, or pair it with <i-c>Ramses, Assassin Lord</i-c>." },
      { t: "h", text: "Starters" },
      { t: "table", head: ["Starter", "Who it hits"], rows: [
        ["<i-c>Windfall</i-c>", "Every opponent with cards in hand. They discard their hands into their graveyards."],
        ["<i-c>Toxic Deluge</i-c>", "Every opponent with a nontoken creature. Dead creature cards go to their graveyards."],
        ["Combat damage", "Each opponent you hit. Mindcrank mills, the Guildmage takes it from there."],
        ["Their instant or sorcery resolving", "That player. The spell card goes to their graveyard."],
        ["Countering their spell", "That player. A countered spell goes to its owner's graveyard."],
        ["Guildmage's other ability, {2}{U}{B}", "One target player mills two."],
        ["Sacrificing a stolen cloak", "Its owner. <i-c>Culling the Weak</i-c> or <i-c>Diabolic Intent</i-c> send it to their graveyard."],
        ["Casting a stolen instant or sorcery", "Its owner. It goes to their graveyard after it resolves."]
      ] },
      { t: "callout", tone: "tip", title: "The cleanest table kill", html: "On your turn, activate the Guildmage, then cast <i-c>Windfall</i-c>. Everyone discards. Every opponent with a card in hand starts their own loop. That's {1}{U}{B} plus {2}{U}, six mana, or four with Training Grounds." },
      { t: "h", text: "On an opponent's turn" },
      { t: "p", html: "When an opponent casts an instant or sorcery, activate the Guildmage in response. When the spell resolves, it goes to their graveyard and the loop kills them. You can also counter any spell they cast: the countered card goes to their graveyard. Either way, that's one player down at instant speed." },
      { t: "h", text: "With Ramses" },
      { t: "p", html: "<i-c>Ramses, Assassin Lord</i-c>: whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game. On your turn, attack the player you're about to crank with any Assassin. Etrata herself counts. When the loop kills them, Ramses wins the whole game." },
      { t: "h", text: "Getting the pieces" },
      { t: "list", items: [
        "<i-c>Tribute Mage</i-c> finds <i-c>Mindcrank</i-c>. It searches for an artifact with mana value 2.",
        "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> transmute for either piece. Both have mana value 2.",
        "<i-c>Wishclaw Talisman</i-c> and the big tutors find either one.",
        "Both pieces are cheap, so the line often fits in a turn with a tutor."
      ] },
      { t: "callout", tone: "warn", title: "What stops it", html: "Rest in Peace and similar cards exile cards instead of putting them into graveyards, so the Guildmage never triggers. Cursed Totem, Pithing Needle on the Guildmage, and artifact removal on Mindcrank stop it too." }
    ]
  },
  {
    id: "brine-lock",
    title: "Win line 3: The Brine lock",
    kicker: "Combo 3",
    minutes: 6,
    summary: "Brine Elemental plus Vesuvan Shapeshifter: opponents skip every untap step. Why Etrata makes it cheap.",
    blocks: [
      { t: "cards", names: ["Brine Elemental", "Vesuvan Shapeshifter", "Etrata, Deadly Fugitive"], caption: "An old morph lock with a new discount." },
      { t: "p", html: "<i-c>Brine Elemental</i-c>: when it's turned face up, each opponent skips their next untap step. Its morph cost is {5}{U}{U}. <i-c>Vesuvan Shapeshifter</i-c> can turn face up as a copy of another creature, and can turn itself face down in your upkeep." },
      { t: "h", text: "The setup" },
      { t: "steps", items: [
        { title: "Cast both face down", html: "Morph lets you cast each one face down for {3}. Nobody knows which 2/2 is which." },
        { title: "Flip Brine with Etrata", html: "{2}{U}{B} instead of {5}{U}{U}. Or {U}{B} with <i-c>Training Grounds</i-c>. Each opponent skips their next untap step." },
        { title: "Next turn, flip Vesuvan as a Brine", html: "Turn it face up for its morph cost, {1}{U}, and choose Brine Elemental. It's turned face up as a copy of Brine, so the Brine trigger happens again." },
        { title: "Every upkeep", html: "Vesuvan's copy has 'At the beginning of your upkeep, you may turn this creature face down.' Do it, then flip it again for {1}{U}. Opponents skip their next untap step again." }
      ] },
      { t: "callout", tone: "key", title: "{1}{U} a turn, forever", html: "Once both are out, the lock costs {1}{U} each turn. Vesuvan's morph flip is a special action, so nobody can respond to the flip itself. They can only respond to the trigger." },
      { t: "h", text: "What the lock does and doesn't do" },
      { t: "list", items: [
        "Opponents' tapped lands, creatures and rocks stay tapped.",
        "Anything they didn't tap stays untapped and usable. The lock bites hardest right after they tap out.",
        "They still draw and can play a land each turn. A fresh land can be used once.",
        "Their tapped creatures can't block. Attack every turn and finish them.",
        "It's not a win on its own. It buys all the turns you need."
      ] },
      { t: "callout", tone: "tip", title: "Timing the first flip", html: "Flip Brine at a moment when opponents are tapped low. The end of the last opponent's turn before yours is good: they've used their mana, and they skip the untap step that would have given it back." },
      { t: "h", text: "Other ways to set it up" },
      { t: "list", items: [
        "<i-c>Scroll of Fate</i-c> can manifest Brine from your hand at instant speed. Etrata flips it the same way.",
        "Vesuvan can be cast face up for {3}{U}{U} as a copy of Brine. No trigger then, because it entered instead of turning face up. Next upkeep, turn it face down and flip it.",
        "Without Etrata, Brine's own morph cost is {5}{U}{U}. That's a special action nobody can respond to."
      ] },
      { t: "callout", tone: "warn", title: "Weak spots", html: "Removal on Vesuvan ends the lock. A face-down 2/2 is easy to kill. Bounce resets it. Trigger counters like Stifle stop one skip. Hold <i-c>Counterspell</i-c> or <i-c>Swan Song</i-c> for the turn you set it up." },
      { t: "h", text: "Getting the pieces" },
      { t: "p", html: "Brine has mana value 6 and Vesuvan 5. No transmute card reaches them. Use <i-c>Demonic Tutor</i-c>, <i-c>Vampiric Tutor</i-c>, <i-c>Imperial Seal</i-c>, <i-c>Grim Tutor</i-c>, <i-c>Diabolic Intent</i-c>, <i-c>Wishclaw Talisman</i-c> or <i-c>Beseech the Mirror</i-c> unbargained." }
    ]
  },
  {
    id: "ramses-lines",
    title: "Win lines 4 and 6: Ramses and the Assassins",
    kicker: "Combos 4 and 6",
    minutes: 8,
    summary: "The double tap with Bloodletter and Virtus, Mari's hit list with the Silencer, and how Ramses turns one kill into a win.",
    blocks: [
      { t: "cards", names: ["Ramses, Assassin Lord"], caption: "{2}{B}{U}, 4/4 deathtouch. Other Assassins you control get +1/+1." },
      { t: "p", html: "Ramses' last ability: whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game. Two of the deck's lines kill one player with an Assassin attack. Ramses turns that into a full win." },
      { t: "callout", tone: "key", title: "Attacked, not hit", html: "The Assassin only has to attack that player this turn. It doesn't have to deal damage or survive. It also works with the other lines: attack with Etrata, then crank or drain that player out on the same turn." },
      { t: "h", text: "Line 4: the double tap" },
      { t: "cards", names: ["Bloodletter of Aclazotz", "Virtus the Veiled", "Tetsuko Umezawa, Fugitive"], caption: "Twice the loss, half their life, no blockers." },
      { t: "list", items: [
        "<i-c>Bloodletter of Aclazotz</i-c>: if an opponent would lose life during your turn, they lose twice that much instead. Damage counts.",
        "<i-c>Virtus the Veiled</i-c>: a 1/1 deathtouch Assassin. When it deals combat damage to a player, that player loses half their life, rounded up.",
        "Half rounded up, doubled, is at least all of it. The player hit drops to 0 or less."
      ] },
      { t: "math", items: [
        { label: "Opponent at 40. Virtus deals 1 combat damage, doubled", value: "40 - 2 = 38" },
        { label: "Virtus trigger: half of 38 rounded up is 19, doubled", value: "38 - 38 = 0" },
        { label: "Same player at 37 instead: half rounded up is 19, doubled", value: "37 - 38 = -1" }
      ], total: "From any life total, Virtus plus Bloodletter on your turn kills the player it hits." },
      { t: "widget", id: "doubleTap" },
      { t: "h", text: "Getting Virtus through" },
      { t: "list", items: [
        "<i-c>Tetsuko Umezawa, Fugitive</i-c>: your creatures with power or toughness 1 or less can't be blocked. Virtus is a 1/1.",
        "<i-c>Rogue's Passage</i-c>: {4}, {T}: target creature can't be blocked this turn.",
        "Virtus has deathtouch, so blocking it costs them a creature anyway."
      ] },
      { t: "callout", tone: "warn", title: "Ramses breaks Tetsuko", html: "Ramses gives other Assassins +1/+1. Virtus becomes a 2/2, and Tetsuko no longer makes it unblockable. The same goes for Etrata, who becomes a 2/5. <i-c>Vito, Thorn of the Dusk Rose</i-c> isn't an Assassin, so he stays a 1/3 and stays unblockable. With both out, use <i-c>Rogue's Passage</i-c> or attack a player with no untapped blockers. Ramses has to be on the battlefield when the player loses, so you can't wait until after combat to cast him. Plan the evasion before you attack." },
      { t: "h", text: "Line 6: the hit list" },
      { t: "cards", names: ["Mari, the Killing Quill", "Toxic Deluge", "Etrata, the Silencer"], caption: "Kill their creatures, then knock them out." },
      { t: "steps", items: [
        { title: "Mari marks the dead", html: "<i-c>Mari, the Killing Quill</i-c>: whenever a creature an opponent controls dies, exile it with a hit counter on it." },
        { title: "Toxic Deluge fills the list", html: "Pay X life, all creatures get -X/-X. Every opposing creature that dies gets exiled with a hit counter. Pick X so the target player keeps one creature: the Silencer needs it." },
        { title: "The Silencer finishes", html: "<i-c>Etrata, the Silencer</i-c> can't be blocked. When she deals combat damage to a player, she exiles a target creature they control with a hit counter. If they now own three or more exiled cards with hit counters, they lose the game." },
        { title: "Ramses wins it", html: "The Silencer is an Assassin that attacked them. One player out, game over." }
      ] },
      { t: "callout", tone: "warn", title: "The Silencer needs a target", html: "Her trigger targets a creature that player controls. If they have no creature, the trigger does nothing, including the loss check. Leave them a creature, or hit someone who has one." },
      { t: "list", items: [
        "Only cards count. Tokens that die stop existing in exile, so they can't hold a hit counter.",
        "Ownership counts, not control. Hit counters land on cards that player owns.",
        "Mari's Assassins may remove a hit counter to draw and make Treasures. It says 'may': don't do it on the player you're about to knock out.",
        "Mari sees creatures that die at the same time as her, so Deluge works even if it kills her too.",
        "The Silencer shuffles herself into your library after the trigger. You only get one shot per copy."
      ] },
      { t: "h", text: "Getting the pieces" },
      { t: "table", head: ["Piece", "Mana value", "Transmute"], rows: [
        ["<i-c>Ramses, Assassin Lord</i-c>, <i-c>Bloodletter of Aclazotz</i-c>, <i-c>Etrata, the Silencer</i-c>", "4", "<i-c>Dimir House Guard</i-c>"],
        ["<i-c>Virtus the Veiled</i-c>, <i-c>Mari, the Killing Quill</i-c>, <i-c>Toxic Deluge</i-c>", "3", "<i-c>Drift of Phantasms</i-c>"],
        ["<i-c>Tetsuko Umezawa, Fugitive</i-c>", "2", "<i-c>Shred Memory</i-c>, <i-c>Muddle the Mixture</i-c>"]
      ] },
      { t: "p", html: "In the simulator these lines rarely end games, because it barely counts combat. In real games the Bloodletter, Tetsuko and Ramses package wins a lot through plain attacks." }
    ]
  },
  {
    id: "infinite-turns",
    title: "Win line 5: Infinite turns",
    kicker: "Combo 5",
    minutes: 6,
    summary: "Scroll of Fate manifests Wormfang Manta, Etrata flips it for four, Crystal Shard bounces it for an extra turn. Repeat.",
    blocks: [
      { t: "cards", names: ["Scroll of Fate", "Wormfang Manta", "Crystal Shard"], caption: "Three cards, five mana a turn." },
      { t: "p", html: "<i-c>Wormfang Manta</i-c> is a 6/1 flier with two triggers: when it enters, you skip your next turn. When it leaves the battlefield, you take an extra turn after this one. The trick is to get the second trigger without the first." },
      { t: "h", text: "The loop" },
      { t: "steps", items: [
        { title: "Manifest the Manta", html: "<i-c>Scroll of Fate</i-c>: {T}: manifest a card from your hand. The Manta enters as a face-down 2/2 with no abilities, so 'you skip your next turn' never triggers." },
        { title: "Flip it", html: "Etrata's ability, {2}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>. Turning face up isn't entering, so still no skip." },
        { title: "Bounce it", html: "<i-c>Crystal Shard</i-c>: {U}, {T}: return target creature to its owner's hand unless its controller pays {1}. You control it, so you just don't pay." },
        { title: "Take another turn", html: "The Manta left the battlefield face up, so you take an extra turn. Everything untaps. Do it again." }
      ] },
      { t: "math", items: [
        { label: "Etrata's flip", value: "{2}{U}{B}" },
        { label: "Crystal Shard's cheap mode", value: "{U}" },
        { label: "Scroll of Fate", value: "free, just {T}" },
        { label: "With Training Grounds, the flip is {U}{B}", value: "3 total" }
      ], total: "<b>5 mana a turn</b>, or <b>3 with Training Grounds</b>. Every extra turn untaps your lands first." },
      { t: "callout", tone: "warn", title: "Flip before you bounce", html: "A face-down Manta has no abilities. If you bounce it face down, you get no extra turn. Always turn it face up first." },
      { t: "callout", tone: "warn", title: "The Manta never attacks in the loop", html: "It's new every turn, so it's summoning sick when you flip and bounce it. Your extra turns win with your other creatures: Etrata's Assassins, cloaks, Virtus and Bloodletter. Each extra turn is another untap, draw and combat." },
      { t: "h", text: "Without Etrata" },
      { t: "p", html: "A manifested creature card can turn face up for its own mana cost. For the Manta that's {5}{U}{U}, plus {U} for the Shard. Eight mana a turn works, but only with a big board." },
      { t: "h", text: "Getting the pieces" },
      { t: "list", items: [
        "<i-c>Scroll of Fate</i-c> and <i-c>Crystal Shard</i-c> both have mana value 3. <i-c>Drift of Phantasms</i-c> transmutes for either.",
        "<i-c>Wormfang Manta</i-c> has mana value 7. Use a big tutor. It must be in your hand for the Scroll.",
        "Never cast the Manta normally. You skip your next turn."
      ] },
      { t: "callout", tone: "tip", title: "Tell the table", html: "Infinite turns are allowed in Bracket 4 but some groups dislike them. Mention it in the pregame talk. Once you're looping, show the loop and offer to shortcut to the attack that wins." }
    ]
  },
  {
    id: "tutors",
    title: "Tutors and transmute",
    kicker: "Finding pieces",
    minutes: 8,
    summary: "Fifteen tutors: what each costs, where the card goes, and the transmute map by mana value.",
    blocks: [
      { t: "p", html: "Most lines need two cards. The deck has fifteen tutors, so a tutor in your opening hand is often half a combo. The skill is picking the tutor that makes your next turn cheapest." },
      { t: "h", text: "The open tutors" },
      { t: "table", head: ["Tutor", "Cost", "Where it goes", "Notes"], rows: [
        ["<i-c>Demonic Tutor</i-c>", "{1}{B}", "Hand", "The clean one."],
        ["<i-c>Vampiric Tutor</i-c>", "{B}, instant", "Top of library", "Lose 2 life. Cast it at the end of the turn before yours."],
        ["<i-c>Imperial Seal</i-c>", "{B}, sorcery", "Top of library", "Lose 2 life. Best on turn 1."],
        ["<i-c>Grim Tutor</i-c>", "{1}{B}{B}", "Hand", "Lose 3 life."],
        ["<i-c>Diabolic Intent</i-c>", "{1}{B}, sacrifice a creature", "Hand", "Sacrifice a stolen cloak or a mercenary token."],
        ["<i-c>Beseech the Mirror</i-c>", "{1}{B}{B}{B}", "Exiled, then hand or cast", "Bargain an artifact, enchantment or token: cast the card free if its mana value is 4 or less."],
        ["<i-c>Wishclaw Talisman</i-c>", "{1}{B} to cast, then {1}, {T}", "Hand", "Only on your turn. Then an opponent gets the Talisman."],
        ["<i-c>Scheming Symmetry</i-c>", "{B}", "Top of library", "You and another target player each tutor to the top."],
        ["<i-c>Lim-Dûl's Vault</i-c>", "{U}{B}, instant", "Top of library", "Digs five at a time for 1 life per pile. Not a true tutor, but close."],
        ["<i-c>Tribute Mage</i-c>", "{2}{U}", "Hand", "Enters: find an artifact with mana value 2. <i-c>Mindcrank</i-c>, <i-c>Wishclaw Talisman</i-c> or a rock."]
      ] },
      { t: "h", text: "Transmute" },
      { t: "p", html: "Transmute is the Dimir guild's old mechanic. Pay the cost and discard the card: search for a card with the same mana value, reveal it, put it into your hand. Sorcery speed only. Each of these is also a cheap spell when you don't need the tutor." },
      { t: "table", head: ["Card", "Transmute cost", "Mana value", "Finds for the combos"], rows: [
        ["<i-c>Dizzy Spell</i-c>", "{1}{U}{U}", "1", "<i-c>Training Grounds</i-c>, <i-c>Changeling Outcast</i-c>, <i-c>Vampiric Tutor</i-c>, <i-c>Imperial Seal</i-c>, <i-c>Sol Ring</i-c>"],
        ["<i-c>Shred Memory</i-c>", "{1}{B}{B}", "2", "<i-c>Mindcrank</i-c>, <i-c>Duskmantle Guildmage</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c>, <i-c>Demonic Tutor</i-c>"],
        ["<i-c>Muddle the Mixture</i-c>", "{1}{U}{U}", "2", "Same as Shred Memory"],
        ["<i-c>Drift of Phantasms</i-c>", "{1}{U}{U}", "3", "<i-c>Scroll of Fate</i-c>, <i-c>Crystal Shard</i-c>, <i-c>Mari, the Killing Quill</i-c>, <i-c>Virtus the Veiled</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Marauding Blight-Priest</i-c>, <i-c>Toxic Deluge</i-c>, <i-c>Grim Tutor</i-c>"],
        ["<i-c>Dimir House Guard</i-c>", "{1}{B}{B}", "4", "<i-c>Ramses, Assassin Lord</i-c>, <i-c>Bloodletter of Aclazotz</i-c>, <i-c>Etrata, the Silencer</i-c>, <i-c>Roshan, Hidden Magister</i-c>, <i-c>Leyline of Transformation</i-c>, <i-c>Notion Thief</i-c>, <i-c>Beseech the Mirror</i-c>"]
      ] },
      { t: "callout", tone: "key", title: "Every transmute card can find a tutor", html: "Dizzy Spell finds Vampiric Tutor. Shred Memory and Muddle find Demonic Tutor. Drift finds Grim Tutor. House Guard finds Beseech the Mirror. When the piece you need isn't on your transmute's row, chain into a tutor that is open." },
      { t: "callout", tone: "warn", title: "Out of transmute range", html: "Mana value 5 or more: <i-c>Exquisite Blood</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Sanguine Bond</i-c>, <i-c>Vesuvan Shapeshifter</i-c>, <i-c>Fallen Shinobi</i-c>, <i-c>Brine Elemental</i-c>, <i-c>Wormfang Manta</i-c>. Spend open tutors on these, and transmutes on the rest." },
      { t: "widget", id: "tutorMap" },
      { t: "h", text: "Black-market tutors" },
      { t: "p", html: "Two of your tutors give an opponent a tutor too. Use them on purpose." },
      { t: "list", items: [
        "<b><i-c>Wishclaw Talisman</i-c>.</b> After you use it, an opponent gains control of it. They can use it on their turn and pass it on. Use it on the turn you go off, so they never get a turn with it. Don't hand it to a combo player.",
        "<b><i-c>Scheming Symmetry</i-c>.</b> You pick the other player. Pick the one least likely to win with a tutor.",
        "<b>With <i-c>Opposition Agent</i-c> out</b>, you control opponents while they search. You choose what they find, it's exiled, and you may play it. Their Wishclaw search or Symmetry search becomes your second tutor."
      ] },
      { t: "h", text: "Beseech the Mirror" },
      { t: "p", html: "Bargain means sacrificing an artifact, enchantment or token as you cast it. Treasures, a used <i-c>Mind Stone</i-c>, a <i-c>Mystic Remora</i-c> you'd stop paying for, or a mercenary token all work. Then a card with mana value 4 or less is cast for free: <i-c>Ramses, Assassin Lord</i-c>, <i-c>Bloodletter of Aclazotz</i-c>, <i-c>Notion Thief</i-c>, <i-c>Mindcrank</i-c>, <i-c>Marauding Blight-Priest</i-c>. A bigger card just goes to your hand." },
      { t: "h", text: "Which tutor, when" },
      { t: "steps", items: [
        { title: "Winning this turn?", html: "Use a tutor to hand: Demonic, Grim, Diabolic, Wishclaw or a transmute. Top-of-library tutors only help if you can draw it this turn." },
        { title: "Winning next turn?", html: "<i-c>Vampiric Tutor</i-c> or <i-c>Lim-Dûl's Vault</i-c> at the end of the turn before yours. You use mana that would untap anyway." },
        { title: "Two pieces missing?", html: "Transmute for one, open tutor for the other. The transmute card is the cheaper one to spend." },
        { title: "With Necropotence", html: "A card on top of your library can be taken right away: pay 1 life and it's exiled, then it joins your hand at your next end step." }
      ] }
    ]
  },
  {
    id: "stealing",
    title: "The black market: stealing",
    kicker: "Theft",
    minutes: 7,
    summary: "Etrata's cloaks, Gonti, Thief of Sanity, Fallen Shinobi, Opposition Agent, Praetor's Grasp, Notion Thief with Windfall, and Black Market Connections.",
    blocks: [
      { t: "p", html: "Half the fun of this deck is playing other people's cards. Stealing also pays for itself: every stolen card is card advantage, and <i-c>Gonti, Night Minister</i-c> turns each one into a Treasure." },
      { t: "table", head: ["Card", "What you take", "When"], rows: [
        ["<i-c>Etrata, Deadly Fugitive</i-c>", "Their top card, cloaked on your side", "Each Assassin that deals them combat damage"],
        ["<i-c>Gonti, Night Minister</i-c>", "Their top card, exiled face down. You may play it, with any mana.", "Each creature that deals them combat damage"],
        ["<i-c>Thief of Sanity</i-c>", "One of their top three, exiled. The other two go to their graveyard.", "When it deals them combat damage"],
        ["<i-c>Fallen Shinobi</i-c>", "Their top two, exiled. Play them free this turn.", "When it deals them combat damage"],
        ["<i-c>Opposition Agent</i-c>", "Whatever they search for", "Each time they search their library"],
        ["<i-c>Praetor's Grasp</i-c>", "Any card in their library", "Once, for {1}{B}{B}"],
        ["<i-c>Notion Thief</i-c>", "Their extra draws", "Every draw except the first in their draw step"]
      ] },
      { t: "h", text: "Cloaks" },
      { t: "list", items: [
        "A cloaked creature card flips for its own mana cost, or for {2}{U}{B} with Etrata. Big creatures are better through Etrata.",
        "A cloaked artifact, enchantment or land flips only through Etrata, and stays as that permanent.",
        "A cloaked instant or sorcery is exiled and cast for free. That's a spell you don't own, so Gonti gives you a Treasure.",
        "A cloak is also a 2/2 with ward {2}: a blocker, sacrifice fodder for <i-c>Culling the Weak</i-c> and <i-c>Diabolic Intent</i-c>."
      ] },
      { t: "h", text: "Gonti, Night Minister" },
      { t: "p", html: "Gonti has two abilities. Whenever any creature deals combat damage to one of your opponents, its controller exiles that opponent's top card face down and may play it. And whenever a player casts a spell they don't own, that player creates a Treasure." },
      { t: "callout", tone: "warn", title: "Gonti helps everyone", html: "Both abilities work for every player. If one opponent hits another, the attacker gets a card. If an opponent casts your stolen card back, they get a Treasure. Keep that in mind before you play him into a combat-heavy table." },
      { t: "callout", tone: "tip", title: "Treasures for stolen spells", html: "Gonti's Treasure comes from casting a spell you don't own: cards from Thief of Sanity, Fallen Shinobi, Praetor's Grasp, Opposition Agent, Gonti's own exile, and Etrata's free cast of a stolen instant. Flipping a stolen creature face up isn't casting it, so no Treasure." },
      { t: "h", text: "Thief of Sanity and Fallen Shinobi" },
      { t: "list", items: [
        "<i-c>Thief of Sanity</i-c> is a 2/2 flier for {1}{U}{B}. You may cast the card it takes for as long as it stays exiled, with any type of mana.",
        "<i-c>Fallen Shinobi</i-c> has ninjutsu {2}{U}{B}: return an unblocked attacker to hand and put Shinobi onto the battlefield tapped and attacking.",
        "<i-c>Changeling Outcast</i-c> can't be blocked, so it's a reliable ninjutsu target. You give up Etrata's trigger for the Outcast that turn.",
        "Shinobi's cards must be played this turn. Lands still need your land drop. Pick the best spells first."
      ] },
      { t: "h", text: "Opposition Agent" },
      { t: "p", html: "Flash, {2}{B}. You control opponents while they search their libraries. Each card they find is exiled, and you may play it, spending mana as if it were any color." },
      { t: "list", items: [
        "Flash it in when someone casts a tutor or cracks a fetchland. You get their tutor target, or their land.",
        "With <i-c>Wishclaw Talisman</i-c> or <i-c>Scheming Symmetry</i-c> in their hands, you decide what they find.",
        "It's also a hate piece. It stops opponents' tutor-based combos cold."
      ] },
      { t: "h", text: "Notion Thief and Windfall" },
      { t: "cards", names: ["Notion Thief", "Windfall"], caption: "Their new hands become yours." },
      { t: "p", html: "<i-c>Notion Thief</i-c>: if an opponent would draw a card except the first one in their draw step, they skip it and you draw instead. <i-c>Windfall</i-c>: each player discards their hand, then draws cards equal to the largest number discarded." },
      { t: "p", html: "With both out, every opponent discards their hand and draws nothing. You draw your own new hand plus all of theirs. Notion Thief has flash, so you can hold it until someone else wheels too." },
      { t: "callout", tone: "tip", title: "With the Guildmage active", html: "Windfall also puts every opponent's hand into their graveyard. If <i-c>Duskmantle Guildmage</i-c> is active and <i-c>Mindcrank</i-c> is out, that's the Mindcrank table kill." },
      { t: "h", text: "Black Market Connections" },
      { t: "p", html: "At the beginning of your first main phase, choose one or more: a Treasure for 1 life, a card for 2 life, a 3/2 changeling Shapeshifter for 3 life. Pick what the turn needs. The token is an Assassin, a Rogue and a Mercenary, so Etrata and Mari both use it." },
      { t: "callout", tone: "warn", title: "Watch your life", html: "<i-c>Necropotence</i-c>, <i-c>Black Market Connections</i-c>, the fetchland, shocklands and the tutors all cost life. Count it every turn. <i-c>Exquisite Blood</i-c> and <i-c>Bloodthirsty Conqueror</i-c> give some back." }
    ]
  },
  {
    id: "mana",
    title: "Mana, opening hands and mulligans",
    kicker: "Lands and rocks",
    minutes: 7,
    summary: "The 31 lands, the rocks, Mox Amber's legends, what to keep, and the buy list.",
    blocks: [
      { t: "h", text: "The mana" },
      { t: "p", html: "31 lands, seven rocks and two rituals. Etrata costs {1}{U}{B}, and many combo turns need both colors, so fixing matters more than raw speed." },
      { t: "cards", names: ["Sol Ring", "Mox Amber", "Arcane Signet", "Talisman of Dominance", "Dimir Signet", "Fellwar Stone", "Mind Stone"], caption: "The rocks." },
      { t: "table", head: ["Rock", "Cost", "Notes"], rows: [
        ["<i-c>Sol Ring</i-c>", "{1}", "{C}{C}"],
        ["<i-c>Mox Amber</i-c>", "{0}", "One mana of any color among your legendary creatures. Nothing without one."],
        ["<i-c>Arcane Signet</i-c>", "{2}", "{U} or {B}"],
        ["<i-c>Talisman of Dominance</i-c>", "{2}", "{C}, or {U} or {B} for 1 damage"],
        ["<i-c>Dimir Signet</i-c>", "{2}", "{1}, {T}: {U}{B}"],
        ["<i-c>Fellwar Stone</i-c>", "{2}", "A color an opponent's land could make. Usually fine, not always."],
        ["<i-c>Mind Stone</i-c>", "{2}", "{C}. Later, {1} and sacrifice it to draw. Also bargain fodder."],
        ["<i-c>Dark Ritual</i-c>", "{B}", "{B}{B}{B} once"],
        ["<i-c>Culling the Weak</i-c>", "{B}, sacrifice a creature", "{B}{B}{B}{B} once. Sacrifice a stolen cloak."]
      ] },
      { t: "h", text: "Mox Amber's legends" },
      { t: "p", html: "<i-c>Mox Amber</i-c> needs a legendary creature or planeswalker. The deck has nine legendary creatures, Etrata included, so it's live most games once she's out." },
      { t: "list", items: [
        "<b>{U} or {B}:</b> <i-c>Etrata, Deadly Fugitive</i-c>, <i-c>Etrata, the Silencer</i-c>, <i-c>Ramses, Assassin Lord</i-c>.",
        "<b>{B}:</b> <i-c>Mari, the Killing Quill</i-c>, <i-c>Gonti, Night Minister</i-c>, <i-c>Roshan, Hidden Magister</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Virtus the Veiled</i-c>.",
        "<b>{U}:</b> <i-c>Tetsuko Umezawa, Fugitive</i-c>.",
        "Legendary lands like <i-c>Otawara, Soaring City</i-c> don't count. Only creatures and planeswalkers."
      ] },
      { t: "h", text: "The lands" },
      { t: "table", head: ["Land", "Untapped when"], rows: [
        ["<i-c>Watery Grave</i-c>", "You pay 2 life"],
        ["<i-c>Drowned Catacomb</i-c>", "You control an Island or a Swamp"],
        ["<i-c>Darkslick Shores</i-c>", "You control two or fewer other lands: early"],
        ["<i-c>Sunken Hollow</i-c>", "You control two or more basic lands"],
        ["<i-c>Morphic Pool</i-c>", "You have two or more opponents: always in a normal pod"],
        ["<i-c>Gloomlake Verge</i-c>", "Always for {U}. {B} only if you control an Island or a Swamp."],
        ["<i-c>Undercity Sewers</i-c>", "Never. Surveil 1 when it enters."],
        ["<i-c>Underground River</i-c>", "Always. Colored mana costs 1 damage."],
        ["<i-c>Path of Ancestry</i-c>", "Never. Scry 1 when its mana casts a Vampire or Assassin creature."],
        ["<i-c>Polluted Delta</i-c>", "Fetches an Island or Swamp card: <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c>, <i-c>Undercity Sewers</i-c> or a basic."]
      ] },
      { t: "list", items: [
        "<i-c>Otawara, Soaring City</i-c> and <i-c>Takenuma, Abandoned Mire</i-c>: lands that channel into bounce or regrowth. Each legendary creature you control makes the channel {1} cheaper.",
        "<i-c>Rogue's Passage</i-c>: {4}, {T}: a creature can't be blocked. Gets Virtus, the Manta or a cloak through.",
        "<i-c>Secluded Courtyard</i-c>: name a creature type as it enters. Its colored mana only casts creatures of that type or pays abilities of creatures of that type. Assassin or Vampire are the usual picks.",
        "<i-c>Command Tower</i-c>: {U} or {B}."
      ] },
      { t: "callout", tone: "tip", title: "Default fetch", html: "<i-c>Watery Grave</i-c>, untapped for 2 life, when you need both colors now. <i-c>Undercity Sewers</i-c> when you can afford a tapped land. A basic when it turns on <i-c>Sunken Hollow</i-c> or <i-c>Drowned Catacomb</i-c> later." },
      { t: "h", text: "Opening hands" },
      { t: "callout", tone: "key", title: "The rule", html: "Keep three to five lands, or two lands with a rock. That's the rule the simulator uses. On top of that, you want both colors by turn 3 and something to do: a draw engine, a tutor or a combo piece." },
      { t: "list", items: [
        "<b>Keep.</b> <i-c>Watery Grave</i-c>, <i-c>Swamp</i-c>, <i-c>Island</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Rhystic Study</i-c>, <i-c>Shred Memory</i-c>, <i-c>Exquisite Blood</i-c>. Etrata on turn 3, Shred Memory for a piece later, a drain already in hand.",
        "<b>Keep.</b> <i-c>Polluted Delta</i-c>, <i-c>Island</i-c>, <i-c>Sol Ring</i-c>, <i-c>Mox Amber</i-c>, <i-c>Changeling Outcast</i-c>, <i-c>Demonic Tutor</i-c>, <i-c>Counterspell</i-c>. Fast, and the Outcast starts cloaking on turn 3.",
        "<b>Keep.</b> <i-c>Darkslick Shores</i-c>, <i-c>Swamp</i-c>, <i-c>Gloomlake Verge</i-c>, <i-c>Leyline of Transformation</i-c>, <i-c>Thief of Sanity</i-c>, <i-c>Mindcrank</i-c>, <i-c>Ponder</i-c>. Leyline starts on the battlefield for free.",
        "<b>Ship.</b> <i-c>Island</i-c>, <i-c>Wormfang Manta</i-c>, <i-c>Brine Elemental</i-c>, <i-c>Sanguine Bond</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Toxic Deluge</i-c>, <i-c>Counterspell</i-c>. One land and a pile of five-plus drops.",
        "<b>Ship.</b> Six lands and <i-c>Brainstorm</i-c>. Nothing to do, and no engine."
      ] },
      { t: "callout", tone: "tip", title: "Necropotence in the opener", html: "<i-c>Necropotence</i-c> costs {B}{B}{B}. With <i-c>Dark Ritual</i-c> it can come down on turn 1. It skips your draw step, and every card costs 1 life. Count your life against the fetch, shocks and tutors before you take ten." },
      { t: "h", text: "Buying the deck" },
      { t: "p", html: "About $1,108 at TCGplayer prices, around 940€. The biggest cards: <i-c>Imperial Seal</i-c> $180, <i-c>Mox Amber</i-c> $87, <i-c>Fierce Guardianship</i-c> $66, <i-c>Rhystic Study</i-c> $64, <i-c>Demonic Tutor</i-c> $63, <i-c>Vampiric Tutor</i-c> $57. Check Cardmarket before you buy." },
      { t: "p", html: "To try it first, proxy it. 45 cards, 16 basics included, carry over from the current Etrata deck. The other 55 can be proxies. The Shop's \"Proxy it\" section has the list." },
      { t: "widget", id: "buyList" }
    ]
  },
  {
    id: "turn-by-turn",
    title: "A sample game, turn by turn",
    kicker: "Sequencing",
    minutes: 7,
    summary: "A Mindcrank game that kills the table on turn 6, a faster vampire start, and the checklist for every turn.",
    blocks: [
      { t: "h", text: "Game one: the crank" },
      { t: "turns", items: [
        { turn: "T1", play: "<i-c>Island</i-c>. <i-c>Ponder</i-c>.", note: "Set up the next draws." },
        { turn: "T2", play: "<i-c>Swamp</i-c>. <i-c>Talisman of Dominance</i-c>.", note: "Four mana next turn." },
        { turn: "T3", play: "<i-c>Watery Grave</i-c>, paying 2 life. <i-c>Etrata, Deadly Fugitive</i-c> off the three lands. <i-c>Mox Amber</i-c>. Mox for {B} plus Talisman for {C}: <i-c>Night's Whisper</i-c>.", note: "Etrata out, Mox live, two new cards." },
        { turn: "T4", play: "<i-c>Swamp</i-c>. Six mana. Transmute <i-c>Shred Memory</i-c> for {1}{B}{B}: find <i-c>Mindcrank</i-c>. Cast it for {2}.", note: "One piece down. One mana left." },
        { turn: "T5", play: "<i-c>Island</i-c>. <i-c>Duskmantle Guildmage</i-c> for {U}{B}. Hold <i-c>Counterspell</i-c> and {1}{U}{B}.", note: "If an opponent casts a sorcery, activate in response and kill them." },
        { turn: "T6", play: "Land. Activate the Guildmage, {1}{U}{B}. Cast <i-c>Windfall</i-c>, {2}{U}. Every opponent discards their hand.", note: "Each discarded card costs 1 life and mills 1. Every opponent with a hand dies." }
      ] },
      { t: "h", text: "Game two: the vampire start" },
      { t: "turns", items: [
        { turn: "T1", play: "<i-c>Swamp</i-c>. <i-c>Sol Ring</i-c>.", note: "" },
        { turn: "T2", play: "<i-c>Island</i-c>. <i-c>Arcane Signet</i-c> off Sol Ring. Then <i-c>Etrata, Deadly Fugitive</i-c> off Island, Swamp and Signet.", note: "Etrata on turn 2." },
        { turn: "T3", play: "<i-c>Watery Grave</i-c>, paying 2 life. Six mana. <i-c>Exquisite Blood</i-c>.", note: "The drain is out." },
        { turn: "T4", play: "Land. <i-c>Marauding Blight-Priest</i-c> and <i-c>Changeling Outcast</i-c>. Hold up <i-c>Counterspell</i-c>.", note: "The next life any opponent loses kills the table. A fetchland or a shock is enough." },
        { turn: "T5", play: "Attack with <i-c>Changeling Outcast</i-c>. It can't be blocked.", note: "1 damage starts the loop. Everyone dies." }
      ] },
      { t: "h", text: "Every turn" },
      { t: "steps", items: [
        { title: "Upkeep", html: "Pay or skip <i-c>Mystic Remora</i-c>'s upkeep. Turn Vesuvan face down if you're locking. Look at your cloaks." },
        { title: "Draw step", html: "Skipped with <i-c>Necropotence</i-c> out. Pay for Necro cards in your second main phase instead. They reach your hand at your end step." },
        { title: "First main phase", html: "<i-c>Black Market Connections</i-c> triggers here. Cast Assassin enablers and Etrata before combat, not after." },
        { title: "Combat", html: "Attack with Assassins that can connect. Each one cloaks. Gonti, Thief of Sanity and Shinobi steal on damage." },
        { title: "Second main phase", html: "Flip cloaks, cast what you stole, set up the next turn. Keep counter mana open if a combo piece is on the battlefield." },
        { title: "Their turns", html: "Instant tutors at the last end step before yours. Flash in <i-c>Opposition Agent</i-c> or <i-c>Notion Thief</i-c> when they tutor or wheel." }
      ] },
      { t: "widget", id: "playChecklist" },
      { t: "h", text: "Sequencing traps" },
      { t: "list", items: [
        "<b>Casting the Manta.</b> Never cast <i-c>Wormfang Manta</i-c> normally. Manifest it with <i-c>Scroll of Fate</i-c>.",
        "<b>Bouncing a face-down Manta.</b> No extra turn. Flip it first.",
        "<b>Wishclaw too early.</b> Use <i-c>Wishclaw Talisman</i-c> on the turn you win, not before.",
        "<b>Transmute at instant speed.</b> You can't. Transmute is sorcery speed only.",
        "<b>Ramses before Tetsuko attacks.</b> Ramses makes Virtus a 2/2 and Tetsuko stops working on it.",
        "<b>Necropotence and the life bill.</b> Pay for cards after your combat, when you know your life total. They arrive at the beginning of your end step, so pay before it starts, or they wait a full turn."
      ] }
    ]
  },
  {
    id: "interaction",
    title: "Interaction and protecting the combo",
    kicker: "Defense",
    minutes: 6,
    summary: "The counterspells, the free spells, the removal, and how to keep your pieces alive on the combo turn.",
    blocks: [
      { t: "cards", names: ["Fierce Guardianship", "Deadly Rollick", "Counterspell", "Swan Song", "An Offer You Can't Refuse"], caption: "Two are free while Etrata is out." },
      { t: "table", head: ["Card", "Answers", "Notes"], rows: [
        ["<i-c>Fierce Guardianship</i-c>", "A noncreature spell", "Free if you control your commander. Otherwise {2}{U}."],
        ["<i-c>Deadly Rollick</i-c>", "A creature, exiled", "Free if you control your commander. Otherwise {3}{B}."],
        ["<i-c>Counterspell</i-c>", "Any spell", "{U}{U}. Your only hard counter for creatures."],
        ["<i-c>Swan Song</i-c>", "An enchantment, instant or sorcery", "They get a 2/2 flying Bird."],
        ["<i-c>An Offer You Can't Refuse</i-c>", "A noncreature spell", "They get two Treasures. Use it on the spell that matters, or on your own spell for the Treasures."],
        ["<i-c>Muddle the Mixture</i-c>", "An instant or sorcery", "Or transmute it for a mana value 2 piece."],
        ["<i-c>Infernal Grasp</i-c>", "A creature, destroyed", "Lose 2 life."],
        ["<i-c>Dizzy Spell</i-c>", "A creature's attack, -3/-0", "Mostly a transmute for Training Grounds."],
        ["<i-c>Cyclonic Rift</i-c>", "A nonland permanent you don't control", "Overload for {6}{U}: every nonland permanent you don't control. Your stolen cloaks stay."],
        ["<i-c>Toxic Deluge</i-c>", "Creatures, all of them", "Pick X with care. Etrata survives X of 3 or less."],
        ["<i-c>Otawara, Soaring City</i-c>", "An artifact, creature, enchantment or planeswalker, bounced", "A land that's also an answer."],
        ["<i-c>Shred Memory</i-c>", "Up to four cards from one graveyard", "Stops a reanimation or flashback plan."]
      ] },
      { t: "callout", tone: "key", title: "Keep Etrata on the battlefield", html: "With her out, Fierce Guardianship and Deadly Rollick cost nothing, the Brine and Manta flips cost four, and Mox Amber works. Her being out is half your protection." },
      { t: "h", text: "Protecting the combo turn" },
      { t: "steps", items: [
        { title: "Count their answers", html: "Who has open mana and cards? Who is blue? Who has a sacrifice outlet or an instant-speed removal spell?" },
        { title: "Bait first", html: "Cast a threat they must answer before the real piece: <i-c>Rhystic Study</i-c>, <i-c>Necropotence</i-c>, a big stolen spell." },
        { title: "Hide the piece", html: "A morph or a manifest is a mystery 2/2. Opponents don't know it's <i-c>Brine Elemental</i-c> until it flips." },
        { title: "Flip as a special action when you can", html: "Natural flips and morph flips can't be responded to. Etrata's flip can. When the special action is affordable, it's safer." },
        { title: "Keep a counter up", html: "Two blue for <i-c>Counterspell</i-c>, or Etrata on the battlefield for free <i-c>Fierce Guardianship</i-c>." }
      ] },
      { t: "callout", tone: "warn", title: "Face-down isn't ward", html: "Only cloaks have ward {2}. Your morphs and manifests have no ward. A 2/2 dies to almost anything." },
      { t: "h", text: "Opponents' combos" },
      { t: "list", items: [
        "<i-c>Opposition Agent</i-c> in response to a tutor takes the piece.",
        "<i-c>Notion Thief</i-c> stops wheels and draw engines from helping them.",
        "<i-c>Praetor's Grasp</i-c> can take their key combo piece out of their library before they find it.",
        "The Brine lock stops anyone who needs untapped mana on their own turn."
      ] }
    ]
  },
  {
    id: "reading-the-table",
    title: "Reading the table and matchups",
    kicker: "Decisions",
    minutes: 7,
    summary: "Which line to chase each game, what hurts the deck, and how to play against combo, control, creatures and stax.",
    blocks: [
      { t: "p", html: "Six lines means a choice every game. Pick the one that's closest to done and that the table is worst at stopping." },
      { t: "steps", items: [
        { title: "What's closest?", html: "Count the missing pieces for each line. Two-card lines with one piece out are usually the answer. In the simulator, the AI always chased the closest line, and the two-card combos ended most games." },
        { title: "What can they stop?", html: "Enchantment removal hurts the vampire drains. Artifact removal hurts Mindcrank and the Scroll. Creature removal hurts the Guildmage and Vesuvan. Look at what each opponent's deck does." },
        { title: "Who threatens to win?", html: "If one opponent is about to win, kill them first. Mindcrank and the Guildmage, or the double tap, can remove one player at instant speed or in one combat." },
        { title: "Pick the tutor", html: "The tutor that makes next turn cheapest. See the tutor chapter." }
      ] },
      { t: "widget", id: "comboFinder" },
      { t: "h", text: "How the simulator's games ended" },
      { t: "table", head: ["Line", "Share of wins, with answers"], rows: [
        ["Mindcrank and the Guildmage", "42%"],
        ["The vampire court", "23%"],
        ["The Brine lock", "11%"],
        ["Manta infinite turns", "2%"],
        ["The double tap", "1%"],
        ["The hit list", "Under 1%"]
      ] },
      { t: "p", html: "The simulator counts Mindcrank as a full win and barely models combat. Real games are more mixed: the Assassins and stolen cards win plenty of games that the sim scores as slower." },
      { t: "h", text: "What hurts the deck" },
      { t: "table", head: ["Hate card type", "What it stops", "Your answer"], rows: [
        ["Rest in Peace, graveyard exile effects", "Mindcrank and the Guildmage", "Switch to the vampire court or the lock"],
        ["'Can't gain life' or 'can't lose life' effects", "The vampire court", "Mindcrank, the lock, the Ramses lines"],
        ["Cursed Totem, Linvala, Pithing Needle", "Etrata's flips, the Guildmage, Vito", "<i-c>Infernal Grasp</i-c>, <i-c>Deadly Rollick</i-c>, <i-c>Cyclonic Rift</i-c>"],
        ["Null Rod, Collector Ouphe", "Scroll, Shard, Wishclaw, your rocks", "Creature removal on the Ouphe, or win through creatures and enchantments"],
        ["Torpor Orb, Hushbringer", "<i-c>Tribute Mage</i-c>'s search", "Use the transmutes instead"],
        ["Search limiters like Aven Mindcensor", "Every tutor and transmute sees only the top four cards", "Lean on the draw engines and theft: <i-c>Rhystic Study</i-c>, <i-c>Necropotence</i-c>, Gonti"]
      ] },
      { t: "h", text: "Against each kind of table" },
      { t: "table", head: ["Opponents", "What to do"], rows: [
        ["Fast combo", "Hold <i-c>Opposition Agent</i-c>, <i-c>Fierce Guardianship</i-c> and <i-c>Counterspell</i-c>. Race with the two-card lines. Kill the combo player first with the Guildmage."],
        ["Counterspell-heavy blue", "Hide pieces face down. Bait with a draw engine. Turning a card face up isn't casting it, so counterspells can't stop a flip. They can still answer the face-down creature."],
        ["Creature aggro", "Etrata is a 1/4 deathtouch blocker. <i-c>Toxic Deluge</i-c> with Mari out adds hit counters. The vampire drains gain you life."],
        ["Removal-heavy midrange", "Lean on the enchantment lines: <i-c>Exquisite Blood</i-c>, <i-c>Sanguine Bond</i-c>. Keep Etrata back as a blocker."],
        ["Stax and tax", "Your combos are cheap. The Brine lock is stax that hits harder than theirs."]
      ] },
      { t: "callout", tone: "tip", title: "Make the right enemy", html: "Stealing makes people angry. Take from the player who's ahead, not the one who's behind. Your theft keeps the table balanced while you set up." }
    ]
  },
  {
    id: "rules-corner",
    title: "Rules corner",
    kicker: "Tricky interactions",
    minutes: 7,
    summary: "The rulings that come up with this deck: manifest, flips, Vesuvan, Bloodletter, Virtus, Ramses, Wishclaw and more.",
    blocks: [
      { t: "qa", items: [
        { q: "I manifest Wormfang Manta with Scroll of Fate. Do I skip my next turn?", a: "No. It enters as a face-down 2/2 with no abilities, so its enters trigger doesn't exist when it enters." },
        { q: "I turn the Manta face up. Do I skip a turn now?", a: "No. Turning face up isn't entering the battlefield. Its enters trigger never happens." },
        { q: "I bounce the Manta while it's face down. Extra turn?", a: "No. A face-down creature has no abilities, so its leaves trigger doesn't exist. Turn it face up first." },
        { q: "Does Crystal Shard need the controller's permission?", a: "It returns the creature unless its controller pays {1}. On your own Manta, you're the controller, so you just don't pay." },
        { q: "Does Vesuvan Shapeshifter flipped as a copy of Brine Elemental trigger Brine's ability?", a: "Yes. It's turned face up as a copy of Brine, so Brine's 'when turned face up' ability triggers. That's the whole lock." },
        { q: "What does Vesuvan cost to flip?", a: "Its own morph cost, {1}{U}. It's a special action, so nobody can respond to the flip itself." },
        { q: "Does Bloodletter double life loss on opponents' turns?", a: "No. Only during your turn. On their turn, Mindcrank and the vampire loop work at normal speed." },
        { q: "Virtus hits a player at 39 with Bloodletter out. What happens?", a: "Virtus's 1 combat damage is doubled to 2, leaving 37. Then the trigger: half of 37 rounded up is 19, doubled to 38. They end at -1." },
        { q: "Does Ramses need his Assassin to deal damage?", a: "No. The player only has to have been attacked this turn by an Assassin you controlled. Ramses must be on the battlefield when they lose." },
        { q: "Ramses is out. Does Tetsuko still make Virtus unblockable?", a: "No. Ramses gives other Assassins +1/+1, so Virtus is a 2/2. Tetsuko only covers creatures with power or toughness 1 or less." },
        { q: "I use Wishclaw Talisman. What happens next?", a: "You search for any card. Then an opponent gains control of the Talisman. They can activate it only during their own turn, and then it passes to one of their opponents." },
        { q: "Can I use Wishclaw on an opponent's turn?", a: "No. It says activate only during your turn." },
        { q: "Opposition Agent is out and an opponent uses Wishclaw. Who picks?", a: "You do. You control them while they search. The card they find is exiled, and you may play it." },
        { q: "Does Training Grounds make Etrata's flip cost {B}?", a: "No. It only removes generic mana, and never below one mana. {2}{U}{B} becomes {U}{B}." },
        { q: "Does Training Grounds reduce Brine's morph cost?", a: "No. Turning a morph face up is a special action, not an activated ability." },
        { q: "Etrata flips a cloaked instant. When do I cast it?", a: "Right away, while her ability resolves, for free. If you don't, it stays exiled." },
        { q: "My cloak gets bounced by an opponent's Cyclonic Rift. Where does it go?", a: "To its owner's hand. A cloak you took from an opponent goes back to that opponent." },
        { q: "Does my own overloaded Cyclonic Rift bounce my stolen cloaks?", a: "No. It only hits nonland permanents you don't control. You control the cloaks." },
        { q: "Can Etrata, the Silencer knock out a player with no creatures?", a: "No. Her trigger targets a creature that player controls. With no target, the whole trigger does nothing." },
        { q: "Does Notion Thief stop an opponent's normal draw?", a: "No. The first card in each of their draw steps is safe. Every other draw becomes yours." },
        { q: "Are Fierce Guardianship and Deadly Rollick free with Etrata in the command zone?", a: "No. You must control your commander, which means she's on the battlefield." },
        { q: "Can I transmute in response to something?", a: "No. Transmute is sorcery speed only: your main phase, empty stack." }
      ] }
    ]
  },
  {
    id: "pregame",
    title: "Bracket 4 and the pregame talk",
    kicker: "Before you shuffle",
    minutes: 4,
    summary: "Where this deck sits in Bracket 4, its Game Changers, and what to tell the table.",
    blocks: [
      { t: "h", text: "What Bracket 4 means" },
      { t: "p", html: "Brackets are a tool for the pregame conversation, not enforced rules. Bracket 4 is \"Optimized\": decks are lethal, consistent and fast, any number of Game Changers is allowed, and beyond the banned list nothing is restricted. Two-card combos, extra turns and tutors are all fine. Bracket 5 is cEDH." },
      { t: "h", text: "Where this deck sits" },
      { t: "p", html: "Mid to high Bracket 4. It has no Thassa's Oracle and no Mana Vault. It wins on turns 6 to 8 most of the time, slower than a cEDH deck, faster than most casual decks." },
      { t: "h", text: "The 9 Game Changers" },
      { t: "cards", names: ["Necropotence", "Imperial Seal", "Demonic Tutor", "Vampiric Tutor", "Opposition Agent", "Notion Thief", "Rhystic Study", "Fierce Guardianship", "Cyclonic Rift"], caption: "All nine." },
      { t: "h", text: "What to tell the table" },
      { t: "list", items: [
        "<b>Two-card infinite combos:</b> <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with <i-c>Marauding Blight-Priest</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c> or <i-c>Sanguine Bond</i-c>. <i-c>Mindcrank</i-c> with <i-c>Duskmantle Guildmage</i-c>.",
        "<b>A permanent untap lock:</b> <i-c>Brine Elemental</i-c> and <i-c>Vesuvan Shapeshifter</i-c>. Opponents never untap again.",
        "<b>Infinite turns:</b> <i-c>Scroll of Fate</i-c>, <i-c>Wormfang Manta</i-c> and <i-c>Crystal Shard</i-c>.",
        "<b>A lot of stealing:</b> cards from your libraries and your tutors.",
        "<b>Fifteen tutors and 9 Game Changers.</b>",
        "<b>Speed:</b> usually turn 6 to 8."
      ] },
      { t: "callout", tone: "key", title: "A script you can use", html: "\"This is Bracket 4, mid to high. Dimir Etrata, lots of stealing and tutors, nine Game Changers. It has two-card infinites, a Brine Elemental untap lock and an infinite-turns loop. Usually wins around turn 6 to 8. Is that the level we want?\"" },
      { t: "callout", tone: "tip", title: "If the table is softer", html: "Leave the lock and the Manta loop in the sideboard, or play the theft game only: Etrata, Gonti and the thieves, no combo tutoring. Or play another deck. A good game for everyone beats a fast win." },
      { t: "h", text: "Weird extras" },
      { t: "p", html: "The write-up lists swaps if you want even stranger games: Phyrexian Dreadnought manifested by the Scroll and flipped for four (turning face up isn't entering, so you never sacrifice anything), Kheru Spellsnatcher, Expropriate cast free off the Scroll and Etrata, Unstoppable Slasher as a second halver, Grim Hireling, Psychic Frog and Ransom Note." },
      { t: "p", html: "Cut from v1 for speed: Expropriate, Mindslaver, Thieving Amalgam, Silent-Blade Oni, Hostage Taker, Gonti, Lord of Luxury, Tinybones, Kheru Spellsnatcher, Whispering Madness, Phyrexian Arena, Bloodchief Ascension, Arcane Adaptation, Mischievous Sneakling, Unstoppable Slasher, Dimir Aqueduct and Exotic Orchard." }
    ]
  }
];
