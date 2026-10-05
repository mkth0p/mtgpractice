# Etrata, Deadly Fugitive: aggro scaling, cloaks as Assassins, keeping Etrata alive (checked 2026-10-05)

Topic: make "Assassin aggro that scales by stealing" snowball. Each Assassin hit cloaks an opponent's card, the cloaks attack as well, and flips turn them into the opponent's best cards. This file builds on `../../underused-tech/sources/` (assassins-and-lands.md, face-down-cards.md, defense-and-tempo.md). **Cards already covered there are not re-researched.** They appear only as "see earlier file" references: Maskwood Nexus, Amorphous Axe, Brotherhood Regalia, Roaming Throne, Strionic Resonator, Rooftop Bypass, Cover of Darkness, Key to the City, Whispersilk Cloak, Access Tunnel, Secret Tunnel, Swiftfoot Boots, Lightning Greaves, Hall of the Bandit Lord, Command Beacon, Jet/Sapphire Medallion, Slip Out the Back, Cryptic Coat, Ugin's Mastery and the Assassin creature bodies.

The current list is `../../b4-shadow-market/decklist-v2.txt`. It already runs Leyline of Transformation, Roshan, Hidden Magister, Fallen Shinobi, Tetsuko Umezawa, Training Grounds, Mari, Ramses, Etrata the Silencer, Mutavault (v1), Rogue's Passage and Path of Ancestry. Those are marked **[in v2]**.

## Sources and how I checked

- **Rules text and prices:** Card Kingdom search pages, one per card, fetched today: `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=<Card+Name>` (the URL is given per card).
  - The pages were read with WebFetch, which passes them through a summarizer model. I asked it for verbatim text.
  - Card Kingdom shows **printed** wording, so older cards may say "enters the battlefield" or "converted mana cost" where current Oracle says "enters" or "mana value". The rules meaning is the same.
  - Where reminder text looked shortened or merged, I flag it.
- **Prices:** the cheapest NM USD printing listed on that Card Kingdom page. I estimated none of them.
- **Rulings:** api.magicthegathering.io (Gatherer mirror), for example `https://api.magicthegathering.io/v1/cards?name=Maskwood%20Nexus`. Its data stops around early 2024.
- **Extra-combat search:** api.magicthegathering.io text search for "additional combat", filtered by blue, black and artifact.
- **Game Changers:** https://edhrec.com/top/game-changers, fetched today, 53 cards. **No card in this file is a Game Changer.** It is the same list as in defense-and-tempo.md: Rhystic Study, Cyclonic Rift, Demonic Tutor ... Humility.
- **Banned list:** https://magic.wizards.com/en/banned-restricted-list, fetched today. **No card in this file is banned.**
  - That page also bans "cards with the Card Type 'Conspiracy'" and "all cards that introduce stickers or Attractions".
  - The **enchantment named Conspiracy** (Torment) is *not* of card type Conspiracy, so it is legal.
  - Swinging Ship, which grants an extra combat, is an Attraction, so it is banned.
- **Real decks:**
  - EDHREC commander page, 3,272 decks: https://edhrec.com/commanders/etrata-deadly-fugitive
  - EDHREC average deck: https://edhrec.com/average-decks/etrata-deadly-fugitive
  - Archidekt lists:
    - "Cloak & Dagger" by PhyrexianTrophyHusband, about $535: https://archidekt.com/decks/12165446/etrata_deadly_fugitive_cloak_dagger
    - "Thieves and Killers." by razrbck1984: https://www.archidekt.com/decks/6965614/thieves_and_killers
    - "Etrata Cloak" by fell4ever, an incomplete 23-card list: https://archidekt.com/decks/8130209/etrata_cloak
- **Failed lookups:**
  - Moxfield pages render only with JavaScript, and api2.moxfield.com is blocked by robots.txt. That included the "Fugitives (Best Bracket 4 Assassin Snowball)" primer at https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer, so I did not read it.
  - Scryfall returned 403 or a permission timeout.
  - edh.fandom.com returned 402, and draftsim and mtgdecks timed out or returned 403.
  - Direct curl from the container is blocked by the proxy.

---

## Rules that apply to the whole file

1. **How face-down creatures get a creature type (layers).**
   - A face-down permanent's characteristics are set in layer 1: a 2/2 creature with no name, no text, no subtypes and no mana cost.
   - Type-changing effects apply later, in layer 4. So Leyline of Transformation, Arcane Adaptation, Roshan, Conspiracy, Xenograft, Maskwood Nexus, Brotherhood Regalia and Amorphous Axe all make a cloak an Assassin, and Etrata's trigger then counts it.
   - Making the cloak an Assassin does not turn it face up and reveals nothing.
   - The Arcane Adaptation and Maskwood Nexus rulings (API, 2017-09-29 and 2021-02-05) confirm the order for cards entering: "Replacement effects that modify creatures of a certain type as they enter the battlefield will apply after you apply Arcane Adaptation's effect."
2. **"Creature cards you own that aren't on the battlefield" does not matter for stolen cards on the battlefield.** Those cards are covered by the "Creatures you control" clause, which goes by control, not ownership.
   - The ownership clause only covers cards in your hand, library, graveyard, exile and the command zone. That is what makes Herald's Horn reveals and Path of Ancestry scry work.
   - It also makes Etrata herself an Assassin in the command zone. She already is one.
   - **Where ownership does bite:**
     - A stolen cloak that dies goes to the **owner's** graveyard. Back in Town and Jacob Frye only reach *your* graveyard, so they can't get it back.
     - Supernatural Stamina, Undying Malice and Essence Flux return a card "under its owner's control", which hands a stolen cloak back face up.
     - Ninjutsu, Fading Hope and Snap on a cloak send it to the **opponent's** hand.
   - A stolen card you cast through Etrata's "if you can't, exile it, then cast" clause is a "creature spell you control" while on the stack, so Leyline and Roshan make it an Assassin spell. That matters for Double Down, Door of Destinies and Herald's Horn.
     - Creature cards normally *can* turn face up, though, so Etrata casts mainly instants and sorceries.
