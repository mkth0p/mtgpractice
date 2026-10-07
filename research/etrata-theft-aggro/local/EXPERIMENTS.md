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
| 44 | v2b-protect | v2b: Vein Ripper, Ashnod's Altar, Kindred Dominance, Orochi → Whispersilk Cloak, Darksteel Plate, Patriarch's Bidding, Demonic Consultation | 33.8% ±1.1 | 19.0% ±0.9 | v2-veil | −2.3 ±1.2 | +0.6 ±0.9 | the equipment doesn't pay for the closers it replaced |
| 45 | v2b-protecttutor | the protect list with tutors fetching Greaves/Boots/Cloak when Ramses is out and bare (HEIST_ON=protectTutor) | 33.4% ±1.1 | 18.8% ±0.9 | v2b-protect | −0.4 ±0.3 | −0.1 ±0.2 | Ramses still removed in 35% of his games: by the time the tutor resolves he has already been exposed for a turn cycle |
| 46 | v2c-base | `lists/v2c.txt` (v2b-lowcurve) on the final default brain (Bracket 4 mulligan, last counter saved, Etrata when an Assassin connects) | 36.6% ±1.1 | 21.4% ±0.9 | v2-veil | +0.5 ±1.3 | +3.0 ±1.1 | avg win round 8.8 / 7.8; Ramses lands in 62% of precon games and wins 51% of them, removed in 33% of them (wraths: Cleansing Nova, Time Wipe, Phyrexian Rebirth, Wrath of God, Austere Command, Hour of Reckoning) |
| 47 | v2c-greaves | v2c with HEIST_ON=greavesFirst: Ramses waits for Greaves/Boots (cast first) and, before round 8, for a counter or protection | 32.8% ±1.0 | 16.6% ±0.8 | v2c-base | −3.8 ±0.8 | −4.8 ±0.7 | Ramses removed in 26% of his games instead of 33%, but he lands in 52% of games instead of 62% and a turn later: the tempo is worth more than the protection; opt-in only |
| 48 | v2c-vamp | `lists/v2c-vamp.txt`: v2c with Hullcarver, Desmond Miles, Skullclamp, Maskwood Nexus → Exquisite Blood, Sanguine Bond, Bloodthirsty Conqueror, Vito, Thorn of the Dusk Rose (the brain's tutors complete the loop once half is out) | 42.4% ±1.1 | 23.4% ±0.9 | v2c-base | +5.8 ±1.5 | +2.0 ±1.2 | avg win round 9.2 / 7.9; vs precons 38% of the kills are the drain, 44% combat, 7% on-hit; the last kill: Ramses' win 50%, drain 32%, combat 14% |
| 49 | v2c-confirm | **confirmation of v2c, 5,040 games per field** (PROCS=18 × N=280) | **36.0% ±0.7** | **21.0% ±0.6** | | | | avg win round 8.9 / 7.9, median 9 / 8; won by round 6/7/8: 4%/10%/17% vs precons; 7.0 cards stolen a game (6.8 by Etrata), 1.86 Etrata casts; kills: combat 82%, on-hit 13%, drain 6%; the last kill of a won game: Ramses' win 74%, combat 17%, on-hit 7% |
| 50 | v2c-nocmd | v2c with NO_COMMANDER=1, 5,040 games per field | 23.2% ±0.6 | 15.5% ±0.5 | v2c-confirm | **−12.8 ±0.8** | **−5.5 ±0.7** | Etrata's contribution to the finalist; avg win round 9.3 / 8.1 |
| 51 | v1b-blitz | `lists/v1b-blitz.txt`: v1-blitz with Esper Sentinel (white, illegal) → Faerie Seer | 31.4% ±1.0 | 19.0% ±0.9 | v2c-base | −5.2 ±1.5 | −2.4 ±1.2 | |
| 52 | v1b-confirm | **confirmation of v1b, 5,040 games per field** | **31.1% ±0.7** | **18.9% ±0.6** | v2c-confirm | −4.9 ±0.9 | −2.1 ±0.8 | avg win round 9.0 / 8.1; 5.4 cards stolen a game; kills: combat 66%, on-hit 24%, drain 9% |
| 53 | v2c-vamp-confirm | **confirmation of v2c-vamp, 5,040 games per field** | **41.8% ±0.7** | **23.3% ±0.6** | v2c-confirm | +5.8 ±0.9 | +2.4 ±0.8 | avg win round 9.1 / 7.9; kills vs precons: combat 44%, drain 37%, on-hit 7%, other players 12%; the last kill: Ramses' win 50%, drain 30%, combat 15% |
| 54 | cut2c-* (cut sweep of v2c) | each of the 66 nonland cards of `lists/v2c.txt` replaced by a basic land (table below) | | | v2c-base | | | best cuts: Kindred Discovery +2.2 / +0.2 (it decks the deck), Swiftfoot Boots +1.6 / +0.8, Mana Drain +1.4 / +0.8, Interceptor +1.1 / +0.7, Obelisk of Urd +1.3 / +0.5, Ghostly Flicker +1.4 / +0.3; clearest keeps: Bloodletter −4.4 / −2.8, Demonic Tutor −2.2 / −0.6, Sol Ring −0.7 / −1.5, Slither Blade −0.7 / −1.3, Eldrazi Monument −1.0 / −0.8, Pyre of Heroes −0.3 / −1.4 |

### Cut sweep of the finalist v2c (each card → a basic land; 2,016 paired games per field vs v2c-base; positive = better without the card)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| cut2c-KindredDiscovery | Kindred Discovery → Island | 38.8% | +2.2 ±0.5 | 21.6% | +0.2 ±0.4 | 2.4 |
| cut2c-SwiftfootBoots | Swiftfoot Boots → Island | 38.2% | +1.6 ±0.6 | 22.2% | +0.8 ±0.5 | 2.4 |
| cut2c-ManaDrain | Mana Drain → Island | 38% | +1.4 ±0.5 | 22.2% | +0.8 ±0.4 | 2.2 |
| cut2c-InterceptorShadowsHo | Interceptor, Shadow's Hound → Swamp | 37.7% | +1.1 ±0.6 | 22.1% | +0.7 ±0.5 | 1.8 |
| cut2c-ObeliskofUrd | Obelisk of Urd → Island | 37.9% | +1.3 ±0.6 | 21.9% | +0.5 ±0.4 | 1.8 |
| cut2c-GhostlyFlicker | Ghostly Flicker → Island | 38% | +1.4 ±0.5 | 21.7% | +0.3 ±0.4 | 1.7 |
| cut2c-ForceofWill | Force of Will → Island | 37.5% | +0.9 ±0.5 | 22% | +0.6 ±0.4 | 1.5 |
| cut2c-CyclonicRift | Cyclonic Rift → Island | 37.6% | +1 ±0.6 | 21.9% | +0.5 ±0.5 | 1.5 |
| cut2c-MysticRemora | Mystic Remora → Island | 37.9% | +1.3 ±0.6 | 21.5% | +0.1 ±0.5 | 1.4 |
| cut2c-ForceofNegation | Force of Negation → Island | 37.4% | +0.8 ±0.5 | 22% | +0.6 ±0.5 | 1.4 |
| cut2c-SnuffOut | Snuff Out → Swamp | 36.9% | +0.2 ±0.6 | 22.6% | +1.2 ±0.5 | 1.4 |
| cut2c-QuietusSpike | Quietus Spike → Island | 37% | +0.3 ±0.6 | 22.4% | +1 ±0.5 | 1.3 |
| cut2c-RoshanHiddenMagister | Roshan, Hidden Magister → Swamp | 37.4% | +0.7 ±0.6 | 22% | +0.6 ±0.4 | 1.3 |
| cut2c-SparkDouble | Spark Double → Island | 37.4% | +0.8 ±0.5 | 21.7% | +0.3 ±0.4 | 1.1 |
| cut2c-Skullclamp | Skullclamp → Island | 37.3% | +0.7 ±0.6 | 21.8% | +0.4 ±0.4 | 1.1 |
| cut2c-DarkConfidant | Dark Confidant → Swamp | 37.4% | +0.8 ±0.6 | 21.5% | +0.1 ±0.5 | 0.9 |
| cut2c-LeylineofTransformat | Leyline of Transformation → Island | 37.1% | +0.4 ±0.6 | 21.9% | +0.5 ±0.4 | 0.9 |
| cut2c-DiabolicIntent | Diabolic Intent → Swamp | 37.5% | +0.8 ±0.6 | 21.4% | +0 ±0.4 | 0.8 |
| cut2c-CoatofArms | Coat of Arms → Island | 37.4% | +0.7 ±0.6 | 21.5% | +0.1 ±0.4 | 0.8 |
| cut2c-SakashimatheImpostor | Sakashima the Impostor → Island | 36.8% | +0.2 ±0.6 | 21.9% | +0.5 ±0.5 | 0.7 |
| cut2c-LightningGreaves | Lightning Greaves → Island | 37% | +0.3 ±0.5 | 21.8% | +0.4 ±0.4 | 0.7 |
| cut2c-LotusPetal | Lotus Petal → Island | 37% | +0.3 ±0.5 | 21.8% | +0.4 ±0.5 | 0.7 |
| cut2c-RhysticStudy | Rhystic Study → Island | 37.4% | +0.7 ±0.6 | 21.3% | +0 ±0.5 | 0.7 |
| cut2c-Reanimate | Reanimate → Swamp | 37.4% | +0.8 ±0.6 | 21.2% | -0.2 ±0.5 | 0.6 |
| cut2c-AshnodsAltar | Ashnod's Altar → Island | 37.5% | +0.9 ±0.5 | 21% | -0.4 ±0.4 | 0.5 |
| cut2c-ArcaneSignet | Arcane Signet → Island | 37.3% | +0.6 ±0.5 | 21.3% | -0.1 ±0.5 | 0.5 |
| cut2c-TalismanofDominance | Talisman of Dominance → Island | 37.4% | +0.8 ±0.6 | 21% | -0.3 ±0.5 | 0.5 |
| cut2c-HiredPoisoner | Hired Poisoner → Swamp | 36% | -0.6 ±0.6 | 22.4% | +1 ±0.5 | 0.4 |
| cut2c-RoamingThrone | Roaming Throne → Island | 36% | -0.6 ±0.6 | 22.4% | +1 ±0.5 | 0.4 |
| cut2c-DemonicConsultation | Demonic Consultation → Swamp | 36.8% | +0.2 ±0.6 | 21.5% | +0.1 ±0.6 | 0.3 |
| cut2c-GrimTutor | Grim Tutor → Swamp | 37% | +0.4 ±0.6 | 21.2% | -0.1 ±0.5 | 0.3 |
| cut2c-SwanSong | Swan Song → Island | 37.5% | +0.8 ±0.5 | 20.9% | -0.5 ±0.4 | 0.3 |
| cut2c-RenoandRude | Reno and Rude → Swamp | 36.6% | +0 ±0.6 | 21.7% | +0.3 ±0.5 | 0.3 |
| cut2c-MaritheKillingQuill | Mari, the Killing Quill → Swamp | 36.6% | +0 ±0.6 | 21.7% | +0.3 ±0.5 | 0.3 |
| cut2c-AchillesDavenport | Achilles Davenport → Swamp | 37.5% | +0.9 ±0.6 | 20.7% | -0.7 ±0.4 | 0.2 |
| cut2c-VirtustheVeiled | Virtus the Veiled → Swamp | 36.5% | -0.1 ±0.6 | 21.7% | +0.3 ±0.5 | 0.2 |
| cut2c-TetsukoUmezawaFugiti | Tetsuko Umezawa, Fugitive → Island | 37.2% | +0.6 ±0.6 | 21% | -0.4 ±0.5 | 0.2 |
| cut2c-ArcaneAdaptation | Arcane Adaptation → Island | 36.8% | +0.1 ±0.6 | 21.3% | +0 ±0.5 | 0.1 |
| cut2c-Preordain | Preordain → Island | 36.8% | +0.1 ±0.6 | 21.2% | -0.1 ±0.5 | 0.0 |
| cut2c-TeferisVeil | Teferi's Veil → Island | 36.9% | +0.2 ±0.5 | 21% | -0.3 ±0.4 | -0.1 |
| cut2c-FierceGuardianship | Fierce Guardianship → Island | 36.1% | -0.5 ±0.5 | 21.8% | +0.4 ±0.4 | -0.1 |
| cut2c-SatorutheInfiltrator | Satoru, the Infiltrator → Swamp | 36.6% | +0 ±0.6 | 21.3% | -0.1 ±0.5 | -0.1 |
| cut2c-TheyCamefromthePipes | They Came from the Pipes → Island | 36.4% | -0.2 ±0.6 | 21.5% | +0.1 ±0.4 | -0.1 |
| cut2c-MaskwoodNexus | Maskwood Nexus → Island | 35.9% | -0.7 ±0.6 | 21.9% | +0.5 ±0.4 | -0.2 |
| cut2c-ChangelingOutcast | Changeling Outcast → Swamp | 36.7% | +0 ±0.6 | 21.1% | -0.3 ±0.5 | -0.3 |
| cut2c-Brainstorm | Brainstorm → Island | 36.3% | -0.3 ±0.6 | 21.3% | +0 ±0.5 | -0.3 |
| cut2c-ChromeMox | Chrome Mox → Island | 36.4% | -0.2 ±0.6 | 21.2% | -0.1 ±0.5 | -0.3 |
| cut2c-BrotherhoodSpy | Brotherhood Spy → Island | 36.9% | +0.2 ±0.6 | 20.7% | -0.6 ±0.5 | -0.4 |
| cut2c-VeinRipper | Vein Ripper → Swamp | 35.3% | -1.3 ±0.5 | 22.3% | +0.9 ±0.5 | -0.4 |
| cut2c-DesmondMiles | Desmond Miles → Swamp | 36.1% | -0.5 ±0.6 | 21.5% | +0.1 ±0.4 | -0.4 |
| cut2c-ReversethePolarity | Reverse the Polarity → Island | 36.1% | -0.5 ±0.5 | 21.1% | -0.2 ±0.4 | -0.7 |
| cut2c-DeadlyRollick | Deadly Rollick → Swamp | 36.5% | -0.1 ±0.6 | 20.7% | -0.6 ±0.5 | -0.7 |
| cut2c-ImperialSeal | Imperial Seal → Swamp | 35.8% | -0.8 ±0.7 | 21.5% | +0.1 ±0.5 | -0.7 |
| cut2c-MothdustChangeling | Mothdust Changeling → Island | 35.8% | -0.8 ±0.6 | 21.3% | +0 ±0.5 | -0.8 |
| cut2c-BasimIbnIshaq | Basim Ibn Ishaq → Swamp | 35.8% | -0.8 ±0.6 | 21.4% | +0 ±0.5 | -0.8 |
| cut2c-DarkRitual | Dark Ritual → Swamp | 36.7% | +0 ±0.6 | 20.6% | -0.8 ±0.5 | -0.8 |
| cut2c-Hullcarver | Hullcarver → Swamp | 36.5% | -0.1 ±0.6 | 20.6% | -0.8 ±0.5 | -0.9 |
| cut2c-VampiricTutor | Vampiric Tutor → Swamp | 35.6% | -1 ±0.6 | 21.3% | +0 ±0.5 | -1.0 |
| cut2c-MoxAmber | Mox Amber → Island | 35.9% | -0.7 ±0.5 | 20.9% | -0.4 ±0.4 | -1.1 |
| cut2c-UnstoppableSlasher | Unstoppable Slasher → Swamp | 36% | -0.6 ±0.6 | 20.6% | -0.7 ±0.5 | -1.3 |
| cut2c-PyreofHeroes | Pyre of Heroes → Island | 36.3% | -0.3 ±0.6 | 19.9% | -1.4 ±0.5 | -1.7 |
| cut2c-EldraziMonument | Eldrazi Monument → Island | 35.6% | -1 ±0.5 | 20.5% | -0.8 ±0.4 | -1.8 |
| cut2c-SlitherBlade | Slither Blade → Island | 35.9% | -0.7 ±0.6 | 20% | -1.3 ±0.5 | -2.0 |
| cut2c-SolRing | Sol Ring → Island | 35.9% | -0.7 ±0.6 | 19.9% | -1.5 ±0.5 | -2.2 |
| cut2c-DemonicTutor | Demonic Tutor → Swamp | 34.4% | -2.2 ±0.6 | 20.8% | -0.6 ±0.5 | -2.8 |
| cut2c-BloodletterofAclazot | Bloodletter of Aclazotz → Swamp | 32.2% | -4.4 ±0.8 | 18.6% | -2.8 ±0.6 | -7.2 |

| 55 | pk2-* (packages on the freed slots) | v2c with the sweep's cuts spent on Ramses-independence ideas (table below); every package measured with telemetry for the win rate with and without Ramses | | | v2c-base | | | **the basics win**: six cuts → six basic lands +6.4 / +4.9 (43.0% / 26.2%, avg win round 8.7 / 7.8); Ramses lands in 67% of games (62%) and the games without him go 14% → 17%; recursion package +4.6 / +3.1 (without Ramses 19%); copies +3.1 / +2.6; evasion +2.6 / +2.0; one-shot reach +0.9 / +0.9. For comparison the closer list wins 31% of its games without Ramses (the loop), the pure list 14% |

### Packages on the finalist's freed slots (2,016 paired games per field vs v2c-base)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk2-cuts6 | Kindred Discovery → Island; Swiftfoot Boots → Island; Mana Drain → Island; Interceptor, Shadow's Hound → Swamp; Obelisk of Urd → Swamp; Ghostly Flicker → Swamp | 43% | +6.4 ±1.1 | 26.2% | +4.9 ±0.9 | 11.3 |
| pk2-recur | Kindred Discovery → Patriarch's Bidding; Swiftfoot Boots → Kindred Dominance; Mana Drain → Shredder, Shadow Master; Interceptor, Shadow's Hound → Swamp | 41.2% | +4.6 ±0.9 | 24.5% | +3.1 ±0.7 | 7.7 |
| pk2-copies | Kindred Discovery → Auton Soldier; Swiftfoot Boots → Thieving Amalgam; Mana Drain → Vela the Night-Clad; Interceptor, Shadow's Hound → Swamp | 39.7% | +3.1 ±0.9 | 24% | +2.6 ±0.7 | 5.7 |
| pk2-evasion | Kindred Discovery → Levitation; Swiftfoot Boots → Archetype of Imagination; Mana Drain → Training Grounds; Interceptor, Shadow's Hound → Swamp | 39.2% | +2.6 ±0.9 | 23.4% | +2 ±0.7 | 4.6 |
| pk2-reach | Kindred Discovery → Hatred; Swiftfoot Boots → Blood Tribute; Mana Drain → Exsanguinate; Interceptor, Shadow's Hound → Rush of Dread | 37.5% | +0.9 ±0.8 | 22.3% | +0.9 ±0.6 | 1.8 |

| 56 | pk3-* (on the 38-land list) | `lists/v2d.txt` = v2c with the six cuts → basics (38 lands); four more cuts for lands (42), the recursion and evasion ideas in those four slots, and the closer list with the same six cuts (`lists/v2d-vamp.txt`) | | | pk2-cuts6 / v2c-vamp | | | 42 lands +0.2 / −0.2 (the mana is saturated at 38); recursion at 38 lands +1.7 / −0.8, evasion +0.9 / −1.9 (nothing); **the closer list with the cuts 47.6% / 27.1%** (+5.2 / +3.8), winning 37% of its games without Ramses |

### Round 3 on the 38-land list (2,016 paired games per field; the first three vs pk2-cuts6, the last vs v2c-vamp)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk3-vamp38 |  | 47.6% | +5.2 ±1.5 | 27.1% | +3.8 ±1.3 | 9.0 |
| pk3-recur38 | Force of Will → Patriarch's Bidding; Cyclonic Rift → Kindred Dominance; Force of Negation → Shredder, Shadow Master; Mystic Remora → Auton Soldier | 44.7% | +1.7 ±1.5 | 25.4% | -0.8 ±1.3 | 0.9 |
| pk3-lands42 | Force of Will → Island; Cyclonic Rift → Island; Force of Negation → Swamp; Mystic Remora → Swamp | 43.2% | +0.2 ±1.5 | 26% | -0.2 ±1.3 | 0.0 |
| pk3-evasion38 | Force of Will → Levitation; Cyclonic Rift → Archetype of Imagination; Force of Negation → Training Grounds; Mystic Remora → Thieving Amalgam | 43.9% | +0.9 ±1.5 | 24.4% | -1.9 ±1.3 | -1.0 |

| 57 | v2d-confirm | **confirmation of v2d (38 lands), 5,040 games per field** | **40.4% ±0.7** | **23.6% ±0.6** | v2c-confirm | **+4.4 ±0.9** | **+2.6 ±0.8** | avg win round 8.8 / 7.8, median 8 / 8; the 2,016-game package estimate (+6.4 / +4.9) regressed, as a package picked from a sweep's best cards does; 7.9 cards stolen a game; Ramses lands in 65% / 43% of games, wins 53% / 43% with him, 17% / 9% without; 7% of the precon losses are still an empty library (Demonic Consultation plus the draw engines) |
| 58 | v2d-nocmd | v2d with NO_COMMANDER=1, 5,040 games per field | 23.7% ±0.6 | 16.6% ±0.5 | v2d-confirm | **−16.7 ±0.8** | **−7.0 ±0.7** | Etrata's contribution to the recommended list |
| 59 | v2d-vamp-confirm | **confirmation of v2d-vamp (the closer list with the six cuts), 5,040 games per field** | **47.0% ±0.7** | **26.9% ±0.6** | v2c-vamp-confirm | +5.3 ±0.9 | +3.6 ±0.8 | +6.6 ±0.9 / +3.3 ±0.8 over v2d-confirm; wins 38% / 18% of its games without Ramses; kills vs precons: combat 54%, drain 37%, on-hit 10%; avg win round 8.8 / 7.9 |
| 60 | v2d-consult30 | v2d with Demonic Consultation held while the library has fewer than 30 cards (HEIST_ON=consult30) | 41.8% ±1.1 | 23.7% ±0.9 | pk2-cuts6 | −1.2 ±1.5 | −2.6 ±1.3 | the library losses didn't move (72 vs 61 of 2,016): the decking comes from the draw engines, and the held Consultation costs Ramses access; opt-in only |
| 61 | pk4-* (the four new cards) | Animate Dead, Necromancy, Helm of the Host and Irenicus's Vile Duplication implemented (tests in `test-heist.js`, the tutors fetch a reanimation spell when Ramses is in a graveyard, Helm and the Duplication copy Ramses first, Etrata second) and benched in place of basic lands of the 38-land lists (table below) | | | pk2-cuts6 / pk3-vamp38 | | | all below the lands they replaced: reanimation pair −0.4 / −3.4, copy pair −2.2 / −3.6, all four −1.6 / −3.9, all four in the closer list −0.7 / −2.5; the win rate without Ramses stays at 16–18% (pure) and 36% (closer); the cards are live too rarely: Animate Dead cast in 9% of games, Necromancy 12%, Helm 12% (round 7.5 on average), the Duplication 16% |

### Round 4: the four new cards in place of basic lands (2,016 paired games per field)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk4-vamp-all4 | Island → Animate Dead; Island → Necromancy; Swamp → Helm of the Host; Swamp → Irenicus's Vile Duplication | 46.8% | -0.7 ±1 | 24.6% | -2.5 ±0.8 | -3.2 |
| pk4-reanim | Island → Animate Dead; Swamp → Necromancy | 42.6% | -0.4 ±1.5 | 22.9% | -3.4 ±1.3 | -3.8 |
| pk4-all4 | Island → Animate Dead; Island → Necromancy; Swamp → Helm of the Host; Swamp → Irenicus's Vile Duplication | 41.4% | -1.6 ±1.5 | 22.4% | -3.9 ±1.3 | -5.5 |
| pk4-helm | Island → Helm of the Host; Swamp → Irenicus's Vile Duplication | 40.8% | -2.2 ±1.5 | 22.6% | -3.6 ±1.3 | -5.8 |

| 62 | pk5-* (aristocrat drains) | Zulaport Cutthroat, Blood Artist, Bastion of Remembrance (and Falkenrath Noble) in place of basic lands: the stolen 2/2s die to Ashnod's Altar and drain the table (the altar plan now counts every death drain, `H.drainPerDeath`) | | | pk2-cuts6 / pk3-vamp38 | | | pure list: three cards −2.1 / −3.4, four cards −0.7 / −3.3, the games without Ramses unchanged at 17–18% (drain rises to 13–17% of the kills, the total doesn't); **closer list +2.1 ±0.9 / +0.0 ±0.8 (49.7% / 27.1%)**, 40% of its precon games won without Ramses: the drains feed the loop |

