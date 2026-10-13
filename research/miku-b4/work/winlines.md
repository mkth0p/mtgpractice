# Win lines for the three shortlisted commanders (draft)

Pass 2, step 4. Checked 2026-10-08 on the Commander Spellbook backend API, with card text from Spellbook's card endpoint and dated rulings from the Scryfall API. Machine-readable version: `combos-draft.json` (25 lines). Here a "line" means a Spellbook combo plus a kill outlet where Spellbook's result isn't a win by itself (usually Walking Ballista for infinite mana; flagged per line). "In engine" means an exact match in `engine-cards.txt`.

Choices I made without asking:
- **The outlet for infinite mana is Walking Ballista.** It is colorless (fits all three commanders), it's in the engine, and with infinite mana it gets cast in the main phase with a huge X, so no earlier setup is needed.
- **Ranking criteria, in this order:** survives the field (Talrand's 13 counters; 8 targeted removal spells each in Edgar and Ur-Dragon; artifact and enchantment hate in Ur-Dragon, Azusa, Ghalta and Krenko); fewest pieces; engine coverage; speed.
- **Child gets every line,** but each line appears once, under the commander list where it ranks highest.

## Child of Alara (WUBRG; commander is colors only)

1. **thoracle-consult**: Thassa's Oracle + Demonic Consultation (UB). Two cards, 3 mana, both in the engine, nothing on the board for removal or wipes to hit. It loses only to a counter on Oracle, so the bot casts Oracle first and then Consultation with the Oracle trigger on the stack, behind Silence, Grand Abolisher or a held counter on turns when Talrand or Etrata is in the pod.
2. **thoracle-pact**: Thassa's Oracle + Tainted Pact (UB). Same profile. It needs a library with no duplicate names, so the deck can run at most one of each basic land. Tainted Pact isn't in the engine.
3. **heliod-ballista**: Heliod, Sun-Crowned + Walking Ballista (W). Two cards, in the engine, combo at instant speed. Ballista needs 2 counters. It's the best backup that doesn't depend on Oracle, and it can fire in response to removal.
4. **dualcaster-twinflame**: Dualcaster Mage + Twinflame (R). Both pieces come from hand in one turn for 5 mana, so the field's targeted removal has nothing to hit. It needs combat, and neither card is in the engine.
5. **archangel-spikefeeder** (+ Ballista; GW): free loop at instant speed, all in the engine.
6. **druid-vizier** (+ Ballista; GW): cheap and in the engine, but both creatures have to survive a turn.
7. **kiki-conscripts** (R; Splinter Twin on Zealous Conscripts is the same loop): in the engine. It needs RRR and combat, and Kiki is a removal magnet.
8. **breach-led-brainfreeze** (+ Oracle; UR): the graveyard is safe against this field, but three of its pieces aren't in the engine and it's the longest bot script. Keep it as a backup if the engine adds the pieces.
9. **hermit-thoracle** (GU): forces a mana base with no basics, and Hermit Druid sits exposed for a turn.
10. **kiki-resto-felidar** (RW/UR): redundancy for line 7 only.
11. **sanguine-exquisite** (B): 10 mana of enchantments. It's the line Edgar and Corrupted Etrata already run, and too slow here.
12. **coalition-victory-child** (WUBRG): a late closer. The ruling (2006-09-25) confirms Child alone covers all five colors, but it costs 13 mana with Child, and it's not a Spellbook combo.

The WU, GW and colorless lines below are all open to Child as well.

## Brago, King Eternal (WU)

No black means no Consultation or Pact, so the best Brago lines are the ones that work without Brago.

1. **heliod-ballista** (W): two cards, in the engine, combo at instant speed. It's the best Brago line by a distance.
2. **scepter-reversal** (+ Ballista; U): in the engine, and Talrand plays it too. Its weakness is artifact hate, so it should go off the turn Scepter lands. It needs rocks or dorks that make at least 3 mana.
3. **thoracle-thoughtlash** (U): the only Thassa's Oracle line in WU that's on Spellbook with exactly two cards. Cast Oracle, then exile the library with Thought Lash in response to its trigger. Thought Lash has to survive one turn as an enchantment, and it isn't in the engine.
4. **kitten-teferi-solring** (+ Thassa's Oracle; WU): Teferi stops opponents casting spells at instant speed, so Talrand and Etrata can't counter during the loop. Displacer Kitten is a fragile 2/2, and neither Kitten nor Teferi is in the engine.
5. **monolith-powerartifact** (+ Ballista; U), **basalt-forsaken** (C, fully in the engine) and **basalt-rings** (C): two-artifact infinite mana. They're fine as redundancy next to Scepter, but every one of them is exposed to artifact hate.
6. **drake-flicker-archaeomancer** (+ Ballista; U): three pieces, two of them fragile creatures.
7. **brago-resonator** (+ Sol Ring, another rock, and Ballista; WU): the only infinite Brago enables. It needs Brago to connect against flying boards (Ur-Dragon, Talrand drakes), and Brago isn't in the engine.
8. **brago-archaeomancer-timewarp** (WU): infinite turns, but Brago has to connect every turn. It's a grind plan.

## Shalai, Voice of Plenty (GW; Trostani A/B on the same 99)

Shalai gives your other creatures and you hexproof, which blanks Edgar's and Ur-Dragon's targeted removal against the creature combos.

1. **heliod-ballista** (W): two cards, in the engine, combo at instant speed. Ballista is hexproof under Shalai, and Heliod is indestructible, which beats destroy effects but not exile or bounce.
2. **archangel-spikefeeder** (+ Ballista or an attack; GW): all in the engine. The loop is free and at instant speed, so it can win in response to a wipe once Ballista is out.
3. **druid-vizier** (+ Ballista; GW): all in the engine, 4 mana for the pair. Shalai protects both creatures, so only wipes and counters on Ballista stop it.
4. **rosie-broodscale** (+ Ballista; GW): two cheap creatures that make infinite colorless mana. Neither is in the engine.
5. **druid-swiftreconfig** (+ Ballista; GW): Swift Reconfiguration has flash. It isn't in the engine. My reading that the Druid needs no time on the battlefield once it's a Vehicle is not verified.
6. **basalt-forsaken** (C, in the engine) and **basalt-rings** (C): colorless backup. Shalai doesn't protect artifacts.
7. **trostani-scurryoak-archangel** (+ Ballista; GW): for the Trostani A/B only. It takes three pieces, and Scurry Oak isn't in the engine.
8. **earthcraft-squirrelnest** (+ Ashnod's Altar + Ballista; G): four pieces, three of them non-creature permanents that Shalai can't protect. Weak.

Craterhoof (via Natural Order, Green Sun's Zenith or Finale of Devastation) is a finisher, not a combo. Spellbook has no GW entry for it.

## Queue items that are not real combos, not on Spellbook, or wrong as written

- **Coalition Victory with Child of Alara:** not on Spellbook. The only Coalition Victory variant is Leyline of the Guildpact + Coalition Victory (1024-5364). The rules claim holds: Scryfall ruling 2006-09-25 says a single creature of several colors counts for all of them. Still, it's a 13-mana sorcery line, not a combo.
- **"Ad Nauseam into a two-card win":** not a combo. On Spellbook, Ad Nauseam only reaches infinite draw with life-loss protection (for example 335-5141 with Teferi's Protection), not a win. Treat it as a draw spell. It isn't in the engine.
- **Displacer Kitten + Dramatic Reversal:** no Spellbook entry. Displacer Kitten + Isochron Scepter appears only in five-card Kiora, Behemoth Beckoner variants (popularity 0-2). The real Kitten lines are Teferi, Time Raveler + Kitten + a rock (Sol Ring 1170-4761-5034, Mana Vault, Grim Monolith, Basalt Monolith).
- **Infinite mana into "a draw-everything outlet plus Thassa's Oracle or Laboratory Maniac":** not one combo. In WU it needs a separate draw outlet (Kitten + Teferi draws), and Laboratory Maniac isn't in the engine. Using Walking Ballista as the outlet is simpler.
- **Peregrine Drake or Cloud of Faeries + Ghostly Flicker + Archaeomancer or Mnemonic Wall:** the Drake versions are real (1987-2493-3821; Mnemonic Wall 1987-2556-3821). Cloud of Faeries needs a fourth card (Panharmonicon or Elesh Norn, Mother of Machines) on Spellbook, so it's not a three-card line.
- **Brago-enabled infinite:** two real ones exist. Brago + Strionic Resonator (2751-3557) gives infinite blinks and infinite artifact mana once rocks make at least {2}. Brago + Lithoform Engine + Sol Ring (3094-3557-5034) does the same. The pass-1 note "no Brago-enabled infinite verified" was wrong. Neither one wins without an outlet, and both need Brago to connect. Brago + Archaeomancer + Time Warp gives infinite turns.
- **Earthcraft + Squirrel Nest "with an outlet":** Spellbook only lists infinite tapped Squirrels. A kill needs Ashnod's Altar + Ballista or similar, which makes it four cards.
- **Vizier of Remedies + Spike Feeder:** confirmed not a combo; there's no Spellbook result. Spike Feeder removes +1/+1 counters, and Vizier only modifies -1/-1 counters.
- **Restoration Angel + Felidar Guardian** (1090-2781): infinite ETB only, with no win unless Kiki or a payoff is added. It's not a standalone line.
- **Staff of Domination + Priest of Titania** (1376-2645): needs at least five Elves on the battlefield (Spellbook prereq). Rejected for Shalai.

## Rules claims checked (flags)

- **Thassa's Oracle + Demonic Consultation:** Spellbook's sequence casts Consultation first, naming Thassa's Oracle while Oracle is in hand. That depends on the named card not being in the library. Ruling 2008-10-01: if the named card isn't revealed, the whole library is exiled. The bot should cast Oracle first and respond with Consultation, naming a card that isn't in the library ("Demonic Consultation" itself is on the stack). Oracle ruling 2020-01-24: with no cards in library you win, even at devotion 0.
- **Tainted Pact:** Spellbook prereq "No two cards in library share a name." Duplicate basics break it.
- **Heliod + Walking Ballista:** confirmed that Ballista needs at least 2 counters (Spellbook prereq; Heliod ruling 2020-01-24 says a creature dealt lethal damage at the same moment can't be saved by the counter, and the same timing applies to a 0/0).
- **Archangel of Thune + Walking Ballista** (2919-3693): needs a separate lifelink source and at least 2 counters, so it's not a two-card line by itself.
- **Devoted Druid + Vizier of Remedies:** Devoted Druid ruling 2018-12-07 confirms the untap can be activated when Vizier reduces the counters to zero.
- **Spike Feeder:** the Oracle text gains **2** life per counter; Spellbook's description says 1. That doesn't affect the loop.
- **Isochron Scepter + Dramatic Reversal:** Spellbook prereq is nonland permanents that make at least {3}, so each loop nets +1 or more after Scepter's {2}. Lands don't count. Scepter ruling 2020-08-07: the copy must be cast as the ability resolves.
- **Basalt Monolith + Forsaken Monument:** Monument ruling 2020-09-25 says tapping for more than one {C} adds only one extra. So Basalt makes 4 and untapping costs 3: net +1.
- **Basalt Monolith + Rings of Brighthearth:** Rings ruling 2020-11-10 says the copy resolves before the original, which matches the Spellbook sequence. Net +1 per cycle with {2} to start.
- **Power Artifact:** "can't reduce the mana in that cost to less than one mana." Basalt's untap costs {1} (net +2) and Grim's costs {2} (net +1), as on Spellbook.
- **Kiki-Jiki + Zealous Conscripts / Felidar Guardian / Restoration Angel:** all on Spellbook (618-1537, 618-2781, 618-1090). Felidar and Resto blink Kiki, which comes back untapped with haste. Conscripts untaps it. Resto's target must be non-Angel; Kiki is a Goblin. All three need combat to win.
- **Brago + Strionic Resonator:** my steps rely on the rule that a copied ability keeps the same number of targets. Spellbook doesn't state this, so it's not verified there. The original Brago trigger should target Resonator plus every rock.
- **Devoted Druid + Swift Reconfiguration:** Spellbook doesn't mention summoning sickness. The claim that a Vehicle Druid can tap the turn it arrives is my inference and not verified.
- **Hermit Druid:** ruling 2025-01-24 confirms the whole library goes to the graveyard if there's no basic.
- **Thought Lash:** ruling 2008-10-01 says the ability can't be activated with an empty library.

## Sources (all accessed 2026-10-08)

Public combo pages are `https://commanderspellbook.com/combo/<id>/` for each id below.
- Commander Spellbook variant pages (backend JSON `https://backend.commanderspellbook.com/variants/<id>/?format=json`; public page `https://commanderspellbook.com/combo/<id>/`), accessed 2026-10-08: 1024-5364, 1170-4761-5034, 1274-3693, 1295-2853, 1295-3093, 1295-4400, 1368-3518-4856, 1376-2645, 1409-3821, 147-1235, 1537-4702, 1545-2919-4186, 1938-3557-4200, 1987-2493-3821, 2290-2919, 2433-5641, 2493-3115-3557, 2493-3557-4872, 2585-5149, 2751-3557, 2919-3693, 3094-3557-5034, 3807-4762, 4131-4235, 4131-4547, 4131-5149, 4821-5261, 515-2757, 618-1090, 618-1537, 618-2781, 690-3966, 742-1295, 978-4762.
- Commander Spellbook variant searches (`https://backend.commanderspellbook.com/variants/?q=<query>&format=json&limit=..&ordering=-popularity`), accessed 2026-10-08, queries: `card:"Ad Nauseam"`; `card:"Archangel of Thune" card:"Spike Feeder"`; `card:"Basalt Monolith" card:"Power Artifact"`; `card:"Basalt Monolith" card:"Rings of Brighthearth"`; `card:"Brago, King Eternal"`; `card:"Brago, King Eternal" card:"Strionic Resonator"`; `card:"Child of Alara"`; `card:"Cloud of Faeries" card:"Ghostly Flicker"`; `card:"Coalition Victory"`; `card:"Craterhoof Behemoth" ci:gw`; `card:"Demonic Consultation" card:"Thassa's Oracle" cards=2`; `card:"Devoted Druid" card:"Vizier of Remedies"`; `card:"Devoted Druid" ci<=gw cards<=3`; `card:"Displacer Kitten" card:"Dramatic Reversal"`; `card:"Displacer Kitten" card:"Isochron Scepter"`; `card:"Displacer Kitten" ci:wu`; `card:"Earthcraft" card:"Squirrel Nest"`; `card:"Grim Monolith" card:"Power Artifact"`; `card:"Heliod, Sun-Crowned" card:"Walking Ballista"`; `card:"Hermit Druid" card:"Thassa's Oracle"`; `card:"Isochron Scepter" card:"Dramatic Reversal"`; `card:"Kiki-Jiki, Mirror Breaker" card:"Deceiver Exarch"`; `card:"Kiki-Jiki, Mirror Breaker" card:"Felidar Guardian"`; `card:"Kiki-Jiki, Mirror Breaker" card:"Pestermite"`; `card:"Kiki-Jiki, Mirror Breaker" card:"Restoration Angel"`; `card:"Kiki-Jiki, Mirror Breaker" card:"Zealous Conscripts"`; `card:"Laboratory Maniac" ci:wu`; `card:"Peregrine Drake" card:"Ghostly Flicker"`; `card:"Shalai, Voice of Plenty"`; `card:"Spike Feeder" card:"Vizier of Remedies"`; `card:"Splinter Twin" card:"Pestermite"`; `card:"Splinter Twin" cards=2`; `card:"Staff of Domination" ci<=gw cards<=2`; `card:"Thassa's Oracle" card:"Tainted Pact"`; `card:"Thassa's Oracle" ci<=wu cards<=2`; `card:"Trostani, Selesnya's Voice"`; `card:"Underworld Breach" card:"Lion's Eye Diamond" card:"Brain Freeze"`; `card:"Walking Ballista" card:"Strionic Resonator" ci<=wu`; `cards<=2 legal:commander -ci<=wu -ci<=gw`; `cards<=3 legal:commander result:"Infinite damage" -ci<=wu -ci<=gw`; `cards<=3 legal:commander result:"Win the game" -ci<=wu -ci<=gw`; `ci<=gw cards<=2 legal:commander`; `ci<=gw cards<=3 legal:commander result:"Infinite damage"`; `ci<=gw cards<=3 legal:commander result:"Win the game"`; `ci<=wu cards<=3 legal:commander`; `ci<=wu cards<=3 legal:commander result:"Infinite damage"`; `ci<=wu cards<=3 legal:commander result:"Win the game"`.
- Commander Spellbook card text (`https://backend.commanderspellbook.com/cards/?q=<name>&format=json`), accessed 2026-10-08, for: Archaeomancer; Archangel of Thune; Ashnod's Altar; Basalt Monolith; Basking Broodscale; Brago, King Eternal; Brain Freeze; Child of Alara; Coalition Victory; Craterhoof Behemoth; Deadeye Navigator; Demonic Consultation; Devoted Druid; Displacer Kitten; Dramatic Reversal; Dualcaster Mage; Earthcraft; Exquisite Blood; Felidar Guardian; Forsaken Monument; Ghostly Flicker; Grim Monolith; Heliod, Sun-Crowned; Hermit Druid; Isochron Scepter; Kiki-Jiki, Mirror Breaker; Leyline of the Guildpact; Lion's Eye Diamond; Mirror of Fate; Mnemonic Wall; Peregrine Drake; Pestermite; Power Artifact; Priest of Titania; Restoration Angel; Rings of Brighthearth; Rosie Cotton of South Lane; Sanguine Bond; Scurry Oak; Sol Ring; Spike Feeder; Splinter Twin; Squirrel Nest; Staff of Domination; Strionic Resonator; Swift Reconfiguration; Tainted Pact; Teferi, Time Raveler; Thassa's Oracle; Thought Lash; Time Warp; Twinflame; Underworld Breach; Vizier of Remedies; Walking Ballista; Zealous Conscripts.
- Scryfall API (`https://api.scryfall.com/cards/named?exact=<name>` and each card's `rulings_uri`), accessed 2026-10-08, for Oracle legality, Game Changer flag and rulings:
  - https://scryfall.com/card/thb/73/thassas-oracle
  - https://scryfall.com/card/me2/85/demonic-consultation
  - https://scryfall.com/card/ody/164/tainted-pact
  - https://scryfall.com/card/2xm/306/walking-ballista
  - https://scryfall.com/card/cmm/29/heliod-sun-crowned
  - https://scryfall.com/card/akh/38/vizier-of-remedies
  - https://scryfall.com/card/ecc/104/devoted-druid
  - https://scryfall.com/card/ima/136/kiki-jiki-mirror-breaker
  - https://scryfall.com/card/2xm/264/isochron-scepter
  - https://scryfall.com/card/tle/158/dramatic-reversal
  - https://scryfall.com/card/cmr/335/rings-of-brighthearth
  - https://scryfall.com/card/me4/57/power-artifact
  - https://scryfall.com/card/thb/161/underworld-breach
  - https://scryfall.com/card/khc/82/brago-king-eternal
  - https://scryfall.com/card/moc/384/strionic-resonator
  - https://scryfall.com/card/inr/202/hermit-druid
  - https://scryfall.com/card/2xm/5/archangel-of-thune
  - https://scryfall.com/card/tmp/222/earthcraft
  - https://scryfall.com/card/nec/10/swift-reconfiguration
  - https://scryfall.com/card/me2/70/thought-lash
  - https://scryfall.com/card/clb/63/displacer-kitten
  - https://scryfall.com/card/tpr/196/spike-feeder
  - https://scryfall.com/card/rvr/232/teferi-time-raveler
  - https://scryfall.com/card/aer/19/felidar-guardian
  - https://scryfall.com/card/2xm/232/basalt-monolith
  - https://scryfall.com/card/vma/271/lions-eye-diamond
  - https://scryfall.com/card/vma/57/brain-freeze
  - https://scryfall.com/card/inr/183/zealous-conscripts
  - https://scryfall.com/card/inr/38/restoration-angel
  - https://scryfall.com/card/dmr/65/peregrine-drake
  - https://scryfall.com/card/dmr/177/squirrel-nest
  - https://scryfall.com/card/cmm/950/forsaken-monument
  - https://scryfall.com/card/tsb/91/coalition-victory
  - https://scryfall.com/card/tdc/130/shalai-voice-of-plenty
- Local inputs: `research/miku-b4/pass1/commanders.md` (section 6), `research/miku-b4/opposition.md`, `research/miku-b4/engine-cards.txt`.
