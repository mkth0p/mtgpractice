# Prompt: deep research on an aggro theft deck led by Etrata, Deadly Fugitive

Paste everything below the line into Claude Code, started from a fresh clone of `mkth0p/mtgpractice` on branch `claude/project-thread-i7fwb2`, or on `main` once that branch is merged.

---

You are working autonomously for many hours on my Magic: The Gathering Commander project. I will not be watching. **Never stop to ask me anything.** When a choice comes up, pick the reasonable default, write the choice and why in `research/etrata-theft-aggro/local/DECISIONS.md`, and keep going. Web lookups are pre-approved, so do as many as you need.

## Goal
Find the strongest **aggro theft** Commander deck with **Etrata, Deadly Fugitive** as the commander. Blue-black only, and every card must be legal in Commander.

The deck's identity must be:
- cheap Assassins that connect early;
- each hit steals an opponent's card through Etrata's cloak, plus any other theft;
- the stolen cards become more attackers and more value, so the board snowballs.

**Etrata must matter.** "The same deck but she's never cast" should win clearly less often. Today it's the opposite.

It should be **much more aggressive** than the current list. Targets, in bot games:
- **at least 50%** win rate against three Bracket 2 precons (fair share is 25%), and as high as you can against three Bracket 4 bots;
- the **average winning round** lower than the current deck's 8.4.

