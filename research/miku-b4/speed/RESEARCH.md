# Making Shalai (Miku) win faster at a Bracket 4 table: research

Scope: the 99 in `../decklist-shalai-1500.txt` (Shalai, Voice of Plenty, GW). The goal is a faster kill that still reads as Bracket 4 (B4), not cEDH. Researched 2026-10-10.

How to read this:
- **[S#]** is a source from section 6.
- **[Inference]** is my own reasoning from card text or from our simulator's findings. No outside source makes that claim.
- Card text, colour identity and Game Changer (GC) flags come from Scryfall Oracle data **[S30]**. The web API was blocked from this container, so I read the Scryfall bulk dump already in the repo at `research/miku-tournament/local/scryfall/`. That dump marks Gaea's Cradle, Mox Diamond, Natural Order etc. as GC, which matches the official list **[S1][S4]**.

---

## 1. Deckbuilding principles at high power

### 1.1 What the bracket asks for
- WotC's October 2025 descriptions for B4 (Optimized): decks "not to adhere to the cEDH metagame reserved for Bracket 5", but "lethal, consistent, and fast". Win conditions should be "efficient and instantaneous". Players should be able to play "at least four turns before you win or lose" **[S2]**.
- B5 (cEDH) decks are "meticulously designed to battle in the cEDH metagame", and "These games could end on any turn" **[S2]**.
- The original B4 text expects "explosive starts, strong tutors, cheap combos that end games" with no restrictions other than the banned list **[S3]**.
- [Inference] What this means for us: a reliable kill on turns 5-6 with an occasional turn 4 is squarely B4. Turn 2-3 kills, and a list shaped like the cEDH Selesnya stax builds (section 2.4), are what read as B5.

### 1.2 Tutors, redundancy, compact combos
- **Compact combos win.** Fewer pieces and less mana make a combo easier to assemble, protect and rebuild. Ask how many cards act as extra copies of a combo piece: "The more ways a deck can reliably assemble its combo, the stronger that combo becomes" **[S10]**.
- **Speed vs resilience.** The same author says "Speed matters, but resilience wins". Redundant pieces, access by several kinds of tutor, built-in protection and pieces that are useful outside the combo are what make a package resilient **[S10]**.
- **Overlapping packages.** "Many tournament-winning decks contain multiple overlapping packages that share tutors, interaction, and support cards" **[S11]**.
- **Tutors have diminishing returns.** Sam Black: "don't go overboard on tutors, you just need a few and then try to expand into more robust engines". He prefers drawing half of a two-card combo and tutoring for the other half **[S12]**.
- **Redundancy vs tutors.** Card Kingdom: redundancy "strains the interaction of other players more than tutors do", because removing one piece doesn't stop a player who can find another. Tutors and fast mana are the usual levers for raising power **[S13]**.
- **Timing over raw speed.** "cEDH is about winning at the right time, not winning as soon as possible" **[S12]**.
- **Kill density.** No source I found uses this term, so it is our own framing. It is the same idea as "cards that act as extra copies of a combo piece" in **[S10]**. [Inference] Count every card that is a combo piece, or that can find a missing piece within a turn. In the current 99 that is about 24:
  - 12 pieces: Heliod, Ballista, Thune, Spike Feeder, Druid, Vizier, Swift Reconfiguration, Scurry Oak, Trostani, Craterhoof, Natural Order, Finale.
  - 12 tutors: Worldly, Enlightened, Eladamri's, Chord, GSZ, Survival, Fauna Shaman, Ranger-Captain, Recruiter, Sylvan Tutor, Eldritch Evolution, Crop Rotation (for lands).
  - Many of these pieces belong to 3-card lines or need 8+ mana. The goal is to raise the count of cheap 2-card lines, not just the total.

### 1.3 Mana and land counts
- cEDH decks "often play land counts in the high 20s" and "usually play 40-50 cards that make mana", about half of them lands **[S14]**.
- The EDHREC average Selesnya cEDH list (Ellivere) runs 28 lands plus about 12 dorks, rocks and land auras **[S16]**.
- The current list has 33 lands (counting Dryad Arbor and Urza's Saga) plus about 18 other mana sources.
- [Inference] Our simulator found that slow games are short on a combo piece, not on mana. So moving 1-2 slots from ramp spells (Three Visits, Nature's Lore, Wild Growth) to combo density fits both the sources and our data. Gaea's Cradle is the exception (section 3).

### 1.4 Protection and interaction
- Selesnya cEDH decks converge on these protection and interaction cards **[S15]**:

  | Card | Share of Selesnya cEDH decks |
  |---|---|
  | Silence | 74% |
  | Swords to Plowshares | 74% |
  | Veil of Summer | 57% |
  | Grand Abolisher | 57% |
  | Path to Exile | 50% |
  | Orim's Chant | 21% |
  | Mother of Runes | 17% |
  | Teferi's Protection | 10% |
  | Autumn's Veil | 7.9% |

- Sam Black: "interacting with Grand Abolisher or through Silence is really important" **[S12]**.
- A Silence-type card "means you're either winning the game that turn, or you definitely aren't losing" **[S17]**.
- [Inference] Our sim says slow games are often holding interaction. Protection that also enables the win (Abolisher, Kutzil, Silence-type) is worth more per slot here than reactive removal or hate pieces.

### 1.5 How many win lines
- **[S11]** argues for several overlapping packages. Card Kingdom's B4 example (Glarb) runs three distinct combo lines **[S18]**.
- [Inference] For this deck, aim for 3-4 cheap 2-card cores that share tutors (Recruiter, Chord, Worldly, Eladamri's, Survival), plus Natural Order/Finale into Craterhoof as the non-combo backup.

---

## 2. GW combo packages

Colour-identity (CI) check: G or W or GW = legal; colourless = legal; anything with U, B or R = illegal. This includes hybrid symbols: Quillspike's {B/G} makes it B+G. GC flags are from the 2026-02-09 list **[S4][S5]**.

### 2.1 Table

| # | Combo | Cards | Total mana to set up (from zero) | Cards | Tutorable by (in-list or proposed) | CI check | Any GC? | Result / how it kills | Source |
|---|---|---|---|---|---|---|---|---|---|
| A | Druid + Swift Reconfiguration | Devoted Druid ({1}{G}), Swift Reconfiguration ({W}, flash Aura) | 3 | 2 | Druid: GSZ (X=2), Summoner's Pact*, Worldly, Chord (X=2), Eladamri's, Recruiter, Survival, Fauna Shaman, Sylvan Tutor, Eldritch Evolution. Swift: Enlightened, Idyllic*, Sterling Grove* | G / W | No | Infinite G. As a noncreature Vehicle, Druid ignores summoning sickness and its toughness, so it works **the turn Druid lands** [Inference from rule 302.6 + card text; **[S7]** notes it gives mana "immediately"]. Needs an outlet (2.2). | [S6][S7] |
| B | Druid + Vizier | Devoted Druid, Vizier of Remedies ({1}{W}) | 4 | 2 | Vizier: Worldly, Chord, Eladamri's, Recruiter (toughness 1), Survival, Fauna, Sylvan Tutor, Eldritch Evolution. **Not** GSZ, Pact or Natural Order (white) | G / W | No | Infinite G. Druid must be unsick. Needs an outlet. | [S8][S30 ruling: Druid "can activate... modified by an effect (such as Vizier)"] |
| C | Druid + Luxior | Devoted Druid, Luxior, Giada's Gift ({1}, equip {3}) | 6 (2+1+3) | 2 | Luxior: Enlightened, **Urza's Saga ch. III** (mana cost {1}) | G / colourless | No | Infinite G (+1/+1 per counter offsets each -1/-1). Druid must be unsick. | [S9][S19] |
| — | Druid + Melira | — | — | — | — | G | No | **Does NOT work.** Druid ruling: if you can't put -1/-1 counters on it (Solemnity-type effect; Melira says "can't have -1/-1 counters put on them"), you can't activate the untap. | [S30 Devoted Druid ruling 2018-12-07] |
| D | Heliod + Ballista | Heliod, Sun-Crowned ({2}{W}), Walking Ballista ({X}{X}) | 9 (3 + Ballista X=2 for 4 + {1}{W}) | 2 | Heliod: Enlightened, Idyllic*, Worldly, Chord X=3, Eladamri's, Survival, Fauna, Sylvan. Ballista: Enlightened, Ranger-Captain (MV 0), Recruiter, Worldly, Eladamri's, Survival | W / colourless | No | Infinite damage. Ballista needs **two** counters: with one, it dies to state-based actions before Heliod's trigger resolves. | [S20][S30] |
| E | Thune + Spike Feeder | Archangel of Thune (5), Spike Feeder (3) | 8 | 2 | Thune: Worldly, Chord X=5, Eladamri's, Survival. Feeder: GSZ X=3, Pact*, Recruiter, Chord, Eladamri's | W / G | No | Infinite life and +1/+1 counters on every creature. Kills through combat, so it needs unsick attackers or a flying Thune. | [S21 (#27)] |
| F | Heliod + Spike Feeder | Heliod, Spike Feeder | 6 | 2 | as above | W / G | No | Infinite life only; **not a kill alone**. | [S21 (#23)] |
| G | **Rosie + Scurry Oak** | Rosie Cotton of South Lane ({2}{W}), Scurry Oak ({2}{G}) | 6 | 2 | Rosie: Recruiter (toughness 1), Chord X=3, Worldly, Eladamri's, Survival, Fauna, Sylvan, Eldritch Evolution. Scurry: GSZ X=3, Pact*, Recruiter, Chord etc. | W / G | No | Infinite 1/1 green Squirrels and counters on Scurry Oak. **Not a kill alone.** Fine at B4: EDHREC lists it as an early two-card combo, so it is out of B3 but allowed at B4 **[S22]**. [Inference] Outlets: Chord of Calling convoked by infinite green Squirrels for Craterhoof; Gaea's Cradle (infinite G) then hard-cast Ballista; Earthcraft (any basic becomes an infinite mana source). | [S21 (#2)][S22] |
| H | **Rosie + Basking Broodscale** | Rosie Cotton, Basking Broodscale ({1}{G}, **devoid = colourless card, CI G**) | 5 (+{1}{G} adapt if Rosie lands first) | 2 | Broodscale: Recruiter (2/2), Chord, Worldly, Eladamri's, Survival, Fauna. **Not** GSZ, Pact or Natural Order (devoid makes it not green **[S30 ruling]**) | W / G | No | Infinite colourless mana (Eldrazi Spawn) and infinite tokens. Kills with Walking Ballista from hand. The most-played Selesnya combo on EDHREC. | [S21 (#1)][S23] |
| I | Scurry Oak + Ivy Lane Denizen | Scurry Oak, Ivy Lane Denizen ({3}{G}) | 7 | 2 | Ivy Lane: GSZ X=4, Pact*, Chord, Worldly etc. | G / G | No | [Inference from card text] Each green Squirrel entering triggers Ivy Lane, which puts a counter on Scurry Oak, which makes a Squirrel: infinite. Same outlet problem as G. | [S30] |
| J | Scurry Oak + Trostani + Heliod (current line) | 3 cards | 10 | 3 | — | GW | No | Infinite Squirrels, life and counters. Slow: needs three cards. | [S30][Inference] |
| K | Vizier + Kitchen Finks + sac outlet | Vizier, Kitchen Finks ({1}{G/W}{G/W}, CI GW), Blasting Station or Ashnod's Altar | 10+ | 3 | — | GW / colourless | No | Infinite life and ETB/death triggers (damage with Blasting Station). | [S24] |
| L | Earthcraft + Squirrel Nest | Earthcraft ({1}{G}), Squirrel Nest ({1}{G}{G}) on a basic | 5 | 2 (+basic) | Enlightened, Idyllic* | G | No | [Inference from card text] Earthcraft's cost is "tap an untapped creature" (no {T}), so summoning-sick Squirrels pay it: infinite Squirrels. Needs a pump or haste outlet. | [S30] |
| M | Natural Order / Finale into Craterhoof | Natural Order (GC) or Finale (X≥8), Craterhoof | 4 + green creature, or 10 | 2 | Hoof: GSZ, Pact*, Chord, Worldly etc. | G | **Natural Order = GC** | Board-dependent kill. Finale with X≥10 also gives haste. | [S30] |
| — | Quillspike + Druid; Neoform; Wishclaw Talisman | — | — | — | — | **B/G, U/G, B: illegal** | — | Excluded | [S30] |

\* = not in the current 99.

### 2.2 Outlets for infinite green mana (combos A, B, C)
Druid makes only {G}, so the outlet decides whether these lines kill:
- **Walking Ballista** from hand: cast it for X = huge. Generic costs take G. This is the clean kill.
- **Shalai's {4}{G}{G}**: infinite +1/+1 counters on every creature you control **[S30]**. Kills only through combat.
- **Finale of Devastation** with X≥10: all your creatures get +X/+X and haste, and it searches out any creature **[S30]**.
- **Duskwatch Recruiter** (proposed): {2}{G} repeatedly to dig for Ballista or Craterhoof **[S30]**.
- **Gavony Township** needs {W}, so infinite G alone can't feed it.
- [Inference] With Ballista in the library and no Finale, Druid lines often need a turn to find Ballista. That is part of why "missing a piece" shows up in the sim.

### 2.3 Game Changers in this list
The 13 GCs in the current 99 (fine at B4, which allows any number **[S2][S3]**):

| Kind | Cards |
|---|---|
| Tutors | Enlightened Tutor, Worldly Tutor, Survival of the Fittest, Natural Order, Crop Rotation |
| Fast mana | Ancient Tomb, Chrome Mox, Mana Vault |
| Value and protection | Smothering Tithe, Teferi's Protection, The One Ring |
| Hate pieces | Drannith Magistrate, Aura Shards |

Gaea's Cradle (proposed) would make 14. Removed from the list since October 2025: Food Chain, Deflecting Swat and others **[S5][S6b]**.

### 2.4 What Selesnya cEDH actually looks like (so we stay out of it)
- EDHREC's Selesnya cEDH tag has 608 decks. The top commanders are Ellivere (130), Brigid (109) and Sythis (91) **[S15]**.
- The Ellivere average deck is a stax build: Rest in Peace, Root Maze, Stony Silence, Null Rod, Deafening Silence, Hushbringer, Eidolon of Rhetoric, Collector Ouphe, Archon of Emeria, Drannith Magistrate and Linvala, with 28 lands **[S16]**.
- [Inference] Shalai with a combo core, a light hate suite and no Rest in Peace/Null Rod/Winter Orb shell reads as B4.

---

## 3. Specific changes to make THIS list faster

Ranked by expected speed gain. The ranking is my inference: it weighs the sim's findings (slow games are missing a piece; Devoted Druid in the opener doubles the turn-6 kill rate) against the principles in §1. **Re-run the simulator on each swap.** None of these numbers are measured.

| Rank | Add | Cut | Why | Source |
|---|---|---|---|---|
| 1 | **Rosie Cotton of South Lane** ({2}{W}) | Trostani, Selesnya's Voice | Turns the Scurry Oak line from 3 cards / 10 mana (Scurry + Trostani + Heliod) into **2 cards / 6 mana**. Rosie is also the hub for Broodscale (H), so she has two partners. Recruiter, Chord, Worldly, Eladamri's, Survival and Fauna all find her. | [S21][S22][S23][S30] |
| 2 | **Summoner's Pact** ({0}) | Three Visits | Free instant tutor for Devoted Druid (the sim's best opener card), Scurry Oak, Spike Feeder, Craterhoof, Duskwatch or Ivy Lane. Zero mana means a same-turn combo. You lose at your next upkeep if you can't pay {2}{G}{G}, so only fire it on the combo turn or when the 4 mana is certain. Not a GC. | [S30] |
| 3 | **Gaea's Cradle** (GC) | 1 basic Forest | Creature-dense deck with about 9 dorks. Crop Rotation (already in) fetches Cradle at instant speed. With Rosie + Scurry it becomes infinite mana for a Ballista kill. Shalai protects the creatures that power it. 6.4% of EDHREC Shalai decks run it. Adds one GC, which B4 permits. | [S4][S25][S30] |
| 4 | **Basking Broodscale** ({1}{G}) | Aura Shards (GC, reactive) | Second Rosie partner: infinite colourless mana, which Ballista turns into a kill. Recruiter finds it. Shrinks the GC count back. | [S21][S23][S30] |
| 5 | **Duskwatch Recruiter** ({1}{G}) | Tireless Provisioner | Outlet-finder for infinite G (digs to Ballista) and a repeatable creature tutor for the 6+ mana mid-game turns. GSZ X=2 and Pact fetch it. | [S30][Inference] |
| 6 | **Luxior, Giada's Gift** ({1}) | Wild Growth | Third Druid partner. **Urza's Saga (already in) fetches it**, and so does Enlightened Tutor. Card Kingdom calls Saga-for-Luxior "an additional consistency boost" for Druid decks. Slower to set up (6 mana) than Swift, but it costs no tutor. | [S9][S19][S30] |
| 7 | **Archdruid's Charm** ({G}{G}{G}, instant) | Nature's Lore | Instant tutor for any creature to hand: Vizier, Rosie, Ballista, Heliod-as-creature-card. Cast it in the end step of the player before you. GGG is a real cost (in our own goldfish log it stranded Feeder for a turn). | [S30][goldfish-win-rundown.md] |
| 8 | **Silence** ({W}) or **Orim's Chant** | Archon of Emeria or Esper Sentinel | Converts a hate slot into a combo-turn enabler. Selesnya cEDH runs Silence in 74% of decks. A Silence-type card means you are "either winning the game that turn, or you definitely aren't losing". | [S12][S15][S17] |
| 9 | **Ivy Lane Denizen** ({3}{G}) | Archivist of Oghma | Third Scurry Oak partner, findable by GSZ/Pact. Lower priority because Rosie does the same job for less. | [S30][Inference] |
| 10 | **Idyllic Tutor** ({2}{W}) | Allosaurus Shepherd or Destiny Spinner (keep one) | A second enchantment tutor for Swift Reconfiguration or Heliod. It goes to hand, unlike Enlightened (top of library). 8.9% of EDHREC Shalai decks run it. | [S25][S30] |

Notes:
- **Do not add:** Melira for Druid (doesn't work, §2.1). Quillspike, Neoform, Wishclaw (wrong colours). Mox Diamond, Grim Monolith, Gemstone Caverns (our sim: no gain).
- **Bracket optics** [Inference]: these adds are creature combos, not stax, and Cradle plus 14 GCs is ordinary at B4 **[S3]**. Swap #8 removes a stax piece (Archon of Emeria) for a turn-only Silence, which reads less like cEDH stax.
- **Package view after swaps** [Inference]: Rosie hub (Scurry Oak, Broodscale), Druid hub (Swift, Vizier, Luxior) and Heliod hub (Ballista, Spike Feeder). Recruiter of the Guard finds every piece with toughness 2 or less (Rosie, Scurry Oak, Broodscale, Druid, Vizier, Ballista, Feeder), but not Heliod or Thune. Backups: Thune + Feeder and Craterhoof.
  - Kill density rises from about 24 to about 31 cards with all ten swaps (Rosie, Pact, Broodscale, Duskwatch, Luxior, Charm, Ivy Lane and Idyllic in; Trostani out).
  - Cheap (6 mana or less) 2-card cores go from 2 to 5: A, B, G, H, C.

---

## 4. Piloting rules

1. **Mulligan with a reason to keep.** Mulliganing is the default, and keeping needs a justification. The ranked reasons are broken hands, then development (mana), then interaction, then card advantage. "Mana is our most frequent bottleneck" in cEDH. The first mulligan is free in multiplayer **[S26]**. Baumann: mulligan toward hands that feel "wildly impressive" **[S27]**.
   - [Inference, for this deck] Keep: 2+ mana sources (at least 1 land) plus a combo piece or a tutor that finds one, with the plan castable by turn 4.
   - Ship: lands + interaction + value only. The sim says those are the slow games.
   - A hand with Devoted Druid and a way to play it on turn 2 is a premium keep.
2. **Judge a hand by how close it is to the kill.** Count missing pieces and how fast the hand improves. One half of a combo plus mana plus a tutor or dig spell is the baseline keep **[S28]**.
3. **Tutor at instant speed, late.** Cast Worldly, Sylvan, Enlightened, Eladamri's, Chord and Charm in the end step of the player before you. Opponents get the least time and information to react. **[S29]** gives end-step tutoring as an example of instant-speed play and notes wins are more surprising when you reveal less.
   - [Inference] The top-of-library tutors (Worldly, Sylvan, Enlightened) cost a draw. Fire them in that end step so the card arrives in your draw step.
   - Swift Reconfiguration has flash. If Druid is already down, the whole combo can be an end-step or in-response play.
4. **Sequence your protection before the pieces.** Grand Abolisher and Kutzil are sorcery-speed, so cast them first in the main phase; they then stop opponents' responses on your turn **[S17]**. Silence-type cards go before the combo, or in the upkeep of your combo turn **[S17]**.
   - Hold Veil of Summer for the counterspell.
   - Hold Teferi's Protection and Flawless Maneuver for wraths and edicts. [Inference] Shalai's hexproof does nothing against counterspells, wraths, edicts or Stifle effects.
5. **Bait, then go.** Cast the less important spell into open mana first. Watch who leaves mana up and what they let resolve **[S31]**. Before you jam, be "intentionally slamming your spell and betting on your read" **[S31]**.
   - [Inference] For this deck: make them answer Rosie or Heliod, then win with Druid + Swift, or the reverse.
6. **Count the table before going.** Count open blue mana, cards in hand and known free spells per opponent **[S31]**. Treat the three opponents as one shared pool of answers **[S27]**. Don't go for it without backup, especially as the first player to try **[S27]**.
7. **Fight on fundamental turns only.** Save interaction for turns when someone is actually trying to win. Let early value resolve. If you are behind, let the leaders trade resources **[S32]**.
   - [Inference] The sim says slow games hold unused interaction. Answer only win attempts and must-answer locks; spend every other turn's mana developing your combo.
8. **Pick your window.** With at least one blue deck at the table, "trying to win first usually makes you lose". Prefer being the second or third player to try **[S27]**. Seat 1 wins far more often than seat 4 in the data McGuinness cites (35-40% vs 10-15%; sample unstated) **[S33]**. [Inference] In late seats, go one turn later with protection rather than racing.
9. **Politics: low threat, high likeability.** "Your opponents should fear you the least and like you the most." Share information about other players' threats, and play down your own board **[S27]**. Don't overextend early, because a strong start gets answered **[S32]**.
10. **Win cleanly with a deterministic line.** Prefer Ballista kills (D, or A/B/H plus Ballista) over combat kills from infinite counters. Combat gives opponents blocks, fogs and instant-speed answers. [Inference] At a B4 table, announce the loop, demonstrate it once and resolve it. B4 expects "efficient and instantaneous" wins **[S2]**.

---

## 5. Bracket speed benchmarks (official text)

| Bracket | Official expectation | Source |
|---|---|---|
| 3 Upgraded | "you should expect to be able to play at least six turns before you win or lose". The older text says no two-card infinite combos "in about the first six or so turns" | [S2][S3] |
| 4 Optimized | "at least four turns before you win or lose". "Decks to be lethal, consistent, and fast". "Win conditions to vary but be efficient and instantaneous" | [S2] |
| 5 cEDH | "These games could end on any turn" | [S2] |
| cEDH reality | "By our best estimates, cEDH is a five-turn format on average (with a standard deviation of two turns)" | [S27] |

- The October 2025 update also removed tutor limits from all brackets; WotC now relies on the GC list to catch the most efficient tutors **[S2]**.
- The February 2026 update added Farewell and Biorhythm to the GC list and made no bracket-level changes **[S6]**.
- [Inference] Our median goldfish kill is rounds 7-8, with about 35% of solo games by turn 6. That is slower than both the B4 floor ("at least four turns") and the cEDH average of 5 ± 2.
- [Inference] A target of a median turn 5-6 goldfish (later against interaction) with turn-4 kills under about 10% stays B4 and avoids the "turn 2-3 turbo" signal.

---

## 6. Sources

- [S1] WotC, Commander Brackets Beta Update, 2025-04-22 (GC list as of April 2025): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-april-22-2025
- [S2] WotC, Commander Brackets Beta Update, 2025-10-21 (turn expectations, tutor rule removed, GC removals): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025
- [S3] WotC, Introducing Commander Brackets Beta (original B3/B4/B5 text): https://magic.wizards.com/en/news/announcements/introducing-commander-brackets-beta
- [S4] Scroll Vault, Game Changers list (Feb 9 2026 version, checked against Scryfall 2026-10-04): https://scrollvault.net/guides/game-changers.html
- [S5] Card Kingdom, Commander Brackets Game Changers Update (Oct 2025 removals): https://blog.cardkingdom.com/commander-brackets-game-changers-update/
- [S6] WotC, Commander Brackets Beta Update, 2026-02-09 (Farewell, Biorhythm added): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026
- [S6b] StarCityGames, WeeklyMTG brackets update summary (Oct 2025): https://articles.starcitygames.com/magic-the-gathering/weeklymtg-announces-2027-limited-championship-updates-to-commander-brackets/
- [S7] EDHREC, Top 10 Infinite Mana Combos (DougY, 2026-04-10), Druid + Swift Reconfiguration: https://edhrec.com/articles/top-10-infinite-mana-combos
- [S8] EDHREC combo page, Devoted Druid + Swift Reconfiguration: https://edhrec.com/combos/gw/3807-4762
- [S9] EDHREC combo page, Devoted Druid + Luxior: https://edhrec.com/combos/g/3774-4762
- [S10] Nerd Leagues, The Rise of Compact Combos (2026-06-22): https://nerdleagues.com/blog/the-rise-of-compact-combos
- [S11] Nerd Leagues, Combo Packages Explained (2026-07-01): https://www.nerdleagues.com/blog/combo-packages-explained
- [S12] Sam Black, Cards I Like to Avoid in cEDH, Hipsters of the Coast (Oct 2023): https://www.hipstersofthecoast.com/2023/10/cards-i-like-to-avoid-in-cedh/
- [S13] Scott Cullen, How To Scale A Deck's Power Level, Card Kingdom (2022-05-17): https://blog.cardkingdom.com/how-to-scale-a-decks-power-level/
- [S14] Sam Black, How Many Lands Should You Play in cEDH?, Commander's Herald (2024-03-19): https://commandersherald.com/how-many-lands-should-you-play-in-cedh
- [S15] EDHREC, Selesnya cEDH tag (commanders, card inclusion %): https://edhrec.com/tags/cedh/selesnya
- [S16] EDHREC, Average Deck, Ellivere of the Wild Court, cEDH: https://edhrecstatic.com/average-decks/ellivere-of-the-wild-court/cedh
- [S17] Harvey McGuinness, 5 More Silences and Grand Abolishers for cEDH, Commander's Herald (2023-12-20): https://commandersherald.com/5-more-silences-and-grand-abolishers-for-cedh/
- [S18] Draftsim, 6 Excellent Bracket 4 Commanders (updated 2026-07-17): https://draftsim.com/mtg-bracket-4-commander/
- [S19] Kristen Gregory, Luxior, Giada's Gift: Finally a Way to Break Devoted Druid, Card Kingdom (2022-04-11): https://blog.cardkingdom.com/luxior-giadas-gift-finally-a-way-to-break-devoted-druid/
- [S20] EDHREC combo page, Heliod + Walking Ballista: https://edhrec.com/combos/w/1274-3693
- [S21] EDHREC, Selesnya (GW) combos list by popularity: https://edhrec.com/combos/gw
- [S22] EDHREC combo page, Rosie Cotton + Scurry Oak: https://edhrec.com/combos/gw/2433-4186
- [S23] Commander Spellbook, Rosie Cotton + Basking Broodscale: https://commanderspellbook.com/combo/2433-5641/ (not fetched directly; robots blocked. The combo appears as #1 in [S21])
- [S24] EDHREC combo page, Vizier + Kitchen Finks + Blasting Station: https://edhrec.com/combos/gw/413-978-2086
- [S25] EDHREC, Shalai, Voice of Plenty commander page (inclusion %): https://edhrec.com/commanders/shalai-voice-of-plenty
- [S26] Matt Sperling, Can I Keep This? How to Mulligan in cEDH, TopDeck.gg (2023-01-06): https://topdeck.gg/articles/can-i-keep-this-how-to-mulligan-cedh
- [S27] Ken Baumann, A cEDH Field Guide, Commander's Herald (2023-08-09): https://commandersherald.com/a-cedh-field-guide/
- [S28] Carsten Kotter, Opening Hands With Combo Decks, StarCityGames (2014-09-08; Legacy, principles only): https://articles.starcitygames.com/articles/opening-hands-with-combo-decks/
- [S29] Harvey McGuinness, Winning at Instant Speed in cEDH, Commander's Herald (2024-08-24): https://commandersherald.com/winning-at-instant-speed-in-cedh/
- [S30] Scryfall Oracle text and rulings (local bulk dump `research/miku-tournament/local/scryfall/`; web equivalent https://scryfall.com). Used for every card text, CI, GC flag, and the Devoted Druid, Basking Broodscale and Vizier rulings.
- [S31] Kara Blinebry, How to Stop Losing to Counterspell in Commander, EDHREC (2025-12-04): https://edhrec.com/articles/how-to-stop-losing-to-counterspell-in-commander
- [S32] Sam Black, When Should You Interact in cEDH?, TopDeck.gg (2023-06-21): https://topdeck.gg/articles/when-should-you-interact-cedh
- [S33] Harvey McGuinness, Does cEDH Have a Seat Order Problem?, EDHREC (2026-03-24): https://edhrec.com/articles/does-cedh-have-a-seat-order-problem

### Could not verify
- A dedicated high-power Shalai primer. None was found; EDHREC's Shalai page is mostly casual Angels and pillow-fort builds **[S25]**.
- Commander Spellbook's API (robots-blocked) and the Scryfall web API (blocked from this container). Card facts come from the local Scryfall dump instead.
- No source uses the term "kill density"; it is our framing (§1.2).
- Earthcraft + Squirrel Nest and Scurry Oak + Ivy Lane Denizen are derived from card text. I did not find an EDHREC page for either pairing.
