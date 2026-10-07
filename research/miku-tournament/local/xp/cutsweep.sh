#!/bin/bash
# cutsweep.sh PREFIX [cards...]: each nonland card of the precon (or the cards given) replaced by a basic land
# (Plains if the card has more {W} than {G} pips, else Forest), paired vs p1. Positive = the deck is better without it.
cd "$(dirname "$0")/../../../.."
source research/miku-tournament/local/xp/env.sh
PFX=$1; shift
if [ $# -gt 0 ]; then CARDS=("$@"); else
  IFS=$'\n' CARDS=($(node -e '
    const fs=require("fs"),path=require("path"),dir=path.resolve("miku/game");require(dir+"/engine.js");require(dir+"/cards-miku.js");
    for(const f of fs.readdirSync(dir).filter(f=>/^(cards|decks|precon)-.*\.js$/.test(f)&&f!=="cards-miku.js").sort())require(path.join(dir,f));
    for(const n of new Set(globalThis.MK.MIKU_PRECON_DECK.list)){const d=globalThis.MK.defs.get(n);if(!d.types.includes("Land"))console.log(n);}'))
fi
for C in "${CARDS[@]}"; do
  TAG=$(echo "$C" | tr -cd 'A-Za-z0-9' | cut -c1-18)
  L=$(node -e 'const fs=require("fs"),path=require("path"),dir=path.resolve("miku/game");require(dir+"/engine.js");require(dir+"/cards-miku.js");
    for(const f of fs.readdirSync(dir).filter(f=>/^(cards|decks|precon)-.*\.js$/.test(f)&&f!=="cards-miku.js").sort())require(path.join(dir,f));
    const c=globalThis.MK.defs.get(process.argv[1]).cost||"";const w=(c.match(/W/g)||[]).length,g=(c.match(/G/g)||[]).length;console.log(w>g?"Plains":"Forest")' "$C")
  tools/sim/bench/xp.sh p1 "$PFX-$TAG" "{\"cut\":[\"$C\"],\"add\":[\"$L\"]}" > /dev/null
done
