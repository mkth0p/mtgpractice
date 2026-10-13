# STATUS

## Done in pass 1 (2026-10-07, mobile chat)

- **legality.md:** banned list, the 53 Game Changers, bracket definitions, 2024–2026 timeline.
- **commanders.md:** nine commanders verified (collector number, names, cost, type, identity, drop), the new-printing check, other Vocaloids, an evaluation of each, the shortlist, a candidate win-line queue and preliminary opposition notes.
- **rulings.md:** Child of Alara and CR 903.9a, Shalai, Brago, Feather, Thassa's Oracle, Trostani, Vorinclex.
- **DECISIONS.md.**

## Not done — in this order, for a session with the repo

1. Copy `research/etrata-theft-aggro/local/scryfall/` to `research/miku-b4/scryfall/` and widen the color filter to WUBRG. Load the oracle-cards, default-cards and rulings bulk files, and record each file's date.
2. Swap every paraphrase in commanders.md and rulings.md for verbatim Oracle text and rulings from bulk. Also confirm Brago's mana cost, Feather's power and toughness, Freyalise's loyalty, the commander eligibility of Elspeth Tirel and the four Vocaloid planeswalkers, and the rulings for Shalai, Azusa, Giada and Freyalise.
3. Read `MK.CORRUPTED_DECK` in `miku/game/cards-corrupted.js`, `miku/game/decks-azusa.js`, `miku/game/cards-miku.js` and every `miku/game/decks-*.js`. Count removal, counters, stax and graveyard hate per bot deck, and replace commanders.md section 7 with an opposition.md.
4. For each shortlisted commander, check every line in commanders.md section 6 on Commander Spellbook (`backend.commanderspellbook.com`): pieces, prerequisites, a step-by-step sequence a bot can follow, mana needed on the go-off turn, instant speed or not, what stops it, and the link. Then check each against Oracle text and rulings.
5. Read at least five public high-power lists per shortlisted commander (Moxfield `api2.moxfield.com/v3/decks/all/<id>`, Archidekt `archidekt.com/api/decks/<id>/`, EDHREC, cEDH Decklist Database, which this chat couldn't open). Discard any list that still runs Mana Crypt, Jeweled Lotus or Dockside Extortionist.
6. Build a 150–250 card candidate pool per shortlisted commander, by role, each card with a reason.
7. Prices: start from Scryfall bulk prices (`eur`, `usd`) and `purchase_uris`, dated by the bulk file. Scryfall's EUR figure isn't guaranteed to be the cheapest near-mint English listing, so confirm on the Cardmarket product page for anything expensive. Price Miku printings separately.
8. Write an uncapped list and a ~1,500 EUR list per shortlisted commander.

## Leads collected

- EDHREC Brago, cEDH average deck: https://edhrecstatic.com/average-decks/brago-king-eternal/cedh
- EDHREC Brago (Miku name), cEDH stax: https://edhrec.com/average-decks/miku-queen-electric/cedh/stax
- EDHREC Brago, Optimized blink: https://edhrecstatic.com/commanders/brago-king-eternal/optimized/blink
- EDHREC Brago, Optimized expensive: https://cloudflare.edhrec.com/commanders/brago-king-eternal/optimized/expensive
- Example Brago stax list, outdated (runs Mana Crypt and Jeweled Lotus): https://playgroup.gg/profiles/32485-milkmanproxies/decks/149392-suck-my-stax-10-pl/cards
- Miku Commander deck list: https://magic.wizards.com/en/news/announcements/secret-lair-commander-deck-hatsune-miku-decklist
- Electric Entourage card list: https://mtg.fandom.com/wiki/Secret_Lair_Drop_Series:_Camp_Totally_Safe_Superdrop
