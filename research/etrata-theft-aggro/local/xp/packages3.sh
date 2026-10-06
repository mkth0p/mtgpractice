#!/bin/bash
# third round: on v2d (= v2c with six cards replaced by basic lands, 38 lands): more lands still? the ideas at 38 lands? the closer list with the same cuts
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1
export LIST_FILE=research/etrata-theft-aggro/local/lists/v2d.txt
C='"Force of Will","Cyclonic Rift","Force of Negation","Mystic Remora"'
tools/sim/bench/xp.sh pk2-cuts6 pk3-lands42 "{\"cut\":[$C],\"add\":[\"Island\",\"Island\",\"Swamp\",\"Swamp\"]}" > /dev/null
tools/sim/bench/xp.sh pk2-cuts6 pk3-recur38 "{\"cut\":[$C],\"add\":[\"Patriarch's Bidding\",\"Kindred Dominance\",\"Shredder, Shadow Master\",\"Auton Soldier\"]}" > /dev/null
tools/sim/bench/xp.sh pk2-cuts6 pk3-evasion38 "{\"cut\":[$C],\"add\":[\"Levitation\",\"Archetype of Imagination\",\"Training Grounds\",\"Thieving Amalgam\"]}" > /dev/null
export LIST_FILE=research/etrata-theft-aggro/local/lists/v2d-vamp.txt
tools/sim/bench/xp.sh v2c-vamp pk3-vamp38 > /dev/null
echo PK3 DONE
