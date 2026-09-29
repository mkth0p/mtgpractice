/* Card wiki extras for the Miku deck: per-card ratings, rulings, tips and combos,
   plus the glossary, the cut list and the FAQ. Card names match window.MIKU_CARDS exactly. */
window.MIKU_WIKI = {
 "Trostani, Selesnya's Voice": {
  rating: 5,
  when: "Turns 4-5",
  tags: ["legendary", "instant speed", "miku art"],
  rulings: [
   { q: "How much life do I gain for a creature whose size changes, like a Voice of Resurgence Elemental?", a: "You use the creature's toughness when Trostani's trigger resolves. If the creature has already left the battlefield, you use its toughness as it last existed there." },
   { q: "Can I populate the turn Trostani comes in?", a: "No. The ability has {T} in its cost, so she has to have been under your control since the start of your turn. Haste from <i-c>Crashing Drawbridge</i-c> gets around that." },
   { q: "What exactly does populate copy?", a: "One creature token you control. The copy doesn't get the original's counters, pumps or tapped and attacking status. It does count as a creature entering, so Trostani triggers again. With no creature tokens out, the ability does nothing." },
   { q: "Is Miku, Song of the People a different card?", a: "No. It's a flavor name printed on the Secret Lair version. For every rule, including deckbuilding and the legend rule, the card is <i-c>Trostani, Selesnya's Voice</i-c>." }
  ],
  tips: [
   "Every recast from the command zone costs {2} more. Protect her with Shalai, Voice of Plenty or Grand Crescendo rather than recasting her twice.",
   "With Soul of Eternity, one Trostani trigger doubles your life: Soul's toughness is your life total when the trigger resolves.",
   "Say each trigger out loud with the toughness and your new total. Lifegain decks lose track fast."
  ],
  combos: ["Soul of Eternity", "Voice of Resurgence", "Grove of the Guardian", "Archangel of Thune", "Nykthos Paragon"]
 },
 "Adeline, Resplendent Cathar": {
  rating: 4,
  when: "Turn 3",
  tags: ["legendary", "must-answer", "vigilance"],
  rulings: [
   { q: "Does Adeline have to attack to make tokens?", a: "No. It triggers once per combat whenever you attack with any creatures. You get one Human for each opponent, attacking that opponent or a planeswalker they control, even players you didn't attack." },
   { q: "Do the Humans add quest counters to Beastmaster Ascension?", a: "No. They enter tapped and attacking but were never declared as attackers, so 'whenever a creature attacks' abilities don't see them." },
   { q: "Does Intangible Virtue's vigilance untap the Humans?", a: "No. Vigilance only stops attacking from tapping a creature. The Humans are created tapped and stay tapped until an untap step. <i-c>Dazzling Theater // Prop Room</i-c>'s Prop Room untaps them in the next opponent's untap step." },
   { q: "How big is she?", a: "Her power is the number of creatures you control, herself and tokens included, and it changes as creatures come and go. Her toughness is always 4." }
  ],
  tips: [
   "Her power comes from a characteristic-defining ability, so Mirror Entity's X/X replaces it. Don't activate Mirror Entity for less than her current power.",
   "Her Humans enter tapped, so don't count them as blockers for the next round unless Prop Room is unlocked.",
   "Point your real attack at one player and let the Humans spread chip damage to the others."
  ],
  combos: ["Jazal Goldmane", "Hero of Bladehold", "Cathars' Crusade", "Dazzling Theater // Prop Room"]
 },
 "Aetherflux Reservoir": {
  rating: 3,
  when: "Before your combo turn",
  tags: ["instant speed", "life as ammo"],
  rulings: [
   { q: "Does it count spells I cast before it was on the battlefield?", a: "Yes. It counts every spell you've cast this turn, but it only triggers for spells cast while it's on the battlefield. It doesn't trigger for itself." },
   { q: "Do demonstrate copies or unlocking a Room door count as spells?", a: "No. A copy of a spell isn't cast, and unlocking a door or leveling up <i-c>Cleric Class</i-c> is an ability, not a spell." },
   { q: "Can I split the 50 damage between opponents?", a: "No. Each activation is 50 damage to one target. Three opponents need three activations, so 150 life plus a cushion." },
   { q: "Can opponents stop the activation?", a: "Most counterspells only hit spells, so they can't. Paying 50 life is a cost: it's gone even if something counters the ability." }
  ],
  tips: [
   "With the Spike Feeder loop, gain a clear round number like 1,000 before you start shooting, so the table can follow the math.",
   "Once you've activated it, destroying the Reservoir doesn't stop the damage: the ability resolves on its own."
  ],
  combos: ["Spike Feeder", "Heliod, Sun-Crowned", "Archangel of Thune", "Cleric Class"]
 },
 "Ajani's Pridemate": {
  rating: 2,
  when: "Turn 2",
  tags: ["2-drop", "snowball"],
  rulings: [
   { q: "If I gain 5 life at once, how many counters?", a: "One. It triggers once per life gain event, not per point. <i-c>Shamanic Revelation</i-c>'s '4 life for each' is also a single event." },
   { q: "Two lifelink creatures deal combat damage together. One trigger or two?", a: "Two. Each lifelink source dealing combat damage is its own life gain event. One lifelink creature hitting several things at once is still one event." }
  ],
  tips: [
   "It's a Cat Soldier, not a Human, so both modes of Return of the Wildspeaker count it.",
   "Pridemate already grows itself, so aim Heliod's and Cleric Class's counters at other creatures."
  ],
  combos: ["Soul Warden", "Prosperous Innkeeper"]
 },
 "Arcane Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "What colors does it make?", a: "Green or white, the colors of your commander's color identity. It can't make colorless mana." },
   { q: "Does Vorinclex double it?", a: "No. <i-c>Vorinclex, Voice of Hunger</i-c> only adds mana when you tap a land for mana." }
  ],
  tips: [
   "In an opening hand, count it as half a land: keep two lands plus Signet only if the hand also has cheap plays."
  ]
 },
 "Archangel of Thune": {
  rating: 5,
  when: "Turns 5-6",
  tags: ["must-answer", "flying", "miku art"],
  rulings: [
   { q: "Do the counters from its lifelink make the same combat hit harder?", a: "No. Regular combat damage is dealt all at once, so the counters land after the damage. They count from then on." },
   { q: "Several lifelink creatures deal combat damage together. How many triggers?", a: "One per lifelink creature, because each source is its own life gain event. A single lifelinker hitting a player and a blocker at once is one event." },
   { q: "Does a creature that just entered get a counter?", a: "Yes. By the time Trostani's trigger resolves and you gain life, the new creature is on the battlefield, so Thune's trigger puts a counter on it too." },
   { q: "What happens with two Thunes, one of them a Bramble Sovereign copy?", a: "Each triggers separately, so every life gain event puts two counters on each creature. The copy is a token with the same abilities." }
  ],
  tips: [
   "If Thune is about to die, respond with instant-speed lifegain like Spike Feeder or Sapseep Forest for one last counter wave.",
   "Finale of Devastation for X=5 can bring it back from your graveyard, not just your library."
  ],
  combos: ["Spike Feeder", "Trostani, Selesnya's Voice", "Soul Warden", "Bramble Sovereign", "Ghalta and Mavren"]
 },
 "Avacyn's Pilgrim": {
  rating: 3,
  when: "Turn 1",
  tags: ["mana dork", "1-drop", "human"],
  rulings: [
   { q: "Can it tap for mana the turn I cast it?", a: "Not normally: it has summoning sickness. Haste from <i-c>Crashing Drawbridge</i-c> lets it, and <i-c>Springleaf Drum</i-c> can tap it right away because the Drum's cost isn't the Pilgrim's own {T} ability." },
   { q: "Does Return of the Wildspeaker count it?", a: "No. It's a Human Monk, so both modes skip it." }
  ],
  tips: [
   "Turn 1 Pilgrim plus a Plains on turn 2 gives you {W}{W} and one more: Adeline or Resplendent Angel on turn 2.",
   "With Halo Fountain, tap Pilgrim for {W}, pay the Fountain with it and untap Pilgrim as the cost. That's a free Citizen, and Pilgrim can tap again."
  ],
  combos: ["Halo Fountain", "Crashing Drawbridge"]
 },
 "Beast Within": {
  rating: 3,
  when: "Instant speed, on what matters",
  tags: ["instant speed", "any permanent"],
  rulings: [
   { q: "What if the permanent is indestructible?", a: "It isn't destroyed, but its controller still gets the 3/3 Beast, as long as the target was still legal when Beast Within resolved." },
   { q: "Who gets the Beast if I destroy my own permanent?", a: "You do. It enters under your control, so <i-c>Trostani, Selesnya's Voice</i-c>, <i-c>Soul Warden</i-c> and <i-c>Cathars' Crusade</i-c> all trigger." },
   { q: "Can it hit lands?", a: "Yes. It hits any permanent: lands, tokens, planeswalkers, artifacts and enchantments." }
  ],
  tips: [
   "If an opponent tries to exile Elenda's Hierophant or Voice of Resurgence, destroy it yourself in response: you get the death trigger and a 3/3."
  ],
  combos: ["Elenda's Hierophant", "Voice of Resurgence"]
 },
 "Beastmaster Ascension": {
  rating: 4,
  when: "Turns 4-6, before a wide attack",
  tags: ["anthem", "quest counters"],
  rulings: [
   { q: "When does the +5/+5 turn on?", a: "As soon as the seventh counter is on it. The counters go on in the declare attackers step, so opponents declare blockers against your pumped creatures." },
   { q: "Do the counters stay?", a: "Yes. Once it has seven, the bonus lasts as long as it stays on the battlefield, and it also applies to creatures that enter later." },
   { q: "Do Conclave Evangelist's myriad copies add counters?", a: "No. Creatures put onto the battlefield attacking were never declared as attackers, so they don't trigger it. They still get the +5/+5." }
  ],
  tips: [
   "You don't need seven attackers in one turn: two smaller attacks over two turns also get it to seven.",
   "Vigilance attackers still count, so Intangible Virtue tokens charge it and stay back as blockers."
  ],
  combos: ["Intangible Virtue", "Crashing Drawbridge", "Grand Crescendo"]
 },
 "Blossoming Bogbeast": {
  rating: 3,
  when: "Your big turn",
  tags: ["attack trigger", "trample"],
  rulings: [
   { q: "Is X locked in?", a: "Yes. X is all the life you've gained this turn when the trigger resolves, its own 2 included. Life you gain later, like lifelink during combat damage, doesn't raise it." },
   { q: "Do tokens created during the attack get the bonus?", a: "Only if they exist when the trigger resolves. Order the triggers so <i-c>Hero of Bladehold</i-c>'s and <i-c>Adeline, Resplendent Cathar</i-c>'s resolve first. Their tokens then get the pump, and the Trostani life from those tokens counts toward X." },
   { q: "Does Cleric Class change the 2 life?", a: "Yes. You gain 3, and X counts all 3." }
  ],
  tips: [
   "Trample matters most against token decks: chump blockers stop absorbing whole attackers."
  ],
  combos: ["Trostani, Selesnya's Voice", "Hero of Bladehold", "Adeline, Resplendent Cathar"]
 },
 "Blossoming Sands": {
  rating: 1,
  when: "Turns 1-2",
  tags: ["enters tapped", "dual"],
  rulings: [
   { q: "Does its 1 life trigger my payoffs?", a: "Yes. It's a separate life gain event, so <i-c>Archangel of Thune</i-c>, <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Ajani's Pridemate</i-c> each trigger. With <i-c>Cleric Class</i-c> out you gain 2." }
  ],
  tips: [
   "Play it on turn 1 when your hand has no one-drop: entering tapped costs you nothing then."
  ],
  combos: ["Selesnya Sanctuary"]
 },
 "Bountiful Promenade": {
  rating: 2,
  when: "Any turn",
  tags: ["untapped dual", "miku art"],
  rulings: [
   { q: "When does it enter tapped?", a: "Only when you have fewer than two opponents: in a 1v1 game, or once the table is down to you and one other player." }
  ],
  tips: [
   "When only one opponent is left, play it on a turn you don't need all your mana."
  ]
 },
 "Bramble Sovereign": {
  rating: 3,
  when: "Turn 4, or right before a key creature",
  tags: ["mana sink", "copies"],
  rulings: [
   { q: "Can I copy Walking Ballista?", a: "The copy wasn't cast, so X is 0 and it enters with no counters. It dies as a 0/0 unless something raises its toughness, like <i-c>Intangible Virtue</i-c> for tokens. Usually, don't pay." },
   { q: "Does a Spike Feeder copy get counters?", a: "Yes. 'Enters with two +1/+1 counters' is part of the copied text, so the token enters with two as well." },
   { q: "How do I get the most from copying Craterhoof Behemoth?", a: "Order the triggers so Bramble Sovereign's resolves first. The copy's enter trigger then goes on the stack above the original's, and both Craterhoof triggers count both Craterhoofs." },
   { q: "Does it trigger on tokens?", a: "No, only on nontoken creatures. Populated tokens, myriad copies and its own copies don't trigger it." }
  ],
  tips: [
   "A Bramble copy is a creature token, so Trostani's populate and Esika's Chariot can copy it again: one Archangel of Thune can become three.",
   "The copy is a token, so Intangible Virtue gives it +1/+1 and vigilance."
  ],
  combos: ["Craterhoof Behemoth", "Archangel of Thune", "Spike Feeder", "Trostani, Selesnya's Voice", "Hero of Bladehold"]
 },
 "Break Down": {
  rating: 2,
  when: "Instant speed",
  tags: ["instant speed", "card advantage", "miku art"],
  rulings: [
   { q: "Can I play a land with the Junk token?", a: "Yes, if you still have a land drop this turn. Spells found this way still cost their normal mana. The token itself can only be used as a sorcery: your main phase, with an empty stack." },
   { q: "Do I still get the Junk token if the target disappears?", a: "No. If the only target is gone or illegal when Break Down resolves, the whole spell does nothing." }
  ],
  tips: [
   "Crack the Junk token before you play your land for the turn, in case it hits a land.",
   "The Junk token is a token, so Esika's Chariot can copy it."
  ],
  combos: ["Esika's Chariot"]
 },
 "Brokers Hideout": {
  rating: 1,
  when: "Turns 1-3",
  tags: ["fetch land", "deck thinning"],
  rulings: [
   { q: "Can it find Canopy Vista or Sapseep Forest?", a: "No. It only finds a basic Forest, Plains or Island card." },
   { q: "Can I tap it for mana first?", a: "No. It has no mana ability of its own. It only turns into a basic land." }
  ],
  tips: [
   "The basic arrives tapped, so play it on turn 1 or on a turn you have mana to spare."
  ]
 },
 "Camaraderie": {
  rating: 3,
  when: "Turns 6+, with a wide board",
  tags: ["refill", "sorcery speed"],
  rulings: [
   { q: "Is the life one event?", a: "Yes. You gain X life at once, so each lifegain payoff triggers once. <i-c>Nykthos Paragon</i-c> then puts X counters on each creature you control." },
   { q: "When is X counted?", a: "When Camaraderie resolves. The life, the cards and the pump all use that count." },
   { q: "Does Heliod count as a creature here?", a: "Only while your devotion to white is five or more." }
  ],
  tips: [
   "Make tokens first (Elspeth's +1, Grove of the Guardian, Grand Crescendo), then cast it: every creature is another card.",
   "Cast it before combat so the +1/+1 helps the attack."
  ],
  combos: ["Nykthos Paragon", "Grand Crescendo"]
 },
 "Canopy Vista": {
  rating: 2,
  when: "Turns 1-3",
  tags: ["fetchable", "forest plains"],
  rulings: [
   { q: "Which cards can fetch it?", a: "<i-c>Nature's Lore</i-c> (a Forest card), <i-c>Farseek</i-c> (a Plains card) and <i-c>Krosan Verge</i-c>. <i-c>Cultivate</i-c> and <i-c>Brokers Hideout</i-c> can't, because it isn't a basic land." },
   { q: "Does it enter untapped from Nature's Lore?", a: "Only if you already control two or more basic lands. Its own enters-tapped rule still applies when a spell puts it onto the battlefield." },
   { q: "Does it turn on Sunpetal Grove?", a: "Yes. It's both a Forest and a Plains." }
  ],
  tips: [
   "Early on, if you control fewer than two basics and need the mana now, fetch a basic Forest with Nature's Lore instead."
  ],
  combos: ["Sunpetal Grove", "Farseek", "Nature's Lore"]
 },
 "Cathars' Crusade": {
  rating: 5,
  when: "Turns 5-6",
  tags: ["must-answer", "snowball"],
  rulings: [
   { q: "Do tokens created attacking get counters before damage?", a: "Yes. <i-c>Hero of Bladehold</i-c>'s Soldiers enter in the declare attackers step, and the Crusade triggers resolve before blockers, so your whole team is bigger when damage is dealt." },
   { q: "Does Walking Ballista get an extra counter?", a: "Yes. It enters with X counters, then Crusade's trigger adds one more, like every other creature you control." },
   { q: "Do myriad copies trigger it?", a: "Yes. They enter the battlefield, so each one is a counter on every creature, even though the copies are exiled at end of combat." }
  ],
  tips: [
   "Counters push your creatures to power 4 or more, which Elspeth's -3 destroys. With Crusade out, only use the -3 with Grand Crescendo or Rootborn Defenses in response.",
   "New tokens get their counter right away, so Skullclamp no longer kills them. Clamp older 1/1s instead.",
   "Use one dice color for counters and another for temporary pumps, so end of turn cleanup is quick."
  ],
  combos: ["Grand Crescendo", "Walking Ballista", "Hero of Bladehold", "Conclave Evangelist"]
 },
 "Cleric Class": {
  rating: 3,
  when: "Turn 1, level up from turn 4",
  tags: ["1-drop", "levels up", "mana sink"],
  rulings: [
   { q: "Can I skip to level 3?", a: "No. Levels go in order and only at sorcery speed: level 2 first, then level 3, which can be the same turn if you have the mana." },
   { q: "Does level 1 add 1 to every separate gain?", a: "Yes, once per life gain event. Five Trostani triggers means 5 extra life, while one big <i-c>Camaraderie</i-c> gain is only 1 extra." },
   { q: "Should level 3 return Walking Ballista?", a: "No. Ballista enters with no counters and dies at once. Return <i-c>Archangel of Thune</i-c> or another big creature." },
   { q: "Is leveling up a spell?", a: "No. It's an activated ability, so it doesn't trigger <i-c>Aetherflux Reservoir</i-c> or <i-c>Song of the Worldsoul</i-c>, and spell counters can't stop it." }
  ],
  tips: [
   "Level 3 also triggers Trostani for the returned creature, so you gain its toughness twice, plus 1 each time from level 1.",
   "At level 2, aim the counters at Voice of the Blessed: two counters per lifegain event gets it to flying and then indestructible fast."
  ],
  combos: ["Spike Feeder", "Voice of the Blessed", "Archangel of Thune"]
 },
 "Command Tower": {
  rating: 2,
  when: "Any turn",
  tags: ["untapped", "fixing"],
  rulings: [
   { q: "Does Vorinclex double it?", a: "Yes. It's a land, so <i-c>Vorinclex, Voice of Hunger</i-c> adds one more mana of the type it made." }
  ],
  tips: [
   "It makes either color, so it's the land to keep when a hand is short on one color."
  ]
 },
 "Conclave Evangelist": {
  rating: 2,
  when: "Turns 5-7",
  tags: ["myriad", "snowball", "multiplayer"],
  rulings: [
   { q: "Do the myriad copies make permanent copies when they connect?", a: "Yes. Each copy has the same ability, and the token it makes is a normal copy of Conclave Evangelist that stays. The new token enters untapped and isn't attacking." },
   { q: "Do the myriad copies trigger Trostani?", a: "Yes. Every copy entering is 4 life from <i-c>Trostani, Selesnya's Voice</i-c> and a trigger for <i-c>Cathars' Crusade</i-c>, even though it's exiled at end of combat." },
   { q: "Does Rogue's Passage make the copies unblockable too?", a: "No. It affects only the creature you targeted. The myriad copies are new objects." },
   { q: "Does the hybrid cost count for Heliod?", a: "Yes. Each {G/W} counts toward both green and white devotion, so Evangelist adds 2 to <i-c>Heliod, Sun-Crowned</i-c>'s count." }
  ],
  tips: [
   "The permanent copies have myriad too: two Evangelists attacking next turn can make up to four more attacking copies.",
   "Attack the opponent with the fewest untapped creatures. The myriad copies reach the others anyway."
  ],
  combos: ["Trostani, Selesnya's Voice", "Cathars' Crusade", "Heliod, Sun-Crowned"]
 },
 "Crashing Drawbridge": {
  rating: 3,
  when: "Turn 2, used on your big turn",
  tags: ["haste", "defender", "2-drop"],
  rulings: [
   { q: "Can I use it the turn I cast it?", a: "No. It's an artifact creature, so its {T} ability has summoning sickness. Cast it at least a turn before you need it." },
   { q: "Do creatures that enter after I tap it get haste?", a: "No. It only affects creatures you control when the ability resolves." },
   { q: "Does the haste help my mana creatures?", a: "Yes. Haste lets a creature use {T} abilities the turn it arrives, so a fresh <i-c>Llanowar Elves</i-c> can tap for mana and a fresh <i-c>Trostani, Selesnya's Voice</i-c> can populate." },
   { q: "How does it work with Esika's Chariot?", a: "Crew <i-c>Esika's Chariot</i-c> first. It has to be a creature when the haste ability resolves, or it won't get haste." }
  ],
  tips: [
   "Opponents rarely spend removal on a 0/4 wall, so it's a quiet way to set up your haste turn."
  ],
  combos: ["Elspeth, Sun's Champion", "Grand Crescendo", "Esika's Chariot", "Halo Fountain"]
 },
 "Craterhoof Behemoth": {
  rating: 5,
  when: "Your big turn",
  tags: ["etb", "tutor target", "haste"],
  rulings: [
   { q: "Does X count Craterhoof itself?", a: "Yes. X is the number of creatures you control when the trigger resolves, Craterhoof included." },
   { q: "Do creatures that enter after the trigger resolves get the bonus?", a: "No. Only creatures on the battlefield at that moment. <i-c>Hero of Bladehold</i-c>'s and <i-c>Adeline, Resplendent Cathar</i-c>'s attack tokens come later and miss it." },
   { q: "Does Mirror Entity stack with it?", a: "Yes. <i-c>Mirror Entity</i-c> sets base power and toughness, and Craterhoof's +X/+X is added on top, whichever you did first." },
   { q: "Can Lazotep Quarry bring it back?", a: "Yes. The Zombie copy has haste and the same enter trigger. It costs {X}{2} with X=8, so 10 mana, and only as a sorcery: do it in your first main phase." }
  ],
  tips: [
   "Trample means a chump block only absorbs the blocker's toughness. Count lethal as your total power minus the toughness of their untapped creatures.",
   "If Bramble Sovereign is out, keep {1}{G} extra on top of the 8 for the copy."
  ],
  combos: ["Bramble Sovereign", "Finale of Devastation", "Lazotep Quarry", "Crashing Drawbridge", "Mirror Entity"]
 },
 "Cultivate": {
  rating: 3,
  when: "Turn 3",
  tags: ["fixing", "card advantage", "miku art"],
  rulings: [
   { q: "Can it fetch Canopy Vista?", a: "No. Cultivate only finds basic land cards, so a Forest or a Plains here." },
   { q: "Can I take two of the same basic?", a: "Yes. Two Forests or two Plains are both fine." }
  ],
  tips: [
   "The basic you put onto the battlefield also helps Canopy Vista enter untapped later."
  ]
 },
 "Dazzling Theater // Prop Room": {
  rating: 3,
  when: "Turns 4-6",
  tags: ["room", "convoke", "untap"],
  rulings: [
   { q: "Is unlocking the second door a spell?", a: "No. You pay the door's mana cost as a sorcery and it unlocks. That doesn't trigger <i-c>Aetherflux Reservoir</i-c> or <i-c>Song of the Worldsoul</i-c>." },
   { q: "Can summoning-sick creatures pay for convoke?", a: "Yes. Tapping a creature for convoke isn't its own {T} ability, so tokens made this turn can help cast your next creature." },
   { q: "Does convoke pay for X and commander tax?", a: "Yes. Each creature pays {1} of the total cost, which includes {X} on <i-c>Walking Ballista</i-c> and Trostani's commander tax." },
   { q: "How much does it add to Heliod's devotion?", a: "Only unlocked doors count: {W} with Dazzling Theater alone, {W}{W} once Prop Room is unlocked too." }
  ],
  tips: [
   "Convoke with creatures that couldn't attack anyway: summoning-sick tokens, mana creatures and Crashing Drawbridge.",
   "Green and white Citizens can pay {G} or {W}. The green Cats from Esika's Chariot only pay {G} or generic.",
   "Prop Room untaps your creatures in every opponent's untap step, so Hero of Bladehold's and Adeline's tapped tokens are ready to block."
  ],
  combos: ["Walking Ballista", "Halo Fountain", "Adeline, Resplendent Cathar", "Springleaf Drum"]
 },
 "Elenda's Hierophant": {
  rating: 2,
  when: "Turns 3-4",
  tags: ["flying", "death trigger", "removal bait"],
  rulings: [
   { q: "How many Vampires do I get?", a: "Its power as it last existed on the battlefield, including counters and temporary pumps like <i-c>Beastmaster Ascension</i-c>'s +5/+5." },
   { q: "Does it work with Hour of Reckoning?", a: "Yes. It dies to the wipe, and the Vampires are created after the wipe has finished, so they survive." },
   { q: "What happens if I clamp a fresh 1/1 Hierophant?", a: "<i-c>Skullclamp</i-c> makes it 2/0, so it dies with power 2: you draw two cards and get two Vampires." }
  ],
  tips: [
   "Each Vampire has lifelink: every one that deals combat damage is its own life gain event for Archangel of Thune.",
   "Aim Heliod's and Cleric Class's counters at it: every counter is one more Vampire when it dies."
  ],
  combos: ["Skullclamp", "Hour of Reckoning", "Lazotep Quarry", "Archangel of Thune"]
 },
 "Elspeth, Sun's Champion": {
  rating: 4,
  when: "Turns 6-7",
  tags: ["legendary", "sorcery speed", "wipe"],
  rulings: [
   { q: "How do I make the -3 one-sided?", a: "Activate it, then cast <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> in response. Your creatures are indestructible when the -3 resolves, so only the opponents' big creatures die." },
   { q: "When can I use the -7?", a: "She enters with 4 loyalty. Three turns of +1 get her to 7, so the emblem comes on the fourth turn you have her, if she survives." },
   { q: "Can I use two abilities in one turn?", a: "No. One loyalty ability per planeswalker per turn, in your main phase with an empty stack." },
   { q: "Does the emblem go away?", a: "No. An emblem stays for the rest of the game and can't be removed." }
  ],
  tips: [
   "Use +1 the turn you cast her: three blockers show up right away to protect her.",
   "Shalai, Voice of Plenty gives her hexproof, which stops targeted burn and removal but not attacks."
  ],
  combos: ["Grand Crescendo", "Rootborn Defenses", "Heliod, Sun-Crowned", "Intangible Virtue", "Cathars' Crusade"]
 },
 "Elvish Mystic": {
  rating: 3,
  when: "Turn 1",
  tags: ["mana dork", "1-drop"],
  rulings: [
   { q: "Is it legal next to Llanowar Elves?", a: "Yes. Commander's one-copy rule goes by card name, and these are two different cards with the same text." },
   { q: "Can it pay for Halo Fountain?", a: "Not directly: it only makes {G}, and the Fountain's costs are white. It can still be one of the tapped creatures the Fountain untaps." }
  ],
  tips: [
   "Turn 1 Mystic into a turn 2 Arcane Signet or Fanatic of Rhonas gives you five mana on turn 3."
  ]
 },
 "Esika's Chariot": {
  rating: 4,
  when: "Turn 4",
  tags: ["legendary", "vehicle", "wipe-resistant"],
  rulings: [
   { q: "Can summoning-sick creatures crew it?", a: "Yes. Crewing taps creatures as a cost but isn't their own {T} ability, so the Cats can crew the turn they arrive." },
   { q: "Can the Chariot attack the turn I cast it?", a: "No. Once crewed, it's a creature that came under your control this turn, so it needs haste. <i-c>Crashing Drawbridge</i-c> works if you crew first." },
   { q: "What can it copy?", a: "Any token you control, not just creatures: a Treasure or Junk token works too. A copy of an attacking token enters untapped and isn't attacking." },
   { q: "Does it survive creature wipes?", a: "Yes, unless it's crewed at the time. A Vehicle is only a creature until end of turn after it's crewed." }
  ],
  tips: [
   "Bramble Sovereign copies are tokens too: the Chariot can copy a token Archangel of Thune, or a token Craterhoof Behemoth for another enter trigger.",
   "With Intangible Virtue out, the Cats are 3/3, so one Cat plus any 1-power creature crews it."
  ],
  combos: ["Voice of Resurgence", "Grove of the Guardian", "Bramble Sovereign", "Intangible Virtue"]
 },
 "Excavation Technique": {
  rating: 2,
  when: "Turns 5+",
  tags: ["sorcery speed", "politics"],
  rulings: [
   { q: "Do the demonstrate copies count as cast?", a: "No. Copies aren't cast, so they don't trigger <i-c>Aetherflux Reservoir</i-c> or <i-c>Song of the Worldsoul</i-c>. Only the original does." },
   { q: "What can the opponent's copy hit?", a: "Any nonland permanent it can target, yours included. With <i-c>Shalai, Voice of Plenty</i-c> out, your other creatures have hexproof, so their copy can't target those." },
   { q: "Who gets the Treasures?", a: "The controller of the target. If the target is indestructible but still legal, its controller still gets the two Treasures." }
  ],
  tips: [
   "If you demonstrate, pick the opponent least likely to hit your board: they choose their own target.",
   "Two Treasures can power an opponent's big turn. Use it late, or on a player who's short on cards."
  ],
  combos: ["Shalai, Voice of Plenty"]
 },
 "Fanatic of Rhonas": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana dork", "big mana", "eternalize"],
  rulings: [
   { q: "Does Fanatic's own power count for ferocious?", a: "Yes. With three +1/+1 counters it turns itself on, and the eternalized 4/4 token always does." },
   { q: "When is the 4-power condition checked?", a: "When you activate it. A temporary pump works, as long as the creature has 4 power at that moment." },
   { q: "Does Vorinclex double its mana?", a: "No. <i-c>Vorinclex, Voice of Hunger</i-c> only doubles mana from lands." }
  ],
  tips: [
   "Mirror Entity for X=4 makes every creature 4/4, which turns on ferocious right after it resolves.",
   "Mana empties between steps and phases, so spend all four in the same phase you make it."
  ],
  combos: ["Mirror Entity", "Walking Ballista", "Finale of Devastation"]
 },
 "Farseek": {
  rating: 3,
  when: "Turn 2",
  tags: ["fixing", "sorcery speed"],
  rulings: [
   { q: "Can it find a Forest?", a: "No. It finds a Plains, Island, Swamp or Mountain card. Here that means a basic Plains or <i-c>Canopy Vista</i-c>." },
   { q: "Does the land have to be basic?", a: "No. Any land card with the Plains type works. It enters tapped either way." }
  ],
  tips: [
   "Taking Canopy Vista keeps your basic Plains in the deck for Cultivate and Brokers Hideout, which can only find basics."
  ],
  combos: ["Canopy Vista"]
 },
 "Finale of Devastation": {
  rating: 4,
  when: "Turn 4 for X=3, or your big turn",
  tags: ["tutor", "x spell", "miku art"],
  rulings: [
   { q: "Can it get a creature from my graveyard?", a: "Yes. You search your library and/or graveyard, and you only shuffle if you searched the library." },
   { q: "Does the creature I fetch get the X=10 bonus?", a: "Yes. It's put onto the battlefield first, then the bonus applies to every creature you control, so it also gets +X/+X and haste." },
   { q: "What is an X card's mana value in my library?", a: "X counts as 0 there, so <i-c>Walking Ballista</i-c> is mana value 0. Finale can find it for almost nothing, but it arrives with no counters." },
   { q: "Does a creature put onto the battlefield trigger my cards?", a: "Yes. It enters, so <i-c>Trostani, Selesnya's Voice</i-c> and <i-c>Bramble Sovereign</i-c> trigger even though it wasn't cast." }
  ],
  tips: [
   "X=4 finds Shalai, Voice of Plenty when you need to protect your board before a combo turn.",
   "X=7 finds Ghalta and Mavren or Soul of Eternity, and X=8 finds Craterhoof Behemoth or Vorinclex."
  ],
  combos: ["Craterhoof Behemoth", "Heliod, Sun-Crowned", "Spike Feeder", "Archangel of Thune"]
 },
 "Gavony Township": {
  rating: 4,
  when: "Any turn with spare mana",
  tags: ["instant speed", "mana sink", "wipe-proof"],
  rulings: [
   { q: "Can I activate it the turn I play it?", a: "Yes. Lands have no summoning sickness. Its {T} is part of the cost, so the {2}{G}{W} has to come from other sources." },
   { q: "Can I use it during combat?", a: "Yes. After blockers are declared, each activation is +1/+1 on every attacker and blocker you control." },
   { q: "Does it reload Walking Ballista and Spike Feeder?", a: "Yes. They get a counter like everything else: one more ping, or 2 more life." }
  ],
  tips: [
   "Activate it after blockers: a chump block becomes a trade, and a trade becomes a win.",
   "Its counters count toward Voice of the Blessed's four and ten counter thresholds."
  ],
  combos: ["Walking Ballista", "Spike Feeder", "Voice of the Blessed"]
 },
 "Generous Gift": {
  rating: 3,
  when: "Instant speed, on what matters",
  tags: ["instant speed", "any permanent"],
  rulings: [
   { q: "Does it work on indestructible permanents?", a: "It won't destroy them, but their controller still gets the 3/3 Elephant, as long as the target was still legal." },
   { q: "Does it answer a commander for good?", a: "No. When a commander is destroyed, its owner can move it to the command zone and recast it for {2} more. It still costs them a turn of mana." }
  ],
  tips: [
   "It's the same answer as Beast Within in white: cast whichever one your untapped lands can pay for.",
   "It hits lands too, so a powerful utility land is a fair target."
  ]
 },
 "Ghalta and Mavren": {
  rating: 3,
  when: "Turns 7+",
  tags: ["legendary", "attack trigger", "trample"],
  rulings: [
   { q: "Does it have to attack for the trigger?", a: "No. It triggers whenever you attack with any creatures. X counts the other attacking creatures, so if it stays home, X counts every attacker." },
   { q: "When is X counted?", a: "When the trigger resolves. Let <i-c>Hero of Bladehold</i-c>'s and <i-c>Adeline, Resplendent Cathar</i-c>'s triggers resolve first so their attacking tokens count." },
   { q: "Are the Vampires attacking?", a: "No. Only the Dinosaur is created tapped and attacking. The Vampires enter untapped and stay home as lifelink blockers." },
   { q: "How much life does Trostani give for the Dinosaur?", a: "Its toughness, which equals the greatest power among the other attackers when it was made. Ghalta and Mavren's own 12 power doesn't count, so an 8-power attacker means an 8/8 and 8 life." }
  ],
  tips: [
   "Pick the Dinosaur mode when Beastmaster Ascension is on: the +5/+5 raises X.",
   "Each Vampire is a separate creature entering, so Cathars' Crusade triggers once per Vampire."
  ],
  combos: ["Hero of Bladehold", "Adeline, Resplendent Cathar", "Beastmaster Ascension", "Archangel of Thune"]
 },
 "Grand Crescendo": {
  rating: 5,
  when: "End of an opponent's turn, or in response to a wipe",
  tags: ["instant speed", "wipe insurance", "x spell"],
  rulings: [
   { q: "Are the new Citizens indestructible too?", a: "Yes. The tokens are created first, then every creature you control gains indestructible, the new tokens included." },
   { q: "What doesn't indestructible stop?", a: "Exile, bounce, sacrifice, and -X/-X or anything else that drops toughness to 0. It only stops 'destroy' and lethal damage." },
   { q: "Can X be 0?", a: "Yes. For {W}{W} you get no tokens, but your team still gains indestructible." },
   { q: "Does it make Hour of Reckoning one-sided?", a: "Yes. Cast it before or in response to your own <i-c>Hour of Reckoning</i-c>, and your nontoken creatures survive." }
  ],
  tips: [
   "With Cathars' Crusade out, cast it after blockers are declared: every Citizen puts a counter on each attacker before damage.",
   "The Citizens are green and white, so they can pay either color for convoke on Hour of Reckoning or with Dazzling Theater."
  ],
  combos: ["Hour of Reckoning", "Elspeth, Sun's Champion", "Cathars' Crusade", "Trostani, Selesnya's Voice"]
 },
 "Graypelt Refuge": {
  rating: 1,
  when: "Turns 1-2",
  tags: ["enters tapped", "dual"],
  rulings: [
   { q: "Does its 1 life count toward Resplendent Angel?", a: "Yes. It adds to the life you gained this turn, which <i-c>Resplendent Angel</i-c> checks at the start of the end step." }
  ],
  tips: [
   "Play it before Selesnya Sanctuary, so the Sanctuary can return it and you replay it for another trigger."
  ],
  combos: ["Selesnya Sanctuary"]
 },
 "Grove of the Guardian": {
  rating: 3,
  when: "Turns 5+, at instant speed",
  tags: ["instant speed", "8/8 token", "colorless"],
  rulings: [
   { q: "Can I tap Grove for mana to help pay for its own ability?", a: "No. Tapping Grove is part of the cost, so the {3}{G}{W} has to come from other sources." },
   { q: "Can summoning-sick creatures pay the 'tap two creatures' part?", a: "Yes. Tapping them for a cost isn't their own {T} ability, so creatures that just entered work." },
   { q: "Can I do it on an opponent's turn?", a: "Yes. It has no timing restriction. Doing it at the end of the turn before yours means the 8/8 can attack right away." }
  ],
  tips: [
   "Vigilant tokens from Intangible Virtue are still untapped after combat, so they can attack and then pay for the Grove.",
   "Tap two creatures that can't attack anyway, like tokens made this turn."
  ],
  combos: ["Trostani, Selesnya's Voice", "Nykthos Paragon", "Intangible Virtue", "Esika's Chariot"]
 },
 "Halo Fountain": {
  rating: 3,
  when: "Turns 3-5",
  tags: ["alt win", "mana sink", "miku art"],
  rulings: [
   { q: "Do I have to wait for my second main phase to win?", a: "No. The ability works at instant speed. Once your attackers are tapped in the declare attackers step, you can activate it right away. Untapping an attacker doesn't remove it from combat." },
   { q: "Can I use it the turn I cast it?", a: "Yes. It's an artifact, not a creature, so its {T} abilities work right away." },
   { q: "Which tapped creatures count?", a: "Any tapped creature you control: ones tapped by attacking, for mana, for convoke, for crew, for <i-c>Springleaf Drum</i-c> or for <i-c>Grove of the Guardian</i-c>." },
   { q: "Can I use more than one ability per turn?", a: "Only once per untap, since every ability taps the Fountain. Prop Room doesn't untap it, because it isn't a creature." }
  ],
  tips: [
   "Avacyn's Pilgrim pays the {W} and gets untapped by the same activation: a free Citizen every turn.",
   "After combat, the {W}{W} draw ability untaps two of your attackers: a card plus two untapped blockers."
  ],
  combos: ["Avacyn's Pilgrim", "Springleaf Drum", "Crashing Drawbridge", "Grove of the Guardian"]
 },
 "Heliod, Sun-Crowned": {
  rating: 5,
  when: "Turns 3-6, or the combo turn",
  tags: ["legendary", "indestructible", "tutor target"],
  rulings: [
   { q: "What counts toward my devotion to white?", a: "Every {W} in the mana costs of permanents you control, Heliod's own included. Hybrid {G/W} counts too. Lands and most tokens have no mana cost, but token copies of cards, like a <i-c>Bramble Sovereign</i-c> copy, keep the original's cost." },
   { q: "Do its abilities work when it isn't a creature?", a: "Yes. The lifegain trigger and the lifelink ability work either way. Only its 5/5 body needs devotion." },
   { q: "Does Shalai give Heliod hexproof?", a: "Only while Heliod is a creature. As a plain enchantment it can still be targeted by exile or bounce." },
   { q: "Can Heliod target my creatures that have hexproof from Shalai?", a: "Yes. Hexproof only stops opponents. You can target your own creatures freely." }
  ],
  tips: [
   "Trostani plus Heliod is 3 devotion. One more double-white card, like Archangel of Thune or Adeline, makes Heliod a 5/5 indestructible attacker.",
   "Give lifelink to a big trampler before damage: each lifelink creature is its own lifegain event, one more trigger for every payoff."
  ],
  combos: ["Walking Ballista", "Spike Feeder", "Trostani, Selesnya's Voice", "Soul Warden"]
 },
 "Hero of Bladehold": {
  rating: 4,
  when: "Turn 4",
  tags: ["must-answer", "attack trigger", "removal bait"],
  rulings: [
   { q: "Does battle cry pump Hero?", a: "No. It gives +1/+0 to each other attacking creature." },
   { q: "Do the Soldiers get Return of the Wildspeaker's +3/+3?", a: "Yes. They're Soldiers, not Humans. Hero herself is a Human and doesn't get it." },
   { q: "Does battle cry pump Adeline's Humans too?", a: "Yes, if <i-c>Adeline, Resplendent Cathar</i-c>'s trigger resolves before battle cry. Let every token trigger resolve first and battle cry last." }
  ],
  tips: [
   "With Intangible Virtue, each Soldier is 2/2, then 3/2 with battle cry: two free attackers worth 6 damage.",
   "A Bramble Sovereign copy means two Heroes: four Soldiers, and each battle cry pumps the other Hero's tokens too."
  ],
  combos: ["Adeline, Resplendent Cathar", "Intangible Virtue", "Bramble Sovereign", "Jazal Goldmane"]
 },
 "Hour of Reckoning": {
  rating: 3,
  when: "When their board is real creatures and yours is tokens",
  tags: ["one-sided wipe", "convoke", "sorcery speed"],
  rulings: [
   { q: "Do opponents' tokens die?", a: "No. It only destroys nontoken creatures, on every side of the table." },
   { q: "What happens to Trostani?", a: "She's destroyed like any nontoken creature. You may move her to the command zone and recast her later for {2} more." },
   { q: "Do death-trigger tokens survive?", a: "Yes. <i-c>Voice of Resurgence</i-c>'s Elemental and <i-c>Elenda's Hierophant</i-c>'s Vampires are created after the wipe has finished." },
   { q: "Can I save my own nontoken creatures?", a: "Yes. Cast <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> first or in response. Indestructible creatures aren't destroyed." }
  ],
  tips: [
   "Convoke with tokens: they survive the wipe anyway, so tapping them only costs you their attack.",
   "Three {W} in the cost: white or green-and-white tokens can pay them, the green Cats can't."
  ],
  combos: ["Grand Crescendo", "Rootborn Defenses", "Elenda's Hierophant", "Voice of Resurgence"]
 },
 "Intangible Virtue": {
  rating: 3,
  when: "Turns 2-4",
  tags: ["anthem", "vigilance", "cheap"],
  rulings: [
   { q: "Does it affect token copies of nontoken creatures?", a: "Yes. Every creature token you control gets it: <i-c>Bramble Sovereign</i-c> copies, myriad copies, the eternalized <i-c>Fanatic of Rhonas</i-c> and <i-c>Lazotep Quarry</i-c> Zombies." },
   { q: "Can vigilant tokens still crew or convoke?", a: "Yes. Vigilance only changes attacking. You can still tap them for crew, convoke, Springleaf Drum or Grove of the Guardian." },
   { q: "Does it keep a Bramble Sovereign copy of Walking Ballista alive?", a: "Yes. The copy enters with no counters, but it's a 1/1 token with Virtue out, so it survives and can grow with {4}." }
  ],
  tips: [
   "After combat, tap your still-untapped tokens for Grove of the Guardian or Springleaf Drum. Halo Fountain then has tapped creatures to untap."
  ],
  combos: ["Elspeth, Sun's Champion", "Hero of Bladehold", "Grove of the Guardian", "Bramble Sovereign"]
 },
 "Jazal Goldmane": {
  rating: 3,
  when: "Your attack step",
  tags: ["legendary", "instant speed", "mana sink"],
  rulings: [
   { q: "Does Jazal have to attack?", a: "No. The ability has no {T}, so Jazal can stay home and still pump your attackers." },
   { q: "Do tokens created attacking count for X?", a: "Yes. <i-c>Hero of Bladehold</i-c>'s Soldiers and Adeline's Humans are attacking creatures, so they count and get the bonus." },
   { q: "Is X locked when it resolves?", a: "Yes. Each activation counts attackers when it resolves. Attackers removed later don't shrink the bonus on the others." }
  ],
  tips: [
   "With Triumph of the Hordes, every activation is more poison: each unblocked creature deals X more.",
   "First strike makes Jazal a strong blocker, so keeping it home costs you nothing."
  ],
  combos: ["Triumph of the Hordes", "Hero of Bladehold", "Adeline, Resplendent Cathar", "Vorinclex, Voice of Hunger"]
 },
 "Krosan Verge": {
  rating: 2,
  when: "Turn 1 or 2, cracked by turn 3",
  tags: ["enters tapped", "fetch land", "deck thinning"],
  rulings: [
   { q: "Can it get two Plains?", a: "No. It finds one Forest card and one Plains card. <i-c>Canopy Vista</i-c> can fill either slot, and <i-c>Sapseep Forest</i-c> can be the Forest." },
   { q: "Can I tap it for mana and then sacrifice it?", a: "No. The sacrifice ability also needs {T}, so the {2} has to come from other lands." }
  ],
  tips: [
   "Crack it at the end of an opponent's turn: the two lands enter tapped anyway and untap on your turn."
  ],
  combos: ["Canopy Vista", "Sapseep Forest"]
 },
 "Lathiel, the Bounteous Dawn": {
  rating: 3,
  when: "Turns 4-5",
  tags: ["legendary", "end step", "lifelink"],
  rulings: [
   { q: "Does it work on opponents' turns?", a: "Yes. It triggers at every end step, as long as you gained life that turn." },
   { q: "Can I gain life during the end step to turn it on?", a: "No. It checks when the end step begins. Gain the life earlier, for example by populating during an opponent's combat or second main phase." },
   { q: "How do I split the counters?", a: "You choose targets and the split when the trigger goes on the stack, and each target needs at least one counter. Lathiel can't target itself." },
   { q: "How many counters with infinite life?", a: "'Up to that many' lets you pick any number, so name one big enough to win." }
  ],
  tips: [
   "Put counters on Walking Ballista at an opponent's end step: each one is a ping you can fire at instant speed."
  ],
  combos: ["Spike Feeder", "Walking Ballista", "Soul Warden"]
 },
 "Lazotep Quarry": {
  rating: 2,
  when: "Late game",
  tags: ["sacrifice outlet", "graveyard", "desert"],
  rulings: [
   { q: "Can it sacrifice itself for the Desert cost?", a: "Yes. It's a Desert, the only one in the deck, so the graveyard ability uses up the Quarry." },
   { q: "How much does the copy cost?", a: "{X}{2} from other sources, where X is the card's exact mana value: 7 mana for Archangel of Thune, 10 for Craterhoof Behemoth." },
   { q: "Can I sacrifice a creature in response to removal?", a: "Yes. It's a mana ability, and death triggers still happen. The mana empties at the end of the step, so use it or lose it." },
   { q: "What does a Walking Ballista copy look like?", a: "Ballista's mana value is 0 in the graveyard, so it costs {2}. The token is a 4/4 Zombie with no counters. It doesn't die, and it can grow with {4} or counters from your other cards." }
  ],
  tips: [
   "A Zombie Walking Ballista is a great Heliod combo piece: its base 4/4 body means removing its last counter never kills it."
  ],
  combos: ["Walking Ballista", "Craterhoof Behemoth", "Elenda's Hierophant", "Voice of Resurgence"]
 },
 "Llanowar Elves": {
  rating: 3,
  when: "Turn 1",
  tags: ["mana dork", "1-drop"],
  rulings: [
   { q: "Can Springleaf Drum tap it the turn it enters?", a: "Yes. Tapping it for the Drum's cost isn't its own {T} ability, so summoning sickness doesn't matter, and the Drum makes any color." }
  ],
  tips: [
   "Turn 1 Elves means a turn 3 Trostani, as long as your first three lands give you {G}{W}{W}.",
   "Late game, a 1/1 Elves with nothing to pay for is a fine Skullclamp target: two cards."
  ],
  combos: ["Springleaf Drum", "Skullclamp"]
 },
 "Mirror Entity": {
  rating: 3,
  when: "Your attack step",
  tags: ["mana sink", "instant speed", "changeling"],
  rulings: [
   { q: "Do repeated activations add up?", a: "No. Each one sets base power and toughness, and the latest one wins. X=3 then X=5 gives 5/5, not 8/8." },
   { q: "Does it shrink big creatures?", a: "Yes. It replaces <i-c>Soul of Eternity</i-c>'s life-total size, <i-c>Adeline, Resplendent Cathar</i-c>'s power and the Voice of Resurgence Elemental's size. Counters and pumps still add on top." },
   { q: "Does it affect creatures that enter after I activate it?", a: "No, only creatures you control when the ability resolves." },
   { q: "Is Mirror Entity an Angel?", a: "Yes. Changeling makes it every creature type, so <i-c>Seraph Sanctuary</i-c> triggers when it enters. It's also a Human, so <i-c>Return of the Wildspeaker</i-c> never counts it." }
  ],
  tips: [
   "With Triumph of the Hordes, X=9 plus Triumph's +1/+1 is 10 poison from every unblocked creature."
  ],
  combos: ["Triumph of the Hordes", "Fanatic of Rhonas", "Vorinclex, Voice of Hunger", "Seraph Sanctuary"]
 },
 "Nature's Lore": {
  rating: 3,
  when: "Turn 2",
  tags: ["untapped ramp", "fixing"],
  rulings: [
   { q: "Does the land always enter untapped?", a: "Nature's Lore doesn't tap it, but the land's own rules still apply: <i-c>Sapseep Forest</i-c> enters tapped, and <i-c>Canopy Vista</i-c> enters tapped unless you control two or more basic lands." },
   { q: "Can it find a Plains?", a: "Only a card with the Forest type: a basic Forest, Canopy Vista or Sapseep Forest." }
  ],
  tips: [
   "On turn 2, fetch a basic Forest and spend it right away on Sol Ring, Springleaf Drum or a green mana creature."
  ],
  combos: ["Canopy Vista", "Sapseep Forest"]
 },
 "Nykthos Paragon": {
  rating: 4,
  when: "Turns 6-7",
  tags: ["must-answer", "once per turn", "human"],
  rulings: [
   { q: "If I decline a small trigger, can I use it later that turn?", a: "Yes. 'Only once each turn' counts the times you actually put counters. Declining doesn't use it up." },
   { q: "Does it put counters on itself?", a: "Yes. It says each creature you control, and Paragon is one of them." },
   { q: "Two gains happen at once. Which one do I use?", a: "Each gain triggers separately, and you choose the order. Let the small one resolve first and decline it, then take the big one." },
   { q: "Is it a Human?", a: "Yes, a Human Soldier. <i-c>Return of the Wildspeaker</i-c> doesn't pump it or count it." }
  ],
  tips: [
   "On opponents' turns, one Spike Feeder counter (2 life) is enough to use the once-per-turn: two counters on everything for free.",
   "Cleric Class adds 1 to each gain, which is one more counter on every creature."
  ],
  combos: ["Grove of the Guardian", "Camaraderie", "Shamanic Revelation", "Spike Feeder", "Soul of Eternity"]
 },
 "Overgrown Farmland": {
  rating: 2,
  when: "Turns 3+",
  tags: ["dual", "untapped later"],
  rulings: [
   { q: "What counts as 'two or more other lands'?", a: "Any lands you control when it enters, basic or not, tapped or untapped." }
  ],
  tips: [
   "Play your tapped lands on turns 1 and 2 and save this one for turn 3 or later."
  ]
 },
 "Overwhelming Stampede": {
  rating: 4,
  when: "Your big turn, before combat",
  tags: ["sorcery speed", "trample", "overrun"],
  rulings: [
   { q: "Is X locked in?", a: "Yes. X is the greatest power among your creatures when it resolves, counters and earlier pumps included. It doesn't change afterward." },
   { q: "Do tokens made during combat get it?", a: "No. <i-c>Hero of Bladehold</i-c>'s and <i-c>Adeline, Resplendent Cathar</i-c>'s attack tokens are created after it resolves, so they miss both the bonus and trample." },
   { q: "Does Soul of Eternity's size count?", a: "Yes. Its power is your life total, so at 60 life every creature gets +60/+60." }
  ],
  tips: [
   "Grow your biggest creature first, for example with Gavony Township, then cast Stampede: a bigger X lifts every creature.",
   "An active Beastmaster Ascension counts toward X too."
  ],
  combos: ["Soul of Eternity", "Ghalta and Mavren", "Beastmaster Ascension", "Gavony Township"]
 },
 "Path to Exile": {
  rating: 3,
  when: "Instant speed, on a real threat",
  tags: ["instant speed", "exile", "1-mana"],
  rulings: [
   { q: "Can I target my own creature?", a: "Yes. You may search for a basic land, so it's an emergency answer if your creature is about to be stolen, or ramp in a pinch." },
   { q: "Does the opponent have to take the land?", a: "No, it's optional. If they take it, it enters tapped." },
   { q: "Does it stop a commander for good?", a: "No. Its owner may move it to the command zone and recast it for {2} more." }
  ],
  tips: [
   "Pick the gift that hurts less: Path against a player low on life, Swords to Plowshares against a ramp deck."
  ]
 },
 "Prosperous Innkeeper": {
  rating: 3,
  when: "Turn 2",
  tags: ["2-drop", "treasure"],
  rulings: [
   { q: "Does it trigger for opponents' creatures?", a: "No. Unlike <i-c>Soul Warden</i-c>, it only sees creatures entering under your control." },
   { q: "Does the Treasure trigger Trostani?", a: "No. A Treasure is an artifact token, not a creature." },
   { q: "Is it a Human?", a: "No, a Halfling Citizen. <i-c>Return of the Wildspeaker</i-c> counts it." }
  ],
  tips: [
   "With Trostani and Soul Warden out, each creature you make is three separate lifegain events: three Archangel of Thune triggers.",
   "If you keep the Treasure, Esika's Chariot can copy it when it attacks."
  ],
  combos: ["Archangel of Thune", "Esika's Chariot"]
 },
 "Radiant Fountain": {
  rating: 1,
  when: "Any turn",
  tags: ["colorless", "untapped"],
  rulings: [
   { q: "Does it enter tapped?", a: "No. It enters untapped and gains you 2 life, but it only makes colorless mana." }
  ],
  tips: [
   "Play it on a turn you're already gaining life, to help Resplendent Angel reach 5."
  ]
 },
 "Razorverge Thicket": {
  rating: 2,
  when: "Turns 1-3",
  tags: ["untapped early", "dual"],
  rulings: [
   { q: "Does it count itself?", a: "No. It checks your other lands: two or fewer and it enters untapped. After Cultivate or Nature's Lore, it can enter tapped even on turn 3." }
  ],
  tips: [
   "Ramp spells count against it: play it as your land drop before you cast Nature's Lore or Cultivate that turn."
  ]
 },
 "Resplendent Angel": {
  rating: 4,
  when: "Turn 3",
  tags: ["flying", "end step", "must-answer"],
  rulings: [
   { q: "Can I gain the 5 life during the end step?", a: "No. It checks when the end step begins. On an opponent's turn, gain the life before that, for example by populating during their combat or second main phase, not in their end step." },
   { q: "Does the 5 have to come all at once?", a: "No. It counts all the life you gained that turn, from any number of events." },
   { q: "Does it work on opponents' turns?", a: "Yes, at every end step. <i-c>Soul Warden</i-c> seeing their creatures, or your own instant-speed plays, can get you to 5." }
  ],
  tips: [
   "Its six-mana pump adds lifelink: a 5/5 lifelinker that connects makes the Angel by itself.",
   "Each 4/4 Angel it makes is 4 life from Trostani and 1 from Seraph Sanctuary."
  ],
  combos: ["Trostani, Selesnya's Voice", "Seraph Sanctuary", "Soul Warden", "Spike Feeder"]
 },
 "Restless Prairie": {
  rating: 2,
  when: "Turns 5+, on attack turns",
  tags: ["manland", "enters tapped", "anthem"],
  rulings: [
   { q: "Can it attack the turn I play it?", a: "No. An animated land has summoning sickness unless you've controlled it since the start of your turn." },
   { q: "Can I tap it for mana to pay for its own animation?", a: "You can, but then it's tapped and can't attack. Pay with your other lands." },
   { q: "Do counters stay on it?", a: "Yes. +1/+1 counters it gets while it's a creature stay on the land and count again the next time you animate it." },
   { q: "Does animating it trigger Trostani?", a: "No. Becoming a creature isn't entering the battlefield." }
  ],
  tips: [
   "Let Hero of Bladehold's and Adeline's token triggers resolve before its attack trigger, so the new tokens get +1/+1 too."
  ],
  combos: ["Hero of Bladehold", "Adeline, Resplendent Cathar", "Gavony Township"]
 },
 "Return of the Wildspeaker": {
  rating: 3,
  when: "Instant speed: after blocks, or end of turn to draw",
  tags: ["instant speed", "modal"],
  rulings: [
   { q: "Can the draw mode kill me?", a: "Yes. The draw isn't optional. With <i-c>Soul of Eternity</i-c> out, its power is your life total, which can be more cards than your library holds, and drawing from an empty library makes you lose." },
   { q: "Which of my creatures are Humans?", a: "<i-c>Adeline, Resplendent Cathar</i-c> and her tokens, <i-c>Hero of Bladehold</i-c>, <i-c>Soul Warden</i-c>, <i-c>Speaker of the Heavens</i-c>, <i-c>Avacyn's Pilgrim</i-c>, <i-c>Nykthos Paragon</i-c> and <i-c>Mirror Entity</i-c> (changeling). Hero's Soldier tokens are not Humans." },
   { q: "Does the +3/+3 reach creatures that enter later?", a: "No, only non-Human creatures you control when it resolves." }
  ],
  tips: [
   "Cast the draw mode at the end of the turn before yours: you keep mana up through the round and still untap with a full hand."
  ],
  combos: ["Ghalta and Mavren", "Voice of Resurgence"]
 },
 "Rogue's Passage": {
  rating: 2,
  when: "Before blockers",
  tags: ["colorless", "evasion", "mana sink"],
  rulings: [
   { q: "Can I use it after blockers are declared?", a: "It does nothing for a creature that's already blocked. Activate it before blocks, usually before you attack or in the declare attackers step." },
   { q: "Can I target a creature that has hexproof from Shalai?", a: "Yes. Hexproof only stops opponents." }
  ],
  tips: [
   "With Triumph of the Hordes, one unblockable creature with 10 or more power kills a player with poison."
  ],
  combos: ["Soul of Eternity", "Triumph of the Hordes"]
 },
 "Rootborn Defenses": {
  rating: 3,
  when: "In response to a wipe",
  tags: ["instant speed", "wipe insurance"],
  rulings: [
   { q: "Is the populated token indestructible too?", a: "Yes. The populate happens first, then all your creatures gain indestructible." },
   { q: "Can I cast it with no creature tokens?", a: "Yes. You just don't get a token. Your creatures still gain indestructible." },
   { q: "Does it stop exile wipes?", a: "No. Indestructible only stops destroy effects and lethal damage. Exile, -X/-X and sacrifice still work." }
  ],
  tips: [
   "Cast it in response to your own Elspeth -3 or Hour of Reckoning to make them one-sided."
  ],
  combos: ["Hour of Reckoning", "Elspeth, Sun's Champion", "Voice of Resurgence"]
 },
 "Sapseep Forest": {
  rating: 1,
  when: "Turns 1-2",
  tags: ["enters tapped", "forest type"],
  rulings: [
   { q: "Do Forests count as green permanents?", a: "No. Lands are colorless. You need two green permanents such as Trostani, a mana Elf, or green tokens like Citizens and Cats." },
   { q: "When can I use the lifegain?", a: "Not the turn it enters, since it's tapped. Later it needs {G} from another land, because Sapseep taps itself for the ability." }
  ],
  tips: [
   "Keep {G} and Sapseep up on opponents' turns: 1 life at instant speed is enough to use Nykthos Paragon or reach Resplendent Angel's 5."
  ],
  combos: ["Nykthos Paragon", "Archangel of Thune"]
 },
 "Selesnya Sanctuary": {
  rating: 2,
  when: "Turns 2-3",
  tags: ["bounce land", "enters tapped"],
  rulings: [
   { q: "Can I return a land I already tapped this turn?", a: "Yes. Tap it for mana first, then play Sanctuary and return that tapped land. You keep the mana for this phase and replay the land next turn." },
   { q: "Can it return itself?", a: "Yes, and if it's your only land, it has to." },
   { q: "How much does Vorinclex add?", a: "One more {G} or {W}. <i-c>Vorinclex, Voice of Hunger</i-c> adds one mana of a type the land made, not a second {G}{W}." }
  ],
  tips: [
   "Play it when you have a spare land in hand, so returning a land doesn't cost you a land drop."
  ],
  combos: ["Blossoming Sands", "Graypelt Refuge", "Vorinclex, Voice of Hunger"]
 },
 "Selesnya Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "Can I use it the turn I cast it?", a: "Yes. Artifacts that aren't creatures have no summoning sickness." },
   { q: "Is it really ramp if it costs {1} to use?", a: "Yes. You put in one mana and get two back, so it's one extra mana each turn, and it turns colorless mana into {G}{W}." }
  ],
  tips: [
   "Feed it Sol Ring's colorless mana: the pair covers the colored costs that Sol Ring alone can't."
  ],
  combos: ["Sol Ring"]
 },
 "Seraph Sanctuary": {
  rating: 1,
  when: "Any turn",
  tags: ["colorless", "angels"],
  rulings: [
   { q: "Which of my creatures are Angels?", a: "<i-c>Archangel of Thune</i-c>, <i-c>Resplendent Angel</i-c> and its tokens, <i-c>Shalai, Voice of Plenty</i-c>, the tokens from <i-c>Speaker of the Heavens</i-c>, and <i-c>Mirror Entity</i-c> through changeling." }
  ],
  tips: [
   "Each Angel is a separate 1-life event: with Archangel of Thune out, every Angel you make is an extra counter on your team."
  ],
  combos: ["Resplendent Angel", "Speaker of the Heavens", "Mirror Entity"]
 },
 "Shalai, Voice of Plenty": {
  rating: 4,
  when: "Turn 4, the turn before a key threat",
  tags: ["legendary", "flying", "miku art"],
  rulings: [
   { q: "What exactly does she protect?", a: "You, your planeswalkers and your other creatures. Not Shalai herself, not artifacts or enchantments like <i-c>Aetherflux Reservoir</i-c> or <i-c>Cathars' Crusade</i-c>, and not <i-c>Heliod, Sun-Crowned</i-c> unless it's a creature." },
   { q: "Can I still target my own creatures?", a: "Yes. Hexproof only stops spells and abilities your opponents control." },
   { q: "When can I use the counter ability?", a: "Any time you have priority: after blockers, at the end of a turn, or in response to removal on Shalai." }
  ],
  tips: [
   "When someone targets Shalai, respond with her {4}{G}{G} if you can afford it: the counters land even if she dies."
  ],
  combos: ["Archangel of Thune", "Heliod, Sun-Crowned", "Elspeth, Sun's Champion", "Excavation Technique"]
 },
 "Shamanic Revelation": {
  rating: 3,
  when: "Turns 6+, with 5 or more creatures",
  tags: ["sorcery speed", "refill"],
  rulings: [
   { q: "Is the ferocious lifegain one event?", a: "Yes. 4 life for each creature with power 4 or greater is gained all at once, so each payoff triggers once. With <i-c>Nykthos Paragon</i-c> that's a lot of counters on everything." },
   { q: "When are my creatures counted?", a: "When it resolves, for both the cards and the life." }
  ],
  tips: [
   "Activate Mirror Entity for X=4 first: every creature is then 4/4 and adds 4 life on top of its card."
  ],
  combos: ["Nykthos Paragon", "Mirror Entity", "Cathars' Crusade"]
 },
 "Skullclamp": {
  rating: 4,
  when: "Turns 2-4",
  tags: ["equipment", "cheap", "must-answer"],
  rulings: [
   { q: "When can I equip?", a: "Only as a sorcery: your main phase, with an empty stack. You can equip as many times as you can pay {1}." },
   { q: "Does the creature have to die while equipped?", a: "Yes. A 1/1 becomes 2/0 and dies right away, so you draw two. A creature that survives just gets +1/-1." },
   { q: "Can I equip an opponent's creature?", a: "No. Equip only targets creatures you control." }
  ],
  tips: [
   "A fresh Elenda's Hierophant is the best target: it dies with power 2, giving you two cards and two Vampires."
  ],
  combos: ["Elenda's Hierophant", "Spike Feeder", "Elspeth, Sun's Champion"]
 },
 "Sol Ring": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana rock", "colorless"],
  rulings: [
   { q: "Can Sol Ring pay for Trostani?", a: "Not her printed cost: its mana is colorless, and {G}{G}{W}{W} is all colored. It can pay her commander tax, and it can feed <i-c>Selesnya Signet</i-c> or <i-c>Sungrass Prairie</i-c> to make colors." }
  ],
  tips: [
   "Turn 1 Sol Ring, turn 2 Selesnya Signet: six mana on turn 3, with the Signet turning Sol Ring's mana into colors."
  ],
  combos: ["Selesnya Signet", "Walking Ballista"]
 },
 "Song of the Worldsoul": {
  rating: 2,
  when: "Turns 6+",
  tags: ["enchantment", "cast triggers", "miku art"],
  rulings: [
   { q: "Does the populate happen before or after the spell?", a: "Before. The trigger goes on the stack above your spell and resolves first, so a pump like <i-c>Overwhelming Stampede</i-c> also reaches the new token." },
   { q: "If the spell makes my first token, do I get a copy?", a: "No. The trigger resolves before the spell, so with no creature token out, populate does nothing." },
   { q: "What counts as casting a spell?", a: "Every spell you cast, Trostani from the command zone included. Demonstrate copies, unlocking a Room door, leveling up <i-c>Cleric Class</i-c>, encore and eternalize don't count." }
  ],
  tips: [
   "Cheap instants like Swords to Plowshares, Path to Exile and Sundering Growth become two-for-ones: hold them until it's out."
  ],
  combos: ["Voice of Resurgence", "Grand Crescendo", "Grove of the Guardian"]
 },
 "Soul Warden": {
  rating: 4,
  when: "Turn 1",
  tags: ["1-drop", "symmetrical", "miku art"],
  rulings: [
   { q: "Does it trigger for opponents' creatures and tokens?", a: "Yes. Any creature entering under any player's control, tokens included." },
   { q: "Does it trigger for itself?", a: "No, only for other creatures." },
   { q: "Many tokens enter at once. One trigger or many?", a: "One per creature, and each is a separate life gain event." }
  ],
  tips: [
   "Bramble Sovereign can copy it for {1}{G}: every creature entering is then two separate gains.",
   "It's a Human Cleric, so Return of the Wildspeaker skips it."
  ],
  combos: ["Archangel of Thune", "Bramble Sovereign", "Heliod, Sun-Crowned"]
 },
 "Soul of Eternity": {
  rating: 2,
  when: "Turns 7+",
  tags: ["encore", "graveyard", "huge"],
  rulings: [
   { q: "What happens when it enters with Trostani out?", a: "Trostani's trigger uses Soul's toughness when it resolves, which is your life total. You gain your life total, so your life doubles." },
   { q: "How big are the encore copies?", a: "Each copy has the same ability, so each is as big as your life total. Each must attack its opponent if able, has haste, and is sacrificed at the next end step." },
   { q: "And encore with Trostani out?", a: "Each copy entering is its own Trostani trigger, and each one doubles your life again." },
   { q: "What if I pay life for Aetherflux Reservoir?", a: "Soul shrinks right away. Its size always matches your current life total." }
  ],
  tips: [
   "With Trostani and Nykthos Paragon out, casting Soul gains you your life total, and Paragon puts that many counters on everything."
  ],
  combos: ["Trostani, Selesnya's Voice", "Nykthos Paragon", "Overwhelming Stampede", "Rogue's Passage"]
 },
 "Speaker of the Heavens": {
  rating: 2,
  when: "Turn 1, active by the midgame",
  tags: ["1-drop", "human", "sorcery speed"],
  rulings: [
   { q: "How much life do I need?", a: "At least 47, since Commander starts at 40. It's checked when you activate." },
   { q: "Can I use it the turn it enters?", a: "No. It's a {T} ability, so Speaker needs to have been under your control since your turn began." },
   { q: "Can it attack and still make an Angel?", a: "Yes. Vigilance keeps it untapped, so attack for 1 lifelink damage, then tap it for an Angel in your second main phase." }
  ],
  tips: [
   "Heliod's and Cleric Class's counters make its lifelink hits bigger, and it keeps its vigilance."
  ],
  combos: ["Seraph Sanctuary", "Trostani, Selesnya's Voice"]
 },
 "Spike Feeder": {
  rating: 3,
  when: "Turn 3, or the combo turn",
  tags: ["instant speed", "tutor target", "counters"],
  rulings: [
   { q: "How many counters does the loop need?", a: "At least two. If you remove its last counter, Feeder dies as a 0/0 before the life gain resolves, and the engine has nothing to put a counter back on." },
   { q: "Can I remove counters in response to removal?", a: "Yes. Removing a counter is a cost, so you can cash in every counter for 2 life each before the removal resolves." },
   { q: "Does Archangel of Thune's counter go on Feeder?", a: "Yes. <i-c>Archangel of Thune</i-c> puts a counter on each creature you control, Feeder included, so that loop needs no targeting." }
  ],
  tips: [
   "Shortcut the loop: announce a number of repeats, like 'I do this 500 times', then apply the life and counters in one step."
  ],
  combos: ["Heliod, Sun-Crowned", "Archangel of Thune", "Cleric Class", "Aetherflux Reservoir", "Nykthos Paragon"]
 },
 "Springleaf Drum": {
  rating: 2,
  when: "Turns 1-3",
  tags: ["fixing", "1-drop"],
  rulings: [
   { q: "Can I tap a creature that's already tapped?", a: "No. The creature has to be untapped, and once tapped for the Drum it can't attack or block until it untaps." },
   { q: "Can I use it on opponents' turns?", a: "Yes, any time you could pay mana. The Drum itself only untaps in your untap step, so it's once per round." }
  ],
  tips: [
   "Tap creatures that can't attack this turn anyway, like fresh tokens, so the Drum costs you nothing in combat."
  ],
  combos: ["Halo Fountain", "Grand Crescendo"]
 },
 "Sundering Growth": {
  rating: 2,
  when: "Instant speed",
  tags: ["instant speed", "hybrid", "2-mana"],
  rulings: [
   { q: "If the target is gone, do I still populate?", a: "No. If its only target is illegal when it resolves, the whole spell does nothing." },
   { q: "Can I pay it with only green or only white?", a: "Yes. Each {G/W} can be paid with either color." },
   { q: "Do I populate if the target is indestructible?", a: "Yes. The target is still legal, so the spell resolves: nothing is destroyed, but you still populate." }
  ],
  tips: [
   "Use it over Break Down when you have a big token to copy, and save Break Down for when you don't."
  ],
  combos: ["Voice of Resurgence", "Grove of the Guardian"]
 },
 "Sungrass Prairie": {
  rating: 1,
  when: "Turns 2+",
  tags: ["filter land", "needs a partner"],
  rulings: [
   { q: "Can it make mana on its own?", a: "No. It needs {1} from another source, then gives {G}{W}. As your only land, it makes nothing." }
  ],
  tips: [
   "Pair it with colorless sources like Sol Ring, Gavony Township or Rogue's Passage: it turns their mana into colors."
  ],
  combos: ["Sol Ring"]
 },
 "Sunpetal Grove": {
  rating: 2,
  when: "Turns 2+",
  tags: ["checkland", "dual"],
  rulings: [
   { q: "Do Canopy Vista and Sapseep Forest turn it on?", a: "Yes. It checks for any land with the Forest or Plains type, not just basics." }
  ],
  tips: [
   "Don't lead with it on turn 1: with no other land out, it enters tapped."
  ],
  combos: ["Canopy Vista", "Sapseep Forest"]
 },
 "Swords to Plowshares": {
  rating: 4,
  when: "Instant speed, on a real threat",
  tags: ["instant speed", "exile", "1-mana"],
  rulings: [
   { q: "Can I target my own creature?", a: "Yes. You gain life equal to its power, which triggers your lifegain cards." },
   { q: "Which power is used?", a: "Its power as it last existed on the battlefield, counters and pumps included." },
   { q: "Does it beat indestructible?", a: "Yes. Exile ignores indestructible." }
  ],
  tips: [
   "When you're planning a Triumph of the Hordes kill, the life it gives away doesn't matter: poison ignores life totals."
  ]
 },
 "Triumph of the Hordes": {
  rating: 4,
  when: "Your big turn, before combat",
  tags: ["sorcery speed", "poison", "trample"],
  rulings: [
   { q: "Does lifelink still work with infect?", a: "Yes. Damage dealt as poison or -1/-1 counters is still damage, so lifelink still gains you life." },
   { q: "Do tokens made during the attack get infect?", a: "No. Only creatures you control when it resolves. <i-c>Hero of Bladehold</i-c>'s and <i-c>Adeline, Resplendent Cathar</i-c>'s attack tokens deal normal damage." },
   { q: "How does trample work with infect?", a: "You assign lethal damage to blockers based on their toughness, and the rest goes to the player as poison counters." },
   { q: "Is poison shared between players?", a: "No. Each player has their own poison count, and ten on one player kills that player." }
  ],
  tips: [
   "Pump after blockers with Jazal Goldmane or Mirror Entity: every extra point of power is another poison counter."
  ],
  combos: ["Jazal Goldmane", "Mirror Entity", "Rogue's Passage", "Grand Crescendo"]
 },
 "Voice of Resurgence": {
  rating: 3,
  when: "Turn 2",
  tags: ["2-drop", "death trigger", "anti-instant"],
  rulings: [
   { q: "Do populated copies of the Elemental also grow?", a: "Yes. A copy has the same ability, so every Elemental is as big as the number of creatures you control, and each new one makes all of them bigger." },
   { q: "How much life does Trostani give for the Elemental?", a: "Its toughness when the trigger resolves: the number of creatures you control at that moment, itself included." },
   { q: "Which spells trigger it?", a: "Any spell an opponent casts during your turn, like an instant or a flash creature. Spells they cast on other turns don't count." }
  ],
  tips: [
   "Mirror Entity replaces the Elemental's size with X/X, so don't activate it for less than your creature count."
  ],
  combos: ["Trostani, Selesnya's Voice", "Rootborn Defenses", "Esika's Chariot", "Song of the Worldsoul"]
 },
 "Voice of the Blessed": {
  rating: 2,
  when: "Turn 2",
  tags: ["2-drop", "grows", "evasion"],
  rulings: [
   { q: "Do counters from other cards count toward four and ten?", a: "Yes. Any +1/+1 counters count, whether they come from <i-c>Cathars' Crusade</i-c>, <i-c>Archangel of Thune</i-c>, <i-c>Heliod, Sun-Crowned</i-c> or <i-c>Gavony Township</i-c>." },
   { q: "What if it loses counters?", a: "It only has the abilities while it has enough counters. A -1/-1 counter cancels a +1/+1 counter, so an infect blocker can shrink it below a threshold." }
  ],
  tips: [
   "Aim Heliod's or Cleric Class's counters at it: two counters per lifegain event gets it to indestructible in five events."
  ],
  combos: ["Heliod, Sun-Crowned", "Cleric Class", "Beastmaster Ascension"]
 },
 "Vorinclex, Voice of Hunger": {
  rating: 2,
  when: "Turns 8+",
  tags: ["legendary", "trample", "miku art"],
  rulings: [
   { q: "What does it double?", a: "Only lands you tap for mana. Each time, it adds one more mana of a type that land made. Rocks, Treasures and mana creatures aren't doubled." },
   { q: "Does it double a land that makes two mana?", a: "No. <i-c>Selesnya Sanctuary</i-c> gives {G}{W} plus one more {G} or {W}, not four." },
   { q: "Which opponents' lands stay tapped?", a: "Only lands they tap for mana, whenever they do it. Those skip their controller's next untap step." },
   { q: "Could it be the commander?", a: "Only of a mono-green deck. Its color identity is green, so a Vorinclex deck couldn't play any of the white cards here." }
  ],
  tips: [
   "Opponents who tap lands for instants on your turn also lose those lands for their next untap step."
  ],
  combos: ["Jazal Goldmane", "Mirror Entity", "Walking Ballista", "Grand Crescendo"]
 },
 "Walking Ballista": {
  rating: 4,
  when: "Turns 2-3 for X=1, or late",
  tags: ["x spell", "instant speed", "mana sink"],
  rulings: [
   { q: "Can I ping in response to removal?", a: "Yes. Removing a counter is a cost, so you can fire every counter before the removal resolves." },
   { q: "Can convoke pay for X?", a: "Yes, with <i-c>Dazzling Theater // Prop Room</i-c> unlocked. Each tapped creature pays {1}, so twelve creatures pay for a Ballista with six counters." },
   { q: "What's its mana value?", a: "On the stack it's twice X. Everywhere else it's 0, which is how <i-c>Finale of Devastation</i-c> and <i-c>Lazotep Quarry</i-c> see it." }
  ],
  tips: [
   "Pings are damage, not life loss, so they can finish a player an overrun left on a few life.",
   "Early, use it on 1-toughness mana creatures and utility creatures rather than on players."
  ],
  combos: ["Heliod, Sun-Crowned", "Cathars' Crusade", "Dazzling Theater // Prop Room", "Lazotep Quarry", "Gavony Township"]
 },
 "Plains": {
  rating: 1,
  when: "Any turn",
  tags: ["basic", "miku art"],
  rulings: [
   { q: "Why can I play seven Plains in a singleton deck?", a: "Basic lands are exempt from Commander's one-copy rule." },
   { q: "What can fetch it?", a: "<i-c>Cultivate</i-c>, <i-c>Brokers Hideout</i-c>, <i-c>Farseek</i-c> and <i-c>Krosan Verge</i-c>." }
  ],
  tips: [
   "Basics turn on Canopy Vista: try to have two in play early."
  ]
 },
 "Forest": {
  rating: 1,
  when: "Any turn",
  tags: ["basic", "miku art"],
  rulings: [
   { q: "What can fetch it?", a: "<i-c>Nature's Lore</i-c>, <i-c>Cultivate</i-c>, <i-c>Brokers Hideout</i-c> and <i-c>Krosan Verge</i-c>." },
   { q: "Does a Forest count as a green permanent for Sapseep Forest?", a: "No. Lands are colorless, even the ones that make green mana." }
  ],
  tips: [
   "Count your {G} sources before keeping a hand: Craterhoof Behemoth needs {G}{G}{G}."
  ]
 }
};

