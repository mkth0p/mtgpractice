/* The long-form playing guide for the Corrupted Etrata deck, built around the "heist closer" list
   (Etrata Heist: Etrata, Deadly Fugitive as a Bracket 4 theft-aggro deck, with Ramses, Assassin Lord as the
   first kill and the vampire drain loop as the second). The older "v3 drain list" stays as a variant.
   Every number comes from the bot benches in research/etrata-theft-aggro/local/REPORT.md (5,040 four-player
   games per field unless a line says otherwise) and is a bot number, not a human one.
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Widgets used: killFinder, tutorMap, halveCalc, pilotRules, benchTable, playChecklist, listPicker, buyList, proxyList, quiz.
   Card mentions use <i-c>Exact Card Name</i-c> only for cards in the heist list or the v3 list; mana symbols are
   written as {U}, {B}, {2}, {T}, {C}. Cards that are in neither list (opponents' cards, tested and cut cards)
   are written as plain text. */
window.CETRATA_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "The plan, the two kills, the numbers, the price, and what to tell the table.",
    blocks: [
      { t: "p", html: "Corrupted Etrata is a blue-black Bracket 4 deck led by <i-c>Etrata, Deadly Fugitive</i-c>. This list is the heist closer: cheap evasive Assassins hit the other players, and every hit steals the top card of that player's library as a face-down 2/2 that fights for you." },
      { t: "cards", names: ["Etrata, Deadly Fugitive", "Changeling Outcast", "Ramses, Assassin Lord", "Exquisite Blood"], caption: "The commander, the best one-drop, the first kill and half of the second." },
      { t: "h", text: "The plan in four beats" },
      { t: "steps", items: [
        { title: "Turns 1 to 2: cheap evasive Assassins", html: "<i-c>Changeling Outcast</i-c>, <i-c>Hired Poisoner</i-c>, <i-c>Slither Blade</i-c>, <i-c>Mothdust Changeling</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c> and friends, with eight pieces of fast mana behind them." },
        { title: "Etrata when an Assassin connects", html: "Her trigger works the turn she's cast. Each Assassin that deals combat damage to an opponent cloaks the top card of their library under your control." },
        { title: "The snowball", html: "Type-changers make the stolen 2/2s Assassins, so they steal too. Lords pump them, copies of Etrata double every steal, and <i-c>They Came from the Pipes</i-c> and <i-c>Satoru, the Infiltrator</i-c> turn steals into cards." },
        { title: "Kill one player", html: "<i-c>Ramses, Assassin Lord</i-c>: if a player loses the game after an Assassin of yours attacked them this turn, you win. Or the drain loop, which kills the whole table." }
      ] },
      { t: "h", text: "Two kills" },
      { t: "list", items: [
        "<b>1. Ramses.</b> Tutor for him first. With him out, one dead player is the game. The halvers (<i-c>Virtus the Veiled</i-c>, <i-c>Unstoppable Slasher</i-c>, <i-c>Quietus Spike</i-c>) and <i-c>Bloodletter of Aclazotz</i-c> take one player from any life total to zero in one hit.",
        "<b>2. The drain loop.</b> <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>, plus <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c>. One of each and any life loss kills every opponent. It needs no Ramses and no combat."
      ] },
      { t: "widget", id: "killFinder" },
      { t: "h", text: "The numbers" },
      { t: "p", html: "Measured in this site's engine, 5,040 four-player bot games per field, with bots in every seat. These are bot numbers: a human Bracket 4 table kills Ramses faster and holds up more interaction, so expect less, not more." },
      { t: "table", head: ["", "vs three precons", "vs three Bracket 4 bots"], rows: [
        ["Win rate", "47.9% ±0.7", "27.5% ±0.6"],
        ["Average winning round", "9.0", "8.0"],
        ["Wins by round 7 / by round 8", "31% / 49% of the wins", "48% / 67% of the wins"],
        ["Cards stolen a game", "7.3", "5.1"],
        ["Without Etrata (measured on the snowball list)", "16.7 points lower", "7.0 points lower"]
      ] },
      { t: "p", html: "A fair game in a four-player pod is 25%. The deck clears that against both fields, but it isn't the fastest Etrata list on this site: the v3 drain list wins more bot games. The heist is the list that wins by attacking and stealing. The variants chapter compares them." },
      { t: "callout", tone: "key", title: "Tell the table first", html: "\"Bracket 4, nine Game Changers, lots of tutors. Dimir Etrata: I steal the top card of your library every time an Assassin hits you. Ramses wins the game when I kill one of you, and there's a two-card infinite drain loop. In bot games it wins around round 8 or 9.\"" },
      { t: "callout", tone: "tip", title: "Cost", html: "$1,323.02 for the 100 cards, cheapest nonfoil paper printing of each (Scryfall prices of 2026-10-05). The big ones are <i-c>Imperial Seal</i-c> ($170.58), <i-c>Mox Amber</i-c> ($87.79) and <i-c>Demonic Tutor</i-c> ($63.10). Or proxy it: 43 cards, 15 basics included, carry over from your Etrata deck, and the other 57 can be proxies. The variants chapter has both lists." }
    ]
  },
  {
    id: "how-etrata-works",
    title: "How Etrata works",
    kicker: "The commander",
    minutes: 6,
    summary: "Cloak, ward, what a face-down creature is, Etrata's {2}{U}{B} flip, and why her trigger works the turn she's cast.",
    blocks: [
      { t: "cards", names: ["Etrata, Deadly Fugitive"], caption: "{1}{U}{B}, a 1/4 deathtouch Vampire Assassin." },
      { t: "p", html: "Etrata has three abilities. In this deck the third one is the engine." },
      { t: "steps", items: [
        { title: "Deathtouch", html: "A 1/4 deathtouch creature blocks well and trades with anything. Most turns she's worth more alive than attacking." },
        { title: "The granted flip", html: "Face-down creatures you control have \"{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.\" It exists only while Etrata is on the battlefield." },
        { title: "The cloak trigger", html: "Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library. One trigger for each Assassin that connects." }
      ] },
      { t: "h", text: "Cloak" },
      { t: "p", html: "To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. The card belongs to the opponent whose library it came from, but you control it. You can look at it any time; they can't." },
      { t: "list", items: [
        "<b>Ward {2}.</b> When an opponent's spell or ability targets it, that spell or ability is countered unless they pay {2}. Wraths don't target, so ward doesn't help against them.",
        "<b>If it's a creature card,</b> you can turn it face up any time you have priority by paying its mana cost. That's a special action: it doesn't use the stack and can't be responded to.",
        "<b>If it leaves the battlefield,</b> it's revealed and goes to its owner's graveyard, hand or library. A stolen card always goes home."
      ] },
      { t: "h", text: "What a face-down creature is" },
      { t: "p", html: "A 2/2 with no name, no creature types, no abilities except ward {2}, no mana cost and no color. Its mana value is 0. Since it has no creature types, it is not an Assassin: its hits don't trigger Etrata. That changes only when a type-changer says your creatures are Assassins (<i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c>, <i-c>Roshan, Hidden Magister</i-c>). The snowball chapter is about that." },
      { t: "h", text: "Turning a card face up" },
      { t: "table", head: ["Route", "Cost", "Works on", "Uses the stack?"], rows: [
        ["Natural flip", "The card's mana cost", "Cloaked or manifested creature cards", "No: special action"],
        ["Etrata's granted ability", "{2}{U}{B}", "Any face-down creature you control, while Etrata is out", "Yes: an activated ability"]
      ] },
      { t: "steps", items: [
        { title: "A creature card", html: "It turns face up and stays as that creature, under your control." },
        { title: "An artifact, enchantment or land", html: "Only Etrata's ability turns it face up. It stays on the battlefield as that permanent and stops being a creature." },
        { title: "An instant or sorcery", html: "It can't be turned face up. Etrata's ability exiles it and you may cast it right away for free, while the ability resolves. Sorcery timing doesn't matter. If you don't cast it then, it stays in exile." }
      ] },
      { t: "callout", tone: "key", title: "Turning face up isn't entering", html: "The permanent was already on the battlefield, so its enters triggers don't happen. \"When this is turned face up\" triggers do. <i-c>Roshan, Hidden Magister</i-c> draws you a card (and costs 1 life) each time one of your permanents turns face up." },
      { t: "h", text: "Her trigger works the turn she's cast" },
      { t: "p", html: "The cloak trigger belongs to Etrata, not to the attacker, and triggered abilities don't care about summoning sickness. Cast her in your first main phase and every Assassin that connects in that combat steals a card. She doesn't have to attack. That's why the deck casts her the turn an Assassin is already getting through, not on curve into an empty board." },
      { t: "callout", tone: "warn", title: "She's kill-on-sight", html: "In bot games Etrata is cast 1.9 times a game against the precons and leaves the battlefield 1.2 times, four fifths of those on an opponent's turn. Put <i-c>Lightning Greaves</i-c> on her as soon as you can, and keep a counter for removal aimed at her. Each recast costs {2} more: 3, then 5, then 7." },
      { t: "callout", tone: "tip", title: "Flip rarely", html: "Most stolen cards are worth more as a 2/2 than the {2}{U}{B} it costs to see them. Turn one up when it beats the 2/2 it is: a big creature, a free artifact or enchantment, a stolen wrath or tutor at the moment it matters. Do it after your own spells. The piloting chapter has the number." }
    ]
  },
  {
    id: "opening",
    title: "The opening: Assassins, fast mana, then Etrata",
    kicker: "Turns 1 to 3",
    minutes: 6,
    summary: "The cheap evasive Assassins, the eight fast-mana pieces, and the rule for when Etrata comes down.",
    blocks: [
      { t: "cards", names: ["Changeling Outcast", "Hired Poisoner", "Slither Blade", "Mothdust Changeling", "Tetsuko Umezawa, Fugitive", "Satoru, the Infiltrator", "Brotherhood Spy", "Reno and Rude", "Basim Ibn Ishaq"], caption: "The one- and two-drops that get through." },
      { t: "p", html: "The first two turns put cheap bodies on the battlefield that can hit someone by turn 3. An Assassin that connects with Etrata out steals a card, so evasion matters more than size." },
      { t: "table", head: ["Card", "Cost", "Why it gets through", "Assassin?"], rows: [
        ["<i-c>Changeling Outcast</i-c>", "{B}", "Can't be blocked (and can't block)", "Yes: changeling. The best one-drop."],
        ["<i-c>Hired Poisoner</i-c>", "{B}", "A 1/1 deathtouch: <i-c>Tetsuko Umezawa, Fugitive</i-c> makes it unblockable; nobody wants to block it anyway", "Yes"],
        ["<i-c>Slither Blade</i-c>", "{U}", "Can't be blocked", "No, a Snake Rogue: it needs a type-changer to steal"],
        ["<i-c>Mothdust Changeling</i-c>", "{U}", "Tap another creature you control: it gains flying. A summoning-sick 2/2 can pay that cost.", "Yes: changeling"],
        ["<i-c>Tetsuko Umezawa, Fugitive</i-c>", "{1}{U}", "Your creatures with power or toughness 1 or less can't be blocked", "No, a Human Rogue: she's the enabler"],
        ["<i-c>Satoru, the Infiltrator</i-c>", "{U}{B}", "Menace. Draws a card whenever creatures enter under your control without being cast, which is every cloak", "No, a Ninja Rogue"],
        ["<i-c>Brotherhood Spy</i-c>", "{1}{U}", "With a legendary Assassin (Etrata counts) it gets +1/+0 and can't be blocked each combat", "Yes"],
        ["<i-c>Reno and Rude</i-c>", "{1}{B}", "Menace. On a hit, exile their top card; sacrifice a creature or artifact to play it this turn", "Yes"],
        ["<i-c>Basim Ibn Ishaq</i-c>", "{U}{B}", "Casting a historic spell (artifact or legendary) draws a card and makes him unblockable this turn", "Yes"]
      ] },
      { t: "callout", tone: "tip", title: "Duds are fuel", html: "<i-c>Reno and Rude</i-c> want something to sacrifice. A stolen 2/2 that would be a land or a weak card face up is perfect: it goes back to its owner's graveyard, and you get to play the card they exiled." },
      { t: "h", text: "Eight pieces of fast mana" },
      { t: "cards", names: ["Sol Ring", "Mox Amber", "Chrome Mox", "Lotus Petal", "Dark Ritual", "Arcane Signet", "Talisman of Dominance", "Ancient Tomb"], caption: "Two drops on turn one, or Etrata on turn two." },
      { t: "list", items: [
        "<b><i-c>Mox Amber</i-c></b> makes mana of a color among your legendary creatures. It's dead with no legend out and live once Etrata, Tetsuko, Satoru, Reno and Rude or Basim is down.",
        "<b><i-c>Chrome Mox</i-c></b> exiles a card from your hand as it enters (imprint). Pick an extra counterspell or a card you can't use soon, not your one-drop.",
        "<b><i-c>Dark Ritual</i-c></b> is best on turn 1 or 2 for a three-drop: Etrata off a Swamp, or <i-c>Virtus the Veiled</i-c>.",
        "<b><i-c>Ancient Tomb</i-c></b> costs 2 life a tap. In a deck that attacks first and blocks little, keep an eye on your total."
      ] },
      { t: "h", text: "When Etrata comes down" },
      { t: "p", html: "Piloting rule 2: cast Etrata the turn an Assassin will connect, in your first main phase, before combat. On turn 3 that usually means a one-drop already on the battlefield and three mana. If nothing of yours can get through this turn, play something else and wait a turn: a 1/4 that does nothing is a removal target with no payoff." },
      { t: "math", items: [
        { label: "Turn 1", value: "Land, <i-c>Changeling Outcast</i-c>" },
        { label: "Turn 2", value: "Land, a two-drop or <i-c>Tetsuko Umezawa, Fugitive</i-c>; attack with the Outcast" },
        { label: "Turn 3", value: "Land, Etrata before combat; attack: each Assassin hit cloaks a card" }
      ], total: "In bot games this rule is worth +1.0 point against Bracket 4 and −0.2 against precons (2,016 paired games each)." },
      { t: "callout", tone: "warn", title: "Pumps break Tetsuko", html: "Tetsuko checks power and toughness when blockers are declared. Once <i-c>Ramses, Assassin Lord</i-c> or <i-c>Achilles Davenport</i-c> gives your Assassins +1/+1, <i-c>Hired Poisoner</i-c>, <i-c>Mothdust Changeling</i-c> and Etrata herself become 2/2 or bigger and can be blocked again. <i-c>Changeling Outcast</i-c> and <i-c>Slither Blade</i-c> don't care: their own text does it." }
    ]
  },
  {
    id: "cloak-snowball",
    title: "The cloak snowball",
    kicker: "Engine",
    minutes: 7,
    summary: "Type-changers, lords, Coat of Arms, the copies, Roaming Throne, They Came from the Pipes and Satoru: how one hit turns into a board.",
    blocks: [
      { t: "p", html: "Each Assassin hit gives you a face-down 2/2. On their own those 2/2s have no types, so they attack but never steal. The snowball cards change that, and make each steal worth more." },
      { t: "h", text: "Make the 2/2s Assassins" },
      { t: "cards", names: ["Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"], caption: "Each one makes every stolen 2/2 a thief." },
      { t: "list", items: [
        "<b><i-c>Leyline of Transformation</i-c></b> ({2}{U}{U}, or free from your opening hand) and <b><i-c>Arcane Adaptation</i-c></b> ({2}{U}): name Assassin. Creatures you control are Assassins, face-down ones included, and so are creature spells you control and creature cards you own outside the battlefield.",
        "<b><i-c>Roshan, Hidden Magister</i-c></b> ({3}{B}, a 4/4 Assassin): your other creatures are Assassins, face-down creatures you control have menace, and each permanent you turn face up draws a card for 1 life.",
        "With one out, every face-down 2/2 that connects cloaks another card. Two hits become four, four become eight. It also makes <i-c>Slither Blade</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c> and <i-c>Satoru, the Infiltrator</i-c> Assassins.",
        "It also saves them from <i-c>Kindred Dominance</i-c>: name Assassin and your whole board survives."
      ] },
      { t: "h", text: "Grow them" },
      { t: "list", items: [
        "<b><i-c>Ramses, Assassin Lord</i-c></b> and <b><i-c>Achilles Davenport</i-c></b>: other Assassins you control get +1/+1 each. With a type-changer that includes every stolen 2/2. Achilles can be cast for {U}{B} (freerunning) after one of your Assassins or your commander dealt combat damage to a player this turn.",
        "<b><i-c>Coat of Arms</i-c></b>: each creature gets +1/+1 for each other creature on the battlefield that shares a creature type with it. With everything an Assassin, ten Assassins are each 9 bigger. It counts every creature on the battlefield, opponents' too, so check what it does for them first.",
        "<b><i-c>Eldrazi Monument</i-c></b>: +1/+1, flying and indestructible for all your creatures. The getting-through chapter covers it."
      ] },
      { t: "h", text: "Turn steals into cards" },
      { t: "list", items: [
        "<b><i-c>They Came from the Pipes</i-c></b> ({4}{U}): manifests dread twice when it enters, then draws a card whenever a face-down creature enters under your control. Every cloak is a card.",
        "<b><i-c>Satoru, the Infiltrator</i-c></b> ({U}{B}): draws when creatures enter under your control without being cast. Each cloak trigger resolves on its own, so each is a card. So are <i-c>Reanimate</i-c> and <i-c>Pyre of Heroes</i-c>.",
        "<b><i-c>Mari, the Killing Quill</i-c></b>: your Assassins have deathtouch, and when one hits a player you can remove a hit counter from a card that player owns in exile to draw a card and make two Treasures. Mari exiles the opponents' creatures that die with a hit counter."
      ] },
      { t: "h", text: "Double the triggers" },
      { t: "cards", names: ["Spark Double", "Sakashima the Impostor", "Roaming Throne"], caption: "Two Etratas steal twice per hit. Two Ramses win twice as hard." },
      { t: "list", items: [
        "<b><i-c>Spark Double</i-c></b> enters as a copy of a creature you control with an extra +1/+1 counter, and it isn't legendary. A second Etrata means two cloak triggers for each Assassin hit. A second Ramses is a second lord and a second \"you win\".",
        "<b><i-c>Sakashima the Impostor</i-c></b> copies any creature, but keeps the name Sakashima the Impostor. The legend rule only looks at names, so it sits next to the real Etrata or Ramses. {2}{U}{U} returns it to your hand at the next end step, to copy something else later.",
        "<b><i-c>Roaming Throne</i-c></b> (name Assassin): triggered abilities of your other Assassins trigger an additional time. Etrata's cloak, Virtus's halving and Reno and Rude's exile all trigger twice."
      ] },
      { t: "callout", tone: "tip", title: "What the bot copies first", html: "The bot puts copies on Ramses first and Etrata second; copying Etrata first measured −0.9 in bot games. If Ramses is out and safe, a second Etrata steals more. If he's your only win, a second Ramses keeps it when one dies." },
      { t: "callout", tone: "warn", title: "A bigger pile loses more to a wrath", html: "Every snowball card is a 2 to 5 mana investment, and the precon bots' wraths are the deck's main cause of losses. Twenty-two more snowball cards were tested and none beat a basic land (the what-didn't-work chapter). Build the snowball behind <i-c>Teferi's Veil</i-c> or <i-c>Eldrazi Monument</i-c> when you can." }
    ]
  },
  {
    id: "kill-ramses",
    title: "Kill 1: Ramses and one dead player",
    kicker: "Win line 1",
    minutes: 7,
    summary: "Ramses' \"you win\", the halvers, Bloodletter's doubling, and how to pick the player to kill.",
    blocks: [
      { t: "cards", names: ["Ramses, Assassin Lord", "Virtus the Veiled", "Unstoppable Slasher", "Quietus Spike", "Bloodletter of Aclazotz", "Mari, the Killing Quill"], caption: "The win and the kit that kills one player fast." },
      { t: "p", html: "<i-c>Ramses, Assassin Lord</i-c> is a {2}{U}{B} 4/4 deathtouch lord: other Assassins you control get +1/+1, and \"whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.\" In a four-player game, killing one player wins all of it." },
      { t: "h", text: "What the trigger needs" },
      { t: "steps", items: [
        { title: "Ramses on the battlefield", html: "When the player loses. He can arrive late: cast him in your second main phase after the attack and it still counts." },
        { title: "An Assassin attacked that player this turn", html: "Attacked, not hit. It has to be declared as an attacker against that player, not against their planeswalker, and a creature put onto the battlefield attacking never \"attacked\". It doesn't matter if that Assassin has died since." },
        { title: "The player loses, any way", html: "Combat damage, a halver, Bloodletter, the drain loop, <i-c>Vein Ripper</i-c>, an empty library. Any loss after the attack wins you the game." }
      ] },
      { t: "h", text: "The halvers" },
      { t: "list", items: [
        "<b><i-c>Virtus the Veiled</i-c></b> ({2}{B}, 1/1 deathtouch Assassin): when it deals combat damage to a player, that player loses half their life, rounded up.",
        "<b><i-c>Unstoppable Slasher</i-c></b> ({2}{B}, 2/3 deathtouch Assassin): the same trigger, and when it dies with no counters on it, it comes back tapped with two stun counters.",
        "<b><i-c>Quietus Spike</i-c></b> ({3}, equip {3}): gives the equipped creature deathtouch and the same trigger. Put it on whatever can't be blocked: <i-c>Changeling Outcast</i-c> or <i-c>Slither Blade</i-c>.",
        "The halving is worked out when the trigger resolves, after combat damage. Two triggers resolve one at a time: half, then half of what's left."
      ] },
      { t: "h", text: "Bloodletter turns half into all" },
      { t: "p", html: "<i-c>Bloodletter of Aclazotz</i-c> ({1}{B}{B}{B}, a 2/4 flier): if an opponent would lose life during your turn, they lose twice that much instead. Combat damage is doubled too. Half their life, rounded up, doubled, is at least all of it. So on your turn, one halver hit with Bloodletter out kills that player from any life total." },
      { t: "math", items: [
        { label: "Player at 40, your turn, Bloodletter out", value: "40" },
        { label: "Virtus (2/2 with Ramses) deals 2 combat damage, doubled to 4", value: "36" },
        { label: "Virtus trigger: half of 36 is 18, doubled to 36", value: "0" }
      ], total: "Dead. With Ramses out, and Virtus being an Assassin that attacked them, you win." },
      { t: "math", items: [
        { label: "Same hit, no Bloodletter", value: "40" },
        { label: "2 combat damage", value: "38" },
        { label: "Trigger: half of 38 is 19", value: "19" },
        { label: "A second halver on the same turn: half of 19 rounded up is 10", value: "9" }
      ], total: "Without Bloodletter it takes two or three connected turns. Bloodletter only works on your turn." },
      { t: "widget", id: "halveCalc" },
      { t: "h", text: "Pick one player" },
      { t: "p", html: "Piloting rule 7. With Ramses out, the mark is whoever your board kills soonest: lowest life, fewest blockers, no flyers. Every attacker that can get through goes at them. The rest hit whoever is open, because each Assassin hit is still a stolen card. In bot games, marking one player was worth +3.1 points against precons and +1.6 against Bracket 4 over a generic attack." },
      { t: "list", items: [
        "<b><i-c>Mari, the Killing Quill</i-c></b> gives every Assassin deathtouch, so blockers die and the next attack is easier.",
        "<b><i-c>Roshan, Hidden Magister</i-c></b> gives face-down creatures menace. Two blockers per 2/2 is a lot to ask of one player.",
        "Without Ramses, spread the hits. A player who leaves takes the cards you stole from them, and one death isn't a win."
      ] },
      { t: "callout", tone: "key", title: "How the wins end", html: "In the bot games, the last kill of a won game is Ramses' trigger in 50% of the wins against the precons and 46% against Bracket 4. The halvers' and Bloodletter's on-hit triggers make 9% of the kills, combat damage 55% / 63%." }
    ]
  },
  {
    id: "kill-loop",
    title: "Kill 2: the drain loop",
    kicker: "Win line 2",
    minutes: 5,
    summary: "Exquisite Blood or Bloodthirsty Conqueror plus Sanguine Bond or Vito: four pairs, the starters, and what feeds it.",
    blocks: [
      { t: "cards", names: ["Exquisite Blood", "Bloodthirsty Conqueror", "Sanguine Bond", "Vito, Thorn of the Dusk Rose"], caption: "One from the left pair and one from the right." },
      { t: "p", html: "This is the closer that makes the heist closer. Two halves, two cards each:" },
      { t: "table", head: ["Half", "Cards", "Text"], rows: [
        ["Drain to gain", "<i-c>Exquisite Blood</i-c> ({4}{B} enchantment), <i-c>Bloodthirsty Conqueror</i-c> ({3}{B}{B} 5/5 flying deathtouch)", "Whenever an opponent loses life, you gain that much life."],
        ["Gain to drain", "<i-c>Sanguine Bond</i-c> ({3}{B}{B} enchantment), <i-c>Vito, Thorn of the Dusk Rose</i-c> ({2}{B} 1/3)", "Whenever you gain life, target opponent loses that much life."]
      ] },
      { t: "h", text: "The loop, step by step" },
      { t: "steps", items: [
        { title: "An opponent loses life", html: "Any amount, from anything: an attack, a fetch land they crack, a shock land they pay for, <i-c>Vein Ripper</i-c>." },
        { title: "The drain half triggers", html: "You gain that much life." },
        { title: "The gain half triggers", html: "Target an opponent. They lose that much life." },
        { title: "Back to step 2", html: "It repeats. When one opponent dies, the next trigger targets someone still alive, until nobody is left." }
      ] },
      { t: "callout", tone: "key", title: "It kills the whole table", html: "The loop doesn't need Ramses, combat or an Assassin. That's why it matters: in bot games the closer list wins 38% of the games where Ramses never lands against the precons, while the same deck without the loop wins 17%." },
      { t: "h", text: "Starters you control" },
      { t: "list", items: [
        "Any Assassin or face-down 2/2 that connects.",
        "<b><i-c>Vein Ripper</i-c></b> ({3}{B}{B}{B}, 6/5 flier): whenever a creature dies, target opponent loses 2 and you gain 2. Either half starts the loop.",
        "<b><i-c>Ashnod's Altar</i-c></b>: sacrifice a creature for {C}{C}. With Vein Ripper, each stolen 2/2 you sacrifice drains 2.",
        "<b><i-c>Bloodletter of Aclazotz</i-c></b> doubles every loss on your turn, so each lap is bigger. Not needed: the loop is already infinite.",
        "<b>Vito's own ability</b>: {3}{B}{B} gives your creatures lifelink until end of turn. Lifelink damage gains you life, which starts the gain half."
      ] },
      { t: "callout", tone: "tip", title: "Half is out: tutor the other", html: "Once one half is on the battlefield, the next tutor finds the other half. The bot does it that way. The loop makes 36% of the kills against the precons and ends 32% of the wins; combat and the on-hit triggers make the other 64%." },
      { t: "callout", tone: "warn", title: "What stops it", html: "\"You can't gain life\" or \"your opponents can't lose life\" effects stop it. So does removing one piece in response to the first trigger. Enchantment removal hits <i-c>Exquisite Blood</i-c> and <i-c>Sanguine Bond</i-c>; creature removal and wraths hit <i-c>Bloodthirsty Conqueror</i-c> and <i-c>Vito, Thorn of the Dusk Rose</i-c>. Mixed pairs are harder to answer with one card." },
      { t: "callout", tone: "tip", title: "Teferi's Veil and the second main phase", html: "If you attack with Vito or the Conqueror while <i-c>Teferi's Veil</i-c> is out, it phases out at end of combat and the loop is off until your next untap step. Keep a loop creature home if you plan to start the loop after combat." }
    ]
  },
  {
    id: "tutors",
    title: "Tutors: Ramses first",
    kicker: "Finding the kill",
    minutes: 5,
    summary: "Eight ways to find a piece, why the first one always goes on Ramses, and what to take after him.",
    blocks: [
      { t: "cards", names: ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Demonic Consultation", "Pyre of Heroes", "Reanimate"], caption: "Seven tutors and a way back." },
      { t: "table", head: ["Card", "Cost", "Where the card goes", "Notes"], rows: [
        ["<i-c>Demonic Tutor</i-c>", "{1}{B}", "Hand", "The clean one."],
        ["<i-c>Vampiric Tutor</i-c>", "{B}, 2 life", "Top of library", "Instant: cast it at the end step of the player before you."],
        ["<i-c>Imperial Seal</i-c>", "{B}, 2 life", "Top of library", "Sorcery: you draw the card next turn. Best on turn 1."],
        ["<i-c>Grim Tutor</i-c>", "{1}{B}{B}, 3 life", "Hand", ""],
        ["<i-c>Diabolic Intent</i-c>", "{1}{B}, sacrifice a creature", "Hand", "Sacrifice a dud 2/2 you stole. It goes to its owner's graveyard."],
        ["<i-c>Demonic Consultation</i-c>", "{B}", "Hand", "Name a card, exile the top six, then reveal until you find it. If it was in the top six, it's gone."],
        ["<i-c>Pyre of Heroes</i-c>", "{2}, {T}, sacrifice a creature", "Battlefield", "Sorcery speed. Finds a creature that shares a type with the one you sacrificed, with mana value one higher."],
        ["<i-c>Reanimate</i-c>", "{B}, life equal to mana value", "Battlefield", "Any graveyard. Brings Ramses back for 4 life."]
      ] },
      { t: "callout", tone: "key", title: "Ramses first, every time", html: "Piloting rule 3. In bot games, tutoring generic targets instead of Ramses first cost 10.9 points against precons and 4.5 against Bracket 4; tutoring the halvers and Bloodletter first cost 6.2 / 2.3. Once he's out, the order barely matters: the bot takes Bloodletter and the halvers next, a copy of Ramses when <i-c>Spark Double</i-c> is in hand, and the missing half of the loop when one half is out." },
      { t: "widget", id: "tutorMap" },
      { t: "h", text: "Pyre of Heroes to Ramses" },
      { t: "p", html: "Ramses is a Human Assassin with mana value 4. Sacrifice any mana value 3 Assassin and <i-c>Pyre of Heroes</i-c> puts him onto the battlefield: <i-c>Virtus the Veiled</i-c>, <i-c>Unstoppable Slasher</i-c> or <i-c>Mari, the Killing Quill</i-c>. From a one-drop it climbs one step a turn: <i-c>Changeling Outcast</i-c> (every type, mana value 1) finds any two-drop creature." },
      { t: "list", items: [
        "With <i-c>Leyline of Transformation</i-c> or <i-c>Arcane Adaptation</i-c> on Assassin, creature cards you own in your library are Assassins too, so every creature shares a type with every other.",
        "A stolen 2/2 is mana value 0. With a type-changer out it's an Assassin, so it finds a one-drop Assassin.",
        "<i-c>Pyre of Heroes</i-c> puts the creature onto the battlefield without casting it: <i-c>Satoru, the Infiltrator</i-c> draws a card, and counterspells can't stop it."
      ] },
      { t: "h", text: "Timing" },
      { t: "steps", items: [
        { title: "Winning this turn?", html: "A tutor to hand: <i-c>Demonic Tutor</i-c>, <i-c>Grim Tutor</i-c>, <i-c>Diabolic Intent</i-c>, <i-c>Demonic Consultation</i-c>, or <i-c>Pyre of Heroes</i-c> straight to the battlefield." },
        { title: "Winning next turn?", html: "<i-c>Vampiric Tutor</i-c> at the end of the turn before yours, with mana that would untap anyway." },
        { title: "Ramses died?", html: "<i-c>Reanimate</i-c> him from your graveyard, or a tutor for <i-c>Spark Double</i-c> if Ramses is still out and you want a spare." }
      ] },
      { t: "callout", tone: "warn", title: "Consultation and your library", html: "<i-c>Demonic Consultation</i-c> exiles at least six cards. With <i-c>Rhystic Study</i-c>, <i-c>Mystic Remora</i-c> and <i-c>They Came from the Pipes</i-c> drawing, the deck decks itself in 8% of its losses against the precons in bot games. Late in a long game, count your library before you cast it." }
    ]
  },
  {
    id: "getting-through",
    title: "Getting through and surviving wipes",
    kicker: "Evasion and defense",
    minutes: 7,
    summary: "Eldrazi Monument, Reverse the Polarity, Rogue's Passage, Kindred Dominance, Teferi's Veil and Lightning Greaves.",
    blocks: [
      { t: "p", html: "Two things beat this deck in bot games: blockers that stop the 2/2s, and wraths on the other players' turns. Against the precons the deck faces 0.61 opposing board wipes a game and loses 4.4 creatures a game on opponents' turns. These cards answer both." },
      { t: "h", text: "Through the blockers" },
      { t: "table", head: ["Card", "What it does", "Best moment"], rows: [
        ["<i-c>Eldrazi Monument</i-c>", "{5}: your creatures get +1/+1, flying and indestructible. Each upkeep, sacrifice a creature, or the Monument if you have none.", "With a pile of stolen 2/2s: feed it the duds. Destroy wraths miss everything you control."],
        ["<i-c>Reverse the Polarity</i-c>", "{1}{U}{U} instant. Choose one: counter all other spells; switch each creature's power and toughness; creatures can't be blocked this turn.", "The kill turn: nothing can be blocked, so Ramses' mark dies. Or counter a wrath and everything else on the stack, yours included."],
        ["<i-c>Rogue's Passage</i-c>", "A land. {4}, {T}: target creature can't be blocked this turn.", "Push the one halver or <i-c>Quietus Spike</i-c> carrier through."],
        ["<i-c>Kindred Dominance</i-c>", "{5}{B}{B} sorcery: choose a creature type, destroy every creature that isn't that type.", "Name Assassin with a type-changer out: only their creatures die."],
        ["<i-c>Mutavault</i-c>", "{1}: a 2/2 with all creature types until end of turn.", "An Assassin that dodges sorcery-speed removal."]
      ] },
      { t: "callout", tone: "key", title: "Kindred Dominance and face-down creatures", html: "A face-down 2/2 has no creature types, so it isn't an Assassin and Dominance destroys it unless a type-changer is out. With <i-c>Leyline of Transformation</i-c> or <i-c>Arcane Adaptation</i-c> on Assassin, or <i-c>Roshan, Hidden Magister</i-c>, every creature you control is an Assassin and survives. Without one, <i-c>Tetsuko Umezawa, Fugitive</i-c>, <i-c>Satoru, the Infiltrator</i-c>, <i-c>Slither Blade</i-c>, <i-c>Bloodletter of Aclazotz</i-c>, <i-c>Bloodthirsty Conqueror</i-c> and <i-c>Vito, Thorn of the Dusk Rose</i-c> die too. <i-c>Eldrazi Monument</i-c>'s indestructible saves all of yours. In bot games Dominance measured +0.8 / +0.7 over a basic land (5,040 paired games)." },
      { t: "h", text: "Through the wraths" },
      { t: "cards", names: ["Teferi's Veil", "Eldrazi Monument", "Lightning Greaves"], caption: "Phasing, indestructible and shroud." },
      { t: "p", html: "<i-c>Teferi's Veil</i-c> ({1}{U}): whenever a creature you control attacks, it phases out at end of combat. It phases back in before you untap in your next untap step. While phased out it's treated as though it doesn't exist: wraths, removal and blocks on the other players' turns can't touch it." },
      { t: "steps", items: [
        { title: "Attack", html: "With everything that gets through (piloting rule 6). Combat damage and the on-hit triggers happen first." },
        { title: "End of combat", html: "The attackers phase out, with their equipment. They're still yours." },
        { title: "Their turns", html: "A wrath misses them. They can't block either: what stayed home is your defense." },
        { title: "Your untap step", html: "They phase in and untap with everything else, ready to attack again." }
      ] },
      { t: "callout", tone: "warn", title: "Phased out means gone for the rest of your turn", html: "A creature that attacked under the Veil is phased out in your second main phase. Phased-out Etrata grants no flip ability, a phased-out Ramses can't trigger, and a phased-out 2/2 can't be turned face up or sacrificed. Flip during combat or keep those cards home if you need them after combat. Creatures dealt lethal damage in combat aren't saved: the trigger comes after damage." },
      { t: "p", html: "In bot games, attacking with everything once the Veil is out was worth +1.0, and <i-c>Eldrazi Monument</i-c>, which does the same job against destroy effects, +1.9." },
      { t: "h", text: "Lightning Greaves" },
      { t: "p", html: "<i-c>Lightning Greaves</i-c> ({2}, equip {0}): haste and shroud. Equip it to Etrata the turn she comes down, then move it to Ramses when he arrives so he attacks at once. Shroud stops your own spells too: move the Greaves off before you equip <i-c>Quietus Spike</i-c> or target the creature with anything." },
      { t: "callout", tone: "tip", title: "Don't hold Ramses for it", html: "Piloting rule 4. Holding Ramses until Greaves can go on him the same turn cost 3.8 / 4.8 points in bot games. A turn of his anthem and pressure is worth more than the third of his games in which he's removed." }
    ]
  },
  {
    id: "interaction",
    title: "Interaction and the saved counter",
    kicker: "Defense",
    minutes: 5,
    summary: "Seven pieces of interaction, six of them free or one mana, and the rule for when to use them.",
    blocks: [
      { t: "cards", names: ["Force of Will", "Fierce Guardianship", "Force of Negation", "Swan Song", "Deadly Rollick", "Snuff Out", "Cyclonic Rift"], caption: "Most of them cost no mana." },
      { t: "table", head: ["Card", "Answers", "Free?"], rows: [
        ["<i-c>Force of Will</i-c>", "Any spell", "Pay 1 life and exile a blue card from your hand instead of {3}{U}{U}."],
        ["<i-c>Fierce Guardianship</i-c>", "A noncreature spell", "Free while you control your commander (Etrata on the battlefield). Otherwise {2}{U}."],
        ["<i-c>Force of Negation</i-c>", "A noncreature spell, exiled", "Exile a blue card from your hand, only on another player's turn. Otherwise {1}{U}{U}."],
        ["<i-c>Swan Song</i-c>", "An enchantment, instant or sorcery", "{U}. They get a 2/2 flying Bird, which can block your fliers."],
        ["<i-c>Deadly Rollick</i-c>", "Exile a creature", "Free while you control your commander. Otherwise {3}{B}."],
        ["<i-c>Snuff Out</i-c>", "Destroy a nonblack creature", "Pay 4 life if you control a Swamp (Watery Grave and the other typed duals count)."],
        ["<i-c>Cyclonic Rift</i-c>", "Bounce a nonland permanent you don't control", "{1}{U}; overloaded for {6}{U}, every one of them. Your stolen cloaks stay: you control them."],
        ["<i-c>Reverse the Polarity</i-c>", "Every other spell on the stack", "{1}{U}{U}. Also a kill card: see the previous chapter."]
      ] },
      { t: "h", text: "Save the last counter for the wrath" },
      { t: "p", html: "Piloting rule 5. Develop first. Counters are for a board wipe, for removal aimed at Ramses or Etrata, and for another player's actual win. Let single creatures, commanders and value spells resolve. When you're down to one counter, it's the wrath's. In bot games this was worth +1.0 against the precons (0.0 against Bracket 4). Real Etrata pilots say the same: letting them kill single plays is better than being shields-down." },
      { t: "callout", tone: "tip", title: "Free counters let you tap out", html: "<i-c>Fierce Guardianship</i-c> and <i-c>Deadly Rollick</i-c> are free only with Etrata on the battlefield, which is one more reason to keep her alive. <i-c>Force of Negation</i-c> is free only on other players' turns: it protects your setup from their wraths, not your combo turn from their responses." },
      { t: "callout", tone: "warn", title: "The bot plays counters badly", html: "In the cut sweep, <i-c>Force of Will</i-c>, <i-c>Force of Negation</i-c> and <i-c>Cyclonic Rift</i-c> each measured slightly below a basic land in the bot's hands (+0.8 to +1.0 against precons when cut), and Mana Drain was cut outright (+1.4 / +0.8). That says as much about the bot's counter play as about the cards. A human who holds the right counter for the right spell gets more from them." },
      { t: "h", text: "Card flow" },
      { t: "list", items: [
        "<b><i-c>Rhystic Study</i-c></b> and <b><i-c>Mystic Remora</i-c></b> are turn 1 to 2 engines. A hand with one and the lands to cast it is a keep. Pay Remora's cumulative upkeep ({1}, then {2}, then {3}) only while it draws.",
        "<b><i-c>Dark Confidant</i-c></b> reveals your top card each upkeep and you lose life equal to its mana value. Cheap in this deck, which is mostly one- and two-drops.",
        "<b><i-c>Brainstorm</i-c></b> and <b><i-c>Preordain</i-c></b> dig for a land or a one-drop. Brainstorm after an <i-c>Imperial Seal</i-c> or <i-c>Vampiric Tutor</i-c> puts the tutored card in hand now."
      ] }
    ]
  },
  {
    id: "mana-mulligans",
    title: "Mana, mulligans and opening hands",
    kicker: "Setup",
    minutes: 5,
    summary: "37 lands plus seven nonland fast-mana pieces, the keep rules, and the hands to ship.",
    blocks: [
      { t: "p", html: "The list runs 37 lands: 22 duals, fetches and utility lands, and 15 basics (8 Island, 7 Swamp). With <i-c>Ancient Tomb</i-c> that's eight pieces of fast mana: <i-c>Sol Ring</i-c>, <i-c>Mox Amber</i-c>, <i-c>Chrome Mox</i-c>, <i-c>Lotus Petal</i-c>, <i-c>Dark Ritual</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Talisman of Dominance</i-c> and the Tomb." },
      { t: "callout", tone: "key", title: "Why so many lands", html: "The cut sweep found six cards worth less than a basic land in the bot's hands: Kindred Discovery, Swiftfoot Boots, Mana Drain, Interceptor, Obelisk of Urd and Ghostly Flicker. Six basics in their place were worth +4.4 / +2.6 (5,040 paired games), and four more lands on top did nothing (+0.2 / −0.2). The list was benched with 38 lands; <i-c>Kindred Dominance</i-c> later took a Swamp." },
      { t: "callout", tone: "warn", title: "It's a bot number", html: "37 lands plus seven fast-mana cards is more mana than the Bracket 4 sources' 25 to 36 lands. Part of what the bot gained is not having to pilot counters. If you trust your counter play, 35 to 36 lands with Mana Drain and Swiftfoot Boots back is the human-adjusted version. This engine can't measure it." },
      { t: "h", text: "The lands that do more" },
      { t: "table", head: ["Land", "What it adds"], rows: [
        ["<i-c>Rogue's Passage</i-c>", "{4}, {T}: one creature can't be blocked."],
        ["<i-c>Cavern of Souls</i-c>", "Name Assassin: your Assassin spells can't be countered. Ramses on the kill turn."],
        ["<i-c>Brotherhood Headquarters</i-c>", "Any color for Assassin spells, freerunning spells, and abilities of Assassins."],
        ["<i-c>Secluded Courtyard</i-c>", "Name Assassin: any color for Assassin creature spells and their abilities."],
        ["<i-c>Path of Ancestry</i-c>", "Enters tapped. Scry 1 when its mana casts a Vampire or Assassin creature."],
        ["<i-c>Mutavault</i-c>", "A 2/2 with every creature type for {1}: an Assassin that steals."],
        ["<i-c>River of Tears</i-c>", "{U}, or {B} on a turn you played a land. On other players' turns it's {U}."],
        ["<i-c>Darkwater Catacombs</i-c>", "{1}, {T}: {U}{B}. It needs another mana source."]
      ] },
      { t: "h", text: "Mulligan is the default" },
      { t: "p", html: "Piloting rule 1. Keep a hand that does something by turn 3. In bot games the stricter keep rules were worth +1.3 against Bracket 4 and +0.2 against precons. In multiplayer your first mulligan is free." },
      { t: "steps", items: [
        { title: "Keep: lands plus a threat on curve", html: "Two or more lands with {U} and {B}, a one- or two-mana evasive Assassin (<i-c>Changeling Outcast</i-c> is the best one-drop), and Etrata castable on turn 3 with an Assassin ready to hit that turn." },
        { title: "Keep: fast mana plus a real threat", html: "<i-c>Sol Ring</i-c> or <i-c>Dark Ritual</i-c> with Etrata, a tutor, or two cheap Assassins." },
        { title: "Keep: an early engine", html: "<i-c>Rhystic Study</i-c> or <i-c>Mystic Remora</i-c> on turn 1 or 2, with the lands to cast it." },
        { title: "Ship it", html: "Interaction alone. Draw spells with no development. One land and no fast mana. Seven lands." }
      ] },
      { t: "callout", tone: "tip", title: "Leyline in the opening hand", html: "<i-c>Leyline of Transformation</i-c> in your opening hand starts on the battlefield for free. Name Assassin. It doesn't make a hand a keep by itself, but it makes every steal from turn 3 on a thief." }
    ]
  },
  {
    id: "piloting-rules",
    title: "The nine piloting rules",
    kicker: "How to play it",
    minutes: 6,
    summary: "The rules the research and the bot games agree on, each with its measured gain.",
    blocks: [
      { t: "p", html: "Each rule below was measured as a switch on the bot's brain, with paired seeds: the same shuffles and the same opponents with the rule on and off. The numbers are points of win rate, precons / Bracket 4, from 2,016 paired games per field." },
      { t: "widget", id: "pilotRules" },
      { t: "steps", items: [
        { title: "Mulligan is the default", html: "Keep a hand that does something by turn 3 (the previous chapter). +1.3 against Bracket 4, +0.2 against precons." },
        { title: "Etrata when an Assassin connects that turn", html: "Her trigger works the turn she's cast and she's kill-on-sight. Greaves on her as soon as you can. +1.0 against Bracket 4, −0.2 against precons." },
        { title: "Tutor for Ramses first", html: "After him the order barely matters. Ramses right before combat, with a counter up if you can. Tutoring anything else first costs 8 to 11 points; putting Interceptor first cost 7.9." },
        { title: "Don't wait to protect him", html: "Holding Ramses until Greaves can go on him the same turn costs 3.8 / 4.8. He lands in fewer games and a turn later." },
        { title: "Save the last counter for the wrath", html: "And for removal aimed at Ramses or Etrata. Let single creatures and commanders resolve. +1.0." },
        { title: "Attack with everything once Teferi's Veil is out", html: "The attackers phase out through everyone else's turn and the wraths miss them. Eldrazi Monument does the same job against destroy effects. +1.0 and +1.9." },
        { title: "Pick one player and kill them", html: "With Ramses out, one death is the game. The mark is whoever your board kills soonest. Without Ramses, spread the hits. The marking attack is worth 3.1 / 1.6 over a generic one." },
        { title: "Flip rarely", html: "Turn a stolen card up only when it beats the 2/2 it is, after your own spells, never before combat. Cast stolen instants and sorceries through Etrata when they matter. Flipping first costs 1.7 / 0.7." },
        { title: "Don't hold mana for one-shots", html: "Holding five mana for a Hatred kill cost 0.8 / 0.5, and keeping the board home for the crack-back measured +0.2 / +0.4, which is noise. Develop and attack." }
      ] },
      { t: "callout", tone: "tip", title: "What a human adds", html: "Some things the engine can't measure: picking the moment to flip a stolen bomb, holding a counter for the one spell that matters, reading which player is about to wrath. The rules above are the floor. Play them first, then add judgment." },
      { t: "widget", id: "playChecklist" }
    ]
  },
  {
    id: "sample-game",
    title: "A sample game, turn by turn",
    kicker: "Putting it together",
    minutes: 4,
    summary: "A six-turn win that follows the rules: Outcast, Tetsuko, Etrata on the hit, Ramses first, Bloodletter, Quietus Spike.",
    blocks: [
      { t: "p", html: "Your opening seven: <i-c>Swamp</i-c>, <i-c>Island</i-c>, <i-c>Watery Grave</i-c>, <i-c>Sol Ring</i-c>, <i-c>Changeling Outcast</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c>, <i-c>Demonic Tutor</i-c>. Three lands with both colors, a one-drop, Etrata castable on turn 3 with an Assassin ready: a keep. Opponent A has the fewest blockers. A is the mark." },
      { t: "turns", items: [
        { turn: "T1", play: "<i-c>Swamp</i-c>. <i-c>Changeling Outcast</i-c>.", note: "The best one-drop: an Assassin that can't be blocked." },
        { turn: "T2", play: "<i-c>Island</i-c>. <i-c>Sol Ring</i-c> off the Swamp. <i-c>Tetsuko Umezawa, Fugitive</i-c> with the Island and one of Sol Ring's {C}. Attack A with the Outcast for 1.", note: "No Etrata yet, so no steal. A at 39." },
        { turn: "T3", play: "<i-c>Watery Grave</i-c>, paying 2 life. Etrata in the first main phase: Sol Ring's {C}, Island, Swamp. Attack A with the Outcast. Etrata is summoning sick and stays home, but her trigger works anyway: one hit, one cloak. After combat, <i-c>Demonic Tutor</i-c> with the last {C} and the Grave: find <i-c>Ramses, Assassin Lord</i-c>.", note: "Rules 2 and 3: Etrata on the turn an Assassin connects, the tutor goes on Ramses. A at 38." },
        { turn: "T4", play: "You drew <i-c>Vampiric Tutor</i-c> last turn and <i-c>Polluted Delta</i-c> now: crack it for a Swamp. Ramses before combat with Sol Ring, Island and Swamp. Outcast (2/2 now) attacks A; the stolen 2/2 attacks whoever has no blockers. Etrata stays home: with Ramses' +1/+1 she's 2/5, out of Tetsuko's range, and a better blocker than attacker.", note: "Rule 4: Ramses comes down now, not when he's protected. One more cloak. A at 36. {B} still open." },
        { turn: "", play: "At the end step of the player before you: <i-c>Vampiric Tutor</i-c> for <i-c>Bloodletter of Aclazotz</i-c>.", note: "Instant tutor, mana that would untap anyway." },
        { turn: "T5", play: "Draw Bloodletter. <i-c>Island</i-c>. Bloodletter, then <i-c>Quietus Spike</i-c> with the last three mana. Attack A with the Outcast: 2 damage, doubled to 4.", note: "A at 32. The cloaks keep hitting the open players for cards." },
        { turn: "T6", play: "Equip <i-c>Quietus Spike</i-c> to the Outcast ({3}). Attack A. 2 combat damage, doubled to 4: A at 28. The Spike: half of 28 is 14, doubled to 28.", note: "A is at 0 and loses. An Assassin attacked A this turn and Ramses is out: you win." }
      ] },
      { t: "callout", tone: "tip", title: "What could go wrong", html: "A wrath after turn 4 takes Ramses: <i-c>Reanimate</i-c> him or tutor again. Removal on Etrata: Greaves next time. A blocker for the Outcast doesn't exist (it can't be blocked), which is why it carries the Spike." },
      { t: "callout", tone: "key", title: "Real games are slower", html: "This is a fast draw. The bot's average win is round 9.0 against precons and 8.0 against Bracket 4. Half the wins against the precons come by round 8." }
    ]
  },
  {
    id: "ramses-dependence",
    title: "Ramses dependence, and what didn't work",
    kicker: "Honest limits",
    minutes: 7,
    summary: "How much the deck leans on one four-drop, everything tried to fix it, and the cards that were tested and cut.",
    blocks: [
      { t: "p", html: "In every version of this deck in the bot games, the win rate tracks one card. That's why the closer list carries a second kill." },
      { t: "table", head: ["Bot games (closer list)", "vs precons", "vs Bracket 4"], rows: [
        ["Ramses lands", "54% of games", "36% of games"],
        ["Win rate when he lands", "56%", "44%"],
        ["Win rate when he never lands", "38%", "18%"],
        ["Same, the snowball list without the loop", "17%", "9%"],
        ["He's removed (share of games he lands in)", "37%", "21%"],
        ["Win rate when he's removed / when he stays", "31% / 70%", "29% / 48%"]
      ] },
      { t: "p", html: "Most of his removals are wraths on their owners' turns. Everything that improved the list improved how often Ramses lands and stays: mana, tutors, <i-c>Teferi's Veil</i-c>, the saved counter, cheaper spells. Nothing but the loop improved the games without him, because it's the only other card pair that kills three players. The halvers and Bloodletter kill one." },
      { t: "h", text: "What was tried to win without him" },
      { t: "list", items: [
        "<b>Four extra Ramses tutors:</b> −1.1 / +0.5. His presence rose from 52% to 61%, but the extra tutors are dead once he's out.",
        "<b>Ramses redundancy for basic lands:</b> Animate Dead and Necromancy −0.4 / −3.4; Helm of the Host and Irenicus's Vile Duplication −2.2 / −3.6; all four −1.6 / −3.9, and −0.7 / −2.5 in the closer list. The Auras are live only once he has died (cast in 9 to 12% of games); the Helm needs nine mana over two turns.",
        "<b>Protection:</b> Whispersilk Cloak, Darksteel Plate and Patriarch's Bidding −2.3 / +0.6. Holding him until protected −3.8 / −4.8.",
        "<b>The kill kit first:</b> tutoring the halvers and Bloodletter before Ramses −6.2 / −2.3; building around it with seven tutors −4.7 / −1.7.",
        "<b>Aristocrat drains</b> (Zulaport Cutthroat, Blood Artist, Bastion of Remembrance): +0.9 / −0.3 on the closer list at 5,040 games, which is noise.",
        "<b>Other shells:</b> the ninjutsu tempo version −7.9 / +0.2; the deathtouch attack-drain version −6.7 / −0.1; the all-unblockable skeleton −2.9 / −1.5."
      ] },
      { t: "h", text: "The snowball axis" },
      { t: "p", html: "Twenty-two candidates for a bigger face-down army were benched on the closer list in place of basic lands (2,016 paired games per field). One beat its land: <i-c>Kindred Dominance</i-c>, +0.8 / +0.7 confirmed. The rest:" },
      { t: "table", head: ["Card or package", "Δ precons", "Δ Bracket 4"], rows: [
        ["Blade of Selves (myriad)", "0.0", "−0.8"],
        ["Strionic Resonator", "0.0", "−0.8"],
        ["Mirror Box", "0.0", "−0.9"],
        ["Sakashima of a Thousand Faces with Rite of Replication", "−1.1", "−1.6"],
        ["Mirror Box with Rite of Replication", "−0.9", "−2.0"],
        ["All five", "−3.4", "−3.3"],
        ["<i-c>Training Grounds</i-c> / with eager flips", "−0.5 / −2.2", "−0.5 / −1.2"],
        ["Etrata, the Silencer", "−0.1", "−1.5"],
        ["Cryptic Coat with <i-c>Scroll of Fate</i-c>", "−1.7", "−1.9"],
        ["Levitation", "+0.6", "−0.1"],
        ["Cover of Darkness", "+0.1", "−0.9"],
        ["Wound Reflection", "−0.3", "−1.0"]
      ] },
      { t: "p", html: "Why: the army already connects (35 combat damage a game against the precons), each scaling card is a mid-game investment where a land is live on turn one, a bigger pile loses more to the wraths, and the bots cast these cards in only 10 to 17% of games, around round 6. A human picks better moments, which the engine can't measure." },
      { t: "h", text: "Smaller rules that didn't help" },
      { t: "list", items: [
        "Holding Ramses until his attack is lethal: −1.2 / −0.8.",
        "Not overextending into wraths: +0.1 / −0.3.",
        "Greaves or Boots on Etrata before Ramses: −0.0 / −0.1.",
        "Mana Vault: replacing it with a basic was +0.8 / +0.2; the bots never pay to untap it.",
        "Extra turns and Genji Glove: −1.8 / −0.9."
      ] }
    ]
  },
  {
    id: "numbers",
    title: "The numbers",
    kicker: "Bot benches",
    minutes: 5,
    summary: "Every list's win rate, speed and price, how the wins happen, and what to be skeptical about.",
    blocks: [
      { t: "widget", id: "benchTable" },
      { t: "p", html: "Four-player games against three opponents drawn at random from the engine's Bracket 2 precons, or from its Bracket 4 bot decks. ± is one standard error. Paired seeds: two runs compared with each other saw the same shuffles and the same opponents." },
      { t: "table", head: ["List", "vs 3 precons", "vs 3 Bracket 4", "Avg winning round", "Price"], rows: [
        ["<b>Heist closer</b> (this list)", "<b>47.9%</b> ±0.7", "<b>27.5%</b> ±0.6", "9.0 / 8.0", "$1,323.02"],
        ["Heist snowball (no loop)", "40.4% ±0.7", "23.6% ±0.6", "8.8 / 7.8", "$1,237.65"],
        ["Snowball without its commander", "23.7% ±0.6", "16.6% ±0.5", "9.0 / 8.1", ""],
        ["Heist blitz", "31.1% ±0.7", "18.9% ±0.6", "9.0 / 8.1", "$1,347.28"],
        ["v3 drain list (2,016 / 1,260 games)", "68.0% ±1.0", "41.7% ±1.4", "8.2 / 7.3", ""],
        ["The site's older Etrata B4 aggro list", "25.4% ±1.0", "14.7% ±1.0", "9.4 / 8.7", ""]
      ] },
      { t: "h", text: "How the closer list wins" },
      { t: "list", items: [
        "It eliminates 1.15 opponents a game against precons and 0.67 against Bracket 4: 55% / 63% by combat damage, 36% / 28% by the loop and other drains, 9% / 9% by the halvers' and Bloodletter's triggers.",
        "The last kill of a won game: Ramses' trigger 50% / 46%, the drain 32% / 27%, combat 13% / 20%, on-hit 4% / 6%.",
        "It takes 56 / 43 life from the three opponents a game: combat 35 / 23, drain 14 / 7, on-hit 7 / 13.",
        "It steals 7.3 / 5.1 cards a game: 8.5 in wins and 6.1 in losses against the precons.",
        "When it loses to the precons it dies to damage in 91% of the losses and decks itself in 8%. Against Bracket 4, 5% of the losses are opponents' alternative wins, 4% an empty library and 2% poison."
      ] },
      { t: "h", text: "What to be skeptical about" },
      { t: "list", items: [
        "<b>These are bot games.</b> The opponents are the engine's bots. Humans at a Bracket 4 table kill Ramses faster and hold up more interaction, so the real win rate is likely lower, not higher. The ordering of the lists and the piloting rules are what transfers.",
        "<b>The engine simplifies some cards.</b> Each simplified card says how in its note. Don't read a bot behavior as the real rule.",
        "<b>The land count is a bot number.</b> See the mana chapter: part of the gain is the bot not having to pilot counters.",
        "<b>Packages regress.</b> The six land cuts summed to +11.3 points at 2,016 games and confirmed at +7.0 at 5,040. Single-card numbers from a sweep are optimistic.",
        "<b>Prices</b> are Scryfall's TCGplayer market price for each card's cheapest nonfoil paper printing on 2026-10-05, not read from the store pages."
      ] }
    ]
  },
  {
    id: "variants",
    title: "The variants and building it",
    kicker: "Other lists",
    minutes: 5,
    summary: "The heist snowball, the blitz, the v3 drain list, and how to build the closer from the Etrata deck plus proxies.",
    blocks: [
      { t: "widget", id: "listPicker" },
      { t: "h", text: "Heist snowball: the pure aggro list" },
      { t: "p", html: "The same deck without the loop: Hullcarver, Desmond Miles, Skullclamp, Maskwood Nexus and a Swamp instead of <i-c>Exquisite Blood</i-c>, <i-c>Sanguine Bond</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c> and <i-c>Kindred Dominance</i-c>. 40.4% / 23.6% in bot games, $1,237.65. 93% of its kills are combat or on-hit triggers and Ramses ends 74% of its wins, but it wins only 17% of the games where he never lands. Play it if you want a deck that only wins by attacking and stealing." },
      { t: "h", text: "Heist blitz, briefly" },
      { t: "p", html: "The Yuriko tempo template with Assassins: the cheapest evasive bodies, 31 lands, the most free interaction, and Hatred as a one-shot kill with Ramses. 31.1% / 18.9%, $1,347.28. It's the list closest to how Bracket 4 sources describe a fast deck, but in bot games it wins no faster (9.0 / 8.1), steals less (5.4 cards a game) and its board is thinner against blockers." },
      { t: "h", text: "The v3 drain list" },
      { t: "p", html: "The list this site documented before the heist: Etrata's Shadow Market v3, a combo deck with the vampire court (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with <i-c>Marauding Blight-Priest</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Sanguine Bond</i-c> or <i-c>Enduring Tenacity</i-c>), <i-c>Mindcrank</i-c> with <i-c>Duskmantle Guildmage</i-c>, and <i-c>Wormfang Manta</i-c> turns with <i-c>Scroll of Fate</i-c> and <i-c>Crystal Shard</i-c>. In the same engine it wins more bot games than the heist (68.0% / 41.7%, average winning round 8.2 / 7.3), with 99% of its wins from the drain combo." },
      { t: "p", html: "It stays: its cards are in the card wiki under the \"v3 drain list\" filter, and it's a playable deck in the game. Pick it if you want the combo deck. Pick the heist if you want Etrata's steals and attacks to be the game." },
      { t: "h", text: "Building it" },
      { t: "p", html: "43 cards of the heist closer, 15 basics included, carry over from your Etrata deck. The other 57 can be proxies. The proxy list below shows them; the buy list prices every card." },
      { t: "widget", id: "proxyList" },
      { t: "widget", id: "buyList" },
      { t: "callout", tone: "tip", title: "If the table is softer", html: "Take out the loop and play the snowball list, or leave the tutors on the bench and let the steals decide. A good game for everyone beats a fast win." }
    ]
  },
  {
    id: "rules-corner",
    title: "Rules corner",
    kicker: "Tricky interactions",
    minutes: 8,
    summary: "The hard rulings: Ramses' timing, Tetsuko and anthems, face-down types, Bloodletter's math, Teferi's Veil, Kindred Dominance, the copies and the legend rule.",
    blocks: [
      { t: "h", text: "Ramses" },
      { t: "qa", items: [
        { q: "My Assassin attacked player A and got blocked. Later this turn A dies to the drain loop. Do I win?", a: "Yes. Ramses needs an Assassin you controlled to have attacked A this turn, not to have dealt damage. Any way A loses the game after that, with Ramses on the battlefield, wins it for you." },
        { q: "The Assassin that attacked died before the player lost. Still a win?", a: "Yes. It counts even if that Assassin is no longer on the battlefield, no longer under your control, or no longer an Assassin when the player loses." },
        { q: "I attacked A's planeswalker with an Assassin. Does that count for A?", a: "No. The Assassin has to attack the player. Attacking a planeswalker they control doesn't count." },
        { q: "Can I cast Ramses after combat and still win this turn?", a: "Yes. The trigger looks back at who was attacked this turn. Ramses only needs to be on the battlefield when the player loses." },
        { q: "Ramses attacked with Teferi's Veil out. I start the drain loop in my second main phase. Does Ramses' trigger work?", a: "No. Ramses phased out at end of combat and is treated as though he doesn't exist, so he can't trigger. The loop still kills every opponent on its own. If you need his trigger after combat, keep him home." }
      ] },
      { t: "h", text: "Tetsuko and anthems" },
      { t: "qa", items: [
        { q: "Ramses is out. Is Hired Poisoner still unblockable with Tetsuko?", a: "No. Tetsuko checks power and toughness when blockers are declared. Ramses makes the Poisoner 2/2, and neither number is 1 or less. Same for Etrata (2/5 with Ramses) and Mothdust Changeling." },
        { q: "Does Tetsuko help a face-down 2/2?", a: "No. It's a 2/2. <i-c>Brotherhood Spy</i-c> is the exception that stays useful: with a legendary Assassin out it can't be blocked by its own text." },
        { q: "Brotherhood Spy needs a legendary Assassin. Does Etrata count?", a: "Yes, she's a legendary Vampire Assassin. So do Ramses, Achilles, Virtus, Mari, Roshan, Reno and Rude, and Basim." }
      ] },
      { t: "h", text: "Face-down creatures" },
      { t: "qa", items: [
        { q: "Is a cloaked card an Assassin?", a: "No. Face-down creatures have no creature types. With <i-c>Leyline of Transformation</i-c> or <i-c>Arcane Adaptation</i-c> naming Assassin, or with <i-c>Roshan, Hidden Magister</i-c>, they are, and their hits trigger Etrata." },
        { q: "Does Ramses pump my face-down creatures?", a: "Only when a type-changer makes them Assassins." },
        { q: "Do face-down creatures share a type for Coat of Arms?", a: "Not by themselves: they have no types. With a type-changer on Assassin they all share Assassin with each other and with your Assassins." },
        { q: "Etrata flips a cloaked instant. When do I cast it?", a: "Right away, while her ability resolves, for free. Otherwise it stays in exile." },
        { q: "My cloak dies. Where does it go?", a: "To its owner's graveyard, revealed. A card you stole goes back to the player you stole it from. <i-c>Reanimate</i-c> can still take a creature from their graveyard." },
        { q: "Does a cloak entering trigger Satoru and They Came from the Pipes?", a: "Yes, both. It enters without being cast, and it enters face down. Turning a card face up later doesn't trigger either: it isn't entering." },
        { q: "Can Mothdust Changeling tap a summoning-sick 2/2 for flying?", a: "Yes. Tapping another creature as a cost isn't a {T} ability of that creature, so summoning sickness doesn't stop it." }
      ] },
      { t: "h", text: "Bloodletter and halving" },
      { t: "qa", items: [
        { q: "How is 'half their life, rounded up' worked out?", a: "When the trigger resolves, after combat damage. A player at 39 loses 20. Two halving triggers resolve one at a time: half, then half of what's left." },
        { q: "Virtus hits a player at 39 with Bloodletter out, on my turn. What happens?", a: "Virtus's 1 combat damage is doubled to 2: 37. The trigger: half of 37 rounded up is 19, doubled to 38. They're at −1." },
        { q: "Does Bloodletter work on other players' turns?", a: "No. Only during your turn. The drain loop doesn't need it." },
        { q: "With Bloodletter out, does Exquisite Blood gain me the doubled amount?", a: "Yes. The opponent loses twice as much, and Exquisite Blood gains you as much as they lost. Bloodletter doesn't change damage itself, though, so lifelink still gains you the damage dealt." }
      ] },
      { t: "h", text: "Teferi's Veil, Eldrazi Monument and Kindred Dominance" },
      { t: "qa", items: [
        { q: "When does Teferi's Veil phase my attackers out?", a: "At end of combat, after combat damage and the on-hit triggers. Creatures dealt lethal damage in combat aren't saved. They phase in before you untap in your next untap step, with their equipment." },
        { q: "Can my phased-out creatures block?", a: "No. While phased out they're treated as though they don't exist. What stayed home is your defense on the other players' turns." },
        { q: "Eldrazi Monument's upkeep: can I sacrifice the Monument instead of a creature?", a: "No. If you control a creature, you must sacrifice one. You sacrifice the Monument only if you have none. Feed it a stolen dud; indestructible doesn't stop a sacrifice." },
        { q: "I cast Kindred Dominance naming Assassin with no type-changer out. What happens to my cloaks?", a: "They have no creature types, so they're destroyed, along with your non-Assassins. With Leyline, Arcane Adaptation or Roshan out, every creature you control is an Assassin and survives. Once Dominance starts to resolve, nobody can respond to the type you chose." },
        { q: "Does Kindred Dominance kill an opponent's changeling?", a: "No. A changeling is every creature type, Assassin included." }
      ] },
      { t: "h", text: "Copies and the legend rule" },
      { t: "qa", items: [
        { q: "Spark Double copies Etrata. Do I keep both?", a: "Yes. The copy isn't legendary. It has Etrata's abilities and a +1/+1 counter (a 2/5), so each Assassin hit cloaks two cards." },
        { q: "Spark Double copies Ramses. What do I get?", a: "A non-legendary Ramses with a +1/+1 counter. Each lord pumps the other, other Assassins get +2/+2, and either one's trigger wins the game." },
        { q: "Sakashima the Impostor copies Etrata or Ramses. Does the legend rule kill one?", a: "No. The legend rule only applies to legendary permanents with the same name, and the copy's name stays Sakashima the Impostor." },
        { q: "Is a copy of Etrata my commander for Fierce Guardianship?", a: "No. Only the real Etrata is your commander. The free costs need her on the battlefield." },
        { q: "How does Roaming Throne interact with Etrata?", a: "Name Assassin. Etrata is an Assassin, so her cloak trigger triggers an additional time: two cloaks per hit. It doesn't copy the trigger, it adds one, and each instance makes its own choices." }
      ] },
      { t: "h", text: "Tutors and mana" },
      { t: "qa", items: [
        { q: "Can Pyre of Heroes find Ramses from Etrata?", a: "Yes, if you're willing: Etrata is a mana value 3 Assassin and Ramses is a mana value 4 Assassin. Usually you sacrifice Virtus, Slasher or Mari instead. Pyre reads the sacrificed creature's types and mana value as it last existed on the battlefield." },
        { q: "Demonic Consultation: what if Ramses is in the top six?", a: "He's exiled with them, and you keep revealing until your library is gone. Reanimate can't get him back from exile." },
        { q: "Are Fierce Guardianship and Deadly Rollick free with Etrata in the command zone?", a: "No. You must control your commander: she has to be on the battlefield." },
        { q: "Does Mox Amber make mana with only Tetsuko out?", a: "Yes, {U}: she's a legendary blue creature. With Etrata out it makes {U} or {B}." },
        { q: "Reverse the Polarity's counter mode: does it counter my own spells?", a: "Yes. It counters all other spells on the stack, yours included." }
      ] },
      { t: "widget", id: "quiz" }
    ]
  }
];
