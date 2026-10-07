#!/bin/bash
# usage: sweep.sh BASE_NAME LIST_FILE CUT "Card A" "Card B" ...   one paired swap experiment per card (CUT -> card) against BASE_NAME
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
BASE=$1; export LIST_FILE=$2; CUT=$3; shift 3
for C in "$@"; do
  TAG=$(echo "$C" | tr -cd 'A-Za-z0-9' | cut -c1-18)
  tools/sim/bench/xp.sh "$BASE" "sw-$TAG" "{\"cut\":[\"$CUT\"],\"add\":[\"$C\"]}" > /dev/null
done
