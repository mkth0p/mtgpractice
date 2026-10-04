/* Miku Deck: the app shell (five tabs, each split into segments, and the router), the card wiki
   and its sheet, the guide reader, the interactive widgets, the stats and shop pages, and the
   game table, which only loads on the first visit to Play. */
(function () {
  "use strict";
  const K = window.MikuKit;
  const esc = K.esc, store = K.store, mana = K.mana;
  // Another deck's site (etrata/) reuses this shell: window.DECK_SITE swaps in its data, storage key,
  // roles, colors, bot results and widgets, and points the game at ../miku/game/.
  const D = window.DECK_SITE || {};
  const CARDS = D.cards || window.MIKU_CARDS || [];
  const WIKI = D.wiki || window.MIKU_WIKI || {};
  const GUIDE = D.guide || window.MIKU_GUIDE || [];
  const GLOSSARY = D.glossary || window.MIKU_GLOSSARY || [];
  const CUTS = D.cuts || window.MIKU_CUTS || [];
  const FAQ = D.faq || window.MIKU_FAQ || [];
  // Cards outside the deck that still get a wiki entry (Etrata's Bracket 4 upgrade): qty 0, shown under their own filter.
  const EXTRA = D.extraCards || [];
  Object.assign(WIKI, D.extraWiki || {});
  const ALL = CARDS.concat(EXTRA);
  const KEY = D.key || "mikuWiki"; // localStorage prefix
  const SHORT = D.short || "Miku";
  const V = "25"; // asset version: keep in step with the ?v= links in index.html and sw.js
  const byName = new Map(ALL.map(c => [c.name, c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const slug = n => String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const short = n => String(n).split(" // ")[0];
  const pad = n => String(n).padStart(2, "0");
  const sum = (a, f) => a.reduce((s, x) => s + (f ? f(x) : x), 0);
  const bySlug = new Map(ALL.map(c => [slug(c.name), c]));
  const root = document.documentElement;
  const mqMobile = matchMedia("(max-width: 899px)");
  const mqReduce = matchMedia("(prefers-reduced-motion: reduce)");
  const mqHover = matchMedia("(hover: hover) and (pointer: fine)");
  const calm = () => mqReduce.matches;
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  const COMMANDER = CARDS.find(c => c.roles.includes("cmd"));
  const LIBRARY = CARDS.filter(c => c !== COMMANDER).flatMap(c => Array(c.qty).fill(c)); // the 99
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  const ROLES = D.roles || [
    ["cmd", "Commander"], ["ramp", "Ramp"], ["draw", "Card draw"], ["removal", "Removal"],
    ["protect", "Protection"], ["tokens", "Token makers"], ["gain", "Lifegain sources"],
    ["payoff", "Lifegain payoffs"], ["finisher", "Finishers"], ["combo", "Combo pieces"],
    ["utility", "Utility"], ["land", "Lands"]
  ];
  const ROLE_LABEL = Object.fromEntries(ROLES);
  const TYPE_ORDER = ["Creature", "Planeswalker", "Artifact", "Enchantment", "Instant", "Sorcery", "Land"];
  const TYPE_PLURAL = { Creature: "Creatures", Planeswalker: "Planeswalker", Artifact: "Artifacts", Enchantment: "Enchantments", Instant: "Instants", Sorcery: "Sorceries", Land: "Lands" };

  /* ---------------------------------------------------------------- text helpers */
  // Mana braces inside authored HTML ({G}, {1}, {T}) become symbols; the HTML itself is trusted page copy.
  const rich = html => String(html == null ? "" : html).replace(/\{([0-9]{1,2}|[WUBRGCXT]|[WUBRG]\/[WUBRGP])\}/gi, m => mana(m));
  const ratingOf = c => (WIKI[c.name] && WIKI[c.name].rating) || 0;
  const vu = r => `<span class="vu" role="img" aria-label="Rated ${r} of 5">${[1, 2, 3, 4, 5].map(i => `<i${i <= r ? ' class="on"' : ""}></i>`).join("")}</span>`;
  const cardChip = n => `<button class="chip" type="button" data-card="${esc(n)}">${esc(short(n))}</button>`;
  const cardLink = (n, label) => byName.has(n) ? `<button class="inline-card" type="button" data-card="${esc(n)}">${esc(label || short(n))}</button>` : esc(label || n);
  const initials = n => short(n).replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("");
  function linkMentions(scope) {
    $$("i-c", scope).forEach(el => {
      const name = el.textContent.trim();
      if (!byName.has(name)) console.warn("Unknown card mention", name);
      const b = document.createElement("button");
      b.type = "button"; b.className = "inline-card"; b.dataset.card = name;
      b.textContent = el.dataset.label || short(name);
      // keep trailing punctuation on the same line as the card name
      const nx = el.nextSibling, m = nx && nx.nodeType === 3 && nx.nodeValue.match(/^(?:[’']s|[,.;:!?)”]+)/);
      if (m) {
        nx.nodeValue = nx.nodeValue.slice(m[0].length);
        const w = document.createElement("span");
        w.className = "nw";
        el.replaceWith(w);
        w.append(b, m[0]);
      } else el.replaceWith(b);
    });
  }
  function manaText(scope) {
    const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT, { acceptNode: n => /\{[^}]+\}/.test(n.nodeValue) && !n.parentElement.closest("script,style,textarea") ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT });
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(n => { const span = document.createElement("span"); span.innerHTML = mana(n.nodeValue); n.replaceWith(...span.childNodes); });
  }
  function tableLabels(scope) {
    $$("table.stack", scope).forEach(t => {
      const heads = $$("thead th", t).map(th => th.textContent.trim());
      $$("tbody tr", t).forEach(tr => $$("td", tr).forEach((td, i) => td.setAttribute("data-label", heads[i] || "")));
    });
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200);
  }

  /* ---------------------------------------------------------------- card art */
  const artOf = name => K.art(name);
  function frameHTML(name) {
    const c = byName.get(name);
    return `<span class="frame"><b>${esc(short(name))}</b>${c && c.cost ? `<span class="fr-cost">${mana(c.cost.split(" // ")[0])}</span>` : ""}${c ? `<span class="fr-type">${esc(c.type)}</span>` : ""}</span>`;
  }
  function miniCard(name, eager) {
    const a = artOf(name);
    return a ? `<img src="${esc(a.normal)}" alt="${esc(name)}"${eager ? "" : ' loading="lazy"'} decoding="async">` : frameHTML(name);
  }
  function paintArt(scope = document) {
    $$("[data-art]", scope).forEach(el => {
      if (el.querySelector("img")) return;
      if (artOf(el.dataset.art)) el.innerHTML = miniCard(el.dataset.art);
      else if (!el.firstElementChild) el.innerHTML = frameHTML(el.dataset.art);
    });
    $$("[data-thumb]", scope).forEach(el => {
      const a = artOf(el.dataset.thumb);
      if (a && a.crop && !el.classList.contains("has-art")) { el.style.backgroundImage = `url("${a.crop}")`; el.classList.add("has-art"); }
    });
  }
  document.addEventListener("load", e => { if (e.target.tagName === "IMG" && e.target.closest(".mini-card")) e.target.classList.add("ok"); }, true);
  document.addEventListener("error", e => {
    const img = e.target;
    if (img.tagName !== "IMG") return;
    const box = img.closest(".mini-card");
    if (box && box.dataset.art) box.innerHTML = frameHTML(box.dataset.art);
  }, true);
  K.onArt(() => paintArt());

  /* ---------------------------------------------------------------- shell: tabs and segments */
  const ICON = {
    guide: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>',
    cards: '<rect x="4" y="6" width="11" height="15" rx="2"/><path d="M9 3h8.5A2.5 2.5 0 0 1 20 5.5V17"/>',
    play: '<path d="M8.5 5.8v12.4a.8.8 0 0 0 1.2.7l9.8-6.2a.8.8 0 0 0 0-1.4L9.7 5.1a.8.8 0 0 0-1.2.7z"/>',
    stats: '<path d="M5 20v-8M10 20V5M15 20v-6M20 20V9"/>',
    shop: '<path d="M5 8h14l-1.3 11.1A2 2 0 0 1 15.7 21H8.3a2 2 0 0 1-2-1.9z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    quiz: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.3a2.6 2.6 0 0 1 5 .9c0 1.8-2.5 2.2-2.5 3.8M12 17.2h.01"/>',
    train: '<path d="M4 18l5-5 4 4 7-8"/><path d="M15 9h5v5"/>'
  };
  const VIEWS = [["guide", "Guide"], ["cards", "Cards"], ["play", "Play"], ["quiz", "Quiz"], ["train", "Train"], ["stats", "Stats"], ["shop", "Shop"]].filter(([id]) => document.getElementById("view-" + id));
  const VIEW_IDS = VIEWS.map(v => v[0]);
  const viewIndex = id => VIEW_IDS.indexOf(id);
  const SEGS = {};
  $$(".view").forEach(v => {
    SEGS[v.dataset.view] = (v.dataset.segs || "").split(",").filter(Boolean).map(x => { const i = x.indexOf(":"); return { id: x.slice(0, i), label: x.slice(i + 1) }; });
  });
  $$("[data-nav]").forEach(nav => {
    nav.innerHTML = VIEWS.map(([id, label]) =>
      `<a class="tab${id === "play" ? " tab-play" : ""}" href="#${id}" data-tab="${id}"><span class="tab-ic"><svg viewBox="0 0 24 24" fill="${id === "play" ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[id]}</svg></span><span class="tab-lb">${label}</span></a>`).join("");
  });
  const cur = { view: null, seg: Object.assign({}, store.json(KEY + ".seg.v1", {})) };
  const scrollMem = {};
  const topbar = $("#topbar"), segTrack = $("#segTrack");

  function setHeader(up) { document.body.classList.toggle("hdr-up", !!up && mqMobile.matches); }
  function buildSegbar(view, seg) {
    const segs = SEGS[view] || [];
    document.body.classList.toggle("no-seg", segs.length < 2);
    if (segTrack.dataset.view !== view) {
      segTrack.dataset.view = view;
      segTrack.innerHTML = segs.map(s => `<a class="seg-link" role="tab" href="#${view}/${s.id}" data-seg="${s.id}">${esc(s.label)}</a>`).join("") + `<span class="seg-ind" aria-hidden="true"></span>`;
    }
    $$(".seg-link", segTrack).forEach(a => a.setAttribute("aria-selected", String(a.dataset.seg === seg)));
    moveSegInd(true);
  }
  function moveSegInd(jump) {
    const a = $(".seg-link[aria-selected=true]", segTrack), ind = $(".seg-ind", segTrack);
    if (!a || !ind) return;
    if (jump === true && !ind.style.getPropertyValue("--w")) ind.classList.add("no-anim");
    ind.style.setProperty("--x", a.offsetLeft + "px");
    ind.style.setProperty("--w", a.offsetWidth + "px");
    requestAnimationFrame(() => ind.classList.remove("no-anim"));
    if (segTrack.scrollWidth > segTrack.clientWidth + 2) segTrack.scrollTo({ left: a.offsetLeft - (segTrack.clientWidth - a.offsetWidth) / 2, behavior: calm() ? "auto" : "smooth" });
  }
  window.addEventListener("resize", () => moveSegInd());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => moveSegInd());

  function showView(view, seg, how = {}) {
    const segs = SEGS[view] || [];
    if (!segs.some(s => s.id === seg)) seg = segs.some(s => s.id === cur.seg[view]) ? cur.seg[view] : (segs[0] ? segs[0].id : "");
    const prevView = cur.view, prevSeg = prevView ? (cur.seg[prevView] || "") : null;
    if (prevView === view && prevSeg === seg) {
      if (how.top) window.scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" });
      return false;
    }
    if (prevView) scrollMem[prevView + "/" + prevSeg] = window.scrollY;
    cur.view = view;
    if (seg) cur.seg[view] = seg;
    store.put(KEY + ".seg.v1", cur.seg);
    store.set(KEY + ".tab", view);
    const vEl = $("#view-" + view);
    $$(".view").forEach(v => v.classList.toggle("active", v === vEl));
    $$(".segment", vEl).forEach(s => s.classList.toggle("on", s.dataset.segment === seg));
    if (!calm() && prevView) {
      const target = seg ? $(`.segment[data-segment="${seg}"]`, vEl) : vEl;
      const idx = s => segs.findIndex(x => x.id === s);
      const fwd = prevView !== view ? viewIndex(view) > viewIndex(prevView) : idx(seg) > idx(prevSeg);
      target.classList.remove("enter-fwd", "enter-back");
      void target.offsetWidth;
      target.classList.add(fwd ? "enter-fwd" : "enter-back");
      target.addEventListener("animationend", () => target.classList.remove("enter-fwd", "enter-back"), { once: true });
    }
    $$("[data-tab]").forEach(t => { if (t.dataset.tab === view) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current"); });
    document.body.dataset.view = view;
    buildSegbar(view, seg);
    setHeader(false);
    if (!how.keepScroll) window.scrollTo(0, how.top ? 0 : (scrollMem[view + "/" + seg] || 0));
    onShow(view, seg);
    return true;
  }

  // Header: on phones the top row tucks away while you scroll down; the segment bar stays.
  let lastY = window.scrollY, ticking = false, headerLock = 0;
  function onScroll() {
    ticking = false;
    const y = window.scrollY, dy = y - lastY;
    if (Date.now() > headerLock && !document.body.classList.contains("sheet-open")) {
      if (y < 60) setHeader(false);
      else if (dy > 6) setHeader(true);
      else if (dy < -10) setHeader(false);
    }
    lastY = y;
    flowFill();
  }
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  function jumpTo(el, smooth = true) {
    const y = el.getBoundingClientRect().top + window.scrollY;
    const down = y > window.scrollY + 4;
    const tb = el.closest("[data-segment=browse]") ? ($("#toolbar") || {}).offsetHeight || 0 : 0;
    let offset;
    if (mqMobile.matches && down && y > 200) { setHeader(true); offset = ($("#segbar").offsetHeight || 0) + tb + 14; }
    else { setHeader(false); offset = topbar.offsetHeight + tb + 14; }
    headerLock = Date.now() + 900;
    window.scrollTo({ top: Math.max(0, y - offset), behavior: smooth && !calm() ? "smooth" : "auto" });
    if (el.tagName === "DETAILS") el.open = true;
    const d = el.querySelector && el.querySelector(":scope > details.ticket");
    if (d) d.open = true;
  }

  /* ---------------------------------------------------------------- router */
  const LEGACY = { deck: ["guide", "start"], ...(document.getElementById("view-quiz") ? {} : { quiz: ["train", "quiz"] }), combos: ["guide", "combos"], buy: ["shop", "upgrades"], upgrades: ["shop", "upgrades"] };
  const chapterById = id => GUIDE.find(ch => ch.id === id);
  let tabTap = false;
  function lastView() { const t = store.get(KEY + ".tab"); return VIEW_IDS.includes(t) && t !== "play" ? t : "guide"; }
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("card-")) {
      const c = bySlug.get(h.slice(5));
      if (!cur.view) showView(lastView());
      if (c) { openSheet(c); return; }
    }
    closeSheet(true);
    if (h.startsWith("ch-")) {
      const ch = chapterById(h.slice(3));
      if (ch) { if (!cur.view) showView("guide", "chapters"); openReader(ch); return; }
    }
    closeReader(true);
    const [v, s] = h.split("/");
    if (VIEW_IDS.includes(v)) {
      const fromTab = tabTap; tabTap = false;
      showView(v, s, { top: !fromTab });
      return;
    }
    if (LEGACY[v]) { showView(LEGACY[v][0], LEGACY[v][1], { top: true }); return; }
    let target = h && document.getElementById(h);
    if (h && !target) { renderEverything(); target = document.getElementById(h); }
    if (target && target.closest("[data-view]")) {
      const vw = target.closest("[data-view]"), sg = target.closest("[data-segment]");
      const moved = showView(vw.dataset.view, sg ? sg.dataset.segment : "", { keepScroll: true });
      requestAnimationFrame(() => requestAnimationFrame(() => jumpTo(target, !moved && !!window.scrollY)));
      return;
    }
    if (!cur.view) showView(lastView());
  }
  window.addEventListener("hashchange", route);

  document.addEventListener("click", e => {
    const t = e.target.closest("[data-tab]");
    if (t) {
      if (t.dataset.tab === cur.view && !/^#(card|ch)-/.test(location.hash)) {
        e.preventDefault();
        const segs = SEGS[cur.view] || [];
        if (window.scrollY > 4 || !segs.length || cur.seg[cur.view] === segs[0].id) { setHeader(false); window.scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" }); }
        else location.hash = cur.view + "/" + segs[0].id; // a second tap at the top goes to the first segment
      } else tabTap = true;
      return;
    }
    const a = e.target.closest("a[href^='#']");
    if (a && a.getAttribute("href") === location.hash && !a.closest("#reader")) {
      // Same link again: scroll back to the start of it.
      e.preventDefault();
      if (a.matches(".seg-link")) window.scrollTo({ top: 0, behavior: calm() ? "auto" : "smooth" });
      else route();
      return;
    }
    if (a && a.getAttribute("href").startsWith("#ch-") && !a.closest("#reader")) readerFromApp = true;
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

  /* ---------------------------------------------------------------- the card sheet */
  const sheet = $("#sheet"), scrim = $("#scrim"), sheetBody = $("#sheetBody");
  let sheetList = CARDS, lastFocus = null, sheetCard = null, sheetFromApp = false, sheetTab = "play";
  const MENTIONS = new Map(); // card -> chapters that talk about it
  GUIDE.forEach(ch => {
    const names = new Set();
    for (const m of JSON.stringify(ch.blocks).matchAll(/<i-c>([^<]+)<\/i-c>/g)) names.add(m[1]);
    ch.blocks.forEach(b => { if (b.t === "cards") b.names.forEach(n => names.add(n)); });
    names.forEach(n => { if (!MENTIONS.has(n)) MENTIONS.set(n, []); MENTIONS.get(n).push(ch); });
    ch.cardCount = names.size;
  });
  const GLOSS_BY_CARD = new Map();
  GLOSSARY.forEach(g => (g.cards || []).forEach(n => { if (!GLOSS_BY_CARD.has(n)) GLOSS_BY_CARD.set(n, []); GLOSS_BY_CARD.get(n).push(g); }));
  function neighbours(c) {
    const list = sheetList.includes(c) ? sheetList : CARDS;
    const idx = list.indexOf(c);
    return { list, idx, prev: list[(idx - 1 + list.length) % list.length], next: list[(idx + 1) % list.length] };
  }
  function openSheet(c, dir) {
    const wasOpen = sheet.classList.contains("open");
    if (!wasOpen) lastFocus = document.activeElement;
    sheetCard = c;
    const w = WIKI[c.name] || {};
    const { list, idx, prev, next } = neighbours(c);
    $("#sheetEyebrow").textContent = c.roles.map(r => ROLE_LABEL[r]).join(" · ");
    $("#sheetPos").textContent = `${idx + 1} / ${list.length}`;
    const oracle = c.faces
      ? c.faces.map(f => `<div class="face-name">${esc(f.name)} <span class="fc">${mana(f.cost)}</span></div>${K.rules(f.text)}`).join("")
      : K.rules(c.text || "");
    const tags = [
      c.new ? `<span class="tag new">NEW · upgrade</span>` : "",
      c.b4 ? `<span class="tag new">${esc(D.extraTag || "Upgrade")} · stage ${c.b4}</span>` : "",
      c.gc ? `<span class="tag when">Game Changer</span>` : "",
      c.miku ? `<span class="tag miku">Miku print: ${esc(c.miku)}</span>` : (c.sld ? `<span class="tag miku">Miku art</span>` : ""),
      c.qty > 1 ? `<span class="tag">× ${c.qty}</span>` : "",
      `<span class="tag">MV ${c.mv}</span>`,
      w.when ? `<span class="tag when">${esc(w.when)}</span>` : ""
    ].join("");
    const cm = "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(short(c.name));
    const a = artOf(c.name);
    const sf = (a && a.uri) || ("https://scryfall.com/search?q=" + encodeURIComponent('!"' + c.name + '"'));
    const edh = "https://edhrec.com/cards/" + slug(short(c.name));
    const nm = n => esc(short(n).split(",")[0]);
    const rulings = w.rulings || [];
    const combos = (w.combos || []).filter(n => byName.has(n));
    const chapters = MENTIONS.get(c.name) || [];
    const gloss = GLOSS_BY_CARD.get(c.name) || [];
    const tips = w.tips || [];
    if (!["play", "rules", "links"].includes(sheetTab) || (sheetTab === "rules" && !rulings.length)) sheetTab = "play";
    sheetBody.innerHTML = `
      <div class="detail${a ? "" : " no-art"}${dir ? " swipe-" + dir : ""}">
        <div class="d-top">
          <div class="d-art"><div class="foil" data-tilt><div class="mini-card" data-art="${esc(c.name)}">${miniCard(c.name, true)}</div>${c.sld ? '<span class="shine" aria-hidden="true"></span>' : ""}</div></div>
          <div class="d-head">
            <h2 id="sheetTitle">${esc(c.name)}</h2>
            <div class="typeline">${c.cost ? `<span class="tl-cost">${mana(c.cost)}</span>` : ""}<span>${esc(c.type)}</span>${c.pt ? `<span class="tl-pt mono">${esc(c.pt)}</span>` : ""}</div>
            ${w.rating ? `<div class="d-rating">${vu(w.rating)}<span>${["", "Filler", "Fine", "Solid", "Strong", "Essential"][w.rating]} in this deck</span></div>` : ""}
            <div class="tags">${tags}</div>
          </div>
        </div>
        <div class="oracle">${oracle}</div>
        ${c.b4 ? `<div class="swapbox"><span>Stage ${c.b4}: replaces <b>${esc(c.cut)}</b></span><a href="${cm}" target="_blank" rel="noopener">${c.eur != null ? "~" + c.eur.toFixed(2) + "€" : "Price"} on Cardmarket</a></div>` : ""}
        ${c.new ? `<div class="swapbox"><span>Replaces <b>${esc(c.cut)}</b> from the stock deck</span><a href="${cm}" target="_blank" rel="noopener">~${c.eur.toFixed(2)}€ on Cardmarket</a></div>` : ""}
        <div class="d-tabs" role="tablist" aria-label="About this card">
          <button type="button" role="tab" data-dt="play" aria-selected="${sheetTab === "play"}">How to play</button>
          <button type="button" role="tab" data-dt="rules" aria-selected="${sheetTab === "rules"}"${rulings.length ? "" : " disabled"}>Rulings <span class="n">${rulings.length}</span></button>
          <button type="button" role="tab" data-dt="links" aria-selected="${sheetTab === "links"}">Connections</button>
        </div>
        <div class="d-panel" data-dp="play"${sheetTab === "play" ? "" : " hidden"}>
          <div class="note"><h4>Why it's here</h4><p>${rich(c.why)}</p></div>
          ${c.how ? `<div class="note"><h4>How to play it</h4><p>${rich(c.how)}</p></div>` : ""}
          ${tips.length ? `<div class="note tip"><h4>Tips</h4><ul>${tips.map(t => `<li>${rich(t)}</li>`).join("")}</ul></div>` : ""}
          ${c.warn ? `<div class="note warn"><h4>Watch out</h4><p>${rich(c.warn)}</p></div>` : ""}
        </div>
        <div class="d-panel" data-dp="rules"${sheetTab === "rules" ? "" : " hidden"}>
          ${rulings.map((r, i) => `<details class="ruling"${i === 0 ? " open" : ""}><summary>${rich(r.q)}</summary><div><p>${rich(r.a)}</p></div></details>`).join("")}
        </div>
        <div class="d-panel" data-dp="links"${sheetTab === "links" ? "" : " hidden"}>
          ${c.syn && c.syn.length ? `<div class="note"><h4>Works with</h4><div class="syn">${c.syn.map(cardChip).join("")}</div></div>` : ""}
          ${combos.length ? `<div class="note"><h4>Combos and big turns</h4><div class="syn">${combos.map(cardChip).join("")}</div></div>` : ""}
          ${chapters.length ? `<div class="note"><h4>In the guide</h4><div class="d-chapters">${chapters.map(ch => `<a href="#ch-${ch.id}" class="d-ch"><span class="mono">${pad(GUIDE.indexOf(ch) + 1)}</span>${esc(ch.title)}</a>`).join("")}</div></div>` : ""}
          ${gloss.length ? `<div class="note"><h4>Keywords</h4><div class="syn">${gloss.map(g => `<a class="chip" href="#gl-${slug(g.term)}">${esc(g.term)}</a>`).join("")}</div></div>` : ""}
          ${w.tags && w.tags.length ? `<div class="d-kw">${w.tags.map(t => `<span>#${esc(t.replace(/\s+/g, ""))}</span>`).join("")}</div>` : ""}
        </div>
        <div class="ext"><a href="${sf}" target="_blank" rel="noopener">Scryfall ↗</a><a href="${cm}" target="_blank" rel="noopener">Cardmarket ↗</a><a href="${edh}" target="_blank" rel="noopener">EDHREC ↗</a></div>
        <div class="sheet-nav"><button class="btn" type="button" data-card="${esc(prev.name)}" data-dir="prev" aria-label="Previous card: ${esc(prev.name)}"><span>← ${nm(prev.name)}</span></button><button class="btn" type="button" data-card="${esc(next.name)}" data-dir="next" aria-label="Next card: ${esc(next.name)}"><span>${nm(next.name)} →</span></button></div>
        <p class="swipe-hint">Swipe sideways for the next card</p>
      </div>`;
    linkMentions(sheetBody);
    sheetBody.scrollTop = 0;
    bindTilt(sheetBody);
    if (!a) K.ensure([c.name]);
    sheet.style.removeProperty("--drag");
    sheet.classList.add("open"); scrim.classList.add("open"); sheet.setAttribute("aria-hidden", "false");
    document.body.classList.add("sheet-open");
    if (!wasOpen) $("#sheetClose").focus({ preventScroll: true });
  }
  sheetBody.addEventListener("click", e => {
    const t = e.target.closest("[data-dt]");
    if (!t || t.disabled) return;
    sheetTab = t.dataset.dt;
    $$("[data-dt]", sheetBody).forEach(b => b.setAttribute("aria-selected", String(b === t)));
    $$("[data-dp]", sheetBody).forEach(p => { p.hidden = p.dataset.dp !== sheetTab; });
  });
  function closeSheet(fromRoute) {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open", "dragging"); scrim.classList.remove("open"); sheet.setAttribute("aria-hidden", "true");
    scrim.style.opacity = "";
    document.body.classList.remove("sheet-open");
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    if (!fromRoute) {
      if (sheetFromApp) { sheetFromApp = false; history.back(); }
      else { history.replaceState(null, "", readerCh ? "#ch-" + readerCh.id : "#" + (cur.view || "guide") + (cur.seg[cur.view] ? "/" + cur.seg[cur.view] : "")); }
    } else sheetFromApp = false;
  }
  function stepSheet(dir) {
    if (!sheetCard) return;
    const { prev, next } = neighbours(sheetCard);
    const c = dir === "next" ? next : prev;
    history.replaceState(null, "", "#card-" + slug(c.name));
    openSheet(c, dir);
  }
  $("#sheetClose").addEventListener("click", () => closeSheet(false));
  scrim.addEventListener("click", () => closeSheet(false));
  document.addEventListener("keydown", e => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (sheet.classList.contains("open")) {
      if (e.key === "Escape") closeSheet(false);
      else if (e.key === "ArrowRight" && !typing) stepSheet("next");
      else if (e.key === "ArrowLeft" && !typing) stepSheet("prev");
      else if (e.key === "Tab") trapFocus(e, sheet);
      return;
    }
    if (reader.classList.contains("open")) {
      if (e.key === "Escape") closeReader(false);
      else if (e.key === "Tab") trapFocus(e, reader);
      return;
    }
    if (e.key === "/" && !typing && !root.classList.contains("mg-open")) { e.preventDefault(); openSearch(); }
  });
  function trapFocus(e, box) {
    const f = $$("button:not([disabled]), a[href], input, select, summary", box).filter(x => x.offsetParent !== null);
    if (!f.length) return;
    const firstEl = f[0], lastEl = f[f.length - 1];
    if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
    else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
  }
  // Gestures: drag the sheet down to close it, swipe sideways for the next card.
  (function sheetGestures() {
    let g = null;
    const start = (e, fromBar) => {
      if (!mqMobile.matches || e.touches.length > 1) return;
      const t = e.touches[0];
      g = { x0: t.clientX, y0: t.clientY, t0: Date.now(), top: sheetBody.scrollTop <= 0, axis: fromBar ? "y" : null, dx: 0, dy: 0 };
    };
    const move = e => {
      if (!g) return;
      const t = e.touches[0];
      g.dx = t.clientX - g.x0; g.dy = t.clientY - g.y0;
      if (!g.axis) {
        if (Math.abs(g.dx) < 9 && Math.abs(g.dy) < 9) return;
        g.axis = Math.abs(g.dx) > Math.abs(g.dy) * 1.2 ? "x" : "y";
        if (g.axis === "y" && (!g.top || g.dy < 0)) { g = null; return; }
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
        else if (det) { det.style.transition = "transform .3s var(--ease), opacity .3s"; det.style.transform = ""; det.style.opacity = ""; }
      }
      g = null;
    };
    const bar = $(".sheet-bar");
    bar.addEventListener("touchstart", e => start(e, true), { passive: true });
    sheetBody.addEventListener("touchstart", e => { if (!e.target.closest(".syn, .ext, .d-tabs, .d-chapters, .d-kw")) start(e, false); }, { passive: true });
    [bar, sheetBody].forEach(el => { el.addEventListener("touchmove", move, { passive: false }); el.addEventListener("touchend", end); el.addEventListener("touchcancel", end); });
  })();

  /* ---------------------------------------------------------------- foil tilt and hover preview */
  function tiltTo(el, px, py) {
    el.style.setProperty("--ry", ((px - .5) * 16).toFixed(2) + "deg");
    el.style.setProperty("--rx", ((.5 - py) * 16).toFixed(2) + "deg");
    el.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (py * 100).toFixed(1) + "%");
  }
  function bindTilt(scope) {
    if (calm()) return;
    $$("[data-tilt]", scope).forEach(el => {
      if (el._tilt) return; el._tilt = true;
      el.addEventListener("pointermove", e => {
        if (e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        el.classList.add("tracking");
        tiltTo(el, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
      });
      el.addEventListener("pointerleave", () => { el.classList.remove("tracking"); ["--rx", "--ry", "--mx", "--my"].forEach(p => el.style.removeProperty(p)); });
    });
  }
  if (!calm() && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission !== "function" && !mqHover.matches) {
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
  const peek = $("#peek");
  let peekFor = null;
  function hidePeek() { peek.classList.remove("show"); peekFor = null; }
  document.addEventListener("pointerover", e => {
    if (!mqHover.matches) return;
    const b = e.target.closest(".inline-card, .set-row, .chip[data-card], .note-key, .c-row");
    if (!b || b.closest("#sheet") || b === peekFor) return;
    const name = b.dataset.card;
    if (!name || !artOf(name)) return;
    peekFor = b;
    peek.innerHTML = `<div class="mini-card">${miniCard(name, true)}</div>`;
    const r = b.getBoundingClientRect();
    const left = Math.min(window.innerWidth - 236, Math.max(16, r.left));
    peek.style.left = left + "px";
    peek.style.top = (r.top > 330 ? r.top - 316 : r.bottom + 10) + "px";
    peek.classList.add("show");
  });
  document.addEventListener("pointerout", e => { if (peekFor && !peekFor.contains(e.relatedTarget)) hidePeek(); });
  /* Press and hold (touch) or right-click any card for a full-screen preview with its text; phones
     no longer offer to save the card image. The game table binds its own. */
  K.bindPreview(document.body, el => {
    if (el.closest(".mg")) return null;
    const b = el.closest("[data-card], [data-art], [data-thumb]");
    if (!b) return null;
    const name = b.dataset.card || b.dataset.art || b.dataset.thumb;
    const c = byName.get(name);
    if (!c) return name && artOf(name) ? { name } : null;
    hidePeek();
    const txt = c.text || (c.faces || []).map(f => f.name + "\n" + f.text).join("\n");
    return { name: c.name, cost: c.cost || "", type: c.type, text: txt, pt: c.pt || "", note: c.miku ? "Miku print: " + c.miku : "" };
  }, { hover: false });
  window.addEventListener("scroll", () => { if (peekFor) hidePeek(); }, { passive: true });

  /* ---------------------------------------------------------------- Cards: browse */
  const HAY = new Map(ALL.map(c => {
    const w = WIKI[c.name] || {};
    const txt = [c.name, c.type, c.text, c.miku, c.why, c.how, c.warn, (c.faces || []).map(f => f.name + " " + f.text).join(" "), (w.tags || []).join(" "), (w.tips || []).join(" "), (w.rulings || []).map(r => r.q + " " + r.a).join(" "), w.when].join(" ");
    return [c.name, txt.replace(/<[^>]+>/g, "").toLowerCase()];
  }));
  const cs = { q: "", role: "all", sort: store.get(KEY + ".cards.sort") || "role", view: store.get(KEY + ".cards.view") || "grid" };
  if (!["role", "type", "rating", "mv", "az"].includes(cs.sort)) cs.sort = "role";
  const roleCount = r => r === "extra" ? EXTRA.length : CARDS.filter(c => r === "new" ? c.new : r === "miku" ? c.sld : c.roles.includes(r)).length;
  const chipDefs = [["all", "All", CARDS.length], ["new", "Upgrades", roleCount("new")], ["extra", D.extraChip || "Upgrade", roleCount("extra")], ["miku", "Miku art", roleCount("miku")]].filter(([k, , n]) => k === "all" || n)
    .concat(ROLES.filter(r => r[0] !== "cmd").map(([k, l]) => [k, l, roleCount(k)]).filter(([, , n]) => n));
  $("#roleChips").innerHTML = chipDefs.map(([k, l, n]) => `<button class="chip" type="button" data-role="${k}" aria-pressed="${k === "all"}">${l} <span class="n">${n}</span></button>`).join("");
  $("#roleChips").addEventListener("click", e => {
    const b = e.target.closest("[data-role]"); if (!b) return;
    cs.role = b.dataset.role;
    $$("#roleChips .chip").forEach(x => x.setAttribute("aria-pressed", String(x === b)));
    b.scrollIntoView({ inline: "nearest", block: "nearest", behavior: calm() ? "auto" : "smooth" });
    renderList(true);
  });
  const qIn = $("#q"), qClear = $("#qClear");
  qIn.addEventListener("input", () => { cs.q = qIn.value.trim().toLowerCase(); qClear.hidden = !qIn.value; renderList(); });
  qIn.addEventListener("keydown", e => { if (e.key === "Enter") qIn.blur(); });
  qClear.addEventListener("click", () => { qIn.value = ""; cs.q = ""; qClear.hidden = true; renderList(); qIn.focus(); });
  const sortSel = $("#sort");
  sortSel.value = cs.sort;
  sortSel.addEventListener("change", () => { cs.sort = sortSel.value; store.set(KEY + ".cards.sort", cs.sort); renderList(true); });
  const vt = $("#viewToggle");
  function syncToggle() {
    vt.setAttribute("aria-pressed", String(cs.view === "list"));
    vt.setAttribute("aria-label", cs.view === "grid" ? "Show as a list" : "Show card images");
  }
  vt.addEventListener("click", () => { cs.view = cs.view === "grid" ? "list" : "grid"; store.set(KEY + ".cards.view", cs.view); syncToggle(); renderList(true); });
  syncToggle();
  function openSearch() {
    if (location.hash !== "#cards/browse") { tabTap = true; location.hash = "cards/browse"; }
    requestAnimationFrame(() => { qIn.focus({ preventScroll: true }); qIn.select(); });
  }
  $("#searchBtn").addEventListener("click", openSearch);
  function hl(name) {
    const q = cs.q;
    const i = q ? name.toLowerCase().indexOf(q) : -1;
    if (i < 0) return esc(name);
    return esc(name.slice(0, i)) + "<mark>" + esc(name.slice(i, i + q.length)) + "</mark>" + esc(name.slice(i + q.length));
  }
  function rowHTML(c) {
    const a = artOf(c.name);
    return `<button class="c-row" type="button" data-card="${esc(c.name)}">
      <span class="thumb${a && a.crop ? " has-art" : ""}" data-thumb="${esc(c.name)}"${a && a.crop ? ` style="background-image:url('${esc(a.crop)}')"` : ""}><span>${esc(initials(c.name))}</span></span>
      <span class="c-body"><span class="c-title">${hl(c.name)}${c.qty > 1 ? ` <span class="muted mono">×${c.qty}</span>` : ""}</span>
        <span class="c-sub">${esc(c.type)}</span>
        <span class="c-tags">${c.new ? '<span class="tag new">NEW</span>' : ""}${c.b4 ? `<span class="tag new">Stage ${c.b4}</span>` : ""}${c.roles.slice(0, 2).map(r => `<span class="tag">${ROLE_LABEL[r]}</span>`).join("")}</span></span>
      <span class="c-side"><span class="c-cost">${mana(c.cost.split(" // ")[0])}</span>${ratingOf(c) ? vu(ratingOf(c)) : ""}</span></button>`;
  }
  function tileHTML(c) {
    return `<button class="c-tile" type="button" data-card="${esc(c.name)}" aria-label="${esc(c.name)}">
      <span class="mini-card" data-art="${esc(c.name)}">${miniCard(c.name)}</span>
      ${c.new ? '<span class="badge">NEW</span>' : ""}${c.b4 ? `<span class="badge">S${c.b4}</span>` : ""}${c.qty > 1 ? `<span class="qty">×${c.qty}</span>` : ""}</button>`;
  }
  function renderList(resetScroll) {
    const q = cs.q;
    const list = (cs.role === "extra" ? EXTRA : CARDS).filter(c => {
      if (cs.role === "new" && !c.new) return false;
      if (cs.role === "miku" && !c.sld) return false;
      if (!["all", "new", "miku", "extra"].includes(cs.role) && !c.roles.includes(cs.role)) return false;
      return !q || HAY.get(c.name).includes(q);
    });
    let groups = [];
    if (cs.sort === "role") {
      for (const [k, l] of ROLES) { const g = list.filter(c => c.roles[0] === k); if (g.length) groups.push([l, g]); }
    } else if (cs.sort === "type") {
      for (const t of TYPE_ORDER) { const g = list.filter(c => c.cat === t); if (g.length) groups.push([TYPE_PLURAL[t], g]); }
    } else if (cs.sort === "rating") {
      groups = [["", list.slice().sort((a, b) => ratingOf(b) - ratingOf(a) || a.name.localeCompare(b.name))]];
    } else if (cs.sort === "mv") {
      groups = [["", list.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name))]];
    } else {
      groups = [["", list.slice().sort((a, b) => a.name.localeCompare(b.name))]];
    }
    if (q) groups = groups.map(([l, g]) => [l, g.slice().sort((a, b) => (b.name.toLowerCase().includes(q)) - (a.name.toLowerCase().includes(q)))]);
    sheetList = groups.flatMap(g => g[1]);
    $("#count").innerHTML = `<b>${list.length}</b> of ${cs.role === "extra" ? EXTRA.length : CARDS.length} cards${q ? ` matching “${esc(qIn.value.trim())}”` : ""}`;
    const cl = $("#cardList");
    const grid = cs.view === "grid";
    const grouped = groups.length > 1 || (groups[0] && groups[0][0]);
    cl.className = "card-list " + (grid ? "is-grid" : "is-list");
    if (!list.length) {
      cl.innerHTML = `<div class="empty"><span>No cards match “${esc(qIn.value)}”.</span><button class="btn" type="button" id="resetFilters">Clear search and filters</button></div>`;
    } else if (grouped) {
      cl.innerHTML = groups.map(([l, g]) => `<section class="shelf"><h3 class="shelf-h"><span>${esc(l)}</span><span class="n mono">${g.length}</span></h3><div class="${grid ? "shelf-row" : "rows"}">${g.map(grid ? tileHTML : rowHTML).join("")}</div></section>`).join("");
    } else {
      cl.innerHTML = `<div class="${grid ? "tile-grid" : "rows"}">${groups[0][1].map(grid ? tileHTML : rowHTML).join("")}</div>`;
    }
    if (resetScroll && cur.view === "cards") {
      const y = cl.getBoundingClientRect().top + window.scrollY - ($("#toolbar").offsetHeight + topbar.offsetHeight) - 20;
      if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
    }
  }
  document.addEventListener("click", e => {
    if (!e.target.closest("#resetFilters")) return;
    qIn.value = ""; cs.q = ""; cs.role = "all"; qClear.hidden = true;
    $$("#roleChips .chip").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.role === "all")));
    renderList(true);
  });

  /* ---------------------------------------------------------------- Cards: setlist, cuts, glossary, FAQ */
  function renderSetlist() {
    const groups = [["Commander", [COMMANDER]]].concat(TYPE_ORDER.map(t => [TYPE_PLURAL[t], CARDS.filter(c => c.cat === t && c !== COMMANDER)]));
    $("#setlist").innerHTML = groups.filter(g => g[1].length).map(([l, g]) => {
      const n = sum(g, c => c.qty);
      return `<details class="set-group" open><summary><span>${l}</span><span class="n mono">${n}</span></summary>${g.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name)).map(c =>
        `<button class="set-row" type="button" data-card="${esc(c.name)}"><span class="q mono">${c.qty}</span><span class="nm">${esc(c.name)}</span>${c.new ? '<span class="new-dot">NEW</span>' : ""}<span class="sc">${mana(c.cost.split(" // ")[0])}</span></button>`).join("")}</details>`;
    }).join("");
  }
  function renderCuts() {
    if (!$("#cutList")) return;
    $("#cutList").innerHTML = CUTS.map((x, i) => {
      const inCard = CARDS.find(c => c.cut === x.name);
      return `<li class="cut-row"><span class="cut-n mono">${pad(i + 1)}</span><div><p class="cut-swap"><s>${esc(x.name)}</s><span class="arrow" aria-label="replaced by">→</span>${inCard ? cardLink(inCard.name) : ""}</p><p class="muted">${rich(x.why)}</p></div></li>`;
    }).join("");
    linkMentions($("#cutList"));
  }
  function renderGlossary() {
    const el = $("#gloss");
    el.innerHTML = GLOSSARY.map(g => `<details class="gl" id="gl-${slug(g.term)}"><summary><span class="gl-term">${esc(g.term)}</span>${g.cards && g.cards.length ? `<span class="gl-n mono">${g.cards.length} card${g.cards.length > 1 ? "s" : ""}</span>` : ""}</summary><div class="gl-body"><p>${rich(g.html)}</p>${g.cards && g.cards.length ? `<div class="syn">${g.cards.map(cardChip).join("")}</div>` : ""}</div></details>`).join("") + `<p class="empty-note muted" hidden>No term matches that.</p>`;
    linkMentions(el);
    const inp = $("#glossQ");
    inp.addEventListener("input", () => {
      const q = inp.value.trim().toLowerCase();
      let n = 0;
      $$(".gl", el).forEach(d => { const on = !q || d.textContent.toLowerCase().includes(q); d.hidden = !on; if (on) n++; });
      $(".empty-note", el).hidden = n > 0;
    });
  }
  function renderFaq() {
    const el = $("#faqList");
    el.innerHTML = FAQ.map((f, i) => `<details class="faq" id="faq-${i + 1}"${i === 0 ? " open" : ""}><summary>${rich(f.q)}</summary><div><p>${rich(f.a)}</p></div></details>`).join("");
    linkMentions(el);
  }
  document.addEventListener("click", async e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    const sorted = CARDS.slice().sort((a, c) => (c.roles.includes("cmd") - a.roles.includes("cmd")) || a.name.localeCompare(c.name));
    const text = sorted.map(c => b.dataset.copy === "qty" ? `${c.qty} ${c.name}` : (c.qty > 1 ? `${c.qty} ${c.name}` : c.name)).join("\n");
    try { await navigator.clipboard.writeText(text); toast("Decklist copied"); }
    catch (err) {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) { /* ignore */ }
      ta.remove(); toast(ok ? "Decklist copied" : "Copy blocked here. Long-press the setlist to select it.");
    }
  });

  /* ---------------------------------------------------------------- Guide: tracklist and reader */
  const READ_KEY = KEY + ".guide.read.v1";
  let readSet = new Set(store.json(READ_KEY, []).filter(id => chapterById(id)));
  const saveRead = () => store.put(READ_KEY, [...readSet]);
  const EQ_ICON = '<span class="eq-ic" aria-hidden="true"><i></i><i></i><i></i></span>';
  function renderTracklist() {
    const el = $("#tracklist"); if (!el) return;
    const nextUp = GUIDE.find(ch => !readSet.has(ch.id));
    el.innerHTML = GUIDE.map((ch, i) => {
      const read = readSet.has(ch.id), now = ch === nextUp;
      return `<li class="track${read ? " read" : ""}${now ? " now" : ""}"><a href="#ch-${ch.id}">
        <span class="tr-no" aria-hidden="true">${pad(i + 1)}</span>
        <span class="tr-body"><span class="tr-kicker">${esc(ch.kicker)}</span><b class="tr-title">${esc(ch.title)}</b><span class="tr-sum">${esc(ch.summary)}</span></span>
        <span class="tr-side"><span class="tr-time mono">${ch.minutes} min</span><span class="tr-state">${read ? '<span class="tick" aria-label="Read">✓</span>' : now ? EQ_ICON + "<span>Up next</span>" : ""}</span></span>
      </a></li>`;
    }).join("");
    const mins = sum(GUIDE, ch => ch.minutes), done = readSet.size;
    $("#guideMeta").innerHTML = `${GUIDE.length} tracks · about ${mins} minutes · <b>${done}</b> read${done ? ` <button class="linkish" type="button" id="resetRead">Start over</button>` : ""}`;
  }
  document.addEventListener("click", e => {
    if (!e.target.closest("#resetRead")) return;
    readSet = new Set(); saveRead(); renderTracklist(); renderResume(); toast("Reading progress cleared");
  });
  function renderResume() {
    const el = $("#resume"); if (!el) return;
    const done = GUIDE.filter(ch => readSet.has(ch.id)).length;
    const next = GUIDE.find(ch => !readSet.has(ch.id)) || GUIDE[0];
    const i = GUIDE.indexOf(next);
    const lead = done === 0 ? "Start here" : done === GUIDE.length ? "Read it again" : "Continue";
    el.innerHTML = `<a class="resume-card" href="#ch-${next.id}">
        <span class="rc-ring" style="--p:${(done / GUIDE.length).toFixed(3)}" aria-label="${done} of ${GUIDE.length} tracks read"><b>${done}</b><small>/${GUIDE.length}</small></span>
        <span class="rc-body"><span class="rc-lead mono">${lead} · Track ${pad(i + 1)}</span><b>${esc(next.title)}</b><span class="muted">${esc(next.summary)}</span></span>
        <span class="rc-go" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span></a>
      <a class="all-tracks" href="#guide/chapters">All ${GUIDE.length} tracks <span aria-hidden="true">→</span></a>`;
  }
  function blockHTML(b) {
    switch (b.t) {
      case "p": return `<p>${rich(b.html)}</p>`;
      case "h": return `<h2 class="r-h" id="rh-${slug(b.text)}">${rich(esc(b.text))}</h2>`;
      case "steps": return `<ol class="r-steps">${b.items.map((it, i) => `<li><span class="r-n mono">${pad(i + 1)}</span><div><b>${rich(it.title)}</b>${it.html ? `<p>${rich(it.html)}</p>` : ""}</div></li>`).join("")}</ol>`;
      case "list": return `<ul class="r-list">${b.items.map(it => `<li>${rich(it)}</li>`).join("")}</ul>`;
      case "callout": return `<aside class="r-call ${esc(b.tone || "tip")}"><p class="r-call-k mono">${{ key: "Key idea", tip: "Tip", warn: "Watch out" }[b.tone] || "Note"}</p>${b.title ? `<h4>${rich(b.title)}</h4>` : ""}<p>${rich(b.html)}</p></aside>`;
      case "cards": return `<figure class="r-cards"><div class="r-cards-row">${b.names.map(n => `<button class="r-card" type="button" data-card="${esc(n)}" aria-label="${esc(n)}"><span class="mini-card" data-art="${esc(n)}">${miniCard(n)}</span></button>`).join("")}</div>${b.caption ? `<figcaption>${rich(b.caption)}</figcaption>` : ""}</figure>`;
      case "turns": return `<ol class="turns r-turns">${b.items.map(it => `<li><span class="tn">${esc(it.turn)}</span><div><p>${rich(it.play)}</p>${it.note ? `<span class="after">${rich(it.note)}</span>` : ""}</div></li>`).join("")}</ol>`;
      case "qa": return `<div class="r-qa">${b.items.map(it => `<details class="faq"><summary>${rich(it.q)}</summary><div><p>${rich(it.a)}</p></div></details>`).join("")}</div>`;
      case "table": return `<div class="table-wrap"><table class="stack r-table"><thead><tr>${b.head.map(h => `<th>${rich(h)}</th>`).join("")}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${rich(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "math": return `<div class="r-math"><ol>${b.items.map(it => `<li><span>${rich(it.label)}</span><b>${rich(it.value)}</b></li>`).join("")}</ol>${b.total ? `<p class="r-total">${rich(b.total)}</p>` : ""}</div>`;
      case "widget": return `<div class="r-widget" data-widget="${esc(b.id)}"></div>`;
      default: return "";
    }
  }
  const reader = $("#reader"), readerBody = $("#readerBody");
  let readerCh = null, readerFromApp = false, readerFocus = null;
  /* Wide screens read a chapter between the whole tracklist (left) and this chapter's outline and cards (right). */
  function readerSideHTML(ch, i) {
    const heads = ch.blocks.filter(b => b.t === "h");
    const names = [...new Set([].concat(...ch.blocks.filter(b => b.t === "cards").map(b => b.names)))].slice(0, 8);
    const toc = `<nav class="rd-toc" aria-label="All tracks"><p class="rd-k mono">The guide</p><ol>${GUIDE.map((c, j) => `<li><a href="#ch-${c.id}" data-goto="${c.id}" class="${c === ch ? "on" : ""}${readSet.has(c.id) ? " read" : ""}"${c === ch ? ' aria-current="page"' : ""}><span class="mono">${pad(j + 1)}</span>${esc(c.title)}</a></li>`).join("")}</ol></nav>`;
    const side = `<aside class="rd-side" aria-label="In this track">${heads.length ? `<p class="rd-k mono">On this page</p><ol class="rd-out">${heads.map(b => `<li><a href="#rh-${slug(b.text)}" data-jump="rh-${slug(b.text)}">${rich(esc(b.text))}</a></li>`).join("")}</ol>` : ""}${names.length ? `<p class="rd-k mono">Cards</p><p class="rd-cards">${names.map(n => `<i-c>${esc(n)}</i-c>`).join("")}</p>` : ""}<p class="rd-k mono">Track ${pad(i + 1)} of ${GUIDE.length}</p><p class="rd-time">${ch.minutes} min read</p></aside>`;
    return [toc, side];
  }
  function chapterHTML(ch, i) {
    const next = GUIDE[i + 1], prev = GUIDE[i - 1];
    const [toc, side] = readerSideHTML(ch, i);
    return `<div class="rd-grid">${toc}<article class="chapter">
      <header class="ch-head">
        <p class="ch-kicker"><span class="mono">Track ${pad(i + 1)} / ${GUIDE.length}</span><span>${esc(ch.kicker)}</span></p>
        <h1 id="readerTitle">${esc(ch.title)}</h1>
        <p class="ch-sum">${rich(esc(ch.summary))}</p>
        <p class="ch-meta mono"><span>${ch.minutes} min read</span>${ch.cardCount ? `<span>${ch.cardCount} card${ch.cardCount === 1 ? "" : "s"} mentioned</span>` : ""}</p>
      </header>
      <div class="ch-body">${ch.blocks.map(blockHTML).join("")}</div>
      <footer class="ch-end">
        <p class="ch-endmark mono">End of track ${pad(i + 1)}</p>
        ${next ? `<a class="next-track" href="#ch-${next.id}" data-goto="${next.id}"><span class="nt-k mono">Next · Track ${pad(i + 2)}</span><b>${esc(next.title)}</b><span class="nt-s">${esc(next.summary)}</span><span class="nt-go" aria-hidden="true">▸</span></a>`
        : `<div class="fin"><b>That's the whole guide.</b><p>Now try it for real against the bots.</p><a class="btn primary" href="#play">Play a game</a></div>`}
        <div class="btn-row ch-nav">${prev ? `<a class="btn ghost" href="#ch-${prev.id}" data-goto="${prev.id}" aria-label="Previous track: ${esc(prev.title)}">← Track ${pad(GUIDE.indexOf(prev) + 1)}</a>` : ""}<button class="btn" type="button" data-close-reader>All tracks</button></div>
      </footer></article>${side}</div>`;
  }
  function openReader(ch) {
    if (readerCh === ch && reader.classList.contains("open")) return;
    const i = GUIDE.indexOf(ch);
    readerCh = ch;
    $("#readerNo").textContent = "Track " + pad(i + 1);
    $("#readerBarTitle").textContent = ch.title;
    $("#readerTime").textContent = ch.minutes + " min";
    readerBody.innerHTML = chapterHTML(ch, i);
    linkMentions(readerBody);
    tableLabels(readerBody);
    mountWidgets(readerBody);
    paintArt(readerBody);
    const names = new Set();
    ch.blocks.forEach(b => { if (b.t === "cards") b.names.forEach(n => names.add(n)); });
    if (names.size) K.ensure([...names]);
    readerBody.scrollTop = 0;
    if (!reader.classList.contains("open")) {
      readerFocus = document.activeElement;
      reader.classList.add("open");
      reader.setAttribute("aria-hidden", "false");
      document.body.classList.add("reading");
    } else if (!calm()) restart($(".chapter", readerBody), "turn");
    store.set(KEY + ".guide.last", ch.id);
    updateProgress();
    $("#readerClose").focus({ preventScroll: true });
  }
  function closeReader(fromRoute) {
    if (!reader.classList.contains("open")) { if (fromRoute) readerFromApp = false; return; }
    reader.classList.remove("open");
    reader.setAttribute("aria-hidden", "true");
    document.body.classList.remove("reading");
    readerCh = null;
    renderTracklist(); renderResume();
    if (readerFocus && readerFocus.focus && document.contains(readerFocus)) readerFocus.focus({ preventScroll: true });
    const fromApp = readerFromApp; readerFromApp = false;
    if (!fromRoute) {
      if (fromApp) history.back();
      else { history.replaceState(null, "", "#guide/chapters"); route(); }
    }
    setTimeout(() => { if (!reader.classList.contains("open")) readerBody.innerHTML = ""; }, 400);
  }
  function markRead(ch) { if (ch && !readSet.has(ch.id)) { readSet.add(ch.id); saveRead(); } }
  let progRaf = 0;
  function updateProgress() {
    progRaf = 0;
    const max = readerBody.scrollHeight - readerBody.clientHeight;
    const p = max > 8 ? Math.min(1, readerBody.scrollTop / max) : 1;
    $("#readerProgress").style.transform = `scaleX(${p.toFixed(4)})`;
    if (p > .92 && readerCh) markRead(readerCh);
    // the outline follows the heading you're reading
    const links = readerBody.querySelectorAll(".rd-out a");
    if (links.length && links[0].offsetParent) {
      const top = readerBody.getBoundingClientRect().top + 120;
      let cur = null;
      links.forEach(a => { const h = document.getElementById(a.dataset.jump); if (h && h.getBoundingClientRect().top < top) cur = a; });
      links.forEach(a => a.classList.toggle("on", a === cur));
    }
  }
  readerBody.addEventListener("scroll", () => { if (!progRaf) progRaf = requestAnimationFrame(updateProgress); }, { passive: true });
  $("#readerClose").addEventListener("click", () => closeReader(false));
  reader.addEventListener("click", e => {
    const g = e.target.closest("[data-goto]");
    if (g) {
      e.preventDefault();
      const ch = chapterById(g.dataset.goto);
      if (!ch) return;
      if (GUIDE.indexOf(ch) > GUIDE.indexOf(readerCh)) markRead(readerCh);
      history.replaceState(null, "", "#ch-" + ch.id);
      openReader(ch);
      return;
    }
    const j = e.target.closest("[data-jump]");
    if (j) {
      e.preventDefault();
      const h = document.getElementById(j.dataset.jump);
      if (h) readerBody.scrollTo({ top: h.getBoundingClientRect().top - readerBody.getBoundingClientRect().top + readerBody.scrollTop - 16, behavior: calm() ? "auto" : "smooth" });
      return;
    }
    if (e.target.closest("[data-close-reader]")) closeReader(false);
  });

  /* ---------------------------------------------------------------- steppers (shared by the widgets) */
  let stepperN = 0;
  function stepperHTML(key, label, val, min, max, step = 1) {
    const id = "stp-" + (++stepperN);
    return `<div class="field"><span class="field-l" id="${id}">${label}</span><div class="stepper"><button type="button" data-step="-${step}" aria-label="Less">−</button><input type="number" inputmode="numeric" data-k="${key}" min="${min}" max="${max}" value="${val}" aria-labelledby="${id}"><button type="button" data-step="${step}" aria-label="More">+</button></div></div>`;
  }
  (function steppers() {
    let hold = null;
    const step = b => {
      const inp = b.closest(".stepper").querySelector("input");
      inp.value = Math.max(+inp.min, Math.min(+inp.max, (parseInt(inp.value, 10) || 0) + +b.dataset.step));
      inp.dispatchEvent(new Event("input", { bubbles: true }));
    };
    const stop = () => { if (hold) { clearTimeout(hold.t); clearInterval(hold.i); hold = null; } };
    // Mouse steps on press; touch steps on release, so scrolling past a stepper never changes it.
    document.addEventListener("pointerdown", e => {
      const b = e.target.closest("[data-step]"); if (!b || e.button > 0) return;
      stop();
      const touch = e.pointerType !== "mouse";
      if (!touch) step(b);
      hold = { b, touch, held: false, t: setTimeout(() => { hold.held = true; step(b); hold.i = setInterval(() => step(b), 70); }, 420) };
    });
    window.addEventListener("pointerup", e => { if (hold && hold.touch && !hold.held && e.target.closest && e.target.closest("[data-step]") === hold.b) step(hold.b); }, true);
    ["pointerup", "pointercancel", "blur"].forEach(ev => window.addEventListener(ev, stop, true));
    document.addEventListener("pointerleave", stop, true);
    document.addEventListener("click", e => { const b = e.target.closest("[data-step]"); if (b && e.detail === 0) step(b); });
    document.addEventListener("contextmenu", e => { if (e.target.closest("[data-step]")) e.preventDefault(); });
  })();
  const numIn = (el, k) => { const i = $(`input[data-k="${k}"]`, el); return Math.max(+i.min, Math.min(+i.max, parseInt(i.value, 10) || 0)); };
  function bump(el, text) { if (el.textContent !== String(text)) { el.textContent = text; if (!calm()) restart(el, "bump"); } }

  /* ---------------------------------------------------------------- widget: the engine calculator */
  function engineCalc(el) {
    const ENG = [["trostani", "Trostani", true], ["warden", "Soul Warden", true], ["inn", "Prosperous Innkeeper", false], ["thune", "Archangel of Thune", true], ["heliod", "Heliod", false], ["crusade", "Cathars' Crusade", false], ["pride", "Ajani's Pridemate", false]];
    const on = Object.fromEntries(ENG.map(e => [e[0], e[2]]));
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Build a board, then make tokens</b></div>
      <div class="chips wrap" role="group" aria-label="Cards you control">${ENG.map(([k, l]) => `<button class="chip" type="button" data-e="${k}" aria-pressed="${on[k]}">${l}</button>`).join("")}</div>
      <div class="w-fields">${stepperHTML("n", "Creatures already on your side", 4, 0, 40)}${stepperHTML("t", "1/1 tokens entering together", 2, 1, 12)}</div>
      <div class="w-out">
        <div><b data-o="life">0</b><span>life gained</span></div>
        <div><b data-o="ctr">0</b><span>+1/+1 counters on each creature you had</span></div>
        <div><b data-o="tok">1/1</b><span>size of each new token after</span></div>
        <div><b data-o="all">0</b><span>counters placed in all</span></div>
      </div>
      <details class="w-logbox"><summary>Step by step <span class="muted" data-o="trig"></span></summary><ol class="w-log"></ol></details>
      <p class="muted small">Assumes you order the triggers the best way: Cathars' Crusade and the 1-life triggers first, Trostani's last, so every token is as big as possible when she checks its toughness. Heliod's counter goes on the next token she'll check.</p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    function run() {
      const N = numIn(el, "n"), T = numIn(el, "t");
      const tok = Array(T).fill(0);
      let old = 0, pride = 0, life = 0, trig = 0, placed = 0;
      const log = [];
      const say = s => { if (log.length < 40) log.push(s); };
      const pending = on.trostani ? tok.map((_, i) => i) : [];
      const all = () => { old++; for (let i = 0; i < T; i++) tok[i]++; placed += N + T; };
      const gain = (n, src) => {
        life += n;
        const parts = [];
        if (on.thune) { trig++; all(); parts.push("Thune puts a counter on each creature"); }
        if (on.heliod) { trig++; const i = pending.length ? pending[0] : 0; tok[i]++; placed++; parts.push(`Heliod puts one on token ${i + 1}`); }
        if (on.pride) { trig++; pride++; placed++; parts.push("Pridemate grows"); }
        say(`${src}: gain ${n}.${parts.length ? " " + parts.join(", ") + "." : ""}`);
      };
      if (on.crusade) for (let i = 0; i < T; i++) { trig++; all(); say("Cathars' Crusade: a counter on each creature."); }
      if (on.warden) for (let i = 0; i < T; i++) { trig++; gain(1, "Soul Warden"); }
      if (on.inn) for (let i = 0; i < T; i++) { trig++; gain(1, "Prosperous Innkeeper"); }
      while (pending.length) { const i = pending.shift(); trig++; const t = 1 + tok[i]; gain(t, `Trostani checks token ${i + 1} (now ${t}/${t})`); }
      const sizes = tok.map(x => 1 + x), lo = Math.min(...sizes), hi = Math.max(...sizes);
      bump(out("life"), "+" + life);
      bump(out("ctr"), "+" + old + (on.pride && pride ? ` (${old + pride} on Pridemate)` : ""));
      bump(out("tok"), lo === hi ? `${lo}/${lo}` : `${lo}/${lo}–${hi}/${hi}`);
      bump(out("all"), placed);
      out("trig").textContent = `· ${trig} trigger${trig === 1 ? "" : "s"}`;
      $(".w-log", el).innerHTML = log.length ? log.map(s => `<li>${esc(s)}</li>`).join("") + (trig > log.length ? `<li class="muted">…and ${trig - log.length} more like these</li>` : "") : `<li class="muted">Nothing on your side triggers. Turn on Trostani or Soul Warden.</li>`;
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-e]"); if (!b) return;
      on[b.dataset.e] = !on[b.dataset.e];
      b.setAttribute("aria-pressed", String(on[b.dataset.e]));
      run();
    });
    el.addEventListener("input", run);
    run();
  }

  /* ---------------------------------------------------------------- widget: opening hand trainer */
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function handTrainer(el) {
    el.innerHTML = `<div class="trainer">
        <div class="hand-verdict" aria-live="polite"></div>
        <div class="trainer-hand"></div>
        <div class="btn-row trainer-btns"><button class="btn primary" type="button" data-a="new">New hand</button><button class="btn" type="button" data-a="mull">Mulligan</button><button class="btn" type="button" data-a="draw">Draw a card</button></div>
      </div>`;
    let deck = [], hand = [], mulls = 0;
    const handEl = $(".trainer-hand", el), verdictEl = $(".hand-verdict", el);
    const slot = (c, i, cls) => `<button class="slot ${cls}" type="button" data-card="${esc(c.name)}" style="--i:${i}" aria-label="${esc(c.name)}"><span class="mini-card" data-art="${esc(c.name)}">${miniCard(c.name)}</span></button>`;
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
      verdictEl.className = "hand-verdict " + cls;
      verdictEl.innerHTML = `<span class="stamp">${cls === "keep" ? "KEEP" : "MULL"}</span><b>${head}</b><span>${why}${botTxt}</span>${hand.length > 7 ? `<span class="muted">Drew ${hand.length - 7} since the opener.</span>` : ""}`;
      if (!calm()) restart(verdictEl, "stamped");
    }
    function newHand(isMull) {
      mulls = isMull ? mulls + 1 : 0;
      deck = shuffle(LIBRARY.slice()); hand = deck.splice(0, 7);
      handEl.innerHTML = hand.map((c, i) => slot(c, i, "deal")).join("");
      handEl.classList.toggle("more", hand.length > 7);
      handEl.scrollLeft = 0;
      verdict();
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      if (b.dataset.a === "new") newHand(false);
      else if (b.dataset.a === "mull") newHand(true);
      else if (deck.length) {
        const c = deck.shift(); hand.push(c);
        handEl.insertAdjacentHTML("beforeend", slot(c, 0, "drawn"));
        handEl.classList.add("more");
        handEl.scrollTo({ left: handEl.scrollWidth, behavior: calm() ? "auto" : "smooth" });
        verdict();
      }
    });
    newHand(false);
  }

  /* ---------------------------------------------------------------- widget: draw odds */
  const choose = (n, k) => { if (k < 0 || k > n) return 0; k = Math.min(k, n - k); let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };
  const hyperNone = (N, K_, n) => choose(N - K_, n) / choose(N, n);
  const hyperAtLeast = (N, K_, k, n) => { let p = 0; for (let i = k; i <= Math.min(K_, n); i++) p += choose(K_, i) * choose(N - K_, n - i); return p / choose(N, n); };
  function drawOdds(el) {
    const N = LIBRARY.length;
    const count = f => LIBRARY.filter(f).length;
    const is = r => c => c.roles.includes(r);
    const names = list => c => list.includes(c.name);
    const LANDS = count(c => c.cat === "Land");
    const GROUPS = D.oddsGroups ? D.oddsGroups({ is, names }) : [
      { id: "cheapramp", label: "A ramp card costing 2 or less", f: c => c.cat !== "Land" && c.roles.includes("ramp") && c.mv <= 2 },
      { id: "ramp", label: "Any ramp card", f: c => c.cat !== "Land" && c.roles.includes("ramp") },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "l4", label: "At least 4 lands", lands: 4 },
      { id: "l5", label: "At least 5 lands", lands: 5 },
      { id: "tokens", label: "A token maker", f: is("tokens") },
      { id: "gain", label: "A lifegain source", f: is("gain") },
      { id: "payoff", label: "A lifegain payoff", f: is("payoff") },
      { id: "finisher", label: "A finisher", f: is("finisher") },
      { id: "removal", label: "A removal spell", f: is("removal") },
      { id: "draw", label: "A card draw engine", f: is("draw") },
      { id: "combo1", label: "Heliod and Walking Ballista", both: [["Heliod, Sun-Crowned"], ["Walking Ballista"]] },
      { id: "combo2", label: "Spike Feeder and an engine for it", both: [["Spike Feeder"], ["Heliod, Sun-Crowned", "Archangel of Thune", "Cleric Class"]] }
    ];
    const singles = CARDS.filter(c => c !== COMMANDER).slice().sort((a, b) => a.name.localeCompare(b.name));
    const saved = store.json(KEY + ".odds.v1", {});
    let what = saved.what || "cheapramp", firstPlayer = saved.first !== false, turn = saved.turn || 3;
    const find = id => GROUPS.find(g => g.id === id) || (id.startsWith("card:") && byName.has(id.slice(5)) ? { id, label: short(id.slice(5)), f: names([id.slice(5)]) } : GROUPS[0]);
    el.innerHTML = `<div class="odds">
      <div class="odds-controls">
        <label class="field"><span class="field-l">What you want to see</span><span class="select-wrap"><select data-o="what"><optgroup label="Groups">${GROUPS.map(g => `<option value="${g.id}">${esc(g.label)}</option>`).join("")}</optgroup><optgroup label="One card">${singles.map(c => `<option value="card:${esc(c.name)}">${esc(c.name)}${c.qty > 1 ? ` (×${c.qty})` : ""}</option>`).join("")}</optgroup></select></span></label>
        <div class="field"><span class="field-l">Your seat</span><div class="seg small" role="radiogroup" aria-label="Your seat"><button type="button" role="radio" data-first="1">You go first</button><button type="button" role="radio" data-first="0">Later seat</button></div></div>
      </div>
      <div class="odds-big" aria-live="polite"><b data-o="p">0%</b><span data-o="desc"></span></div>
      <div class="odds-bars" role="group" aria-label="Chance by turn"></div>
      <p class="muted small">Draws only, from a fresh seven with no mulligan. The first player skips their first draw. ${D.oddsNote || "Tutors like <i-c>Finale of Devastation</i-c> and <i-c>Nature's Lore</i-c> make the real odds better."}</p>
    </div>`;
    linkMentions(el);
    const sel = $("select", el);
    sel.value = find(what).id;
    function prob(g, n) {
      if (g.lands) return hyperAtLeast(N, LANDS, g.lands, n);
      if (g.both) { const a = count(names(g.both[0])), b = count(names(g.both[1])); return Math.max(0, 1 - hyperNone(N, a, n) - hyperNone(N, b, n) + hyperNone(N, a + b, n)); }
      return 1 - hyperNone(N, count(g.f), n);
    }
    const seen = t => 7 + t - (firstPlayer ? 1 : 0);
    function draw() {
      const g = find(what);
      store.put(KEY + ".odds.v1", { what, first: firstPlayer, turn });
      $$("[data-first]", el).forEach(b => b.setAttribute("aria-checked", String((b.dataset.first === "1") === firstPlayer)));
      const ps = Array.from({ length: 10 }, (_, i) => prob(g, seen(i + 1)));
      const K_ = g.lands ? LANDS : g.both ? null : count(g.f);
      bump($('[data-o="p"]', el), Math.round(ps[turn - 1] * 100) + "%");
      $('[data-o="desc"]', el).innerHTML = `chance of <b>${esc(g.label.charAt(0).toLowerCase() + g.label.slice(1))}</b> by your turn ${turn}, after seeing ${seen(turn)} cards${K_ != null ? ` (${K_} of the 99 count)` : ""}`;
      $(".odds-bars", el).innerHTML = ps.map((p, i) => `<button type="button" class="ob${i + 1 === turn ? " on" : ""}" data-t="${i + 1}" aria-pressed="${i + 1 === turn}" aria-label="Turn ${i + 1}: ${Math.round(p * 100)}%"><span class="ob-v mono">${Math.round(p * 100)}</span><span class="ob-bar"><i style="--h:${(p * 100).toFixed(1)}%"></i></span><span class="ob-t mono">T${i + 1}</span></button>`).join("");
    }
    sel.addEventListener("change", () => { what = sel.value; draw(); });
    el.addEventListener("click", e => {
      const f = e.target.closest("[data-first]"); if (f) { firstPlayer = f.dataset.first === "1"; draw(); return; }
      const t = e.target.closest("[data-t]"); if (t) { turn = +t.dataset.t; draw(); }
    });
    draw();
  }

  /* ---------------------------------------------------------------- widget: lethal calculator */
  const CALC_ROWS = [
    ["Just attack", 0, (N, P) => N * P, ""],
    ["Beastmaster Ascension", 3, (N, P) => N >= 7 ? N * (P + 5) : N * P, N => N >= 7 ? "" : "needs 7 attackers or earlier counters"],
    ["Triumph of the Hordes", 4, (N, P) => N * (P + 1), "poison"],
    ["Overwhelming Stampede", 5, (N, P, B) => N * (P + B), ""],
    ["Jazal Goldmane, 1 activation", 5, (N, P) => N * (P + N), "each extra activation costs 5 more"],
    ["Return of the Wildspeaker", 5, (N, P) => N * (P + 3), "non-Humans only"],
    ["Mirror Entity, X=6", 6, N => N * 6, "counters add on top"],
    ["Craterhoof Behemoth", 8, (N, P) => N * P + 5 + (N + 1) * (N + 1), "Hoof attacks too"],
    ["Finale of Devastation, X=10", 12, (N, P) => N * (P + 10), "plus a free creature"]
  ];
  function lethalCalc(el) {
    el.innerHTML = `<div class="calc">
      <div class="calc-inputs">${stepperHTML("n", "Creatures that can attack", 10, 1, 60)}${stepperHTML("p", "Their average power", 2, 0, 99)}${stepperHTML("b", "Your biggest creature's power", 5, 0, 999)}${stepperHTML("l", "Opponent life (each)", 40, 1, 200, 5)}</div>
      <div class="lethal" aria-live="polite">${CALC_ROWS.map(([name, m], i) => {
        const card = name.split(",")[0];
        return `<div class="lethal-row" data-r="${i}"><div class="lr-top"><span class="lr-name">${byName.has(card) ? cardLink(card, name) : esc(name)}</span><span class="lr-mana mono">${m ? m + " mana" : "free"}</span><span class="lr-dmg mono"></span></div>
          <div class="lr-bar"><i></i><span class="tick" style="left:33.33%"></span><span class="tick" style="left:66.66%"></span></div>
          <div class="lr-foot"><span class="lr-note"></span><span class="lr-res"></span></div></div>`;
      }).join("")}</div>
      <p class="muted small">Damage is the total you could deal this combat. “Kills” counts how many opponents at that life total it covers if you split attackers perfectly. Triumph of the Hordes counts poison: 10 kills a player whatever their life.</p></div>`;
    function calc() {
      const N = Math.max(1, numIn(el, "n")), P = numIn(el, "p"), B = Math.max(numIn(el, "b"), P), L = Math.max(1, numIn(el, "l"));
      CALC_ROWS.forEach(([, , f, noteF], i) => {
        const row = $(`[data-r="${i}"]`, el);
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
    el.addEventListener("input", calc);
    calc();
  }

  /* ---------------------------------------------------------------- widgets: combo simulators */
  function ringHTML(labels, unit) {
    const cx = 66, cy = 66, R = 50;
    const nodes = labels.map((_, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / labels.length;
      const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      return `<g><circle class="node" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10"/><text x="${x.toFixed(1)}" y="${(y + 3.6).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">${i + 1}</text></g>`;
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
        if (calm()) return;
        timers.forEach(clearTimeout); timers = [];
        restart(ring, "spin");
        nodes.forEach((_, i) => timers.push(setTimeout(() => hot(i), i * 200)));
        timers.push(setTimeout(() => hot(-1), nodes.length * 200 + 150));
      },
      spin(onOff) { ring.classList.toggle("spinning", onOff && !calm()); if (!onOff) hot(-1); },
      count(n) { $("[data-k=loops]", el).textContent = n; }
    };
  }
  const meterHTML = (key, label, max) => `<div class="meter" data-m="${key}"><span>${label}</span><b>0</b>${max ? `<span class="hp"><i></i></span>` : ""}</div>`;
  function setMeter(scope, key, val, max) {
    const m = $(`[data-m="${key}"]`, scope); if (!m) return;
    const b = $("b", m);
    const old = b.textContent;
    b.textContent = val;
    if (String(val) !== old && !calm()) { if (max && +val < +old) restart(m, "hit"); else restart(m, "bump"); }
    if (max) {
      $(".hp i", m).style.width = Math.max(0, Math.min(100, (val / max) * 100)) + "%";
      m.classList.toggle("dead", val <= 0);
      m.classList.toggle("low", val > 0 && val <= max * .25);
    }
  }
  function ballistaSim(el) {
    el.innerHTML = ringHTML(["Remove a counter", "1 damage to a player", "Lifelink: gain 1", "Heliod: counter back"], "pings") +
      `<div class="sim-meters">${meterHTML("c", "Ballista counters")}${meterHTML("life", "Your life")}${[1, 2, 3].map(i => meterHTML("o" + i, "Opponent " + i, 40)).join("")}</div>
      <div class="sim-log" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn" type="button" data-a="ll"></button>
        <button class="btn" type="button" data-a="ping">Ping once</button>
        <button class="btn pink" type="button" data-a="all">Loop until the table is dead</button>
        <button class="btn ghost" type="button" data-a="reset">Reset</button></div>`;
    const ring = makeRing(el);
    let s, timer;
    const done = () => s.opp.every(x => x <= 0);
    const reset = () => { clearInterval(timer); ring.spin(false); s = { counters: 2, life: 40, opp: [40, 40, 40], lifelink: false, pings: 0, log: "Heliod is out. Walking Ballista has 2 counters. Give it lifelink to start." }; draw(); };
    const ping = () => {
      const t = s.opp.findIndex(x => x > 0);
      if (t < 0) return false;
      s.opp[t]--; s.pings++;
      if (s.lifelink) { s.life++; s.log = `Ping ${s.pings}: 1 damage to opponent ${t + 1}. Lifelink +1 life, Heliod puts the counter back.`; }
      else { s.counters--; s.log = "Ping without lifelink: Ballista loses a counter and nothing comes back."; }
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
        if (calm()) { while (ping()); draw(); return; }
        ring.spin(true);
        timer = setInterval(() => { for (let i = 0; i < 3; i++) ping(); draw(); if (done()) { clearInterval(timer); ring.spin(false); } }, 30);
        return;
      }
      if (k === "reset") return reset();
      draw();
    });
    reset();
  }
  function feederSim(el) {
    const ENG = { heliod: "Heliod", thune: "Archangel of Thune", cleric: "Cleric Class" };
    el.innerHTML = `<div class="chips" role="group" aria-label="Engine">${Object.entries(ENG).map(([k, l]) => `<button class="chip" type="button" data-e="${k}" aria-pressed="false">${l}</button>`).join("")}</div>` +
      ringHTML(["Remove a counter", "Gain 2 life", "Engine triggers", "Counter back on Feeder"], "loops") +
      `<div class="sim-meters">${meterHTML("f", "Feeder counters")}${meterHTML("life", "Your life")}${meterHTML("team", "Team bonus +X/+X")}${[1, 2, 3].map(i => meterHTML("o" + i, "Opponent " + i, 40)).join("")}</div>
      <div class="sim-log" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn" type="button" data-a="one">Loop once</button>
        <button class="btn primary" type="button" data-a="many">Loop 25 times</button>
        <button class="btn pink" type="button" data-a="flux">Aetherflux: pay 50</button>
        <button class="btn ghost" type="button" data-a="reset">Reset</button></div>`;
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
        if (calm()) { for (let i = 0; i < 25; i++) loop(); draw(); return; }
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
  function playCta(el) {
    el.innerHTML = `<a class="play-promo" href="#play"><span class="pp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="pp-copy"><span class="pp-k mono">Practice</span><b>Play it against the bots</b><span class="muted">A real four-player Commander game against precons or Bracket 4 decks, built for one thumb.</span></span><span class="pp-go" aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg></span></a>`;
  }
  const WIDGETS = { engineCalc, handTrainer, drawOdds, lethalCalc, ballistaSim, feederSim, playCta };
  if (D.widgets) Object.assign(WIDGETS, D.widgets({ K, $, $$, esc, mana, sum, CARDS, EXTRA, checklist, rich, toast, byName, LIBRARY, COMMANDER, choose, stepperHTML, bump, bindSteppers: typeof bindSteppers === "function" ? bindSteppers : null, cardLink, cardChip, ringHTML, makeRing, meterHTML, setMeter, numIn, miniCard, manaText, linkMentions, paintArt, observe, calm, restart, store, KEY }));
  function mountWidgets(scope) {
    $$("[data-widget]", scope).forEach(el => {
      if (el._w) return;
      const f = WIDGETS[el.dataset.widget];
      if (!f) return;
      el._w = true;
      el.classList.add("widget", "w-" + el.dataset.widget);
      try { f(el); } catch (err) { console.error(err); el.textContent = "This tool couldn't start."; }
    });
  }

  /* ---------------------------------------------------------------- Stats: the deck as a score */
  const LANE_COLORS = ["var(--teal-fill)", "var(--leaf)", "var(--sky)", "var(--pink-fill)", "var(--violet)", "var(--gold-fill)", "var(--coral)", "var(--mint)", "var(--pink-fill)", "var(--sky)", "var(--leaf)"];
  function renderRoll() {
    const el = $("#roll-chart"); if (!el) return;
    const lanes = ROLES.filter(r => r[0] !== "land").map(([k, l]) => ({ k, l, cards: CARDS.filter(c => c.cat !== "Land" && c.roles[0] === k) })).filter(x => x.cards.length);
    const COLS = 8;
    el.innerHTML = `<div class="roll-grid">${lanes.map((ln, li) => {
      const cells = Array.from({ length: COLS }, (_, v) => ln.cards.filter(c => Math.min(7, c.mv) === v).sort((a, b) => a.name.localeCompare(b.name)));
      return `<div class="lane" style="--lc:${LANE_COLORS[li % LANE_COLORS.length]}"><span class="lane-l"><span>${esc(ln.l)}</span><b class="mono">${sum(ln.cards, c => c.qty)}</b></span><div class="lane-row">${cells.map((list, v) => `<div class="cell">${list.map(c => `<button class="note-key" type="button" data-card="${esc(c.name)}" title="${esc(c.name)}" aria-label="${esc(c.name)}, mana value ${c.mv}" style="--v:${v}"></button>`).join("")}</div>`).join("")}</div></div>`;
    }).join("")}
      <div class="roll-axis" aria-hidden="true"><span class="lane-l"></span><div class="lane-row">${Array.from({ length: COLS }, (_, v) => `<span>${v === 7 ? "7+" : v}</span>`).join("")}</div></div>
      <span class="playhead" aria-hidden="true"></span></div>
      <p class="roll-cap muted small">Mana value along the bottom. Each lane is a card's main job. Tap a note to open its card.</p>`;
    el.dataset.reveal = "";
  }
  function renderCurve() {
    const nonland = CARDS.filter(c => c.cat !== "Land");
    const buckets = [0, 1, 2, 3, 4, 5, 6, 7].map(v => nonland.filter(c => (v === 7 ? c.mv >= 7 : c.mv === v)));
    const counts = buckets.map(b => sum(b, c => c.qty));
    const peakI = counts.indexOf(Math.max(...counts));
    const eq = $("#eq");
    const top = Math.max(14, ...counts);
    eq.innerHTML = buckets.map((b, i) => {
      const n = counts[i];
      const segs = Array.from({ length: top }, (_, k) => `<i class="eq-seg${k < n ? " on" : ""}${k === n - 1 ? " top" : ""}" style="--k:${k};--c:${i}"></i>`).join("");
      return `<button class="eq-col" type="button" data-i="${i}" aria-pressed="false" aria-label="${n} cards at mana value ${i === 7 ? "7 or more" : i}">
        <span class="eq-stack">${segs}<span class="val mono">${n}</span></span><span class="lab mono">${i === 7 ? "7+" : i}</span></button>`;
    }).join("");
    eq.dataset.reveal = "";
    const readout = $("#eqReadout");
    const select = i => {
      $$(".eq-col", eq).forEach(c => c.setAttribute("aria-pressed", String(+c.dataset.i === i)));
      readout.innerHTML = `<b>Mana value ${i === 7 ? "7+" : i} · ${counts[i]} card${counts[i] === 1 ? "" : "s"}</b><div class="syn">${buckets[i].map(c => cardChip(c.name)).join("")}</div>`;
    };
    eq.addEventListener("click", e => { const c = e.target.closest(".eq-col"); if (c) select(+c.dataset.i); });
    eq.addEventListener("pointerover", e => { if (!mqHover.matches) return; const c = e.target.closest(".eq-col"); if (c && c.getAttribute("aria-pressed") !== "true") select(+c.dataset.i); });
    select(peakI);
    const types = TYPE_ORDER.map(t => [TYPE_PLURAL[t], sum(CARDS.filter(c => c.cat === t), c => c.qty)]).filter(t => t[1]);
    bars($("#typebars"), types.map(([l, n]) => [esc(l), n]));
    const avg = sum(nonland, c => c.mv * c.qty) / sum(nonland, c => c.qty);
    $(".eq-head .small", $("#curve")).textContent = `average ${avg.toFixed(2)} · peak at ${peakI}`;
  }
  function bars(el, rows, opts = {}) {
    const max = opts.max || Math.max(...rows.map(r => r[1]));
    el.innerHTML = rows.map(([l, n, extra]) => `<div class="typebar"><span class="tb-l">${l}</span><span class="bar"><i style="--w:${Math.max(1.5, n / max * 100).toFixed(1)}%"></i></span><span class="num mono">${opts.fmt ? opts.fmt(n) : n}</span>${extra ? `<span class="tb-x">${extra}</span>` : ""}</div>`).join("");
    el.dataset.reveal = "";
  }
  // The deck's two colors: [symbol, name, basic land type]. The first draws as "g", the second as "w".
  const COL = D.colors || [["G", "green", "Forest"], ["W", "white", "Plains"]];
  function landColors(c) {
    const t = c.text || "", ty = c.type || "";
    const cmd = /any color in your commander|any color/.test(t);
    const makes = ([sym, , basic]) => cmd || new RegExp("Add[^.]*\\{" + sym + "\\}").test(t) || ty.includes(basic) || new RegExp("[Ss]earch[^.]*" + basic).test(t) || (c.faces || []).some(f => new RegExp("Add[^.]*\\{" + sym + "\\}").test(f.text || ""));
    return { g: makes(COL[0]), w: makes(COL[1]) };
  }
  function renderColors() {
    let g = 0, w = 0, hy = 0;
    CARDS.forEach(c => {
      if (c.cat === "Land") return;
      const costs = c.faces ? c.faces.map(f => f.cost) : [c.cost];
      costs.forEach(cost => { for (const m of String(cost || "").matchAll(/\{([^}]+)\}/g)) { const s = m[1].toUpperCase(); if (s === COL[0][0]) g += c.qty; else if (s === COL[1][0]) w += c.qty; else if (s.includes("/") && s.split("/").every(x => x === COL[0][0] || x === COL[1][0])) hy += c.qty; } });
    });
    const lands = CARDS.filter(c => c.cat === "Land");
    let lg = 0, lw = 0, both = 0, colorless = 0;
    lands.forEach(c => { const k = landColors(c); if (k.g && k.w) both += c.qty; else if (k.g) lg += c.qty; else if (k.w) lw += c.qty; else colorless += c.qty; });
    const rocks = CARDS.filter(c => c.cat !== "Land" && c.roles.includes("ramp") && /Add /.test(c.text || ""));
    const tot = g + w, srcG = lg + both, srcW = lw + both;
    $("#colorStats").innerHTML = `
      <div class="eq-card color-card"><div class="eq-head"><b>Colored pips</b><span class="muted mono small">in mana costs</span></div>
        <div class="tug" role="img" aria-label="${g} ${COL[0][1]} pips and ${w} ${COL[1][1]} pips"><i class="g" style="--w:${(g / tot * 100).toFixed(1)}%"><span>${mana("{" + COL[0][0] + "}")} ${g}</span></i><i class="w" style="--w:${(w / tot * 100).toFixed(1)}%"><span>${w} ${mana("{" + COL[1][0] + "}")}</span></i></div>
        <p class="muted small">${Math.round(g / tot * 100)}% ${COL[0][1]}, ${Math.round(w / tot * 100)}% ${COL[1][1]}${hy ? `, plus ${hy} hybrid` : ""}. ${D.pipNote || "Trostani alone asks for {G}{G}{W}{W}."}</p></div>
      <div class="eq-card color-card"><div class="eq-head"><b>Lands that make each color</b><span class="muted mono small">${sum(lands, c => c.qty)} lands</span></div>
        <div class="tug" role="img" aria-label="${srcG} lands make ${COL[0][1]} and ${srcW} make ${COL[1][1]}"><i class="g" style="--w:${(srcG / (srcG + srcW) * 100).toFixed(1)}%"><span>${mana("{" + COL[0][0] + "}")} ${srcG}</span></i><i class="w" style="--w:${(srcW / (srcG + srcW) * 100).toFixed(1)}%"><span>${srcW} ${mana("{" + COL[1][0] + "}")}</span></i></div>
        <ul class="src-list"><li><b class="mono">${both}</b> make either color</li><li><b class="mono">${lg}</b> ${COL[0][1]} only</li><li><b class="mono">${lw}</b> ${COL[1][1]} only</li><li><b class="mono">${colorless}</b> colorless utility lands</li><li><b class="mono">${rocks.length}</b> mana rocks and creatures on top</li></ul></div>`;
    manaText($("#colorStats"));
  }
  function renderRoles() {
    const rows = ROLES.filter(r => r[0] !== "cmd").map(([k, l]) => [esc(l), sum(CARDS.filter(c => c.roles.includes(k)), c => c.qty)]).sort((a, b) => b[1] - a[1]);
    bars($("#roleBars"), rows);
  }
  function renderPrices() {
    const el0 = $("#priceStats"); if (!el0) return;
    const up = CARDS.filter(c => c.new).sort((a, b) => b.eur - a.eur);
    const total = sum(up, c => c.eur);
    const bands = [["Under 1€", c => c.eur < 1], ["1 to 3€", c => c.eur >= 1 && c.eur < 3], ["3 to 10€", c => c.eur >= 3 && c.eur < 10], ["10€ and up", c => c.eur >= 10]].map(([l, f]) => { const cs2 = up.filter(f); return [l, cs2.length, sum(cs2, c => c.eur)]; });
    const sorted = up.map(c => c.eur).sort((a, b) => a - b);
    const median = (sorted[10] + sorted[11]) / 2;
    const el = $("#priceStats");
    el.innerHTML = `<div class="eq-card"><div class="eq-head"><b>The 24 upgrades by price</b><span class="muted mono small">~${Math.round(total)}€ in all</span></div><div class="typebars prices" id="priceBars"></div></div>
      <div class="eq-card"><div class="eq-head"><b>Price bands</b><span class="muted mono small">median ${median.toFixed(2)}€</span></div>
        <div class="bands">${bands.map(([l, n, e]) => `<div class="band"><b>${n}</b><span>${l}</span><em class="mono">${Math.round(e)}€</em></div>`).join("")}</div>
        <p class="muted small">Two cards, Craterhoof Behemoth and Heliod, are ${Math.round((up[0].eur + up[1].eur) / total * 100)}% of the upgrade money. Half the upgrades cost less than ${median.toFixed(2)}€.</p></div>`;
    bars($("#priceBars"), up.map(c => [cardLink(c.name), c.eur]), { fmt: n => n.toFixed(2) + "€" });
  }
  function renderSpeed() {
    const TURNS = [6, 7, 8, 9, 10, 11, 12];
    const COMBO = [4, 13, 31, 55, 75, 87, 94], BEAT = [2, 9, 27, 51, 72, 85, 93];
    const el = $("#speedChart"), out = $("#speedReadout");
    if (!el) return;
    el.innerHTML = `<div class="sp-grid" aria-hidden="true"><span style="--y:75%">75%</span><span style="--y:50%">50%</span><span style="--y:25%">25%</span></div>` +
      TURNS.map((t, i) => `<button class="sp-col${t >= 7 && t <= 9 ? " key" : ""}" type="button" data-i="${i}" aria-pressed="false" aria-label="By turn ${t}: ${COMBO[i]}% of games">
        <span class="sp-stack"><span class="sp-bar-v" style="--h:${COMBO[i]}%;--i:${i}"><span class="sp-val mono">${COMBO[i]}%</span></span></span><span class="sp-lab mono">T${t}</span></button>`).join("");
    el.dataset.reveal = "";
    const select = i => {
      $$(".sp-col", el).forEach(c => c.setAttribute("aria-pressed", String(+c.dataset.i === i)));
      out.innerHTML = `<b>Won by the end of turn ${TURNS[i]}: ${COMBO[i]}% of games</b><span class="muted">${BEAT[i]}% with the combos switched off, so they add ${COMBO[i] - BEAT[i]} point${COMBO[i] - BEAT[i] === 1 ? "" : "s"}.</span>`;
    };
    el.addEventListener("click", e => { const c = e.target.closest(".sp-col"); if (c) select(+c.dataset.i); });
    el.addEventListener("pointerover", e => { if (!mqHover.matches) return; const c = e.target.closest(".sp-col"); if (c) select(+c.dataset.i); });
    select(2);
    const ENDS = [["Plain combat damage", 68], ["Overwhelming Stampede", 8], ["Triumph of the Hordes", 7], ["Craterhoof Behemoth", 6], ["Return of the Wildspeaker", 5], ["Heliod + Walking Ballista", 2.6], ["Finale for Craterhoof", 1], ["Spike Feeder + Aetherflux", .7], ["Aetherflux off big life", .7]];
    bars($("#endings"), ENDS.map(([l, n]) => [cardLink(l), n]), { fmt: n => (n < 1 ? n.toFixed(1) : n) + "%" });
  }
  // Results of headless games between bots, from tools/sim/run.js: Miku against three random precons,
  // and against three random Bracket 4 decks. Each is { games, wins, rounds, medianWin, decks: [{ name, games, wins }] }.
  const BOT_SIM = D.botSim || {
    precon: { games: 400, wins: 160, rounds: 12.3, medianWin: 11, decks: [{ name: "Lathril", games: 240, wins: 101 }, { name: "Isperia", games: 240, wins: 99 }, { name: "Ghired", games: 240, wins: 95 }, { name: "Wilhelt", games: 240, wins: 95 }, { name: "Kaalia", games: 240, wins: 90 }] },
    b4: { games: 400, wins: 113, rounds: 9.4, medianWin: 10, decks: [{ name: "Edgar", games: 240, wins: 76 }, { name: "Krenko", games: 240, wins: 71 }, { name: "Talrand", games: 240, wins: 69 }, { name: "Ur-Dragon", games: 240, wins: 62 }, { name: "Ghalta", games: 240, wins: 61 }] }
  };
  function renderBotStats() {
    const sec = $("#vsbots"), el = $("#botStats");
    if (!sec || !el) return;
    const tiers = BOT_SIM ? [["precon", "Against three precons", "B2"], ["b4", "Against three Bracket 4 decks", "B4"]].filter(([k]) => BOT_SIM[k]) : [];
    if (!tiers.length) { sec.hidden = true; return; }
    const pct = (w, n) => Math.round(w / n * 100);
    el.innerHTML = `<div class="eq-card"><div class="eq-head"><b>${esc(SHORT)}'s results</b><span class="muted mono small">${sum(tiers, ([k]) => BOT_SIM[k].games)} games</span></div>
        ${tiers.map(([k, label]) => { const S = BOT_SIM[k]; return `<div class="bs-tier"><p class="bs-label">${label}</p><div class="big-trio"><div><b>${pct(S.wins, S.games)}%</b><span>games won</span></div><div><b>${S.rounds.toFixed(1)}</b><span>rounds per game on average</span></div><div><b>${S.medianWin}</b><span>median round of a ${esc(SHORT)} win</span></div></div></div>`; }).join("")}
        <p class="muted small">25% is par at a four-player table.</p></div>
      <div class="eq-card"><div class="eq-head"><b>Win rate by opponent</b><span class="muted mono small">tables that included it</span></div><div class="typebars" id="botBars"></div></div>`;
    const rows = [];
    for (const [k, , tag] of tiers) for (const d of BOT_SIM[k].decks) rows.push([`${esc(d.name)} <small class="tb-tag mono">${tag}</small>`, pct(d.wins, d.games), `${d.wins}/${d.games}`]);
    bars($("#botBars"), rows, { max: 100, fmt: n => n + "%" });
  }
  function renderLandOdds() {
    const el = $("#landOdds"); if (!el) return;
    const N = LIBRARY.length, L = LIBRARY.filter(c => c.cat === "Land").length;
    const ps = Array.from({ length: 8 }, (_, k) => choose(L, k) * choose(N - L, 7 - k) / choose(N, 7));
    const keep = ps[2] + ps[3] + ps[4] + ps[5];
    const max = Math.max(...ps);
    el.innerHTML = `<div class="lo-bars">${ps.map((p, k) => `<div class="lo${k >= 2 && k <= 5 ? " keep" : ""}"><span class="lo-v mono">${(p * 100).toFixed(k === 0 || k >= 6 ? 1 : 0)}%</span><span class="lo-bar"><i style="--h:${(p / max * 100).toFixed(1)}%"></i></span><span class="lo-k mono">${k}</span></div>`).join("")}</div>
      <p class="lo-note"><b>${Math.round(keep * 100)}%</b> of opening hands have 2 to 5 lands, the keepable range. The average hand has ${(7 * L / N).toFixed(1)} lands.</p>`;
    el.dataset.reveal = "";
  }

  /* ---------------------------------------------------------------- Stats: your games */
  function renderMyStats() {
    const el = $("#myStats"); if (!el) return;
    const st = store.json(KEY + ".game.stats.v1", null);
    if (!st || !st.games) {
      el.innerHTML = `<div class="empty-state"><span class="pp-eq" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><b>No games yet</b><p class="muted">Play a game against the bots and your record shows up here: wins, fastest kill, damage, life gained and tokens made.</p><a class="btn primary" href="#play">Play a game</a></div>`;
      return;
    }
    const deckName = id => (window.MK && MK.BOT_DECKS && (MK.BOT_DECKS.find(d => d.id === id) || {}).name) || (id ? id.charAt(0).toUpperCase() + id.slice(1) : "?");
    const rate = Math.round(100 * st.wins / st.games);
    const recent = (st.recent || []).slice(0, 10);
    const decks = Object.entries(st.decks || {}).sort((a, b) => (b[1].w + b[1].l) - (a[1].w + a[1].l));
    const avg = k => recent.length ? Math.round(sum(recent, r => r[k] || 0) / recent.length) : 0;
    el.innerHTML = `<div class="rec-tiles">
        <div><b>${st.games}</b><span>games</span></div><div><b>${st.wins}</b><span>wins</span></div><div><b>${rate}%</b><span>win rate</span></div><div><b>${st.best ? "R" + st.best : "–"}</b><span>fastest win</span></div>
        <div><b>${st.most || 0}</b><span>most damage in a game</span></div><div><b>${st.life || 0}</b><span>highest life at the end</span></div></div>
      ${decks.length ? `<div class="eq-card"><div class="eq-head"><b>Against each bot</b><span class="muted mono small">wins–losses</span></div><div class="typebars" id="myDeckBars"></div></div>` : ""}
      ${recent.length ? `<div class="eq-card"><div class="eq-head"><b>Last ${recent.length} games</b><span class="muted mono small">avg ${avg("dmg")} damage · ${avg("gained")} life · ${avg("tokens")} tokens</span></div>
        <ol class="recent">${recent.map(r => `<li class="${r.win ? "w" : r.draw ? "d" : "l"}"><span class="res mono">${r.win ? "WIN" : r.draw ? "DRAW" : "LOSS"}</span><span class="vs">vs ${(r.vs || []).map(deckName).map(esc).join(", ")}</span><span class="rd mono">R${r.rounds}</span><span class="nums mono">${r.dmg} dmg · +${r.gained} · ${r.tokens} tok</span></li>`).join("")}</ol></div>` : ""}
      <div class="btn-row"><a class="btn primary" href="#play">Play again</a><button class="btn ghost" type="button" id="clearStats">Clear my record</button></div>`;
    if (decks.length) bars($("#myDeckBars"), decks.map(([id, r]) => [esc(deckName(id)), r.w + r.l ? Math.round(100 * r.w / (r.w + r.l)) : 0, `${r.w}–${r.l}`]), { max: 100, fmt: n => n + "%" });
    observe(el);
    if (!window.MikuGame && decks.length) loadGame().then(() => { if (cur.view === "stats") renderMyStats(); }).catch(() => {});
  }
  document.addEventListener("click", e => {
    if (!e.target.closest("#clearStats")) return;
    if (!confirm("Clear your record against the bots on this device?")) return;
    try { localStorage.removeItem(KEY + ".game.stats.v1"); } catch (err) { /* ignore */ }
    renderMyStats(); toast("Record cleared");
  });

  /* ---------------------------------------------------------------- Shop: buying checklists */
  const BOUGHT_KEY = KEY + ".bought.v1";
  let bought = new Set(store.json(BOUGHT_KEY, []));
  const saveBought = () => store.put(BOUGHT_KEY, [...bought]);
  const cmURL = n => "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(n);
  const eur = n => n == null ? "?" : n >= 100 ? Math.round(n) + "€" : n.toFixed(2);
  const TICK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function itemHTML(it, i) {
    const on = bought.has(it.id);
    const name = byName.has(it.name) ? cardLink(it.name, it.name) : `<span>${esc(it.name)}</span>`;
    const tags = (it.tags || []).map(t => `<span class="tag${t[1] ? " " + t[1] : ""}">${esc(t[0])}</span>`).join("");
    return `<div class="swap${on ? " done" : ""}${it.cut ? "" : " plain"}" data-id="${esc(it.id)}">
      <button class="tick" type="button" aria-pressed="${on}" aria-label="Bought ${esc(it.name)}"><span><em>${i + 1}</em>${TICK_SVG}</span></button>
      <div class="who">${it.cut ? `<span class="cut">${esc(it.cut)}</span>` : ""}<span class="add">${name}</span>${it.note || tags ? `<span class="sub-note">${it.note ? esc(it.note) : ""}${tags}</span>` : ""}</div>
      ${it.link === false ? `<span class="eur mono">${eur(it.eur)}</span>` : `<a class="eur mono" href="${cmURL(it.name)}" target="_blank" rel="noopener" aria-label="${it.eur != null ? it.eur.toFixed(2) + " euros" : "No price"}, search Cardmarket">${eur(it.eur)}</a>`}</div>`;
  }
  function checklist({ body, progress, items, tiers = {}, budget, budgetLabel, footer, done, extra }) {
    const render = () => {
      body.innerHTML = items.map((it, i) => (tiers[i] ? `<div class="tier"><span>${tiers[i][0]}</span><span class="mono">${tiers[i][1]}</span></div>` : "") + itemHTML(it, i)).join("") + (footer ? footer() : "");
      update();
    };
    const update = () => {
      const got = items.filter(it => bought.has(it.id));
      const spent = sum(got, it => it.eur), total = sum(items, it => it.eur);
      const next = items.find(it => !bought.has(it.id));
      const cap = budget || total;
      const over = budget && spent > budget;
      progress.innerHTML = `<div class="sp-top"><span><b>${got.length}</b> of ${items.length} bought</span><span class="mono">${Math.round(spent)}€ / ${budgetLabel || "~" + Math.round(total) + "€"}</span></div>
        <div class="sp-bar${over ? " over" : ""}"><i style="--w:${Math.min(100, (spent / cap) * 100)}%"></i></div>
        <div class="sp-top"><span>${next ? `Next: ${esc(next.name)}` : esc(done)}</span>${got.length ? '<button type="button" class="linkish" data-clear>Clear ticks</button>' : ""}</div>${extra ? extra() : ""}`;
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
  const SWAP_ORDER = ["Overwhelming Stampede", "Beastmaster Ascension", "Intangible Virtue", "Mirror Entity", "Beast Within", "Adeline, Resplendent Cathar", "Spike Feeder", "Jazal Goldmane", "Elspeth, Sun's Champion", "Esika's Chariot", "Arcane Signet", "Elvish Mystic", "Crashing Drawbridge", "Return of the Wildspeaker", "Generous Gift", "Razorverge Thicket", "Scattered Groves", "Brushland", "Heliod, Sun-Crowned", "Walking Ballista", "Cathars' Crusade", "Hero of Bladehold", "Triumph of the Hordes", "Craterhoof Behemoth"];
  function renderSwaps() {
    const items = [{ id: "miku:precon", name: "Secret Lair Commander Deck: Hatsune Miku", eur: 200, note: "Sealed. Sold for 199.90€ on eBay.de; check what you pay.", link: false }]
      .concat(SWAP_ORDER.map(n => { const c = byName.get(n); return { id: "miku:" + n, name: n, cut: c.cut, eur: c.eur }; }));
    const swapTotal = sum(items.slice(1), it => it.eur);
    checklist({
      body: $("#swapBody"), progress: $("#swapProgress"), items, budget: 300, budgetLabel: "300€ budget",
      tiers: { 0: ["The deck", "~200€"], 1: ["Cheap core", "~28€"], 19: ["The infinite-damage combo", "~24€"], 21: ["Power", "~12€"], 23: ["Splurge", "~33€"] },
      footer: () => `<div class="swap-total"><span>Deck + all 24 swaps</span><span class="mono">~${Math.round(200 + swapTotal)}€</span></div>`,
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
    let st = store.get(KEY + ".azStage") || "s1";
    if (!A[st]) st = "s1";
    const list = checklist({
      body: $("#azBody"), progress: $("#azProgress"), items: itemsOf(st),
      done: "This stage is complete.",
      extra: () => {
        const spent = sum(allItems.filter(it => bought.has(it.id)), it => it.eur);
        const total = sum(allItems, it => it.eur);
        return `<div class="sp-top sp-all"><span>All three stages</span><span class="mono">${Math.round(spent)}€ / ~${Math.round(total)}€</span></div>`;
      }
    });
    const pick = s => {
      st = s; store.set(KEY + ".azStage", s);
      $$("#azSeg [data-stage]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.stage === s)));
      $("#azNote").textContent = NOTES[s];
      list.set(itemsOf(s));
    };
    $("#azSeg").addEventListener("click", e => { const b = e.target.closest("[data-stage]"); if (b && b.dataset.stage !== st) { pick(b.dataset.stage); if (!calm()) restart($("#azBody"), "swap-in"); } });
    pick(st);
  }

  /* ---------------------------------------------------------------- Play: the game loads on demand */
  const GAME_BASE = D.gameBase || "game/";
  const GAME_FILES = ["game/engine.js", "game/cards-miku.js", "game/cards-corrupted.js", "game/checklist-corrupted.js", "game/checklist-cetrata.js", "game/brain-corrupted.js", "game/cards-etrata.js", "game/cards-miku-precon.js", "game/decks-azusa.js", "game/decks-cetrata.js", "game/decks-edgar.js", "game/decks-etrata4.js", "game/decks-ghalta.js", "game/decks-krenko.js", "game/decks-talrand.js", "game/decks-urdragon.js", "game/precon-ghired.js", "game/precon-isperia.js", "game/precon-kaalia.js", "game/precon-lathril.js", "game/precon-wilhelt.js", "game/ai.js", "game/practice.js", "game/train-cetrata.js", "game/game-ui.js"];
  let gameP = null, gameMounted = false;
  function loadGame() {
    if (gameP) return gameP;
    if (!$('link[data-game-css]')) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = GAME_BASE + "game.css?v=" + V; l.dataset.gameCss = "";
      document.head.appendChild(l);
    }
    gameP = Promise.all(GAME_FILES.map(f => f.replace(/^game\//, GAME_BASE)).map(f => new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = f + "?v=" + V; s.async = false;
      s.onload = res; s.onerror = () => rej(new Error("Could not load " + f));
      document.body.appendChild(s);
    }))).catch(err => { gameP = null; throw err; });
    return gameP;
  }
  function showPlay() {
    const host = $("#playHost");
    loadGame().then(() => {
      if (!window.MikuGame) throw new Error("game missing");
      if (!gameMounted) { gameMounted = true; MikuGame.mount(host); }
      else if (!MikuGame.Lobby.table) MikuGame.Lobby.render();
    }).catch(() => {
      host.innerHTML = `<div class="empty-state"><b>The game couldn't load</b><p class="muted">Check your connection and try again.</p><button class="btn primary" type="button" id="retryGame">Try again</button></div>`;
    });
  }
  document.addEventListener("click", e => { if (e.target.closest("#retryGame")) showPlay(); });

  /* ---------------------------------------------------------------- lazy page rendering */
  const shown = new Set();
  const RENDER = {
    "guide/start": () => { renderResume(); wave(); },
    "guide/chapters": renderTracklist,
    "cards/browse": () => renderList(),
    "cards/setlist": () => { renderSetlist(); renderCuts(); },
    "cards/glossary": renderGlossary,
    "cards/faq": renderFaq,
    "stats/deck": () => { renderRoll(); renderCurve(); renderColors(); renderRoles(); renderPrices(); },
    "stats/speed": () => { renderSpeed(); renderBotStats(); },
    "stats/odds": renderLandOdds,
    "shop/upgrades": renderSwaps,
    "shop/azusa": renderAzusa
  };
  function renderKey(key) {
    if (shown.has(key)) return;
    shown.add(key);
    const [v, s] = key.split("/");
    const scope = s ? $(`#view-${v} .segment[data-segment="${s}"]`) : $("#view-" + v);
    if (RENDER[key]) RENDER[key]();
    if (scope) { mountWidgets(scope); paintArt(scope); observe(scope); }
  }
  function renderEverything() { Object.keys(SEGS).forEach(v => SEGS[v].forEach(s => renderKey(v + "/" + s.id))); }
  function onShow(view, seg) {
    const key = view + "/" + (seg || "");
    renderKey(key);
    if (key === "guide/chapters") renderTracklist();
    if (key === "guide/start") renderResume();
    if (key === "stats/you") renderMyStats();
    if (view === "play") showPlay();
    requestAnimationFrame(flowFill);
  }

  /* ---------------------------------------------------------------- motion */
  function wave() {
    const w = $("#wave"); if (!w || w.childElementCount) return;
    let seed = 7;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const n = mqMobile.matches ? 36 : 64;
    w.innerHTML = Array.from({ length: n }, (_, i) => {
      const env = Math.sin(Math.PI * (i + .5) / n) * .7 + .3;
      const h = (.15 + rnd() * .45) * env, h2 = Math.min(1, (.45 + rnd() * .55) * env + .1);
      return `<i style="--h:${h.toFixed(2)};--h2:${h2.toFixed(2)};--d:${(-rnd() * 1.4).toFixed(2)}s"></i>`;
    }).join("");
    if (calm() || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(es => es.forEach(en => w.classList.toggle("live", en.isIntersecting))).observe(w);
  }
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    if (calm() || el._counted) return;
    el._counted = true;
    const t0 = performance.now(), dur = 1100;
    const f = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(f);
    };
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(f);
  }
  const io = "IntersectionObserver" in window && !calm()
    ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { io.unobserve(en.target); reveal(en.target); } }), { threshold: 0, rootMargin: "0px 0px -12% 0px" }) // a ratio threshold never fires on a block taller than the screen (the long decklists)
    : null;
  function reveal(el) { if (el.matches("[data-count]")) countUp(el); else el.classList.add("in"); }
  function observe(scope) {
    $$("[data-reveal]:not(.in), [data-count], .block", scope).forEach(el => {
      if (el.classList.contains("block")) { if (el.classList.contains("rv")) return; el.classList.add("rv"); }
      if (io) io.observe(el); else if (!el.matches("[data-count]")) el.classList.add("in");
    });
  }
  function flowFill() {
    const flowEl = $(".flow");
    if (calm() || !flowEl || !flowEl.offsetParent) return;
    const r = flowEl.getBoundingClientRect(), vh = window.innerHeight;
    const wide = !mqMobile.matches;
    const p = wide ? (vh * .9 - r.top) / (vh * .5) : (vh * .7 - r.top) / r.height;
    flowEl.style.setProperty("--fill", Math.max(0, Math.min(1, p)).toFixed(3));
  }

  /* ---------------------------------------------------------------- theme */
  const themeColor = () => getComputedStyle(root).getPropertyValue("--bg").trim();
  function syncThemeMeta() { $$('meta[name="theme-color"]').forEach(m => m.setAttribute("content", themeColor())); }
  if (root.dataset.theme) syncThemeMeta();
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.add("theme-anim");
    root.dataset.theme = dark ? "light" : "dark";
    store.set(KEY + ".theme", root.dataset.theme);
    syncThemeMeta();
    setTimeout(() => root.classList.remove("theme-anim"), 450);
  });

  /* ---------------------------------------------------------------- deck switcher */
  // every deck site shares this header, so one button in it reaches the other decks and the hub
  const DECKS = [
    { id: "miku", name: "Hatsune Miku", sub: "Trostani · Selesnya · B3" },
    { id: "corrupted", name: "Corrupted Miku", sub: "Shalai · Selesnya · B4" },
    { id: "etrata", name: "Etrata", sub: "Etrata · Dimir · B3" },
    { id: "corrupted-etrata", name: "Corrupted Etrata", sub: "Etrata · Dimir · B4" }
  ];
  (function deckSwitcher() {
    const bar = $(".bar-actions");
    if (!bar) return;
    const here = (/\/(miku|etrata|corrupted|corrupted-etrata)\//.exec(location.pathname) || [, "miku"])[1];
    const btn = document.createElement("button");
    btn.className = "icon-btn"; btn.id = "deckBtn"; btn.type = "button";
    btn.setAttribute("aria-label", "Switch deck"); btn.setAttribute("aria-haspopup", "menu"); btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>`;
    const menu = document.createElement("div");
    menu.className = "deck-menu"; menu.setAttribute("role", "menu"); menu.hidden = true;
    menu.innerHTML = `<p class="dm-h">Decks</p>` + DECKS.map(d => `<a role="menuitem" href="../${d.id}/" class="dm-deck${d.id === here ? " on" : ""}"${d.id === here ? ' aria-current="page"' : ""}><img src="../${d.id}/icon.svg" alt="" width="32" height="32"><span><b>${esc(d.name)}</b><small>${esc(d.sub)}</small></span>${d.id === here ? '<i>Here</i>' : ""}</a>`).join("") +
      `<a role="menuitem" href="../" class="dm-all"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>All decks</a>`;
    bar.insertBefore(btn, bar.firstChild);
    document.body.appendChild(menu);
    const place = () => { const r = btn.getBoundingClientRect(); menu.style.top = Math.round(r.bottom + 8) + "px"; const w = Math.min(300, innerWidth - 16); menu.style.right = Math.round(Math.max(8, Math.min(innerWidth - r.right, innerWidth - w - 8))) + "px"; };
    const close = () => { if (menu.hidden) return; menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", e => {
      e.stopPropagation();
      if (!menu.hidden) return close();
      place(); menu.hidden = false; btn.setAttribute("aria-expanded", "true");
      (menu.querySelector(".dm-deck:not(.on)") || menu.querySelector("a")).focus({ preventScroll: true });
    });
    document.addEventListener("click", e => { if (!menu.contains(e.target)) close(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !menu.hidden) { close(); btn.focus(); } });
    addEventListener("resize", close);
    addEventListener("scroll", close, { passive: true });
  })();

  /* ---------------------------------------------------------------- boot */
  const main = $("#main");
  linkMentions(main);
  manaText(main);
  tableLabels(main);
  if (!mqMobile.matches) $$("details[data-auto-open]").forEach(d => { d.open = true; });
  route();
  paintArt();
  bindTilt(document);
  observe(document);
  K.ensure(CARDS.map(c => c.name), { miku: !D.key });
  window.MikuApp = { route, openSheet, loadGame, gameInfo: { base: GAME_BASE, v: V, files: GAME_FILES } };
  if ("serviceWorker" in navigator && location.protocol === "https:" && /github\.io$|^localhost$/.test(location.hostname)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => { /* offline mode is optional */ }));
  }
})();
