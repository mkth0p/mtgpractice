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
