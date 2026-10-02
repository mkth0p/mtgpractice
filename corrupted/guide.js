/* The long-form playing guide for the Corrupted Miku deck (Shalai, Voice of Plenty).
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Card mentions use <i-c>Exact Card Name</i-c>; mana symbols are written as {G}, {W}, {2}, {T}. */
window.CORRUPTED_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "What the deck is, how it wins, whether it's for you, and what to tell the table.",
    blocks: [
      { t: "p", html: "Corrupted Miku is a green-white creature combo deck led by <i-c>Shalai, Voice of Plenty</i-c>. In the Hatsune Miku Secret Lair she's printed as Miku, Voice Over All. Same card, same rules." },
      { t: "p", html: "Shalai gives you and your other creatures hexproof. Behind that shield you play cheap creatures that stop opponents from casting spells on your turn, then you put together a two-card combo and win." },
      { t: "cards", names: ["Shalai, Voice of Plenty", "Archangel of Thune", "Spike Feeder"], caption: "The commander and the deck's signature combo." },
      { t: "h", text: "The plan in four beats" },
      { t: "steps", items: [
        { title: "Ramp fast", html: "Mana dorks, <i-c>Sol Ring</i-c>, moxen and <i-c>Gaea's Cradle</i-c> get you to three or four mana on turn 2." },
        { title: "Put up the shield", html: "<i-c>Shalai, Voice of Plenty</i-c> stops targeted removal on everything else. <i-c>Grand Abolisher</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c> and friends stop opponents casting spells on your turn." },
        { title: "Find two cards", html: "A big tutor suite finds the combo pieces. Most of them are creatures or instants that cost one or two mana." },
        { title: "Win", html: "Usually on turns 4 to 6. A great hand can win on turn 2 or 3." }
      ] },
      { t: "h", text: "Ways to win" },
      { t: "list", items: [
        "<b>A. Archangel and Feeder.</b> <i-c>Archangel of Thune</i-c> plus <i-c>Spike Feeder</i-c>: infinite life and infinitely large creatures, at instant speed, with no mana.",
        "<b>B. Heliod and Ballista.</b> <i-c>Heliod, Sun-Crowned</i-c> plus <i-c>Walking Ballista</i-c> with two counters and {1}{W}: infinite damage.",
        "<b>C. Druid and Vizier.</b> <i-c>Devoted Druid</i-c> plus <i-c>Vizier of Remedies</i-c>: infinite green mana. Spend it on Ballista, Shalai or <i-c>Finale of Devastation</i-c>.",
        "<b>D. Heliod and Feeder.</b> <i-c>Heliod, Sun-Crowned</i-c> plus <i-c>Spike Feeder</i-c>: infinite life. A backup line.",
        "<b>E. Natural Order.</b> <i-c>Natural Order</i-c> puts <i-c>Craterhoof Behemoth</i-c> or <i-c>Vorinclex, Voice of Hunger</i-c> onto the battlefield for four mana.",
        "<b>F. The fair game.</b> Shalai's counters, <i-c>Gavony Township</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c> and <i-c>Skullclamp</i-c> grind out cards behind hexproof."
      ] },
      { t: "h", text: "Is it for you?" },
      { t: "list", items: [
        "You'll enjoy it if you like setting up a safe turn and then winning in one go.",
        "You'll enjoy it if you like many small decisions: which tutor, which piece first, when to hold a Silence.",
        "You need to know your tutors well. This guide and the quiz are built for that.",
        "It's less fun if you want long, swingy board games. The deck tries to end things quickly.",
        "It has no counterspells. You stop opponents before they act, not after."
      ] },
      { t: "callout", tone: "key", title: "Tell the table first", html: "This is a Bracket 4 deck with four two-card infinite combos, fast mana and a lot of tutors. <i-c>Vorinclex, Voice of Hunger</i-c> keeps opponents' lands tapped, which is close to land denial. Say all of this in the pregame talk. The last chapter has a script." },
      { t: "callout", tone: "tip", title: "How to use this guide", html: "Read chapters 2 to 6 first: the shield, the layers and the combos. Then do the quiz until the tutor questions feel easy. Come back for mana, mulligans and matchups after a few games." }
    ]
  },
  {
    id: "shalai-shield",
    title: "Shalai's shield",
    kicker: "The commander",
    minutes: 5,
    summary: "What Shalai's hexproof covers, what it doesn't, and how you protect Shalai herself.",
    blocks: [
      { t: "cards", names: ["Shalai, Voice of Plenty"], caption: "{3}{W}, a 3/4 flying Angel." },
      { t: "p", html: "Shalai has three abilities: flying, a static hexproof ability and an activated ability." },
      { t: "steps", items: [
        { title: "Flying", html: "A 3/4 flier blocks well and attacks well once she has counters." },
        { title: "The shield", html: "You, planeswalkers you control, and <b>other</b> creatures you control have hexproof." },
        { title: "The pump", html: "{4}{G}{G}: put a +1/+1 counter on each creature you control, Shalai included. With infinite mana it makes your whole team as big as you like." }
      ] },
      { t: "h", text: "What hexproof covers" },
      { t: "list", items: [
        "<b>You, the player.</b> Opponents can't target you. Targeted discard, a Fireball or a Ballista aimed at your face, \"target player loses the game\" effects: all blanked.",
        "<b>Your other creatures.</b> Swords, Path, Chaos Warp, bounce spells and pings can't target your combo pieces or your hatebears.",
        "<b>Your planeswalkers.</b> The deck has none, but it's on the card."
      ] },
      { t: "h", text: "What it doesn't cover" },
      { t: "list", items: [
        "<b>Shalai herself.</b> She is the one creature opponents can target. Expect removal to go at her first.",
        "<b>Board wipes.</b> Wrath effects, Toxic Deluge, Farewell, overloaded Cyclonic Rift and Blasphemous Act don't target.",
        "<b>Edicts.</b> \"Each opponent sacrifices a creature\" doesn't target your creatures.",
        "<b>Your noncreature permanents.</b> Rocks, enchantments and lands can still be targeted. <i-c>The One Ring</i-c> and <i-c>Survival of the Fittest</i-c> are fair game.",
        "<b>Spells on the stack.</b> Counterspells target spells, not players or permanents."
      ] },
      { t: "callout", tone: "key", title: "Hexproof only stops opponents", html: "You can still target your own creatures. <i-c>Heliod, Sun-Crowned</i-c> giving lifelink to <i-c>Walking Ballista</i-c>, <i-c>Giver of Runes</i-c>, <i-c>Lightning Greaves</i-c>' equip and <i-c>Spike Feeder</i-c> moving counters all work normally." },
      { t: "h", text: "Protecting Shalai" },
      { t: "cards", names: ["Giver of Runes", "Lightning Greaves", "Flawless Maneuver", "Teferi's Protection"], caption: "Targeted removal, then wipes." },
      { t: "table", head: ["Card", "Stops", "Doesn't stop"], rows: [
        ["<i-c>Giver of Runes</i-c>", "Targeted removal of one color, or colorless, for one turn. Shalai's hexproof covers Giver.", "Wipes, edicts, removal of a color you didn't pick"],
        ["<i-c>Lightning Greaves</i-c>", "All targeting, yours included. Also gives haste.", "Wipes, edicts. Equip is sorcery speed."],
        ["<i-c>Flawless Maneuver</i-c>", "Destroy effects: Wrath effects, damage wipes", "Exile, -X/-X, bounce, edicts"],
        ["<i-c>Teferi's Protection</i-c>", "Almost everything: your permanents phase out", "Nothing much, but your life can't change until your next turn"],
        ["<i-c>Veil of Summer</i-c>", "Blue and black spells and abilities targeting you or your permanents, and counterspells this turn", "Red or white removal, wipes"]
      ] },
      { t: "callout", tone: "tip", title: "Flawless Maneuver is free while Shalai is out", html: "It says \"if you control a commander\". With Shalai on the battlefield it costs nothing. If Shalai is in the command zone, you pay {2}{W}." },
      { t: "callout", tone: "warn", title: "Greaves blocks your own targets too", html: "Shroud stops everyone, you included. Don't put <i-c>Lightning Greaves</i-c> on <i-c>Walking Ballista</i-c> or <i-c>Spike Feeder</i-c> when you need <i-c>Heliod, Sun-Crowned</i-c> to target them. Shalai's hexproof is better for combo pieces, because it only stops opponents." },
      { t: "h", text: "When Shalai dies" },
      { t: "p", html: "Put her back in the command zone. The commander tax is {2} more each time, so she costs {5}{W} the second time. In the meantime your creatures are open to targeted removal. Hold combo pieces back until she's back, or win through <i-c>Teferi's Protection</i-c> and the silence cards instead." }
    ]
  },
  {
    id: "four-layers",
    title: "The four layers",
    kicker: "Game plan",
    minutes: 7,
    summary: "Nothing targeted, nothing cast on your turn, your creatures can't be countered, opponents slowed. Each card and when to play it.",
    blocks: [
      { t: "p", html: "You don't need every layer. You need enough of them that nobody can stop your combo on the turn you go for it. Think of each one as a question: what could they do to stop me, and which card says no?" },
      { t: "h", text: "Layer 1: nothing gets targeted" },
      { t: "cards", names: ["Shalai, Voice of Plenty", "Giver of Runes", "Lightning Greaves"], caption: "Shalai covers everyone else. Giver and Greaves cover Shalai." },
      { t: "p", html: "Covered in the last chapter. Play Shalai early against removal-heavy tables, before your combo pieces." },
      { t: "h", text: "Layer 2: nothing gets cast on your turn" },
      { t: "cards", names: ["Grand Abolisher", "Kutzil, Malamet Exemplar", "Voice of Victory", "Ranger-Captain of Eos", "Silence", "Orim's Chant"], caption: "The silence package." },
      { t: "table", head: ["Card", "What it stops", "When"], rows: [
        ["<i-c>Grand Abolisher</i-c>", "During your turn: opponents can't cast spells or activate abilities of artifacts, creatures or enchantments", "Always on. The best one."],
        ["<i-c>Kutzil, Malamet Exemplar</i-c>", "Opponents can't cast spells during your turn. Abilities still work.", "Always on. Also draws cards in the fair game."],
        ["<i-c>Voice of Victory</i-c>", "Same as Kutzil. Abilities still work.", "Always on"],
        ["<i-c>Ranger-Captain of Eos</i-c>", "Sacrifice it: opponents can't cast noncreature spells this turn", "One turn. They can still flash in creatures."],
        ["<i-c>Silence</i-c>", "Opponents can't cast spells this turn", "One turn, {W}, instant"],
        ["<i-c>Orim's Chant</i-c>", "Target player can't cast spells this turn. Kicked: creatures can't attack this turn.", "One turn, one player, {W}, instant"]
      ] },
      { t: "callout", tone: "warn", title: "Spells, not abilities", html: "Kutzil, Voice of Victory, Silence and Orim's Chant stop spells only. An opponent can still activate an ability, like a creature's sacrifice ability or a land's channel ability. <i-c>Grand Abolisher</i-c> also stops abilities of artifacts, creatures and enchantments, but not of lands." },
      { t: "callout", tone: "tip", title: "They can respond to the silence", html: "Silence, Orim's Chant and Ranger-Captain's sacrifice all use the stack. Opponents can answer them before they resolve. Cast them first, before you show the combo, and ideally when opponents are tapped low." },
      { t: "h", text: "Layer 3: your creature spells can't be countered" },
      { t: "cards", names: ["Destiny Spinner", "Cavern of Souls", "Delighted Halfling", "Veil of Summer"], caption: "Uncounterable creatures." },
      { t: "list", items: [
        "<i-c>Destiny Spinner</i-c>: your creature and enchantment spells can't be countered. That covers every creature and <i-c>Heliod, Sun-Crowned</i-c>.",
        "<i-c>Cavern of Souls</i-c>: name a creature type. Its colored mana makes a spell of that type uncounterable.",
        "<i-c>Delighted Halfling</i-c>: its colored mana makes a legendary spell uncounterable. That's Shalai, Heliod, Kutzil, Thalia, Linvala, Vorinclex and <i-c>The One Ring</i-c>.",
        "<i-c>Veil of Summer</i-c>: for one turn, none of your spells can be countered. Good for the turn you cast a tutor."
      ] },
      { t: "p", html: "Remember the tutors themselves aren't creatures. <i-c>Natural Order</i-c>, <i-c>Chord of Calling</i-c> and <i-c>Finale of Devastation</i-c> can be countered unless Veil or a silence card is out." },
      { t: "h", text: "Layer 4: opponents are slowed" },
      { t: "cards", names: ["Drannith Magistrate", "Thalia, Heretic Cathar", "Blind Obedience", "Deafening Silence", "Linvala, Keeper of Silence", "Aven Mindcensor", "Archivist of Oghma"], caption: "Stax that hurts them more than you." },
      { t: "table", head: ["Card", "What it does to them", "Play it against"], rows: [
        ["<i-c>Drannith Magistrate</i-c>", "Can't cast spells from anywhere but their hand", "Commander-based decks, flashback, graveyard and top-of-library decks"],
        ["<i-c>Thalia, Heretic Cathar</i-c>", "Their creatures and nonbasic lands enter tapped", "Creature decks, haste, dorks"],
        ["<i-c>Blind Obedience</i-c>", "Their artifacts and creatures enter tapped", "Rock-heavy and creature decks"],
        ["<i-c>Deafening Silence</i-c>", "Each player casts at most one noncreature spell per turn", "Storm and spell-chain decks"],
        ["<i-c>Linvala, Keeper of Silence</i-c>", "Their creatures' activated abilities can't be activated", "Dorks, creature combos, sacrifice outlets"],
        ["<i-c>Aven Mindcensor</i-c>", "Their library searches only see the top four cards", "Tutors and fetchlands. It has flash."],
        ["<i-c>Archivist of Oghma</i-c>", "You gain 1 life and draw each time they search", "Tutor-heavy tables. It has flash."]
      ] },
      { t: "callout", tone: "warn", title: "Deafening Silence hits you too", html: "It's symmetric. You can still cast any number of creatures and use abilities, so the combos are fine. But <i-c>Chrome Mox</i-c> then <i-c>Sol Ring</i-c> is two noncreature spells, and so is a tutor plus <i-c>Natural Order</i-c>. Play your fast mana before it, or skip it on explosive turns." },
      { t: "callout", tone: "tip", title: "Archivist pairs with your lifegain", html: "Each life gained from <i-c>Archivist of Oghma</i-c> triggers <i-c>Archangel of Thune</i-c> and <i-c>Heliod, Sun-Crowned</i-c>. An opponent cracking a fetchland can grow your team." },
      { t: "h", text: "What to deploy first" },
      { t: "list", items: [
        "<b>Removal-heavy table:</b> Shalai first, then combo pieces.",
        "<b>Fast combo table:</b> <i-c>Grand Abolisher</i-c>, <i-c>Drannith Magistrate</i-c> or <i-c>Deafening Silence</i-c> first. Shalai can wait a turn.",
        "<b>Counterspell table:</b> <i-c>Destiny Spinner</i-c> early, Cavern on the type you need, <i-c>Veil of Summer</i-c> held for the combo turn.",
        "<b>Wipe table:</b> hold <i-c>Teferi's Protection</i-c> or <i-c>Flawless Maneuver</i-c> before you commit a big board."
      ] }
    ]
  },
  {
    id: "win-a-thune-feeder",
    title: "Win line A: Archangel and Feeder",
    kicker: "Combo A",
    minutes: 6,
    summary: "The exact clicks of Archangel of Thune plus Spike Feeder, with and without Walking Ballista, and how to use it in response to a wipe.",
    blocks: [
      { t: "cards", names: ["Archangel of Thune", "Spike Feeder"], caption: "Two cards, instant speed, no mana." },
      { t: "p", html: "<i-c>Archangel of Thune</i-c> says whenever you gain life, put a +1/+1 counter on each creature you control. <i-c>Spike Feeder</i-c> enters with two +1/+1 counters and says remove a +1/+1 counter: you gain 2 life." },
      { t: "h", text: "The clicks" },
      { t: "steps", items: [
        { title: "Remove a counter from Feeder", html: "It's the cost. Feeder goes from 2/2 to 1/1. The ability goes on the stack." },
        { title: "Gain 2 life", html: "The ability resolves. You gain 2." },
        { title: "Archangel triggers", html: "Put a +1/+1 counter on each creature you control. Feeder is back to 2/2, and everything else is one counter bigger." },
        { title: "Repeat", html: "Do it as many times as you want. Each loop: +2 life, +1 counter on every other creature." }
      ] },
      { t: "callout", tone: "key", title: "No mana, no tapping", html: "Feeder's ability has no {T} and no mana cost, and Archangel's trigger is free. Both can be summoning sick. It works on any player's turn, at any moment you have priority." },
      { t: "callout", tone: "warn", title: "Never remove Feeder's last counter", html: "If Feeder is at one counter and you remove it, Feeder is 0/0 and dies before the life gain resolves. Archangel's counter then has no Feeder to land on. Start each loop with Feeder at 2 or more." },
      { t: "h", text: "With Walking Ballista" },
      { t: "p", html: "Ballista gets a counter every loop too. Loop until it has enough, then remove counters one at a time: each one deals 1 damage to any target. Three opponents at 40 is 120 counters. Opponents can't target Ballista thanks to Shalai, so there's little they can do in the middle." },
      { t: "cards", names: ["Walking Ballista"], caption: "The cleanest outlet." },
      { t: "h", text: "Without Ballista" },
      { t: "list", items: [
        "Loop until your creatures are huge and you're at a giant life total. Then attack.",
        "A huge flying Shalai and a huge flying Archangel are hard to block.",
        "<i-c>Kutzil, Malamet Exemplar</i-c> draws you a card when boosted creatures connect.",
        "Opponents can still chump block or fog. It wins most games but isn't instant. If you can, find Ballista first."
      ] },
      { t: "h", text: "In response to a wipe" },
      { t: "p", html: "Because it's instant speed, the combo is a great answer to a wipe." },
      { t: "list", items: [
        "<b>Ballista on board:</b> loop and ping every opponent out while the wipe is still on the stack. You win before it resolves.",
        "<b>-X/-X wipe like Toxic Deluge:</b> X is already chosen. Loop until your creatures' toughness is higher than X. They survive.",
        "<b>Destroy or exile wipe, no Ballista:</b> the creatures die, but you keep the giant life total. Better: cast <i-c>Flawless Maneuver</i-c> first to make them indestructible, then loop."
      ] },
      { t: "h", text: "Getting the pieces" },
      { t: "list", items: [
        "<i-c>Chord of Calling</i-c> for Feeder at instant speed (X=3) when Archangel is already out. Feeder enters with its two counters even when it's not cast.",
        "<i-c>Green Sun's Zenith</i-c> or <i-c>Summoner's Pact</i-c> can find Feeder, which is green. They can't find Archangel, which is white.",
        "<i-c>Chord of Calling</i-c> or <i-c>Finale of Devastation</i-c> with X=5 for Archangel."
      ] },
      { t: "widget", id: "comboFinder" },
      { t: "callout", tone: "tip", title: "Fair-game Archangel", html: "Archangel has lifelink. If it connects in combat you gain life, and each creature gets a counter. Combined with Kutzil's draw trigger, a lone Archangel can carry a game." }
    ]
  },
  {
    id: "win-b-d-heliod",
    title: "Win lines B and D: Heliod",
    kicker: "Combos B and D",
    minutes: 6,
    summary: "Heliod plus Walking Ballista for infinite damage, Heliod plus Spike Feeder for infinite life.",
    blocks: [
      { t: "cards", names: ["Heliod, Sun-Crowned", "Walking Ballista", "Spike Feeder"], caption: "One god, two partners." },
      { t: "p", html: "<i-c>Heliod, Sun-Crowned</i-c> costs {2}{W} and has two abilities you care about: whenever you gain life, put a +1/+1 counter on target creature or enchantment you control. And {1}{W}: another target creature gains lifelink until end of turn." },
      { t: "callout", tone: "key", title: "Heliod doesn't need to be a creature", html: "With less than five devotion to white, Heliod is just an indestructible enchantment. Its trigger and its lifelink ability work anyway. Most games it stays a noncreature enchantment, which makes it hard to remove." },
      { t: "h", text: "Line B: Heliod and Walking Ballista" },
      { t: "steps", items: [
        { title: "Ballista has two or more counters", html: "Cast it with X=2 for {4}, or X=1 and add a counter with Ballista's own {4}, Shalai's {4}{G}{G}, <i-c>Gavony Township</i-c>, or Spike Feeder's {2} ability." },
        { title: "Pay {1}{W}", html: "Heliod gives Ballista lifelink until end of turn. You can target it: Shalai's hexproof only stops opponents." },
        { title: "Remove a counter", html: "Ballista deals 1 damage to any target. Lifelink: you gain 1." },
        { title: "Heliod triggers", html: "Target Ballista. It gets the counter back." },
        { title: "Repeat", html: "Each loop deals 1 damage and costs nothing. Ping each opponent 40 times." }
      ] },
      { t: "callout", tone: "warn", title: "Why two counters", html: "With one counter, removing it makes Ballista a 0/0. It dies before the damage resolves. You still gain the life, but Heliod's trigger has no Ballista to target. The loop stops after one ping." },
      { t: "callout", tone: "warn", title: "No Greaves on Ballista", html: "Shroud stops Heliod's trigger and Heliod's lifelink ability from targeting it. Keep <i-c>Lightning Greaves</i-c> on something else." },
      { t: "p", html: "Ballista's ability has no {T}, so summoning sickness doesn't matter. Heliod's lifelink ability is instant speed, so with {1}{W} open you can also fire this in response to a wipe." },
      { t: "h", text: "Line D: Heliod and Spike Feeder" },
      { t: "steps", items: [
        { title: "Remove a counter from Feeder", html: "You gain 2 life." },
        { title: "Heliod triggers", html: "Target Feeder. The counter comes back." },
        { title: "Repeat", html: "Infinite life. No mana needed." }
      ] },
      { t: "p", html: "Infinite life doesn't win on its own. It blanks damage and life-loss plans, and with Archangel of Thune or Ballista also out it becomes a full win. Treat it as a backup." },
      { t: "h", text: "Finding Heliod" },
      { t: "list", items: [
        "<i-c>Enlightened Tutor</i-c> finds it, because it's an enchantment.",
        "Creature tutors find it, because it's a creature card in your library: <i-c>Worldly Tutor</i-c>, <i-c>Eladamri's Call</i-c>, <i-c>Survival of the Fittest</i-c>, <i-c>Formidable Speaker</i-c>, <i-c>Archdruid's Charm</i-c>, <i-c>Chord of Calling</i-c> or <i-c>Finale of Devastation</i-c> with X=3.",
        "Not <i-c>Green Sun's Zenith</i-c>, <i-c>Summoner's Pact</i-c> or <i-c>Natural Order</i-c>. Heliod is white.",
        "Not <i-c>Recruiter of the Guard</i-c> (toughness 5) or <i-c>Ranger-Captain of Eos</i-c> (mana value 3)."
      ] },
      { t: "h", text: "Finding Ballista" },
      { t: "list", items: [
        "<i-c>Ranger-Captain of Eos</i-c>, <i-c>Recruiter of the Guard</i-c> and <i-c>Brightglass Gearhulk</i-c> all reach it, plus <i-c>Enlightened Tutor</i-c> (it's an artifact) and every \"any creature\" tutor.",
        "Never with <i-c>Chord of Calling</i-c>, <i-c>Finale of Devastation</i-c> or <i-c>Green Sun's Zenith</i-c>. A Ballista put onto the battlefield without being cast enters with zero counters and dies. GSZ can't find it anyway: it isn't green."
      ] }
    ]
  },
  {
    id: "win-c-druid-vizier",
    title: "Win line C: Druid and Vizier",
    kicker: "Combo C",
    minutes: 6,
    summary: "Devoted Druid plus Vizier of Remedies for infinite green mana, and what to spend it on.",
    blocks: [
      { t: "cards", names: ["Devoted Druid", "Vizier of Remedies"], caption: "Infinite green mana." },
      { t: "p", html: "<i-c>Devoted Druid</i-c> is a 0/2 that taps for {G} and has \"Put a -1/-1 counter on Devoted Druid: Untap Devoted Druid.\" <i-c>Vizier of Remedies</i-c> says that when -1/-1 counters would be put on your creature, one fewer is put on it." },
      { t: "h", text: "The clicks" },
      { t: "steps", items: [
        { title: "Tap the Druid", html: "Add {G}." },
        { title: "Untap it", html: "The cost is one -1/-1 counter. Vizier makes it zero. The Druid stays a 0/2." },
        { title: "Repeat", html: "As much green mana as you want." }
      ] },
      { t: "callout", tone: "warn", title: "The Druid can't be summoning sick", html: "Tapping for mana needs {T}, so the Druid must have been under your control since your turn began. The untap ability has no {T}, but you need the tap to make mana. Cast the Druid a turn early as a mana dork, or give it haste with <i-c>Lightning Greaves</i-c> (equip {0}). Vizier can be cast the same turn: its ability is static." },
      { t: "callout", tone: "tip", title: "Druid on its own", html: "Without Vizier, the Druid can untap once safely: 0/2 becomes 0/1, and you get {G}{G} that turn. The counter stays, so the next untap kills it." },
      { t: "h", text: "Spending infinite green" },
      { t: "table", head: ["Outlet", "Cost", "Result"], rows: [
        ["<i-c>Walking Ballista</i-c>", "Cast with huge X, or {4} per counter", "Infinite damage. Ping everyone out. This is the clean kill."],
        ["<i-c>Shalai, Voice of Plenty</i-c>", "{4}{G}{G} per activation", "Every creature you control as big as you like. Then attack."],
        ["<i-c>Finale of Devastation</i-c>", "{X}{G}{G} with X 10 or more", "Fetch <i-c>Craterhoof Behemoth</i-c>. Every creature gets +X/+X and haste, then Hoof adds trample and more."]
      ] },
      { t: "p", html: "Ballista's {X}{X} and {4} are generic costs, so green mana pays them. Shalai's ability asks for {G}{G}, which the Druid makes anyway." },
      { t: "callout", tone: "key", title: "Finale is the backup outlet", html: "If Ballista isn't available, cast <i-c>Finale of Devastation</i-c> for a big X. It's a sorcery, so do it in your main phase. Pick <i-c>Craterhoof Behemoth</i-c>. Finale's +X/+X and haste mean even creatures you just cast can attack. Don't fetch Ballista with Finale: it would enter with zero counters." },
      { t: "h", text: "Other uses for the mana" },
      { t: "list", items: [
        "Cast every green creature in your hand, and tutor as often as you like with <i-c>Survival of the Fittest</i-c> ({G} each).",
        "With <i-c>Badgermole Cub</i-c> out, each Druid tap makes {G}{G}. Not needed for the loop, but nice without Vizier.",
        "The mana is green only. White costs, like Heliod's {1}{W}, still need a white source."
      ] },
      { t: "h", text: "Finding the pieces" },
      { t: "list", items: [
        "Both: <i-c>Recruiter of the Guard</i-c> (toughness 2 and 1), <i-c>Chord of Calling</i-c> X=2, <i-c>Finale of Devastation</i-c> X=2, and every \"any creature\" tutor.",
        "Druid only: <i-c>Green Sun's Zenith</i-c> X=2 and <i-c>Summoner's Pact</i-c>. Vizier is white.",
        "Not <i-c>Ranger-Captain of Eos</i-c>: both have mana value 2."
      ] }
    ]
  },
  {
    id: "natural-order",
    title: "Natural Order, Craterhoof and Vorinclex",
    kicker: "Win line E",
    minutes: 7,
    summary: "How Natural Order works, the real Craterhoof math at a 40-life table, and when Vorinclex is the better pick.",
    blocks: [
      { t: "cards", names: ["Natural Order", "Craterhoof Behemoth", "Vorinclex, Voice of Hunger"], caption: "An eight-drop for four mana." },
      { t: "p", html: "<i-c>Natural Order</i-c> costs {2}{G}{G}. As an extra cost, sacrifice a green creature. Then search for a green creature card and put it onto the battlefield. It's a sorcery." },
      { t: "h", text: "What to sacrifice" },
      { t: "list", items: [
        "A spent mana dork, like <i-c>Llanowar Elves</i-c>.",
        "<i-c>Dryad Arbor</i-c>, which is a green creature. You lose a land, but keep your creature count.",
        "Not Shalai: she's white. Not <i-c>Vizier of Remedies</i-c> or <i-c>Archangel of Thune</i-c>: also white."
      ] },
      { t: "h", text: "Craterhoof Behemoth" },
      { t: "p", html: "<i-c>Craterhoof Behemoth</i-c> has haste. When it enters, your creatures gain trample and get +X/+X until end of turn, where X is the number of creatures you control." },
      { t: "p", html: "With N creatures attacking, the damage is about N times N, plus their base power. Opponents start at 40, so 120 for the table." },
      { t: "math", items: [
        { label: "Board: <i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Birds of Paradise</i-c>, <i-c>Avacyn's Pilgrim</i-c>, <i-c>Devoted Druid</i-c>, <i-c>Destiny Spinner</i-c>, <i-c>Shalai, Voice of Plenty</i-c>", value: "7 creatures" },
        { label: "Sacrifice Birds to Natural Order, Hoof enters", value: "7 creatures, X = 7" },
        { label: "Base power: 1 + 1 + 1 + 0 + 2 + 3 + 5", value: "13" },
        { label: "Bonus: 7 attackers x 7", value: "49" }
      ], total: "About <b>62 trample damage</b>. That kills one opponent at 40 and hurts a second. It does not kill the table." },
      { t: "math", items: [
        { label: "6 to 7 attackers", value: "kills one player at 40" },
        { label: "10 to 11 attackers", value: "kills a full table of three at 40" },
        { label: "Seven creatures again, Hoof included, but Hoof came from <i-c>Finale of Devastation</i-c> with X=10", value: "+10 and +7 = +17 each" },
        { label: "7 attackers x 17, plus 13 base power", value: "132" }
      ], total: "Finale with X 10 or more turns Hoof into a table kill. That needs 12 mana, so it's an infinite-mana or big-Cradle line." },
      { t: "widget", id: "hoofCalc" },
      { t: "callout", tone: "warn", title: "Summoning-sick creatures count but can't attack", html: "Hoof counts every creature you control for X, and Hoof itself has haste. But creatures you cast this turn can't attack unless something gives them haste. <i-c>Finale of Devastation</i-c> with X 10 or more does." },
      { t: "callout", tone: "tip", title: "Blockers soak damage", html: "Trample means a blocker only absorbs damage equal to its toughness. Still, subtract a bit for blockers. Attack the player with fewest blockers or the lowest life." },
      { t: "p", html: "So Natural Order into Hoof is a \"kill one player\" or \"finish a weakened table\" line, not an automatic win from 40 each." },
      { t: "h", text: "Vorinclex, Voice of Hunger" },
      { t: "p", html: "<i-c>Vorinclex, Voice of Hunger</i-c> is a 7/6 trampler. Your lands make double mana. Each land an opponent taps for mana doesn't untap during their next untap step." },
      { t: "list", items: [
        "It's a soft lock: opponents either stop using their lands or fall a turn behind each time they do.",
        "Your doubled mana pays for Shalai activations, <i-c>Finale of Devastation</i-c> and <i-c>Gavony Township</i-c>.",
        "Pick it over Hoof when the table is at high life, when you can't kill anyone this turn, or when you want to stop a faster deck.",
        "It's close to land denial. Say so in the pregame talk."
      ] },
      { t: "h", text: "Natural Order as a tutor" },
      { t: "p", html: "Natural Order finds any green creature, not only eight-drops. With <i-c>Archangel of Thune</i-c> or <i-c>Heliod, Sun-Crowned</i-c> already out, Natural Order for <i-c>Spike Feeder</i-c> wins on the spot. It can't find Archangel, Heliod, Vizier or Ballista." },
      { t: "h", text: "Other ways to Hoof" },
      { t: "list", items: [
        "<i-c>Green Sun's Zenith</i-c> with X=8 (nine mana).",
        "<i-c>Chord of Calling</i-c> with X=8. Convoke helps a lot with a big board.",
        "<i-c>Finale of Devastation</i-c> with X=8, or 10 for the extra bonus and haste.",
        "<i-c>Summoner's Pact</i-c> to hand, then you still need eight mana. Rarely right."
      ] }
    ]
  },
  {
    id: "tutor-map",
    title: "The tutor map",
    kicker: "Finding pieces",
    minutes: 8,
    summary: "Which tutor finds which piece, and how to pick the right one.",
    blocks: [
      { t: "p", html: "This deck plays like it has five copies of each combo piece. Learning which tutor reaches which card is the biggest skill gap between an okay pilot and a great one." },
      { t: "table", head: ["Piece", "Found by", "Not by"], rows: [
        ["<i-c>Walking Ballista</i-c>", "Enlightened, Eladamri's, Worldly, Recruiter, Ranger-Captain, Gearhulk, Speaker, Survival, Archdruid's Charm", "Chord, Finale (0 counters, dies), GSZ, Pact, Natural Order (not green)"],
        ["<i-c>Heliod, Sun-Crowned</i-c>", "Enlightened, Eladamri's, Worldly, Chord X=3, Finale X=3, Speaker, Survival, Archdruid's Charm", "GSZ, Pact, Natural Order (white), Recruiter (toughness 5), Ranger-Captain"],
        ["<i-c>Spike Feeder</i-c>", "GSZ X=3, Chord X=3, Finale X=3, Eladamri's, Pact, Recruiter, Archdruid's Charm, Worldly, Speaker, Survival, Natural Order", "Enlightened, Ranger-Captain (mana value 3)"],
        ["<i-c>Archangel of Thune</i-c>", "Chord X=5, Finale X=5, Eladamri's, Archdruid's Charm, Worldly, Speaker, Survival", "GSZ, Pact, Natural Order (white), Recruiter (toughness 4)"],
        ["<i-c>Devoted Druid</i-c>", "Chord X=2, Finale X=2, GSZ X=2, Pact, Eladamri's, Recruiter, Archdruid's Charm, Worldly, Speaker, Survival", "Enlightened, Ranger-Captain"],
        ["<i-c>Vizier of Remedies</i-c>", "Chord X=2, Finale X=2, Eladamri's, Recruiter, Archdruid's Charm, Worldly, Speaker, Survival", "GSZ, Pact, Natural Order (white), Ranger-Captain"],
        ["<i-c>Craterhoof Behemoth</i-c>, <i-c>Vorinclex, Voice of Hunger</i-c>", "Natural Order, GSZ X=8, Chord X=8, Finale X=8, Pact, Eladamri's, Worldly, Speaker, Survival, Archdruid's Charm", "Recruiter, Ranger-Captain, Enlightened"]
      ] },
      { t: "widget", id: "tutorMap" },
      { t: "h", text: "Where the card goes" },
      { t: "table", head: ["Destination", "Tutors", "Use when"], rows: [
        ["Top of library", "<i-c>Worldly Tutor</i-c>, <i-c>Enlightened Tutor</i-c>", "You're fine waiting a turn. Cast at the end of the previous player's turn and draw it next. With <i-c>Sylvan Library</i-c> or <i-c>The One Ring</i-c> you can draw it sooner."],
        ["Hand", "<i-c>Eladamri's Call</i-c>, <i-c>Summoner's Pact</i-c>, <i-c>Archdruid's Charm</i-c>, <i-c>Survival of the Fittest</i-c>, <i-c>Recruiter of the Guard</i-c>, <i-c>Ranger-Captain of Eos</i-c>, <i-c>Formidable Speaker</i-c>, <i-c>Brightglass Gearhulk</i-c>", "You have the mana to cast the piece this turn."],
        ["Battlefield", "<i-c>Chord of Calling</i-c>, <i-c>Green Sun's Zenith</i-c>, <i-c>Finale of Devastation</i-c>, <i-c>Natural Order</i-c>, <i-c>Crop Rotation</i-c>, <i-c>Urza's Saga</i-c>", "The piece needs to be in play now, or you want to skip its mana cost or dodge counterspells on the creature."]
      ] },
      { t: "h", text: "Speed" },
      { t: "list", items: [
        "<b>Instants:</b> <i-c>Worldly Tutor</i-c>, <i-c>Enlightened Tutor</i-c>, <i-c>Crop Rotation</i-c>, <i-c>Eladamri's Call</i-c>, <i-c>Chord of Calling</i-c>, <i-c>Summoner's Pact</i-c>, <i-c>Archdruid's Charm</i-c>. <i-c>Survival of the Fittest</i-c>'s ability is also instant speed.",
        "<b>Sorceries:</b> <i-c>Natural Order</i-c>, <i-c>Green Sun's Zenith</i-c>, <i-c>Finale of Devastation</i-c>.",
        "<b>Creatures with an enters trigger:</b> <i-c>Recruiter of the Guard</i-c>, <i-c>Ranger-Captain of Eos</i-c>, <i-c>Formidable Speaker</i-c>, <i-c>Brightglass Gearhulk</i-c>. They're uncounterable with <i-c>Destiny Spinner</i-c> out, and they stay as bodies for <i-c>Gaea's Cradle</i-c>."
      ] },
      { t: "callout", tone: "key", title: "Three tutors need green", html: "<i-c>Green Sun's Zenith</i-c>, <i-c>Summoner's Pact</i-c> and <i-c>Natural Order</i-c> only find green creatures. In the combos that's <i-c>Spike Feeder</i-c> and <i-c>Devoted Druid</i-c>. They can't find Archangel, Heliod, Vizier or Ballista." },
      { t: "h", text: "The small-creature tutors" },
      { t: "list", items: [
        "<i-c>Recruiter of the Guard</i-c>: toughness 2 or less. Ballista, Feeder, Druid, Vizier, Grand Abolisher, Thalia, Aven Mindcensor, Esper Sentinel, Archivist, Giver, Solitude, Eternal Witness, Badgermole Cub, the dorks. Not Kutzil, Drannith or Voice of Victory: they have toughness 3.",
        "<i-c>Ranger-Captain of Eos</i-c>: mana value 1 or less. Ballista, the one-mana dorks, Giver, Esper Sentinel, <i-c>Dryad Arbor</i-c>.",
        "<i-c>Brightglass Gearhulk</i-c>: up to two artifact, creature or enchantment cards with mana value 1 or less. Ballista plus <i-c>Sol Ring</i-c>, or Ballista plus <i-c>Deafening Silence</i-c>. It costs {G}{G}{W}{W}."
      ] },
      { t: "h", text: "Enlightened Tutor finds more than you think" },
      { t: "p", html: "Any artifact or enchantment card: <i-c>Walking Ballista</i-c>, <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Destiny Spinner</i-c>, <i-c>Esper Sentinel</i-c>, <i-c>Brightglass Gearhulk</i-c>, <i-c>Survival of the Fittest</i-c>, <i-c>Lightning Greaves</i-c>, <i-c>The One Ring</i-c>, every rock, and even <i-c>Urza's Saga</i-c>, which is an enchantment land." },
      { t: "h", text: "Choosing a tutor" },
      { t: "steps", items: [
        { title: "What's missing?", html: "Look at the table above. Some tutors can't reach the piece." },
        { title: "When do you need it?", html: "Winning this turn: hand or battlefield tutor. Next turn: Worldly or Enlightened at the end of the previous turn is cheapest." },
        { title: "Is there removal or a counterspell up?", html: "Battlefield tutors skip casting the creature, so creature counterspells miss. The tutor itself can still be countered." },
        { title: "Save the flexible ones", html: "Spend the narrow tutor first. Use <i-c>Recruiter of the Guard</i-c> for Ballista and keep <i-c>Eladamri's Call</i-c> for whatever's next." }
      ] },
      { t: "callout", tone: "warn", title: "Summoner's Pact has a bill", html: "Next upkeep, pay {2}{G}{G} or lose the game. Cast it only if you can pay that, or if you win this turn. More in chapter 11." }
    ]
  },
  {
    id: "mana",
    title: "Mana",
    kicker: "Fast mana and lands",
    minutes: 7,
    summary: "Fast mana, the dorks, the land base, what each fetchland finds, Gemstone Caverns, Urza's Saga and Cavern of Souls.",
    blocks: [
      { t: "h", text: "Fast mana" },
      { t: "cards", names: ["Sol Ring", "Mana Vault", "Grim Monolith", "Chrome Mox", "Mox Diamond", "Lotus Petal"], caption: "The rocks." },
      { t: "table", head: ["Rock", "Cost", "Notes"], rows: [
        ["<i-c>Sol Ring</i-c>", "{1}", "{C}{C} every turn"],
        ["<i-c>Mana Vault</i-c>", "{1}", "{C}{C}{C} once. Doesn't untap normally. Deals 1 damage in your draw step while tapped. Pay {4} in upkeep to untap."],
        ["<i-c>Grim Monolith</i-c>", "{2}", "{C}{C}{C} once. {4} to untap."],
        ["<i-c>Chrome Mox</i-c>", "{0}", "Exile a nonartifact, nonland card from hand. Taps for that card's color."],
        ["<i-c>Mox Diamond</i-c>", "{0}", "Discard a land as it enters. Any color."],
        ["<i-c>Lotus Petal</i-c>", "{0}", "Sacrifice for one mana of any color"]
      ] },
      { t: "p", html: "The deck is creature-heavy, so most fast mana goes into Shalai, Archangel or a tutor plus a piece. Colorless mana is fine for Ballista and the generic parts of costs, but count your {G} and {W} carefully." },
      { t: "h", text: "The dorks" },
      { t: "cards", names: ["Llanowar Elves", "Elvish Mystic", "Fyndhorn Elves", "Birds of Paradise", "Avacyn's Pilgrim", "Delighted Halfling", "Badgermole Cub", "Elvish Spirit Guide"], caption: "Creatures that make mana." },
      { t: "list", items: [
        "<i-c>Llanowar Elves</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Fyndhorn Elves</i-c>: {G}.",
        "<i-c>Birds of Paradise</i-c>: any color.",
        "<i-c>Avacyn's Pilgrim</i-c>: {W}. Your best way to cast white cards off a Forest.",
        "<i-c>Delighted Halfling</i-c>: {C}, or any color for a legendary spell, which then can't be countered.",
        "<i-c>Badgermole Cub</i-c>: whenever you tap a creature for mana, add an extra {G}. Its earthbend can turn <i-c>Gaea's Cradle</i-c> into a creature with haste.",
        "<i-c>Elvish Spirit Guide</i-c>: exile it from your hand for {G}. Free, instant speed, and it works through any silence effect."
      ] },
      { t: "callout", tone: "tip", title: "Cradle and the Cub", html: "Earthbend <i-c>Gaea's Cradle</i-c> with <i-c>Badgermole Cub</i-c>. It becomes a creature with haste, gets Shalai's hexproof, and counts itself for its own mana. Tapping it is tapping a creature for mana, so the Cub adds another {G}. If it dies, it comes back tapped." },
      { t: "h", text: "The lands" },
      { t: "table", head: ["Land", "Untapped when"], rows: [
        ["<i-c>Savannah</i-c>", "Always. Forest Plains."],
        ["<i-c>Temple Garden</i-c>", "You pay 2 life. Forest Plains."],
        ["<i-c>Canopy Vista</i-c>", "You control two or more basic lands. Forest Plains."],
        ["<i-c>Sunpetal Grove</i-c>", "You control a Forest or a Plains (a typed dual counts)"],
        ["<i-c>Bountiful Promenade</i-c>", "You have two or more opponents: always in Commander"],
        ["<i-c>Razorverge Thicket</i-c>", "You control two or fewer other lands: early"],
        ["<i-c>Hushwood Verge</i-c>", "Always for {G}. {W} only if you control a Forest or Plains."],
        ["<i-c>Branchloft Pathway</i-c>", "Always. Choose the {G} face or the {W} face when you play it."],
        ["<i-c>Brushland</i-c>, <i-c>Horizon Canopy</i-c>", "Always. Colored mana costs 1 life."]
      ] },
      { t: "h", text: "Fetchland targets" },
      { t: "p", html: "The fetches only find cards with the right land type. Here's exactly what each one can get." },
      { t: "table", head: ["Fetch", "Finds"], rows: [
        ["<i-c>Windswept Heath</i-c>", "Forest or Plains: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c>, <i-c>Forest</i-c>, <i-c>Plains</i-c>"],
        ["<i-c>Wooded Foothills</i-c>, <i-c>Misty Rainforest</i-c>", "Forest only: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Dryad Arbor</i-c>, <i-c>Forest</i-c>"],
        ["<i-c>Flooded Strand</i-c>, <i-c>Marsh Flats</i-c>", "Plains only: <i-c>Savannah</i-c>, <i-c>Temple Garden</i-c>, <i-c>Canopy Vista</i-c>, <i-c>Plains</i-c>"]
      ] },
      { t: "callout", tone: "tip", title: "Default fetch: Savannah", html: "It's untapped, costs no life and makes both colors. Get <i-c>Temple Garden</i-c> second. Fetch a basic when you want <i-c>Canopy Vista</i-c> untapped later. <i-c>Nature's Lore</i-c> finds any Forest card the same way, untapped." },
      { t: "callout", tone: "tip", title: "Fetching Dryad Arbor", html: "<i-c>Dryad Arbor</i-c> is a green land creature. It adds a creature for <i-c>Gaea's Cradle</i-c> and is perfect fodder for <i-c>Natural Order</i-c>. It's summoning sick the turn it arrives, so it can't tap for mana that turn." },
      { t: "h", text: "The special lands" },
      { t: "cards", names: ["Gaea's Cradle", "Ancient Tomb", "Gemstone Caverns", "Urza's Saga", "Cavern of Souls"], caption: "Lands that do more." },
      { t: "list", items: [
        "<i-c>Gaea's Cradle</i-c>: {G} for each creature you control. With three dorks out it's three mana. <i-c>Crop Rotation</i-c> can fetch it at instant speed.",
        "<i-c>Ancient Tomb</i-c>: {C}{C}, and 2 damage to you.",
        "<i-c>Gemstone Caverns</i-c>: only from your opening hand, and only when you're <b>not</b> the starting player. Then it starts on the battlefield with a luck counter and taps for any color. You exile a card from your hand to do it. Otherwise it's a land that makes {C}.",
        "<i-c>Urza's Saga</i-c>: chapter I taps for {C}. Chapter II makes Construct tokens. Chapter III searches for an artifact with mana cost {0} or {1}: <i-c>Chrome Mox</i-c>, <i-c>Mox Diamond</i-c>, <i-c>Lotus Petal</i-c>, <i-c>Sol Ring</i-c>, <i-c>Mana Vault</i-c> or <i-c>Skullclamp</i-c>. Not <i-c>Walking Ballista</i-c>: its cost is {X}{X}. Then the Saga is sacrificed.",
        "<i-c>Boseiju, Who Endures</i-c> and <i-c>Eiganjo, Seat of the Empire</i-c>: lands that double as removal. Their channel costs {1} less per legendary creature you control."
      ] },
      { t: "h", text: "Naming a type for Cavern of Souls" },
      { t: "table", head: ["Type", "Covers", "Name it when"], rows: [
        ["Human", "<i-c>Vizier of Remedies</i-c>, <i-c>Grand Abolisher</i-c>, <i-c>Recruiter of the Guard</i-c>, <i-c>Ranger-Captain of Eos</i-c>, <i-c>Destiny Spinner</i-c>, <i-c>Thalia, Heretic Cathar</i-c>, <i-c>Drannith Magistrate</i-c> and more", "Default. Most of your hatebears and tutors on bodies."],
        ["Angel", "<i-c>Shalai, Voice of Plenty</i-c>, <i-c>Archangel of Thune</i-c>, <i-c>Linvala, Keeper of Silence</i-c>", "Blue table and Shalai keeps getting countered, or Archangel is your missing piece"],
        ["Elf", "<i-c>Devoted Druid</i-c>, <i-c>Formidable Speaker</i-c>, the Elves", "You're on the Druid line"],
        ["Spike", "<i-c>Spike Feeder</i-c>", "Archangel or Heliod is out and Feeder is the last piece"]
      ] },
      { t: "p", html: "Cavern only helps creature spells. Tutors, Silence and rocks still need other protection, like <i-c>Veil of Summer</i-c>." }
    ]
  },
  {
    id: "mulligans",
    title: "Mulligans and opening hands",
    kicker: "Keep or ship",
    minutes: 6,
    summary: "What a keepable hand looks like, with example keeps and mulligans.",
    blocks: [
      { t: "callout", tone: "key", title: "The rule", html: "Keep a hand with at least two mana sources, one of them a land, plus either Shalai castable by turn 3, a tutor, or a combo piece. A hand of only lands and dorks is a mulligan at this power level." },
      { t: "h", text: "Keeps" },
      { t: "list", items: [
        "<b>Keep.</b> <i-c>Savannah</i-c>, <i-c>Plains</i-c>, <i-c>Llanowar Elves</i-c>, <i-c>Sol Ring</i-c>, <i-c>Worldly Tutor</i-c>, <i-c>Archangel of Thune</i-c>, <i-c>Swords to Plowshares</i-c>. Shalai on turn 2, Archangel on turn 3, Worldly finds <i-c>Spike Feeder</i-c>.",
        "<b>Keep.</b> <i-c>Windswept Heath</i-c>, <i-c>Gaea's Cradle</i-c>, <i-c>Birds of Paradise</i-c>, <i-c>Avacyn's Pilgrim</i-c>, <i-c>Recruiter of the Guard</i-c>, <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Grand Abolisher</i-c>. Recruiter gets <i-c>Walking Ballista</i-c>. Cradle is weak alone, but with two dorks out it's a lot of mana.",
        "<b>Keep.</b> <i-c>Temple Garden</i-c>, <i-c>Forest</i-c>, <i-c>Mox Diamond</i-c>, <i-c>Devoted Druid</i-c>, <i-c>Eladamri's Call</i-c>, <i-c>Walking Ballista</i-c>, <i-c>Silence</i-c>. Diamond discards the Forest, so the Druid comes down on turn 1. On turn 2, the Druid's one safe untap plus Garden and Diamond pays for Eladamri's Call (for <i-c>Vizier of Remedies</i-c>) and Vizier. Infinite green, then a huge Ballista.",
        "<b>Keep.</b> <i-c>Bountiful Promenade</i-c>, <i-c>Ancient Tomb</i-c>, <i-c>Elvish Mystic</i-c>, <i-c>Natural Order</i-c>, <i-c>Sylvan Library</i-c>, <i-c>Teferi's Protection</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c>. On turn 2, tap Mystic for mana, then sacrifice it to <i-c>Natural Order</i-c> for <i-c>Vorinclex, Voice of Hunger</i-c>. Library digs for more."
      ] },
      { t: "h", text: "Mulligans" },
      { t: "list", items: [
        "<b>Ship.</b> <i-c>Forest</i-c>, <i-c>Savannah</i-c>, <i-c>Brushland</i-c>, <i-c>Llanowar Elves</i-c>, <i-c>Fyndhorn Elves</i-c>, <i-c>Birds of Paradise</i-c>, <i-c>Elvish Mystic</i-c>. Lots of mana, nothing to do with it.",
        "<b>Ship.</b> <i-c>Chrome Mox</i-c>, <i-c>Lotus Petal</i-c>, <i-c>Birds of Paradise</i-c>, <i-c>Walking Ballista</i-c>, <i-c>Heliod, Sun-Crowned</i-c>, <i-c>Enlightened Tutor</i-c>, <i-c>Silence</i-c>. No land. One-shot mana runs out on turn 1.",
        "<b>Ship.</b> <i-c>Plains</i-c>, <i-c>Archangel of Thune</i-c>, <i-c>Craterhoof Behemoth</i-c>, <i-c>Solitude</i-c>, <i-c>Generous Gift</i-c>, <i-c>Smothering Tithe</i-c>, <i-c>Reprieve</i-c>. One source and expensive cards.",
        "<b>Usually ship.</b> <i-c>Gemstone Caverns</i-c>, <i-c>Urza's Saga</i-c>, <i-c>Spike Feeder</i-c>, <i-c>Archangel of Thune</i-c>, <i-c>Orim's Chant</i-c>, <i-c>Path to Exile</i-c>, <i-c>Force of Vigor</i-c>. If you're on the play, Caverns is a colorless land and the hand is too slow. On the draw it's a closer call."
      ] },
      { t: "h", text: "Gemstone Caverns in the opener" },
      { t: "p", html: "If you're not the starting player, you may put <i-c>Gemstone Caverns</i-c> onto the battlefield before the game starts, with a luck counter, by exiling a card from your hand. That's a free extra land that taps for any color. Exile your worst card: a spare removal spell or a dead late-game card." },
      { t: "h", text: "What to look for" },
      { t: "list", items: [
        "Both colors by turn 2. White matters for Shalai, Silence and the hatebears.",
        "A turn-1 play: a dork, a rock, <i-c>Sylvan Library</i-c> or <i-c>Esper Sentinel</i-c>.",
        "One protection or silence card is a bonus, not a must.",
        "Free mulligans depend on your group. Ask before the game."
      ] }
    ]
  },
  {
    id: "turn-by-turn",
    title: "Turn by turn",
    kicker: "Sequencing",
    minutes: 8,
    summary: "Turns 1 to 3, the combo turn, Silence and Orim's Chant timing, Summoner's Pact upkeep, and Greaves for the Druid.",
    blocks: [
      { t: "h", text: "Turn 1 priorities" },
      { t: "steps", items: [
        { title: "A mana dork", html: "It's ready to tap on turn 2." },
        { title: "Sol Ring or a Mox", html: "Free or cheap acceleration." },
        { title: "Sylvan Library or Esper Sentinel", html: "Card advantage that starts working at once." }
      ] },
      { t: "h", text: "A sample start" },
      { t: "turns", items: [
        { turn: "T1", play: "<i-c>Savannah</i-c>, <i-c>Elvish Mystic</i-c>.", note: "Three mana next turn." },
        { turn: "T2", play: "<i-c>Plains</i-c>. <i-c>Sol Ring</i-c> off Savannah. Mystic, Plains and Sol Ring pay {3}{W}: <i-c>Shalai, Voice of Plenty</i-c>.", note: "The shield is up on turn 2." },
        { turn: "T3", play: "<i-c>Temple Garden</i-c>, paying 2 life. Six mana. <i-c>Spike Feeder</i-c> and <i-c>Grand Abolisher</i-c>.", note: "Feeder and a silence piece, both hexproof." },
        { turn: "T4", play: "<i-c>Archangel of Thune</i-c>. Opponents can't respond on your turn because of Abolisher. Loop Feeder.", note: "Infinite life, huge fliers. Attack." }
      ] },
      { t: "h", text: "The combo turn" },
      { t: "steps", items: [
        { title: "Count their answers", html: "Who has open mana? Who's playing blue? Is there a wipe deck?" },
        { title: "Lock the turn first", html: "With Abolisher, Kutzil or Voice of Victory out, you're set. Without one, cast <i-c>Silence</i-c> or sacrifice <i-c>Ranger-Captain of Eos</i-c> before the first combo piece." },
        { title: "Tutor, then piece", html: "Tutor for the missing piece and cast it. With Destiny Spinner or Cavern it can't be countered." },
        { title: "Run the loop", html: "Ballista outlets kill outright. Without Ballista, loop, then attack." }
      ] },
      { t: "h", text: "Silence and Orim's Chant: which turn?" },
      { t: "cards", names: ["Silence", "Orim's Chant"], caption: "One white mana each." },
      { t: "list", items: [
        "<b>Best:</b> in an opponent's upkeep on the turn they're about to win. They lose their whole turn of spells.",
        "<b>On your turn:</b> only if no Abolisher-type card is out. Cast it before your first combo piece, not in response to their answer: once they've cast the answer, it's too late.",
        "<b>Orim's Chant</b> targets one player. Use it when one opponent is the threat. Kicked for {W}{W}, creatures can't attack, which also means yours.",
        "<b>Both are instants.</b> Cast them before your combo, ideally in your upkeep or main phase before anything else."
      ] },
      { t: "callout", tone: "warn", title: "Silence vs abilities", html: "Silence doesn't stop activated abilities. An opponent can still sacrifice a creature, pop a rock, or channel a land in response. Check for those before you rely on it." },
      { t: "h", text: "Summoner's Pact" },
      { t: "cards", names: ["Summoner's Pact"], caption: "Free now. {2}{G}{G} next upkeep, or you lose." },
      { t: "list", items: [
        "Cast it only if you can pay {2}{G}{G} in your next upkeep, or if you're winning this turn.",
        "Best timing: the end of the opponent's turn before yours. Your lands and dorks untap first, then you pay in your upkeep.",
        "If you cast it in your own turn, you need four mana with {G}{G} ready next upkeep.",
        "Don't forget the trigger. Missing it loses the game."
      ] },
      { t: "h", text: "Devoted Druid timing" },
      { t: "list", items: [
        "Cast <i-c>Devoted Druid</i-c> a turn early as a mana dork. Next turn it's ready, and Vizier can come down and go off.",
        "Or cast <i-c>Lightning Greaves</i-c> and equip it to the Druid for {0}. Haste lets it tap right away.",
        "<i-c>Destiny Spinner</i-c> can animate a land, not the Druid. It's not a haste source for the combo."
      ] },
      { t: "h", text: "A second sample: the Druid turn" },
      { t: "turns", items: [
        { turn: "T1", play: "<i-c>Forest</i-c>, <i-c>Llanowar Elves</i-c>.", note: "" },
        { turn: "T2", play: "<i-c>Savannah</i-c>. <i-c>Devoted Druid</i-c>. One mana left over.", note: "Druid is summoning sick this turn." },
        { turn: "T3", play: "<i-c>Plains</i-c>. <i-c>Vizier of Remedies</i-c>. Druid now taps and untaps forever. Cast <i-c>Walking Ballista</i-c> with a huge X.", note: "Ping the table out." }
      ] },
      { t: "h", text: "When the combo isn't there" },
      { t: "list", items: [
        "Play the fair game. Shalai's {4}{G}{G}, <i-c>Gavony Township</i-c> and Archangel's lifelink grow the team. Kutzil draws.",
        "Use <i-c>Skullclamp</i-c> on dorks that have done their job.",
        "Cast <i-c>The One Ring</i-c> for a turn of protection, then use it to draw."
      ] }
    ]
  },
  {
    id: "reading-the-board",
    title: "Reading the board",
    kicker: "Decisions",
    minutes: 7,
    summary: "The five questions to ask every turn, in order: can I win, what stops me, what kills me, which tutor, and when to cast it.",
    blocks: [
      { t: "p", html: "Most lost games with this deck aren't lost to the opponents. They're lost to a tutor fired too early, a piece cast into open mana, or a turn spent on the wrong line. Ask these five questions every turn, in this order. The game's companion and the turn solver below ask them the same way." },
      { t: "steps", items: [
        { title: "Can I win this turn?", html: "For each combo, count what's missing and the cheapest way to get it: cast it from your hand, a tutor to the battlefield (Chord, Green Sun's Zenith, Finale), or a tutor to the hand plus the card's own cost. Add the extras: {1}{W} for Heliod's lifelink, {4} per missing Ballista counter. If the total fits your mana, that's the line." },
        { title: "What stops it?", html: "Look at their side before you count. <i-c>Grafdigger's Cage</i-c> turns off every tutor that puts a creature onto the battlefield. Torpor Orb and Hushbringer turn off Recruiter, Ranger-Captain, Gearhulk and Speaker. Null Rod and Collector Ouphe turn off Ballista. <i-c>Linvala, Keeper of Silence</i-c>, Cursed Totem and Humility turn off every combo. A line through a hate piece isn't a line: answer the piece first." },
        { title: "Who can answer me?", html: "Count opponents with cards in hand and untapped mana. If anyone has both, cast <i-c>Silence</i-c> or <i-c>Orim's Chant</i-c> first, or go off with <i-c>Grand Abolisher</i-c>, <i-c>Kutzil, Malamet Exemplar</i-c> or <i-c>Voice of Victory</i-c> already out. With Shalai out, spot removal on your other creatures is already off." },
        { title: "What kills me?", html: "If one opponent's creatures add up to your life total, you have one turn. Win now, keep blockers home or hold <i-c>Teferi's Protection</i-c>. Removal goes first on what stops your combo or what kills you, never on the biggest creature just because it's big." },
        { title: "Not this turn? Pick the tutor", html: "Pick the tutor that makes the line cheapest next turn. An instant tutor cast at the end of the turn before yours uses mana you'd untap anyway, so <i-c>Eladamri's Call</i-c> then the piece next turn often beats a sorcery that costs the same. A top-of-library tutor costs you the draw: use it when the piece is the draw you need anyway." }
      ] },
      { t: "widget", id: "comboFinder" },
      { t: "h", text: "Three boards, three answers" },
      { t: "table", head: ["Board", "Best line", "Why"], rows: [
        ["<i-c>Archangel of Thune</i-c> out, <i-c>Eladamri's Call</i-c> in hand, 5 mana, your main phase", "Eladamri's for <i-c>Spike Feeder</i-c>, cast it, loop", "{G}{W} plus {1}{G}{G} is exactly 5. Silence first if anyone has open mana."],
        ["Same board, but it's the end of the turn before yours", "Eladamri's for Feeder now, cast Feeder on your turn", "The tutor uses mana that untaps anyway. Your turn only needs {1}{G}{G}."],
        ["Same board, opponent has <i-c>Linvala, Keeper of Silence</i-c>", "<i-c>Swords to Plowshares</i-c> on Linvala first", "Feeder can't activate while she's out. The combo waits one spell."]
      ] },
      { t: "h", text: "Sequencing traps" },
      { t: "list", items: [
        "<b>Devoted Druid cast this turn</b> can't tap until next turn. Druid + Vizier is a next-turn line unless <i-c>Lightning Greaves</i-c> is out.",
        "<b>Chord of Calling for Walking Ballista</b> doesn't work: it enters with X=0 and dies. Use a tutor to hand.",
        "<b>Summoner's Pact</b> is only free if you can pay {2}{G}{G} next upkeep, or if you win this turn.",
        "<b>Heliod + Spike Feeder</b> is infinite life, not a win. It keeps you alive while you find Ballista or Archangel.",
        "<b>Craterhoof</b> kills one opponent long before it kills the table. Count it before you cast Natural Order."
      ] },
      { t: "callout", tone: "tip", title: "Let the game check you", html: "In the Play tab, the light bulb opens the Coach. Its Plan tab lists every line from your board, best first, with its cost, what blocks it and the tutor to use. On a wide screen the same lines sit in the rail beside the table." }
    ]
  },
  {
    id: "matchups",
    title: "Weak spots and matchups",
    kicker: "What beats you",
    minutes: 7,
    summary: "Wipes, edicts, hate cards, cEDH tables, and what to do against each.",
    blocks: [
      { t: "h", text: "Wipes and edicts" },
      { t: "p", html: "Hexproof doesn't stop Toxic Deluge, Farewell, overloaded Cyclonic Rift, Blasphemous Act or sacrifice effects." },
      { t: "table", head: ["Threat", "Your answer"], rows: [
        ["Destroy wipes (Wrath effects)", "<i-c>Flawless Maneuver</i-c> (free with Shalai out), <i-c>Teferi's Protection</i-c>"],
        ["Damage wipes (Blasphemous Act)", "<i-c>Flawless Maneuver</i-c>, <i-c>Teferi's Protection</i-c>"],
        ["-X/-X wipes (Toxic Deluge)", "<i-c>Teferi's Protection</i-c>, or Archangel plus Feeder in response to grow out of it"],
        ["Exile or bounce wipes (Farewell, Cyclonic Rift)", "<i-c>Teferi's Protection</i-c> only"],
        ["Edicts", "Keep a spare creature. <i-c>Teferi's Protection</i-c> also works."],
        ["Any wipe, with Ballista and a combo partner out", "Go off in response and win before it resolves"]
      ] },
      { t: "callout", tone: "key", title: "Hold one protection spell", html: "Against wipe decks, keep <i-c>Teferi's Protection</i-c> or <i-c>Flawless Maneuver</i-c> in hand before you dump your board. Win slower, but win." },
      { t: "h", text: "Shalai herself" },
      { t: "p", html: "She's the one creature they can target. <i-c>Giver of Runes</i-c> and <i-c>Lightning Greaves</i-c> help. If she dies, decide whether to recast her now or hold your combo for a turn." },
      { t: "h", text: "Hate cards that hurt" },
      { t: "table", head: ["Hate card", "What it stops", "Answer"], rows: [
        ["Grafdigger's Cage", "Natural Order, Chord, GSZ and Finale", "<i-c>Force of Vigor</i-c>, <i-c>Generous Gift</i-c>, <i-c>Archdruid's Charm</i-c>, <i-c>Boseiju, Who Endures</i-c>"],
        ["Torpor Orb, Hushbringer", "Enters triggers: Recruiter, Ranger-Captain, Speaker, Gearhulk, Hoof's pump", "Artifact removal. <i-c>Swords to Plowshares</i-c>, <i-c>Path to Exile</i-c>, <i-c>Solitude</i-c> or <i-c>Kenrith's Transformation</i-c> for Hushbringer. Switch to the instant tutors."],
        ["Collector Ouphe, Null Rod", "Ballista's abilities and your rocks", "Creature or artifact removal. Use Feeder or the attack plan."],
        ["Cursed Totem, opposing Linvala", "Dorks, Druid, Feeder and Ballista", "Removal. Heliod's own ability still works while it isn't a creature, but Ballista and Feeder are shut off."],
        ["Humility", "All creature abilities", "<i-c>Force of Vigor</i-c>, <i-c>Generous Gift</i-c>, <i-c>Archdruid's Charm</i-c>"]
      ] },
      { t: "callout", tone: "tip", title: "Kenrith's Transformation answers hatebears", html: "The creature loses all abilities and becomes a 3/3 Elk. It's an Aura, so it gets through indestructible creatures, and it draws you a card." },
      { t: "h", text: "cEDH-style tables" },
      { t: "p", html: "Against decks that win with Thassa's Oracle lines or storm, you're the underdog. You have no free counterspells. Your plan:" },
      { t: "list", items: [
        "<i-c>Silence</i-c> or <i-c>Orim's Chant</i-c> in their upkeep on the turn they go for it.",
        "<i-c>Reprieve</i-c> returns their key spell to hand and draws you a card.",
        "<i-c>Drannith Magistrate</i-c> stops commanders cast from the command zone.",
        "<i-c>Deafening Silence</i-c> stops storm and spell-chain turns.",
        "<i-c>Aven Mindcensor</i-c> and <i-c>Archivist of Oghma</i-c> punish tutors.",
        "<i-c>Veil of Summer</i-c> on your combo turn against counterspells.",
        "Race. Your fastest hands win on turns 2 or 3."
      ] },
      { t: "h", text: "Other tables" },
      { t: "table", head: ["Opponent", "What to do"], rows: [
        ["Removal-heavy midrange", "Shalai first, then pieces. Giver on Shalai."],
        ["Counterspell-heavy blue", "<i-c>Destiny Spinner</i-c>, Cavern, Halfling, Abolisher. Veil on the turn you tutor."],
        ["Creature aggro", "<i-c>Thalia, Heretic Cathar</i-c>, <i-c>Blind Obedience</i-c>, Archangel's lifelink. Infinite life from Feeder lines also stops them."],
        ["Graveyard decks", "<i-c>Endurance</i-c> resets a graveyard at instant speed. <i-c>Drannith Magistrate</i-c> stops casting from it."],
        ["Artifact decks", "<i-c>Force of Vigor</i-c>, <i-c>Generous Gift</i-c>, <i-c>Blind Obedience</i-c>"]
      ] },
      { t: "h", text: "Free interaction" },
      { t: "cards", names: ["Endurance", "Solitude", "Force of Vigor", "Elvish Spirit Guide"], caption: "Spells you can cast without mana." },
      { t: "list", items: [
        "<i-c>Solitude</i-c>: evoke by exiling a white card from hand. Exile a creature at instant speed.",
        "<i-c>Endurance</i-c>: evoke by exiling a green card. Puts a graveyard on the bottom of its library.",
        "<i-c>Force of Vigor</i-c>: on an opponent's turn, exile a green card to destroy two artifacts or enchantments.",
        "<i-c>Elvish Spirit Guide</i-c>: a free {G} for Silence-proof plays."
      ] }
    ]
  },
  {
    id: "rules-corner",
    title: "Rules corner",
    kicker: "Tricky interactions",
    minutes: 6,
    summary: "Twelve rules questions that come up with this deck.",
    blocks: [
      { t: "qa", items: [
        { q: "Does Shalai give herself hexproof?", a: "No. She gives hexproof to you, your planeswalkers and your <b>other</b> creatures. Protect her with <i-c>Giver of Runes</i-c> or <i-c>Lightning Greaves</i-c>." },
        { q: "Can I target my own hexproof creatures?", a: "Yes. Hexproof only stops opponents. Heliod's lifelink, Feeder's counters and Giver all work." },
        { q: "Does Shalai's {4}{G}{G} put a counter on Shalai too?", a: "Yes. It puts a +1/+1 counter on each creature you control, including her." },
        { q: "Can Spike Feeder and Archangel of Thune combo the turn they come down?", a: "Yes. Neither ability uses {T}. Summoning sickness doesn't matter." },
        { q: "I get Spike Feeder with Chord of Calling. Does it have counters?", a: "Yes. It \"enters with\" two +1/+1 counters however it enters." },
        { q: "And Walking Ballista from Chord or Finale?", a: "It enters with X counters, and X is 0 when it isn't cast. It dies right away." },
        { q: "Why does Heliod plus Ballista need two counters?", a: "Removing the last counter makes Ballista a 0/0. It dies before the damage resolves, so Heliod's trigger has nothing to target. With two, it drops to one and gets the counter back." },
        { q: "Is Heliod a creature?", a: "Only with five or more devotion to white. It's still a creature card in your library, so creature tutors can find it, and its abilities work either way." },
        { q: "Can I loop Devoted Druid and Vizier the turn I cast the Druid?", a: "Not without haste. The tap ability needs {T}. <i-c>Lightning Greaves</i-c> gives haste. Vizier can be new: its ability is static." },
        { q: "Can a summoning-sick creature help pay for Chord of Calling?", a: "Yes. Convoke taps creatures without using the {T} symbol, so new creatures can help." },
        { q: "If I cast Teferi's Protection, can I still go off with Feeder?", a: "No. Your life total can't change until your next turn, so you don't gain life and Archangel and Heliod don't trigger. Your permanents are phased out anyway." },
        { q: "Does Deafening Silence stop my combos?", a: "No. It limits noncreature spells only, and the combos are creatures and abilities. It does slow your rock and tutor turns." },
        { q: "Craterhoof enters, then I cast another creature. Does it get the bonus?", a: "No. X is counted when the trigger resolves, and only the creatures there at that moment get +X/+X." },
        { q: "Can Gemstone Caverns start on the battlefield if I go first?", a: "No. Only if you're not the starting player." },
        { q: "Does Grand Abolisher stop an opponent's channel land?", a: "No. Abolisher stops spells and abilities of artifacts, creatures and enchantments. A land card's channel ability isn't covered." }
      ] }
    ]
  },
  {
    id: "bracket-4",
    title: "Bracket 4 and the pregame talk",
    kicker: "Before you shuffle",
    minutes: 4,
    summary: "What Bracket 4 means, what this deck brings to it, and what to tell the table.",
    blocks: [
      { t: "h", text: "What Bracket 4 means" },
      { t: "p", html: "Brackets are a tool for the pregame conversation, not enforced rules, and the system is still officially in beta. Bracket 4 is \"Optimized\":" },
      { t: "list", items: [
        "Decks don't follow the cEDH metagame. That's Bracket 5.",
        "Decks are lethal, consistent and fast.",
        "Game Changers tend to be fast mana, snowballing engines, free disruption and tutors. Bracket 4 allows any number of them.",
        "Win conditions are efficient and instant.",
        "Gameplay is explosive, with big threats and efficient disruption.",
        "You should expect to play at least four turns before winning or losing.",
        "Beyond the banned list, nothing is restricted: two-card combos, mass land denial, extra turns and tutors are all allowed."
      ] },
      { t: "h", text: "Where this deck sits" },
      { t: "p", html: "It uses cEDH-grade staples but isn't built around the cEDH metagame: no free counterspells, no Thassa's Oracle package. In a real cEDH pod it's an underdog. That's very high Bracket 4." },
      { t: "callout", tone: "tip", title: "Game Changers", html: "The Stats tab lists the deck's Game Changers." },
      { t: "h", text: "What to tell the table" },
      { t: "list", items: [
        "<b>Two-card combos:</b> <i-c>Archangel of Thune</i-c> and <i-c>Spike Feeder</i-c>, <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Walking Ballista</i-c>, <i-c>Devoted Druid</i-c> and <i-c>Vizier of Remedies</i-c>, <i-c>Heliod, Sun-Crowned</i-c> and <i-c>Spike Feeder</i-c>.",
        "<b>Lots of tutors and fast mana.</b>",
        "<b>Stax:</b> silence effects on your turn, Drannith, Thalia, Blind Obedience, Deafening Silence.",
        "<b>Land denial:</b> <i-c>Vorinclex, Voice of Hunger</i-c> keeps opponents' tapped lands from untapping. Close to land denial, so mention it.",
        "<b>Speed:</b> typical wins on turns 4 to 6. A great hand can win on turn 2 or 3.",
        "<b>No extra turns.</b>"
      ] },
      { t: "callout", tone: "key", title: "A script you can use", html: "\"This is high Bracket 4. Green-white creature combo with Shalai. Four two-card infinites, lots of tutors and fast mana, and some stax that stops you casting spells on my turn. Usually wins turn 4 to 6. Vorinclex can keep your lands tapped. Is that the level we want?\"" },
      { t: "callout", tone: "tip", title: "If the table is softer", html: "Offer to play the fair game: Shalai, Kutzil and Gavony beats, no tutoring for combos. Or play another deck. A good game for everyone beats a fast win." },
      { t: "h", text: "The card names" },
      { t: "p", html: "Your Secret Lair cards use Miku names, but the rules use the Oracle names. Miku, Voice Over All is <i-c>Shalai, Voice of Plenty</i-c>. Miku, the Complete Performer is <i-c>Vorinclex, Voice of Hunger</i-c>. The Archangel of Tunes is <i-c>Archangel of Thune</i-c>. Tell opponents the real names when they ask what a card does." }
    ]
  }
];
