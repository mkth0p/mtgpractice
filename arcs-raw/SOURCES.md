# Arcs — source material

Gathered 2026-10-29 for a beginner tutorial on **Arcs: Conflict & Collapse in the Reach** (Leder Games, base game).
Nothing here required a login. Copyright stays with Leder Games (game, art by Kyle Ferrin) and with each photographer; check reuse rights before publishing images outside the tutorial.

## Rules documents

| File | Original URL | What it is | Made by |
|---|---|---|---|
| `arcs-base-rulebook-leder.pdf` (+ `.txt`) | https://cdn.shopify.com/s/files/1/0106/0162/7706/files/Arcs_Base_Rulebook.pdf?v=1713374179 | Official base-game rulebook, 24 pages, hosted on Leder's own Shopify CDN (uploaded April 2024) | Leder Games (publisher) |
| `arcs-rulebook-2024-04-inet.pdf` (+ `.txt`) | https://cdn.inet.se/pdf/6337314_0.pdf | Same 24-page base rulebook, a slightly different build (cover dated April 11, 2024; credits page differs). Mirror on a retailer's CDN (Inet.se) | Leder Games (publisher), retailer mirror |
| `devkit/Arcs Development Kit and Font Guide.pdf` (+ `.txt`) | inside the dev kit zip below | How to build cards from the dev-kit templates (fonts, card sizes) | Leder Games |

The `.txt` files are `pdftotext -layout` extractions.

## Official development kit (icons, tokens, pieces)

