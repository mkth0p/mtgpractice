#!/bin/bash
# second package round on the finalist v2c (after the cut sweep): the freed slots spent on Ramses-independence ideas
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1 LIST_FILE=research/etrata-theft-aggro/local/lists/v2c.txt
C='"Kindred Discovery","Swiftfoot Boots","Mana Drain","Interceptor, Shadow'"'"'s Hound"'
tools/sim/bench/xp.sh v2c-base pk2-cuts6 '{"cut":["Kindred Discovery","Swiftfoot Boots","Mana Drain","Interceptor, Shadow'"'"'s Hound","Obelisk of Urd","Ghostly Flicker"],"add":["Island","Island","Island","Swamp","Swamp","Swamp"]}' > /dev/null
tools/sim/bench/xp.sh v2c-base pk2-evasion "{\"cut\":[$C],\"add\":[\"Levitation\",\"Archetype of Imagination\",\"Training Grounds\",\"Swamp\"]}" > /dev/null
tools/sim/bench/xp.sh v2c-base pk2-reach "{\"cut\":[$C],\"add\":[\"Hatred\",\"Blood Tribute\",\"Exsanguinate\",\"Rush of Dread\"]}" > /dev/null
tools/sim/bench/xp.sh v2c-base pk2-recur "{\"cut\":[$C],\"add\":[\"Patriarch's Bidding\",\"Kindred Dominance\",\"Shredder, Shadow Master\",\"Swamp\"]}" > /dev/null
tools/sim/bench/xp.sh v2c-base pk2-copies "{\"cut\":[$C],\"add\":[\"Auton Soldier\",\"Thieving Amalgam\",\"Vela the Night-Clad\",\"Swamp\"]}" > /dev/null
echo PK2 DONE
