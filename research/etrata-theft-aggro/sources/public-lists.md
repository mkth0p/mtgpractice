# Etrata, Deadly Fugitive: public lists and EDHREC data (aggro / theft focus)

Fetched **2026-10-05** (all numbers below are as of that day). This file is read-only research. Nothing here was invented: every number comes from the EDHREC JSON pages or the public decklists named below. Plan labels, highlights and the "unusual cards" notes are our own judgement and are marked as such.

**Contents**
1. EDHREC: commander page, themes, top cards, theme pages, average deck
2. Moxfield primer: "Fugitives (Best Bracket 4 Assassin Snowball)"
3. The 30 public decklists we read (index, plan labels, land counts)
4. Frequency table: cards in 3 or more of the 30 lists
5. Unusual or clever cards for an aggro/theft plan
6. Fetch log: what worked, what was blocked
7. Appendix: full decklists

**Short version (all numbers from the data below)**
- EDHREC has 3268 Etrata decks, but only 49 are tagged Aggro and 223 Theft; of the 819 that state a bracket, 523 are Bracket 2. The near-universal core is Roshan (89%), Changeling Outcast (80%), Training Grounds (79%), Mari (76%) and Ramses (70%).
- EDHREC Bracket 4 decks (42) add tutors and free counters, and play Maskwood Nexus (81%), Roaming Throne (60%), Vein Ripper (50%), Spark Double (48%) and Sakashima of a Thousand Faces (36%) far more than average. The Clones theme is the "copy Etrata" snowball: Auton Soldier 50%, Spark Double 67%, Irenicus 54%.
- We read 30 public lists (21 Archidekt, 9 Moxfield). 22 are mainly aggro/theft, 5 partly, 3 play other plans. In 2/3 or more of them: Training Grounds (28), Changeling Outcast (26), Mari (25), Ramses (25), Maskwood Nexus (21), Roshan (21), Hired Poisoner (20).
- Type-changers are standard: Maskwood 21/30, Roshan 21, Arcane Adaptation 16, Leyline of Transformation 13 (all 13 in aggro lists), Conspiracy 6. Trigger multipliers: Roaming Throne 17, Spark Double 10, Irenicus 10, Sakashima of a Thousand Faces 7, Sakashima the Impostor 6, Nanogene 6.
- Closers: Ramses alt-win in 25/30; Vein Ripper in 10 (only 2 also run a sac outlet); Thieving Amalgam 10; Thassa's Oracle backup in 2. Public lists run 33.4 lands on average (range 29-38), against 37 in the EDHREC average deck.
- The Fugitives primer (B4): cheap Assassins + fast mana, Etrata early, evasion, then copy Etrata (myriad Auton Soldier, Sakashimas, Irenicus) and turn every cloak into an Assassin (Maskwood / Arcane Adaptation / Conspiracy) to snowball. It wins with the swarm, by decking opponents, or with an altar + Vein Ripper. It has no mulligan section.

## 1. EDHREC

Source: `https://json.edhrec.com/pages/commanders/etrata-deadly-fugitive.json` (HTTP 200).

- **Total decks:** 3268 (EDHREC rank 823, salt 0.32).
- **Decks that state a bracket:** B1: 13, B2: 523, B3: 236, B4: 42, B5: 5 (total 819; the other decks have no bracket set).
- **Budget split:** budget: 326, middle: 2616, expensive: 326.
- **Average type counts:** creatures 27, instants 9, sorceries 7, artifacts 11, enchantments 8, planeswalkers 0, lands 37 (21 basic, 16 nonbasic).
- **Average mana curve (nonland):** 1 cmc: 10, 2 cmc: 18, 3 cmc: 13, 4 cmc: 13, 5 cmc: 5, 6 cmc: 1, 7 cmc: 1.
- **Deck save dates:** 2024-10-06 to 2026-10-05; 239 decks saved in the 30 days before fetch.
- **Combos EDHREC lists for this commander:** Brine Elemental + Vesuvan Shapeshifter; Hullbreaker Horror + Sol Ring; Unstoppable Slasher + Wound Reflection.
- **Similar commanders:** Kadena, Slinking Sorcerer; Ramses, Assassin Lord; Ixidor, Reality Sculptor; Vannifar, Evolved Enigma; Missy; Mari, the Killing Quill.

### 1.1 Themes / tags (deck counts)

| Theme | Decks | | Theme | Decks | | Theme | Decks |
|---|---:|---|---|---:|---|---|---:|
| Assassins (`assassins`) | 394 | | Theft (`theft`) | 223 | | Morph (`morph`) | 221 |
| Aggro (`aggro`) | 49 | | Control (`control`) | 30 | | Unblockable (`unblockable`) | 28 |
| Clones (`clones`) | 24 | | Freerunning (`freerunning`) | 19 | | Midrange (`midrange`) | 16 |
| Tempo (`tempo`) | 15 | | Combo (`combo`) | 12 | | Deathtouch (`deathtouch`) | 12 |
| Mill (`mill`) | 12 | | Cantrips (`cantrips`) | 10 | | Topdeck (`topdeck`) | 7 |
| Outlaws (`outlaws`) | 6 | | Reanimator (`reanimator`) | 6 | | Shapeshifters (`shapeshifters`) | 6 |
| Activated Abilities (`activated-abilities`) | 5 | | Commander Matters (`commander-matters`) | 5 | | Blink (`blink`) | 4 |
| Discard (`discard`) | 4 | | Historic (`historic`) | 4 | | Legends (`legends`) | 4 |
| Saboteurs (`saboteurs`) | 4 | | Stax (`stax`) | 4 | | -1/-1 Counters (`minus-1-minus-1-counters`) | 3 |
| Aristocrats (`aristocrats`) | 3 | | Attack Triggers (`attack-triggers`) | 3 | | Big Mana (`big-mana`) | 3 |
| Card Draw (`card-draw`) | 3 | | Good Stuff (`good-stuff`) | 3 | | Ninjas (`ninjas`) | 3 |
| Tokens (`tokens`) | 3 | | Ad Nauseam (`ad-nauseam`) | 2 | | Anthems (`anthems`) | 2 |
| Chaos (`chaos`) | 2 | | Dungeon (`dungeon`) | 2 | | Exile (`exile`) | 2 |
| Graveyard (`graveyard`) | 2 | | Lifegain (`lifegain`) | 2 | | Politics (`politics`) | 2 |
| Prison (`prison`) | 2 | | Type Hack (`type-hack`) | 2 | | Wheels (`wheels`) | 2 |

Smaller tags: +1/+1 Counters 1, Banding 1, Birthing Pod 1, Blue Moon 1, Cascade 1, Counterspells 1, Crime 1, Cybermen 1, Day / Night 1, Devoid 1, Dredge 1, Enchantress 1, Equipment 1, ETB 1, Extra Turns 1, Flying 1, Hatebears 1, Humans 1, Improvise 1, Infect 1, Keywords 1, Knights 1, Monarch 1, Ninjutsu 1, Pillow Fort 1, Planeswalkers 1, Rogues 1, Self-Damage 1, Slivers 1, Snow 1, Storm 1, Surveil 1, The Ring 1, Toolbox 1, Vampires 1, Weenies 1, Whales 1.

Only 49 decks are tagged Aggro, 223 Theft and 394 Assassins, so the "aggro" theme page is a small sample.

### 1.2 Top 60 non-land cards, all decks

Inclusion = decks with the card / decks that could play it (`num_decks / potential_decks`). Synergy is EDHREC's score (inclusion here minus inclusion in all decks of these colours). Spell/land MDFCs (Sink into Stupor 18%, Fell the Profane 20%, Malakir Rebirth 12%, Waterlogged Teachings 10%) count as non-land in this file but are below the top 60.

| # | Card | Inclusion | Decks | Synergy |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 89% | 2922/3268 | +0.88 |
| 2 | Arcane Signet | 84% | 2753/3268 | +0.01 |
| 3 | Sol Ring | 81% | 2657/3268 | -0.06 |
| 4 | Changeling Outcast | 80% | 2619/3268 | +0.62 |
| 5 | Training Grounds | 79% | 2585/3268 | +0.76 |
| 6 | Mari, the Killing Quill | 76% | 2488/3268 | +0.74 |
| 7 | Ramses, Assassin Lord | 70% | 2294/3268 | +0.68 |
| 8 | Brotherhood Spy | 69% | 2250/3268 | +0.68 |
| 9 | Desmond Miles | 65% | 2112/3268 | +0.63 |
| 10 | Aven Heartstabber | 64% | 2099/3268 | +0.63 |
| 11 | Hookblade Veteran | 64% | 2087/3268 | +0.63 |
| 12 | Rooftop Bypass | 64% | 2084/3268 | +0.62 |
| 13 | Assassin Initiate | 64% | 2081/3268 | +0.62 |
| 14 | Dimir Signet | 63% | 2045/3268 | +0.04 |
| 15 | Maskwood Nexus | 60% | 1950/3268 | +0.56 |
| 16 | Talisman of Dominance | 59% | 1941/3268 | +0.01 |
| 17 | They Came from the Pipes | 58% | 1897/3268 | +0.57 |
| 18 | Lydia Frye | 56% | 1846/3268 | +0.55 |
| 19 | Etrata, the Silencer | 56% | 1841/3268 | +0.54 |
| 20 | Hired Poisoner | 55% | 1803/3268 | +0.54 |
| 21 | Leyline of Transformation | 55% | 1793/3268 | +0.52 |
| 22 | Ezio, Blade of Vengeance | 54% | 1767/3268 | +0.53 |
| 23 | Ruthless Ripper | 54% | 1754/3268 | +0.53 |
| 24 | Silumgar Assassin | 53% | 1730/3268 | +0.52 |
| 25 | Eagle Vision | 53% | 1723/3268 | +0.51 |
| 26 | Basim Ibn Ishaq | 52% | 1713/3268 | +0.51 |
| 27 | Achilles Davenport | 52% | 1695/3268 | +0.50 |
| 28 | Cover of Darkness | 49% | 1595/3268 | +0.42 |
| 29 | Royal Assassin | 48% | 1581/3268 | +0.46 |
| 30 | Thieving Amalgam | 47% | 1540/3268 | +0.46 |
| 31 | Unstoppable Slasher | 47% | 1539/3268 | +0.43 |
| 32 | Massacre Girl, Known Killer | 47% | 1533/3268 | +0.44 |
| 33 | Counterspell | 47% | 1526/3268 | -0.09 |
| 34 | Arcane Adaptation | 46% | 1501/3268 | +0.43 |
| 35 | Evie Frye | 45% | 1479/3268 | +0.44 |
| 36 | Guildsworn Prowler | 43% | 1414/3268 | +0.43 |
| 37 | Lightning Greaves | 43% | 1406/3268 | +0.16 |
| 38 | Jacob Frye | 43% | 1405/3268 | +0.42 |
| 39 | Massacre Girl | 43% | 1402/3268 | +0.40 |
| 40 | Become Anonymous | 42% | 1388/3268 | +0.42 |
| 41 | Bident of Thassa | 41% | 1330/3268 | +0.31 |
| 42 | Satoru, the Infiltrator | 40% | 1307/3268 | +0.33 |
| 43 | Memory Lapse | 39% | 1263/3268 | +0.37 |
| 44 | Feed the Swarm | 39% | 1261/3268 | +0.04 |
| 45 | Primordial Mist | 38% | 1254/3268 | +0.38 |
| 46 | Restart Sequence | 37% | 1220/3268 | +0.36 |
| 47 | Scroll of Fate | 37% | 1209/3268 | +0.36 |
| 48 | Fellwar Stone | 36% | 1173/3268 | +0.05 |
| 49 | Hullcarver | 35% | 773/2179 | +0.35 |
| 50 | An Offer You Can't Refuse | 34% | 1107/3268 | +0.02 |
| 51 | Cryptic Coat | 33% | 1093/3268 | +0.33 |
| 52 | Black Market Connections | 33% | 1065/3268 | +0.22 |
| 53 | Back in Town | 32% | 1051/3268 | +0.31 |
| 54 | Swiftfoot Boots | 32% | 1037/3268 | +0.07 |
| 55 | Roaming Throne | 32% | 1030/3268 | +0.19 |
| 56 | Poison-Blade Mentor | 31% | 1019/3268 | +0.30 |
| 57 | Reconnaissance Mission | 31% | 1014/3268 | +0.22 |
| 58 | Brotherhood Regalia | 31% | 1012/3268 | +0.28 |
| 59 | Shadow, Mysterious Assassin | 31% | 747/2414 | +0.30 |
| 60 | Arcane Denial | 31% | 997/3268 | +0.04 |

Other EDHREC sections on the main page:
- **New Cards:** Sash and Waistcoat, Unmen (15%), Turbulent Wetlands (4%), My Precious (3%), Massacre Girl, Most Wanted (3%), Orcrist, Goblin-cleaver (3%).
- **High Lift Cards:** Aphetto Runecaster (5%), Brine Elemental (9%), Thousand Winds (6%), Ruthless Ripper (54%), Kheru Spellsnatcher (15%), They Came from the Pipes (58%), Primordial Mist (38%), Ghastly Conscription (30%), Silumgar Assassin (53%), Stratus Dancer (7%).
- **Game Changers:** Cyclonic Rift (15%), Fierce Guardianship (11%), Demonic Tutor (10%), Rhystic Study (10%), Vampiric Tutor (8%), Notion Thief (6%).

### 1.3 Top 25 lands, all decks

Island 99%, Swamp 99%, Command Tower 89%, Sunken Hollow 68%, Drowned Catacomb 62%, Path of Ancestry 59%, Rogue's Passage 54%, Choked Estuary 50%, Darkwater Catacombs 50%, Brotherhood Headquarters 48%, Watery Grave 48%, Shipwreck Marsh 48%, Tainted Isle 47%, Underground River 46%, Access Tunnel 46%, Exotic Orchard 41%, Dimir Aqueduct 39%, Morphic Pool 38%, Bojuka Bog 35%, Temple of Deceit 35%, Reliquary Tower 31%, Polluted Delta 30%, Gloomlake Verge 29%, Undercity Sewers 25%, Clearwater Pathway 24%.

### 1.4 Theme and bracket pages

Each page: `https://json.edhrec.com/pages/commanders/etrata-deadly-fugitive/<slug>.json` (all HTTP 200 except `face-down`, see fetch log). "vs all" = this page's inclusion minus the all-decks inclusion in 1.2, in percentage points; a big positive number means the card is typical of that theme; n/a = the card is not on the all-decks page. Decks = decks with the card / decks that could play it (new cards have a smaller second number). Non-land cards only. Small samples (aggro 49 decks, B4 42, cEDH 5) swing a lot.

#### Aggro: `aggro`, 49 decks, top 40

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 98% | 48/49 | +9 |
| 2 | Changeling Outcast | 86% | 42/49 | +6 |
| 3 | Training Grounds | 86% | 42/49 | +7 |
| 4 | Sol Ring | 86% | 42/49 | +4 |
| 5 | Mari, the Killing Quill | 84% | 41/49 | +8 |
| 6 | Arcane Signet | 82% | 40/49 | -3 |
| 7 | Brotherhood Spy | 78% | 38/49 | +9 |
| 8 | Assassin Initiate | 76% | 37/49 | +12 |
| 9 | Ramses, Assassin Lord | 73% | 36/49 | +3 |
| 10 | Desmond Miles | 71% | 35/49 | +7 |
| 11 | Rooftop Bypass | 69% | 34/49 | +6 |
| 12 | Maskwood Nexus | 69% | 34/49 | +10 |
| 13 | Basim Ibn Ishaq | 67% | 33/49 | +15 |
| 14 | Leyline of Transformation | 65% | 32/49 | +10 |
| 15 | Ezio, Blade of Vengeance | 63% | 31/49 | +9 |
| 16 | Unstoppable Slasher | 63% | 31/49 | +16 |
| 17 | Hookblade Veteran | 63% | 31/49 | -1 |
| 18 | Silumgar Assassin | 63% | 31/49 | +10 |
| 19 | Aven Heartstabber | 61% | 30/49 | -3 |
| 20 | Etrata, the Silencer | 59% | 29/49 | +3 |
| 21 | Hired Poisoner | 59% | 29/49 | +4 |
| 22 | Achilles Davenport | 59% | 29/49 | +7 |
| 23 | Massacre Girl, Known Killer | 59% | 29/49 | +12 |
| 24 | Arcane Adaptation | 59% | 29/49 | +13 |
| 25 | Lydia Frye | 57% | 28/49 | +1 |
| 26 | Cover of Darkness | 57% | 28/49 | +8 |
| 27 | Dimir Signet | 57% | 28/49 | -5 |
| 28 | Jacob Frye | 55% | 27/49 | +12 |
| 29 | Satoru, the Infiltrator | 55% | 27/49 | +15 |
| 30 | Evie Frye | 53% | 26/49 | +8 |
| 31 | Eagle Vision | 53% | 26/49 | +0 |
| 32 | Lightning Greaves | 53% | 26/49 | +10 |
| 33 | Talisman of Dominance | 51% | 25/49 | -8 |
| 34 | Ruthless Ripper | 49% | 24/49 | -5 |
| 35 | Counterspell | 49% | 24/49 | +2 |
| 36 | Bident of Thassa | 49% | 24/49 | +8 |
| 37 | Restart Sequence | 45% | 22/49 | +8 |
| 38 | Black Market Connections | 45% | 22/49 | +12 |
| 39 | An Offer You Can't Refuse | 43% | 21/49 | +9 |
| 40 | Roaming Throne | 41% | 20/49 | +9 |

Most over-represented here (in 20%+ and at least 5 of these decks, 15+ points above all decks; n/a = not on the all-decks page, compared with 0): Unstoppable Slasher 63% (+16), Satoru, the Infiltrator 55% (+15).

#### Theft: `theft`, 223 decks, top 40

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 91% | 204/223 | +2 |
| 2 | Changeling Outcast | 85% | 190/223 | +5 |
| 3 | Arcane Signet | 79% | 177/223 | -5 |
| 4 | Sol Ring | 78% | 174/223 | -3 |
| 5 | Mari, the Killing Quill | 78% | 173/223 | +1 |
| 6 | Training Grounds | 78% | 173/223 | -2 |
| 7 | Ramses, Assassin Lord | 70% | 157/223 | +0 |
| 8 | Brotherhood Spy | 69% | 153/223 | -0 |
| 9 | Aven Heartstabber | 66% | 148/223 | +2 |
| 10 | Maskwood Nexus | 64% | 143/223 | +4 |
| 11 | Rooftop Bypass | 63% | 140/223 | -1 |
| 12 | Desmond Miles | 61% | 135/223 | -4 |
| 13 | Hookblade Veteran | 60% | 133/223 | -4 |
| 14 | Assassin Initiate | 59% | 132/223 | -4 |
| 15 | Talisman of Dominance | 59% | 132/223 | -0 |
| 16 | Dimir Signet | 57% | 127/223 | -6 |
| 17 | Etrata, the Silencer | 57% | 126/223 | +0 |
| 18 | Basim Ibn Ishaq | 57% | 126/223 | +4 |
| 19 | Leyline of Transformation | 57% | 126/223 | +2 |
| 20 | Eagle Vision | 55% | 122/223 | +2 |
| 21 | Cover of Darkness | 54% | 121/223 | +5 |
| 22 | Massacre Girl, Known Killer | 54% | 120/223 | +7 |
| 23 | Lydia Frye | 53% | 119/223 | -3 |
| 24 | Ruthless Ripper | 52% | 115/223 | -2 |
| 25 | Hired Poisoner | 52% | 115/223 | -4 |
| 26 | Unstoppable Slasher | 50% | 112/223 | +3 |
| 27 | Ezio, Blade of Vengeance | 50% | 111/223 | -4 |
| 28 | Silumgar Assassin | 48% | 107/223 | -5 |
| 29 | Achilles Davenport | 48% | 107/223 | -4 |
| 30 | They Came from the Pipes | 47% | 105/223 | -11 |
| 31 | Arcane Adaptation | 47% | 104/223 | +1 |
| 32 | Royal Assassin | 45% | 101/223 | -3 |
| 33 | Lightning Greaves | 45% | 100/223 | +2 |
| 34 | Evie Frye | 44% | 98/223 | -1 |
| 35 | Counterspell | 43% | 97/223 | -3 |
| 36 | Memory Lapse | 43% | 96/223 | +4 |
| 37 | Feed the Swarm | 43% | 96/223 | +4 |
| 38 | Jacob Frye | 43% | 95/223 | -0 |
| 39 | Satoru, the Infiltrator | 43% | 95/223 | +3 |
| 40 | Bident of Thassa | 43% | 95/223 | +2 |

