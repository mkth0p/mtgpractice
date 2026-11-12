/* Does a deck need its own pilot? One weight of the bot's evaluation at a time is scaled down and up for the deck's
   pilot only, and the deck replays the same games against the field (whose pilots keep the standard weights).
   node tools/origins/pilot.js --deck vh-control [--field out/field.json] [--seeds 4] [--bot fast] [--scales 0.4,2.5] */
const fs = require('fs');
const path = require('path');
const L = require('./lib.js');
const { E, A } = L;
const O = require('./optimize.js');

async function scan(deck, field, opt = {}) {
  const base = typeof opt.bot === 'string' ? L.PRESET[opt.bot] : (opt.bot || L.PRESET.fast);
  const scales = opt.scales || [0.4, 2.5];
  const keys = opt.keys || Object.keys(A.W0).filter((k) => k !== 'a1');
  const variants = [{ k: null, sc: 1, W: base.W || {} }];
  for (const k of keys) for (const sc of scales) { const W = Object.assign({}, base.W || {}); W[k] = +(Math.max(A.W0[k], 0.05) * sc).toFixed(3); variants.push({ k, sc, W }); }
  const tasks = variants.map((v) => ({ mod: 'optimize.js', fn: 'evalDeck', cand: deck, field, n: opt.seeds || 4, seed: opt.seed || 31, bot: Object.assign({}, base, { W: v.W }), oppBot: base }));
  const rs = await L.pool(tasks);
  return variants.map((v, i) => ({ k: v.k, sc: v.sc, W: v.W, p: O.score(rs[i], field), games: rs[i].games.reduce((a, b) => a + b, 0) }));
}

if (require.main === module) (async () => {
  const deck = L.BY_KEY[String(L.arg('deck'))];
  const field = L.arg('field', null) ? JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('field'))), 'utf8')).decks
    : L.DK.META.filter((d) => d.key !== deck.key).map((d) => ({ key: d.key, legend: d.legend, cards: d.cards, w: 1 }));
  const res = await scan({ legend: deck.legend, cards: deck.cards }, field, { bot: String(L.arg('bot', 'fast')), seeds: L.arg('seeds', 4), scales: String(L.arg('scales', '0.4,2.5')).split(',').map(Number), keys: L.arg('keys', null) ? String(L.arg('keys')).split(',') : null });
  const b = res[0];
  console.log(`${deck.key}: base ${L.pct(b.p)} over ${b.games} games (noise of a difference about ±${(100 * 1.3 / Math.sqrt(b.games)).toFixed(1)} points)`);
  const by = {};
  for (const r of res.slice(1)) (by[r.k] || (by[r.k] = [])).push(`x${r.sc}: ${(100 * (r.p - b.p)).toFixed(1).padStart(5)}`);
  for (const k in by) console.log('  ' + k.padEnd(9) + String(A.W0[k]).padEnd(6) + by[k].join('   '));
})();
module.exports = { scan };
