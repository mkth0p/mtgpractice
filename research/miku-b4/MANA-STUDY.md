# Mana efficiency study: Mano's question, measured

**Question (from Mano):** over a deck's first 8 turns, how much mana does it make, how much goes into useful spells (not ramp), and how much is wasted? Mano's own deck makes about 40 mana and wastes about 11. Drawing more cards cuts the waste, with returns shrinking after about 2 extra cards. Competitive decks run 26-28 lands and 12-14 accelerants.

**What we did:**
- Rebuilt Mano's method as a fast model (`tools/sim/manamodel.js`) and checked it against Mano's numbers.
- Added the same measure to the game engine's bot games (`tools/sim/bench/mana.js`). Real decks were measured against three Bracket 4 bots and against a goldfish (three opponents who do nothing).
- Swept land, ramp and draw counts on the one shortlisted Miku deck the engine can play (Corrupted Miku, Shalai), and checked what actually moves the win rate.

Every engine run below used fixed seeds. Re-running the base list gave identical games: same wins, same mana.

---

## 1. Short answers

1. **Mano's numbers reproduce.** With 30 lands, 14 ramp pieces and a middling curve, the model makes 39.5 mana in 8 turns: 3.4 on ramp, 4.4 on the commander, 20.6 on spells, 11.1 wasted. Mano reports 40, 2, 5, 22 and 11. The extra-draw curve also matches: the first 3 extra cards save about 0.6 mana each (Mano 0.63), and the gain per card shrinks after that.
2. **Wasted mana is the wrong thing to minimise on its own.** In the model, cutting lands always cuts waste, but useful mana barely moves: from 28 to 36 lands it changes by less than 1. A deck with too few lands "wastes" little because it never has spare mana. Useful mana spent, and above all the turn the deck wins, are what to optimise.
3. **For a combo deck, mana isn't the bottleneck.**
   - Across 11 engine decks, win rate tracks the share of goldfish games won by turn 6 (correlation 0.87, the only strong one). It barely tracks waste (−0.28) or useful mana (0.39).
   - Inside Corrupted Miku's games, the games with the most early waste (the top quarter, 6.3 mana wasted in turns 1-4) win 25% against 32% for the rest. That's flood. Useful mana spent early doesn't predict wins at all.
4. **On Corrupted Miku, none of the sweeps beat the current list.**
   - Mano's direction (fewer lands, more draw) lost: 3 lands → 3 draw spells −1.4 ±0.9 points, 6 lands → 6 draw spells −6.1 ±1.2.
   - Six more draw spells in place of flex cards also lost (−3.9 ±1.0).
   - +3 lands was neutral (−0.6 ±0.9) and raised the keep-7 rate from 63% to 68%.
   - Waste stayed between 5.9 and 6.7 mana in every version.
5. **Activated abilities soak up spare mana.** The model, which only knows spells, says Corrupted Miku would waste 16.6 mana. The engine measures 6.6, because Gavony Township, Shalai's pump, Walking Ballista, X spells and the combo loops use the spare mana. The difference is about 10 mana of abilities.
6. **Published data don't support "26-28 lands and 12-14 accelerants" as one package** (pass 2's `mana-sources.md` and `public-lists-shape.csv`, 73 lists):

   | Lists | Count | Lands | Accelerants |
   |---|---|---|---|
   | Bracket 4 lists | 44 | 33.7 | 10.6 |
   | cEDH / Bracket 5 lists | 22 | 28.9 | 17.5 |

   Mano's 26-28 lands is cEDH territory, and there it comes with about 17 accelerants. Frank Karsten's models wouldn't go below 29-33 lands even for ritual-heavy cEDH.

---

## 2. Rebuilding Mano's model

`node tools/sim/manamodel.js` is a 99-card goldfish over 8 turns. Each turn it plays a land, casts ramp while it can, then spends the rest on the set of spells (and the commander) that uses the most mana. Waste is mana available minus mana spent. "Energy" means extra cards drawn over the 8 turns, spread evenly. The keep rule is 2-5 lands with at least 3 mana sources.

