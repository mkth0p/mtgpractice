/* The Corrupted Etrata turn checklist ("Etrata's Shadow Market v2"): what to check at each moment of a
   game, in order. The Play tab shows it in the Coach panel next to the live tips, and the Corrupted
   Etrata site prints it as a page. It needs nothing else, so both can load it. Card names are exact
   so the pages can link them. */
(function (root) {
  "use strict";
  (root.MK_CHECKLISTS = root.MK_CHECKLISTS || {})["corrupted-etrata"] = [
    {
      key: "mulligan", when: "Opening hand", phase: "mulligan",
      items: [
        { text: "Keep 2 to 4 lands (or 2 lands and Sol Ring, Mox Amber or a Signet) with at least one blue and one black source.", cards: ["Sol Ring", "Mox Amber"] },
        { text: "A tutor counts as the combo piece it finds. One piece plus one tutor is a great keep.", cards: ["Demonic Tutor", "Vampiric Tutor", "Imperial Seal"] },
        { text: "Transmute cards are tutors too: Shred Memory and Muddle the Mixture find Mindcrank or the Guildmage, Drift of Phantasms finds Blight-Priest, Vito or Virtus, Dimir House Guard finds Bloodletter.", cards: ["Shred Memory", "Muddle the Mixture", "Drift of Phantasms", "Dimir House Guard"] },
        { text: "Leyline of Transformation in your opening hand: begin with it on the battlefield (your creatures are Assassins, so every hit cloaks a card).", cards: ["Leyline of Transformation"] }
      ]
    },
    {
      key: "upkeep", when: "Your upkeep", phase: "upkeep",
      items: [
        { text: "Mystic Remora: pay its cumulative upkeep or let it go.", cards: ["Mystic Remora"] },
        { text: "Vesuvan Shapeshifter copying Brine Elemental: turn it face down now, then turn it face up for {1}{U} as Brine again: opponents skip their next untap step.", cards: ["Vesuvan Shapeshifter", "Brine Elemental"] },
        { text: "Vampiric Tutor or Imperial Seal last turn? The card is on top: you draw it now (with Necropotence out, you don't).", cards: ["Vampiric Tutor", "Necropotence"] }
      ]
    },
    {
      key: "draw", when: "After you draw", phase: "draw",
      items: [
        { text: "Ask: is a two-card line live, or am I one card away? Vampire loop, Mindcrank + Guildmage, Bloodletter + Virtus, Brine lock.", cards: ["Exquisite Blood", "Mindcrank", "Bloodletter of Aclazotz", "Brine Elemental"] },
        { text: "Black Market Connections triggers at the start of your main phase: a Treasure always, a card above 12 life, a Mercenary above 20.", cards: ["Black Market Connections"] }
      ]
    },
    {
      key: "main", when: "Main phase: in this order", phase: "main1",
      items: [
        { text: "1. Land, then fast mana. Mox Amber needs a legendary creature (Etrata, Mari, Ramses, Gonti, Tetsuko, Virtus, Vito).", cards: ["Mox Amber"] },
        { text: "2. Etrata early: she turns face-down creatures face up for {2}{U}{B} ({U}{B} with Training Grounds), or exiles a face-down noncreature card and casts it free.", cards: ["Etrata, Deadly Fugitive", "Training Grounds"] },
        { text: "3. One piece short? Tutor for it. Transmute only works at sorcery speed, from your hand.", cards: ["Grim Tutor", "Beseech the Mirror", "Scheming Symmetry"] },
        { text: "4. Brine Elemental and Vesuvan Shapeshifter: cast them face down for {3} each; let Etrata or the morph cost turn them up on your turn.", cards: ["Brine Elemental", "Vesuvan Shapeshifter"] },
        { text: "5. Wishclaw Talisman goes to an opponent after one use. Use it only the turn you go off, or with Opposition Agent out (you take what they find).", cards: ["Wishclaw Talisman", "Opposition Agent"] },
        { text: "6. Notion Thief out? Windfall now: they discard their hands and you draw their cards.", cards: ["Notion Thief", "Windfall"] }
      ]
    },
    {
      key: "combo", when: "Going off", phase: "combo",
      items: [
        { text: "Vampire loop (Exquisite Blood or Bloodthirsty Conqueror + Blight-Priest, Vito or Sanguine Bond): make any opponent lose 1 life. An attack, or Duskmantle Guildmage {1}{U}{B} then its {2}{U}{B} mill.", cards: ["Exquisite Blood", "Marauding Blight-Priest", "Duskmantle Guildmage"] },
        { text: "Mindcrank + Guildmage: {1}{U}{B}, then {2}{U}{B} to mill two. It kills the player with the least life; 7 mana.", cards: ["Mindcrank", "Duskmantle Guildmage"] },
        { text: "Bloodletter + Virtus: on your turn, Virtus's hit costs them all their life. Virtus must be unblockable: Tetsuko while it's a 1/1, Rogue's Passage if Ramses made it a 2/2.", cards: ["Bloodletter of Aclazotz", "Virtus the Veiled", "Tetsuko Umezawa, Fugitive", "Rogue's Passage"] },
        { text: "Ramses out? Attack with an Assassin first, kill a player you attacked after combat: you win the game.", cards: ["Ramses, Assassin Lord"] },
        { text: "Hit list: Mari's hit counters plus the Silencer's hit. The Silencer needs a creature to exile, so hit a player who has one.", cards: ["Mari, the Killing Quill", "Etrata, the Silencer"] }
      ]
    },
    {
      key: "combat", when: "Combat", phase: "combat",
      items: [
        { text: "Every Assassin that connects cloaks the top card of that player's library. Changeling Outcast, Etrata (1/4) and Virtus get in with Tetsuko.", cards: ["Changeling Outcast", "Tetsuko Umezawa, Fugitive"] },
        { text: "Unblocked Changeling Outcast? Ninjutsu Fallen Shinobi ({2}{U}{B}) in its place: their top two cards are yours to play free this turn.", cards: ["Fallen Shinobi", "Changeling Outcast"] },
        { text: "Gonti: every creature hit on an opponent exiles their top card for you to play. Thief of Sanity takes one of three.", cards: ["Gonti, Night Minister", "Thief of Sanity"] }
      ]
    },
    {
      key: "end", when: "Before you pass", phase: "main2",
      items: [
        { text: "Necropotence: pay life now for cards (they arrive at your end step). Keep enough life for the table.", cards: ["Necropotence"] },
        { text: "Keep {U} or the free counters up: Fierce Guardianship, An Offer You Can't Refuse, Swan Song, Counterspell.", cards: ["Fierce Guardianship", "Swan Song", "Counterspell"] },
        { text: "Scroll of Fate: manifest a big creature or an expensive spell from your hand; Etrata flips it later for 4.", cards: ["Scroll of Fate"] }
      ]
    },
    {
      key: "theirs", when: "On their turns", phase: "theirs",
      items: [
        { text: "Flash in Opposition Agent before an opponent tutors, or Notion Thief before they draw extra cards.", cards: ["Opposition Agent", "Notion Thief"] },
        { text: "An opponent's fetch or shock land costs them life: with the vampire loop on the battlefield that kills the table.", cards: ["Exquisite Blood", "Bloodthirsty Conqueror"] },
        { text: "Vampiric Tutor or Lim-Dûl's Vault at the end of the turn before yours.", cards: ["Vampiric Tutor", "Lim-Dûl's Vault"] },
        { text: "Crystal Shard ({U}, {T}) can save your creature from removal by returning it to your hand.", cards: ["Crystal Shard"] }
      ]
    }
  ];
})(typeof window !== "undefined" ? window : globalThis);
