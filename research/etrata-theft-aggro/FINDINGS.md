# Etrata first: making theft and Assassin aggro the deck's identity
Written 2026-10-05 for ju. The research sources are in `sources/`:
- `theft-payoffs.md` covers 53 cards.
- `aggro-scaling.md` covers about 65 cards.

Rules text and prices come from each card's Card Kingdom page; the URL is listed per card there. Nothing in the deck or the site has been changed.

## The short answer
The identity works if each stolen card **does something the moment it's stolen**, without needing Etrata's 4-mana flip. Today it doesn't. Four jobs fix that:
1. **Make cloaks Assassins.** A stolen card that connects then steals another.
2. **Draw a card per cloak.**
3. **Keep Etrata alive.**
4. **Keep one closer.** The vampire drain loop stays as the finisher.

Pure aggro can't win on its own. The bots measured that clearly (below).

## What Etrata does in bot games today (v3 list, measured)
I tracked Etrata over 1,000 bot games:

| | vs precons | vs Bracket 4 |
|---|---|---|
| Times she is cast per game | 2.1 | 1.7 |
| Opponent cards she cloaks per game | 1.5 | 3.8 |
| Flips with her ability per game | 0.2 | 0.3 |

- **She dies a lot.** At 2.1 casts a game, she costs 3, then 5, then 7 mana.
- **Her steals turn into blank 2/2s.** A face-down card has no creature types, so it isn't an Assassin and doesn't trigger her again. Flipping one costs {2}{U}{B}, and the deck spends that mana elsewhere.

That's why the deck won as often or more when she was never cast. The theft half of her card never paid off.

## Why pure aggro fails
I benched a version with the vampire combo, the Manta line and the tutor package swapped for 21 Assassin, theft and evasion cards that already exist in the game.

| List | vs precons | vs Bracket 4 |
|---|---|---|
| v3 (now) | 68.3% | 39.2% |
| Pure theft-aggro | **3.8%** | **2.8%** |

That's the same result as the older Etrata lists (6–11%). Three opponents have 120 life between them. Small evasive Assassins deal about 15 damage a game, and a swarm doesn't close against lifegain and blockers.

**Takeaway:** keep a closer. The vampire drain fits the plan well:
- **Hooded Blightfang** already drains on every deathtouch attack.
- **Thieving Amalgam** drains 2 whenever a stolen creature you control dies.

## The four jobs and the best cards for each
Prices are the cheapest Card Kingdom NM copy. None of these cards are banned. Only Opposition Agent and Notion Thief, already in the deck, are Game Changers.

### 1. Every stolen card becomes an Assassin (the scaling step)
| Card | Cost | Price | Why |
|---|---|---|---|
| **Leyline of Transformation** (Assassin) | {2}{U}{U}, or free in your opening hand | $0.69 | Cloaks, ninjas and thieves all become Assassins. Each stolen card that connects steals another. |
| **Arcane Adaptation** (Assassin) | {2}{U} | $4.99 | A cheaper Leyline. It's a backup if one gets removed. |
| **Roshan, Hidden Magister** | {3}{B} 4/4 | $0.35 | It does three things: other creatures are Assassins, face-down creatures get menace, and every flip draws a card. It's in 89% of real Etrata aggro decks. |

Real Etrata decks run all three, plus Maskwood Nexus in 60% of them.

### 2. Get paid per steal, no flip needed
| Card | Cost | Price | Why |
|---|---|---|---|
| **They Came from the Pipes** | {4}{U} | $0.69 | Draws a card every time Etrata cloaks or something is manifested. |
| **Satoru, the Infiltrator** | {U}{B} 2-drop, menace | $1.99 | Draws whenever a creature enters without being cast. Cloaks count, and so does a creature Etrata casts for free. |
| **Glitch Interpreter** | {2}{U} | $0.49 | Face-down creatures are colorless, and colorless ones that connect draw. |
| **Kindred Discovery** (Assassin) | {3}{U}{U} | $7.49 | With Leyline or Roshan out, it draws on every cloak entering and every Assassin attacking. |
| **Gonti, Night Minister** | {2}{B}{B} | $1.79 | Steals a second card on every hit, and makes a Treasure each time you cast a stolen card. The Treasures pay for flips. It's symmetric, though: opponents hitting each other steal too. |
| **Thieving Amalgam** | {5}{B}{B} 6/7 | $0.99 | Manifests the top card of each opponent's library on their upkeep, so you get three free bodies a round. Each stolen creature that dies drains 2 life. |

### 3. More Etratas, and Etrata alive
| Card | Cost | Price | Why |
|---|---|---|---|
| **Spark Double** | {3}{U} | $6.99 | A non-legendary second Etrata, so every Assassin hit cloaks twice. |
| **Brotherhood Regalia** | {2}, equip legendary {1} | $15.99 | Etrata gets ward {2}, can't be blocked, and is still an Assassin. |
| **Fading Hope** | {U} | $0.35 | Bounce Etrata in response to removal, then recast her from hand with no new tax. |
| **Ghostly Flicker** | {2}{U} | $2.79 | Flicker a cloak and it returns **face up under your control for good**, with its enter trigger. It can also save Etrata. |

