/* Real Origins TCG decklists from the community (originsmeta.com, read 2026-11-12). 12 base cards, each played x2.
   wr/games are the self-reported numbers on OriginsMeta, not ours. */
(function (root) {
  const D = (typeof module !== 'undefined' && module.exports) ? require('./cards.js') : root.OT.data;
  const s = D.slug;
  const RAW = [
    ['vh-crono', 'Van Helsing', 'Van Helsing (CoachCrono, Crimson Cup champion)', 'CoachCrono', null, null, 'Ali Baba, Baby Bear, Bridge Troll, Dark Omen, First Aid, Forbidden Knowledge, Phuong Hoang, Puck, Searing Light, Shahrazad, Spellbook, Tin Woodman'],
    ['vh-control', 'Van Helsing', 'Van Helsing Control', 'sircervello', 83, 18, 'Scarecrow, Shahrazad, Ali Baba, Baby Bear, Jill, Searing Light, Phuong Hoang, Spellbook, Boitata, Tin Woodman, Forbidden Knowledge, Obliterate'],
    ['vh-cure', 'Van Helsing', 'Cure Control', 'robip-origins', 67, 9, 'Scarecrow, Shahrazad, Ali Baba, Baby Bear, Jill, Mind Palace, Searing Light, Jekyll, Phuong Hoang, Spellbook, Tin Woodman, Forbidden Knowledge'],
    ['pigs-crono', 'Three Not So Little Pigs', 'Pigs (CoachCrono, Crimson Cup champion)', 'CoachCrono', null, null, 'Bullseye, Glinda, Golden Egg, Guy of Gisborne, Mind Palace, Mummy, Obliterate, Reinforcements, Sandman, Stroke of Midnight, Three Blind Mice, Trash for Treasure'],
    ['pigs-beauty', 'Three Not So Little Pigs', 'The Beauty & The Beast v.2', 'robip-origins', 76, 37, 'Mummy, Thumbelina, Bagheera, Jack-in-the-Box, Roo, Ali Baba, Baby Bear, Beast, En Passant, Humpty, Beauty, Galahad'],
    ['pigs-cerdis', 'Three Not So Little Pigs', 'Cerdis! Oink, oink', 'Vega', 60, 58, 'Stroke of Midnight, Morgiana, Roo, Ali Baba, Asanbosam, En Passant, Golden Egg, Humpty, Boogeyman, Bigfoot, Bridge Troll, Paul Bunyan'],
    ['pigs-swarm', 'Three Not So Little Pigs', 'Aggro Swarm-PIGS', 'ergitta', 70, 23, 'Bullseye, Mummy, Reinforcements, Sandman, Three Blind Mice, Trash for Treasure, Golden Egg, Boogeyman, Glinda, Spellbook, Galahad, Heroic Charge'],
    ['pigs-pikmin', 'Three Not So Little Pigs', 'Pikmin (token storm)', 'dillyg10', 64, 11, 'Bullseye, Defense Matrix, Reinforcements, Stroke of Midnight, Animate Object, Rumple, Sandman, Trash for Treasure, Mind Palace, Glinda, Spellbook, Sorcerer\'s Apprentice'],
    ['legion-crono', 'Legion of the Dead', 'Legion (CoachCrono, Crimson Cup champion)', 'CoachCrono', null, null, 'Asanbosam, Baby Bear, Boogeyman, Bridge Troll, Dark Omen, En Passant, Golden Egg, Morgiana, Mummy, Obliterate, Paul Bunyan, Trash for Treasure'],
    ['legion-aggro', 'Legion of the Dead', 'Legion Aggro', 'arxeon', 60, 63, 'Mummy, Morgiana, Red Knight, Asanbosam, Dark Omen, Golden Egg, Jack, Boogeyman, Boitata, Bridge Troll, Paul Bunyan, Obliterate'],
    ['legion-control', 'Legion of the Dead', 'LegionHardControl', 'deltonazz96', 67, 24, 'First Aid, Shahrazad, Baby Bear, Dark Omen, Golden Egg, Humpty, Jill, Phuong Hoang, Spellbook, Tin Woodman, Forbidden Knowledge, Obliterate'],
    ['drac-mid', 'Dracula', 'Midrangeula', 'dillyg10', 67, 30, 'Morgan le Fay, Ugly Duckling, Aladdin, Asanbosam, Quasimodo, Searing Light, Underworld Flare, Bridge Troll, Captain Ahab, Genie, Rain of Arrows, Koschei'],
    ['drac-vamp', 'Dracula', 'Legend Of The Vampire', 'gamesfordads', 55, 385, 'Morgan le Fay, Ugly Duckling, Aladdin, Asanbosam, Quasimodo, Searing Light, Underworld Flare, Captain Ahab, Franken Bride, Genie, Rain of Arrows, Koschei'],
    ['robin-mid', 'Robin Hood', 'Robin Midrange', 'moogfanatic', 76, 63, 'Bullseye, Bagheera, Scarecrow, Ali Baba, Big Bad Wolf, Dark Omen, Golden Egg, Boogeyman, Little John, White Queen, Bridge Troll, Cockatrice'],
    ['robin-scala', 'Robin Hood', 'Scala la ladder', 'robip-origins', 62, 78, 'Axe Throw, Bagheera, Red Knight, Scarecrow, Ali Baba, Big Bad Wolf, Dark Omen, Golden Egg, Boogeyman, White Queen, Boitata, Bridge Troll'],
    ['arthur-potion', 'King Arthur', 'Armata Potionsky', 'blaser993', 75, 4, 'Defense Matrix, Twister Toss, Card Soldier, Scarecrow, Baby Bear, Dark Omen, En Passant, Flying Monkey, Mind Palace, Wicked Witch of the West, Magic Carpet, Obliterate'],
    ['qoh-monster', 'Queen of Hearts', 'A-Head of the Monster', 'community', 53, 77, 'Bullseye, First Aid, Merlin\'s Prophecy, Dark Omen, It\'s Alive, Mind Palace, Piggy Bank, Searing Light, Franken Bride, Rain of Arrows, Frank\'s Monster, Forbidden Knowledge'],
    ['dorothy-move', 'Dorothy', 'Pegasus [Move Deck]', 'Raiken', 50, 2, 'Defense Matrix, Stroke of Midnight, Twister Toss, Card Soldier, Roo, Ali Baba, En Passant, Flying Monkey, Kanga, Pegasus, Wicked Witch of the West, Lancelot'],
  ];
  // Crimson Cup 2026 (19 to 25 Oct, $10,000, Conquest with one ban), lists from originsvault.net. CoachCrono's three
  // winning lists are the first, fourth and ninth rows above.
  const CUP = [
    ['merlin-soul', 'Merlin', 'Merlin (SouL, Crimson Cup 2nd)', 'SouL', 'Baby Bear, First Aid, Roo, Scarecrow, Dark Omen, Mind Palace, Piggy Bank, Puck, Bridge Troll, Tin Woodman, Forbidden Knowledge, Obliterate'],
    ['mulan-soul', 'Mulan', 'Mulan (SouL, Crimson Cup 2nd)', 'SouL', 'Bullseye, Stroke of Midnight, Bagheera, Scarecrow, Frog Prince, Jack, Mind Palace, Puck, White Queen, Boitata, Tin Woodman, Ellen Trechend'],
    ['pigs-soul', 'Three Not So Little Pigs', 'Pigs (SouL, Crimson Cup 2nd)', 'SouL', 'Bullseye, Reinforcements, Stroke of Midnight, Trash for Treasure, Roo, Sandman, Ali Baba, Golden Egg, Mind Palace, Glinda, Paul Bunyan, Obliterate'],
    ['vh-felix', 'Van Helsing', 'Van Helsing (Felixnxx, Crimson Cup 3rd)', 'Felixnxx', 'Baby Bear, Scarecrow, Shahrazad, Ali Baba, Jill, Mind Palace, Jekyll, Phuong Hoang, Searing Light, Rain of Arrows, Tin Woodman, Forbidden Knowledge'],
    ['legion-felix', 'Legion of the Dead', 'Legion (Felixnxx, Crimson Cup 3rd)', 'Felixnxx', 'Mummy, Stroke of Midnight, Trash for Treasure, Morgiana, Asanbosam, Dark Omen, En Passant, Flying Monkey, Golden Egg, Boogeyman, Impundulu, Paul Bunyan'],
    ['pigs-felix', 'Three Not So Little Pigs', 'Pigs (Felixnxx, Crimson Cup 3rd)', 'Felixnxx', 'Defense Matrix, Mummy, Reinforcements, Trash for Treasure, Musketeer, Sandman, Three Blind Mice, Golden Egg, Mind Palace, Glinda, Guy of Gisborne, Obliterate'],
    ['mulan-harry', 'Mulan', 'Mulan (OrdinaryHarry, Crimson Cup 4th)', 'OrdinaryHarry', 'Stroke of Midnight, Baby Bear, Bagheera, Black Knight, En Passant, Jekyll, Puck, White Queen, Fairy Godmother, Mowgli, Tin Woodman, Ellen Trechend'],
    ['vh-harry', 'Van Helsing', 'Van Helsing (OrdinaryHarry, Crimson Cup 4th)', 'OrdinaryHarry', 'Baby Bear, Scarecrow, Shahrazad, Ali Baba, Jill, Jekyll, Phuong Hoang, Searing Light, Spellbook, Boitata, Tin Woodman, Forbidden Knowledge'],
    ['pigs-harry', 'Three Not So Little Pigs', 'Pigs (OrdinaryHarry, Crimson Cup 4th)', 'OrdinaryHarry', 'Baby Bear, Roo, Rumple, Ali Baba, Dark Omen, En Passant, Golden Egg, Boogeyman, Jekyll, Bridge Troll, Guy of Gisborne, Obliterate'],
    ['legion-bdb', 'Legion of the Dead', 'Legion Midrange (BDB, Crimson Cup top 24)', 'BDB', 'Bullseye, Baby Bear, Bagheera, Morgiana, Scarecrow, Asanbosam, Big Bad Wolf, En Passant, Golden Egg, Boogeyman, Impundulu, Obliterate'],
    ['pigs-bdb', 'Three Not So Little Pigs', 'Piggie Swarm (BDB, Crimson Cup top 24)', 'BDB', 'Bullseye, Defense Matrix, Mummy, Reinforcements, Trash for Treasure, Sandman, Scarecrow, Three Blind Mice, Beast, Glinda, Impundulu, Ellen Trechend'],
    // Lists printed in the fan wiki's deck guides (originstcg.wiki/decks), no win rate given.
    ['drac-wiki', 'Dracula', 'Dracula Discard (wiki guide)', 'originstcg.wiki', 'Shahrazad, Ugly Duckling, Aladdin, Quasimodo, Asanbosam, Old MacDonald, Captain Ahab, Koschei, Genie, Spellbook, Underworld Flare, Dark Omen'],
    ['merlin-wiki', 'Merlin', 'Merlin Combo (wiki guide)', 'originstcg.wiki', 'Merlin\'s Prophecy, Obliterate, Sandman, Piggy Bank, Spellbook, Defense Matrix, Dark Omen, Axe Throw, Rain of Arrows, Forbidden Knowledge, Cowardly Lion, Sorcerer\'s Apprentice'],
    ['robin-wiki', 'Robin Hood', 'Robin Hood Snipe (wiki guide)', 'originstcg.wiki', 'Bagheera, Itsy Bitsy Spider, Scarecrow, Golden Egg, Black Knight, Wicked Stepsisters, Christopher Robin, Marian, Galahad, Paul Bunyan, Bullseye, Axe Throw'],
    ['qoh-wiki', 'Queen of Hearts', 'Queen of Hearts Deathrattle (wiki guide)', 'originstcg.wiki', 'Boogeyman, Golden Egg, Cockatrice, Baby Bear, Mummy, Three Blind Mice, Bagheera, Three Musketeers, Ellen Trechend, Poison Apple, Trash for Treasure, Mind Palace'],
  ];
  for (const [key, legend, name, author, list] of CUP) RAW.push([key, legend, name, author, null, null, list]);
  const NOTES = {};
  const META = RAW.map(([key, legend, name, author, wr, games, list]) => {
    const cards = list.split(',').map((x) => s(x.trim()));
    for (const c of cards) if (!D.CARDS[c]) throw new Error('unknown card ' + c + ' in ' + key);
    if (new Set(cards).size !== 12) throw new Error('deck ' + key + ' does not have 12 different cards');
    return { key, legend: s(legend), name, author, wr, games, cards, note: NOTES[key] || null,
      source: author === 'originstcg.wiki' ? 'wiki' : (/Crimson Cup/.test(name) ? 'cup' : 'ladder') };
  });
  const API = { META };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else (root.OT = root.OT || {}).decks = API;
})(typeof self !== 'undefined' ? self : this);
