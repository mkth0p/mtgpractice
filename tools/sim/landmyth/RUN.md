# Running the grid on a Mac

Nothing to install except Node.js 18 or newer (`node --version` in Terminal; if it is missing, get the macOS installer from nodejs.org). No npm packages.

## Start

1. Unzip the folder you were sent, for example into `Downloads`.
2. Open Terminal and go into it:
   ```
   cd ~/Downloads/landmyth
   ```
3. Start the run, keeping the Mac awake while it works:
   ```
   caffeinate -i node run.js
   ```

It uses every core and about 48 GB of memory at most (on a 64 GB Mac). To leave room for other work, use for example `--workers 12 --max-mem 32`.

Results go to `landmyth-results/` inside the folder (`--out DIR` to put them elsewhere).

The run has three passes, each adding finer detail:

| pass | what | cells | rough time on a 64 GB / 18-core M5 Max |
|---|---|---|---|
| 1 coarse | lands/dorks/rocks in steps of 4, avg cost 2.5-4, commander 4, draws P1/P4/P8 | 4,032 | 10-20 minutes |
| 2 medium | steps of 2, every avg cost, commanders 2-7, P1-P8 | 1.16 M | about 1-2 days |
| 3 full | every deck in the pre-registered grid | 8.6 M | about 1-2 weeks |

A preliminary `report.md` is written automatically when each pass ends. To stop after pass 1 or 2, add `--pass 1` or `--pass 2`.

## Stop and resume

Stop any time: Ctrl-C, closing the lid, a crash or a power cut. Every finished deck is saved to disk immediately. To carry on, run the same command again (`caffeinate -i node run.js`); finished decks are skipped. At most the decks being worked on at that moment are redone.

## Check progress

In a second Terminal window, in the same folder:
```
node run.js status
```
It shows each pass as done / total and the time left. Time-left figures start as a guess and become accurate after the first tasks finish.

## Get the results

```
node run.js report     # writes landmyth-results/report.md from whatever is done so far
node run.js pack       # writes landmyth-results/cells.jsonl.gz
```
Send back **`landmyth-results/report.md`** and **`landmyth-results/cells.jsonl.gz`**. After pass 1, the .gz is small (a few MB). After pass 2 it is about 1 GB; after pass 3, several GB (use a file-transfer service).

## If something looks wrong

`node run.js selftest` (about 2 minutes) checks the runner against the reference solver and prints PASS or FAIL. If a run stops with an error, just rerun it; if the same error comes back, send the last lines of the Terminal output.
