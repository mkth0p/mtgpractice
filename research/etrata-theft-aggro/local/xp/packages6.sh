#!/bin/bash
# sixth round, on the closer list (38 lands): the snowball axis with cards the engine already has, each in place of basic lands
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1 LIST_FILE=research/etrata-theft-aggro/local/lists/v2d-vamp.txt
X() { tools/sim/bench/xp.sh pk3-vamp38 "$1" "$2" > /dev/null; }
X pk6-coat '{"cut":["Island","Island"],"add":["Cryptic Coat","Scroll of Fate"]}'
X pk6-draw '{"cut":["Island","Island"],"add":["Reconnaissance Mission","Coastal Piracy"]}'
X pk6-bident '{"cut":["Island"],"add":["Bident of Thassa"]}'
X pk6-wound '{"cut":["Swamp"],"add":["Wound Reflection"]}'
X pk6-dstrike '{"cut":["Island"],"add":["Fireshrieker"]}'
X pk6-cover '{"cut":["Swamp"],"add":["Cover of Darkness"]}'
X pk6-tg '{"cut":["Island"],"add":["Training Grounds"]}'
HEIST_ON=flipFirst X pk6-tg-flipfirst '{"cut":["Island"],"add":["Training Grounds"]}'
X pk6-silencer '{"cut":["Swamp"],"add":["Etrata, the Silencer"]}'
X pk6-dominance '{"cut":["Swamp"],"add":["Kindred Dominance"]}'
X pk6-levitation '{"cut":["Island"],"add":["Levitation"]}'
echo PK6 DONE