window.MIKU_GLOSSARY = [
 { term: "Populate", html: "Create a token that's a copy of a creature token you control. Only creature tokens can be copied, and the copy doesn't get the original's counters or pumps. The new token enters, so <i-c>Trostani, Selesnya's Voice</i-c> triggers again.", cards: ["Trostani, Selesnya's Voice", "Rootborn Defenses", "Sundering Growth", "Song of the Worldsoul"] },
 { term: "Convoke", html: "While casting the spell, you can tap untapped creatures you control to help pay. Each one pays {1} or one mana of its color. Summoning-sick creatures and fresh tokens can convoke.", cards: ["Hour of Reckoning", "Dazzling Theater // Prop Room"] },
 { term: "Myriad", html: "Whenever the creature attacks, for each opponent other than the one it's attacking, you may create a token copy attacking that player. The copies are exiled at end of combat, but they did enter, so enter triggers still happen.", cards: ["Conclave Evangelist"] },
 { term: "Demonstrate", html: "When you cast the spell, you may copy it. If you do, you choose an opponent who also copies it. Each copy can have new targets, and copies aren't cast.", cards: ["Excavation Technique"] },
 { term: "Encore", html: "Pay the encore cost and exile the card from your graveyard, as a sorcery. You get one token copy for each opponent. Each copy has haste, must attack its opponent that turn if able, and is sacrificed at the next end step.", cards: ["Soul of Eternity"] },
 { term: "Eternalize", html: "Pay the cost and exile the card from your graveyard, as a sorcery, to create a token copy that's a 4/4 black Zombie with no mana cost.", cards: ["Fanatic of Rhonas"] },
 { term: "Ferocious", html: "A label for effects that care about creatures with power 4 or greater. On <i-c>Fanatic of Rhonas</i-c> it's a condition checked when you activate the ability. On <i-c>Shamanic Revelation</i-c> it counts those creatures when the spell resolves.", cards: ["Fanatic of Rhonas", "Shamanic Revelation"] },
 { term: "Battle cry", html: "Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn. Tokens created attacking only get it if they already exist when battle cry resolves.", cards: ["Hero of Bladehold"] },
 { term: "Infect and poison", html: "A creature with infect deals damage to players as poison counters and to creatures as -1/-1 counters. A player with ten or more poison counters loses, whatever their life total.", cards: ["Triumph of the Hordes"] },
 { term: "Trample", html: "When a trampler is blocked, you only have to assign lethal damage to the blockers, meaning damage equal to their remaining toughness. The rest can go to the player.", cards: ["Craterhoof Behemoth", "Ghalta and Mavren", "Vorinclex, Voice of Hunger", "Blossoming Bogbeast", "Overwhelming Stampede", "Triumph of the Hordes"] },
 { term: "Lifelink", html: "Damage the creature deals also makes you gain that much life. Each lifelink source is its own life gain event, so two lifelinkers hitting together trigger <i-c>Archangel of Thune</i-c> twice.", cards: ["Archangel of Thune", "Lathiel, the Bounteous Dawn", "Speaker of the Heavens", "Heliod, Sun-Crowned", "Resplendent Angel", "Ghalta and Mavren", "Elenda's Hierophant"] },
 { term: "Vigilance", html: "Attacking doesn't tap the creature, so it can still block and use {T} abilities afterward. It doesn't untap a creature that entered tapped.", cards: ["Adeline, Resplendent Cathar", "Speaker of the Heavens", "Intangible Virtue", "Grove of the Guardian", "Resplendent Angel", "Voice of the Blessed"] },
 { term: "Indestructible", html: "The permanent isn't destroyed by 'destroy' effects or lethal damage. It can still be exiled, sacrificed, bounced, or killed by having 0 toughness.", cards: ["Heliod, Sun-Crowned", "Grand Crescendo", "Rootborn Defenses", "Voice of the Blessed"] },
 { term: "Hexproof", html: "It can't be the target of spells or abilities your opponents control. You can still target it, and effects that don't target, like wipes, still hit it. A player with hexproof can't be targeted by opponents either.", cards: ["Shalai, Voice of Plenty"] },
 { term: "Flying", html: "A creature with flying can only be blocked by creatures with flying or reach.", cards: ["Archangel of Thune", "Resplendent Angel", "Shalai, Voice of Plenty", "Elenda's Hierophant", "Voice of the Blessed", "Speaker of the Heavens", "Elspeth, Sun's Champion"] },
 { term: "First strike", html: "The creature deals combat damage in an earlier, separate step. If it kills the creature it's fighting there, it takes no damage back.", cards: ["Jazal Goldmane"] },
 { term: "Haste", html: "The creature can attack and use {T} abilities the turn it comes under your control.", cards: ["Craterhoof Behemoth", "Crashing Drawbridge", "Finale of Devastation", "Soul of Eternity"] },
 { term: "Defender", html: "The creature can't attack. It can still block and use its abilities.", cards: ["Crashing Drawbridge"] },
 { term: "Changeling", html: "The card is every creature type, in every zone. <i-c>Mirror Entity</i-c> counts as an Angel for <i-c>Seraph Sanctuary</i-c> and as a Human for <i-c>Return of the Wildspeaker</i-c>.", cards: ["Mirror Entity"] },
 { term: "Crew and Vehicles", html: "A Vehicle is an artifact that becomes an artifact creature until end of turn when you crew it: tap any untapped creatures you control with total power equal to or greater than the crew number. Summoning-sick creatures can crew, but the Vehicle still can't attack the turn it came under your control without haste.", cards: ["Esika's Chariot"] },
 { term: "Rooms", html: "A Room is one enchantment card with two doors. You cast one door, and it enters unlocked. Later, as a sorcery, you can pay the other door's mana cost to unlock it. Unlocking isn't casting a spell.", cards: ["Dazzling Theater // Prop Room"] },
 { term: "Classes", html: "A Class enchantment enters at level 1. Pay the next level's cost as a sorcery to gain that level's ability, one level at a time. Leveling up is an activated ability, not a spell.", cards: ["Cleric Class"] },
 { term: "Devotion", html: "Your devotion to white is the number of {W} symbols in the mana costs of permanents you control. Hybrid {G/W} symbols count too. <i-c>Heliod, Sun-Crowned</i-c> is only a creature at five or more.", cards: ["Heliod, Sun-Crowned"] },
 { term: "+1/+1 counters", html: "Each counter gives +1/+1 and stays until the permanent leaves the battlefield. A +1/+1 counter and a -1/-1 counter on the same permanent cancel out. Populate and other copy effects don't copy counters.", cards: ["Archangel of Thune", "Cathars' Crusade", "Heliod, Sun-Crowned", "Nykthos Paragon", "Gavony Township", "Spike Feeder", "Walking Ballista", "Ajani's Pridemate", "Voice of the Blessed", "Lathiel, the Bounteous Dawn", "Cleric Class", "Shalai, Voice of Plenty", "Elenda's Hierophant"] },
 { term: "Tokens and copies", html: "Tokens are permanents created by effects. A token copy copies what's printed on the original, plus any copy effects, but not counters, damage, pumps or whether it's tapped. A token that leaves the battlefield stops existing. If it went to the graveyard, it still counts as dying.", cards: ["Bramble Sovereign", "Esika's Chariot", "Lazotep Quarry", "Conclave Evangelist", "Trostani, Selesnya's Voice"] },
 { term: "Treasure", html: "An artifact token with '{T}, Sacrifice this token: Add one mana of any color.' You can use it any time you could pay mana.", cards: ["Prosperous Innkeeper", "Excavation Technique"] },
 { term: "Junk tokens", html: "An artifact token with '{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn.' It works only as a sorcery, and you still pay for any spell you cast this way.", cards: ["Break Down"] },
 { term: "Emblems", html: "An emblem sits in the command zone for the rest of the game. It can't be destroyed or removed.", cards: ["Elspeth, Sun's Champion"] },
 { term: "The legend rule", html: "If you control two or more legendary permanents with the same name, you choose one to keep and put the rest into their owners' graveyards. That's why copying a legendary creature with <i-c>Bramble Sovereign</i-c> is a waste.", cards: ["Trostani, Selesnya's Voice", "Adeline, Resplendent Cathar", "Shalai, Voice of Plenty", "Jazal Goldmane", "Lathiel, the Bounteous Dawn", "Ghalta and Mavren", "Vorinclex, Voice of Hunger", "Heliod, Sun-Crowned", "Esika's Chariot", "Elspeth, Sun's Champion"] },
 { term: "The stack and triggered abilities", html: "Spells and abilities wait on the stack, and the last one added resolves first. When several of your abilities trigger at once, you choose their order: the one you put on last resolves first. Players can respond before each one resolves.", cards: ["Hero of Bladehold", "Adeline, Resplendent Cathar", "Ghalta and Mavren", "Blossoming Bogbeast", "Bramble Sovereign"] },
 { term: "Enters triggers", html: "Abilities like Trostani's trigger for anything that enters the battlefield, cast or not: tokens, populate copies, myriad copies, and creatures put onto the battlefield by <i-c>Finale of Devastation</i-c>. A permanent that becomes a creature, like an animated <i-c>Restless Prairie</i-c>, doesn't enter.", cards: ["Trostani, Selesnya's Voice", "Soul Warden", "Prosperous Innkeeper", "Cathars' Crusade", "Craterhoof Behemoth", "Seraph Sanctuary", "Bramble Sovereign"] },
 { term: "Commander tax", html: "Each time you cast your commander from the command zone, it costs {2} more for each previous time you cast it from there this game. The tax is generic mana, so any mana, or convoke from Dazzling Theater, can pay it.", cards: ["Trostani, Selesnya's Voice"] },
 { term: "Command zone", html: "Your commander starts the game here, and you can cast it from here. If it goes to your graveyard or into exile, you may move it here right after. If it would go to your hand or library, you may put it here instead. Emblems live here too.", cards: ["Trostani, Selesnya's Voice", "Elspeth, Sun's Champion"] },
 { term: "Commander damage (21)", html: "A player who has been dealt 21 or more combat damage by the same commander over the course of the game loses. <i-c>Trostani, Selesnya's Voice</i-c> is a 2/5 engine, so this rarely matters for you.", cards: ["Trostani, Selesnya's Voice"] },
 { term: "Color identity", html: "The colors of every mana symbol in a card's mana cost and rules text. Every card in your deck must fit your commander's color identity, here green and white. <i-c>Command Tower</i-c> and <i-c>Arcane Signet</i-c> make mana of those colors.", cards: ["Trostani, Selesnya's Voice", "Command Tower", "Arcane Signet"] },
 { term: "Mulligans: free and London", html: "Commander uses the London mulligan: shuffle, draw seven, then put one card on the bottom for each mulligan you've taken. In multiplayer your first mulligan is free: you draw seven again and bottom nothing.", cards: [] },
 { term: "Brackets and Game Changers", html: "Brackets are the official 1 to 5 scale for Commander decks, and this deck plays as a <b>Bracket 3</b> ('Upgraded') deck. Game Changers are an official list of cards that push a deck toward higher brackets, and the lower brackets limit how many you can play. The list and the limits change over time, so check the current official list against the deck before a bracketed event.", cards: [] },
 { term: "Summoning sickness", html: "A creature can't attack or use {T} abilities unless you've controlled it continuously since the start of your most recent turn. Tapping it to pay a cost like convoke, crew or <i-c>Springleaf Drum</i-c> is fine, and haste removes the restriction.", cards: ["Llanowar Elves", "Elvish Mystic", "Avacyn's Pilgrim", "Fanatic of Rhonas", "Crashing Drawbridge", "Springleaf Drum", "Trostani, Selesnya's Voice"] },
 { term: "Planeswalkers and loyalty", html: "You can use one loyalty ability of each planeswalker per turn, in your main phase with an empty stack. Opponents can attack a planeswalker, damage removes loyalty, and at 0 loyalty it's put into the graveyard.", cards: ["Elspeth, Sun's Champion"] },
 { term: "Equip", html: "Pay the equip cost as a sorcery to attach the Equipment to a creature you control. If the creature leaves, the Equipment stays on the battlefield, unattached and ready to move again.", cards: ["Skullclamp"] },
 { term: "X costs and mana value", html: "You choose X when you cast the spell, and it has that value on the stack. Everywhere else X counts as 0, so <i-c>Walking Ballista</i-c> has mana value 0 in your library or graveyard, and a copy that wasn't cast enters with no counters.", cards: ["Walking Ballista", "Finale of Devastation", "Grand Crescendo", "Mirror Entity", "Lazotep Quarry"] },
 { term: "Lifegain events", html: "'Whenever you gain life' triggers once per event, not once per point. Five separate 1-life triggers are five events, and one 'gain 20' is one event. Each lifelink source dealing damage is its own event.", cards: ["Ajani's Pridemate", "Archangel of Thune", "Heliod, Sun-Crowned", "Nykthos Paragon", "Voice of the Blessed", "Elenda's Hierophant", "Cleric Class"] },
 { term: "End step 'if' triggers", html: "An ability worded 'At the beginning of each end step, if...' only triggers if the condition is already true when the end step begins, and checks again when it resolves. Life gained during the end step is too late.", cards: ["Resplendent Angel", "Lathiel, the Bounteous Dawn"] },
 { term: "Destroy, exile and sacrifice", html: "Destroy is stopped by indestructible. Exile ignores indestructible. Sacrifice is done by the permanent's controller and gets around both indestructible and hexproof.", cards: ["Swords to Plowshares", "Path to Exile", "Beast Within", "Generous Gift", "Lazotep Quarry", "Grand Crescendo"] }
];

