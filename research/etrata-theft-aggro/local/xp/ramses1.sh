#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export LIST_FILE=research/etrata-theft-aggro/local/lists/skel-A-halver.txt
X() { tools/sim/bench/xp.sh skA7 "$@" > /dev/null; }
X rm-copies '{"cut":["Mothdust Changeling","Hookblade Veteran"],"add":["Auton Soldier","Sakashima the Impostor"]}'
X rm-polarity-monument '{"cut":["Mothdust Changeling","Hookblade Veteran"],"add":["Reverse the Polarity","Eldrazi Monument"]}'
X rm-wingedboots '{"cut":["Mothdust Changeling"],"add":["Winged Boots"]}'
X rm-dhg '{"cut":["Mothdust Changeling"],"add":["Dimir House Guard"]}'
X rm-noVault '{"cut":["Mana Vault"],"add":["Island"]}'
echo RAMSES1 DONE
