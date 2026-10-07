# Sources (pass 2)
Every page or file used in pass 2, all accessed 2026-10-08 unless a line says otherwise. Pass 1's sources are listed in `pass1/commanders.md` and `pass1/rulings.md`.

## Scryfall
- Bulk data index: https://api.scryfall.com/bulk-data. Files used, all recorded in `scryfall/index-meta.json`:
  - https://data.scryfall.io/oracle-cards/oracle-cards-20261007210155.jsonl.gz
  - https://data.scryfall.io/default-cards/default-cards-20261007210542.jsonl.gz
  - https://data.scryfall.io/rulings/rulings-20261007210031.jsonl.gz
  
  They give the Oracle text, legality, Game Changer flags, rulings, and EUR (Cardmarket trend) and USD (TCGplayer market) prices with purchase URLs.
- Miku printings, from the art tag `hatsune-miku`: https://api.scryfall.com/cards/search?q=set%3Asld+art%3Ahatsune-miku&unique=prints (46 printings, saved in `scryfall/miku-printings.json`). Also queried, with the same result: `set:sld art:miku`, and `set:sld flavor:miku` (24 printings).
- Game Changers: Scryfall `is:gamechanger` returns 53 cards (the subagent's API search), and so does the bulk data's `game_changer` flag. Both match `pass1/legality.md`.

## Cardmarket (step 7)
- Tried for near-mint confirmation: https://www.cardmarket.com/en/Magic/Products/Singles/Kaldheim-Commander/Brago-King-Eternal?language=1&minCondition=2 and https://www.cardmarket.com/en/Magic/Products?idProduct=535408.
  - With curl: HTTP 403.
  - In the browser pane: a Cloudflare challenge.
  
  No listing was read (DECISIONS D20).

## Commander Spellbook (step 4)
Backend: https://backend.commanderspellbook.com/variants/ (search) and `/variants/<id>/`. Combo pages:
- Thassa's Oracle + Demonic Consultation: https://commanderspellbook.com/combo/742-1295/
- Thassa's Oracle + Tainted Pact: https://commanderspellbook.com/combo/1295-3093/
- Thassa's Oracle + Thought Lash: https://commanderspellbook.com/combo/1295-2853/
- Underworld Breach + Lion's Eye Diamond + Brain Freeze (+ Thassa's Oracle finish): https://commanderspellbook.com/combo/1368-3518-4856/
- Hermit Druid + Thassa's Oracle: https://commanderspellbook.com/combo/1295-4400/
- Isochron Scepter + Dramatic Reversal: https://commanderspellbook.com/combo/4821-5261/
- Heliod, Sun-Crowned + Walking Ballista: https://commanderspellbook.com/combo/1274-3693/
- Archangel of Thune + Spike Feeder (+ Walking Ballista or combat): https://commanderspellbook.com/combo/2290-2919/
- Devoted Druid + Vizier of Remedies (+ Walking Ballista): https://commanderspellbook.com/combo/978-4762/
- Devoted Druid + Swift Reconfiguration (+ Walking Ballista): https://commanderspellbook.com/combo/3807-4762/
- Trostani, Selesnya's Voice + Scurry Oak + Archangel of Thune: https://commanderspellbook.com/combo/1545-2919-4186/
- Rosie Cotton of South Lane + Basking Broodscale (+ Walking Ballista): https://commanderspellbook.com/combo/2433-5641/
- Earthcraft + Squirrel Nest (+ Ashnod's Altar + Walking Ballista): https://commanderspellbook.com/combo/515-2757/
- Basalt Monolith + Forsaken Monument (+ Walking Ballista): https://commanderspellbook.com/combo/4131-4547/
- Basalt Monolith + Rings of Brighthearth (+ Walking Ballista): https://commanderspellbook.com/combo/4131-4235/
- Basalt Monolith or Grim Monolith + Power Artifact (+ Walking Ballista): https://commanderspellbook.com/combo/4131-5149/
- Displacer Kitten + Teferi, Time Raveler + Sol Ring (+ Thassa's Oracle): https://commanderspellbook.com/combo/1170-4761-5034/
- Peregrine Drake + Ghostly Flicker + Archaeomancer (or Mnemonic Wall): https://commanderspellbook.com/combo/1987-2493-3821/
- Brago, King Eternal + Strionic Resonator (+ mana rocks + Walking Ballista): https://commanderspellbook.com/combo/2751-3557/
- Brago + Archaeomancer + Time Warp (extra-turn loop): https://commanderspellbook.com/combo/2493-3557-4872/
- Kiki-Jiki, Mirror Breaker + Zealous Conscripts (or Splinter Twin + Conscripts): https://commanderspellbook.com/combo/618-1537/
- Kiki-Jiki + Restoration Angel / Felidar Guardian / Pestermite / Deceiver Exarch: https://commanderspellbook.com/combo/618-1090/
- Dualcaster Mage + Twinflame: https://commanderspellbook.com/combo/147-1235/
- Sanguine Bond + Exquisite Blood: https://commanderspellbook.com/combo/690-3966/
- Coalition Victory with Child of Alara on the battlefield: not on Spellbook (closest: https://commanderspellbook.com/combo/1024-5364/)

Further Spellbook searches and pages the win-line research used are listed in `work/winlines.md` (section "Sources").

## Public decklists (step 5)
Each list's file, URL, date, author, bracket and lesson are in `work/publiclists.md`; the lists themselves in `work/lists/`. URLs:

- https://api.scryfall.com/cards/search?q=is:gamechanger
- https://api2.moxfield.com/v2/cards/search?q=!"<name
- https://api2.moxfield.com/v2/decks/search?pageNumber=1&pageSize=50&sortType=views&sortDirection=Descending&fmt=commander&commanderCardId=<id
- https://api2.moxfield.com/v3/decks/all/<publicId
- https://archidekt.com/api/decks/<id
- https://archidekt.com/api/decks/v3/?commanderName=<name
- https://archidekt.com/decks/13491907
- https://archidekt.com/decks/13837312
- https://archidekt.com/decks/15997080
- https://archidekt.com/decks/21015429
- https://archidekt.com/decks/26039177
- https://archidekt.com/decks/26388397
- https://archidekt.com/decks/8427551
- https://backend.commanderspellbook.com/variants/?q=..
- https://edhrec.com/average-decks/brago-king-eternal/cedh
- https://edhrec.com/average-decks/brago-king-eternal/optimized
- https://edhrec.com/average-decks/child-of-alara/cedh
- https://edhrec.com/average-decks/child-of-alara/optimized
- https://edhrec.com/average-decks/shalai-voice-of-plenty/cedh
- https://edhrec.com/average-decks/shalai-voice-of-plenty/optimized
- https://edhrec.com/average-decks/trostani-selesnyas-voice/cedh
- https://edhrec.com/average-decks/trostani-selesnyas-voice/optimized
- https://json.edhrec.com/pages/average-decks/<slug
- https://moxfield.com/decks/11Y4nDA6zku7QAhn5LLLPQ
- https://moxfield.com/decks/3rvLmvsbfES7I6n6Fj3FIQ
- https://moxfield.com/decks/Ba1nFYEBY0mggeRj6mJjbA
- https://moxfield.com/decks/IYUM_cHxV0W3S6bUu5QTmA
- https://moxfield.com/decks/JpT6ND95jkyjIe4a7jzSCw
- https://moxfield.com/decks/M--H_Et5-Eu6faglZHBK8A
- https://moxfield.com/decks/ME-zgoCa5kq9c8jCsd4UMg
- https://moxfield.com/decks/OMSnnZoC-U-UFwBSyNDv5Q
- https://moxfield.com/decks/Ssl9sgdAHESBxWLiktKZWg
- https://moxfield.com/decks/UodV4YLerEmS7-42rIgA5Q
- https://moxfield.com/decks/ZQlyVIx0r0Od4CvcnoOmKw
- https://moxfield.com/decks/ZbcmXJAAJEOGa74HK_52FQ
- https://moxfield.com/decks/_P7TxbJsNUqwQbbL57BEJg
- https://moxfield.com/decks/cTn_eqq220ukrVWmGkzyFQ
- https://moxfield.com/decks/clz23nIbj0WT5AOWMmXCkw
- https://moxfield.com/decks/d7FdCq_8gkKlAvKsM1PWrg
- https://moxfield.com/decks/dQ1i-GmPb0y_dW6wNQOQ8g
- https://moxfield.com/decks/hP0z_zZvxUO0IM02rQYptw
- https://moxfield.com/decks/lGdVhDcJzkCddkma6tToag
- https://moxfield.com/decks/n2D5k8ZMCESnAZv8AnzblQ
- https://moxfield.com/decks/of28bO9hPE2lN4UDi1PCtg
- https://moxfield.com/decks/wRT3f_0R0UKTR3xfAtgWFQ
- https://moxfield.com/decks/ywjZih5sFEiLnZA_uEDiaQ
- https://playgroup.gg/profiles/32485-milkmanproxies/decks/149392-suck-my-stax-10-pl/cards
- https://raw.githubusercontent.com/AverageDragon/cEDH-Decklist-Database/master/_data/database.json

## Win-line research pages

- https://api.scryfall.com/cards/named?exact=<name
- https://backend.commanderspellbook.com/cards/?q=<name
- https://backend.commanderspellbook.com/variants/<id
- https://backend.commanderspellbook.com/variants/?q=<query
- https://commanderspellbook.com/combo/<id
- https://scryfall.com/card/2xm/232/basalt-monolith
- https://scryfall.com/card/2xm/264/isochron-scepter
- https://scryfall.com/card/2xm/306/walking-ballista
- https://scryfall.com/card/2xm/5/archangel-of-thune
- https://scryfall.com/card/aer/19/felidar-guardian
- https://scryfall.com/card/akh/38/vizier-of-remedies
- https://scryfall.com/card/clb/63/displacer-kitten
- https://scryfall.com/card/cmm/29/heliod-sun-crowned
- https://scryfall.com/card/cmm/950/forsaken-monument
- https://scryfall.com/card/cmr/335/rings-of-brighthearth
- https://scryfall.com/card/dmr/177/squirrel-nest
- https://scryfall.com/card/dmr/65/peregrine-drake
- https://scryfall.com/card/ecc/104/devoted-druid
- https://scryfall.com/card/ima/136/kiki-jiki-mirror-breaker
- https://scryfall.com/card/inr/183/zealous-conscripts
- https://scryfall.com/card/inr/202/hermit-druid
- https://scryfall.com/card/inr/38/restoration-angel
- https://scryfall.com/card/khc/82/brago-king-eternal
- https://scryfall.com/card/me2/70/thought-lash
- https://scryfall.com/card/me2/85/demonic-consultation
- https://scryfall.com/card/me4/57/power-artifact
- https://scryfall.com/card/moc/384/strionic-resonator
- https://scryfall.com/card/nec/10/swift-reconfiguration
- https://scryfall.com/card/ody/164/tainted-pact
- https://scryfall.com/card/rvr/232/teferi-time-raveler
- https://scryfall.com/card/tdc/130/shalai-voice-of-plenty
- https://scryfall.com/card/thb/161/underworld-breach
- https://scryfall.com/card/thb/73/thassas-oracle
- https://scryfall.com/card/tle/158/dramatic-reversal
- https://scryfall.com/card/tmp/222/earthcraft
- https://scryfall.com/card/tpr/196/spike-feeder
- https://scryfall.com/card/tsb/91/coalition-victory
- https://scryfall.com/card/vma/271/lions-eye-diamond
- https://scryfall.com/card/vma/57/brain-freeze

## The repository
- `miku/game/cards-corrupted.js` (`MK.CORRUPTED_DECK`): the overlap count in REPORT.md. Read from this clone at commit 6cb3963.
- `research/miku-b4/opposition.md` and `engine-cards.txt`: the inputs, unchanged.