### Round 5: aristocrat drains in place of basic lands (2,016 paired games per field)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk5-vamp-aristo3 | Island → Zulaport Cutthroat; Swamp → Blood Artist; Swamp → Bastion of Remembrance | 49.7% | +2.1 ±0.9 | 27.1% | +0 ±0.8 | 2.1 |
| pk5-aristo4 | Island → Zulaport Cutthroat; Island → Blood Artist; Swamp → Bastion of Remembrance; Swamp → Falkenrath Noble | 42.3% | -0.7 ±1.5 | 22.9% | -3.3 ±1.3 | -4.0 |
| pk5-aristo3 | Island → Zulaport Cutthroat; Swamp → Blood Artist; Swamp → Bastion of Remembrance | 40.9% | -2.1 ±1.5 | 22.8% | -3.4 ±1.3 | -5.5 |

| 63 | v2e-vamp-confirm | the closer list with Zulaport Cutthroat, Blood Artist, Bastion of Remembrance (`lists/v2e-vamp.txt`), 5,040 games per field | 48.0% ±0.7 | 26.5% ±0.6 | v2d-vamp-confirm | +0.9 ±0.6 | −0.3 ±0.5 | the 2,016-game +2.1 regressed to noise; 38% / 18% of its games won without Ramses, the same as without the three; not adopted |
| 64 | pk6-* (the snowball axis, engine-ready cards) | on the closer list (`v2d-vamp`, 38 lands), each in place of basic lands: Cryptic Coat + Scroll of Fate, Reconnaissance Mission + Coastal Piracy, Bident of Thassa, Wound Reflection, Fireshrieker, Cover of Darkness, Training Grounds (and with eager flips), Etrata the Silencer, Kindred Dominance, Levitation | | | pk3-vamp38 | | | nothing beats a basic land by more than noise: Kindred Dominance +1.0 / +0.3, Levitation +0.6 / −0.1, the rest 0 to −1.9; eager flips with Training Grounds −2.2 / −1.2 (third time); the games without Ramses stay at 34–38% |

