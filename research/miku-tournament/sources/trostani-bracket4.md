# Trostani, Selesnya's Voice (Hatsune Miku Secret Lair precon) going into a Bracket 4 event

Research notes. All sources accessed **2026-10-07**. Source tags `[Sn]` resolve at the bottom. Quotes are kept under 15 words. Anything labeled **(analysis)** is my own reasoning from card text, not a sourced claim.

**Method notes**
- Game Changers status was checked against Scryfall's live `is:gamechanger` search (53 cards), not only third-party lists [S5].
- EDHREC data was pulled from EDHREC's public JSON behind the commander, bracket, average-deck, precon and combo pages [S9-S16]. Percentages are `decks with card / decks eligible`.
- Card text and prices come from the project's local Scryfall bulk index (`local/scryfall/gw-index.json`, built 2026-10-07 from Scryfall `default_cards`) [S25]. A price is the cheapest non-foil printing's TCGplayer market price (USD) or Cardmarket trend (EUR) as Scryfall reports it. Treat it as a rough guide, not a shop price.
- Reddit (r/EDH) could not be fetched; requests were blocked. No Commander's Herald article on the Miku deck turned up. No Reddit claims are used.
- Reskin names in the precon [S26]: "Miku, Song of the People" = Trostani. "Archangel of Tunes" = Archangel of Thune. "Miku, Voice Over All" = Shalai, Voice of Plenty. "Miku, the Complete Performer" = Vorinclex, Voice of Hunger. "Cascade of Song" = Halo Fountain.
- EDHREC's precon decklist [S14] also contains **Avacyn's Pilgrim, Llanowar Elves, Selesnya Signet and Shamanic Revelation**, which are missing from the brief's list. It has **34 lands**, many of them tapped lands.

---

## 1. Bracket 4 rules today and the current Game Changers list

### Bracket 4 rules
- **No deck restrictions beyond the banned list.** The Feb 2025 launch article says Bracket 4 has "no restrictions (other than the banned list)" [S2]. That means two-card infinite combos, extra turns, mass land denial and unlimited Game Changers are all allowed.
- **Oct 21, 2025 update [S3]:** Bracket 4 decks should be "lethal, consistent, and fast". They should be "designed to take people down as fast as possible". Game Changers here "are likely to be fast mana, snowballing resource engines, free disruption, and tutors". Expect "at least four turns before you win or lose". For comparison, Bracket 3 says six turns and Bracket 2 says eight.
- **Same update [S3]:** the panel "removed the tutor restrictions from Commander Brackets entirely". Only the tutors on the Game Changers list are now limited.
- **Feb 9, 2026 update [S4]:** added Farewell and Biorhythm to Game Changers. It made **no bracket-level changes**; the panel wants to "cool it on bracket-level changes". It said the next regular update would come around May/June 2026.
- **No later change.** Third-party trackers say the list and rules have not changed since Feb 9, 2026. They also say the June 29, 2026 B&R announcement had no Commander changes [S8 search snippet; S6]. One third-party site attributes the turn-count definitions to Feb 2026, but the official text shows they came on Oct 21, 2025 [S3].

### Current Game Changers (Scryfall `is:gamechanger`, 53 cards, 2026-10-07 [S5])
Only white, green, GW and colorless cards are listed, since only those are legal in this deck:
- **White:** Drannith Magistrate, Enlightened Tutor, Farewell, Humility, Serra's Sanctum, Smothering Tithe, Teferi's Protection
- **Green:** Biorhythm, Crop Rotation, Gaea's Cradle, Natural Order, Seedborn Muse, Survival of the Fittest, Worldly Tutor
- **GW:** Aura Shards
- **Colorless:** Ancient Tomb, Chrome Mox, Field of the Dead, Glacial Chasm, Grim Monolith, Lion's Eye Diamond, Mana Vault, Mishra's Workshop, Mox Diamond, Panoptic Mirror, The One Ring, The Tabernacle at Pendrell Vale

