#!/bin/bash
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
export TELE=1
for v in v1-blitz v2-snowball v3-tempo; do LIST_FILE=research/etrata-theft-aggro/local/lists/$v.txt tools/sim/bench/xp.sh skA2-0 $v > /dev/null; done
echo VERSIONS1 DONE
