/* Generated card data for the Corrupted Etrata deck wiki. Rules text from the Forge card database. */
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
   "cmd",
   "facedown",
   "steal"
  ],
  "why": "The engine of the deck. She gives every face-down creature you control \"{2}{U}{B}: turn this face up\", which turns Wormfang Manta from a 7-mana flip into a 4-mana one, flips a face-down Silumgar Assassin at instant speed and lets you cast face-down instants and sorceries for free. Every time an Assassin you control deals combat damage to an opponent, she also cloaks the top card of that player's library for you.",
  "how": "Cast her on turn 2 or 3 off a rock. Keep her home as a 1/4 deathtouch blocker unless Tetsuko Umezawa makes her unblockable. While she's on the battlefield, Fierce Guardianship and Deadly Rollick are free.",
  "syn": [
   "Silumgar Assassin",
   "Wormfang Manta",
   "Scroll of Fate",
   "Training Grounds",
   "Roshan, Hidden Magister",
   "Tetsuko Umezawa, Fugitive",
   "Fierce Guardianship"
  ],
  "warn": "Cloaks are 2/2s with no creature types, so they don't trigger her until Roshan or Leyline of Transformation makes them Assassins. With Ramses out she's a 2/5 and Tetsuko no longer makes her unblockable."
 },
 {
  "name": "Exquisite Blood",
  "qty": 1,
  "cost": "{4}{B}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever an opponent loses life, you gain that much life.",
  "roles": [
   "combo"
  ],
  "why": "The main drain of the vampire court loop. Whenever an opponent loses life, you gain that much, and any of the five payoffs (Marauding Blight-Priest, Starscape Cleric, Vito, Sanguine Bond, Enduring Tenacity) turns every gain into more life loss. Any pair of them loops until every opponent is dead.",
  "how": "Find it with Demonic Tutor, Vampiric Tutor, Imperial Seal or Grim Tutor when a payoff is already on the battlefield. Cast it with counter backup, then start the loop: an attack, a Mindcrank trigger, or an opponent cracking a fetch land or paying for a shock land.",
  "syn": [
   "Marauding Blight-Priest",
   "Vito, Thorn of the Dusk Rose",
   "Sanguine Bond",
   "Starscape Cleric",
   "Enduring Tenacity",
   "Bloodletter of Aclazotz",
   "Changeling Outcast",
   "Demonic Tutor"
  ],
  "warn": "It's a five-mana enchantment with no transmute tutor at its mana value. Enchantment removal or a bounce in response to the first trigger stops the loop."
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
   "combo"
  ],
  "why": "A second Exquisite Blood on a 5/5 flying deathtouch body: whenever an opponent loses life, you gain that much. With Blight-Priest, Starscape Cleric, Vito, Sanguine Bond or Enduring Tenacity it's the same infinite loop. When the loop isn't ready, it's still a big flying attacker.",
  "how": "Tutor for it when your opponents run enchantment removal, or when you want a threat that also ends the game. Cast it the turn before a payoff, or after one with protection up, and attack to start the loop.",
  "syn": [
   "Marauding Blight-Priest",
   "Starscape Cleric",
   "Enduring Tenacity",
   "Vito, Thorn of the Dusk Rose",
   "Sanguine Bond",
   "Bloodletter of Aclazotz",
   "Exquisite Blood"
  ],
  "warn": "It's a creature, so creature removal and wipes hit it. Toxic Deluge for X 5 or more kills your own Conqueror."
 },
 {
  "name": "Marauding Blight-Priest",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Vampire Cleric",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Whenever you gain life, each opponent loses 1 life.",
  "roles": [
   "combo"
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
  "name": "Vito, Thorn of the Dusk Rose",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Cleric",
  "cat": "Creature",
  "pt": "1/3",
  "text": "Whenever you gain life, target opponent loses that much life.\n{3}{B}{B}: Creatures you control gain lifelink until end of turn.",
  "roles": [
   "combo"
  ],
  "why": "Whenever you gain life, target opponent loses that much. With Exquisite Blood or Bloodthirsty Conqueror that's an infinite loop. His {3}{B}{B} ability gives your creatures lifelink, which starts the loop by itself in combat.",
  "how": "Find him with Drift of Phantasms or a tutor and cast him early: a 1/3 for three gets little attention. He's a 1-power Vampire, not an Assassin, so Tetsuko Umezawa keeps him unblockable even with Ramses out.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Tetsuko Umezawa, Fugitive",
   "Drift of Phantasms",
   "Marauding Blight-Priest"
  ],
  "warn": "His trigger targets one opponent at a time. A hexproof player can't be chosen, so use Blight-Priest against them."
 },
 {
  "name": "Sanguine Bond",
  "qty": 1,
  "cost": "{3}{B}{B}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever you gain life, target opponent loses that much life.",
  "roles": [
   "combo"
  ],
  "why": "A payoff for the vampire court loop: whenever you gain life, target opponent loses that much. With Exquisite Blood or Bloodthirsty Conqueror it kills the table one player at a time. It's an enchantment, so it survives creature wipes that kill Vito, Blight-Priest and Starscape Cleric.",
  "how": "Tutor for it when the drain is on the battlefield and creature removal is the problem. Cast it with counter backup, then start the loop with any opponent losing life.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Bloodletter of Aclazotz",
   "Demonic Tutor",
   "Enduring Tenacity"
  ],
  "warn": "At five mana it's the slowest payoff. Prefer Blight-Priest or Vito when you can get either."
 },
 {
  "name": "Enduring Tenacity",
  "qty": 1,
  "cost": "{2}{B}{B}",
  "mv": 4,
  "type": "Enchantment Creature — Snake Glimmer",
  "cat": "Creature",
  "pt": "4/3",
  "text": "Whenever you gain life, target opponent loses that much life.\nWhen Enduring Tenacity dies, if it was a creature, return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)",
  "roles": [
   "combo"
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
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Bat Cleric",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Offspring {2}{B} (You may pay an additional {2}{B} as you cast this spell. If you do, when this creature enters, create a 1/1 token copy of it.)\nFlying\nThis creature can't block.\nWhenever you gain life, each opponent loses 1 life.",
  "roles": [
   "combo"
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
  "name": "Ramses, Assassin Lord",
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Deathtouch\nOther Assassins you control get +1/+1.\nWhenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.",
  "roles": [
   "combo"
  ],
  "why": "Turns one elimination into a win: whenever a player loses the game, if one of your Assassins attacked them this turn, you win. That makes the double tap into a table win. He's also a 4/4 deathtouch lord for your other Assassins.",
  "how": "Transmute Dimir House Guard for him, or cast him free with a bargained Beseech the Mirror. On the kill turn, attack the target with an Assassin first (Changeling Outcast is the easy one), then finish them in combat or with a loop after combat.",
  "syn": [
   "Virtus the Veiled",
   "Bloodletter of Aclazotz",
   "Silumgar Assassin",
   "Changeling Outcast",
   "Dimir House Guard"
  ],
  "warn": "His +1/+1 makes Virtus a 2/2 and Etrata a 2/5, so Tetsuko no longer makes them unblockable. Use Rogue's Passage on Virtus instead."
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
   "combo"
  ],
  "why": "If an opponent would lose life during your turn, they lose twice that much. With Virtus the Veiled, 'lose half your life, rounded up' becomes 'lose all of it'. It also doubles combat damage, Mindcrank's mill count and every drain on your turn.",
  "how": "Transmute Dimir House Guard for it, or cast it free with a bargained Beseech the Mirror. Cast it before combat on the turn Virtus or another evasive Assassin can connect. A 2/4 flier is also a fine blocker.",
  "syn": [
   "Virtus the Veiled",
   "Ramses, Assassin Lord",
   "Mindcrank",
   "Tetsuko Umezawa, Fugitive",
   "Exquisite Blood",
   "Dimir House Guard"
  ],
  "warn": "It only works during your turn. On opponents' turns their life loss is normal."
 },
 {
  "name": "Virtus the Veiled",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Azra Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Virtus the Veiled deals combat damage to a player, that player loses half their life, rounded up.",
  "roles": [
   "combo"
  ],
  "why": "A 1/1 deathtouch Assassin: when it deals combat damage to a player, they lose half their life, rounded up. With Bloodletter of Aclazotz that's all of it, and with Ramses, killing that player wins the game.",
  "how": "Find it with Drift of Phantasms or a tutor. Cast it early as a deathtouch blocker, then attack on the turn Bloodletter is out. Tetsuko makes it unblockable, but only while Ramses isn't pumping it, so bring Rogue's Passage for the three-card turn.",
  "syn": [
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord",
   "Tetsuko Umezawa, Fugitive",
   "Rogue's Passage",
   "Drift of Phantasms",
   "Mindcrank"
  ],
  "warn": "Its Partner with Gorm the Great does nothing here; when it enters, nobody has Gorm to find. With Ramses out it's a 2/2, so Tetsuko doesn't make it unblockable."
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
   "utility"
  ],
  "why": "Creatures you control with power or toughness 1 or less can't be blocked. That covers Etrata (1/4), Virtus, Vito, Tetsuko herself, Vampire of the Dire Moon, Hooded Blightfang, Starscape Cleric, an unflipped Silumgar Assassin (2/1) and the 6/1 Wormfang Manta. It's the deck's cheapest evasion and turns every small Assassin into a reliable cloak trigger.",
  "how": "Transmute Shred Memory or Muddle the Mixture for her, or just cast her on turn 2. On Manta turns, the 6/1 Manta attacks unblocked.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Vito, Thorn of the Dusk Rose",
   "Vampire of the Dire Moon",
   "Hooded Blightfang",
   "Wormfang Manta",
   "Shred Memory",
   "Muddle the Mixture"
  ],
  "warn": "Ramses gives other Assassins +1/+1, so Etrata and Virtus lose the evasion while he's out. The Manta keeps it only if it isn't an Assassin."
 },
 {
  "name": "Vampire of the Dire Moon",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Vampire",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Deathtouch\nLifelink",
  "roles": [
   "utility",
   "combo"
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
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Snake",
  "cat": "Creature",
  "pt": "1/4",
  "text": "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
  "roles": [
   "utility",
   "combo"
  ],
  "why": "A 1/4 deathtouch wall that also drains. Etrata, Ramses, Virtus, Bloodthirsty Conqueror, Vampire of the Dire Moon and the Blightfang itself have deathtouch, so every attack with one makes each opponent lose 1 and you gain 1. With a drain and a payoff out, that one attack starts the loop.",
  "how": "Transmute Drift of Phantasms for it or cast it on turn 3 and keep it back as a blocker. On the kill turn, attack with any deathtouch creature: the trigger happens on attack, before blockers, so it doesn't even need to connect.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Vampire of the Dire Moon",
   "Etrata, Deadly Fugitive",
   "Virtus the Veiled",
   "Drift of Phantasms"
  ],
  "warn": "Face-down creatures and cloaks have no abilities, so they don't trigger it. It's not an Assassin, so it doesn't trigger Etrata or Ramses."
 },
 {
  "name": "Silumgar Assassin",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Creatures with power greater than Silumgar Assassin's power can't block it.\nMegamorph {2}{B} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its megamorph cost and put a +1/+1 counter on it.)\nWhen Silumgar Assassin is turned face up, destroy target creature with power 3 or less an opponent controls.",
  "roles": [
   "facedown",
   "removal"
  ],
  "why": "Cast face down for {3}, it's a 2/2 blocker that holds removal: turn it face up for {2}{B} at any time and destroy an opponent's creature with power 3 or less. Turning face up by megamorph is a special action, so nobody can respond to the flip itself. Face up it's an Assassin, so its hits cloak with Etrata.",
  "how": "Cast it face down on turn 3 instead of tapping out for a sorcery-speed play. Flip it when an opponent's attacker or key creature shows up. Etrata's {2}{U}{B} flip also works ({U}{B} with Training Grounds), but only the megamorph flip gives the +1/+1 counter.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Roshan, Hidden Magister",
   "Training Grounds",
   "Ramses, Assassin Lord",
   "Infernal Grasp"
  ],
  "warn": "The destroy trigger targets, so it can't hit hexproof creatures. With its +1/+1 counter it's a 3/2 and Ramses makes it bigger still, so Tetsuko no longer makes it unblockable."
 },
 {
  "name": "Toxic Deluge",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "As an additional cost to cast this spell, pay X life.\nAll creatures get -X/-X until end of turn.",
  "roles": [
   "removal",
   "combo"
  ],
  "why": "Pay X life, all creatures get -X/-X. It resets a board that's racing you, and it's the deck's only sweeper, so it buys the turns the vampire loop and the Manta loop need.",
  "how": "Pick the smallest X that kills what matters. X=3 keeps Etrata (1/4), Hooded Blightfang (1/4) and Ramses (4/4) alive. Enduring Tenacity dies at X=3 or more and comes back as an enchantment, so the wipe costs you nothing there.",
  "syn": [
   "Enduring Tenacity",
   "Hooded Blightfang",
   "Ramses, Assassin Lord",
   "Drift of Phantasms"
  ],
  "warn": "Face-down creatures are 2/2s, so X=2 kills your cloaks and a face-down Silumgar Assassin. Vampire of the Dire Moon and Starscape Cleric die at X=1."
 },
 {
  "name": "Scroll of Fate",
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Manifest a card from your hand. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  "roles": [
   "facedown",
   "combo"
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
  "qty": 1,
  "cost": "{5}{U}{U}",
  "mv": 7,
  "type": "Creature — Nightmare Fish Beast",
  "cat": "Creature",
  "pt": "6/1",
  "text": "Flying\nWhen Wormfang Manta enters, you skip your next turn.\nWhen Wormfang Manta leaves the battlefield, you take an extra turn after this one.",
  "roles": [
   "combo",
   "facedown"
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
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{3}, {T} or {U}, {T}: Return target creature to its owner's hand unless its controller pays {1}.",
  "roles": [
   "combo",
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
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Activated abilities of creatures you control cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.",
  "roles": [
   "utility",
   "combo"
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
  "warn": "It doesn't reduce morph costs, turning up for a mana cost, transmute, ninjutsu, or artifact abilities like Crystal Shard."
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
   "facedown",
   "draw",
   "utility"
  ],
  "why": "Every other creature you control is an Assassin, so your cloaks trigger Etrata. Face-down creatures get menace, and whenever a permanent you control is turned face up, you draw a card. In the Manta loop, that's a card every turn, and a face-down Silumgar Assassin flip draws one too.",
  "how": "Transmute Dimir House Guard for him. Cast him before combat on turn 4 or 5, then attack with every cloak. Draw off each Manta and Silumgar Assassin flip.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Silumgar Assassin",
   "Wormfang Manta",
   "Ramses, Assassin Lord",
   "Dimir House Guard"
  ],
  "warn": "Making everything an Assassin means Ramses pumps everything, which can push your 1-power creatures out of Tetsuko's range."
 },
 {
  "name": "Mindcrank",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Whenever an opponent loses life, that player mills that many cards. (Damage dealt by sources without infect causes loss of life.)",
  "roles": [
   "combo"
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
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/2",
  "text": "{1}{U}{B}: Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.\n{2}{U}{B}: Target player mills two cards.",
  "roles": [
   "combo"
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
  "name": "Leyline of Transformation",
  "qty": 1,
  "cost": "{2}{U}{U}",
  "mv": 4,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "If Leyline of Transformation is in your opening hand, you may begin the game with it on the battlefield.\nAs Leyline of Transformation enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
  "roles": [
   "utility"
  ],
  "why": "Choose Assassin, and every creature you control is one, cloaks included. Each cloak that connects then makes another one, and Ramses pumps your whole board. If it's in your opening hand, it starts on the battlefield for free.",
  "how": "Keep hands that have it. Later, transmute Dimir House Guard for it or cast it for four when you want Etrata's engine running.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Dimir House Guard",
   "Secluded Courtyard"
  ],
  "warn": "If it's cloaked or manifested and turned face up, it never chose a type and does nothing. With Ramses, your 1-power creatures leave Tetsuko's range."
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
   "utility"
  ],
  "why": "A one-mana unblockable creature that is every type, so it's an Assassin and a Vampire. It cloaks a card with Etrata every turn and starts the Mindcrank and vampire loops with a single point of damage. It also satisfies Ramses's 'attacked by an Assassin' check.",
  "how": "Play it on turn 1 or 2 and attack every turn. On the kill turn, attack the target with it first so Ramses can turn their loss into your win. It's also a clean ninjutsu enabler for Fallen Shinobi.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Fallen Shinobi",
   "Mindcrank",
   "Exquisite Blood"
  ],
  "warn": "It can't block, so don't count it as defense."
 },
 {
  "name": "Gonti, Night Minister",
  "qty": 1,
  "cost": "{2}{B}{B}",
  "mv": 4,
  "type": "Legendary Creature — Aetherborn Rogue",
  "cat": "Creature",
  "pt": "3/4",
  "text": "Whenever a player casts a spell they don't own, that player creates a Treasure token.\nWhenever a creature deals combat damage to one of your opponents, its controller looks at the top card of that opponent's library and exiles it face down. They may play that card for as long as it remains exiled. Mana of any type can be spent to cast a spell this way.",
  "roles": [
   "steal",
   "draw"
  ],
  "why": "Whenever a creature deals combat damage to one of your opponents, its controller exiles the top card of that player's library face down and may play it. Every hit from Changeling Outcast, Etrata's Assassins or a cloak steals a card. Casting spells you don't own also makes Treasures.",
  "how": "Transmute Dimir House Guard for him, or cast him on turn 4 before combat. Attack with everything evasive that turn. Spend the Treasures on Beseech the Mirror's bargain or a big flip.",
  "syn": [
   "Changeling Outcast",
   "Thief of Sanity",
   "Fallen Shinobi",
   "Etrata, Deadly Fugitive",
   "Beseech the Mirror",
   "Mox Amber"
  ],
  "warn": "His second ability triggers for any creature, so an opponent who hits another opponent steals a card too. His first ability gives anyone casting a spell they don't own a Treasure."
 },
 {
  "name": "Thief of Sanity",
  "qty": 1,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Creature — Specter",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Flying\nWhenever Thief of Sanity deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. You may look at and cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any type to cast that spell.",
  "roles": [
   "steal"
  ],
  "why": "A 2/2 flier: when it hits, you look at the top three cards of that player's library, exile one to cast later and put the other two into their graveyard. You get the best card of three every turn.",
  "how": "Find it with Drift of Phantasms or cast it on turn 3. Attack the player with the most dangerous deck. With Guildmage's drain active, the two cards it bins also start the Mindcrank loop.",
  "syn": [
   "Duskmantle Guildmage",
   "Mindcrank",
   "Gonti, Night Minister",
   "Tetsuko Umezawa, Fugitive",
   "Drift of Phantasms"
  ],
  "warn": "It's a 2/2 flier, so any flying blocker or removal stops it. It isn't an Assassin unless Roshan or Leyline makes it one."
 },
 {
  "name": "Fallen Shinobi",
  "qty": 1,
  "cost": "{3}{U}{B}",
  "mv": 5,
  "type": "Creature — Zombie Ninja",
  "cat": "Creature",
  "pt": "5/4",
  "text": "Ninjutsu {2}{U}{B} ({2}{U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)\nWhenever Fallen Shinobi deals combat damage to a player, that player exiles the top two cards of their library. Until end of turn, you may play those cards without paying their mana costs.",
  "roles": [
   "steal"
  ],
  "why": "When it deals combat damage to a player, they exile the top two cards of their library and you may play them free this turn. Two free cards from an opponent's deck per hit.",
  "how": "Ninjutsu it in for {2}{U}{B} by returning an unblocked Changeling Outcast, then recast the Outcast. Free cards from the top of their library can include their best spells.",
  "syn": [
   "Changeling Outcast",
   "Gonti, Night Minister",
   "Etrata, Deadly Fugitive",
   "Rogue's Passage"
  ],
  "warn": "Returning an Assassin for ninjutsu loses that Assassin's Etrata trigger this combat. Training Grounds doesn't reduce ninjutsu: the card is in your hand."
 },
 {
  "name": "Opposition Agent",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Human Rogue",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Flash\nYou control your opponents while they're searching their libraries.\nWhile an opponent is searching their library, they exile each card they find. You may play those cards for as long as they remain exiled, and you may spend mana as though it were mana of any color to cast them.",
  "roles": [
   "steal",
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
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Creature — Human Rogue",
  "cat": "Creature",
  "pt": "3/1",
  "text": "Flash\nIf an opponent would draw a card except the first one they draw in each of their draw steps, instead that player skips that draw and you draw a card.",
  "roles": [
   "steal",
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
  "qty": 1,
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
  "name": "Praetor's Grasp",
  "qty": 1,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search target opponent's library for a card and exile it face down. Then that player shuffles. You may look at and play that card for as long as it remains exiled.",
  "roles": [
   "steal",
   "tutor"
  ],
  "why": "Search an opponent's library for any card, exile it face down, and you may play it as long as it's exiled. You take their best answer or their win condition.",
  "how": "Cast it when you know what's in their deck. Take a card that wins for you, or the combo piece they're closest to. Drift of Phantasms can transmute for it.",
  "syn": [
   "Drift of Phantasms",
   "Opposition Agent",
   "Gonti, Night Minister"
  ],
  "warn": "You must pay the card's real cost in its colors. Don't take an off-color card you can't cast."
 },
 {
  "name": "Black Market Connections",
  "qty": 1,
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
  "why": "Each first main phase, choose one or more: a Treasure for 1 life, a card for 2 life, or a 3/2 changeling Mercenary for 3 life. The Mercenary is an Assassin, so it triggers Etrata, and gets Ramses's pump.",
  "how": "Find it with Drift of Phantasms. Early, take the card and the Treasure. Late, add a Mercenary when you need another Assassin to attack.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Beseech the Mirror",
   "Exquisite Blood"
  ],
  "warn": "The life adds up. Watch your total with Necropotence and painlands."
 },
 {
  "name": "Rhystic Study",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.",
  "roles": [
   "draw"
  ],
  "gc": true,
  "why": "Whenever an opponent casts a spell, you may draw a card unless they pay {1}. Either you draw a lot or the table slows down.",
  "how": "Cast it on turn 2 or 3. Remind the table of the tax on each spell. Drift of Phantasms can transmute for it.",
  "syn": [
   "Mystic Remora",
   "Notion Thief",
   "Drift of Phantasms"
  ]
 },
 {
  "name": "Necropotence",
  "qty": 1,
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
  "name": "Mystic Remora",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Cumulative upkeep {1} (At the beginning of your upkeep, put an age counter on this permanent, then sacrifice it unless you pay its upkeep cost for each age counter on it.)\nWhenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.",
  "roles": [
   "draw"
  ],
  "why": "One mana: whenever an opponent casts a noncreature spell, you may draw unless they pay {4}. In the early turns it draws several cards per round.",
  "how": "Cast it on turn 1 or 2. Pay its cumulative upkeep for two or three turns, then let it go.",
  "syn": [
   "Rhystic Study"
  ],
  "warn": "Cumulative upkeep grows each turn. Don't keep paying once it costs more than it draws."
 },
 {
  "name": "Brainstorm",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Draw three cards, then put two cards from your hand on top of your library in any order.",
  "roles": [
   "draw"
  ],
  "why": "Draw three, put two back. It finds a missing piece and hides cards on top for later.",
  "how": "Use it after Vampiric Tutor or Imperial Seal to draw the card now. Hold it to put back cards you don't need.",
  "syn": [
   "Vampiric Tutor",
   "Imperial Seal",
   "Polluted Delta"
  ]
 },
 {
  "name": "Ponder",
  "qty": 1,
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
  "qty": 1,
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
  "name": "Demonic Tutor",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a card, put that card into your hand, then shuffle.",
  "roles": [
   "tutor"
  ],
  "gc": true,
  "why": "Two mana: any card into your hand. Find the missing half of whichever combo you're closest to.",
  "how": "Hold it until you know what's missing. With one half of a pair on the battlefield, it's often the last card you need.",
  "syn": [
   "Exquisite Blood",
   "Mindcrank",
   "Wormfang Manta",
   "Muddle the Mixture"
  ]
 },
 {
  "name": "Vampiric Tutor",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "tutor"
  ],
  "gc": true,
  "why": "One mana at instant speed: any card on top of your library for 2 life. Find a combo piece at the end of an opponent's turn and draw it next turn.",
  "how": "Cast it at the end of the opponent's turn before yours. With Brainstorm or Necropotence, you get the card the same turn.",
  "syn": [
   "Brainstorm",
   "Necropotence",
   "Exquisite Blood"
  ],
  "warn": "The card is on top, not in your hand, so a shuffle or mill sets you back."
 },
 {
  "name": "Imperial Seal",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "tutor"
  ],
  "gc": true,
  "why": "A one-mana sorcery Vampiric Tutor: any card on top of your library for 2 life. On turn 1 it sets up the exact game you want.",
  "how": "Cast it early for the combo piece you lack, then draw it next turn. Brainstorm or Necropotence gets it the same turn.",
  "syn": [
   "Brainstorm",
   "Necropotence",
   "Mindcrank",
   "Training Grounds"
  ],
  "warn": "It's a sorcery, so opponents see it on top for a full turn cycle."
 },
 {
  "name": "Grim Tutor",
  "qty": 1,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a card, put that card into your hand, then shuffle. You lose 3 life.",
  "roles": [
   "tutor"
  ],
  "why": "Three mana: any card into your hand for 3 life. A fourth unrestricted tutor.",
  "how": "Use it for Exquisite Blood, Sanguine Bond or Wormfang Manta, which no transmute card can find.",
  "syn": [
   "Exquisite Blood",
   "Bloodthirsty Conqueror",
   "Sanguine Bond",
   "Wormfang Manta",
   "Drift of Phantasms"
  ]
 },
 {
  "name": "Diabolic Intent",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "As an additional cost to cast this spell, sacrifice a creature.\nSearch your library for a card, put that card into your hand, then shuffle.",
  "roles": [
   "tutor"
  ],
  "why": "Sacrifice a creature: any card into your hand. Sacrifice a cloak you don't need, Changeling Outcast or a Mercenary token.",
  "how": "Sacrifice a stolen cloak: it goes to its owner's graveyard. Sacrifice a face-up Wormfang Manta and you also take an extra turn.",
  "syn": [
   "Wormfang Manta",
   "Changeling Outcast",
   "Black Market Connections",
   "Duskmantle Guildmage"
  ],
  "warn": "It needs a creature. Without one you can't cast it."
 },
 {
  "name": "Beseech the Mirror",
  "qty": 1,
  "cost": "{1}{B}{B}{B}",
  "mv": 4,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Bargain (You may sacrifice an artifact, enchantment, or token as you cast this spell.)\nSearch your library for a card, exile it face down, then shuffle. If this spell was bargained, you may cast the exiled card without paying its mana cost if that spell's mana value is 4 or less. Put the exiled card into your hand if it wasn't cast this way.",
  "roles": [
   "tutor"
  ],
  "why": "Search for any card and exile it. If you bargained (sacrificed an artifact, enchantment or token), you may cast it free if its mana value is 4 or less. It fetches and casts Ramses, Bloodletter, Enduring Tenacity, Mindcrank, Guildmage, Blight-Priest or Starscape Cleric in one spell.",
  "how": "Bargain a Treasure or a spent rock, then cast Bloodletter or Ramses free on the kill turn. Without the free cast, the card goes to your hand like a Demonic Tutor.",
  "syn": [
   "Bloodletter of Aclazotz",
   "Ramses, Assassin Lord",
   "Enduring Tenacity",
   "Black Market Connections",
   "Gonti, Night Minister",
   "Mind Stone"
  ],
  "warn": "Exquisite Blood and Bloodthirsty Conqueror have mana value 5, too big for the free cast."
 },
 {
  "name": "Lim-Dûl's Vault",
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Creature — Skeleton",
  "cat": "Creature",
  "pt": "2/3",
  "text": "Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)\nSacrifice a creature: Regenerate Dimir House Guard.\nTransmute {1}{B}{B} ({1}{B}{B}, Discard this card: Search your library for a card with the same mana value as this card, reveal it, put it into your hand, then shuffle. Transmute only as a sorcery.)",
  "roles": [
   "tutor"
  ],
  "why": "Transmute for {1}{B}{B} to find any card with mana value 4: Ramses, Bloodletter, Enduring Tenacity, Gonti, Roshan or Leyline. Cast, it's a 2/3 with fear that regenerates by sacrificing a creature.",
  "how": "Transmute it for Bloodletter or Ramses on the turn before the double tap. As a creature, it protects itself by sacrificing a cloak.",
  "syn": [
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Enduring Tenacity",
   "Roshan, Hidden Magister",
   "Leyline of Transformation",
   "Notion Thief"
  ]
 },
 {
  "name": "Counterspell",
  "qty": 1,
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
  "name": "Swan Song",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with flying.",
  "roles": [
   "removal"
  ],
  "why": "One mana: counter an enchantment, instant or sorcery. Most wipes, tutors and removal spells are covered. The opponent gets a 2/2 flying Bird.",
  "how": "Hold it for a board wipe, a tutor or removal aimed at a combo piece.",
  "syn": [
   "Exquisite Blood",
   "Mindcrank"
  ],
  "warn": "The 2/2 flier can block Thief of Sanity or Bloodletter."
 },
 {
  "name": "An Offer You Can't Refuse",
  "qty": 1,
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
   "Gonti, Night Minister",
   "Fierce Guardianship"
  ],
  "warn": "Two Treasures can speed an opponent up a lot in the early turns."
 },
 {
  "name": "Fierce Guardianship",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nCounter target noncreature spell.",
  "roles": [
   "removal"
  ],
  "gc": true,
  "why": "Counter a noncreature spell, free while you control your commander. It protects the combo turn without spending mana.",
  "how": "Keep it for the wipe or removal spell aimed at your combo. Etrata has to be on the battlefield for the free cast.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Deadly Rollick",
   "Exquisite Blood"
  ],
  "warn": "Without Etrata on the battlefield, it costs {2}{U}."
 },
 {
  "name": "Deadly Rollick",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nExile target creature.",
  "roles": [
   "removal"
  ],
  "why": "Exile any creature, free while you control your commander. It handles indestructible threats and blockers.",
  "how": "Use it on a creature that stops your win: a flying blocker for Virtus, a hatebear, or an opponent's combo creature.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Fierce Guardianship",
   "Dimir House Guard"
  ],
  "warn": "Without Etrata on the battlefield, it costs {3}{B}."
 },
 {
  "name": "Infernal Grasp",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target creature. You lose 2 life.",
  "roles": [
   "removal"
  ],
  "why": "Two mana at instant speed: destroy any creature for 2 life.",
  "how": "Kill a blocker before combat, or a threat at the end of an opponent's turn.",
  "syn": [
   "Silumgar Assassin",
   "Shred Memory"
  ]
 },
 {
  "name": "Cyclonic Rift",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Return target nonland permanent you don't control to its owner's hand.\nOverload {6}{U} (You may cast this spell for its overload cost. If you do, change \"target\" in its text to \"each.\")",
  "roles": [
   "removal"
  ],
  "gc": true,
  "why": "Two mana to bounce one nonland permanent, or seven to bounce everything opponents control at instant speed. Overloaded at the end of the turn before yours, it clears the way for your combo.",
  "how": "Overload it at the end of the opponent's turn right before yours, then go off with the table empty. Single-target it to remove a stax piece.",
  "syn": [
   "Wormfang Manta",
   "Muddle the Mixture"
  ]
 },
 {
  "name": "Sol Ring",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}{C}.",
  "roles": [
   "ramp"
  ],
  "why": "One mana for two colorless mana. It casts Etrata on turn 2 with a colored land or a Signet.",
  "how": "Play it turn 1. Next turn, cast Etrata or Mindcrank plus Tetsuko.",
  "syn": [
   "Scroll of Fate",
   "Crystal Shard",
   "Mindcrank",
   "Dimir Signet"
  ]
 },
 {
  "name": "Mox Amber",
  "qty": 1,
  "cost": "{0}",
  "mv": 0,
  "type": "Legendary Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add one mana of any color among legendary creatures and planeswalkers you control.",
  "roles": [
   "ramp"
  ],
  "why": "A free mana source when you control a legendary creature. Etrata, Ramses, Gonti, Roshan, Vito, Virtus and Tetsuko are all legendary, so it's usually on after turn 2 or 3.",
  "how": "Play it alongside Etrata, or once a legend is down. Etrata makes it tap for {U} or {B}.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Tetsuko Umezawa, Fugitive",
   "Vito, Thorn of the Dusk Rose",
   "Ramses, Assassin Lord",
   "Gonti, Night Minister"
  ],
  "warn": "With no legendary creature or planeswalker out, it makes nothing."
 },
 {
  "name": "Arcane Signet",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "ramp"
  ],
  "why": "Two-mana rock that taps for {U} or {B}. It fixes and ramps into Etrata or a four-drop.",
  "how": "Turn 2 play. Tribute Mage can find it if you have no other mana.",
  "syn": [
   "Tribute Mage",
   "Shred Memory",
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Talisman of Dominance",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Talisman of Dominance deals 1 damage to you.",
  "roles": [
   "ramp"
  ],
  "why": "Two-mana rock that makes {C}, or {U} or {B} for 1 damage to you. It fixes both of Etrata's colors.",
  "how": "Turn 2 play. Use {C} for generic costs and take the damage only for colored mana.",
  "syn": [
   "Tribute Mage",
   "Etrata, Deadly Fugitive",
   "Muddle the Mixture"
  ]
 },
 {
  "name": "Dimir Signet",
  "qty": 1,
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
  "qty": 1,
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
  "qty": 1,
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
  "name": "Dark Ritual",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Add {B}{B}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "One black mana becomes {B}{B}{B}. It casts Etrata or a three-mana combo piece a turn early, or finishes a kill turn.",
  "how": "On turn 2, Swamp, Island and Ritual cast Etrata with {B} left over. Later, use it for Necropotence on turn 1 or 2, or to add a combo piece and hold counter mana.",
  "syn": [
   "Necropotence",
   "Bloodletter of Aclazotz",
   "Grim Tutor",
   "Beseech the Mirror",
   "Culling the Weak"
  ],
  "warn": "It's card disadvantage. Use it only when it unlocks an important play."
 },
 {
  "name": "Culling the Weak",
  "qty": 1,
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
  "name": "Command Tower",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped, from turn 1.",
  "how": "Play it early.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Path of Ancestry"
  ]
 },
 {
  "name": "Watery Grave",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U} or {B}.)\nAs Watery Grave enters, you may pay 2 life. If you don't, it enters tapped.",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters untapped for 2 life. Polluted Delta fetches it.",
  "how": "Fetch it with Polluted Delta. Pay the 2 life early when you need both colors on curve.",
  "syn": [
   "Polluted Delta",
   "Gloomlake Verge",
   "Drowned Catacomb"
  ]
 },
 {
  "name": "Drowned Catacomb",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Drowned Catacomb enters tapped unless you control an Island or a Swamp.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped if you control an Island or a Swamp.",
  "how": "Play it after a basic or a typed dual.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers"
  ]
 },
 {
  "name": "Darkslick Shores",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Darkslick Shores enters tapped unless you control two or fewer other lands.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped on your first three land drops.",
  "how": "Play it on turns 1-3.",
  "syn": [
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Underground River",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Underground River deals 1 damage to you.",
  "roles": [
   "land"
  ],
  "why": "{C} for free, or {U} or {B} for 1 damage to you. Always untapped.",
  "how": "Use {C} for generic costs and save the damage for colored mana.",
  "syn": [
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Sunken Hollow",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U} or {B}.)\nSunken Hollow enters tapped unless you control two or more basic lands.",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters untapped if you control two or more basic lands. Polluted Delta fetches it.",
  "how": "Play it after two basics, or fetch it.",
  "syn": [
   "Polluted Delta",
   "Island",
   "Swamp",
   "Gloomlake Verge"
  ]
 },
 {
  "name": "Morphic Pool",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Morphic Pool enters tapped unless you have two or more opponents.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}, untapped whenever you have two or more opponents, which is every normal Commander game.",
  "how": "Play it any turn.",
  "syn": [
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Gloomlake Verge",
  "qty": 1,
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
  "name": "Undercity Sewers",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U} or {B}.)\nUndercity Sewers enters tapped.\nWhen Undercity Sewers enters, surveil 1. (Look at the top card of your library. You may put it into your graveyard.)",
  "roles": [
   "land"
  ],
  "why": "An Island Swamp that enters tapped and surveils 1. Polluted Delta fetches it.",
  "how": "Play it on a turn you don't need all your mana, often turn 1.",
  "syn": [
   "Polluted Delta",
   "Gloomlake Verge",
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
  "pt": "",
  "text": "{T}, Pay 1 life, Sacrifice Polluted Delta: Search your library for an Island or Swamp card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Pay 1 life and sacrifice it: fetch an Island or Swamp card. That includes Watery Grave, Sunken Hollow and Undercity Sewers.",
  "how": "Fetch Watery Grave early for both colors. Crack it after Brainstorm to shuffle away the cards you put back.",
  "syn": [
   "Watery Grave",
   "Sunken Hollow",
   "Undercity Sewers",
   "Brainstorm",
   "Island",
   "Swamp"
  ],
  "warn": "If an opponent has Opposition Agent, wait to crack it."
 },
 {
  "name": "Otawara, Soaring City",
  "qty": 1,
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
   "Ramses, Assassin Lord",
   "Vito, Thorn of the Dusk Rose"
  ]
 },
 {
  "name": "Takenuma, Abandoned Mire",
  "qty": 1,
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
 },
 {
  "name": "Rogue's Passage",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{4}, {T}: Target creature can't be blocked this turn.",
  "roles": [
   "land",
   "utility"
  ],
  "why": "{4}, {T}: target creature can't be blocked this turn. It gets Virtus through when Ramses has made it too big for Tetsuko.",
  "how": "Use it on Virtus on the double tap turn, or on any Assassin that has to attack for Ramses.",
  "syn": [
   "Virtus the Veiled",
   "Ramses, Assassin Lord",
   "Bloodletter of Aclazotz",
   "Fallen Shinobi"
  ],
  "warn": "It makes only colorless mana."
 },
 {
  "name": "Path of Ancestry",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Path of Ancestry enters tapped.\n{T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell that shares a creature type with your commander, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  "roles": [
   "land"
  ],
  "why": "Taps for {U} or {B}. When the mana casts a creature spell that shares a type with Etrata (Vampire or Assassin), you scry 1.",
  "how": "Play it on a turn you don't need all your mana.",
  "syn": [
   "Marauding Blight-Priest",
   "Bloodletter of Aclazotz",
   "Starscape Cleric",
   "Changeling Outcast"
  ],
  "warn": "It enters tapped."
 },
 {
  "name": "Secluded Courtyard",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "As Secluded Courtyard enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type or activate an ability of a creature or creature card of the chosen type.",
  "roles": [
   "land"
  ],
  "why": "Taps for {C}, or any color for creature spells of the chosen type and abilities of creatures of that type. Name Assassin and it pays for Etrata's flips once Roshan or Leyline makes your face-down creatures Assassins.",
  "how": "Name Assassin in most games. Name Vampire if the vampire court is your plan.",
  "syn": [
   "Roshan, Hidden Magister",
   "Leyline of Transformation",
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Island",
  "qty": 8,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Island",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U}.)",
  "roles": [
   "land"
  ],
  "why": "Eight basic Islands. They turn on Sunken Hollow, Drowned Catacomb and Gloomlake Verge and survive nonbasic land hate.",
  "how": "Fetch one with Polluted Delta when you need {U} and expect land hate.",
  "syn": [
   "Polluted Delta",
   "Sunken Hollow",
   "Drowned Catacomb",
   "Gloomlake Verge"
  ]
 },
 {
  "name": "Swamp",
  "qty": 8,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {B}.)",
  "roles": [
   "land"
  ],
  "why": "Eight basic Swamps. They turn on Sunken Hollow, Drowned Catacomb and Gloomlake Verge and survive nonbasic land hate.",
  "how": "Play a Swamp first when your hand has Dark Ritual or Necropotence.",
  "syn": [
   "Polluted Delta",
   "Sunken Hollow",
   "Drowned Catacomb",
   "Dark Ritual"
  ]
 }
];
