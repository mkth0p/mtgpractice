# Sources (pass 2)
Every page or file used in pass 2: accessed 2026-10-08, or 2026-10-10 for the step 9 work, the extra public lists and the Brago rebuild. Pass 1's sources are listed in `pass1/commanders.md` and `pass1/rulings.md`.

## Scryfall
- Bulk data index: https://api.scryfall.com/bulk-data. Files used, all recorded in `scryfall/index-meta.json`:
  - https://data.scryfall.io/oracle-cards/oracle-cards-20261007210155.jsonl.gz
  - https://data.scryfall.io/default-cards/default-cards-20261007210542.jsonl.gz
  - https://data.scryfall.io/rulings/rulings-20261007210031.jsonl.gz
  
  They give the Oracle text, legality, Game Changer flags, rulings, and EUR (Cardmarket trend) and USD (TCGplayer market) prices with purchase URLs.
- Miku printings, from the art tag `hatsune-miku`: https://api.scryfall.com/cards/search?q=set%3Asld+art%3Ahatsune-miku&unique=prints (46 printings, saved in `scryfall/miku-printings.json`). Also queried, with the same result: `set:sld art:miku`, and `set:sld flavor:miku` (24 printings).
- Game Changers: Scryfall `is:gamechanger` returns 53 cards, and so does the bulk data's `game_changer` flag. Both match `pass1/legality.md`.

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
- Peregrine Drake + Deadeye Navigator (+ Walking Ballista): https://commanderspellbook.com/combo/1409-3821/

Further Spellbook searches and pages the win-line research used are listed in `work/winlines.md` (section "Sources").

## Public decklists (steps 5 and 9)
Each list's file, URL, date, author, bracket and lesson are in `work/publiclists.md` (sections 1–3, plus "Pass 2b" for the lists added 2026-10-10); the lists themselves in `work/lists/`. URLs:

- https://api.scryfall.com/cards/search?q=is:gamechanger
- https://api2.moxfield.com/v2/cards/search?q=!"<name
- https://api2.moxfield.com/v2/decks/search?pageNumber=1&pageSize=50&sortType=views&sortDirection=Descending&fmt=commander&commanderCardId=<id
- https://api2.moxfield.com/v3/decks/all/<publicId
- https://archidekt.com/api/decks/<id
- https://archidekt.com/api/decks/v3/?commanderName=<name
- https://archidekt.com/decks/11333004
- https://archidekt.com/decks/11664967
- https://archidekt.com/decks/11931659
- https://archidekt.com/decks/12766096
- https://archidekt.com/decks/13491907
- https://archidekt.com/decks/13837312
- https://archidekt.com/decks/15501698
- https://archidekt.com/decks/15997080
- https://archidekt.com/decks/16306373
- https://archidekt.com/decks/18520785
- https://archidekt.com/decks/19540613
- https://archidekt.com/decks/21015429
- https://archidekt.com/decks/21098407
- https://archidekt.com/decks/21347845
- https://archidekt.com/decks/2172726
- https://archidekt.com/decks/24477776
- https://archidekt.com/decks/26039177
- https://archidekt.com/decks/26311392
- https://archidekt.com/decks/26388397
- https://archidekt.com/decks/26970409
- https://archidekt.com/decks/3646160
- https://archidekt.com/decks/4342324
- https://archidekt.com/decks/5072301
- https://archidekt.com/decks/5996567
- https://archidekt.com/decks/7413006
- https://archidekt.com/decks/8323836
- https://archidekt.com/decks/8427551
- https://archidekt.com/decks/9277180
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
- https://moxfield.com/decks/1DSNHF1Ju0yWCObsgOcXmQ
- https://moxfield.com/decks/3X1Q42Yur0eaJpUBFP6YiA
- https://moxfield.com/decks/3rvLmvsbfES7I6n6Fj3FIQ
- https://moxfield.com/decks/3zycKcQeWEGNxdT_LzejLA
- https://moxfield.com/decks/BNWjUa_lA0mzxNpgpHDGSA
- https://moxfield.com/decks/Ba1nFYEBY0mggeRj6mJjbA
- https://moxfield.com/decks/EU4dnsOjEkeVRB7GHVd-gw
- https://moxfield.com/decks/Edh3uNCJ1UKq6jhC9goeXQ
- https://moxfield.com/decks/FaRq0CATYku2G6Z_ANp9TQ
- https://moxfield.com/decks/HGE4R2XCeEOs6PdZJ4Byyg
- https://moxfield.com/decks/IYUM_cHxV0W3S6bUu5QTmA
- https://moxfield.com/decks/JpT6ND95jkyjIe4a7jzSCw
- https://moxfield.com/decks/M--H_Et5-Eu6faglZHBK8A
- https://moxfield.com/decks/ME-zgoCa5kq9c8jCsd4UMg
- https://moxfield.com/decks/M_pcU9UU_UOLeWUVrgD7Aw
- https://moxfield.com/decks/Mi4yPy0jFUGPx6pI5x3OVw
- https://moxfield.com/decks/OMSnnZoC-U-UFwBSyNDv5Q
- https://moxfield.com/decks/PQ9PfU5bX0SKmSWoBhe2aA
- https://moxfield.com/decks/Ssl9sgdAHESBxWLiktKZWg
- https://moxfield.com/decks/UodV4YLerEmS7-42rIgA5Q
- https://moxfield.com/decks/ZEjDYp9TtEi7odTjbmAB6g
- https://moxfield.com/decks/ZQlyVIx0r0Od4CvcnoOmKw
- https://moxfield.com/decks/ZbcmXJAAJEOGa74HK_52FQ
- https://moxfield.com/decks/_P7TxbJsNUqwQbbL57BEJg
- https://moxfield.com/decks/bh40TYVQ2UWWHBcoF7pn6w
- https://moxfield.com/decks/cTn_eqq220ukrVWmGkzyFQ
- https://moxfield.com/decks/cVN7OjyxAU6WtRZk12L4kA
- https://moxfield.com/decks/cdXdQaz7BE6j1gMz2vGRBQ
- https://moxfield.com/decks/clz23nIbj0WT5AOWMmXCkw
- https://moxfield.com/decks/d7FdCq_8gkKlAvKsM1PWrg
- https://moxfield.com/decks/dQ1i-GmPb0y_dW6wNQOQ8g
- https://moxfield.com/decks/eb7L1NnJ_UefJC_vNGQkcw
- https://moxfield.com/decks/hP0z_zZvxUO0IM02rQYptw
- https://moxfield.com/decks/hraUlzrXJE-73XP5y38sdQ
- https://moxfield.com/decks/lGdVhDcJzkCddkma6tToag
- https://moxfield.com/decks/mEqTmCgn70W6PL6fucxRgA
- https://moxfield.com/decks/ms_4XG56MU6vFnS3NKI9ew
- https://moxfield.com/decks/n2D5k8ZMCESnAZv8AnzblQ
- https://moxfield.com/decks/of28bO9hPE2lN4UDi1PCtg
- https://moxfield.com/decks/oumM4rK-O0uZtgaatbHNrA
- https://moxfield.com/decks/rkfPluCxT0yK3ktOuDZAEQ
- https://moxfield.com/decks/wRT3f_0R0UKTR3xfAtgWFQ
- https://moxfield.com/decks/xmH0i1HMHUi2iCd279RYPA
- https://moxfield.com/decks/ywjZih5sFEiLnZA_uEDiaQ
- https://moxfield.com/decks/z_12-vijXkeTyBz-TmZplQ
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

