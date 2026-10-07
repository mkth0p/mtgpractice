#!/bin/bash
# usage: tools/sim/bench/bench.sh NAME GAMES_PER_PROC OPP [VARIANT_JSON]
#   OPP: random2 (Bracket 2 precons) or random4 (Bracket 4 bots). Env: PROCS (default 4), HERO (default corrupted-etrata),
#   HERO_NAME (the hero's seat name for the summary, default "Corrupted Etrata"), TELE=1 (per-game telemetry to
#   OUT/NAME-k.tele.json, see tele.js), plus wrap.js's LIST_FILE / DECK_CONST / NO_COMMANDER.
#   Seeds are 1000 + k*N and the opponents depend on the process's first seed, so keep PROCS and N the same
#   for runs you pair.
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; mkdir -p "$OUT"
NAME=$1; N=$2; OPP=$3; export VARIANT="$4"; P=${PROCS:-4}; HERO=${HERO:-corrupted-etrata}
for ((k=0; k<P; k++)); do
  TELE_OUT=$([ -n "$TELE" ] && echo "$OUT/$NAME-$k.tele.json") node "$D/wrap.js" --games "$N" --seed $((1000 + k*N)) --decks "$HERO,$OPP,$OPP,$OPP" --first random --json "$OUT/$NAME-$k.json" > "$OUT/$NAME-$k.log" 2>&1 &
done
wait
node "$D/summary.js" "$OUT" "$NAME" "${HERO_NAME:-Corrupted Etrata}"
