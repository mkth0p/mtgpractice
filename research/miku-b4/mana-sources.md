# Published work on Commander mana efficiency, curves and land counts

Step 9 of `LOCAL-PROMPT.md` asks what published work says about Commander mana efficiency, mana curves and land counts. The local mana study (`tools/sim/manamodel.js`, `tools/sim/bench/mana.js`) wants to test the claim that **stronger Commander decks run 26-28 lands and 12-14 accelerants**. This file summarizes each source I could read: its method and its findings with numbers. Quotes are kept under 15 words. Anything I could not open is marked **not verified**. All pages were accessed 2026-10-10.

Short answer: no published source supports "26-28 lands with 12-14 accelerants" as one package.
- 26-28 lands is cEDH territory, and cEDH decks pair it with about 17 accelerants plus an average nonland MV near 2.0.
- Bracket 4 decks on EDHREC average about 34 lands and about 10-11 accelerants.
- Frank Karsten, the only author with a published Commander optimisation model, would not go below 29-33 lands even for ritual-heavy cEDH.

---

## 1. Frank Karsten: "What's an Optimal Mana Curve and Land/Ramp Count for Commander?"
- **Author / date / site:** Frank Karsten. TCGplayer (ChannelFireball content), 2022-07-15, updated 2025-08-28.
- **Link:** https://www.tcgplayer.com/content/article/What-s-an-Optimal-Mana-Curve-and-Land-Ramp-Count-for-Commander/e22caad1-b04b-4f8a-951b-a41e9f08da14/ (the page renders with JavaScript; I read the full text through TCGplayer's content API, `infinite-api.tcgplayer.com/content/article/<uuid>/`).
- **Method:** Monte Carlo simulation plus local-search optimisation, with Python code published.
  - **Deck model:** a 99-card deck made only of 1- to 6-drops, Sol Ring, Arcane Signet-style 2-MV rocks and lands. The commander is a free spell. All cards are blank on-board permanents, with no colours and no tapped lands.
  - **Rules:** goldfish play, with the Commander free mulligan and the draw on turn 1 (CR 103.4c, 800.7).
  - **Criterion:** expected *compounded mana spent* over turns 1-7. Each turn adds the total MV of non-rock permanents on the battlefield, and six-drops count as 6.2.
  - **Keep rules:** keep 3-5 lands with at most 5 lands+Signets, or any 1-5 lands plus Sol Ring. The second 7 also keeps 2-landers.
  - **Play rules:** lands first, then Sol Ring, then rocks on turns 1-2 or rock + (N-1)-drop on turns 3-4, then greedy biggest-first casting with a "two-drop + (N-2)-drop" rule to avoid wasting mana.
  - **Scale:** 10,000 games per deck at first, rising to at least 200,000 games for the final optimum.
- **Findings (optimal decks):**

  | Commander MV | 1 | 2 | 3 | 4 | 5 | 6 | Rocks | Lands |
  |---|---|---|---|---|---|---|---|---|
  | 2 | 9 | 0 | 20 | 14 | 9 | 4 | Sol Ring + 0 | 42 |
  | 3 | 8 | 19 | 0 | 16 | 10 | 3 | Sol Ring + 0 | 42 |
  | 4 | 6 | 12 | 13 | 0 | 13 | 8 | Sol Ring + 7 | 39 |
  | 5 | 6 | 12 | 10 | 13 | 0 | 10 | Sol Ring + 8 | 39 |
  | 6 | 6 | 12 | 10 | 14 | 9 | 0 | Sol Ring + 9 | 38 |

  - The optimum runs zero spells at the commander's MV, and the bulk of the curve sits at 2-4 MV.
  - **Rule of thumb:** start at 42 lands + Sol Ring. Cut 1 land per 2-3 extra mana rocks, and 1 land per 3-4 cheap cantrips or mana dorks. For medium-power midrange decks, don't go below 37 lands.
  - Decks with fewer than 38 lands and more than 9 rocks are probably better off swapping a rock for a land.
  - **Flat optimum:** a near neighbour scored 72.434 against the optimum's 72.465 (99.96%). Big changes, such as six lands swapped for six 3-drops, cost about 2%.
  - **Card draw:** Divination and Harmonize were never chosen by the optimiser. Karsten notes the model doesn't reward digging for specific cards, combos or recovery after sweepers.
  - **Scope:** written for casual games (he took game length from Game Knights: the first player out around turns 8-9). Karsten says the model "won't be useful for cEDH".