3. **Conspiracy and Unnatural Selection *set* types; the others *add* them.**
   - Conspiracy naming Assassin makes Etrata *only* an Assassin, so she stops being a Vampire, and so does every changeling.
   - Every vampire-matters card in the drain package that checks the Vampire type stops working. That covers Vito's Vampire text, Bloodline Keeper and Kalitas sacrifices. Check the list before running it.
   - Leyline, Arcane Adaptation, Roshan and Xenograft add types and keep the old ones.
4. **Anthems turn off Tetsuko.**
   - Tetsuko's text is "Creatures you control with power or toughness 1 or less can't be blocked."
   - Any +1/+1 effect (Coat of Arms, Door of Destinies, Vanquisher's Banner, Patchwork Banner, Silver-Fur Master, Assassin Gauntlet, Shadowspear, Achilles Davenport) pushes 1/1 Assassins and Etrata (1/4 becomes 2/5) out of Tetsuko range.
   - Tetsuko herself is a Human Rogue 1/3. Silver-Fur Master pumps Rogues, so Tetsuko becomes 2/4 and loses her *own* evasion.
   - **Power-only boosts keep X/1 creatures unblockable** because toughness stays 1: Hidden Blade, Amorphous Axe, Cryptic Coat. On Etrata (1/4) they don't, because her power goes up and her toughness is 4.
   - Cloaks are 2/2 and were never Tetsuko-evasive, so anthems only help them. **An anthem plan needs mass evasion that doesn't care about size:** Levitation, Archetype of Imagination, Rogue Class level 2, Roshan's face-down menace, or Cover of Darkness.
5. **There are no extra combats in UB or colorless.**
   - The API search found only red, white or green cards, plus **Illusionist's Gambit**. Gambit is blue but works only on an opponent's turn and redirects *their* attackers, so it is not an extra combat for you.
   - Swinging Ship is an Attraction, so it is banned.
   - The API stops at early 2024, and a web search found no 2024–2026 UB extra-combat card. That is an absence in my search, not proof.
   - **The UB substitutes for "more combat damage events" are more attackers (tokens, cloaks), trigger copiers (Roaming Throne, Strionic Resonator) and Etrata, the Silencer-style extra triggers.**
6. **Commander tax and bouncing.** The tax counts only casts **from the command zone**.
   - If Etrata is returned to hand (Fading Hope, Snap, or ninjutsu with her as the returned attacker), keep her in hand and recast her from there. She costs {1}{U}{B} with no new tax.
   - Bounce in response to removal is UB's best answer to the "~1.2 removals per game" problem.

---

## Part 1: making cloaks Assassins

| Card | Cost / type | Oracle text (Card Kingdom, verbatim as returned) | Cheapest NM | Verdict / gotchas |
|---|---|---|---|---|
| **Leyline of Transformation** [in v2] | {2}{U}{U} Enchantment | "If Leyline of Transformation is in your opening hand, you may begin the game with it on the battlefield. As Leyline of Transformation enters, choose a creature type. Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield." | $0.69 DSK, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Leyline+of+Transformation) | **Core.** Adds Assassin to every cloak, token, animated land and Ninja. When it's in your opening hand it costs 0 mana. Keep it. |
| **Arcane Adaptation** | {2}{U} Enchantment | "As Arcane Adaptation enters the battlefield, choose a creature type. Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield." | $4.99 XLN, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Arcane+Adaptation) | **Best add in this section.** A 3-mana Leyline: the same text without the opening-hand clause. 46% of EDHREC Etrata decks run it. Run both, so the cloak engine isn't one removal away from doing nothing. |
| **Roshan, Hidden Magister** [in v2] | {3}{B} Legendary Creature — Human Assassin 4/4 | "Other creatures you control are Assassins in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield. Face-down creatures you control have menace. Whenever a permanent you control is turned face up, you draw a card and you lose 1 life." | $0.35 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Roshan%2C+Hidden+Magister) | **Core, and #1 on EDHREC (89%).** One card does three jobs: makes cloaks Assassins, gives them menace, and draws on every flip. It's a creature, so it dies to sweepers; keep an enchantment backup. |
| **Conspiracy** (Torment enchantment, **legal**) | {3}{B}{B} Enchantment | "As Conspiracy enters the battlefield, choose a creature type. Creatures you control are the chosen type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield." | $0.69 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Conspiracy) | **Worse than Arcane Adaptation here.** It sets types (rule 3), so Etrata and the vampire package lose Vampire. It costs 5. Only run it if you've cut the vampire cards. |
| **Xenograft** | {4}{U} Enchantment | "As Xenograft enters the battlefield, choose a creature type. Each creature you control is the chosen type in addition to its other types." | $0.99 NPH, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Xenograft) | Battlefield only, and it costs 5. Fourth choice after Leyline, Adaptation and Roshan. Skip. |
| **Amoeboid Changeling** | {1}{U} Creature — Shapeshifter 1/1 | "Changeling (This card is every creature type at all times.) {T}: Target creature gains all creature types until end of turn. {T}: Target creature loses all creature types until end of turn." | $0.79 J22 List, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Amoeboid+Changeling) | **Sneaky good.** Tap it after blockers are declared (instant speed) to make one unblocked cloak an Assassin before damage. It's an Assassin 1/1 itself, so Tetsuko makes it unblockable, but then it isn't tapping for the ability. One creature per turn. It can also strip types from an opponent's lord in response. |
| **Unnatural Selection** | {1}{U} Enchantment | "{1}: Choose a creature type other than Wall. Target creature becomes that type until end of turn." | $0.49 MB2, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Unnatural+Selection) | Repeatable at instant speed, {1} per creature. It sets the type, which doesn't matter on a typeless cloak. It's a mana sink when you're flooding. Medium. Leyline and Adaptation are strictly smoother. |
| **Imagecrafter** | {U} Creature — Human Wizard 1/1 | "{T}: Choose a creature type other than Wall. Target creature becomes that type until end of turn." | $0.35 ONS, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Imagecrafter) | A 1-mana Amoeboid with summoning sickness and no changeling, so it isn't an Assassin itself. Weak. |
| **Adrestia** | {3} Legendary Artifact — Vehicle 4/3 | "Islandwalk. Whenever Adrestia attacks, if an Assassin crewed it this turn, draw a card. Adrestia becomes an Assassin in addition to its other types until end of turn. Crew 1" | $0.59 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Adrestia) | A 4-power Assassin that dodges sorcery-speed wraths. Crew it with a cloak (with Leyline, the cloak is an Assassin). It draws and cloaks. 20% on EDHREC. Okay. Note: CK's text may be missing a "then" clause; Oracle not cross-checked. |
| Maskwood Nexus, Amorphous Axe, Brotherhood Regalia | — | see assassins-and-lands.md | $1.99 / $0.35 / $15.99 | Regalia is the best equipment: unblockable plus Assassin plus ward {2} on a cloak, and it equips Etrata for {1}. Maskwood makes everything **every** type, which turns on Ninja payoffs too (Yuriko, Ingenious Infiltrator). |

