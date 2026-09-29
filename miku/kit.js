/* Small shared helpers for the Miku pages and the game: escaping, mana symbols, storage and
   card art from Scryfall (fetched in the visitor's browser, cached in localStorage). */
(function (root) {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    json(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || "null"); return v == null ? d : v; } catch (e) { return d; } },
    put(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };

  /* {2}{G}{W} -> symbol spans. Works for W U B R G C, numbers, X, T, hybrid and Phyrexian. */
  const NAMES = { W: "White", U: "Blue", B: "Black", R: "Red", G: "Green", C: "Colorless", X: "X", T: "Tap" };
  function mana(str) {
    return esc(str).replace(/\{([^}]+)\}/g, (m, s) => {
      const k = s.toUpperCase();
      if (k === "T") return `<span class="ms t" title="Tap" aria-label="Tap">↷</span>`;
      if (/^[WUBRGC]$/.test(k)) return `<span class="ms ${k.toLowerCase()}" title="${NAMES[k]}" aria-label="${NAMES[k]}">${k}</span>`;
      if (/^[WUBRG]\/[WUBRG]$/.test(k)) return `<span class="ms hy ${k[0].toLowerCase()}${k[2].toLowerCase()}" title="${NAMES[k[0]]} or ${NAMES[k[2]].toLowerCase()}" aria-label="${NAMES[k[0]]} or ${NAMES[k[2]].toLowerCase()}">${k[0]}/${k[2]}</span>`;
      if (/^[WUBRG]\/P$/.test(k)) return `<span class="ms ${k[0].toLowerCase()} phy" title="${NAMES[k[0]]} or 2 life">${k[0]}ᵖ</span>`;
      return `<span class="ms n" title="${esc(k)} generic" aria-label="${esc(k)} generic">${esc(k)}</span>`;
    });
  }
  const rules = text => String(text || "").split("\n").filter(Boolean).map(l => `<p>${mana(l)}</p>`).join("");

  /* ---------------------------------------------------------------- card art */
  // The Secret Lair Miku printings, preferred over any other art for these names.
  const MIKU_PRINTS = { "2429": "Trostani, Selesnya's Voice", "2430": "Archangel of Thune", "2431": "Halo Fountain", "2432": "Grand Crescendo", "2433": "Shalai, Voice of Plenty", "2434": "Song of the Worldsoul", "2435": "Soul Warden", "2436": "Break Down", "2437": "Cultivate", "2438": "Finale of Devastation", "2439": "Vorinclex, Voice of Hunger", "2440": "Bountiful Promenade" };
  const ART_KEY = "mikuWiki.art.v2";
  const cache = store.json(ART_KEY, { t: 0, art: {}, miss: {} });
  cache.art = cache.art || {}; cache.miss = cache.miss || {};
  const listeners = new Set();
  let busy = null;
  const queue = new Set();
  function imgOf(card, kind) {
    if (card.image_uris) return card.image_uris[kind];
    if (card.card_faces && card.card_faces[0].image_uris) return card.card_faces[0].image_uris[kind];
    return null;
  }
  function save() { store.put(ART_KEY, cache); }
  function notify() { for (const f of listeners) { try { f(); } catch (e) { /* ignore */ } } }
  async function fetchBatch(ids) {
    const r = await fetch("https://api.scryfall.com/cards/collection", {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ identifiers: ids })
    });
    if (!r.ok) throw new Error("scryfall " + r.status);
    return r.json();
  }
  async function run(withPrints) {
    const names = [...queue]; queue.clear();
    const ids = names.map(n => ({ name: n }));
    if (withPrints) for (const n in MIKU_PRINTS) ids.push({ set: "sld", collector_number: n });
    for (let i = 0; i < ids.length; i += 75) {
      const j = await fetchBatch(ids.slice(i, i + 75));
      for (const c of j.data || []) {
        const printed = c.set === "sld" && MIKU_PRINTS[c.collector_number];
        const name = printed || c.name;
        const prev = cache.art[name];
        if (prev && prev.miku && !printed) continue;
        const normal = imgOf(c, "normal"), crop = imgOf(c, "art_crop");
        if (!normal) continue;
        cache.art[name] = { normal, crop, uri: c.scryfall_uri, miku: !!printed };
        // split and double-faced cards are also known by their front name
        if (c.name.includes(" // ")) cache.art[c.name.split(" // ")[0]] = cache.art[name];
      }
      for (const nf of j.not_found || []) if (nf.name) cache.miss[nf.name] = Date.now();
      if (i + 75 < ids.length) await new Promise(res => setTimeout(res, 110));
    }
    cache.t = Date.now();
    save();
    notify();
  }
  /* Ask for art for these names. Cached names are skipped; the Miku prints come along once. */
  function ensure(names, opts) {
    opts = opts || {};
    const stale = Date.now() - (cache.t || 0) > 21 * 864e5;
    const want = n => {
      if (!n || (cache.art[n] && !stale)) return false;
      if (cache.miss[n] && Date.now() - cache.miss[n] < 7 * 864e5) return false;
      queue.add(n);
      return true;
    };
    // Rooms and other split cards: ask by the front name too, in case the full name isn't matched
    for (const n of names) {
      want(n);
      if (String(n || "").includes(" // ") && !cache.art[n]) want(n.split(" // ")[0]);
    }
    const prints = opts.miku && (stale || !Object.values(cache.art).some(a => a.miku));
    if (!queue.size && !prints) return Promise.resolve(false);
    if (busy) return busy.then(() => ensure(names, opts));
    busy = run(prints).catch(() => false).then(v => { busy = null; return v; });
    return busy;
  }
  const art = name => cache.art[name] || cache.art[String(name).split(" // ")[0]] || null;

  root.MikuKit = { esc, store, mana, rules, art, ensure, onArt: f => listeners.add(f), MIKU_PRINTS };
})(window);
