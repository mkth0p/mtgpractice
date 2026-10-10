# STATUS
Updated 2026-10-10. Pass 2 ran 2026-10-07 to 2026-10-10 (Claude Code, its own clone of the repo; DECISIONS D13). Steps follow `LOCAL-PROMPT.md`. Read `REPORT.md` for the results and `HANDOFF.md` for the full story.

## Done
1. **Scryfall bulk data.**
   - `scryfall/` covers all five colors.
   - Bulk files are dated 2026-10-07 21:00 UTC (`scryfall/index-meta.json`).
   - The 53 MB index and the bulk files aren't committed; `bulk-index.js` rebuilds them.
   - Miku printings come from Scryfall's art tag (`scryfall/miku-printings.json`, 46 printings).
2. **Verbatim text.** `commanders.md` and `rulings.md` are generated from bulk data; the open questions of pass 1 are answered there.
3. *(pass 1)* `opposition.md`.
4. **Win lines.** `combos.json`: 26 lines checked on Commander Spellbook, with bot scripts. Peregrine Drake + Deadeye Navigator was added on 2026-10-10 for the Bracket 4 Brago list.
5. **Public lists.** 82 list files in `work/lists/`. Counted:
   - 16 each for Brago, Child of Alara and Shalai;
   - 5 for Trostani;
   - 20 high-power lists of other commanders.
   
   Lists running Mana Crypt, Jeweled Lotus or Dockside Extortionist were discarded (`work/publiclists.md`).
6. **Candidate pool.** `cards.json` holds 486 cards (Child 210, Brago 188, Shalai/Trostani 246); `pool/pool.tsv` is the source.
7. **Prices.** From bulk, with URLs: `prices-*.csv`, `miku-prices.csv`.
8. **Lists.** 8 lists, all passing `scripts/check-decklists.js`:
   - Brago uncapped and €1,500, rebuilt 2026-10-10 as Bracket 4 blink-value: the recommendation;
   - Shalai uncapped and €1,500;
   - Trostani (Shalai's 99);
   - Child uncapped and €1,500, reference only.
   
   `missing-from-engine.md` lists 59 cards with Oracle text and implementation notes.
9. **Mana shape.**
   - `public-lists-shape.csv` (73 lists);
   - `deckshape-*.json` (8);
   - `mana-sources.md`;
   - `scripts/shape.js`;
   - findings in REPORT.md §5.

## Not done
- **The Cardmarket near-mint check for cards over €20 (step 7).** Cardmarket blocks scripts and shows a Cloudflare challenge in the browser (D20). A person has to confirm prices before buying.
- **A separate alternative-archetype list (step 8, optional).** The Bracket 4 Brago blink build *is* now the main Brago list, and the Kitten + Teferi version isn't kept, so no alternative list is written.
- **Not checked in this pass:**
  - Comprehensive Rules 903.9a / 702.11 wording (`rulings.md`, "not verified");
  - whether the SLD 2443 display Trostani is a legal playing piece (D19);
  - Swift Reconfiguration's summoning-sickness interaction (REPORT §6).

## Next (the simulation session)
1. Implement the 30 cards the engine lacks for `decklist-brago-*.txt` (`missing-from-engine.md`): Brago, Peregrine Drake, Deadeye Navigator first.
2. Write a Brago deck brain:
   - which permanents to blink (tapped rocks, enter-the-battlefield creatures, Reality Acid);
   - when to hold a counter;
   - tutor targets for Drake + Deadeye, Scepter + Reversal and Heliod + Ballista.
3. Simulate Brago and Shalai against Corrupted Miku on paired seeds. Judge kill turn and consistency, not only bot win rate: the bots under-use held counters.
4. Feed `deckshape-*.json` to `tools/sim/manamodel.js` for the mana study.
