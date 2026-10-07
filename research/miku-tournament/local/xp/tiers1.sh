#!/bin/bash
# tiers1.sh: first tier candidates from owned cards (precon + 80€ plan), vs p2, 2,016 games per field.
# Cuts: the cut sweep's cards that beat a basic land on B4 without hurting B2. Adds: the best plan singles, or basics.
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
C5='"Song of the Worldsoul","Rhys the Redeemed","Excavation Technique","Phyrexian Processor","Song of Freyalise"'
C10="$C5"',"Growing Ranks","Prosperous Innkeeper","Ancient Cornucopia","Angelic Chorus","Camaraderie"'
C15="$C10"',"Springleaf Drum","Ajani'"'"'s Pridemate","Conclave Evangelist","Healing Technique","Silverquill Lecturer"'
A5='"Generous Gift","Arcane Signet","True Conviction","Elvish Mystic","Elspeth, Sun'"'"'s Champion"'
A10="$A5"',"Beast Within","Return of the Wildspeaker","Hero of Bladehold","Overwhelming Stampede","Adeline, Resplendent Cathar"'
run() { tools/sim/bench/xp.sh p2 "$1" "{\"cut\":[$2],\"add\":[$3]}" > /dev/null; }
run t5a "$C5" "$A5" &
run t5b "$C5" '"Generous Gift","Arcane Signet","True Conviction","Plains","Forest"' &
wait
run t10a "$C10" "$A10" &
run t10b "$C10" "$A5"',"Beast Within","Plains","Forest","Plains","Hero of Bladehold"' &
wait
run t15a "$C15" "$A10"',"Spike Feeder","Heliod, Sun-Crowned","Walking Ballista","Esika'"'"'s Chariot","Razorverge Thicket"' &
run t15b "$C15" "$A10"',"Plains","Forest","Plains","Forest","Spike Feeder"' &
run t15c "$C15" "$A10"',"Cathars'"'"' Crusade","Esika'"'"'s Chariot","Beastmaster Ascension","Razorverge Thicket","Brushland"' &
wait
