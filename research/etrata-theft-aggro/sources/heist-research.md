# Etrata heist aggro: card research (generated 2026-10-06)

Every card below was checked against Scryfall's bulk data of 2026-10-05 (`default_cards` and `rulings`, read offline by `local/scryfall/bulk-index.js`):
- **Oracle text** is copied from that data, character for character.
- **Legality**: every card listed is legal in Commander (the index only holds Commander-legal cards whose color identity is within blue-black).
- **Game Changer** is Scryfall's `game_changer` flag.
- **Price** is the cheapest nonfoil paper printing's `prices.usd` (TCGplayer's market price as Scryfall reports it), with that printing's Scryfall page and its TCGplayer product page.
- **Engine** says whether the game engine defines the card, and in which file.

## Closing: halving and doubling (combat-damage kills)

Pure aggro dealt about 15 damage a game against 120 total life. These turn one connection into half or all of a player's life, and Ramses turns one kill into the game.

### Bloodletter of Aclazotz
- {1}{B}{B}{B} · Creature — Vampire Demon · 2/4 · not a Game Changer · Commander: legal
- Price: $34.32 (The Lost Caverns of Ixalan Promos (PLCI 92p)): https://scryfall.com/card/plci/92p/bloodletter-of-aclazotz · https://www.tcgplayer.com/product/526862
- Engine: defined in `decks-cetrata.js` (simplified: Written as a trigger: whenever an opponent loses life during your turn, they lose that much life again. The total is the same (Virtus's half becomes all of it), but it's two losses, so Mindcrank mills and Exquisite Blood gains in two parts.)
- Why: doubles every life loss on our turn: a halving hit takes all of it

> Flying
> If an opponent would lose life during your turn, they lose twice that much life instead. (Damage causes loss of life.)

- Ruling (2023-11-10): Bloodletter of Aclazotz's last ability doesn't change the amount of damage dealt to opponents. For example, if a 1/1 creature with lifelink deals combat damage to an opponent on your turn, they would lose 2 life, but you'd still gain only 1 life.

### Quietus Spike
- {3} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $1.45 (Planechase 2012 (PC2 112)): https://scryfall.com/card/pc2/112/quietus-spike · https://www.tcgplayer.com/product/59630
- Engine: defined in `decks-heist.js`
- Why: equipment halver; no P/T change, so it keeps Tetsuko's evasion

> Equipped creature has deathtouch.
> Whenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.
> Equip {3}

- Ruling (2008-10-01): That player loses half their life after combat damage has been subtracted from the player's life total. The amount of life the player loses is determined as the triggered ability resolves.
- Ruling (2008-10-01): If multiple Quietus Spikes trigger at the same time, that player loses half their life when the first ability resolves, then loses half of the remainder when the next ability resolves, and so on. The player does not lose the same amount each time.
- Ruling (2010-06-15): In a Two-Headed Giant game, after combat damage is dealt, Quietus Spike looks at that player's life total (which is the same as the team's life total) when determining how much life the team will lose, which basically means the team's life total is halved. Here's an example of the math: The team has 19 life, so the player has 19 life. Quietus Spike causes the team to lose 10 life (19 divided by 2, rounded up). The team's life total becomes 9 (19 minus 10).

### Scytheclaw
- {5} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $0.24 (Zendikar Rising Commander (ZNC 118)): https://scryfall.com/card/znc/118/scytheclaw · https://www.tcgplayer.com/product/222581
- Engine: defined in `decks-heist.js`
- Why: halver with its own 1/1 body; +1/+1 breaks Tetsuko

> Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)
> Equipped creature gets +1/+1.
> Whenever equipped creature deals combat damage to a player, that player loses half their life, rounded up.
> Equip {3}

- Ruling (2015-11-04): Scytheclaw's triggered ability triggers and resolves after combat damage is dealt. For example, if the Germ token deals 1 combat damage to a player with 10 life, combat damage will reduce that player's life total to 9. Then Scytheclaw's ability will cause the player to lose 5 life, leaving the player at 4.
- Ruling (2020-08-07): If the Germ token is destroyed, the Equipment remains on the battlefield as with any other Equipment.
- Ruling (2020-08-07): Like other Equipment, each Equipment with living weapon has an equip cost. You can pay this cost to attach an Equipment to another creature you control. Once the Germ token is no longer equipped, it will be put into your graveyard and subsequently cease to exist, unless another effect raises its toughness above 0.

### Shredder, Shadow Master
- {3}{B}{B} · Legendary Creature — Human Ninja · 5/5 · not a Game Changer · Commander: legal
- Price: $1.43 (Teenage Mutant Ninja Turtles Eternal (TMC 20)): https://scryfall.com/card/tmc/20/shredder-shadow-master · https://www.tcgplayer.com/product/679112
- Engine: defined in `decks-heist.js`
- Why: attacks all three opponents at once, each hit halves

> Whenever Shredder attacks a player, for each other opponent, create a token that's a copy of Shredder tapped and attacking that player, except it isn't legendary. Sacrifice those tokens at end of combat.
> Whenever Shredder deals combat damage to a player, that player loses half their life, rounded up.

- Ruling (2026-01-27): The token copies will have Shredder's abilities.
- Ruling (2026-01-27): In the unusual case where Shredder becomes a copy of something else while his last ability is on the stack but before it resolves, the tokens will enter as a copy of whatever Shredder is copying.
- Ruling (2026-01-27): Although the token copies created by Shredder's first ability enter attacking, they were never declared as attacking creatures. Abilities that trigger whenever a creature attacks won't trigger when those tokens enter attacking.

### Grievous Wound
- {3}{B}{B} · Enchantment — Aura · not a Game Changer · Commander: legal
- Price: $0.69 (Duskmourn: House of Horror (DSK 102)): https://scryfall.com/card/dsk/102/grievous-wound · https://www.tcgplayer.com/product/575280
- Engine: defined in `decks-heist.js` (simplified: The enchanted opponent is chosen as it enters (it isn't targeted, so a hexproof player can be chosen). It goes to the graveyard when that player leaves the game.)
- Why: every source that damages the enchanted player halves them

> Enchant player
> Enchanted player can't gain life.
> Whenever enchanted player is dealt damage, they lose half their life, rounded up.

- Ruling (2024-09-20): If an effect says to set the enchanted player's life total to a number that's higher than their current life total, that player's life total won't change.
- Ruling (2024-09-20): Grievous Wound's last ability triggers only once whenever enchanted player is dealt combat damage, no matter how many creatures deal combat damage to them at the same time.
- Ruling (2024-09-20): Spells and abilities that cause the enchanted player to gain life still resolve while Grievous Wound is on the battlefield. The enchanted player won't gain life, but any other effects of that spell or ability will still happen.

### Radioactive Man
- {4}{B} · Legendary Creature — Human Scientist Villain · 3/5 · not a Game Changer · Commander: legal
- Price: $0.28 (Marvel Super Heroes Commander (MSC 665)): https://scryfall.com/card/msc/665/radioactive-man · https://www.tcgplayer.com/product/697265
- Engine: defined in `decks-heist.js`
- Why: a 5-mana deathtouch halver

> Deathtouch
> Whenever Radioactive Man deals combat damage to a player, that player loses half their life, rounded up.

### Unstoppable Slasher
- {2}{B} · Creature — Zombie Assassin · 2/3 · not a Game Changer · Commander: legal
- Price: $4.48 (Duskmourn: House of Horror (DSK 294)): https://scryfall.com/card/dsk/294/unstoppable-slasher · https://www.tcgplayer.com/product/576893
- Engine: defined in `cards-etrata.js`
- Why: 3-mana deathtouch Assassin halver that comes back

> Deathtouch
> Whenever this creature deals combat damage to a player, they lose half their life, rounded up.
> When this creature dies, if it had no counters on it, return it to the battlefield tapped under its owner's control with two stun counters on it.

### Virtus the Veiled
- {2}{B} · Legendary Creature — Azra Assassin · 1/1 · not a Game Changer · Commander: legal
- Price: $8.31 (Battlebond (BBD 7)): https://scryfall.com/card/bbd/7/virtus-the-veiled · https://www.tcgplayer.com/product/167533
- Engine: defined in `decks-etrata4.js` (simplified: Partner with does nothing here: Gorm isn't in the deck.)
- Why: 3-mana 1/1 deathtouch Assassin halver: unblockable with Tetsuko

> Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)
> Deathtouch
> Whenever Virtus deals combat damage to a player, that player loses half their life, rounded up.

- Ruling (2018-06-08): Note that the target player searches their library (which may be affected by effects such as that of Stranglehold) and that the card they find is revealed, even though these words aren't included in the ability's reminder text.
- Ruling (2018-06-08): "Partner with [name]" represents two abilities. The first is a triggered ability: "When this permanent enters the battlefield, target player may search their library for a card named [name], reveal it, put it into their hand, then shuffle their library."
- Ruling (2018-06-08): An effect that checks whether you control your commander is satisfied if you control one or both of your two commanders.

### Ramses, Assassin Lord
- {2}{U}{B} · Legendary Creature — Human Assassin · 4/4 · not a Game Changer · Commander: legal
- Price: $2.65 (Dominaria United Commander (DMC 39)): https://scryfall.com/card/dmc/39/ramses-assassin-lord · https://www.tcgplayer.com/product/282769
- Engine: defined in `cards-etrata.js`
- Why: one opponent dying after an Assassin attacked them wins the game

> Deathtouch
> Other Assassins you control get +1/+1.
> Whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.

- Ruling (2022-09-09): For the last ability to trigger, an Assassin you controlled must have attacked the player. Attacking a planeswalker the player controls won’t count.
- Ruling (2022-09-09): Similarly, if an Assassin enters the battlefield under your control attacking a player, that creature didn’t “attack” and won’t cause this ability to trigger.
- Ruling (2022-09-09): As long as that player was attacked this turn by an Assassin you controlled, Ramses, Assassin Lord’s last ability triggers when that player loses the game for any reason, not just due to combat damage. This is true even if the Assassin is no longer on the battlefield, no longer under your control, or no longer an Assassin at the time that player loses the game.

## Extra combats, double strike and extra turns

No blue, black or colorless extra-combat card had been found. The Scryfall search `o:"additional combat" id<=ub legal:commander` finds Genji Glove (colorless), Illusionist's Gambit (on an opponent's turn, for their attack) and Swinging Ship (an Attraction).

### Genji Glove
- {5} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $7.93 (Final Fantasy (FIN 258)): https://scryfall.com/card/fin/258/genji-glove · https://www.tcgplayer.com/product/634431
- Engine: defined in `decks-heist.js`
- Why: colorless: double strike and an extra combat each turn

> Equipped creature has double strike.
> Whenever equipped creature attacks, if it's the first combat phase of the turn, untap it. After this phase, there is an additional combat phase.
> Equip {3}

### Leyline Axe
- {4} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $4.40 (Foundations (FDN 485)): https://scryfall.com/card/fdn/485/leyline-axe · https://www.tcgplayer.com/product/591206
- Engine: defined in `decks-heist.js`
- Why: double strike and trample, free in the opening hand

> If this card is in your opening hand, you may begin the game with it on the battlefield.
> Equipped creature gets +1/+1 and has double strike and trample.
> Equip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)

- Ruling (2024-11-08): A player's "opening hand" is the hand of cards the player has after all players have taken mulligans. If players have any cards in hand that allow actions to be taken with them from a player's opening hand, the starting player takes all such actions first in any order, followed by each other player in turn order. Then the first turn begins.

### Fireshrieker
- {3} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $0.21 (Foundations (FDN 674)): https://scryfall.com/card/fdn/674/fireshrieker · https://www.tcgplayer.com/product/591081
- Engine: defined in `decks-heist.js`
- Why: double strike for {3}, equip {2}

> Equipped creature has double strike. (It deals both first-strike and regular combat damage.)
> Equip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)

### Time Warp
- {3}{U}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $6.96 (Marvel Super Heroes Commander (MSC 788)): https://scryfall.com/card/msc/788/time-warp · https://www.tcgplayer.com/product/697233
- Engine: defined in `` (simplified: You always target yourself.)
- Why: extra turn

> Target player takes an extra turn after this one.

- Ruling (2022-12-08): If multiple "extra turn" effects resolve in the same turn, take them in the reverse of the order that the effects resolved. In other words, the most recently created extra turn is taken first.

### Temporal Manipulation
- {3}{U}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $5.04 (Mystery Booster 2 (MB2 174)): https://scryfall.com/card/mb2/174/temporal-manipulation · https://www.tcgplayer.com/product/563213
- Engine: defined in ``
- Why: extra turn

> Take an extra turn after this one.

- Ruling (2022-12-08): If multiple "extra turn" effects resolve in the same turn, take them in the reverse of the order that the effects resolved. In other words, the most recently created extra turn is taken first.

### Capture of Jingzhou
- {3}{U}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $7.14 (Secret Lair Drop (SLD 2149)): https://scryfall.com/card/sld/2149/capture-of-jingzhou · https://www.tcgplayer.com/product/660637
- Engine: defined in ``
- Why: extra turn

> Take an extra turn after this one.

### Notorious Throng
- {3}{U} · Kindred Sorcery — Rogue · not a Game Changer · Commander: legal
- Price: $3.33 (Zendikar Rising Commander (ZNC 33)): https://scryfall.com/card/znc/33/notorious-throng · https://www.tcgplayer.com/product/222380
- Engine: defined in `decks-heist.js`
- Why: fliers for the damage dealt this turn; with prowl, an extra turn

> Prowl {5}{U} (You may cast this for its prowl cost if you dealt combat damage to a player this turn with a Rogue.)
> Create X 1/1 black Faerie Rogue creature tokens with flying, where X is the damage dealt to your opponents this turn. If this spell's prowl cost was paid, take an extra turn after this one.

- Ruling (2008-04-01): To determine the value of X, this spell looks back over the course of the turn and counts all damage dealt by all sources to players who are currently your opponents, as well as damage dealt by all sources to players who were your opponents at the time they left the game.
- Ruling (2024-06-07): Kindred is a card type that allows noncreature cards to have creature types. For example, Echoes of Eternity is an Eldrazi (although not a creature) while on the battlefield and an Eldrazi card (although not a creature card) in zones other than the battlefield.
- Ruling (2024-06-07): While it appears only on cards that already have other card types, kindred is a card type and will be counted by effects that refer to the number of card types among cards in a zone.

