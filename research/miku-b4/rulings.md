# Rules facts for the simulator: verbatim rulings
Pass 2, 2026-10-08. Replaces the paraphrased rulings of `pass1/rulings.md` (left untouched). Every card ruling below is quoted verbatim from Scryfall's `rulings` bulk file of 2026-10-07 21:00 UTC (`scryfall/index.json`), with its publication date and source ("wotc" for Wizards' own rulings). Each card's Oracle text is in `commanders.md` (commanders) or `cards.json` (everything else).

## Comprehensive Rules points (not card rulings; not in Scryfall's bulk data)
- **CR 903.9a/b** (commander zone change). Pass 1 cited the July 2020 Rules Committee update: https://mtgcommander.net/index.php/2020/06/29/july-2020-update/. A commander put into a graveyard or exile is moved to the command zone as a state-based action, so it reaches the graveyard first and its "dies" triggers fire; hand and library stay replacement effects. Pass 1 took this from that page; I didn't re-fetch the Comprehensive Rules text this pass, so the exact wording is **not verified**. The simulator needs one consequence: Child of Alara's death trigger fires when it dies as a commander.
- **Hexproof (CR 702.11)** stops only spells and abilities your *opponents* control from targeting. Shalai gives it to "You, planeswalkers you control, and other creatures you control" (Oracle text), so Shalai herself can be targeted. The exact CR wording is **not verified** this pass.

## Commanders

### Child of Alara

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Brago, King Eternal

- **2020-11-10** (wotc): You may exile and return Brago using its own ability.
- **2020-11-10** (wotc): Brago's last ability exiles and returns all the targets during the combat damage step, after combat damage is dealt. You can't target any creature that didn't survive combat.
- **2020-11-10** (wotc): If you exile an Aura with Brago's last ability, the Aura's owner chooses what it will enchant as it comes back onto the battlefield. An Aura put onto the battlefield this way doesn't target anything (so it could be attached to an opponent's permanent with hexproof, for example), but the Aura's enchant ability restricts what it can be attached to. The Aura can't enter the battlefield enchanting a permanent that enters the battlefield at the same time. If the Aura can't legally be attached to anything, it remains exiled.

### Shalai, Voice of Plenty

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Trostani, Selesnya's Voice

- **2012-10-01** (wotc): Trostani's first ability checks the creature's toughness as it resolves. If that creature has left the battlefield, use its toughness from when it was last on the battlefield. You can't lose life this way if that creature's toughness was less than 0.
- **2024-01-12** (wotc): Any enters-the-battlefield abilities of the copied token will trigger when the new token enters the battlefield. Any "as [this creature] enters the battlefield" or "[this creature] enters the battlefield with" abilities of the copied token will also work.
- **2024-01-12** (wotc): The new token doesn't copy whether the original token is tapped or untapped, whether it has any counters on it or Auras and Equipment attached to it, or any noncopy effects that have changed its power, toughness, color, and so on.
- **2024-01-12** (wotc): The new creature token copies the characteristics of the original token as stated by the effect that created the original token.
- **2024-01-12** (wotc): If you choose to copy a creature token that's a copy of another creature, the new creature token will copy the characteristics of whatever the original token is copying.
- **2024-01-12** (wotc): If you control no creature tokens when you populate, nothing will happen.
- **2024-01-12** (wotc): Populate doesn't target the creature token you're copying. You choose that creature token as you're taking the populate action. You can choose any creature token you control. If a spell or ability causes you to create a creature token and then instructs you to populate, you may choose to copy the token you just created, or you may choose to copy another creature token you control.

### Azusa, Lost but Seeking

- **2020-06-23** (wotc): Azusa's ability is cumulative with other effects that allow you to play additional lands, such as that of Song of Creation (from the Ikoria: Lair of Behemoths set).

### Giada, Font of Hope

- **2024-11-08** (wotc): "Each Angel you already control" means each Angel you control other than the Angel entering, including Giada. It doesn't matter if some or all of the Angels on the battlefield entered after Giada did.

