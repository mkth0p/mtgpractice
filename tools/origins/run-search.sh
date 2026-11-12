#!/bin/bash
# Deck search for every Legendary, then the round robin with the searched lists added.
# Needs out/now-std.json (the round robin of the real lists). Steps whose output file exists are skipped,
# so the script can be stopped and started again.
#   bash tools/origins/run-search.sh
#   REFINE="three-not-so-little-pigs" bash tools/origins/run-search.sh    also tests every one-card change of
#                                                                         that Legendary's winner (refine.js)
cd "$(dirname "$0")/../.." || exit 1
T=tools/origins; O=$T/out
LEGENDS="three-not-so-little-pigs van-helsing dracula legion-of-the-dead king-arthur queen-of-hearts robin-hood merlin mulan dorothy wicked-stepmother dr-frank"
say() { echo "== $(date +%H:%M:%S) $*"; }
[ -f $O/field.json ] || node $T/field.js $O/now-std.json --out field.json
for L in $LEGENDS; do
  if [ ! -f $O/opt-$L.json ]; then
    say "search $L"
    node $T/optimize.js --legend $L --field out/field.json --gens ${GENS:-8} --pop ${POP:-48} --climb ${CLIMB:-1} --wide ${WIDE:-24} > $O/opt-$L.log 2>&1
    tail -2 $O/opt-$L.log
  fi
done
for L in $REFINE; do
  if [ ! -f $O/refine-$L.json ]; then
    say "one-card test $L"
    node $T/refine.js --legend $L > $O/refine-$L.log 2>&1
    tail -2 $O/refine-$L.log
  fi
done
say "collect"
node $T/collect.js
if [ ! -f $O/final-std.json ]; then
  say "round robin with the searched lists"
  node $T/matrix.js --n 50 --bot std --extra out/optimized.json --reuse out/now-std.json --out final-std.json | tail -50
fi
say "search stage done"
