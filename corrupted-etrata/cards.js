/* Card data for the Corrupted Etrata deck wiki: the Etrata heist closer (research/etrata-theft-aggro/local/decklist-heist-closer.txt).
   Rules text from Scryfall's Oracle text (research/etrata-theft-aggro/sources/heist-research.md), else the game engine's card text.
   Numbers quoted in why/how come from the research's bot games. */
window.CETRATA_CARDS = [
 {
  "name": "Etrata, Deadly Fugitive",
  "qty": 1,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "1/4",
  "text": "Deathtouch\nFace-down creatures you control have \"{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.\"\nWhenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library.",
  "roles": [
   "cmd"
  ],
  "why": "The engine of the heist. Every time an Assassin you control deals combat damage to an opponent, she cloaks the top card of that player's library: a face-down 2/2 with ward {2} that attacks for you next turn. She also gives your face-down creatures {2}{U}{B}: turn face up, or exile a stolen instant or sorcery and cast it free. In the bot games, removing her costs 16.7 points against the precons and 7.0 against Bracket 4, and the deck steals 7.3 / 5.1 cards a game.",
  "how": "Cast her in your first main phase on a turn when an Assassin is already getting through: her trigger works the turn she's cast, and she's kill-on-sight, so she shouldn't sit around first (rule 2, +1.0 against Bracket 4 in the bot games). Put <i-c>Lightning Greaves</i-c> on her as soon as you can.",
  "syn": [
   "Changeling Outcast",
   "Tetsuko Umezawa, Fugitive",
   "Leyline of Transformation",
   "Roshan, Hidden Magister",
   "Spark Double",
   "Roaming Throne",
   "Lightning Greaves"
  ],
  "warn": "A face-down creature has no creature types, so a stolen 2/2 only cloaks again once <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Roshan, Hidden Magister</i-c> makes it an Assassin."
 },
 {
  "name": "Changeling Outcast",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)\nChangeling Outcast can't block and can't be blocked.",
  "roles": [
   "assassin"
  ],
  "why": "The best one-drop in the deck. Changeling makes it every creature type, so it's an Assassin for Etrata and Ramses, and it can't be blocked whatever its size. Every turn it connects is a cloak once Etrata is out.",
  "how": "Play it on turn 1 and attack every turn. With Ramses out it's a 2/2 unblockable Assassin that marks your target player for his win.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Achilles Davenport",
   "Coat of Arms",
   "Kindred Dominance",
   "Pyre of Heroes"
  ],
  "warn": "It can't block, so it never helps you defend. That's fine: it's there to hit."
 },
 {
  "name": "Hired Poisoner",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Deathtouch",
  "roles": [
   "assassin"
  ],
  "why": "A one-mana deathtouch Assassin. With <i-c>Tetsuko Umezawa, Fugitive</i-c> out it can't be blocked, and without her nobody wants to block it with anything good. It's early pressure and, after Etrata, a cloak per hit.",
  "how": "Play it turn 1 and attack. Keep attacking; it's a deathtouch blocker only when you have nothing better to do with it.",
  "syn": [
   "Tetsuko Umezawa, Fugitive",
   "Etrata, Deadly Fugitive",
   "Mari, the Killing Quill",
   "Pyre of Heroes",
   "Kindred Dominance"
  ],
  "warn": "Ramses, Achilles, Coat of Arms and Eldrazi Monument make it a 2/2, and then Tetsuko no longer covers it."
 },
 {
  "name": "Slither Blade",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Creature — Snake Rogue",
  "cat": "Creature",
  "pt": "1/2",
  "text": "This creature can't be blocked.",
  "roles": [
   "assassin"
  ],
  "why": "A one-mana creature that can't be blocked, ever. It's a Snake Rogue, not an Assassin, so it cloaks for Etrata only once a type-changer is out; before that it's two damage a turn of pressure. In the cut sweep of an earlier version, replacing it with a basic land cost 0.7 / 1.3 points (bot games).",
  "how": "Play it turn 1 and attack every turn. Once <i-c>Leyline of Transformation</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Roshan, Hidden Magister</i-c> is out, it's one more Etrata trigger.",
  "syn": [
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Roshan, Hidden Magister",
   "Mari, the Killing Quill",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "Without a type-changer its attack doesn't count for Ramses' win either: the player must have been attacked by an Assassin."
 },
 {
  "name": "Mothdust Changeling",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)\nTap an untapped creature you control: This creature gains flying until end of turn.",
  "roles": [
   "assassin"
  ],
  "why": "A one-mana changeling, so an Assassin for Etrata and Ramses. Tap any other untapped creature you control and it flies until end of turn, which gets it past most ground blockers. New cloaks can't attack the turn they arrive, so they're free to pay that cost.",
  "how": "Play it turn 1. On your turn, tap a creature that isn't attacking (a summoning-sick cloak is ideal) in your main phase or at the beginning of combat, then attack in the air.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Satoru, the Infiltrator",
   "Coat of Arms",
   "Kindred Dominance"
  ],
  "warn": "Give it flying before blockers are declared. Afterwards it does nothing."
 },
 {
  "name": "Tetsuko Umezawa, Fugitive",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Legendary Creature — Human Rogue",
  "cat": "Creature",
  "pt": "1/3",
  "text": "Creatures you control with power or toughness 1 or less can't be blocked.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "Creatures you control with power or toughness 1 or less can't be blocked. That covers Etrata (1/4), Virtus, Hired Poisoner, Mothdust Changeling, Slither Blade and Brotherhood Spy before any pump. Early, she's what turns the one-drops into a cloak every turn.",
  "how": "Cast her on turn 2, or turn 1 off fast mana, before Etrata. Etrata herself then attacks unblockable for her own trigger.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Hired Poisoner",
   "Mothdust Changeling",
   "Brotherhood Spy",
   "Quietus Spike"
  ],
  "warn": "Every +1/+1 in the deck turns her off for the 1/1s: Ramses, Achilles Davenport, Coat of Arms and Eldrazi Monument. A 1/4 like Etrata stays covered by her toughness until a pump takes it to 2/5."
 },
 {
  "name": "Satoru, the Infiltrator",
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Legendary Creature — Human Ninja Rogue",
  "cat": "Creature",
  "pt": "2/3",
  "text": "Menace\nWhenever Satoru and/or one or more other nontoken creatures you control enter, if none of them were cast or no mana was spent to cast them, draw a card.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "Whenever nontoken creatures you control enter without being cast, you draw a card. Every cloak from Etrata enters that way, so each stolen card is also a card in hand. A 2/3 menace body for two keeps attacking too.",
  "how": "Cast him on turn 2 alongside or before Etrata. With <i-c>They Came from the Pipes</i-c> out each cloak draws two.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "They Came from the Pipes",
   "Reanimate",
   "Leyline of Transformation",
   "Mari, the Killing Quill"
  ],
  "warn": "Turning a cloak face up isn't entering, so flips draw nothing. He's a Ninja Rogue, not an Assassin, unless a type-changer is out."
 },
 {
  "name": "Brotherhood Spy",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/3",
  "text": "At the beginning of combat on your turn, if you control a legendary Assassin, this creature gets +1/+0 until end of turn and can't be blocked this turn.",
  "roles": [
   "assassin"
  ],
  "why": "A two-mana Assassin that turns itself unblockable. At the beginning of combat on your turn, if you control a legendary Assassin, it gets +1/+0 and can't be blocked this turn. Etrata, Ramses, Virtus, Mari, Reno and Rude, Basim, Achilles and Roshan all switch it on.",
  "how": "Play it on turn 2 next to a legendary Assassin, or the turn before Etrata. It attacks for 2 every turn after that.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Basim Ibn Ishaq",
   "Reno and Rude",
   "Ramses, Assassin Lord",
   "Sakashima the Impostor"
  ],
  "warn": "No legendary Assassin at the beginning of combat means no evasion that turn. Changelings and face-down creatures aren't legendary."
 },
 {
  "name": "Reno and Rude",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Menace\nWhenever Reno and Rude deals combat damage to a player, exile the top card of that player's library. Then you may sacrifice another creature or artifact. If you do, you may play the exiled card this turn, and mana of any type can be spent to cast it.",
  "roles": [
   "assassin"
  ],
  "why": "A two-mana legendary Assassin with menace that steals twice. When it deals combat damage to a player, it exiles the top card of their library, and if you sacrifice another creature or artifact you may play that card this turn with any mana. With Etrata out, the same hit also cloaks a card.",
  "how": "Play it on turn 2. Sacrifice a stolen 2/2 that can't attack yet, a used Treasure from <i-c>Mari, the Killing Quill</i-c> or a spare rock when the exiled card is worth it.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Brotherhood Spy",
   "Mari, the Killing Quill",
   "Vein Ripper",
   "Ashnod's Altar"
  ],
  "warn": "You follow the card's normal timing: a sorcery or creature waits for your second main phase, and a land needs your land drop."
 },
 {
  "name": "Dark Confidant",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/1",
  "text": "At the beginning of your upkeep, reveal the top card of your library and put that card into your hand. You lose life equal to its mana value.",
  "roles": [
   "draw"
  ],
  "why": "Two mana for an extra card every upkeep. The deck's spells are cheap, so the life cost is usually 0 to 2 a turn. It's one of the card-flow pieces that keeps the one-drops coming.",
  "how": "Cast it on turn 2 when you have no Assassin to play, or turn 1 off fast mana. Let it go once your life total matters more than cards.",
  "syn": [
   "Changeling Outcast",
   "Mystic Remora",
   "Rhystic Study",
   "Exquisite Blood",
   "Bloodthirsty Conqueror"
  ],
  "warn": "Revealing Vein Ripper costs 6 life and Force of Will 5. It's not an Assassin, so it doesn't cloak and dies to Kindred Dominance unless a type-changer is out."
 },
 {
  "name": "Virtus the Veiled",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Azra Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Virtus deals combat damage to a player, that player loses half their life, rounded up.",
  "roles": [
   "kill",
   "assassin"
  ],
  "why": "A three-mana deathtouch Assassin that halves a player's life when it deals combat damage to them. With Ramses out, a halving hit on the marked player sets up the kill, and with <i-c>Bloodletter of Aclazotz</i-c> on your turn the half becomes all of it. As a 1/1, <i-c>Tetsuko Umezawa, Fugitive</i-c> makes it unblockable.",
  "how": "Tutor for it after Ramses, not before (the bot games: kill kit first costs 6.2 points). Send it at the one player you're killing (rule 7).",
  "syn": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Tetsuko Umezawa, Fugitive",
   "Quietus Spike",
   "Roaming Throne",
   "Eldrazi Monument"
  ],
  "warn": "Ramses makes it a 2/2, which turns Tetsuko off. Get it through with Eldrazi Monument, Reverse the Polarity or Rogue's Passage then."
 },
 {
  "name": "Unstoppable Slasher",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Zombie Assassin",
  "cat": "Creature",
  "pt": "2/3",
  "text": "Deathtouch\nWhenever this creature deals combat damage to a player, they lose half their life, rounded up.\nWhen this creature dies, if it had no counters on it, return it to the battlefield tapped under its owner's control with two stun counters on it.",
  "roles": [
   "kill",
   "assassin"
  ],
  "why": "The second halver: a 2/3 deathtouch Assassin that makes a player lose half their life, rounded up, when it deals combat damage to them. When it dies with no counters on it, it comes back tapped with two stun counters, so one removal spell doesn't end it.",
  "how": "Tutor or cast it after Ramses and aim it at the marked player. With <i-c>Bloodletter of Aclazotz</i-c> on your turn, one hit takes their whole life.",
  "syn": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Eldrazi Monument",
   "Ashnod's Altar",
   "Vein Ripper",
   "Roaming Throne"
  ],
  "warn": "It has no evasion of its own. Spark Double's copy enters with a +1/+1 counter, so the copy won't come back."
 },
 {
  "name": "Mari, the Killing Quill",
  "qty": 1,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Whenever a creature an opponent controls dies, exile it with a hit counter on it.\nAssassins, Mercenaries, and Rogues you control have deathtouch and \"Whenever this creature deals combat damage to a player, you may remove a hit counter from a card that player owns in exile. If you do, draw a card and create two Treasure tokens.\"",
  "roles": [
   "kill"
  ],
  "why": "Your Assassins, Mercenaries and Rogues get deathtouch, so every block against you trades. Opposing creatures that die are exiled with hit counters, and each of your Assassins that connects can cash one of that player's in for a card and two Treasures. With a type-changer, the stolen 2/2s get all of it.",
  "how": "Cast her or tutor her after Ramses. Attack with everything into the player you're killing; deathtouch makes blocking a bad trade for them.",
  "syn": [
   "Ramses, Assassin Lord",
   "Kindred Dominance",
   "Roshan, Hidden Magister",
   "Leyline of Transformation",
   "Reno and Rude",
   "Slither Blade"
  ],
  "warn": "Only creatures an opponent controls that die get a hit counter. Your stolen 2/2s dying go to their owner's graveyard without one, and tokens leave no card."
 },
 {
  "name": "Ramses, Assassin Lord",
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Deathtouch\nOther Assassins you control get +1/+1.\nWhenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.",
  "roles": [
   "kill"
  ],
  "why": "The kill. Whenever a player loses the game, if an Assassin you controlled attacked them this turn, you win. So one death is the game, by any means: combat, a halver, Bloodletter or the drain loop. He also gives your other Assassins +1/+1. In the bot games he lands in 54% / 36% of games; with him the deck wins 56% / 44%, without him 38% / 18%, and cutting him cost 14 points in the cut sweep.",
  "how": "Tutor for him first (rule 3; anything else first cost 8 to 11 points). Cast him in your first main phase right before combat, with a counter up if you can, and don't wait for protection (rule 4: holding him costs 3.8 / 4.8). Then pick one player and kill them (rule 7).",
  "syn": [
   "Bloodletter of Aclazotz",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Exquisite Blood",
   "Sanguine Bond",
   "Reanimate",
   "Demonic Tutor"
  ],
  "warn": "His +1/+1 makes the 1/1 Assassins 2/2s and Tetsuko stops covering them. Have another way through (Eldrazi Monument, Reverse the Polarity) for the marked player."
 },
 {
  "name": "Achilles Davenport",
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Freerunning {U}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nMenace\nOther Assassins you control get +1/+1.",
  "roles": [
   "snowball"
  ],
  "why": "The second Assassin lord: other Assassins get +1/+1, and he has menace. After an Assassin or Etrata deals combat damage, freerunning casts him for {U}{B}. With Ramses and a type-changer out, every stolen 2/2 is a 4/4.",
  "how": "Attack with a cheap Assassin, then cast him for {U}{B} in your second main phase.",
  "syn": [
   "Ramses, Assassin Lord",
   "Leyline of Transformation",
   "Roshan, Hidden Magister",
   "Changeling Outcast",
   "Brotherhood Headquarters"
  ],
  "warn": "His pump turns Tetsuko off for the 1/1s. He doesn't pump himself, and cloaks only get the bonus once a type-changer makes them Assassins."
 },
 {
  "name": "Roshan, Hidden Magister",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Other creatures you control are Assassins in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.\nFace-down creatures you control have menace.\nWhenever a permanent you control is turned face up, you draw a card and you lose 1 life.",
  "roles": [
   "snowball"
  ],
  "why": "Three jobs on one four-drop. Your other creatures are Assassins, so every stolen 2/2 cloaks again when it connects and gets Ramses' bonus. Your face-down creatures have menace. And whenever a permanent you control turns face up, you draw a card and lose 1 life.",
  "how": "Cast him before combat on a turn you have cloaks ready to attack. He's the best removal target on your board, so keep a counter up if you can.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Kindred Dominance",
   "Mari, the Killing Quill",
   "Roaming Throne",
   "Pyre of Heroes"
  ],
  "warn": "Etrata's 'exile it, then cast it' branch for a stolen instant or sorcery never turns anything face up, so Roshan doesn't draw for it."
 },
 {
  "name": "Roaming Throne",
  "qty": 1,
  "cost": "{4}",
  "mv": 4,
  "type": "Artifact Creature — Golem",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Ward {2}\nAs this creature enters, choose a creature type.\nThis creature is the chosen type in addition to its other types.\nIf a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.",
  "roles": [
   "snowball"
  ],
  "why": "Name Assassin and every triggered ability of your other Assassins triggers twice. Etrata cloaks two cards per hit, Virtus and Unstoppable Slasher halve twice, Vein Ripper drains twice. It's also a 4/4 Assassin with ward {2} that attacks.",
  "how": "Cast it once Etrata is out and Assassins are connecting. Choose Assassin as it enters.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Vein Ripper",
   "Spark Double",
   "Mari, the Killing Quill"
  ],
  "warn": "It doubles only triggers of creatures. <i-c>Quietus Spike</i-c>, <i-c>Exquisite Blood</i-c> and <i-c>Sanguine Bond</i-c> are the Equipment's and enchantments' own triggers and happen once."
 },
 {
  "name": "Bloodletter of Aclazotz",
  "qty": 1,
  "cost": "{1}{B}{B}{B}",
  "mv": 4,
  "type": "Creature — Vampire Demon",
  "cat": "Creature",
  "pt": "2/4",
  "text": "Flying\nIf an opponent would lose life during your turn, they lose twice that much life instead. (Damage causes loss of life.)",
  "roles": [
   "kill"
  ],
  "why": "If an opponent would lose life during your turn, they lose twice that much. A halver's hit (Virtus, Unstoppable Slasher, Quietus Spike) then takes all of a player's life, and with Ramses out that death wins the game. It also doubles every step of the drain loop. Cutting it cost 2.9 / 2.3 points in the skeleton's cut sweep, the clearest keep after Ramses (bot games).",
  "how": "Tutor for it second, after Ramses. Cast it before combat on the turn a halver or the loop can reach the marked player.",
  "syn": [
   "Ramses, Assassin Lord",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Quietus Spike",
   "Exquisite Blood",
   "Sanguine Bond"
  ],
  "warn": "It works only during your turn. A loop started on an opponent's turn isn't doubled, and it never doubles your own life loss."
 },
 {
  "name": "Spark Double",
  "qty": 1,
  "cost": "{3}{U}",
  "mv": 4,
  "type": "Creature — Illusion",
  "cat": "Creature",
  "pt": "0/0",
  "text": "You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary.",
  "roles": [
   "snowball"
  ],
  "why": "A non-legendary copy of one of your creatures, with an extra +1/+1 counter. On Ramses it's a second lord and a second 'you win'; on Etrata every Assassin hit cloaks twice. The legend rule doesn't touch it.",
  "how": "Copy Ramses if he's out, otherwise Etrata: the bot copies Ramses first, and copying Etrata first measured 0.9 points worse.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Roaming Throne",
   "Sakashima the Impostor",
   "Unstoppable Slasher"
  ],
  "warn": "It copies only creatures you control. A copy of a face-down 2/2 is a blank 2/2, so don't point it at a cloak."
 },
 {
  "name": "Sakashima the Impostor",
  "qty": 1,
  "cost": "{2}{U}{U}",
  "mv": 4,
  "type": "Legendary Creature — Human Rogue",
  "cat": "Creature",
  "pt": "3/1",
  "text": "You may have Sakashima the Impostor enter as a copy of any creature on the battlefield, except its name is Sakashima the Impostor, it's legendary in addition to its other types, and it has \"{2}{U}{U}: Return Sakashima the Impostor to its owner's hand at the beginning of the next end step.\"",
  "roles": [
   "snowball"
  ],
  "why": "A copy of any creature on the battlefield whose name stays Sakashima the Impostor, so the legend rule doesn't take it next to the original. Like Spark Double, it's a second Etrata (two cloaks per hit) or a second Ramses.",
  "how": "Copy Ramses if he's out, otherwise Etrata. If neither is around, the best creature on anyone's board is fine.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Spark Double",
   "Brotherhood Spy",
   "Roaming Throne"
  ],
  "warn": "The copy isn't your commander, so it doesn't make Fierce Guardianship or Deadly Rollick free."
 },
 {
  "name": "Preordain",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Scry 2, then draw a card.",
  "roles": [
   "draw"
  ],
  "why": "One mana: scry 2, then draw. It digs a turn-one hand toward its second land, a cheap Assassin or a tutor, and it was added with Brainstorm when the low curve replaced the 6-7 drops (+0.4 / +2.1 in bot games).",
  "how": "Cast it on turn 1 or 2 when the hand is missing a land or a one-drop. Late, use it after Vampiric Tutor or Imperial Seal only if you want to keep the tutored card on top and draw it now.",
  "syn": [
   "Brainstorm",
   "Imperial Seal",
   "Vampiric Tutor",
   "Polluted Delta",
   "Changeling Outcast"
  ],
  "warn": "It's a sorcery, so it can't dig at the end of an opponent's turn like Brainstorm."
 },
 {
  "name": "Basim Ibn Ishaq",
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Whenever you cast a historic spell, draw a card. Basim Ibn Ishaq can't be blocked this turn. This ability triggers only once each turn. (Artifacts, legendaries, and Sagas are historic.)\nWhenever Basim Ibn Ishaq deals combat damage to a player, put a +1/+1 counter on it.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "A two-mana legendary Assassin. The first historic spell you cast each turn draws a card and makes Basim unblockable this turn. Each hit puts a +1/+1 counter on him, and with Etrata out it's also a cloak.",
  "how": "Play him on turn 2. On your turn, cast a historic spell before combat (a rock, Lotus Petal, an Equipment or a legend) so he attacks unblockable.",
  "syn": [
   "Mox Amber",
   "Lotus Petal",
   "Lightning Greaves",
   "Etrata, Deadly Fugitive",
   "Brotherhood Spy",
   "Roaming Throne"
  ],
  "warn": "The trigger happens only once each turn, including opponents' turns. A historic spell cast on someone else's turn uses it up for that turn but gives no evasion you can use."
 },
 {
  "name": "Brainstorm",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "text": "Draw three cards, then put two cards from your hand on top of your library in any order.",
  "roles": [
   "draw"
  ],
  "why": "One mana at instant speed: draw three, put two back. It finds a land or an Assassin early, and late it draws a card Vampiric Tutor or Imperial Seal just put on top, so Ramses arrives this turn.",
  "how": "Cast it at the end of an opponent's turn, or right after a tutor put Ramses on top. Crack a fetch land afterwards to shuffle away the two cards you put back.",
  "syn": [
   "Vampiric Tutor",
   "Imperial Seal",
   "Polluted Delta",
   "Scalding Tarn",
   "Marsh Flats",
   "Force of Will"
  ],
  "warn": "Without a shuffle, the two cards you put back are your next two draws."
 },
 {
  "name": "Demonic Consultation",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "text": "Choose a card name. Exile the top six cards of your library, then reveal cards from the top of your library until you reveal a card with the chosen name. Put that card into your hand and exile all other cards revealed this way.",
  "roles": [
   "tutor"
  ],
  "why": "A one-mana instant tutor for Ramses. Adding it measured +0.6 / +0.8 in bot games. The price is your library: it exiles six cards plus everything above the named one.",
  "how": "Name Ramses, Assassin Lord when he is still in your library and no other tutor is in hand. Cast it at the end of an opponent's turn so you can cast him before combat.",
  "syn": [
   "Ramses, Assassin Lord",
   "Rhystic Study",
   "Mystic Remora",
   "Dark Confidant",
   "Vampiric Tutor"
  ],
  "warn": "If the named card is among the six exiled first, or isn't in your library at all, you exile your whole library. In bot games 8% of the losses to precons were an empty library: Consultation plus the draw engines."
 },
 {
  "name": "Vein Ripper",
  "qty": 1,
  "cost": "{3}{B}{B}{B}",
  "mv": 6,
  "type": "Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "6/5",
  "text": "Flying\nWard—Sacrifice a creature.\nWhenever a creature dies, target opponent loses 2 life and you gain 2 life.",
  "roles": [
   "loop"
  ],
  "why": "Whenever any creature dies, target opponent loses 2 life and you gain 2. That's a starter for the drain loop on its own: the gain triggers <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c>, the loss triggers <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>. With <i-c>Ashnod's Altar</i-c>, each stolen 2/2 is 2 life from a player and two mana.",
  "how": "Cast it when you have six mana and a loop half out, or before a <i-c>Kindred Dominance</i-c>: every creature that dies drains 2.",
  "syn": [
   "Ashnod's Altar",
   "Kindred Dominance",
   "Sanguine Bond",
   "Exquisite Blood",
   "Bloodletter of Aclazotz",
   "Roaming Throne"
  ],
  "warn": "It costs six. An opponent who wants to target it must sacrifice a creature or the spell or ability is countered, but wraths don't target."
 },
 {
  "name": "Exquisite Blood",
  "qty": 1,
  "cost": "{4}{B}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "Whenever an opponent loses life, you gain that much life.",
  "roles": [
   "loop"
  ],
  "why": "Half of the second kill. Whenever an opponent loses life, you gain that much, and Sanguine Bond or Vito turns every gain into more loss: the two loop until the table is dead. The loop added 6.6 / 3.3 points in bot games and wins 38% of the precon games in which Ramses never lands.",
  "how": "Tutor for it when Sanguine Bond or Vito is already out. Cast it with a counter up, then start the loop: any Assassin hit, a Vein Ripper drain, an opponent paying life.",
  "syn": [
   "Sanguine Bond",
   "Vito, Thorn of the Dusk Rose",
   "Bloodletter of Aclazotz",
   "Vein Ripper",
   "Ashnod's Altar",
   "Ramses, Assassin Lord"
  ],
  "warn": "It's a five-mana enchantment. Enchantment removal or a bounce in response to the first trigger stops the loop."
 },
 {
  "name": "Sanguine Bond",
  "qty": 1,
  "cost": "{3}{B}{B}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "Whenever you gain life, target opponent loses that much life.",
  "roles": [
   "loop"
  ],
  "why": "The other half of the loop: whenever you gain life, target opponent loses that much. With Exquisite Blood or Bloodthirsty Conqueror it kills the table one player at a time. As an enchantment it survives the creature wraths that kill Vito.",
  "how": "Cast it when Exquisite Blood or Bloodthirsty Conqueror is out or about to be, ideally after combat on your turn. Point every trigger at the player you're killing until they're dead, then the next.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vein Ripper",
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord"
  ],
  "warn": "At five mana it's slow. If Vito is easier to get out, take Vito."
 },
 {
  "name": "Bloodthirsty Conqueror",
  "qty": 1,
  "cost": "{3}{B}{B}",
  "mv": 5,
  "type": "Creature — Vampire Knight",
  "cat": "Creature",
  "pt": "5/5",
  "text": "Flying, deathtouch\nWhenever an opponent loses life, you gain that much life. (Damage causes loss of life.)",
  "roles": [
   "loop"
  ],
  "why": "Half of the second kill: whenever an opponent loses life, you gain that much. With <i-c>Sanguine Bond</i-c> or <i-c>Vito, Thorn of the Dusk Rose</i-c> out, every gain makes an opponent lose life again, and the loop kills the table. When the loop isn't ready it's a 5/5 flying deathtouch attacker.",
  "how": "Tutor for it when the other half is already out, or cast it as a threat. Any life loss starts the loop, including its own combat damage.",
  "syn": [
   "Sanguine Bond",
   "Vito, Thorn of the Dusk Rose",
   "Exquisite Blood",
   "Vein Ripper",
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord"
  ],
  "warn": "It's a Vampire Knight, so Kindred Dominance naming Assassin kills it unless a type-changer is out. The loop is mandatory: if an opponent can't lose, the game is a draw."
 },
 {
  "name": "Vito, Thorn of the Dusk Rose",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Cleric",
  "cat": "Creature",
  "pt": "1/3",
  "text": "Whenever you gain life, target opponent loses that much life.\n{3}{B}{B}: Creatures you control gain lifelink until end of turn.",
  "roles": [
   "loop"
  ],
  "why": "The other half of the loop: whenever you gain life, target opponent loses that much. With <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> out, every loss gains and every gain drains, until the table is dead. It's the cheapest loop piece at three mana.",
  "how": "Cast it early when you hold or can tutor the other half; it's a small 1/3 nobody prioritizes. With the loop not ready, {3}{B}{B} gives your team lifelink for one big drain turn.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vein Ripper",
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord",
   "Mox Amber"
  ],
  "warn": "It's a Vampire Cleric: Kindred Dominance naming Assassin kills it unless a type-changer is out."
 },
 {
  "name": "Leyline of Transformation",
  "qty": 1,
  "cost": "{2}{U}{U}",
  "mv": 4,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "If this card is in your opening hand, you may begin the game with it on the battlefield.\nAs this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
  "roles": [
   "snowball"
  ],
  "why": "Name Assassin: every creature you control is an Assassin, including the face-down 2/2s Etrata steals. Each stolen 2/2 that connects then cloaks again, Ramses pumps them, and Kindred Dominance spares them. Free if it's in your opening hand.",
  "how": "Put it onto the battlefield before the game if it's in your opener. Otherwise cast it on turn 4 or later, once Etrata has stolen a couple of cards.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Kindred Dominance",
   "Coat of Arms",
   "Brotherhood Headquarters",
   "Pyre of Heroes",
   "Achilles Davenport"
  ],
  "warn": "Face-down creatures have no creature types: without this, Arcane Adaptation or Roshan, a stolen 2/2 never triggers Etrata."
 },
 {
  "name": "Arcane Adaptation",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "As this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
  "roles": [
   "snowball"
  ],
  "why": "A three-mana Leyline of Transformation: name Assassin and every creature you control is one, so each stolen 2/2 that connects cloaks again. It's the second type-changer, so the snowball survives one removal.",
  "how": "Cast it on turn 3 or 4 when Etrata has stolen a card or is about to. Cast it before Kindred Dominance so your stolen 2/2s survive.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Kindred Dominance",
   "Leyline of Transformation",
   "Roshan, Hidden Magister",
   "Pyre of Heroes"
  ],
  "warn": "It does nothing on its own. Without a cloak or a non-Assassin creature out, hold it for a counter or a threat."
 },
 {
  "name": "Coat of Arms",
  "qty": 1,
  "cost": "{5}",
  "mv": 5,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it. (For example, if two Goblin Warriors and a Goblin Shaman are on the battlefield, each gets +2/+2.)",
  "roles": [
   "snowball"
  ],
  "why": "Each creature gets +1/+1 for each other creature that shares a type with it. With a type-changer out your whole board is Assassins, so ten creatures make ten 11/11s. It's the overrun for a wide board of stolen 2/2s.",
  "how": "Cast it only when your shared-type count clearly beats every opponent's, usually with Leyline or Arcane Adaptation and five or more creatures. Attack the same turn.",
  "syn": [
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Roshan, Hidden Magister",
   "Changeling Outcast",
   "Mutavault",
   "Eldrazi Monument"
  ],
  "warn": "It's symmetric. Opponents' tribal boards grow too, your Human Assassins share Human with their Humans, and changelings share with everything. The pump takes 1/1s out of Tetsuko's range."
 },
 {
  "name": "Eldrazi Monument",
  "qty": 1,
  "cost": "{5}",
  "mv": 5,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "Creatures you control get +1/+1 and have flying and indestructible.\nAt the beginning of your upkeep, sacrifice a creature. If you can't, sacrifice this artifact.",
  "roles": [
   "evasion",
   "snowball"
  ],
  "why": "Creatures you control get +1/+1, flying and indestructible. The stolen 2/2s become flying 3/3s that survive destroy wraths, and every upkeep a dud you'd never flip pays the sacrifice. The evasion package it came with measured +1.7 / +1.1, and with Reverse the Polarity +2.9 / +0.3 in bot games.",
  "how": "Cast it once you have a few stolen 2/2s, then attack with everything. Each upkeep, sacrifice the worst face-down card.",
  "syn": [
   "Teferi's Veil",
   "Reverse the Polarity",
   "Ashnod's Altar",
   "Vein Ripper",
   "Coat of Arms",
   "Ramses, Assassin Lord"
  ],
  "warn": "Indestructible doesn't stop exile, bounce, sacrifice or -X/-X. The +1/+1 takes 1/1s out of Tetsuko's range, but they fly instead."
 },
 {
  "name": "Teferi's Veil",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "Whenever a creature you control attacks, it phases out at end of combat. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)",
  "roles": [
   "evasion"
  ],
  "why": "Whenever a creature you control attacks, it phases out at end of combat and comes back at your next untap step. The wraths cast on the other players' turns miss your whole attacking team, which is how this deck loses most of its boards. It measured +1.0 / +0.2 in bot games, and attacking with everything once it's out is one of the nine piloting rules.",
  "how": "Cast it before you go all in, ideally on turn 2-4 for two mana. From then on attack with everything that gets through, Ramses and Etrata included.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Eldrazi Monument",
   "Kindred Dominance",
   "Coat of Arms",
   "Lightning Greaves"
  ],
  "warn": "Phased-out creatures can't block, and a phased-out Etrata doesn't count as a commander you control: Fierce Guardianship and Deadly Rollick aren't free on opponents' turns while she's away."
 },
 {
  "name": "They Came from the Pipes",
  "qty": 1,
  "cost": "{4}{U}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "When this enchantment enters, manifest dread twice. (To manifest dread, look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nWhenever a face-down creature you control enters, draw a card.",
  "roles": [
   "snowball",
   "draw"
  ],
  "why": "Draws a card whenever a face-down creature enters under your control, so every Etrata cloak is a card. It enters with two face-down 2/2s of its own and draws for both.",
  "how": "Cast it once Etrata is out and Assassins are connecting. On a quiet turn 5 its own two manifests are already two bodies and two cards.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Satoru, the Infiltrator",
   "Reanimate",
   "Leyline of Transformation",
   "Ashnod's Altar"
  ],
  "warn": "More cards drawn means a thinner library: with Rhystic Study and Demonic Consultation it can deck you in long games."
 },
 {
  "name": "Quietus Spike",
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "text": "Equipped creature has deathtouch.\nWhenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.\nEquip {3}",
  "roles": [
   "kill"
  ],
  "why": "Equipped creature has deathtouch, and when it deals combat damage to a player, that player loses half their life, rounded up. On an unblockable Assassin with Ramses out, it's a kill; with Bloodletter on your turn, the half is doubled into all of it.",
  "how": "Equip it ({3}) to a creature that will connect: Changeling Outcast, Slither Blade or a Tetsuko-unblockable creature. Aim it at the one player you're killing.",
  "syn": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Changeling Outcast",
   "Slither Blade",
   "Tetsuko Umezawa, Fugitive",
   "Rogue's Passage",
   "Virtus the Veiled"
  ],
  "warn": "Equipping is sorcery speed and costs {3}. It can't go on a creature that has shroud from Lightning Greaves."
 },
 {
  "name": "Reverse the Polarity",
  "qty": 1,
  "cost": "{1}{U}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "text": "Choose one —\n• Counter all other spells.\n• Switch each creature's power and toughness until end of turn.\n• Creatures can't be blocked this turn.",
  "roles": [
   "evasion",
   "removal"
  ],
  "why": "An instant with two jobs. On your turn, 'creatures can't be blocked this turn' sends the whole board through for the Ramses kill or a lethal swing. On an opponent's turn, 'counter all other spells' stops a wrath and anything stacked on it. With Eldrazi Monument it measured +2.9 / +0.3 in bot games.",
  "how": "Hold it for the kill turn and cast it in your beginning of combat step or before blockers are declared. If a wrath comes first, use the counter mode instead.",
  "syn": [
   "Ramses, Assassin Lord",
   "Eldrazi Monument",
   "Coat of Arms",
   "Quietus Spike",
   "Bloodletter of Aclazotz",
   "Virtus the Veiled"
  ],
  "warn": "The unblockable mode affects every creature, opponents' too, so cast it on your turn and before blockers. The counter mode also counters your own other spells on the stack."
 },
 {
  "name": "Ashnod's Altar",
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "Sacrifice a creature: Add {C}{C}.",
  "roles": [
   "loop",
   "ramp"
  ],
  "why": "Sacrifice a creature: add {C}{C}. The stolen face-down 2/2s you won't flip become mana for Etrata's flips, Kindred Dominance or a tutor, and with Vein Ripper each one drains 2.",
  "how": "Sacrifice duds for mana on your turn, or in response to removal and wraths so the creature isn't wasted. With Vein Ripper and a loop half out, every sacrifice is a drain that starts the loop.",
  "syn": [
   "Vein Ripper",
   "Exquisite Blood",
   "Sanguine Bond",
   "Eldrazi Monument",
   "Kindred Dominance",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "Don't sacrifice your Assassins before combat: each one that connects is another stolen card."
 },
 {
  "name": "Lightning Greaves",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "text": "Equipped creature has haste and shroud.\nEquip {0}",
  "roles": [
   "evasion"
  ],
  "why": "Equip {0}: haste and shroud. It lets Etrata attack the turn she lands and keeps a single removal spell off her or Ramses. The piloting rule is Greaves on Etrata as soon as you can, but never hold Ramses back to wait for it.",
  "how": "Cast it early, then move it for free to whatever matters most this turn: Etrata on the turn she comes down, Ramses the turn he does.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Virtus the Veiled",
   "Quietus Spike"
  ],
  "warn": "Shroud stops your own targeting too: you can't equip Quietus Spike to it, aim Rogue's Passage at it or make it the target of anything. Holding Ramses until Greaves could go on him cost 3.8 / 4.8 points in bot games."
 },
 {
  "name": "Reanimate",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.",
  "roles": [
   "tutor"
  ],
  "why": "One mana: Ramses, Assassin Lord back from the graveyard after a wrath, for 4 life. He's removed in 37% of the bot games he lands in against precons, so a cheap way back matters. It also takes a creature from any graveyard, including the opponents'.",
  "how": "When Ramses has died, cast it on your turn before combat. With him safe, take the best creature in any graveyard: an opponent's bomb, or a stolen card that died and went home.",
  "syn": [
   "Ramses, Assassin Lord",
   "They Came from the Pipes",
   "Diabolic Intent",
   "Bloodthirsty Conqueror",
   "Demonic Tutor"
  ],
  "warn": "You lose life equal to the card's mana value. Reanimating a big creature at low life can kill you."
 },
 {
  "name": "Demonic Tutor",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Search your library for a card, put that card into your hand, then shuffle.",
  "roles": [
   "tutor"
  ],
  "why": "Two mana: any card into your hand. In this deck that card is Ramses, Assassin Lord first. In bot games tutoring anything else first cost 8 to 11 points, and the deck wins about half its games with Ramses out against a fifth without him.",
  "how": "Get Ramses if he's still in your library. Once he's out, take the missing loop piece (Exquisite Blood or Sanguine Bond) or the kill kit: Bloodletter of Aclazotz, Quietus Spike, a halver.",
  "syn": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Exquisite Blood",
   "Sanguine Bond",
   "Teferi's Veil",
   "Quietus Spike"
  ],
  "warn": "If Ramses died, tutor for Reanimate instead of a second threat: one mana gets him back."
 },
 {
  "name": "Vampiric Tutor",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "tutor"
  ],
  "why": "One mana at instant speed: any card on top of your library for 2 life. Cast at the end of the turn before yours, it puts Ramses, Assassin Lord in your next draw; with Brainstorm it's in hand at once.",
  "how": "End of the opponent's turn before yours: put Ramses on top, draw him, cast him before combat. Once he's out, find the loop half you're missing.",
  "syn": [
   "Ramses, Assassin Lord",
   "Brainstorm",
   "Dark Confidant",
   "Exquisite Blood",
   "Sanguine Bond",
   "Reanimate"
  ],
  "warn": "The card is on top, not in hand: a shuffle (your own fetch land) or a mill sets you back, and Demonic Consultation after it would exile it."
 },
 {
  "name": "Imperial Seal",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "tutor"
  ],
  "why": "A sorcery Vampiric Tutor: one mana and 2 life for any card on top of your library. It's the third of the three cheapest tutors, which together measured 1.5 to 2.6 points in the bot sweep.",
  "how": "On turns 1-3, put Ramses, Assassin Lord on top if he isn't in hand. If you want him this turn, follow it with Preordain or Brainstorm.",
  "syn": [
   "Ramses, Assassin Lord",
   "Preordain",
   "Brainstorm",
   "Dark Ritual",
   "Exquisite Blood"
  ],
  "warn": "It's a sorcery, so the table sees a card go on top for a full turn cycle and you can't respond to a removal spell with it."
 },
 {
  "name": "Grim Tutor",
  "qty": 1,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.",
  "roles": [
   "tutor"
  ],
  "why": "Three mana and 3 life: any card into your hand. It's the fourth unrestricted Ramses tutor and the easiest way to find the second loop piece in the late game.",
  "how": "Get Ramses, Assassin Lord if he's missing, else the loop half you lack. Dark Ritual casts it on turn 1.",
  "syn": [
   "Ramses, Assassin Lord",
   "Dark Ritual",
   "Exquisite Blood",
   "Sanguine Bond",
   "Bloodletter of Aclazotz"
  ]
 },
 {
  "name": "Diabolic Intent",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a card, put that card into your hand, then shuffle.",
  "roles": [
   "tutor"
  ],
  "why": "Two mana and a creature: any card into your hand. The creature is a stolen face-down 2/2 that's a dud, so the tutor costs you nothing real.",
  "how": "Sacrifice a cloaked 2/2 you won't flip (it goes to its owner's graveyard) and take Ramses, Assassin Lord first. With Vein Ripper out, the sacrifice also drains 2.",
  "syn": [
   "Ramses, Assassin Lord",
   "Vein Ripper",
   "Etrata, Deadly Fugitive",
   "Exquisite Blood",
   "Sanguine Bond"
  ],
  "warn": "You need a creature to cast it. Don't sacrifice a face-down card you might flip into a bomb."
 },
 {
  "name": "Pyre of Heroes",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "{2}, {T}, Sacrifice a creature: Search your library for a creature card that shares a creature type with the sacrificed creature and has mana value equal to 1 plus that creature's mana value. Put that card onto the battlefield, then shuffle. Activate only as a sorcery.",
  "roles": [
   "tutor"
  ],
  "why": "A repeatable tutor that puts the creature onto the battlefield. Sacrifice a 3-mana Assassin (Etrata, Virtus, Unstoppable Slasher, Mari) and Ramses, Assassin Lord enters at sorcery speed. Adding it measured +1.8 / +0.5 in bot games.",
  "how": "Main phase one: {2}, tap, sacrifice the 3-drop, put Ramses onto the battlefield, then attack. Once he's out, climb the curve: a Vampire into Bloodletter, Bloodthirsty Conqueror into Vein Ripper.",
  "syn": [
   "Ramses, Assassin Lord",
   "Mari, the Killing Quill",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Bloodletter of Aclazotz",
   "Leyline of Transformation",
   "Arcane Adaptation"
  ],
  "warn": "The found creature must share a creature type with the sacrificed one and cost exactly 1 more. A face-down 2/2 has mana value 0 and no types, so without a type-changer it finds nothing."
 },
 {
  "name": "Sol Ring",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "{T}: Add {C}{C}.",
  "roles": [
   "ramp"
  ],
  "why": "One mana for {C}{C}. In the bot cut sweep of the first skeleton it was one of the few cards clearly worth more than a basic land (−2.4 / −1.4 without it). It puts two Assassins down on turn 1 or Ramses down a turn early.",
  "how": "Turn 1, always. Next turn it pays the generic part of Etrata or Ramses.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Darkwater Catacombs",
   "Pyre of Heroes",
   "Eldrazi Monument"
  ],
  "warn": "It makes only colorless mana: you still need {U}{B} from other sources for Etrata and Ramses."
 },
 {
  "name": "Mox Amber",
  "qty": 1,
  "cost": "{0}",
  "mv": 0,
  "type": "Legendary Artifact",
  "cat": "Artifact",
  "text": "{T}: Add one mana of any color among legendary creatures and planeswalkers you control.",
  "roles": [
   "ramp"
  ],
  "why": "Free: taps for any color among the legendary creatures and planeswalkers you control. The deck has twelve legendary creatures, Etrata and Ramses first, so it's usually on by turn 2-3.",
  "how": "Play it when a legendary creature is out or about to be, often the same turn: cast a legend, then tap the Mox.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Tetsuko Umezawa, Fugitive",
   "Basim Ibn Ishaq"
  ],
  "warn": "With no legendary creature or planeswalker out, it makes nothing. Etrata in the command zone doesn't count."
 },
 {
  "name": "Chrome Mox",
  "qty": 1,
  "cost": "{0}",
  "mv": 0,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "Imprint — When Chrome Mox enters, you may exile a nonartifact, nonland card from your hand.\n{T}: Add one mana of any of the exiled card's colors.",
  "roles": [
   "ramp"
  ],
  "why": "Free: exile a nonartifact, nonland card from your hand and it taps for one of that card's colors forever. It trades a spare card for a turn of tempo.",
  "how": "Imprint a blue or black card you won't need: a second counter, a late cantrip, an expensive spell in a fast hand.",
  "syn": [
   "Changeling Outcast",
   "Sol Ring",
   "Basim Ibn Ishaq"
  ],
  "warn": "It's card disadvantage. With no card worth exiling, it does nothing."
 },
 {
  "name": "Lotus Petal",
  "qty": 1,
  "cost": "{0}",
  "mv": 0,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "{T}, Sacrifice Lotus Petal: Add one mana of any color.",
  "roles": [
   "ramp"
  ],
  "why": "Free, one use: one mana of any color. It puts a one-drop and a two-drop down on turn 1 or Etrata out a turn early.",
  "how": "Crack it when it unlocks a play this turn, not just because you can.",
  "syn": [
   "Changeling Outcast",
   "Etrata, Deadly Fugitive",
   "Basim Ibn Ishaq"
  ],
  "warn": "It's gone after one use."
 },
 {
  "name": "Dark Ritual",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "text": "Add {B}{B}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "{B} becomes {B}{B}{B}. It casts Grim Tutor for Ramses on turn 1, or two black one-drops, or finishes a big turn.",
  "how": "Use it only when it unlocks a play: Swamp, Dark Ritual, Grim Tutor is the best one.",
  "syn": [
   "Grim Tutor",
   "Imperial Seal",
   "Swamp"
  ],
  "warn": "It's card disadvantage. The mana empties at the end of the step or phase."
 },
 {
  "name": "Arcane Signet",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "ramp"
  ],
  "why": "Two mana: taps for {U} or {B}. It fixes and ramps into Etrata or Ramses.",
  "how": "Turn 2 if you have nothing better; it's a three-drop on turn 2 and Ramses on turn 3.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Basim Ibn Ishaq"
  ]
 },
 {
  "name": "Talisman of Dominance",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Talisman of Dominance deals 1 damage to you.",
  "roles": [
   "ramp"
  ],
  "why": "Two mana: {C}, or {U} or {B} for 1 damage to you. It fixes both of Etrata's colors.",
  "how": "Turn 2. Tap it for colorless when that's enough, to save life.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Basim Ibn Ishaq"
  ]
 },
 {
  "name": "Force of Will",
  "qty": 1,
  "cost": "{3}{U}{U}",
  "mv": 5,
  "type": "Instant",
  "cat": "Instant",
  "text": "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target spell.",
  "roles": [
   "removal"
  ],
  "why": "Counter any spell, free for 1 life and a blue card from your hand. It's the one free counter that also stops creature spells, so it can answer a wrath on your turn or the opponent's.",
  "how": "Save the last counter for the wrath and for removal aimed at Ramses or Etrata (+1.0 in bot games); let single creatures and commanders resolve.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Teferi's Veil",
   "Brainstorm",
   "Fierce Guardianship"
  ],
  "warn": "In the bot cut sweep a land in its place measured +0.9 / +0.6; the research reads that as the bot's counter play, not the card. Pitching a card is card disadvantage: don't spend it on a Sol Ring."
 },
 {
  "name": "Fierce Guardianship",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nCounter target noncreature spell.",
  "roles": [
   "removal"
  ],
  "why": "Counter a noncreature spell, free while Etrata is on the battlefield. That covers the wraths and most removal aimed at Ramses.",
  "how": "Keep Etrata out and this is a free answer to the wrath. Spend it on the spell that would end your board, not on the first threat.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Teferi's Veil",
   "Deadly Rollick"
  ],
  "warn": "Without your commander on the battlefield (in the command zone, or phased out by Teferi's Veil) it costs {2}{U}."
 },
 {
  "name": "Force of Negation",
  "qty": 1,
  "cost": "{1}{U}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "text": "If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard.",
  "roles": [
   "removal"
  ],
  "why": "Counter a noncreature spell and exile it; on an opponent's turn it's free by exiling a blue card. It stops the wrath on the turn wraths are cast.",
  "how": "Hold it for a wrath or for removal on Ramses or Etrata on an opponent's turn. On your own turn it costs {1}{U}{U}.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Teferi's Veil",
   "Force of Will"
  ],
  "warn": "The free cost works only when it's not your turn. In the bot cut sweep a land in its place measured +0.8 / +0.6; the research reads that as the bot's counter play, not the card."
 },
 {
  "name": "Swan Song",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "text": "Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with flying.",
  "roles": [
   "removal"
  ],
  "why": "One mana: counter an enchantment, instant or sorcery. Most wraths, most removal on Ramses and most tutors are covered; the opponent gets a 2/2 flying Bird.",
  "how": "Hold {U} for the wrath. The Bird is a small price for keeping the board.",
  "syn": [
   "Ramses, Assassin Lord",
   "Teferi's Veil",
   "River of Tears"
  ],
  "warn": "The 2/2 flier can block your fliers and stolen 2/2s; it's no wall for Tetsuko's unblockables."
 },
 {
  "name": "Deadly Rollick",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nExile target creature.",
  "roles": [
   "removal"
  ],
  "why": "Exile any creature, free while Etrata is on the battlefield. It removes the blocker that stops the Ramses kill or the creature that would break your board.",
  "how": "Use it at instant speed on the creature that matters: a blocker on the player you're killing, or an indestructible threat.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Fierce Guardianship",
   "Quietus Spike"
  ],
  "warn": "Without Etrata on the battlefield, or while Teferi's Veil has her phased out, it costs {3}{B}."
 },
 {
  "name": "Snuff Out",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "text": "If you control a Swamp, you may pay 4 life rather than pay this spell's mana cost.\nDestroy target nonblack creature. It can't be regenerated.",
  "roles": [
   "removal"
  ],
  "why": "Destroy a nonblack creature, free for 4 life if you control a Swamp. A tempo-free answer to a blocker or a threat.",
  "how": "Use it on the blocker or the attacker that matters, at instant speed, without tapping mana on your turn.",
  "syn": [
   "Swamp",
   "Watery Grave",
   "Ramses, Assassin Lord",
   "Quietus Spike"
  ],
  "warn": "It can't hit black creatures. The 4 life is real against aggressive tables."
 },
 {
  "name": "Cyclonic Rift",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "text": "Return target nonland permanent you don't control to its owner's hand.\nOverload {6}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  "roles": [
   "removal"
  ],
  "why": "Two mana to bounce one nonland permanent, or seven at instant speed to bounce everything opponents control. Overloaded the turn before yours, it clears every blocker for the kill.",
  "how": "Overload it at the end of the turn before yours, then attack the player you're killing into an empty board.",
  "syn": [
   "Ramses, Assassin Lord",
   "Quietus Spike",
   "Coat of Arms",
   "Ashnod's Altar"
  ],
  "warn": "In the bot cut sweep a land in its place measured +1.0 / +0.5, which the research reads as the bot's counter play, not the card. Overloaded, it costs seven mana."
 },
 {
  "name": "Rhystic Study",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.",
  "roles": [
   "draw"
  ],
  "why": "Whenever an opponent casts a spell, you may draw unless they pay {1}. Either you draw several cards a round or the table slows down, and both help a deck that wins by turn 8-9. A turn 1-2 engine with lands for it is a keepable hand under the mulligan rule.",
  "how": "Cast it on turn 2 or 3. Later, cast it only if you have nothing that develops the board.",
  "syn": [
   "Mystic Remora",
   "Dark Confidant",
   "Satoru, the Infiltrator",
   "Brainstorm",
   "Demonic Consultation"
  ],
  "warn": "Draw engines thin the library fast. In bot games 8% of the losses to precons were an empty library, with Demonic Consultation and the draw engines."
 },
 {
  "name": "Mystic Remora",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "text": "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.",
  "roles": [
   "draw"
  ],
  "why": "One mana: whenever an opponent casts a noncreature spell, you may draw unless they pay {4}. On turns 1-3 it draws several cards a round while opponents set up.",
  "how": "Cast it on turn 1. Pay the upkeep for two or three turns, then let it go.",
  "syn": [
   "Rhystic Study",
   "Dark Confidant",
   "Demonic Consultation",
   "Brainstorm"
  ],
  "warn": "Cumulative upkeep grows each turn. Don't keep paying once it costs more than it draws. In the bot cut sweep a land in its place measured +1.3 / +0.1."
 },
 {
  "name": "Ancient Tomb",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.",
  "roles": [
   "land",
   "ramp"
  ],
  "why": "A land that taps for {C}{C} for 2 damage: the eighth fast-mana piece, next to seven nonland ones. With Sol Ring on turn 1 it makes five mana on turn 2.",
  "how": "Play it on turn 1-2 when the extra mana casts something now. Late, tap it only when you need the second mana.",
  "syn": [
   "Sol Ring",
   "Pyre of Heroes",
   "Eldrazi Monument",
   "Coat of Arms",
   "Ramses, Assassin Lord"
  ],
  "warn": "Its mana is colorless and costs 2 life each tap; against aggressive tables that adds up."
 },
 {
  "name": "Command Tower",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped, from turn 1.",
  "how": "Play it whenever you need both colors.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Watery Grave",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "text": "({T}: Add {U} or {B}.)\nAs Watery Grave enters, you may pay 2 life. If you don't, it enters tapped.",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters untapped for 2 life. All three fetch lands find it, and it counts for every land that checks for an Island or a Swamp.",
  "how": "Fetch it on turn 1 and pay the 2 life if you're casting something.",
  "syn": [
   "Polluted Delta",
   "Marsh Flats",
   "Scalding Tarn",
   "Snuff Out",
   "Tainted Isle",
   "Drowned Catacomb"
  ]
 },
 {
  "name": "Polluted Delta",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}, Pay 1 life, Sacrifice Polluted Delta: Search your library for an Island or Swamp card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Pay 1 life and sacrifice it: put an Island or Swamp card onto the battlefield. It finds a basic, Watery Grave, Sunken Hollow or Undercity Sewers, and it shuffles after Brainstorm.",
  "how": "Crack it at the end of an opponent's turn, or after Brainstorm to shuffle away the two cards you put back.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers",
   "Brainstorm",
   "Vampiric Tutor"
  ],
  "warn": "Don't crack it after Vampiric Tutor or Imperial Seal and before your draw: the shuffle loses the tutored card."
 },
 {
  "name": "Marsh Flats",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}, Pay 1 life, Sacrifice Marsh Flats: Search your library for a Plains or Swamp card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "A Swamp fetch: pay 1 life, sacrifice it, put a Plains or Swamp card onto the battlefield. In this deck that's a basic Swamp, Watery Grave, Sunken Hollow or Undercity Sewers.",
  "how": "Fetch Watery Grave early for both colors, a basic Swamp late to protect the duals.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers",
   "Brainstorm",
   "Swamp"
  ],
  "warn": "It can't find a basic Island."
 },
 {
  "name": "Scalding Tarn",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}, Pay 1 life, Sacrifice Scalding Tarn: Search your library for an Island or Mountain card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "An Island fetch: pay 1 life, sacrifice it, put an Island or Mountain card onto the battlefield. In this deck that's a basic Island, Watery Grave, Sunken Hollow or Undercity Sewers.",
  "how": "Fetch Watery Grave early for both colors, a basic Island late.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers",
   "Brainstorm",
   "Island"
  ],
  "warn": "It can't find a basic Swamp."
 },
 {
  "name": "Underground River",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Underground River deals 1 damage to you.",
  "roles": [
   "land"
  ],
  "why": "{C} for free, or {U} or {B} for 1 damage to you. Always untapped.",
  "how": "Play it any turn; tap it for colorless when that's enough.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Drowned Catacomb",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "Drowned Catacomb enters tapped unless you control an Island or a Swamp.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped if you control an Island or a Swamp.",
  "how": "Play it from turn 2 on, after a basic or a typed dual.",
  "syn": [
   "Island",
   "Swamp",
   "Watery Grave",
   "Sunken Hollow"
  ]
 },
 {
  "name": "Sunken Hollow",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "text": "({T}: Add {U} or {B}.)\nSunken Hollow enters tapped unless you control two or more basic lands.",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters untapped if you control two or more basic lands. The fetch lands find it.",
  "how": "Play it from turn 3 on, once two basics are out.",
  "syn": [
   "Island",
   "Swamp",
   "Polluted Delta",
   "Tainted Isle",
   "Snuff Out"
  ]
 },
 {
  "name": "Choked Estuary",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "As Choked Estuary enters, you may reveal an Island or Swamp card from your hand. If you don't, Choked Estuary enters tapped.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped if you reveal an Island or Swamp card from your hand.",
  "how": "Play it early, while you still have a basic or a typed dual in hand to show.",
  "syn": [
   "Island",
   "Swamp",
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers"
  ]
 },
 {
  "name": "Darkwater Catacombs",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{1}, {T}: Add {U}{B}.",
  "roles": [
   "land"
  ],
  "why": "A filter land: pay {1} from another source and it makes {U}{B}, both of Etrata's colors at once. Always untapped.",
  "how": "Pair it with Sol Ring or a colorless land to turn colorless mana into {U}{B}.",
  "syn": [
   "Sol Ring",
   "Ancient Tomb",
   "Rogue's Passage",
   "Mutavault",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "It makes nothing on its own: don't keep it as the only land."
 },
 {
  "name": "Darkslick Shores",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "Darkslick Shores enters tapped unless you control two or fewer other lands.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped on your first three land drops.",
  "how": "Play it on turns 1-3.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Changeling Outcast"
  ]
 },
 {
  "name": "Tainted Isle",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Activate only if you control a Swamp.",
  "roles": [
   "land"
  ],
  "why": "Taps for {C}, and for {U} or {B} if you control a Swamp. Always untapped.",
  "how": "Play it after a basic Swamp or a dual with the Swamp type.",
  "syn": [
   "Swamp",
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers"
  ]
 },
 {
  "name": "River of Tears",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {U}. If you played a land this turn, add {B} instead.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U}, or {B} on a turn you played a land. Always untapped.",
  "how": "Use it for {U} on opponents' turns: Swan Song, Force of Negation's hard cost.",
  "syn": [
   "Swan Song",
   "Force of Negation",
   "Brainstorm"
  ]
 },
 {
  "name": "Path of Ancestry",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "Path of Ancestry enters tapped.\n{T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell that shares a creature type with your commander, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}. When that mana casts a creature spell that shares a type with Etrata (Vampire or Assassin), you scry 1. Most of the deck's creatures are Assassins.",
  "how": "Play it on turn 1 when you have nothing to cast, since it enters tapped.",
  "syn": [
   "Changeling Outcast",
   "Hired Poisoner",
   "Ramses, Assassin Lord",
   "Leyline of Transformation",
   "Arcane Adaptation"
  ],
  "warn": "It enters tapped."
 },
 {
  "name": "Rogue's Passage",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}.\n{4}, {T}: Target creature can't be blocked this turn.",
  "roles": [
   "land",
   "evasion"
  ],
  "why": "{4}, {T}: target creature can't be blocked this turn. With Ramses out, it puts the halver or the Quietus Spike carrier through to the player you're killing.",
  "how": "Activate it before blockers on the kill turn, on the creature whose hit ends the player.",
  "syn": [
   "Quietus Spike",
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz"
  ],
  "warn": "It makes only colorless mana, and it can't target a creature with shroud from Lightning Greaves."
 },
 {
  "name": "Brotherhood Headquarters",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source.",
  "roles": [
   "land"
  ],
  "why": "Taps for {C}, or any color to cast an Assassin spell or a freerunning spell, or to activate an ability of an Assassin source. It casts Etrata, Ramses and most of the creatures.",
  "how": "Use the colored mana for Assassin creature spells and Achilles's freerunning cost.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Achilles Davenport",
   "Leyline of Transformation",
   "Arcane Adaptation"
  ],
  "warn": "Etrata's flip ability belongs to the face-down creature, so this colored mana pays it only when a type-changer makes that face-down creature an Assassin."
 },
 {
  "name": "Cavern of Souls",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "As Cavern of Souls enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't be countered.",
  "roles": [
   "land"
  ],
  "why": "Name Assassin: its colored mana casts Assassin creature spells that can't be countered. Etrata and Ramses resolve through counterspells.",
  "how": "Name Assassin. Pay for Ramses or Etrata with its colored mana when an opponent has a counter up.",
  "syn": [
   "Ramses, Assassin Lord",
   "Etrata, Deadly Fugitive",
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Roshan, Hidden Magister"
  ],
  "warn": "Only the spell its colored mana paid for is uncounterable; the {C} does nothing special. After the creature resolves, removal still works."
 },
 {
  "name": "Secluded Courtyard",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "As Secluded Courtyard enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type or activate an ability of a creature or creature card of the chosen type.",
  "roles": [
   "land"
  ],
  "why": "Name Assassin: taps for {C}, or any color for Assassin creature spells and abilities of Assassin creatures. It casts most of the deck's creatures.",
  "how": "Name Assassin. Use the colored mana on creature spells and creature abilities.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Vito, Thorn of the Dusk Rose"
  ],
  "warn": "Etrata's flip on a face-down creature counts only if that creature is an Assassin through a type-changer."
 },
 {
  "name": "Mutavault",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "{T}: Add {C}.\n{1}: Until end of turn, Mutavault becomes a 2/2 creature with all creature types. It's still a land.",
  "roles": [
   "land",
   "assassin"
  ],
  "why": "A land that taps for {C} and for {1} becomes a 2/2 with all creature types. As an Assassin it triggers Etrata when it connects, Ramses pumps it, and Kindred Dominance spares it.",
  "how": "Animate it before combat and attack the player you're stealing from, like any Assassin.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Coat of Arms",
   "Kindred Dominance",
   "Achilles Davenport"
  ],
  "warn": "It makes only colorless mana. Animated, it's a creature: removal and wraths hit it."
 },
 {
  "name": "Morphic Pool",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "text": "Morphic Pool enters tapped unless you have two or more opponents.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped whenever you have two or more opponents.",
  "how": "Play it any turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Undercity Sewers",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "text": "({T}: Add {U} or {B}.)\nUndercity Sewers enters tapped.\nWhen Undercity Sewers enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters tapped and surveils 1. The fetch lands find it.",
  "how": "Play it on turn 1 or a turn you have spare mana.",
  "syn": [
   "Polluted Delta",
   "Snuff Out",
   "Tainted Isle",
   "Reanimate"
  ],
  "warn": "It enters tapped."
 },
 {
  "name": "Island",
  "qty": 8,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Island",
  "cat": "Land",
  "text": "({T}: Add {U}.)",
  "roles": [
   "land"
  ],
  "why": "Eight basic Islands. They turn on Drowned Catacomb, Sunken Hollow and Choked Estuary, and the fetch lands find them.",
  "how": "Play them like any land; fetch them late to save life and duals.",
  "syn": [
   "Drowned Catacomb",
   "Sunken Hollow",
   "Choked Estuary",
   "Scalding Tarn"
  ]
 },
 {
  "name": "Kindred Dominance",
  "qty": 1,
  "cost": "{5}{B}{B}",
  "mv": 7,
  "type": "Sorcery",
  "cat": "Sorcery",
  "text": "Choose a creature type. Destroy all creatures that aren't of the chosen type.",
  "roles": [
   "evasion",
   "removal"
  ],
  "why": "The deck's own wrath: name Assassin and every creature that isn't one dies. With a type-changer out, all your creatures, stolen 2/2s included, are Assassins and survive while the blockers die. It measured +0.8 / +0.7 over 5,040 bot games, the only card of 22 snowball candidates to beat a basic land.",
  "how": "Cast it with Leyline of Transformation, Arcane Adaptation or Roshan out, then swing into the open board next turn. Without a type-changer, count what you'd lose first.",
  "syn": [
   "Leyline of Transformation",
   "Arcane Adaptation",
   "Roshan, Hidden Magister",
   "Ramses, Assassin Lord",
   "Teferi's Veil",
   "Ashnod's Altar"
  ],
  "warn": "Without a type-changer your face-down 2/2s, Tetsuko, Satoru, Slither Blade, Dark Confidant, Bloodletter, Vito and Bloodthirsty Conqueror die too. Opponents' changelings and indestructible creatures survive."
 },
 {
  "name": "Swamp",
  "qty": 7,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Swamp",
  "cat": "Land",
  "text": "({T}: Add {B}.)",
  "roles": [
   "land"
  ],
  "why": "Seven basic Swamps. They turn on Snuff Out's free cost, Tainted Isle, Drowned Catacomb and Sunken Hollow.",
  "how": "Play them like any land; fetch one early if Snuff Out is in hand.",
  "syn": [
   "Snuff Out",
   "Tainted Isle",
   "Sunken Hollow",
   "Dark Ritual",
   "Marsh Flats"
  ]
 }
];