Second tier:
- **Winged Boots** ($10.99): ward {4} and flying, with no P/T change. Its cost wasn't cross-checked against Oracle.
- **Tasha, the Witch Queen** ($8.49): a 3/3 Demon for each stolen card you cast.
- **Hostage Taker** ($0.49): removal that becomes a steal.
- **Dauthi Voidwalker** ($6.49)
- **Fallen Shinobi** ($7.99)
- **Rogue Class** ($2.49): a second steal trigger plus menace for the team.

### 4. Cheap early Assassins that start the engine
- **Hired Poisoner** ({B}, $0.35)
- **Rooftop Bypass** ($5.99): a 1/1 menace Assassin token every time you connect.

These are already in the deck: Changeling Outcast, Mutavault, Silumgar Assassin, Tetsuko and Virtus.

## Suggested list: v3 with 15 swaps (about $52 total)
**Out**:
- The Manta turns line: Scroll of Fate, Wormfang Manta, Crystal Shard.
- Duskmantle Guildmage, Mindcrank and Culling the Weak.
- The slow tutor and setup cards: Beseech the Mirror, Wishclaw Talisman, Lim-Dûl's Vault, Scheming Symmetry, Drift of Phantasms, Dimir House Guard, Shred Memory and Muddle the Mixture.
- Night's Whisper.

**In**:
- Leyline of Transformation, Arcane Adaptation and Roshan.
- They Came from the Pipes, Satoru the Infiltrator, Glitch Interpreter and Kindred Discovery.
- Gonti Night Minister and Thieving Amalgam.
- Spark Double, Brotherhood Regalia, Fading Hope and Ghostly Flicker.
- Hired Poisoner and Rooftop Bypass.

**Kept**: the vampire closer (Exquisite Blood, Bloodthirsty Conqueror, Blight-Priest, Vito, Sanguine Bond, Hooded Blightfang), the theft pieces already in (Thief of Sanity, Opposition Agent, Notion Thief), the counters and the 36 lands.

How the deck then plays:
- Assassins connect, Etrata cloaks, and each cloak is an Assassin that draws a card and steals the next one.
- Stolen creatures that die drain.
- Exquisite Blood turns that drain into a win.
- Flips become the bonus rather than the plan.

## What I could measure, and what I couldn't
Both hybrid tests keep the vampire closer, cut the 12 combo and setup cards above, and add 12 cards. Both used paired seeds, 1,200 games against precons and 500 against Bracket 4. The game engine has only some of the recommended cards, so these tests only use the ones it has.

| Test | vs precons | vs Bracket 4 | Etrata's effect (never cast vs cast) | Steals/game |
|---|---|---|---|---|
| v3 (now) | 68.3% | 39.2% | she costs about 1.5 / 4.5 pts | 1.5 |
| Hybrid 1 (Leyline + Assassins + Regalia + Boots + Gonti + Ezio + Shinobi) | 58.2% | 31.6% | +1.5 / −5.6 | n/a |
| Hybrid 2 (all four type-changers + Kindred Discovery + Rooftop Bypass) | 55.3% | 30.2% | ±0 / −3.4 | 2.75 (was 1.5) |

What the numbers say:
- Making cloaks Assassins nearly **doubled the steals**, and Etrata went from a cost to roughly neutral.
- But the bot doesn't convert the extra stolen cards into wins yet. It still flips only 0.36 cards a game.
- The cards that turn steals into value without a flip aren't in the game engine yet: They Came from the Pipes, Satoru, Glitch Interpreter, Thieving Amalgam, Spark Double, Fading Hope and Ghostly Flicker. **The suggested list is untested** until they're built.
- Expect the theft identity to cost some raw win rate against the v3 combo list. With bots, the hybrids were 10 to 13 points lower against precons.

## Rules points worth knowing
- **A face-down creature has no creature types.** It triggers Etrata only with Leyline, Adaptation, Roshan or Maskwood out.
- **Any +1/+1 effect turns off Tetsuko** for 1/1 Assassins. Coat of Arms, banners, Ramses and Shadowspear all do it. Pick one evasion plan: Tetsuko, or menace and team flying.
- **Conspiracy is legal**, but it *replaces* creature types. Etrata and the vampires lose Vampire, so use Leyline or Adaptation instead.
- **Ownership still matters for stolen cards.** A bounced cloak, from ninjutsu, Fading Hope or Snap, goes back to the opponent's hand. A stolen creature that dies goes to its owner's graveyard.
- **Etrata's flip is neither a cast nor an entry.** Tasha, Gonti and Satoru don't trigger on it. A free cast from her fallback does count as a cast.
- **No blue, black or colorless card gives an extra combat.** I couldn't run a full text search, so treat that as likely rather than certain. Copying Etrata or doubling her trigger is the nearest substitute: Spark Double, Strionic Resonator, Roaming Throne ($57.99).
- **Gonti, Canny Acquisitor is blue-black-green**, so it isn't legal here.
- **Sash and Waistcoat, Unmen** (face-down attackers can't be blocked) has no price I could verify.

## Proven decks to look at by hand
- The Moxfield primer "Fugitives (Best Bracket 4 Assassin Snowball)": moxfield.com/decks/WUZ4bXuAlkOruBQue4gpuw/primer. It needs a browser, so I couldn't read it.
- EDHREC Etrata: https://edhrec.com/commanders/etrata-deadly-fugitive. Only 49 of 3,272 decks are tagged aggro. Their draw comes from Eagle Vision, Ezio, Bident of Thassa, They Came from the Pipes and Satoru.
