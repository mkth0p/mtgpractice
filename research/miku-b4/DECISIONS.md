# DECISIONS — research/miku-b4

Each entry gives the choice, then the reason. Pass 1 ran on 2026-10-07 in the Claude mobile chat.

**D1. This pass covers only the research everything else depends on.**
The chat couldn't read the repo (nothing was uploaded, so `miku/game/*.js` and the Scryfall helpers were out of reach), its sandbox had no network for bulk data, and a chat turn can't run for hours. I did the legality snapshot, the commander list, the shortlist and the key rulings. The rest is queued in STATUS.md for a session with the repo.

**D2. "Much, much stronger" is measured as win rate against the repo's Bracket 4 bot decks.**
The Child of Alara turbo already goldfishes about 22% by turn 4 and 51% by turn 6, so speed alone isn't the gap. The bot results are where the current decks fall short (Shalai 33%, Azusa 20%, precon 31–44%), and combo decks only win there with a scripted plan. So win lines with short, fixed sequences and redundant pieces rank above faster but branchier ones.

**D3. Target kill window: turns 5–6, with turn 4 as an outlier.**
Wizards' Bracket 4 definition expects at least four turns before anyone wins or loses (legality.md). The brief's "turns 4 to 6" stands, but a list whose median kill is turn 4 should be flagged as drifting toward Bracket 5.

**D4. Budget: about 1,500 EUR is the default for the cheaper list, not a rule.**
Each shortlisted commander gets an uncapped list and a ~1,500 EUR list. Neither is started.

**D5. Freyalise, Llanowar's Fury (SLD #1598, "Miku, Voice of Power") is a ninth commander.**
Its Oracle text has the "can be your commander" line. Evaluated, not shortlisted.

**D6. Shortlist: Child of Alara, Brago, Shalai.**
Child has the highest ceiling and every two-card line. Brago is the only Miku commander with an established high-power identity and has the best stack interaction among the pairs. Shalai's hexproof answers targeted removal on creature combos. Full reasoning in commanders.md.

**D7. Green-white is one 99 with two command-zone options.**
Shalai and Trostani share an identity, so the simulator can A/B them on one 99 instead of building two green-white decks. Shalai is the primary because protection does more against interaction than lifegain.

**D8. Oracle text and rulings are paraphrased, with sources and dates.**
The verbatim text lives in Scryfall's bulk files, which the repo session loads anyway; paraphrasing here keeps quoting short. Some collector numbers came from retailer listings that mirror Scryfall, so confirm them against bulk data too.

**D9. No prices recorded.**
Nothing was looked up to spec (cheapest near-mint English on Cardmarket plus TCGplayer or Card Kingdom, with URLs). Every price stays "not verified" until the method in STATUS.md, step 7, runs.

**D10. The display commander (SLD #2443) is excluded.**
It's marked not tournament legal.

**D11. Non-Miku Vocaloid cards are flagged, not evaluated.**
KAITO, Luka, Len and Rin, and MEIKO are all planeswalkers, not legendary creatures. Their commander eligibility wasn't verified; the user decides whether they matter.

**D12. Commander death follows CR 903.9a, not older forum answers.**
Answers from before mid-2020 describe the old replacement rule. Under the current rule a commander reaches the graveyard first, so Child of Alara's death trigger fires (rulings.md).

## Pass 2 (2026-10-08, Claude Code on the user's Mac)

**D13. A fresh clone, separate from the shared working folder.**
The prompt asks for a fresh clone of `claude/project-thread-6gnnil`. The usual folder (`mtgpractice/`) is shared with two other research sessions on other branches, and switching its branch would pull their files out from under them. So this pass works in its own clone, `/Users/glyphsek/Documents/mtg-todeletelater/miku-b4-pass2/`, and touches nothing else.

**D14. The bulk files: 2026-10-07 21:00 UTC.** Downloaded 2026-10-08 00:17 local time, recorded in `scryfall/index-meta.json`:
- `oracle-cards-20261007210155`;
- `default-cards-20261007210542`;
- `rulings-20261007210031`.

The index covers all five colors: 34,543 cards, every non-token Oracle card, each with its Commander legality. The index is 53 MB, over the prompt's 20 MB limit, so it's kept out of git (`scryfall/.gitignore`), along with the bulk files and `sld-printings.json`. The scripts, `index-meta.json` and `miku-printings.json` are committed.

**D15. Prices from bulk.**
- `price_eur` is the lowest nonfoil `prices.eur` (Cardmarket trend) over the card's paper printings, with that printing's Cardmarket purchase URL.
- `price_usd` is the lowest nonfoil `prices.usd` (TCGplayer market), with that printing's TCGplayer URL.
- Both are dated by the default-cards file.
- Foil-only printings (most of the Miku commander deck: SLD 2429–2443 have only a foil price) aren't used for the cheapest price; they're reported under the Miku printings.

**D16. Which printings are Miku printings.** It's Scryfall's art tag `hatsune-miku` on Secret Lair printings: 46 printings, fetched 2026-10-08 with one API search (`set:sld art:hatsune-miku`), saved in `scryfall/miku-printings.json`. The flavor name alone misses Miku-art cards without a Miku name: Sol Ring 1604, Counterspell 1589, Swan Song 1591, Chord of Calling 1595, Elvish Mystic 805, Command Tower 806 and others.

**D17. Verbatim text is generated, not typed.** `scripts/verbatim.js` writes each card's Oracle text and dated rulings straight from the index into `commanders.md` and `rulings.md`, so no paraphrase can slip back in.

**D18. Planeswalkers as commanders.** Elspeth Tirel and the four Vocaloid planeswalkers have no "can be your commander" line in their Oracle text, so they can't be commanders. Freyalise has the line and keeps pass 1's evaluation.

**D19. SLD 2443 stays excluded.** Bulk data says `legal` for that printing, as it does for every printing of the card. Whether the display copy is a legal playing piece wasn't verified, so pass1 D10 stands.