### Freyalise, Llanowar's Fury

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Feather, the Redeemed

- **2021-03-19** (wotc): If an instant or sorcery spell's own instructions tell you to exile it or put it anywhere else, it won't try to be put into your graveyard or exiled with Feather's effect, so you won't return it to your hand.
- **2021-03-19** (wotc): If Feather is still on the battlefield as you finish casting an instant or sorcery spell that targets one or more creatures you control, its ability triggers. The replacement effect that exiles that spell and the delayed triggered ability that returns it to your hand both take effect even if Feather leaves the battlefield after this point.
- **2021-03-19** (wotc): If you cast an instant or sorcery spell that you don't own, it won't try to be put into your graveyard, so you won't exile it with Feather's effect or return it to your hand.
- **2021-03-19** (wotc): The spell may have any other targets in addition to a creature you control.
- **2021-03-19** (wotc): If another replacement effect instructs you to exile an instant or sorcery spell, such as that of Dreadhorde Arcanist or the flashback keyword, you may choose to apply Feather's replacement effect first. If you do, Feather's delayed triggered ability will return that card to your hand.
- **2021-03-19** (wotc): If an instant or sorcery spell you cast that targets your creature doesn't resolve for any reason (either because another spell or ability counters it or because all its targets are illegal as it tries to resolve), it won't be exiled. You won't return it to your hand.

### Vorinclex, Voice of Hunger

- **2017-11-17** (wotc): If Vorinclex leaves the battlefield after its second ability has triggered, that ability still resolves and the affected land won't untap during its controller's next untap step.
- **2017-11-17** (wotc): If a land you control produces multiple mana of more than one type, Vorinclex's first triggered ability adds one mana of only one of those types. You choose which of those types it adds.
- **2017-11-17** (wotc): The types of mana are white, blue, black, red, green, and colorless.

## Win-line pieces (the queue of pass1/commanders.md §6)

### Thassa's Oracle

- **2020-01-24** (wotc): Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana costs of permanents you control don't count toward your devotion to any color.
- **2020-01-24** (wotc): If you put an Aura on an opponent's permanent, you still control the Aura, and mana symbols in its mana cost count towards your devotion.
- **2020-01-24** (wotc): If an activated ability or triggered ability has an effect that depends on your devotion to a color, you count the number of mana symbols of that color among the mana costs of permanents you control as the ability resolves. The permanent with that ability will be counted if it's still on the battlefield at that time.
- **2020-01-24** (wotc): If your devotion to blue is zero at the time the triggered ability of Thassa's Oracle resolves, you don't look at or move any cards in your library. If you have no cards in your library, you win the game.
- **2020-01-24** (wotc): Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols do count toward your devotion to their color(s).
- **2020-01-24** (wotc): Mana symbols in the text boxes of permanents you control don't count toward your devotion to any color.

### Demonic Consultation

- **2004-10-04** (wotc): There is no way to make this card affect your opponent. It affects "you", and "you" means the controller of the spell. It has no targets.
- **2004-10-04** (wotc): You must name a card that actually exists in the game of Magic.
- **2008-10-01** (wotc): You don't name a card until Demonic Consultation resolves.
- **2008-10-01** (wotc): If you don't reveal the named card (perhaps because it was in the top six cards of your library), you'll end up exiling your entire library. You don't lose the game at that point, but will lose the next time you're instructed to draw a card.

### Tainted Pact

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Laboratory Maniac

- **2021-03-19** (wotc): If for some reason you can't win the game (because your opponent has cast Angel's Grace this turn, for example), you won't lose for having tried to draw a card from a library with no cards in it. The draw was still replaced.
- **2021-03-19** (wotc): If two or more players each control a Laboratory Maniac and each player is instructed to draw a number of cards, first the player whose turn it is draws that many cards. If this causes that player to win the game instead, the game is immediately over. If the game isn't over yet, repeat this process for each other player in turn order.

