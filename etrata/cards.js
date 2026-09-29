/* Generated card data for the Etrata deck wiki. Rules text from the Forge card database. */
window.ETRATA_CARDS = [
 {
  "name": "Etrata, Deadly Fugitive",
  "qty": 1,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "1/4",
  "text": "Deathtouch\nFace-down creatures you control have \"{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.\"\nWhenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library.",
  "roles": [
   "cmd",
   "assassin",
   "cloak"
  ],
  "why": "The engine of the deck. Every time an Assassin you control deals combat damage to an opponent, you cloak the top card of that player's library: a face-down 2/2 with ward {2} joins your side. She also gives every face-down creature you control a way to flip up for {2}{U}{B}, even cards that could never turn face up on their own. If the card is an instant or sorcery, you exile it and may cast it for free.",
  "how": "Cast her on turn 3, ideally with an evasive Assassin already on the battlefield so the first cloak comes the same turn. She doesn't need to attack: she's a 1/4 with deathtouch, so she's a strong blocker and your other Assassins do the hitting. Once you have Roshan, Maskwood Nexus, Arcane Adaptation or Leyline of Transformation, your cloaks are Assassins too, and every connecting cloak makes another one.",
  "syn": [
   "Roshan, Hidden Magister",
   "Maskwood Nexus",
   "Leyline of Transformation",
   "Training Grounds",
   "Spark Double",
   "Changeling Outcast"
  ],
  "warn": "Cloaks are face-down 2/2s with no creature types. Without a type enabler they don't trigger her."
 },
 {
  "name": "Access Tunnel",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{3}, {T}: Target creature with power 3 or less can't be blocked this turn.",
  "roles": [
   "land",
   "evasion"
  ],
  "why": "A colorless land that makes a creature with power 3 or less unblockable for {3}. Almost every creature in the deck has power 3 or less, including face-down 2/2s.",
  "how": "Late in the game, when blockers pile up, use it on your best Assassin each turn. Omen Hawker's mana can help pay the activation.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Unstoppable Slasher",
   "Omen Hawker",
   "Ramses, Assassin Lord"
  ],
  "warn": "It makes only colorless mana. Don't count it as a source for Etrata's {U} or {B}."
 },
 {
  "name": "An Offer You Can't Refuse",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target noncreature spell. Its controller creates two Treasure tokens. (They're artifacts with \"{T}, Sacrifice this token: Add one mana of any color.\")",
  "roles": [
   "counter"
  ],
  "why": "One mana to counter a noncreature spell: a board wipe, a tutor, a combo piece. The opponent gets two Treasures, which is a real cost in the early turns and a small one later.",
  "how": "Hold it for spells that would end your game or undo your board. You can also target your own noncreature spell to get two Treasures.",
  "syn": [
   "Counterspell",
   "Dispel",
   "Wash Away",
   "Arcane Denial"
  ],
  "warn": "Giving an opponent two Treasures early can speed them up a lot. Early, only use it on something that matters."
 },
 {
  "name": "Aqueous Form",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment — Aura",
  "cat": "Enchantment",
  "pt": "",
  "text": "Enchant creature\nEnchanted creature can't be blocked.\nWhenever enchanted creature attacks, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  "roles": [
   "evasion"
  ],
  "why": "One mana makes a creature unblockable, and each attack scries 1. On an Assassin it's a guaranteed Etrata trigger every turn.",
  "how": "Put it on your most reliable Assassin, ideally one that's hard to kill. On Unstoppable Slasher it turns every attack into half an opponent's life.",
  "syn": [
   "Unstoppable Slasher",
   "Desmond Miles",
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ],
  "warn": "If the creature dies or is bounced, the Aura goes to your graveyard. Avoid putting it on a cloak you took from an opponent if you can."
 },
 {
  "name": "Arcane Adaptation",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "As this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
  "roles": [
   "enabler"
  ],
  "why": "Name Assassin and every creature you control is an Assassin, including face-down cloaks. That turns Etrata from one trigger per turn into an army that grows every combat.",
  "how": "Cast it before combat and choose Assassin as it enters. It also makes creature cards in your graveyard Assassins, which grows Desmond Miles.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Leyline of Transformation",
   "Desmond Miles",
   "Ramses, Assassin Lord",
   "Path of Ancestry"
  ],
  "warn": "If it's cloaked and you turn it face up with Etrata's ability, it never made its 'as this enters' choice, so it names no creature type and does nothing."
 },
 {
  "name": "Arcane Denial",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target spell. Its controller may draw up to two cards at the beginning of the next turn's upkeep.\nYou draw a card at the beginning of the next turn's upkeep.",
  "roles": [
   "counter"
  ],
  "why": "Two mana to counter any spell. The caster may draw two cards next upkeep and you draw one.",
  "how": "Use it on game-changing spells when you can afford to give a card advantage away. In the late game the extra cards matter less than stopping the spell.",
  "syn": [
   "Counterspell",
   "Wash Away",
   "An Offer You Can't Refuse"
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
  "why": "Two-mana rock that makes {U} or {B}. It fixes and ramps into Etrata on turn 3 or a four-drop.",
  "how": "Turn 2 play. Next turn you have four mana: Etrata plus a one-drop, or Ramses.",
  "syn": [
   "Sol Ring",
   "Dimir Signet",
   "Talisman of Dominance",
   "Command Tower"
  ]
 },
 {
  "name": "Aven Heartstabber",
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Creature — Bird Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Flying\nAs long as there are five or more mana values among cards in your graveyard, this creature gets +2/+2 and has deathtouch.\nWhen this creature dies, mill two cards, then draw a card.",
  "roles": [
   "assassin",
   "evasion",
   "draw"
  ],
  "why": "A two-mana flying Assassin: an early, evasive way to trigger Etrata. Later it's a 3/3 deathtouch flier, and when it dies it mills two and draws you a card.",
  "how": "Cast it on turn 2 so it can attack the turn Etrata comes down. Your graveyard fills naturally with lands, cheap spells and two-drops, so five different mana values comes sooner than you think.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Consider",
   "Frantic Search",
   "Cursed Windbreaker",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Basim Ibn Ishaq",
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Whenever you cast a historic spell, draw a card. Basim Ibn Ishaq can't be blocked this turn. This ability triggers only once each turn. (Artifacts, legendaries, and Sagas are historic.)\nWhenever Basim Ibn Ishaq deals combat damage to a player, put a +1/+1 counter on it.",
  "roles": [
   "assassin",
   "draw",
   "evasion"
  ],
  "why": "A two-mana legendary Assassin. The first historic spell you cast each turn draws a card and makes him unblockable. The deck has plenty of artifacts and legends, so he often connects, grows and triggers Etrata.",
  "how": "Cast him turn 2. On later turns, cast an artifact or a legendary creature before combat: you draw, he can't be blocked, and he hits for an Etrata trigger. He also turns on Brotherhood Spy as a legendary Assassin.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Brotherhood Spy",
   "Mind Stone",
   "Universal Automaton",
   "Cryptic Coat"
  ]
 },
 {
  "name": "Boggart Trawler // Boggart Bog",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Goblin // Land",
  "cat": "Creature",
  "pt": "3/1",
  "text": "",
  "faces": [
   {
    "name": "Boggart Trawler",
    "cost": "{2}{B}",
    "type": "Creature — Goblin",
    "pt": "3/1",
    "text": "When this creature enters, exile target player's graveyard."
   },
   {
    "name": "Boggart Bog",
    "cost": "",
    "type": "Land",
    "pt": "",
    "text": "As this land enters, you may pay 3 life. If you don't, it enters tapped.\n{T}: Add {B}."
   }
  ],
  "roles": [
   "utility",
   "land"
  ],
  "why": "A modal double-faced card: a land when you need a land, graveyard hate when you need that. It's a spell slot that doesn't cost you a land drop.",
  "how": "In the early turns, play it as Boggart Bog. Pay 3 life only if you need the mana this turn. Later, cast Boggart Trawler to exile a graveyard that fuels an opponent's recursion or combo.",
  "syn": [
   "Bojuka Bog",
   "Chthonian Nightmare",
   "Supernatural Stamina"
  ],
  "warn": "If it's cloaked and turned face up, it shows the Trawler face and no enters trigger happens."
 },
 {
  "name": "Bojuka Bog",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "This land enters tapped.\nWhen this land enters, exile target player's graveyard.\n{T}: Add {B}.",
  "roles": [
   "land",
   "utility"
  ],
  "why": "Enters tapped and exiles a graveyard. It answers graveyard combos and recursion.",
  "how": "Hold it until a graveyard matters, or play it as a tapped black source when you need the mana.",
  "syn": [
   "Boggart Trawler // Boggart Bog",
   "Chthonian Nightmare"
  ]
 },
 {
  "name": "Brotherhood Spy",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/3",
  "text": "At the beginning of combat on your turn, if you control a legendary Assassin, this creature gets +1/+0 until end of turn and can't be blocked this turn.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A two-mana Assassin that gets +1/+0 and can't be blocked at the start of each of your combats, as long as you control a legendary Assassin. Etrata is one, so from turn 3 it connects every turn.",
  "how": "Cast it on turn 2, then Etrata on turn 3. It triggers at the beginning of combat, so the legendary Assassin has to be on the battlefield by then.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Desmond Miles",
   "Basim Ibn Ishaq",
   "Ramses, Assassin Lord",
   "Roshan, Hidden Magister"
  ]
 },
 {
  "name": "Changeling Outcast",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)\nThis creature can't block and can't be blocked.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A one-mana creature that is every creature type, so it's an Assassin, and it can't be blocked. It's the most reliable Etrata trigger in the deck.",
  "how": "Play it turn 1 or 2. It attacks for an Etrata cloak every turn. It also starts damage-based loops: one point is enough to set off Guildmage and Mindcrank or add a Stadium counter.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Strixhaven Stadium",
   "Duskmantle Guildmage",
   "Mindcrank",
   "Ramses, Assassin Lord"
  ],
  "warn": "It can't block. Don't count it as defense."
 },
 {
  "name": "Choked Estuary",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "As this land enters, you may reveal an Island or Swamp card from your hand. If you don't, this land enters tapped.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Dual land that enters untapped if you reveal an Island or a Swamp card from your hand.",
  "how": "Reveal a basic Island or Swamp to have it enter untapped.",
  "syn": [
   "Sunken Hollow",
   "Drowned Catacomb"
  ]
 },
 {
  "name": "Chthonian Nightmare",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "When this enchantment enters, you get {E}{E}{E} (three energy counters).\nPay X {E}, Sacrifice a creature, Return this enchantment to its owner's hand: Return target creature card with mana value X from your graveyard to the battlefield. Activate only as a sorcery.",
  "roles": [
   "protect",
   "utility"
  ],
  "why": "Recursion that you can repeat. It enters with three energy. Pay X energy, sacrifice a creature and return the Nightmare to your hand to put a creature card with mana value X from your graveyard onto the battlefield.",
  "how": "Sacrifice a face-down 2/2 or a creature that's about to die anyway, and bring back a key cheap Assassin like Changeling Outcast or Unstoppable Slasher. Recast the Nightmare for three more energy.",
  "syn": [
   "Unstoppable Slasher",
   "Changeling Outcast",
   "Etrata, Deadly Fugitive",
   "Duskmantle Guildmage"
  ],
  "warn": "A fresh cast gives only three energy, not enough for a four-drop like Ramses unless you saved energy from an earlier cast."
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
  "why": "Taps for {U} or {B}. The best untapped dual land in Commander.",
  "how": "Always untapped. Play it whenever you need either color.",
  "syn": [
   "Arcane Signet",
   "Path of Ancestry",
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Consider",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)\nDraw a card.",
  "roles": [
   "draw"
  ],
  "why": "One mana at instant speed: look at the top card, keep it or bin it, then draw.",
  "how": "Cast it at the end of an opponent's turn when you have spare blue. It smooths early draws toward lands or Assassins.",
  "syn": [
   "Preordain",
   "Aven Heartstabber",
   "Frantic Search"
  ]
 },
 {
  "name": "Counterspell",
  "qty": 1,
  "cost": "{U}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target spell.",
  "roles": [
   "counter"
  ],
  "why": "Two mana, counter any spell. The cleanest answer to a wipe, a combo piece or removal on Etrata.",
  "how": "Keep {U}{U} up on turns where you can afford to pass with mana open. Don't spend it on an average creature.",
  "syn": [
   "Arcane Denial",
   "Wash Away",
   "An Offer You Can't Refuse",
   "Dispel"
  ]
 },
 {
  "name": "Cover of Darkness",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "As this enchantment enters, choose a creature type.\nCreatures of the chosen type have fear. (They can't be blocked except by artifact creatures and/or black creatures.)",
  "roles": [
   "evasion"
  ],
  "why": "Name Assassin and all Assassins have fear: only artifact or black creatures can block them. With a type enabler, that includes your whole army of cloaks.",
  "how": "Cast it before a big attack, ideally when the table has few black or artifact creatures. It's weaker against a black-heavy opponent, so check their board.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Unstoppable Slasher",
   "Roshan, Hidden Magister",
   "Maskwood Nexus",
   "Leyline of Transformation"
  ],
  "warn": "It gives fear to every Assassin, including opponents'. If it's cloaked and turned face up, it never chose a type and does nothing."
 },
 {
  "name": "Cryptic Coat",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "When this Equipment enters, cloak the top card of your library, then attach this Equipment to it. (To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. Turn it face up any time for its mana cost if it's a creature card.)\nEquipped creature gets +1/+0 and can't be blocked.\n{1}{U}: Return this Equipment to its owner's hand.",
  "roles": [
   "cloak",
   "evasion"
  ],
  "why": "Cloaks the top card of your library and equips it: a 3/2 that can't be blocked, with ward {2}. For {1}{U}, the Coat returns to your hand, and you can cast it again for another cloak.",
  "how": "Cast it every turn you have spare mana: each cast is a new body. With a type enabler, the unblockable cloak triggers Etrata every turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "They Came from the Pipes",
   "Roshan, Hidden Magister",
   "Basim Ibn Ishaq",
   "Glitch Interpreter"
  ]
 },
 {
  "name": "Cursed Windbreaker",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "When this Equipment enters, manifest dread, then attach this Equipment to that creature. (Look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nEquipped creature has flying.\nEquip {3}",
  "roles": [
   "cloak",
   "evasion"
  ],
  "why": "Manifests dread and gives that creature flying. You pick the better of the top two cards of your library to hide, and the other goes to your graveyard.",
  "how": "Put a creature you'd like to turn face up later into the face-down slot, or a noncreature card you can flip with Etrata. Later, move the Windbreaker to an Assassin for {3}.",
  "syn": [
   "They Came from the Pipes",
   "Etrata, Deadly Fugitive",
   "Aven Heartstabber",
   "Glitch Interpreter"
  ]
 },
 {
  "name": "Dark Ritual",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Add {B}{B}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "One black mana becomes {B}{B}{B}. It's a burst that can land Etrata a turn early or cast a big threat in one go.",
  "how": "Use it for an early Etrata with an Island out: Swamp into Ritual gives {B}{B}{B}, and the Island adds {U}. Later, use it to fund a kill turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Roshan, Hidden Magister",
   "Wound Reflection",
   "Gix, Yawgmoth Praetor"
  ],
  "warn": "It's card disadvantage. Only use it when it unlocks an important play."
 },
 {
  "name": "Darkslick Shores",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "This land enters tapped unless you control two or fewer other lands.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Dual land that enters untapped on your first three land drops.",
  "how": "Play it on turns 1 to 3, when it enters untapped.",
  "syn": [
   "Drowned Catacomb",
   "Sunken Hollow"
  ]
 },
 {
  "name": "Darkwater Catacombs",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{1}, {T}: Add {U}{B}.",
  "roles": [
   "land"
  ],
  "why": "Pay {1} and tap it for {U}{B}. It fixes both colors at once.",
  "how": "Play it once you have another mana source to feed its {1}.",
  "syn": [
   "Omen Hawker",
   "Dimir Signet"
  ]
 },
 {
  "name": "Desmond Miles",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/3",
  "text": "Menace\nDesmond Miles gets +1/+0 for each other Assassin you control and each Assassin card in your graveyard.\nWhenever Desmond Miles deals combat damage to a player, surveil X, where X is the amount of damage it dealt to that player.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A two-mana legendary Assassin with menace that grows with every other Assassin you control and every Assassin card in your graveyard, and surveils for the damage he deals.",
  "how": "Early he's a menace body that triggers Etrata and turns on Brotherhood Spy. Later, with a type enabler, every cloak and every creature card in your graveyard counts, and he becomes a big threat.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Brotherhood Spy",
   "Maskwood Nexus",
   "Roshan, Hidden Magister",
   "Arcane Adaptation"
  ]
 },
 {
  "name": "Dimir Signet",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{1}, {T}: Add {U}{B}.",
  "roles": [
   "ramp"
  ],
  "why": "Pay {1} and tap to get {U}{B}. It fixes both of Etrata's colors at once.",
  "how": "Turn 2 play. Omen Hawker's restricted mana can pay the {1}, turning it into normal {U}{B}.",
  "syn": [
   "Omen Hawker",
   "Arcane Signet",
   "Sol Ring",
   "Talisman of Dominance"
  ]
 },
 {
  "name": "Dispel",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target instant spell.",
  "roles": [
   "counter",
   "protect"
  ],
  "why": "One mana: counter an instant. It stops instant-speed removal on Etrata or Ramses, or an opposing counterspell.",
  "how": "Keep it for the turn you commit your combo or the turn someone tries to kill your key creature.",
  "syn": [
   "Counterspell",
   "An Offer You Can't Refuse",
   "Wash Away"
  ]
 },
 {
  "name": "Drowned Catacomb",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "This land enters tapped unless you control an Island or a Swamp.\n{T}: Add {U} or {B}.",
  "roles": [
   "land"
  ],
  "why": "Dual land that enters untapped if you control an Island or a Swamp.",
  "how": "Play it from turn 2 onward, after an Island, a Swamp or Sunken Hollow.",
  "syn": [
   "Sunken Hollow",
   "Choked Estuary"
  ]
 },
 {
  "name": "Duskmantle Guildmage",
  "qty": 1,
  "cost": "{U}{B}",
  "mv": 2,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/2",
  "text": "{1}{U}{B}: Whenever a card is put into an opponent's graveyard from anywhere this turn, that player loses 1 life.\n{2}{U}{B}: Target player mills two cards.",
  "roles": [
   "combo",
   "finisher"
  ],
  "why": "Half of a two-card combo with Mindcrank. Its first ability makes each opponent lose 1 life whenever a card goes to their graveyard this turn. With Mindcrank, every life loss mills, and every milled card loses more life.",
  "how": "Activate the first ability for {1}{U}{B} ({U}{B} with Training Grounds), let it resolve, then start the loop: any combat damage, any life loss, or the second ability's mill. The loop runs until the opponent hits 0 life or their library is empty.",
  "syn": [
   "Mindcrank",
   "Training Grounds",
   "Changeling Outcast",
   "Ramses, Assassin Lord",
   "Omen Hawker"
  ],
  "warn": "The first ability lasts only for the turn you activate it, and it doesn't start the loop by itself. You need a starter event after it resolves."
 },
 {
  "name": "Etrata, the Silencer",
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "3/5",
  "text": "Etrata can't be blocked.\nWhenever Etrata deals combat damage to a player, exile target creature that player controls and put a hit counter on that card. That player loses the game if they own three or more exiled cards with hit counters on them. Etrata's owner shuffles Etrata into their library.",
  "roles": [
   "assassin",
   "evasion",
   "removal",
   "finisher"
  ],
  "why": "An unblockable 3/5 Assassin. When she connects, she exiles a creature that player controls with a hit counter, and a player who owns three or more exiled cards with hit counters loses the game. She also triggers the commander Etrata every time.",
  "how": "Attack the same player each time. Before her trigger resolves, you can phase her out with March of Swirling Mist so she isn't shuffled into your library and can attack again.",
  "syn": [
   "March of Swirling Mist",
   "Ravenloft Adventurer",
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord"
  ],
  "warn": "Her trigger needs a legal creature target. If the player controls no creatures, nothing happens: no exile, no hit counter, and she isn't shuffled away either."
 },
 {
  "name": "Exotic Orchard",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add one mana of any color that a land an opponent controls could produce.",
  "roles": [
   "land"
  ],
  "why": "Taps for any color an opponent's land could make, which usually includes blue or black.",
  "how": "Play it once opponents have lands out. It usually makes blue or black.",
  "syn": [
   "Fellwar Stone"
  ]
 },
 {
  "name": "Feed the Swarm",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Destroy target creature or enchantment an opponent controls. You lose life equal to that permanent's mana value.",
  "roles": [
   "removal"
  ],
  "why": "Destroy a creature or enchantment an opponent controls. Black rarely answers enchantments, so it fills a gap.",
  "how": "Use it on a cheap enchantment or a dangerous creature. You lose life equal to its mana value, so avoid expensive targets when your life is low.",
  "syn": [
   "Infernal Grasp",
   "Toxic Deluge",
   "Reality Shift"
  ]
 },
 {
  "name": "Fellwar Stone",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add one mana of any color that a land an opponent controls could produce.",
  "roles": [
   "ramp"
  ],
  "why": "A two-mana rock that makes any color an opponent's land could make. At most tables that includes blue or black.",
  "how": "Turn 2 play. Check what your opponents' lands produce: against colorless-heavy mana bases it may only make {C}.",
  "syn": [
   "Exotic Orchard",
   "Arcane Signet",
   "Sol Ring"
  ]
 },
 {
  "name": "Frantic Search",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Draw two cards, then discard two cards. Untap up to three lands.",
  "roles": [
   "draw"
  ],
  "why": "Draw two, discard two, untap up to three lands. With three tapped lands it's free card filtering.",
  "how": "Tap three lands for other spells first, then cast it with those lands and untap them. Discard extra lands or dead cards.",
  "syn": [
   "Aven Heartstabber",
   "Consider",
   "Preordain"
  ]
 },
 {
  "name": "Gix, Yawgmoth Praetor",
  "qty": 1,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Legendary Creature — Praetor Phyrexian",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Whenever a creature deals combat damage to one of your opponents, its controller may pay 1 life. If they do, they draw a card.\n{4}{B}{B}{B}, Discard X cards: Exile the top X cards of target opponent's library. You may play lands and cast spells from among cards exiled this way without paying their mana costs.",
  "roles": [
   "draw"
  ],
  "why": "Every creature that deals combat damage to one of your opponents lets its controller pay 1 life to draw. With a board of small evasive Assassins, that's a card per connecting creature.",
  "how": "Cast him on turn 3 or 4 before a wide attack. Late in the game his second ability can steal and cast cards from an opponent's library for free.",
  "syn": [
   "Changeling Outcast",
   "Brotherhood Spy",
   "Cryptic Coat",
   "Training Grounds",
   "Reconnaissance Mission"
  ],
  "warn": "It also triggers when opponents hit each other, so they draw too. Watch your life total when you pay for many draws."
 },
 {
  "name": "Glitch Interpreter",
  "qty": 1,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "2/3",
  "text": "When this creature enters, if you control no face-down permanents, return this creature to its owner's hand and manifest dread.\nWhenever one or more colorless creatures you control deal combat damage to a player, draw a card.",
  "roles": [
   "cloak",
   "draw"
  ],
  "why": "The first time you cast it with no face-down permanents, it returns to your hand and manifests dread: a free 2/2 face-down body. Recast it and it stays. Whenever your colorless creatures deal combat damage to a player, you draw a card, and face-down creatures are colorless.",
  "how": "Cast it early for the free manifest, then again when you have mana. Once your board has cloaks, it's a steady draw engine.",
  "syn": [
   "Universal Automaton",
   "Cryptic Coat",
   "They Came from the Pipes",
   "Etrata, Deadly Fugitive"
  ]
 },
 {
  "name": "Grazilaxx, Illithid Scholar",
  "qty": 1,
  "cost": "{1}{U}{U}",
  "mv": 3,
  "type": "Legendary Creature — Horror",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Whenever a creature you control becomes blocked, you may return it to its owner's hand.\nWhenever one or more creatures you control deal combat damage to a player, draw a card.",
  "roles": [
   "draw",
   "protect"
  ],
  "why": "Draws a card whenever your creatures deal combat damage to a player, and lets you return blocked creatures to hand instead of losing them.",
  "how": "Attack with many small creatures at different opponents: each damaged player gives one draw. Bounce a blocked creature card you own when saving it is worth more than the damage.",
  "syn": [
   "Changeling Outcast",
   "Brotherhood Spy",
   "Reconnaissance Mission",
   "Gix, Yawgmoth Praetor"
  ],
  "warn": "A blocked face-down creature returned to hand goes to its owner's hand. If you cloaked it from an opponent, they get the card."
 },
 {
  "name": "Hookblade Veteran",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/2",
  "text": "During your turn, this creature has flying. (It can't be blocked except by creatures with flying or reach.)",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A one-mana Assassin with flying on your turn. It's an early evasive Etrata trigger that can still block ground creatures.",
  "how": "Play it turn 1 or 2 so it's ready to attack the turn Etrata arrives.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Cover of Darkness",
   "Brotherhood Spy"
  ]
 },
 {
  "name": "Infernal Grasp",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target creature. You lose 2 life.",
  "roles": [
   "removal"
  ],
  "why": "Two mana at instant speed: destroy any creature for 2 life.",
  "how": "Kill blockers before combat, or remove a threat at the end of an opponent's turn.",
  "syn": [
   "Feed the Swarm",
   "Toxic Deluge",
   "Reality Shift",
   "Ravenloft Adventurer"
  ]
 },
 {
  "name": "Key to the City",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}, Discard a card: Up to one target creature can't be blocked this turn.\nWhenever this artifact becomes untapped, you may pay {2}. If you do, draw a card.",
  "roles": [
   "evasion",
   "draw"
  ],
  "why": "Tap and discard a card to make a creature unblockable. Each time it untaps, you may pay {2} to draw a card.",
  "how": "Discard an extra land late in the game to push Unstoppable Slasher or Etrata, the Silencer through. Pay {2} on your untap step when you have spare mana.",
  "syn": [
   "Unstoppable Slasher",
   "Etrata, the Silencer",
   "Ramses, Assassin Lord",
   "Basim Ibn Ishaq"
  ]
 },
 {
  "name": "Kheru Spellsnatcher",
  "qty": 1,
  "cost": "{3}{U}",
  "mv": 4,
  "type": "Creature — Wizard Snake",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Morph {4}{U}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, counter target spell. If that spell is countered this way, exile it instead of putting it into its owner's graveyard. You may cast that card without paying its mana cost for as long as it remains exiled.",
  "roles": [
   "counter",
   "utility"
  ],
  "why": "A face-down morph that counters a spell when it turns face up, then lets you cast that spell for free later. With Etrata, it turns up for {2}{U}{B} ({U}{B} with Training Grounds) instead of its {4}{U}{U} morph cost.",
  "how": "Cast it face down for {3} and leave mana up. When an opponent casts something you must stop, turn it face up. Morph is a special action and can't be responded to. Etrata's ability uses the stack but is much cheaper.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Training Grounds",
   "Willbender",
   "Roshan, Hidden Magister",
   "They Came from the Pipes"
  ]
 },
 {
  "name": "Leyline of Transformation",
  "qty": 1,
  "cost": "{2}{U}{U}",
  "mv": 4,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "If this card is in your opening hand, you may begin the game with it on the battlefield.\nAs this enchantment enters, choose a creature type.\nCreatures you control are the chosen type in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.",
  "roles": [
   "enabler"
  ],
  "why": "Choose Assassin and every creature you control is an Assassin, cloaks included. If it's in your opening hand, it starts the game on the battlefield for free.",
  "how": "Keep hands that have it: free Assassin typing from turn 0. Later, casting it for four mana is still a strong type enabler.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Arcane Adaptation",
   "Desmond Miles",
   "Ramses, Assassin Lord",
   "Path of Ancestry"
  ],
  "warn": "If it's cloaked and turned face up, it never chose a type and does nothing."
 },
 {
  "name": "March of Swirling Mist",
  "qty": 1,
  "cost": "{X}{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "As an additional cost to cast this spell, you may exile any number of blue cards from your hand. This spell costs {2} less to cast for each card exiled this way.\nUp to X target creatures phase out. (While they're phased out, they're treated as though they don't exist. Each one phases in before its controller untaps during their next untap step.)",
  "roles": [
   "protect"
  ],
  "why": "Phase out any number of creatures at instant speed. It saves your board from a wipe, protects Etrata from removal, or removes blockers for a turn.",
  "how": "Exile blue cards from hand to cut the cost by {2} each. Phase out your key creatures in response to removal, or phase out opponents' blockers before combat.",
  "syn": [
   "Etrata, the Silencer",
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Roshan, Hidden Magister"
  ]
 },
 {
  "name": "Mask of Memory",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "Whenever equipped creature deals combat damage to a player, you may draw two cards. If you do, discard a card.\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)",
  "roles": [
   "draw"
  ],
  "why": "Equip {1}: whenever the creature deals combat damage to a player, draw two, then discard one.",
  "how": "Put it on your most reliable unblockable Assassin, like Changeling Outcast or Brotherhood Spy.",
  "syn": [
   "Changeling Outcast",
   "Brotherhood Spy",
   "Cryptic Coat",
   "Universal Automaton"
  ]
 },
 {
  "name": "Maskwood Nexus",
  "qty": 1,
  "cost": "{4}",
  "mv": 4,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Creatures you control are every creature type. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.\n{3}, {T}: Create a 2/2 blue Shapeshifter creature token with changeling. (It is every creature type.)",
  "roles": [
   "enabler",
   "utility"
  ],
  "why": "Every creature you control is every creature type, face-down cloaks included. That makes them Assassins, so they trigger Etrata. It also makes Shapeshifter tokens that are Assassins.",
  "how": "Cast it before combat. Spare mana late in the game goes into {3}, {T}: a 2/2 changeling token that can attack next turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Desmond Miles",
   "Ramses, Assassin Lord",
   "Path of Ancestry",
   "Omen Hawker"
  ]
 },
 {
  "name": "Mind Stone",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}.\n{1}, {T}, Sacrifice this artifact: Draw a card.",
  "roles": [
   "ramp",
   "draw"
  ],
  "why": "Two-mana rock that you can cash in for a card when you no longer need the mana.",
  "how": "Turn 2 play. Late in the game, pay {1}, tap and sacrifice it to draw.",
  "syn": [
   "Sol Ring",
   "Arcane Signet",
   "Basim Ibn Ishaq",
   "Omen Hawker"
  ]
 },
 {
  "name": "Mindcrank",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Whenever an opponent loses life, that player mills that many cards. (Damage causes loss of life.)",
  "roles": [
   "combo",
   "finisher"
  ],
  "why": "Whenever an opponent loses life, they mill that many cards. With Duskmantle Guildmage, each milled card is another point of life lost, and it loops.",
  "how": "Keep it on the battlefield. On the kill turn, resolve Guildmage's first ability, then start the loop with combat damage or any life loss. Even alone it mills in step with the damage you deal.",
  "syn": [
   "Duskmantle Guildmage",
   "Unstoppable Slasher",
   "Changeling Outcast",
   "Ramses, Assassin Lord"
  ],
  "warn": "The loop only continues while cards actually reach the graveyard. An empty library stops it, and graveyard replacement effects break it."
 },
 {
  "name": "Mothdust Changeling",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)\nTap an untapped creature you control: This creature gains flying until end of turn.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A one-mana changeling, so an Assassin, that can gain flying by tapping another creature. Tap a fresh cloak or a summoning-sick creature and it flies in for an Etrata trigger.",
  "how": "Play it early. Each combat, tap a creature that can't attack anyway to give it flying.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Cover of Darkness",
   "Springleaf Drum",
   "Ramses, Assassin Lord"
  ]
 },
 {
  "name": "Night's Whisper",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "You draw two cards and lose 2 life.",
  "roles": [
   "draw"
  ],
  "why": "Two mana, two cards, two life.",
  "how": "Cast it on turn 2 or 3 when you have nothing better, or late to refill.",
  "syn": [
   "Plumb the Forbidden",
   "Consider",
   "Preordain"
  ]
 },
 {
  "name": "Omen Hawker",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Creature — Advisor Octopus",
  "cat": "Creature",
  "pt": "1/1",
  "text": "{T}: Add {C}{U}. Spend this mana only to activate abilities.",
  "roles": [
   "ramp",
   "utility"
  ],
  "why": "A one-drop that taps for {C}{U}, spendable only to activate abilities. This deck has lots of abilities to pay for: Etrata's turn-up ability, Duskmantle Guildmage, equip costs, Access Tunnel and Rogue's Passage.",
  "how": "Play it early and use its two mana on activations every turn. It can also pay Dimir Signet's {1}, which then makes normal {U}{B}.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Duskmantle Guildmage",
   "Training Grounds",
   "Dimir Signet",
   "Access Tunnel"
  ],
  "warn": "It can't pay for spells, and it can't pay to turn a face-down creature up for its mana cost or morph cost: those are special actions, not activated abilities."
 },
 {
  "name": "Path of Ancestry",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "This land enters tapped.\n{T}: Add one mana of any color in your commander's color identity. When that mana is spent to cast a creature spell that shares a creature type with your commander, scry 1. (Look at the top card of your library. You may put that card on the bottom.)",
  "roles": [
   "land"
  ],
  "why": "Enters tapped, makes {U} or {B}, and scries 1 when the mana casts a creature sharing a type with Etrata.",
  "how": "Play it on turn 1 or 2, when entering tapped matters least.",
  "syn": [
   "Roshan, Hidden Magister",
   "Maskwood Nexus",
   "Arcane Adaptation",
   "Changeling Outcast"
  ]
 },
 {
  "name": "Plumb the Forbidden",
  "qty": 1,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "As an additional cost to cast this spell, you may sacrifice one or more creatures. When you do, copy this spell for each creature sacrificed this way.\nYou draw a card and lose 1 life.",
  "roles": [
   "draw",
   "protect"
  ],
  "why": "Draw a card for 1 life, plus one copy for each creature you sacrifice. Sacrifice creatures in response to a wipe or removal and turn them into cards.",
  "how": "Hold it until opponents try to wipe the board or exile your creatures, then sacrifice those about to die.",
  "syn": [
   "Chthonian Nightmare",
   "Toxic Deluge",
   "Unstoppable Slasher",
   "Duskmantle Guildmage"
  ]
 },
 {
  "name": "Preordain",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Scry 2, then draw a card. (To scry 2, look at the top two cards of your library, then put any number of them on the bottom and the rest on top in any order.)",
  "roles": [
   "draw"
  ],
  "why": "Scry 2, then draw. The best one-mana way to find a land or an Assassin in the early turns.",
  "how": "Cast it on turn 1 or 2 to fix your hand. Later, dig for a type enabler or a finisher.",
  "syn": [
   "Consider",
   "Frantic Search",
   "Night's Whisper"
  ]
 },
 {
  "name": "Ramses, Assassin Lord",
  "qty": 1,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Deathtouch\nOther Assassins you control get +1/+1.\nWhenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game.",
  "roles": [
   "assassin",
   "finisher",
   "combo"
  ],
  "why": "A four-mana 4/4 deathtouch lord: other Assassins get +1/+1. His last ability ends games: when a player loses, if they were attacked this turn by an Assassin you controlled, you win the game.",
  "how": "Every other finisher in the deck eliminates one player. Ramses turns that one elimination into winning the whole table. Attack the player you're eliminating with at least one Assassin that turn.",
  "syn": [
   "Strixhaven Stadium",
   "Unstoppable Slasher",
   "Wound Reflection",
   "Duskmantle Guildmage",
   "Etrata, the Silencer"
  ],
  "warn": "He has to be on the battlefield when the player loses. The attack has to happen the same turn."
 },
 {
  "name": "Ravenloft Adventurer",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Creature — Human Rogue Assassin",
  "cat": "Creature",
  "pt": "3/4",
  "text": "When this creature enters, you take the initiative.\nIf a creature an opponent controls would die, instead exile it and put a hit counter on it.\nWhenever this creature attacks, if you've completed a dungeon, defending player loses 1 life for each card they own in exile with a hit counter on it.",
  "roles": [
   "assassin",
   "utility"
  ],
  "why": "A 3/4 Assassin that takes the initiative when it enters. The first Undercity room gets you a basic land, and creatures opponents control are exiled with hit counters instead of dying.",
  "how": "Cast it when you can keep the initiative: attack and block well so opponents don't take it from you. Its hit counters add up toward Etrata, the Silencer's three-card loss.",
  "syn": [
   "Etrata, the Silencer",
   "Etrata, Deadly Fugitive",
   "Infernal Grasp",
   "Toxic Deluge"
  ],
  "warn": "Opponents take the initiative by dealing combat damage to you. Also, their creatures get exiled instead of going to their graveyard, so those don't set off Duskmantle Guildmage."
 },
 {
  "name": "Reality Shift",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Exile target creature. Its controller manifests the top card of their library. (That player puts the top card of their library onto the battlefield face down as a 2/2 creature. If it's a creature card, it can be turned face up any time for its mana cost.)",
  "roles": [
   "removal",
   "protect"
  ],
  "why": "Exile any creature at instant speed. Its controller gets a face-down 2/2 from the top of their library.",
  "how": "Use it on indestructible or recursive threats. In a pinch, target your own creature in response to theft: you get a 2/2 in its place.",
  "syn": [
   "Infernal Grasp",
   "Feed the Swarm",
   "Toxic Deluge"
  ]
 },
 {
  "name": "Reconnaissance Mission",
  "qty": 1,
  "cost": "{2}{U}{U}",
  "mv": 4,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever a creature you control deals combat damage to a player, you may draw a card.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  "roles": [
   "draw"
  ],
  "why": "Each creature that deals combat damage to a player can draw you a card. With several small evasive attackers, it's several cards per turn.",
  "how": "Cast it when you have three or more creatures that connect. In a hand with no board, cycle it for {2}.",
  "syn": [
   "Changeling Outcast",
   "Brotherhood Spy",
   "Gix, Yawgmoth Praetor",
   "Grazilaxx, Illithid Scholar"
  ]
 },
 {
  "name": "River of Tears",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {U}. If you played a land this turn, add {B} instead.",
  "roles": [
   "land"
  ],
  "why": "Untapped land that makes {U}, or {B} if you played a land this turn.",
  "how": "Play your land for the turn first, then tap it for {B}. On opponents' turns it makes {U} for your instants.",
  "syn": [
   "Counterspell",
   "Dispel",
   "Arcane Denial"
  ]
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
   "evasion"
  ],
  "why": "Colorless land that makes any creature unblockable for {4}.",
  "how": "Keep {4} spare in the late game to push your best Assassin through.",
  "syn": [
   "Unstoppable Slasher",
   "Omen Hawker",
   "Access Tunnel"
  ]
 },
 {
  "name": "Roshan, Hidden Magister",
  "qty": 1,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "4/4",
  "text": "Other creatures you control are Assassins in addition to their other types. The same is true for creature spells you control and creature cards you own that aren't on the battlefield.\nFace-down creatures you control have menace.\nWhenever a permanent you control is turned face up, you draw a card and you lose 1 life.",
  "roles": [
   "assassin",
   "enabler",
   "draw"
  ],
  "why": "Makes every other creature you control an Assassin, gives face-down creatures menace, and draws you a card whenever a permanent you control is turned face up. With Etrata, your cloaks now trigger her and each hit makes another cloak.",
  "how": "Cast him before combat on turn 4 or 5. From then on, attack with every cloak you can, and turn cloaks face up when the card underneath is worth more than the body.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Kheru Spellsnatcher",
   "Desmond Miles",
   "Ramses, Assassin Lord",
   "Path of Ancestry"
  ]
 },
 {
  "name": "Scroll of Fate",
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Manifest a card from your hand. (Put that card onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)",
  "roles": [
   "cloak",
   "utility"
  ],
  "why": "Tap: manifest a card from your hand. Every turn you get a 2/2 body from a card you can't use yet, and Etrata can flip noncreature cards later.",
  "how": "Manifest a creature you'll turn up later for its mana cost, a card you can't cast yet, or an instant or sorcery that Etrata's ability can exile and cast for free when you need it.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "They Came from the Pipes",
   "Wound Reflection",
   "Training Grounds",
   "Counterspell"
  ]
 },
 {
  "name": "Silent Hallcreeper",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Enchantment Creature — Horror",
  "cat": "Creature",
  "pt": "1/1",
  "text": "This creature can't be blocked.\nWhenever this creature deals combat damage to a player, choose one that hasn't been chosen —\n• Put two +1/+1 counters on this creature.\n• Draw a card.\n• This creature becomes a copy of another target creature you control.",
  "roles": [
   "evasion",
   "draw",
   "utility"
  ],
  "why": "An unblockable two-drop that grows, draws, then becomes a copy of your best creature, one mode per hit.",
  "how": "Hit with it three times: counters first, then the card, then copy something that's better unblockable, like Unstoppable Slasher. It's a Horror, so it only triggers Etrata with a type enabler.",
  "syn": [
   "Unstoppable Slasher",
   "Roshan, Hidden Magister",
   "Maskwood Nexus",
   "Arcane Adaptation"
  ],
  "warn": "Copying a legendary creature gives you two of them, and the legend rule makes you put one into the graveyard."
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
  "why": "One mana for two colorless mana. The strongest ramp in any Commander deck.",
  "how": "Play it turn 1. Turn 2 then has four mana: Etrata plus a one-drop, or a turn-2 four-drop.",
  "syn": [
   "Arcane Signet",
   "Dimir Signet",
   "Maskwood Nexus",
   "Scroll of Fate"
  ]
 },
 {
  "name": "Spark Double",
  "qty": 1,
  "cost": "{3}{U}",
  "mv": 4,
  "type": "Creature — Illusion",
  "cat": "Creature",
  "pt": "0/0",
  "text": "You may have this creature enter as a copy of a creature or planeswalker you control, except it enters with an additional +1/+1 counter on it if it's a creature, it enters with an additional loyalty counter on it if it's a planeswalker, and it isn't legendary.",
  "roles": [
   "utility",
   "combo"
  ],
  "why": "Copies a creature you control, without the legend rule. A second Etrata doubles every cloak trigger. It can also copy Ramses, Roshan or Unstoppable Slasher.",
  "how": "Cast it as a copy of Etrata once you have several Assassins attacking. Each Assassin that connects now cloaks twice from that player's library.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Roshan, Hidden Magister",
   "Ramses, Assassin Lord",
   "Unstoppable Slasher"
  ],
  "warn": "If it's cloaked and turned face up, it doesn't copy anything and is usually a 0/0 that dies. Cast it from your hand instead."
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
  "why": "Tap an untapped creature to add one mana of any color. Fresh cloaks and summoning-sick creatures can pay it.",
  "how": "Tap a creature that can't attack this turn, like a new cloak, to fix for Etrata's {U}{B}.",
  "syn": [
   "Omen Hawker",
   "Etrata, Deadly Fugitive",
   "Glitch Interpreter",
   "Cryptic Coat"
  ],
  "warn": "Don't tap an attacker you need for this combat."
 },
 {
  "name": "Strixhaven Stadium",
  "qty": 1,
  "cost": "{3}",
  "mv": 3,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}. Put a point counter on this artifact.\nWhenever a creature deals combat damage to you, remove a point counter from this artifact.\nWhenever a creature you control deals combat damage to an opponent, put a point counter on this artifact. Then if it has ten or more point counters on it, remove them all and that player loses the game.",
  "roles": [
   "ramp",
   "finisher"
  ],
  "why": "A mana rock that also counts combat hits. Each time one of your creatures deals combat damage to an opponent, it gains a point counter. At ten, it removes them all and that player loses the game.",
  "how": "Tap it for mana every turn to add counters. The win comes from the combat damage trigger: many small evasive attackers add many counters in one combat.",
  "syn": [
   "Changeling Outcast",
   "Ramses, Assassin Lord",
   "Brotherhood Spy",
   "Etrata, the Silencer",
   "Cryptic Coat"
  ],
  "warn": "Every creature that deals combat damage to you removes a counter, so keep your defenses up."
 },
 {
  "name": "Sunken Hollow",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U} or {B}.)\nThis land enters tapped unless you control two or more basic lands.",
  "roles": [
   "land"
  ],
  "why": "Dual land with the Island and Swamp types. It enters untapped once you have two basic lands.",
  "how": "Play it on turn 1 or 2 when tapped costs nothing, or after two basics.",
  "syn": [
   "Drowned Catacomb",
   "Tainted Isle",
   "Choked Estuary"
  ]
 },
 {
  "name": "Supernatural Stamina",
  "qty": 1,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Until end of turn, target creature gets +2/+0 and gains \"When this creature dies, return it to the battlefield tapped under its owner's control.\"",
  "roles": [
   "protect"
  ],
  "why": "One mana: +2/+0, and if the creature dies this turn, it comes back tapped. It saves a key creature from a destroy effect or a bad block.",
  "how": "Cast it in response to removal on Roshan or Ramses. A creature with an enters trigger, like Ravenloft Adventurer, gets it again.",
  "syn": [
   "Ravenloft Adventurer",
   "Roshan, Hidden Magister",
   "Ramses, Assassin Lord",
   "Boggart Trawler // Boggart Bog"
  ],
  "warn": "It returns under its owner's control. On a creature you took from an opponent, they get it."
 },
 {
  "name": "Tainted Isle",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. Activate only if you control a Swamp.",
  "roles": [
   "land"
  ],
  "why": "Taps for {C}, or {U} or {B} if you control a Swamp.",
  "how": "Play it after a Swamp or Sunken Hollow, or use it for {C} early.",
  "syn": [
   "Sunken Hollow",
   "Underground River"
  ]
 },
 {
  "name": "Talisman of Dominance",
  "qty": 1,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. This artifact deals 1 damage to you.",
  "roles": [
   "ramp"
  ],
  "why": "Two-mana rock that makes {C}, or {U} or {B} for 1 damage.",
  "how": "Turn 2 play. Use {C} for generic costs and save the damage for when you need the color.",
  "syn": [
   "Sol Ring",
   "Arcane Signet",
   "Dimir Signet"
  ]
 },
 {
  "name": "They Came from the Pipes",
  "qty": 1,
  "cost": "{4}{U}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "When this enchantment enters, manifest dread twice. (To manifest dread, look at the top two cards of your library. Put one onto the battlefield face down as a 2/2 creature and the other into your graveyard. Turn it face up any time for its mana cost if it's a creature card.)\nWhenever a face-down creature you control enters, draw a card.",
  "roles": [
   "cloak",
   "draw"
  ],
  "why": "Two face-down bodies when it enters, and a card each time a face-down creature enters under your control. Etrata's cloaks, Cryptic Coat and morphs all draw.",
  "how": "Cast it on turn 5 or later. It draws two right away from its own manifests, then keeps drawing as Etrata cloaks.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Cryptic Coat",
   "Scroll of Fate",
   "Kheru Spellsnatcher",
   "Glitch Interpreter"
  ]
 },
 {
  "name": "Toxic Deluge",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "As an additional cost to cast this spell, pay X life.\nAll creatures get -X/-X until end of turn.",
  "roles": [
   "removal"
  ],
  "why": "Pay X life, all creatures get -X/-X. You choose exactly how big the wipe is.",
  "how": "Pick X to kill what matters while your key creatures survive. Etrata is a 1/4, so X=3 leaves her alive.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Plumb the Forbidden",
   "March of Swirling Mist",
   "Ravenloft Adventurer"
  ],
  "warn": "Face-down creatures are 2/2s, so X=2 kills your cloaks too."
 },
 {
  "name": "Training Grounds",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Activated abilities of creatures you control cost {2} less to activate. This effect can't reduce the mana in that cost to less than one mana.",
  "roles": [
   "utility"
  ],
  "why": "Activated abilities of your creatures cost up to {2} less. Etrata's granted turn-up ability drops to {U}{B}, and Duskmantle Guildmage's abilities drop to {U}{B}.",
  "how": "Cast it early when you plan to flip cards with Etrata. With it out, flipping a cloaked Wound Reflection or a stolen instant is cheap.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Duskmantle Guildmage",
   "Kheru Spellsnatcher",
   "Gix, Yawgmoth Praetor",
   "Scroll of Fate"
  ],
  "warn": "It doesn't reduce morph costs, turning a creature face up for its mana cost, Equipment or artifact abilities."
 },
 {
  "name": "Underground River",
  "qty": 1,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add {U} or {B}. This land deals 1 damage to you.",
  "roles": [
   "land"
  ],
  "why": "Untapped dual land: {C} for free, or {U} or {B} for 1 damage.",
  "how": "Play it early: it's always untapped. Take the damage only when you need the color.",
  "syn": [
   "Talisman of Dominance",
   "Tainted Isle"
  ]
 },
 {
  "name": "Universal Automaton",
  "qty": 1,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Changeling (This card is every creature type.)",
  "roles": [
   "assassin"
  ],
  "why": "A one-mana artifact changeling. It's an Assassin for Etrata, a historic spell for Basim, and a colorless creature for Glitch Interpreter.",
  "how": "Cast it early as another cheap Assassin. It has no evasion, so give it Equipment or an unblockable effect.",
  "syn": [
   "Basim Ibn Ishaq",
   "Glitch Interpreter",
   "Cryptic Coat",
   "Etrata, Deadly Fugitive",
   "Mask of Memory"
  ]
 },
 {
  "name": "Unstoppable Slasher",
  "qty": 1,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Zombie Assassin",
  "cat": "Creature",
  "pt": "2/3",
  "text": "Deathtouch\nWhenever this creature deals combat damage to a player, they lose half their life, rounded up.\nWhen this creature dies, if it had no counters on it, return it to the battlefield tapped under its owner's control with two stun counters on it.",
  "roles": [
   "assassin",
   "finisher",
   "combo"
  ],
  "why": "A three-mana deathtouch Assassin. When it deals combat damage to a player, they lose half their life, rounded up. The first time it dies, it comes back.",
  "how": "Get it through: Aqueous Form, Access Tunnel, Key to the City, Cover of Darkness. On the turn it connects, have Wound Reflection on the battlefield before your end step: the player loses the same total again and usually dies.",
  "syn": [
   "Wound Reflection",
   "Ramses, Assassin Lord",
   "Aqueous Form",
   "Mindcrank",
   "Access Tunnel"
  ],
  "warn": "It only comes back if it had no counters of any kind when it died. The return adds two stun counters, so the second death is final."
 },
 {
  "name": "Wash Away",
  "qty": 1,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Cleave {1}{U}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nCounter target spell [that wasn't cast from its owner's hand].",
  "roles": [
   "counter"
  ],
  "why": "One mana counters a spell that wasn't cast from its owner's hand: a commander, a spell from the graveyard or from exile. For {1}{U}{U} with cleave, it counters anything.",
  "how": "Keep {U} up against commanders. Pay the cleave cost when you need a hard counter.",
  "syn": [
   "Counterspell",
   "Arcane Denial",
   "An Offer You Can't Refuse"
  ]
 },
 {
  "name": "Willbender",
  "qty": 1,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Creature — Human Wizard",
  "cat": "Creature",
  "pt": "1/2",
  "text": "Morph {1}{U} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\nWhen this creature is turned face up, change the target of target spell or ability with a single target.",
  "roles": [
   "protect",
   "utility"
  ],
  "why": "A face-down morph that redirects a spell or ability with a single target when it turns face up. It turns removal on Etrata into removal on an opponent's creature.",
  "how": "Cast it face down for {3} and keep {1}{U} up. Turning it face up with morph is a special action: opponents can't respond to it.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Kheru Spellsnatcher",
   "Roshan, Hidden Magister",
   "Training Grounds"
  ]
 },
 {
  "name": "Wound Reflection",
  "qty": 1,
  "cost": "{5}{B}",
  "mv": 6,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "At the beginning of each end step, each opponent loses life equal to the life they lost this turn. (Damage causes loss of life.)",
  "roles": [
   "finisher",
   "combo"
  ],
  "why": "At the beginning of each end step, each opponent loses as much life as they already lost this turn. It doubles all your damage and life loss.",
  "how": "It must be on the battlefield when the end step begins. Cast it or flip it with Etrata in your second main phase, after Unstoppable Slasher has connected.",
  "syn": [
   "Unstoppable Slasher",
   "Ramses, Assassin Lord",
   "Mindcrank",
   "Scroll of Fate",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "Flipping it face up during the end step is too late for that end step's trigger."
 },
 {
  "name": "Island",
  "qty": 11,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Island",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U}.)",
  "roles": [
   "land"
  ],
  "why": "Eleven basic Islands. The deck needs blue for Etrata, counterspells and most of its engine cards.",
  "how": "",
  "syn": []
 },
 {
  "name": "Swamp",
  "qty": 10,
  "cost": "",
  "mv": 0,
  "type": "Basic Land — Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {B}.)",
  "roles": [
   "land"
  ],
  "why": "Ten basic Swamps. Black pays for Etrata, removal and several finishers.",
  "how": "",
  "syn": []
 }
];
