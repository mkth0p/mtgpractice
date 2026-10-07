#!/bin/bash
# singles-plans.sh: every swap of the two site upgrade plans, one at a time into the precon (paired vs p1, 2,016 games per field).
# Pairings: the 80€ plan's (BUDGET_SWAPS in cards-miku-precon.js) where it has the card, else the full plan's (SWAPS).
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
while IFS='|' read -r OUT IN; do
  [ -z "$OUT" ] && continue
  TAG=$(echo "$IN" | tr -cd 'A-Za-z0-9' | cut -c1-18)
  tools/sim/bench/xp.sh p1 "s-$TAG" "{\"cut\":[\"$OUT\"],\"add\":[\"$IN\"]}" > /dev/null
done <<'LIST'
Congregate|Overwhelming Stampede
Invincible Hymn|Beastmaster Ascension
Boon Reflection|Intangible Virtue
Healing Technique|Beast Within
Arasta of the Endless Web|Adeline, Resplendent Cathar
Suture Priest|Spike Feeder
Mirari's Wake|Avenger of Zendikar
Gruff Triplets|Elspeth, Sun's Champion
Song of Freyalise|Esika's Chariot
Ancient Cornucopia|Arcane Signet
Explore|Elvish Mystic
Silverquill Lecturer|True Conviction
Angel of Indemnity|Return of the Wildspeaker
Rhys the Redeemed|Generous Gift
Temple of Plenty|Razorverge Thicket
Pest Infestation|Heliod, Sun-Crowned
Phyrexian Processor|Walking Ballista
Storm Herd|Cathars' Crusade
Growing Ranks|Hero of Bladehold
Crested Sunmare|Triumph of the Hordes
Radiant Fountain|Brushland
Sapseep Forest|Scattered Groves
Idol of Oblivion|Craterhoof Behemoth
Mirari's Wake|Jazal Goldmane
Angelic Chorus|Mirror Entity
Silverquill Lecturer|Crashing Drawbridge
Seraph Sanctuary|Plains
LIST
