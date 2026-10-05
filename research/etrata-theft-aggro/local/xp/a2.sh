#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export TELE=1 LIST_FILE=research/etrata-theft-aggro/local/lists/skel-A2.txt
tools/sim/bench/xp.sh skA8 skA2-0 > /dev/null
tools/sim/bench/xp.sh skA2-0 hy-vamp '{"cut":["Hullcarver","Assassin Initiate","Poison-Blade Mentor","Aven Heartstabber"],"add":["Exquisite Blood","Sanguine Bond","Bloodthirsty Conqueror","Vito, Thorn of the Dusk Rose"]}' > /dev/null
NO_COMMANDER=1 tools/sim/bench/xp.sh skA2-0 skA2-nocmd > /dev/null
echo A2 DONE
