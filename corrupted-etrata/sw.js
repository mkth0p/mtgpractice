/* Offline support for the Corrupted Etrata deck wiki. It shares the Miku site's kit, styles, shell and game
   engine (../miku/). Site files: network first, cache as fallback. Fonts and card images: cache first. */
const VERSION = "cetrata-v27";
const V = "?v=27";
const GAME = ["engine.js", "cards-miku.js", "cards-corrupted.js", "checklist-corrupted.js", "checklist-cetrata.js", "brain-corrupted.js", "cards-etrata.js", "cards-miku-precon.js", "decks-azusa.js", "decks-cetrata.js", "decks-edgar.js", "decks-etrata4.js", "decks-ghalta.js", "decks-krenko.js", "decks-talrand.js", "decks-urdragon.js", "precon-ghired.js", "precon-isperia.js", "precon-kaalia.js", "precon-lathril.js", "precon-wilhelt.js", "ai.js", "practice.js", "practice-worker.js", "train-cetrata.js", "value.js", "analysis.js", "game-ui.js", "game.css"].map(f => "../miku/game/" + f + V);
const CORE = ["./", "./index.html", "./icon.svg", "./manifest.webmanifest"]
  .concat(["theme.css", "cards.js", "wiki.js", "guide.js", "quiz.js", "prices.js", "site.js", "train.css", "train.js", "train-data.js"].map(f => "./" + f + V))
  .concat(["styles.css", "kit.js", "app.js"].map(f => "../miku/" + f + V), GAME);

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("cetrata-") && k !== VERSION && k !== VERSION + "-assets").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("./index.html"))));
    return;
  }
  if (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === "cards.scryfall.io") {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(VERSION + "-assets").then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