### Status of the specific cards asked about
| Card | Game Changer? | Note |
|---|---|---|
| Vorinclex, Voice of Hunger | **No.** Removed Oct 21, 2025 | Cut as a high-mana-value card [S3][S5] |
| Smothering Tithe, Enlightened Tutor, Worldly Tutor, Teferi's Protection, Gaea's Cradle, Natural Order, Survival of the Fittest, Crop Rotation, Seedborn Muse, The One Ring | **Yes** | [S5] |
| Farewell | **Yes.** Added Feb 9, 2026 | [S4][S5] |
| Esper Sentinel, Trouble in Pairs | No | Trouble in Pairs was removed in Apr 2025 [S6][S5] |
| Mana Crypt | Not on the list | It is banned in Commander. Not on Scryfall's list [S5] |

**The precon has 0 Game Changers.** No precon card is flagged [S5][S25]. In Bracket 4 the count does not matter anyway.

---

## 2. EDHREC data for Trostani and the Miku precon

**Sample sizes [S9-S12].** All bracket filters: 11,017 decks. Upgraded (B3): 938. Optimized (B4): 291. cEDH (B5): 3, too few to use. Declared bracket counts on the average-deck page are B1 34, B2 1,057, B3 938, B4 291, B5 3 [S13]. Save dates jump sharply from Aug 10, 2026, the precon's release [S13][S15]. Most data is therefore precon-driven, so precon cards have inflated inclusion rates.

**Top cards and synergy, all brackets [S9].** Sundering Growth (70%, synergy +61%), Soul Warden (64%, +51%), Rootborn Defenses (63%), Aetherflux Reservoir (60%, +53%), Crested Sunmare (58%), Rhys the Redeemed (57%), Archangel of Thune (56%), Growing Ranks (56%), Grove of the Guardian (53%), Swords to Plowshares (77%), Path to Exile (68%). Off-precon cards with high synergy: Parallel Lives (+23%), Selesnya Signet (+23%), Ocelot Pride (+18%), Essence Warden (+18%), Mondrak (+17%), Anointed Procession (+17%).

**Optimized (B4) page, 291 decks [S10].** Inclusion and synergy of the non-precon cards:
| Card | B4 inclusion | Synergy | GC |
|---|---|---|---|
| Heroic Intervention | 43% | +6% | no |
| Aura Shards | 44% | +29% | yes |
| Doubling Season | 46% | +29% | no |
| Elvish Mystic | 43% | +21% | no |
| Birds of Paradise | 40% | +14% | no |
| Parallel Lives | 38% | +28% | no |
| Teferi's Protection | 34% | +18% | yes |
| Smothering Tithe | 32% | +19% | yes |
| Enlightened Tutor | 32% | +18% | yes |
| Craterhoof Behemoth | 31% | +20% | no |
| Chord of Calling | 31% | +24% | no |
| Sylvan Library | 31% | +20% | no |
| Seedborn Muse | 29% | +23% | yes |
| Ocelot Pride | 29% | +22% | no |
| Mondrak, Glory Dominus | 28% | +21% | no |
| Beast Within | 27% | -9% | no |
| Tigereye Cameo | 27% | +26% | no |
| Eladamri's Call / Worldly Tutor | 23% each | +9% / +12% | no / yes |
| Esper Sentinel | 22% | +5% | no |
| Felidar Sovereign | 21% | +15% | no |
| Heliod, Sun-Crowned | 20% | +12% | no |
| Cathars' Crusade | 18% | +4% | no |
| Generous Gift / Flawless Maneuver | 17% each | -13% / +4% | no |
| Gaea's Cradle / The One Ring / Avenger of Zendikar | 16% / 15% / 15% | | yes / yes / no |
| Elspeth, Sun's Champion | 14% | | no |
| Walking Ballista / Ancient Tomb / Green Sun's Zenith | 12% each | | no / yes / no |
| Intangible Virtue / Triumph of the Hordes / Natural Order / Beastmaster Ascension | 8% / 6% / 6% / 5% | | |

Not listed on the B4 page: Spike Feeder, Scurry Oak, Esika's Chariot, Adeline, Hero of Bladehold, Mirror Entity, Jazal Goldmane, True Conviction, Overwhelming Stampede, Return of the Wildspeaker and Crashing Drawbridge [S10].

