# Public high-power lists — Child of Alara, Brago, Shalai (+ Trostani)

Pass 2, collected 2026-10-08. Every URL below was accessed 2026-10-08.

Full card lists are in `work/lists/<commander>-<source>-<shortid>.txt` ("1 Card Name", commander on line 1, metadata in `#` lines at the end). Card frequencies are in `work/lists/<commander>-frequency.tsv` (card, count, lists, is_land), plus `selesnya-combined-frequency.tsv` (Shalai + Trostani).

## How this was collected

- **Moxfield.** `curl` to `api2.moxfield.com` returns a Cloudflare 403, whatever the headers. The same endpoints answer inside the Claude Browser pane, so search and deck JSON were fetched there with `fetch()`. Search: `https://api2.moxfield.com/v2/decks/search?pageNumber=1&pageSize=50&sortType=views&sortDirection=Descending&fmt=commander&commanderCardId=<id>`. The ids come from `https://api2.moxfield.com/v2/cards/search?q=!"<name>"`: Brago `kXl6G`, Child of Alara `2zNPd`, Shalai `Q93pp`, Trostani `kOjy0` (uniqueCardId does not work). Decks: `https://api2.moxfield.com/v3/decks/all/<publicId>`. The top 100 lists by views were screened, keeping only those Moxfield rates bracket 4 or 5. From those I took the strongest recent ones and every primer.
- **Archidekt.** Search with `https://archidekt.com/api/decks/v3/?commanderName=<name>&orderBy=-viewCount&pageSize=12&edhBracket=<4|5>`; the `edhBracket` filter works. Decks come from `https://archidekt.com/api/decks/<id>/`. `commanderName` also matches decks where the card only sits in the 99, so each deck's commander was re-checked.
- **EDHREC.** Average decks from `https://json.edhrec.com/pages/average-decks/<slug>/{cedh,optimized}.json`; commander pages are also fetched. All save dates fall after the 2024-09-23 ban (earliest 2024-10-10).
- **cEDH Decklist Database.** The site is JS-only. Its data is in `https://raw.githubusercontent.com/AverageDragon/cEDH-Decklist-Database/master/_data/database.json` (137 entries), which has **no entry for Brago, Child of Alara, Shalai or Trostani**, current or deprecated. The only five-color entries are Esper/Terra (competitive, 2025-07-20), Scion of the Ur-Dragon (brew) and Esika (deprecated). None is Child, so none was used.
- **Lead from STATUS.md:** the playgroup.gg Brago stax list (`https://playgroup.gg/profiles/32485-milkmanproxies/decks/149392-suck-my-stax-10-pl/cards`, updated 2026-06-24) was fetched and **discarded**: it runs Mana Crypt and Jeweled Lotus.
- **Game Changers:** counted against Scryfall `is:gamechanger` (`https://api.scryfall.com/cards/search?q=is:gamechanger`, 53 cards on 2026-10-08), never guessed. **Lands:** cards whose front face is a Land, from Scryfall `cards/collection` type lines; modal DFCs with a land back face are counted separately as "+N MDFC". **Brackets:** what the author set on Moxfield or Archidekt; Moxfield's own "auto" bracket is shown where it differs.
- **Ban check:** every list was screened for Mana Crypt, Jeweled Lotus, Dockside Extortionist and Nadu.
- **Win lines:** read from the cards in each list. Two-card and three-card claims were spot-checked on Commander Spellbook (`https://backend.commanderspellbook.com/variants/?q=...`); full line checks are a separate step (STATUS step 4).

---

## 1. Brago, King Eternal (WU)

