/* Offline support for the Miku deck wiki: the page works at a game store with no signal.
   Site files: network first, cache as fallback. Fonts and card images: cache first. */
const VERSION = "miku-v4";
const V = "?v=4";
const GAME = ["engine.js", "cards-miku.js", "decks-edgar.js", "decks-ghalta.js", "decks-urdragon.js", "ai.js", "game-ui.js", "game.css"].map(f => "./game/" + f + V);
const CORE = ["./", "./index.html", "./icon.svg", "./manifest.webmanifest"]
  .concat(["styles.css", "kit.js", "cards.js", "azusa.js", "wiki.js", "guide.js", "app.js"].map(f => "./" + f + V), GAME);

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== VERSION + "-assets").map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
