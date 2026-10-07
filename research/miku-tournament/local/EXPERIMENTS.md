# Experiments (Miku tournament research)
Every bench run, in order. Unless a line says otherwise, the hero is `miku-precon`, at PROCS=18 × 112 games: 2,016 games against three random Bracket 2 precons ("B2", `random2`) and 2,016 against three random Bracket 4 bots ("B4", `random4`). Paired differences use the same seeds (`tools/sim/bench/paired.js`). Raw lines, with the exact variant JSON, are in `xp/xp.log`. `node xp/table.js PREFIX` prints any group of runs side by side.

**The event is Bracket 4, so Δ B4 is the number that decides.** Δ B2 only has to stay non-negative.

| # | Run | List / change | B2 win | B4 win | Paired vs | Δ B2 | Δ B4 | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | p0 | precon, generic bot (no deck brain) | 45.6% ±1.1 | 19.1% ±0.9 | | | | median win round 13 / 11 |
| 2 | budget0 | the site's 80€ plan (`miku-budget`, 22 swaps), generic bot | 39.2% ±1.1 | 17.3% ±0.8 | p0 | −6.3 ±1.4 | −1.8 ±1.1 | |
| 3 | full0 | the site's full upgrade (`miku`, 24 swaps), generic bot | 37.3% ±1.1 | 17.5% ±0.8 | p0 | −8.3 ±1.4 | −1.6 ±1.1 | |
| 4 | P280 (5,040 per field, telemetry) | precon, generic bot | 46.2% ±0.7 | 19.5% ±0.6 | | | | median win round 13 / 11 |
| 5 | B280 (5,040) | 80€ plan, generic bot | 41.3% ±0.7 | 16.9% ±0.5 | P280 | −4.9 ±0.9 | −2.6 ±0.7 | Heliod + Ballista assembled in 4% of B4 games; won 42% of those |
| 6 | F280 (5,040) | full plan, generic bot | 37.3% ±0.7 | 16.9% ±0.5 | P280 | −8.8 ±0.9 | −2.6 ±0.7 | |
| 7 | budget1 | 80€ plan + Miku brain v1 (Ballista X ≥ 2, Feeder loops with Thune, Aetherflux at players, combo pieces stay home) | 40.5% | 17.6% | budget0 | +1.3 ±0.6 | +0.2 ±0.4 | |
| 8 | budget2–3 | + Ballista waits for {1}{W}, X leaves it open, Skullclamp off combo pieces; lifelink first, no stray pings | 41.1% | 17.6% | budget0 | +1.8 ±0.7 | +0.3 ±0.4 | |
| 9 | budget4 | + Finale never fetches an X creature; takes the missing combo piece | 41.1% ±1.1 | 18.0% ±0.9 | budget0 | +1.8 ±0.8 | +0.6 ±0.5 | brain frozen here: Heliod + Ballista now wins 38/42 assembled games vs B2, 10/13 vs B4 |
| 10 | **p1** | **precon on the final brain: the base from here** | 46.5% ±1.1 | 18.8% ±0.9 | p0 | +0.9 ±0.6 | −0.3 ±0.3 | |
| 11 | s-* (27 runs) | every swap of both site plans, one at a time into the precon (the plans' own pairings), table below | | | p1 | | | all within ±1.1 on B4; best Generous Gift +0.8, Arcane Signet +0.7, True Conviction +0.7; Heliod alone −1.0 |
| 12 | cmd-Shalai | same 100 cards, **Shalai, Voice of Plenty** (Miku printing) as commander, Trostani in the 99 | 32.3% | 17.4% | p1 | −14.2 ±1.3 | −1.4 ±1.1 | Trostani stays the commander |
| 13 | cmd-Lathiel | Lathiel, the Bounteous Dawn as commander | 35.2% | 15.1% | p1 | −11.3 ±1.3 | −3.7 ±1.0 | |
| 14 | cmd-GhaltaMavren | Ghalta and Mavren as commander | 44.2% | 19.8% | p1 | −2.3 ±1.4 | +1.0 ±1.0 | within noise on B4, worse on B2; not a Miku card |
| 15 | cmd-Rhys | Rhys the Redeemed as commander | 34.3% | 13.8% | p1 | −12.3 ±1.4 | −5.0 ±1.0 | |
| 16 | pk-HB | Heliod + Walking Ballista (for Pest Infestation, Phyrexian Processor) | 44.9% | 18.0% | p1 | −1.6 ±0.8 | −0.8 ±0.5 | the combo rarely assembles without tutors |
| 17 | pk-HBF | + Spike Feeder (for Suture Priest) | 44.8% | 18.9% | p1 | −1.7 ±0.9 | +0.1 ±0.6 | |
| 18 | pk-top6 | the six best plan singles together: Generous Gift, Arcane Signet, True Conviction, Elvish Mystic, Craterhoof, Elspeth (plan pairings) | 51.9% | 21.9% | p1 | +5.4 ±1.2 | **+3.1 ±0.8** | packages add up; Craterhoof is not owned (full plan) |
| 19 | b-flux2 | p1 + MIKU_ON=flux2: Aetherflux shoots only when the shot kills and leaves 15+ life, or leaves 40+ | 48.5% | 19.2% | p1 | +2.0 ±0.4 | +0.4 ±0.2 | to adopt after the cut sweep |
| 20 | b-mull2 | p1 + MIKU_ON=mull2: the pilot sheet's Bracket 4 keep rule (a play by turn 2 or both colors by turn 4) | 46.1% | 18.9% | p1 | −0.4 ±0.6 | +0.1 ±0.4 | neutral: not adopted for the bot |
| 21 | c-* (61 runs) | cut sweep: each nonland precon card → a basic land, table below | | | p1 | | | |
| 22 | COR280 (5,040 per field, telemetry) | reference: the site's **Corrupted Miku** deck (`corrupted`, Shalai commander, its own brain, 15 Game Changers) | 43.7% ±0.7 | **31.0% ±0.7** | P280 (same seeds) | −2.4 ±1.0 | **+11.4 ±0.9** | median win round 8 (B4); combo assembled in 24% of B4 games, 70% won; 80 cards differ from the precon, 73 not owned, about €2,300 to buy; 3 B2 games hit an engine error (opponent's Kenrith's Transformation, see NEXT.md) |
| 23 | **p2** | **p1 + the Aetherflux rule as default (= b-flux2): the base from here** | 48.5% ±1.1 | 19.2% ±0.9 | p1 | +2.0 ±0.4 | +0.4 ±0.2 | |
| 24 | t5a–t15c (tiers1) | first tier candidates from owned cards vs p2 (lists in `xp/tiers1.sh`, table below) | | | p2 | | | superseded by the u* runs on p3 (the brain changed); t15a hung (Storm Herd at thousands of life) and is marked invalid in xp.log |
| 25 | **p3** | **p2 + Storm Herd held above 150 life: the base from here** | | | p2 | | | see the u* and r-* runs |
| 26 | **p4** | **p3 + the Storm Herd guard really applied (lazy patch): the base for the v* and r-* runs** | 48.5% ±1.1 | 19.2% ±0.9 | p3 | | | same win rates as p2/p3 |
| 27 | v5a–v15e | every tier candidate vs p4 (lists in `xp/run3.sh`, table below) | | | p4 | | | best: v5b +2.5, v10b +4.6, v15e +5.6 / v15c +5.5 / v15b +5.2 / v15d +4.8; v15a (combo package) +3.7 |
| 28 | **PF280** (5,040, telemetry) | **the precon on the final brain: the honest numbers** | **48.4% ±0.7** | **20.2% ±0.6** | | | | median win round 13 / 10; the confirmations pair against it |
| 29 | **C5b** (5,040) | **tier 5** = v5b | 53.1% ±0.7 | 21.4% ±0.6 | PF280 | **+4.7 ±0.7** | **+1.3 ±0.5** | regressed from +2.5 at 2,016 games |
| 30 | **C10b** (5,040) | **tier 10** = v10b | 53.7% ±0.7 | 23.3% ±0.6 | PF280 | **+5.3 ±0.8** | **+3.1 ±0.6** | |
| 31 | **C15d** (5,040) | **tier 15** = v15d (tier 10 + 5 plan cards) | 56.7% ±0.7 | 23.6% ±0.6 | PF280 | **+8.3 ±0.9** | **+3.4 ±0.7** | adopted: nested on tier 10 |
| 32 | C15e (5,040) | v15e (the 2,016-game leader) | 55.8% ±0.7 | 23.8% ±0.6 | PF280 | +7.4 ±0.9 | +3.6 ±0.7 | ties C15d on B4 (0.2 apart, ±0.7), worse on B2; not nested |
| 33 | r-* (17 runs) + r-Forest | buy-today research cards, each for Song of the Worldsoul vs p4; **r-Forest is the land control** (table below) | | | p4 | | | a Forest in that slot is +1.3 / +1.3; only Smothering Tithe clearly beats it (+2.6 / +2.6); tutors and protection at or below a land (bot artifact for protection) |
| 34 | w15t / w15tb | tier 15 with Smothering Tithe for the Plains in Angelic Chorus's slot (/ + Birds of Paradise for the Forest in Ancient Cornucopia's slot) | 57.2% | 25.6% / 25.7% | p4 (and v15d paired) | +8.7 ±1.4 | +6.3 ±1.1 / +6.4 ±1.1 | vs v15d: +1.6 ±0.5 / +1.7 ±0.7 on B4; Birds adds nothing |
| 35 | **C15t** (5,040) | **tier 15 + Smothering Tithe (buy option)** | **58.4% ±0.7** | **25.1% ±0.6** | PF280 | **+10.0 ±0.9** | **+4.9 ±0.7** | vs C15d (tier 15): +1.8 ±0.4 / **+1.5 ±0.3** |

