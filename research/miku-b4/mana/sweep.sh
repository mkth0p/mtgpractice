#!/bin/bash
# sweep.sh NAME VARIANT_JSON : 4 procs x N games vs random4 and 4 x NG goldfish, mana telemetry
cd "$(dirname "$0")/../../../tools/sim/bench"
NAME=$1; V=$2; N=${N:-500}; NG=${NG:-250}; O=${OUT_DIR:-/tmp/mana-xp}; mkdir -p $O
for k in 0 1 2 3; do
  VARIANT="$V" MANA_OUT=$O/$NAME-b4-$k.json DECK_CONST=${DECK_CONST:-CORRUPTED_DECK} TELE_HERO=${HERO:-corrupted} node wrap.js --games $N --seed $((1000+k*N)) --decks ${HERO:-corrupted},random4,random4,random4 --first random > $O/$NAME-b4-$k.log 2>&1 &
done; wait
for k in 0 1 2 3; do
  GOLDFISH=1 VARIANT="$V" MANA_OUT=$O/$NAME-gf-$k.json DECK_CONST=${DECK_CONST:-CORRUPTED_DECK} TELE_HERO=${HERO:-corrupted} node wrap.js --games $NG --seed $((5000+k*NG)) --decks ${HERO:-corrupted},goldfish,goldfish,goldfish --first random --max-turns 60 > $O/$NAME-gf-$k.log 2>&1 &
done; wait
echo "$NAME done $(date +%T)"
