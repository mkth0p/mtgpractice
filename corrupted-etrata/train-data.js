/* Corrupted Etrata: hand-written scenarios for two Train drills (train.js), for the heist closer list.
   Stack Sentinel: an opponent (or you) puts something on the stack, what do you do? The heist rules:
   save the last counter for the wrath and for removal aimed at Ramses or Etrata, let single creatures
   and commanders resolve. Threat Read: four players, who (or what) do you pick? With Ramses out, the
   mark is whoever the board kills soonest; without him, spread the hits; flip stolen cards rarely.
   Card text from heist-research.md (exact Oracle text); answers follow the comprehensive rules and the
   rulings cited in each explanation. answer: index of the best option, or a list when several are equally right. */
window.CETRATA_TRAIN_DATA = {
  stack: [
    {
      context: "Round 6, an opponent's main phase. You control <i-c>Etrata, Deadly Fugitive</i-c>, <i-c>Ramses, Assassin Lord</i-c> and four face-down 2/2s. You have Island, Island, Swamp untapped.",
      q: "They cast Damnation. Your hand: <i-c>Swan Song</i-c>, <i-c>Force of Will</i-c>, <i-c>Brainstorm</i-c>. What do you do?",
      options: ["Swan Song the Damnation", "Force of Will the Damnation, exiling Brainstorm", "Let it resolve and rebuild"],
      answer: 0,
      explain: "This is the wrath you save counters for. <i-c>Swan Song</i-c> hits sorceries for one mana, and a 2/2 Bird for them is nothing next to your whole board. Keep <i-c>Force of Will</i-c>: it's your only answer to a creature spell.",
      principle: "Counter with the narrowest spell that hits. Keep the flexible counter for what only it can stop."
    },
    {
      context: "Round 5. You have Ramses and three Assassins out. An opponent casts a 5/5 creature: a good blocker, nothing that wins. You have <i-c>Force of Will</i-c>, your last counter, and a blue card to exile.",
      q: "Do you counter it?",
      options: ["Yes, Force of Will it", "No, let it resolve"],
      answer: 1,
      explain: "Rule 5 of the plan: save the last counter for the wrath and for removal aimed at Ramses or Etrata; let single creatures resolve. In the bot games saving the last counter was worth +1.0 against the precons. A 5/5 blocks one attacker. A wrath takes everything.",
      principle: "One blocker doesn't beat you. The wrath does. Save the last counter for it."
    },
    {
      context: "Round 4. An opponent casts their commander. You hold <i-c>Force of Will</i-c> and <i-c>Fierce Guardianship</i-c>, with Etrata on the battlefield.",
      q: "What do you do?",
      options: ["Force of Will the commander", "Fierce Guardianship the commander, for free", "Let it resolve"],
      answer: 2,
      explain: "<i-c>Fierce Guardianship</i-c> only counters noncreature spells, so it can't touch a creature commander anyway. A countered commander goes back to the command zone and comes again for two more mana, while your counter is gone for good. Let it resolve; <i-c>Deadly Rollick</i-c> or <i-c>Snuff Out</i-c> can deal with it later if it matters.",
      principle: "Let single creatures and commanders resolve. Counters are for wraths and for removal on your key pieces."
    },
    {
      context: "Your turn, round 4, first main phase. You cast <i-c>Ramses, Assassin Lord</i-c> before combat. An opponent casts Counterspell on him. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c>. Can you save Ramses?",
      options: ["No: Swan Song can't counter creature spells", "Yes: Swan Song their Counterspell"],
      answer: 1,
      explain: "You're not targeting Ramses: you're targeting their Counterspell, an instant, which <i-c>Swan Song</i-c> can counter. Ramses then resolves. That's why rule 3 says cast him right before combat with a counter up if you can.",
      principle: "Your narrow counters protect any of your spells, because the spell they target is theirs."
    },
    {
      context: "An opponent's turn, round 6. Etrata died last turn and is in the command zone. Ramses is on the battlefield. You're tapped out.",
      q: "They cast Toxic Deluge for 4. Your hand: <i-c>Force of Negation</i-c>, <i-c>Fierce Guardianship</i-c>, <i-c>Brainstorm</i-c>. What do you do?",
      options: ["Fierce Guardianship it for free", "Force of Negation it, exiling Brainstorm", "Nothing: you're tapped out"],
      answer: 1,
      explain: "It's not your turn, so <i-c>Force of Negation</i-c> can be cast by exiling a blue card instead of paying. <i-c>Fierce Guardianship</i-c> is free only if you control a commander, and Etrata in the command zone doesn't count.",
      principle: "Force of Negation is free on everyone else's turn. Fierce Guardianship is free only with your commander on the battlefield."
    },
    {
      context: "Your turn, round 5, combat. An opponent casts Swords to Plowshares on Ramses. You're tapped out and Etrata is in the command zone.",
      q: "Your hand: <i-c>Force of Negation</i-c>, <i-c>Preordain</i-c>. What can you do?",
      options: ["Force of Negation, exiling Preordain", "Nothing: Force of Negation isn't free on your own turn", "Fierce Guardianship from the command zone"],
      answer: 1,
      explain: "“If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost.” On your turn it costs {1}{U}{U}. On your own turn the free counters are <i-c>Force of Will</i-c> (1 life and a blue card) and, with a commander out, <i-c>Fierce Guardianship</i-c>.",
      principle: "On your own turn, leave mana up or hold Force of Will if Ramses has to survive."
    },
    {
      context: "Your end step, round 6. Etrata, Ramses, <i-c>Leyline of Transformation</i-c> and five stolen face-down cards are on your battlefield. You're tapped out.",
      q: "An opponent casts <i-c>Cyclonic Rift</i-c> with overload. You hold <i-c>Fierce Guardianship</i-c>. What do you do?",
      options: ["Cast Fierce Guardianship for free and counter it", "Let it go: Rift doesn't touch stolen cards", "You can't: you're tapped out"],
      answer: 0,
      explain: "Overloaded Rift returns every nonland permanent its caster doesn't control to its owner's hand: Ramses and the Leyline to your hand, Etrata to your hand or the command zone, and the stolen face-down cards to their owners. With Etrata on the battlefield, tapped or not, <i-c>Fierce Guardianship</i-c> costs nothing, and Rift is a noncreature spell.",
      principle: "With Etrata out, Fierce Guardianship and Deadly Rollick cost nothing. You're never really tapped out."
    },
    {
      context: "Round 7. An opponent who can attack you for lethal next turn casts Craterhoof Behemoth. You have {1}{U}{U} open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>Fierce Guardianship</i-c>, <i-c>Reverse the Polarity</i-c>. Which one stops it?",
      options: ["Swan Song", "Fierce Guardianship", "Reverse the Polarity, choosing “counter all other spells”", "None of them"],
      answer: 2,
      explain: "Craterhoof is a creature spell. <i-c>Swan Song</i-c> hits enchantments, instants and sorceries; <i-c>Fierce Guardianship</i-c> only noncreature spells. <i-c>Reverse the Polarity</i-c>'s first mode counters every other spell on the stack, creatures included.",
      principle: "Count your creature answers: Force of Will and Reverse the Polarity's counter mode."
    },
    {
      context: "Your turn, round 7. <i-c>Sanguine Bond</i-c> is out and you cast <i-c>Exquisite Blood</i-c> to finish the table. An opponent casts Swan Song on it. Etrata is on the battlefield and you have {1}{U}{U} open.",
      q: "You hold <i-c>Reverse the Polarity</i-c> and <i-c>Fierce Guardianship</i-c>. What do you do?",
      options: ["Reverse the Polarity, counter mode", "Fierce Guardianship their Swan Song, for free", "Let it go and try next turn"],
      answer: 1,
      explain: "Reverse the Polarity's counter mode counters all OTHER spells: their Swan Song and your <i-c>Exquisite Blood</i-c> too. <i-c>Fierce Guardianship</i-c> targets only their Swan Song and costs nothing with Etrata out, and you keep the mana for a second counter.",
      principle: "“Counter all other spells” counts yours. Protect your own spell with a targeted counter."
    },
    {
      context: "Round 5. One opponent, a deck full of wraths, sits on five untapped lands. Another casts <i-c>Rhystic Study</i-c>. Your only counter is <i-c>Force of Will</i-c>.",
      q: "Counter the Rhystic Study?",
      options: ["Yes: it's a card-draw engine", "No: hold the counter for the wrath"],
      answer: 1,
      explain: "Rhystic Study taxes you a bit for the rest of the game. A wrath takes your whole board, and Ramses with it. One counter, one target: the one that beats you.",
      principle: "With one counter left, hold it for the wrath and for removal on Ramses or Etrata."
    },
    {
      context: "An opponent's turn, round 6. <i-c>Eldrazi Monument</i-c>, Ramses, Etrata and five other creatures are on your battlefield. You have <i-c>Force of Will</i-c> and a blue card to exile.",
      q: "They cast Wrath of God. What do you do?",
      options: ["Force of Will it", "Let it resolve"],
      answer: 1,
      explain: "Wrath of God destroys. Your creatures have indestructible from the Monument, so they survive and the other players' boards don't. Keep the counter.",
      principle: "Know which wraths your board already survives: Monument beats destroy, not -X/-X, exile or bounce."
    },
    {
      context: "Same board: <i-c>Eldrazi Monument</i-c>, Ramses, Etrata and five other creatures. An opponent casts Toxic Deluge for 6.",
      q: "You have <i-c>Force of Will</i-c> and a blue card. What do you do?",
      options: ["Let it resolve: indestructible saves them", "Force of Will it"],
      answer: 1,
      explain: "Toxic Deluge gives -6/-6. A creature with 0 or less toughness goes to the graveyard no matter what, indestructible or not. This is the wrath to counter.",
      principle: "Indestructible stops destroy and damage. It doesn't stop toughness going to 0."
    },
    {
      context: "Another player's turn, round 7. You attacked with everything on your turn and <i-c>Teferi's Veil</i-c> phased it all out: Etrata, Ramses and your Assassins. Still on the battlefield: <i-c>Dark Confidant</i-c> and <i-c>Tetsuko Umezawa, Fugitive</i-c>.",
      q: "An opponent casts Day of Judgment. You hold <i-c>Swan Song</i-c> with one blue open. Counter it?",
      options: ["Yes, it's a wrath", "No: your phased-out team isn't there to be destroyed"],
      answer: 1,
      explain: "Phased-out creatures are treated as though they don't exist, so the wrath misses them. You lose two small creatures, the table loses its blockers, and your team phases back in at your untap step. That's rule 6: attack with everything once the Veil is out.",
      principle: "Don't counter a wrath that mostly hits everyone else."
    },
    {
      context: "Round 5. Etrata is on the battlefield. An opponent casts a 4/4 flier that will block your Monument-flying team. You have one blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>Deadly Rollick</i-c>. What do you do?",
      options: ["Swan Song it", "Let it resolve, then exile it with Deadly Rollick for free when it matters", "Let it resolve and live with it"],
      answer: 1,
      explain: "It's a creature spell: <i-c>Swan Song</i-c> can't target it. Once it's on the battlefield, <i-c>Deadly Rollick</i-c> exiles it, free while you control a commander. Do it on your turn, right before the attack it would block.",
      principle: "When the counter can't hit it, plan the removal."
    },
    {
      context: "Your turn, round 6, before combat. Ramses is out. The opponent you're killing this turn has one untapped blocker: a black 3/3 flier with deathtouch. Etrata is on the battlefield.",
      q: "Your hand: <i-c>Snuff Out</i-c>, <i-c>Deadly Rollick</i-c>. Which removes it?",
      options: ["Snuff Out, paying 4 life", "Deadly Rollick, for free", "Either"],
      answer: 1,
      explain: "<i-c>Snuff Out</i-c> only destroys a nonblack creature. <i-c>Deadly Rollick</i-c> exiles any creature, and with Etrata out it costs nothing.",
      principle: "Read the removal's restriction before you need it: Snuff Out is nonblack only."
    },
    {
      context: "An opponent's turn, round 6. Etrata is out, with a face-down card you stole: you looked, it's a Counterspell. You have four lands untapped.",
      q: "That opponent casts Swords to Plowshares on Ramses. What do you do?",
      options: ["Activate Etrata's ability on the face-down card: it can't turn face up, so you exile it and cast the Counterspell free on the Swords", "Nothing: you can only flip at sorcery speed", "Nothing: a face-down Counterspell is just a 2/2"],
      answer: 0,
      explain: "Etrata's granted ability can be activated any time you have priority. A Counterspell isn't a creature card, so it can't be turned face up: you exile it and may cast it without paying its mana cost while the ability resolves, so it counters the Swords still on the stack.",
      principle: "Your stolen instants are free answers for four mana. Look at your face-down cards every turn."
    },
    {
      context: "Your turn, round 7. Ramses and <i-c>Bloodletter of Aclazotz</i-c> are out. <i-c>Virtus the Veiled</i-c> hit the marked player and its halving trigger is on the stack: it kills them and wins you the game. They cast Teferi's Protection in response. Etrata is out and you have one blue open.",
      q: "You hold <i-c>Fierce Guardianship</i-c> and <i-c>Swan Song</i-c>. What do you do?",
      options: ["Fierce Guardianship it", "Swan Song it", "Let it resolve: they lose anyway"],
      answer: [0, 1],
      explain: "Teferi's Protection stops their life total from changing, so the trigger would do nothing. It's an instant: both counters hit it. You win this turn, so neither the Bird nor which counter you spend matters.",
      principle: "On your win turn, every counter is equally good. Use the one you're sure about."
    },
    {
      context: "Round 7. An opponent at 62 life activates Aetherflux Reservoir (pay 50 life: 50 damage) targeting you. You have three blue open.",
      q: "Your hand: <i-c>Force of Will</i-c>, <i-c>Reverse the Polarity</i-c>. What stops it?",
      options: ["Force of Will the ability", "Reverse the Polarity, counter mode", "Nothing in your hand"],
      answer: 2,
      explain: "Both counter spells, not abilities. Reverse's mode is “counter all other spells”: an activated ability on the stack isn't a spell. The answer had to come earlier: the Reservoir itself, or the spells that gained the life.",
      principle: "Counterspells can't touch activated or triggered abilities."
    },
    {
      context: "Your turn, round 6. You cast <i-c>Kindred Dominance</i-c> naming Assassin; <i-c>Leyline of Transformation</i-c> makes your whole board Assassins. An opponent casts Counterspell on it. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c>. What do you do?",
      options: ["Swan Song their Counterspell", "Let it go: Dominance isn't worth a card", "You can't: Swan Song only protects creatures"],
      answer: 0,
      explain: "Counterspell is an instant, so <i-c>Swan Song</i-c> counters it. With the Leyline out Dominance is a one-sided wrath: every creature that isn't an Assassin dies, and all of yours are Assassins.",
      principle: "A one-sided wrath is worth protecting like a win."
    },
    {
      context: "Your turn, round 5. You cast Ramses with colored mana from <i-c>Cavern of Souls</i-c>, which named Assassin. An opponent casts Counterspell on him. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c>. Do you use it?",
      options: ["Yes, Swan Song their Counterspell", "No: Ramses can't be countered"],
      answer: 1,
      explain: "A creature spell of the chosen type cast with Cavern's mana can't be countered. Their Counterspell resolves and does nothing. Keep <i-c>Swan Song</i-c> for the wrath.",
      principle: "Know when you're already protected, and don't spend a counter twice."
    },
    {
      context: "Your turn, round 6. You attack, and in combat an opponent casts a removal spell on Etrata. You're tapped out.",
      q: "Your hand: <i-c>Force of Will</i-c>, <i-c>Brainstorm</i-c>. What do you do?",
      options: ["Force of Will it, paying 1 life and exiling Brainstorm", "Let her die: recast her later", "Nothing: no counter is free on your turn"],
      answer: 0,
      explain: "<i-c>Force of Will</i-c>'s alternative cost works on any turn. Removal aimed at Etrata is one of the two things rule 5 saves the last counter for: she's your engine, and each recast costs two more.",
      principle: "Force of Will is the one free counter on your own turn. Spend it on the wrath or on removal on Etrata or Ramses."
    },
    {
      context: "Round 6. You control Etrata, Ramses and six face-down 2/2s. An opponent casts Massacre Wurm (when it enters, creatures your opponents control get -2/-2 until end of turn; whenever one of them dies, its controller loses 2 life).",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>Force of Will</i-c>. What do you do?",
      options: ["Swan Song it", "Force of Will it", "Let it resolve: it's a single creature"],
      answer: 1,
      explain: "It's a creature spell, so <i-c>Swan Song</i-c> can't target it, but it's a wrath on your board: the face-down 2/2s die and you lose 2 life for each. “Let single creatures resolve” is about creatures that just block or attack.",
      principle: "A creature that wipes your board is a wrath. Count what it does, not its card type."
    }
  ],
  threat: [
    {
      context: "Your turn, round 6. Ramses is out. Opponent A: 12 life, three untapped fliers. Opponent B: 15 life, no untapped creatures. Opponent C: 31 life, one ground blocker. Your evasive attackers deal about 16 to an open player.",
      q: "Who's the mark?",
      options: ["A: lowest life", "B: the board kills them this turn", "C: the highest life total is the biggest threat"],
      answer: 1,
      explain: "Into B, 16 damage is lethal this turn. Into A, the fliers block most of it and A survives. With Ramses out, one death is the game: the mark is whoever the board kills soonest, not whoever has the least life.",
      principle: "With Ramses out, the mark is whoever the board kills soonest. Count blockers, not just life."
    },
    {
      context: "Your turn, round 7. Ramses and <i-c>Bloodletter of Aclazotz</i-c> are out. <i-c>Changeling Outcast</i-c> carries <i-c>Quietus Spike</i-c>. Opponents at 40, 23 and 12.",
      q: "Who does the Outcast attack?",
      options: ["The player at 40", "The player at 12", "Any of them: whoever it hits dies, and Ramses wins you the game"],
      answer: 2,
      explain: "The Outcast can't be blocked. On your turn its 2 damage (Ramses makes it 2/2) is doubled, then the Spike's half rounded up is doubled to everything left. It's an Assassin (changeling), so that death wins. If one player has a known fog or a protection spell, hit someone else.",
      principle: "Halve plus double is all of it. With Ramses out, that's the game."
    },
    {
      context: "Round 5. No Ramses yet. You have Etrata and three Assassins that can't be blocked. Opponent A is at 6 life, and four of your face-down cards came from A's library. B and C are at 30.",
      q: "Where do the three Assassins go?",
      options: ["All at A: kill a player", "One at each opponent"],
      answer: 1,
      explain: "Without Ramses a single death doesn't win, and a player who leaves the game takes every card they own with them: your four stolen cards from A would go too. Spread the hits: each connecting Assassin is another card from another library.",
      principle: "Without Ramses, spread the hits. Each hit is a card; a dead player takes their cards home."
    },
    {
      context: "Your turn, round 6. Ramses is out, but nobody dies this turn. A: 16 life, no untapped creatures. B: 9 life behind a wall of untapped fliers and reach creatures. C: 35 life, two ground blockers. About 10 damage can get through to an open player.",
      q: "Where do your attackers go?",
      options: ["At B, the lowest life", "Everything that gets through at A, the rest at whoever is open", "Split evenly"],
      answer: 1,
      explain: "A drops to 6 and dies next turn. Into B almost nothing gets through. Attackers that can't reach A still hit whoever is open, since each Assassin hit is a card. In the bot games, the marking attack brain was worth 3.1 / 1.6 points over the generic one.",
      principle: "Pick one player and kill them. The rest still hit whoever is open."
    },
    {
      context: "Your first main phase, round 5. You have 6 mana. <i-c>Ramses, Assassin Lord</i-c> is in your hand. One of your face-down cards is a stolen 6/6 creature (you looked).",
      q: "What do you do before combat?",
      options: ["Flip the 6/6 with Etrata's ability and attack with it", "Cast Ramses; keep the 6/6 face down", "Hold everything for the opponents' turns"],
      answer: 1,
      explain: "Rule 3 and rule 8: Ramses first, and stolen cards are turned up after your own spells, never before combat. Six mana doesn't cover both (Ramses is 4, the flip {2}{U}{B}). Ramses pumps your Assassins this combat and turns one kill into a win. In the bot games, flipping first cost 1.7 / 0.7 points.",
      principle: "Your own spells first. Flip later, and only when it beats the 2/2."
    },
    {
      context: "Your second main phase, round 6. You've cast your spells and have 4 mana left. Two face-down stolen cards: one is a 7-mana 8/8 trample creature, the other a 1-mana 1/1.",
      q: "What do you flip?",
      options: ["Both", "The 8/8, with Etrata's {2}{U}{B}", "The 1/1, it's cheap", "Neither"],
      answer: 1,
      explain: "The 8/8 beats the 2/2 it is now; Etrata's ability turns it up without needing its colors. The 1/1 is worse than a 2/2 with ward {2}: leave it face down.",
      principle: "A stolen card is turned up only when it beats the 2/2 it is: a big creature, a free artifact or enchantment."
    },
    {
      context: "Round 5. One of your stolen face-down cards is a Counterspell. Etrata is out. It's your main phase and the stack is empty.",
      q: "When do you use it?",
      options: ["Now, before an opponent can kill the face-down card", "Hold it: activate Etrata's ability when an opponent casts a wrath or removal on Ramses or Etrata", "Never: stolen spells are just 2/2s"],
      answer: 1,
      explain: "Stolen instants and sorceries are cast through Etrata's exile clause at the moment they matter. With nothing on the stack, Counterspell has nothing to counter. Keep four mana up on the turns you hold it, and keep Etrata home if <i-c>Teferi's Veil</i-c> would phase her out: while she's phased out she grants nothing.",
      principle: "Cast stolen spells when they matter, not when you can."
    },
    {
      context: "Round 4. No Ramses. <i-c>Changeling Outcast</i-c> is your only attacker. Your opponents: a ramp deck full of 7- and 8-mana creatures, a tokens deck, and a control deck with 12 lands.",
      q: "Who does the Outcast hit, for Etrata's cloak?",
      options: ["The ramp deck", "The tokens deck", "The control deck"],
      answer: 0,
      explain: "A cloaked creature card turns face up with Etrata's ability for {2}{U}{B}, whatever its cost and colors: from the ramp deck that's often an 8-drop for four mana. The control deck's top card is often a land, which stays a 2/2.",
      principle: "Steal from the deck whose average card is the most expensive."
    },
    {
      context: "Your turn, round 7. Ramses and <i-c>Bloodletter of Aclazotz</i-c> are out. The mark has untapped ground blockers. Your attackers: <i-c>Virtus the Veiled</i-c> (a 2/2 with Ramses) and three face-down 3/3 Assassins. You have <i-c>Rogue's Passage</i-c> and four other lands.",
      q: "Which creature does Rogue's Passage make unblockable?",
      options: ["A face-down 3/3", "Virtus", "Nobody: save the mana"],
      answer: 1,
      explain: "Virtus's hit halves the mark's life, and on your turn Bloodletter doubles it to all of it: a dead player and a Ramses win. Ramses made Virtus a 2/2, so <i-c>Tetsuko Umezawa, Fugitive</i-c> no longer covers it; the Passage does.",
      principle: "Make the halver connect. One hit with Bloodletter out is a kill."
    },
    {
      context: "Your turn, round 7, before combat. Ramses and <i-c>Eldrazi Monument</i-c> are out; your team flies. The mark has one untapped creature with flying and deathtouch, the only thing that can block. Another opponent's commander draws them a card every turn. Etrata is out and you hold <i-c>Deadly Rollick</i-c>.",
      q: "What does Rollick exile?",
      options: ["The mark's flying blocker", "The card-draw commander", "Nothing: save it"],
      answer: 0,
      explain: "With the blocker gone, the whole team gets through to the mark this turn, and one death is the game. The commander's cards don't matter once you've won.",
      principle: "With Ramses out, spend removal on whatever stops this turn's kill."
    },
    {
      context: "Your turn, round 6. <i-c>Leyline of Transformation</i-c> named Assassin. Your board: Etrata, Ramses, two changelings and five face-down cards. The opponents have Humans, Elves and a Dragon. You cast <i-c>Kindred Dominance</i-c>.",
      q: "Which type do you choose?",
      options: ["Assassin", "Vampire", "Human"],
      answer: 0,
      explain: "Every creature you control is an Assassin through the Leyline, so they all live, and every opponent's creature that isn't an Assassin dies. Naming Vampire would kill most of your own board.",
      principle: "With a type-changer out, Kindred Dominance naming Assassin is a one-sided wrath."
    },
    {
      context: "Your turn, round 6. <i-c>Teferi's Veil</i-c> and Ramses are out. Two opponents have big boards that could attack you next turn. Your evasive team can hit the mark for most of their life.",
      q: "What do you attack with?",
      options: ["Everything that gets through", "Half the team; the rest stays home to block", "Only the creatures that can't be blocked"],
      answer: 0,
      explain: "Rule 6: once the Veil is out, attack with everything that gets through. The attackers phase out through everyone else's turn, so the wraths miss them. Holding the board back for the crack-back measured nothing in the bot games (+0.2 / +0.4).",
      principle: "With Teferi's Veil out, attacking is also your defense against wraths."
    }
  ]
};