### First tier candidates on p2 (experiment 24, superseded)
| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |
|---|---|---|---|---|---|---|
| t15c | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Cathars' Crusade; Ajani's Pridemate → Esika's Chariot; Conclave Evangelist → Beastmaster Ascension; Healing Technique → Razorverge Thicket; Silverquill Lecturer → Brushland | 24.8% | +5.5 ±1.1 | 56.4% | +7.9 ±1.4 | p2 |
| t15b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Plains; Ajani's Pridemate → Forest; Conclave Evangelist → Plains; Healing Technique → Forest; Silverquill Lecturer → Spike Feeder | 24.4% | +5.2 ±1.1 | 57% | +8.5 ±1.4 | p2 |
| t10b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Plains; Ancient Cornucopia → Forest; Angelic Chorus → Plains; Camaraderie → Hero of Bladehold | 23.8% | +4.6 ±1 | 54% | +5.5 ±1.3 | p2 |
| t10a | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar | 23% | +3.7 ±1 | 53.8% | +5.3 ±1.3 | p2 |
| t5b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Plains; Song of Freyalise → Forest | 21.8% | +2.5 ±0.8 | 53% | +4.5 ±1.1 | p2 |
| t5a | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion | 21.2% | +1.9 ±0.8 | 53.9% | +5.4 ±1.1 | p2 |