Budget: total under **$1,500 USD**, with prices from real store pages. Game Changers are allowed (it's Bracket 4).

## What already exists (read these first, don't redo them)
All of this is in `research/etrata-theft-aggro/`:
- `FINDINGS.md` is the latest research: the Etrata diagnosis, bot benchmarks of a pure theft-aggro list and two hybrids, and a suggested 15-swap list.
- `sources/*.md` holds about 270 researched cards with exact Oracle text, prices and Card Kingdom URLs:
  - `theft-payoffs.md`, `aggro-scaling.md`, `assassins-and-lands.md`, `face-down-cards.md`, `defense-and-tempo.md`.
  - Extend these files rather than re-researching the cards in them.
- `v3-decklist.txt` is the current deck (Corrupted Etrata v3, vampire drain combo).
- `v3-RESULTS.md` covers how v3 was tuned and the paired-seed method.

Bot results so far, all with paired seeds:

| List | vs B2 precons | avg win round | vs B4 | avg win round |
|---|---|---|---|---|
| v3 (now) | 68.3% | 8.4 | 39.2% | 7.4 |
| Pure theft-aggro (vampire combo removed) | 3.8% | 11.5 | 2.8% | 10.6 |
| Hybrid 1 / 2 (drain kept as finisher) | 58.2 / 55.3% | 8.6 / 8.8 | 31.6 / 30.2% | 7.4 / 7.5 |

Telemetry on v3 shows Etrata gets cast 2.1 times a game, so she dies a lot. She steals 1.5 cards a game against precons and 3.8 against B4, but flips only 0.2–0.3 of them. The stolen cards stay blank 2/2s, because a face-down creature has no creature types and isn't an Assassin. Never casting her scored +1.5 against precons and +4.5 against B4.

Pure aggro failed at 3.8%: small evasive attackers deal about 15 combat damage a game against 120 total opponent life. **The core problem is damage throughput and closing.** Solve it with aggro or theft: anthems that don't break your evasion, double strike, commander-damage-free scaling, stolen fatties, extra copies of Etrata (Spark Double), trigger doublers, mass evasion, combat-damage drain, Thieving Amalgam drains and similar. Don't fall back on a non-aggro combo as the main plan. A small closer is fine if the deck still wins mostly by attacking and stealing. Measure how wins happen, and report it.

## The game engine and tools
The code is plain JavaScript. Read `CLAUDE.md` if there is one, then these:
- `miku/game/engine.js` (rules) and `miku/game/ai.js` (bots).
- Card files are `miku/game/cards-*.js`, using `MK.defineOnce`. The Etrata cards and her definition are in `cards-etrata.js`.
- The current deck object is `MK.CETRATA_DECK` in `decks-cetrata.js`, deck id `corrupted-etrata`. Its bot brain is in `MK.DECK_BRAINS`.
- `tools/sim/run.js` runs bot games. Test files are `tools/sim/test-*.js`; run the relevant ones after any engine change.
- `tools/sim/bench/` is the bench harness:
  - `bench.sh NAME GAMES_PER_PROC OPP [VARIANT_JSON]` runs PROCS processes, with seeds `1000 + k*N`.
  - `LIST_FILE=path` benches a whole decklist.
  - `NO_COMMANDER=1` never casts the commander.
  - `paired.js OUTDIR BASE VAR...` gives paired differences.
  - `telemetry.js` gives per-game Etrata stats.
  - Use OPP `random2` for precons and `random4` for Bracket 4.
  - **Set PROCS to your core count**, and use at least 2,000 games per comparison (about ±1 point paired). Confirm any final claim with 5,000+.

**Many key cards aren't in the engine yet**, so you'll need to implement them:
- They Came from the Pipes, Satoru the Infiltrator, Glitch Interpreter, Thieving Amalgam, Spark Double, Fading Hope, Ghostly Flicker;
- any new finds.

Follow the existing card-file style: exact Oracle text in `text`, and a `note` wherever the engine simplifies. Add a rules test for each new card in a `tools/sim/test-*.js`. Run `node tools/sim/test-rules.js` and the Etrata tests before every benchmark round, and never benchmark on red tests.

**The bot brain matters as much as the list.** The `corrupted-etrata` brain is built around the drain combo. Create a new deck, say `MK.ETRATA_AGGRO_DECK` with id `etrata-heist-aggro`, with its own brain tuned for attacking:
- who to attack;
- when to flip a stolen card (Etrata's flip, `etrataUpUse` in `cards-etrata.js`);
- keeping Etrata alive.

Register it the way `decks-cetrata.js` registers `corrupted-etrata`, so `run.js --decks` finds it. Bench it with `HERO=etrata-heist-aggro DECK_CONST=ETRATA_AGGRO_DECK`. Keep AI changes that help this deck gated to this deck, and don't change how other decks play.

Rules facts already established (see FINDINGS.md):
- A face-down creature has no types.
- Leyline of Transformation, Arcane Adaptation, Roshan and Maskwood make cloaks Assassins.
- Any +1/+1 effect turns off Tetsuko Umezawa's evasion.
- Conspiracy replaces types, so it isn't safe with Vampires.
- Gonti, Canny Acquisitor is blue-black-green, so it's illegal here.
- Etrata's flip is neither a cast nor an entry.
- No blue, black or colorless extra-combat card has been found yet; search harder with full-text search.

## How to work
1. **Research wide.** Do much more than the earlier rounds:
   - Search all blue, black and colorless cards with Scryfall full-text queries or the Scryfall API. For example: `o:"deals combat damage to a player" (c:u or c:b or c:c) legal:commander`, plus searches for face down, cloak, manifest, "you don't own", "creatures you control but don't own", Assassin, ninjutsu, double strike, "can't be blocked", "additional combat" and "triggers an additional time".
   - Read EDHREC (the Etrata page and its aggro and theft themes) and the Moxfield primer "Fugitives (Best Bracket 4 Assassin Snowball)" at `moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer`.
   - Read at least 10 public Etrata lists on Moxfield or Archidekt. Use their APIs if the pages need JavaScript: `api2.moxfield.com/v3/decks/all/<id>`, `archidekt.com/api/decks/<id>/`.
   - For every card you consider, record its exact Oracle text, cost, legality, Game Changer status and cheapest NM USD price, with the source URL. Use Card Kingdom or TCGplayer through Scryfall's `prices.usd`.
   - **Never invent or estimate a price or rules text.** If a lookup fails, write "not verified".
2. **Implement** the 20–40 most promising missing cards in the engine, with tests.
3. **Search the list space with bots:**
   - Start from 3–5 different archetype skeletons. Examples: Tetsuko 1-power evasion; type-changers plus menace and anthems; ninjutsu theft; Thieving Amalgam stolen bodies; Spark Double and Roaming Throne doubling.
   - Then hill-climb with paired-seed swaps, one card or package at a time, against both fields.
   - Keep a land count of 33–37, and test it.
   - Log every experiment, with its exact swap, game count and result, to `research/etrata-theft-aggro/local/EXPERIMENTS.md` as you go.
4. **Check Etrata's contribution** on the finalists with `NO_COMMANDER=1`. Also run `telemetry.js`: steals, flips and casts per game, and how games are won (combat damage versus drain versus other).
5. **Commit** often to a new branch, `etrata-heist-aggro-research`, and push. Don't touch `main`, the existing decks' lists, or the live site.

## Deliverables
Write these in `research/etrata-theft-aggro/local/`:
- **`REPORT.md`**: the recommended list and two alternatives.
  - For each list: win rate and average win round against B2 and against B4, with game counts and ± error; Etrata's contribution; and how it wins.
  - A short "how to pilot it" section.
  - What didn't work, with numbers.
- `decklist-<name>.txt` for each finalist, 100 cards with the commander. Also `prices-<name>.csv` (card, price, source URL), with the total.
- `EXPERIMENTS.md`, `DECISIONS.md`, and new or updated `sources/*.md` card research.
- The new engine cards, tests and deck definition, committed and pushed, with all tests passing.

Before you finish, re-read REPORT.md as a skeptic. Every number should trace to a logged experiment, every price to a URL, and every rules claim to Oracle text or an official ruling.
