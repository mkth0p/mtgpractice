/* The v3 drain list's cards that the heist closer doesn't play: qty 0, shown in the card wiki under their own filter
   ("v3 drain list"), with the v3 site's notes and wiki entries. The v3 list stays playable in the game (MK.CETRATA_DECK). */
window.CETRATA_V3_CARDS = [
 {
  "name": "Marauding Blight-Priest",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Vampire Cleric",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Whenever you gain life, each opponent loses 1 life.",
  "roles": [
   "loop"
  ],
  "why": "A three-mana payoff few people play: whenever you gain life, each opponent loses 1. With Exquisite Blood or Bloodthirsty Conqueror, that loss gains you life again, so it drains the whole table at once. It's the best payoff because it hits every opponent and doesn't target.",
  "how": "Transmute Drift of Phantasms for it, or tutor for it. Cast it a turn early so the drain is the last piece, since a 3-drop draws less attention. Vito's lifelink activation or an attack then starts the loop.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Drift of Phantasms",
   "Vito, Thorn of the Dusk Rose",
   "Bloodletter of Aclazotz"
  ],
  "warn": "A 3/2 dies to almost anything. Don't attack with it into open blockers before the loop is ready."
 },
 {
  "name": "Enduring Tenacity",
  "qty": 0,
  "cost": "{2}{B}{B}",
  "mv": 4,
  "type": "Enchantment Creature — Snake Glimmer",
  "cat": "Creature",
  "pt": "4/3",
  "text": "Whenever you gain life, target opponent loses that much life.\nWhen Enduring Tenacity dies, if it was a creature, return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)",
  "roles": [
   "loop"
  ],
  "why": "A fourth payoff for the vampire court loop that's hard to get rid of: whenever you gain life, target opponent loses that much, so with Exquisite Blood or Bloodthirsty Conqueror it loops like Sanguine Bond. When it dies as a creature it comes back as an enchantment, so creature removal and Toxic Deluge only make it safer.",
  "how": "Transmute Dimir House Guard for it, or cast it free with a bargained Beseech the Mirror. Cast it as a 4/3 blocker on turn 4. If they kill it, it returns as a plain enchantment that still does the loop.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Dimir House Guard",
   "Beseech the Mirror",
   "Culling the Weak",
   "Toxic Deluge"
  ],
  "warn": "It comes back only once: in its enchantment form it isn't a creature, so it can't die again, but enchantment removal, exile or a bounce gets rid of it for good. Like Vito, its trigger targets one opponent."
 },
 {
  "name": "Starscape Cleric",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Bat Cleric",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Offspring {2}{B} (You may pay an additional {2}{B} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\nFlying\nThis creature can't block.\nWhenever you gain life, each opponent loses 1 life.",
  "roles": [
   "loop"
  ],
  "why": "A two-mana Marauding Blight-Priest: whenever you gain life, each opponent loses 1. With Exquisite Blood or Bloodthirsty Conqueror it drains the whole table, and it's the cheapest loop payoff in the deck.",
  "how": "Cast it on turn 2 and attack in the air, or pay the offspring cost later for a second copy that keeps the loop alive if one dies. Transmute Shred Memory or Muddle the Mixture for it when you need the payoff.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Marauding Blight-Priest",
   "Shred Memory",
   "Muddle the Mixture",
   "Tetsuko Umezawa, Fugitive"
  ],
  "warn": "It can't block, so it isn't one of your defenders. A 2/1 dies to every ping and to Toxic Deluge for X=1."
 },
 {
  "name": "Vampire of the Dire Moon",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Vampire",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Deathtouch\nLifelink",
  "roles": [
   "utility",
   "loop"
  ],
  "why": "A turn-1 deathtouch blocker that keeps big attackers off you while you set up. Its lifelink starts the vampire loop when a drain and a payoff are out, and its deathtouch attack triggers Hooded Blightfang.",
  "how": "Play it on turn 1 and leave it home. With Tetsuko out it's unblockable, so on the kill turn it attacks, gains you life and starts the loop.",
  "syn": [
   "Hooded Blightfang",
   "Tetsuko Umezawa, Fugitive",
   "Exquisite Blood",
   "Marauding Blight-Priest",
   "Starscape Cleric"
  ],
  "warn": "It's a 1/1, so any ping or Toxic Deluge for X=1 kills it. It's a Vampire, not an Assassin, so it doesn't trigger Etrata's cloak."
 },
 {
  "name": "Hooded Blightfang",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Snake",
  "cat": "Creature",
  "pt": "1/4",
  "text": "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
  "roles": [
   "utility",
   "loop"
  ],
  "why": "A 1/4 deathtouch wall that also drains. Etrata, Virtus, Bloodthirsty Conqueror, Vampire of the Dire Moon and the Blightfang itself have deathtouch, so every attack with one makes each opponent lose 1 and you gain 1. With a drain and a payoff out, that one attack starts the loop.",
  "how": "Transmute Drift of Phantasms for it or cast it on turn 3 and keep it back as a blocker. On the kill turn, attack with any deathtouch creature: the trigger happens on attack, before blockers, so it doesn't even need to connect.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vampire of the Dire Moon",
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Drift of Phantasms"
  ],
  "warn": "Face-down creatures and cloaks have no abilities, so they don't trigger it. It's not an Assassin, so it doesn't trigger Etrata."
 },
 {
  "name": "Silumgar Assassin",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Creatures with power greater than Silumgar Assassin's power can't block it.\nMegamorph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\nWhen Silumgar Assassin is turned face up, destroy target creature with power 3 or less an opponent controls.",
  "roles": [
   "snowball",
   "removal"
  ],
  "why": "Cast face down for {3}, it's a 2/2 blocker that holds removal: turn it face up for {2}{B} at any time and destroy an opponent's creature with power 3 or less. Turning face up by megamorph is a special action, so nobody can respond to the flip itself. Face up it's an Assassin, so its hits cloak with Etrata.",
  "how": "Cast it face down on turn 3 instead of tapping out for a sorcery-speed play. Flip it when an opponent's attacker or key creature shows up. Etrata's {2}{U}{B} flip also works ({U}{B} with Training Grounds), but only the megamorph flip gives the +1/+1 counter.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Training Grounds",
   "Tetsuko Umezawa, Fugitive",
   "Deadly Rollick"
  ],
  "warn": "The destroy trigger targets, so it can't hit hexproof creatures. With its +1/+1 counter it's a 3/2, so Tetsuko no longer makes it unblockable."
 },
 {
  "name": "Toxic Deluge",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "As an additional cost to cast this spell, pay X life.\nAll creatures get -X/-X until end of turn.",
  "roles": [
   "removal",
   "loop"
  ],
  "why": "Pay X life, all creatures get -X/-X. It resets a board that's racing you, and it's the deck's only sweeper, so it buys the turns the vampire loop and the Manta loop need.",
  "how": "Pick the smallest X that kills what matters. X=3 keeps Etrata (1/4) and Hooded Blightfang (1/4) alive. Enduring Tenacity dies at X=3 or more and comes back as an enchantment, so the wipe costs you nothing there.",
  "syn": [
   "Enduring Tenacity",
   "Hooded Blightfang",
   "Etrata, Deadly Fugitive",
   "Drift of Phantasms"
  ],
  "warn": "Face-down creatures are 2/2s, so X=2 kills your cloaks and a face-down Silumgar Assassin. Vampire of the Dire Moon and Starscape Cleric die at X=1."
 },
 {
  "name": "Scroll of Fate",
  "qty": 0,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Manifest a card from your hand. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  "roles": [
   "snowball",
   "loop"
  ],
  "why": "Tap: manifest a card from your hand. Manifesting Wormfang Manta puts it in face down, so its 'skip your next turn' never triggers, then Etrata flips it for four. It also hides counterspells for Etrata to cast free.",
  "how": "Find it with Drift of Phantasms. On a Manta turn: tap Scroll to manifest the Manta, flip it with Etrata, then bounce it with Crystal Shard for an extra turn. Scroll untaps for the next one.",
  "syn": [
   "Wormfang Manta",
   "Crystal Shard",
   "Etrata, Deadly Fugitive",
   "Training Grounds",
   "Drift of Phantasms"
  ]
 },
 {
  "name": "Wormfang Manta",
  "qty": 0,
  "cost": "{5}{U}{U}",
  "mv": 7,
  "type": "Creature — Nightmare Fish Beast",
  "cat": "Creature",
  "pt": "6/1",
  "text": "Flying\nWhen Wormfang Manta enters, you skip your next turn.\nWhen Wormfang Manta leaves the battlefield, you take an extra turn after this one.",
  "roles": [
   "loop",
   "snowball"
  ],
  "why": "When it leaves the battlefield, you take an extra turn. Manifested with Scroll of Fate, its 'skip your next turn' enters trigger never happens, and Etrata flips it for four. Crystal Shard then bounces it, for an extra turn every turn.",
  "how": "Never cast it normally. Manifest it with Scroll, flip it with Etrata, attack (Tetsuko makes a 6/1 unblockable), then bounce it with Crystal Shard or Otawara. Repeat each extra turn for 5 mana, or 3 with Training Grounds.",
  "syn": [
   "Scroll of Fate",
   "Crystal Shard",
   "Etrata, Deadly Fugitive",
   "Training Grounds",
   "Tetsuko Umezawa, Fugitive",
   "Otawara, Soaring City"
  ],
  "warn": "Cast normally it makes you skip your next turn, which cancels the extra turn. If it leaves while still face down, there's no extra turn."
 },
 {
  "name": "Crystal Shard",
  "qty": 0,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{3}, {T} or {U}, {T}: Return target creature to its owner's hand unless its controller pays {1}.",
  "roles": [
   "loop",
   "utility"
  ],
  "why": "{U}, {T}: return a creature to its owner's hand unless its controller pays {1}. You control the face-up Wormfang Manta, so you choose not to pay, and you take an extra turn. It untaps every turn, so the Manta loop needs only one Shard.",
  "how": "Find it with Drift of Phantasms. On Manta turns, bounce the Manta after combat. On other turns, bounce an opponent's blocker or a creature with an enters trigger they want to reuse at a bad time.",
  "syn": [
   "Wormfang Manta",
   "Scroll of Fate",
   "Etrata, Deadly Fugitive",
   "Drift of Phantasms",
   "Training Grounds"
  ],
  "warn": "Training Grounds doesn't reduce it: it's an artifact's ability, not a creature's. Opponents can pay {1} to keep their creature."
 },
 {
  "name": "Training Grounds",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Activated abilities of creatures you control cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.",
  "roles": [
   "utility",
   "loop"
  ],
  "why": "Activated abilities of your creatures cost up to {2} less. Etrata's flip drops to {U}{B} and Duskmantle Guildmage's drain to {U}{B}. The Manta loop and the Silumgar Assassin flip get much cheaper.",
  "how": "Find it with Vampiric Tutor or Imperial Seal, or cast it on turn 1 or 2. With it out, the Manta loop is {U}{B} for the flip and {U} for Shard, 3 mana a turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Duskmantle Guildmage",
   "Wormfang Manta",
   "Silumgar Assassin",
   "Vito, Thorn of the Dusk Rose"
  ],
  "warn": "It doesn't reduce morph costs, turning up for a mana cost, transmute, or artifact abilities like Crystal Shard."
 },
 {
  "name": "Mindcrank",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Whenever an opponent loses life, that player mills that many cards. (Damage dealt by sources without infect causes loss of life.)",
  "roles": [
   "loop"
  ],
  "why": "Whenever an opponent loses life, they mill that many cards. With Duskmantle Guildmage's first ability active, each milled card costs them 1 life, and the loop runs until they're dead. It's the deck's most common win.",
  "how": "Cast it early: alone it looks harmless. Find it with Tribute Mage, Shred Memory, Muddle the Mixture or Wishclaw Talisman. On the kill turn, resolve the Guildmage's drain and start the loop with any life loss.",
  "syn": [
   "Duskmantle Guildmage",
   "Tribute Mage",
   "Shred Memory",
   "Muddle the Mixture",
   "Bloodletter of Aclazotz",
   "Thief of Sanity"
  ],
  "warn": "Rest in Peace or Leyline of the Void stops the loop: the cards never reach the graveyard. An empty library stops it too."
 },
 {
  "name": "Duskmantle Guildmage",
  "qty": 0,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/2",
  "text": "{1}{U}{B}: Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.\n{2}{U}{B}: Target player mills two cards.",
  "roles": [
   "loop"
  ],
  "why": "Its {1}{U}{B} ability makes each opponent lose 1 life whenever a card goes to their graveyard this turn. With Mindcrank, each loss mills, and each mill loses more life. It's two cheap cards that kill a whole table.",
  "how": "Activate it on an opponent's turn when they cast a spell: the spell going to their graveyard starts the loop. On your turn, start it with combat damage, its {2}{U}{B} mill, or by sacrificing a stolen cloak to Culling the Weak.",
  "syn": [
   "Mindcrank",
   "Training Grounds",
   "Culling the Weak",
   "Changeling Outcast",
   "Thief of Sanity",
   "Shred Memory"
  ],
  "warn": "The first ability doesn't start the loop by itself. It needs a card to go to an opponent's graveyard after it resolves."
 },
 {
  "name": "Thief of Sanity",
  "qty": 0,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Creature — Specter",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Flying\nWhenever Thief of Sanity deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. You may look at and cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any type to cast that spell.",
  "roles": [
   "snowball"
  ],
  "why": "A 2/2 flier: when it hits, you look at the top three cards of that player's library, exile one to cast later and put the other two into their graveyard. You get the best card of three every turn.",
  "how": "Find it with Drift of Phantasms or cast it on turn 3. Attack the player with the most dangerous deck. With Guildmage's drain active, the two cards it bins also start the Mindcrank loop.",
  "syn": [
   "Duskmantle Guildmage",
   "Mindcrank",
   "Tetsuko Umezawa, Fugitive",
   "Drift of Phantasms"
  ],
  "warn": "It's a 2/2 flier, so any flying blocker or removal stops it. It isn't an Assassin, so its hits don't trigger Etrata."
 },
 {
  "name": "Opposition Agent",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Human Rogue",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Flash\nYou control your opponents while they're searching their libraries.\nWhile an opponent is searching their library, they exile each card they find. You may play those cards for as long as they remain exiled, and you may spend mana as though it were mana of any color to cast them.",
  "roles": [
   "snowball",
   "removal"
  ],
  "gc": true,
  "why": "Flash. You control your opponents while they search their libraries, and every card they find is exiled for you to play. Their tutors and fetch lands become yours. With Wishclaw Talisman or Scheming Symmetry, the tutor you hand an opponent ends up working for you.",
  "how": "Flash it in when an opponent casts a tutor or cracks a fetch land, or at the end of a turn before you hand someone Wishclaw. Hold it for the tutor that matters, not the first fetch land.",
  "syn": [
   "Wishclaw Talisman",
   "Scheming Symmetry",
   "Drift of Phantasms",
   "Fierce Guardianship"
  ],
  "warn": "It doesn't stop the search. It only controls it, and the card is exiled for you to play."
 },
 {
  "name": "Notion Thief",
  "qty": 0,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Creature — Human Rogue",
  "cat": "Creature",
  "pt": "3/1",
  "text": "Flash\nIf an opponent would draw a card except the first one they draw in each of their draw steps, instead that player skips that draw and you draw a card.",
  "roles": [
   "snowball",
   "draw"
  ],
  "gc": true,
  "why": "Flash. If an opponent would draw a card except the first one in their draw step, they skip that draw and you draw instead. With Windfall, the whole table discards and you draw every card they would have drawn.",
  "how": "Flash it in at the end of the turn before your Windfall, or in response to an opponent's draw spell. Then cast Windfall: you draw your own new hand plus all of theirs.",
  "syn": [
   "Windfall",
   "Necropotence",
   "Rhystic Study",
   "Dimir House Guard",
   "Mystic Remora"
  ],
  "warn": "Opponents' normal draw step still works. It only steals extra draws."
 },
 {
  "name": "Windfall",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Each player discards their hand, then draws cards equal to the greatest number of cards a player discarded this way.",
  "roles": [
   "draw"
  ],
  "why": "Each player discards their hand, then draws as many cards as the biggest hand discarded. With Notion Thief out, opponents draw nothing and you draw everything.",
  "how": "Cast it when Notion Thief is out, or when your hand is small and the table's hands are big. With Necropotence out, your discarded cards are exiled.",
  "syn": [
   "Notion Thief",
   "Necropotence",
   "Drift of Phantasms"
  ],
  "warn": "Without Notion Thief it refills the opponents too. Don't give a combo player a fresh hand."
 },
 {
  "name": "Black Market Connections",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "At the beginning of your first main phase, choose one or more —\n• Sell Contraband — Create a Treasure token. You lose 1 life.\n• Buy Information — Draw a card. You lose 2 life.\n• Hire a Mercenary — Create a 3/2 colorless Shapeshifter creature token with changeling. You lose 3 life.",
  "roles": [
   "draw",
   "ramp"
  ],
  "why": "Each first main phase, choose one or more: a Treasure for 1 life, a card for 2 life, or a 3/2 changeling Mercenary for 3 life. The Mercenary is an Assassin, so it triggers Etrata.",
  "how": "Find it with Drift of Phantasms. Early, take the card and the Treasure. Late, add a Mercenary when you need another Assassin to attack.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Beseech the Mirror",
   "Exquisite Blood"
  ],
  "warn": "The life adds up. Watch your total with Necropotence and painlands."
 },
 {
  "name": "Necropotence",
  "qty": 0,
  "cost": "{B}{B}{B}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Skip your draw step.\nWhenever you discard a card, exile that card from your graveyard.\nPay 1 life: Exile the top card of your library face down. Put that card into your hand at the beginning of your next end step.",
  "roles": [
   "draw"
  ],
  "gc": true,
  "why": "Pay 1 life: exile your top card face down, and it goes to your hand at your next end step. It turns your 40 life into as many cards as you need to assemble a combo. Exquisite Blood and Bloodthirsty Conqueror refill the life later.",
  "how": "Cast it on turn 1 or 2 off Dark Ritual if you can. Pay life before your end step begins to dig for the missing piece: the cards arrive as it starts. Keep 10 or more life for safety.",
  "syn": [
   "Dark Ritual",
   "Windfall",
   "Vampiric Tutor",
   "Imperial Seal",
   "Exquisite Blood"
  ],
  "warn": "You skip your draw step, and the cards only arrive at your end step, so you can't use them that turn."
 },
 {
  "name": "Phyrexian Arena",
  "qty": 0,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "At the beginning of your upkeep, you draw a card and you lose 1 life.",
  "roles": [
   "draw"
  ],
  "why": "An extra card every turn for 1 life, with no more mana to spend. Added in v3's third round: in bot games the slower theft spells did less than a steady extra card.",
  "how": "Cast it on turn 2 or 3 off a rock or Dark Ritual. Drift of Phantasms can transmute for it. With Vampiric Tutor or Imperial Seal, the card you put on top arrives in your upkeep, before your draw step.",
  "syn": [
   "Necropotence",
   "Vampiric Tutor",
   "Imperial Seal",
   "Drift of Phantasms",
   "Dark Ritual"
  ],
  "warn": "You lose the life, not an opponent, so it never starts the vampire loop: Exquisite Blood and Bloodthirsty Conqueror only see opponents losing life. Count it with Necropotence and the painlands."
 },
 {
  "name": "Ponder",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Look at the top three cards of your library, then put them back in any order. You may shuffle.\nDraw a card.",
  "roles": [
   "draw"
  ],
  "why": "Look at the top three, reorder or shuffle, then draw. Cheap selection toward a combo piece.",
  "how": "Cast it early when your hand has a gap. Shuffle if none of the three helps.",
  "syn": [
   "Vampiric Tutor",
   "Imperial Seal"
  ]
 },
 {
  "name": "Night's Whisper",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "You draw two cards and you lose 2 life.",
  "roles": [
   "draw"
  ],
  "why": "Two mana, two cards, two life.",
  "how": "Cast it on turn 2 or 3 when there's nothing better, or late to refill.",
  "syn": [
   "Shred Memory",
   "Muddle the Mixture"
  ]
 },
 {
  "name": "Beseech the Mirror",
  "qty": 0,
  "cost": "{1}{B}{B}{B}",
  "mv": 4,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nSearch your library for a card, exile it face down, then shuffle. If this spell was bargained, you may cast the exiled card without paying its mana cost if that spell's mana value is 4 or less. Put the exiled card into your hand if it wasn't cast this way.",
  "roles": [
   "tutor"
  ],
  "why": "Search for any card and exile it. If you bargained (sacrificed an artifact, enchantment or token), you may cast it free if its mana value is 4 or less. It fetches and casts Bloodletter, Enduring Tenacity, Notion Thief, Mindcrank, Guildmage, Blight-Priest or Starscape Cleric in one spell.",
  "how": "Bargain a Treasure or a spent rock, then cast Bloodletter free on the kill turn. Without the free cast, the card goes to your hand like a Demonic Tutor.",
  "syn": [
   "Bloodletter of Aclazotz",
   "Enduring Tenacity",
   "Black Market Connections",
   "Notion Thief",
   "Mind Stone"
  ],
  "warn": "Exquisite Blood and Bloodthirsty Conqueror have mana value 5, too big for the free cast."
 },
 {
  "name": "Lim-Dûl's Vault",
  "qty": 0,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Look at the top five cards of your library. As many times as you choose, you may pay 1 life, put those cards on the bottom of your library in any order, then look at the top five cards of your library. Then shuffle and put the last cards you looked at this way on top in any order.",
  "roles": [
   "tutor"
  ],
  "why": "Look at the top five, and keep paying 1 life to look at the next five. Then put the five you chose on top in any order. An instant tutor that also sets up your next draws.",
  "how": "Cast it at the end of an opponent's turn and dig for the missing piece. With Necropotence, you can draw those cards right away.",
  "syn": [
   "Necropotence",
   "Brainstorm",
   "Shred Memory"
  ]
 },
 {
  "name": "Scheming Symmetry",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Choose two target players. Each of them searches their library for a card, then shuffles and puts that card on top.",
  "roles": [
   "tutor"
  ],
  "why": "One mana: two target players each put any card from their library on top. You find a combo piece, and an opponent gets a tutor too.",
  "how": "Pick the opponent least able to win with it. Better: target the opponent Opposition Agent is watching, and the card they find is exiled for you.",
  "syn": [
   "Opposition Agent",
   "Brainstorm",
   "Necropotence"
  ],
  "warn": "It helps an opponent. Never give it to a player close to winning."
 },
 {
  "name": "Wishclaw Talisman",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Wishclaw Talisman enters with three wish counters on it.\n{1}, {T}, Remove a wish counter from Wishclaw Talisman: Search your library for a card, put it into your hand, then shuffle. An opponent gains control of Wishclaw Talisman. Activate only during your turn.",
  "roles": [
   "tutor"
  ],
  "why": "{1}, {T}: search for any card, then an opponent gains control of the Talisman. It's a tutor on your turn and a deal with the devil after.",
  "how": "Use it on the turn you go off, so the opponent's turn doesn't matter. With Opposition Agent out, the opponent's search with it is yours to control.",
  "syn": [
   "Opposition Agent",
   "Tribute Mage",
   "Mindcrank",
   "Shred Memory"
  ],
  "warn": "Don't give it to a combo player who can win with one tutor."
 },
 {
  "name": "Tribute Mage",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/2",
  "text": "When Tribute Mage enters, you may search your library for an artifact card with mana value 2, reveal that card, put it into your hand, then shuffle.",
  "roles": [
   "tutor"
  ],
  "why": "When it enters, you may search for an artifact with mana value 2. That's Mindcrank or Wishclaw Talisman, or a Signet when you need mana.",
  "how": "Cast it on turn 3 for Mindcrank if you have Guildmage, or for Wishclaw on the combo turn.",
  "syn": [
   "Mindcrank",
   "Wishclaw Talisman",
   "Dimir Signet",
   "Arcane Signet",
   "Drift of Phantasms"
  ]
 },
 {
  "name": "Shred Memory",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Exile up to four target cards from a single graveyard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
  "roles": [
   "tutor",
   "utility"
  ],
  "why": "Transmute for {1}{B}{B} to find any card with mana value 2: Mindcrank, Duskmantle Guildmage, Tetsuko, Starscape Cleric or Silumgar Assassin. Cast normally, it exiles up to four cards from one graveyard.",
  "how": "Transmute it on turn 2 or 3 for the missing Mindcrank piece. Keep it as graveyard hate against reanimator decks.",
  "syn": [
   "Mindcrank",
   "Duskmantle Guildmage",
   "Tetsuko Umezawa, Fugitive",
   "Demonic Tutor",
   "Wishclaw Talisman",
   "Starscape Cleric"
  ]
 },
 {
  "name": "Muddle the Mixture",
  "qty": 0,
  "cost": "{U}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target instant or sorcery spell.\nTransmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
  "roles": [
   "tutor",
   "removal"
  ],
  "why": "Either a counterspell for an instant or sorcery, or a transmute for {1}{U}{U} to find a mana value 2 card: Mindcrank, Guildmage, Tetsuko, Starscape Cleric or Silumgar Assassin.",
  "how": "Transmute it early for the missing combo piece. Later, hold {U}{U} to counter a wipe or a tutor.",
  "syn": [
   "Mindcrank",
   "Duskmantle Guildmage",
   "Tetsuko Umezawa, Fugitive",
   "Counterspell",
   "Demonic Tutor",
   "Silumgar Assassin"
  ]
 },
 {
  "name": "Drift of Phantasms",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Creature — Spirit",
  "cat": "Creature",
  "pt": "0/5",
  "text": "Defender (This creature can't attack.)\nFlying\nTransmute {1}{U}{U} ({1}{U}{U}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
  "roles": [
   "tutor"
  ],
  "why": "Transmute for {1}{U}{U} to find any card with mana value 3: Scroll of Fate, Crystal Shard, Virtus, Vito, Blight-Priest, Hooded Blightfang or Toxic Deluge. Cast, it's a 0/5 flying wall.",
  "how": "Transmute it for the piece of the line you're closest to. Cast it as a blocker against aggressive fliers.",
  "syn": [
   "Scroll of Fate",
   "Crystal Shard",
   "Marauding Blight-Priest",
   "Vito, Thorn of the Dusk Rose",
   "Virtus the Veiled",
   "Hooded Blightfang"
  ]
 },
 {
  "name": "Dimir House Guard",
  "qty": 0,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Creature — Skeleton",
  "cat": "Creature",
  "pt": "2/3",
  "text": "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSacrifice a creature: Regenerate Dimir House Guard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
  "roles": [
   "tutor"
  ],
  "why": "Transmute for {1}{B}{B} to find any card with mana value 4: Bloodletter, Enduring Tenacity, Notion Thief, Beseech the Mirror, Deadly Rollick or Aetherize. Cast, it's a 2/3 with fear that regenerates by sacrificing a creature.",
  "how": "Transmute it for Bloodletter on the turn before the double tap, or for Enduring Tenacity when you have a drain. As a creature, it protects itself by sacrificing a cloak.",
  "syn": [
   "Bloodletter of Aclazotz",
   "Enduring Tenacity",
   "Notion Thief",
   "Beseech the Mirror"
  ]
 },
 {
  "name": "Counterspell",
  "qty": 0,
  "cost": "{U}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target spell.",
  "roles": [
   "removal"
  ],
  "why": "Two mana, counter any spell. It protects the combo turn and stops an opponent's win.",
  "how": "Keep {U}{U} up on the turn you go off, or when an opponent is about to win. Don't spend it on an average creature.",
  "syn": [
   "Scroll of Fate",
   "Etrata, Deadly Fugitive",
   "Muddle the Mixture"
  ]
 },
 {
  "name": "An Offer You Can't Refuse",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target noncreature spell. Its controller creates two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  "roles": [
   "removal"
  ],
  "why": "One mana to counter a noncreature spell. The opponent gets two Treasures, which matters early and hardly at all on the turn you win.",
  "how": "Use it on the combo turn or against a game-ending spell. You can also counter your own unimportant spell for two Treasures.",
  "syn": [
   "Beseech the Mirror",
   "Fierce Guardianship"
  ],
  "warn": "Two Treasures can speed an opponent up a lot in the early turns."
 },
 {
  "name": "Aetherize",
  "qty": 0,
  "cost": "{3}{U}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Return all attacking creatures to their owner's hand.",
  "roles": [
   "removal"
  ],
  "why": "Every attacking creature goes back to its owner's hand, and tokens that leave the battlefield cease to exist. A one-card answer to a big attack from a Bracket 4 aggro deck or a token deck. Added in v3's third round.",
  "how": "Hold {3}{U} on an opponent's turn and cast it after attackers are declared, ideally when they've swung most of their board at you. Dimir House Guard can transmute for it.",
  "syn": [
   "Dimir House Guard",
   "Counterspell",
   "Cyclonic Rift"
  ],
  "warn": "It hits every attacking creature, so don't cast it on your own turn while you're attacking. It only answers creatures that are already attacking: it doesn't stop a combo."
 },
 {
  "name": "Dimir Signet",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{1}, {T}: Add {U}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "Pay {1} and tap for {U}{B}: both of Etrata's colors at once.",
  "how": "Turn 2 play. On turn 3 it gives Etrata plus a one-drop from three lands.",
  "syn": [
   "Tribute Mage",
   "Etrata, Deadly Fugitive",
   "Training Grounds"
  ]
 },
 {
  "name": "Fellwar Stone",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add one mana of any color that a land an opponent controls could produce.",
  "roles": [
   "ramp"
  ],
  "why": "A two-mana rock that makes any color an opponent's land could make. At most tables that includes blue or black.",
  "how": "Turn 2 play. Check what your opponents' lands produce first.",
  "syn": [
   "Tribute Mage",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "Against colorless or off-color mana bases it may only make {C}, or nothing."
 },
 {
  "name": "Mind Stone",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}.\n{1}, {T}, Sacrifice Mind Stone: Draw a card.",
  "roles": [
   "ramp",
   "draw"
  ],
  "why": "A two-mana rock you can cash in for a card when the mana is no longer needed.",
  "how": "Turn 2 play. Late, pay {1}, tap and sacrifice it to draw.",
  "syn": [
   "Tribute Mage",
   "Beseech the Mirror"
  ]
 },
 {
  "name": "Culling the Weak",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "As an additional cost to cast this spell, sacrifice a creature.\nAdd {B}{B}{B}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "Sacrifice a creature: add {B}{B}{B}{B}. Sacrifice a stolen cloak and the card goes to its owner's graveyard, which starts the Mindcrank loop with Guildmage active. Sacrifice a face-up Wormfang Manta and you get an extra turn too.",
  "how": "Sacrificing Enduring Tenacity while it's a creature brings it back as an enchantment. Hold it for the turn it wins: casting Exquisite Blood out of nowhere, or turning a cloak into both mana and a loop starter. Early, sacrifice Changeling Outcast or a cloak you don't need for a fast Etrata plus a 2-drop.",
  "syn": [
   "Wormfang Manta",
   "Duskmantle Guildmage",
   "Mindcrank",
   "Dark Ritual",
   "Changeling Outcast",
   "Enduring Tenacity"
  ],
  "warn": "The sacrifice is part of the cost. If it's countered, the creature is still gone."
 },
 {
  "name": "Gloomlake Verge",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {U}.\n{T}: Add {B}. Activate only if you control an Island or a Swamp.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U}, and for {B} if you control an Island or a Swamp. Always untapped.",
  "how": "Play it with a basic or a typed dual already down.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers",
   "Island",
   "Swamp"
  ]
 },
 {
  "name": "Otawara, Soaring City",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Legendary Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {U}.\nChannel — {3}{U}, Discard Otawara, Soaring City: Return target artifact, creature, enchantment, or planeswalker to its owner's hand. This ability costs {1} less to activate for each legendary creature you control.",
  "roles": [
   "land",
   "removal"
  ],
  "why": "A land that taps for {U} and can channel to bounce an artifact, creature, enchantment or planeswalker. Bouncing your own face-up Wormfang Manta gives an extra turn.",
  "how": "Play it as a land unless you need the bounce. Channel costs {1} less per legendary creature you control.",
  "syn": [
   "Wormfang Manta",
   "Etrata, Deadly Fugitive",
   "Tetsuko Umezawa, Fugitive",
   "Vito, Thorn of the Dusk Rose"
  ]
 },
 {
  "name": "Takenuma, Abandoned Mire",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Legendary Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {B}.\nChannel — {3}{B}, Discard Takenuma, Abandoned Mire: Mill three cards, then return a creature or planeswalker card from your graveyard to your hand. This ability costs {1} less to activate for each legendary creature you control.",
  "roles": [
   "land",
   "utility"
  ],
  "why": "A land that taps for {B} and can channel to mill three and return a creature card from your graveyard to your hand. It brings back a dead combo creature.",
  "how": "Play it as a land unless a combo creature is in your graveyard. Channel costs {1} less per legendary creature you control.",
  "syn": [
   "Wormfang Manta",
   "Starscape Cleric",
   "Marauding Blight-Priest",
   "Etrata, Deadly Fugitive"
  ]
 }
];
window.CETRATA_V3_WIKI = {
 "Marauding Blight-Priest": {
  "rating": 5,
  "when": "Turns 3-5",
  "tags": [
   "combo piece",
   "3-drop",
   "vampire",
   "vampire court",
   "underplayed"
  ],
  "rulings": [
   {
    "q": "Does it trigger once per point of life gained?",
    "a": "No, once per life gain event. Gaining 5 life at once makes each opponent lose 1. With <i-c>Exquisite Blood</i-c>, every opponent's loss is its own event, so the loop still grows."
   },
   {
    "q": "Does it target?",
    "a": "No. 'Each opponent' doesn't target, so hexproof players still lose life."
   }
  ],
  "tips": [
   "It's a Vampire, so <i-c>Path of Ancestry</i-c> scries when you cast it.",
   "Without a drain, it still punishes life gain from <i-c>Vito, Thorn of the Dusk Rose</i-c>'s lifelink."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Starscape Cleric"
  ]
 },
 "Enduring Tenacity": {
  "rating": 4,
  "when": "Turn 4, or the combo turn",
  "tags": [
   "combo piece",
   "enchantment creature",
   "vampire court",
   "recursive",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Does it loop with Exquisite Blood like Sanguine Bond?",
    "a": "Yes. Its first ability is the same as <i-c>Sanguine Bond</i-c>'s: whenever you gain life, target opponent loses that much. <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> gains it back, and it repeats. Pick a new target as each player dies."
   },
   {
    "q": "What happens when it dies?",
    "a": "If it was a creature when it died, it returns to the battlefield as an enchantment that isn't a creature. It keeps its lifegain trigger, so the loop still works."
   },
   {
    "q": "Does it come back a second time?",
    "a": "No. In its enchantment form it isn't a creature, so it can't die, and if it goes to the graveyard some other way its 'if it was a creature' check fails. If it's exiled or bounced, it doesn't come back at all."
   },
   {
    "q": "Does it return if Toxic Deluge kills it?",
    "a": "Yes. -X/-X makes it die as a creature, so it returns as an enchantment. Your own wipe costs you nothing here."
   }
  ],
  "tips": [
   "Sacrifice it to <i-c>Culling the Weak</i-c> for {B}{B}{B}{B}; it comes back as an enchantment and keeps the loop ready.",
   "<i-c>Dimir House Guard</i-c> can transmute for it, and a bargained <i-c>Beseech the Mirror</i-c> casts it free."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Culling the Weak"
  ]
 },
 "Starscape Cleric": {
  "rating": 4,
  "when": "Turn 2, or with offspring on turn 5",
  "tags": [
   "combo piece",
   "2-drop",
   "flying",
   "offspring",
   "vampire court",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Does it loop with Exquisite Blood?",
    "a": "Yes, exactly like <i-c>Marauding Blight-Priest</i-c>. Each gain makes each opponent lose 1, each of those losses is a separate Exquisite Blood trigger, and each gain triggers the Cleric again."
   },
   {
    "q": "How does offspring work?",
    "a": "As you cast it, you may pay {2}{B} more. If you do, when it enters you create a 1/1 token copy of it. The token has the same lifegain trigger, so two Clerics drain each opponent for 2 per gain."
   },
   {
    "q": "Is it a Vampire?",
    "a": "No. It's a Bat Cleric, so <i-c>Path of Ancestry</i-c> doesn't scry off it."
   },
   {
    "q": "Does its trigger target?",
    "a": "No. 'Each opponent' doesn't target, so hexproof players still lose life."
   }
  ],
  "tips": [
   "It can't block, so it's not one of your early defenders. Cast it when you have a blocker out already, or pay offspring later for a backup payoff.",
   "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> can transmute for it."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror"
  ]
 },
 "Vampire of the Dire Moon": {
  "rating": 3,
  "when": "Turn 1",
  "tags": [
   "1-drop",
   "vampire",
   "deathtouch",
   "lifelink",
   "blocker",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Does its lifelink start the vampire loop?",
    "a": "Yes, with a drain and a payoff out. When it deals damage you gain that much life, which triggers your payoff; the opponent's loss then triggers <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>, and it repeats."
   },
   {
    "q": "Does it trigger Hooded Blightfang?",
    "a": "Yes. It's a creature you control with deathtouch, so when it attacks, each opponent loses 1 and you gain 1."
   },
   {
    "q": "Is it an Assassin?",
    "a": "No, just a Vampire, so its hits don't trigger Etrata's cloak."
   }
  ],
  "tips": [
   "Keep it home early: a 1/1 deathtouch blocker makes opponents think twice about attacking with their biggest creature.",
   "With <i-c>Tetsuko Umezawa, Fugitive</i-c> it's unblockable, and it's a Vampire for <i-c>Path of Ancestry</i-c>."
  ],
  "combos": [
   "Hooded Blightfang",
   "Exquisite Blood",
   "Tetsuko Umezawa, Fugitive"
  ]
 },
 "Hooded Blightfang": {
  "rating": 3,
  "when": "Turn 3",
  "tags": [
   "3-drop",
   "deathtouch",
   "blocker",
   "drain",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Which creatures trigger it?",
    "a": "Any creature you control with deathtouch as it attacks: Etrata, <i-c>Virtus the Veiled</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Vampire of the Dire Moon</i-c> and the Blightfang itself. Face-down creatures have no abilities, so they don't."
   },
   {
    "q": "Does the attacker need to connect?",
    "a": "No. It triggers when the creature is declared as an attacker, before blockers. Each opponent loses 1 and you gain 1 even if the attack is blocked."
   },
   {
    "q": "Does it start the vampire loop?",
    "a": "Yes, with a drain and a payoff out. The 1 life you gain triggers the payoff, and each opponent's loss triggers <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>."
   },
   {
    "q": "What about the planeswalker clause?",
    "a": "If one of your deathtouch creatures deals any damage to a planeswalker, that planeswalker is destroyed."
   }
  ],
  "tips": [
   "A 1/4 deathtouch body blocks almost anything early. Leave it home and let your other deathtouch creatures do the attacking.",
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  "combos": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vampire of the Dire Moon"
  ]
 },
 "Silumgar Assassin": {
  "rating": 4,
  "when": "Turn 3 face down, flip when they commit a threat",
  "tags": [
   "2-drop",
   "assassin",
   "megamorph",
   "removal",
   "blocker",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Can opponents respond to the megamorph flip?",
    "a": "No. Turning a card face up by paying its megamorph cost is a special action that doesn't use the stack. The 'destroy target creature' trigger does use the stack, so they can respond to that."
   },
   {
    "q": "Can I flip it with Etrata's ability instead?",
    "a": "Yes. Her {2}{U}{B} ability ({U}{B} with <i-c>Training Grounds</i-c>) turns it face up and the destroy trigger still happens. It's an activated ability, so it uses the stack, and only the megamorph flip gives the +1/+1 counter."
   },
   {
    "q": "What can it destroy?",
    "a": "One creature with power 3 or less that an opponent controls, chosen as the trigger goes on the stack. It's a 'destroy', so indestructible creatures survive."
   },
   {
    "q": "Does Training Grounds reduce the megamorph cost?",
    "a": "No. Megamorph is a special action, not an activated ability."
   },
   {
    "q": "Is it unblockable with Tetsuko?",
    "a": "Face up as a 2/1, yes. With the +1/+1 counter it's a 3/2, so Tetsuko no longer helps. Its own text still stops creatures with more power from blocking it."
   }
  ],
  "tips": [
   "Cast it face down on turn 3 instead of tapping out: it's a 2/2 blocker and instant-speed removal for {2}{B}.",
   "Face up it's an Assassin, so its hits trigger Etrata's cloak."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Training Grounds"
  ]
 },
 "Toxic Deluge": {
  "rating": 4,
  "when": "When behind on board",
  "tags": [
   "board wipe",
   "flexible",
   "3-drop"
  ],
  "rulings": [
   {
    "q": "Does it kill indestructible creatures?",
    "a": "Yes. A creature with 0 or less toughness is put into the graveyard even if it's indestructible."
   },
   {
    "q": "Does -X/-X last?",
    "a": "Until end of turn. It only affects creatures on the battlefield when it resolves."
   }
  ],
  "tips": [
   "<i-c>Drift of Phantasms</i-c> can transmute for it.",
   "With <i-c>Exquisite Blood</i-c> out, the life you paid comes back fast once the loop starts.",
   "<i-c>Enduring Tenacity</i-c> dies to it as a creature and comes back as an enchantment, so it survives your own wipe."
  ],
  "combos": [
   "Enduring Tenacity",
   "Hooded Blightfang"
  ]
 },
 "Scroll of Fate": {
  "rating": 4,
  "when": "Turns 3-4",
  "tags": [
   "manifest",
   "artifact",
   "infinite turns"
  ],
  "rulings": [
   {
    "q": "Can I manifest a noncreature card?",
    "a": "Yes, any card. A noncreature card can only be turned face up with Etrata's ability. Instants and sorceries are exiled and cast for free instead."
   },
   {
    "q": "Can I use it the turn it enters?",
    "a": "Yes. It's an artifact, not a creature, so summoning sickness doesn't apply."
   },
   {
    "q": "Does manifesting count as the card entering the battlefield?",
    "a": "Yes, but face down, as a 2/2 with no abilities. Wormfang Manta's enters trigger doesn't exist face down, and turning it face up later isn't entering."
   }
  ],
  "tips": [
   "A manifested creature card can turn face up for its mana cost as well. The Manta costs 7 that way, so use Etrata's ability.",
   "Manifest a <i-c>Counterspell</i-c>, then flip it with Etrata in response to a spell to cast it free."
  ],
  "combos": [
   "Wormfang Manta",
   "Crystal Shard",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Wormfang Manta": {
  "rating": 5,
  "when": "Combo turn, with Scroll and Shard",
  "tags": [
   "combo piece",
   "extra turns",
   "manifest",
   "flying"
  ],
  "rulings": [
   {
    "q": "Why doesn't manifesting it make me skip a turn?",
    "a": "It enters face down, as a 2/2 with no abilities, so the enters trigger doesn't exist. Turning it face up isn't entering the battlefield."
   },
   {
    "q": "Does the extra turn still happen when a face-up Manta leaves?",
    "a": "Yes. Its leaves-the-battlefield trigger looks back at it while it was face up. Bounce, sacrifice, destroy or exile all count."
   },
   {
    "q": "Does a wipe give me an extra turn?",
    "a": "Yes, if the Manta is face up when it dies."
   }
  ],
  "tips": [
   "Sacrifice a face-up Manta to <i-c>Culling the Weak</i-c> or <i-c>Diabolic Intent</i-c> for an extra turn on top of the effect.",
   "<i-c>Takenuma, Abandoned Mire</i-c> can return it from your graveyard to your hand."
  ],
  "combos": [
   "Scroll of Fate",
   "Crystal Shard",
   "Etrata, Deadly Fugitive"
  ]
 },
 "Crystal Shard": {
  "rating": 4,
  "when": "Turns 3-5",
  "tags": [
   "artifact",
   "bounce",
   "infinite turns"
  ],
  "rulings": [
   {
    "q": "Who decides whether to pay {1}?",
    "a": "The creature's controller. For your own Manta, you just don't pay."
   },
   {
    "q": "Where does a stolen cloak go if I bounce it?",
    "a": "To its owner's hand, so it goes back to the opponent."
   }
  ],
  "tips": [
   "A face-down creature that leaves the battlefield is revealed, so bouncing a cloak shows everyone what it was."
  ],
  "combos": [
   "Wormfang Manta",
   "Scroll of Fate"
  ]
 },
 "Training Grounds": {
  "rating": 4,
  "when": "Turns 1-3",
  "tags": [
   "cost reduction",
   "1-drop",
   "enchantment",
   "underplayed"
  ],
  "rulings": [
   {
    "q": "Does it reduce Etrata's granted ability?",
    "a": "Yes. The ability belongs to the face-down creature, a creature you control. {2}{U}{B} becomes {U}{B}."
   },
   {
    "q": "Does it reduce morph?",
    "a": "No. Morph is a special action, not an activated ability. <i-c>Silumgar Assassin</i-c>'s megamorph {2}{B} stays {2}{B}; flip it with Etrata's ability for {U}{B} instead if you don't need the counter."
   },
   {
    "q": "Can it reduce colored mana?",
    "a": "No. It only reduces generic mana, and never below one mana in total."
   }
  ],
  "tips": [
   "<i-c>Vito, Thorn of the Dusk Rose</i-c>'s lifelink ability drops to {1}{B}{B}."
  ],
  "combos": [
   "Etrata, Deadly Fugitive",
   "Wormfang Manta",
   "Silumgar Assassin",
   "Duskmantle Guildmage"
  ]
 },
 "Mindcrank": {
  "rating": 5,
  "when": "Turns 2-4",
  "tags": [
   "combo piece",
   "artifact",
   "2-drop",
   "mill"
  ],
  "rulings": [
   {
    "q": "Does paying life count?",
    "a": "Yes. Paying life is losing life, so an opponent who pays life mills that many cards."
   },
   {
    "q": "What happens when the library runs out?",
    "a": "The loop stops, because milling from an empty library puts nothing into the graveyard. The player only loses the next time they would draw, unless their life is already 0."
   },
   {
    "q": "Does it trigger for each opponent?",
    "a": "Yes, for whichever opponent lost life. Each one needs their own starting event."
   }
  ],
  "tips": [
   "With <i-c>Bloodletter of Aclazotz</i-c> out on your turn, every loss and every mill is doubled."
  ],
  "combos": [
   "Duskmantle Guildmage"
  ]
 },
 "Duskmantle Guildmage": {
  "rating": 5,
  "when": "The turn you go off, often an opponent's",
  "tags": [
   "combo piece",
   "instant speed",
   "2-drop"
  ],
  "rulings": [
   {
    "q": "Does the effect end if Guildmage dies?",
    "a": "No. Once the first ability resolves, the effect lasts for the rest of the turn."
   },
   {
    "q": "Does it hit every opponent?",
    "a": "The effect covers every opponent. Each one starts losing life when a card goes to their own graveyard."
   },
   {
    "q": "Does a spell they cast count?",
    "a": "Yes. When an instant or sorcery resolves, it's put into its owner's graveyard, so the loop starts."
   }
  ],
  "tips": [
   "With <i-c>Training Grounds</i-c> the drain costs {U}{B} and the mill costs {U}{B}.",
   "A stolen card that dies goes to its owner's graveyard, which starts the loop on that player."
  ],
  "combos": [
   "Mindcrank"
  ]
 },
 "Thief of Sanity": {
  "rating": 3,
  "when": "Turn 3",
  "tags": [
   "theft",
   "flying",
   "3-drop"
  ],
  "rulings": [
   {
    "q": "Can I play a land I exiled with it?",
    "a": "No. It only lets you cast the card, so a land stays in exile."
   },
   {
    "q": "Can I spend any mana on the stolen card?",
    "a": "Yes. You may spend mana as though it were mana of any type to cast it."
   }
  ],
  "tips": [
   "<i-c>Tetsuko Umezawa, Fugitive</i-c> doesn't help it (it's a 2/2), but it flies, so it often connects anyway."
  ],
  "combos": []
 },
 "Opposition Agent": {
  "rating": 4,
  "when": "Instant speed, in response to a search",
  "tags": [
   "game changer",
   "flash",
   "theft",
   "rogue"
  ],
  "rulings": [
   {
    "q": "Can I make them find nothing?",
    "a": "Yes, when they search for a card with a stated quality, like 'an Island card'. You can always choose to fail to find."
   },
   {
    "q": "Can I play a land they found?",
    "a": "Yes, but only as your land play, during your turn with a land play left."
   },
   {
    "q": "What about colored mana for their spells?",
    "a": "You may spend mana as though it were mana of any color to cast the exiled cards."
   }
  ],
  "tips": [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  "combos": [
   "Wishclaw Talisman",
   "Scheming Symmetry"
  ]
 },
 "Notion Thief": {
  "rating": 4,
  "when": "Instant speed, before Windfall",
  "tags": [
   "game changer",
   "flash",
   "card draw",
   "rogue"
  ],
  "rulings": [
   {
    "q": "With Windfall, what do opponents end up with?",
    "a": "No hand. They discard everything, and every card they would draw is replaced by you drawing."
   },
   {
    "q": "Does it stop their first draw each turn?",
    "a": "No. Only the first card in each of their draw steps is safe."
   }
  ],
  "tips": [
   "<i-c>Dimir House Guard</i-c> can transmute for it."
  ],
  "combos": [
   "Windfall"
  ]
 },
 "Windfall": {
  "rating": 3,
  "when": "With Notion Thief",
  "tags": [
   "wheel",
   "card draw",
   "sorcery"
  ],
  "rulings": [
   {
    "q": "Does Notion Thief steal all their draws?",
    "a": "Yes. None of these draws is the first in their draw step, so each is replaced by you drawing."
   },
   {
    "q": "How many do I draw for myself?",
    "a": "The greatest number discarded by any player. You draw that many, plus every card stolen with Notion Thief."
   }
  ],
  "tips": [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  "combos": [
   "Notion Thief"
  ]
 },
 "Black Market Connections": {
  "rating": 4,
  "when": "Turn 3",
  "tags": [
   "enchantment",
   "card draw",
   "treasure",
   "changeling"
  ],
  "rulings": [
   {
    "q": "Can I choose all three modes?",
    "a": "Yes. 'One or more' lets you pick any combination, for 6 life in total."
   },
   {
    "q": "Is the Mercenary token an Assassin?",
    "a": "Yes. Changeling makes it every creature type."
   }
  ],
  "tips": [
   "Treasures are artifacts, so they pay for <i-c>Beseech the Mirror</i-c>'s bargain."
  ],
  "combos": []
 },
 "Necropotence": {
  "rating": 5,
  "when": "Turns 1-3",
  "tags": [
   "game changer",
   "enchantment",
   "card draw"
  ],
  "rulings": [
   {
    "q": "When do the cards come to my hand?",
    "a": "At the beginning of your next end step. Paying life in an opponent's turn still gives you the cards at your own end step."
   },
   {
    "q": "What happens to cards I discard?",
    "a": "They're exiled from your graveyard."
   }
  ],
  "tips": [
   "After <i-c>Vampiric Tutor</i-c> or <i-c>Imperial Seal</i-c>, pay 1 life to take the card off the top."
  ],
  "combos": []
 },
 "Phyrexian Arena": {
  "rating": 3,
  "when": "Turns 2-4",
  "tags": [
   "enchantment",
   "card draw",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "Does it work with Necropotence?",
    "a": "Yes. Necropotence skips your draw step, but Arena draws at the beginning of your upkeep, which is a different step."
   },
   {
    "q": "Does its life loss start the vampire loop?",
    "a": "No. You lose the life. <i-c>Exquisite Blood</i-c> and <i-c>Bloodthirsty Conqueror</i-c> only trigger when an opponent loses life."
   }
  ],
  "tips": [
   "After <i-c>Vampiric Tutor</i-c> or <i-c>Imperial Seal</i-c>, Arena draws the card in your upkeep, before your draw step.",
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  "combos": []
 },
 "Ponder": {
  "rating": 2,
  "when": "Turns 1-3",
  "tags": [
   "cantrip",
   "sorcery"
  ],
  "rulings": [
   {
    "q": "Can I shuffle after seeing the cards?",
    "a": "Yes. You put them back in any order, then you may shuffle, then you draw."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Night's Whisper": {
  "rating": 2,
  "when": "Turns 2-4",
  "tags": [
   "card draw",
   "sorcery"
  ],
  "rulings": [
   {
    "q": "Can I target an opponent?",
    "a": "No. You draw and you lose the life."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Beseech the Mirror": {
  "rating": 4,
  "when": "Kill turn",
  "tags": [
   "tutor",
   "bargain",
   "free spell"
  ],
  "rulings": [
   {
    "q": "Does the free cast follow the card's normal timing?",
    "a": "No. You cast it while Beseech resolves, so timing restrictions are ignored. You still pay additional costs."
   },
   {
    "q": "What if the card has mana value 5 or more?",
    "a": "It goes to your hand."
   }
  ],
  "tips": [
   "<i-c>Dimir House Guard</i-c> can transmute for it."
  ],
  "combos": []
 },
 "Lim-Dûl's Vault": {
  "rating": 3,
  "when": "End of an opponent's turn",
  "tags": [
   "tutor",
   "instant"
  ],
  "rulings": [
   {
    "q": "Does it shuffle?",
    "a": "Yes. After you stop, you shuffle and put the last five you looked at on top in any order."
   }
  ],
  "tips": [
   "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> can transmute for it."
  ],
  "combos": []
 },
 "Scheming Symmetry": {
  "rating": 3,
  "when": "Turns 1-3, or with Opposition Agent",
  "tags": [
   "tutor",
   "sorcery",
   "symmetric"
  ],
  "rulings": [
   {
    "q": "Can I target myself and one opponent?",
    "a": "Yes. It targets two different players, and you can be one of them."
   },
   {
    "q": "What does Opposition Agent do here?",
    "a": "You control the opponent's search and the card they find is exiled. You may play it."
   }
  ],
  "tips": [],
  "combos": [
   "Opposition Agent"
  ]
 },
 "Wishclaw Talisman": {
  "rating": 3,
  "when": "Kill turn",
  "tags": [
   "tutor",
   "artifact",
   "2-drop"
  ],
  "rulings": [
   {
    "q": "Can opponents use it?",
    "a": "Yes, on their turn while it has wish counters. Then control passes to one of their opponents, which can be you."
   },
   {
    "q": "Can I activate it at instant speed?",
    "a": "No. Only during your turn."
   }
  ],
  "tips": [
   "<i-c>Tribute Mage</i-c> can find it, since it's a 2-mana-value artifact."
  ],
  "combos": [
   "Opposition Agent"
  ]
 },
 "Tribute Mage": {
  "rating": 3,
  "when": "Turn 3",
  "tags": [
   "tutor",
   "3-drop",
   "enters trigger"
  ],
  "rulings": [
   {
    "q": "Can it find Mox Amber?",
    "a": "No. Mox Amber has mana value 0."
   }
  ],
  "tips": [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  "combos": []
 },
 "Shred Memory": {
  "rating": 4,
  "when": "Turns 2-3, sorcery speed",
  "tags": [
   "transmute",
   "graveyard hate",
   "instant"
  ],
  "rulings": [
   {
    "q": "What can it find?",
    "a": "Any card with mana value 2: <i-c>Mindcrank</i-c>, <i-c>Duskmantle Guildmage</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Silumgar Assassin</i-c>, <i-c>Demonic Tutor</i-c>, <i-c>Wishclaw Talisman</i-c>, the Signets and more."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Muddle the Mixture": {
  "rating": 4,
  "when": "Turns 2-3, or held up",
  "tags": [
   "transmute",
   "counterspell",
   "instant"
  ],
  "rulings": [
   {
    "q": "Can it counter a creature spell?",
    "a": "No. Only instants and sorceries."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Drift of Phantasms": {
  "rating": 4,
  "when": "Turns 2-4, sorcery speed",
  "tags": [
   "transmute",
   "defender",
   "flying"
  ],
  "rulings": [
   {
    "q": "What can it find?",
    "a": "Any card with mana value 3, including <i-c>Hooded Blightfang</i-c>, <i-c>Necropotence</i-c>, <i-c>Rhystic Study</i-c>, <i-c>Grim Tutor</i-c> and <i-c>Opposition Agent</i-c>."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Dimir House Guard": {
  "rating": 4,
  "when": "Turns 3-4, sorcery speed",
  "tags": [
   "transmute",
   "fear",
   "regenerate"
  ],
  "rulings": [
   {
    "q": "What can it find?",
    "a": "Any card with mana value 4, including <i-c>Bloodletter of Aclazotz</i-c>, <i-c>Enduring Tenacity</i-c>, <i-c>Notion Thief</i-c>, <i-c>Beseech the Mirror</i-c> and <i-c>Deadly Rollick</i-c>."
   },
   {
    "q": "What does fear do?",
    "a": "It can't be blocked except by artifact creatures and black creatures."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Counterspell": {
  "rating": 4,
  "when": "Instant speed",
  "tags": [
   "counterspell",
   "hard counter"
  ],
  "rulings": [
   {
    "q": "Can it counter an ability?",
    "a": "No. It only counters spells. Etrata's flip and Guildmage's drain are abilities, and so are opponents' activated combos."
   }
  ],
  "tips": [
   "Manifest it with <i-c>Scroll of Fate</i-c>, then flip it with Etrata in response to a spell: it's exiled and you cast it free."
  ],
  "combos": []
 },
 "An Offer You Can't Refuse": {
  "rating": 3,
  "when": "Instant speed",
  "tags": [
   "counterspell",
   "1 mana"
  ],
  "rulings": [
   {
    "q": "Who gets the Treasures?",
    "a": "The controller of the countered spell. If you counter your own, you get them."
   },
   {
    "q": "Can it counter a face-down morph spell?",
    "a": "No. A face-down spell is a creature spell."
   }
  ],
  "tips": [
   "Treasures you get from it can pay for <i-c>Beseech the Mirror</i-c>'s bargain."
  ],
  "combos": []
 },
 "Aetherize": {
  "rating": 3,
  "when": "An opponent's combat, after attackers are declared",
  "tags": [
   "instant",
   "bounce",
   "fog",
   "new in v3"
  ],
  "rulings": [
   {
    "q": "What happens to attacking tokens?",
    "a": "They go to their owner's hand and then cease to exist."
   },
   {
    "q": "What about an attacking commander?",
    "a": "Its owner may put it into the command zone instead of their hand. Either way it's out of combat and must be cast again."
   },
   {
    "q": "Does it hit creatures attacking someone else?",
    "a": "Yes. It returns every attacking creature, whoever they're attacking."
   }
  ],
  "tips": [
   "Wait until attackers are declared, then cast it. Before that, nothing is attacking yet.",
   "<i-c>Dimir House Guard</i-c> can transmute for it."
  ],
  "combos": []
 },
 "Dimir Signet": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "mana rock",
   "fixing"
  ],
  "rulings": [
   {
    "q": "Does it add mana if it's my only source?",
    "a": "No. It needs {1} from another source, so it nets one extra mana."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Fellwar Stone": {
  "rating": 2,
  "when": "Turn 2",
  "tags": [
   "mana rock"
  ],
  "rulings": [
   {
    "q": "What if no opponent's land makes a color?",
    "a": "Then it makes only the types those lands could make, which may be {C} or nothing at all."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Mind Stone": {
  "rating": 2,
  "when": "Turn 2",
  "tags": [
   "mana rock",
   "cantrip"
  ],
  "rulings": [
   {
    "q": "Can I tap it for mana and sacrifice it in the same turn?",
    "a": "No. Both abilities need {T}. Choose one."
   }
  ],
  "tips": [
   "It's an artifact, so you can sacrifice it to bargain <i-c>Beseech the Mirror</i-c>."
  ],
  "combos": []
 },
 "Culling the Weak": {
  "rating": 3,
  "when": "Kill turn",
  "tags": [
   "ritual",
   "instant",
   "sacrifice outlet"
  ],
  "rulings": [
   {
    "q": "Can I sacrifice a face-down creature?",
    "a": "Yes. A face-down creature is a creature you control. A cloak of an opponent's card goes to that player's graveyard."
   },
   {
    "q": "Does the mana last?",
    "a": "No. Mana empties at the end of each step and phase."
   }
  ],
  "tips": [
   "Sacrifice <i-c>Enduring Tenacity</i-c> while it's a creature: it comes back as an enchantment."
  ],
  "combos": [
   "Wormfang Manta",
   "Duskmantle Guildmage",
   "Enduring Tenacity"
  ]
 },
 "Gloomlake Verge": {
  "rating": 3,
  "when": "Turns 2+",
  "tags": [
   "land",
   "dual"
  ],
  "rulings": [
   {
    "q": "Does it need the Island or Swamp to stay?",
    "a": "It checks when you tap it for {B}."
   }
  ],
  "tips": [],
  "combos": []
 },
 "Otawara, Soaring City": {
  "rating": 4,
  "when": "Any turn",
  "tags": [
   "land",
   "channel",
   "legendary"
  ],
  "rulings": [
   {
    "q": "Is channel a spell?",
    "a": "No. It's an activated ability from your hand, so counterspells can't stop it."
   },
   {
    "q": "Can I bounce my own creature?",
    "a": "Yes. Any target artifact, creature, enchantment or planeswalker."
   }
  ],
  "tips": [],
  "combos": [
   "Wormfang Manta"
  ]
 },
 "Takenuma, Abandoned Mire": {
  "rating": 3,
  "when": "Any turn",
  "tags": [
   "land",
   "channel",
   "legendary",
   "recursion"
  ],
  "rulings": [
   {
    "q": "Can it return a creature I just milled?",
    "a": "Yes. The mill happens first, then you return a creature card from your graveyard."
   }
  ],
  "tips": [],
  "combos": []
 }
};
