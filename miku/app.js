/* Miku Deck Wiki: routing, jump bar, card wiki and sheet, charts, combo simulators,
   lethal calculator, hand trainer, swap checklist, and the small motion details. */
(function () {
  "use strict";
  const CARDS = window.MIKU_CARDS || [];
  const byName = new Map(CARDS.map(c => [c.name, c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const short = n => n.split(" // ")[0];
  const bySlug = new Map(CARDS.map(c => [slug(c.name), c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };
  const mqMobile = window.matchMedia("(max-width: 879px)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mqHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  const ROLES = [
    ["cmd", "Commander"], ["ramp", "Ramp"], ["draw", "Card draw"], ["removal", "Removal"],
    ["protect", "Protection"], ["tokens", "Token makers"], ["gain", "Lifegain sources"],
    ["payoff", "Lifegain payoffs"], ["finisher", "Finishers"], ["combo", "Combo pieces"],
    ["utility", "Utility"], ["land", "Lands"]
  ];
  const ROLE_LABEL = Object.fromEntries(ROLES);
  const TYPE_ORDER = ["Creature", "Planeswalker", "Artifact", "Enchantment", "Instant", "Sorcery", "Land"];
  const TYPE_PLURAL = { Creature: "Creatures", Planeswalker: "Planeswalker", Artifact: "Artifacts", Enchantment: "Enchantments", Instant: "Instants", Sorcery: "Sorceries", Land: "Lands" };

  /* ---------------------------------------------------------------- mana symbols */
  function mana(str) {
    return esc(str).replace(/\{([^}]+)\}/g, (m, s) => {
      const k = s.toUpperCase();
      let cls = "";
      if (k === "W") cls = "w"; else if (k === "G") cls = "g"; else if (k === "G/W") cls = "gw"; else if (k === "T") cls = "t";
      const label = k === "T" ? "↷" : (k === "G/W" ? "G/W" : k);
      const title = k === "T" ? "Tap" : k === "G/W" ? "Green or white" : k === "W" ? "White" : k === "G" ? "Green" : k + " generic";
      return `<span class="ms ${cls}" title="${title}" aria-label="${title}">${label}</span>`;
    });
  }
  const rulesHTML = text => text.split("\n").filter(Boolean).map(l => `<p>${mana(l)}</p>`).join("");

  /* ---------------------------------------------------------------- card art (Scryfall) */
  const MIKU_PRINTS = { "2429": "Trostani, Selesnya's Voice", "2430": "Archangel of Thune", "2431": "Halo Fountain", "2432": "Grand Crescendo", "2433": "Shalai, Voice of Plenty", "2434": "Song of the Worldsoul", "2435": "Soul Warden", "2436": "Break Down", "2437": "Cultivate", "2438": "Finale of Devastation", "2439": "Vorinclex, Voice of Hunger", "2440": "Bountiful Promenade" };
  let ART = {};
  const ART_KEY = "mikuWiki.art.v1";
  function imgOf(card, kind) {
    if (card.image_uris) return card.image_uris[kind];
    if (card.card_faces && card.card_faces[0].image_uris) return card.card_faces[0].image_uris[kind];
    return null;
  }
  async function loadArt() {
    let fresh = false;
    try {
      const cached = JSON.parse(store.get(ART_KEY) || "null");
      // Paint from the cache whatever its age, so the page still has art offline; refresh weekly.
      if (cached && cached.art) { ART = cached.art; paintArt(); fresh = Date.now() - cached.t < 7 * 864e5; }
    } catch (e) { /* ignore bad cache */ }
    if (fresh) return;
    const ids = CARDS.map(c => ({ name: c.name })).concat(Object.keys(MIKU_PRINTS).map(n => ({ set: "sld", collector_number: n })));
    const art = {};
    try {
      for (let i = 0; i < ids.length; i += 75) {
        const r = await fetch("https://api.scryfall.com/cards/collection", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ identifiers: ids.slice(i, i + 75) })
        });
        if (!r.ok) throw new Error("scryfall " + r.status);
        const j = await r.json();
        for (const c of j.data || []) {
          const name = byName.has(c.name) ? c.name : null;
          if (!name) continue;
          const isMiku = c.set === "sld" && MIKU_PRINTS[c.collector_number] === name;
          if (art[name] && art[name].miku && !isMiku) continue;
          const normal = imgOf(c, "normal"), crop = imgOf(c, "art_crop");
          if (!normal) continue;
          art[name] = { normal, crop, uri: c.scryfall_uri, miku: isMiku };
        }
        await new Promise(res => setTimeout(res, 120));
      }
      ART = art;
      store.set(ART_KEY, JSON.stringify({ t: Date.now(), art }));
      paintArt();
    } catch (e) {
      /* Offline or blocked: the text frames stay, and they still show every card's rules. */
    }
  }
  function frameHTML(c) {
    return `<div class="frame"><b>${esc(c.name)}</b><span class="muted">${mana(c.cost || "")}</span><span class="muted">${esc(c.type)}</span></div>`;
  }
  function miniCard(c) {
    const a = ART[c.name];
    if (a) return `<img src="${esc(a.normal)}" alt="${esc(c.name)}" loading="lazy" decoding="async">`;
    return frameHTML(c);
  }
  // Images fade in when loaded; a broken image falls back to the text frame.
  document.addEventListener("load", e => { if (e.target.tagName === "IMG" && e.target.closest(".mini-card")) e.target.classList.add("ok"); }, true);
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG") return;
    const box = img.closest(".mini-card"), c = box && byName.get(img.alt);
    if (c) box.innerHTML = frameHTML(c);
  }, true);
  function paintArt() {
    $$("[data-art]").forEach(el => { const c = byName.get(el.dataset.art); if (c && !el.querySelector("img")) el.innerHTML = miniCard(c); });
    $$(".card-row .thumb[data-thumb]").forEach(el => {
      const a = ART[el.dataset.thumb];
      if (a && a.crop) { el.style.backgroundImage = `url("${a.crop}")`; el.textContent = ""; }
    });
  }

  /* ---------------------------------------------------------------- inline card mentions */
  function linkMentions(root = document) {
    $$("i-c", root).forEach(el => {
      const name = el.textContent.trim();
      const b = document.createElement("button");
      b.type = "button"; b.className = "inline-card"; b.dataset.card = name;
      b.textContent = el.dataset.label || short(name);
      if (!byName.has(name)) console.warn("Unknown card mention", name);
      el.replaceWith(b);
    });
  }
  // Turn {G}{W}-style mana text written in the page's static copy into symbols.
  function manaText(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: n => /\{[^}]+\}/.test(n.nodeValue) && !n.parentElement.closest("script,style,textarea") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const span = document.createElement("span"); span.innerHTML = mana(n.nodeValue); n.replaceWith(...span.childNodes); });
  }

  /* ---------------------------------------------------------------- header: tuck away on scroll */
  const root = document.documentElement;
  const topbar = $("#topbar"), subnav = $("#subnav"), subTrack = $("#subnavTrack");
  let headerLock = 0;
  function setHeader(up) {
    if (!mqMobile.matches) up = false;
    document.body.classList.toggle("hdr-up", up);
  }
  function measureHeader() { root.style.setProperty("--hdr-h", topbar.offsetHeight + "px"); }
  window.addEventListener("resize", measureHeader);

  /* ---------------------------------------------------------------- tabs */
  const TABS = [
    ["deck", "Deck", '<path d="M4 6h16M4 12h16M4 18h10"/>'],
    ["cards", "Cards", '<rect x="5" y="3" width="11" height="16" rx="2"/><path d="M19 7v12a2 2 0 0 1-2 2H9"/>'],
    ["combos", "Combos", '<path d="M8 12a4 4 0 1 1 4-4v8a4 4 0 1 0 4-4H8z"/>'],
    ["play", "Play", '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'],
    ["buy", "Upgrades", '<path d="M4 4h2l2.2 11h10.3L21 8H7"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>']
  ];
  const tabIndex = id => TABS.findIndex(t => t[0] === id);
  $$("[data-nav]").forEach(nav => {
    nav.innerHTML = `<span class="tab-ind" aria-hidden="true"></span>` + TABS.map(([id, label, icon]) =>
      `<a class="tab" href="#${id}" data-tab="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${label}</span></a>`).join("");
  });
  let currentView = null, tabTap = false;
  const scrollMem = {};

  function showView(id, how = {}) {
    if (currentView === id) return false;
    const from = currentView;
    if (from) scrollMem[from] = window.scrollY;
    currentView = id;
    $$(".view").forEach(v => {
      const on = v.dataset.view === id;
      v.classList.toggle("active", on);
      v.classList.remove("enter-fwd", "enter-back");
      if (on && from && !mqReduce.matches) {
        v.classList.add(tabIndex(id) > tabIndex(from) ? "enter-fwd" : "enter-back");
        v.addEventListener("animationend", () => v.classList.remove("enter-fwd", "enter-back"), { once: true });
      }
    });
    $$("[data-tab]").forEach(t => { if (t.dataset.tab === id) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current"); });
    root.style.setProperty("--ti", tabIndex(id));
    $$(".tab-ind").forEach(i => i.style.setProperty("--ti", tabIndex(id)));
    store.set("mikuWiki.tab", id);
    buildSubnav(id);
    setHeader(false);
    measureHeader();
    if (!how.keepScroll) window.scrollTo(0, how.top ? 0 : (scrollMem[id] || 0));
    requestAnimationFrame(onScroll);
    return true;
  }

  /* ---------------------------------------------------------------- jump bar + scroll spy */
  let subSections = [], activeSub = null;
  function buildSubnav(view) {
    subSections = $$(`[data-view="${view}"] [data-sub]`);
    const has = subSections.length > 1;
    subnav.hidden = !has;
    document.body.classList.toggle("no-sub", !has);
    subTrack.innerHTML = has ? subSections.map((s, i) => `<a class="sublink" href="#${s.id}" data-jump="${s.id}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${esc(s.dataset.sub)}</a>`).join("") : "";
    activeSub = null;
  }
  function jumpTo(el, smooth = true) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    const down = y > window.scrollY + 4;
    let offset;
    if (mqMobile.matches && down && y > 200) {
      setHeader(true);
      offset = (subnav.hidden ? 0 : subnav.offsetHeight) + (el.closest("#view-cards") ? $("#toolbar").offsetHeight : 0) + 12;
    } else {
      setHeader(false);
      offset = topbar.offsetHeight + 12;
    }
    headerLock = Date.now() + 900;
    window.scrollTo({ top: Math.max(0, y - offset), behavior: smooth && !mqReduce.matches ? "smooth" : "auto" });
  }
  subTrack.addEventListener("click", e => {
    const a = e.target.closest("[data-jump]"); if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.jump);
    if (el) { jumpTo(el); history.replaceState(null, "", "#" + a.dataset.jump); }
  });
  function spy() {
    if (!subSections.length) return;
    const line = topbar.getBoundingClientRect().bottom + 60;
    let cur = subSections[0];
    for (const s of subSections) if (s.getBoundingClientRect().top <= line) cur = s;
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = subSections[subSections.length - 1];
    if (cur === activeSub) return;
    activeSub = cur;
    $$(".sublink", subTrack).forEach(a => a.setAttribute("aria-current", a.dataset.jump === cur.id ? "true" : "false"));
    const a = $(`.sublink[data-jump="${cur.id}"]`, subTrack);
    if (a) subTrack.scrollTo({ left: a.offsetLeft - 16, behavior: mqReduce.matches ? "auto" : "smooth" });
  }

  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    const y = window.scrollY, dy = y - lastY;
    if (Date.now() > headerLock && !sheet.classList.contains("open")) {
      if (y < 80) setHeader(false);
      else if (dy > 6) setHeader(true);
      else if (dy < -8) setHeader(false);
    }
    lastY = y;
    spy();
    flowFill();
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

  /* ---------------------------------------------------------------- routing */
  let sheetFromApp = false;
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("card-")) {
      const c = bySlug.get(h.slice(5));
      if (!currentView) showView(store.get("mikuWiki.tab") || "cards");
      if (c) { openSheet(c); return; }
    }
    closeSheet(true);
    if (TABS.some(t => t[0] === h)) {
      const fromTab = tabTap; tabTap = false;
      showView(h, { top: !fromTab });
      return;
    }
    const target = h && document.getElementById(h);
    if (target) {
      const v = target.closest("[data-view]");
      if (v) showView(v.dataset.view, { keepScroll: true });
      requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(target, currentView === (v && v.dataset.view) && !!window.scrollY)));
      return;
    }
    if (!currentView) showView(store.get("mikuWiki.tab") || "deck");
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-tab]");
    if (t) {
      if (t.dataset.tab === currentView && !location.hash.startsWith("#card-")) {
        e.preventDefault();
        setHeader(false);
        window.scrollTo({ top: 0, behavior: mqReduce.matches ? "auto" : "smooth" });
      } else tabTap = true;
      return;
    }
    const b = e.target.closest("[data-card]");
    if (!b) return;
    e.preventDefault();
    hidePeek();
    const c = byName.get(b.dataset.card);
    if (!c) return;
    if (b.closest("#sheet")) { history.replaceState(null, "", "#card-" + slug(c.name)); openSheet(c, b.dataset.dir); return; }
    sheetFromApp = true;
    location.hash = "card-" + slug(c.name);
  });

  /* ---------------------------------------------------------------- card sheet */
  const sheet = $("#sheet"), scrim = $("#scrim"), sheetBody = $("#sheetBody");
  let sheetList = CARDS, lastFocus = null, sheetCard = null;
  function sheetNeighbours(c) {
    const list = sheetList.includes(c) ? sheetList : CARDS;
    const idx = list.indexOf(c);
    return { list, idx, prev: list[(idx - 1 + list.length) % list.length], next: list[(idx + 1) % list.length] };
  }
  function openSheet(c, dir) {
    const wasOpen = sheet.classList.contains("open");
    if (!wasOpen) lastFocus = document.activeElement;
    sheetCard = c;
    const { list, idx, prev, next } = sheetNeighbours(c);
    $("#sheetEyebrow").textContent = c.roles.map(r => ROLE_LABEL[r]).join(" · ");
    $("#sheetPos").textContent = `${idx + 1} / ${list.length}`;
    const faces = c.faces
      ? c.faces.map(f => `<div class="face-name">${esc(f.name)} <span class="cost">${mana(f.cost)}</span></div>${rulesHTML(f.text)}`).join("")
      : rulesHTML(c.text || "");
    const tags = [
      c.new ? `<span class="tag new">NEW · upgrade</span>` : "",
      c.miku ? `<span class="tag miku">Miku print: ${esc(c.miku)}</span>` : (c.sld ? `<span class="tag miku">Miku-art print</span>` : ""),
      c.qty > 1 ? `<span class="tag">× ${c.qty}</span>` : "",
      `<span class="tag">MV ${c.mv}</span>`
    ].join("");
    const cm = "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(short(c.name));
    const sf = (ART[c.name] && ART[c.name].uri) || ("https://scryfall.com/search?q=" + encodeURIComponent('!"' + c.name + '"'));
    const edh = "https://edhrec.com/cards/" + slug(short(c.name));
    const art = !!ART[c.name];
    const nm = n => esc(short(n).split(",")[0]);
    sheetBody.innerHTML = `
      <div class="detail${art ? "" : " no-art"}${dir ? " swipe-" + dir : ""}">
        ${art ? `<div class="art"><div class="foil" data-tilt><div class="mini-card" data-art="${esc(c.name)}">${miniCard(c)}</div>${c.sld ? '<span class="shine" aria-hidden="true"></span>' : ""}</div></div>` : ""}
        <div class="info">
          <div style="display:grid;gap:8px">
            <h2 id="sheetTitle">${esc(c.name)}</h2>
            <div class="typeline">${c.cost ? `<span class="cost">${mana(c.cost)}</span> · ` : ""}${esc(c.type)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">${tags}</div>
          </div>
          <div class="oracle">${faces}${c.pt ? `<span class="pt">${esc(c.pt)}</span>` : ""}</div>
          ${c.new ? `<div class="swapbox"><span>Replaces <b>${esc(c.cut)}</b> from the stock deck</span><span class="muted">·</span><a href="${cm}" target="_blank" rel="noopener">~${c.eur.toFixed(2)}€ on Cardmarket</a></div>` : ""}
          <div class="note"><h4>Why it's here</h4><p>${mana(c.why)}</p></div>
          ${c.how ? `<div class="note"><h4>How to play it</h4><p>${mana(c.how)}</p></div>` : ""}
          ${c.warn ? `<div class="note warn"><h4>Watch out</h4><p>${mana(c.warn)}</p></div>` : ""}
          ${c.syn && c.syn.length ? `<div class="note"><h4>Works with</h4><div class="syn">${c.syn.map(n => `<button class="chip" type="button" data-card="${esc(n)}">${esc(short(n))}</button>`).join("")}</div></div>` : ""}
          <div class="ext"><a href="${sf}" target="_blank" rel="noopener">Scryfall ↗</a><a href="${cm}" target="_blank" rel="noopener">Cardmarket ↗</a><a href="${edh}" target="_blank" rel="noopener">EDHREC ↗</a></div>
          <div class="sheet-nav"><button class="btn" type="button" data-card="${esc(prev.name)}" data-dir="prev" aria-label="Previous card: ${esc(prev.name)}"><span>← ${nm(prev.name)}</span></button><button class="btn" type="button" data-card="${esc(next.name)}" data-dir="next" aria-label="Next card: ${esc(next.name)}"><span>${nm(next.name)} →</span></button></div>
          <p class="swipe-hint">Swipe sideways for the next card</p>
        </div>
      </div>`;
    sheetBody.scrollTop = 0;
    bindTilt(sheetBody);
    sheet.style.removeProperty("--drag");
    sheet.classList.add("open"); scrim.classList.add("open"); sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!wasOpen) $("#sheetClose").focus({ preventScroll: true });
  }
  function closeSheet(fromRoute) {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open", "dragging"); scrim.classList.remove("open"); sheet.setAttribute("aria-hidden", "true");
    scrim.style.opacity = "";
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!fromRoute) {
      if (sheetFromApp) { sheetFromApp = false; history.back(); }
      else history.replaceState(null, "", "#" + (currentView || "cards"));
    }
  }
  function stepSheet(dir) {
    if (!sheetCard) return;
    const { prev, next } = sheetNeighbours(sheetCard);
    const c = dir === "next" ? next : prev;
    history.replaceState(null, "", "#card-" + slug(c.name));
    openSheet(c, dir);
  }
  $("#sheetClose").addEventListener("click", () => closeSheet(false));
  scrim.addEventListener("click", () => closeSheet(false));
  document.addEventListener("keydown", e => {
    if (!sheet.classList.contains("open")) {
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
      return;
    }
    if (e.key === "Escape") closeSheet(false);
    else if (e.key === "ArrowRight" && !/INPUT/.test(document.activeElement.tagName)) stepSheet("next");
    else if (e.key === "ArrowLeft" && !/INPUT/.test(document.activeElement.tagName)) stepSheet("prev");
    else if (e.key === "Tab") { // keep focus inside the sheet
      const f = $$("button, a[href]", sheet).filter(x => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Gestures: drag down to close (from the handle, or from the top of the content), swipe sideways for the next card.
  (function sheetGestures() {
    let g = null;
    const start = (e, fromBar) => {
      if (!mqMobile.matches || e.touches.length > 1) return;
      const t = e.touches[0];
      g = { x0: t.clientX, y0: t.clientY, t0: Date.now(), fromBar, top: sheetBody.scrollTop <= 0, axis: fromBar ? "y" : null, dx: 0, dy: 0 };
    };
    const move = e => {
      if (!g) return;
      const t = e.touches[0];
      g.dx = t.clientX - g.x0; g.dy = t.clientY - g.y0;
      if (!g.axis) {
        if (Math.abs(g.dx) < 9 && Math.abs(g.dy) < 9) return;
        g.axis = Math.abs(g.dx) > Math.abs(g.dy) * 1.2 ? "x" : "y";
        if (g.axis === "y" && (!g.top || g.dy < 0)) { g = null; return; } // normal scrolling
      }
      e.preventDefault();
      if (g.axis === "y") {
        const d = Math.max(0, g.dy);
        sheet.classList.add("dragging");
        sheet.style.setProperty("--drag", d + "px");
        scrim.style.opacity = String(Math.max(.2, 1 - d / 500));
      } else {
        const det = $(".detail", sheetBody);
        if (det) { det.style.transition = "none"; det.style.transform = `translateX(${g.dx * .9}px)`; det.style.opacity = String(1 - Math.min(.5, Math.abs(g.dx) / 400)); }
      }
    };
    const end = () => {
      if (!g) return;
      const dt = Math.max(1, Date.now() - g.t0);
      if (g.axis === "y") {
        sheet.classList.remove("dragging");
        scrim.style.opacity = "";
        if (g.dy > 120 || (g.dy > 40 && g.dy / dt > .6)) closeSheet(false);
        else sheet.style.setProperty("--drag", "0px");
      } else if (g.axis === "x") {
        const det = $(".detail", sheetBody);
        if (Math.abs(g.dx) > 70 || (Math.abs(g.dx) > 30 && Math.abs(g.dx) / dt > .5)) stepSheet(g.dx < 0 ? "next" : "prev");
        else if (det) { det.style.transition = "transform .3s var(--ease-out), opacity .3s"; det.style.transform = ""; det.style.opacity = ""; }
      }
      g = null;
    };
    const bar = $(".sheet-bar");
    bar.addEventListener("touchstart", e => start(e, true), { passive: true });
    sheetBody.addEventListener("touchstart", e => { if (!e.target.closest(".syn, .ext")) start(e, false); }, { passive: true });
    [bar, sheetBody].forEach(el => { el.addEventListener("touchmove", move, { passive: false }); el.addEventListener("touchend", end); el.addEventListener("touchcancel", end); });
  })();

  /* ---------------------------------------------------------------- foil tilt */
  function tiltTo(el, px, py) { // px, py in 0..1
    el.style.setProperty("--ry", ((px - .5) * 16).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((.5 - py) * 16).toFixed(2) + "deg");
    el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
    el.style.setProperty("--bx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--by", (py * 100).toFixed(1) + "%");
  }
  function bindTilt(scope) {
    if (mqReduce.matches) return;
    $$("[data-tilt]", scope).forEach(el => {
      if (el._tilt) return; el._tilt = true;
      el.addEventListener("pointermove", e => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        el.classList.add("tracking");
        tiltTo(el, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });
      el.addEventListener("pointerleave", () => { el.classList.remove("tracking"); ["--rx", "--ry", "--mx", "--my", "--bx", "--by"].forEach(p => el.style.removeProperty(p)); });
    });
  }
  // Tilting the phone moves the foil too (Android and others that don't ask permission).
  if (!mqReduce.matches && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function" && !mqHover.matches) {
    let base = null, raf = 0, last = null;
    window.addEventListener("deviceorientation", e => {
      if (e.beta == null) return;
      if (!base) base = { b: e.beta, g: e.gamma };
      last = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const px = Math.max(0, Math.min(1, .5 + (last.gamma - base.g) / 40));
        const py = Math.max(0, Math.min(1, .5 + (last.beta - base.b) / 40));
        $$("[data-tilt]").forEach(el => { if (el.offsetParent) { el.classList.add("tracking"); tiltTo(el, px, py); } });
      });
    });
  }

  /* ---------------------------------------------------------------- desktop hover preview */
  const peek = $("#peek");
  let peekFor = null;
  function hidePeek() { peek.classList.remove("show"); peekFor = null; }
  document.addEventListener("pointerover", e => {
    if (!mqHover.matches) return;
    const b = e.target.closest(".inline-card, .set-row, .chip[data-card], .swap .inline-card");
    if (!b || b.closest("#sheet")) return;
    const c = byName.get(b.dataset.card);
    if (!c || !ART[c.name]) return;
    peekFor = b;
    peek.innerHTML = `<div class="mini-card">${miniCard(c)}</div>`;
    const img = peek.querySelector("img"); if (img) img.loading = "eager";
    const r = b.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 236, Math.max(16, r.left));
    const above = r.top > 330;
    peek.style.left = left + "px";
    peek.style.top = (above ? r.top - 316 : r.bottom + 10) + "px";
    peek.classList.add("show");
  });
  document.addEventListener("pointerout", e => { if (peekFor && !peekFor.contains(e.relatedTarget)) hidePeek(); });
  window.addEventListener("scroll", () => { if (peekFor) hidePeek(); }, { passive: true });

  /* ---------------------------------------------------------------- card list */
  const state = { q: "", role: "all", sort: "role", grid: store.get("mikuWiki.grid") === "1" };
  const roleCount = r => CARDS.filter(c => r === "new" ? c.new : r === "miku" ? c.sld : c.roles.includes(r)).length;
  const chipDefs = [["all", "All", CARDS.length], ["new", "Upgrades", roleCount("new")], ["miku", "Miku art", roleCount("miku")]]
    .concat(ROLES.filter(r => r[0] !== "cmd").map(([k, l]) => [k, l, roleCount(k)]));
  $("#roleChips").innerHTML = chipDefs.map(([k, l, n]) => `<button class="chip" type="button" data-role="${k}" aria-pressed="${k === "all"}">${l} <span class="n">${n}</span></button>`).join("");
  $("#roleChips").addEventListener("click", e => {
    const b = e.target.closest("[data-role]"); if (!b) return;
    state.role = b.dataset.role;
    $$("#roleChips .chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    b.scrollIntoView({ inline: "nearest", block: "nearest", behavior: mqReduce.matches ? "auto" : "smooth" });
    renderList(true);
  });
  const qIn = $("#q"), qClear = $("#qClear");
  qIn.addEventListener("input", () => { state.q = qIn.value.trim().toLowerCase(); qClear.hidden = !qIn.value; renderList(); });
  qIn.addEventListener("keydown", e => { if (e.key === "Enter") qIn.blur(); });
  qClear.addEventListener("click", () => { qIn.value = ""; state.q = ""; qClear.hidden = true; renderList(); qIn.focus(); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; renderList(true); });
  const vt = $("#viewToggle");
  function syncToggle() {
    vt.setAttribute("aria-pressed", String(state.grid));
    vt.setAttribute("aria-label", state.grid ? "Show as a list" : "Show card images");
  }
  vt.addEventListener("click", () => { state.grid = !state.grid; store.set("mikuWiki.grid", state.grid ? "1" : "0"); syncToggle(); renderList(true); });
  syncToggle();
  function openSearch() {
    if (location.hash !== "#cards") { tabTap = true; location.hash = "cards"; }
    showView("cards", { keepScroll: true });
    const list = $("#view-cards .toolbar");
    const y = list.getBoundingClientRect().top + window.scrollY - topbar.offsetHeight;
    if (window.scrollY < y - 2) window.scrollTo(0, y);
    qIn.focus({ preventScroll: true });
    qIn.select();
  }
  $("#searchBtn").addEventListener("click", openSearch);

  function hl(name) {
    const q = state.q;
    const i = q ? name.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + q.length)) + "</mark>" + esc(name.slice(i + q.length));
  }
  function rowHTML(c) {
    const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("");
    const a = ART[c.name];
    const thumbStyle = a && a.crop ? ` style="background-image:url('${esc(a.crop)}')"` : "";
    return `<button class="card-row" type="button" data-card="${esc(c.name)}">
      <span class="thumb" data-thumb="${esc(c.name)}"${thumbStyle}>${a && a.crop ? "" : esc(initials)}</span>
      <span class="body"><span class="title">${hl(c.name)}${c.qty > 1 ? ` <span class="muted mono">×${c.qty}</span>` : ""}</span>
        <span class="sub">${esc(c.type)}</span>
        <span class="tags">${c.new ? '<span class="tag new">NEW</span>' : ""}${c.roles.slice(0, 2).map(r => `<span class="tag">${ROLE_LABEL[r]}</span>`).join("")}</span></span>
      <span class="cost">${mana(c.cost.split(" // ")[0])}</span></button>`;
  }
  function tileHTML(c) {
    return `<button class="card-tile" type="button" data-card="${esc(c.name)}" aria-label="${esc(c.name)}">
      ${c.new ? '<span class="badge">NEW</span>' : ""}${c.qty > 1 ? `<span class="qty">×${c.qty}</span>` : ""}
      <span class="mini-card" data-art="${esc(c.name)}">${miniCard(c)}</span></button>`;
  }
  function renderList(resetScroll) {
    const q = state.q;
    const list = CARDS.filter(c => {
      if (state.role === "new" && !c.new) return false;
      if (state.role === "miku" && !c.sld) return false;
      if (!["all", "new", "miku"].includes(state.role) && !c.roles.includes(state.role)) return false;
      if (!q) return true;
      return (c.name + " " + (c.text || "") + " " + (c.faces ? c.faces.map(f => f.name + " " + f.text).join(" ") : "") + " " + c.type + " " + (c.miku || "") + " " + c.why).toLowerCase().includes(q);
    });
    let groups = [];
    if (state.sort === "role") {
      for (const [k, l] of ROLES) { const g = list.filter(c => c.roles[0] === k); if (g.length) groups.push([l, g]); }
    } else if (state.sort === "type") {
      for (const t of TYPE_ORDER) { const g = list.filter(c => c.cat === t); if (g.length) groups.push([TYPE_PLURAL[t], g]); }
    } else if (state.sort === "mv") {
      groups = [["", list.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name))]];
    } else {
      groups = [["", list.slice().sort((a, b) => a.name.localeCompare(b.name))]];
    }
    // Put exact name hits first when searching.
    if (q) groups = groups.map(([l, g]) => [l, g.slice().sort((a, b) => (b.name.toLowerCase().includes(q)) - (a.name.toLowerCase().includes(q)))]);
    sheetList = groups.flatMap(g => g[1]);
    $("#count").textContent = `${list.length} of ${CARDS.length} cards`;
    const cl = $("#cardList");
    cl.classList.toggle("grid", state.grid);
    const item = state.grid ? tileHTML : rowHTML;
    cl.innerHTML = list.length
      ? groups.map(([l, g]) => (l ? `<div class="group-label">${esc(l)} · ${g.length}</div>` : "") + g.map(item).join("")).join("")
      : `<div class="empty"><span>No cards match "${esc(qIn.value)}".</span><button class="btn" type="button" id="resetFilters">Clear search and filters</button></div>`;
    if (resetScroll && currentView === "cards") {
      const tb = $("#toolbar");
      const y = cl.getBoundingClientRect().top + window.scrollY - tb.offsetHeight - topbar.offsetHeight - 30;
      if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
    }
  }
  document.addEventListener("click", e => {
    if (!e.target.closest("#resetFilters")) return;
    qIn.value = ""; state.q = ""; state.role = "all"; qClear.hidden = true;
    $$("#roleChips .chip").forEach(x => x.setAttribute("aria-pressed", x.dataset.role === "all"));
    renderList(true);
  });

  /* ---------------------------------------------------------------- setlist + copy */
  function renderSetlist() {
    const commander = CARDS.find(c => c.roles.includes("cmd"));
    const groups = [["Commander", [commander]]].concat(TYPE_ORDER.map(t => [TYPE_PLURAL[t], CARDS.filter(c => c.cat === t && c !== commander)]));
    $("#setlist").innerHTML = groups.filter(g => g[1].length).map(([l, g]) => {
      const n = g.reduce((s, c) => s + c.qty, 0);
      return `<details class="set-group" open><summary><span>${l}</span><span class="n">${n}</span></summary>${g.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name)).map(c =>
        `<button class="set-row" type="button" data-card="${esc(c.name)}"><span class="q">${c.qty}</span><span class="nm">${esc(c.name)}</span>${c.new ? '<span class="new-dot">NEW</span>' : ""}</button>`).join("")}</details>`;
    }).join("");
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2000);
  }
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const sorted = CARDS.slice().sort((a, b) => (b.roles.includes("cmd") - a.roles.includes("cmd")) || a.name.localeCompare(b.name));
    const text = sorted.map(c => b.dataset.copy === "qty" ? `${c.qty} ${c.name}` : (c.qty > 1 ? `${c.qty} ${c.name}` : c.name)).join("\n");
    try { await navigator.clipboard.writeText(text); toast("Decklist copied"); }
    catch (err) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* ignore */ }
      ta.remove(); toast(ok ? "Decklist copied" : "Copy blocked here. Long-press the setlist to select it.");
    }
  });

  /* ---------------------------------------------------------------- mana curve: an LED meter */
  function renderCurve() {
    const nonland = CARDS.filter(c => c.cat !== "Land");
    const buckets = [0, 1, 2, 3, 4, 5, 6, 7].map(v => nonland.filter(c => (v === 7 ? c.mv >= 7 : c.mv === v)));
    const counts = buckets.map(b => b.reduce((s, c) => s + c.qty, 0));
    const peakI = counts.indexOf(Math.max(...counts));
    const eq = $("#eq");
    eq.innerHTML = buckets.map((b, i) => {
      const n = counts[i];
      const segs = Array.from({ length: 14 }, (_, k) => `<i class="eq-seg${k < n ? " on" : ""}${k === n - 1 ? " top" : ""}" style="--k:${k};--c:${i}"></i>`).join("");
      return `<button class="eq-col" type="button" data-i="${i}" aria-pressed="false" aria-label="${n} cards at mana value ${i === 7 ? "7 or more" : i}">
        <span class="eq-stack">${segs}<span class="val">${n}</span></span><span class="lab">${i === 7 ? "7+" : i}</span></button>`;
    }).join("");
    const readout = $("#eqReadout");
    const select = i => {
      $$(".eq-col", eq).forEach(c => c.setAttribute("aria-pressed", String(+c.dataset.i === i)));
      const b = buckets[i];
      readout.innerHTML = `<b>Mana value ${i === 7 ? "7+" : i} · ${counts[i]} card${counts[i] === 1 ? "" : "s"}</b><div class="syn">${b.map(c => `<button class="chip" type="button" data-card="${esc(c.name)}">${esc(short(c.name))}</button>`).join("")}</div>`;
    };
    eq.addEventListener("click", e => { const c = e.target.closest(".eq-col"); if (c) select(+c.dataset.i); });
    eq.addEventListener("pointerover", e => { if (!mqHover.matches) return; const c = e.target.closest(".eq-col"); if (c && c.getAttribute("aria-pressed") !== "true") select(+c.dataset.i); });
    select(peakI);
    const types = TYPE_ORDER.map(t => [TYPE_PLURAL[t], CARDS.filter(c => c.cat === t).reduce((s, c) => s + c.qty, 0)]).filter(t => t[1]);
    const tmax = Math.max(...types.map(t => t[1]));
    $("#typebars").innerHTML = types.map(([l, n]) => `<div class="typebar"><span>${l}</span><span class="bar" data-w="${(n / tmax) * 100}%"></span><span class="num">${n}</span></div>`).join("");
  }

  /* ---------------------------------------------------------------- combo simulators */
  function ringHTML(labels, unit) {
    const cx = 66, cy = 66, R = 50;
    const nodes = labels.map((_, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / labels.length;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return `<g><circle class="node" data-n="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10"/><text x="${x.toFixed(1)}" y="${(y + 3.6).toFixed(1)}" text-anchor="middle" font-size="10" font-family="DM Mono, monospace" font-weight="700" fill="currentColor">${i + 1}</text></g>`;
    }).join("");
    return `<div class="sim-top">
      <div class="ring"><svg viewBox="0 0 132 132" aria-hidden="true"><circle class="track" cx="66" cy="66" r="50"/><g class="orbit"><circle cx="66" cy="16" r="5"/></g>${nodes}</svg>
        <div class="center"><b data-k="loops">0</b><span>${unit}</span></div></div>
      <ol class="ring-legend">${labels.map(l => `<li>${l}</li>`).join("")}</ol></div>`;
  }
  function makeRing(el) {
    const ring = $(".ring", el), nodes = $$(".node", el), legend = $$(".ring-legend li", el);
    let timers = [];
    const hot = i => { nodes.forEach((n, k) => n.classList.toggle("hot", k === i)); legend.forEach((n, k) => n.classList.toggle("hot", k === i)); };
    return {
      pulse() {
        if (mqReduce.matches) return;
        timers.forEach(clearTimeout); timers = [];
        restart(ring, "spin");
        nodes.forEach((_, i) => timers.push(setTimeout(() => hot(i), i * 200)));
        timers.push(setTimeout(() => hot(-1), nodes.length * 200 + 150));
      },
      spin(on) { ring.classList.toggle("spinning", on && !mqReduce.matches); if (!on) hot(-1); },
      count(n) { $("[data-k=loops]", el).textContent = n; }
    };
  }
  function meterHTML(key, label, max) {
    return `<div class="meter" data-m="${key}"><span>${label}</span><b>0</b>${max ? `<span class="hp"><i></i></span>` : ""}</div>`;
  }
  function setMeter(root, key, val, max) {
    const m = $(`[data-m="${key}"]`, root); if (!m) return;
    const b = $("b", m);
    const old = b.textContent;
    b.textContent = val;
    if (String(val) !== old) { if (max && +val < +old) restart(m, "hit"); else restart(m, "bump"); }
    if (max) {
      $(".hp i", m).style.width = Math.max(0, Math.min(100, (val / max) * 100)) + "%";
      m.classList.toggle("dead", val <= 0);
      m.classList.toggle("low", val > 0 && val <= max * .25);
    }
  }
  function ballistaSim() {
    const el = $("#simBallista");
    el.innerHTML = ringHTML(["Remove a counter", "1 damage to a player", "Lifelink: gain 1", "Heliod: counter back"], "pings") +
      `<div class="sim-meters">${meterHTML("c", "Ballista counters")}${meterHTML("life", "Your life")}${[1, 2, 3].map(i => meterHTML("o" + i, "Opponent " + i, 40)).join("")}</div>
      <div class="sim-log" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn" type="button" data-a="ll"></button>
        <button class="btn" type="button" data-a="ping">Ping once</button>
        <button class="btn pink" type="button" data-a="all">Loop until the table is dead</button>
        <button class="btn" type="button" data-a="reset">Reset</button></div>`;
    const ring = makeRing(el);
    let s, timer;
    const done = () => s.opp.every(x => x <= 0);
    const reset = () => { clearInterval(timer); ring.spin(false); s = { counters: 2, life: 40, opp: [40, 40, 40], lifelink: false, pings: 0, log: "Heliod is out. Walking Ballista has 2 counters. Give it lifelink to start." }; draw(); };
    const ping = () => {
      const t = s.opp.findIndex(x => x > 0);
      if (t < 0) return false;
      s.opp[t]--; s.pings++;
      if (s.lifelink) { s.life++; s.log = `Ping ${s.pings}: 1 damage to opponent ${t + 1}. Lifelink +1 life, Heliod puts the counter back.`; }
      else { s.counters--; s.log = `Ping without lifelink: Ballista loses a counter and nothing comes back.`; }
      if (done()) { s.log = `${s.pings} pings. Every opponent is dead.`; clearInterval(timer); ring.spin(false); }
      return true;
    };
    function draw() {
      setMeter(el, "c", s.counters); setMeter(el, "life", s.life);
      s.opp.forEach((o, i) => setMeter(el, "o" + (i + 1), o, 40));
      ring.count(s.pings);
      $(".sim-log", el).textContent = s.log;
      const ll = $("[data-a=ll]", el);
      ll.disabled = s.lifelink; ll.classList.toggle("primary", !s.lifelink);
      ll.innerHTML = s.lifelink ? "Lifelink on" : "Pay " + mana("{1}{W}") + ": lifelink";
      $("[data-a=ping]", el).disabled = done() || s.counters < 1;
      $("[data-a=all]", el).disabled = done() || !s.lifelink;
    }
    el.addEventListener("click", e => {
      const a = e.target.closest("[data-a]"); if (!a) return;
      const k = a.dataset.a;
      if (k === "ll") { s.lifelink = true; s.log = "Ballista has lifelink until end of turn. Now every ping gains 1 life."; }
      if (k === "ping") { if (s.counters < 1) return; ping(); if (s.lifelink) ring.pulse(); }
      if (k === "all") {
        clearInterval(timer);
        if (mqReduce.matches) { while (ping()); draw(); return; }
        ring.spin(true);
        timer = setInterval(() => { for (let i = 0; i < 3; i++) ping(); draw(); if (done()) { clearInterval(timer); ring.spin(false); } }, 30);
        return;
      }
      if (k === "reset") return reset();
      draw();
    });
    reset();
  }
  function feederSim() {
    const el = $("#simFeeder");
    const ENG = { heliod: "Heliod", thune: "Archangel of Thune", cleric: "Cleric Class" };
    el.innerHTML = `<div class="chips" role="group" aria-label="Engine">${Object.entries(ENG).map(([k, l]) => `<button class="chip" type="button" data-e="${k}" aria-pressed="false">${l}</button>`).join("")}</div>` +
      ringHTML(["Remove a counter", "Gain 2 life", "Engine triggers", "Counter back on Feeder"], "loops") +
      `<div class="sim-meters">${meterHTML("f", "Feeder counters")}${meterHTML("life", "Your life")}${meterHTML("team", "Team bonus +X/+X")}${[1, 2, 3].map(i => meterHTML("o" + i, "Opponent " + i, 40)).join("")}</div>
      <div class="sim-log" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn" type="button" data-a="one">Loop once</button>
        <button class="btn primary" type="button" data-a="many">Loop 25 times</button>
        <button class="btn pink" type="button" data-a="flux">Aetherflux: pay 50</button>
        <button class="btn" type="button" data-a="reset">Reset</button></div>`;
    const ring = makeRing(el);
    const legend = $$(".ring-legend li", el);
    let s, timer;
    const reset = (eng = (s && s.eng) || "heliod") => { clearInterval(timer); ring.spin(false); s = { eng, feeder: 2, life: 40, team: 0, loops: 0, opp: [40, 40, 40], log: `Spike Feeder has 2 counters. Engine: ${ENG[eng]}. Aetherflux Reservoir is out.` }; draw(); };
    const loop = () => {
      const gain = s.eng === "cleric" ? 3 : 2;
      s.life += gain; s.loops++;
      if (s.eng === "thune") s.team++;
      s.log = `Loop ${s.loops}: remove a counter, gain ${gain}. ${ENG[s.eng]} puts ${s.eng === "thune" ? "a counter on every creature" : "the counter back on Feeder"}.`;
    };
    function draw() {
      const alive = s.opp.some(x => x > 0);
      $$("[data-e]", el).forEach(b => b.setAttribute("aria-pressed", String(b.dataset.e === s.eng)));
      legend[1].textContent = `Gain ${s.eng === "cleric" ? 3 : 2} life`;
      legend[2].textContent = `${ENG[s.eng]} triggers`;
      legend[3].textContent = s.eng === "thune" ? "Counter on every creature" : "Counter back on Feeder";
      setMeter(el, "f", s.feeder); setMeter(el, "life", s.life); setMeter(el, "team", s.team);
      $('[data-m="team"]', el).hidden = s.eng !== "thune";
      s.opp.forEach((o, i) => setMeter(el, "o" + (i + 1), o, 40));
      ring.count(s.loops);
      $(".sim-log", el).textContent = s.log;
      $("[data-a=flux]", el).disabled = !(s.life > 50 && alive);
    }
    el.addEventListener("click", e => {
      const eb = e.target.closest("[data-e]"); if (eb) return reset(eb.dataset.e);
      const a = e.target.closest("[data-a]"); if (!a) return;
      const k = a.dataset.a;
      if (k === "one") { loop(); ring.pulse(); }
      if (k === "many") {
        clearInterval(timer);
        if (mqReduce.matches) { for (let i = 0; i < 25; i++) loop(); draw(); return; }
        ring.spin(true);
        let n = 0; timer = setInterval(() => { loop(); draw(); if (++n >= 25) { clearInterval(timer); ring.spin(false); } }, 40); return;
      }
      if (k === "flux") {
        const t = s.opp.findIndex(x => x > 0);
        if (t >= 0 && s.life > 50) { s.life -= 50; s.opp[t] = 0; s.log = s.opp.every(x => x <= 0) ? "Three activations of Aetherflux Reservoir. The table is dead." : `Pay 50 life: 50 damage to opponent ${t + 1}. Loop again for the next one.`; }
      }
      if (k === "reset") return reset();
      draw();
    });
    reset();
  }

  /* ---------------------------------------------------------------- lethal calculator */
  const CALC_ROWS = [
    ["Just attack", 0, (N, P) => N * P, ""],
    ["Beastmaster Ascension", 3, (N, P) => N >= 7 ? N * (P + 5) : N * P, N => N >= 7 ? "" : "needs 7 attackers"],
    ["Triumph of the Hordes", 4, (N, P) => N * (P + 1), "poison"],
    ["Overwhelming Stampede", 5, (N, P, B) => N * (P + B), ""],
    ["Jazal Goldmane, 1 activation", 5, (N, P) => N * (P + N), "Jazal must attack"],
    ["Return of the Wildspeaker", 5, (N, P) => N * (P + 3), "non-Humans only"],
    ["Mirror Entity, X=6", 6, N => N * 6, "counters add on top"],
    ["Craterhoof Behemoth", 8, (N, P) => N * P + 5 + (N + 1) * (N + 1), "Hoof attacks too"],
    ["Finale of Devastation, X=10", 12, (N, P) => N * (P + 10), "plus a free creature"]
  ];
  function buildCalc() {
    $("#calcBody").innerHTML = CALC_ROWS.map(([name, m], i) => {
      const card = name.split(",")[0];
      const nm = byName.has(card) ? `<button class="inline-card" type="button" data-card="${esc(card)}">${esc(name)}</button>` : esc(name);
      return `<div class="lethal-row" data-r="${i}"><div class="lr-top"><span class="lr-name">${nm}</span><span class="lr-mana">${m ? m + " mana" : "free"}</span><span class="lr-dmg"></span></div>
        <div class="lr-bar"><i></i><span class="tick" style="left:33.33%"></span><span class="tick" style="left:66.66%"></span></div>
        <div class="lr-foot"><span class="lr-note"></span><span class="lr-res"></span></div></div>`;
    }).join("");
  }
  function calc() {
    const v = id => Math.max(0, parseInt($(id).value, 10) || 0);
    const N = Math.max(1, v("#cN")), P = v("#cP"), B = Math.max(v("#cB"), P), L = Math.max(1, v("#cL"));
    CALC_ROWS.forEach(([, , f, noteF], i) => {
      const row = $(`[data-r="${i}"]`, $("#calcBody"));
      const dmg = f(N, P, B);
      const note = typeof noteF === "function" ? noteF(N) : noteF;
      const poison = note === "poison";
      const need = poison ? 10 : L;
      const kills = Math.min(3, Math.floor(dmg / need));
      row.classList.toggle("win", kills > 0); row.classList.toggle("all", kills >= 3);
      $(".lr-dmg", row).textContent = poison ? "☠ " + dmg : dmg;
      $(".lr-bar i", row).style.setProperty("--w", Math.min(100, (dmg / (need * 3)) * 100) + "%");
      $(".lr-note", row).textContent = poison ? `${dmg} poison total` : note;
      $(".lr-res", row).innerHTML = kills >= 3 ? `<span class="verdict win">Kills the table</span>` : kills > 0 ? `<span class="verdict win">Kills ${kills} of 3</span>` : `<span class="verdict no">Not lethal</span>`;
    });
  }
  $$(".calc-inputs input").forEach(i => i.addEventListener("input", calc));
  (function steppers() {
    let hold = null;
    const step = b => {
      const [k, d] = b.dataset.step.split(":");
      const inp = $({ n: "#cN", p: "#cP", b: "#cB", l: "#cL" }[k]);
      inp.value = Math.max(+inp.min, Math.min(+inp.max, (parseInt(inp.value, 10) || 0) + +d));
      calc();
    };
    const stop = () => { if (hold) { clearTimeout(hold.t); clearInterval(hold.i); hold = null; } };
    // Mouse steps on press; touch steps on release so scrolling past a stepper never changes it.
    // Holding either one repeats.
    document.addEventListener("pointerdown", e => {
      const b = e.target.closest("[data-step]"); if (!b || e.button > 0) return;
      stop();
      const touch = e.pointerType !== "mouse";
      if (!touch) step(b);
      hold = { b, touch, held: false, t: setTimeout(() => { hold.held = true; step(b); hold.i = setInterval(() => step(b), 70); }, 420) };
    });
    window.addEventListener("pointerup", e => { if (hold && hold.touch && !hold.held && e.target.closest && e.target.closest("[data-step]") === hold.b) step(hold.b); }, true);
    ["pointerup", "pointercancel", "pointerleave", "blur"].forEach(ev => window.addEventListener(ev, stop, true));
    document.addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b && e.detail === 0) step(b); }); // keyboard
    document.addEventListener("contextmenu", e => { if (e.target.closest("[data-step]")) e.preventDefault(); });
  })();

  /* ---------------------------------------------------------------- hand trainer */
  const LIBRARY = CARDS.filter(c => !c.roles.includes("cmd")).flatMap(c => Array(c.qty).fill(c));
  let deck = [], hand = [], mulls = 0;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function newHand(isMull) {
    mulls = isMull ? mulls + 1 : 0;
    deck = shuffle(LIBRARY.slice()); hand = deck.splice(0, 7); drawHand(true);
  }
  function verdict() {
    const opening = hand.slice(0, 7);
    const L = opening.filter(c => c.cat === "Land").length;
    const ramp = opening.filter(c => c.cat !== "Land" && c.roles.includes("ramp") && c.mv <= 2).length;
    const cheap = opening.filter(c => c.cat !== "Land" && c.mv <= 3).length;
    const bottom = Math.max(0, mulls - 1);
    const botTxt = bottom ? ` Put ${bottom} card${bottom > 1 ? "s" : ""} on the bottom.` : mulls === 1 ? " This was your free mulligan." : "";
    let cls, head, why;
    if (L <= 1) { cls = "mull"; head = "Mulligan"; why = `${L} land${L === 1 ? "" : "s"}. Even with ramp this stalls.`; }
    else if (L >= 6) { cls = "mull"; head = "Mulligan"; why = `${L} lands and almost nothing to do with them.`; }
    else if (L === 2) {
      if (ramp) { cls = "keep"; head = "Keep, carefully"; why = `2 lands and ${ramp} cheap ramp piece${ramp > 1 ? "s" : ""}. You need to hit a land drop soon.`; }
      else { cls = "mull"; head = "Mulligan"; why = "2 lands and no cheap ramp. Too likely to miss land drops."; }
    } else if (cheap === 0) { cls = "keep"; head = "Keep, but slow"; why = `${L} lands, but nothing to cast before turn 4.`; }
    else { cls = "keep"; head = "Keep"; why = `${L} lands, ${ramp} cheap ramp, ${cheap} play${cheap > 1 ? "s" : ""} at 3 mana or less.`; }
    const el = $("#handVerdict");
    el.className = "hand-verdict " + cls;
    el.innerHTML = `<span class="stamp">${cls === "keep" ? "KEEP" : "MULL"}</span><b>${head}</b><span>${why}${botTxt}</span>${hand.length > 7 ? `<span class="muted">Drew ${hand.length - 7} since the opener.</span>` : ""}`;
  }
  const slotHTML = (c, i, cls) => `<button class="slot ${cls}" type="button" data-card="${esc(c.name)}" style="--i:${i}" aria-label="${esc(c.name)}"><span class="mini-card" data-art="${esc(c.name)}">${miniCard(c)}</span></button>`;
  function drawHand(deal) {
    const h = $("#hand");
    h.innerHTML = hand.map((c, i) => slotHTML(c, i, deal ? "deal" : "")).join("");
    h.classList.toggle("more", hand.length > 7);
    h.scrollLeft = 0;
    verdict();
  }
  $("#drawHand").addEventListener("click", () => newHand(false));
  $("#mullHand").addEventListener("click", () => newHand(true));
  $("#drawOne").addEventListener("click", () => {
    if (!deck.length) return;
    const c = deck.shift(); hand.push(c);
    const h = $("#hand");
    h.insertAdjacentHTML("beforeend", slotHTML(c, 0, "drawn"));
    h.classList.toggle("more", hand.length > 7);
    h.scrollTo({ left: h.scrollWidth, behavior: mqReduce.matches ? "auto" : "smooth" });
    verdict();
  });

  /* ---------------------------------------------------------------- buying checklists */
  // One ticked set for every list on the page, saved on this device.
  const BOUGHT_KEY = "mikuWiki.bought.v1";
  let bought = new Set();
  try { bought = new Set(JSON.parse(store.get(BOUGHT_KEY) || "[]")); } catch (e) { /* ignore */ }
  const saveBought = () => store.set(BOUGHT_KEY, JSON.stringify([...bought]));
  const cmURL = n => "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(n);
  const eur = n => n >= 100 ? Math.round(n) + "€" : n.toFixed(2);
  const TICK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function itemHTML(it, i) {
    const on = bought.has(it.id);
    const name = byName.has(it.name) ? `<button class="inline-card" type="button" data-card="${esc(it.name)}">${esc(it.name)}</button>` : `<span>${esc(it.name)}</span>`;
    const tags = (it.tags || []).map(t => `<span class="tag${t[1] ? " " + t[1] : ""}">${esc(t[0])}</span>`).join("");
    return `<div class="swap${on ? " done" : ""}${it.cut ? "" : " plain"}" data-id="${esc(it.id)}">
      <button class="tick" type="button" aria-pressed="${on}" aria-label="Bought ${esc(it.name)}"><span><em>${i + 1}</em>${TICK_SVG}</span></button>
      <div class="who">${it.cut ? `<span class="cut">${esc(it.cut)}</span>` : ""}<span class="add">${name}</span>${it.note || tags ? `<span class="sub-note">${it.note ? esc(it.note) : ""}${tags}</span>` : ""}</div>
      ${it.link === false ? `<span class="eur">${eur(it.eur)}</span>` : `<a class="eur" href="${cmURL(it.name)}" target="_blank" rel="noopener" aria-label="${it.eur.toFixed(2)} euros, search Cardmarket">${eur(it.eur)}</a>`}</div>`;
  }
  function checklist({ body, progress, items, tiers = {}, budget, budgetLabel, footer, done, extra }) {
    const render = () => {
      body.innerHTML = items.map((it, i) => (tiers[i] ? `<div class="tier"><span>${tiers[i][0]}</span><span>${tiers[i][1]}</span></div>` : "") + itemHTML(it, i)).join("") + (footer ? footer() : "");
      update();
    };
    const update = () => {
      const got = items.filter(it => bought.has(it.id));
      const spent = got.reduce((s, it) => s + it.eur, 0), total = items.reduce((s, it) => s + it.eur, 0);
      const next = items.find(it => !bought.has(it.id));
      const cap = budget || total;
      const over = budget && spent > budget;
      progress.innerHTML = `<div class="sp-top"><span><b>${got.length}</b> of ${items.length} bought</span><span class="mono">${Math.round(spent)}€ / ${budgetLabel || "~" + Math.round(total) + "€"}</span></div>
        <div class="sp-bar${over ? " over" : ""}"><i style="--w:${Math.min(100, (spent / cap) * 100)}%"></i></div>
        <div class="sp-top"><span>${next ? `Next: ${esc(next.name)}` : esc(done)}</span>${got.length ? '<button type="button" data-clear>Clear ticks</button>' : ""}</div>${extra ? extra() : ""}`;
    };
    body.addEventListener("click", e => {
      const t = e.target.closest(".tick"); if (!t) return;
      const row = t.closest("[data-id]"), id = row.dataset.id;
      if (bought.has(id)) bought.delete(id); else bought.add(id);
      row.classList.toggle("done", bought.has(id));
      t.setAttribute("aria-pressed", String(bought.has(id)));
      saveBought(); update();
    });
    progress.addEventListener("click", e => {
      if (!e.target.closest("[data-clear]")) return;
      items.forEach(it => bought.delete(it.id)); saveBought(); render(); toast("Ticks cleared");
    });
    render();
    return { render, update, set(newItems, newTiers) { items = newItems; tiers = newTiers || {}; render(); } };
  }
  const SWAP_ORDER = ["Overwhelming Stampede", "Beastmaster Ascension", "Intangible Virtue", "Mirror Entity", "Beast Within", "Adeline, Resplendent Cathar", "Spike Feeder", "Jazal Goldmane", "Elspeth, Sun's Champion", "Esika's Chariot", "Arcane Signet", "Elvish Mystic", "Crashing Drawbridge", "Return of the Wildspeaker", "Generous Gift", "Razorverge Thicket", "Heliod, Sun-Crowned", "Walking Ballista", "Cathars' Crusade", "Hero of Bladehold", "Triumph of the Hordes", "Craterhoof Behemoth"];
  function renderSwaps() {
    const items = [{ id: "miku:precon", name: "Secret Lair Commander Deck: Hatsune Miku", eur: 200, note: "Sealed. Sold for 199.90€ on eBay.de; check what you pay.", link: false }]
      .concat(SWAP_ORDER.map(n => { const c = byName.get(n); return { id: "miku:" + n, name: n, cut: c.cut, eur: c.eur }; }));
    const swapTotal = items.slice(1).reduce((s, it) => s + it.eur, 0);
    checklist({
      body: $("#swapBody"), progress: $("#swapProgress"), items, budget: 300, budgetLabel: "300€ budget",
      tiers: { 0: ["The deck", "~200€"], 1: ["Cheap core", "~25€"], 17: ["The infinite-damage combo", "~24€"], 19: ["Power", "~12€"], 21: ["Splurge", "~33€"] },
      footer: () => `<div class="swap-total"><span>Deck + all 22 swaps</span><span>~${Math.round(200 + swapTotal)}€</span></div>`,
      done: "Deck bought and every upgrade in. Enjoy it."
    });
  }
  function renderAzusa() {
    const A = window.MIKU_AZUSA; if (!A) return;
    const NOTES = {
      s1: "Miku Azusa, Craterhoof, the Dark Depths + Thespian's Stage combo with its tutors, every card under about 9€, and 24 Forests. Fill the 9 empty slots with Forests or cards borrowed from the Trostani deck.",
      s2: "Finishes the budget list. After this the deck has 2 Game Changers (Crop Rotation, Field of the Dead): a strong Bracket 3.",
      s3: "The Bracket 4 push. Cut Arboreal Grazer, Traverse the Ulvenwald, Splendid Reclamation, Khalni Heart Expedition, Garruk's Uprising, Rampant Growth, Explore, Harrow, Terramorphic Expanse and 4 Forests for them. Ends at 5 Game Changers."
    };
    const itemsOf = st => A[st].map(x => ({ id: "az" + st + ":" + x.n, name: x.n, eur: x.eur, note: x.note, tags: [x.gc ? ["Game Changer", "new"] : null, x.est ? ["price estimated"] : null].filter(Boolean), link: x.n !== "24 Forest" }));
    const allItems = ["s1", "s2", "s3"].flatMap(itemsOf);
    let st = store.get("mikuWiki.azStage") || "s1";
    const list = checklist({
      body: $("#azBody"), progress: $("#azProgress"), items: itemsOf(st),
      done: "This stage is complete.",
      extra: () => {
        const spent = allItems.filter(it => bought.has(it.id)).reduce((s, it) => s + it.eur, 0);
        const total = allItems.reduce((s, it) => s + it.eur, 0);
        return `<div class="sp-top sp-all"><span>All three stages</span><span class="mono">${Math.round(spent)}€ / ~${Math.round(total)}€</span></div>`;
      }
    });
    const pick = s => {
      st = s; store.set("mikuWiki.azStage", s);
      $$("#azSeg [data-stage]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.stage === s)));
      $("#azNote").textContent = NOTES[s];
      list.set(itemsOf(s));
    };
    $("#azSeg").addEventListener("click", e => { const b = e.target.closest("[data-stage]"); if (b && b.dataset.stage !== st) { pick(b.dataset.stage); restart($("#azBody"), "swap-in"); } });
    pick(st);
  }

  /* ---------------------------------------------------------------- speed test chart */
  function renderSpeed() {
    const TURNS = [6, 7, 8, 9, 10, 11, 12];
    const COMBO = [4, 13, 31, 55, 75, 87, 94], BEAT = [2, 9, 27, 51, 72, 85, 93];
    const el = $("#speedChart"), out = $("#speedReadout");
    el.innerHTML = `<div class="sp-grid" aria-hidden="true"><span style="--y:75%">75%</span><span style="--y:50%">50%</span><span style="--y:25%">25%</span></div>` +
      TURNS.map((t, i) => `<button class="sp-col${t >= 7 && t <= 9 ? " key" : ""}" type="button" data-i="${i}" aria-pressed="false" aria-label="By turn ${t}: ${COMBO[i]}% of games">
        <span class="sp-stack"><span class="sp-bar-v" style="--h:${COMBO[i]}%;--i:${i}"><span class="sp-val">${COMBO[i]}%</span></span></span><span class="sp-lab">T${t}</span></button>`).join("");
    const select = i => {
      $$(".sp-col", el).forEach(c => c.setAttribute("aria-pressed", String(+c.dataset.i === i)));
      out.innerHTML = `<b>Won by the end of turn ${TURNS[i]}: ${COMBO[i]}% of games</b><span class="muted">${BEAT[i]}% with the combos switched off, so they add ${COMBO[i] - BEAT[i]} point${COMBO[i] - BEAT[i] === 1 ? "" : "s"}.</span>`;
    };
    el.addEventListener("click", e => { const c = e.target.closest(".sp-col"); if (c) select(+c.dataset.i); });
    el.addEventListener("pointerover", e => { if (!mqHover.matches) return; const c = e.target.closest(".sp-col"); if (c) select(+c.dataset.i); });
    select(2);
    const ENDS = [["Plain combat damage", 68], ["Overwhelming Stampede", 8], ["Triumph of the Hordes", 7], ["Craterhoof Behemoth", 6], ["Return of the Wildspeaker", 5], ["Heliod + Walking Ballista", 2.6], ["Finale for Craterhoof", 1], ["Spike Feeder + Aetherflux", .7], ["Aetherflux off big life", .7]];
    $("#endings").innerHTML = ENDS.map(([l, n]) => {
      const card = byName.has(l) ? `<button class="inline-card" type="button" data-card="${esc(l)}">${esc(l)}</button>` : esc(l);
      return `<div class="typebar"><span>${card}</span><span class="bar" data-w="${Math.max(1, n / 68 * 100)}%"></span><span class="num">${n < 1 ? n.toFixed(1) : n}%</span></div>`;
    }).join("");
  }

  /* ---------------------------------------------------------------- tables that stack on phones */
  $$("table.stack").forEach(t => {
    const heads = $$("thead th", t).map(th => th.textContent.trim());
    $$("tbody tr", t).forEach(tr => $$("td", tr).forEach((td, i) => td.setAttribute("data-label", heads[i] || "")));
  });

  /* ---------------------------------------------------------------- motion that carries meaning */
  // the hero waveform: deterministic "voice" bars that sing while the hero is on screen
  (function wave() {
    const w = $("#wave"); let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    w.innerHTML = Array.from({ length: 44 }, (_, i) => {
      const env = Math.sin(Math.PI * (i + .5) / 44) * .7 + .3;
      const h = (.15 + rnd() * .45) * env, h2 = Math.min(1, (.45 + rnd() * .55) * env + .1);
      return `<i style="--h:${h.toFixed(2)};--h2:${h2.toFixed(2)};--d:${(-rnd() * 1.4).toFixed(2)}s"></i>`;
    }).join("");
    if (mqReduce.matches || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(es => es.forEach(en => w.classList.toggle("live", en.isIntersecting))).observe(w);
  })();
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (mqReduce.matches) return;
    const t0 = performance.now(), dur = 1100;
    const f = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(f);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(f);
  }
  const flowEl = $(".flow");
  function flowFill() {
    if (mqReduce.matches || !flowEl.offsetParent) return;
    const r = flowEl.getBoundingClientRect(), vh = window.innerHeight;
    const wide = !mqMobile.matches && window.innerWidth >= 820;
    const p = wide ? (vh * .9 - r.top) / (vh * .5) : (vh * .7 - r.top) / r.height;
    flowEl.style.setProperty("--fill", Math.max(0, Math.min(1, p)).toFixed(3));
  }
  function reveals() {
    const run = el => {
      if (el.matches("[data-count]")) countUp(el);
      else if (el.id === "eq") el.classList.add("lit");
      else if (el.id === "typebars" || el.id === "endings") $$(".bar", el).forEach(b => b.style.width = b.dataset.w);
      else if (el.id === "speedChart") el.classList.add("lit");
      else if (el.classList.contains("budget-bar")) el.classList.add("in");
    };
    const els = $$("[data-count], #eq, #typebars, #endings, #speedChart, .budget-bar");
    if (!("IntersectionObserver" in window) || mqReduce.matches) {
      els.forEach(el => { if (!el.matches("[data-count]")) run(el); });
      return;
    }
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); run(en.target); } }), { threshold: .35 });
    els.forEach(el => io.observe(el));
  }

  /* ---------------------------------------------------------------- theme */
  const savedTheme = store.get("mikuWiki.theme");
  const themeColor = () => getComputedStyle(root).getPropertyValue("--bg").trim();
  function syncThemeMeta() { $$('meta[name="theme-color"]').forEach(m => m.setAttribute("content", themeColor())); }
  if (savedTheme === "dark" || savedTheme === "light") { root.dataset.theme = savedTheme; syncThemeMeta(); }
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("mikuWiki.theme", root.dataset.theme);
    syncThemeMeta();
  });

  /* ---------------------------------------------------------------- boot */
  linkMentions();
  manaText(document.querySelector("main"));
  if (!mqMobile.matches) $$("details[data-auto-open]").forEach(d => d.open = true);
  renderSetlist();
  renderCurve();
  renderList();
  renderSwaps();
  renderAzusa();
  renderSpeed();
  ballistaSim();
  feederSim();
  buildCalc();
  calc();
  newHand(false);
  route();
  paintArt();
  bindTilt(document);
  reveals();
  loadArt();
  if ("serviceWorker" in navigator && location.protocol === "https:" && /github\.io$|^localhost$/.test(location.hostname)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode is optional */ }));
  }
})();
