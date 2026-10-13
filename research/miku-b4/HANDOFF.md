# Handoff: Miku high-Bracket-4 research, pass 2 (Claude Code, 2026-10-07 to 2026-10-10)
For the agent that continues this work. It covers:
- everything pass 2 did and tried, and what failed and why;
- the user's corrections after reading the report, **which override parts of REPORT.md**;
- the earlier Miku-precon tournament research from the same session.

Read §1 and §2 before anything else.

> **Update 2026-10-10 (second round, the user asked for everything to be finished so only the push is left):**
> - The Brago lists are rebuilt as Bracket 4 blink-value (D28).
> - Peregrine Drake + Deadeye Navigator is verified and added to `combos.json`.
> - Step 9 is done: 73 lists in `public-lists-shape.csv`, 8 `deckshape-*.json`, `mana-sources.md` (D29).
> - REPORT.md, STATUS.md and SOURCES.md are rewritten.
> - The sections below are updated to match.

---

## 1. What the user wants (clarified after the report; overrides REPORT.md §1)
- **The goal is to do well at real Bracket 4 tables without being accused of playing a Bracket 5 deck.** Beating the repo's bots isn't the goal. Bot simulations are a tool for kill turns and consistency, not the target.
- **Bracket 4 means full power.** I first gave a Bracket-3-style checklist: Sol Ring and signets only, 4–8 Game Changers, no Thassa's Oracle + Demonic Consultation. **That was wrong, and the user corrected it.** A Bracket 4 deck without the real fast mana and a full set of signets and talismans loses. Wizards' own Bracket 4 text expects Game Changers to be "fast mana, snowballing engines, free disruption and tutors" (`pass1/legality.md`). Keep Mana Vault, Chrome Mox, Mox Diamond, Grim Monolith and the rocks.
- **What separates Bracket 4 from 5 is intent and metagame, not card quality.** Bracket 5 is "built for the cEDH metagame". The signals a table reads as Bracket 5:
  - a known cEDH shell or a copied cEDH list;
  - a commander chosen only for its colors and never cast;
  - turbo kills on turns 2–3;
  - hard stax locks.
- **The user's table is fine with Thassa's Oracle + Demonic Consultation and with Isochron Scepter + Dramatic Reversal.**
- **The commander must be a Hatsune Miku Secret Lair card** (the original brief).

### Current recommendation (replaces REPORT.md §1)
1. **Brago, King Eternal (Miku, Queen Electric), as Bracket 4 blink-value with full fast mana and a counter suite.** It's an established Bracket 4 archetype: EDHREC's Optimized Brago average is built from 1,089 decks. White-blue has the best stack interaction of the Miku commanders, and that's what wins at real tables. Leave out the Displacer Kitten + Teferi, Time Raveler lock: that is *the* cEDH Brago archetype (the cEDH Brago lists in `work/publiclists.md`). The table allows Isochron Scepter + Dramatic Reversal and Thassa's Oracle lines. The lists are rebuilt to this brief (D28): `decklist-brago-uncapped.txt` €2,591 with 14 Game Changers, `decklist-brago-1500.txt` €1,457 with 13.
2. **Shalai, Voice of Plenty (Miku, Voice Over All), as written in `decklist-shalai-uncapped.txt`.** It's commander-centric creature combo with full fast mana and 15 Game Changers: a Bracket 4 deck. Its weakness is little stack interaction. It shares 71 nonbasic cards with the site's Corrupted Miku, so it's that deck refined. The ~€1,500 version cut fast mana to meet the budget; put fast mana back where the budget allows.
3. **Child of Alara: dropped.** The cards aren't the problem; a five-color shell whose commander is never cast *is* the cEDH signal. The Child lists stay in the repo for reference only.

---

