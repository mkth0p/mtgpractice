# Mana base Monte Carlo

Goldfish simulator behind the Lab page (`lab/`). Tests every mana base from 35 to 55 sources (lands, 1-mana dorks, 2-mana rocks) across deck curves and the P1-P8 extra-draw scenarios, with a 4-mana commander cast first.

- `manasim.js`: the simulator (`sweep`, `split`, `one`; `--mode avg` fixes the average spell cost, `--mode budget` fixes the total cost of the 99).
- `analyze.js`: regret rankings (worst case across scenarios) as Markdown, optional CSV.
- `build-lab-data.js`: packs results into `lab/mana-data.js`.

```
node manasim.js sweep --mode avg --games 5000
node manasim.js sweep --mode budget --games 5000
node manasim.js split --mode avg --games 20000 --configs 32:5:5,32:6:6
node build-lab-data.js results-sweep-avg-tight.json results-split-avg-tight.json results-sweep-budget-tight.json > ../../../lab/mana-data.js
```
