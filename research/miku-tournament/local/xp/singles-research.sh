#!/bin/bash
# singles-research.sh [CUT]: research candidates (../../sources/trostani-bracket4.md) one at a time into the precon, each for the
# same cut (default Invincible Hymn, the research's first cut), paired vs p1, 2,016 games per field.
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
CUT=${1:-Invincible Hymn}
for IN in "Scurry Oak" "Chord of Calling" "Eladamri's Call" "Worldly Tutor" "Enlightened Tutor" "Green Sun's Zenith" "Teferi's Protection" "Heroic Intervention" \
  "Flawless Maneuver" "Smothering Tithe" "Birds of Paradise" "Grand Abolisher" "Force of Vigor" "Esper Sentinel" "Lightning Greaves" "Selesnya Charm" "Sol Ring"; do
  [ "$IN" = "Sol Ring" ] && continue
  TAG=$(echo "$IN" | tr -cd 'A-Za-z0-9' | cut -c1-18)
  tools/sim/bench/xp.sh p1 "r-$TAG" "{\"cut\":[\"$CUT\"],\"add\":[\"$IN\"]}" > /dev/null
done
