# Rules facts for the simulator

Checked 2026-10-07. Rulings are paraphrased with their published dates; pull the verbatim text from Scryfall's rulings bulk file before encoding them (DECISIONS.md, D8). "Not verified" means I didn't see a source this pass.

## Commanders that die (applies to Child of Alara)

- **CR 903.9a:** if a commander is put into a graveyard or exile, its owner may move it to the command zone as a state-based action. The card reaches the graveyard first, so "dies" triggers fire, and only then can it move.
- **CR 903.9b:** hand and library are still handled by a replacement effect ("instead"), so a commander going there never reaches that zone.
- **Date:** announced by the Rules Committee in June 2020 and adopted with the Core Set 2021 rules update.
- **Caution:** the one-line summary on Wizards' Commander format page still uses the old "instead" wording for every zone. The Comprehensive Rules govern, and so do forum answers only if they postdate mid-2020.
- Sources: https://mtgcommander.net/index.php/2020/06/29/july-2020-update/ and the 903.9 text quoted in https://github.com/magefree/mage/issues/6866

## Child of Alara

- When it dies, every nonland permanent on the battlefield is destroyed (yours and everyone else's), and regeneration can't save them. Lands, including the owner's, are untouched.
- Scryfall lists no card-specific rulings.
- **Simulator:** Child dying to removal or combat wipes the board even if its owner then moves it to the command zone. The colors-only plan never casts it.

## Shalai, Voice of Plenty

- Gives hexproof to you, your planeswalkers and your other creatures. Shalai doesn't give it to itself.
- Hexproof only stops spells and abilities your opponents control (CR 702.11; not re-fetched this pass). Your own targeting is unaffected: your own Swords to Plowshares, protection spells on your creatures, Walking Ballista pinging your own things, a Brain Freeze aimed at yourself.
- Untargeted effects ignore it: wraths, edicts, "each player" effects, counterspells on the stack.
- {4}{G}{G} puts a +1/+1 counter on each creature you control, Shalai included.
- Shalai's own Scryfall rulings: not verified.

## Brago, King Eternal

Card rulings (from a Scryfall mirror; ruling dates not shown there, so dates not verified):

- The exile-and-return happens during the combat damage step, after combat damage is dealt.
- When an exiled Aura comes back, its owner chooses what it enchants.
- Brago may exile and return itself with its own ability.

General rules behind the deck's engine (not card rulings; not re-fetched): an exiled token ceases to exist and doesn't come back; a returned card is a new object, so it loses counters, attached Equipment falls off, it returns untapped (that's how Brago untaps rocks) and creatures have summoning sickness.

## Feather, the Redeemed (rulings dated 2021-03-19)

- It triggers once you finish casting an instant or sorcery that targets a creature you control. The exile and the end-step return both still happen if Feather leaves the battlefield afterward.
- The spell may have other targets too.
- If the spell doesn't resolve (countered, or all targets illegal), it isn't exiled and doesn't come back.
- If the spell's own text sends it somewhere else, Feather does nothing for it.
- When another effect would exile the spell (such as flashback), you may apply Feather's replacement first; the card then returns to your hand.
- A spell you cast but don't own isn't affected.

## Thassa's Oracle (rulings dated 2020-01-24)

- Devotion to blue is counted when the trigger resolves. The Oracle counts toward it only if it's still on the battlefield at that moment.
- With devotion 0 you look at nothing, and if your library is empty you still win.
- Hybrid and Phyrexian symbols count toward devotion; generic, colorless and text-box symbols don't.
- **Simulator:** with an empty library the win can't be stopped by removing the Oracle. The answers are countering the Oracle, countering or Stifling the trigger, or putting cards into your library before it resolves.

## Trostani, Selesnya's Voice

- **2012-10-01:** the lifegain uses the creature's toughness as the trigger resolves, or its last known toughness if it has left. Negative toughness never makes you lose life.
- **2024-01-12 (populate):** doesn't target; copies a creature token you control. The copy doesn't keep counters, tapped state, attached Auras or Equipment, or noncopy effects. With no creature tokens, nothing happens.

## Vorinclex, Voice of Hunger (rulings dated 2017-11-17)

- The extra mana is one mana of a type the land produced; if it produced several types, you pick one.
- If Vorinclex leaves after its opponent-land trigger, the trigger still resolves and that land still skips its next untap.

## Not covered this pass

Azusa, Giada and Freyalise rulings; full Comprehensive Rules text for hexproof (702.11). Also every combo piece, which belongs to the win-line step (STATUS.md, step 4).

## Sources

- Thassa's Oracle: https://scryfall.com/card/thb/73
- Feather: https://www.mtg.wtf/card/pwar/197p/Feather-the-Redeemed
- Trostani: https://scryfall.com/card/c19/204
- Vorinclex: https://scryfall.com/card/mul/94
- Brago: https://scrydex.com/magicthegathering/cards/brago-king-eternal/SLD-1601
- Child of Alara: https://mtgassist.com/cards/Conflux/Child-of-Alara/