window.MIKU_CUTS = [
 { name: "Congregate", why: "Pure lifegain with no effect on the board. Overwhelming Stampede turns the same wide board into a kill." },
 { name: "Invincible Hymn", why: "Eight mana to set your life total to the size of your library. Beastmaster Ascension costs three and wins combats instead." },
 { name: "Boon Reflection", why: "Doubling lifegain adds nothing to the board by itself for five mana. Intangible Virtue pumps every token for two." },
 { name: "Angelic Chorus", why: "It repeats what Trostani already does: life equal to each entering creature's toughness. Mirror Entity adds a mana-sink finisher instead." },
 { name: "Healing Technique", why: "Slow graveyard recursion with a little lifegain. Beast Within answers any permanent at instant speed." },
 { name: "Arasta of the Endless Web", why: "A defensive creature whose tokens only come when opponents cast instants and sorceries. Adeline makes attackers every combat." },
 { name: "Suture Priest", why: "A weaker second Soul Warden. Spike Feeder also gains life, and it goes infinite with Heliod, Archangel of Thune or Cleric Class." },
 { name: "Mirari's Wake", why: "Five mana for an anthem that barely changes the board the turn it lands. Jazal Goldmane costs four and can win a combat by itself." },
 { name: "Gruff Triplets", why: "A six-drop with little synergy with lifegain or populate. Elspeth costs the same, makes three tokens every turn and adds a one-sided wipe." },
 { name: "Song of Freyalise", why: "A Saga whose payoff arrives two turns after you cast it, and everyone sees it coming. Esika's Chariot makes two bodies right away and keeps copying tokens." },
 { name: "Ancient Cornucopia", why: "A three-mana mana rock is too slow. Arcane Signet costs two and makes either of your colors." },
 { name: "Explore", why: "It only ramps if you have a second land to play. Elvish Mystic ramps on turn 1 every time." },
 { name: "Silverquill Lecturer", why: "A creature with little impact in this deck. Crashing Drawbridge gives the whole team haste for two mana." },
 { name: "Angel of Indemnity", why: "A seven-drop the deck didn't need. Return of the Wildspeaker costs five and is either a big draw or a team pump, at instant speed." },
 { name: "Rhys the Redeemed", why: "Its token doubling needs six mana and a tap, so it's slow. Generous Gift answers any permanent for three." },
 { name: "Temple of Plenty", why: "It always enters tapped. Razorverge Thicket enters untapped in your first three turns, when tempo matters most." },
 { name: "Pest Infestation", why: "A flexible X spell, but a slow one. Heliod is a lifegain engine by itself and an infinite combo with Walking Ballista or Spike Feeder." },
 { name: "Phyrexian Processor", why: "Eight mana and a chunk of life before the first token. Walking Ballista is flexible removal and half of the Heliod combo." },
 { name: "Storm Herd", why: "Ten mana is too much for this deck. Cathars' Crusade grows the whole team every turn for five." },
 { name: "Growing Ranks", why: "One populate per upkeep is slow. Hero of Bladehold makes two attacking tokens every combat." },
 { name: "Crested Sunmare", why: "A good lifegain payoff, but slow and defensive. Triumph of the Hordes kills through any life total." },
 { name: "Idol of Oblivion", why: "Slow card draw plus a very expensive 10/10. Craterhoof Behemoth is the strongest finisher in green." }
];

