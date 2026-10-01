/* Card wiki extras for the Corrupted Miku deck: per-card ratings, rulings, tips and combos,
   plus the glossary, the cut list and the FAQ. Card names match window.CORRUPTED_CARDS exactly. */
window.CORRUPTED_WIKI = {
 "Shalai, Voice of Plenty": {
  rating: 5,
  when: "Turns 2-4, before your combo pieces",
  tags: ["commander", "legendary", "hexproof", "flying", "mana sink", "precon"],
  rulings: [
   { q: "Does Shalai have hexproof herself?", a: "No. She gives hexproof to 'other creatures you control'. Opponents can still target her. <i-c>Giver of Runes</i-c>, <i-c>Lightning Greaves</i-c> and <i-c>Flawless Maneuver</i-c> are how you protect her." },
   { q: "Can I still target my own creatures?", a: "Yes. Hexproof only stops spells and abilities your opponents control. Your <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Giver of Runes</i-c> and equip abilities work normally." },
   { q: "Does her ability put a counter on Shalai too?", a: "Yes. It puts a +1/+1 counter on each creature you control, Shalai included." },
   { q: "Does my hexproof stop a board wipe or 'each opponent loses life'?", a: "No. Hexproof only stops targeting. Wipes, edicts and effects that say 'each opponent' still work on you." }
  ],
  tips: [
   "A +1/+1 counter and a -1/-1 counter on the same creature cancel out. One activation repairs a <i-c>Devoted Druid</i-c> that has a -1/-1 counter.",
   "With <i-c>Kutzil, Malamet Exemplar</i-c> out, one activation makes every creature's power higher than its base power, so Kutzil draws you a card when they connect."
  ],
  combos: ["Devoted Druid", "Vizier of Remedies", "Walking Ballista", "Kutzil, Malamet Exemplar", "Gavony Township"]
 },
 "Llanowar Elves": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop", "precon"],
  rulings: [
   { q: "Can it tap for mana the turn I play it?", a: "No. It has summoning sickness, so its {T} ability can't be used until you've controlled it since the start of your turn." },
   { q: "Can it help convoke Chord of Calling the turn it comes in?", a: "Yes. Convoke isn't a {T} ability, so a summoning-sick creature can tap to help pay for <i-c>Chord of Calling</i-c>. It can't also tap for mana in the same turn." }
  ],
  tips: [
   "With <i-c>Badgermole Cub</i-c> out, it makes {G}{G} each time it taps for mana."
  ],
  combos: ["Gaea's Cradle", "Badgermole Cub", "Natural Order"]
 },
 "Elvish Mystic": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop"],
  rulings: [
   { q: "What happens if I equip Skullclamp to it?", a: "It becomes a 2/0 and dies as a state-based action. <i-c>Skullclamp</i-c> triggers and you draw two cards." },
   { q: "Can I sacrifice it to Natural Order?", a: "Yes, it's a green creature. The sacrifice is part of the cost, so if <i-c>Natural Order</i-c> is countered, the elf stays in the graveyard." }
  ],
  tips: [
   "A dork that has done its job is often best spent as <i-c>Skullclamp</i-c> food for two cards."
  ],
  combos: ["Gaea's Cradle", "Badgermole Cub", "Natural Order"]
 },
 "Fyndhorn Elves": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop"],
  rulings: [
   { q: "Can Green Sun's Zenith or Summoner's Pact find it?", a: "Yes. It's a green creature with mana value 1. <i-c>Green Sun's Zenith</i-c> with X=1 puts it onto the battlefield, but on turn 1 you're usually better off fetching something else." },
   { q: "Does Linvala stop it?", a: "Your own <i-c>Linvala, Keeper of Silence</i-c> only stops creatures your opponents control. An opponent's Linvala would stop your dorks." }
  ],
  tips: [
   "Count your dorks before choosing who to attack: an opponent's creature wipe takes all of them."
  ],
  combos: ["Gaea's Cradle", "Badgermole Cub", "Natural Order"]
 },
 "Birds of Paradise": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop", "fixing", "flying"],
  rulings: [
   { q: "Can it make colorless mana?", a: "No. 'One mana of any color' means white, blue, black, red or green. That's fine here: you need {G} and {W}." },
   { q: "What does Skullclamp do to it?", a: "It becomes a 1/0 and dies right away. You draw two cards." }
  ],
  tips: [
   "It's a green creature for <i-c>Natural Order</i-c> and <i-c>Summoner's Pact</i-c>, even though it makes white too."
  ],
  combos: ["Gaea's Cradle", "Badgermole Cub", "Natural Order"]
 },
 "Avacyn's Pilgrim": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop", "precon"],
  rulings: [
   { q: "Is it a green or white creature?", a: "Green. Its color comes from its mana cost, {G}. It makes {W}. So <i-c>Natural Order</i-c>, <i-c>Summoner's Pact</i-c> and <i-c>Green Sun's Zenith</i-c> can all use or find it." },
   { q: "Can Cavern of Souls make it uncounterable?", a: "Yes, if you named Human. It's a Human Monk." }
  ],
  tips: [
   "It's the most common Human in the deck after the stax creatures, so naming Human on <i-c>Cavern of Souls</i-c> also covers it."
  ],
  combos: ["Gaea's Cradle", "Badgermole Cub", "Natural Order"]
 },
 "Delighted Halfling": {
  rating: 4,
  when: "Turn 1",
  tags: ["mana dork", "1-drop", "uncounterable", "legendary support"],
  rulings: [
   { q: "Can its colored mana pay for Shalai's {4}{G}{G} ability?", a: "No. That mana can only be spent to cast a legendary spell. For abilities, use its {T}: Add {C} ability instead." },
   { q: "Do I have to pay the whole cost with Halfling mana for the spell to be uncounterable?", a: "No. Spending at least one mana from its second ability on a legendary spell makes that spell uncounterable." },
   { q: "Which legendary spells are in the deck?", a: "<i-c>Shalai, Voice of Plenty</i-c>, <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c>, <i-c>Thalia, Heretic Cathar</i-c>, <i-c>Linvala, Keeper of Silence</i-c>, <i-c>Vorinclex, Voice of Hunger</i-c> and <i-c>The One Ring</i-c>." }
  ],
  tips: [
   "It has toughness 2, so <i-c>Recruiter of the Guard</i-c> can find it."
  ],
  combos: ["Shalai, Voice of Plenty", "Heliod, Sun-Crowned", "Vorinclex, Voice of Hunger"]
 },
 "Elvish Spirit Guide": {
  rating: 3,
  when: "The turn the extra {G} matters",
  tags: ["free mana", "pitch fodder", "one-shot"],
  rulings: [
   { q: "Is exiling it a spell? Can Silence stop it?", a: "No. It's a mana ability you activate from your hand. It doesn't use the stack and isn't a spell, so <i-c>Silence</i-c>, counterspells and <i-c>Deafening Silence</i-c> don't care about it." },
   { q: "Can I exile it to pay for Force of Vigor or Endurance?", a: "Yes. It's a green card in your hand, so it works as the exiled card for <i-c>Force of Vigor</i-c>'s free cost or <i-c>Endurance</i-c>'s evoke. You don't get its {G} then." },
   { q: "Can I cast it as a creature?", a: "Yes, for {2}{G}, as a 2/2. That's rarely worth it, but it's a body for <i-c>Gaea's Cradle</i-c> in a long game." }
  ],
  tips: [
   "It's one-shot mana. Spending it on turn 1 for a dork is fine only if that dork leads to a turn-2 Shalai."
  ],
  combos: ["Force of Vigor", "Endurance", "Chrome Mox"]
 },
 "Badgermole Cub": {
  rating: 4,
  when: "Turn 2, after a dork",
  tags: ["2-drop", "mana doubler", "earthbend", "green creature"],
  rulings: [
   { q: "Can the earthbent land tap for mana right away?", a: "Yes. It has haste, so its {T} ability works the turn it becomes a creature. Because it's now a creature you tapped for mana, the Cub adds an extra {G}." },
   { q: "How long does earthbend last?", a: "There's no end to it. The land stays a 0/0 creature with a +1/+1 counter and haste. If it dies or is exiled, it comes back tapped, as a new ordinary land." },
   { q: "Does tapping a creature to convoke Chord of Calling trigger the Cub?", a: "No. Convoke isn't tapping for mana, so there's no extra {G}." },
   { q: "Does it work with Devoted Druid and Vizier?", a: "Yes. Each time you tap <i-c>Devoted Druid</i-c> for mana you get {G}{G}. The combo was already infinite, it just makes the loop shorter." }
  ],
  tips: [
   "<i-c>Crop Rotation</i-c> can sacrifice an earthbent land: it dies, so it comes back tapped, and you still fetch a land.",
   "An earthbent <i-c>Gaea's Cradle</i-c> is a legendary creature, so it also makes <i-c>Boseiju, Who Endures</i-c> and <i-c>Eiganjo, Seat of the Empire</i-c> cheaper."
  ],
  combos: ["Gaea's Cradle", "Devoted Druid", "Crop Rotation"]
 },
 "Devoted Druid": {
  rating: 5,
  when: "The turn before you combo",
  tags: ["combo piece", "infinite mana", "mana dork", "green creature"],
  rulings: [
   { q: "Can I use it the turn it comes in?", a: "Its untap ability has no {T} symbol, so you can activate it while summoning sick. Its {T}: Add {G} ability can't be used until you've controlled it since your turn began, unless it has haste." },
   { q: "How does it work with Vizier of Remedies?", a: "The untap ability's cost is 'put a -1/-1 counter on it'. <i-c>Vizier of Remedies</i-c> turns that into zero counters. The cost still counts as paid, so you untap it with no counter. Tap for {G}, untap, repeat: infinite green mana." },
   { q: "How many times can it untap without Vizier?", a: "Once safely: it goes from 0/2 to 0/1. The second untap makes it 0/0 and it dies. You can tap it for mana in between, so that's {G}{G} in one turn, or {G}{G}{G} if you're willing to lose it." },
   { q: "Does a +1/+1 counter help?", a: "Yes. A +1/+1 counter and a -1/-1 counter cancel out, so each <i-c>Shalai, Voice of Plenty</i-c> activation or Thune trigger gives it one more safe untap." }
  ],
  tips: [
   "The mana is only green. Ballista's {4}, Shalai's {4}{G}{G} and Finale's {X}{G}{G} can all use it. <i-c>Gavony Township</i-c> can't, it needs {W}.",
   "Chord of Calling at X=2, Green Sun's Zenith at X=2 and Summoner's Pact all find it."
  ],
  combos: ["Vizier of Remedies", "Walking Ballista", "Shalai, Voice of Plenty", "Finale of Devastation"]
 },
 "Vizier of Remedies": {
  rating: 5,
  when: "The combo turn, after Devoted Druid",
  tags: ["combo piece", "2-drop", "human"],
  rulings: [
   { q: "Does Vizier need to be on the battlefield since my turn began?", a: "No. Its effect is static and works as soon as it's on the battlefield." },
   { q: "Does it stop -1/-1 effects like Toxic Deluge?", a: "No. It only changes -1/-1 counters. Effects that give -X/-X don't use counters." },
   { q: "Which tutors find it?", a: "<i-c>Recruiter of the Guard</i-c> (it's a 2/1), <i-c>Chord of Calling</i-c> with X=2, <i-c>Finale of Devastation</i-c> with X=2, <i-c>Eladamri's Call</i-c>, <i-c>Worldly Tutor</i-c>, <i-c>Formidable Speaker</i-c>, <i-c>Survival of the Fittest</i-c> and <i-c>Archdruid's Charm</i-c>. It's white, so green-only tutors like <i-c>Summoner's Pact</i-c> can't." }
  ],
  tips: [
   "It's a Human, so <i-c>Cavern of Souls</i-c> naming Human makes it uncounterable."
  ],
  combos: ["Devoted Druid", "Walking Ballista", "Shalai, Voice of Plenty"]
 },
 "Walking Ballista": {
  rating: 5,
  when: "The combo turn, or X=1 early as removal",
  tags: ["combo piece", "finisher", "artifact creature", "pinger"],
  rulings: [
   { q: "Can Chord of Calling or Finale of Devastation find it?", a: "They can find it, but it's useless. Put onto the battlefield without being cast, X is 0, so it enters with no counters and dies right away." },
   { q: "How does the Heliod loop work, and why does it need 2 counters?", a: "Pay {1}{W} so <i-c>Heliod, Sun-Crowned</i-c> gives it lifelink. Remove a counter to ping: you gain 1 life and Heliod puts a counter back on it. With only one counter, Ballista becomes 0/0 and dies before the trigger resolves, so the counter has nowhere to go. Start with 2 or more." },
   { q: "Can I ping in response to removal?", a: "Yes. Removing a counter is a cost and the ability works at instant speed. If an opponent tries to wipe it, remove all its counters in response." },
   { q: "Can Urza's Saga find it?", a: "No. Its mana cost is {X}{X}, not {0} or {1}." }
  ],
  tips: [
   "<i-c>Recruiter of the Guard</i-c> finds it (toughness 0). <i-c>Ranger-Captain of Eos</i-c> and <i-c>Brightglass Gearhulk</i-c> find it because its mana value in the library is 0."
  ],
  combos: ["Heliod, Sun-Crowned", "Devoted Druid", "Vizier of Remedies", "Archangel of Thune", "Spike Feeder"]
 },
 "Spike Feeder": {
  rating: 5,
  when: "Any time, combo is instant speed",
  tags: ["combo piece", "infinite life", "green creature", "instant speed"],
  rulings: [
   { q: "Does it get its counters if Chord of Calling or Green Sun's Zenith puts it onto the battlefield?", a: "Yes. 'Enters with two +1/+1 counters' is a replacement effect, not a trigger, so it gets them however it enters." },
   { q: "Walk me through the Thune loop.", a: "Remove a counter from Feeder: you gain 2 life. <i-c>Archangel of Thune</i-c> triggers and puts a +1/+1 counter on each creature you control, Feeder included. Feeder is back where it started and everything else is one counter bigger. Repeat as many times as you want." },
   { q: "Is Heliod plus Feeder infinite?", a: "Infinite life, yes. Remove a counter, gain 2, <i-c>Heliod, Sun-Crowned</i-c> puts a counter on target creature: put it on Feeder. Each loop nets 2 life. It doesn't kill anyone by itself." }
  ],
  tips: [
   "With Thune and <i-c>Walking Ballista</i-c> out, Ballista gets a counter every loop. Then remove them to ping each opponent to 0."
  ],
  combos: ["Archangel of Thune", "Heliod, Sun-Crowned", "Walking Ballista"]
 },
 "Heliod, Sun-Crowned": {
  rating: 5,
  when: "Turns 3-5, combo piece",
  tags: ["combo piece", "legendary", "indestructible", "enchantment"],
  rulings: [
   { q: "Is Heliod a creature?", a: "Only when your devotion to white is 5 or more. Devotion counts {W} symbols in the mana costs of permanents you control: Heliod counts 1, Shalai 1, Archangel of Thune 2, Grand Abolisher 2, and so on. Below 5, it's just an indestructible enchantment." },
   { q: "Which tutors can find it?", a: "It's a creature card in your library, so <i-c>Worldly Tutor</i-c>, <i-c>Eladamri's Call</i-c>, <i-c>Chord of Calling</i-c> with X=3, <i-c>Finale of Devastation</i-c> with X=3, <i-c>Survival of the Fittest</i-c> and <i-c>Formidable Speaker</i-c> find it. <i-c>Enlightened Tutor</i-c> finds it as an enchantment. It isn't green, so <i-c>Green Sun's Zenith</i-c> and <i-c>Summoner's Pact</i-c> can't." },
   { q: "Does it trigger once per point of life?", a: "No. Once per life-gain event. Gaining 2 from <i-c>Spike Feeder</i-c> is one trigger, one counter." },
   { q: "Can it give itself lifelink?", a: "No. Its ability targets 'another' creature." }
  ],
  tips: [
   "<i-c>Destiny Spinner</i-c> and <i-c>Delighted Halfling</i-c> both make it uncounterable. It's legendary and an enchantment spell."
  ],
  combos: ["Walking Ballista", "Spike Feeder", "Archangel of Thune"]
 },
 "Archangel of Thune": {
  rating: 5,
  when: "Turns 4-6, combo piece",
  tags: ["combo piece", "flying", "lifelink", "angel", "precon"],
  rulings: [
   { q: "How many counters does lifelink damage give?", a: "One per creature. Lifelink damage from one creature is one life-gain event, so Thune triggers once." },
   { q: "Does it work with Heliod at the same time?", a: "Yes. Each time you gain life both trigger. Thune puts a counter on each creature, and Heliod puts one more on a target creature or enchantment." },
   { q: "Can Green Sun's Zenith or Natural Order find it?", a: "No. It's white only. Use <i-c>Chord of Calling</i-c> or <i-c>Finale of Devastation</i-c> with X=5, <i-c>Eladamri's Call</i-c>, <i-c>Worldly Tutor</i-c>, <i-c>Archdruid's Charm</i-c>, <i-c>Formidable Speaker</i-c> or <i-c>Survival of the Fittest</i-c>." }
  ],
  tips: [
   "Every opponent fetch with <i-c>Archivist of Oghma</i-c> out gains you 1 life, so your whole team gets a counter.",
   "<i-c>Blind Obedience</i-c>'s extort gains life on each spell you cast: one Thune trigger each time."
  ],
  combos: ["Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Blind Obedience"]
 },
 "Grand Abolisher": {
  rating: 5,
  when: "Turn 2, or the turn before you combo",
  tags: ["silence", "2-drop", "human", "stax"],
  rulings: [
   { q: "Does it work on opponents' turns?", a: "No. Only during your turn. On their turn they can do anything." },
   { q: "What can opponents still do on my turn?", a: "Activate abilities of lands and cards in hand (like channel or cycling), and loyalty abilities, though those are sorcery speed anyway. Triggered abilities still trigger. They can't tap their mana dorks or mana rocks, since those are abilities of creatures and artifacts." },
   { q: "Does it stop my own spells?", a: "No. It only affects your opponents." }
  ],
  tips: [
   "It has toughness 2, so <i-c>Recruiter of the Guard</i-c> finds it.",
   "Pair it with <i-c>Kutzil, Malamet Exemplar</i-c> or <i-c>Voice of Victory</i-c> only if you need to. Abolisher alone already stops both spells and most abilities."
  ],
  combos: ["Devoted Druid", "Vizier of Remedies", "Heliod, Sun-Crowned", "Walking Ballista"]
 },
 "Kutzil, Malamet Exemplar": {
  rating: 4,
  when: "Turn 3 or the turn before you combo",
  tags: ["silence", "legendary", "card draw", "green creature"],
  rulings: [
   { q: "Does it stop abilities?", a: "No. Only spells. Opponents can still activate abilities, so a creature or artifact ability can still answer you. <i-c>Grand Abolisher</i-c> covers that." },
   { q: "What counts as 'power greater than its base power'?", a: "Any +1/+1 counter, Craterhoof's pump or Finale's pump. A creature with one counter from <i-c>Shalai, Voice of Plenty</i-c> qualifies." },
   { q: "How many cards does it draw?", a: "One per trigger. It triggers once each time one or more qualifying creatures deal combat damage to a player, so hitting two players can give two cards." }
  ],
  tips: [
   "It's green and white, so it's a green creature: <i-c>Green Sun's Zenith</i-c> with X=3, <i-c>Summoner's Pact</i-c> and <i-c>Natural Order</i-c> can find it or sacrifice it."
  ],
  combos: ["Shalai, Voice of Plenty", "Gavony Township", "Grand Abolisher"]
 },
 "Voice of Victory": {
  rating: 3,
  when: "Turn 2 or the turn before you combo",
  tags: ["silence", "2-drop", "mobilize", "human"],
  rulings: [
   { q: "What happens to the mobilize tokens?", a: "They enter tapped and attacking and are sacrificed at the beginning of the next end step." },
   { q: "Does it stop abilities?", a: "No, only spells. Abilities of creatures and artifacts still work for your opponents." },
   { q: "Can I use the tokens for Gaea's Cradle or convoke?", a: "They enter tapped, so they can't convoke. They do count for <i-c>Gaea's Cradle</i-c> until they're sacrificed." }
  ],
  tips: [
   "Equip <i-c>Skullclamp</i-c> to a 1/1 token after combat: it dies and you draw two. Equip is sorcery speed, so do it in your second main phase."
  ],
  combos: ["Skullclamp", "Gaea's Cradle"]
 },
 "Drannith Magistrate": {
  rating: 4,
  when: "Turn 2, or after an opposing commander dies",
  tags: ["stax", "2-drop", "human", "anti-commander"],
  rulings: [
   { q: "Can opponents cast their commanders?", a: "No. Not while it's on the battlefield. The command zone isn't their hand." },
   { q: "Does it affect me?", a: "No. Only your opponents." },
   { q: "What about cards that say 'play' a land from somewhere else?", a: "Playing a land isn't casting a spell, so it doesn't stop that. It only stops casting." }
  ],
  tips: [
   "It's a 1/3, so <i-c>Recruiter of the Guard</i-c> can't find it. <i-c>Eladamri's Call</i-c> and <i-c>Worldly Tutor</i-c> can."
  ],
  combos: ["Grand Abolisher", "Kutzil, Malamet Exemplar"]
 },
 "Thalia, Heretic Cathar": {
  rating: 3,
  when: "Turns 2-3",
  tags: ["stax", "legendary", "first strike", "human"],
  rulings: [
   { q: "Do opponents' fetched basics enter tapped?", a: "No. Basic lands aren't affected. The fetch land itself enters tapped, so they can't crack it the same turn for mana." },
   { q: "Can a creature with haste still attack?", a: "Not that turn. It enters tapped, and tapped creatures can't attack." },
   { q: "Does it slow my own creatures?", a: "No. Only your opponents' permanents." }
  ],
  tips: [
   "It's a 3/2, so <i-c>Recruiter of the Guard</i-c> can find it."
  ],
  combos: ["Blind Obedience", "Linvala, Keeper of Silence"]
 },
 "Linvala, Keeper of Silence": {
  rating: 3,
  when: "Turns 3-5 against creature decks",
  tags: ["stax", "legendary", "flying", "angel"],
  rulings: [
   { q: "Does it stop mana abilities?", a: "Yes. An opponent can't tap their Llanowar Elves for mana while Linvala is out. Mana abilities are activated abilities." },
   { q: "Does it stop triggered or static abilities?", a: "No. Only activated abilities of creatures your opponents control." },
   { q: "Does it stop my creatures?", a: "No. Your <i-c>Devoted Druid</i-c>, <i-c>Walking Ballista</i-c> and <i-c>Spike Feeder</i-c> work normally." }
  ],
  tips: [
   "It's an Angel, like <i-c>Shalai, Voice of Plenty</i-c> and <i-c>Archangel of Thune</i-c>: naming Angel on <i-c>Cavern of Souls</i-c> covers all three."
  ],
  combos: ["Shalai, Voice of Plenty", "Grand Abolisher"]
 },
 "Aven Mindcensor": {
  rating: 3,
  when: "Flash in response to a tutor or fetch",
  tags: ["stax", "flash", "flying", "anti-tutor"],
  rulings: [
   { q: "Can I flash it in after the tutor is cast?", a: "Yes. The search happens when the tutor resolves. If Mindcensor is on the battlefield by then, they search only the top four cards." },
   { q: "Does it affect my searches?", a: "No. Only your opponents'." },
   { q: "What if the card they want isn't in the top four?", a: "They find nothing, or only what's there. If the effect says to shuffle, they still shuffle." }
  ],
  tips: [
   "With <i-c>Path to Exile</i-c>, the opponent searches only the top four for a basic, and often gets nothing.",
   "It's a 2/1, so <i-c>Recruiter of the Guard</i-c> finds it."
  ],
  combos: ["Archivist of Oghma", "Path to Exile"]
 },
 "Destiny Spinner": {
  rating: 3,
  when: "Turn 2 against counterspells",
  tags: ["2-drop", "uncounterable", "enchantment creature", "green creature"],
  rulings: [
   { q: "Does it protect my tutors like Chord of Calling?", a: "No. Chord, Natural Order and Green Sun's Zenith are instants and sorceries. Only creature and enchantment spells are covered." },
   { q: "Does it protect my abilities too?", a: "No. Your creature and enchantment spells can't be countered by spells or abilities, but your activated and triggered abilities aren't spells, so it doesn't cover them." },
   { q: "What is X for its land ability?", a: "The number of enchantments you control, counted when the ability resolves. Destiny Spinner itself is an enchantment, so X is at least 1." }
  ],
  tips: [
   "It's an enchantment card, so <i-c>Enlightened Tutor</i-c> can find it."
  ],
  combos: ["Heliod, Sun-Crowned", "Archangel of Thune"]
 },
 "Esper Sentinel": {
  rating: 3,
  when: "Turn 1",
  tags: ["1-drop", "tax", "card draw", "artifact creature"],
  rulings: [
   { q: "Does it trigger for each opponent?", a: "Yes. It triggers on each opponent's first noncreature spell each turn, separately." },
   { q: "When is X checked?", a: "When the trigger resolves. If you grow it in response, they have to pay more." },
   { q: "Can Urza's Saga find it?", a: "No. Its mana cost is {W}, not {0} or {1}. <i-c>Ranger-Captain of Eos</i-c>, <i-c>Recruiter of the Guard</i-c> and <i-c>Brightglass Gearhulk</i-c> can." }
  ],
  tips: [
   "It's an artifact, so <i-c>Enlightened Tutor</i-c> can find it too."
  ],
  combos: ["Shalai, Voice of Plenty", "Skullclamp"]
 },
 "Archivist of Oghma": {
  rating: 3,
  when: "Flash, in response to a search",
  tags: ["flash", "card draw", "2-drop", "lifegain"],
  rulings: [
   { q: "Does it trigger on fetch lands?", a: "Yes. Cracking a fetch land searches the library, so you draw a card and gain 1 life. Each search is one trigger." },
   { q: "Does it trigger on my own searches?", a: "No. Only opponents'." },
   { q: "Do my Path to Exile and Boseiju trigger it?", a: "Yes, if the opponent chooses to search. <i-c>Path to Exile</i-c> and <i-c>Boseiju, Who Endures</i-c> let them search for a land, and that's their search." }
  ],
  tips: [
   "Each trigger is a separate life gain, so <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Archangel of Thune</i-c> trigger every time.",
   "It's a 2/2, so <i-c>Recruiter of the Guard</i-c> finds it."
  ],
  combos: ["Archangel of Thune", "Heliod, Sun-Crowned", "Aven Mindcensor"]
 },
 "Giver of Runes": {
  rating: 4,
  when: "Turn 1, then keep it untapped",
  tags: ["1-drop", "protection", "kor"],
  rulings: [
   { q: "Can it target itself?", a: "No. 'Another target creature'. Shalai gives it hexproof against opponents." },
   { q: "Can it protect against a board wipe?", a: "Only against wipes that deal damage of that color or that target. Wrath-style 'destroy all' effects don't target, so protection doesn't stop them." },
   { q: "Can it use its ability the turn it comes in?", a: "No. It has a {T} cost, so it needs to have been under your control since your turn began." }
  ],
  tips: [
   "<i-c>Ranger-Captain of Eos</i-c> and <i-c>Brightglass Gearhulk</i-c> both find it, since its mana value is 1."
  ],
  combos: ["Shalai, Voice of Plenty", "Ranger-Captain of Eos"]
 },
 "Eternal Witness": {
  rating: 3,
  when: "When the graveyard has what you need",
  tags: ["regrowth", "green creature", "3-drop"],
  rulings: [
   { q: "Does it have to return a card?", a: "No. 'You may'. If your graveyard is empty, it's just a 2/1." },
   { q: "Can it get back Teferi's Protection?", a: "No. <i-c>Teferi's Protection</i-c> exiles itself, so it never reaches your graveyard." },
   { q: "Can it get back Green Sun's Zenith?", a: "Only if Zenith was countered. When it resolves, it shuffles itself into your library." }
  ],
  tips: [
   "Late in the game, Witness plus <i-c>Skullclamp</i-c> returns a card and then draws two."
  ],
  combos: ["Natural Order", "Skullclamp"]
 },
 "Formidable Speaker": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["tutor", "green creature", "elf", "untapper"],
  rulings: [
   { q: "Do I have to discard to search?", a: "Yes. 'If you do' means no discard, no search." },
   { q: "Can I untap Gaea's Cradle with it?", a: "Yes. Pay {1}, tap Speaker, untap Cradle, then tap Cradle again. With three or more creatures, that's net mana. On Grim Monolith it's {1} for {C}{C}{C}." },
   { q: "Can I use the untap the turn it enters?", a: "No. It needs {T}, so it has to dodge summoning sickness, unless <i-c>Lightning Greaves</i-c> gives it haste." }
  ],
  tips: [
   "Discard <i-c>Craterhoof Behemoth</i-c> if you hold it: <i-c>Finale of Devastation</i-c> can get it from the graveyard.",
   "It's green, so <i-c>Green Sun's Zenith</i-c> at X=3 or <i-c>Summoner's Pact</i-c> finds it."
  ],
  combos: ["Gaea's Cradle", "Grim Monolith", "Mana Vault"]
 },
 "Recruiter of the Guard": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["tutor", "3-drop", "human"],
  rulings: [
   { q: "Which creatures can it find?", a: "Toughness 2 or less: <i-c>Walking Ballista</i-c>, <i-c>Spike Feeder</i-c>, <i-c>Devoted Druid</i-c>, <i-c>Vizier of Remedies</i-c>, <i-c>Grand Abolisher</i-c>, <i-c>Esper Sentinel</i-c>, <i-c>Aven Mindcensor</i-c>, <i-c>Thalia, Heretic Cathar</i-c>, <i-c>Archivist of Oghma</i-c>, <i-c>Giver of Runes</i-c>, <i-c>Solitude</i-c>, <i-c>Eternal Witness</i-c>, <i-c>Badgermole Cub</i-c>, <i-c>Elvish Spirit Guide</i-c> and the mana dorks." },
   { q: "Why can it find Spike Feeder and Ballista?", a: "It checks the toughness printed on the card in your library. Both are 0/0 there." },
   { q: "Which creatures can't it find?", a: "<i-c>Kutzil, Malamet Exemplar</i-c> (3/3), <i-c>Drannith Magistrate</i-c> (1/3), <i-c>Voice of Victory</i-c> (1/3), <i-c>Archangel of Thune</i-c>, <i-c>Linvala, Keeper of Silence</i-c> and the other big creatures." }
  ],
  tips: [
   "It's a 1/1, so <i-c>Skullclamp</i-c> turns it into two cards after it has done its job."
  ],
  combos: ["Walking Ballista", "Spike Feeder", "Vizier of Remedies"]
 },
 "Ranger-Captain of Eos": {
  rating: 4,
  when: "Turns 3-4, sacrifice on the combo turn",
  tags: ["tutor", "silence", "3-drop", "human"],
  rulings: [
   { q: "When can I sacrifice it?", a: "Any time you have priority, including on an opponent's turn. Sacrificing is the cost, so it doesn't need to tap and works the turn it enters." },
   { q: "Does it stop creature spells?", a: "No. Only noncreature spells. Opponents can still cast creatures and activate abilities." },
   { q: "Does it stop a spell already on the stack?", a: "No. It only stops new spells from being cast. Sacrifice it before you start, not in response to their counterspell." }
  ],
  tips: [
   "It can find <i-c>Dryad Arbor</i-c>: it's a creature card with mana value 0."
  ],
  combos: ["Walking Ballista", "Giver of Runes", "Heliod, Sun-Crowned"]
 },
 "Brightglass Gearhulk": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["tutor", "artifact creature", "green creature", "4-drop"],
  rulings: [
   { q: "What can it find?", a: "Up to two artifact, creature and/or enchantment cards with mana value 1 or less. For example <i-c>Walking Ballista</i-c>, <i-c>Sol Ring</i-c>, <i-c>Mana Vault</i-c>, <i-c>Chrome Mox</i-c>, <i-c>Mox Diamond</i-c>, <i-c>Lotus Petal</i-c>, <i-c>Skullclamp</i-c>, <i-c>Esper Sentinel</i-c>, <i-c>Giver of Runes</i-c>, <i-c>Deafening Silence</i-c>, <i-c>Dryad Arbor</i-c> and the dorks." },
   { q: "Can it find Lightning Greaves or The One Ring?", a: "No. Their mana values are 2 and 4." },
   { q: "Does it need {G}{G}{W}{W}?", a: "Yes, two of each. Birds, Gemstone Caverns and dual lands help." }
  ],
  tips: [
   "It's a green creature, so it can be <i-c>Natural Order</i-c> fodder after its trigger."
  ],
  combos: ["Walking Ballista", "Sol Ring", "Skullclamp"]
 },
 "Endurance": {
  rating: 3,
  when: "In response to a graveyard play",
  tags: ["free spell", "evoke", "flash", "graveyard hate", "green creature"],
  rulings: [
   { q: "How does evoke work?", a: "You cast it by exiling a green card from your hand instead of paying its mana cost. When it enters, you sacrifice it. Its enters ability still triggers, and you can order the triggers so the graveyard ability resolves first." },
   { q: "Does it shuffle the graveyard into the library?", a: "No. The cards go on the bottom in a random order." },
   { q: "Can I target myself?", a: "Yes. 'Up to one target player'. Rarely useful, but it can save you from a mill finisher." }
  ],
  tips: [
   "It's a green creature, so <i-c>Summoner's Pact</i-c> and <i-c>Green Sun's Zenith</i-c> at X=3 can find it as a flash blocker or graveyard answer."
  ],
  combos: ["Elvish Spirit Guide", "Force of Vigor"]
 },
 "Solitude": {
  rating: 4,
  when: "Instant speed, against a key creature",
  tags: ["free spell", "evoke", "flash", "removal", "lifelink"],
  rulings: [
   { q: "Who gains the life?", a: "The exiled creature's controller, equal to its power." },
   { q: "Can I evoke it and keep it?", a: "No. When an evoked creature enters, you sacrifice it. Its enters trigger still resolves." },
   { q: "Can it target Shalai or itself?", a: "Not itself, it says 'other'. It can target your own creatures, but you'd rarely want that." }
  ],
  tips: [
   "It's a 3/2, so <i-c>Recruiter of the Guard</i-c> can find it.",
   "Cast for full price, its lifelink damage triggers <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Archangel of Thune</i-c>."
  ],
  combos: ["Archangel of Thune", "Heliod, Sun-Crowned"]
 },
 "Craterhoof Behemoth": {
  rating: 4,
  when: "Late game, or with Natural Order",
  tags: ["finisher", "green creature", "8-drop", "haste"],
  rulings: [
   { q: "When is X counted?", a: "When the trigger resolves. Creatures that enter after that don't get the bonus." },
   { q: "Do the other creatures get haste?", a: "No. Only Craterhoof has haste. Creatures that came in this turn can't attack, unless <i-c>Finale of Devastation</i-c> with X of 10 or more or <i-c>Lightning Greaves</i-c> gives them haste." },
   { q: "Do mobilize tokens count?", a: "Yes, if they're on the battlefield when the trigger resolves. <i-c>Voice of Victory</i-c>'s tokens are created when it attacks, after Craterhoof's trigger, so they don't get the bonus." }
  ],
  tips: [
   "Count before you commit: lifelink and blockers change the math. Hoof is often 'kill one player' rather than 'kill the table'."
  ],
  combos: ["Natural Order", "Finale of Devastation", "Devoted Druid"]
 },
 "Vorinclex, Voice of Hunger": {
  rating: 3,
  when: "Via Natural Order, turns 3-5",
  tags: ["finisher", "legendary", "mana doubler", "soft lock", "precon"],
  rulings: [
   { q: "How much does it add for Gaea's Cradle?", a: "One extra mana, not double the Cradle. It adds 'one mana of any type that land produced', so Cradle tapping for five green gives one more {G}." },
   { q: "Which opponent lands stay tapped?", a: "Only lands they tapped for mana. A land tapped for another reason untaps normally." },
   { q: "Does it double my mana dorks?", a: "No. Only lands. <i-c>Badgermole Cub</i-c> handles creatures." }
  ],
  tips: [
   "It's legendary, so <i-c>Delighted Halfling</i-c> makes it uncounterable if you hard cast it."
  ],
  combos: ["Natural Order", "Gaea's Cradle", "Badgermole Cub"]
 },
 "Worldly Tutor": {
  rating: 4,
  when: "End of the opponent's turn before yours",
  tags: ["tutor", "instant", "1 mana"],
  rulings: [
   { q: "Do I draw the card right away?", a: "No. It goes on top of your library. You draw it with your next draw." },
   { q: "Does it reveal the card?", a: "Yes. Everyone sees what's coming." },
   { q: "Does Aven Mindcensor affect it?", a: "An opponent's Mindcensor would: you'd search only the top four cards. Your own doesn't." }
  ],
  tips: [
   "With <i-c>Sylvan Library</i-c> out, put the card on top at the end of the opponent's turn, then draw it plus two more in your draw step."
  ],
  combos: ["Walking Ballista", "Heliod, Sun-Crowned", "Sylvan Library"]
 },
 "Enlightened Tutor": {
  rating: 4,
  when: "End of the opponent's turn before yours",
  tags: ["tutor", "instant", "1 mana"],
  rulings: [
   { q: "Can it find Heliod and Walking Ballista?", a: "Yes. <i-c>Heliod, Sun-Crowned</i-c> is an enchantment card, and <i-c>Walking Ballista</i-c> is an artifact card." },
   { q: "Can it find Urza's Saga?", a: "Yes. <i-c>Urza's Saga</i-c> is an Enchantment Land." },
   { q: "Which creatures can it find?", a: "Artifact or enchantment creatures: <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Walking Ballista</i-c>, <i-c>Destiny Spinner</i-c>, <i-c>Esper Sentinel</i-c> and <i-c>Brightglass Gearhulk</i-c>." }
  ],
  tips: [
   "Like <i-c>Worldly Tutor</i-c>, it puts the card on top, so cast it before your draw."
  ],
  combos: ["Heliod, Sun-Crowned", "Walking Ballista"]
 },
 "Crop Rotation": {
  rating: 3,
  when: "When Cradle would make 3+ mana",
  tags: ["land tutor", "instant", "1 mana"],
  rulings: [
   { q: "Can I tap the land for mana before sacrificing it?", a: "Yes. Tap it for mana first, then sacrifice it as the cost. The new land comes in untapped and can tap right away, unless it says it enters tapped." },
   { q: "What happens if Urza's Saga comes in this way?", a: "It gets its first lore counter when it enters, so chapter I triggers. The next counter comes after your next draw step." },
   { q: "Does Gemstone Caverns get a luck counter if I fetch it?", a: "No. That only happens from your opening hand at the start of the game." }
  ],
  tips: [
   "Sacrifice an earthbent land from <i-c>Badgermole Cub</i-c>: it dies, so it returns tapped, and you still fetch a new land."
  ],
  combos: ["Gaea's Cradle", "Urza's Saga", "Badgermole Cub"]
 },
 "Eladamri's Call": {
  rating: 4,
  when: "End of the opponent's turn before yours",
  tags: ["tutor", "instant", "2 mana"],
  rulings: [
   { q: "Does the card go to my hand?", a: "Yes, revealed, then you shuffle." },
   { q: "Can it find Walking Ballista?", a: "Yes. Ballista is a creature card. Because you then cast it from your hand, you choose X normally." }
  ],
  tips: [
   "It's a green and white card, so it can be imprinted on <i-c>Chrome Mox</i-c> for either color."
  ],
  combos: ["Walking Ballista", "Heliod, Sun-Crowned"]
 },
 "Chord of Calling": {
  rating: 4,
  when: "End of an opponent's turn",
  tags: ["tutor", "instant", "convoke"],
  rulings: [
   { q: "How does convoke work with X?", a: "The total cost is {X}{G}{G}{G}. Each creature you tap pays {1} or one mana of its color. A green creature can pay one {G}. Summoning-sick creatures can convoke." },
   { q: "Can it get Walking Ballista?", a: "It can, but Ballista enters with 0 counters and dies. Don't." },
   { q: "Does Destiny Spinner or Cavern of Souls make Chord uncounterable?", a: "No. It's an instant, not a creature spell." }
  ],
  tips: [
   "Tap creatures for convoke before tapping your lands: dorks you tap for convoke can't also make mana, so count carefully."
  ],
  combos: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned"]
 },
 "Summoner's Pact": {
  rating: 3,
  when: "The combo turn, or when the upkeep is safe",
  tags: ["tutor", "free spell", "instant", "pact"],
  rulings: [
   { q: "What happens in my next upkeep?", a: "A trigger asks you to pay {2}{G}{G}. If you don't, you lose the game. You can tap mana dorks and rocks during your upkeep to pay." },
   { q: "What if Pact is countered?", a: "Then it never resolved, so there's no upkeep trigger. You don't owe anything." },
   { q: "Can Teferi's Protection save me from not paying?", a: "No. Protection and 'life can't change' don't stop 'you lose the game'." },
   { q: "Can it find Archangel of Thune, Heliod or Vizier?", a: "No. They're white, not green." }
  ],
  tips: [
   "Count your mana for next upkeep before casting it, and remember an opponent could destroy your lands or rocks before then."
  ],
  combos: ["Spike Feeder", "Devoted Druid", "Endurance"]
 },
 "Archdruid's Charm": {
  rating: 3,
  when: "Instant speed, flexible",
  tags: ["tutor", "instant", "removal", "modal"],
  rulings: [
   { q: "Does the land mode put the land in my hand?", a: "No. A land card goes onto the battlefield tapped. A creature card goes to your hand." },
   { q: "Can I get Dryad Arbor with it?", a: "Yes, and it counts as a land card, so it goes onto the battlefield tapped." },
   { q: "Does the bite mode need two targets?", a: "Yes: a creature you control and a creature you don't control. Opponents' creatures are fair game, but a creature with hexproof or shroud can't be targeted." }
  ],
  tips: [
   "{G}{G}{G} is a lot of green. Dorks and <i-c>Gaea's Cradle</i-c> help."
  ],
  combos: ["Walking Ballista", "Gaea's Cradle"]
 },
 "Swords to Plowshares": {
  rating: 4,
  when: "Instant speed, against a key creature",
  tags: ["removal", "instant", "1 mana", "exile", "precon"],
  rulings: [
   { q: "Who gains the life?", a: "The exiled creature's controller, equal to its power." },
   { q: "Can I target my own creature?", a: "Yes. Shalai's hexproof only stops opponents. Exiling your own creature gains you life, which triggers <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Archangel of Thune</i-c>, but that's rarely worth a creature." },
   { q: "Can a commander go to the command zone instead?", a: "Yes. Its owner may put it into the command zone. It costs {2} more next time they cast it from there." }
  ],
  tips: [
   "Against indestructible threats, exile beats destroy."
  ],
  combos: ["Path to Exile", "Solitude"]
 },
 "Path to Exile": {
  rating: 4,
  when: "Instant speed, against a key creature",
  tags: ["removal", "instant", "1 mana", "exile", "precon"],
  rulings: [
   { q: "Does the basic land enter untapped?", a: "No. It enters tapped." },
   { q: "Does it trigger my Archivist of Oghma?", a: "Yes, if they choose to search. Searching the library is what <i-c>Archivist of Oghma</i-c> watches for." },
   { q: "What does Aven Mindcensor do to it?", a: "With <i-c>Aven Mindcensor</i-c> out, they search only the top four cards, and often find no basic." }
  ],
  tips: [
   "Early in the game, prefer <i-c>Swords to Plowshares</i-c>: life matters less than a land."
  ],
  combos: ["Archivist of Oghma", "Aven Mindcensor"]
 },
 "Generous Gift": {
  rating: 4,
  when: "Instant speed, against the worst permanent",
  tags: ["removal", "instant", "flexible"],
  rulings: [
   { q: "Who gets the Elephant?", a: "The controller of the destroyed permanent, even if the permanent is indestructible and doesn't die." },
   { q: "Does it work on indestructible permanents?", a: "It doesn't destroy them, but the Elephant token is still created." }
  ],
  tips: [
   "It's the only card here that answers an opposing planeswalker at instant speed."
  ],
  combos: ["Force of Vigor", "Boseiju, Who Endures"]
 },
 "Force of Vigor": {
  rating: 4,
  when: "Free on an opponent's turn",
  tags: ["removal", "free spell", "instant", "artifact hate"],
  rulings: [
   { q: "Can I cast it free on my turn?", a: "No. Only if it's not your turn. On your turn you pay {2}{G}{G}." },
   { q: "Can I exile Elvish Spirit Guide for it?", a: "Yes. <i-c>Elvish Spirit Guide</i-c> is a green card in your hand." },
   { q: "Does it need two targets?", a: "No. 'Up to two', so one is fine." }
  ],
  tips: [
   "Good green cards to exile: <i-c>Elvish Spirit Guide</i-c>, an extra mana dork, or a tutor you won't need."
  ],
  combos: ["Elvish Spirit Guide", "Generous Gift"]
 },
 "Veil of Summer": {
  rating: 3,
  when: "In response to a counterspell",
  tags: ["protection", "instant", "1 mana", "anti-counter"],
  rulings: [
   { q: "Does it save a spell from a counterspell already on the stack?", a: "Yes. Cast it in response. When the counterspell resolves, your spell can't be countered, so the counterspell does nothing to it." },
   { q: "Does it stop a blue board wipe?", a: "No. Hexproof only stops targeting. A wipe that doesn't target still works." },
   { q: "When does the draw check?", a: "When Veil resolves. If an opponent cast a blue or black spell earlier this turn, you draw." }
  ],
  tips: [
   "It's a green card, so you can exile it to <i-c>Force of Vigor</i-c> or <i-c>Endurance</i-c> when you don't need it."
  ],
  combos: ["Natural Order", "Chord of Calling"]
 },
 "Silence": {
  rating: 4,
  when: "Your combo turn, or an opponent's upkeep",
  tags: ["silence", "instant", "1 mana"],
  rulings: [
   { q: "Does it stop spells already on the stack?", a: "No. It only stops new spells from being cast after it resolves. It can't answer a spell they already cast." },
   { q: "Does it stop abilities?", a: "No. Activated abilities, triggered abilities and land plays still work. Add <i-c>Grand Abolisher</i-c> if creature or artifact abilities are the threat." },
   { q: "Can they respond to Silence itself?", a: "Yes, with an instant before it resolves. That's why you cast it first, before revealing your plan." }
  ],
  tips: [
   "Under <i-c>Deafening Silence</i-c>, Silence uses your one noncreature spell for the turn. Your combo creatures can still be cast."
  ],
  combos: ["Orim's Chant", "Grand Abolisher"]
 },
 "Orim's Chant": {
  rating: 3,
  when: "Your combo turn, or an opponent's upkeep",
  tags: ["silence", "instant", "kicker", "fog"],
  rulings: [
   { q: "Does it hit only one player?", a: "Yes, unlike <i-c>Silence</i-c>. Pick the player with open blue mana or the one about to win." },
   { q: "When do I have to cast it to stop attacks?", a: "Before attackers are declared, so in their main phase or at the beginning of combat. Once creatures are attacking, it's too late." },
   { q: "Does the kicker stop my creatures too?", a: "Yes. 'Creatures can't attack this turn' affects everyone, you included." }
  ],
  tips: [
   "A player with hexproof, like one with Leyline of Sanctity, can't be targeted by it."
  ],
  combos: ["Silence", "Grand Abolisher"]
 },
 "Reprieve": {
  rating: 3,
  when: "In response to a key spell",
  tags: ["interaction", "instant", "cantrip", "white counter"],
  rulings: [
   { q: "Does it work on uncounterable spells?", a: "Yes. 'Can't be countered' doesn't stop a spell from being returned to its owner's hand." },
   { q: "What happens to a commander spell?", a: "Its owner may put it into the command zone instead of their hand. Either way, it wasn't cast successfully, and casting it again from the command zone costs {2} more." },
   { q: "Do they get their mana back?", a: "No. The mana they spent is gone." }
  ],
  tips: [
   "Against a big X spell, Reprieve wastes their whole turn of mana."
  ],
  combos: ["Silence", "Teferi's Protection"]
 },
 "Teferi's Protection": {
  rating: 5,
  when: "In response to a wipe or a lethal attack",
  tags: ["protection", "phasing", "instant"],
  rulings: [
   { q: "What does phasing out do?", a: "Your permanents are treated as though they don't exist until your next untap step. They don't leave the battlefield, so nothing dies or enters, and counters and attached Equipment stay with them." },
   { q: "Can I gain life while it's active?", a: "No. Your life total can't change, so <i-c>Spike Feeder</i-c> gains nothing and <i-c>Archangel of Thune</i-c> and <i-c>Heliod, Sun-Crowned</i-c> don't trigger." },
   { q: "Does it stop a 'you lose the game' effect?", a: "No. It stops damage, targeting and life changes, not an effect that makes you lose." },
   { q: "Is Shalai still on the battlefield for Flawless Maneuver?", a: "No. She's phased out, so you don't control a commander until she phases in." }
  ],
  tips: [
   "It exiles itself, so <i-c>Eternal Witness</i-c> can't get it back."
  ],
  combos: ["Spike Feeder", "Shalai, Voice of Plenty"]
 },
 "Flawless Maneuver": {
  rating: 4,
  when: "In response to a destroy wipe",
  tags: ["protection", "free spell", "instant", "indestructible"],
  rulings: [
   { q: "What counts as controlling a commander?", a: "Shalai, or any commander, on the battlefield under your control. In the command zone she doesn't count." },
   { q: "What doesn't it stop?", a: "Exile, bounce, sacrifice, and -X/-X effects like Toxic Deluge. Indestructible only stops destroy and lethal damage." },
   { q: "Does it save Shalai from Swords to Plowshares?", a: "No. Exile isn't destroy." }
  ],
  tips: [
   "Under <i-c>Deafening Silence</i-c> it still uses your one noncreature spell for the turn, even if it's free."
  ],
  combos: ["Shalai, Voice of Plenty", "Teferi's Protection"]
 },
 "Natural Order": {
  rating: 5,
  when: "Turns 3-5",
  tags: ["tutor", "sorcery", "cheat", "green creature"],
  rulings: [
   { q: "What can I sacrifice?", a: "Any green creature you control: dorks, <i-c>Dryad Arbor</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c>, <i-c>Brightglass Gearhulk</i-c>. An earthbent land isn't green, so it doesn't qualify." },
   { q: "What if Natural Order is countered?", a: "The sacrificed creature is still gone. The sacrifice is part of the cost." },
   { q: "Can it get Archangel of Thune or Heliod?", a: "No. Both are white. Only green creature cards." }
  ],
  tips: [
   "<i-c>Spike Feeder</i-c> is a legal target too, when you already have Thune or Heliod out."
  ],
  combos: ["Craterhoof Behemoth", "Vorinclex, Voice of Hunger", "Dryad Arbor"]
 },
 "Green Sun's Zenith": {
  rating: 4,
  when: "Any turn, scaled by X",
  tags: ["tutor", "sorcery", "green creature"],
  rulings: [
   { q: "Does it go back into my library even if I find nothing?", a: "Yes. When it resolves, it shuffles itself into your library whatever happened." },
   { q: "What if it's countered?", a: "Then it doesn't resolve, so it goes to your graveyard like any countered spell." },
   { q: "Can it get Dryad Arbor with X=0?", a: "Yes. <i-c>Dryad Arbor</i-c> is a green creature card with mana value 0. It comes in untapped but summoning sick." },
   { q: "Can it get Archangel of Thune or Vizier of Remedies?", a: "No. They're white." }
  ],
  tips: [
   "Because it shuffles back, you can find it again later with a tutor or draw."
  ],
  combos: ["Spike Feeder", "Devoted Druid", "Dryad Arbor"]
 },
 "Finale of Devastation": {
  rating: 4,
  when: "Mid game as a tutor, or the kill with X=10+",
  tags: ["tutor", "sorcery", "finisher", "precon"],
  rulings: [
   { q: "Does the creature I fetch get the +X/+X and haste?", a: "Yes. It's on the battlefield before the pump applies, so it gets the bonus too." },
   { q: "With Craterhoof, does everyone get both bonuses?", a: "Yes. Finale's +X/+X and haste apply first, then Craterhoof's trigger resolves and adds its own +X/+X and trample." },
   { q: "Can it get a creature from my graveyard?", a: "Yes, from your library and/or graveyard. You only shuffle if you searched the library." },
   { q: "Can it get Walking Ballista?", a: "It can, but Ballista enters with 0 counters and dies." }
  ],
  tips: [
   "It's a noncreature spell, so <i-c>Destiny Spinner</i-c> doesn't protect it. Cast it with <i-c>Grand Abolisher</i-c> or <i-c>Silence</i-c> on the combo turn."
  ],
  combos: ["Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"]
 },
 "Nature's Lore": {
  rating: 3,
  when: "Turn 2",
  tags: ["ramp", "sorcery", "precon"],
  rulings: [
   { q: "Can it get Savannah or Temple Garden?", a: "Yes. They have the Forest type. It says 'Forest card', not basic." },
   { q: "Does Temple Garden come in untapped?", a: "Only if you pay 2 life as it enters. Nature's Lore doesn't make it untapped by itself." },
   { q: "What about Canopy Vista?", a: "It enters tapped unless you control two or more basic lands." }
  ],
  tips: [
   "Savannah is usually the best target: it's a Forest and a Plains with no drawback."
  ],
  combos: ["Savannah", "Dryad Arbor"]
 },
 "Sylvan Library": {
  rating: 4,
  when: "Turns 1-2",
  tags: ["card selection", "enchantment", "2 mana"],
  rulings: [
   { q: "Which cards can I put back?", a: "Any two cards in your hand that you drew this turn. That includes the normal draw, so you can keep the two extra cards and put back your first one." },
   { q: "Can I pay life while Teferi's Protection is active?", a: "No. Your life total can't change, so you can't pay 4 life. You have to put both cards back." },
   { q: "Does shuffling undo it?", a: "Yes. If you crack a fetch land after setting up the top, the order is lost. Fetch before your draw step, or don't fetch after." }
  ],
  tips: [
   "After <i-c>Worldly Tutor</i-c> or <i-c>Enlightened Tutor</i-c>, the tutored card is one of the three you see."
  ],
  combos: ["Worldly Tutor", "Enlightened Tutor"]
 },
 "Survival of the Fittest": {
  rating: 4,
  when: "Turns 2-3",
  tags: ["tutor", "enchantment", "repeatable"],
  rulings: [
   { q: "Can I use it more than once a turn?", a: "Yes, as long as you have {G} and a creature card to discard each time." },
   { q: "Can I discard and find the same card type?", a: "Yes. Discard any creature card, find any creature card." },
   { q: "Can I discard Elvish Spirit Guide?", a: "Yes, it's a creature card. Note you can't use it for mana and discard it both." }
  ],
  tips: [
   "Chain it: discard a dork for <i-c>Formidable Speaker</i-c>, then use Speaker's discard on something else."
  ],
  combos: ["Craterhoof Behemoth", "Finale of Devastation", "Heliod, Sun-Crowned"]
 },
 "Smothering Tithe": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["ramp", "enchantment", "treasure", "tax"],
  rulings: [
   { q: "Does it trigger on every card they draw?", a: "Yes, each card. A player who draws three cards has three triggers, and decides each time whether to pay." },
   { q: "Can they pay with any mana?", a: "Yes, they need {2} when the trigger resolves. Tapping out on their turn makes paying hard." }
  ],
  tips: [
   "The Treasures are artifacts, so they count for <i-c>Urza's Saga</i-c>'s Construct tokens."
  ],
  combos: ["Esper Sentinel", "Urza's Saga"]
 },
 "Deafening Silence": {
  rating: 3,
  when: "Turn 1-2 against spell decks",
  tags: ["stax", "enchantment", "1 mana", "symmetric"],
  rulings: [
   { q: "Does it affect me?", a: "Yes. You can also cast only one noncreature spell each turn. Chrome Mox then Sol Ring on the same turn isn't possible." },
   { q: "Do lands, abilities and creature spells count?", a: "No. Playing a land isn't casting a spell. Abilities aren't spells. Creature spells don't count, so your combo creatures are fine." },
   { q: "Do free spells count?", a: "Yes. <i-c>Flawless Maneuver</i-c>, <i-c>Summoner's Pact</i-c> and <i-c>Lotus Petal</i-c> are noncreature spells even when they cost nothing." }
  ],
  tips: [
   "<i-c>Brightglass Gearhulk</i-c> can fetch it, since its mana value is 1."
  ],
  combos: ["Grand Abolisher", "Esper Sentinel"]
 },
 "Blind Obedience": {
  rating: 3,
  when: "Turn 2",
  tags: ["stax", "enchantment", "extort"],
  rulings: [
   { q: "How does extort work?", a: "Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much. With three opponents you gain 3." },
   { q: "Is the extort gain one event?", a: "Yes. Gaining 3 at once is one life-gain event, so <i-c>Archangel of Thune</i-c> and <i-c>Heliod, Sun-Crowned</i-c> each trigger once." },
   { q: "Can I pay {W/B} with black mana?", a: "Yes, but this deck pays with {W}." }
  ],
  tips: [
   "Extort works on every spell, including free ones like <i-c>Summoner's Pact</i-c>, if you have the mana."
  ],
  combos: ["Archangel of Thune", "Heliod, Sun-Crowned", "Thalia, Heretic Cathar"]
 },
 "Kenrith's Transformation": {
  rating: 3,
  when: "Turns 2-4, on a key creature",
  tags: ["removal", "aura", "cantrip"],
  rulings: [
   { q: "Does the commander go to the command zone?", a: "No. It stays on the battlefield as a 3/3 Elk, so they can't recast it." },
   { q: "What if the Aura is removed?", a: "The creature gets its abilities back right away." },
   { q: "Do I still draw if the target becomes illegal?", a: "No. If the target is gone when the Aura spell resolves, it doesn't enter, so it doesn't draw." }
  ],
  tips: [
   "<i-c>Enlightened Tutor</i-c> can find it, it's an enchantment."
  ],
  combos: ["Swords to Plowshares", "Enlightened Tutor"]
 },
 "Sol Ring": {
  rating: 5,
  when: "Turn 1",
  tags: ["mana rock", "1 mana", "precon"],
  rulings: [
   { q: "Can Urza's Saga find it?", a: "Yes. Its mana cost is {1}." },
   { q: "Is it colored mana?", a: "No. Only colorless. You still need {G} and {W} from elsewhere." }
  ],
  tips: [
   "<i-c>Brightglass Gearhulk</i-c> and <i-c>Enlightened Tutor</i-c> also find it."
  ],
  combos: ["Urza's Saga", "Brightglass Gearhulk"]
 },
 "Mana Vault": {
  rating: 4,
  when: "The turn you need a burst",
  tags: ["mana rock", "1 mana", "fast mana"],
  rulings: [
   { q: "When does it deal damage?", a: "At the beginning of your draw step, if it's tapped. 1 damage each time." },
   { q: "Can I untap it?", a: "In your upkeep you may pay {4}. <i-c>Formidable Speaker</i-c> can also untap it any time for {1}." },
   { q: "Can Urza's Saga find it?", a: "Yes. Its mana cost is {1}." }
  ],
  tips: [
   "Under <i-c>Teferi's Protection</i-c>, the damage is prevented, but so is everything else."
  ],
  combos: ["Formidable Speaker", "Urza's Saga"]
 },
 "Grim Monolith": {
  rating: 3,
  when: "Turns 1-2",
  tags: ["mana rock", "2 mana", "fast mana"],
  rulings: [
   { q: "Does it deal damage like Mana Vault?", a: "No. It just doesn't untap during your untap step." },
   { q: "Can I untap it at instant speed?", a: "Yes. Pay {4} any time you have priority." }
  ],
  tips: [
   "With <i-c>Formidable Speaker</i-c>, untapping it costs {1} and gives back {C}{C}{C}."
  ],
  combos: ["Formidable Speaker", "Sol Ring"]
 },
 "Chrome Mox": {
  rating: 3,
  when: "Turn 1",
  tags: ["mana rock", "free", "imprint"],
  rulings: [
   { q: "What can I imprint?", a: "Any nonartifact, nonland card from your hand. It taps for one mana of any of that card's colors." },
   { q: "What if I imprint nothing?", a: "It's on the battlefield but makes no mana." },
   { q: "What if Chrome Mox leaves the battlefield?", a: "The imprinted card stays in exile." },
   { q: "Can Urza's Saga find it?", a: "Yes. Its mana cost is {0}. The imprint trigger still happens when it enters." }
  ],
  tips: [
   "Under <i-c>Deafening Silence</i-c> it uses up your noncreature spell for the turn."
  ],
  combos: ["Eladamri's Call", "Urza's Saga"]
 },
 "Mox Diamond": {
  rating: 3,
  when: "Turn 1",
  tags: ["mana rock", "free", "any color"],
  rulings: [
   { q: "What if I don't discard a land?", a: "It goes to the graveyard instead of the battlefield." },
   { q: "What if Urza's Saga or Brightglass Gearhulk puts it onto the battlefield?", a: "<i-c>Urza's Saga</i-c> puts it onto the battlefield, so you still have to discard a land card or it goes to your graveyard. <i-c>Brightglass Gearhulk</i-c> puts it in your hand, so you cast it normally." },
   { q: "Can I discard Dryad Arbor?", a: "Yes. <i-c>Dryad Arbor</i-c> is a land card." }
  ],
  tips: [
   "It's still a spell, so it can be countered. The land is discarded as it would enter, after it resolves, so you only lose the land if Mox Diamond resolves."
  ],
  combos: ["Urza's Saga", "Brightglass Gearhulk"]
 },
 "Lotus Petal": {
  rating: 2,
  when: "The turn the extra mana wins",
  tags: ["mana", "free", "one-shot"],
  rulings: [
   { q: "Can I cast it and keep it for later?", a: "Yes. It stays on the battlefield until you tap and sacrifice it." },
   { q: "Can Urza's Saga find it?", a: "Yes. Its mana cost is {0}." }
  ],
  tips: [
   "Under <i-c>Deafening Silence</i-c> it counts as your noncreature spell for the turn."
  ],
  combos: ["Urza's Saga"]
 },
 "Skullclamp": {
  rating: 4,
  when: "Turns 2-5",
  tags: ["card draw", "equipment", "1 mana", "precon"],
  rulings: [
   { q: "What happens on a 1-toughness creature?", a: "It gets +1/-1, its toughness becomes 0, and it dies as a state-based action. You draw two cards." },
   { q: "Can I equip at instant speed?", a: "No. Equip is sorcery speed: your main phase, empty stack." },
   { q: "Does it draw if the creature is exiled?", a: "No. Only if it dies, meaning it goes to the graveyard." }
  ],
  tips: [
   "<i-c>Urza's Saga</i-c> can find it, mana cost {1}. So can <i-c>Brightglass Gearhulk</i-c>."
  ],
  combos: ["Voice of Victory", "Recruiter of the Guard"]
 },
 "Lightning Greaves": {
  rating: 3,
  when: "Turns 2-3",
  tags: ["equipment", "haste", "shroud", "2 mana"],
  rulings: [
   { q: "Does shroud stop me too?", a: "Yes. Shroud stops everyone, you included. You can't target the equipped creature with <i-c>Heliod, Sun-Crowned</i-c>'s lifelink or <i-c>Giver of Runes</i-c>." },
   { q: "How do I take it off?", a: "Equip it to another creature. Equip {0} is sorcery speed, so only in your main phase with an empty stack." },
   { q: "Does it protect against wipes?", a: "No. Shroud only stops targeting." }
  ],
  tips: [
   "Equip it to <i-c>Walking Ballista</i-c> only after you've given lifelink: shroud would stop Heliod from targeting it."
  ],
  combos: ["Shalai, Voice of Plenty", "Devoted Druid"]
 },
 "The One Ring": {
  rating: 4,
  when: "Turns 3-4",
  tags: ["card draw", "protection", "legendary", "artifact"],
  rulings: [
   { q: "Do I get protection if it's put onto the battlefield without casting?", a: "No. The protection only happens if you cast it." },
   { q: "How much life do I lose?", a: "At the beginning of your upkeep, 1 life for each burden counter on it. After three uses, that's 3 a turn." },
   { q: "What does protection from everything do for me?", a: "Opponents can't target you, and damage dealt to you is prevented. It doesn't stop wipes or 'each player' effects on your permanents." }
  ],
  tips: [
   "It's legendary, so <i-c>Delighted Halfling</i-c> makes it uncounterable."
  ],
  combos: ["Delighted Halfling", "Enlightened Tutor"]
 },
 "Gaea's Cradle": {
  rating: 5,
  when: "Once you have 2+ creatures",
  tags: ["land", "legendary", "big mana"],
  rulings: [
   { q: "What if I control no creatures?", a: "It makes no mana at all." },
   { q: "Do summoning-sick creatures count?", a: "Yes. It counts every creature you control. Only the Cradle itself needs to tap." },
   { q: "What happens if Badgermole Cub earthbends it?", a: "It becomes a 0/0 creature land with a +1/+1 counter and haste. It counts itself, it has Shalai's hexproof, and tapping it for mana triggers <i-c>Badgermole Cub</i-c> for an extra {G}. If it dies, it returns tapped as a normal land." },
   { q: "Does Vorinclex double it?", a: "No. <i-c>Vorinclex, Voice of Hunger</i-c> adds one extra mana of a type it produced, so only one more {G}." }
  ],
  tips: [
   "It only makes green. Plan your white from other sources."
  ],
  combos: ["Badgermole Cub", "Formidable Speaker", "Crop Rotation"]
 },
 "Ancient Tomb": {
  rating: 4,
  when: "Turn 1-2",
  tags: ["land", "fast mana", "colorless"],
  rulings: [
   { q: "Is the damage optional?", a: "No. It deals 2 damage to you each time it taps for mana." },
   { q: "Does Shalai's hexproof prevent it?", a: "No. The damage doesn't target. Only something that prevents damage, like <i-c>Teferi's Protection</i-c>, stops it." }
  ],
  tips: [
   "It's colorless only. Count your {G} and {W} sources before keeping a hand built on it."
  ],
  combos: ["Grim Monolith", "Sol Ring"]
 },
 "Command Tower": {
  rating: 4,
  when: "Any turn",
  tags: ["land", "dual", "precon"],
  rulings: [
   { q: "What colors does it make?", a: "Green or white, the colors in your commander's color identity. Not colorless." },
   { q: "Can a fetch land find it?", a: "No. It has no land type." }
  ],
  tips: [
   "It's in the Miku precon, so you already own one."
  ],
  combos: ["Shalai, Voice of Plenty"]
 },
 "Bountiful Promenade": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "dual", "precon"],
  rulings: [
   { q: "When does it enter tapped?", a: "Only if you have fewer than two opponents, for example after the table is down to you and one player." },
   { q: "Can a fetch land find it?", a: "No. It has no Forest or Plains type." }
  ],
  tips: [
   "In a one-on-one finish it enters tapped, so play it early."
  ],
  combos: ["Grand Abolisher"]
 },
 "Sunpetal Grove": {
  rating: 3,
  when: "Turn 2+",
  tags: ["land", "dual", "precon"],
  rulings: [
   { q: "What counts as a Forest or Plains?", a: "Any land with that type: basics, <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c>. <i-c>Command Tower</i-c> doesn't count." },
   { q: "Is the check made only once?", a: "Yes, as it enters. Losing the Forest later doesn't tap it." }
  ],
  tips: [
   "As a turn-1 play it usually enters tapped. Lead with a fetch or a typed dual instead."
  ],
  combos: ["Savannah", "Temple Garden"]
 },
 "Canopy Vista": {
  rating: 2,
  when: "When a tapped land is fine",
  tags: ["land", "dual", "typed", "precon"],
  rulings: [
   { q: "Do fetch lands find it?", a: "Yes. It's a Forest Plains, so all five fetch lands in the deck can find it." },
   { q: "Which lands count as basics for it?", a: "Only basic lands: your <i-c>Forest</i-c> and <i-c>Plains</i-c> cards. <i-c>Dryad Arbor</i-c> and <i-c>Savannah</i-c> aren't basic." }
  ],
  tips: [
   "Fetch it at the end of an opponent's turn: tapped doesn't matter then, and it untaps in your untap step."
  ],
  combos: ["Nature's Lore", "Windswept Heath"]
 },
 "Gavony Township": {
  rating: 3,
  when: "Late game, every turn",
  tags: ["land", "utility land", "counters", "precon"],
  rulings: [
   { q: "Can I use the ability at instant speed?", a: "Yes. It's an activated ability with no timing limit." },
   { q: "Does it need the Township to tap for its own cost?", a: "The {T} is part of the cost, so Township can't also pay {1} of it. You need {2}{G}{W} from other sources." },
   { q: "Can Druid-Vizier mana pay for it?", a: "Only the {2}{G} part. You still need a {W} from somewhere, and Township taps, so it works once per untap." }
  ],
  tips: [
   "A +1/+1 counter cancels a -1/-1 counter. On a <i-c>Devoted Druid</i-c> without Vizier, that's one more safe untap."
  ],
  combos: ["Kutzil, Malamet Exemplar", "Shalai, Voice of Plenty"]
 },
 "Savannah": {
  rating: 4,
  when: "Turn 1",
  tags: ["land", "dual", "typed"],
  rulings: [
   { q: "Which cards can find it?", a: "<i-c>Windswept Heath</i-c>, <i-c>Wooded Foothills</i-c>, <i-c>Misty Rainforest</i-c>, <i-c>Flooded Strand</i-c>, <i-c>Marsh Flats</i-c>, <i-c>Nature's Lore</i-c> and <i-c>Crop Rotation</i-c>." },
   { q: "Is it a basic land?", a: "No. It has basic land types, but it isn't basic." }
  ],
  tips: [
   "It's usually the first land you fetch."
  ],
  combos: ["Windswept Heath", "Nature's Lore"]
 },
 "Temple Garden": {
  rating: 4,
  when: "Turn 1-2",
  tags: ["land", "dual", "typed", "shock land"],
  rulings: [
   { q: "Can I choose tapped when it's fetched?", a: "Yes. You choose as it enters, however it got there." },
   { q: "Can I pay life under Teferi's Protection?", a: "No. Your life total can't change, so it enters tapped." }
  ],
  tips: [
   "At 40 life, 2 life is usually fine for tempo on turns 1 to 3."
  ],
  combos: ["Savannah", "Windswept Heath"]
 },
 "Brushland": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "dual", "pain land"],
  rulings: [
   { q: "Does the damage target me?", a: "No, so Shalai's hexproof doesn't stop it." },
   { q: "Can a fetch land find it?", a: "No. It has no land type." }
  ],
  tips: [
   "It always enters untapped, which matters on turn 1."
  ],
  combos: ["Shalai, Voice of Plenty"]
 },
 "Horizon Canopy": {
  rating: 3,
  when: "Any turn, cycle it late",
  tags: ["land", "dual", "card draw"],
  rulings: [
   { q: "Does it cost life for every mana?", a: "Yes. Each time you tap it for mana, you pay 1 life." },
   { q: "Can I tap it for mana and sacrifice it the same turn?", a: "No. Both abilities need {T}, so use one or the other." }
  ],
  tips: [
   "It's a fine land to discard to <i-c>Mox Diamond</i-c> or sacrifice to <i-c>Crop Rotation</i-c> late."
  ],
  combos: ["Crop Rotation", "Mox Diamond"]
 },
 "Razorverge Thicket": {
  rating: 3,
  when: "Turns 1-3",
  tags: ["land", "dual", "fast land"],
  rulings: [
   { q: "When does it enter tapped?", a: "When you control three or more other lands as it enters." },
   { q: "Does it have land types?", a: "No. Fetch lands and Nature's Lore can't find it." }
  ],
  tips: [
   "Play it as your first, second or third land. After that it enters tapped, so hold a different land for later turns."
  ],
  combos: ["Shalai, Voice of Plenty"]
 },
 "Branchloft Pathway": {
  rating: 3,
  when: "Any turn",
  tags: ["land", "modal", "untapped"],
  rulings: [
   { q: "Can I change the face later?", a: "No. You choose as you play it, and it stays that face." },
   { q: "Can a fetch land find it?", a: "No. Neither face has a basic land type." }
  ],
  tips: [
   "In your hand it's either color, which helps you plan both {W}{W} and {G}{G} costs."
  ],
  combos: ["Grand Abolisher"]
 },
 "Hushwood Verge": {
  rating: 3,
  when: "Turn 2+",
  tags: ["land", "dual"],
  rulings: [
   { q: "What turns on the white side?", a: "Controlling a land with the Forest or Plains type: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c> or a basic." },
   { q: "Does it enter tapped?", a: "No. It always enters untapped." }
  ],
  tips: [
   "Fetching <i-c>Savannah</i-c> turns on its white."
  ],
  combos: ["Savannah", "Windswept Heath"]
 },
 "Windswept Heath": {
  rating: 4,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "What can it find here?", a: "Any Forest or Plains card: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c> or a basic <i-c>Forest</i-c>, or a basic <i-c>Plains</i-c>." },
   { q: "Can I crack it at instant speed?", a: "Yes. Fetching <i-c>Dryad Arbor</i-c> at the end of an opponent's turn means it's ready to tap on your turn." },
   { q: "Does an opponent's Archivist of Oghma trigger?", a: "Yes. Your search triggers an opponent's Archivist. Yours only triggers on their searches." }
  ],
  tips: [
   "Fetch before your draw step with <i-c>Sylvan Library</i-c>, not after, or you shuffle away the cards you set up."
  ],
  combos: ["Savannah", "Dryad Arbor"]
 },
 "Wooded Foothills": {
  rating: 3,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "What can it find here?", a: "Only Forest cards, since the deck has no Mountains: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c> or a basic <i-c>Forest</i-c>." },
   { q: "Does it make mana itself?", a: "No. It has to be cracked for a land. Pay 1 life, sacrifice it and search." }
  ],
  tips: [
   "Savannah and Temple Garden are Forests, so it still fixes white."
  ],
  combos: ["Savannah", "Dryad Arbor"]
 },
 "Misty Rainforest": {
  rating: 3,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "What can it find here?", a: "Only Forest cards, since the deck has no Islands: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c> or a basic <i-c>Forest</i-c>." },
   { q: "Can Thalia slow my fetches?", a: "Your own <i-c>Thalia, Heretic Cathar</i-c> only affects opponents. An opponent's would make your nonbasic fetch and fetched duals enter tapped." }
  ],
  tips: [
   "Count your remaining Forest-type lands before cracking late: once they're gone, it finds nothing."
  ],
  combos: ["Savannah", "Dryad Arbor"]
 },
 "Flooded Strand": {
  rating: 3,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "What can it find here?", a: "Only Plains cards, since the deck has no Islands: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c> or a basic <i-c>Plains</i-c>. Not <i-c>Dryad Arbor</i-c>." },
   { q: "Does the fetched land enter untapped?", a: "Yes, unless the land itself says otherwise. <i-c>Temple Garden</i-c> asks for 2 life, and <i-c>Canopy Vista</i-c> needs two basics." }
  ],
  tips: [
   "It can't find Dryad Arbor. Use a Forest fetch for that."
  ],
  combos: ["Savannah", "Temple Garden"]
 },
 "Marsh Flats": {
  rating: 3,
  when: "Turn 1",
  tags: ["land", "fetch land"],
  rulings: [
   { q: "What can it find here?", a: "Only Plains cards, since the deck has no Swamps: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c> or a basic <i-c>Plains</i-c>. Not <i-c>Dryad Arbor</i-c>." },
   { q: "Is cracking it a spell?", a: "No. It's an activated ability of a land, so <i-c>Silence</i-c>-style cards and <i-c>Grand Abolisher</i-c> don't stop it." }
  ],
  tips: [
   "Fetching thins Forest and Plains duals out of your library, so later draws are more often spells."
  ],
  combos: ["Savannah", "Temple Garden"]
 },
 "Gemstone Caverns": {
  rating: 3,
  when: "Before the game starts",
  tags: ["land", "legendary", "fast mana", "opening hand"],
  rulings: [
   { q: "When does it work?", a: "Only from your opening hand, after mulligans, and only if you're not the starting player." },
   { q: "Does it use up my land drop?", a: "No. It starts the game on the battlefield, so you still get your normal land drop on your first turn." },
   { q: "What if I draw it later, or fetch it with Crop Rotation?", a: "It's just a land that taps for {C}. No luck counter." },
   { q: "Does the exiled card come back?", a: "No. It stays exiled." }
  ],
  tips: [
   "Exile the card you'd most likely bottom anyway: an extra land or a situational answer."
  ],
  combos: ["Grand Abolisher", "Shalai, Voice of Plenty"]
 },
 "Cavern of Souls": {
  rating: 4,
  when: "Any turn, name a type",
  tags: ["land", "uncounterable", "anti-counter"],
  rulings: [
   { q: "Which type should I name?", a: "Usually Human. Elf covers <i-c>Devoted Druid</i-c>, <i-c>Formidable Speaker</i-c> and the elf dorks. Angel covers <i-c>Shalai, Voice of Plenty</i-c>, <i-c>Archangel of Thune</i-c> and <i-c>Linvala, Keeper of Silence</i-c>." },
   { q: "Does it make Chord of Calling uncounterable?", a: "No. Chord is an instant, not a creature spell. Only creature spells of the chosen type." },
   { q: "Can I change the type later?", a: "No. It's chosen once, as it enters. <i-c>Crop Rotation</i-c> fetching it lets you choose for that situation." }
  ],
  tips: [
   "Its {C} ability is unrestricted, so it's never a dead land."
  ],
  combos: ["Vizier of Remedies", "Shalai, Voice of Plenty"]
 },
 "Boseiju, Who Endures": {
  rating: 4,
  when: "As a land, or channel at instant speed",
  tags: ["land", "legendary", "channel", "removal"],
  rulings: [
   { q: "How cheap can channel get?", a: "The reduction only removes generic mana. With one legendary creature, it costs {G}. It can't go below {G}." },
   { q: "Which legendary creatures count?", a: "<i-c>Shalai, Voice of Plenty</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c>, <i-c>Thalia, Heretic Cathar</i-c>, <i-c>Linvala, Keeper of Silence</i-c>, <i-c>Vorinclex, Voice of Hunger</i-c>, and <i-c>Heliod, Sun-Crowned</i-c> when it's a creature. An earthbent <i-c>Gaea's Cradle</i-c> is a legendary creature too." },
   { q: "Can channel be countered?", a: "Not by a counterspell, which only counters spells. Channel is an activated ability from your hand. Even an opponent's Grand Abolisher-style card doesn't stop it, since it's the ability of a land card." }
  ],
  tips: [
   "The opponent may search for a land with a basic land type, which triggers <i-c>Archivist of Oghma</i-c>."
  ],
  combos: ["Shalai, Voice of Plenty", "Force of Vigor"]
 },
 "Eiganjo, Seat of the Empire": {
  rating: 3,
  when: "As a land, or during combat",
  tags: ["land", "legendary", "channel", "removal"],
  rulings: [
   { q: "How cheap can channel get?", a: "It costs {2}{W} minus {1} per legendary creature you control. With two, it's just {W}. It can't go below {W}." },
   { q: "When can I use it?", a: "Only on a creature that's attacking or blocking, so during combat." }
  ],
  tips: [
   "Its damage targets, so it can't hit a creature with hexproof or protection from white."
  ],
  combos: ["Shalai, Voice of Plenty", "Kutzil, Malamet Exemplar"]
 },
 "Urza's Saga": {
  rating: 4,
  when: "Turns 1-2",
  tags: ["land", "saga", "tutor", "enchantment land"],
  rulings: [
   { q: "Which artifacts can chapter III find?", a: "Only cards with mana cost {0} or {1}: <i-c>Sol Ring</i-c>, <i-c>Mana Vault</i-c>, <i-c>Chrome Mox</i-c>, <i-c>Mox Diamond</i-c>, <i-c>Lotus Petal</i-c> and <i-c>Skullclamp</i-c>. Not <i-c>Walking Ballista</i-c>, whose cost is {X}{X}, and not <i-c>Esper Sentinel</i-c>, whose cost is {W}." },
   { q: "When does it get its counters?", a: "One as it enters, and one after each of your draw steps. Chapter III triggers on your third turn with it, then the Saga is sacrificed." },
   { q: "Can I make a Construct after chapter III triggers?", a: "Yes. While the chapter III trigger is on the stack, the Saga is still there, so you can activate its chapter II ability in response." },
   { q: "How big are the Constructs?", a: "Each gets +1/+1 for each artifact you control, and it's an artifact itself, so it's at least 1/1." }
  ],
  tips: [
   "<i-c>Enlightened Tutor</i-c> can find it, since it's an enchantment card. <i-c>Crop Rotation</i-c> puts it onto the battlefield at instant speed."
  ],
  combos: ["Sol Ring", "Mana Vault", "Skullclamp"]
 },
 "Dryad Arbor": {
  rating: 3,
  when: "As a land, or fetched at instant speed",
  tags: ["land", "creature", "green creature", "forest"],
  rulings: [
   { q: "Is it affected by summoning sickness?", a: "Yes. It's a creature, so it can't tap for mana until you've controlled it since your turn began." },
   { q: "Can I cast it?", a: "No. It's a land, not a spell. You play it as your land drop, or put it onto the battlefield with an effect." },
   { q: "Which cards find it?", a: "<i-c>Windswept Heath</i-c>, <i-c>Wooded Foothills</i-c>, <i-c>Misty Rainforest</i-c>, <i-c>Nature's Lore</i-c>, <i-c>Crop Rotation</i-c>, <i-c>Green Sun's Zenith</i-c> at X=0, <i-c>Ranger-Captain of Eos</i-c>, <i-c>Recruiter of the Guard</i-c> and <i-c>Brightglass Gearhulk</i-c>. Not the Plains fetches." }
  ],
  tips: [
   "It's a creature, so creature wipes kill it. Shalai gives it hexproof against targeted removal."
  ],
  combos: ["Natural Order", "Green Sun's Zenith", "Gaea's Cradle"]
 },
 "Forest": {
  rating: 2,
  when: "Any turn",
  tags: ["land", "basic", "precon"],
  rulings: [
   { q: "Which cards can fetch it?", a: "<i-c>Windswept Heath</i-c>, <i-c>Wooded Foothills</i-c>, <i-c>Misty Rainforest</i-c>, <i-c>Nature's Lore</i-c> and <i-c>Crop Rotation</i-c>." }
  ],
  tips: [
   "Basics dodge nonbasic land hate like Blood Moon effects."
  ],
  combos: ["Canopy Vista", "Sunpetal Grove"]
 },
 "Plains": {
  rating: 2,
  when: "Any turn",
  tags: ["land", "basic", "precon"],
  rulings: [
   { q: "Which cards can fetch it?", a: "<i-c>Windswept Heath</i-c>, <i-c>Flooded Strand</i-c>, <i-c>Marsh Flats</i-c> and <i-c>Crop Rotation</i-c>. <i-c>Nature's Lore</i-c> can't: it finds Forests." }
  ],
  tips: [
   "Your white cards with {W}{W}, like <i-c>Grand Abolisher</i-c>, want two white sources early."
  ],
  combos: ["Canopy Vista", "Hushwood Verge"]
 }
};

