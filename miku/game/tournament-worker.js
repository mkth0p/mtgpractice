/* Arena games off the page's main thread (tournament.js). The Arena keeps a few of these busy.
   It sends { type: "init", files } with the game files to load (relative to this file), then
   { type: "game", job } for each game; each answers { type: "result", gi, res }. */
/* global importScripts */
"use strict";
let ready = false;
self.onmessage = async e => {
  const m = e.data || {};
  if (m.type === "init") {
    try { if (!ready) { importScripts.apply(self, m.files); ready = true; } self.postMessage({ type: "ready" }); }
    catch (err) { self.postMessage({ type: "failed", error: String(err && err.message || err) }); }
    return;
  }
  if (m.type !== "game") return;
  let res;
  try { res = await self.MK.Tournament.playGame(m.job); }
  catch (err) { res = { error: String(err && err.message || err) }; }
  self.postMessage({ type: "result", gi: m.job.gi, res });
};
