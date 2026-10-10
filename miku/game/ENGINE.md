# Miku Commander engine: how to add cards and decks

The game on the Play tab is a small Commander rules engine written in plain JavaScript. The same
files run in the browser and in Node, so every deck can be tested with thousands of bot games
before anyone plays it.

| File | What it holds |
| --- | --- |
| `engine.js` | Rules: zones, the stack, mana payment, combat, triggers, state-based actions. |
| `cards-miku.js` | All 88 cards of the Miku deck (Trostani) and `MK.MIKU_DECK`. The best examples to copy. |
| `cards-miku-b4.js` | The Miku high-Bracket-4 research lists (research/miku-b4/): the Brago and Shalai cards nobody else had, `MK.BRAGO_DECK` and its bot brain, `MK.flicker`. Sims only for now; `tools/sim/test-miku-b4.js` checks them. |
| `cards-corrupted.js` | The Corrupted Miku deck (Shalai, Bracket 4): its new cards, the generic Cavern of Souls, `MK.CORRUPTED_DECK` and its coach. |
| `checklist-corrupted.js` | Corrupted Miku's turn checklist (`MK_CHECKLISTS.corrupted`), shared by the game's Coach panel and the site. |
| `decks-*.js` | One file per bot deck: its card definitions and one entry in `MK.BOT_DECKS`. |
| `ai.js` | The bots. Generic rules of thumb plus the per-card hints described below. |
| `game-ui.js`, `game.css` | The table on the page. |
| `../../tools/sim/run.js` | Headless bot games with invariant checks. |
| `../../tools/ui/*.js` | Playwright tests that play the Play tab through its screen. |

Load order in the page and in the sim: `engine.js`, `cards-miku.js`, `cards-corrupted.js`, the other `cards-*.js`, `decks-*.js` (alphabetical), `ai.js`.

## What the engine simplifies

`MK.SIMPLIFICATIONS` in `engine.js` is the list shown to players. The ones that matter when you write
a card:

- Mana is paid automatically from untapped sources. Players never tap lands by hand.
- Spells, activated abilities and triggered abilities use the stack (since engine version 2). The
  players after the top item's controller get a response window for each item (`window: "stack"` for
  a spell, `"ability"` for an ability or trigger), then it resolves. Mana abilities (`manaAbility: true`
  on an ability that adds to `ctx.p.pool`) and special actions (turning face up, unlocking a door)
  skip the stack. Inside a repeated loop (`repeat`) the table shortcuts: no windows for its
  abilities and triggers.
- Triggers wait in `g.pending` until the next priority, then go on the stack: the active player's
  first (so they resolve last), "late" ones under the others. `await g.settle()` resolves them and
  everything they cause, so card code can keep calling it. `g.waitingTriggers()` lists those not yet
  resolved (on the stack, pending, and the one resolving now), next one last.
- Other response windows: `"attackers"` (attackers declared, before blocks), `"combat"` (after blocks)
  and `"end"` (end of each turn, for the other players). Since engine version 5 every player, the
  active player first, also gets priority in `"upkeep"` (after its triggers, before the draw),
  `"draw"` (after the card is drawn), `"beginCombat"` (before attackers), `"damage"` (after each
  combat damage step) and `"endCombat"` (after "at end of combat" triggers; this step happens even
  when nothing attacks). `ctx.turnOf` is the active player. The bots only run deck plans and
  `first` abilities there; the table stops for a person only with "Stop in upkeep, draw and every
  combat step". Records made before version 5 replay without them (`legacySteps`).
- Combat damage: a person whose attacker has two or more blockers divides its damage
  (`type: "distribute"`, `purpose: "combatDamage"`, `req.suggest` is the default split, `req.trample`);
  the engine makes the answer legal (with trample, lethal damage to each blocker before the player).
  Bots get the default: lethal damage to each blocker in turn, the easiest first.
- A commander that would go to the graveyard, exile or a library goes to the command zone; one that
  would go to its owner's hand stays there.
- The legend rule is a choice for people (`purpose: "legendKeep"`); bots keep the newest.
- Not supported: split second, control-changing effects that last longer than a turn, replacement
  effects other than the ones listed under statics. Pick another card, or write a simplified version
  and say how in the card's `note`.

### Turns, combats and regeneration

- `g.addExtraTurn(p, src)`: p takes an extra turn after this one (the newest extra turn first, then
  normal order resumes). `g.skipNextTurn(p, src)`: p skips their next turn, extra or not.
  `g.nextPlayer(g.active)` already accounts for a waiting extra turn.
