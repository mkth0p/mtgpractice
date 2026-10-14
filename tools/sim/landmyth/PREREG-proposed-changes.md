# Proposed PREREG changes for phase 2 (for ju to review)

Nothing here is in PREREG.md yet. Each item is a proposed change-log line, then the reason and its measured cost. Numbers are from README "Phase 2"; "core-days" are single-thread days on the 4-vCPU reference box (a Mac M5 core is roughly 1.5x faster). `node run.js --phase 2 plan --workers N --max-mem GB --ram GB [--shapes ...] [--scens ...] [--cmds ...]` reprints every cost below for any machine and slice.

## Proposed change-log lines

1. *2026-10-13, phase 2, before any phase 2 run (proposed):* the optimal mulligan allows the first mulligan free, then London down to 5 cards (hands of 7, 7, 6, then a 5-card hand that is always kept, best cards bottomed). Part 1 always kept the third hand (6 cards). Results also report the value with the forced keep at 6 cards (part 1's depth), so the effect of depth is visible.
   - Why: going deeper is exact but costs states: each extra level adds about one depth-2 graph (tight 3.0 P1: 6.6M states at depth 2, 13.6M at 3, 22.3M at 4, 31.9M at 5). Depth matters at short games (tight 3.0 36:5:5 P1, T = 3: optimum 4.45 / 4.77 / 5.01 / 5.15 for depth 2 / 3 / 4 / 5) and little at long ones (T = 6: 12.21 / 12.38 / 12.43 / 12.44; T = 15: under 0.5% median from 2 to 3).

2. *2026-10-13, phase 2 (proposed):* when several actions are optimal (equal value within 1e-12 relative), the policy takes the one with the larger immediate secondary reward (useful spells for the V-optimal policy, useful mana for the N-optimal one), then the first in a fixed enumeration order; equally good keep/mulligan choices keep. This changes no optimal value, only which optimal policy the secondary outputs (gen, unused, left, ...) describe.

3. *2026-10-13, phase 2 (proposed):* discount sensitivity (separate 0.8 and 1.0 optimal solves) only on the pass 1 grid. Each extra discount is a full extra solve (doubles pass 1's solve time); pass 2 reports 0.8 and 1.0 only as evaluations of the 0.9-optimal policy (V08, V10 fields).

4. *2026-10-13, phase 2, grid (proposed, choose one option):* the phase 2 medium pass (ju's spec: lands/dorks/rocks in steps of 2, averages 2.0-4.5 in steps of 0.5, commanders 2-7, P1-P8, tight and normal3) is coarsened, because as specified it is about 1,300 core-days: tight 199, normal3 about 1,100 (normal3 graphs at P5-P8 need 60-125 GB each, beyond the Mac; normal3 P8 alone is about 280 core-days).

   | option | grid | core-days | 192-core / 384 GB box | Mac (18 cores, 48 GB) |
   |---|---|---|---|---|
   | A | tight as specified; normal3 P1/P4, commanders 2/4/7 | 199 + 78 | about 6 days | out of reach (about 60 days) |
   | B | tight P1/P4/P8, all commanders; normal3 P1/P4, commanders 2/4/7 | 78 + 78 | about 4 days | about 40 days |
   | C | tight P1/P4/P8, commanders 2/4/7; normal3 P1/P4, commanders 2/4/7 | 39 + 78 | about 3.5 days | about 32 days |
   | D | C with mulligan depth 2 (forced keep at 6, as part 1) | about 60 | about 2 days | about 16 days |

   Wall-clock figures are the planner's estimates at reference speed and are pessimistic for the big box (its builds overlap); they should be re-read from `node run.js --phase 2 status` once the first graphs have calibrated the model. My recommendation: run pass 1 first (below), then option A or B on the rented box. The Mac alone can do pass 1 without normal3 P8, and small slices of pass 2.

5. *2026-10-13, phase 2, pass 1 (no change, noted):* pass 1 is ju's coarse grid (steps of 4, averages 2.5/3/3.5/4, commander 4, P1/P4/P8, both curves): about 16 core-days. the 28 largest normal3 P8 graphs need 60-125 GB, so on the Mac their 352 cells are skipped (listed by `status`, the report and `skipped-p2.json`); the rest of pass 1 is about 2-3 days on the Mac. On the 192-core box all of pass 1 is about a day.

## Not changes (implementation only, results identical)

- Graphs are cut per ramp class (one per dork count and range of rock counts) instead of one universal graph per curve: a deck with D dorks and R rocks never sees more, so the states it cannot reach are left out. Same values to the last digit (checked), 2-3x less work and memory.
- The heuristic baseline in every phase 2 cell is part 1's rule computed with phase 1's code on the same deck, so every cell checks gate a by itself.
