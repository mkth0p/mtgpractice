/* The game analysis engine: what each of your decisions was worth, and why.

   Built on practice.js (exact replays of a recorded game). For a decision, every option you had is
   played out many times from that exact moment by the bots:
   - nothing you couldn't know is fixed: each playout reshuffles every library and deals each
     opponent a fresh hand from the cards you never saw;
   - every option faces the same shuffles and the same hands (common random numbers), so the
     differences between options aren't luck of the draw;
   - after a few rounds the position is scored by the table-wide value model (value.js), or by the
     result if the game ended;
   - playouts go where they matter: options that are clearly worse stop early, and the rest of the
     budget goes to telling the close ones apart (and to your own choice, which is always measured).

   Two passes over a game:
   - quick(rec, i): your choice against the bot's choice at one decision, a few playouts each. Run
     on every decision, it gives the win-chance curve, the accuracy, and splits what happened into
     what your decisions cost and what the draws and the table did (luck).
   - deep(rec, i): every option at one decision with a larger budget, plus what made the best option
     better (the position features that moved, a typical playout of each) and the kind of mistake.

   MK.Analysis.summarize(rec, quick, deep) turns the results into the numbers the review shows. */
(function (root) {
  "use strict";
  const MK = root.MK;
  const P = MK.Practice;
  const A = MK.Analysis = MK.Analysis || {};
  A.VERSION = 2;
  // accuracy of a random player and of the bot on this scale, from tools/sim/calibrate-analysis.js
  /*ANCHORS*/ A.ANCHORS = { random: 83.0, bot: 98.6 }; /*ANCHORS-END*/

  const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
  function pairedStats(a, b) {
    // mean and standard error of a[s] - b[s] over the seeds both have
    const d = [];
    for (let s = 0; s < a.length && s < b.length; s++) if (a[s] != null && b[s] != null) d.push(a[s] - b[s]);
    const m = mean(d);
    const v = d.length > 1 ? d.reduce((t, x) => t + (x - m) * (x - m), 0) / (d.length - 1) : 0.25;
    return { m, se: d.length ? Math.sqrt(v / d.length) : 0.5, n: d.length };
  }
  A.pairedStats = pairedStats;

  /* The seat's chance from a finished or stopped playout. */
  function equity(g, p, T) {
    if (g.over) {
      if (g.winner === p) return 1;
      if (p.lost || g.winner) return 0;
      if (g.endInfo && g.endInfo.draw) return 0.1;
    }
    if (p.lost) return 0;
    if (MK.Value && MK.Value.getModel()) { try { return MK.Value.winProb(g, p); } catch (e) { /* fall back */ } }
    return P.equity(g, p, T);
  }
  A.equity = equity;

  /* One playout of answer `raw` at decision i, with the hidden information dealt by `seed`. */
  A.playout = async function (rec, i, raw, seed, opts) {
    opts = opts || {};
    const T = (MK.TRAIN || {})[rec.deck];
    const r = await P.replay(rec, { at: i, reseed: seed, horizon: opts.horizon == null ? 3 : opts.horizon, hidden: opts.hidden !== false, onAt: (g, p, k, ctx) => ({ answer: P.deAnswer(g, raw, ctx) }) });
    if (r.diverged || r.error || !r.branched) return null;
    const g = r.g, me = g.players[rec.hero];
    const out = { eq: equity(g, me, T), won: g.over && g.winner === me, lost: !!me.lost, rounds: g.round - (r.branchRound || g.round), ended: g.over && !(g.endInfo && g.endInfo.horizon) };
    if (opts.features && MK.Value) { try { out.x = me.lost ? null : MK.Value.seatFeatures(g, me); } catch (e) { out.x = null; } }
    if (opts.log) out.log = g.logs.filter(e => e.n >= (r.logFrom || 0)).slice(0, opts.log).map(e => ({ t: e.text, me: !!(e.p && e.p.idx === rec.hero), k: e.kind || "" }));
    return out;
  };

  /* The options at decision i: { kind, round, cands: [{ label, tags, raw }] }. */
  A.options = async function (rec, i, opts) {
    opts = opts || {};
    let info = null;
    const probe = await P.replay(rec, {
      at: i,
      onAt: async (g, p, k, ctx, { heroBot }) => {
        const mine = i < rec.answers.length ? P.deAnswer(g, rec.answers[i], ctx) : undefined;
        let list = await P.candidates(g, p, k, ctx, heroBot, mine);
        list = list.concat(await extraCandidates(g, p, k, ctx, list));
        if (opts.only) list = list.filter(c => c.tags.some(t => opts.only.includes(t)));
        info = { kind: k, round: g.round, turn: g.turn, mineTurn: g.active === p, cands: list.map(c => ({ label: c.label, tags: c.tags, raw: P.serAnswer(g, k, ctx, c.answer) })) };
        return { stop: true };
      }
    });
    if (probe.diverged || probe.error || !info) return { error: probe.error || (probe.diverged ? "The replay didn't match the game." : "Nothing to compare at this moment.") };
    return info;
  };

  /* Attack and block plans the base list leaves out. */
  async function extraCandidates(g, p, k, ctx, have) {
    const out = [];
    const key = a => JSON.stringify(P.ser(g, a));
    const seen = new Set(have.map(c => c.key || key(c.answer)));
    const add = (label, a) => { const s = key(a); if (seen.has(s)) return; seen.add(s); out.push({ label, answer: a, key: s, tags: ["alt"] }); };
    try {
      if (k === "attack") {
        const cands = (ctx.candidates || []).filter(o => g.creatures(p).includes(o));
        const opps = g.players.filter(q => q !== p && !q.lost);
        if (!cands.length || !opps.length) return out;
        const weakest = opps.slice().sort((a, b) => a.life - b.life)[0];
        const openest = opps.slice().sort((a, b) => g.creatures(a).filter(o => !o.tapped).length - g.creatures(b).filter(o => !o.tapped).length)[0];
        const ev = cands.filter(o => { try { const c = g.ch(o); return c.unblockable || c.kws.has("flying") || c.kws.has("menace"); } catch (e) { return false; } });
        add(`Everything at ${weakest.name}`, cands.map(o => ({ attacker: o, target: weakest })));
        if (openest !== weakest) add(`Everything at ${openest.name}`, cands.map(o => ({ attacker: o, target: openest })));
        if (ev.length && ev.length < cands.length) add(`Evasive creatures at ${weakest.name}`, ev.map(o => ({ attacker: o, target: weakest })));
        const big = cands.slice().sort((a, b) => g.power(b) - g.power(a))[0];
        if (cands.length > 1) add(`${P.sayAnswer(g, p, "attack", ctx, [{ attacker: big, target: weakest }])}`, [{ attacker: big, target: weakest }]);
      }
    } catch (e) { /* the base options are enough */ }
    return out;
  }

  /* Plays out candidates with shared seeds, spending the budget where options are close.
     cands: [{ label, tags, raw }] (mutated: eq, se, n, loss, wins, losses, res). */
  A.race = async function (rec, i, cands, opts) {
    const n0 = opts.n0 || 6, budget = opts.budget || cands.length * 12, batch = opts.batch || 4;
    const seeds = [];
    const seedAt = s => { while (seeds.length <= s) seeds.push(((rec.seed ^ (i * 7919)) + seeds.length * 104729 + (opts.salt || 0)) >>> 0); return seeds[s]; };
    let spent = 0;
    for (const c of cands) { c.res = []; c.outs = []; c.alive = true; }
    const run = async (c, s) => {
      const o = await A.playout(rec, i, c.raw, seedAt(s), { horizon: opts.horizon, features: opts.features });
      c.res[s] = o ? o.eq : null; c.outs[s] = o; spent++;
      if (opts.onProgress) opts.onProgress(Math.min(1, spent / budget));
    };
    for (let s = 0; s < n0; s++) for (const c of cands) await run(c, s);
    const stat = () => {
      for (const c of cands) { const xs = c.res.filter(x => x != null); c.n = xs.length; c.eq = xs.length ? mean(xs) : null; }
      const ok = cands.filter(c => c.eq != null).sort((a, b) => b.eq - a.eq);
      return ok;
    };
    let round = 0;
    while (spent < budget) {
      const ok = stat();
      if (!ok.length) break;
      const best = ok[0];
      // an option stays in while it might still be the best (or within 3 points of it)
      for (const c of ok) {
        if (c === best) continue;
        const d = pairedStats(best.res, c.res);
        if (d.m - 2.2 * d.se > 0.03 && !c.tags.includes("you")) c.alive = false;
        c.sep = d.m - 2 * d.se > 0 || d.m + 2 * d.se < 0.02;
      }
      const live = ok.filter(c => c.alive);
      const open = live.filter(c => c !== best && !c.sep);
      if (!open.length && round >= 1) break;
      const next = Math.max(...live.map(c => c.res.length));
      for (let s = next; s < next + batch && spent < budget; s++) for (const c of live) { if (spent >= budget) break; await run(c, s); }
      round++;
    }
    const ok = stat();
    const best = ok[0] || null;
    for (const c of ok) {
      const d = pairedStats(best.res, c.res);
      c.loss = c === best ? 0 : Math.max(0, d.m); c.se = d.se;
      const outs = c.outs.filter(Boolean);
      c.wins = outs.filter(o => o.won).length; c.losses = outs.filter(o => o.lost).length;
    }
    return { ok, best, seeds, spent };
  };

  /* Quick look at decision i: your choice against the bot's. */
  A.quick = async function (rec, i, opts) {
    opts = opts || {};
    const t0 = Date.now();
    const o = await A.options(rec, i, { only: ["you", "bot"] });
    if (o.error) return { i, error: o.error };
    const cands = o.cands.slice(0, 2);
    const mine = cands.find(c => c.tags.includes("you"));
    if (!mine) return { i, error: "No recorded answer here." };
    const same = cands.length === 1;
    const n = opts.n || 8;
    const { ok } = await A.race(rec, i, cands, { n0: n, budget: same ? n : n * 2 + (opts.extra == null ? 12 : opts.extra), horizon: opts.horizon == null ? 2 : opts.horizon, onProgress: opts.onProgress });
    const m = ok.find(c => c.tags.includes("you")), b = ok.find(c => c.tags.includes("bot")) || m;
    if (!m) return { i, error: "The playouts failed." };
    const before = Math.max(m.eq, b.eq);
    return { i, kind: o.kind, round: o.round, mine: m.label, bot: b.label, same, vMine: +m.eq.toFixed(4), vBot: +b.eq.toFixed(4), before: +before.toFixed(4), loss: +Math.max(0, b.eq - m.eq).toFixed(4), se: +(m === b ? 0 : (m.se || 0)).toFixed(4), n: m.n, ms: Date.now() - t0 };
  };

  /* Deep look at decision i: every option, then why the best one is better. */
  A.deep = async function (rec, i, opts) {
    opts = opts || {};
    const t0 = Date.now();
    const o = await A.options(rec, i);
    if (o.error) return { i, error: o.error };
    let cands = o.cands;
    // you, the bot and Pass first; then the rest in the order the engine lists them
    const rank = c => c.tags.includes("you") ? 0 : c.tags.includes("bot") ? 1 : /^(Pass|No attack|No blocks|Keep|Mulligan|Yes|No)$/.test(c.label) ? 2 : 3;
    cands = cands.slice().sort((a, b) => rank(a) - rank(b)).slice(0, opts.maxCands || 9);
    const horizon = opts.horizon == null ? 3 : opts.horizon;
    const race = await A.race(rec, i, cands, { n0: opts.n0 || 6, budget: opts.budget || Math.max(60, cands.length * 16), horizon, features: true, onProgress: opts.onProgress });
    const ok = race.ok;
    if (!ok.length) return { i, error: "The playouts failed." };
    const best = race.best, mine = ok.find(c => c.tags.includes("you")) || null;
    const res = { i, kind: o.kind, round: o.round, horizon, spent: race.spent, ms: 0, best: best.label, mine: mine ? mine.label : null, loss: mine ? +mine.loss.toFixed(4) : null, se: mine ? +(mine.se || 0).toFixed(4) : null };
    res.cands = ok.map(c => ({ label: c.label, tags: c.tags, eq: +c.eq.toFixed(4), loss: +(c.loss || 0).toFixed(4), se: +(c.se || 0).toFixed(4), n: c.n, wins: c.wins, losses: c.losses, pruned: !c.alive }));
    // what moved: the position features at the end of the playouts, best against yours
    if (mine && mine !== best && MK.Value) {
      res.why = A.featureDiff(best.outs, mine.outs);
      res.lines = await A.typicalLines(rec, i, best, mine, race.seeds, horizon);
    } else if (mine && MK.Value) {
      const alt = ok.find(c => c !== best && c.n);
      if (alt) { res.why = A.featureDiff(best.outs, alt.outs); res.whyVs = alt.label; }
    }
    res.ms = Date.now() - t0;
    return res;
  };

  const FEAT_TEXT = {
    life: ["your life", "pts", 40], hand: ["cards in hand", "", 7], mana: ["mana next turn", "", 10], lands: ["lands", "", 10], creatures: ["creatures", "", 8],
    power: ["power on the battlefield", "", 20], evasive: ["evasive power", "", 15], commander: ["Etrata on the battlefield", "%", 1], faceDown: ["face-down cards", "", 4],
    stolen: ["stolen permanents", "", 4], threat: ["damage aimed at you, against your life", "x", 1], pressure: ["your power against the lowest life", "x", 1],
    lineNow: ["a win line live", "%", 1], lineNext: ["a win line next turn", "%", 1], lineLater: ["a win line in reach", "%", 1], others: ["other permanents", "", 8],
    tutors: ["tutors in hand", "", 3], counters: ["counters in hand", "", 2], engines: ["card engines", "", 3], tax: ["commander tax", "", 3]
  };
  /* The features that differ most between two sets of playouts, weighted by how much the value
     model cares about each one. [{ k, text, a, b, push }] */
  A.featureDiff = function (outsA, outsB) {
    const V = MK.Value, F = V.FEATURES;
    const avg = outs => {
      const xs = outs.filter(o => o && o.x).map(o => o.x);
      if (!xs.length) return null;
      return F.map((_, j) => mean(xs.map(x => x[j])));
    };
    const xa = avg(outsA), xb = avg(outsB);
    const lostA = mean(outsA.filter(Boolean).map(o => o.lost ? 1 : 0)), lostB = mean(outsB.filter(Boolean).map(o => o.lost ? 1 : 0));
    const wonA = mean(outsA.filter(Boolean).map(o => o.won ? 1 : 0)), wonB = mean(outsB.filter(Boolean).map(o => o.won ? 1 : 0));
    const out = [];
    if (Math.abs(wonA - wonB) >= 0.1) out.push({ k: "won", text: "won within the playout", a: wonA, b: wonB, unit: "%", push: (wonA - wonB) * 3 });
    if (Math.abs(lostA - lostB) >= 0.1) out.push({ k: "lost", text: "dead within the playout", a: lostA, b: lostB, unit: "%", push: (lostB - lostA) * 3 });
    if (xa && xb) {
      const base = V.score(xb);
      for (const k of Object.keys(FEAT_TEXT)) {
        const j = F.indexOf(k);
        if (j < 0) continue;
        const y = xb.slice(); y[j] = xa[j];
        const push = V.score(y) - base;
        const [text, unit, scale] = FEAT_TEXT[k];
        if (Math.abs(xa[j] - xb[j]) < 0.02) continue;
        const f = unit === "%" || unit === "x" ? 1 : scale;
        out.push({ k, text, a: xa[j] * f, b: xb[j] * f, unit, push });
      }
    }
    return out.sort((p, q) => Math.abs(q.push) - Math.abs(p.push)).slice(0, 4).map(f => ({ k: f.k, text: f.text, unit: f.unit, a: +f.a.toFixed(2), b: +f.b.toFixed(2), push: +f.push.toFixed(3) }));
  };

  /* A playout of each option on a seed where they differ about as much as they do on average. */
  A.typicalLines = async function (rec, i, best, mine, seeds, horizon) {
    const d = [];
    for (let s = 0; s < seeds.length; s++) if (best.res[s] != null && mine.res[s] != null) d.push({ s, d: best.res[s] - mine.res[s] });
    if (!d.length) return null;
    const m = mean(d.map(x => x.d));
    const pick = d.filter(x => Math.sign(x.d) === Math.sign(m) || !m).sort((a, b) => Math.abs(a.d - m) - Math.abs(b.d - m))[0] || d[0];
    const [a, b] = await Promise.all([A.playout(rec, i, best.raw, seeds[pick.s], { horizon, log: 40 }), A.playout(rec, i, mine.raw, seeds[pick.s], { horizon, log: 40 })]);
    const trim = o => o ? { eq: +o.eq.toFixed(3), won: o.won, lost: o.lost, log: o.log.filter(l => l.k !== "turn" || true).slice(0, 18) } : null;
    return { best: trim(a), mine: trim(b) };
  };

  /* ------------------------------------------------------------ labels */
  /* The grade of a decision. loss: win chance given up (0..1), se: its standard error, ref: the
     win chance the best option kept. In a four-player game a fair share is 25% and most positions
     sit well under it, so a decision is judged by the share of your chances it gave up, not by raw
     points: 3 points thrown away from 10% is a big mistake, from 60% a small one.
     - adj: the loss less one standard error (never count noise as a mistake)
     - rel: adj as a share of your chances (with a floor at 8%, so lost positions don't blow up)
     - acc: Lichess's move accuracy, with rel = 1 (all your chances gone) as 40 points of win%. */
  A.grade = function (loss, se, ref) {
    const adj = Math.max(0, (loss || 0) - (se || 0));
    const rel = Math.min(1, adj / Math.max(0.08, ref || 0));
    const pts = rel * 40;
    const acc = Math.max(0, Math.min(100, 103.1668 * Math.exp(-0.04354 * pts) - 3.1669));
    const cls = adj < 0.004 ? ((loss || 0) <= 0.002 ? "best" : "good") : rel < 0.06 ? "good" : rel < 0.15 ? "inaccuracy" : rel < 0.3 ? "mistake" : "blunder";
    return { adj: +adj.toFixed(4), rel: +rel.toFixed(3), acc: +acc.toFixed(1), cls };
  };
  A.classify = (loss, se, ref) => A.grade(loss, se, ref).cls;
  A.accuracy = (loss, se, ref) => A.grade(loss, se, ref).acc;

  /* What kind of decision went wrong, from the decision itself and the options' names. */
  A.categorize = function (m, r, T) {
    if (T && T.categorize) { try { const c = T.categorize(m, r); if (c) return c; } catch (e) { /* generic */ } }
    const k = m.k, mine = (r && r.mine) || m.ans || "", best = (r && (r.best || r.bot)) || "";
    if (k === "mulligan") return "mull";
    if (k === "attack" || k === "block") return "combat";
    if (k === "respond") return "stack";
    if (k === "choose") return m.q && m.q.purpose === "tutor" ? "tutor" : "rules";
    if (/^Play /.test(mine) || /^Play /.test(best)) return "tempo";
    return "lines";
  };
  /* Too fast, or thought about and still wrong (James Reason's slips against mistakes). */
  A.errorType = function (m) { return m.ms != null && m.ms < 2500 ? "slip" : "judgment"; };
  /* Passive (passed when acting was better) or rushed (acted when passing was better). */
  A.direction = function (r) {
    if (!r || !r.mine || !(r.best || r.bot)) return null;
    const best = r.best || r.bot, passy = s => /^(Pass|End the turn|No attack|No blocks)$/.test(s);
    if (passy(r.mine) && !passy(best)) return "passive";
    if (!passy(r.mine) && passy(best)) return "rushed";
    return null;
  };

  /* ------------------------------------------------------------ the game in numbers */
  /* A game's accuracy, the way Lichess does it: the mean of a weighted mean and a harmonic mean of
     the decisions' accuracies. The harmonic mean makes one blunder cost more than many good moves
     earn back; the weights make decisions in positions already decided (win chance near 0), and
     decisions where the options come to the same, count less (Lichess weights by volatility), so
     a lost game's last passes and free choices don't pad the score. */
  function gameAccuracy(rows) {
    if (!rows.length) return null;
    let sw = 0, swa = 0, sh = 0;
    for (const x of rows) {
      // what was at stake: decisions where every option comes to the same count for little
      const stake = Math.min(1, (x.stakes || 0) / Math.max(0.015, 0.15 * (x.ref || 0)));
      const w = Math.max(0.15, Math.min(1, (x.ref || 0) / 0.12)) * (0.1 + 0.9 * stake);
      sw += w; swa += w * x.acc; sh += w / Math.max(1, x.acc);
    }
    return +(((swa / sw) + (sw / sh)) / 2).toFixed(1);
  }
  A.gameAccuracy = gameAccuracy;
  /* quick: { [i]: quick result }, deep: { [i]: deep result }. Win chances are the hero's. */
  A.summarize = function (rec, quick, deep) {
    const T = (MK.TRAIN || {})[rec.deck];
    const ms = (rec.moments || []).filter(m => !m.replayed).sort((a, b) => a.i - b.i);
    const rows = [];
    for (const m of ms) {
      const q = quick && quick[m.i], d = deep && deep[m.i];
      const r = d && !d.error ? d : q && !q.error ? q : null;
      if (!r) continue;
      const loss = d && !d.error ? d.loss : q.loss, se = d && !d.error ? d.se : q.se;
      const ref = d && !d.error ? (d.cands[0] || {}).eq : q.before;
      const gr = A.grade(loss, se, ref);
      rows.push({
        i: m.i, r: m.r, k: m.k, ms: m.ms, ans: m.ans,
        before: q && !q.error ? q.before : null, after: q && !q.error ? q.vMine : null,
        loss: loss || 0, se: se || 0, deep: !!(d && !d.error), best: d && !d.error ? d.best : q ? q.bot : null,
        adj: gr.adj, rel: gr.rel, cls: gr.cls, acc: gr.acc, ref: ref == null ? null : +(+ref).toFixed(4),
        stakes: d && !d.error ? +Math.max(0, ...d.cands.map(c => c.loss || 0)).toFixed(4) : q && !q.error ? +Math.abs(q.vMine - q.vBot).toFixed(4) : 0, cat: A.categorize(m, r, T), err: A.errorType(m), dir: A.direction(r)
      });
    }
    const res = rec.result || {};
    const end = res.win ? 1 : 0;
    const curve = rows.filter(x => x.before != null);
    const start = curve.length ? curve[0].before : null;
    // what your decisions cost (only clear losses count) and what everything else did
    const skill = -rows.reduce((a, x) => a + x.adj, 0);
    const luck = start != null ? end - start - skill : null;
    // the biggest swings that weren't your decision: between one decision and the next
    const swings = [];
    for (let k = 1; k < curve.length; k++) {
      const dv = curve[k].before - curve[k - 1].after;
      if (Math.abs(dv) >= 0.06) swings.push({ from: curve[k - 1].i, to: curve[k].i, r: curve[k].r, dv: +dv.toFixed(3) });
    }
    swings.sort((a, b) => Math.abs(b.dv) - Math.abs(a.dv));
    const group = key => {
      const out = {};
      for (const x of rows) { const g = out[x[key]] = out[x[key]] || { n: 0, acc: 0, lost: 0, errs: 0 }; g.n++; g.acc += x.acc; g.lost += x.adj; if (x.cls === "mistake" || x.cls === "blunder") g.errs++; }
      for (const k of Object.keys(out)) { out[k].acc = +(out[k].acc / out[k].n).toFixed(1); out[k].lost = +out[k].lost.toFixed(3); }
      return out;
    };
    const phase = x => x.r <= 3 ? "early" : x.r <= 6 ? "middle" : "late";
    rows.forEach(x => { x.phase = phase(x); x.speed = x.ms == null ? "?" : x.ms < 2500 ? "fast" : x.ms < 10000 ? "normal" : "slow"; });
    const counts = {};
    for (const x of rows) counts[x.cls] = (counts[x.cls] || 0) + 1;
    return {
      v: A.VERSION, n: rows.length, rows,
      accuracy: gameAccuracy(rows),
      avgLoss: rows.length ? +(mean(rows.map(x => x.adj)) * 100).toFixed(2) : null,
      avgRel: rows.length ? +(mean(rows.map(x => x.rel)) * 100).toFixed(1) : null,
      counts, start, end, skill: +skill.toFixed(3), luck: luck == null ? null : +luck.toFixed(3),
      swings: swings.slice(0, 5),
      byCat: group("cat"), byPhase: group("phase"), byKind: group("k"), bySpeed: group("speed"), byErr: group("err"),
      dirs: { passive: rows.filter(x => x.dir === "passive" && x.rel >= 0.15).length, rushed: rows.filter(x => x.dir === "rushed" && x.rel >= 0.15).length },
      worst: rows.filter(x => x.adj > 0).sort((a, b) => b.rel - a.rel || b.adj - a.adj).slice(0, 6).map(x => x.i)
    };
  };
})(typeof window !== "undefined" ? window : globalThis);
