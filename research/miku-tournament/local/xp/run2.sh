#!/bin/bash
# run2.sh: after the Storm Herd guard (brain change): new base p3, the tiers again (u* vs p3), then the research singles (r-* vs p3)
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
tools/sim/bench/xp.sh p2 p3 > /dev/null
research/miku-tournament/local/xp/tiers2.sh
research/miku-tournament/local/xp/singles-research.sh
