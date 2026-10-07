# Miku commanders — verification, evaluation, shortlist

Pass 1, checked 2026-10-07. Card text here is paraphrased. Replace it with verbatim Oracle text from Scryfall bulk data before the simulator relies on it (DECISIONS.md, D8).

## 1. Every Miku card that can be your commander

The eight in the brief all check out. A ninth exists: Freyalise, Llanowar's Fury, a planeswalker whose Oracle text lets it be a commander.

| SLD # | Oracle name | Miku name | Mana cost | Type line | Identity | Drop |
|---|---|---|---|---|---|---|
| 1586 | Giada, Font of Hope | Miku, Font of Pop | {1}{W} | Legendary Creature — Angel, 2/2 | W | Winter Diva, Feb 2025 |
| 1597 | Azusa, Lost but Seeking | Miku, Lost but Singing | {2}{G} | Legendary Creature — Human Monk, 1/2 | G | Sakura Superstar, May 2024 |
| 1598 | Freyalise, Llanowar's Fury | Miku, Voice of Power | {3}{G}{G} | Legendary Planeswalker — Freyalise (loyalty not re-verified) | G | Electric Entourage, Sep 2024 |
| 1599 | Child of Alara | Miku, Child of Song | {W}{U}{B}{R}{G} | Legendary Creature — Avatar, 6/6 | WUBRG | Digital Sensation, Jun 2024 |
| 1601 | Brago, King Eternal | Miku, Queen Electric | not re-verified | Legendary Creature — Spirit Noble, 2/4 | WU | Winter Diva, Feb 2025 |
| 1602 | Feather, the Redeemed | Miku, the Renowned | {R}{W}{W} | Legendary Creature — Angel (P/T not re-verified) | RW | Sakura Superstar, May 2024 |
| 2429 | Trostani, Selesnya's Voice | Miku, Song of the People | {G}{G}{W}{W} | Legendary Creature — Dryad, 2/5 | GW | Commander Deck: Hatsune Miku, Aug 10 2026 |
| 2433 | Shalai, Voice of Plenty | Miku, Voice Over All | {3}{W} | Legendary Creature — Angel, 3/4 | GW | same deck |
| 2439 | Vorinclex, Voice of Hunger | Miku, the Complete Performer | {6}{G}{G} | Legendary Creature — Phyrexian Praetor, 7/6 | G | same deck |

SLD #2443 is a second "Miku, Song of the People" sold as a display commander and marked not tournament legal. Keep it out of every list and price.

What each one does (paraphrased):

- **Giada:** flying, vigilance. Each other Angel you control enters with an extra +1/+1 counter for each Angel you already control. Taps for {W} that can only be spent on Angel spells.
- **Azusa:** you may play two additional lands on each of your turns.
- **Freyalise:** +2 makes a 1/1 green Elf Druid token that taps for {G}. −2 destroys target artifact or enchantment. −6 draws a card for each green creature you control. Carries the "can be your commander" line.
- **Child of Alara:** trample. When it dies, destroy all nonland permanents; they can't be regenerated.
- **Brago:** flying. When it deals combat damage to a player, exile any number of target nonland permanents you control, then return them to the battlefield under their owner's control.
- **Feather:** flying. When you cast an instant or sorcery that targets a creature you control, the card is exiled instead of going to the graveyard as it resolves, and returns to your hand at the beginning of the next end step.
- **Trostani:** whenever another creature you control enters, gain life equal to its toughness. {1}{G}{W}, {T}: populate.
- **Shalai:** flying. You, your planeswalkers and your *other* creatures have hexproof, so Shalai itself doesn't. {4}{G}{G}: put a +1/+1 counter on each creature you control, Shalai included. The brief was right that the ability puts green in the identity; the cost is {4}{G}{G} and it is not limited to "other" creatures.
- **Vorinclex:** trample. Whenever you tap a land for mana, add one more mana of a type it produced. Whenever an opponent taps a land for mana, it doesn't untap during that player's next untap step.

## 2. New printings after 2026-09-29

