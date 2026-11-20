/* Gathers the winners of the deck searches into one list of decks that the round robin can read.
   node tools/origins/collect.js [--prefix opt-] [--tag search] [--out optimized.json]

   A search that ends on one of the real lists adds nothing: the real list is already in the round robin. */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { D, DK } = L;

const OUT = path.join(__dirname, 'out');
const SHORT = { 'van-helsing': 'vh', 'three-not-so-little-pigs': 'pigs', 'legion-of-the-dead': 'legion', dracula: 'drac', 'robin-hood': 'robin', 'king-arthur': 'arthur',
  'queen-of-hearts': 'qoh', dorothy: 'dorothy', merlin: 'merlin', mulan: 'mulan', 'wicked-stepmother': 'stepmother', 'dr-frank': 'frank' };
const prefix = String(L.arg('prefix', 'opt-')), tag = String(L.arg('tag', 'search'));
const same = (a, b) => a.slice().sort().join() === b.slice().sort().join();
const decks = [];
let games = 0;
for (const leg of D.LEGENDS) {
  const f = path.join(OUT, prefix + leg + '.json');
  if (!fs.existsSync(f)) continue;
  const o = JSON.parse(fs.readFileSync(f, 'utf8'));
  games += o.played || 0;
  // a one-card change confirmed by refine.js replaces the search's own winner
  const rf = path.join(OUT, 'refine-' + leg + '.json');
  const r = prefix === 'opt-' && fs.existsSync(rf) ? JSON.parse(fs.readFileSync(rf, 'utf8')) : null;
  const refined = r && same(r.start, o.cards) ? r : null;
  if (refined) { games += refined.played || 0; if (refined.changed) console.log(`  ${leg}: list changed by the one-card test`); }
  const cards = refined && refined.changed ? refined.cards : o.cards;
  const real = DK.META.find((d) => d.legend === leg && same(d.cards, cards));
  if (real) { console.log(`  ${leg}: the search ends on the real list ${real.key}`); continue; }
  decks.push({ key: SHORT[leg] + '-' + tag, legend: leg, name: D.CARDS[leg].name + ' (' + (tag === 'search' ? 'search' : 'second search') + ')', cards: cards.slice().sort((a, b) => D.CARDS[a].cost - D.CARDS[b].cost || a.localeCompare(b)), source: 'search', author: 'simulation' });
}
const out = path.join(OUT, String(L.arg('out', 'optimized.json')));
fs.writeFileSync(out, JSON.stringify({ decks, games }, null, 1));
console.log(`${decks.length} searched lists -> ${out} (${games} search games)`);
module.exports = { SHORT };
