# STATUS
Pass 2 ran 2026-10-08 (Claude Code, its own clone of the repo; DECISIONS D13). Steps refer to `pass1/STATUS.md`.

## Done in pass 2
1. **Scryfall bulk data.**
   - `scryfall/` is copied from the Etrata folder and widened to all five colors.
   - The oracle-cards, default-cards and rulings files are dated 2026-10-07 21:00 UTC (`scryfall/index-meta.json`).
   - The index is 53 MB, over the 20 MB limit, so it isn't committed; neither are the bulk files. `bulk-index.js` rebuilds both.
   - Miku printings come from Scryfall's art tag (`scryfall/miku-printings.json`, 46 printings).
2. **Verbatim text.**
   - `commanders.md` and `rulings.md` are generated from bulk data.
   - Brago costs {2}{W}{U}, Feather is 3/4, Freyalise has loyalty 3.
   - Elspeth Tirel and the four Vocaloid planeswalkers can't be commanders.
   - Rulings for Shalai, Azusa, Giada and Freyalise are included: Scryfall has none for Shalai or Freyalise.
3. *(Done in pass 1: `opposition.md`.)*
4. **Win lines.** `combos.json`: 25 lines checked on Commander Spellbook, with a bot script, mana needed, instant speed, weak-to and against-the-field notes. The pass 1 queue's errors are in DECISIONS D23.
5. **Public lists.** 38 read: 33 counted, 4 discarded for Mana Crypt or Jeweled Lotus, 1 kept for reference (`work/publiclists.md`, `work/lists/`).
6. **Candidate pool.** `cards.json` holds 485 cards: Child 209, Brago 188, Shalai/Trostani 246. Each card has roles, a reason, its rulings where they matter, and `in_engine`. `pool/pool.tsv` is the source.
7. **Prices.** From bulk, with Cardmarket and TCGplayer URLs (`prices-*.csv`, `miku-prices.csv`).
8. **Lists.**
   - An uncapped and a ~€1,500 list for each shortlisted commander, plus the Trostani A/B on Shalai's 99: 8 lists.
   - All 8 pass `scripts/check-decklists.js`.
   - `missing-from-engine.md` lists the 55 cards the engine lacks.
- **REPORT.md** (recommendation: Child of Alara, €1,500 list), `SOURCES.md`, `DECISIONS.md` (D13–D26).

## Not done
- **Cardmarket near-mint check (step 7).** Cardmarket blocks scripts and shows a Cloudflare challenge in the browser (D20). Every card over €20 still needs its cheapest near-mint English listing confirmed by a person.
- **Alternative-archetype lists (step 8, optional).** The research supports a Bracket 4 Brago value-blink build without the Kitten combo; it isn't written.
- **Not checked in this pass:**
  - the exact Comprehensive Rules text of 903.9a and 702.11 (rulings.md marks it "not verified");
  - whether the SLD 2443 display Trostani is a legal playing piece (D19);
  - Swift Reconfiguration's summoning-sickness interaction (REPORT §5).
- **Push.** The terminal has no GitHub credentials (`git push` asks for a username), so the commits are local in `/Users/glyphsek/Documents/mtg-todeletelater/miku-b4-pass2`. To publish them, open that folder in GitHub Desktop (File > Add Local Repository) and push `claude/project-thread-6gnnil`.

## Next (the simulation session)
1. Implement the 11 missing cards of `decklist-child-of-alara-1500.txt` (`missing-from-engine.md`), and write a Child deck brain: tutor for Thassa's Oracle + Demonic Consultation, hold a counter or Silence for the go-off turn.
2. Simulate Child €1,500, Shalai €1,500 and Corrupted Miku on paired seeds against `random4` and `random2`.
3. Then Trostani as an A/B on Shalai's 99, and Brago if its 27 missing cards are worth implementing.