### Alrund's Epiphany
- {5}{U}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $3.13 (Kaldheim (KHM 295)): https://scryfall.com/card/khm/295/alrunds-epiphany · https://www.tcgplayer.com/product/230098
- Engine: not in the engine
- Why: extra turn and two fliers (7 mana)

> Create two 1/1 blue Bird creature tokens with flying. Take an extra turn after this one. Exile Alrund's Epiphany.
> Foretell {4}{U}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)

- Ruling (2021-02-05): If you're casting a foretold card from exile for its foretell cost, you can't choose to cast it for any other alternative costs. You can, however, pay additional costs, such as kicker costs. If the card has any mandatory additional costs, those must be paid to cast the spell.
- Ruling (2021-02-05): Because exiling a card with foretell from your hand is a special action, you can do so any time you have priority during your turn, including in response to spells and abilities. Once you announce you're taking the action, no other player can respond by trying to remove the card from your hand.
- Ruling (2021-02-05): Exiling Alrund's Epiphany as it resolves is part of its effect. If Alrund's Epiphany doesn't resolve, it will be put into its owner's graveyard. If it's exiled this way, it's exiled face up and doesn't become foretold.

## Turning steals into value without a flip

Each cloak is a stolen card. These draw, make mana or pump for it.

### Satoru, the Infiltrator
- {U}{B} · Legendary Creature — Human Ninja Rogue · 2/3 · not a Game Changer · Commander: legal
- Price: $0.77 (Outlaws of Thunder Junction Promos (POTJ 230p)): https://scryfall.com/card/potj/230p/satoru-the-infiltrator · https://www.tcgplayer.com/product/546034
- Engine: defined in `decks-heist.js` (simplified: Cloaked, manifested and ninjutsu'd creatures enter without being cast; a creature Etrata casts for free was cast with no mana spent. Turning a creature face up isn't entering.)
- Why: draws when cloaks and ninjutsu creatures enter

> Menace
> Whenever Satoru and/or one or more other nontoken creatures you control enter, if none of them were cast or no mana was spent to cast them, draw a card.

- Ruling (2024-04-12): If you cast a creature spell without paying its mana cost but you paid mana for additional costs or cost increases (such as from Aven Interrupter), Satoru's last ability won't trigger.

### They Came from the Pipes
- {4}{U} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.33 (Duskmourn: House of Horror Commander (DSC 14)): https://scryfall.com/card/dsc/14/they-came-from-the-pipes · https://www.tcgplayer.com/product/577804
- Engine: defined in `cards-etrata.js`
- Why: draws for each face-down creature entering

> When this enchantment enters, manifest dread twice. (To manifest dread, look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)
> Whenever a face-down creature you control enters, draw a card.

- Ruling (2024-09-20): Turning a permanent face up or face down doesn't change whether that permanent is tapped or untapped.
- Ruling (2024-09-20): Any time you have priority, you can turn a manifested permanent you control face up by revealing that it's a creature card (ignoring any copy effects or type-changing effects that might be applying to it) and paying its mana cost. This is a special action. It doesn't use the stack and can't be responded to.
- Ruling (2024-09-20): You must ensure that your face-down spells and permanents can be easily differentiated from each other. You're not allowed to mix up the cards that represent them on the battlefield to confuse other players. The order in which they entered should remain clear, as well as what ability caused them to be face down. (This includes manifest, disguise, cloak, morph, and a few older effects that turn cards face down.) Common methods for doing this include using markers or dice, or simply placing them in order on the battlefield.

### Glitch Interpreter
- {2}{U} · Creature — Human Wizard · 2/3 · not a Game Changer · Commander: legal
- Price: $0.28 (Duskmourn: House of Horror Commander (DSC 13)): https://scryfall.com/card/dsc/13/glitch-interpreter · https://www.tcgplayer.com/product/577796
- Engine: defined in `cards-etrata.js`
- Why: draws when colorless (face-down) creatures connect

> When this creature enters, if you control no face-down permanents, return this creature to its owner's hand and manifest dread.
> Whenever one or more colorless creatures you control deal combat damage to a player, draw a card.

- Ruling (2024-09-20): If a face-down creature loses its abilities, it can't be turned face up with a disguise or morph ability because it will no longer have that ability (or the associated cost) once face up.
- Ruling (2024-09-20): If a manifested creature would have disguise or morph if it were face up, you may also turn it face up by paying its disguise or morph cost, as appropriate.
- Ruling (2024-09-20): At any time, you can look at a face-down spell or permanent you control. You can't look at face-down permanents or spells you don't control unless an effect instructs or allows you to do so.

### Thieving Amalgam
- {5}{B}{B} · Creature — Ape Snake · 6/7 · not a Game Changer · Commander: legal
- Price: $0.79 (Outlaws of Thunder Junction Commander (OTC 150)): https://scryfall.com/card/otc/150/thieving-amalgam · https://www.tcgplayer.com/product/545183
- Engine: defined in `decks-heist.js`
- Why: manifests each opponent's top card in their upkeep; stolen creatures dying drain 2

> At the beginning of each opponent's upkeep, you manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)
> Whenever a creature you control but don't own dies, its owner loses 2 life and you gain 2 life.

- Ruling (2019-08-23): Your opponents can't look at the card they own that you manifested.
- Ruling (2019-08-23): If a creature you control but don't own dies at the same time that its owner leaves the game, Thieving Amalgam's last ability triggers. No player loses 2 life, but you gain 2 life.
- Ruling (2019-08-23): In a multiplayer game, if a player leaves the game, all cards that player owns leave as well. If you leave the game, the creatures you manifested with Thieving Amalgam's triggered ability are exiled.

### Orochi Soul-Reaver
- {5}{B} · Creature — Snake Ninja Rogue · 5/4 · not a Game Changer · Commander: legal
- Price: $7.05 (Outlaws of Thunder Junction Commander (OTC 58)): https://scryfall.com/card/otc/58/orochi-soul-reaver · https://www.tcgplayer.com/product/545439
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: Treasure and a manifest of their top card per player hit

> Ninjutsu {3}{B} ({3}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever one or more creatures you control deal combat damage to a player, create a Treasure token and manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)

- Ruling (2024-04-12): The ninjutsu ability can be activated only after blockers have been declared. Before then, attacking creatures are neither blocked nor unblocked.
- Ruling (2024-04-12): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2024-04-12): As you activate a ninjutsu ability, you reveal the Ninja card in your hand and return the attacking creature to its owner’s hand. The Ninja card stays revealed and isn’t put onto the battlefield until the ability resolves. If it leaves your hand before then, it won’t enter the battlefield at all.

### Grim Hireling
- {3}{B} · Creature — Tiefling Rogue · 3/2 · not a Game Changer · Commander: legal
- Price: $10.44 (The List (PLST AFC-25)): https://scryfall.com/card/plst/AFC-25/grim-hireling · https://www.tcgplayer.com/product/582347
- Engine: defined in `decks-heist.js` (simplified: X is chosen and the Treasures are sacrificed as the ability resolves.)
- Why: two Treasures per player hit

> Whenever one or more creatures you control deal combat damage to a player, create two Treasure tokens.
> {B}, Sacrifice X Treasures: Target creature gets -X/-X until end of turn. Activate only as a sorcery.

### Forsaken Monument
- {5} · Legendary Artifact · not a Game Changer · Commander: legal
- Price: $3.40 (Foundations Commander (FDC 258)): https://scryfall.com/card/fdc/258/forsaken-monument · https://www.tcgplayer.com/product/719188
- Engine: defined in `decks-heist.js` (simplified: The extra {C} is counted when mana is paid (a source that makes {C} makes one more).)
- Why: face-down (colorless) creatures +2/+2

> Colorless creatures you control get +2/+2.
> Whenever you tap a permanent for {C}, add an additional {C}.
> Whenever you cast a colorless spell, you gain 2 life.

- Ruling (2020-09-25): If you tap a permanent for more than one {C}, you add only one additional {C}.
- Ruling (2020-09-25): Forsaken Monument’s last ability won’t trigger when you play a land.
- Ruling (2020-09-25): You “tap a permanent for {C}” only if you activate a mana ability of that permanent that includes the {T} symbol in its cost, and only if it produces one or more {C} as it resolves.

### Garland, Royal Kidnapper
- {2}{U}{B} · Legendary Creature — Human Knight · 3/4 · not a Game Changer · Commander: legal
- Price: $8.31 (Final Fantasy Commander (FIC 442)): https://scryfall.com/card/fic/442/garland-royal-kidnapper · https://www.tcgplayer.com/product/656874
- Engine: not in the engine
- Why: creatures you control but don't own +2/+2 (monarch: not in the engine)

> When Garland enters, target opponent becomes the monarch.
> Whenever an opponent becomes the monarch, gain control of target creature that player controls for as long as they're the monarch.
> Creatures you control but don't own get +2/+2 and can't be sacrificed.

- Ruling (2025-10-02): While Garland is on the battlefield, creatures you control but don't own can't be sacrificed for any reason. If an effect instructs you to sacrifice one of them, you can't and it remains on the battlefield. You also can't sacrifice one of them to pay a cost that requires you to sacrifice a creature.
- Ruling (2025-10-02): If an effect instructs you to sacrifice a creature and you control any creatures other than ones you control but don't own, you must sacrifice one of those other creatures. You can't try to sacrifice a creature you control but don't own.
- Ruling (2025-10-02): If the monarch leaves the game during another player's turn, that player becomes the monarch. If the monarch leaves the game during their turn, the next player in turn order becomes the monarch.

### Roaming Throne
- {4} · Artifact Creature — Golem · 4/4 · not a Game Changer · Commander: legal
- Price: $49.25 (The Lost Caverns of Ixalan (LCI 344)): https://scryfall.com/card/lci/344/roaming-throne · https://www.tcgplayer.com/product/525241
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: Assassin: Etrata's cloak trigger happens twice

> Ward {2}
> As this creature enters, choose a creature type.
> This creature is the chosen type in addition to its other types.
> If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time.

- Ruling (2023-11-10): Roaming Throne's last ability doesn't copy the triggered ability; it just causes the ability to trigger an additional time. Any choices made as you put the ability onto the stack, such as modes and targets, are made separately for each instance of the ability. Any choices made on resolution, such as whether to put counters on a permanent, are also made individually.
- Ruling (2023-11-10): If you control two Roaming Thrones with the same chosen creature type, triggered abilities of other creatures you control of the chosen type trigger three times. Three such Roaming Thrones result in four triggered abilities, and so on.

### Spark Double
- {3}{U} · Creature — Illusion · 0/0 · not a Game Changer · Commander: legal
- Price: $5.03 (Marvel Super Heroes Commander (MSC 279)): https://scryfall.com/card/msc/279/spark-double · https://www.tcgplayer.com/product/698034
- Engine: defined in `cards-etrata.js`
- Why: a second Etrata

> You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary.

- Ruling (2019-05-03): If the copied permanent has {X} in its mana cost, X is considered to be 0.
- Ruling (2019-05-03): Any enters-the-battlefield abilities of the copied permanent will trigger when Spark Double enters the battlefield. Any “as [this permanent] enters the battlefield” or “[this permanent] enters the battlefield with” abilities of the chosen permanent will also work.
- Ruling (2019-05-03): If the chosen permanent is a token, Spark Double copies the original characteristics of that token as stated by the effect that created the token. Spark Double doesn’t become a token in this case.

### Auton Soldier
- {4}{U}{U} · Artifact Creature — Alien Soldier · 0/0 · not a Game Changer · Commander: legal
- Price: $11.67 (Doctor Who (WHO 36)): https://scryfall.com/card/who/36/auton-soldier · https://www.tcgplayer.com/product/519779
- Engine: defined in `decks-heist.js` (simplified: The myriad tokens always go in, and only at players.)
- Why: a second Etrata with myriad (each token cloaks too)

> You may have this creature enter as a copy of any creature on the battlefield, except it isn't legendary, is an artifact in addition to its other types, and has myriad. (Whenever it attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)

- Ruling (2023-10-13): If the defending player is your only opponent, no tokens are put onto the battlefield.
- Ruling (2023-10-13): Although the tokens enter the battlefield attacking, they were never declared as attackers. Abilities that trigger whenever a creature attacks won't trigger, including the myriad ability of the tokens. If there any costs to have a creature attack, those costs won't apply to the tokens.
- Ruling (2023-10-13): The tokens all enter the battlefield at the same time.

### Ghostly Flicker
- {2}{U} · Instant · not a Game Changer · Commander: legal
- Price: $1.16 (The List (PLST KHC-39)): https://scryfall.com/card/plst/KHC-39/ghostly-flicker · https://www.tcgplayer.com/product/581318
- Engine: defined in `decks-heist.js` (simplified: A commander exiled this way goes to the command zone instead (the game always makes that choice).)
- Why: a cloaked card returns face up and ours for good

> Exile two target artifacts, creatures, and/or lands you control, then return those cards to the battlefield under your control.

- Ruling (2017-03-14): The two targets can have different card types. For example, you can target one artifact and one creature with Ghostly Flicker.

### Hostage Taker
- {2}{U}{B} · Creature — Human Pirate · 2/3 · not a Game Changer · Commander: legal
- Price: $0.21 (Forgotten Realms Commander (AFC 186)): https://scryfall.com/card/afc/186/hostage-taker · https://www.tcgplayer.com/product/243937
- Engine: defined in `decks-heist.js`
- Why: removal you can cast

> When this creature enters, exile another target creature or artifact until this creature leaves the battlefield. You may cast that card for as long as it remains exiled, and mana of any type can be spent to cast that spell.

