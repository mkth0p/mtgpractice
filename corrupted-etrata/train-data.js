/* Corrupted Etrata: hand-written scenarios for two Train drills (train.js). Stack Sentinel: an opponent
   (or you) puts something on the stack, what do you do? Threat Read: four players, who do you pick?
   Card text from cards.js (the Forge database); answers follow the comprehensive rules cited in each
   explanation. answer: index of the best option, or a list when several are equally right. */
window.CETRATA_TRAIN_DATA = {
  stack: [
    {
      context: "Round 5, an opponent's main phase. You control <i-c>Etrata, Deadly Fugitive</i-c> and a face-down <i-c>Silumgar Assassin</i-c>. You have Island, Island, Swamp untapped.",
      q: "They cast Damnation. Your hand: <i-c>Swan Song</i-c>, <i-c>Counterspell</i-c>. What do you do?",
      options: ["Swan Song the Damnation", "Counterspell the Damnation", "Let it resolve and recast Etrata"],
      answer: 0,
      explain: "<i-c>Swan Song</i-c> hits sorceries for one mana, and a 2/2 Bird for them is nothing next to losing Etrata and your face-down removal. Keep <i-c>Counterspell</i-c>: it's your only answer to a creature spell.",
      principle: "Counter with the narrowest spell that hits. Keep the flexible counter for what only it can stop."
    },
    {
      context: "Round 6. An opponent with lethal on board next turn casts Craterhoof Behemoth. You have two blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>An Offer You Can't Refuse</i-c>, <i-c>Counterspell</i-c>. Which one stops it?",
      options: ["Swan Song", "An Offer You Can't Refuse", "Counterspell", "None of them"],
      answer: 2,
      explain: "Only <i-c>Counterspell</i-c> counters a creature spell. <i-c>Swan Song</i-c> hits enchantments, instants and sorceries; <i-c>An Offer You Can't Refuse</i-c> and <i-c>Fierce Guardianship</i-c> only noncreature spells.",
      principle: "Four of your five counters can't touch a creature. Count your creature answers before you spend Counterspell."
    },
    {
      context: "Round 3. You're building toward <i-c>Mindcrank</i-c> and <i-c>Duskmantle Guildmage</i-c>. An opponent casts Rest in Peace. You have one blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>An Offer You Can't Refuse</i-c>. Which do you use?",
      options: ["Swan Song", "An Offer You Can't Refuse", "Neither: Rest in Peace doesn't affect you"],
      answer: 0,
      explain: "Rest in Peace exiles everything that would go to a graveyard, so milled cards never trigger the Guildmage: it switches the line off. Both counters hit it, but on round 3 two Treasures are two extra mana for that player next turn, a full turn of ramp. The Bird from <i-c>Swan Song</i-c> is a 2/2.",
      principle: "Offer's Treasures cost little on your win turn and a lot early on."
    },
    {
      context: "Your end step, round 6. <i-c>Etrata, Deadly Fugitive</i-c> is on the battlefield. You're tapped out.",
      q: "An opponent casts Cyclonic Rift with overload. You hold <i-c>Fierce Guardianship</i-c>. Can you stop it?",
      options: ["Yes, cast Fierce Guardianship for free", "No, you have no mana", "Only if Etrata isn't tapped"],
      answer: 0,
      explain: "<i-c>Fierce Guardianship</i-c>: “If you control a commander, you may cast this spell without paying its mana cost.” Etrata on the battlefield is a commander you control, tapped or not. Overloaded Rift is still a noncreature spell.",
      principle: "With Etrata out, Fierce Guardianship and Deadly Rollick cost nothing. Keep them in mind when you look tapped out."
    },
    {
      context: "Round 5. Etrata died last turn and is back in the command zone. You have Island and Swamp untapped.",
      q: "An opponent casts a wrath. You hold <i-c>Fierce Guardianship</i-c>. What can you do?",
      options: ["Cast it for free", "Cast it for its mana cost", "Nothing: you can't cast it"],
      answer: 2,
      explain: "A commander in the command zone isn't a commander you control: only one on the battlefield counts. So Fierce costs its full {2}{U}, three mana, and you have two.",
      principle: "Fierce Guardianship is free only while your commander is on the battlefield."
    },
    {
      context: "Your combat, round 4. Etrata attacks. An opponent casts Swords to Plowshares on her. You have two blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>Counterspell</i-c>. What do you do?",
      options: ["Swan Song the Swords", "Counterspell the Swords", "Let her go and recast her for 5"],
      answer: 0,
      explain: "Swords is an instant, so <i-c>Swan Song</i-c> stops it for one mana and leaves you a blue for something else. Recasting Etrata costs 5 now and 7 next time.",
      principle: "Etrata is your engine: protecting her is usually worth a counter."
    },
    {
      context: "Round 7. An opponent casts Thassa's Oracle. With its enter trigger on the stack, they cast Demonic Consultation. You have two blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>Counterspell</i-c>. What's your best response?",
      options: ["Swan Song the Consultation", "Counterspell the Consultation", "Counter Thassa's Oracle's trigger", "Nothing works now"],
      answer: 0,
      explain: "Consultation is an instant, so <i-c>Swan Song</i-c> counters it for one mana. Their library stays full, and the Oracle trigger resolves without winning. Keep <i-c>Counterspell</i-c> and a blue for their backup. You can't counter the trigger with a counterspell: an ability isn't a spell.",
      principle: "Abilities aren't spells: Counterspell can't touch a trigger or an activation. Counter the spell that makes the trigger win."
    },
    {
      context: "Round 1. An opponent plays a land and casts Sol Ring. You have one blue open.",
      q: "You hold <i-c>An Offer You Can't Refuse</i-c> and <i-c>Swan Song</i-c>. Counter the Sol Ring?",
      options: ["Yes, with Offer", "Yes, with Swan Song", "No, let it resolve"],
      answer: 2,
      explain: "<i-c>Swan Song</i-c> can't target an artifact. <i-c>An Offer You Can't Refuse</i-c> can, but it gives them two Treasures: two mana next turn, the same jump the Sol Ring gives, and you've spent a card on it.",
      principle: "Offer only works against a spell that's worth more than two mana."
    },
    {
      context: "Round 5. An opponent casts Cursed Totem. You have two blue open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>An Offer You Can't Refuse</i-c>, <i-c>Counterspell</i-c>. What do you do?",
      options: ["Swan Song it", "Offer it", "Counterspell it", "Let it resolve"],
      answer: [1, 2],
      explain: "Cursed Totem stops creatures' activated abilities: no <i-c>Duskmantle Guildmage</i-c> drain, and Etrata's flip is an activated ability of your face-down creatures, so the Manta loop is off too. (A face-down <i-c>Silumgar Assassin</i-c> can still flip by megamorph: that's a special action, not an ability.) It must be countered. <i-c>Swan Song</i-c> can't target an artifact; <i-c>An Offer You Can't Refuse</i-c> and <i-c>Counterspell</i-c> both can. Offer is cheaper and leaves Counterspell for a creature; Counterspell gives them nothing. Either is fine.",
      principle: "Know which hate pieces shut off which line: Cursed Totem and Linvala stop three of them."
    },
    {
      context: "Your turn, round 7. <i-c>Sanguine Bond</i-c> is on the battlefield and you cast <i-c>Exquisite Blood</i-c> to win. An opponent casts Swan Song on it. You control Etrata and have two blue open.",
      q: "You hold <i-c>Fierce Guardianship</i-c> and <i-c>Counterspell</i-c>. What do you do?",
      options: ["Fierce Guardianship their Swan Song, for free", "Counterspell their Swan Song", "Let it go and try next turn"],
      answer: 0,
      explain: "With Etrata out, <i-c>Fierce Guardianship</i-c> costs nothing and counters Swan Song (a noncreature spell). You keep two blue and <i-c>Counterspell</i-c> for the second counter they might have.",
      principle: "In a counter war, spend free spells first and keep your mana for the next round."
    },
    {
      context: "Round 6. Etrata is in the command zone and you have nothing on the battlefield but lands. The player to your right has a big board that will attack you next turn.",
      q: "Another opponent casts Austere Command, choosing all creatures. You hold <i-c>Counterspell</i-c>. Counter it?",
      options: ["Yes: never let a wrath resolve", "No: it only kills their boards"],
      answer: 1,
      explain: "You have no creatures, and the wrath kills the board that was about to hit you. Let it resolve, keep the counter for a spell that hurts you.",
      principle: "Don't counter a spell that does your work for you."
    },
    {
      context: "Round 7. An opponent casts Ad Nauseam with six mana's worth of rocks on the battlefield. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c> and <i-c>An Offer You Can't Refuse</i-c>. Which do you use?",
      options: ["Swan Song", "An Offer You Can't Refuse", "Let it go: they'll lose a lot of life"],
      answer: 0,
      explain: "Both hit an instant. But a combo player who just drew a fistful of cards wants mana: Offer's two Treasures could pay for the rest of the combo. A 2/2 Bird does nothing for them.",
      principle: "Against a combo player, Swan Song over Offer."
    },
    {
      context: "Round 4. An opponent casts Toxic Deluge. You have two blue open.",
      q: "You hold <i-c>Muddle the Mixture</i-c> and <i-c>Counterspell</i-c>. Which do you use?",
      options: ["Muddle the Mixture", "Counterspell"],
      answer: 0,
      explain: "Both cost {U}{U}. <i-c>Muddle the Mixture</i-c> only hits instants and sorceries, which this is, so spend it and keep <i-c>Counterspell</i-c> for creature spells. (If you need a two-mana card more than a counter, Muddle can also transmute for one.)",
      principle: "Same cost, different reach: spend the narrow one."
    },
    {
      context: "Your main phase. You activate the flip on a face-down <i-c>Wormfang Manta</i-c> you manifested with <i-c>Scroll of Fate</i-c> ({2}{U}{B}). In response, an opponent kills Etrata with Infernal Grasp.",
      q: "What happens to your activation?",
      options: ["It still resolves: the Manta turns face up", "It's countered because Etrata left", "The Manta stays face down and you get the mana back"],
      answer: 0,
      explain: "Once an ability is activated it's on the stack on its own, independent of its source (rule 113.7a). Etrata granted the ability, but it was already activated. The Manta turns face up, and <i-c>Crystal Shard</i-c> can still bounce it for an extra turn.",
      principle: "Killing the source doesn't stop an ability that's already on the stack."
    },
    {
      context: "An opponent's turn, round 6. Etrata and a face-down card are on your battlefield. You looked at it: it's a Counterspell you cloaked off an opponent. You have four lands untapped.",
      q: "That opponent casts a removal spell on your <i-c>Sanguine Bond</i-c>. Can the face-down card help?",
      options: ["Yes: activate its flip, it can't turn face up, so you exile it and cast the Counterspell free", "No: you can only flip at sorcery speed", "No: a face-down Counterspell is just a 2/2"],
      answer: 0,
      explain: "Etrata's granted ability can be activated any time you have priority. A Counterspell isn't a creature card, so it can't be turned face up: you exile it and may cast it without paying its mana cost, while the ability resolves, so it counters the removal still on the stack.",
      principle: "Your face-down noncreature cards are free instants for four mana. Look at them every turn."
    },
    {
      context: "Round 7. An opponent at 62 life activates Aetherflux Reservoir's ability (pay 50 life: 50 damage) targeting you. You have <i-c>Counterspell</i-c>, and <i-c>Otawara, Soaring City</i-c> with mana to channel it.",
      q: "What stops it?",
      options: ["Counterspell the ability", "Channel Otawara to bounce the Reservoir", "Nothing in your hand"],
      answer: 2,
      explain: "Counterspell counters spells, not abilities. Bouncing the Reservoir doesn't help either: the ability is already on the stack and resolves without its source (rule 113.7a).",
      principle: "Abilities on the stack resolve even if their source is gone. Your answer had to come before the activation."
    },
    {
      context: "Round 3. You cast Etrata. An opponent casts Counterspell on her. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c>. Can you save Etrata?",
      options: ["No: Swan Song can't counter creature spells", "Yes: Swan Song their Counterspell"],
      answer: 1,
      explain: "You're not targeting Etrata: you're targeting their Counterspell, an instant, which <i-c>Swan Song</i-c> can counter. Etrata then resolves.",
      principle: "Your narrow counters protect any of your spells, because the spell they target is theirs."
    },
    {
      context: "Your turn, round 8. You've made infinite drain with <i-c>Exquisite Blood</i-c> and <i-c>Sanguine Bond</i-c> about to go off. In response, an opponent casts Teferi's Protection. You have one blue open.",
      q: "You hold <i-c>Swan Song</i-c> and <i-c>An Offer You Can't Refuse</i-c>. What do you do?",
      options: ["Swan Song it", "Offer it", "Let it resolve: they lose to the drain anyway"],
      answer: [0, 1],
      explain: "Teferi's Protection stops their life total from changing until their next turn, so your loop wouldn't kill them. Counter it with either: you win this turn, so neither the Bird nor the Treasures matter.",
      principle: "On your win turn, every counter is equally good. Use the one you're sure about."
    },
    {
      context: "Round 5. An opponent casts Linvala, Keeper of Silence. Etrata is on the battlefield. You have two mana open.",
      q: "Your hand: <i-c>Swan Song</i-c>, <i-c>An Offer You Can't Refuse</i-c>, <i-c>Deadly Rollick</i-c>. What do you do?",
      options: ["Swan Song it", "Offer it", "Let it resolve, then exile it with Deadly Rollick for free", "Let it resolve and live with it"],
      answer: 2,
      explain: "Linvala is a creature spell: neither <i-c>Swan Song</i-c> nor <i-c>An Offer You Can't Refuse</i-c> can target it. Once it resolves, <i-c>Deadly Rollick</i-c> exiles it, free while you control your commander. Until then your creatures' activated abilities are off, Etrata's flips included.",
      principle: "When a counter can't hit it, plan the removal."
    },
    {
      context: "Round 2. An opponent casts Rhystic Study. You have one blue open.",
      q: "You hold <i-c>An Offer You Can't Refuse</i-c>. Counter it?",
      options: ["Yes", "No, pay the 1 when you can"],
      answer: 0,
      explain: "Rhystic Study taxes every spell you cast all game, or draws them a card each time. Two Treasures now are a fair price for stopping a card that would draw them ten. This is the case for Offer: a noncreature engine worth far more than two mana.",
      principle: "Offer's best targets: card-draw engines and wraths, not cheap ramp."
    }
  ],
  threat: [
    {
      context: "Round 5. <i-c>Tetsuko Umezawa, Fugitive</i-c> makes Etrata unblockable. Your opponents: a ramp deck full of big creatures, a mono-white tokens deck, and a blue control deck with 12 lands.",
      q: "Who does Etrata hit, to cloak the top card of their library?",
      options: ["The ramp deck", "The tokens deck", "The control deck"],
      answer: 0,
      explain: "A cloaked creature card can be turned face up with Etrata's ability for {2}{U}{B}: from the ramp deck that's often a seven- or eight-drop for four mana. Noncreature cards you cast free instead, but the control deck's top card is half lands.",
      principle: "Steal from the deck whose average card is the most expensive."
    },
    {
      context: "Round 4. You activate <i-c>Wishclaw Talisman</i-c> and an opponent gains control of it. One opponent plays a combo deck with tutors, one a slow tokens deck, one a mid-range deck that's tapped out.",
      q: "Who do you give it to?",
      options: ["The combo player", "The tokens player", "The tapped-out mid-range player"],
      answer: 1,
      explain: "They can only activate it on their turn, and a tutor is worth the most to a combo deck. The slow tokens deck gets the least out of one card, and whoever uses it gives it back to an opponent, maybe you.",
      principle: "Give Wishclaw to the player who gains least from a tutor."
    },
    {
      context: "Round 6. You cast <i-c>Praetor's Grasp</i-c>. One opponent is a known combo deck one piece short, one is at 9 life, one is the biggest board.",
      q: "Whose library do you search?",
      options: ["The combo player's", "The player at 9 life", "The biggest board's"],
      answer: 0,
      explain: "You get to play the card you take, and the combo player loses the piece: taking their win condition hurts them and helps you. The other two libraries only help you.",
      principle: "Theft that also removes a key card counts twice."
    },
    {
      context: "Round 4. You have Etrata, a face-down <i-c>Silumgar Assassin</i-c> and {2}{B} open. Opponents' creatures: a 6/6 attacking you, a 3/1 commander that draws its controller a card whenever it deals combat damage, and a 1/1 mana elf.",
      q: "You flip the Assassin for its megamorph cost. What does its trigger destroy?",
      options: ["The 6/6 attacker", "The 3/1 card-draw commander", "The mana elf"],
      answer: 1,
      explain: "The trigger destroys “target creature with power 3 or less an opponent controls”, so the 6/6 isn't a legal target: block it with Etrata, whose deathtouch kills it. The commander is a repeatable card engine and costs more each time it's recast; the elf is one mana.",
      principle: "Aim Silumgar Assassin at engines with power 3 or less. Leave big attackers to your deathtouch blockers."
    },
    {
      context: "Round 5. You have Etrata and four face-down 2/2s. One opponent has three untapped 1/1 tokens, one has a 5/5 with first strike, one has no creatures and no open mana.",
      q: "Who do the face-down creatures attack?",
      options: ["The player with no creatures", "The tokens player", "Split them between everyone"],
      answer: 0,
      explain: "Eight unblocked damage, and nothing can kill a face-down card you'll flip later. Into the tokens they trade 2/2s for 1/1s; into the first striker they die. Your face-down cards are your stolen spells: don't waste them in trades.",
      principle: "Face-down creatures are spells you haven't cast yet. Attack only where they live."
    },
    {
      context: "Round 4. An opponent has a 5/5 first striker untapped. You have Etrata (1/4, deathtouch).",
      q: "Do you attack that player with Etrata?",
      options: ["Yes: deathtouch kills anything that blocks", "No: keep her home"],
      answer: 1,
      explain: "First strike deals its 5 damage before Etrata deals hers, so she dies without dealing damage and deathtouch never happens. Against a normal blocker deathtouch trades up; against first strike she just dies.",
      principle: "Deathtouch doesn't work if she's dead before regular combat damage."
    },
    {
      context: "Round 6. You have a face-down <i-c>Silumgar Assassin</i-c>, Etrata and {2}{B} open. Nobody attacked you this turn cycle. The player to your right, whose turn is ending, has a 3/3 that gives their creatures lifelink.",
      q: "When do you flip the Assassin to destroy the 3/3?",
      options: ["Now, at the end of their turn", "In your main phase", "Not at all: keep it face down forever"],
      answer: 0,
      explain: "Megamorph is a special action, so you can flip any time you have priority. Holding it until now kept a 2/2 blocker and the threat of removal up all around the table. At the end of the turn before yours the mana is spare, and your lands untap in a moment. Flipping in your main phase spends mana you could use on your own turn.",
      principle: "Hold face-down removal until the end of the turn before yours: you keep the blocker and the threat, and you untap next."
    },
    {
      context: "Round 5. One opponent has six open mana and a known combo deck. Another casts Rhystic Study on their turn. You hold one <i-c>Counterspell</i-c>.",
      q: "Counter the Rhystic Study?",
      options: ["Yes: it's a card-draw engine", "No: hold the counter for the combo player"],
      answer: 1,
      explain: "Rhystic Study costs you some mana or cards over the game; the combo player with six open can end it this turn cycle. One counter, one target: the one that wins.",
      principle: "With one counter, hold it for the spell that ends the game."
    },
    {
      context: "Round 6. You can win with the vampire loop next turn. One opponent holds up blue mana every turn and countered your last spell. The other two are tapped out.",
      q: "What's the best way to try for the win?",
      options: ["Cast a strong lesser threat first to draw out their counter, then go for the loop", "Go for the loop right away", "Wait until they tap out"],
      answer: 0,
      explain: "If the blue player has one counter, a threat they must answer (a stolen bomb, a wrath on their board) can pull it before the combo piece. Waiting gives the other two a turn to win. Without a counter of your own, baiting is the play.",
      principle: "Bait before you combo into open blue."
    },
    {
      context: "Round 3. <i-c>Opposition Agent</i-c> is in your hand with three mana open. It's an opponent's turn.",
      q: "When do you flash it in?",
      options: ["When an opponent casts a tutor or a fetch land", "At the end of the turn before yours, always", "On your own turn"],
      answer: 0,
      explain: "You control opponents while they search their libraries, and you exile the cards they find and may play them. Flashing it in response to a tutor takes the card they wanted. Without a search coming, end of turn is fine, but the tutor is where the value is.",
      principle: "Opposition Agent belongs in response to a search."
    }
  ]
};
