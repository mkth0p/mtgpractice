# Bracket 4 piloting and aggressive creature decks in 4-player Commander — source notes

Read-only web research, all sources read on **2026-10-05**. Inline tags like `[S12]` point to the numbered
**Sources** list at the end (URL + date read). Claims that rest only on a search-engine snippet of a page I could
not open are marked **(snippet only)**; my own inferences are marked **(synthesis, not from a source)**.
Reddit (r/CompetitiveEDH, r/EDH) was not reachable from this environment (HTTP 403 for both curl and the fetch
tool), so no Reddit claims are included — see "Not found / not verified".

---

## 0. Context: what "Bracket 4 (Optimized)" means

- WotC's October 2025 bracket update describes Bracket 4 decks as "lethal, consistent, and fast"; players should
  expect to get at least four turns before someone wins or loses; Game Changers at this level are typically fast
  mana, snowballing resource engines, free disruption and tutors; win conditions are varied but efficient; it is
  explicitly *not* the cEDH metagame, which is reserved for Bracket 5; roughly two fewer turns than Bracket 3. [S7]
- Bracket 4 is the best version of a specific idea, versus Bracket 5 which is built against a living
  tournament metagame. Expect 4–7 turn games with interaction from turn one or two and counterspells early and
  often. Quote: "Stack politics matter. You'll want answers, not just threats." [S8]
- Brackets 4–5 have no deckbuilding restrictions beyond the ban list (lower brackets restrict mass land denial,
  early two-card infinite combos and chained extra turns). The Game Changers list (as reproduced by Draftsim,
  Feb/Mar 2026) includes Thassa's Oracle, Underworld Breach, Ad Nauseam, Necropotence, Rhystic Study, Force of
  Will, Fierce Guardianship, Cyclonic Rift, Demonic Tutor, Vampiric Tutor, Mana Vault, Mana Crypt, Chrome Mox,
  Drannith Magistrate. [S10]
- A Bracket-4 commander list (nerdleagues, July 2026) characterises the bracket as games "decided within about
  four turns" with fast mana, tutors and Game Changers run freely, and recommends Winota, Gishath, **Yuriko**,
  Tergrid and Miirym — i.e. combat/typal/theft commanders are considered viable B4 choices. [S9]

---

## 1. Piloting at high power

### 1.1 Threat assessment — who to attack, what to answer

- Attack the player set up for the longest game (blue/green value decks). Quote: "You should attack the player
  looking to play the longest game". Remove card-advantage and mana engines (Rhystic Study-type), combo pieces,
  and whatever specifically stops *your* plan; life totals mostly represent *time*, not threat level; threat
  assessment is dynamic — a threat does not need answering just because it appeared once. [S2]
- Command Zone ep. 652 (Jan 2025) structures the decision as: who to chip-damage, who to pressure, who to
  eliminate first, who to ally with, whether to use interaction now, whether to hold up mana, who is the threat,
  and "am I the threat?" — framed as a trainable skill. [S13]
- In cEDH, the key moments are fundamental turns (actual win attempts). Don't spend interaction on early
  Mystic Remora / Sol Ring (a turn-1 Remora adds maybe ~15% win equity to that player — your personal loss is
  small and your answer mostly helps the other two). Counter only what wins or makes a win inevitable, or a stax
  piece that blocks your own line. If you are clearly ahead you must answer; if behind, let the leaders fight.
  Summary advice: "let people cast spells". [S4]
- Same idea from EDHREC's cEDH guide: don't counter unless someone is explicitly winning or about to; play to
  your seat (earlier seats have a resource edge); combat is largely irrelevant in cEDH except vs Winota or a
  heavy stax deck. [S11]
- A core cEDH skill is knowing when *not* to interact: spending your only answer on the second scariest thing is
  how you die to the scariest thing (search summary of [S6]/[S11]-type guides; the formulation itself is from the
  search summary, not a page I opened — **snippet only**).
