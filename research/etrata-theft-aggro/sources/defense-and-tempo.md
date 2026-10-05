# Etrata, Deadly Fugitive: defense and tempo research (checked 2026-10-05)

## Sources and caveats
- Oracle text comes from api.magicthegathering.io (`https://api.magicthegathering.io/v1/cards?name=<name>`), most recent printing, unless marked otherwise. That API stores a data snapshot, so its wording can trail current Oracle templating. For example, it may say "enters the battlefield" where current Oracle says "enters". The rules meaning is the same.
- Dubious Delicacy (Edge of Eternities, 2025) text comes from the official EOE release notes: https://magic.wizards.com/en/news/feature/edge-of-eternities-release-notes
- Prices are paper USD from MTGGoldfish search or price pages, fetched today. The printing shown is the one MTGGoldfish listed, which may not be the cheapest copy available.
- Etrata (verified, same API): {1}{U}{B} Legendary Creature — Vampire Assassin 1/4. "Deathtouch. Face-down creatures you control have '{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.' Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library."
  - Etrata's ability works on ANY face-down creature you control, including morphs. That makes the Thousand Winds and Brine Elemental notes below important.
- Tetsuko Umezawa, Fugitive (verified): "Creatures you control with power or toughness 1 or less can't be blocked." Anything that adds +1/+1 counters breaks this.
- Marauding Blight-Priest (verified): {2}{B} 3/2 Vampire Cleric, "Whenever you gain life, each opponent loses 1 life."

