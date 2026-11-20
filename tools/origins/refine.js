/* One-card changes of a searched list, put to a proper test.
   node tools/origins/refine.js --legend three-not-so-little-pigs [--field out/field.json] [--start out/opt-<legend>.json]
                                [--passes 5] [--looks 2] [--short 24] [--perSlot 4] [--perCard 3] [--keep 5] [--na 20]
                                [--nb 150] [--z 2] [--min 0.005] [--screen 2] [--ins 0] [--resume] [--out refine-<legend>.json]

   The deck search ends with a climb that takes a one-card change on thin evidence. This script asks the question
   properly for one list: is any one-card change better?

   1. Screen (fast bot). Every card of the pool goes into every slot of the list: 12 slots x about 106 cards. Each
      of these lists plays a few games, far too few to judge one change. But a change is "this card out, that card
      in", so every game with that card in and every game with that slot out says something about it. The value of
      a change is read from the mean of its row and the mean of its column (the least-squares fit of
      score = level + slot + card), which rests on hundreds of games per card and thousands per slot.
   2. First look (standard bot). The `short` best changes of the screen, with at most `perSlot` for one card out
      and `perCard` for one card in so that one misjudged card cannot fill the shortlist, play `na` seeds per
      opponent on the same seeds as the list itself.
   3. Confirmation (standard bot, fresh seeds). The `keep` changes that gained most so far play `nb` seeds per
      opponent on average, more against the opponents that weigh more. A change keeps the place of the card it
      replaces, so on a seed both lists start from the same shuffle with only that one card different (the games
      still part early, because the opposing bot plans against the list it faces). The gain is the weighted mean
      of the per-seed differences, and its standard error comes from those differences: about a third less
      variance than with unpaired games. Only these fresh games decide.
   4. The best change is adopted when its gain is more than `z` standard errors. The next pass confirms, on fresh
      seeds again, the changes that are still possible, gained at least `min` when last measured and were not yet
      confirmed against the list as it now stands. When none is left a new first look is taken, `looks` times at
      most. It ends when nothing is left to test or after `passes` passes.

   Kept in out/ so that a stopped run starts again where it was: refine-<legend>.screen.json (the screen) and
   refine-<legend>.memo.json (every paired run). --resume takes the passes of an earlier result file as they are
   and goes on from its list. --ins N keeps only the first N cards of the pool in the screen, for a quick test. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const L = require('./lib.js');
const { E, D } = L;
const O = require('./optimize.js');
const OUT = path.join(__dirname, 'out');

// ---- worker side: one list against one opponent, seed by seed (a seed's score: share of its two games won)
function evalSeeds(task) {
  const out = [];
  for (const s of task.seeds) { const r = L.duel({ a: task.cand, b: task.opp, n: 1, seed: s, botA: task.bot, botB: task.bot }); out.push((r.wa + r.dr / 2) / 2); }
  return out;
}

// ---- main side
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

// lists[0] is the reference. Every list plays the same seeds; the others get their gain over the reference.
async function paired(legend, lists, field, nBy, seed, bot) {
  const tasks = [];
  lists.forEach((cards, k) => field.forEach((opp, j) => {
    const seeds = [];
    for (let i = 0; i < nBy[j]; i++) seeds.push(E.mix(E.mix(seed, j), i));
    tasks.push({ mod: 'refine.js', fn: 'evalSeeds', cand: { legend, cards }, opp, seeds, bot, k, j });
  }));
  const rs = await L.pool(tasks);
  const S = lists.map(() => field.map(() => null));
  tasks.forEach((t, i) => { S[t.k][t.j] = rs[i]; });
  const W = field.reduce((a, d) => a + d.w, 0);
  return lists.map((cards, k) => {
    let p = 0, gain = 0, v = 0, games = 0;
    field.forEach((opp, j) => {
      const w = opp.w / W, s = S[k][j];
      p += w * mean(s); games += 2 * s.length;
      if (k) { const d = s.map((x, i) => x - S[0][j][i]), m = mean(d); gain += w * m; v += w * w * d.reduce((a, x) => a + (x - m) * (x - m), 0) / (d.length - 1) / d.length; }
    });
    return k ? { p, games, gain, se: Math.sqrt(v) } : { p, games };
  });
}

async function refine(opt) {
  const { legend, field } = opt;
  const log = opt.log || (() => {});
  const W = field.reduce((a, d) => a + d.w, 0);
  const nBy = (n) => field.map((d) => Math.max(8, Math.round(n * field.length * d.w / W)));
  const seed = opt.seed || 77;
  const t0 = Date.now();
  let played = 0;
  let base = opt.start.slice();
  const start = base.slice();
  const fieldId = field.map((d) => d.key + ':' + d.cards.join() + ':' + d.w).join('|');

  // 1. screen: every card of the pool in every slot
  const ins = D.POOL.filter((c) => !base.includes(c)).slice(0, opt.ins || Infinity);
  const grid = [];
  base.forEach((o, s) => ins.forEach((c) => grid.push({ s, c })));
  const id = crypto.createHash('md5').update([legend, base.join(), ins.join(), opt.screen, seed, fieldId].join('|')).digest('hex');
  let scr = opt.cache && fs.existsSync(opt.cache + '.screen.json') ? JSON.parse(fs.readFileSync(opt.cache + '.screen.json', 'utf8')) : null;
  if (!scr || scr.id !== id) {
    const res = await O.evalMany(grid.map((g) => base.map((x, i) => (i === g.s ? g.c : x))), field, { legend, n: opt.screen, bot: 'fast', seed: E.mix(seed, 1) });
    scr = { id, p: res.map((r) => +r.p.toFixed(5)), games: res.reduce((a, r) => a + r.games, 0), perList: res[0].games, seconds: Math.round((Date.now() - t0) / 1000) };
    if (opt.cache) fs.writeFileSync(opt.cache + '.screen.json', JSON.stringify(scr));
    log(` screen: ${grid.length} lists, ${scr.games} games with the fast bot, ${scr.seconds} s`);
  } else log(` screen: ${grid.length} lists, ${scr.games} games with the fast bot, read back from the earlier run`);
  played += scr.games;            // (a resumed run takes the earlier total instead, which already has it)
  const g = mean(scr.p);
  const rm = base.map((o, s) => mean(scr.p.filter((p, i) => grid[i].s === s)));
  const cm = Object.fromEntries(ins.map((c) => [c, mean(scr.p.filter((p, i) => grid[i].c === c))]));
  const ranked = grid.map((x) => ({ s: x.s, out: base[x.s], in: x.c, est: rm[x.s] + cm[x.c] - g })).sort((a, b) => b.est - a.est);
  log('  cards the list would miss least: ' + base.map((o, s) => [o, rm[s] - g]).sort((a, b) => b[1] - a[1]).slice(0, 5).map((x) => `${x[0]} ${(100 * x[1]).toFixed(1)}`).join(', '));
  log('  best cards left out: ' + ins.map((c) => [c, cm[c] - g]).sort((a, b) => b[1] - a[1]).slice(0, 10).map((x) => `${x[0]} ${(100 * x[1]).toFixed(1)}`).join(', '));

  // every paired run is kept, so a stopped run starts again where it was
  const memoFile = opt.cache ? opt.cache + '.memo.json' : null;
  const memo = memoFile && fs.existsSync(memoFile) ? JSON.parse(fs.readFileSync(memoFile, 'utf8')) : {};
  const run = async (lists, n, sd) => {
    const key = crypto.createHash('md5').update(JSON.stringify([legend, lists, nBy(n), sd, fieldId])).digest('hex');
    if (!memo[key]) { memo[key] = await paired(legend, lists, field, nBy(n), sd, 'std'); if (memoFile) fs.writeFileSync(memoFile, JSON.stringify(memo)); }
    played += memo[key].reduce((a, r) => a + r.games, 0);
    return memo[key];
  };

  const looked = new Map();          // every change looked at so far, with its latest measure and the version of the list it was measured against
  const frozen = new Set();          // slots that already changed
  const passes = [];
  let ver = 0;                       // how many changes the list has taken
  const firstP = {}, conf = {};      // the list's own score per version: in its first look, and over its confirmations
  const level = (v) => (conf[v] ? conf[v].s / conf[v].g : null);
  // A first look shares one small sample of the list between all its changes: when the list was unlucky there,
  // every gain is too high. Once the confirmations give the list a better level, most of that luck is taken back out
  // (0.7: on the same seeds a change shares about a third of the list's luck).
  const adj = (ch) => (ch.conf || level(ch.ver) == null || firstP[ch.ver] == null ? ch.gain : ch.gain + 0.7 * (firstP[ch.ver] - level(ch.ver)));
  const apply = (ch) => base.map((x, i) => (i === ch.s ? ch.in : x));
  const alive = (ch) => !frozen.has(ch.s) && !base.includes(ch.in);
  // what goes to a confirmation: changes still possible, not yet confirmed against this version of the list, that gained
  const leaders = () => [...looked.values()].filter((ch) => alive(ch) && !(ch.conf && ch.ver === ver) && adj(ch) >= opt.min).sort((a, b) => adj(b) - adj(a)).slice(0, opt.keep);
  const secs = () => ((Date.now() - t0) / 1000).toFixed(0);
  const noteFirst = (rec, list) => { firstP[ver] = rec.firstP; for (const f of list) looked.set(f.s + '>' + f.in, { s: f.s, out: f.out, in: f.in, gain: f.gain, se: f.se, ver, conf: false }); };
  const noteConfirm = (rec, list) => {
    const c = conf[ver] || (conf[ver] = { s: 0, g: 0 });
    c.s += rec.baseP * list[0].games; c.g += list[0].games;
    for (const f of list) looked.set(f.s + '>' + f.in, { s: f.s, out: f.out, in: f.in, gain: f.gain, se: f.se, ver, conf: true });
  };
  const adopt = (ch) => { base = apply(ch); frozen.add(ch.s); ver++; };
  // an earlier result of this script on the same list: take its passes as they are and go on from there
  if (opt.resume && opt.resume.start.join() === start.join()) {
    for (const r of opt.resume.passes) {
      const slot = (f) => Object.assign({ s: r.base.indexOf(f.out) }, f);
      const rec = { base: r.base, first: r.first, confirm: r.confirm, adopted: r.adopted, firstP: r.firstP, baseP: r.baseP };
      passes.push(rec);
      if (r.first.length) noteFirst(rec, r.first.map(slot));
      if (r.confirm.length) noteConfirm(rec, r.confirm.map(slot));
      if (r.adopted) adopt(slot(r.confirm.find((f) => f.out === r.adopted.out && f.in === r.adopted.in)));
    }
    played = opt.resume.played;
    log(` ${passes.length} passes taken from the earlier run, list: ${base.join(', ')}`);
  }
  let looks = passes.filter((p) => p.first.length).length;
  for (let pass = passes.length; pass < opt.passes; pass++) {
    const rec = { base: base.slice(), first: [], confirm: [], adopted: null };
    let keep = leaders();
    if (!keep.length && looks < opt.looks) {
      // 2. first look at the next changes of the screen, spread over the slots and over the cards coming in
      const cands = [], bySlot = {}, byCard = {};
      for (const ch of ranked) {
        if (cands.length >= opt.short) break;
        if (looked.has(ch.s + '>' + ch.in) || !alive(ch)) continue;
        if ((bySlot[ch.s] || 0) >= opt.perSlot || (byCard[ch.in] || 0) >= opt.perCard) continue;
        bySlot[ch.s] = (bySlot[ch.s] || 0) + 1; byCard[ch.in] = (byCard[ch.in] || 0) + 1;
        cands.push(ch);
      }
      if (cands.length) {
        looks++;
        const A = await run([base].concat(cands.map(apply)), opt.na, E.mix(seed, 100 + pass));
        rec.firstP = +A[0].p.toFixed(4);
        rec.first = cands.map((ch, i) => ({ out: base[ch.s], in: ch.in, est: +ch.est.toFixed(4), gain: +A[i + 1].gain.toFixed(4), se: +A[i + 1].se.toFixed(4), games: A[i + 1].games }));
        noteFirst(rec, rec.first.map((f, i) => Object.assign({ s: cands[i].s }, f)));
        log(` pass ${pass + 1}, first look (${A[0].games} games each, list at ${(100 * A[0].p).toFixed(1)}%, ${secs()} s): ` + rec.first.map((f) => `${f.out}>${f.in} ${(100 * f.gain).toFixed(1)}`).join(', '));
        keep = leaders();
      }
    }
    if (!keep.length) { if (rec.first.length) passes.push(rec); log(`  pass ${pass + 1}: no change left that gains, stop`); break; }
    passes.push(rec);
    // 3. confirmation on fresh seeds
    const B = await run([base].concat(keep.map(apply)), opt.nb, E.mix(seed, 200 + pass));
    rec.baseP = +B[0].p.toFixed(4);
    const list = keep.map((ch, i) => ({ s: ch.s, out: base[ch.s], in: ch.in, gain: +B[i + 1].gain.toFixed(4), se: +B[i + 1].se.toFixed(4), z: +(B[i + 1].gain / B[i + 1].se).toFixed(2), games: B[i + 1].games })).sort((a, b) => b.gain - a.gain);
    noteConfirm(rec, list);
    rec.confirm = list.map((f) => ({ out: f.out, in: f.in, gain: f.gain, se: f.se, z: f.z, games: f.games }));
    log(` pass ${pass + 1}, confirmation (${B[0].games} games each, list at ${(100 * B[0].p).toFixed(1)}%, ${secs()} s): ` + list.map((f) => `${f.out}>${f.in} ${(100 * f.gain).toFixed(1)} ±${(196 * f.se).toFixed(1)}`).join(', '));
    // 4. adopt the best change when it is clear; if none is, other changes may still be waiting for their turn
    if (list[0].z >= opt.z) { rec.adopted = { out: list[0].out, in: list[0].in }; adopt(list[0]); log(`  adopted: ${list[0].out} > ${list[0].in}`); } else log('  none of them is clearly better');
  }
  return { legend, start, cards: base, changed: start.join() !== base.join(), z: opt.z,
    screen: { lists: grid.length, games: scr.games, perList: scr.perList,
      slots: start.map((o, s) => ({ id: o, v: +(rm[s] - g).toFixed(4) })).sort((a, b) => b.v - a.v),
      ins: ins.map((c) => ({ id: c, v: +(cm[c] - g).toFixed(4) })).sort((a, b) => b.v - a.v).slice(0, 20) },
    passes, played, seconds: Math.round((Date.now() - t0) / 1000) };
}

if (require.main === module) (async () => {
  const legend = String(L.arg('legend'));
  const field = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('field', 'out/field.json'))), 'utf8')).decks;
  const from = JSON.parse(fs.readFileSync(path.resolve(__dirname, String(L.arg('start', 'out/opt-' + legend + '.json'))), 'utf8'));
  const out = path.join(OUT, String(L.arg('out', 'refine-' + legend + '.json')));
  const res = await refine({ legend, field, start: from.cards, passes: L.arg('passes', 5), short: L.arg('short', 24), perSlot: L.arg('perSlot', 4), perCard: L.arg('perCard', 3), keep: L.arg('keep', 5),
    na: L.arg('na', 20), nb: L.arg('nb', 150), z: L.arg('z', 2), min: L.arg('min', 0.005), looks: L.arg('looks', 2), screen: L.arg('screen', 2), seed: L.arg('seed', 77), ins: L.arg('ins', 0),
    cache: L.arg('ins', 0) ? null : path.join(OUT, 'refine-' + legend), resume: L.arg('resume', false) && fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, 'utf8')) : null, log: (s) => console.log(s) });
  fs.writeFileSync(out, JSON.stringify(res, null, 1));
  console.log(`${legend}: ${res.changed ? 'list changed' : 'list unchanged'} after ${res.played} games, ${res.seconds} s -> ${out}`);
  console.log('  ' + res.cards.map((c) => D.CARDS[c].name).join(', '));
})();

module.exports = { evalSeeds, paired, refine };