Mano's shape: 30 lands, 14 ramp (2 one-drop dorks, 1 one-mana rock and 4 Signets per 7), a middling curve and a 5-mana commander. 20,000 games:

| Extra cards | Mana made | Ramp | Commander | Spells | Wasted | Mano's waste |
|---|---|---|---|---|---|---|
| 0 | 39.5 | 3.4 | 4.4 | 20.6 | **11.1** | 14.4 (their table) / 11 (their deck) |
| 3 | 42.8 | 4.1 | 4.2 | 25.5 | 9.0 | 12.5 |
| 5 | 45.4 | 4.5 | 3.9 | 28.9 | 8.1 | 11.3 |
| 7 | 47.9 | 4.9 | 3.7 | 32.0 | 7.2 | 10.2 |
| 10 | 50.8 | 5.6 | 3.3 | 36.4 | 5.5 | 8.8 |
| 15 | 55.1 | 6.7 | 2.4 | 42.7 | 3.3 | 7.3 |
| 35 | 67.0 | 11.1 | 0.1 | 55.3 | 0.5 | 5.3 |

The first few extra cards are worth the same in both models, about 0.6 mana saved per card. The models part ways at the far end. Mano's floor is about 5 wasted mana even with a huge hand; ours goes to about 0.5, because our player picks the best combination of spells each turn. Mano's floor most likely comes from a simpler casting rule (biggest spell first, or one spell a turn). That's an inference: we haven't seen his code. So **part of Mano's "unavoidable" 5 mana is sequencing, not deck building**.

### Sweep: lands × ramp × curve (energy 0, 3,000 games each)

Averages over the grid (all curves and ramp counts):

| Lands | 26 | 28 | 30 | 32 | 34 | 36 | 38 |
|---|---|---|---|---|---|---|---|
| Wasted | 9.6 | 10.3 | 11.0 | 11.9 | 12.6 | 13.6 | 14.4 |
| Useful | 23.5 | 23.9 | 24.1 | 24.2 | 24.2 | 24.1 | 23.8 |
| Keep 7 | 45% | 51% | 55% | 60% | 65% | 69% | 72% |

| Curve | Low (1-2 drops) | Twos | Middling | Flat | High (3-5 drops) |
|---|---|---|---|---|---|
| Useful | 20.6 | 21.6 | 24.8 | 26.0 | 26.8 |
| Wasted | 15.3 | 14.3 | 11.0 | 9.9 | 9.1 |

- Land count trades waste against keepable hands: each 2 lands cut save about 0.8 wasted mana and cost about 5 points of keep-7 rate. Useful mana stays put.
- The curve matters far more than the land count. A deck of cheap spells runs out of cards ("manque de cartes", as Mano says).
- With 5 extra cards, useful mana rises by about 7 at every land count. Draw is the biggest lever in this model. But see section 4: in real games, draw spells cost the slots of cards that win.

---

## 3. Real decks in the engine (`tools/sim/bench/mana.js`)

The engine counts, for each of the hero's turn cycles (its turn plus the opponents' turns until its next one), mana spent on ramp, the commander, spells and abilities. Waste is untapped mana sources left at the end of the cycle, plus mana left in the pool.
- Mana held up for an instant and used on an opponent's turn counts as used.
- Mana held up and not used counts as wasted, which is the real cost of holding up a counter.
- The turn the deck wins, and any turn where it runs a repeated loop (infinite mana, Heliod + Ballista), is a combo turn and left out, as Mano does.

Each deck played 800 games against three random Bracket 4 bots and 400 goldfish games. Corrupted Miku played 1,600 and 600. The 8-turn columns add up the average of each turn, so games that ended early don't bias them.

