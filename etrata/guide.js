/* The long-form playing guide for the Etrata (Etrata, Deadly Fugitive) deck.
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Card mentions use <i-c>Exact Card Name</i-c>; mana symbols are written as {U}, {B}, {2}, {T}. */
window.ETRATA_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "What the deck does, the ways it wins, and whether it's the deck for you.",
    blocks: [
      { t: "p", html: "This is a blue-black Assassin deck led by <i-c>Etrata, Deadly Fugitive</i-c>. Your Assassins slip past blockers, and every time one deals combat damage to an opponent, Etrata cloaks the top card of that player's library." },
      { t: "p", html: "A cloaked card lands on your side face down, as a 2/2 with ward {2}. That's your army. Make those cloaks Assassins and they make more cloaks. Pay {2}{U}{B} and Etrata turns any of them face up, even if it's an instant, a sorcery or a seven-drop from someone else's deck." },
      { t: "h", text: "The loop in four beats" },
      { t: "steps", items: [
        { title: "An Assassin connects", html: "Cheap evasive Assassins do the early work: <i-c>Changeling Outcast</i-c> can't be blocked, <i-c>Hookblade Veteran</i-c> flies on your turn, <i-c>Brotherhood Spy</i-c> can't be blocked while you control a legendary Assassin, and <i-c>Basim Ibn Ishaq</i-c> slips through whenever you cast a historic spell." },
        { title: "Etrata cloaks", html: "One trigger for each Assassin that deals combat damage to an opponent. Each trigger puts the top card of that player's library onto the battlefield under your control, face down." },
        { title: "The cloaks join in", html: "A plain cloak has no creature type. <i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c>, <i-c>Arcane Adaptation</i-c> and <i-c>Leyline of Transformation</i-c> make them Assassins, so next turn they connect and cloak too." },
        { title: "Flip what's worth flipping", html: "Your own creature cards turn face up for their mana cost. Anything else, including their best spells, turns face up through Etrata for {2}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>." }
      ] },
      { t: "cards", names: ["Etrata, Deadly Fugitive", "Roshan, Hidden Magister", "Ramses, Assassin Lord"], caption: "The commander, the best enabler, and the card that turns one kill into a win." },
      { t: "h", text: "Ways to win" },
      { t: "list", items: [
        "<b>Pressure and cloaks.</b> Evasive Assassins, a growing face-down army, and the cards you steal from opponents' libraries. Most games are a mix of this and one of the lines below.",
        "<b>Slasher and Reflection.</b> <i-c>Unstoppable Slasher</i-c> connects and the player loses half their life. <i-c>Wound Reflection</i-c> at the end step makes them lose all of it again. That's lethal on that player from any life total, as long as they gain no life that turn.",
        "<b>Guildmage and Mindcrank.</b> Activate <i-c>Duskmantle Guildmage</i-c>'s first ability with <i-c>Mindcrank</i-c> out, then make an opponent lose life or put a card in their graveyard. The two feed each other until the player runs out of life or library.",
        "<b>Hit counters.</b> <i-c>Etrata, the Silencer</i-c> exiles a creature with a hit counter each time she connects. A player who owns three exiled cards with hit counters loses. <i-c>Ravenloft Adventurer</i-c> adds more.",
        "<b>Strixhaven Stadium.</b> Every creature of yours that deals combat damage to an opponent adds a point counter. At ten, that player loses."
      ] },
      { t: "callout", tone: "key", title: "Ramses is the multiplier", html: "<i-c>Ramses, Assassin Lord</i-c> says that whenever a player loses the game, if they were attacked this turn by an Assassin you controlled, you win the game. Every line above normally knocks out one player. With Ramses on the battlefield at that moment, knocking out one player wins you the whole game." },
      { t: "h", text: "Is it for you?" },
      { t: "list", items: [
        "You'll enjoy it if you like small evasive creatures, hidden information and flexible decisions every turn.",
        "You'll enjoy it if you like using other people's cards against them. Cloaks come from their libraries.",
        "You have counterspells, removal and phasing, so you get to interact on other people's turns.",
        "It's less fun if you want to play big creatures. Your bodies are 1/1s, 2/2s and face-down cards. The power comes from what they trigger.",
        "It asks for careful bookkeeping: which cloak is which, who owns it, and what's under it. The face-down chapter shows how."
      ] },
      { t: "callout", tone: "key", title: "Tell the table first", html: "Guildmage plus Mindcrank is a two-card combo once it has a starter event, and Ramses can turn one elimination into a win. Mention both in the pregame talk, since some groups have rules about combos." },
      { t: "callout", tone: "tip", title: "How to use this guide", html: "Read the face-down chapter and the commander chapter first. They explain the rules the whole deck runs on. Play a few games, then come back for the turn-by-turn chapters, the combos and the rules questions." }
    ]
  },
  {
    id: "face-down-101",
    title: "Face-down 101",
    kicker: "The core rules",
    minutes: 7,
    summary: "Cloak, manifest, manifest dread and morph, how each face-down card turns face up, and what is hidden from whom.",
    blocks: [
      { t: "p", html: "Almost everything in this deck touches face-down creatures. The rules are simple once you've seen them in one place, and a few of them decide games." },
      { t: "h", text: "What a face-down creature is" },
      { t: "p", html: "A face-down creature is a 2/2 creature with no name, no creature types, no mana cost and no color. Its mana value is 0. It has none of the printed text of the card underneath." },
      { t: "p", html: "A cloaked creature also has ward {2}. Manifested and morphed creatures don't." },
      { t: "p", html: "With Etrata on the battlefield, every face-down creature you control also has her granted ability: '{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.'" },
      { t: "h", text: "Four ways to get one" },
      { t: "table", head: ["Mechanic", "What happens", "Cards here"], rows: [
        ["Cloak", "Put a card onto the battlefield face down as a 2/2 with ward {2}", "Etrata's trigger, <i-c>Cryptic Coat</i-c>"],
        ["Manifest", "Put a card onto the battlefield face down as a 2/2", "<i-c>Scroll of Fate</i-c> (from your hand), <i-c>Reality Shift</i-c> (its victim manifests)"],
        ["Manifest dread", "Look at your top two cards. Manifest one, put the other into your graveyard", "<i-c>Cursed Windbreaker</i-c>, <i-c>They Came from the Pipes</i-c>, <i-c>Glitch Interpreter</i-c>"],
        ["Morph", "Cast the card face down for {3}", "<i-c>Kheru Spellsnatcher</i-c>, <i-c>Willbender</i-c>"]
      ] },
      { t: "p", html: "Etrata's cloaks come from the <b>damaged opponent's</b> library. Everything else here uses your own cards." },
      { t: "h", text: "Turning a card face up" },
      { t: "table", head: ["Route", "Cost", "Works on", "Uses the stack?"], rows: [
        ["Natural turn-up", "The card's mana cost", "Cloaked or manifested creature cards", "No: special action"],
        ["Morph", "The morph cost", "Cards with morph, however they got face down", "No: special action"],
        ["Etrata's granted ability", "{2}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>", "Any face-down creature you control, while Etrata is on the battlefield", "Yes: an activated ability"]
      ] },
      { t: "p", html: "A special action happens any time you have priority, and nobody can respond to it. Opponents get priority again afterwards, but the card is already face up." },
      { t: "p", html: "Etrata's ability goes on the stack, so opponents can respond, for example by killing the 2/2 before it flips. In exchange, it works on cards the natural route can't touch." },
      { t: "steps", items: [
        { title: "A creature card", html: "Turn it face up for its mana cost, or with Etrata's ability. It stays on the battlefield as that creature." },
        { title: "A noncreature permanent card", html: "An artifact, enchantment or land can't use the natural route. Etrata's ability turns it face up and it stays on the battlefield as that permanent. It's no longer a creature." },
        { title: "An instant or sorcery", html: "It can't be turned face up at all. Etrata's ability then exiles it, and you may cast it right away without paying its mana cost." }
      ] },
      { t: "callout", tone: "key", title: "Turning face up isn't entering", html: "The permanent was already on the battlefield. Enter-the-battlefield triggers don't happen, and 'as this enters' choices are never made. A flipped <i-c>Arcane Adaptation</i-c> has no chosen type and does nothing. A flipped <i-c>Spark Double</i-c> copies nothing and dies as a 0/0. A flipped <i-c>Glitch Interpreter</i-c> doesn't bounce itself. 'When this is turned face up' triggers, like <i-c>Kheru Spellsnatcher</i-c>'s and <i-c>Willbender</i-c>'s, do happen." },
      { t: "h", text: "What stays the same" },
      { t: "list", items: [
        "It's the same permanent. Counters, damage and tapped or untapped status stay.",
        "If it was attacking or blocking, it still is. A face-down attacker that goes unblocked can flip into a bigger creature before damage.",
        "If it's been under your control since your turn began, it can attack and use {T} abilities once it's face up, even if you flip it this turn.",
        "A face-down creature that flips into a noncreature permanent stops being a creature. Equipment on it falls off, and an Aura like <i-c>Aqueous Form</i-c> goes to the graveyard."
      ] },
      { t: "h", text: "What is hidden, and from whom" },
      { t: "list", items: [
        "You may look at face-down permanents you control at any time, including the cloaks you took from opponents' libraries.",
        "Opponents can't look at yours. The owner of a stolen card doesn't get to see it either.",
        "If a face-down permanent leaves the battlefield, it's revealed. At the end of the game, all face-down permanents are revealed.",
        "You must keep your face-down permanents easy to tell apart. Put them in order, or mark them with dice or tokens, so everyone can follow which one attacked or flipped."
      ] },
      { t: "h", text: "Who owns a cloak" },
      { t: "p", html: "You control the cloaks Etrata makes. The player whose library it came from still <b>owns</b> it." },
      { t: "list", items: [
        "When it dies, it goes to its owner's graveyard. When it's bounced, it goes to its owner's hand.",
        "An effect that returns a card 'under its owner's control' gives it back to them.",
        "If its owner leaves the game, their cards leave with them, face-down or not. Count what survives an elimination before planning your next combat.",
        "A stolen instant or sorcery you cast with Etrata goes to its owner's graveyard after it resolves."
      ] },
      { t: "h", text: "Ward {2}" },
      { t: "p", html: "Ward triggers when a cloak becomes the target of a spell or ability an <b>opponent</b> controls. The spell is countered unless they pay {2}." },
      { t: "p", html: "Ward only taxes targeting. It doesn't stop blocks, board wipes or 'each player sacrifices' effects, and your own spells never pay it. Once the card is face up, the ward is gone." },
      { t: "qa", items: [
        { q: "Can I look at a cloak I took from an opponent?", a: "Yes. You control it, so you may look at it any time. Its owner can't." },
        { q: "Can I flip a cloaked creature card in response to removal?", a: "Yes, it's a special action you can take whenever you have priority. The removal still resolves against the same creature, but a flipped <i-c>Willbender</i-c> or <i-c>Kheru Spellsnatcher</i-c> can deal with the spell first." },
        { q: "Does a cloaked Assassin card count as an Assassin?", a: "Not while it's face down. A face-down creature has no creature types, whatever is printed on the card underneath." },
        { q: "Can a cloaked card with morph use its morph cost?", a: "Yes. A cloaked or manifested card with morph can be turned face up for its morph cost, or for its mana cost if it's a creature card." }
      ] }
    ]
  },
  {
    id: "your-commander",
    title: "Your commander",
    kicker: "Meet Etrata",
    minutes: 6,
    summary: "Etrata's three abilities, when to cast her, and when to use her granted ability instead of a natural flip.",
    blocks: [
      { t: "cards", names: ["Etrata, Deadly Fugitive"], caption: "{1}{U}{B}, 1/4 deathtouch Vampire Assassin." },
      { t: "p", html: "Etrata has three abilities. Each one does a different job." },
      { t: "steps", items: [
        { title: "Deathtouch", html: "A 1/4 deathtouch creature is a great blocker. Few opponents attack into her, so she protects your life total while your small creatures attack." },
        { title: "The granted ability", html: "Face-down creatures you control have '{2}{U}{B}: Turn this creature face up. If you can't, exile it, then you may cast the exiled card without paying its mana cost.' The ability belongs to each face-down creature, not to Etrata, but it only exists while she's on the battlefield." },
        { title: "The cloak trigger", html: "Whenever an Assassin you control deals combat damage to an opponent, cloak the top card of that player's library. One trigger for each Assassin that deals combat damage to an opponent." }
      ] },
      { t: "h", text: "She doesn't need to attack" },
      { t: "p", html: "Etrata's trigger watches every Assassin you control. She can stay home and block while <i-c>Changeling Outcast</i-c> and friends do the attacking." },
      { t: "p", html: "She also works the turn she arrives. Cast her in your first main phase, then attack with an Assassin that has been under your control since your turn began. If it connects, you cloak." },
      { t: "callout", tone: "tip", title: "Main phase one, not two", html: "Casting Etrata after combat wastes a whole turn of triggers. With a ready Assassin on the battlefield, cast her before you attack." },
      { t: "h", text: "When to cast her" },
      { t: "steps", items: [
        { title: "Turn 3 with a ready Assassin", html: "The best start: a one- or two-drop Assassin on turn 1 or 2, then Etrata on turn 3 and an attack the same turn." },
        { title: "Turn 2 with fast mana", html: "<i-c>Sol Ring</i-c>, <i-c>Dark Ritual</i-c> or a turn-1 mana rock gets her down a turn early. That's worth it if an Assassin can connect next turn." },
        { title: "Hold her if she'd be alone and exposed", html: "With no Assassin to follow up and an opponent holding up removal, a turn of development first costs little. She's cheap to cast later." },
        { title: "Mind the colors", html: "Her cost is {1}{U}{B}: you need both colors. <i-c>Command Tower</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Dimir Signet</i-c>, <i-c>Talisman of Dominance</i-c> and the dual lands fix it. <i-c>Omen Hawker</i-c> can't help: its mana only pays for activated abilities." }
      ] },
      { t: "h", text: "Granted ability or natural flip?" },
      { t: "p", html: "Both routes turn a card face up. Pick by cost, by what the card is, and by whether you can afford a stack window." },
      { t: "table", head: ["The face-down card is", "Best route", "Why"], rows: [
        ["Your creature card costing 3 or less", "Natural flip", "Cheaper, and nobody can respond"],
        ["A creature card costing 5 or more", "Etrata's ability", "{2}{U}{B} is cheaper than its mana cost"],
        ["A stolen creature card in colors you can't make", "Etrata's ability", "You can't pay its mana cost"],
        ["An artifact, enchantment or land", "Etrata's ability", "The only route. It stays as that permanent"],
        ["An instant or sorcery", "Etrata's ability", "It's exiled and you may cast it for free right away"],
        ["A morph card", "Compare costs", "<i-c>Willbender</i-c>'s mana cost and morph cost are both {1}{U}. <i-c>Kheru Spellsnatcher</i-c> costs {3}{U} naturally, {4}{U}{U} by morph, {2}{U}{B} through Etrata"]
      ] },
      { t: "callout", tone: "key", title: "Training Grounds changes the math", html: "<i-c>Training Grounds</i-c> makes activated abilities of your creatures cost up to {2} less. Etrata's granted ability becomes {U}{B}. From then on it beats the natural flip for any card with mana value 3 or more, but it still uses the stack. Training Grounds doesn't reduce the natural flip or morph, because those are special actions, not abilities." },
      { t: "h", text: "The free-cast fallback" },
      { t: "p", html: "When the face-down card is an instant or sorcery, Etrata's ability exiles it and you may cast it without paying its mana cost. You cast it right then, while the ability resolves, so timing rules like 'sorcery speed' don't matter." },
      { t: "list", items: [
        "You still need legal targets, and you still pay mandatory additional costs.",
        "If the card has {X} in its mana cost, X is 0.",
        "If you choose not to cast it, or can't, it stays in exile.",
        "A spell you cast this way from someone else's library goes to their graveyard afterwards."
      ] },
      { t: "callout", tone: "tip", title: "Read before you flip", html: "Look at your cloaks at the start of each turn. A stolen removal spell or wipe is worth more on the right turn than the first turn you can afford it." },
      { t: "h", text: "Protecting her" },
      { t: "list", items: [
        "Keep her home. She's a better blocker than attacker, and her triggers don't need her in combat.",
        "Hold up <i-c>Counterspell</i-c>, <i-c>Arcane Denial</i-c> or <i-c>Dispel</i-c> once she's worth protecting.",
        "<i-c>March of Swirling Mist</i-c> phases her out in response to removal or a wipe.",
        "When she goes to your graveyard or into exile, you may move her to the command zone. Almost always do it."
      ] },
      { t: "h", text: "Commander tax" },
      { t: "p", html: "Each time you cast her from the command zone she costs {2} more: 3, then 5, then 7. She's cheap, so recasting her once or twice is usually right. Without her, your cloaks can't use her ability and your Assassins make no cloaks." },
      { t: "qa", items: [
        { q: "Does Etrata trigger for an Assassin that hits a player she didn't attack?", a: "Yes. She doesn't attack at all. Each Assassin you control that deals combat damage to an opponent triggers her once." },
        { q: "Two Assassins hit the same opponent. How many cloaks?", a: "Two. Each Assassin is its own trigger, and each one cloaks the top card of that player's library." },
        { q: "Can I use the granted ability without Etrata on the battlefield?", a: "No. It exists only while she's there. Natural flips and morph still work without her." },
        { q: "Can I use the granted ability on an opponent's face-down creature?", a: "No. It's granted to face-down creatures you control." }
      ] }
    ]
  },
  {
    id: "making-assassins",
    title: "Making Assassins",
    kicker: "The engine",
    minutes: 6,
    summary: "Which creatures count, why cloaks need an enabler, how the army grows, and how Spark Double doubles it.",
    blocks: [
      { t: "p", html: "Etrata only counts Assassins. The more of your creatures that are Assassins when combat damage is dealt, the more cloaks you make." },
      { t: "h", text: "Native Assassins" },
      { t: "cards", names: ["Hookblade Veteran", "Brotherhood Spy", "Basim Ibn Ishaq", "Unstoppable Slasher"], caption: "Four of the printed Assassins." },
      { t: "list", items: [
        "<b>One and two mana:</b> <i-c>Hookblade Veteran</i-c> (flying on your turn), <i-c>Brotherhood Spy</i-c> (unblockable with a legendary Assassin, and Etrata is one), <i-c>Aven Heartstabber</i-c> (flying), <i-c>Desmond Miles</i-c> (menace, grows with other Assassins), <i-c>Basim Ibn Ishaq</i-c>.",
        "<b>Three and four mana:</b> <i-c>Unstoppable Slasher</i-c>, <i-c>Ramses, Assassin Lord</i-c>, <i-c>Roshan, Hidden Magister</i-c>, <i-c>Etrata, the Silencer</i-c>, <i-c>Ravenloft Adventurer</i-c>.",
        "<b>Etrata herself</b> is an Assassin, so she triggers her own ability if she connects."
      ] },
      { t: "h", text: "Changelings" },
      { t: "p", html: "Changeling means every creature type, in every zone. <i-c>Changeling Outcast</i-c>, <i-c>Mothdust Changeling</i-c> and <i-c>Universal Automaton</i-c> are Assassins for one mana, and so are the Shapeshifter tokens from <i-c>Maskwood Nexus</i-c>." },
      { t: "list", items: [
        "<i-c>Changeling Outcast</i-c> can't be blocked. It's the most reliable early Etrata trigger in the deck.",
        "<i-c>Mothdust Changeling</i-c> gains flying when you tap an untapped creature you control. A fresh cloak that can't attack yet is perfect to tap.",
        "<i-c>Universal Automaton</i-c> is colorless, so it also turns on <i-c>Glitch Interpreter</i-c>'s draw."
      ] },
      { t: "h", text: "Why cloaks need an enabler" },
      { t: "p", html: "A cloak has no creature types. Even if the card underneath is a printed Assassin, the face-down 2/2 isn't one. Without help, cloaks are just bodies: good blockers, good <i-c>Springleaf Drum</i-c> fodder, but no triggers." },
      { t: "p", html: "Four cards fix that. Once one is out, every cloak you make is an Assassin, and every one that connects makes another." },
      { t: "table", head: ["Enabler", "What it does", "Notes"], rows: [
        ["<i-c>Roshan, Hidden Magister</i-c>", "Your other creatures are Assassins. Face-down creatures you control have menace", "Draws a card, for 1 life, whenever a permanent you control is turned face up. Can be flipped mid-combat"],
        ["<i-c>Maskwood Nexus</i-c>", "Your creatures are every creature type", "{3}, {T}: make a 2/2 changeling. An artifact, so creature removal misses it"],
        ["<i-c>Arcane Adaptation</i-c>", "Name Assassin as it enters", "Must be cast. Flipped from face down, it has no type chosen"],
        ["<i-c>Leyline of Transformation</i-c>", "Name Assassin as it enters", "Free from your opening hand. Same flip problem as Adaptation"]
      ] },
      { t: "callout", tone: "tip", title: "Flip Roshan after blockers", html: "If Roshan is one of your cloaks, attack first. After blockers are declared, turn him face up for {3}{B}. That's a special action, so nobody can respond. Every face-down attacker is now an Assassin when combat damage is dealt, and Etrata triggers for each one that connects. Blocks are already locked in, so the menace comes too late to matter this combat." },
      { t: "p", html: "The enablers also reach cards in your hand and graveyard. <i-c>Desmond Miles</i-c> gets +1/+0 for each Assassin card in your graveyard, so with Roshan, Nexus or a named type out, every creature card there counts." },
      { t: "h", text: "How the army grows" },
      { t: "p", html: "New cloaks enter this turn, so they can't attack until your next turn. The army grows one generation per turn." },
      { t: "math", items: [
        { label: "Turn A: Changeling Outcast and two typed cloaks connect", value: "3 new cloaks" },
        { label: "Turn B: Outcast and five cloaks can attack", value: "6 attackers" },
        { label: "If all six connect", value: "6 more cloaks" }
      ], total: "From three connections to <b>eleven</b> face-down creatures in two turns, if nothing gets blocked or removed. Real tables block, so treat this as the ceiling." },
      { t: "callout", tone: "warn", title: "Blocked cloaks trade", html: "A cloak is a 2/2. Roshan's menace helps a lot. Without it, send cloaks at players with few untapped blockers, and keep a couple home to block." },
      { t: "h", text: "Doubling Etrata with Spark Double" },
      { t: "cards", names: ["Spark Double"], caption: "{3}{U}. Enters as a copy of a creature you control, with an extra +1/+1 counter, and isn't legendary." },
      { t: "p", html: "Cast <i-c>Spark Double</i-c> as a copy of Etrata. The copy isn't legendary, so you keep both. Now each Assassin that connects triggers both of them: two cloaks per connection." },
      { t: "list", items: [
        "The copy is a 2/5 deathtouch Vampire Assassin, so it's also an Assassin for the other Etrata's trigger.",
        "Spark Double chooses what to copy as it enters. It doesn't target, so hexproof and ward don't stop it.",
        "Two Etratas grant the same ability twice. That changes nothing: each flip still costs {2}{U}{B}.",
        "A copy of <i-c>Ramses, Assassin Lord</i-c> is the other good choice: your other Assassins get +2/+2, and each Ramses gets +1/+1 from the other."
      ] },
      { t: "callout", tone: "warn", title: "Cast it, never flip it", html: "Spark Double's copy choice happens as it enters. Turned face up from a cloak, it never entered, so it copies nothing and dies as a 0/0 Illusion." },
      { t: "p", html: "Use the calculator to count triggers and cloaks for a combat: how many Assassins connect, how many copies of Etrata you have, and whether your cloaks are typed." },
      { t: "widget", id: "cloakCalc", name: "cloakCalc" },
      { t: "qa", items: [
        { q: "Two ready cloaks hit opponent A. Etrata is out but you have no enabler. How many triggers?", a: "None. Face-down creatures have no creature types. With <i-c>Maskwood Nexus</i-c> out, the same two connections make two triggers, even against one opponent." },
        { q: "Three Assassins hit A. You control Etrata and a Spark Double copy of her. How many cloaks?", a: "Six. Each Etrata triggers once per connecting Assassin: three times two. Each trigger cloaks the top card of A's library while A has cards left." },
        { q: "Does a cloak that just entered count for Etrata this turn?", a: "Only if it deals combat damage, and it can't attack the turn it arrives. So it counts next turn." }
      ] }
    ]
  },
  {
    id: "mana-and-sequencing",
    title: "Mana and sequencing",
    kicker: "Spend it right",
    minutes: 6,
    summary: "Colors, conditional lands, Omen Hawker's restriction, Training Grounds, Springleaf Drum and the filters.",
    blocks: [
      { t: "p", html: "Your mana is more than a total. Many of your costs need both {U} and {B}, some sources only pay for abilities, and some lands only make color under a condition. Count colors before you count mana." },
      { t: "h", text: "What needs which color" },
      { t: "list", items: [
        "<b>Both:</b> Etrata {1}{U}{B}, her granted ability {2}{U}{B}, <i-c>Duskmantle Guildmage</i-c> and both its abilities, <i-c>Ramses, Assassin Lord</i-c>, <i-c>Etrata, the Silencer</i-c>, <i-c>Basim Ibn Ishaq</i-c>, <i-c>Aven Heartstabber</i-c>.",
        "<b>Double blue:</b> <i-c>Counterspell</i-c>, <i-c>Leyline of Transformation</i-c>, <i-c>Reconnaissance Mission</i-c>, <i-c>Grazilaxx, Illithid Scholar</i-c>, Wash Away's cleave.",
        "<b>Double black:</b> <i-c>Gix, Yawgmoth Praetor</i-c>."
      ] },
      { t: "p", html: "The deck has 35 lands. Eleven of them can make either color, some under a condition. Add 11 Islands and 10 Swamps and you have 22 blue sources and 22 black sources among your lands, plus <i-c>Boggart Trawler // Boggart Bog</i-c> as an extra black land. <i-c>Access Tunnel</i-c> and <i-c>Rogue's Passage</i-c> make only colorless mana." },
      { t: "h", text: "The conditional lands" },
      { t: "table", head: ["Land", "Untapped or colored when"], rows: [
        ["<i-c>Drowned Catacomb</i-c>", "You control an Island or a Swamp. <i-c>Sunken Hollow</i-c> counts as both"],
        ["<i-c>Sunken Hollow</i-c>", "You control two or more basic lands"],
        ["<i-c>Choked Estuary</i-c>", "You reveal an Island or Swamp card from your hand"],
        ["<i-c>Darkslick Shores</i-c>", "You control two or fewer other lands: play it early"],
        ["<i-c>Tainted Isle</i-c>", "Makes {U} or {B} only while you control a Swamp. Otherwise {C}"],
        ["<i-c>River of Tears</i-c>", "Makes {B} only on a turn you played a land. Otherwise {U}"],
        ["<i-c>Darkwater Catacombs</i-c>", "Always untapped, but it needs {1} from another source to make {U}{B}"],
        ["<i-c>Exotic Orchard</i-c>", "Makes a color an opponent's land could make. Check the table"],
        ["<i-c>Path of Ancestry</i-c>, <i-c>Bojuka Bog</i-c>", "Always tapped"],
        ["<i-c>Boggart Trawler // Boggart Bog</i-c>", "Pay 3 life, or it enters tapped"]
      ] },
      { t: "p", html: "<i-c>Path of Ancestry</i-c> scries 1 when its mana casts a creature spell that shares a type with Etrata: Vampire or Assassin. Changelings count, and so does every creature spell once an enabler is out." },
      { t: "h", text: "Omen Hawker" },
      { t: "cards", names: ["Omen Hawker"], caption: "{U}, 1/1. {T}: Add {C}{U}. Spend this mana only to activate abilities." },
      { t: "p", html: "Two mana for one card, but only for activated abilities. In this deck that's a lot." },
      { t: "h", text: "What Hawker's mana can pay" },
      { t: "list", items: [
        "Etrata's granted ability, and <i-c>Duskmantle Guildmage</i-c>'s two abilities.",
        "<i-c>Maskwood Nexus</i-c>'s {3}, equip costs, <i-c>Cryptic Coat</i-c>'s {1}{U} and <i-c>Mind Stone</i-c>'s {1}.",
        "<i-c>Rogue's Passage</i-c> and <i-c>Access Tunnel</i-c>.",
        "The {1} for <i-c>Dimir Signet</i-c> and <i-c>Darkwater Catacombs</i-c>."
      ] },
      { t: "h", text: "What it can't pay" },
      { t: "list", items: [
        "Any spell, Etrata included.",
        "A natural flip or a morph cost. Those are special actions, not abilities.",
        "<i-c>Key to the City</i-c>'s {2} when it untaps. That's paid while a triggered ability resolves, not to activate one."
      ] },
      { t: "callout", tone: "key", title: "Unlock Hawker's mana with a filter", html: "<i-c>Dimir Signet</i-c> and <i-c>Darkwater Catacombs</i-c> have mana abilities that cost {1}. Mana abilities are activated abilities, so Hawker's {C} can pay that {1}. You get unrestricted {U}{B}. Hawker's {U} stays restricted." },
      { t: "p", html: "Hawker is a creature, so it can't tap for mana the turn it arrives. Cast it on turn 1 when you can." },
      { t: "h", text: "Training Grounds" },
      { t: "p", html: "<i-c>Training Grounds</i-c> makes activated abilities of creatures you control cost up to {2} less, never below one mana. Colored symbols are never reduced." },
      { t: "table", head: ["Cost", "With Training Grounds"], rows: [
        ["Etrata's granted {2}{U}{B}", "{U}{B}"],
        ["Guildmage's {1}{U}{B}", "{U}{B}"],
        ["Guildmage's {2}{U}{B}", "{U}{B}"],
        ["Natural flip, morph", "No change: special actions"],
        ["<i-c>Maskwood Nexus</i-c>, equip, <i-c>Cryptic Coat</i-c>, <i-c>Rogue's Passage</i-c>", "No change: not abilities of creatures"]
      ] },
      { t: "p", html: "The granted ability belongs to the face-down creature, so Training Grounds reduces it. With Grounds and Hawker out, Hawker pays the {U} and any black source pays the {B}." },
      { t: "h", text: "Springleaf Drum" },
      { t: "p", html: "<i-c>Springleaf Drum</i-c> taps an untapped creature you control for one mana of any color. Tapping a creature this way isn't the creature's own {T} ability, so a creature that entered this turn can pay." },
      { t: "list", items: [
        "Tap a fresh cloak or a creature you just cast. Don't tap an Assassin you want to attack with.",
        "After combat, a tapped attacker can't pay. Plan Drum mana before you declare attackers, or use a creature that stayed home."
      ] },
      { t: "h", text: "The rest of the mana" },
      { t: "list", items: [
        "<b><i-c>Talisman of Dominance</i-c> and <i-c>Underground River</i-c>:</b> {C} for free, or {U} or {B} for 1 damage. Take {C} for generic costs and save the colored taps for colored symbols.",
        "<b><i-c>Sol Ring</i-c>, <i-c>Mind Stone</i-c>:</b> colorless. Great for Etrata's {2}, the {1} of a filter, and generic costs.",
        "<b><i-c>Arcane Signet</i-c>, <i-c>Fellwar Stone</i-c>:</b> one colored mana. Fellwar depends on what the opponents' lands could make.",
        "<b><i-c>Dark Ritual</i-c>:</b> {B}{B}{B} once. Spend it only to unlock an important play: turn-2 Etrata, an early <i-c>Unstoppable Slasher</i-c>, or the {B} for a key flip.",
        "<b><i-c>Frantic Search</i-c>:</b> untaps up to three lands, so it often costs nothing. Cast it with lands you've already used this turn.",
        "<b><i-c>Strixhaven Stadium</i-c>:</b> {C} and a point counter each time you tap it."
      ] },
      { t: "callout", tone: "tip", title: "Pay colored costs first, in your head", html: "Before you tap anything, name which source pays each colored symbol of this spell and the next one. Then use colorless and restricted mana for the generic part." },
      { t: "qa", items: [
        { q: "Training Grounds is out. Can Omen Hawker alone pay Etrata's granted ability?", a: "No. The reduced cost is {U}{B}. Hawker makes {C}{U}, so it pays the {U} but can't pay the {B}. Add a Swamp or any other black source." },
        { q: "Can Hawker's mana pay for turning a cloaked creature card face up for its mana cost?", a: "No. That's a special action, not an activated ability. Use Etrata's granted ability instead, which Hawker can help pay." },
        { q: "Does Training Grounds reduce Maskwood Nexus?", a: "No. It only reduces activated abilities of creatures, and <i-c>Maskwood Nexus</i-c> is a noncreature artifact." },
        { q: "Can I tap a creature I cast this turn for Springleaf Drum?", a: "Yes. The {T} in the cost is the Drum's own, and the creature is tapped as part of the cost, which summoning sickness doesn't prevent." }
      ] }
    ]
  },
  {
    id: "mulligans",
    title: "Mulligans and opening hands",
    kicker: "Keep or ship",
    minutes: 6,
    summary: "How to judge an opening seven, with example hands, their verdicts and the odds behind them.",
    blocks: [
      { t: "p", html: "A good opening pays for its first three turns: lands in both colors, an early Assassin, then Etrata or a way to draw cards. A powerful six-mana card doesn't fix a hand that does nothing early." },
      { t: "h", text: "The mulligan rules you're using" },
      { t: "steps", items: [
        { title: "Draw seven", html: "Etrata starts in the command zone, so you draw from the other 99." },
        { title: "Your first mulligan is free", html: "In a multiplayer game the first mulligan doesn't cost a card. Shuffle, draw a new seven, keep all seven." },
        { title: "After that, bottom one per mulligan", html: "This is the London mulligan: you always draw seven, then put cards on the bottom. Second mulligan, bottom 1. Third, bottom 2." },
        { title: "Everyone draws on turn 1", html: "In multiplayer, the player who goes first still draws on their first turn. By turn 3 you've seen ten cards." }
      ] },
      { t: "callout", tone: "tip", title: "What to bottom", html: "Bottom the most expensive cards first: <i-c>Wound Reflection</i-c>, <i-c>They Came from the Pipes</i-c>, then extra four-drops. Then narrow counterspells like <i-c>Dispel</i-c>. Keep lands up to four, both colors, your cheapest Assassins and any type enabler." },
      { t: "h", text: "The numbers" },
      { t: "p", html: "With 35 lands in 99 cards, a random seven has about 2.5 lands on average. Here's how often each land count shows up:" },
      { t: "table", head: ["Lands in 7", "How often", "Verdict"], rows: [
        ["0 or 1", "21.8%", "Mulligan"],
        ["2", "30.5%", "Keep only with cheap ramp or cheap plays in both colors"],
        ["3 or 4", "42.6%", "Usually keep"],
        ["5 or more", "5.1%", "Keep 5 with good spells, ship 6 or 7"]
      ] },
      { t: "p", html: "<i-c>Boggart Trawler // Boggart Bog</i-c> can be played as a land too, so the real chance of a 0 or 1 land hand is a little lower." },
      { t: "p", html: "A two-land hand with no ramp needs help. You have a third land on turn 3 about 74% of the time, and four lands on turn 4 only about 45% of the time." },
      { t: "list", items: [
        "You have eight Assassins costing one or two mana. At least one is in your opening seven 45.6% of the time, and in your first nine cards 54.7% of the time.",
        "You have four type enablers. At least one is in your opening seven 25.8% of the time, and in your first twelve cards, by turn 5, 40.9% of the time.",
        "<i-c>Leyline of Transformation</i-c> is in your opening seven 7.1% of the time. When it is, start with it on the battlefield and name Assassin."
      ] },
      { t: "h", text: "What a keep looks like" },
      { t: "list", items: [
        "3 or 4 lands that make both colors, with a one- or two-drop.",
        "2 lands in both colors plus a mana rock and cheap plays.",
        "Anything that casts Etrata by turn 3 with an Assassin ready to attack that turn."
      ] },
      { t: "h", text: "What a mulligan looks like" },
      { t: "list", items: [
        "0 or 1 land, even with <i-c>Sol Ring</i-c>.",
        "6 or 7 lands.",
        "Lands of only one color and nothing that fixes it.",
        "Nothing to do before turn 4."
      ] },
      { t: "callout", tone: "warn", title: "Don't keep a combo with no mana", html: "Seeing <i-c>Duskmantle Guildmage</i-c> and <i-c>Mindcrank</i-c> together is exciting. The hand still needs lands. Without extra card draw you'll find both of them together by turn 5 only about 1.4% of the time, so a hand that has them but can't function should still go back." },
      { t: "h", text: "Example hand 1" },
      { t: "cards", names: ["Island", "Swamp", "Drowned Catacomb", "Changeling Outcast", "Dimir Signet", "Arcane Adaptation", "Counterspell"], caption: "Three lands in both colors, a turn-1 Assassin, a Signet, an enabler and a counterspell." },
      { t: "callout", tone: "key", title: "Keep. This is the ideal start.", html: "Turn 1 Outcast. Turn 2 Signet, and Outcast attacks. Turn 3 Etrata with a mana to spare, and Outcast's hit makes your first cloak. Turn 4, with a fourth land, Adaptation naming Assassin and {U}{U} open for Counterspell." },
      { t: "h", text: "Example hand 2" },
      { t: "cards", names: ["Leyline of Transformation", "Island", "Swamp", "Underground River", "Hookblade Veteran", "Mind Stone", "Cryptic Coat"], caption: "An opening Leyline, three lands, a one-drop Assassin, a rock and a cloak maker." },
      { t: "callout", tone: "key", title: "Keep, and start with Leyline.", html: "Put <i-c>Leyline of Transformation</i-c> onto the battlefield before the game and name Assassin. Every cloak you make is now an Assassin. <i-c>Cryptic Coat</i-c> on turn 3 makes an unblockable one that connects every turn from turn 4." },
      { t: "h", text: "Example hand 3" },
      { t: "cards", names: ["Swamp", "Swamp", "Ramses, Assassin Lord", "Wound Reflection", "Maskwood Nexus", "Toxic Deluge", "Strixhaven Stadium"], caption: "Two Swamps and five cards that cost three or more." },
      { t: "callout", tone: "warn", title: "Mulligan.", html: "No blue, no early play, and the cheapest spell costs 3. Even hitting land drops, you can't cast Etrata until you find a blue source." },
      { t: "h", text: "Example hand 4" },
      { t: "cards", names: ["Command Tower", "Sol Ring", "Dark Ritual", "Duskmantle Guildmage", "Mindcrank", "Changeling Outcast", "Consider"], caption: "Both combo pieces and fast mana. One land." },
      { t: "callout", tone: "warn", title: "Mulligan.", html: "It could be spectacular if you draw lands. Miss one land drop and it's a hand of one-shot mana and a combo you can't activate. Take the free mulligan." },
      { t: "h", text: "Example hand 5" },
      { t: "cards", names: ["Island", "Swamp", "Talisman of Dominance", "Omen Hawker", "Changeling Outcast", "Preordain", "Consider"], caption: "Two lands, a Talisman, two one-drops and two cantrips." },
      { t: "callout", tone: "key", title: "Keep.", html: "Two lands plus Talisman casts Etrata on turn 3, and the two cantrips dig for your third land. Outcast attacks from turn 2. Hawker is a fine turn-1 play, since its mana will pay for Etrata's ability later." },
      { t: "h", text: "Practice" },
      { t: "widget", id: "handTrainer", name: "handTrainer" },
      { t: "p", html: "Deal hands until your verdicts match the trainer's. Then use the odds tool to check any draw you're unsure about." },
      { t: "widget", id: "drawOdds", name: "drawOdds" }
    ]
  },
  {
    id: "turns-1-3",
    title: "Turns 1 to 3: the setup",
    kicker: "Early game",
    minutes: 5,
    summary: "What to play on each of your first three turns, in what order, and what to hold back.",
    blocks: [
      { t: "p", html: "Your first three turns decide when your first cloak arrives. The goal: Etrata on turn 3, cast before combat, with an Assassin that can attack that same turn." },
      { t: "h", text: "Before the game" },
      { t: "p", html: "If <i-c>Leyline of Transformation</i-c> is in your opening hand, put it onto the battlefield and name Assassin. It's free, and it's the best start the deck has." },
      { t: "h", text: "Turn 1" },
      { t: "steps", items: [
        { title: "Play the land that fits", html: "If you have a one-drop, play an untapped land of its color. <i-c>Darkslick Shores</i-c> is best early. With no one-drop, this is the turn for <i-c>Path of Ancestry</i-c>." },
        { title: "Cast your best one-drop", html: "In order: <i-c>Changeling Outcast</i-c>, <i-c>Sol Ring</i-c>, <i-c>Hookblade Veteran</i-c>, <i-c>Omen Hawker</i-c>, <i-c>Mothdust Changeling</i-c>, <i-c>Universal Automaton</i-c>." },
        { title: "Or Training Grounds", html: "With no creature to cast, <i-c>Training Grounds</i-c> is a fine turn-1 play: it pays off every flip for the rest of the game." }
      ] },
      { t: "callout", tone: "tip", title: "Why Outcast first", html: "Changeling Outcast can't be blocked, so it connects every turn. Cast on turn 1, it's ready to attack the turn Etrata arrives. Sol Ring speeds you up, but it doesn't make a cloak." },
      { t: "h", text: "Turn 2" },
      { t: "p", html: "Ask one question: what will I cast on turn 3?" },
      { t: "list", items: [
        "If you have Etrata's colors and a third land, cast a two-drop Assassin now: <i-c>Brotherhood Spy</i-c>, <i-c>Aven Heartstabber</i-c>, <i-c>Desmond Miles</i-c> or <i-c>Basim Ibn Ishaq</i-c>. Etrata comes next turn with two attackers ready.",
        "If you're short on lands or have four-drops like <i-c>Roshan, Hidden Magister</i-c>, cast a rock: <i-c>Dimir Signet</i-c>, <i-c>Arcane Signet</i-c>, <i-c>Talisman of Dominance</i-c>, <i-c>Mind Stone</i-c> or <i-c>Fellwar Stone</i-c>. Turn 3 becomes Etrata plus a one-drop, or a four-drop.",
        "Attack with your turn-1 Assassin. No cloak yet, but damage is damage.",
        "With spare mana, <i-c>Preordain</i-c> or <i-c>Consider</i-c> fixes your next land drop."
      ] },
      { t: "h", text: "Turn 3" },
      { t: "steps", items: [
        { title: "Cast Etrata in your first main phase", html: "Before combat, so your ready Assassins trigger her this turn." },
        { title: "Add a one-drop if you can", html: "A leftover mana is a <i-c>Hookblade Veteran</i-c> or <i-c>Changeling Outcast</i-c> for next turn's attack." },
        { title: "Attack with Assassins that can connect", html: "Unblockable and flying ones first. Etrata stays home." },
        { title: "Look at your cloak", html: "You can look at it right away. Knowing what's under it shapes your next two turns." }
      ] },
      { t: "p", html: "No Assassin ready? Etrata on turn 3 is still fine, but consider a type enabler or <i-c>Cryptic Coat</i-c> first if Etrata would just sit there." },
      { t: "h", text: "What to hold" },
      { t: "list", items: [
        "<b>Counterspells and removal.</b> Save them for a threat that matters or for protecting Etrata.",
        "<b>Combo pieces.</b> <i-c>Mindcrank</i-c> and <i-c>Wound Reflection</i-c> tell the table what you're doing. Cast them when you can use them soon.",
        "<b><i-c>Bojuka Bog</i-c>.</b> Hold it for a graveyard deck if your other lands let you.",
        "<b><i-c>Dark Ritual</i-c>.</b> Use it for a turn-2 Etrata or a key flip, not for a one-drop."
      ] },
      { t: "h", text: "Land sequencing" },
      { t: "table", head: ["Land", "Best time to play it"], rows: [
        ["<i-c>Darkslick Shores</i-c>", "Turns 1 to 3: untapped while you have two or fewer other lands"],
        ["<i-c>Sunken Hollow</i-c>", "After two basics"],
        ["<i-c>Drowned Catacomb</i-c>", "After any Island, Swamp or Sunken Hollow"],
        ["<i-c>Choked Estuary</i-c>", "Any time you can reveal a basic, or Sunken Hollow, from your hand"],
        ["<i-c>Tainted Isle</i-c>", "After a Swamp or Sunken Hollow"],
        ["<i-c>River of Tears</i-c>", "Any time. It makes {B} on turns you play a land, so it's best while you still have land drops"],
        ["<i-c>Path of Ancestry</i-c>, <i-c>Bojuka Bog</i-c>", "They enter tapped: a turn you don't need all your mana"],
        ["<i-c>Access Tunnel</i-c>, <i-c>Rogue's Passage</i-c>", "Once both colors are covered"]
      ] },
      { t: "h", text: "Example: turns 1 to 3" },
      { t: "p", html: "You kept Example hand 1: <i-c>Island</i-c>, <i-c>Swamp</i-c>, <i-c>Drowned Catacomb</i-c>, <i-c>Changeling Outcast</i-c>, <i-c>Dimir Signet</i-c>, <i-c>Arcane Adaptation</i-c> and <i-c>Counterspell</i-c>. You draw <i-c>Hookblade Veteran</i-c>, another Swamp and <i-c>Unstoppable Slasher</i-c>." },
      { t: "turns", items: [
        { turn: "T1", play: "Swamp, <i-c>Changeling Outcast</i-c>.", note: "Your first Assassin." },
        { turn: "T2", play: "Island, <i-c>Dimir Signet</i-c>. Outcast attacks for 1.", note: "4 mana next turn." },
        { turn: "T3", play: "<i-c>Drowned Catacomb</i-c>, untapped because you control an Island. One land pays the Signet's {1} for {U}{B}. Cast <i-c>Etrata, Deadly Fugitive</i-c> and <i-c>Hookblade Veteran</i-c>. Outcast attacks and connects.", note: "First cloak." }
      ] },
      { t: "p", html: "Notice what stayed in hand: Adaptation, Counterspell, Slasher and the spare Swamp. The next chapter picks up from here." }
    ]
  },
  {
    id: "turns-4-6",
    title: "Turns 4 to 6: building the engine",
    kicker: "The build",
    minutes: 6,
    summary: "Which enabler and engines to cast first, when to flip cloaks, how much to commit, and how to keep Etrata alive.",
    blocks: [
      { t: "p", html: "By turn 4 Etrata should be out and your first cloaks arriving. Now you turn a few triggers into an engine, without losing everything to one wipe." },
      { t: "h", text: "Priorities" },
      { t: "steps", items: [
        { title: "Etrata, if she isn't out yet", html: "Every Assassin hit without her is a cloak you didn't make." },
        { title: "A type enabler", html: "<i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c> or <i-c>Arcane Adaptation</i-c>. From here your cloaks make cloaks." },
        { title: "A card-draw engine", html: "<i-c>Reconnaissance Mission</i-c>, <i-c>Gix, Yawgmoth Praetor</i-c> and <i-c>Mask of Memory</i-c> turn each hit into cards. <i-c>They Came from the Pipes</i-c> draws for every face-down creature that enters, and Etrata's cloaks count." },
        { title: "A finisher, when it's close", html: "<i-c>Ramses, Assassin Lord</i-c>, <i-c>Unstoppable Slasher</i-c>, <i-c>Etrata, the Silencer</i-c> or a combo piece. The closing chapter covers which." }
      ] },
      { t: "h", text: "Your draw engines, counted" },
      { t: "list", items: [
        "<i-c>Reconnaissance Mission</i-c> and <i-c>Gix, Yawgmoth Praetor</i-c> trigger once per creature that connects. Gix charges 1 life for each card you choose to draw.",
        "Gix triggers for any creature dealing combat damage to one of your opponents, including other opponents' creatures. Their controllers may pay 1 life and draw too.",
        "<i-c>Grazilaxx, Illithid Scholar</i-c> draws once per player damaged, not once per creature. Three creatures at one opponent is one card; one at each of three opponents is three.",
        "<i-c>Glitch Interpreter</i-c> draws when one or more colorless creatures you control connect. Face-down creatures are colorless.",
        "<i-c>Mask of Memory</i-c> belongs on an evasive creature. <i-c>Silent Hallcreeper</i-c> can't be blocked and picks a new reward each hit. <i-c>Key to the City</i-c> makes one creature unblockable and draws when it untaps, if you pay {2}."
      ] },
      { t: "h", text: "When to flip a cloak" },
      { t: "p", html: "A face-down 2/2 with ward is a decent creature already. Flip when the card underneath is worth more than the mana, or when the timing matters." },
      { t: "list", items: [
        "<b>Their instants and sorceries:</b> flip on the turn the spell does the most. A stolen removal spell waits for a real target.",
        "<b>Their big permanents:</b> {2}{U}{B} for a card that costs 6 or more is a good deal. Flip at the end of the turn before yours, so you untap with it.",
        "<b>Your own creature cards:</b> flip cheap ones by natural turn-up whenever it helps. Nobody can respond.",
        "<b>After blocks:</b> an unblocked cloak can flip into something bigger before damage. A blocked one can flip into something that wins the fight.",
        "<b>Keep some hidden.</b> Unknown 2/2s make opponents play around everything. Flip what you need, not everything you can."
      ] },
      { t: "h", text: "How much to commit" },
      { t: "p", html: "Your creatures are small. One wipe kills most of the board. Ask three questions before you add more." },
      { t: "steps", items: [
        { title: "Can I already win in two turns?", html: "If yes, more bodies add little. Hold the extras." },
        { title: "What's left after a wipe?", html: "Etrata comes back from the command zone. Keep a way to rebuild: an Assassin or two in hand, <i-c>Cryptic Coat</i-c>, <i-c>Maskwood Nexus</i-c> on the battlefield." },
        { title: "Can I protect it?", html: "<i-c>March of Swirling Mist</i-c> phases out your key creatures. A counterspell stops a wipe outright." }
      ] },
      { t: "callout", tone: "key", title: "Keep {U}{U} or {1}{U} open", html: "Once Etrata and an enabler are out, your best turn is often a quiet one: attack, then pass with a counterspell up. <i-c>Counterspell</i-c>, <i-c>Arcane Denial</i-c> and <i-c>Wash Away</i-c> protect the engine better than another 2/2 does." },
      { t: "h", text: "Example: turns 4 to 6" },
      { t: "p", html: "Continuing from the last chapter. You control Etrata, <i-c>Changeling Outcast</i-c>, <i-c>Hookblade Veteran</i-c>, one cloak and <i-c>Dimir Signet</i-c>. In hand: <i-c>Arcane Adaptation</i-c>, <i-c>Counterspell</i-c>, <i-c>Unstoppable Slasher</i-c> and a Swamp. You draw an Island, then <i-c>Wound Reflection</i-c>." },
      { t: "turns", items: [
        { turn: "T4", play: "Swamp. <i-c>Arcane Adaptation</i-c> naming Assassin. Outcast and the flying Hookblade attack. The cloak, now an Assassin, attacks the opponent with no untapped creatures. All three connect.", note: "Three cloaks. {U}{U} open." },
        { turn: "Opp", play: "An opponent casts a removal spell on Etrata. <i-c>Counterspell</i-c>.", note: "The engine survives." },
        { turn: "T5", play: "Island. <i-c>Unstoppable Slasher</i-c>. Outcast, Hookblade and two cloaks attack where they can connect. Two cloaks stay home to block.", note: "More cloaks, blockers at home." },
        { turn: "T6", play: "Slasher attacks the opponent at 40 with no untapped blockers: 38, then 19. In your second main phase, cast <i-c>Wound Reflection</i-c>. At your end step they lose 21 more.", note: "One opponent out." }
      ] },
      { t: "p", html: "Look at what you didn't do: you never tapped out while Etrata was exposed, and you didn't cast Wound Reflection until the turn it killed someone." }
    ]
  },
  {
    id: "closing",
    title: "Turn 7 and later: closing",
    kicker: "The kill turn",
    minutes: 6,
    summary: "How to pick a finishing line, get the key attacker through, and use Ramses to turn one elimination into a win.",
    blocks: [
      { t: "p", html: "This deck rarely wins with one huge attack. It wins by knocking out a player with a specific line, and with Ramses out, knocking out one attacked player ends the game." },
      { t: "h", text: "The finishing lines" },
      { t: "table", head: ["Line", "Pieces", "What it does"], rows: [
        ["Slasher and Reflection", "<i-c>Unstoppable Slasher</i-c>, <i-c>Wound Reflection</i-c>", "Kills the player Slasher hits, from any life total, if they gain no life that turn"],
        ["Guildmage and Mindcrank", "<i-c>Duskmantle Guildmage</i-c>, <i-c>Mindcrank</i-c>, a starter event", "Drains and mills each seeded opponent until life or library runs out"],
        ["Hit counters", "<i-c>Etrata, the Silencer</i-c>, helped by <i-c>Ravenloft Adventurer</i-c>", "A player who owns three exiled cards with hit counters loses"],
        ["Stadium", "<i-c>Strixhaven Stadium</i-c> and many connecting creatures", "At ten point counters, the player your creature just hit loses"],
        ["Pressure", "Etrata, an enabler, evasive Assassins", "Damage plus the cards you steal and flip"]
      ] },
      { t: "h", text: "Ramses turns one kill into a win" },
      { t: "cards", names: ["Ramses, Assassin Lord"], caption: "{2}{U}{B}, 4/4 deathtouch. Other Assassins you control get +1/+1." },
      { t: "steps", items: [
        { title: "Attack the target with an Assassin", html: "The losing player must have been attacked this turn by an Assassin you controlled. The Assassin doesn't need to deal damage, just attack them." },
        { title: "Have Ramses on the battlefield when they lose", html: "He doesn't need to have been there when you declared attackers. He does need to be there at the moment they lose." },
        { title: "Knock them out this turn", html: "Any of the lines above works. When that player loses the game, Ramses's ability triggers and you win." }
      ] },
      { t: "callout", tone: "tip", title: "Type your attackers before combat", html: "Make sure the creature you're counting on for Ramses is already an Assassin when you declare attackers. Native Assassins and changelings always are. A cloak needs its enabler out before combat." },
      { t: "h", text: "Getting the key attacker through" },
      { t: "list", items: [
        "<i-c>Access Tunnel</i-c>: {3}, {T}: a creature with power 3 or less can't be blocked. That covers Slasher, even with Ramses's +1/+1.",
        "<i-c>Rogue's Passage</i-c>: {4}, {T}: any creature can't be blocked.",
        "<i-c>Key to the City</i-c>: {T}, discard a card: up to one target creature can't be blocked.",
        "<i-c>Aqueous Form</i-c> and <i-c>Cryptic Coat</i-c>: permanent unblockability.",
        "<i-c>Cover of Darkness</i-c> naming Assassin: your Assassins have fear, so only artifact and black creatures can block them.",
        "<i-c>Roshan, Hidden Magister</i-c>: menace for your face-down creatures."
      ] },
      { t: "callout", tone: "warn", title: "Use these before blocks", html: "All of these have to be in place before blockers are declared. Activate Access Tunnel and Rogue's Passage in your beginning of combat step, or earlier." },
      { t: "h", text: "Picking the target" },
      { t: "list", items: [
        "With Ramses out, pick the easiest player to knock out, not the most dangerous one. It ends the game either way.",
        "Without Ramses, knock out the player most likely to beat you.",
        "Spread your other Assassins across the table. Each hit is a cloak from that player's library.",
        "An opponent who put a known card on top of their library, with a scry or a tutor, is a great target. Your cloak takes that card."
      ] },
      { t: "h", text: "Late-game mana sinks" },
      { t: "list", items: [
        "Etrata's granted ability on your best cloaks.",
        "<i-c>Maskwood Nexus</i-c>: {3}, {T} for another changeling each turn.",
        "<i-c>Gix, Yawgmoth Praetor</i-c>: {4}{B}{B}{B} and discard X cards to exile the top X cards of an opponent's library. You may play lands and cast spells from among them for free.",
        "<i-c>Duskmantle Guildmage</i-c>'s mill ability, especially with <i-c>Mindcrank</i-c> out."
      ] },
      { t: "p", html: "Every cloak, every mill and every Gix activation shrinks an opponent's library. A player who has to draw from an empty library loses. In a long game, count their library as well as their life." }
    ]
  },
  {
    id: "combo-guildmage-mindcrank",
    title: "Combo: Duskmantle Guildmage and Mindcrank",
    kicker: "Combo 1",
    minutes: 6,
    summary: "How the Guildmage and Mindcrank loop works, how to start it, how far it goes, and what stops it.",
    blocks: [
      { t: "cards", names: ["Duskmantle Guildmage", "Mindcrank"], caption: "Two cards and a starter event." },
      { t: "p", html: "<i-c>Duskmantle Guildmage</i-c>'s first ability, {1}{U}{B}, sets up an effect for the rest of the turn: whenever a card is put into an opponent's graveyard from anywhere, that player loses 1 life." },
      { t: "p", html: "<i-c>Mindcrank</i-c> says whenever an opponent loses life, that player mills that many cards. Each milled card goes to their graveyard, which makes them lose 1 more life, which mills 1 more card." },
      { t: "h", text: "What you need" },
      { t: "list", items: [
        "<i-c>Mindcrank</i-c> on the battlefield.",
        "Guildmage's first ability activated and resolved this turn. That's {1}{U}{B}, or {U}{B} with <i-c>Training Grounds</i-c>. <i-c>Omen Hawker</i-c> can help pay.",
        "A starter event for each opponent you want to hit: they lose life, or a card goes into their graveyard."
      ] },
      { t: "h", text: "The loop" },
      { t: "steps", items: [
        { title: "Arm the Guildmage", html: "Activate the first ability and let it resolve. The effect lasts all turn, even if Guildmage leaves the battlefield afterwards." },
        { title: "Seed it", html: "An opponent loses life or has a card put into their graveyard. Combat damage is the usual starter." },
        { title: "Mindcrank mills", html: "They mill as many cards as the life they lost." },
        { title: "Guildmage drains", html: "Each milled card makes them lose 1 life." },
        { title: "Repeat", html: "Each loss mills again. It stops when they're out of life or out of cards." }
      ] },
      { t: "widget", id: "mindcrankSim", name: "mindcrankSim" },
      { t: "h", text: "Starter events" },
      { t: "list", items: [
        "<b>Combat damage</b> from any creature. <i-c>Changeling Outcast</i-c> for 1 is enough.",
        "<b>Guildmage's second ability:</b> {2}{U}{B}, or {U}{B} with Training Grounds: target player mills two cards.",
        "<b>Sacrificing a cloak they own.</b> <i-c>Plumb the Forbidden</i-c> or <i-c>Chthonian Nightmare</i-c> puts the card into its owner's graveyard. That counts.",
        "<b>Killing one of their nontoken creatures:</b> <i-c>Infernal Grasp</i-c>, <i-c>Feed the Swarm</i-c>, <i-c>Toxic Deluge</i-c>.",
        "<b>Countering their spell</b> on your turn. The countered card goes to their graveyard.",
        "<b>Their own plays</b> on your turn: an instant resolving, a discard, a creature dying in a block."
      ] },
      { t: "callout", tone: "key", title: "Every opponent needs their own seed", html: "The Guildmage effect covers all your opponents, but each one needs something to start their loop. A spread-out attack seeds everyone it hits. Or knock out one attacked player with Ramses on the battlefield, and you win." },
      { t: "h", text: "How far it goes" },
      { t: "p", html: "Each card in their library is worth 1 life. A player with more life than library cards survives the loop with an empty library. They then lose the next time they would draw, unless something changes." },
      { t: "math", items: [
        { label: "Opponent A: 40 life, 2 cards in library. Outcast hits for 1", value: "39 life" },
        { label: "Mindcrank mills 1, Guildmage drains 1", value: "38 life, 1 card" },
        { label: "Mindcrank mills 1, Guildmage drains 1", value: "37 life, 0 cards" },
        { label: "Mindcrank tries to mill 1 more", value: "nothing to mill" }
      ], total: "A ends at <b>37 life</b> with an empty library. They lose at their next draw, not now." },
      { t: "p", html: "In most real games the library is far bigger than the life total, and the loop runs them to 0." },
      { t: "h", text: "When to activate" },
      { t: "p", html: "Guildmage's ability works at instant speed. You can wait until blockers are declared and you know an attacker will connect, then activate it. Mana empties between steps, but the effect lasts until the end of the turn." },
      { t: "h", text: "What stops it" },
      { t: "list", items: [
        "Removing Mindcrank before or during the loop. Each step is a separate trigger, so opponents can respond in the middle.",
        "Effects that exile cards instead of putting them into a graveyard. No card reaches the graveyard, so Guildmage never triggers.",
        "Countering or responding to Guildmage's activation before it resolves.",
        "Life-loss prevention, or a player who gains a lot of life in response."
      ] },
      { t: "callout", tone: "warn", title: "Milling feeds graveyard decks", html: "Against a deck that plays from its graveyard, a loop that stops short hands them a full yard. Go for it when it kills, and keep <i-c>Bojuka Bog</i-c> or <i-c>Boggart Trawler // Boggart Bog</i-c> in mind for the cleanup." },
      { t: "qa", items: [
        { q: "Guildmage is armed, Mindcrank is out, and A has 40 life but only two library cards. Outcast hits for 1. Does A lose right away?", a: "No. A loses 1 for the hit, then 1 for each of the two milled cards: 37 life and an empty library. A loses at their next draw unless something changes." },
        { q: "Does the loop stop if Guildmage dies?", a: "No. The effect was created when the ability resolved and lasts all turn." },
        { q: "Do token creatures dying count?", a: "No. Tokens aren't cards, so they never go to a graveyard as cards." },
        { q: "Does Mindcrank work alone?", a: "Yes, it mills whenever an opponent loses life. It's just not a loop without the Guildmage effect. With <i-c>Unstoppable Slasher</i-c> or <i-c>Wound Reflection</i-c> it mills a lot." }
      ] }
    ]
  },
  {
    id: "combo-slasher-reflection",
    title: "Combo: Unstoppable Slasher and Wound Reflection",
    kicker: "Combo 2",
    minutes: 5,
    summary: "The Slasher and Wound Reflection kill, the math, the timing deadline, and how Ramses turns it into a win.",
    blocks: [
      { t: "cards", names: ["Unstoppable Slasher", "Wound Reflection"], caption: "One hit and one end step." },
      { t: "p", html: "<i-c>Unstoppable Slasher</i-c> is a 2/3 deathtouch Assassin. When it deals combat damage to a player, they lose half their life, rounded up." },
      { t: "p", html: "<i-c>Wound Reflection</i-c> says at the beginning of each end step, each opponent loses life equal to the life they lost this turn." },
      { t: "p", html: "After Slasher connects, the player has lost more than half their starting life this turn. Reflection makes them lose it all again, which is always more than they have left." },
      { t: "h", text: "The math" },
      { t: "math", items: [
        { label: "Opponent at 40. Slasher deals 2", value: "38" },
        { label: "They lose 19, half of 38", value: "19" },
        { label: "Life lost this turn: 2 + 19", value: "21" },
        { label: "Wound Reflection at the end step", value: "19 - 21 = -2" }
      ], total: "Dead, with no other damage needed." },
      { t: "math", items: [
        { label: "With Ramses out, Slasher is 3/4. Opponent at 40", value: "37" },
        { label: "They lose 19, half of 37 rounded up", value: "18" },
        { label: "Life lost this turn: 3 + 19", value: "22" },
        { label: "Wound Reflection", value: "18 - 22 = -4" }
      ], total: "Dead, and Ramses turns that into a win for you." },
      { t: "p", html: "It works from any life total: what's left after the halving is never more than what they've lost. Lifegain between the hit and the end step can save them, because Reflection counts life lost, not net life." },
      { t: "widget", id: "slasherCalc", name: "slasherCalc" },
      { t: "h", text: "The timing" },
      { t: "steps", items: [
        { title: "Slasher connects", html: "Get it through with <i-c>Access Tunnel</i-c>, <i-c>Rogue's Passage</i-c>, <i-c>Key to the City</i-c>, <i-c>Aqueous Form</i-c> or <i-c>Cover of Darkness</i-c>, or attack a player with no good blocker." },
        { title: "Reflection is out before the end step begins", html: "It can arrive after combat. Cast it in your second main phase, or flip it from face down with Etrata's ability." },
        { title: "The end step begins", html: "Reflection triggers. The player loses the life they lost this turn again." }
      ] },
      { t: "callout", tone: "warn", title: "The deadline is the start of the end step", html: "Reflection's trigger checks at the beginning of the end step. If Reflection isn't on the battlefield when the end step starts, it's too late for this turn." },
      { t: "callout", tone: "tip", title: "Hide Reflection face down", html: "Six mana in your second main phase warns the table. <i-c>Scroll of Fate</i-c> can manifest Reflection from your hand at instant speed, and a cloak might already be one. Etrata's ability turns it face up for {2}{U}{B}, or {U}{B} with Training Grounds, in your second main phase. Turning face up isn't casting, so counterspells can't stop it. Opponents can still respond to the ability, for example by killing the face-down creature." },
      { t: "h", text: "More about Slasher" },
      { t: "list", items: [
        "When Slasher dies with no counters on it, it comes back tapped with two stun counters. It's a sturdy deathtouch blocker.",
        "A stun counter replaces the next untap: instead of untapping, remove one counter. So a returned Slasher sits out two of your untap steps.",
        "A <i-c>Spark Double</i-c> copy of Slasher enters with a +1/+1 counter, so the copy won't come back when it dies.",
        "Reflection triggers at every end step, including opponents'. With <i-c>Mindcrank</i-c> out, every loss also mills."
      ] },
      { t: "qa", items: [
        { q: "Slasher connected this turn. What's the latest time to flip a face-down Wound Reflection for this turn's end step?", a: "Before the end step begins, for example in your second main phase. Once the end step has begun, its beginning-of-step trigger has already been missed." },
        { q: "Does Reflection count damage from other creatures too?", a: "Yes. It counts all life each opponent lost this turn, from any source." },
        { q: "Does Ramses have to be out when Slasher attacks?", a: "No. He needs to be on the battlefield when the player loses, at the end step. The player needs to have been attacked this turn by an Assassin you controlled, and Slasher is one." }
      ] }
    ]
  },
  {
    id: "combo-silencer-stadium",
    title: "Combo: Etrata, the Silencer and Strixhaven Stadium",
    kicker: "Combo 3",
    minutes: 6,
    summary: "The two cards that say 'loses the game': hit counters, the March of Swirling Mist trick, and the ten-counter Stadium.",
    blocks: [
      { t: "p", html: "Two cards in the deck make a player lose outright, whatever their life total. Both pair with Ramses." },
      { t: "h", text: "Etrata, the Silencer" },
      { t: "cards", names: ["Etrata, the Silencer", "Ravenloft Adventurer", "March of Swirling Mist"], caption: "The hit-counter package and the trick that keeps Silencer around." },
      { t: "p", html: "<i-c>Etrata, the Silencer</i-c> is a 3/5 that can't be blocked. When she deals combat damage to a player, her trigger targets a creature that player controls. It exiles that creature with a hit counter. If that player owns three or more exiled cards with hit counters, they lose. Then Silencer's owner shuffles her into their library." },
      { t: "list", items: [
        "The trigger needs a legal target: a creature the damaged player controls. With no target, nothing happens at all: no exile, no loss check, no shuffle.",
        "If the target becomes illegal before the trigger resolves, the whole trigger fails, shuffle included.",
        "If the target has ward, you pay the ward cost or the whole trigger is countered.",
        "Only exiled <b>cards</b> the player <b>owns</b> count. A token exiled with a hit counter stops existing."
      ] },
      { t: "h", text: "Keeping Silencer with March of Swirling Mist" },
      { t: "steps", items: [
        { title: "Connect", html: "Silencer hits a player who controls a creature. Target that creature with her trigger." },
        { title: "Respond with March", html: "Cast <i-c>March of Swirling Mist</i-c> with X=1 targeting Silencer, for {1}{U}. Exiling a blue card from your hand makes it cost {2} less. She phases out. She doesn't leave the battlefield." },
        { title: "Let the trigger resolve", html: "Its target is still legal, so it exiles the creature, adds the hit counter and checks for a loss. Silencer is phased out and treated as though she doesn't exist, so she isn't shuffled away." },
        { title: "She comes back", html: "She phases in during your next untap step, ready to attack again." }
      ] },
      { t: "p", html: "<i-c>Ravenloft Adventurer</i-c> adds hit counters too. While it's on the battlefield, a creature an opponent controls that would die is exiled with a hit counter instead. Each nontoken creature an opponent loses to your removal, a block or a wipe counts toward Silencer's three." },
      { t: "h", text: "Strixhaven Stadium" },
      { t: "cards", names: ["Strixhaven Stadium"], caption: "{3} artifact." },
      { t: "list", items: [
        "{T}: Add {C} and put a point counter on it.",
        "Whenever a creature deals combat damage to you, remove a point counter.",
        "Whenever a creature you control deals combat damage to an opponent, put a point counter on it. Then if it has ten or more, remove them all and that player loses the game."
      ] },
      { t: "p", html: "Every connecting creature is its own trigger, cloaks included. A wide face-down army moves the Stadium fast." },
      { t: "callout", tone: "key", title: "Choose who crosses ten", html: "When several creatures connect at once, you put their Stadium triggers on the stack in any order. Order them so the trigger that reaches ten belongs to the opponent you want out, ideally one an Assassin attacked, so Ramses wins you the game." },
      { t: "list", items: [
        "Tapping Stadium for mana adds a counter, but the loss check only happens in the combat-damage trigger. Tap it before combat to get close, then let a hit finish.",
        "Opponents' creatures hitting you take counters off. The Stadium is fragile when the table is attacking you.",
        "Opponents can see the counters. At seven or eight, expect them to deal with it."
      ] },
      { t: "qa", items: [
        { q: "Can Counterspell counter Silencer's damage trigger?", a: "No. A triggered ability isn't a spell. March helps because it phases Silencer out in response, not because it counters anything." },
        { q: "Silencer's trigger had no legal target. Is she shuffled away?", a: "No. With no legal target the trigger never goes on the stack, so she stays on the battlefield." },
        { q: "Your Stadium has nine counters. You tap it for mana. What happens?", a: "It reaches ten, and nobody loses. The ten-counter check is part of the combat-damage trigger. The next time one of your creatures connects, that trigger adds a counter, sees ten or more, and that player loses." },
        { q: "Does Ramses win off a Stadium loss?", a: "Yes, if the losing player was attacked this turn by an Assassin you controlled and Ramses is on the battlefield when they lose." }
      ] }
    ]
  },
  {
    id: "defense",
    title: "Defense: wipes, removal and protection",
    kicker: "Staying alive",
    minutes: 4,
    summary: "How to survive board wipes and removal, where to spend your counterspells, and how to rebuild.",
    blocks: [
      { t: "p", html: "This deck wins with many small creatures, most of them face down. A single wipe can clear all of them. Spot removal is less of a problem: the deck has plenty of Assassins, and Etrata herself costs only three." },
      { t: "h", text: "Know the wipe" },
      { t: "table", head: ["Wipe type", "What saves you", "What doesn't"], rows: [
        ["Destroy all creatures", "<i-c>March of Swirling Mist</i-c> phases your best creatures out. <i-c>Supernatural Stamina</i-c> brings one back", "Ward on cloaks: a wipe doesn't target"],
        ["-X/-X, like <i-c>Toxic Deluge</i-c>", "March of Swirling Mist. Etrata's 4 toughness survives small X", "Supernatural Stamina still works, but the creature returns into the same -X/-X if it's still this turn"],
        ["Exile all creatures", "March of Swirling Mist, and cards in hand", "Stamina and death triggers"],
        ["Bounce all creatures", "Your face-up creatures come back as normal cards", "Face-down creatures: they're revealed and go to their owner's hand. Stolen cloaks go back to the opponent"]
      ] },
      { t: "callout", tone: "key", title: "Counter the wipe, not the threat", html: "<i-c>Counterspell</i-c>, <i-c>Arcane Denial</i-c>, <i-c>An Offer You Can't Refuse</i-c> and <i-c>Wash Away</i-c> are few. Save one for the spell that would clear your board. A single creature an opponent casts can usually be raced or blocked by Etrata's deathtouch." },
      { t: "h", text: "Spot removal" },
      { t: "list", items: [
        "Cloaks have ward {2}. Opponents pay two more to target them, which slows removal aimed at your face-down creatures. Manifested and manifest-dread creatures don't have ward.",
        "<i-c>Dispel</i-c> counters an instant removal spell for {U}. <i-c>Willbender</i-c>, cast face down, redirects it when you turn it face up for {1}{U}.",
        "<i-c>Supernatural Stamina</i-c> on a creature that's about to die brings it back tapped. Used on a face-down creature, the card comes back face up, so its enter triggers happen.",
        "Etrata is cheap to recast. Let removal hit her if the alternative is losing a counterspell you need for a wipe."
      ] },
      { t: "h", text: "Your own removal" },
      { t: "p", html: "<i-c>Infernal Grasp</i-c>, <i-c>Feed the Swarm</i-c> and <i-c>Reality Shift</i-c> are for creatures that stop your attacks: fliers that block <i-c>Hookblade Veteran</i-c>, deathtouch blockers, and anything that punishes attacks. <i-c>Toxic Deluge</i-c> is your reset button when you're behind. Pay just enough life to clear their board. X=2 already kills your cloaks, and X=4 kills Etrata." },
      { t: "callout", tone: "tip", title: "Reality Shift gives them a 2/2", html: "Its controller manifests the top card of their library. That 2/2 can block. Use Reality Shift on a real threat, not on a blocker you could get around." },
      { t: "h", text: "Rebuilding" },
      { t: "list", items: [
        "Keep one or two Assassins in hand when the board is already doing well. They're cheap and restart the cloak engine right away.",
        "<i-c>Chthonian Nightmare</i-c> returns a creature card from your graveyard. It costs energy equal to the card's mana value and a creature to sacrifice. Three energy covers Etrata or Ramses' cheaper friends.",
        "<i-c>They Came from the Pipes</i-c> and <i-c>Cursed Windbreaker</i-c> make face-down creatures without needing a hit."
      ] }
    ]
  },
  {
    id: "reading-the-table",
    title: "Reading the table",
    kicker: "Politics",
    minutes: 3,
    summary: "Who to attack, when to hold back, and how to use the fact that nobody knows what your cloaks are.",
    blocks: [
      { t: "p", html: "Etrata is not scary on turn three: a 1/4 and a few small creatures. That's good. Let the table worry about the big threats while your cloaks steal their best cards." },
      { t: "h", text: "Who to attack" },
      { t: "steps", items: [
        { title: "The open board", html: "The player with the fewest untapped blockers. Every Assassin that connects cloaks a card, and blocked cloaks trade away." },
        { title: "The deck with the best top cards", html: "Ramp and big-spell decks give you their bombs when you cloak them. Aggro decks give you small creatures." },
        { title: "Not the player who's already losing", html: "Unless a lose-the-game line (Silencer, Stadium, Mindcrank) is close to finishing them. Then pick one target and focus it, so Ramses can win the game off that loss." }
      ] },
      { t: "h", text: "Face-down information" },
      { t: "list", items: [
        "You may look at your face-down creatures at any time. Opponents may not, even the one whose card it was.",
        "Face-down cards are revealed when they leave the battlefield or at the end of the game. Keep them in order and separate so everyone can check.",
        "A face-down creature with {2}{U}{B} open is a threat. Opponents have to guess whether it's a removal spell or a land. Use that: don't flip a weak cloak just because you can."
      ] },
      { t: "callout", tone: "tip", title: "Don't show your combo early", html: "Mindcrank on its own looks harmless, and Duskmantle Guildmage looks like a mill card. Play one, hold the other, and cast it when you can go off in the same turn." },
      { t: "h", text: "When to hold back" },
      { t: "list", items: [
        "Keep Etrata home as a deathtouch blocker when opponents have larger creatures than yours. Her ability works whether she attacks or not.",
        "Leave a couple of cloaks home against aggressive tables. A 2/2 blocker with ward {2} is fine.",
        "Hold <i-c>Toxic Deluge</i-c> until the table is ahead of you, not just one player."
      ] }
    ]
  },
  {
    id: "tricky-interactions",
    title: "Tricky interactions",
    kicker: "Rules",
    minutes: 5,
    summary: "The rules questions that come up with this deck, with short answers.",
    blocks: [
      { t: "p", html: "Most arguments at the table come from face-down creatures. These are the answers to the questions you'll hear most." },
      { t: "h", text: "Face-down creatures" },
      { t: "qa", items: [
        { q: "What is a face-down creature?", a: "A 2/2 with no name, no color, no creature type, no abilities and no mana cost (mana value 0). A cloaked one also has ward {2}." },
        { q: "Can I turn a face-down land face up?", a: "Not by paying its mana cost: it has none. Etrata's ability turns it face up for {2}{U}{B}. It stays on the battlefield as a land and stops being a creature." },
        { q: "What if it's an instant or sorcery?", a: "It can't be turned face up. Etrata's ability exiles it instead, and you may cast it right away without paying its mana cost. It goes to its owner's graveyard afterwards." },
        { q: "Does turning a creature face up use the stack?", a: "Paying its mana cost or morph cost is a special action: nobody can respond. Etrata's ability is an activated ability and uses the stack." },
        { q: "Does it count as entering?", a: "No. Enter triggers don't happen and 'as this enters' choices aren't made. 'When this is turned face up' triggers do happen." },
        { q: "Who owns a cloaked opponent's card?", a: "They do. You control it. If it leaves the battlefield, it goes to their graveyard, hand or library." }
      ] },
      { t: "h", text: "Assassins and changelings" },
      { t: "qa", items: [
        { q: "Is a face-down creature an Assassin?", a: "Not by itself. <i-c>Roshan, Hidden Magister</i-c>, <i-c>Maskwood Nexus</i-c>, <i-c>Arcane Adaptation</i-c> or <i-c>Leyline of Transformation</i-c> naming Assassin make it one." },
        { q: "Do changelings count as Assassins?", a: "Yes. <i-c>Changeling Outcast</i-c>, <i-c>Mothdust Changeling</i-c> and <i-c>Universal Automaton</i-c> are every creature type, Assassin included." },
        { q: "Does Ramses' +1/+1 apply to face-down Assassins?", a: "Yes, while Roshan or a type-changing card makes them Assassins." }
      ] },
      { t: "h", text: "Combat and triggers" },
      { t: "qa", items: [
        { q: "Two Assassins hit the same player. How many cloaks?", a: "Two. Etrata triggers once for each Assassin that deals combat damage to an opponent." },
        { q: "Does Silencer shuffle herself away if the trigger has no target?", a: "No. If that player controls no creature, the trigger has no legal target and doesn't go on the stack at all, so she stays." },
        { q: "Supernatural Stamina on a face-down creature?", a: "When it dies, the card returns to the battlefield face up. If it's a permanent card, its enter triggers happen. An instant or sorcery just stays in the graveyard." },
        { q: "Spark Double from a cloak?", a: "Turned face up, it copies nothing and dies as a 0/0. Only cast it from your hand." },
        { q: "Unstoppable Slasher came back with stun counters. Does it come back again?", a: "Not while it has any counters on it. Once the stun counters are gone, it returns again the next time it dies." }
      ] }
    ]
  },
  {
    id: "habits",
    title: "Ten habits and common mistakes",
    kicker: "Good habits",
    minutes: 3,
    summary: "The ten habits that win games with this deck, and the mistakes that lose them.",
    blocks: [
      { t: "p", html: "Most games with Etrata are decided by small choices: when to attack, what to flip and what to keep hidden." },
      { t: "h", text: "Ten habits" },
      { t: "steps", items: [
        { title: "Cast Etrata before combat", html: "Her trigger only counts Assassins that deal damage while she's on the battlefield." },
        { title: "Attack with evasive Assassins every turn", html: "Every hit is a free card. A turn with no attack is a turn with no cloaks." },
        { title: "Look at your cloaks each turn", html: "Know what you have before you plan the turn." },
        { title: "Flip creatures for their mana cost", html: "Cheaper than Etrata's ability for most creatures, and it's a special action." },
        { title: "Flip Roshan after blockers", html: "Menace and Assassin types arrive when blocks are already locked in." },
        { title: "Save a counter for the wipe", html: "The deck folds to a wipe and shrugs off spot removal." },
        { title: "Order lose-the-game triggers", html: "With Ramses out, make sure the player who loses was attacked by one of your Assassins this turn." },
        { title: "Cast Spark Double, never flip it", html: "It copies nothing when turned face up." },
        { title: "Keep a blocker home", html: "Etrata's deathtouch keeps you alive while the cloaks work." },
        { title: "Tell the table about the combos", html: "Guildmage plus Mindcrank, Slasher plus Wound Reflection, and Ramses. Say so in the pregame talk." }
      ] },
      { t: "h", text: "Common mistakes" },
      { t: "table", head: ["Mistake", "Do this instead"], rows: [
        ["Casting Etrata in main phase two", "Cast her before combat when an Assassin can connect."],
        ["Flipping Arcane Adaptation from a cloak", "It has no chosen type. Cast it from your hand."],
        ["Paying {2}{U}{B} for a cheap creature", "Pay its mana cost instead."],
        ["Attacking plain cloaks into blockers", "Send them where they can't be blocked well, or make them Assassins first."],
        ["Using counterspells on small creatures", "Keep them for wipes and game-ending spells."],
        ["Tapping Strixhaven Stadium to ten counters", "The check happens only in the combat-damage trigger. Let a hit finish it."],
        ["Forgetting ward {2} on your cloaks", "Remind opponents when they target one."],
        ["Toxic Deluge for X=4 with Etrata out", "X=3 keeps her alive."]
      ] }
    ]
  },
  {
    id: "glossary",
    title: "Glossary",
    kicker: "Quick reference",
    minutes: 4,
    summary: "Every keyword and mechanic in this deck, in plain words.",
    blocks: [
      { t: "p", html: "Short definitions for the terms used in this guide, with the cards that use them." },
      { t: "qa", items: [
        { q: "Cloak", a: "Put a card onto the battlefield face down as a 2/2 creature with ward {2}. If it's a creature card, you may turn it face up any time for its mana cost. Etrata, <i-c>Cryptic Coat</i-c>." },
        { q: "Manifest", a: "Like cloak, without ward. <i-c>Scroll of Fate</i-c>, <i-c>Reality Shift</i-c>." },
        { q: "Manifest dread", a: "Look at the top two cards of your library, manifest one and put the other into your graveyard. <i-c>They Came from the Pipes</i-c>, <i-c>Cursed Windbreaker</i-c>, <i-c>Glitch Interpreter</i-c>." },
        { q: "Morph", a: "Cast the card face down as a 2/2 for {3}. Turn it face up any time for its morph cost. <i-c>Willbender</i-c>, <i-c>Kheru Spellsnatcher</i-c>." },
        { q: "Ward", a: "Whenever the creature becomes the target of a spell or ability an opponent controls, counter it unless they pay the ward cost." },
        { q: "Changeling", a: "The card is every creature type, Assassin included. <i-c>Changeling Outcast</i-c>, <i-c>Mothdust Changeling</i-c>, <i-c>Universal Automaton</i-c>." },
        { q: "Hit counter", a: "A counter on a card in exile. <i-c>Etrata, the Silencer</i-c> makes a player lose with three of their cards in exile with hit counters. <i-c>Ravenloft Adventurer</i-c> adds more." },
        { q: "Phasing", a: "A phased-out permanent is treated as though it doesn't exist until its controller's next untap step. <i-c>March of Swirling Mist</i-c>." },
        { q: "Historic", a: "Artifacts, legendaries and Sagas. Casting one triggers <i-c>Basim Ibn Ishaq</i-c>." },
        { q: "Energy", a: "Counters a player gets and spends. <i-c>Chthonian Nightmare</i-c>." },
        { q: "Cleave", a: "An alternative cost that removes the bracketed words. <i-c>Wash Away</i-c>." },
        { q: "Initiative", a: "<i-c>Ravenloft Adventurer</i-c> gives you the initiative: you venture into the Undercity. Any player who deals combat damage to you takes it." },
        { q: "Stun counter", a: "If a permanent with a stun counter would untap, remove a stun counter instead. <i-c>Unstoppable Slasher</i-c>." },
        { q: "Surveil", a: "Look at the top cards of your library and put any of them into your graveyard, the rest back in any order. <i-c>Desmond Miles</i-c>." }
      ] },
      { t: "widget", id: "playCta" }
    ]
  }
];
