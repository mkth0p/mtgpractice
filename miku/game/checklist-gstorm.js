/* The Goblin Storm turn checklist (Zada, Hedron Grinder): what to check at each moment of a game, in
   order. The Play tab shows it in the Coach panel and the Goblin Storm site prints it as a page. It
   needs nothing else, so both can load it. Card names are exact so the pages can link them. */
(function (root) {
  "use strict";
  (root.MK_CHECKLISTS = root.MK_CHECKLISTS || {}).gstorm = [
    {
      key: "mulligan", when: "Opening hand", phase: "mulligan",
      items: [
        { text: "Keep 2 to 4 lands with a cheap Goblin, a token spell or Sol Ring.", cards: ["Sol Ring", "Goblin Lackey", "Dragon Fodder"] },
        { text: "Mulligan a hand of only rituals and storm cards: they need a board first.", cards: ["Seething Song", "Grapeshot"] }
      ]
    },
    {
      key: "upkeep", when: "Your upkeep", phase: "upkeep",
      items: [
        { text: "Mogg War Marshal's echo: let it die for the second token unless you need the body.", cards: ["Mogg War Marshal"] },
        { text: "Redcap Gutter-Dweller: sacrifice a spare token to play your top card this turn.", cards: ["Redcap Gutter-Dweller"] }
      ]
    },
    {
      key: "main1", when: "First main phase", phase: "main1",
      items: [
        { text: "Make bodies first: tap Krenko, cast token spells, use Kher Keep.", cards: ["Krenko, Mob Boss", "Kher Keep"] },
        { text: "Count your creatures, then point cheap targeted spells at Zada only.", cards: ["Zada, Hedron Grinder", "Expedite", "Ancestors' Aid"] },
        { text: "Rituals after the tokens: Brightstone Ritual and Battle Hymn grow with the board.", cards: ["Brightstone Ritual", "Battle Hymn"] },
        { text: "Count storm before Grapeshot, Empty the Warrens or Haze of Rage. Copies don't count.", cards: ["Grapeshot", "Empty the Warrens", "Haze of Rage"] },
        { text: "Storm-Kiln Artist out and three spells cast? A buyback Haze of Rage pays for itself.", cards: ["Storm-Kiln Artist", "Haze of Rage"] }
      ]
    },
    {
      key: "combat", when: "Combat", phase: "combat",
      items: [
        { text: "New tokens need haste: Chieftain, Warchief, Howlsquad Heavy, or Wild Ride on Zada.", cards: ["Goblin Chieftain", "Goblin Warchief", "Howlsquad Heavy", "Wild Ride"] },
        { text: "Boast with Broadside Bombardiers after it attacks.", cards: ["Broadside Bombardiers"] },
        { text: "Great Train Heist after blockers: untap, extra combat, Treasures.", cards: ["Great Train Heist"] }
      ]
    },
    {
      key: "their", when: "Their turns", phase: "theirs",
      items: [
        { text: "A wipe coming? Sacrifice tokens in response to Goblin Bombardment or Skirk Prospector.", cards: ["Goblin Bombardment", "Skirk Prospector"] },
        { text: "Spare mana at their end step: Kher Keep, Fountainport, War Room.", cards: ["Kher Keep", "Fountainport", "War Room"] }
      ]
    }
  ];
})(typeof window !== "undefined" ? window : globalThis);