window.CORRUPTED_GLOSSARY = [
 { term: "Hexproof", html: "A permanent or player with hexproof can't be the target of spells or abilities your opponents control. You can still target your own. <i-c>Shalai, Voice of Plenty</i-c> gives it to you, your planeswalkers and your other creatures, but not to herself. It doesn't stop wipes, edicts or anything that doesn't target.", cards: ["Shalai, Voice of Plenty", "Veil of Summer", "Giver of Runes", "Lightning Greaves"] },
 { term: "Shroud", html: "Like hexproof, but nobody can target it, you included. <i-c>Lightning Greaves</i-c> gives shroud, so move it off a creature before you target that creature with <i-c>Heliod, Sun-Crowned</i-c> or <i-c>Giver of Runes</i-c>.", cards: ["Lightning Greaves", "Heliod, Sun-Crowned", "Giver of Runes"] },
 { term: "Protection", html: "Protection from a quality (a color, colorless, everything) means: it can't be targeted, damaged, enchanted or equipped, or blocked, by anything with that quality. A player with protection can't be targeted and damage to them is prevented. It doesn't stop wipes that don't target or deal damage.", cards: ["Giver of Runes", "Teferi's Protection", "The One Ring"] },
 { term: "Phasing", html: "A phased-out permanent is treated as though it doesn't exist until it phases in during its controller's next untap step. It doesn't leave the battlefield, so nothing dies, enters or triggers, and it keeps its counters and attachments. <i-c>Teferi's Protection</i-c> phases out everything you control.", cards: ["Teferi's Protection"] },
 { term: "Indestructible", html: "The permanent can't be destroyed, by 'destroy' effects or by lethal damage. It can still be exiled, bounced, sacrificed or shrunk to 0 toughness.", cards: ["Heliod, Sun-Crowned", "Flawless Maneuver", "The One Ring"] },
 { term: "Convoke", html: "While casting the spell, you can tap any of your untapped creatures to help pay. Each one pays {1} or one mana of its color. Summoning-sick creatures can convoke. Tapping for convoke isn't tapping for mana.", cards: ["Chord of Calling", "Badgermole Cub"] },
 { term: "Evoke", html: "Cast the creature for its evoke cost instead of its mana cost. When it enters, you sacrifice it, but its enters ability still happens. Here, evoke means exiling a card of the right color from your hand, so the spell is free.", cards: ["Endurance", "Solitude"] },
 { term: "Channel", html: "An ability you activate from your hand by paying the cost and discarding the card. It isn't a spell, so counterspells can't stop it. <i-c>Boseiju, Who Endures</i-c> and <i-c>Eiganjo, Seat of the Empire</i-c> cost {1} less for each legendary creature you control, down to their colored mana.", cards: ["Boseiju, Who Endures", "Eiganjo, Seat of the Empire"] },
 { term: "Earthbend", html: "Target land you control becomes a 0/0 creature with haste that's still a land, and gets +1/+1 counters. When it dies or is exiled, it comes back tapped as a normal land. It lasts until the land leaves the battlefield.", cards: ["Badgermole Cub", "Gaea's Cradle", "Crop Rotation"] },
 { term: "Mobilize", html: "Whenever the creature attacks, create that many 1/1 red Warrior tokens, tapped and attacking. Sacrifice them at the beginning of the next end step.", cards: ["Voice of Victory", "Skullclamp"] },
 { term: "Extort", html: "Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much. Gaining life this way triggers <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Archangel of Thune</i-c> once per payment.", cards: ["Blind Obedience", "Archangel of Thune", "Heliod, Sun-Crowned"] },
 { term: "Imprint", html: "A card exiled 'with' another permanent, which then uses it. <i-c>Chrome Mox</i-c> taps for the colors of the card you imprinted. The imprinted card stays exiled even if the Mox leaves.", cards: ["Chrome Mox"] },
 { term: "Summoning sickness", html: "A creature can't attack or use abilities with {T} in the cost unless you've controlled it since the start of your most recent turn. Haste removes this. Abilities without {T}, like <i-c>Devoted Druid</i-c>'s untap, work right away.", cards: ["Devoted Druid", "Lightning Greaves", "Dryad Arbor", "Llanowar Elves", "Formidable Speaker"] },
 { term: "+1/+1 and -1/-1 counters", html: "Counters that change a creature's power and toughness. If a creature has both, they're removed in pairs. <i-c>Vizier of Remedies</i-c> puts one fewer -1/-1 counter each time. A 0/0 like <i-c>Walking Ballista</i-c> or <i-c>Spike Feeder</i-c> dies when its last counter is removed.", cards: ["Shalai, Voice of Plenty", "Devoted Druid", "Vizier of Remedies", "Walking Ballista", "Spike Feeder", "Gavony Township"] },
 { term: "Mana value", html: "The total mana in a card's mana cost, ignoring color. X counts as 0 everywhere except on the stack, so <i-c>Walking Ballista</i-c> has mana value 0 in your library. Lands have mana value 0. Tutors like <i-c>Chord of Calling</i-c> and <i-c>Ranger-Captain of Eos</i-c> check it.", cards: ["Walking Ballista", "Chord of Calling", "Green Sun's Zenith", "Ranger-Captain of Eos", "Brightglass Gearhulk"] },
 { term: "Devotion", html: "Your devotion to white is the number of {W} symbols in the mana costs of permanents you control. <i-c>Heliod, Sun-Crowned</i-c> is a creature only while it's 5 or more.", cards: ["Heliod, Sun-Crowned", "Archangel of Thune", "Grand Abolisher"] },
 { term: "Tutor", html: "A card that searches your library for another card. Some put it in your hand, some on top, some onto the battlefield. This deck has many, so any combo piece is usually a tutor away.", cards: ["Worldly Tutor", "Enlightened Tutor", "Eladamri's Call", "Chord of Calling", "Natural Order", "Survival of the Fittest"] },
 { term: "Fetch land", html: "A land you sacrifice, paying 1 life, to search for a land with a certain type. Here the Forest fetches find <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c> and basic Forests, and the Plains fetches find the same duals and basic Plains. Cracking one triggers opponents' search hate.", cards: ["Windswept Heath", "Wooded Foothills", "Misty Rainforest", "Flooded Strand", "Marsh Flats", "Savannah"] },
 { term: "Opening hand cards", html: "A few cards do something before the game starts if they're in the hand you keep. <i-c>Gemstone Caverns</i-c> goes onto the battlefield with a luck counter, but only if you're not the starting player.", cards: ["Gemstone Caverns"] },
 { term: "Stax", html: "Permanents that limit what opponents can do: cast spells, search, untap, use abilities. Here they slow the table so your combo goes off first. Some, like <i-c>Deafening Silence</i-c>, also affect you.", cards: ["Grand Abolisher", "Drannith Magistrate", "Deafening Silence", "Thalia, Heretic Cathar", "Linvala, Keeper of Silence", "Aven Mindcensor"] },
 { term: "Infinite combo", html: "Two or more cards that repeat an action as many times as you want. You announce the loop and how many times, then the result. This deck has four two-card loops: Druid and Vizier, Heliod and Ballista, Thune and Feeder, Heliod and Feeder.", cards: ["Devoted Druid", "Vizier of Remedies", "Heliod, Sun-Crowned", "Walking Ballista", "Archangel of Thune", "Spike Feeder"] },
 { term: "Game Changers", html: "A list from the official bracket system of cards that change games a lot: fast mana, strong tutors, free interaction. Brackets 1 to 3 limit them, Bracket 4 doesn't. Cards tagged Game Changer on this site follow the list as last checked, so verify the current official list before an event.", cards: ["Gaea's Cradle", "Mana Vault", "Natural Order", "Teferi's Protection", "Drannith Magistrate"] },
 { term: "Bracket 4", html: "'Optimized' in the official bracket system. No limits beyond the banned list: unlimited Game Changers, two-card combos and tutors are fine. Decks are fast and lethal, but they don't follow the competitive metagame, which is Bracket 5. Tell your table about this deck's combos and stax before the game.", cards: ["Shalai, Voice of Plenty", "Vorinclex, Voice of Hunger"] },
 { term: "Commander tax", html: "Each time you cast your commander from the command zone, it costs {2} more for each previous time you cast it from there this game.", cards: ["Shalai, Voice of Plenty", "Drannith Magistrate", "Reprieve"] }
];

