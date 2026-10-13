# Running the grid on a Mac (phase 1; phase 2 at the end)

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

# Phase 2: the optimal policy

Same folder, same Node, nothing to install. Phase 2 has its own results files (`cells-p2.jsonl`, `report-p2.md`) next to phase 1's in `landmyth-results/`; the two never touch each other.

## Pass 1 on the Mac (start here)

```
caffeinate -i node run.js --phase 2
```

That runs pass 1 (4,032 cells: lands/dorks/rocks in steps of 4, averages 2.5-4, commander 4, P1/P4/P8, tight and normal3; optimal play for V0.9, N, V0.8 and V1.0 at every horizon 3-15). It uses every core and at most max(75% of RAM, RAM - 24 GB) of memory: 48 GB on a 64 GB Mac. `--workers 12 --max-mem 32` leaves room for other work, at the cost of time.

Expect about 2-3 days on the 18-core Mac. The 28 largest normal3 P8 graphs (decks with much ramp) need 60-125 GB each, so on a 64 GB Mac their 352 cells are skipped and listed (in `status`, the report and `skipped-p2.json`); everything else runs. Every few seconds the run prints cells done, time left, threads and memory in use; while a big graph is being built, the cell count does not move for many minutes, which is normal.

Stop and resume exactly as in phase 1 (Ctrl-C, sleep or crash, then the same command again). Finished cells are kept; the graphs being worked on are redone.

```
node run.js --phase 2 status    # done / total per pass, time left, skipped graphs
node run.js --phase 2 report    # writes landmyth-results/report-p2.md from what is done
node run.js --phase 2 pack      # writes landmyth-results/cells-p2.jsonl.gz
node run.js --phase 2 selftest  # about 4 minutes: brute-force check plus a small runner round trip, PASS/FAIL
node run.js --phase 2 plan --ram 64 --max-mem 48 --workers 18   # estimate only, runs nothing
```

Send back `report-p2.md` and `cells-p2.jsonl.gz` (a few tens of MB after pass 1).

## Running a slice

`--shapes tight|normal3`, `--scens P1,P4`, `--cmds 2,4,7`, `--avgs 3,3.5` restrict a run to part of the pass; results go to the same file, so slices add up and a later full run skips them. Example, tight only (about 1 day on the Mac): `caffeinate -i node run.js --phase 2 --shapes tight`.

## On a big Linux box (for example 192 cores, 384 GB)

```
nohup node run.js --phase 2 > phase2.log 2>&1 &
tail -f phase2.log         # or: node run.js --phase 2 status
```

It finds the cores and memory by itself (default memory cap: RAM - 24 GB, here 360 GB), so pass 1 runs completely, normal3 P8 included, in about 1-1.5 days. Node 18 or newer; if `node --version` is older, install a current Node first. Copy `landmyth-results/` back (or just the two files above).

## Pass 2

Pass 2 as specified (steps of 2, averages 2-4.5 in steps of 0.5, commanders 2-7, P1-P8) is about 1,300 core-days, too much even for the big box. It only runs when asked (`--pass 2`) and is meant to be run on a slice. Options and their costs are in `PREREG-proposed-changes.md`; for example option C, on the big box:

```
nohup node run.js --phase 2 --pass 2 --cmds 2,4,7 --scens P1,P4,P8 --shapes tight > p2a.log 2>&1 &
# then: node run.js --phase 2 --pass 2 --cmds 2,4,7 --scens P1,P4 --shapes normal3
```

Use `plan` with the same flags first to see the time on that machine.
