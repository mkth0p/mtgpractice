#!/bin/bash
# Follow-up runs once the round robin with the searched lists exists (out/final-std.json):
# the best list of each Legendary again with the strong bot and under other location pools, the bots against
# each other, the play guides, and the data file of the site. Steps whose output exists are skipped, so a run
# that was stopped can simply be started again. Each step writes its own log next to its output (out/<name>.log).
#   bash tools/origins/run-finish.sh
cd "$(dirname "$0")/../.." || exit 1
T=tools/origins; O=$T/out
say() { echo "== $(date +%H:%M:%S) $*"; }
# step <output file> <label> <command...>: runs the command with --out <output file> unless the output exists
step() {
  local out=$1 name=$2; shift 2
  [ -f $O/$out ] && return
  say "$name"
  "$@" --out $out > $O/${out%.json}.log 2>&1 || say "$name failed, see $O/${out%.json}.log"
}
node $T/report.js > /dev/null                       # writes out/reps.json: the best list per Legendary and the pick
M="node $T/matrix.js --n 50 --only none --extra out/reps.json"
step strong.json "strong bot" $M --bot strong
step sens-cup.json "tournament pool" $M --bot std --rules '{"cup":true}'
step sens-noloc.json "no locations" $M --bot std --rules '{"locations":false}'
step sens-flat.json "flat location odds" $M --bot std --rules '{"locOdds":false}'
# the two bot comparisons are kept under their own names in out/bots.json
has() { node -e "process.exit(require('./$O/bots.json')['$1'] ? 0 : 1)" 2>/dev/null; }
has std-fast || { say "bots: standard against fast"; node $T/botcheck.js --a '"std"' --b '"fast"' --pairs 120 --seeds 2 --save std-fast > $O/bots-std-fast.log 2>&1; }
has strong-std || { say "bots: strong against standard"; node $T/botcheck.js --a '"strong"' --b '"std"' --pairs 120 --seeds 2 --save strong-std > $O/bots-strong-std.log 2>&1; }
PICK=$(node -e "console.log(require('./$O/reps.json').pick)")
REAL=$(node -e "console.log(require('./$O/reps.json').nextReal || '')")
G="node $T/guide.js --field out/field.json --n 100 --bot std --mull ${MULL:-2000}"
step guide-1.json "guide $PICK" $G --deck out/final-std.json:$PICK
if [ -n "$REAL" ] && [ "$REAL" != "$PICK" ]; then step guide-2.json "guide $REAL" $G --deck out/final-std.json:$REAL; fi
say "report"
node $T/report.js
for f in strong sens-cup sens-noloc sens-flat bots guide-1; do [ -f $O/$f.json ] || say "missing: $O/$f.json"; done
say "finish stage done"
