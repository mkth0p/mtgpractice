// Card-by-card checks of the Origins TCG engine. Run: node tools/origins/test-engine.js
const E = require('../../origins/engine.js');
const A = require('../../origins/ai.js');
const { META } = require('../../origins/decks.js');
const X = E._;
let fails = 0, n = 0;
function ok(cond, msg) { n++; if (!cond) { fails++; console.log('FAIL: ' + msg); } }
function eq(a, b, msg) { ok(a === b, msg + ' (got ' + a + ', want ' + b + ')'); }

const VAN = ['thumbelina', 'huck-finn', 'christopher-robin', 'baloo', 'paul-bunyan', 'wicked-stepsisters', 'itsy-bitsy-spider', 'musketeer', 'basilisk', 'roo', 'cowardly-lion', 'bigfoot'];
function fresh(o = {}) {
  const deck = { legend: 'huck-finn', cards: VAN };
  const G = E.newGame([deck, deck], Object.assign({ seed: 7, noLocations: !o.locs, mulligan: false, first: 0 }, o, { rules: Object.assign({ powers: false }, o.rules) }));
  E.startRound(G);
  if (o.locs) for (const l of G.locs) l.revealed = true;
  G.P[0].hand = []; G.P[1].hand = [];
  G.P[0].mana = G.P[1].mana = 99;
  return G;
}
const put = (G, p, id, lane, slot, extra) => X.summon(G, p, id, lane, slot, extra);
function give(G, p, id, extra) { const c = X.mkCard(G, id, extra); G.P[p].hand.push(c); return c; }
function play(G, p, id, a = {}) { const c = give(G, p, id); X.playCard(G, p, Object.assign({ hid: c.hid, lane: 0, slot: 0 }, a)); X.checkEnd(G); return c; }
const at = (G, p, lane, slot) => G.board[p][lane][slot];
const inHand = (G, p, id) => G.P[p].hand.filter((c) => c.id === id).length;
const bar = (G, p, lane) => G.P[p].barrier[lane];

