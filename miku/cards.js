/* Generated card data for the Miku deck wiki. Rules text from the Forge card database. */
window.MIKU_CARDS = [
 {
  "name": "Trostani, Selesnya's Voice",
  "qty": 1,
  "cost": "{G}{G}{W}{W}",
  "mv": 4,
  "type": "Legendary Creature — Dryad",
  "cat": "Creature",
  "pt": "2/5",
  "text": "Whenever another creature you control enters, you gain life equal to that creature's toughness.\n{1}{G}{W}, {T}: Populate. (Create a token that's a copy of a creature token you control.)",
  "roles": [
   "cmd",
   "gain",
   "tokens"
  ],
  "miku": "Miku, Song of the People",
  "sld": "2429",
  "why": "The heart of the deck. Every other creature you control entering gains you life equal to its toughness, and that single trigger feeds everything else: Archangel of Thune, Heliod, Ajani's Pridemate, Nykthos Paragon, Cleric Class and Resplendent Angel all care about gaining life. Her populate ability turns your best token into two.",
  "how": "Cast her on turn 4 or 5 once you have ramp and a creature or two out. Populate has no timing restriction, so the strongest pattern is to leave {1}{G}{W} open and populate at the end of the opponent's turn right before yours: you keep mana up as a bluff and still get value. Copied tokens also count as a creature entering, so every populate is a second lifegain trigger. Best populate targets, in order: the 8/8 from Grove of the Guardian, the Elemental from Voice of Resurgence, 4/4 Angels, then anything with a +1/+1 counter-friendly body.",
  "syn": [
   "Archangel of Thune",
   "Heliod, Sun-Crowned",
   "Voice of Resurgence",
   "Grove of the Guardian",
   "Nykthos Paragon",
   "Cleric Class"
  ],
  "warn": "She is a value engine, not a beater. Don't attack with a 2/5 into open blockers; keep her home, tapping for populate."
 },
 {
  "name": "Adeline, Resplendent Cathar",
  "qty": 1,
  "cost": "{1}{W}{W}",
  "mv": 3,
  "type": "Legendary Creature — Human Knight",
  "cat": "Creature",
  "pt": "*/4",
  "text": "Vigilance\nAdeline, Resplendent Cathar's power is equal to the number of creatures you control.\nWhenever you attack, for each opponent, create a 1/1 white Human creature token that's tapped and attacking that player or a planeswalker they control.",
  "roles": [
   "tokens",
   "finisher"
  ],
  "new": true,
  "cut": "Arasta of the Endless Web",
  "eur": 3.3,
  "why": "Every time you attack, she makes a 1/1 Human attacking each opponent, so in a four-player game that is three free bodies per combat. Her power equals the number of creatures you control, so she is usually the biggest thing on the table.",
  "how": "Play her turn 3 and attack every turn, even if she stays home: the trigger happens whenever you attack with anything. The Humans come in tapped and attacking, so they trigger Trostani, Soul Warden and Cathars' Crusade mid-combat.",
  "syn": [
   "Cathars' Crusade",
   "Intangible Virtue",
   "Skullclamp",
   "Beastmaster Ascension",
   "Hero of Bladehold"
  ],
  "warn": "Her tokens are Humans, so Return of the Wildspeaker's +3/+3 mode skips them (and Adeline herself)."
 },
 {
  "name": "Aetherflux Reservoir",
  "qty": 1,
  "cost": "{4}",
  "mv": 4,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Whenever you cast a spell, you gain 1 life for each spell you've cast this turn.\nPay 50 life: Aetherflux Reservoir deals 50 damage to any target.",
  "roles": [
   "combo",
   "finisher"
  ],
  "why": "Pay 50 life: deal 50 damage to any target. With infinite life, that's every opponent dead. Even without a combo, this deck can reach 60+ life and snipe one player or a key creature.",
  "how": "Keep it on the battlefield early so the combo turn needs no extra mana. Every spell you cast also gains you life (1, then 2, then 3 on the same turn).",
  "syn": [
   "Spike Feeder",
   "Heliod, Sun-Crowned",
   "Archangel of Thune",
   "Cleric Class"
  ],
  "warn": "You need 50 life to pay 50. Paying down to exactly 0 kills you."
 },
 {
  "name": "Ajani's Pridemate",
  "qty": 1,
  "cost": "{1}{W}",
  "mv": 2,
  "type": "Creature — Cat Soldier",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Whenever you gain life, put a +1/+1 counter on Ajani's Pridemate.",
  "roles": [
   "payoff"
  ],
  "why": "A two-drop that grows by one counter every time you gain life. With Soul Warden or Trostani out, it snowballs into a real threat in a couple of turns.",
  "how": "Best on turn 2 alongside a lifegain source. Each separate lifegain event is a counter, so ten tokens entering one at a time is ten counters, not one.",
  "syn": [
   "Soul Warden",
   "Trostani, Selesnya's Voice",
   "Cleric Class",
   "Prosperous Innkeeper"
  ]
 },
 {
  "name": "Arcane Signet",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "ramp"
  ],
  "new": true,
  "cut": "Ancient Cornucopia",
  "eur": 0.7,
  "why": "Two-mana rock that makes either color. Much faster than Ancient Cornucopia's three.",
  "how": "Turn 2 play, into a four-drop on turn 3.",
  "syn": [
   "Sol Ring",
   "Selesnya Signet"
  ]
 },
 {
  "name": "Archangel of Thune",
  "qty": 1,
  "cost": "{3}{W}{W}",
  "mv": 5,
  "type": "Creature — Angel",
  "cat": "Creature",
  "pt": "3/4",
  "text": "Flying\nLifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhenever you gain life, put a +1/+1 counter on each creature you control.",
  "roles": [
   "payoff",
   "combo"
  ],
  "miku": "Archangel of Tunes",
  "sld": "2430",
  "why": "The best card in the deck. Every time you gain life, every creature you control gets a +1/+1 counter. With Trostani, Soul Warden or Prosperous Innkeeper, one token entering can mean two or three counters on your whole team. It is also half of an infinite combo with Spike Feeder.",
  "how": "Protect it. Try to land it when Shalai is out or when you can follow up with Grand Crescendo or Rootborn Defenses. Its own lifelink makes every attack a lifegain event too: right after combat damage, every creature you control gets a counter.",
  "syn": [
   "Spike Feeder",
   "Trostani, Selesnya's Voice",
   "Soul Warden",
   "Shalai, Voice of Plenty",
   "Bramble Sovereign",
   "Grand Crescendo"
  ],
  "warn": "Every opponent knows this card. It eats removal on sight, so bait with Hero of Bladehold or Adeline first."
 },
 {
  "name": "Avacyn's Pilgrim",
  "qty": 1,
  "cost": "{G}",
  "mv": 1,
  "type": "Creature — Human Monk",
  "cat": "Creature",
  "pt": "1/1",
  "text": "{T}: Add {W}.",
  "roles": [
   "ramp"
  ],
  "why": "Turn-one mana creature that makes white, which fixes the heavier white cards like Archangel of Thune and Heliod.",
  "how": "Turn 1 play. Later, tap it for Springleaf Drum or convoke instead of for mana if you need a different color.",
  "syn": [
   "Springleaf Drum",
   "Halo Fountain",
   "Dazzling Theater // Prop Room"
  ]
 },
 {
  "name": "Beast Within",
  "qty": 1,
  "cost": "{2}{G}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target permanent. Its controller creates a 3/3 green Beast creature token.",
  "roles": [
   "removal"
  ],
  "new": true,
  "cut": "Healing Technique",
  "eur": 1.65,
  "why": "Instant: destroy any permanent. The controller gets a 3/3 Beast, which is a small price for answering anything.",
  "how": "Save it for what beats you: a combo piece, a board-wipe artifact, a stax enchantment. In an emergency, target your own permanent in response to its removal to get the 3/3.",
  "syn": [
   "Generous Gift",
   "Swords to Plowshares",
   "Path to Exile"
  ]
 },
 {
  "name": "Beastmaster Ascension",
  "qty": 1,
  "cost": "{2}{G}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever a creature you control attacks, you may put a quest counter on Beastmaster Ascension.\nAs long as Beastmaster Ascension has seven or more quest counters on it, creatures you control get +5/+5.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Invincible Hymn",
  "eur": 3.9,
  "why": "Each attacking creature adds a quest counter. At seven, your creatures get +5/+5. A go-wide deck attacks with seven creatures in a single combat, so it can turn on and pump the same attack.",
  "how": "Cast it precombat on a turn you can attack with seven or more creatures: the counters go on as attackers are declared, so the +5/+5 applies before blocks. Hero of Bladehold's and Adeline's tokens are created attacking, not declared as attackers, so they don't add counters but do get the pump.",
  "syn": [
   "Adeline, Resplendent Cathar",
   "Hero of Bladehold",
   "Grand Crescendo",
   "Crashing Drawbridge"
  ]
 },
 {
  "name": "Blossoming Bogbeast",
  "qty": 1,
  "cost": "{4}{G}",
  "mv": 5,
  "type": "Creature — Beast",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Whenever Blossoming Bogbeast attacks, you gain 2 life. Then creatures you control gain trample and get +X/+X until end of turn, where X is the amount of life you gained this turn.",
  "roles": [
   "finisher",
   "gain"
  ],
  "why": "When it attacks, you gain 2 life, then your whole team gets trample and +X/+X, where X is all the life you gained this turn, not just the 2. After a big precombat lifegain turn this is a surprise overrun.",
  "how": "Load up the lifegain first: cast creatures precombat with Trostani out, populate, crack gain lands. Then attack with Bogbeast and everything else. Its own 2 life also triggers Archangel of Thune and Heliod. Those counters land right after the pump resolves, still before combat damage.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Archangel of Thune",
   "Soul Warden",
   "Grand Crescendo"
  ]
 },
 {
  "name": "Blossoming Sands",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Blossoming Sands enters tapped.\nWhen Blossoming Sands enters, you gain 1 life.\n{T}: Add {G} or {W}.",
  "roles": [
   "land",
   "gain"
  ],
  "why": "Dual land that enters tapped and gains 1 life (a lifegain trigger for Thune and Heliod).",
  "how": "Play it on a turn you don't need all your mana.",
  "syn": [
   "Graypelt Refuge"
  ]
 },
 {
  "name": "Bountiful Promenade",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Bountiful Promenade enters tapped unless you have two or more opponents.\n{T}: Add {G} or {W}.",
  "roles": [
   "land"
  ],
  "sld": "2440",
  "why": "Dual land that enters untapped in multiplayer.",
  "how": "Always untapped in Commander.",
  "syn": []
 },
 {
  "name": "Bramble Sovereign",
  "qty": 1,
  "cost": "{2}{G}{G}",
  "mv": 4,
  "type": "Creature — Dryad",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Whenever another nontoken creature enters, you may pay {1}{G}. If you do, that creature's controller creates a token that's a copy of that creature.",
  "roles": [
   "tokens"
  ],
  "why": "Whenever another nontoken creature enters, pay {1}{G} to make a token copy of it. It doubles your best card: two Archangels of Thune, two Craterhoof triggers, two Heroes of Bladehold, two Spike Feeders.",
  "how": "Keep {1}{G} open whenever you cast your key creature. Copying Craterhoof Behemoth is the dream: two enter triggers, and the second one counts the copy too.",
  "syn": [
   "Craterhoof Behemoth",
   "Archangel of Thune",
   "Hero of Bladehold",
   "Spike Feeder",
   "Nykthos Paragon"
  ],
  "warn": "Don't copy legendary creatures (Adeline, Jazal, Shalai, Lathiel, Ghalta and Mavren, Vorinclex, or Heliod when it's a creature): the legend rule makes you keep only one. Don't copy Walking Ballista either: the copy isn't cast, so it enters with no counters and dies. It also triggers on opponents' creatures, but you choose whether to pay, so just don't."
 },
 {
  "name": "Break Down",
  "qty": 1,
  "cost": "{2}{G}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target artifact or enchantment. Create a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")",
  "roles": [
   "removal"
  ],
  "sld": "2436",
  "why": "Instant artifact or enchantment removal that also gives you a Junk token (exile the top card, play it this turn).",
  "how": "Kill mana rocks, equipment or problem enchantments. Crack the Junk token on a turn with spare mana for a free card.",
  "syn": [
   "Sundering Growth",
   "Beast Within"
  ]
 },
 {
  "name": "Brokers Hideout",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "When Brokers Hideout enters, sacrifice it. When you do, search your library for a basic Forest, Plains, or Island card, put it onto the battlefield tapped, then shuffle and you gain 1 life.",
  "roles": [
   "land"
  ],
  "why": "Sacrifices itself to fetch a basic Forest or Plains (tapped) and gain 1 life.",
  "how": "Play it early. It also thins your deck by one land.",
  "syn": []
 },
 {
  "name": "Brushland",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {G} or {W}. Brushland deals 1 damage to you.",
  "roles": [
   "land"
  ],
  "new": true,
  "cut": "Radiant Fountain",
  "eur": 3.0,
  "why": "An untapped dual land. It makes {G} or {W} for 1 damage, or {C} for free. The deck has more white pips than green but had fewer white sources; this is one more.",
  "how": "Play it the turn you need white right away. Tap it for {C} when a cost has a generic part and keep the damage for colored pips. Trostani pays the life back many times over.",
  "syn": []
 },
 {
  "name": "Camaraderie",
  "qty": 1,
  "cost": "{4}{G}{W}",
  "mv": 6,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "You gain X life and draw X cards, where X is the number of creatures you control. Creatures you control get +1/+1 until end of turn.",
  "roles": [
   "draw",
   "gain"
  ],
  "why": "Gain X life and draw X cards, where X is your creature count, and your team gets +1/+1. With 8 creatures, that's 8 cards and 8 life.",
  "how": "The deck's big refill. Cast it when your board is wide, ideally with Nykthos Paragon out (8 life means 8 counters on everything).",
  "syn": [
   "Nykthos Paragon",
   "Archangel of Thune",
   "Grand Crescendo"
  ]
 },
 {
  "name": "Canopy Vista",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Forest Plains",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {G} or {W}.)\nCanopy Vista enters tapped unless you control two or more basic lands.",
  "roles": [
   "land"
  ],
  "why": "Forest Plains dual. It enters untapped once you have two basics, and since it has both land types, Farseek and Nature's Lore can fetch it.",
  "how": "Fetch it with Nature's Lore or Farseek.",
  "syn": [
   "Nature's Lore",
   "Farseek"
  ]
 },
 {
  "name": "Cathars' Crusade",
  "qty": 1,
  "cost": "{3}{W}{W}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever a creature you control enters, put a +1/+1 counter on each creature you control.",
  "roles": [
   "payoff",
   "finisher"
  ],
  "new": true,
  "cut": "Storm Herd",
  "eur": 7.2,
  "why": "Every creature entering puts a +1/+1 counter on each creature you control. With a token deck, the whole team gains several counters a turn.",
  "how": "Grand Crescendo for X=5 with Crusade out is five counters on everything, including the new tokens. Track counters with dice, because the triggers stack up quickly.",
  "syn": [
   "Grand Crescendo",
   "Elspeth, Sun's Champion",
   "Hero of Bladehold",
   "Adeline, Resplendent Cathar",
   "Walking Ballista"
  ]
 },
 {
  "name": "Cleric Class",
  "qty": 1,
  "cost": "{W}",
  "mv": 1,
  "type": "Enchantment — Class",
  "cat": "Enchantment",
  "pt": "",
  "text": "(Gain the next level as a sorcery to add its ability.)\nIf you would gain life, you gain that much life plus 1 instead.\n{3}{W}: Level 2\nWhenever you gain life, put a +1/+1 counter on target creature you control.\n{4}{W}: Level 3\nWhen this Class becomes level 3, return target creature card from your graveyard to the battlefield. You gain life equal to its toughness.",
  "roles": [
   "gain",
   "payoff",
   "combo"
  ],
  "why": "Level 1: every lifegain is 1 bigger. Level 2 ({3}{W}): whenever you gain life, put a +1/+1 counter on target creature you control. Level 3 ({4}{W}): reanimate a creature and gain life equal to its toughness. Level 2 is also a third way to make Spike Feeder infinite.",
  "how": "Cast level 1 turn 1 or 2 for value. Level up to 2 when you have a lifegain engine; the counters stack on your best evasive creature. With Spike Feeder: remove a counter, gain 3 (2+1), put the counter back on Feeder, repeat forever. No mana needed.",
  "syn": [
   "Spike Feeder",
   "Soul Warden",
   "Trostani, Selesnya's Voice",
   "Archangel of Thune"
  ]
 },
 {
  "name": "Command Tower",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add one mana of any color in your commander's color identity.",
  "roles": [
   "land"
  ],
  "why": "Taps for either color.",
  "how": "Always untapped.",
  "syn": []
 },
 {
  "name": "Conclave Evangelist",
  "qty": 1,
  "cost": "{3}{G/W}{G/W}",
  "mv": 5,
  "type": "Creature — Elephant Cleric",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)\nWhenever Conclave Evangelist deals combat damage to a player, create a token that's a copy of Conclave Evangelist.",
  "roles": [
   "tokens"
  ],
  "why": "Myriad makes a temporary attacking copy for each other opponent, and any copy that deals combat damage to a player makes a permanent copy of itself. In a four-player game, one good attack can turn one 4/4 into three or four.",
  "how": "Attack with it when the other players have few flyers-sized blockers or when you have evasion (Rogue's Passage, trample from Overwhelming Stampede). Each new copy entering is a Trostani trigger for 4 life.",
  "syn": [
   "Rogue's Passage",
   "Trostani, Selesnya's Voice",
   "Cathars' Crusade",
   "Overwhelming Stampede"
  ]
 },
 {
  "name": "Crashing Drawbridge",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact Creature — Wall",
  "cat": "Creature",
  "pt": "0/4",
  "text": "Defender\n{T}: Creatures you control gain haste until end of turn.",
  "roles": [
   "utility",
   "finisher"
  ],
  "new": true,
  "cut": "Silverquill Lecturer",
  "eur": 0.7,
  "why": "A 2-mana wall that taps to give your whole team haste. In a token deck, that means everything you made this turn can attack immediately, so Elspeth tokens, Grand Crescendo tokens and a freshly cast Craterhoof team all swing.",
  "how": "Play it early as a blocker. On the kill turn, make your tokens in the first main phase, tap Drawbridge, then pump and swing.",
  "syn": [
   "Grand Crescendo",
   "Elspeth, Sun's Champion",
   "Craterhoof Behemoth",
   "Halo Fountain"
  ],
  "warn": "Halo Fountain can untap it after you use it, making a Citizen as a bonus."
 },
 {
  "name": "Craterhoof Behemoth",
  "qty": 1,
  "cost": "{5}{G}{G}{G}",
  "mv": 8,
  "type": "Creature — Beast",
  "cat": "Creature",
  "pt": "5/5",
  "text": "Haste\nWhen Craterhoof Behemoth enters, creatures you control gain trample and get +X/+X until end of turn, where X is the number of creatures you control.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Idol of Oblivion",
  "eur": 21.25,
  "why": "The classic green finisher: it enters with haste and gives every creature you control trample and +X/+X, where X is how many creatures you have. With ten creatures, that is ten 11-power tramplers.",
  "how": "Cast it only when it wins: count your creatures and the total damage first. Finale of Devastation for X=8 puts it straight onto the battlefield. If Bramble Sovereign is out, pay to copy it for a second, even bigger pump.",
  "syn": [
   "Finale of Devastation",
   "Bramble Sovereign",
   "Grand Crescendo",
   "Crashing Drawbridge",
   "Lazotep Quarry"
  ],
  "warn": "Tokens you made this turn still can't attack without haste. Tap Crashing Drawbridge first if you went wide this turn."
 },
 {
  "name": "Cultivate",
  "qty": 1,
  "cost": "{2}{G}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
  "roles": [
   "ramp"
  ],
  "sld": "2437",
  "why": "Three mana: one basic land onto the battlefield and one to your hand.",
  "how": "Turn 3 play. Get a Forest and a Plains, whichever colors you lack.",
  "syn": [
   "Nature's Lore",
   "Farseek"
  ]
 },
 {
  "name": "Dazzling Theater // Prop Room",
  "qty": 1,
  "cost": "{3}{W} // {2}{W}",
  "mv": 4,
  "type": "Enchantment — Room",
  "cat": "Enchantment",
  "pt": "",
  "text": "",
  "faces": [
   {
    "name": "Dazzling Theater",
    "cost": "{3}{W}",
    "text": "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)\nCreature spells you cast have convoke. (Your creatures can help cast those spells. Each creature you tap while casting a creature spell pays for {1} or one mana of that creature's color.)"
   },
   {
    "name": "Prop Room",
    "cost": "{2}{W}",
    "text": "(You may cast either half. That door unlocks on the battlefield. As a sorcery, you may pay the mana cost of a locked door to unlock it.)\nUntap each creature you control during each other player's untap step."
   }
  ],
  "roles": [
   "utility",
   "ramp"
  ],
  "why": "A Room with two doors. Dazzling Theater ({3}{W}): your creature spells have convoke, so your tokens pay for your creatures. Prop Room ({2}{W}): untap all your creatures during each other player's untap step, so everything that attacked is back as a blocker and every mana creature works on every turn.",
  "how": "Usually unlock Dazzling Theater first for the mana. Prop Room shines once your board is big: attack with everything with no fear of the crack-back, and use your mana creatures on opponents' turns for instant-speed Trostani populates or Grand Crescendo. It untaps creatures only, so Springleaf Drum itself still untaps once a round.",
  "syn": [
   "Halo Fountain",
   "Springleaf Drum",
   "Grand Crescendo",
   "Craterhoof Behemoth",
   "Trostani, Selesnya's Voice"
  ]
 },
 {
  "name": "Elenda's Hierophant",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Creature — Vampire Cleric",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Flying\nWhenever you gain life, put a +1/+1 counter on Elenda's Hierophant.\nWhen Elenda's Hierophant dies, create X 1/1 white Vampire creature tokens with lifelink, where X is its power.",
  "roles": [
   "payoff",
   "tokens"
  ],
  "why": "A cheap flyer that grows with each lifegain and, when it dies, leaves behind that many 1/1 lifelink Vampires. It is a threat that punishes removal.",
  "how": "Play it early and let it grow. If an opponent wipes the board, you get a whole team of lifelinkers back. Sacrificing it to Lazotep Quarry for mana is a legitimate way to cash it in.",
  "syn": [
   "Soul Warden",
   "Trostani, Selesnya's Voice",
   "Lazotep Quarry",
   "Cathars' Crusade"
  ]
 },
 {
  "name": "Elspeth, Sun's Champion",
  "qty": 1,
  "cost": "{4}{W}{W}",
  "mv": 6,
  "type": "Legendary Planeswalker — Elspeth",
  "cat": "Planeswalker",
  "pt": "",
  "text": "[+1]: Create three 1/1 white Soldier creature tokens.\n[-3]: Destroy all creatures with power 4 or greater.\n[-7]: You get an emblem with \"Creatures you control get +2/+2 and have flying.\"",
  "roles": [
   "tokens",
   "removal"
  ],
  "new": true,
  "cut": "Gruff Triplets",
  "eur": 2.6,
  "why": "Three 1/1 Soldiers every turn with her +1, a one-sided board wipe with her -3 (destroy all creatures with power 4 or greater), and a game-ending flying emblem at 7.",
  "how": "Usually just +1 every turn: nine bodies in three turns. The -3 is a great answer when opponents have big creatures and your board is small tokens, but check your own board first.",
  "syn": [
   "Intangible Virtue",
   "Cathars' Crusade",
   "Skullclamp",
   "Crashing Drawbridge",
   "Shalai, Voice of Plenty"
  ],
  "warn": "The -3 kills your own creatures with 4+ power too, including anything grown by counters."
 },
 {
  "name": "Elvish Mystic",
  "qty": 1,
  "cost": "{G}",
  "mv": 1,
  "type": "Creature — Elf Druid",
  "cat": "Creature",
  "pt": "1/1",
  "text": "{T}: Add {G}.",
  "roles": [
   "ramp"
  ],
  "new": true,
  "cut": "Explore",
  "eur": 0.45,
  "why": "Turn-one accel. Replacing Explore with a second Llanowar Elves makes turn-3 Trostani or turn-2 three-drops much more likely.",
  "how": "Turn 1. Later, it's a body for convoke, Springleaf Drum or a Skullclamp target in a pinch.",
  "syn": [
   "Fanatic of Rhonas",
   "Springleaf Drum",
   "Dazzling Theater // Prop Room"
  ]
 },
 {
  "name": "Esika's Chariot",
  "qty": 1,
  "cost": "{3}{G}",
  "mv": 4,
  "type": "Legendary Artifact — Vehicle",
  "cat": "Artifact",
  "pt": "4/4",
  "text": "When Esika's Chariot enters, create two 2/2 green Cat creature tokens.\nWhenever Esika's Chariot attacks, create a token that's a copy of target token you control.\nCrew 4",
  "roles": [
   "tokens"
  ],
  "new": true,
  "cut": "Song of Freyalise",
  "eur": 0.45,
  "why": "Four mana: two 2/2 Cats, and a 4/4 vehicle that copies one of your tokens every time it attacks.",
  "how": "Crew it with the two Cats (crew 4). Copy the best token: the Voice of Resurgence Elemental, a Grove 8/8 or an Angel. Each copy entering triggers Trostani.",
  "syn": [
   "Voice of Resurgence",
   "Grove of the Guardian",
   "Trostani, Selesnya's Voice",
   "Cathars' Crusade"
  ]
 },
 {
  "name": "Excavation Technique",
  "qty": 1,
  "cost": "{3}{W}",
  "mv": 4,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Demonstrate (When you cast this spell, you may copy it. If you do, choose an opponent to also copy it. Players may choose new targets for their copies.)\nDestroy target nonland permanent. Its controller creates two Treasure tokens.",
  "roles": [
   "removal"
  ],
  "why": "Destroy any nonland permanent (the controller gets two Treasures). Demonstrate lets you copy it to kill a second thing, but then an opponent also gets a copy.",
  "how": "Usually don't demonstrate. Only copy it when there are two things you want dead and nothing of yours is worth an opponent's copy.",
  "syn": [
   "Beast Within",
   "Generous Gift"
  ]
 },
 {
  "name": "Fanatic of Rhonas",
  "qty": 1,
  "cost": "{1}{G}",
  "mv": 2,
  "type": "Creature — Snake Druid",
  "cat": "Creature",
  "pt": "1/4",
  "text": "{T}: Add {G}.\nFerocious — {T}: Add {G}{G}{G}{G}. Activate only if you control a creature with power 4 or greater.\nEternalize {2}{G}{G} ({2}{G}{G}, Exile this card from your graveyard: Create a token that's a copy of it, except it's a 4/4 black Zombie Snake Druid with no mana cost. Eternalize only as a sorcery.)",
  "roles": [
   "ramp"
  ],
  "why": "Taps for {G}, or for {G}{G}{G}{G} if you control a creature with power 4 or greater. With counters flying around, that happens fast, and then it's the best ramp piece in the deck. The 1/4 body also blocks well.",
  "how": "Creatures with 4+ power in the list: Bramble Sovereign, Conclave Evangelist, Jazal, Nykthos Paragon, Ghalta, anything that got counters. Four green mana pays for Finale of Devastation or a big Walking Ballista. If it dies, eternalize it later as a 4/4 that satisfies its own condition.",
  "syn": [
   "Finale of Devastation",
   "Walking Ballista",
   "Mirror Entity",
   "Bramble Sovereign"
  ]
 },
 {
  "name": "Farseek",
  "qty": 1,
  "cost": "{1}{G}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a Plains, Island, Swamp, or Mountain card, put it onto the battlefield tapped, then shuffle.",
  "roles": [
   "ramp"
  ],
  "why": "Two mana: a Plains card onto the battlefield tapped. Canopy Vista counts as a Plains, so it can fetch a dual land.",
  "how": "Turn 2. Fetch Canopy Vista if it's still in your deck.",
  "syn": [
   "Canopy Vista",
   "Nature's Lore"
  ]
 },
 {
  "name": "Finale of Devastation",
  "qty": 1,
  "cost": "{X}{G}{G}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library and/or graveyard for a creature card with mana value X or less and put it onto the battlefield. If you search your library this way, shuffle. If X is 10 or more, creatures you control get +X/+X and gain haste until end of turn.",
  "roles": [
   "combo",
   "finisher"
  ],
  "sld": "2438",
  "why": "Tutors a creature straight onto the battlefield from your library or graveyard. X=3 gets Heliod or Spike Feeder, X=5 gets Archangel of Thune, X=8 gets Craterhoof, and at X=10 or more your whole team also gets +X/+X and haste.",
  "how": "Treat it as your most flexible card. Midgame: X=3 for the combo piece you're missing. Late: X=10 is a Craterhoof on its own.",
  "syn": [
   "Heliod, Sun-Crowned",
   "Spike Feeder",
   "Archangel of Thune",
   "Craterhoof Behemoth",
   "Vorinclex, Voice of Hunger",
   "Fanatic of Rhonas"
  ],
  "warn": "Never fetch Walking Ballista with it: it enters with no counters and dies."
 },
 {
  "name": "Gavony Township",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{2}{G}{W}, {T}: Put a +1/+1 counter on each creature you control.",
  "roles": [
   "land",
   "payoff"
  ],
  "why": "{2}{G}{W}, tap: a +1/+1 counter on every creature you control. A land that's a repeatable anthem.",
  "how": "Activate it at the end of an opponent's turn when you have spare mana.",
  "syn": [
   "Adeline, Resplendent Cathar",
   "Spike Feeder"
  ]
 },
 {
  "name": "Generous Gift",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target permanent. Its controller creates a 3/3 green Elephant creature token.",
  "roles": [
   "removal"
  ],
  "new": true,
  "cut": "Rhys the Redeemed",
  "eur": 1.3,
  "why": "Instant: destroy any permanent, the controller gets a 3/3 Elephant. White's Beast Within.",
  "how": "Same as Beast Within: save it for the permanent that matters.",
  "syn": [
   "Beast Within",
   "Swords to Plowshares"
  ]
 },
 {
  "name": "Ghalta and Mavren",
  "qty": 1,
  "cost": "{3}{G}{G}{W}{W}",
  "mv": 7,
  "type": "Legendary Creature — Dinosaur Vampire",
  "cat": "Creature",
  "pt": "12/12",
  "text": "Trample\nWhenever you attack, choose one —\n• Create a tapped and attacking X/X green Dinosaur creature token with trample, where X is the greatest power among other attacking creatures.\n• Create X 1/1 white Vampire creature tokens with lifelink, where X is the number of other attacking creatures.",
  "roles": [
   "finisher",
   "tokens"
  ],
  "why": "A 7-mana 12/12 trampler that makes something every time you attack: either an attacking Dinosaur as big as your largest other attacker, or one lifelink 1/1 Vampire per other attacker.",
  "how": "Pick the Vampire mode when you're going wide: each Vampire entering is its own Trostani and Soul Warden trigger, and with Archangel of Thune that's a counter wave per token. Pick the Dinosaur mode when one attacker is already huge.",
  "syn": [
   "Archangel of Thune",
   "Trostani, Selesnya's Voice",
   "Rogue's Passage",
   "Cathars' Crusade"
  ],
  "warn": "Legendary, so Bramble Sovereign can't usefully copy it."
 },
 {
  "name": "Grand Crescendo",
  "qty": 1,
  "cost": "{X}{W}{W}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Create X 1/1 green and white Citizen creature tokens. Creatures you control gain indestructible until end of turn.",
  "roles": [
   "tokens",
   "protect"
  ],
  "sld": "2432",
  "why": "Instant: make X 1/1 Citizens, and all your creatures gain indestructible until end of turn. It's a board-wipe answer, a combat trick and an instant-speed army in one.",
  "how": "Hold it up against wrath-happy opponents. Otherwise cast it at the end of the opponent's turn before yours. The Citizens enter together, but each one triggers separately: X=5 is five Trostani triggers and five Soul Warden triggers, so ten Archangel of Thune counter waves.",
  "syn": [
   "Cathars' Crusade",
   "Archangel of Thune",
   "Trostani, Selesnya's Voice",
   "Skullclamp",
   "Crashing Drawbridge"
  ]
 },
 {
  "name": "Graypelt Refuge",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Graypelt Refuge enters tapped.\nWhen Graypelt Refuge enters, you gain 1 life.\n{T}: Add {G} or {W}.",
  "roles": [
   "land",
   "gain"
  ],
  "why": "Dual land that enters tapped and gains 1 life.",
  "how": "Tapped land: play it on a slow turn.",
  "syn": [
   "Blossoming Sands"
  ]
 },
 {
  "name": "Grove of the Guardian",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{3}{G}{W}, {T}, Tap two untapped creatures you control, Sacrifice Grove of the Guardian: Create an 8/8 green and white Elemental creature token with vigilance.",
  "roles": [
   "land",
   "tokens"
  ],
  "why": "Sacrifice it with {3}{G}{W} and two untapped creatures tapped to make an 8/8 vigilance Elemental: the best populate target in the deck.",
  "how": "Make the 8/8, then populate it with Trostani. Each copy is 8 life.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Nykthos Paragon",
   "Esika's Chariot"
  ]
 },
 {
  "name": "Halo Fountain",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{W}, {T}, Untap a tapped creature you control: Create a 1/1 green and white Citizen creature token.\n{W}{W}, {T}, Untap two tapped creatures you control: Draw a card.\n{W}{W}{W}{W}{W}, {T}, Untap fifteen tapped creatures you control: You win the game.",
  "roles": [
   "tokens",
   "draw"
  ],
  "miku": "Cascade of Song",
  "sld": "2431",
  "why": "Turns tapped creatures into value: {W} and untap one creature for a Citizen, {W}{W} and untap two for a card, and {W}{W}{W}{W}{W} with fifteen untaps to win the game outright.",
  "how": "Creatures get tapped by attacking, by Springleaf Drum, by convoke, by Grove of the Guardian and by Crashing Drawbridge. For the alternate win, attack with 15+ creatures and pay {W}{W}{W}{W}{W} right after attackers are declared, before blockers can kill any of them.",
  "syn": [
   "Springleaf Drum",
   "Crashing Drawbridge",
   "Dazzling Theater // Prop Room",
   "Grand Crescendo",
   "Hour of Reckoning"
  ],
  "warn": "Intangible Virtue gives tokens vigilance, so they don't tap when attacking. Tap them with convoke (Dazzling Theater, Hour of Reckoning) instead."
 },
 {
  "name": "Heliod, Sun-Crowned",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Legendary Enchantment Creature — God",
  "cat": "Enchantment",
  "pt": "5/5",
  "text": "Indestructible\nAs long as your devotion to white is less than five, Heliod isn't a creature.\nWhenever you gain life, put a +1/+1 counter on target creature or enchantment you control.\n{1}{W}: Another target creature gains lifelink until end of turn.",
  "roles": [
   "combo",
   "payoff"
  ],
  "new": true,
  "cut": "Pest Infestation",
  "eur": 18.7,
  "why": "An indestructible God that puts a +1/+1 counter on a creature (or enchantment) whenever you gain life, and gives any other creature lifelink for {1}{W}. It combos with Walking Ballista (infinite damage) and Spike Feeder (infinite life), and it's a great engine even without them.",
  "how": "Heliod only becomes a 5/5 creature with 5 white devotion, but it works just as well as an enchantment. Cast it once you can protect it or when you can combo the same turn, since savvy players know it. Finale of Devastation for X=3 fetches it.",
  "syn": [
   "Walking Ballista",
   "Spike Feeder",
   "Trostani, Selesnya's Voice",
   "Soul Warden",
   "Shalai, Voice of Plenty"
  ],
  "warn": "Indestructible stops destroy effects, but exile and bounce still answer it."
 },
 {
  "name": "Hero of Bladehold",
  "qty": 1,
  "cost": "{2}{W}{W}",
  "mv": 4,
  "type": "Creature — Human Knight",
  "cat": "Creature",
  "pt": "3/4",
  "text": "Battle cry (Whenever this creature attacks, each other attacking creature gets +1/+0 until end of turn.)\nWhenever Hero of Bladehold attacks, create two 1/1 white Soldier creature tokens that are tapped and attacking.",
  "roles": [
   "tokens",
   "finisher"
  ],
  "new": true,
  "cut": "Growing Ranks",
  "eur": 5,
  "why": "Every attack makes two 1/1 Soldiers that are already attacking, and battle cry gives every other attacker +1/+0. It's a four-drop that has to be answered or it takes over.",
  "how": "When she attacks, you get two triggers. Put battle cry on the stack first and the token trigger on top, so the Soldiers are created first and then get pumped by battle cry.",
  "syn": [
   "Intangible Virtue",
   "Cathars' Crusade",
   "Beastmaster Ascension",
   "Bramble Sovereign",
   "Skullclamp"
  ]
 },
 {
  "name": "Hour of Reckoning",
  "qty": 1,
  "cost": "{4}{W}{W}{W}",
  "mv": 7,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nDestroy all nontoken creatures.",
  "roles": [
   "removal"
  ],
  "why": "Destroys all nontoken creatures. Your board is mostly tokens, so this is often a one-sided wipe. Convoke lets your tokens pay for it.",
  "how": "Cast it when opponents' boards are real creatures and yours is tokens. It also kills your nontoken creatures, including Trostani, so weigh what you lose. Heliod is indestructible and survives.",
  "syn": [
   "Grand Crescendo",
   "Halo Fountain",
   "Elspeth, Sun's Champion"
  ],
  "warn": "Convoking taps your tokens, so cast it after combat or on a turn you won't attack."
 },
 {
  "name": "Intangible Virtue",
  "qty": 1,
  "cost": "{1}{W}",
  "mv": 2,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Creature tokens you control get +1/+1 and have vigilance.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Boon Reflection",
  "eur": 0.2,
  "why": "Two mana: all your creature tokens get +1/+1 and vigilance. Tokens are most of your board, so it's a cheap permanent anthem that also lets you attack and still block.",
  "how": "Play it on a slow turn with spare mana. The vigilance matters in multiplayer: attack with tokens, stay protected.",
  "syn": [
   "Elspeth, Sun's Champion",
   "Hero of Bladehold",
   "Adeline, Resplendent Cathar",
   "Grand Crescendo"
  ],
  "warn": "Tokens become 2/2, so Skullclamp stops killing them, and vigilant tokens don't tap for Halo Fountain."
 },
 {
  "name": "Jazal Goldmane",
  "qty": 1,
  "cost": "{2}{W}{W}",
  "mv": 4,
  "type": "Legendary Creature — Cat Warrior",
  "cat": "Creature",
  "pt": "4/4",
  "text": "First strike\n{3}{W}{W}: Attacking creatures you control get +X/+X until end of turn, where X is the number of attacking creatures.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Mirari's Wake",
  "eur": 0.45,
  "why": "For {3}{W}{W}, every attacking creature gets +X/+X, where X is the number of attackers. You can activate it as many times as you have mana, at instant speed, after blockers are declared.",
  "how": "Attack wide, wait for blocks, then pump. With ten attackers, one activation is +10/+10 each. Vorinclex doubling your land mana makes this a two- or three-activation kill.",
  "syn": [
   "Vorinclex, Voice of Hunger",
   "Adeline, Resplendent Cathar",
   "Hero of Bladehold",
   "Grand Crescendo"
  ]
 },
 {
  "name": "Krosan Verge",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Krosan Verge enters tapped.\n{T}: Add {C}.\n{2}, {T}, Sacrifice Krosan Verge: Search your library for a Forest card and a Plains card, put them onto the battlefield tapped, then shuffle.",
  "roles": [
   "land",
   "ramp"
  ],
  "why": "Pay 2 and sacrifice it to fetch a Forest card and a Plains card. It's ramp in land form.",
  "how": "Crack it early. It can fetch Canopy Vista and Scattered Groves.",
  "syn": [
   "Canopy Vista"
  ]
 },
 {
  "name": "Lathiel, the Bounteous Dawn",
  "qty": 1,
  "cost": "{2}{G}{W}",
  "mv": 4,
  "type": "Legendary Creature — Unicorn",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Lifelink\nAt the beginning of each end step, if you gained life this turn, distribute up to that many +1/+1 counters among any number of other target creatures.",
  "roles": [
   "payoff"
  ],
  "why": "At each end step (yours and your opponents'), if you gained life that turn, spread that many +1/+1 counters among your other creatures. In this deck that is often five to ten counters a turn cycle.",
  "how": "Put counters on evasive creatures (flyers) or on Spike Feeder to reload it. With an infinite-life combo, Lathiel turns it into infinitely large creatures at end of turn.",
  "syn": [
   "Spike Feeder",
   "Trostani, Selesnya's Voice",
   "Soul Warden",
   "Walking Ballista"
  ]
 },
 {
  "name": "Lazotep Quarry",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Desert",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}, Sacrifice a creature: Add one mana of any color.\n{X}{2}, {T}, Sacrifice a Desert: Exile target creature card with mana value X from your graveyard. Create a token that's a copy of it, except it's a 4/4 black Zombie. Activate only as a sorcery.",
  "roles": [
   "land",
   "utility"
  ],
  "why": "Sacrifice a creature for any color of mana, and later exile a creature card from your graveyard to make a 4/4 Zombie copy of it.",
  "how": "Sacrifice creatures that die well: Voice of Resurgence, Elenda's Hierophant, a spent Spike Feeder. Bring back Archangel of Thune or Craterhoof as a Zombie copy.",
  "syn": [
   "Voice of Resurgence",
   "Elenda's Hierophant",
   "Craterhoof Behemoth"
  ]
 },
 {
  "name": "Llanowar Elves",
  "qty": 1,
  "cost": "{G}",
  "mv": 1,
  "type": "Creature — Elf Druid",
  "cat": "Creature",
  "pt": "1/1",
  "text": "{T}: Add {G}.",
  "roles": [
   "ramp"
  ],
  "why": "The original one-mana green accel.",
  "how": "Turn 1 play. Keep in mind mana dorks die to every board wipe, so don't rely only on them for a late-game kill turn.",
  "syn": [
   "Fanatic of Rhonas",
   "Springleaf Drum"
  ]
 },
 {
  "name": "Mirror Entity",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)\n{X}: Until end of turn, creatures you control have base power and toughness X/X and gain all creature types.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Angelic Chorus",
  "eur": 2,
  "why": "A mana sink that wins games: pay X and every creature you control has base power and toughness X/X until end of turn. Ten 1/1 tokens become ten 5/5s for five mana.",
  "how": "Activate after blockers are declared. Counters still apply on top of the new base, so a token with three counters becomes (X+3)/(X+3). Vorinclex or Fanatic of Rhonas make X huge.",
  "syn": [
   "Vorinclex, Voice of Hunger",
   "Fanatic of Rhonas",
   "Grand Crescendo",
   "Intangible Virtue"
  ],
  "warn": "It also gives your creatures every creature type, including Human, which turns off Return of the Wildspeaker's non-Human pump. Use Wildspeaker first, or pick one."
 },
 {
  "name": "Nature's Lore",
  "qty": 1,
  "cost": "{1}{G}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a Forest card, put that card onto the battlefield, then shuffle.",
  "roles": [
   "ramp"
  ],
  "why": "Two mana: put a Forest card from your library onto the battlefield. A basic Forest enters untapped. Canopy Vista and Scattered Groves are Forests too, but Groves always enters tapped and Vista does unless you control two or more basic lands.",
  "how": "Cast it on turn 2 and fetch a basic Forest: it enters untapped, so you have one more mana that turn for a one-drop like Llanowar Elves or Soul Warden.",
  "syn": [
   "Canopy Vista",
   "Farseek"
  ]
 },
 {
  "name": "Nykthos Paragon",
  "qty": 1,
  "cost": "{4}{W}{W}",
  "mv": 6,
  "type": "Enchantment Creature — Human Soldier",
  "cat": "Creature",
  "pt": "4/6",
  "text": "Whenever you gain life, you may put that many +1/+1 counters on each creature you control. Do this only once each turn.",
  "roles": [
   "payoff"
  ],
  "why": "Once each turn, when you gain life, you may put that many +1/+1 counters on each creature you control. One Trostani trigger off a 4-toughness creature is four counters on everything.",
  "how": "The trigger is optional, so skip the small ones. Decline Soul Warden's 1 life and wait for Trostani seeing an 8/8 Grove token or Camaraderie. It works once on each player's turn, so you can also use it at instant speed on an opponent's turn with Grand Crescendo.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Grove of the Guardian",
   "Camaraderie",
   "Grand Crescendo",
   "Shamanic Revelation"
  ]
 },
 {
  "name": "Overgrown Farmland",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Overgrown Farmland enters tapped unless you control two or more other lands.\n{T}: Add {G} or {W}.",
  "roles": [
   "land"
  ],
  "why": "Dual land that enters untapped once you control two other lands.",
  "how": "Best from turn 3 onward.",
  "syn": []
 },
 {
  "name": "Overwhelming Stampede",
  "qty": 1,
  "cost": "{3}{G}{G}",
  "mv": 5,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Until end of turn, creatures you control gain trample and get +X/+X, where X is the greatest power among creatures you control.",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Congregate",
  "eur": 2.7,
  "why": "Your creatures get trample and +X/+X, where X is the greatest power among them. With one big creature (Ghalta at 12, Soul of Eternity at your life total), everything becomes huge.",
  "how": "Cast it precombat on the kill turn. Count first: X is the biggest power before the pump, applied to every creature.",
  "syn": [
   "Ghalta and Mavren",
   "Soul of Eternity",
   "Adeline, Resplendent Cathar",
   "Archangel of Thune"
  ]
 },
 {
  "name": "Path to Exile",
  "qty": 1,
  "cost": "{W}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Exile target creature. Its controller may search their library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
  "roles": [
   "removal"
  ],
  "why": "One-mana instant exile for any creature. The opponent gets a basic land.",
  "how": "Save it for a real threat or a combo piece.",
  "syn": [
   "Swords to Plowshares"
  ]
 },
 {
  "name": "Prosperous Innkeeper",
  "qty": 1,
  "cost": "{1}{G}",
  "mv": 2,
  "type": "Creature — Halfling Citizen",
  "cat": "Creature",
  "pt": "1/1",
  "text": "When Prosperous Innkeeper enters, create a Treasure token. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")\nWhenever another creature you control enters, you gain 1 life.",
  "roles": [
   "ramp",
   "gain"
  ],
  "why": "A two-drop that makes a Treasure (so it ramps) and then gains 1 life for each other creature you have entering. Another Soul Warden that also accelerates you.",
  "how": "Turn 2 play. Save the Treasure for a turn when you need a specific color or a big X spell.",
  "syn": [
   "Archangel of Thune",
   "Ajani's Pridemate",
   "Voice of the Blessed",
   "Heliod, Sun-Crowned"
  ]
 },
 {
  "name": "Razorverge Thicket",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Razorverge Thicket enters tapped unless you control two or fewer other lands.\n{T}: Add {G} or {W}.",
  "roles": [
   "land"
  ],
  "new": true,
  "cut": "Temple of Plenty",
  "eur": 0.9,
  "why": "Dual land that enters untapped in your first three turns, when tempo matters most.",
  "how": "Play it on turns 1 to 3.",
  "syn": []
 },
 {
  "name": "Resplendent Angel",
  "qty": 1,
  "cost": "{1}{W}{W}",
  "mv": 3,
  "type": "Creature — Angel",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Flying\nAt the beginning of each end step, if you gained 5 or more life this turn, create a 4/4 white Angel creature token with flying and vigilance.\n{3}{W}{W}{W}: Until end of turn, Resplendent Angel gets +2/+2 and gains lifelink.",
  "roles": [
   "tokens",
   "payoff"
  ],
  "why": "A 3-mana flyer that makes a 4/4 flying vigilance Angel at every end step (yours and your opponents') in which you gained 5 or more life. That bar is easy for this deck.",
  "how": "Get to 5 life gained before the end step begins, on your turn and on opponents' turns too. The Angel checks at the start of the end step, so a Trostani populate during an opponent's combat or second main phase counts, but one during their end step is too late. Late game, {3}{W}{W}{W} makes it a 5/5 lifelinker.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Grand Crescendo",
   "Soul Warden"
  ]
 },
 {
  "name": "Restless Prairie",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Restless Prairie enters tapped.\n{T}: Add {G} or {W}.\n{2}{G}{W}: Restless Prairie becomes a 3/3 green and white Llama creature until end of turn. It's still a land.\nWhenever Restless Prairie attacks, other creatures you control get +1/+1 until end of turn.",
  "roles": [
   "land",
   "finisher"
  ],
  "why": "Dual land that becomes a 3/3 Llama for {2}{G}{W}; when it attacks, your other creatures get +1/+1.",
  "how": "Animate it on attack turns for a free anthem that survives sorcery-speed wipes.",
  "syn": []
 },
 {
  "name": "Return of the Wildspeaker",
  "qty": 1,
  "cost": "{4}{G}",
  "mv": 5,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Choose one —\n• Draw cards equal to the greatest power among non-Human creatures you control.\n• Non-Human creatures you control get +3/+3 until end of turn.",
  "roles": [
   "draw",
   "finisher"
  ],
  "new": true,
  "cut": "Angel of Indemnity",
  "eur": 2.1,
  "why": "Instant, two modes: draw cards equal to your biggest non-Human's power, or give your non-Human creatures +3/+3.",
  "how": "Early, it's a big draw spell (Ghalta alone is 12 cards). Late, +3/+3 on ten creatures is 30 extra damage.",
  "syn": [
   "Ghalta and Mavren",
   "Bramble Sovereign",
   "Voice of Resurgence",
   "Grand Crescendo"
  ],
  "warn": "Humans are excluded: Adeline and her tokens, Hero of Bladehold, Soul Warden, Speaker, Pilgrim and Nykthos Paragon. Mirror Entity makes everything Human."
 },
 {
  "name": "Rogue's Passage",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{4}, {T}: Target creature can't be blocked this turn.",
  "roles": [
   "land",
   "utility"
  ],
  "why": "{4}, tap: target creature can't be blocked.",
  "how": "Make Soul of Eternity, Ghalta or a big Voice token unblockable.",
  "syn": [
   "Soul of Eternity",
   "Ghalta and Mavren",
   "Conclave Evangelist"
  ]
 },
 {
  "name": "Rootborn Defenses",
  "qty": 1,
  "cost": "{2}{W}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Populate. Creatures you control gain indestructible until end of turn. (To populate, create a token that's a copy of a creature token you control.)",
  "roles": [
   "protect",
   "tokens"
  ],
  "why": "Instant: populate, then all your creatures gain indestructible. A cheap answer to destroy-based board wipes.",
  "how": "Keep {2}{W} open when you've committed a big board. Cast it in response to the wipe.",
  "syn": [
   "Grand Crescendo",
   "Voice of Resurgence",
   "Trostani, Selesnya's Voice"
  ]
 },
 {
  "name": "Scattered Groves",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Forest Plains",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {G} or {W}.)\nScattered Groves enters tapped.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  "roles": [
   "land"
  ],
  "new": true,
  "cut": "Sapseep Forest",
  "eur": 0.25,
  "why": "A dual land with both basic land types, so Farseek, Nature's Lore and Krosan Verge can all fetch it, and it turns on Sunpetal Grove and Canopy Vista. Late in the game, cycle it for a card.",
  "how": "Play it on a turn you don't need all your mana. Fetch it with Farseek or Nature's Lore when you need white. When you're flooded, cycle it for {2}.",
  "syn": [
   "Farseek",
   "Nature's Lore",
   "Krosan Verge",
   "Sunpetal Grove"
  ]
 },
 {
  "name": "Selesnya Sanctuary",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Selesnya Sanctuary enters tapped.\nWhen Selesnya Sanctuary enters, return a land you control to its owner's hand.\n{T}: Add {G}{W}.",
  "roles": [
   "land",
   "ramp"
  ],
  "why": "Taps for {G}{W}, but returns a land to your hand when it enters.",
  "how": "Return a gain land to replay it for another lifegain trigger.",
  "syn": [
   "Blossoming Sands",
   "Graypelt Refuge"
  ]
 },
 {
  "name": "Selesnya Signet",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{1}, {T}: Add {G}{W}.",
  "roles": [
   "ramp"
  ],
  "why": "Two-mana rock that filters one mana into {G}{W}, which fixes double-colored costs like Trostani's {G}{G}{W}{W}.",
  "how": "Turn 2 play.",
  "syn": [
   "Sol Ring",
   "Arcane Signet"
  ]
 },
 {
  "name": "Shalai, Voice of Plenty",
  "qty": 1,
  "cost": "{3}{W}",
  "mv": 4,
  "type": "Legendary Creature — Angel",
  "cat": "Creature",
  "pt": "3/4",
  "text": "Flying\nYou, planeswalkers you control, and other creatures you control have hexproof.\n{4}{G}{G}: Put a +1/+1 counter on each creature you control.",
  "roles": [
   "protect"
  ],
  "miku": "Miku, Voice Over All",
  "sld": "2433",
  "why": "You, your planeswalkers and your other creatures have hexproof. That shuts off targeted removal on Archangel of Thune, Heliod and your combo pieces, and it stops opponents targeting you with burn or discard. Late game, {4}{G}{G} puts a counter on every creature.",
  "how": "Play Shalai the turn before your key threats. She doesn't protect herself, so opponents will try to kill her first. That's fine: every removal spell spent on her isn't spent on Archangel of Thune.",
  "syn": [
   "Archangel of Thune",
   "Heliod, Sun-Crowned",
   "Walking Ballista",
   "Spike Feeder",
   "Elspeth, Sun's Champion"
  ],
  "warn": "Board wipes and \"each opponent sacrifices\" effects don't target, so she doesn't stop them."
 },
 {
  "name": "Shamanic Revelation",
  "qty": 1,
  "cost": "{3}{G}{G}",
  "mv": 5,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Draw a card for each creature you control.\nFerocious — You gain 4 life for each creature you control with power 4 or greater.",
  "roles": [
   "draw",
   "gain"
  ],
  "why": "Draw a card for each creature you control, and gain 4 life for each creature with 4 or more power.",
  "how": "Cast it when you have 5+ creatures. With counters on the team, the ferocious lifegain is huge (and Nykthos Paragon loves one big gain).",
  "syn": [
   "Nykthos Paragon",
   "Archangel of Thune",
   "Cathars' Crusade"
  ]
 },
 {
  "name": "Skullclamp",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "Equipped creature gets +1/-1.\nWhenever equipped creature dies, draw two cards.\nEquip {1}",
  "roles": [
   "draw"
  ],
  "why": "Equip a 1/1 token and it dies, drawing you two cards. For one mana each time. This is the deck's best card draw.",
  "how": "Clamp 1/1 Citizens, Soldiers, Humans and Vampires. You can equip several times per turn. Also clamp a Spike Feeder with one counter left, or a chump blocker.",
  "syn": [
   "Elspeth, Sun's Champion",
   "Hero of Bladehold",
   "Adeline, Resplendent Cathar",
   "Grand Crescendo",
   "Halo Fountain"
  ],
  "warn": "Intangible Virtue makes tokens 2/2, and a clamped 2/2 becomes 3/1 and survives. With Virtue out, clamp non-token 1/1s or skip it."
 },
 {
  "name": "Sol Ring",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}{C}.",
  "roles": [
   "ramp"
  ],
  "why": "Two colorless mana for one. The best turn-one play in Commander.",
  "how": "Turn 1, always.",
  "syn": [
   "Arcane Signet",
   "Walking Ballista"
  ]
 },
 {
  "name": "Song of the Worldsoul",
  "qty": 1,
  "cost": "{4}{W}{W}",
  "mv": 6,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever you cast a spell, populate. (Create a token that's a copy of a creature token you control.)",
  "roles": [
   "tokens"
  ],
  "sld": "2434",
  "why": "Every spell you cast populates. Each spell becomes a token plus the spell.",
  "how": "Best with a big token to copy (Voice of Resurgence's Elemental, Grove's 8/8, Angels). Chain cheap spells after it. Each populate is also a Trostani trigger.",
  "syn": [
   "Voice of Resurgence",
   "Grove of the Guardian",
   "Trostani, Selesnya's Voice",
   "Cathars' Crusade"
  ],
  "warn": "Six mana for no immediate effect. Play it when you can follow up the same turn or the next."
 },
 {
  "name": "Soul Warden",
  "qty": 1,
  "cost": "{W}",
  "mv": 1,
  "type": "Creature — Human Cleric",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Whenever another creature enters, you gain 1 life.",
  "roles": [
   "gain"
  ],
  "sld": "2435",
  "why": "One mana: gain 1 life whenever another creature enters (anyone's creature, not just yours). Each of those is a separate lifegain event, which is what Archangel of Thune, Heliod and Ajani's Pridemate count.",
  "how": "Turn 1 if you have no mana creature. It's more valuable than its size suggests: with Archangel of Thune, it turns every creature any player casts into a counter on your whole team.",
  "syn": [
   "Archangel of Thune",
   "Ajani's Pridemate",
   "Heliod, Sun-Crowned",
   "Voice of the Blessed"
  ]
 },
 {
  "name": "Soul of Eternity",
  "qty": 1,
  "cost": "{5}{W}{W}",
  "mv": 7,
  "type": "Creature — Avatar",
  "cat": "Creature",
  "pt": "*/*",
  "text": "Soul of Eternity's power and toughness are each equal to your life total.\nEncore {7}{W}{W} ({7}{W}{W}, Exile this card from your graveyard: For each opponent, create a token copy that attacks that opponent this turn if able. They gain haste. Sacrifice them at the beginning of the next end step. Activate only as a sorcery.)",
  "roles": [
   "finisher"
  ],
  "why": "Its power and toughness equal your life total. In a lifegain deck that's usually 50 to 80. Encore from the graveyard makes a hasty copy attacking each opponent.",
  "how": "Give it evasion with Rogue's Passage. With an infinite-life combo it's an arbitrarily large creature. If it dies, encore it ({7}{W}{W}) for one massive swing at each opponent.",
  "syn": [
   "Rogue's Passage",
   "Spike Feeder",
   "Overwhelming Stampede",
   "Heliod, Sun-Crowned"
  ]
 },
 {
  "name": "Speaker of the Heavens",
  "qty": 1,
  "cost": "{W}",
  "mv": 1,
  "type": "Creature — Human Cleric",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Vigilance, lifelink\n{T}: Create a 4/4 white Angel creature token with flying. Activate only if you have at least 7 life more than your starting life total and only as a sorcery.",
  "roles": [
   "tokens"
  ],
  "why": "Once you are at 47 life or more (7 above the Commander starting 40), tap it to make a 4/4 flying Angel each turn.",
  "how": "Easy to turn on in this deck by the midgame. The Angels are good populate targets. The tap ability is sorcery-speed only.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Spike Feeder"
  ]
 },
 {
  "name": "Spike Feeder",
  "qty": 1,
  "cost": "{1}{G}{G}",
  "mv": 3,
  "type": "Creature — Spike",
  "cat": "Creature",
  "pt": "0/0",
  "text": "Spike Feeder enters with two +1/+1 counters on it.\n{2}, Remove a +1/+1 counter from Spike Feeder: Put a +1/+1 counter on target creature.\nRemove a +1/+1 counter from Spike Feeder: You gain 2 life.",
  "roles": [
   "combo",
   "gain"
  ],
  "new": true,
  "cut": "Suture Priest",
  "eur": 1,
  "why": "Remove a counter to gain 2 life. On its own, that's 4 life and a chump blocker. With Heliod, Archangel of Thune or Cleric Class at level 2, each 2 life puts a counter back on it, so you gain infinite life (and with Thune, every creature grows infinitely).",
  "how": "It enters with two counters. Keep at least two on it while looping: remove the last one and it dies as a 0/0 before the life comes back. Hold it until you can combo, or play it as bait: people rarely kill a 2/2. Finale of Devastation for X=3 fetches it.",
  "syn": [
   "Heliod, Sun-Crowned",
   "Archangel of Thune",
   "Cleric Class",
   "Aetherflux Reservoir",
   "Lathiel, the Bounteous Dawn"
  ],
  "warn": "Infinite life alone doesn't win. Pair it with Aetherflux Reservoir or with Archangel of Thune's infinite counters and an attack."
 },
 {
  "name": "Springleaf Drum",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}, Tap an untapped creature you control: Add one mana of any color.",
  "roles": [
   "ramp"
  ],
  "why": "Tap an untapped creature you control to add one mana of any color. The creature doesn't need to have been there since the start of the turn, so summoning-sick tokens and creatures can pay.",
  "how": "Cast a creature, then tap it to the Drum for more mana the same turn. It also taps creatures for Halo Fountain to untap.",
  "syn": [
   "Halo Fountain",
   "Adeline, Resplendent Cathar",
   "Grand Crescendo"
  ]
 },
 {
  "name": "Sundering Growth",
  "qty": 1,
  "cost": "{G/W}{G/W}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target artifact or enchantment, then populate. (Create a token that's a copy of a creature token you control.)",
  "roles": [
   "removal",
   "tokens"
  ],
  "why": "Instant artifact or enchantment removal that also populates.",
  "how": "Kill the best artifact or enchantment and copy your best token in one card.",
  "syn": [
   "Voice of Resurgence",
   "Break Down"
  ]
 },
 {
  "name": "Sungrass Prairie",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{1}, {T}: Add {G}{W}.",
  "roles": [
   "land"
  ],
  "why": "Filter land: {1}, tap for {G}{W}.",
  "how": "Helps cast Trostani's {G}{G}{W}{W}.",
  "syn": []
 },
 {
  "name": "Sunpetal Grove",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "Sunpetal Grove enters tapped unless you control a Forest or a Plains.\n{T}: Add {G} or {W}.",
  "roles": [
   "land"
  ],
  "why": "Dual land that enters untapped with a Forest or Plains.",
  "how": "Almost always untapped.",
  "syn": []
 },
 {
  "name": "Swords to Plowshares",
  "qty": 1,
  "cost": "{W}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Exile target creature. Its controller gains life equal to its power.",
  "roles": [
   "removal"
  ],
  "why": "One-mana instant exile for any creature. The opponent gains life equal to its power.",
  "how": "The best removal in white. Save it for something that matters.",
  "syn": [
   "Path to Exile"
  ]
 },
 {
  "name": "Triumph of the Hordes",
  "qty": 1,
  "cost": "{2}{G}{G}",
  "mv": 4,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Until end of turn, creatures you control get +1/+1 and gain trample and infect. (Creatures with infect deal damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)",
  "roles": [
   "finisher"
  ],
  "new": true,
  "cut": "Crested Sunmare",
  "eur": 11.9,
  "why": "Your creatures get +1/+1, trample and infect until end of turn. Ten poison counters kills a player, so ten creatures that each deal 1 is a dead opponent, whatever their life total.",
  "how": "Use it against a high-life opponent or when damage alone isn't lethal. Poison is per player, so focus one or two opponents.",
  "syn": [
   "Grand Crescendo",
   "Adeline, Resplendent Cathar",
   "Hero of Bladehold",
   "Intangible Virtue"
  ],
  "warn": "Infect deals damage to creatures as -1/-1 counters, so blocks are still bad for them."
 },
 {
  "name": "Voice of Resurgence",
  "qty": 1,
  "cost": "{G}{W}",
  "mv": 2,
  "type": "Creature — Elemental",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Whenever an opponent casts a spell during your turn or when Voice of Resurgence dies, create a green and white Elemental creature token with \"This token's power and toughness are each equal to the number of creatures you control.\"",
  "roles": [
   "tokens"
  ],
  "why": "Opponents who cast spells during your turn give you a token, and when Voice dies you get one too. The token's power and toughness equal the number of creatures you control, so it's usually huge.",
  "how": "This token is the best thing to populate with Trostani, Rootborn Defenses or Sundering Growth: every copy is also the size of your board. It also deters opponents from casting instant removal on your turn.",
  "syn": [
   "Trostani, Selesnya's Voice",
   "Rootborn Defenses",
   "Sundering Growth",
   "Song of the Worldsoul",
   "Esika's Chariot"
  ]
 },
 {
  "name": "Voice of the Blessed",
  "qty": 1,
  "cost": "{W}{W}",
  "mv": 2,
  "type": "Creature — Spirit Cleric",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Whenever you gain life, put a +1/+1 counter on Voice of the Blessed.\nAs long as Voice of the Blessed has four or more +1/+1 counters on it, it has flying and vigilance.\nAs long as Voice of the Blessed has ten or more +1/+1 counters on it, it has indestructible.",
  "roles": [
   "payoff"
  ],
  "why": "Grows with every lifegain event. At four counters it flies and has vigilance, at ten it's indestructible.",
  "how": "A two-drop that's a real threat by turn 5 with Soul Warden or Trostani. An indestructible flyer is a great Beastmaster Ascension or Jazal attacker.",
  "syn": [
   "Soul Warden",
   "Prosperous Innkeeper",
   "Heliod, Sun-Crowned",
   "Cleric Class"
  ]
 },
 {
  "name": "Vorinclex, Voice of Hunger",
  "qty": 1,
  "cost": "{6}{G}{G}",
  "mv": 8,
  "type": "Legendary Creature — Phyrexian Praetor",
  "cat": "Creature",
  "pt": "7/6",
  "text": "Trample\nWhenever you tap a land for mana, add one mana of any type that land produced.\nWhenever an opponent taps a land for mana, that land doesn't untap during its controller's next untap step.",
  "roles": [
   "ramp"
  ],
  "miku": "Miku, the Complete Performer",
  "sld": "2439",
  "why": "An 8-mana 7/6 trampler that doubles the mana from your lands and makes opponents' lands stay tapped if they tap them for mana. Once it resolves, your X spells get enormous and opponents lose a turn of mana.",
  "how": "A late-game card: use the doubled mana for Finale of Devastation X=10, a huge Walking Ballista, several Jazal activations or Mirror Entity.",
  "syn": [
   "Finale of Devastation",
   "Walking Ballista",
   "Mirror Entity",
   "Jazal Goldmane",
   "Grand Crescendo"
  ],
  "warn": "At 8 mana this is the most cuttable card in the deck. If you want it faster, cut it for another cheap draw spell."
 },
 {
  "name": "Walking Ballista",
  "qty": 1,
  "cost": "{X}{X}",
  "mv": 0,
  "type": "Artifact Creature — Construct",
  "cat": "Creature",
  "pt": "0/0",
  "text": "Walking Ballista enters with X +1/+1 counters on it.\n{4}: Put a +1/+1 counter on Walking Ballista.\nRemove a +1/+1 counter from Walking Ballista: It deals 1 damage to any target.",
  "roles": [
   "combo",
   "removal"
  ],
  "new": true,
  "cut": "Phyrexian Processor",
  "eur": 5.7,
  "why": "Flexible early (kill mana creatures and X/1s), a mana sink late ({4}: add a counter), and half of an infinite-damage combo with Heliod.",
  "how": "With Heliod out, give Ballista lifelink for {1}{W}. Every ping then gains 1 life, Heliod puts a counter back, and you ping again, forever. Without Heliod, cast it for X=1 or 2 early to clear dorks, or late for as much as you can afford.",
  "syn": [
   "Heliod, Sun-Crowned",
   "Cathars' Crusade",
   "Archangel of Thune",
   "Vorinclex, Voice of Hunger"
  ],
  "warn": "Don't fetch it with Finale of Devastation: it enters with 0 counters and dies immediately."
 },
 {
  "name": "Plains",
  "qty": 9,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Plains",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {W}.)",
  "roles": [
   "land"
  ],
  "why": "Seven Miku-art basic Plains plus two regular ones. The extra two replaced Seraph Sanctuary and a Forest: the deck asks for more white than green (47 white pips, 15 cards with {W}{W}), so it needs more white sources.",
  "how": "",
  "syn": [],
  "cut": "Seraph Sanctuary"
 },
 {
  "name": "Forest",
  "qty": 6,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Forest",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {G}.)",
  "roles": [
   "land"
  ],
  "why": "Six Miku-art basic Forests. The seventh became a Plains for more white sources.",
  "how": "",
  "syn": []
 }
];
