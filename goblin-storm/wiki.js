/* Card wiki extras for the Goblin Storm deck: per-card ratings, rulings, tips and combos.
   Card names match window.GSTORM_CARDS exactly. Glossary, cut list and FAQ are in glossary.js. */
window.GSTORM_WIKI = {
 "Zada, Hedron Grinder": {
  "rating": 5,
  "when": "Turn 4 or later, once you have three or more other creatures",
  "tags": [
   "commander",
   "legendary",
   "copy",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Does a spell have to target only Zada?",
    "a": "Yes. If the spell has any other target, even an opponent or a second creature, Zada doesn't trigger. A spell with 'up to' targets works if you pick only Zada."
   },
   {
    "q": "Which creatures get a copy?",
    "a": "Each other creature you control that the spell could target. A spell that says 'target Goblin' only copies onto your Goblins; hexproof doesn't matter because they're yours."
   },
   {
    "q": "Do the copies count for storm?",
    "a": "No. Copies aren't cast. They don't raise the storm count and don't trigger 'whenever you cast'. They do trigger magecraft on <i-c>Storm-Kiln Artist</i-c>, which says 'cast or copy'."
   },
   {
    "q": "What if Zada leaves before the spell resolves?",
    "a": "The copies were made when the trigger resolved and resolve on their own. Only the original spell, aimed at Zada, fizzles."
   },
   {
    "q": "Does Roaming Throne double her?",
    "a": "Yes. Zada is a Goblin, so with <i-c>Roaming Throne</i-c> naming Goblin her trigger happens twice and every other creature gets two copies."
   }
  ],
  "tips": [
   "Count before you cast: with seven other creatures, a one-mana cantrip on Zada is eight cards.",
   "Tap <i-c>Krenko, Mob Boss</i-c> and cast token spells first. Every new body is one more copy.",
   "Copies resolve before the original. If Zada dies in response, you still get the copies."
  ],
  "combos": [
   "Storm-Kiln Artist",
   "Ancestors' Aid",
   "Expedite",
   "Daring Discovery",
   "Roaming Throne"
  ]
 },
 "Broadside Bombardiers": {
  "rating": 4,
  "when": "Turn 3 onward",
  "tags": [
   "haste",
   "menace",
   "boast",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Can I boast before blockers?",
    "a": "Yes, any time after it has attacked this turn, once a turn. A Treasure has mana value 0, so throwing one deals 2."
   }
  ]
 },
 "Conspicuous Snoop": {
  "rating": 3,
  "when": "Turn 2",
  "tags": [
   "card advantage",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "With Krenko on top, can Snoop make tokens?",
    "a": "Yes. Snoop gets Krenko's {T} ability, and X counts your Goblins, Snoop included."
   }
  ]
 },
 "General Kreat, the Boltbringer": {
  "rating": 4,
  "when": "Turn 3",
  "tags": [
   "legendary",
   "drain",
   "token maker"
  ]
 },
 "Goblin Chieftain": {
  "rating": 4,
  "when": "Before attacks",
  "tags": [
   "lord",
   "haste"
  ]
 },
 "Goblin Dark-Dwellers": {
  "rating": 3,
  "when": "With Grapeshot or a ritual in the graveyard",
  "tags": [
   "menace",
   "recast"
  ]
 },
 "Goblin Lackey": {
  "rating": 3,
  "when": "Turn 1",
  "tags": [
   "cheat"
  ]
 },
 "Goblin Matron": {
  "rating": 4,
  "when": "Turn 3",
  "tags": [
   "tutor"
  ]
 },
 "Goblin Warchief": {
  "rating": 4,
  "when": "Turn 3",
  "tags": [
   "cost reducer",
   "haste"
  ]
 },
 "Krenko, Mob Boss": {
  "rating": 5,
  "when": "Turn 3 or 4 with haste",
  "tags": [
   "legendary",
   "token maker",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Does X count Krenko?",
    "a": "Yes. X is the number of Goblins you control as the ability resolves, Krenko included."
   },
   {
    "q": "Can I tap it the turn it enters?",
    "a": "Only with haste. <i-c>Goblin Warchief</i-c>, <i-c>Goblin Chieftain</i-c>, <i-c>Howlsquad Heavy</i-c>, <i-c>Swiftfoot Boots</i-c>, <i-c>Crimson Wisps</i-c> and <i-c>Expedite</i-c> all give it."
   }
  ],
  "tips": [
   "With <i-c>Impact Tremors</i-c> out, each tap is X damage to each opponent."
  ],
  "combos": [
   "Impact Tremors",
   "Goblin Bombardment",
   "Skirk Prospector"
  ]
 },
 "Pashalik Mons": {
  "rating": 4,
  "when": "Before you start sacrificing",
  "tags": [
   "legendary",
   "aristocrats",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Does Mons see Goblins that die with it?",
    "a": "Yes. When Mons and other Goblins die at the same time (a wipe, <i-c>Blasphemous Act</i-c>), it triggers for each of them."
   }
  ],
  "combos": [
   "Goblin Bombardment",
   "Skirk Prospector"
  ]
 },
 "Redcap Gutter-Dweller": {
  "rating": 2,
  "when": "Turn 4",
  "tags": [
   "menace"
  ]
 },
 "Roaming Throne": {
  "rating": 4,
  "when": "Before your big turn",
  "tags": [
   "ward",
   "trigger doubler",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Does it double Impact Tremors?",
    "a": "No. Only triggered abilities of creatures of the chosen type. Tremors is an enchantment."
   },
   {
    "q": "Does it double itself?",
    "a": "It doubles only other creatures' triggers."
   }
  ]
 },
 "Siege-Gang Commander": {
  "rating": 4,
  "when": "Turn 5",
  "tags": [
   "token maker",
   "sac outlet"
  ]
 },
 "Skirk Prospector": {
  "rating": 4,
  "when": "Turn 1",
  "tags": [
   "sac outlet",
   "mana",
   "secret lair art"
  ]
 },
 "Storm-Kiln Artist": {
  "rating": 5,
  "when": "The turn before you go off",
  "tags": [
   "magecraft",
   "treasure",
   "combo"
  ],
  "rulings": [
   {
    "q": "Do Zada's copies trigger it?",
    "a": "Yes. Magecraft says 'cast or copy', so each copy makes a Treasure."
   },
   {
    "q": "Do storm copies trigger it?",
    "a": "Yes, for the same reason."
   }
  ],
  "combos": [
   "Haze of Rage",
   "Zada, Hedron Grinder"
  ]
 },
 "Ancestors' Aid": {
  "rating": 4,
  "when": "On Zada, before combat",
  "tags": [
   "treasure",
   "first strike"
  ]
 },
 "Battle Hymn": {
  "rating": 4,
  "when": "With a wide board",
  "tags": [
   "ritual"
  ]
 },
 "Brightstone Ritual": {
  "rating": 4,
  "when": "The turn you go off",
  "tags": [
   "ritual",
   "instant",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Does it count opponents' Goblins?",
    "a": "Yes, every Goblin on the battlefield."
   }
  ]
 },
 "Chaos Warp": {
  "rating": 4,
  "when": "When needed",
  "tags": [
   "removal"
  ]
 },
 "Crimson Wisps": {
  "rating": 4,
  "when": "On Zada",
  "tags": [
   "cantrip",
   "haste"
  ]
 },
 "Expedite": {
  "rating": 4,
  "when": "On Zada",
  "tags": [
   "cantrip",
   "haste"
  ]
 },
 "Fists of Flame": {
  "rating": 3,
  "when": "On Zada before attacks",
  "tags": [
   "cantrip",
   "trample"
  ]
 },
 "Sazacap's Brew": {
  "rating": 1,
  "when": "Late, to loot",
  "tags": [
   "gift",
   "loot"
  ]
 },
 "Seething Song": {
  "rating": 3,
  "when": "Storm turn",
  "tags": [
   "ritual"
  ]
 },
 "Blasphemous Act": {
  "rating": 4,
  "when": "When behind, or with Mons out",
  "tags": [
   "wipe"
  ]
 },
 "Daring Discovery": {
  "rating": 4,
  "when": "With Zada and a wide board",
  "tags": [
   "discover",
   "free spell"
  ],
  "rulings": [
   {
    "q": "It says 'up to three': can I pick only Zada?",
    "a": "Yes, then it targets only Zada and she copies it. Each copy discovers 4 on its own."
   }
  ]
 },
 "Empty the Warrens": {
  "rating": 5,
  "when": "Late in a storm turn",
  "tags": [
   "storm",
   "token maker",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Do spells my opponents cast count?",
    "a": "Yes. Storm counts every spell cast before it this turn by anyone."
   }
  ]
 },
 "Glimpse the Impossible": {
  "rating": 2,
  "when": "With mana to spare",
  "tags": [
   "impulse draw"
  ]
 },
 "Goblin Negotiation": {
  "rating": 2,
  "when": "Late",
  "tags": [
   "removal",
   "token maker"
  ]
 },
 "Grapeshot": {
  "rating": 5,
  "when": "Last spell of the turn",
  "tags": [
   "storm",
   "finisher",
   "secret lair art"
  ],
  "rulings": [
   {
    "q": "Can the copies hit different targets?",
    "a": "Yes. Each copy can choose a new target: split it among creatures and players as you like."
   }
  ]
 },
 "Haze of Rage": {
  "rating": 4,
  "when": "Before combat, as the last spells",
  "tags": [
   "storm",
   "buyback",
   "combo"
  ],
  "rulings": [
   {
    "q": "Is Storm-Kiln Artist plus Haze of Rage infinite?",
    "a": "With enough storm, yes. Haze with buyback costs {3}{R}. Artist makes a Treasure for the cast and one per storm copy, so once three spells have been cast before it this turn, each Haze makes at least four Treasures and pays for the next. Storm keeps climbing, so your creatures get as much power as you like."
   }
  ],
  "combos": [
   "Storm-Kiln Artist"
  ]
 },
 "Mana Geyser": {
  "rating": 2,
  "when": "After opponents tap out",
  "tags": [
   "ritual"
  ]
 },
 "Past in Flames": {
  "rating": 4,
  "when": "Mid storm turn",
  "tags": [
   "flashback",
   "storm"
  ]
 },
 "Renegade Tactics": {
  "rating": 3,
  "when": "On Zada",
  "tags": [
   "cantrip"
  ]
 },
 "Spreading Insurrection": {
  "rating": 3,
  "when": "Late storm turn",
  "tags": [
   "storm",
   "theft"
  ]
 },
 "Vandalblast": {
  "rating": 3,
  "when": "Against artifacts",
  "tags": [
   "removal",
   "overload"
  ]
 },
 "Wild Ride": {
  "rating": 3,
  "when": "On Zada",
  "tags": [
   "haste",
   "harmonize"
  ]
 },
 "Witch's Mark": {
  "rating": 3,
  "when": "On Zada with a full hand",
  "tags": [
   "loot",
   "role"
  ]
 },
 "Idol of Oblivion": {
  "rating": 2,
  "when": "Turn 2",
  "tags": [
   "card draw"
  ]
 },
 "Ruby Medallion": {
  "rating": 4,
  "when": "Turn 2",
  "tags": [
   "cost reducer"
  ]
 },
 "Skullclamp": {
  "rating": 5,
  "when": "Any time you have 1/1 tokens",
  "tags": [
   "equipment",
   "card draw",
   "secret lair art"
  ]
 },
 "Sol Ring": {
  "rating": 5,
  "when": "Turn 1",
  "tags": [
   "fast mana",
   "secret lair art"
  ]
 },
 "Throne of Eldraine": {
  "rating": 3,
  "when": "Turn 5",
  "tags": [
   "legendary",
   "mana",
   "card draw"
  ]
 },
 "Frontline Heroism": {
  "rating": 3,
  "when": "Before Zada",
  "tags": [
   "copy",
   "token maker"
  ]
 },
 "Goblin Bombardment": {
  "rating": 5,
  "when": "Any time",
  "tags": [
   "sac outlet",
   "finisher"
  ]
 },
 "Impact Tremors": {
  "rating": 4,
  "when": "Before the token turn",
  "tags": [
   "drain"
  ]
 },
 "Quest for the Goblin Lord": {
  "rating": 2,
  "when": "Turn 1",
  "tags": [
   "anthem"
  ]
 }
};
