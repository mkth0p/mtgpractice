/* Card wiki extras for the Corrupted Etrata deck (the heist closer): per-card ratings, rulings, tips and combos,
   plus the glossary, the cut list and the FAQ. Card names match window.CETRATA_CARDS exactly. */
window.CETRATA_WIKI = {
 "Etrata, Deadly Fugitive": {
  "rating": 5,
  "when": "The turn an Assassin connects, often turn 2 or 3",
  "tags": [
   "commander",
   "legendary",
   "deathtouch",
   "assassin",
   "cloak engine"
  ],
  "rulings": [
   {
    "q": "Does she trigger once per Assassin or once per player?",
    "a": "Once per Assassin. Three Assassins that deal combat damage to the same opponent give three triggers, and each one cloaks the top card of that player's library."
   },
   {
    "q": "Does she need to have been out since the start of the turn?",
    "a": "No. Her trigger only needs her on the battlefield when the Assassin deals combat damage. Cast her before combat and the first hit that turn already cloaks."
   },
   {
    "q": "What does her granted ability do with each kind of card?",
    "a": "It uses the stack. A permanent card (creature, artifact, enchantment or land) turns face up and stays on the battlefield. An instant or sorcery can't be turned face up, so you exile it and may cast it right away without paying its mana cost. X is 0, and you still pay additional costs and choose legal targets."
   },
   {
    "q": "Does turning a card face up count as it entering the battlefield?",
    "a": "No. Enters triggers and 'as this enters' choices don't happen, and <i-c>Satoru, the Infiltrator</i-c> doesn't draw. <i-c>Roshan, Hidden Magister</i-c> does draw, because he triggers on turning face up."
   },
   {
    "q": "Who owns a card I cloak from an opponent's library?",
    "a": "The opponent. You control it while it's on the battlefield. If it leaves the battlefield it goes to its owner's graveyard, hand or library, and if that player leaves the game, the card leaves with them."
   }
  ],
  "tips": [
   "A cloaked creature card can also turn face up for its own mana cost. Use her {2}{U}{B} for noncreature cards, or when the mana cost is higher. Flip rarely: the 2/2 is often worth more than the card (rule 8).",
   "While she's on the battlefield, <i-c>Fierce Guardianship</i-c> and <i-c>Deadly Rollick</i-c> are free. A copy of her is not your commander.",
   "She's a Vampire Assassin, so <i-c>Path of Ancestry</i-c> scries off your Assassin and Vampire spells."
  ],
  "combos": [
   "Spark Double",
   "Roaming Throne",
   "Leyline of Transformation",
   "Satoru, the Infiltrator",
   "They Came from the Pipes"
  ]
 },
 "Changeling Outcast": {
  "rating": 4,
  "when": "Turn 1",
  "tags": [
   "one-drop",
   "changeling",
   "unblockable",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Is it an Assassin for Etrata and Ramses?",
    "a": "Yes. Changeling makes it every creature type in every zone."
   },
   {
    "q": "If it gets bigger, is it still unblockable?",
    "a": "Yes. Its own text says it can't be blocked, whatever its size. Ramses' and Achilles' +1/+1 cost it nothing."
   },
   {
    "q": "Does it survive Kindred Dominance naming Assassin?",
    "a": "Yes. It has every creature type, Assassin included."
   }
  ],
  "tips": [
   "It counts as every type for <i-c>Coat of Arms</i-c>, so it shares a type with every creature on the battlefield.",
   "With <i-c>Pyre of Heroes</i-c> it can become any two-drop creature card in your library that shares a type with it, which is all of them."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Coat of Arms"
  ]
 },
 "Hired Poisoner": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "one-drop",
   "deathtouch",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Is it unblockable with Tetsuko?",
    "a": "Yes, while its power or toughness is 1 or less. It's a 1/1, so it qualifies until something pumps it."
   },
   {
    "q": "Does deathtouch work when it blocks?",
    "a": "Yes. Any damage it deals to a creature, attacking or blocking, is enough to destroy that creature."
   }
  ],
  "tips": [
   "With <i-c>Pyre of Heroes</i-c> it turns into a two-mana Assassin from your library.",
   "Don't hold it back for value. A 1/1 dies to every sweeper: it's there to hit early."
  ],
  "combos": [
   "Tetsuko Umezawa, Fugitive",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Slither Blade": {
  "rating": 3,
  "when": "Turn 1",
  "tags": [
   "one-drop",
   "unblockable",
   "rogue"
  ],
  "rulings": [
   {
    "q": "Does it trigger Etrata?",
    "a": "Only when it's an Assassin. <i-c>Leyline of Transformation</i-c> or <i-c>Arcane Adaptation</i-c> naming Assassin, or <i-c>Roshan, Hidden Magister</i-c>, add the type."
   },
   {
    "q": "Does it get Mari's deathtouch?",
    "a": "Yes. <i-c>Mari, the Killing Quill</i-c> gives her abilities to Rogues too, so it gets deathtouch and her hit-counter trigger."
   },
   {
    "q": "Does it survive Kindred Dominance naming Assassin?",
    "a": "Only with a type-changer out. As a plain Snake Rogue, it dies."
   }
  ],
  "tips": [
   "Pumps don't matter to it: it stays unblockable at any size, so Ramses' +1/+1 only helps once it's an Assassin.",
   "Cast the type-changer before combat on the turn you want it to cloak."
  ],
  "combos": [
   "Leyline of Transformation",
   "Roshan, Hidden Magister",
   "Mari, the Killing Quill"
  ]
 },
 "Mothdust Changeling": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "one-drop",
   "changeling",
   "flying",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Can I tap a creature that entered this turn to pay the cost?",
    "a": "Yes. The cost isn't that creature's own {T} ability, so summoning sickness doesn't stop it."
   },
   {
    "q": "Can it tap itself?",
    "a": "Yes, but then it's tapped and can't attack. Use another creature."
   },
   {
    "q": "Is it an Assassin?",
    "a": "Yes. Changeling makes it every creature type in every zone, so it also survives <i-c>Kindred Dominance</i-c> naming Assassin."
   }
  ],
  "tips": [
   "Freshly cloaked 2/2s can't attack yet: they are the best creatures to tap for it.",
   "With <i-c>Tetsuko Umezawa, Fugitive</i-c> out and nothing pumping it, it's already unblockable and doesn't need the flying."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 "Tetsuko Umezawa, Fugitive": {
  "rating": 3,
  "when": "Turns 1-2",
  "tags": [
   "two-drop",
   "legendary",
   "evasion",
   "rogue"
  ],
  "rulings": [
   {
    "q": "When is power or toughness checked?",
    "a": "When blockers are declared. If the creature has power or toughness 1 or less then, it can't be blocked. Pumping it after blocks doesn't change that."
   },
   {
    "q": "Do both numbers need to be 1 or less?",
    "a": "No. Only one of them. Etrata is a 1/4, so her power is enough."
   },
   {
    "q": "Is Tetsuko an Assassin?",
    "a": "No, she's a Human Rogue. She doesn't cloak for Etrata and doesn't count for Ramses' win unless a type-changer makes her an Assassin."
   }
  ],
  "tips": [
   "<i-c>Quietus Spike</i-c> gives no power or toughness, so a 1/1 halver carrying it stays unblockable.",
   "Once Ramses is out, the deck gets through with <i-c>Eldrazi Monument</i-c>, <i-c>Reverse the Polarity</i-c> and <i-c>Rogue's Passage</i-c> instead."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Quietus Spike",
   "Hired Poisoner"
  ]
 },
 "Satoru, the Infiltrator": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "two-drop",
   "legendary",
   "menace",
   "card draw"
  ],
  "rulings": [
   {
    "q": "Does a cloak from Etrata draw?",
    "a": "Yes. The cloaked card enters the battlefield without being cast, and it's not a token."
   },
   {
    "q": "Does Satoru draw when he himself is cast?",
    "a": "No, not if you spent mana on him. If you cast a creature spell without paying its mana cost but paid mana for additional costs or cost increases, it doesn't trigger either."
   },
   {
    "q": "Do two cloaks from two Etrata triggers draw two cards?",
    "a": "Yes. Each trigger resolves on its own, so each cloak is a separate entry and a separate draw."
   }
  ],
  "tips": [
   "<i-c>Reanimate</i-c> on Ramses puts him onto the battlefield without casting him, so Satoru draws.",
   "<i-c>Mari, the Killing Quill</i-c> gives Rogues deathtouch, so Satoru gets it."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "They Came from the Pipes",
   "Reanimate"
  ]
 },
 "Brotherhood Spy": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "two-drop",
   "assassin",
   "unblockable"
  ],
  "rulings": [
   {
    "q": "Do changelings or face-down Assassins count as the legendary Assassin?",
    "a": "No. The Assassin has to be legendary. Face-down creatures are never legendary, and Changeling Outcast and Mothdust Changeling aren't either."
   },
   {
    "q": "What if the legend leaves before the trigger resolves?",
    "a": "The trigger checks both when combat begins and when it resolves. If you no longer control a legendary Assassin, you get nothing."
   },
   {
    "q": "Does a Sakashima copy of Etrata count?",
    "a": "Yes. <i-c>Sakashima the Impostor</i-c> is legendary, and as a copy of Etrata it's a Vampire Assassin."
   }
  ],
  "tips": [
   "Once it's unblockable, pumps don't matter: Ramses making it a 3/4 is pure upside.",
   "With a type-changer naming Assassin, Tetsuko and Satoru also become legendary Assassins and switch it on."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Basim Ibn Ishaq",
   "Ramses, Assassin Lord"
  ]
 },
 "Reno and Rude": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "two-drop",
   "legendary",
   "menace",
   "assassin",
   "theft"
  ],
  "rulings": [
   {
    "q": "Can I play a land it exiles?",
    "a": "Only in your main phase with the stack empty and a land play left. You pay all costs and follow all timing rules for cards played this way."
   },
   {
    "q": "What if I don't sacrifice anything?",
    "a": "The card stays exiled and you can't play it. The sacrifice is what lets you play it this turn."
   },
   {
    "q": "Does a stolen cloak I sacrifice go to my graveyard?",
    "a": "No. It goes to its owner's graveyard. <i-c>Vein Ripper</i-c> still drains 2 for it."
   }
  ],
  "tips": [
   "It's a legendary Assassin, so it turns on <i-c>Brotherhood Spy</i-c> by itself.",
   "Mana of any type can be spent on the exiled card, so off-color spells are fine."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Vein Ripper",
   "Mari, the Killing Quill"
  ]
 },
 "Dark Confidant": {
  "rating": 3,
  "when": "Turns 1-2",
  "tags": [
   "two-drop",
   "card advantage",
   "life loss"
  ],
  "rulings": [
   {
    "q": "Is it a draw?",
    "a": "No. You reveal the card and put it into your hand. Effects that care about drawing don't see it."
   },
   {
    "q": "Is the trigger optional?",
    "a": "No. Every upkeep you reveal and lose life equal to the card's mana value. Lands cost 0, and X in a cost counts as 0."
   },
   {
    "q": "Does Bloodletter of Aclazotz double the life I lose?",
    "a": "No. It only doubles opponents' life loss."
   }
  ],
  "tips": [
   "With the drain loop's lifegain half out (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>), the life it costs comes back fast.",
   "Count Demonic Consultation and fetch lands when you decide whether you can afford it."
  ],
  "combos": [
   "Mystic Remora",
   "Rhystic Study"
  ]
 },
 "Virtus the Veiled": {
  "rating": 4,
  "when": "After Ramses, on the kill turn",
  "tags": [
   "three-drop",
   "legendary",
   "deathtouch",
   "halver",
   "assassin"
  ],
  "rulings": [
   {
    "q": "How is half rounded up worked out?",
    "a": "From the player's life total as the trigger resolves, after combat damage. A player at 25 loses 13."
   },
   {
    "q": "Does Bloodletter of Aclazotz double it?",
    "a": "Yes. It's life loss during your turn, so the player loses twice half their life rounded up: at least their whole life total."
   },
   {
    "q": "Can I play it without Gorm the Great?",
    "a": "Yes. Partner with only matters if you have Gorm. Its enters trigger lets a target player search for Gorm and nothing happens. Virtus is mono-black and legal in your 99."
   }
  ],
  "tips": [
   "Halving after an Assassin attacked that player: if it takes them to 0 with Ramses out, you win the game.",
   "With <i-c>Roaming Throne</i-c> naming Assassin its trigger happens twice: half, then half of what's left."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Tetsuko Umezawa, Fugitive",
   "Roaming Throne"
  ]
 },
 "Unstoppable Slasher": {
  "rating": 4,
  "when": "After Ramses, on the kill turn",
  "tags": [
   "three-drop",
   "deathtouch",
   "halver",
   "recursion",
   "assassin"
  ],
  "rulings": [
   {
    "q": "What's the math at 40 life?",
    "a": "A 2/3 Slasher deals 2, then they lose half of 38, so 19 left. With Ramses it's a 3/4: 40 to 37, then 18. With Bloodletter on your turn: 3 damage is 6 life lost (34), then half of 34 doubled is 34, so 0."
   },
   {
    "q": "How do stun counters work?",
    "a": "It returns tapped with two stun counters. Each time it would untap, you remove a stun counter instead, so it stays tapped through two of your untap steps."
   },
   {
    "q": "Does Ramses' +1/+1 stop it coming back?",
    "a": "No. That's a static bonus, not a counter. Only actual counters on it when it dies stop the return."
   }
  ],
  "tips": [
   "<i-c>Eldrazi Monument</i-c>'s upkeep sacrifice or <i-c>Ashnod's Altar</i-c> can eat it once for free: it comes back.",
   "It's an Assassin, so it survives <i-c>Kindred Dominance</i-c> naming Assassin."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Eldrazi Monument",
   "Ashnod's Altar"
  ]
 },
 "Mari, the Killing Quill": {
  "rating": 3,
  "when": "Turns 3-5, after Ramses",
  "tags": [
   "three-drop",
   "legendary",
   "deathtouch",
   "assassin",
   "treasure"
  ],
  "rulings": [
   {
    "q": "Which of my creatures get deathtouch?",
    "a": "Assassins, Mercenaries and Rogues. Slither Blade, Tetsuko, Satoru and Sakashima are Rogues; face-down creatures need a type-changer."
   },
   {
    "q": "Whose hit counter can I remove?",
    "a": "Only from a card the damaged player owns in exile. Hitting a player with no exiled creature cards with hit counters gives nothing."
   },
   {
    "q": "Does deathtouch change Tetsuko's evasion?",
    "a": "No. Deathtouch doesn't change power or toughness."
   }
  ],
  "tips": [
   "<i-c>Kindred Dominance</i-c> naming Assassin kills the opponents' boards and Mari exiles each of their creatures with a hit counter.",
   "The Treasures pay for Etrata's {2}{U}{B} flips or a recast of Etrata."
  ],
  "combos": [
   "Kindred Dominance",
   "Ramses, Assassin Lord",
   "Roshan, Hidden Magister"
  ]
 },
 "Ramses, Assassin Lord": {
  "rating": 5,
  "when": "Tutored first; cast right before combat",
  "tags": [
   "four-drop",
   "legendary",
   "deathtouch",
   "lord",
   "alt win",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Does the Assassin need to deal damage?",
    "a": "No. It only needs to have attacked that player this turn. It can be dead, gone or no longer an Assassin by the time the player loses."
   },
   {
    "q": "Does it matter how the player loses?",
    "a": "No. Combat damage, a halving trigger, Bloodletter's doubled loss or the drain loop all count, as long as an Assassin you controlled attacked them this turn. So the loop after an Assassin attack wins the game."
   },
   {
    "q": "Does Ramses need to be out when I attack?",
    "a": "No. He needs to be on the battlefield when the player loses. You can attack, then cast him in your second main phase and finish the player with a drain."
   },
   {
    "q": "What doesn't count as attacking the player?",
    "a": "Attacking a planeswalker they control, and an Assassin that was put onto the battlefield attacking. Neither is an Assassin attacking that player."
   }
  ],
  "tips": [
   "With <i-c>Roshan, Hidden Magister</i-c>, <i-c>Leyline of Transformation</i-c> or <i-c>Arcane Adaptation</i-c>, every creature you control is an Assassin and gets +1/+1.",
   "If he dies, <i-c>Reanimate</i-c> brings him back for {B}.",
   "<i-c>Spark Double</i-c> on him makes a second lord: your other Assassins get +2/+2."
  ],
  "combos": [
   "Bloodletter of Aclazotz",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Exquisite Blood",
   "Spark Double"
  ]
 },
 "Achilles Davenport": {
  "rating": 3,
  "when": "Second main phase after a hit",
  "tags": [
   "four-drop",
   "legendary",
   "lord",
   "freerunning",
   "menace",
   "assassin"
  ],
  "rulings": [
   {
    "q": "When can I pay the freerunning cost?",
    "a": "Once you've dealt combat damage to a player this turn with an Assassin or your commander. In practice that's your second main phase."
   },
   {
    "q": "Does freerunning change his mana value?",
    "a": "No. It's an alternative cost. His mana value stays 4."
   },
   {
    "q": "Do his bonus and Ramses' stack?",
    "a": "Yes. Each gives other Assassins +1/+1, so your other Assassins get +2/+2, and each lord gets +1/+1 from the other."
   }
  ],
  "tips": [
   "<i-c>Brotherhood Headquarters</i-c>' colored mana can pay for him: he's an Assassin and has freerunning.",
   "He's a legendary Assassin, so he turns on <i-c>Brotherhood Spy</i-c>."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Leyline of Transformation",
   "Roshan, Hidden Magister"
  ]
 },
 "Roshan, Hidden Magister": {
  "rating": 4,
  "when": "Turns 3-5, before an attack with cloaks",
  "tags": [
   "four-drop",
   "legendary",
   "type changer",
   "menace",
   "card draw",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Are face-down creatures Assassins with Roshan out?",
    "a": "Yes. His effect adds Assassin to other creatures you control, face-down ones included, so they trigger Etrata."
   },
   {
    "q": "Does turning face up with any method draw?",
    "a": "Yes. The normal special action and Etrata's ability both count. You draw a card and lose 1 life."
   },
   {
    "q": "Does he affect creature cards in my library?",
    "a": "Yes. Creature cards you own outside the battlefield are Assassins too, so <i-c>Pyre of Heroes</i-c> sacrificing an Assassin can find any creature card with the right mana value."
   }
  ],
  "tips": [
   "With Roshan out, <i-c>Kindred Dominance</i-c> naming Assassin kills every creature but yours.",
   "Your loop creatures (Vito, Bloodthirsty Conqueror, Bloodletter) become Assassins too: they survive the Dominance."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Kindred Dominance",
   "Ramses, Assassin Lord"
  ]
 },
 "Roaming Throne": {
  "rating": 3,
  "when": "Turns 4-5, with Etrata out",
  "tags": [
   "four-drop",
   "artifact creature",
   "trigger doubler",
   "ward",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Does it copy the trigger?",
    "a": "No. The ability triggers an additional time. Targets and other choices are made separately for each instance, and choices on resolution are made for each one."
   },
   {
    "q": "Does it double Etrata's own trigger?",
    "a": "Yes. Etrata is an Assassin, and the cloak trigger is her ability. Each Assassin hit cloaks twice. With a Spark Double copy of her too, it's four."
   },
   {
    "q": "Does it double Ramses' +1/+1?",
    "a": "No. That's a static ability, not a triggered one."
   }
  ],
  "tips": [
   "With <i-c>Roshan, Hidden Magister</i-c> out, Vito and Bloodthirsty Conqueror are Assassins, so their loop triggers double too.",
   "It's an artifact, so casting it triggers <i-c>Basim Ibn Ishaq</i-c>."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Vein Ripper",
   "Spark Double"
  ]
 },
 "Bloodletter of Aclazotz": {
  "rating": 5,
  "when": "After Ramses, the turn before or of the kill",
  "tags": [
   "four-drop",
   "flying",
   "life loss doubler",
   "vampire"
  ],
  "rulings": [
   {
    "q": "Does a halver plus Bloodletter always kill?",
    "a": "Yes. The player loses half their life rounded up, doubled, which is at least their whole life total. The combat damage before it is doubled too."
   },
   {
    "q": "Does it double my own life loss?",
    "a": "No. Only opponents' life loss, and only during your turn."
   },
   {
    "q": "Does it double damage?",
    "a": "No. It doubles the life loss from the damage. Lifelink still gains you only the damage dealt, but <i-c>Exquisite Blood</i-c> and <i-c>Bloodthirsty Conqueror</i-c> gain the full doubled loss."
   },
   {
    "q": "Is it a trigger?",
    "a": "No, a replacement effect: the loss is doubled as it happens. The game engine writes it as a second loss, which gives the same total."
   }
  ],
  "tips": [
   "Without a halver, it still doubles every point of combat damage and every drain on your turn.",
   "It's a Vampire, not an Assassin: with Kindred Dominance naming Assassin it dies unless a type-changer is out."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Quietus Spike",
   "Exquisite Blood"
  ]
 },
 "Spark Double": {
  "rating": 3,
  "when": "Turns 4-6, once Ramses or Etrata is out",
  "tags": [
   "four-drop",
   "clone",
   "copy"
  ],
  "rulings": [
   {
    "q": "How many triggers do I get with two Etratas?",
    "a": "Twice as many. Each Etrata triggers for each Assassin that deals combat damage to an opponent, so three connecting Assassins give six cloaks."
   },
   {
    "q": "Is the copy of Ramses an Assassin lord?",
    "a": "Yes. It's a non-legendary Ramses: your other Assassins get +2/+2, and each Ramses gets +1/+1 from the other."
   },
   {
    "q": "What happens if I copy Unstoppable Slasher?",
    "a": "The copy has a +1/+1 counter, so its return-when-it-dies trigger does nothing for it."
   },
   {
    "q": "Is a copy of Etrata my commander?",
    "a": "No. Fierce Guardianship and Deadly Rollick check for your real commander."
   }
  ],
  "tips": [
   "The copy of Etrata is a 2/5 deathtouch Assassin.",
   "With <i-c>Roaming Throne</i-c> naming Assassin, two Etratas cloak four cards per hit."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Roaming Throne"
  ]
 },
 "Sakashima the Impostor": {
  "rating": 3,
  "when": "Turns 4-6, once Ramses or Etrata is out",
  "tags": [
   "four-drop",
   "legendary",
   "clone",
   "copy"
  ],
  "rulings": [
   {
    "q": "Why doesn't the legend rule kill it?",
    "a": "The legend rule looks at names. Its name is Sakashima the Impostor, not Etrata or Ramses, so both stay."
   },
   {
    "q": "Can it copy an opponent's creature?",
    "a": "Yes, any creature on the battlefield. If you copy nothing, it stays a 3/1 Human Rogue and doesn't get its return ability."
   },
   {
    "q": "How does its {2}{U}{U} ability work?",
    "a": "It returns it to your hand at the beginning of the next end step, so you can recast it as a fresh copy. It must still be on the battlefield then. The bots never use it."
   }
  ],
  "tips": [
   "As a copy of Etrata or Ramses it's a legendary Assassin, so it turns on <i-c>Brotherhood Spy</i-c>.",
   "With both it and <i-c>Spark Double</i-c> on Etrata, each Assassin hit cloaks three cards."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Spark Double"
  ]
 },
 "Preordain": {
  "rating": 2,
  "when": "Turns 1-2",
  "tags": [
   "cantrip",
   "sorcery",
   "selection",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Can I put both cards on the bottom?",
    "a": "Yes. You can put any number of them on the bottom and the rest back on top in any order, then you draw."
   },
   {
    "q": "If Imperial Seal put Ramses on top, does Preordain draw him?",
    "a": "Yes, if you keep him on top when you scry. You look at the top two, keep <i-c>Ramses, Assassin Lord</i-c> on top and draw him."
   }
  ],
  "tips": [
   "Scry away expensive cards early: the deck wants lands and 1-2 mana Assassins on turns 1-3."
  ],
  "combos": [
   "Imperial Seal",
   "Brainstorm"
  ]
 },
 "Basim Ibn Ishaq": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "two-drop",
   "legendary",
   "assassin",
   "card draw",
   "historic"
  ],
  "rulings": [
   {
    "q": "Which spells are historic?",
    "a": "Artifacts, legendary spells and Sagas. Your mana rocks, Lotus Petal, the Equipment, Roaming Throne and your legendary creatures all count, Etrata included."
   },
   {
    "q": "Does casting Etrata from the command zone count?",
    "a": "Yes. She's a legendary spell, so casting her triggers him."
   },
   {
    "q": "Is he unblockable with Tetsuko?",
    "a": "No. He's a 2/2, so Tetsuko never covers him. His own trigger is his evasion, and his +1/+1 counters only make him bigger."
   }
  ],
  "tips": [
   "Hold a zero-mana artifact like <i-c>Mox Amber</i-c> or <i-c>Lotus Petal</i-c> for your main phase: free card, free evasion.",
   "He's a legendary Assassin, so he turns on <i-c>Brotherhood Spy</i-c>."
  ],
  "combos": [
   "Mox Amber",
   "Lotus Petal",
   "Brotherhood Spy"
  ]
 },
 "Brainstorm": {
  "rating": 2,
  "when": "Any time; best with a fetch land or after a tutor",
  "tags": [
   "cantrip",
   "instant",
   "selection",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Can I put back cards I drew?",
    "a": "Yes. Any two cards from your hand, including ones you just drew, in any order."
   },
   {
    "q": "Does it combine with Vampiric Tutor?",
    "a": "Yes. <i-c>Vampiric Tutor</i-c> puts the card on top, and Brainstorm draws it along with two more at instant speed."
   }
  ],
  "tips": [
   "Put back a blue card you'll pitch to <i-c>Force of Will</i-c> later only if you won't need it soon: you'll draw it again."
  ],
  "combos": [
   "Vampiric Tutor",
   "Polluted Delta",
   "Force of Will"
  ]
 },
 "Demonic Consultation": {
  "rating": 4,
  "when": "End of an opponent's turn, Ramses missing",
  "tags": [
   "tutor",
   "instant",
   "one mana",
   "risky"
  ],
  "rulings": [
   {
    "q": "When do I name the card?",
    "a": "As it resolves, not when you cast it. Opponents can't respond after you name it."
   },
   {
    "q": "What if the named card is in the top six?",
    "a": "It's exiled with the other five, and you keep revealing until your library is empty. You don't find it, and everything revealed is exiled."
   },
   {
    "q": "Can I make an opponent exile their library with it?",
    "a": "No. It has no targets and always affects you."
   },
   {
    "q": "Do I lose when my library is empty?",
    "a": "Not right away. You lose the next time you would draw from an empty library."
   }
  ],
  "tips": [
   "Never name a card that has already left your library (in hand, on the battlefield, in the graveyard): it exiles everything.",
   "Don't cast it right after Vampiric Tutor or Imperial Seal put Ramses on top: he'd be in the six it exiles.",
   "Holding it until the library had 30+ cards didn't help in bot games (−1.2 / −2.6): the decking came from the draw engines too."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Brainstorm"
  ]
 },
 "Vein Ripper": {
  "rating": 3,
  "when": "Late game, turns 6+",
  "tags": [
   "six-drop",
   "flying",
   "ward",
   "drain",
   "vampire",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Does it trigger for any creature?",
    "a": "Yes. Yours, the stolen ones and the opponents', tokens included."
   },
   {
    "q": "How does its ward work?",
    "a": "When it becomes the target of a spell or ability an opponent controls, that spell or ability is countered unless they sacrifice a creature."
   },
   {
    "q": "Does Bloodletter double its drain?",
    "a": "Yes, on your turn. The opponent loses 4 for each death. You still gain only 2."
   }
  ],
  "tips": [
   "It's a Vampire Assassin: it survives <i-c>Kindred Dominance</i-c> naming Assassin and drains for everything else that dies.",
   "With <i-c>Roaming Throne</i-c> naming Assassin, every death drains twice."
  ],
  "combos": [
   "Ashnod's Altar",
   "Kindred Dominance",
   "Sanguine Bond",
   "Exquisite Blood"
  ]
 },
 "Exquisite Blood": {
  "rating": 5,
  "when": "With Sanguine Bond or Vito out",
  "tags": [
   "loop piece",
   "enchantment",
   "drain",
   "second kill"
  ],
  "rulings": [
   {
    "q": "Does damage count as losing life?",
    "a": "Yes. Combat and noncombat damage to an opponent both make them lose that much life, so any hit triggers it."
   },
   {
    "q": "Does it trigger when an opponent pays life for a fetch land or a shock land?",
    "a": "Yes. Paying life is losing life. Your own life payments don't count."
   },
   {
    "q": "Can I stop the loop?",
    "a": "No. Neither Exquisite Blood nor <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c> says 'may'. It ends when every opponent has lost. If one can't lose, a mandatory loop that never ends makes the game a draw."
   },
   {
    "q": "Does the loop win through Ramses?",
    "a": "Yes, if it kills a player an Assassin you controlled attacked this turn: <i-c>Ramses, Assassin Lord</i-c>'s trigger then wins the game."
   }
  ],
  "tips": [
   "With <i-c>Bloodletter of Aclazotz</i-c> out on your turn, each loss is doubled, and you gain the doubled amount.",
   "Start it after combat on your turn: the first player to die was attacked by an Assassin, so Ramses wins on the spot."
  ],
  "combos": [
   "Sanguine Bond",
   "Vito, Thorn of the Dusk Rose",
   "Bloodletter of Aclazotz",
   "Vein Ripper",
   "Ramses, Assassin Lord"
  ]
 },
 "Sanguine Bond": {
  "rating": 4,
  "when": "Combo turn",
  "tags": [
   "loop piece",
   "enchantment",
   "drain",
   "second kill"
  ],
  "rulings": [
   {
    "q": "Can I split the loss between opponents?",
    "a": "Each trigger targets one opponent. Every trigger is a new choice, so you can switch targets as the loop goes."
   },
   {
    "q": "Is the loop mandatory?",
    "a": "Yes. Neither card says 'may'. Pick targets so the loop ends with every opponent at 0."
   },
   {
    "q": "Does lifelink start it?",
    "a": "Yes. Any life you gain triggers it, including <i-c>Vito, Thorn of the Dusk Rose</i-c>'s lifelink and <i-c>Vein Ripper</i-c>'s drain."
   }
  ],
  "tips": [
   "Target the player your Assassins attacked first: with Ramses out, their death wins the game."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vein Ripper"
  ]
 },
 "Bloodthirsty Conqueror": {
  "rating": 4,
  "when": "Turns 4-6, or the loop turn",
  "tags": [
   "five-drop",
   "loop piece",
   "flying",
   "deathtouch",
   "vampire"
  ],
  "rulings": [
   {
    "q": "How does the loop with Sanguine Bond kill everyone?",
    "a": "An opponent loses life, so you gain that much. <i-c>Sanguine Bond</i-c> then makes a target opponent lose that much, and you gain it again. Pick a new target whenever you want, and once a player has lost, target the next one."
   },
   {
    "q": "Does its own combat damage start the loop?",
    "a": "Yes. Combat damage makes that player lose life, so it triggers. With Bond or Vito out, one connected hit wins."
   },
   {
    "q": "Can I stop the loop?",
    "a": "No. None of the pieces says 'may'. It ends when every opponent has lost. If an opponent can't lose, a mandatory loop that never ends makes the game a draw."
   }
  ],
  "tips": [
   "With <i-c>Exquisite Blood</i-c> out too, each loss gains twice, so the loop grows.",
   "If an Assassin attacked a player this turn and Ramses is out, the loop killing them wins the game on its own."
  ],
  "combos": [
   "Sanguine Bond",
   "Vito, Thorn of the Dusk Rose",
   "Bloodletter of Aclazotz"
  ]
 },
 "Vito, Thorn of the Dusk Rose": {
  "rating": 4,
  "when": "Turn 3, or the loop turn",
  "tags": [
   "three-drop",
   "legendary",
   "loop piece",
   "drain",
   "vampire"
  ],
  "rulings": [
   {
    "q": "How does the loop with Exquisite Blood kill everyone?",
    "a": "Each time you gain life, Vito's trigger targets an opponent and they lose that much. <i-c>Exquisite Blood</i-c> gains it back, and Vito triggers again. Choose a new target whenever you want, and once a player has lost, target the next one."
   },
   {
    "q": "Does lifelink damage get doubled by Bloodletter?",
    "a": "The opponent loses double, but lifelink gains you only the damage dealt. With the loop on, the drain then gains the doubled loss."
   },
   {
    "q": "Does it work with Sanguine Bond?",
    "a": "They do the same thing, so together they only add more drains per gain. You still need a 'loses life, you gain' half to loop."
   }
  ],
  "tips": [
   "It's a legendary creature, so it makes <i-c>Mox Amber</i-c> tap for black and triggers <i-c>Basim Ibn Ishaq</i-c>.",
   "<i-c>Vein Ripper</i-c>'s 2 life gained per death triggers it: each death is 4 life from the table."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vein Ripper"
  ]
 },
 "Leyline of Transformation": {
  "rating": 4,
  "when": "Opening hand, or turns 4-5",
  "tags": [
   "type-changer",
   "enchantment",
   "leyline",
   "snowball",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Do face-down creatures become Assassins?",
    "a": "Yes. Being face down sets them to no types, and this adds Assassin afterwards. They trigger <i-c>Etrata, Deadly Fugitive</i-c> when they deal combat damage to an opponent."
   },
   {
    "q": "When do I choose the type if it starts on the battlefield?",
    "a": "As it's put onto the battlefield before the game begins. Choose Assassin."
   },
   {
    "q": "Does it affect cards I stole?",
    "a": "Yes. It affects creatures you control, whoever owns them."
   },
   {
    "q": "Does it matter outside the battlefield?",
    "a": "Yes. Your creature spells and creature cards you own elsewhere are Assassins too, so <i-c>Path of Ancestry</i-c> scries, <i-c>Cavern of Souls</i-c> and <i-c>Brotherhood Headquarters</i-c> can pay for any creature spell, and <i-c>Pyre of Heroes</i-c> can find any creature card."
   }
  ],
  "tips": [
   "With it out, <i-c>Bloodletter of Aclazotz</i-c>, Vito and Bloodthirsty Conqueror are Assassins: they cloak when they connect and Ramses pumps them."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Kindred Dominance",
   "Coat of Arms"
  ]
 },
 "Arcane Adaptation": {
  "rating": 4,
  "when": "Turns 3-4",
  "tags": [
   "type-changer",
   "enchantment",
   "snowball",
   "assassin"
  ],
  "rulings": [
   {
    "q": "Do face-down creatures become Assassins?",
    "a": "Yes. Face-down creatures have no creature types, but this adds Assassin on top, so they trigger <i-c>Etrata, Deadly Fugitive</i-c>."
   },
   {
    "q": "Does it affect creatures I cloaked from opponents?",
    "a": "Yes. It affects creatures you control, whoever owns them."
   },
   {
    "q": "Does it make my creature spells Assassins?",
    "a": "Yes, and creature cards you own outside the battlefield. That's what lets <i-c>Cavern of Souls</i-c> and <i-c>Brotherhood Headquarters</i-c> pay for any of your creature spells."
   }
  ],
  "tips": [
   "With Leyline already out, it's redundant: cast something else first."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Kindred Dominance",
   "Ramses, Assassin Lord"
  ]
 },
 "Coat of Arms": {
  "rating": 2,
  "when": "Wide board, with a type-changer",
  "tags": [
   "anthem",
   "artifact",
   "symmetric",
   "overrun"
  ],
  "rulings": [
   {
    "q": "Do creatures with several types count twice?",
    "a": "No. It counts creatures, not types. A creature counts once if it shares at least one type."
   },
   {
    "q": "Do face-down creatures count?",
    "a": "Only through a type-changer. A face-down 2/2 has no types, so it shares nothing until <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or Roshan makes it an Assassin."
   },
   {
    "q": "Does it count opponents' creatures?",
    "a": "Yes. It counts every other creature on the battlefield that shares a type, whoever controls it."
   }
  ],
  "tips": [
   "A Ramses-pumped board under Coat of Arms is usually lethal on one player: with Ramses out, that's the game."
  ],
  "combos": [
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Ramses, Assassin Lord"
  ]
 },
 "Eldrazi Monument": {
  "rating": 4,
  "when": "Turns 5+, wide board",
  "tags": [
   "anthem",
   "artifact",
   "flying",
   "indestructible",
   "wrath protection"
  ],
  "rulings": [
   {
    "q": "Can I sacrifice the Monument instead of a creature?",
    "a": "No. If you control a creature, you must sacrifice one. The Monument goes only when you have no creatures."
   },
   {
    "q": "What does indestructible stop?",
    "a": "Lethal damage and 'destroy' effects. A creature still dies to sacrifice, 0 toughness or the legend rule, and exile and bounce still work."
   },
   {
    "q": "Does it affect face-down creatures?",
    "a": "Yes. It affects every creature you control, including cloaked 2/2s."
   }
  ],
  "tips": [
   "With <i-c>Vein Ripper</i-c> out, each upkeep sacrifice drains 2."
  ],
  "combos": [
   "Teferi's Veil",
   "Reverse the Polarity",
   "Vein Ripper"
  ]
 },
 "Teferi's Veil": {
  "rating": 5,
  "when": "Before an all-in attack",
  "tags": [
   "phasing",
   "enchantment",
   "wrath protection",
   "two mana"
  ],
  "rulings": [
   {
    "q": "When do the attackers phase out?",
    "a": "At end of combat, after combat damage. A creature dealt lethal damage in combat dies before it can phase out."
   },
   {
    "q": "What happens while they're phased out?",
    "a": "They're treated as though they don't exist: wraths, removal and blockers can't touch them, and equipment attached to them phases out with them."
   },
   {
    "q": "When do they come back, and do they enter again?",
    "a": "They phase in during your next untap step, before you untap. Phasing in isn't entering: no enters triggers, and they can attack that turn."
   },
   {
    "q": "Does it work on creatures put onto the battlefield attacking?",
    "a": "No. It triggers when a creature attacks, which means being declared as an attacker."
   }
  ],
  "tips": [
   "Etrata phased out isn't on the battlefield for Mox Amber either. Keep a counter that doesn't need her, like <i-c>Force of Will</i-c> or <i-c>Swan Song</i-c>.",
   "Keeping blockers home measured nothing in bot games (+0.2 / +0.4): commit the attack."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Eldrazi Monument"
  ]
 },
 "They Came from the Pipes": {
  "rating": 3,
  "when": "Turns 4-6, with Etrata out",
  "tags": [
   "draw engine",
   "enchantment",
   "face-down",
   "manifest dread"
  ],
  "rulings": [
   {
    "q": "Does it draw for its own two manifests?",
    "a": "Yes. It's on the battlefield when its enters trigger resolves, so both face-down creatures entering trigger it."
   },
   {
    "q": "Does turning a creature face up draw?",
    "a": "No. Only a face-down creature entering does."
   },
   {
    "q": "Can I turn a manifested card face up?",
    "a": "If it's a creature card, any time you have priority, for its mana cost. It's a special action and doesn't use the stack. Etrata's {2}{U}{B} ability works on it too."
   }
  ],
  "tips": [
   "Manifest dread puts the other card into your graveyard: if it's a creature you want, <i-c>Reanimate</i-c> it."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Satoru, the Infiltrator"
  ]
 },
 "Quietus Spike": {
  "rating": 4,
  "when": "Turns 4+, Ramses out",
  "tags": [
   "equipment",
   "halver",
   "deathtouch",
   "kill kit"
  ],
  "rulings": [
   {
    "q": "Is the half counted before or after combat damage?",
    "a": "After. The trigger resolves after combat damage, and the half is counted on resolution: 20 life, hit for 2, they go to 18 and lose 9."
   },
   {
    "q": "What if two halvers connect?",
    "a": "Each one halves what's left when it resolves. The player doesn't lose the same amount twice."
   },
   {
    "q": "Does it change the creature's power or toughness?",
    "a": "No. A 1/1 stays a 1/1, so <i-c>Tetsuko Umezawa, Fugitive</i-c> still makes it unblockable."
   },
   {
    "q": "How does Bloodletter change it?",
    "a": "On your turn <i-c>Bloodletter of Aclazotz</i-c> doubles the loss: half their life, rounded up, doubled, is all of it."
   }
  ],
  "tips": [
   "With <i-c>Ramses, Assassin Lord</i-c> out, the equipped creature must be an Assassin that attacked, or another Assassin must attack the same player, for his win to fire."
  ],
  "combos": [
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord",
   "Changeling Outcast",
   "Tetsuko Umezawa, Fugitive"
  ]
 },
 "Reverse the Polarity": {
  "rating": 3,
  "when": "Kill turn, before blockers",
  "tags": [
   "modal",
   "instant",
   "unblockable",
   "counter"
  ],
  "rulings": [
   {
    "q": "When must I cast the unblockable mode?",
    "a": "Before blockers are declared: in your main phase, beginning of combat or declare attackers step. Once a creature is blocked, making it unblockable doesn't remove the blocker."
   },
   {
    "q": "Does 'counter all other spells' counter my own spells?",
    "a": "Yes. Every other spell on the stack, yours included."
   },
   {
    "q": "How does the switch mode work with pumps?",
    "a": "Switching applies after all other effects. A 2/4 that's switched and then gets +2/+0 is a 4/4, not a 6/2."
   }
  ],
  "tips": [
   "The switch mode turns <i-c>Etrata, Deadly Fugitive</i-c> into a 4/1 for a surprise hit, still with deathtouch."
  ],
  "combos": [
   "Eldrazi Monument",
   "Ramses, Assassin Lord",
   "Quietus Spike"
  ]
 },
 "Ashnod's Altar": {
  "rating": 3,
  "when": "Any time, best in response to removal",
  "tags": [
   "sac outlet",
   "artifact",
   "mana",
   "loop feeder"
  ],
  "rulings": [
   {
    "q": "Can I use it in response to a wrath or removal spell?",
    "a": "Yes. It's a mana ability: no stack, any time you have priority. The creature is gone before the spell resolves."
   },
   {
    "q": "Where does a sacrificed stolen card go?",
    "a": "To its owner's graveyard. It's revealed as it leaves."
   },
   {
    "q": "Is the mana colored?",
    "a": "No. {C}{C} only. It pays generic costs, like the {2} of Etrata's flip."
   }
  ],
  "tips": [
   "Sacrifice a creature an opponent is trying to steal or exile: you get the mana and they get nothing."
  ],
  "combos": [
   "Vein Ripper",
   "Exquisite Blood",
   "Sanguine Bond"
  ]
 },
 "Lightning Greaves": {
  "rating": 3,
  "when": "Turns 1-3, then the turn a key creature lands",
  "tags": [
   "equipment",
   "haste",
   "shroud",
   "protection"
  ],
  "rulings": [
   {
    "q": "Can I move it at instant speed in response to removal?",
    "a": "No. Equip is sorcery speed only."
   },
   {
    "q": "Does shroud stop wraths?",
    "a": "No. Shroud only stops targeting. Destroy-all and exile-all effects still hit it; that's <i-c>Teferi's Veil</i-c>'s job."
   },
   {
    "q": "Can I equip Quietus Spike to the creature wearing Greaves?",
    "a": "No. Equip targets, and shroud means you can't target it. Move Greaves to another creature first (equip {0}), then equip the Spike."
   }
  ],
  "tips": [
   "It's an artifact, so casting it triggers <i-c>Basim Ibn Ishaq</i-c>."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Basim Ibn Ishaq"
  ]
 },
 "Reanimate": {
  "rating": 3,
  "when": "After a wrath, your main phase",
  "tags": [
   "reanimation",
   "sorcery",
   "one mana",
   "ramses"
  ],
  "rulings": [
   {
    "q": "How much life do I lose?",
    "a": "The mana value of the card in the graveyard: 4 for Ramses. You lose it before any enters trigger resolves."
   },
   {
    "q": "Can I take an opponent's creature?",
    "a": "Yes. It targets a creature card in any graveyard and puts it onto the battlefield under your control."
   },
   {
    "q": "What if I leave the game?",
    "a": "In multiplayer, if you leave, the creature you control from Reanimate is exiled."
   }
  ],
  "tips": [
   "They Came from the Pipes' manifest dread puts a card into your graveyard: if it's a creature you want, Reanimate it."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "They Came from the Pipes"
  ]
 },
 "Demonic Tutor": {
  "rating": 5,
  "when": "Turns 2-4, for Ramses",
  "tags": [
   "tutor",
   "sorcery",
   "game changer",
   "ramses"
  ],
  "rulings": [
   {
    "q": "Does it reveal the card?",
    "a": "No. You put it into your hand without revealing it, then shuffle."
   },
   {
    "q": "Can I find a land?",
    "a": "Yes. It finds any card."
   }
  ],
  "tips": [
   "After Ramses the order barely matters: bot orders after him measured within a point of each other."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Reanimate",
   "Exquisite Blood",
   "Sanguine Bond"
  ]
 },
 "Vampiric Tutor": {
  "rating": 5,
  "when": "End of the turn before yours",
  "tags": [
   "tutor",
   "instant",
   "game changer",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Do I shuffle before or after putting the card on top?",
    "a": "Before. You search, shuffle, then put the card on top."
   },
   {
    "q": "With Dark Confidant, how much life do I lose?",
    "a": "Dark Confidant reveals it at your upkeep and you lose its mana value: 4 for Ramses, on top of Vampiric's 2."
   }
  ],
  "tips": [
   "Don't crack a fetch land between Vampiric and your draw."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Brainstorm",
   "Dark Confidant"
  ]
 },
 "Imperial Seal": {
  "rating": 5,
  "when": "Turns 1-3",
  "tags": [
   "tutor",
   "sorcery",
   "game changer",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Is it the same as Vampiric Tutor?",
    "a": "Yes, except it's a sorcery."
   },
   {
    "q": "Do I shuffle after putting the card on top?",
    "a": "No. You shuffle first, then put the card on top."
   }
  ],
  "tips": [
   "Seal then Preordain on the same turn: keep Ramses on top when you scry and draw him."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Preordain",
   "Brainstorm"
  ]
 },
 "Grim Tutor": {
  "rating": 4,
  "when": "Turns 2-5",
  "tags": [
   "tutor",
   "sorcery",
   "three mana"
  ],
  "rulings": [
   {
    "q": "Does it reveal?",
    "a": "No. The card goes to your hand unrevealed."
   },
   {
    "q": "Does paying 3 life trigger my Exquisite Blood?",
    "a": "No. Only an opponent losing life triggers it."
   }
  ],
  "tips": [
   "Swamp, Dark Ritual, Grim Tutor on turn 1 finds Ramses before anyone can react."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Dark Ritual"
  ]
 },
 "Diabolic Intent": {
  "rating": 4,
  "when": "Turns 3-5, with a spare 2/2",
  "tags": [
   "tutor",
   "sorcery",
   "sacrifice"
  ],
  "rulings": [
   {
    "q": "Is the creature lost if the spell is countered?",
    "a": "Yes. Sacrificing it is a cost, paid when you cast the spell."
   },
   {
    "q": "Where does a sacrificed cloaked card go?",
    "a": "To its owner's graveyard, revealed. The opponent you stole it from gets it in their graveyard."
   }
  ],
  "tips": [
   "With Vein Ripper out, each sacrifice drains its target opponent for 2 and you gain 2: with Sanguine Bond or Vito that starts the loop."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Vein Ripper"
  ]
 },
 "Pyre of Heroes": {
  "rating": 4,
  "when": "Main phase, before combat",
  "tags": [
   "tutor",
   "artifact",
   "sacrifice",
   "sorcery speed",
   "repeatable"
  ],
  "rulings": [
   {
    "q": "Can I sacrifice Etrata to find Ramses?",
    "a": "Yes. She's a 3-mana Vampire Assassin, so Pyre can find a 4-mana Assassin (Ramses, Achilles, Roshan) or a 4-mana Vampire (<i-c>Bloodletter of Aclazotz</i-c>). You can move her to the command zone and recast her later for {2} more."
   },
   {
    "q": "What does a face-down 2/2 find?",
    "a": "Its mana value is 0, so a 1-mana creature. It has no creature types unless a type-changer makes it an Assassin; then it finds a 1-mana Assassin like <i-c>Hired Poisoner</i-c> or <i-c>Changeling Outcast</i-c>."
   },
   {
    "q": "With Leyline of Transformation or Arcane Adaptation out, what changes?",
    "a": "Those make creature cards you own outside the battlefield Assassins too, so any creature you sacrifice (now an Assassin) can find any creature card in your library with mana value 1 higher."
   },
   {
    "q": "Can opponents kill the creature in response to stop me?",
    "a": "No. The sacrifice is part of the cost, paid as you activate. Opponents can respond to the ability, but the creature is already gone and the search still happens."
   }
  ],
  "tips": [
   "Changelings share a type with everything: <i-c>Changeling Outcast</i-c> finds any 2-mana creature."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Mari, the Killing Quill",
   "Etrata, Deadly Fugitive",
   "Bloodletter of Aclazotz",
   "Arcane Adaptation"
  ]
 },
 "Sol Ring": {
  "rating": 5,
  "when": "Turn 1",
  "tags": [
   "fast mana",
   "artifact",
   "colorless",
   "game changer"
  ],
  "rulings": [
   {
    "q": "Does it help cast Etrata?",
    "a": "It pays the {1}, not the {U}{B}."
   },
   {
    "q": "Does it trigger Basim Ibn Ishaq?",
    "a": "Yes. It's an artifact, which is historic, so casting it draws a card if <i-c>Basim Ibn Ishaq</i-c> is out."
   }
  ],
  "tips": [
   "Land and Sol Ring on turn 1, a second land on turn 2: four mana with {U}{B} from the lands casts <i-c>Ramses, Assassin Lord</i-c> on turn 2."
  ],
  "combos": [
   "Darkwater Catacombs",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Mox Amber": {
  "rating": 3,
  "when": "Turn 1-3, with a legend out",
  "tags": [
   "fast mana",
   "artifact",
   "legendary",
   "free"
  ],
  "rulings": [
   {
    "q": "What colors can it make?",
    "a": "Any color among legendary creatures and planeswalkers you control: {U} or {B} from Etrata, Ramses, Satoru, Basim or Achilles, {U} from Tetsuko or Sakashima, {B} from Virtus, Mari, Reno and Rude, Roshan or Vito."
   },
   {
    "q": "Does my commander count from the command zone?",
    "a": "No. Only while she's on the battlefield."
   },
   {
    "q": "Does a colorless legendary creature help?",
    "a": "No. It adds only colors among those permanents, so a colorless legend gives nothing."
   }
  ],
  "tips": [
   "It's a legendary artifact, so casting it is historic for <i-c>Basim Ibn Ishaq</i-c>."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Basim Ibn Ishaq"
  ]
 },
 "Chrome Mox": {
  "rating": 3,
  "when": "Turn 1",
  "tags": [
   "fast mana",
   "artifact",
   "imprint",
   "free"
  ],
  "rulings": [
   {
    "q": "Do I have to imprint?",
    "a": "No. Imprint is optional, but without an exiled card it can't make mana."
   },
   {
    "q": "What if I imprint a colorless card?",
    "a": "It makes no mana: it taps for one of the exiled card's colors, and a colorless card has none."
   }
  ],
  "tips": [],
  "combos": [
   "Basim Ibn Ishaq"
  ]
 },
 "Lotus Petal": {
  "rating": 3,
  "when": "Turn 1-2",
  "tags": [
   "fast mana",
   "artifact",
   "free",
   "one use"
  ],
  "rulings": [
   {
    "q": "Is sacrificing it part of the cost?",
    "a": "Yes. You tap and sacrifice it as you activate the mana ability."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Dark Ritual": {
  "rating": 3,
  "when": "Turn 1, or a big turn",
  "tags": [
   "fast mana",
   "instant",
   "ritual",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Does the mana last?",
    "a": "No. Mana empties at the end of each step and phase, so spend it in the same phase."
   },
   {
    "q": "Can it pay for Etrata?",
    "a": "Only the {1} and {B}. Etrata also needs {U}."
   }
  ],
  "tips": [
   "Swamp, Dark Ritual, <i-c>Grim Tutor</i-c> finds <i-c>Ramses, Assassin Lord</i-c> on turn 1."
  ],
  "combos": [
   "Grim Tutor"
  ]
 },
 "Arcane Signet": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "mana rock",
   "artifact",
   "fixing"
  ],
  "rulings": [
   {
    "q": "What colors does it make?",
    "a": "Blue or black, the colors of your commander's color identity. It can't make colorless."
   },
   {
    "q": "Does Etrata need to be on the battlefield?",
    "a": "No. Color identity doesn't depend on where your commander is."
   }
  ],
  "tips": [],
  "combos": [
   "Ramses, Assassin Lord"
  ]
 },
 "Talisman of Dominance": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "mana rock",
   "artifact",
   "fixing"
  ],
  "rulings": [
   {
    "q": "Does the damage trigger my Exquisite Blood?",
    "a": "No. It damages you, not an opponent."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Force of Will": {
  "rating": 4,
  "when": "The wrath or the removal on Ramses",
  "tags": [
   "counterspell",
   "instant",
   "free",
   "game changer"
  ],
  "rulings": [
   {
    "q": "Can I cast it for free on my own turn?",
    "a": "Yes. The alternative cost (1 life and exiling a blue card from your hand) works on any turn."
   },
   {
    "q": "Can I exile Force of Will itself to pay?",
    "a": "No. You need another blue card in hand."
   }
  ],
  "tips": [
   "Exile a blue card you can't use soon: a second copy of a type-changer, a late <i-c>Preordain</i-c>."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Brainstorm"
  ]
 },
 "Fierce Guardianship": {
  "rating": 4,
  "when": "Instant speed, with Etrata out",
  "tags": [
   "counterspell",
   "instant",
   "free",
   "game changer"
  ],
  "rulings": [
   {
    "q": "Does Etrata need to be on the battlefield?",
    "a": "Yes. 'If you control a commander' means a commander on the battlefield under your control."
   },
   {
    "q": "Can it counter creature spells or abilities?",
    "a": "No. Noncreature spells only."
   }
  ],
  "tips": [
   "After Teferi's Veil phases Etrata out on opponents' turns, it costs full price: keep {2}{U} up or lean on <i-c>Force of Will</i-c>."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Deadly Rollick"
  ]
 },
 "Force of Negation": {
  "rating": 3,
  "when": "Opponent's turn",
  "tags": [
   "counterspell",
   "instant",
   "free",
   "exile"
  ],
  "rulings": [
   {
    "q": "Can I cast it free on my own turn?",
    "a": "No. The alternative cost works only on another player's turn."
   },
   {
    "q": "What happens to the countered spell?",
    "a": "It's exiled instead of going to its owner's graveyard, so it can't be recast from there."
   }
  ],
  "tips": [],
  "combos": [
   "Ramses, Assassin Lord",
   "Force of Will"
  ]
 },
 "Swan Song": {
  "rating": 3,
  "when": "Instant speed, one mana up",
  "tags": [
   "counterspell",
   "instant",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Who gets the Bird?",
    "a": "The controller of the countered spell."
   },
   {
    "q": "Can it counter an artifact or creature wrath?",
    "a": "Only if the wrath is an instant or sorcery. Artifact and creature spells aren't covered."
   }
  ],
  "tips": [],
  "combos": [
   "Ramses, Assassin Lord",
   "Teferi's Veil"
  ]
 },
 "Deadly Rollick": {
  "rating": 3,
  "when": "Instant speed, with Etrata out",
  "tags": [
   "removal",
   "instant",
   "free",
   "exile"
  ],
  "rulings": [
   {
    "q": "Does it get around 'when this dies' abilities?",
    "a": "Yes. Exile isn't dying."
   },
   {
    "q": "Does it need Etrata on the battlefield?",
    "a": "Yes. A commander in the command zone doesn't count."
   }
  ],
  "tips": [
   "Exile a blocker during your combat after attackers are declared to clear the way for the halver."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Fierce Guardianship"
  ]
 },
 "Snuff Out": {
  "rating": 3,
  "when": "Instant speed",
  "tags": [
   "removal",
   "instant",
   "free"
  ],
  "rulings": [
   {
    "q": "Does Watery Grave count as a Swamp?",
    "a": "Yes. Any land with the Swamp type works: <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c>, <i-c>Undercity Sewers</i-c> or a basic."
   },
   {
    "q": "Does paying 4 life trigger my Exquisite Blood?",
    "a": "No. Only opponents losing life does."
   }
  ],
  "tips": [],
  "combos": [
   "Swamp",
   "Watery Grave"
  ]
 },
 "Cyclonic Rift": {
  "rating": 3,
  "when": "End of the turn before yours",
  "tags": [
   "bounce",
   "instant",
   "overload",
   "game changer"
  ],
  "rulings": [
   {
    "q": "Does overload target?",
    "a": "No. It changes 'target' to 'each', so hexproof and ward don't stop it."
   },
   {
    "q": "Does it bounce cards I stole?",
    "a": "No. Only nonland permanents you don't control. Creatures you control, whoever owns them, stay."
   },
   {
    "q": "What happens to tokens?",
    "a": "They go to the hand and cease to exist."
   }
  ],
  "tips": [
   "Single-target mode removes the one blocker or the enchantment that stops your attack."
  ],
  "combos": [
   "Ramses, Assassin Lord"
  ]
 },
 "Rhystic Study": {
  "rating": 4,
  "when": "Turns 2-3",
  "tags": [
   "draw engine",
   "enchantment",
   "game changer",
   "tax"
  ],
  "rulings": [
   {
    "q": "When does the opponent decide to pay?",
    "a": "As the trigger resolves. If they don't pay {1}, you may draw."
   },
   {
    "q": "Is the draw optional?",
    "a": "Yes. It says 'may', so you can decline when your library is low."
   }
  ],
  "tips": [
   "Decline draws once the library is under ten cards and you aren't digging for something."
  ],
  "combos": [
   "Mystic Remora",
   "Dark Confidant"
  ]
 },
 "Mystic Remora": {
  "rating": 3,
  "when": "Turn 1",
  "tags": [
   "draw engine",
   "enchantment",
   "cumulative upkeep",
   "one mana"
  ],
  "rulings": [
   {
    "q": "Does it trigger on creature spells?",
    "a": "No. Only noncreature spells."
   },
   {
    "q": "Do I have to pay the upkeep?",
    "a": "No. If you don't, you sacrifice it. Each upkeep it gets an age counter and costs {1} for each."
   },
   {
    "q": "Is the draw optional?",
    "a": "Yes. You may draw; decline when the library is low."
   }
  ],
  "tips": [],
  "combos": [
   "Rhystic Study"
  ]
 },
 "Ancient Tomb": {
  "rating": 3,
  "when": "Turns 1-2",
  "tags": [
   "land",
   "fast mana",
   "colorless"
  ],
  "rulings": [
   {
    "q": "Does tapping it trigger my Exquisite Blood?",
    "a": "No. The damage makes you lose life, and <i-c>Exquisite Blood</i-c> only watches opponents."
   }
  ],
  "tips": [
   "Turn 1 Ancient Tomb into <i-c>Sol Ring</i-c> leaves three colorless mana: enough for <i-c>Pyre of Heroes</i-c> or <i-c>Lightning Greaves</i-c>."
  ],
  "combos": [
   "Sol Ring"
  ]
 },
 "Command Tower": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "land",
   "fixing",
   "untapped"
  ],
  "rulings": [
   {
    "q": "What does it make?",
    "a": "One mana of any color in your commander's color identity: blue or black. It works with Etrata in the command zone."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Watery Grave": {
  "rating": 2,
  "when": "Turns 1-3",
  "tags": [
   "land",
   "shock land",
   "dual",
   "fetchable"
  ],
  "rulings": [
   {
    "q": "Does paying the 2 life trigger my Exquisite Blood?",
    "a": "No. Only opponents losing life triggers it."
   },
   {
    "q": "Does it count as a Swamp for Snuff Out?",
    "a": "Yes. It has the Swamp land type."
   }
  ],
  "tips": [],
  "combos": [
   "Polluted Delta",
   "Snuff Out"
  ]
 },
 "Polluted Delta": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "land",
   "fetch land",
   "fixing",
   "shuffle"
  ],
  "rulings": [
   {
    "q": "Can it fetch Drowned Catacomb or Choked Estuary?",
    "a": "No. They have no land types."
   },
   {
    "q": "Can it fetch a dual with both types?",
    "a": "Yes. <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c> and <i-c>Undercity Sewers</i-c> are Islands and Swamps."
   }
  ],
  "tips": [],
  "combos": [
   "Brainstorm",
   "Watery Grave"
  ]
 },
 "Marsh Flats": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "land",
   "fetch land",
   "fixing",
   "shuffle"
  ],
  "rulings": [
   {
    "q": "Can it find a basic Island?",
    "a": "No. Only Plains or Swamp cards. The duals with the Swamp type, like <i-c>Watery Grave</i-c>, are fine."
   }
  ],
  "tips": [],
  "combos": [
   "Watery Grave",
   "Brainstorm"
  ]
 },
 "Scalding Tarn": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "land",
   "fetch land",
   "fixing",
   "shuffle"
  ],
  "rulings": [
   {
    "q": "Can it find a basic Swamp?",
    "a": "No. Only Island or Mountain cards. The duals with the Island type are fine."
   }
  ],
  "tips": [],
  "combos": [
   "Watery Grave",
   "Brainstorm"
  ]
 },
 "Underground River": {
  "rating": 2,
  "when": "Any turn",
  "tags": [
   "land",
   "pain land",
   "dual",
   "untapped"
  ],
  "rulings": [
   {
    "q": "Does it count as an Island or a Swamp?",
    "a": "No. It has no land types."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Drowned Catacomb": {
  "rating": 2,
  "when": "Turns 2+",
  "tags": [
   "land",
   "check land",
   "dual"
  ],
  "rulings": [
   {
    "q": "Do Watery Grave and Sunken Hollow count?",
    "a": "Yes. They have the Island and Swamp land types."
   }
  ],
  "tips": [],
  "combos": [
   "Watery Grave"
  ]
 },
 "Sunken Hollow": {
  "rating": 2,
  "when": "Turns 3+",
  "tags": [
   "land",
   "dual",
   "fetchable"
  ],
  "rulings": [
   {
    "q": "Does it count as a Swamp for Tainted Isle and Snuff Out?",
    "a": "Yes. It has the Swamp land type, and the Island type for <i-c>Drowned Catacomb</i-c> and <i-c>Choked Estuary</i-c>."
   }
  ],
  "tips": [],
  "combos": [
   "Polluted Delta"
  ]
 },
 "Choked Estuary": {
  "rating": 2,
  "when": "Turns 1-4",
  "tags": [
   "land",
   "reveal land",
   "dual"
  ],
  "rulings": [
   {
    "q": "Which cards can I reveal?",
    "a": "Any Island or Swamp card: a basic, <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c> or <i-c>Undercity Sewers</i-c>. You keep the card."
   },
   {
    "q": "Can a fetch land find it?",
    "a": "No. It has no land types."
   }
  ],
  "tips": [],
  "combos": [
   "Island",
   "Swamp"
  ]
 },
 "Darkwater Catacombs": {
  "rating": 2,
  "when": "Turns 2+",
  "tags": [
   "land",
   "filter land",
   "fixing"
  ],
  "rulings": [
   {
    "q": "Can it make mana by itself?",
    "a": "No. It needs {1} from another source, then it makes {U}{B}."
   },
   {
    "q": "Can Sol Ring pay its {1}?",
    "a": "Yes. Any mana works."
   }
  ],
  "tips": [],
  "combos": [
   "Sol Ring"
  ]
 },
 "Darkslick Shores": {
  "rating": 2,
  "when": "Turns 1-3",
  "tags": [
   "land",
   "fast land",
   "dual"
  ],
  "rulings": [
   {
    "q": "When does it enter tapped?",
    "a": "When you control three or more other lands."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Tainted Isle": {
  "rating": 2,
  "when": "Turns 2+",
  "tags": [
   "land",
   "dual",
   "conditional"
  ],
  "rulings": [
   {
    "q": "Does Watery Grave count as a Swamp?",
    "a": "Yes. Any land with the Swamp type works: <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c>, <i-c>Undercity Sewers</i-c>."
   },
   {
    "q": "Without a Swamp, is it useless?",
    "a": "No. It still taps for {C}."
   }
  ],
  "tips": [],
  "combos": [
   "Swamp"
  ]
 },
 "River of Tears": {
  "rating": 2,
  "when": "Any turn",
  "tags": [
   "land",
   "dual",
   "conditional"
  ],
  "rulings": [
   {
    "q": "When does it make {B}?",
    "a": "On a turn in which you played a land. On opponents' turns you can't, so it makes {U}."
   },
   {
    "q": "Does a land put onto the battlefield by a fetch land count?",
    "a": "No. Fetching isn't playing a land, but playing the fetch land itself counts."
   }
  ],
  "tips": [],
  "combos": [
   "Swan Song"
  ]
 },
 "Path of Ancestry": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "land",
   "tapped",
   "scry",
   "typal"
  ],
  "rulings": [
   {
    "q": "Which spells share a type with Etrata?",
    "a": "Vampires and Assassins, plus changelings. With <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or Roshan out, all your creature spells are Assassins."
   }
  ],
  "tips": [],
  "combos": [
   "Leyline of Transformation"
  ]
 },
 "Rogue's Passage": {
  "rating": 3,
  "when": "Kill turn",
  "tags": [
   "land",
   "utility",
   "unblockable",
   "colorless"
  ],
  "rulings": [
   {
    "q": "Does it work after blockers are declared?",
    "a": "No. A creature that's already blocked stays blocked. Activate it before blockers."
   },
   {
    "q": "Does my cloaked 2/2's ward tax my own Passage?",
    "a": "No. Ward triggers only for spells and abilities an opponent controls."
   }
  ],
  "tips": [],
  "combos": [
   "Quietus Spike",
   "Virtus the Veiled"
  ]
 },
 "Brotherhood Headquarters": {
  "rating": 2,
  "when": "Any turn",
  "tags": [
   "land",
   "typal",
   "assassin",
   "fixing"
  ],
  "rulings": [
   {
    "q": "Can its colored mana pay Etrata's {2}{U}{B} flip?",
    "a": "Only on a face-down creature that's an Assassin, through <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Roshan, Hidden Magister</i-c>. The ability is the face-down creature's, not Etrata's."
   },
   {
    "q": "Does it pay for non-Assassin creatures with a type-changer out?",
    "a": "Yes. Leyline, Arcane Adaptation and Roshan make your creature spells Assassins too."
   },
   {
    "q": "Can it cast my tutors or counters?",
    "a": "Not with the colored mana. Only {C} for those."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Leyline of Transformation"
  ]
 },
 "Cavern of Souls": {
  "rating": 3,
  "when": "Any turn; key with Ramses in hand",
  "tags": [
   "land",
   "typal",
   "uncounterable",
   "assassin"
  ],
  "rulings": [
   {
    "q": "What makes a spell uncounterable?",
    "a": "Spending Cavern's colored mana on a creature spell of the chosen type. That spell can't be countered."
   },
   {
    "q": "Does it work for non-Assassins with a type-changer out?",
    "a": "Yes. With Leyline, Arcane Adaptation or Roshan out, your creature spells are Assassins."
   }
  ],
  "tips": [
   "Hold it for the turn you cast <i-c>Ramses, Assassin Lord</i-c>."
  ],
  "combos": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Secluded Courtyard": {
  "rating": 2,
  "when": "Any turn",
  "tags": [
   "land",
   "typal",
   "assassin",
   "fixing"
  ],
  "rulings": [
   {
    "q": "Can its mana pay Etrata's flip?",
    "a": "Only if the face-down creature is an Assassin through <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or Roshan. A face-down creature has no types otherwise."
   },
   {
    "q": "Can it pay Vito's lifelink ability?",
    "a": "Only while Vito is an Assassin, through a type-changer."
   }
  ],
  "tips": [],
  "combos": [
   "Leyline of Transformation",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Mutavault": {
  "rating": 3,
  "when": "Turns 3+, as an extra attacker",
  "tags": [
   "land",
   "manland",
   "assassin",
   "colorless"
  ],
  "rulings": [
   {
    "q": "Does it trigger Etrata?",
    "a": "Yes. While animated it has all creature types, so it's an Assassin."
   },
   {
    "q": "Can it attack the turn I play it?",
    "a": "No. It hasn't been under your control since the start of the turn."
   },
   {
    "q": "Does it count for Ramses' win?",
    "a": "Yes. Attacking with an animated Mutavault counts as being attacked by an Assassin you controlled."
   }
  ],
  "tips": [
   "Under Coat of Arms it shares a type with every creature on the battlefield."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 "Morphic Pool": {
  "rating": 2,
  "when": "Any turn",
  "tags": [
   "land",
   "dual",
   "untapped"
  ],
  "rulings": [
   {
    "q": "Does it enter tapped once an opponent is out?",
    "a": "Only if you have fewer than two opponents left when it enters."
   }
  ],
  "tips": [],
  "combos": [
   "Etrata, Deadly Fugitive"
  ]
 },
 "Undercity Sewers": {
  "rating": 2,
  "when": "Turn 1, or a quiet turn",
  "tags": [
   "land",
   "dual",
   "surveil",
   "tapped"
  ],
  "rulings": [
   {
    "q": "Does it surveil when fetched?",
    "a": "Yes. The enters trigger happens however it enters."
   }
  ],
  "tips": [],
  "combos": [
   "Polluted Delta"
  ]
 },
 "Island": {
  "rating": 1,
  "when": "Any turn",
  "tags": [
   "land",
   "basic",
   "fetchable"
  ],
  "rulings": [
   {
    "q": "Which cards care about Islands?",
    "a": "<i-c>Drowned Catacomb</i-c> and <i-c>Choked Estuary</i-c>. Basics also help <i-c>Sunken Hollow</i-c> enter untapped."
   }
  ],
  "tips": [],
  "combos": [
   "Sunken Hollow"
  ]
 },
 "Kindred Dominance": {
  "rating": 4,
  "when": "Seven mana, with a type-changer out",
  "tags": [
   "wrath",
   "sorcery",
   "one-sided",
   "seven mana"
  ],
  "rulings": [
   {
    "q": "Can I name two types?",
    "a": "No. You choose one creature type. A creature with several types survives if one of them is the chosen type."
   },
   {
    "q": "Can opponents respond after I name Assassin?",
    "a": "No. You choose as it resolves, and nobody can act until it's done."
   },
   {
    "q": "Can I name 'artifact' or 'face-down'?",
    "a": "No. You must name an existing creature type."
   },
   {
    "q": "Do my face-down creatures survive?",
    "a": "Only if something makes them Assassins. Face down they have no types; <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Roshan, Hidden Magister</i-c> adds Assassin."
   }
  ],
  "tips": [
   "Sacrifice the creatures that will die to <i-c>Ashnod's Altar</i-c> in response: four extra mana for the turn."
  ],
  "combos": [
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Roshan, Hidden Magister",
   "Ashnod's Altar"
  ]
 },
 "Swamp": {
  "rating": 1,
  "when": "Any turn",
  "tags": [
   "land",
   "basic",
   "fetchable"
  ],
  "rulings": [
   {
    "q": "Which cards care about Swamps?",
    "a": "<i-c>Snuff Out</i-c>, <i-c>Tainted Isle</i-c>, <i-c>Drowned Catacomb</i-c> and <i-c>Choked Estuary</i-c>. Basics also help <i-c>Sunken Hollow</i-c> enter untapped."
   }
  ],
  "tips": [],
  "combos": [
   "Snuff Out"
  ]
 }
};
window.CETRATA_GLOSSARY = [
 { term: "Cloak", html: "To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. If it's a creature card, you can turn it face up any time for its mana cost. <i-c>Etrata, Deadly Fugitive</i-c> cloaks the top card of an opponent's library each time one of your Assassins deals combat damage to them, so you control a card they own.", cards: ["Etrata, Deadly Fugitive"] },
 { term: "Face-down creature", html: "A 2/2 with no name, no creature types, no abilities, no mana cost and no color; its mana value is 0. A cloak also has ward {2}. You can look at your own face-down cards; opponents can't. If one leaves the battlefield, it's revealed. It isn't an Assassin unless a type-changer like <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Roshan, Hidden Magister</i-c> makes it one.", cards: ["Etrata, Deadly Fugitive", "Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"] },
 { term: "Turning face up", html: "Flipping a face-down permanent to show the card. A cloaked creature card turns up for its mana cost as a special action that can't be responded to. Etrata's granted {2}{U}{B} ability turns up any face-down creature; an instant or sorcery can't be turned up, so it's exiled and you may cast it free. Turning face up isn't entering, so enters triggers don't happen. <i-c>Roshan, Hidden Magister</i-c> draws a card each time.", cards: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister"] },
 { term: "Ward", html: "Whenever a permanent with ward becomes the target of a spell or ability an opponent controls, counter it unless that player pays the ward cost. Cloaks have ward {2}, <i-c>Roaming Throne</i-c> too, and <i-c>Vein Ripper</i-c> has ward: sacrifice a creature. Wraths don't target, so ward doesn't stop them.", cards: ["Roaming Throne", "Vein Ripper"] },
 { term: "Assassin", html: "A creature type. Etrata cloaks a card whenever an Assassin you control hits an opponent, and <i-c>Ramses, Assassin Lord</i-c> wins the game when a player an Assassin of yours attacked this turn loses. Changelings and an animated <i-c>Mutavault</i-c> are Assassins too, and type-changers make everything you control one.", cards: ["Etrata, Deadly Fugitive", "Ramses, Assassin Lord", "Changeling Outcast", "Mutavault"] },
 { term: "Changeling", html: "The card is every creature type, in every zone. <i-c>Changeling Outcast</i-c> and <i-c>Mothdust Changeling</i-c> are Assassins, so their hits trigger Etrata, and they survive <i-c>Kindred Dominance</i-c> naming Assassin.", cards: ["Changeling Outcast", "Mothdust Changeling", "Kindred Dominance"] },
 { term: "Deathtouch", html: "Any damage this creature deals to a creature is enough to destroy it. Etrata, Ramses, Virtus, <i-c>Unstoppable Slasher</i-c>, <i-c>Hired Poisoner</i-c> and <i-c>Bloodthirsty Conqueror</i-c> have it; <i-c>Mari, the Killing Quill</i-c> gives it to your Assassins and <i-c>Quietus Spike</i-c> to the creature it equips.", cards: ["Hired Poisoner", "Mari, the Killing Quill", "Quietus Spike", "Unstoppable Slasher"] },
 { term: "Menace", html: "The creature can't be blocked except by two or more creatures. <i-c>Satoru, the Infiltrator</i-c>, <i-c>Reno and Rude</i-c> and <i-c>Achilles Davenport</i-c> have it, and <i-c>Roshan, Hidden Magister</i-c> gives it to your face-down creatures.", cards: ["Satoru, the Infiltrator", "Reno and Rude", "Achilles Davenport", "Roshan, Hidden Magister"] },
 { term: "Freerunning", html: "An alternative cost: you may cast the spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or your commander. <i-c>Achilles Davenport</i-c> costs {U}{B} this way, in your second main phase after a hit.", cards: ["Achilles Davenport", "Brotherhood Headquarters"] },
 { term: "Phasing", html: "A phased-out permanent is treated as though it doesn't exist until it phases back in; anything attached phases out with it. It can't be destroyed, targeted or used, and it can't block. <i-c>Teferi's Veil</i-c> phases your attackers out at end of combat, and they phase in before you untap on your next turn, so the wraths on the other players' turns miss them.", cards: ["Teferi's Veil"] },
 { term: "Indestructible", html: "The permanent can't be destroyed by damage or by 'destroy' effects. It can still be sacrificed, exiled or bounced, and it dies if its toughness is 0 or less. <i-c>Eldrazi Monument</i-c> makes your creatures indestructible, which is what saves them from <i-c>Kindred Dominance</i-c> and from destroy wraths.", cards: ["Eldrazi Monument", "Kindred Dominance"] },
 { term: "Half their life, rounded up", html: "The halving triggers of <i-c>Virtus the Veiled</i-c>, <i-c>Unstoppable Slasher</i-c> and <i-c>Quietus Spike</i-c> are worked out when they resolve, after combat damage: a player at 39 loses 20. With <i-c>Bloodletter of Aclazotz</i-c> out on your turn the loss is doubled, which is all of their life.", cards: ["Virtus the Veiled", "Unstoppable Slasher", "Quietus Spike", "Bloodletter of Aclazotz"] },
 { term: "Loses the game", html: "A player loses at 0 or less life, when they must draw from an empty library, at 10 poison counters, or by a card's effect. <i-c>Ramses, Assassin Lord</i-c> triggers on any of these, as long as an Assassin you controlled attacked that player this turn: then you win the game.", cards: ["Ramses, Assassin Lord"] },
 { term: "Legend rule", html: "If you control two or more legendary permanents with the same name, you choose one and put the rest into their owners' graveyards. <i-c>Spark Double</i-c>'s copy isn't legendary, and <i-c>Sakashima the Impostor</i-c>'s copy keeps the name Sakashima, so both can copy Etrata or Ramses and stay next to the original.", cards: ["Spark Double", "Sakashima the Impostor", "Ramses, Assassin Lord", "Etrata, Deadly Fugitive"] },
 { term: "Equip", html: "Pay the equip cost to attach an Equipment to a creature you control, as a sorcery. <i-c>Lightning Greaves</i-c> equips for {0}; <i-c>Quietus Spike</i-c> for {3}. Greaves gives shroud, so move it off a creature before you equip the Spike to it.", cards: ["Lightning Greaves", "Quietus Spike"] },
 { term: "Imprint", html: "<i-c>Chrome Mox</i-c> exiles a nonartifact, nonland card from your hand as it enters, and taps for one mana of that card's colors. Pick a spare counterspell or a card you can't use soon.", cards: ["Chrome Mox"] },
 { term: "Cumulative upkeep", html: "At the beginning of your upkeep, put an age counter on the permanent, then pay the cost once per age counter or sacrifice it. <i-c>Mystic Remora</i-c> costs {1}, then {2}, then {3}.", cards: ["Mystic Remora"] },
 { term: "Overload", html: "Cast the spell for its overload cost to change 'target' to 'each'. <i-c>Cyclonic Rift</i-c> overloaded bounces every nonland permanent you don't control. Your stolen cloaks stay, because you control them.", cards: ["Cyclonic Rift"] },
 { term: "Alternative cost", html: "A cost you may pay instead of the mana cost. <i-c>Force of Will</i-c>: 1 life and a blue card from your hand. <i-c>Force of Negation</i-c>: a blue card, only on another player's turn. <i-c>Fierce Guardianship</i-c> and <i-c>Deadly Rollick</i-c>: free while you control your commander. <i-c>Snuff Out</i-c>: 4 life if you control a Swamp. Freerunning is one too.", cards: ["Force of Will", "Force of Negation", "Fierce Guardianship", "Deadly Rollick", "Snuff Out"] },
 { term: "Commander tax", html: "Each time you cast your commander from the command zone, it costs {2} more for each previous time. Etrata costs 3, then 5, then 7. In bot games she's cast 1.9 times a game against the precons, so protect her with <i-c>Lightning Greaves</i-c> and your counters.", cards: ["Etrata, Deadly Fugitive", "Lightning Greaves"] },
 { term: "Game Changers", html: "A list of cards that strongly change a Commander game, used by the bracket system. Brackets 1 to 3 limit them; Bracket 4 has no limit. The heist closer has nine: <i-c>Imperial Seal</i-c>, <i-c>Demonic Tutor</i-c>, <i-c>Vampiric Tutor</i-c>, <i-c>Rhystic Study</i-c>, <i-c>Fierce Guardianship</i-c>, <i-c>Force of Will</i-c>, <i-c>Cyclonic Rift</i-c>, <i-c>Chrome Mox</i-c> and <i-c>Ancient Tomb</i-c>.", cards: ["Imperial Seal", "Demonic Tutor", "Vampiric Tutor", "Rhystic Study", "Fierce Guardianship", "Force of Will", "Cyclonic Rift", "Chrome Mox", "Ancient Tomb"] },
 { term: "Bracket 4", html: "The 'Optimized' Commander bracket: any number of Game Changers, two-card combos, extra turns and tutors are allowed, and decks are expected to be lethal, consistent and fast. It sits below cEDH (Bracket 5). The heist closer is a Bracket 4 deck that wins around round 8 to 9 in bot games.", cards: [] },
 { term: "Tutor", html: "A card that searches your library for another card. The heist has seven, plus <i-c>Reanimate</i-c>: the first one always finds <i-c>Ramses, Assassin Lord</i-c>.", cards: ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Demonic Consultation", "Pyre of Heroes"] },
 { term: "Fetch land", html: "A land you sacrifice, paying 1 life, to search for a land with a certain type. <i-c>Polluted Delta</i-c>, <i-c>Marsh Flats</i-c> and <i-c>Scalding Tarn</i-c> find a basic or <i-c>Watery Grave</i-c>, <i-c>Sunken Hollow</i-c> or <i-c>Undercity Sewers</i-c>. When an opponent cracks one with the drain loop out, the life they pay starts it.", cards: ["Polluted Delta", "Marsh Flats", "Scalding Tarn", "Watery Grave"] },
 { term: "Infinite combo", html: "Two or more cards that repeat a loop as many times as you like. Here: <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c>. Any life an opponent loses drains the table. Announce the result and show the loop; you don't act out every step.", cards: ["Exquisite Blood", "Bloodthirsty Conqueror", "Sanguine Bond", "Vito, Thorn of the Dusk Rose"] },
 { term: "Type-changer", html: "A card that adds a creature type to your creatures. <i-c>Leyline of Transformation</i-c> and <i-c>Arcane Adaptation</i-c> (name Assassin) and <i-c>Roshan, Hidden Magister</i-c> make your face-down 2/2s Assassins, so each one that connects cloaks another card. It also lets <i-c>Pyre of Heroes</i-c> chain between any creatures.", cards: ["Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister", "Pyre of Heroes"] }
];

window.CETRATA_CUTS = [
 { name: "Kindred Discovery", why: "Cut for a basic land: in the cut sweep it was the weakest card on both fields (+2.2 / +0.2 when replaced by a basic, 2,016 paired bot games each). It drew so much the deck decked itself." },
 { name: "Swiftfoot Boots", why: "Cut for a basic land: +1.6 / +0.8 when replaced by a basic in the cut sweep. Lightning Greaves does the job, and holding Ramses until Boots or Greaves can go on him cost 3.8 / 4.8. A human may want it back with 35 to 36 lands." },
 { name: "Mana Drain", why: "Cut for a basic land: +1.4 / +0.8 when replaced by a basic. The bot plays counters poorly, so this says as much about its counter play as about the card; the human-adjusted list puts it back." },
 { name: "Interceptor, Shadow's Hound", why: "Cut for a basic land: +1.1 / +0.7 when replaced by a basic. Tutoring it first instead of Ramses cost 7.9 / 3.6." },
 { name: "Obelisk of Urd", why: "Cut for a basic land: +1.3 / +0.5 when replaced by a basic. Ramses and Achilles already pump the Assassins for less mana." },
 { name: "Ghostly Flicker", why: "Cut for a basic land: +1.4 / +0.3 when replaced by a basic. The six cuts together, as six basics, were worth +4.4 / +2.6 confirmed over 5,040 paired games." },
 { name: "Hullcarver", why: "Cut for the drain loop. It stays in the heist snowball list. The loop's four cards and Kindred Dominance replaced Hullcarver, Desmond Miles, Skullclamp, Maskwood Nexus and a Swamp, and the closer list wins 7.5 / 4.0 points more than the snowball (5,040 paired games)." },
 { name: "Desmond Miles", why: "Cut for the drain loop with Hullcarver, Skullclamp and Maskwood Nexus. It stays in the heist snowball list." },
 { name: "Skullclamp", why: "Cut for the drain loop. In the cut sweep it had measured +0.7 / +0.4 when replaced by a basic land." },
 { name: "Maskwood Nexus", why: "Cut for the drain loop. Leyline of Transformation, Arcane Adaptation and Roshan already make the face-down creatures Assassins." },
 { name: "Hatred", why: "Holding five mana for a Hatred kill cost 0.8 / 0.5 in bot games, and Hatred was cast in only 3% of games either way. The one-shot reach package (Hatred, Blood Tribute, Exsanguinate, Rush of Dread) measured 9.5 points below basic lands." },
 { name: "Mana Vault", why: "Replacing it with a basic land measured +0.8 / +0.2: the bots tap it once and never pay to untap it. Mox Amber took its slot." },
 { name: "Animate Dead", why: "Ramses redundancy, tested in place of a basic land with Necromancy: −0.4 / −3.4. It's live only after Ramses has died, which is 9 to 12% of games." },
 { name: "Necromancy", why: "Tested with Animate Dead for Ramses redundancy: −0.4 / −3.4 against the basic lands they replaced. The games without Ramses stayed at 16 to 18%." },
 { name: "Helm of the Host", why: "Tested with Irenicus's Vile Duplication to copy Ramses: −2.2 / −3.6. It needs nine mana over two turns; cast in 12% of games, on average in round 7.5." },
 { name: "Irenicus's Vile Duplication", why: "Tested with Helm of the Host as a Ramses copy: −2.2 / −3.6 against basic lands. All four redundancy cards together: −1.6 / −3.9, and −0.7 / −2.5 in the closer list." },
 { name: "Blade of Selves", why: "Myriad: one Assassin attacks all three players for three cloaks. In place of a basic land it measured 0.0 / −0.8." },
 { name: "Strionic Resonator", why: "Copies Etrata's cloak trigger or a halver's trigger: 0.0 / −0.8 in place of a basic land. A human who holds it for the Quietus Spike hit may do better; the engine can't measure that." },
 { name: "Mirror Box", why: "Switches the legend rule off so Etrata and Ramses copies stack: 0.0 / −0.9 in place of a basic land, −0.9 / −2.0 paired with Rite of Replication." },
 { name: "Sakashima of a Thousand Faces", why: "Copies that stack, tested with Rite of Replication: −1.1 / −1.6 in place of two basic lands. Sakashima the Impostor already copies Etrata or Ramses." },
 { name: "Rite of Replication", why: "Kicked, five copies. With Sakashima of a Thousand Faces −1.1 / −1.6, with Mirror Box −0.9 / −2.0, and all five snowball cards together −3.4 / −3.3." },
 { name: "Etrata, the Silencer", why: "Tested on the closer list in place of a basic land: −0.1 / −1.5. Pilots call her hit-counter line too slow." },
 { name: "Training Grounds", why: "In the v3 drain list. On the heist closer it measured −0.5 / −0.5 in place of a basic land, and −2.2 / −1.2 with eager flips: in bot hands the mana goes to flips instead of spells." },
 { name: "Whispersilk Cloak", why: "Tested with Darksteel Plate and Patriarch's Bidding to keep Ramses alive: −2.3 / +0.6 for the closers they replaced." },
 { name: "Cover of Darkness", why: "The pilots' favorite evasion for the 2/2s: +0.1 / −0.9 in place of a basic land. Teferi's Veil and Eldrazi Monument do more." }
];

window.CETRATA_FAQ = [
 { q: "What changed from the v3 drain list, and why?", a: "The deck went from a combo deck to a theft-aggro deck. v3 won with two-card combos (the vampire court, <i-c>Mindcrank</i-c> with <i-c>Duskmantle Guildmage</i-c>, <i-c>Wormfang Manta</i-c> turns). The heist closer wins by attacking with cheap evasive Assassins, stealing a card with every hit, and killing one player with <i-c>Ramses, Assassin Lord</i-c> out, with the drain loop as a second kill. In bot games v3 wins more (68.0% / 41.7% against 47.9% / 27.5%), so this is a choice of play style: the heist is the list where Etrata's steals and attacks are the game." },
 { q: "How does it win?", a: "Two ways. <i-c>Ramses, Assassin Lord</i-c>: when a player loses the game after an Assassin of yours attacked them this turn, you win, so one dead player is the whole game. <i-c>Virtus the Veiled</i-c>, <i-c>Unstoppable Slasher</i-c> and <i-c>Quietus Spike</i-c> halve that player's life on a hit, and <i-c>Bloodletter of Aclazotz</i-c> doubles it into all of it. Or the drain loop: <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c> kills the table. In bot games the last kill is Ramses' trigger in about half the wins and the drain in about a third." },
 { q: "What do I tell the table?", a: "Bracket 4, nine Game Changers, lots of tutors. It steals the top card of your library whenever an Assassin hits you. Ramses wins the game when one player dies, and there's a two-card infinite drain loop. In bot games it wins around round 8 to 9." },
 { q: "How fast is it?", a: "In bot games the average winning round is 9.0 against three precons and 8.0 against three Bracket 4 bots. Against the precons 31% of its wins come by round 7 and 49% by round 8; against Bracket 4, 48% and 67%. Humans kill Ramses faster than bots, so treat that as an optimistic pace." },
 { q: "How much does it cost?", a: "$1,323.02 for the 100 cards, using each card's cheapest nonfoil paper printing (Scryfall's TCGplayer prices of 2026-10-05). The biggest are <i-c>Imperial Seal</i-c> ($170.58), <i-c>Mox Amber</i-c> ($87.79), <i-c>Demonic Tutor</i-c> ($63.10), <i-c>Rhystic Study</i-c> ($61.95) and <i-c>Fierce Guardianship</i-c> ($59.66)." },
 { q: "Which kill should I go for?", a: "Whichever is closer. With Ramses out, pick the one player your board kills soonest and send everything that gets through at them. With one half of the loop out, the next tutor finds the other half. Without either, the next tutor finds Ramses." },
 { q: "What are the exact steps for Ramses' win?", a: "Have <i-c>Ramses, Assassin Lord</i-c> on the battlefield. Attack the player with at least one Assassin (attacking their planeswalker doesn't count). Then make them lose the game any way this turn: combat damage, a halver's trigger, <i-c>Bloodletter of Aclazotz</i-c>, the drain loop, <i-c>Vein Ripper</i-c>. The trigger wins the game. The Assassin doesn't have to connect or survive." },
 { q: "What are the exact steps for the drain loop?", a: "Have one drain half (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>) and one gain half (<i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c>) on the battlefield. An opponent loses any life: you gain that much, then a target opponent loses that much, which triggers the drain again. Pick a living target each time until every opponent is dead. Any combat hit, a fetch land, or <i-c>Vein Ripper</i-c> starts it." },
 { q: "Why tutor for Ramses first?", a: "Because the deck's win rate tracks him. In bot games it wins 56% / 44% of the games he lands in and 38% / 18% of the rest. Tutoring generic targets first cost 10.9 / 4.5 points, the halvers and Bloodletter first 6.2 / 2.3. Once he's out, the order barely matters." },
 { q: "Can it win without Ramses?", a: "Yes, through the loop: the closer list wins 38% of the games where Ramses never lands against the precons and 18% against Bracket 4. The same deck without the loop wins 17% / 9% of those games. Everything else tried to win without him (redundancy, protection, aristocrat drains, more tutors) measured at or below a basic land." },
 { q: "Why 37 lands?", a: "The cut sweep found six spells worth less than a basic land in the bot's hands; six basics in their place were worth +4.4 / +2.6 over 5,040 paired games, and four more lands did nothing. The list was benched with 38 lands until <i-c>Kindred Dominance</i-c> took a Swamp. It's a bot number: if you trust your counter play, 35 to 36 lands with Mana Drain and Swiftfoot Boots back is the human-adjusted version." },
 { q: "Why do so few counters seem to matter?", a: "Because the bot plays them badly. In the cut sweep <i-c>Force of Will</i-c>, <i-c>Force of Negation</i-c> and <i-c>Cyclonic Rift</i-c> each measured slightly below a basic land, and Mana Drain was cut. Counters correlated with losing: the bot cast them from behind, on commanders, not on the wraths that decide games. The one counter rule that measured well is human advice: save the last counter for the wrath (+1.0 against precons)." },
 { q: "Where did the v3 list go?", a: "It's still here. Its cards that aren't in the heist list are in the card wiki under the \"v3 drain list\" filter, the decklist is in the guide's list picker, and it's still a playable deck in the game." },
 { q: "How do I build it from the Etrata deck plus proxies?", a: "44 of the heist closer's 100 cards, 15 basics included, come from ju's Etrata deck. The other 56 can be proxies. The Shop's proxy list shows which; the buy list prices all of them." },
 { q: "What hurts it most?", a: "Board wipes on the other players' turns: in bot games against the precons the deck faces 0.61 a game, and they take Ramses in most of the games he's removed. <i-c>Teferi's Veil</i-c>, <i-c>Eldrazi Monument</i-c> and a counter saved for the wrath are the answers. Then removal on Etrata or Ramses, blockers with reach or flying against the 2/2s, and 'can't gain life' effects against the loop. Long games risk decking: <i-c>Demonic Consultation</i-c> and the draw engines empty the library in 8% of the losses to precons." },
 { q: "Is it really 47.9%?", a: "In bot games, against bot opponents. A human Bracket 4 table kills Ramses faster and holds more interaction, so expect lower. What transfers is the ordering of the lists and the piloting rules." }
];