None found (searched 2026-10-07: news, MTG Wiki, Secret Lair storefront results). The newest Miku product is Secret Lair Commander Deck: Hatsune Miku, sold from August 10, 2026.

## 3. Other Vocaloid characters (flag: not Miku)

None is a legendary creature. All four appeared as planeswalkers in Electric Entourage:

| SLD # | Vocaloid name | Oracle card |
|---|---|---|
| 1590 | KAITO, Mysterious Maestro | Jace, Unraveler of Secrets |
| 1593 | Luka, the Traveling Sound | Liliana of the Dark Realms |
| 1600 | Len and Rin, Harmony Incarnate | The Royal Scions |
| 807 (bonus card) | MEIKO, Explosive Entertainer | Chandra, Flamecaller |

So four of the six "Miku planeswalkers" in the brief carry other Vocaloid names. Only Elspeth Tirel ("Miku, Divine Diva") and Freyalise are Miku-named. Commander eligibility for Elspeth Tirel and these four was not verified this pass. None is expected to have the commander line; one bulk-data query settles it.

## 4. Evaluation

### Child of Alara (WUBRG)
- **Command zone:** color identity only. If cast, it's a five-mana 6/6 trampler whose death destroys every nonland permanent on the table, with all lands untouched (rulings.md). The colors-only plan never casts it.
- **Fastest realistic win:** the best two-card lines in the format, such as Thassa's Oracle with Demonic Consultation or Tainted Pact at instant speed. Prior goldfish: about 22% by turn 4 and 51% by turn 6.
- **Colors unlocked:** all five, so every other Miku commander's card pool is a subset of this one.
- **Against the best in its colors:** strong five-color commanders bring an engine; Child brings none, so it competes on card pool alone and pays for a five-color mana base. In exchange there's no commander to protect.
- **Commander-enabled closer:** Coalition Victory (a Game Changer) wins with a land of each basic land type and a creature of each color; Child on the battlefield is a creature of every color. Wizards kept Coalition Victory on the Game Changers list for exactly this five-color-commander case. It costs Child plus an eight-mana spell (Oracle text to verify), so it's a late closer, not a turn 4–6 plan.
- **Verdict:** highest ceiling by a distance. The risk runs the other way from the brief: it drifts into cEDH. The Bracket 4 version should spend slots on resilience and on lines a bot can run, not on the fastest possible kill.

### Brago, King Eternal (WU)
- **Command zone:** a four-mana 2/4 flier. Each time it connects, it blinks any number of your nonland permanents: it untaps mana rocks, repeats enter-the-battlefield effects and resets your own stax pieces. It has to connect, and flying blockers or spot removal stop that.
- **Fastest realistic win:** comes from the 99, not from Brago: blue-white infinite-mana and Thassa's Oracle lines (queue in section 6). Brago itself grinds.
- **Colors unlocked:** white and blue, the best stack interaction among the Miku pairs: Force of Will, Fierce Guardianship, Mana Drain, plus Counterspell and Swan Song, which both have Miku printings. Also Swords to Plowshares, Rhystic Study, Mystic Remora, Teferi's Protection, Enlightened Tutor and Mystical Tutor.
- **Against the best in its colors:** it is the one Miku commander with an established high-power identity. EDHREC keeps cEDH, cEDH-stax and Optimized average decks for it (snapshots vary; one shows 77 decks tagged cEDH, another about 250 on Optimized blink). Those lists lean on Aether Channeler, Strionic Resonator, Mystic Remora, Tribute Mage, Urza's Saga, Mana Drain, Venser, Displacer Kitten, Drannith Magistrate, Archon of Emeria and Cursed Totem.
- **Verdict:** shortlisted. Two risks for the simulation: stax cards are work to implement and hard for a bot to pilot well, and many published lists predate the September 2024 bans (one example still runs Mana Crypt and Jeweled Lotus).

