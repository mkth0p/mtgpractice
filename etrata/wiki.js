/* Card wiki extras for the Etrata deck: per-card ratings, rulings, tips and combos,
   plus the glossary, the cut list and the FAQ. Card names match window.ETRATA_CARDS exactly. */
window.ETRATA_WIKI = {
 "Etrata, Deadly Fugitive": {
  rating: 5,
  when: "Turn 3, after a cheap Assassin",
  tags: ["legendary", "commander", "deathtouch", "cloak engine"],
  rulings: [
   { q: "Does she trigger once per Assassin or once per player?", a: "Once per Assassin. Three Assassins that deal combat damage to the same opponent give three triggers, and each one cloaks the top card of that player's library." },
   { q: "Who owns a card I cloak from an opponent's library?", a: "The opponent still owns it. You control it while it's on the battlefield. If it leaves the battlefield it's revealed and goes to its owner's graveyard, hand or library, and if that player leaves the game, the card leaves with them." },
   { q: "What does her granted ability do with each kind of card?", a: "It uses the stack. If the face-down card is a permanent card (creature, artifact, enchantment or land), it turns face up and stays on the battlefield. If it's an instant or sorcery, it can't be turned face up, so you exile it and may cast it right away without paying its mana cost. X in its cost is 0, and you still have to pay any additional costs and choose legal targets." },
   { q: "Does turning a card face up count as it entering the battlefield?", a: "No. Enters triggers and 'as this enters' choices don't happen. 'When this is turned face up' abilities, like <i-c>Kheru Spellsnatcher</i-c>'s, do trigger." }
  ],
  tips: [
   "A cloaked creature card can still turn face up the normal way, for its mana cost, as a special action. Use her {2}{U}{B} ability for noncreature cards, or when the mana cost is higher.",
   "With <i-c>Training Grounds</i-c> her granted ability costs {U}{B}. <i-c>Omen Hawker</i-c>'s restricted mana can help pay it.",
   "Attack the opponent whose library has the best cards: you are drafting from their deck."
  ],
  combos: ["Roshan, Hidden Magister", "Maskwood Nexus", "Spark Double", "Training Grounds", "Wound Reflection"]
 },
 "Access Tunnel": {
  rating: 3,
  when: "Mid to late game",
  tags: ["utility land", "colorless"],
  rulings: [
   { q: "When is the power checked?", a: "When you activate it and again when the ability resolves. If the creature has more than 3 power at resolution, the ability does nothing. Pumping it afterward is fine." },
   { q: "Can I use it after blockers are declared?", a: "It works, but it's too late: 'can't be blocked' only matters before blockers are declared. Use it in your main phase or at the beginning of combat." }
  ],
  tips: [
   "With Ramses out, Unstoppable Slasher is a 3/4, still a legal target."
  ],
  combos: ["Unstoppable Slasher", "Omen Hawker"]
 },
 "An Offer You Can't Refuse": {
  rating: 3,
  when: "Instant speed, against wipes and combos",
  tags: ["counterspell", "1 mana"],
  rulings: [
   { q: "Who gets the Treasures?", a: "The controller of the countered spell. If you counter your own spell, you get them." },
   { q: "Can it counter a face-down morph spell?", a: "No. A face-down spell is a creature spell." }
  ],
  tips: [
   "Countering a board wipe with one mana while keeping your board is the best use."
  ],
  combos: ["Counterspell"]
 },
 "Aqueous Form": {
  rating: 3,
  when: "Turns 2-4",
  tags: ["aura", "unblockable", "scry"],
  rulings: [
   { q: "What happens to the Aura if I put it on a card I cloaked from an opponent and that card leaves?", a: "The Aura goes to your graveyard, since you own it. The creature card goes to its owner." },
   { q: "When does the scry happen?", a: "When the creature attacks, before blockers. It helps set up your next draw." }
  ],
  tips: [
   "It's a fine target for a cloak made by Etrata once you have a type enabler: an unblockable face-down Assassin cloaks every turn."
  ],
  combos: ["Unstoppable Slasher", "Desmond Miles"]
 },
 "Arcane Adaptation": {
  rating: 4,
  when: "Turns 3-5, before combat",
  tags: ["type enabler", "enchantment"],
  rulings: [
   { q: "Do face-down creatures become Assassins?", a: "Yes. Face-down creatures have no creature types, but this effect adds Assassin on top of that, so they trigger <i-c>Etrata, Deadly Fugitive</i-c>." },
   { q: "What if I turn a cloaked Arcane Adaptation face up?", a: "Nothing is chosen, because turning face up isn't entering the battlefield. It stays on the battlefield naming no type." },
   { q: "Does it affect creatures I cloaked from opponents?", a: "Yes. It affects creatures you control, whoever owns them." }
  ],
  tips: [
   "With Ramses out, every creature you control is an Assassin, so the whole team gets +1/+1."
  ],
  combos: ["Etrata, Deadly Fugitive", "Ramses, Assassin Lord", "Desmond Miles"]
 },
 "Arcane Denial": {
  rating: 3,
  when: "Instant speed",
  tags: ["counterspell", "hard counter"],
  rulings: [
   { q: "When do the draws happen?", a: "At the beginning of the next turn's upkeep, whoever's turn it is. The caster chooses to draw zero, one or two cards." },
   { q: "Can I use it on my own spell?", a: "Yes, but you give yourself up to three cards for a spell you lost, which is rarely worth it." }
  ],
  tips: [
   "Prefer it late in the game, when the cards you give away matter less than the spell you stop."
  ],
  combos: ["Counterspell"]
 },
 "Arcane Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "What colors does it make?", a: "Blue or black, the colors of your commander's color identity. It can't make colorless." }
  ],
  tips: [
   "It's an artifact, so casting it triggers <i-c>Basim Ibn Ishaq</i-c>."
  ],
  combos: ["Basim Ibn Ishaq"]
 },
 "Aven Heartstabber": {
  rating: 3,
  when: "Turn 2",
  tags: ["2-drop", "flying", "native assassin"],
  rulings: [
   { q: "Do lands count as a mana value?", a: "Yes. Lands have mana value 0, and 0 counts as one of the five values." },
   { q: "Is the +2/+2 checked all the time?", a: "Yes. It's a static ability. If a card leaves your graveyard and you drop below five values, it shrinks right away." }
  ],
  tips: [
   "Consider and Frantic Search put different mana values into your graveyard early, which turns on the +2/+2 sooner."
  ],
  combos: ["Etrata, Deadly Fugitive"]
 },
 "Basim Ibn Ishaq": {
  rating: 4,
  when: "Turn 2",
  tags: ["legendary", "2-drop", "native assassin", "card draw"],
  rulings: [
   { q: "Which spells are historic?", a: "Artifacts, legendary spells and Sagas. Your mana rocks, Equipment, <i-c>Universal Automaton</i-c> and your legendary creatures all count." },
   { q: "Does the trigger work on opponents' turns?", a: "Yes, but only once each turn, and 'can't be blocked' only matters on your turn. Save your historic spell for your own main phase when you can." }
  ],
  tips: [
   "A spell you cast from exile with Etrata's ability counts if it's historic."
  ],
  combos: ["Brotherhood Spy", "Universal Automaton"]
 },
 "Boggart Trawler // Boggart Bog": {
  rating: 2,
  when: "Early as a land, or when a graveyard matters",
  tags: ["mdfc", "graveyard hate", "land"],
  rulings: [
   { q: "Is it a land in my library or hand?", a: "No. Only the front face counts in other zones, so it's a creature card with mana value 3. It only becomes a land if you play the back face." },
   { q: "What happens if Etrata cloaks it and I turn it face up?", a: "It turns up as Boggart Trawler, a 3/1. You can do that for its mana cost {2}{B}. No graveyard is exiled, because it didn't enter." }
  ],
  tips: [
   "Count it as half a land when you judge an opening hand: it's an extra land only if you need it to be."
  ],
  combos: ["Bojuka Bog"]
 },
 "Bojuka Bog": {
  rating: 2,
  when: "When a graveyard matters",
  tags: ["land", "graveyard hate"],
  rulings: [
   { q: "Does it exile a graveyard if Etrata cloaks it and I turn it face up?", a: "No. Turning face up isn't entering, so there's no trigger." }
  ],
  tips: [
   "Hold it until a graveyard is worth exiling, if you can afford to."
  ]
 },
 "Brotherhood Spy": {
  rating: 4,
  when: "Turn 2",
  tags: ["2-drop", "native assassin", "unblockable"],
  rulings: [
   { q: "Do changelings or face-down Assassins count as the legendary Assassin?", a: "No. The Assassin has to be legendary. Face-down creatures are never legendary and changelings here aren't legendary either." },
   { q: "What if the legend leaves before the trigger resolves?", a: "The trigger checks both when combat begins and when it resolves. If you no longer control a legendary Assassin, you get nothing." }
  ],
  tips: [
   "Six legendary Assassins turn it on: Etrata, Desmond, Basim, Ramses, Roshan and Etrata, the Silencer."
  ],
  combos: ["Etrata, Deadly Fugitive"]
 },
 "Changeling Outcast": {
  rating: 5,
  when: "Turn 1-2",
  tags: ["1-drop", "changeling", "unblockable"],
  rulings: [
   { q: "Is it an Assassin for Ramses and Etrata?", a: "Yes. Changeling makes it every creature type in every zone, so it also counts for <i-c>Desmond Miles</i-c> and <i-c>Path of Ancestry</i-c>." },
   { q: "Can it block if an effect would force it to?", a: "No. 'Can't block' wins." }
  ],
  tips: [
   "With Ramses out it's a 2/2 unblockable Assassin, so it also attacks the opponent you plan to eliminate for Ramses's win."
  ],
  combos: ["Strixhaven Stadium", "Mindcrank", "Ramses, Assassin Lord"]
 },
 "Choked Estuary": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "reveal land"],
  rulings: [
   { q: "Does Sunken Hollow count as an Island card to reveal?", a: "Yes. It has both land types." }
  ],
  tips: [
   "Keep a basic in hand if you want it to enter untapped later."
  ]
 },
 "Chthonian Nightmare": {
  rating: 2,
  when: "Mid game, sorcery speed",
  tags: ["recursion", "energy"],
  rulings: [
   { q: "Can I sacrifice a creature and return that same creature?", a: "No. You choose the target before paying costs, so the target must already be in your graveyard." },
   { q: "Can I return a card I cloaked from an opponent?", a: "No. It only returns a creature card from your graveyard. A card you own from an opponent's library goes to their graveyard when it dies." },
   { q: "Does unused energy stay?", a: "Yes. Energy counters stay on you until you spend them, so a second cast adds three more." }
  ],
  tips: [
   "Sacrificing an opponent-owned cloak puts a card into their graveyard, which counts for Duskmantle Guildmage's first ability."
  ],
  combos: ["Unstoppable Slasher", "Duskmantle Guildmage"]
 },
 "Command Tower": {
  rating: 4,
  when: "Any turn",
  tags: ["land", "fixing"],
  rulings: [
   { q: "What does it make?", a: "One mana of any color in your commander's color identity: blue or black." }
  ],
  tips: [
   "Play it early for untapped fixing."
  ]
 },
 "Consider": {
  rating: 2,
  when: "Any turn, instant speed",
  tags: ["cantrip", "surveil"],
  rulings: [
   { q: "Can I surveil the card into the graveyard and then draw the next one?", a: "Yes. Surveil happens first, then you draw." }
  ],
  tips: [
   "The binned card adds a mana value to your graveyard for Aven Heartstabber."
  ],
  combos: ["Aven Heartstabber"]
 },
 "Counterspell": {
  rating: 4,
  when: "Instant speed",
  tags: ["counterspell", "hard counter"],
  rulings: [
   { q: "Can it counter an ability, like a triggered ability?", a: "No. It only counters spells." }
  ],
  tips: [
   "Scroll of Fate can manifest it. Etrata's ability then exiles it and lets you cast it free in response to a spell."
  ],
  combos: ["Scroll of Fate"]
 },
 "Cover of Darkness": {
  rating: 3,
  when: "Turns 3-5, before combat",
  tags: ["evasion", "enchantment"],
  rulings: [
   { q: "Do face-down creatures get fear?", a: "Only if they're Assassins, which needs Roshan, Maskwood Nexus, Arcane Adaptation or Leyline of Transformation." },
   { q: "Can face-down creatures block a creature with fear?", a: "No. Face-down creatures are colorless and aren't artifacts." }
  ],
  tips: [
   "Unstoppable Slasher with fear often only has to get past one or two possible blockers."
  ],
  combos: ["Unstoppable Slasher", "Maskwood Nexus"]
 },
 "Cryptic Coat": {
  rating: 4,
  when: "Turn 3 onward",
  tags: ["equipment", "cloak", "unblockable", "historic"],
  rulings: [
   { q: "Can I move it with an equip cost?", a: "No. It has no equip ability. It stays on the cloak until you return it to your hand or the creature leaves." },
   { q: "What if the cloaked card is a creature?", a: "You can turn it face up for its mana cost any time. The Coat stays attached." },
   { q: "Does Training Grounds reduce the {1}{U}?", a: "No. It's an ability of an artifact, not of a creature." }
  ],
  tips: [
   "Omen Hawker's mana can pay the {1}{U} return cost, because that's an activated ability."
  ],
  combos: ["They Came from the Pipes", "Glitch Interpreter", "Basim Ibn Ishaq"]
 },
 "Cursed Windbreaker": {
  rating: 3,
  when: "Turn 3 onward",
  tags: ["equipment", "manifest dread", "flying"],
  rulings: [
   { q: "Does the manifested creature have ward?", a: "No. Only cloaked creatures get ward {2}. A manifested creature is a plain face-down 2/2." },
   { q: "Can the card I put face down be a land?", a: "Yes. Any card can be manifested. Only a creature card can turn face up for its mana cost; for other permanent cards use Etrata's ability." }
  ],
  tips: [
   "The card sent to the graveyard adds a mana value for Aven Heartstabber."
  ],
  combos: ["They Came from the Pipes", "Aven Heartstabber"]
 },
 "Dark Ritual": {
  rating: 2,
  when: "Early burst or kill turn",
  tags: ["ritual", "instant speed"],
  rulings: [
   { q: "Does the mana last?", a: "No. Mana empties at the end of each step and phase, so spend it in the same phase." }
  ],
  tips: [
   "Turn 2 with an Island and a Swamp: Ritual plus the Island casts Etrata with {B} left for a one-drop."
  ],
  combos: ["Etrata, Deadly Fugitive"]
 },
 "Darkslick Shores": {
  rating: 3,
  when: "Turns 1-3",
  tags: ["land", "fastland"],
  rulings: [
   { q: "When does it enter tapped?", a: "When you control three or more other lands." }
  ],
  tips: [
   "Prioritize it early."
  ]
 },
 "Darkwater Catacombs": {
  rating: 2,
  when: "Turn 2 onward",
  tags: ["land", "filter"],
  rulings: [
   { q: "Can it make mana by itself?", a: "No. It needs {1} from another source." },
   { q: "Can Omen Hawker's mana pay the {1}?", a: "Yes. It's an activated mana ability." }
  ],
  tips: [
   "Don't play it as your first land."
  ],
  combos: ["Omen Hawker"]
 },
 "Desmond Miles": {
  rating: 3,
  when: "Turn 2",
  tags: ["legendary", "menace", "native assassin", "surveil"],
  rulings: [
   { q: "Do face-down creatures count as other Assassins?", a: "Only with a type enabler such as <i-c>Roshan, Hidden Magister</i-c> or <i-c>Maskwood Nexus</i-c>." },
   { q: "Do creature cards in my graveyard count?", a: "Assassin cards do: your native Assassins and changelings. <i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c> and the Assassin-naming enchantments make every creature card you own in the graveyard an Assassin too." }
  ],
  tips: [
   "The surveil is equal to the damage dealt, so a big Desmond can dig deep for a finisher."
  ],
  combos: ["Maskwood Nexus", "Roshan, Hidden Magister"]
 },
 "Dimir Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "Does it add mana if it's my only mana source?", a: "No. It needs {1} from another source, so it nets one extra mana." },
   { q: "Can Omen Hawker's mana pay the {1}?", a: "Yes, a mana ability is an activated ability. The {U}{B} it makes has no restriction." }
  ],
  tips: [
   "It's an artifact, so casting it triggers Basim Ibn Ishaq."
  ],
  combos: ["Omen Hawker"]
 },
 "Dispel": {
  rating: 2,
  when: "Protecting your key turn",
  tags: ["counterspell", "1 mana"],
  rulings: [
   { q: "Can it stop a sorcery board wipe?", a: "No. It only counters instant spells." }
  ],
  tips: [
   "A lot of single-target removal is instant speed, so it hits more than it looks."
  ],
  combos: ["Counterspell"]
 },
 "Drowned Catacomb": {
  rating: 3,
  when: "Turn 2 onward",
  tags: ["land", "checkland"],
  rulings: [
   { q: "Does Sunken Hollow turn it on?", a: "Yes. Sunken Hollow is an Island and a Swamp." }
  ],
  tips: [
   "On turn 1 it enters tapped. Play a basic first when you can."
  ],
  combos: ["Sunken Hollow"]
 },
 "Duskmantle Guildmage": {
  rating: 4,
  when: "Turn you go for the win",
  tags: ["combo piece", "instant speed", "2-drop"],
  rulings: [
   { q: "Does the effect end if Guildmage dies?", a: "No. Once the first ability resolves, the effect lasts for the rest of the turn even if Guildmage leaves the battlefield." },
   { q: "What starts the loop?", a: "Any card going to an opponent's graveyard, or any life loss with <i-c>Mindcrank</i-c> out: combat damage, the Guildmage's second ability, a creature they own dying under your control, or them casting an instant." },
   { q: "Does an empty library make them lose?", a: "Not right away. Milling from an empty library does nothing, so the loop stops. They lose later when they would draw from it, unless their life reached 0 first." },
   { q: "Does it hit every opponent?", a: "The effect covers all opponents, but each one needs their own starter event to begin their own loop." }
  ],
  tips: [
   "Activate the first ability in your first main phase, then attack with Changeling Outcast: one point of damage starts the loop.",
   "Ramses turns one player losing to 0 life into a win for you, if that player was attacked by one of your Assassins this turn.",
   "You can activate it at instant speed, for example at the end of an opponent's turn when they are about to lose life anyway."
  ],
  combos: ["Mindcrank", "Ramses, Assassin Lord", "Changeling Outcast", "Training Grounds"]
 },
 "Etrata, the Silencer": {
  rating: 4,
  when: "Turns 4-6",
  tags: ["legendary", "unblockable", "alternate win"],
  rulings: [
   { q: "When is the three-card check made?", a: "Only while her trigger resolves. The player loses if at that moment they own three or more exiled cards with hit counters." },
   { q: "Do tokens count?", a: "No. A token exiled this way stops existing, so it isn't a card with a hit counter." },
   { q: "Do hit counters from Ravenloft Adventurer count?", a: "Yes. Any exiled card that player owns with a hit counter counts, whatever put the counter there." },
   { q: "How does March of Swirling Mist save her?", a: "Cast it in response to her trigger and phase her out. The trigger still exiles its target, but she's treated as though she doesn't exist, so she can't be shuffled. She phases back in during your next untap step." }
  ],
  tips: [
   "Ramses turns the player's loss into your win if they were attacked by one of your Assassins this turn, and Silencer herself is one.",
   "Even without the alternate win, she's repeatable creature removal."
  ],
  combos: ["March of Swirling Mist", "Ravenloft Adventurer", "Ramses, Assassin Lord"]
 },
 "Exotic Orchard": {
  rating: 2,
  when: "Any turn",
  tags: ["land", "fixing"],
  rulings: [
   { q: "What if no opponent has lands yet?", a: "It makes no mana. On turn 1, it may make nothing if you play first." }
  ],
  tips: [
   "Play a basic first if you're the first player."
  ],
  combos: ["Fellwar Stone"]
 },
 "Feed the Swarm": {
  rating: 2,
  when: "Sorcery speed",
  tags: ["removal", "enchantment answer"],
  rulings: [
   { q: "What if the target is gone?", a: "The spell doesn't resolve and you lose no life." },
   { q: "How much life do I lose for a token?", a: "A token that isn't a copy has no mana cost, so you lose 0. A token copy has the mana cost of what it copies, so you lose that much." }
  ],
  tips: [
   "It can't hit your own permanents."
  ],
  combos: ["Infernal Grasp"]
 },
 "Fellwar Stone": {
  rating: 2,
  when: "Turn 2",
  tags: ["mana rock"],
  rulings: [
   { q: "What if no opponent's land makes a color?", a: "Then it can only make the types those lands could make, which may be only {C}, or nothing at all." }
  ],
  tips: [
   "It looks at lands opponents control right now, not at their deck."
  ],
  combos: ["Exotic Orchard"]
 },
 "Frantic Search": {
  rating: 2,
  when: "Mid game",
  tags: ["filtering", "instant speed"],
  rulings: [
   { q: "Can I untap lands I tapped to cast it?", a: "Yes. That's how it becomes free." }
  ],
  tips: [
   "It fills your graveyard with different mana values for Aven Heartstabber."
  ],
  combos: ["Aven Heartstabber"]
 },
 "Gix, Yawgmoth Praetor": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["legendary", "card draw"],
  rulings: [
   { q: "Does it trigger per creature or per player?", a: "Per creature. Three creatures that connect give three triggers, each costing 1 life." },
   { q: "Do opponents' creatures trigger it?", a: "Yes, when they deal combat damage to one of your opponents, so an opponent attacking another opponent can draw too. Damage dealt to you doesn't trigger it." },
   { q: "Can Training Grounds reduce his second ability?", a: "Yes. It's an activated ability of a creature, so it costs {2}{B}{B}{B} plus discarding X cards." }
  ],
  tips: [
   "The second ability exiles cards, it doesn't mill, so it doesn't feed Mindcrank or the Guildmage."
  ],
  combos: ["Training Grounds", "Changeling Outcast"]
 },
 "Glitch Interpreter": {
  rating: 3,
  when: "Turns 3-4",
  tags: ["manifest dread", "card draw"],
  rulings: [
   { q: "Does it bounce if I control a face-down permanent?", a: "No. The trigger only happens if you control none, and it checks again when it resolves." },
   { q: "How many cards do I draw if several colorless creatures connect?", a: "One card per player damaged. Three colorless creatures hitting the same player draw one card. Hitting two different players draws two." }
  ],
  tips: [
   "Universal Automaton is colorless too, so it counts before you have any face-down creatures."
  ],
  combos: ["They Came from the Pipes", "Universal Automaton"]
 },
 "Grazilaxx, Illithid Scholar": {
  rating: 3,
  when: "Turns 3-5",
  tags: ["legendary", "card draw"],
  rulings: [
   { q: "How many cards do I draw per combat?", a: "One per player damaged in a combat damage step. Three creatures hitting the same player draw one card. One each at three players draws three." },
   { q: "What happens if I bounce a face-down creature?", a: "It's revealed and goes to its owner's hand. A card you cloaked from your own library comes back to your hand as a normal card." }
  ],
  tips: [
   "Bouncing Unstoppable Slasher resets it: you can recast it later with its death trigger ready."
  ],
  combos: ["Reconnaissance Mission", "Gix, Yawgmoth Praetor"]
 },
 "Hookblade Veteran": {
  rating: 3,
  when: "Turn 1-2",
  tags: ["1-drop", "native assassin", "flying"],
  rulings: [
   { q: "Can it block fliers?", a: "No. It only has flying during your turn, so on opponents' turns it blocks like a creature without flying." }
  ],
  tips: [
   "Ramses makes it a 2/3 flier on your turn."
  ],
  combos: ["Etrata, Deadly Fugitive"]
 },
 "Infernal Grasp": {
  rating: 4,
  when: "Instant speed",
  tags: ["removal", "unconditional"],
  rulings: [
   { q: "Does it hit indestructible creatures?", a: "No. Destroy doesn't work on indestructible creatures. Use Reality Shift instead." }
  ],
  tips: [
   "With Ravenloft Adventurer out, the creature is exiled with a hit counter instead."
  ],
  combos: ["Ravenloft Adventurer"]
 },
 "Key to the City": {
  rating: 3,
  when: "Turn 2 onward",
  tags: ["unblockable", "card draw", "historic"],
  rulings: [
   { q: "Can I pay the {2} draw with Omen Hawker's mana?", a: "No. That's a triggered ability, not an activated one." },
   { q: "When do I pay the {2}?", a: "It usually untaps in your untap step. The trigger goes on the stack at the start of your upkeep, and you pay the {2} as it resolves." }
  ],
  tips: [
   "'Up to one target' means you can tap it with no target just to set up the untap draw."
  ],
  combos: ["Unstoppable Slasher"]
 },
 "Kheru Spellsnatcher": {
  rating: 3,
  when: "Face down from turn 3",
  tags: ["morph", "counterspell", "steal"],
  rulings: [
   { q: "Does the trigger work if I turn it up with Etrata's ability?", a: "Yes. 'When this creature is turned face up' triggers however it turns face up." },
   { q: "Can I turn it face up in response to a split second spell?", a: "With morph, yes: it's a special action. Etrata's ability is an activated ability, so it can't be activated while a split second spell is on the stack." },
   { q: "When can I cast the stolen spell?", a: "Any time it's still exiled, following its normal timing rules. A creature or sorcery waits for your main phase with an empty stack." }
  ],
  tips: [
   "If Etrata cloaks it from your library, you can turn it up for its mana cost {3}{U} or its morph cost."
  ],
  combos: ["Etrata, Deadly Fugitive", "Training Grounds"]
 },
 "Leyline of Transformation": {
  rating: 4,
  when: "Opening hand, or turns 4-5",
  tags: ["type enabler", "leyline"],
  rulings: [
   { q: "When do I choose the creature type if it starts on the battlefield?", a: "As it's put onto the battlefield before the game begins. Choose Assassin." },
   { q: "Does it count for Path of Ancestry's scry?", a: "Yes. Your creature spells are Assassins too, so every creature spell shares a type with Etrata." }
  ],
  tips: [
   "Check for it every time you look at an opening seven, including after the free mulligan."
  ],
  combos: ["Etrata, Deadly Fugitive", "Path of Ancestry"]
 },
 "March of Swirling Mist": {
  rating: 3,
  when: "Instant speed",
  tags: ["protection", "phasing"],
  rulings: [
   { q: "Do phased-out creatures leave the battlefield?", a: "No. They're treated as though they don't exist until they phase in during their controller's next untap step. No leave or enter triggers happen." },
   { q: "Can I use it on opponents' creatures?", a: "Yes. Phasing out their blockers on your turn keeps them away until their next untap step." },
   { q: "What if Etrata's ability exiles it from a face-down card and I cast it free?", a: "X is 0, so it phases out nothing. Don't count on it that way." }
  ],
  tips: [
   "With Etrata, the Silencer: phase her out in response to her own trigger. The creature is still exiled, and she isn't shuffled away."
  ],
  combos: ["Etrata, the Silencer"]
 },
 "Mask of Memory": {
  rating: 2,
  when: "Turn 2 onward",
  tags: ["equipment", "card filtering"],
  rulings: [
   { q: "Is it optional?", a: "Yes. If you don't draw, you don't discard." }
  ],
  tips: [
   "Omen Hawker's mana can pay the equip {1}."
  ],
  combos: ["Changeling Outcast"]
 },
 "Maskwood Nexus": {
  rating: 4,
  when: "Turns 4-5",
  tags: ["type enabler", "artifact", "historic"],
  rulings: [
   { q: "Do face-down creatures become Assassins?", a: "Yes. They get every creature type while you control them." },
   { q: "Does Training Grounds reduce the token ability?", a: "No. Maskwood Nexus is an artifact, not a creature." }
  ],
  tips: [
   "It also makes every creature card in your graveyard an Assassin for Desmond Miles."
  ],
  combos: ["Etrata, Deadly Fugitive", "Desmond Miles"]
 },
 "Mind Stone": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "cantrip"],
  rulings: [
   { q: "Can I tap it for mana and sacrifice it in the same turn?", a: "No. Both abilities need {T}. Choose one." }
  ],
  tips: [
   "Omen Hawker's mana can pay the {1} to sacrifice it."
  ],
  combos: ["Omen Hawker"]
 },
 "Mindcrank": {
  rating: 4,
  when: "Before your combo turn",
  tags: ["combo piece", "mill"],
  rulings: [
   { q: "Does paying life count?", a: "Yes. Paying life is losing life, so an opponent who pays life mills that many cards." },
   { q: "What happens when the library runs out?", a: "The loop stops, because milling from an empty library puts nothing into the graveyard. The player only loses the next time they would draw, unless their life is already 0." },
   { q: "Example: an opponent has 40 life and two cards in their library. Changeling Outcast hits them for 1. What happens?", a: "They go to 39 and mill 1, lose 1, mill the last card, lose 1 more. They end at 37 life with an empty library. They lose when they next draw, not right away." }
  ],
  tips: [
   "With Unstoppable Slasher, the half-life loss mills that many cards too."
  ],
  combos: ["Duskmantle Guildmage", "Unstoppable Slasher"]
 },
 "Mothdust Changeling": {
  rating: 3,
  when: "Turn 1-2",
  tags: ["1-drop", "changeling"],
  rulings: [
   { q: "Can I tap a creature that entered this turn to pay the cost?", a: "Yes. The cost isn't that creature's own {T} ability, so summoning sickness doesn't stop it." },
   { q: "Can it tap itself?", a: "Yes, but then it's tapped and can't attack. Use another creature." }
  ],
  tips: [
   "Give it flying before blockers are declared, ideally at the beginning of combat or in your main phase."
  ],
  combos: ["Etrata, Deadly Fugitive"]
 },
 "Night's Whisper": {
  rating: 2,
  when: "Turns 2-4",
  tags: ["card draw"],
  rulings: [
   { q: "Can I target an opponent?", a: "No. You draw and you lose the life." }
  ],
  tips: [
   "Watch your life: Gix, Talisman and Underground River also cost life."
  ]
 },
 "Omen Hawker": {
  rating: 3,
  when: "Turn 1-2",
  tags: ["mana dork", "restricted mana"],
  rulings: [
   { q: "Can its mana pay Etrata's granted {2}{U}{B} ability?", a: "Yes, that's an activated ability. The {C} and {U} pay part of it, and you need {B} from somewhere else." },
   { q: "Can it pay for casting a morph face down, or turning one face up?", a: "No. Casting is not an activated ability, and turning face up for a morph or mana cost is a special action." },
   { q: "Can it pay Key to the City's untap draw?", a: "No. That's a triggered ability, not an activated one." }
  ],
  tips: [
   "With Training Grounds, Etrata's ability costs {U}{B}: Hawker's {U} covers the blue, but its {C} can't pay the {B}."
  ],
  combos: ["Dimir Signet", "Duskmantle Guildmage", "Etrata, Deadly Fugitive"]
 },
 "Path of Ancestry": {
  rating: 2,
  when: "Early",
  tags: ["land", "scry"],
  rulings: [
   { q: "Which spells share a type with Etrata?", a: "Vampires and Assassins, plus changelings. With Roshan, Maskwood Nexus or an Assassin-naming enchantment out, all your creature spells are Assassins." }
  ],
  tips: [
   "Best on turn 1 or 2, when entering tapped costs least."
  ]
 },
 "Plumb the Forbidden": {
  rating: 3,
  when: "In response to removal",
  tags: ["instant speed", "sacrifice"],
  rulings: [
   { q: "When do the creatures leave?", a: "They're sacrificed as you cast it. Removal already aimed at them loses its target." },
   { q: "Are the copies cast?", a: "No. They don't trigger 'whenever you cast' abilities like Basim's." }
  ],
  tips: [
   "Sacrificing Unstoppable Slasher with no counters on it brings it back tapped with stun counters, and you still draw."
  ],
  combos: ["Unstoppable Slasher"]
 },
 "Preordain": {
  rating: 3,
  when: "Turn 1-2",
  tags: ["cantrip", "scry"],
  rulings: [
   { q: "Can I put both cards on the bottom?", a: "Yes. You can put any number on the bottom and the rest back on top in any order." }
  ],
  tips: [
   "It's a sorcery: cast it in your main phase before you play your land."
  ]
 },
 "Ramses, Assassin Lord": {
  rating: 5,
  when: "Turns 4-6, before the kill turn",
  tags: ["legendary", "lord", "deathtouch", "win condition"],
  rulings: [
   { q: "Does the Assassin need to deal damage?", a: "No. It only needs to have attacked that player this turn." },
   { q: "Does Ramses need to be out when I attack?", a: "No. He needs to be on the battlefield when the player loses. The attacking Assassin just has to be one you controlled." },
   { q: "Does it work if the player loses on their own turn from drawing from an empty library?", a: "Usually not: you can't attack them on their turn, so they weren't attacked this turn by your Assassin." }
  ],
  tips: [
   "His +1/+1 changes the Slasher math: a 3/4 Slasher takes a player from 40 to 37, then to 18.",
   "With a type enabler, every creature you control is an Assassin, so the whole board gets +1/+1."
  ],
  combos: ["Strixhaven Stadium", "Unstoppable Slasher", "Wound Reflection", "Duskmantle Guildmage", "Mindcrank"]
 },
 "Ravenloft Adventurer": {
  rating: 3,
  when: "Turns 4-5",
  tags: ["initiative", "hit counters", "native assassin"],
  rulings: [
   { q: "Which dying creatures get hit counters?", a: "Only creatures an opponent controls. Your own creatures die normally, including cards you took from opponents." },
   { q: "Do tokens get hit counters?", a: "A token is exiled instead of dying, but tokens stop existing in exile, so there's no card with a hit counter to count." },
   { q: "When does the attack trigger do anything?", a: "Only if you've completed a dungeon. Then the defending player loses 1 life for each card they own in exile with a hit counter." }
  ],
  tips: [
   "Your removal spells and deathtouch blockers all create hit-counter cards while it's out."
  ],
  combos: ["Etrata, the Silencer"]
 },
 "Reality Shift": {
  rating: 3,
  when: "Instant speed",
  tags: ["removal", "exile", "manifest"],
  rulings: [
   { q: "Can the opponent turn the manifested card face up?", a: "Yes, if it's a creature card: for its mana cost, any time." },
   { q: "Does the manifested creature have ward?", a: "No. Manifest doesn't give ward." }
  ],
  tips: [
   "Against a commander, they can put it into the command zone. It still removes it for now and makes them pay tax."
  ]
 },
 "Reconnaissance Mission": {
  rating: 3,
  when: "Turns 4-5",
  tags: ["card draw", "cycling"],
  rulings: [
   { q: "Is it per creature?", a: "Yes. Each creature that deals combat damage to a player gives its own trigger." },
   { q: "Can Omen Hawker pay for cycling?", a: "Yes. Cycling is an activated ability, even from your hand." }
  ],
  tips: [
   "It stacks with Gix: each connecting creature can draw two."
  ],
  combos: ["Gix, Yawgmoth Praetor"]
 },
 "River of Tears": {
  rating: 2,
  when: "Any turn",
  tags: ["land"],
  rulings: [
   { q: "What does it make on opponents' turns?", a: "Only {U}, because you can't play a land on their turn." }
  ],
  tips: [
   "Leave it for blue instants on other turns."
  ]
 },
 "Rogue's Passage": {
  rating: 3,
  when: "Late game",
  tags: ["land", "utility"],
  rulings: [
   { q: "Can Omen Hawker help pay?", a: "Yes. It's an activated ability." }
  ],
  tips: [
   "It gets Ramses or a pumped Desmond through, which Access Tunnel can't."
  ],
  combos: ["Unstoppable Slasher"]
 },
 "Roshan, Hidden Magister": {
  rating: 5,
  when: "Turns 4-5",
  tags: ["legendary", "type enabler", "card draw"],
  rulings: [
   { q: "Are face-down creatures Assassins with Roshan out?", a: "Yes. His effect adds Assassin to other creatures you control, face-down ones included." },
   { q: "Does turning face up with any method draw?", a: "Yes. The normal special action, morph, and Etrata's ability all count. You draw a card and lose 1 life." },
   { q: "Does he affect creature cards in my graveyard?", a: "Yes, creature cards you own outside the battlefield are Assassins too, which grows <i-c>Desmond Miles</i-c>." }
  ],
  tips: [
   "He's the best removal target on your board. Keep protection up the turn you cast him."
  ],
  combos: ["Etrata, Deadly Fugitive", "Desmond Miles", "Kheru Spellsnatcher"]
 },
 "Scroll of Fate": {
  rating: 3,
  when: "Turn 3 onward",
  tags: ["manifest", "artifact", "historic"],
  rulings: [
   { q: "Can I manifest a noncreature card?", a: "Yes, any card. It can only turn face up for its mana cost if it's a creature card. Etrata's ability turns up other permanent cards, or exiles an instant or sorcery and lets you cast it free." },
   { q: "Can I use it the turn it enters?", a: "Yes. It's an artifact, so summoning sickness doesn't apply." }
  ],
  tips: [
   "Manifest a counterspell, then use Etrata's ability in response to an opponent's spell: the card is exiled and you cast it free while the ability resolves.",
   "Manifesting Wound Reflection lets you flip it for {2}{U}{B}, or {U}{B} with Training Grounds, instead of paying six."
  ],
  combos: ["Wound Reflection", "They Came from the Pipes"]
 },
 "Silent Hallcreeper": {
  rating: 2,
  when: "Turn 2",
  tags: ["unblockable", "copy"],
  rulings: [
   { q: "What does it keep after copying?", a: "Its counters, Auras and Equipment stay. It loses its own abilities, including 'can't be blocked', and becomes a copy of the target." },
   { q: "Does the copy trigger for the damage that caused it?", a: "No. Copied abilities don't trigger for damage already dealt." }
  ],
  tips: [
   "Copying Unstoppable Slasher gives you a second one, but with counters on it, it won't come back when it dies."
  ],
  combos: ["Unstoppable Slasher"]
 },
 "Sol Ring": {
  rating: 5,
  when: "Turn 1",
  tags: ["mana rock", "artifact"],
  rulings: [
   { q: "Does it help cast Etrata?", a: "It pays the {1} but not the {U}{B}. You still need blue and black from other sources." }
  ],
  tips: [
   "It's a prime removal target. That's fine: it already did its job."
  ],
  combos: ["Maskwood Nexus"]
 },
 "Spark Double": {
  rating: 4,
  when: "Turns 4-6",
  tags: ["clone", "not legendary"],
  rulings: [
   { q: "How many triggers do I get with two Etratas?", a: "Twice as many. Each Etrata triggers for each Assassin that deals combat damage to an opponent, so three connecting Assassins give six cloaks." },
   { q: "Is the copy an Assassin?", a: "Yes. It copies Etrata's types, Vampire Assassin, and enters with an extra +1/+1 counter, so it's a 2/5 with deathtouch." },
   { q: "What happens if I copy Unstoppable Slasher?", a: "The copy has a +1/+1 counter, so its return-when-it-dies trigger does nothing for it." }
  ],
  tips: [
   "Copying Ramses gives you two lords: your other Assassins get +2/+2, and each Ramses gets +1/+1 from the other."
  ],
  combos: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister"]
 },
 "Springleaf Drum": {
  rating: 2,
  when: "Turns 1-3",
  tags: ["mana", "fixing"],
  rulings: [
   { q: "Can I tap a creature that entered this turn?", a: "Yes. The cost is the Drum's, not the creature's {T} ability, so summoning sickness doesn't matter." },
   { q: "Can I tap a face-down creature I cloaked from an opponent?", a: "Yes. You control it, so it can pay the cost." }
  ],
  tips: [
   "Cast it with a one-drop creature on turn 1 for a strong turn 2."
  ],
  combos: ["Omen Hawker"]
 },
 "Strixhaven Stadium": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["mana rock", "alternate win"],
  rulings: [
   { q: "If tapping for mana brings it to ten, does anyone lose?", a: "No. The check is part of the combat damage trigger only. You need a creature to deal combat damage to an opponent." },
   { q: "Is the counter per creature or per player?", a: "Per creature. Each of your creatures that deals combat damage to an opponent triggers it once." },
   { q: "Which player loses?", a: "The opponent who was dealt damage by the creature whose trigger pushed the Stadium to ten or more." }
  ],
  tips: [
   "With Ramses out, and that opponent attacked by one of your Assassins this turn, their loss means you win the game."
  ],
  combos: ["Ramses, Assassin Lord", "Changeling Outcast"]
 },
 "Sunken Hollow": {
  rating: 3,
  when: "Turn 3 onward",
  tags: ["land", "typed dual"],
  rulings: [
   { q: "Does it count as a Swamp for Tainted Isle?", a: "Yes, and as an Island or Swamp for Drowned Catacomb and Choked Estuary." }
  ],
  tips: [
   "Play it early if tapped doesn't matter, or late when it's untapped."
  ],
  combos: ["Tainted Isle"]
 },
 "Supernatural Stamina": {
  rating: 3,
  when: "In response to removal",
  tags: ["protection", "instant speed"],
  rulings: [
   { q: "What if I use it on a face-down creature?", a: "If the card is a creature or other permanent card, it returns face up. If it's an instant or sorcery, it stays in the graveyard." },
   { q: "Does it work on my commander?", a: "Only if you leave Etrata in the graveyard when she dies. If you move her to the command zone, she doesn't return." }
  ],
  tips: [
   "It doesn't help against exile."
  ],
  combos: ["Ravenloft Adventurer"]
 },
 "Tainted Isle": {
  rating: 2,
  when: "Any turn",
  tags: ["land"],
  rulings: [
   { q: "Does it need a basic Swamp?", a: "No. Any land with the Swamp type works, including Sunken Hollow." }
  ],
  tips: [
   "Without a Swamp it only makes {C}."
  ],
  combos: ["Sunken Hollow"]
 },
 "Talisman of Dominance": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "Is the damage life loss for Mindcrank?", a: "It damages you, not an opponent, so Mindcrank doesn't care." }
  ],
  tips: [
   "It's an artifact, so it triggers Basim Ibn Ishaq."
  ],
  combos: ["Basim Ibn Ishaq"]
 },
 "They Came from the Pipes": {
  rating: 4,
  when: "Turns 5-6",
  tags: ["card draw", "manifest dread"],
  rulings: [
   { q: "Does it draw for its own two manifests?", a: "Yes. It's on the battlefield when its enters trigger resolves, so both face-down creatures entering trigger it." },
   { q: "Does turning a creature face up draw?", a: "No. Only a face-down creature entering does." },
   { q: "Do morph creatures cast face down draw?", a: "Yes. A morph cast face down enters as a face-down creature." }
  ],
  tips: [
   "Spread Etrata's triggers across players to keep drawing cards without running one library out."
  ],
  combos: ["Cryptic Coat", "Etrata, Deadly Fugitive"]
 },
 "Toxic Deluge": {
  rating: 3,
  when: "When behind on board",
  tags: ["board wipe", "flexible"],
  rulings: [
   { q: "Does it stop indestructible creatures?", a: "Yes. A creature with 0 or less toughness is put into the graveyard even if it's indestructible." },
   { q: "Does -X/-X last?", a: "Until end of turn. It only applies to creatures on the battlefield when it resolves." }
  ],
  tips: [
   "Phase out your key creatures with March of Swirling Mist first."
  ],
  combos: ["March of Swirling Mist"]
 },
 "Training Grounds": {
  rating: 4,
  when: "Turns 1-3",
  tags: ["cost reduction", "1-drop"],
  rulings: [
   { q: "Does it reduce Etrata's granted ability?", a: "Yes. The ability belongs to the face-down creature, so it's an activated ability of a creature you control. {2}{U}{B} becomes {U}{B}." },
   { q: "Does it reduce morph or turning up for mana cost?", a: "No. Those are special actions, not activated abilities." },
   { q: "Can it reduce colored mana?", a: "No. It only reduces generic mana, and never below one mana in total." }
  ],
  tips: [
   "Guildmage's first ability goes from {1}{U}{B} to {U}{B}: it only removes the {1}."
  ],
  combos: ["Etrata, Deadly Fugitive", "Duskmantle Guildmage"]
 },
 "Underground River": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "painland"],
  rulings: [
   { q: "Does it count as an Island or a Swamp?", a: "No. It has no land types." }
  ],
  tips: [
   "Tap for {C} when a generic cost lets you avoid the damage."
  ]
 },
 "Universal Automaton": {
  rating: 2,
  when: "Turn 1-2",
  tags: ["1-drop", "changeling", "artifact"],
  rulings: [
   { q: "Is it colorless?", a: "Yes. Its mana cost has no colored symbols, so it counts for <i-c>Glitch Interpreter</i-c>." },
   { q: "Is it historic?", a: "Yes, it's an artifact, so casting it triggers <i-c>Basim Ibn Ishaq</i-c>." }
  ],
  tips: [
   "It's a fine body to tap for Springleaf Drum or Mothdust Changeling when it can't attack profitably."
  ],
  combos: ["Basim Ibn Ishaq", "Glitch Interpreter"]
 },
 "Unstoppable Slasher": {
  rating: 5,
  when: "Turn 3, or with evasion",
  tags: ["deathtouch", "native assassin", "finisher"],
  rulings: [
   { q: "What's the Wound Reflection math?", a: "At 40 life: two damage takes them to 38, then they lose half of 38, so 19. They've lost 21 this turn. At the end step, Wound Reflection makes them lose 21 more, taking them to -2. With Ramses, Slasher is a 3/4: 40 to 37, then 18. They've lost 22, so Reflection takes them to -4." },
   { q: "How do stun counters work?", a: "It returns tapped with two stun counters. Each time it would untap, you remove a stun counter instead, so it stays tapped through two of your untap steps." },
   { q: "Does the half-life loss work with Mindcrank?", a: "Yes. They mill a card for each point of life lost from the damage and from the half-life loss." }
  ],
  tips: [
   "Wound Reflection must be on the battlefield when the end step begins. Casting it, or flipping a cloaked one with Etrata, in your second main phase is fine.",
   "Ramses converts the elimination into a win for you, since Slasher is an Assassin that attacked that player."
  ],
  combos: ["Wound Reflection", "Ramses, Assassin Lord", "Mindcrank", "Aqueous Form"]
 },
 "Wash Away": {
  rating: 3,
  when: "Instant speed",
  tags: ["counterspell", "cleave"],
  rulings: [
   { q: "Does a commander cast from the command zone count?", a: "Yes. It wasn't cast from its owner's hand." },
   { q: "What does cleave change?", a: "Pay {1}{U}{U} instead of {U}, and ignore the text in brackets. It then counters any spell." }
  ],
  tips: [
   "A spell an opponent casts from their library, graveyard or exile is a legal target for the one-mana mode."
  ]
 },
 "Willbender": {
  rating: 3,
  when: "Face down from turn 3",
  tags: ["morph", "protection"],
  rulings: [
   { q: "What can it redirect?", a: "A spell or ability with exactly one target. The new target has to be legal. It can't change a spell with two or more targets." },
   { q: "Can opponents respond?", a: "They can't respond to turning it face up, because that's a special action. Its trigger does go on the stack, so they can respond to the trigger before the target changes." }
  ],
  tips: [
   "Morph {1}{U} is cheaper than Etrata's granted ability, and it can't be responded to."
  ],
  combos: ["Kheru Spellsnatcher"]
 },
 "Wound Reflection": {
  rating: 4,
  when: "The turn you go for the kill",
  tags: ["finisher", "enchantment"],
  rulings: [
   { q: "Can I flip it with Etrata if it's cloaked?", a: "Yes. It's a permanent card, so Etrata's ability turns it face up and it stays as an enchantment." },
   { q: "Does it trigger on opponents' end steps too?", a: "Yes, every end step, counting the life each opponent lost that turn." },
   { q: "Does the Reflection's own loss trigger Mindcrank?", a: "Yes. Life lost to Wound Reflection is life loss, so Mindcrank mills that many." }
  ],
  tips: [
   "With Unstoppable Slasher: 40 to 38 to 19 is 21 lost, and Reflection takes them to -2."
  ],
  combos: ["Unstoppable Slasher", "Ramses, Assassin Lord", "Mindcrank"]
 },
 "Island": {
  rating: 3,
  when: "Any turn",
  tags: ["basic"],
  rulings: [
   { q: "Which cards care about Islands?", a: "<i-c>Drowned Catacomb</i-c> and <i-c>Choked Estuary</i-c>. Basics also help <i-c>Sunken Hollow</i-c> enter untapped." }
  ],
  tips: [
   "Count your {U} sources before keeping: you need one for Etrata."
  ]
 },
 "Swamp": {
  rating: 3,
  when: "Any turn",
  tags: ["basic"],
  rulings: [
   { q: "Which cards care about Swamps?", a: "<i-c>Tainted Isle</i-c>, <i-c>Drowned Catacomb</i-c> and <i-c>Choked Estuary</i-c>. Basics also help <i-c>Sunken Hollow</i-c> enter untapped." }
  ],
  tips: [
   "Dark Ritual needs a Swamp or another black source."
  ]
 }
};