- `g.addExtraCombat(p, { main: true })`: an additional combat phase right after the regular one
  (and an additional main phase after it with `main`).
- `g.regenerate(o)`: a regeneration shield until end of turn. `g.destroy(o, src, { noRegen: true })`
  and `g.destroyAll(list, src, { noRegen: true })` for "can't be regenerated". Lethal damage uses the
  shield too.
- `p.drawnThisTurn` lists the cards p drew this turn (Sylvan Library).

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
| `becameTarget` | o (the permanent), p (who controls the spell or ability), item (on the stack) |
| `activated` | p, o, ab, item (an activated ability just went on the stack) |

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
  tapCreatures: 2, untapCreatures: 1, discard: 1,  // tapFilter(g, c, src), tapSelfOk, tapPrompt narrow the tapped ones
  manaAbility: true,                    // adds mana: resolves at once, no stack
  targets: [spec],                      // see target specs
  minX: 1, xFrom: (g, ctx) => n,        // X chosen by the player, or computed from the targets
  do: async (g, src, ctx) => { /* ctx.p, ctx.targets, ctx.legal[i], ctx.x, ctx.kws (keywords before costs) */ },
  // it resolves from the stack: src may have left (sacrificed as a cost), and with every target
  // gone it does nothing
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
`g.counterSpell(ctx.targets[0], ctx.o)`. `kind: "spell"` only offers spells; add `orAbility: true` for
"target spell or ability" (Willbender), and use `g.stackTargets(item)` for the specs of any stack item.
Ward: `MK.wardTrigger(n)` in `triggers`, or `ward: n` on a static that applies to the creature. Copy a spell with `await g.copySpell(item, p)`. Cast a card
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
  extraLands: 1, untapOnOthersTurn: true, noMaxHand: true,
  playLandsFrom: ["top", "graveyard"],            // Courser of Kruphix, Ramunap Excavator
  lifeGainTimes: 2,                               // Boon Reflection: your life gain is multiplied
  grantMana: [{ tap: true, produce: "G" }],        // with applies: extra mana abilities (Song of Freyalise)
  // locks (Corrupted Miku)
  cantCast: (g, s, p, card) => bool,              // Grand Abolisher, Drannith Magistrate, Deafening Silence
  cantActivate: (g, s, p, o, ab) => bool,         // Grand Abolisher, Linvala (mana abilities count)
  uncounterable: (g, s, item) => bool,            // Destiny Spinner
  searchLimit: (g, s, p) => 4 or null,            // Aven Mindcensor: p searches only the top n
  entersTapped: (g, s, o) => bool,                // Thalia, Heretic Cathar, Blind Obedience
  creatureManaBonus: (g, s, o) => "G",            // Badgermole Cub: tapping creature o for mana adds this too
  tapManaBonus: (g, s, o) => "G",                 // Wild Growth, Utopia Sprawl: tapping permanent o for mana adds this too
  becomesVehicle: true,                           // with applies: it's a noncreature Vehicle artifact (Swift Reconfiguration)
  stopTrigger: (g, s, entry) => bool              // the trigger doesn't happen (Elesh Norn, Mother of Machines); triggerExtra(g, s, entry) -> n adds copies
}]
commandStatics: [{ costMod }]    // eminence cost reductions that work from the command zone
```

Other card fields: `etbTapped` (true or `(g, o) => bool`), `etbCounters: (g, o, opts) => ({ p1: n })`,
`cda: (g, o) => [power, toughness]`, `notCreatureUnless: (g, o) => bool`, `doesntUntap: (g, o) => bool`,
`canBeBlockedBy: (g, attacker, blocker) => bool`, `identity` (commander colors if they differ from cost),
`asEnters: async (g, o) => {}` (a choice made as it enters, such as Phyrexian Processor's life payment),
`etbState: (g, o, opts) => ({})` (state set as it enters), `mdfcLand` (the land back face of a modal card),
`morph` (face-down casting), `cycling: "{2}"`, `doublesLandMana` (Mirari's Wake), and `altCosts[].targets`
for an alternative cost with its own targets (cleave).

Corrupted Miku added a few more:
- `g.banCasting((g, p, card) => bool, label)` stops casting until end of turn (Silence, Orim's Chant,
  Ranger-Captain), or until a player's next turn with `{ until: player }` (Reflector Mage); `p.noCounterTurn = g.turn` makes p's spells uncounterable this turn (Veil of Summer).
- `p.shield` (protection from everything: no targeting, damage prevented) and `p.lifeLock` (life total
  can't change) last until p's next turn (Teferi's Protection, The One Ring).
- `g.addEffect({ objs, prot: ["B"] })`: protection from colors ("C" for colorless) until end of turn. It
  stops targeting, damage and blocking by sources of that color (Giver of Runes).
- `handMana: "G"` pays from the hand by exiling the card (Elvish Spirit Guide).
- `channel: { label, cost, costReduce(g, p, o), targets, do(g, o, ctx) }` discards a card from hand for
  an effect (Boseiju, Eiganjo). It shows up as a `channel` action.
- `openingHand: true` with `openingHandIf(g, p)` and `onOpeningHand(g, p, o)` (Gemstone Caverns).
- `o.state.earth` with `o.earthReturn` is an earthbent land: a 0/0 creature with haste that comes back
  tapped when it dies or is exiled.
- `g.librarySearch(p)` is the part of p's library a tutor may look at; custom tutors should use it so
  Aven Mindcensor and Archivist of Oghma see them. `g.castLog` lists this turn's spells and colors.
- A hero deck's `coach: { tips(g, p), checklist }` drives the game's Coach panel: `tips` returns
  `{ level: "win" | "now" | "plan" | "warn" | "info", title, text, cards }`, most urgent first, and
  `checklist` names an entry of `MK_CHECKLISTS`. `alsoOn: ["miku"]` offers a hero deck on another site too.

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
| `cards: (g, p, req) => [cards] | null` | picks for this card's "cards" questions (searches, hideaway); null falls back to the default |
| `morph: (g, p, o) => number` | score for casting it face down (default: never) |

`ability.ai.use(g, p, o, { window, turnOf })` says when to activate: window is `main1`, `main2`,
`stack`, `ability`, `attackers`, `combat` or `end` (end of another player's turn, `turnOf` is that player);
the step windows (`upkeep`, `draw`, `beginCombat`, `damage`, `endCombat`) reach only deck plans and `first` abilities. Return false, true,
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

Decks a player can pilot go in `MK.HERO_DECKS` with `hero` set to the site that offers them
(`"miku"`, `"etrata"` or `"corrupted"`, matching `MK_SITE.hero`) and a short `label` for the deck picker: the Miku
site offers the precon, the 80€ upgrade, the full upgrade and the Bracket 4 Azusa deck. A hero deck
can also sit at the table as a bot when it is pushed to `MK.BOT_DECKS` too. `cards-*.js` files hold
other heroes' card pools (`cards-etrata.js`, `cards-miku-precon.js`) and load before the deck files.

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
node tools/sim/run.js --games 60 --decks miku-precon,random2 --cut "miku-precon:Boon Reflection"   # swap one card for a basic
node tools/sim/run.js --games 200 --decks miku-precon,random,random,random --strict --chaos --first random  # seat 1 plays like a careless human
```