### Plan singles (experiment 11), sorted by Δ B4, 2,016 paired games per field
| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |
|---|---|---|---|---|---|---|
| s-GenerousGift | Rhys the Redeemed → Generous Gift | 19.6% | +0.8 ±0.4 | 46.5% | +0 ±0.6 | p1 |
| s-ArcaneSignet | Ancient Cornucopia → Arcane Signet | 19.5% | +0.7 ±0.4 | 46.9% | +0.4 ±0.6 | p1 |
| s-TrueConviction | Silverquill Lecturer → True Conviction | 19.5% | +0.7 ±0.3 | 48.1% | +1.5 ±0.5 | p1 |
| s-ElvishMystic | Explore → Elvish Mystic | 19.3% | +0.5 ±0.4 | 47.6% | +1.1 ±0.6 | p1 |
| s-CraterhoofBehemoth | Idol of Oblivion → Craterhoof Behemoth | 19.2% | +0.4 ±0.4 | 46.8% | +0.2 ±0.6 | p1 |
| s-ElspethSunsChampio | Gruff Triplets → Elspeth, Sun's Champion | 19.1% | +0.3 ±0.4 | 49% | +2.4 ±0.6 | p1 |
| s-BeastWithin | Healing Technique → Beast Within | 19% | +0.2 ±0.4 | 46.7% | +0.2 ±0.6 | p1 |
| s-ReturnoftheWildspe | Angel of Indemnity → Return of the Wildspeaker | 19% | +0.2 ±0.3 | 46.8% | +0.2 ±0.6 | p1 |
| s-RazorvergeThicket | Temple of Plenty → Razorverge Thicket | 18.9% | +0.1 ±0.3 | 46.9% | +0.4 ±0.4 | p1 |
| s-HeroofBladehold | Growing Ranks → Hero of Bladehold | 18.9% | +0.1 ±0.4 | 46.5% | +0 ±0.5 | p1 |
| s-OverwhelmingStampe | Congregate → Overwhelming Stampede | 18.8% | +0 ±0.3 | 47.2% | +0.6 ±0.4 | p1 |
| s-BeastmasterAscensi | Invincible Hymn → Beastmaster Ascension | 18.8% | +0 ±0.3 | 46.4% | -0.1 ±0.5 | p1 |
| s-AdelineResplendent | Arasta of the Endless Web → Adeline, Resplendent Cathar | 18.8% | +0 ±0.3 | 46.4% | -0.1 ±0.5 | p1 |
| s-Brushland | Radiant Fountain → Brushland | 18.8% | +0 ±0.3 | 46.8% | +0.3 ±0.5 | p1 |
| s-ScatteredGroves | Sapseep Forest → Scattered Groves | 18.8% | +0 ±0.4 | 47% | +0.4 ±0.6 | p1 |
| s-EsikasChariot | Song of Freyalise → Esika's Chariot | 18.7% | -0.1 ±0.4 | 45.3% | -1.2 ±0.6 | p1 |
| s-MirrorEntity | Angelic Chorus → Mirror Entity | 18.7% | -0.1 ±0.3 | 46.6% | +0 ±0.5 | p1 |
| s-SpikeFeeder | Suture Priest → Spike Feeder | 18.6% | -0.2 ±0.4 | 45.3% | -1.2 ±0.6 | p1 |
| s-CrashingDrawbridge | Silverquill Lecturer → Crashing Drawbridge | 18.6% | -0.2 ±0.4 | 46.6% | +0.1 ±0.5 | p1 |
| s-WalkingBallista | Phyrexian Processor → Walking Ballista | 18.5% | -0.3 ±0.3 | 45.5% | -1 ±0.6 | p1 |
| s-Plains | Seraph Sanctuary → Plains | 18.5% | -0.3 ±0.4 | 47% | +0.4 ±0.5 | p1 |
| s-IntangibleVirtue | Boon Reflection → Intangible Virtue | 18.3% | -0.5 ±0.4 | 47.1% | +0.6 ±0.5 | p1 |
| s-CatharsCrusade | Storm Herd → Cathars' Crusade | 18.2% | -0.6 ±0.3 | 44.6% | -1.9 ±0.5 | p1 |
| s-AvengerofZendikar | Mirari's Wake → Avenger of Zendikar | 18.1% | -0.7 ±0.4 | 45.1% | -1.4 ±0.6 | p1 |
| s-TriumphoftheHordes | Crested Sunmare → Triumph of the Hordes | 17.9% | -0.9 ±0.4 | 45.7% | -0.8 ±0.6 | p1 |
| s-HeliodSunCrowned | Pest Infestation → Heliod, Sun-Crowned | 17.8% | -1 ±0.4 | 44.7% | -1.8 ±0.6 | p1 |
| s-JazalGoldmane | Mirari's Wake → Jazal Goldmane | 17.7% | -1.1 ±0.4 | 43.6% | -3 ±0.6 | p1 |

