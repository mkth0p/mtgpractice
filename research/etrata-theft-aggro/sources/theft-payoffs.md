# Etrata, Deadly Fugitive: theft payoffs and theft engines (checked 2026-10-05)

Plan: Assassins connect, Etrata cloaks the opponent's top card, you flip or cast their stuff, which gives you more bodies and value, which gives you more connections. Color identity is U/B only.

## Sources and how they were checked

- **Oracle text and prices** come from Card Kingdom search pages: `https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=<Card+Name>`. I read them with WebFetch and asked for the rules text character for character. Each card lists its exact URL.
  - CK shows the **printed** wording of each printing. Older cards still say "enters the battlefield" or "converted mana cost", where current Oracle says "enters" or "mana value". The function is the same.
  - The summarizer drops reminder text and line breaks, and I've rejoined abilities with " / ". The first pass paraphrased a few cards (Thief of Sanity, Dauthi Voidwalker, Nashi, Gonti, Night Minister). I re-asked for verbatim text, and those quotes are the second, verbatim pass.
- **Price** is the lowest in-stock NM price on that CK search page today. I didn't estimate any price. If a lookup failed, the entry says "not verified".
- **Sash and Waistcoat, Unmen:** the rules text and legality come from mtg.wtf (https://mtg.wtf/card/mbc/11/Sash-and-Waistcoat-Unmen). CoolStuffInc showed the same text but no price. CK has no listing, MTGGoldfish returned 404, and TCGplayer is JS-only. **Price not verified.**
- **Commander banned list:** read from https://magic.wizards.com/en/banned-restricted-list. **None of the cards below are banned in Commander.**
- **Game Changers:** read from https://edhrec.com/top/game-changers. Only **Opposition Agent** and **Notion Thief** below are Game Changers. Necropotence, Demonic Tutor and Vampiric Tutor are already in the list and are Game Changers too.
- **EDHREC** pages read:
  - https://edhrec.com/commanders/etrata-deadly-fugitive: 3,272 decks. Themes: Assassins 399, Theft 224, Morph 221, Aggro 49.
  - https://edhrec.com/commanders/etrata-deadly-fugitive/theft: 223 decks.
- **Commander Spellbook** (commanderspellbook.com search for `card:"Etrata, Deadly Fugitive"`): the only combo shown is **Magar of the Magic Strings + Etrata + Brass's Bounty**, which is U/B/R and outside this deck's colors. The backend API is blocked by robots.txt, so I couldn't confirm the count.
- **Decklists:**
  - Moxfield "Etrata Theft" by John Tull (https://moxfield.com/decks/I-rq13Xrg06q9tzn9y22Tw) is JS-only, so I couldn't read the card list. The Moxfield and Archidekt APIs timed out on a permission prompt.
  - The Archidekt deck at https://archidekt.com/decks/12406863/etrata_deadly_fugitive could be read. Its theft and face-down pieces: Leyline of Transformation, Conspiracy, Roaming Throne, Auton Soldier, Primordial Mist, They Came from the Pipes, Glitch Interpreter, Enduring Curiosity, Ugin's Mastery, Panoptic Projektor, Cloudform, Become Anonymous, Kindred Discovery and Black Market Connections.
- **Not redone:** prior research in `underused-tech/sources/*.md` (Assassin bodies, evasion, morph and disguise cards, Roaming Throne, Strionic Resonator, Ixidron, Cryptic Coat). I only re-checked prices for Roaming Throne and Strionic Resonator.
- **Already in the current list, so not researched:** Exquisite Blood, Bloodthirsty Conqueror, Marauding Blight-Priest, Vito, Sanguine Bond, Demonic Tutor, Vampiric Tutor, Diabolic Intent, Scheming Symmetry, Duskmantle Guildmage, Lim-Dûl's Vault, Silumgar Assassin, Hooded Blightfang, Vampire of the Dire Moon, Starscape Cleric, Enduring Tenacity, Tetsuko Umezawa, Virtus the Veiled, Bloodletter of Aclazotz, Training Grounds, Scroll of Fate, Wormfang Manta, Crystal Shard, Necropotence, Phyrexian Arena, Aetherize and Mutavault. None of the cards below are already in the list.

### Rules points that matter for everything below

1. **Face-down creatures have no creature types.** Cloaked cards, ninjas and Rogues don't trigger Etrata unless they are Assassins.
   - **Leyline of Transformation** or **Arcane Adaptation** naming Assassin fixes this on the battlefield. Every cloaked 2/2 then becomes an Assassin that cloaks again when it connects.
2. **Ninjutsu returns the unblocked attacker to its OWNER's hand.**
   - If you ninjutsu away a cloaked card you stole, it goes back to the opponent's hand and is revealed. Return your own creatures, never stolen face-down ones.
   - Ninjutsu happens in the declare-blockers step, before damage. Whatever you return doesn't deal damage, so return a non-Assassin, or an Assassin whose hit you don't need.
3. **Copies of Etrata double her cloak trigger.** Each copy (Spark Double, Irma, Helm of the Host token) has "Whenever an Assassin you control deals combat damage to an opponent, cloak…", so each Assassin hit cloaks once per Etrata.
   - Spark Double and the Helm token aren't legendary.
   - Irma has a different name, so the legend rule doesn't apply.
4. **Etrata's free cast of an opponent's card is "a spell you don't own."** It triggers Tasha and Gonti, Night Minister.
   - The cast spends no mana, so a creature cast this way also counts for Satoru, the Infiltrator.
   - Turning a creature face up is not casting it and not entering, so it triggers none of these.

---

## A. Payoffs for casting or controlling cards you don't own

**1. Gonti, Night Minister** (Aetherdrift). {2}{B}{B}, Legendary Creature — Aetherborn Rogue, 3/4.
- Oracle: "Whenever a player casts a spell they don't own, that player creates a Treasure token. Whenever a creature deals combat damage to one of your opponents, its controller looks at the top card of that opponent's library and exiles it face down. They may play that card for as long as it remains exiled. Mana of any type can be spent to cast a spell this way."
- Legal, not a Game Changer. **$1.79**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Gonti%2C+Night+Minister
- Fit: **excellent.** Every connect steals a second card on top of Etrata's cloak. Every Etrata free-cast, Hostage Taker cast and Thief of Sanity cast makes a Treasure.
- Gotchas:
  - It's **symmetric for attackers.** An opponent's creature hitting another opponent also steals for that opponent, and they get Treasures when they cast your cards.
  - Gonti himself is a Rogue, not an Assassin.

**2. Gonti, Lord of Luxury.** {2}{B}{B}, Legendary Creature — Aetherborn Rogue, 2/3.
- Oracle (Kaladesh print): "Deathtouch / When Gonti, Lord of Luxury enters the battlefield, look at the top four cards of target opponent's library, exile one of them face down, the put the rest on the bottom of that library in a random order. For as long as that card remains exiled, you may look at it, you may cast it, and you may spend mana as though it were mana of any type to cast it." The "the put" typo is on CK's page.
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Gonti%2C+Lord+of+Luxury
- Fit: good. It steals one card on ETB, and the deathtouch body is like Etrata's.
- Gotcha: it's a one-shot theft with no combat link. Flicker effects (Ghostly Flicker, Conjurer's Closet) repeat it.

**3. Gonti, Canny Acquisitor.** {2}{B}{U}{G}. **Not legal in this deck: its color identity is B/U/G.**
- Oracle: "Spells you cast but don't own cost 1 less to cast. Whenever one or more creatures you control deal combat damage to a player, look at the top card of that player's library, then exile it face down. You may play that card for as long as it remains exiled, and mana of any type can be spent to cast that spell."
- $2.79, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Gonti%2C+Canny+Acquisitor
- Listed only to rule it out.

**4. Tasha, the Witch Queen.** {3}{U}{B}, Legendary Planeswalker — Tasha, loyalty 4.
- Oracle: "Whenever you cast a spell you don't own, create a 3/3 black Demon creature token. / +1: Draw a card. For each opponent, exile up to one target instant or sorcery card from that player's graveyard and put a page counter on it. / −3: You may cast a spell from among cards in exile with page counters on them without paying its mana cost."
- Legal, not a Game Changer. **$8.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Tasha%2C+the+Witch+Queen
- Fit: **excellent.** Every Etrata exile-and-cast of an opponent's instant or sorcery, and every Gonti, Thief of Sanity, Hostage Taker or Fallen Shinobi cast, makes a 3/3 body.
- Her +1 eats the instants and sorceries Etrata cast once they reach the opponent's graveyard.
- Gotcha: the Demons aren't Assassins unless Leyline is out.

**5. Thieving Amalgam.** {5}{B}{B}, Creature — Ape Snake, 6/7. Prior research mentioned it briefly.
- Oracle: "At the beginning of each opponent's upkeep, you manifest the top card of that player's library. / Whenever a creature you control but don't own dies, its owner loses 2 life and you gain 2 life."
- Legal, not a Game Changer. **$0.99** (C19), https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thieving+Amalgam
- Fit: very good in this plan. It gives three free face-down bodies per round, and Etrata can flip all of them.
- The drain hits whenever a stolen face-down creature dies, because you control it and the opponent owns it. That makes chump-attacks with cloaks profitable.
- Gotchas:
  - Manifested cards have **no ward**, unlike cloaked ones.
  - With Leyline (Assassin), these become Assassins that trigger Etrata.
  - At 7 mana it's slow.

**6. Hostage Taker.** {2}{U}{B}, Creature — Human Pirate, 2/3.
- Oracle: "When Hostage Taker enters the battlefield, exile another target creature or artifact until Hostage Taker leaves the battlefield. You may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any type to cast that spell."
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Hostage+Taker
- Fit: very good. It's removal that becomes theft, and casting the stolen card triggers Tasha and Gonti, Night Minister.
- Gotcha: if Hostage Taker leaves before you cast the card, it returns to its owner.

**7. Thief of Sanity.** {1}{U}{B}, Creature — Specter, 2/2.
- Oracle: "Flying / Whenever Thief of Sanity deals combat damage to a player, look at the top three cards of that player's library, exile one of them face down, then put the rest into their graveyard. For as long as that card remains exiled, you may look at it, you may cast it, and you may spend mana as though it were mana of any type to cast that spell."
- Legal, not a Game Changer. **$0.69**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thief+of+Sanity
- Fit: **best cheap theft body.** It's an evasive 3-drop that picks the best of three cards.
- With Leyline (Assassin), the same hit also triggers Etrata, so you get two stolen cards per swing.
- Gotcha: it's a 2/2 that dies to everything.

**8. Notion Thief.** {2}{U}{B}, Creature — Human Rogue, 3/1.
- Oracle: "Flash / If an opponent would draw a card except the first one they draw in each of their draw steps, instead that player skips that draw and you draw a card."
- Legal. **GAME CHANGER.** **$2.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Notion+Thief
- Fit: medium. It's theft of draws, not cards, and doesn't use combat. It uses a Game Changer slot.

**9. Opposition Agent.** {2}{B}, Creature — Human Rogue, 3/2.
- Oracle: "Flash / You control your opponents while they're searching their libraries. / While an opponent is searching their library, they exile each card they find. You may play those cards for as long as they remain exiled, and you may spend mana as though it were mana of any color to cast them."
- Legal. **GAME CHANGER.** **$24.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Opposition+Agent
- Fit: strong theft in tutor- and ramp-heavy pods, and does nothing against precons that rarely search. It costs a Game Changer slot.
- Gotcha: the "any color" clause doesn't cover colorless {C} costs.

**10. Dauthi Voidwalker.** {B}{B}, Creature — Dauthi Rogue, 3/2.
- Oracle: "Shadow (This creature can block or be blocked by only creatures with shadow.) / If a card would be put into an opponent's graveyard from anywhere, instead exile it with a void counter on it. / {T}, Sacrifice Dauthi Voidwalker: Choose an exiled card an opponent owns with a void counter on it. You may play it this turn without paying its mana cost."
- Legal, not a Game Changer. **$6.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Dauthi+Voidwalker
- Fit: very good.
  - Shadow makes it all but unblockable. With Leyline it's an Assassin that triggers Etrata every turn.
  - An opponent's instant cast by Etrata goes to that opponent's graveyard after resolving, so it gets exiled with a void counter instead. Stolen face-down creatures that die get void counters too. Later, sacrifice Dauthi to replay the best one.
- Gotcha: it can't block normal creatures.

**11. Hedonist's Trove.** {5}{B}{B}, Enchantment.
- Oracle: "When Hedonist's Trove enters the battlefield, exile target opponent's graveyard. You may play lands from among cards exiled with Hedonist's Trove. You may cast spells from among cards exiled with Hedonist's Trove. You can't cast more than one spell this way each turn."
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Hedonist%27s+Trove
- Fit: weak to medium. It's 7 mana, does nothing for combat, and you pay the stolen cards' normal colored costs.

**12. Covetous Urge.** {U/B}{U/B}{U/B}{U/B}, Sorcery.
- Oracle: "Target opponent reveals their hand. You choose a nonland card from that player's graveyard or hand and exile it. You may cast that card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell."
- Legal, not a Game Changer. **$0.35**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Covetous+Urge
- Fit: fine filler. It's a cheap guaranteed steal plus disruption, and the cast triggers Tasha and Gonti, Night Minister. It doesn't use combat.

**13. Praetor's Grasp.** {1}{B}{B}, Sorcery.
- Oracle: "Search target opponent's library for a card and exile it face down. Then that player shuffles. You may look at and play that card for as long as it remains exiled."
- Legal, not a Game Changer. **$11.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Praetor%27s+Grasp
- Fit: medium. It tutors the opponent's best card, but there's no "any type" mana clause, so you need the right colors.
- An earlier round's sim cut it as weak (underused-tech/RESULTS.md).

**14. Bribery.** {3}{U}{U}, Sorcery.
- Oracle: "Search target opponent's library for a creature card and put that card onto the battlefield under your control. Then that player shuffles."
- Legal, not a Game Changer. **$6.49** (TLA Eternal-Legal variant), https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Bribery
- Fit: medium. It grabs the best fatty from a precon deck. It isn't a cast, so no Tasha or Gonti trigger.

**15. Treachery.** {3}{U}{U}, Enchantment — Aura.
- Oracle (Urza's Destiny print): "Enchant creature / When Treachery enters the battlefield, untap up to five lands. / You control enchanted creature."
- Legal. Not on the Game Changer list as fetched. **$40.79**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Treachery
- Fit: strong, since it's a free steal, but expensive. With Leyline the stolen creature becomes an Assassin.

**16. Mind's Dilation.** {5}{U}{U}, Enchantment.
- Oracle: "Whenever an opponent casts their first spell each turn, that player exiles the top card of their library. If it's a nonland card, you may cast it without paying its mana cost."
- Legal, not a Game Changer. **$0.99** (Marvel Eternal-Legal print), https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Mind%27s+Dilation
- Fit: medium. It's 7 mana and doesn't use combat, but it makes up to three free stolen casts per round, each triggering Tasha and Gonti.

**17. Ashiok, Nightmare Muse.** {3}{U}{B}, Legendary Planeswalker — Ashiok, loyalty 5.
- Oracle: "+1: Create a 2/3 blue and black Nightmare creature token with 'Whenever this creature attacks or blocks, each opponent exiles the top two cards of their library.' / −3: Return target nonland permanent to its owner's hand, then that player exiles a card from their hand. / −7: You may cast up to three face-up cards your opponents own from exile without paying their mana costs."
- Legal, not a Game Changer. **$4.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ashiok%2C+Nightmare+Muse
- Fit: medium. It makes a body and removal every turn.
- Gotcha: the −7 can't cast **face-down** exiled cards. Etrata exiles face-down cards face up when she flips them, though.

**18. Ashiok, Sculptor of Fears.** {4}{U}{B}, Legendary Planeswalker — Ashiok, loyalty 4.
- Oracle: "+2: Draw a card. Each player mills two cards. / −5: Put target creature card from a graveyard onto the battlefield under your control. / −11: Gain control of all creatures target opponent controls."
- Legal, not a Game Changer. **$3.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ashiok%2C+Sculptor+of+Fears
- Fit: weak. It's slow and does nothing for combat.

**19. Black Cat, Cunning Thief** (Marvel's Spider-Man, 2025). {3}{B}{B}, Legendary Creature — Human Rogue Villain, 2/3.
- Oracle: "When Black Cat enters, look at the top nine cards of target opponent's library, exile two of them face down, then put the rest on the bottom of their library in a random order. You may play the exiled cards for as long as they remain exiled. Mana of any type can be spent to cast spells this way."
- Legal, not a Game Changer. **$0.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Black+Cat%2C+Cunning+Thief
- Fit: good. It picks two of nine, which is better selection than Gonti, Lord of Luxury, and works well with flicker effects. No combat link.

**20. Mindleecher.** {4}{B}{B}, Creature — Nightmare, 5/5.
- Oracle: "Mutate {4}{B} … / Flying / Whenever this creature mutates, exile the top card of each opponent's library face down. You may look at and play those cards for as long as they remain exiled." Reminder text omitted.
- Legal, not a Game Changer. **$0.79**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Mindleecher
- Fit: niche. Mutating it onto Etrata (a Vampire, so non-Human) gives her flying and a 5/5 body while keeping her triggers.
- Gotchas:
  - If Etrata goes under it, the merged creature has Mindleecher's name and types, so it's **no longer an Assassin** unless Leyline is out.
  - No "any type" mana clause.

## B. Combat-damage theft bodies and Ninjas

**21. Nashi, Moon Sage's Scion.** {1}{B}{B}, Legendary Creature — Rat Ninja, 3/2.
- Oracle: "Ninjutsu {3}{B} (…) / Whenever Nashi, Moon Sage's Scion deals combat damage to a player, exile the top card of each player's library. Until end of turn, you may play one of those cards. If you cast a spell this way, pay life equal to its mana value rather than paying its mana cost."
- Legal, not a Game Changer. **$3.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Nashi%2C+Moon+Sage%27s+Scion
- Fit: good. You see four cards (one from each library) and pick one, paid with life. The rest stay exiled.
- Gotcha: it exiles your own top card too.

**22. Fallen Shinobi.** {3}{U}{B}, Creature — Zombie Ninja, 5/4.
- Oracle: "Ninjutsu {2}{U}{B} (…) / Whenever Fallen Shinobi deals combat damage to a player, that player exiles the top two cards of their library. Until end of turn, you may play those cards without paying their mana costs."
- Legal, not a Game Changer. **$7.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Fallen+Shinobi
- Fit: strong. Two free cards per hit, both "spells you don't own" for Tasha and Gonti. With Leyline it's also an Assassin, so Etrata cloaks too.
- An earlier sim (underused-tech/RESULTS.md) had it slightly weak in a different list.

**23. Silent-Blade Oni.** Mana cost {3}{U}{U}{B}{B}. CK's page rendered it as "3UUBb", and I read that as UU BB. Creature — Demon Ninja, 6/5.
- Oracle: "Ninjutsu {4}{U}{B} / Whenever Silent-Blade Oni deals combat damage to a player, look at that player's hand. You may cast a nonland card in it without paying that card's mana cost."
- Legal, not a Game Changer. **$7.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Silent-Blade+Oni
- Fit: medium. It's huge value, but the 6-mana ninjutsu is clunky.

**24. Thousand-Faced Shadow.** {U}, Creature — Human Ninja, 1/1.
- Oracle: "Ninjutsu {2}{U}{U} (…) / Flying / When Thousand-Faced Shadow enters the battlefield from your hand, if it's attacking, create a token that's a copy of another target attacking creature. The token enters the battlefield tapped and attacking."
- Legal, not a Game Changer. **$2.29**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thousand-Faced+Shadow
- Fit: medium-good. Copy an attacking Assassin such as Hired Poisoner or Thief of Sanity (with Leyline), and you get two connections.
- Gotchas:
  - Copying Etrata creates a legendary token, so the legend rule applies.
  - Copying a face-down creature gives a plain 2/2 copy that can't be turned face up. I didn't fetch the ruling.
  - Don't return a stolen face-down card to pay for ninjutsu.

**25. Mistblade Shinobi.** {2}{U}, Creature — Human Ninja, 1/1.
- Oracle: "Ninjutsu {U} (…) / Whenever Mistblade Shinobi deals combat damage to a player, you may return target creature that player controls to its owner's hand."
- Legal, not a Game Changer. **$1.19**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Mistblade+Shinobi
- Fit: tempo only, not theft. Returning a 1-mana unblocked Assassin replays its ETB.

**26. Silver-Fur Master.** {U}{B}, Creature — Rat Ninja, 2/2.
- Oracle: "Ninjutsu {U}{B} / Ninjutsu abilities you activate cost {1} less to activate. / Other Ninja and Rogue creatures you control get +1/+1."
- Legal, not a Game Changer. **$0.39**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Silver-Fur+Master
- Fit: only if you run 5+ ninjas. The anthem hits Rogues (Gonti, Thief of Sanity is not a Rogue, Notion Thief, Dauthi) but not Assassins.

**27. Satoru Umezawa.** {1}{U}{B}, Legendary Creature — Human Ninja, 2/4.
- Oracle: "Whenever you activate a ninjutsu ability, look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. This ability triggers only once each turn. / Each creature card in your hand has ninjutsu {2}{U}{B}."
- Legal, not a Game Changer. **$0.79**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Satoru+Umezawa
- Fit: medium. It turns every Assassin in hand into a ninja, so an unblocked 1-drop becomes a surprise Fallen Shinobi or Black Cat (ETB).
- Gotcha: the returned attacker doesn't deal damage that combat.

**28. Satoru, the Infiltrator** (OTJ). {U}{B}, Legendary Creature — Human Ninja Rogue, 2/3.
- Oracle: "Menace / Whenever Satoru, the Infiltrator and/or one or more other nontoken creatures enter the battlefield under your control, if none of them were cast or no mana was spent to cast them, draw a card."
- Legal, not a Game Changer. **$1.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Satoru%2C+the+Infiltrator
- Fit: **excellent sleeper.** These all draw a card:
  - Every **Etrata cloak**: a nontoken face-down creature enters without being cast.
  - Every Thieving Amalgam manifest.
  - Every Etrata free-cast **creature** (no mana spent).
  - Every ninjutsu.
- It's a 2-mana menace body. EDHREC: 43% of Etrata theft decks.

**29. Ingenious Infiltrator.** {2}{U}{B}, Creature — Vedalken Ninja, 2/3.
- Oracle: "Ninjutsu {U}{B} (…) / Whenever a Ninja you control deals combat damage to a player, draw a card."
- Legal, not a Game Changer. **$1.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ingenious+Infiltrator
- Fit: only with a ninja subtheme. Leyline can't name both Ninja and Assassin. Arcane Adaptation plus Leyline could.

**30. Prosperous Thief.** {2}{U}, Creature — Human Ninja, 3/2.
- Oracle: "Ninjutsu {1}{U} (…) / Whenever one or more Ninja or Rogue creatures you control deal combat damage to a player, create a Treasure token."
- Legal, not a Game Changer. **$0.69**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Prosperous+Thief
- Fit: weak to medium. The Treasure helps pay Etrata's {2}{U}{B} flips.

**31. Tinybones, the Pickpocket** (OTJ). {B}, Legendary Creature — Skeleton Rogue, 1/1.
- Oracle: "Deathtouch / Whenever Tinybones, the Pickpocket deals combat damage to a player, you may cast target nonland permanent card from that player's graveyard, and mana of any type can be spent to cast that spell."
- Legal, not a Game Changer. **$9.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Tinybones%2C+the+Pickpocket
- Fit: good with Leyline, where it's a 1-mana deathtouch Assassin that steals and cloaks.
- Stolen cloaked creatures that die go to their owner's graveyard, and Tinybones can recast them.
- Gotchas:
  - It needs evasion.
  - It conflicts with Dauthi Voidwalker, which exiles opponents' graveyards.

**32. Nightveil Specter.** {U/B}{U/B}{U/B} (CK shows "UUB"; the card is hybrid). Creature — Specter, 2/3.
- Oracle (Gatecrash print): "Flying / Whenever Nightveil Specter deals combat damage to a player, that player exiles the top card of their library. / You may play lands and cast spells from among cards exiled with Nightveil Specter."
- CK's Guild Kit print says "You may play cards exiled with Nightveil Specter." Same function.
- Legal, not a Game Changer. **$1.03**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Nightveil+Specter
- Fit: medium. It's a 3-mana evasive thief.
- Gotcha: **no "any type" mana clause**, so off-color steals are stuck.

**33. Thada Adel, Acquisitor.** {1}{U}{U}, Legendary Creature — Merfolk Rogue, 2/2.
- Oracle: "Islandwalk / Whenever Thada Adel, Acquisitor deals combat damage to a player, search that player's library for an artifact card and exile it. Then that player shuffles. Until end of turn, you may play that card."
- Legal, not a Game Changer. **$11.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Thada+Adel%2C+Acquisitor
- Fit: medium. It's a tutor-steal of Sol Rings and Signets, but you still pay the cost, and islandwalk only works against blue players.

**34. Locke Cole** (Final Fantasy). {1}{U}{B}, Legendary Creature — Human Rogue, 2/3.
- Oracle: "Deathtouch, lifelink / Whenever Locke Cole deals combat damage to a player, draw a card, then discard a card."
- Legal, not a Game Changer. **$0.35**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Locke+Cole
- Fit: filler. It's a "thief" in name only and loots rather than steals. With Leyline it's a deathtouch Assassin and a good blocker.

**35. Kaito, Cunning Infiltrator** (Foundations). {1}{U}{U}, Legendary Planeswalker — Kaito, loyalty 3.
- Oracle: "Whenever a creature you control deals combat damage to a player, put a loyalty counter on Kaito. / +1: Up to one target creature you control can't be blocked this turn. Draw a card, then discard a card. / −2: Create a 2/1 blue Ninja creature token. / −9: You get an emblem with 'Whenever a player casts a spell, you create a 2/1 blue Ninja creature token.'"
- Legal, not a Game Changer. **$2.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Kaito%2C+Cunning+Infiltrator
- Fit: good. The +1 makes Etrata or your best Assassin unblockable every turn for 3 mana, and connections refill its loyalty.

**36. Enduring Curiosity** (Duskmourn). {2}{U}{U}, Enchantment Creature — Cat Glimmer, 4/3.
- Oracle: "Flash / Whenever a creature you control deals combat damage to a player, draw a card. / When Enduring Curiosity dies, if it was a creature, return it to the battlefield under its owner's control. It's an enchantment. (It's not a creature.)"
- Legal, not a Game Changer. **$11.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Enduring+Curiosity
- Fit: good. Every connecting body draws, including face-down cloaks, which need no Assassin type. It's hard to remove.

## C. Making stolen face-down cards more valuable

**37. Leyline of Transformation** (Duskmourn). {2}{U}{U}, Enchantment.
- Oracle: "If Leyline of Transformation is in your opening hand, you may begin the game with it on the battlefield. / As Leyline of Transformation enters, choose a creature type. Creatures you control are the chosen type in addition to their other types."
- Legal, not a Game Changer. **$0.69**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Leyline+of+Transformation
- Fit: **core engine piece.** Naming Assassin turns every cloaked or manifested 2/2, ninja, Rogue thief and Demon token into an Assassin for Etrata.
- Every stolen face-down card that connects steals another card. That is the snowball this plan wants. EDHREC: 57% of Etrata theft decks.

**38. Arcane Adaptation.** {2}{U}, Enchantment.
- Oracle: "As Arcane Adaptation enters the battlefield, choose a creature type. Creatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield."
- Legal, not a Game Changer. **$4.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Arcane+Adaptation
- Fit: a second copy of the Leyline effect, cheaper but with no free start. The "cards you own" clause doesn't reach stolen cards in exile, but on the battlefield it covers face-down creatures.

**39. Sash and Waistcoat, Unmen** (Mystery Booster Commander, #11). {1}{U}, Legendary Creature — Insect Rogue, 2/2.
- Oracle (mtg.wtf): "Whenever a face-down creature attacks one of your opponents, it can't be blocked this combat. / {3}: Manifest the top card of your library. Any player may activate this ability but only as a sorcery."
- Legal in Commander (mtg.wtf), not a Game Changer. **Price not verified:** CK has no listing, MTGGoldfish returned 404, TCGplayer is JS-only, and CoolStuffInc showed no price.
- Fit: **excellent with Leyline.** Every cloaked card becomes an **unblockable Assassin**, so every steal produces a guaranteed future steal. EDHREC: 13% of theft decks, its top "new card".
- Gotchas:
  - The trigger is symmetric. Opponents' face-down creatures attacking your other opponents are also unblockable.
  - Any player can use the {3} manifest at sorcery speed.

**40. They Came from the Pipes** (Duskmourn Commander). {4}{U}, Enchantment.
- Oracle: "When They Came from the Pipes enters, manifest dread twice. / Whenever a face-down creature you control enters, draw a card."
- Legal, not a Game Changer. **$0.69**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=They+Came+from+the+Pipes
- Fit: **excellent.** Each Etrata cloak and each Thieving Amalgam manifest draws a card, and it makes two bodies on arrival. EDHREC: 58% across all Etrata decks, 85x lift.

**41. Glitch Interpreter** (Duskmourn Commander). {2}{U}, Creature — Human Wizard, 2/3.
- Oracle: "When Glitch Interpreter enters, if you control no face-down permanents, return Glitch Interpreter to its owner's hand and manifest dread. / Whenever one or more colorless creatures you control deal combat damage to a player, draw a card."
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Glitch+Interpreter
- Fit: good. Face-down creatures are colorless, so stolen cloaks connecting draw a card.

**42. Primordial Mist.** {4}{U}, Enchantment.
- Oracle: "At the beginning of your end step, you may manifest the top card of your library. (…) / Exile a face-down permanent you control face up: You may play that card this turn."
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Primordial+Mist
- Fit: good. It's a second outlet for cloaked **opponent** cards. You can play a stolen land, or cast a stolen permanent or spell for its normal cost, with no {2}{U}{B} flip fee.
- Gotchas:
  - No "any type" mana clause.
  - You lose the 2/2 body. Etrata's flip is still better for big instants and sorceries.

**43. Ixidor, Reality Sculptor.** {3}{U}{U}, Legendary Creature — Human Wizard, 3/4.
- Oracle: "Face-down creatures get +1/+1. / {2}{U}: Turn target face-down creature face up."
- Legal, not a Game Changer. **$3.59**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ixidor%2C+Reality+Sculptor
- Fit: medium. It's a cheaper flip for stolen creature cards ({2}{U} vs {2}{U}{B}), and your cloaks become 3/3 ward 2.
- Gotchas:
  - It's not a cast, so no Tasha, Gonti or Satoru trigger.
  - Its flip has no "if you can't, exile and cast" clause, so a stolen instant or sorcery stays face down. Use Etrata's flip for those.
  - The +1/+1 also pumps opponents' face-down creatures.

**44. Become Anonymous** (Assassin's Creed). {2}{U}{U}, Instant.
- Oracle: "Exile target nontoken creature you own and the top two cards of your library in a face-down pile, shuffle that pile, then cloak those cards. They enter the battlefield tapped. (…)"
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Become+Anonymous
- Fit: protection plus three face-down bodies. It **only targets creatures you own**, so it can't save stolen ones. It works well with They Came from the Pipes (three draws).

## D. Copying or doubling Etrata's trigger

**45. Roaming Throne.** {4}, Artifact Creature — Golem, 4/4. Covered in prior research.
- Oracle: "Ward {2} / As Roaming Throne enters the battlefield, choose a creature type. / Roaming Throne is the chosen type in addition to its other types. / If a triggered ability of another creature you control of the chosen type triggers, it triggers an additional time."
- Legal, not a Game Changer. **$57.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Roaming+Throne
- Fit: doubles every Etrata cloak trigger. It's the best doubler, but costs $58.

**46. Strionic Resonator.** {2}, Artifact. Covered in prior research.
- Oracle: "{2}, {T}: Copy target triggered ability you control. You may choose new targets for the copy."
- Legal, not a Game Changer. **$8.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Strionic+Resonator
- Fit: one extra cloak per turn cycle. It also copies Thief of Sanity or Fallen Shinobi triggers.

**47. Lithoform Engine.** {4}, Legendary Artifact.
- Oracle: "{2}, {T}: Copy target activated or triggered ability you control. You may choose new targets for the copy. / {3}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy. / {4}, {T}: Copy target permanent spell you control. (The copy becomes a token.)"
- Legal, not a Game Changer. **$8.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Lithoform+Engine
- Fit: medium. It's a pricier Resonator, but it can also copy a stolen instant or sorcery Etrata casts ({3}) or a stolen permanent spell ({4}).

**48. Rings of Brighthearth.** {3}, Artifact.
- Oracle: "Whenever you activate an ability, if it isn't a mana ability, you may pay {2}. If you do, copy that ability. You may choose new targets for the copy."
- Legal, not a Game Changer. **$7.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Rings+of+Brighthearth
- Fit: weak. It copies Etrata's *activated* flip, not her trigger. On one face-down card the copy gives no extra card. I didn't check a ruling on whether the second resolution can cast again, so I'm assuming no extra value.

**49. Spark Double.** {3}{U}, Creature — Illusion, 0/0.
- Oracle: "You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary if that permanent is legendary."
- Legal, not a Game Changer. **$6.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Spark+Double
- Fit: **very good.** It's a non-legendary second Etrata (2/5 deathtouch Assassin), so every Assassin hit cloaks twice. It's like a 4-mana Roaming Throne that is also an attacker. EDHREC: 23% of theft decks.

**50. Irma, Part-Time Mutant** (TMNT Eternal-Legal). {2}{U}, Legendary Creature — Human Mutant Shapeshifter, 1/1.
- Oracle: "At the beginning of combat on your turn, Irma becomes a copy of up to one other target creature you control, except her name is Irma, Part-Time Mutant and she has this ability. Then put a +1/+1 counter on her."
- Legal, not a Game Changer. **$8.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Irma%2C+Part-Time+Mutant
- Fit: very good. She becomes a second Etrata every combat (different name, so no legend rule), which doubles cloak triggers, and she grows each turn.
- Gotcha: she's a 1/1 Human outside your combat, so she's vulnerable.

**51. Helm of the Host.** {4}, Legendary Artifact — Equipment.
- Oracle: "At the beginning of combat on your turn, create a token that's a copy of equipped creature, except the token isn't legendary if equipped creature is legendary. That token gains haste. / Equip {5}"
- Legal, not a Game Changer. **$6.99**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Helm+of+the+Host
- Fit: medium. 9 mana in total, but it makes another hasty Etrata every turn. The triggers grow with the number of copies.

**52. Ninja Teen** (TMNT). {2}{B}, Enchantment — Class.
- Oracle: "Whenever a creature you control leaves the battlefield, each opponent loses 1 life. / {1}{B}: Level 2 — Creatures you control get +1/+0 and have menace. / {B}: Level 3 — Creature cards in your graveyard have sneak {3}{B}. You may cast creature spells from your graveyard using their sneak abilities." Level reminder text omitted.
- Legal, not a Game Changer. **$1.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Ninja+Teen
- Fit: medium. Level 2 gives the whole team menace for 5 mana in total, which helps 2/2 cloaks connect.
- Level 1 fires when a cloaked creature is exiled by Etrata's flip, since it leaves the battlefield.
- I didn't verify the sneak rules.

**53. Raven Eagle** (Avatar: The Last Airbender). {2}{B}, Creature — Bird Assassin, 2/3.
- Oracle: "Flying / Whenever this creature enters or attacks, exile up to one target card from a graveyard. If a creature card is exiled this way, create a Clue token. / Whenever you draw your second card each turn, each opponent loses 1 life and you gain 1 life."
- Legal, not a Game Changer. **$0.49**, https://www.cardkingdom.com/catalog/search?search=header&filter%5Bname%5D=Raven+Eagle
- Fit: good. It's a 3-mana evasive **Assassin** that triggers Etrata natively. It's not a theft engine itself. EDHREC: 23% of theft decks.

## E. Extra combats in U/B or colorless

- **None found.** The CK blog's extra-combat article (https://blog.cardkingdom.com/the-best-ways-to-take-extra-combats-in-commander/) lists only red, white and other multicolor cards: Relentless Assault, Seize the Day, Waves of Aggression, Port Razer, Moraug, Aggravated Assault, Combat Celebrant, Finest Hour, Najeela, Isshin and others.
- **Not exhaustively verified.** Full-text search was blocked: Scryfall 403, mtg.wtf query pages needed a permission prompt that timed out, and the Draftsim list timed out.
- The closest U/B substitutes are **trigger doublers** (Roaming Throne, Spark Double, Irma, Strionic Resonator) and extra turns, which I didn't research here.

## Not eligible (outside U/B)

- Gonti, Canny Acquisitor (B/U/G), above.
- Laughing Jasper Flint (B/R).
- Stolen Strategy, Grenzo, Robber of the Rich (red).
- Kadena, Slinking Sorcerer (G/U/B).
- Trail of Mystery and Obscuring Aether (green).

I didn't fetch these except Gonti, Canny Acquisitor.

---

## Top 15 for Etrata theft-aggro (ranked)

| # | Card | Price | Why |
|---|---|---|---|
| 1 | Leyline of Transformation (name Assassin) | $0.69 | Makes every cloak, ninja and thief an Assassin, so each stolen card that connects steals another. This is the snowball. |
| 2 | They Came from the Pipes | $0.69 | Draws a card for every cloak and manifest, plus two bodies. |
| 3 | Thief of Sanity | $0.69 | 3-mana flyer that steals the best of three cards. With Leyline it also triggers Etrata. |
| 4 | Gonti, Night Minister | $1.79 | Extra face-down steal on every hit, plus a Treasure on every Etrata free-cast. Watch the symmetry. |
| 5 | Sash and Waistcoat, Unmen | not verified | Face-down attackers are unblockable. With Leyline, a chain of guaranteed steals. |
| 6 | Satoru, the Infiltrator | $1.99 | 2-mana menace body. Draws on every cloak, manifest, ninjutsu and free-cast creature. |
| 7 | Spark Double | $6.99 | A second Etrata, so every Assassin hit cloaks twice. |
| 8 | Tasha, the Witch Queen | $8.49 | A 3/3 Demon for every stolen card cast. Also recasts instants from graveyards. |
| 9 | Hostage Taker | $0.49 | Removal that becomes a steal, and feeds Tasha and Gonti. |
| 10 | Fallen Shinobi | $7.99 | Two free stolen cards per hit. Never ninjutsu a stolen face-down card. |
| 11 | Irma, Part-Time Mutant | $8.49 | Becomes a growing second Etrata every combat. |
| 12 | Dauthi Voidwalker | $6.49 | 2-mana shadow attacker (an Assassin with Leyline). Exiles the stolen spells Etrata cast, then replays one free. |
| 13 | Thieving Amalgam | $0.99 | Three free face-down bodies per round, and drains when stolen creatures die. |
| 14 | Enduring Curiosity | $11.99 | Draws for every connecting creature, face-down ones included, and is hard to remove. |
| 15 | Glitch Interpreter | $0.49 | Face-down creatures are colorless, so every cloak that connects draws. |

- **Next in line:**
  - Primordial Mist ($0.49): cash in stolen lands and permanents with no flip fee.
  - Kaito, Cunning Infiltrator ($2.99): makes one Assassin unblockable each turn.
  - Nashi ($3.49)
  - Black Cat ($0.99)
  - Strionic Resonator ($8.99)
  - Raven Eagle ($0.49)
  - Covetous Urge ($0.35)
- **Expensive upgrades:** Roaming Throne ($57.99), Treachery ($40.79), Opposition Agent ($24.99, Game Changer).

The cheapest cards in the top 15 (#1, 2, 3, 4, 6, 9, 13 and 15) cost about $8 together.
