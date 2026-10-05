#!/bin/bash
# usage: tools/sim/bench/bench.sh NAME GAMES_PER_PROC OPP [VARIANT_JSON]
#   OPP: random2 (Bracket 2 precons) or random4 (Bracket 4 bots). Env: PROCS (default 4), HERO (default corrupted-etrata),
#   plus wrap.js's LIST_FILE / DECK_CONST / NO_COMMANDER. Seeds are 1000 + k*N, so equal NAME-independent runs pair up.
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; mkdir -p "$OUT"
NAME=$1; N=$2; OPP=$3; export VARIANT="$4"; P=${PROCS:-4}; HERO=${HERO:-corrupted-etrata}
for ((k=0; k<P; k++)); do
  node "$D/wrap.js" --games "$N" --seed $((1000 + k*N)) --decks "$HERO,$OPP,$OPP,$OPP" --first random --json "$OUT/$NAME-$k.json" > "$OUT/$NAME-$k.log" 2>&1 &
done
wait
node "$D/summary.js" "$OUT" "$NAME"
