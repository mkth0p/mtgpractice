# Miku high-Bracket-4 deck, research pass 2: report
2026-10-08, branch `claude/project-thread-6gnnil`, folder `research/miku-b4/`. Research only: no simulations, no engine changes. Pass 1 (`pass1/`) is untouched.

Every rules claim below traces to:
- the exact Oracle text in `commanders.md` / `cards.json`;
- a dated ruling in `rulings.md` / `cards.json`;
- or a Commander Spellbook page in `combos.json`.

Every price is Scryfall's bulk price (2026-10-07 21:05 UTC) with that printing's Cardmarket or TCGplayer URL in `prices-*.csv`. The cheapest near-mint English listing on Cardmarket is **not verified** for any card: Cardmarket's pages block both scripts and the browser pane behind a Cloudflare challenge (DECISIONS D20).

## 1. Recommendation

**Primary candidate: Child of Alara, colors only (`decklist-child-of-alara-1500.txt`).**
- It's the only one of the three that is a genuinely different and stronger deck than Corrupted Miku.
- Its main kill, Thassa's Oracle + Demonic Consultation, has both pieces already in the engine. It's two cards, at instant speed, and leaves nothing on the battlefield for the field's 8-removal decks (Edgar, Ur-Dragon) or its wipes to hit.
- The ~€1,500 version is the one I'd call high Bracket 4. It drops Underworld Breach, Lion's Eye Diamond and the original duals, and runs 19 Game Changers.
- The uncapped version (25 Game Changers, Breach + LED + Brain Freeze, ten original duals) is a cEDH shell in all but name. By Wizards' definition it drifts toward Bracket 5 (pass1 D3).

**Run Shalai as the baseline, not as the answer.**
- My Shalai lists share **71 of their nonbasic cards** (69 in the €1,500 list) with the site's Corrupted Miku, which already wins about 31–33% against the bots. Same archetype: green-white creature combos under hexproof.
- They're a cleaner, more combo-dense version of that deck, worth simulating as the A/B baseline against the Child list. But I don't expect them to be "much, much stronger" than Corrupted Miku.
- The Trostani versions use the same 99 with Shalai in it (pass1 D7).

**Brago is the interaction deck, and the most engine work.**
- The best counter suite of the three (Force of Will, Force of Negation, Fierce Guardianship, Mana Drain, Swan Song, Counterspell, Flusterstorm) answers Talrand's 13 counters.
- Teferi, Time Raveler stops opponents casting at instant speed, so a Talrand player can't counter the Kitten loop.
- But 27–28 of its cards are missing from the engine, including Brago himself, Displacer Kitten, Teferi and Peregrine Drake. Its in-engine lines (Isochron Scepter + Dramatic Reversal; Heliod + Walking Ballista) both run through artifacts or creatures the field removes.

**Suggested simulation order:**
1. Child €1,500 vs Corrupted Miku. It needs 11 new cards: Child itself, Tainted Pact, Chromatic Lantern, Snapcaster Mage, Orcish Bowmasters, Deathrite Shaman, Ragavan, Culling Ritual, Faerie Mastermind, and two lands (Prismatic Vista, Spire of Industry).
2. Shalai €1,500, as the like-for-like baseline (11 new cards).
3. Brago, only if the first two disappoint.

## 2. Win lines, ranked against the field
The field is the bots in `opposition.md`: Talrand's 13 counters; Edgar and Ur-Dragon with 8 targeted removal spells each; artifact/enchantment hate in Ur-Dragon, Azusa, Ghalta and Krenko; wipes in Talrand, Corrupted Etrata, Ur-Dragon and Krenko; almost no graveyard hate. Full scripts for a bot are in `combos.json` (25 lines); `work/winlines.md` has the research notes.