**Ranking for this job:** Leyline [in] = Roshan [in] > **Arcane Adaptation** > Brotherhood Regalia > Maskwood Nexus > Amoeboid Changeling > Unnatural Selection > Conspiracy > Xenograft.

---

## Part 2: snowball and anthem engines for many small evasive attackers

### 2a. Bodies and tokens

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Bitterblossom** | {1}{B} Kindred Enchantment — Faerie | "At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying." | $32.99 2X2, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Bitterblossom) | **Strong with Roshan or Leyline.** Each token is a flying 1/1 Assassin that Tetsuko makes unblockable, so you get one more cloak every turn from turn 3. It's a Rogue, so Silver-Fur Master and Prosperous Thief count it too. The life loss is fine in aggro. Expensive. |
| **Satoru, the Infiltrator** | {U}{B} Legendary Creature — Human Ninja Rogue 2/3 | "Menace. Whenever Satoru, the Infiltrator and/or one or more other nontoken creatures enter the battlefield under your control, if none of them were cast or no mana was spent to cast them, draw a card." | $1.99 OTJ, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Satoru%2C+the+Infiltrator) | **Excellent.** Cloaks are nontoken creatures that enter without being cast, so it **draws a card per cloak event**. Ninjutsu also enters without casting. 2 mana, with menace. 40% on EDHREC. |
| **Primordial Mist** | {4}{U} Enchantment | "At the beginning of your end step, you may manifest the top card of your library. ... Exile a face-down permanent you control face up: You may play that card this turn. (You still pay its costs. Timing rules still apply.)" | $0.49 DSC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Primordial+Mist) | **Theft synergy.** Its second ability works on **any** face-down permanent, including stolen cloaks. A cloaked opponent **land** can be played as your land drop. A cheap artifact or enchantment can be cast instead of paying Etrata's {2}{U}{B} flip, because "play that card" lets you cast an opponent-owned card. It also adds a body each turn. 38% on EDHREC. |
| **They Came from the Pipes** | {4}{U} Enchantment | "When They Came from the Pipes enters, manifest dread twice. ... Whenever a face-down creature you control enters, draw a card." | $0.69 DSC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=They+Came+from+the+Pipes) | Two bodies, then **a card per cloak**. 58% on EDHREC (85x synergy). Strong, but 5 mana competes with Primordial Mist and Kindred Discovery. Pick one or two of the three. |
| **Kaito, Cunning Infiltrator** | {1}{U}{U} Legendary Planeswalker — Kaito, loyalty 3 | "Whenever a creature you control deals combat damage to a player, put a loyalty counter on Kaito. [+1]: Up to one target creature you control can't be blocked this turn. Draw a card, then discard a card. [-2]: Create a 2/1 blue Ninja creature token. [-9]: You get an emblem with 'Whenever a player casts a spell, you create a 2/1 blue Ninja creature token.'" | $2.99 FDN, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Kaito%2C+Cunning+Infiltrator) | Good. +1 makes Etrata or a cloak unblockable each turn and loots. The 2/1 Ninjas have toughness 1, so Tetsuko applies, and with Roshan or Leyline they are Assassins. Grows from each hit. |
| **Become Anonymous** | {2}{U}{U} Instant | "Exile target nontoken creature you own and the top two cards of your library in a face-down pile, shuffle that pile, then cloak those cards. They enter the battlefield tapped. ..." | $0.49 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Become+Anonymous) | An instant answer to removal on Etrata: she becomes one of 3 cloaks. That's 3 bodies, and Satoru or Pipes draw 1 each. **Gotchas:** "you own", so it can't target stolen cloaks. If you use it to dodge removal on Etrata, **she becomes a face-down 2/2 with no abilities**, so your other face-down creatures lose the flip ability until she is face up again. You may look at face-down permanents you control, so you know which one she is, and the cloak rules let you turn her face up for her mana cost, {1}{U}{B}. 42% on EDHREC. Medium. |
| **Thrill-Kill Assassin** | {1}{B} Creature — Human Assassin 1/2 | "Deathtouch. Unleash (You may have this creature enter the battlefield with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)" | $0.35 RTR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thrill-Kill+Assassin) | A 2-mana Assassin. Without unleash it's a 1/2 that Tetsuko covers and a deathtouch blocker. Filler, but on-plan. 23% on EDHREC. |
| **Evie Frye** | {1}{U} Legendary Creature — Human Assassin 2/1 | (CK text, partner reminder merged) "Partner with Jacob Frye {1}, {T}: Draw a card, then discard a card. When you discard a creature card this way, target creature you control can't be blocked this turn." | $0.59 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Evie+Frye) | A 2-drop Assassin. Toughness 1, so Tetsuko applies. Also a looter that can make Etrata unblockable. "Partner with" also tutors Jacob when she enters. Good. |
| **Jacob Frye** | {2}{B} Legendary Creature — Human Assassin 3/2 | "Partner with Evie Frye. Whenever one or more Assassins you control deal combat damage to a player, exile up to one target Assassin card or card with freerunning from your graveyard. If you do, copy it. You may cast the copy." | $0.49 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Jacob+Frye) | Recasts dead Assassins as copies. **With Leyline or Roshan, every creature card you own in your graveyard is an Assassin card** (the "cards you own that aren't on the battlefield" clause), so Jacob recasts any of your dead creatures. Stolen ones go to their owner's graveyard, so not those. Good. |
| **Unstoppable Slasher** | {2}{B} Creature — Zombie Assassin 2/3 | "Deathtouch. Whenever Unstoppable Slasher deals combat damage to a player, they lose half their life, rounded up. When Unstoppable Slasher dies, if it had no counters on it, return it to the battlefield tapped under its owner's control with two stun counters on it." | $5.99 DSK (Lurking Evil), [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Unstoppable+Slasher) | The closer: each hit halves a life total, and it's an Assassin. It is 2/3, so it needs Regalia, Kaito, Access Tunnel or Rogue's Passage to connect. 47% on EDHREC. Strong. |
| **Raven Eagle** (Avatar) | {2}{B} Creature — Bird Assassin 2/3 | "Flying. Whenever this creature enters or attacks, exile up to one target card from a graveyard. If a creature card is exiled this way, create a Clue token. ... Whenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life." | $0.49 TLA, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Raven+Eagle) | A flying 3-drop Assassin with graveyard hate. Its drain-on-second-draw lifegain triggers Blight-Priest. Solid filler. |

