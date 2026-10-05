# Where this stands (2026-10-05, 22:05) and how to continue

## Done
- Research: `../sources/bracket4-deckbuilding.md` (official bracket definitions, Game Changers, the numbers optimized decks run), `../sources/bracket4-piloting-and-aggro.md` (threat assessment, mulligans, sequencing, how aggro closes at high power, Dimir archetypes, theft), `../sources/public-lists.md` (30 Etrata lists, EDHREC data), `../sources/heist-research.md` (72 cards with exact Oracle text, Game Changer flag, cheapest printing and URLs). `../sources/etrata-strategy.md` was still being written by a research agent when the session ended; if it exists, read it before changing the versions.
- `STRATEGY.md`: the design rules derived from the research; `EXPERIMENTS.md` and `xp/xp.log`: every bench; `DECISIONS.md`: every choice and why.
- Engine: `miku/game/decks-heist.js` defines about 90 new cards (typal payoffs, halvers and doublers, Hatred, ninjas, free interaction, Mana Drain, recursion, Ramses tutors) and the heist deck `MK.ETRATA_HEIST_DECK` (id `etrata-heist-aggro`) with its brain (mark one opponent, combat model with halvers and Bloodletter, Bracket 4 mulligan, tutor order Ramses first, closers' hooks). `node tools/sim/test-heist.js`: 117 checks pass; the other suites pass too.
- Measured so far (2,016 paired games per field): the aggro skeleton A2 wins 34.4% vs precons and 18.5% vs Bracket 4; Etrata is worth 11.5 / 4.2 points in it; Ramses is worth 14 / 5.6, Bloodletter 2.9 / 2.3, and every other card is within ±1.5 of a basic land (cut sweep in EXPERIMENTS.md). Wipes decide 56% of the losses vs precons.

## Running when the session ended (results land by themselves)
- `xp/versions1.sh`: the three Bracket 4 versions `lists/v1-blitz.txt`, `lists/v2-snowball.txt`, `lists/v3-tempo.txt` vs both fields, paired against `skA2-0`, with telemetry. Read them with:
  `grep -E " (v1-blitz|v2-snowball|v3-tempo)-b[24] " research/etrata-theft-aggro/local/xp/xp.log` and `node tools/sim/bench/telesum.js tools/sim/bench/out v1-blitz-b2` (and `-b4`, and the other versions).
- `xp/cutsweep.sh` on A2 (reference only).

## Next steps
1. Read the version results; log them in EXPERIMENTS.md (#27+). Pick the best; run `node tools/sim/bench/trace.js` and `castrate.js`/`firstseen.js` on it to see why it loses.
2. Hill-climb by packages (not single cards): closer package, interaction density, land count 30–33, type-changer count; each 2,016 paired games via `tools/sim/bench/xp.sh BASE NAME VARIANT_JSON` with `source research/etrata-theft-aggro/local/xp/env.sh`.
3. Confirm the finalist with 5,040 games (`N=280`), then `NO_COMMANDER=1` on it, then telemetry; write `REPORT.md`, `decklist-<name>.txt` and `prices-<name>.csv` (`node research/etrata-theft-aggro/local/scryfall/price.js LIST --csv OUT`). Prices so far: v1 $1,347, v2 $1,322, v3 $1,252 (all under the $1,500 cap; Esper Sentinel in v1 isn't priced in the index).
4. `git push -u origin etrata-heist-aggro-research` from a machine with GitHub credentials (this Mac has none).
