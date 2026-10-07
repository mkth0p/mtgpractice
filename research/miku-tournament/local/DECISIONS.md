# Decisions (Miku tournament research)
Choices made while working unattended, with the reason for each. Newest at the bottom. Started 2026-10-07 13:58.

## The prompt's open slots
1. **The event is Bracket 4.** The prompt's bracket slot was left as a template; the line after it says "backet 4 deck". So: Bracket 4 (Optimized) rules, which since the 21 October 2025 update have no deckbuilding limits beyond the Commander banned list (Game Changers, two-card combos and tutors all allowed; see `../sources/trostani-bracket4.md` §1). The field that matches the event is the engine's Bracket 4 bots (`random4`); the precon field (`random2`) is the "not negative" check.
2. **Time budget: 6 hours.** The "[N] hours" slot was empty. I assume 6 hours (13:58 → about 20:00), so the search stops at about 18:58 and the rest goes to the write-up. Compute isn't the limit: 2,016 games per field take about 25 seconds on this Mac's 18 cores.
3. **Cards available tonight: the precon plus the 80€ plan's 22 cards.** The swap-source slot was empty. `miku/game/cards-miku-precon.js` describes the 80€ plan as "the one bought for about 80€", so I take those 22 cards (Heliod, Walking Ballista, Spike Feeder, Avenger of Zendikar, True Conviction, Cathars' Crusade...) as owned. The tier lists use only precon + 80€ cards. The full plan's extra cards (Craterhoof, Jazal, Mirror Entity, Crashing Drawbridge) and cards from my own research are reported separately as "if you can buy it today", with their Cardmarket price from Scryfall's bulk data. None of them is in a tier list unless it's in that pool.
4. **The swap cap counts basics.** "At most 15 cards different from the precon", basics included, is counted as the multiset difference: the cards in a list that the precon doesn't have, counted with multiplicity.

## Setup
5. **Branch.** `miku-tournament`, made from the local `etrata-heist-aggro-research`, which is one commit ahead of the pushed branch: the Heist cut-sweep scripts and raw rows, no engine change. So the new branch contains everything on the pushed branch, plus that one commit.
6. **Bench standard.** As in the Etrata research: PROCS=18, N=112 (2,016 games per field) to search, N=280 (5,040) to confirm and for the honest numbers. `xp/env.sh` sets HERO=miku-precon, DECK_CONST=MIKU_PRECON_DECK, HERO_NAME=Miku and XPLOG. Pairs only between runs with the same PROCS and N.
7. **Scryfall.** The blue-black index was useless for this deck. I copied the scripts to `local/scryfall/`, changed the identity filter to green-white, and added Cardmarket's EUR trend price (Scryfall `prices.eur`), because the user buys on Cardmarket. Bulk files are `default_cards` and `rulings` of 2026-10-07 09:00 UTC. `gw-index.json` and the `.gz` files are kept out of git.

## Engine and brain
8. **`MK.DECK_BRAINS.miku` didn't exist.** The prompt names it, but the Miku decks played only on the generic bot (`ai.js`) and the cards' own hints. I added `miku/game/decks-miku-brain.js`. It registers one brain for `miku-precon`, `miku-budget` and `miku`, and it is sim only: it's not in `app.js` GAME_FILES or `sw.js`, so the Play tab is unchanged.
9. **What the brain does, and why.** In the first runs, the 80€ list won only 42% of the Bracket 4 games where Heliod and Walking Ballista were both out. Traces showed four misplays:
   - Ballista cast for X=1 on turn 3 and sent into a blocker.
   - Ballista cast with X so high that no {1}{W} was left for Heliod's lifelink, then pinged away or killed by Skullclamp.
   - The lifelink mana spent on another creature first.
   - Finale of Devastation fetching Ballista onto the battlefield at X=0, where it dies. The site's guide warns about exactly this.
   
   Also, the engine's Spike Feeder helper loops only with Heliod out, never with Archangel of Thune. The brain fixes all of these, the way the pilot sheet tells a person to play. Aetherflux Reservoir shoots players only.
   
   Measured on the 80€ list: +1.8 ±0.8 against precons, +0.6 ±0.5 against Bracket 4 (experiment 9). On the precon, which has none of those cards: +0.9 ±0.6 / −0.3 ±0.3 (experiment 10). With the brain, Heliod + Ballista wins 38 of the 42 games where it assembles against precons, and 10 of 13 against Bracket 4.
10. **`p1` is the base for everything after experiment 10.** The brain was frozen before the sweeps started at 14:20, so the sweeps and `p1` ran on the same code.
11. **Scurry Oak** is the one research candidate the engine lacked. It's defined in the new sim-only file `miku/game/cards-miku-tourney.js` with its Oracle text. Its Squirrel loop (with Trostani plus Archangel of Thune, Heliod or Cleric Class level 2) stops at 60 Squirrels a turn, standing in for the number a player would name. Tests are in `tools/sim/test-miku.js` (97 checks, was 80).
12. **Telemetry.** Added to `tools/sim/bench/tele.js` and `telesum.js`, generic for any hero:
    - life gained, tokens made, populates and the highest life total;
    - the round a lifegain combo first assembled, with which pieces;
    - what dealt the hero's last life loss and from which deck;
    - which deck won the games the hero lost.
    
    A Walking Ballista on the battlefield with no counters doesn't count as assembled. The Etrata fields (steals, flips) still print and read zero.

