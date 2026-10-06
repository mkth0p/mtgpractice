# Etrata, Deadly Fugitive as a Bracket 4 theft-aggro deck: report

_Draft in progress (2026-10-06). The numbers sections are filled in from `EXPERIMENTS.md` once the finalist is confirmed with 5,040 games; everything below the research summary is being written as the benches finish._

## What was asked, and the short answer
The goal was an Etrata deck whose identity is cheap Assassins that connect early, each hit stealing a card through Etrata's cloak, with the stolen cards becoming more attackers, built and piloted the way a high Bracket 4 deck is; targets of at least 50% against three Bracket 2 precons and an average winning round below 8.4, with Etrata clearly mattering.

The research (official bracket definitions, Bracket 4 deckbuilding and piloting guides, 30 public Etrata lists, the two Bracket 4 Etrata primers, about 80 Reddit threads) and about 120,000 bot games say:
- **Bracket 4 means "lethal, consistent, and fast"**: fast mana, tutors, free interaction, draw engines, and a compact win with redundant routes, in games expected to last at least four turns. Combat still decides most casual games (55% of all Commander games end in combat, 6% in combo), but every Bracket 4 Etrata list ends with a non-combat line (altar + Vein Ripper, Thassa's Oracle, Bolas's Citadel), and the pilots' honest placement for *aggro* Etrata is "high Bracket 3 at best".
- **Real pilots play the cloak snowball**, not Assassin beatdown: cheap evasive Assassins, Etrata on turn 3 attacking at once, then copies of Etrata and a type-changer so every stolen 2/2 cloaks again, closed by the swarm, by decking the player you hit, or by altar + Vein Ripper. Ramses, Assassin Lord is "a bonus".
- **In the bot games, Ramses is the deck.** With him on the battlefield the deck wins about half its games whatever else it holds (Ramses alone 51%, with Bloodletter and a halver 51%); without him 10–19%. He lands in about half the games. The deck's win rate is, to a first approximation, 0.52 × P(Ramses lands) + 0.19 × P(he doesn't), so the levers are tutor density and card flow, protection and recursion for him, and surviving the precons' wraths (56% of losses against precons had a wipe resolve against the deck; Etrata herself leaves the battlefield 1.3 times a game, mostly to removal on opponents' turns).
- **No combat-only build reached 50% against the precon bots.** The best measured lists sit at 35–36% (2,016 games each, ±1.1), against 68% for the current drain-combo list. Each piloting rule or package from the research adds about a point; the structural ceiling comes from a deck of 1/1s and 2/2s against three opponents' wraths and blockers. The honest result is reported below with what was tried.

## The recommended list and the alternatives
_To be filled from the confirmation runs._

## How to pilot it (the rules the research and the bot games agree on)
1. **Mulligan is the default.** Keep a hand that does something by turn 3: two or more lands with blue and black, a 1–2 mana evasive Assassin (Changeling Outcast is the best one-drop), and Etrata castable on turn 3 with an Assassin ready to hit that turn; or fast mana plus a real threat; or a turn 1–2 engine (Rhystic Study, Mystic Remora) with the lands for it. Interaction alone, or draw without development, is not a keep. (Bot games: +1.3 against the Bracket 4 field.)
2. **Etrata comes down when an Assassin connects that turn**, because her trigger works the turn she's cast and she is kill-on-sight; Greaves or Boots on her as soon as you can, Fading Hope or Snapback to save her (she returns to hand without tax). (Bot games: +1.0 against Bracket 4.)
3. **Tutor for Ramses first**, then protection for him; copies of Etrata and the type-changer next. Ramses right before combat, with a counter up if you can. (Bot games: tutoring anything else first costs 8–11 points.)
4. **Save the last counter for the wrath**, and for removal aimed at Ramses or Etrata; let single creatures and commanders resolve. (Bot games: +1.0.)
5. **Teferi's Veil makes the army phase out through everyone else's turn**: attack with everything that gets through, and the wraths miss. Eldrazi Monument does the same job against destroy effects. (Bot games: +1.0.)
6. **Pick one player and kill them.** With Ramses out, one death is the game; the mark is whoever the board kills soonest, every attacker that gets through goes at them, and the rest hit whoever is open (each Assassin hit is still a card). Without Ramses, spread the hits (a player who leaves takes their stolen cards with them).
7. **Flip rarely**: a stolen card is turned up only when it beats the 2/2 it is (a big creature, a free artifact or enchantment), after your own spells, never before combat; Training Grounds makes the flips affordable. Stolen instants and sorceries are cast through Etrata's exile clause at the moment they matter.
8. **Don't be the first to go for it in a pod with counters**; present the kill when it's real (the attack commits everything only when the model says the player dies), and otherwise send only what connects.

## What didn't work, with numbers
_To be filled from `EXPERIMENTS.md`._

## Sources
`../sources/bracket4-deckbuilding.md`, `../sources/bracket4-piloting-and-aggro.md`, `../sources/etrata-strategy.md`, `../sources/public-lists.md`, `../sources/heist-research.md` (exact Oracle text, prices and URLs for every new card), and the earlier `../sources/*.md`. Every bench is in `EXPERIMENTS.md` with its raw line in `xp/xp.log`; every choice is in `DECISIONS.md`; the design reasoning is in `STRATEGY.md`.