### 2b. Anthems and cost reducers (watch Tetsuko)

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Herald's Horn** | {3} Artifact | "As this artifact enters, choose a creature type. Creature spells you cast of the chosen type cost {1} less to cast. At the beginning of your upkeep, look at the top card of your library. If it's a creature card of the chosen type, you may reveal it and put it into your hand." | $4.49 FDC / Marvel, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Herald%27s+Horn) | **Good, no anthem.** Etrata is an Assassin, so **each recast after removal costs 1 less**. With Leyline or Roshan, *every* creature card in your library counts, so the upkeep reveal hits any creature. It doesn't touch Tetsuko. |
| **Urza's Incubator** | {3} Artifact | "As Urza's Incubator enters the battlefield, choose a creature type. Creature spells of the chosen type cost {2} less to cast." | $22.99 C15, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Urza%27s+Incubator) | It reduces only generic mana. Etrata goes from {1}{U}{B} to {U}{B}, and **each tax step is cut by 2** ({3}{U}{B} becomes {1}{U}{B}). It is **symmetric** ("Creature spells", not "you cast"), so opponents playing Assassins benefit too, which is rare. Strong for recasts, but $23. |
| **Door of Destinies** | {4} Artifact | "As this artifact enters, choose a creature type. Whenever you cast a spell of the chosen type, put a charge counter on this artifact. Creatures you control of the chosen type get +1/+1 for each charge counter on this artifact." | $2.99 Marvel, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Door+of+Destinies) | With Leyline or Roshan, every creature spell counts. It grows the cloaks, but the first counter **turns off Tetsuko**. Cloaks enter without being cast, so they add no counters. Medium, and anti-synergy with Tetsuko. |
| **Vanquisher's Banner** | {5} Artifact | "As Vanquisher's Banner enters the battlefield, choose a creature type. Creatures you control of the chosen type get +1/+1. Whenever you cast a creature spell of the chosen type, draw a card." | $6.99 FDC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Vanquisher%27s+Banner) | 5 mana, its anthem breaks Tetsuko, and cloaks aren't cast. Weak for this plan. |
| **Patchwork Banner** | {3} Artifact | "As Patchwork Banner enters, choose a creature type. Creatures you control of the chosen type get +1/+1. {T}: Add one mana of any color." | $3.49 Marvel, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Patchwork+Banner) | A mana rock plus anthem. Good **if you drop Tetsuko**; otherwise the anthem costs you more than it gives. Running it with Tetsuko means naming a type you don't play, at which point it's just a 3-mana rock. Cloaks become 3/3 with Leyline. |
| **Coat of Arms** | {5} Artifact | "Each creature gets +1/+1 for each other creature on the battlefield that shares at least one creature type with it." | $13.99 SLD, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Coat+of+Arms) | **Symmetric trap.** With Leyline, 6 cloaks and Assassins become 7/7s, but opponents' token swarms (all Soldiers, all Zombies) pump too. **With Maskwood, your creatures are every type, so every opponent creature also gets +1 for each of yours.** And Tetsuko is gone. Avoid. |
| **Silver-Fur Master** | {U}{B} Creature — Rat Ninja 2/2 | "Ninjutsu {U}{B} ... Ninjutsu abilities you activate cost {1} less to activate. Other Ninja and Rogue creatures you control get +1/+1." | $0.39 NEO, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Silver-Fur+Master) | **Pumps Tetsuko (a Human Rogue), so she loses her own unblockability.** It doesn't pump Assassins. Skip unless you go heavy on Ninjas. |
| **Heartstone** | {3} Artifact | "Activated abilities of creatures cost {1} less to activate. This effect can't reduce the mana in that cost to less than one mana." | $2.49 List, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Heartstone) | Etrata's flip is an activated ability *of the face-down creature*, so it costs {1}{U}{B}. **Redundant with Training Grounds** [in v2]. Grounds already cuts the flip to {U}{B}, and Heartstone only reduces generic mana. Symmetric too. Skip while Grounds is in. |
| **Discreet Retreat** | {3}{B} Enchantment — Aura | "Enchant land. Enchanted land has '{T}: Add two mana of any one color. Spend this mana only to cast outlaw spells or activate abilities from outlaw sources.' (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws.) Whenever you cast your first outlaw spell each turn, you draw a card and you lose 1 life." | $0.49 OTC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Discreet+Retreat) | With Leyline or Roshan, cloaks are Assassins (outlaws), so the 2 mana **pays for Etrata flips**. It draws on your first Assassin spell each turn. 4 mana on an Aura over a land is fragile. Medium. |
| **Double Down** | {3}{U} Enchantment | "Whenever you cast an outlaw spell, copy that spell. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws. Copies of permanent spells become tokens.)" | $1.49 OTJ, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Double+Down) | With Leyline or Roshan, every creature spell is an outlaw, so you get a token copy each time. Etrata's copy runs into the legend rule, so keep one. 29% on EDHREC. Cloaks are not cast. It's value, not snowball. Medium. |

