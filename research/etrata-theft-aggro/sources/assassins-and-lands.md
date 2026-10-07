# Etrata, Deadly Fugitive: research on Assassins, creature lands and evasion (verified 2026-10-05)

## Sources and how I checked
- Card Kingdom (CK) search pages, one per card: `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=<Card+Name>`. Each page shows the card's rules text and the NM price of every printing. **I took rules text and prices from these pages unless noted otherwise.**
- I cross-checked some cards against api.magicthegathering.io: Etrata, Mutavault and Mothdust Changeling. That API has no data for most Assassin's Creed cards or for any 2025-2026 set (it returned an empty result for Hookblade Veteran).
- MTGGoldfish: I checked Mutavault (MOR, $7.20) and Hullcarver ($0.23). Most other MTGGoldfish URLs returned 404, and mtg.wiki card pages returned 403.
- Other sources:
  - EDHREC Etrata page: https://edhrec.com/commanders/etrata-deadly-fugitive
  - EDHREC Dimir Assassins: https://edhrec.com/typal/assassins/dimir
  - EDHREC Dimir Shapeshifters: https://edhrec.com/typal/shapeshifters/dimir
  - Commander Spellbook: https://commanderspellbook.com/search/?q=Etrata
- Banned list: https://magic.wizards.com/en/banned-restricted-list. **None of the cards below are banned.**
- Game Changers list: https://edhrec.com/top/game-changers (53 cards). **None of the cards below are Game Changers.** Notion Thief, Cyclonic Rift, Rhystic Study and the tutors are, if you run them.
- How to read the text: CK pages are run through an extraction step, so the text is near-verbatim. Some older cards show their printed wording ("enters the battlefield", "add {C} to your mana pool"); current Oracle wording says "enters" instead. The rules meaning is the same.