| Rank | Line (combos.json id) | Commanders | Instant speed | In engine | Against this field |
|---|---|---|---|---|---|
| 1 | Thassa's Oracle + Demonic Consultation (`thoracle-consult`) | Child | partly (Consultation at instant speed with the Oracle trigger on the stack) | yes | Nothing on the board to remove or wipe; only a counter on the Oracle stops it (Talrand, Etrata B4). Protect it with Silence, Grand Abolisher or a counter. |
| 2 | Heliod, Sun-Crowned + Walking Ballista (`heliod-ballista`) | all three | yes (abilities once both are out) | yes | Abilities can't be countered; under Shalai the Ballista can't be targeted. Dies to a wipe before the go-off turn. |
| 3 | Archangel of Thune + Spike Feeder + Ballista (`archangel-spikefeeder`) | Shalai, Child | yes (Feeder's loop costs nothing) | yes | Can win in response to a wipe if the pieces are out; needs Thune alive through each loop. |
| 4 | Devoted Druid + Vizier of Remedies + Ballista (`druid-vizier`) | Shalai, Child | partly | yes | Cheap (4 mana for the pair). Under Shalai only wipes and removal on Shalai interfere; Talrand can counter the Ballista. |
| 5 | Thassa's Oracle + Tainted Pact (`thoracle-pact`) | Child | partly | Pact missing | Same profile as #1. The list runs one of each basic, so Pact keeps exiling past them. |
| 6 | Displacer Kitten + Teferi, Time Raveler + Sol Ring, Oracle finish (`kitten-teferi-solring`) | Brago | no (loyalty abilities) | Kitten, Teferi missing | Teferi's static shuts off the field's instant-speed counters during the loop; Kitten is a 2/2 in front of 8-removal decks. |
| 7 | Isochron Scepter + Dramatic Reversal + Ballista (`scepter-reversal`) | Brago, Child | partly | yes | Needs nonland mana sources that tap for 3 or more; the Scepter dies to the field's artifact hate (Ur-Dragon 6 answers). |
| 8 | Devoted Druid + Swift Reconfiguration (`druid-swiftreconfig`) | Shalai, Child | partly | Aura missing | A second Druid line; the flash Aura makes it a noncreature Vehicle, so it taps the turn it lands. |
| 9 | Kiki-Jiki + Zealous Conscripts (`kiki-conscripts`) | Child | no (needs combat) | yes | Middling against removal-heavy decks. |
| 10 | Underworld Breach + Lion's Eye Diamond + Brain Freeze (`breach-led-brainfreeze`) | Child (uncapped only) | partly | 3 pieces missing | The field has almost no graveyard hate, but it's the hardest line to script; backup only. |

The rest are redundancy or for reference only: Basalt Monolith + Forsaken Monument / Rings / Power Artifact, Peregrine Drake + Ghostly Flicker + Archaeomancer, Thassa's Oracle + Thought Lash, the Brago-enabled loops, Rosie + Broodscale, Trostani + Scurry Oak + Thune, Sanguine Bond + Exquisite Blood, Coalition Victory. The pass 1 queue items that turned out not to be combos are in DECISIONS D23.

## 3. The lists
All lists are exactly 100 cards, commander first, one `1 Card Name` line per card. All pass `scripts/check-decklists.js`: 100 cards, singleton except basics, every card Commander-legal and inside the commander's identity (Scryfall bulk), every card in `cards.json`.

| List | Commander | € (Cardmarket trend) | $ (TCGplayer) | Game Changers | Lands | Cards with a Miku printing | Cards missing from the engine |
|---|---|---|---|---|---|---|---|
| `decklist-child-of-alara-1500.txt` | Child of Alara | 1,541 | 1,990 | 19 | 31 | 9 | 11 |
| `decklist-child-of-alara-uncapped.txt` | Child of Alara | 6,830 | 10,701 | 25 | 31 | 9 | 17 |
| `decklist-shalai-1500.txt` | Shalai, Voice of Plenty | 1,537 | 1,971 | 13 | 32 | 17 | 11 |
| `decklist-shalai-uncapped.txt` | Shalai, Voice of Plenty | 3,619 | 5,116 | 15 | 32 | 16 | 11 |
| `decklist-trostani-1500.txt` | Trostani (Shalai in the 99) | 1,537 | 1,971 | 13 | 32 | 17 | 11 |
| `decklist-trostani-uncapped.txt` | Trostani (Shalai in the 99) | 3,619 | 5,116 | 15 | 32 | 16 | 11 |
| `decklist-brago-1500.txt` | Brago, King Eternal | 1,547 | 2,040 | 15 | 30 | 10 | 27 |
| `decklist-brago-uncapped.txt` | Brago, King Eternal | 2,682 | 3,843 | 16 | 30 | 10 | 28 |

- **Prices:** the cheapest nonfoil printing of each card. Per-card prices and URLs are in `prices-<list>.csv`, with the total and Game Changer count on the last row.
- **Miku printings** (Scryfall's art tag `hatsune-miku`; mostly foil-only, priced separately in `miku-prices.csv`) cost more than these totals. For example, Sol Ring SLD 1604 is €60, against €0.85 for the cheapest Sol Ring.
- **The ~€1,500 lists** are the uncapped ones with the most expensive cards swapped (DECISIONS D26):
  - Shalai: Gaea's Cradle, Mox Diamond and Savannah.
  - Brago: Mox Diamond and Tundra.
  - Child: the ten original duals become shock lands, and Lion's Eye Diamond, Mox Diamond, Grim Monolith, Imperial Seal and Ancient Tomb become cheaper equivalents. The Breach line goes too, since it doesn't work without Lion's Eye Diamond.

**What each deck is.**
- **Child of Alara:**
  - **Kill:** Thassa's Oracle with Demonic Consultation or Tainted Pact; backups are Heliod + Ballista, Scepter + Reversal, Kiki-Jiki + Conscripts.
  - **Tutors (9):** Demonic, Vampiric, Imperial Seal, Mystical, Enlightened, Worldly, Gamble, Diabolic Intent, Grim Tutor.
  - **Free and cheap interaction:** Force of Will, Force of Negation, Fierce Guardianship, Pact of Negation, Swan Song, Counterspell, Mana Drain, Deadly Rollick.
  - **Protection for the go-off turn:** Silence, Grand Abolisher, Teferi's Protection, Veil of Summer.
- **Shalai:**
  - **Kill:** Heliod + Ballista, Thune + Feeder, Druid + Vizier / Swift Reconfiguration, with Craterhoof as backup.
  - **Tutors (12):** Worldly, Enlightened, Eladamri's Call, Chord of Calling, Finale, Green Sun's Zenith, Natural Order, Survival, Fauna Shaman, Ranger-Captain, Recruiter of the Guard, Sylvan Tutor.
  - **Protection:** Shalai's hexproof plus Teferi's Protection, Heroic Intervention, Flawless Maneuver, Grand Abolisher, Mother/Giver of Runes, Veil of Summer.
  - **Anti-counter:** Allosaurus Shepherd, Destiny Spinner, Kutzil.
- **Brago:**
  - **Kill:** Kitten + Teferi + rocks with the Oracle finish, Scepter + Reversal, Heliod + Ballista, Drake + Flicker + Archaeomancer.
  - **Interaction:** a 9-counter suite plus Swords, Path and Cyclonic Rift.
  - **Brago:** resets the rocks and enter-the-battlefield creatures (Aether Channeler, Tribute Mage, Spellseeker, Recruiter, Venser, Skyclave Apparition).

**Not written:** an alternative-archetype list. The research supports a Bracket 4 Brago value-blink build without the Kitten combo (`work/publiclists.md`, Brago archetype 2), but it isn't written. See STATUS.md.

## 4. How much stronger than Corrupted Miku? My honest view
**Child of Alara, €1,500 list.** I expect it to be clearly stronger in bot games, but that's a hypothesis until simulated.
- The reasons are structural: a two-card instant-speed kill that the bots' removal can't touch, nine tutors to find it, and free counters to protect it. The field has almost no answer to a resolved Thassa's Oracle.
- Wizards expects at least four turns of play at Bracket 4. The list should threaten its kill on turns 4–6, with turn 4 the outlier. If the simulations show a median kill on turn 4, it's drifting into Bracket 5 (pass1 D3), and the fix is to cut fast mana, not tutors.
- Pass 1 notes that bot combo decks only win with a scripted plan. The Child list needs a deck brain that tutors for Oracle + Consultation and holds a counter, like the Etrata and Corrupted brains.

**Shalai.** About the same as Corrupted Miku, plus or minus a few points; it's the same deck tuned differently (71 shared cards).

**Brago.** Unknown until its 27 missing cards are implemented. Its strength is exactly what the bots do least well: holding counters. Bot results will undersell it.

## 5. Skeptic's notes
- **Nothing is simulated.** Every strength claim above is an argument from card text and the opposition count.
- **Combos are from Commander Spellbook.** I re-checked the riskiest claims against Oracle text myself (D22). One step is my inference, not a Spellbook or ruling claim, and needs a check in the engine: a Devoted Druid enchanted by Swift Reconfiguration has no summoning sickness, because it's no longer a creature.
- **Pool reasons are generated** from role rules plus public-list frequency (D25). They are accurate but generic. The cards that matter (win-line pieces) name their line.
- **Public lists:** 33 counted; 4 discarded for running Mana Crypt or Jeweled Lotus. No cEDH Decklist Database entry exists for any of these commanders (`work/publiclists.md`).
- **Prices:**
  - Scryfall's EUR is the Cardmarket trend, not the cheapest near-mint English listing, and the listings couldn't be checked (D20).
  - Summer Magic printings were excluded because their trend is noise (D21).
  - The original dual lands dominate the uncapped Child list's price.
- **Commander status of the Miku planeswalkers:** checked. Only Freyalise can be a commander (D18).

## 6. Files
- `commanders.md`, `rulings.md`: verbatim Oracle text and dated rulings (step 2).
- `combos.json` (25 lines), `cards.json` (485 candidates; Child 209, Brago 188, Shalai/Trostani 246), `pool/pool.tsv` (the pool with roles and reasons).
- `decklist-*.txt` (8), `prices-*.csv` (8), `miku-prices.csv`, `missing-from-engine.md` (55 cards, win-line pieces first).
- `SOURCES.md`, `DECISIONS.md` (D13–D26), `STATUS.md`.
- `work/`: the research notes (`winlines.md`, `publiclists.md`, `combos-draft.json`, `lists/`).
- `draft/`: the list sources.
- `scripts/`: the generators (`verbatim.js`, `build-combos.js`, `build-pool.js`, `build-cards.js`, `missing-from-engine.js`) and checkers (`check-decklists.js`, `draftcheck.js`).
- `scryfall/`: the index tools. The 53 MB index and the bulk files aren't committed; `bulk-index.js` rebuilds them.
