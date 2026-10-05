/* Card wiki extras for the Corrupted Etrata deck: per-card ratings, rulings, tips and combos,
   plus the glossary, the cut list and the FAQ. Card names match window.CETRATA_CARDS exactly. */
window.CETRATA_WIKI = {
 "Etrata, Deadly Fugitive": {
  rating: 5,
  when: "Turns 2-3, then every turn as a flip engine",
  tags: ["commander", "legendary", "deathtouch", "vampire", "assassin", "cloak engine"],
  rulings: [
   { q: "Does she trigger once per Assassin or once per player?", a: "Once per Assassin. Three Assassins that deal combat damage to the same opponent give three triggers, and each one cloaks the top card of that player's library." },
   { q: "Can her ability flip a creature I cast face down with morph, or manifested with Scroll of Fate?", a: "Yes. She gives the ability to every face-down creature you control, however it got face down: morph, manifest or cloak. That's how <i-c>Wormfang Manta</i-c> and a face-down <i-c>Silumgar Assassin</i-c> flip for {2}{U}{B}." },
   { q: "What does her granted ability do with each kind of card?", a: "It uses the stack. A permanent card (creature, artifact, enchantment or land) turns face up and stays. An instant or sorcery can't be turned face up, so you exile it and may cast it right away without paying its mana cost. X is 0, and you still pay additional costs and choose legal targets." },
   { q: "Does turning a card face up count as it entering the battlefield or being cast?", a: "Neither. Enters triggers don't happen, which is why a manifested <i-c>Wormfang Manta</i-c> never makes you skip a turn. 'When this is turned face up' abilities, like <i-c>Silumgar Assassin</i-c>'s, do trigger." },
   { q: "Does Training Grounds reduce her granted ability?", a: "Yes. It's an activated ability of a creature you control, so <i-c>Training Grounds</i-c> takes off the {2} and it costs {U}{B}." },
   { q: "Who owns a card I cloak from an opponent's library?", a: "The opponent. You control it while it's on the battlefield. If it leaves the battlefield it goes to its owner's graveyard, hand or library." }
  ],
  tips: [
   "A cloaked creature card can also turn face up for its own mana cost. Use her {2}{U}{B} ability when that's cheaper, or for noncreature cards.",
   "Attack the opponent whose library has the best cards: you are shopping from their deck.",
   "She's a Vampire, so <i-c>Path of Ancestry</i-c> scries off your Vampire and Assassin creature spells."
  ],
  combos: ["Wormfang Manta", "Scroll of Fate", "Crystal Shard", "Training Grounds", "Silumgar Assassin"]
 },
 "Exquisite Blood": {
  rating: 5,
  when: "Combo turn, with a payoff already out",
  tags: ["combo piece", "enchantment", "drain", "vampire court"],
  rulings: [
   { q: "Does damage count as losing life?", a: "Yes. Combat damage and noncombat damage to an opponent both make them lose that much life, so any hit triggers it." },
   { q: "Does it trigger when an opponent pays life for a fetch land or a shock land?", a: "Yes. Paying life is losing life. An opponent's <i-c>Polluted Delta</i-c>-style fetch starts the loop if a payoff is out. Your own life payments don't count." },
   { q: "Can I stop the loop?", a: "No. Exquisite Blood and all five payoffs (<i-c>Marauding Blight-Priest</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Sanguine Bond</i-c> and <i-c>Enduring Tenacity</i-c>) have no 'may'. The loop ends when every opponent has lost. If an opponent can't lose, a mandatory loop that never ends makes the game a draw." },
   { q: "With Blight-Priest, how many triggers does each step make?", a: "Each opponent losing 1 life is a separate event, so it triggers once per opponent. Each of those gains then triggers <i-c>Marauding Blight-Priest</i-c> again. The loop grows instead of shrinking." }
  ],
  tips: [
   "With <i-c>Bloodletter of Aclazotz</i-c> out on your turn, each loss is doubled, and you gain the doubled amount.",
   "If you have the payoff but no starter, attack with <i-c>Changeling Outcast</i-c>: one point of damage is enough. With <i-c>Hooded Blightfang</i-c> out, declaring any deathtouch attacker is enough."
  ],
  combos: ["Marauding Blight-Priest", "Starscape Cleric", "Vito, Thorn of the Dusk Rose", "Sanguine Bond", "Enduring Tenacity"]
 },
 "Bloodthirsty Conqueror": {
  rating: 5,
  when: "Turns 4-6, or the combo turn",
  tags: ["combo piece", "vampire", "flying", "deathtouch", "vampire court"],
  rulings: [
   { q: "Does it combo with Blight-Priest exactly like Exquisite Blood?", a: "Yes. Its trigger is the same: whenever an opponent loses life, you gain that much. Each gain makes <i-c>Marauding Blight-Priest</i-c> drain each opponent for 1, which triggers it again." },
   { q: "Does its own combat damage start the loop?", a: "Yes. When it deals combat damage to an opponent, that player loses life, so it triggers. With a payoff out, one connected hit wins." }
  ],
  tips: [
   "Opponents may block it with a big creature. It has deathtouch, so any blocker dies.",
   "Commander Spellbook lists Conqueror + Blight-Priest as a combo."
  ],
  combos: ["Marauding Blight-Priest", "Starscape Cleric", "Vito, Thorn of the Dusk Rose", "Sanguine Bond", "Enduring Tenacity"]
 },
 "Marauding Blight-Priest": {
  rating: 5,
  when: "Turns 3-5",
  tags: ["combo piece", "3-drop", "vampire", "vampire court", "underplayed"],
  rulings: [
   { q: "Does it trigger once per point of life gained?", a: "No, once per life gain event. Gaining 5 life at once makes each opponent lose 1. With <i-c>Exquisite Blood</i-c>, every opponent's loss is its own event, so the loop still grows." },
   { q: "Does it target?", a: "No. 'Each opponent' doesn't target, so hexproof players still lose life." }
  ],
  tips: [
   "It's a Vampire, so <i-c>Path of Ancestry</i-c> scries when you cast it.",
   "Without a drain, it still punishes life gain from <i-c>Vito, Thorn of the Dusk Rose</i-c>'s lifelink."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror", "Starscape Cleric"]
 },
 "Vito, Thorn of the Dusk Rose": {
  rating: 5,
  when: "Turns 3-5",
  tags: ["combo piece", "legendary", "vampire", "3-drop", "vampire court", "underplayed"],
  rulings: [
   { q: "How does the loop with Exquisite Blood kill everyone?", a: "Each time you gain life, Vito's trigger targets an opponent and they lose that much. <i-c>Exquisite Blood</i-c> gains it back, and Vito triggers again. Choose a new target whenever you want, and once a player has lost, target the next one." },
   { q: "Does lifelink damage get doubled by Bloodletter?", a: "The opponent loses double, but lifelink gains you only the damage dealt. The drain then gains the doubled loss." }
  ],
  tips: [
   "He's legendary, so he makes <i-c>Mox Amber</i-c> tap for {B} and lowers <i-c>Otawara, Soaring City</i-c> and <i-c>Takenuma, Abandoned Mire</i-c>.",
   "With Marauding Blight-Priest out, his lifelink ability alone drains each opponent every time a creature deals damage."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror"]
 },
 "Sanguine Bond": {
  rating: 4,
  when: "Combo turn",
  tags: ["combo piece", "enchantment", "vampire court"],
  rulings: [
   { q: "Can I split the loss between opponents?", a: "Each trigger targets one opponent. Every trigger is a new choice, so you can switch targets as the loop goes." },
   { q: "Is the loop mandatory?", a: "Yes. Neither card says 'may'. Pick targets so the loop ends with every opponent at 0." }
  ],
  tips: [
   "Commander Spellbook lists Exquisite Blood + Sanguine Bond as a combo."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror"]
 },
 "Enduring Tenacity": {
  rating: 4,
  when: "Turn 4, or the combo turn",
  tags: ["combo piece", "enchantment creature", "vampire court", "recursive", "new in v3"],
  rulings: [
   { q: "Does it loop with Exquisite Blood like Sanguine Bond?", a: "Yes. Its first ability is the same as <i-c>Sanguine Bond</i-c>'s: whenever you gain life, target opponent loses that much. <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> gains it back, and it repeats. Pick a new target as each player dies." },
   { q: "What happens when it dies?", a: "If it was a creature when it died, it returns to the battlefield as an enchantment that isn't a creature. It keeps its lifegain trigger, so the loop still works." },
   { q: "Does it come back a second time?", a: "No. In its enchantment form it isn't a creature, so it can't die, and if it goes to the graveyard some other way its 'if it was a creature' check fails. If it's exiled or bounced, it doesn't come back at all." },
   { q: "Does it return if Toxic Deluge kills it?", a: "Yes. -X/-X makes it die as a creature, so it returns as an enchantment. Your own wipe costs you nothing here." }
  ],
  tips: [
   "Sacrifice it to <i-c>Culling the Weak</i-c> for {B}{B}{B}{B}; it comes back as an enchantment and keeps the loop ready.",
   "<i-c>Dimir House Guard</i-c> can transmute for it, and a bargained <i-c>Beseech the Mirror</i-c> casts it free."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror", "Culling the Weak"]
 },
 "Starscape Cleric": {
  rating: 4,
  when: "Turn 2, or with offspring on turn 5",
  tags: ["combo piece", "2-drop", "flying", "offspring", "vampire court", "new in v3"],
  rulings: [
   { q: "Does it loop with Exquisite Blood?", a: "Yes, exactly like <i-c>Marauding Blight-Priest</i-c>. Each gain makes each opponent lose 1, each of those losses is a separate Exquisite Blood trigger, and each gain triggers the Cleric again." },
   { q: "How does offspring work?", a: "As you cast it, you may pay {2}{B} more. If you do, when it enters you create a 1/1 token copy of it. The token has the same lifegain trigger, so two Clerics drain each opponent for 2 per gain." },
   { q: "Is it a Vampire?", a: "No. It's a Bat Cleric, so <i-c>Path of Ancestry</i-c> doesn't scry off it." },
   { q: "Does its trigger target?", a: "No. 'Each opponent' doesn't target, so hexproof players still lose life." }
  ],
  tips: [
   "It can't block, so it's not one of your early defenders. Cast it when you have a blocker out already, or pay offspring later for a backup payoff.",
   "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> can transmute for it."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror"]
 },
 "Ramses, Assassin Lord": {
  rating: 5,
  when: "Turn before the kill, or the kill turn",
  tags: ["legendary", "assassin", "lord", "deathtouch", "win condition"],
  rulings: [
   { q: "Does the Assassin need to deal damage?", a: "No. It only needs to have attacked that player this turn." },
   { q: "Does he need to be out when I attack?", a: "No. He needs to be on the battlefield when the player loses. The attacking Assassin only has to be one you controlled." },
   { q: "Does it work with the Mindcrank loop?", a: "Yes, if the player was attacked by your Assassin this turn. Attack with <i-c>Changeling Outcast</i-c> first, then run <i-c>Duskmantle Guildmage</i-c> and <i-c>Mindcrank</i-c> on that player." },
   { q: "Does a player losing on their own turn count?", a: "Usually not. You can't attack on their turn, so no Assassin of yours attacked them that turn." }
  ],
  tips: [
   "Assassins in this deck: Etrata, <i-c>Virtus the Veiled</i-c>, <i-c>Silumgar Assassin</i-c> (face up), <i-c>Roshan, Hidden Magister</i-c>, <i-c>Changeling Outcast</i-c> and <i-c>Black Market Connections</i-c> tokens. With Roshan or <i-c>Leyline of Transformation</i-c>, every creature you control is one.",
   "He's legendary, so he turns on <i-c>Mox Amber</i-c>."
  ],
  combos: ["Virtus the Veiled", "Bloodletter of Aclazotz", "Changeling Outcast"]
 },
 "Bloodletter of Aclazotz": {
  rating: 5,
  when: "Kill turn, before combat",
  tags: ["combo piece", "vampire", "flying", "replacement effect", "double tap"],
  rulings: [
   { q: "Does Virtus + Bloodletter always kill?", a: "Yes. Virtus makes a player lose half their life rounded up, and Bloodletter doubles it, which is at least their whole life total. The combat damage is doubled too." },
   { q: "Does it double my own life loss?", a: "No. Only opponents' life loss is doubled." },
   { q: "Does it double damage?", a: "It doubles the life loss from the damage. Lifelink still gains you only the damage dealt." }
  ],
  tips: [
   "With <i-c>Mindcrank</i-c> out, every point of loss on your turn mills twice as many cards.",
   "It's a Vampire, so <i-c>Path of Ancestry</i-c> scries when you cast it."
  ],
  combos: ["Virtus the Veiled", "Ramses, Assassin Lord"]
 },
 "Virtus the Veiled": {
  rating: 4,
  when: "Turns 3-5, attack on the kill turn",
  tags: ["legendary", "assassin", "deathtouch", "halver", "double tap"],
  rulings: [
   { q: "How is half rounded up worked out?", a: "From the player's life total as the trigger resolves. A player at 25 loses 13." },
   { q: "Is its trigger affected by Bloodletter?", a: "Yes. It's life loss during your turn, so <i-c>Bloodletter of Aclazotz</i-c> doubles it." },
   { q: "Can I play it without Gorm the Great?", a: "Yes. Partner with only matters if you have Gorm. Virtus is mono-black and legal in your 99." }
  ],
  tips: [
   "With <i-c>Mindcrank</i-c> out, the half-life loss mills that many cards too.",
   "Even without Bloodletter, hitting a player at 40 twice takes them to 10."
  ],
  combos: ["Bloodletter of Aclazotz", "Ramses, Assassin Lord"]
 },
 "Tetsuko Umezawa, Fugitive": {
  rating: 4,
  when: "Turn 2",
  tags: ["legendary", "evasion", "2-drop", "underplayed"],
  rulings: [
   { q: "Does it check when blockers are declared?", a: "Yes. If the creature's power or toughness is 1 or less when blockers are declared, it can't be blocked. Pumping it afterwards doesn't change that." },
   { q: "Does the Manta qualify?", a: "Yes. It's a 6/1, and toughness 1 is enough. Only one of the two numbers needs to be 1 or less." }
  ],
  tips: [
   "<i-c>Vampire of the Dire Moon</i-c>, <i-c>Hooded Blightfang</i-c> and <i-c>Starscape Cleric</i-c> all qualify, and so does <i-c>Silumgar Assassin</i-c> until it gets a +1/+1 counter.",
   "She's legendary, so <i-c>Mox Amber</i-c> taps for {U} with her out."
  ],
  combos: ["Virtus the Veiled", "Wormfang Manta", "Vito, Thorn of the Dusk Rose"]
 },
 "Vampire of the Dire Moon": {
  rating: 3,
  when: "Turn 1",
  tags: ["1-drop", "vampire", "deathtouch", "lifelink", "blocker", "new in v3"],
  rulings: [
   { q: "Does its lifelink start the vampire loop?", a: "Yes, with a drain and a payoff out. When it deals damage you gain that much life, which triggers your payoff; the opponent's loss then triggers <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>, and it repeats." },
   { q: "Does it trigger Hooded Blightfang?", a: "Yes. It's a creature you control with deathtouch, so when it attacks, each opponent loses 1 and you gain 1." },
   { q: "Is it an Assassin?", a: "No, just a Vampire. It doesn't trigger Etrata's cloak unless <i-c>Roshan, Hidden Magister</i-c> or <i-c>Leyline of Transformation</i-c> makes it one." }
  ],
  tips: [
   "Keep it home early: a 1/1 deathtouch blocker makes opponents think twice about attacking with their biggest creature.",
   "With <i-c>Tetsuko Umezawa, Fugitive</i-c> it's unblockable, and it's a Vampire for <i-c>Path of Ancestry</i-c>."
  ],
  combos: ["Hooded Blightfang", "Exquisite Blood", "Tetsuko Umezawa, Fugitive"]
 },
 "Hooded Blightfang": {
  rating: 3,
  when: "Turn 3",
  tags: ["3-drop", "deathtouch", "blocker", "drain", "new in v3"],
  rulings: [
   { q: "Which creatures trigger it?", a: "Any creature you control with deathtouch as it attacks: Etrata, <i-c>Ramses, Assassin Lord</i-c>, <i-c>Virtus the Veiled</i-c>, <i-c>Bloodthirsty Conqueror</i-c>, <i-c>Vampire of the Dire Moon</i-c> and the Blightfang itself. Face-down creatures have no abilities, so they don't." },
   { q: "Does the attacker need to connect?", a: "No. It triggers when the creature is declared as an attacker, before blockers. Each opponent loses 1 and you gain 1 even if the attack is blocked." },
   { q: "Does it start the vampire loop?", a: "Yes, with a drain and a payoff out. The 1 life you gain triggers the payoff, and each opponent's loss triggers <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>." },
   { q: "What about the planeswalker clause?", a: "If one of your deathtouch creatures deals any damage to a planeswalker, that planeswalker is destroyed." }
  ],
  tips: [
   "A 1/4 deathtouch body blocks almost anything early. Leave it home and let your other deathtouch creatures do the attacking.",
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: ["Exquisite Blood", "Bloodthirsty Conqueror", "Vampire of the Dire Moon"]
 },
 "Silumgar Assassin": {
  rating: 4,
  when: "Turn 3 face down, flip when they commit a threat",
  tags: ["2-drop", "assassin", "megamorph", "removal", "blocker", "new in v3"],
  rulings: [
   { q: "Can opponents respond to the megamorph flip?", a: "No. Turning a card face up by paying its megamorph cost is a special action that doesn't use the stack. The 'destroy target creature' trigger does use the stack, so they can respond to that." },
   { q: "Can I flip it with Etrata's ability instead?", a: "Yes. Her {2}{U}{B} ability ({U}{B} with <i-c>Training Grounds</i-c>) turns it face up and the destroy trigger still happens. It's an activated ability, so it uses the stack, and only the megamorph flip gives the +1/+1 counter." },
   { q: "What can it destroy?", a: "One creature with power 3 or less that an opponent controls, chosen as the trigger goes on the stack. It's a 'destroy', so indestructible creatures survive." },
   { q: "Does Training Grounds reduce the megamorph cost?", a: "No. Megamorph is a special action, not an activated ability." },
   { q: "Is it unblockable with Tetsuko?", a: "Face up as a 2/1, yes. With the +1/+1 counter it's a 3/2, and Ramses makes it bigger, so Tetsuko no longer helps. Its own text still stops creatures with more power from blocking it." }
  ],
  tips: [
   "Cast it face down on turn 3 instead of tapping out: it's a 2/2 blocker and instant-speed removal for {2}{B}.",
   "Face up it's an Assassin, so its hits trigger Etrata's cloak and count for Ramses. <i-c>Roshan, Hidden Magister</i-c> draws a card when it flips."
  ],
  combos: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister", "Training Grounds"]
 },
 "Toxic Deluge": {
  rating: 4,
  when: "When behind on board",
  tags: ["board wipe", "flexible", "3-drop"],
  rulings: [
   { q: "Does it kill indestructible creatures?", a: "Yes. A creature with 0 or less toughness is put into the graveyard even if it's indestructible." },
   { q: "Does -X/-X last?", a: "Until end of turn. It only affects creatures on the battlefield when it resolves." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it.",
   "With <i-c>Exquisite Blood</i-c> out, the life you paid comes back fast once the loop starts.",
   "<i-c>Enduring Tenacity</i-c> dies to it as a creature and comes back as an enchantment, so it survives your own wipe."
  ],
  combos: ["Enduring Tenacity", "Hooded Blightfang"]
 },
 "Scroll of Fate": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["manifest", "artifact", "infinite turns"],
  rulings: [
   { q: "Can I manifest a noncreature card?", a: "Yes, any card. A noncreature card can only be turned face up with Etrata's ability. Instants and sorceries are exiled and cast for free instead." },
   { q: "Can I use it the turn it enters?", a: "Yes. It's an artifact, not a creature, so summoning sickness doesn't apply." },
   { q: "Does manifesting count as the card entering the battlefield?", a: "Yes, but face down, as a 2/2 with no abilities. Wormfang Manta's enters trigger doesn't exist face down, and turning it face up later isn't entering." }
  ],
  tips: [
   "A manifested creature card can turn face up for its mana cost as well. The Manta costs 7 that way, so use Etrata's ability.",
   "Manifest a <i-c>Counterspell</i-c>, then flip it with Etrata in response to a spell to cast it free."
  ],
  combos: ["Wormfang Manta", "Crystal Shard", "Etrata, Deadly Fugitive"]
 },
 "Wormfang Manta": {
  rating: 5,
  when: "Combo turn, with Scroll and Shard",
  tags: ["combo piece", "extra turns", "manifest", "flying"],
  rulings: [
   { q: "Why doesn't manifesting it make me skip a turn?", a: "It enters face down, as a 2/2 with no abilities, so the enters trigger doesn't exist. Turning it face up isn't entering the battlefield." },
   { q: "Does the extra turn still happen when a face-up Manta leaves?", a: "Yes. Its leaves-the-battlefield trigger looks back at it while it was face up. Bounce, sacrifice, destroy or exile all count." },
   { q: "Does a wipe give me an extra turn?", a: "Yes, if the Manta is face up when it dies." }
  ],
  tips: [
   "Sacrifice a face-up Manta to <i-c>Culling the Weak</i-c> or <i-c>Diabolic Intent</i-c> for an extra turn on top of the effect.",
   "<i-c>Takenuma, Abandoned Mire</i-c> can return it from your graveyard to your hand."
  ],
  combos: ["Scroll of Fate", "Crystal Shard", "Etrata, Deadly Fugitive"]
 },
 "Crystal Shard": {
  rating: 4,
  when: "Turns 3-5",
  tags: ["artifact", "bounce", "infinite turns"],
  rulings: [
   { q: "Who decides whether to pay {1}?", a: "The creature's controller. For your own Manta, you just don't pay." },
   { q: "Where does a stolen cloak go if I bounce it?", a: "To its owner's hand, so it goes back to the opponent." }
  ],
  tips: [
   "A face-down creature that leaves the battlefield is revealed, so bouncing a cloak shows everyone what it was."
  ],
  combos: ["Wormfang Manta", "Scroll of Fate"]
 },
 "Training Grounds": {
  rating: 4,
  when: "Turns 1-3",
  tags: ["cost reduction", "1-drop", "enchantment", "underplayed"],
  rulings: [
   { q: "Does it reduce Etrata's granted ability?", a: "Yes. The ability belongs to the face-down creature, a creature you control. {2}{U}{B} becomes {U}{B}." },
   { q: "Does it reduce morph?", a: "No. Morph is a special action, not an activated ability. <i-c>Silumgar Assassin</i-c>'s megamorph {2}{B} stays {2}{B}; flip it with Etrata's ability for {U}{B} instead if you don't need the counter." },
   { q: "Can it reduce colored mana?", a: "No. It only reduces generic mana, and never below one mana in total." }
  ],
  tips: [
   "<i-c>Vito, Thorn of the Dusk Rose</i-c>'s lifelink ability drops to {1}{B}{B}."
  ],
  combos: ["Etrata, Deadly Fugitive", "Wormfang Manta", "Silumgar Assassin", "Duskmantle Guildmage"]
 },
 "Roshan, Hidden Magister": {
  rating: 4,
  when: "Turns 4-5",
  tags: ["legendary", "assassin", "type enabler", "card draw"],
  rulings: [
   { q: "Are face-down creatures Assassins with Roshan out?", a: "Yes. His effect adds Assassin to other creatures you control, face-down ones included." },
   { q: "Does turning face up with any method draw?", a: "Yes. Morph, manifest, Etrata's ability and the mana cost all count. You draw a card and lose 1 life." }
  ],
  tips: [
   "He's legendary, so he turns on <i-c>Mox Amber</i-c> and lowers <i-c>Otawara, Soaring City</i-c>."
  ],
  combos: ["Etrata, Deadly Fugitive", "Silumgar Assassin", "Wormfang Manta"]
 },
 "Mindcrank": {
  rating: 5,
  when: "Turns 2-4",
  tags: ["combo piece", "artifact", "2-drop", "mill"],
  rulings: [
   { q: "Does paying life count?", a: "Yes. Paying life is losing life, so an opponent who pays life mills that many cards." },
   { q: "What happens when the library runs out?", a: "The loop stops, because milling from an empty library puts nothing into the graveyard. The player only loses the next time they would draw, unless their life is already 0." },
   { q: "Does it trigger for each opponent?", a: "Yes, for whichever opponent lost life. Each one needs their own starting event." }
  ],
  tips: [
   "With <i-c>Bloodletter of Aclazotz</i-c> out on your turn, every loss and every mill is doubled."
  ],
  combos: ["Duskmantle Guildmage"]
 },
 "Duskmantle Guildmage": {
  rating: 5,
  when: "The turn you go off, often an opponent's",
  tags: ["combo piece", "instant speed", "2-drop"],
  rulings: [
   { q: "Does the effect end if Guildmage dies?", a: "No. Once the first ability resolves, the effect lasts for the rest of the turn." },
   { q: "Does it hit every opponent?", a: "The effect covers every opponent. Each one starts losing life when a card goes to their own graveyard." },
   { q: "Does a spell they cast count?", a: "Yes. When an instant or sorcery resolves, it's put into its owner's graveyard, so the loop starts." }
  ],
  tips: [
   "With <i-c>Training Grounds</i-c> the drain costs {U}{B} and the mill costs {U}{B}.",
   "A stolen card that dies goes to its owner's graveyard, which starts the loop on that player."
  ],
  combos: ["Mindcrank"]
 },
 "Leyline of Transformation": {
  rating: 3,
  when: "Opening hand, or turns 4-5",
  tags: ["type enabler", "leyline", "enchantment"],
  rulings: [
   { q: "When do I choose the type if it starts on the battlefield?", a: "As it's put onto the battlefield before the game begins. Choose Assassin." },
   { q: "Does it make creature cards in my library Assassins?", a: "Yes, cards you own outside the battlefield are the chosen type too." }
  ],
  tips: [
   "Check for it every time you look at an opening seven."
  ],
  combos: ["Etrata, Deadly Fugitive", "Ramses, Assassin Lord"]
 },
 "Changeling Outcast": {
  rating: 5,
  when: "Turns 1-2",
  tags: ["1-drop", "changeling", "unblockable", "assassin"],
  rulings: [
   { q: "Is it an Assassin for Ramses and Etrata?", a: "Yes. Changeling makes it every creature type in every zone." },
   { q: "With Ramses out, is it still unblockable?", a: "Yes. Its own text says it can't be blocked, whatever its size." }
  ],
  tips: [
   "It's a Vampire too, so <i-c>Path of Ancestry</i-c> scries when you cast it."
  ],
  combos: ["Mindcrank", "Duskmantle Guildmage", "Ramses, Assassin Lord"]
 },
 "Gonti, Night Minister": {
  rating: 3,
  when: "Turn 4",
  tags: ["legendary", "theft", "treasure", "rogue"],
  rulings: [
   { q: "Do opponents' creatures trigger it?", a: "Yes. Any creature that deals combat damage to one of your opponents triggers it, and that creature's controller gets the card." },
   { q: "Do I get a Treasure when Etrata's flip casts an opponent's instant?", a: "Yes. You cast a spell you don't own, so you create a Treasure. Turning a stolen creature face up isn't casting, so it doesn't." },
   { q: "Can I spend any mana on the exiled cards?", a: "Yes. Mana of any type can be spent to cast them." }
  ],
  tips: [
   "He's legendary, so he turns on <i-c>Mox Amber</i-c>."
  ],
  combos: []
 },
 "Thief of Sanity": {
  rating: 3,
  when: "Turn 3",
  tags: ["theft", "flying", "3-drop"],
  rulings: [
   { q: "Can I play a land I exiled with it?", a: "No. It only lets you cast the card, so a land stays in exile." },
   { q: "Can I spend any mana on the stolen card?", a: "Yes. You may spend mana as though it were mana of any type to cast it." }
  ],
  tips: [
   "It stacks with Gonti: both triggers steal a card from the same hit."
  ],
  combos: []
 },
 "Fallen Shinobi": {
  rating: 3,
  when: "Turns 3-6, in combat",
  tags: ["ninjutsu", "theft", "free spells"],
  rulings: [
   { q: "Can I play a land with it?", a: "Yes, if you still have a land play available this turn." },
   { q: "Do I pay additional costs?", a: "Yes. You skip the mana cost but pay additional costs, and X is 0." },
   { q: "What happens to cards I don't play?", a: "They stay exiled for good. You can only play them this turn." }
  ],
  tips: [
   "Ninjutsu is activated from your hand, so it ignores counterspells for creature spells."
  ],
  combos: []
 },
 "Opposition Agent": {
  rating: 4,
  when: "Instant speed, in response to a search",
  tags: ["game changer", "flash", "theft", "rogue"],
  rulings: [
   { q: "Can I make them find nothing?", a: "Yes, when they search for a card with a stated quality, like 'an Island card'. You can always choose to fail to find." },
   { q: "Can I play a land they found?", a: "Yes, but only as your land play, during your turn with a land play left." },
   { q: "What about colored mana for their spells?", a: "You may spend mana as though it were mana of any color to cast the exiled cards." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: ["Wishclaw Talisman", "Scheming Symmetry"]
 },
 "Notion Thief": {
  rating: 4,
  when: "Instant speed, before Windfall",
  tags: ["game changer", "flash", "card draw", "rogue"],
  rulings: [
   { q: "With Windfall, what do opponents end up with?", a: "No hand. They discard everything, and every card they would draw is replaced by you drawing." },
   { q: "Does it stop their first draw each turn?", a: "No. Only the first card in each of their draw steps is safe." }
  ],
  tips: [
   "<i-c>Dimir House Guard</i-c> can transmute for it."
  ],
  combos: ["Windfall"]
 },
 "Windfall": {
  rating: 3,
  when: "With Notion Thief",
  tags: ["wheel", "card draw", "sorcery"],
  rulings: [
   { q: "Does Notion Thief steal all their draws?", a: "Yes. None of these draws is the first in their draw step, so each is replaced by you drawing." },
   { q: "How many do I draw for myself?", a: "The greatest number discarded by any player. You draw that many, plus every card stolen with Notion Thief." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: ["Notion Thief"]
 },
 "Praetor's Grasp": {
  rating: 3,
  when: "Turns 3-5",
  tags: ["theft", "tutor", "sorcery"],
  rulings: [
   { q: "Can I take a land and play it?", a: "Yes. You may play it, using your land play." },
   { q: "Can I spend mana of any color on it?", a: "No. Unlike Gonti or Thief of Sanity, it doesn't let you spend mana as any type." }
  ],
  tips: [],
  combos: []
 },
 "Black Market Connections": {
  rating: 4,
  when: "Turn 3",
  tags: ["enchantment", "card draw", "treasure", "changeling"],
  rulings: [
   { q: "Can I choose all three modes?", a: "Yes. 'One or more' lets you pick any combination, for 6 life in total." },
   { q: "Is the Mercenary token an Assassin?", a: "Yes. Changeling makes it every creature type." }
  ],
  tips: [
   "Treasures are artifacts, so they pay for <i-c>Beseech the Mirror</i-c>'s bargain."
  ],
  combos: []
 },
 "Rhystic Study": {
  rating: 4,
  when: "Turns 2-3",
  tags: ["game changer", "enchantment", "card draw"],
  rulings: [
   { q: "When does the opponent decide to pay?", a: "As the trigger resolves. If they don't pay, you may draw." }
  ],
  tips: [
   "<i-c>Notion Thief</i-c> doesn't touch your draws, so they stack."
  ],
  combos: []
 },
 "Necropotence": {
  rating: 5,
  when: "Turns 1-3",
  tags: ["game changer", "enchantment", "card draw"],
  rulings: [
   { q: "When do the cards come to my hand?", a: "At the beginning of your next end step. Paying life in an opponent's turn still gives you the cards at your own end step." },
   { q: "What happens to cards I discard?", a: "They're exiled from your graveyard." }
  ],
  tips: [
   "After <i-c>Vampiric Tutor</i-c> or <i-c>Imperial Seal</i-c>, pay 1 life to take the card off the top."
  ],
  combos: []
 },
 "Mystic Remora": {
  rating: 3,
  when: "Turn 1",
  tags: ["enchantment", "card draw", "cumulative upkeep"],
  rulings: [
   { q: "Does it trigger on creature spells?", a: "No. Only noncreature spells. Face-down morph spells are creature spells." },
   { q: "Do I have to pay the upkeep?", a: "No. If you don't, you sacrifice it." }
  ],
  tips: [],
  combos: []
 },
 "Brainstorm": {
  rating: 3,
  when: "Any time",
  tags: ["cantrip", "instant"],
  rulings: [
   { q: "Can I put back cards I drew?", a: "Yes. Any two cards from your hand." }
  ],
  tips: [
   "Crack <i-c>Polluted Delta</i-c> afterwards to shuffle away the two cards you put back."
  ],
  combos: []
 },
 "Ponder": {
  rating: 2,
  when: "Turns 1-3",
  tags: ["cantrip", "sorcery"],
  rulings: [
   { q: "Can I shuffle after seeing the cards?", a: "Yes. You put them back in any order, then you may shuffle, then you draw." }
  ],
  tips: [],
  combos: []
 },
 "Night's Whisper": {
  rating: 2,
  when: "Turns 2-4",
  tags: ["card draw", "sorcery"],
  rulings: [
   { q: "Can I target an opponent?", a: "No. You draw and you lose the life." }
  ],
  tips: [],
  combos: []
 },
 "Demonic Tutor": {
  rating: 5,
  when: "When one piece is missing",
  tags: ["game changer", "tutor", "sorcery"],
  rulings: [
   { q: "Does it reveal the card?", a: "No. You put it in your hand without revealing it." }
  ],
  tips: [
   "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> can transmute for it."
  ],
  combos: []
 },
 "Vampiric Tutor": {
  rating: 5,
  when: "End of an opponent's turn",
  tags: ["game changer", "tutor", "instant"],
  rulings: [
   { q: "Do I shuffle after putting it on top?", a: "No. You shuffle first, then put the card on top." }
  ],
  tips: [],
  combos: []
 },
 "Imperial Seal": {
  rating: 4,
  when: "Turns 1-3",
  tags: ["game changer", "tutor", "sorcery"],
  rulings: [
   { q: "Is it the same as Vampiric Tutor?", a: "Yes, except it's a sorcery." }
  ],
  tips: [],
  combos: []
 },
 "Grim Tutor": {
  rating: 4,
  when: "Turns 3-5",
  tags: ["tutor", "sorcery"],
  rulings: [
   { q: "Does it reveal?", a: "No. The card goes to your hand unrevealed." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: []
 },
 "Diabolic Intent": {
  rating: 4,
  when: "Turns 3-5",
  tags: ["tutor", "sorcery", "sacrifice"],
  rulings: [
   { q: "Is the sacrifice refunded if it's countered?", a: "No. Sacrificing is part of the cost." }
  ],
  tips: [
   "With Guildmage's drain active, sacrificing a stolen cloak drains its owner and starts the Mindcrank loop."
  ],
  combos: []
 },
 "Beseech the Mirror": {
  rating: 4,
  when: "Kill turn",
  tags: ["tutor", "bargain", "free spell"],
  rulings: [
   { q: "Does the free cast follow the card's normal timing?", a: "No. You cast it while Beseech resolves, so timing restrictions are ignored. You still pay additional costs." },
   { q: "What if the card has mana value 5 or more?", a: "It goes to your hand." }
  ],
  tips: [
   "<i-c>Dimir House Guard</i-c> can transmute for it."
  ],
  combos: []
 },
 "Lim-Dûl's Vault": {
  rating: 3,
  when: "End of an opponent's turn",
  tags: ["tutor", "instant"],
  rulings: [
   { q: "Does it shuffle?", a: "Yes. After you stop, you shuffle and put the last five you looked at on top in any order." }
  ],
  tips: [
   "<i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> can transmute for it."
  ],
  combos: []
 },
 "Scheming Symmetry": {
  rating: 3,
  when: "Turns 1-3, or with Opposition Agent",
  tags: ["tutor", "sorcery", "symmetric"],
  rulings: [
   { q: "Can I target myself and one opponent?", a: "Yes. It targets two different players, and you can be one of them." },
   { q: "What does Opposition Agent do here?", a: "You control the opponent's search and the card they find is exiled. You may play it." }
  ],
  tips: [],
  combos: ["Opposition Agent"]
 },
 "Wishclaw Talisman": {
  rating: 3,
  when: "Kill turn",
  tags: ["tutor", "artifact", "2-drop"],
  rulings: [
   { q: "Can opponents use it?", a: "Yes, on their turn while it has wish counters. Then control passes to one of their opponents, which can be you." },
   { q: "Can I activate it at instant speed?", a: "No. Only during your turn." }
  ],
  tips: [
   "<i-c>Tribute Mage</i-c> can find it, since it's a 2-mana-value artifact."
  ],
  combos: ["Opposition Agent"]
 },
 "Tribute Mage": {
  rating: 3,
  when: "Turn 3",
  tags: ["tutor", "3-drop", "enters trigger"],
  rulings: [
   { q: "Can it find Mox Amber?", a: "No. Mox Amber has mana value 0." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: []
 },
 "Shred Memory": {
  rating: 4,
  when: "Turns 2-3, sorcery speed",
  tags: ["transmute", "graveyard hate", "instant"],
  rulings: [
   { q: "What can it find?", a: "Any card with mana value 2: <i-c>Mindcrank</i-c>, <i-c>Duskmantle Guildmage</i-c>, <i-c>Tetsuko Umezawa, Fugitive</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Silumgar Assassin</i-c>, <i-c>Demonic Tutor</i-c>, <i-c>Wishclaw Talisman</i-c>, the Signets and more." }
  ],
  tips: [],
  combos: []
 },
 "Muddle the Mixture": {
  rating: 4,
  when: "Turns 2-3, or held up",
  tags: ["transmute", "counterspell", "instant"],
  rulings: [
   { q: "Can it counter a creature spell?", a: "No. Only instants and sorceries." }
  ],
  tips: [],
  combos: []
 },
 "Drift of Phantasms": {
  rating: 4,
  when: "Turns 2-4, sorcery speed",
  tags: ["transmute", "defender", "flying"],
  rulings: [
   { q: "What can it find?", a: "Any card with mana value 3, including <i-c>Hooded Blightfang</i-c>, <i-c>Necropotence</i-c>, <i-c>Rhystic Study</i-c>, <i-c>Grim Tutor</i-c> and <i-c>Opposition Agent</i-c>." }
  ],
  tips: [],
  combos: []
 },
 "Dimir House Guard": {
  rating: 4,
  when: "Turns 3-4, sorcery speed",
  tags: ["transmute", "fear", "regenerate"],
  rulings: [
   { q: "What can it find?", a: "Any card with mana value 4, including <i-c>Enduring Tenacity</i-c>, <i-c>Gonti, Night Minister</i-c>, <i-c>Notion Thief</i-c>, <i-c>Beseech the Mirror</i-c> and <i-c>Deadly Rollick</i-c>." },
   { q: "What does fear do?", a: "It can't be blocked except by artifact creatures and black creatures." }
  ],
  tips: [],
  combos: []
 },
 "Counterspell": {
  rating: 4,
  when: "Instant speed",
  tags: ["counterspell", "hard counter"],
  rulings: [
   { q: "Can it counter an ability?", a: "No. It only counters spells. Etrata's flip and Guildmage's drain are abilities, and so are opponents' activated combos." }
  ],
  tips: [
   "Manifest it with <i-c>Scroll of Fate</i-c>, then flip it with Etrata in response to a spell: it's exiled and you cast it free."
  ],
  combos: []
 },
 "Swan Song": {
  rating: 4,
  when: "Instant speed",
  tags: ["counterspell", "1 mana"],
  rulings: [
   { q: "Who gets the Bird?", a: "The controller of the countered spell." }
  ],
  tips: [],
  combos: []
 },
 "An Offer You Can't Refuse": {
  rating: 3,
  when: "Instant speed",
  tags: ["counterspell", "1 mana"],
  rulings: [
   { q: "Who gets the Treasures?", a: "The controller of the countered spell. If you counter your own, you get them." },
   { q: "Can it counter a face-down morph spell?", a: "No. A face-down spell is a creature spell." }
  ],
  tips: [
   "Treasures you get from it can pay for <i-c>Beseech the Mirror</i-c>'s bargain."
  ],
  combos: []
 },
 "Fierce Guardianship": {
  rating: 5,
  when: "Instant speed, with Etrata out",
  tags: ["game changer", "counterspell", "free"],
  rulings: [
   { q: "Does Etrata need to be my commander on the battlefield?", a: "Yes. 'If you control a commander' means a commander on the battlefield under your control." }
  ],
  tips: [
   "<i-c>Drift of Phantasms</i-c> can transmute for it."
  ],
  combos: []
 },
 "Deadly Rollick": {
  rating: 4,
  when: "Instant speed",
  tags: ["removal", "free", "exile"],
  rulings: [
   { q: "Does it get around Enduring Tenacity-style returns?", a: "Yes. Exile isn't dying, so 'when this dies' abilities don't trigger." }
  ],
  tips: [],
  combos: []
 },
 "Infernal Grasp": {
  rating: 4,
  when: "Instant speed",
  tags: ["removal", "unconditional"],
  rulings: [
   { q: "Does it hit indestructible creatures?", a: "No. Use <i-c>Deadly Rollick</i-c> instead." }
  ],
  tips: [],
  combos: []
 },
 "Cyclonic Rift": {
  rating: 5,
  when: "End of the turn before yours",
  tags: ["game changer", "bounce", "overload", "instant"],
  rulings: [
   { q: "Does overload target?", a: "No. It changes 'target' to 'each', so hexproof doesn't stop it." },
   { q: "Does it bounce my cards?", a: "No. Only nonland permanents you don't control." }
  ],
  tips: [
   "Cast it overloaded at the end of the turn before yours, so opponents have to spend their turn replaying what you bounced."
  ],
  combos: []
 },
 "Sol Ring": {
  rating: 5,
  when: "Turn 1",
  tags: ["mana rock", "artifact"],
  rulings: [
   { q: "Does it help cast Etrata?", a: "It pays the {1} but not {U}{B}. You still need blue and black from other sources." }
  ],
  tips: [],
  combos: []
 },
 "Mox Amber": {
  rating: 3,
  when: "Turn 2 onward",
  tags: ["mana rock", "0-drop", "legendary", "artifact"],
  rulings: [
   { q: "What colors can it make?", a: "Any color among legendary creatures and planeswalkers you control. Etrata gives {U} or {B}." },
   { q: "Does my commander count?", a: "Only while Etrata is on the battlefield. In the command zone she doesn't count." }
  ],
  tips: [
   "<i-c>Tribute Mage</i-c> can't find it: its mana value is 0."
  ],
  combos: []
 },
 "Arcane Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "What colors does it make?", a: "Blue or black, the colors of your commander's color identity." }
  ],
  tips: [],
  combos: []
 },
 "Talisman of Dominance": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "Does the damage trigger Mindcrank?", a: "No. It damages you, not an opponent." }
  ],
  tips: [],
  combos: []
 },
 "Dimir Signet": {
  rating: 3,
  when: "Turn 2",
  tags: ["mana rock", "fixing"],
  rulings: [
   { q: "Does it add mana if it's my only source?", a: "No. It needs {1} from another source, so it nets one extra mana." }
  ],
  tips: [],
  combos: []
 },
 "Fellwar Stone": {
  rating: 2,
  when: "Turn 2",
  tags: ["mana rock"],
  rulings: [
   { q: "What if no opponent's land makes a color?", a: "Then it makes only the types those lands could make, which may be {C} or nothing at all." }
  ],
  tips: [],
  combos: []
 },
 "Mind Stone": {
  rating: 2,
  when: "Turn 2",
  tags: ["mana rock", "cantrip"],
  rulings: [
   { q: "Can I tap it for mana and sacrifice it in the same turn?", a: "No. Both abilities need {T}. Choose one." }
  ],
  tips: [
   "It's an artifact, so you can sacrifice it to bargain <i-c>Beseech the Mirror</i-c>."
  ],
  combos: []
 },
 "Dark Ritual": {
  rating: 3,
  when: "Turn 1, or a kill turn",
  tags: ["ritual", "instant"],
  rulings: [
   { q: "Does the mana last?", a: "No. Mana empties at the end of each step and phase, so spend it in the same phase." }
  ],
  tips: [
   "Swamp into Dark Ritual casts <i-c>Necropotence</i-c> on turn 1."
  ],
  combos: ["Necropotence"]
 },
 "Culling the Weak": {
  rating: 3,
  when: "Kill turn",
  tags: ["ritual", "instant", "sacrifice outlet"],
  rulings: [
   { q: "Can I sacrifice a face-down creature?", a: "Yes. A face-down creature is a creature you control. A cloak of an opponent's card goes to that player's graveyard." },
   { q: "Does the mana last?", a: "No. Mana empties at the end of each step and phase." }
  ],
  tips: [
   "Sacrifice <i-c>Enduring Tenacity</i-c> while it's a creature: it comes back as an enchantment."
  ],
  combos: ["Wormfang Manta", "Duskmantle Guildmage", "Enduring Tenacity"]
 },
 "Command Tower": {
  rating: 4,
  when: "Turn 1",
  tags: ["land", "fixing"],
  rulings: [
   { q: "What does it make?", a: "Blue or black, your commander's colors." }
  ],
  tips: [],
  combos: []
 },
 "Watery Grave": {
  rating: 4,
  when: "Turns 1-3",
  tags: ["land", "shock land", "dual"],
  rulings: [
   { q: "Does paying life trigger my Exquisite Blood?", a: "No. Only opponents losing life triggers it." }
  ],
  tips: [],
  combos: []
 },
 "Drowned Catacomb": {
  rating: 3,
  when: "Turns 2+",
  tags: ["land", "check land", "dual"],
  rulings: [
   { q: "Do Watery Grave and Sunken Hollow count?", a: "Yes. They have the Island and Swamp land types." }
  ],
  tips: [],
  combos: []
 },
 "Darkslick Shores": {
  rating: 3,
  when: "Turns 1-3",
  tags: ["land", "fast land", "dual"],
  rulings: [
   { q: "When does it enter tapped?", a: "When you control three or more other lands." }
  ],
  tips: [],
  combos: []
 },
 "Underground River": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "pain land", "dual"],
  rulings: [
   { q: "Does the damage trigger Mindcrank?", a: "No. It damages you, not an opponent." }
  ],
  tips: [],
  combos: []
 },
 "Sunken Hollow": {
  rating: 3,
  when: "Turns 3+",
  tags: ["land", "dual"],
  rulings: [
   { q: "Does it count as an Island for Drowned Catacomb?", a: "Yes. It has both land types." }
  ],
  tips: [],
  combos: []
 },
 "Morphic Pool": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "dual"],
  rulings: [
   { q: "Does it enter tapped once an opponent is out?", a: "Only if you have fewer than two opponents left when it enters." }
  ],
  tips: [],
  combos: []
 },
 "Gloomlake Verge": {
  rating: 3,
  when: "Turns 2+",
  tags: ["land", "dual"],
  rulings: [
   { q: "Does it need the Island or Swamp to stay?", a: "It checks when you tap it for {B}." }
  ],
  tips: [],
  combos: []
 },
 "Undercity Sewers": {
  rating: 3,
  when: "Turn 1, or a quiet turn",
  tags: ["land", "surveil", "dual"],
  rulings: [
   { q: "Does it surveil when fetched?", a: "Yes. The enters trigger happens however it enters." }
  ],
  tips: [],
  combos: []
 },
 "Polluted Delta": {
  rating: 3,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "Can it fetch Drowned Catacomb?", a: "No. Drowned Catacomb has no land types." }
  ],
  tips: [],
  combos: []
 },
 "Otawara, Soaring City": {
  rating: 4,
  when: "Any turn",
  tags: ["land", "channel", "legendary"],
  rulings: [
   { q: "Is channel a spell?", a: "No. It's an activated ability from your hand, so counterspells can't stop it." },
   { q: "Can I bounce my own creature?", a: "Yes. Any target artifact, creature, enchantment or planeswalker." }
  ],
  tips: [],
  combos: ["Wormfang Manta"]
 },
 "Takenuma, Abandoned Mire": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "channel", "legendary", "recursion"],
  rulings: [
   { q: "Can it return a creature I just milled?", a: "Yes. The mill happens first, then you return a creature card from your graveyard." }
  ],
  tips: [],
  combos: []
 },
 "Rogue's Passage": {
  rating: 3,
  when: "Kill turn",
  tags: ["land", "evasion"],
  rulings: [
   { q: "Does it work after blockers are declared?", a: "No. Activate it before blockers." }
  ],
  tips: [],
  combos: ["Virtus the Veiled"]
 },
 "Path of Ancestry": {
  rating: 2,
  when: "Turns 1-2",
  tags: ["land", "fixing", "enters tapped"],
  rulings: [
   { q: "Do face-down spells scry?", a: "No. A face-down creature spell has no creature types." }
  ],
  tips: [],
  combos: []
 },
 "Secluded Courtyard": {
  rating: 2,
  when: "Any turn",
  tags: ["land", "fixing"],
  rulings: [
   { q: "Can its mana pay Etrata's flip?", a: "Only if the face-down creature has the chosen type. A face-down creature has no types unless Roshan or Leyline gives it one." }
  ],
  tips: [],
  combos: []
 },
 "Island": {
  rating: 2,
  when: "Any turn",
  tags: ["basic land"],
  rulings: [],
  tips: [],
  combos: []
 },
 "Swamp": {
  rating: 2,
  when: "Any turn",
  tags: ["basic land"],
  rulings: [],
  tips: [],
  combos: []
 }
};

window.CETRATA_GLOSSARY = [
 { term: "Cloak", html: "To cloak a card, put it onto the battlefield face down as a 2/2 creature with ward {2}. If it's a creature card, you can turn it face up any time for its mana cost. <i-c>Etrata, Deadly Fugitive</i-c> cloaks the top card of an opponent's library each time one of your Assassins hits them, so you control a card they own.", cards: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister", "Leyline of Transformation"] },
 { term: "Manifest", html: "Like cloak, but without ward: the card goes onto the battlefield face down as a 2/2, and a creature card can turn face up for its mana cost. <i-c>Scroll of Fate</i-c> manifests a card from your hand, which is how <i-c>Wormfang Manta</i-c> arrives without its 'skip your next turn' trigger.", cards: ["Scroll of Fate", "Wormfang Manta"] },
 { term: "Morph", html: "You may cast a morph or megamorph card face down as a 2/2 creature for {3}, then turn it face up any time you have priority by paying its morph cost. Megamorph works the same way, and also puts a +1/+1 counter on it as it turns face up: <i-c>Silumgar Assassin</i-c>'s megamorph is {2}{B}. Turning it up with morph or megamorph is a special action and doesn't use the stack, so nobody can respond to the flip itself.", cards: ["Silumgar Assassin", "Etrata, Deadly Fugitive"] },
 { term: "Face-down creature", html: "A 2/2 with no name, no creature types, no abilities and no mana cost. You can look at your own face-down cards; opponents can't. If one leaves the battlefield, it's revealed. Without <i-c>Roshan, Hidden Magister</i-c> or <i-c>Leyline of Transformation</i-c> it isn't an Assassin, so it doesn't trigger Etrata.", cards: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister", "Leyline of Transformation", "Scroll of Fate"] },
 { term: "Turning face up", html: "Flipping a face-down permanent to show the card. It isn't casting and isn't entering the battlefield, so enters triggers don't happen and Gonti makes no Treasure. 'When this is turned face up' triggers, like <i-c>Silumgar Assassin</i-c>'s, do happen. Etrata's {2}{U}{B} ability is one way to do it, and <i-c>Training Grounds</i-c> cuts it to {U}{B}.", cards: ["Etrata, Deadly Fugitive", "Silumgar Assassin", "Wormfang Manta", "Training Grounds", "Roshan, Hidden Magister"] },
 { term: "Ward", html: "Whenever a permanent with ward becomes the target of a spell or ability an opponent controls, counter it unless that player pays the ward cost. Cloaks have ward {2}.", cards: ["Etrata, Deadly Fugitive"] },
 { term: "Transmute", html: "Pay the transmute cost and discard the card from your hand: search your library for a card with the same mana value, reveal it and put it into your hand. Only as a sorcery. It's an ability, not a spell, so Counterspell can't stop it. This deck has four: <i-c>Shred Memory</i-c> and <i-c>Muddle the Mixture</i-c> (2), <i-c>Drift of Phantasms</i-c> (3) and <i-c>Dimir House Guard</i-c> (4).", cards: ["Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard"] },
 { term: "Changeling", html: "The card is every creature type, in every zone. <i-c>Changeling Outcast</i-c> and <i-c>Black Market Connections</i-c>'s Mercenary tokens are Assassins and Vampires, so they trigger Etrata and get Ramses's pump.", cards: ["Changeling Outcast", "Black Market Connections"] },
 { term: "Deathtouch", html: "Any damage this creature deals to a creature is enough to destroy it. Etrata, Ramses, Virtus, Bloodthirsty Conqueror, <i-c>Vampire of the Dire Moon</i-c> and <i-c>Hooded Blightfang</i-c> have it, and with the Blightfang out each of them drains the table when it attacks.", cards: ["Etrata, Deadly Fugitive", "Ramses, Assassin Lord", "Virtus the Veiled", "Bloodthirsty Conqueror", "Vampire of the Dire Moon", "Hooded Blightfang"] },
 { term: "Assassin", html: "A creature type. Etrata cloaks a card whenever an Assassin you control hits an opponent, and <i-c>Ramses, Assassin Lord</i-c> pumps them and wins the game off them. Roshan and Leyline of Transformation make all your creatures Assassins.", cards: ["Etrata, Deadly Fugitive", "Ramses, Assassin Lord", "Virtus the Veiled", "Silumgar Assassin", "Changeling Outcast", "Roshan, Hidden Magister"] },
 { term: "Ninjutsu", html: "Pay the cost and return an unblocked attacker you control to your hand: put this card onto the battlefield tapped and attacking. <i-c>Fallen Shinobi</i-c> swaps in for <i-c>Changeling Outcast</i-c>.", cards: ["Fallen Shinobi", "Changeling Outcast"] },
 { term: "Bargain", html: "An optional extra cost: sacrifice an artifact, enchantment or token as you cast the spell. Bargained <i-c>Beseech the Mirror</i-c> lets you cast the card it finds for free if its mana value is 4 or less. Treasures are perfect fodder.", cards: ["Beseech the Mirror", "Black Market Connections", "Mind Stone"] },
 { term: "Channel", html: "An ability you activate from your hand by paying the cost and discarding the card. It isn't a spell. <i-c>Otawara, Soaring City</i-c> and <i-c>Takenuma, Abandoned Mire</i-c> cost {1} less for each legendary creature you control.", cards: ["Otawara, Soaring City", "Takenuma, Abandoned Mire"] },
 { term: "Flash", html: "You can cast the card any time you could cast an instant. <i-c>Opposition Agent</i-c> and <i-c>Notion Thief</i-c> are best flashed in right before an opponent searches or draws.", cards: ["Opposition Agent", "Notion Thief"] },
 { term: "Mill", html: "Put cards from the top of a library into the graveyard. <i-c>Mindcrank</i-c> mills opponents for each point of life they lose, and <i-c>Duskmantle Guildmage</i-c> makes each milled card cost them a life.", cards: ["Mindcrank", "Duskmantle Guildmage"] },
 { term: "Surveil", html: "Look at the top cards of your library, put any of them into your graveyard and the rest back in any order. <i-c>Undercity Sewers</i-c> surveils 1.", cards: ["Undercity Sewers"] },
 { term: "Treasure", html: "An artifact token: {T}, sacrifice it, add one mana of any color. You get them from <i-c>Black Market Connections</i-c>, and <i-c>Gonti, Night Minister</i-c>. They're also tokens and artifacts for <i-c>Beseech the Mirror</i-c>'s bargain.", cards: ["Black Market Connections", "Gonti, Night Minister", "Beseech the Mirror"] },
 { term: "Cumulative upkeep", html: "At the beginning of your upkeep, put an age counter on the permanent, then pay the cost once per age counter or sacrifice it. <i-c>Mystic Remora</i-c> costs {1}, then {2}, then {3}.", cards: ["Mystic Remora"] },
 { term: "Overload", html: "Cast the spell for its overload cost to change 'target' to 'each'. <i-c>Cyclonic Rift</i-c> overloaded bounces every nonland permanent you don't control.", cards: ["Cyclonic Rift"] },
 { term: "Fear", html: "The creature can't be blocked except by artifact creatures and/or black creatures. <i-c>Dimir House Guard</i-c> has it.", cards: ["Dimir House Guard"] },
 { term: "Extra turn", html: "A turn taken right after the current one. <i-c>Wormfang Manta</i-c> gives one each time it leaves the battlefield face up. With <i-c>Scroll of Fate</i-c> and <i-c>Crystal Shard</i-c> you repeat it every turn, which is infinite turns.", cards: ["Wormfang Manta", "Scroll of Fate", "Crystal Shard", "Otawara, Soaring City"] },
 { term: "Infinite combo", html: "Two or more cards that repeat a loop as many times as you like. Here: <i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with any of five lifegain payoffs, and <i-c>Mindcrank</i-c> with <i-c>Duskmantle Guildmage</i-c>. Announce the result and show the loop; you don't have to act out every step.", cards: ["Exquisite Blood", "Bloodthirsty Conqueror", "Marauding Blight-Priest", "Mindcrank", "Duskmantle Guildmage"] },
 { term: "Game Changers", html: "A list of cards that strongly change a Commander game, used by the bracket system. Brackets 1 to 3 limit them; Bracket 4 has no limit. This deck has nine: Necropotence, Imperial Seal, Demonic Tutor, Vampiric Tutor, Opposition Agent, Notion Thief, Rhystic Study, Fierce Guardianship and Cyclonic Rift.", cards: ["Necropotence", "Imperial Seal", "Demonic Tutor", "Vampiric Tutor", "Opposition Agent", "Notion Thief", "Rhystic Study", "Fierce Guardianship", "Cyclonic Rift"] },
 { term: "Bracket 4", html: "The 'optimized' Commander bracket: any number of Game Changers, two-card infinite combos, mass land denial and extra turns are allowed, and decks aim to win fast. It sits below cEDH (Bracket 5). This deck is mid to high Bracket 4 and wins around turns 6 to 8.", cards: [] },
 { term: "Tutor", html: "A card that searches your library for another card. This deck has fourteen, counting the four transmute cards, so the missing half of a combo is usually one tutor away.", cards: ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal", "Grim Tutor", "Diabolic Intent", "Beseech the Mirror", "Wishclaw Talisman"] },
 { term: "Fetch land", html: "A land you sacrifice, paying 1 life, to search for a land with a certain type. <i-c>Polluted Delta</i-c> finds an Island or Swamp card, including Watery Grave, Sunken Hollow and Undercity Sewers. When an opponent cracks one, the life they pay starts your vampire loop, and Opposition Agent can take the land.", cards: ["Polluted Delta", "Watery Grave", "Sunken Hollow", "Undercity Sewers", "Opposition Agent"] },
 { term: "Commander tax", html: "Each time you cast your commander from the command zone, it costs {2} more for each previous time. Etrata costs 3, then 5, then 7. Protect her: Fierce Guardianship and Deadly Rollick are only free while she's on the battlefield.", cards: ["Etrata, Deadly Fugitive", "Fierce Guardianship", "Deadly Rollick"] }
];

window.CETRATA_CUTS = [
 { name: "Brine Elemental", why: "Cut in v3: in 2,400 bot games it was one of the five weakest slots, and the Brine lock it started was one of the two slowest lines in the deck." },
 { name: "Vesuvan Shapeshifter", why: "Cut in v3 with Brine Elemental: it only did something as the second half of the Brine lock, which measured as one of the slowest lines in bot games." },
 { name: "Etrata, the Silencer", why: "Cut in v3: the hit list she finished was one of the two slowest lines, and she measured as one of the weakest slots in bot games." },
 { name: "Mari, the Killing Quill", why: "Cut in v3: she only mattered for the hit list, which was one of the slowest lines, and she measured as one of the weakest slots in bot games." },
 { name: "Dizzy Spell", why: "Cut in v3: the 1-mana transmute measured as one of the weakest slots in bot games, and Vampire of the Dire Moon is a better turn-1 play." },
 { name: "Expropriate", why: "Nine mana, or Scroll of Fate plus Etrata to cast it free. Either way it's slower than the two-card vampire court loop that replaced it." },
 { name: "Mindslaver", why: "Six mana plus four to activate for one stolen turn. It doesn't win by itself, and the list wants every slot to win or find a win." },
 { name: "Thieving Amalgam", why: "A seven-drop that manifests opponents' cards one upkeep at a time. Fun theft, but far too slow for turn 6 to 7 wins." },
 { name: "Silent-Blade Oni", why: "A seven-mana Ninja whose ninjutsu still costs six. Fallen Shinobi does the free-spell job for four." },
 { name: "Hostage Taker", why: "Strong but fair: it steals one creature or artifact. The slot went to a combo piece." },
 { name: "Gonti, Lord of Luxury", why: "One stolen card when it enters. Gonti, Night Minister steals on every hit and stays." },
 { name: "Tinybones, the Pickpocket", why: "A one-drop that only steals from graveyards. Changeling Outcast is the better cheap attacker for Etrata and Ramses." },
 { name: "Kheru Spellsnatcher", why: "Flipping it to counter and steal a spell is great fun but situational. It's on the weird-extras list if you want it back." },
 { name: "Whispering Madness", why: "A four-mana Windfall. Windfall costs three and does the same job with Notion Thief." },
 { name: "Phyrexian Arena", why: "One extra card a turn. Necropotence digs as deep as you need in the same three mana." },
 { name: "Bloodchief Ascension", why: "It combos with Mindcrank but needs three turns of quest counters. Duskmantle Guildmage does it right away." },
 { name: "Arcane Adaptation", why: "A third type enabler. Roshan and Leyline of Transformation already cover it, and the new loops don't need creature types." },
 { name: "Mischievous Sneakling", why: "A 2/2 flash changeling with no other text. Changeling Outcast costs one and can't be blocked." },
 { name: "Unstoppable Slasher", why: "A second halver for the double tap. Virtus with Bloodletter is enough; it's on the extras list." },
 { name: "Dimir Aqueduct", why: "A bounce land that enters tapped and sets you back a land drop early. The list wants fast, untapped mana." },
 { name: "Exotic Orchard", why: "Its colors depend on opponents' lands. Morphic Pool and Gloomlake Verge make {U} and {B} reliably." }
];

window.CETRATA_FAQ = [
 { q: "What changed in v3?", a: "Five cuts: Brine Elemental, Vesuvan Shapeshifter, Etrata, the Silencer, Mari, the Killing Quill and Dizzy Spell, which drops the Brine lock and the hit list. Five adds: <i-c>Enduring Tenacity</i-c> and <i-c>Starscape Cleric</i-c> (two more vampire loop payoffs) and <i-c>Vampire of the Dire Moon</i-c>, <i-c>Hooded Blightfang</i-c> and <i-c>Silumgar Assassin</i-c> (cheap blockers). In 2,400 paired bot games against precons, the win rate went from 49.7% to about 62%." },
 { q: "How does this deck win?", a: "With one of four combo lines: the vampire court loop (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c> with any of five payoffs: <i-c>Marauding Blight-Priest</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Sanguine Bond</i-c> or <i-c>Enduring Tenacity</i-c>), <i-c>Mindcrank</i-c> + <i-c>Duskmantle Guildmage</i-c>, the double tap (<i-c>Bloodletter of Aclazotz</i-c> + <i-c>Virtus the Veiled</i-c> + <i-c>Ramses, Assassin Lord</i-c>) and infinite turns (<i-c>Scroll of Fate</i-c> + <i-c>Wormfang Manta</i-c> + <i-c>Crystal Shard</i-c>). The vampire loop and the tutors carry the deck, cheap deathtouch blockers keep you alive until then, and Etrata steals cards along the way." },
 { q: "What do I tell the table before the game?", a: "That it's a Bracket 4 deck with nine Game Changers, many tutors, two-card infinite combos and an infinite extra turns loop. Say it often wins around turns 6 to 8 and steals cards from their libraries. It has no Thassa's Oracle and no Mana Vault." },
 { q: "Which line should I go for first?", a: "The one you're closest to. Two-card lines come first: Mindcrank + Guildmage (cheapest, works on an opponent's turn) and the vampire court loop (ten possible pairs). The Manta turns are next, since Etrata makes the flip cheap. The double tap needs three cards; go for it when the board already has most of the pieces." },
 { q: "What are the exact steps for the vampire court loop?", a: "Have a drain (<i-c>Exquisite Blood</i-c> or <i-c>Bloodthirsty Conqueror</i-c>) and a payoff (<i-c>Marauding Blight-Priest</i-c>, <i-c>Starscape Cleric</i-c>, <i-c>Vito, Thorn of the Dusk Rose</i-c>, <i-c>Sanguine Bond</i-c> or <i-c>Enduring Tenacity</i-c>) on the battlefield. Any opponent losing life or you gaining life starts it: an attack, a <i-c>Hooded Blightfang</i-c> trigger, <i-c>Vampire of the Dire Moon</i-c>'s lifelink, their own fetch land or shock land. You gain that much, the payoff makes opponents lose life, you gain again, and it repeats until every opponent is dead. With Vito, Bond or Tenacity, pick a new target as each player dies." },
 { q: "What are the exact steps for Mindcrank + Guildmage?", a: "With <i-c>Mindcrank</i-c> out, pay {1}{U}{B} for <i-c>Duskmantle Guildmage</i-c>'s first ability and let it resolve. Then get a card into an opponent's graveyard or make them lose life: they cast an instant, you attack, you pay {2}{U}{B} for the Guildmage's mill, or you sacrifice a stolen cloak to <i-c>Culling the Weak</i-c>. Each card milled costs them 1 life and each life lost mills a card. Doing it on an opponent's turn, in response to their spell, dodges sorcery-speed answers." },
 { q: "How does the double tap work?", a: "On your turn with <i-c>Bloodletter of Aclazotz</i-c> out, connect with <i-c>Virtus the Veiled</i-c>. Its 'lose half your life, rounded up' is doubled, so the player loses all of it. With <i-c>Ramses, Assassin Lord</i-c> out, that player was attacked by your Assassin, so you win the game. Careful: Ramses makes Virtus a 2/2, so <i-c>Tetsuko Umezawa, Fugitive</i-c> no longer makes it unblockable. Use <i-c>Rogue's Passage</i-c> or attack a player with no untapped blockers." },
 { q: "How do the infinite turns work?", a: "Tap <i-c>Scroll of Fate</i-c> to manifest <i-c>Wormfang Manta</i-c> from your hand: it's face down, so no 'skip your next turn'. Flip it with Etrata for {2}{U}{B}. Attack with it if you like. Then pay {U} and tap <i-c>Crystal Shard</i-c> to return it to your hand (don't pay the {1}). It left the battlefield face up, so you take an extra turn. Everything untaps; repeat for 5 mana a turn, or 3 with <i-c>Training Grounds</i-c>. Each turn you draw, attack and steal more." },
 { q: "How does Etrata's flip work?", a: "Every face-down creature you control has '{2}{U}{B}: turn this face up'. A permanent card turns face up and stays. An instant or sorcery can't, so it's exiled and you may cast it free. It's an activated ability, so <i-c>Training Grounds</i-c> makes it {U}{B}. Turning face up isn't casting or entering, so the Manta's enters trigger never happens, while <i-c>Silumgar Assassin</i-c>'s 'when turned face up' does. Flipping Silumgar Assassin this way gives no +1/+1 counter; its own megamorph flip does." },
 { q: "How do Wishclaw Talisman and Scheming Symmetry help opponents?", a: "<i-c>Wishclaw Talisman</i-c> goes to an opponent after you use it, and they can tutor with it on their turn. <i-c>Scheming Symmetry</i-c> gives an opponent a tutor too. Use Wishclaw on the turn you win, and pick the player least able to use Symmetry. With <i-c>Opposition Agent</i-c> out, you control their search and the card they find is exiled for you to play." },
 { q: "Why not tap out on turn 3?", a: "Real games punished it: Etrata came down late and there were too few blockers. On turn 3, prefer a play that leaves you defended, like a face-down <i-c>Silumgar Assassin</i-c> (a 2/2 that can flip for {2}{B} to kill an attacker) or <i-c>Hooded Blightfang</i-c>, and keep <i-c>Vampire of the Dire Moon</i-c> home as a deathtouch blocker." },
 { q: "What hand should I keep?", a: "Two or three lands plus a rock, and either a combo piece, a tutor or a strong draw engine like <i-c>Necropotence</i-c> or <i-c>Rhystic Study</i-c>. <i-c>Leyline of Transformation</i-c> in the opener is a bonus. Mulligan hands with one land and no rocks, or with lots of mana and nothing to do." },
 { q: "What hurts this deck most?", a: "Graveyard hate like Rest in Peace stops Mindcrank's loop. 'Players can't gain life' effects stop the vampire court. Cursed Totem stops Etrata's flip and the Guildmage. Drannith Magistrate stops you casting stolen cards from exile. Enchantment removal hits Exquisite Blood and Sanguine Bond. Fight them with <i-c>Cyclonic Rift</i-c>, <i-c>Otawara, Soaring City</i-c>, <i-c>Deadly Rollick</i-c> and your counters, or switch to a line they don't stop." },
 { q: "Does Tetsuko work with Ramses?", a: "Not for Assassins. <i-c>Ramses, Assassin Lord</i-c> gives other Assassins +1/+1, so Etrata becomes a 2/5 and Virtus a 2/2, out of <i-c>Tetsuko Umezawa, Fugitive</i-c>'s range. Vito stays a 1/3 (he's not an Assassin), Changeling Outcast is unblockable anyway, and the Manta stays a 6/1 unless Roshan or Leyline made it an Assassin." },
 { q: "How much does it cost?", a: "About $1,121, or around 950€, using the cheapest legal regular printing of each card. The biggest are Imperial Seal ($180), Mox Amber ($87), Fierce Guardianship ($66), Rhystic Study ($64) and Demonic Tutor ($63). Check Cardmarket before buying." },
 { q: "How fast is it?", a: "In an 8,000-game simulation against opponents who answer 30% of combo attempts, it won by turn 6 in 25% of games, by turn 7 in 40% and by turn 8 in 52%. Against no answers, 32%, 50% and 64%. The sim ignores stolen cards and most combat damage, so real games can be faster." }
];