**Precon cards that rise in B4 decks [S10] vs all [S9].** Archangel of Thune goes from 56% to 75%. Soul Warden goes from 64% to 77%. Shalai goes from 51% to 67%. Finale goes from 44% to 63%. Grand Crescendo goes from 46% to 62%. Skullclamp goes from 34% to 45%.

**EDHREC average "Optimized" Trostani deck vs the precon [S13][S14]** (analysis of the diff):
- **Adds:** Arcane Signet, Aura Shards, Birds of Paradise, Brushland, Craterhoof Behemoth, Doubling Season, Elspeth Tirel, Elvish Mystic, Enlightened Tutor, Fortified Village, Heroic Intervention, Mondrak, Ocelot Pride, Parallel Lives, Seedborn Muse, Smothering Tithe, Sylvan Library, Teferi's Protection, Temple Garden, Three Visits, Windswept Heath.
- **Drops:** Ajani's Pridemate, Ancient Cornucopia, Angel of Indemnity, Angelic Chorus, Arasta, Boon Reflection, Camaraderie, Congregate, Dazzling Theater, Excavation Technique, Explore, Gruff Triplets, Healing Technique, Invincible Hymn, Silverquill Lecturer, Song of Freyalise, Soul of Eternity, Springleaf Drum, Storm Herd. It also drops the lands Brokers Hideout, Lazotep Quarry, Radiant Fountain, Restless Prairie, Sapseep Forest and Seraph Sanctuary.
- The average optimized deck **keeps Vorinclex, Ghalta and Mavren, Phyrexian Processor, Song of the Worldsoul, Mirari's Wake and Voice of the Blessed**.

**EDHREC precon page "Hatsune Miku" [S14]** (2,891 decks built from the precon):
- **Top "Cards to Add":** Elspeth Tirel (869), Elvish Mystic (837), Harmonize (693), Haliya, Guided by Light (649), Chord of Calling (599), Freyalise, Llanowar's Fury (591), Exemplar of Light (578), The Wind Crystal (575), Doubling Season (546), Caretaker's Talent (499), Heroic Intervention (453). Craterhoof (337) and Beast Within (328) appear further down.
- **Top lands to add:** Temple Garden (1,144), Brushland (751), Fortified Village (597).
- **"Cards to Cut" list:** Invincible Hymn, Ajani's Pridemate, Excavation Technique, Springleaf Drum, Silverquill Lecturer, Congregate, Healing Technique, Song of Freyalise, Storm Herd, Ancient Cornucopia, Gruff Triplets, Boon Reflection, Soul of Eternity, Camaraderie, Angel of Indemnity, Angelic Chorus, Explore, Arasta, Dazzling Theater, Selesnya Signet, Voice of the Blessed.
- **"Lands to cut" list** starts with Radiant Fountain, Sapseep Forest, Seraph Sanctuary, Krosan Verge, Graypelt Refuge, Blossoming Sands, Lazotep Quarry and Brokers Hideout.

**Precon facts [S15].** Released Aug 10, 2026 at $149.99. Designed by Carmen Klomparens. EDHREC's release article gives no bracket number. The brief calls it Bracket 2, which matches its 0 Game Changers.

**Upgrade articles:**
- **Draftsim (Aug 13, 2026) [S18]** calls it weak on removal, card draw and land count, since it runs 34 lands. Its cuts: Ajani's Pridemate, Angelic Chorus, Congregate, Boon Reflection, Invincible Hymn, Voice of the Blessed, Song of Freyalise, Silverquill Lecturer, Bramble Sovereign, Growing Ranks, Break Down, Song of the Worldsoul, Aetherflux Reservoir, Gruff Triplets, Mirari's Wake, Rhys, Storm Herd, Phyrexian Processor, Healing Technique and Vorinclex. Its adds are mostly casual: utility lands, Audience with Trostani, Armada Wurm, Elspeth Sun's Champion, Exemplar of Light, Freyalise, Haliya, Timeless Witness. It is a Bracket 2-3 guide, not a Bracket 4 one. Its cut of Aetherflux runs against the B4 data, which shows Aetherflux in 71% of decks.
- **Cardsrealm (Sep 22, 2026) [S20]** adds Akroma's Will, Craterhoof, Belladonna Took, The Wind Crystal, Well of Lost Dreams, Essence Warden, Prosperous Innkeeper, Tigereye Cameo, Scute Swarm, Mondrak and Exalted Sunborn.
- **The Spark MTG (Jun 8, 2026) [S19]** was written before the decklist shipped. Its point that Selesnya has trouble actually ending games is still useful. Short quote: Selesnya "builds a beautiful board and then can't end the game".

