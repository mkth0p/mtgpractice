#!/bin/bash
# packages1.sh: the combo pieces as packages (single pieces measured negative alone), plan pairings for the cuts, vs p1.
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
export TELE=1
tools/sim/bench/xp.sh p1 pk-HB '{"cut":["Pest Infestation","Phyrexian Processor"],"add":["Heliod, Sun-Crowned","Walking Ballista"]}' > /dev/null
tools/sim/bench/xp.sh p1 pk-HBF '{"cut":["Pest Infestation","Phyrexian Processor","Suture Priest"],"add":["Heliod, Sun-Crowned","Walking Ballista","Spike Feeder"]}' > /dev/null
tools/sim/bench/xp.sh p1 pk-top6 '{"cut":["Rhys the Redeemed","Ancient Cornucopia","Silverquill Lecturer","Explore","Idol of Oblivion","Gruff Triplets"],"add":["Generous Gift","Arcane Signet","True Conviction","Elvish Mystic","Craterhoof Behemoth","Elspeth, Sun'"'"'s Champion"]}' > /dev/null
