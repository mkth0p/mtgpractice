/* Etrata B4 aggro: the 50 cards the upgrade adds, by stage, with why/how notes for the card wiki.
   Generated from the game engine's card text and MTGGoldfish prices (USD x 0.85, looked up 29-30 Sep 2026).
   eur null: MTGGoldfish showed no regular paper price. b4: the stage that adds it. cut: what it replaces. */
window.ETRATA_B4_CARDS = [
 {
  "name": "Hired Poisoner",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Deathtouch",
  "roles": [
   "assassin"
  ],
  "why": "A one-mana Assassin with deathtouch. It attacks on turn 2, trades with anything that blocks it, and every hit before Etrata arrives is free pressure.",
  "how": "Play it turn 1. Once Etrata is out it's one more Assassin that cloaks a card each time it connects, and nobody wants to block a deathtouch creature with something good.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Black Widow, Deadly Hunter",
   "Achilles Davenport",
   "Skullclamp"
  ],
  "warn": "A 1/1 dies to every sweeper and ping. Don't hold it back for value: it's there to hit early.",
  "b4": 1,
  "cut": "Omen Hawker",
  "gc": false,
  "usd": 0.22,
  "eur": 0.19,
  "printing": "Guilds of Ravnica #72"
 },
 {
  "name": "Thrill-Kill Assassin",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "1/2",
  "text": "Deathtouch\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)",
  "roles": [
   "assassin"
  ],
  "why": "Two mana for a 2/3 deathtouch Assassin once unleashed. It replaces Aven Heartstabber, which needed five mana values in your graveyard to do anything.",
  "how": "Always unleash it: this deck attacks, and a creature with deathtouch that can't block still makes attacks into you awkward because it threatens to trade on the swing back.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Black Widow, Deadly Hunter",
   "Mari, the Killing Quill",
   "Ramses, Assassin Lord"
  ],
  "warn": "Unleashed, it can't block while it keeps its +1/+1 counter.",
  "b4": 1,
  "cut": "Aven Heartstabber",
  "gc": false,
  "usd": 0.2,
  "eur": 0.17,
  "printing": "Iconic Masters #111"
 },
 {
  "name": "Guildsworn Prowler",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Creature — Tiefling Rogue Assassin",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Deathtouch\nWhen Guildsworn Prowler dies, if it wasn't blocking, draw a card.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "A 2/1 deathtouch Assassin for two that replaces itself when it dies attacking. Blocking it costs your opponent a creature and gives you a card.",
  "how": "Attack with it into anything. If they block, they lose the blocker and you draw. If they don't, Etrata cloaks a card.",
  "syn": [
   "Skullclamp",
   "Black Widow, Deadly Hunter",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "No card if it dies while blocking. Sweepers still draw you a card.",
  "b4": 1,
  "cut": "Silent Hallcreeper",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Commander Legends: Battle for Baldur's Gate #130"
 },
 {
  "name": "Mischievous Sneakling",
  "qty": 0,
  "cost": "{1}{U/B}",
  "mv": 2,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "2/2",
  "text": "Changeling (This card is every creature type.)\nFlash",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A 2/2 changeling with flash for two. Changeling makes it an Assassin (and a Faerie, a Rogue and every other type), and flash lets you hold up a counterspell and still use your mana.",
  "how": "Keep {U}{U} or {1}{U} open on an opponent's turn. If you don't need the counter, flash it in at their end step and attack with it on your turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Kindred Discovery",
   "Achilles Davenport",
   "Counterspell"
  ],
  "warn": "It has no evasion of its own. Give it menace with Interceptor or fear with Cover of Darkness.",
  "b4": 1,
  "cut": "Willbender",
  "gc": false,
  "usd": 0.22,
  "eur": 0.19,
  "printing": "Lorwyn Eclipsed #235"
 },
 {
  "name": "Mari, the Killing Quill",
  "qty": 0,
  "cost": "{1}{B}{B}",
  "mv": 3,
  "type": "Legendary Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Whenever a creature an opponent controls dies, exile it with a hit counter on it.\nAssassins, Mercenaries, and Rogues you control have deathtouch and \"Whenever this creature deals combat damage to a player, you may remove a hit counter from a card that player owns in exile. If you do, draw a card and create two Treasure tokens.\"",
  "roles": [
   "draw",
   "removal",
   "finisher"
  ],
  "why": "The best new card. Every Assassin you control gets deathtouch, so every block against you trades. Every opposing creature that dies goes to exile with a hit counter, which feeds Etrata, the Silencer: three hit counters on one player and they lose. And each Assassin that connects can cash in a hit counter for a card and two Treasures.",
  "how": "Cast her on turn 3 or 4 and start attacking with everything. Early on, cash hit counters in for cards and Treasures. Once a player has two hit counters and Etrata, the Silencer is close, stop cashing in on that player: the Silencer's next hit exiles a third card and they lose the game (with Ramses out, you win it).",
  "syn": [
   "Etrata, the Silencer",
   "Black Widow, Deadly Hunter",
   "Ramses, Assassin Lord",
   "Ezio, Blade of Vengeance",
   "Unstoppable Slasher"
  ],
  "warn": "Only creatures that die get a hit counter: bounced or exiled creatures don't, and tokens stop existing. Cashing a hit counter in for a card moves a player further from a Silencer kill.",
  "b4": 1,
  "cut": "Grazilaxx, Illithid Scholar",
  "gc": false,
  "usd": 4.72,
  "eur": 4.01,
  "printing": "Streets of New Capenna Commander #89"
 },
 {
  "name": "Black Widow, Deadly Hunter",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Human Assassin Hero",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Deathtouch\nWhenever a creature you control with deathtouch deals combat damage to a player, you draw a card and lose 1 life.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "A 3/3 deathtouch Assassin for three that draws a card every time one of your deathtouch creatures deals combat damage to a player. With Mari out, that's every Assassin.",
  "how": "Cast her before Mari if you can: she already draws off Hired Poisoner, Guildsworn Prowler, Thrill-Kill Assassin, Midnight Assassin, Virtus, Slasher, Shadow, Ezio, Ramses and Etrata herself. With Mari every Assassin has deathtouch, and a wide attack draws four or five cards.",
  "syn": [
   "Mari, the Killing Quill",
   "Hired Poisoner",
   "Midnight Assassin",
   "Unstoppable Slasher",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "Each card costs 1 life. With Bitterblossom, fetch lands and Ancient Tomb, watch your total against aggressive tables.",
  "b4": 1,
  "cut": "Glitch Interpreter",
  "gc": false,
  "usd": 0.9,
  "eur": 0.77,
  "printing": "Marvel Super Heroes Commander #648"
 },
 {
  "name": "Shadow, Mysterious Assassin",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Deathtouch\nThrow — Whenever Shadow deals combat damage to a player, you may sacrifice another nonland permanent. If you do, draw two cards and each opponent loses life equal to the mana value of the sacrificed permanent.",
  "roles": [
   "assassin",
   "draw",
   "finisher"
  ],
  "why": "A 3/3 deathtouch Assassin for three. When it connects you may sacrifice another nonland permanent: draw two, and each opponent loses life equal to that permanent's mana value.",
  "how": "Sacrifice what's already spent: a Treasure from Mari, an empty Lotus Petal, a tapped Mana Vault, a stolen permanent you don't need. Late in the game, sacrificing a big cloaked card you flipped up drains the whole table.",
  "syn": [
   "Mari, the Killing Quill",
   "Mana Vault",
   "Lotus Petal",
   "Etrata, Deadly Fugitive"
  ],
  "warn": "A face-down creature has mana value 0, so sacrificing a cloak draws two but drains nothing.",
  "b4": 1,
  "cut": "Boggart Trawler // Boggart Bog",
  "gc": false,
  "usd": 0.34,
  "eur": 0.29,
  "printing": "Final Fantasy Commander #50"
 },
 {
  "name": "Virtus the Veiled",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Legendary Creature — Azra Assassin",
  "cat": "Creature",
  "pt": "1/1",
  "text": "Partner with Gorm the Great (When this creature enters, target player may put Gorm into their hand from their library, then shuffle.)\nDeathtouch\nWhenever Virtus the Veiled deals combat damage to a player, that player loses half their life, rounded up.",
  "roles": [
   "assassin",
   "finisher"
  ],
  "why": "A second Unstoppable Slasher: a 1/1 deathtouch Assassin whose hit halves a player's life, rounded up. It replaces Wound Reflection, the six-mana half of the old kill.",
  "how": "Hit the player with the most life. Two halving hits, or one plus a normal attack, take a player from 40 to nothing. Brotherhood Regalia, Rogue's Passage and Access Tunnel make it unblockable.",
  "syn": [
   "Unstoppable Slasher",
   "Brotherhood Regalia",
   "Access Tunnel",
   "Rogue's Passage",
   "Achilles Davenport"
  ],
  "warn": "A 1/1 for three dies to anything. Hold it until you can protect it or push it through.",
  "b4": 1,
  "cut": "Wound Reflection",
  "gc": false,
  "usd": 8.71,
  "eur": 7.4,
  "printing": "Battlebond #7"
 },
 {
  "name": "Mistwalker",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Creature — Shapeshifter",
  "cat": "Creature",
  "pt": "1/4",
  "text": "Changeling (This card is every creature type.)\nFlying\n{1}{U}: Mistwalker gets +1/-1 until end of turn.",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A 1/4 flying changeling for three: an evasive Assassin that survives most blocks and small sweepers, and pumps with {1}{U}.",
  "how": "Attack in the air every turn. Pump it after blockers are declared, when it's unblocked, to turn spare mana into damage.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Achilles Davenport",
   "Ramses, Assassin Lord",
   "Kindred Discovery"
  ],
  "warn": "Each pump lowers its toughness by 1.",
  "b4": 1,
  "cut": "Kheru Spellsnatcher",
  "gc": false,
  "usd": 0.2,
  "eur": 0.17,
  "printing": "The List #68"
 },
 {
  "name": "Midnight Assassin",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Vampire Assassin",
  "cat": "Creature",
  "pt": "1/2",
  "text": "Flying, deathtouch",
  "roles": [
   "assassin",
   "evasion"
  ],
  "why": "A 1/2 flier with deathtouch for three. It connects, and it trades with any flier that blocks it. It also draws a card through Black Widow.",
  "how": "An early evasive Assassin that keeps Etrata's trigger going. On defense, it stops big fliers cold.",
  "syn": [
   "Black Widow, Deadly Hunter",
   "Etrata, Deadly Fugitive",
   "Achilles Davenport"
  ],
  "warn": "Small body: lords make it matter.",
  "b4": 1,
  "cut": "Ravenloft Adventurer",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Streets of New Capenna #87"
 },
 {
  "name": "Lydia Frye",
  "qty": 0,
  "cost": "{2}{U/B}",
  "mv": 3,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "3/2",
  "text": "Lydia Frye can't be blocked by creatures with power 3 or greater.\nAt the beginning of your end step, surveil X, where X is the number of tapped Assassins you control. (Look at the top X cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.)",
  "roles": [
   "assassin",
   "evasion",
   "draw"
  ],
  "why": "A 3/2 Assassin for three that creatures with power 3 or more can't block, and that surveils at your end step for each tapped Assassin you control.",
  "how": "Attack with your Assassins, then surveil deep at the end step to set up your next draws: keep lands only if you need them, bin the rest.",
  "syn": [
   "Desmond Miles",
   "Etrata, Deadly Fugitive",
   "Kindred Discovery"
  ],
  "warn": "Small creatures can still block her.",
  "b4": 1,
  "cut": "Scroll of Fate",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Assassin's Creed #60"
 },
 {
  "name": "Merciless Harlequin",
  "qty": 0,
  "cost": "{2}{B}",
  "mv": 3,
  "type": "Creature — Human Assassin",
  "cat": "Creature",
  "pt": "2/1",
  "text": "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nWhen Merciless Harlequin enters, you draw a card and you lose 1 life.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "A 2/1 Assassin that draws a card when it enters. After one of your Assassins or Etrata has dealt combat damage this turn, freerunning casts it for {1}{B}.",
  "how": "Attack first, then cast it in your second main phase for two mana. It's a card and a body for Skullclamp.",
  "syn": [
   "Skullclamp",
   "Achilles Davenport",
   "Eagle Vision",
   "Chain Assassination"
  ],
  "warn": "Freerunning checks damage dealt this turn: in your first main phase you pay full price.",
  "b4": 1,
  "cut": "Plumb the Forbidden",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Assassin's Creed #287 Starter Kit"
 },
 {
  "name": "Adéwalé, Breaker of Chains",
  "qty": 0,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Legendary Creature — Human Assassin Pirate",
  "cat": "Creature",
  "pt": "4/1",
  "text": "When Adéwalé enters, reveal the top six cards of your library. Put an Assassin, Pirate, or Vehicle card from among them into your hand and the rest on the bottom of your library in a random order.\nWhenever a Vehicle you control deals combat damage to a player, you may return Adéwalé from your graveyard to your hand.",
  "roles": [
   "assassin",
   "draw"
  ],
  "why": "A 4/1 Assassin for three that digs through the top six cards for another Assassin. With 30 creatures and changelings, it almost always finds one.",
  "how": "Cast it when your hand is running low. Pick Mari, Black Widow or Ramses if they're there.",
  "syn": [
   "Mari, the Killing Quill",
   "Black Widow, Deadly Hunter",
   "Ramses, Assassin Lord",
   "Ezio, Blade of Vengeance"
  ],
  "warn": "Four power, one toughness: it trades with anything, even a 1/1.",
  "b4": 1,
  "cut": "Reconnaissance Mission",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Assassin's Creed #136 Borderless Showcase"
 },
 {
  "name": "Achilles Davenport",
  "qty": 0,
  "cost": "{2}{U}{B}",
  "mv": 4,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "3/3",
  "text": "Freerunning {U}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nMenace\nOther Assassins you control get +1/+1.",
  "roles": [
   "assassin",
   "finisher"
  ],
  "why": "The second Assassin lord: other Assassins get +1/+1, and he has menace. After an Assassin or Etrata connects, freerunning casts him for {U}{B}.",
  "how": "Attack with a cheap Assassin, then cast him for two mana in main phase two. With Ramses out too, your one-drops are 3/3s.",
  "syn": [
   "Ramses, Assassin Lord",
   "Hired Poisoner",
   "Changeling Outcast",
   "Rooftop Bypass"
  ],
  "warn": "He doesn't pump himself. Cloaks only get the bonus once a type enabler makes them Assassins.",
  "b4": 1,
  "cut": "Arcane Adaptation",
  "gc": false,
  "usd": 6.73,
  "eur": 5.72,
  "printing": "Assassin's Creed #294 Starter Kit"
 },
 {
  "name": "Interceptor, Shadow's Hound",
  "qty": 0,
  "cost": "{2}{B}{B}",
  "mv": 4,
  "type": "Legendary Creature — Dog",
  "cat": "Creature",
  "pt": "4/3",
  "text": "Menace\nAssassins you control have menace.\nWhenever you attack with one or more legendary creatures, you may pay {2}{B}. If you do, return this card from your graveyard to the battlefield tapped and attacking.",
  "roles": [
   "evasion",
   "finisher"
  ],
  "why": "Assassins you control have menace. That's evasion for the whole team, and it keeps coming back: whenever you attack with a legendary creature, pay {2}{B} to return it from your graveyard tapped and attacking.",
  "how": "Cast it before a big attack. Most tables can't double-block several Assassins at once. If it dies, it comes back the next time Etrata, Mari, Black Widow or another legend attacks.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Mari, the Killing Quill",
   "Black Widow, Deadly Hunter",
   "Achilles Davenport"
  ],
  "warn": "It's a Dog, not an Assassin, so it doesn't give itself the lords' bonus (it has menace anyway).",
  "b4": 1,
  "cut": "Cursed Windbreaker",
  "gc": false,
  "usd": 0.25,
  "eur": 0.21,
  "printing": "Final Fantasy Commander #47"
 },
 {
  "name": "Ezio, Blade of Vengeance",
  "qty": 0,
  "cost": "{3}{U}{B}",
  "mv": 5,
  "type": "Legendary Creature — Human Assassin",
  "cat": "Creature",
  "pt": "5/5",
  "text": "Deathtouch (Any amount of damage this deals to a creature is enough to destroy it.)\nWhenever an Assassin you control deals combat damage to a player, draw a card.",
  "roles": [
   "assassin",
   "draw",
   "finisher"
  ],
  "why": "A 5/5 deathtouch Assassin for five that draws a card every time an Assassin you control deals combat damage to a player. It stacks with Black Widow.",
  "how": "Your top end. Protect it with Swiftfoot Boots or a counterspell, then attack wide: every connecting Assassin draws, every cloak joins the army.",
  "syn": [
   "Black Widow, Deadly Hunter",
   "Mari, the Killing Quill",
   "Roshan, Hidden Magister",
   "Swiftfoot Boots"
  ],
  "warn": "Five mana is a lot in this deck. Don't jam it into open counter mana if a cheaper threat does the job.",
  "b4": 1,
  "cut": "They Came from the Pipes",
  "gc": false,
  "usd": null,
  "eur": null,
  "printing": null
 },
 {
  "name": "Skullclamp",
  "qty": 0,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "roles": [
   "draw"
  ],
  "why": "The best card draw in Commander for small creatures. Equip it to a 1-toughness creature and it dies: draw two. Equip it to anything else that trades in combat: draw two.",
  "how": "Equip it to Hired Poisoner, Guildsworn Prowler (three cards), Merciless Harlequin or a Bitterblossom Faerie when you need cards, or to an attacker that's about to trade.",
  "syn": [
   "Guildsworn Prowler",
   "Hired Poisoner",
   "Bitterblossom",
   "Merciless Harlequin",
   "Rooftop Bypass"
  ],
  "warn": "Killing your own creatures shrinks your attack. Draw what you need, then keep the board.",
  "b4": 1,
  "cut": "Mask of Memory",
  "gc": false,
  "usd": 5.62,
  "eur": 4.78,
  "printing": "Marvel Super Heroes Commander #210"
 },
 {
  "name": "Kindred Discovery",
  "qty": 0,
  "cost": "{3}{U}{U}",
  "mv": 5,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "As Kindred Discovery enters, choose a creature type.\nWhenever a creature you control of the chosen type enters or attacks, draw a card.",
  "roles": [
   "draw"
  ],
  "why": "Name Assassin: every Assassin you cast and every Assassin that attacks draws a card. With 30 creatures, that's a card engine that rewards exactly what the deck does.",
  "how": "Cast it on a turn you can't attack well, then attack with everything the next turn.",
  "syn": [
   "Changeling Outcast",
   "Mischievous Sneakling",
   "Roshan, Hidden Magister",
   "Maskwood Nexus"
  ],
  "warn": "Five mana and it does nothing the turn it lands. Against fast tables, cast threats first.",
  "b4": 1,
  "cut": "Strixhaven Stadium",
  "gc": false,
  "usd": 6.49,
  "eur": 5.52,
  "printing": "Marvel Super Heroes Commander #150"
 },
 {
  "name": "Rooftop Bypass",
  "qty": 0,
  "cost": "{1}{U}{B}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever one or more nontoken creatures you control deal combat damage to a player, create a 1/1 black Assassin creature token with menace. (It can't be blocked except by two or more creatures.)",
  "roles": [
   "utility",
   "finisher"
  ],
  "why": "Whenever one or more of your nontoken creatures deal combat damage to a player, create a 1/1 Assassin with menace. It triggers once per player hit, so a wide attack at three players makes three Assassins.",
  "how": "Spread your attack across players to make more tokens. The tokens are Assassins, so they cloak cards through Etrata and get the lords' bonus.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Achilles Davenport",
   "Ramses, Assassin Lord",
   "Skullclamp"
  ],
  "warn": "Only nontoken creatures trigger it; the tokens themselves don't make more.",
  "b4": 1,
  "cut": "Chthonian Nightmare",
  "gc": false,
  "usd": 5.8,
  "eur": 4.93,
  "printing": "Assassin's Creed #298 Starter Kit"
 },
 {
  "name": "Eagle Vision",
  "qty": 0,
  "cost": "{4}{U}",
  "mv": 5,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Freerunning {1}{U} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDraw three cards.",
  "roles": [
   "draw"
  ],
  "why": "Draw three for {1}{U} with freerunning, after an Assassin or Etrata connects.",
  "how": "Attack, then refill in main phase two.",
  "syn": [
   "Achilles Davenport",
   "Merciless Harlequin",
   "Chain Assassination"
  ],
  "warn": "Five mana without freerunning: a bad deal. Wait for a hit.",
  "b4": 1,
  "cut": "Frantic Search",
  "gc": false,
  "usd": 0.35,
  "eur": 0.3,
  "printing": "Assassin's Creed #17"
 },
 {
  "name": "Brainstorm",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Draw three cards, then put two cards from your hand on top of your library in any order.",
  "roles": [
   "draw"
  ],
  "why": "One mana, see three cards. With Vampiric Tutor, Imperial Seal and the fetch lands, it's also the best way to use a card you put on top and to shuffle away what you don't want.",
  "how": "Cast it at the end of the turn before yours, or after a tutor puts a card on top.",
  "syn": [
   "Vampiric Tutor",
   "Imperial Seal",
   "Polluted Delta",
   "Flooded Strand"
  ],
  "warn": "Without a shuffle, you draw the two cards you put back.",
  "b4": 1,
  "cut": "Supernatural Stamina",
  "gc": false,
  "usd": 1.06,
  "eur": 0.9,
  "printing": "Reality Fracture Commander"
 },
 {
  "name": "Go for the Throat",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target nonartifact creature.",
  "roles": [
   "removal"
  ],
  "why": "Two-mana instant removal for any nonartifact creature. Reality Shift gave the opponent a 2/2 back.",
  "how": "Kill the blocker or the engine that stops your attack.",
  "syn": [
   "Mari, the Killing Quill",
   "Chain Assassination"
  ],
  "warn": "It can't hit artifact creatures.",
  "b4": 1,
  "cut": "Reality Shift",
  "gc": false,
  "usd": 0.49,
  "eur": 0.42,
  "printing": "Foundations Jumpstart #447"
 },
 {
  "name": "Chain Assassination",
  "qty": 0,
  "cost": "{2}{B}{B}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Freerunning {1}{B} (You may cast this spell for its freerunning cost if you dealt combat damage to a player this turn with an Assassin or commander.)\nDestroy target creature. If another creature died this turn, draw a card.",
  "roles": [
   "removal",
   "draw"
  ],
  "why": "Instant-speed 'destroy target creature' that costs {1}{B} with freerunning and draws a card if another creature already died this turn. In an attacking deck, that's most turns.",
  "how": "Attack, trade a creature or two, then kill their best blocker and draw.",
  "syn": [
   "Mari, the Killing Quill",
   "Merciless Harlequin",
   "Eagle Vision"
  ],
  "warn": "Four mana without freerunning.",
  "b4": 1,
  "cut": "Feed the Swarm",
  "gc": false,
  "usd": 0.3,
  "eur": 0.26,
  "printing": "Assassin's Creed #23"
 },
 {
  "name": "Shoot the Sheriff",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Destroy target non-outlaw creature. (Assassins, Mercenaries, Pirates, Rogues, and Warlocks are outlaws. Everyone else is fair game.)",
  "roles": [
   "removal"
  ],
  "why": "Two-mana instant: destroy target non-outlaw creature. Most commanders and big threats aren't Assassins, Mercenaries, Pirates, Rogues or Warlocks.",
  "how": "Hold it for the threat that matters.",
  "syn": [
   "Mari, the Killing Quill"
  ],
  "warn": "It can't hit outlaws, so it's weak against Rogue and Pirate decks.",
  "b4": 1,
  "cut": "Dispel",
  "gc": false,
  "usd": 0.9,
  "eur": 0.77,
  "printing": "Outlaws of Thunder Junction #106"
 },
 {
  "name": "Swiftfoot Boots",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "Equipped creature has hexproof and haste.\nEquip {1}",
  "roles": [
   "protect"
  ],
  "why": "Hexproof and haste for Etrata or your best creature, for two and equip {1}. Haste means Etrata or Ezio can attack the turn they land.",
  "how": "Cast it before Etrata when you can, then play her and equip her the same turn.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ezio, Blade of Vengeance",
   "Mari, the Killing Quill"
  ],
  "warn": "Hexproof doesn't stop sweepers or edicts.",
  "b4": 1,
  "cut": "Training Grounds",
  "gc": false,
  "usd": 2.3,
  "eur": 1.95,
  "printing": "Magic 2012 #219"
 },
 {
  "name": "Lightning Greaves",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "Equipped creature has haste and shroud.\nEquip {0}",
  "roles": [
   "protect"
  ],
  "why": "Shroud and haste, equip {0}. Move it freely every turn to the creature that needs protection or needs to attack now.",
  "how": "Move it in your main phase to the creature you just cast, then move it back before you pass.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ezio, Blade of Vengeance",
   "Swiftfoot Boots"
  ],
  "warn": "Shroud also stops your own Brotherhood Regalia equip and your own pump targets.",
  "b4": 1,
  "cut": "Aqueous Form",
  "gc": false,
  "usd": 4.85,
  "eur": 4.12,
  "printing": "Aetherdrift Commander #55"
 },
 {
  "name": "Brotherhood Regalia",
  "qty": 0,
  "cost": "{2}",
  "mv": 2,
  "type": "Artifact — Equipment",
  "cat": "Artifact",
  "pt": "",
  "text": "Equipped creature has ward {2}, is an Assassin in addition to its other types, and can't be blocked.\nEquip legendary creature {1}\nEquip {3}",
  "roles": [
   "evasion",
   "protect"
  ],
  "why": "Equipped creature can't be blocked, has ward {2} and is an Assassin. Equip costs only {1} on a legendary creature: Mari, Black Widow, Virtus, Shadow, Achilles, Ramses and Ezio are all legendary.",
  "how": "Put it on Virtus or Unstoppable Slasher to halve a life total every turn, or on Black Widow to draw every turn.",
  "syn": [
   "Virtus the Veiled",
   "Unstoppable Slasher",
   "Black Widow, Deadly Hunter",
   "Ramses, Assassin Lord"
  ],
  "warn": "Equip {3} on a creature that isn't legendary, such as Unstoppable Slasher.",
  "b4": 1,
  "cut": "Cryptic Coat",
  "gc": false,
  "usd": 9.99,
  "eur": 8.49,
  "printing": "Assassin's Creed #71"
 },
 {
  "name": "Brotherhood Headquarters",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast an Assassin spell or a spell that has freerunning, or to activate an ability of an Assassin source.",
  "roles": [
   "land"
  ],
  "why": "A land that makes any color for Assassin spells, freerunning spells and abilities of Assassins, and {C} for everything else.",
  "how": "Count it as a blue or black source for your Assassins and freerunning spells only. Your counterspells, card draw and equipment get {C} from it.",
  "syn": [
   "Achilles Davenport",
   "Eagle Vision",
   "Chain Assassination"
  ],
  "warn": "It won't cast Counterspell or Skullclamp with colored mana.",
  "b4": 1,
  "cut": "Bojuka Bog",
  "gc": false,
  "usd": 0.32,
  "eur": 0.27,
  "printing": "Assassin's Creed #80"
 },
 {
  "name": "Secluded Courtyard",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "As Secluded Courtyard enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type or activate an ability of a creature or creature card of the chosen type.",
  "roles": [
   "land"
  ],
  "why": "Name Assassin: any color for your Assassin creature spells, {C} otherwise. It fixes the creature half of the deck.",
  "how": "Tap it for creatures, basics for spells.",
  "syn": [
   "Mari, the Killing Quill",
   "Interceptor, Shadow's Hound"
  ],
  "warn": "Changelings count as Assassins; Interceptor (a Dog) doesn't.",
  "b4": 1,
  "cut": "March of Swirling Mist",
  "gc": false,
  "usd": 0.35,
  "eur": 0.3,
  "printing": "Foundations #267"
 },
 {
  "name": "Rhystic Study",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Whenever an opponent casts a spell, you may draw a card unless that player pays {1}.",
  "roles": [
   "draw"
  ],
  "why": "Every spell an opponent casts draws you a card unless they pay {1}. Tables almost never pay every time.",
  "how": "Cast it early, on turn 2 or 3. Remind the table to pay, then count your draws.",
  "syn": [
   "Mystic Remora",
   "Force of Will",
   "Fierce Guardianship"
  ],
  "warn": "A Game Changer: stage 2 has three of them, the most Bracket 3 allows.",
  "b4": 2,
  "cut": "Key to the City",
  "gc": true,
  "usd": 71,
  "eur": 60.35,
  "printing": "Jumpstart 2022"
 },
 {
  "name": "Fierce Guardianship",
  "qty": 0,
  "cost": "{2}{U}",
  "mv": 3,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nCounter target noncreature spell.",
  "roles": [
   "counter",
   "protect"
  ],
  "why": "Counter target noncreature spell, for free while you control your commander. It stops the sweeper or removal spell aimed at your board without spending your turn's mana.",
  "how": "Save it for wipes and for removal on Etrata, Mari or Ezio.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Force of Will",
   "Swan Song"
  ],
  "warn": "Free only with your commander on the battlefield. Otherwise it costs {2}{U}.",
  "b4": 2,
  "cut": "Arcane Denial",
  "gc": true,
  "usd": 67,
  "eur": 56.95,
  "printing": "Commander 2020"
 },
 {
  "name": "Cyclonic Rift",
  "qty": 0,
  "cost": "{1}{U}",
  "mv": 2,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Return target nonland permanent you don't control to its owner's hand.\nOverload {6}{U} (You may cast this spell for its overload cost. If you do, change its text by replacing all instances of \"target\" with \"each.\")",
  "roles": [
   "removal",
   "finisher"
  ],
  "why": "Two mana: bounce one nonland permanent. Seven mana, overloaded at the end of the turn before yours: every opposing nonland permanent goes back to its owner's hand, and your attack meets empty boards.",
  "how": "Use the cheap mode on a blocker or a tapper early. Late, overload it at the end step of the player before you, then swing with everything.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Ramses, Assassin Lord",
   "Rooftop Bypass"
  ],
  "warn": "Tokens bounced by it disappear. Cloaks you control are yours and stay.",
  "b4": 2,
  "cut": "Toxic Deluge",
  "gc": true,
  "usd": 30.97,
  "eur": 26.32,
  "printing": "Return to Ravnica #35"
 },
 {
  "name": "Mystic Remora",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Enchantment",
  "cat": "Enchantment",
  "pt": "",
  "text": "Cumulative upkeep {1}\nWhenever an opponent casts a noncreature spell, you may draw a card unless that player pays {4}.",
  "roles": [
   "draw"
  ],
  "why": "For {U}, draw a card each time an opponent casts a noncreature spell unless they pay {4}. The first turns of a Bracket 4 game are full of rocks and tutors.",
  "how": "Cast it turn 1 or 2, keep it two or three turns, then let it go.",
  "syn": [
   "Rhystic Study",
   "Fierce Guardianship"
  ],
  "warn": "Cumulative upkeep grows each turn: drop it once it costs more than it gives.",
  "b4": 2,
  "cut": "Night's Whisper",
  "gc": false,
  "usd": 9.34,
  "eur": 7.94,
  "printing": "Ice Age"
 },
 {
  "name": "Swan Song",
  "qty": 0,
  "cost": "{U}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Counter target enchantment, instant, or sorcery spell. Its controller creates a 2/2 blue Bird creature token with flying.",
  "roles": [
   "counter",
   "protect"
  ],
  "why": "One mana: counter an enchantment, instant or sorcery. That's every sweeper and most removal.",
  "how": "Keep {U} up once your board is worth protecting.",
  "syn": [
   "Fierce Guardianship",
   "Force of Will"
  ],
  "warn": "The caster gets a 2/2 flying Bird, which can block a flier.",
  "b4": 2,
  "cut": "Wash Away",
  "gc": false,
  "usd": 11,
  "eur": 9.35,
  "printing": "Edge of Eternities Commander"
 },
 {
  "name": "Deadly Rollick",
  "qty": 0,
  "cost": "{3}{B}",
  "mv": 4,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "If you control a commander, you may cast this spell without paying its mana cost.\nExile target creature.",
  "roles": [
   "removal"
  ],
  "why": "Exile target creature, free while you control your commander.",
  "how": "Tap out for threats, then exile the blocker or the combo creature anyway.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Fierce Guardianship"
  ],
  "warn": "Exile doesn't make a hit counter for Mari.",
  "b4": 2,
  "cut": "Springleaf Drum",
  "gc": false,
  "usd": 27.63,
  "eur": 23.49,
  "printing": "Secret Lair #1754 (Marvel's Deadpool)"
 },
 {
  "name": "Bitterblossom",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Kindred Enchantment — Faerie",
  "cat": "Enchantment",
  "pt": "",
  "text": "At the beginning of your upkeep, you lose 1 life and create a 1/1 black Faerie Rogue creature token with flying.",
  "roles": [
   "cloak",
   "draw"
  ],
  "why": "A 1/1 flying Faerie Rogue every upkeep for 1 life. Rogues get deathtouch from Mari, the tokens carry Skullclamp and they're Assassins once Roshan or Maskwood Nexus is out.",
  "how": "Cast it turn 2. Chump-block or attack with the Faeries, clamp them for cards.",
  "syn": [
   "Mari, the Killing Quill",
   "Skullclamp",
   "Roshan, Hidden Magister",
   "Black Widow, Deadly Hunter"
  ],
  "warn": "It costs 1 life each turn and you can't turn it off.",
  "b4": 2,
  "cut": "Leyline of Transformation",
  "gc": false,
  "usd": 33.05,
  "eur": 28.09,
  "printing": "Enchanting Tales #27"
 },
 {
  "name": "Watery Grave",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land — Island Swamp",
  "cat": "Land",
  "pt": "",
  "text": "({T}: Add {U} or {B}.)\nAs Watery Grave enters, you may pay 2 life. If you don't, it enters tapped.",
  "roles": [
   "land"
  ],
  "why": "The Dimir shock land: an Island Swamp that enters untapped for 2 life. The fetch lands find it.",
  "how": "Pay the 2 life early; tapped is too slow in this deck.",
  "syn": [
   "Polluted Delta",
   "Flooded Strand",
   "Marsh Flats",
   "Scalding Tarn"
  ],
  "warn": "",
  "b4": 2,
  "cut": "Exotic Orchard",
  "gc": false,
  "usd": 10.2,
  "eur": 8.67,
  "printing": "Edge of Eternities #261"
 },
 {
  "name": "Polluted Delta",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}, Pay 1 life, Sacrifice Polluted Delta: Search your library for an Island or Swamp card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Finds Watery Grave, an Island or a Swamp, and shuffles for Brainstorm and the top-of-library tutors.",
  "how": "Crack it for the color you're missing.",
  "syn": [
   "Watery Grave",
   "Brainstorm"
  ],
  "warn": "Costs 1 life.",
  "b4": 2,
  "cut": "Island",
  "gc": false,
  "usd": 20.96,
  "eur": 17.82,
  "printing": "Modern Horizons 3 #224"
 },
 {
  "name": "Flooded Strand",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}, Pay 1 life, Sacrifice Flooded Strand: Search your library for a Plains or Island card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Finds an Island or Watery Grave. The cheapest fetch that works here.",
  "how": "Crack it for Watery Grave early for both colors.",
  "syn": [
   "Watery Grave",
   "Brainstorm"
  ],
  "warn": "It can't find a basic Swamp.",
  "b4": 2,
  "cut": "Island",
  "gc": false,
  "usd": 16.28,
  "eur": 13.84,
  "printing": "Modern Horizons 3 #220"
 },
 {
  "name": "Cavern of Souls",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "As Cavern of Souls enters, choose a creature type.\n{T}: Add {C}.\n{T}: Add one mana of any color. Spend this mana only to cast a creature spell of the chosen type, and that spell can't be countered.",
  "roles": [
   "land"
  ],
  "why": "Name Assassin: your Assassin creature spells can't be countered, and it makes any color for them.",
  "how": "Tap it for Mari, Ezio or Achilles into open blue mana.",
  "syn": [
   "Ezio, Blade of Vengeance",
   "Mari, the Killing Quill",
   "Achilles Davenport"
  ],
  "warn": "Only {C} for everything else.",
  "b4": 2,
  "cut": "Swamp",
  "gc": false,
  "usd": 51.77,
  "eur": 44,
  "printing": "Lost Caverns of Ixalan #269"
 },
 {
  "name": "Mana Vault",
  "qty": 0,
  "cost": "{1}",
  "mv": 1,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Mana Vault doesn't untap during your untap step.\nAt the beginning of your upkeep, you may pay {4}. If you do, untap Mana Vault.\nAt the beginning of your draw step, if Mana Vault is tapped, it deals 1 damage to you.\n{T}: Add {C}{C}{C}.",
  "roles": [
   "ramp"
  ],
  "why": "Three colorless mana for one, once. Turn 1 Mana Vault is a turn 2 Etrata or Mari with a one-drop.",
  "how": "Use it on the turn it lands, then keep it as Shadow food.",
  "syn": [
   "Shadow, Mysterious Assassin",
   "Ezio, Blade of Vengeance"
  ],
  "warn": "It doesn't untap normally and deals 1 damage each upkeep while tapped.",
  "b4": 3,
  "cut": "Dimir Signet",
  "gc": true,
  "usd": 97,
  "eur": 82.45,
  "printing": "Fourth Edition"
 },
 {
  "name": "Chrome Mox",
  "qty": 0,
  "cost": "{0}",
  "mv": 0,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "Imprint — When Chrome Mox enters, you may exile a nonartifact, nonland card from your hand.\n{T}: Add one mana of any of the exiled card's colors.",
  "roles": [
   "ramp"
  ],
  "why": "Free mana of a color: imprint a blue or black card from your hand.",
  "how": "Imprint the card you need least: an extra land-light counterspell, a late-game five-drop.",
  "syn": [
   "Etrata, Deadly Fugitive",
   "Mari, the Killing Quill"
  ],
  "warn": "It costs a card. Don't imprint a creature you'll want later.",
  "b4": 3,
  "cut": "Mind Stone",
  "gc": true,
  "usd": 163,
  "eur": 138.55,
  "printing": "Eternal Masters"
 },
 {
  "name": "Lotus Petal",
  "qty": 0,
  "cost": "{0}",
  "mv": 0,
  "type": "Artifact",
  "cat": "Artifact",
  "pt": "",
  "text": "{T}, Sacrifice Lotus Petal: Add one mana of any color.",
  "roles": [
   "ramp"
  ],
  "why": "One mana of any color, once, for free. A turn 1 two-drop or a turn 2 Mari.",
  "how": "Hold it until the turn it makes a difference.",
  "syn": [
   "Shadow, Mysterious Assassin",
   "Dark Ritual"
  ],
  "warn": "One use.",
  "b4": 3,
  "cut": "Island",
  "gc": false,
  "usd": 42,
  "eur": 35.7,
  "printing": "Mystery Booster"
 },
 {
  "name": "Ancient Tomb",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}: Add {C}{C}. Ancient Tomb deals 2 damage to you.",
  "roles": [
   "land",
   "ramp"
  ],
  "why": "A land that taps for {C}{C}. Turn 2 Etrata or a three-drop Assassin.",
  "how": "Play it on turn 2 with a three-drop in hand.",
  "syn": [
   "Mana Vault",
   "Brotherhood Regalia"
  ],
  "warn": "2 damage each use.",
  "b4": 3,
  "cut": "Island",
  "gc": true,
  "usd": 133,
  "eur": 113.05,
  "printing": "Ultimate Masters #236"
 },
 {
  "name": "Demonic Tutor",
  "qty": 0,
  "cost": "{1}{B}",
  "mv": 2,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a card, put that card into your hand, then shuffle.",
  "roles": [
   "draw"
  ],
  "why": "Two mana: any card to your hand.",
  "how": "Early: Mari or Black Widow. Mid-game: Etrata, the Silencer, Ramses or Cyclonic Rift. Combo: Mindcrank or Duskmantle Guildmage.",
  "syn": [
   "Mari, the Killing Quill",
   "Ramses, Assassin Lord",
   "Mindcrank"
  ],
  "warn": "",
  "b4": 3,
  "cut": "Island",
  "gc": true,
  "usd": 62,
  "eur": 52.7,
  "printing": "Mystery Booster"
 },
 {
  "name": "Vampiric Tutor",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "draw"
  ],
  "why": "One mana, instant: any card on top of your library, for 2 life.",
  "how": "Cast it at the end of the turn before yours.",
  "syn": [
   "Brainstorm",
   "Mari, the Killing Quill"
  ],
  "warn": "You lose a card of tempo: it's your next draw.",
  "b4": 3,
  "cut": "Consider",
  "gc": true,
  "usd": 58,
  "eur": 49.3,
  "printing": "Dominaria Remastered"
 },
 {
  "name": "Imperial Seal",
  "qty": 0,
  "cost": "{B}",
  "mv": 1,
  "type": "Sorcery",
  "cat": "Sorcery",
  "pt": "",
  "text": "Search your library for a card, then shuffle and put that card on top. You lose 2 life.",
  "roles": [
   "draw"
  ],
  "why": "A sorcery Vampiric Tutor.",
  "how": "Turn 1 Seal for your best two-drop or Mari.",
  "syn": [
   "Brainstorm",
   "Demonic Tutor"
  ],
  "warn": "The most expensive card here for the least effect. Diabolic Intent is the budget swap.",
  "b4": 3,
  "cut": "Island",
  "gc": true,
  "usd": 182,
  "eur": 154.7,
  "printing": "Double Masters 2022"
 },
 {
  "name": "Force of Will",
  "qty": 0,
  "cost": "{3}{U}{U}",
  "mv": 5,
  "type": "Instant",
  "cat": "Instant",
  "pt": "",
  "text": "You may pay 1 life and exile a blue card from your hand rather than pay this spell's mana cost.\nCounter target spell.",
  "roles": [
   "counter",
   "protect"
  ],
  "why": "Counter anything for free, by exiling a blue card and paying 1 life.",
  "how": "Save it for the spell that would lose you the game: a wipe, a combo piece, an opponent's tutor into their win.",
  "syn": [
   "Fierce Guardianship",
   "Swan Song",
   "Counterspell"
  ],
  "warn": "Card disadvantage: two cards for one.",
  "b4": 3,
  "cut": "Swamp",
  "gc": true,
  "usd": 64,
  "eur": 54.4,
  "printing": "Dominaria Remastered #418 Borderless"
 },
 {
  "name": "Marsh Flats",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}, Pay 1 life, Sacrifice Marsh Flats: Search your library for a Plains or Swamp card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Finds a Swamp or Watery Grave.",
  "how": "Crack it for the missing color.",
  "syn": [
   "Watery Grave",
   "Brainstorm"
  ],
  "warn": "Costs 1 life.",
  "b4": 3,
  "cut": "Swamp",
  "gc": false,
  "usd": 33,
  "eur": 28.05,
  "printing": "Modern Horizons 2 #248"
 },
 {
  "name": "Scalding Tarn",
  "qty": 0,
  "cost": "",
  "mv": 0,
  "type": "Land",
  "cat": "Land",
  "pt": "",
  "text": "{T}, Pay 1 life, Sacrifice Scalding Tarn: Search your library for an Island or Mountain card, put it onto the battlefield, then shuffle.",
  "roles": [
   "land"
  ],
  "why": "Finds an Island or Watery Grave.",
  "how": "Crack it for Watery Grave.",
  "syn": [
   "Watery Grave",
   "Brainstorm"
  ],
  "warn": "Costs 1 life.",
  "b4": 3,
  "cut": "Swamp",
  "gc": false,
  "usd": 39,
  "eur": 33.15,
  "printing": "Modern Horizons 2 #254"
 }
];
window.ETRATA_B4_WIKI = {"Hired Poisoner":{"rating":3},"Thrill-Kill Assassin":{"rating":3},"Guildsworn Prowler":{"rating":3},"Mischievous Sneakling":{"rating":3},"Mari, the Killing Quill":{"rating":5},"Black Widow, Deadly Hunter":{"rating":5},"Shadow, Mysterious Assassin":{"rating":4},"Virtus the Veiled":{"rating":4},"Mistwalker":{"rating":3},"Midnight Assassin":{"rating":3},"Lydia Frye":{"rating":3},"Merciless Harlequin":{"rating":3},"Adéwalé, Breaker of Chains":{"rating":3},"Achilles Davenport":{"rating":5},"Interceptor, Shadow's Hound":{"rating":4},"Ezio, Blade of Vengeance":{"rating":5},"Skullclamp":{"rating":5},"Kindred Discovery":{"rating":4},"Rooftop Bypass":{"rating":4},"Eagle Vision":{"rating":3},"Brainstorm":{"rating":3},"Go for the Throat":{"rating":3},"Chain Assassination":{"rating":3},"Shoot the Sheriff":{"rating":3},"Swiftfoot Boots":{"rating":4},"Lightning Greaves":{"rating":4},"Brotherhood Regalia":{"rating":4},"Brotherhood Headquarters":{"rating":3},"Secluded Courtyard":{"rating":3},"Rhystic Study":{"rating":5},"Fierce Guardianship":{"rating":5},"Cyclonic Rift":{"rating":5},"Mystic Remora":{"rating":4},"Swan Song":{"rating":4},"Deadly Rollick":{"rating":4},"Bitterblossom":{"rating":4},"Watery Grave":{"rating":3},"Polluted Delta":{"rating":3},"Flooded Strand":{"rating":2},"Cavern of Souls":{"rating":4},"Mana Vault":{"rating":4},"Chrome Mox":{"rating":4},"Lotus Petal":{"rating":3},"Ancient Tomb":{"rating":4},"Demonic Tutor":{"rating":5},"Vampiric Tutor":{"rating":4},"Imperial Seal":{"rating":4},"Force of Will":{"rating":5},"Marsh Flats":{"rating":2},"Scalding Tarn":{"rating":2}};
window.ETRATA_B4_LIST = ["Changeling Outcast","Mothdust Changeling","Universal Automaton","Hookblade Veteran","Hired Poisoner","Brotherhood Spy","Desmond Miles","Basim Ibn Ishaq","Duskmantle Guildmage","Guildsworn Prowler","Thrill-Kill Assassin","Mischievous Sneakling","Mari, the Killing Quill","Black Widow, Deadly Hunter","Shadow, Mysterious Assassin","Virtus the Veiled","Unstoppable Slasher","Mistwalker","Midnight Assassin","Lydia Frye","Merciless Harlequin","Gix, Yawgmoth Praetor","Adéwalé, Breaker of Chains","Achilles Davenport","Ramses, Assassin Lord","Roshan, Hidden Magister","Etrata, the Silencer","Interceptor, Shadow's Hound","Spark Double","Ezio, Blade of Vengeance","Sol Ring","Mana Vault","Chrome Mox","Lotus Petal","Arcane Signet","Talisman of Dominance","Fellwar Stone","Dark Ritual","Skullclamp","Rhystic Study","Mystic Remora","Kindred Discovery","Rooftop Bypass","Bitterblossom","Eagle Vision","Preordain","Brainstorm","Demonic Tutor","Vampiric Tutor","Imperial Seal","Force of Will","Fierce Guardianship","Swan Song","Counterspell","An Offer You Can't Refuse","Infernal Grasp","Go for the Throat","Deadly Rollick","Chain Assassination","Shoot the Sheriff","Cyclonic Rift","Swiftfoot Boots","Lightning Greaves","Brotherhood Regalia","Cover of Darkness","Maskwood Nexus","Mindcrank","Ancient Tomb","Command Tower","Watery Grave","Polluted Delta","Marsh Flats","Scalding Tarn","Flooded Strand","Underground River","Drowned Catacomb","Sunken Hollow","Choked Estuary","Darkwater Catacombs","Darkslick Shores","Tainted Isle","River of Tears","Path of Ancestry","Access Tunnel","Rogue's Passage","Brotherhood Headquarters","Cavern of Souls","Secluded Courtyard","Island","Island","Island","Island","Island","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp"];
window.ETRATA_B4_STAGE1 = ["Changeling Outcast","Mothdust Changeling","Universal Automaton","Hookblade Veteran","Hired Poisoner","Brotherhood Spy","Desmond Miles","Basim Ibn Ishaq","Duskmantle Guildmage","Guildsworn Prowler","Thrill-Kill Assassin","Mischievous Sneakling","Mari, the Killing Quill","Black Widow, Deadly Hunter","Shadow, Mysterious Assassin","Virtus the Veiled","Unstoppable Slasher","Mistwalker","Midnight Assassin","Lydia Frye","Merciless Harlequin","Gix, Yawgmoth Praetor","Adéwalé, Breaker of Chains","Achilles Davenport","Ramses, Assassin Lord","Roshan, Hidden Magister","Etrata, the Silencer","Interceptor, Shadow's Hound","Spark Double","Ezio, Blade of Vengeance","Sol Ring","Arcane Signet","Dimir Signet","Talisman of Dominance","Fellwar Stone","Mind Stone","Springleaf Drum","Dark Ritual","Skullclamp","Kindred Discovery","Rooftop Bypass","Key to the City","Eagle Vision","Preordain","Consider","Brainstorm","Night's Whisper","Counterspell","Arcane Denial","An Offer You Can't Refuse","Wash Away","Infernal Grasp","Go for the Throat","Chain Assassination","Shoot the Sheriff","Toxic Deluge","Swiftfoot Boots","Lightning Greaves","Brotherhood Regalia","Cover of Darkness","Maskwood Nexus","Leyline of Transformation","Mindcrank","Command Tower","Exotic Orchard","Underground River","Drowned Catacomb","Sunken Hollow","Choked Estuary","Darkwater Catacombs","Darkslick Shores","Tainted Isle","River of Tears","Path of Ancestry","Access Tunnel","Rogue's Passage","Brotherhood Headquarters","Secluded Courtyard","Island","Island","Island","Island","Island","Island","Island","Island","Island","Island","Island","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp","Swamp"];
