#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export LIST_FILE=research/etrata-theft-aggro/local/lists/skel-A-halver.txt
for o in attack mulligan plan flips tutor choose; do HEIST_OFF=$o tools/sim/bench/xp.sh skA6 ab-$o > /dev/null; done
echo ABLATE1 DONE
