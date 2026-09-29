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

  /* ---------------------------------------------------------------- card preview
     Hover a card (mouse) for a floating preview; press and hold it (touch), or right-click it, for a
     full-screen one with the whole card and its text. The page never gets the browser's "save image"
     menu. bindPreview(scope, resolve): resolve(el) returns { name, img, cost, type, text, pt, lines,
     note } for the card under el, or null. */
  const CSS = `
.kp-float{position:fixed;z-index:400;width:230px;pointer-events:none;opacity:0;transform:translateY(6px) scale(.97);transition:opacity .16s,transform .16s;border-radius:12px;overflow:hidden;box-shadow:0 24px 50px -12px rgba(0,0,0,.65);background:#10151b;color:#eef3f4;font:400 13px/1.4 "Instrument Sans",system-ui,sans-serif}
.kp-float.on{opacity:1;transform:none}
.kp-float img{display:block;width:100%;aspect-ratio:488/680;object-fit:cover}
.kp-float .kp-txt{padding:10px 12px}
.kp-over{position:fixed;inset:0;z-index:400;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(3,6,9,.8);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);opacity:0;transition:opacity .16s;overscroll-behavior:contain}
.kp-over.on{opacity:1}
.kp-box{width:min(380px,100%);max-height:100%;overflow:auto;border-radius:18px;background:#10151b;color:#eef3f4;box-shadow:0 30px 70px -20px #000;font:400 14px/1.45 "Instrument Sans",system-ui,sans-serif;transform:scale(.96);transition:transform .18s}
.kp-over.on .kp-box{transform:none}
.kp-box img{display:block;width:100%;aspect-ratio:488/680;object-fit:cover;border-radius:18px 18px 0 0}
.kp-txt{padding:14px 16px 16px}
.kp-txt h4{margin:0 0 2px;font:800 1rem/1.2 "Unbounded",system-ui,sans-serif;display:flex;justify-content:space-between;gap:8px;align-items:baseline}
.kp-txt .kp-type{color:#9fb0bb;font-size:.8rem;margin-bottom:8px;display:flex;justify-content:space-between;gap:8px}
.kp-txt .kp-rules p{margin:0 0 6px}
.kp-txt .kp-lines{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.kp-txt .kp-lines span{background:#1d2630;border-radius:99px;padding:2px 9px;font-size:.74rem;color:#cfe0e6}
.kp-txt .kp-note{margin-top:8px;font-size:.76rem;color:#9fb0bb}
.kp-close{display:block;width:100%;margin-top:12px;padding:11px;border:0;border-radius:12px;background:#1d2630;color:#eef3f4;font:600 .9rem system-ui,sans-serif;cursor:pointer}
.kp-noimg{aspect-ratio:488/680;display:grid;place-items:center;padding:20px;text-align:center;background:linear-gradient(135deg,#243446,#141a21);font:800 1.1rem/1.2 "Unbounded",system-ui,sans-serif}
.kp-hold,.kp-hold *{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
.kp-hold img{-webkit-user-drag:none}`;
  let styled = false;
  function style() {
    if (styled || typeof document === "undefined") return;
    styled = true;
    const st = document.createElement("style");
    st.textContent = CSS;
    document.head.appendChild(st);
  }
  function cardBody(info, big) {
    const img = info.img || (art(info.name) || {}).normal;
    const top = img ? `<img src="${esc(img)}" alt="" draggable="false">` : (big ? `<div class="kp-noimg">${esc(info.name)}</div>` : "");
    const txt = `<div class="kp-txt"><h4><span>${esc(info.name)}</span>${info.cost ? `<span>${mana(info.cost)}</span>` : ""}</h4>
      ${info.type || info.pt ? `<div class="kp-type"><span>${esc(info.type || "")}</span>${info.pt ? `<b>${esc(info.pt)}</b>` : ""}</div>` : ""}
      ${info.text ? `<div class="kp-rules">${info.html ? info.text : rules(info.text)}</div>` : ""}
      ${info.lines && info.lines.length ? `<div class="kp-lines">${info.lines.map(l => `<span>${esc(l)}</span>`).join("")}</div>` : ""}
      ${info.note ? `<div class="kp-note">${esc(info.note)}</div>` : ""}
      ${big ? `<button class="kp-close" type="button">Close</button>` : ""}</div>`;
    // with the card image the floating preview needs no text; without it, the text is the card
    return big ? top + txt : (img ? top : txt);
  }
  let floatEl = null, overEl = null;
  const preview = {
    hover(info, rect) {
      style();
      if (!floatEl) { floatEl = document.createElement("div"); floatEl.className = "kp-float"; floatEl.setAttribute("aria-hidden", "true"); document.body.appendChild(floatEl); }
      floatEl.innerHTML = cardBody(info, false);
      const w = 230, h = floatEl.firstElementChild && floatEl.firstElementChild.tagName === "IMG" ? 320 : 220;
      let left = rect.right + 12;
      if (left + w > innerWidth - 8) left = rect.left - w - 12;
      if (left < 8) left = Math.min(innerWidth - w - 8, Math.max(8, rect.left));
      let top = Math.max(8, Math.min(innerHeight - h - 8, rect.top + rect.height / 2 - h / 2));
      if (left === rect.left && rect.top > h + 16) top = rect.top - h - 10;
      floatEl.style.left = left + "px"; floatEl.style.top = top + "px";
      floatEl.classList.add("on");
    },
    unhover() { if (floatEl) floatEl.classList.remove("on"); },
    show(info) {
      style();
      preview.unhover();
      preview.hide();
      const o = overEl = document.createElement("div");
      o.className = "kp-over kp-hold";
      o.setAttribute("role", "dialog");
      o.setAttribute("aria-modal", "true");
      o.setAttribute("aria-label", info.name);
      o.innerHTML = `<div class="kp-box">${cardBody(info, true)}</div>`;
      const close = () => preview.hide();
      o.addEventListener("click", e => { if (e.target === o || e.target.closest(".kp-close")) close(); });
      o.addEventListener("contextmenu", e => e.preventDefault());
      o._key = e => { if (e.key === "Escape") close(); };
      document.addEventListener("keydown", o._key);
      document.body.appendChild(o);
      requestAnimationFrame(() => o.classList.add("on"));
      const b = o.querySelector(".kp-close");
      if (b) b.focus({ preventScroll: true });
    },
    hide() {
      const o = overEl;
      if (!o) return;
      overEl = null;
      document.removeEventListener("keydown", o._key);
      o.classList.remove("on");
      setTimeout(() => o.remove(), 170);
    },
    get open() { return !!overEl; }
  };
  /* Long-press (touch), right-click and hover handling for every card under scope. opts.hover:
     false leaves hover to the page (the wiki has its own peek). */
  function bindPreview(scope, resolve, opts) {
    style();
    opts = opts || {};
    const fine = root.matchMedia ? root.matchMedia("(hover: hover) and (pointer: fine)") : { matches: false };
    scope.classList.add("kp-hold");
    let timer = 0, start = null, target = null, fired = false, hoverFor = null, hoverTimer = 0;
    const find = el => { if (!el || !el.closest) return null; const info = resolve(el); return info && info.name ? info : null; };
    const cancel = () => { clearTimeout(timer); timer = 0; start = null; };
    scope.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse") return;
      const info = find(e.target);
      if (!info) return;
      fired = false; target = e.target; start = { x: e.clientX, y: e.clientY };
      clearTimeout(timer);
      timer = setTimeout(() => { timer = 0; fired = true; if (navigator.vibrate) { try { navigator.vibrate(8); } catch (x) { /* ignore */ } } preview.show(find(target) || info); }, opts.delay || 430);
    });
    scope.addEventListener("pointermove", e => { if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) cancel(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach(t => scope.addEventListener(t, cancel));
    scope.addEventListener("scroll", cancel, { passive: true, capture: true });
    // the press became a preview: swallow the tap that follows it
    scope.addEventListener("click", e => { if (fired) { fired = false; e.preventDefault(); e.stopPropagation(); } }, true);
    scope.addEventListener("contextmenu", e => {
      const info = find(e.target);
      if (!info) return;
      e.preventDefault();
      cancel();
      if (!fired) preview.show(info);
    });
    scope.addEventListener("dragstart", e => { if (e.target.tagName === "IMG") e.preventDefault(); });
    if (opts.hover === false) return;
    scope.addEventListener("pointerover", e => {
      if (e.pointerType !== "mouse" || !fine.matches) return;
      const el = e.target.closest(opts.hoverSel || "[data-card],[data-oid]");
      if (!el || el === hoverFor || !scope.contains(el)) return;
      hoverFor = el;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => { const info = find(el); if (info && hoverFor === el && document.contains(el)) preview.hover(info, el.getBoundingClientRect()); }, opts.hoverDelay || 260);
    });
    scope.addEventListener("pointerout", e => {
      if (!hoverFor || hoverFor.contains(e.relatedTarget)) return;
      hoverFor = null; clearTimeout(hoverTimer); preview.unhover();
    });
    scope.addEventListener("pointerdown", () => { hoverFor = null; clearTimeout(hoverTimer); preview.unhover(); });
    root.addEventListener("scroll", () => { hoverFor = null; preview.unhover(); }, { passive: true });
  }

  root.MikuKit = { esc, store, mana, rules, art, ensure, onArt: f => listeners.add(f), MIKU_PRINTS, preview, bindPreview };
})(window);