### 2c. Card draw and treasure on combat damage

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Kindred Discovery** | {3}{U}{U} Enchantment | "As Kindred Discovery enters the battlefield, choose a creature type. Whenever a creature you control of the chosen type enters the battlefield or attacks, draw a card." | $7.49 Marvel, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Kindred+Discovery) | **Very strong with Leyline or Roshan.** A cloak enters as an Assassin because the type effect applies immediately, so you draw. Each attacking Assassin draws too. With 5 attackers, that's 5 cards a turn. 21% on EDHREC. **Top pick.** |
| **Ezio, Blade of Vengeance** | {3}{U}{B} Legendary Creature — Human Assassin 5/5 | "Deathtouch. Whenever an Assassin you control deals combat damage to a player, draw a card." | $12.99 ACR Starter Kit foil (the only printing CK lists; the MTGGoldfish page had no price), [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ezio%2C+Blade+of+Vengeance) | Every Etrata trigger also draws. A 5/5 deathtouch body. 54% on EDHREC. Good, but 5 mana. |
| **Bident of Thassa** | {2}{U}{U} Legendary Enchantment Artifact | "Whenever a creature you control deals combat damage to a player, you may draw a card. {1}{U}, {T}: Creatures your opponents control attack this turn if able." | $0.49 several Commander decks, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Bident+of+Thassa) | Good. One card per connecting creature. The forced-attack mode throws enemy creatures into your deathtouch blockers and opens them up for your swing back. 41% on EDHREC. |
| **Coastal Piracy** | {2}{U}{U} Enchantment | "Whenever a creature you control deals combat damage to an opponent, you may draw a card." | $0.99 List, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Coastal+Piracy) | A Bident copy without the forced-attack mode. Run it as the second copy. |
| **Reconnaissance Mission** | {2}{U}{U} Enchantment | "Whenever a creature you control deals combat damage to a player, you may draw a card. Cycling {2} ..." | $0.69 Marvel, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Reconnaissance+Mission) | The same, but it cycles when you're behind. 31% on EDHREC. The third copy. |
| **Mask of Riddles** | {U}{B} Artifact — Equipment | "Equipped creature has fear. Whenever equipped creature deals combat damage to a player, you may draw a card. Equip {2}" | $0.99 ARB, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Mask+of+Riddles) | Fear and a card, with no P/T change, so Tetsuko-safe. Equip {2} is fine. Filler. |
| **Grim Hireling** | {3}{B} Creature — Tiefling Rogue 3/2 | "Whenever one or more creatures you control deal combat damage to a player, create two Treasure tokens. {B}, Sacrifice X Treasures: Target creature gets -X/-X until end of turn. Activate only as a sorcery." | $14.99 AFC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Grim+Hireling) | **Pays for flips.** 2 Treasures a turn is half of a {2}{U}{B} flip, and the Treasures also work as removal. A Rogue, so an outlaw. Good. |
| **Prosperous Thief** | {2}{U} Creature — Human Ninja 3/2 | "Ninjutsu {1}{U} ... Whenever one or more Ninja or Rogue creatures you control deal combat damage to a player, create a Treasure token." | $0.69 NEO, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Prosperous+Thief) | Tetsuko, Bitterblossom tokens and Satoru the Infiltrator are Rogues or Ninjas. With Maskwood everything counts. Cheap. Medium. |
| **Rogue Class** | {U}{B} Enchantment — Class | "Whenever a creature you control deals combat damage to a player, exile the top card of that player's library face down. You may look at it for as long as it remains exiled. {1}{U}{B}: Level 2 — Creatures you control have menace. {2}{U}{B}: Level 3 — You may play cards exiled with Rogue Class, and you may spend mana as though it were mana of any color to cast those spells." | $2.49 AFR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Rogue+Class) | **On-theme theft plus team menace**, which doesn't break Tetsuko. **Trigger order:** both are your triggers on the same hit. Put Rogue Class on the stack last so it resolves first and exiles the top card; Etrata then cloaks the next one. Or order them the other way to cloak the known top card. 18% on EDHREC. Strong. |
| **Eagle Vision** | {4}{U} Sorcery | "Freerunning {1}{U} (You may cast a spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.) Draw three cards." | $0.59 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Eagle+Vision) | Draw 3 for 2 mana after any Assassin hit. 53% on EDHREC. Good. |
| **Escape Detection** | {1}{U}{U} Instant | "Freerunning—Return a blue creature you control to its owner's hand. ... Return target creature to its owner's hand. Draw a card." | $0.35 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Escape+Detection) | Tempo bounce that can **save Etrata** by returning her to your hand, where she recasts with no new tax. Filler. |

