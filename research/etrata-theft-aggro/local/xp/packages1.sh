#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
A=research/etrata-theft-aggro/local/lists/skel-A-halver.txt
X() { tools/sim/bench/xp.sh skA6 "$@" > /dev/null; }
LIST_FILE=$A X pk-gate '{"cut":["Mothdust Changeling"],"add":["Dolmen Gate"]}'
LIST_FILE=$A X pk-haunt '{"cut":["Mothdust Changeling"],"add":["Haunted One"]}'
LIST_FILE=$A X pk-hauntgate '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles"],"add":["Haunted One","Dolmen Gate","Arcane Adaptation"]}'
LIST_FILE=$A HEIST_ON=copyEtrata X pk-etratas '{"cut":["Mothdust Changeling"],"add":["Auton Soldier"]}'
LIST_FILE=$A X pk-turns '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles","Basim Ibn Ishaq"],"add":["Genji Glove","Time Warp","Temporal Manipulation","Notorious Throng"]}'
LIST_FILE=$A X pk-evasion '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles"],"add":["Eldrazi Monument","Archetype of Imagination","Levitation"]}'
LIST_FILE=$A HEIST_ON=kit X pk-kit
LIST_FILE=research/etrata-theft-aggro/local/lists/skel-C-unblockable.txt X pk-skC
echo PACKAGES1 DONE