### Cut sweep (experiment 21): each nonland precon card → a basic land, vs p1, sorted by Δ B4 (positive = the deck is better without the card)
| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |
|---|---|---|---|---|---|---|
| c-SongoftheWorldsoul | Song of the Worldsoul → Plains | 20.5% | +1.7 ±0.5 | 47.8% | +1.2 ±0.6 | p1 |
| c-RhystheRedeemed | Rhys the Redeemed → Forest | 20.3% | +1.5 ±0.5 | 46.8% | +0.2 ±0.7 | p1 |
| c-ExcavationTechniqu | Excavation Technique → Plains | 20.2% | +1.4 ±0.5 | 47.9% | +1.3 ±0.7 | p1 |
| c-AetherfluxReservoi | Aetherflux Reservoir → Forest | 20.1% | +1.3 ±0.5 | 47.1% | +0.5 ±0.7 | p1 |
| c-SelesnyaSignet | Selesnya Signet → Forest | 19.9% | +1.1 ±0.4 | 46.2% | -0.3 ±0.5 | p1 |
| c-SongofFreyalise | Song of Freyalise → Forest | 19.8% | +1 ±0.4 | 47% | +0.5 ±0.6 | p1 |
| c-GrowingRanks | Growing Ranks → Forest | 19.7% | +0.9 ±0.4 | 47.4% | +0.8 ±0.6 | p1 |
| c-Skullclamp | Skullclamp → Forest | 19.7% | +0.9 ±0.5 | 46.1% | -0.4 ±0.7 | p1 |
| c-SpringleafDrum | Springleaf Drum → Forest | 19.7% | +0.9 ±0.4 | 46.9% | +0.4 ±0.6 | p1 |
| c-PhyrexianProcessor | Phyrexian Processor → Forest | 19.7% | +0.9 ±0.4 | 48.2% | +1.6 ±0.6 | p1 |
| c-AncientCornucopia | Ancient Cornucopia → Forest | 19.6% | +0.8 ±0.5 | 47% | +0.4 ±0.6 | p1 |
| c-ProsperousInnkeepe | Prosperous Innkeeper → Forest | 19.6% | +0.8 ±0.5 | 47.7% | +1.1 ±0.7 | p1 |
| c-Camaraderie | Camaraderie → Forest | 19.5% | +0.7 ±0.4 | 46.8% | +0.2 ±0.7 | p1 |
| c-AngelicChorus | Angelic Chorus → Plains | 19.5% | +0.7 ±0.4 | 46.9% | +0.4 ±0.6 | p1 |
| c-AjanisPridemate | Ajani's Pridemate → Plains | 19.4% | +0.6 ±0.4 | 47.1% | +0.6 ±0.6 | p1 |
| c-ConclaveEvangelist | Conclave Evangelist → Forest | 19.4% | +0.6 ±0.5 | 48.1% | +1.5 ±0.6 | p1 |
| c-Farseek | Farseek → Forest | 19.4% | +0.6 ±0.5 | 47.7% | +1.1 ±0.7 | p1 |
| c-RootbornDefenses | Rootborn Defenses → Plains | 19.4% | +0.6 ±0.4 | 47.2% | +0.7 ±0.6 | p1 |
| c-SwordstoPlowshares | Swords to Plowshares → Plains | 19.4% | +0.6 ±0.5 | 47.3% | +0.7 ±0.6 | p1 |
| c-HealingTechnique | Healing Technique → Forest | 19.3% | +0.5 ±0.4 | 47.9% | +1.4 ±0.6 | p1 |
| c-BlossomingBogbeast | Blossoming Bogbeast → Forest | 19.3% | +0.5 ±0.5 | 46.6% | +0 ±0.7 | p1 |
| c-ClericClass | Cleric Class → Plains | 19.3% | +0.5 ±0.5 | 46.1% | -0.4 ±0.6 | p1 |
| c-SilverquillLecture | Silverquill Lecturer → Plains | 19.3% | +0.5 ±0.4 | 47.1% | +0.6 ±0.6 | p1 |
| c-Cultivate | Cultivate → Forest | 19.3% | +0.5 ±0.5 | 46.1% | -0.4 ±0.6 | p1 |
| c-GrandCrescendo | Grand Crescendo → Plains | 19.3% | +0.5 ±0.4 | 48.3% | +1.7 ±0.6 | p1 |
| c-BoonReflection | Boon Reflection → Plains | 19.3% | +0.5 ±0.4 | 47.7% | +1.2 ±0.6 | p1 |
| c-DazzlingTheaterPro | Dazzling Theater // Prop Room → Forest | 19.2% | +0.4 ±0.4 | 46.5% | +0 ±0.6 | p1 |
| c-Congregate | Congregate → Plains | 19.2% | +0.4 ±0.4 | 48.1% | +1.6 ±0.6 | p1 |
| c-InvincibleHymn | Invincible Hymn → Plains | 19.1% | +0.3 ±0.5 | 47.1% | +0.5 ±0.6 | p1 |
| c-Explore | Explore → Forest | 19.1% | +0.3 ±0.4 | 47.3% | +0.7 ±0.6 | p1 |
| c-FanaticofRhonas | Fanatic of Rhonas → Forest | 19.1% | +0.3 ±0.5 | 45.6% | -0.9 ±0.6 | p1 |
| c-SoulofEternity | Soul of Eternity → Plains | 19.1% | +0.3 ±0.4 | 46% | -0.5 ±0.7 | p1 |
| c-SpeakeroftheHeaven | Speaker of the Heavens → Plains | 19.1% | +0.3 ±0.5 | 46.1% | -0.4 ±0.7 | p1 |
| c-VoiceoftheBlessed | Voice of the Blessed → Plains | 19.1% | +0.3 ±0.4 | 45.5% | -1 ±0.6 | p1 |
| c-ArastaoftheEndless | Arasta of the Endless Web → Forest | 19% | +0.2 ±0.4 | 45.6% | -0.9 ±0.6 | p1 |
| c-PestInfestation | Pest Infestation → Forest | 19% | +0.2 ±0.4 | 46.7% | +0.1 ±0.6 | p1 |
| c-HourofReckoning | Hour of Reckoning → Plains | 19% | +0.2 ±0.5 | 48.8% | +2.3 ±0.6 | p1 |
| c-LlanowarElves | Llanowar Elves → Forest | 19% | +0.2 ±0.5 | 47.2% | +0.6 ±0.6 | p1 |
| c-VorinclexVoiceofHu | Vorinclex, Voice of Hunger → Forest | 19% | +0.2 ±0.5 | 45.7% | -0.8 ±0.7 | p1 |
| c-SuturePriest | Suture Priest → Plains | 18.9% | +0.1 ±0.5 | 45.7% | -0.8 ±0.6 | p1 |
| c-IdolofOblivion | Idol of Oblivion → Forest | 18.8% | +0 ±0.5 | 47.4% | +0.9 ±0.6 | p1 |
| c-ElendasHierophant | Elenda's Hierophant → Plains | 18.8% | +0 ±0.4 | 45.6% | -0.9 ±0.6 | p1 |
| c-GruffTriplets | Gruff Triplets → Forest | 18.8% | +0 ±0.4 | 47.6% | +1.1 ±0.6 | p1 |
| c-NaturesLore | Nature's Lore → Forest | 18.8% | +0 ±0.5 | 46.1% | -0.4 ±0.7 | p1 |
| c-AngelofIndemnity | Angel of Indemnity → Plains | 18.8% | +0 ±0.4 | 46.8% | +0.3 ±0.7 | p1 |
| c-VoiceofResurgence | Voice of Resurgence → Forest | 18.8% | +0 ±0.4 | 46.4% | -0.1 ±0.7 | p1 |
| c-BreakDown | Break Down → Forest | 18.7% | -0.1 ±0.4 | 47.9% | +1.3 ±0.7 | p1 |
| c-FinaleofDevastatio | Finale of Devastation → Forest | 18.7% | -0.1 ±0.5 | 46.3% | -0.2 ±0.6 | p1 |
| c-HaloFountain | Halo Fountain → Plains | 18.7% | -0.1 ±0.5 | 47.3% | +0.8 ±0.6 | p1 |
| c-PathtoExile | Path to Exile → Plains | 18.7% | -0.1 ±0.5 | 46.4% | -0.1 ±0.6 | p1 |
| c-SunderingGrowth | Sundering Growth → Forest | 18.7% | -0.1 ±0.4 | 46.4% | -0.1 ±0.6 | p1 |
| c-NykthosParagon | Nykthos Paragon → Plains | 18.6% | -0.2 ±0.4 | 45.1% | -1.4 ±0.6 | p1 |
| c-ShamanicRevelation | Shamanic Revelation → Forest | 18.6% | -0.2 ±0.4 | 46.4% | -0.1 ±0.7 | p1 |
| c-ResplendentAngel | Resplendent Angel → Plains | 18.5% | -0.3 ±0.4 | 46.7% | +0.2 ±0.6 | p1 |
| c-SoulWarden | Soul Warden → Plains | 18.5% | -0.3 ±0.5 | 45.7% | -0.8 ±0.7 | p1 |
| c-ArchangelofThune | Archangel of Thune → Plains | 18.4% | -0.4 ±0.5 | 45.8% | -0.7 ±0.7 | p1 |
| c-BrambleSovereign | Bramble Sovereign → Forest | 18.4% | -0.4 ±0.4 | 46.7% | +0.2 ±0.6 | p1 |
| c-StormHerd | Storm Herd → Plains | 18.3% | -0.5 ±0.4 | 44.6% | -1.9 ±0.6 | p1 |
| c-MirarisWake | Mirari's Wake → Forest | 18.3% | -0.5 ±0.4 | 45% | -1.5 ±0.6 | p1 |
| c-LathieltheBounteou | Lathiel, the Bounteous Dawn → Forest | 18.2% | -0.6 ±0.5 | 46.6% | +0 ±0.6 | p1 |
| c-CrestedSunmare | Crested Sunmare → Plains | 18.2% | -0.6 ±0.4 | 46.6% | +0.1 ±0.7 | p1 |
| c-AvacynsPilgrim | Avacyn's Pilgrim → Forest | 18.1% | -0.7 ±0.4 | 46.9% | +0.3 ±0.6 | p1 |
| c-GhaltaandMavren | Ghalta and Mavren → Forest | 17.9% | -0.9 ±0.5 | 46.4% | -0.1 ±0.6 | p1 |
| c-ShalaiVoiceofPlent | Shalai, Voice of Plenty → Plains | 17.8% | -1 ±0.4 | 45.6% | -0.9 ±0.6 | p1 |
| c-SolRing | Sol Ring → Forest | 17.5% | -1.3 ±0.5 | 46.2% | -0.3 ±0.6 | p1 |

