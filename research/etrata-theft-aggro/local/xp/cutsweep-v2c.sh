#!/bin/bash
# cut sweep of the finalist: each nonland card of lists/v2c.txt replaced by a basic land, 2,016 paired games per field vs v2c-base
# usage: research/etrata-theft-aggro/local/xp/cutsweep-v2c.sh CARDS.tsv   (lines: "Card<TAB>Basic")
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export LIST_FILE=research/etrata-theft-aggro/local/lists/v2c.txt
while IFS=$'\t' read -r CARD BASIC; do
  [ -z "$CARD" ] && continue
  NAME="cut2c-$(echo "$CARD" | tr -cd '[:alnum:]' | cut -c1-20)"
  tools/sim/bench/xp.sh v2c-base "$NAME" "{\"cut\":[\"$CARD\"],\"add\":[\"$BASIC\"]}" > /dev/null
done < "$1"
echo CUT DONE
