#!/bin/bash
# usage: tools/sim/azusa/bench.sh HERO GAMES_PER_PROC [NAME]
#   HERO: azusa (the repo list, baseline), azusa-v2 or azusa-v3. Each game: the hero against three Bracket 4 bots
#   (random4, the Azusa bot left out). Env: PROCS (default: all cores), OUT (default tools/sim/azusa/out).
#   Seeds are 1000 + k*N and the opponents depend on the process's first seed, so runs with the same PROCS and N
#   are paired game for game (same seeds, same opponents, same seats).
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; mkdir -p "$OUT"
HERO=$1; N=$2; NAME=${3:-$1}; P=${PROCS:-$(sysctl -n hw.ncpu 2>/dev/null || nproc)}
for ((k=0; k<P; k++)); do
  HERO=$HERO TELE_OUT="$OUT/$NAME-$k.tele.json" node "$D/wrap.js" --games "$N" --seed $((1000 + k*N)) --decks "$HERO,random4,random4,random4" --first random --json "$OUT/$NAME-$k.json" > "$OUT/$NAME-$k.log" 2>&1 &
done
wait
node "$D/summary.js" "$OUT" "$NAME"
