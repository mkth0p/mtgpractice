# Miku commanders: verbatim Oracle text, verification, shortlist
Pass 2, 2026-10-08. Replaces the paraphrased card text of `pass1/commanders.md` (left untouched) with exact Oracle text from Scryfall's bulk data:
- `oracle-cards` 2026-10-07 21:01 UTC;
- `default-cards` 2026-10-07 21:05 UTC;
- `rulings` 2026-10-07 21:00 UTC.

The index (`scryfall/index.json`, `scryfall/index-meta.json`) is built by `scryfall/bulk-index.js`. A printing counts as a Miku printing if it's one of the 46 Secret Lair printings Scryfall tags with the art tag `hatsune-miku`, saved in `scryfall/miku-printings.json`. The evaluation and shortlist below are carried over from pass 1 and checked against the verbatim text; the win lines are in `combos.json`, the opposition in `opposition.md`.

## 1. Every Miku card that can be your commander (verified against bulk data)

| SLD # | Oracle name | Miku name | Mana cost | Type line | P/T or loyalty | Identity | Released |
|---|---|---|---|---|---|---|---|
| 1586 | Giada, Font of Hope | Miku, Font of Pop | {1}{W} | Legendary Creature — Angel | 2/2 | W | 2025-02-10 |
| 1597 | Azusa, Lost but Seeking | Miku, Lost but Singing | {2}{G} | Legendary Creature — Human Monk | 1/2 | G | 2024-05-13 |
| 1598 | Freyalise, Llanowar's Fury | Miku, Voice of Power | {3}{G}{G} | Legendary Planeswalker — Freyalise | loyalty 3 | G | 2024-09-30 |
| 1599 | Child of Alara | Miku, Child of Song | {W}{U}{B}{R}{G} | Legendary Creature — Avatar | 6/6 | BGRUW | 2024-06-24 |
| 1601 | Brago, King Eternal | Miku, Queen Electric | {2}{W}{U} | Legendary Creature — Spirit Noble | 2/4 | UW | 2025-02-10 |
| 1602 | Feather, the Redeemed | Miku, the Renowned | {R}{W}{W} | Legendary Creature — Angel | 3/4 | RW | 2024-05-13 |
| 2429 | Trostani, Selesnya's Voice | Miku, Song of the People | {G}{G}{W}{W} | Legendary Creature — Dryad | 2/5 | GW | 2026-08-10 |
| 2433 | Shalai, Voice of Plenty | Miku, Voice Over All | {3}{W} | Legendary Creature — Angel | 3/4 | GW | 2026-08-10 |
| 2439 | Vorinclex, Voice of Hunger | Miku, the Complete Performer | {6}{G}{G} | Legendary Creature — Phyrexian Praetor | 7/6 | G | 2026-08-10 |

Confirmed from bulk data (the open questions of pass 1):
- **Brago's mana cost** is {2}{W}{U}.
- **Feather** is a 3/4.
- **Freyalise's loyalty** is 3.
- **Shalai's ability** costs {4}{G}{G} and reads "each creature you control", Shalai included. Its {G}{G} puts green in her identity: G and W.
- **Elspeth Tirel** (SLD 1585, "Miku, Divine Diva") and the four Vocaloid planeswalkers can't be commanders: Jace, Unraveler of Secrets (KAITO, 1590), Liliana of the Dark Realms (Luka, 1593), The Royal Scions (Len and Rin, 1600) and Chandra, Flamecaller (MEIKO, 807). None of their Oracle texts carries "can be your commander", and none is a legendary creature. Freyalise is the only Miku planeswalker with the line.
- **SLD 2443**, the second Trostani "Miku, Song of the People": pass 1 calls it a display commander, not tournament legal. Scryfall's bulk data gives that printing `legalities.commander: legal`, the same as every printing of the card, because legality belongs to the card, not the printing. Whether the display copy is a legal playing piece is not verified. It stays out of every list and price (pass1 D10).

## 2. Oracle text (verbatim)

### Giada, Font of Hope
{1}{W} · Legendary Creature — Angel 2/2 · color identity W · Commander: legal · not a Game Changer

> Flying, vigilance
> Each other Angel you control enters with an additional +1/+1 counter on it for each Angel you already control.
> {T}: Add {W}. Spend this mana only to cast an Angel spell.

Miku printing: SLD 1586 "Miku, Font of Pop" (2025-02-10)

### Azusa, Lost but Seeking
{2}{G} · Legendary Creature — Human Monk 1/2 · color identity G · Commander: legal · not a Game Changer

