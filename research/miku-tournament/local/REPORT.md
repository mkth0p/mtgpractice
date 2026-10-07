# Trostani (Miku precon) for tonight's Bracket 4 event: report
Written 2026-10-07, about 18:30. Branch `miku-tournament`. Every number comes from the bot engine (`miku/game`), run with `tools/sim/bench`. The raw rows are in `xp/xp.log`, every run is listed in `EXPERIMENTS.md`, and every choice is explained in `DECISIONS.md`. Pilot sheet: `PILOT.md`.

**Assumptions** (the prompt left these slots empty; DECISIONS 1–4):
- The event is Bracket 4 ("backet 4 deck"), where only the banned list applies.
- The swap pool is the precon plus the 22 cards of the 80€ plan, taken as owned.
- About 6 hours of work.
- The commander slot is open; a Miku card is preferred (user, 14:30).

## 1. The answer

| Tier | Cards changed | vs Bracket 4 bots (the event) | Δ paired | vs precons | Δ paired | Games per field |
|---|---|---|---|---|---|---|
| 0: the box, piloted well | 0 | **20.2% ±0.6** | | 48.4% ±0.7 | | 5,040 |
| 5 (`decklist-tier5.txt`) | 5 | **21.4% ±0.6** | **+1.3 ±0.5** | 53.1% ±0.7 | +4.7 ±0.7 | 5,040 |
| 10 (`decklist-tier10.txt`) | 10 | **23.3% ±0.6** | **+3.1 ±0.6** | 53.7% ±0.7 | +5.3 ±0.8 | 5,040 |
| 15 (`decklist-tier15.txt`) | 15 | **23.6% ±0.6** | **+3.4 ±0.7** | 56.7% ±0.7 | +8.3 ±0.9 | 5,040 |

- A fair share at a four-player table is 25%.
- Paired Δ is against the box list on the same seeds, in percentage points.
- All three tiers use only owned cards (precon + 80€ plan), so **€0 to buy**.
- Each tier contains the one below it, so you can stop at any tier.

**Recommendation: tier 10, or tier 15 if you have time to sleeve 15 swaps.**
- Tier 10 gets most of the gain (+3.1 of +3.4 against Bracket 4).
- Tier 15 adds little against Bracket 4 (+0.3 over tier 10, within noise) but a lot against slower tables (+3.0 against precons).
- Keep **Trostani** as commander.

**Commander.** Shalai, Voice of Plenty is the only other Miku printing that can lead these cards: her {4}{G}{G} ability gives her a green-white identity. She measures **−1.4 ±1.1** against Bracket 4 and **−14.2 ±1.3** against precons on the same 100 cards. Without Trostani's lifegain on every creature, the precon's lifegain half goes quiet. Vorinclex, the third legendary Miku card, is mono-green: 59 of the 99 would be illegal.

## 2. The honest numbers of the box list (goal 2)
5,040 games per field, PROCS=18, N=280, on the final brain:

| Field | Win | Average win round | Median win round | How the wins happen |
|---|---|---|---|---|
| 3 random Bracket 2 precons | **48.4% ±0.7** | 13.7 | 13 | last kill: combat 82%, drain 14% (mostly Aetherflux), Halo Fountain 3% |
| 3 random Bracket 4 bots | **20.2% ±0.6** | 10.9 | 10 | last kill: combat 85%, drain 12% (mostly Aetherflux), Halo Fountain 1% |

The same list on the engine's generic bot (no deck brain, before this research): 46.2% ±0.7 / 19.5% ±0.6 (P280).

How the box list loses against Bracket 4 (4,024 lost games):
- **Before it gets going.** When it's knocked out, it's out by a median of **round 7**, a quarter of the time by round 6. Its own median win is round 10–11.
- **How it dies:** combat 42%, noncombat (drains, combo damage) 42%, alternate wins 8%, commander damage 5%.
- **Who wins the lost games:** Corrupted Etrata's drain combo 23% (it wins 49% of the games it's in), Ghalta's big creatures 18%, the rest 6–12% each.
- **Speed matters, the timing of Trostani doesn't.** Trostani reaches the battlefield in 90% of games, by round 4 at the median. Whether she lands in round 3 or round 6 barely changes the win rate (21–23%); never casting her drops it to 1.6%. Sol Ring on the battlefield by round 4 means 26% wins, against 19%.

## 3. The swaps, and why

**Tier 5** (from the box, cut → in):

