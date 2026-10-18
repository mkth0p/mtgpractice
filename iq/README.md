# Cognitive test practice (hidden)

Practice tasks modeled on the published formats of adult intelligence batteries (WAIS-5, WAIS-IV,
WASI-II, Raven's, ICAR), for a before/after training study. Reachable at `/iq/` only; nothing on
the site links to it and the page asks search engines not to index it.

- **No real test items.** `gen.js` builds every item from a seed (same seed, same item), following
  the formats and difficulty rules documented in `research/iq-training/`.
- `gen.js` item generators (matrices, figure weights, visual puzzles, block design, spans,
  arithmetic, series, speed tasks). Runs in Node too.
- `tasks.js` one entry per task: the real subtest it follows, its administration rules (ladder,
  span or speed), how to draw and score an item. `verbal.js` Similarities and Vocabulary
  (typed answers, self-scored in practice, exported for blind rating under standard rules).
- `content.js` the text of each task page and the Method page. `app.js` router, runners, study
  mode (double baseline, Latin-square forms A to D, groups), export to JSON and trial-level CSV.
- Data stays in `localStorage` (`iqPractice.v1`) until exported.

Tests: `node tools/iq/test-gen.js` (every generator, single right answer) and
`node tools/iq/iq-walk.js [--only matrix,dsf] [--shots dir]` (plays every task in Chromium).
Assets use `?v=` in `index.html`; this section has no service worker.