10 kept, 2 discarded.

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC | Main win lines | What it teaches |
|---|---|---|---|---|---|---|---|---|---|
| brago-moxfield-n2D5k8 | https://moxfield.com/decks/n2D5k8ZMCESnAZv8AnzblQ | Kingdom Come, cEDH PRIMER / Not_me | 2026-10-07 | 5 (auto 4) | kept | 30 | 15 | Displacer Kitten + Teferi, Time Raveler + a rock (Mana Vault, Grim Monolith, Mox Opal, Sol Ring) for infinite draw and mana (CSB 1170-2364-4761 and siblings); stax lock with Stasis/Winter Orb reset by Brago | The modern cEDH Brago: about 30 lands, 15 GCs, a full counter suite, Kitten/T3feri as the combo, and Brago blinking stax pieces (Archon of Emeria, Drannith, GAA4) and rocks. Most current list (updated the day before access). |
| brago-moxfield-ZbcmXJ | https://moxfield.com/decks/ZbcmXJAAJEOGa74HK_52FQ | cEDH - Brago, Blink Eternal / Lazaro46 | 2026-08-30 | 5 (auto 4) | kept | 27 (+3 MDFC) | 12 | Kitten + T3feri + rock; artifact tutor chain (Whir of Invention, Transmute Artifact, Tezzeret the Seeker, Urza's Saga) | Leaner and lower to the ground: 27 lands plus 3 MDFCs, free counters, Gilded Drake/Mirrormade tricks. Less hard stax than Kingdom Come. |
| brago-moxfield-d7FdCq | https://moxfield.com/decks/d7FdCq_8gkKlAvKsM1PWrg | Brago Stax [Primer] / ClydeBankston | 2026-01-14 | 5 (auto 4) | kept | 26 (+2 MDFC) | 13 | Kitten + T3feri + rock; prison (Cursed Totem, Damping Sphere, Rest in Peace, Linvala) | The long-running "Brago Stax" primer (the same author's 2019 Archidekt version has 40k views), updated after the ban. Shows the stax pieces Brago reuses. |
| brago-moxfield-M--H_E | https://moxfield.com/decks/M--H_Et5-Eu6faglZHBK8A | fringe slop flicker - Brago cEDH / eldengoon | 2026-08-11 | 5 (auto 4) | kept | 26 (+2 MDFC) | 12 | Kitten + T3feri + rock, with Thassa's Oracle and Walking Ballista as finishers | The only Brago list with Thassa's Oracle. Shows how the combo turns into a win: infinite draw into Oracle, or infinite mana into Ballista. |
| brago-moxfield-hP0z_z | https://moxfield.com/decks/hP0z_zZvxUO0IM02rQYptw | [Primer] Blink and You'll Miss It / Hydrax | 2026-10-04 | 4 (auto 4) | kept | 35 (+2 MDFC) | 4 | Peregrine Drake + Deadeye Navigator (CSB 1409-3821) for infinite mana; Thassa, Deep-Dwelling / Teleportation Circle value; Brago combat | The most-viewed Brago deck (82k views): a true Bracket 4 value-blink list with few GCs and a 35-land base. A good template for "strong, not cEDH". |
| brago-moxfield-cTn_eq | https://moxfield.com/decks/cTn_eqq220ukrVWmGkzyFQ | Miku, Blink Queen [PRIMER] / Juice_Vol | 2026-08-25 | 4 (auto 4) | kept | 36 | 9 | Blink value; Peregrine Drake and Strionic Resonator for big mana; no closed 2–3 card infinite found in the list (Venser is absent, so the Drake + Venser lines don't apply) | A Bracket 4 Miku list with fast mana (Chrome Mox, Grim Monolith, Mana Vault, Ancient Tomb) and protection, but it wins through value. |
| brago-archidekt-8427551 | https://archidekt.com/decks/8427551 | [4] Brago, King Eternal / malvagio | 2026-10-05 | 4 | kept | 33 (+1 MDFC) | 9 | Peregrine Drake + Deadeye Navigator; Armageddon with Brago blinking rocks | A Bracket 4 hybrid: blink value, plus Armageddon and T3feri/Narset hate. |
| brago-archidekt-13491907 | https://archidekt.com/decks/13491907 | Hatsune Miku CEDH / agentjester750 | 2025-07-19 | 5 | kept | 27 | 12 | Peregrine Drake + Deadeye Navigator or + Eldrazi Displacer; Helm of Obedience + Rest in Peace; Approach of the Second Sun; Time Warp | A combo-dense alternative to Kitten: several independent infinite-mana engines. |
| brago-edhrec-avg-cedh | https://edhrec.com/average-decks/brago-king-eternal/cedh | EDHREC average, cEDH (132 decks) | saves 2024-11-15 to 2026-10-05 | 5 | kept | 29 (+1 MDFC) | 16 | Kitten + T3feri + rock (Peregrine Drake and Archaeomancer are present, but there is no Ghostly Flicker/Deadeye to close a Drake loop) | The consensus cEDH 99 after the ban. |
| brago-edhrec-avg-optimized | https://edhrec.com/average-decks/brago-king-eternal/optimized | EDHREC average, Optimized (1,089 decks) | saves 2024-11-26 to 2026-10-07 | 4 | kept | 34 (+1 MDFC) | 7 | Peregrine Drake + Deadeye Navigator, or + Ghostly Flicker + Archaeomancer, or + Venser + Panharmonicon/Starfield Vocalist; Kitten + T3feri | The consensus Bracket 4 Brago: more lands, fewer GCs, more blink creatures, and both combo families. |
| brago-moxfield-ywjZih | https://moxfield.com/decks/ywjZih5sFEiLnZA_uEDiaQ | Brago Stax [cEDH] / MGT | 2020-08-01 | 5 | **DISCARDED: Mana Crypt** | 32 | 11 | — | Pre-ban; not updated since 2020. |
| brago-playgroup-149392 | https://playgroup.gg/profiles/32485-milkmanproxies/decks/149392-suck-my-stax-10-pl/cards | Suck My Stax (10 PL) / MilkManProxies | 2026-06-24 | "10 PL" | **DISCARDED: Mana Crypt and Jeweled Lotus** | 28 | 12 | (Kitten, Isochron Scepter, Thassa's Oracle present) | The STATUS.md lead. Banned cards are still in the list despite a 2026 update date. |

**Most common non-land cards** (10 kept lists): Arcane Signet 10, Cyclonic Rift 10, Enlightened Tutor 10, Fierce Guardianship 10, Sol Ring 10, Swords to Plowshares 10, Aether Channeler 9, Lightning Greaves 9, Mana Vault 9, Mystic Remora 9, Omen of the Sea 9, Strionic Resonator 9, Swan Song 9, Talisman of Progress 9, Tribute Mage 9; then An Offer You Can't Refuse, Force of Will, Recruiter of the Guard, Teferi, Time Raveler, Trinket Mage 8; Azorius Signet, Ephemerate, Esper Sentinel, Fellwar Stone, Mana Drain, Path to Exile, Peter Parker's Camera, Rhystic Study, Venser, Shaper Savant 7.
**Most common lands:** Command Tower, Hallowed Fountain and Sea of Clouds 10; Otawara 8; Adarkar Wastes, Ancient Tomb and Flooded Strand 7.