---

## 3. How the archetype wins, plays and loses at higher power

### Win routes, with combos verified against card text [S16][S17][S25]
1. **Heliod, Sun-Crowned + Walking Ballista (2 cards).** Pay {1}{W} to give Ballista lifelink. Each ping gains life, and Heliod puts a counter back on Ballista. This gives infinite damage. It is the most-played version on EDHREC, in 51,853 decks [S16].
2. **Spike Feeder + Archangel of Thune (2 cards; Archangel is already in the precon).** Remove a counter from Feeder to gain 2 life. Archangel then puts a +1/+1 counter on each creature, including Feeder. This gives infinite life and infinite counters on every creature [S16]. With **Aetherflux Reservoir** (precon), pay 50 life over and over for 50 damage each time, which kills the table at instant speed.
3. **Spike Feeder + Heliod** gives infinite life, and Aetherflux finishes. **Spike Feeder + Cleric Class** (precon, needs level 2) does the same [S16].
4. **Scurry Oak + Trostani (commander) + Archangel of Thune / Cleric Class (level 2) / Heliod.** Each Squirrel that enters triggers Trostani's lifegain. That puts a counter on Oak, which makes another Squirrel, and so on. This gives infinite tokens, life and counters [S16]. Trostani is always available from the command zone, so in practice Scurry Oak is a 2-card combo with each of three cards. **Soul Warden** (precon) can replace Trostani in the Archangel and Heliod versions [S16].
5. **Archangel of Thune + Walking Ballista** is *not* a 2-card combo. Ballista needs lifelink from another source, such as Heliod's ability [S17].
6. **Non-combo wins.** Aetherflux after a long chain of spells. Halo Fountain's 15-creature win (precon). Felidar Sovereign at 40 or more life [S22]. Overrun effects: Craterhoof, or Finale of Devastation at X≥10, which gives +X/+X and haste [S25].
7. **Tutor routes (analysis from card text) [S25].**
   - Finale of Devastation (precon) puts Spike Feeder, Scurry Oak or Heliod straight onto the battlefield at X=3, or Archangel at X=5.
   - Chord of Calling does the same at instant speed with convoke, so tokens can pay.
   - Eladamri's Call and Worldly Tutor find any creature, including Walking Ballista. Fetch Ballista to hand, not with Finale or Chord: it would enter at X=0 and die.
   - Enlightened Tutor finds Heliod, Aetherflux, Cleric Class or Ballista.

### Opening hands and sequencing (analysis; general GW guidance in [S21] is low-reliability)
- **Keep:** 2-4 lands plus at least one turn-1 or turn-2 accelerant (Pilgrim, Llanowar, Sol Ring, Signet, Arcane Signet) plus either an engine (Soul Warden, Archangel, Trostani on curve) or a tutor (Finale or Chord).
- **Mulligan:** hands built on 6-7 drops, such as Ghalta, Vorinclex, Storm Herd or Hour of Reckoning. Also hands of tapped lands with no turn-2 play. Bracket 4 games are expected to be decided by about turns 4-7 [S3][S23][S24].
- **Typical line:** turn 1 dork or Soul Warden. Turn 2 Signet, a 2-drop, or Heliod with a dork. Turn 3 or 4 Trostani. From then on, threaten a combo (Feeder/Oak plus Archangel, or Heliod plus Ballista) while holding Heroic Intervention, Flawless Maneuver or Teferi's Protection.
- **What to protect:** Trostani (needed for the Oak loops, and each recast costs 2 more), Archangel of Thune and Aetherflux Reservoir. Heliod is indestructible but can be exiled. Hold protection when an opponent casts a sweeper or targets a combo piece. Don't spend it on value creatures.

