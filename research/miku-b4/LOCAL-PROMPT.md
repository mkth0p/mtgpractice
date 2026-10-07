# Prompt: Miku high-Bracket-4 research, pass 2 (picks up from pass 1)

Paste everything below the line into Claude Code on your machine, started from a fresh clone of `mkth0p/mtgpractice` on the branch `claude/project-thread-6gnnil`. That branch already holds pass 1 (`research/miku-b4/pass1/`), the opposition count and the list of cards the engine supports. It does research only: no simulations, no engine changes. When it's done it pushes to the same branch, and you tell me so I can start the simulations.

---

You are working autonomously for several hours on my Magic: The Gathering Commander project. I will not be watching. **Never stop to ask me anything.** When a choice comes up, pick the reasonable default, add it to `research/miku-b4/DECISIONS.md` (start from `pass1/DECISIONS.md`, keep its numbering), and keep going. Web lookups are pre-approved, so do as many as you need.

**Never invent or estimate a price, Oracle text, legality or ruling.** If a lookup fails, write "not verified" and move on.

## Goal
This is the second research pass for a new Commander deck that is much, much stronger than my current Miku decks. The commander must be a Hatsune Miku Secret Lair card, and the deck must be **high Bracket 4**: as strong as possible while staying Bracket 4, not a cEDH tournament deck. It should threaten wins around turns 5 to 6 (turn 4 sometimes), carry real interaction, and beat other Bracket 4 decks. Simulations come after this pass, in another session, against the repo's bot decks.

## Read first (already done, don't redo it)
In `research/miku-b4/`:
- `pass1/STATUS.md`: what pass 1 did and the 8 steps left. **Your work is those steps**, except step 3, which is done.
- `pass1/legality.md`: banned list and the 53 Game Changers as of 2026-10-07.
- `pass1/commanders.md`: all nine Miku commanders and the **shortlist: Child of Alara, Brago, and Shalai (with Trostani as an A/B on the same 99)**. Its section 6 is the win-line queue. Its section 7 is replaced by `opposition.md`.
- `pass1/rulings.md` and `pass1/DECISIONS.md`.
- `opposition.md` (step 3, done): interaction counts and win lines of every bot deck the new deck will face, and what follows for each commander. In short: Talrand carries 13 counters, Edgar and Ur-Dragon 8 targeted removal spells each, graveyard hate is almost absent, stax is rare, and Corrupted Etrata runs Opposition Agent.
- `engine-cards.txt`: the 1,082 card names the game engine already defines. Use it for `in_engine`.

Earlier results to beat: Corrupted Miku (Shalai, about $5,974) wins about 33% against the bot decks; Azusa about 20%; the Miku precon 31 to 44%. The older Child of Alara turbo list goldfished about 22% wins by turn 4 and 51% by turn 6. In bot games, combo decks only win with a scripted plan, so every win line must come with an exact sequence a bot can follow.

