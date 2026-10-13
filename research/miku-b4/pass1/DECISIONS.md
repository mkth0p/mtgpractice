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
