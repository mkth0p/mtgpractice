# Land myth part 2, phase 1: the exact goldfish model

Part 1 (`tools/sim/manabase/manasim.js`) estimated each mana base by Monte Carlo. Phase 1 of part 2 computes the same solo game **exactly**: every reachable game state is enumerated with its exact probability, so there is no sampling noise. Under part 1's own play and mulligan rules the two must agree, and they do (gates below). Phase 1 also measures how large the state space is, which decides what phase 2 (the optimal policy) can afford. The study design is in `PREREG.md`.

Plain Node.js (tested on v22), no dependencies.

## What it computes

Deck: 99 cards = L untapped lands, D dorks (cost 1, tap from the next turn), R rocks (cost 2, tap at once), S = 99 - L - D - R non-ramp spells, plus a commander in the command zone (cost 2 to 7, default 4 as in part 1). One draw a turn from turn 1, extra draws on turns 5-8 for P1-P8.

For a deck, a spell curve, a commander cost and a scenario, one solve up to T = 15 gives, for every horizon T = 1..15:

- `V09`, `V08`, `V10`: useful mana spent (spells and commander), discounted by 0.9, 0.8, 1.0 per turn;
- `N`, `N09`, `N08`: useful spells cast (non-ramp spells plus the commander), raw and discounted per spell;
- total mana made, unused mana, ramp mana, ramp cast, useful spells left in hand, expected commander turn;
- P(land drop missed by turn t), for t = 1..6 (a drop is missed when there is no land in hand that turn);
- the distribution of mana made each turn, and with `--dist` the exact distribution of useful mana (sd and CVaR of the worst 10%). `--dist` adds cumulative useful mana to the state, which costs about 1.5 to 1.7 times more states (measured on tight curves to T = 15).

Not yet computed: the PREREG "non-game" probability (fewer than 3 sources on turn 4, or two turns in a row with nothing cast). It needs two more bits in the state (about 2x states); add it when phase 2 settles the state layout.

### Spell curves

- **tight**: identical to part 1's `--mode avg`: total cost round(avg x S), split over the two integer costs around avg.
- **normal**: a normal with sd 1.0 discretised on costs 1..8 (tails folded into 1 and 8). Its centre is solved so that the discretised mean equals avg; counts are then rounded with largest remainders (ties to the cheaper cost) so they sum exactly to S. The realised average can differ from avg by a fraction of a card; exact.js prints it.
- (barbell was dropped from PREREG; its builder is still in `model.js` but is not used.)

### Play and mulligan rules (part 1, ported line by line)

Mulligan: hand 1 kept if it has 2-5 lands, or 1 land and 2+ ramp; else a fresh 7 (free mulligan) with the same rule; else a third 7 is always kept and one card goes to the bottom: a land if it has 4+ lands, otherwise the most expensive spell (if it has no spell: a land, else a dork, else a rock). The bottomed card is never drawn by T = 15, so it is simply out of the game.