### 2d. Mass evasion that doesn't care about size

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Levitation** | {2}{U}{U} Enchantment | "Creatures you control have flying." | $0.35 M12, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Levitation) | Every cloak flies, and it pairs with anthems. Cheap. Good. |
| **Archetype of Imagination** | {4}{U}{U} Enchantment Creature — Human Wizard 3/2 | "Creatures you control have flying. Creatures your opponents control lose flying and can't have or gain flying." | $0.79 C18, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Archetype+of+Imagination) | **Near-unblockable team** (only reach creatures block). A finisher-turn card. 6 mana. |
| **Aqueous Form** | {U} Enchantment — Aura | "Enchant creature. Enchanted creature can't be blocked. Whenever enchanted creature attacks, scry 1." | $0.59 THS, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Aqueous+Form) | A 1-mana unblockable for Etrata or Unstoppable Slasher, with no P/T change. Aura risk. Good. |
| **Assassin Gauntlet** | {2}{U} Artifact — Equipment | "When Assassin Gauntlet enters the battlefield, attach it to up to one target creature you control. Tap all creatures target opponent controls. Equipped creature gets +1/+1 and has 'Whenever this creature deals combat damage to a player, draw a card, then discard a card.' Equip {2}" | $0.35 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Assassin+Gauntlet) | An alpha-strike enabler: tap one opponent's whole board, then swing with every cloak. +1/+1 breaks Tetsuko on whatever it equips, so put it on a cloak. Good. |
| **Hidden Blade** | {2} Artifact — Equipment | "Flash. When Hidden Blade enters the battlefield, attach it to target creature you control. If that creature is an Assassin, it gains deathtouch until end of turn. Equipped creature gets +1/+0 and has first strike. Equip {2}" | $0.49 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Hidden+Blade) | A flash combat trick. Power-only, so it keeps X/1 creatures under Tetsuko. Low impact. |
| **Killer's Mask** | {2}{B} Artifact — Equipment | "When Killer's Mask enters, manifest dread, then attach Killer's Mask to that creature. Equipped creature has menace. Equip {2}" | $0.35 DSK, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Killer%27s+Mask) | The black Cryptic Coat: a face-down body with menace. With Leyline that's a menace Assassin. Fine. |
| **Shadowspear** | {1} Legendary Artifact — Equipment | "Equipped creature gets +1/+1 and has trample and lifelink. {1}: Permanents your opponents control lose hexproof and indestructible until end of turn. Equip {2}" | $29.99 TMNT Source Material (Donnie's Bo), [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Shadowspear) | Lifelink on an attacker **starts the Blight-Priest drain loop** in your deck. +1/+1 breaks Tetsuko. Mostly a combo enabler; expensive. Medium. |

### 2e. Ninjutsu (Dimir's version of extra combat value)

**General gotchas:**
- **Never ninjutsu back a cloak.** It's opponent-owned, so it goes to *their* hand.
- Returning **Etrata** is a legal trick: she goes to your hand and recasts without tax. But you lose her trigger that combat.
- Ninjas enter **tapped and attacking**, so they skip the declare-attackers step. They still deal combat damage, and with Leyline or Roshan they are Assassins, so they trigger Etrata.

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Fallen Shinobi** [in v2] | {3}{U}{B} Creature — Zombie Ninja 5/4 | "Ninjutsu {2}{U}{B} ... Whenever Fallen Shinobi deals combat damage to a player, that player exiles the top two cards of their library. Until end of turn, you may play those cards without paying their mana costs." | $7.99 MH1, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Fallen+Shinobi) | Pure theft. Keep it. **Order:** if the Shinobi is an Assassin (with Leyline), resolve Etrata's cloak first, then the Shinobi exiles the next two, or the reverse. You see nothing before choosing, so it's a coin flip. |
| **Ingenious Infiltrator** | {2}{U}{B} Creature — Vedalken Ninja 2/3 | "Ninjutsu {U}{B} ... Whenever a Ninja you control deals combat damage to a player, draw a card." | $1.99 MH1, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ingenious+Infiltrator) | Only Ninjas count. With **Maskwood Nexus**, every creature is a Ninja *and* an Assassin, so it becomes Ezio for 4. Medium without Maskwood. |
| **Yuriko, the Tiger's Shadow** (in the 99) | {1}{U}{B} Legendary Creature — Human Ninja 1/3 | "Commander ninjutsu {U}{B} (... from your hand or the command zone ...) Whenever a Ninja you control deals combat damage to a player, reveal the top card of your library and put that card into your hand. Each opponent loses life equal to that card's converted mana cost." | $3.49 CMM, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Yuriko%2C+the+Tiger%27s+Shadow) | It isn't a Game Changer (removed Oct 2025). Power 1, so Tetsuko applies. Needs Maskwood to count cloaks as Ninjas. Medium. |
| **Satoru Umezawa** | {1}{U}{B} Legendary Creature — Human Ninja 2/4 | "Whenever you activate a ninjutsu ability, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. This ability triggers only once each turn. Each creature card in your hand has ninjutsu {2}{U}{B}." | $0.79 NEO, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Satoru+Umezawa) | Gives **Etrata in your hand** ninjutsu: after a bounce, she comes back in mid-combat, already attacking, and her own hit cloaks. Every big creature gets the same treatment. Interesting, but needs a Ninja density the deck doesn't have. |
| **Thousand-Faced Shadow** | {2}{U}{U} Creature — Human Ninja 1/1 | "Ninjutsu {2}{U}{U} ... Flying. When Thousand-Faced Shadow enters the battlefield from your hand, if it's attacking, create a token that's a copy of another target attacking creature. The token enters the battlefield tapped and attacking." | $2.29 NEO, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thousand-Faced+Shadow) | Copy a flipped stolen creature or an Assassin. **Copying a face-down cloak gives a featureless 2/2 token that can't be turned face up**, so don't. Medium. |

---

## Part 3: keeping Etrata alive and making her matter early