### Underworld Breach

- **2020-01-24** (wotc): After an escaped spell resolves, it returns to its owner's graveyard if it's not a permanent spell. If it is a permanent spell, it enters the battlefield and will return to its owner's graveyard if it dies later. Perhaps it will escape again—good underworld security is so hard to come by these days.
- **2020-01-24** (wotc): If a card has no mana cost, its escape cost is an unpayable cost, so you can't cast it for that cost.
- **2020-01-24** (wotc): Once you begin casting a spell with escape, it immediately moves to the stack. Players can't take any other actions until you're done casting the spell.
- **2020-01-24** (wotc): If a card has multiple abilities giving you permission to cast it, such as two escape abilities or an escape ability and a flashback ability, you choose which one to apply. The others have no effect.
- **2020-01-24** (wotc): Escape's permission doesn't change when you may cast the spell from your graveyard.
- **2020-01-24** (wotc): If you're casting an adventurer card or split card with escape, you choose how you wish to cast it, then pay the appropriate cost (for the Adventure, the creature, or the half of the split card you chose) plus exiling three cards.
- **2020-01-24** (wotc): If a card with escape is put into your graveyard during your turn, you'll be able to cast it right away if it's legal to do so, before an opponent can take any actions.
- **2020-01-24** (wotc): If you cast a spell with its escape permission, you can't choose to apply any other alternative costs or to cast it without paying its mana cost. If it has any additional costs, you must pay those.
- **2020-01-24** (wotc): If a spell you're casting with escape has an additional cost of discarding cards or sacrificing permanents, you may exile cards discarded or sacrificed this way to pay that part of its escape cost.
- **2020-01-24** (wotc): To determine the total cost of a spell, start with the mana cost or alternative cost you're paying (such as an escape cost), add any cost increases, then apply any cost reductions. The mana value of the spell remains unchanged, no matter what the total cost to cast it was and no matter whether an alternative cost was paid.

### Lion's Eye Diamond

- **2004-10-04** (wotc): The ability is a mana ability, so it is activated and resolves as a mana ability, but it can only be activated at times when you can cast an instant. Yes, this is a bit weird.

### Brain Freeze

- **2022-12-08** (wotc): A copy of a spell can be countered like any other spell, but it must be countered individually. Countering a spell with storm won't affect the copies.
- **2022-12-08** (wotc): The triggered ability that creates the copies can itself be countered by anything that can counter a triggered ability. If it is countered, no copies will be put onto the stack.
- **2022-12-08** (wotc): Spells cast from zones other than a player's hand and spells that were countered are counted by the storm ability.
- **2022-12-08** (wotc): You may choose new targets for any of the copies. You can make different choices for each copy.
- **2022-12-08** (wotc): The copies are put directly onto the stack. They aren't cast and won't be counted by other spells with storm cast later in the turn.

### Ad Nauseam

- **2026-03-20** (wotc): You may continue to reveal cards with Ad Nauseam even if your life total has been reduced to 0 or less. If you continue, you will continue to lose life, dropping your life total into negative numbers. As soon as you stop, you'll lose the game as a state-based action.
- **2026-03-20** (wotc): If a card in a player's library has {X} in its mana cost, X is 0 for the purpose of determining its mana value.
- **2026-03-20** (wotc): Each time you put the revealed card into your hand and lose the appropriate amount of life, you decide whether to continue by revealing another card. You don't decide in advance how many cards to put into your hand this way.

### Hermit Druid

- **2025-01-24** (wotc): If you reveal all of the cards in your library without revealing any basic land cards, you’ll put all of the revealed cards into your graveyard. (Yes, that’s your whole library. Hopefully you have a plan.)

### Isochron Scepter

