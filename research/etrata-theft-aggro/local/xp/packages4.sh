#!/bin/bash
# fourth round: the new cards (Animate Dead, Necromancy, Helm of the Host, Irenicus's Vile Duplication) in place of basic lands of the 38-land lists
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1
export LIST_FILE=research/etrata-theft-aggro/local/lists/v2d.txt
tools/sim/bench/xp.sh pk2-cuts6 pk4-reanim '{"cut":["Island","Swamp"],"add":["Animate Dead","Necromancy"]}' > /dev/null
tools/sim/bench/xp.sh pk2-cuts6 pk4-helm '{"cut":["Island","Swamp"],"add":["Helm of the Host","Irenicus'"'"'s Vile Duplication"]}' > /dev/null
tools/sim/bench/xp.sh pk2-cuts6 pk4-all4 '{"cut":["Island","Island","Swamp","Swamp"],"add":["Animate Dead","Necromancy","Helm of the Host","Irenicus'"'"'s Vile Duplication"]}' > /dev/null
export LIST_FILE=research/etrata-theft-aggro/local/lists/v2d-vamp.txt
tools/sim/bench/xp.sh pk3-vamp38 pk4-vamp-all4 '{"cut":["Island","Island","Swamp","Swamp"],"add":["Animate Dead","Necromancy","Helm of the Host","Irenicus'"'"'s Vile Duplication"]}' > /dev/null
echo PK4 DONE