| Card | Cost / type | Oracle text | Cheapest NM | Verdict |
|---|---|---|---|---|
| **Winged Boots** | {1}{U} Artifact — Equipment | "Equipped creature has flying and ward {4}. (...) Equip {1}" | $10.99 AFC/OTC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Winged+Boots) | **The best UB answer to commander removal.** Ward {4} makes a 2-mana kill spell cost 6. Flying adds evasion, and it changes no P/T, so Tetsuko still works. Equip {1}. Unlike Greaves it gives no shroud, so it doesn't block your own Fading Hope. Note: the CK listing says {1}{U}; I couldn't cross-check Oracle. Wraths still kill her. |
| **Fading Hope** | {U} Instant | "Return target creature to its owner's hand. If its mana value was 3 or less, scry 1." | $0.35 MID, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Fading+Hope) | **1-mana save:** bounce Etrata in response to removal and recast her from hand for {1}{U}{B}, with no new tax. Etrata has MV 3, so you also scry 1. It can also bounce a blocker. Excellent. |
| **Snap** | {1}{U} Instant | "Return target creature to its owner's hand. Untap up to two lands." | $4.39 ULG, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Snap) | Effectively free: it untaps the 2 lands it cost. Same save, and you can recast Etrata the same turn for 3. Good. |
| **Ghostly Flicker** | {2}{U} Instant | "Exile two target artifacts, creatures, and/or lands you control, then return those cards to the battlefield under your control." | $2.79 KHC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ghostly+Flicker) | **Theft bomb plus protection.** Flicker a cloaked opponent card and it returns **face up, under your control, permanently**, with its ETB. "Under your control" overrides ownership. An instant or sorcery card can't enter the battlefield, so it stays in exile; only flicker cloaks you know are permanents (from Rogue Class looks, a Lantern, or a flip you passed on). The other target can be Etrata, dodging removal, but she returns with summoning sickness. 29% on EDHREC. **Top pick.** |
| **Dive Down** | {U} Instant | "Target creature you control gains +0/+3 and gains hexproof until end of turn. ..." | $0.35 XLN, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Dive+Down) | 1-mana hexproof. +0/+3 keeps power 1, so Tetsuko still applies. Simple. Good. |
| **Lazotep Plating** | {1}{U} Instant | "Amass 1. (...) You and permanents you control gain hexproof until end of turn." | $0.69 WAR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Lazotep+Plating) | Protects the whole board, which is better when Roshan, Leyline and Etrata are all targets. The Army token is a Zombie, and an Assassin with Leyline. Good. |
| **March of Swirling Mist** | {X}{U} Instant | "As an additional cost to cast this spell, you may exile any number of blue cards from your hand. This spell costs {2} less to cast for each card exiled this way. Up to X target creatures phase out. ..." | $5.99 NEO, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=March+of+Swirling+Mist) | Can be free by pitching blue cards. It saves Etrata and your cloaks from a wrath, because phased-out cloaks stay face down and stay yours. Good. |
| **Supernatural Stamina** | {B} Instant | "Until end of turn, target creature gets +2/+0 and gains 'When this creature dies, return it to the battlefield tapped under its owner's control.'" | $0.35 2X2/CMM, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Supernatural+Stamina) | Saves Etrata from destroy effects. You must leave her in the graveyard instead of moving her to the command zone; the SBA choice comes before the trigger resolves. **On a cloak it gives the card back to its owner, face up.** Okay. |
| **Undying Malice** | {B} Instant | "Until end of turn, target creature gains 'When this creature dies, return it to the battlefield tapped under its owner's control with a +1/+1 counter on it.'" | $0.79 VOW, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Undying+Malice) | **The counter permanently breaks Tetsuko on Etrata (2/5).** It has the same owner gotcha. Worse than Stamina. |
| **Smoke Bomb** | {3} Artifact | "Flash All creatures have shroud. At the beginning of your upkeep, sacrifice Smoke Bomb. When you do, target creature you control can't be blocked this turn." | $0.69 ACR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Smoke+Bomb) | A one-turn shroud for everyone, then an unblockable attacker. Etrata's flip doesn't target, so it still works. It turns off your own targeted tricks too. Medium. |
| **Mithril Coat** | {3} Legendary Artifact — Equipment | "Flash Indestructible When Mithril Coat enters the battlefield, attach it to target legendary creature you control. Equipped creature has indestructible. Equip {3}" | $34.99 LTR, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Mithril+Coat) | Flash indestructible for Etrata, in response to destroy effects and wraths. It doesn't stop exile or bounce. Expensive. |
| **Tyrite Sanctum** | Land | "{T}: Add {C}. {2}, {T}: Target legendary creature becomes a God in addition to its other types. Put a +1/+1 counter on it. {4}, {T}, Sacrifice Tyrite Sanctum: Put an indestructible counter on target God." | $3.49 DMC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Tyrite+Sanctum) | Uses a land slot to give Etrata indestructible, but the **+1/+1 counter breaks Tetsuko on her**. Okay. |
| **Back in Town** | {X}{2}{B} Sorcery | "Return X target outlaw creature cards from your graveyard to the battlefield. (...)" | $4.49 OTC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Back+in+Town) | Rebuilds after a wrath. With Leyline or Roshan, every creature card you own counts. Stolen cards are in their owners' graveyards, so not those. 32% on EDHREC. Good. |
| **Cavern of Souls** | Land | "As Cavern of Souls enters the battlefield, choose a creature type. {T}: Add {C}. {T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't be countered." | $59.99 UMA/MB, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Cavern+of+Souls) | Makes Etrata uncounterable, which matters against blue tables. Pricey. 17% on EDHREC. |
| **Stolen Identity** | {4}{U}{U} Sorcery | "Create a token that's a copy of target artifact or creature. Cipher (...)" | $0.79 GTC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Stolen+Identity) | Encode it on an unblockable Assassin, and each hit copies the opponent's best creature *and* cloaks. That fits the theft identity. Slow at 6 mana. Medium. |
| **Illusionist's Gambit** | {2}{U}{U} Instant | "Cast Illusionist's Gambit only during the declare blockers step on an opponent's turn. Remove all attacking creatures from combat and untap them. After this phase, there is an additional combat phase. Each of those creatures attacks that combat if able. They can't attack you or a planeswalker you control that combat." | $0.59 BLC, [CK](https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Illusionist%27s+Gambit) | The only blue "additional combat" card the search found, and it's defensive (a Fog plus redirect). Not an extra combat for you. Medium as defense. |

Already covered elsewhere (not re-checked): Swiftfoot Boots $2.31, Lightning Greaves $6.45, Hall of the Bandit Lord $24, Command Beacon $8.55, Jet and Sapphire Medallion $24–27, Brotherhood Regalia $15.99 (ward {2}, equip legendary {1}). Slip Out the Back: avoid, its counter breaks Tetsuko.

**On "make her matter early":**
- The bot finding (never casting her is +1.5 to +4.5 points) says Etrata alone is a 3-mana 1/4 that dies. She matters only when **(a) 2–3 Assassins are already on the board to trigger her the turn she lands, and (b) cloaks become Assassins (Leyline or Adaptation), so each hit makes another trigger source.**
- So the cheapest fix is sequencing, not protection:
  - Deploy 1–2-drop Assassins (Hired Poisoner, Evie, Thrill-Kill) and Leyline or Adaptation first.
  - Cast Etrata on turn 4–5 with 1–2 mana up for Fading Hope or Dive Down, or with Winged Boots already on the board.