window.MIKU_FAQ = [
 { q: "Is this deck Bracket 3?", a: "Yes. It's a solid <b>Bracket 3</b> ('Upgraded') deck, about 6.5 to 7 on the old 1 to 10 scale. The official Game Changers list and bracket rules change over time, so check the current list against this deck before a bracketed event." },
 { q: "Do I need to tell my table about the combos?", a: "Yes. Mention <i-c>Heliod, Sun-Crowned</i-c> + <i-c>Walking Ballista</i-c> and the <i-c>Spike Feeder</i-c> loops in the pregame talk. Bracket 3 allows two-card combos that don't come together in the early turns, but check the current bracket rules and ask your group: some ban infinite combos entirely." },
 { q: "Why Trostani and not Vorinclex as commander?", a: "Color identity. <i-c>Vorinclex, Voice of Hunger</i-c> is mono-green, so a Vorinclex deck couldn't play any of the white cards. <i-c>Trostani, Selesnya's Voice</i-c> is green and white, sits at the center of the lifegain engine, and is available every game from the command zone." },
 { q: "How many lands should I keep?", a: "Three or four, ideally with a ramp piece. Two lands is fine with <i-c>Sol Ring</i-c> or a mana creature and cheap plays. Mulligan hands with zero, one, six or seven lands." },
 { q: "Is the first mulligan really free?", a: "Yes, in multiplayer Commander. You shuffle and draw seven again. After that it's the London mulligan: draw seven, then put one card on the bottom for each mulligan after the free one." },
 { q: "What does 'populate' copy?", a: "One creature token you control, your choice. The copy has the original's printed stats and abilities but not its counters or pumps, and it enters untapped and not attacking. It counts as a creature entering, so <i-c>Trostani, Selesnya's Voice</i-c> triggers again." },
 { q: "How fast does the deck win?", a: "In a 5,000-game goldfish test with no opposing interaction, the median kill turn was 9, and 55% of games were won by turn 9. Real games with blockers and removal are slower, so treat that as a ceiling." },
 { q: "What wins most games?", a: "Plain combat. In the speed test, about two thirds of the wins were combat damage, and most of the rest came from <i-c>Overwhelming Stampede</i-c>, <i-c>Triumph of the Hordes</i-c>, <i-c>Craterhoof Behemoth</i-c> or <i-c>Return of the Wildspeaker</i-c>. The combos added only a few points." },
 { q: "How much does the deck cost?", a: "About 295€ in total: about 200€ for the sealed deck and about 95€ for the 22 upgrades. Singles prices are estimates from MTGGoldfish USD x 0.85, so check Cardmarket before buying." },
 { q: "Can I play the Miku-named cards?", a: "Yes. Names like 'Miku, Song of the People' are flavor names. The card is still <i-c>Trostani, Selesnya's Voice</i-c> for every rule, and it plays alongside normal printings of everything else." },
 { q: "Does 'whenever you gain life' care how much I gain?", a: "No, only how many times. Each life gain event is one trigger for <i-c>Archangel of Thune</i-c>, <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Ajani's Pridemate</i-c>, so ten 1-life triggers beat one 10-life gain. <i-c>Nykthos Paragon</i-c> is the exception: it wants one big gain." },
 { q: "Which cards should I protect first?", a: "<i-c>Archangel of Thune</i-c>, <i-c>Cathars' Crusade</i-c> and <i-c>Heliod, Sun-Crowned</i-c> turn lifegain into a bigger board. Trostani matters most, because every recast costs {2} more. <i-c>Shalai, Voice of Plenty</i-c> covers your other creatures against targeted removal." },
 { q: "How do I survive a board wipe?", a: "Against 'destroy' wipes, cast <i-c>Grand Crescendo</i-c> or <i-c>Rootborn Defenses</i-c> in response. Neither stops exile, sacrifice or -X/-X, so don't commit your whole hand at once, and keep a token maker back." },
 { q: "Why doesn't the deck have counterspells?", a: "Counterspells are blue, and every card has to fit Trostani's green-white color identity. Your interaction is instant-speed removal and protection instead." },
 { q: "Does Trostani need to attack?", a: "No. She's a 2/5 engine, and populate needs her untapped. Commander damage from her rarely matters, so keep her home unless the attack is free." },
 { q: "How do I keep track of all the triggers?", a: "Use dice for +1/+1 counters, keep a separate life counter, and say each trigger out loud. For loops, announce how many times you repeat it and apply the result in one step: that's a normal shortcut." },
 { q: "What should I change first if I upgrade further?", a: "Card draw is the weakest part of the deck. <i-c>Vorinclex, Voice of Hunger</i-c> is the easiest cut, for a cheaper draw engine such as Sylvan Library or Guardian Project." }
];
