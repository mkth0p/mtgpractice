# Shalai, faster: what to change and how to play it

2026-10-11. This builds on the Shalai 1,500 list (`../decklist-shalai-1500.txt`). The new list is [decklist-shalai-fast.txt](decklist-shalai-fast.txt). The web research behind the play advice is in [RESEARCH.md](RESEARCH.md), with 33 sources.

## The answer in one line

**Swap 6 cards for 6 tutors.** That takes the solo kill from round 7.9 to 7.1 on average, and kills by turn 6 go from 35% to 46%. Against Bracket 4 bots the win rate goes from 34.7% to 40.4%. The 6 new cards cost about 31 €, and the 6 cuts are worth about 66 €.

## Why tutors and not draw or mana

- **Slow games are short a combo piece, not mana.** In 1,000 solo games of the old list, the cards that separate fast games from slow ones are all tutors and combo pieces:
  - by turn 5, fast games had played Devoted Druid 27% of the time against 6% for slow games;
  - Recruiter of the Guard 13% against 1%;
  - Survival 13% against 3%;
  - Chord and Eladamri's Call about 10% against 0%.
- **Draw and fast mana measured flat or worse.** Earlier benches (mana study, addendum 3):
  - three draw engines: +0.4 ±0.5 points;
  - Mox Diamond, Grim Monolith and Gemstone Caverns: −1.9 points;
  - cutting lands for fast mana: −2.1 points.
- **Tutors do what draw spells can't.** A tutor is a copy of whichever combo piece is missing. The research calls this redundancy: the more ways a deck can find its combo, the stronger the combo.

## The swaps

| Cut | Add | Add price (€) |
|---|---|---|
| Destiny Spinner | Summoner's Pact | 2.90 |
| Allosaurus Shepherd | Archdruid's Charm | 4.42 |
| Archon of Emeria | Formidable Speaker | 10.78 |
| Aura Shards | Brightglass Gearhulk | 4.56 |
| Kutzil, Malamet Exemplar | Congregation at Dawn | 1.34 |
| Trostani, Selesnya's Voice | Idyllic Tutor | 6.53 |

- **Prices:** cheapest nonfoil printing, Cardmarket trend, from the Scryfall bulk dump of 2026-10-10. The cuts were worth 66.43 € on the same data (Allosaurus Shepherd alone is 45.51 €).
- **Game Changers:** Aura Shards is one and nothing added is, so the list drops one Game Changer.
- **Bracket check:** turn-4 solo kills go from 4.3% to 6.2%. That is still well short of the "turn 2-3 turbo" that would read as Bracket 5. WotC's Bracket 4 text asks for "lethal, consistent, and fast" decks with "at least four turns before you win or lose".

## Measured

Same seeds for every version. Bot games are paired by seed against the base list.

| Version | Win vs B4 bots | vs base | Solo kill by turn 4 / 6 / 8 | Mean solo kill round | Solo games at round 10+ |
|---|---|---|---|---|---|
| Shalai 1,500 (base) | 34.7% | | 4.3% / 34.8% / 62.9% | 7.94 | 29% |
| +2 tutors (Pact, Charm) | 36.6% | +1.9 ±0.7 | 4.8% / 37.8% / 68.0% | 7.68 | 23% |
| +4 tutors (+ Speaker, Gearhulk) | 39.9% | +5.2 ±0.9 | / 43.3% / | 7.26 | |
| **+6 tutors (the new list)** | **40.4%** | **+5.8 ±1.1** | **6.2% / 45.5% / 79.0%** | **7.11** | **14%** |
| +6 tutors, Gaea's Cradle and Silence for a Forest and Esper Sentinel | 41.0% | +0.6 ±0.8 over +6 | / 46.9% / | 7.14 | |
| +6 tutors, bot mulligans hands with no combo piece or tutor | 41.2% | +0.8 ±0.6 over +6 | / 47.1% / | 7.01 | |

- **Gaea's Cradle** costs 1,085 € and adds nothing measurable here.
- **The combo-first mulligan** is a small, borderline gain: about 1.3 standard errors, and keep-7 drops from 66% to 57%. It's in the play guide as a rule of thumb, not a law.
- **Not tested:**
  - The research's Rosie Cotton of South Lane + Scurry Oak package (with Basking Broodscale and Duskwatch Recruiter). Those cards aren't in the game engine yet.
  - Luxior. The research names it as a third Devoted Druid partner; I haven't checked that claim.
- **Melira doesn't combo with Devoted Druid.** Under Druid's ruling you can't pay the untap cost if the counter can't be placed. The game engine now follows that rule.

## How to play it at this level

Condensed from RESEARCH.md section 4 and checked against our own game data.

1. **Keep with a reason.** A keep needs 2 or more mana sources (at least 1 land) plus a combo piece or a tutor that finds one. Ship hands of only lands, interaction and value cards. Devoted Druid with a way to cast it on turn 2 is a premium keep. The first mulligan is free.
2. **Tutor in the end step of the player before you.** This applies to Worldly, Sylvan, Enlightened, Eladamri's, Chord, Archdruid's Charm and Congregation. You untap with all your mana for the combo, and the table sees it as late as possible. The top-of-library tutors (Worldly, Sylvan, Enlightened, Congregation) then arrive in your draw step.
3. **Summoner's Pact only on the combo turn,** or when {2}{G}{G} next upkeep is certain. A missed Pact payment loses the game.
4. **Protection first, pieces second.** Cast Grand Abolisher before the combo. Hold Veil of Summer for the counterspell, and Teferi's Protection or Flawless Maneuver for wraths and edicts. Shalai's hexproof doesn't stop counterspells, wraths or edicts.
5. **Don't spend your turns on interaction.** Slow games in the sim were holding unused interaction. Answer only real win attempts and must-answer hate pieces; spend every other turn's mana finding the combo.
6. **Count the table before you go.** Count open mana and cards in hand for all three opponents together. Don't jam into a blue player with mana up and cards in hand unless you hold Veil of Summer or have Grand Abolisher out.
7. **Bait, then go.** Make them answer the less important piece (Heliod, Thune) and win with the other line (Druid + Swift, Ballista).
8. **Pick your window.** With blue at the table, the first player to try usually loses. From a late seat, a turn later with protection beats racing.
9. **Kill with Ballista when you can.** It needs no combat, so opponents get no blocks, fogs or attack-step answers. Thune + Feeder still has to attack, and the bots' games show blockers buy turns.
10. **Stay the least scary player.** Don't overextend early, point at other players' threats, and keep your board looking modest until the turn you go.