- **2020-08-07** (wotc): You cast the copy while the ability is resolving and still on the stack. You can't wait to cast it later in the turn.
- **2020-08-07** (wotc): If you don't want to cast the copy, you can choose not to; the copy ceases to exist the next time state-based actions are checked.
- **2020-08-07** (wotc): If a spell has {X} in its mana cost, you must choose 0 as the value of X when casting it without paying its mana cost.
- **2020-08-07** (wotc): If Isochron Scepter leaves the battlefield while the activated ability is on the stack, the ability can still make a copy. On the other hand, if the imprinted card leaves the exile zone while the activated ability is on the stack, the copy can't be made.
- **2020-08-07** (wotc): If you cast a spell "without paying its mana cost," you can't choose to cast it for any alternative costs. You can, however, pay additional costs. If the card has any mandatory additional costs, those must be paid to cast the spell.

### Dramatic Reversal

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Heliod, Sun-Crowned

- **2020-01-24** (wotc): Heliod can be the target of its own triggered ability.
- **2020-01-24** (wotc): A noncreature enchantment with a +1/+1 counter on it will be unaffected by that counter until it becomes a creature, at which time it will get +1/+1 for that counter.
- **2020-01-24** (wotc): When a God enters the battlefield, your devotion to its color (including the mana symbols in the mana cost of the God itself) will determine if a creature entered the battlefield or not for abilities that trigger whenever a creature enters the battlefield.
- **2020-01-24** (wotc): Counters put on a God remain on it while it's not a creature, even if they have no effect.
- **2020-01-24** (wotc): Hybrid mana symbols, monocolored hybrid mana symbols, and Phyrexian mana symbols do count toward your devotion to their color(s).
- **2020-01-24** (wotc): If an activated ability or triggered ability has an effect that depends on your devotion to a color, you count the number of mana symbols of that color among the mana costs of permanents you control as the ability resolves. The permanent with that ability will be counted if it's still on the battlefield at that time.
- **2020-01-24** (wotc): In a Two-Headed Giant game, life gained by your teammate won't cause the ability to trigger, even though it caused your team's life total to increase.
- **2020-01-24** (wotc): Multiple instances of lifelink on the same creature are redundant.
- **2020-01-24** (wotc): If a God stops being a creature, it loses the type creature and the creature type God. It continues to be a legendary enchantment.
- **2020-01-24** (wotc): Mana symbols in the text boxes of permanents you control don't count toward your devotion to any color.
- **2020-01-24** (wotc): The abilities of Gods function as long as they're on the battlefield, regardless of whether they're creatures.
- **2020-01-24** (wotc): The type-changing ability that can make a God not be a creature functions only on the battlefield. It's always a creature card in other zones, regardless of your devotion to its color. It's always a creature spell while it's on the stack.
- **2020-01-24** (wotc): If you put an Aura on an opponent's permanent, you still control the Aura, and mana symbols in its mana cost count towards your devotion.
- **2020-01-24** (wotc): Colorless and generic mana symbols ({C}, {0}, {1}, {2}, {X}, and so on) in mana costs of permanents you control don't count toward your devotion to any color.
- **2020-01-24** (wotc): If a God is attacking or blocking and it stops being a creature, it will be removed from combat. It won't rejoin combat if it resumes being a creature later during that combat.
- **2020-01-24** (wotc): If an effect causes a God to lose all abilities, its ability that causes it to stop being a creature still applies if appropriate.
- **2020-01-24** (wotc): As a God enters the battlefield, your devotion to its color will determine whether any replacement effects that affect creatures entering the battlefield apply to that God. Because replacement effects are considered before the God is on the battlefield, the mana symbols in its mana cost won't be counted when determining this.
- **2020-01-24** (wotc): Heliod's triggered ability triggers just once for each life-gaining event, whether it's 1 life from Daxos, Blessed by the Sun or 3 life from Cling to Dust. If you gain an amount of life "for each" of something or "equal to the number" of something, that life is gained as one event and Heliod's ability triggers only once.
- **2020-01-24** (wotc): If a creature is dealt lethal damage at the same time that you gain life, it can't receive a counter from Heliod's ability in time to save it.
- **2023-07-28** (wotc): Each creature with lifelink dealing combat damage causes a separate life-gaining event. For example, if two creatures you control with lifelink deal combat damage at the same time, Heliod's ability will trigger twice. However, if a single creature you control with lifelink deals combat damage to multiple creatures, players, planeswalkers, and/or battles at the same time (perhaps because it has trample or was blocked by more than one creature), the ability will trigger only once.

