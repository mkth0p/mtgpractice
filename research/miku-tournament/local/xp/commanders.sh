#!/bin/bash
# commanders.sh: the same 100 cards with another legendary creature of the precon as the commander (Trostani takes its slot
# in the 99), paired vs p1. Shalai is the only other Miku printing with a green-white identity ({4}{G}{G} ability).
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
export TELE=1
for C in "Shalai, Voice of Plenty" "Lathiel, the Bounteous Dawn" "Ghalta and Mavren" "Rhys the Redeemed"; do
  TAG=$(echo "$C" | tr -cd 'A-Za-z0-9' | cut -c1-14)
  COMMANDER="$C" tools/sim/bench/xp.sh p1 "cmd-$TAG" > /dev/null
done
