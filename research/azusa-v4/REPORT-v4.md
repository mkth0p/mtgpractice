# Azusa, Lost but Seeking: B4 v4, the "Marneus-equivalent" build (2026-10-12)

Brief: ju wants the friend's Marneus Calgar deck as a benchmark for how the deck should perform and feel: "like doesn't mean I want it to run the same. I want an equivalent." That means an engine commander, a value deck that can combo, redundant loops, an answer to everything, and power at the top of Bracket 4. It does not mean copying Marneus's mechanics. ju's preferences (`miku-deck-plan.md`) all still apply.

All v2, v3 and v4 numbers come from the same simulator (azusa_b4_sim_v4.py) with the same seeds. **v4 has not been run in the game engine yet.**

Files in this folder: decklist-v4.txt, prices-v4.csv, azusa_b4_sim_v4.py, azusa_ablation_v4.py, run_heavy.sh, sim-output-v4.txt, missing-from-engine-v4.txt, check_engine_v4.py, build_prices_v4.py, fetch_forge.sh, forge/, ablation/, runs/, ref-decklist-v2.txt, ref-decklist-v3.txt.

## 1. Short answer

v4 beats v2 under every removal model and keeps ju's preferences. Only its speed when nobody interacts (goldfish) is lower.

| 20,000 games, seed 1 / seed 2 | v2 | v3 | **v4** |
|---|---|---|---|
| **b4bots: game won by T14 (primary)** | 29.1 / 29.2 | 23.6 / 23.5 | **32.4 / 32.9** |
| b4bots: game won by T10 | 25.7 / 26.0 | 18.8 / 18.6 | 26.7 / 26.6 |
| b4bots: table dead by T14 | 59.7 / 59.7 | 54.9 / 54.8 | **69.8 / 70.2** |
| b4bots: median turn the table dies | T12 | T14 | **T11** |
| b4bots: P(won by T14 \| nothing decided by T10) | 22.7 / 22.6 | 25.0 / 25.4 | **32.9 / 35.6** |
| b4bots: an opponent won first | 68.6 | 73.0 | **64.7** |
| Light: game won by T14 | 57.1 / 57.2 | 48.1 / 48.3 | **59.2 / 59.9** |
| Harsh: game won by T14 | 9.2 / 9.6 | 7.4 / 7.6 | **12.5 / 12.8** |
| Goldfish: kill by T6 | **62.6 / 62.2** | 36.6 / 36.0 | 44.0 / 44.1 |
| Goldfish: median kill turn (quartiles) | T6 (5/6/7) | T7 (6/7/10) | T7 (6/7/9) |
| Goldfish: no kill by T10 | **5.4** | 18.9 | 10.6 |
| Goldfish: kill by T3 (Bracket 4 limit: 5%) | 0.1 | 0.0 | 0.1 |

Paired differences under b4bots (8,000 paired games, seed 1), game won by T14:
- v4 − v2: **+3.21 ± 0.54**; +2.79 ± 0.53 if the v2 pilot also holds Ashaya.
- v4 − v3: **+8.61 ± 0.48**.

What v4 is:
- **54 lands (30 Forests).** With Azusa, every land is mana, a landfall trigger, and fuel for Glacial Chasm and Crop Rotation. In this deck a Forest beats a mana elf or a mox.
- **10 creature and spell tutors.** ju's analyzer will count 12, because it also counts Crop Rotation and Elvish Reclaimer.
- **Interaction:** 6 answers (Beast Within, Nature's Claim, Ram Through, Archdruid's Charm, Boseiju, Ghost Quarter) and 9 protection pieces. On top of that, a **Glacial Chasm lock**: Azusa + Chasm + Crucible of Worlds, with Crop Rotation to fetch Chasm at instant speed. It answers the combat wins (tokens, big threats), which are about half of what the bots win with.
- **Mind's Eye** as green's table-powered card draw.
- **6 Game Changers.**
- About **949 USD ≈ 806 €**.

What can't be copied from Marneus:
- Measured, green turns a land drop into about **0.08 extra cards and 0.10 extra mana per landfall trigger**. Marneus gets about 1 card per token event.
- The things that make Marneus great in Esper measured negative or flat here: fast mana −3.2 for four pieces; "nobody responds" effects −0.1; fogs −0.7; Seedborn Muse −0.5; Burgeoning −0.55.
- v4 is the green equivalent instead. It is a value deck because **lands are both its mana and its fuel**, and it can combo because of its tutors and five redundant lines.

