#!/bin/bash
# usage: cutsweep.sh BASE_NAME LIST_FILE PREFIX [cards...]: for each nonland card of the list (or the cards given), a paired run with it
# replaced by a basic land (Swamp for black cards, Island otherwise) against BASE_NAME. Positive = the deck is better without it.
cd "$(dirname "$0")/../../../.."
source research/etrata-theft-aggro/local/xp/env.sh
BASE=$1; export LIST_FILE=$2; PFX=$3; shift 3
if [ $# -gt 0 ]; then CARDS=("$@"); else
  IFS=$'\n' CARDS=($(node -e '
    const fs=require("fs"),path=require("path"),dir=path.resolve("miku/game");require(dir+"/engine.js");require(dir+"/cards-miku.js");
    for(const f of fs.readdirSync(dir).filter(f=>/^(cards|decks|precon)-.*\.js$/.test(f)&&f!=="cards-miku.js").sort())require(path.join(dir,f));
    for(const l of fs.readFileSync(process.env.LIST_FILE,"utf8").split(/\n/)){const m=l.trim().match(/^1 (.+)$/);if(!m||m[1]==="Etrata, Deadly Fugitive")continue;const d=globalThis.MK.defs.get(m[1]);if(d&&!d.types.includes("Land"))console.log(m[1]);}'))
fi
for C in "${CARDS[@]}"; do
  TAG=$(echo "$C" | tr -cd 'A-Za-z0-9' | cut -c1-18)
  L=$(node -e 'const d=process.argv[1];console.log(/\{B\}/.test(d)?"Swamp":"Island")' "$(grep -h "name: \"$C\"" -A1 miku/game/*.js | grep -o 'cost: "[^"]*"' | head -1)")
  tools/sim/bench/xp.sh "$BASE" "$PFX-$TAG" "{\"cut\":[\"$C\"],\"add\":[\"$L\"]}" > /dev/null
done