window.ETRATA_GLOSSARY = [
 { term: "Face-down creatures", html: "A face-down permanent is a 2/2 creature with no name, no mana cost, no color, no creature types and no abilities, except ward {2} for a cloak. Its mana value is 0. You can look at your own face-down permanents any time, opponents can't. If it leaves the battlefield it's revealed, and all face-down cards are revealed at the end of the game. Keep your face-down cards easy to tell apart.", cards: ["Etrata, Deadly Fugitive", "Cryptic Coat", "Cursed Windbreaker", "Scroll of Fate", "They Came from the Pipes", "Glitch Interpreter"] },
 { term: "Cloak", html: "Put a card onto the battlefield face down as a 2/2 creature with ward {2}. If it's a creature card, you can turn it face up any time for its mana cost. <i-c>Etrata, Deadly Fugitive</i-c> cloaks from opponents' libraries: those cards stay owned by that opponent.", cards: ["Etrata, Deadly Fugitive", "Cryptic Coat"] },
 { term: "Manifest", html: "Put a card onto the battlefield face down as a 2/2 creature, usually the top card of a library. <i-c>Scroll of Fate</i-c> manifests from your hand. Unlike a cloak, a manifested creature has no ward. A creature card can be turned face up any time for its mana cost.", cards: ["Scroll of Fate", "Reality Shift"] },
 { term: "Manifest dread", html: "Look at the top two cards of your library. Manifest one of them and put the other into your graveyard.", cards: ["Cursed Windbreaker", "They Came from the Pipes", "Glitch Interpreter"] },
 { term: "Morph", html: "You can cast a morph card face down as a 2/2 creature for {3}. Any time you have priority, you can turn it face up by paying its morph cost. A face-down spell is a colorless creature spell, so it can be countered like any other.", cards: ["Kheru Spellsnatcher", "Willbender"] },
 { term: "Turning face up", html: "A cloaked or manifested creature card turns face up for its mana cost, a morph for its morph cost, as a special action. A noncreature card can't turn face up that way. <i-c>Etrata, Deadly Fugitive</i-c> gives your face-down creatures '{2}{U}{B}: turn this face up', an activated ability that uses the stack. It turns up any permanent card. An instant or sorcery can't be turned face up, so it's exiled and you may cast it free. Turning face up isn't entering the battlefield: no enters triggers, no 'as this enters' choices. The creature keeps its counters, Auras and Equipment, and it can still attack if it could before.", cards: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister", "Kheru Spellsnatcher", "Willbender", "Training Grounds", "Wound Reflection"] },
 { term: "Special action", html: "An action you take any time you have priority that doesn't use the stack, so nobody can respond to it. Turning a face-down creature up for its mana cost or morph cost is one, and so is playing a land. Restricted mana like <i-c>Omen Hawker</i-c>'s can't pay for it, and <i-c>Training Grounds</i-c> doesn't reduce it.", cards: ["Kheru Spellsnatcher", "Willbender", "Omen Hawker", "Training Grounds"] },
 { term: "Ward", html: "Whenever a permanent with ward {2} becomes the target of a spell or ability an opponent controls, that spell or ability is countered unless its controller pays {2}. It only taxes targeting: it doesn't stop board wipes, blocks or effects that don't target. A cloak loses ward when turned face up, unless the card has ward itself.", cards: ["Etrata, Deadly Fugitive", "Cryptic Coat"] },
 { term: "Ownership and control", html: "You control the cards you cloak from an opponent's library, but they still own them. When such a card leaves the battlefield, it goes to its owner's graveyard, hand or library. Effects that return a card 'under its owner's control' give it back to them. If its owner leaves the game, the card leaves too.", cards: ["Etrata, Deadly Fugitive", "Supernatural Stamina", "Grazilaxx, Illithid Scholar", "Unstoppable Slasher"] },
 { term: "Changeling", html: "The card is every creature type, in every zone. Your changelings are Assassins for Etrata, Ramses and Desmond, and they share a type with Etrata for <i-c>Path of Ancestry</i-c>.", cards: ["Changeling Outcast", "Mothdust Changeling", "Universal Automaton", "Maskwood Nexus"] },
 { term: "Type enablers", html: "Face-down creatures have no creature types, so they aren't Assassins. <i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c>, and <i-c>Arcane Adaptation</i-c> or <i-c>Leyline of Transformation</i-c> naming Assassin make them Assassins. Then each cloak that connects makes another cloak.", cards: ["Roshan, Hidden Magister", "Maskwood Nexus", "Arcane Adaptation", "Leyline of Transformation"] },
 { term: "Hit counters", html: "A counter put on exiled cards. <i-c>Etrata, the Silencer</i-c> makes a player lose if they own three or more exiled cards with hit counters when her trigger resolves. <i-c>Ravenloft Adventurer</i-c> also puts hit counters on opponents' creatures that would die.", cards: ["Etrata, the Silencer", "Ravenloft Adventurer"] },
 { term: "Phasing", html: "A phased-out permanent is treated as though it doesn't exist until it phases in during its controller's next untap step. It doesn't leave the battlefield, so nothing enters or leaves, and its counters stay. Auras and Equipment attached to it phase out with it.", cards: ["March of Swirling Mist", "Etrata, the Silencer"] },
 { term: "Energy", html: "A kind of counter a player has, shown as {E}. You get it from effects and spend it to pay costs. Unused energy stays with you.", cards: ["Chthonian Nightmare"] },
 { term: "Initiative and Undercity", html: "When you take the initiative, and at the beginning of your upkeep while you have it, you venture into Undercity, a dungeon with several rooms. The first room lets you search for a basic land. A player who deals combat damage to the player with the initiative takes it.", cards: ["Ravenloft Adventurer"] },
 { term: "Surveil", html: "Look at the top N cards of your library. Put any number into your graveyard and the rest back on top in any order.", cards: ["Consider", "Desmond Miles"] },
 { term: "Scry", html: "Look at the top N cards of your library. Put any number on the bottom and the rest back on top in any order.", cards: ["Preordain", "Aqueous Form", "Path of Ancestry"] },
 { term: "Mill", html: "Put the top N cards of a library into its owner's graveyard. Milling from an empty library does nothing. A player loses for an empty library only when they would draw from it.", cards: ["Mindcrank", "Duskmantle Guildmage", "Aven Heartstabber"] },
 { term: "Deathtouch", html: "Any amount of damage this creature deals to a creature is enough to destroy it.", cards: ["Etrata, Deadly Fugitive", "Unstoppable Slasher", "Ramses, Assassin Lord", "Aven Heartstabber"] },
 { term: "Menace", html: "The creature can't be blocked except by two or more creatures. <i-c>Roshan, Hidden Magister</i-c> gives it to your face-down creatures.", cards: ["Desmond Miles", "Roshan, Hidden Magister"] },
 { term: "Fear", html: "The creature can't be blocked except by artifact creatures and black creatures. Face-down creatures are colorless and aren't artifacts, so they can't block it.", cards: ["Cover of Darkness"] },
 { term: "Flying", html: "The creature can only be blocked by creatures with flying or reach.", cards: ["Aven Heartstabber", "Hookblade Veteran", "Mothdust Changeling", "Cursed Windbreaker"] },
 { term: "Can't be blocked", html: "The creature can't be blocked this combat. It has to be true before blockers are declared to matter.", cards: ["Changeling Outcast", "Etrata, the Silencer", "Silent Hallcreeper", "Aqueous Form", "Cryptic Coat", "Key to the City", "Access Tunnel", "Rogue's Passage"] },
 { term: "Cleave", html: "You may cast the spell for its cleave cost. If you do, ignore the words in square brackets.", cards: ["Wash Away"] },
 { term: "Cycling", html: "Pay the cycling cost and discard the card from your hand to draw a card. It's an activated ability.", cards: ["Reconnaissance Mission"] },
 { term: "Historic", html: "Artifacts, legendaries and Sagas are historic. Casting one triggers <i-c>Basim Ibn Ishaq</i-c>.", cards: ["Basim Ibn Ishaq"] },
 { term: "Treasure", html: "An artifact token with '{T}, Sacrifice this token: Add one mana of any color.'", cards: ["An Offer You Can't Refuse"] },
 { term: "Stun counters", html: "If a permanent with a stun counter would become untapped, you remove a stun counter from it instead.", cards: ["Unstoppable Slasher"] },
 { term: "Restricted mana", html: "<i-c>Omen Hawker</i-c>'s mana can only be spent to activate abilities: Etrata's granted ability, Guildmage, equip costs, mana abilities of rocks and lands, cycling. It can't cast spells, pay for special actions or pay for triggered abilities.", cards: ["Omen Hawker"] },
 { term: "Equip", html: "Pay the equip cost as a sorcery to attach the Equipment to a creature you control. If the creature leaves, the Equipment stays on the battlefield.", cards: ["Mask of Memory", "Cursed Windbreaker"] },
 { term: "Summoning sickness", html: "A creature can't attack or use {T} abilities unless you've controlled it since the start of your most recent turn. New cloaks can't attack the turn they arrive. Turning a creature face up doesn't reset this.", cards: ["Omen Hawker", "Springleaf Drum", "Mothdust Changeling"] },
 { term: "The stack and triggered abilities", html: "Spells and abilities wait on the stack, and the last one added resolves first. When several of your abilities trigger at once, you choose their order. Counterspells only counter spells, not triggered or activated abilities.", cards: ["Etrata, Deadly Fugitive", "Etrata, the Silencer", "Counterspell"] },
 { term: "The legend rule", html: "If you control two or more legendary permanents with the same name, you choose one and put the rest into their owners' graveyards. <i-c>Spark Double</i-c>'s copy isn't legendary, so it avoids the rule.", cards: ["Etrata, Deadly Fugitive", "Spark Double", "Silent Hallcreeper"] },
 { term: "Commander tax", html: "Each time you cast your commander from the command zone, it costs {2} more for each previous time you cast it from there this game.", cards: ["Etrata, Deadly Fugitive"] },
 { term: "Command zone", html: "Your commander starts the game here, and you can cast it from here. If it goes to your graveyard or into exile, you may move it here right after. If you do, effects that return it from the graveyard can't find it.", cards: ["Etrata, Deadly Fugitive", "Supernatural Stamina"] },
 { term: "Color identity", html: "Every card in your deck has to fit your commander's colors, blue and black. It only limits deckbuilding: you can cast an opponent's green card you took with Etrata if you can pay for it.", cards: ["Etrata, Deadly Fugitive", "Command Tower", "Arcane Signet"] },
 { term: "Mulligans: free and London", html: "Commander uses the London mulligan: shuffle, draw seven, then put one card on the bottom for each mulligan you've taken. In multiplayer your first mulligan is free: you draw seven again and bottom nothing.", cards: ["Leyline of Transformation"] }
];

window.ETRATA_CUTS = [];

window.ETRATA_FAQ = [
 { q: "Do my cloaks trigger Etrata?", a: "Not by themselves. A face-down creature has no creature types, so it isn't an Assassin. With <i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c>, or <i-c>Arcane Adaptation</i-c> or <i-c>Leyline of Transformation</i-c> naming Assassin, it is, and each one that connects makes another cloak." },
 { q: "Who owns the cards I cloak from an opponent's library?", a: "They do. You control them while they're on the battlefield. When they die they go to that opponent's graveyard, and if that opponent leaves the game, their cards leave with them." },
 { q: "Can I turn an opponent's creature card face up?", a: "Yes. Any time you have priority, pay its mana cost with any mana you have. Color identity only matters for deckbuilding." },
 { q: "What if the face-down card is a land, an enchantment or an instant?", a: "It can't turn face up for its mana cost. Etrata's granted {2}{U}{B} ability turns up any permanent card, which then stays on the battlefield as that permanent. An instant or sorcery is exiled instead, and you may cast it right away for free." },
 { q: "Do enters abilities work when I turn a card face up?", a: "No. Turning face up isn't entering the battlefield. <i-c>Bojuka Bog</i-c> exiles nothing, <i-c>Spark Double</i-c> copies nothing, and <i-c>Arcane Adaptation</i-c> names no type. 'When this is turned face up' abilities do trigger." },
 { q: "Should I attack with a cloak or turn it face up?", a: "It depends on what's under it. A cheap, strong creature is worth turning up. A land or a weak card is often better as an attacking 2/2 Assassin, if you have a type enabler, or as a blocker and Springleaf Drum fodder." },
 { q: "Does Etrata need to attack?", a: "No. She triggers for any Assassin you control. She's a 1/4 with deathtouch, so she often stays back as a blocker while evasive Assassins attack." },
 { q: "How many lands should I keep?", a: "Three or four, with both colors, or two with a mana rock and cheap plays. Name your first two turns before keeping, and check that you have a {U} and a {B} source for Etrata." },
 { q: "Is the first mulligan really free?", a: "Yes, in multiplayer Commander. You shuffle and draw seven again. After that it's the London mulligan: draw seven, then bottom one card for each mulligan after the free one." },
 { q: "How does the deck win?", a: "Mostly with combat: a growing army of cloaks plus evasive Assassins. The finishers are <i-c>Unstoppable Slasher</i-c> with <i-c>Wound Reflection</i-c>, <i-c>Duskmantle Guildmage</i-c> with <i-c>Mindcrank</i-c>, <i-c>Strixhaven Stadium</i-c> and <i-c>Etrata, the Silencer</i-c>. <i-c>Ramses, Assassin Lord</i-c> turns one player's loss into a win for you, if one of your Assassins attacked that player this turn." },
 { q: "Is Guildmage plus Mindcrank a guaranteed kill?", a: "No. You need to resolve Guildmage's first ability that turn, then start the loop with a life loss or a card going to the graveyard. It stops when the library is empty, and the player only loses then if their life hit 0. Otherwise they lose on their next draw." },
 { q: "Do I need to tell my table about the combos?", a: "Yes. Mention <i-c>Duskmantle Guildmage</i-c> + <i-c>Mindcrank</i-c> and <i-c>Ramses, Assassin Lord</i-c>'s alternate win in the pregame talk. Check the current official bracket rules and Game Changers list before a bracketed event." },
 { q: "Can counterspells stop Etrata's trigger?", a: "No. <i-c>Counterspell</i-c> and the others only counter spells. They can stop the removal aimed at your creatures and the wipes aimed at your board." },
 { q: "An opponent targets my cloak. What does ward do?", a: "Their spell or ability is countered unless they pay {2}. Ward doesn't stop wipes or effects that don't target." },
 { q: "How do I keep track of face-down cards in paper?", a: "Keep each face-down card distinguishable, for example with a die or a note, and keep cards from each opponent's library apart. Their sleeves show who owns them. You may look at your own face-down cards any time." },
 { q: "Which cards should I protect first?", a: "Etrata, because every recast costs {2} more, then your type enabler: <i-c>Roshan, Hidden Magister</i-c> or <i-c>Maskwood Nexus</i-c>. On the kill turn, protect <i-c>Ramses, Assassin Lord</i-c>. <i-c>March of Swirling Mist</i-c>, <i-c>Supernatural Stamina</i-c> and <i-c>Dispel</i-c> are your tools." }
];
