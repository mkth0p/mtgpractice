# Miku Commander engine: how to add cards and decks

The game on the Play tab is a small Commander rules engine written in plain JavaScript. The same
files run in the browser and in Node, so every deck can be tested with thousands of bot games
before anyone plays it.

| File | What it holds |
| --- | --- |
| `engine.js` | Rules: zones, the stack, mana payment, combat, triggers, state-based actions. |
| `cards-miku.js` | All 88 cards of the Miku deck (Trostani) and `MK.MIKU_DECK`. The best examples to copy. |
| `decks-*.js` | One file per bot deck: its card definitions and one entry in `MK.BOT_DECKS`. |
| `ai.js` | The bots. Generic rules of thumb plus the per-card hints described below. |
| `game-ui.js`, `game.css` | The table on the page. |
| `../../tools/sim/run.js` | Headless bot games with invariant checks. |

Load order in the page and in the sim: `engine.js`, `cards-miku.js`, `decks-*.js` (alphabetical), `ai.js`.

## What the engine simplifies

`MK.SIMPLIFICATIONS` in `engine.js` is the list shown to players. The ones that matter when you write
a card:

- Mana is paid automatically from untapped sources. Players never tap lands by hand.
- Only spells use the stack. Activated and triggered abilities resolve right away (triggers after the
  action that caused them, newest first, active player's last).
- Players get a response window when an opponent casts a spell, after blockers are declared, and at
  the end of each other player's turn.
- A commander that would go to the graveyard or exile goes back to the command zone.
- No layers beyond: base P/T (card, `cda`, animation), set-base effects (Mirror Entity), counters,
  then static and until-end-of-turn modifications.
- Not supported: extra turns, extra combat phases, phasing, protection from colors, control-changing
  effects that last longer than a turn, sagas, split second, cycling from hand, replacement effects
  other than the ones listed under statics. Pick another card, or write a simplified version and say
  how in the card's `note`.

## Defining a card

```js
const D = MK.defineOnce;          // bot files: first definition of a name wins (staples are shared)
D({
  name: "Goblin Bombardment",     // exact Oracle name (the UI fetches art from Scryfall by name)
  cost: "{1}{R}",                 // mana cost; "" or omit for lands
  type: "Enchantment",            // full type line, "Legendary Creature — Goblin Warrior"
  pt: "2/2",                      // creatures and vehicles; "*/*" when a cda sets it
  text: "Sacrifice a creature: Goblin Bombardment deals 1 damage to any target.",  // Oracle text, shown on the card
  note: "optional: how the engine simplifies this card",
  keywords: ["flying", "haste"],  // lower-case evergreen keywords
  ...
});
```

Keywords the engine understands: flying, reach, trample, haste, vigilance, lifelink, deathtouch,
first strike, double strike, menace, hexproof, shroud, indestructible, defender, infect, flash,
convoke, shadow, and the landwalks (forestwalk...). Anything else in `keywords` is only a label.

### Triggers

```js
triggers: [{
  on: "enters",                                  // event name, see the table below
  self: true,                                    // only when ev.o is this object
  when: (g, src, ev) => ev.p === src.controller, // filter; runs when the event happens
  intervening: (g, src, ev) => true,             // "if" clause, checked again on resolution
  zone: "graveyard",                             // listen from graveyard or command zone (default battlefield)
  optional: "Draw a card?",                      // "you may": asks the controller first
  late: true,                                    // resolve after the other simultaneous triggers
                                                 // (battle cry, "attacking creatures get +X/+X")
  do: async (g, src, ev, { p }) => { g.draw(p, 1); }
}]
```

| Event | ev fields |
| --- | --- |
| `enters` | o, p (controller), token, batch |
| `dies` | o, lki (power, toughness, counters, controller, attached, colors, types, subtypes), p |
| `leaves` | o, lki, p, to ("graveyard", "exile", "hand", "library") |
| `sacrifice` | o, p (fires just before the object goes to the graveyard) |
| `cast` | p, o, item (item.targets, item.x, item.storm = spells cast before it this turn) |
| `countered` | item, by |
| `gainLife` / `loseLife` | p, amount, src |
| `damage` | src, target, amount, combat, toPlayer |
| `combatDamagePlayer` | src (the creature), p (player hit), amount |
| `counters` | o, kind, n, src |
| `draw` / `discard` | p, o |
| `landPlayed`, `tapForMana` | o, p |
| `upkeep`, `drawStep`, `endStep`, `beginCombat`, `endCombat` | p (the active player) |
| `attack` | p, attackers (once per combat: "whenever you attack") |
| `attacks` | o, target, p (once per attacking creature) |
| `blocks` | o (blocker), attacker, p; `blocked`: o (attacker), blockers |
| `playerLost` | p |

A leaves-the-battlefield trigger of the object itself still fires (it uses `ev.lki`).

### Activated abilities

```js
abilities: [{
  label: "Deal 1 damage",               // button text, short
  cost: "{2}{R}",                       // mana part; "{X}" works
  tap: true,                            // {T} (creatures need to have been there since the turn began)
  timing: "sorcery",                    // default is any time you could cast an instant
  loyalty: -3,                          // planeswalker ability (+1, 0, -3); once per turn, sorcery speed
  once: true,                           // once each turn
  condition: (g, o, p) => true,
  removeCounters: { kind: "p1", n: 1 }, // "Remove a +1/+1 counter from ~"
  payLife: 2,
  sacSelf: true, exileSelf: true,
  sacCost: { filter: (g, c, src) => c.controller === src.controller && g.isCreature(c), prompt: "Sacrifice a creature" },
  tapCreatures: 2, untapCreatures: 1, discard: 1,
  targets: [spec],                      // see target specs
  minX: 1, xFrom: (g, ctx) => n,        // X chosen by the player, or computed from the targets
  do: async (g, src, ctx) => { /* ctx.p, ctx.targets, ctx.legal[i], ctx.x, ctx.kws (keywords before costs) */ },
  ai: { use: (g, p, o, { window, turnOf }) => false }   // see bot hints
}]
```

`gyAbilities` are the same but work from the graveyard (eternalize, encore, unearth).
Equipment: `equip: "{2}"` adds the equip ability; statics use `s.attachedTo === o`.
Vehicles: `crew: 3` and `pt`. Classes: `levels: [{statics}, {cost, triggers}, {cost, onLevel}]`.
Rooms: `doors: [{name, cost, statics}, ...]`. Auras: `aura: true, enchant: "creature", targets: [spec]`,
then statics with `s.attachedTo === o`.

### Mana abilities

```js
mana: [{ tap: true, produce: "G" }]            // "GG" makes both, ["G","W"] makes one of them
mana: [{ tap: true, produce: "any" }]          // any color in the commander's identity
mana: [{ tap: true, cost: "{1}", produce: "UR" }]
mana: [{ tap: true, produce: "CC", condition: (g, o) => true }]
mana: [{ tap: true, sacSelf: true, produce: "any5", last: true }]   // Treasure: used last
mana: [{ tap: true, tapCreature: 1, produce: "any5" }]               // Springleaf Drum
```

Several mana abilities on one permanent are alternatives (only one per tap). Lands with
`doublesLandMana` on the battlefield (Vorinclex) are counted twice. A mana ability with another
cost (sacrifice a Goblin, pay life) can't be used by auto-payment: write it as a normal activated
ability that adds to `ctx.p.pool` (the pool empties at the end of each step and phase).

### Spells

```js
spell: {
  targets: [{ kind: "creature", purpose: "harm", prompt: "Destroy" }],
  do: async (g, ctx) => { if (ctx.legal[0]) g.destroy(ctx.targets[0]); }   // ctx: p, o, targets, legal, x, item, kicked
}
modes: [{ label: "Draw two", do }, { label: "...", targets: [...], do }]   // "choose one"
kicker: "{2}", flashback: "{3}{U}", minX: 1,
altCosts: [{ label: "Free", cost: "", condition: (g, p, o) => bool, payLife: 1, exileFromHand: { filter: (g, c) => bool, prompt } }]
cantBeCountered: true, canCast: (g, p, o) => bool, costReduce: (g, p, o) => n, onCast: async (g, p, o, item) => {}
```

A spell whose only targets are all illegal on resolution does nothing. Check `ctx.legal[i]` for each
target anyway. Counterspells target `{ kind: "spell", filter: (g, item, p) => item.p !== p }` and call
`g.counterSpell(ctx.targets[0], ctx.o)`. Copy a spell with `await g.copySpell(item, p)`. Cast a card
for free with `await g.castWithoutPaying(p, card)`.

### Target specs

`{ kind, purpose, prompt, optional, you, opp, other, filter(g, o, p, src), playerFilter(g, pl, p), from, amount }`

- kind: `creature`, `permanent`, `nonland`, `noncreature`, `artifact`, `enchantment`,
  `artifactOrEnchantment`, `creatureOrEnchantment`, `creatureOrPlaneswalker`, `planeswalker`, `land`,
  `token`, `creatureToken`, `any` (creature, planeswalker or player), `player`, `opponent`, `spell`,
  `card` (with `from: (g, p, src) => [cards]`, for graveyard targets).
- purpose tells the bots what you want: `harm` (opponents' best thing), `help` (your best creature),
  `counter`, `copy`, `populate`, `sacrifice`, `reanimate`, `equip`. `amount` on a damage spec lets the
  bots pick a creature it would kill.
- Put `trigger: true` on specs chosen during a triggered ability (players can let the table pick those).

### Statics

```js
statics: [{
  applies: (g, s, o) => o.controller === s.controller && g.isCreature(o),  // s is the source
  pt: [1, 1] or (g, s, o) => [p, t],
  kw: ["haste"] or (g, s, o) => [...],
  cantBlock: true, cantAttack: true, allTypes: true
}, {
  playerHexproof: (g, s, pl) => pl === s.controller,
  lifeGainPlus: (g, s, p) => 1,                   // Cleric Class
  counterPlus: (g, s, o, kind) => 1,              // Hardened Scales style
  costMod: (g, s, card) => 1,                     // reduce generic cost of your spells by n
  giveConvoke: (g, s, card) => bool, giveFlash: (g, s, card, p) => bool,
  extraLands: 1, untapOnOthersTurn: true, noMaxHand: true
}]
commandStatics: [{ costMod }]    // eminence cost reductions that work from the command zone
```

Other card fields: `etbTapped` (true or `(g, o) => bool`), `etbCounters: (g, o, opts) => ({ p1: n })`,
`cda: (g, o) => [power, toughness]`, `notCreatureUnless: (g, o) => bool`, `doesntUntap: (g, o) => bool`,
`canBeBlockedBy: (g, attacker, blocker) => bool`, `identity` (commander colors if they differ from cost).

## Game methods to use in `do`

Queries: `g.creatures(p)`, `g.controlled(p, filter)`, `g.opponents(p)`, `g.isCreature(o)`, `isLand`,
`isArtifact`, `isEnchantment`, `isPlaneswalker`, `hasSub(o, "Goblin")`, `power(o)`, `toughness(o)`,
`kw(o, "flying")`, `colorsOf(o)` (a Set), `mvOf(o)`, `devotion(p, "W")`, `g.active`, `g.turn`,
`g.combat` ({attacker, attackers}), `o.combat.attacking`, `p.life`, `p.gained` (this turn),
`p.spellsCast` (this turn), `g.spellsThisTurn`, `g.startingLife`, `p.hand`, `p.library` (top is [0]),
`p.graveyard`, `p.exile`, `p.command`, `p.commanders`.

Actions: `gainLife(p, n, src)`, `loseLife(p, n, src)`, `damage(src, target, n)`, `addCounters(o, "p1", n)`,
`removeCounters(o, kind, n)`, `counterEach(p, "p1", n)`, `tap(o)`, `untap(o)`,
`pump(objs, p, t, kw)`, `grant(objs, kw)`, `addEffect({ objs | filter, pt, kw, setPT, unblockable, cantBlock, until })`
(`until`: "eot" default, "eoc", or "yourNextTurn" with `player`), `draw(p, n)`, `discard(p, o)`,
`mill(p, n)`, `impulse(p, n)` (exile top n, may play this turn), `search(p, { filter, count, to, tapped, from, prompt, hidden })`
(to: "hand", "battlefield", "top", "graveyard"), `shuffle(p)`, `createToken(p, spec, { count, tapped, attacking, counters, exileEoc, sacEnd })`,
`copyToken(p, obj, { except, count, tapped, attacking, haste, exileEoc, sacEnd })`, `populate(p)`,
`destroy(o)`, `destroyAll(list)`, `sacrifice(o)`, `exile(o)`, `bounce(o)`, `tuck(o, bottom)`,
`putOntoBattlefield(cards, p, { tapped })`, `moveTo(o, zone)`, `counterSpell(item)`, `copySpell(item, p)`,
`castWithoutPaying(p, card)`, `addEmblem(p, { name, text, statics, triggers })`, `win(p, "how")`,
`g.delayed.push({ at: "endStep" | "upkeep", once: true, player, controller, do: async g => {} })`,
`await g.ask(p, { type: "confirm" | "option" | "number" | "target" | "cards" | "player", prompt, options, min, max, purpose, src })`,
`await g.chooseTarget(p, spec, src)`, `await g.distribute(p, total, options, src, prompt)`,
`g.log(text, { p, cards: [names] })` for anything a player should read in the game log.

Tokens: `MK.T.treasure`, `soldier`, `human`, `citizen`, `cat`, `beast`, `elephant`, `angel`, `angelV`,
`vampireLL`, `goblin`, `zombie`, or your own `MK.tokenDef({ key, name, pt: [1, 1], colors: "R",
subtypes: ["Goblin"], keywords: [], abilities, triggers, mana })`. Keep `key` unique.

## Bot hints

`def.ai` on a card:

| Hint | Meaning |
| --- | --- |
| `priority` | 0 to 10, how early to cast it among castable spells (default 5) |
| `ramp`, `draw`, `tutor` | kind of card; ramp is cast early |
| `removal: true, minThreat: 4` | only cast when an opposing permanent's threat score reaches minThreat |
| `wipe: true, spares: o => bool` | cast only when the table's board is much bigger than ours |
| `finisher: true` | cast when the alpha strike looks lethal |
| `counter: true` | held for the response window; used on dangerous spells |
| `protection: true` | held; cast in response to a wipe or removal |
| `instantEnd: true` | cast at the end of the turn before ours |
| `trick: true` or `(g, p, o) => bool` | combat trick after blockers |
| `combat: (g, p, o) => bool` | cast in the combat window when true |
| `minCreatures: n` | wait until we have n creatures |
| `x: (g, p, o, xMax) => x`, `mode: (g, p, o) => i`, `door: (g, p) => i` | choices when casting |
| `cast: (g, p, o, { window }) => false | number` | override: false holds, a number is the score |
| `hold: (g, p, o) => bool` | extra reason to hold |
| `plan: (g, p, o, { window, actions }) => action | null` | sequencing and combos; runs first, from hand, battlefield and command zone |
| `target: (g, p, req) => option`, `confirm`, `option` | answers for this card's questions |
| `threat` | bonus to how much opponents want this gone |
| `never` | the bots never cast it |

`ability.ai.use(g, p, o, { window, turnOf })` says when to activate: window is `main1`, `main2`,
`stack`, `combat` or `end` (end of another player's turn, `turnOf` is that player). Return false, true,
or `{ repeat: n }` for loops (the engine stops early when the ability can't be activated). `first: true`
checks the ability before anything else (win-the-game abilities).

An action returned by a plan looks like `{ type: "cast", card, targets, x, alt }`,
`{ type: "activate", card, idx, repeat }` (idx = index in `abilities`), or `{ type: "land", card }`.

## Deck files

Bracket 4 decks live in `decks-<id>.js` and Bracket 2 precons in `precon-<id>.js`. Both load
after `cards-miku.js`, the Bracket 4 files first, then the precons, in alphabetical order (the
site's `GAME_FILES` in `app.js`, `GAME` in `sw.js` and `tools/sim/run.js` all use that order). A card
defined in two files keeps the first definition, so a precon only defines cards nobody else has.
The lobby deals from the precons, the Bracket 4 decks or both, using each deck's `bracket`.

```js
(function (root) {
  "use strict";
  const MK = root.MK, D = MK.defineOnce, T = MK.T;
  D({ ... });
  (MK.BOT_DECKS = MK.BOT_DECKS || []).push({
    id: "krenko", name: "Krenko", title: "Krenko, Mob Boss", commander: "Krenko, Mob Boss",
    identity: ["R"], bracket: 4, aggression: 0.7,
    style: "Goblin swarm", blurb: "One sentence a player reads before the game.",
    watch: ["Kiki-Jiki, Mirror Breaker", "Goblin Bombardment"],   // cards to watch out for
    // precon: "Elven Empire (Kaldheim Commander, 2021)",         // Bracket 2 decks: the retail precon it is based on
    list: [ ...99 card names, basics repeated... ]
  });
})(typeof window !== "undefined" ? window : globalThis);
```

## Testing

```
node tools/sim/run.js --games 40 --decks krenko,miku,random,random --players 4
node tools/sim/run.js --games 40 --decks miku,random2,random2,random2 --first random   # random2: precons, random4: Bracket 4
node tools/sim/run.js --games 1 --seed 7 --decks krenko,miku --players 2 --log 1   # full game log
node tools/sim/run.js --games 20 --decks krenko --strict                           # throw on the first error
```

The run prints win rates, game length, engine errors and broken invariants (cards in two zones,
negative counters, cards that vanished). A deck is ready when 100+ games show no errors or problems
and the deck wins some games against the others.