| Cut | In | What the new card does |
|---|---|---|
| Song of the Worldsoul | **Generous Gift** | 3-mana instant that destroys any permanent: the combo piece, Smothering Tithe, a Thassa's Oracle. Song is a 6-mana engine that does nothing the turn it lands. |
| Rhys the Redeemed | **Arcane Signet** | 2-mana rock for either color, which fixes {G}{G}{W}{W}. Rhys's abilities cost 3 and 6 mana plus a tap. |
| Excavation Technique | **True Conviction** | Your creatures get double strike and lifelink. Doubles a wide board's damage, and each lifelink hit is a Thune, Cleric Class or Pridemate-style trigger. |
| Phyrexian Processor | Plains | The cut sweep scores a land above Processor (+0.9 / +1.6). |
| Song of Freyalise | Forest | A land beats it in bot games (+1.0 / +0.5). |

**Tier 10** = tier 5, but Processor's slot gets **Elvish Mystic** and Freyalise's slot gets **Elspeth, Sun's Champion** (so the tier-5 Plains and Forest move to the slots below), plus:

| Cut | In | What the new card does |
|---|---|---|
| Growing Ranks | **Beast Within** | 3-mana instant that destroys any permanent; the second hard answer. |
| Prosperous Innkeeper | Plains | |
| Ancient Cornucopia | Forest | |
| Angelic Chorus | Plains | |
| Camaraderie | **Hero of Bladehold** | Two attacking tokens and battle cry each attack. A must-answer threat that soaks removal before Thune. |

- **Elvish Mystic:** a turn-1 mana creature.
- **Elspeth:** three Soldiers a turn, or a one-sided wipe of power 4+ creatures (Ghalta-style boards).

**Tier 15** = tier 10 plus:

| Cut | In | What the new card does |
|---|---|---|
| Springleaf Drum | **Return of the Wildspeaker** | Instant: draw cards equal to your best non-Human's power, or Overrun-lite (+3/+3 to non-Humans). |
| Ajani's Pridemate | **Overwhelming Stampede** | The overrun: +X/+X and trample, where X is your best power. |
| Conclave Evangelist | **Adeline, Resplendent Cathar** | An attacking token per opponent every combat, and she grows with the board. |
| Healing Technique | **Esika's Chariot** | Two 2/2 Cats, and it copies a token when it attacks. Survives creature wipes. |
| Silverquill Lecturer | **Cathars' Crusade** | Every creature that enters puts a counter on each of yours. |

**Why these cuts.**
- **The cut sweep** (experiment 21) replaced each nonland card with a basic land, 2,016 paired games per field. The cuts are the cards that measured ≥ +0.5 on the Bracket 4 field without hurting the precon field.
- **Interaction stays even when it measured near zero.** Swords to Plowshares +0.6, Rootborn Defenses +0.6, Grand Crescendo +0.5: the bots fire removal early and never hold protection for a wipe (see §6).
- **The clear keeps** (worse as a land): Sol Ring (−1.3), Shalai (−1.0), Ghalta and Mavren (−0.9), Avacyn's Pilgrim (−0.7), Crested Sunmare, Lathiel, Mirari's Wake and Storm Herd.

**Why these adds.** They're the best of the 27 plan swaps measured one at a time (experiment 11): Generous Gift +0.8, Arcane Signet +0.7, True Conviction +0.7, Elvish Mystic +0.5, Craterhoof +0.4 (not owned), Elspeth +0.3 / +2.4 on precons. Single swaps are all within ±1.1. They count only as packages: the six best singles together gave +3.1 ±0.8 (pk-top6).

## 4. What was tried and didn't work