> You may play two additional lands on each of your turns.

Miku printing: SLD 1597 "Miku, Lost but Singing" (2024-05-13)

### Freyalise, Llanowar's Fury
{3}{G}{G} · Legendary Planeswalker — Freyalise (loyalty 3) · color identity G · Commander: legal · not a Game Changer

> +2: Create a 1/1 green Elf Druid creature token with "{T}: Add {G}."
> −2: Destroy target artifact or enchantment.
> −6: Draw a card for each green creature you control.
> Freyalise, Llanowar's Fury can be your commander.

Miku printing: SLD 1598 "Miku, Voice of Power" (2024-09-30)

### Child of Alara
{W}{U}{B}{R}{G} · Legendary Creature — Avatar 6/6 · color identity BGRUW · Commander: legal · not a Game Changer

> Trample
> When Child of Alara dies, destroy all nonland permanents. They can't be regenerated.

Miku printing: SLD 1599 "Miku, Child of Song" (2024-06-24)

### Brago, King Eternal
{2}{W}{U} · Legendary Creature — Spirit Noble 2/4 · color identity UW · Commander: legal · not a Game Changer

> Flying
> Whenever Brago deals combat damage to a player, exile any number of target nonland permanents you control, then return those cards to the battlefield under their owner's control.

Miku printing: SLD 1601 "Miku, Queen Electric" (2025-02-10)

### Feather, the Redeemed
{R}{W}{W} · Legendary Creature — Angel 3/4 · color identity RW · Commander: legal · not a Game Changer

> Flying
> Whenever you cast an instant or sorcery spell that targets a creature you control, exile that card instead of putting it into your graveyard as it resolves. If you do, return it to your hand at the beginning of the next end step.

Miku printing: SLD 1602 "Miku, the Renowned" (2024-05-13)

### Trostani, Selesnya's Voice
{G}{G}{W}{W} · Legendary Creature — Dryad 2/5 · color identity GW · Commander: legal · not a Game Changer

> Whenever another creature you control enters, you gain life equal to that creature's toughness.
> {1}{G}{W}, {T}: Populate. (Create a token that's a copy of a creature token you control.)

Miku printing: SLD 2429 "Miku, Song of the People" (2026-08-10); SLD 2443 "Miku, Song of the People" (2026-08-10)

### Shalai, Voice of Plenty
{3}{W} · Legendary Creature — Angel 3/4 · color identity GW · Commander: legal · not a Game Changer

> Flying
> You, planeswalkers you control, and other creatures you control have hexproof.
> {4}{G}{G}: Put a +1/+1 counter on each creature you control.

Miku printing: SLD 2433 "Miku, Voice Over All" (2026-08-10)

### Vorinclex, Voice of Hunger
{6}{G}{G} · Legendary Creature — Phyrexian Praetor 7/6 · color identity G · Commander: legal · not a Game Changer

> Trample
> Whenever you tap a land for mana, add one mana of any type that land produced.
> Whenever an opponent taps a land for mana, that land doesn't untap during its controller's next untap step.

Miku printing: SLD 2439 "Miku, the Complete Performer" (2026-08-10)

## 3. Evaluation and shortlist (from pass 1, checked against the text above)

Pass 1's evaluation stands. Nothing in the verbatim text changes it:
- **Child of Alara:** a 5-mana 6/6 trample. Its death trigger destroys all nonland permanents, and they can't be regenerated. As a commander it's mainly the five-color identity.
- **Brago:** a 4-mana 2/4 flier whose combat-damage trigger blinks any number of your nonland permanents.
- **Shalai:** hexproof for you, your planeswalkers and your *other* creatures, plus a {4}{G}{G} counter ability.
- **Trostani:** an A/B commander on Shalai's 99.
- **Not shortlisted:**
  - Azusa: two extra land plays.
  - Giada: Angel tribal.
  - Freyalise: a 5-mana walker.
  - Vorinclex: 8 mana.
  - Feather: red-white spell loops; Child covers its card pool.

**Shortlist** (unchanged, pass1 D6):
1. Child of Alara;
2. Brago, King Eternal;
3. Shalai, Voice of Plenty, with Trostani as an A/B on the same 99.

The win lines (pass 1's section 6), verified on Commander Spellbook and against Oracle text, are in `combos.json`. Pass 1's section 7 is replaced by `opposition.md`. Rulings for these cards and the combo pieces are in `rulings.md`.
