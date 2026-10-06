# Experiments (Etrata heist aggro research)
Every bench run, in order. Unless a line says otherwise: hero `etrata-heist-aggro`, PROCS=18 × 112 games = 2,016 games against three random Bracket 2 precons ("B2", `random2`) and 2,016 against three random Bracket 4 bots ("B4", `random4`). Paired differences use the same seeds (`tools/sim/bench/paired.js`). The raw one-line results, with the exact variant JSON, are in `xp/xp.log`.

| # | Run | List / change | B2 win | B4 win | Paired vs | Δ B2 | Δ B4 | Note |
|---|---|---|---|---|---|---|---|---|
| 1 | v3-b2 / v3-b4 | baseline: Corrupted Etrata v3 (`corrupted-etrata`, its own brain) | 68.0% ±1.0 | 41.7% ±1.4 (1,260 games: mirror seats dropped) | | | | avg win round 8.2 / 7.3; 99% of wins by the drain combo (telemetry) |
| 2 | eb4-b2 / eb4-b4 | reference: the site's Etrata B4 aggro list (`etrata-b4`, Etrata brain) | 25.4% ±1.0 | 14.7% ±1.0 (1,260) | | | | avg win round 9.4 / 8.7; 7.8 cards stolen a game vs B2; 77–83% of wins end on Ramses' "you win" |
| 3 | 300 games each vs B2, seed 5000 (`run.js`) | other Bracket 4 bot decks as heroes | Ghalta 59.7%, Ur-Dragon 53.7%, Edgar 47.7%, Talrand 46.3%, Krenko 40.3%, Azusa 28.7% | | | | | what this engine rewards: big bodies |
| 4 | h0 | heist deck = the etrata-b4 list + the new heist brain (mark one opponent, own attack) | 23.8% ±0.9 | 13.3% ±0.8 | (eb4, unpaired) | −1.6 | | the attack brain alone doesn't help this list |
| 5 | v1-power | h0 + 8 swaps: −Duskmantle Guildmage, Mindcrank, Mistwalker, Merciless Harlequin, Midnight Assassin, Lydia Frye, Adéwalé, Eagle Vision; +Bloodletter, Quietus Spike, Grievous Wound, Roaming Throne, Shredder, Genji Glove, Training Grounds, Satoru | 26.4% ±1.0 | 15.9% ±0.8 | h0 | +2.6 ±1.0 | +2.6 ±0.7 | |
| 6 | skA-halver | skeleton A: halvers + Ramses + Bloodletter + Grievous Wound + Quietus Spike, cheap Assassins, 33 lands (`lists/skel-A-halver.txt`) | 28.0% ±1.0 | 16.4% ±0.8 | h0 | +4.2 ±1.3 | +3.1 ±1.1 | |
| 7 | skB-cloak | skeleton B: cloak army (type-changers, Thieving Amalgam, Orochi, Forsaken Monument, Vela, Auton Soldier, 34 lands) (`lists/skel-B-cloak.txt`) | 28.3% ±1.0 | 14.9% ±0.8 | h0 | +4.5 ±1.4 | +1.6 ±1.0 | |
| 8 | ghalta-b2 (2,016, telemetry) | reference trace of a 56% deck | 56.3% | | | | | 145 combat damage a game; power 23 on board by round 8; its life stays high |
| 9 | skA2 | skA + brain: combat model with Bloodletter doubling, every halver, Grievous Wound; unblockable-for-a-kill plan; Bloodletter and Grievous Wound before combat | 29.7% ±1.0 | 17.2% ±0.8 | skA | +1.7 ±0.7 | +0.8 ±0.5 | kept |
| 10 | skA3 | skA2 + the brain flips stolen creatures first thing in main 1 and 2 | 28.0% | 16.5% | skA2 | −1.7 ±0.7 | −0.7 ±0.5 | flipping costs the mana the deck's own cards need; dropped |
| 11 | skA4 | skA2 + flips only after casting (combat flips of unblocked attackers kept) | 30.1% ±1.0 | 17.6% ±0.8 | skA2 | +0.3 ±0.2 | +0.3 ±0.2 | kept: the base for the sweeps |
| 12 | skE | skeleton E: kill kit (halvers + Bloodletter + Ramses) with 7 tutors and transmuters, brain tutors for the missing kit piece (98-card list by mistake) | 25.4% ±1.0 | 15.8% ±0.8 | skA4 | −4.7 ±1.4 | −1.7 ±1.2 | on-hit damage doubles (8 → 18 a game) but the board suffers |
| 13 | skA4-nocmd | skA4 with NO_COMMANDER=1 | 16.4% ±0.8 | 11.5% ±0.7 | skA4 | −13.7 ±1.2 | −6.1 ±1.0 | Etrata matters a lot in this archetype |
| 14 | sw-* (first sweep, discarded) | skA swaps, Mothdust Changeling → X, against the skA4 run | | | skA4 | −4 to −6 for every X | | **Confounded**: the kill-kit tutoring added for skE was on for every list, so the base and the variants ran different brains. I stopped the sweep, made the kit tutoring opt-in (`H.kitTutor`), and dropped those rows from `xp.log`. Lesson: rerun the base after every brain change. |
| 15 | skA5 | skA4's list and settings on the current code (kit tutoring off, new cards defined but not in the list) | 30.1% ±1.0 | 17.6% ±0.8 | skA4 | +0.0 ±0.0 | +0.0 ±0.0 | identical game for game: the clean base for sweep 2 |
| 16 | sw-* (sweep 2) | 14 swaps into skA5, Mothdust Changeling → X (table below); stopped early when single swaps proved to be ±1 | | | skA5 | | | see the sweep 2 table |
| 17 | skA6 | skA5 + brain: Dolmen Gate / Haunted One attack logic, copy targets (Spark Double copies Etrata when an evasive Assassin is out), research switches | 29.9% ±1.0 | 17.4% ±0.8 | skA5 | −0.2 ±0.2 | −0.2 ±0.1 | new base |
| 18 | pk-* (packages) | package swaps into skA6 (table below) | | | skA6 | | | best: evasion package +1.7 / +1.1 |
| 19 | ab-* (brain ablations) | skA6 with one part of the heist brain off (HEIST_OFF) | | | skA6 | | | the tutor picks are worth +10.9 / +4.5; the attack +3.1 / +1.6 |