### Shalai, Voice of Plenty (GW)
- **Command zone:** a four-mana 3/4 flier that gives you, your planeswalkers and your other creatures hexproof, plus a {4}{G}{G} mana sink. That blanks targeted removal on combo creatures and targeted effects aimed at you. It doesn't stop wraths, edicts, counterspells or removal aimed at Shalai.
- **Fastest realistic win:** creature combos (Devoted Druid with Vizier of Remedies, Heliod with Walking Ballista, Archangel of Thune with Spike Feeder) and Craterhoof off Natural Order or Green Sun's Zenith. Prior note: Craterhoof needs about 6 creatures to kill one opponent and about 11 for the table. With infinite mana, Shalai's ability becomes an outlet, but it still needs combat.
- **Colors unlocked:** green and white: ramp, creature tutors (Chord of Calling has a Miku printing), Swords to Plowshares, Path to Exile, Teferi's Protection. Thin on card draw and on stack interaction.
- **Against the best in its colors:** the current Shalai deck wins about 33% against the bots and the precon 31–44%. Green-white can't match blue-white or five-color on interaction or tutors.
- **Verdict:** shortlisted as the green-white candidate because its command zone answers what Bracket 4 decks do to creature combos. Trostani goes on the same 99 as an A/B test (DECISIONS.md, D7).

### Trostani, Selesnya's Voice (GW)
Lifegain whenever a creature enters, plus tap-to-populate. Same card pool as Shalai; the earlier rebuild goldfished about 25% by turn 6. Not a separate candidate: test it as Shalai's A/B on the same 99.

### Azusa, Lost but Seeking (G)
Two extra land drops. Dark Depths with Thespian's Stage (Thespian's Stage has a Miku printing) is the kill, but Marit Lage kills one player per swing, and the deck wins about 20% against the bots. Mono-green is a subset of the green-white pool. Not shortlisted.

### Vorinclex, Voice of Hunger (G)
Eight mana before tax. It doubles your land mana and slows opponents' lands. Wizards took it off the Game Changers list in October 2025 as a high-mana-value card. Too slow for a turn 4–6 deck. Not shortlisted.

### Freyalise, Llanowar's Fury (G) — new
A five-mana walker: mana Elves, artifact or enchantment removal, and a card-draw ultimate. Legal, low ceiling, and a subset of the green-white pool. Not shortlisted.

### Feather, the Redeemed (RW)
Loops cheap targeted spells. Red-white has real two-card combos (Kiki-Jiki lines) but the weakest card draw and tutors of the pairs, and Feather's engine doesn't win games by itself. Every red-white line is available to Child anyway. Not shortlisted.

### Giada, Font of Hope (W)
Angel tribal with Angel-only mana. Mono-white, lowest ceiling of the nine. Not shortlisted.

## 5. Shortlist

1. **Child of Alara**: highest ceiling and every two-card line. Tune for resilience and bot-runnable lines, not for speed.
2. **Brago**: the only Miku commander with a proven high-power identity, and the best stack interaction among the pairs.
3. **Shalai, with Trostani as an A/B on the same 99**: command-zone protection aimed at what the bot decks do to creature combos.