### Walking Ballista

- **2020-08-07** (wotc): If Walking Ballista has been dealt damage or had its toughness reduced by an effect, this limits how many times you'll be able to remove +1/+1 counters from it in a single turn. For example, if it has three +1/+1 counters on it and has been dealt 1 damage this turn, it will be destroyed immediately after you activate the ability a second time and you won't be able to activate it a third time.
- **2020-08-07** (wotc): A casting cost of {X}{X} means that you pay twice X. If you want X to be 3, you pay {6} to cast Walking Ballista.

### Kiki-Jiki, Mirror Breaker

- **2021-03-19** (wotc): If another creature becomes a copy of, or enters the battlefield as a copy of, the token, that creature will copy the creature card the token is copying, except it will also have haste. However, you won't sacrifice the new copy at the beginning of the next end step.
- **2021-03-19** (wotc): If a copied creature is a token that isn't a copy of something else, the copy copies the original characteristics of that token as stated by the effect that created it.
- **2021-03-19** (wotc): If the copied creature has {X} in its mana cost, X is 0.
- **2021-03-19** (wotc): Any enters-the-battlefield abilities of the copied creature will trigger when the token enters the battlefield. Any "as [this permanent] enters the battlefield" or "[this permanent] enters the battlefield with" abilities of the copied creature card will also work.
- **2021-03-19** (wotc): If Kiki-Jiki's ability creates multiple tokens due to a replacement effect (such as the one Doubling Season creates), you'll sacrifice each of them.
- **2021-03-19** (wotc): If a copied creature is copying something else, the token you create will use the copiable values of the target creature. In most cases, it will just be a copy of whatever that creature is copying.
- **2021-03-19** (wotc): The token copies exactly what was printed on the original creature (except that the copy also has haste) and nothing else (unless it's copying a creature that's a token or that's copying something else; see below). It doesn't copy whether the creature is tapped or untapped, whether it has any counters on it or Auras and/or Equipment attached to it, or any non-copy effects that changed its power, toughness, types, color, and so on. Most notably, if the target creature isn't normally a creature, the copy won't be a creature.

### Zealous Conscripts

- **2021-03-19** (wotc): The triggered ability can target any permanent, including one that's untapped or one that you already control.

### Felidar Guardian

- **2017-02-09** (wotc): If a creature token is exiled this way, it will cease to exist and will not return to the battlefield.
- **2017-02-09** (wotc): After the permanent returns to the battlefield, it will be a new object with no connection to the permanent that was exiled. It won’t have any additional abilities it may have had when it was exiled. Any +1/+1 counters on it or Auras attached to it are removed, and any Equipment will no longer be attached.

### Restoration Angel

- **2021-03-19** (wotc): If a token is exiled this way, it will cease to exist and won't return to the battlefield.
- **2021-03-19** (wotc): Once the exiled creature returns, it's considered a new object with no relation to the object that it was. Auras attached to the exiled creature will be put into their owners' graveyards. Equipment attached to the exiled creature will become unattached and remain on the battlefield. Any counters on the exiled creature will cease to exist.
- **2021-03-19** (wotc): When an effect returns the exiled card "under your control," you control it indefinitely after that. If you had temporarily gained control of a creature, it won't return to its previous controller. In a multiplayer game, if a player leaves the game, all cards that player owns leave as well. If you leave the game, a creature you took with Restoration Angel's effect is exiled.

### Devoted Druid

- **2018-12-07** (wotc): You put the -1/-1 counter on Devoted Druid as a cost to activate its ability, not when it resolves. If paying the cost causes Devoted Druid to have 0 toughness, it's put into your graveyard before you can untap it and before you can even pay the cost again.
- **2018-12-07** (wotc): If you can't put -1/-1 counters on Devoted Druid (due to an effect such as that of Solemnity), you can't activate its second ability. If you can put counters on it, but that is modified by an effect (such as that of Vizier of Remedies), you can activate the ability even if paying the cost causes no counters to be put on Devoted Druid.

### Vizier of Remedies

- **2017-04-18** (wotc): If an effect puts Vizier of Remedies onto the battlefield with one or more -1/-1 counters on it, its effect won’t apply. This is because you must control Vizier of Remedies before the creature begins to enter the battlefield for its effect to apply. The same is true of any creatures entering the battlefield with -1/-1 counters on them at the same time as Vizier of Remedies enters the battlefield.
- **2017-04-18** (wotc): If multiple creatures with wither and/or infect deal damage to a creature at once, Vizier of Remedies causes only one counter fewer to be put on that creature. Its effect doesn’t apply separately for each creature dealing damage.
- **2017-04-18** (wotc): “Put on a creature you control” includes that creature entering the battlefield with -1/-1 counters on it. If a creature would enter the battlefield under your control with a number of -1/-1 counters on it while you control Vizier of Remedies, it enters with that many counters minus one.
- **2017-04-18** (wotc): Each additional Vizier of Remedies you control will decrease the number of -1/-1 counters put on a creature by one.
- **2017-04-18** (wotc): If a creature you control is dealt damage by a source with wither or infect, that much damage is dealt, but one fewer -1/-1 counter is put on your creature. For example, if a 2/2 creature with lifelink and infect is blocked by Vizier of Remedies, the first creature’s controller gains 2 life and puts one -1/-1 counter on Vizier of Remedies.

### Archangel of Thune

- **2020-08-07** (wotc): If a creature you control is dealt lethal damage at the same time that you gain life, it won't receive a counter from Archangel of Thune's ability in time to save it.
- **2020-08-07** (wotc): In a Two-Headed Giant game, life gained by your teammate won't cause the ability to trigger, even though it caused your team's life total to increase.
- **2020-08-07** (wotc): If you gain an amount of life “for each” of something, that life is gained as one event and the ability triggers only once.
- **2020-08-07** (wotc): Each creature with lifelink dealing combat damage causes a separate life-gaining event. For example, if two creatures you control with lifelink deal combat damage at the same time, the ability will trigger twice. However, if a single creature you control with lifelink deals combat damage to multiple creatures, players, and/or planeswalkers at the same time (perhaps because it has trample or was blocked by more than one creature), the ability will trigger only once.

### Spike Feeder

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Coalition Victory

- **2006-09-25** (wotc): When Coalition Victory resolves, it checks for the five basic land types (Plains, Island, Swamp, Mountain, Forest) and the five colors (white, blue, black, red, green). If a single land has multiple types and/or a single creature is multiple colors, it will count all those types and/or colors.

### Displacer Kitten

- **2022-06-10** (wotc): When the card returns to the battlefield, it will be a new object with no connection to the card that was exiled. Auras attached to the exiled creature will be put into their owners' graveyards. Any Equipment will become unattached and remain on the battlefield. Any counters on the exiled permanent will cease to exist.
- **2022-06-10** (wotc): If a token is exiled this way, it will cease to exist and won't return to the battlefield.

### Peregrine Drake

- **2022-12-08** (wotc): You choose which lands to untap as the triggered ability resolves. They aren't targeted, and they don't have to be lands that you control.

### Ghostly Flicker

- **2017-03-14** (wotc): The two targets can have different card types. For example, you can target one artifact and one creature with Ghostly Flicker.

### Archaeomancer

- **2018-12-07** (wotc): If an instant or sorcery spell puts Archaeomancer onto the battlefield, its ability can target that card in your graveyard.

### Mnemonic Wall

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Basalt Monolith

- **2020-08-07** (wotc): Basalt Monolith's last ability can untap it as often as you can pay for it. If you believe you've found a way to generate an unbounded amount of mana with it, you're probably right.

### Grim Monolith

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Rings of Brighthearth

- **2020-11-10** (wotc): If paying the activation cost of the ability includes sacrificing Rings of Brighthearth, the ability won't be copied. At the time the ability is considered activated (after all costs are paid), Rings of Brighthearth is no longer on the battlefield.
- **2020-11-10** (wotc): The triggered ability of Rings of Brighthearth and the copy it creates both resolve before the ability that caused it to trigger. They resolve even if that ability is countered.
- **2020-11-10** (wotc): You can't pay {2} more than once for each time the triggered ability of Rings of Brighthearth resolves.
- **2020-11-10** (wotc): An activated mana ability is one that produces mana as it resolves, not one that costs mana to activate.
- **2020-11-10** (wotc): If the ability has {X} in its cost, the copy uses the same value of X.
- **2020-11-10** (wotc): The copy will have the same targets as the ability it's copying unless you choose new ones. You may change any number of the targets, including all of them or none of them. If, for one of the targets, you can't choose a new legal target, then it remains unchanged (even if the current target is illegal).

### Power Artifact

- **2004-10-04** (wotc): Only affects the generic mana part of activation costs. Colored parts of mana costs are not affected.
- **2004-10-04** (wotc): Can be placed on artifacts with no or zero activation costs, but this has no effect on them. It does not increase the cost to one.
- **2006-07-15** (wotc): Can't reduce Snow mana costs.
- **2016-06-08** (wotc): Activated abilities contain a colon. They're generally written "[Cost]: [Effect]." Some keywords are activated abilities and will have colons in their reminder text.

### Craterhoof Behemoth

- **2025-04-04** (wotc): The value of X is calculated only once, as Craterhoof Behemoth’s last ability resolves.
- **2025-04-04** (wotc): Craterhoof Behemoth’s triggered ability affects only creatures you control at the time it resolves. Creatures you begin to control later in the turn won’t gain trample and get +X/+X.

### Natural Order

- **2016-06-08** (wotc): Sacrificing a green creature is part of Natural Order's cost. You can't sacrifice more creatures to search for more creature cards, and you can't cast Natural Order at all if you control no green creatures.
- **2016-06-08** (wotc): Players can respond to this spell only after it's been cast and all its costs have been paid. No one can try to destroy the creature you sacrificed to stop you from casting this spell or to make you sacrifice a different one.

### Green Sun's Zenith

- **2011-06-01** (wotc): If this spell doesn't resolve, none of its effects occur. In particular, it will go to the graveyard rather than to its owner's library.
- **2016-06-08** (wotc): In most cases, if you own Green Sun's Zenith and cast it, you'll shuffle your library twice. In practice, shuffling once is sufficient, but effects that care about you shuffling your library (like Psychogenic Probe, for example) will see that you've shuffled twice.
- **2016-06-08** (wotc): If Green Sun's Zenith is countered, none of its effects will happen. Notably, it will be put into its owner's graveyard rather than shuffled into its owner's library.
- **2016-06-08** (wotc): If you own Green Sun's Zenith, but an opponent casts it (due to Knowledge Pool's effect, for example), that opponent searches their library for an appropriate creature card, then shuffles that library. That opponent then shuffles Green Sun's Zenith into your library. You won't shuffle any library in this case.