## 2. Where everything is
- **Pass 2 files:** `research/miku-b4/` on `claude/project-thread-6gnnil`, in the separate clone `/Users/glyphsek/Documents/mtg-todeletelater/miku-b4-pass2/`. A clone separate from the shared `mtgpractice/` folder, because other sessions use that folder on other branches (DECISIONS D13).
- **Push status:**
  - Pass 2's commits are **local only**; the terminal has no GitHub credentials (`git push` asks for a username).
  - On 2026-10-10 another commit landed on the remote branch: `5e8d581` "Mana-efficiency tools", which added step 9 to LOCAL-PROMPT.md. I rebased pass 2 onto it cleanly (no shared files), so the branch is now just ahead of the remote.
  - **The user pushes from GitHub Desktop** (File > Add Local Repository > that folder, then Push).
- **The earlier tournament work** (§9): branch `miku-tournament`, pushed to GitHub (the user pushed it), folder `research/miku-tournament/`.
- **Not in git (rebuildable):**
  - `research/miku-b4/scryfall/index.json` (53 MB);
  - the three bulk files;
  - `sld-printings.json`.
  
  Rebuild them with `node scryfall/bulk-index.js oracle-cards-….jsonl.gz default-cards-….jsonl.gz rulings-….jsonl.gz` after downloading the bulk files named in `scryfall/index-meta.json`.

---

## 3. What pass 2 did, step by step (`pass1/STATUS.md` numbering)
| Step | Status | Output | Notes |
|---|---|---|---|
| 1 Scryfall bulk | done | `scryfall/bulk-index.js`, `card.js`, `price.js`, `index-meta.json`, `miku-printings.json` | Bulk files are oracle-cards 2026-10-07 21:01, default-cards 21:05 and rulings 21:00 UTC. The index covers all five colors: 34,543 cards with Oracle text, faces, Commander legality, Game Changer flag (53, matching legality.md), keywords, rulings, cheapest nonfoil EUR (Cardmarket trend) and USD (TCGplayer) with purchase URLs, and Miku printings. |
| 2 Verbatim text | done | `commanders.md`, `rulings.md` (generated by `scripts/verbatim.js`) | Brago {2}{W}{U}; Feather 3/4; Freyalise loyalty 3. Elspeth Tirel and the 4 Vocaloid planeswalkers can't be commanders (no "can be your commander" line). Scryfall has no rulings for Shalai or Freyalise; Azusa has one (2020-06-23), Giada one (2024-11-08). |
| 3 Opposition | done in pass 1 | `opposition.md` | unchanged |
| 4 Win lines | done | `combos.json` (25 lines), `work/winlines.md`, `work/combos-draft.json` | Checked on Commander Spellbook by a research subagent, each with a bot script, mana needed, instant speed, weak-to, against-the-field note and Spellbook URL. I re-checked the riskiest claims against Oracle text. `colors` is recomputed from the pieces (`scripts/build-combos.js`). |
| 5 Public lists | done | `work/publiclists.md`, `work/lists/*.txt`, `*-frequency.tsv` | 38 lists: 33 counted, 4 discarded (Mana Crypt / Jeweled Lotus), 1 kept for reference. No cEDH Decklist Database entry for any of the four commanders. |
| 6 Candidate pool | done | `pool/pool.tsv` → `cards.json` (485 cards) | Child 209, Brago 188, Shalai/Trostani 246. Generated by `scripts/build-pool.js` and `build-cards.js` (D25). |
| 7 Prices | partly | `prices-*.csv`, `miku-prices.csv` | Bulk prices with URLs. The **Cardmarket near-mint check for cards over €20 is not done**: blocked (§5). |
| 8 Lists | done (no alternative archetype) | 8 `decklist-*.txt`, `missing-from-engine.md` (55 cards) | All pass `scripts/check-decklists.js`. The alternative archetype (Brago Bracket 4 blink) isn't written; it's now the main recommendation (§1). |
| 9 Mana shape (added 2026-10-10) | done | `public-lists-shape.csv` (73 lists: 16 Brago, 16 Child, 16 Shalai, 5 Trostani, 20 other high-power), `deckshape-*.json` (8), `mana-sources.md`, `scripts/shape.js` | Counted from Oracle text (D29). Bracket 4 median: 34 lands, 7 accelerants. cEDH median: 27 lands, 14 accelerants. The 26–28 lands + 12–14 accelerants shape is cEDH (0 of 44 Bracket 4 lists). The "Mano" study cited by manamodel.js couldn't be found (not verified). |