### How the archetype loses
- **Speed.** In Bracket 4, losses come before turn 4 only rarely, but decks are built to be fast and lethal [S3]. A precon-speed deck that plans to win on turn 8 or later will often be raced by a turn 5-6 combo. **(analysis)**
- **Board wipes and lack of reach.** Lifegain/token decks are listed as vulnerable to mass removal, counterspells and fast combo [S21, low reliability]. Spark adds that Selesnya can build boards but not close games [S19]. Farewell is now a Game Changer and is common at Bracket 4 [S4][S5].
- **Lifegain hate.** Tainted Remedy turns your lifegain into life loss. Rampaging Ferocidon, Erebos and Sulfuric Vortex stop you from gaining life [search snippets in S27]. These shut off Trostani, Archangel and Heliod triggers. Answers already in the deck: Sundering Growth, Break Down, Swords and Path. Generous Gift and Beast Within also handle them.
- **Politics.** A high life total "certainly stands out" and draws attacks and removal [S22]. Lifegain also does nothing against combo, commander damage or mill [S22].

---

## 4. Cheap, high-impact GW and colorless cards for a Bracket 4 version

All are legal in Commander [S25]. GC = Game Changer [S5]. Prices are the cheapest printing in Scryfall bulk data, accessed 2026-10-07 [S25]; shop prices will differ.

