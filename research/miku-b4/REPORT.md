# Miku high-Bracket-4 deck: report (research pass 2, revised 2026-10-10)
Branch `claude/project-thread-6gnnil`, folder `research/miku-b4/`. Research only: no simulations, no engine changes; `pass1/` untouched.

Revised after the user read the first version. The user's goal is to **do well at real Bracket 4 tables without being accused of playing Bracket 5**, not to beat the repo's bots. That changed the recommendation; `HANDOFF.md` and DECISIONS D27–D29 tell the story.

Every rules claim traces to:
- the exact Oracle text (`commanders.md`, `cards.json`);
- a dated ruling (`rulings.md`, `cards.json`);
- or a Commander Spellbook page (`combos.json`).

Every price is Scryfall's bulk price (2026-10-07 21:05 UTC) with a URL (`prices-*.csv`). The cheapest near-mint English listing on Cardmarket is **not verified** for any card: Cardmarket blocks scripts and the browser pane (D20).

## 1. Recommendation

### What Bracket 4 means here
- **Full power.** No card limits beyond the banned list. Wizards' Bracket 4 text expects Game Changers to be "fast mana, snowballing engines, free disruption and tutors" (`pass1/legality.md`).
- **Bracket 5 is a deck built for the cEDH metagame.** The signals a table reads as Bracket 5:
  - a known cEDH shell or a copied cEDH list;
  - a commander chosen only for its colors and never cast;
  - turbo kills on turns 2–3;
  - hard stax locks.
- **The user's table accepts** Thassa's Oracle + Demonic Consultation and Isochron Scepter + Dramatic Reversal.

### The order
1. **Brago, King Eternal** (SLD 1601, "Miku, Queen Electric"): **`decklist-brago-uncapped.txt`** (€2,591, 14 Game Changers), or **`decklist-brago-1500.txt`** (€1,457, 13 Game Changers).
   - **The archetype:** Bracket 4 blink-value, the archetype of the public Bracket 4 Brago lists. EDHREC's Optimized Brago average is built from 1,089 decks (`work/publiclists.md`).
   - **Fast mana in full:** Sol Ring, Mana Vault, Grim and Basalt Monolith, Chrome Mox, Mox Diamond in the uncapped list, signets and talismans.
   - **The best stack interaction of the Miku commanders:** Force of Will, Force of Negation, Fierce Guardianship, Mana Drain, Swan Song, Counterspell, An Offer You Can't Refuse, Dovin's Veto, Flusterstorm. That's what decides real Bracket 4 games, where every player holds answers.
   - **Kills:**
     - Peregrine Drake + Deadeye Navigator (Spellbook 1409-3821, in 3 of the 4 Bracket 4 Brago lists);
     - Isochron Scepter + Dramatic Reversal;
     - Heliod, Sun-Crowned + Walking Ballista.
     
     Each is compact and tutorable, and the table accepts it.
   - **Brago's job:** Strionic Resonator, enter-the-battlefield creatures and Elesh Norn, Mother of Machines turn each Brago hit into value.
   - **What's left out:** the Displacer Kitten + Teferi, Time Raveler lock, the defining line of the cEDH Brago lists. Also hard stax pieces (Drannith Magistrate, Grand Arbiter, Rest in Peace locks).
2. **Shalai, Voice of Plenty** (SLD 2433, "Miku, Voice Over All"): **`decklist-shalai-uncapped.txt`** (€3,619, 15 Game Changers).
   - **The archetype:** commander-centric green-white creature combos with full fast mana. A Bracket 4 deck.
   - **Kills:** Heliod + Ballista, Archangel of Thune + Spike Feeder, Devoted Druid + Vizier of Remedies, under Shalai's hexproof.
   - **Its weakness:** almost no stack interaction against other combo decks.
   - **Overlap:** it shares 71 nonbasic cards with the site's Corrupted Miku, so it's that deck refined, not a new one.
   - **Budget:** the €1,500 list keeps Sol Ring, Mana Vault, Chrome Mox, Lotus Petal and Ancient Tomb; only Mox Diamond and Gaea's Cradle are cut, for price.
   - **Trostani:** `decklist-trostani-*` is the same 99 with Shalai in it (pass1 D7).
3. **Child of Alara: not recommended.** Its cards aren't the problem at Bracket 4; the shape is. A five-color shell whose commander is never cast is the cEDH signal, whatever the price. The two Child lists stay in the folder for reference.