### The lists (all 100 cards, commander first, one `1 Card Name` line each)
| List | € (Cardmarket trend) | $ | Game Changers | Lands | Cards with a Miku printing | Cards missing from the engine | Status after §1 |
|---|---|---|---|---|---|---|---|
| decklist-shalai-uncapped | 3,619 | 5,116 | 15 | 32 | 16 | 11 | keep |
| decklist-shalai-1500 | 1,537 | 1,971 | 13 | 32 | 17 | 11 | put fast mana back where the budget allows |
| decklist-trostani-uncapped / -1500 | same as Shalai | | | | | | the A/B: same 99 with Shalai in it |
| decklist-brago-uncapped | 2,591 | 3,739 | 14 | 31 | 9 | 30 | **rebuilt 2026-10-10: recommended** |
| decklist-brago-1500 | 1,457 | 1,936 | 13 | 31 | 9 | 30 | **rebuilt 2026-10-10: recommended (budget)** |
| decklist-child-of-alara-uncapped | 6,830 | 10,701 | 25 | 31 | 9 | 17 | reference only (cEDH shell) |
| decklist-child-of-alara-1500 | 1,541 | 1,990 | 19 | 31 | 9 | 11 | reference only |

How the ~€1,500 lists were made (D26):
- **Shalai:** Gaea's Cradle → Forest, Mox Diamond → Elvish Spirit Guide, Savannah → Sungrass Prairie.
- **Brago:** Mox Diamond → Thought Vessel, Tundra → Island.
- **Child:** the ten original duals → shock lands. Lion's Eye Diamond, Mox Diamond, Grim Monolith, Imperial Seal and Ancient Tomb → Culling Ritual, Talisman of Dominance, Cabal Ritual, Wishclaw Talisman and Spire of Industry. Breach and Brain Freeze → Faerie Mastermind and Snuff Out.

### Win lines, ranked against the bot field (`combos.json` ids)
1. `thoracle-consult` (Child; in engine)
2. `heliod-ballista` (all three; in engine)
3. `archangel-spikefeeder` (Shalai/Child; in engine)
4. `druid-vizier` (Shalai/Child; in engine)
5. `thoracle-pact`
6. `kitten-teferi-solring` (Brago; cEDH-coded, see §1)
7. `scepter-reversal` (Brago/Child; in engine; the table is fine with it)
8. `druid-swiftreconfig`
9. `kiki-conscripts`
10. `breach-led-brainfreeze`

For the rebuilt Bracket 4 Brago list (no lock), the lines are `drake-deadeye` (Peregrine Drake + Deadeye Navigator, Spellbook 1409-3821, added 2026-10-10), `scepter-reversal` and `heliod-ballista`. Other candidates:
- `scepter-reversal`;
- `heliod-ballista`;
- `thoracle-thoughtlash`, the only two-card Thassa's Oracle line in white-blue;
- `drake-flicker-archaeomancer`;
- `brago-resonator` and `brago-archaeomancer-timewarp`, which need Brago to connect.

### Pass 1 queue corrections (D23)
- Brago does have infinites: + Strionic Resonator, and + Lithoform Engine + Sol Ring.
- Coalition Victory + Child isn't a Spellbook combo (a 13-mana closer).
- Ad Nauseam is a draw engine, not a combo.
- Earthcraft + Squirrel Nest, and Restoration Angel + Felidar Guardian, need more cards.
- Displacer Kitten + Dramatic Reversal isn't on Spellbook.
- Spellbook's own text says Spike Feeder gains 1 life; the Oracle text says 2.

---