### Sweep 2: Mothdust Changeling → X in skA5 (2,016 games per field)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| sw-EldraziMonument | Mothdust Changeling → Eldrazi Monument | 32% | +1.9 ±0.5 | 18.5% | +0.9 ±0.4 | 2.8 |
| sw-Levitation | Mothdust Changeling → Levitation | 31.1% | +1 ±0.5 | 17.4% | -0.1 ±0.3 | 0.9 |
| sw-ArchetypeofImagina | Mothdust Changeling → Archetype of Imagination | 31.1% | +1 ±0.5 | 17.4% | -0.1 ±0.3 | 0.9 |
| sw-ThievingAmalgam | Mothdust Changeling → Thieving Amalgam | 30.9% | +0.8 ±0.5 | 17.9% | +0.1 ±0.4 | 0.9 |
| sw-ReversethePolarity | Mothdust Changeling → Reverse the Polarity | 31.2% | +1.1 ±0.5 | 17.3% | -0.3 ±0.3 | 0.8 |
| sw-VelatheNightClad | Mothdust Changeling → Vela the Night-Clad | 30.6% | +0.5 ±0.5 | 17.6% | +0 ±0.3 | 0.5 |
| sw-Swamp | Mothdust Changeling → Swamp | 30.6% | +0.5 ±0.6 | 17.2% | -0.4 ±0.4 | 0.1 |
| sw-ForsakenMonument | Mothdust Changeling → Forsaken Monument | 30.5% | +0.4 ±0.5 | 17.2% | -0.4 ±0.3 | 0.0 |
| sw-Island | Mothdust Changeling → Island | 30.2% | +0.1 ±0.6 | 17.3% | -0.2 ±0.4 | -0.1 |
| sw-HauntedOne | Mothdust Changeling → Haunted One | 29.9% | -0.1 ±0.5 | 17.4% | -0.1 ±0.3 | -0.2 |
| sw-LeylineAxe | Mothdust Changeling → Leyline Axe | 30.1% | +0 ±0.5 | 17.3% | -0.3 ±0.3 | -0.3 |
| sw-GenjiGlove | Mothdust Changeling → Genji Glove | 30% | -0.1 ±0.5 | 16.9% | -0.7 ±0.3 | -0.8 |
| sw-DolmenGate | Mothdust Changeling → Dolmen Gate | 29.3% | -0.8 ±0.4 | 17.4% | -0.1 ±0.3 | -0.9 |
| sw-SwordCoastSailor | Mothdust Changeling → Sword Coast Sailor | 29.2% | -0.9 ±0.4 | 17% | -0.5 ±0.3 | -1.4 |