How to read it: 50 of 61 cards measure within ±0.6 of a basic land on B4. Every card's land replacement is also one more land, and the bots seem to like lands (the precon runs 34). The bots also undervalue held interaction: Swords to Plowshares (+0.6), Path (−0.1), Rootborn Defenses (+0.6), Grand Crescendo (+0.5) and Break Down measure as worth about a land. That's a bot artifact: a person holds Swords for the combo piece, and the bot fires it at the first big creature. Those cards stay. The clear keeps: Sol Ring, Shalai, Ghalta and Mavren, Avacyn's Pilgrim, Crested Sunmare, Lathiel, Mirari's Wake and Storm Herd.

### Tier candidates on p4 (experiment 27), 2,016 paired games per field
| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |
|---|---|---|---|---|---|---|
| v15e | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Plains; Ajani's Pridemate → Forest; Conclave Evangelist → Esika's Chariot; Healing Technique → Razorverge Thicket; Silverquill Lecturer → Brushland | 24.8% | +5.6 ±1.1 | 56.1% | +7.5 ±1.4 | p4 |
| v15c | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Cathars' Crusade; Ajani's Pridemate → Esika's Chariot; Conclave Evangelist → Beastmaster Ascension; Healing Technique → Razorverge Thicket; Silverquill Lecturer → Brushland | 24.7% | +5.5 ±1.1 | 56.4% | +7.9 ±1.4 | p4 |
| v15b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Plains; Ajani's Pridemate → Forest; Conclave Evangelist → Plains; Healing Technique → Forest; Silverquill Lecturer → Spike Feeder | 24.4% | +5.2 ±1.1 | 56.8% | +8.3 ±1.4 | p4 |
| v15d | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Plains; Ancient Cornucopia → Forest; Angelic Chorus → Plains; Camaraderie → Hero of Bladehold; Springleaf Drum → Return of the Wildspeaker; Ajani's Pridemate → Overwhelming Stampede; Conclave Evangelist → Adeline, Resplendent Cathar; Healing Technique → Esika's Chariot; Silverquill Lecturer → Cathars' Crusade | 24% | +4.8 ±1.1 | 56.4% | +7.9 ±1.4 | p4 |
| v10b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Plains; Ancient Cornucopia → Forest; Angelic Chorus → Plains; Camaraderie → Hero of Bladehold | 23.8% | +4.6 ±1 | 54% | +5.5 ±1.3 | p4 |
| v10a | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar | 22.9% | +3.7 ±1 | 53.5% | +5 ±1.3 | p4 |
| v15a | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion; Growing Ranks → Beast Within; Prosperous Innkeeper → Return of the Wildspeaker; Ancient Cornucopia → Hero of Bladehold; Angelic Chorus → Overwhelming Stampede; Camaraderie → Adeline, Resplendent Cathar; Springleaf Drum → Spike Feeder; Ajani's Pridemate → Heliod, Sun-Crowned; Conclave Evangelist → Walking Ballista; Healing Technique → Esika's Chariot; Silverquill Lecturer → Razorverge Thicket | 22.9% | +3.7 ±1.1 | 56.3% | +7.8 ±1.4 | p4 |
| v10c | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Plains; Song of Freyalise → Forest; Growing Ranks → Beast Within; Prosperous Innkeeper → Elvish Mystic; Ancient Cornucopia → Elspeth, Sun's Champion; Angelic Chorus → Hero of Bladehold; Camaraderie → Plains | 22.6% | +3.4 ±1 | 54% | +5.5 ±1.3 | p4 |
| v5b | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Plains; Song of Freyalise → Forest | 21.7% | +2.5 ±0.8 | 52.8% | +4.3 ±1.1 | p4 |
| v5c | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Plains | 21.3% | +2 ±0.8 | 52.4% | +3.9 ±1.1 | p4 |
| v5a | Song of the Worldsoul → Generous Gift; Rhys the Redeemed → Arcane Signet; Excavation Technique → True Conviction; Phyrexian Processor → Elvish Mystic; Song of Freyalise → Elspeth, Sun's Champion | 21.1% | +1.9 ±0.8 | 53.9% | +5.4 ±1.1 | p4 |