## 4. Key facts the next agent can rely on
- **Miku printings:** Scryfall's art tag `art:hatsune-miku` on `set:sld` gives 46 printings (`scryfall/miku-printings.json`). Flavor names alone miss Miku-art cards without a Miku name: Sol Ring 1604, Counterspell 1589, Swan Song 1591, Chord of Calling 1595, Elvish Mystic 805, Command Tower 806, Snapcaster Mage 808, Diabolic Tutor 1592, Song of Creation 1603, Thespian's Stage 1607, Harmonize 1596, Inspiring Vantage 1605, Shelter 1587, Youthful Valkyrie 1588, Scrying Sheets 1606, and the commander-deck cards 2429–2444.
- **Miku commanders:** Giada 1586, Azusa 1597, Freyalise 1598, Child 1599, Brago 1601, Feather 1602, Trostani 2429, Shalai 2433, Vorinclex 2439. SLD 2443 (a second Trostani) is a display commander per pass 1. Scryfall's legality is per card, so it shows "legal", but whether that copy is a legal playing piece is not verified (D19).
- **Engine coverage:** check `in_engine` in `cards.json` (exact match against `engine-cards.txt`). `missing-from-engine.md` lists every list card the engine lacks, combo pieces first, with Oracle text and implementation notes. Brago himself, Displacer Kitten, Teferi, Time Raveler, Peregrine Drake and Child of Alara are all missing.
- **Scurry Oak** is implemented on the `miku-tournament` branch (`miku/game/cards-miku-tourney.js`, loop capped at 60 Squirrels a turn) but isn't in `engine-cards.txt` on this branch.

---

## 5. What was tried and didn't work
- **Cardmarket near-mint check (step 7).** Product pages answer HTTP 403 to curl, and the browser pane gets a Cloudflare "Just a moment..." challenge. I didn't try to get past it. Every EUR price is Scryfall's Cardmarket trend for the cheapest nonfoil printing; the cheapest near-mint English listing is **not verified** for any card (D20). A person has to check cards over €20.
- **Summer Magic prices.** Scryfall's EUR for Summer Magic / Edgar printings is noise (Tundra €0.25, Underground Sea €280), so those printings are excluded from the cheapest price, like memorabilia and oversized cards (D21). After the fix: Tundra €376, Underground Sea €737 (Revised).
- **Moxfield** returns 403 to curl; the lists subagent read them through the browser pane.
- **The cEDH Decklist Database** has no entry for any of these commanders.
- **Pushing** fails: no credentials.
- **Comprehensive Rules text** (903.9a commander death, 702.11 hexproof) wasn't re-fetched; `rulings.md` marks both "not verified".
- **My first take on what Bracket 4 allows was wrong** (§1). Anything in REPORT.md that leans on "Bracket 5 drift because of fast mana or Game Changer count" should be read through §1 instead. Only the colors-only-commander and cEDH-shell arguments stand.

---

## 6. What to do next (for the receiving agent)
Done in the second round (2026-10-10): the Brago rebuild, step 9, and the rewritten REPORT, STATUS and SOURCES. What's left:
1. **Push** (the user, from GitHub Desktop).
2. **Before any purchase,** confirm prices over €20 on Cardmarket by hand (D20).
3. **Simulation session:**
   - Implement the 30 cards the Brago lists need (`missing-from-engine.md`: Brago, Peregrine Drake and Deadeye Navigator first).
   - Write a Brago deck brain:
     - what to blink (tapped rocks, enter-the-battlefield creatures, Reality Acid);
     - when to hold a counter;
     - tutor targets for the three kills.
   - Simulate Brago and Shalai against Corrupted Miku on paired seeds against `random4`.
   - Judge kill turn and consistency: bot win rates undervalue held counters (the tournament work showed the bots fire removal early and never hold protection).
4. **Mana study:** feed `deckshape-*.json` to `tools/sim/manamodel.js`. Ask the study's author for the "Mano" source, which couldn't be found.
5. **Brago's land count:** Karsten's regression suggests about 34 lands for the Brago shape against its 31. Watch missed land drops in simulation, and consider +1–2 lands.

---