### Packages in skA6
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk-evasion | Mothdust Changeling → Eldrazi Monument; Hookblade Veteran → Archetype of Imagination; Desmond Miles → Levitation | 31.6% | +1.7 ±0.8 | 18.5% | +1.1 ±0.6 | 2.8 |
| pk-haunt | Mothdust Changeling → Haunted One | 30.1% | +0.2 ±0.5 | 17.3% | -0.1 ±0.3 | 0.1 |
| pk-etratas | Mothdust Changeling → Auton Soldier | 30.1% | +0.2 ±0.5 | 17.2% | -0.2 ±0.3 | 0.0 |
| pk-gate | Mothdust Changeling → Dolmen Gate | 29.6% | -0.2 ±0.4 | 17.1% | -0.2 ±0.4 | -0.4 |
| pk-hauntgate | Mothdust Changeling → Haunted One; Hookblade Veteran → Dolmen Gate; Desmond Miles → Arcane Adaptation | 28.1% | -1.8 ±0.8 | 17.2% | -0.2 ±0.6 | -2.0 |
| pk-turns | Mothdust Changeling → Genji Glove; Hookblade Veteran → Time Warp; Desmond Miles → Temporal Manipulation; Basim Ibn Ishaq → Notorious Throng | 28% | -1.8 ±0.8 | 16.4% | -0.9 ±0.6 | -2.7 |
| pk-skC |  | 27% | -2.9 ±1.4 | 15.8% | -1.5 ±1.1 | -4.4 |
| pk-kit |  | 23.7% | -6.2 ±0.8 | 15.1% | -2.3 ±0.6 | -8.5 |

### Brain ablations on skA6 (positive = better with that part off)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| ab-choose | HEIST_OFF | 30.8% | +0.9 ±0.4 | 18.3% | +0.9 ±0.3 | 1.8 |
| ab-mulligan | HEIST_OFF | 30.6% | +0.7 ±0.8 | 17.5% | +0.1 ±0.6 | 0.8 |
| ab-plan | HEIST_OFF | 29.8% | -0.1 ±0.5 | 18% | +0.6 ±0.5 | 0.5 |
| ab-flips | HEIST_OFF | 29.5% | -0.4 ±0.2 | 17.2% | -0.2 ±0.3 | -0.6 |
| ab-attack | HEIST_OFF | 26.8% | -3.1 ±1.1 | 15.7% | -1.6 ±1 | -4.7 |
| ab-tutor | HEIST_OFF | 18.9% | -10.9 ±0.8 | 12.8% | -4.5 ±0.6 | -15.4 |


### Tutor policies and Ramses support (skA7 = skA6 with Spark Double copying Ramses first; identical to skA6 within ±0.1)
Win rate by when Ramses first entered (skA7, 2,016 B2 games, telemetry `skA7t-b2`): **50% of the 990 games where Ramses came out, 10% of the 1,026 where he didn't**; by round 5: 52% of 285. In Ramses games the deck lost 493: Ramses was removed in 231 of them (213 to the graveyard), and the hero died in every one. Tutor log (`tpm2-b2`, 300 games with four extra tutors): 510 searches found Ramses 136 times and Bloodletter 112 times; Ramses still entered in only 51% of games, mostly in rounds 5 to 9.

| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| tp-doublers |  | 29.2% | -0.7 ±0.3 | 17.7% | +0.2 ±0.2 | -0.5 |
| tp-engines |  | 29.2% | -0.7 ±0.4 | 17.6% | +0.1 ±0.2 | -0.6 |
| tp-ramsesonly |  | 29.2% | -0.7 ±0.3 | 17.3% | -0.2 ±0.2 | -0.9 |
| tp-protect |  | 29% | -0.9 ±0.3 | 17.4% | -0.1 ±0.2 | -1.0 |
| tp-moretutors | Mothdust Changeling → Grim Tutor; Hookblade Veteran → Diabolic Intent; Desmond Miles → Dimir House Guard; Basim Ibn Ishaq → Beseech the Mirror | 28.7% | -1.2 ±0.9 | 17.7% | +0.1 ±0.7 | -1.1 |
| tp-interceptor |  | 22% | -7.9 ±0.7 | 13.9% | -3.6 ±0.5 | -11.5 |

| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| rm-polarity-monument | Mothdust Changeling → Reverse the Polarity; Hookblade Veteran → Eldrazi Monument | 32.8% | +2.9 ±0.7 | 17.9% | +0.3 ±0.4 | 3.2 |
| rm-noVault | Mana Vault → Island | 30.7% | +0.8 ±0.6 | 17.8% | +0.2 ±0.4 | 1.0 |
| rm-dhg | Mothdust Changeling → Dimir House Guard | 30.3% | +0.3 ±0.5 | 17.8% | +0.2 ±0.4 | 0.5 |
| rm-copies | Mothdust Changeling → Auton Soldier; Hookblade Veteran → Sakashima the Impostor | 29.9% | +0 ±0.6 | 17.9% | +0.3 ±0.4 | 0.3 |
| rm-wingedboots | Mothdust Changeling → Winged Boots | 29.6% | -0.3 ±0.5 | 17% | -0.5 ±0.3 | -0.8 |

| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| ra-best4 | Mothdust Changeling → Reverse the Polarity; Hookblade Veteran → Eldrazi Monument; Desmond Miles → Thieving Amalgam; Mana Vault → Island | 33.5% | +3.6 ±0.9 | 18.1% | +0.6 ±0.7 | 4.2 |
| ra-pyre | Mothdust Changeling → Pyre of Heroes | 31.7% | +1.8 ±0.5 | 18.1% | +0.5 ±0.4 | 2.3 |
| ra-all3 | Mothdust Changeling → Demonic Consultation; Hookblade Veteran → Fleshwrither; Desmond Miles → Pyre of Heroes | 30.7% | +0.8 ±0.8 | 18.7% | +1.2 ±0.6 | 2.0 |
| ra-consult | Mothdust Changeling → Demonic Consultation | 30.5% | +0.6 ±0.6 | 18.4% | +0.8 ±0.5 | 1.4 |
| ra-flesh | Mothdust Changeling → Fleshwrither | 30.5% | +0.5 ±0.5 | 17.6% | +0.1 ±0.3 | 0.6 |

Tutor orders (HEIST_TUTOR), each paired against skA7: `tp-ramsesonly` = Ramses only; `tp-engines` = Ramses, Interceptor, Roshan, Achilles, Kindred Discovery, Ezio, Black Widow, Rhystic Study, Leyline; `tp-protect` = Ramses, Swiftfoot Boots, Lightning Greaves, Interceptor, Roshan, Achilles, Kindred Discovery; `tp-interceptor` = Interceptor before Ramses (then Roshan, Achilles, Bloodletter, Quietus Spike); `tp-doublers` = Ramses, Roaming Throne, Spark Double, Interceptor, Achilles, Roshan, Bloodletter. **Ramses first is what matters**: putting Interceptor first costs 7.9 points.

| # | Run | List / change | B2 win | B4 win | Paired vs | Δ B2 | Δ B4 | Note |
|---|---|---|---|---|---|---|---|---|
| 20 | skA8 | skA7 code with the optional `castHold` hook (off) | 29.9% | 17.5% | skA7 | +0.0 ±0.0 | +0.0 ±0.0 | identical |
| 21 | hold-ramses | skA8 with HEIST_ON=holdRamses: Ramses stays in hand until he makes this turn's attack a kill | 28.7% ±1.0 | 16.7% ±0.8 | skA8 | −1.2 ±0.7 | −0.8 ±0.5 | his +1/+1 and pressure are worth more than hiding him; dropped |
| 22 | skA2-0 | skeleton A2 = A with Mothdust Changeling → Reverse the Polarity, Hookblade Veteran → Eldrazi Monument, Desmond Miles → Thieving Amalgam, Mana Vault → Pyre of Heroes (`lists/skel-A2.txt`) | 34.4% ±1.1 | 18.5% ±0.9 | skA8 | +4.5 ±0.9 | +1.0 ±0.7 | avg win round 9.2 / 8.2; 69% of B2 wins end on Ramses |
| 23 | hy-vamp | A2 with the vampire loop: Hullcarver, Assassin Initiate, Poison-Blade Mentor, Aven Heartstabber → Exquisite Blood, Sanguine Bond, Bloodthirsty Conqueror, Vito; tutors finish the loop when half is out | 38.2% ±1.1 | 19.2% ±0.9 | skA2-0 | +3.9 ±0.9 | +0.7 ±0.7 | drain is the last kill in 28% of B2 wins |
| 24 | skA2-nocmd | A2 with NO_COMMANDER=1 | 22.9% ±0.9 | 14.3% ±0.8 | skA2-0 | −11.5 ±1.3 | −4.2 ±1.1 | Etrata's worth in A2 |

