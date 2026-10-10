#!/bin/bash
S=${OUT_DIR:-/tmp/mana-xp}
export N=400 NG=150
FLEX='"Brightglass Gearhulk","Vorinclex, Voice of Hunger","Kenrith'"'"'s Transformation","Blind Obedience","Formidable Speaker","Destiny Spinner"'
"$(dirname "$0")"/sweep.sh base ''
"$(dirname "$0")"/sweep.sh lands-3_draw+3 '{"cut":["Plains","Forest","Plains"],"add":["Tireless Tracker","Harmonize","Garruk'"'"'s Uprising"]}'
"$(dirname "$0")"/sweep.sh lands+3 '{"cut":["Brightglass Gearhulk","Vorinclex, Voice of Hunger","Kenrith'"'"'s Transformation"],"add":["Plains","Forest","Forest"]}'
"$(dirname "$0")"/sweep.sh ramp-4_draw+4 '{"cut":["Badgermole Cub","Delighted Halfling","Avacyn'"'"'s Pilgrim","Fyndhorn Elves"],"add":["Tireless Tracker","Harmonize","Garruk'"'"'s Uprising","Guardian Project"]}'
"$(dirname "$0")"/sweep.sh ramp+4 '{"cut":["Brightglass Gearhulk","Vorinclex, Voice of Hunger","Kenrith'"'"'s Transformation","Blind Obedience"],"add":["Arcane Signet","Three Visits","Farseek","Rampant Growth"]}'
"$(dirname "$0")"/sweep.sh draw+3 '{"cut":["Brightglass Gearhulk","Vorinclex, Voice of Hunger","Kenrith'"'"'s Transformation"],"add":["Tireless Tracker","Harmonize","Garruk'"'"'s Uprising"]}'
"$(dirname "$0")"/sweep.sh draw+6 '{"cut":["Brightglass Gearhulk","Vorinclex, Voice of Hunger","Kenrith'"'"'s Transformation","Blind Obedience","Formidable Speaker","Destiny Spinner"],"add":["Tireless Tracker","Harmonize","Garruk'"'"'s Uprising","Guardian Project","Beast Whisperer","Colossal Majesty"]}'
"$(dirname "$0")"/sweep.sh lands-3_ramp+3 '{"cut":["Plains","Forest","Plains"],"add":["Arcane Signet","Three Visits","Rampant Growth"]}'
"$(dirname "$0")"/sweep.sh lands-6_draw+6 '{"cut":["Plains","Forest","Plains","Forest","Dryad Arbor","Horizon Canopy"],"add":["Tireless Tracker","Harmonize","Garruk'"'"'s Uprising","Guardian Project","Beast Whisperer","Colossal Majesty"]}'
echo ALLDONE
