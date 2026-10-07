#!/bin/bash
# Bracket-4-only cut sweep of the recommended list (lists/v2f-vamp.txt): each nonland card -> a basic land, 2,016 paired games vs the B4 field only
# usage: research/etrata-theft-aggro/local/xp/cutsweep-b4.sh CARDS.tsv   (lines: "Card<TAB>Basic"); rows go to xp.log as "cutb4-<card>-b4"
cd "$(dirname "$0")/../../../.." && source research/etrata-theft-aggro/local/xp/env.sh && export LIST_FILE=research/etrata-theft-aggro/local/lists/v2f-vamp.txt
D=tools/sim/bench; LOG=research/etrata-theft-aggro/local/xp/xp.log; N=${N:-112}
S=$($D/bench.sh cutb4-base-b4 $N random4 | tail -1); echo "$(date +%H:%M) cutb4-base-b4 | list=v2f-vamp.txt | $S | vs none: " >> $LOG
while IFS=$'\t' read -r CARD BASIC; do
  [ -z "$CARD" ] && continue
  NAME="cutb4-$(echo "$CARD" | tr -cd '[:alnum:]' | cut -c1-20)"
  V="{\"cut\":[\"$CARD\"],\"add\":[\"$BASIC\"]}"
  S=$($D/bench.sh "$NAME-b4" $N random4 "$V" | tail -1)
  P=$(node $D/paired.js $D/out cutb4-base-b4 "$NAME-b4" --hero "${HERO_NAME:-Etrata Heist}" | tail -1)
  echo "$(date +%H:%M) $NAME-b4 | list=v2f-vamp.txt variant=$V | $S | vs cutb4-base: $P" >> $LOG
done < "$1"
echo CUTB4 DONE
