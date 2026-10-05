# Bracket 4 ("Optimized") — what it means and how optimized decks are built

Research notes compiled 2026-10-05 (all URLs read on that date unless stated). Paraphrases throughout; at most one short quoted phrase per source. Claims that could not be confirmed are marked **not verified** and collected at the end.

---

## 1. Official definitions of Brackets 1–5 and the Game Changers list

### 1a. Timeline of the official system (Wizards of the Coast / Commander Format Panel)

- **2025-02-11 — "Introducing Commander Brackets Beta"** (Gavin Verhey, magic.wizards.com). Five brackets replace the 1–10 power scale; Game Changers (GC) list introduced with 40 cards. Bracket 4's stated philosophy: bring "the best version of the deck you want to play" but not one tuned to a tournament metagame. Bracket 5 is described as the same card pool but with a metagame-and-tournament mindset, where winning matters more than self-expression and pet cards are cut for meta-optimal picks.
- **2025-04-22 — "Commander Brackets Beta Update – April 22, 2025."** No structural changes ("Intent is the most important part of the bracket system."). GC list: Trouble in Pairs and Trinisphere removed; 18 cards added (Teferi's Protection, Humility, Narset Parter of Veils, Intuition, Consecrated Sphinx, Necropotence, Orcish Bowmasters, Notion Thief, Deflecting Swat, Gamble, Worldly Tutor, Crop Rotation, Seedborn Muse, Natural Order, Food Chain, Aura Shards, Field of the Dead, Mishra's Workshop); five unbanned cards placed straight onto the list (Braids Cabal Minion, Coalition Victory, Gifts Ungiven, Panoptic Mirror, Sway of the Stars). My count of the resulting list is 61 cards (the article summary I received said 56 and a third-party changelog says ~63 — see "not verified"). One-mana tutors (Gamble, Crop Rotation, Worldly Tutor) were added explicitly because of their efficiency. Players were encouraged to "bracket up" or at least talk about what the deck does before the game.
- **2025-10-21 — "Commander Brackets Beta Update – October 21, 2025."** The big revision:
  - Every bracket gets a minimum-turn expectation: B1 9+, B2 8+, B3 6+, **B4 4+**, B5 any turn. WotC explains the semantics: when B3 says "at least six turns", the seventh turn is the first turn you would be satisfied seeing the game end (so for B4, the fifth turn).
  - **All tutor restrictions removed from every bracket**; the GC list is relied on to catch the most efficient tutors.
  - Bracket 2 decoupled from "precon power".
  - Ten cards removed from GC: Expropriate, Jin-Gitaxias Core Augur, Sway of the Stars, Vorinclex Voice of Hunger, Kinnan Bonder Prodigy, Urza Lord High Artificer, Winota Joiner of Forces, Yuriko the Tiger's Shadow, Deflecting Swat, Food Chain → 51 cards.
  - New GC philosophy: cards that easily and dramatically warp games — run away with resources, shift games unpleasantly, lock people out, tutor efficiently, or are unfun commanders.
  - Rule 0 explicitly remains active at every bracket level other than cEDH.
  - Bracket 4 "Players expect" bullets (paraphrased): decks that do **not** follow the cEDH metagame (reserved for B5); decks built to be lethal, consistent and fast; Game Changers that are mostly "fast mana, snowballing resource engines, free disruption, and tutors"; win conditions that vary but are efficient and immediate; explosive gameplay with huge threats and matching disruption; at least four turns before someone wins or loses.
  - Bracket 5 bullets (paraphrased): decks meticulously designed for the cEDH metagame, able to win quickly or generate overwhelming resources, usually built from existing cEDH knowledge/decklists; win conditions optimized for efficiency and consistency; intricate play with razor-thin margins; victory prioritized over everything; games can end on any turn.
  - The accompanying infographic (Rachel Weeks; transcribed on mtg.wiki) summarises B4 as no restrictions beyond the banned list, decks turbocharged with the format's most powerful cards, everyone intends to win and is "ready to play against anything"; B5 as decks built to win in the competitive metagame using only the most powerful strategies.
- **2025-12-11** — Format Panel rotation, no format changes (commanderbrackets.com changelog).
- **2026-02-09 — "Commander Brackets Beta Update – February 9, 2026."** Farewell and Biorhythm added to GC (Biorhythm unbanned straight onto the list) → **53 cards**. Lutri, the Spellchaser unbanned but deliberately *not* added (its ban was about the companion mechanic, not raw power; per the changelog it is now banned as a companion only). No structural bracket changes; WotC committed to a slower cadence of changes in 2026 and said the "beta" label would probably be dropped later in 2026. Key sentence on intent: brackets guide pregame conversation and are "not an ultimate arbiter of who can play against whom".
- **2026-03-23, 2026-05-18** B&R announcements: no Commander/bracket changes (commanderbrackets.com changelog). Search summaries also report no changes on 2026-06-29 and 2026-08-10 (**not verified** on the WotC site). As of 2026-10-05 the 2026-02-09 list is still the latest official version (mtg.wiki, commanderbrackets.com, playgroup.gg all show 53 cards).
- **Official format page** (magic.wizards.com/en/formats/commander, read 2026-10-05): brackets are optional matchmaking tools; Brackets 1–3 are levels of socially focused play, Brackets 4 and 5 are "a higher power or even a competitive experience"; each bracket's intent/philosophy is the most important part; the three barometers are two-card infinite combos, extra turns and mass land denial; GC: none in B1–2, up to three in B3, unlimited in B4–5; still labelled beta.

### 1b. Side-by-side: what separates Bracket 3 / Bracket 4 / Bracket 5 (current rules)