#### Assassins: `assassins`, 394 decks, top 40

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 91% | 359/394 | +2 |
| 2 | Changeling Outcast | 86% | 340/394 | +6 |
| 3 | Arcane Signet | 86% | 337/394 | +1 |
| 4 | Sol Ring | 84% | 332/394 | +3 |
| 5 | Mari, the Killing Quill | 84% | 329/394 | +7 |
| 6 | Training Grounds | 81% | 320/394 | +2 |
| 7 | Ramses, Assassin Lord | 76% | 300/394 | +6 |
| 8 | Brotherhood Spy | 73% | 289/394 | +5 |
| 9 | Rooftop Bypass | 72% | 284/394 | +8 |
| 10 | Aven Heartstabber | 72% | 283/394 | +8 |
| 11 | Desmond Miles | 70% | 276/394 | +5 |
| 12 | Assassin Initiate | 70% | 276/394 | +6 |
| 13 | Hookblade Veteran | 69% | 270/394 | +5 |
| 14 | Lydia Frye | 65% | 255/394 | +8 |
| 15 | Etrata, the Silencer | 65% | 255/394 | +8 |
| 16 | Dimir Signet | 65% | 255/394 | +2 |
| 17 | Ezio, Blade of Vengeance | 62% | 244/394 | +8 |
| 18 | Talisman of Dominance | 61% | 242/394 | +2 |
| 19 | Hired Poisoner | 60% | 238/394 | +5 |
| 20 | Maskwood Nexus | 60% | 237/394 | +0 |
| 21 | Ruthless Ripper | 60% | 236/394 | +6 |
| 22 | Leyline of Transformation | 60% | 235/394 | +5 |
| 23 | Achilles Davenport | 59% | 234/394 | +8 |
| 24 | Basim Ibn Ishaq | 59% | 233/394 | +7 |
| 25 | Eagle Vision | 58% | 230/394 | +6 |
| 26 | They Came from the Pipes | 58% | 230/394 | +0 |
| 27 | Unstoppable Slasher | 58% | 227/394 | +11 |
| 28 | Silumgar Assassin | 58% | 227/394 | +5 |
| 29 | Massacre Girl, Known Killer | 57% | 225/394 | +10 |
| 30 | Royal Assassin | 56% | 222/394 | +8 |
| 31 | Evie Frye | 56% | 219/394 | +10 |
| 32 | Jacob Frye | 55% | 217/394 | +12 |
| 33 | Counterspell | 53% | 208/394 | +6 |
| 34 | Guildsworn Prowler | 52% | 206/394 | +9 |
| 35 | Cover of Darkness | 51% | 201/394 | +2 |
| 36 | Massacre Girl | 51% | 200/394 | +8 |
| 37 | Arcane Adaptation | 47% | 185/394 | +1 |
| 38 | Thieving Amalgam | 47% | 184/394 | -0 |
| 39 | Memory Lapse | 46% | 182/394 | +8 |
| 40 | Bident of Thassa | 46% | 180/394 | +5 |

#### Optimized (Bracket 4 decks): `optimized`, 42 decks, top 40

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Sol Ring | 90% | 38/42 | +9 |
| 2 | Changeling Outcast | 86% | 36/42 | +6 |
| 3 | Arcane Signet | 86% | 36/42 | +1 |
| 4 | Roshan, Hidden Magister | 83% | 35/42 | -6 |
| 5 | Ramses, Assassin Lord | 83% | 35/42 | +13 |
| 6 | Maskwood Nexus | 81% | 34/42 | +21 |
| 7 | Training Grounds | 81% | 34/42 | +2 |
| 8 | Talisman of Dominance | 76% | 32/42 | +17 |
| 9 | Mari, the Killing Quill | 71% | 30/42 | -5 |
| 10 | Demonic Tutor | 71% | 30/42 | +61 |
| 11 | Cyclonic Rift | 69% | 29/42 | +54 |
| 12 | Fierce Guardianship | 67% | 28/42 | +55 |
| 13 | Desmond Miles | 64% | 27/42 | -0 |
| 14 | Vampiric Tutor | 62% | 26/42 | +54 |
| 15 | Rooftop Bypass | 60% | 25/42 | -4 |
| 16 | Mana Drain | 60% | 25/42 | +48 |
| 17 | Roaming Throne | 60% | 25/42 | +28 |
| 18 | Etrata, the Silencer | 60% | 25/42 | +3 |
| 19 | Rhystic Study | 60% | 25/42 | +50 |
| 20 | Black Market Connections | 60% | 25/42 | +27 |
| 21 | Cover of Darkness | 60% | 25/42 | +11 |
| 22 | Deadly Rollick | 57% | 24/42 | +42 |
| 23 | Arcane Adaptation | 55% | 23/42 | +9 |
| 24 | Dimir Signet | 55% | 23/42 | -8 |
| 25 | Lydia Frye | 52% | 22/42 | -4 |
| 26 | Royal Assassin | 52% | 22/42 | +4 |
| 27 | Massacre Girl, Known Killer | 52% | 22/42 | +5 |
| 28 | Lightning Greaves | 52% | 22/42 | +9 |
| 29 | Unstoppable Slasher | 50% | 21/42 | +3 |
| 30 | Vein Ripper | 50% | 21/42 | +29 |
| 31 | An Offer You Can't Refuse | 50% | 21/42 | +16 |
| 32 | Dark Ritual | 50% | 21/42 | +33 |
| 33 | Ezio, Blade of Vengeance | 48% | 20/42 | -6 |
| 34 | Spark Double | 48% | 20/42 | +26 |
| 35 | Feed the Swarm | 48% | 20/42 | +9 |
| 36 | Thieving Amalgam | 45% | 19/42 | -2 |
| 37 | Arcane Denial | 45% | 19/42 | +15 |
| 38 | Bident of Thassa | 45% | 19/42 | +5 |
| 39 | Massacre Girl | 43% | 18/42 | -0 |
| 40 | Basim Ibn Ishaq | 43% | 18/42 | -10 |

Most over-represented here (in 20%+ and at least 5 of these decks, 15+ points above all decks; n/a = not on the all-decks page, compared with 0): Demonic Tutor 71% (+61), Fierce Guardianship 67% (+55), Cyclonic Rift 69% (+54), Vampiric Tutor 62% (+54), Rhystic Study 60% (+50), Mana Drain 60% (+48), Deadly Rollick 57% (+42), Sakashima of a Thousand Faces 36% (+36), Force of Negation 33% (+33), Dark Ritual 50% (+33), Force of Will 31% (+31), Vein Ripper 50% (+29), Reanimate 38% (+28), Roaming Throne 60% (+28), Diabolic Intent 33% (+28).

#### Unblockable: `unblockable`, 28 decks, top 30

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 96% | 27/28 | +7 |
| 2 | Changeling Outcast | 89% | 25/28 | +9 |
| 3 | Mari, the Killing Quill | 86% | 24/28 | +10 |
| 4 | Arcane Signet | 82% | 23/28 | -2 |
| 5 | Sol Ring | 82% | 23/28 | +1 |
| 6 | Brotherhood Spy | 79% | 22/28 | +10 |
| 7 | Lydia Frye | 75% | 21/28 | +19 |
| 8 | Assassin Initiate | 75% | 21/28 | +11 |
| 9 | Basim Ibn Ishaq | 75% | 21/28 | +23 |
| 10 | Training Grounds | 71% | 20/28 | -8 |
| 11 | Rooftop Bypass | 71% | 20/28 | +8 |
| 12 | Ramses, Assassin Lord | 71% | 20/28 | +1 |
| 13 | Hookblade Veteran | 68% | 19/28 | +4 |
| 14 | Arcane Adaptation | 68% | 19/28 | +22 |
| 15 | Desmond Miles | 68% | 19/28 | +3 |
| 16 | Cover of Darkness | 68% | 19/28 | +19 |
| 17 | Etrata, the Silencer | 64% | 18/28 | +8 |
| 18 | Eagle Vision | 64% | 18/28 | +12 |
| 19 | Maskwood Nexus | 64% | 18/28 | +5 |
| 20 | Ezio, Blade of Vengeance | 61% | 17/28 | +7 |
| 21 | Achilles Davenport | 61% | 17/28 | +9 |
| 22 | Leyline of Transformation | 61% | 17/28 | +6 |
| 23 | Talisman of Dominance | 61% | 17/28 | +1 |
| 24 | Dimir Signet | 61% | 17/28 | -2 |
| 25 | Evie Frye | 57% | 16/28 | +12 |
| 26 | Jacob Frye | 57% | 16/28 | +14 |
| 27 | Unstoppable Slasher | 54% | 15/28 | +6 |
| 28 | Royal Assassin | 54% | 15/28 | +5 |
| 29 | Aven Heartstabber | 50% | 14/28 | -14 |
| 30 | Counterspell | 50% | 14/28 | +3 |

Most over-represented here (in 20%+ and at least 5 of these decks, 15+ points above all decks; n/a = not on the all-decks page, compared with 0): Basim Ibn Ishaq 75% (+23), Arcane Adaptation 68% (+22), Cover of Darkness 68% (+19), Brotherhood Regalia 50% (+19), Lydia Frye 75% (+19), The Revelations of Ezio 32% (+17).

#### Morph (face-down): `morph`, 221 decks, top 30

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 90% | 198/221 | +0 |
| 2 | Changeling Outcast | 82% | 182/221 | +2 |
| 3 | Arcane Signet | 82% | 181/221 | -2 |
| 4 | Sol Ring | 80% | 176/221 | -2 |
| 5 | Training Grounds | 79% | 175/221 | +0 |
| 6 | Mari, the Killing Quill | 74% | 164/221 | -2 |
| 7 | Ramses, Assassin Lord | 68% | 150/221 | -2 |
| 8 | Brotherhood Spy | 63% | 139/221 | -6 |
| 9 | Maskwood Nexus | 62% | 137/221 | +2 |
| 10 | Aven Heartstabber | 62% | 137/221 | -2 |
| 11 | Rooftop Bypass | 61% | 134/221 | -3 |
| 12 | They Came from the Pipes | 61% | 134/221 | +3 |
| 13 | Dimir Signet | 60% | 132/221 | -3 |
| 14 | Silumgar Assassin | 58% | 129/221 | +5 |
| 15 | Desmond Miles | 57% | 127/221 | -7 |
| 16 | Leyline of Transformation | 57% | 125/221 | +2 |
| 17 | Assassin Initiate | 56% | 123/221 | -8 |
| 18 | Talisman of Dominance | 56% | 123/221 | -4 |
| 19 | Etrata, the Silencer | 55% | 121/221 | -2 |
| 20 | Basim Ibn Ishaq | 54% | 120/221 | +2 |
| 21 | Lydia Frye | 53% | 118/221 | -3 |
| 22 | Ruthless Ripper | 53% | 118/221 | -0 |
| 23 | Thieving Amalgam | 52% | 116/221 | +5 |
| 24 | Ezio, Blade of Vengeance | 52% | 115/221 | -2 |
| 25 | Hookblade Veteran | 52% | 115/221 | -12 |
| 26 | Eagle Vision | 52% | 115/221 | -1 |
| 27 | Unstoppable Slasher | 50% | 111/221 | +3 |
| 28 | Massacre Girl, Known Killer | 50% | 110/221 | +3 |
| 29 | Become Anonymous | 48% | 107/221 | +6 |
| 30 | Hired Poisoner | 48% | 106/221 | -7 |

#### Clones: `clones`, 24 decks, top 30

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Changeling Outcast | 96% | 23/24 | +16 |
| 2 | Roshan, Hidden Magister | 92% | 22/24 | +2 |
| 3 | Sol Ring | 83% | 20/24 | +2 |
| 4 | Mari, the Killing Quill | 79% | 19/24 | +3 |
| 5 | Maskwood Nexus | 79% | 19/24 | +19 |
| 6 | Arcane Signet | 79% | 19/24 | -5 |
| 7 | Hookblade Veteran | 71% | 17/24 | +7 |
| 8 | Brotherhood Spy | 71% | 17/24 | +2 |
| 9 | Training Grounds | 71% | 17/24 | -8 |
| 10 | Leyline of Transformation | 71% | 17/24 | +16 |
| 11 | Eagle Vision | 71% | 17/24 | +18 |
| 12 | Cover of Darkness | 67% | 16/24 | +18 |
| 13 | Counterspell | 67% | 16/24 | +20 |
| 14 | Spark Double | 67% | 16/24 | +45 |
| 15 | Ramses, Assassin Lord | 67% | 16/24 | -4 |
| 16 | Hired Poisoner | 58% | 14/24 | +3 |
| 17 | Massacre Girl | 58% | 14/24 | +15 |
| 18 | Basim Ibn Ishaq | 58% | 14/24 | +6 |
| 19 | Massacre Girl, Known Killer | 58% | 14/24 | +11 |
| 20 | Arcane Adaptation | 58% | 14/24 | +12 |
| 21 | Desmond Miles | 54% | 13/24 | -10 |
| 22 | Assassin Initiate | 54% | 13/24 | -10 |
| 23 | Irenicus's Vile Duplication | 54% | 13/24 | +39 |
| 24 | Lightning Greaves | 54% | 13/24 | +11 |
| 25 | Auton Soldier | 50% | 12/24 | n/a |
| 26 | Aven Heartstabber | 50% | 12/24 | -14 |
| 27 | Hullcarver | 50% | 10/20 | +15 |
| 28 | Rooftop Bypass | 50% | 12/24 | -14 |
| 29 | Lydia Frye | 46% | 11/24 | -11 |
| 30 | Sakashima of a Thousand Faces | 46% | 11/24 | n/a |

Most over-represented here (in 20%+ and at least 5 of these decks, 15+ points above all decks; n/a = not on the all-decks page, compared with 0): Auton Soldier 50% (+50), Sakashima of a Thousand Faces 46% (+46), Spark Double 67% (+45), Irenicus's Vile Duplication 54% (+39), Sakashima the Impostor 38% (+38), Chameleon, Master of Disguise 35% (+35), Baleful Mastery 29% (+29), Scheming Symmetry 38% (+25), Culling the Weak 25% (+25), Grim Hireling 38% (+25), Nanogene Conversion 38% (+24), Wonder 21% (+21), Clever Impersonator 21% (+21), Slip Out the Back 21% (+21), Counterspell 67% (+20).

#### Upgraded (Bracket 3 decks): `upgraded`, 236 decks, top 30

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Roshan, Hidden Magister | 88% | 208/236 | -1 |
| 2 | Arcane Signet | 86% | 203/236 | +2 |
| 3 | Training Grounds | 82% | 193/236 | +3 |
| 4 | Sol Ring | 82% | 193/236 | +0 |
| 5 | Changeling Outcast | 80% | 189/236 | -0 |
| 6 | Mari, the Killing Quill | 78% | 183/236 | +1 |
| 7 | Ramses, Assassin Lord | 74% | 174/236 | +4 |
| 8 | Brotherhood Spy | 66% | 155/236 | -3 |
| 9 | Desmond Miles | 65% | 154/236 | +1 |
| 10 | Rooftop Bypass | 64% | 151/236 | +0 |
| 11 | Hookblade Veteran | 63% | 149/236 | -1 |
| 12 | Talisman of Dominance | 63% | 148/236 | +3 |
| 13 | Basim Ibn Ishaq | 61% | 145/236 | +9 |
| 14 | Dimir Signet | 61% | 144/236 | -2 |
| 15 | Aven Heartstabber | 61% | 143/236 | -4 |
| 16 | Etrata, the Silencer | 60% | 142/236 | +4 |
| 17 | Maskwood Nexus | 59% | 140/236 | -0 |
| 18 | Assassin Initiate | 58% | 138/236 | -5 |
| 19 | Ezio, Blade of Vengeance | 54% | 128/236 | +0 |
| 20 | Leyline of Transformation | 53% | 126/236 | -1 |
| 21 | Cover of Darkness | 53% | 126/236 | +5 |
| 22 | Lydia Frye | 53% | 124/236 | -4 |
| 23 | Achilles Davenport | 51% | 120/236 | -1 |
| 24 | They Came from the Pipes | 50% | 119/236 | -8 |
| 25 | Hired Poisoner | 50% | 119/236 | -5 |
| 26 | Massacre Girl, Known Killer | 50% | 119/236 | +4 |
| 27 | Lightning Greaves | 50% | 119/236 | +7 |
| 28 | Unstoppable Slasher | 48% | 114/236 | +1 |
| 29 | Arcane Adaptation | 48% | 114/236 | +2 |
| 30 | Eagle Vision | 47% | 112/236 | -5 |

#### cEDH (Bracket 5 decks): `cedh`, 5 decks, top 25

| # | Card | Incl. | Decks | vs all |
|---:|---|---:|---:|---:|
| 1 | Hired Poisoner | 100% | 5/5 | +45 |
| 2 | Changeling Outcast | 100% | 5/5 | +20 |
| 3 | Sol Ring | 100% | 5/5 | +19 |
| 4 | Ruthless Ripper | 80% | 4/5 | +26 |
| 5 | Assassin Initiate | 80% | 4/5 | +16 |
| 6 | Training Grounds | 80% | 4/5 | +1 |
| 7 | Mana Drain | 80% | 4/5 | +68 |
| 8 | Mental Misstep | 80% | 4/5 | n/a |
| 9 | Tainted Pact | 80% | 4/5 | n/a |
| 10 | Mindbreak Trap | 80% | 4/5 | n/a |
| 11 | Dark Ritual | 80% | 4/5 | +63 |
| 12 | Mystic Remora | 80% | 4/5 | +73 |
| 13 | Swan Song | 80% | 4/5 | +67 |
| 14 | Demonic Consultation | 80% | 4/5 | n/a |
| 15 | Thassa's Oracle | 80% | 4/5 | n/a |
| 16 | The One Ring | 80% | 4/5 | n/a |
| 17 | Rhystic Study | 80% | 4/5 | +70 |
| 18 | Force of Will | 80% | 4/5 | n/a |
| 19 | Fierce Guardianship | 80% | 4/5 | +69 |
| 20 | Chrome Mox | 80% | 4/5 | n/a |
| 21 | Mox Diamond | 80% | 4/5 | n/a |
| 22 | Demonic Tutor | 80% | 4/5 | +70 |
| 23 | Arcane Signet | 80% | 4/5 | -4 |
| 24 | Imperial Seal | 60% | 3/5 | n/a |
| 25 | Opposition Agent | 60% | 3/5 | n/a |

Most over-represented here (in 20%+ and at least 5 of these decks, 15+ points above all decks; n/a = not on the all-decks page, compared with 0): Hired Poisoner 100% (+45), Changeling Outcast 100% (+20), Sol Ring 100% (+19).

### 1.5 EDHREC average deck

Source: `https://json.edhrec.com/pages/average-decks/etrata-deadly-fugitive.json` (HTTP 200). Built from all 3268 decks.

- **Artifact (11):** Arcane Signet; Bident of Thassa; Cryptic Coat; Dimir Signet; Fellwar Stone; Lightning Greaves; Maskwood Nexus; Scroll of Fate; Sol Ring; Swiftfoot Boots; Talisman of Dominance
- **Land (37):** Access Tunnel; Brotherhood Headquarters; Choked Estuary; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Drowned Catacomb; Exotic Orchard; Island x11; Morphic Pool; Path of Ancestry; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; Swamp x10; Tainted Isle; Underground River; Watery Grave
- **Creature (27):** Achilles Davenport; Assassin Initiate; Aven Heartstabber; Basim Ibn Ishaq; Brotherhood Spy; Changeling Outcast; Desmond Miles; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Guildsworn Prowler; Hired Poisoner; Hookblade Veteran; Hullcarver; Jacob Frye; Lydia Frye; Mari, the Killing Quill; Massacre Girl; Massacre Girl, Known Killer; Ramses, Assassin Lord; Roshan, Hidden Magister; Royal Assassin; Ruthless Ripper; Satoru, the Infiltrator; Silumgar Assassin; Thieving Amalgam; Unstoppable Slasher
- **Enchantment (8):** Arcane Adaptation; Black Market Connections; Cover of Darkness; Leyline of Transformation; Primordial Mist; Rooftop Bypass; They Came from the Pipes; Training Grounds
- **Instant (9):** An Offer You Can't Refuse; Arcane Denial; Become Anonymous; Chain Assassination; Counterspell; Ghostly Flicker; Memory Lapse; Negate; Withering Torment
- **Sorcery (7):** Back in Town; Eagle Vision; Feed the Swarm; Ghastly Conscription; Kindred Dominance; Restart Sequence; Toxic Deluge

The average deck is a midrange Assassin deck: 37 lands, 3 type-changers (Arcane Adaptation, Leyline of Transformation, Maskwood Nexus, plus Roshan), Thieving Amalgam, no Etrata copies and no Vein Ripper.

## 2. Moxfield primer: "Fugitives (Best Bracket 4 Assassin Snowball)"

- Primer: https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer ; list: https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw
- Author: **ozmly**. Bracket 4 (user-set and Moxfield auto). Created 2024-01-27, last updated **2025-03-24**. 6,996 views, 44 likes. Hubs: Competitive, Control, Dimir, Goodstuff, Primer.
- Read via the browser (Moxfield blocks curl). Everything below is our paraphrase; the one quote is under 15 words.

**Pitch.** The author describes the deck as part typal, part control and mostly a snowball: "a little tribal, a little control, and a huge snow ball." They call Etrata a sleeper and say the list is strong but less oppressive than typical Dimir cEDH decks. Power can be tuned up or down with tutors and fast mana.