## 2. From v3 to v4 (b4bots, 8,000 paired games, seed 1)

| Step | Game won by T14 |
|---|---|
| v3 (same simulator) | 23.9 |
| `draft0`: + Mind's Eye, Glacial Chasm, Crucible of Worlds, Invasion of Ikoria, − 4 Forests | 25.7 |
| `draft1`: − Springheart Nantuko, Scavenging Ooze, Delighted Halfling, Lotus Cobra, Worldly Tutor, Sylvan Tutor, + 6 Forests | 28.6 |
| `draft2`: + Time of Need for a Forest | 29.7 |
| `draft3`: − Llanowar, Mystic, Fyndhorn, Birds, + 4 Forests | 30.6 (+1.38 ± 0.30) |
| **v4**: − Endurance, Reclamation Sage, Force of Vigor, + 3 Forests | 33.2 (+2.61 ± 0.31 over `draft3`) |

Net change from v3:
- **Out (13):** Birds of Paradise, Delighted Halfling, Elvish Mystic, Fyndhorn Elves, Llanowar Elves, Lotus Cobra, Springheart Nantuko, Endurance, Force of Vigor, Reclamation Sage, Scavenging Ooze, Sylvan Tutor, Worldly Tutor.
- **In (13):** Crucible of Worlds, Glacial Chasm, Invasion of Ikoria, Mind's Eye, Time of Need, 8 Forests.

Why so many lands: with Azusa out, each land is an extra mana every turn, a landfall trigger (Tracker, Provisioner, Nissa, Field of the Dead, Avenger), and fuel for Crop Rotation, Chasm and Crucible. Lands also survive the board wipes that kill elves.

Why the three answers were cut, at the `draft3` stage:
- **Reclamation Sage** made the deck worse (cutting it: +0.84 ± 0.21). The pilot spent combo tutors fetching it.
- **Endurance** was mostly dead (cutting it: +1.12 ± 0.19). The bots win through the graveyard only about 1% of the time.
- **Force of Vigor** (cutting it: +0.78 ± 0.18).

## 3. How it maps to Marneus: equivalent roles, measured

"Measured" is the paired b4bots change in game won by T14, from `final_decomp`, unless stated otherwise.