### Cut sweep on A2 (each card replaced by a basic land; positive = the deck is better without it; 2,016 games per field, paired against skA2-0; complete, 65 cards)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| cutA2-GofortheThroat | Go for the Throat → Swamp | 36% | +1.6 ±1 | 20.8% | +2.3 ±0.9 | 3.9 |
| cutA2-AvenHeartstabber | Aven Heartstabber → Swamp | 36.2% | +1.8 ±1 | 20.1% | +1.6 ±0.9 | 3.4 |
| cutA2-GixYawgmothPraetor | Gix, Yawgmoth Praetor → Swamp | 35.4% | +1 ±1.1 | 20.6% | +2.1 ±0.9 | 3.1 |
| cutA2-Skullclamp | Skullclamp → Island | 35.3% | +0.9 ±1 | 20.6% | +2.1 ±0.8 | 3.0 |
| cutA2-FadingHope | Fading Hope → Island | 35.5% | +1.1 ±1 | 20.2% | +1.7 ±0.9 | 2.8 |
| cutA2-RooftopBypass | Rooftop Bypass → Swamp | 35.3% | +0.9 ±1 | 20.2% | +1.7 ±0.9 | 2.6 |
| cutA2-Brainstorm | Brainstorm → Island | 35.1% | +0.7 ±1 | 20.4% | +1.9 ±0.9 | 2.6 |
| cutA2-MaskwoodNexus | Maskwood Nexus → Island | 34.9% | +0.5 ±1 | 20.4% | +1.9 ±0.9 | 2.4 |
| cutA2-DarkRitual | Dark Ritual → Swamp | 34.5% | +0.1 ±1 | 20.4% | +1.9 ±0.9 | 2.0 |
| cutA2-ThievingAmalgam | Thieving Amalgam → Swamp | 34.1% | -0.2 ±1 | 20.7% | +2.2 ±0.9 | 2.0 |
| cutA2-Preordain | Preordain → Island | 34.5% | +0.1 ±1 | 20.1% | +1.6 ±0.9 | 1.7 |
| cutA2-TrainingGrounds | Training Grounds → Island | 34.9% | +0.5 ±1 | 19.7% | +1.2 ±0.8 | 1.7 |
| cutA2-HiredPoisoner | Hired Poisoner → Swamp | 35.6% | +1.2 ±0.6 | 18.9% | +0.4 ±0.5 | 1.6 |
| cutA2-TetsukoUmezawaFugi | Tetsuko Umezawa, Fugitive → Island | 35.2% | +0.8 ±0.5 | 19.3% | +0.8 ±0.4 | 1.6 |
| cutA2-RenoandRude | Reno and Rude → Swamp | 35.5% | +1.1 ±0.6 | 19% | +0.5 ±0.5 | 1.6 |
| cutA2-PoisonBladeMentor | Poison-Blade Mentor → Swamp | 34.9% | +0.5 ±0.5 | 19.6% | +1.1 ±0.4 | 1.6 |
| cutA2-BrotherhoodRegalia | Brotherhood Regalia → Island | 35.6% | +1.2 ±0.5 | 18.9% | +0.4 ±0.4 | 1.6 |
| cutA2-KindredDiscovery | Kindred Discovery → Island | 35.9% | +1.5 ±0.5 | 18.7% | +0.1 ±0.4 | 1.6 |
| cutA2-CoverofDarkness | Cover of Darkness → Swamp | 35.9% | +1.5 ±0.6 | 18.6% | +0 ±0.4 | 1.5 |
| cutA2-ThrillKillAssassin | Thrill-Kill Assassin → Swamp | 35.1% | +0.7 ±0.6 | 19.2% | +0.7 ±0.5 | 1.4 |
| cutA2-RoamingThrone | Roaming Throne → Island | 34.9% | +0.5 ±0.6 | 19.4% | +0.9 ±0.5 | 1.4 |
| cutA2-SparkDouble | Spark Double → Island | 35.6% | +1.2 ±0.6 | 18.8% | +0.2 ±0.4 | 1.4 |
| cutA2-InfernalGrasp | Infernal Grasp → Swamp | 35.4% | +1 ±0.6 | 18.9% | +0.4 ±0.4 | 1.4 |
| cutA2-ShadowMysteriousAs | Shadow, Mysterious Assassin → Swamp | 35% | +0.6 ±0.5 | 19.2% | +0.7 ±0.4 | 1.3 |
| cutA2-AnOfferYouCantRefu | An Offer You Can't Refuse → Island | 34.3% | -0.1 ±1.1 | 19.9% | +1.4 ±0.8 | 1.3 |
| cutA2-QuietusSpike | Quietus Spike → Island | 34.6% | +0.2 ±0.5 | 19.5% | +1 ±0.4 | 1.2 |
| cutA2-LeylineofTransform | Leyline of Transformation → Island | 35% | +0.6 ±0.6 | 19.1% | +0.6 ±0.4 | 1.2 |
| cutA2-ChromeMox | Chrome Mox → Island | 34.2% | -0.1 ±1 | 19.8% | +1.3 ±0.9 | 1.2 |
| cutA2-MassacreGirlKnownK | Massacre Girl, Known Killer → Swamp | 35.1% | +0.7 ±0.5 | 18.9% | +0.4 ±0.4 | 1.1 |
| cutA2-SwiftfootBoots | Swiftfoot Boots → Island | 35.4% | +1 ±0.5 | 18.7% | +0.1 ±0.4 | 1.1 |
| cutA2-LightningGreaves | Lightning Greaves → Island | 34.9% | +0.5 ±0.6 | 19.1% | +0.6 ±0.4 | 1.1 |
| cutA2-ForceofWill | Force of Will → Island | 35% | +0.6 ±0.6 | 19% | +0.5 ±0.4 | 1.1 |
| cutA2-SwanSong | Swan Song → Island | 35.4% | +1 ±0.6 | 18.7% | +0.1 ±0.4 | 1.1 |
| cutA2-InterceptorShadows | Interceptor, Shadow's Hound → Swamp | 34.7% | +0.3 ±0.5 | 19.2% | +0.7 ±0.4 | 1.0 |
| cutA2-BasimIbnIshaq | Basim Ibn Ishaq → Swamp | 34.3% | +0 ±1.1 | 19.5% | +1 ±0.9 | 1.0 |
| cutA2-GrievousWound | Grievous Wound → Swamp | 34.7% | +0.3 ±0.6 | 19.1% | +0.6 ±0.4 | 0.9 |
| cutA2-BlackWidowDeadlyHu | Black Widow, Deadly Hunter → Swamp | 34.8% | +0.4 ±0.6 | 18.9% | +0.4 ±0.4 | 0.8 |
| cutA2-BrotherhoodSpy | Brotherhood Spy → Island | 35% | +0.6 ±0.6 | 18.7% | +0.1 ±0.4 | 0.7 |
| cutA2-RoshanHiddenMagist | Roshan, Hidden Magister → Swamp | 34.9% | +0.5 ±0.6 | 18.8% | +0.2 ±0.4 | 0.7 |
| cutA2-AssassinInitiate | Assassin Initiate → Swamp | 34.8% | +0.4 ±0.5 | 18.7% | +0.2 ±0.5 | 0.6 |
| cutA2-TalismanofDominanc | Talisman of Dominance → Island | 33.8% | -0.6 ±0.6 | 19.7% | +1.2 ±0.5 | 0.6 |
| cutA2-ChangelingOutcast | Changeling Outcast → Swamp | 34.3% | -0.1 ±0.6 | 19.1% | +0.6 ±0.5 | 0.5 |
| cutA2-MaritheKillingQuil | Mari, the Killing Quill → Swamp | 34.8% | +0.4 ±0.5 | 18.7% | +0.1 ±0.4 | 0.5 |
| cutA2-MischievousSneakli | Mischievous Sneakling → Island | 34.5% | +0.1 ±0.5 | 18.8% | +0.3 ±0.4 | 0.4 |
| cutA2-SatorutheInfiltrat | Satoru, the Infiltrator → Swamp | 34.6% | +0.2 ±0.6 | 18.8% | +0.2 ±0.4 | 0.4 |
| cutA2-AchillesDavenport | Achilles Davenport → Swamp | 34.8% | +0.4 ±0.6 | 18.6% | +0 ±0.4 | 0.4 |
| cutA2-DeadlyRollick | Deadly Rollick → Swamp | 34.5% | +0.1 ±0.6 | 18.8% | +0.3 ±0.4 | 0.4 |
| cutA2-FierceGuardianship | Fierce Guardianship → Island | 34.2% | -0.1 ±0.6 | 18.9% | +0.4 ±0.4 | 0.3 |
| cutA2-CyclonicRift | Cyclonic Rift → Island | 34.4% | +0 ±0.6 | 18.8% | +0.3 ±0.5 | 0.3 |
| cutA2-EzioBladeofVengean | Ezio, Blade of Vengeance → Swamp | 34.9% | +0.5 ±0.5 | 18.1% | -0.4 ±0.4 | 0.1 |
| cutA2-Counterspell | Counterspell → Island | 33.9% | -0.4 ±0.5 | 19% | +0.5 ±0.4 | 0.1 |
| cutA2-ShredderShadowMast | Shredder, Shadow Master → Swamp | 34.5% | +0.1 ±0.6 | 18.4% | -0.1 ±0.4 | 0.0 |
| cutA2-RhysticStudy | Rhystic Study → Island | 34.4% | +0 ±0.5 | 18.3% | -0.2 ±0.4 | -0.2 |
| cutA2-ArcaneSignet | Arcane Signet → Island | 33.7% | -0.6 ±0.6 | 18.5% | +0 ±0.4 | -0.6 |
| cutA2-VirtustheVeiled | Virtus the Veiled → Swamp | 34% | -0.3 ±0.5 | 18.1% | -0.4 ±0.4 | -0.7 |
| cutA2-ReversethePolarity | Reverse the Polarity → Island | 33.6% | -0.8 ±0.5 | 18.6% | +0.1 ±0.4 | -0.7 |
| cutA2-UnstoppableSlasher | Unstoppable Slasher → Swamp | 33.9% | -0.4 ±0.6 | 18.1% | -0.4 ±0.4 | -0.8 |
| cutA2-PyreofHeroes | Pyre of Heroes → Island | 33.5% | -0.8 ±0.6 | 18.1% | -0.4 ±0.5 | -1.2 |
| cutA2-Hullcarver | Hullcarver → Swamp | 33.1% | -1.2 ±0.6 | 18.4% | -0.1 ±0.5 | -1.3 |
| cutA2-EldraziMonument | Eldrazi Monument → Island | 33.3% | -1.1 ±0.6 | 18.3% | -0.2 ±0.4 | -1.3 |
| cutA2-VampiricTutor | Vampiric Tutor → Swamp | 32.8% | -1.5 ±0.6 | 18.5% | +0 ±0.4 | -1.5 |
| cutA2-ImperialSeal | Imperial Seal → Swamp | 32.4% | -1.9 ±0.6 | 18.1% | -0.4 ±0.5 | -2.3 |
| cutA2-DemonicTutor | Demonic Tutor → Swamp | 33.1% | -1.3 ±0.6 | 17.2% | -1.3 ±0.5 | -2.6 |
| cutA2-SolRing | Sol Ring → Island | 31.9% | -2.4 ±0.6 | 17.1% | -1.4 ±0.5 | -3.8 |
| cutA2-BloodletterofAclaz | Bloodletter of Aclazotz → Swamp | 31.5% | -2.9 ±0.7 | 16.2% | -2.3 ±0.5 | -5.2 |
| cutA2-RamsesAssassinLord | Ramses, Assassin Lord → Swamp | 20.3% | -14 ±1 | 12.9% | -5.6 ±0.8 | -19.6 |