| Deck | Win vs 3 B4 bots | Goldfish kill turn (median / mean) | Goldfish won by turn 6 | Mana made, turns 1-8 | Useful | Ramp | Wasted | Extra cards drawn | Keep 7 |
|---|---|---|---|---|---|---|---|---|---|
| **Corrupted Miku (Shalai)** | 30.6% ±1.2 | 8 / 8.1 | 31% | 39.9 | 29.5 | 3.8 | 6.6 | 2.9 | 63% |
| Miku (Trostani, site list) | 18.8% ±1.4 | 9 / 9.3 | 1% | 37.8 | 28.2 | 4.2 | 5.4 | 1.7 | 66% |
| Miku 80€ | 18.1% ±1.4 | 9 / 9.2 | 1% | 38.5 | 28.2 | 4.6 | 5.7 | 1.8 | 68% |
| Miku precon | 17.4% ±1.3 | 10 / 10.3 | 0% | 39.3 | 28.0 | 5.0 | 6.2 | 1.6 | 68% |
| Azusa | 16.8% ±1.3 | 10 / 10.4 | 1% | 51.5 | 29.4 | 11.0 | 11.1 | 4.0 | 82% |
| Corrupted Etrata | 38.4% ±1.7 | 7 / 7.6 | 35% | 38.5 | 30.0 | 3.3 | 5.2 | 3.5 | 63% |
| Ghalta | 28.7% ±1.6 | 8 / 8.1 | 8% | 50.0 | 33.5 | 8.3 | 8.2 | 5.8 | 63% |
| Edgar | 27.5% ±1.6 | 8 / 8.2 | 11% | 35.7 | 27.9 | 2.8 | 5.0 | 1.5 | 55% |
| Ur-Dragon | 24.3% ±1.5 | 9 / 8.8 | 2% | 38.5 | 26.2 | 6.0 | 6.3 | 3.4 | 65% |
| Krenko | 22.0% ±1.5 | 8 / 7.7 | 14% | 35.7 | 28.7 | 2.8 | 4.2 | 1.1 | 57% |
| Talrand | 21.3% ±1.4 | 12 / 12.5 | 5% | 44.0 | 28.7 | 5.2 | 10.0 | 6.6 | 54% |

(Fair share against three opponents is 25%.)

- **Every deck spends about 26-33 useful mana in its first 8 turns.** Win rates still run from 17% to 38%. What the mana buys matters more than how much of it there is.
- **Correlation with win rate across these 11 decks:**

  | Measure | Correlation |
  |---|---|
  | Share of goldfish games won by turn 6 | **0.87** |
  | Goldfish mean kill turn | −0.62 |
  | Useful mana | 0.39 |
  | Keep 7 | −0.38 |
  | Ramp | −0.34 |
  | Wasted | −0.28 |
  | Extra cards drawn | 0.04 |

  With 11 decks only the first is clearly real.
- **Corrupted Miku wastes little (6.6) because of its abilities.** The same list in the spells-only model wastes 16.6 (section 5).
- **Azusa and Talrand waste the most** (11.1 and 10.0). Azusa ramps into lands it can't use; Talrand holds up counters it doesn't cast.

### Inside one deck: does early waste go with losing?

Win rate by quarter of mana wasted in turns 1-4 (games that reached turn 5):

| Deck | Least waste | 2nd | 3rd | Most waste |
|---|---|---|---|---|
| Corrupted Miku | 32.6% | 31.8% | 30.8% | 25.0% |
| Talrand | 24.2% | 24.7% | 20.7% | 16.1% |
| Krenko | 21.5% | 31.6% | 23.1% | 13.8% |
| Ghalta | 34.0% | 29.7% | 27.3% | 27.2% |
| Edgar | 26.2% | 27.7% | 26.7% | 31.6% |
| Corrupted Etrata | 42.9% | 34.5% | 37.2% | 39.6% |

Heavy early waste is a symptom of flood (lands and rocks with nothing to cast). For Corrupted Miku, Talrand and Krenko it costs 7-10 points. For the rest it doesn't matter. Useful mana spent in turns 1-4 doesn't predict Corrupted Miku's wins at all (32%, 28%, 30%, 30% by quarter).

---

## 4. Sweeps on Corrupted Miku (the Shalai deck the engine can play)