| Marneus feature | Role it plays | Azusa v4 equivalent | Measured |
|---|---|---|---|
| Commander draws on token events | Engine commander | **Azusa: 3 land drops a turn.** Each land is mana plus landfall: Tracker clues, Provisioner Treasures, Nissa mana and digs, Oracle of Mul Daya, Field of the Dead zombies, Avenger plants. Quirion Ranger replays a Forest. | 17.7 landfall triggers per game. Per game: +1.69 mana, +1.45 cards. Per trigger: 0.096 mana, 0.082 cards (0.108 counting uncracked clues). Removing the 6 landfall-value creatures: **−1.71 ± 0.42** (goldfish by T10: −4.1). Quirion's Forest replay: +0.12 ± 0.08. |
| The table's actions feed it (Tithe, Tataru, Bowmasters) | Card flow that costs no turn | **Mind's Eye** | 1.16 cards per game. Cutting it: **−0.65 ± 0.22**, and the long-game rate drops from 31.3 to 28.8. Alternatives, all negative: Burgeoning −0.55 ± 0.18, Seedborn −0.53 ± 0.19, Lurking Predators −0.36 ± 0.19. |
| Several compact loops through the commander | Redundant combos | Ashaya + Elder; Ashaya + Ley Weaver; Elder + Wirewood Lodge (no Ashaya); Ashaya + Quirion with **Azusa as the untapped creature**; the **Azusa + Chasm + Crucible lock** | Share of wins: Elder 61%, Elder + Lodge 16%, Quirion + mana 15%, Craterhoof 3%. 21% of wins don't use Ashaya. Cost of cutting each piece (`draft3`): Ashaya −15.4, Elder −4.0, Ley Weaver −1.5, Lodge −1.5, Quirion −1.2. |
| 9 tutors chosen for the deck's resources | Consistency | **10 tutors.** Natural Order and Eldritch Evolution sacrifice a creature; Fauna Shaman discards one; Chord convokes; GSZ, Finale, Summoner's Pact, Archdruid's Charm, Invasion of Ikoria, Time of Need. Crop Rotation and Reclaimer sacrifice lands. | Adding an 11th (Shared Summons): **+1.19 ± 0.24**. Going to v2's 17: +0.51 ± 0.48. |
| Free counters and removal | An answer to everything | The answer and protection suite listed in §1, plus **Glacial Chasm**, fetched at instant speed with Crop Rotation | All 10 answer/protection cards swapped for Forests: **−0.74 ± 0.47** (light −1.44). Cutting Chasm + Crucible: **−1.03 ± 0.28**. Adding Force of Vigor back: +0.05 ± 0.19. |
| Grand Abolisher, Orim's Chant | Nobody can respond | Not in the list. The kills use activated abilities (which can't be countered), Destiny Spinner protects, and Ashaya is held until the winning turn. | Conqueror's Flail −0.10 ± 0.19. City of Solitude, Dosan and Defense Grid ≈ 0 (on v3). |
| 10 fast mana, 32 lands | Speed | **54 lands** + Sol Ring, Ancient Tomb, Utopia Sprawl, Wild Growth | Adding 4 fast mana for Forests: **−3.16 ± 0.30**. Adding 4 mana elves for Forests: −1.01 ± 0.30. Cutting Sol Ring + Ancient Tomb: −0.88 ± 0.23. |
| Cards doing double duty | Efficiency | Lands are mana, landfall and Chasm/Crop fuel. Chasm is a land and an answer. Elder is combo and untaps draw lands. Quirion is combo and replays Forests. Tracker and Nissa give cards and feed Ashaya. | as above |
| A value deck that can combo | Long game | Lands, Tracker, Mind's Eye, Sylvan Library, The One Ring, the Chasm lock | **P(game won by T14 \| nothing decided by T10): 32.9 / 35.6** (v2 22.7, v3 25.0). Light: 45.4 / 47.2 (v2 33.0). Harsh: 19.2 / 22.0 (v2 11.5). |

## 4. How it plays

**Turn by turn.** Goldfish median kill is T7. Against b4bots the table is dead by a median T11.
- **T1–T2:** a land, then Sol Ring, Utopia Sprawl, Wild Growth or Sylvan Library. Azusa on T2–T3. There are no mana elves, so keep hands with lands plus a plan card.
- **T3–T5:** three land drops a turn. Develop Tracker, Provisioner, Oracle, Nissa, Mind's Eye and The One Ring.
  - Tutor the missing piece in this order: Elder or Weaver, then Ashaya, then an outlet (Walking Ballista or Duskwatch).
  - **Keep Ashaya in hand** until the turn she wins.
  - Put Greaves or Boots on the creature you're showing.
- **Opponents' turns:** if an attack would be lethal, Crop Rotation into Glacial Chasm.
  - With Crucible out, let Chasm die at your upkeep, attack if you like, and replay it after combat. That keeps "prevent all damage to you" up on every opponent's turn without paying its upkeep.
  - Leave {1}–{3} open for Mind's Eye.
- **Kill turn:** Ashaya, then Elder or Weaver, for infinite mana. Finish with Ballista, Duskwatch digging, a draw land, Finale or Craterhoof.
  - Without Ashaya: Elder + Wirewood Lodge + Utopia Sprawl, Wild Growth or Jungle Basin.
  - With Ashaya but no Elder: Quirion + Azusa gives infinite landfall. With Provisioner or Nissa that becomes infinite mana; with Tracker, the whole deck in clues.

**The pilot's rules (the simulator's policy, measured):**
1. Mulligan: keep 7 with 2–5 lands, 3+ mana sources and a plan card or tutor. The first mulligan is free. 37% of hands are mulliganed, and none go to 5.
2. Every turn: make all land drops, keeping one for Chasm after combat. Remove stax. If a win is on, take it: protection first, Ashaya last.
3. Otherwise develop: Azusa, then the engine, then tutor the missing piece. Hold Ashaya.
4. If an opponent's combo piece is visible, answer it on our turn.
5. Don't hold mana up for answers; it measured −0.25 ± 0.14.
6. To recover, use Regrowth, Eternal Witness, Ikoria or Finale, or switch lines.