## Card pool checks (14:25)
13. **Color identity and legality** checked against `gw-index.json`, which holds only Commander-legal cards inside green-white identity. Every card of the precon and of both plans passes. **Noble Hierarch is out**: it's Bant (G/W/U identity, its mana ability makes {U}), and the engine wouldn't have caught it. I took it off the research list before that batch ran.
14. **Game Changers in the pool:** Worldly Tutor, Enlightened Tutor, Teferi's Protection and Smothering Tithe. All are legal at Bracket 4 without limit. The precon and both plans have none: Vorinclex left the list on 2025-10-21 (`../sources/trostani-bracket4.md` §1).

## The commander is open (user, 14:30)
15. **The user said any card of the deck can be the commander, preferably a Miku card.** The Secret Lair's Miku printings (`miku/kit.js` MIKU_PRINTS) that are legendary creatures are Trostani, Shalai, Voice of Plenty and Vorinclex, Voice of Hunger.
    - **Shalai has a green-white identity**: her {4}{G}{G} ability counts. So she can lead this exact 100 cards; Trostani moves into the 99 in Shalai's slot.
    - **Vorinclex is mono-green**: 59 of the precon's cards fall outside that identity, which breaks the 15-card cap many times over. Not considered.
    - Non-Miku legendaries in the precon, measured for reference: Lathiel, the Bounteous Dawn; Ghalta and Mavren; Rhys the Redeemed. Arasta is mono-green. The 80€ plan's Heliod and Adeline are mono-white.
16. **A commander change costs 0 swaps.** The 100 cards are identical; only which one sits in the command zone changes. The cap counts cards different from the precon, so this is "piloting", and it's allowed in tier 0.
17. **How it's measured.** `wrap.js` has a new `COMMANDER="Card Name"` switch. It puts the old commander into the new one's slot in the list, so the library order is unchanged and runs pair with `p1`. Script: `xp/commanders.sh`.
18. **Trostani stays the commander** (experiments 12–15). Shalai, the only other Miku option, costs 1.4 ±1.1 points against Bracket 4 and 14 against precons. Without Trostani's lifegain on each creature, the precon's whole lifegain-matters half goes quiet. Ghalta and Mavren's +1.0 ±1.0 is noise, and he isn't a Miku card. PILOT.md mentions Shalai as the deck's best protection piece instead.
19. **A brain issue found by the cut sweep, fixed only after it finishes.** Aetherflux Reservoir → Forest measures +1.3 ±0.5 on B4. The brain shoots at any life above 50, which leaves the hero near 0 against fast decks. Changing the brain mid-sweep would break the pairing with p1, so the fix waits for the sweep, then everything that matters is re-benched on the new base.
20. **Corrupted Miku is measured as a reference, not a candidate** (user question, 16:20). It's the site's Bracket 4 Shalai deck (`MK.CORRUPTED_DECK`). Against Bracket 4 bots it wins 31.0% ±0.7, +11.4 ±0.9 over the precon on the same seeds. But 80 of its 100 cards differ from the precon, 73 of them are neither in the precon nor in the 80€ plan, and buying them costs about €2,300 at Scryfall's cheapest printings. That's far outside the 15-card cap and tonight's card pool. If the user does own it, it's the better deck for a Bracket 4 night. Its numbers show what the precon lacks at Bracket 4: fast mana, tutors and a tutorable combo (assembled in 24% of B4 games, won 70% of them).
21. **The shared folder (17:20).** The Etrata session shares this working folder. It checked out its own branch from 17:16:54 to 17:19:31 and committed four Etrata-only commits on `miku-tournament`. One of them also picked up my uncommitted mull2 edit to `decks-miku-brain.js`. That's harmless: it's my code. No Miku bench ran in that window, and `xp.log` is intact. I won't switch branches.
22. **About an hour of compute was lost to a waiter bug.** The queued research batch waited on `pgrep -f "cutsweep.sh|singles-plans.sh"`, which matches its own command line, so it never started. From now on, batches are chained directly (`a.sh; b.sh`) instead of waiting on pgrep.
23. **The Aetherflux rule is the default** (`MIKU_OFF=flux2` turns it off). **p2** is the base for the tiers.
24. **Tier construction** (search time is short, so packages first, not a full greedy climb):
    - Cuts come from the cut sweep: cards that measured ≥ +0.5 on B4 without hurting B2 when replaced by a land. Interaction is kept even when it measured near zero (bot artifact, see EXPERIMENTS).
    - Aetherflux Reservoir stays: it's the deck's non-combat kill with Thune + Spike Feeder, and the new rule made it +0.4.
    - Adds come from the plan singles that measured positive on B4, all owned. Variants try basics in their place, because the cut sweep says a land beats many precon cards.
25. **The Storm Herd guard (17:39).** t15a hung. With the combo package, life reached the thousands, and Storm Herd made that many Pegasus tokens, each a Trostani, Soul Warden and Thune trigger. A Miku deck now holds Storm Herd above 150 life: a person with that much life wins another way, and the engine can't play that out. It's a brain change, so the base is re-benched (**p3**), and the tiers and research singles run again against p3. The earlier tier numbers (vs p2) stay in EXPERIMENTS as superseded.
26. **The Storm Herd guard was inactive until 17:58.** Storm Herd is defined in `precon-isperia.js`, which loads after the brain file, so the load-time patch found no card. p3 was therefore identical to p2, and u15a hung again on the same seed. The guard is now applied on the brain's first use (`patchLate`), and the seed that hung finishes in 11 seconds. New base **p4**. Every tier candidate and research single runs again against p4 (`xp/run3.sh`: v* and r-* runs). The u15a rows are marked invalid in xp.log; the other u* rows are valid but superseded.