## 7. Decisions index (full text in DECISIONS.md)
- D13 separate clone
- D14 bulk dates and index size
- D15 price rules
- D16 Miku printings by art tag
- D17 generated verbatim text
- D18 planeswalkers as commanders
- D19 SLD 2443
- D20 Cardmarket blocked
- D21 Summer Magic excluded
- D22 combos via Spellbook, plus my Oracle checks
- D23 queue corrections
- D24 public lists
- D25 generated pools
- D26 list construction
- D27 user's Bracket 4 clarification (this handoff)
- D28 Brago rebuilt as Bracket 4 blink-value
- D29 step 9 counting rules

---

## 8. Scripts (all in `research/miku-b4/`)
- `scryfall/bulk-index.js`: builds the index.
- `scryfall/card.js "Name" [--rulings]`: prints a card's Oracle text, prices and Miku printings.
- `scryfall/price.js list.txt > prices.csv`
- `scripts/verbatim.js commander|rulings NAMES`
- `scripts/build-combos.js`: work/combos-draft.json → combos.json.
- `scripts/build-pool.js`: draft/*.txt + work/lists/*-frequency.tsv + combos.json → pool/pool.tsv.
- `scripts/build-cards.js`: pool → cards.json and miku-prices.csv.
- `scripts/missing-from-engine.js > missing-from-engine.md`
- `scripts/check-decklists.js decklist-*.txt`: 100 cards, singleton, legality, identity, membership in cards.json, Game Changer count.
- `scripts/draftcheck.js draft/x.txt WU`: quick check of a draft list, with its price and engine coverage.

---

## 9. The earlier Miku-precon tournament research (same session, 2026-10-07)
Branch `miku-tournament` (pushed), folder `research/miku-tournament/local/`. Hero: the Hatsune Miku Secret Lair precon (Trostani). Event: Bracket 4. Cap: 15 swaps. Card pool: the precon plus the site's 80€ plan.
- **Honest numbers** (5,040 games per field, final brain): the box list wins **20.2% ±0.6** against three Bracket 4 bots and 48.4% against three precons. Median win round 10. In lost games it's out by about round 7.
- **Tiers** (paired against the box list, Δ = change on the Bracket 4 field):

  | Tier | Win vs Bracket 4 | Δ B4 | Cost |
  |---|---|---|---|
  | 5 | 21.4% | +1.3 ±0.5 | €0 |
  | 10 | 23.3% | +3.1 ±0.6 | €0 |
  | 15 | 23.6% | +3.4 ±0.7 | €0 |
  | 15 + Smothering Tithe | **25.1%** | +4.9 ±0.7 | ~€34 |
- **Other findings:**
  - Both site upgrade plans, played whole, measured **worse** than the box list (−2.6 on Bracket 4).
  - Single swaps are within ±1 point; packages count.
  - Shalai as commander on the precon's 100 was −1.4 on Bracket 4 and −14 against precons.
  - The site's Corrupted Miku measured 31.0% ±0.7 against Bracket 4 (+11.4 over the precon).
- **Engine work there (sim-only, the site untouched):**
  - a Miku deck brain (`miku/game/decks-miku-brain.js`) that plays Heliod + Ballista, the Spike Feeder loops, Aetherflux and Finale correctly;
  - a Storm Herd guard (the engine stalled on thousands of tokens);
  - Scurry Oak;
  - a `COMMANDER=` bench switch;
  - Miku telemetry;
  - test-miku.js 97 checks; all suites green.
- **Lessons that carry over:**
  - Bots undervalue held interaction.
  - A cut sweep (each card replaced by a basic land) shows the bots like lands, so read land counts through that.
  - Packages beat single swaps.
  - Confirm at 5,040 games: tier 5 regressed from +2.5 to +1.3.
  - Re-bench the base after every brain change.
  - Never wait on `pgrep -f` with a pattern that matches the waiting shell itself (cost an hour).
- **Known engine bug:** an opposing Kenrith's Transformation throws in `MK.derive` (`engine.js:171`) on some Corrupted Miku creatures (3 games in 5,040).