**Archetypes:**
1. **cEDH Kitten-stax** (Kingdom Come, Blink Eternal, Brago Stax, fringe slop, EDHREC cEDH): 26–30 lands, 12–16 GCs, wins with Displacer Kitten + Teferi, Time Raveler + a mana rock; Brago resets stax pieces and rocks.
2. **Bracket 4 value blink** (Blink and You'll Miss It, Blink Queen, [4] Brago, EDHREC Optimized): 33–36 lands, 4–9 GCs, ETB creatures (Aether Channeler, Tribute Mage, Trinket Mage, Recruiter), and Peregrine Drake + Deadeye Navigator/Archaeomancer as the infinite.
3. **Multi-engine combo** (Hatsune Miku CEDH): Drake loops, Helm of Obedience + Rest in Peace, Approach of the Second Sun.

---

## 2. Child of Alara (WUBRG, colors-only target)

9 kept, 1 discarded. Two kinds of list exist:
- cEDH five-color shells where Child is only the color identity.
- Self-labeled Bracket 4 lists that cast Child as a board wipe.

For the colors-only plan, the cEDH shells and the EDHREC cEDH average are the relevant ones.

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC | Main win lines | What it teaches |
|---|---|---|---|---|---|---|---|---|---|
| child-of-alara-moxfield-lGdVhD | https://moxfield.com/decks/lGdVhDcJzkCddkma6tToag | Sans White with White. / MooligansTomi | 2026-04-07 | 5 (auto 4) | kept | 26 | 20 | Thassa's Oracle + Tainted Pact; Ad Nauseam; Underworld Breach + Lion's Eye Diamond + Brain Freeze; Final Fortune/Last Chance wheels; Mnemonic Betrayal | A pure colors-only turbo shell: 26 lands, rituals, every tutor. This is what Child as a colors-only commander becomes at cEDH, and it is far above a high Bracket 4. |
| child-of-alara-moxfield-11Y4nD | https://moxfield.com/decks/11Y4nDA6zku7QAhn5LLLPQ | Child of Alara / noah_33 | 2026-09-05 | 5 (auto 4) | kept | 34 | 20 | Underworld Breach / Necropotence / Sevinne's Reclamation engine with stax (Cursed Totem, Damping Sphere, Drannith); no Thassa's Oracle and no closed combo identified from the list alone (flag for STATUS step 4) | A "control" colors-only build with dual lands and a heavy tutor suite. Shows the five-color interaction package (Force of Will, Pact of Negation, Silence, Flusterstorm, Mindbreak Trap). |
| child-of-alara-moxfield-IYUM_c | https://moxfield.com/decks/IYUM_cHxV0W3S6bUu5QTmA | Alara Upgraded v9.05 (OCT-2024) / GrevenAndy1 | 2025-04-18 | 5 (auto 4) | kept | 34 | 19 | Breach + LED + Brain Freeze; reanimator (Entomb, Reanimate, Animate Dead, Necromancy) into Atraxa; Mnemonic Betrayal; Omniscience | A post-ban update (titled October 2024) of a long-running list. Reanimator and Breach toolbox. |
| child-of-alara-moxfield-Ba1nFY | https://moxfield.com/decks/Ba1nFYEBY0mggeRj6mJjbA | Draw the Game / dwessell2 | 2025-11-21 | 4 (auto 4) | kept | 33 | 16 | Worldgorger Dragon + Animate Dead (CSB 4812-4846, infinite mana and ETB); Breach; Lich's Mirror/Platinum Angel/Divine Intervention lock pieces | A Bracket 4 label on a 16-GC list. Child is played as a wipe engine alongside a compact reanimator combo. |
| child-of-alara-moxfield-JpT6ND | https://moxfield.com/decks/JpT6ND95jkyjIe4a7jzSCw | Miku, Child of Song / OrangeCube0116 | 2026-08-20 | 4 (auto 4) | kept | 42 | 9 | Lands-matter ramp; Darksteel Forge/Avacyn + Child dying or Armageddon; Glacial Chasm; Ulamog | The most-viewed Miku-named Child list (9.6k views). Value ramp, not combo; a 42-land five-color base. |
| child-of-alara-archidekt-13837312 | https://archidekt.com/decks/13837312 | Child of alara optimizd lv 4, Boom! / TheArchaonOfChaos | 2026-10-03 | 4 | kept | 34 | 7 | Indestructible artifact board (Darksteel Forge, Encroaching Mycosynth) + Child/Jokulhaups/Worldfire resets; Platinum Angel | Casts Child for a one-sided wipe. Shows the opposite of colors-only. |
| child-of-alara-archidekt-26039177 | https://archidekt.com/decks/26039177 | Miku Bracket 4 / Megabotto | 2026-10-01 | 4 | kept | 29 | 6 | Archangel of Thune + Spike Feeder; Bolas's Citadel; Underworld Breach; Armageddon | Five-color goodstuff with the other Miku commanders in the 99 (Shalai, Trostani, Vorinclex, Giada). A mid-power reference. |
| child-of-alara-edhrec-avg-cedh | https://edhrec.com/average-decks/child-of-alara/cedh | EDHREC average, cEDH (40 decks) | saves 2024-10-10 to 2026-10-03 | 5 | kept | 40 (the aggregate includes basics) | 24 | Thassa's Oracle (no Demonic Consultation or Tainted Pact in the average 99); Breach + Brain Freeze; Teferi, Time Raveler; Armageddon | The consensus colors-only cEDH core: tutors, fast mana, dual lands, Oracle and Breach. |
| child-of-alara-edhrec-avg-optimized | https://edhrec.com/average-decks/child-of-alara/optimized | EDHREC average, Optimized (423 decks) | saves 2024-11-05 to 2026-10-07 | 4 | kept | 39 | 10 | Gates / Maze's End; Avacyn + Child; ramp | Shows that most "Optimized" Child decks are the casual Gates archetype, not a high-power colors-only deck. |
| child-of-alara-moxfield-dQ1i-G | https://moxfield.com/decks/dQ1i-GmPb0y_dW6wNQOQ8g | cEDH - Child of Alara (2011-2009) / Paramount_Elite | 2020-08-13 | 5 | **DISCARDED: Mana Crypt** | 38 | 13 | (enchantress / extra turns) | Pre-ban; not updated since 2020. |

**Most common non-land cards** (9 kept lists): Sol Ring 9, Mystical Tutor 8, Smothering Tithe 8, Vampiric Tutor 8, Arcane Signet 7, Demonic Tutor 7, Rhystic Study 7, The One Ring 7, Enlightened Tutor 6, Imperial Seal 6, Underworld Breach 6, Chromatic Lantern 5, Cyclonic Rift 5, Dark Ritual 5, Mystic Remora 5; then Silence and Swan Song 5; Armageddon, Birds of Paradise, Chrome Mox, Crop Rotation, Culling Ritual, Esper Sentinel, Eternal Witness, Exploration, Farseek, Flusterstorm, Force of Will, Lotus Petal and Mental Misstep 4.
**Most common lands:** Command Tower 9; Gemstone Caverns and Polluted Delta 6; Ancient Tomb, Badlands, Bayou, Boseiju, City of Brass, High Market and Mana Confluence 5.

**Archetypes:**
1. **Colors-only cEDH turbo / Breach** (Sans White, EDHREC cEDH): Thassa's Oracle + Tainted Pact, Ad Nauseam, Breach + LED + Brain Freeze; 26–34 lands, about 20 GCs. Clearly Bracket 5.
2. **Colors-only control / reanimator** (noah_33, Alara Upgraded): Breach, Necropotence and reanimation with heavy free interaction; about 20 GCs.
3. **Child-as-wipe Bracket 4** (Draw the Game, Boom!, Miku Child of Song): indestructible or lock pieces, then a wipe with Child or Armageddon; 6–16 GCs.
4. **Casual Gates/lands** (EDHREC Optimized): not relevant to high Bracket 4.

No public list matches "colors-only, high Bracket 4, not cEDH". That build has to be scaled down from archetypes 1–2. Coalition Victory, the Child-specific closer named in commanders.md, appears in **none** of the 9 kept lists.

---

## 3. Shalai, Voice of Plenty (GW)

7 lists kept and counted; the EDHREC cEDH average is kept but not counted (duplicate); 1 discarded on disk, 1 more discarded at screening.

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC | Main win lines | What it teaches |
|---|---|---|---|---|---|---|---|---|---|
| shalai-moxfield-of28bO | https://moxfield.com/decks/of28bO9hPE2lN4UDi1PCtg | angels v4 cedh? / killer007k2 | 2026-04-29 | 5 (auto 4) | kept | 35 | 8 | Devoted Druid + Vizier of Remedies (infinite G, then Shalai's ability); Heliod + Walking Ballista; Archangel of Thune + Spike Feeder; Selvala | The fullest list of green-white creature combos under Shalai's hexproof. Angel package plus Armageddon. |
| shalai-moxfield-UodV4Y | https://moxfield.com/decks/UodV4YLerEmS7-42rIgA5Q | Selesnya cedh idk / moosemoose | 2024-10-26 | 5 (auto 4) | kept | 31 | 10 | Heliod + Walking Ballista; Birthing Pod / Eldritch Evolution chains; Knowledge Pool lock; Glacial Chasm | Post-ban (one month after). Fast mana (Chrome Mox, Mox Diamond, Mana Vault, Lotus Petal, Elvish Spirit Guide) on a green-white dork base. |
| shalai-moxfield-Ssl9sg | https://moxfield.com/decks/Ssl9sgdAHESBxWLiktKZWg | Shalai Stax by SonaVick / sonavick | 2025-02-12 | 4 (auto 4) | kept | 26 (+2 MDFC) | 8 | Hatebear stax (Null Rod, Root Maze, Rule of Law, Sanctum Prelate, Thalia) and combat; Devoted Druid present without Vizier; Concordant Crossroads, Kamahl, Yisan | Shalai as a protector of hatebears; 26 lands plus dorks, Gaea's Cradle. |
| shalai-moxfield-3rvLmv | https://moxfield.com/decks/3rvLmvsbfES7I6n6Fj3FIQ | Can't Touch This (PL:8) / younghan | 2026-07-07 | 4 (auto 4) | kept | 35 (+1 MDFC) | 8 | Angels beats; Archangel of Thune + Spike Feeder; Tooth and Nail; Platinum Angel | Bracket 4 angel pillowfort: Avacyn, Sigardas, Lyra, Gavony Township. |
| shalai-moxfield-_P7Txb | https://moxfield.com/decks/_P7TxbJsNUqwQbbL57BEJg | Shalai Pillowfort (B:4) / BuildsByConnolly | 2026-10-04 | 4 (auto 4) | kept | 34 (+1 MDFC) | 4 | Enchantress pillowfort (Sphere of Safety, Ghostly Prison) and Gavony/Nykthos beats; no infinite | A low-GC enchantress style. Useful mainly for its protection suite (Angel's Grace, Flawless Maneuver, Heroic Intervention, Teferi's Protection). |
| shalai-archidekt-21015429 | https://archidekt.com/decks/21015429 | GW Oops! All Combos / Spadowski | 2026-09-08 | 4 | kept | 37 (+1 MDFC) | 8 | Devoted Druid + Vizier; Heliod + Ballista; Heliod + Spike Feeder; Gavony | A Bracket 4 combo-dense green-white toolbox with Stoneforge, Skullclamp, Tireless Tracker. |
| shalai-archidekt-26388397 | https://archidekt.com/decks/26388397 | Shalai Combo / DoctorFireFarts | 2026-10-01 | 4 | kept | 30 (+6 MDFC) | 7 | Devoted Druid + Vizier; Walking Ballista; Birthing Pod / GSZ into Craterhoof; Staff of Domination | Pod/creature-tutor chains with hatebears (Thalias, Drannith, Grand Abolisher). |
| shalai-edhrec-avg-optimized | https://edhrec.com/average-decks/shalai-voice-of-plenty/optimized | EDHREC average, Optimized (26 decks) | saves 2025-04-10 to 2026-10-06 | 4 | kept | 35 (+1 MDFC) | 8 | Angels + counters; Heliod + Ballista; Archangel of Thune | The consensus Bracket 4 Shalai: angels, protection, Great Henge. |
| shalai-edhrec-avg-cedh | https://edhrec.com/average-decks/shalai-voice-of-plenty/cedh | EDHREC average, cEDH (2 decks) | saves 2024-10-26, 2026-04-29 | 5 | kept on disk, **not counted** | 34 | 7 | Heliod + Ballista; Druid + Vizier | Built from only 2 decks, matching UodV4Y and of28bO by date. Excluded from frequency to avoid double counting. |
| shalai-moxfield-ME-zgo | https://moxfield.com/decks/ME-zgoCa5kq9c8jCsd4UMg | Shalai - Hex Hex Stax Stax [cEDH] / EngineNo9 | 2023-11-07 | 5 | **DISCARDED: Mana Crypt and Jeweled Lotus** | 30 | 6 | (Druid + Craterhoof stax) | Pre-ban primer. |
| (screened only) | https://moxfield.com/decks/ZQlyVIx0r0Od4CvcnoOmKw | Shalai cEDH / willsimaao | 2021-12-09 | 5 | **DISCARDED: Mana Crypt** (list not saved) | — | — | — | — |

**Most common non-land cards** (7 lists + EDHREC Optimized = 8): Eladamri's Call 8, Enlightened Tutor 8, Sol Ring 8, Worldly Tutor 8, Birds of Paradise 7, Esper Sentinel 7, Arcane Signet 6, Finale of Devastation 6, Grand Abolisher 6, Swords to Plowshares 6, Sylvan Library 6, Teferi's Protection 6, Archivist of Oghma 5, Aura Shards 5, Avacyn's Pilgrim 5; then Chord of Calling, Drannith Magistrate, Elvish Mystic, Eternal Witness, Green Sun's Zenith, Heroic Intervention, Linvala, Keeper of Silence, Mother of Runes, Ranger-Captain of Eos, Sigarda, Font of Blessings, Smothering Tithe and Walking Ballista 5.
**Most common lands:** Temple Garden and Windswept Heath 8; Command Tower, Forest and Plains 7; Boseiju, Bountiful Promenade, Branchloft Pathway and Cavern of Souls 6.

**Archetypes:**
1. **Green-white creature combo toolbox** (angels v4, Oops! All Combos, Shalai Combo, Selesnya cedh): Devoted Druid + Vizier of Remedies, Heliod + Walking Ballista, Archangel of Thune + Spike Feeder, found by Eladamri's Call, Chord, GSZ, Finale, Pod and Worldly Tutor; 30–37 lands, 7–10 GCs.
2. **Hatebear stax** (SonaVick): Null Rod, Root Maze, Thalia, Drannith, dorks and Cradle; wins by combat.
3. **Angel / enchantress pillowfort** (Can't Touch This, Pillowfort, EDHREC Optimized): Avacyn, Sigarda, Lyra, protection spells; wins by combat and Gavony.

---

## 4. Trostani, Selesnya's Voice (GW; same 99 as Shalai)

4 lists kept and counted; the EDHREC cEDH average is kept but not counted (too few, low-quality decks); 0 discarded. No high-power Trostani list exists. Moxfield's bracket-4/5 top 100 is precon upgrades and token/lifegain decks, and EDHREC's "cEDH" average comes from 3 decks with Fog/Pacifism/Overrun.

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC | Main win lines | What it teaches |
|---|---|---|---|---|---|---|---|---|---|
| trostani-moxfield-OMSnnZ | https://moxfield.com/decks/OMSnnZoC-U-UFwBSyNDv5Q | Trostani (Token Reanimator) [Primer] / ryxze | 2025-01-29 | 4 | kept | 32 (+3 MDFC) | 2 | Hermit Druid / Golgari Grave-Troll self-mill into Séance and God-Pharaoh's Gift; Craterhoof; Aetherflux Reservoir; Greater Good | The highest-viewed Trostani deck (11k views); a graveyard creature engine. |
| trostani-moxfield-clz23n | https://moxfield.com/decks/clz23nIbj0WT5AOWMmXCkw | Trostani, Cheater of Death / CowboySensei | 2026-08-19 | 4 | kept | 34 (+2 MDFC) | 7 | Birthing Pod / Survival of the Fittest toolbox; Karmic Guide and Altar of Dementia recursion (not a closed loop on their own); Phyrexian Processor | Pod/Survival chains with Trostani lifegain. |
| trostani-moxfield-wRT3f_ | https://moxfield.com/decks/wRT3f_0R0UKTR3xfAtgWFQ | [Primer] Miku Miku - Tokens, Lifegain and Angels / WingsOfDaidalos | 2026-09-29 | 4 | kept | 33 (+4 MDFC) | 2 | Tokens and doublers (Doubling Season, Parallel Lives, Rhys); Aetherflux; Archangel of Thune | A Miku primer; casual-leaning "Bracket 4". |
| trostani-archidekt-15997080 | https://archidekt.com/decks/15997080 | Trostani (COMBO TIME) / dicenhouse | 2025-09-14 | 4 | kept | 34 (+1 MDFC) | 1 | Heliod + Walking Ballista; Thune + Spike Feeder; Basking Broodscale; Craterhoof; Felidar Sovereign; Triskelion | Overlaps heavily with Shalai's combo package, which supports one shared 99. |
| trostani-edhrec-avg-optimized | https://edhrec.com/average-decks/trostani-selesnyas-voice/optimized | EDHREC average, Optimized (293 decks) | saves 2025-01-10 to 2026-10-07 | 4 | kept | 36 | 5 | Tokens/doublers; Craterhoof; Aetherflux; Phyrexian Processor | Mostly precon upgrades. |
| trostani-edhrec-avg-cedh | https://edhrec.com/average-decks/trostani-selesnyas-voice/cedh | EDHREC average, "cEDH" (3 decks) | saves 2025-04-30 to 2026-10-05 | 5 (label) | kept on disk, **not counted** | 33 | 3 | Aetherflux, Phyrexian Processor | Not cEDH-grade. |

**Most common non-land cards** (5 counted): Aura Shards, Blossoming Bogbeast, Bramble Sovereign, Fanatic of Rhonas, Seedborn Muse, Sol Ring and Swords to Plowshares 4; Aetherflux Reservoir, Arcane Signet, Archangel of Thune, Craterhoof Behemoth, Doubling Season, Enlightened Tutor, Exalted Sunborn and Finale of Devastation 3.

**Combined Shalai + Trostani** (`selesnya-combined-frequency.tsv`, 13 lists): Sol Ring 12, Enlightened Tutor 11, Swords to Plowshares 10, Arcane Signet 9, Aura Shards 9, Birds of Paradise 9, Eladamri's Call 9, Esper Sentinel 9, Finale of Devastation 9, Heroic Intervention 8, Sylvan Library 8, Teferi's Protection 8, Worldly Tutor 8, Avacyn's Pilgrim 7, Elvish Mystic 7, Llanowar Elves 7; Archangel of Thune, Walking Ballista and Heliod, Sun-Crowned appear in 6, 6 and 5.

---

## Cross-cutting notes

- **Bans:** every discard was for Mana Crypt and/or Jeweled Lotus; none of the lists screened runs Dockside Extortionist or Nadu. Discards are all older lists (2020–2023), plus one 2026-dated playgroup.gg list that still runs Mana Crypt and Jeweled Lotus. EDHREC averages only use decks saved after the ban, so none of them contains a banned card.
- **Game Changer load:**
  - cEDH Brago: 12–16.
  - Bracket 4 Brago: 4–9.
  - Colors-only Child: 19–24.
  - Bracket 4 Child: 6–16.
  - Shalai: 4–10.
  - Trostani: 1–7.
- **Land counts:**
  - cEDH Brago: 26–30 (plus 2–3 MDFCs).
  - Bracket 4 Brago: 33–36.
  - Child: 26 (turbo) to 42 (lands-matter).
  - Shalai: 26–37, the low end with mana dorks.
- **Moxfield brackets are self-reported.** Several "Bracket 4" lists are casual (Child Gates/wipe decks, Trostani precon upgrades), and several "Bracket 5" Brago lists are what a high Bracket 4 would look like. Moxfield auto-rates all of them as 4. Judge by GC count and win lines, not the label.

---

## Pass 2b (2026-10-10): more lists for the mana-shape study

Goal (step 9): at least 15 counted lists per shortlisted commander, plus 20 high-power lists of other commanders. Every URL below was accessed 2026-10-10. Files are in `work/lists/` in the same format as before, with metadata lines `# url`, `# title`, `# author`, `# updated`, `# bracket`, `# kept`, `# accessed`, then a line with commander(s), total, lands and MDFCs, and a Game Changer line.

**Counted totals after this pass:**
- Brago: 10 + 6 = **16**
- Child of Alara: 9 + 7 = **16**
- Shalai (as commander only): 8 + 8 = **16**
- Other commanders: **20** kept (12 cEDH from the cEDH Decklist Database, 8 Archidekt Bracket 4)
- Discarded: 3 (one per commander), all for banned cards, saved with `# kept: no (...)` and not counted.

**How this was collected:**
- **Archidekt:** `https://archidekt.com/api/decks/v3/?commanderName=<name>&edhBracket=<4|5>&orderBy=-updatedAt&pageSize=50`; each deck's commander was re-checked in the deck JSON. Cards in categories marked not-in-deck, or named Sideboard or Maybeboard, were left out. This is why `brago-archidekt-19540613` has 100 cards: its one Sideboard card, Damping Sphere, is not included. The 8 other-commander Bracket 4 lists come from `edhBracket=4&deckFormat=3&orderBy=-viewCount`, limited to decks updated since 2026-07. I kept the 100-card ones with several Game Changers and spread the colors.
- **Moxfield:** fetched with `fetch()` inside the Claude Browser pane, as before. Searches used `sortType=updated` and `sortType=views` with `commanderCardId`, keeping only decks the author set to bracket 4 or 5. Decks came from `/v3/decks/all/<publicId>`. Card lists were read out of the browser and written to disk. Each list carries a djb2 hash of its card string, computed in the browser and again on disk, and **all 23 Moxfield lists matched**.
- **cEDH Decklist Database:** the 12 cEDH lists are Moxfield decklists linked from `COMPETITIVE` entries in `database.json`. Each file has a `# listed in:` line naming the entry. One list per commander was chosen, preferring recently updated, high-view lists and spreading the colors (mono-R, mono-G, UB, BR, GW, UG, UR, URG, UBR, WBR, BUG, 5c).
- **Bans and Game Changers:** every list was screened for Mana Crypt, Jeweled Lotus, Dockside Extortionist and Nadu, Winged Wisdom. GC counts use Scryfall `is:gamechanger` (53 cards, fetched 2026-10-10). Lands are cards whose front face is a Land. "+N MDFC" counts modal DFCs with a land back face.
- **Brackets are as set by the author.** As in pass 2, several Archidekt "4" Child lists are casual wipe or indestructible decks. Use GC count and lands to judge power, not the label.

### Brago, King Eternal: 7 new, 6 kept, 1 discarded

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC |
|---|---|---|---|---|---|---|---|
| brago-archidekt-11333004 | https://archidekt.com/decks/11333004 | Miku-dyoooooo / JH_Goblin | 2026-09-26 | 4 (Archidekt, author-set) | kept, counted | 30 (+4 MDFC) | 11 |
| brago-archidekt-11664967 | https://archidekt.com/decks/11664967 | Brago Stax / MrKennedy | 2026-06-07 | 5 (Archidekt, author-set) | **DISCARDED: Mana Crypt, Jeweled Lotus** | 32 | 14 |
| brago-archidekt-19540613 | https://archidekt.com/decks/19540613 | blink cedh / jc81rey | 2026-02-01 | 5 (Archidekt, author-set) | kept, counted | 27 (+1 MDFC) | 14 |
| brago-archidekt-21347845 | https://archidekt.com/decks/21347845 | Brago, King Eternal / KaleyJustin8 | 2026-04-02 | 5 (Archidekt, author-set) | kept, counted | 27 (+1 MDFC) | 14 |
| brago-archidekt-4342324 | https://archidekt.com/decks/4342324 | Brago, Flicker King / Beaster1212 | 2026-10-08 | 4 (Archidekt, author-set) | kept, counted | 33 (+3 MDFC) | 12 |
| brago-archidekt-8323836 | https://archidekt.com/decks/8323836 | Brago Stax / MrCapeTown | 2026-10-07 | 4 (Archidekt, author-set) | kept, counted | 31 | 8 |
| brago-moxfield-3X1Q42 | https://moxfield.com/decks/3X1Q42Yur0eaJpUBFP6YiA | (cEDH) BRAGO, BRAGO, BRAGOO! / SlagTheGold | 2026-09-30 | 5 (Moxfield, author-set; auto 4) | kept, counted | 29 (+1 MDFC) | 16 |

### Child of Alara: 8 new, 7 kept, 1 discarded

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC |
|---|---|---|---|---|---|---|---|
| child-of-alara-archidekt-11931659 | https://archidekt.com/decks/11931659 | Sweet Child O'Mine / RsoulZ | 2026-09-13 | 4 (Archidekt, author-set) | kept, counted | 37 (+1 MDFC) | 12 |
| child-of-alara-archidekt-12766096 | https://archidekt.com/decks/12766096 | Child of Alara Deck / Geekelement | 2026-08-22 | 4 (Archidekt, author-set) | kept, counted | 36 | 10 |
| child-of-alara-archidekt-15501698 | https://archidekt.com/decks/15501698 | Saltiest Deck / MoxLotus679 | 2026-08-18 | 4 (Archidekt, author-set) | kept, counted | 33 | 12 |
| child-of-alara-archidekt-24477776 | https://archidekt.com/decks/24477776 | Magnum Errorem (Stax, Pillowfort, Land Destruction) / player2win11245 | 2026-08-12 | 4 (Archidekt, author-set) | kept, counted | 34 | 10 |
| child-of-alara-archidekt-26311392 | https://archidekt.com/decks/26311392 | Copy of - The Most Salty Deck / bruhmcbruh | 2026-09-12 | 4 (Archidekt, author-set) | **DISCARDED: Jeweled Lotus, Dockside Extortionist** | 39 | 15 |
| child-of-alara-archidekt-26970409 | https://archidekt.com/decks/26970409 | Kosmik Fetus B4 / Muvieli | 2026-10-01 | 4 (Archidekt, author-set) | kept, counted | 39 | 16 |
| child-of-alara-moxfield-EU4dns | https://moxfield.com/decks/EU4dnsOjEkeVRB7GHVd-gw | ragebait / chancequist | 2026-10-03 | 5 (Moxfield, author-set; auto 4) | kept, counted | 33 | 14 |
| child-of-alara-moxfield-ms_4XG | https://moxfield.com/decks/ms_4XG56MU6vFnS3NKI9ew | #1 Idol / ThatWsEpic21 | 2026-09-29 | 5 (Moxfield, author-set; auto 4) | kept, counted | 40 | 17 |

### Shalai, Voice of Plenty (as commander): 9 new, 8 kept, 1 discarded

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC |
|---|---|---|---|---|---|---|---|
| shalai-archidekt-21098407 | https://archidekt.com/decks/21098407 | voice of dominion / nathanthenerd | 2026-03-25 | 4 (Archidekt, author-set) | kept, counted | 34 | 4 |
| shalai-moxfield-3zycKc | https://moxfield.com/decks/3zycKcQeWEGNxdT_LzejLA | Miku, Voice Over All / UnearthedNSX | 2026-09-24 | 4 (Moxfield, author-set; auto 4) | kept, counted | 28 | 9 |
| shalai-moxfield-Edh3uN | https://moxfield.com/decks/Edh3uNCJ1UKq6jhC9goeXQ | [EDH-8] Landslide. / Brimiss | 2026-10-09 | 4 (Moxfield, author-set; auto 4) | kept, counted | 34 | 12 |
| shalai-moxfield-HGE4R2 | https://moxfield.com/decks/HGE4R2XCeEOs6PdZJ4Byyg | Shalai, Voice of Plenty - Angels/Clerics / dandanthemagicman | 2026-08-29 | 4 (Moxfield, author-set; auto 4) | kept, counted | 38 | 9 |
| shalai-moxfield-ZEjDYp | https://moxfield.com/decks/ZEjDYp9TtEi7odTjbmAB6g | 0072 Shalai, Voice of Plenty - Birthing Pod / joedolphin13 | 2026-10-06 | 4 (Moxfield, author-set; auto 4) | kept, counted | 35 | 5 |
| shalai-moxfield-cVN7Oj | https://moxfield.com/decks/cVN7OjyxAU6WtRZk12L4kA | Humans Will Survive / AngryPapaClwnfsh | 2026-07-21 | 4 (Moxfield, author-set; auto 4) | kept, counted | 31 | 7 |
| shalai-moxfield-cdXdQa | https://moxfield.com/decks/cdXdQaz7BE6j1gMz2vGRBQ | Angelic Scorn / multilors | 2026-07-30 | 4 (Moxfield, author-set; auto 4) | **DISCARDED: Mana Crypt** | 33 (+1 MDFC) | 7 |
| shalai-moxfield-mEqTmC | https://moxfield.com/decks/mEqTmCgn70W6PL6fucxRgA | Arkinator Shalai / OingusBoingus420 | 2026-08-13 | 4 (Moxfield, author-set; auto 4) | kept, counted | 32 | 13 |
| shalai-moxfield-z_12-v | https://moxfield.com/decks/z_12-vijXkeTyBz-TmZplQ | Miku, Voice Over All / Gengartuan | 2026-10-06 | 4 (Moxfield, author-set; auto 4) | kept, counted | 34 | 5 |

### Other commanders (high-power Bracket 4 and cEDH): 20 new, 20 kept, 0 discarded

| File | URL | Title / author | Updated | Bracket | Kept? | Lands | GC | Commander(s) |
|---|---|---|---|---|---|---|---|---|
| other-celes-rune-knight-moxfield-bh40TY | https://moxfield.com/decks/bh40TYVQ2UWWHBcoF7pn6w | Celes: 𝕎𝕚𝕟𝕕𝕠𝕨 ℕ𝕒𝕦𝕤 [cEDH] / MarkgoesCompetitive (cEDH DB: Celes Persistant Breach) | 2026-10-05 | 5 (Moxfield, author-set; auto 4) | kept, counted | 27 | 17 | Celes, Rune Knight |
| other-ellivere-of-the-wild-court-moxfield-eb7L1N | https://moxfield.com/decks/eb7L1NnJ_UefJC_vNGQkcw | 🌳 It Does Nothing 🌞 / beard_umbra (cEDH DB: Ellivere Stax) | 2026-10-07 | 5 (Moxfield, author-set; auto 4) | kept, counted | 28 (+1 MDFC) | 10 | Ellivere of the Wild Court |
| other-glarb-calamitys-augur-moxfield-FaRq0C | https://moxfield.com/decks/FaRq0CATYku2G6Z_ANp9TQ | [PRO] FrogSi - CEDH Glarb Hulk / Shuiro (cEDH DB: Glarb DoomHulk) | 2026-10-05 | 5 (Moxfield, author-set; auto 4) | kept, counted | 26 | 17 | Glarb, Calamity's Augur |
| other-heliod-sun-crowned-archidekt-18520785 | https://archidekt.com/decks/18520785 | Praise the Sun, Fire the Gun / Marsitz | 2026-10-04 | 4 (Archidekt, author-set) | kept, counted | 32 | 9 | Heliod, Sun-Crowned |
| other-kaalia-of-the-vast-archidekt-7413006 | https://archidekt.com/decks/7413006 | Kaalia of the Vast / itzKanu | 2026-10-06 | 4 (Archidekt, author-set) | kept, counted | 29 | 11 | Kaalia of the Vast |
| other-kinnan-bonder-prodigy-moxfield-Mi4yPy | https://moxfield.com/decks/Mi4yPy0jFUGPx6pI5x3OVw | [cEDH] Kinnan NBC (No Bad Cards) / FreedomWaffle (cEDH DB: Kinnan Infinite Mana) | 2026-09-22 | 5 (Moxfield, author-set; auto 4) | kept, counted | 25 (+1 MDFC) | 10 | Kinnan, Bonder Prodigy |
| other-koma-cosmos-serpent-archidekt-3646160 | https://archidekt.com/decks/3646160 | Koma, Cosmos Serpent / hiuji | 2026-08-20 | 4 (Archidekt, author-set) | kept, counted | 32 (+3 MDFC) | 4 | Koma, Cosmos Serpent |
| other-krark-the-thumbless-silas-renn-seeker-adept-moxfield-PQ9PfU | https://moxfield.com/decks/PQ9PfU5bX0SKmSWoBhe2aA | Krark / Silas - Breadstorm / BasedBread (cEDH DB: Krark Silas Grixis Krark) | 2026-08-07 | 5 (Moxfield, author-set; auto 4) | kept, counted | 25 (+1 MDFC) | 17 | Krark, the Thumbless + Silas Renn, Seeker Adept |
| other-kratos-god-of-war-archidekt-16306373 | https://archidekt.com/decks/16306373 | Bracket 4: Kratos, God of War - I WILL HAVE MY REVENGE!!! / Spartens2013 | 2026-09-30 | 4 (Archidekt, author-set) | kept, counted | 31 (+1 MDFC) | 9 | Kratos, God of War |
| other-lumra-bellow-of-the-woods-moxfield-M_pcU9 | https://moxfield.com/decks/M_pcU9UU_UOLeWUVrgD7Aw | 🌨️🐻Cocaine Bear (w/ Primer)🐻🌨️ / Bric_Eagle (cEDH DB: Lumra Lands) | 2026-09-17 | 5 (Moxfield, author-set; auto 4) | kept, counted | 47 | 10 | Lumra, Bellow of the Woods |
| other-magda-brazen-outlaw-moxfield-xmH0i1 | https://moxfield.com/decks/xmH0i1HMHUi2iCd279RYPA | [CABLE] Clockside Outlawed / Iraruel (cEDH DB: Magda Clock Combo) | 2026-09-06 | 5 (Moxfield, author-set; auto 4) | kept, counted | 25 (+3 MDFC) | 6 | Magda, Brazen Outlaw |
| other-obeka-brute-chronologist-archidekt-2172726 | https://archidekt.com/decks/2172726 | Obeka: Cheat and Copy (With Primer) / XU-Mockingbird | 2026-09-16 | 4 (Archidekt, author-set) | kept, counted | 33 (+2 MDFC) | 7 | Obeka, Brute Chronologist |
| other-rakdos-the-muscle-moxfield-hraUlz | https://moxfield.com/decks/hraUlzrXJE-73XP5y38sdQ | Emotional damage [SALT] / joebassss (cEDH DB: Rakdos Sacrifice) | 2026-09-07 | 5 (Moxfield, author-set; auto 4) | kept, counted | 20 (+3 MDFC) | 10 | Rakdos, the Muscle |
| other-talion-the-kindly-lord-moxfield-1DSNHF | https://moxfield.com/decks/1DSNHF1Ju0yWCObsgOcXmQ | [CABAL] cEDH 💙🖤 UB adaptive control 💙🖤 / Coach_Memo (cEDH DB: Talion Control) | 2026-09-21 | 5 (Moxfield, author-set; auto 4) | kept, counted | 27 (+2 MDFC) | 15 | Talion, the Kindly Lord |
| other-terra-magical-adept-moxfield-rkfPlu | https://moxfield.com/decks/rkfPluCxT0yK3ktOuDZAEQ | cEDH Terra, Magical Adept [DEEP PRIMER]🌞🌳💀🔥🌊 ⁵ᶜ ᵍᵒᵒᵈˢᵗᵘᶠᶠ / lucaqualunque (cEDH DB: Terra 5C Goodstuff) | 2026-09-02 | 5 (Moxfield, author-set; auto 4) | kept, counted | 26 | 21 | Terra, Magical Adept // Esper Terra |
| other-thrasios-triton-hero-rograkh-son-of-rohgahh-moxfield-BNWjUa | https://moxfield.com/decks/BNWjUa_lA0mzxNpgpHDGSA | Thras-and-Silent Rog 🌊🦦⛈️ / AnthonyD3288 (cEDH DB: Rograkh Thrasios Cradlestorm+) | 2026-10-09 | 5 (Moxfield, author-set; auto 4) | kept, counted | 27 | 12 | Thrasios, Triton Hero + Rograkh, Son of Rohgahh |
| other-toph-the-first-metalbender-archidekt-5996567 | https://archidekt.com/decks/5996567 | Toph, the First Metalbender / Mcgeek | 2026-10-09 | 4 (Archidekt, author-set) | kept, counted | 38 | 7 | Toph, the First Metalbender |
| other-valgavoth-harrower-of-souls-archidekt-9277180 | https://archidekt.com/decks/9277180 | Valgavoth Life Stax / Phemt | 2026-10-07 | 4 (Archidekt, author-set) | kept, counted | 33 (+5 MDFC) | 5 | Valgavoth, Harrower of Souls |
| other-vivi-ornitier-moxfield-oumM4r | https://moxfield.com/decks/oumM4rK-O0uZtgaatbHNrA | [cEDH] Vivi - How do you prove you exist? Maybe we don't exist... / Elmekia (cEDH DB: Vivi Curiosity Storm) | 2026-10-06 | 5 (Moxfield, author-set; auto 4) | kept, counted | 24 (+2 MDFC) | 13 | Vivi Ornitier |
| other-wilhelt-the-rotcleaver-archidekt-5072301 | https://archidekt.com/decks/5072301 | Wilhelt, the Rotcleaver Bracket 4 Optimized Zombie Tribal Deck - Arthas Mijo [Primer] / Wertos | 2026-10-08 | 4 (Archidekt, author-set) | kept, counted | 33 (+3 MDFC) | 9 | Wilhelt, the Rotcleaver |