The run prints win rates, game length, engine errors and broken invariants (cards in two zones,
negative counters, cards that vanished). A deck is ready when 100+ games show no errors or problems
and the deck wins some games against the others.

Bots only take the lines their hints give them. `--chaos` plays the first seat at random among
everything the screen would offer a person (your own Swords on your own creature, X=0, skipped
targets, odd blocks) and reports any play that did nothing.

The screen itself has two Playwright tests (Scryfall is mocked, so they run offline; the cloud
sandbox has Playwright and Chromium, elsewhere `npm i -g playwright`):

```
node tools/ui/cast-every-card.js --hero miku-precon     # cast every card of a deck through the screen, use each ability
node tools/ui/cast-every-card.js --hero etrata --site etrata --only "Etrata, Deadly Fugitive" --verbose
node tools/ui/random-play.js --hero azusa --games 3     # tap at random through whole games against the bots
node tools/sim/test-corrupted.js                        # Corrupted Miku's combos, locks and coach
```

They report page errors, "Display error" lines, cards that glow but can't be played, plays that
do nothing, questions with no way out and stalls. Run both for every deck you can pilot after
changing `game-ui.js` or anything a person's choices go through.

## Practice mode: recording, replays and puzzles

Corrupted Etrata's Train tab (`corrupted-etrata/train.js`) is built on two engine files:

- `practice.js` (`MK.Practice`) records a person's game and replays it. `P.record(agent, { rec })`
  wraps the person's agent: every answer is stored with object ids relative to `g.idBase`, and a
  snapshot of the position (win chance, lines, what the coach would say) is kept at each real
  decision. A game is rebuilt from its seed and seats by `P.buildGame`, and `P.replay(rec, { at,
  onAt, reseed, horizon })` plays the recorded answers up to answer `at`, hands that decision to
  `onAt`, and lets the bots play on. `P.replay` takes `hidden: true` to deal the opponents fresh hands at the branch.
  `practice-worker.js` runs analysis jobs (`quick`, `deep`) off the page; the Train tab keeps a
  pool of them busy.
- `train-cetrata.js` (`MK.TRAIN["corrupted-etrata"]`) holds the old Etrata-only win-chance model,
  the puzzles, the mulligan evaluator, the drill generators and the review rules, plus
  `lineFeatures(g, p)` (how close the planner's lines are, for the value model) and
  `categorize(m, r)` (which skill a decision belongs to).
- `value.js` (`MK.Value`) is the table-wide value model: the same features for every live player
  (life, cards, mana, board, commander, seats until their turn, deck, and the deck planner's lines
  when it has one) go through a small neural network into a score, and the win chances are the
  softmax over the live players. `tools/sim/train-value.js` fits it on every seat of bot games.
- `analysis.js` (`MK.Analysis`) is the game analysis engine. Every playout replays the game to the
  decision, reshuffles every library and deals each opponent a fresh hand from the cards the person
  couldn't see (`P.resampleHands`), plays the option, lets the bots play `horizon` rounds and scores
  the end with the value model. Options share seeds (common random numbers) and `A.race` drops the
  ones that fall clearly behind so the close ones get the playouts. `A.quick(rec, i)` compares the
  person's answer with the bot's on every decision; `A.deep(rec, i)` races every option, explains the
  difference from the playouts' end features (`why`) and keeps one typical line of each (`lines`).
  `A.grade` judges a loss by the share of the person's chances it gave up, less one standard error;
  `A.summarize` adds up accuracy, classes, skill (what decisions cost) against luck (everything
  else), swings and breakdowns by skill, phase and time taken. `A.ANCHORS` holds the accuracy of a
  random player and of the bot, the ends of the report's strength scale. Land choices (both
  options lands) look one round further and count only a loss past two standard errors; duplicate
  options are merged; a blunder needs at least 12 playouts. After the branch the replayed seat's
  agent reports `bot: true`, so the decks' bot-only logic (tutoring for the missing combo piece)
  runs in playouts as it does for the bots. `A.botGame(rec)` has the bot play the person's whole
  game from the first decision (same seat, hand, opponents; once on the same library order, then
  `runs` times reshuffled), read by `A.tracker` through `P.replay`'s `ui` option.

Never roll dice inside a sort comparator: how often a comparator runs depends on the JavaScript
engine, so the same seed played out differently in Chrome and Node (engine 3 fixed the bots'
attack target; games recorded before it replay with `legacyAttackSort`, and judge-export.js runs
them in Chromium). Replays must match the recorded game exactly, so anything that runs while the person thinks
(the snapshot's planner, the screen's helpers) must not touch `g.random` or keep objects: the
recorder swaps the dice and rewinds `MK.objSeq` around each answer. A card that asks about
objects in no zone must put them in the question's `options` or `cards`, where the replay looks
first.

New game options: `setup(g)` builds the position instead of mulligans (no draw on the first
turn), `stopAtTurn` ends the game after that turn, `round` sets the round counter. The Table's
`start(seats, mode)` takes `{ kind: "assess" | "retry" | "puzzle", ... }`.

```
node tools/sim/test-practice.js --games 12   # recorded games replay line for line, moments analyze
node tools/sim/test-train.js                 # every puzzle solvable and not by passing, drills valid
node tools/sim/test-analysis.js --games 2 [--person random]   # the analysis engine adds up and repeats
node tools/sim/train-value.js --games 10000 --threads 4 --data /tmp/val.json --write   # refit the value model (writes value.js)
node tools/sim/judge-export.js export.json --deep   # rerun the analysis on a Train tab export and compare
node tools/sim/calibrate-analysis.js --games 8 --write   # random-player and bot accuracy anchors (writes analysis.js)
node tools/sim/train-wp.js --games 4000 --write   # refit the old Etrata win-chance model (writes train-cetrata.js)
node tools/sim/mull-values.js --write             # recompute the mulligan values
node tools/ui/random-play.js --assess --games 3   # assessment games through the screen, then the review
```