What it says: apart from Ramses (−14 / −5.6), Bloodletter (−2.9 / −2.3), Sol Ring, Demonic Tutor, Imperial Seal and Vampiric Tutor, every card in the list is worth about as much as a basic land (within ±1.5 points). The deck is a Ramses-and-Bloodletter kill with a filler shell; the shell's exact cards barely matter, consistency and resilience do.

| # | Run | List / change | B2 win | B4 win | Paired vs | Δ B2 | Δ B4 | Note |
|---|---|---|---|---|---|---|---|---|
| 25 | mull2 | A2 with the Bracket 4 mulligan (keep: cheap evasive body + Etrata by turn 3, or fast mana + a threat, or a turn 1–2 engine; interaction-only hands shipped) | 34.6% ±1.1 | 19.8% ±0.9 | skA2-0 | +0.2 ±1.0 | +1.3 ±0.8 | kept as the default |
| 26 | holdboard | A2 with "don't overextend": non-engine creatures wait in hand once four are out | 34.5% ±1.1 | 18.2% ±0.9 | skA2-0 | +0.1 ±0.7 | −0.3 ±0.5 | no effect; off |
| 27 | v1-blitz | version 1 (`lists/v1-blitz.txt`): Yuriko-template Assassins + the Ramses kill + Bracket 4 shell, 31 lands | 31.9% ±1.0 | 18.5% ±0.9 | skA2-0 | −2.4 ±1.4 | −0.0 ±1.2 | avg win round 9.0 / 8.1; telemetry in `v1-blitz-*` |
| 28 | v2-snowball | version 2 (`lists/v2-snowball.txt`): type-changers, Etrata copies, team evasion, anthems, Vein Ripper closer, 32 lands | 34.1% ±1.1 | 18.2% ±0.9 | skA2-0 | −0.2 ±1.5 | −0.3 ±1.2 | avg win round 9.3 / 8.2 |
| 29 | v3-tempo | version 3 (`lists/v3-tempo.txt`): ninjutsu + free interaction, 30 lands | 26.5% ±1.0 | 18.7% ±0.9 | skA2-0 | -7.9 ±1.4 | +0.2 ±1.2 | avg win round 9.1 / 8.3 |
| 30 | v4-drain | version 4 (`lists/v4-drain.txt`): deathtouch Assassins + Mari + Hooded Blightfang, Pulse Tracker/Conquistador/Syphoner, Within Range, Dolmen Gate, type-changers, 31 lands | 27.7% ±1.0 | 18.4% ±0.9 | skA2-0 | −6.7 ±1.4 | −0.1 ±1.2 | the drain engine only takes 6.4 life a game; it needs Blightfang + Mari + bodies, which rarely all land |
| 31 | v4-defend2 | v4 with blockers kept home against the whole table's crack-back (HEIST_ON=defend2) | 27.9% ±1.0 | 18.8% ±0.9 | v4-drain | +0.2 ±0.3 | +0.4 ±0.3 | nothing; off |
| 32 | v1-hatred | v1 with mana held in main phase one when a Hatred kill is live | 31.1% ±1.0 | 17.9% ±0.9 | v1-blitz | −0.8 ±0.3 | −0.5 ±0.2 | Hatred still cast in only 3% of games; holding mana costs tempo; opt-in (HEIST_ON=hatredHold) |
| 33 | v2-savecounter | v2 with the last counter saved for a wipe or removal on Ramses/Etrata | 35.1% ±1.1 | 18.2% ±0.9 | v2-snowball | +1.0 ±0.7 | +0.0 ±0.5 | default from here; later v2 runs pair against this one |
| 34 | v2-tg | v2: Cover of Darkness → Training Grounds | 35.0% ±1.1 | 18.0% ±0.9 | v2-snowball | +0.8 ±0.5 | −0.2 ±0.4 | kept (the pilots' 79% card) |
| 35 | v2-tg-flipfirst | the same with flips before casting | 33.5% ±1.1 | 17.1% ±0.8 | v2-snowball | −0.6 ±0.8 | −1.1 ±0.6 | flipping first is worse again |
| 36 | v2-veil | v2: Cover of Darkness → Teferi's Veil (attackers phase out until our untap) | 36.1% ±1.1 | 18.4% ±0.9 | v2-savecounter | +1.0 ±0.5 | +0.2 ±0.4 | creatures lost on opponents' turns 5.3 → 4.8; kept |
| 37 | v2-etrataboots | v2 with Boots/Greaves on Etrata before Ramses (HEIST_ON=etrataBoots) | 35.1% ±1.1 | 18.1% ±0.9 | v2-savecounter | −0.0 ±0.1 | −0.1 ±0.1 | no difference; off |
| 38 | v2-veil-tg | v2: Cover → Teferi's Veil, Thieving Amalgam → Training Grounds | 35.0% ±1.1 | 18.3% ±0.9 | v2-savecounter | −0.1 ±0.6 | +0.1 ±0.5 | Amalgam is worth keeping over Training Grounds in this list |
| 39 | v2-34lands | v2: Reno and Rude, Brotherhood Spy → Island, Swamp (34 lands) | 35.3% ±1.1 | 18.2% ±0.9 | v2-savecounter | +0.1 ±0.8 | −0.0 ±0.6 | land count isn't the issue; 32 stays |
| 40 | v2-etratalate | v2 with Etrata cast only when an Assassin can connect that turn (or Boots/Greaves out, or round 6) | 34.9% ±1.1 | 19.2% ±0.9 | v2-savecounter | −0.2 ±1.1 | +1.0 ±0.9 | default from here (the pilots' rule) |
| 41 | v2b-tutors | v2b: Orochi, Vela, Kindred Dominance, Archetype → Demonic Consultation, Dimir House Guard, Fleshwrither, Lim-Dûl's Vault | 35.0% ±1.1 | 18.9% ±0.9 | v2-veil | −1.1 ±0.9 | +0.5 ±0.7 | Ramses lands in 61% of games (was 52%) and still wins 50% of them; the games without him got worse (12%) |
| 42 | v2b-lowcurve | v2b: the six 6–7 drops → Hullcarver, Basim, Desmond, Brainstorm, Preordain, Demonic Consultation | 36.6% ±1.1 | 20.5% ±0.9 | v2-veil | +0.4 ±1.1 | +2.1 ±0.9 | avg win round 8.9 / 7.8; the fast list is better against the Bracket 4 bots |
| 43 | v2b-both | both packages | 34.6% ±1.1 | 20.1% ±0.9 | v2-veil | −1.5 ±1.1 | +1.7 ±1.0 | |
