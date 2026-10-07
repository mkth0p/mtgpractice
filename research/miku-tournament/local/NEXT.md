# Next steps (Miku tournament research)
What I'd do with more time, roughly by expected value.

1. **Greedy hill-climb inside tier 15.** The tiers are packages built from the cut sweep and the plan singles, not a full search. Try each of the 15 adds against each remaining weak precon card (Cleric Class, Cultivate, Grand Crescendo held as protection aside). Confirm with 5,040 games.
2. **A buy-list tier.** The research singles (`r-*` vs p4, all for Song of the Worldsoul, with `r-Forest` as the land control) say which cards worth buying beat a land in that slot. The best two or three should go into tier 15 in place of its weakest adds (the basics), then be confirmed. That's the lever the Corrupted Miku reference points to: fast mana, tutors and a combo that can be tutored for (it wins 31.0% against the Bracket 4 field, against 20.2% for the precon).
3. **The combo with tutors.** Heliod + Walking Ballista + Spike Feeder measured +0.1 / −0.8 without tutors (pk-HBF, v15a). With Chord of Calling / Eladamri's Call / Worldly Tutor it may pay. The brain already fetches the missing piece (`choose` in `decks-miku-brain.js`).
4. **Engine bug:** Kenrith's Transformation (an opposing precon card) throws `Cannot set property keywords of #<Object> which has only a getter` in `MK.derive` (`engine.js:171`) when it hits some Corrupted Miku creatures. 3 games in 5,040 (COR280-b2, seeds 1445, 3582, 4208).
5. **Bot artifacts to fix before trusting the cut sweep on interaction:**
   - the bots fire Swords/Path at the first threat instead of holding them for a combo piece;
   - Grand Crescendo and Rootborn Defenses are cast as tricks, not held for wipes.
   
   A "hold one removal for a combo piece" rule in the Miku brain would make those rows meaningful.
6. **Land count.** Tier 10 and tier 15 run 37 lands (3 basics added), because the cut sweep showed a land beating many precon cards in bot games. A person may prefer 35 lands plus two cheap spells. Test 35 / 36 / 37 directly.
7. **Shalai as commander** lost 14 points against precons and 1.4 against Bracket 4. Measure it again once the brain knows Shalai's {4}{G}{G} counters ability is a mana sink worth using every turn.
