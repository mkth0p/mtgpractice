#!/bin/bash
# fifth round: aristocrat drains (the stolen 2/2s die to the altar and drain the table) in place of basic lands of the 38-land list
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1 LIST_FILE=research/etrata-theft-aggro/local/lists/v2d.txt
tools/sim/bench/xp.sh pk2-cuts6 pk5-aristo3 '{"cut":["Island","Swamp","Swamp"],"add":["Zulaport Cutthroat","Blood Artist","Bastion of Remembrance"]}' > /dev/null
tools/sim/bench/xp.sh pk2-cuts6 pk5-aristo4 '{"cut":["Island","Island","Swamp","Swamp"],"add":["Zulaport Cutthroat","Blood Artist","Bastion of Remembrance","Falkenrath Noble"]}' > /dev/null
export LIST_FILE=research/etrata-theft-aggro/local/lists/v2d-vamp.txt
tools/sim/bench/xp.sh pk3-vamp38 pk5-vamp-aristo3 '{"cut":["Island","Swamp","Swamp"],"add":["Zulaport Cutthroat","Blood Artist","Bastion of Remembrance"]}' > /dev/null
echo PK5 DONE
