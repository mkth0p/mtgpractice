# Opposition: what the new Miku deck faces in simulations

Pass 1, step 3 (STATUS.md). Counted on 2026-10-07 from the bot decks in `miku/game/decks-*.js` and `precon-*.js` (`MK.BOT_DECKS`, repo `main` at 0b885c2). This replaces section 7 of `pass1/commanders.md`. The counts come from a card-name dictionary (in this file's appendix), so a card the dictionary misses isn't counted. It covers the cards that matter.

Simulations pit the hero against three of these decks: `random4` draws from the 8 Bracket 4 decks, and `random2` from the 5 Bracket 2 precons.

## Interaction per deck (unique cards in the 99)

| Deck | Bracket | Targeted creature removal | Bounce | Artifact/enchantment removal | Mass removal / wipes | Counterspells | Rule-setters / stax | Land destruction / land hate | Graveyard hate | Protection for own combo |
|---|---|---|---|---|---|---|---|---|---|---|
| Etrata, Deadly Fugitive (etrata) | 3 | 3 | 1 | 0 | 1 | 4 | 0 | 0 | 1 | 0 |
| Azusa, Lost but Seeking (azusa) | 4 | 3 | 0 | 4 | 1 | 0 | 0 | 4 | 0 | 3 |
| Etrata, Deadly Fugitive (corrupted-etrata) | 4 | 1 | 2 | 0 | 3 | 4 | 5 | 0 | 1 | 0 |
| Edgar Markov (edgar) | 4 | 8 | 0 | 3 | 0 | 0 | 1 | 0 | 0 | 2 |
| Etrata, Deadly Fugitive (etrata-b4) | 4 | 5 | 1 | 0 | 1 | 5 | 2 | 0 | 0 | 2 |
| Ghalta, Primal Hunger (ghalta) | 4 | 2 | 0 | 4 | 0 | 0 | 0 | 0 | 0 | 3 |
| Krenko, Mob Boss (krenko) | 4 | 4 | 0 | 4 | 2 | 0 | 0 | 0 | 0 | 2 |
| Talrand, Sky Summoner (talrand) | 4 | 0 | 7 | 0 | 4 | 13 | 2 | 0 | 0 | 0 |
| The Ur-Dragon (urdragon) | 4 | 8 | 0 | 6 | 2 | 2 | 0 | 0 | 0 | 2 |
| Ghired, Conclave Exile (ghired) | 2 | 3 | 0 | 2 | 1 | 0 | 0 | 0 | 0 | 1 |
| Isperia, Supreme Judge (isperia) | 2 | 5 | 0 | 5 | 3 | 3 | 0 | 0 | 0 | 0 |
| Kaalia of the Vast (kaalia) | 2 | 7 | 0 | 1 | 3 | 0 | 0 | 0 | 0 | 1 |
| Lathril, Blade of the Elves (lathril) | 2 | 5 | 0 | 3 | 1 | 0 | 0 | 0 | 0 | 0 |
| Wilhelt, the Rotcleaver (wilhelt) | 2 | 2 | 0 | 0 | 1 | 0 | 0 | 0 | 1 | 0 |

Some cards count in two columns (Cyclonic Rift is bounce and a wipe; Beast Within hits creatures and artifacts).

## How each Bracket 4 deck wins

| Deck | Main win lines | What it means for us |
|---|---|---|
| Talrand | Isochron Scepter + Dramatic Reversal, Aetherflux Reservoir, Thassa's Oracle; 13 counters, Cyclonic Rift, Aetherspouts, Evacuation | The one real control deck. Our combo turn must carry protection or bait its counters first. Shalai's hexproof does nothing here. |
| Krenko | Kiki-Jiki + Zealous Conscripts, Splinter Twin, Purphoros or Impact Tremors with token bursts, Blasphemous Act | Fast and wide. We need a blocker or a wipe answer by turns 4-6. |
| Edgar | Exquisite Blood + Sanguine Bond, aristocrats drain; 8 targeted removal spells | The heaviest targeted removal. Shalai blanks most of it (Swords, Path, Infernal Grasp, Terminate, Vindicate); Deadly Rollick also targets, so Shalai stops it too; Shalai itself stays exposed. |
| Corrupted Etrata | Exquisite Blood + Sanguine Bond drain, Opposition Agent, Notion Thief, Toxic Deluge, Cyclonic Rift, 4 counters | The only bot with a scripted brain. Opposition Agent punishes tutor-heavy lists: it controls our searches and exiles what we find. |
| Etrata B4 | Assassin aggro with Force of Will, Fierce Guardianship, 5 counters, 5 removal | Counters plus removal: a two-card instant-speed win needs a backup. |
| Ur-Dragon | Dragons in combat; 8 targeted removal, 6 artifact or enchantment answers, Toxic Deluge, Crux of Fate | Kills Scepter, Breach and other permanents. Prefer combos that are mostly creatures or spells. |
| Ghalta | Big green creatures, Craterhoof, Natural Order; Force of Vigor, Beast Within, Kogla, Terastodon | No counters and no wipes. A race: we must win or block before its turn 6-7 Hoof. |
| Azusa | Dark Depths + Thespian's Stage (one 20/20), Field of the Dead; Strip Mine, Ghost Quarter, Tectonic Edge, Blast Zone | Land hate hits our utility lands. Marit Lage kills one player per swing. |

## What follows for the shortlist

- **Graveyard hate is almost absent.** Only Shred Memory (two Etrata lists, one in Bracket 3) touches graveyards; no Rest in Peace, Bojuka Bog or Relic. Underworld Breach lines are safe against this field, though not against a real Bracket 4 table.
- **Counterspells are concentrated.** Talrand (13), the two Etrata B4 lists (4-5 each), Ur-Dragon (Fierce Guardianship, Counterspell). A deck facing three random Bracket 4 bots will usually face at least one counter-heavy opponent. Win lines need Silence, Grand Abolisher, Deflecting Swat, Pact of Negation or our own counters, or a second line after a counter.
- **Targeted removal is the common answer** (Edgar and Ur-Dragon 8 each, Etrata B4 5). This is where Shalai's hexproof pays; Child and Brago get nothing from the command zone here.
- **Wipes:** Talrand (Cyclonic Rift, Aetherspouts, Evacuation, Aetherize), Corrupted Etrata (Toxic Deluge, Rift, Aetherize), Ur-Dragon (Toxic Deluge, Crux of Fate), Krenko (Blasphemous Act). Creature combos that assemble over two turns are exposed; instant-speed wins aren't.
- **Stax is rare:** Opposition Agent and Notion Thief (Corrupted Etrata), Rhystic Study and Mystic Remora (taxes, not locks). No Drannith Magistrate, Rule of Law or Collector Ouphe.
- **Artifact and enchantment hate** is in Ur-Dragon, Azusa, Ghalta and Krenko: Isochron Scepter, Underworld Breach and Aetherflux Reservoir can die before they go off.
- **Speed:** the bot decks that win fastest are combo or token decks (Krenko, Talrand, Edgar, Corrupted Etrata). "Much stronger" means winning by turns 5-6 through one round of interaction.

## Engine coverage of the likely combo pieces

`engine-cards.txt` lists the 1,082 card names the engine already defines. Checked against the likely win-line and staple pieces for the three shortlisted commanders:

- **Already in the engine:** Shalai, Trostani, Thassa's Oracle, Demonic Consultation, Isochron Scepter, Dramatic Reversal, Kiki-Jiki, Zealous Conscripts, Splinter Twin, Heliod, Walking Ballista, Devoted Druid, Vizier of Remedies, Archangel of Thune, Spike Feeder, Craterhoof, Natural Order, Green Sun's Zenith, Finale of Devastation, Chord of Calling, Ghostly Flicker, Archaeomancer, Basalt Monolith, Grim Monolith, Aetherflux Reservoir, every major tutor (Demonic, Vampiric, Imperial Seal, Mystical, Enlightened, Worldly, Gamble, Diabolic), Force of Will, Fierce Guardianship, Pact of Negation, Mana Drain, Swan Song, Counterspell, Silence, Grand Abolisher, Teferi's Protection, Rhystic Study, Mystic Remora, Necropotence, Sol Ring, Mana Vault, Chrome Mox, Mox Diamond, Lotus Petal, Ancient Tomb, Gaea's Cradle, Strionic Resonator, Tribute Mage, Urza's Saga, Drannith Magistrate, Opposition Agent, Notion Thief, Veil of Summer, Survival of the Fittest.
- **Missing:** Child of Alara, Brago, Tainted Pact, Underworld Breach, Lion's Eye Diamond, Brain Freeze, Ad Nauseam, Laboratory Maniac, Jace, Wielder of Mysteries, Hermit Druid, Displacer Kitten, Felidar Guardian, Restoration Angel, Peregrine Drake, Mnemonic Wall, Rings of Brighthearth, Power Artifact, Coalition Victory, Earthcraft, Squirrel Nest, Flusterstorm, Aether Channeler, Song of Creation, Snapcaster Mage, Deflecting Swat.

So the green-white combo lines are nearly all simulable today. Brago and Child each need their commander plus a handful of pieces (Breach, LED, Brain Freeze and Ad Nauseam for Child; Kitten, Restoration Angel, Felidar, Drake and the Monolith enablers for Brago).

## Appendix: the dictionary

Targeted creature removal: Swords to Plowshares, Path to Exile, Infernal Grasp, Go for the Throat, Terminate, Deadly Rollick, Chain Assassination, Shoot the Sheriff, Reality Shift, Feed the Swarm, Lightning Bolt, Abrade, Ram Through, Tail Swipe, Anguished Unmaking, Vindicate, Assassin's Trophy, Utter End, Beast Within, Chaos Warp, Generous Gift, Mortify, Putrefy, Condemn, Wrecking Ball, Orim's Thunder, Comet Storm, Banishing Light, Oblivion Ring, Trostani's Judgment, Casualties of War, Poison the Cup, Tergrid's Shadow, Goblin Cratermaker, Angel of Sanctions.
Bounce: Snap, Into the Roil, Repulse, Chain of Vapor, Otawara, Wash Away, Cyclonic Rift, Mystic Confluence, Cryptic Command.
Wipes: Toxic Deluge, Cyclonic Rift, Blasphemous Act, Crux of Fate, Evacuation, Bane of Progress, Vandalblast, Aetherspouts, Aetherize, Wrath of God, Austere Command, Earthquake, Cleansing Nova, Time Wipe, Hour of Reckoning, Eyeblight Massacre.
Counters: Counterspell, Force of Will, Force of Negation, Fierce Guardianship, Pact of Negation, Mana Leak, Essence Scatter, Exclude, Negate, Swan Song, Arcane Denial, Cryptic Command, An Offer You Can't Refuse, Dispel, Mystic Confluence, Absorb.
Rule-setters and taxes: Opposition Agent, Notion Thief, Thief of Sanity, Drannith Magistrate, Grand Abolisher, Rhystic Study, Mystic Remora, Smothering Tithe.
Land hate: Strip Mine, Ghost Quarter, Tectonic Edge, Blast Zone. Graveyard hate: Shred Memory, Bojuka Bog, Rest in Peace, Relic of Progenitus, Soul-Guide Lantern.