- Ruling (2017-09-29): In a multiplayer game, if a player leaves the game, all cards that player owns leave as well. If you leave the game, any spell or permanent cards you control from Hostage Taker's ability are exiled.
- Ruling (2017-09-29): In a multiplayer game, if Hostage Taker's owner leaves the game while the card is still exiled and another player owns that card, the exiled card will return to the battlefield under its owner's control. Because the one-shot effect that returns the card isn't an ability that goes on the stack, it won't cease to exist along with the leaving player's spells and abilities on the stack.
- Ruling (2017-09-29): If it's still in exile, the exiled card returns to the battlefield immediately after Hostage Taker leaves the battlefield. Nothing happens between the two events, including state-based actions.

### Rogue Class
- {U}{B} · Enchantment — Class · not a Game Changer · Commander: legal
- Price: $1.19 (Adventures in the Forgotten Realms (AFR 230)): https://scryfall.com/card/afr/230/rogue-class · https://www.tcgplayer.com/product/243341
- Engine: defined in `decks-heist.js` (simplified: The exiled cards are face up in the game's exile (the bots never look at them).)
- Why: a second steal on each hit, team menace

> (Gain the next level as a sorcery to add its ability.)
> Whenever a creature you control deals combat damage to a player, exile the top card of that player's library face down. You may look at it for as long as it remains exiled.
> {1}{U}{B}: Level 2
> Creatures you control have menace.
> {2}{U}{B}: Level 3
> You may play cards exiled with this Class, and you may spend mana as though it were mana of any color to cast those spells.

- Ruling (2021-07-23): Gaining a level is a normal activated ability. It uses the stack and can be responded to.
- Ruling (2021-07-23): If you have more than one Rogue Class on the battlefield, they each track exiled cards individually.
- Ruling (2021-07-23): Each Class starts with only the first of three class abilities. As the first level ability resolves, the Class becomes level 2 and gains the second class ability. As the second level ability resolves, the Class becomes level 3 and gains the third class ability.

### Predators' Hour
- {1}{B} · Sorcery · not a Game Changer · Commander: legal
- Price: $0.35 (Crimson Vow Commander (VOC 21)): https://scryfall.com/card/voc/21/predators-hour · https://www.tcgplayer.com/product/254353
- Engine: defined in `decks-heist.js` (simplified: The exiled cards are face up in the game's exile (the bots never look at them).)
- Why: team menace and a steal per hit for a turn

> Until end of turn, creatures you control gain menace and "Whenever this creature deals combat damage to a player, exile the top card of that player's library face down. You may look at and play that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell."

- Ruling (2021-11-19): You must pay all costs to play cards exiled this way, and you must follow all normal timing permissions and restrictions. For example, if you play a land this way, you may do so only during your main phase while the stack is empty and only if you haven't yet played a land (unless another effect allows you to play additional lands).

### Reno and Rude
- {1}{B} · Legendary Creature — Human Assassin · 2/1 · not a Game Changer · Commander: legal
- Price: $0.18 (Final Fantasy (FIN 113)): https://scryfall.com/card/fin/113/reno-and-rude · https://www.tcgplayer.com/product/632634
- Engine: defined in `decks-heist.js`
- Why: 2-mana menace Assassin that steals its hit

> Menace
> Whenever Reno and Rude deals combat damage to a player, exile the top card of that player's library. Then you may sacrifice another creature or artifact. If you do, you may play the exiled card this turn, and mana of any type can be spent to cast it.

- Ruling (2025-06-06): You pay all costs and follow all timing rules for cards played this way. For example, if the exiled card is a land card, you may play it only during your main phase while the stack is empty and only if you have an available land play remaining.

### Staff of Eden, Vault's Key
- {6} · Legendary Artifact · not a Game Changer · Commander: legal
- Price: $3.31 (Assassin's Creed (ACR 76)): https://scryfall.com/card/acr/76/staff-of-eden-vaults-key · https://www.tcgplayer.com/product/556340
- Engine: not in the engine
- Why: draws a card per permanent you control but don't own (not built)

> When Staff of Eden enters, put target legendary permanent card not named Staff of Eden, Vault's Key from a graveyard onto the battlefield under your control.
> {T}: Draw a card for each permanent you control but don't own.

- Ruling (2024-07-05): The owner of a token is the player who created that token or, in the case of a resolving copy of a permanent spell that became a token, the player who controlled that spell as it resolved.

### Become Anonymous
- {2}{U}{U} · Instant · not a Game Changer · Commander: legal
- Price: $0.33 (Assassin's Creed (ACR 14)): https://scryfall.com/card/acr/14/become-anonymous · https://www.tcgplayer.com/product/555800
- Engine: not in the engine
- Why: instant: one creature and two cards become three cloaks (not built)

> Exile target nontoken creature you own and the top two cards of your library in a face-down pile, shuffle that pile, then cloak those cards. They enter tapped. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)

- Ruling (2024-07-05): To cloak a card, put it onto the battlefield face down. It becomes a 2/2 face-down creature card with ward {2} and no name, mana cost, or creature types. It’s colorless and has a mana value of 0. Other effects that apply to the permanent can still grant it any characteristics it doesn’t have or change the characteristics it does have.
- Ruling (2024-07-05): If a face-down spell leaves the stack and goes to any zone other than the battlefield (if it was countered, for example), you must reveal it. Similarly, if a face-down permanent leaves the battlefield, you must reveal it. You must also reveal all face-down spells and permanents you control if you leave the game or the game ends.
- Ruling (2024-07-05): Because face-down creatures don’t have a name, they can’t have the same name as any other creature, even another face-down creature.

### Ixidron
- {3}{U}{U} · Creature — Illusion · */* · not a Game Changer · Commander: legal
- Price: $0.41 (Commander 2014 (C14 116)): https://scryfall.com/card/c14/116/ixidron · https://www.tcgplayer.com/product/94277
- Engine: not in the engine
- Why: turns every other nontoken creature face down (not built)

> As this creature enters, turn all other nontoken creatures face down. (They're 2/2 creatures.)
> Ixidron's power and toughness are each equal to the number of face-down creatures on the battlefield.

- Ruling (2006-09-25): Turning a face-down creature face-down typically has no effect; the creature's status is unchanged.
- Ruling (2006-09-25): If Ixidron and another creature are entering at the same time, the other creature enters face up.
- Ruling (2006-09-25): The controller of a face-down creature can look at it at any time, even if it doesn't have morph. Other players can't, but the rules for face-down permanents state that "you must ensure at all times that your face-down spells and permanents can be easily differentiated from each other." As a result, all players must be able to figure out what each of the creatures Ixidron turned face down is.

### Conspiracy
- {3}{B}{B} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.42 (Assassin's Creed (ACR 88)): https://scryfall.com/card/acr/88/conspiracy · https://www.tcgplayer.com/product/555434
- Engine: not in the engine
- Why: type changer that replaces types (not built: Arcane Adaptation does the job here)

> As this enchantment enters, choose a creature type.
> Creatures you control are the chosen type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.

- Ruling (2004-10-04): It does not replace any use of creature types in card text.
- Ruling (2004-10-04): This can grant a creature type to animated lands and artifacts that would otherwise have no creature type.
- Ruling (2005-08-01): "Legend" is no longer a creature type, and may not be chosen.

## Evasion for the whole team

Stolen 2/2s and 1/1 Assassins need to connect.

### Vela the Night-Clad
- {4}{U}{B} · Legendary Creature — Human Wizard · 4/4 · not a Game Changer · Commander: legal
- Price: $0.32 (Starter Commander Decks (SCD 256)): https://scryfall.com/card/scd/256/vela-the-night-clad · https://www.tcgplayer.com/product/456840
- Engine: defined in `decks-heist.js`
- Why: others get intimidate: a colorless face-down creature can only be blocked by artifact creatures

> Intimidate (This creature can't be blocked except by artifact creatures and/or creatures that share a color with it.)
> Other creatures you control have intimidate.
> Whenever Vela or another creature you control leaves the battlefield, each opponent loses 1 life.

- Ruling (2012-06-01): If Vela leaves the battlefield at the same time as other creatures you control, its ability will trigger for each of those creatures.

### Archetype of Imagination
- {4}{U}{U} · Enchantment Creature — Human Wizard · 3/2 · not a Game Changer · Commander: legal
- Price: $0.92 (Commander 2018 (C18 81)): https://scryfall.com/card/c18/81/archetype-of-imagination · https://www.tcgplayer.com/product/171245
- Engine: defined in `decks-heist.js`
- Why: our creatures fly, theirs can't

> Creatures you control have flying.
> Creatures your opponents control lose flying and can't have or gain flying.

- Ruling (2014-02-01): While you control an Archetype, continuous effects generated by the resolution of spells and abilities that would give the specified ability to creatures your opponents control aren't created. For example, if you control Archetype of Courage, a spell cast by an opponent that gives creatures they control first strike wouldn't cause the creatures to have first strike, even if later in the turn Archetype of Courage left the battlefield. (If the spell has additional effects, such as raising the power of the creatures, those effects will apply as normal.)
- Ruling (2014-02-01): The Archetype's second ability applies to each creature controlled by any of your opponents, no matter when it entered the battlefield.
- Ruling (2014-02-01): If you and an opponent each control the same Archetype, no creature controlled by any player will have the appropriate ability.

### Levitation
- {2}{U}{U} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.26 (Ninth Edition (9ED 83)): https://scryfall.com/card/9ed/83/levitation · https://www.tcgplayer.com/product/12716
- Engine: defined in `decks-heist.js`
- Why: team flying

> Creatures you control have flying.

### Intimidation
- {2}{B}{B}{B} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.90 (Mercadian Masques (MMQ 142)): https://scryfall.com/card/mmq/142/intimidation · https://www.tcgplayer.com/product/6569
- Engine: defined in `decks-heist.js`
- Why: team fear

> Creatures you control have fear. (They can't be blocked except by artifact creatures and/or black creatures.)

### Eldrazi Monument
- {5} · Artifact · not a Game Changer · Commander: legal
- Price: $9.14 (The List (PLST CMA-216)): https://scryfall.com/card/plst/CMA-216/eldrazi-monument · https://www.tcgplayer.com/product/202949
- Engine: defined in `decks-heist.js`
- Why: +1/+1, flying, indestructible; a creature a turn

> Creatures you control get +1/+1 and have flying and indestructible.
> At the beginning of your upkeep, sacrifice a creature. If you can't, sacrifice this artifact.

- Ruling (2009-10-01): If you control any creatures as the triggered ability resolves, you must sacrifice one. You can’t choose to sacrifice Eldrazi Monument instead. You sacrifice the Monument only if you had no creatures to sacrifice.
- Ruling (2013-07-01): Lethal damage and effects that say “destroy” won’t cause a creature with indestructible to be put into the graveyard. However, a creature with indestructible can be put into the graveyard for a number of reasons. The most likely reasons are if it’s sacrificed, if it’s legendary and another legendary creature with the same name is controlled by the same player, or if its toughness is 0 or less.

### Interceptor, Shadow's Hound
- {2}{B}{B} · Legendary Creature — Dog · 4/3 · not a Game Changer · Commander: legal
- Price: $0.20 (Final Fantasy Commander (FIC 47)): https://scryfall.com/card/fic/47/interceptor-shadows-hound · https://www.tcgplayer.com/product/631109
- Engine: defined in `decks-etrata4.js`
- Why: Assassins have menace

> Menace
> Assassins you control have menace.
> Whenever you attack with one or more legendary creatures, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking.

- Ruling (2025-06-06): As Interceptor returns to the battlefield because of its triggered ability, you choose which player, planeswalker, or battle it's attacking. It doesn't have to attack the same player, planeswalker, or battle as your legendary creatures.
- Ruling (2025-06-06): Although Interceptor's last ability causes it to enter attacking, it was never declared as an attacking creature. Abilities that trigger whenever a creature attacks won't trigger when it enters attacking.

### Cover of Darkness
- {1}{B} · Enchantment · not a Game Changer · Commander: legal
- Price: $8.33 (Assassin's Creed (ACR 89)): https://scryfall.com/card/acr/89/cover-of-darkness · https://www.tcgplayer.com/product/541326
- Engine: defined in `cards-etrata.js` (simplified: The chosen type is always Assassin (every player's Assassins get fear).)
- Why: Assassins have fear

> As this enchantment enters, choose a creature type.
> Creatures of the chosen type have fear. (They can't be blocked except by artifact creatures and/or black creatures.)

### Winged Boots
- {1}{U} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $7.24 (Forgotten Realms Commander (AFC 20)): https://scryfall.com/card/afc/20/winged-boots · https://www.tcgplayer.com/product/243754
- Engine: defined in `decks-heist.js`
- Why: flying and ward {4}

> Equipped creature has flying and ward {4}. (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {4}.)
> Equip {1}

- Ruling (2021-07-23): If a player casts a spell that targets multiple permanents their opponent controls with ward, each of those ward abilities will trigger. If that player doesn't pay for all of them, the spell will be countered.

### Glen Elendra Liege
- {1}{U/B}{U/B}{U/B} · Creature — Faerie Knight · 2/3 · not a Game Changer · Commander: legal
- Price: $0.90 (Planechase Anthology (PCA 94)): https://scryfall.com/card/pca/94/glen-elendra-liege · https://www.tcgplayer.com/product/125431
- Engine: defined in `decks-heist.js`
- Why: blue and black anthem with flying

> Flying
> Other blue creatures you control get +1/+1.
> Other black creatures you control get +1/+1.

- Ruling (2008-05-01): The abilities are separate and cumulative. If another creature you control is both of the listed colors, it will get a total of +2/+2.

### Massacre Girl, Known Killer
- {2}{B}{B} · Legendary Creature — Human Assassin · 4/4 · not a Game Changer · Commander: legal
- Price: $0.58 (Lorwyn Eclipsed Commander (ECC 79)): https://scryfall.com/card/ecc/79/massacre-girl-known-killer · https://www.tcgplayer.com/product/671152
- Engine: defined in `decks-heist.js`
- Why: menace Assassin, team wither

> Menace
> Creatures you control have wither. (They deal damage to creatures in the form of -1/-1 counters.)
> Whenever a creature an opponent controls dies, if its toughness was less than 1, draw a card.

- Ruling (2024-02-02): Use the toughness of the creature as it last existed on the battlefield to determine whether or not Massacre Girl's ability triggers.
- Ruling (2024-02-02): Wither applies to any damage dealt to creatures by creatures you control. This includes combat damage as well as anything that causes creatures you control to deal noncombat damage, such as Incinerator of the Guilty's reflexive triggered ability or the effect of Hard-Hitting Question.

### Dolmen Gate
- {2} · Artifact · not a Game Changer · Commander: legal
- Price: $25.97 (The List (PLST LRW-256)): https://scryfall.com/card/plst/LRW-256/dolmen-gate · https://www.tcgplayer.com/product/202945
- Engine: defined in `decks-heist.js`
- Why: attacking creatures you control take no combat damage

> Prevent all combat damage that would be dealt to attacking creatures you control.

### Haunted One
- {2}{B} · Legendary Enchantment — Background · not a Game Changer · Commander: legal
- Price: $5.37 (Secret Lair Drop (SLD 2200)): https://scryfall.com/card/sld/2200/haunted-one · https://www.tcgplayer.com/product/658400
- Engine: defined in `decks-heist.js` (simplified: A Background in the 99: it works as written, on your commander. The commander's ability is written as a trigger of Haunted One.)
- Why: Background in the 99: Etrata becoming tapped gives every creature sharing a type +2/+0 and undying

> Commander creatures you own have "Whenever this creature becomes tapped, it and other creatures you control that share a creature type with it each get +2/+0 and gain undying until end of turn." (When a creature with undying dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner's control with a +1/+1 counter on it.)

- Ruling (2022-06-10): An effect that checks whether you control your commander is satisfied if you control one or both of your two commanders.
- Ruling (2022-06-10): If your Commander deck has two commanders, you can include only cards whose own color identities are also found in your commanders’ combined color identities.
- Ruling (2022-06-10): If a card refers to a commander creature you own, a Background won't usually be counted or included for that effect. If another spell or ability causes your Background to become a creature, however, it will be included. Any effect that refers to your commander or a commander you own or control without specifying creature will apply to a Background that is your commander, as appropriate.

### Sword Coast Sailor
- {1}{U} · Legendary Enchantment — Background · not a Game Changer · Commander: legal
- Price: $0.16 (Commander Legends: Battle for Baldur's Gate (CLB 98)): https://scryfall.com/card/clb/98/sword-coast-sailor · https://www.tcgplayer.com/product/272746
- Engine: defined in `decks-heist.js` (simplified: The commander's ability is written as a trigger of Sword Coast Sailor.)
- Why: Background in the 99: Etrata unblockable against the highest life total

> Commander creatures you own have "Whenever this creature attacks a player, if no opponent has more life than that player, this creature can't be blocked this turn."

- Ruling (2022-06-10): If you control a Background that grants an ability to commander creatures you own, and you own more than one commander creature, each of them will have that ability.
- Ruling (2022-06-10): An effect that checks whether you control your commander is satisfied if you control one or both of your two commanders.
- Ruling (2022-06-10): Once the game begins, your two commanders are tracked separately. If you cast one, you won’t have to pay an additional {2} the first time you cast the other. A player loses the game after having been dealt 21 combat damage from any one of them, not from both of them combined (although your Background won’t usually be a creature anyway).

### Reverse the Polarity
- {1}{U}{U} · Instant · not a Game Changer · Commander: legal
- Price: $0.49 (Doctor Who (WHO 54)): https://scryfall.com/card/who/54/reverse-the-polarity · https://www.tcgplayer.com/product/518883
- Engine: defined in `decks-heist.js` (simplified: Switching power and toughness isn't offered (the bots never chose it).)
- Why: instant: creatures can't be blocked this turn

> Choose one —
> • Counter all other spells.
> • Switch each creature's power and toughness until end of turn.
> • Creatures can't be blocked this turn.

- Ruling (2023-10-13): Effects that switch a creature's power and toughness apply after all other effects, regardless of when those effects began to apply. For instance, if you switch a 2/4 creature's power and toughness and then give it +2/+0 later in the turn, it's a 4/4 creature, not a 6/2 creature.
- Ruling (2023-10-13): Because damage remains marked on a creature until the cleanup step or an effect removes that damage, nonlethal damage dealt to a creature may become lethal if you switch its power and toughness during that turn.

### Akroma's Memorial
- {7} · Legendary Artifact · not a Game Changer · Commander: legal
- Price: $34.98 (Time Spiral Remastered (TSR 262)): https://scryfall.com/card/tsr/262/akromas-memorial · https://www.tcgplayer.com/product/234332
- Engine: defined in `decks-heist.js`
- Why: team flying, first strike, haste, protection from black and red (7 mana)

> Creatures you control have flying, first strike, vigilance, trample, haste, and protection from black and from red.

### Teferi's Veil
- {1}{U} · Enchantment · not a Game Changer · Commander: legal
- Price: $1.06 (Weatherlight (WTH 53)): https://scryfall.com/card/wth/53/teferis-veil · https://www.tcgplayer.com/product/6110
- Engine: defined in `decks-heist.js` (simplified: Written as one trigger at the end of combat: every creature of yours that attacked phases out.)
- Why: attackers phase out after combat (not built: they couldn't block)

> Whenever a creature you control attacks, it phases out at end of combat. (While it's phased out, it's treated as though it doesn't exist. It phases in before you untap during your next untap step.)

- Ruling (2008-04-01): The “at end of combat” ability triggers after combat damage resolves. Creatures dealt lethal damage in combat won’t be saved this way.

### Nanogene Conversion
- {3}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $10.12 (Doctor Who (WHO 49)): https://scryfall.com/card/who/49/nanogene-conversion · https://www.tcgplayer.com/product/519249
- Engine: not in the engine
- Why: every creature becomes an Etrata for a turn (not built: it copies the opponents' creatures too)

> Choose target creature you control. Each other creature becomes a copy of that creature until end of turn, except it isn't legendary.

- Ruling (2023-10-13): As the turn ends, the other creatures revert to what they were before. If two Nanogene Conversions are cast on the same turn, they'll both wear off at the same time.
- Ruling (2023-10-13): If the targeted creature is itself copying a creature, each other creature will become whatever it's copying, as modified by that copy effect.
- Ruling (2023-10-13): This effect can cause each other creature to stop being a creature. For example, if you target an animated Vehicle, only the printed wording will be copied—the crew effect that is making it a creature until end of turn won't be copied. Each other creature will become an unanimated copy of that Vehicle.

## Cheap connectors

The trace shows the deck too slow on turns 1 to 3.

### Assassin Initiate
- {B} · Creature — Human Assassin · 1/1 · not a Game Changer · Commander: legal
- Price: $0.28 (Assassin's Creed (ACR 22)): https://scryfall.com/card/acr/22/assassin-initiate · https://www.tcgplayer.com/product/555970
- Engine: defined in `decks-heist.js`
- Why: 1-mana Assassin

> {1}: This creature gains your choice of flying, deathtouch, or lifelink until end of turn.

### Hullcarver
- {B} · Artifact Creature — Robot Assassin · 1/1 · not a Game Changer · Commander: legal
- Price: $0.21 (Edge of Eternities (EOE 105)): https://scryfall.com/card/eoe/105/hullcarver · https://www.tcgplayer.com/product/642109
- Engine: defined in `decks-heist.js`
- Why: 1-mana artifact deathtouch Assassin

> Deathtouch

### Ruthless Ripper
- {B} · Creature — Human Assassin · 1/1 · not a Game Changer · Commander: legal
- Price: $0.10 (Khans of Tarkir (KTK 88)): https://scryfall.com/card/ktk/88/ruthless-ripper · https://www.tcgplayer.com/product/92891
- Engine: defined in `decks-heist.js` (simplified: Casting it face down isn't offered (its morph cost is revealing a card, which the game can't pay); it's a one-mana deathtouch Assassin here. A cloaked or manifested Ripper still turns up for {B}.)
- Why: 1-mana deathtouch Assassin

> Deathtouch
> Morph—Reveal a black card in your hand. (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)
> When this creature is turned face up, target player loses 2 life.

- Ruling (2014-09-20): You must ensure that your face-down spells and permanents can easily be differentiated from each other. You're not allowed to mix up the cards that represent them on the battlefield in order to confuse other players. The order they entered the battlefield should remain clear. Common methods for doing this include using markers or dice, or simply placing them in order on the battlefield.
- Ruling (2014-09-20): Any time you have priority, you may turn the face-down creature face up by revealing what its morph cost is and paying that cost. This is a special action. It doesn't use the stack and can't be responded to. Only a face-down permanent can be turned face up this way; a face-down spell cannot.
- Ruling (2014-09-20): When the spell resolves, it enters the battlefield as a 2/2 creature with no name, mana cost, creature types, or abilities. It's colorless and has a mana value of 0. Other effects that apply to the creature can still grant it any of these characteristics.

### Poison-Blade Mentor
- {1}{B} · Creature — Human Assassin · 2/1 · not a Game Changer · Commander: legal
- Price: $0.27 (Assassin's Creed (ACR 288)): https://scryfall.com/card/acr/288/poison-blade-mentor · https://www.tcgplayer.com/product/556338
- Engine: defined in `decks-heist.js`
- Why: 2-mana deathtouch Assassin

> Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)
> Whenever this creature attacks, another target Assassin you control gains deathtouch until end of turn.

### Evie Frye
- {1}{U} · Legendary Creature — Human Assassin · 2/1 · not a Game Changer · Commander: legal
- Price: $0.32 (Assassin's Creed (ACR 19)): https://scryfall.com/card/acr/19/evie-frye · https://www.tcgplayer.com/product/555811
- Engine: defined in `decks-heist.js` (simplified: Partner with: Jacob Frye isn't in the game, so the enters trigger does nothing.)
- Why: 2-mana Assassin looter that makes a creature unblockable

> Partner with Jacob Frye (When this creature enters, target player may put Jacob into their hand from their library, then shuffle.)
> {1}, {T}: Draw a card, then discard a card. When you discard a creature card this way, target creature you control can't be blocked this turn.

- Ruling (2024-07-05): To have two commanders, both must have the partner ability or corresponding “partner with” abilities as the game begins. A creature with a “partner with” ability can’t partner with any creature other than its designated partner. Losing a partner ability during the game doesn’t cause either to cease to be your commander.
- Ruling (2024-07-05): Both commanders start in the command zone, and the remaining 98 cards (or 58 cards in a Commander Draft game) of your deck are shuffled to become your library.
- Ruling (2024-07-05): Note that the target player searches their library (which may be affected by effects such as that of Stranglehold) and that the card they find is revealed, even though these words aren’t included in the ability’s reminder text.

### Slither Blade
- {U} · Creature — Snake Rogue · 1/2 · not a Game Changer · Commander: legal
- Price: $0.35 (Amonkhet (AKH 71)): https://scryfall.com/card/akh/71/slither-blade · https://www.tcgplayer.com/product/130277
- Engine: defined in `decks-heist.js`
- Why: 1-mana unblockable

> This creature can't be blocked.

### Triton Shorestalker
- {U} · Creature — Merfolk Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.32 (Journey into Nyx (JOU 56)): https://scryfall.com/card/jou/56/triton-shorestalker · https://www.tcgplayer.com/product/82349
- Engine: defined in `decks-heist.js`
- Why: 1-mana unblockable

> This creature can't be blocked.

### Invisible Stalker
- {1}{U} · Creature — Human Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.81 (The List (PLST ZNC-27)): https://scryfall.com/card/plst/ZNC-27/invisible-stalker · https://www.tcgplayer.com/product/581339
- Engine: defined in `decks-heist.js`
- Why: 2-mana hexproof unblockable

> Hexproof (This creature can't be the target of spells or abilities your opponents control.)
> This creature can't be blocked.

### Gray Harbor Merfolk
- {1}{U} · Creature — Merfolk Rogue · 0/3 · not a Game Changer · Commander: legal
- Price: $0.22 (Commander Legends: Battle for Baldur's Gate (CLB 75)): https://scryfall.com/card/clb/75/gray-harbor-merfolk · https://www.tcgplayer.com/product/273354
- Engine: defined in `decks-heist.js`
- Why: 2-mana 2/3 unblockable with Etrata out

> This creature can't be blocked.
> This creature gets +2/+0 as long as you control a commander that's a creature or planeswalker.

### Shoreline Looter
- {1}{U} · Creature — Rat Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.32 (Bloomburrow (BLB 70)): https://scryfall.com/card/blb/70/shoreline-looter · https://www.tcgplayer.com/product/558396
- Engine: defined in `decks-heist.js`
- Why: 2-mana unblockable that draws

> This creature can't be blocked.
> Threshold — Whenever this creature deals combat damage to a player, draw a card. Then discard a card unless there are seven or more cards in your graveyard.

### Looter il-Kor
- {1}{U} · Creature — Kor Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.14 (The List (PLST TSP-66)): https://scryfall.com/card/plst/TSP-66/looter-il-kor · https://www.tcgplayer.com/product/581373
- Engine: defined in `decks-heist.js`
- Why: 2-mana shadow looter

> Shadow (This creature can block or be blocked by only creatures with shadow.)
> Whenever this creature deals damage to an opponent, draw a card, then discard a card.

- Ruling (2021-03-19): You draw a card and discard a card all while Looter il-Kor's ability is resolving. Nothing can happen in between, and no player can take actions.
- Ruling (2021-03-19): If an attacking creature has multiple evasion abilities, such as shadow and flying, a creature can block it only if that creature satisfies all of the appropriate evasion abilities.
- Ruling (2021-03-19): Multiple instances of shadow on the same creature are redundant.

### Prickly Boggart
- {B} · Creature — Goblin Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.31 (Morningtide (MOR 74)): https://scryfall.com/card/mor/74/prickly-boggart · https://www.tcgplayer.com/product/18036
- Engine: defined in `decks-heist.js`
- Why: 1-mana fear

> Fear (This creature can't be blocked except by artifact creatures and/or black creatures.)

### Vampire Cutthroat
- {B} · Creature — Vampire Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.51 (Eldritch Moon (EMN 110)): https://scryfall.com/card/emn/110/vampire-cutthroat · https://www.tcgplayer.com/product/120552
- Engine: defined in `decks-heist.js`
- Why: 1-mana skulk lifelink

> Skulk (This creature can't be blocked by creatures with greater power.)
> Lifelink (Damage dealt by this creature also causes you to gain that much life.)

### Nightshade Stinger
- {B} · Creature — Faerie Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.16 (Lorwyn (LRW 132)): https://scryfall.com/card/lrw/132/nightshade-stinger · https://www.tcgplayer.com/product/15590
- Engine: defined in `decks-heist.js`
- Why: 1-mana flier

> Flying
> This creature can't block.

### Network Disruptor
- {U} · Artifact Creature — Moonfolk Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.25 (Kamigawa: Neon Dynasty (NEO 71)): https://scryfall.com/card/neo/71/network-disruptor · https://www.tcgplayer.com/product/262602
- Engine: defined in `decks-heist.js`
- Why: 1-mana flier that taps a blocker

> Flying
> When this creature enters, tap target permanent.

### Sygg, River Cutthroat
- {U/B}{U/B} · Legendary Creature — Merfolk Rogue · 1/3 · not a Game Changer · Commander: legal
- Price: $3.73 (Zendikar Rising Commander (ZNC 103)): https://scryfall.com/card/znc/103/sygg-river-cutthroat · https://www.tcgplayer.com/product/222376
- Engine: defined in `decks-heist.js`
- Why: draws when an opponent lost 3 life

> At the beginning of each end step, if an opponent lost 3 or more life this turn, you may draw a card. (Damage causes loss of life.)

- Ruling (2008-05-01): As the end step begins, Sygg’s ability checks whether a player who is currently your opponent, or a player who was your opponent at the time they left the game, has lost 3 or more life over the course of the turn. If so, the ability will trigger. If not, it won’t.
- Ruling (2008-05-01): Sygg’s ability checks only whether life was lost. It doesn’t care whether life was also gained. For example, if an opponent lost 4 life and gained 6 life during the turn, that player will have a higher life total than they started the turn with — but Sygg’s ability will trigger anyway.
- Ruling (2008-05-01): Sygg’s ability checks to see if it triggers at the end of every turn. It doesn’t have to be your turn, and it doesn’t have to be the turn of the opponent that lost life.

### Mist-Syndicate Naga
- {2}{U} · Creature — Snake Ninja · 3/1 · not a Game Changer · Commander: legal
- Price: $2.56 (Modern Horizons (MH1 58)): https://scryfall.com/card/mh1/58/mist-syndicate-naga · https://www.tcgplayer.com/product/191265
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninja that copies itself

> Ninjutsu {2}{U} ({2}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever this creature deals combat damage to a player, create a token that's a copy of this creature.

- Ruling (2019-06-14): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2019-06-14): If a creature in combat has first strike or double strike, you can activate the ninjutsu ability during the first-strike combat damage step. The Ninja will deal combat damage during the regular combat damage step, even if it has first strike.
- Ruling (2019-06-14): The ninjutsu ability can be activated only after blockers have been declared. Before then, attacking creatures are neither blocked nor unblocked.

### Bident of Thassa
- {2}{U}{U} · Legendary Enchantment Artifact · not a Game Changer · Commander: legal
- Price: $0.43 (Starter Commander Decks (SCD 44)): https://scryfall.com/card/scd/44/bident-of-thassa · https://www.tcgplayer.com/product/456690
- Engine: defined in `decks-heist.js` (simplified: The second ability isn't offered to the bots.)
- Why: a card per hit

> Whenever a creature you control deals combat damage to a player, you may draw a card.
> {1}{U}, {T}: Creatures your opponents control attack this turn if able.

- Ruling (2018-03-16): If a creature can't attack for any reason (such as being tapped or having come under that player's control that turn), then it doesn't attack. If there's a cost associated with having a creature attack, the player isn't forced to pay that cost, so it doesn't have to attack in that case either.
- Ruling (2018-03-16): The controller of each attacking creature still chooses which player or planeswalker that creature attacks.

## Typal anthems, lords and copies (the Assassins and the stolen 2/2s grow together)

The pilots' snowball plan: with a type-changer out, every face-down 2/2 is an Assassin, so one anthem lifts the whole stolen army; the copies make a second Etrata (another cloak per hit) or a second Ramses.

### Coat of Arms
- {5} · Artifact · not a Game Changer · Commander: legal
- Price: $12.24 (Secret Lair Drop (SLD 2682)): https://scryfall.com/card/sld/2682/coat-of-arms · https://www.tcgplayer.com/product/704936
- Engine: defined in `decks-heist.js`
- Why: every creature grows for each other creature sharing a type: with Maskwood Nexus or Arcane Adaptation out the whole board shares Assassin

> Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it. (For example, if two Goblin Warriors and a Goblin Shaman are on the battlefield, each gets +2/+2.)

- Ruling (2004-10-04): If you have a creature with more than one creature type, count all creatures which have either creature type.
- Ruling (2004-10-04): If a creature has more than one creature type, and one of those types matches the creature you are calculating for, then count that creature. Only one type needs to match in order to get counted.
- Ruling (2009-10-01): Sharing multiple creature types doesn't give an additional bonus. Coat of Arms counts creatures, not creature types.

### Obelisk of Urd
- {6} · Artifact · not a Game Changer · Commander: legal
- Price: $2.79 (Zendikar Rising Commander (ZNC 115)): https://scryfall.com/card/znc/115/obelisk-of-urd · https://www.tcgplayer.com/product/222383
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: convoke anthem for the chosen type; the Assassins tap to cast it the turn after they land

> Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)
> As this artifact enters, choose a creature type.
> Creatures you control of the chosen type get +2/+2.

- Ruling (2014-07-18): The choice of creature type is made as Obelisk of Urd enters the battlefield. Players can't respond to this choice. The bonus starts applying immediately.
- Ruling (2014-07-18): You must choose an existing creature type.
- Ruling (2024-01-12): When calculating a spell's total cost, include any alternative costs, additional costs, or anything else that increases or reduces the cost to cast the spell. Convoke applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or mana value.

### Kindred Dominance
- {5}{B}{B} · Sorcery · not a Game Changer · Commander: legal
- Price: $5.15 (Marvel Super Heroes Commander (MSC 156)): https://scryfall.com/card/msc/156/kindred-dominance · https://www.tcgplayer.com/product/698010
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: a one-sided wipe that spares the chosen type (Assassin, with the type-changers covering the stolen cards)

> Choose a creature type. Destroy all creatures that aren't of the chosen type.

- Ruling (2017-08-25): You can't choose multiple creature types, such as "Cat Warrior." A Cat Warrior is both a Cat and a Warrior. It's affected by anything that affects either type and unaffected by things that affect non-Cat or non-Warrior creatures.
- Ruling (2017-08-25): Once Kindred Dominance begins to resolve, no players may take other actions until it's done. Notably, players can't try to save their creatures after you've chosen a creature type.
- Ruling (2017-08-25): You must choose an existing creature type, such as Vampire or Cat. Card types such as "artifact" can't be chosen.

### Vanquisher's Banner
- {5} · Artifact · not a Game Changer · Commander: legal
- Price: $1.86 (Foundations Commander (FDC 294)): https://scryfall.com/card/fdc/294/vanquishers-banner · https://www.tcgplayer.com/product/719226
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: anthem plus a card per Assassin cast

> As this artifact enters, choose a creature type.
> Creatures you control of the chosen type get +1/+1.
> Whenever you cast a creature spell of the chosen type, draw a card.

- Ruling (2017-09-29): The last ability of Vanquisher's Banner resolves before the spell that caused it to trigger. The ability will resolve even if the creature spell is countered.
- Ruling (2017-09-29): The choice of creature type is made as Vanquisher's Banner enters the battlefield. Players can't respond to this choice. The bonus starts applying immediately.
- Ruling (2021-03-19): To choose a creature type, you must choose an existing creature type, such as Fungus or Sliver. You can't choose multiple creature types, such as Fungus Sliver. Card types such as artifact can't be chosen, nor can subtypes that aren't creature types, such as Jace, Vehicle, or Treasure.

### Door of Destinies
- {4} · Artifact · not a Game Changer · Commander: legal
- Price: $2.42 (Marvel Super Heroes Commander (MSC 198)): https://scryfall.com/card/msc/198/door-of-destinies · https://www.tcgplayer.com/product/697414
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: an anthem that grows with every Assassin spell

> As this artifact enters, choose a creature type.
> Whenever you cast a spell of the chosen type, put a charge counter on this artifact.
> Creatures you control of the chosen type get +1/+1 for each charge counter on this artifact.

- Ruling (2008-04-01): If you cast a creature spell of the chosen type, Door of Destinies will get a charge counter before the creature enters. The creature will enter with the additional boost to its power and toughness.
- Ruling (2013-07-01): Creature types, such as Human or Sliver, appear after the dash on the type line of creatures. Notably, artifact is not a creature type. A creature may have more than one creature type, such as Goblin Warrior. Such a creature would benefit from Door of Destinies if the chosen creature type was Goblin or Warrior.

### Icon of Ancestry
- {3} · Artifact · not a Game Changer · Commander: legal
- Price: $0.34 (The Lost Caverns of Ixalan Commander (LCC 305)): https://scryfall.com/card/lcc/305/icon-of-ancestry · https://www.tcgplayer.com/product/525777
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: cheap typal anthem that also digs for Assassins

> As this artifact enters, choose a creature type.
> Creatures you control of the chosen type get +1/+1.
> {3}, {T}: Look at the top three cards of your library. You may reveal a creature card of the chosen type from among them and put it into your hand. Put the rest on the bottom of your library in a random order.

- Ruling (2019-07-12): You must choose an existing creature type, such as Vampire or Warrior. Card types (such as artifact) and supertypes (such as legendary) can't be chosen.

### Adaptive Automaton
- {3} · Artifact Creature — Construct · 2/2 · not a Game Changer · Commander: legal
- Price: $1.29 (Magic 2012 (M12 201)): https://scryfall.com/card/m12/201/adaptive-automaton · https://www.tcgplayer.com/product/47677
- Engine: defined in `decks-heist.js` (simplified: The chosen type is always Assassin.)
- Why: a 3-mana lord for Assassins

> As this creature enters, choose a creature type.
> This creature is the chosen type in addition to its other types.
> Other creatures you control of the chosen type get +1/+1.

- Ruling (2024-11-08): Even though Adaptive Automaton is a Construct, other Construct creatures you control won't get +1/+1 unless you chose Construct as Adaptive Automaton entered the battlefield.
- Ruling (2024-11-08): The choice of creature type is made as Adaptive Automaton enters. Players can't take any actions between the time the choice is made and the time the appropriate creatures begin to get +1/+1.
- Ruling (2024-11-08): You must choose an existing creature type, such as Human or Warrior. Card types such as artifact and supertypes such as legendary can't be chosen.

### Sakashima the Impostor
- {2}{U}{U} · Legendary Creature — Human Rogue · 3/1 · not a Game Changer · Commander: legal
- Price: $13.82 (The List (PLST SOK-53)): https://scryfall.com/card/plst/SOK-53/sakashima-the-impostor · https://www.tcgplayer.com/product/204143
- Engine: defined in `decks-heist.js` (simplified: The return-to-hand ability isn't offered to the bots.)
- Why: a copy of Etrata or Ramses that keeps its own name, so the legend rule doesn't take it

> You may have Sakashima the Impostor enter as a copy of any creature on the battlefield, except its name is Sakashima the Impostor, it's legendary in addition to its other types, and it has "{2}{U}{U}: Return Sakashima the Impostor to its owner's hand at the beginning of the next end step."

- Ruling (2005-06-01): If there is no creature on the battlefield or if you don't choose a creature as Sakashima enters, Sakashima remains a 3/1 Human Rogue.
- Ruling (2005-06-01): Sakashima must be on the battlefield at the end of turn in order to return to hand. If Sakashima leaves the battlefield after the ability is activated but before the at-end-of-turn ability resolves, the ability does nothing.
- Ruling (2005-06-01): Sakashima doesn't get the return to hand ability unless a creature is copied as Sakashima enters. Sakashima can't copy itself because the choice is made as part of the event that puts it onto the battlefield, and whatever will be copied must already be on the battlefield.

## Closers from the Bracket 4 research (one-shot kills and life halving)

The research's answer to 'fifteen damage a game': turn one unblocked Assassin into a kill through Ramses.

### Hatred
- {3}{B}{B} · Instant · not a Game Changer · Commander: legal
- Price: $24.63 (World Championship Decks 1999 (WC99 js64sb)): https://scryfall.com/card/wc99/js64sb/hatred · https://www.tcgplayer.com/product/164931
- Engine: defined in `decks-heist.js` (simplified: X is chosen as it resolves (not as an additional cost).)
- Why: pay X life for +X/+0 at instant speed: one unblocked Assassin becomes a kill, and Ramses turns the kill into the game

> As an additional cost to cast this spell, pay X life.
> Target creature gets +X/+0 until end of turn.

- Ruling (2004-10-04): The life payment is part of the cost to cast Hatred, so it is lost if this spell is countered.

### Blood Tribute
- {4}{B}{B} · Sorcery · not a Game Changer · Commander: legal
- Price: $4.87 (Commander 2017 (C17 100)): https://scryfall.com/card/c17/100/blood-tribute · https://www.tcgplayer.com/product/139906
- Engine: defined in `decks-heist.js` (simplified: It's kicked whenever you control an untapped Vampire (Etrata is one): the Vampire is tapped as it resolves.)
- Why: halves a player's life at sorcery speed (the deck's Vampires can tap to gain it)

> Kicker—Tap an untapped Vampire you control. (You may tap a Vampire you control in addition to any other costs as you cast this spell.)
> Target opponent loses half their life, rounded up. If this spell was kicked, you gain life equal to the life lost this way.

- Ruling (2009-10-01): You can tap a creature that hasn't been under your control since your most recent turn began to pay the kicker cost.
- Ruling (2024-11-08): To determine a spell's total cost, start with the mana cost (or an alternative cost if another card's effect allows you to pay one instead), add any cost increases (such as kicker), then apply any cost reductions. The spell's mana value remains unchanged, no matter what the total cost to cast it was.
- Ruling (2024-11-08): If you put a permanent with a kicker ability onto the battlefield without casting it, you can't kick it.

### Rush of Dread
- {1}{B}{B} · Sorcery · not a Game Changer · Commander: legal
- Price: $0.38 (Outlaws of Thunder Junction (OTJ 104)): https://scryfall.com/card/otj/104/rush-of-dread · https://www.tcgplayer.com/product/544692
- Engine: defined in `decks-heist.js` (simplified: Only two of the spree modes are offered: the life mode is always chosen ({1}{B}{B} plus {2}), and the kicker is the sacrifice mode (+{1}). The discard mode isn't offered.)
- Why: modal: half of a player's life, half their creatures, half their hand

> Spree (Choose one or more additional costs.)
> + {1} — Target opponent sacrifices half the creatures they control of their choice, rounded up.
> + {2} — Target opponent discards half the cards in their hand, rounded up.
> + {2} — Target opponent loses half their life, rounded up.

- Ruling (2024-04-12): You choose the modes as you cast the spell with spree. Once modes are chosen, they can’t be changed.
- Ruling (2024-04-12): You can’t choose the same mode more than once.
- Ruling (2024-04-12): Like the effects of all modal spells, Rush of Dread’s effects happen in order. If the first two modes target different opponents, the opponent targeted by the second mode will see what the first opponent sacrificed before choosing what to discard.

### Archfiend of Despair
- {6}{B}{B} · Creature — Demon · 6/6 · not a Game Changer · Commander: legal
- Price: $2.70 (Reality Fracture Commander (FRC 46)): https://scryfall.com/card/frc/46/archfiend-of-despair · https://www.tcgplayer.com/product/717814
- Engine: defined in `decks-heist.js`
- Why: at end of turn each opponent loses what they lost this turn again

> Flying
> Your opponents can't gain life.
> At the beginning of each end step, each opponent loses life equal to the life that player lost this turn. (Damage causes loss of life.)

- Ruling (2018-06-08): Archfiend of Despair's last ability counts only how much life was lost. It doesn't care whether a player also gained life.
- Ruling (2018-06-08): The amount of life to lose is determined only as Archfiend of Despair's triggered ability resolves. For example, if you control two of them and an opponent lost 3 life earlier in the turn, the first ability to resolve would have that player lose 3 life, and the second would have that player lose 6 life.
- Ruling (2018-06-08): In a Two-Headed Giant game, damage and life loss happen to each player individually. If each player on a team is dealt 2 damage, each of those players loses 2 life and the team's life total goes down by 4. When Archfiend of Despair's ability resolves, each of those players again loses 2 life and the team's life total goes down again by 4; they don't each lose 4 life.

### Massacre Wurm
- {3}{B}{B}{B} · Creature — Phyrexian Wurm · 6/5 · not a Game Changer · Commander: legal
- Price: $2.00 (Foundations (FDN 754)): https://scryfall.com/card/fdn/754/massacre-wurm · https://www.tcgplayer.com/product/695538
- Engine: defined in `decks-heist.js`
- Why: a one-sided sweeper that drains two per creature; the 1/1 and 2/2 Assassins are ours, so it spares them

> When this creature enters, creatures your opponents control get -2/-2 until end of turn.
> Whenever a creature an opponent controls dies, that player loses 2 life.

- Ruling (2020-06-23): Massacre Wurm's triggered ability triggers if a creature an opponent controls dies for any reason, including from its first ability reducing its toughness to 0, as long as Massacre Wurm remains on the battlefield.
- Ruling (2020-06-23): Massacre Wurm's first ability affects only creatures your opponents control at the time it resolves. Creatures they begin to control later in the turn won't get -2/-2.
- Ruling (2020-06-23): If your life total is brought to 0 or less at the same time that a creature an opponent controls is dealt lethal damage, you lose the game before Massacre Wurm's last ability goes on the stack.

## Bracket 4 shell: card flow, fast mana and Ramses tutors

From `../sources/bracket4-deckbuilding.md`: the optimized decks run 5–11 tutors and 2–11 fast mana; Ramses is the card the deck tutors for, so every tutor that finds a 4-drop creature was tested.

### Dark Confidant
- {1}{B} · Creature — Human Wizard · 2/1 · not a Game Changer · Commander: legal
- Price: $3.39 (Final Fantasy (FIN 94)): https://scryfall.com/card/fin/94/dark-confidant · https://www.tcgplayer.com/product/630935
- Engine: defined in `decks-heist.js`
- Why: 2-mana card flow in a deck whose average mana value is about two

> At the beginning of your upkeep, reveal the top card of your library and put that card into your hand. You lose life equal to its mana value.

- Ruling (2020-08-07): If a card in a player's library has {X} in its mana cost, X is considered to be 0.
- Ruling (2025-06-06): If a card in a player's library has {X} in its mana cost, X is 0 for the purpose of determining its mana value.

### Cabal Ritual
- {1}{B} · Instant · not a Game Changer · Commander: legal
- Price: $14.61 (Secret Lair Drop (SLD 2199)): https://scryfall.com/card/sld/2199/cabal-ritual · https://www.tcgplayer.com/product/658390
- Engine: defined in `decks-heist.js` (simplified: The mana stays until the end of the step or phase.)
- Why: fast mana for a turn 3 Ramses

> Add {B}{B}{B}.
> Threshold — Add {B}{B}{B}{B}{B} instead if there are seven or more cards in your graveyard.

### Demonic Consultation
- {B} · Instant · not a Game Changer · Commander: legal
- Price: $7.36 (Mystery Booster 2 (MB2 181)): https://scryfall.com/card/mb2/181/demonic-consultation · https://www.tcgplayer.com/product/563085
- Engine: defined in `decks-heist.js` (simplified: You choose among the names of the cards in your library (the bots pick their tutor target; they don't know the order).)
- Why: a one-mana instant tutor for Ramses (it exiles the top six cards and more; the deck accepts that for the access)

> Choose a card name. Exile the top six cards of your library, then reveal cards from the top of your library until you reveal a card with the chosen name. Put that card into your hand and exile all other cards revealed this way.

- Ruling (2004-10-04): There is no way to make this card affect your opponent. It affects "you", and "you" means the controller of the spell. It has no targets.
- Ruling (2004-10-04): You must name a card that actually exists in the game of Magic.
- Ruling (2008-10-01): You don't name a card until Demonic Consultation resolves.

### Fleshwrither
- {2}{B}{B} · Creature — Horror · 3/3 · not a Game Changer · Commander: legal
- Price: $3.01 (Future Sight (FUT 84)): https://scryfall.com/card/fut/84/fleshwrither · https://www.tcgplayer.com/product/14886
- Engine: defined in `decks-heist.js`
- Why: transfigure: sacrifice it to put a creature with the same mana value onto the battlefield, Ramses is a 4-drop

> Transfigure {1}{B}{B} ({1}{B}{B}, Sacrifice this creature: Search your library for a creature card with the same mana value as this creature, put that card onto the battlefield, then shuffle. Transfigure only as a sorcery.)

- Ruling (2007-05-01): Transfigure is similar to Transmute, though it can be activated only if the permanent with Transfigure is on the battlefield, and it can fetch only a creature.

### Pyre of Heroes
- {2} · Artifact · not a Game Changer · Commander: legal
- Price: $1.79 (Kaldheim (KHM 241)): https://scryfall.com/card/khm/241/pyre-of-heroes · https://www.tcgplayer.com/product/229212
- Engine: defined in `decks-heist.js` (simplified: The sacrificed creature's types and mana value are read as it's sacrificed, as the ability is activated.)
- Why: sacrifice a 3-mana Assassin to put Ramses (a 4-mana Assassin) onto the battlefield

> {2}, {T}, Sacrifice a creature: Search your library for a creature card that shares a creature type with the sacrificed creature and has mana value equal to 1 plus that creature's mana value. Put that card onto the battlefield, then shuffle. Activate only as a sorcery.

- Ruling (2021-02-05): Once you announce that you're activating the activated ability, no player may take actions until the ability has been paid for. Notably, opponents can't try to remove one of your creatures to stop you from sacrificing it.
- Ruling (2021-02-05): Use the creature types and mana value of the creature you sacrificed as it existed on the battlefield to determine what creature card you can find. Notably, if you sacrifice a creature that's a double-faced permanent with its back face up, you'll use the characteristics of the back face, not the front face.
- Ruling (2021-02-05): If a permanent or a card in a library has {X} in its mana cost, X is considered to be 0.

### Mana Drain
- {U}{U} · Instant · not a Game Changer · Commander: legal
- Price: $51.90 (Commander Legends (CMR 80)): https://scryfall.com/card/cmr/80/mana-drain · https://www.tcgplayer.com/product/227008
- Engine: defined in `decks-heist.js` (simplified: The mana arrives at the start of your next precombat main phase and stays until the end of that phase.)
- Why: a Game Changer counter that pays for the next turn's Ramses

> Counter target spell. At the beginning of your next main phase, add an amount of {C} equal to that spell's mana value.

- Ruling (2020-11-10): Mana Drain's delayed triggered ability will usually trigger at the beginning of your precombat main phase. However, if you cast Mana Drain during your precombat main phase or during your combat phase, its delayed triggered ability will trigger at the beginning of that turn's postcombat main phase.
- Ruling (2020-11-10): If the target spell is an illegal target by the time Mana Drain tries to resolve, Mana Drain doesn't resolve. You don't add mana at the beginning of your next main phase. If the target is legal but not countered (most likely because an effect says that the spell can't be countered), you do add mana.

## Free and cheap interaction (the Bracket 4 count: 5–11 free counters, interaction without losing tempo)

The research's rule: interaction that costs no mana on the opponent's turn is what lets an aggro deck keep developing; the counters are saved for the wipe (DECISIONS #26).

### Flare of Denial
- {1}{U}{U} · Instant · not a Game Changer · Commander: legal
- Price: $3.48 (Modern Horizons 3 (MH3 62)): https://scryfall.com/card/mh3/62/flare-of-denial · https://www.tcgplayer.com/product/548596
- Engine: defined in `decks-heist.js`
- Why: a free counter by sacrificing a nontoken blue creature

> You may sacrifice a nontoken blue creature rather than pay this spell's mana cost.
> Counter target spell.

### Flare of Malice
- {2}{B}{B} · Instant · not a Game Changer · Commander: legal
- Price: $3.24 (Modern Horizons 3 (MH3 95)): https://scryfall.com/card/mh3/95/flare-of-malice · https://www.tcgplayer.com/product/552274
- Engine: defined in `decks-heist.js`
- Why: free by sacrificing a nontoken black creature: each opponent sacrifices their highest-mana-value creature or planeswalker

> You may sacrifice a nontoken black creature rather than pay this spell's mana cost.
> Each opponent sacrifices a creature or planeswalker with the greatest mana value among creatures and planeswalkers they control.

- Ruling (2024-06-07): Starting with the next opponent in turn order (or, if you cast Flare of Malice on an opponent's turn, starting with the opponent whose turn it is) and proceeding in turn order, each opponent chooses a creature or planeswalker with the greatest mana value among creatures and planeswalkers they control to sacrifice. Then those permanents are sacrificed at the same time.
- Ruling (2024-06-07): If an opponent has multiple creatures and/or planeswalkers tied for the greatest mana value, that player chooses which one to sacrifice.

### Force of Despair
- {1}{B}{B} · Instant · not a Game Changer · Commander: legal
- Price: $6.74 (Modern Horizons (MH1 92)): https://scryfall.com/card/mh1/92/force-of-despair · https://www.tcgplayer.com/product/190880
- Engine: defined in `decks-heist.js`
- Why: a free answer to a creature that entered this turn, on the opponent's turn

> If it's not your turn, you may exile a black card from your hand rather than pay this spell's mana cost.
> Destroy all creatures that entered this turn.

- Ruling (2019-06-14): Force of Despair destroys all permanents that entered the battlefield this turn and are currently creatures. It doesn’t matter whether they were creatures as they entered the battlefield.

### Snapback
- {1}{U} · Instant · not a Game Changer · Commander: legal
- Price: $0.41 (Time Spiral Remastered (TSR 87)): https://scryfall.com/card/tsr/87/snapback · https://www.tcgplayer.com/product/233897
- Engine: defined in `decks-heist.js`
- Why: free bounce by exiling a blue card: saves Etrata or Ramses from removal

> You may exile a blue card from your hand rather than pay this spell's mana cost.
> Return target creature to its owner's hand.

- Ruling (2021-03-19): To determine the total cost of a spell, start with the mana cost or alternative cost you're paying (such as the alternative cost of Snapback), add any cost increases, then apply any cost reductions. The mana value of the spell is determined by only its mana cost, no matter what the total cost to cast that spell was.

### Fading Hope
- {U} · Instant · not a Game Changer · Commander: legal
- Price: $0.26 (Foundations Jumpstart (J25 310)): https://scryfall.com/card/j25/310/fading-hope · https://www.tcgplayer.com/product/590531
- Engine: defined in `decks-heist.js`
- Why: one-mana bounce: Etrata returns to hand without the commander tax

> Return target creature to its owner's hand. If its mana value was 3 or less, scry 1. (Look at the top card of your library. You may put that card on the bottom.)

### Baleful Mastery
- {3}{B} · Instant · not a Game Changer · Commander: legal
- Price: $2.05 (Strixhaven: School of Mages Promos (PSTX 64p)): https://scryfall.com/card/pstx/64p/baleful-mastery · https://www.tcgplayer.com/product/237403
- Engine: defined in `decks-heist.js` (simplified: The opponent who draws is the target's controller (or the first opponent).)
- Why: two-mana exile removal if an opponent draws a card, four mana otherwise

> You may pay {1}{B} rather than pay this spell's mana cost.
> If the {1}{B} cost was paid, an opponent draws a card.
> Exile target creature or planeswalker.

- Ruling (2021-04-16):  If you copy a "Mastery" spell and the alternative cost was paid, the copy will resolve as though the cost was paid.
- Ruling (2021-04-16):  The mana value of a spell on the stack is determined by its mana cost, not any alternative costs you used to pay for it.
- Ruling (2021-04-16):  In a multiplayer game, you choose which opponent takes the prescribed action as the spell resolves.

### Dismember
- {1}{B/P}{B/P} · Instant · not a Game Changer · Commander: legal
- Price: $2.45 (New Phyrexia (NPH 57)): https://scryfall.com/card/nph/57/dismember · https://www.tcgplayer.com/product/39509
- Engine: defined in `decks-heist.js`
- Why: one mana and four life for −5/−5

> ({B/P} can be paid with either {B} or 2 life.)
> Target creature gets -5/-5 until end of turn.

- Ruling (2024-06-07): A Phyrexian mana symbol contributes 1 toward the mana value of a card, even if life is paid for it. Specifically, Dismember's mana value is always 3.

### Submerge
- {4}{U} · Instant · not a Game Changer · Commander: legal
- Price: $3.53 (The List (PLST NEM-48)): https://scryfall.com/card/plst/NEM-48/submerge · https://www.tcgplayer.com/product/582671
- Engine: defined in `decks-heist.js`
- Why: free against a Forest and Island player

> If an opponent controls a Forest and you control an Island, you may cast this spell without paying its mana cost.
> Put target creature on top of its owner's library.

### Mental Misstep
- {U/P} · Instant · not a Game Changer · Commander: legal
- Price: $5.87 (Mystery Booster 2 (MB2 30)): https://scryfall.com/card/mb2/30/mental-misstep · https://www.tcgplayer.com/product/563199
- Engine: defined in `decks-heist.js`
- Why: a free counter for the one-mana spells the Bracket 4 field runs

> ({U/P} can be paid with either {U} or 2 life.)
> Counter target spell with mana value 1.

- Ruling (2011-06-01): Each Phyrexian mana symbol in a spell's mana cost contributes 1 to that spell's mana value. For example, Mental Misstep's mana value is 1, regardless of how its cost was paid.
- Ruling (2011-06-01): To calculate the mana value of a card with Phyrexian mana symbols in its cost, count each Phyrexian mana symbol as 1.
- Ruling (2011-06-01): If a spell has {X} in its mana cost, X is considered to be the value chosen for it while that spell is on the stack.

## Ninjutsu and the Yuriko template (v3 'tempo')

From `../sources/bracket4-piloting-and-aggro.md`: the only Dimir aggro shell that holds its own at high power is Yuriko's: 0–2 mana evasive bodies, ninjutsu swapping a connected body for a payoff, free interaction. Tested as version 3 (26.5% vs precons).

### Ninja of the Deep Hours
- {3}{U} · Creature — Human Ninja · 2/2 · not a Game Changer · Commander: legal
- Price: $1.44 (Commander 2015 (C15 99)): https://scryfall.com/card/c15/99/ninja-of-the-deep-hours · https://www.tcgplayer.com/product/108000
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninjutsu: the connected Assassin returns to hand and a card is drawn

> Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever this creature deals combat damage to a player, you may draw a card.

- Ruling (2021-03-19): The ninjutsu ability can be activated during the declare blockers step, combat damage step, or end of combat step. If you wait until after the declare blockers step, because all combat damage is dealt at once, the Ninja won't normally deal combat damage.
- Ruling (2021-03-19): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2021-03-19): The creature put onto the battlefield with ninjutsu enters the battlefield attacking the same player or planeswalker that the returned creature was attacking. This is a rule specific to ninjutsu.

### Ingenious Infiltrator
- {2}{U}{B} · Creature — Vedalken Ninja · 2/3 · not a Game Changer · Commander: legal
- Price: $2.11 (Modern Horizons (MH1 204)): https://scryfall.com/card/mh1/204/ingenious-infiltrator · https://www.tcgplayer.com/product/191068
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninjutsu with a card per Ninja hit

> Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever a Ninja you control deals combat damage to a player, draw a card.

- Ruling (2019-06-14): If Ingenious Infiltrator is dealt lethal combat damage at the same time a Ninja you control deals combat damage to a player, its ability triggers.
- Ruling (2019-06-14): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2019-06-14): As you activate a ninjutsu ability, you reveal the Ninja card in your hand and return the attacking creature. The Ninja isn’t put onto the battlefield until the ability resolves. If it leaves your hand before then, it won’t enter the battlefield at all.

### Moon-Circuit Hacker
- {1}{U} · Enchantment Creature — Human Ninja · 2/1 · not a Game Changer · Commander: legal
- Price: $0.20 (The List (PLST NEO-67)): https://scryfall.com/card/plst/NEO-67/moon-circuit-hacker · https://www.tcgplayer.com/product/581598
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: a 2-mana ninjutsu draw

> Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever this creature deals combat damage to a player, you may draw a card. If you do, discard a card unless this creature entered this turn.

- Ruling (2022-02-18): The ninjutsu ability can be activated during the declare blockers step, combat damage step, or end of combat step. In most cases (see below), if you wait until the combatdamage step or end of combat step, it will be after combat damage has been dealt, so the Ninja won't deal combat damage.
- Ruling (2022-02-18): If a creature in combat has first strike or double strike, you can activate the ninjutsu ability during the first-strike combat damage step. The Ninja will deal combat damage during the regular combat damage step, even if it has first strike.
- Ruling (2022-02-18): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).

### Thousand-Faced Shadow
- {U} · Creature — Human Ninja · 1/1 · not a Game Changer · Commander: legal
- Price: $1.42 (Kamigawa: Neon Dynasty (NEO 86)): https://scryfall.com/card/neo/86/thousand-faced-shadow · https://www.tcgplayer.com/product/262130
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninjutsu copy of an attacking creature (Etrata attacking makes a second cloak)

> Ninjutsu {2}{U}{U} ({2}{U}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Flying
> When this creature enters from your hand, if it's attacking, create a token that's a copy of another target attacking creature. The token enters tapped and attacking.

- Ruling (2022-02-18): As you activate a ninjutsu ability, you reveal the Ninja card in your hand and return the attacking creature. The Ninja card stays revealed and isn't put onto the battlefield until the ability resolves. If it leaves your hand before then, it won't enter the battlefield at all.
- Ruling (2022-02-18): Although the token is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2022-02-18): The ninjutsu ability can be activated during the declare blockers step, combat damage step, or end of combat step. In most cases (see below), if you wait until the combatdamage step or end of combat step, it will be after combat damage has been dealt, so the Ninja won't deal combat damage.

### Prosperous Thief
- {2}{U} · Creature — Human Ninja · 3/2 · not a Game Changer · Commander: legal
- Price: $0.19 (Foundations Jumpstart (J25 346)): https://scryfall.com/card/j25/346/prosperous-thief · https://www.tcgplayer.com/product/595049
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninjutsu Treasure maker

> Ninjutsu {1}{U} ({1}{U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever one or more Ninja or Rogue creatures you control deal combat damage to a player, create a Treasure token. (It's an artifact with "{T}, Sacrifice this token: Add one mana of any color.")

- Ruling (2022-02-18): Although the Ninja is attacking, it was never declared as an attacking creature (for purposes of abilities that trigger whenever a creature attacks, for example).
- Ruling (2022-02-18): The ninjutsu ability can be activated only after blockers have been declared. Before then, attacking creatures are neither blocked nor unblocked.
- Ruling (2022-02-18): If a creature in combat has first strike or double strike, you can activate the ninjutsu ability during the first-strike combat damage step. The Ninja will deal combat damage during the regular combat damage step, even if it has first strike.

### Mistblade Shinobi
- {2}{U} · Creature — Human Ninja · 1/1 · not a Game Changer · Commander: legal
- Price: $0.63 (The List (PLST PCA-20)): https://scryfall.com/card/plst/PCA-20/mistblade-shinobi · https://www.tcgplayer.com/product/581561
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking.)
- Why: ninjutsu bounce on hit

> Ninjutsu {U} ({U}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Whenever this creature deals combat damage to a player, you may return target creature that player controls to its owner's hand.

### Silver-Fur Master
- {U}{B} · Creature — Rat Ninja · 2/2 · not a Game Changer · Commander: legal
- Price: $0.32 (Kamigawa: Neon Dynasty (NEO 353)): https://scryfall.com/card/neo/353/silver-fur-master · https://www.tcgplayer.com/product/262049
- Engine: defined in `decks-heist.js` (simplified: Ninjutsu is offered on the card in your hand after blockers are declared. The card is discarded to pay for it and comes back from your graveyard tapped and attacking. The {1} discount on other ninjutsu costs isn't applied.)
- Why: Ninja and Rogue anthem that discounts ninjutsu

> Ninjutsu {U}{B} ({U}{B}, Return an unblocked attacker you control to hand: Put this card onto the battlefield from your hand tapped and attacking.)
> Ninjutsu abilities you activate cost {1} less to activate.
> Other Ninja and Rogue creatures you control get +1/+1.

- Ruling (2022-02-18): The ninjutsu ability can be activated only after blockers have been declared. Before then, attacking creatures are neither blocked nor unblocked.
- Ruling (2022-02-18): The creature with ninjutsu enters the battlefield attacking the same player or planeswalker that the returned creature was attacking. This is a rule specific to ninjutsu; in other cases, when a creature is put onto the battlefield attacking, that creature's controller chooses which player or planeswalker it's attacking.
- Ruling (2022-02-18): The ninjutsu ability can be activated during the declare blockers step, combat damage step, or end of combat step. In most cases (see below), if you wait until the combatdamage step or end of combat step, it will be after combat damage has been dealt, so the Ninja won't deal combat damage.

### Faerie Seer
- {U} · Creature — Faerie Wizard · 1/1 · not a Game Changer · Commander: legal
- Price: $0.35 (The List (PLST MH1-51)): https://scryfall.com/card/plst/MH1-51/faerie-seer · https://www.tcgplayer.com/product/581292
- Engine: defined in `decks-heist.js`
- Why: 1-mana flyer: scry 2 and a ninjutsu enabler

> Flying
> When this creature enters, scry 2. (Look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)

### Ornithopter
- {0} · Artifact Creature — Thopter · 0/2 · not a Game Changer · Commander: legal
- Price: $0.31 (Dominaria Remastered (DMR 386)): https://scryfall.com/card/dmr/386/ornithopter · https://www.tcgplayer.com/product/457189
- Engine: defined in `decks-heist.js`
- Why: 0-mana flyer to ninjutsu through

> Flying

### Spectral Sailor
- {U} · Creature — Spirit Pirate · 1/1 · not a Game Changer · Commander: legal
- Price: $0.11 (The List (PLST M20-76)): https://scryfall.com/card/plst/M20-76/spectral-sailor · https://www.tcgplayer.com/product/582635
- Engine: defined in `decks-heist.js`
- Why: 1-mana flash flyer that draws late

> Flash (You may cast this spell any time you could cast an instant.)
> Flying
> {3}{U}: Draw a card.

### Siren Stormtamer
- {U} · Creature — Siren Pirate Wizard · 1/1 · not a Game Changer · Commander: legal
- Price: $0.33 (The List (PLST XLN-79)): https://scryfall.com/card/plst/XLN-79/siren-stormtamer · https://www.tcgplayer.com/product/582615
- Engine: defined in `decks-heist.js`
- Why: 1-mana flyer that protects Etrata from a targeted spell

> Flying
> {U}, Sacrifice this creature: Counter target spell or ability that targets you or a creature you control.

- Ruling (2020-11-10): Siren Stormtamer's activated ability can target a spell or ability that has multiple targets, as long as at least one of those targets is you or a creature you control.
- Ruling (2020-11-10): If the creature you control targeted by the target spell or ability leaves the battlefield, that spell or ability is no longer a legal target for Siren Stormtamer's ability. On the other hand, if that targeted creature becomes an illegal target for the target spell but remains on the battlefield under your control, the target spell or ability is still a legal target for Siren Stormtamer's ability.

### Fell the Profane // Fell Mire
- {2}{B}{B} · Instant // Land · not a Game Changer · Commander: legal
- Price: $5.09 (Modern Horizons 3 (MH3 244)): https://scryfall.com/card/mh3/244/fell-the-profane-fell-mire · https://www.tcgplayer.com/product/552580
- Engine: defined in `decks-heist.js` (simplified: A modal double-faced card: play it as the land Fell Mire from your hand instead of casting it.)
- Why: removal that is a land when the hand needs one

> Fell the Profane: Destroy target creature or planeswalker.
> //
> Fell Mire: As this land enters, you may pay 3 life. If you don't, it enters tapped.
> {T}: Add {B}.

- Ruling (2024-06-07): A modal double-faced card can't be transformed or be put onto the battlefield transformed. Ignore any instruction to transform a modal double-faced card or to put one onto the battlefield transformed.
- Ruling (2024-06-07): If an effect allows you to play a specific modal double-faced card, you may cast it as a spell or play it as a land, as determined by which face you choose to play. If an effect allows you to cast (rather than "play") a specific modal double-faced card, you can't play it as a land.
- Ruling (2024-06-07): The mana value of a modal double-faced card is based on the characteristics of the face that's being considered. On the stack or the battlefield, consider whichever face is up. In all other zones, consider only the front face. This is different than how the mana value of a transforming double-faced card is determined.

### Sink into Stupor // Soporific Springs
- {1}{U}{U} · Instant // Land · not a Game Changer · Commander: legal
- Price: $8.71 (Modern Horizons 3 (MH3 241)): https://scryfall.com/card/mh3/241/sink-into-stupor-soporific-springs · https://www.tcgplayer.com/product/552582
- Engine: defined in `decks-heist.js` (simplified: A modal double-faced card: play it as the land Soporific Springs from your hand instead of casting it. As a spell it only targets permanents here (not spells on the stack).)
- Why: bounce that is a land when the hand needs one

> Sink into Stupor: Return target spell or nonland permanent an opponent controls to its owner's hand.
> //
> Soporific Springs: As this land enters, you may pay 3 life. If you don't, it enters tapped.
> {T}: Add {U}.

- Ruling (2024-06-07): If an effect allows you to play a land or cast a spell from among a group of cards, you may play or cast a modal double-faced card with any face that fits the criteria of that effect. For example, if an effect allows you to play lands from your graveyard, you can play Garden of Freyalise, but you can't cast Disciple of Freyalise.
- Ruling (2024-06-07): If an effect allows you to put a card with particular characteristics onto the battlefield without instructing you to play or cast it, you consider only the characteristics of a modal double-faced card's front face to see if that card qualifies. If it does, it enters the battlefield with its front face up. For example, if an effect allows you to put a creature card from your graveyard onto the battlefield, you can put Disciple of Freyalise onto the battlefield. However, an effect that lets you return a land card from your graveyard to your hand won't let you return Garden of Freyalise to your hand, as that card has only its front face's characteristics while in the graveyard.
- Ruling (2024-06-07): The mana value of a modal double-faced card is based on the characteristics of the face that's being considered. On the stack or the battlefield, consider whichever face is up. In all other zones, consider only the front face. This is different than how the mana value of a transforming double-faced card is determined.

### Cunning Evasion
- {1}{U} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.37 (Modern Horizons (MH1 45)): https://scryfall.com/card/mh1/45/cunning-evasion · https://www.tcgplayer.com/product/191725
- Engine: defined in `decks-heist.js`
- Why: a blocked attacker returns to hand instead of dying

> Whenever a creature you control becomes blocked, you may return it to its owner's hand.

- Ruling (2019-06-14): You return the attacking creature to its owner’s hand before the combat damage step. A creature returned this way neither deals nor is dealt combat damage.

## Protection and recursion for Ramses (the second-round loss analysis)

Ramses was removed in about a third of the games he landed in (STRATEGY.md §9); these were the research's answers. Measured: the equipment package cost 2.3 points vs precons (#44), tutoring for protection changed nothing (#45).

### Whispersilk Cloak
- {3} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $2.26 (Marvel Super Heroes Commander (MSC 225)): https://scryfall.com/card/msc/225/whispersilk-cloak · https://www.tcgplayer.com/product/698219
- Engine: defined in `decks-heist.js`
- Why: shroud and unblockable: removal can't target him and he connects

> Equipped creature can't be blocked and has shroud. (It can't be the target of spells or abilities.)
> Equip {2}

### Darksteel Plate
- {3} · Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $3.18 (Final Fantasy Commander (FIC 342)): https://scryfall.com/card/fic/342/darksteel-plate · https://www.tcgplayer.com/product/631209
- Engine: defined in `decks-heist.js`
- Why: indestructible through the destroy wipes (Wrath, Cleansing Nova, Phyrexian Rebirth)

> Indestructible
> Equipped creature has indestructible.
> Equip {2}

### Mithril Coat
- {3} · Legendary Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $27.87 (The Lord of the Rings: Tales of Middle-earth (LTR 245)): https://scryfall.com/card/ltr/245/mithril-coat · https://www.tcgplayer.com/product/499456
- Engine: defined in `decks-heist.js`
- Why: flash indestructible that attaches itself to a legendary creature (Ramses, Etrata) when it enters

> Flash
> Indestructible
> When Mithril Coat enters, attach it to target legendary creature you control.
> Equipped creature has indestructible.
> Equip {3}

- Ruling (2023-06-16): Attaching an Equipment with its enters-the-battlefield triggered ability isn't the same as using its equip ability. You don't pay mana for the attachment, and the timing restrictions for equip abilities don't apply.
- Ruling (2023-06-16): Mithril Coat doesn't enter the battlefield attached to a creature. Instead, the Equipment enters the battlefield and then a triggered ability attaches it to a creature. You may cast Mithril Coat even if you don't control any creatures.
- Ruling (2023-06-16): If the target creature becomes an illegal target, the Equipment remains on the battlefield unattached.

### Reanimate
- {B} · Sorcery · not a Game Changer · Commander: legal
- Price: $6.61 (Final Fantasy Commander (FIC 282)): https://scryfall.com/card/fic/282/reanimate · https://www.tcgplayer.com/product/631573
- Engine: defined in `decks-heist.js`
- Why: Ramses back for one mana after a wipe

> Put target creature card from a graveyard onto the battlefield under your control. You lose life equal to that card's mana value.

- Ruling (2025-09-19): The amount of life you lose is determined by the mana value of the card in your graveyard, not the creature once it's on the battlefield.
- Ruling (2025-09-19): If any abilities trigger on the creature entering the battlefield, those abilities resolve after you lose life. If losing life results in you losing the game, those abilities won't resolve.
- Ruling (2025-09-19): In a multiplayer game, if a player leaves the game, all cards that player owns leave as well. If you leave the game, the creature you control from Reanimate is exiled.

### Patriarch's Bidding
- {3}{B}{B} · Sorcery · not a Game Changer · Commander: legal
- Price: $3.63 (World Championship Decks 2003 (WC03 pk161sb)): https://scryfall.com/card/wc03/pk161sb/patriarchs-bidding · https://www.tcgplayer.com/product/174152
- Engine: defined in `decks-heist.js` (simplified: You choose Assassin; each opponent chooses the type that returns the most of their own creature cards.)
- Why: every Assassin back after a wipe

> Each player chooses a creature type. Each player returns all creature cards of a type chosen this way from their graveyard to the battlefield.

- Ruling (2021-06-18): You must choose a creature type, such as Elf or Shaman. You can't choose other card types such as artifact or supertypes such as legendary.
- Ruling (2021-06-18): The player whose turn it is chooses a creature type first, followed by each other player in turn order. Then, all creature cards that have one or more of the chosen types are returned to the battlefield at the same time.
- Ruling (2021-06-18): Any player may choose a creature type that's already been chosen. Doing so won't affect which creature cards are returned to the battlefield.

## Attack drains (version 4, deathtouch Assassins that drain on attack)

A build around 'whenever this attacks, each opponent loses 1 life' bodies, Mari and Hooded Blightfang; it took 6.4 life a game and won 27.7% vs precons, so it was dropped (#30).

### Pulse Tracker
- {B} · Creature — Vampire Rogue · 1/1 · not a Game Changer · Commander: legal
- Price: $0.13 (Foundations (FDN 612)): https://scryfall.com/card/fdn/612/pulse-tracker · https://www.tcgplayer.com/product/591015
- Engine: defined in `decks-heist.js`
- Why: 1-mana Rogue: each opponent loses 1 on attack

> Whenever this creature attacks, each opponent loses 1 life.

### Vicious Conquistador
- {B} · Creature — Vampire Soldier · 1/2 · not a Game Changer · Commander: legal
- Price: $0.33 (Foundations Jumpstart (J25 507)): https://scryfall.com/card/j25/507/vicious-conquistador · https://www.tcgplayer.com/product/590665
- Engine: defined in `decks-heist.js`
- Why: 1-mana Vampire: each opponent loses 1 on attack

> Whenever this creature attacks, each opponent loses 1 life.

### Sanguine Syphoner
- {1}{B} · Creature — Vampire Warlock · 1/3 · not a Game Changer · Commander: legal
- Price: $0.24 (Foundations (FDN 68)): https://scryfall.com/card/fdn/68/sanguine-syphoner · https://www.tcgplayer.com/product/591666
- Engine: defined in `decks-heist.js`
- Why: drains on attack

> Whenever this creature attacks, each opponent loses 1 life and you gain 1 life.

### Postmortem Professor
- {1}{B} · Creature — Zombie Warlock · 2/2 · not a Game Changer · Commander: legal
- Price: $0.24 (Secrets of Strixhaven (SOS 93)): https://scryfall.com/card/sos/93/postmortem-professor · https://www.tcgplayer.com/product/689105
- Engine: defined in `decks-heist.js` (simplified: The graveyard ability isn't offered.)
- Why: 2-mana attack drain that can't block and comes back from the graveyard

> This creature can't block.
> Whenever this creature attacks, each opponent loses 1 life and you gain 1 life.
> {1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.

### Agate-Blade Assassin
- {1}{B} · Creature — Lizard Assassin · 1/3 · not a Game Changer · Commander: legal
- Price: $0.22 (Bloomburrow (BLB 82)): https://scryfall.com/card/blb/82/agate-blade-assassin · https://www.tcgplayer.com/product/559647
- Engine: defined in `decks-heist.js`
- Why: 2-mana Assassin that drains the defending player on attack

> Whenever this creature attacks, defending player loses 1 life and you gain 1 life.

### Within Range
- {3}{B} · Enchantment · not a Game Changer · Commander: legal
- Price: $0.37 (Tarkir: Dragonstorm Commander (TDC 32)): https://scryfall.com/card/tdc/32/within-range · https://www.tcgplayer.com/product/624300
- Engine: defined in `decks-heist.js`
- Why: whenever you attack, each opponent loses life equal to the number of creatures attacking them; two 1/1 tokens on entry

> When this enchantment enters, create two 1/1 red Warrior creature tokens.
> Whenever you attack, each opponent loses life equal to the number of creatures attacking them.

## Ramses redundancy: reanimation Auras and non-legendary copies (round 4, 2026-10-06)

Asked for a deck less dependent on Ramses: a second Ramses the legend rule doesn't take, and ways to bring him back that stay on the battlefield.

### Animate Dead
- {1}{B} · Enchantment — Aura · not a Game Changer · Commander: legal
- Price: $7.05 (Secrets of Strixhaven Commander (SOC 207)): https://scryfall.com/card/soc/207/animate-dead · https://www.tcgplayer.com/product/687375
- Engine: defined in `decks-heist.js` (simplified: The creature card is targeted on cast and returns as the Aura enters; the Aura then enchants that creature (the "if it's on the battlefield" clause and the text change aren't modeled separately).)
- Why: two-mana reanimation of Ramses (or an opponent's bomb) that stays; the Aura leaving sacrifices the creature

> Enchant creature card in a graveyard
> When this Aura enters, if it's on the battlefield, it loses "enchant creature card in a graveyard" and gains "enchant creature put onto the battlefield with this Aura." Return enchanted creature card to the battlefield under your control and attach this Aura to it. When this Aura leaves the battlefield, that creature's controller sacrifices it.
> Enchanted creature gets -1/-0.

- Ruling (2016-06-08): If the creature put onto the battlefield has protection from black—or if the creature can't legally be enchanted by Animate Dead for another reason—Animate Dead won't be able to attach to it. It will be put into the graveyard as a state-based action, causing its delayed triggered ability to trigger. When the trigger resolves, if the creature's still on the battlefield, its controller will sacrifice it.
- Ruling (2016-06-08): Animate Dead is an Aura, albeit with an unusual enchant ability. You target a creature card in a graveyard when you cast it. It enters the battlefield attached to that card. Then it returns that card to the battlefield, and attaches itself to the card again (since the card is a new object on the battlefield). Animate Dead itself never moves into a graveyard during this process.
- Ruling (2016-06-08): If Animate Dead isn't on the battlefield as its triggered ability resolves, none of its effects happen. The creature card won't be returned to the battlefield.

### Necromancy
- {2}{B} · Enchantment · not a Game Changer · Commander: legal
- Price: $19.51 (Murders at Karlov Manor Commander (MKC 131)): https://scryfall.com/card/mkc/131/necromancy · https://www.tcgplayer.com/product/535786
- Engine: defined in `decks-heist.js` (simplified: As Animate Dead. Cast on another player's turn or outside a main phase, Necromancy is sacrificed at the beginning of the next end step (the cleanup step isn't modeled; a main-phase cast with spells on the stack counts as sorcery speed). The bots cast it at sorcery speed.)
- Why: three-mana reanimation with flash, the same way

> You may cast this spell as though it had flash. If you cast it any time a sorcery couldn't have been cast, the controller of the permanent it becomes sacrifices it at the beginning of the next cleanup step.
> When this enchantment enters, if it's on the battlefield, it becomes an Aura with "enchant creature put onto the battlefield with Necromancy." Put target creature card from a graveyard onto the battlefield under your control and attach this enchantment to it. When this enchantment leaves the battlefield, that creature's controller sacrifices it.

- Ruling (2004-10-04): When putting a card onto the battlefield that requires a definition for its value or some other choice, you do what is needed to define the value or make the choice.
- Ruling (2004-10-04): The bringing of the creature onto the battlefield and then putting Necromancy on it is all done as part of the resolution.
- Ruling (2005-08-01): Necromancy enters as an enchantment and then becomes an Enchant Creature Aura as a triggered ability upon entering. It follows all the rules for Auras from then on.

### Helm of the Host
- {4} · Legendary Artifact — Equipment · not a Game Changer · Commander: legal
- Price: $5.13 (Marvel Super Heroes Commander (MSC 200)): https://scryfall.com/card/msc/200/helm-of-the-host · https://www.tcgplayer.com/product/698213
- Engine: defined in `decks-heist.js`
- Why: a non-legendary token copy of the equipped creature every combat: a new Ramses (or Etrata) each turn, with haste

> At the beginning of combat on your turn, create a token that's a copy of equipped creature, except the token isn't legendary. That token gains haste.
> Equip {5}

- Ruling (2018-04-27): Any enters-the-battlefield abilities of the copied creature will trigger when the token enters the battlefield. Any "as [this creature] enters the battlefield" or "[this creature] enters the battlefield with" abilities of the chosen creature will also work.
- Ruling (2018-04-27): If the equipped creature leaves the battlefield before the triggered ability of Helm of the Host resolves, or if there is no equipped creature, no token is created. However, if Helm of the Host leaves the battlefield while its triggered ability is on the stack, a token will be created of the creature it last equipped. If that creature has also left the battlefield, its last known information is used to determine what the token looks like.
- Ruling (2018-04-27): If the copied creature has {X} in its mana cost, X is considered to be 0.

### Irenicus's Vile Duplication
- {3}{U} · Sorcery · not a Game Changer · Commander: legal
- Price: $10.29 (The List (PLST CLB-78)): https://scryfall.com/card/plst/CLB-78/irenicuss-vile-duplication · https://www.tcgplayer.com/product/581340
- Engine: defined in `decks-heist.js`
- Why: a flying, non-legendary token copy of Ramses or Etrata

> Create a token that's a copy of target creature you control, except the token has flying and it isn't legendary.

- Ruling (2022-06-10): Irenicus's Vile Duplication has received an update to its Oracle text to clarify that the token still has flying even if the creature it's copying isn't legendary.

