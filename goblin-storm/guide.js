/* The playing guide for Goblin Storm (Secret Lair Commander Deck, 2026), led by Zada, Hedron Grinder.
   Chapters are built from blocks: p, h, steps, list, callout, cards, turns, qa, table, math, widget.
   Card mentions use <i-c>Exact Card Name</i-c>; mana symbols are written as {R}, {2}, {T}. */
window.GSTORM_GUIDE = [
  {
    id: "deck-in-60-seconds",
    title: "The deck in 60 seconds",
    kicker: "Start here",
    minutes: 3,
    summary: "What's in the box, how the deck wins, and the one idea that makes it work.",
    blocks: [
      { t: "p", html: "Goblin Storm is a mono-red Commander deck from Secret Lair, released on 18 May 2026 for $149.99. It's led by <i-c>Zada, Hedron Grinder</i-c>, with <i-c>Krenko, Mob Boss</i-c> and <i-c>Pashalik Mons</i-c> as the other legendary Goblins. Wizards of the Coast's designers were Eli Rice and Carmen Klomparens; the new art is by Wizard of Barge." },
      { t: "cards", names: ["Zada, Hedron Grinder", "Krenko, Mob Boss", "Empty the Warrens", "Grapeshot"], caption: "The commander, the Goblin engine and the two storm cards on the box." },
      { t: "h", text: "The plan in four beats" },
      { t: "steps", items: [
        { title: "Go wide", html: "Goblin token makers: <i-c>Krenko, Mob Boss</i-c>, <i-c>Siege-Gang Commander</i-c>, <i-c>Dragon Fodder</i-c>, <i-c>Mogg War Marshal</i-c>, <i-c>General Kreat, the Boltbringer</i-c>." },
        { title: "Cast Zada", html: "Every cheap spell that targets only Zada is copied once for each other creature you control. A one-mana cantrip draws a card per creature." },
        { title: "Make mana, chain spells", html: "Rituals (<i-c>Brightstone Ritual</i-c>, <i-c>Battle Hymn</i-c>, <i-c>Seething Song</i-c>) and Treasures from <i-c>Ancestors' Aid</i-c> and <i-c>Storm-Kiln Artist</i-c> pay for more spells in the same turn." },
        { title: "Finish", html: "<i-c>Grapeshot</i-c> or <i-c>Empty the Warrens</i-c> with a big storm count, <i-c>Impact Tremors</i-c> and <i-c>Goblin Bombardment</i-c> with a huge board, or a hasty, pumped attack." }
      ] },
      { t: "h", text: "What's in the box" },
      { t: "list", items: [
        "100 cards: 12 foil borderless cards with new art, 22 foil borderless Mountains in three new arts, 63 non-foil reprints and 3 non-foil reprints with new art.",
        "The 12 foil new-art cards: Zada, Krenko, Pashalik Mons, Brightstone Ritual, Broadside Bombardiers, Conspicuous Snoop, Empty the Warrens, Grapeshot, Skirk Prospector, Roaming Throne, Skullclamp and Sol Ring.",
        "4 foil Goblin tokens with new art, 10 double-sided tokens, a storm counter helper, a thick display Zada (not legal to play) and a deck box."
      ] },
      { t: "callout", tone: "key", title: "The one idea", html: "Zada turns 'target creature' into 'each creature you control'. Count your creatures before every spell, and make them before you cast the spells." },
      { t: "callout", tone: "tip", title: "Where this comes from", html: "The card list and contents are from Wizards' decklist article and the Secret Lair product page. Strategy is from reading the cards; nothing here was playtested at a real table." }
    ]
  },
  {
    id: "zada",
    title: "How Zada works",
    kicker: "The commander",
    minutes: 5,
    summary: "What 'targets only Zada' means, which spells copy, and what copies do and don't do.",
    blocks: [
      { t: "p", html: "<i-c>Zada, Hedron Grinder</i-c> costs {3}{R} and is a 3/3 Goblin Ally. Whenever you cast an instant or sorcery that targets only her, you copy that spell for each other creature you control that the spell could target, and each copy targets a different one of those creatures." },
      { t: "h", text: "Spells that copy" },
      { t: "table", head: ["Spell", "Cost", "Each copy gives"], rows: [
        ["<i-c>Expedite</i-c>", "{R}", "Haste and a card"],
        ["<i-c>Crimson Wisps</i-c>", "{R}", "Haste and a card"],
        ["<i-c>Renegade Tactics</i-c>", "{R}", "A card (the creature can't block, which doesn't matter for yours)"],
        ["<i-c>Fists of Flame</i-c>", "{1}{R}", "A card, then trample and +1/+0 per card drawn this turn"],
        ["<i-c>Ancestors' Aid</i-c>", "{1}{R}", "A Treasure, +2/+0 and first strike"],
        ["<i-c>Wild Ride</i-c>", "{R}", "+3/+0 and haste"],
        ["<i-c>Witch's Mark</i-c>", "{1}{R}", "Discard one to draw two, and a Wicked Role (+1/+1)"],
        ["<i-c>Daring Discovery</i-c>", "{4}{R}", "Discover 4: a free spell from your library"]
      ] },
      { t: "h", text: "Spells that don't" },
      { t: "list", items: [
        "No target: <i-c>Haze of Rage</i-c>, <i-c>Battle Hymn</i-c>, <i-c>Brightstone Ritual</i-c>, <i-c>Seething Song</i-c>, <i-c>Empty the Warrens</i-c>.",
        "Other targets: <i-c>Sazacap's Brew</i-c> targets a player, <i-c>Great Train Heist</i-c> targets an opponent, <i-c>Spreading Insurrection</i-c> targets a creature you don't control.",
        "Never on Zada: <i-c>Grapeshot</i-c>, <i-c>Goblin Negotiation</i-c> and <i-c>Chaos Warp</i-c> would copy onto your own creatures."
      ] },
      { t: "widget", id: "zadaCalc" },
      { t: "h", text: "Rules to know" },
      { t: "qa", items: [
        { q: "Do copies count for storm?", a: "No. Copies aren't cast. They don't add to the storm count and don't trigger 'whenever you cast' abilities. <i-c>Storm-Kiln Artist</i-c> says 'cast or copy', so it does see them." },
        { q: "What if they kill Zada in response?", a: "Zada's trigger already made the copies when it resolved. If they kill her with the trigger still on the stack, the trigger still resolves (it doesn't need her), but count your creatures then. Only the original spell, aimed at Zada, has no target left." },
        { q: "Does hexproof stop my copies?", a: "No. Hexproof only stops opponents. <i-c>Swiftfoot Boots</i-c> on Zada is fine." },
        { q: "Frontline Heroism and Zada both trigger. Which first?", a: "You choose. Put Zada's trigger on the stack first and <i-c>Frontline Heroism</i-c>'s on top: the Soldier is made first, so Zada counts it and gives it a copy." }
      ] },
      { t: "callout", tone: "warn", title: "Copies resolve first", html: "The copies go on the stack above the original. With <i-c>Fists of Flame</i-c>, the creature whose copy resolves last gets the biggest bonus, and the original on Zada resolves very last." }
    ]
  },
  {
    id: "storm",
    title: "Storm in plain words",
    kicker: "The other engine",
    minutes: 4,
    summary: "How storm counts, the four storm cards, and how to build a storm turn.",
    blocks: [
      { t: "p", html: "Storm: when you cast the spell, copy it for each spell cast before it this turn. Every spell counts, by any player, from any zone (flashback included). Copies and abilities don't." },
      { t: "table", head: ["Card", "Each copy", "As the sixth spell"], rows: [
        ["<i-c>Grapeshot</i-c>", "1 damage, any target", "6 damage"],
        ["<i-c>Empty the Warrens</i-c>", "Two 1/1 Goblins", "12 Goblins"],
        ["<i-c>Haze of Rage</i-c>", "Creatures get +1/+0", "+6/+0 to each creature"],
        ["<i-c>Spreading Insurrection</i-c>", "Steal a creature this turn", "Six of their creatures"]
      ] },
      { t: "widget", id: "stormCalc" },
      { t: "h", text: "Building a storm turn" },
      { t: "steps", items: [
        { title: "Cheap spells first", html: "One-mana cantrips and token spells raise the count and dig for more." },
        { title: "Rituals in the middle", html: "<i-c>Brightstone Ritual</i-c> and <i-c>Battle Hymn</i-c> grow with your board. Cast them after the token spells." },
        { title: "Refuel", html: "<i-c>Past in Flames</i-c> gives every instant and sorcery in your graveyard flashback. <i-c>Goblin Dark-Dwellers</i-c> casts one for free." },
        { title: "Finish", html: "<i-c>Empty the Warrens</i-c> into <i-c>Impact Tremors</i-c>, or <i-c>Grapeshot</i-c> to the face, or <i-c>Haze of Rage</i-c> before combat." }
      ] },
      { t: "callout", tone: "key", title: "Mana empties between steps", html: "Ritual mana and mana from <i-c>Skirk Prospector</i-c> vanish at the end of the step or phase. Do the whole chain in one main phase. Treasures stay until you use them." }
    ]
  },
  {
    id: "combos",
    title: "The combos",
    kicker: "How it wins big",
    minutes: 5,
    summary: "Storm-Kiln Artist with Haze of Rage, Artist with Zada, and the drain finishes.",
    blocks: [
      { t: "h", text: "Storm-Kiln Artist + Haze of Rage" },
      { t: "p", html: "The deck's one two-card loop, flagged as an infinite combo by the bracket checker on scrollvault.net. <i-c>Haze of Rage</i-c> with buyback costs {3}{R} and comes back to your hand. <i-c>Storm-Kiln Artist</i-c> makes a Treasure for the cast and one for each storm copy." },
      { t: "math", items: [
        { label: "Haze with buyback costs", value: "4 mana" },
        { label: "Treasures per Haze, with N spells cast before it this turn", value: "1 + N" },
        { label: "Breaks even from", value: "N = 3" }
      ], total: "From the fourth spell on, each Haze pays for the next one. Storm keeps rising, so the team's power grows without limit. Attack. With <i-c>Ruby Medallion</i-c>, Haze costs 3 and it starts one spell earlier." },
      { t: "callout", tone: "warn", title: "It's a combat finish", html: "Haze only adds power. Do it in your first main phase with creatures that can attack (haste from <i-c>Goblin Chieftain</i-c>, <i-c>Goblin Warchief</i-c> or <i-c>Howlsquad Heavy</i-c>). The Treasures can also pay for <i-c>Grapeshot</i-c> or <i-c>Empty the Warrens</i-c> at the end with a huge storm count." },
      { t: "h", text: "Storm-Kiln Artist + Zada" },
      { t: "p", html: "Not infinite, but huge. With Zada and N other creatures, a spell on Zada makes N copies, and Artist makes N + 1 Treasures. <i-c>Ancestors' Aid</i-c> makes N + 1 more on its own." },
      { t: "h", text: "Drain finishes" },
      { t: "list", items: [
        "<i-c>Impact Tremors</i-c> and <i-c>General Kreat, the Boltbringer</i-c>: each creature entering is 1 damage to each opponent. A twelve-Goblin <i-c>Empty the Warrens</i-c> with both is 24 to everyone.",
        "<i-c>Goblin Bombardment</i-c> with <i-c>Pashalik Mons</i-c> and <i-c>Boggart Shenanigans</i-c>: each Goblin sacrificed is 3 damage.",
        "<i-c>Krenko, Mob Boss</i-c> with haste and <i-c>Skirk Prospector</i-c>: tokens become red mana for the rest of the turn."
      ] },
      { t: "callout", tone: "key", title: "Roaming Throne doubles a lot", html: "Name Goblin. Zada, Kreat, Mons, Siege-Gang, Matron and Lieutenant all trigger twice. Enchantments (<i-c>Impact Tremors</i-c>) don't." }
    ]
  },
  {
    id: "mana",
    title: "Mana and rituals",
    kicker: "Fuel",
    minutes: 3,
    summary: "36 lands, the rituals, Treasures and cost reducers.",
    blocks: [
      { t: "p", html: "The deck plays 36 lands (22 Mountains), <i-c>Sol Ring</i-c>, <i-c>Ruby Medallion</i-c>, <i-c>Throne of Eldraine</i-c> and a pile of rituals. Every nonland card is red or colorless, so color is never a problem." },
      { t: "table", head: ["Card", "Makes", "Best when"], rows: [
        ["<i-c>Brightstone Ritual</i-c>", "{R} per Goblin on the battlefield", "After a token spell"],
        ["<i-c>Battle Hymn</i-c>", "{R} per creature you control", "Wide board"],
        ["<i-c>Seething Song</i-c>", "{R}{R}{R}{R}{R} for 3", "Any storm turn"],
        ["<i-c>Mana Geyser</i-c>", "{R} per tapped opposing land", "After they tap out"],
        ["<i-c>Skirk Prospector</i-c>", "{R} per Goblin sacrificed", "Spare tokens"],
        ["<i-c>Howlsquad Heavy</i-c>", "{R} per Goblin, at max speed", "Late game"],
        ["<i-c>Storm-Kiln Artist</i-c>", "A Treasure per instant or sorcery cast or copied", "Zada turns"]
      ] },
      { t: "callout", tone: "tip", title: "Cost reducers stack", html: "<i-c>Ruby Medallion</i-c> takes {1} off red spells, <i-c>Goblin Warchief</i-c> takes {1} off Goblin spells. Together, <i-c>Krenko, Mob Boss</i-c> costs {R}{R}." }
    ]
  },
  {
    id: "first-turns",
    title: "Mulligans and the first turns",
    kicker: "Setup",
    minutes: 3,
    summary: "What to keep and what turns 1 to 4 look like.",
    blocks: [
      { t: "list", items: [
        "Keep 2 to 4 lands with a cheap Goblin or <i-c>Sol Ring</i-c>.",
        "<i-c>Goblin Lackey</i-c>, <i-c>Skirk Prospector</i-c> or <i-c>Quest for the Goblin Lord</i-c> on turn 1 is a fine start.",
        "Mulligan a hand with no lands or with only rituals: rituals need a board to be good."
      ] },
      { t: "turns", items: [
        { turn: "T1", play: "Mountain, <i-c>Sol Ring</i-c> or a one-drop Goblin.", note: "Lackey attacks next turn into an empty board." },
        { turn: "T2", play: "<i-c>Ruby Medallion</i-c>, <i-c>Dragon Fodder</i-c>, <i-c>Mogg War Marshal</i-c> or <i-c>Skullclamp</i-c>." },
        { turn: "T3", play: "<i-c>Goblin Warchief</i-c>, <i-c>General Kreat, the Boltbringer</i-c>, <i-c>Howlsquad Heavy</i-c> or <i-c>Goblin Matron</i-c> for Krenko." },
        { turn: "T4", play: "<i-c>Krenko, Mob Boss</i-c> with haste, or Zada with three or more creatures and a cantrip left over.", note: "With four creatures and an Expedite, Zada draws four that turn." }
      ] }
    ]
  },
  {
    id: "zada-turn",
    title: "Running a Zada turn",
    kicker: "Step by step",
    minutes: 4,
    summary: "The order that gets the most from one turn.",
    blocks: [
      { t: "steps", items: [
        { title: "Make bodies", html: "Tap <i-c>Krenko, Mob Boss</i-c>, cast token spells, activate <i-c>Kher Keep</i-c>." },
        { title: "Treasures", html: "<i-c>Ancestors' Aid</i-c> on Zada: a Treasure per creature. With <i-c>Storm-Kiln Artist</i-c>, double that." },
        { title: "Cards", html: "<i-c>Expedite</i-c>, <i-c>Crimson Wisps</i-c>, <i-c>Renegade Tactics</i-c>, <i-c>Witch's Mark</i-c> on Zada. <i-c>Reliquary Tower</i-c> keeps the extra cards." },
        { title: "Free spells", html: "<i-c>Daring Discovery</i-c> on Zada: a discover 4 per creature." },
        { title: "Finish", html: "<i-c>Wild Ride</i-c> or <i-c>Fists of Flame</i-c> on Zada and attack, or storm off with what you drew." }
      ] },
      { t: "callout", tone: "warn", title: "Don't overextend into a wipe", html: "Against a table with board wipes, keep <i-c>Goblin Bombardment</i-c> or <i-c>Skirk Prospector</i-c> out so a wipe turns into damage or mana." }
    ]
  },
  {
    id: "threats",
    title: "What beats you",
    kicker: "Weak spots",
    minutes: 3,
    summary: "Wipes, hate pieces, and the answers in the deck.",
    blocks: [
      { t: "list", items: [
        "Board wipes kill the tokens. Answer: sacrifice in response with <i-c>Goblin Bombardment</i-c>, <i-c>Skirk Prospector</i-c> or Siege-Gang's abilities.",
        "Removal on Zada or Krenko. Answer: <i-c>Swiftfoot Boots</i-c>, and a second plan (storm doesn't need Zada).",
        "Rule of Law effects and storm hate stop the chain. Answer: <i-c>Chaos Warp</i-c>, <i-c>Vandalblast</i-c>, <i-c>Goblin Trashmaster</i-c>.",
        "Big blockers. Answer: <i-c>Renegade Tactics</i-c>, <i-c>Daring Discovery</i-c>, menace and trample from <i-c>Fists of Flame</i-c>."
      ] }
    ]
  },
  {
    id: "power",
    title: "How strong is it?",
    kicker: "Brackets",
    minutes: 2,
    summary: "Where the precon sits and how players change it.",
    blocks: [
      { t: "p", html: "Wizards didn't print a bracket on the box. The bracket checker on scrollvault.net puts it in Bracket 3 (6.2 out of 10), with no Game Changers, and flags <i-c>Storm-Kiln Artist</i-c> plus <i-c>Haze of Rage</i-c> as a two-card infinite combo that's borderline for Bracket 3." },
      { t: "p", html: "On EDHREC's Goblin Storm page (read 20 Oct 2026), the most-cut cards are <i-c>Sazacap's Brew</i-c> (74.6% of decks), <i-c>Glimpse the Impossible</i-c> (71.2%), <i-c>Redcap Gutter-Dweller</i-c> (69.6%), <i-c>Quest for the Goblin Lord</i-c> (59.3%) and <i-c>Idol of Oblivion</i-c> (56.9%). The most-added are Reckless Ransacking (57.9%), Moggcatcher (57.2%), Hexing Squelcher (49.9%), Ancestral Anger (48.0%) and Impolite Entrance (45.3%)." },
      { t: "callout", tone: "tip", title: "The Shop tab", html: "Card prices and the swap ideas are in the Shop tab, and the printable proxies are linked there." }
    ]
  }
];