Base list: 29 lands, 17 ramp pieces, average nonland MV 2.2. Same seeds for every version, so the "vs base" column is a paired difference. Each version played 1,600 games against Bracket 4 bots and 600 goldfish games.
- **Flex cards cut** (in this order): Brightglass Gearhulk, Vorinclex, Kenrith's Transformation, Blind Obedience, Formidable Speaker, Destiny Spinner.
- **Draw added:** Tireless Tracker, Harmonize, Garruk's Uprising, Guardian Project, Beast Whisperer, Colossal Majesty.
- **Ramp added:** Arcane Signet, Three Visits, Farseek, Rampant Growth.
- **Ramp cut:** Badgermole Cub, Delighted Halfling, Avacyn's Pilgrim, Fyndhorn Elves.
- **Lands cut:** basics first, then Dryad Arbor and Horizon Canopy.

| Version | Win vs B4 bots | vs base (paired) | Goldfish kill (median / mean) | Goldfish won by turn 6 | Mana made | Useful | Ramp | Wasted | Extra cards | Keep 7 |
|---|---|---|---|---|---|---|---|---|---|---|
| **base (29 lands, 17 ramp)** | 30.6% ±1.2 | | 8 / 8.10 | 31.2% | 39.9 | 29.5 | 3.8 | 6.6 | 2.9 | 62.8% |
| +3 lands (−3 flex) | 30.1% ±1.1 | −0.6 ±0.9 | 8 / 8.15 | 30.8% | 40.9 | 30.5 | 3.7 | 6.7 | 3.0 | **68.3%** |
| −3 lands, +3 draw | 29.2% ±1.1 | −1.4 ±0.9 | 8 / 8.35 | 27.8% | 38.1 | 28.1 | 3.8 | 6.2 | 3.2 | 58.3% |
| −3 lands, +3 ramp | 29.6% ±1.1 | −1.1 ±0.9 | 8 / 8.30 | 28.7% | 39.7 | 28.6 | 4.8 | 6.3 | 3.0 | 61.6% |
| −6 lands, +6 draw | 24.5% ±1.1 | **−6.1 ±1.2** | 9 / 8.86 | 22.8% | 36.5 | 26.6 | 3.8 | 6.1 | 3.5 | 49.4% |
| +4 ramp (−4 flex) | 29.3% ±1.1 | −1.4 ±1.0 | 8 / 8.05 | 32.5% | 41.4 | 29.7 | 5.1 | 6.6 | 2.8 | 67.5% |
| −4 ramp, +4 draw | 29.3% ±1.1 | −1.4 ±1.0 | 8 / 8.55 | 25.3% | 37.7 | 28.8 | 2.9 | 5.9 | 3.4 | 56.5% |
| +3 draw (−3 flex) | 28.9% ±1.1 | −1.8 ±0.7 | 8 / 8.19 | 29.8% | 39.2 | 29.1 | 3.8 | 6.3 | 3.3 | 62.8% |
| +6 draw (−6 flex) | 26.8% ±1.1 | **−3.9 ±1.0** | 8 / 8.29 | 25.7% | 39.3 | 29.3 | 3.8 | 6.1 | 3.8 | 62.8% |

- **The list sits at a local optimum on these three axes.** Nothing beat it. Only the two big moves are clearly worse.
- **Draw spells barely draw in the first 8 turns.** Three draw cards raised extra cards from 2.9 to 3.3; six raised it to 3.8. They cost a slot and 3-4 mana each, and arrive too late for a deck that wins on turn 8. The deck's cheap engines (Sylvan Library, Esper Sentinel, Skullclamp, The One Ring) already give it about 3 extra cards.
- **Ramp beyond 17 doesn't help** (−1.4 ±1.0), though it speeds the goldfish slightly (32.5% by turn 6) and raises the keep rate.
- **Waste hardly moves (5.9 to 6.7)** whatever the swap. It isn't the lever for this deck.
- **The pattern from section 3 holds within the deck too:** the versions that win by turn 6 more often tend to win more against bots.
- **Caveat from the tournament work:** the bots like lands. A cut sweep there showed bot win rates rise when cards become basics, so read the land results with that bias in mind.