**Recovery:**
- Ashaya, Elder or Weaver is hit in 68.9% of b4bots games. v4 still wins 41.3% of all games, against 37.1% for v2 and 31.3% for v3.
- Lines that win after a piece is hit: Elder again 57%, Quirion + mana 20%, Elder + Lodge 12%, Craterhoof 5%.
- Because Ashaya is held, she is hit in only 1.4% of games.

## 5. Win lines and verification

Combos were checked by WebFetch on commanderspellbook.com (CSB). The CSB backend API was blocked (robots), so only the search and combo pages were read.

| Pieces | CSB id | Result |
|---|---|---|
| Ashaya + Argothian Elder | 539-3814 (verified in v3) | infinite mana |
| Ashaya + Ley Weaver | 539-1606 (verified in v3) | infinite mana |
| Elder + Wirewood Lodge + Wild Growth | 1399-2597-3814 (verified in v3) | infinite mana, no Ashaya |
| Elder + Jungle Basin + Wirewood Lodge | 783-1399-3814 (verified in v3) | infinite mana, no Ashaya |
| Ashaya + Quirion Ranger + a nontoken non-sick creature (Azusa qualifies) | 539-2900 | infinite ETB, landfall, LTB and storm |
| **Glacial Chasm + Azusa + Crucible of Worlds** | **2573-3946-4011** | prevent all damage to you (lock) |
| Glacial Chasm + Azusa + Ramunap Excavator | 3946-4011-4426 | same lock. Not in the list; measured +0.36 ± 0.21 |
| Glacial Chasm + Icetill Explorer | 3946-6850 | same lock (not in the list) |
| Glacial Chasm + Azusa + Life from the Loam | 2051-3946-4011 | same lock (not in the list) |

Our own analysis (not on CSB): the finishers once mana is infinite; Quirion + Ashaya with Provisioner or Nissa as infinite mana, or with Tracker as infinite clues; Crop Rotation fetching Chasm at instant speed (per its Forge text).

Lines removed from v3: the Springheart Nantuko loop (adding it back −0.65 ± 0.29); Tyvar + Devoted Druid (adding it at `draft2` −0.24 ± 0.29).

## 6. Curves and consistency (seed 1; seed 2 within 0.6)

**Goldfish, % of games with the table killed by each turn:**

| | T3 | T4 | T5 | T6 | T7 | T8 | T9 | T10 |
|---|---|---|---|---|---|---|---|---|
| v2 | 0.1 | 6.8 | 34.2 | 62.6 | 78.4 | 86.9 | 91.7 | 94.6 |
| v3 | 0.0 | 3.9 | 18.8 | 36.6 | 51.9 | 64.2 | 73.9 | 81.1 |
| v4 | 0.1 | 3.4 | 21.4 | 44.0 | 61.7 | 74.8 | 84.0 | 89.4 |

**b4bots, % of games won by each turn:**

| | T5 | T6 | T7 | T8 | T9 | T10 | T11 | T12 | T14 |
|---|---|---|---|---|---|---|---|---|---|
| v2 | 4.6 | 9.9 | 15.3 | 19.9 | 23.4 | 25.7 | 27.2 | 28.1 | 29.1 |
| v3 | 2.6 | 5.7 | 9.0 | 12.8 | 16.0 | 18.8 | 20.6 | 21.9 | 23.6 |
| v4 | 2.9 | 7.4 | 12.7 | 18.2 | 23.1 | 26.7 | 29.2 | 30.6 | 32.4 |

v2 is ahead through T9. v4 passes it at T10 and keeps pulling away.

**Consistency (goldfish):**

| | v2 | v3 | v4 |
|---|---|---|---|
| Kill-turn quartiles | 5/6/7 | 6/7/10 | 6/7/9 |
| No kill by T10 | 5.4 | 18.9 | 10.6 |
| Fewer than 4 lands at end of T4 | 13.6 | 19.4 | **5.8** |
| No green source by T2 | 2.2 | 4.1 | 2.9 |
| No kill by T10 despite a normal start | 4.9 | 15.4 | 10.1 |
| Mulligan rate | 26% | 37% | 37% |

