# Azusa lists vs Bracket 4 bots

`tools/sim/azusa/bench.sh HERO 600` on 18 processes: 10,800 four-player games per list, each against three
random Bracket 4 bots (the Azusa bot left out). Seeds, opponents and seats are the same for all three lists,
so the differences are paired game by game. A fair seat wins 25%.

| List | Win % ± SE | Paired vs repo list | Median win round |
|---|---|---|---|
| Repo Azusa (Dark Depths) | 16.3 ± 0.4 | — | 10 |
| v2 (Ashaya, Tyvar + Druid, Pod) | **24.2 ± 0.4** | +7.9 ± 0.5 | 7 |
| v3 (Ashaya, landfall) | 18.5 ± 0.4 | +2.2 ± 0.5 (−5.7 ± 0.5 vs v2) | 8 |

Engine errors and broken invariants: 0 in all 32,400 games.

**How the wins came**
- Repo list: Marit Lage 80%, Craterhoof without a combo 7%, other 12%.
- v2: unlimited mana in 39% of games (it won 59% of those). Ashaya + Argothian Elder 1662 games, Ashaya + Ley
  Weaver 1517, Tyvar + Devoted Druid 785, Elder + Wirewood Lodge 293. Of the wins, 85% came from those engines
  into Walking Ballista, 9% from Tyvar's pump into combat, and 3% from Craterhoof without a combo.
- v3: unlimited mana in 24% of games (it won 61% of those). Ashaya + Elder 1006, Ashaya + Weaver 996, Ashaya +
  Quirion Ranger 348, Elder + Lodge 283. Of the wins, 69% came through Ballista, 11% from Craterhoof without a
  combo, and 11% from combat and value.

**Ashaya**: on the battlefield in 71.5% of v2 games and 56.9% of v3 games (median first round 5). Opponents or
combat removed it in 21.7% (v2) and 22.1% (v3) of the games where it landed. The main culprits were Crux of
Fate, Deadly Rollick, Infernal Grasp, Vindicate, Beast Within and Chaos Warp.

Reproduce: `PROCS=18 tools/sim/azusa/bench.sh azusa-v2 600`, then `node tools/sim/azusa/summary.js tools/sim/azusa/out azusa-v2 azusa`.
