#!/bin/bash
# usage: tools/sim/brago/screen.sh BASE_NAME LIST N VARIANTS_FILE
#   Runs each variant in VARIANTS_FILE (lines "name<TAB>{json cut/add}") on LIST with PROCS (default 4) x N games,
#   paired against the run named BASE_NAME in OUT (run it first with bench.sh, same PROCS and N), and prints
#   each summary with the paired difference. Lines starting with # are skipped.
D=$(cd "$(dirname "$0")" && pwd); export OUT=${OUT:-$D/out}; export PROCS=${PROCS:-4}
BASE=$1; LIST=$2; N=$3; FILE=$4
while IFS=$'\t' read -r name json; do
  [ -z "$name" ] || [ "${name:0:1}" = "#" ] && continue
  VARIANT="$json" BASE="$BASE" "$D/bench.sh" "$LIST" "$N" "$name" ${OPP:-random4} | tee "$OUT/$name.summary.txt"
done < "$FILE"
