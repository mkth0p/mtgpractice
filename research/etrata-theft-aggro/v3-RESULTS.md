# Corrupted Etrata v3: what the bot games measured
Written 2026-10-05. This covers the three upgrade rounds in PR #42 (https://github.com/mkth0p/mtgpractice/pull/42). They start from the ideas in `FINDINGS.md`. The current list is `../b4-shadow-market/decklist.txt`, and the v2 list is `decklist-v2.txt` next to it.

## Headline
| List | vs precons (3 Bracket 2 bots) | vs Bracket 4 (3 B4 bots) |
|---|---|---|
| v2 (Shadow Market) | 49.7% | 24.8% |
| after round 1 | 61.6% | 32.9% |
| after round 2 | 66.6% | 39.1% |
| after round 3 (v3, final) | **69.0%** | **43.3%** |

These are four-player games with a random first player: 2,400 games against precons and 1,000 against Bracket 4. A fair share for one seat is 25%.

## How it was measured
- **Paired seeds.** Each variant replays the same seeds as the baseline, with only the deck list changed, so a swapped card keeps its library position. The paired difference has about ±0.7 points of noise at 1,200 games, against ±1.4 for two independent runs.
- **Engine.** Runs used `tools/sim/run.js --decks corrupted-etrata,random2,random2,random2 --first random` (or `random4` for Bracket 4), with the list patched in memory.
- **Caveat: bots, not people.** The numbers measure how well the *bot* plays each card. Cards the bot plays badly look weak. The Wormfang Manta turn line is the clearest case: the bot rarely sets it up, so Scroll of Fate and Crystal Shard measure slightly negative (+1.3 to +2.0 when cut). I kept the line anyway because a person can play it.

## The three rounds
1. **Round 1** (+11.9 vs precons, +8.1 vs B4)
   - Cut: Mari, Etrata the Silencer, Brine Elemental, Vesuvan Shapeshifter and Dizzy Spell. These were the five weakest slots in the v2 cut-one-card sweep (+1.8 to +3.1 when cut).
   - Added: Enduring Tenacity, Starscape Cleric, Vampire of the Dire Moon, Hooded Blightfang and Silumgar Assassin. These were the best of 15 candidates.
2. **Round 2** (+6.8 vs precons, +7.8 vs B4)
   - Cut: Ramses, Gonti, Leyline of Transformation, Roshan and Infernal Grasp.
   - Added: Choked Estuary, Darkwater Catacombs, Tainted Isle, River of Tears (all already in the Etrata deck) and a 9th Swamp. The deck now has 36 lands.
   - Five lands beat every five-spell package I tried.
3. **Round 3** (+1.5 vs precons, +2.1 vs B4)
   - Cut: Praetor's Grasp, Fallen Shinobi and an Island.
   - Added: Phyrexian Arena, Aetherize and Mutavault.
   - Both cuts measured weak against both fields:
     - Praetor's Grasp: +1.5 / +2.5 when cut.
     - Fallen Shinobi: +1.6 / +1.1 when cut.

## The land question
In these bots' games, more lands kept winning:
- On the round-1 list, going from 31 to 36 lands gained +7.4, but 38 and 40 lands were no better than 36 (+7.0, +8.3).
- On the round-2 list, swapping three more weak spells (Fallen Shinobi, Praetor's Grasp, Dimir House Guard) for lands (39 lands) gained +2.8, against +0.6 for the best three spells I tried in those slots.

Most losses come late (rounds 11 to 15), when the deck runs out of mana for Guildmage activations and Etrata flips. I stopped at 36. More than that is unusual for a deck with 7 mana rocks, and the bots' land play may not reflect a person's. If your own games keep stalling on mana, two more lands are a measured option.

## Cards tested and not added
Each card was swapped in for one Island on the final-ish list; the number is points versus that Island. Nothing beat a land against precons:
- **Against precons**
  - Phyrexian Arena −0.2.
  - Exsanguinate, Thassa's Oracle, Go for the Throat, Mischievous Sneakling and Thrill-Kill Assassin about −0.8.
  - Zulaport Cutthroat, Preordain, Guildsworn Prowler, Feed the Swarm, Merchant Scroll, Gix and Arcane Denial −0.9 to −1.2.
  - Grim Monolith, Spellseeker, Midnight Reaper, Unstoppable Slasher, Mana Vault and Black Widow −1.3 to −1.6.
  - Lotus Petal −1.9, Mystical Tutor −2.0, Chrome Mox −2.3.
- **Against Bracket 4**
  - Aetherize +0.5, Pact of Negation +0.4, Phyrexian Arena +0.4, Royal Assassin +0.4, Mutavault +0.2, Snuff Out +0.2, Arcane Denial +0.1.
  - Force of Negation and Memory Lapse 0.0.
  - Go for the Throat −0.5, Feed the Swarm −0.8.
- **Earlier round-1 candidates** (vs v2, unpaired): Hired Poisoner, Midnight Assassin, Brotherhood Spy, Rooftop Bypass, Cryptic Coat, Vampire Nighthawk, Brotherhood Regalia, Willbender, Key to the City, Swiftfoot Boots and Poison the Cup all landed within noise of the baseline.
- **Bot tutoring change:** teaching the bot to tutor for the Manta line, and refreshing its "engine pieces worth a tutor" list, changed nothing (−0.4 and 0.0). I reverted both.

## v2 card weights (points lost when the card is cut, against precons)
- **Most valuable:**
  - Exquisite Blood −7.2, Bloodthirsty Conqueror −5.0, Demonic Tutor −3.7, Sanguine Bond −3.2, Vito −3.0.
  - Vampiric Tutor −2.8, Diabolic Intent −2.4, Scheming Symmetry −2.2.
  - Duskmantle Guildmage −1.8, Blight-Priest −1.8, Lim-Dûl's Vault −1.7.
- **Weakest:** Brine +3.1, Etrata the Silencer +2.6, Vesuvan +2.4, Mari +1.9, Dizzy Spell +1.8, Training Grounds / Roshan / Ramses +1.7, Leyline +1.5, Infernal Grasp +1.4, Gonti +1.3, Wormfang Manta +1.2.

## Engine change that came with it
A creature cast face down with morph or megamorph now turns face up only for its morph cost. A manifested or cloaked one still uses its mana cost. Before, a morph-cast Brine Elemental could also flip for {4}{U}{U}. Megamorph adds its +1/+1 counter. Games recorded before engine 7 replay with the old rule and the v2 list.

## Not priced
These seven cards show no price because the price lookups didn't go through during this session:
- Choked Estuary, Darkwater Catacombs, Tainted Isle and River of Tears, which are in the Etrata deck already.
- Phyrexian Arena, Aetherize and Mutavault.

Without them, the list totals about $1,099.
