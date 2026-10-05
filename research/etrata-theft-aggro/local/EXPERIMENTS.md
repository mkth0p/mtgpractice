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