### Engine readiness (for the simulation session)
- **Brago** needs **30 cards** added: Brago himself, Peregrine Drake, Deadeye Navigator and most of the blink creatures (`missing-from-engine.md`).
- **Shalai** needs 11.

Bots under-use held counters (the tournament research showed this), so judge Brago in simulation on kill turn and consistency, not on win rate alone.

## 2. Win lines, ranked for these decks
Scripts for a bot, the mana needed, what stops each line and the Spellbook links are all in `combos.json` (26 lines). The field notes refer to the bots in `opposition.md`; at a real table, read "Talrand" as "the blue player with counters".

| Rank | Line (combos.json id) | Deck | Instant speed | In engine | Notes |
|---|---|---|---|---|---|
| 1 | Heliod, Sun-Crowned + Walking Ballista (`heliod-ballista`) | Brago, Shalai | yes, once both are out | yes | Abilities can't be countered. Under Shalai, Ballista can't be targeted. Brago's counters protect it at cast time. |
| 2 | Peregrine Drake + Deadeye Navigator (+ Ballista) (`drake-deadeye`) | Brago | partly (the loop is activated abilities) | Drake, Deadeye missing | The Bracket 4 Brago standard. 11 mana for the pair; weak to removal while assembling. |
| 3 | Isochron Scepter + Dramatic Reversal (+ Ballista) (`scepter-reversal`) | Brago | partly | yes | Needs nonland mana sources making 3 or more (Brago's rocks); weak to artifact removal. |
| 4 | Archangel of Thune + Spike Feeder (+ Ballista) (`archangel-spikefeeder`) | Shalai | yes (the Feeder loop is free) | yes | Can go off in response to a wipe. |
| 5 | Devoted Druid + Vizier of Remedies (+ Ballista) (`druid-vizier`) | Shalai | partly | yes | Cheapest: 4 mana for the pair. |
| 6 | Devoted Druid + Swift Reconfiguration (`druid-swiftreconfig`) | Shalai | partly | Aura missing | The Druid becomes a noncreature Vehicle, so it taps the turn it lands (my inference; check in the engine). |
| 7 | Peregrine Drake + Ghostly Flicker + Archaeomancer (`drake-flicker-archaeomancer`) | Brago | partly | Drake missing | Redundancy for the Drake line. |
| 8 | Brago + Strionic Resonator (`brago-resonator`) | Brago | no (needs Brago to connect) | Brago missing | Value engine first; infinite with enough rocks. |

Child-only lines (Thassa's Oracle + Consultation / Pact, Breach + LED, Kiki-Jiki) and the lines that only add redundancy are in `combos.json` for reference.

## 3. The lists
All lists are exactly 100 cards, commander first, one `1 Card Name` line each. All pass `scripts/check-decklists.js`: 100 cards, singleton except basics, Commander-legal, inside the commander's identity, every card in `cards.json`.

| List | € (Cardmarket trend) | $ (TCGplayer) | Game Changers | Lands | Cards with a Miku printing | Cards missing from the engine | Status |
|---|---|---|---|---|---|---|---|
| `decklist-brago-uncapped.txt` | 2,591 | 3,739 | 14 | 31 | 9 | 30 | **recommended** |
| `decklist-brago-1500.txt` | 1,457 | 1,936 | 13 | 31 | 9 | 30 | **recommended (budget)** |
| `decklist-shalai-uncapped.txt` | 3,619 | 5,116 | 15 | 32 | 16 | 11 | second choice |
| `decklist-shalai-1500.txt` | 1,537 | 1,971 | 13 | 32 | 17 | 11 | second choice (budget) |
| `decklist-trostani-uncapped.txt` / `-1500.txt` | same as Shalai | | | | | | A/B on Shalai's 99 |
| `decklist-child-of-alara-uncapped.txt` | 6,830 | 10,701 | 25 | 31 | 9 | 17 | reference only |
| `decklist-child-of-alara-1500.txt` | 1,541 | 1,990 | 19 | 31 | 9 | 11 | reference only |

- **Prices** are the cheapest nonfoil printing. Miku printings, mostly foil-only, are priced separately in `miku-prices.csv`.
- **Budget swaps** (D26, D28):
  - Brago: Mox Diamond → Coldsteel Heart, Tundra → Island.
  - Shalai: Gaea's Cradle → Forest, Mox Diamond → Elvish Spirit Guide, Savannah → Sungrass Prairie.
  - Child: the duals become shock lands, and the Breach line goes.

### Brago, card by card
- **Win-line pieces (10):** Peregrine Drake, Deadeye Navigator, Isochron Scepter, Dramatic Reversal, Heliod, Walking Ballista, Archaeomancer, Ghostly Flicker, Strionic Resonator, Mystic Sanctuary (a land that returns Reversal).
- **Mana (12 rocks + Smothering Tithe + Ancient Tomb + Urza's Saga):** Sol Ring, Mana Vault, Grim Monolith, Basalt Monolith, Chrome Mox, Mox Diamond, Arcane Signet, Talisman of Progress, Azorius Signet, Fellwar Stone, Thought Vessel, Mind Stone.
- **Counters (9)** and **removal (8):** Swords to Plowshares, Path to Exile, Generous Gift, Cyclonic Rift, Reality Acid, Skyclave Apparition, Reflector Mage, Supreme Verdict.
- **Tutors (7):** Enlightened, Mystical, Recruiter of the Guard, Trinket Mage, Tribute Mage, Muddle the Mixture, Spellseeker.
- **Blink and enter-the-battlefield value (14):** Aether Channeler, Ephemerate, Cloudshift, Wall of Omens, Omen of the Sea, Mulldrifter, Cloud of Faeries, Venser, Soulherder, Elesh Norn, Mother of Machines, Solemn Simulacrum, Sea Gate Oracle, Cryogen Relic, Loran of the Third Path.
- **Draw engines:** Mystic Remora, Rhystic Study, Esper Sentinel, The One Ring.
- **Protection:** Lightning Greaves, Teferi's Protection, Flawless Maneuver, Grand Abolisher.

## 4. My honest view
- **Brago.** At a real Bracket 4 table I expect it to do better than Corrupted Miku. Bracket 4 games are decided by who resolves their combo through everyone else's answers, and Brago carries nine counters plus tutors for three compact kills. Corrupted Miku carries almost no stack interaction. This is an argument from card text and from how the public Bracket 4 Brago lists are built, not a measurement: nothing is simulated yet. In bot games Brago will look worse than it is, because the bots don't hold counters well.
- **Shalai.** About Corrupted Miku's level; it's the same deck refined.
- **Bracket.** None of the recommended lists should read as Bracket 5:
  - a commander that is cast and wins games;
  - kills on turns 4–6;
  - no Kitten + Teferi or other locks;
  - combos the table has accepted.
  
  Declare the Game Changer count (14 or 13) and the combos before the game.

## 5. The mana shape (step 9)
**What was counted.** 73 public lists, each card classified from its Oracle text (`scripts/shape.js`, D29), in `public-lists-shape.csv`:
- 16 each for Brago, Child of Alara and Shalai;
- 5 for Trostani;
- 20 high-power lists of other commanders: 12 cEDH lists from the cEDH Decklist Database, 8 Bracket 4 Archidekt lists.

Lists are grouped by the bracket their authors gave them. Accelerants are 0–2 mana rocks, mana creatures and rituals.

| Group | Lists | Median lands (range) | Median accelerants | Median land-ramp spells | Median tutors | Median draw engines | Median average mana value |
|---|---|---|---|---|---|---|---|
| Bracket 4 / Optimized | 44 | 34 (26–42) | 7 | 2 | 5 | 5 | 2.94 |
| cEDH / Bracket 5 | 29 | 27 (20–47) | 14 | 0 | 9 | 6 | 2.18 |

**The claim "stronger decks run 26–28 lands and 12–14 accelerants" describes cEDH, not Bracket 4:**
- **cEDH lists:** 13 of 29 run 26–28 lands, 10 of 29 run 12–14 accelerants, 5 do both.
- **Bracket 4 lists:** 2 of 44 run 26–28 lands, 2 run 12–14 accelerants, none does both.
- **The trade-off:** across all 73 lists, lands and accelerants trade off strongly (correlation −0.60).

The mana shape is itself a Bracket 4 vs 5 signal a table can see. Low lands, a pile of cheap accelerants and many tutors look like cEDH.

**Where the lists of this report sit:**

| List | Lands | Accelerants | Tutors | Draw engines | Average mana value |
|---|---|---|---|---|---|
| Brago (both) | 31 | 11 | 7 | 7 | 2.45–2.48 |
| Shalai (both) | 32 | 16 (8–9 of them mana creatures) | 13 | 7 | 2.09–2.13 |
| Child uncapped (reference) | 31 | 15 | 11 | 8 | 1.96 |

Brago sits between the two medians, closer to Bracket 4. Shalai and Child run cEDH-like accelerant and tutor counts with Bracket 4 land counts. For Shalai that's a known green creature-combo shape, but it's worth knowing before a table asks.

**Per-list mana models.** `deckshape-*.json` (8 files) feed the goldfish model `tools/sim/manamodel.js`. Each holds:
- the lands;
- the ramp, with mana value, whether it's `fast` and its `net` mana;
- the spells, with mana value;
- the draw effects, with the extra cards over 8 turns as an estimate with reasoning;
- the mana sinks.

**Published work.** `mana-sources.md` summarizes Karsten and the other land-count and mana-efficiency studies. The sources agree:
- **Frank Karsten** (TCGplayer 2022, follow-up 2023):
  - His Commander simulation gives 38–42 lands for casual decks.
  - If games end by turn 5, it gives 35–38 lands.
  - He would accept 29–33 lands for ritual-heavy cEDH, but not 24–28.
- **Karsten's regression** over 95,000+ tournament decks (lands ≈ 31.42 + 3.13 × average nonland mana value − 0.28 × cheap ramp and draw) gives about **32–35 lands** for a Bracket 4 shape.
- **Sam Black** (2024) puts cEDH at 27–30 lands: that works because of the free mulligan and 40–50 mana-producing cards.

Applied roughly to this report's lists, the regression gives about 32 lands for Shalai, which runs 32, and about 34 for Brago, which runs 31. Brago is about three lands light by that formula; its tutors and Urza's Saga partly make up for it. Watch for missed land drops in simulation.

- **No published source supports "26–28 lands with 12–14 accelerants" as a package.** The agent's own count over EDHREC average decks gives Bracket 4 about 34 lands and 10.5 accelerants, cEDH about 30 lands and 16 accelerants, with lands + accelerants near 45–46 in every bracket.
- **The "Mano" study** that `tools/sim/manamodel.js` cites couldn't be found in English or French (Reddit, EDHREC, Moxfield, Hareruya, YouTube): **not verified**. The author of the mana study should add its link.

## 6. Skeptic's notes
- **Nothing is simulated.** The strength claims are arguments from card text, public lists and the opposition count.
- **Combo checks.** The combos are from Commander Spellbook; I checked the riskiest claims against Oracle text myself (D22). Two points still need an engine check:
  - Swift Reconfiguration's summoning-sickness interaction, which is my inference.
  - Peregrine Drake + Deadeye Navigator: verified on Spellbook (1409-3821) and against both Oracle texts, but its notable prerequisite needs five lands that tap for at least {2}{U}.
- **Pool reasons are generated** (role rules plus public-list frequency, D25): accurate but generic. Win-line pieces name their line.
- **Prices:** Scryfall's Cardmarket trend, not checked listings (D20). Summer Magic printings excluded (D21).
- **My first take on Bracket 4 was wrong.** The user corrected it (D27). The Child lists' "drifts to Bracket 5" warning stands for a different reason: the shell, not the cards.

## 7. Files
- **Step 2:** `commanders.md`, `rulings.md`, verbatim.
- **Steps 4 and 6:**
  - `combos.json` (26 lines);
  - `cards.json` (486 candidates: Child 210, Brago 188, Shalai/Trostani 246);
  - `pool/pool.tsv`.
- **Step 8:**
  - `decklist-*.txt` (8), `prices-*.csv` (8);
  - `miku-prices.csv`;
  - `missing-from-engine.md` (every list card the engine lacks, with Oracle text and notes).
- **Step 9:** `public-lists-shape.csv`, `deckshape-*.json` (8), `mana-sources.md`, `scripts/shape.js`.
- **Records:** `HANDOFF.md`, `SOURCES.md`, `DECISIONS.md` (D13–D29), `STATUS.md`.
- **Research notes:** `work/` (`winlines.md`, `publiclists.md`, `lists/`).
- **Tooling:** `draft/` (list sources), `scripts/` (generators and checkers), `scryfall/` (index tools; the 53 MB index and the bulk files aren't committed).