## 2. Frank Karsten: "How to Build Commander Mana Curves: Game Length, Ramp Cost and Competitiveness"
- **Author / date:** Frank Karsten. TCGplayer, 2023-08-11, updated 2023-09-05.
- **Link:** https://www.tcgplayer.com/content/article/How-to-Build-Commander-Mana-Curves-Game-Length-Ramp-Cost-and-Competitiveness/50566e8d-bc0b-457a-bffb-dbb1d5872b7c/ (read through the same API).
- **Method:** the same simulation and local search as source 1, with one assumption changed at a time.
- **Findings:** this is the most relevant source for Bracket 4.
  - **Games over by turn 5** (higher power):
    - Optimal decks have 35-38 lands, Sol Ring + **0** Signets, 20-25 one-drops, about 21-22 two-drops and no 6-drops.
    - With a 4-MV commander: 25/22/14/0/1/0 by MV, plus Sol Ring and 36 lands.
    - Karsten adds that rituals can't be modelled, and that he "wouldn't replace lands by rituals one-for-one". A land drop is "equivalent to playing a free Mox".
    - His cEDH estimate: **"I could see 29 to 33 lands in ritual-heavy cEDH decks, but I wouldn't drop to 24 to 28 lands."**
  - **Games past turn 9:** 38-39 lands plus **13-14 Signets** (with 2-MV commanders, 40 lands and 6 Signets), on a top-heavy curve. Still no card draw is chosen.
  - **3-MV rocks (Commander's Sphere) instead of 2-MV:** the optimiser drops all rocks except Sol Ring and plays 40-42 lands. Three-mana rocks are "too expensive and come down too late".
  - **1-MV dorks (Llanowar Elves, which can't tap the turn they arrive) instead of Signets:** 33-35 lands plus **18-20 Elves**, with no one-drops and lots of 4-6 drops.
    - Karsten's practical version is about 10 good Elves, 3 Signets and 38 lands, because dorks die to removal and fewer than 18 good ones exist.
  - **Maximising the chance to out-spend 3 opponents** instead of the average:
    - With 4-6-MV commanders the optimum is 37-38 lands and **Sol Ring + 13-16 Signets**.
    - The win chance in a 4-player pod rises only from 25% to about 26-28%.
    - More ramp gives more variance, and variance pays in multiplayer.

## 3. Frank Karsten: "How Many Lands Do You Need in Your Deck? An Updated Analysis"
- **Author / date:** Frank Karsten. TCGplayer, 2022-07-29, updated 2025-02-13.
- **Link:** https://www.tcgplayer.com/content/article/How-Many-Lands-Do-You-Need-in-Your-Deck-An-Updated-Analysis/cd1c1a24-d439-4a8e-b369-b936edb0b38a/
- **Method:** a survey of lists. It is a multiple regression over more than 95,000 successful 60-card tournament decks.
  - "Cheap ramp" is a nonland card of MV ≤ 2 whose Oracle text says "add", or that fetches a land, and so on. "Cheap draw" is defined the same way for cheap draw spells.
  - The fit has R² = 0.395 and RMSE = 2.75 lands.
  - The result is ported to 99 cards by scaling, with a −1.35 land correction for the free mulligan and the turn-1 draw. That correction is back-of-envelope and comes from source 1.
- **Findings:**
  - **60 cards:** lands = 19.59 + 1.90 × avg MV − 0.28 × (cheap draw + cheap ramp) + 0.27 × companion.
  - **99 cards:** **lands = 31.42 + 3.13 × avg nonland MV − 0.28 × (cheap draw + cheap ramp spells)**, counting MDFCs as 0.38 of a land (0.74 if mythic).
  - So you cut one land per 3-4 cheap ramp or draw spells.
  - Karsten calls this an "imprecise back-of-the-envelope estimate" for Commander.
  - **Worked examples (my arithmetic):**
    - Avg MV 2.4 with 12 cheap ramp and 8 cheap draw gives about 33 lands.
    - Avg MV 2.0 with 16 cheap ramp and 10 cheap draw gives about 30 lands.
    - To reach 27 lands at avg MV 2.0 you would need about 39 cheap ramp and draw cards.

## 4. Frank Karsten: "How Many Sources Do You Need to Consistently Cast Your Spells? A 2022 Update"
- **Author / date:** Frank Karsten. TCGplayer, 2022-08-02, updated 2025-02-13.
- **Link:** https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/
- **Earlier versions:**
  - 2013: "Frank Analysis – How Many Colored Mana Sources Do You Need…", ChannelFireball (Paris mulligan).
  - 2018 update for the Vancouver mulligan.
  - 2020 London-mulligan update on CFB Pro.
  - The CFB originals are listed at https://library-of-leng.com/authors/frank-karsten. I did not read their full text (**not verified**).
- **Method:** theory: hypergeometric probability conditioned on having drawn enough lands.
  - It uses a London-mulligan keep policy and, for 99 cards, the Commander free mulligan and turn-1 draw.
  - The target is 89 + MV % (90% for 1-drops up to 96% for 7-drops).
  - The 99-card tables assume **41 lands**.
- **Findings (99-card colour sources needed):**
  - C = 19, 1C = 19, 2C = 18, 3C = 16.
  - CC = 30, 1CC = 28, 2CC = 26.
  - CCC = 36.
  - Free mulligan and free draw cut the Commander requirement for 1- and 2-drops by up to 3-4 sources compared with the earlier edition.
  - For gold cards, add 1 to each colour.
  - Count mana rocks as about 3/4 of a source for spells of MV ≥ 3. Count Fellwar Stone as about 1/2 and Exotic Orchard as about 3/4 of a source of any colour when the opponents' colours are unknown.

## 5. Sam Black: "How Many Lands Should You Play in cEDH?"
- **Author / date:** Sam Black. Commander's Herald, 2024-03-19.
- **Link:** https://commandersherald.com/how-many-lands-should-you-play-in-cedh/
- **Method:** theory and experience, with hypergeometric and mulligan arithmetic. It has no dataset.
- **Findings:**
  - Black's own cEDH decks run **27-30 lands**. He says cEDH decks often play lands "in the high 20s" but **40-50 cards that make mana**.
  - In his Rog/Thras deck, 24-30 nonland cards make mana, so more than half the deck is mana.
  - **30 lands:** 64% to have the needed lands by turn 3 without mulligans or extra draws. Mulliganing 0-1-landers finds a 2-lander by the 5-card hand about 97% of the time.
  - **25 lands:** only about 57% of 7-card hands have 2+ lands, but **82% with the free mulligan**.
  - **Why cEDH runs few lands:** the free mulligan, four-player games (being down a card matters less), heavy card draw (once an engine runs, extra lands are dead draws), low curves and short games.
  - He still argues that casual decks should run **40+ lands**, and says decks between precon and cEDH fall "anywhere in this range".

## 6. Dana Roach: "Superior Numbers - Land Counts" (EDHREC)
- **Author / date:** Dana Roach. EDHREC, 2019-02-20.
- **Link:** https://edhrec.com/articles/superior-numbers-land-counts
- **Method:**
  - EDHREC database extraction (by Donald Miner) and a 100-deck goldfish of random EDHREC decks.
  - An editor's note says the data were later "re-filtered" and points to a video for the updated figures (https://www.youtube.com/watch?v=9IY18Dl8Xv8). That video is **not verified**.
- **Findings:**
  - The EDHREC average was "just over 29 lands" and 4.15 mana rocks (31 lands for decks added in the past year). Later data (sources 1 and 8) put the typical figure nearer 36, so treat the 2019 figure with caution.
  - **Goldfish:** 26% of decks missed the turn-3 land drop with no other mana source, and 21% missed it but played a mana source.
  - **Four cEDH lists from the period** (via Laboratory Maniacs) had average CMC 1.68-2.04 and 28-43 total mana sources.
  - **Nate Burgess's formula** for non-cEDH decks: lands = 31 + colours + commander MV, with 0-MV rocks counting as lands.

## 7. Ties Westendorp: "Simulating Available Mana (Beyond the Hypergeometric Distribution)" (EDHREC)
- **Author / date:** Ties Westendorp ("Knaapje"). EDHREC, 2021-10-28.
- **Link:** https://edhrec.com/articles/simultaing-available-mana-beyond-the-hypergeometric-distribution (the slug is misspelled on the site).
- **Method:** a Monte Carlo goldfish of maximum available mana per turn, with naive and "sophisticated" agents. The sophisticated agent mulligans hands with fewer than 3 lands and prefers untapped lands, ramp and draw.
- **Findings (summarized from WebFetch; I did not check the figures line by line):**
  - 38 untapped lands + 61 blanks are about 63% to be on curve on turn 3.
  - Adding 13 ramp and 6 draw cards improves on-curve rates a lot. Ramp and draw help each other more than either helps alone.
  - Tapped lands lower early on-curve rates.

## 8. Playgroup.gg: "How Many Lands Should a Commander Deck Run?" (tracked real games)
- **Author / date:** Playgroup.gg (no named author), updated 2026-10-10.
- **Link:** https://playgroup.gg/commander/how-many-lands
- **Method:** a survey of real games: 131,751 kept opening hands from Playgroup Live and 1,543,553 finished games. It is mostly casual play.
- **Findings:**
  - **Lands in kept 7s:** 0: 0%, 1: 5%, 2: 28%, 3: 40%, 4: 21%, 5: 5%, 6: 1%. The mean is 2.95 lands, and 89% of hands have 2-4 lands.
  - **Mulligans:** 65% take none, 23% take 1, 8% take 2, 3% take 3 or more.
  - **Game length:** 8.77 rounds on average (median 9).
  - **4-6 player win rate by lands in the opening hand:** 18% with 0 lands, 25% with 1, and 29% with each of 2, 3, 4 and 5. Two-player games: 50-52% for 2-5 lands.
  - The site recommends 38-42 lands for casual decks and says hypergeometric keep rates peak near 42 lands.
  - The figures are correlational, and the site calls them "directional, not a verdict".

## 9. The Command Zone deck-building template
- **Source:** The Command Zone podcast, episode #379, "The NEW Commander Deck Building Template", 2021-03-02 (https://podcasts.apple.com/us/podcast/the-new-commander-deck-building-template-379/id898023861?i=1000511316766). A later episode (#658) reframes the template as ratios of enablers, payoffs and enhancers.
- **Method:** experience-based heuristics. It is not a study.
- **Numbers:** 36-38 lands, 10-12 ramp, 10 card draw, 10-12 targeted removal, 3-4 board wipes. These come from secondary summaries (https://commanderdeckmaker.com/learn/deckbuilding/command-zone-template). The episode page has no numbers, and I could not open the edh.fandom.com wiki page (HTTP 402), so the exact figures in the episode are **not verified**.

## 10. Benjamin Nicol: "Solve the Equation - Mana Efficiency VS Sequencing" (EDHREC)
- **Author / date:** Benjamin Nicol. EDHREC, 2022-10-24.
- **Link:** https://edhrec.com/articles/solve-the-equation-mana-efficiency-vs-sequencing
- **Method:** theory with worked examples.
- **Findings:**
  - Tapped lands cost tempo.
  - A 3-MV ramp spell such as Cultivate (in 49% of eligible decks) often clashes with casting a 3-4 MV commander on curve.
  - In Commander, sequencing (what to cast and when) often matters more than spending every mana.
  - The article has no new data.

## 11. The "Mano" study cited in `manamodel.js`: **not identified, not verified**
- **What the repo says about it:**
  - `manamodel.js`, `bench/mana.js` and `bench/manasum.js` describe it as measuring, over a deck's first 8 turns, how much mana was made, how much went to "useful" spells (commander + spells + abilities, with ramp counted separately) and how much was wasted.
  - Extra cards drawn are called "energy".
  - The turn the deck goes off (combo) is left out.
- **What I searched:** English and French queries; Reddit r/EDH and r/CompetitiveEDH style queries; EDHREC, Moxfield, Hareruya, YouTube and GitHub keywords; "ManoMTG" variants.
- **Result:** no matching public study by an author named Mano.
- **What would test it:** a link from the user. Until then, the closest published analogues are Karsten's compounded-mana criterion (sources 1-2), Westendorp's available-mana simulation (source 7) and open-source goldfish simulators, none of which I evaluated: https://github.com/LoG43/edh-deck-curve-sim, https://github.com/Riddmaker/goldfishlab.app.

## 12. cEDH Decklist Database / cEDH Analytics: no published land statistics found
- **cEDH Decklist Database** (https://cedh-decklist-database.com/):
  - It lists about 209 Moxfield decklists but publishes no aggregate land or fast-mana statistics that I could find.
  - Moxfield's API returned HTTP 403 to my requests, so I could not compute the statistics from the database myself.
- **cEDH Analytics** (https://www.cedh-analytics.com/):
  - It aggregates EDHTop16, Moxfield and the database: 15,537 decklists from 238 tournaments of 48+ players. Tournament data were last updated 2024-09-10.
  - Its front page shows no land-count statistics.
  - A search snippet said the cEDH average is 29 lands (min 19, max 90). I could not confirm that on the site, so it is **not verified**.
- **MTGNexus threads** ("How many lands is correct (on average)?", "First, Hit Your Land Drops (draft essay)"): HTTP 403, **not verified**.

## 13. Own survey of EDHREC average decks by bracket (computed 2026-10-10; not a published study)
Since no published source gives land and accelerant counts by bracket, I computed them from EDHREC's public JSON.
- **Data:**
  - The 100 most-built commanders of the past year, from `json.edhrec.com/pages/commanders/year.json`.
  - For each one, its "average deck" in four brackets (`/pages/average-decks/<slug>/<core|upgraded|optimized|cedh>.json`).
  - Each file reports the number of decks in each bracket.
- **Counting rules:**
  - Lands are counted from the deck's Land section.
  - An **accelerant** is a nonland card with MV ≤ 3 whose Oracle text (local Scryfall oracle dump of 2026-10-07) adds mana, puts a land from the library onto the battlefield, or makes Treasure. False positives are removed (An Offer You Can't Refuse, Mana Drain, Crop Rotation, Deadly Dispute, Culling the Weak).
  - This is my heuristic, not the site's tags.
- **Caveats:**
  - An average deck is a composite: its land count is the bracket's typical count, not one real list.
  - Brackets are self-tagged or estimated by the site.
  - The cEDH pages of very popular casual commanders mix in some off-meta lists.

| EDHREC bracket | Commanders (≥20 decks) | Decks | Lands, mean (IQR; range) | Accelerants MV ≤ 3, mean | Accelerants MV ≤ 2, mean | Avg nonland MV | Lands + accelerants |
|---|---|---|---|---|---|---|---|
| 2 Core | 100 | 192,972 | 35.9 (35-37; 33-41) | 9.7 | 7.2 | 2.89 | 45.5 |
| 3 Upgraded | 100 | 257,104 | 35.5 (35-36; 32-39) | 10.0 | 7.6 | 2.84 | 45.5 |
| 4 Optimized | 100 | 123,251 | 34.4 (33-35; 30-39) | 10.5 | 8.0 | 2.66 | 45.0 |
| 5 cEDH | 91 | 42,420 | 29.8 (28-31; 24-37); deck-weighted 27.6 | 16.4 | 13.6 | 2.06 | 46.2 |
| 5 cEDH, commanders with ≥1,000 cEDH decks | 13 | — | 26.9 (24-29) | 17.1 | 14.2 | 2.04 | 44.0 |

- **How often "26-28 lands" and "12-14 accelerants" occur:**
  - Bracket 4: 0 of 100 average decks have 26-28 lands, and 16 of 100 have 12-14 accelerants.
  - cEDH: 22 of 91 have 26-28 lands, and 15 of 91 have 12-14 accelerants. Only 2 have both.
- **Most common accelerants:**
  - Bracket 4: Sol Ring, Arcane Signet, Nature's Lore, Birds of Paradise, Fellwar Stone, Three Visits, Dark Ritual, Talismans.
  - cEDH: Sol Ring, Chrome Mox, Arcane Signet, Lotus Petal, Mana Vault, Mox Diamond, Dark Ritual, Birds of Paradise, Fellwar Stone, Mox Opal, Spirit Guides.

---

## Synthesis

### What the sources agree on
- **Missing land drops is the costliest mana failure.** Karsten (a land drop is a free Mox), Sam Black (playing a land each turn is "arguably the strongest" thing early) and Playgroup's real-game win rates (18% with 0 lands and 25% with 1, against 29% with 2+) all point the same way. Ramp adds to lands but does not replace them one-for-one.
- **Cheap accelerants and cheap card selection replace lands at a discount, not 1:1.** Karsten's regression gives 0.28 lands per cheap ramp or draw spell. His simulation advice is 1 land per 2-3 rocks, or per 3-4 dorks or cantrips.
- **Total mana sources barely move with power level; the mix moves.** My EDHREC count shows lands + accelerants at about 45-46 in every bracket, and Sam Black's 40-50 mana cards in cEDH agree. Stronger decks swap lands for 0-1 MV fast mana and dorks and lower the curve; they don't cut mana overall.
- **Shorter games want a lower curve, fewer slow ramp spells and slightly fewer lands.** Karsten's turn-5 run (35-38 lands, no Signets, many 1-2 drops) and the cEDH data (avg MV about 2.0, 27-30 lands) agree.
- **3-MV ramp is weak for efficiency, and 1-MV accelerants are the strongest.** This comes from Karsten's 2023 article and Nicol's Cultivate point.

### Where they disagree
- **Casual land counts.** Karsten says start at 42 and never go below 37 for midrange; Black says 40+; Playgroup says 38-42. The Command Zone template says 36-38, and real EDHREC decks average about 35.5-36 at Brackets 2-3.
- **cEDH land floor.** Karsten would not go to 24-28 lands even with rituals; his floor is 29-33. Real cEDH lists for the most-played commanders average about 27 (Kinnan 25, Vivi 25, Yuriko 24, Sisay 28). Black explains the gap as the free mulligan, four-player games, and draw engines making late lands dead. Karsten's model leaves out draw engines, tutors and rituals by design.
- **Value of card draw.** Karsten's optimiser never picks Divination or Harmonize, while every real high-power list plays draw engines. Karsten himself says the model undervalues draw because it ignores digging for specific cards.
- **Consistency or explosiveness.** When the goal is to beat three opponents rather than to maximise average mana, Karsten's optimum moves to 13-16 Signets and 37-38 lands. That is the same direction high-power players take.

### What it means for a 99-card Bracket 4 deck with about 10-15 accelerants
1. **The claim needs to be split in two.** "26-28 lands" is supported only for cEDH-shaped decks, which carry about 17 accelerants (about 14 at MV ≤ 2, many of them 0-MV moxen or rituals) and an average nonland MV near 2.0. A Bracket 4 deck with 12-14 accelerants built from 1-2 MV rocks and dorks matches neither the published models nor the real Bracket 4 average decks (about 34 lands, about 10.5 accelerants, MV 2.66).
2. **Starting point:**
   - Karsten's regression with avg MV 2.4-2.7 and 12-14 cheap ramp plus 6-10 cheap draw gives about **32-35 lands**.
   - Going to 28-30 makes sense only with a cEDH-like curve (≤ 2.1), real fast mana (0-1 MV: Sol Ring, Chrome Mox, Mox Diamond, Lotus Petal, Mana Vault, 1-MV dorks) and strong draw engines. (Mana Crypt, Jeweled Lotus and Dockside Extortionist have been banned since 2024.)
3. **Mulligans and tutors** lower the land need further, because a free mulligan into hands with fast mana or draw engines is what lets cEDH run 27-30 lands. Sam Black's figure: 25 lands and one free mulligan give 82% two-land hands. The keep rule in `manamodel.js` (2-5 lands and lands + cheap ramp ≥ 3) is close to Karsten's but looser. Results should be reported with the keep rule stated.
4. **For the local study:**
   - Karsten's criterion (compounded on-board MV over turns 1-7, rocks excluded) is the closest published analogue to the "useful mana" figure. His published optima (above) can serve as sanity checks for `manamodel.js --sweep`: a 4-MV commander with Sol Ring + 7 two-MV rocks + 39 lands should score near the top.
   - For Bracket 4, also report turns 1-5 or 1-6, because Karsten's results change sharply between 5-turn and 7-turn horizons.
   - Measure the Mano metric on real engine games rather than only on the abstract model. Draw engines and tutors are what the abstract models get wrong.

---

## Source list (all accessed 2026-10-10)
1. Frank Karsten, "What's an Optimal Mana Curve and Land/Ramp Count for Commander?", TCGplayer, 2022-07-15 (upd. 2025-08-28). https://www.tcgplayer.com/content/article/What-s-an-Optimal-Mana-Curve-and-Land-Ramp-Count-for-Commander/e22caad1-b04b-4f8a-951b-a41e9f08da14/
2. Frank Karsten, "How to Build Commander Mana Curves: Game Length, Ramp Cost and Competitiveness", TCGplayer, 2023-08-11. https://www.tcgplayer.com/content/article/How-to-Build-Commander-Mana-Curves-Game-Length-Ramp-Cost-and-Competitiveness/50566e8d-bc0b-457a-bffb-dbb1d5872b7c/
3. Frank Karsten, "How Many Lands Do You Need in Your Deck? An Updated Analysis", TCGplayer, 2022-07-29 (upd. 2025-02-13). https://www.tcgplayer.com/content/article/How-Many-Lands-Do-You-Need-in-Your-Deck-An-Updated-Analysis/cd1c1a24-d439-4a8e-b369-b936edb0b38a/
4. Frank Karsten, "How Many Sources Do You Need to Consistently Cast Your Spells? A 2022 Update", TCGplayer, 2022-08-02 (upd. 2025-02-13). https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/
5. Frank Karsten bibliography (2013/2018 CFB colour-source articles; 2017 "How Many Lands Do You Need to Consistently Hit Your Land Drops?"). Full texts not verified. https://library-of-leng.com/authors/frank-karsten
6. Sam Black, "How Many Lands Should You Play in cEDH?", Commander's Herald, 2024-03-19. https://commandersherald.com/how-many-lands-should-you-play-in-cedh/
7. Dana Roach, "Superior Numbers - Land Counts", EDHREC, 2019-02-20. https://edhrec.com/articles/superior-numbers-land-counts
8. Ties Westendorp, "Simulating Available Mana (Beyond the Hypergeometric Distribution)", EDHREC, 2021-10-28. https://edhrec.com/articles/simultaing-available-mana-beyond-the-hypergeometric-distribution
9. Playgroup.gg, "How Many Lands Should a Commander Deck Run?", updated 2026-10-10. https://playgroup.gg/commander/how-many-lands
10. The Command Zone #379, "The NEW Commander Deck Building Template", 2021-03-02. https://podcasts.apple.com/us/podcast/the-new-commander-deck-building-template-379/id898023861?i=1000511316766. Numbers via https://commanderdeckmaker.com/learn/deckbuilding/command-zone-template (secondary).
11. Benjamin Nicol, "Solve the Equation - Mana Efficiency VS Sequencing", EDHREC, 2022-10-24. https://edhrec.com/articles/solve-the-equation-mana-efficiency-vs-sequencing
12. cEDH Decklist Database. https://cedh-decklist-database.com/ ; cEDH Analytics. https://www.cedh-analytics.com/ (no land statistics found).
13. EDHREC JSON: https://json.edhrec.com/pages/commanders/year.json and https://json.edhrec.com/pages/average-decks/<commander>/<bracket>.json (own computation, 400 files).
14. Not verified (blocked or not found): the "Mano" study; EDHREC re-filtered land video https://www.youtube.com/watch?v=9IY18Dl8Xv8 ; MTGNexus threads https://www.mtgnexus.com/viewtopic.php?t=53233 and https://www.mtgnexus.com/viewtopic.php?p=255743 ; Medium "The Math of Manabases in Magic the Gathering: Commander" (HTTP 403) https://medium.com/@schulze.mtg/the-math-of-landbases-in-magic-the-gathering-commander-3f03aadac92c
