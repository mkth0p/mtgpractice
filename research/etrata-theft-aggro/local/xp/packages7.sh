#!/bin/bash
# seventh round, on the closer list (38 lands): copies that stack (legend rule off), myriad and a trigger copier, in place of basic lands
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export TELE=1 LIST_FILE=research/etrata-theft-aggro/local/lists/v2d-vamp.txt
until grep -q "PK6 DONE" /private/tmp/claude-501/-Users-glyphsek-Documents-mtg-todeletelater/2bffa6ea-465d-47c1-b0ca-fe8ba6b4c8d7/scratchpad/pk6.out 2>/dev/null; do sleep 15; done
X() { tools/sim/bench/xp.sh pk3-vamp38 "$1" "$2" > /dev/null; }
X pk7-mirror-rite '{"cut":["Island","Island"],"add":["Mirror Box","Rite of Replication"]}'
X pk7-saka-rite '{"cut":["Island","Island"],"add":["Sakashima of a Thousand Faces","Rite of Replication"]}'
X pk7-blade '{"cut":["Island"],"add":["Blade of Selves"]}'
X pk7-resonator '{"cut":["Island"],"add":["Strionic Resonator"]}'
X pk7-mirror '{"cut":["Island"],"add":["Mirror Box"]}'
X pk7-all5 '{"cut":["Island","Island","Island","Swamp","Swamp"],"add":["Mirror Box","Sakashima of a Thousand Faces","Rite of Replication","Blade of Selves","Strionic Resonator"]}'
echo PK7 DONE
