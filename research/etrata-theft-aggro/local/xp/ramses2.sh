#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export LIST_FILE=research/etrata-theft-aggro/local/lists/skel-A-halver.txt
X() { tools/sim/bench/xp.sh skA7 "$@" > /dev/null; }
X ra-consult '{"cut":["Mothdust Changeling"],"add":["Demonic Consultation"]}'
X ra-flesh '{"cut":["Mothdust Changeling"],"add":["Fleshwrither"]}'
X ra-pyre '{"cut":["Mothdust Changeling"],"add":["Pyre of Heroes"]}'
X ra-all3 '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles"],"add":["Demonic Consultation","Fleshwrither","Pyre of Heroes"]}'
X ra-best4 '{"cut":["Mothdust Changeling","Hookblade Veteran","Desmond Miles","Mana Vault"],"add":["Reverse the Polarity","Eldrazi Monument","Thieving Amalgam","Island"]}'
echo RAMSES2 DONE