- Herald's Horn and Urza's Incubator only matter for recasts.

---

## Ranked top 15 for this plan (adds not already in v2)

1. **Arcane Adaptation** ($4.99). A second "cloaks are Assassins" enchantment at 3 mana, so the engine survives one removal on Leyline or Roshan.
2. **Kindred Discovery** ($7.49, name Assassin). With Leyline or Roshan it draws on every cloak entering *and* every Assassin attacking.
3. **Ghostly Flicker** ($2.79). Permanently steals 2 cloaked permanents face up with their ETBs, or saves Etrata. The deck's best theft-and-protection card.
4. **Satoru, the Infiltrator** ($1.99). A 2-mana menace body that draws whenever cloaks enter (they're never cast).
5. **Winged Boots** ($10.99). Ward {4} plus flying on Etrata for equip {1}, with no P/T change, so it's Tetsuko-safe.
6. **Fading Hope** ($0.35). A 1-mana save. Recast Etrata from hand without new tax.
7. **Rogue Class** ($2.49). A second theft stream plus team menace (Tetsuko-safe). Order its trigger with Etrata's.
8. **Primordial Mist** ($0.49). A body every turn. Exile stolen cloaks to *play* them (lands, cheap permanents) instead of paying {2}{U}{B}.
9. **Bident of Thassa** ($0.49). A card per connecting creature, and it forces opponents' attacks into your deathtouch.
10. **Grim Hireling** ($14.99). 2 Treasures a turn fund flips.
11. **Levitation** ($0.35). A flying team. It's the evasion that lets you add anthems later without needing Tetsuko.
12. **Eagle Vision** ($0.59). Draw 3 for {1}{U} after any Assassin hit.
13. **Assassin Gauntlet** ($0.35). Taps one opponent's whole board for an alpha strike with every cloak.
14. **Herald's Horn** ($4.49, name Assassin). Every Etrata recast costs 1 less. With Leyline or Roshan, it pulls any creature off the top each upkeep.
15. **Bitterblossom** ($32.99). With Roshan or Leyline, a flying 1/1 Assassin every upkeep (Tetsuko-unblockable). The budget cut is Kaito, Cunning Infiltrator ($2.99).

Next in line: They Came from the Pipes, Ezio, Blade of Vengeance, Dive Down, Lazotep Plating, Snap, Evie and Jacob Frye, Unstoppable Slasher, Amoeboid Changeling, Back in Town, March of Swirling Mist, Coastal Piracy.

**Avoid:**
- Coat of Arms: symmetric, and with Maskwood it pumps opponents.
- Silver-Fur Master: pumps Tetsuko out of her own evasion.
- Conspiracy: sets types, so the Vampire package loses its type.
- Undying Malice: its counter breaks Tetsuko on Etrata.
- Heartstone: redundant with Training Grounds.
- Vanquisher's Banner and Door of Destinies: anthems that break Tetsuko for little gain.
- Xenograft and Imagecrafter: worse versions of what you have.

---

## What real Etrata decks do

From the EDHREC page (3,272 decks; theme tags Assassins 399, Theft 224, Morph 221, **Aggro only 49**), the EDHREC average deck, and the Archidekt lists above:

- **Making cloaks Assassins is standard in real decks:** Roshan 89%, Maskwood Nexus 60%, Leyline 55%, Arcane Adaptation 46%, Conspiracy 21%, Xenograft 5.6%. Real decks run 2–3 of these. **v2 runs 2.**
- **Draw engines they run that v2 doesn't:**
  - Eagle Vision 53%, Ezio 54%, Bident 41%, Reconnaissance Mission 31%, Kindred Discovery 21%, Coastal Piracy 18%.
  - Face-down card draw: They Came from the Pipes 58%, Primordial Mist 38%.
  - Satoru, the Infiltrator 40%.
- **Assassin bodies not in the earlier research:**
  - Evie Frye 45% and Jacob Frye 43%
  - Unstoppable Slasher 47%
  - Massacre Girl, Known Killer 47%
  - Thrill-Kill Assassin 23%
  - Raven Eagle 19%
  - Callidus Assassin 19%
  - Scarblade Elite 17%
  - Hookblade Veteran 64%, which the earlier round couldn't verify
- **Protection:** real decks lean on **Lightning Greaves 43%, Swiftfoot Boots 32%, Brotherhood Regalia 31%, Whispersilk 20%, Ghostly Flicker 29%**. The Cloak & Dagger list adds Winged Boots, Smoke Bomb, March of Swirling Mist and Leyline of Anticipation.
- **Spells:**
  - Become Anonymous 42%, Chain Assassination 30%, Restart Sequence 37%, Back in Town 32%
  - Double Down 29%, Cover of Darkness 49%
  - Rogue Class 18%, Coerced to Kill 18%, Ghastly Conscription 30%
- **Evasion lands:** Rogue's Passage 54%, Access Tunnel 46%, Secret Tunnel 19%, Cavern of Souls 17%.
- **What the community mostly does *not* do:**
  - Tetsuko Umezawa is in only 18% of decks.
  - Anthems are rare: Achilles 52% is the only common one, Patchwork Banner 19%, Herald's Horn 9%.
  - Real decks rely on Roshan's menace, Cover of Darkness, Rogue's Passage and Access Tunnel for evasion rather than staying at power 1.
  - That supports choosing **either** Tetsuko-based 1-power evasion **or** an anthem plus mass-evasion package (Levitation, Rogue Class, Cover of Darkness), not both.
- **Theft-specific cards seen in lists:** Thieving Amalgam 47%, Fallen Shinobi [in v2], Rogue Class, Petty Larceny 13%, and Outrageous Robbery and Eriette's Tempting Apple in "Thieves and Killers."
- **Not read:** the Moxfield "Fugitives (Best Bracket 4 Assassin Snowball)" primer exists (https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer), but Moxfield could not be fetched. Worth opening by hand, since it's the closest match to this plan.
