#!/bin/bash
# usage: tools/sim/gstorm/bench.sh LIST GAMES_PER_PROC [NAME] [POOL]
#   LIST: precon or a decklist file. POOL: b4 (default), b3, p2 or goldfish (see wrap.js).
#   Env: PROCS (default: all cores), OUT (default tools/sim/gstorm/out), VARIANT='{"cut":[...],"add":[...]}',
#   SEED0 (default 5000). Same PROCS, N, POOL and SEED0 = the same seeds, opponents and seats game for game.
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; mkdir -p "$OUT"
LIST=$1; N=$2; NAME=${3:-$1}; POOL=${4:-b4}; P=${PROCS:-$(sysctl -n hw.ncpu 2>/dev/null || nproc)}; S0=${SEED0:-5000}
for ((k=0; k<P; k++)); do
  POOL=$POOL LIST=$LIST TELE_OUT="$OUT/$NAME-$k.tele.json" node "$D/wrap.js" --games "$N" --seed $((S0 + k*N)) --decks "goblin-storm,random,random,random" --first random --json "$OUT/$NAME-$k.json" > "$OUT/$NAME-$k.log" 2>&1 &
done
wait
node "$D/summary.js" "$OUT" "$NAME" $BASE
