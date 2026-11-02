/* 20 underplayed Bracket 4 commanders. Deck counts and ranks: edhrec.com/commanders/<slug>, read 2026-11-02.
   Oracle text: Card-Forge card scripts. Combos: commanderspellbook.com search, read 2026-11-02, color identity checked by hand.
   power = our own estimate of the commander's Bracket 4 ceiling (1-5), not a measured number. */
window.CMDRS = [
 {
  "id": "kotose",
  "slug": "kotose-the-silent-spider",
  "colors": "UB",
  "decks": 176,
  "rank": 2992,
  "power": 2,
  "hook": "Rob their deck at the root",
  "pitch": "Exile one card from an opponent's graveyard, then every copy of it from their hand and library, and play it yourself with any color of mana.",
  "plan": "Blink Kotose again and again (EDHREC's top cards are Conjurer's Closet, Thassa, Deep-Dwelling, Ghostly Flicker and Displacer Kitten). Each blink steals a new card and strips that player's copies of it, so you take their combo piece and use it.",
  "combo": null,
  "nocombo": "Commander Spellbook lists no combo with Kotose as a piece. The deck wins with what it takes from the table, or with a blink loop it brings itself.",
  "watch": "The weakest raw power on this page: five mana, and it depends on what is in their graveyards. It is here because it is the purest puppet-master commander under 200 decks.",
  "traits": {
   "steal": 3,
   "control": 2,
   "chaos": 2,
   "engine": 1,
   "complex": 1
  },
  "name": "Kotose, the Silent Spider",
  "cost": "{3}{U}{B}",
  "type": "Legendary Creature Human Ninja",
  "pt": "4/4",
  "oracle": "When Kotose, the Silent Spider enters, exile target card other than a basic land card from an opponent's graveyard. Search that player's graveyard, hand, and library for any number of cards with the same name as that card and exile them. Then that player shuffles. For as long as you control Kotose, you may play one of the exiled cards, and you may spend mana as though it were mana of any color to cast it."
 },
 {
  "id": "naru",
  "slug": "naru-meha-master-wizard",
  "colors": "U",
  "decks": 424,
  "rank": 2328,
  "power": 5,
  "hook": "Flash in, copy your spell, go infinite",
  "pitch": "A 4-mana flash Wizard that copies an instant or sorcery you control when it enters. Blink spells copied by Naru blink Naru again.",
  "plan": "Hold mana up on everyone's turn, then flash Naru in with Ghostly Flicker on the stack. The copy blinks Naru and a land, Naru copies the next Flicker, and the loop never stops. It is a two-card combo where the commander is one of the cards.",
  "combo": {
   "id": "141-1987",
   "pieces": "Naru Meha + Ghostly Flicker",
   "result": "Infinite blinks and enters triggers, which Commander Spellbook lists with infinite mana and magecraft",
   "decks": 14018
  },
  "watch": "Mono-blue with a combo this compact can look like cEDH if you build it as a turbo list. Keep it B4 by playing the long game around it.",
  "traits": {
   "loop": 3,
   "spells": 3,
   "control": 2,
   "time": 1,
   "tutor": 1,
   "complex": 1
  },
  "name": "Naru Meha, Master Wizard",
  "cost": "{2}{U}{U}",
  "type": "Legendary Creature Human Wizard",
  "pt": "3/3",
  "oracle": "Flash\nWhen Naru Meha, Master Wizard enters, copy target instant or sorcery spell you control. You may choose new targets for the copy.\nOther Wizards you control get +1/+1."
 },
 {
  "id": "kitsa",
  "slug": "kitsa-otterball-elite",
  "colors": "U",
  "decks": 666,
  "rank": 2009,
  "power": 5,
  "hook": "Two mana, copies your best spell",
  "pitch": "A 2-mana Otter that loots every turn, and once its power is 3 or more it copies any instant or sorcery you control for {2}.",
  "plan": "Copy Dramatic Reversal with enough nonland mana out and every untap makes more mana than it costs. Kitsa also copies tutors, card draw and counterspells, so the same engine wins and protects.",
  "combo": {
   "id": "4821-5803",
   "pieces": "Kitsa + Dramatic Reversal (3 more pieces on Commander Spellbook)",
   "result": "Infinite mana, untaps and magecraft triggers",
   "decks": 8240
  },
  "watch": "Dramatic Reversal plus untap loops is a well-known cEDH package. It stays B4 only if the list does not chase a turn 2-3 kill.",
  "traits": {
   "spells": 3,
   "loop": 2,
   "engine": 2,
   "artifacts": 1,
   "control": 1,
   "complex": 1
  },
  "name": "Kitsa, Otterball Elite",
  "cost": "{1}{U}",
  "type": "Legendary Creature Otter Wizard",
  "pt": "1/3",
  "oracle": "Vigilance\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)\n{T}: Draw a card, then discard a card.\n{2}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy. Activate only if Kitsa's power is 3 or greater."
 },
 {
  "id": "ultimecia",
  "slug": "ultimecia-time-sorceress",
  "colors": "UB",
  "decks": 922,
  "rank": 1745,
  "power": 3,
  "hook": "Pay eight, take the next turn",
  "pitch": "Surveils as she enters and attacks. At your end step you may pay eight mana and exile eight cards from your graveyard to flip her into a 7/7 menace, and flipping gives you an extra turn.",
  "plan": "Fill the graveyard with surveil and self-mill, ramp to eight, then flip at end step: one big, finite extra turn with a 7/7 that draws you cards whenever an opponent loses life on your turn. The calm-then-boom pacing is built into the card.",
  "combo": null,
  "nocombo": "The infinite-turn lines Commander Spellbook lists for Ultimecia use green or other off-color cards, so none were taken here. Her own flip is the finite big turn.",
  "watch": "Eight mana is a lot for a B4 table. The deck needs heavy ramp in two colors that are not known for ramp.",
  "traits": {
   "time": 3,
   "finite": 3,
   "yard": 2,
   "control": 1,
   "rule": 0,
   "complex": 1
  },
  "name": "Ultimecia, Time Sorceress",
  "cost": "{3}{U}{B}",
  "type": "Legendary Creature Human Warlock",
  "pt": "4/5",
  "oracle": "Whenever Ultimecia enters or attacks, surveil 2. (Look at the top two cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)\nAt the beginning of your end step, you may pay {4}{U}{U}{B}{B} and exile eight cards from your graveyard. If you do, transform Ultimecia.",
  "back": {
   "name": "Ultimecia, Omnipotent",
   "type": "Legendary Creature Nightmare Warlock",
   "pt": "7/7",
   "oracle": "Menace (This creature can't be blocked except by two or more creatures.)\nTime Compression — When this creature transforms into Ultimecia, Omnipotent, take an extra turn after this one."
  }
 },
 {
  "id": "teferi",
  "slug": "teferi-temporal-archmage",
  "colors": "U",
  "decks": 1232,
  "rank": 1511,
  "power": 4,
  "hook": "Planeswalkers at instant speed",
  "pitch": "A planeswalker that can be your commander. +1 digs, -1 untaps four permanents, and the -10 emblem lets you use loyalty abilities on any player's turn at instant speed.",
  "plan": "With The Chain Veil, each -1 untaps the Veil and mana sources, so Teferi activates again and again. Lithoform Engine does a similar loop. The deck is a walkers deck that breaks the rule of when walkers act.",
  "combo": {
   "id": "787-1124",
   "pieces": "Teferi + The Chain Veil + enough mana permanents (3 more pieces on Commander Spellbook)",
   "result": "Infinite mana, card draw and loyalty activations",
   "decks": 25883
  },
  "alt": {
   "id": "787-3094",
   "pieces": "Teferi + Lithoform Engine",
   "result": "Infinite untaps and mana from permanents",
   "decks": 2102
  },
  "watch": "Six mana and no protection of his own. A walker commander dies to attacks, so the deck needs blockers or fog-style defense.",
  "traits": {
   "walkers": 3,
   "time": 2,
   "loop": 2,
   "artifacts": 1,
   "control": 1,
   "complex": 2
  },
  "name": "Teferi, Temporal Archmage",
  "cost": "{4}{U}{U}",
  "type": "Legendary Planeswalker Teferi",
  "pt": "",
  "oracle": "[+1]: Look at the top two cards of your library. Put one of them into your hand and the other on the bottom of your library.\n[-1]: Untap up to four target permanents.\n[-10]: You get an emblem with \"You may activate loyalty abilities of planeswalkers you control on any player's turn any time you could cast an instant.\"\nTeferi, Temporal Archmage can be your commander."
 },
 {
  "id": "toluz",
  "slug": "toluz-clever-conductor",
  "colors": "WUB",
  "decks": 1699,
  "rank": 1243,
  "power": 4,
  "hook": "Discard everything, get it all back",
  "pitch": "A 3-mana Esper hybrid Rogue. Every card you discard is exiled instead, and when Toluz dies those cards come back to your hand.",
  "plan": "Toluz turns every discard into an exile from your graveyard, which is exactly what Ketramose, the New Dawn rewards. Add a discard outlet that pays you, like Queza, Augur of Agonies, and the loop drains the table.",
  "combo": {
   "id": "325-1786-6282",
   "pieces": "Toluz + Ketramose, the New Dawn + Queza, Augur of Agonies (1 more piece on Commander Spellbook)",
   "result": "Near-infinite life loss for the table, infinite draw and rummaging",
   "decks": 329
  },
  "alt": {
   "id": "325-602-6282",
   "pieces": "Toluz + Ketramose + Feast of Sanity (1 more piece)",
   "result": "Near-infinite damage",
   "decks": 372
  },
  "watch": "A 3/1 body dies to everything. That is half the point (you get your cards back), but the combo needs Toluz alive.",
  "traits": {
   "loop": 2,
   "yard": 2,
   "engine": 1,
   "rule": 2,
   "control": 1,
   "complex": 2
  },
  "name": "Toluz, Clever Conductor",
  "cost": "{W/U}{U}{U/B}",
  "type": "Legendary Creature Human Rogue",
  "pt": "3/1",
  "oracle": "When Toluz, Clever Conductor enters, it connives. (Draw a card, then discard a card. If you discarded a nonland card, put a +1/+1 counter on this creature.)\nWhenever you discard one or more cards, exile them from your graveyard.\nWhen Toluz dies, put the cards exiled with it into their owner's hand."
 },
 {
  "id": "teshar",
  "slug": "teshar-ancestors-apostle",
  "colors": "W",
  "decks": 1840,
  "rank": 1223,
  "power": 5,
  "hook": "Every artifact you cast revives a creature",
  "pitch": "A 4-mana white Bird. Whenever you cast a historic spell (artifact, legendary or Saga), return a creature with mana value 3 or less from your graveyard to the battlefield.",
  "plan": "Cheap artifacts and 0-mana creatures like Myr Retriever and Ornithopter loop through the graveyard. Krark-Clan Ironworks or Ashnod's Altar turns the loop into mana, cards or damage.",
  "combo": {
   "id": "2866-4659-4986-5034",
   "pieces": "Teshar + Scrap Trawler + Krark-Clan Ironworks + Sol Ring",
   "result": "Infinite death and enters triggers and infinite colorless mana",
   "decks": 4783
  },
  "alt": {
   "id": "413-1020-4986--2",
   "pieces": "Teshar + Myr Retriever + Blasting Station (1 more piece)",
   "result": "Infinite damage",
   "decks": 1902
  },
  "watch": "Mono-white artifact loops are fragile to graveyard hate and artifact wipes, and the loops are long to explain at the table.",
  "traits": {
   "artifacts": 3,
   "loop": 3,
   "creatures": 2,
   "yard": 2,
   "complex": 3
  },
  "name": "Teshar, Ancestor's Apostle",
  "cost": "{3}{W}",
  "type": "Legendary Creature Bird Cleric",
  "pt": "2/2",
  "oracle": "Flying\nWhenever you cast a historic spell, return target creature card with mana value 3 or less from your graveyard to the battlefield. (Artifacts, legendaries, and Sagas are historic.)"
 },
 {
  "id": "drana",
  "slug": "drana-and-linvala",
  "colors": "WB",
  "decks": 1878,
  "rank": 1216,
  "power": 4,
  "hook": "Their creatures' powers are now yours",
  "pitch": "Opponents can't activate their creatures' abilities, and Drana and Linvala has all of those abilities, payable with mana of any color.",
  "plan": "Every mana dork, sac outlet and engine creature the table plays stops working for them and starts working for you. The 99 brings its own Orzhov combo and borrows the rest.",
  "combo": {
   "id": "233-714-1262",
   "pieces": "Drana and Linvala + Kormus Bell + Urborg, Tomb of Yawgmoth",
   "result": "Opponents' lands become creatures, so they can't tap them for mana",
   "decks": 332
  },
  "watch": "That combo is mass land denial: legal in Bracket 4 but it reads as hard stax, which you said you want to avoid. Build around the borrowing, not the lock.",
  "traits": {
   "steal": 3,
   "rule": 3,
   "control": 3,
   "creatures": 1,
   "complex": 1
  },
  "name": "Drana and Linvala",
  "cost": "{1}{W}{W}{B}",
  "type": "Legendary Creature Vampire Angel",
  "pt": "3/4",
  "oracle": "Flying, vigilance\nActivated abilities of creatures your opponents control can't be activated.\nDrana and Linvala has all activated abilities of all creatures your opponents control. You may spend mana as though it were mana of any color to activate those abilities."
 },
 {
  "id": "taigam",
  "slug": "taigam-master-opportunist",
  "colors": "U",
  "decks": 2140,
  "rank": 1124,
  "power": 4,
  "hook": "Your second spell happens twice",
  "pitch": "A 2-mana Monk. Your second spell each turn is copied, and the original is exiled with suspend so you cast it again for free a few turns later.",
  "plan": "Copy an extra-turn spell and suspend it, then use Clockspinning style effects to pull time counters off. Each turn sets up the next, so the deck takes turns in a row.",
  "combo": {
   "id": "112-957-6496",
   "pieces": "Taigam + Clockspinning + Time Stretch",
   "result": "Infinite turns",
   "decks": 891
  },
  "watch": "Suspend math and time counters make turns long and fiddly. Mono-blue also has few ways to answer an artifact or enchantment.",
  "traits": {
   "time": 3,
   "spells": 3,
   "loop": 2,
   "complex": 3,
   "control": 1
  },
  "name": "Taigam, Master Opportunist",
  "cost": "{1}{U}",
  "type": "Legendary Creature Human Monk",
  "pt": "2/2",
  "oracle": "Flurry — Whenever you cast your second spell each turn, copy it, then exile the spell you cast with four time counters on it. If it doesn't have suspend, it gains suspend. (At the beginning of its owner's upkeep, they remove a time counter. When the last is removed, they may play it without paying its mana cost. If it's a creature, it has haste.)"
 },
 {
  "id": "feldon",
  "slug": "feldon-of-the-third-path",
  "colors": "R",
  "decks": 2304,
  "rank": 1061,
  "power": 3,
  "hook": "Your graveyard attacks every turn",
  "pitch": "A 3-mana red Artificer. Pay {2}{R} and tap: make a hasty token copy of any creature card in your graveyard until end of turn.",
  "plan": "Discard or mill your best creatures, then copy one each turn: an extra-combat creature, a Dockside-style treasure maker or a big enters trigger. Combat Celebrant plus Determined Iteration gives every combat a new one.",
  "combo": {
   "id": "57-2105-3934",
   "pieces": "Feldon + Combat Celebrant + Determined Iteration (1 more piece on Commander Spellbook)",
   "result": "Infinite combat phases and hasty tokens",
   "decks": 2387
  },
  "watch": "Mono-red has thin card selection and no counters, and the plan dies to graveyard hate.",
  "traits": {
   "time": 2,
   "creatures": 2,
   "yard": 3,
   "engine": 2,
   "loop": 2,
   "complex": 1
  },
  "name": "Feldon of the Third Path",
  "cost": "{1}{R}{R}",
  "type": "Legendary Creature Human Artificer",
  "pt": "2/3",
  "oracle": "{2}{R}, {T}: Create a token that's a copy of target creature card in your graveyard, except it's an artifact in addition to its other types. It gains haste. Sacrifice it at the beginning of the next end step."
 },
 {
  "id": "mairsil",
  "slug": "mairsil-the-pretender",
  "colors": "UBR",
  "decks": 2341,
  "rank": 1049,
  "power": 4,
  "hook": "Cage a card, steal its powers",
  "pitch": "Exile artifacts or creatures with cage counters, and Mairsil has every activated ability of every caged card (each once per turn).",
  "plan": "Bury or discard the right creatures, cage them, and give Mairsil two abilities that kill together. Aetherling plus Nevinyrral's Disk (with Anger) wipes the board every turn, and Hateflayer plus Tree of Perdition kills a player outright.",
  "combo": {
   "id": "2615-4449-5112",
   "pieces": "Mairsil + Hateflayer + Tree of Perdition (2 more pieces on Commander Spellbook)",
   "result": "Target opponent loses the game",
   "decks": 985
  },
  "alt": {
   "id": "1369-2645-5112-5116",
   "pieces": "Mairsil + Quicksilver Elemental + Gilded Lotus + Staff of Domination (1 more piece)",
   "result": "Infinite draw, mana and life",
   "decks": 797
  },
  "watch": "Cage counters only come from Mairsil's enter trigger, so you blink or recast him a lot. High complexity: you track many abilities at once.",
  "traits": {
   "engine": 3,
   "rule": 2,
   "yard": 2,
   "loop": 2,
   "steal": 1,
   "complex": 3
  },
  "name": "Mairsil, the Pretender",
  "cost": "{1}{U}{B}{R}",
  "type": "Legendary Creature Human Wizard",
  "pt": "4/4",
  "oracle": "When Mairsil, the Pretender enters, you may exile an artifact or creature card from your hand or graveyard and put a cage counter on it.\nMairsil, the Pretender has all activated abilities of all cards you own in exile with cage counters on them. You may activate each of those abilities only once each turn."
 },
 {
  "id": "oswald",
  "slug": "oswald-fiddlebender",
  "colors": "W",
  "decks": 2401,
  "rank": 1038,
  "power": 4,
  "hook": "Trade up one artifact at a time",
  "pitch": "A 2-mana Gnome. {W}, tap, sacrifice an artifact: put an artifact with mana value one higher straight from your library onto the battlefield.",
  "plan": "A tutor chain: 0-drops become 1-drops become 2-drops, every turn, until the combo artifact lands. EDHREC's top cards (Scrap Trawler, Myr Retriever, Sculpting Steel, Thousand-Year Elixir, Rings of Brighthearth) point at artifact loops.",
  "combo": null,
  "nocombo": "Commander Spellbook lists no combo with Oswald as a piece. He is the tutor that finds one, at sorcery speed.",
  "watch": "Sorcery speed and one step per turn: the chain is slow if he dies. Mono-white means few counters to protect him.",
  "traits": {
   "artifacts": 3,
   "tutor": 3,
   "engine": 3,
   "loop": 1,
   "complex": 2
  },
  "name": "Oswald Fiddlebender",
  "cost": "{1}{W}",
  "type": "Legendary Creature Gnome Artificer",
  "pt": "2/2",
  "oracle": "Magical Tinkering — {W}, {T}, Sacrifice an artifact: Search your library for an artifact card with mana value equal to 1 plus the sacrificed artifact's mana value, put it onto the battlefield, then shuffle. Activate only as a sorcery."
 },
 {
  "id": "jeleva",
  "slug": "jeleva-nephalias-scourge",
  "colors": "UBR",
  "decks": 3178,
  "rank": 842,
  "power": 3,
  "hook": "Cast spells from everyone's deck for free",
  "pitch": "As Jeleva enters, every player exiles cards from the top of their library equal to the mana you spent. Whenever she attacks, cast an instant or sorcery from among those cards for free.",
  "plan": "Cast her for a lot of mana (or copy her), then attack with evasion and cast the best spell on the pile, which might be an opponent's tutor, wheel or win. EDHREC's top cards include Mnemonic Deluge, Breach the Multiverse and Cruel Ultimatum.",
  "combo": null,
  "nocombo": "Commander Spellbook lists no combo with Jeleva as a piece. The deck wins with big spells and whatever the exile pile gives it.",
  "watch": "High variance, and a 1/3 flyer has to survive combat. Fun and unpredictable more than very high B4.",
  "traits": {
   "steal": 2,
   "spells": 3,
   "chaos": 3,
   "finite": 2,
   "complex": 2
  },
  "name": "Jeleva, Nephalia's Scourge",
  "cost": "{1}{U}{B}{R}",
  "type": "Legendary Creature Vampire Wizard",
  "pt": "1/3",
  "oracle": "Flying\nWhen Jeleva, Nephalia's Scourge enters, each player exiles the top X cards of their library, where X is the amount of mana spent to cast Jeleva.\nWhenever Jeleva attacks, you may cast an instant or sorcery spell from among cards exiled with Jeleva without paying its mana cost."
 },
 {
  "id": "arcum",
  "slug": "arcum-dagsson",
  "colors": "U",
  "decks": 3179,
  "rank": 841,
  "power": 4,
  "hook": "Turn any artifact creature into the artifact you need",
  "pitch": "A 4-mana Artificer. Tap: sacrifice an artifact creature (any player's), and its controller may put a noncreature artifact from their library onto the battlefield.",
  "plan": "Turn a Myr or an Ornithopter into the exact artifact you need, at instant speed. March of the Machines plus Myr Turbine and Intruder Alarm dumps your whole library of artifacts onto the battlefield.",
  "combo": {
   "id": "893-1014-1636-4694",
   "pieces": "Arcum + March of the Machines + Myr Turbine + Intruder Alarm (1 more piece)",
   "result": "Puts every noncreature artifact from your library onto the battlefield",
   "decks": 24
  },
  "watch": "Arcum was a classic old cEDH commander, so the obvious build looks like a cEDH shell. A B4 build needs its own twist.",
  "traits": {
   "artifacts": 3,
   "tutor": 3,
   "engine": 3,
   "loop": 2,
   "control": 1,
   "complex": 2
  },
  "name": "Arcum Dagsson",
  "cost": "{3}{U}",
  "type": "Legendary Creature Human Artificer",
  "pt": "2/2",
  "oracle": "{T}: Target artifact creature's controller sacrifices it. That player may search their library for a noncreature artifact card, put it onto the battlefield, then shuffle."
 },
 {
  "id": "sharuum",
  "slug": "sharuum-the-hegemon",
  "colors": "WUB",
  "decks": 3180,
  "rank": 851,
  "power": 4,
  "hook": "The artifact Sphinx that loops forever",
  "pitch": "A 5-mana Esper artifact Sphinx. When it enters, return an artifact card from your graveyard to the battlefield.",
  "plan": "A copy of Sharuum (Phyrexian Metamorph, Sculpting Steel) enters and returns the copy that died, over and over with a free sac outlet, so every death trigger and enters trigger repeats.",
  "combo": {
   "id": "3734-4112",
   "pieces": "Sharuum + Phyrexian Metamorph (+ a free sacrifice outlet)",
   "result": "Infinite death, enters and leaves triggers",
   "decks": 7306
  },
  "alt": {
   "id": "661-4112",
   "pieces": "Sharuum + Sculpting Steel",
   "result": "Infinite death and enters triggers",
   "decks": 5196
  },
  "watch": "Five mana and a well-known two-card loop. Esper artifacts is very open to artifact wipes.",
  "traits": {
   "artifacts": 3,
   "loop": 3,
   "yard": 2,
   "creatures": 1,
   "control": 1,
   "complex": 1
  },
  "name": "Sharuum the Hegemon",
  "cost": "{3}{W}{U}{B}",
  "type": "Legendary Artifact Creature Sphinx",
  "pt": "5/5",
  "oracle": "Flying\nWhen Sharuum the Hegemon enters, you may return target artifact card from your graveyard to the battlefield."
 },
 {
  "id": "tameshi",
  "slug": "tameshi-reality-architect",
  "colors": "UW",
  "decks": 3375,
  "rank": 799,
  "power": 4,
  "hook": "Bounce a land, rebuild your board",
  "pitch": "Return a land to hand and pay {X}{W}: put an artifact or enchantment with mana value X or less from your graveyard onto the battlefield. Draws a card each turn something noncreature returns to hand.",
  "plan": "Lotus Bloom, Patron of the Moon and bounce lands turn the land-bounce cost into a mana loop, and every loop also brings back your artifacts and enchantments. An enchantments-and-artifacts value deck that ends in a loop.",
  "combo": {
   "id": "231-774-3390",
   "pieces": "Tameshi + Patron of the Moon + Lotus Bloom (1 more piece)",
   "result": "Infinite mana and landfall, returns every artifact and enchantment from your graveyard",
   "decks": 1433
  },
  "alt": {
   "id": "231-1361-2210-3390",
   "pieces": "Tameshi + Lotus Bloom + Mirrormade + Ancient Den",
   "result": "Infinite landfall and storm count",
   "decks": 1319
  },
  "watch": "Sorcery speed only, and the loops need specific lands and artifacts. Medium-high complexity.",
  "traits": {
   "lands": 2,
   "walkers": 2,
   "artifacts": 2,
   "loop": 2,
   "engine": 2,
   "yard": 1,
   "complex": 2
  },
  "name": "Tameshi, Reality Architect",
  "cost": "{2}{U}",
  "type": "Legendary Creature Moonfolk Wizard",
  "pt": "2/3",
  "oracle": "Whenever one or more noncreature permanents are returned to hand, draw a card. This ability triggers only once each turn.\n{X}{W}, Return a land you control its owner's hand: Return target artifact or enchantment card with mana value X or less from your graveyard to the battlefield. Activate only as a sorcery."
 },
 {
  "id": "esix",
  "slug": "esix-fractal-bloom",
  "colors": "UG",
  "decks": 3862,
  "rank": 727,
  "power": 3,
  "hook": "Every token is a copy of your best creature",
  "pitch": "The first time each of your turns you would make tokens, you may make that many copies of another creature instead.",
  "plan": "Make a pile of tokens with Avenger of Zendikar or Hornet Queen, but make them copies of Biovisionary. At the next end step you control four Biovisionaries and win.",
  "combo": {
   "id": "430-2567-2743",
   "pieces": "Esix + Biovisionary + Avenger of Zendikar (2 more pieces)",
   "result": "Win the game",
   "decks": 3706
  },
  "alt": {
   "id": "430-2743-3433",
   "pieces": "Esix + Biovisionary + Hornet Queen (1 more piece)",
   "result": "Win the game",
   "decks": 3380
  },
  "watch": "Six mana commander, and the Biovisionary win waits a full end step with a big board in plain view.",
  "traits": {
   "creatures": 3,
   "loop": 1,
   "finite": 2,
   "lands": 1,
   "complex": 1
  },
  "name": "Esix, Fractal Bloom",
  "cost": "{4}{G}{U}",
  "type": "Legendary Creature Fractal",
  "pt": "4/4",
  "oracle": "Flying\nThe first time you would create one or more tokens during each of your turns, you may instead choose a creature other than Esix, Fractal Bloom and create that many tokens that are copies of that creature."
 },
 {
  "id": "volrath",
  "slug": "volrath-the-shapestealer",
  "colors": "BUG",
  "decks": 3965,
  "rank": 726,
  "power": 3,
  "hook": "Become any creature with a counter on it",
  "pitch": "Each combat Volrath puts a -1/-1 counter on a creature. For {1} he becomes a copy of any creature with a counter on it (yours or theirs) until your next turn, keeping this ability.",
  "plan": "Put a counter on the best creature at the table, become it, and use its abilities as a 7/5. With Hapatra and Grim Poppet the -1/-1 counters loop into infinite tokens.",
  "combo": {
   "id": "2228-3108-4116",
   "pieces": "Volrath + Grim Poppet + Hapatra, Vizier of Poisons",
   "result": "Infinite enters triggers and tokens",
   "decks": 128
  },
  "watch": "Copying is strong but slow, and the best combos lean on counters cards that are not B4 staples.",
  "traits": {
   "steal": 2,
   "creatures": 2,
   "engine": 2,
   "loop": 2,
   "complex": 2
  },
  "name": "Volrath, the Shapestealer",
  "cost": "{2}{B}{G}{U}",
  "type": "Legendary Creature Phyrexian Shapeshifter",
  "pt": "7/5",
  "oracle": "At the beginning of combat on your turn, put a -1/-1 counter on up to one target creature.\n{1}: Until your next turn, Volrath, the Shapestealer becomes a copy of target creature with a counter on it, except it's 7/5 and it has this ability."
 },
 {
  "id": "archelos",
  "slug": "archelos-lagoon-mystic",
  "colors": "BUG",
  "decks": 4469,
  "rank": 667,
  "power": 4,
  "hook": "One switch: everything enters untapped (or tapped)",
  "pitch": "While Archelos is untapped, other permanents enter untapped. While tapped, other permanents enter tapped, including the opponents'.",
  "plan": "Untapped Archelos makes every bounce land, Simic Growth Chamber and ramp land arrive ready, which turns land loops into infinite mana. Tapped, it slows everyone else's creatures and lands.",
  "combo": {
   "id": "224-1671-1772-4826",
   "pieces": "Archelos + Zimone, Quandrix Prodigy + Retreat to Coralhelm + Simic Growth Chamber",
   "result": "Infinite mana and landfall",
   "decks": 684
  },
  "alt": {
   "id": "774-1671-4826",
   "pieces": "Archelos + Patron of the Moon + Simic Growth Chamber",
   "result": "Infinite mana and landfall",
   "decks": 541
  },
  "watch": "The tapped side can feel like stax if you lean on it. The combos need several lands-matter pieces at once.",
  "traits": {
   "lands": 3,
   "rule": 3,
   "loop": 2,
   "control": 1,
   "complex": 2
  },
  "name": "Archelos, Lagoon Mystic",
  "cost": "{1}{B}{G}{U}",
  "type": "Legendary Creature Turtle Shaman",
  "pt": "2/4",
  "oracle": "As long as Archelos, Lagoon Mystic is tapped, other permanents enter tapped.\nAs long as Archelos is untapped, other permanents enter untapped."
 },
 {
  "id": "agatha",
  "slug": "agatha-of-the-vile-cauldron",
  "colors": "RG",
  "decks": 4773,
  "rank": 615,
  "power": 4,
  "hook": "Creature abilities for almost nothing",
  "pitch": "A 2-mana Warlock. Your creatures' activated abilities cost {X} less, where X is Agatha's power (never below one mana).",
  "plan": "Pump Agatha's power and every creature ability gets cheap. Mana creatures that untap things, like Magus of the Candelabra or Silvanus's Invoker, start making more mana than they cost.",
  "combo": {
   "id": "2092-2816-4657",
   "pieces": "Agatha + Magus of the Candelabra + Umbral Mantle (4 more pieces)",
   "result": "Infinite mana and infinitely large creatures",
   "decks": 1807
  },
  "alt": {
   "id": "573-2092-4954",
   "pieces": "Agatha + Silvanus's Invoker + Gruul Turf (1 more piece)",
   "result": "Infinite red and green mana and infinite power",
   "decks": 1413
  },
  "watch": "A 1/1 body that needs pumping first. Gruul has little protection for a combo commander.",
  "traits": {
   "creatures": 3,
   "engine": 2,
   "loop": 3,
   "rule": 2,
   "complex": 2
  },
  "name": "Agatha of the Vile Cauldron",
  "cost": "{R}{G}",
  "type": "Legendary Creature Human Warlock",
  "pt": "1/1",
  "oracle": "Activated abilities of creatures you control cost {X} less to activate, where X is Agatha of the Vile Cauldron's power. This effect can't reduce the mana in that cost to less than one mana.\n{4}{R}{G}: Other creatures you control get +1/+1 and gain trample and haste until end of turn."
 }
];