## 7. Cost of each preference (paired, 8,000 games, seed 1)

Positive means the preference helps; negative means it costs.

| Preference | b4bots | Goldfish (kill by T6) | Light | Harsh |
|---|---|---|---|---|
| ~10 tutors: cost of not adding an 11th (Shared Summons) | −1.19 ± 0.24 | −1.1 | −1.24 | −0.38 |
| ~10 tutors: cost of not going to v2's 17 | −0.51 ± 0.48 | −4.7 | −1.44 | +1.20 |
| Lots of interaction: value of keeping the 10 answer/protection cards | **+0.74 ± 0.47** | −6.0 | +1.44 | +0.79 |
| Interaction at v3's level (+Force of Vigor, Endurance, Reclamation Sage) | −1.39 ± 0.32 | −3.9 | −1.94 | −1.26 |
| Landfall identity: value of keeping the 6 value creatures | **+1.71 ± 0.42** | −4.0 | +3.06 | +1.45 |
| Adding back the v3 Nantuko + Cobra loop | −0.65 ± 0.29 | −2.9 | −1.64 | −1.00 |
| No Dark Depths: effect of adding Depths + Thespian's Stage | −1.74 ± 0.22 | −3.9 | −2.38 | −1.07 |
| Fast mana: adding 4 pieces for Forests | −3.16 ± 0.30 | −5.8 | −4.20 | −2.12 |

So ju's preferences now cost about 1.2 points, all of it from the 10-tutor cap. Interaction and the landfall identity are net positive in v4. In v3 the tutor cap cost −4.6 and interaction −1.9.

## 8. The seven design questions

1. **Azusa as the engine.** In the Forge card scripts, the only mono-green or colourless cards that turn a land drop into a card are Tireless Tracker, Seer's Sundial, the play-from-top creatures (Oracle, Courser, Augur), and landfall token makers plus Skullclamp. All measured flat or negative except Tracker and Oracle (Sundial +0.15 ± 0.22; Skullclamp + Scute Swarm +0.15 ± 0.27; Courser −0.61 at `draft0`). What does pay is more lands: Azusa's engine is her land count, not card draw per trigger.
2. **The table powers it.** Green's options are Burgeoning, Mind's Eye, Lurking Predators, Seedborn Muse, Runic Armasaur and Pendant of Prosperity. Only Mind's Eye pays (+0.65). Green gets about 1 card a game from the table; Marneus gets many.
3. **Compact loops:** 4 infinite lines plus the Chasm lock. Azusa is a piece of both the Quirion line and the lock.
4. **Tutors that use the deck's own resources:** see §3. Measured as additions at `draft0`, all flat or negative: Birthing Pod −0.18; Survival −0.07; Formidable Speaker −0.35; Celestial Reunion −0.06; Sylvan Scrying −0.62.
5. **Free and cheap interaction.** Under honest fog rules (a fogged board attacks again next round), two fogs measured −0.69; under v3's more generous rules, +0.34 ± 0.27. The Chasm lock covers the same wide and big-threat wins every turn (+1.03). Force of Vigor, Endurance and the "nobody responds" cards measured between −1.1 and +0.05. Kept: a lean suite that is net positive.
6. **Fast mana:** negative everywhere. Four pieces cost 3.2 (b4bots), 4.2 (light), 2.1 (harsh) and 5.8 in goldfish kill by T6. Sol Ring and Ancient Tomb are worth keeping (+0.88). Trading mana elves for Forests gained +1.0. −4 Forests +4 draw cost 1.4, and −8 Forests +8 fast mana cost 5.6 (both on `draft2`).
7. **Long game:** see §3's last row and §4's recovery numbers.

## 9. Answer coverage (shares are b4bots opponent wins against v4)