---

## 5. Your pass 2 lists (Shalai and Brago)

### Model, using pass 2's `deckshape-*.json` (10,000 games, turns 1-8)
Each draw card in a shape brings its listed extra cards over the turns after it's cast. "No draw" shows what the deck does without them.

| List | Lands | Ramp | Mana made | Ramp spent | Commander | Spells | Wasted | Without draw cards: spells / wasted | Keep 7 |
|---|---|---|---|---|---|---|---|---|---|
| Brago uncapped | 31 | 14 | 42.8 | 4.7 | 3.7 | 21.1 | 13.3 | 17.6 / 14.5 | 57% |
| Brago 1,500 € | 31 | 14 | 42.5 | 5.0 | 3.7 | 21.0 | 12.8 | 17.6 / 14.1 | 57% |
| Shalai uncapped | 32 | 20 | 48.5 | 4.5 | 4.0 | 17.7 | 22.4 | 14.8 / 22.7 | 66% |
| Shalai 1,500 € | 32 | 20 | 48.2 | 4.9 | 4.0 | 17.7 | 21.7 | 14.8 / 22.1 | 65% |
| Corrupted Miku (current) | 29 | 17 | 39.8 | 3.1 | 3.9 | 16.3 | 16.6 | (engine: 6.6 wasted) | 58% |

- **Brago's shape is the classic one:** 31 lands, 14 rocks, a real curve. Its spells use the mana, and its draw cards (Mulldrifter, Wall of Omens, Rhystic Study, Mystic Remora...) are worth about 3.5 useful mana over 8 turns. Its waste in this model (13) is close to Mano's deck.
  - What the model can't see: Brago blinking rocks untaps them (more mana), and counterspell mana held up and unused is waste (Talrand wastes 10 in the engine for that reason).
  - Brago can't be measured in the engine yet: Brago and 29 other cards in the list are missing (`missing-from-engine.md`).