## The steps (from pass1/STATUS.md)
1. **Scryfall bulk data.** Copy `research/etrata-theft-aggro/local/scryfall/` to `research/miku-b4/scryfall/` and widen its color filter from blue-black to all five colors. Download the oracle-cards, default-cards and rulings bulk files from `api.scryfall.com/bulk-data` and record each file's date. Don't commit the bulk files themselves (add them to `.gitignore`); commit the scripts and the index only if it's under 20 MB.
2. **Verbatim text.** Replace every paraphrase in `pass1/commanders.md` and `pass1/rulings.md` with exact Oracle text and dated rulings from bulk data, in new files `commanders.md` and `rulings.md` at `research/miku-b4/` (leave pass1/ untouched). Also confirm: Brago's mana cost, Feather's power and toughness, Freyalise's loyalty, whether Elspeth Tirel and the four Vocaloid planeswalkers can be commanders, and the rulings for Shalai, Azusa, Giada and Freyalise.
3. *(Done: `opposition.md`.)*
4. **Win lines.** For each shortlisted commander, check every line in `pass1/commanders.md` section 6 on Commander Spellbook (`backend.commanderspellbook.com`), and search it for more lines in each color identity. Prefer lines that beat the field in `opposition.md`. For each one record the pieces, prerequisites, a step-by-step sequence a bot can follow, mana needed on the go-off turn, instant speed or not, what stops it, and the Spellbook link. Check each against Oracle text and rulings.
5. **Public lists.** Read at least five high-power lists per shortlisted commander: Moxfield (`api2.moxfield.com/v3/decks/all/<id>`), Archidekt (`archidekt.com/api/decks/<id>/`), EDHREC average decks (leads are in STATUS.md), cEDH Decklist Database. Throw out any list still running Mana Crypt, Jeweled Lotus or Dockside Extortionist, and note in `SOURCES.md` what each list taught you.
6. **Candidate pool.** 150 to 250 cards per shortlisted commander, by role (fast mana, ramp, tutors, draw, free and cheap interaction, protection for the combo turn, win-line pieces and their redundancy, lands), each with a one-sentence reason.
7. **Prices.** Start from Scryfall bulk prices (`eur`, `usd`) and `purchase_uris`, dated by the bulk file. For any card over 20 EUR, confirm the cheapest near-mint English listing on its Cardmarket product page and keep that URL. Price Miku printings separately.
8. **Lists.** For each shortlisted commander, write an uncapped list and a ~1,500 EUR list (the 1,500 EUR is my default, not a rule), plus one or two alternative archetypes if the research supports them. For green-white, one 99 serves both Shalai and Trostani.

## Output (all under `research/miku-b4/`)
The next session loads this straight into the game engine, so keep the formats exact.
- **`REPORT.md`**: the recommended commander and archetype, the win lines ranked against `opposition.md`, the lists with their prices, and your honest view of how much stronger they should be than Corrupted Miku, and why.
- `commanders.md`, `rulings.md` (verbatim, step 2).
- **`cards.json`**: an array, one object per candidate card: `name` (exact Oracle name), `mana_cost`, `cmc`, `type_line`, `oracle_text` (for two-faced cards, `faces` with each face's name, cost, type and text), `power`, `toughness`, `loyalty`, `color_identity`, `keywords`, `legal_commander`, `game_changer`, `price_eur`, `price_eur_url`, `price_usd`, `price_usd_url`, `price_date`, `miku_printing` (SLD number or null), `roles`, `for_commanders`, `combos` (ids from combos.json), `why`, `rulings` (only the ones that matter, with date and text), `in_engine` (exact match against `engine-cards.txt`).
- **`combos.json`**: an array of win lines: `id`, `name`, `pieces`, `colors`, `prerequisites`, `steps` (an ordered list a bot can follow), `mana_needed`, `instant_speed`, `result`, `weak_to`, `beats_field` (one line on how it fares against opposition.md), `spellbook_url`.
- **`decklist-<commander>-<name>.txt`**: exactly 100 cards as `1 Card Name`, commander on the first line, exact Oracle names (front face for two-faced cards). One `prices-<commander>-<name>.csv` per list with `qty,card,price_eur,price_eur_url,price_usd,price_usd_url,game_changer` and the total.
- **`missing-from-engine.md`**: every card in your lists that isn't in `engine-cards.txt`, most important first, with Oracle text and one line on anything tricky to implement.
- `SOURCES.md` (every page used, with URL and date), `DECISIONS.md`, and an updated `STATUS.md` saying what's done and what isn't.

## How to work
- Commit after each step and push to `claude/project-thread-6gnnil` (`git push -u origin claude/project-thread-6gnnil`), so nothing is lost if you stop. Don't touch `main`, the game engine, the deck sites, `pass1/`, or any other research folder.
- Before you finish, re-read REPORT.md as a skeptic. Every rules claim should trace to Oracle text or a dated ruling, every price to a URL. Write a small script that checks each decklist: exactly 100 cards, singleton except basics, every card legal and inside the commander's color identity, every card present in cards.json, and the Game Changer count. Fix what it finds and report the counts in REPORT.md.