// ---- combat
{ const G = fresh(); put(G, 0, 'huck-finn', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G);
  ok(!at(G, 0, 0, 0) && !at(G, 1, 0, 0), 'simultaneous strike kills both'); eq(bar(G, 0, 0), 20, 'blocked: no barrier damage'); }
{ const G = fresh(); put(G, 0, 'huck-finn', 1, 2); X.fight(G); eq(bar(G, 1, 1), 17, 'unblocked unit hits barrier'); eq(bar(G, 1, 0), 20, 'other barrier untouched'); }
{ const G = fresh(); put(G, 0, 'baloo', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(bar(G, 1, 0), 20, 'no spill without trample'); eq(at(G, 0, 0, 0).dmg, 2, 'damage persists'); }
{ const G = fresh(); put(G, 0, 'bigfoot', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(bar(G, 1, 0), 16, 'trample spills 4'); }
{ const G = fresh({ rules: { spill: true } }); put(G, 0, 'baloo', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(bar(G, 1, 0), 16, 'spill rule'); }
{ const G = fresh(); put(G, 0, 'musketeer', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); ok(at(G, 0, 0, 0) && !at(G, 1, 0, 0), 'first strike kills before being hit'); eq(at(G, 0, 0, 0).dmg, 0, 'first striker unhurt'); }
{ const G = fresh(); put(G, 0, 'basilisk', 0, 0); put(G, 1, 'paul-bunyan', 0, 0); X.fight(G); ok(!at(G, 0, 0, 0) && !at(G, 1, 0, 0), 'deathtouch kills Paul Bunyan'); }
{ const G = fresh(); put(G, 0, 'shield-maiden', 0, 0); put(G, 1, 'huck-finn', 0, 0); X.fight(G); ok(at(G, 0, 0, 0) && !at(G, 0, 0, 0).shield && !at(G, 1, 0, 0), 'shield absorbs one hit'); }
{ const G = fresh(); const h = put(G, 0, 'huck-finn', 0, 0); put(G, 1, 'cowardly-lion', 0, 2); X.fight(G); eq(bar(G, 1, 0), 20, 'defender protects the barrier'); eq(at(G, 1, 0, 2).dmg, 3, 'defender takes the hit');
  ok(h.dead, 'and strikes back with its Power (2 into a 3/2)'); eq(bar(G, 0, 0), 18, 'then attacks from its own space'); }
{ const G = fresh(); const h = put(G, 0, 'baloo', 0, 0); const e = put(G, 1, 'thumbelina', 0, 0); const d = put(G, 1, 'cowardly-lion', 0, 2); X.fight(G); eq(d.dmg, 0, 'a Defender does not pull an attack aimed at a character'); ok(e.dead, 'the character in front takes it'); }
{ const G = fresh(); put(G, 0, 'baloo', 0, 0); const d = put(G, 1, 'cowardly-lion', 0, 2); d.stun = true; X.fight(G); eq(bar(G, 1, 0), 14, 'a stunned Defender does not defend'); eq(bar(G, 0, 0), 20, 'or attack'); ok(!d.stun, 'stun wears off after combat'); }
{ const G = fresh(); put(G, 0, 'bigfoot', 0, 0); put(G, 1, 'davy-crockett', 0, 2); X.fight(G); eq(bar(G, 1, 0), 16, 'trample carries past a Defender (6 into 2 health)'); }
{ const G = fresh(); const d1 = put(G, 1, 'cowardly-lion', 0, 2); const d2 = put(G, 1, 'bridge-troll', 0, 1); put(G, 0, 'huck-finn', 0, 0); X.fight(G); eq(d1.dmg, 3, 'the Defender that entered first answers'); eq(d2.dmg, 0, 'the other does not'); }
{ const G = fresh(); const m = put(G, 0, 'marian', 0, 0); put(G, 1, 'paul-bunyan', 0, 0); X.fight(G); ok(m.dead, 'Marian dies in the exchange'); eq(bar(G, 1, 0), 18, 'her Snipe still fires'); }
{ const G = fresh(); const h = put(G, 1, 'huntsman', 0, 1); put(G, 1, 'lady-of-the-lake', 2, 0); h.kw = Object.assign({}, h.kw, { defender: true }); put(G, 0, 'huck-finn', 0, 0); X.fight(G); ok(h.p === 5 && h.h === 5, 'Huntsman On Kill also when it kills as a Defender'); }
{ const G = fresh(); put(G, 1, 'cowardly-lion', 0, 2); X.fight(G); eq(bar(G, 0, 0), 18, 'defender still attacks its own space'); }
{ const G = fresh(); put(G, 0, 'guy-of-gisborne', 0, 0); X.fight(G); eq(bar(G, 1, 0), 12, 'double attack + snipe 1 unblocked: 3 + 3 + 1 + 1'); }
{ const G = fresh(); put(G, 0, 'marian', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(bar(G, 1, 0), 18, 'snipe goes past the blocker'); }
{ const G = fresh(); const u = put(G, 0, 'baloo', 0, 0); u.stun = true; X.fight(G); eq(bar(G, 1, 0), 20, 'stunned unit skips attack'); X.fight(G); eq(bar(G, 1, 0), 14, 'stun lasts one combat'); }
{ const G = fresh(); put(G, 0, 'red-knight', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(bar(G, 0, 0), 15, 'Red Knight gives trample to the unit across (6-1)'); }
{ const G = fresh(); const q = put(G, 0, 'don-quixote', 0, 0); const e = put(G, 1, 'shahrazad', 0, 2); X.fight(G); eq(bar(G, 1, 0), 20, 'Don Quixote: enemies here have Defender'); eq(bar(G, 0, 0), 20, 'and he defends his own barrier');
  eq(q.dmg, 2, 'he took 1 striking and 1 defending'); ok(e.dead, 'the enemy took 2 defending and 2 attacking'); }

// ---- barriers and winning
{ const G = fresh(); G.P[1].barrier[0] = 3; put(G, 0, 'baloo', 0, 0); X.fight(G); eq(G.P[1].notches, 1, 'break costs a notch'); eq(bar(G, 1, 0), 40, 'barrier returns at 40'); ok(!G.over, 'one break is not a loss');
  G.P[1].barrier[1] = 1; put(G, 0, 'thumbelina', 1, 0); X.fight(G); ok(G.over && G.winner === 0, 'second break wins'); }
{ const G = fresh(); G.P[0].notches = 1; G.P[1].notches = 1; G.P[0].barrier[0] = 1; G.P[1].barrier[0] = 1; put(G, 0, 'thumbelina', 0, 0); put(G, 1, 'thumbelina', 0, 1); X.fight(G); ok(G.over && G.winner === 1 || G.winner === 0, 'sequential spaces: first to strike wins'); eq(G.winner, 0, 'left space resolves first'); }
{ const G = fresh(); G.P[0].deck = []; G.P[1].deck = []; E.startRound(G); eq(bar(G, 0, 0), 19, 'fatigue 1'); E.startRound(G); eq(bar(G, 0, 2), 17, 'fatigue 2'); }
{ const d = META[0]; const G = E.newGame([d, d], { seed: 3 }); eq(G.P[0].hand.length + G.P[0].deck.length, 25 + (G.P[0].legend === 'van-helsing' ? 1 : 0), '25 cards + tools'); }
{ const d = META[0]; const G = E.newGame([d, d], { seed: 3, rules: { legend: 'hand', powers: false } }); eq(G.P[0].hand.length, 5, 'legend in hand rule'); ok(G.P[0].hand.some((c) => c.id === 'van-helsing'), 'legend is the fifth card'); }

// ---- rebirth, deaths
{ const G = fresh(); put(G, 0, 'mummy', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); ok(at(G, 0, 0, 0) && at(G, 0, 0, 0).reb, 'mummy reborn'); eq(E.hp(at(G, 0, 0, 0)), 1, 'reborn with 1 health'); X.fight(G); ok(!at(G, 0, 0, 0), 'rebirth only once'); }
{ const G = fresh(); put(G, 0, 'golden-egg', 0, 1); put(G, 1, 'thumbelina', 0, 1); X.fight(G); eq(at(G, 0, 0, 1).id, 'golden-goose', 'egg hatches on its space'); }
{ const G = fresh(); put(G, 0, 'golden-egg', 0, 1); play(G, 0, 'boogeyman', { lane: 0, slot: 0 }); eq(at(G, 0, 0, 1).id, 'golden-goose', 'boogeyman eats the egg'); ok(at(G, 0, 0, 0), 'boogeyman stays'); }
{ const G = fresh(); play(G, 0, 'boogeyman', { lane: 0, slot: 0 }); ok(!at(G, 0, 0, 0), 'boogeyman alone destroys itself'); }
{ const G = fresh(); put(G, 0, 'baby-bear', 0, 0); put(G, 1, 'huck-finn', 0, 1); X.fight(G); eq(bar(G, 0, 0), 17, 'barrier hit'); eq(at(G, 1, 0, 1).dmg, 1, 'baby bear bites back'); }
{ const G = fresh(); put(G, 0, 'baby-bear', 0, 0); put(G, 1, 'huck-finn', 0, 0); X.fight(G); eq(inHand(G, 0, 'papa-bear'), 1, 'baby bear leaves papa bear'); }
{ const G = fresh(); put(G, 0, 'mama-bear', 0, 0); put(G, 1, 'baloo', 0, 2); X.fight(G); ok(!at(G, 1, 0, 2), 'mama bear destroys the attacker'); }
{ const G = fresh(); put(G, 0, 'ali-baba', 0, 0); const d = G.P[0].deck.length; X.fight(G); eq(G.P[0].hand.length, 1, 'ali baba draws'); eq(G.P[0].deck.length, d - 1, 'from the deck'); }
{ const G = fresh(); put(G, 0, 'queen-of-hearts', 1, 0); put(G, 0, 'jack-in-the-box', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(bar(G, 1, 0), 16, 'queen of hearts repeats On Death'); }
{ const G = fresh(); put(G, 0, 'banshee', 0, 0); const h = put(G, 0, 'huck-finn', 1, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(h.p, 4, 'banshee buffs allies'); }
{ const G = fresh(); put(G, 0, 'three-blind-mice', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(E.units(G, 0).filter((u) => u.id === 'mouse').length, 2, 'two mice'); }
{ const G = fresh(); put(G, 0, 'imhotep', 0, 0); put(G, 1, 'baloo', 0, 0); const t = put(G, 1, 'thumbelina', 0, 1); X.fight(G); ok(!at(G, 1, 0, 1), 'imhotep hits all enemies here'); }
{ const G = fresh(); put(G, 0, 'cockatrice', 0, 0); put(G, 1, 'paul-bunyan', 0, 0); put(G, 1, 'baloo', 2, 0); X.fight(G); ok(!at(G, 1, 0, 0), 'cockatrice deathtouch'); X.fight(G); ok(!at(G, 0, 0, 0), 'cockatrice dies'); ok(!at(G, 1, 2, 0), 'and takes a random enemy with it'); }
{ const G = fresh(); const k = put(G, 0, 'koschei', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); const c = G.P[0].hand.find((x) => x.id === 'koschei'); ok(c && c.bp === 2 && c.bh === 2, 'koschei returns +2/+2'); }
{ const G = fresh(); const c = give(G, 0, 'little-lamb'); const l = put(G, 0, 'little-lamb', 1, 0); put(G, 0, 'mary', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(l.p, 4, 'lamb on board +3'); eq(c.bp, 3, 'lamb in hand +3'); }
{ const G = fresh(); put(G, 0, 'huntsman', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(at(G, 0, 0, 0).p, 5, 'huntsman On Kill'); }

// ---- spells
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'bullseye', { tgt: t.uid }); eq(t.dmg, 3, 'bullseye 3'); play(G, 0, 'axe-throw', { tgt: t.uid }); ok(!at(G, 1, 0, 0), 'axe throw 4 finishes'); }
{ const G = fresh(); const t = put(G, 1, 'paul-bunyan', 0, 0); play(G, 0, 'dark-omen', { tgt: t.uid }); ok(!at(G, 1, 0, 0), 'dark omen destroys'); }
{ const G = fresh(); const t = put(G, 1, 'paul-bunyan', 0, 0); play(G, 0, 'stroke-of-midnight', { tgt: t.uid }); ok(!at(G, 1, 0, 0) && inHand(G, 1, 'paul-bunyan') === 1, 'stroke of midnight bounces'); }
{ const G = fresh(); const t = put(G, 1, 'not-so-little-pig', 0, 0); play(G, 0, 'stroke-of-midnight', { tgt: t.uid }); eq(inHand(G, 1, 'not-so-little-pig'), 1, 'bounced token becomes a card'); }
{ const G = fresh(); play(G, 0, 'lightning-strike', { lane2: 1 }); eq(bar(G, 1, 1), 17, 'lightning strike on barrier'); play(G, 0, 'obliterate', { lane2: 1 }); eq(bar(G, 1, 1), 7, 'obliterate on barrier'); }
{ const G = fresh(); put(G, 1, 'boitata', 2, 0); play(G, 0, 'lightning-strike', { lane2: 1 }); eq(bar(G, 1, 1), 20, 'boitata protects'); eq(bar(G, 0, 1), 17, 'and reflects'); }
{ const G = fresh(); const d0 = G.P[0].deck.length; play(G, 0, 'mind-palace'); eq(G.P[0].hand.length, 2, 'mind palace draws 2'); }
{ const G = fresh(); put(G, 0, 'merlin', 2, 0); play(G, 0, 'mind-palace'); eq(G.P[0].hand.length, 4, 'merlin repeats the first spell'); play(G, 0, 'mind-palace'); eq(G.P[0].hand.length, 6, 'not the second'); }
{ const G = fresh(); play(G, 0, 'merlins-prophecy'); play(G, 0, 'mind-palace'); eq(G.P[0].hand.length, 4, 'prophecy repeats the next spell'); }
{ const G = fresh(); const a = put(G, 0, 'huck-finn', 0, 0); put(G, 0, 'glinda', 1, 0); play(G, 0, 'reinforcements'); eq(a.p, 4, 'glinda +1 power on spell'); eq(E.units(G, 0).filter((u) => u.id === 'merry-man').length, 2, 'two merry men'); }
{ const G = fresh(); put(G, 0, 'sandman', 0, 0); const c = give(G, 0, 'mind-palace'); eq(E.cost(G, 0, c), 2, 'sandman discount'); const u = give(G, 0, 'baloo'); eq(E.cost(G, 0, u), 5, 'not for characters'); }
{ const G = fresh(); const t = put(G, 0, 'golden-egg', 0, 0); play(G, 0, 'trash-for-treasure', { tgt: t.uid }); eq(G.P[0].hand.length, 2, 'trash for treasure draws 2'); eq(at(G, 0, 0, 0).id, 'golden-goose', 'and the egg hatches'); }
{ const G = fresh(); const a = put(G, 0, 'baloo', 0, 0); const e = put(G, 1, 'paul-bunyan', 1, 1); play(G, 0, 'en-passant', { tgt: a.uid, lane2: 1, slot2: 1 }); eq(a.lane, 1, 'en passant moves'); eq(e.dmg, 6, 'and hits across'); }
{ const G = fresh(); const a = put(G, 0, 'baloo', 0, 0); const b = put(G, 0, 'thumbelina', 2, 2); play(G, 0, 'twister-toss', { tgt: a.uid, lane2: 2, slot2: 2 }); ok(a.lane === 2 && a.slot === 2 && b.lane === 0 && b.slot === 0, 'twister toss swaps'); }
{ const G = fresh(); const a = put(G, 0, 'baloo', 0, 0); put(G, 1, 'thumbelina', 0, 0); put(G, 1, 'huck-finn', 0, 1); put(G, 1, 'paul-bunyan', 0, 2); play(G, 0, 'blow-the-house-down', { tgt: a.uid }); ok(!at(G, 1, 0, 0) && !at(G, 1, 0, 1) && at(G, 1, 0, 2).dmg === 6, 'blow the house down'); }
{ const G = fresh(); put(G, 1, 'thumbelina', 0, 0); put(G, 1, 'baloo', 1, 0); play(G, 0, 'rain-of-arrows'); ok(!at(G, 1, 0, 0) && at(G, 1, 1, 0).dmg === 2, 'rain of arrows'); }
{ const G = fresh(); put(G, 1, 'thumbelina', 0, 0); put(G, 0, 'baloo', 1, 0); play(G, 0, 'forbidden-knowledge'); eq(E.units(G, 0).length + E.units(G, 1).length, 0, 'forbidden knowledge'); }
{ const G = fresh(); G.P[0].barrier[1] = 10; const t = put(G, 1, 'baloo', 1, 0); play(G, 0, 'searing-light', { tgt: t.uid }); eq(t.dmg, 4, 'searing light damage'); eq(bar(G, 0, 1), 14, 'searing light heal'); }
{ const G = fresh(); G.P[0].barrier[2] = 10; play(G, 0, 'first-aid', { lane2: 2 }); eq(bar(G, 0, 2), 16, 'first aid'); play(G, 0, 'first-aid', { lane2: 2 }); eq(bar(G, 0, 2), 20, 'healing stops at the maximum'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'poison-apple', { tgt: a.uid }); put(G, 1, 'paul-bunyan', 0, 0); X.fight(G); ok(!at(G, 1, 0, 0), 'poison apple'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'defense-matrix', { tgt: a.uid }); put(G, 1, 'paul-bunyan', 0, 0); X.fight(G); ok(at(G, 0, 0, 0), 'defense matrix'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'freeze', { tgt: t.uid }); X.fight(G); eq(bar(G, 0, 0), 20, 'freeze'); }
{ const G = fresh(); play(G, 0, 'animate-object', { lane2: 2, slot2: 1 }); eq(at(G, 0, 2, 1).id, 'broomstick', 'animate object'); }
{ const G = fresh(); const a = put(G, 0, 'christopher-robin', 0, 0); play(G, 0, 'heroic-charge'); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(bar(G, 1, 0), 15, 'heroic charge: 7 power, trample over a 2/2'); E.phantomRound(G); eq(bar(G, 1, 0), 10, 'charge ends with the round'); }
{ const G = fresh(); play(G, 0, 'piggy-bank'); E.startRound(G); eq(G.P[0].mana, 4, 'piggy bank +1 from then on'); }
{ const G = fresh(); play(G, 0, 'spellbook'); G.P[0].hand = []; E.startRound(G); const tmp = G.P[0].hand.filter((c) => c.tmp != null); eq(tmp.length, 1, 'spellbook gives a spell'); X.fight(G); eq(G.P[0].hand.filter((c) => c.tmp != null).length, 0, 'discarded before combat'); }
{ const G = fresh(); G.P[0].grave.push({ id: 'baloo', bp: 0, bh: 0 }); play(G, 0, 'its-alive'); eq(E.units(G, 0).length, 1, 'it\'s alive'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'underworld-flare', { tgt: t.uid }); ok(!at(G, 1, 0, 0), 'underworld flare 6'); }

// ---- Van Helsing
{ const G = fresh(); put(G, 0, 'van-helsing', 0, 0); X.fight(G); eq(inHand(G, 0, 'van-helsings-tools'), 1, 'tools before combat'); X.fight(G); eq(inHand(G, 0, 'van-helsings-tools'), 1, 'only one'); eq(E.cost(G, 0, G.P[0].hand[0]), 0, 'tools are free'); }
{ const G = fresh(); const t = put(G, 1, 'basilisk', 0, 0); play(G, 0, 'van-helsings-tools', { tgt: t.uid, mode: 0 }); put(G, 0, 'paul-bunyan', 0, 0); X.fight(G); ok(at(G, 0, 0, 0), 'holy water removes deathtouch'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'van-helsings-tools', { tgt: t.uid, mode: 3 }); ok(at(G, 1, 0, 0), 'stake fails on undamaged'); play(G, 0, 'van-helsings-tools', { tgt: t.uid, mode: 1 }); eq(t.dmg, 1, 'silver bullet 1'); play(G, 0, 'van-helsings-tools', { tgt: t.uid, mode: 3 }); ok(!at(G, 1, 0, 0), 'stake kills damaged'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'van-helsings-tools', { tgt: t.uid, mode: 2 }); X.fight(G); eq(bar(G, 0, 0), 20, 'garlic stuns'); play(G, 0, 'van-helsings-tools', { mode: 1, lane2: 2 }); eq(bar(G, 1, 2), 19, 'silver bullet on a barrier'); }

// ---- On Reveal characters
{ const G = fresh(); play(G, 0, 'three-not-so-little-pigs', { lane: 1, slot: 1 }); ok(E.unitsIn(G, 0, 0).length === 1 && E.unitsIn(G, 0, 2).length === 1 && E.unitsIn(G, 0, 1).length === 1, 'pigs at each other location'); ok(E.kw(G, E.unitsIn(G, 0, 0)[0], 'trample'), 'with trample'); }
{ const G = fresh(); put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'legion-of-the-dead'); eq(E.units(G, 0).length, 9, 'legion fills the board'); }
{ const G = fresh(); put(G, 1, 'thumbelina', 0, 0); put(G, 1, 'baloo', 2, 2); play(G, 0, 'robin-hood', { lane: 1, slot: 0 }); ok(!at(G, 1, 0, 0) && at(G, 1, 2, 2).dmg === 2, 'robin hood 2 to all'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); const b = put(G, 0, 'bridge-troll', 0, 1); play(G, 0, 'king-arthur', { lane: 1, slot: 0 }); ok(a.shield && !b.shield && at(G, 0, 1, 0).shield, 'king arthur shields Good characters'); }
{ const G = fresh(); put(G, 0, 'mulan', 2, 0); play(G, 0, 'scarecrow', { lane: 0, slot: 0 }); eq(G.P[0].hand.length, 2, 'mulan repeats On Reveal'); }
{ const G = fresh(); put(G, 1, 'morgiana', 0, 2); play(G, 0, 'scarecrow', { lane: 0, slot: 0 }); eq(G.P[0].hand.length, 0, 'morgiana stops On Reveal here'); play(G, 0, 'scarecrow', { lane: 1, slot: 0 }); eq(G.P[0].hand.length, 1, 'not elsewhere'); }
{ const G = fresh(); play(G, 0, 'dracula', { lane: 1, slot: 0 }); eq(E.unitsIn(G, 0, 1).filter((u) => u.id === 'brides-of-dracula').length, 1, 'brides here'); const c = give(G, 0, 'baloo'); X.discard(G, 0, c); eq(bar(G, 1, 1), 19, 'brides ping on discard'); }
{ const G = fresh(); G.P[0].grave.push({ id: 'dracula', bp: 0, bh: 0 }); const c = give(G, 0, 'baloo'); X.discard(G, 0, c); eq(inHand(G, 0, 'dracula'), 1, 'dracula returns on discard'); }
{ const G = fresh(); const d = put(G, 0, 'ugly-duckling', 0, 0); const c = give(G, 0, 'koschei'); X.discard(G, 0, c); eq(d.id, 'beautiful-swan', 'duckling transforms'); const k = G.P[0].hand.find((x) => x.id === 'koschei'); ok(k && k.bp === 2, 'koschei discarded returns bigger'); }
{ const G = fresh(); const c = give(G, 0, 'aladdin'); X.discard(G, 0, c); eq(E.units(G, 0).filter((u) => u.id === 'aladdin').length, 1, 'aladdin discarded is summoned'); }
{ const G = fresh(); put(G, 1, 'baloo', 0, 0); const c = give(G, 0, 'underworld-flare'); X.discard(G, 0, c); ok(!at(G, 1, 0, 0), 'flare discarded hits'); }
{ const G = fresh(); give(G, 0, 'baloo'); give(G, 0, 'roo'); play(G, 0, 'asanbosam'); eq(inHand(G, 0, 'roo'), 0, 'asanbosam discards the even card'); eq(inHand(G, 0, 'baloo'), 1, 'keeps the odd one'); }
{ const G = fresh(); give(G, 0, 'baloo'); give(G, 0, 'mummy'); play(G, 0, 'quasimodo'); eq(inHand(G, 0, 'mummy'), 0, 'quasimodo discards the cheapest'); eq(G.P[0].hand.length, 2, 'and draws'); }
{ const G = fresh(); give(G, 0, 'baloo'); give(G, 0, 'mummy'); play(G, 0, 'genie'); eq(G.P[0].hand.length, 3, 'genie: three spells'); ok(G.P[0].hand.every((c) => E.CARDS[c.id].spell), 'all spells'); }
{ const G = fresh(); give(G, 0, 'mummy'); give(G, 0, 'obliterate'); const t = put(G, 1, 'paul-bunyan', 0, 0); play(G, 0, 'captain-ahab', { lane: 1, slot: 0, tgt: t.uid }); eq(t.dmg, 10, 'ahab deals the discarded cost'); }
{ const G = fresh(); play(G, 0, 'bagheera', { lane: 0, slot: 1 }); eq(at(G, 0, 0, 1).p, 3, 'bagheera middle'); play(G, 0, 'bagheera', { lane: 0, slot: 0 }); eq(at(G, 0, 0, 0).p, 1, 'bagheera side'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'galahad', { lane: 1, slot: 0 }); ok(a.p === 3 && a.h === 3 && at(G, 0, 1, 0).p === 4, 'galahad'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'piglet', { lane: 0, slot: 1 }); eq(a.p, 3, 'piglet'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); play(G, 0, 'black-knight', { lane: 0, slot: 0 }); eq(t.dmg, 2, 'black knight'); }
{ const G = fresh(); put(G, 1, 'paul-bunyan', 2, 0); play(G, 0, 'jack', { lane: 0, slot: 0 }); ok(!at(G, 1, 2, 0), 'jack'); }
{ const G = fresh(); play(G, 0, 'frog-prince', { lane: 0, slot: 0, mode: 1 }); eq(at(G, 0, 0, 0).h, 5, 'frog health mode'); play(G, 0, 'frog-prince', { lane: 0, slot: 1, mode: 0 }); eq(at(G, 0, 0, 1).p, 5, 'frog power mode'); }
{ const G = fresh(); play(G, 0, 'rumple', { lane: 0, slot: 0 }); E.startRound(G); eq(G.P[0].mana, 4, 'rumple +1 next round'); E.startRound(G); eq(G.P[0].mana, 4, 'only once'); }
{ const G = fresh(); G.P[0].barrier[0] = 5; play(G, 0, 'tin-woodman', { lane: 0, slot: 0 }); eq(bar(G, 0, 0), 13, 'tin woodman heals 8'); play(G, 0, 'jekyll', { lane: 0, slot: 1 }); eq(bar(G, 0, 0), 16, 'jekyll heals 3'); }
{ const G = fresh(); G.P[0].barrier[0] = 5; put(G, 1, 'puck', 2, 0); play(G, 0, 'tin-woodman', { lane: 0, slot: 0 }); eq(G.P[0].notches, 1, 'puck turns the heal into damage (5 - 8 breaks)'); }
{ const G = fresh(); G.P[0].barrier[0] = 5; const ph = put(G, 0, 'phuong-hoang', 1, 0); play(G, 0, 'jekyll', { lane: 0, slot: 1 }); eq(ph.p, 3, 'phuong hoang grows on heal'); }
{ const G = fresh(); G.P[0].barrier[1] = 5; put(G, 0, 'shahrazad', 1, 0); X.draw(G, 0, 2); eq(bar(G, 0, 1), 7, 'shahrazad heals per card'); }
{ const G = fresh(); G.P[0].barrier[0] = 10; put(G, 0, 'jill', 0, 0); put(G, 1, 'thumbelina', 0, 0); X.fight(G); eq(bar(G, 0, 0), 12, 'jill'); }
{ const G = fresh(); put(G, 1, 'thumbelina', 0, 0); put(G, 1, 'huck-finn', 0, 1); play(G, 0, 'ellen-trechend', { lane: 0, slot: 2 }); eq(at(G, 0, 0, 2).p, 9, 'ellen trechend'); }
{ const G = fresh(); play(G, 0, 'three-musketeers', { lane: 2, slot: 1 }); eq(E.unitsIn(G, 0, 2).length, 3, 'three musketeers'); }
{ const G = fresh(); play(G, 0, 'mowgli', { lane: 2, slot: 1 }); eq(E.units(G, 0).filter((u) => u.id === 'baloo' && u.lane !== 2).length, 1, 'mowgli brings baloo elsewhere'); }
{ const G = fresh(); play(G, 0, 'tweedledum', { lane: 2, slot: 1 }); eq(E.units(G, 0).length, 2, 'tweedledee'); }
{ const G = fresh(); const t = put(G, 1, 'paul-bunyan', 0, 0); play(G, 0, 'white-queen', { lane: 1, slot: 0, tgt: t.uid }); eq(inHand(G, 1, 'paul-bunyan'), 1, 'white queen'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 0); play(G, 0, 'fairy-godmother', { lane: 1, slot: 0, tgt: a.uid }); eq(a.p, 5, 'fairy godmother'); }
{ const G = fresh(); const a = put(G, 0, 'thumbelina', 0, 1); const b = put(G, 0, 'baloo', 1, 2); play(G, 0, 'magic-carpet', { lane: 2, slot: 2, mode: 0 }); ok(a.slot === 0 && b.slot === 1, 'magic carpet left'); eq(G.P[0].moves, 2, 'moves counted'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 2, 0); play(G, 0, 'flying-monkey', { lane: 0, slot: 0, tgt: t.uid }); eq(t.lane, 0, 'flying monkey pulls it here'); }
{ const G = fresh({ locs: ['gallows', 'the-well', 'stomping'] }); play(G, 0, 'mothman', { lane: 0, slot: 0 }); ok(G.locs[0].ruined, 'mothman ruins'); put(G, 1, 'thumbelina', 0, 1); put(G, 0, 'thumbelina', 0, 1); ok(at(G, 1, 0, 1), 'gallows no longer kills'); }
{ const G = fresh(); give(G, 0, 'bridge-troll'); play(G, 0, 'necromancer'); eq(E.units(G, 0).filter((u) => u.id === 'zombie').length, 2, 'necromancer: evil discard summons'); }
{ const G = fresh(); give(G, 0, 'baloo'); play(G, 0, 'necromancer'); eq(inHand(G, 0, 'zombie'), 2, 'necromancer: zombies to hand'); }
{ const G = fresh(); G.enemyPlayed[0][1] = true; play(G, 0, 'little-john', { lane: 1, slot: 0 }); eq(at(G, 0, 1, 0).p, 6, 'little john'); }

// ---- triggers on play
{ const G = fresh(); const b = put(G, 0, 'beast', 0, 0); put(G, 0, 'beauty', 0, 1); play(G, 0, 'thumbelina', { lane: 1, slot: 0 }); eq(b.p, 3, 'beast'); eq(G.P[0].hand.length, 1, 'beauty'); }
{ const G = fresh(); put(G, 0, 'lancelot', 1, 0); put(G, 0, 'lady-of-the-lake', 2, 0); play(G, 0, 'thumbelina', { lane: 1, slot: 1 }); const t = at(G, 0, 1, 1); ok(t.p === 4 && t.kw.defender, 'lancelot + lady of the lake'); }
{ const G = fresh(); const t = put(G, 1, 'toto', 0, 0); play(G, 0, 'thumbelina', { lane: 0, slot: 0 }); ok(t.lane !== 0 && t.p === 2, 'toto runs'); }
{ const G = fresh(); put(G, 0, 'queen-of-the-night', 1, 0); play(G, 0, 'mind-palace'); eq(bar(G, 1, 1), 18, 'queen of the night'); }
{ const G = fresh(); put(G, 0, 'sorcerers-apprentice', 1, 0); play(G, 0, 'mind-palace'); eq(E.units(G, 0).filter((u) => u.id === 'broomstick').length, 1, 'apprentice'); }

// ---- move
{ const G = fresh(); const r = put(G, 0, 'roo', 0, 0); E.resolveRound(G, [[{ move: r.uid, lane: 1, slot: 2 }], []]); eq(r.lane, 1, 'roo moves'); E.startRound(G); E.resolveRound(G, [[{ move: r.uid, lane: 2, slot: 2 }], []]); eq(r.lane, 1, 'only once per game by default'); }
{ const G = fresh({ rules: { moveOnce: false } }); const r = put(G, 0, 'roo', 0, 0); E.resolveRound(G, [[{ move: r.uid, lane: 1, slot: 2 }], []]); E.startRound(G); E.resolveRound(G, [[{ move: r.uid, lane: 2, slot: 2 }], []]); eq(r.lane, 2, 'every round under the other reading'); }
{ const G = fresh(); const d = put(G, 0, 'dorothy', 0, 0); const r = put(G, 0, 'roo', 2, 0); E.resolveRound(G, [[{ move: r.uid, lane: 1, slot: 2 }, { move: d.uid, lane: 1, slot: 0 }], []]); eq(d.p, 5, 'dorothy grows when an ally moves, and when she does'); E.startRound(G); E.resolveRound(G, [[{ move: d.uid, lane: 2, slot: 0 }], []]); eq(d.lane, 2, 'dorothy moves every round'); }
{ const G = fresh(); const pg = put(G, 0, 'pegasus', 0, 0); const cs = put(G, 0, 'card-soldier', 0, 1); put(G, 0, 'kanga', 2, 0); X.moveUnit(G, pg, 1, 0); X.moveUnit(G, cs, 1, 1); eq(pg.p, 4, 'pegasus doubles'); eq(at(G, 0, 0, 1).id, 'card-soldier', 'card soldier leaves a copy'); X.fight(G); eq(pg.p, 5, 'kanga buffs movers'); }
{ const G = fresh(); const w = put(G, 0, 'wicked-witch-of-the-west', 0, 1); put(G, 1, 'thumbelina', 0, 1); X.fight(G); eq(inHand(G, 0, 'flying-monkey'), 1, 'witch makes a monkey'); eq(w.slot, 0, 'and steps left'); }

// ---- after combat, misc
{ const G = fresh(); const w = put(G, 0, 'big-bad-wolf', 0, 0); const g = put(G, 0, 'the-green-knight', 1, 0); put(G, 1, 'thumbelina', 1, 0); X.fight(G); ok(w.p === 4 && w.h === 4, 'wolf grows'); eq(g.dmg, 0, 'green knight heals'); }
{ const G = fresh(); put(G, 0, 'impundulu', 0, 0); X.fight(G); eq(inHand(G, 0, 'lightning-strike'), 1, 'impundulu'); E.startRound(G); G.P[1].hand = []; X.fight(G); eq(inHand(G, 0, 'lightning-strike'), 1, 'old one discarded, new one added'); }
{ const G = fresh(); put(G, 0, 'king-shahryar', 0, 0); E.startRound(G); eq(G.P[0].hand.length, 2, 'shahryar extra draw'); X.fight(G); eq(G.P[0].hand.length, 1, 'discarded before combat'); }
{ const G = fresh(); put(G, 0, 'old-macdonald', 0, 0); const c = give(G, 1, 'baloo'); X.discard(G, 1, c); eq(G.P[1].deck.filter((x) => x.id === 'pumpkin').length, 3, 'pumpkins shuffled in'); G.P[1].deck.push(X.mkCard(G, 'pumpkin')); const tot = () => G.P[1].barrier.reduce((a, b) => a + b, 0); const t0 = tot(); const h0 = G.P[1].hand.length; X.draw(G, 1, 1); ok(tot() <= t0 - 5, 'pumpkin burns 5'); eq(G.P[1].hand.length, h0 + 1, 'then draws'); }
{ const G = fresh(); for (let i = 0; i < 12; i++) X.addNew(G, 0, 'thumbelina'); eq(G.P[0].hand.length, 10, 'hand limit'); }
{ const G = fresh(); G.P[0].grave.push({ id: 'franks-monster', bp: 0, bh: 0 }); put(G, 0, 'dr-frank', 0, 0); X.fight(G); const m = E.units(G, 0).find((u) => u.id === 'franks-monster'); ok(m && m.p === 10, 'dr frank raises, monster doubled'); }
{ const G = fresh(); G.P[0].barrier[0] = 10; put(G, 0, 'franken-bride', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(bar(G, 0, 0), 14, 'franken bride heals on rebirth'); }
{ const G = fresh(); const d = put(G, 0, 'davy-crockett', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); ok(G.P[0].deck.some((c) => c.bp === 2), 'davy crockett buffs the top character'); }
{ const G = fresh(); put(G, 0, 'humpty', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(G.P[0].hand.length, 1, 'humpty'); }
{ const G = fresh(); const b = put(G, 0, 'billy', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(at(G, 1, 0, 0).dmg, 4, 'billy'); }

// ---- priority
{ const G = fresh(); const mine = give(G, 0, 'thumbelina'); const dom = give(G, 1, 'little-john'); G.prio = 0; E.resolveRound(G, [[{ hid: mine.hid, lane: 0, slot: 0 }], [{ hid: dom.hid, lane: 0, slot: 1 }]]); eq(at(G, 1, 0, 1).p, 6, 'second to reveal sees the first'); }
{ const G = fresh(); const mine = give(G, 0, 'thumbelina'); const dom = give(G, 1, 'little-john'); G.prio = 1; E.resolveRound(G, [[{ hid: mine.hid, lane: 0, slot: 0 }], [{ hid: dom.hid, lane: 0, slot: 1 }]]); eq(at(G, 1, 0, 1).p, 6, 'and so does the first: the enemy card was put down this round'); }
{ const G = fresh(); const dom = give(G, 1, 'little-john'); E.resolveRound(G, [[], [{ hid: dom.hid, lane: 0, slot: 1 }]]); eq(at(G, 1, 0, 1).p, 4, 'no enemy card here, no bonus'); }
{ const G = fresh(); G.P[0].mana = 3; const a = give(G, 0, 'baloo'); const b = give(G, 0, 'thumbelina'); E.resolveRound(G, [[{ hid: a.hid, lane: 0, slot: 0 }, { hid: b.hid, lane: 0, slot: 1 }], []]); ok(!at(G, 0, 0, 0) && at(G, 0, 0, 1), 'cannot overspend mana'); }

// ---- locations
{ const G = fresh({ locs: ['gallows', 'human-cannon', 'cloning-lab'] }); put(G, 1, 'paul-bunyan', 0, 0); play(G, 0, 'thumbelina', { lane: 0, slot: 0 }); ok(!at(G, 1, 0, 0), 'gallows'); play(G, 0, 'baloo', { lane: 1, slot: 0 }); ok(!at(G, 0, 1, 0), 'cannon destroys'); eq(bar(G, 1, 1), 14, 'cannon fires'); play(G, 0, 'huck-finn', { lane: 2, slot: 0 }); eq(E.unitsIn(G, 0, 2).length, 3, 'cloning lab'); }
{ const G = fresh({ locs: ['wall-dumpty', 'field-mice', 'amphitheatre'] }); play(G, 0, 'golden-egg', { lane: 0, slot: 0 }); eq(at(G, 0, 0, 0).id, 'golden-goose', 'wall of dumpty'); play(G, 0, 'baloo', { lane: 1, slot: 0 }); ok(at(G, 0, 1, 0).stun, 'field of mice'); put(G, 0, 'bigfoot', 2, 0); put(G, 1, 'thumbelina', 2, 0); X.fight(G); eq(bar(G, 1, 2), 10, 'amphitheatre: 12 damage, 2 to kill, 10 through'); }
{ const G = fresh({ locs: ['burial', 'mirror', 'anti-magic'] }); put(G, 0, 'jack-in-the-box', 0, 0); put(G, 1, 'baloo', 0, 0); X.fight(G); eq(bar(G, 1, 0), 16, 'burial grounds'); play(G, 0, 'scarecrow', { lane: 1, slot: 0 }); eq(G.P[0].hand.length, 2, 'mirror dimension'); put(G, 0, 'basilisk', 2, 0); put(G, 1, 'paul-bunyan', 2, 0); X.fight(G); ok(at(G, 1, 2, 0), 'anti-magic vault'); }
{ const G = fresh({ locs: ['the-hill', 'training-dojo', 'burnturn'] }); put(G, 0, 'thumbelina', 0, 0); put(G, 1, 'baloo', 0, 2); const d = put(G, 0, 'huck-finn', 1, 0); const b = put(G, 0, 'baloo', 2, 0); X.fight(G); ok(!at(G, 0, 0, 0) && at(G, 1, 0, 2), 'the hill'); eq(d.p, 4, 'dojo'); eq(b.dmg, 1, 'burnturn'); }

// ---- legendary powers
{ const mk = (legend) => ({ legend, cards: VAN }); const g = (l) => E.newGame([mk(l), mk('huck-finn')], { seed: 5, noLocations: true });
  let G = g('king-arthur'); const dm = G.P[0].hand.find((c) => c.id === 'defense-matrix'); ok(dm && E.cost(G, 0, dm) === 0, 'king arthur: free defense matrix');
  G = g('robin-hood'); const be = G.P[0].hand.find((c) => c.id === 'bullseye'); ok(be && E.cost(G, 0, be) === 0, 'robin hood: free bullseye');
  G = g('three-not-so-little-pigs'); ok([0, 1, 2].every((l) => E.unitsIn(G, 0, l).length === 1), 'pigs: a little pig in each location');
  G = g('legion-of-the-dead'); eq(E.units(G, 0).length, 1, 'legion: one zombie');
  G = g('mulan'); eq(inHand(G, 0, 'reflection'), 1, 'mulan: reflection');
  G = E.newGame([mk('three-not-so-little-pigs'), mk('huck-finn')], { seed: 5, noLocations: true, rules: { powers: false } }); eq(E.units(G, 0).length, 0, 'powers can be switched off'); }
{ const G = fresh(); play(G, 0, 'scarecrow', { lane: 0, slot: 0 }); play(G, 0, 'galahad', { lane: 1, slot: 0 }); const h = G.P[0].hand.length; play(G, 0, 'reflection'); eq(G.P[0].hand.length, h + 1, 'reflection repeats scarecrow'); eq(at(G, 0, 0, 0).p, 3, 'and galahad (+1 twice)'); }
{ const d = META.find((x) => x.legend === 'van-helsing'); const G = E.newGame([d, d], { seed: 5 }); eq(inHand(G, 0, 'van-helsings-tools'), 1, 'van helsing starts with tools'); }

// ---- rules read in the game files (placement, moves, keywords, locations)
{ const G = fresh(); const r = put(G, 0, 'roo', 0, 0); const c = give(G, 0, 'thumbelina'); E.resolveRound(G, [[{ hid: c.hid, lane: 0, slot: 0 }, { move: r.uid, lane: 2, slot: 1 }], []]);
  ok(r.lane === 2 && r.slot === 1, 'Move reaches any free space'); eq(at(G, 0, 0, 0).id, 'thumbelina', 'moves come first, so the space it left can be used the same round'); }
{ const G = fresh(); const r = put(G, 0, 'roo', 0, 0); put(G, 0, 'baloo', 2, 1); E.resolveRound(G, [[{ move: r.uid, lane: 2, slot: 1 }], []]); eq(r.lane, 0, 'cannot move onto an ally'); ok(!r.usedMove, 'and the Move is not spent'); }
{ const G = fresh(); G.prio = 0; const e = give(G, 0, 'ellen-trechend'); const a = give(G, 1, 'thumbelina'); const b = give(G, 1, 'huck-finn');
  E.resolveRound(G, [[{ hid: e.hid, lane: 1, slot: 0 }], [{ hid: a.hid, lane: 1, slot: 1 }, { hid: b.hid, lane: 1, slot: 2 }]]); eq(at(G, 0, 1, 0).p, 9, 'Ellen Trechend counts enemy cards that are still face down'); }
{ const G = fresh(); G.prio = 0; const t = put(G, 1, 'paul-bunyan', 2, 0); const m = give(G, 0, 'flying-monkey'); const a = give(G, 1, 'baloo'); const b = give(G, 1, 'bridge-troll');
  E.resolveRound(G, [[{ hid: m.hid, lane: 0, slot: 0, tgt: t.uid }], [{ hid: a.hid, lane: 0, slot: 0 }, { hid: b.hid, lane: 0, slot: 1 }]]);
  ok(t.lane === 0 && t.slot === 2, 'a face-down card holds its space'); ok(at(G, 1, 0, 0) && at(G, 1, 0, 0).id === 'baloo' && at(G, 1, 0, 1).id === 'bridge-troll', 'and reveals where it was put'); }
{ const G = fresh(); G.P[0].mana = 4; const sm = give(G, 0, 'sandman'); const mp = give(G, 0, 'mind-palace'); E.resolveRound(G, [[{ hid: sm.hid, lane: 0, slot: 0 }, { hid: mp.hid }], []]);
  eq(inHand(G, 0, 'mind-palace'), 1, 'cards are paid when put down: a Sandman revealed this round gives no discount yet'); }
{ const G = fresh(); G.P[0].mana = 4; put(G, 0, 'sandman', 2, 0); const sm = give(G, 0, 'sandman'); const mp = give(G, 0, 'mind-palace'); E.resolveRound(G, [[{ hid: sm.hid, lane: 0, slot: 0 }, { hid: mp.hid }], []]); eq(inHand(G, 0, 'mind-palace'), 0, 'a Sandman already in play does'); }
{ const G = fresh(); const t = put(G, 1, 'baloo', 0, 0); const a = give(G, 0, 'thumbelina'); const tt = give(G, 0, 'twister-toss'); const al = put(G, 0, 'huck-finn', 2, 2);
  E.resolveRound(G, [[{ hid: tt.hid, tgt: al.uid, lane2: 1, slot2: 1 }, { hid: a.hid, lane: 1, slot: 1 }], []]); ok(al.lane === 2 && at(G, 0, 1, 1).id === 'thumbelina', 'no toss onto a card that is still face down (our simplification)'); }
{ const G = fresh(); const a = give(G, 0, 'thumbelina'); const tt = give(G, 0, 'twister-toss'); const al = put(G, 0, 'huck-finn', 2, 2); const d = put(G, 0, 'dorothy', 0, 0);
  E.resolveRound(G, [[{ hid: a.hid, lane: 1, slot: 1 }, { hid: tt.hid, tgt: al.uid, lane2: 1, slot2: 1 }], []]); ok(al.lane === 1 && at(G, 0, 2, 2).id === 'thumbelina', 'Twister Toss swaps with a revealed ally'); eq(d.p, 5, 'two moves for Dorothy'); }
{ const G = fresh(); const b = put(G, 0, 'basilisk', 0, 0); put(G, 1, 'paul-bunyan', 0, 1); put(G, 1, 'baloo', 0, 2); play(G, 0, 'blow-the-house-down', { tgt: b.uid }); eq(E.unitsIn(G, 1, 0).length, 0, 'Deathtouch works with any damage the card deals'); }
{ const G = fresh(); const bb = put(G, 0, 'baby-bear', 0, 0); play(G, 0, 'poison-apple', { tgt: bb.uid }); const e = put(G, 1, 'paul-bunyan', 0, 2); X.fight(G); ok(e.dead, 'a Baby Bear with Deathtouch destroys what hits its barrier'); }
{ const G = fresh(); const s = put(G, 1, 'shield-maiden', 0, 0); const b = put(G, 0, 'basilisk', 0, 0); X.fight(G); ok(!s.dead, 'Shield stops Deathtouch'); }
{ const G = fresh(); put(G, 1, 'puck', 2, 0); play(G, 0, 'first-aid', { lane2: 1 }); eq(bar(G, 0, 1), 14, 'Puck: a heal on a full barrier still becomes 6 damage'); const a = put(G, 0, 'baloo', 0, 0); play(G, 0, 'first-aid', { tgt: a.uid }); ok(a.dead, 'and on an unhurt character'); }
{ const G = fresh(); const ph = put(G, 0, 'phuong-hoang', 1, 0); play(G, 0, 'first-aid', { lane2: 2 }); eq(ph.p, 2, 'Phuong Hoang needs real healing'); }
{ const G = fresh(); const a = put(G, 0, 'christopher-robin', 0, 0); play(G, 0, 'heroic-charge'); play(G, 0, 'huck-finn', { lane: 1, slot: 0 }); eq(E.power(G, a), 7, 'Heroic Charge: +2 for the allies already revealed'); eq(E.power(G, at(G, 0, 1, 0)), 3, 'not for a card revealed after it'); }
{ const G = fresh(); const m = put(G, 0, 'mummy', 0, 0); const id = m.uid; put(G, 1, 'baloo', 0, 0); X.fight(G); eq(at(G, 0, 0, 0).uid, id, 'a reborn card keeps its identity'); }
{ const G = fresh(); const a = put(G, 0, 'huck-finn', 0, 0); const t = put(G, 1, 'baloo', 0, 0); put(G, 0, 'thumbelina', 1, 1); play(G, 0, 'en-passant', { tgt: a.uid, lane2: 1, slot2: 1 }); eq(a.lane, 0, 'En Passant: an occupied space cancels the move'); eq(t.dmg, 3, 'the damage still happens'); }
{ const G = fresh(); const a = put(G, 0, 'cowardly-lion', 0, 1); const b = put(G, 0, 'basilisk', 0, 2); b.p = 2; play(G, 0, 'boogeyman', { lane: 0, slot: 0 }); ok(b.dead && !a.dead, 'Boogeyman: equal Power, the lowest Health goes'); }
{ const G = fresh(); for (let l = 0; l < 3; l++) for (let sl = 0; sl < 3; sl++) if (l || sl > 1) put(G, 0, 'thumbelina', l, sl); give(G, 0, 'bridge-troll'); play(G, 0, 'necromancer', { lane: 0, slot: 0 });
  eq(E.units(G, 0).filter((u) => u.id === 'zombie').length, 1, 'Necromancer: one Zombie fits'); eq(inHand(G, 0, 'zombie'), 1, 'the other goes to the hand'); }
{ const G = fresh(); give(G, 0, 'poison-apple'); play(G, 0, 'necromancer'); eq(inHand(G, 0, 'zombie'), 2, 'Necromancer: an Evil spell does not summon'); }
{ const G = fresh(); const b = put(G, 0, 'broomstick', 0, 0); play(G, 0, 'mind-palace'); ok(b.p === 2 && b.h === 2, 'Broomstick grows when you play a spell'); }
{ const G = fresh(); put(G, 1, 'boitata', 0, 0); G.P[1].deck.push(X.mkCard(G, 'pumpkin')); const t0 = G.P[0].barrier.reduce((a, b) => a + b, 0); X.draw(G, 1, 1); eq(G.P[0].barrier.reduce((a, b) => a + b, 0), t0 - 5, 'Boitata sends a Pumpkin\'s damage across'); }
{ const G = fresh({ locs: ['wonderland', 'the-well', 'stomping'] }); G.P[0].notches = 1; G.P[1].notches = 1; G.P[0].barrier[0] = 1; G.P[1].barrier[0] = 1; put(G, 0, 'thumbelina', 0, 0); put(G, 1, 'thumbelina', 0, 1); X.fight(G); eq(G.winner, 1, 'Wonderland: the right space resolves first'); }
{ const G = fresh({ locs: ['the-well', 'stomping', 'wonderland'] }); G.P[0].notches = 1; G.P[1].notches = 1; G.P[0].barrier[2] = 1; G.P[1].barrier[0] = 1; put(G, 0, 'thumbelina', 0, 0); put(G, 1, 'thumbelina', 2, 1); X.fight(G); eq(G.winner, 1, 'Wonderland: the right location resolves first'); }
{ const G = fresh({ locs: ['ballroom', 'tectonic', 'stomping'] }); put(G, 0, 'baloo', 0, 0); put(G, 0, 'baloo', 0, 1); put(G, 1, 'baloo', 0, 2); X.fight(G);
  eq(E.unitsIn(G, 0, 0).length, 1, 'Ballroom returns one character of each player'); eq(E.unitsIn(G, 1, 0).length, 0, 'the other side too'); eq(inHand(G, 0, 'baloo') + inHand(G, 1, 'baloo'), 2, 'to their hands');
  eq(bar(G, 0, 1), 19, 'Tectonic Decay'); eq(bar(G, 1, 1), 19, 'on both barriers'); }
{ const cnt = { C: 0, R: 0, V: 0, U: 0 }; let dup = 0; const d = { legend: 'huck-finn', cards: VAN };
  for (let i = 0; i < 4000; i++) { const G = E.newGame([d, d], { seed: 1000 + i, mulligan: false }); const ids = G.locs.map((l) => l.id); if (new Set(ids).size < 3) dup++; cnt[E.LOC[ids[0]].rar]++; }
  eq(dup, 0, 'three different locations'); ok(Math.abs(cnt.C / 4000 - 0.53) < 0.03 && Math.abs(cnt.R / 4000 - 0.40) < 0.03 && Math.abs(cnt.V / 4000 - 0.06) < 0.015 && cnt.U > 5 && cnt.U < 90, 'location odds 53 / 40 / 6 / 1 (' + JSON.stringify(cnt) + ')'); }
{ const d = { legend: 'huck-finn', cards: VAN }; const G = E.newGame([d, d], { seed: 9, mulligan: false, rules: { cup: true } }); ok(G.locs.every((l) => !E.CUP_OFF.includes(l.id)), 'cup pool'); }
{ const mk = (legend) => ({ legend, cards: VAN }); const g = (l) => E.newGame([mk(l), mk('huck-finn')], { seed: 5, noLocations: true });
  let G = g('dorothy'); eq(inHand(G, 0, 'twister-toss'), 1, 'dorothy: twister toss');
  G = g('dracula'); eq(inHand(G, 0, 'brides-of-dracula'), 1, 'dracula: brides of dracula in hand');
  G = g('merlin'); eq(inHand(G, 0, 'merlins-prophecy'), 1, 'merlin: prophecy');
  G = g('dr-frank'); eq(inHand(G, 0, 'its-alive'), 1, 'dr frank: it\'s alive');
  G = g('queen-of-hearts'); eq(inHand(G, 0, 'off-with-your-head'), 1, 'queen of hearts: off with your head');
  G = g('wicked-stepmother'); const pa = G.P[0].hand.find((c) => c.id === 'poison-apple'); ok(pa && E.cost(G, 0, pa) === 0, 'wicked stepmother: free poison apple');
  for (const l of require('../../origins/cards.js').LEGENDS) ok(E.POWER[l] && require('../../origins/cards.js').POWERS[l], 'power known for ' + l); }
{ const G = E.newGame([META[0], META[3]], { seed: 21 }); E.startRound(G); const H = E.clone(G); const snap = JSON.stringify([G.P, G.board, G.locs]);
  E.resolveRound(H, [A.greedyPlan(H, 0), A.greedyPlan(H, 1)]); E.startRound(H); E.resolveRound(H, [A.greedyPlan(H, 0), A.greedyPlan(H, 1)]); eq(JSON.stringify([G.P, G.board, G.locs]), snap, 'playing a copy forward leaves the game untouched'); }

// ---- determinism and bots
{ const a = E.playGame([META[0], META[3]], [A.bots.greedy, A.bots.greedy], { seed: 11 }); const b = E.playGame([META[0], META[3]], [A.bots.greedy, A.bots.greedy], { seed: 11 }); ok(a.winner === b.winner && a.round === b.round, 'same seed, same game'); }
{ const G = E.newGame([META[0], META[3]], { seed: 11 }); E.startRound(G); const r1 = E.clone(G).rng(); const before = JSON.stringify(G.P[0].hand); A.greedyPlan(G, 0); eq(JSON.stringify(G.P[0].hand), before, 'planning does not change the game'); }
{ let bad = 0; for (let i = 0; i < 60; i++) { const G = E.playGame([META[i % META.length], META[(i * 5 + 1) % META.length]], [A.bots.random, A.bots.greedy], { seed: 100 + i }); if (!G.over || G.round > 40) bad++; for (const p of [0, 1]) for (const u of E.units(G, p)) if (u.lane == null || G.board[p][u.lane][u.slot] !== u) bad++; } eq(bad, 0, 'random vs greedy games finish cleanly'); }

console.log((n - fails) + '/' + n + ' checks passed');
process.exit(fails ? 1 : 0);
