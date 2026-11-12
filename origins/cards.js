/* Origins TCG card pool (Koin Games), client 0.8.2, game data version 1266 (Steam build of 11 Nov 2026).
   Every card, Legendary power and location here was checked on 2026-11-12 against the data extracted from the game
   files (all 156 live cards and created cards, 12 Legendaries, the 43 locations of the standard pool).
   Texts are shortened in places. setPatch('0.7') rebuilds the pool as it was from 29 Sep to 3 Nov 2026 (Crimson
   Cup, older ladder data), from the patch history kept by OriginsMeta.
   Row: [name, cost, power, health, alignment (G/E/N), keywords, text, flags]
   power = null for spells. flags: 'L' legendary, 'T' token / created card. */
(function (root) {
  const ROWS = [
    // ---- Legendaries
    ['Dorothy', 4, 3, 3, 'G', 'move', 'I can Move each round. I have +1/+1 for each time an ally moved this game.', 'L'],
    ['Dracula', 4, 3, 2, 'E', '', 'When you discard, return me from your graveyard to hand. On Reveal: Summon Brides of Dracula [2/2] on a random space here.', 'L'],
    ['Mulan', 4, 2, 4, 'G', 'double', 'Double Attack. When an ally On Reveal ability happens, repeat it.', 'L'],
    ['Queen of Hearts', 4, 3, 3, 'E', 'first', 'First Strike. When an ally On Death ability happens, repeat it.', 'L'],
    ['Van Helsing', 4, 3, 4, 'G', '', 'Before combat, add Van Helsing\'s Tools to your hand if it is not already there.', 'L'],
    ['Wicked Stepmother', 4, 4, 6, 'E', 'deathtouch', 'Deathtouch. On Reveal: Give your Evil characters Deathtouch.', 'L'],
    ['Merlin', 5, 5, 5, 'N', '', 'Repeat the first spell you play each round.', 'L'],
    ['Dr. Frank', 6, 2, 2, 'E', '', 'Before combat, summon a random character from your graveyard on a random space.', 'L'],
    ['King Arthur', 7, 7, 7, 'G', 'shield', 'Shield. On Reveal: Give your Good characters Shield.', 'L'],
    ['Legion of the Dead', 7, null, null, 'N', '', 'Fill your board with Zombies [2/2].', 'L'],
    ['Three Not So Little Pigs', 7, 3, 3, 'N', 'trample', 'Trample. On Reveal: Summon a Not So Little Pig [3/3] with Trample on a random space at each other location.', 'L'],
    ['Robin Hood', 8, 4, 4, 'G', 'snipe3', 'Snipe 3. On Reveal: Deal 2 damage to all enemies.', 'L'],

    // ---- Cost 0-1
    ['Itsy Bitsy Spider', 0, 1, 1, 'E', '', ''],
    ['Bullseye', 1, null, null, 'N', '', 'Deal 3 damage to ANY character.'],
    ['Defense Matrix', 1, null, null, 'N', '', 'Give ANY character Shield.'],
    ['Freeze!', 1, null, null, 'N', '', 'Stun ANY character.'],
    ['Mummy', 1, 1, 1, 'E', 'rebirth', 'Rebirth'],
    ['Poison Apple', 1, null, null, 'N', '', 'Give ANY character Deathtouch.'],
    ['Reinforcements', 1, null, null, 'N', '', 'Summon a Merry Man [1/1] on two random spaces.'],
    ['Stroke of Midnight', 1, null, null, 'N', '', 'Return ANY character to its owner\'s hand.'],
    ['Thumbelina', 1, 2, 2, 'G', '', ''],
    ['Toto', 1, 1, 1, 'G', '', 'After an enemy is played here, I move to another location and get +1 power.'],
    ['Twister Toss', 1, null, null, 'N', '', 'Move an ally to any space. If a card is already there, they swap spaces.'],

    // ---- Cost 2
    ['Animate Object', 2, null, null, 'N', '', 'Choose a space. Summon a Broomstick [1/1] there.'],
    ['Axe Throw', 2, null, null, 'N', '', 'Deal 4 damage to ANY character.'],
    ['Bagheera', 2, 1, 1, 'G', '', 'On Reveal: If I\'m on a middle space, I get +2/+2.'],
    ['Banshee', 2, 2, 1, 'E', '', 'On Death: Allies get +1 power.'],
    ['Basilisk', 2, 1, 2, 'E', 'deathtouch', 'Deathtouch'],
    ['Billy', 2, 2, 2, 'E', '', 'On Death: Deal 2 damage to a random enemy here.'],
    ['Card Soldier', 2, 3, 1, 'N', '', 'After I move, summon a copy of me on my previous space.'],
    ['Don Quixote', 2, 2, 3, 'G', 'defender', 'Defender. Enemies here have Defender.'],
    ['Esmeralda', 2, 2, 3, 'N', '', 'When I\'m discarded, give a random ally Shield.'],
    ['First Aid', 2, null, null, 'N', '', 'Heal 6 damage from ANY character or barrier.'],
    ['Huck Finn', 2, 3, 2, 'G', '', ''],
    ['Jack-in-the-Box', 2, 2, 1, 'E', '', 'On Death: Deal 2 damage to the opponent\'s barrier here.'],
    ['Lady of the Lake', 2, 2, 2, 'G', '', 'When you play a Good character, give it Defender.'],
    ['Lightning Strike', 2, null, null, 'N', '', 'Deal 3 damage to ANY character or barrier.'],
    ['Merlin\'s Prophecy', 2, null, null, 'N', '', 'Repeat the next spell you play this round.'],
    ['Morgan le Fay', 2, 1, 3, 'E', '', 'On Reveal: Discard your right-most card. Add a random spell to your hand and reduce its cost by 2.'],
    ['Morgiana', 2, 2, 3, 'G', '', 'Prevent ALL On Reveal abilities from happening here.'],
    ['Musketeer', 2, 2, 1, 'G', 'first', 'First Strike'],
    ['Piglet', 2, 2, 1, 'G', '', 'On Reveal: Give other allies here +1 power.'],
    ['Red Knight', 2, 4, 1, 'N', 'trample', 'Trample. Ongoing: The character across from me has Trample.'],
    ['Roo', 2, 2, 4, 'G', 'move', 'Move'],
    ['Rumple', 2, 2, 2, 'E', '', 'On Reveal: You get +1 mana next round.'],
    ['Sandman', 2, 1, 3, 'N', '', 'Your spells cost 1 less to play.'],
    ['Scarecrow', 2, 1, 1, 'G', '', 'On Reveal: Draw a card.'],
    ['Shahrazad', 2, 1, 4, 'G', '', 'When a card enters your hand, heal 1 damage from your barrier here.'],
    ['Three Blind Mice', 2, 1, 1, 'N', '', 'On Death: Summon a Mouse [1/1] on two random spaces.'],
    ['Trash for Treasure', 2, null, null, 'N', '', 'Destroy an ally to draw 2 cards.'],
    ['Ugly Duckling', 2, 0, 4, 'N', '', 'When you discard a card, I transform into Beautiful Swan [4/4].'],

    // ---- Cost 3
    ['Aladdin', 3, 3, 3, 'G', '', 'When I\'m discarded, summon me on a random space.'],
    ['Ali Baba', 3, 2, 3, 'G', '', 'When I damage an opponent\'s barrier, draw a card.'],
    ['Asanbosam', 3, 5, 5, 'E', '', 'On Reveal: Discard a random even-cost card.'],
    ['Baby Bear', 3, 1, 1, 'N', '', 'When an enemy damages your barrier here, deal 1 damage to that enemy. On Death: Add Papa Bear [4/4] to your hand.'],
    ['Beast', 3, 2, 3, 'E', '', 'When you play an ally, I get +1/+1.'],
    ['Big Bad Wolf', 3, 3, 3, 'E', '', 'After combat, I get +1/+1.'],
    ['Black Knight', 3, 2, 2, 'N', '', 'On Reveal: Deal 2 damage to the enemy across from me.'],
    ['Cowardly Lion', 3, 2, 5, 'G', 'defender', 'Defender'],
    ['Dark Omen', 3, null, null, 'N', '', 'Destroy ANY character.'],
    ['Davy Crockett', 3, 2, 2, 'N', 'defender', 'Defender. On Death: The top character of your deck gets +2/+2.'],
    ['En Passant', 3, null, null, 'N', '', 'Move an ally. Deal damage equal to its power to the character across from it.'],
    ['Flying Monkey', 3, 4, 1, 'E', '', 'On Reveal: Move ANY other character to a random space here.'],
    ['Frog Prince', 3, 2, 2, 'N', '', 'Choose One: On Reveal: I get +3 power OR I get +3 health.'],
    ['Golden Egg', 3, 0, 1, 'N', '', 'On Death: Summon a Golden Goose [5/5] on this space.'],
    ['Humpty', 3, 4, 1, 'E', '', 'On Death: Add a random card to your hand.'],
    ['It\'s Alive', 3, null, null, 'N', '', 'Summon a random character from your graveyard to a random space.'],
    ['Jack', 3, 4, 2, 'N', '', 'On Reveal: Destroy a random enemy that has 7 or more power.'],
    ['Jill', 3, 2, 4, 'N', '', 'When I take damage, heal 2 damage from your barrier here.'],
    ['Kanga', 3, 2, 3, 'G', '', 'Before combat, give allies that moved this round +1/+1.'],
    ['King Shahryar', 3, 1, 4, 'E', '', 'At the start of the round, draw a card. Discard it before combat.'],
    ['Mary', 3, 1, 1, 'N', '', 'On Reveal: Add a Little Lamb [1/1] to your hand. On Death: Your Little Lambs everywhere get +3/+3 permanently.'],
    ['Mind Palace', 3, null, null, 'N', '', 'Draw 2 cards.'],
    ['Pegasus', 3, 2, 4, 'G', '', 'After I move, double my power.'],
    ['Piggy Bank', 3, null, null, 'N', '', 'You get +1 mana permanently.'],
    ['Quasimodo', 3, 3, 4, 'G', '', 'On Reveal: Discard your lowest-cost card. Draw a card.'],
    ['Queen of the Night', 3, 2, 3, 'E', '', 'When you play a spell, deal 2 damage to the opponent\'s barrier here.'],
    ['Searing Light', 3, null, null, 'N', '', 'Deal 4 damage to an enemy. Heal 4 damage from your barrier there.'],
    ['Shield Maiden', 3, 3, 1, 'G', 'shield', 'Shield'],
    ['Wicked Stepsisters', 3, 3, 4, 'E', '', ''],
    ['Wicked Witch of the West', 3, 1, 5, 'E', '', 'When I survive damage, add a Flying Monkey [4/1] to your hand and I move one space to the left.'],

    // ---- Cost 4
    ['Beauty', 4, 2, 1, 'G', '', 'When you play an ally, draw a card.'],
    ['Blow the House Down', 4, null, null, 'N', '', 'Choose an ally. It deals damage equal to its power to ALL enemies there.'],
    ['Boogeyman', 4, 7, 7, 'E', '', 'On Reveal: Destroy the ally here with the lowest power, even if it\'s me.'],
    ['Christopher Robin', 4, 5, 4, 'G', '', ''],
    ['Doppelganger', 4, 2, 2, 'E', '', 'When you discard a character, I transform into a copy of that character.'],
    ['Glinda', 4, 2, 4, 'G', '', 'When you play a spell, give allies +1 power.'],
    ['Huntsman', 4, 4, 4, 'G', '', 'On Kill: I get +1/+1.'],
    ['Imhotep', 4, 2, 2, 'E', '', 'On Death: Deal 2 damage to all enemies here.'],
    ['Jekyll', 4, 3, 5, 'G', '', 'On Reveal: Heal 3 damage from ANY other character or barrier here. If I\'m in hand after combat, I transform into Hyde [5/3].'],
    ['Lancelot', 4, 4, 4, 'G', '', 'When you play a Good character here, give it +2/+2.'],
    ['Little John', 4, 4, 4, 'G', '', 'On Reveal: If an enemy was played here this round, I get +2/+2.'],
    ['Magic Carpet', 4, 4, 4, 'G', '', 'Choose One: On Reveal: Move other allies one space left OR one space right.'],
    ['Marian', 4, 3, 3, 'G', 'snipe2', 'Snipe 2'],
    ['Mothman', 4, 4, 3, 'E', '', 'On Reveal: Ruin this location.'],
    ['Necromancer', 4, 2, 2, 'E', '', 'On Reveal: Discard a random card to add 2 Zombies [2/2] to your hand. If you discarded an Evil card, summon those Zombies instead.'],
    ['Old MacDonald', 4, 4, 4, 'N', '', 'The first time ANY player discards each round, shuffle three Pumpkins into your opponent\'s deck.'],
    ['Phuong Hoang', 4, 2, 3, 'N', 'rebirth move', 'Rebirth, Move. When an ally or barrier is healed, I get +1/+1.'],
    ['Puck', 4, 3, 5, 'N', '', 'When an enemy or an opponent\'s barrier is healed, deal that much damage to it instead.'],
    ['Spellbook', 4, null, null, 'N', '', 'For the rest of the game, add a random spell to your hand at the start of the round. Discard it before combat.'],
    ['Tweedledum', 4, 2, 2, 'N', '', 'On Reveal: Summon Tweedledee, a copy of me, at another random location.'],
    ['Underworld Flare', 4, null, null, 'N', '', 'Deal 6 damage to an enemy. When this is discarded, deal 6 damage to a random enemy.'],
    ['White Queen', 4, 3, 3, 'N', '', 'On Reveal: Return ANY character to its owner\'s hand.'],

    // ---- Cost 5
    ['Baloo', 5, 6, 6, 'G', '', ''],
    ['Bigfoot', 5, 6, 3, 'N', 'trample', 'Trample'],
    ['Boitata', 5, 5, 5, 'G', '', 'If a spell or ability would damage any of your barriers, deal that damage to the opponent\'s barrier there instead.'],
    ['Bridge Troll', 5, 5, 6, 'E', 'defender', 'Defender'],
    ['Captain Ahab', 5, 4, 2, 'N', '', 'On Reveal: Discard your highest-cost card to deal its cost as damage to an enemy.'],
    ['Fairy Godmother', 5, 3, 3, 'G', '', 'On Reveal: Give another ally +3/+3.'],
    ['Franken Bride', 5, 4, 4, 'E', 'rebirth', 'Rebirth. When I enter play from the graveyard, heal 4 damage from your barrier here.'],
    ['Galahad', 5, 4, 3, 'G', '', 'On Reveal: Give other allies +1/+1.'],
    ['Genie', 5, 4, 4, 'N', '', 'On Reveal: Discard your hand. Add 3 random spells to your hand.'],
    ['Hare', 5, 4, 1, 'N', 'first move', 'First Strike, Move'],
    ['Impundulu', 5, 3, 6, 'E', '', 'When I attack, add a Lightning Strike to your hand. Discard it before combat next round.'],
    ['Rain of Arrows', 5, null, null, 'N', '', 'Deal 2 damage to all enemies.'],
    ['Sorcerer\'s Apprentice', 5, 2, 3, 'N', '', 'When you play a spell, summon a Broomstick [1/1] on a random space.'],
    ['The Green Knight', 5, 5, 5, 'N', '', 'After combat, I heal all damage from myself.'],
    ['Three Musketeers', 5, 2, 1, 'G', 'first', 'First Strike. On Reveal: Summon a Musketeer [2/1] with First Strike on each space here.'],

    // ---- Cost 6+
    ['Cockatrice', 6, 6, 6, 'E', 'deathtouch', 'Deathtouch. On Death: Destroy a random enemy.'],
    ['Frank\'s Monster', 6, 5, 4, 'E', 'rebirth', 'Rebirth. When I enter play from the graveyard, double my power.'],
    ['Guy of Gisborne', 6, 3, 4, 'E', 'double snipe1', 'Double Attack, Snipe 1'],
    ['Heroic Charge', 6, null, null, 'N', '', 'Allies have +2 power and Trample this round.'],
    ['Koschei', 6, 3, 3, 'E', '', 'On Death or when discarded: I return to your hand and get +2/+2 permanently.'],
    ['Mowgli', 6, 2, 2, 'G', '', 'On Reveal: Summon Baloo [6/6] at another random location.'],
    ['Tin Woodman', 6, 3, 4, 'G', '', 'On Reveal: Heal 8 damage from ANY other character or barrier here.'],
    ['Paul Bunyan', 7, 10, 10, 'N', '', ''],
    ['Bandersnatch', 8, 7, 7, 'E', 'trample', 'Trample'],
    ['Ellen Trechend', 8, 3, 3, 'E', 'trample', 'Trample. On Reveal: I get +3/+3 for each enemy card here.'],
    ['Forbidden Knowledge', 8, null, null, 'N', '', 'Destroy ALL characters.'],
    ['Obliterate', 10, null, null, 'N', '', 'Deal 10 damage to ANY character or barrier.'],

    // ---- Created cards and tokens
    ['Brides of Dracula', 2, 2, 2, 'E', '', 'When you discard a card, I deal 1 damage to the opponent\'s barrier here and get +1 health.', 'T'],
    ['Zombie', 2, 2, 2, 'E', '', '', 'T'],
    ['Golden Goose', 3, 5, 5, 'N', '', '', 'T'],
    ['Hyde', 4, 5, 3, 'E', 'trample', 'Trample. If I\'m in your hand after combat, I transform into Jekyll [3/5].', 'T'],
    ['Van Helsing\'s Tools', 0, null, null, 'N', '', 'Choose One: Holy Water (remove all abilities from ANY character), Silver Bullet (1 damage to ANY character or barrier), Garlic (stun ANY character) or Wooden Stake (destroy ANY damaged character).', 'T'],
    ['Merry Man', 1, 1, 1, 'G', '', '', 'T'],
    ['Mama Bear', 7, 6, 6, 'N', '', 'When an enemy damages your barrier here, destroy that enemy.', 'T'],
    ['Papa Bear', 5, 4, 4, 'N', '', 'When an enemy damages your barrier here, deal 3 damage to that enemy. On Death: Add Mama Bear [6/6] to your hand.', 'T'],
    ['Not So Little Pig', 4, 3, 3, 'N', 'trample', 'Trample', 'T'],
    ['Tweedledee', 4, 2, 2, 'N', '', '', 'T'],
    ['Little Lamb', 1, 1, 1, 'N', '', '', 'T'],
    ['Little Pig', 1, 1, 1, 'N', '', '', 'T'],
    ['Reflection', 1, null, null, 'N', '', 'Repeat the On Reveal abilities of already revealed allies played from your hand this round.', 'T'],
    ['Off With Your Head!', 3, null, null, 'N', '', 'Destroy an ally to summon a base copy of it at each other location.', 'T'],
    ['Mouse', 1, 1, 1, 'N', '', '', 'T'],
    ['Broomstick', 1, 1, 1, 'N', '', 'When you play a spell, I get +1/+1.', 'T'],
    ['Beautiful Swan', 2, 4, 4, 'N', 'move', 'Move', 'T'],
    ['Pumpkin', 0, null, null, 'N', '', 'If this would be drawn, burn it to deal 5 damage to one of your barriers at random instead, then draw a card.', 'T'],
  ];

  const slug = (n) => n.toLowerCase().replace(/[!'.]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const CARDS = {};
  for (const r of ROWS) {
    const [name, cost, p, h, al, kw, text, flags = ''] = r;
    const id = slug(name);
    const k = {};
    for (const w of kw.split(/\s+/).filter(Boolean)) {
      const m = w.match(/^snipe(\d)$/);
      if (m) k.snipe = +m[1]; else k[w] = true;
    }
    CARDS[id] = { id, name, cost, p, h, al, kw: k, text, spell: p === null, leg: flags.includes('L'), token: flags.includes('T') };
  }
  const POOL = Object.values(CARDS).filter((c) => !c.leg && !c.token).map((c) => c.id);
  const LEGENDS = Object.values(CARDS).filter((c) => c.leg).map((c) => c.id);
  const SPELLS = POOL.filter((id) => CARDS[id].spell);

  // ---- Older patch. The balance patch of 4 Nov 2026 changed 11 cards and added Dr. Frank with 7 cards.
  // Values before that patch, from the OriginsMeta patch history (MetaShifting page).
  const PATCH_07 = {
    change: { 'dorothy': { p: 1, h: 1 }, 'genie': { cost: 6 }, 'searing-light': { cost: 4 }, 'baby-bear': { cost: 2 }, 'papa-bear': { cost: 4 }, 'mama-bear': { cost: 6 },
      'obliterate': { cost: 9 }, 'trash-for-treasure': { cost: 1 }, 'banshee': { p: 1, h: 1 }, 'esmeralda': { p: 2, h: 2 }, 'guy-of-gisborne': { p: 4, h: 4 } },
    absent: ['dr-frank', 'its-alive', 'franks-monster', 'franken-bride', 'morgan-le-fay', 'doppelganger', 'necromancer', 'red-knight'],
  };
  const NOW = { pool: POOL.slice(), legends: LEGENDS.slice(), spells: SPELLS.slice(), vals: {} };
  for (const id in PATCH_07.change) NOW.vals[id] = { cost: CARDS[id].cost, p: CARDS[id].p, h: CARDS[id].h };
  let patch = null;
  // Switches the whole process to another patch (null = current). The arrays are changed in place.
  function setPatch(name) {
    name = name || null;
    if (name === patch) return;
    if (name && name !== '0.7') throw new Error('unknown patch ' + name);
    patch = name;
    for (const id in NOW.vals) Object.assign(CARDS[id], NOW.vals[id], name ? PATCH_07.change[id] : {});
    const gone = name ? PATCH_07.absent : [];
    const fill = (arr, from) => { arr.length = 0; for (const id of from) if (!gone.includes(id)) arr.push(id); };
    fill(POOL, NOW.pool); fill(LEGENDS, NOW.legends); fill(SPELLS, NOW.spells);
  }

  // The 43 locations of the standard pool (Pool_0001 in the game data) with their rarity bucket. The game draws a
  // bucket with the odds below, then a location inside it: C common, R rare, V very rare, U ultra rare.
  const BUCKET = { C: 530, R: 400, V: 60, U: 10 };
  const LOCATIONS = [
    ['leyline', 'C', 'Arcane Leyline', 'Both players get +2 mana this round.'],
    ['castle-clouds', 'C', 'Castle in the Clouds', 'Cards that cost 7 or more cost 1 less to play.'],
    ['hundred-acre', 'C', 'Hundred Acre Wood', 'Summon Christopher Robin here for both players.'],
    ['knowledge-vault', 'C', 'Knowledge Vault', 'The first player to fill this location draws a card.'],
    ['open-meadow', 'C', 'Open Meadow', 'When a character enters play here, give it Move.'],
    ['overloaded', 'C', 'Overloaded Circuit', 'The first player to fill this location deals 5 damage to the opponent\'s barrier here.'],
    ['sherwood', 'C', 'Sherwood Forest', 'Summon a Merry Man at a random location each round.'],
    ['soul-artillery', 'C', 'Soul Artillery', 'After a character here dies, deal 1 damage to BOTH barriers.'],
    ['stomping', 'C', 'Stomping Grounds', 'Characters here have Trample.'],
    ['vacant-armory', 'C', 'Vacant Armory', 'Characters here have +1 Power.'],
    ['human-cannon', 'R', '"Human" Cannon', 'When you play a character here, destroy it and deal damage equal to its Power to the opponent\'s barrier.'],
    ['ballroom', 'R', 'Ballroom', 'After combat, return a random character here to its owner\'s hand for both players.'],
    ['blessed', 'R', 'Blessed Grounds', 'When a Good character is played here, give it Shield.'],
    ['broom-closet', 'R', 'Broom Closet', 'When you play a spell, allies here get +1 Power/+1 Health.'],
    ['burial', 'R', 'Burial Grounds', 'On Death abilities happen twice here.'],
    ['burnturn', 'R', 'Burnturn Arena', 'After combat, deal 1 damage to ALL characters here.'],
    ['conveyor', 'R', 'Conveyor Belt', 'After combat, move ALL characters here one space to the right.'],
    ['field-mice', 'R', 'Field of Mice', 'After a character enters play here, stun it.'],
    ['hero-emerges', 'R', 'Hero Emerges', 'Draw your Legendary card. If you can\'t, draw a card instead.'],
    ['junkyard', 'R', 'Junkyard', 'Both players discard a random card.'],
    ['mana-battery', 'R', 'Mana Battery', 'Keep your leftover mana between rounds.'],
    ['mirror', 'R', 'Mirror Dimension', 'On Reveal abilities happen twice here.'],
    ['poison-grounds', 'R', 'Poison Grounds', 'Evil characters here have Deathtouch.'],
    ['tectonic', 'R', 'Tectonic Decay', 'After combat, deal 1 damage to both barriers here.'],
    ['the-well', 'R', 'The Well', 'When you play a character here, heal 1 damage from your barrier here.'],
    ['tinkerer', 'R', 'Tinkerer\'s Toolbox', 'Both players draw a random 1-cost card from their deck.'],
    ['training-dojo', 'R', 'Training Dojo', 'After combat, ALL characters here get +1 Power.'],
    ['wall-dumpty', 'R', 'Wall of Dumpty', 'Destroy the first character you play here.'],
    ['windmill', 'R', 'Windmill Ridge', 'Characters here have Defender.'],
    ['amphitheatre', 'V', 'Amplifying Amphitheatre', 'ALL damage here is doubled.'],
    ['anti-magic', 'V', 'Anti-Magic Vault', 'Characters here lose all abilities.'],
    ['broken-gate', 'V', 'Broken Gate', 'Barriers here regenerate with 10 health instead of 40.'],
    ['cloning-lab', 'V', 'Cloning Lab', 'After you play a character here, fill your spaces here with copies of it.'],
    ['giants-beacon', 'V', 'Giant\'s Beacon', 'Draw your highest-cost card. Set its cost to 1.'],
    ['gold-wheel', 'V', 'Gold Spinning Wheel', 'Cards cost 1 less to play.'],
    ['reflecting-pool', 'V', 'Reflecting Pool', 'After you play a character here, copy it in another location.'],
    ['colosseum', 'V', 'The Colosseum', 'Characters here have Double Attack.'],
    ['gallows', 'V', 'The Gallows', 'When a character enters play here, destroy the enemy across from it.'],
    ['the-hill', 'V', 'The Hill', 'After combat, if there is more than one character here, destroy ALL characters who share the lowest Power.'],
    ['sultans-court', 'V', 'The Sultan\'s Court', 'At the start of each round, draw a card. Discard it before combat.'],
    ['treasurer', 'V', 'Treasurer\'s Office', 'Cards cost 1 more to play this round.'],
    ['wonderland', 'V', 'Wonderland', 'Combat order is reversed.'],
    ['nostradamus', 'U', 'Nostradamus\' Call', 'At the start of round 6, destroy both players\' decks.'],
  ].map(([id, rar, name, text]) => ({ id, rar, name, text }));

  // Legendary powers (Game Start), as written in the game files.
  const POWERS = {
    'van-helsing': 'Game Start: Add Van Helsing\'s Tools to your hand.',
    'king-arthur': 'Game Start: Add a Defense Matrix to your hand. It costs 1 less.',
    'three-not-so-little-pigs': 'Game Start: Summon a Little Pig [1/1] at each location.',
    'legion-of-the-dead': 'Game Start: Summon a Zombie [2/2] on a random space.',
    'robin-hood': 'Game Start: Add a Bullseye to your hand. It costs 1 less.',
    'merlin': 'Game Start: Add a Merlin\'s Prophecy to your hand.',
    'wicked-stepmother': 'Game Start: Add Poison Apple to your hand. It costs 1 less.',
    'mulan': 'Game Start: Add a Reflection to your hand.',
    'dr-frank': 'Game Start: Add It\'s Alive to your hand.',
    'dracula': 'Game Start: Add Brides of Dracula to your hand.',
    'queen-of-hearts': 'Game Start: Add Off With Your Head! to your hand.',
    'dorothy': 'Game Start: Add a Twister Toss to your hand.',
  };

  const API = { CARDS, POOL, LEGENDS, SPELLS, LOCATIONS, BUCKET, POWERS, PATCH_07, setPatch, slug };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else (root.OT = root.OT || {}).data = API;
})(typeof self !== 'undefined' ? self : this);