## Banned list and Game Changers
- **Commander banned list** (https://magic.wizards.com/en/banned-restricted-list, no date shown on the page): Ancestral Recall, Balance, Black Lotus, Chaos Orb, Channel, Dockside Extortionist, Emrakul the Aeons Torn, Erayo, Falling Star, Fastbond, Flash, Golos, Griselbrand, Hullbreacher, Iona, Karakas, **Jeweled Lotus**, Leovold, Library of Alexandria, Limited Resources, Mana Crypt, Mox Emerald/Jet/Pearl/Ruby/Sapphire, Nadu, Paradox Engine, Primeval Titan, Prophet of Kruphix, Recurring Nightmare, Rofellos, Shahrazad, Sundering Titan, Sylvan Primordial, Time Vault, Time Walk, Tinker, Tolarian Academy, Trade Secrets, Upheaval, Yawgmoth's Bargain, plus Conspiracy-type, ante and offensive-imagery cards.
- **Jeweled Lotus is BANNED.** You are right: it was banned with Mana Crypt, Dockside and Nadu in Sept 2024. The Feb 9 2026 announcement says Jeweled Lotus "was also discussed and remains banned."
- **Latest Commander update:** Feb 9, 2026 (https://magic.wizards.com/en/news/announcements/commander-banned-and-restricted-february-9-2026). Biorhythm was unbanned and became a Game Changer. Lutri was unbanned except as a companion. Nothing new was banned.
  - The June 29, 2026 B&R announcement had no Commander section (https://magic.wizards.com/en/news/announcements/banned-and-restricted-june-29-2026).
  - commanderbrackets.com/changelog lists Mar 23 and May 18, 2026 as "no changes".
- **Game Changers updates:**
  - Feb 9, 2026 (https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026): added Farewell and Biorhythm, removed nothing.
  - Oct 21, 2025 (https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025): removed Expropriate, Jin-Gitaxias Core Augur, Sway of the Stars, Vorinclex Voice of Hunger, Kinnan, Urza Lord High Artificer, Winota, Yuriko, Deflecting Swat and Food Chain.
- **Current Game Changers list (53 cards).** Source: https://playgroup.gg/commander/game-changers, "Last Updated 4 Oct 2026". It matches the official Oct 2025 list of 48 plus the Feb 2026 additions. The official format page (magic.wizards.com/en/formats/commander) did not render the list for me.
  - Ad Nauseam, Ancient Tomb, Aura Shards, Biorhythm, Bolas's Citadel, Braids Cabal Minion, **Chrome Mox**, Coalition Victory, Consecrated Sphinx, Crop Rotation, **Cyclonic Rift**, Demonic Tutor, Drannith Magistrate, Enlightened Tutor, Farewell, Field of the Dead, **Fierce Guardianship**, Force of Will, Gaea's Cradle, Gamble, Gifts Ungiven, Glacial Chasm, Grand Arbiter Augustin IV, Grim Monolith, Humility, Imperial Seal, Intuition, Jeska's Will, Lion's Eye Diamond, Mana Vault, Mishra's Workshop, **Mox Diamond**, Mystical Tutor, Narset Parter of Veils, Natural Order, Necropotence, Notion Thief, Opposition Agent, Orcish Bowmasters, Panoptic Mirror, Rhystic Study, Seedborn Muse, Serra's Sanctum, Smothering Tithe, Survival of the Fittest, Teferi's Protection, Tergrid, Thassa's Oracle, The One Ring, The Tabernacle at Pendrell Vale, Underworld Breach, Vampiric Tutor, Worldly Tutor.
- **Flags for this deck:**
  - Cyclonic Rift and Fierce Guardianship, already in the deck, are Game Changers.
  - Among the candidates, **Mox Diamond and Chrome Mox are Game Changers**. That is fine in Bracket 4, which has no Game Changer limit.
  - Jeweled Lotus is banned. No other candidate is banned or a Game Changer.
  - Snuff Out, Force of Negation, Pact of Negation, Misdirection, Commandeer and Subtlety are not Game Changers.

---

## 1. Defensive pieces vs swarms

| Card | Cost / Type | Oracle text (verbatim) | Price |
|---|---|---|---|
| Ensnaring Bridge | {3} Artifact | "Creatures with power greater than the number of cards in your hand can't attack." | $13.59 Stronghold, https://www.mtggoldfish.com/price/stronghold/ensnaring-bridge (Card Kingdom: $10.99 Mystery Booster 2 to $19.99 Stronghold, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ensnaring+Bridge) |
| Meekstone | {1} Artifact | "Creatures with power 3 or greater don't untap during their controllers' untap steps." | $12.32 7th Ed, https://www.mtggoldfish.com/price/seventh-edition/307/meekstone |
| Silent Arbiter | {4} Artifact Creature — Construct 1/5 | "No more than one creature can attack each combat. No more than one creature can block each combat." | $11 (Commander Masters / C20); the TD2 page lists all printings: https://www.mtggoldfish.com/price/mirrodin-pure-vs-new-phyrexia/204/silent-arbiter |
| Crawlspace | {3} Artifact | "No more than two creatures can attack you each combat." | $11.49 Urza's Legacy, https://www.mtggoldfish.com/price/urzas-legacy/123/crawlspace |
| Propaganda | {2}{U} Enchantment | "Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you." | $5.95 Tempest, https://www.mtggoldfish.com/price/tempest/propaganda |
| Koskun Falls | {2}{B}{B} World Enchantment | "At the beginning of your upkeep, sacrifice Koskun Falls unless you tap an untapped creature you control. Creatures can't attack you unless their controller pays {2} for each creature they control that's attacking you." | $17.44 Homelands, https://www.mtggoldfish.com/price/homelands/koskun-falls |
| Aetherize | {3}{U} Instant | "Return all attacking creatures to their owner's hand." | $0.54 Gatecrash, https://www.mtggoldfish.com/price/gatecrash/29/aetherize |
| Aetherspouts | {3}{U}{U} Instant | "For each attacking creature, its owner puts it on the top or bottom of their library." | $0.86 M15, https://www.mtggoldfish.com/price/magic-2015-core-set/44/aetherspouts |
| Thousand Winds | {4}{U}{U} Creature — Elemental 5/6 | "Flying. Morph {5}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.) When Thousand Winds is turned face up, return all other tapped creatures to their owners' hands." | $0.29 KTK, https://www.mtggoldfish.com/price/khans-of-tarkir/58/thousand-winds |
| Brine Elemental (found) | {4}{U}{U} Creature — Elemental 5/4 | "Morph {5}{U}{U} (...) When Brine Elemental is turned face up, each opponent skips their next untap step." | $0.27 Time Spiral, https://www.mtggoldfish.com/price/time-spiral/50/brine-elemental |
| Massacre Wurm | {3}{B}{B}{B} Creature — Phyrexian Wurm 6/5 | "When Massacre Wurm enters the battlefield, creatures your opponents control get -2/-2 until end of turn. Whenever a creature an opponent controls dies, that player loses 2 life." | $5.56 MBS, https://www.mtggoldfish.com/price/mirrodin-besieged/46/massacre-wurm |
| Crippling Fear | {2}{B}{B} Sorcery | "Choose a creature type. Creatures that aren't of the chosen type get -3/-3 until end of turn." | $0.54 KHM, https://www.mtggoldfish.com/price/kaldheim/82/crippling-fear |
| Royal Assassin | {1}{B}{B} Creature — Human Assassin 1/1 | "{T}: Destroy target tapped creature." | $0.54 M12, https://www.mtggoldfish.com/price/magic-2012/105/royal-assassin |
| Ophiomancer | {2}{B} Creature — Human Shaman 2/2 | "At the beginning of each upkeep, if you control no Snakes, create a 1/1 black Snake creature token with deathtouch." | $2.25 C13, https://www.mtggoldfish.com/price/commander-2013-edition/84/ophiomancer |
| Hooded Blightfang | {2}{B} Creature — Snake 1/4 | "Deathtouch. Whenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life. Whenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker." | $1.30 M21, https://www.mtggoldfish.com/price/core-set-2021/104/hooded-blightfang |
| No Mercy (found) | {2}{B}{B} Enchantment | "Whenever a creature deals damage to you, destroy it." | $28.90 Urza's Legacy, https://www.mtggoldfish.com/price/urzas-legacy/56/no-mercy |
| Sleep (found) | {2}{U}{U} Sorcery | "Tap all creatures target player controls. Those creatures don't untap during that player's next untap step." | $0.29 M11, https://www.mtggoldfish.com/price/magic-2011/73/sleep |
| Fog Bank (found) | {1}{U} Creature — Wall 0/2 | "Defender, flying. Prevent all combat damage that would be dealt to and dealt by Fog Bank." | $0.70 Urza's Saga, https://www.mtggoldfish.com/price/urzas-saga/75/fog-bank |
| Dubious Delicacy (2025, EOE) | {2}{B} Artifact — Food | "Flash. When this artifact enters, up to one target creature gets -3/-3 until end of turn. {2}, {T}, Sacrifice this artifact: You gain 3 life. {2}, {T}, Sacrifice this artifact: Target opponent loses 3 life." (from official release notes) | $0.24 EOE, https://www.mtggoldfish.com/price/edge-of-eternities/96/dubious-delicacy |

Fit notes:
- **Ensnaring Bridge**
  - Near-perfect asymmetry for this deck. Your 1-power attackers (Etrata, Vito, Virtus, Tetsuko) can still attack with one card in hand.
  - The drain loop and Mindcrank win without combat.
  - Downside: it also stops your Vein Ripper / Nighthawk-sized creatures.
- **Meekstone**
  - Only stops 3+ power creatures. Precon swarm tokens are usually 1/1 or 2/2, so it mostly misses them.
  - Better against big creatures than against swarms. Medium fit.
- **Silent Arbiter**
  - Also limits YOU to one attacker. Etrata alone is often enough, and the loop needs no attack.
  - A 1/5 body blocks well, and the one-blocker limit helps your attacks too.
  - Good, but symmetrical.
- **Crawlspace**
  - Affects only attacks against you, so it never touches your offense. Each opponent can still send two attackers.
  - Solid and colorless.
- **Propaganda**
  - The best tax effect for its cost against tokens, with zero effect on your plan.
  - It is a turn-3 tap-out, but it replaces the blocker you lack.
- **Koskun Falls:** the same tax, but worse. You must tap a creature each upkeep, and it is a World enchantment that costs $17. Skip it.
- **Aetherize:** an instant you hold up instead of tapping out. It wipes tokens and resets the swarm. Strong.
- **Aetherspouts**
  - The owner chooses top or bottom.
  - Any card left on top is what your next Etrata hit cloaks, and they redraw their own creature instead of a fresh card.
  - 5 mana is steep.
- **Thousand Winds: hidden synergy.**
  - Cast it face down for {3}. Etrata gives it "{2}{U}{B}: turn this face up", which is far cheaper than the {5}{U}{U} morph cost.
  - Turning it up during their combat bounces every tapped attacker. That is a 4-mana instant-speed Aetherize on a 5/6 flier.
  - It also bounces your own tapped creatures.
- **Brine Elemental:** the same trick with Etrata. For {2}{U}{B}, every opponent skips their next untap step. Very strong tempo in a 4-player game.
- **Massacre Wurm**
  - It kills x/2 tokens.
  - "That player loses 2 life" per death triggers Exquisite Blood / Bloodthirsty Conqueror, so it starts your loop. A strong finisher.
  - It costs 6, so it is not an early answer.
- **Crippling Fear**
  - Naming Vampire saves Etrata, Vito and the vampire pieces. Naming Assassin also saves Etrata.
  - It kills Tetsuko (Human Rogue) and your other non-vampires.
  - Situational.
- **Royal Assassin:** an Assassin, so it can trigger Etrata's cloak. It kills tapped attackers every turn and is power 1, so Tetsuko makes it unblockable. Strong fit.
- **Ophiomancer:** a fresh deathtouch blocker every upkeep, including opponents' upkeeps. The snake is sacrifice fodder and a Blood Artist trigger. Good.
- **Hooded Blightfang: excellent.**
  - It is a 1/4 deathtouch wall, and power 1 means Tetsuko makes it unblockable.
  - When Etrata (deathtouch) or Blightfang attacks, it drains 1 and you gain 1. With Blight-Priest plus Conqueror or Exquisite Blood, that starts the infinite loop.
- **No Mercy:** a strong deterrent, but it does not stop the first hit, and $28.90 is a lot.
- **Sleep:** a sorcery that buys a turn against one player only.
- **Fog Bank:** a cheap blocker that stops one attacker per turn.
- **Dubious Delicacy**
  - A flash instant-speed -3/-3 for 3 that you can hold up.
  - Later it sacrifices to drain 3 or gain 3, either of which starts the loop with Conqueror or Blight-Priest.

## 2. Cheap deathtouch / lifelink Vampires (loop starters)

| Card | Cost / Type | Oracle text (verbatim) | Price |
|---|---|---|---|
| Vampire of the Dire Moon | {B} Creature — Vampire 1/1 | "Deathtouch (...) Lifelink (...)" | $1.26 M20, https://www.mtggoldfish.com/price/core-set-2020/120/vampire-of-the-dire-moon |
| Gifted Aetherborn | {B}{B} Creature — Aetherborn Vampire 2/3 | "Deathtouch, lifelink" | $0.43 AER, https://www.mtggoldfish.com/price/aether-revolt/61/gifted-aetherborn |
| Vampire Nighthawk | {1}{B}{B} Creature — Vampire Shaman 2/3 | "Flying, deathtouch, lifelink" | $0.38 ZEN, https://www.mtggoldfish.com/price/zendikar/116/vampire-nighthawk |
| Nighthawk Scavenger (found) | {1}{B}{B} Creature — Vampire Rogue 1+*/3 | "Flying, deathtouch, lifelink. Nighthawk Scavenger's power is equal to 1 plus the number of card types among cards in your opponents' graveyards." | $0.49 ZNR (LCC printing $0.41), https://www.mtggoldfish.com/price/zendikar-rising/115/nighthawk-scavenger |
| Bloodline Keeper // Lord of Lineage | {2}{B}{B} Creature — Vampire 3/3 | Front: "Flying. {T}: Create a 2/2 black Vampire creature token with flying. {B}: Transform Bloodline Keeper. Activate only if you control five or more Vampires." Back: "Flying. Other Vampire creatures you control get +2/+2. {T}: Create a 2/2 black Vampire creature token with flying." | $8.55 ISD, https://www.mtggoldfish.com/price/innistrad/90/bloodline-keeper |
| Blood Artist (found) | {1}{B} Creature — Vampire 0/1 | "Whenever Blood Artist or another creature dies, target player loses 1 life and you gain 1 life." | $3.00 AVR, https://www.mtggoldfish.com/price/avacyn-restored/86/blood-artist |
| Falkenrath Noble (found) | {3}{B} Creature — Vampire Noble 2/2 | "Flying. Whenever Falkenrath Noble or another creature dies, target player loses 1 life and you gain 1 life." | $0.30 ISD, https://www.mtggoldfish.com/price/innistrad/100/falkenrath-noble |
| Kalitas, Traitor of Ghet (found) | {2}{B}{B} Legendary Creature — Vampire Warrior 3/4 | "Lifelink. If a nontoken creature an opponent controls would die, instead exile that card and create a 2/2 black Zombie creature token. {2}{B}, Sacrifice another Vampire or Zombie: Put two +1/+1 counters on Kalitas, Traitor of Ghet." | $4.93 OGW, https://www.mtggoldfish.com/price/oath-of-the-gatewatch/86/kalitas-traitor-of-ghet |
| Vein Ripper (found) | {3}{B}{B}{B} Creature — Vampire Assassin 6/5 | "Flying. Ward—Sacrifice a creature. Whenever a creature dies, target opponent loses 2 life and you gain 2 life." | $7.49 MKM #110 ($6.99 showcase #346), https://www.mtggoldfish.com/price/ravnica-murders-at-karlov-manor/110/vein-ripper |

Fit notes:
- **Vampire of the Dire Moon: the best fit here.**
  - It is a turn-1 deathtouch blocker.
  - Power 1 means Tetsuko makes it unblockable.
  - Lifelink damage triggers Blight-Priest, which starts the loop.
- **Gifted Aetherborn:** the best 2-drop wall. Power 2 means no Tetsuko evasion.
- **Vampire Nighthawk / Nighthawk Scavenger:** 3-mana deathtouch lifelink fliers that block fliers too. Both are under $0.50.
- **Bloodline Keeper:** a stream of 2/2 flying blockers. 4 mana.
- **Blood Artist: very strong here.**
  - Every chump block or deathtouch trade is a "creature dies" trigger, and so is every swarm creature you kill.
  - With Exquisite Blood or Bloodthirsty Conqueror plus Blight-Priest or Sanguine Bond, one trigger starts the infinite loop.
  - It also makes Toxic Deluge a win.
- **Falkenrath Noble:** the same death trigger on a 4-mana flier.
- **Kalitas:** a 3/4 lifelink blocker that turns opponents' dying creatures into your Zombies.
- **Vein Ripper**
  - A Vampire Assassin, so it can trigger Etrata's cloak.
  - Each creature death drains 2.
  - Its ward makes removal costly. 6 mana.

## 3. Ways not to tap out

| Card | Cost / Type | Oracle text (verbatim) | Price |
|---|---|---|---|
| Leyline of Anticipation | {2}{U}{U} Enchantment | "If Leyline of Anticipation is in your opening hand, you may begin the game with it on the battlefield. You may cast spells as though they had flash." | $7.50 M11, https://www.mtggoldfish.com/price/magic-2011/61/leyline-of-anticipation |
| Teferi, Mage of Zhalfir | {2}{U}{U}{U} Legendary Creature — Human Wizard 3/4 | "Flash. Creature cards you own that aren't on the battlefield have flash. Each opponent can cast spells only any time they could cast a sorcery." | $2.98 TSP, https://www.mtggoldfish.com/price/time-spiral/83/teferi-mage-of-zhalfir |
| Vedalken Orrery | {4} Artifact | "You may cast spells as though they had flash." | $20.99 5DN, https://www.mtggoldfish.com/price/fifth-dawn/163/vedalken-orrery |
| Emergence Zone | Land | "{T}: Add {C}. {1}, {T}, Sacrifice Emergence Zone: You may cast spells this turn as though they had flash." | $4.11 WAR, https://www.mtggoldfish.com/price/war-of-the-spark/245/emergence-zone |
| Borne Upon a Wind (found) | {1}{U} Instant | "You may cast spells this turn as though they had flash. Draw a card." | $4.13 LTR, https://www.mtggoldfish.com/price/the-lord-of-the-rings-tales-of-middle-earth/44/borne-upon-a-wind |
| Saw It Coming | {1}{U}{U} Instant | "Counter target spell. Foretell {1}{U} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)" | $0.39 KHM, https://www.mtggoldfish.com/price/kaldheim/76/saw-it-coming |
| Poison the Cup | {1}{B}{B} Instant | "Destroy target creature. If this spell was foretold, scry 2. Foretell {1}{B} (...)" | $0.25 KHM, https://www.mtggoldfish.com/price/kaldheim/103/poison-the-cup |
| Behold the Multiverse | {3}{U} Instant | "Scry 2, then draw two cards. Foretell {1}{U} (...)" | $0.28 KHM, https://www.mtggoldfish.com/price/kaldheim/46/behold-the-multiverse |
| Snuff Out | {3}{B} Instant | "If you control a Swamp, you may pay 4 life rather than pay this spell's mana cost. Destroy target nonblack creature. It can't be regenerated." | $7.39 MMQ, https://www.mtggoldfish.com/price/mercadian-masques/162/snuff-out |
| Force of Negation | {1}{U}{U} Instant | "If it's not your turn, you may exile a blue card from your hand rather than pay this spell's mana cost. Counter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard." | $55.56 MH1, https://www.mtggoldfish.com/price/modern-horizons/52/force-of-negation |
| Commandeer | {5}{U}{U} Instant | "You may exile two blue cards from your hand rather than pay this spell's mana cost. Gain control of target noncreature spell. You may choose new targets for it. (...)" | $14.27 CSP, https://www.mtggoldfish.com/price/coldsnap/29/commandeer |
| Misdirection | {3}{U}{U} Instant | "You may exile a blue card from your hand rather than pay this spell's mana cost. Change the target of target spell with a single target." | $47.40 MMQ, https://www.mtggoldfish.com/price/mercadian-masques/87/misdirection |
| Pact of Negation | {0} Instant | "Counter target spell. At the beginning of your next upkeep, pay {3}{U}{U}. If you don't, you lose the game." | $22.00 FUT, https://www.mtggoldfish.com/price/future-sight/42/pact-of-negation |
| Subtlety | {2}{U}{U} Creature — Elemental Incarnation 3/3 | "Flash. Flying. When Subtlety enters the battlefield, choose up to one target creature spell or planeswalker spell. Its owner puts it on the top or bottom of their library. Evoke—Exile a blue card from your hand." | $11.63 MH2, https://www.mtggoldfish.com/price/modern-horizons-2/67/subtlety |
| Mental Misstep | {U/P} Instant | "({U/P} can be paid with either {U} or 2 life.) Counter target spell with mana value 1." | $8.69 NPH, https://www.mtggoldfish.com/price/new-phyrexia/38/mental-misstep |
| Spelljack | {3}{U}{U}{U} Instant | "Counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may play it without paying its mana cost for as long as it remains exiled. (If it has X in its mana cost, X is 0.)" | $1.72 JUD, https://www.mtggoldfish.com/price/judgment/51/spelljack |
| Desertion | {3}{U}{U} Instant | "Counter target spell. If an artifact or creature spell is countered this way, put that card onto the battlefield under your control instead of into its owner's graveyard." | $2.49 Visions, https://www.mtggoldfish.com/price/visions/desertion |

Fit notes:
- **Flash enablers**
  - Leyline of Anticipation and Vedalken Orrery let you pass with mana up and then flash in Etrata or blockers at end of turn or mid-combat. That directly fixes the "tapped out on turn 3" problem.
  - But each is itself a 4-mana tap-out first.
  - Teferi only gives flash to creatures and costs 5.
  - Emergence Zone is a land slot, so it is basically free. Good one-shot use.
  - Borne Upon a Wind is cheap and cantrips, but needs mana for both itself and the spell.
- **Foretell is the cleanest answer to tap-out risk**
  - On turn 2 or 3, spend leftover mana to foretell, then hold up a 2-mana Counterspell or kill spell later beside a creature drop.
  - Saw It Coming and Poison the Cup cost under $0.40 each.
- **Free interaction**
  - Snuff Out: free removal for 4 life, but it misses black creatures.
  - Force of Negation: free on opponents' turns, but noncreature only. It protects against wraths and stops anthems and "creatures get +X" overruns, but cannot counter the swarm itself.
  - Subtlety: free via evoke against a creature spell. If the owner puts it on top, Etrata's next hit cloaks it.
  - Pact of Negation: free once, then 5 mana on your next upkeep. Fine in Bracket 4 when you are going off.
  - Commandeer and Misdirection are pricey and narrow.
  - Mental Misstep is poor in Commander. Skip it.
- **Theft counters**
  - Spelljack and Desertion fit the "steal" theme, but at 5-6 mana they are the opposite of not tapping out.
  - Desertion steals a creature, so it doubles as a blocker. Low priority.

## 4. Faster or safer Etrata

| Card | Cost / Type | Oracle text (verbatim) | Price |
|---|---|---|---|
| Hall of the Bandit Lord | Legendary Land | "Hall of the Bandit Lord enters the battlefield tapped. {T}, Pay 3 life: Add {C}. If that mana is spent on a creature spell, it gains haste." | $24.00 CHK, https://www.mtggoldfish.com/price/champions-of-kamigawa/277/hall-of-the-bandit-lord |
| Command Beacon | Land | "{T}: Add {C}. {T}, Sacrifice Command Beacon: Put your commander into your hand from the command zone." | $8.55 C15, https://www.mtggoldfish.com/price/commander-2015/56/command-beacon |
| Lightning Greaves | {2} Artifact — Equipment | "Equipped creature has haste and shroud. (It can't be the target of spells or abilities.) Equip {0}" | $6.45 MRD, https://www.mtggoldfish.com/price/mirrodin/199/lightning-greaves |
| Swiftfoot Boots | {2} Artifact — Equipment | "Equipped creature has hexproof and haste. (It can't be the target of spells or abilities your opponents control.) Equip {1}" | $2.31 M12, https://www.mtggoldfish.com/price/magic-2012/219/swiftfoot-boots |
| Whispersilk Cloak | {3} Artifact — Equipment | "Equipped creature can't be blocked and has shroud. (It can't be the target of spells or abilities.) Equip {2}" | $2.99 M11, https://www.mtggoldfish.com/price/magic-2011/221/whispersilk-cloak |
| Key to the City | {2} Artifact | "{T}, Discard a card: Up to one target creature can't be blocked this turn. Whenever Key to the City becomes untapped, you may pay {2}. If you do, draw a card." | $0.40 KLD, https://www.mtggoldfish.com/price/kaladesh/220/key-to-the-city |
| Jet Medallion | {2} Artifact | "Black spells you cast cost {1} less to cast." | $26.67 Tempest, https://www.mtggoldfish.com/price/tempest/jet-medallion |
| Sapphire Medallion | {2} Artifact | "Blue spells you cast cost {1} less to cast." | $24.06 Tempest, https://www.mtggoldfish.com/price/tempest/sapphire-medallion |
| Mox Diamond (GAME CHANGER) | {0} Artifact | "If Mox Diamond would enter the battlefield, you may discard a land card instead. If you do, put Mox Diamond onto the battlefield. If you don't, put it into its owner's graveyard. {T}: Add one mana of any color." | $1,199.99 Stronghold as shown, https://www.mtggoldfish.com/price/stronghold/mox-diamond |
| Chrome Mox (GAME CHANGER) | {0} Artifact | "Imprint — When Chrome Mox enters the battlefield, you may exile a nonartifact, nonland card from your hand. {T}: Add one mana of any of the exiled card's colors." | $171.78 MRD, https://www.mtggoldfish.com/price/mirrodin/152/chrome-mox |
| Lotus Petal | {0} Artifact | "{T}, Sacrifice Lotus Petal: Add one mana of any color." | $37.02 Tempest, https://www.mtggoldfish.com/price/tempest/lotus-petal |
| Springleaf Drum | {1} Artifact | "{T}, Tap an untapped creature you control: Add one mana of any color." | $0.86 LRW, https://www.mtggoldfish.com/price/lorwyn/261/springleaf-drum |
| Cabal Ritual | {1}{B} Instant | "Add {B}{B}{B}. Threshold — Add {B}{B}{B}{B}{B} instead if seven or more cards are in your graveyard." | $16.60 Torment, https://www.mtggoldfish.com/price/torment/51/cabal-ritual |
| Slip Out the Back | {U} Instant | "Put a +1/+1 counter on target creature. It phases out. (Treat it and anything attached to it as though they don't exist until its controller's next turn.)" | $3.95 SNC, https://www.mtggoldfish.com/price/streets-of-new-capenna/62/slip-out-the-back |
| Jeweled Lotus | — | **BANNED in Commander** (see the ban list above). Not looked up further. | n/a |

Fit notes:
- **Medallions**
  - Etrata is both blue AND black, so either Medallion makes her cost {U}{B}.
  - Turn-2 Medallion into turn-3 Etrata with 1 mana floating, or turn-3 Etrata plus a 1-drop blocker.
  - They also discount most of the deck. Strong, but $24-27 each.
- **Hall of the Bandit Lord:** its {C} can pay Etrata's generic {1}, which gives her haste. She connects the turn she lands, at a cost of 3 life. $24.
- **Swiftfoot Boots vs Lightning Greaves**
  - Prefer Boots. Greaves' shroud blocks your own Slip Out the Back and similar tricks.
  - Etrata is a 1/4 deathtouch who usually stays home anyway. Haste matters more after a removal recast.
- **Whispersilk Cloak:** redundant with Tetsuko. Low priority.
- **Key to the City:** $0.40 evasion plus card draw. Fine, but redundant with Tetsuko.
- **Command Beacon:** protects against commander-tax creep after removal. It does not make Etrata faster early.
- **Mox Diamond / Chrome Mox:** Game Changers (allowed in Bracket 4) and expensive. They are real turn-2 Etrata enablers.
- **Lotus Petal:** a one-shot accelerant.
- **Springleaf Drum:** weak. You have few early creatures to tap, and the creature you tap is the blocker you need.
- **Cabal Ritual:** works with Dark Ritual for burst turns, but rituals are the opposite of holding up defense.
- **Slip Out the Back: WARNING, anti-synergy.**
  - The +1/+1 counter makes Etrata 2/5 and Vito 2/2. Neither has power or toughness 1 or less anymore, so the counter permanently turns off Tetsuko's evasion on that creature.
  - Avoid it, or use it only on creatures that don't rely on Tetsuko.

## 5. See or set the opponent's top card (what Etrata cloaks)

| Card | Cost / Type | Oracle text (verbatim) | Price |
|---|---|---|---|
| Portent | {U} Sorcery | "Look at the top three cards of target player's library, then put them back in any order. You may have that player shuffle. Draw a card at the beginning of the next turn's upkeep." | $0.85 Ice Age, https://www.mtggoldfish.com/price/ice-age/portent |
| Lantern of Insight | {1} Artifact | "Players play with the top card of their libraries revealed. {T}, Sacrifice Lantern of Insight: Target player shuffles." | $3.06 5DN, https://www.mtggoldfish.com/price/fifth-dawn/135/lantern-of-insight |
| Memory Lapse (found) | {1}{U} Instant | "Counter target spell. If that spell is countered this way, put it on top of its owner's library instead of into that player's graveyard." | $0.50 7th Ed, https://www.mtggoldfish.com/price/seventh-edition/88/memory-lapse |
| Hinder (found) | {1}{U}{U} Instant | "Counter target spell. If that spell is countered this way, put that card on the top or bottom of its owner's library instead of into that player's graveyard." | $0.35 CHK, https://www.mtggoldfish.com/price/champions-of-kamigawa/65/hinder |
| Misinformation (found) | {B} Instant | "Put up to three target cards from an opponent's graveyard on top of their library in any order." | $0.70 Alliances, https://www.mtggoldfish.com/price/alliances/misinformation |
| Griptide (found) | {3}{U} Instant | "Put target creature on top of its owner's library." | $0.20 DKA, https://www.mtggoldfish.com/price/dark-ascension/38/griptide |
| Totally Lost (found) | {4}{U} Instant | "Put target nonland permanent on top of its owner's library." | $0.20 GTC, https://www.mtggoldfish.com/price/gatecrash/54/totally-lost |
| Field of Dreams (found) | {U} World Enchantment | "Players play with the top card of their libraries revealed." | $155.63 Legends, https://www.mtggoldfish.com/price/legends/field-of-dreams (too expensive) |

Fit notes:
- **How the free cast works:** a cloaked noncreature card can't be turned face up. Etrata's ability then exiles it, and you may cast it for free. So the best outcome is putting a strong NONcreature spell on top of their library before your Assassin connects.
- **Memory Lapse: the standout.**
  - A 2-mana counter that puts their spell on top of their library.
  - If the spell is a noncreature card (a wrath, an anthem, an overrun), your next Etrata hit cloaks it and you can cast it free later.
  - Either way, it costs them their next draw. It is defensive and on-plan.
  - EDHREC shows it in 39% of Etrata decks.
- **Hinder:** you choose top or bottom, so it does the same job for 3 mana.
- **Misinformation**
  - 1-mana instant. Stack their graveyard's best noncreature spell (their used wrath or ramp spell) on top, then cloak it and cast it.
  - It also denies their draws. Good in response to their draw step.
- **Griptide:** an instant answer to an attacker or blocker that puts the card on top of the library for Etrata.
- **Totally Lost:** the same effect for any nonland permanent, but 5 mana.
- **Portent:** sorcery speed. Set up the top three of the player Etrata will hit this turn.
- **Lantern of Insight:** shows every top card, so you know which opponent to hit. It is 1 mana but does little else.

---

## Ranked shortlist: 10 best adds for this deck

1. **Vampire of the Dire Moon ($1.26)**
   - Turn-1 deathtouch blocker.
   - Power 1, so Tetsuko makes it unblockable.
   - Lifelink triggers Blight-Priest, which starts the loop.
2. **Hooded Blightfang ($1.30)**
   - 3-mana 1/4 deathtouch wall, also unblockable under Tetsuko.
   - Every attack by Etrata or another deathtouch creature drains 1 and gains 1, which starts the loop.
3. **Memory Lapse ($0.50)**
   - 2-mana counter that leaves mana for a creature drop.
   - Their spell goes to the top of their library for Etrata to cloak and cast free.
4. **Blood Artist ($3.00)**
   - Every block or trade against the swarm becomes a loop trigger.
   - It also turns your Toxic Deluge into a win.
5. **Ensnaring Bridge ($13.59)**
   - Shuts down swarms while your 1-power team keeps attacking.
6. **Aetherize ($0.54)**
   - The instant-speed reset you hold up instead of tapping out.
   - Thousand Winds ($0.29) is the higher-ceiling version: morph it face down for {3}, then flip it for {2}{U}{B} with Etrata's ability.
7. **Gifted Aetherborn ($0.43)**
   - The best 2-mana blocker, with deathtouch and lifelink.
8. **Royal Assassin ($0.54)**
   - An Assassin, so it can trigger Etrata's cloak.
   - Kills one tapped attacker per turn, and Tetsuko makes it unblockable.
9. **Propaganda ($5.95)**
   - Taxes every attacker by {2} and never affects your plan.
   - The strongest 3-mana anti-swarm card in your colors.
10. **Saw It Coming ($0.39) plus Poison the Cup ($0.25), the foretell pair**
    - Use spare turn-2/3 mana to foretell them.
    - Later, cast either for 2 alongside a creature, so you are never tapped out.

**Honorable mentions:**
- Brine Elemental (Etrata flip makes all opponents skip their untap step)
- Snuff Out (free removal)
- Misinformation
- Dubious Delicacy (2025)
- Ophiomancer
- Vampire Nighthawk
- Massacre Wurm (finisher that starts the loop)
- Jet or Sapphire Medallion (2-mana Etrata)
- Swiftfoot Boots
- Emergence Zone

**Avoid:**
- Slip Out the Back (its counter breaks Tetsuko)
- Koskun Falls
- Mental Misstep
- Springleaf Drum
- Field of Dreams (price)
- Jeweled Lotus (banned)