## Mana efficiency (step 9)
Summarized with method and findings in `mana-sources.md`; URLs:

- https://cedh-decklist-database.com/
- https://commanderdeckmaker.com/learn/deckbuilding/command-zone-template
- https://commandersherald.com/how-many-lands-should-you-play-in-cedh/
- https://edhrec.com/articles/simultaing-available-mana-beyond-the-hypergeometric-distribution
- https://edhrec.com/articles/solve-the-equation-mana-efficiency-vs-sequencing
- https://edhrec.com/articles/superior-numbers-land-counts
- https://github.com/LoG43/edh-deck-curve-sim
- https://github.com/Riddmaker/goldfishlab.app
- https://json.edhrec.com/pages/average-decks/<commander
- https://json.edhrec.com/pages/commanders/year.json
- https://library-of-leng.com/authors/frank-karsten
- https://medium.com/@schulze.mtg/the-math-of-landbases-in-magic-the-gathering-commander-3f03aadac92c
- https://playgroup.gg/commander/how-many-lands
- https://podcasts.apple.com/us/podcast/the-new-commander-deck-building-template-379/id898023861?i=1000511316766
- https://www.cedh-analytics.com/
- https://www.mtgnexus.com/viewtopic.php?p=255743
- https://www.mtgnexus.com/viewtopic.php?t=53233
- https://www.tcgplayer.com/content/article/How-Many-Lands-Do-You-Need-in-Your-Deck-An-Updated-Analysis/cd1c1a24-d439-4a8e-b369-b936edb0b38a/
- https://www.tcgplayer.com/content/article/How-Many-Sources-Do-You-Need-to-Consistently-Cast-Your-Spells-A-2022-Update/dc23a7d2-0a16-4c0b-ad36-586fcca03ad8/
- https://www.tcgplayer.com/content/article/How-to-Build-Commander-Mana-Curves-Game-Length-Ramp-Cost-and-Competitiveness/50566e8d-bc0b-457a-bffb-dbb1d5872b7c/
- https://www.tcgplayer.com/content/article/What-s-an-Optimal-Mana-Curve-and-Land-Ramp-Count-for-Commander/e22caad1-b04b-4f8a-951b-a41e9f08da14/
- https://www.youtube.com/watch?v=9IY18Dl8Xv8

## The repository
- `miku/game/cards-corrupted.js` (`MK.CORRUPTED_DECK`): the overlap count in REPORT.md. Read from this clone at commit 6cb3963.
- `research/miku-b4/opposition.md`, `engine-cards.txt` and `tools/sim/manamodel.js`: the inputs, unchanged.