- `devkit/Arcs_Development_Kit.zip`, from https://www.dropbox.com/scl/fo/s4fgnkq4ehsrvrqza7n75/AOenVbS1fADoDZBoVPRIcKY?rlkey=7hdtgq7fyg4e96gx64ovugufg&dl=1
  (linked from Leder's blog post https://ledergames.com/blogs/news/arcs-the-official-development-kit, Nov 26 2024). **Publisher-made**, transparent PNGs.
- Extracted, except the InDesign template (`.indd`, still in the zip).
- Top-level `devkit/*.png`: card backs (action, court, lore), card frames (guild cards per resource, lore, vox), example cards (`Art Guild Example.png`, `Art Lore Example.png`, `Art Vox Example.png`), raid-cost icons. Fate, leader (tarot), plotline and vox templates belong to the Blighted Reach campaign, not the base game.
- `devkit/icon and punchboard/`: the pieces and icons most useful for a tutorial:
  - player pieces in 4 colours (red, blue, white, yellow): ship, flagship (campaign), agent, city (front/back), starport (front/back)
  - resource icons and resource tokens: fuel, material, weapon, relic, psionic
  - ambition markers, fronts and backs (`punchboard ambition front 2-0 / 3-2 / 5-3`, `back 4-2 / 6-3 / 9-4`)
  - initiative marker, imperial ship, free city and free starport, blight (campaign)
  - battle dice faces (skirmish, assault, raid) and dice result icons (hit, self-hit, building hit, key, intercept)
  - map icons: cluster id (arrow, hex, moon), crisis, edict, summit, objective, grand ambition (several are campaign only)

Full list of the `icon and punchboard` files:
- `arcs dev_dice assault 1.png`
- `arcs dev_dice assault 2 5.png`
- `arcs dev_dice assault 3.png`
- `arcs dev_dice assault 4.png`
- `arcs dev_dice assault 6.png`
- `arcs dev_dice raid 1.png`
- `arcs dev_dice raid 2.png`
- `arcs dev_dice raid 3-4.png`
- `arcs dev_dice raid 5.png`
- `arcs dev_dice raid 6.png`
- `arcs dev_dice skirmish 1-3.png`
- `arcs dev_dice skirmish 4-5.png`
- `arcs dev_free city back.png`
- `arcs dev_free city.png`
- `arcs dev_free starport back.png`
- `arcs dev_free starport.png`
- `arcs dev_icon crisis arrow.png`
- `arcs dev_icon crisis hex.png`
- `arcs dev_icon crisis moon.png`
- `arcs dev_icon crisis.png`
- `arcs dev_icon dice building hit black.png`
- `arcs dev_icon dice building hit white.png`
- `arcs dev_icon dice hit black.png`
- `arcs dev_icon dice hit white.png`
- `arcs dev_icon dice intercept black.png`
- `arcs dev_icon dice intercept white.png`
- `arcs dev_icon dice key black.png`
- `arcs dev_icon dice key white.png`
- `arcs dev_icon dice self hit black.png`
- `arcs dev_icon dice self hit white.png`
- `arcs dev_icon edict arrow.png`
- `arcs dev_icon edict hex.png`
- `arcs dev_icon edict moon.png`
- `arcs dev_icon edict.png`
- `arcs dev_icon grand ambition.png`
- `arcs dev_icon id arrow.png`
- `arcs dev_icon id hex.png`
- `arcs dev_icon id moon.png`
- `arcs dev_icon objective.png`
- `arcs dev_icon players.png`
- `arcs dev_icon resource fuel.png`
- `arcs dev_icon resource material.png`
- `arcs dev_icon resource psionic.png`
- `arcs dev_icon resource relic.png`
- `arcs dev_icon resource weapon.png`
- `arcs dev_icon summit.png`
- `arcs dev_imperial ship.png`
- `arcs dev_initiative marker.png`
- `arcs dev_player piece blue agent.png`
- `arcs dev_player piece blue city back.png`
- `arcs dev_player piece blue city.png`
- `arcs dev_player piece blue flagship.png`
- `arcs dev_player piece blue ship.png`
- `arcs dev_player piece blue starport back.png`
- `arcs dev_player piece blue starport.png`
- `arcs dev_player piece red agent.png`
- `arcs dev_player piece red city back.png`
- `arcs dev_player piece red city.png`
- `arcs dev_player piece red flagship.png`
- `arcs dev_player piece red ship.png`
- `arcs dev_player piece red starport back.png`
- `arcs dev_player piece red starport.png`
- `arcs dev_player piece white agent.png`
- `arcs dev_player piece white city back.png`
- `arcs dev_player piece white city.png`
- `arcs dev_player piece white flagship.png`
- `arcs dev_player piece white ship.png`
- `arcs dev_player piece white starport back.png`
- `arcs dev_player piece white starport.png`
- `arcs dev_player piece yellow agent.png`
- `arcs dev_player piece yellow city back.png`
- `arcs dev_player piece yellow city.png`
- `arcs dev_player piece yellow flagship.png`
- `arcs dev_player piece yellow ship.png`
- `arcs dev_player piece yellow starport back.png`
- `arcs dev_player piece yellow starport.png`
- `arcs dev_punchboard ambition back 4-2.png`
- `arcs dev_punchboard ambition back 6-3.png`
- `arcs dev_punchboard ambition back 9-4.png`
- `arcs dev_punchboard ambition front 2-0.png`
- `arcs dev_punchboard ambition front 3-2.png`
- `arcs dev_punchboard ambition front 5-3.png`
- `arcs dev_punchboard blight back.png`
- `arcs dev_punchboard blight front.png`
- `arcs dev_punchboard resource fuel.png`
- `arcs dev_punchboard resource material.png`
- `arcs dev_punchboard resource psionic.png`
- `arcs dev_punchboard resource relic.png`
- `arcs dev_punchboard resource weapon.png`

## Images (`images/`)

### From Leder Games' website

| File | Original URL | What it shows | Made by |
|---|---|---|---|
| `leder-blog-arcs-boards.jpg` | https://ledergames.com/cdn/shop/articles/Arcs_Boards_11c55df9-799f-4d29-b8e7-fc7da9b18d31.jpg?v=1758895879 | **Early prototype** board (hex map, 2022 designer diary 7). Not the final board | Leder Games |
| `leder-blog-designer-diary-1.png` | https://ledergames.com/cdn/shop/articles/ARCS_1_1.png?v=1649346343 | Two character illustrations (concept art) | Leder Games / Kyle Ferrin |
| `leder-blog-dev-kit.png` | https://ledergames.com/cdn/shop/articles/Arcs-Dev_bfd35bf8-1440-42d4-9240-31e10fced3ce.png?v=1732738734 | Banner image for the dev kit post | Leder Games |

### From BoardGameGeek (Arcs, id 359871): original-size images

Each image page is `https://boardgamegeek.com/image/<id>`. "Fan photo" means a BGG user's own photo. The SU&SD stills were posted by BGG user BitBracht with Shut Up & Sit Down's permission.

| File | BGG image id | Original URL | What it shows | Made by (BGG uploader) |
|---|---|---|---|---|
| `bgg-01-box-3d.jpg` | [8144052](https://boardgamegeek.com/image/8144052) | https://cf.geekdo-images.com/zA-Vdj3enPt9mRYt94m23Q__original/img/2Rkms5fhC_Q4A_omnOfSXllDZeY=/0x0/filters:format(png)/pic8144052.png | Base game box (3D render) | publisher (Leder Games staff upload) (LederBrooke) |
| `bgg-02-box-cover.jpg` | [8145530](https://boardgamegeek.com/image/8145530) | https://cf.geekdo-images.com/XWImAu_3RK61wbzcKboVdA__original/img/43ianMZOks7UHlZILx0VBRntOmM=/0x0/filters:format(png)/pic8145530.png | Box front cover art | publisher (Leder Games staff upload) (LederBrooke) |
| `bgg-03-action-cards-four-suits-art.jpg` | [6823496](https://boardgamegeek.com/image/6823496) | https://cf.geekdo-images.com/xRCefuX6nHMR0_20_AfzpA__original/img/bW09uhTUnYeRRY1XAltUMBvgl1c=/0x0/filters:format(jpeg)/pic6823496.jpg | Action cards of the four suits (Construction, Aggression, Mobilization), card art preview | publisher art (Kyle Ferrin / Leder Games), uploaded by fan (PlayedItOnce) |
| `bgg-04-components-everything-in-box.jpg` | [8846890](https://boardgamegeek.com/image/8846890) | https://cf.geekdo-images.com/x5w1VgnmXdJN7JXvaHz50g__original/img/VH6qEqVVnJ9ZEfIWoR4atc9Hog8=/0x0/filters:format(png)/pic8846890.png | All base-box components laid out: board, punchboards, cards, rulebook | fan photo (Sushi_Sushi) |
| `bgg-05-components-overview-in-play.jpg` | [8301049](https://boardgamegeek.com/image/8301049) | https://cf.geekdo-images.com/_0jjJtVtmJhav1rN-mGCUw__original/img/DODHAUzYCRqXOsTGWqg7rO8P4Hw=/0x0/filters:format(png)/pic8301049.png | Nearly every component in one shot (player board, action cards, dice, tokens) | fan-uploaded still from Shut Up & Sit Down review (published with permission) (BitBracht) |
| `bgg-06-board-full-midgame.jpg` | [8269131](https://boardgamegeek.com/image/8269131) | https://cf.geekdo-images.com/oNYmL37s6xmfZEmTy0I4pw__original/img/K8-_Jhw25i_NLEg9vHmNhZUzrdg=/0x0/filters:format(jpeg)/pic8269131.jpg | Full game board mid-game, with ambition/chapter tracks and pieces | fan photo (quietstorm) |
| `bgg-07-board-topdown-portrait.jpg` | [8616501](https://boardgamegeek.com/image/8616501) | https://cf.geekdo-images.com/azRuc4SD8tlP7NSFw_H6yA__original/img/5zA7vec_6tpSkJtUn40At3T8fco=/0x0/filters:format(jpeg)/pic8616501.jpg | Top-down view of the board with player areas | fan photo (beemteam2) |
| `bgg-08-table-topdown-4p.jpg` | [8627398](https://boardgamegeek.com/image/8627398) | https://cf.geekdo-images.com/JpM-UXQvofVF28Syf3mI_Q__original/img/0sGivDkSNQofAblQBRekMIAW4hg=/0x0/filters:format(jpeg)/pic8627398.jpg | Top-down view of a 4-player table, all player boards and court | fan photo (Solenoide) |
| `bgg-09-table-4p-in-progress.jpg` | [8343850](https://boardgamegeek.com/image/8343850) | https://cf.geekdo-images.com/T_djwdQGpWunOkaxSusl9g__original/img/zR_y89YkwE7D18kO-yVTIjT96go=/0x0/filters:format(jpeg)/pic8343850.jpg | 4-player game in progress, whole table | fan photo (Yugblad) |
| `bgg-10-table-setup-before-play.jpg` | [9653087](https://boardgamegeek.com/image/9653087) | https://cf.geekdo-images.com/I6ICvKbYUjfVgtFHiYiEOg__original/img/mOd8A56THCdPokaxp3IQVtc3co0=/0x0/filters:format(jpeg)/pic9653087.jpg | Table set up before play | fan photo (Nulio_) |
| `bgg-11-board-midgame-closeup.jpg` | [8222316](https://boardgamegeek.com/image/8222316) | https://cf.geekdo-images.com/4xk8w_bDQNro6pn1u_uorQ__original/img/iruDhVuVg_inAohyJPCHgva3r34=/0x0/filters:format(jpeg)/pic8222316.jpg | Board mid-game: clusters, ambitions, pieces | fan-uploaded photo by Tom Brewster (Shut Up & Sit Down), with permission (BitBracht) |
| `bgg-12-board-and-pieces.jpg` | [8301072](https://boardgamegeek.com/image/8301072) | https://cf.geekdo-images.com/aMLOWyJH43t_pthRouCIxg__original/img/8_omnajIqN4pzoiXlU2RH9JMNyc=/0x0/filters:format(png)/pic8301072.png | Board systems with ships, cities, starports | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-13-ambitions-box-keeper-warlord-tyrant.jpg` | [8257834](https://boardgamegeek.com/image/8257834) | https://cf.geekdo-images.com/V4RSX4ZT-pulVe3b8gIesw__original/img/7RVMwqyWyNjEoA2thba6cnwNMW0=/0x0/filters:format(jpeg)/pic8257834.jpg | Ambition boxes on the board (Keeper, Warlord, Tyrant) | fan photo (runswithbees) |
| `bgg-14-chapter-track-and-ambition-markers.jpg` | [8862936](https://boardgamegeek.com/image/8862936) | https://cf.geekdo-images.com/TVD-xTfLsH9R5aMiqyTwbA__original/img/w9J0kJ95XOJB2_qfMSCYNrVxaDM=/0x0/filters:format(jpeg)/pic8862936.jpg | Chapter track, initiative pawn and ambition boxes (Keeper, Empath, Warlord) | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-15-dice-and-chapter-track.jpg` | [8301044](https://boardgamegeek.com/image/8301044) | https://cf.geekdo-images.com/Au5Vx1iQHeVVNO2tPExsbw__original/img/0Xx-csW2Q2mgezfYVjXQJJ59wsk=/0x0/filters:format(png)/pic8301044.png | Dice and the chapter track, action cards | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-16-player-board.jpg` | [8269133](https://boardgamegeek.com/image/8269133) | https://cf.geekdo-images.com/DxBwFzJWvzrJygr9Mmv5sA__original/img/P76OlfZqPtdcCtgsOvjqwMbW1_g=/0x0/filters:format(jpeg)/pic8269133.jpg | Player board (resources, trophies, captives) | fan photo (quietstorm) |
| `bgg-17-player-board-resources-closeup.jpg` | [8862933](https://boardgamegeek.com/image/8862933) | https://cf.geekdo-images.com/2V6gLQNSR2In2kuCC80SBw__original/img/CBvz1hP0lWFzImH3BVrHX9wNbts=/0x0/filters:format(jpeg)/pic8862933.jpg | Player board resource slots with resource tokens and rules text | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-18-player-board-court-and-hold.jpg` | [8301061](https://boardgamegeek.com/image/8301061) | https://cf.geekdo-images.com/gbFmkcn9wzhKYIbNqi5QHg__original/img/_bWb2hW_3dJR6anAB1jWxUSDQUw=/0x0/filters:format(png)/pic8301061.png | A player's court cards and hold (Fuel Cartel, Court Enforcers) | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-19-action-cards-four-suits.jpg` | [8862929](https://boardgamegeek.com/image/8862929) | https://cf.geekdo-images.com/8ZUhBLmF-dgjsL8BtNfmTg__original/img/dMYB3lKcARo-o6x1_kgNVu5pBjw=/0x0/filters:format(jpeg)/pic8862929.jpg | Action cards: Aggression, Administration, Construction, Mobilization | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-20-ambition-declared-card.jpg` | [8862930](https://boardgamegeek.com/image/8862930) | https://cf.geekdo-images.com/HtIsFae9a_9Bg11pxpekSA__original/img/uznB8Fz-7Vp-lvMJLapMSoIYFm0=/0x0/filters:format(jpeg)/pic8862930.jpg | "Ambition Declared" zero card and an Aggression card | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-21-court-cards-with-agents.jpg` | [8301060](https://boardgamegeek.com/image/8301060) | https://cf.geekdo-images.com/Jm8Hn0tO8iBRp_WweHsdEQ__original/img/BkOugngSsmEJZXY6tac_pdliCWM=/0x0/filters:format(png)/pic8301060.png | Court (guild) cards with agents placed on them | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-22-guild-card-court-enforcers.jpg` | [8301056](https://boardgamegeek.com/image/8301056) | https://cf.geekdo-images.com/S5gJYjcpVG1Cimx5xe277Q__original/img/3nJmnnfscgOebtW3G9eNLeNQLE0=/0x0/filters:format(png)/pic8301056.png | Guild card: Court Enforcers | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-23-guild-card-fuel-cartel.jpg` | [8301057](https://boardgamegeek.com/image/8301057) | https://cf.geekdo-images.com/umL7riOSuozHzRjG63oL7Q__original/img/5dws8lUf4YKbh5wfcOGu10G-BVg=/0x0/filters:format(png)/pic8301057.png | Guild card: Fuel Cartel with fuel tokens | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-24-guild-card-lattice-spies-agents.jpg` | [8862937](https://boardgamegeek.com/image/8862937) | https://cf.geekdo-images.com/3crqT8CJfgnWLEQtDM4GlA__original/img/yTKOoYYaIzKOZSGpA_kmyAIp--c=/0x0/filters:format(jpeg)/pic8862937.jpg | Guild card Lattice Spies with agents | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-25-resources-at-center.jpg` | [8301058](https://boardgamegeek.com/image/8301058) | https://cf.geekdo-images.com/1OY3sxuXwXaU4_z3yu0zXA__original/img/RZcZjX1bkXA9G2uV6u4NxSRevqM=/0x0/filters:format(png)/pic8301058.png | Resource token stacks at the centre of the board | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-26-resource-tokens.jpg` | [8862931](https://boardgamegeek.com/image/8862931) | https://cf.geekdo-images.com/aTU6i1Lg6FmSFiM2-jViug__original/img/Si_5885Gh3NuhKIcDL7zZhcbBdA=/0x0/filters:format(jpeg)/pic8862931.jpg | The five resource tokens (fuel, material, weapon, relic, psionic) | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-27-ships-and-score-track.jpg` | [8269132](https://boardgamegeek.com/image/8269132) | https://cf.geekdo-images.com/-X5a6wt68hP5BT2Xn0wE1Q__original/img/-IVu3i7ZOUE9urD84ttf7M6-WYU=/0x0/filters:format(jpeg)/pic8269132.jpg | Wooden ship pieces, cubes on the score track | fan photo (quietstorm) |
| `bgg-28-ships-closeup.jpg` | [8862932](https://boardgamegeek.com/image/8862932) | https://cf.geekdo-images.com/bErVE2ksWJaasKwyj9_Alg__original/img/KLuwrmVW5hOqKKR7XfeZ2FbKKhI=/0x0/filters:format(jpeg)/pic8862932.jpg | Ships close-up with a starport | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-29-ships-and-starport.jpg` | [8862934](https://boardgamegeek.com/image/8862934) | https://cf.geekdo-images.com/4wdE3lyzSqcL3Ybk0SfzJA__original/img/P3INRt68Y7to3GPXYFPr-ZdzZkY=/0x0/filters:format(jpeg)/pic8862934.jpg | Ship and starport pieces | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-30-dice.jpg` | [8256156](https://boardgamegeek.com/image/8256156) | https://cf.geekdo-images.com/SYvTaHOBGLGpMniwIWT6oA__original/img/o40LVOF4tVdwOHblNJtoq9s47D4=/0x0/filters:format(jpeg)/pic8256156.jpg | The three kinds of battle dice (skirmish, assault, raid) | fan photo (OrthogonalAdjacency) |
| `bgg-31-raid-dice.jpg` | [8862935](https://boardgamegeek.com/image/8862935) | https://cf.geekdo-images.com/CxB2JCvyGwa7Whvph5fdLQ__original/img/BhRUjJlqZT_PluTMWed5cUaGMiY=/0x0/filters:format(jpeg)/pic8862935.jpg | Red raid dice close-up | fan photo (@spaghettiandmeeples) (spaghettiandmeeps) |
| `bgg-32-leaders-noble-steward.jpg` | [8301055](https://boardgamegeek.com/image/8301055) | https://cf.geekdo-images.com/Q-2tzQB51mHggJMd-sTZOQ__original/img/wHPnA7XvGMivetL5YtJ5hrmnOYc=/0x0/filters:format(png)/pic8301055.png | Leader cards: Noble and Steward | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-33-leader-overseer.jpg` | [8301053](https://boardgamegeek.com/image/8301053) | https://cf.geekdo-images.com/i-3dlwI4NUjiAUJCUbanOA__original/img/Xam3Zm8glBOPtXQbnJbwczWJUeY=/0x0/filters:format(png)/pic8301053.png | Leader card: Overseer | fan-uploaded SU&SD still (with permission) (BitBracht) |
| `bgg-34-leader-rebel-lore-sprinter-drives.jpg` | [8301054](https://boardgamegeek.com/image/8301054) | https://cf.geekdo-images.com/Ii0-6Q1uNufvnsN4Lax5CA__original/img/It3fjtd_lr_psdCTw3Svbh9kijk=/0x0/filters:format(png)/pic8301054.png | Leader card Rebel and lore card Sprinter Drives | fan-uploaded SU&SD still (with permission) (BitBracht) |

## What I could not get

- **No Arcs entry on ledergames.com/pages/resources** (it lists Root, Vast, Fort and Ahoy only). The Arcs store page (`/products/arcs`) returns 404, so there are no official product or press-kit images from the store, and I found no Arcs media kit.
- **No official "Learn to Play", quickstart, FAQ or rules-reference PDF** found. Arcs ships with a single rulebook; the setup steps and turn summary are inside it. Leder's "How to play Arcs" page (https://ledergames.com/pages/how-to-play-arcs) is only an embedded YouTube video: https://www.youtube.com/watch?v=xv_aXuTTil8
- **No clean flat scan of the final game board** from the publisher. The best stand-ins are the top-down fan photos (`bgg-07`, `bgg-08`) and the angled full-board shots.
- Leader and lore cards are shown only in photos (SU&SD stills). There is no official card-image database for Arcs like Leder's `cards.ledergames.com` for Root.
