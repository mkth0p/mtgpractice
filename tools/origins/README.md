# Origins TCG study: how the numbers of `origins/` are made

Everything the page shows comes from `origins/data.js`, which `report.js` writes from the files in `out/`
(not committed: they are rebuilt by the steps below). The engine, the bots and the card data live in
`origins/` because the page runs the same code in the browser.

## Files

| File | What it does |
| --- | --- |
| `../../origins/cards.js` | Every card, Legendary power and location, checked against the game files |
| `../../origins/engine.js` | The rules. `RULES_MODEL` lists what was read in the game files and what had to be chosen |
| `../../origins/ai.js` | The three bots: `fast` (greedy), `std` and `strong` (plan against sampled opposing hands) |
| `../../origins/decks.js` | The real lists (ladder, Crimson Cup, wiki guides) |
| `real.js` | Real ladder, tournament and tier-list numbers, with their dates |
| `test-engine.js` | 291 checks of the engine against card texts and designers' notes |
| `matrix.js` | Round robin between lists, with paired seeds and swapped seats |
| `field.js` | The field of opponents for the deck search, weighted like the real ladder |
| `optimize.js` | Deck search for one Legendary: cross-entropy search, race, one-card climb |
| `refine.js` | Every one-card change of a search winner: the whole pool in every slot, then paired tests of the best |
| `collect.js` | Gathers the search winners for the round robin |
| `guide.js` | Play-guide numbers of one list, with the paired mulligan test |
| `trio.js` | Best three-deck line-up for Conquest with one ban |
| `botcheck.js` | One bot against another on random pairs of real lists |
| `analyze.js` | Field win rates, Nash mix, correlation with real data |
| `report.js` | Writes `origins/data.js` |
| `run-search.sh`, `run-finish.sh` | The whole pipeline, in two stages |

## Run it again (new patch, new lists)

1. Update `origins/cards.js` from the new game files and `origins/decks.js` and `real.js` from the trackers.
   Run `node tools/origins/test-engine.js`: all checks must pass.
2. Calibration on the previous patch, where real data is plentiful:
   `node tools/origins/matrix.js --patch 0.7 --n 40 --bot std --out cal07-std.json`
3. Round robin of the real lists on the current patch:
   `node tools/origins/matrix.js --n 50 --bot std --out now-std.json`
4. `bash tools/origins/run-search.sh` (deck search for the 12 Legendaries, then the round robin again with the
   searched lists; about 90 minutes on 4 cores). Set `REFINE="<legendary id>"` to also put every one-card change
   of that Legendary's winner to the test (`refine.js`, about 25 minutes more) before the round robin.
5. `bash tools/origins/run-finish.sh` (strong bot, other location pools, bots, play guides, `origins/data.js`;
   about 35 minutes on 4 cores). A step whose output is already in `out/` is skipped, so the script can be
   started again after a stop, and each step keeps its own log in `out/<name>.log`.
6. Bump the `?v=` numbers in `origins/index.html` and in the two `worker.js` references (`origins/ui.js` and the
   `importScripts` line of `origins/worker.js`) so that browsers fetch the new files.

Every script prints its options at the top of its file.
