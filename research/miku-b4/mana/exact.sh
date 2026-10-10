#!/bin/bash
# The exact pass 2 lists in the engine (no stand-ins since cards-miku-b4.js): Shalai through the Corrupted Miku
# deck and brain, Brago through MK.BRAGO_DECK and its brain. Same seeds and sizes as variants.sh.
D="$(cd "$(dirname "$0")/.." && pwd)"
export N=${N:-400} NG=${NG:-150}
LIST_FILE=$D/decklist-shalai-uncapped.txt "$(dirname "$0")"/sweep.sh shalai-exact ''
LIST_FILE=$D/decklist-shalai-1500.txt "$(dirname "$0")"/sweep.sh shalai1500-exact ''
HERO=brago DECK_CONST=BRAGO_DECK LIST_FILE=$D/decklist-brago-uncapped.txt "$(dirname "$0")"/sweep.sh brago-exact ''
HERO=brago DECK_CONST=BRAGO_DECK LIST_FILE=$D/decklist-brago-1500.txt "$(dirname "$0")"/sweep.sh brago1500-exact ''
echo ALLDONE