- Combat-specific threat assessment (Commander's Herald, "Combat in cEDH"): attack the player whose plan uses
  life as a resource (Ad Nauseam, Sylvan Library, Bolas's Citadel) to shrink their draw spells; eliminating a
  player removes their interaction from the table before your combo; sometimes kill two players together so
  neither can stop you; point out threats aloud to steer the table's attacks; stax decks should pressure blue
  decks (their stax already handles turbo). Author's claim: cEDH players leave "wins on the table" by ignoring
  combat. [S1]
- Slower (turn 4–5) metas: countermagic should be the core of your interaction; interaction can be deployed at
  any point of a threat's existence, not only on the stack; widen removal to hit noncreature engines (The One
  Ring, Rhystic Study). [S12]
- Table talk: ask "is this a point where I should interact?" — vocalising improves play quality; last seat in
  turn order is hardest to win from. [S6]
- The attacker's view (airza, Mar 2025): choose targets by the game's flow — one player dominating → everyone focuses
  them; two players fighting → let them, don't wipe; balanced early game → attack on long-term threat. Focused
  removal "gives you more attack steps". [S17]

### 1.2 Mulligans at cEDH / Bracket 4

- Sperling (TopDeck): in cEDH, mulligan is the *default*; the question is whether there is a valid reason to
  keep. Priority of
  reasons: (1) truly broken starts (T1–2 Mystic Remora, Rhystic Study, Ad Nauseam) justify keeping an otherwise
  weak hand; (2) development = fast mana plus a real threat — quote: "Mana isn't the only thing, but it's the one
  to prioritize." Below the breakpoint: (3) interaction alone is not a reason to keep (it's a shared table duty);
  (4) card draw without development is a trap; (5) avoiding a merely non-functional hand is irrelevant because losing
  big and losing slightly are the same. You are racing three hands, and seat position changes evaluation. [S3]
- EDHREC cEDH guide: mulligan aggressively (the London mulligan is described as extremely strong); a keep must
  have a *plan* (land commander, tutor the piece), not just a curve. [S11]
- Baumann: mulligan to hands that break Magic's baseline rules; format averages five turns ± two. [S5]
- Blue Farm (Tymna/Kraum): mulligan ruthlessly to a hand that executes a plan known to work against *this* pod;
  the commanders' card draw makes aggressive mulligans affordable. [S56]
- Deck-specific keeps for aggressive Dimir: Yuriko wants a 0–2-mana evasive creature by turn 2 and the mana to
  deploy Yuriko by turn 3 (Draftsim) or turn 2 (Learn cEDH). [S51][S52] Etrata, the Silencer lists want a 1–2
  mana Assassin or Lightning Greaves in the opener (Moxfield primer, **snippet only**).
- Generic high-power heuristic (non-cEDH guides): keep 2 lands + ramp + a plan, or 3+ lands and an early engine;
  ship hands missing colours, mana or a plan (search summary of mulligan guides — **snippet only**).

### 1.3 Sequencing: develop vs hold up, wraths, overextension, commander protection

- Development (mana first, then key permanents) outranks interaction in cEDH; interaction is a *shared*
  responsibility — you only need your share. [S3][S4]
- Don't overextend into wraths: keep 2–3 creatures that actually pressure, hold the rest to rebuild; prefer
  sticky/value creatures; hold counterspells to protect an established board; diversify into noncreature threats
  (equipment, enchantments, planeswalkers) so a wrath doesn't end you. [S16]
- Aggro deckbuilding insurance: wipe protection (Teferi's Protection, Selfless Spirit), token redundancy, curve
  ≤ 2.8, 10–12 ramp pieces, draw that rewards evasion or makes Treasure. [S22]
- Satoru Umezawa guide: "One powerful threat is usually enough" — keep re-applying pressure after removal and
  sweepers rather than dumping the hand. [S54]
- Lathril guide: hide the drain plan until you can execute (once seen, the commander gets removed), keep
  interaction for wraths, don't overcommit elves. [S45]
- Voltron guide: don't cast the commander until you can immediately protect and suit it up; removal of the
  commander also wastes everything attached; extra combats are "necessary to close before the table coordinates
  your removal". [S27]
- Krenko guide: haste/protection (Swiftfoot Boots, Goblin Motivator) and wipe-proof damage (Pashalik Mons,
  Goblin Bombardment) are the insurance pieces. [S43]
- Yuriko: hold counterspells defensively on turns you cannot attack safely; ninjutsu returns evasive creatures
  to hand, which also dodges sorcery-speed removal (Draftsim); commander ninjutsu bypasses commander tax
  (EDHREC). [S51][S50]
- Resource-efficiency yardstick (Baumann): cards should stop wins at 1 mana, set them up at 2, generate advantage
  at 3, or win at 4+; value repeatable-trigger cards (at / each / whenever) over one-for-ones. [S5]

### 1.4 Tempo and pressure; life as a resource (3 × 40 = 120)

- Pure 1v1 tempo (threat + cheap bounce/counter) fails against three opponents; what works is small evasive
  creatures + draw-on-hit (Edric, Derevi, Sygg) + ~20 single-target answers and careful threat prioritisation;
  effectiveness drops as pod size grows. [S18]
- Attacker's case: the point of an engine is to win, not to make resources; aggro pressure = damage pressure +
  cheap (1–3 mana) disruption that taxes 5+-mana engines; life is time and chip damage forces opponents to block
  or to plan around a faster clock; run 15+ instant-speed interaction and 2–3 mana commanders; the author admits
  this is less effective against optimised cEDH combo. [S17]
- cEDH combat as a tempo tool: Yuriko and Tymna are midrange decks that use combat to accrue value; Mardu Tymna
  adds Grim Hireling / Professional Face-Breaker to convert combat into mana and cards. [S1][S56]
- No room for dawdling: combat decks in cEDH (Yuriko = tempo, Najeela = warrior synergy) must be fast or get
  punched out by combo. [S11]
- The 120-life problem is restated everywhere: 120 damage vs 20, and "for every card you draw, your opponents
  collectively draw three". [S22][S23]

### 1.5 When to "go for it"

- Try to win when a window appears: "Try to win. If it works, it works. If it fails, try to figure out why";
  read opponents' resource depletion and available interaction first. [S11]
- Baumann: because any win attempt is 3-v-1, the first player to go for it usually loses — aim to win second or
  third; use hidden information like a magic trick. [S5]
- Sam Black: the strongest early start gets checked by table cooperation; a dominant early player attracts all
  three opponents' answers — a self-correcting system. [S4]
- Commander's Herald beginner guide notes the same: when someone goes for it, the other three must cooperate to
  survive the turn (search summary of [S6] — **snippet only**).

### 1.6 Multiplayer dynamics: first big threat, archenemy, politics

- The archenemy effect: the first player to present a major threat gets ganged up on; mitigation is to let
  others present the first threat, to pack protection (counters, wipes, protection spells), and to partner with
  players who are behind against the leader. [S2]
- Sheldon Menery's politics taxonomy: friendly agreements, not-so-friendly agreements vs a common threat,
  precisely-worded contracts, "let's get 'em" coalitions built on convincing the table who the threat is, and the
  strategic scoop (which he condemns). Rule: never break an agreement. [S14]
- Older forum consensus on avoiding the archenemy seat: build incrementally rather than explosively, don't flash
  explosive cards early, look fallible, spread damage when ahead so no coalition forms, and keep a deterrent
  (Nevinyrral's Disk-type) on board. [S15]
- Baumann: over-communicate with temporary allies, manipulate attention (wince at opponents' plays), quote: "Be a
  player to whom losing is a pleasure". [S5]
- Deck-type consequences: Voltron and infect make you public enemy number one; infect guides recommend
  pillowfort pieces (Ghostly Prison, Propaganda) to survive the resulting hostility. [S27][S28]
- Focus-fire vs spread (2018 thread): latching onto one player is "good politics" because provoking one opponent
  is more survivable than provoking three, but focused kills breed resentment; archetype dictates — aggro needs
  early kills, control can wait. [S25]
- Kill-all-at-once vs sequential (2012 thread): simultaneous kills leave no time to respond or gang up;
  sequential suits control/Voltron; no consensus. [S26]

---

## 2. Why pure combat aggro is weak in 4-player EDH — and the counter-arguments

### The case against
- Arithmetic: three opponents at 40 = 120 damage, versus 20 in a duel; each of your draws is matched by three
  opposing draws. [S22][S23]
- Politics: attacking one player draws their retaliation while the other two develop; combo/control can build
  quietly without drawing aggression, creatures cannot. [S19]
- Wraths are ubiquitous and valuable in multiplayer, so committing a big creature presence is punished;
  overextension is the classic aggro failure mode. [S20][S21]
- Social pressure to spread damage evenly means an aggro deck may need to deal 60+ before it is allowed to
  finish anyone (search summary of [S21] — **snippet only**).
- Combat is largely irrelevant in cEDH: combos "can guarantee a kill on all 3 opponents" and ignore boards;
  aggro must kill sequentially and may face a fresh threat after each kill; true aggro barely exists there —
  only hybrids (Godo-Helm aggro-combo; Winota swinging for one-shot kills). [S11][S24]
- Evasion that depends on colour (fear/intimidate) is unreliable: ~47% of commanders include black or
  artifact creatures; Cover of Darkness underperformed in practice; quote: "fear and intimidate are not
  effective". [S37]
- High life totals make lifegain and pillowfort/fog decks outlast early pressure; aggro runs out of gas without
  refuelling. [S22][S29]

### The counter-arguments
- "Straight aggro doesn't really work" — but aggro with a supporting mechanic does: Voltron (21 commander
  damage), infect (10 counters), tokens + lords, creature tempo with card advantage, value fatties, focusing one
  opponent at a time. [S19][S20]
- 2011 forum view that still holds: "decks will include combo because multidimensional decks are way better"
  — i.e. aggro at high power is aggro-combo. [S19]
- Combat is underused in cEDH; in long games attacking the Ad Nauseam / Citadel player and eliminating
  interactive players is real equity. [S1]
- Aggression is underrated because players import 1v1 who's-the-beatdown theory; cheap threats plus cheap
  disruption beat 5+-mana engines at casual-to-mid tables. [S17]
- Extra combats, overruns, one-sided wipes, poison and damage doublers all exist precisely to compress the
  120-life problem (see §3). [S29][S34][S35][S28][S31]
- Aggressive commanders that work do one of three jobs: build a board (tokens), reward board presence, or
  convert a board into a kill (anthem/overrun commanders such as Jetmir). Top ranked: Winota, Edgar Markov,
  Jetmir. [S23]

---

## 3. How aggressive decks actually close games at high power — catalogue

### 3.1 Commander damage (21) / Voltron
- Why it works: 21 from one commander is a separate loss condition, so one suited-up creature can remove an
  opponent every 1–3 turns instead of grinding 40. Weaknesses: single point of failure (removal wipes the
  creature *and* the attachments), wraths, fogs/pillowfort/creature stax, lack of blockers, and the three-opponent
  problem — one kill per turn still leaves two players to coordinate. Protection package: Swiftfoot Boots /
  Lightning Greaves, Darksteel Plate, evasion (Spirit Mantle), instant protection (Boros Charm, Flawless
  Maneuver). Pilot rule: one target at a time. [S27]
- Genji Glove (colourless, {5}, equip {3}): double strike, and when the equipped creature attacks in the first
  combat it untaps and grants an additional combat — only the equipped creature untaps. EDHREC calls it the
  first colourless repeatable extra combat and cites Skithiryx / Kosei Voltron crushing the table with it. [S30][S64]
- Etrata, the Silencer's hit-counter alt-win is a Voltron-adjacent Dimir option (see §5). [S59][S64]

### 3.2 Infect / poison (10)
- Why it works: 10 counters instead of 40 life per opponent; ignores lifegain entirely; proliferate scales it.
  Weaknesses: you are targeted on sight, blockers/removal/wraths, dependence on proliferate permanents, and
  spreading counters across three players dilutes progress. Pilot rule from the guide: put at least one counter
  on everyone first (max proliferate value), then concentrate; run pillowfort to survive. Staples: Blighted
  Agent, Triumph of the Hordes, Phyresis, Venerated Rotpriest, Evolution Sage, Contagion Engine, Inexorable Tide;
  evasion via Whispersilk Cloak, Aqueous Form, Trailblazer's Boots. [S28]
- Dimir delivery: Satoru Umezawa ninjutsu-ing Blightsteel Colossus (11 infect) one-shots a player. [S54]
  Tetsuko Umezawa infect: 1-power unblockables (Blighted Agent, Phyrexian Digester) poison everyone early, then
  Flux Channeler / Staff of Compleation / Viral Drake / Karn's Bastion proliferate to kill the table at once. [S57]
- Triumph of the Hordes is called slightly unfair; quote: "many prefer not dying to poison counters" (social
  cost). [S35]

### 3.3 Extra combat phases
- Why it works: extra combats give aggro "reach" through wipes/fogs/removal and re-trigger attack/damage
  abilities, dealing lethal before the table stabilises. Cards: one-shots Relentless Assault, Fury of the Horde,
  Savage Beating, Finest Hour (white); repeatables Port Razer (up to three combats, 4 mana — note Scryfall text:
  it can't attack a player it already attacked this turn), Waves of Aggression (retrace; wants 37–38 lands),
  Moraug (landfall combats, exponential with fetches); infinite pieces Combat Celebrant + Rionya, Aggravated
  Assault with untap/mana engines. Commanders: Najeela (cEDH, WUBRG activation), Godo (tutors Helm of the Host),
  Aurelia (casual). Weaknesses: fogs/damage prevention still work, heavy mana cost, creature removal mid-chain,
  removal-heavy metas. [S29][S64]
- Exact texts (Scryfall): Combat Celebrant (exert → untap others, extra combat), Karlach (first combat: untap
  attackers, first strike, extra combat), Moraug (+1/+0 per attack this turn; landfall extra combat in main
  phase), Genji Glove (see §3.1). [S64]
- Najeela loops: Druids' Repository + five attackers; Breath of Fury (each attack makes a new Warrior to
  re-attach); sequence extra-combat spells in the second main phase so you attack once and then untap; blockers
  are the recurring problem (Safe Passage, Dolmen Gate as patches). [S53] Najeela cEDH is a combat-combo deck —
  Derevi / Nature's Will / Grim Hireling untap loops threatening turn-4 wins (TappedOut primer — **snippet only**).
- Voltron guide: extra combats are what lets one commander hit multiple opponents in one turn. [S27]

### 3.4 Damage doublers/triplers and life halvers
- Doublers/triplers turn small bodies and burn into lethal: Fiery Emancipation triples all your damage; Torbran
  makes 1/1s deal 3; Gisela halves incoming and doubles outgoing; Twinflame Tyrant is ranked #1 for being
  one-sided; multipliers stack multiplicatively. Weaknesses: symmetric versions (Furnace of Rath) help opponents,
  5–7 mana, enchantment/creature removal, and they do nothing without a damage source. [S31]
- Life halving: Heartless Hidetsugu halves every player's life; with Wound Reflection each opponent then loses
  that much again at end step, so any even-life opponent (40) dies; needs haste or to survive a turn. With a
  damage doubler instead, only even-life opponents die (odd totals go to 1), so lists fix parity with Mana
  Confluence / City of Brass or Rolling Thunder-type burn. Weaknesses: commander removal, haste dependence,
  lifegain. [S32][S33]

### 3.5 One-sided / asymmetric board wipes
- Why: they clear three opponents' boards while leaving yours — a go-wide deck's best finisher is often a wipe
  it survives. Rankings (Draftsim): Cyclonic Rift #1 (instant, flexible; mana-hungry overload); Crux of Fate
  (dragons) #15; Kindred Dominance #18 — a typal-restricted Plague Wind, black only; Plague Wind / In Garruk's Wake (9 mana,
  dead in multiples); Massacre Wurm #39 (temporary -2/-2 plus a body, not permanent removal). [S34][S38]
- Exact texts (paraphrased from Oracle): Kindred Dominance {5}{B}{B} sorcery — choose a creature type, destroy
  all creatures not of that type; Massacre Wurm {3}{B}{B}{B} 6/5 — ETB opponents' creatures get -2/-2, and each
  opponent's creature dying costs that player 2 life. [S64]
- Typal lists lean on them: an Edgar Markov deck runs Kindred Dominance and Olivia's Wrath among its four wraths.
  [S42] Etrata, the Silencer builds use *any* wipe plus Mari, the Killing Quill / Ravenloft Adventurer to exile the
  dying creatures with hit counters, setting up instant kills. [S59]

### 3.6 Overrun / anthem finishers
- Top-5 finishers (CoolStuffInc, Mar 2025): Craterhoof Behemoth (haste + trample, swing the turn it lands),
  Moonshaker Cavalry (flying, but chump-blockable), Triumph of the Hordes (4 mana, poison), Pathbreaker Ibex
  (repeatable, no haste), Earthshaker Giant. Why they work: multiply a wide board's damage in one turn.
  Weaknesses: sorcery speed, need an existing board, fogs and wraths. [S35]
- Permanent anthems: Coat of Arms is "usually a permanent overrun effect" but symmetrical and dead on an empty
  board; Obelisk of Urd (+2/+2, convoke) scales with width; Shared Animosity is the cheap combat pump. [S38]
- Finale of Devastation with X ≥ 10 pumps +X/+X and haste while tutoring (search summary — **snippet only**);
  Beastmaster Ascension as a token finisher (CommanderCast guide — **snippet only**, page unreachable).
- Elves show both halves: Ezuri's repeatable {2}{G}{G}{G} overrun turns dorks into 7/7+ tramplers, with
  Craterhoof as the tutorable end. [S46] Lathril instead converts width into a non-combat drain (tap ten elves:
  each opponent loses 10) repeated via Wirewood Symbiote / Quirion Ranger untaps. [S45]

### 3.7 Evasion for the whole team
- Blue/black mass evasion (2016 thread): Wonder (flying from graveyard), Levitation, Archetype of Imagination
  (your team flies, theirs doesn't), Sun Quan, Cover of Darkness (2-mana fear), Intimidation, Vela the Night-Clad,
  Profane Command, Dauthi Embrace (shadow, mana per creature), Filth + Urborg, Graf Harvest (zombies), Thassa,
  Akroma's Memorial, Eldrazi Monument, Cryptic Command tapping. [S36]
- Caveat: fear/intimidate are blockable by ~half the field's black/artifact creatures; colourless creatures are
  the most reliable intimidate carriers. [S37]
- High-power Dimir instead uses *individually* evasive cheap bodies: Changeling Outcast, Mothdust Changeling,
  Faerie Seer, Ornithopter, Memnite, Phyrexian Walker (Yuriko); Ornithopter, Slither Blade, Mist-Cloaked Herald
  (Satoru); Merfolk Windrobber, Ghostly Pilferer, Nighthawk Scavenger, Soaring Thought-Thief (Anowon). [S50][S51]
  [S52][S54][S58]
- Infect guides list Whispersilk Cloak, Aqueous Form, Trailblazer's Boots as the standard single-creature
  evasion package. [S28] Rogue's Passage: no fetched source evaluates it — **not verified**.

### 3.8 "Kill one player per turn" vs spreading damage
- Voltron: eliminate one player at a time; fewer live opponents = fewer removal spells pointed at you. [S27]
- cEDH combat: eliminate the player whose interaction would stop your win; occasionally kill two at once. [S1]
- Infect/poison and Tetsuko-style decks do the opposite: seed everyone, avoid becoming archenemy, then win all
  at once with proliferate. [S28][S57]
- Forum consensus: focus fire is more survivable politically and suits aggro; spreading keeps the leader in
  check but exposes you; all-at-once kills prevent retaliation. [S25][S26]
- Pilot's flow rule: pressure the runaway leader; if two players are fighting, let them. [S17]

### 3.9 Aggro-combo hybrids (aggro deck + compact backup combo)
- The standard answer to "aggro doesn't work": aggro decks at high power carry a compact combo. Examples with
  sources:
  - Yuriko: natural reveal-damage clock plus Thassa's Oracle + Demonic Consultation / Tainted Pact, or a Doomsday
    pile of five high-MV cards flipped by Ninja triggers (also an Oracle pile). [S50][S51][S52]
  - Najeela: infinite combats (Derevi, Druids' Repository, Nature's Will, Grim Hireling, Breath of Fury). [S29][S53]
  - Godo: tutors Helm of the Host for infinite combats. [S29][S24]
  - Krenko: Krenko + Thornbite Staff + Skirk Prospector (sac a Goblin for R, Staff untaps Krenko) = infinite
    Goblins, red mana and damage with any outlet; also Umbral Mantle / Mana Echoes lines. [S44][S43]
  - Wilhelt zombies: Gravecrawler + Rooftop Storm (or Phyrexian Altar) + Ashnod's Altar with Diregraf Captain /
    Bastion of Remembrance; Poppet Factory lines. [S49]
  - Lathril: tap-ten drain plus untappers as a non-combat kill; Shaman of the Pack / Skemfar Shadowsage drain. [S45]
  - Slivers: The First Sliver + Food Chain (infinite cascade → Oracle/Lab Man/Jace or spell loops); combat is
    irrelevant in that build — the only competitive sliver deck. [S47] A Living End cascade build "works almost
    half the time" and otherwise wins with evasive sliver lords. [S48]
  - Tymna/Kraum: midrange combat value into Oracle / Underworld Breach. [S56]
  - Satoru, the Infiltrator: free-creature card draw into Oracle + Consultation/Pact; Bolas's Citadel +
    Aetherflux Reservoir as a second angle. [S55]
  - Heartless Hidetsugu + Wound Reflection (Rakdos). [S32]
- Why it works in multiplayer: a combo can kill all three opponents at once, where combat kills sequentially
  and the next opponent gets a free turn. [S24] Weakness: at Bracket 4 the usual Dimir backup (Thassa's Oracle,
  Underworld Breach) is a Game Changer and may be socially gated — Draftsim's Yuriko guide notes some groups
  exclude Oracle/Consultation entirely. [S10][S51]

---

## 4. Typal (tribal) go-wide decks at high power

### How each actually wins
- **Edgar Markov (Vampires)**: eminence tokens every Vampire cast, four creature lords (Edgar, Charmed Groom;
  Stromkirk Captain; Captivating Vampire; Legion Lieutenant), "lords on bodies" over enchantment anthems, eight
  spot removal + four wraths (Ruinous Ultimatum, Kindred Dominance, Damn, Olivia's Wrath); the plan is stated as
  jam creatures, avoid walking into wraths, attack. Ranked #2 aggro commander overall. [S42][S23] Widely
  described as high-power but not cEDH-viable unless built very low-curve (TappedOut cEDH primer — **snippet
  only**). Shared Animosity / Coat of Arms as its finishers: search summaries only — **snippet only**.
- **Krenko (Goblins)**: exponential token doubling; close with combat width, Coat of Arms / Obelisk / Shared
  Animosity (**snippet only** for the cEDH primer), ETB damage (Impact Tremors / Purphoros — **snippet only**),
  Cavalcade of Calamity / Raid Bombardment / Throne of the God-Pharaoh, Goblin Bombardment at instant speed,
  Burn at the Stake, and the Thornbite Staff / Umbral Mantle infinite lines; protect Krenko (Boots) and keep
  wipe-proof damage (Pashalik Mons). The fetched Draftsim list is deliberately bracket 2–3; the combo lines are
  what make it bracket 4. [S43][S44]
- **Elves (Lathril / Ezuri)**: dork mana → 10–20 elves → Lathril drain repeated with untappers, or Ezuri overrun
  activations / Craterhoof; weaknesses: commander removal, wraths, little interaction; Lathril guide rates its
  list bracket 3, Ezuri list "moderately competitive". [S45][S46]
- **Slivers**: competitive = The First Sliver Food Chain combo; combat slivers are the casual plan. [S47][S48]
- **Zombies (Wilhelt)**: Gravecrawler loops with Diregraf Captain drain, or go-wide with Undead Warchief /
  Liliana's Mastery and token doublers (Reflections of Littjara). [S49]
- **Ninjas (Yuriko)**: see §5 — the "lord" is the commander's trigger, and the wincon is life loss, not combat
  damage per se. [S50][S51]
- Typal decks in general "mimic aggro": build an army and swing; they lose to wraths and to removal aimed at
  lords; recursion (Patriarch's Bidding) is the standard recovery. [S41][S40]

### Typal support cards — what is considered best
- Draftsim 59-card ranking (Mar 2026): Roaming Throne #1 (ward 2, doubles typal triggers), Herald's Horn #2
  (cost reduction + free cards), Coat of Arms #5, Maskwood Nexus #6 (everything is every type; makes changelings),
  Vanquisher's Banner #8 (valued for the draw, anthem secondary), Metallic Mimic / Adaptive Automaton #13, Icon of
  Ancestry #14, Urza's Incubator #15, Shared Animosity #30, Patchwork Banner #33, Kindred Dominance #35,
  Reflections of Littjara #38, Kindred Discovery #39, Obelisk of Urd #55. [S38]
- MTG Rocks top 10 (2021): Urza's Incubator, Descendant's Path, Door of Destinies (better early than Coat of
  Arms; no army needed), Reflections of Littjara, Belbe's Portal, Kindred Discovery, Patriarch's Bidding, Kindred
  Dominance, Steely Resolve, Mirror of the Forebears. [S39]
- TurnZeroHQ ten: Cavern of Souls, Path of Ancestry, Vanquisher's Banner, Herald's Horn, Kindred Discovery
  ("the most explosive draw engine available to any tribe"), Coat of Arms, Shared Animosity, Urza's Incubator,
  Patriarch's Bidding; advice: cut weak on-theme cards. [S40]
- Cards named in the question with no fetched evaluation at *high power*: Door of Destinies (only MTG Rocks
  2021), Icon of Ancestry (#14 Draftsim only), Obelisk of Urd (#55 Draftsim). Treat their B4 value as
  **not verified**.

### Lords vs anthems — when a lord plan beats an anthem plan
- Definitions: lords are creatures that pump a type (often adding keywords); anthems are the noncreature
  version; lords stack multiplicatively — with three lords every creature is three points bigger (TurnZeroHQ,
  paraphrased). [S41][S40]
- For tokens: token-heavy decks want every lord/anthem because the pump spreads over more bodies; lords in a
  non-token build commit more real cards to the board and get blown out harder by wipes (TappedOut forum —
  **snippet only**).
- For creature-dense aggro: Edgar deck tech prefers "lords on bodies" because they attack and add to eminence
  counts. [S42] Sliver lists prefer lords that add evasion (Cloudshredder) and raw power (Cleaving) over anthems.
  [S48]
- The structural weakness of a lord plan is that removal on the lord shrinks the whole team and a wrath takes
  lords and team together; anthem/artifact plans survive creature wipes — which is why wipe-resilience advice is
  to diversify into noncreature permanents. [S40][S16]
- **Synthesis (not from a source)**: at Bracket 4, lords win when the deck has haste/evasion and expects to
  close in one or two swings before wraths; anthem/artifact plans (Coat of Arms, Obelisk, Shared Animosity,
  Door) win when the deck expects to rebuild after a wipe or wants a single-turn conversion of a wide board.

---

## 5. Dimir (blue-black) aggressive archetypes at high power

| Commander | Actual win condition at B4/cEDH | Key support | Weaknesses |
|---|---|---|---|
| **Yuriko, the Tiger's Shadow** | Ninja combat triggers reveal top card, each opponent loses MV; top-deck manipulation (Brainstorm, Scroll Rack, Sensei's Top, Vampiric Tutor) stacks Draco (16) / Temporal Trespass etc.; extra turns (Temporal Manipulation, Time Warp, Temporal Trespass, Temporal Mastery); backup Thassa's Oracle + Demonic Consultation or a Doomsday pile. [S50][S51][S52] | 0–1 mana evasive creatures (Changeling Outcast, Mothdust Changeling, Faerie Seer, Ornithopter, Memnite, Phyrexian Walker); ninjas with draw (Ninja of the Deep Hours, Ingenious Infiltrator, Mistblade Shinobi); free counters (Force of Will, Force of Negation, Fierce Guardianship, Disrupting Shoal, Commandeer, Misdirection, Mental Misstep, Swan Song); free removal (Snuff Out, Deadly Rollick); commander ninjutsu dodges tax. [S50][S51][S52] | Needs early evasive bodies, wipes, counter-heavy metas, table hostility (fast kills); resource split between pressure and holding interaction. Rated mid-to-high / cEDH-adjacent and a top Bracket 4 pick. [S51][S52][S9] |
| **Satoru Umezawa** | Ninjutsu ({2}{U}{B} for any creature in hand) big threats by turn 3–4: Blightsteel Colossus (11 infect), Jin-Gitaxias, It That Betrays; dig three on each ninjutsu. [S54][S64] | 14 one/two-drop evasive bodies (Ornithopter, Slither Blade, Mist-Cloaked Herald…), Force of Will / Mana Drain / Swan Song, Damnation / Toxic Deluge / Deadly Rollick, Demonic/Vampiric Tutor/Imperial Seal. [S54] | Linear; wipes and spot removal; guide says high power, not cEDH, one threat at a time. [S54] |
| **Satoru, the Infiltrator** ({U}{B}, menace; draws when creatures enter uncast) | Card-advantage engine into Thassa's Oracle + Consultation/Pact; Bolas's Citadel + Aetherflux Reservoir. [S55][S64] | All 13 zero/X-cost Dimir creatures, ninjutsu, reanimation, Displacer Kitten, Yawgmoth's Will, two-mana lands. [S55] | Experimental brew; author unsure ninja/KCI packages are worth it. [S55] |
| **Tymna / Kraum (Blue Farm)** | Midrange: Tymna draws up to 3 off combat damage, Kraum draws off double-spells; wins via Thassa's Oracle or Underworld Breach, early or late. [S56] | Rhystic Study, Mystic Remora, free counters (Fierce Guardianship, Deflecting Swat), four-colour interaction; ruthless mulligans. [S56] | Slower than linear combo; must read the pod and choose fast-kill vs grind. [S56] |
| **Tetsuko Umezawa, Fugitive** (mono-U; creatures with power or toughness 1 or less are unblockable) | Poison: Blighted Agent / Phyrexian Digester seed counters on everyone, then proliferate burst (Flux Channeler, Staff of Compleation, Viral Drake, Karn's Bastion, Prologue to Phyresis); win all at once rather than one at a time. [S57][S64] | Trinket Mage / Tezzeret the Seeker tutors, 39 noncreature spells; Bloodforged Battle-Axe on a 1/1 as a token/equipment line (TappedOut primer — **snippet only**). | "Lower section of high power", not cEDH; dependent on creatures and proliferate permanents. [S57] |
| **Anowon, the Ruin Thief** (other Rogues +1/+1; Rogue damage mills, creature milled → draw) | Chip damage with unblockable Rogues plus card advantage; Notorious Throng (extra turn + tokens); combos in some lists: Bloodchief Ascension + Mindcrank, Duskmantle Guildmage + Mindcrank (Moxfield primer — **snippet only**). [S58][S64] | Merfolk Windrobber, Ghostly Pilferer, Nighthawk Scavenger, Soaring Thought-Thief, Thieving Skydiver; Bident of Thassa, Coastal Piracy, Reconnaissance Mission; Rogue Class; Bitterblossom; Opposition Agent. [S58] | Lost badly to a Shrines (non-interactive) deck in the author's testing; the fetched article is casual-level. [S58] |
| **Etrata, the Silencer** (unblockable; hit counters; 3 = that player loses) | Mari, the Killing Quill / Ravenloft Adventurer exile dying creatures with hit counters, so any wrath pre-loads the kill; blink (Displacer Kitten, Ghostly Flicker, Siren's Ruse) keeps her from shuffling back; Vorpal Sword as a second alt-win. [S59][S64] | Candlekeep Sage draw; Lightning Greaves / haste and Helm of the Host copies (Moxfield primer — **snippet only**). | Tokens and creature-light decks blank her; glass cannon; casual-to-mid. [S59] |
| **Etrata, Deadly Fugitive** ({1}{U}{B} 1/4 deathtouch; Assassin combat damage → cloak top card of that player's library; face-down creatures get a {2}{U}{B} unmorph-or-cast ability) | Win paths listed by guides: Assassin go-wide aggro, Etrata the Silencer hit counters, Ramses Assassin Lord; stolen cards are the value engine, not the wincon. [S60][S61][S64] | Changeling Outcast, Mothdust Changeling, Maskwood Nexus / Arcane Adaptation (make face-downs Assassins), Training Grounds, Ixidor, Primordial Mist, Roaming Throne, Conjurer's Closet, Kindred Discovery, Fallen Shinobi. [S60][S61] | Dependent on opponents' decks, slower clock than true aggro, removal on Assassins; both guides rate it casual/mid. [S60][S61] |

### Shared support across Dimir aggressive decks
- Cheap evasive bodies (0–2 mana) that connect on turn 1–2, then a payoff that converts damage into cards:
  Yuriko triggers, Tymna, Ninja of the Deep Hours / Ingenious Infiltrator, Bident of Thassa / Coastal Piracy /
  Reconnaissance Mission, Rogue Class (level 1 exiles the top card on hit; level 3 lets you play them). [S50][S51]
  [S56][S58][S64]
- Free or near-free interaction so the deck taps out for threats yet still protects the win: Force of Will,
  Force of Negation, Fierce Guardianship, Deflecting Swat, Swan Song, Snuff Out, Deadly Rollick. [S50][S52][S56]
- Top-deck manipulation (Brainstorm, Ponder, Scroll Rack, Vampiric Tutor) both for Yuriko damage and for
  Oracle piles. [S51][S52]
- A compact Oracle/Consultation backup is the common cEDH finisher; at Bracket 4 confirm the table accepts it.
  [S51][S10]

---

## 6. Theft decks (steal opponents' cards)

- **How they expect to win**: guides frame theft as a *midrange value engine* — grindy midrange decks that
  are best when "everybody's brought sick decks full of powerful cards to steal"; you need enough ramp to cast
  what you steal. Top-ranked theft commanders: Haldan + Pako, Sen Triplets, Don Andres, Gonti, Canny Acquisitor.
  [S62]
- Etrata, Deadly Fugitive guides list the actual win conditions as Assassin aggro, Etrata the Silencer's hit
  counters, or Ramses — theft supplies cards/bodies, something else closes. [S60][S61]
- Theft as removal + value: Hostage Taker exiles a creature/artifact and lets you cast it (mana of any type);
  Thief of Sanity exiles one of the top three on hit and lets you cast it; Fallen Shinobi (ninjutsu {2}{U}{B})
  lets you play that player's top two for free until end of turn; Gonti, Lord of Luxury ETB exiles one of the top
  four; Gonti, Canny Acquisitor makes stolen spells cost {1} less and exiles the top card on any combat damage;
  Rogue Class levels into playing exiled cards. [S64]
- Usage data: Thief of Sanity in ~84% and Fallen Shinobi in ~65% of Gonti, Canny Acquisitor decks (EDHREC —
  **snippet only**). [S65]
- **Known weaknesses**: performance scales with opponents' deck quality; slower than aggressive alternatives;
  removal on the evasive Assassins/thieves turns off the engine. [S60][S61] Theft is "only going to be as strong
  as the rest of the table +/- a bit"; library searching is slow and gives the thief full information on
  opponents' decks, which casual tables resent. [S63] Theft is fruitless against pillowfort/control/stax, and
  eliminating a player can cost you the resources you were stealing from them (EDH wiki — **snippet only**).
- **Consensus**: value engine, not a win condition. [S62][S60][S61] TCGPlayer's theft-building article
  describes the mid-game as Hostage Taker removing problems while the commander generates value and Control
  Magic effects keep the best thing on your side (**snippet only**; page body could not be retrieved).
- Cloak/manifest as theft: Etrata, Deadly Fugitive cloaks the *opponent's* top card (Scryfall text), and guides
  note face-down cards can attack and create more face-downs, growing the board exponentially (EDHREC page —
  **snippet only**). [S64]

---

## Key takeaways for a Dimir aggressive/theft deck at Bracket 4 (synthesis of the above)

1. Mulligan for a 0–2-mana evasive creature + the mana to land the commander by turn 2–3; interaction alone is
   not a keep. [S3][S51][S52]
2. Develop first; hold free counters for fundamental turns and for protecting your own win, not for Sol Rings.
   [S4][S11][S50]
3. Keep 2–3 pressure creatures out and the rest in hand; re-apply after wipes. [S16][S54]
4. Attack the long-game/value player and the player whose life is a resource; eliminate the one whose
   interaction stops you, and prefer a kill that removes a player entirely over spreading damage — unless you are
   on a poison plan, where you seed everyone first. [S2][S1][S27][S28]
5. Don't be the first to go for it in a pod with blue; aim to win second/third. [S5][S4]
6. Closing tools that fit U/B: Yuriko-style life-loss triggers, infect via ninjutsu (Blightsteel) or 1-power
   unblockables with proliferate, hit counters (Etrata the Silencer + Mari/Ravenloft + any wrath), Kindred
   Dominance / Massacre Wurm as one-sided wipes, Genji Glove for a colourless extra combat, mass evasion
   (Archetype of Imagination, Wonder, Levitation, Cover of Darkness) and an Oracle/Consultation backup where the
   table allows it. [S50][S54][S57][S59][S34][S30][S36][S51]
7. Theft is card advantage; pair it with one of the above finishers. [S62][S60]

---

## Sources (all read 2026-10-05)

- [S1] Commander's Herald — "Combat in cEDH" (Ondas, 2024-10-26): https://commandersherald.com/combat-in-cedh/
- [S2] Draftsim — "The Ultimate Guide to Threat Assessment in Commander" (A.L. Walser, 2025-06-16): https://draftsim.com/mtg-commander-threat-assessment/
- [S3] TopDeck.gg — "Can I Keep This? How to Mulligan in cEDH" (Matt Sperling, 2023-01-06): https://topdeck.gg/articles/can-i-keep-this-how-to-mulligan-cedh
- [S4] TopDeck.gg — "When Should You Interact in cEDH?" (Sam Black, 2023-06-21): https://topdeck.gg/articles/when-should-you-interact-cedh
- [S5] Commander's Herald — "A cEDH Field Guide" (Ken Baumann, 2023-08-09): https://commandersherald.com/a-cedh-field-guide/
- [S6] Commander's Herald — "A Beginner's Guide to cEDH" (Corey Williams, 2024-11-13): https://commandersherald.com/a-beginners-guide-to-cedh/
- [S7] Wizards of the Coast — "Commander Brackets Beta Update" (2025-10-21): https://magic.wizards.com/en/news/announcements/commander-brackets-beta-update-october-21-2025
- [S8] bluecore.cards — "Commander Bracket 4 Explained: Optimized vs cEDH" (2026-07-03, updated 2026-08-19): https://bluecore.cards/en/blog/bracket-4-optimized-explained
- [S9] Nerd Leagues — "Best Commanders for Bracket 4 Optimized Decks" (DonSpider, 2026-07-05): https://www.nerdleagues.com/blog/best-commanders-for-bracket-4-optimized-decks
- [S10] Draftsim — "Everything You Need to Know About the Commander Brackets" (Timothy Zaccagnino, 2026-02-09, updated 2026-03-15): https://draftsim.com/mtg-commander-power-bracket/
- [S11] EDHREC — "Intro to cEDH" (Callahan Jones, undated): https://edhrec.com/guides/intro-to-cedh
- [S12] Commander's Herald — "cEDH: Interaction in a Slower Meta" (Harvey McGuinness, 2024-03-30): https://commandersherald.com/cedh-interaction-in-a-slower-meta/
- [S13] EDHREC / The Command Zone ep. 652 — "Who's the Target? Lessons in Threat Assessment" (2025-01-16): https://edhrec.com/articles/the-command-zone-whos-the-target-lessons-in-threat-assessment-the-command-zone-652-mtg-edh-magic-gathering
- [S14] Star City Games — "The Politics of Commander" (Sheldon Menery, 2021-05-16): https://articles.starcitygames.com/magic-the-gathering/select/the-politics-of-commander/
- [S15] MTG Salvation — "Need some tips on table politics" (thread, 2010-10): https://www.mtgsalvation.com/forums/the-game/commander-edh/196078-need-some-tips-on-table-politics
- [S16] MTG Salvation — "Anti Board Wipe Tactics" (thread, 2016-06): https://www.mtgsalvation.com/forums/the-game/commander-edh/719579-anti-board-wipe-tactics
- [S17] airza.net — "How to Win in Commander? Attack Your Opponents Until They Die" (John, 2025-03-13): https://airza.net/2025/03/13/how-to-win-in-commander-attack-your-opponents-until-they-die
- [S18] MTG Salvation — "Is it possible to play a Tempo deck in EDH?" (thread, 2013-04): https://www.mtgsalvation.com/forums/the-game/commander-edh/204141-is-it-possible-to-play-a-tempo-deck-in-edh
- [S19] MTG Salvation — "Are you OK with aggro not being viable?" (thread, 2011-04-29): https://www.mtgsalvation.com/forums/the-game/commander-edh/197408-are-you-ok-with-aggro-not-being-viable
- [S20] MTG Salvation — "Viability of Aggro in Multiplayer" (thread, 2011-09-28): https://www.mtgsalvation.com/forums/the-game/commander-edh/198545-viability-of-aggro-in-multiplayer
- [S21] MTG Salvation — "Concerns about Aggro in Commander and Trying out 30 Life" (thread, 2012-12): https://www.mtgsalvation.com/forums/the-game/commander-edh/202748-concerns-about-aggro-in-commander-and-trying-out
- [S22] Nerd Leagues — "How to Build an Aggro EDH Deck for Multiplayer" (DonSpider, 2026-07-03): https://www.nerdleagues.com/blog/how-to-build-an-aggro-edh-deck-for-multiplayer
- [S23] Draftsim — "The 49 Best Aggro Commanders in Magic Ranked" (A.L. Walser, 2026-05-28): https://draftsim.com/best-aggro-commanders/
- [S24] WitchPHD (Substack) — "i dont like combos heres why" (2022-03-18): https://witchphd.substack.com/p/i-dont-like-combos-heres-why
- [S25] MTG Salvation — "Take out a player early, spread the damage or bide your time?" (thread, 2018-06): https://www.mtgsalvation.com/forums/the-game/commander-edh/794248-take-out-a-player-early-spread-the-damage-or-bide
- [S26] MTG Salvation — "Do you prefer killing the table all at once, or one at a time?" (thread, 2012-04): https://www.mtgsalvation.com/forums/the-game/commander-edh/200355-do-you-prefer-killing-the-table-all-at-once-or-one
- [S27] Nerd Leagues — "How to Build a Winning Voltron EDH Deck" (DonSpider, 2026-07-02): https://www.nerdleagues.com/blog/how-to-build-a-winning-voltron-edh-deck
- [S28] EDHMeta — "Infect: Winning By Counting To Ten" (jegpeg, 2025-12-13): https://edhmeta.com/infect-and-toxic-guide/
- [S29] Card Kingdom blog — "The Best Ways to Take Extra Combats in Commander" (Kristen Gregory, 2022-03-21): https://blog.cardkingdom.com/the-best-ways-to-take-extra-combats-in-commander/
- [S30] EDHREC — "The Best Equipment Cards From Final Fantasy" (Ciel Collins, 2025-06-10): https://edhrec.com/articles/the-best-equipment-cards-from-final-fantasy
- [S31] Draftsim — "The 46 Best Damage Doubler Cards in Magic Ranked" (Andrew Quinn, 2024-10-11, updated 2026-09-03): https://draftsim.com/mtg-damage-doublers/
- [S32] Commander Spellbook — Heartless Hidetsugu + Wound Reflection: https://commanderspellbook.com/combo/3011-4475/
- [S33] MTG Salvation — "Heartless Hidetsugu - The Art of Ending Games" (thread, 2016-04): https://www.mtgsalvation.com/forums/the-game/commander-edh/multiplayer-commander-decklists/690796-heartless-hidetsugu-the-art-of-ending-games
- [S34] Draftsim — "The 39 Best One-Sided Board Wipes in Magic Ranked" (David Royale, 2026-02-19, updated 2026-07-13): https://draftsim.com/mtg-one-sided-board-wipe/
- [S35] CoolStuffInc — "Top 5 Finisher Effects like Craterhoof Behemoth for Commander" (Abe Sargent, 2025-03-12): https://www.coolstuffinc.com/a/abesargent-seo-03122025-top-5-finisher-effects-like-craterhoof-behemoth-for-commander
- [S36] MTG Salvation — "Mass evasion in U/B?" (thread, 2016-07): https://www.mtgsalvation.com/forums/the-game/commander-edh/738724-mass-evasion-in-u-b
- [S37] EDHREC — "Evasive Maneuvers - Fear and Intimidate" (Trent Trombley, 2020-07-03): https://edhrec.com/articles/evasive-maneuvers-fear-and-intimidate
- [S38] Draftsim — "The 59 Best Tribal Cards in Magic Ranked" (Pedro Furtado, 2026-03-03): https://draftsim.com/mtg-tribal-support-cards/
- [S39] MTG Rocks — "The 10 Best Tribal Cards In Commander" (2021-03-17): https://mtgrocks.com/best-tribal-cards-commander/
- [S40] TurnZeroHQ — "Tribal Commander Deck Guide: Best Cards & Commanders" (undated): https://turnzerohq.com/guides/archetypes/tribal
- [S41] EDHREC — "/tribes" (undated): https://edhrec.com/articles/tribes
- [S42] Flipside Gaming — "Commander Deck Tech: Edgar Markov" (Sean Cabral, 2026-07-27): https://flipsidegaming.com/blogs/magic-blog/commander-deck-tech-edgar-markov
- [S43] Draftsim — "Krenko, Mob Boss Commander Deck Guide" (Jake Henderson, 2025-12-19): https://draftsim.com/krenko-mob-boss-edh-deck/
- [S44] EDHREC combos — Krenko, Mob Boss + Thornbite Staff + Skirk Prospector: https://edhrec.com/combos/mono-red/38-659-2178
- [S45] Draftsim — "Lathril, Blade of the Elves Commander Deck Guide" (Jeff Dunn, 2025-12-26): https://draftsim.com/lathril-edh-deck/
- [S46] The Mana Base — "Into the Arena: Ezuri Elves in EDH!" (Dawson Reynolds, 2022-03-25): https://themanabase.com/into-the-arena-ezuri-elves-in-edh/
- [S47] MTG Salvation (cEDH subforum) — "First Sliver Food Chain" (thread, 2019-06-06): https://www.mtgsalvation.com/forums/the-game/commander-edh/competitive-commander-cedh/811017-first-sliver-food-chain
- [S48] Commander's Herald — "The First Sliver" deck tech (Alejandro Fuentes, 2024-04-19): https://commandersherald.com/the-first-sliver-commander-deck-tech/
- [S49] EDHREC — "Commander Showdown - Wilhelt vs The Horde" (Joseph Schultz, 2021-10-15): https://edhrec.com/articles/commander-showdown-wilhelt-vs-the-horde
- [S50] EDHREC — "Building Yuriko, the Tiger's Shadow for cEDH" (Harvey McGuinness, 2026-03-10): https://edhrec.com/articles/building-yuriko-the-tigers-shadow-for-cedh
- [S51] Draftsim — "Yuriko, the Tiger's Shadow Commander Deck Guide" (Alex Barker, 2025-01-07, updated 2026-07-29): https://draftsim.com/yuriko-commander-deck/
- [S52] Learn cEDH — "Yuriko" decklist page (Evan Pierce, dated "December 2", year not shown): https://learncedh.com/decklists/yuriko
- [S53] Draftsim — "Najeela, the Blade-Blossom Commander Deck Guide" (Sean Migalla, 2022-12-07, updated 2024-03-14): https://draftsim.com/najeela-edh-deck/
- [S54] Draftsim — "Satoru Umezawa Commander Deck Guide" (Jake Henderson, 2022-02-15, updated 2024-06-28): https://draftsim.com/satoru-umezawa-commander-deck/
- [S55] Commander's Herald — "Brewing Satoru, the Infiltrator in cEDH" (Sam Black, 2024-05-15): https://commandersherald.com/satoru-the-infiltrator-in-cedh/
- [S56] Commander's Herald — "An Introduction To Blue Farm" (Drake Sasser, 2023-01-29): https://commandersherald.com/an-introduction-to-blue-farm/
- [S57] EDHREC — "Tetsuko Umezawa: A Mono-Blue Guide to Compleation" (Adam Hart, 2023-06-28): https://edhrec.com/articles/tetsuko-umezawa-a-mono-blue-guide-to-compleation
- [S58] CoolStuffInc — "Commanding Tribal: Rogues with Anowon, the Ruin Thief" (Mark Wischkaemper, 2022-05-24): https://www.coolstuffinc.com/a/markwischkaemper-05242022-commanding-tribal-rogues-with-anowon-the-ruin-thief
- [S59] Commander's Herald — "Conditions Allow: Revisiting Etrata, the Silencer in EDH" (Ben Doolittle, 2022-08-16): https://commandersherald.com/conditions-allow-revisiting-etrata-the-silencer-in-edh/
- [S60] Draftsim — "Etrata, Deadly Fugitive Commander Deck Guide" (A.L. Walser, 2024-03-28, updated 2025-01-18): https://draftsim.com/etrata-edh-deck/
- [S61] Cards Realm — "Commander Deck Tech: Etrata, Deadly Fugitive" (Pedro Braga, 2024-06-18): https://mtg.cardsrealm.com/en-ca/articles/commander-deck-tech-etrata-deadly-fugitive
- [S62] Draftsim — "The 32 Best Theft Commanders in Magic Ranked" (A.L. Walser, 2026-02-02): https://draftsim.com/mtg-theft-commanders/
- [S63] TappedOut forum — "What are your opinions on 'thief' decks?" (thread, 2017-07/08): https://tappedout.net/mtg-forum/commander/what-are-your-opinions-on-thief-decks/
- [S64] Scryfall API card Oracle text (api.scryfall.com/cards/named) for: Etrata, Deadly Fugitive; Etrata, the Silencer; Gonti, Canny Acquisitor; Gonti, Lord of Luxury; Rogue Class; Massacre Wurm; Kindred Dominance; Genji Glove; Thief of Sanity; Fallen Shinobi; Hostage Taker; Satoru Umezawa; Satoru, the Infiltrator; Tetsuko Umezawa, Fugitive; Anowon, the Ruin Thief; Port Razer; Combat Celebrant; Karlach, Fury of Avernus; Moraug, Fury of Akoum: https://api.scryfall.com/cards/named?exact=<name>
- [S65] EDHREC — Gonti, Canny Acquisitor "Theft" theme page (inclusion percentages seen in search snippet only): https://edhrec.com/commanders/gonti-canny-acquisitor/theft

## Not found / not verified

- **Reddit** r/CompetitiveEDH and r/EDH threads: not retrievable (reddit.com and old.reddit.com returned HTTP
  403 to curl with a browser User-Agent; the fetch tool refuses reddit domains; DuckDuckGo HTML search returned
  nothing). No Reddit-sourced claims appear above.
- **CommanderCast, "Generally Speaking 14: A Guide to Aggro in Commander"**: DNS failure; web.archive.org not
  fetchable. Only search-snippet content (overrun effects, Beastmaster Ascension, Finale of Devastation, extra
  combats/extra turns to beat sweepers, Aggravated Assault / Hellkite Charger) — treated as snippet only.
- **TCGPlayer, "How to Build a Theft Commander Deck In MTG"**: page body empty after redirect; snippet only.
- **Moxfield / TappedOut / Archidekt / MTGNexus / edh.fandom / commandertheory.com** pages (Yuriko and Edgar
  primers, TappedOut cEDH Krenko and Edgar primers, Anowon "Rogue Aggro" primer, Tetsuko "Premiere Primer",
  Etrata Silencer flicker primer, Lathril "Competitive Elves", MTGNexus theft thread, EDH wiki "Theft" and
  "Introduction to cEDH", Commander Theory Voltron/tribe posts): HTTP 402/403. Anything attributed to them is
  marked snippet only.
- **"Playing With Power"**: only an interview page surfaced; no piloting guide located. **MTGGoldfish Commander
  Clash** write-ups on aggro: none found. **cEDH Decklist Database**: only the about page surfaced; no piloting
  guide retrieved.
- **Rogue's Passage, Beastmaster Ascension, Door of Destinies, Icon of Ancestry, Obelisk of Urd at Bracket 4**:
  no fetched high-power evaluation; rankings cited are from general (not B4-specific) lists.
- **Voltron "7 / 11 / 21" power breakpoints**: snippet only (Commander Theory, 403).
- **Demonic Consultation / Tainted Pact Game Changer status**: not verified (the Draftsim list fetched names
  Thassa's Oracle and Underworld Breach, not Consultation).
- **Ban status of Mana Crypt / Jeweled Lotus in 2026**: the fetched Draftsim list names Mana Crypt as a Game
  Changer and calls Jeweled Lotus "previously banned"; I did not verify the current ban list.
- **Learn cEDH Yuriko page year**: page shows "December 2" with no year.
- **Satoru Umezawa / Yuriko exact Oracle text**: Yuriko's text not pulled from Scryfall (apostrophe broke the
  query); the text used is as quoted by [S50]/[S51].