| Card | GC | ~EUR / ~USD | Why it fits this deck | B4 incl. [S10] |
|---|---|---|---|---|
| **Heliod, Sun-Crowned** | no | 14.87 / 19.20 | 2-card win with Ballista; infinite life with Feeder. Also an engine with Soul Warden and Trostani. Findable with Finale (X=3), Chord or Enlightened | 20% |
| **Walking Ballista** | no | 6.75 / 5.45 | Heliod combo; flexible removal; acts as a mana sink | 12% |
| **Spike Feeder** | no | 0.48 / 0.47 | 2-card infinite with the precon's **Archangel**, and with Heliod and Cleric Class. Findable with Finale or Chord (X=3) | not listed |
| **Scurry Oak** | no | 1.18 / 2.76 | Infinite with Trostani plus Archangel, Cleric Class or Heliod. Uses the commander as a combo piece | not listed |
| Chord of Calling | no | 4.01 / 6.97 | Instant-speed creature tutor to the battlefield; tokens pay via convoke | 31% |
| Eladamri's Call | no | 7.59 / 10.76 | 2-mana instant tutor for any creature to hand, including Ballista | 23% |
| Worldly Tutor | **yes** | 17.19 / 26.57 | 1-mana creature tutor | 23% |
| Enlightened Tutor | **yes** | 17.38 / 21.99 | Finds Heliod, Aetherflux, Cleric Class or Ballista | 32% |
| Green Sun's Zenith | no | 17.40 / 31.31 | Green creatures only, so it misses Heliod, Ballista and Archangel. Lower value here | 12% |
| Teferi's Protection | **yes** | 28.28 / 34.59 | Best answer to sweepers and to opponents' combo turns | 34% |
| Heroic Intervention | no | 9.86 / 9.08 | 2-mana hexproof plus indestructible for the whole team | 43% |
| Flawless Maneuver | no | 7.94 / 9.66 | Free while Trostani is on the battlefield | 17% |
| Akroma's Will | no | 13.59 / 16.57 | Protection or a finisher | 13% |
| Grand Abolisher | no | 10.01 / 18.06 | Opponents can't respond on your combo turn | n/a |
| Generous Gift | no | 0.70 / 0.93 | Instant; hits any permanent, including lifegain hate and stax | 17% |
| Beast Within | no | 0.52 / 0.44 | Same role as Generous Gift | 27% |
| Force of Vigor | no | 4.73 / 5.57 | Free instant artifact/enchantment removal | n/a |
| Swords / Path | no | already in deck | Keep both | 84% / 74% |
| Smothering Tithe | **yes** | 34.19 / 55.60 | Strong in high-power pods that draw lots of cards; ramp toward a combo or overrun | 32% |
| Esper Sentinel | no | 39.36 / 58.08 | 1-drop tax on noncreature spells. Expensive | 22% |
| Arcane Signet | no | 0.26 / 0.39 | Cheap 2-mana rock | 52% |
| Elvish Mystic | no | 0.51 / 0.34 | Turn-1 dork. The deck already has Llanowar and Pilgrim | 43% |
| Birds of Paradise | no | 3.00 / 4.98 | Turn-1 dork that makes either color | 40% |
| Aura Shards | **yes** | 14.18 / 19.14 | Every creature that enters becomes artifact/enchantment removal | 44% |
| Seedborn Muse | **yes** | 9.26 / 15.74 | Populate and Halo Fountain on every turn. 5 mana | 29% |
| Craterhoof Behemoth | no | 19.09 / 23.03 | Wins from a wide board. Finale X=8 finds it | 31% |
| Avenger of Zendikar | no | 0.58 / 0.49 | Cheap finisher with populate | 15% |
| Felidar Sovereign | no | 1.49 / 3.15 | Alt-win at 40 life; Finale X=6 | 21% |
| Exemplar of Light | no | 1.91 / 0.91 | Cheap card-draw engine on lifegain | n/a (precon add #7) |
| Fast mana: Ancient Tomb / Chrome Mox / Mana Vault | **yes** | 41.13 / 24.84 / 49.79 EUR | Real speed, but costly for one night | 12% (Tomb) |

Analysis of the brief's existing upgrade list: Cathars' Crusade, Elspeth Sun's Champion, Esika's Chariot, Intangible Virtue, Beastmaster Ascension, Overwhelming Stampede, Triumph of the Hordes, Return of the Wildspeaker, Jazal Goldmane, Mirror Entity, Crashing Drawbridge, Adeline and Hero of Bladehold are fine Bracket 3 cards, but B4 Trostani players rarely use them (0-18% on [S10]). With only 15 swaps, they lose to combo pieces, tutors, protection and instant-speed interaction.

---

## 5. What Bracket 4 pods look like, and what a modest deck should prioritize

- **Official definition [S3].** Bracket 4 decks are "lethal, consistent, and fast" and come with "efficient disruption to match". Expect at least four turns. Expect fast mana, tutors and free disruption as the Game Changers.
- **Third-party descriptions** (not data-backed; treat as anecdote):
  - Games are "decided within about four turns" [S23].
  - Decks are "built to kill on turn 4 to 6" [S24, search snippet].
  - Decks run 10-18 interaction spells, "weighted heavily toward instant-speed counterspells" [S24, search snippet].
  - Decks are still "optimized but not competitively metagamed" [S24].
- **What to prioritize (analysis).** The precon cannot outpace Bracket 4 decks with turn-4/5 combos. The best way to compete is:
  1. **A compact, tutorable win.** Spike Feeder, Scurry Oak and Heliod each combine with cards the deck already has: Archangel, Trostani, Cleric Class and Aetherflux. That gives many 2-card wins and 6+ tutors (Finale, Chord, Eladamri's, Worldly, Enlightened).
  2. **Cheap instant-speed interaction** for opposing combo pieces and lifegain hate: Swords, Path, Gift, Beast Within, Force of Vigor, Sundering Growth.
  3. **Protection for the win turn and against sweepers:** Teferi's Protection, Heroic Intervention, Flawless Maneuver, Rootborn Defenses, Grand Crescendo.
  4. **Speed last.** Cut 6+ drops and add a few cheap ramp pieces rather than chasing expensive fast mana.
- Resilience and interaction matter more than raw speed for a deck that will rarely be the fastest at the table. Treat a turn 6-7 win as the realistic goal.

---

## Top 20 swap candidates for a 15-card-max Bracket 4 upgrade of this precon
Ranked by impact per slot for tonight. GC = Game Changer.
1. **Spike Feeder.** A 3-mana 2-card win with the precon's Archangel (plus Aetherflux to finish). Finale and Chord can fetch it, and it costs under 1 EUR.
2. **Heliod, Sun-Crowned.** Combo hub (Ballista, Feeder, Oak plus Trostani). Indestructible, and three tutor paths reach it.
3. **Walking Ballista.** Heliod's partner; also a flexible removal and mana sink when not comboing.
4. **Scurry Oak.** Uses the commander as a combo piece, so it's effectively a 2-card win with Archangel, Cleric Class or Heliod.
5. **Chord of Calling.** Instant-speed tutor that puts Feeder, Oak, Heliod or Archangel onto the battlefield, paid for by tokens.
6. **Teferi's Protection (GC).** Survives Farewell, Toxic Deluge or an opponent's combo turn. 34% of B4 Trostani decks play it.
7. **Heroic Intervention.** 2-mana anti-sweeper and anti-removal. The most-played protection on the B4 page (43%).
8. **Eladamri's Call.** 2-mana instant tutor that can grab Ballista, which Finale and Chord can't usefully fetch.
9. **Worldly Tutor (GC).** 1-mana access to any combo creature.
10. **Enlightened Tutor (GC).** Finds Heliod, Aetherflux, Ballista or Cleric Class.
11. **Generous Gift.** Instant answer to anything, including lifegain hate, stax or a combo piece; under 1 EUR.
12. **Beast Within.** Second catch-all instant answer.
13. **Flawless Maneuver.** Free with Trostani out, so you can protect while tapped out on a big turn.
14. **Arcane Signet.** Cheap ramp to speed up Trostani and the combo turn.
15. **Elvish Mystic (or Birds of Paradise).** A third turn-1 dork for consistency.
16. **Craterhoof Behemoth.** The best non-combo finisher for a token board; Finale X=8 finds it.
17. **Grand Abolisher.** Opponents can't respond on your combo turn, which matters against Bracket 4 interaction.
18. **Smothering Tithe (GC).** Strong ramp at card-draw-heavy tables, but expensive. Buy it only if the budget allows.
19. **Aura Shards (GC).** Every token becomes artifact or enchantment removal. 44% of B4 Trostani decks play it.
20. **Force of Vigor.** Free interaction against artifact/enchantment combos, stax and lifegain-hate enchantments.

*Alternates:* Felidar Sovereign, Avenger of Zendikar, Exemplar of Light, Esper Sentinel, Sylvan Library, Akroma's Will, Seedborn Muse, Temple Garden or Brushland (replacing tapped lands).

## Top 10 precon cards to cut
1. **Invincible Hymn.** 8 mana that does nothing to the board. First on EDHREC's precon "cut" list [S14] and absent from the optimized average deck [S13].
2. **Storm Herd.** 10 mana; far too slow for games decided by turns 4-7.
3. **Congregate.** 4-mana pure lifegain with no board impact; also on Draftsim's and EDHREC's cut lists [S14][S18].
4. **Healing Technique.** Slow, and demonstrate hands an opponent a copy.
5. **Excavation Technique.** Sorcery-speed removal that gives Treasures and a free copy to an opponent. Gift and Beast Within do the job better.
6. **Silverquill Lecturer.** A 5-mana do-nothing that gives opponents token copies of your creatures.
7. **Angelic Chorus.** Repeats Trostani's own ability for 5 mana.
8. **Boon Reflection.** 5 mana with no board impact; the combos already make infinite life.
9. **Ajani's Pridemate.** Low-impact 2-drop; 12% in B4 decks [S10].
10. **Soul of Eternity.** 7 mana with no immediate effect.

*Next five cuts, to reach 15:*
- Song of Freyalise, which is slow.
- Gruff Triplets, a 6-drop.
- Dazzling Theater // Prop Room.
- Arasta of the Endless Web.
- Angel of Indemnity. Alternatively Vorinclex (8 mana; still 55% in B4 decks, so a judgment call) or Ancient Cornucopia / Springleaf Drum if you swap in Arcane Signet.

---

## Sources (all accessed 2026-10-07)
- [S1] Wizards of the Coast, Commander format page: https://magic.wizards.com/en/formats/commander
- [S2] Wizards, "Introducing Commander Brackets Beta" (Feb 11, 2025): https://magic.wizards.com/en/news/announcements/introducing-commander-brackets-beta
- [S3] Wizards, "Commander Brackets Beta Update" (Oct 21, 2025): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025
- [S4] Wizards, "Commander Brackets Beta Update" (Feb 9, 2026): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026
- [S5] Scryfall search `is:gamechanger` (53 cards, via API): https://scryfall.com/search?q=is%3Agamechanger
- [S6] ScrollVault, Game Changers list and history (verified Oct 4, 2026): https://scrollvault.net/guides/game-changers.html
- [S7] Playgroup.gg, Game Changers list (Oct 2026): https://playgroup.gg/commander/game-changers
- [S8] CommanderBrackets.com changelog (search-result snippet only): https://commanderbrackets.com/changelog
- [S9] EDHREC, Trostani, Selesnya's Voice: https://edhrec.com/commanders/trostani-selesnyas-voice
- [S10] EDHREC, Trostani – Optimized: https://edhrec.com/commanders/trostani-selesnyas-voice/optimized
- [S11] EDHREC, Trostani – Upgraded: https://edhrec.com/commanders/trostani-selesnyas-voice/upgraded
- [S12] EDHREC, Trostani – cEDH: https://edhrec.com/commanders/trostani-selesnyas-voice/cedh
- [S13] EDHREC, Average Deck – Optimized: https://edhrec.com/average-decks/trostani-selesnyas-voice/optimized
- [S14] EDHREC, Hatsune Miku precon page: https://edhrec.com/precon/hatsune-miku
- [S15] EDHREC, "Hatsune Miku Commander Deck Releases August 10th" (Aug 4, 2026): https://edhrec.com/articles/hatsune-miku-commander-deck-releases-august-10th
- [S16] EDHREC, combos for Trostani: https://edhrec.com/combos/trostani-selesnyas-voice
- [S17] Commander Spellbook, Archangel of Thune + Walking Ballista variant: https://commanderspellbook.com/search/?q=card%3D%22Archangel+of+Thune%22+card%3D%22Walking+Ballista%22
- [S18] Draftsim, Hatsune Miku Commander Deck Upgrade Guide (Aug 13, 2026): https://draftsim.com/mtg-hatsune-miku-commander-deck-upgrade-guide/
- [S19] The Spark MTG, Miku precon upgrade (Jun 8, 2026): https://www.thesparkmtg.com/p/trostani-in-a-wig-upgrading-the-miku-precon-before-it-ships-0bac
- [S20] Cardsrealm, Upgrading Commander Precon: Hatsune Miku (Sep 22, 2026): https://mtg.cardsrealm.com/en-us/articles/upgrading-commander-precon-hatsune-miku
- [S21] EDH.Wiki, Trostani page (looks auto-generated; low reliability): https://edh.wiki/commanders/trostani-selesnyas-voice/
- [S22] EDHREC, "Lifegain in Commander" (Cooper Gottfried): https://edhrec.com/articles/edhrec-guide-to-lifegain-in-commander
- [S23] NerdLeagues, Best Commanders for Bracket 4 (Jul 5, 2026): https://www.nerdleagues.com/blog/best-commanders-for-bracket-4-optimized-decks
- [S24] ScrollVault, Commander Brackets guide (search-result snippets): https://scrollvault.net/guides/commander-brackets.html
- [S25] Scryfall bulk data (default_cards), local index `mtgpractice/research/miku-tournament/local/scryfall/gw-index.json`, built 2026-10-07: https://scryfall.com/docs/api/bulk-data
- [S26] Scryfall, Secret Lair Miku reskins (SLD 2429-2445): https://scryfall.com/search?q=set%3Asld+cn%3E%3D2429+cn%3C%3D2445
- [S27] Search-result snippets on lifegain hate (Tainted Remedy, Rampaging Ferocidon, Erebos, Sulfuric Vortex): https://moxmythic.com/cards/tainted-remedy ; https://casualplaneswalker.com/card/sulfuric-vortex/faq/