| Opponent threat (share of their wins) | v4 answers | 2 or more? |
|---|---|---|
| Wide / tokens attacking (27%) | Glacial Chasm (Crop Rotation, Crucible lock), Beast Within | yes, through one card and its enablers |
| Big threat (25%) | Beast Within, Ram Through, Archdruid's Charm, Chasm | yes (weak against hexproof) |
| Enchantment combo (20%) | Nature's Claim, Boseiju, Beast Within, Charm; Chasm against Impact Tremors | yes |
| Creature combo (10%) | Beast Within, Ram Through, Charm; Chasm against haste | yes |
| Artifact combo (7%) | Nature's Claim, Boseiju, Beast Within, Charm; Chasm against Aetherflux | yes |
| Lands, e.g. Marit Lage (5%) | Boseiju, Ghost Quarter, Beast Within, Chasm | yes |
| Spells / Thassa's Oracle (5%) | none | **no**: race it |
| Graveyard (1%) | none dedicated | **no**: Endurance cost 1.1 to keep |
| Counters on us | Veil of Summer, Destiny Spinner; the kills are activated abilities | yes |
| Board wipes | Heroic Intervention, Tamiyo's Safekeeping, Yavimaya Hollow, Ashaya held | yes |
| Spot removal | Snakeskin Veil, Tamiyo's, Veil, Greaves, Boots, Sylvan Safekeeper, Hollow, backup lines | yes |
| Stax | the answers above | yes |

Opponent attempts stopped: 0.16 per game on our turn and 0.164 on theirs. The Chasm stops 0.066 per game and Crop Rotation → Chasm another 0.07.

## 10. External calibration