Each turn: draw; play a land if one is in hand; if the commander is not cast, cast rocks while mana >= commander cost + 1, then the commander if mana >= its cost; on turns 1-6 cast rocks while mana >= 2, then dorks while mana >= 1; spend the most mana possible on spells (part 1's `bestSpend`, same search order so the same tie-breaks); from turn 7 rocks then dorks only with what is left.

## Files

| File | What |
|---|---|
| `model.js` | decks, curves, the state layout, opening-hand distribution, legal actions, applying an action. No policy. |
| `policy1.js` | part 1's play rule as a policy `(state, turn) -> action`. |
| `exact.js` | the exact forward solver (and the CLI). |
| `statetable.js` | compact hash table for states (a JS `Map` stops at 2^24 entries). |
| `part1.js` | loads part 1's own `mulligan()`, `play()`, `rng()` from `manasim.js` without running or editing it. |
| `check.js` | the phase 1 gates, prints PASS/FAIL. |
| `grid.js` | resumable, memory-aware grid runner (tight exact through shared graphs; normal with lump-hand-g2). |
| `measure.js` | state-space measurement (heuristic and optimal-policy reachability). |
| `reductions.js` | state reductions and approximations, each against the exact model. |
| `measure-results.json`, `reductions-results.json` | the measurements quoted below. |
| `realramp.js` | the real-ramp variant (off by default): colour profiles, deck mapping, its own runner and report (`node run.js --rocks real`). See "Real-ramp variant" below. |
| `pool.js`, `pool-caps.json` | the real card pool behind it: Commander-legal rocks and dorks per class for all 32 colour identities. |

## Running the grid: `run.js` (see RUN.md)

`node run.js` runs the phase 1 grid in three passes (coarse: steps of 4, 4 averages, commander 4, P1/P4/P8, 4,032 cells; medium: steps of 2, everything else full, 1.16M cells; full: 8.6M cells), skipping finished cells, fsync'ing one JSON line per cell to `landmyth-results/cells.jsonl`, and writing a preliminary `report.md` after each pass (near-optimal regions at T = 6/8/10/15, commander effect, the 36-40 necessity test, 38+10, minimax regret). `status`, `report`, `pack` and `selftest` subcommands. Tight is exact; normal (normal3) uses the lump-hand-g2 library on the same shared graphs. Tested here: kill -9 mid-run plus a torn last line, then resume, gives a file identical to a clean run (672 cells, 0 differing, no duplicates).

## How to run

```
node exact.js --deck 36:5:5 --shape tight --avg 3 --scenario P8 --T 15 [--cmd 4] [--nomull] [--dist] [--json]
node check.js                      # all gates (b1 is the slow one; --b1cfgs 0,2 picks a subset)
node check.js --only a,b3,c        # the quick ones
node grid.js --selftest            # graph pass == exact.js on a few decks
node grid.js --out results-grid    # the full tight grid, phase 1 rule; one command, resumable
node grid.js --out results-grid --step 2 --cmd 4 --scen P1,P8   # a slice
node measure.js --out measure.json # state counts (long; --cap limits each run)
node reductions.js --out red.json
```

`grid.js` writes one JSON line per finished cell to `<out>/cells-<shape>.jsonl`; stop it any time and rerun the same command to resume. It starts tasks biggest first while their estimated memory fits in `--mem` GB (default the smaller of 48 GB and 75% of RAM) and uses up to `--workers` threads (default all cores), printing cells done, elapsed time and ETA. Everything is plain Node with `path` and `os`, no shell scripts, so it runs the same on macOS, Windows and Linux. The big arrays are typed arrays outside the JS heap, so the default heap is enough; for single large `exact.js` or `measure.js` runs, `node --max-old-space-size=8192 ...` does no harm.

## Design: state, transitions, policy

State, at the start of a turn and again after the draw: library count of each card type, hand count of each type, lands / rocks / dorks on the battlefield, commander cast or not. Card types are land, dork, rock and one type per spell cost present. The library composition is exactly "deck minus cards seen", so this is the smallest Markov state that keeps draws exactly hypergeometric. Dorks need no "sick" flag: at the start of a turn every dork can tap.

Each turn is: draw step (one card at a time, probability k_i / N from the library composition, merging equal states), then decision (the policy picks an action, `model.applyAction` checks it is legal and applies it). Probability mass is pushed forward layer by layer; per-turn expectations are summed as they go, so one solve to T = 15 gives every T <= 15.

For phase 2 the same pieces give Bellman backward induction: `model.enumerateActions` lists every legal action of a decision state (only the non-dominated ones by default: in the solo goldfish, adding a castable card to a turn's plays never hurts, and the land drop is always taken), and the max over actions replaces `policy1`. The keep/mulligan choice and the bottomed card are already separate hooks in `model.openingStates`.

## Gate results (phase 1)

Run on 2026-10-13 (`node check.js`), all PASS:

- **a** land drops vs closed-form hypergeometric (5 tight decks + 1 normal, P1/P5/P8, with and without mulligan, T = 1..6): 36/36 PASS, max |diff| 8.6e-15 (target 1e-9).
- **b1** exhaustive enumeration through part 1's own `mulligan` + `play` (scripted shuffles, every hand and draw order): 6/6 PASS (plus 3 more earlier), max |diff| 1.9e-11.
- **b2** part 1 Monte Carlo, 200k games per config, P1/P4/P8, all metrics per T: 8/8 PASS, max |z| 3.26 (a land-miss probability; a 2M-game rerun with another seed gave z = 0.66), every other config max |z| <= 2.99.
- **b3** commander cost 2/3/5/7 vs an independent MC of the same rule: 4/4 PASS, max |z| 1.70.
- **c** sanity (probability mass 1 to 1e-12, mana identity, monotone in T, distribution means): 10/10 PASS.
- `node grid.js --selftest` / `node run.js selftest`: shared-graph pass == exact.js to <= 5.4e-12 (tight, exact) and <= 3.8e-12 (normal3, lump-hand-g2); runner round trip through the results file <= 4e-8 relative (8 stored digits).

No bug found in part 1.

## State space

Decision states (after the draw) summed over turns 1..T, part 1 rules, commander 4. Times are one thread on this machine (4 vCPU cloud box, other jobs running), about 1.5-2 µs per state. "est." = run stopped at a state cap and extrapolated from its last turns; ">" = lower bound only.

| Deck L:D:R | Curve (spell costs) | P1, T<=10 | P1, T<=15 | P8, T<=10 | P8, T<=15 | P8 time to 15 | P8 peak memory |
|---|---|---|---|---|---|---|---|
| 36:5:5 | tight 3.0 (3) | 54k | 188k | 381k | 769k | 1.3 s | 7 MB |
| 36:5:5 | tight 3.5 (3, 4) | 627k | 4.0M | 8.5M | 24.9M | 46 s | 0.5 GB |
| 36:5:5 | tight 4.0 (4) | 55k | 204k | 381k | 803k | 1.1 s | 7 MB |
| 30:6:8 | tight 3.0 | 89k | 346k | 734k | 1.6M | 1.8 s | 15 MB |
| 30:6:8 | tight 3.5 | 835k | 6.0M | 13.5M | 43.0M | 80 s | 0.5 GB |
| 30:6:8 | tight 4.0 | 93k | 383k | 754k | 1.7M | 2.1 s | 15 MB |
| 42:0:0 | tight 3.0 / 3.5 / 4.0 | 0.5k / 8.5k / 0.5k | 1.4k / 38k / 1.6k | 1.2k / 34k / 1.1k | 3.0k / 127k / 3.1k | < 0.3 s | < 2 MB |
| 28:10:12 | tight 3.0 | 124k | 570k | 1.3M | 2.9M | 4.3 s | 29 MB |
| 28:10:12 | tight 3.5 | 978k | 8.0M | 18.8M | 65.8M | 122 s | 1.0 GB |
| 28:10:12 | tight 4.0 | 129k | 595k | 1.3M | 3.2M | 4.3 s | 29 MB |
| 36:5:5 | normal 3.0 (1-5) | 73M est. | 2.2G est. | > 68M by t=6 | far more | - | 5 GB at t=6 |
| 36:5:5 | normal 4.0 (1-6) | 138M est. | 6.8G est. | > 91M by t=6 | far more | - | 10 GB at t=6 |
| 30:6:8 | normal 3.0 / 4.0 | 80M / 168M est. | 2.6G / 9.3G est. | > 75M / 112M by t=6 | far more | - | 10 GB at t=6 |
| 28:10:12 | normal 3.0 / 4.0 | 75M / 73M est. | 2.5G / 3.2G est. | > 69M / 50M by t=6 | far more | - | 5 GB at t=6 |
| 42:0:0 | normal 3.0 / 4.0 | 1.8M / 1.3M | 15.9M / 12.6M | 28M / 16M | 137M / 101M est. | ~5 min | 1.2 GB |

Memory: the solver keeps two layers in flat typed arrays, about 120 bytes per state of the largest layer at peak.

What drives the size:

- **The number of distinct spell costs** dominates everything. Each cost adds a library count and a hand count to the state. A single-cost curve (tight at an integer average) stays under 1M states to T = 15; two costs (tight at a fractional average) is 4-66M; the normal curve (5-6 costs with ramp, 4-5 without) is 1e9-1e10 at P1 and far more at P8.
- **Ramp**: dorks and rocks add two more types each with hand and library counts. A no-ramp deck with the normal curve is affordable (42:0:0: 16M at P1); with ramp it is not.
- **Extra draws**: P8 draws 3 cards on turns 5-7, which multiplies the layers on those turns; P8 costs 5-10x P1.
- **Commander cost** only adds a flag, but it moves where play goes: from cost 2 to 7 the heuristic's states change from -10% to +20% of cost 4 (tight 3.5, 36:5:5 and 28:10:12, P1 and P8); optimal-policy reachability changes by -27% to +3%. It does not change the picture, but the grid has 6 times as many cells.

### Optimal policy (phase 2)

States reachable under any non-dominated action (`measure.js`, mode optimal): | Deck | Curve | Scenario | Heuristic (exact) | Optimal, exact library | Optimal, lumped library |
|---|---|---|---|---|---|
| 36:5:5 | tight 3.0 | P1 / P8 | 188k / 769k | 1.06M / 3.93M (5.6x / 5.1x) | |
| 28:10:12 | tight 3.0 | P1 / P8 | 570k / 2.9M | 3.5M / 20.4M (6.2x / 7.0x) | |
| 36:5:5 | tight 3.5 | P1 / P8 | 4.0M / 24.9M | 26.5M / 164M (6.7x / 6.6x), 13 min to enumerate P8 | 6.4M / 32.3M |
| 28:10:12 | tight 3.5 | P1 | 8.0M | 61M est. | |
| 28:10:12 | normal 3.0 | P1 | 125M (lump-hand-g2) | | 1.9G est. (lump-hand-g2) |

 About 2 non-dominated actions per decision state. Phase 2 also needs one backward pass per horizon (the optimal policy depends on T), about 3.5 full passes for T = 3..15.

## Reductions and approximations (for phase 2)

Measured by `reductions.js` against the exact model, on decks where the exact model runs. Errors are the maximum relative error over T = 3..Tmax on V0.9, useful mana, N0.9 and N.

| Deck, curve, scenario, horizon | Exact states | lump-base | lump-hand | lump-hand-g2 | tail6 | tail8 |
|---|---|---|---|---|---|---|
| 36:5:5 tight 3.5 P1 T15 | 4.0M | x0.28, 0.15% | x0.28, 0.022-0.045% | exact (2 costs) | x0.02, 0.6-0.9% | x0.06, 0.4-0.8% |
| 36:5:5 tight 3.5 P8 T15 | 24.9M | x0.23, 0.20-0.21% | x0.23, 0.023-0.041% | exact | x0.02, 0.09-0.20% | x0.16, 0.07-0.13% |
| 30:6:8 tight 3.5 P1 T15 | 6.0M | x0.31, 0.14-0.15% | x0.31, 0.023-0.039% | exact | x0.02, 0.2-0.3% | x0.05, 0.3-0.5% |
| 28:10:12 tight 2.5 P8 T15 | 49.8M | x0.26, 0.11-0.14% | x0.26, 0.015-0.025% | exact | x0.02, 0.10-0.19% | x0.17, 0.13-0.31% |
| 42:0:0 normal 3 P1 T15 | 15.9M | x0.07, 0.40-0.47% | x0.04, 0.13-0.22% | x0.11, 0.031-0.039% | x0.01, 0.2-0.4% | x0.04, 0.2-0.4% |
| 42:0:0 normal 4 P8 T12 | 36.7M | x0.11, 0.95-0.98% | x0.06, 0.12-0.39% | x0.15, 0.052-0.075% | x0.01, 0.2-0.3% | x0.14, 0.07-0.14% |
| 36:5:5 normal 3 P1 T8 | 18.3M | x0.12, 0.26-0.27% | x0.11, 0.07-0.12% | x0.23, 0.020-0.035% | x0.21, 0.07-0.15% | |
| 28:10:12 normal 4 P1 T8 | 16.0M | x0.20, 0.27-0.32% | x0.17, 0.023-0.055% | x0.30, 0.026-0.070% | x0.19, 0.11-0.16% | |
| 28:10:12 normal 3 P1 T9 | 37.1M | x0.13, 0.25-0.26% | x0.11, 0.07-0.09% | x0.22, 0.033-0.077% | x0.10, 0.12-0.16% | x0.49, 0.003-0.013% |
| 36:5:5 normal 3 P8 T5 | 7.1M | x0.22, 0.25-0.27% | x0.20, 0.02-0.14% | x0.36, 0.002-0.040% | | |
| 28:10:12 normal 3 P8 T5 | 6.9M | x0.26, 0.24-0.26% | x0.23, 0.02-0.12% | x0.37, 0.021-0.077% | | |

Each cell: state ratio vs exact, then the range of the max relative errors on V0.9, V1.0, N0.9 and N. The full numbers are in `reductions-results.json`.

What each request came to:

1. **Exact lumping** gives nothing here. Spells too expensive to ever cast by T = 15 do not exist (mana reaches 8 well before turn 15); capping hand counts per cost at what remaining turns could cast never binds (the bound is tens of copies); dorks already carry no sick flag (every dork can tap at the start of a turn). Capping lands in hand at the land drops left is exact but changed state counts by under 1% (and slightly up in some P8 cases, because the cap is applied after the action while the next draw can still separate states).
2. **Factorisation** (mana chain exact, spells fitted on it) is not a reduction. Up to turn 6 the part 1 rule does make lands/dorks/rocks/commander independent of spell costs, but the spells' outcome depends on the whole path of leftover mana, so an exact answer needs the joint state anyway; from turn 7 ramp only takes what spells leave, so even the mana chain depends on spells. For phase 2 it does not apply at all: the optimal choice between ramp and spells couples them every turn. Not implemented.
3. **Library approximation** is the one that works. `lump-base` (draw costs from the deck's base mix) is biased by 0.1-1%. `lump-hand` (base mix minus the copies in hand and a proportional share of what was cast) is 5-10x better for the same states. `lump-hand-g2` keeps two library counts (costs up to the average, costs above), is exact for tight curves, and stays within 0.08% on V and N for the normal curve, for 3-10x fewer states than exact. It is a Markov state, so Bellman backward induction works on it unchanged.
4. **Hybrid** (exact to turn k, one sampled continuation per state after) has sampling error of 0.1-1.5%, larger than lump-hand-g2's bias, and cannot be used for an optimal policy (the tail has no values to maximise over). Not recommended.

## Cost of the full grid and recommendation

Cells per commander cost and scenario: 8,149 compositions (lands 20-48, dorks 0-15, rocks 0-20, ramp <= 25) x 11 averages = 89,639 per curve shape. For tight, 65,192 cells have two spell costs and 24,447 one. The full grid is x 2 shapes x 6 commander costs x 8 scenarios = 8.6M cells; each cell gives every T = 3..15.

**The trick that makes tight affordable: one graph for many decks.** Written in "cards seen" coordinates, the game graph under a fixed policy does not depend on how many lands, dorks, rocks or spells the deck has; only the draw probabilities do. So `grid.js` builds one graph per (set of spell costs, commander cost, scenario), which is 6 x 6 x 8 = 288 graphs for tight, and evaluates each deck with one pass over the graph's edges. The pass gives the same numbers as `exact.js` (checked to ~1e-12, `node grid.js --selftest`) and is 25-45x faster than a direct solve on two-cost curves: the largest graph (tight 3.5, P8, T = 15) has 104M states and 227M edges, takes 162 s to build in 2.4 GB, then 1.8-3.0 s per deck instead of 47-136 s.

| Run | Work on this box (core-days) | Memory per worker | Fits the Mac (18 cores, ~48 GB for workers)? |
|---|---|---|---|
| Phase 1 rule, tight, full grid, exact (`grid.js`) | ~8 per commander cost, ~48 for all six | 1-cost graphs < 0.3 GB; 2-cost graphs ~0.6 GB (P1) to ~3.5 GB (P8), +20% for commander 5-7 | Yes: about 2 days (assuming a Mac core ~1.5x this box; the P8 two-cost graphs run ~12 at once, the rest on all cores). Steps of 2 in lands/dorks/rocks (1,095 compositions): ~7 h. |
| Phase 1 rule, normal, exact | 1e9-1e10 states per ramp deck at P1, far more at P8 | tens to hundreds of GB | No. |
| Phase 1 rule, normal, lump-hand-g2 (`grid.js --shape normal`) | 3-7 min per ramp-deck cell at P1, ~20-25 min at P4; ~1,500 core-days for P1 alone over the full grid | ~5 GB per cell at P1 (ramp decks; no-ramp decks ~1 GB), ~10 GB at P4; P5-P8 above 12 GB and not measured to T = 15 (> 80M states by turn 7) | Only small slices (a few hundred cells, P1-P4). |
| Phase 2 (optimal), tight, exact library | ~45x phase 1 (6-7x states, ~2 actions per state, one backward pass per horizon ~3.5x): ~2,200 | universal optimal graphs ~0.5-1G states at P8: 15-30 GB | No. |
| Phase 2, tight, lump-hand library, compositions in steps of 2, averages in steps of 0.5 | ~30 (lump-hand x0.25, steps of 2 x0.13, averages x0.4) | ~6-8 GB at P8 | Yes, about 3-4 days (memory-bound: ~6 P8 graphs at once). Error of lump-hand on tight: under 0.05% on V and N. |
| Phase 2, normal (any reduction tried) | 28:10:12 normal 3.0 P1 alone: ~1.9G states with lump-hand-g2 | > 64 GB | No. |

Commander cost multiplies the cell count by 6; it changes state counts by only -10% to +20%, so the work scales by about 6.

**Recommendation for phase 2.**

1. Build phase 2 on the shared graph: build the optimal-policy graph once per (cost set, commander cost, scenario) with `model.enumerateActions`, then run backward induction per deck and per horizon over it. The action set does not depend on the deck, only the draw probabilities do.
2. Use the lump-hand library for tight (error < 0.05% on V and N, 3-4x fewer states), and log the coarsening PREREG already allows: lands/dorks/rocks in steps of 2, and averages in steps of 0.5 for phase 2. The phase 1 rule can still cover the full tight grid exactly.
3. The normal curve, as defined (5-6 costs), is out of reach for an exact or near-exact optimal policy on any machine available, and for the phase 1 rule beyond small slices. Options to put to ju: (a) fold the normal onto 3 costs (`normal3` in `model.js`, not in PREREG; 28:10:12 at P1: 62M exact states, 22M with lump-hand-g2, between tight and normal; optimal-policy counts not measured); (b) keep normal for the phase 1 rule only, on a coarse slice at P1-P4; (c) evaluate normal decks under policies optimised on tight. Each needs a PREREG change-log entry.

## Part 1 notes

No bug was found in part 1: the exact model reproduces part 1's own `mulligan()` and `play()` to 1e-11 on every enumerated game. Points to know when reading part 1's numbers:

- The third hand is always kept (even with 0 lands) and only one card is bottomed; there is no fourth hand. This matches its comment ("le 2e met 1 carte en dessous") and PREREG's "first mulligan free, then London" only up to the second mulligan.
- With no spell in the third hand and fewer than 4 lands, the bottom rule puts a land under (part 1 picks the highest card code, and a land's code is above a dork's and a rock's), even from a 1-land hand full of ramp. Rare, but it is a land, not a ramp piece, that goes.
- No maximum hand size (no discard down to 7).
- `gen8` / `useful8` stay 0 when `--turns` is below 8.
- `node manasim.js one ...` writes `results-one-*.json` into `tools/sim/manabase/` unless `--out` is given.
