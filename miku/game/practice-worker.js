/* Game analysis off the page's main thread (analysis.js). The page keeps a few of these busy at
   once. It sends { type: "init", files } with the game files to load (relative to this file), then
   jobs: { type: "quick" | "deep" | "botgame" | "moment", id, rec, i, opts }. Each job answers with progress
   messages { type: "progress", id, f } and one { type: "result", id, r }. */
/* global importScripts */
"use strict";
let ready = null;
self.onmessage = async e => {
  const m = e.data || {};
  try {
    if (m.type === "init") {
      if (!ready) { importScripts.apply(self, m.files); ready = true; }
      self.postMessage({ type: "ready" });
      return;
    }
    const progress = f => self.postMessage({ type: "progress", id: m.id, f });
    let r = null;
    if (m.type === "quick") r = await self.MK.Analysis.quick(m.rec, m.i, Object.assign({}, m.opts, { onProgress: progress }));
    else if (m.type === "deep") r = await self.MK.Analysis.deep(m.rec, m.i, Object.assign({}, m.opts, { onProgress: progress }));
    else if (m.type === "botgame") r = await self.MK.Analysis.botGame(m.rec, Object.assign({}, m.opts, { onProgress: progress }));
    else if (m.type === "moment") r = await self.MK.Practice.analyzeMoment(m.rec, m.i, { n: m.n || 16, horizon: m.horizon == null ? 3 : m.horizon, maxCands: m.maxCands || 8, onProgress: (k, total) => progress(k / total) });
    self.postMessage({ type: "result", id: m.id, r });
  } catch (err) {
    self.postMessage({ type: "result", id: m.id, r: { i: m.i, error: String(err && err.message || err) } });
  }
};