### Round 6: the snowball axis on the closer list (2,016 paired games per field vs pk3-vamp38)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk6-dominance | Swamp → Kindred Dominance | 48.6% | +1 ±0.6 | 27.5% | +0.3 ±0.5 | 1.3 |
| pk6-levitation | Island → Levitation | 48.2% | +0.6 ±0.6 | 27% | -0.1 ±0.5 | 0.5 |
| pk6-bident | Island → Bident of Thassa | 47.6% | +0 ±0.5 | 27.1% | +0 ±0.5 | 0.0 |
| pk6-dstrike | Island → Fireshrieker | 47.6% | +0 ±0.5 | 26.5% | -0.6 ±0.5 | -0.6 |
| pk6-cover | Swamp → Cover of Darkness | 47.7% | +0.1 ±0.6 | 26.2% | -0.9 ±0.5 | -0.8 |
| pk6-tg | Island → Training Grounds | 47.1% | -0.5 ±0.5 | 26.6% | -0.5 ±0.5 | -1.0 |
| pk6-wound | Swamp → Wound Reflection | 47.3% | -0.3 ±0.6 | 26.1% | -1 ±0.4 | -1.3 |
| pk6-draw | Island → Reconnaissance Mission; Island → Coastal Piracy | 47.6% | +0 ±0.8 | 25.7% | -1.4 ±0.6 | -1.4 |
| pk6-silencer | Swamp → Etrata, the Silencer | 47.4% | -0.1 ±0.7 | 25.6% | -1.5 ±0.5 | -1.6 |
| pk6-tg-flipfirst | Island → Training Grounds | 45.3% | -2.2 ±0.9 | 25.9% | -1.2 ±0.6 | -3.4 |
| pk6-coat | Island → Cryptic Coat; Island → Scroll of Fate | 45.8% | -1.7 ±0.8 | 25.2% | -1.9 ±0.7 | -3.6 |