Dropped: Azusa, Vorinclex, Freyalise and Giada (mono-colored subsets of the green-white pool, or too slow), and Feather (its red-white lines are covered by Child, and its engine doesn't win).

## 6. Win-line queue (candidates only — nothing here is verified)

Check each on Commander Spellbook and against Oracle text and rulings before it goes into a list. Record pieces, prerequisites, the exact sequence for a bot, mana needed on the go-off turn, whether it's instant speed, and what stops it.

- **Child of Alara:** Thassa's Oracle + Demonic Consultation; Thassa's Oracle + Tainted Pact; Underworld Breach + Lion's Eye Diamond + Brain Freeze; Ad Nauseam into a two-card win; Hermit Druid with no basic lands in the deck, then Thassa's Oracle; Isochron Scepter + Dramatic Reversal; Heliod, Sun-Crowned + Walking Ballista; Kiki-Jiki + Zealous Conscripts, Felidar Guardian or Restoration Angel; Devoted Druid + Vizier of Remedies; Coalition Victory with Child on the battlefield (commander-enabled, late).
- **Brago:** Isochron Scepter + Dramatic Reversal (needs nonland mana sources producing enough mana); Displacer Kitten with Dramatic Reversal or Scepter; infinite mana into a draw-everything outlet plus Thassa's Oracle or Laboratory Maniac; Peregrine Drake or Cloud of Faeries + Ghostly Flicker + Archaeomancer or Mnemonic Wall; Basalt Monolith + Rings of Brighthearth or Power Artifact; Grim Monolith + Power Artifact. Brago-enabled: value engines only so far (Strionic Resonator doubling the trigger, untapping rocks); no Brago-enabled infinite has been verified.
- **Shalai:** Devoted Druid + Vizier of Remedies, with Walking Ballista or Shalai's pump plus an attack as the outlet; Heliod + Walking Ballista; Archangel of Thune + Spike Feeder; Craterhoof via Natural Order, Green Sun's Zenith or Finale of Devastation; Earthcraft + Squirrel Nest with an outlet. Keep the brief's finding: Vizier of Remedies doesn't combo with Spike Feeder.

## 7. Opposition (preliminary — general knowledge, not yet checked against the bot decks)

Strong Bracket 4 pods typically carry cheap targeted removal (Swords to Plowshares, Path to Exile, Chaos Warp, Beast Within, Generous Gift), mass removal (Cyclonic Rift, Toxic Deluge, Farewell), free or cheap counters (Force of Will, Fierce Guardianship, Mana Drain, Swan Song, Dovin's Veto, Flusterstorm), rule-setting creatures (Drannith Magistrate, Opposition Agent) and graveyard hate (Rest in Peace, Bojuka Bog, Dauthi Voidwalker, Endurance).

What tends to survive: instant-speed two-card wins that don't touch the graveyard (Thassa's Oracle with Demonic Consultation) survive best. Underworld Breach lines die to graveyard hate. Creature combos die to instant-speed removal and wraths; Shalai covers targeted removal only. Craterhoof loses to wraths and to anything that stops combat.

Replace this section with counts from `miku/game/decks-*.js` (STATUS.md, step 3).

## Sources (checked 2026-10-07)

- Freyalise #1598 and its commander line: https://iwantmymtg.net/card/sld/1598 and https://www.cardkingdom.com/mtg/secret-lair/freyalise-llanowars-fury-1598-miku-voice-of-power-non-foil
- Electric Entourage card list (KAITO, Luka, Len and Rin, MEIKO): https://mtg.fandom.com/wiki/Secret_Lair_Drop_Series:_Camp_Totally_Safe_Superdrop
- Winter Diva contents (Giada, Brago, Counterspell, Swan Song): https://secretlair.wizards.com/us/en/product/1151103
- Sakura Superstar contents (Azusa, Feather): https://magic.wizards.com/en/news/announcements/hatsune-miku-comes-to-secret-lair
- Digital Sensation contents (Child of Alara, Sol Ring, Diabolic Tutor, Chord of Calling, Song of Creation, Thespian's Stage): https://www.wargamer.com/magic-the-gathering/hatsune-miku-summer-secret-lair
- Commander Deck: Hatsune Miku (numbers 2429, 2433, 2439, display 2443): https://www.cardkingdom.com/mtg-sealed/secret-lair-commander-deck-hatsune-miku and https://mtg.wiki/page/Secret_Lair_Commander_Deck:_Hatsune_Miku
- Shalai text: https://www.cardkingdom.com/mtg/dominaria/shalai-voice-of-plenty-foil
- Trostani text and rulings: https://scryfall.com/card/c19/204
- Vorinclex text and rulings: https://scryfall.com/card/mul/94
- Child of Alara text: https://mtgassist.com/cards/Conflux/Child-of-Alara/
- Brago text and rulings: https://scrydex.com/magicthegathering/cards/brago-king-eternal/SLD-1601
- Collector numbers 1586, 1597, 1599, 1601, 1602: retailer and eBay listings found via search (confirm against bulk data)
- EDHREC Brago pages: https://edhrecstatic.com/average-decks/brago-king-eternal/cedh and https://edhrec.com/average-decks/miku-queen-electric/cedh/stax