**Etrata's Oracle text (from the MTG API):** "Deathtouch / Face-down creatures you control have '{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.' / Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library." Etrata is a 1/4.

## Interactions that apply to the whole list
1. **Tetsuko makes Etrata herself unblockable.** Tetsuko's condition is power OR toughness 1 or less, and Etrata has power 1. The same goes for any X/1 creature, which is why Silumgar Assassin, Reno and Rude and Stingblade Assassin qualify. Equipment that only adds power, like Amorphous Axe, keeps a 1-toughness creature unblockable.
2. **Leyline of Transformation (naming Assassin) and Maskwood Nexus also change face-down creatures and animated lands.** Face-down status sets the creature to having no types, but these cards add types afterwards (layer 4). As a result:
   - cloaked and manifested 2/2s become Assassins and trigger Etrata;
   - Blinkmoth Nexus, Creeping Tar Pit and Mishra's Factory become Assassins when animated;
   - Fountainport's Fish tokens become Assassins.
   Without Leyline or Maskwood, a face-down 2/2 is not an Assassin and does nothing for Etrata.
3. **Anthem anti-synergy.** Achilles Davenport's "+1/+1 to other Assassins" turns your 1/1s into 2/2s, and they lose Tetsuko's unblockability. Desmond Miles and White Widow outgrow it too.
4. **Morph and megamorph cards.** If you cloak a morph card (Ruthless Ripper, Silumgar Assassin), you can turn it face up for its morph cost instead of paying {2}{U}{B}. Ruthless Ripper's morph cost is "reveal a black card", so it flips for free.
5. **Brotherhood Headquarters gotcha.** Its colored mana can pay for "an ability of an Assassin source". Etrata's flip ability is granted to the face-down creature, so that mana only works when Leyline or Maskwood makes the face-down creature an Assassin.

---

## 1. Assassins, changelings and Assassin payoffs (U/B or colorless)

| Card | Cost | Type, P/T | Oracle text (per source) | Price (CK NM, cheapest) | Fits this deck? |
|---|---|---|---|---|---|
| **Hired Poisoner** | {B} | Creature, Human Assassin, 1/1 | "Deathtouch" | $0.35 (GRN) | Yes. A turn-1 Assassin that Tetsuko makes unblockable, and a deathtouch blocker. |
| **Hullcarver** (Edge of Eternities) | {B} per CK. MTGGoldfish's page read as a 1-mana colorless card. **Mana cost not fully confirmed**, but mana value is 1 either way. | Artifact Creature, Robot Assassin, 1/1 | "Deathtouch" (CK and MTGGoldfish agree) | CK $0.35. MTGGoldfish $0.23 (https://www.mtggoldfish.com/price/Edge+of+Eternities/Hullcarver) | Yes. A second Hired Poisoner. If it is colorless, any deck can play it. |
| **Ruthless Ripper** | {B} | Creature, Human Assassin, 1/1 | "Deathtouch. Morph—Reveal a black card in your hand. ... When Ruthless Ripper is turned face up, target player loses 2 life." | $0.35 (KTK/A25) | Yes. A 1-drop Tetsuko attacker, and if Etrata cloaks it, it flips for free. |
| **Midnight Assassin** | {2}{B} | Creature, **Vampire Assassin**, 1/2 | "Flying, deathtouch" | $0.35 (SNC/J25) | **Yes, strongly.** It flies, Tetsuko applies (power 1), it blocks with deathtouch, and it is also a Vampire. |
| **Assassin Initiate** | {1}{B} | Creature, Human Assassin, 1/1 | "{1}: Assassin Initiate gains your choice of flying, deathtouch, or lifelink until end of turn." | $0.39 (ACR) | Yes. A 2-drop that Tetsuko covers, and a flexible blocker. |
| **Aven Heartstabber** | {U}{B} | Creature, Bird Assassin, 1/1 | "Flying. As long as there are five or more mana values among cards in your graveyard, Aven Heartstabber gets +2/+2 and has deathtouch. When Aven Heartstabber dies, mill two cards, then draw a card." | $0.49 (SNC) | Yes. A 2-drop with evasion. |
| **Brotherhood Spy** | {1}{U} | Creature, Human Assassin, 1/3 | "At the beginning of combat on your turn, if you control a legendary Assassin, Brotherhood Spy gets +1/+0 until end of turn and can't be blocked this turn." | $0.69 (ACR) | Yes. Etrata is a legendary Assassin, so the Spy is unblockable on its own, without Tetsuko. |
| **Silumgar Assassin** | {1}{B} | Creature, Human Assassin, 2/1 | "Creatures with power greater than Silumgar Assassin's power can't block it. Megamorph {2}{B} ... When Silumgar Assassin is turned face up, destroy target creature with power 3 or less an opponent controls." | $0.49 (DTK/C19) | Yes. With toughness 1, Tetsuko makes it unblockable, and a cloaked copy flips for {2}{B} as removal. |
| **Royal Assassin** | {1}{B}{B} | Creature, Human Assassin, 1/1 | "{T}: Destroy target tapped creature." | $0.59 (ACR) | Only as a defensive piece. It wants to stay untapped, so it does not help the cloak plan. |
| **Thorn of the Black Rose** | {3}{B} | Creature, Human Assassin, 1/3 | "Deathtouch. When Thorn of the Black Rose enters the battlefield, you become the monarch." | $0.35 | Good. A deathtouch blocker that protects the monarch, and Tetsuko makes it unblockable. |
| **Termination Facilitator** | {1}{B} | Creature, Human Assassin, 1/3 | "{T}: Put a bounty counter on target creature or planeswalker. Activate only as a sorcery. Whenever a creature or planeswalker an opponent controls with a bounty counter on it is dealt damage, destroy it." | $4.49 (J22) | OK, mostly as a blocker and removal. |
| **White Widow, Yelena Belova** (Marvel) | {1}{B} | Legendary Creature, Human Assassin Villain, 1/2 | "Deathtouch. Whenever a creature you control with deathtouch deals combat damage to a player, put a +1/+1 counter on it." | $1.49 | Good early. Its counters eventually push creatures, Etrata included, out of Tetsuko range. |
| **Black Widow, Deadly Hunter** (Marvel) | {2}{B} | Legendary Creature, Human Assassin Hero, 3/3 | "Deathtouch. Whenever a creature you control with deathtouch deals combat damage to a player, you draw a card and lose 1 life." | $1.49 | Good. Etrata has deathtouch, so each Etrata hit becomes a cloak plus a card. |
| **Reno and Rude** (Final Fantasy) | {1}{B} | Legendary Creature, Human Assassin, 2/1 | "Menace. Whenever Reno and Rude deals combat damage to a player, exile the top card of that player's library. Then you may sacrifice another creature or artifact. If you do, you may play the exiled card this turn..." | $0.35 | Good. Toughness 1 means Tetsuko makes it unblockable. |
| **Shadow, Mysterious Assassin** (Final Fantasy Commander) | {2}{B} | Legendary Creature, Human Assassin, 3/3 | "Deathtouch. Throw — Whenever Shadow deals combat damage to a player, you may sacrifice another nonland permanent. If you do, draw two cards and each opponent loses life equal to the mana value of the sacrificed permanent." | $0.59 | Medium. It has no evasion. |
| **Interceptor, Shadow's Hound** (Final Fantasy Commander) | {2}{B}{B} | Legendary Creature, Dog, 4/3 | "Menace. Assassins you control have menace. Whenever you attack with one or more legendary creatures, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking." | $0.49 | Medium. Gives your whole team menace, but it is not an Assassin itself. |
| **Merciless Harlequin** | {2}{B} | Creature, Human Assassin, 2/1 | "Freerunning {1}{B} ... When Merciless Harlequin enters the battlefield, you draw a card and you lose 1 life." | $0.59 | Filler. Tetsuko applies (toughness 1). |
| **Poison-Blade Mentor** | {1}{B} | Creature, Human Assassin, 2/1 | "Deathtouch. Whenever Poison-Blade Mentor attacks, another target Assassin you control gains deathtouch until end of turn." | $0.59 | Filler. Tetsuko applies. |
| **Guildsworn Prowler** | {1}{B} | Creature, Tiefling Rogue Assassin, 2/1 | "Deathtouch. When Guildsworn Prowler dies, if it wasn't blocking, draw a card." | $0.35 | Filler. Tetsuko applies. |
| **Stingblade Assassin** | {3}{B} | Creature, Faerie Assassin, 3/1 | "Flash, Flying. When Stingblade Assassin enters the battlefield, destroy target creature an opponent controls that was dealt damage this turn." | $0.35 | OK. Flash lets it block, and it has evasion. |
| **Rooftop Assassin** | {3}{B} | Creature, Vampire Assassin, 2/2 | "Flash / Flying, lifelink / When Rooftop Assassin enters the battlefield, destroy target creature an opponent controls that was dealt damage this turn." | $0.35 (OTJ) | OK. A flash Vampire Assassin. |
| **Lydia Frye** | {2}{U/B} | Legendary Creature, Human Assassin, 3/2 | "Lydia Frye can't be blocked by creatures with power 3 or greater. At the beginning of your end step, surveil X, where X is the number of tapped Assassins you control." | $0.35 | Filler. |
| **Basim Ibn Ishaq** | {U}{B} | Legendary Creature, Human Assassin, 2/2 | "Whenever you cast a historic spell, draw a card. Basim Ibn Ishaq can't be blocked this turn. This ability triggers only once each turn. Whenever Basim Ibn Ishaq deals combat damage to a player, put a +1/+1 counter on it." | $5.49 | Good if the deck runs many legends and artifacts. |
| **Desmond Miles** | {1}{B} | Legendary Creature, Human Assassin, 1/3 | "Menace. Desmond Miles gets +1/+0 for each other Assassin you control and each Assassin card in your graveyard. Whenever Desmond Miles deals combat damage to a player, surveil X..." | $0.79 | Medium. It outgrows Tetsuko. |
| **Achilles Davenport** | {2}{U}{B} | Legendary Creature, Human Assassin, 3/3 | "Freerunning {U}{B} ... Menace. Other Assassins you control get +1/+1." | $6.49 | **Anti-synergy with Tetsuko** (see interaction 3). |
| **Darkblade Agent** | {1}{U}{B} | Creature, Human Assassin, 2/3 | "As long as you've surveilled this turn, Darkblade Agent has deathtouch and 'Whenever this creature deals combat damage to a player, you draw a card.'" | $0.35 | Weak. |
| **Vein Ripper** | {3}{B}{B}{B} | Creature, Vampire Assassin, 6/5 | "Flying. Ward—Sacrifice a creature. Whenever a creature dies, target opponent loses 2 life and you gain 2 life." | $9.99–10.99 | A strong finisher, but it costs 6 and does not fix the early-game problem. |
| **Vincent Valentine** (Final Fantasy) | {2}{B}{B} | Legendary Creature, Assassin // Galian Beast | "Whenever a creature an opponent controls dies, put a number of +1/+1 counters on Vincent Valentine equal to that creature's power. Whenever Vincent Valentine attacks, you may transform it." (summary of the back face) | $1.29 | Medium. |
| **Massacre Girl, Most Wanted** | {4}{B} | Legendary Creature, Human Assassin, 4/4 | "When another creature or planeswalker you control dies, Massacre Girl deals 1 damage to target opponent and you gain 1 life. Whenever an opponent is dealt noncombat damage, put a +1/+1 counter on Massacre Girl." | $0.49 | Not this deck. |
| **Mothdust Changeling** | {U} | Creature, Shapeshifter, 1/1 | "Changeling ... Tap an untapped creature you control: Mothdust Changeling gains flying until end of turn." (also confirmed on the MTG API) | $0.69 (MOR) | Yes. A 1-drop Assassin that Tetsuko covers. |
| **Universal Automaton** | {1} | Artifact Creature, Shapeshifter, 1/1 | "Changeling" (CK showed only this; I could not confirm whether there is more text) | $0.99 (MH1) | Yes. A colorless 1-drop Assassin that Tetsuko covers, and it counts as an artifact. |
| **Mischievous Sneakling** (Lorwyn Eclipsed) | {1}{U/B} | Creature, Shapeshifter, 2/2 | "Changeling ... Flash" | $0.35 | Yes. A flash blocker that is an Assassin. |
| **Venomous Changeling** | {2}{B} | Creature, Shapeshifter, 1/3 | "Changeling ... Deathtouch" | $0.35 (MH1) | Yes. A deathtouch blocker and a Tetsuko attacker. |
| **Graveshifter** | {3}{B} | Creature, Shapeshifter, 2/2 | "Changeling ... When this creature enters, you may return target creature card from your graveyard to your hand." | $0.35 | Filler. |
| **Three Tree Mascot** | {2} | Artifact Creature, Shapeshifter, 2/1 | "Changeling. {1}: Add one mana of any color. Activate only once each turn." | $0.35 | OK. Tetsuko applies (toughness 1). |
| **Omni-Changeling** (Lorwyn Eclipsed) | {3}{U}{U} | Creature, Shapeshifter, 0/0 | "Changeling. Convoke. You may have this creature enter as a copy of any creature on the battlefield, except it has changeling." | $0.79 | Situational, for example copying Etrata or Ramses. |
| **Bloodline Pretender** | {3} | Artifact Creature, Shapeshifter, 2/2 | "Changeling. As Bloodline Pretender enters the battlefield, choose a creature type. Whenever another creature of the chosen type enters the battlefield under your control, put a +1/+1 counter on Bloodline Pretender." | $3.49–3.99 | Weak here. |
| **Amorphous Axe** | {2} | Artifact, Equipment | "Equipped creature gets +3/+0 and is every creature type. Equip {3}" | $0.35 | Weak. Equip {3} is expensive. On an X/1 it keeps Tetsuko unblockability, and it can make a face-down creature an Assassin. |
| **Maskwood Nexus** | {4} | Artifact | "Creatures you control are every creature type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield. {3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling." | $1.99 | Backup for Leyline: makes face-down creatures and animated lands Assassins. |
| **Nameless Inversion** | {1}{B} | Kindred Instant, Shapeshifter | "Changeling. Target creature gets +3/-3 and loses all creature types until end of turn." | $0.35 | Removal only. Not a creature, so no tribal value. |
| **Brotherhood Regalia** | {2} | Artifact, Equipment | "Equipped creature has ward {2}, is an Assassin in addition to its other types, and can't be blocked. Equip legendary creature {1}. Equip {3}" | $15.99 (ACR) | **Strong.** Etrata becomes unblockable for {1}, and it can turn any face-down 2/2 into an unblockable Assassin. |
| **Roaming Throne** | {4} | Artifact Creature, Golem, 4/4 | "Ward {2}. As Roaming Throne enters the battlefield, choose a creature type. Roaming Throne is the chosen type in addition to its other types. If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time." | $57.99–59.99 | **Strong but expensive.** Naming Assassin makes it an Assassin itself, doubles every Etrata cloak trigger (and Ramses/Mari triggers), and gives you a 4/4 ward blocker. Commander Spellbook lists Etrata, the Silencer + Roaming Throne + Strionic Resonator as a win combo. |

## 2. Creature lands and colorless utility lands

| Card | Oracle text (per source) | Price | Notes |
|---|---|---|---|
| **Mutavault** | "{T}: Add {C}. {1}: Mutavault becomes a 2/2 creature with all creature types until end of turn. It's still a land." (MTG API) | CK $6.49 (CLB), $7.99 (M14), $14.99 (MOR). MTGGoldfish $7.20 (https://www.mtggoldfish.com/price/Morningtide/Mutavault) | **Best pick.** When animated it is an Assassin (and a Vampire), so it triggers Etrata, Ramses and Mari, and it blocks for {1} without taking a spell slot. Gotchas: it is a 2/2, so Tetsuko does not apply (use Rogue's Passage); it has summoning sickness the turn you play it; it uses colorless mana. |
| **Mishra's Factory** | "{T}: Add {C}. {1}: Mishra's Factory becomes a 2/2 Assembly-Worker artifact creature until end of turn. It's still a land. {T}: Target Assembly-Worker creature gets +1/+1 until end of turn." | $0.35 | A blocker for {1}. It is an Assassin only with Leyline or Maskwood. |
| **Blinkmoth Nexus** | "{T}: Add {C}. {1}: This land becomes a 1/1 Blinkmoth artifact creature with flying until end of turn. It's still a land. {1}, {T}: Target Blinkmoth gets +1/+1 until end of turn." | $2.29 (2XM) | A 1/1 flyer, so Tetsuko makes it unblockable. With Leyline it is an unblockable Assassin land. |
| **Creeping Tar Pit** | "Creeping Tar Pit enters the battlefield tapped. {T}: Add {U} or {B}. {1}{U}{B}: Creeping Tar Pit becomes a 3/2 blue and black Elemental creature until end of turn and can't be blocked this turn. It's still a land." | $0.59 | Good. Unblockable on its own, and an Assassin with Leyline. It is a dual land, so it costs you almost nothing. |
| **Restless Reef** | "...enters tapped. {T}: Add {U} or {B}. {2}{U}{B}: Until end of turn, Restless Reef becomes a 4/4 blue and black Shark creature with deathtouch. It's still a land. Whenever Restless Reef attacks, target player mills four cards." | $3.99 | Medium. It costs the same {2}{U}{B} as a flip, so the two compete for mana. Still a strong blocker. |
| **Hall of Storm Giants** | "If you control two or more lands, ... enters tapped. {T}: Add {U}. {5}{U}: ... becomes a 7/7 blue Giant creature with ward {3}." | $0.69 | Too slow. Skip. |
| **Crawling Barrens** | "{T}: Add {C}. {4}: Put two +1/+1 counters on this land. Then you may have it become a 0/0 Elemental creature until end of turn." | $0.49 | Too slow. Skip. |
| **Fountainport** | "{T}: Add {C}. {2}, {T}, Sacrifice a token: Draw a card. {3}, {T}, Pay 1 life: Create a 1/1 blue Fish creature token. {4}, {T}: Create a Treasure token." | $4.99 (BLB) | Good. It makes instant-speed 1/1 blockers. With Leyline the Fish are Assassins, and Tetsuko makes them unblockable. |
| **Secret Tunnel** (Avatar) | "This land can't be blocked. {T}: Add {C}. {4}, {T}: Two target creatures you control that share a creature type can't be blocked this turn." | $3.99 | Good. Makes Etrata and another Assassin unblockable. |
| **Access Tunnel** | "{T}: Add {C}. {3}, {T}: Target creature with power 3 or less can't be blocked this turn." | $0.99 | Good. Covers Etrata and any face-down 2/2. |
| **Hall of the Bandit Lord** | "...enters tapped. {T}, Pay 3 life: Add {C}. If that mana is spent on a creature spell, it gains haste." | $21.99–23.99 | Etrata, or a recast Etrata, with haste connects a full turn earlier. |
| **Command Beacon** | "{T}: Add {C}. {T}, Sacrifice this land: Put your commander into your hand from the command zone." | $12.99 | Helps against commander tax when Etrata keeps getting removed. |
| **Brotherhood Headquarters** | "{T}: Add {C}. {T}: Add one mana of any color. Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source." | $0.59 | Fine for fixing. See gotcha 5 above. |
| **Castle Vantress** | "...enters tapped unless you control an Island. {T}: Add {U}. {2}{U}{U}, {T}: Scry 2." | $0.59 | A free replacement for an Island. |
| **War Room** | "{T}: Add {C}. {3}, {T}, Pay life equal to the number of colors in your commanders' color identity: Draw a card." | $4.49 | OK as card advantage (2 life per card in Dimir). |
| **Spymaster's Vault** | "...enters tapped unless you control a Swamp. {T}: Add {B}. {B}, {T}: Target creature you control connives X, where X is the number of creatures that died this turn." | $2.49 | Marginal. |
| **Three Tree City** | "As Three Tree City enters, choose a creature type. {T}: Add {C}. {2}, {T}: Choose a color. Add an amount of mana of that color equal to the number of creatures you control of the chosen type." | $42.99 | Strong late, but expensive. |
| **Urza's Saga** | "...I: gains '{T}: Add {C}.' II: gains '{2}, {T}: Create a 0/0 colorless Construct artifact creature token...' III: Search your library for an artifact card with mana cost {0} or {1}..." | $44.99–47.99 | Not worth it. The deck has few artifacts and few {0}/{1} artifacts to find. Skip. |
| **Gemstone Caverns** | "If [it] is in your opening hand and you're not the starting player, you may begin the game with [it] on the battlefield with a luck counter on it. If you do, exile a card from your hand. {T}: Add {C}. If [it] has a luck counter on it, instead add one mana of any color." | $79.99+ | Can mean a turn-2 Etrata, but the price is high for what it does. |

## 3. Evasion
| Card | Cost | Oracle text (per source) | Price | Notes |
|---|---|---|---|---|
| **Cryptic Coat** | {2}{U} | "When Cryptic Coat enters the battlefield, cloak the top card of your library, then attach Cryptic Coat to it. Equipped creature gets +1/+0 and can't be blocked. {1}{U}: Return Cryptic Coat to its owner's hand." | $0.49 | **Top pick.** It produces an unblockable body; with Leyline that body is an Assassin, and Etrata can flip it. Rebuying it for {1}{U} cloaks again each time. |
| **Brotherhood Regalia** | {2} | see section 1 | $15.99 | **Top pick.** |
| **Key to the City** | {2} | "{T}, Discard a card: Up to one target creature can't be blocked this turn. Whenever Key to the City becomes untapped, you may pay {2}. If you do, draw a card." | $0.69 | Good. Cheap, and it can be used every turn. |
| **Whispersilk Cloak** | {3} | "Equipped creature can't be blocked and has shroud. Equip {2}" | $3.49 | Fine, but Regalia does the job better. |
| **Psychic Frog** | {U}{B} | "Whenever Psychic Frog deals combat damage to a player or planeswalker, draw a card. Discard a card: Put a +1/+1 counter on Psychic Frog. Exile three cards from your graveyard: Psychic Frog gains flying until end of turn." | $7.99 | Strong 2-drop: a 1/2 that Tetsuko covers and an Assassin under Leyline. It is not an Assassin on its own, and its counters break Tetsuko. |
| **Distortion Strike** | {U} | "Target creature gets +1/+0 until end of turn and is unblockable this turn. Rebound" | $0.55 | Usable for two turns of connecting. Low card quality. |
| **Jeskai Infiltrator** | {2}{U} | "Jeskai Infiltrator can't be blocked as long as you control no other creatures. When Jeskai Infiltrator deals combat damage to a player, exile it and the top card of your library in a face-down pile, shuffle that pile, then manifest those cards." | $0.49 | **Does not fit.** Your board is never empty. Skip. |
| **Rooftop Bypass** | {1}{U}{B} | "Whenever one or more nontoken creatures you control deal combat damage to a player, create a 1/1 black Assassin creature token with menace." (per CK) | $5.99 | **Strong.** It creates a 1/1 Assassin token each turn; Tetsuko makes it unblockable, so it is another Etrata trigger the next turn. 64% inclusion on EDHREC. |
| **Cover of Darkness** | {1}{B} | "As Cover of Darkness enters the battlefield, choose a creature type. Creatures of the chosen type have fear." | $13.99 | Good if opponents rarely have black or artifact blockers. |

## 4. Combos and odd interactions (EDHREC and Commander Spellbook)
Commander Spellbook's search for "Etrata" returns 12 combos. Almost all of them use **Etrata, the Silencer**, which you already run: when an opponent has three hit counters on their exiled cards, they lose the game. The Dimir ones:
- **Etrata, the Silencer + Strionic Resonator + Lithoform Engine**, listed as "Target opponent loses the game" (905 decks).
  - Strionic Resonator: {2} Artifact, "{2}, {T}: Copy target triggered ability you control. You may choose new targets for the copy." CK $8.99–10.99.
  - Resonator also copies Etrata, Deadly Fugitive's cloak trigger.
- **Etrata, the Silencer + Gogo, Master of Mimicry**, listed as "Target opponent loses the game" (753 decks).
  - Gogo: {2}{U}, Legendary Creature Wizard 2/4, "{X}{X}, {T}: Copy target activated or triggered ability you control X times. You may choose new targets for the copies. This ability can't be copied and X can't be 0." CK $5.99.
  - Gogo can also copy Etrata, Deadly Fugitive's flip ability or cloak trigger.
- **Etrata, the Silencer + Roaming Throne + Strionic Resonator**, listed as "Target opponent loses the game" (643 decks).
- **Etrata + Auton Soldier + Araumi of the Dead Tide** (5 decks), and **Magar + Etrata, Deadly Fugitive + Brass's Bounty**. Both need red or a different commander, so they do not apply here.

Other odd interactions:
- **Omen Hawker** ({U}, 1/1 Octopus Advisor, "{T}: Add {C}{U}. Spend this mana only to activate abilities.", $0.69). Etrata's {2}{U}{B} flip is an activated ability, so Hawker covers half the flip cost.
- Ruthless Ripper and Silumgar Assassin can flip through morph if they get cloaked (interaction 4).

---

## Ranked shortlist: 8 best additions
1. **Mutavault** ($6.49 CK). A land that blocks and is an Assassin (all creature types) when animated, so it triggers Etrata, Ramses and Mari. It costs no spell slot and fixes the blocker problem.
2. **Hired Poisoner** ($0.35). A turn-1 deathtouch Assassin; Tetsuko makes it unblockable and it blocks well. Starts the cloak engine early.
3. **Midnight Assassin** ($0.35). A 3-mana flying deathtouch Vampire Assassin with power 1 (Tetsuko). It attacks and blocks well, and it fits the vampire package.
4. **Rooftop Bypass** ($5.99). Creates a 1/1 menace Assassin token each turn; Tetsuko makes it unblockable, so it is more Etrata triggers.
5. **Brotherhood Regalia** ($15.99). Equips Etrata for {1} (unblockable, ward 2). On a face-down 2/2 it makes the creature an unblockable Assassin.
6. **Cryptic Coat** ($0.49). Repeatable cloaking and an unblockable body; with Leyline the body is an Assassin, and Etrata can flip it.
7. **Roaming Throne** ($57.99). Doubles every cloak trigger, gives a 4/4 ward blocker, and enables the Silencer + Resonator win. Cut first if budget matters.
8. **Hullcarver** ($0.35 CK / $0.23 MTGGoldfish). A second 1-mana deathtouch Assassin for Tetsuko. Its exact mana cost is not confirmed (see section 1).

Alternates, in order:
- Creeping Tar Pit ($0.59)
- Universal Automaton ($0.99)
- Mothdust Changeling ($0.69)
- Assassin Initiate ($0.39)
- Fountainport ($4.99)
- Secret Tunnel ($3.99)
- Hall of the Bandit Lord ($21.99)
- Strionic Resonator ($8.99)
- Black Widow, Deadly Hunter ($1.49)

**Avoid:**
- **Achilles Davenport**: its anthem breaks Tetsuko.
- **Jeskai Infiltrator**: needs an empty board.
- **Urza's Saga**: too few targets.
- **Hall of Storm Giants** and **Crawling Barrens**: too slow.
