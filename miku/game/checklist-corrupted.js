/* The Corrupted Miku turn checklist: what to check at each moment of a game, in order. The Play tab
   shows it in the Coach panel next to the live tips, and the Corrupted Miku site prints it as a page.
   It needs nothing else, so both can load it. Card names are exact so the pages can link them. */
(function (root) {
  "use strict";
  (root.MK_CHECKLISTS = root.MK_CHECKLISTS || {}).corrupted = [
    {
      key: "mulligan", when: "Opening hand", phase: "mulligan",
      items: [
        { text: "Keep a hand with 2+ lands or fast mana and a plan for turns 1 to 3.", cards: [] },
        { text: "A tutor counts as the combo piece it can find. One combo piece plus one tutor is a great keep.", cards: ["Worldly Tutor", "Eladamri's Call", "Chord of Calling"] },
        { text: "Not going first with Gemstone Caverns? Begin with it on the battlefield (exile your worst card).", cards: ["Gemstone Caverns"] },
        { text: "Mulligan a hand with no green source: most of the deck needs {G}.", cards: [] }
      ]
    },
    {
      key: "upkeep", when: "Your upkeep", phase: "upkeep",
      items: [
        { text: "Summoner's Pact cast last turn? Pay {2}{G}{G} now or you lose.", cards: ["Summoner's Pact"] },
        { text: "The One Ring: you lose 1 life per burden counter.", cards: ["The One Ring"] },
        { text: "Urza's Saga gets a lore counter after your draw step.", cards: ["Urza's Saga"] }
      ]
    },
    {
      key: "draw", when: "After you draw", phase: "draw",
      items: [
        { text: "Sylvan Library: look at the top three. Pay 4 life per extra card only when it wins the game.", cards: ["Sylvan Library"] },
        { text: "Ask: do I already have a combo, or am I one card away?", cards: [] }
      ]
    },
    {
      key: "main", when: "Main phase: in this order", phase: "main1",
      items: [
        { text: "1. Land drop first (fetch lands: crack them now for deck thinning and Cradle-safe sequencing).", cards: [] },
        { text: "2. Fast mana: Sol Ring, Mana Vault, Chrome Mox, Mox Diamond. Deafening Silence out? Only one noncreature spell this turn, yours too.", cards: ["Sol Ring", "Deafening Silence"] },
        { text: "3. Lock piece or Shalai? Fast-combo table: Grand Abolisher, Drannith or Deafening Silence first. Removal-heavy table: Shalai first.", cards: ["Grand Abolisher", "Shalai, Voice of Plenty"] },
        { text: "4. Before a combo piece: is Shalai out, is an opponent's turn safe (Abolisher, Kutzil, Voice of Victory), or do you hold Silence?", cards: ["Silence", "Kutzil, Malamet Exemplar"] },
        { text: "5. Tutor for the missing piece. Green-only tutors (Pact, Green Sun's Zenith, Natural Order) can't find Vizier, Ballista, Heliod or Thune.", cards: ["Summoner's Pact", "Green Sun's Zenith"] },
        { text: "6. Lightning Greaves goes on Shalai, or on Devoted Druid the turn you combo.", cards: ["Lightning Greaves"] }
      ]
    },
    {
      key: "combo", when: "Going off", phase: "combo",
      items: [
        { text: "Thune + Spike Feeder: remove a counter (gain 2) again and again. Instant speed, no mana.", cards: ["Archangel of Thune", "Spike Feeder"] },
        { text: "Heliod + Ballista: Ballista needs 2 counters. Give it lifelink ({1}{W}), then ping.", cards: ["Heliod, Sun-Crowned", "Walking Ballista"] },
        { text: "Druid + Vizier: unlimited {G}. Spend it on Ballista, Shalai's ability or Finale of Devastation X 10+.", cards: ["Devoted Druid", "Vizier of Remedies", "Finale of Devastation"] },
        { text: "Infinite life alone doesn't win. Find Walking Ballista or attack with the huge team.", cards: ["Walking Ballista"] },
        { text: "Natural Order into Craterhoof kills one opponent with 6 to 7 attackers. The whole table needs about 10 to 11.", cards: ["Natural Order", "Craterhoof Behemoth"] }
      ]
    },
    {
      key: "combat", when: "Combat", phase: "combat",
      items: [
        { text: "Attack the player who can stop your combo, not the lowest life total.", cards: [] },
        { text: "Voice of Victory: mobilize gives two 1/1s, and opponents can't cast spells on your turn.", cards: ["Voice of Victory"] },
        { text: "Kutzil draws when a creature with extra power deals combat damage. Gavony's counters count.", cards: ["Kutzil, Malamet Exemplar", "Gavony Township"] }
      ]
    },
    {
      key: "end", when: "Before you pass", phase: "main2",
      items: [
        { text: "Leave {W} or {G} up for Swords, Path, Veil of Summer, Silence or Reprieve.", cards: ["Swords to Plowshares", "Veil of Summer", "Reprieve"] },
        { text: "Flash creatures (Aven Mindcensor, Archivist of Oghma, Endurance) are best cast at end of the turn before yours.", cards: ["Aven Mindcensor", "Archivist of Oghma"] },
        { text: "Keep Giver of Runes untapped to protect Shalai.", cards: ["Giver of Runes"] }
      ]
    },
    {
      key: "theirs", when: "On their turns", phase: "theirs",
      items: [
        { text: "Someone about to win? Silence or Orim's Chant in their upkeep stops the whole turn.", cards: ["Silence", "Orim's Chant"] },
        { text: "Board wipe on the stack: Teferi's Protection or Flawless Maneuver (free with Shalai out).", cards: ["Teferi's Protection", "Flawless Maneuver"] },
        { text: "Graveyard deck going off? Evoke Endurance to shuffle their graveyard away.", cards: ["Endurance"] },
        { text: "Searching opponent: Aven Mindcensor in response limits them to the top four.", cards: ["Aven Mindcensor"] }
      ]
    }
  ];
})(typeof window !== "undefined" ? window : globalThis);