### Finale of Devastation

- **2019-05-03** (wotc): No player may take action between the time you reveal which creature card you'll put onto the battlefield and the time it gets +X/+X and haste if X is 10 or more. Any abilities that trigger as it enters the battlefield will be put onto the stack after your creatures get +X/+X and haste.
- **2019-05-03** (wotc): If you don't find a creature card with mana value X or less, creatures you control still get +X/+X and gain haste if X is 10 or more.
- **2019-05-03** (wotc): If X is 10 or more, the creature card you just put onto the battlefield will get +X/+X and haste.
- **2019-05-03** (wotc): If a creature card in your library or graveyard has {X} in its mana cost, X is considered to be 0.

### Chord of Calling

- **2020-08-07** (wotc): If a card in a player's library has {X} in its mana cost, X is considered to be 0.
- **2024-01-12** (wotc): When calculating a spell's total cost, include any alternative costs, additional costs, or anything else that increases or reduces the cost to cast the spell. Convoke applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or mana value.
- **2024-01-12** (wotc): Tapping a multicolored creature using convoke will pay for {1} or one mana of your choice of any of that creature's colors.
- **2024-01-12** (wotc): You can tap any untapped creature you control to convoke a spell, even one you haven't controlled continuously since the beginning of your most recent turn.
- **2024-01-12** (wotc): Tapping an untapped creature that's attacking or blocking to convoke a spell won't cause that creature to stop attacking or blocking.
- **2024-01-12** (wotc): If a creature you control has a mana ability with {T} in the cost, activating that ability while casting a spell with convoke will result in the creature being tapped before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly, if you sacrifice a creature to activate a mana ability while casting a spell with convoke, that creature won't be on the battlefield when you pay the spell's costs, so you won't be able to tap it for convoke.
- **2024-01-12** (wotc): When using convoke to cast a spell with {X} in its mana cost, first choose the value for X. That choice, plus any cost increases or decreases, will determine the spell's total cost. Then you can tap creatures you control to help pay that cost. For example, if you cast Chord of Calling (a spell with convoke and mana cost {X}{G}{G}{G}) and choose X to be 3, the total cost is {3}{G}{G}{G}. If you tap two green creatures and two red creatures, you'll have to pay {1}{G}.
- **2024-01-12** (wotc): Because convoke isn't an alternative cost, it can be used in conjunction with alternative costs.