**Game plan (author's step order):**
1. Ramp and deploy cheap Assassins, then cast Etrata as early as possible.
2. Set up evasion (Cover of Darkness; the primer also names Dirge of Dread).
3. Multiply cloak triggers by copying Etrata: Sakashima the Impostor, Sakashima of a Thousand Faces, Irenicus's Vile Duplication, or a myriad copy through Blade of Selves or (better) Auton Soldier.
4. Attack every turn to pile up face-down 2/2s.
5. Draw off combat damage (Reconnaissance Mission, Kindred Discovery, Bident of Thassa).
6. Once there is a board of 2/2s, turn them all into Assassins (Maskwood Nexus, Arcane Adaptation, Conspiracy) so every one of them cloaks when it connects; swing again.
7. Win by: a huge board of 2/2s; decking opponents by cloaking their whole library; or sacrificing the board to Ashnod's Altar with Vein Ripper out (2-life drain per creature).

**Combat math the author gives.** A myriad copy of Etrata (Auton Soldier) plus two other connecting Assassins is said to cloak 24 cards in one turn; the next turn, with Maskwood making the 2/2s Assassins, they claim 120. (These are the author's numbers, not checked by us.)

**Using the stolen cards.** The author stresses casting/flipping the cloaked cards for value, and runs Training Grounds to cut Etrata's flip cost. For a flip-focused build they suggest Thassa, Deep-Dwelling and Conjurer's Closet.

**Key cards by role (primer text):** evasion: Cover of Darkness, Wonder (discard it to hand size), Haunted One, Mari; make everything an Assassin: Arcane Adaptation, Maskwood Nexus, Conspiracy ("you may only need 1-2 depending on tutors"); more cloak triggers: Auton Soldier, Blade of Selves, Roaming Throne, both Sakashimas, Irenicus's Vile Duplication, Quantum Misalignment; card advantage: Reconnaissance Mission, Kindred Discovery, Bident of Thassa, Distant Melody; removal: Kindred Dominance and Raise the Palisade as one-sided sweepers; sac outlets (Phyrexian Altar etc.) with Vein Ripper as the Assassin finisher.

**Cards considered and rejected:** Thieving Amalgam, Tasha the Witch Queen, Titan of Littjara and Agent of Treachery are called fun but too slow. Aphetto Runecaster and Ixidor are on theme but weak. Coerced to Kill is a flavour pick. Nanogene Conversion is praised (turn the board into Etratas) with a warning that it also turns opponents' creatures into deathtouch copies, so pair it with Kindred Dominance or Raise the Palisade. (Nanogene is in the current list.)

**Budget / curve advice.** The curve tops out around four. Without the fast mana, play about 34 lands and more two-drop Assassins. With a big budget, play every tutor and cut duplicate effects (extra cloak doublers and extra Maskwood-style cards). Change log (dated "2/3"): some Maskwood and mass-Curiosity cards were swapped for tutors for consistency.

**Mulligan advice:** the primer has **no mulligan section**. The only guidance is implicit in step 1 (early mana + cheap Assassins + Etrata early). Anything more would be our inference.

**Primer vs. current list (2025-03-24).** The prose is older than the list. Several "key cards" in the text are not in the current 99: Mari, Wonder, Haunted One, Blade of Selves, Reconnaissance Mission, Kindred Discovery, Distant Melody, Thassa, Conjurer's Closet. The current list instead leans on fast mana (Mana Vault, Chrome Mox, Mox Amber, Dark Ritual, Culling the Weak, Ancient Tomb, Urza's Saga), tutors (Demonic, Vampiric, Imperial Seal, Diabolic Intent), free counters (Fierce Guardianship, Force of Negation) and card draw (Rhystic Study, Mystic Remora, The One Ring, Dark Confidant, Black Market Connections, Coastal Piracy, Bident).

**Current list shape:** 33 lands; Assassin/changeling creatures: 10; type-changers: Roshan, Hidden Magister, Maskwood Nexus, Arcane Adaptation, Conspiracy; Etrata copies / trigger doublers: Roaming Throne, Spark Double, Sakashima of a Thousand Faces, Sakashima the Impostor, Irenicus's Vile Duplication, Auton Soldier, Quantum Misalignment, Nanogene Conversion, Sakashima's Will; evasion: Cover of Darkness, Levitation, Dolmen Gate (protects attackers), Lightning Greaves. Full list in the appendix (#22).

Also tried: the primer of the B4 list "Deadly turn three cloak with Etrata" (AliasGreg, #23) at https://moxfield.com/decks/ug41w5qe0EaYCy0emyh3Pg/primer. **Not read:** the page stayed on "Loading Moxfield" after two loads. Its deck list was read through the API; the deck description calls it a competitive Dimir control shell.

## 3. The 30 public decklists

Selection: Archidekt search filtered to Etrata as commander (`/api/decks/v3/?commanderName=Etrata%2C%20Deadly%20Fugitive`), taking the most-viewed lists, every Bracket 4 list with a real Etrata commander, and lists tagged Aggro/Theft; Moxfield search by commander card id, taking the most-viewed Bracket 3-4 and theft-titled lists plus the primer. One Archidekt hit (id 8933747 "Assassin Frye", B4) was dropped because its commanders are Evie + Jacob Frye, not Etrata. All 30 are 99 cards + Etrata.

**Aggro/theft?** is our label from the card lists, the author tags and descriptions: **yes** = attacking with Assassins to cloak/steal is the main plan; **partly** = Assassin-heavy but the deck is mainly removal/control/value; **no** = another plan. Brackets: Archidekt shows the user-set bracket (blank = not set); Moxfield shows user-set and Moxfield's automatic bracket. "Cheap AS" = Assassin or changeling creatures with mana value 2 or less. "Type" = type-changers (Roshan, Maskwood, Arcane Adaptation, Leyline of Transformation, Conspiracy, Xenograft, Standardize, Brotherhood Regalia). "Copies" = Etrata copies and trigger doublers (Roaming Throne, Spark Double, Sakashimas, Irenicus, Auton Soldier, Nanogene, Strionic Resonator, etc.). GC = Game Changers per Archidekt's flag (Archidekt lists only).

| # | Source | Title | Author | Bracket | Updated | Lands | AS / cheap AS | Type | Copies | GC | Aggro/theft? | Closers in list |
|---:|---|---|---|---|---|---:|---|---:|---:|---:|---|---|
| 1 | Archidekt | [Assassassassassins](https://archidekt.com/decks/6558910) | Pad4321 | B3 | 2026-09-24 | 31 | 23 / 15 | 3 | 1 | 0 | yes | Ramses |
| 2 | Archidekt | [Cloaks and Contraband [Dimir Theft Assassin Typal]](https://archidekt.com/decks/6461239) | Hormesis | - | 2025-10-18 | 38 | 17 / 7 | 5 | 0 | 0 | yes | Ramses; Vein Ripper; Silencer; Revel in Riches; Amalgam drain |
| 3 | Archidekt | [Assassin // Maskwood Nexus](https://archidekt.com/decks/6753341) | yournamehere | B3 | 2025-02-16 | 33 | 22 / 11 | 4 | 2 | 0 | yes | Ramses; Vein Ripper; Unstoppable Slasher (half life); Amalgam drain |
| 4 | Archidekt | [Seductive Assassin](https://archidekt.com/decks/7869002) | AmeizingGuy | B3 | 2026-01-02 | 29 | 25 / 14 | 1 | 2 | 2 | partly | Ramses |
| 5 | Archidekt | [Etrata, Deadly Fugitive (B3)](https://archidekt.com/decks/24459413) | Eldirun | B3 | 2026-09-25 | 35 | 30 / 17 | 2 | 10 | 3 | yes | Ramses; Silencer; Unstoppable Slasher/Virtus (half life) |
| 6 | Archidekt | [Etrata, Deadly Fugitive: Cloak & Dagger](https://archidekt.com/decks/12165446) | PhyrexianTrophyHusband | B3 | 2025-12-25 | 34 | 24 / 10 | 0 | 1 | 0 | partly | Ramses; Silencer; Unstoppable Slasher/Virtus (half life) |
| 7 | Archidekt | [Etrada, Deadly Fugitive 2.0](https://archidekt.com/decks/16077597) | Wilotree | B3 | 2026-09-26 | 33 | 6 / 3 | 6 | 4 | 0 | yes | - |
| 8 | Archidekt | [Etrata](https://archidekt.com/decks/8383327) | Principium | B3 | 2025-10-27 | 29 | 14 / 5 | 4 | 1 | 1 | partly | Ramses; Silencer; Amalgam drain |
| 9 | Archidekt | [Assassin Mitosis Aggro](https://archidekt.com/decks/8296017) | Bayleef | - | 2025-08-15 | 32 | 25 / 9 | 5 | 2 | 0 | yes | Ramses; Vein Ripper; Unstoppable Slasher/Virtus (half life) |
| 10 | Archidekt | [assassins In and Out](https://archidekt.com/decks/15964319) | el_franco_tira | B2 | 2026-07-02 | 37 | 25 / 12 | 6 | 2 | 0 | yes | Ramses; Unstoppable Slasher (half life) |
| 11 | Archidekt | [Undercover Assassin](https://archidekt.com/decks/11967496) | chrjo | - | 2026-05-28 | 35 | 21 / 15 | 4 | 0 | 0 | yes | Amalgam drain |
| 12 | Archidekt | [Face-Down/Mana-Up](https://archidekt.com/decks/10492085) | ShroudBreakr | B4 | 2026-01-05 | 36 | 1 / 0 | 1 | 0 | 7 | no | Ramses; Amalgam drain |
| 13 | Archidekt | [Etrata, Deadly Fugitive (Testing Phase)](https://archidekt.com/decks/19992021) | acclayton | B4 | 2026-02-22 | 30 | 25 / 17 | 3 | 1 | 8 | yes | Thassa's Oracle; Unstoppable Slasher (half life) |
| 14 | Archidekt | [Stab N Grab](https://archidekt.com/decks/11686364) | LootKobbler | B4 | 2025-05-25 | 36 | 20 / 7 | 4 | 1 | 0 | yes | Ramses; Silencer; Unstoppable Slasher (half life) |
| 15 | Archidekt | [Etrata Assassins](https://archidekt.com/decks/23124573) | Adamantx | B4 | 2026-09-09 | 34 | 27 / 14 | 3 | 2 | 1 | yes | Ramses; Vein Ripper; Silencer; Unstoppable Slasher (half life); Amalgam drain |
| 16 | Archidekt | [Cloak & Dagger (Etrata, Deadly Fugitive EDH)](https://archidekt.com/decks/23613428) | FrostyWalsh | B4 | 2026-06-20 | 32 | 14 / 8 | 3 | 5 | 5 | yes | Ramses; Vein Ripper; Unstoppable Slasher (half life) |
| 17 | Archidekt | [Etrata the Murderous Thief](https://archidekt.com/decks/26581085) | Zeraseth | B4 | 2026-09-21 | 36 | 18 / 6 | 4 | 4 | 10 | yes | Ramses; Vein Ripper; Thassa's Oracle; Silencer; Unstoppable Slasher (half life); Amalgam drain |
| 18 | Archidekt | [Errata](https://archidekt.com/decks/22232527) | PR0X1_K1NG | B4 | 2026-05-06 | 33 | 21 / 8 | 4 | 2 | 4 | yes | Ramses; Silencer; Unstoppable Slasher/Virtus (half life); Amalgam drain |
| 19 | Archidekt | [Theft and Manipulation](https://archidekt.com/decks/12421090) | Catharsis001 | B4 | 2025-04-10 | 32 | 7 / 3 | 3 | 2 | 14 | no | Ramses; Silencer; Amalgam drain |
| 20 | Archidekt | [Etrata assassins](https://archidekt.com/decks/7928337) | GreyRogueOutcast | B4 | 2025-11-06 | 37 | 22 / 11 | 2 | 5 | 7 | yes | Ramses; Vein Ripper; Silencer; Virtus (half life); Amalgam drain |
| 21 | Archidekt | [Assassin Vehicle](https://archidekt.com/decks/26515260) | splitsolace | B4 | 2026-09-27 | 30 | 19 / 3 | 1 | 1 | 5 | yes | Ramses; Vein Ripper; Silencer; Unstoppable Slasher (half life) |
| 22 | Moxfield | [🧿Fugitives🧿 (Best Bracket 4 Assassin Snowball - Etrata, Deadly Fugitive)](https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw) | ozmly | user 4, auto 4 | 2025-03-24 | 33 | 10 / 6 | 4 | 9 | n/a | yes | Ramses; Vein Ripper + Ashnod's Altar/Phyrexian Altar/Phyrexian Tower |
| 23 | Moxfield | [🗡️Deadly turn three cloak with Etrata💨](https://moxfield.com/decks/ug41w5qe0EaYCy0emyh3Pg) | AliasGreg | user 4, auto 4 | 2026-09-22 | 31 | 26 / 13 | 3 | 6 | n/a | partly | Ramses; Silencer |
| 24 | Moxfield | [Assassin Theft](https://moxfield.com/decks/i-QbyFaPQEuG9F44QmFadg) | Halerand | user not set, auto 4 | 2026-10-02 | 31 | 13 / 13 | 0 | 1 | n/a | partly | - |
| 25 | Moxfield | [Got any win-cons?](https://moxfield.com/decks/Y0zMk8ndOkGcaS-6_0vhCA) | BlockSnake | user not set, auto 4 | 2025-10-15 | 34 | 14 / 7 | 2 | 10 | n/a | yes | Ramses; Vein Ripper + Ashnod's Altar/Phyrexian Altar/Phyrexian Tower; Virtus (half life) |
| 26 | Moxfield | [Secret Knowledge is Secret Power :) / Etrata, Deadly Fugitive](https://moxfield.com/decks/zF6-gbOai0uJVaoy8GLYOw) | TransmitKromer57 | user 2, auto 3 | 2024-09-27 | 34 | 12 / 8 | 1 | 2 | n/a | no | Ramses; Unstoppable Slasher (half life) |
| 27 | Moxfield | [MASK WOOD NEXUS INSANITY](https://moxfield.com/decks/tE-og0iEvkW78o5QEfZs0g) | DeckTechsForDecks | user not set, auto 3 | 2024-02-17 | 36 | 10 / 3 | 4 | 1 | n/a | yes | Ramses |
| 28 | Moxfield | [I Shoulda Got That 👀](https://moxfield.com/decks/B8Ln70WmXU-Nwwb69CG7OQ) | AlexLittle | user 3, auto 2 | 2026-10-03 | 34 | 22 / 16 | 2 | 2 | n/a | yes | - |
| 29 | Moxfield | [[EDH] Etrata - "Stabby Guys" - Assassin Tribal Value](https://moxfield.com/decks/WJKiS_ktV02HZUFOWFjWJw) | ShoMinamoto | user 3, auto 3 | 2026-10-03 | 32 | 19 / 7 | 4 | 8 | n/a | yes | Ramses; Silencer; Unstoppable Slasher (half life) |
| 30 | Moxfield | [Etrata, Deadly Fugitive Assassin Theft](https://moxfield.com/decks/wLSJ0QlDF0CLngmNpVwRSw) | Aurelio | user not set, auto 3 | 2026-08-23 | 34 | 16 / 10 | 2 | 1 | n/a | yes | Ramses |

**Land counts:** all 30 lists: mean 33.4, median 33.5, range 29-38. The 22 "yes" lists: mean 33.9, median 34.0. (EDHREC average deck: 37.) Spell/land MDFCs (Sink into Stupor, Fell the Profane, etc.) are counted as spells, not lands.

**Split:** 22 aggro/theft, 5 partly, 3 other plans. Other plans seen: big-spell "cheat it face-down and flip it" (#12), Citadel/Tergrid theft-control (#19), stack-control theft (#26). Vampire drain: Vein Ripper appears in 10 lists; Vein Ripper with a sac outlet in 2. Thassa's Oracle combo backup in 2 (#13, #17).

### Per-list notes (our reading)

1. **Assassassassassins** (Pad4321): Assassin go-wide + theft. Leyline of Transformation, Maskwood Nexus, Nanogene Conversion, Thassa blink; Tetsuko / Cover of Darkness evasion. Only 31 lands.
2. **Cloaks and Contraband [Dimir Theft Assassin Typal]** (Hormesis): Assassin typal theft with equipment (Sword of Feast and Famine, Hidden Blade), Herald's Horn, Thieving Amalgam, Vein Ripper; Revel in Riches + Pitiless Plunderer as a Treasure alt-win. 38 lands.
3. **Assassin // Maskwood Nexus** (yournamehere): Typal beatdown: Maskwood/Leyline, anthems (Achilles, Eldrazi Monument, Blade of the Oni), Vela the Night-Clad intimidate, Vein Ripper.
4. **Seductive Assassin** (AmeizingGuy): Removal-heavy Assassin midrange (Royal Assassin, Nekrataal, Big Game Hunter, Pongify, Villainous Wrath) with some evasion (Rogue Class, Tetsuko). No type-changer except Roshan.
5. **Etrata, Deadly Fugitive (B3)** (Eldirun): Snowball by copying Etrata (Sakashima x2, Spark Double, Stunt Double, Shapesharer, Dark Impostor, Loki) + Leyline/Maskwood + Roaming Throne; Propaganda/Crawlspace/Teferi's Veil to survive. Has a primer (turn-3 Etrata, go wide with cloaks, flipping is not the focus).
6. **Etrata, Deadly Fugitive: Cloak & Dagger** (PhyrexianTrophyHusband): Assassin midrange/control: Royal Assassin-style removal creatures, Damnation, Overkill, Bounty Board, Kaito, Phyrexian Arena. Few type-changers.
7. **Etrada, Deadly Fugitive 2.0** (Wilotree): Face-down/theft go-wide: Arcane Adaptation, Leyline, Maskwood, Standardize, Ixidron, Sash and Waistcoat, They Came from the Pipes, Auton Soldier / Spark Double; Ashnod's Altar + Grim Haruspex.
8. **Etrata** (Principium): Theft-value pile: lots of "play opponents' cards" (Stolen Goods, Tempted by the Oriq, Dream-Thief's Bandana, Thieving Varmint, Tinybones, Slickshot Lockpicker, Insatiable Avarice), Arcane Adaptation/Conspiracy, many equipment. Assassins are fewer.
9. **Assassin Mitosis Aggro** (Bayleef): Explicit aggro (author: swarm with 2/2s made into Assassins; four type-changers for redundancy: Arcane Adaptation, Leyline, Maskwood, Nanogene). Counterspells to protect the board.
10. **assassins In and Out** (el_franco_tira): Bracket 2 aggro with sacrifice/recursion sub-theme (Feign Death, Not Dead After All, Presumed Dead, Bastion of Remembrance), Archetype of Imagination/Finality, Leyline + Maskwood + Conspiracy + Xenograft.
11. **Undercover Assassin** (chrjo): Face-down aggro (German description: cheap evasive Assassins early, then ramp, Etrata cloaks). Conspiracy, Leyline, Xenograft, Ixidron, Illithid Harvester, Death in Heaven, The Cyber-Controller.
12. **Face-Down/Mana-Up** (ShroudBreakr): Not aggro: cheat expensive cards face-down and flip them for {2}{U}{B} (Omniscience, Blightsteel, Time Stretch, Kozilek); Phage the Untouchable + Ramses win. Heavy tutors/counters.
13. **Etrata, Deadly Fugitive (Testing Phase)** (acclayton): Assassin aggro with a cEDH-style backup: Thassa's Oracle + Demonic Consultation, Necropotence, Exquisite Blood. Author notes Etrata is "kill on sight" so hold protection before casting her.
14. **Stab N Grab** (LootKobbler): Assassin typal + theft: Leyline, Maskwood, Conspiracy; Grim Tutor / Beseech the Queen; Kindred Discovery, Reconnaissance Mission, Bident draw on hits. No Game Changers despite Bracket 4.
15. **Etrata Assassins** (Adamantx): Straight Assassin typal beatdown: Achilles/Ramses anthems, Leyline, Patchwork Banner, Thieving Amalgam, Vein Ripper; Propaganda for defense.
16. **Cloak & Dagger (Etrata, Deadly Fugitive EDH)** (FrostyWalsh): Snowball: copies of Etrata (Sakashima x2, Spark Double, Irenicus), Leyline/Maskwood/Arcane Adaptation, Akroma's Memorial, Eldrazi Monument, Filth (swampwalk), Vein Ripper.
17. **Etrata the Murderous Thief** (Zeraseth): Tagged Aggro/Theft: Assassins + Arcane Adaptation/Maskwood, Spark Double, Sakashima, Strionic Resonator (copy Etrata's trigger), Thieving Amalgam, Vein Ripper; Thassa's Oracle + Tainted Pact/Consultation backup; 10 Game Changers.
18. **Errata** (PR0X1_K1NG): Assassin aggro with a "sneak" package (Ninja Teen, Donatello's/Shredder's/Splinter's Technique) and Leyline/Maskwood, Thieving Amalgam, Rogue Class, Herald's Horn.
19. **Theft and Manipulation** (Catharsis001): Theft/control (14 Game Changers): Bolas's Citadel, Tergrid, Notion Thief, Opposition Agent, Dauthi Voidwalker, Geth, The Scarab God, Expropriate, Beguiler of Wills. Assassins are a minority.
20. **Etrata assassins** (GreyRogueOutcast): Assassin aggro + counter-magic + tutors; copies of Etrata (Sakashima, Spark Double, Irenicus), Thieving Amalgam, Vein Ripper.
21. **Assassin Vehicle** (splitsolace): Odd islandwalk/vehicle aggro: Spreading Seas, Harbinger of the Seas, Merfolk lords, Stormtide Leviathan, Vedalken Shackles, Adrestia + Assassin crew, Ezio-themed cards.
22. **🧿Fugitives🧿 (Best Bracket 4 Assassin Snowball - Etrata, Deadly Fugitive)** (ozmly): The primer list (see section 2). Snowball: cheap Assassins + fast mana, Etrata copies (Sakashima x2, Spark Double, Auton Soldier, Irenicus, Quantum Misalignment, Sakashima's Will, Nanogene), type-changers (Arcane Adaptation, Maskwood, Conspiracy), Vein Ripper + altars as a closer.
23. **🗡️Deadly turn three cloak with Etrata💨** (AliasGreg): Author calls it "a quite competitive Dimir control shell"; still 25+ Assassins/changelings, Arcane Adaptation + Maskwood, Etrata copies (Sakashima, Spark Double, Omni-Changeling, Irenicus, Nanogene), Force of Will etc. Primer page would not load.
24. **Assassin Theft** (Halerand): Auto-bracket 4. Cheap Assassins with cEDH-style shell: Opposition + Hidden Strings tap-down, Disciple of Deceit, Lim-Dûl's Vault, Sash and Waistcoat, Wonder, Skullclamp, Carnival of Souls / Agatha's Soul Cauldron. Few type-changers.
25. **Got any win-cons?** (BlockSnake): Close variant of the Fugitives primer list (same copy package, altars + Vein Ripper), adds Haunted One, Sleeper's Robe, Gilded Drake, Blade of Selves.
26. **Secret Knowledge is Secret Power :) | Etrata, Deadly Fugitive** (TransmitKromer57): Stack-control theft (Desertion, Kheru Spellsnatcher, Spellskite, Misinformation + Lantern of Insight, Shadow of the Second Sun extra phases). Author: "play on the stack with your opponents' cards".
27. **MASK WOOD NEXUS INSANITY** (DeckTechsForDecks): Maskwood "every creature type" combo-typal: Captain N'ghathrod, Syphon Sliver, Marrow-Gnawer, Lord of the Nazgûl, Tegwyll, Yuriko all turn on through Maskwood/Arcane Adaptation/Conspiracy/Xenograft. 2024 list.
28. **I Shoulda Got That 👀** (AlexLittle): Theft-forward Assassins: Arcane Heist, Changing Loyalty, Reins of Power, Garland, Gonti, Rev; Stalactite Dagger/Mirrorform/Naga Fleshcrafter typing; Maskwood; Lost Jitte.
29. **[EDH] Etrata - "Stabby Guys" - Assassin Tribal Value** (ShoMinamoto): Assassin typal value with Etrata copies (Sakashima, Spark Double, Chameleon, Mystic Reflection, Nanogene, Quantum Misalignment), Leyline/Arcane Adaptation/Maskwood. Description logs 27 games: 7 wins, 20 losses.
30. **Etrata, Deadly Fugitive Assassin Theft** (Aurelio): Assassin theft with unblockable equipment (Brotherhood Regalia, Silver Shroud Costume, Key to the Side-Door, My Precious), Patriarch's Bidding, Whip of Erebos, Primordial Mist.

## 4. Frequency table: cards in 3 or more of the 30 lists

185 non-land cards appear in 3+ lists. Columns: **All** = lists out of 30; **Aggro** = lists out of the 22 "yes" lists; **EDHREC** = all-decks inclusion from section 1.2 (blank if EDHREC does not list it for this commander). **★** = looks aggressive or theft-related (Assassins/changelings, type-changers, ninjas, evasion, anthems, copies of Etrata / trigger doublers, face-down support, cards that use opponents' cards, combat-damage draw, drain closers). **Role** is our short note.

Tag key: AS Assassin creature, TYPE makes your creatures (incl. face-down) Assassins, EV evasion, AN anthem, CPY copies Etrata or doubles her trigger, FD face-down/cloak support, TH theft / opponents' cards, CD card draw on combat damage, NIN ninja/ninjutsu, DT deathtouch, FR freerunning, WIN closer.

| # | Card | All | Aggro | EDHREC | ★ | Role |
|---:|---|---:|---:|---:|:-:|---|
| 1 | Training Grounds | 28 | 20 | 79% | ★ | FD: flip cost {2}{U}{B} -> {U}{B} |
| 2 | Sol Ring | 26 | 20 | 81% |  | ramp |
| 3 | Changeling Outcast | 26 | 19 | 80% | ★ | AS (changeling), EV unblockable, 1-drop |
| 4 | Mari, the Killing Quill | 25 | 19 | 76% | ★ | AS, gives Assassins deathtouch, hit counters -> draw + Treasures on hit |
| 5 | Ramses, Assassin Lord | 25 | 18 | 70% | ★ | AS, AN +1/+1 Assassins, WIN alt-win if an Assassin attacked the loser |
| 6 | Arcane Signet | 22 | 16 | 84% |  | ramp |
| 7 | Maskwood Nexus | 21 | 18 | 60% | ★ | TYPE: everything (incl. face-down) is every type -> Assassins |
| 8 | Roshan, Hidden Magister | 21 | 17 | 89% | ★ | AS, TYPE: other creatures are Assassins; face-down creatures have menace |
| 9 | Hired Poisoner | 20 | 14 | 55% | ★ | AS 1-drop, DT |
| 10 | Aven Heartstabber | 19 | 14 | 64% | ★ | AS 2-drop, EV flying |
| 11 | Dimir Signet | 18 | 14 | 63% |  | ramp |
| 12 | Talisman of Dominance | 18 | 14 | 59% |  | ramp |
| 13 | Ruthless Ripper | 18 | 13 | 54% | ★ | AS 1-drop, DT, FD morph |
| 14 | Cover of Darkness | 17 | 15 | 49% | ★ | EV fear for chosen type (Assassin) |
| 15 | Brotherhood Spy | 17 | 14 | 69% | ★ | AS 2-drop, EV unblockable with a legendary Assassin (Etrata) |
| 16 | Desmond Miles | 17 | 14 | 65% | ★ | AS 2-drop, EV menace, grows per Assassin |
| 17 | Massacre Girl, Known Killer | 17 | 14 | 47% | ★ | AS, EV menace, wither; draws |
| 18 | Roaming Throne | 17 | 14 | 32% | ★ | CPY: Assassin triggers (Etrata's cloak) trigger twice |
| 19 | Assassin Initiate | 17 | 12 | 64% | ★ | AS 1-drop, EV flying on demand |
| 20 | An Offer You Can't Refuse | 16 | 15 | 34% |  | counter (1 mana) |
| 21 | Rooftop Bypass | 16 | 14 | 64% | ★ | makes 1/1 menace Assassin tokens on hit |
| 22 | Arcane Adaptation | 16 | 13 | 46% | ★ | TYPE: all your creatures/face-down are Assassins |
| 23 | Feed the Swarm | 15 | 14 | 39% |  | removal |
| 24 | Massacre Girl | 15 | 13 | 43% |  | AS, board wipe |
| 25 | Silumgar Assassin | 15 | 13 | 53% | ★ | AS, EV (bigger creatures can't block), FD megamorph removal |
| 26 | Counterspell | 15 | 11 | 47% |  | counter |
| 27 | Ezio, Blade of Vengeance | 15 | 11 | 54% | ★ | AS, CD: draw when an Assassin connects |
| 28 | Unstoppable Slasher | 14 | 12 | 47% | ★ | AS, DT, WIN: halves life on hit |
| 29 | Hookblade Veteran | 14 | 11 | 64% | ★ | AS 1-drop, EV flying on your turn |
| 30 | Mothdust Changeling | 14 | 11 | 28% | ★ | AS (changeling) 1-drop, EV flying |
| 31 | Guildsworn Prowler | 14 | 10 | 43% | ★ | AS 2-drop, DT, draws on death |
| 32 | Leyline of Transformation | 13 | 13 | 55% | ★ | TYPE: all your creatures/face-down are Assassins (free on turn 0) |
| 33 | Black Market Connections | 13 | 12 | 33% |  | draw/ramp; changeling token = Assassin |
| 34 | Basim Ibn Ishaq | 13 | 10 | 52% | ★ | AS 2-drop, EV unblockable after historic spell, draws |
| 35 | Etrata, the Silencer | 13 | 9 | 56% | ★ | AS, EV unblockable, WIN hit-counter alt-win |
| 36 | Fierce Guardianship | 13 | 9 | 11% |  | free counter |
| 37 | Orochi Soul-Reaver | 13 | 9 | 30% | ★ | NIN ninjutsu, TH manifests opponent's top card + Treasure on hit |
| 38 | Satoru, the Infiltrator | 13 | 9 | 40% | ★ | NIN (Ninja), EV menace; draws when nontoken creatures enter without being cast (cloaks, manifests, ninjutsu) |
| 39 | Bident of Thassa | 12 | 12 | 41% | ★ | CD: draw per creature connecting |
| 40 | Lightning Greaves | 12 | 10 | 43% |  | protection/haste |
| 41 | Demonic Tutor | 12 | 8 | 10% |  | tutor |
| 42 | Arcane Denial | 11 | 11 | 31% |  | counter |
| 43 | Lydia Frye | 11 | 10 | 56% | ★ | AS, EV (power 3+ can't block) |
| 44 | Vampiric Tutor | 11 | 8 | 8% |  | tutor |
| 45 | Vein Ripper | 10 | 10 | 21% | ★ | AS, EV flying, WIN drain 2 per creature death (sac-outlet combo) |
| 46 | Achilles Davenport | 10 | 8 | 52% | ★ | AS, EV menace, AN +1/+1 Assassins, FR |
| 47 | Cyclonic Rift | 10 | 8 | 15% |  | one-sided bounce |
| 48 | Irenicus's Vile Duplication | 10 | 8 | 15% | ★ | CPY: non-legendary flying copy of Etrata |
| 49 | Reconnaissance Mission | 10 | 8 | 31% | ★ | CD: draw per creature connecting |
| 50 | Royal Assassin | 10 | 8 | 48% |  | AS, repeatable removal |
| 51 | Spark Double | 10 | 8 | 21% | ★ | CPY: copy of Etrata (legend rule ignored) |
| 52 | They Came from the Pipes | 10 | 8 | 58% | ★ | FD: draw whenever a face-down creature enters (each cloak = card) |
| 53 | Thieving Amalgam | 10 | 7 | 47% | ★ | TH manifests each opponent's top card each upkeep; drain when stolen creatures die |
| 54 | Fellwar Stone | 10 | 6 | 36% |  | ramp |
| 55 | Evie Frye | 9 | 9 | 45% | ★ | AS, loot + makes a creature unblockable |
| 56 | Jacob Frye | 9 | 9 | 43% | ★ | AS, recasts Assassin cards from graveyard when Assassins connect |
| 57 | Kindred Dominance | 9 | 9 | 23% | ★ | one-sided wipe (keeps Assassins) |
| 58 | Swiftfoot Boots | 9 | 8 | 32% |  | protection/haste |
| 59 | Withering Torment | 9 | 8 | 27% |  | removal |
| 60 | Deadly Rollick | 9 | 7 | 15% |  | free removal with commander |
| 61 | Swan Song | 9 | 7 | 13% |  | counter |
| 62 | Adrestia | 9 | 6 | 20% | ★ | EV islandwalk vehicle, becomes Assassin when crewed by one; draws |
| 63 | Eagle Vision | 9 | 5 | 53% | ★ | FR draw 3 after an Assassin connects |
| 64 | Omen Hawker | 9 | 5 | 28% | ★ | FD: mana for activated abilities (flip costs) |
| 65 | Raise the Palisade | 8 | 8 | 17% | ★ | one-sided bounce wipe (keeps Assassins) |
| 66 | Back in Town | 8 | 7 | 32% |  | mass outlaw reanimation |
| 67 | Brotherhood Regalia | 8 | 7 | 31% | ★ | TYPE+EV: equipped creature is an Assassin and unblockable |
| 68 | Fell the Profane | 8 | 7 | 20% |  | MDFC removal/land |
| 69 | Kindred Discovery | 8 | 7 | 21% | ★ | CD: draw when Assassins enter or attack |
| 70 | Memory Lapse | 8 | 7 | 39% |  | counter |
| 71 | Ravenloft Adventurer | 8 | 7 | 28% | ★ | AS, initiative, hit counters (Silencer/Mari synergy) |
| 72 | Toxic Deluge | 8 | 7 | 18% |  | wipe |
| 73 | Hullcarver | 8 | 6 | 35% | ★ | AS 1-drop artifact, DT |
| 74 | Mana Drain | 8 | 6 | 12% |  | counter |
| 75 | Mystic Remora | 8 | 6 | 7% |  | draw |
| 76 | Rhystic Study | 8 | 6 | 10% |  | draw |
| 77 | Scheming Symmetry | 8 | 6 | 12% | ★ | TH tech: tutor puts a chosen card on an opponent's library top -> Etrata cloaks it |
| 78 | Sink into Stupor | 8 | 6 | 18% |  | MDFC bounce/land |
| 79 | Thought Vessel | 8 | 5 | 23% |  | ramp/hand size |
| 80 | Thrill-Kill Assassin | 8 | 5 | 23% | ★ | AS 2-drop, DT |
| 81 | Callidus Assassin | 7 | 6 | 19% | ★ | AS, flash clone/removal; can copy Etrata |
| 82 | Poison-Blade Mentor | 7 | 6 | 31% | ★ | AS 2-drop, DT, grants DT |
| 83 | Reality Shift | 7 | 6 | 27% |  | removal (manifest for opponent) |
| 84 | Sakashima of a Thousand Faces | 7 | 6 |  | ★ | CPY: copy of Etrata, turns off legend rule |
| 85 | Shadow, Mysterious Assassin | 7 | 6 | 31% | ★ | AS, DT, sac permanent on hit -> draw 2 + drain |
| 86 | Dark Ritual | 7 | 5 | 17% |  | fast mana |
| 87 | Staff of Eden, Vault's Key | 7 | 4 | 18% | ★ | TH: draws per permanent you control but don't own (cloaks count) |
| 88 | Conspiracy | 6 | 5 | 21% | ★ | TYPE: all your creatures/face-down are Assassins |
| 89 | Hydroelectric Specimen | 6 | 5 | 6% |  | MDFC redirect/land |
| 90 | Nanogene Conversion | 6 | 5 | 14% | ★ | CPY: every other creature becomes a copy of Etrata this turn |
| 91 | Patchwork Banner | 6 | 5 | 19% | ★ | AN +1/+1 chosen type + ramp |
| 92 | Primordial Mist | 6 | 5 | 38% | ★ | FD: manifest each end step; cast face-down cards |
| 93 | Sakashima the Impostor | 6 | 5 |  | ★ | CPY: copy of Etrata |
| 94 | Virtus the Veiled | 6 | 5 | 15% | ★ | AS, DT, WIN halves life on hit |
| 95 | Force of Negation | 6 | 4 |  |  | free counter |
| 96 | Ghostly Flicker | 6 | 4 | 29% | ★ | FD tech: blink face-down cards to flip them; protection |
| 97 | Grim Hireling | 6 | 4 | 13% | ★ | Treasures on hit, removal |
| 98 | Tetsuko Umezawa, Fugitive | 6 | 4 | 18% | ★ | EV: power/toughness 1 or less unblockable |
| 99 | Force of Will | 6 | 2 |  |  | free counter |
| 100 | Become Anonymous | 5 | 5 | 42% | ★ | FD: protects a creature by cloaking it + 2 more cards |
| 101 | Chain Assassination | 5 | 5 | 30% |  | FR removal |
| 102 | Waterlogged Teachings | 5 | 5 | 10% |  | MDFC tutor/land |
| 103 | Ghastly Conscription | 5 | 4 | 30% | ★ | FD/TH: manifest a graveyard's creatures (any player's) |
| 104 | Guul Draz Assassin | 5 | 4 |  |  | AS 1-drop, removal |
| 105 | Negate | 5 | 4 | 27% |  | counter |
| 106 | Restart Sequence | 5 | 4 | 37% |  | FR reanimation |
| 107 | Scarblade Elite | 5 | 4 | 17% |  | AS, removal |
| 108 | Scroll of Fate | 5 | 4 | 37% | ★ | FD: manifest from hand |
| 109 | Ashnod's Altar | 5 | 3 | 5% | ★ | WIN sac outlet (Vein Ripper drain) |
| 110 | Cryptic Coat | 5 | 3 | 33% | ★ | FD cloak + EV unblockable equipment |
| 111 | Midnight Assassin | 5 | 3 | 29% | ★ | AS, EV flying, DT |
| 112 | Mind Stone | 5 | 3 | 21% |  | ramp |
| 113 | Vincent Valentine | 5 | 3 | 11% | ★ | AS, grows, trample/lifelink back face |
| 114 | Chrome Mox | 5 | 2 |  |  | fast mana |
| 115 | Mystical Tutor | 5 | 2 |  |  | tutor |
| 116 | Dolmen Gate | 4 | 4 |  | ★ | protects attackers from combat damage |
| 117 | Loyal Inventor | 4 | 4 |  |  | artifact tutor with an Assassin |
| 118 | Termination Facilitator | 4 | 4 | 12% |  | AS, removal |
| 119 | Boggart Trawler | 4 | 3 |  |  | MDFC graveyard hate/land |
| 120 | Conjurer's Closet | 4 | 3 | 11% | ★ | FD tech: blink a face-down card each end step to flip it free |
| 121 | Crippling Fear | 4 | 3 | 12% | ★ | one-sided -3/-3 (keeps Assassins) |
| 122 | Diabolic Intent | 4 | 3 | 5% |  | tutor |
| 123 | Expel from Orazca | 4 | 3 | 19% |  | bounce |
| 124 | Iridescent Vinelasher | 4 | 3 |  | ★ | AS 1-drop, landfall ping, offspring |
| 125 | Reno and Rude | 4 | 3 | 19% | ★ | AS, EV menace, TH play opponent's exiled top card |
| 126 | The Cyber-Controller | 4 | 3 | 14% | ★ | TH: mill opponents, their creatures enter face-down under your control |
| 127 | Thorn of the Black Rose | 4 | 3 | 15% | ★ | AS, DT, monarch (rewards connecting) |
| 128 | Wayfarer's Bauble | 4 | 3 | 10% |  | ramp |
| 129 | Big Game Hunter | 4 | 2 | 19% |  | AS, removal |
| 130 | Double Down | 4 | 2 | 29% | ★ | copies outlaw (Assassin) spells |
| 131 | Imperial Seal | 4 | 2 |  |  | tutor |
| 132 | Ixidron | 4 | 2 | 19% | ★ | FD: turns all other nontoken creatures face down |
| 133 | Mana Vault | 4 | 2 |  |  | fast mana |
| 134 | Rooftop Assassin | 4 | 2 | 12% |  | AS, flash removal |
| 135 | Notion Thief | 4 | 0 | 6% | ★ | TH: steals opponents' extra draws |
| 136 | Adéwalé, Breaker of Chains | 3 | 3 |  | ★ | AS, digs for Assassins/vehicles |
| 137 | Agate-Blade Assassin | 3 | 3 |  | ★ | AS 2-drop, drains on attack |
| 138 | Auton Soldier | 3 | 3 |  | ★ | CPY: non-legendary copy of Etrata with myriad |
| 139 | Bitter Triumph | 3 | 3 |  |  | removal |
| 140 | Enduring Curiosity | 3 | 3 | 19% | ★ | CD: draw per creature connecting |
| 141 | Levitation | 3 | 3 | 8% | ★ | EV team flying |
| 142 | Open into Wonder | 3 | 3 | 9% | ★ | EV X creatures unblockable + draw on hit |
| 143 | Phyrexian Altar | 3 | 3 |  | ★ | WIN sac outlet (Vein Ripper drain) |
| 144 | Propaganda | 3 | 3 | 10% |  | defense |
| 145 | Quantum Misalignment | 3 | 3 | 6% | ★ | CPY: non-legendary copy of Etrata, rebound |
| 146 | Reanimate | 3 | 3 | 10% |  | reanimation |
| 147 | Resculpt | 3 | 3 | 6% |  | removal |
| 148 | Silver Shroud Costume | 3 | 3 | 6% | ★ | EV unblockable equipment, flash protection |
| 149 | Snuff Out | 3 | 3 |  |  | free removal |
| 150 | Stronghold Assassin | 3 | 3 |  |  | AS, sac-removal |
| 151 | Xenograft | 3 | 3 | 6% | ★ | TYPE: all your creatures are Assassins |
| 152 | Birthday Escape | 3 | 2 |  | ★ | EV: Ring tempts (legendary Ring-bearer evasion) |
| 153 | Black Widow, Deadly Hunter | 3 | 2 | 19% | ★ | AS, DT, CD draw when deathtouchers connect |
| 154 | Call of the Ring | 3 | 2 | 7% | ★ | EV: Ring-bearer evasion + draw |
| 155 | Dowsing Dagger | 3 | 2 |  | ★ | equipment pump; flips to land on hit |
| 156 | Eldrazi Monument | 3 | 2 |  | ★ | AN +1/+1, EV team flying, indestructible |
| 157 | Hagra Mauling | 3 | 2 |  |  | MDFC removal/land |
| 158 | Herald's Horn | 3 | 2 | 9% |  | typal cost reduction/card advantage |
| 159 | Infernal Grasp | 3 | 2 | 17% |  | removal |
| 160 | Interceptor, Shadow's Hound | 3 | 2 | 22% | ★ | EV: Assassins have menace |
| 161 | Loki, Lord of Misrule | 3 | 2 |  | ★ | CPY: make every other creature a copy of Etrata (sorcery speed) |
| 162 | Misinformation | 3 | 2 | 10% | ★ | TH tech: stack an opponent's library top -> Etrata cloaks those cards |
| 163 | Rev, Tithe Extractor | 3 | 2 |  | ★ | TH: Treasure + play opponent's top card on hit; grants DT |
| 164 | Rewind | 3 | 2 |  |  | counter |
| 165 | Ringsight | 3 | 2 | 11% |  | tutor |
| 166 | Rogue Class | 3 | 2 | 18% | ★ | TH: exile + play opponents' cards on hit; EV menace at level 2 |
| 167 | Soul Shatter | 3 | 2 | 6% |  | edict removal |
| 168 | Thassa, Deep-Dwelling | 3 | 2 | 12% | ★ | FD tech: blink a face-down card each end step to flip it free |
| 169 | The Indomitable | 3 | 2 | 6% | ★ | CD: draw per creature connecting (vehicle) |
| 170 | Village Rites | 3 | 2 |  |  | sac-draw |
| 171 | Waterbender Ascension | 3 | 2 | 10% | ★ | EV waterbend unblockable; draws off hits |
| 172 | Whispersilk Cloak | 3 | 2 | 20% | ★ | EV unblockable + shroud equipment |
| 173 | White Widow, Yelena Belova | 3 | 2 | 17% | ★ | AS, DT, +1/+1 counters when deathtouchers connect |
| 174 | Wonder | 3 | 2 |  | ★ | EV: team flying from graveyard |
| 175 | Yuriko, the Tiger's Shadow | 3 | 2 |  | ★ | NIN commander-ninjutsu Ninja (in the 99), drains on hit |
| 176 | Blasphemous Edict | 3 | 1 | 6% |  | wipe |
| 177 | Coastal Piracy | 3 | 1 | 17% | ★ | CD: draw per creature connecting |
| 178 | Corrupted Conviction | 3 | 1 |  |  | sac-draw |
| 179 | Go for the Throat | 3 | 1 | 20% |  | removal |
| 180 | Kaito, Cunning Infiltrator | 3 | 1 | 7% | ★ | NIN tokens, EV unblockable +1, grows on hits |
| 181 | Kiku, Night's Flower | 3 | 1 |  |  | AS, removal |
| 182 | Lantern of Insight | 3 | 1 | 8% | ★ | TH tech: see opponents' top cards before you cloak them |
| 183 | Lim-Dûl's Vault | 3 | 1 |  |  | tutor/selection |
| 184 | Mox Amber | 3 | 1 |  |  | fast mana |
| 185 | Orcish Bowmasters | 3 | 0 |  |  | punisher/ping |

**Lands in 5+ of the 30 lists:** Island 30, Swamp 30, Command Tower 28, Choked Estuary 21, Sunken Hollow 20, Darkwater Catacombs 20, Path of Ancestry 18, Morphic Pool 18, Watery Grave 18, Drowned Catacomb 18, Underground River 16, Rogue's Passage 14, Exotic Orchard 14, Shipwreck Marsh 14, Gloomlake Verge 14, Cavern of Souls 14, Polluted Delta 13, Reliquary Tower 12, Dimir Aqueduct 12, Tainted Isle 12, Otawara, Soaring City 12, Brotherhood Headquarters 11, Clearwater Pathway 11, Undercity Sewers 10, Sunken Ruins 10, Access Tunnel 10, Darkslick Shores 9, Bojuka Bog 9, Shizo, Death's Storehouse 9, Three Tree City 7, Temple of Deceit 7, Urborg, Tomb of Yawgmoth 7, Flooded Strand 7, Underground Sea 7, Ancient Tomb 7, The Black Gate 6, Marsh Flats 6, Misty Rainforest 6, Takenuma, Abandoned Mire 6, River of Tears 5, Prismatic Vista 5, Mutavault 5, Verdant Catacombs 5, City of Brass 5, Mana Confluence 5.

### What separates the 22 aggro/theft lists from the other 8

Share of aggro lists minus share of other lists (cards in 4+ lists). More common in aggro lists: Leyline of Transformation (13/22 vs 0/8), An Offer You Can't Refuse (15/22 vs 1/8), Bident of Thassa (12/22 vs 0/8), Feed the Swarm (14/22 vs 1/8), Arcane Denial (11/22 vs 0/8), Vein Ripper (10/22 vs 0/8), Maskwood Nexus (18/22 vs 3/8), Cover of Darkness (15/22 vs 2/8), Black Market Connections (12/22 vs 1/8), Kindred Dominance (9/22 vs 0/8), Jacob Frye (9/22 vs 0/8), Evie Frye (9/22 vs 0/8), Rooftop Bypass (14/22 vs 2/8), Raise the Palisade (8/22 vs 0/8), Silumgar Assassin (13/22 vs 2/8).

More common in the other lists: Notion Thief (0/22 vs 4/8), Force of Will (2/22 vs 4/8), Chrome Mox (2/22 vs 3/8), Mystical Tutor (2/22 vs 3/8), Eagle Vision (5/22 vs 4/8), Omen Hawker (5/22 vs 4/8), Fellwar Stone (6/22 vs 4/8), Staff of Eden, Vault's Key (4/22 vs 3/8), Big Game Hunter (2/22 vs 2/8), Double Down (2/22 vs 2/8), Imperial Seal (2/22 vs 2/8), Ixidron (2/22 vs 2/8).

## 5. Unusual or clever cards for an aggro/theft plan

Our notes, one line each; "#" = which of the 30 lists play it (section 3 numbering). Card text was checked against the Archidekt/Moxfield card data; rules interactions are our reading and not verified in play.

- **Sash and Waistcoat, Unmen** (#7, #24; EDHREC 15%). Every face-down creature that attacks an opponent can't be blocked. That turns each cloak into an evasive attacker, and with Roshan/Leyline/Maskwood they are Assassins that cloak again on hit. (Its {3} manifest ability can be used by any player, at sorcery speed.)
- **Satoru, the Infiltrator** (#1, #4, #7, #10, #13, #14, #16, #17, #18, #23, #24, #26, #29; EDHREC 40%). Draws when nontoken creatures enter without being cast. Cloaks are put onto the battlefield, not cast, so every batch of cloaks draws a card; also a 2-mana menace Ninja.
- **They Came from the Pipes** (#7, #11, #12, #14, #15, #16, #18, #23, #29, #30; EDHREC 58%). Draws a card whenever a face-down creature enters under your control, so every cloak replaces itself.
- **Staff of Eden, Vault's Key** (#3, #4, #7, #8, #14, #19, #29; EDHREC 18%). Taps to draw a card for each permanent you control but don't own. Cloaked opponent cards count, so it scales with the theft board.
- **Scheming Symmetry** (#1, #2, #3, #5, #24, #26, #27, #30; EDHREC 12%). One mana: two target players (you and an opponent, or two opponents) each tutor a card to the top of their library. If an Assassin then connects with that opponent, Etrata cloaks the card they chose.
- **Misinformation / Lantern of Insight** (Misinformation: #7, #16, #26; EDHREC 10%; Lantern of Insight: #6, #15, #26; EDHREC 8%). Control what you steal: Misinformation puts up to three cards from an opponent's graveyard on top of their library before you hit them; Lantern shows every library's top card.
- **Ghostly Flicker / Conjurer's Closet / Thassa, Deep-Dwelling / Nephalia Smuggler** (Ghostly Flicker: #1, #2, #4, #23, #28, #30; EDHREC 29%; Conjurer's Closet: #2, #11, #18, #23; EDHREC 11%; Thassa, Deep-Dwelling: #1, #2, #23; EDHREC 12%; Nephalia Smuggler: #11). Blinking a face-down permanent card brings it back face up under your control, a free "flip" for stolen creatures and other permanents (instants and sorceries stay in exile). Our rules reading; check before relying on it.
- **Roaming Throne (naming Assassin)** (#3, #5, #6, #7, #9, #10, #15, #16, #17, #18, #19, #20, #22, #23, #25, #27, #29; EDHREC 32%). Etrata's cloak trigger is a triggered ability of an Assassin, so it triggers twice: two cloaks per connecting Assassin.
- **Strionic Resonator** (#17). Copies Etrata's cloak trigger (or an Unstoppable Slasher / Virtus "lose half your life" trigger) for 2 mana.
- **Auton Soldier** (#7, #22, #25). Non-legendary copy of Etrata with myriad: when it attacks, it creates attacking token copies toward each other opponent, and each copy has Etrata's cloak trigger. This is the primer's main multiplier.
- **Irma, Part-Time Mutant / Chameleon, Master of Disguise / Sakashima the Impostor** (Irma, Part-Time Mutant: #18; Chameleon, Master of Disguise: #29; Sakashima the Impostor: #5, #16, #22, #25, #26, #29). Copy Etrata but keep their own name, so the legend rule never applies. Irma re-copies at each of your combats and grows.
- **Nanogene Conversion / Loki, Lord of Misrule / Mystic Reflection / Sakashima's Will** (Nanogene Conversion: #1, #9, #22, #23, #25, #29; EDHREC 14%; Loki, Lord of Misrule: #5, #10, #24; Mystic Reflection: #29; Sakashima's Will: #22). Turn many creatures into Etratas: every connecting copy triggers every Etrata. Loki repeats it each turn at sorcery speed. Nanogene also copies opponents' creatures (primer warns: pair with a one-sided wipe).
- **Hall of Echoes (land)** (#7). A land with "{5}: becomes a copy of target creature you control until end of turn; the legend rule doesn't apply to your permanents this turn": a land-slot Etrata copy. Brand new: EDHREC shows it in only 1 deck on each theme page that lists it.
- **Haunted One** (#25; EDHREC 6%). A Background that also works from the 99: your commander gets "when tapped, it and creatures sharing a type get +2/+0 and undying". With everything an Assassin, each Etrata attack pumps the team.
- **Sword Coast Sailor** (#27). Another Background usable in the 99: Etrata can't be blocked when she attacks the player with the most life (or tied).
- **Ixidron** (#4, #7, #11, #12; EDHREC 19%). Turns every other nontoken creature face down, opponents' included: their threats become vanilla 2/2s while yours can use Etrata's flip ability. Cast it while Etrata is not on the battlefield, or she is turned face down too.
- **Illithid Harvester / The Cyber-Controller / Death in Heaven / Ghastly Conscription** (Illithid Harvester: #11; The Cyber-Controller: #8, #11, #20, #27; EDHREC 14%; Death in Heaven: #11; EDHREC 13%; Ghastly Conscription: #2, #11, #12, #18, #20; EDHREC 30%). Other ways to put opponents' cards face down under your control (or blank tapped attackers into 2/2s), so the theft continues without combat.
- **Reins of Power** (#28). Swap boards with an opponent until end of turn. With Roshan or Maskwood their creatures become Assassins under you, so each one that connects cloaks.
- **Changing Loyalty** (#28). Flash Aura with replicate: when the enchanted creature dies, it comes back under your control. Pairs with deathtouch blockers and Massacre Girl.
- **Opposition / Hidden Strings** (Opposition: #24; Hidden Strings: #24, #28). Every face-down 2/2 becomes a tapper for blockers or lands. Opposition's cost is not a {T} ability, so freshly cloaked creatures can use it at once. Hidden Strings can be ciphered onto an evasive Assassin.
- **Rogue Class / Dream-Thief's Bandana / Reno and Rude / Rev / Fallen Shinobi** (Rogue Class: #4, #16, #18; EDHREC 18%; Dream-Thief's Bandana: #8; Reno and Rude: #1, #4, #13, #18; EDHREC 19%; Rev, Tithe Extractor: #2, #19, #28; Fallen Shinobi: #19; Thieving Varmint: #8). A second "steal a card on hit" engine stacked on Etrata. Thieving Varmint makes mana only for spells you don't own.
- **Islandwalk package (Harbinger of the Seas, Spreading Seas, Stormtide Leviathan, Merfolk lords, Adrestia)** (Harbinger of the Seas: #21; Spreading Seas: #21; Stormtide Leviathan: #21; Master of the Pearl Trident: #21; Adrestia: #6, #7, #9, #11, #14, #21, #23, #26, #30; EDHREC 20%; Vedalken Shackles: #21). Harbinger makes nonbasic lands Islands and Stormtide makes all lands Islands, so islandwalk works against every opponent. #21 builds the deck around it, with Vedalken Shackles as theft.
- **Filth** (#16). From the graveyard, gives your team swampwalk. Only works against opponents who control a Swamp.
- **Archetype of Imagination** (#10). Your creatures fly and theirs can't: full evasion for a wide board of 2/2s.
- **Akroma's Memorial / Eldrazi Monument** (Akroma's Memorial: #12, #16; Eldrazi Monument: #3, #16, #19). Team-wide flying plus haste/protection or indestructible. Turns a board of cloaks into evasive attackers at once.
- **Reverse the Polarity** (#7). Instant: creatures can't be blocked this turn, or counter all other spells. A one-card alpha-strike enabler.
- **Cheap unblockable equipment (Atomic Microsizer, Key to the Side-Door, Silver Shroud Costume, Brotherhood Regalia, My Precious)** (Atomic Microsizer: #7; Key to the Side-Door: #30; Silver Shroud Costume: #1, #20, #30; EDHREC 6%; Brotherhood Regalia: #2, #3, #7, #8, #9, #17, #18, #30; EDHREC 31%; My Precious: #30; EDHREC 3%). Guarantee one connection per turn for Etrata or a copy. Regalia also makes the equipped creature an Assassin (good on a cloak).
- **Dolmen Gate** (#5, #16, #17, #22). Prevents all combat damage to your attackers, so 2/2 cloaks and 1/1 Assassins can attack into anything.
- **Teferi's Veil** (#5). Your attackers phase out at end of combat, so they are safe from removal and wipes until your next untap step (but they can't block).
- **TMNT "sneak" cards (Donatello's / Shredder's / Splinter's Technique, Ninja Teen)** (Donatello's Technique: #18, #24; Shredder's Technique: #18; Splinter's Technique: #18; Ninja Teen: #7, #18). Ninjutsu-style cheap draw, removal and tutoring from returning an unblocked attacker. Caveat: returning a stolen cloak sends it to its owner's hand, so return your own cheap Assassins.
- **Patriarch's Bidding** (#30). Name Assassin: mass reanimation of a typal board after a wipe.
- **Become Anonymous** (#9, #14, #15, #18, #21; EDHREC 42%). Instant protection that turns one creature plus two library cards into three cloaks, all face-down bodies Etrata can flip.
- **Orochi Soul-Reaver** (#1, #2, #3, #7, #12, #14, #15, #18, #19, #23, #26, #28, #29; EDHREC 30%). Ninjutsu {3}{B}; whenever your creatures connect it manifests the defending player's top card and makes a Treasure. A second Etrata-style theft trigger on a ninja.
- **Maskwood "every type" lords (Captain N'ghathrod, Syphon Sliver, Marrow-Gnawer, Tegwyll)** (Captain N'ghathrod: #27; Syphon Sliver: #27; Marrow-Gnawer: #27; Tegwyll, Duke of Splendor: #27). Lords for other types that hit the whole board once Maskwood/Conspiracy is out: menace + mill for Horrors, lifelink for Slivers, fear for Rats, +1/+1 for Faeries.

## 6. Fetch log

All fetches on 2026-10-05, about 0.3-0.5 s between requests.

**Worked**
- `https://json.edhrec.com/pages/commanders/etrata-deadly-fugitive.json` (200).
- Theme/bracket pages `.../etrata-deadly-fugitive/<slug>.json`, all 200: assassins, theft, morph, aggro, control, unblockable, clones, freerunning, midrange, tempo, combo, deathtouch, ninjas, ninjutsu, type-hack, shapeshifters, infect, optimized, upgraded, core, exhibition, cedh, expensive. Only aggro, theft, assassins, optimized, unblockable, morph, clones, upgraded and cedh are tabulated above; the rest were fetched but not tabulated (most have under 30 decks).
- `https://json.edhrec.com/pages/average-decks/etrata-deadly-fugitive.json` (200).
- Archidekt search `https://archidekt.com/api/decks/v3/?commanderName=Etrata%2C%20Deadly%20Fugitive&orderBy=-viewCount&pageSize=50` (pages 1-2) and `...&edhBracket=4` (19 decks) / `edhBracket=5` (0 decks), all 200. `?name=Etrata` also works but mixes in Etrata, the Silencer decks.
- Archidekt deck API `https://archidekt.com/api/decks/<id>/` for 22 decks, all 200 (one dropped, see section 3).
- Moxfield, **through the browser only**: after declining non-essential cookies on moxfield.com, same-origin `fetch()` calls to `https://api2.moxfield.com/v3/decks/all/<publicId>` and `https://api2.moxfield.com/v2/decks/search?...&commanderCardId=9mVd4&sortType=views` returned 200. Nine decks read. The `q=Etrata` search parameter is ignored (it returns unrelated decks); filtering by the commander card id works.
- Moxfield primer page `https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer`, read as page text in the browser.

**Failed / blocked**
- not fetched: `https://json.edhrec.com/pages/commanders/etrata-deadly-fugitive/face-down.json`: 403 AccessDenied. There is no such slug; the face-down theme is `morph`.
- not fetched with curl: `https://api2.moxfield.com/v3/decks/all/WUZ4bXuAlkOruBQue4gpuw`, `https://api2.moxfield.com/v2/decks/all/WUZ4bXuAlkOruBQue4gpuw` and `https://api2.moxfield.com/v2/decks/search?q=Etrata&fmt=commander&sortType=views&sortDirection=Descending&pageSize=50`: 403, Cloudflare HTML page, even with a browser User-Agent, `Accept: application/json`, Referer and Origin headers. They worked from the browser (above).
- not read: `https://moxfield.com/decks/ug41w5qe0EaYCy0emyh3Pg/primer` (AliasGreg primer): stuck on "Loading Moxfield" after two loads and about 20 s. The API has no primer endpoint (`/v3/decks/<id>/primer`, `/v2/decks/all/<id>/primer` and `/v3/decks/all/<id>/primer` all 404).
- `https://api.scryfall.com/cards/collection` and `/cards/named`: 429 rate-limited. Not retried. Card text came from Archidekt's and Moxfield's card data instead.

## 7. Appendix: full decklists

Each list is Etrata + 99. Non-land cards in alphabetical order, then lands. Spell/land MDFCs are listed with the spells, under their front-face name. Click to expand.

<details>
<summary>#1 Assassassassassins (Pad4321, Archidekt, bracket B3, updated 2026-09-24, 31 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/6558910
Author tags: Assassins, Theft

**Non-land (68):** An Offer You Can't Refuse; Arcane Denial; Assassin Initiate; Aven Heartstabber; Basim Ibn Ishaq; Big Game Hunter; Black Market Connections; Bloodline Culling; Boggart Trawler; Braids, Arisen Nightmare; Brotherhood Spy; Call of the Ring; Changeling Outcast; Chaos Shrine's Black Crystal; Counterspell; Cover of Darkness; Dark Ritual; Deadly Rollick; Desmond Miles; Diabolic Intent; Evie Frye; Fell the Profane; Ghostly Flicker; Grazilaxx, Illithid Scholar; Grim Hireling; Guildsworn Prowler; Hagra Mauling; Hired Poisoner; Hookblade Veteran; Hydroelectric Specimen; Iridescent Vinelasher; Jacob Frye; Leyline of Anticipation; Leyline of Transformation; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Mischievous Sneakling; Mothdust Changeling; Nanogene Conversion; Orochi Soul-Reaver; Plumb the Forbidden; Ramses, Assassin Lord; Reconnaissance Mission; Reno and Rude; Resculpt; Rewind; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Satoru, the Infiltrator; Sauron's Ransom; Scheming Symmetry; Shadow, Mysterious Assassin; Sheoldred's Edict; Silver Shroud Costume; Sink into Stupor; Slip Out the Back; Snuff Out; Sol Ring; Stronghold Assassin; Sygg, River Cutthroat; Tetsuko Umezawa, Fugitive; Thassa, Deep-Dwelling; Training Grounds; Wan Shi Tong, Librarian; Waterlogged Teachings; Withering Torment

**Lands (31):** Abundant Countryside; Choked Estuary; Command Tower; Escape Tunnel; Exotic Orchard; Gloomlake Verge; 8 Island; Morphic Pool; Muraganda Raceway; Path of Ancestry; Polluted Delta; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; 8 Swamp; Unclaimed Territory; Watery Grave

</details>

<details>
<summary>#2 Cloaks and Contraband [Dimir Theft Assassin Typal] (Hormesis, Archidekt, bracket not set, updated 2025-10-18, 38 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/6461239
Author tags: Assassins, Deathtouch, Theft, Unblockable, Blink, The Ring, Face-down

**Non-land (61):** Achilles Davenport; An Offer You Can't Refuse; Aqueous Form; Arcane Adaptation; Arcane Signet; Assassin Initiate; Aven Heartstabber; Basim Ibn Ishaq; Birthday Escape; Brotherhood Regalia; Brotherhood Spy; Call of the Ring; Changeling Outcast; Commander's Sphere; Conjurer's Closet; Cover of Darkness; Desmond Miles; Dimir Signet; Etrata, the Silencer; Ezio, Blade of Vengeance; Fell the Profane; Fellwar Stone; Ghastly Conscription; Ghostly Flicker; Grim Hireling; Herald's Horn; Hidden Blade; Hookblade Veteran; Kindred Discovery; Lethal Scheme; Leyline of Transformation; Lydia Frye; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl, Known Killer; Mind Stone; Orochi Soul-Reaver; Patchwork Banner; Pitiless Plunderer; Ramses, Assassin Lord; Reaper's Scythe; Rev, Tithe Extractor; Revel in Riches; Rooftop Bypass; Roshan, Hidden Magister; Scheming Symmetry; Shadow, Mysterious Assassin; Sink into Stupor; Sol Ring; Swiftfoot Boots; Sword of Feast and Famine; Sword of the Animist; Talisman of Dominance; Thassa, Deep-Dwelling; Thieving Amalgam; Thought Vessel; Training Grounds; Vein Ripper; Wings of Velis Vel; Withering Torment; Wonder

**Lands (38):** Arcane Lighthouse; Brotherhood Headquarters; Choked Estuary; Clearwater Pathway; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Drowned Catacomb; Gloomlake Verge; 9 Island; Morphic Pool; Myriad Landscape; Path of Ancestry; Reliquary Tower; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; Sunken Ruins; 9 Swamp; Tainted Isle; Three Tree City; Undercity Sewers

</details>

<details>
<summary>#3 Assassin // Maskwood Nexus (yournamehere, Archidekt, bracket B3, updated 2025-02-16, 33 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/6753341
Author tags: Assassins, Changelings, Shapeshifters, Anthems

**Non-land (66):** Achilles Davenport; Aqueous Form; Arcane Signet; Aven Heartstabber; Back in Town; Ballad of the Black Flag; Basim Ibn Ishaq; Blade of the Oni; Brotherhood Regalia; Brotherhood Spy; Cephalid Facetaker; Chain Assassination; Changeling Outcast; Counterspell; Cover of Darkness; Cryptic Coat; Deadly Rollick; Desmond Miles; Eldrazi Monument; Emry, Lurker of the Loch; Evie Frye; Ezio, Blade of Vengeance; Feed the Swarm; Graaz, Unstoppable Juggernaut; Gruesome Fate; Guildsworn Prowler; Hidden Blade; Hired Poisoner; Irenicus's Vile Duplication; Jacob Frye; Kindred Discovery; Kindred Dominance; Leyline of Transformation; Loyal Inventor; Lydia Frye; Mari, the Killing Quill; Mask of Riddles; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Memory Lapse; Nightmare Unmaking; Orochi Soul-Reaver; Poison-Blade Mentor; Portent; Primordial Mist; Ramses, Assassin Lord; Reality Shift; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Scheming Symmetry; Scroll of Fate; Silent Hallcreeper; Silumgar Assassin; Sol Ring; Staff of Eden, Vault's Key; Tetsuko Umezawa, Fugitive; The Indomitable; Thieving Amalgam; Training Grounds; Unnerving Grasp; Unstoppable Slasher; Vein Ripper; Vela the Night-Clad

**Lands (33):** Brotherhood Headquarters; Choked Estuary; Command Tower; Darkslick Shores; Darkwater Catacombs; Drowned Catacomb; 9 Island; Minas Morgul, Dark Fortress; Path of Ancestry; Shipwreck Marsh; Sunken Hollow; 10 Swamp; Tainted Isle; Temple of Deceit; The Black Gate; Underground River

</details>

<details>
<summary>#4 Seductive Assassin (AmeizingGuy, Archidekt, bracket B3, updated 2026-01-02, 29 lands, plan: partly)</summary>

URL: https://archidekt.com/decks/7869002
Author tags: Assassins

**Non-land (70):** Achilles Davenport; Arcane Signet; Assassin Initiate; Aven Heartstabber; Big Game Hunter; Blasphemous Edict; Boggart Trawler; Brotherhood Spy; Callidus Assassin; Changeling Outcast; Counterspell; Cover of Darkness; Crashing Drawbridge; Crippling Fear; Cyclonic Rift; Deadly Dispute; Desertion; Desmond Miles; Dimir Signet; Double Down; Eagle Vision; Ezio, Blade of Vengeance; Feed the Swarm; Ghostly Flicker; Glasspool Mimic; Go for the Throat; Grazilaxx, Illithid Scholar; Guildsworn Prowler; Hagra Mauling; Herald's Horn; Hired Poisoner; Hookblade Veteran; Hullcarver; Hydroelectric Specimen; Interceptor, Shadow's Hound; Ixidron; Jwari Disruption; Kiku, Night's Flower; Mari, the Killing Quill; Massacre Girl; Massacre Girl, Known Killer; Military Intelligence; Nekrataal; Notion Thief; Omen Hawker; Pongify; Ramses, Assassin Lord; Rapid Hybridization; Reno and Rude; Restart Sequence; Rogue Class; Rooftop Bypass; Roshan, Hidden Magister; Royal Assassin; Ruthless Ripper; Satoru, the Infiltrator; Silumgar Assassin; Sink into Stupor; Sol Ring; Staff of Eden, Vault's Key; Sword of the Animist; Talisman of Dominance; Tetsuko Umezawa, Fugitive; The Spot's Portal; Thrill-Kill Assassin; Training Grounds; Unearth; Vanquisher's Banner; Victimize; Villainous Wrath

**Lands (29):** Brotherhood Headquarters; Choked Estuary; Clearwater Pathway; Command Tower; Darkslick Shores; Dimir Aqueduct; Gloomlake Verge; 3 Island; Memorial to Folly; Path of Ancestry; Rivendell; River of Tears; Secluded Courtyard; Shipwreck Marsh; Sunken Hollow; 9 Swamp; Tainted Isle; Temple of Deceit; Undercity Sewers

</details>

<details>
<summary>#5 Etrata, Deadly Fugitive (B3) (Eldirun, Archidekt, bracket B3, updated 2026-09-25, 35 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/24459413
Author tags: Assassins, Face-down, Shapeshifters, Theft, Changelings, Clones

**Non-land (64):** Agate-Blade Assassin; Amoeboid Changeling; Arcane Signet; Black Market Connections; Changeling Outcast; Clever Impersonator; Crawlspace; Cyclonic Rift; Dark Impostor; Dimir Signet; Dolmen Gate; Etrata, the Silencer; Force of Despair; Glasspool Mimic; Guildsworn Prowler; Guul Draz Assassin; Hired Poisoner; Hullcarver; Imperial Seal; Impostor Syndrome; Iridescent Vinelasher; Leyline of Transformation; Loki, Lord of Misrule; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Midnight Assassin; Mothdust Changeling; No Mercy; Phyrexian Altar; Phyrexian Arena; Propaganda; Ramses, Assassin Lord; Ravenloft Adventurer; Roaming Throne; Royal Assassin; Ruthless Ripper; Sakashima of a Thousand Faces; Sakashima the Impostor; Scarblade Elite; Scheming Symmetry; Shadow, Mysterious Assassin; Shapesharer; Silumgar Assassin; Skeletal Changeling; Skullclamp; Sol Ring; Spark Double; Stronghold Assassin; Stunt Double; Sudden Spoiling; Teferi's Veil; Termination Facilitator; Thrill-Kill Assassin; Training Grounds; Twilight Prophet; Underworld Connections; Universal Automaton; Unstoppable Slasher; Vampiric Tutor; Varragoth, Bloodsky Sire; Virtus the Veiled; Winged Boots

**Lands (35):** Bojuka Bog; Choked Estuary; Command Tower; Darkslick Shores; Darkwater Catacombs; Dimir Aqueduct; 11 Island; Mistvault Bridge; Path of Ancestry; Reliquary Tower; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; 10 Swamp; Temple of Deceit; Thriving Isle

</details>

<details>
<summary>#6 Etrata, Deadly Fugitive: Cloak & Dagger (PhyrexianTrophyHusband, Archidekt, bracket B3, updated 2025-12-25, 34 lands, plan: partly)</summary>

URL: https://archidekt.com/decks/12165446
Author tags: Face-down, Deathtouch, Outlaws, Assassins, Unblockable

**Non-land (65):** Achilles Davenport; Adrestia; Arcane Signet; Assassin Initiate; Aven Heartstabber; Back in Town; Baleful Mastery; Basim Ibn Ishaq; Big Game Hunter; Black Market Connections; Blasphemous Edict; Bounty Board; Changeling Outcast; Charcoal Diamond; Chromatic Lantern; Coastal Piracy; Damnation; Dimir Signet; Double Down; Echoing Truth; Etrata, the Silencer; Ezio, Blade of Vengeance; Fellwar Stone; Gossip's Talent; Grim Hireling; Guildsworn Prowler; Hired Poisoner; Infernal Grasp; Kaito, Cunning Infiltrator; Kiku, Night's Flower; Lantern of Insight; Leyline of Anticipation; March of Swirling Mist; Mari, the Killing Quill; Midnight Assassin; Mind Stone; Misleading Signpost; Overkill; Patchwork Banner; Phyrexian Arena; Poison-Blade Mentor; Ramses, Assassin Lord; Reconnaissance Mission; Roaming Throne; Rooftop Assassin; Royal Assassin; Ruthless Ripper; Sky Diamond; Smoke Bomb; Sol Ring; Stingblade Assassin; Swiftfoot Boots; Talisman of Dominance; Thorn of the Black Rose; Thought Vessel; Thrill-Kill Assassin; Training Grounds; Unstoppable Slasher; Vincent Valentine; Virtus the Veiled; Wayfarer's Bauble; Windfall; Winged Boots; Withering Boon; Withering Torment

**Lands (34):** Accursed Duneyard; Arcane Lighthouse; Cavern of Souls; Choked Estuary; Command Tower; Darkwater Catacombs; Drowned Catacomb; Exotic Orchard; Gloomlake Verge; 4 Island; Muraganda Raceway; Polluted Delta; Rogue's Passage; Sunken Hollow; 13 Swamp; Tainted Isle; Three Tree City; Underground River; Watery Grave

</details>

<details>
<summary>#7 Etrada, Deadly Fugitive 2.0 (Wilotree, Archidekt, bracket B3, updated 2026-09-26, 33 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/16077597
Author tags: Face-down, Assassins, Theft, Unblockable, Clones, Topdeck

**Non-land (66):** Adrestia; Altar's Reap; Arcane Adaptation; Arcane Signet; Ashnod's Altar; Atomic Microsizer; Auton Soldier; Baleful Mastery; Basim Ibn Ishaq; Black Market Connections; Brotherhood Regalia; Changeling Outcast; Coveted Falcon; Dauthi Embrace; Dimir Signet; Eagle Vision; Enduring Curiosity; Expel from Orazca; Ezio, Blade of Vengeance; Feed the Swarm; Fell the Profane; Frantic Search; Gift of Doom; Glaring Fleshraker; Grim Haruspex; Hookblade Veteran; Illicit Masquerade; Irenicus's Vile Duplication; Ixidron; Kothophed, Soul Hoarder; Leyline of Transformation; Machine God's Effigy; Mari, the Killing Quill; Maskwood Nexus; Meekstone; Memory Lapse; Misinformation; Navigation Orb; Ninja Teen; Omen Hawker; Opt; Orochi Soul-Reaver; Raise the Palisade; Reverse the Polarity; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Sash and Waistcoat, Unmen; Satoru, the Infiltrator; Sink into Stupor; Sol Ring; Soul Shatter; Spark Double; Staff of Eden, Vault's Key; Standardize; Swiftfoot Boots; Sword of Hearth and Home; Talisman of Dominance; The Blue Spirit; They Came from the Pipes; Three Steps Ahead; Training Grounds; Twins of Discord; Victimize; Wayfarer's Bauble; Whispersilk Cloak

**Lands (33):** Access Tunnel; Bojuka Bog; Brotherhood Headquarters; Command Tower; Drowned Catacomb; Evolving Wilds; Hall of Echoes; 8 Island; Minas Morgul, Dark Fortress; Morphic Pool; Otawara, Soaring City; Reliquary Tower; Rogue's Passage; Shipwreck Marsh; Shizo, Death's Storehouse; Sunken Hollow; 5 Swamp; Tainted Isle; Terramorphic Expanse; The Black Gate; Tomb of the Spirit Dragon; Urborg, Tomb of Yawgmoth

</details>

<details>
<summary>#8 Etrata (Principium, Archidekt, bracket B3, updated 2025-10-27, 29 lands, plan: partly)</summary>

URL: https://archidekt.com/decks/8383327
Author tags: Assassins, Theft, Commander Matters, Face-down

**Non-land (70):** Arcane Adaptation; Arcane Heist; Assassin Initiate; Aven Heartstabber; Binding Negotiation; Brainstealer Dragon; Brotherhood Regalia; Case of the Stashed Skeleton; Changeling Outcast; Chaos Wand; Coastal Piracy; Conspiracy; Corrupted Conviction; Cover of Darkness; Cryptic Coat; Cunning Rhetoric; Cyber Conversion; Cybership; Dark Impostor; Deadly Cover-Up; Dream-Thief's Bandana; Eagle Vision; Escape Detection; Essence Capture; Etrata, the Silencer; Extract Brain; Ezio, Blade of Vengeance; Faerie Mastermind; Fake Your Own Death; Ghostly Pilferer; Gisa, the Hellraiser; Hired Poisoner; Insatiable Avarice; Ixidor, Reality Sculptor; Lavaspur Boots; Lively Dirge; Long Goodbye; Lord of the Void; Lost Jitte; Lydia Frye; Mari, the Killing Quill; Massacre Girl, Known Killer; Metamorphic Blast; Midnight Reaper; Mind's Dilation; Nashi, Moon Sage's Scion; Orcish Bowmasters; Phantom Interference; Rakish Crew; Ramses, Assassin Lord; Rooftop Assassin; Roshan, Hidden Magister; Rush of Dread; Shadowspear; Silent-Blade Oni; Silumgar Assassin; Slice from the Shadows; Slickshot Lockpicker; Sol Ring; Staff of Eden, Vault's Key; Stolen Goods; Sword of Wealth and Power; Tempted by the Oriq; The Cyber-Controller; The Key to the Vault; Thieving Amalgam; Thieving Varmint; Thought Vessel; Tinybones, the Pickpocket; Training Grounds

**Lands (29):** Access Tunnel; Cavern of Souls; Choked Estuary; Command Tower; Darkslick Shores; Darkwater Catacombs; Dimir Guildgate; Drannith Ruins; Drowned Catacomb; Evolving Wilds; Exotic Orchard; Fetid Pools; 5 Island; Otawara, Soaring City; Prismatic Vista; Public Thoroughfare; Sandstorm Verge; Sunken Citadel; 4 Swamp; Temple of Deceit; The Black Gate; Underground River

</details>

<details>
<summary>#9 Assassin Mitosis Aggro (Bayleef, Archidekt, bracket not set, updated 2025-08-15, 32 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/8296017
Author tags: Flavor, Aggro, Assassins, Unblockable, Theft, Face-down, Deathtouch

**Non-land (67):** Achilles Davenport; Adrestia; Adéwalé, Breaker of Chains; Agatha's Soul Cauldron; An Offer You Can't Refuse; Arcane Adaptation; Arcane Signet; Assassin Initiate; Back in Town; Banner of Kinship; Basim Ibn Ishaq; Become Anonymous; Bident of Thassa; Brotherhood Regalia; Brotherhood Spy; Chain Assassination; Countersquall; Cover of Darkness; Crippling Fear; Desmond Miles; Dimir Signet; Door of Destinies; Eagle Vision; Evie Frye; Ezio, Blade of Vengeance; Feed the Swarm; Fellwar Stone; Guul Draz Assassin; Hired Poisoner; Hookblade Veteran; Hydroelectric Specimen; Jacob Frye; Kindred Discovery; Kindred Dominance; Leyline of Transformation; Lightning Greaves; Loyal Inventor; Lydia Frye; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Memory Lapse; Nanogene Conversion; Negate; Patchwork Banner; Poison-Blade Mentor; Raise the Palisade; Ramses, Assassin Lord; Reality Shift; Roaming Throne; Roshan, Hidden Magister; Royal Assassin; Sapphire Medallion; Shadow, Mysterious Assassin; Sol Ring; Strix Serenade; Swan Song; Talisman of Dominance; The Indomitable; Thought Vessel; Training Grounds; Unstoppable Slasher; Vein Ripper; Vincent Valentine; Virtus the Veiled; Withering Torment

**Lands (32):** Bojuka Bog; Cavern of Souls; Choked Estuary; Command Tower; Dimir Aqueduct; Drowned Catacomb; Escape Tunnel; Flooded Strand; Gloomlake Verge; 7 Island; Morphic Pool; Myriad Landscape; Path of Ancestry; Reliquary Tower; Rogue's Passage; Sunken Hollow; 7 Swamp; Undercity Sewers; Urza's Cave; Watery Grave

</details>

<details>
<summary>#10 assassins In and Out (el_franco_tira, Archidekt, bracket B2, updated 2026-07-02, 37 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/15964319
Author tags: Theft, Assassins, Aggro

**Non-land (62):** Abnormal Endurance; Achilles Davenport; Adaptive Automaton; Adéwalé, Breaker of Chains; Alien Symbiosis; Altar of Bhaal; Arcane Adaptation; Archetype of Finality; Archetype of Imagination; Ashnod's Intervention; Assassin Initiate; Back in Town; Banner of Kinship; Bastion of Remembrance; Black Widow, Deadly Hunter; Brotherhood Spy; Cloak of Mists; Conspiracy; Desmond Miles; Discreet Retreat; Double Down; Enduring Curiosity; Ezio, Blade of Vengeance; Fake Your Own Death; Feign Death; Funeral Room; Heartstone; Hired Poisoner; Hullcarver; Interceptor, Shadow's Hound; Leyline of Transformation; Loki, Lord of Misrule; Loyal Inventor; Lydia Frye; Malakir Rebirth; Maskwood Nexus; Merciless Harlequin; Midnight Assassin; Not Dead After All; Poison-Blade Mentor; Presumed Dead; Rakish Crew; Ramses, Assassin Lord; Roaming Throne; Rooftop Assassin; Roshan, Hidden Magister; Ruthless Ripper; Satoru, the Infiltrator; Scarblade Elite; Silumgar Assassin; Sol Ring; Species Specialist; Take the Fall; Termination Facilitator; The Soul Stone; Thorn of the Black Rose; Training Grounds; Unscrupulous Contractor; Unstoppable Slasher; Viper, Cruel Conspirator; White Widow, Yelena Belova; Xenograft

**Lands (37):** Brotherhood Headquarters; Cavern of Souls; Choked Estuary; Command Tower; Darkslick Shores; Darkwater Catacombs; Dimir Aqueduct; Dismal Backwater; Drowned Catacomb; Gloomlake Verge; Island; Morphic Pool; Reliquary Tower; River of Tears; Shipwreck Marsh; Sunken Hollow; 14 Swamp; Tainted Isle; Temple of Deceit; Three Tree City; Undercity Sewers; Underground River; Underground Sea; Watery Grave

</details>

<details>
<summary>#11 Undercover Assassin (chrjo, Archidekt, bracket not set, updated 2026-05-28, 35 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/11967496
Author tags: Face-down, Assassins, Aggro

**Non-land (64):** Adrestia; Archivist of Gondor; Assassin Initiate; Aven Heartstabber; Basim Ibn Ishaq; Bident of Thassa; Brotherhood Spy; Chain Assassination; Changeling Outcast; Coerced to Kill; Conjurer's Closet; Conspiracy; Crippling Fear; Crystal Shard; Cybership; Death in Heaven; Desmond Miles; Dimir Charm; Eagle Vision; Empowered Autogenerator; Evie Frye; Feed the Swarm; Ghastly Conscription; Glitch Interpreter; Guildsworn Prowler; Hired Poisoner; Hookblade Veteran; Hydroelectric Specimen; Illithid Harvester; Ixidron; Jacob Frye; Jwari Disruption; Levitation; Leyline of Transformation; Lydia Frye; Memory Lapse; Mothdust Changeling; Nephalia Smuggler; Poison-Blade Mentor; Primordial Mist; Reality Shift; Relm's Sketching; Restart Sequence; Roshan, Hidden Magister; Royal Assassin; Ruthless Ripper; Sarevok's Tome; Scampering Surveyor; Shadow, Mysterious Assassin; Silumgar Assassin; Solemn Simulacrum; Stonespeaker Crystal; The Cyber-Controller; The Enigma Jewel; The Regalia; They Came from the Pipes; Thieving Amalgam; Thorn of the Black Rose; Thrill-Kill Assassin; Training Grounds; Vela the Night-Clad; Waterlogged Teachings; Wayfarer's Bauble; Xenograft

**Lands (35):** Access Tunnel; Brotherhood Headquarters; Choked Estuary; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Exotic Orchard; 10 Island; Path of Ancestry; Rogue's Passage; Secluded Courtyard; Sunken Hollow; 12 Swamp; Tainted Isle; Temple of Deceit

</details>

<details>
<summary>#12 Face-Down/Mana-Up (ShroudBreakr, Archidekt, bracket B4, updated 2026-01-05, 36 lands, plan: no)</summary>

URL: https://archidekt.com/decks/10492085

**Non-land (63):** Abhorrent Oculus; Akroma's Memorial; Aminatou's Augury; Ancient Silver Dragon; Arcane Signet; Archfiend of Spite; Blightsteel Colossus; Blood Money; Brine Elemental; Clone Legion; Commander's Sphere; Counterspell; Cruel Tutor; Cryptic Coat; Cybermen Squadron; Deadly Rollick; Demonic Tutor; Dig Through Time; Dimir Signet; Fierce Guardianship; Force of Negation; Force of Will; Ghastly Conscription; Grim Haruspex; Imperial Seal; In Garruk's Wake; Ixidron; James, Wandering Dad; Jeskai Infiltrator; Jin-Gitaxias, Core Augur; Kozilek, the Broken Reality; Mana Drain; Maskwood Nexus; Mind Stone; Mystic Confluence; Mystical Tutor; Negate; Notion Thief; Omarthis, Ghostfire Initiate; Omen Hawker; Omniscience; Orochi Soul-Reaver; Overwhelming Forces; Paranormal Analyst; Phage the Untouchable; Primordial Mist; Ramses, Assassin Lord; Reality Shift; Ringsight; Scroll of Fate; Snapback; Sol Ring; Sphinx of the Second Sun; Talisman of Dominance; They Came from the Pipes; Thieving Amalgam; Thought Vessel; Time Stretch; Training Grounds; Twist Reality; Ugin's Mastery; Vampiric Tutor; Vesuvan Shapeshifter

**Lands (36):** Access Tunnel; Bojuka Bog; Choked Estuary; Command Tower; Darkslick Shores; Darkwater Catacombs; Dimir Aqueduct; Drowned Catacomb; 9 Island; Minas Morgul, Dark Fortress; Morphic Pool; Reliquary Tower; Rogue's Passage; Shizo, Death's Storehouse; Sunken Hollow; Sunken Ruins; 9 Swamp; The Black Gate; Underground River; Watery Grave

</details>

<details>
<summary>#13 Etrata, Deadly Fugitive (Testing Phase) (acclayton, Archidekt, bracket B4, updated 2026-02-22, 30 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/19992021
Author tags: Assassins, Theft, Draw

**Non-land (69):** Achilles Davenport; Agate-Blade Assassin; An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Arcane Signet; Assassin Initiate; Aven Heartstabber; Bident of Thassa; Big Game Hunter; Bitter Triumph; Brotherhood Spy; Cabal Ritual; Callidus Assassin; Changeling Outcast; Counterspell; Cover of Darkness; Cut Down; Cyclonic Rift; Dark Ritual; Demonic Consultation; Demonic Tutor; Desmond Miles; Dimir Signet; Distant Melody; Dream Harvest; Exquisite Blood; Ezio, Blade of Vengeance; Feed the Swarm; Fellwar Stone; Guildsworn Prowler; Guul Draz Assassin; Gwenom, Remorseless; Hired Poisoner; Hookblade Veteran; Hullcarver; Infernal Grasp; Innocuous Rat; Iridescent Vinelasher; Lightning Greaves; Mana Drain; Mari, the Killing Quill; Maskwood Nexus; Mind Stone; Mockingbird; Murder; Mystical Tutor; Necropotence; Negate; Poison-Blade Mentor; Reconnaissance Mission; Reno and Rude; Rhystic Study; Rooftop Bypass; Roshan, Hidden Magister; Royal Assassin; Ruthless Ripper; Satoru, the Infiltrator; Scroll of Fate; Silumgar Assassin; Sol Ring; Sultai Emissary; Talisman of Dominance; Termination Facilitator; Thassa's Oracle; Thought Vessel; Training Grounds; Unstoppable Slasher; Vampiric Tutor

**Lands (30):** Access Tunnel; Ancient Tomb; Brotherhood Headquarters; Choked Estuary; Command Tower; Darkwater Catacombs; Drowned Catacomb; Exotic Orchard; 7 Island; Morphic Pool; Multiversal Passage; Rogue's Passage; 7 Swamp; Tainted Isle; Unclaimed Territory; Underground River; Urborg, Tomb of Yawgmoth; Watery Grave

</details>

<details>
<summary>#14 Stab N Grab (LootKobbler, Archidekt, bracket B4, updated 2025-05-25, 36 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/11686364

**Non-land (63):** Adrestia; Agate-Blade Assassin; An Offer You Can't Refuse; Arcane Denial; Arcane Signet; Assassin Initiate; Aven Heartstabber; Become Anonymous; Beseech the Queen; Bident of Thassa; Black Market Connections; Blasphemous Edict; Callidus Assassin; Chain Assassination; Changeling Outcast; Conspiracy; Counterspell; Cover of Darkness; Crippling Fear; Desmond Miles; Dimir Signet; Distant Melody; Eagle Vision; Etrata, the Silencer; Feed the Swarm; Fell the Profane; Go for the Throat; Grim Tutor; Guildsworn Prowler; Hookblade Veteran; Kindred Discovery; Leyline of Transformation; Lydia Frye; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Murder; Nekrataal; Omen Hawker; Orochi Soul-Reaver; Patchwork Banner; Ramses, Assassin Lord; Ravenloft Adventurer; Reality Shift; Reconnaissance Mission; Ringsight; Rooftop Assassin; Rooftop Bypass; Roshan, Hidden Magister; Satoru, the Infiltrator; Sol Ring; Staff of Eden, Vault's Key; Talisman of Dominance; Tetsuko Umezawa, Fugitive; The Revelations of Ezio; They Came from the Pipes; Thorn of the Black Rose; Toxic Deluge; Training Grounds; Unnerving Grasp; Unscrupulous Contractor; Unstoppable Slasher; Withering Torment

**Lands (36):** Brotherhood Headquarters; Cavern of Souls; Choked Estuary; Command Tower; Darkwater Catacombs; Drowned Catacomb; Fetid Pools; Gloomlake Verge; 10 Island; Path of Ancestry; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; 13 Swamp; Underground River

</details>

<details>
<summary>#15 Etrata Assassins (Adamantx, Archidekt, bracket B4, updated 2026-09-09, 34 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/23124573

**Non-land (65):** Achilles Davenport; An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Arcane Signet; Assassin Initiate; Aven Heartstabber; Back in Town; Basim Ibn Ishaq; Become Anonymous; Black Market Connections; Brotherhood Spy; Callidus Assassin; Chain Assassination; Changeling Outcast; Counterspell; Cover of Darkness; Deadly Rollick; Desmond Miles; Dimir Signet; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Feed the Swarm; Fell the Profane; Fierce Guardianship; Hired Poisoner; Hookblade Veteran; Hullcarver; Jacob Frye; Kheru Spellsnatcher; Kindred Dominance; Lantern of Insight; Leyline of Transformation; Lightning Greaves; Lydia Frye; Mari, the Killing Quill; Massacre Girl; Massacre Girl, Known Killer; Mothdust Changeling; Omen Hawker; Orochi Soul-Reaver; Patchwork Banner; Propaganda; Raise the Palisade; Ramses, Assassin Lord; Restart Sequence; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Scarblade Elite; Silumgar Assassin; Sink into Stupor; Sol Ring; Swan Song; Swiftfoot Boots; Talisman of Dominance; They Came from the Pipes; Thieving Amalgam; Tragic Slip; Unstoppable Slasher; Vein Ripper; Waterlogged Teachings; Withering Torment

**Lands (34):** Bloodstained Mire; Brotherhood Headquarters; Cavern of Souls; Choked Estuary; Command Tower; Darkwater Catacombs; Drowned Catacomb; Exotic Orchard; Flooded Strand; Gloomlake Verge; 2 Island; Marsh Flats; Misty Rainforest; Morphic Pool; Otawara, Soaring City; Path of Ancestry; Polluted Delta; Reliquary Tower; Rogue's Passage; Secluded Courtyard; Secret Tunnel; Shipwreck Marsh; Shizo, Death's Storehouse; Sunken Ruins; 4 Swamp; Takenuma, Abandoned Mire; Three Tree City; Undercity Sewers; Underground River; Watery Grave

</details>

<details>
<summary>#16 Cloak & Dagger (Etrata, Deadly Fugitive EDH) (FrostyWalsh, Archidekt, bracket B4, updated 2026-06-20, 32 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/23613428
Author tags: Assassins, Face-down

**Non-land (67):** Agadeem's Awakening; Akroma's Memorial; An Offer You Can't Refuse; Arcane Adaptation; Arcane Signet; Aven Heartstabber; Back in Town; Bident of Thassa; Changeling Outcast; Cover of Darkness; Cyclonic Rift; Demonic Tutor; Dimir Signet; Dolmen Gate; Eldrazi Monument; Expel from Orazca; Feed the Swarm; Fierce Guardianship; Filth; Guildsworn Prowler; Hired Poisoner; Hullcarver; Irenicus's Vile Duplication; Kaito, Cunning Infiltrator; Kindred Discovery; Kindred Dominance; Leyline of Transformation; Lim-Dûl's Vault; Mana Drain; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Misinformation; Mothdust Changeling; Mystic Remora; No Mercy; Open into Wonder; Propaganda; Raise the Palisade; Ramses, Assassin Lord; Reality Shift; Reconnaissance Mission; Roaming Throne; Rogue Class; Ruthless Ripper; Sakashima of a Thousand Faces; Sakashima the Impostor; Satoru, the Infiltrator; Sea Gate Restoration; Silumgar Assassin; Sol Ring; Spark Double; Swiftfoot Boots; Tale's End; Talisman of Dominance; They Came from the Pipes; Thought Vessel; Toxic Deluge; Training Grounds; Trickbind; Unstoppable Slasher; Vampiric Tutor; Vein Ripper; Waterlogged Teachings; Whispersilk Cloak; Withering Torment

**Lands (32):** Access Tunnel; Ancient Tomb; Bojuka Bog; Cavern of Souls; Command Tower; Creeping Tar Pit; Darkslick Shores; Drowned Catacomb; Fetid Pools; Gloomlake Verge; 2 Island; Morphic Pool; Mutavault; Otawara, Soaring City; Plaza of Heroes; Polluted Delta; Reliquary Tower; River of Tears; Rogue's Passage; Shipwreck Marsh; Sunken Hollow; Sunken Ruins; 2 Swamp; Tainted Isle; Takenuma, Abandoned Mire; Three Tree City; Undercity Sewers; Underground Sea; Urborg, Tomb of Yawgmoth; Watery Grave

</details>

<details>
<summary>#17 Etrata the Murderous Thief (Zeraseth, Archidekt, bracket B4, updated 2026-09-21, 36 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/26581085
Author tags: Assassins, Aggro, Morph, Theft, Unblockable

**Non-land (63):** An Offer You Can't Refuse; Arcane Adaptation; Arcane Signet; Assassin Initiate; Basim Ibn Ishaq; Bident of Thassa; Black Market Connections; Brotherhood Regalia; Brotherhood Spy; Changeling Outcast; Counterspell; Cover of Darkness; Cryptic Coat; Cyclonic Rift; Deadly Rollick; Demonic Consultation; Demonic Tutor; Desmond Miles; Diabolic Intent; Dimir Signet; Dolmen Gate; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Fierce Guardianship; Flare of Denial; Force of Negation; Force of Will; Jacob Frye; Lydia Frye; Mana Drain; Mana Vault; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Mystic Remora; Mystical Tutor; Opposition Agent; Primordial Mist; Ramses, Assassin Lord; Rhystic Study; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Royal Assassin; Sakashima of a Thousand Faces; Satoru, the Infiltrator; Sol Ring; Spark Double; Strionic Resonator; Swan Song; Swiftfoot Boots; Tainted Pact; Talisman of Dominance; Tetsuko Umezawa, Fugitive; Thassa's Oracle; Thieving Amalgam; Toxic Deluge; Training Grounds; Unstoppable Slasher; Vampiric Tutor; Vein Ripper

**Lands (36):** Bloodstained Mire; Bojuka Bog; Brotherhood Headquarters; Cavern of Souls; City of Brass; Clearwater Pathway; Command Tower; Darkslick Shores; Darkwater Catacombs; Drowned Catacomb; Exotic Orchard; Fabled Passage; Fetid Pools; Flooded Strand; Island; Mana Confluence; Marsh Flats; Minamo, School at Water's Edge; Misty Rainforest; Morphic Pool; Mystic Sanctuary; Otawara, Soaring City; Path of Ancestry; Polluted Delta; Prismatic Vista; Reflecting Pool; Scalding Tarn; Shipwreck Marsh; Sunken Hollow; Sunken Ruins; Swamp; Takenuma, Abandoned Mire; Undercity Sewers; Underground River; Verdant Catacombs; Watery Grave

</details>

<details>
<summary>#18 Errata (PR0X1_K1NG, Archidekt, bracket B4, updated 2026-05-06, 33 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/22232527
Author tags: Assassins, Theft, Face-down

**Non-land (66):** An Offer You Can't Refuse; Arcane Denial; Assassin Initiate; Aven Heartstabber; Back in Town; Become Anonymous; Bident of Thassa; Black Market Connections; Brotherhood Regalia; Brotherhood Spy; Changeling Outcast; Conjurer's Closet; Counterspell; Cyclonic Rift; Demonic Tutor; Desmond Miles; Dimir Signet; Donatello's Technique; Double Down; Emeritus of Woe; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Feed the Swarm; Fierce Guardianship; Ghastly Conscription; Herald's Horn; Interceptor, Shadow's Hound; Irma, Part-Time Mutant; Jacob Frye; Leyline of Transformation; Lightning Greaves; Lydia Frye; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Midnight Clock; Negate; Ninja Teen; Omen Hawker; Orochi Soul-Reaver; Ramses, Assassin Lord; Ravenloft Adventurer; Reality Shift; Reno and Rude; Roaming Throne; Rogue Class; Rooftop Bypass; Roshan, Hidden Magister; Royal Assassin; Satoru, the Infiltrator; Scroll of Fate; Shredder's Technique; Silumgar Assassin; Sink into Stupor; Sol Ring; Splinter's Technique; Swiftfoot Boots; The Enigma Jewel; They Came from the Pipes; Thieving Amalgam; Training Grounds; Unstoppable Slasher; Vampiric Tutor; Virtus the Veiled

**Lands (33):** Brotherhood Headquarters; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Drowned Catacomb; Evolving Wilds; Gloomlake Verge; 7 Island; Path of Ancestry; Polluted Delta; Shipwreck Marsh; Sunken Hollow; 12 Swamp; Tainted Isle; Undercity Sewers; Watery Grave

</details>

<details>
<summary>#19 Theft and Manipulation (Catharsis001, Archidekt, bracket B4, updated 2025-04-10, 32 lands, plan: no)</summary>

URL: https://archidekt.com/decks/12421090

**Non-land (67):** Arcane Adaptation; Arcane Signet; Archmage Ascension; Ashnod's Altar; Assassin Gauntlet; Beguiler of Wills; Bolas's Citadel; Brotherhood Spy; Changeling Outcast; Chrome Mox; Copy Enchantment; Cyclonic Rift; Dauthi Voidwalker; Demonic Tutor; Desmond Miles; Eldrazi Monument; Etrata, the Silencer; Expropriate; Fallen Shinobi; Fblthp, Lost on the Range; Fellwar Stone; Fierce Guardianship; Force of Will; Geth, Lord of the Vault; Gisa, Glorious Resurrector; Gonti, Night Minister; Irenicus's Vile Duplication; Jin-Gitaxias, Core Augur; Kaito, Cunning Infiltrator; Kaito, Dancing Shadow; Kozilek, Butcher of Truth; Last Thoughts; Mana Drain; Maralen of the Mornsong; Mari, the Killing Quill; Maskwood Nexus; Mindbreak Trap; Mox Amber; Mox Diamond; Mox Opal; Mystical Tutor; Notion Thief; Opposition Agent; Orochi Soul-Reaver; Ramses, Assassin Lord; Rev, Tithe Extractor; Rhystic Study; Roaming Throne; Roil Elemental; Rooftop Bypass; Roshan, Hidden Magister; Silent-Blade Oni; Staff of Eden, Vault's Key; Stolen Identity; Swan Song; Tergrid, God of Fright; Tezzeret, Master of Metal; The One Ring; The Scarab God; Thieving Amalgam; Tinybones, the Pickpocket; Training Grounds; Unstoppable Plan; Vampiric Tutor; Whispersilk Cloak; Xanathar, Guild Kingpin; Yuriko, the Tiger's Shadow

**Lands (32):** Academy Ruins; Cabal Coffers; Cabal Stronghold; Choked Estuary; Clearwater Pathway; Gloomlake Verge; 9 Island; Mistrise Village; Morphic Pool; Polluted Delta; Reliquary Tower; Shizo, Death's Storehouse; 9 Swamp; Underground Sea; Urza's Saga; Watery Grave

</details>

<details>
<summary>#20 Etrata assassins (GreyRogueOutcast, Archidekt, bracket B4, updated 2025-11-06, 37 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/7928337

**Non-land (62):** An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Aven Heartstabber; Bident of Thassa; Black Market Connections; Callidus Assassin; Changeling Outcast; Counterspell; Cover of Darkness; Cryptic Coat; Cyclonic Rift; Dark Ritual; Deadly Rollick; Demonic Tutor; Etrata, the Silencer; Feed the Swarm; Fierce Guardianship; Force of Negation; Force of Will; Ghastly Conscription; Guildsworn Prowler; Hired Poisoner; Irenicus's Vile Duplication; Kiku, Night's Flower; Kindred Discovery; Lightning Greaves; Mana Drain; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Memory Lapse; Midnight Assassin; Mothdust Changeling; Mystic Remora; Primordial Mist; Raise the Palisade; Ramses, Assassin Lord; Ravenloft Adventurer; Reconnaissance Mission; Rhystic Study; Roaming Throne; Royal Assassin; Ruthless Ripper; Sakashima of a Thousand Faces; Scarblade Elite; Scroll of Fate; Silumgar Assassin; Silver Shroud Costume; Sol Ring; Spark Double; Swan Song; Termination Facilitator; The Cyber-Controller; Thieving Amalgam; Thrill-Kill Assassin; Toxic Deluge; Training Grounds; Vampiric Tutor; Vein Ripper; Virtus the Veiled

**Lands (37):** Access Tunnel; Ancient Tomb; Bloodstained Mire; Cavern of Souls; City of Brass; Clearwater Pathway; Command Tower; Darkwater Catacombs; Drowned Catacomb; Exotic Orchard; Flooded Strand; Gemstone Caverns; 3 Island; Mana Confluence; Marsh Flats; Misty Rainforest; Morphic Pool; Otawara, Soaring City; Path of Ancestry; Polluted Delta; Scalding Tarn; Shipwreck Marsh; Shizo, Death's Storehouse; Sunken Hollow; Sunken Ruins; 3 Swamp; Tainted Isle; Undercity Sewers; Underground River; Underground Sea; Urborg, Tomb of Yawgmoth; Verdant Catacombs; Watery Grave

</details>

<details>
<summary>#21 Assassin Vehicle (splitsolace, Archidekt, bracket B4, updated 2026-09-27, 30 lands, plan: yes)</summary>

URL: https://archidekt.com/decks/26515260

**Non-land (69):** Achilles Davenport; Adrestia; Adéwalé, Breaker of Chains; Anchor to Reality; Aquitect's Will; Arcane Signet; Auditore Ambush; Back in Town; Back on Track; Become Anonymous; Bitter Triumph; Blade of the Bloodchief; Bone Splinters; Brotherhood Spy; Call to the Netherworld; Callidus Assassin; Counterspell; Deadeye Quartermaster; Deluxe Dragster; Demonic Tutor; Deprive; Dreadmobile; Engulf the Shore; Escape Detection; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Fact or Fiction; Fierce Guardianship; Flow of Knowledge; Gifts Ungiven; Harbinger of the Seas; Jacob Frye; Kindred Dominance; Lifecraft Engine; Mari, the Killing Quill; Master of the Pearl Trident; Merfolk Wayfinder; Merrow Harbinger; Mobilizer Mech; Panoptic Mirror; Passenger Ferry; Piracy Charm; Pirated Copy; Ramses, Assassin Lord; Ravenloft Adventurer; Restart Sequence; Rhystic Study; Rooftop Bypass; Roshan, Hidden Magister; Royal Assassin; Seasinger; Shadow, Mysterious Assassin; Silumgar Assassin; Sinkhole; Snuff Out; Sol Ring; Spiteful Blow; Spreading Seas; Stormtide Leviathan; Stronghold Assassin; Talisman of Dominance; The Revelations of Ezio; Tide Shaper; Unlicensed Hearse; Unstoppable Slasher; Vedalken Shackles; Vein Ripper; Vincent Valentine

**Lands (30):** Access Tunnel; Evolving Wilds; Fabled Passage; Foul Roads; 15 Island; 10 Swamp; Urza's Cave

</details>

<details>
<summary>#22 🧿Fugitives🧿 (Best Bracket 4 Assassin Snowball - Etrata, Deadly Fugitive) (ozmly, Moxfield, bracket user 4, auto 4, updated 2025-03-24, 33 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw

**Non-land (66):** An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Arcane Signet; Ashnod's Altar; Auton Soldier; Bident of Thassa; Black Market Connections; Changeling Outcast; Chrome Mox; Coastal Piracy; Conspiracy; Cover of Darkness; Culling the Weak; Cyclonic Rift; Dark Confidant; Dark Ritual; Deadly Rollick; Demonic Tutor; Desmond Miles; Diabolic Intent; Dimir Signet; Dolmen Gate; Fatal Push; Feed the Swarm; Fierce Guardianship; Force of Negation; Gix, Yawgmoth Praetor; Hired Poisoner; Hookblade Veteran; Imperial Seal; Irenicus's Vile Duplication; Kindred Dominance; Levitation; Lightning Greaves; Lydia Frye; Mana Drain; Mana Vault; Maskwood Nexus; Mothdust Changeling; Mox Amber; Mystic Remora; Nanogene Conversion; Open into Wonder; Phyrexian Altar; Quantum Misalignment; Raise the Palisade; Ramses, Assassin Lord; Reanimate; Rhystic Study; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Sakashima of a Thousand Faces; Sakashima the Impostor; Sakashima's Will; Sol Ring; Spark Double; Swan Song; Talisman of Dominance; The One Ring; Training Grounds; Vampiric Tutor; Vein Ripper; Zulaport Cutthroat

**Lands (33):** Ancient Tomb; Cabal Coffers; Cavern of Souls; Choked Estuary; City of Brass; Clearwater Pathway; Command Tower; Darkwater Catacombs; Exotic Orchard; Flooded Strand; Island; Mana Confluence; Marsh Flats; Misty Rainforest; Morphic Pool; Mutavault; Otawara, Soaring City; Path of Ancestry; Phyrexian Tower; Plaza of Heroes; Polluted Delta; Prismatic Vista; Strip Mine; Sunken Ruins; Swamp; Three Tree City; Underground River; Underground Sea; Urborg, Tomb of Yawgmoth; Urza's Saga; Verdant Catacombs; Wasteland; Watery Grave

</details>

<details>
<summary>#23 🗡️Deadly turn three cloak with Etrata💨 (AliasGreg, Moxfield, bracket user 4, auto 4, updated 2026-09-22, 31 lands, plan: partly)</summary>

URL: https://moxfield.com/decks/ug41w5qe0EaYCy0emyh3Pg

**Non-land (68):** Adrestia; Agadeem's Awakening; Arcane Adaptation; Arcane Signet; Ashnod's Altar; Aven Heartstabber; Basim Ibn Ishaq; Black Widow, Deadly Hunter; Brotherhood Spy; Changeling Outcast; Chrome Mox; Conjurer's Closet; Counterspell; Dark Ritual; Deadly Rollick; Demonic Tutor; Desmond Miles; Dismember; Eagle Vision; Etrata, the Silencer; Ezio, Blade of Vengeance; Fell the Profane; Fellwar Stone; Fierce Guardianship; Force of Negation; Force of Will; Ghostly Flicker; Grim Hireling; Guildsworn Prowler; Hired Poisoner; Hookblade Veteran; Irenicus's Vile Duplication; Kindred Discovery; Mana Vault; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Mothdust Changeling; Muddle the Mixture; Nanogene Conversion; Omni-Changeling; Orcish Bowmasters; Orochi Soul-Reaver; Ramses, Assassin Lord; Raven Eagle; Ravenloft Adventurer; Rhystic Study; Roaming Throne; Roshan, Hidden Magister; Ruthless Ripper; Sakashima of a Thousand Faces; Satoru, the Infiltrator; Scarblade Elite; Shadow, Mysterious Assassin; Sink into Stupor; Spark Double; Swan Song; Talion, the Kindly Lord; Thassa, Deep-Dwelling; The Meathook Massacre; They Came from the Pipes; Toxic Deluge; Tragic Slip; Training Grounds; Vincent Valentine; Viper, Cruel Conspirator; White Widow, Yelena Belova

**Lands (31):** Ancient Tomb; Bloodstained Mire; Cabal Pit; Cavern of Souls; Command Tower; Exotic Orchard; Flooded Strand; Gemstone Caverns; Gloomlake Verge; 3 Island; Marsh Flats; Misty Rainforest; Morphic Pool; Mutavault; Otawara, Soaring City; Phyrexian Tower; Polluted Delta; Scalding Tarn; Shizo, Death's Storehouse; Spymaster's Vault; Sunken Hollow; 3 Swamp; Takenuma, Abandoned Mire; Three Tree City; Verdant Catacombs; Watery Grave; Westvale Abbey

</details>

<details>
<summary>#24 Assassin Theft (Halerand, Moxfield, bracket user not set, auto 4, updated 2026-10-02, 31 lands, plan: partly)</summary>

URL: https://moxfield.com/decks/i-QbyFaPQEuG9F44QmFadg

**Non-land (68):** Agatha's Soul Cauldron; Assassin Initiate; Basim Ibn Ishaq; Bile-Vial Boggart; Bloodchief Ascension; Brainstorm; Carnival of Souls; Changeling Outcast; Chrome Mox; Corrupted Conviction; Cruel Sadist; Culling the Weak; Dark Ritual; Dauthi Voidwalker; Daze; Deadly Dispute; Demonic Tutor; Diabolic Intent; Disciple of Deceit; Donatello's Technique; Eagle Vision; Entomb; Fierce Guardianship; Flare of Denial; Force of Will; Gitaxian Probe; Guul Draz Assassin; Hidden Strings; Hired Poisoner; Hookblade Veteran; Hullcarver; Imperial Seal; Iridescent Vinelasher; Jace's Archivist; Lightning Greaves; Lim-Dûl's Vault; Loki, Lord of Misrule; Lotus Petal; Mana Vault; Mausoleum Wanderer; Mockingbird; Mothdust Changeling; Mox Amber; Mox Diamond; Mystic Remora; Mystical Tutor; Omen Hawker; Opposition; Orcish Bowmasters; Personal Tutor; Ponder; Ruthless Ripper; Sash and Waistcoat, Unmen; Satoru, the Infiltrator; Scheming Symmetry; Skullclamp; Snarling Gorehound; Sol Ring; Spellskite; Subtlety; Tainted Pact; Tetsuko Umezawa, Fugitive; Training Grounds; Universal Automaton; Vampiric Tutor; Village Rites; Waterbender Ascension; Wonder

**Lands (31):** Ancient Tomb; Cavern of Souls; City of Brass; Clearwater Pathway; Command Tower; Darkwater Catacombs; Exotic Orchard; Gemstone Caverns; Gloomlake Verge; Hidden Lair; 2 Island; Mana Confluence; Morphic Pool; Multiversal Passage; Otawara, Soaring City; Phyrexian Tower; Polluted Delta; Prismatic Vista; Shizo, Death's Storehouse; 2 Snow-Covered Island; 2 Snow-Covered Swamp; Starting Town; Sunken Ruins; 2 Swamp; Underground River; Underground Sea; Watery Grave

</details>

<details>
<summary>#25 Got any win-cons? (BlockSnake, Moxfield, bracket user not set, auto 4, updated 2025-10-15, 34 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/Y0zMk8ndOkGcaS-6_0vhCA

**Non-land (65):** An Offer You Can't Refuse; Animate Dead; Arcane Adaptation; Arcane Denial; Arcane Signet; Ashnod's Altar; Auton Soldier; Aven Heartstabber; Bident of Thassa; Birthday Escape; Black Market Connections; Blade of Selves; Callidus Assassin; Changeling Outcast; Chrome Mox; Cover of Darkness; Cyclonic Rift; Dark Confidant; Deadly Rollick; Dimir Signet; Dowsing Dagger; Fatal Push; Feed the Swarm; Fellwar Stone; Fierce Guardianship; Force of Negation; Gilded Drake; Guildsworn Prowler; Guul Draz Assassin; Haunted One; Hired Poisoner; Irenicus's Vile Duplication; Kindred Dominance; Levitation; Lightning Greaves; Mana Drain; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl, Known Killer; Mistwalker; Mothdust Changeling; Mystic Remora; Nanogene Conversion; Open into Wonder; Phyrexian Altar; Quantum Misalignment; Raise the Palisade; Ramses, Assassin Lord; Reanimate; Reconnaissance Mission; Rhystic Study; Roaming Throne; Ruthless Ripper; Sakashima of a Thousand Faces; Sakashima the Impostor; Sleeper's Robe; Sol Ring; Spark Double; Swan Song; Swiftfoot Boots; Talisman of Dominance; Training Grounds; Vein Ripper; Village Rites; Virtus the Veiled

**Lands (34):** Ancient Tomb; Cabal Coffers; Cavern of Souls; Choked Estuary; City of Brass; Clearwater Pathway; Command Tower; Darkwater Catacombs; Exotic Orchard; Flooded Strand; Island; Mana Confluence; Marsh Flats; Misty Rainforest; Morphic Pool; Mutavault; Otawara, Soaring City; Path of Ancestry; Phyrexian Tower; Plaza of Heroes; Polluted Delta; Prismatic Vista; Reliquary Tower; Strip Mine; Sunken Ruins; 2 Swamp; Underground River; Underground Sea; Urborg, Tomb of Yawgmoth; Urza's Saga; Verdant Catacombs; Wasteland; Watery Grave

</details>

<details>
<summary>#26 Secret Knowledge is Secret Power :) | Etrata, Deadly Fugitive (TransmitKromer57, Moxfield, bracket user 2, auto 3, updated 2024-09-27, 34 lands, plan: no)</summary>

URL: https://moxfield.com/decks/zF6-gbOai0uJVaoy8GLYOw

**Non-land (65):** Adrestia; An Offer You Can't Refuse; Animate Dead; Arcane Signet; Assassin Initiate; Aven Heartstabber; Birthday Escape; Blood Money; Braids, Arisen Nightmare; Brine Elemental; Call of the Ring; Changeling Outcast; Counterspell; Coveted Falcon; Cyber Conversion; Desertion; Dimir Signet; Dismember; Dowsing Dagger; Expel from Orazca; Fellwar Stone; Gitaxian Probe; Go for the Throat; Guildsworn Prowler; Heartless Conscription; Hired Poisoner; Kaya's Ghostform; Kheru Spellsnatcher; Lantern of Insight; Lightning Greaves; Lim-Dûl's Vault; March of Swirling Mist; Mari, the Killing Quill; Memory Lapse; Midnight Assassin; Misinformation; Mothdust Changeling; Mystic Remora; Notion Thief; Omen Hawker; Orochi Soul-Reaver; Portent; Predators' Hour; Preordain; Prismatic Lens; Ramses, Assassin Lord; Reconnaissance Mission; Rewind; Ruthless Ripper; Sakashima the Impostor; Satoru, the Infiltrator; Scheming Symmetry; Shadow of the Second Sun; Sol Ring; Soul Shatter; Spark Double; Spellskite; Standardize; Talisman of Dominance; The Indomitable; Thrill-Kill Assassin; Training Grounds; Unearth; Unstoppable Slasher; Unwind

**Lands (34):** Access Tunnel; Choked Estuary; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Dismal Backwater; Drowned Catacomb; Exotic Orchard; Holdout Settlement; 10 Island; Myriad Landscape; River of Tears; Rogue's Passage; Submerged Boneyard; Sunken Hollow; 9 Swamp; Temple of Deceit

</details>

<details>
<summary>#27 MASK WOOD NEXUS INSANITY (DeckTechsForDecks, Moxfield, bracket user not set, auto 3, updated 2024-02-17, 36 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/tE-og0iEvkW78o5QEfZs0g

**Non-land (63):** An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Arcane Signet; Beseech the Mirror; Bident of Thassa; Black Market Connections; Burakos, Party Leader; Captain N'ghathrod; Changeling Outcast; Charcoal Diamond; Conspiracy; Crypt Ghast; Demonic Tutor; Dimir Signet; Echo of Eons; Emry, Lurker of the Loch; Expedition Map; Fabricate; Feed the Swarm; Fellwar Stone; Grim Tutor; Jace's Archivist; Kindred Discovery; Lightning Greaves; Lord of the Nazgûl; Mari, the Killing Quill; Marrow-Gnawer; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Memory Lapse; Mind Stone; Mistwalker; Moonglove Changeling; Mothdust Changeling; Night's Whisper; Nighthawk Scavenger; Raise the Palisade; Ramses, Assassin Lord; Reconnaissance Mission; Resculpt; Roaming Throne; Scheming Symmetry; Silumgar Assassin; Silumgar, the Drifting Death; Sky Diamond; Sol Ring; Swan Song; Swiftfoot Boots; Sword Coast Sailor; Syphon Sliver; Talisman of Dominance; Tegwyll, Duke of Splendor; Thada Adel, Acquisitor; The Cyber-Controller; Toxic Deluge; Training Grounds; Venomous Changeling; Wayfarer's Bauble; Windfall; Xenograft; Yuriko, the Tiger's Shadow

**Lands (36):** Cabal Coffers; Choked Estuary; Command Tower; Darkwater Catacombs; Dimir Aqueduct; Exotic Orchard; 12 Island; Myriad Landscape; Path of Ancestry; Sunken Hollow; 13 Swamp; Tainted Isle; Urborg, Tomb of Yawgmoth

</details>

<details>
<summary>#28 I Shoulda Got That 👀 (AlexLittle, Moxfield, bracket user 3, auto 2, updated 2026-10-03, 34 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/B8Ln70WmXU-Nwwb69CG7OQ

**Non-land (65):** Achilles Davenport; Arcane Heist; Artistic Refusal; Assassin Initiate; Aven Heartstabber; Basim Ibn Ishaq; Bile-Vial Boggart; Boggart Trawler; Brotherhood Spy; Changeling Outcast; Changing Loyalty; Chthonian Nightmare; Cover of Darkness; Day of the Dragons; Desmond Miles; Dowsing Dagger; Expel from Orazca; Fell the Profane; Frantic Search; Garland, Royal Kidnapper; Ghostly Flicker; Gix, Yawgmoth Praetor; Gonti, Night Minister; Grim Hireling; Harmonized Crescendo; Hidden Strings; Hired Poisoner; Hookblade Veteran; Hullcarver; Hydroelectric Specimen; Lethal Scheme; Lost Jitte; Malakir Rebirth; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl, Known Killer; Meathook Massacre II; Memory Lapse; Mirrorform; Mothdust Changeling; Naga Fleshcrafter; Omni-Changeling; Orochi Soul-Reaver; Poison-Blade Mentor; Ravenloft Adventurer; Reanimate; Reins of Power; Reset; Rev, Tithe Extractor; Rewind; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Silumgar Assassin; Sink into Stupor; Snap; Stalactite Dagger; The Blue Spirit; Thrill-Kill Assassin; Training Grounds; Unexpected Assistance; Unwind; Waterbender Ascension; White Widow, Yelena Belova; Wonder

**Lands (34):** Bojuka Bog; Choked Estuary; Clearwater Pathway; Command Tower; Darkslick Shores; Demolition Field; Dimir Aqueduct; Drowned Catacomb; 5 Island; Lotus Field; Muraganda Raceway; Otawara, Soaring City; Path of Ancestry; Polluted Delta; River of Tears; Spymaster's Vault; 4 Swamp; Takenuma, Abandoned Mire; Talon Gates of Madara; The Black Gate; Thespian's Stage; Tolaria West; Undercity Sewers; Underground River; Urza's Cave; Watery Grave; Westvale Abbey

</details>

<details>
<summary>#29 [EDH] Etrata - "Stabby Guys" - Assassin Tribal Value (ShoMinamoto, Moxfield, bracket user 3, auto 3, updated 2026-10-03, 32 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/WJKiS_ktV02HZUFOWFjWJw

**Non-land (67):** An Offer You Can't Refuse; Arcane Adaptation; Arcane Denial; Arcane Signet; Aven Heartstabber; Basim Ibn Ishaq; Black Market Connections; Black Widow, Deadly Hunter; Boggart Trawler; Bolas's Citadel; Brotherhood Spy; Chameleon, Master of Disguise; Changeling Outcast; Counterspell; Cover of Darkness; Dark Ritual; Desmond Miles; Dimir Signet; Enduring Curiosity; Etrata, the Silencer; Evie Frye; Ezio, Blade of Vengeance; Fell the Profane; Fellwar Stone; Gifts Ungiven; Hagra Mauling; Hydroelectric Specimen; Irenicus's Vile Duplication; Jacob Frye; Kindred Dominance; Leyline of Transformation; Lightning Greaves; Loyal Inventor; Mari, the Killing Quill; Maskwood Nexus; Massacre Girl; Massacre Girl, Known Killer; Meathook Massacre II; Mirrorform; Mothdust Changeling; Mystic Reflection; Mystic Remora; Nanogene Conversion; Orochi Soul-Reaver; Patchwork Banner; Quantum Misalignment; Ramses, Assassin Lord; Ravenloft Adventurer; Roaming Throne; Rooftop Bypass; Roshan, Hidden Magister; Sakashima the Impostor; Satoru, the Infiltrator; Snuff Out; Sol Ring; Soul Shatter; Spark Double; Staff of Eden, Vault's Key; Talisman of Dominance; They Came from the Pipes; Toxic Deluge; Training Grounds; Unstoppable Slasher; Vincent Valentine; Waterlogged Teachings; Withering Torment; Yuriko, the Tiger's Shadow

**Lands (32):** Abstergo Entertainment; Bojuka Bog; Cavern of Souls; Clearwater Pathway; Command Tower; Dimir Aqueduct; Drowned Catacomb; Gloomlake Verge; 5 Island; Midgar, City of Mako; Morphic Pool; Mutavault; Otawara, Soaring City; Path of Ancestry; Reliquary Tower; Shipwreck Marsh; Shizo, Death's Storehouse; Sunken Palace; Sunken Ruins; 5 Swamp; Takenuma, Abandoned Mire; Turbulent Wetlands; Underground River; Watery Grave

</details>

<details>
<summary>#30 Etrata, Deadly Fugitive Assassin Theft (Aurelio, Moxfield, bracket user not set, auto 3, updated 2026-08-23, 34 lands, plan: yes)</summary>

URL: https://moxfield.com/decks/wLSJ0QlDF0CLngmNpVwRSw

**Non-land (65):** Adrestia; Aetherize; An Offer You Can't Refuse; Arcane Denial; Arcane Signet; Assassin Initiate; Aven Heartstabber; Bident of Thassa; Bitter Triumph; Brotherhood Regalia; Brotherhood Spy; Cephalid Facetaker; Changeling Outcast; Corrupted Conviction; Counterspell; Cover of Darkness; Eagle Vision; Feed the Swarm; Fierce Guardianship; Ghostly Flicker; Gossip's Talent; Grim Hireling; Guildsworn Prowler; Harmonized Trio; Hired Poisoner; Hookblade Veteran; Infernal Grasp; Irenicus's Vile Duplication; Key to the Side-Door; Kindred Dominance; Lightning Greaves; Mari, the Killing Quill; Massacre Girl; Massacre Girl, Known Killer; My Precious; Negate; Omen Hawker; Patriarch's Bidding; Predators' Hour; Primordial Mist; Ramses, Assassin Lord; Raven Eagle; Reconnaissance Mission; Resculpt; Restart Sequence; Ringsight; Rooftop Bypass; Roshan, Hidden Magister; Ruthless Ripper; Scheming Symmetry; Silumgar Assassin; Silver Shroud Costume; Sol Ring; Talisman of Dominance; They Came from the Pipes; Thought Vessel; Thrill-Kill Assassin; Toxic Deluge; Training Grounds; Vampiric Tutor; Vendetta; Village Rites; Waterbender Ascension; Whip of Erebos; Withering Torment

**Lands (34):** Access Tunnel; Bojuka Bog; Choked Estuary; Clearwater Pathway; Command Beacon; Command Tower; Darkwater Catacombs; 9 Island; Morphic Pool; Path of Ancestry; Reliquary Tower; Rogue's Passage; Shizo, Death's Storehouse; Sunken Hollow; 10 Swamp; The Black Gate; Underground River

</details>