**Game engine** (ju's Mac, 10,800 paired games per list, against 3 random B4 bots; an average seat wins 25%):

| List | Engine win rate | Median win round |
|---|---|---|
| Repo Azusa (Dark Depths) | 16.3% ± 0.4 | 10 |
| v2 | 24.2% ± 0.4 | 7 |
| v3 | 18.5% ± 0.4 | 8 |

- The engine's v3 − v2 gap is −5.7 ± 0.5. This simulator gives −5.5 (b4bots, game won by T14), and the v3 simulator gave −5.76.
- **Prediction, not a measurement:** if the simulator's +3.2 gap over v2 carries over, v4 lands around 27% in the engine. The bar to beat is v2's 24.2%.
- Caveat: v4's structure (54 lands, no elves) is further from the calibrated lists than v2 or v3 were, so it needs an engine run before it counts as proven. The Mac engine search the same evening (one-card swaps into v2) found Lotus Cobra −1.0, Endurance −1.0 and Quirion Ranger −0.9 as adds, and Avenger of Zendikar +1.2; its best combined list (v2 + Avenger, Tracker, Nissa, Field of the Dead; − Devoted Druid, Birthing Pod, Priest of Titania, a Forest) reached 26.1% vs 24.2%.

**ju's analyzer tool:** it reads v3 as "T8 average", consistent with our goldfish T7 median and 6–10 quartiles. For v4, expect 54 lands, about 2–4 fast-mana sources, 6 Game Changers and about 12 tutors. Marneus reads as B5 there mainly through 10 fast mana and 13 Game Changers; v4 is far from both.

## 11. Bracket and Game Changers

- Goldfish kill by T3: 0.1% on both seeds (limit 5%). Kill by T4: 3.4 / 3.2%.
- **6 Game Changers** (playgroup.gg list updated 11 Oct 2026): Ancient Tomb, Crop Rotation, Field of the Dead, Glacial Chasm, Natural Order, The One Ring.
- No hard stax, no mass land destruction, no copied cEDH shell. The Chasm lock only protects us. Mention it, and the infinite lines, in the pre-game talk.

## 12. Price

**948.75 USD ≈ 806.44 €** (USD × 0.85), from prices-v4.csv. All 71 rows are priced.
- Most rows are copied from the v3 and v2 price files, which carry their own sources (MTGGoldfish, and the project's earlier Scryfall-bulk/TCGplayer file). Dates run 2026-09-29 to 2026-10-12.
- New MTGGoldfish lookups (WebFetch, 2026-10-12): Glacial Chasm $18.00 (Ice Age); Mind's Eye $5.00 (Mirrodin; the Marvel "Panther Idol" printing was skipped); Crucible of Worlds $28.00 (Secret Lair Dwarf Fortress; M19 is $33).
- Most expensive: Ancient Tomb $118.68, The One Ring $111.66, Yavimaya Hollow $86.17, Badgermole Cub $51.99, Boseiju $48.85.
- Cardmarket and Scryfall live lookups were blocked, so the € figures are estimates. Check them on Cardmarket.
- About 1,190 € of the budget is unused. Gaea's Cradle measured only +0.14 ± 0.15.

## 13. Model changes and new assumptions (V4_NOTES in the simulator)

1. **Glacial Chasm.** It enters by sacrificing a land, and our creatures can't attack while it's out. Without a graveyard-land enabler it is kept for 2 upkeeps, then sacrificed. With Crucible, Ramunap, Icetill or Greenwarden it is replayed after combat every turn. It stops damage wins with a per-category chance (wide 1.0, big threat 0.9, creature 0.6, land 1.0, artifact 0.5, enchantment 0.25, graveyard 0.3, spell 0), times a general 0.85 chance that an answer works. **Bots never destroy Chasm in this model.** Much of its value depends on that, so verify it in the engine.
2. **Fogs** stop combat wins, but the same board attacks again next round. The alternative rules (`fog_repeat=0`) are reported separately.
3. **"Nobody responds" cards:** Conqueror's Flail (2 to cast + 2 to equip), City of Solitude, Dosan, and Defense Grid (opponents' open mana × 0.4).
4. **Burgeoning works on opponents' turns.** The chance an opponent plays a land each turn: 0.9 (T1–4), 0.75 (T5–7), 0.55 (T8+).
5. **Table-powered cards:** Seedborn Muse gives full untapped mana on opponents' turns; Mind's Eye one draw per opponent per turn; Lurking Predators 2 spells per opponent per turn.
6. Quirion Ranger and Scryb Ranger replay a Forest at end of turn.
7. Any land in the graveyard can be replayed when a graveyard-land enabler is out.
8. Skullclamp works on any 1/1 token. Sporemound and Elfsworn Giant were added as token makers.
9. Gemstone Caverns is colourless, since we are on the play.
10. Opponents' land drops use separate seeded random generators, so paired comparisons stay paired.
11. A crash in `sac_worst_land` was fixed. The early screens (`screen1`–`screen3`) ran on intermediate simulator versions; every headline and decomposition number comes from the final one.
12. Unchanged from v3: opponent win categories and clocks, removal, counters, wipes, stax, chump blockers, no politics, our tokens never block.
13. Selection bias: v4 was chosen on seed 1, and seed 2 replicates the result (32.9 vs 32.4).

## 14. Engine coverage

At repo commit 0b885c2, 24 of the deck's 71 distinct names have no engine definition, including 5 new cards: Glacial Chasm, Mind's Eye, Crucible of Worlds, Time of Need and Invasion of Ikoria. The full list is in missing-from-engine-v4.txt. ju's Mac branch (claude/azusa-engine-bench, PR #48) already has the v2 and v3 cards, so only the new ones need checking there.

## 15. Heavy runs

`bash run_heavy.sh NPROC [GAMES=100000] [ABL_GAMES=40000]` runs v2, v3 and v4 × 2 seeds × all four removal models, plus the `final_decomp` and `final_tests` ablations. Results don't depend on the number of processes, and it works with macOS's process start method. Local runs here used 20,000 games (headlines) and 8,000 (ablations). Effects within ±0.2–0.5 need about 40,000 paired games for a standard error near 0.1.

## 16. Open questions for ju

1. Add Shared Summons as an 11th tutor (+1.2)? The analyzer would then count 13.
2. Are 54 lands OK? It fits "looks like just lands", but the analyzer may flag it.
3. Run v4 in the engine. The 5 new cards need definitions. Also check whether bots leave Glacial Chasm alone; the Azusa bot runs Strip Mine and Ghost Quarter.
4. Accept the gaps: no answer to Thassa's Oracle or graveyard wins (about 6% of bot wins)?
5. Keep Force of Vigor as a flex slot (+0.05 ± 0.19)?
6. Check the prices on Cardmarket.

## 17. Reproduce

```
cd /mnt/project-files/miku-deck/azusa/b4/v4
bash runs/local_all.sh 4
python3 azusa_b4_sim_v4.py --list decklist-v4.txt --games 20000 --seed 1 --removal b4bots --turns 14 --hold-ashaya --procs 4
python3 azusa_ablation_v4.py --base decklist-v4.txt --spec ablation/spec_final_decomp.txt --games 8000 --seed 1 --removal b4bots --flags hold_ashaya
python3 check_engine_v4.py decklist-v4.txt /home/claude/mtgpractice
python3 build_prices_v4.py
```
