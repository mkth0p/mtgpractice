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