### Buy-today research singles (experiment 33), each for Song of the Worldsoul, vs p4, 2,016 paired games per field. r-Forest = the land control.
| Run | Change | B4 win | Δ B4 | B2 win | Δ B2 | vs |
|---|---|---|---|---|---|---|
| r-SmotheringTithe | Song of the Worldsoul → Smothering Tithe | 21.9% | +2.6 ±0.5 | 51.1% | +2.6 ±0.6 | p4 |
| r-BirdsofParadise | Song of the Worldsoul → Birds of Paradise | 20.7% | +1.5 ±0.4 | 49.8% | +1.2 ±0.6 | p4 |
| r-WorldlyTutor | Song of the Worldsoul → Worldly Tutor | 20.6% | +1.3 ±0.4 | 50.1% | +1.6 ±0.6 | p4 |
| r-GreenSunsZenith | Song of the Worldsoul → Green Sun's Zenith | 20.6% | +1.3 ±0.4 | 49.1% | +0.6 ±0.5 | p4 |
| r-Forest | Song of the Worldsoul → Forest | 20.5% | +1.3 ±0.5 | 49.9% | +1.3 ±0.6 | p4 |
| r-ScurryOak | Song of the Worldsoul → Scurry Oak | 20.4% | +1.1 ±0.4 | 50.6% | +2.1 ±0.6 | p4 |
| r-EladamrisCall | Song of the Worldsoul → Eladamri's Call | 20.4% | +1.1 ±0.4 | 50.6% | +2.1 ±0.6 | p4 |
| r-EsperSentinel | Song of the Worldsoul → Esper Sentinel | 20.3% | +1.1 ±0.4 | 49.6% | +1.1 ±0.6 | p4 |
| r-GrandAbolisher | Song of the Worldsoul → Grand Abolisher | 20.2% | +0.9 ±0.3 | 48.1% | -0.4 ±0.6 | p4 |
| r-ChordofCalling | Song of the Worldsoul → Chord of Calling | 20% | +0.8 ±0.3 | 49.7% | +1.1 ±0.5 | p4 |
| r-FlawlessManeuver | Song of the Worldsoul → Flawless Maneuver | 20% | +0.8 ±0.3 | 49.4% | +0.8 ±0.5 | p4 |
| r-ForceofVigor | Song of the Worldsoul → Force of Vigor | 20% | +0.8 ±0.4 | 48.5% | +0 ±0.5 | p4 |
| r-LightningGreaves | Song of the Worldsoul → Lightning Greaves | 20% | +0.8 ±0.4 | 48.4% | -0.1 ±0.5 | p4 |
| r-SelesnyaCharm | Song of the Worldsoul → Selesnya Charm | 20% | +0.8 ±0.3 | 49.1% | +0.5 ±0.6 | p4 |
| r-TeferisProtection | Song of the Worldsoul → Teferi's Protection | 19.9% | +0.7 ±0.3 | 49.5% | +0.9 ±0.5 | p4 |
| r-HeroicIntervention | Song of the Worldsoul → Heroic Intervention | 19.9% | +0.7 ±0.3 | 48.9% | +0.4 ±0.5 | p4 |
| r-EnlightenedTutor | Song of the Worldsoul → Enlightened Tutor | 19.6% | +0.3 ±0.4 | 49.6% | +1.1 ±0.6 | p4 |
