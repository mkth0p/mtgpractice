#!/bin/bash
# run3.sh (18:00): the Storm Herd guard now really applies (lazy patch), so: base p4, every tier candidate vs p4 (v*), the
# research singles vs p4 (r-*, each for Song of the Worldsoul), two experiments at a time. All owned-card tiers use the
# cut sweep's cuts; adds are plan cards (owned) or basics.
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
tools/sim/bench/xp.sh p3 p4 > /dev/null
Q="'"
C5='"Song of the Worldsoul","Rhys the Redeemed","Excavation Technique","Phyrexian Processor","Song of Freyalise"'
C10="$C5"',"Growing Ranks","Prosperous Innkeeper","Ancient Cornucopia","Angelic Chorus","Camaraderie"'
C15="$C10"',"Springleaf Drum","Ajani'$Q's Pridemate","Conclave Evangelist","Healing Technique","Silverquill Lecturer"'
A5='"Generous Gift","Arcane Signet","True Conviction","Elvish Mystic","Elspeth, Sun'$Q's Champion"'
A10="$A5"',"Beast Within","Return of the Wildspeaker","Hero of Bladehold","Overwhelming Stampede","Adeline, Resplendent Cathar"'
B10='"Generous Gift","Arcane Signet","True Conviction","Elvish Mystic","Elspeth, Sun'$Q's Champion","Beast Within","Plains","Forest","Plains","Hero of Bladehold"'
run() { tools/sim/bench/xp.sh p4 "$1" "{\"cut\":[$2],\"add\":[$3]}" > /dev/null; }
run v5a "$C5" "$A5" & run v5b "$C5" '"Generous Gift","Arcane Signet","True Conviction","Plains","Forest"' & wait
run v5c "$C5" '"Generous Gift","Arcane Signet","True Conviction","Elvish Mystic","Plains"' & run v10a "$C10" "$A10" & wait
run v10b "$C10" "$B10" & run v10c "$C10" '"Generous Gift","Arcane Signet","True Conviction","Plains","Forest","Beast Within","Elvish Mystic","Elspeth, Sun'$Q's Champion","Hero of Bladehold","Plains"' & wait
run v15a "$C15" "$A10"',"Spike Feeder","Heliod, Sun-Crowned","Walking Ballista","Esika'$Q's Chariot","Razorverge Thicket"' & run v15b "$C15" "$A10"',"Plains","Forest","Plains","Forest","Spike Feeder"' & wait
run v15c "$C15" "$A10"',"Cathars'$Q' Crusade","Esika'$Q's Chariot","Beastmaster Ascension","Razorverge Thicket","Brushland"' & run v15d "$C15" "$B10"',"Return of the Wildspeaker","Overwhelming Stampede","Adeline, Resplendent Cathar","Esika'$Q's Chariot","Cathars'$Q' Crusade"' & wait
run v15e "$C15" "$A10"',"Plains","Forest","Esika'$Q's Chariot","Razorverge Thicket","Brushland"' & wait
# research singles (buy-today cards), two at a time
set -- "Scurry Oak" "Chord of Calling" "Eladamri's Call" "Worldly Tutor" "Enlightened Tutor" "Green Sun's Zenith" "Teferi's Protection" "Heroic Intervention" "Flawless Maneuver" "Smothering Tithe" "Birds of Paradise" "Grand Abolisher" "Force of Vigor" "Esper Sentinel" "Lightning Greaves" "Selesnya Charm"
while [ $# -gt 0 ]; do
  for IN in "$1" "${2:-}"; do [ -z "$IN" ] && continue; TAG=$(echo "$IN" | tr -cd 'A-Za-z0-9' | cut -c1-18)
    tools/sim/bench/xp.sh p4 "r-$TAG" "{\"cut\":[\"Song of the Worldsoul\"],\"add\":[\"$IN\"]}" > /dev/null & done
  wait; shift; [ $# -gt 0 ] && shift
done
