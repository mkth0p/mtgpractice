/* Practice analysis off the page's main thread: replays a recorded game to one moment and plays
   every alternative out many times (practice.js analyzeMoment). The page sends { type: "init",
   files } with the game files to load (relative to this file), then { type: "moment", id, rec, i,
   n, horizon } for each moment; each answer is { type: "result", id, r } or progress messages. */
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
    if (m.type === "moment") {
      const r = await self.MK.Practice.analyzeMoment(m.rec, m.i, { n: m.n || 16, horizon: m.horizon == null ? 3 : m.horizon, maxCands: m.maxCands || 8, onProgress: (k, total) => self.postMessage({ type: "progress", id: m.id, k, total }) });
      self.postMessage({ type: "result", id: m.id, r });
    }
  } catch (err) {
    self.postMessage({ type: "result", id: m.id, r: { i: m.i, error: String(err && err.message || err) } });
  }
};