- **The pass 2 Shalai list makes the most mana and has the fewest spells to spend it on:** 52 lands and ramp pieces against 47 spells. The spells-only model puts its waste at 22.
  - In real games its sinks (Gavony Township, Shalai's pump, Walking Ballista, Devoted Druid loops, X tutors) take that mana, as they do for Corrupted Miku (16.6 in the model, 6.6 in the engine).
  - The open question is whether 32 lands + 20 ramp is too much mana for a deck whose win rate follows its turn-6 kill rate. Corrupted Miku has 3 fewer lands and 3 fewer ramp pieces, and the +3 lands and +4 ramp sweeps on it were both slightly negative.

### Engine, your Shalai lists with stand-ins
The engine lacks 11 of the list's cards, so `tools/sim/proxylist.js` stood in for them with engine cards of the same mana value, type and colors:

| Missing card | Stand-in |
|---|---|
| Swift Reconfiguration | Reprieve |
| Scurry Oak | Courser of Kruphix |
| Fauna Shaman | Badgermole Cub |
| Sylvan Tutor | Full Flowering |
| Utopia Sprawl | Fellwar Stone |
| Wild Growth | Mind Stone |
| Aura Shards | Always Watching |
| Archon of Emeria | Aven Mindcensor |
| Mother of Runes | Skymarcher Aspirant |
| Allosaurus Shepherd | Arbor Elf |
| Prismatic Vista | Fabled Passage |

The mana shape is kept, but two win pieces are lost (Swift Reconfiguration with Devoted Druid, and Sylvan Tutor), so the win rate understates the real list. Same seeds and game counts as section 4, paired against Corrupted Miku:

| List | Win vs B4 bots | vs Corrupted Miku | Goldfish kill (median / mean) | Goldfish won by turn 6 | Mana made | Useful | Ramp | Wasted | Keep 7 |
|---|---|---|---|---|---|---|---|---|---|
| Corrupted Miku (site) | 30.6% ±1.2 | | 8 / 8.10 | 31.2% | 39.9 | 29.5 | 3.8 | 6.6 | 62.8% |
| Shalai uncapped (stand-ins) | 29.3% ±1.1 | −1.4 ±1.7 | 8 / 8.49 | 25.5% | 40.9 | 30.2 | 5.1 | **5.6** | 67.5% |
| Shalai 1,500 € (stand-ins) | 28.2% ±1.1 | −2.4 ±1.6 | 8 / 8.63 | 21.0% | 39.8 | 28.6 | 5.7 | 5.6 | 69.1% |

- **In real games the pass 2 Shalai list wastes only 5.6 mana, not the model's 22.** Its sinks and combos absorb the extra mana sources, and the 32 lands lift the keep-7 rate to 68%.
- **Against the bots it is level with Corrupted Miku** within the error (−1.4 ±1.7). It's a bit slower in the goldfish, though: 25.5% of games won by turn 6 against 31.2%. Part of that is the two lost win pieces.
- **The verdict on the list waits for the 11 cards to be implemented.** On mana alone, nothing argues against it.

---

## 6. What this means for the Miku deck

1. **Optimise the turn the deck wins, not wasted mana.** Use the goldfish share won by turn 6 as the main number. Across the engine decks it predicts win rate far better than any mana measure. Keep waste as a warning light for flood (more than about 6 mana in turns 1-4).
2. **Don't follow the 26-28 lands advice into Bracket 4.** At real Bracket 4 tables lists average 34 lands and 11 accelerants. In the engine, cutting Corrupted Miku to 26 lands cost 1-1.4 points; cutting to 23 cost 6. Keep 29-32 lands with heavy fast mana.
3. **Card draw only pays if it's cheap and early.** One- and two-mana engines (Sylvan Library, Esper Sentinel, Mystic Remora, Rhystic Study, Skullclamp, The One Ring) are worth their slots. Four-mana draw spells aren't, for a turn 6-8 deck.
4. **Mana sinks matter as much as mana.** Activated abilities and X spells turned about 10 mana of would-be waste into value for Corrupted Miku. The pass 2 Shalai list relies on that even more (52 mana sources). Brago's sinks are fewer (Isochron Scepter, Deadeye Navigator, Venser, X spells), so its counter mana is what fills the gap.
5. **Next measurements, once Brago is in the engine:**
   - Brago's goldfish kill turn and turn-6 rate.
   - Its waste with held counters split out as "held, not used".
   - A paired Brago against Shalai at 2,000+ games on both fields.

---

## 7. How to reproduce

```sh
# the model (Mano's table, the land/ramp/curve grid, a deck shape)
node tools/sim/manamodel.js --rampmv mix
node tools/sim/manamodel.js --sweep --rampmv mix --games 3000
node tools/sim/manamodel.js --shape research/miku-b4/deckshape-brago-uncapped.json --energy 0,2,5
node tools/sim/deckshape.js CORRUPTED_DECK > shape.json          # a shape from an engine deck

# the engine: per-turn mana for a hero deck, against Bracket 4 bots and against a goldfish
cd tools/sim/bench
MANA_OUT=out-b4.json DECK_CONST=CORRUPTED_DECK node wrap.js --games 400 --seed 1000 --decks corrupted,random4,random4,random4 --first random
GOLDFISH=1 MANA_OUT=out-gf.json DECK_CONST=CORRUPTED_DECK node wrap.js --games 150 --seed 5000 --decks corrupted,goldfish,goldfish,goldfish --first random
node manasum.js out-b4.json                 # per-turn table and 8-turn totals
node manacorr.js out-b4.json                # waste and useful mana against winning, inside one deck
node manacompare.js DIR base variant1 ...   # paired comparison of runs named NAME-b4-*.json / NAME-gf-*.json
# a whole list (stand-ins for cards the engine lacks): node tools/sim/proxylist.js list.txt research/miku-b4/cards.json > proxy.txt; LIST_FILE=proxy.txt ...
```

The sweep's swap lists are in section 4. Seeds: process k of 4 uses 1000 + k·400 (bots) and 5000 + k·150 (goldfish), with `--first random`.
