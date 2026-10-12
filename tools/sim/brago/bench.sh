#!/bin/bash
# usage: tools/sim/brago/bench.sh LIST GAMES_PER_PROC [NAME] [OPP]
#   LIST: 1500, uncapped, v2 (MK.BRAGO_LISTS) or a decklist file. Each game: the Brago hero against three
#   Bracket 4 bots (random4, the Azusa and Brago bots left out: the Azusa bench's 7 bots), or OPP=goldfish
#   (three do-nothing decks). Env: PROCS (default: all cores), OUT (default tools/sim/brago/out),
#   VARIANT='{"cut":[...],"add":[...]}' (in-place swaps), SEED0 (default 1000).
#   Seeds are SEED0 + k*N and the opponents depend on the process's first seed, so runs with the same PROCS
#   and N are paired game for game (same seeds, same opponents, same seats). PROCS=18 N=600 is the Azusa
#   bench's setup (tools/sim/azusa/RESULTS.md); with PROCS=4 the games are the first 2,400 of it.
D=$(cd "$(dirname "$0")" && pwd); OUT=${OUT:-$D/out}; mkdir -p "$OUT"
LIST=$1; N=$2; NAME=${3:-$1}; OPP=${4:-random4}; P=${PROCS:-$(sysctl -n hw.ncpu 2>/dev/null || nproc)}; S0=${SEED0:-1000}
[ "$OPP" = goldfish ] && export GOLDFISH=1
for ((k=0; k<P; k++)); do
  LIST=$LIST TELE_OUT="$OUT/$NAME-$k.tele.json" node "$D/wrap.js" --games "$N" --seed $((S0 + k*N)) --decks "brago-hero,$OPP,$OPP,$OPP" --first random --json "$OUT/$NAME-$k.json" > "$OUT/$NAME-$k.log" 2>&1 &
done
wait
node "$D/summary.js" "$OUT" "$NAME" $BASE
