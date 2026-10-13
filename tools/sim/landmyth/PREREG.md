# Land count myth, part 2: pre-registration

Written 2026-10-13, before any part 2 run. Choices marked (ju) were made by ju; the rest are defaults set here and fixed from now on. Any later change is logged at the bottom with its reason, and results are reported under both the old and the new choice.

## Claims under test

| Claim as people say it | Reading tested | Refuted when |
|---|---|---|
| "You need 36-40 lands" | Necessity | a deck with lands outside 36-40 scores within δ of the best deck inside 36-40, for that archetype and scenario |
| "38 lands + 10 ramp is right" | Optimality | the set of decks within δ of the exact optimum excludes 38+10 |
| "One number fits every deck" | Universality | the optimal land count moves with curve, commander cost or game length |
| "A rock is half a land" | Exchange rate | the land-equivalent of one ramp piece varies with ramp kind, curve or game length |
| "Ramp shouldn't replace lands" | Dominance | some archetype's optimum has fewer lands and more ramp than a 36+ land deck, by more than δ |

## Deck model

- 99 cards plus a commander in the command zone. Commander cost is a main factor (ju): every cost from 2 to 7, in all solo results from phase 2 on. Phase 1 validation uses cost 4 to match part 1.
- Roles in phases 1-2: untapped land; 1-mana dork (taps the turn after it is cast); 2-mana rock (taps at once); non-ramp spells. Phase 3 adds tapped lands, 0-mana ramp, land ramp, draw spells that cost mana, and a mana sink.
- Spell cost spreads (ju: several spreads): average spell cost 2.0 to 4.5 in steps of 0.25, each under three shapes:
  - tight: only the two integer costs around the average;
  - normal: a discretised normal around the average, standard deviation 1.0, costs 1 to 8;
  - barbell: half the spells cheap (1-2), half expensive (5-7), matched to the average.
- Draws: one card a turn from turn 1 (multiplayer). Extra-draw scenarios P1-P8 on turns 5-8, as in part 1.
- Mulligans: phase 1 uses part 1's rule (keep 2-5 lands, or 1 land + 2 ramp; first mulligan free, then London). Phase 2 replaces it with the optimal keep/mulligan decision.

## Game lengths (ju)

Every ending turn T from 3 to 15 is its own scenario. A scenario is (T, extra-draw pattern P1-P8). That is 13 x 8 = 104 scenarios per archetype.

## Outcomes

- **Primary (ju):** discounted useful mana, V = sum over turns t <= T of 0.9^(t-1) x useful mana spent on turn t. Useful mana is mana spent on non-ramp spells and on the commander. Mana spent on ramp is not useful in itself; it pays off through the mana it makes later.
- **Co-primary (ju):** useful spells cast, N = number of non-ramp spells plus the commander cast by turn T (ramp spells not counted). It measures how reactive and fluid the deck is. Reported raw and discounted the same way (0.9^(t-1) per spell cast on turn t). Every ranking, near-optimal region and test is run separately for V and for N, and the two are published side by side; where they disagree is a result in itself.
- The discount 0.9 is fixed here. Results are also reported at 0.8 and 1.0 (no discount) as a sensitivity check.
- **Also reported for every deck and scenario (ju):** total mana made, useful mana (undiscounted), unused mana, spells cast, useful spells left in hand, with every extra draw counted.
- **Consistency:** probability of a non-game (fewer than 3 mana sources on turn 4, or two turns in a row with nothing cast), the mean of the worst 10% of games (CVaR), and the turn-by-turn distribution of mana made.

## Margin (ju)

- δ = 2% of the best deck's value (V or N, whichever is being ranked) in the same archetype and scenario. Decks within δ are "as good as the best".
- Every gap is also reported raw, in mana and in percent, so differences inside δ stay visible (ju).
- The exact model has no sampling noise, so a gap is a fact, not an estimate. Equivalence tests (TOST with δ) apply only to parts that are sampled: hazards if they are simulated, and the engine cross-check.

## Composition grid

Lands 20 to 48, dorks 0 to 15, rocks 0 to 20, total ramp at most 25 (widened by ju, see change log). Every composition is solved exactly for every archetype and scenario that the phase 1 state-space measurement shows is affordable; if not, the grid is coarsened to steps of 2 and the change is logged here.

## Experiments (phase 4)

1. Near-optimal region per archetype and scenario (decks within δ).
2. Necessity test of the 36-40 range.
3. Universality: optimum against curve, spread, commander cost (2 to 7) and T.
4. Exchange rates: iso-value curves in (lands, dorks) and (lands, rocks).
5. Robust choice: minimax regret over all 104 scenarios, and over T alone.
6. Drivers: Morris screen, then Sobol indices over lands, ramp kind, curve, spread, commander cost, draw and T; hazards only in the separate disruption variant.
7. Speed against consistency: Pareto front of V against non-game probability; stochastic dominance between bases.
8. Formula check: Karsten's formula against the exact optimum.

## Disruption (ju: after solo games, never by default)

All headline results are solo games with no disruption (ju). Disruption is an optional layer, added in phase 3 after the solo results are published, and always reported as a separate variant: dork death per opponent turn, rock and land destruction, and board wipes, with rates per bracket taken from published bracket data (sources logged when chosen). Game length per bracket comes from the same data.

## Gates

- Phase 1: the exact model's land-drop probabilities match the hypergeometric tables exactly, and under part 1's play rule its averages match part 1's Monte Carlo within sampling error.
- Phase 2: the optimal policy never scores below the part 1 heuristic, and reproduces Karsten's optimum under his own objective.
- Phase 3: monotonicity checks (more disruption never helps; more draw never hurts) and deck rankings that agree with the game engine.

## Change log

- 2026-10-13, before any run (ju): ramp range widened from dorks 0-12 / rocks 0-16 / total 20 to dorks 0-15 / rocks 0-20 / total 25. Disruption made explicitly off by default; it is only ever a separate variant.
- 2026-10-13, before any run (ju): commander cost made a main factor, every cost 2 to 7, instead of 2/4/6 in phase 3.
- 2026-10-13, before any run (ju, after feedback from a friend who rates decks by spells cast): useful spells cast made a co-primary outcome, ranked separately from discounted useful mana. A real-deck curve shape was considered and not added.
