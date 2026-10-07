/* The Etrata heist closer's turn checklist (the list the Corrupted Etrata site is built around): what to check at
   each moment of a game, in order. It follows the nine piloting rules of the research report, each measured in bot
   games (research/etrata-theft-aggro/local/REPORT.md). The Play tab shows it in the Coach panel, and the Corrupted
   Etrata site prints it as a page. It needs nothing else, so both can load it. Card names are exact. */
(function (root) {
  "use strict";
  (root.MK_CHECKLISTS = root.MK_CHECKLISTS || {})["etrata-heist"] = [
    {
      key: "mulligan", when: "Opening hand", phase: "mulligan",
      items: [
        { text: "Mulligan is the default. Keep a hand that does something by turn 3: two or more lands with blue and black, a 1-2 mana evasive Assassin, and Etrata castable on turn 3 with an Assassin ready to hit.", cards: ["Changeling Outcast", "Etrata, Deadly Fugitive"] },
        { text: "Also a keep: fast mana plus a real threat, or a turn 1-2 engine with the lands for it.", cards: ["Sol Ring", "Chrome Mox", "Rhystic Study", "Mystic Remora"] },
        { text: "Not a keep: interaction alone, or draw with nothing to develop. The first mulligan is free.", cards: ["Force of Will", "Brainstorm"] }
      ]
    },
    {
      key: "upkeep", when: "Your upkeep", phase: "upkeep",
      items: [
        { text: "Mystic Remora: pay its cumulative upkeep or let it go. Dark Confidant: you lose the revealed card's mana value.", cards: ["Mystic Remora", "Dark Confidant"] },
        { text: "Eldrazi Monument: sacrifice a creature (a stolen land or a weak cloak first), or it goes.", cards: ["Eldrazi Monument"] },
        { text: "Teferi's Veil: last turn's attackers phased back in during your untap step, untapped and ready.", cards: ["Teferi's Veil"] }
      ]
    },
    {
      key: "draw", when: "After you draw", phase: "draw",
      items: [
        { text: "Is Ramses out, in hand, or one tutor away? He's the kill: tutor for him first.", cards: ["Ramses, Assassin Lord", "Demonic Tutor", "Vampiric Tutor", "Imperial Seal"] },
        { text: "Is the drain loop live or one card away? Exquisite Blood or Bloodthirsty Conqueror with Sanguine Bond or Vito kills the table.", cards: ["Exquisite Blood", "Sanguine Bond"] }
      ]
    },
    {
      key: "main", when: "Main phase one: in this order", phase: "main1",
      items: [
        { text: "1. Land, then fast mana: Sol Ring, Chrome Mox, Lotus Petal, Dark Ritual. Mox Amber needs a legendary creature or planeswalker.", cards: ["Sol Ring", "Mox Amber"] },
        { text: "2. Etrata the turn an Assassin can connect: her trigger works the turn she's cast. Greaves on her when you can.", cards: ["Etrata, Deadly Fugitive", "Lightning Greaves"] },
        { text: "3. Tutor for Ramses first, and cast him before combat. Don't hold him until he can be protected.", cards: ["Ramses, Assassin Lord", "Grim Tutor", "Pyre of Heroes"] },
        { text: "4. A type-changer makes every face-down 2/2 an Assassin, so each one cloaks again when it connects.", cards: ["Leyline of Transformation", "Arcane Adaptation", "Roshan, Hidden Magister"] },
        { text: "5. Halvers and Bloodletter: with Bloodletter out, a halver's hit takes a player's whole life on your turn.", cards: ["Bloodletter of Aclazotz", "Virtus the Veiled", "Unstoppable Slasher", "Quietus Spike"] },
        { text: "6. Don't hold mana for one-shot tricks. Spend it.", cards: [] }
      ]
    },
    {
      key: "combat", when: "Combat", phase: "combat",
      items: [
        { text: "With Ramses out, pick one player: the one your board kills soonest. Everything that gets through goes at them; if they lose this turn, by any means, you win.", cards: ["Ramses, Assassin Lord"] },
        { text: "Without Ramses, spread the hits: each Assassin that connects cloaks a card.", cards: ["Etrata, Deadly Fugitive"] },
        { text: "Teferi's Veil out? Attack with everything that gets through: it all phases out after combat, out of reach of their wraths. Eldrazi Monument does the same job against destroy effects.", cards: ["Teferi's Veil", "Eldrazi Monument"] },
        { text: "Getting through: Tetsuko (power or toughness 1 or less), Reverse the Polarity, Rogue's Passage, Mothdust's flying, Roshan's menace on face-down creatures.", cards: ["Tetsuko Umezawa, Fugitive", "Reverse the Polarity", "Rogue's Passage"] }
      ]
    },
    {
      key: "end", when: "Main phase two: before you pass", phase: "main2",
      items: [
        { text: "Flip rarely: turn a stolen card up only when it beats the 2/2 it is, after your own spells. Stolen instants and sorceries: cast them through Etrata when they matter.", cards: ["Etrata, Deadly Fugitive"] },
        { text: "Kindred Dominance naming Assassin, with a type-changer out, kills every other creature and keeps your stolen 2/2s.", cards: ["Kindred Dominance", "Leyline of Transformation"] },
        { text: "Keep a counter up if you can. The Forces and Fierce Guardianship can be free.", cards: ["Force of Will", "Fierce Guardianship", "Force of Negation"] }
      ]
    },
    {
      key: "theirs", when: "On their turns", phase: "theirs",
      items: [
        { text: "Save the last counter for the wrath, and for removal aimed at Ramses or Etrata. Let single creatures and commanders resolve.", cards: ["Force of Will", "Swan Song"] },
        { text: "Vampiric Tutor at the end of the turn before yours, for Ramses.", cards: ["Vampiric Tutor", "Ramses, Assassin Lord"] },
        { text: "Cyclonic Rift overloaded at the end of the turn before yours clears every blocker.", cards: ["Cyclonic Rift"] }
      ]
    }
  ];
})(typeof window !== "undefined" ? window : globalThis);