| 65 | pk7-* (copies that stack, myriad, a trigger copier) | on the closer list, in place of basic lands: Mirror Box, Sakashima of a Thousand Faces, Rite of Replication (kicked: five copies), Blade of Selves (myriad), Strionic Resonator (copies Etrata's cloak trigger or a halver's trigger), singly, in pairs and all five (table below) | | | pk3-vamp38 | | | none beats a basic land: Blade of Selves 0.0 / −0.8, Strionic Resonator 0.0 / −0.8, Mirror Box 0.0 / −0.9, Sakashima + Rite −1.1 / −1.6, Mirror Box + Rite −0.9 / −2.0, all five −3.4 / −3.3; the games without Ramses stay at 33–37% |

### Round 7: copies that stack, myriad and a trigger copier, on the closer list (2,016 paired games per field vs pk3-vamp38)
| Run | Swap | B2 win | Δ B2 | B4 win | Δ B4 | Δ sum |
|---|---|---|---|---|---|---|
| pk7-blade | Island → Blade of Selves | 47.6% | +0 ±0.5 | 26.3% | -0.8 ±0.5 | -0.8 |
| pk7-resonator | Island → Strionic Resonator | 47.5% | +0 ±0.5 | 26.3% | -0.8 ±0.5 | -0.8 |
| pk7-mirror | Island → Mirror Box | 47.5% | +0 ±0.5 | 26.2% | -0.9 ±0.5 | -0.9 |
| pk7-saka-rite | Island → Sakashima of a Thousand Faces; Island → Rite of Replication | 46.4% | -1.1 ±0.8 | 25.5% | -1.6 ±0.7 | -2.7 |
| pk7-mirror-rite | Island → Mirror Box; Island → Rite of Replication | 46.7% | -0.9 ±0.8 | 25.1% | -2 ±0.7 | -2.9 |
| pk7-all5 | Island → Mirror Box; Island → Sakashima of a Thousand Faces; Island → Rite of Replication; Swamp → Blade of Selves; Swamp → Strionic Resonator | 44.1% | -3.4 ±1.1 | 23.6% | -3.5 ±0.9 | -6.9 |

| 66 | vamp-dominance-confirm | **the closer list with Kindred Dominance for a Swamp (`lists/v2f-vamp.txt`), 5,040 games per field** | **47.9% ±0.7** | **27.5% ±0.6** | v2d-vamp-confirm | **+0.8 ±0.4** | **+0.7 ±0.3** | the one card of rounds 6–7 that beats a basic land, on both fields, confirmed; adopted into the recommended list (avg win round 9.0 / 8.0) |