window.CORRUPTED_CUTS = [];

window.CORRUPTED_FAQ = [
 { q: "How does this deck win?", a: "With a two-card combo, behind protection. The four loops are <i-c>Archangel of Thune</i-c> + <i-c>Spike Feeder</i-c>, <i-c>Heliod, Sun-Crowned</i-c> + <i-c>Walking Ballista</i-c>, <i-c>Devoted Druid</i-c> + <i-c>Vizier of Remedies</i-c> (infinite mana into Ballista or Shalai's ability), and <i-c>Heliod, Sun-Crowned</i-c> + <i-c>Spike Feeder</i-c> (infinite life). <i-c>Natural Order</i-c> into <i-c>Craterhoof Behemoth</i-c> and a fair game with Shalai's counters are the backups." },
 { q: "What do I tell the table before the game?", a: "That it's a Bracket 4 deck with several two-card infinite combos, lots of tutors and fast mana, stax pieces that stop casting spells on your turn and from the command zone, and <i-c>Vorinclex, Voice of Hunger</i-c>, which keeps tapped lands from untapping. Say it usually wins around turns 4 to 6 and can be faster with a great hand." },
 { q: "Which combo should I go for first?", a: "The one you're closest to. If you have none, Thune + Feeder is the safest: it needs no mana, works at instant speed and survives a wipe if you go off in response. Druid + Vizier needs the Druid to have been out since your turn began. Heliod + Ballista needs {1}{W} and Ballista with 2 or more counters." },
 { q: "What are the exact steps for Thune + Spike Feeder?", a: "With both on the battlefield: remove a +1/+1 counter from <i-c>Spike Feeder</i-c> to gain 2 life. <i-c>Archangel of Thune</i-c> triggers and puts a +1/+1 counter on each creature you control, including Feeder. Repeat. Announce a number of loops. With <i-c>Walking Ballista</i-c> out, it grows each loop, then remove its counters to deal damage to each opponent. Without Ballista, attack with a team of huge creatures." },
 { q: "What are the exact steps for Heliod + Walking Ballista?", a: "Have <i-c>Walking Ballista</i-c> with at least 2 counters. Pay {1}{W}: <i-c>Heliod, Sun-Crowned</i-c> gives Ballista lifelink. Remove a counter to deal 1 damage to an opponent. You gain 1 life, Heliod triggers, put the counter back on Ballista. Repeat until everyone is dead." },
 { q: "I have infinite green mana from Druid and Vizier. Now what?", a: "Put it into <i-c>Walking Ballista</i-c> at {4} per counter, then ping everyone. No Ballista? Activate <i-c>Shalai, Voice of Plenty</i-c> as many times as you want and attack, or cast <i-c>Finale of Devastation</i-c> with X of 10 or more for <i-c>Craterhoof Behemoth</i-c>: everything gets two pumps and haste. Remember the mana is only green." },
 { q: "What if Shalai dies?", a: "Recast her when you can: it costs {2} more each time. Your combo doesn't need her. While she's gone, your creatures can be targeted, so protect the key piece with <i-c>Giver of Runes</i-c> or win in a turn when opponents can't respond, using <i-c>Grand Abolisher</i-c>, <i-c>Silence</i-c> or <i-c>Kutzil, Malamet Exemplar</i-c>." },
 { q: "Does Shalai protect me from board wipes?", a: "No. Hexproof only stops targeting. Wipes, edicts, Cyclonic Rift overloaded and 'each opponent' effects still work. Use <i-c>Teferi's Protection</i-c> or <i-c>Flawless Maneuver</i-c>, and don't play out more creatures than you need." },
 { q: "How do I beat board wipes?", a: "Hold one protection spell before you overextend. <i-c>Flawless Maneuver</i-c> is free with Shalai out and stops destroy wipes. <i-c>Teferi's Protection</i-c> stops everything. With Thune and Feeder out, combo off in response to the wipe. Keep a tutor in hand to rebuild." },
 { q: "When should I cast Silence or Orim's Chant?", a: "In the upkeep of an opponent who's about to win, or first thing on your combo turn if you have no <i-c>Grand Abolisher</i-c> or <i-c>Kutzil, Malamet Exemplar</i-c> out. Neither stops abilities or spells already on the stack." },
 { q: "Is Natural Order into Craterhoof always lethal?", a: "No. Opponents start at 40. Each attacker gets +X/+X where X is your creature count, so about 6 or 7 attackers kill one opponent and about 10 or 11 are needed for the whole table. Use it to kill one player, or when the table is low. Otherwise, <i-c>Vorinclex, Voice of Hunger</i-c> is often the better target." },
 { q: "What does Deafening Silence do to me?", a: "It's symmetric: you can also cast only one noncreature spell each turn. Your combos are creatures and abilities, so they're fine, but your fast mana and tutor turns slow down. <i-c>Chrome Mox</i-c> then <i-c>Sol Ring</i-c> on the same turn won't work." },
 { q: "How does Summoner's Pact not lose me the game?", a: "Cast it only when you win this turn or know you can pay {2}{G}{G} in your next upkeep. Put a die on it as a reminder. If you forget or can't pay, you lose, and <i-c>Teferi's Protection</i-c> doesn't save you." },
 { q: "What do I fetch with each fetch land?", a: "<i-c>Windswept Heath</i-c> finds any Forest or Plains. <i-c>Wooded Foothills</i-c> and <i-c>Misty Rainforest</i-c> find Forests only, including <i-c>Dryad Arbor</i-c>. <i-c>Flooded Strand</i-c> and <i-c>Marsh Flats</i-c> find Plains only. <i-c>Savannah</i-c> first, then <i-c>Temple Garden</i-c>." },
 { q: "What hand should I keep?", a: "At least two mana sources, one of them a land, plus Shalai castable by turn 3 or a tutor or combo piece. A hand of only lands and dorks is a mulligan at this level. Check if you're the starting player before counting <i-c>Gemstone Caverns</i-c>." },
 { q: "Which opposing cards hurt this deck most?", a: "Grafdigger's Cage (stops Chord, Natural Order, Green Sun's Zenith and Finale), Torpor Orb and Hushbringer (stop enter triggers), Null Rod and Collector Ouphe (stop Ballista and rocks), Cursed Totem and an opposing Linvala (stop dorks, Druid and Feeder), and Humility. Answer them with <i-c>Force of Vigor</i-c>, <i-c>Boseiju, Who Endures</i-c>, <i-c>Generous Gift</i-c>, <i-c>Archdruid's Charm</i-c> and <i-c>Swords to Plowshares</i-c>." },
 { q: "Which cards are from the Hatsune Miku precon?", a: "<i-c>Shalai, Voice of Plenty</i-c> is printed as Miku, Voice Over All, <i-c>Archangel of Thune</i-c> as Archangel of Tunes, and <i-c>Vorinclex, Voice of Hunger</i-c> as Miku, the Complete Performer. Other precon cards include <i-c>Sol Ring</i-c>, <i-c>Skullclamp</i-c>, <i-c>Swords to Plowshares</i-c>, <i-c>Path to Exile</i-c>, <i-c>Finale of Devastation</i-c>, <i-c>Nature's Lore</i-c> and the Miku-art basics. All are legal under their Oracle names." }
];
