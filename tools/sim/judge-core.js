/* The part of judge-export.js that runs next to the engine: in Node, or in Chromium for games
   recorded before engine 3 (their bots' dice depended on the browser's sort). Returns lines. */
(function (root) {
  "use strict";
  root.JUDGE = async function (g0, opts) {
    const MK = root.MK, P = MK.Practice, A = MK.Analysis;
    const out = [], pct = x => x == null ? "–" : (x * 100).toFixed(1) + "%";
    const rec = g0.rec;
    const r = await P.replay(rec, { at: (rec.answers || []).length + 1 });
    const me = r.g && r.g.players[rec.hero];
    const ok = !r.diverged && !r.error && (!rec.result || rec.result.conceded || (r.g.winner === me) === !!rec.result.win);
    out.push(`${g0.id} ${g0.when} ${rec.result && rec.result.win ? "won" : "lost"} R${rec.result && rec.result.rounds}, engine ${rec.engine || "?"}: replay ${ok ? "matches" : "DOES NOT MATCH " + JSON.stringify(r.diverged || r.error)} (the browser said ${JSON.stringify(g0.replay && g0.replay.matches)})`);
    const an = g0.analysis;
    if (!an) { out.push("  not analyzed in the browser"); return out; }
    if (!ok) { out.push("  skipping the analysis: the game doesn't replay here"); return out; }
    const ms = (rec.moments || []).filter(m => !m.replayed);
    let same = 0, diff = 0;
    const dl = [], quick = {};
    for (const m of ms) {
      const q = quick[m.i] = await A.quick(rec, m.i);
      const b = an.quick && an.quick[m.i];
      if (!b || q.error || b.error) continue;
      if (JSON.stringify(Object.assign({}, q, { ms: 0 })) === JSON.stringify(Object.assign({}, b, { ms: 0 }))) same++;
      else { diff++; dl.push(Math.abs(q.loss - b.loss)); if (opts.verbose) out.push(`  quick ${m.i} R${m.r} ${m.ans}: browser loss ${b.loss}±${b.se} vs here ${q.loss}±${q.se}`); }
    }
    out.push(`  quick pass: ${same} identical to the browser, ${diff} different${dl.length ? ` (mean |loss diff| ${(dl.reduce((a, b) => a + b, 0) / dl.length * 100).toFixed(2)} pts)` : ""}`);
    const sum = A.summarize(rec, quick, an.deep || {});
    out.push(`  accuracy browser ${an.sum && an.sum.accuracy} vs here ${sum.accuracy}; skill ${an.sum && an.sum.skill} vs ${sum.skill}; luck ${an.sum && an.sum.luck} vs ${sum.luck}`);
    if (opts.deep) for (const i of Object.keys(an.deep || {}).map(Number)) {
      const b = an.deep[i]; if (!b || b.error) continue;
      const d = await A.deep(rec, i, { budget: opts.budget });
      const m = ms.find(x => x.i === i) || {};
      if (d.error) { out.push(`  deep ${i}: ${d.error}`); continue; }
      out.push(`  deep ${i} R${m.r} ${m.ans}: browser best "${b.best}" loss ${pct(b.loss)}±${pct(b.se)} (${b.spent} playouts); with ${d.spent}: best "${d.best}" loss ${pct(d.loss)}±${pct(d.se)}${b.best === d.best ? "" : "  BEST CHANGED"}`);
      if (opts.verbose) for (const c of d.cands) out.push(`     ${c.label.padEnd(40)} ${pct(c.eq)} ±${pct(c.se)} n${c.n}${c.pruned ? " dropped" : ""}`);
    }
    return out;
  };
})(typeof window !== "undefined" ? window : globalThis);