| Try | Result (Δ B4 / Δ B2) | Why |
|---|---|---|
| The site's 80€ plan, whole (22 swaps) | −2.6 ±0.7 / −4.9 ±0.9 (5,040) | It cuts the precon's lifegain multipliers (Boon Reflection, Angelic Chorus, Mirari's Wake, Crested Sunmare) that make Thune and Trostani snowball, and adds combo pieces that rarely meet. |
| The site's full upgrade, whole (24 swaps) | −2.6 ±0.7 / −8.8 ±0.9 (5,040) | Same, plus Jazal (−1.1 alone). |
| Heliod + Walking Ballista (+ Spike Feeder) | −0.8 ±0.5 / −1.6 (pair); +0.1 ±0.6 / −1.7 (trio); tier-15 version (v15a) +3.7 vs +4.8–5.6 for the others | Without tutors the pieces meet in about 4% of games. When they do, the deck wins 70–90% of those games, now that the brain plays the line. |
| Single combo pieces | Heliod −1.0, Ballista −0.3, Spike Feeder −0.2 | A half combo is a weak card. |
| Shalai, Lathiel, Rhys, Ghalta and Mavren as commander | −1.4 / −14.2, −3.7 / −11.3, −5.0 / −12.3, +1.0 ±1.0 / −2.3 | Trostani is the engine. |
| A stricter Bracket 4 mulligan (a play by turn 2) | +0.1 ±0.4 / −0.4 ±0.6 | Neutral: the bot's default keep is already fine. |
| Cathars' Crusade, Avenger, Triumph, Intangible Virtue alone | −0.5 to −0.9 | Slow or dependent on a board the bots rarely keep. |

**Reference, not a candidate: the site's Corrupted Miku** (Shalai, 15 Game Changers): **31.0% ±0.7** against Bracket 4 (+11.4 ±0.9 over the box) and 43.7% against precons. But 80 cards differ from the precon, and buying the missing 73 costs about €2,300. If you own it, bring it.

## 5. If you can buy cards today
BUYLIST

## 6. Skeptic's section
**Bots aren't people.**
- **The opponents.** The Bracket 4 field is eight engine decks: Azusa, Corrupted Etrata, Edgar, Etrata B4, Ghalta, Krenko, Talrand, Ur-Dragon. They don't counter like people, rarely hold interaction, and target by a threat model, not by table talk. Real Bracket 4 tables run free counters and more efficient combos. Expect the absolute win rates to be optimistic and the *differences* to be the useful part.
- **Our own interaction.** The bots undervalue held interaction on their own side too: Swords, Path, Rootborn Defenses and Grand Crescendo measure as worth about a land. That's a bot artifact, so the tiers keep them all. Generous Gift and Beast Within made the list because even the bot gets value from an instant that hits anything.
- **Lands.** The cut sweep shows the bots like lands: replacing most precon cards with a basic is neutral or better. Tiers 10 and 15 run 37 lands (3 basics added). A person who mulligans well might prefer 35–36 lands plus a cheap spell (NEXT.md item 6). If you dislike 37 lands, the first basics to swap back are the tier-10 Plains for Angelic Chorus and Forest for Ancient Cornucopia; both measured close to a land.
- **The combo.** Heliod + Ballista and Spike Feeder + Thune + Aetherflux are real wins that the bots assemble rarely. A person who tutors, sequences and protects them does better than the bot. They're left out of the tiers because the measured lists beat them, not because they're bad. Tell the table if you play them; Bracket 4 allows them.

**Engine simplifications** (each card's `note`):
- Scurry Oak's infinite loop stops at 60 Squirrels a turn.
- Storm Herd is held above 150 life (the engine can't play out thousands of tokens).
- Aetherflux shoots only when the shot kills and leaves 15+ life, or leaves 40+.
- Populate, demonstrate and Silverquill Lecturer have notes in `cards-miku-precon.js`.
- The brain (`miku/game/decks-miku-brain.js`) plays the combo lines a person would. Its effect on the box list, paired: +2.9 on precons and about +0.1 on Bracket 4 (p1 vs p0: +0.9 ±0.6 / −0.3 ±0.3; the Aetherflux rule: +2.0 ±0.4 / +0.4 ±0.2). On the 80€ list it's +1.8 / +0.6, because that list has the combo pieces.

**Statistics.**
- ± is one standard error. Paired differences use the same seeds, so they're tighter than the win rates' own ±.
- Tiers were chosen from 2,016-game searches and confirmed at 5,040. Tier 5 regressed from +2.5 to +1.3, the selection effect the prompt warned about. Tiers 10 and 15 held (+4.6 → +3.1, +4.8 → +3.4).
- Treat any difference under about 1 point as noise.

**Bracket and legality.**
- Bracket 4 has no deckbuilding limits beyond the Commander banned list (Wizards' update of 21 October 2025; `../sources/trostani-bracket4.md`).
- None of the three tier lists contains a Game Changer, so they would also fit Bracket 3.
- Every card is in green-white identity and Commander-legal, checked against Scryfall's bulk data of 2026-10-07 (`scryfall/gw-index.json`).
- Noble Hierarch was dropped from the research list: Bant identity.
- Vorinclex is no longer a Game Changer (removed 21 October 2025).

## 7. How the work went
- **Research:** the site's guide and both upgrade plans, plus a source file of about 27 sources on Trostani at Bracket 4 (`../sources/trostani-bracket4.md`).
- **Measurement:** baselines, then the 27 plan singles, the 61-card cut sweep, commanders, packages and tiers, and 5,040-game confirmations.
- **Engine work** (all sim-only, the site is untouched):
  - a Miku bot brain;
  - Scurry Oak, with tests: `test-miku.js` 97 checks, all suites green;
  - a `COMMANDER` switch for the bench;
  - Miku telemetry: life gained, tokens, populates, combo assembly, who killed the hero.
- **Lost time:**
  - about an hour of queued runs that never started (a `pgrep` self-match, DECISIONS 22);
  - two re-bases after brain fixes (DECISIONS 25–26);
  - the other session sharing this folder switched branches for 3 minutes; no run was affected (DECISIONS 21).