### Earthcraft

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Squirrel Nest

Scryfall lists no rulings for this card (rulings bulk 20261007210031).

### Strionic Resonator

- **2018-03-16** (wotc): Strionic Resonator targets a triggered ability that has triggered and is on the stack and creates another instance of that ability on the stack. It doesn't cause any object to gain an ability.
- **2018-03-16** (wotc): If a triggered ability is linked to a second ability, copies of that triggered ability are also linked to that second ability. If the second ability refers to "the exiled card," it refers to all cards exiled by the triggered ability and the copy. For example, if Fiend Hunter's enters-the-battlefield ability is copied and two creatures are exiled, they both return when Fiend Hunter leaves the battlefield.
- **2018-03-16** (wotc): Triggered abilities use the word "when," "whenever," or "at." They're often written as "[Trigger condition], [effect]."
- **2018-03-16** (wotc): In some cases involving linked abilities, an ability requires information about "the exiled card." When this happens, the ability gets multiple answers. If these answers are being used to determine the value of a variable, the sum is used. For example, if Elite Arcanist's enters-the-battlefield ability is copied, two cards are exiled. The value of X in the activation cost of Elite Arcanist's other ability is the sum of the two cards' mana values. As the ability resolves, you create copies of both cards and can cast none, one, or both of the copies in any order.
- **2018-03-16** (wotc): The source of the copy is the same as the source of the original ability.
- **2018-03-16** (wotc): If the triggered ability divides damage or distributes counters among a number of targets (for example, the ability of Bogardan Hellkite), the division and number of targets can't be changed. If you choose new targets, you must choose the same number of targets.
- **2018-03-16** (wotc): If the triggered ability is modal (that is, if it says, "Choose one —" or similar), the mode is copied and can't be changed.
- **2018-03-16** (wotc): Any choices made when the triggered ability resolves won't have been made yet when it's copied. Any such choices will be made separately when the copy resolves. If the triggered ability asks you to pay a cost (such as that of Frenzied Goblin), you pay that cost for the copy.

