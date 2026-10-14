# Part 2 web page: regenerating its data

The page is `lab/part2/index.html` (static, no build step), served at
https://mkth0p.github.io/mtgpractice/lab/part2/. All its numbers come from `lab/part2/data.js`,
which `build-site-data.js` writes from the grid results. The page never sees raw cells, only
aggregates. Every headline sentence, tile, verdict and the "Preliminary: pass N of 3" banner is
computed from `data.js` when the page loads, so a new data file updates the page by itself.

## After a new pass (or phase 2) arrives

```
cd tools/sim/landmyth
node build-site-data.js /path/to/cells.jsonl.gz                 # one file
node build-site-data.js pass2/cells.jsonl.gz --play optimal phase2/cells.jsonl.gz   # part 1 rule + optimal
```

Then open `lab/part2/index.html` through a local server (`python3 -m http.server` from the repo root,
then http://localhost:8000/lab/part2/) and reread the headline and the "What the data says" boxes:
they are generated, but the plain-English reasons around them (for example "short games reward
hitting every land drop") were written for pass 1's results. Bump `data.js?v=1` in the page's
`<script src>` so browsers do not keep an old copy.

- Several files are merged; a cell seen twice (same play and id) keeps the last copy, so a pass 2
  file that already contains pass 1's cells is fine on its own.
- Torn last lines (a run stopped mid-write) are skipped and counted.
- Cost: pass 2 size (1.16M cells, synthetic test) takes about 45 s and under 1 GB of memory, and
  gives a `data.js` of about 640 KB (680 KB with a phase-2 file added). The target is < 1.5 MB.

Options:

| option | default | what |
|---|---|---|
| `--play part1\|optimal` | from the cell | play rule of the files that follow it. Without it, a cell's `play` or `policy` field decides (anything containing "opt" is optimal), then its `method`, else part 1 rule. |
| `--out FILE` | `lab/part2/data.js` | where to write |
| `--xT 4,6,8,10,12,15` | as shown | game lengths available in the explorer heatmap (the game-length chart always has every T from 3 to 15) |
| `--xScen all\|P1,P4,P8` | `all` | draw scenarios available in the explorer. Use a subset if pass 3 makes the file too big |
| `--date ISO` | now | the "generated" stamp (for reproducible output) |

Pass 3 (every deck, 8.6M cells) makes the explorer grid 29 x 26 per setting: about 4x pass 2's. If
`data.js` goes over the target, use `--xScen P1,P4,P8` or fewer `--xT` values.

## Phase 2 (optimal play) input

Expected: the same line format as phase 1's `cells.jsonl` (`shape, L, D, R, avg, cmd, sc`, and
arrays `V09` and `N` of 15 values for T = 1..15), where the value at T is the optimal-play value for
a game that ends at T, optimised for that score. Mark the file with `--play optimal` or put
`"play": "optimal"` in each line. If phase 2 stores a different layout (for example one record per
horizon or per objective), adapt `readFile()` in `build-site-data.js`; the rest does not change.
When both play rules are present, the page shows a "Play" toggle in every section and draws the
other rule's best land count as a dashed line in the game-length chart.

## What `data.js` holds (schema 1)

`window.LANDMYTH = { schema, meta, dims, ctx, summary, grid, robust }`

- `meta`: generation date, sources, δ = 0.02, the 36-40 band, coverage per play rule (cells, the
  highest complete pass, done/total per pass, solver methods per curve).
- `dims`: `plays`, `curves`, `cmds`, `avgs`, `scens`, `Ts` (3..15), `xT`, `xScen`, and the explorer
  axes `gL` (land counts) and `gR` (total ramp).
- `ctx`: one row per setting without T: `[play index, curve index, commander, average, scenario index, decks, partial]`; partial = 1 for a half-filled optimal-play setting kept by `--partial-optimal` (shown with a warning, left out of every summary across settings and of the robust picks).
- `summary`: base64 of gzip of planes, field-major, index `(ctx * 2 + metric) * Ts.length + (T - 3)`,
  metric 0 = V (useful mana, discount 0.9), 1 = N (useful spells cast, raw), the same two scores
  `run.js report` ranks. Fields: `bestL/D/R` (best deck), `landLo/Hi` and `srcLo/Hi` (lands, and
  lands + ramp, among decks within 2%), `nNear`, `best100` (best value x 100, u16), `band` (bit 0 a
  36-40 deck exists, bit 1 the best deck is in 36-40, bit 2 refuted by a deck under 36, bit 3 by one
  over 40; same rule as `run.js report`), `regBand` (best 36-40 deck), `reg3810` (best 38 lands + 10
  ramp deck), `regAllD` / `regAllR` (best deck's lands and ramp total, all dorks / all rocks).
  Regrets are bytes: ceil(regret x 1000), so 0.1% steps, 254 = 25.4% or more, 255 = not on the grid.
  "Within 2%" on the page is `byte <= 20`, which is exact because of the ceiling.
- `grid`: same encoding; `grid.ctx[ctx]` is the explorer index (-1 if not in `xScen`); index
  `((xctx * 2 + metric) * xT.length + k) * gL.length * gR.length + li * gR.length + ri`; the value
  is the regret of the best dork/rock split with those lands and that ramp total.
- `robust`: minimax regret per play, curve, average, commander (`"all"` or each cost when there are
  several), metric and scope (`all` = T 3-15 as in PREREG experiment 5 and `run.js report`; `mid` =
  T 6-12), over every scenario: `top` (3 decks: L, D, R, worst %, mean %), `band` (the most robust
  36-40 land deck), `nearLands`.

The page inflates the blobs with the browser's `DecompressionStream` (Chrome 80+, Safari 16.4+,
Firefox 113+) and says so if it is missing.