| Barometer | Bracket 3 "Upgraded" | Bracket 4 "Optimized" | Bracket 5 "cEDH" |
|---|---|---|---|
| Game Changers | up to 3 | unlimited | unlimited |
| Two-card infinite combos | no *early-game* two-card combos (Feb 2025 wording: "no intentional early-game two-card infinite combos"; EDHREC's community vote operationalises "early" as executable in roughly the first six turns) | anything goes | anything goes |
| Extra turns | low quantities, not chained or looped | unrestricted, chaining allowed | unrestricted |
| Mass land denial | none | allowed | allowed |
| Tutors | no limit (since Oct 2025; strongest ones are GCs) | no limit | no limit |
| Expected length | 6+ turns | 4+ turns | any turn |
| Mindset | upgraded beyond precon, still social | strongest version of the deck *you* want, not meta-tuned | built to win in the tournament metagame |

Sources: WotC 2025-02-11, 2025-10-21; mtg.wiki "Commander Brackets" (infographic transcription); commanderbrackets.com FAQ (2026-06-10); EDHREC combo page for Demonic Consultation + Thassa's Oracle (read 2026-10-05). Caveat: in the mtg.wiki transcription of the October 2025 infographic the "(before turn 6)" qualifier appears next to *chaining extra turns* rather than *two-card combos*; the article text itself only says you should not expect to win or lose before turn six in B3, so the exact attachment of the turn-6 qualifier is **not verified**.

### 1c. Current Game Changers list (version of 2026-02-09, 53 cards; read on mtg.wiki and commanderbrackets.com 2026-10-05)

- **White (7):** Drannith Magistrate, Enlightened Tutor, Farewell, Humility, Serra's Sanctum, Smothering Tithe, Teferi's Protection
- **Blue (10):** Consecrated Sphinx, Cyclonic Rift, Fierce Guardianship, Force of Will, Gifts Ungiven, Intuition, Mystical Tutor, Narset Parter of Veils, Rhystic Study, Thassa's Oracle
- **Black (10):** Ad Nauseam, Bolas's Citadel, Braids Cabal Minion, Demonic Tutor, Imperial Seal, Necropotence, Opposition Agent, Orcish Bowmasters, Tergrid God of Fright, Vampiric Tutor
- **Red (3):** Gamble, Jeska's Will, Underworld Breach
- **Green (7):** Biorhythm, Crop Rotation, Gaea's Cradle, Natural Order, Seedborn Muse, Survival of the Fittest, Worldly Tutor
- **Multicolor (4):** Aura Shards, Coalition Victory, Grand Arbiter Augustin IV, Notion Thief
- **Colorless / lands (12):** Ancient Tomb, Chrome Mox, Field of the Dead, Glacial Chasm, Grim Monolith, Lion's Eye Diamond, Mana Vault, Mishra's Workshop, Mox Diamond, Panoptic Mirror, The One Ring, The Tabernacle at Pendrell Vale
- **Delisted since launch:** Trinisphere, Trouble in Pairs (Apr 2025); Expropriate, Jin-Gitaxias, Sway of the Stars, Urza, Deflecting Swat, Food Chain, Vorinclex, Kinnan, Yuriko, Winota (Oct 2025).
- Not on the list but relevant: Sol Ring is legal everywhere; Mana Crypt and Jeweled Lotus are banned outright (bluecore.cards, 2026-08-19).
- For Dimir specifically the on-list cards are: Consecrated Sphinx, Cyclonic Rift, Fierce Guardianship, Force of Will, Gifts Ungiven, Intuition, Mystical Tutor, Narset, Rhystic Study, Thassa's Oracle, Ad Nauseam, Bolas's Citadel, Braids, Demonic Tutor, Imperial Seal, Necropotence, Opposition Agent, Orcish Bowmasters, Tergrid, Vampiric Tutor, Notion Thief, plus the 12 colorless cards/lands (33 of the 53).

### 1d. Official clarifications on intent vs. card legality

- Feb 2025: the combo rules target *intentional* combos built into the list; an accidental in-game infinite is fine. WotC concedes a player can lie about their bracket and the system cannot stop that; most people want honest matches. Suggested pregame phrasing: "My deck has five Game Changers. Is that cool?" (WotC 2025-02-11).
- Feb 2025 (Gavin Verhey on X, 2025-02-13, as cited by mtg.wiki): it is not about running the deck through Archidekt/Moxfield and treating the number as settled; the philosophy text matters more than the checklist.
- April 2025: intent is the most important part; evaluate your own deck honestly rather than by checklist; if in doubt bracket up or disclose.
- October 2025: the brackets are about what you intend to do; Rule 0 stays active at all brackets except cEDH; turn minimums are "satisfaction" thresholds, not hard rules.
- February 2026: brackets are a tool to guide the pregame conversation, not a gatekeeper.
- Community corollaries: Commander's Herald (Charlotte Sable, 2025-02-16) — a deck with one GC and one tutor can still be solidly B4 if the card quality and plan are ruthless (her Xyris example won on turn 6); CoolStuffInc (Nigel Kurtz, 2025-11-26) — budget does not set the bracket, a $100 deck with an infinite-mana combo is B4; EDHREC (Cas Hinds, 2026-06-22) — a decklist alone often cannot distinguish B4 from off-meta cEDH, which is why Rule 0 talk is needed.

---

## 2. How experienced players describe building an optimized (Bracket 4) deck

### 2a. The mindset difference from cEDH (and whether B4 is "cEDH with a lower ceiling")

- WotC (2025-02-11): B4 is the best version of the deck you want to play without a tournament metagame in mind; B5 adds metagame awareness and no sacrifices for self-expression.
- EDHREC, "The Difference Between Bracket 4 and cEDH" (Cas Hinds, 2026-06-22): B4 player asks "How strong can I make this deck?"; cEDH player asks how often it wins against the strongest decks. Off-meta cEDH still plans against the meta; B4 ignores the wider metagame. Contributors note current cEDH decks can threaten a win on turn 2 or build toward overwhelming card advantage; some cEDH commanders win via passive card/mana advantage rather than speed. Conclusion: without WotC metrics the two are often indistinguishable on paper.
- Three for One Trading (Ben Guilfoyle, 2025-12-19): two test questions — are you playing a known cEDH deck, and "Are you making any compromises?"; "no" to both = B4. Optimized decks ignore the cEDH metagame, are archetype-constrained, and may underperform at real cEDH tables despite high power.
- commanderbrackets.com (reviewed 2026-06-10): "B4 is 'my strongest deck'; B5 is 'the format's strongest deck'"-type framing; both share identical card rules.
- farseek.ai (reviewed 2026-06): a B3 deck *might* kill on turn 5 when everything goes right, whereas a B4 deck is "built to kill on turn 4 to 6 most games"; test for cEDH vs B4: would the pilot swap commanders tomorrow if a stronger meta option appeared (cEDH yes, B4 no).
- bluecore.cards (2026-07-03, updated 2026-08-19): B4 is "the best version you can build of a specific idea"; B5 is built against a living tournament metagame; B4 accepts slightly longer games (4–7 turns).
- CoolStuffInc (Nigel Kurtz, 2025-11-26): what separates B4 from cEDH is player intent; experienced cEDH players recognise a cEDH list and would not bring it to a casual table.
- Answer to the "lower ceiling" question: no source claims an official power ceiling; the ceiling is *identical* (same banned list, unlimited GCs). What differs is metagame tuning, consistency targets (any-turn vs 4+ turns) and commander choice. Several "Bracket 4" sample lists are literally cEDH-grade (see 2c: Draftsim's Glarb list runs 18 Game Changers and Thassa's Oracle + Demonic Consultation).

### 2b. What changes when you optimize a deck for Bracket 4 (qualitative advice)

- WotC (2025-10-21): the GCs you should expect at B4 are "fast mana, snowballing resource engines, free disruption, and tutors"; win conditions are expected to be efficient and immediate (instant-speed / uncounterable-by-combat style), and the gameplay explosive with disruption to match.
- EDHREC, "Adapting Your Decks to the Optimized Bracket 4" (Jeff Girten, 2025-04-28). Five levers: (1) fast mana (Mana Vault, Elvish Spirit Guide, Lotus Petal); (2) Game Changers that slot anywhere (The One Ring); (3) free interaction to stop other people's wins (Force of Will, Deflecting Swat, Force of Vigor); (4) tutors plus redundancy so the main win has several routes; (5) card draw engines (Rhystic Study, Necropotence, Esper Sentinel). Worked examples: Yeva (mono-green) — 22 swaps, 8 manabase changes incl. Ancient Tomb, tutors Crop Rotation/Eldritch Evolution/Shared Summons/Worldly Tutor, interaction Veil of Summer/Beast Within/Destiny Spinner/Thorn of Amethyst, plus an Ashaya combo loop; Kalamax (Temur spellslinger-Voltron) — 36 cards changed, added Force of Will, Fierce Guardianship, Deflecting Swat, Invigorate and draw (The One Ring, Mystic Remora, Archmage Emeritus, Wheel of Misfortune, Dig Through Time). The Archidekt copy of the B4 Kalamax list shows 36 lands, 35 instants, 14 creatures, 8 artifacts (bracket estimate "Optimized (4)").
- commanderbrackets.com, Bracket 4 page (2026-06-10): expect "fast, consistent, ruthless decks" from everyone; you need interaction from turn one; mulligans matter; fast mana is everywhere; example archetypes are fully powered Korvold with a dense rock suite, turbo reanimator with Ad Nauseam-style finishes, and cEDH-adjacent lists played outside tournaments.
- bluecore.cards (2026-08-19): B4 signals are 4+ GCs, early efficient two-card combos (turn 4–5), mass land destruction, and a dedicated fast-mana base that puts you a full turn ahead; expect removal/counters on turns 1–2 and manabases of fetches, shocks and duals; common mistake: judging your deck by its *average* hand instead of its *best* hand.
- scrollvault.net bracket guide (2026-10-02): B4 manabase is original-dual-style lands, shocks, fetches and GC lands; fast-mana suite Mox Diamond, Chrome Mox, Lion's Eye Diamond, Mana Vault, Grim Monolith, Ancient Tomb; tutors Demonic, Vampiric, Mystical, Enlightened, Imperial Seal, Worldly; protection leans on Force of Will and Fierce Guardianship; games 4+ turns.
- mtgmaster.app B4 guide (2026-04-21): no numbers, but ten principles — performance over raw power ("A deck with a high ceiling can still have a bad average game"), a clear identity, excellent mana, meaningful early turns, purposeful ramp, draw to reduce failure rates, real interaction for combo set-ups and engines, clear and compact win conditions, redundancy, protection and recovery.
- deckcipher.com B4 checker (reviewed 2026-08-06): "4 or more Game Changers is a typical Bracket 4 indicator"; premium tutors and free interaction are expected; what pushes toward B5 is many compact/deterministic combo packages, high fast-mana density stacked with premium tutors, and consistent wins before turn 4–5.
- nerdleagues.com (DonSpider, 2026-07-05): include Sol Ring/Mana Vault-class fast mana and the best duals, prioritise Demonic/Vampiric Tutor, aim for wins by turn 5–7 with games possibly ending on turn 4.
- Commander's Herald (Charlotte Sable, 2025-02-16): efficient, expensive cards and a ruthless plan make a deck B4 even with few GCs.
- witchphd (2025-11-07): B4 is the "all cardboard is OK" bracket; strong synergy plus high card quality plus efficient disruption; more predictable than B3 because nobody is half-measuring.
- Command Zone podcast, ep. 731 "What's Up w/ Bracket 4?" (2026-03-17, guest Joe Johnson): framed as pushing casual as far as it goes without becoming cEDH, "soup up your deckbuilding for the Bracket 4 big leagues"; the detailed advice is only in audio (**not verified**). Nitpicking Nerds, "The Complete Guide to High Power Commander (Bracket 4)" (YouTube, 2026-05-17): same — content not readable (**not verified**).

### 2c. Concrete numbers (who says what)

**Lands**
- cEDH reference: Draftsim cEDH guide (Jake Henderson, 2026-05-25) sample lists run 26–28 lands (Urza 27, Kenrith 28, Thrasios/Tymna 27, Vivi 26). EDHMeta cEDH guide (Crumblier, 2026-05-27): Blue Farm 30 lands; Ral storm 17. ScrollVault Monte-Carlo study (3.75 M simulated games, 2026-09): cEDH turbo 29–31 lands with 12 fast-mana sources (avg MV 1.8); combo 33–35 lands with 10 rocks (avg MV 2.5); midrange 36–37 lands with 10 ramp pieces (avg MV 3.0); consistent with Karsten's formula lands = 31.42 + 3.13×avgMV − 0.28×ramp. EDHREC "Superior Numbers" (Dana Roach, 2019-02-20): site average 29 lands and 4.15 rocks (31 lands in recent decks) is "far too anemic" for casual decks; cEDH lists had 28–43 mana sources at avg CMC 1.68–2.04.
- Bracket-4-labelled lists: Star City Games "Commander VS #491: Bracket 4 Brawl" (2026-06-14/15) — Nekusar 33, Beledros 33, Atraxa infect 35, Ragavan 33 lands. EDHREC/Archidekt B4 Kalamax — 36. Draftsim "6 Excellent Bracket 4 Commanders" (David Royale, 2026-07-17; my counts from the published lists): Glarb 30, Winota 28, Yuriko 25, Zur 36 (the Prossh and Animar lists on the page were incomplete when parsed, so not counted). Draftsim Yuriko guide (Alex Barker, 2025-01-07, upd. 2026-07-29; "cEDH-adjacent"): 32 lands.
- Takeaway: B4 lists span ~25–36 lands depending on curve; turbo/low-curve builds sit at 25–30, midrange B4 at 33–36.

**Fast mana / rocks**
- cEDH: 10–12 mana artifacts (Draftsim 2026-05-25); 13 fast-mana artifacts in Blue Farm — four Moxen, LED + Lotus Petal, Sol Ring, Grim Monolith, Arcane Signet, Fellwar Stone and Talismans (EDHMeta 2026-05-27); 12 fast-mana sources in the ScrollVault turbo profile.
- B4 lists (my counts, Draftsim 2026-07-17): Glarb 11 (incl. Mana Vault, Chrome Mox, Mox Diamond, Grim Monolith, Ancient Tomb, Dark/Cabal Ritual, Lotus Petal, Elvish Spirit Guide); Winota 9 (Sol Ring, Mana Vault, Chrome Mox, Mox Diamond, Lotus Petal, Ancient Tomb, City of Traitors, Gemstone Caverns, Simian Spirit Guide); Yuriko 4; Zur 2. Draftsim's cEDH-adjacent Yuriko: 7 rocks. Draftsim (Royale) notes Winota's fast mana enables turn-3 deployment.
- General templates for comparison (not bracket-specific): Command Zone template 10–12 ramp (edh.fandom summary); tappeddecks (2026-08-25) 10–12; spellweave (2026-04) 8–12.

**Interaction**
- ScrollVault bracket calculator (2026-10-04, a tool's heuristic): B4–5 decks "need 10–18 interaction spells (15–28%)" because one unanswered combo ends the game; B3 8–14; B1–2 5–10; at least 40% of it at instant speed.
- cEDH: "25 to 35 pieces of instant-speed interaction" vs 8–10 in casual (EDHMeta 2026-05-27); Draftsim's cEDH samples carry 23–35 instants; EDHREC "Intro to cEDH" (Callahan Jones, undated) calls free counterspells the lifeblood of the format (Force of Will, Fierce Guardianship, Deflecting Swat, Mindbreak Trap, Force of Negation).
- B4 lists (my counts): Glarb 11 free/cheap counters and protection (Force of Will, Force of Negation, Pact of Negation, Mental Misstep, Mindbreak Trap, Flusterstorm, Swan Song, An Offer You Can't Refuse, Force of Vigor, Subtlety, Counterbalance); Zur 8 (Force of Will, Force of Negation, Fierce Guardianship, Mana Drain, Swan Song, Dovin's Veto, Counterspell, An Offer You Can't Refuse); Yuriko 5 (Force of Will, Force of Negation, Fierce Guardianship, Misdirection, Mana Drain); Winota only Deflecting Swat and Solitude. Draftsim's Yuriko guide: ~20 counterspells/removal.
- Role of free spells: Girten's first B4 upgrade for Kalamax was Force of Will + Fierce Guardianship + Deflecting Swat; WotC lists Force of Will and Fierce Guardianship as GCs under "free disruption"; EDHMeta names Force of Will, Pact of Negation and Fierce Guardianship as the standard free trio. Deadly Rollick was not discussed in any source read (**not verified**). Deflecting Swat was removed from the GC list in Oct 2025 (still a staple in the lists above).

**Card advantage engines**
- Girten: Rhystic Study, Necropotence, Esper Sentinel, The One Ring, Mystic Remora, Archmage Emeritus, wheels, Dig Through Time. WotC: "snowballing resource engines" are typical B4 GCs. Kurtz: Rhystic Study and Mystic Remora are explicitly fair game at B4. Playgroup.gg GC stats (2026-10-05, 39,594 games): Consecrated Sphinx +23.9% win rate when cast vs. left in library; Cyclonic Rift +16.5%.

**Tutors**
- No bracket limit since Oct 2025. B4 lists (my counts): Glarb 9 (Demonic, Vampiric, Imperial Seal, Mystical, Worldly, Tainted Pact, Demonic Consultation, Finale of Devastation, Lim-Dûl's Vault); Zur 9 (incl. Enlightened, Transmute Artifact, Whir, Reshape, Beseech the Mirror); Yuriko 4 (Demonic, Vampiric, Imperial Seal, Mystical); Winota 4 creature tutors (Enlightened Tutor, Imperial Recruiter, Recruiter of the Guard, Ranger-Captain of Eos). Blue Farm (cEDH): 6.

**Average mana value**
- cEDH: rarely above 1.5–1.8 (EDHMeta 2026-05-27); 1.8 in the ScrollVault turbo profile; a three-mana ramp spell that does not threaten a win is unplayable in cEDH (EDHMeta). Aggro reference points: ≤2.8 for low-ramp aggro (nerdleagues 2026-07-03); 1.86 for a tuned Wilson, Refined Grizzly Voltron list (airza.net). No source gives a Bracket-4-specific average-MV target (**not found**).

**Game Changers count**
- 4+ is the de-facto threshold (deckcipher, bluecore, farseek). B4 lists above carry 5 (Winota), 9 (Yuriko), 15 (Zur) and 18 (Glarb). Claim that the "average Bracket 4 deck is playing 5 gamechangers" appears in a search snippet attributed to commandertemplate.com, whose page could not be opened (**not verified**).

**Win condition selection**
- WotC: efficient and immediate. nerdleagues "How cEDH Decks Win Games in 2026" (2026-06-15): the three dominant families are Thassa's Oracle packages ("Only requires two cards"), Underworld Breach packages, and infinite-mana packages (Kinnan + Basalt Monolith, Isochron Scepter + Dramatic Reversal, Devoted Druid + Vizier of Remedies, Food Chain); good combos are chosen for speed, card efficiency, tutorability, resilience and low deckbuilding cost. EDHMeta: two primary win conditions in Blue Farm (Oracle combo, Breach loop). Girten: build several routes to the same win. mtgmaster.app: compact wins, redundancy, single-card dependency is a mistake. EDHREC combo data (read 2026-10-05): Demonic Consultation + Thassa's Oracle is the second-most played combo on the site (149,079 decks, 5.92% of 2.52 M eligible), community-voted 100% trivial prerequisites / 100% significant / 100% early-game, therefore allowed only in Brackets 4–5; inclusion 85–91% in Kraum/Tymna, Thrasios/Tymna and Rograkh/Silas cEDH decks.

---

## 3. What wins games at Bracket 4 in practice

- **No bracket-segmented data exists in any source read.** The best casual-game dataset is Playgroup.gg's monthly Commander Metagame Report (all brackets pooled):
  - March 2026 (25,623 games): combat 54.3%, non-combat damage 20.6%, commander damage 9.2%, combo 6.4%, alternative win 6.3%, mill 1.8%, poison 1.4%; games featuring an infinite combo 4.9%; average 8.8 rounds (~52–57 minutes); combo is the fastest finish (6.9 rounds), combat the slowest (9.2).
  - May 2026 (27,366 games): combat 54.7%, non-combat 21.0%, commander damage 8.7%, combo 6.2%, alternative 6.2%, mill 1.9%, poison 1.3%; infinite-combo rate 5.1%; 8.9 rounds; combo 7.0 vs combat 9.2 rounds; seat 1 wins 28.9% of 4-player pods, seat 4 21.5%.
  - Reports exist through August 2026 (40,850 games) but still without bracket splits.
- Playgroup.gg "power level" page (2026-10-05; 367,709 games, 31,483 decks): decks with 0 GCs win 3.4 points below baseline, 1–3 GCs +4.5, 4+ GCs +11.9 (diminishing returns); power 8–9 maps to B4, 10 to B5; "roughly one deck in four performs like it belongs somewhere else". Per-card: Thassa's Oracle +32.6% win rate when cast, Ad Nauseam +24.7%, Underworld Breach +21.4%.
- **cEDH as the upper bound:** EDHREC "Intro to cEDH" — unless a Winota or heavy stax deck is at the table, "the game almost certainly will not end in combat"; games are usually decided in turns 3–7. Draftsim cEDH guide (2026-05-25): combat decks are less popular and less successful because protective resources are better spent on counterspells. EDHMeta (2026-05-27): game-winning threats regularly appear on turn 2. cedhstats.org (6-month window, read 2026-10-05): Kraum/Tymna 7.5% meta, Kinnan 7.3%, Rograkh/Thrasios 5.4%, Rograkh/Silas 4.7%, Sisay 3.9%; combat-oriented decks are a small minority — Magda 2.0% (but 1.41 points/game, 32% top-cut rate), Ishai/Rograkh 2.2%, Winota 1.0%. cEDH.events (last 30 days, 1,339 tournaments): Kinnan most entered (692) with 20.4% win rate; seat 1 24.8%, seat 2 21.5%, seat 3 28.9%, seat 4 19.0%. topdeck.gg (Shaun/Spielrahoo, 2023-01-26; 648 pods): seat 1 31.5%, seat 4 20.2%. Draftsim tier list (2026-10-02): of the S/A+ commanders only Godo (Helm of the Host extra-combat combo) and Yuriko are combat-based. metatierlist cEDH list (2024-03-16, page dated Oct 2026): Najeela/Kraum/Thrasios/Tymna S+; Winota S; Yuriko, Magda, Godo A.
- **Turn numbers people state:** WotC B4 = 4+ turns (satisfied if it ends on turn 5); farseek: most B4 games end turns 4–6; bluecore: 4–7; nerdleagues: wins by turn 5–7, sometimes 4; spellweave (generic): high-power decks win turns 6–8; EDHREC Matt Morgan (2025-10-22): the four-turn promise "starts to feel close" in real games; EDHREC cEDH guide: cEDH turns 3–7; EDHMeta: cEDH threats on turn 2; Draftsim Yuriko (cEDH-adjacent): wins turns 5–8. A search summary claimed cEDH games average four turns and mostly end turns 2–5, attributed to the EDH fandom wiki, which could not be opened (**not verified**).
- Practical reading: at B4, combo and instant-speed alternative wins are far over-represented relative to the ~6% casual baseline (every B4 sample list examined packs Thassa's Oracle lines or infinite mana), but combat still decides many B4 games — SCG's B4 Brawl featured infect and treasure-aggro decks, and Winota/Yuriko/Magda-style combat decks persist even in cEDH results.

---

## 4. Aggressive / creature-based decks at Bracket 4

### 4a. Why pure go-wide aggro struggles against three opponents

- nerdleagues "How to Build an Aggro EDH Deck for Multiplayer" (DonSpider, 2026-07-03): you must deal 120 damage, not 20; for every card you draw "your opponents collectively draw three"-style resource math (same point in CoolStuffInc, Levi Perry, 2024-10-02); a single wrath undoes several turns; low-value cards recover badly.
- edhmatch.com aggro strategy page (undated): board wipes erase development, pillow-fort and lifegain outlast early pressure, late-game topdecks of cheap creatures are weak.
- MTGSalvation thread "Viability of Aggro in Multiplayer" (2011-09): overextension, political ganging-up on the first aggressor, damage diluted across 40-life opponents; aggro must be tight in build and "piloted very tightly".
- Draftsim cEDH guide / EDHREC cEDH guide: at the top end, combat wins are rare because opponents' protection goes to counterspells and games end on the stack.

### 4b. What makes aggro work at high power (mechanisms)

- **Commander damage (21):** CoolStuffInc Voltron ranking (Julian Sison, 2026-06-12) — Voltron excels at "taking out one opponent at a time", so hexproof/evasion and protection are mandatory and the vulnerability window between kills is the main weakness; EDHREC Girten — Voltron "has a chance to fizzle out when the table teams up", mitigated by counterspell protection and faster pump.
- **Infect/poison:** EDHMeta (Glacius, 2026-05-04) — ten counters replace 40 life, so a 1-power infect creature is "10% of a player's total 'health'"; bypasses lifegain; commanders Atraxa (double proliferate), Tekuthal, Fynn, Skithiryx, Vishgraz; weaknesses: draws the table's hate, dies to removal, thin card pool. SCG ran an Atraxa infect list as a B4 deck (35 lands, 25 infect creatures, 20 instants). Draftsim's infect list says Skithiryx handles itself at B4 with added fast mana (search snippet only — **not verified**).
- **Extra combats:** Draftsim (Pedro Furtado, 2026-08-31) — extra combats let one board "hit a player multiple times" or hit everyone hard; Godo is a one-card combo with Helm of the Host; Najeela, Isshin, Xenagos, Kaalia, Moraug, Aurelia, Pako, Gilgamesh listed.
- **Damage doublers / multipliers:** Wolverine (doubles own damage), Lightning Army of One (doubles damage to the hit player), Tifa Lockhart (power doubling on landfall), Xenagos (haste + doubling) — Draftsim/CoolStuffInc Voltron and extra-combat lists (2026).
- **One-sided board wipes:** Draftsim board-wipe ranking (2026-03-23) — Cyclonic Rift, Plague Wind, Winds of Rath, Kindred Dominance, Hour of Reckoning, Raise the Palisade, Everything Comes to Dust act as a "catch-up mechanism" and finisher for creature decks.
- **Haste / evasion / anthems / attack-trigger payoffs:** edhmatch — deploy cheap creatures before engines stabilise, use anthems, haste and attack triggers so small bodies scale, convert combat into card advantage; CoolStuffInc aggro staples — Reconnaissance, Iroas, True Conviction, Curse of Opulence, Grim Hireling/Professional Face-Breaker, Ohran Frostfang, Heroic Intervention/Teferi's Protection, Sword of the Animist, Aurelia, Boros Charm.
- **Build rules of thumb:** nerdleagues — average MV ≤2.8, 10–12 ramp (lean low), win by turns 7–8, choose commanders that are board builders, board rewarders or damage converters, and "punish your opponents for not interacting immediately"; airza.net ("How to Win in Commander", URL dated 2025-03-13) — cheap creatures force opponents to spend mana on removal instead of engines, 15+ instant-speed interaction, avg CMC 1.86, 2–3-mana commanders, "The point of your engine is to win the game."; high-MV permanents are traps; board wipes hurt unless you have an alternate win.
- **Kill one player, then race:** airza.net — the "you can only kill one player at a time" objection is overstated because the other players pile onto whoever you pressure; tappedout thread "Kill 1 opponent fast vs spreading out" (2023-01/02) — focusing one player removes a third of the table's removal and counterplay, but whether it is socially acceptable depends on the group; no consensus. CoolStuffInc Voltron: sequential kills create the dangerous window.
- **Aggro-combo hybrids:** Draftsim B4 list — Winota's B4 build runs Kiki-Jiki + Village Bell-Ringer and Breath of Fury + Loyal Apprentice alongside the combat plan and deploys on turn 3 off Sol Ring/Mox Diamond/City of Traitors; Najeela goes infinite with mana; Godo + Helm; Yuriko lists add Thassa's Oracle + Consultation as the backup (Draftsim Yuriko guide). EDHREC's Winota page describes it as a cEDH stax-and-combat deck that wins without a combo (search snippet — **not verified**).

### 4c. Commanders people name as successful high-power / Bracket 4 aggro, and why

- **Winota, Joiner of Forces** (Boros): attacks cheat Humans in from the top six; turn-3 wins possible with fast mana; combo back-ups; a cEDH presence (1.0% meta, cedhstats) — Draftsim 2026-07-17, nerdleagues 2026-07-05, metatierlist.
- **Yuriko, the Tiger's Shadow** (Dimir): commander ninjutsu dodges tax, evasive ninjas plus top-deck manipulation convert into table-wide life loss (Draco = 16), wins turns 5–8, Oracle back-up; "competes at Bracket 4–5" (moxmythic 2026-06), S tier in Draftsim's tier list, A/B tier in cEDH lists; 31,816 EDHREC decks.
- **Najeela, the Blade-Blossom** (5-colour): warrior tokens + repeatable extra combats; S+ in metatierlist; nerdleagues calls it the most straightforward aggro commander.
- **Godo, Bandit Warlord** (mono-red): one-card Helm of the Host infinite combats from the command zone; A+ only because mono-red lacks interaction and "the deck can be pretty soft to removal" (Draftsim tier list).
- **Magda, Brazen Outlaw** (Rakdos): treasure/dwarf combat-combo; 2.0% cEDH meta with the best points-per-game among combat decks (cedhstats).
- **Isshin, Two Heavens as One** (Mardu): doubles attack triggers (edhmatch, Draftsim).
- **Xenagos, God of Revels** (Gruul): haste + doubling turns any body into a two-hit kill (Draftsim extra-combat list).
- **Kaalia of the Vast, Moraug, Aurelia, Pako, Gilgamesh** — extra-combat/attack-trigger engines (Draftsim 2026-08-31).
- **Narset, Enlightened Master** (Jeskai): first strike + hexproof, free extra turns/combats off attacks — #1 Voltron (CoolStuffInc 2026-06-12); **Uril the Miststalker** (hexproof aura Voltron, two hits kill) and **Rafiq of the Many** (double pump, Bant protection) — classic Voltron (MTGSalvation/search results).
- **Light-Paws, Captain America, Cloud Ex-SOLDIER, Wolverine, Ardenn, Syr Gwyn, Wyleth, Tifa** — CoolStuffInc's 2026 Voltron top ten (cheap commanders that self-equip or double damage).
- **Atraxa, Praetors' Voice / Skithiryx / Tekuthal / Fynn / Vishgraz** — infect (EDHMeta 2026-05-04; SCG B4 Atraxa list).
- **Ragavan, Nimble Pilferer** — SCG's B4 treasure-aggro list (21 creatures, 18 artifacts incl. four Swords, 33 lands).
- **Gishath, Miirym** — nerdleagues' B4 picks (attack-trigger tutoring; dragon doubling).
- **Wilson, Refined Grizzly / Karlov** — airza.net's low-curve Voltron examples claimed to beat cEDH piles.

---

## 5. Dimir (blue-black) at Bracket 4

### 5a. Which Dimir strategies are considered strongest at high power

- **Ninjas / tempo (Yuriko, Satoru Umezawa):** the consensus top Dimir strategy. moxmythic (2026-06-01/23): Yuriko never pays commander tax and is in 2,112 cEDH decks; Draftsim "47 Best Dimir Commanders" (Jake Henderson, 2026-09-20): Yuriko #1, Satoru #5 (ninjutsu to cheat fatties / reanimator-combo); turnzerohq: Yuriko is the pinnacle of Dimir evasion-tempo. Draftsim's Yuriko guide (2026-07-29) describes a list that can "win extremely quickly" and advises a Rule 0 warning. Search snippets give Yuriko ~0.56% and Satoru ~0.02% cEDH meta share (mtgdecks.net, page blocked — **not verified**).
- **Combo:** Thassa's Oracle + Demonic Consultation/Tainted Pact is a Dimir combo (second-most played combo on EDHREC); Rona (2-mana reanimator-combo), Emet-Selch, Mirko — Draftsim 2026-09-20.
- **Control / stax-ish:** Toxrill (board dissolution + card draw), Talion (passive draw tax), Lord of the Nazgûl (spellslinger tokens), Vren (opponents' deaths become an exponential rat army; "distributed threat" — search summary), Umbris — moxmythic, Draftsim, search results.
- **Theft:** Draftsim theft ranking (A.L. Walser, 2026-02-02) — Dimir is "an excellent color identity for a theft commander"; Tasha the Witch Queen (#11), Xanathar Guild Kingpin (#7, a fantastic control commander for grindy games), Gonti Canny Acquisitor (unblockable-creature payoff), Garland (theft + monarch, Draftsim Dimir list); theft is framed as grindy/midrange rather than fast.
- **Mill:** Phenax, Anowon, Captain N'ghathrod (18,594 decks), Gisa and Geralf; turnzerohq argues mill scales better in Commander because it hits three opponents at once; the older Hipsters primer warns mill is slow enough that aggressive decks take over first.
- **Reanimator / graveyard:** Scarab God, Wilhelt (22,621 decks), Araumi, Golbez, Mirko — EDHREC Dimir page (read 2026-10-05), Draftsim.
- EDHREC Dimir popularity (2026-10-05): Yuriko 31,816; Wilhelt 22,621; Captain N'ghathrod 18,594; Alela Cunning Conqueror 17,965; Lord of the Nazgûl 15,220; Satoru 14,666; The Scarab God 14,385; Jon Irenicus 12,946; Golbez 12,884; Vren 12,867; Umbris 11,541; Mirko 9,358; Phenax 9,243; Marvo 9,137; Toxrill 9,048; Talion 7,985; Gisa and Geralf 7,893; Anowon 7,116; Tasha 5,954.
- Structural notes: Dimir has both best card-advantage colours and layered interaction (counters, removal, discard) but "the single biggest hole" is enchantment removal, ramp is thin, and one-for-one removal struggles against wide boards (turnzerohq, 2026; Hipsters 2020). turnzerohq calls Dimir "the easiest two-color identity to build badly".

### 5b. Common opinion on Dimir aggro

- Hipsters of the Coast "Commander Primer: Dimir" (Travis Norman, 2020-07-01): no Craterhoof/Aurelia-type finisher; the creature quality drops fast — "After Baleful Strix, the list falls off dramatically"; creatures are tools, so a creature plan needs a tribe (Zombies, Ninjas, Faeries) or stealing/copying opponents' creatures.
- turnzerohq Dimir guide (2026): pure creature beatdown is dismissed; only evasive bodies (flying, menace, unblockable) are recommended.
- moxmythic (2026-06): aggro exists in Dimir but is not the pair's strength; Yuriko is the closest thing, and even she wins through evasion plus top-deck burn rather than raw creature pressure.
- Draftsim Yuriko guide: tempo strengths are free counterspells, explosive damage scaling and incidental card advantage; weaknesses are early wipes, political targeting of the obvious threat, and set-up turns.
- Draftsim Etrata, Deadly Fugitive guide (A.L. Walser, 2024-03-28, upd. 2025-01-18): a 36-land, 30-creature midrange assassin-typal deck with Cyclonic Rift/Toxic Deluge as defence, not tuned for cEDH; an Archidekt estimate for one public Etrata build is Bracket 2 (search snippet).
- Net reading: the community treats Dimir creature-aggro as viable at B4 only when it is really evasion-tempo with free counterspells, cheap commanders and an instant-speed back-up win (Yuriko model), not go-wide beatdown.

---

## 6. Brackets and the social contract (what matters for how the deck is built)

- WotC 2025-02-11: B4 is the "go wild" bracket — expect explosive starts, strong tutors, cheap game-ending combos, mass land destruction and GC-dense decks; games can end quickly; the pregame conversation (GC count, combos) is how you get agency.
- WotC 2025-10-21: at B4 everybody intends to win and is "ready to play against anything" (infographic); the four-turn figure is a satisfaction threshold; Rule 0 can still adjust things at every level except cEDH.
- WotC 2026-02-09 and format page: brackets guide conversation and are not an arbiter; B4–5 are the higher-power/competitive experiences; intent matters most.
- commanderbrackets.com (2026-06-10): expect ruthless, consistent decks; interaction needed from turn one; threat assessment never stops; FAQ — a B4 deck at a B2 table "will simply win"; adjacent mixing (B3 + B4) is acceptable if disclosed.
- commanderdeckmaker.com Rule 0 page (undated): pregame checklist — state your bracket, disclose surprises (infinite combos, stax, extra turns, land destruction), ask about sensitivities, respect boundaries; many groups extend the no-MLD norm to B4 voluntarily; kingmaking frowned on; scooping at instant speed to deny triggers is bad form.
- Commander's Herald (Charlotte Sable, 2025-02-16): brackets are "a shorthand to help kickstart that conversation"; you still need the talk.
- EDHREC (Matt Morgan, 2025-02-11): the social contract persists at B4 even though decks are built to win; (2025-10-22) removing tutor limits removes the whataboutism from the conversation.
- manaclub (Jake Browne, 2025-02-12): "Four is a mixed drink." (three = wine, cEDH = grain alcohol); brackets are mainly for random LGS/convention pods.
- EDHREC (Cas Hinds, 2026-06-22): because B4 and off-meta cEDH are hard to tell apart on paper, Rule 0 remains the deciding tool.
- tappedout "kill one opponent" thread (2023): focusing a player is strategically correct but social acceptability is playgroup-dependent.
- Deckbuilding consequences stated or implied by these sources: (1) build for the *best* hand, not the average (bluecore); (2) assume turn-1/2 interaction and free counters exist on every side (commanderbrackets, bluecore); (3) do not rely on mercy or politics — pods are expected to answer the obvious threat, so a combat deck needs protection, redundancy and an instant-speed finish (Girten, Sison, Draftsim Yuriko); (4) disclose combos/MLD even though legal (commanderdeckmaker, WotC). The phrase "no mercy" or any equivalent official statement was not found (**not verified**).

---

## Sources (all read 2026-10-05)

Official (Wizards of the Coast / Commander Format Panel)
- https://magic.wizards.com/en/news/announcements/introducing-commander-brackets-beta (2025-02-11)
- https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-april-22-2025 (2025-04-22)
- https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025 (2025-10-21)
- https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-february-9-2026 (2026-02-09)
- https://magic.wizards.com/en/formats/commander (official brackets + Game Changers page; undated, read 2026-10-05)

Reference / list trackers
- https://mtg.wiki/page/Game_Changers (list version 2026-02-09)
- https://mtg.wiki/page/Commander_Brackets (infographic transcription; cites Gavin Verhey tweet 2025-02-13 and Rachel Weeks post 2025-10-21)
- https://commanderbrackets.com/changelog (reviewed 2026-06-10)
- https://commanderbrackets.com/game-changers (reviewed 2026-06-10)
- https://commanderbrackets.com/bracket-4 (reviewed 2026-06-10)
- https://commanderbrackets.com/faq (2026-06-10)
- https://playgroup.gg/commander/game-changers (2026-10-05)
- https://edhrec.com/combos/dimir/742-1295 (Demonic Consultation + Thassa's Oracle; read 2026-10-05)
- https://edhrec.com/articles/commander-bracket-combo-voting-returns (Nick Wolf, 2026-04-08)

Bracket 4 deckbuilding articles
- https://edhrec.com/articles/the-difference-between-bracket-4-and-cedh (Cas Hinds, 2026-06-22)
- https://edhrec.com/articles/adapting-your-decks-to-the-optimized-bracket-4 (Jeff Girten, 2025-04-28)
- https://archidekt.com/articles/edhrec/adapting-your-decks-to-the-optimized-bracket-4/bracketology (Kalamax B4 list stats)
- https://www.coolstuffinc.com/a/nigelkurtz-seo-11262025-building-to-bracket-4-in-commander (Nigel Kurtz, 2025-11-26)
- https://www.threeforonetrading.com/en/building-for-every-bracket (Ben Guilfoyle, 2025-12-19)
- https://bluecore.cards/en/blog/bracket-4-optimized-explained (2026-07-03, upd. 2026-08-19)
- https://farseek.ai/blog/commander-brackets-explained (reviewed June 2026)
- https://scrollvault.net/guides/commander-brackets.html (2026-10-02)
- https://scrollvault.net/tools/commander-bracket/ (2026-10-04)
- https://deckcipher.com/commander-bracket-4-checker (reviewed 2026-08-06)
- https://mtgmaster.app/commander-guides/how-to-build-a-high-performing-bracket-4-commander-deck (2026-04-21)
- https://draftsim.com/mtg-bracket-4-commander/ (David Royale, 2026-07-17; decklists counted by me)
- https://www.nerdleagues.com/blog/best-commanders-for-bracket-4-optimized-decks (DonSpider, 2026-07-05)
- https://articles.starcitygames.com/magic-the-gathering/commander-vs-491-bracket-4-brawl/ (2026-06-14/15)
- https://commandersherald.com/commander-brackets-your-deck-is-more-than-a-number/ (Charlotte Sable, 2025-02-16)
- https://edhrec.com/articles/wotc-introduces-new-bracket-system-for-edh (Matt Morgan, 2025-02-11)
- https://edhrec.com/articles/wizards-of-the-coast-commander-brackets-update-for-october-2025 (Matt Morgan, 2025-10-22)
- https://witchphd.substack.com/p/stop-playing-bracket-3 (2025-11-07)
- https://manaclub.substack.com/p/25-brackets (Jake Browne, 2025-02-12)
- https://www.mtggoldfish.com/articles/commander-brackets-and-game-changers (2025-02-11; deckbuilder integration only)
- https://podcasts.apple.com/au/podcast/whats-up-w-bracket-4-731/id898023861?i=1000755807465 (Command Zone ep. 731 show notes, 2026-03-17) and https://www.youtube.com/watch?v=jzeTz9clIC8 (same episode; description only)
- https://www.youtube.com/watch?v=EOqPJsY6rQk (Nitpicking Nerds, "The Complete Guide to High Power Commander (Bracket 4)", 2026-05-17; title/description only)

cEDH baselines and data
- https://draftsim.com/cedh-mtg/ (Jake Henderson, 2026-05-25)
- https://edhmeta.com/cedh-deck-guide-transitioning-from-casual-to-competitive-commander/ (Crumblier, 2026-05-27)
- https://edhrec.com/guides/intro-to-cedh (Callahan Jones, undated)
- https://www.nerdleagues.com/blog/how-cedh-decks-win-games-2026 (2026-06-15)
- https://scrollvault.net/guides/commander-land-count-data.html (simulation study, 2026-09)
- https://edhrec.com/articles/superior-numbers-land-counts (Dana Roach, 2019-02-20)
- https://cedhstats.org/commanders (6-month window, read 2026-10-05)
- https://stats.cedh.events/ (last-30-days window, read 2026-10-05)
- https://topdeck.gg/articles/first-player-adv-silicon-dynasty (Shaun/Spielrahoo, 2023-01-26)
- https://draftsim.com/commander-tier-list-mtg (Ilija Miljkovac, 2026-10-02)
- https://metatierlist.com/cedh-tier-list-best-commanders/ (2024-03-16, page header Oct 2026)
- https://playgroup.gg/metagame/2026/march (published 2026-04-21)
- https://playgroup.gg/metagame/2026/may (published 2026-06-02)
- https://playgroup.gg/metagame (index, through August 2026)
- https://playgroup.gg/commander/power-level (2026-10-05)
- https://playgroup.gg/commander/bracket-calculator (undated)
- https://tappeddecks.com/blog/commander-deck-template-ratios (2026-08-25) and https://spellweave.app/guides/commander-deck-building (2026-04) — generic templates
- https://edh.fandom.com/wiki/Command_Zone_Template (Command Zone template summary; via search)

Aggro / Voltron / infect
- https://www.nerdleagues.com/blog/how-to-build-an-aggro-edh-deck-for-multiplayer (DonSpider, 2026-07-03)
- https://www.coolstuffinc.com/a/leviperry-seo-10022024-staples-for-aggro-in-commander (Levi Perry, 2024-10-02)
- https://www.edhmatch.com/strategies/aggro (undated)
- https://draftsim.com/mtg-extra-combat-commander/ (Pedro Furtado, 2026-08-31)
- https://www.coolstuffinc.com/a/top-ten-voltron-commanders-06122026 (Julian Sison, 2026-06-12)
- https://draftsim.com/mtg-board-wipes/ (2026-03-23)
- https://edhmeta.com/infect-in-commander-the-fastest-way-to-kill-the-table/ (Glacius, 2026-05-04)
- https://airza.net/2025/03/13/how-to-win-in-commander-attack-your-opponents-until-they-die (John; URL date 2025-03-13)
- https://tappedout.net/mtg-forum/kitchen-table/edh-kill-1-opponent-fast-vs-spreading-out-the-dmg-evenly/ (2023-01/02)
- https://www.mtgsalvation.com/forums/the-game/commander-edh/198545-viability-of-aggro-in-multiplayer (2011-09)

Dimir
- https://moxmythic.com/blog/best-dimir-commanders-edh (2026-06-01, upd. 2026-06-23)
- https://draftsim.com/blue-black-commanders-mtg/ (Jake Henderson, 2026-09-20)
- https://draftsim.com/yuriko-commander-deck/ (Alex Barker, 2025-01-07, upd. 2026-07-29)
- https://draftsim.com/mtg-theft-commanders/ (A.L. Walser, 2026-02-02)
- https://draftsim.com/etrata-edh-deck/ (A.L. Walser, 2024-03-28, upd. 2025-01-18)
- https://www.hipstersofthecoast.com/2020/07/commander-primer-dimir/ (Travis Norman, 2020-07-01)
- https://turnzerohq.com/guides/colors/dimir (2026, undated)
- https://edhrec.com/commanders/dimir (read 2026-10-05)

Social contract
- https://commanderdeckmaker.com/learn/brackets/rule-zero (undated)

## Not found / not verified

- **Reddit threads (r/EDH, r/CompetitiveEDH):** none could be read. reddit.com is blocked for the search/fetch crawler, curl is redirected to a login page, third-party mirrors returned 429/empty, and the browser pane refuses old.reddit.com. No Reddit claims are included above.
- **Command Zone ep. 731 and ep. 657 ("Brackets Are Here! Will They Work?")**: only titles/show notes available; no transcript (YouTube caption endpoint returned empty). Patreon post "Commander Players are Sleeping on Bracket 4" blocked (403).
- **Nitpicking Nerds Bracket 4 guide:** title, channel and date only; no transcript.
- **commandertemplate.com Academy "Bracket 4"** (Cloudflare challenge): the "average Bracket 4 deck plays 5 Game Changers" claim is from a search snippet only.
- **EDH fandom wiki "Competitive EDH"** (403/402): the "cEDH games average four turns, most end turns 2–5" statement is unverified.
- **mtgdecks.net Dimir meta shares** (403): Yuriko ~0.56%, Satoru ~0.02%, Silas Renn 3.41% are search snippets only.
- **EDHREC Winota page** ("stax-and-combat deck that wins without a combo") and **Draftsim infect list** ("Skithiryx can handle itself in bracket 4"): snippets only, pages not fetched.
- **TCGplayer "Optimal Mana Curve and Land/Ramp Count"**: page requires JavaScript; not read.
- **April 2025 Game Changers total:** my count is 61 cards; the fetched summary said 56 and commanderbrackets.com says ~63 — exact count not reconciled.
- **Bracket 3 turn-6 qualifier:** whether the October 2025 infographic attaches "before turn 6" to extra-turn chaining or to two-card combos could not be confirmed from the article text (see 1b).
- **B&R dates 2026-06-29 and 2026-08-10 "no changes":** from a search summary only.
- **Bracket-specific win-condition shares or average game length for Bracket 4:** no dataset found (Playgroup.gg pools all brackets; cEDH sites publish seat/commander stats, not win-turn distributions).
- **Bracket-4-specific average mana value target:** not found in any source.
- **Deadly Rollick:** not discussed in any source read.
- **"No mercy"-style official wording about Bracket 4 expectations:** not found.
- **Draftsim Prossh and Animar Bracket 4 lists:** page content incomplete when parsed; counts omitted.
