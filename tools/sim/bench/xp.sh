#!/bin/bash
# usage: tools/sim/bench/xp.sh BASE NAME [VARIANT_JSON]   one paired experiment for the hero deck against both fields:
#   benches NAME-b2 and NAME-b4 (N games per process, PROCS processes) and prints its win rate and the paired
#   difference against BASE-b2 / BASE-b4. Env as bench.sh (HERO, DECK_CONST, HERO_NAME, LIST_FILE, NO_COMMANDER, COMMANDER, N).
#   Appends one line per field to $XPLOG (default research/etrata-theft-aggro/local/xp/xp.log).
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; N=${N:-112}
BASE=$1; NAME=$2; V="$3"; LOG=${XPLOG:-$D/../../../research/etrata-theft-aggro/local/xp/xp.log}
for F in b2 b4; do
  OPP=$([ $F = b2 ] && echo random2 || echo random4)
  S=$("$D/bench.sh" "$NAME-$F" "$N" "$OPP" "$V" | tail -1)
  P=$( [ "$BASE" != "$NAME" ] && node "$D/paired.js" "$OUT" "$BASE-$F" "$NAME-$F" --hero "${HERO_NAME:-Etrata Heist}" | tail -1)
  T=$( [ -n "$TELE" ] && node "$D/telesum.js" "$OUT" "$NAME-$F" | sed -n 1,2p | tr '\n' ' ')
  echo "$(date +%H:%M) $NAME-$F | ${LIST_FILE:+list=$(basename "$LIST_FILE") }${NO_COMMANDER:+NO_COMMANDER }${COMMANDER:+COMMANDER=\"$COMMANDER\" }${HEIST_ON:+HEIST_ON=$HEIST_ON }${HEIST_OFF:+HEIST_OFF=$HEIST_OFF }${HEIST_TUTOR:+HEIST_TUTOR=$HEIST_TUTOR }${V:+variant=$V }| $S | vs $BASE: $P" | tee -a "$LOG"
  if [ -n "$T" ]; then echo "    tele: $T" | tee -a "$LOG"; fi
done
