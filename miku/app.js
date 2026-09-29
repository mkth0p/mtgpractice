/* Miku Deck Wiki: routing, card wiki, charts, combo simulators, calculator, hand trainer. */
(function () {
  "use strict";
  const CARDS = window.MIKU_CARDS || [];
  const byName = new Map(CARDS.map(c => [c.name, c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const bySlug = new Map(CARDS.map(c => [slug(c.name), c]));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }
  };

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
  function rulesHTML(text) {
    return text.split("\n").filter(Boolean).map(l => `<p>${mana(l)}</p>`).join("");
  }

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
    try {
      const cached = JSON.parse(store.get(ART_KEY) || "null");
      if (cached && Date.now() - cached.t < 7 * 864e5 && cached.art) { ART = cached.art; paintArt(); return; }
    } catch (e) { /* ignore bad cache */ }
    const ids = CARDS.map(c => ({ name: c.name })).concat(Object.keys(MIKU_PRINTS).map(n => ({ set: "sld", collector_number: n })));
    const batches = [];
    for (let i = 0; i < ids.length; i += 75) batches.push(ids.slice(i, i + 75));
    const art = {};
    try {
      for (const b of batches) {
        const r = await fetch("https://api.scryfall.com/cards/collection", {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ identifiers: b })
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
      /* Offline or blocked: the text frames stay, which still show every card's rules. */
    }
  }
  function miniCard(c) {
    const a = ART[c.name];
    if (a) return `<img src="${esc(a.normal)}" alt="${esc(c.name)}" loading="lazy" decoding="async">`;
    return `<div class="frame"><b>${esc(c.name)}</b><span class="muted">${mana(c.cost || "")}</span><span class="muted">${esc(c.type)}</span></div>`;
  }
  function paintArt() {
    $$("[data-art]").forEach(el => { const c = byName.get(el.dataset.art); if (c) el.innerHTML = miniCard(c); });
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
      b.textContent = el.dataset.label || name.split(" // ")[0];
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

  /* ---------------------------------------------------------------- navigation */
  const TABS = [
    ["deck", "Deck", '<path d="M4 6h16M4 12h16M4 18h10"/>'],
    ["cards", "Cards", '<rect x="5" y="3" width="11" height="16" rx="2"/><path d="M19 7v12a2 2 0 0 1-2 2H9"/>'],
    ["combos", "Combos", '<path d="M8 12a4 4 0 1 1 4-4v8a4 4 0 1 0 4-4H8z"/>'],
    ["play", "Play", '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/>'],
    ["buy", "Upgrades", '<path d="M4 4h2l2.2 11h10.3L21 8H7"/><circle cx="10" cy="20" r="1.4"/><circle cx="17" cy="20" r="1.4"/>']
  ];
  $$("[data-nav]").forEach(nav => {
    nav.innerHTML = TABS.map(([id, label, icon]) =>
      `<a class="tab" href="#${id}" data-tab="${id}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg><span>${label}</span></a>`).join("");
  });
  let currentView = null;
  function showView(id) {
    if (currentView === id) return;
    currentView = id;
    $$(".view").forEach(v => v.classList.toggle("active", v.dataset.view === id));
    $$("[data-tab]").forEach(t => { if (t.dataset.tab === id) t.setAttribute("aria-current", "page"); else t.removeAttribute("aria-current"); });
    store.set("mikuWiki.tab", id);
  }
  let sheetFromApp = false;
  function route() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith("card-")) {
      const c = bySlug.get(h.slice(5));
      if (!currentView) showView("cards");
      if (c) { openSheet(c); return; }
    }
    closeSheet(true);
    if (TABS.some(t => t[0] === h)) { showView(h); window.scrollTo(0, 0); return; }
    const target = h && document.getElementById(h);
    if (target) {
      const v = target.closest("[data-view]");
      if (v) showView(v.dataset.view);
      requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
      return;
    }
    if (!currentView) showView(store.get("mikuWiki.tab") || "deck");
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-card]");
    if (!b) return;
    e.preventDefault();
    const c = byName.get(b.dataset.card);
    if (!c) return;
    if (b.closest("#sheet")) { history.replaceState(null, "", "#card-" + slug(c.name)); openSheet(c); return; }
    sheetFromApp = true;
    location.hash = "card-" + slug(c.name);
  });

  /* ---------------------------------------------------------------- sheet */
  const sheet = $("#sheet"), scrim = $("#scrim"), sheetBody = $("#sheetBody");
  let sheetList = CARDS, lastFocus = null;
  function openSheet(c) {
    if (!sheet.classList.contains("open")) lastFocus = document.activeElement;
    const i = sheetList.indexOf(c);
    const list = i >= 0 ? sheetList : CARDS;
    const idx = list.indexOf(c);
    const prev = list[(idx - 1 + list.length) % list.length], next = list[(idx + 1) % list.length];
    $("#sheetEyebrow").textContent = c.roles.map(r => ROLE_LABEL[r]).join(" · ");
    const faces = c.faces
      ? c.faces.map(f => `<div class="face-name">${esc(f.name)} <span class="cost">${mana(f.cost)}</span></div>${rulesHTML(f.text)}`).join("")
      : rulesHTML(c.text || "");
    const tags = [
      c.new ? `<span class="tag new">NEW · upgrade</span>` : "",
      c.miku ? `<span class="tag miku">Miku print: ${esc(c.miku)}</span>` : (c.sld ? `<span class="tag miku">Miku-art print</span>` : ""),
      c.qty > 1 ? `<span class="tag">× ${c.qty}</span>` : "",
      `<span class="tag">MV ${c.mv}</span>`
    ].join("");
    const cm = "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(c.name.split(" // ")[0]);
    const sf = (ART[c.name] && ART[c.name].uri) || ("https://scryfall.com/search?q=" + encodeURIComponent('!"' + c.name + '"'));
    const edh = "https://edhrec.com/cards/" + slug(c.name.split(" // ")[0]);
    sheetBody.innerHTML = `
      <div class="detail${ART[c.name] ? "" : " no-art"}">
        ${ART[c.name] ? `<div class="art"><div class="mini-card" data-art="${esc(c.name)}">${miniCard(c)}</div></div>` : ""}
        <div class="info">
          <div style="display:grid;gap:6px">
            <h2 id="sheetTitle">${esc(c.name)}</h2>
            <div class="typeline">${c.cost ? `<span class="cost">${mana(c.cost)}</span> · ` : ""}${esc(c.type)}</div>
            <div class="tags" style="display:flex;flex-wrap:wrap;gap:6px">${tags}</div>
          </div>
          <div class="oracle">${faces}${c.pt ? `<span class="pt">${esc(c.pt)}</span>` : ""}</div>
          ${c.new ? `<div class="swapbox"><span>Replaces <b>${esc(c.cut)}</b> from the stock deck</span><span class="muted">·</span><a href="${cm}" target="_blank" rel="noopener">~${c.eur.toFixed(2)}€ on Cardmarket</a></div>` : ""}
          <div class="note"><h4>Why it's here</h4><p>${esc(c.why)}</p></div>
          ${c.how ? `<div class="note"><h4>How to play it</h4><p>${esc(c.how)}</p></div>` : ""}
          ${c.warn ? `<div class="note warn"><h4>Watch out</h4><p>${esc(c.warn)}</p></div>` : ""}
          ${c.syn && c.syn.length ? `<div class="note"><h4>Works with</h4><div class="syn">${c.syn.map(n => `<button class="chip" type="button" data-card="${esc(n)}">${esc(n.split(" // ")[0])}</button>`).join("")}</div></div>` : ""}
          <div class="ext"><a href="${sf}" target="_blank" rel="noopener">Scryfall</a><a href="${cm}" target="_blank" rel="noopener">Cardmarket</a><a href="${edh}" target="_blank" rel="noopener">EDHREC</a></div>
          <div class="sheet-nav"><button class="btn" type="button" data-card="${esc(prev.name)}">← ${esc(prev.name.split(",")[0].split(" // ")[0])}</button><button class="btn" type="button" data-card="${esc(next.name)}">${esc(next.name.split(",")[0].split(" // ")[0])} →</button></div>
        </div>
      </div>`;
    sheetBody.scrollTop = 0;
    sheet.classList.add("open"); scrim.classList.add("open"); sheet.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    $("#sheetClose").focus({ preventScroll: true });
  }
  function closeSheet(fromRoute) {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open"); scrim.classList.remove("open"); sheet.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    if (!fromRoute) {
      if (sheetFromApp) { sheetFromApp = false; history.back(); }
      else history.replaceState(null, "", "#" + (currentView || "cards"));
    }
  }
  $("#sheetClose").addEventListener("click", () => closeSheet(false));
  scrim.addEventListener("click", () => closeSheet(false));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeSheet(false); });
  // drag the sheet down to close it on phones
  (function () {
    let y0 = null;
    $(".sheet-bar").addEventListener("touchstart", e => { y0 = e.touches[0].clientY; }, { passive: true });
    $(".sheet-bar").addEventListener("touchmove", e => { if (y0 != null) { const d = Math.max(0, e.touches[0].clientY - y0); sheet.style.transform = `translateY(${d}px)`; } }, { passive: true });
    $(".sheet-bar").addEventListener("touchend", e => { const d = y0 == null ? 0 : e.changedTouches[0].clientY - y0; sheet.style.transform = ""; y0 = null; if (d > 90) closeSheet(false); });
  })();

  /* ---------------------------------------------------------------- card list */
  const state = { q: "", role: "all", sort: "role" };
  const roleCount = r => CARDS.filter(c => r === "new" ? c.new : r === "miku" ? c.sld : c.roles.includes(r)).length;
  const chipDefs = [["all", "All", CARDS.length], ["new", "Upgrades", roleCount("new")], ["miku", "Miku art", roleCount("miku")]]
    .concat(ROLES.filter(r => r[0] !== "cmd").map(([k, l]) => [k, l, roleCount(k)]));
  $("#roleChips").innerHTML = chipDefs.map(([k, l, n]) => `<button class="chip" type="button" data-role="${k}" aria-pressed="${k === "all"}">${l} <span class="n">${n}</span></button>`).join("");
  $("#roleChips").addEventListener("click", e => {
    const b = e.target.closest("[data-role]"); if (!b) return;
    state.role = b.dataset.role;
    $$("#roleChips .chip").forEach(x => x.setAttribute("aria-pressed", x === b));
    renderList();
  });
  $("#q").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); renderList(); });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; renderList(); });

  function rowHTML(c) {
    const initials = c.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("");
    const a = ART[c.name];
    const thumbStyle = a && a.crop ? ` style="background-image:url('${esc(a.crop)}')"` : "";
    return `<button class="card-row" type="button" data-card="${esc(c.name)}">
      <span class="thumb" data-thumb="${esc(c.name)}"${thumbStyle}>${a && a.crop ? "" : esc(initials)}</span>
      <span class="body"><span class="title">${esc(c.name)}${c.qty > 1 ? ` <span class="muted mono">×${c.qty}</span>` : ""}</span>
        <span class="sub">${esc(c.type)}</span>
        <span class="tags">${c.new ? '<span class="tag new">NEW</span>' : ""}${c.roles.slice(0, 2).map(r => `<span class="tag">${ROLE_LABEL[r]}</span>`).join("")}</span></span>
      <span class="cost">${mana(c.cost.split(" // ")[0])}</span></button>`;
  }
  function renderList() {
    const q = state.q;
    let list = CARDS.filter(c => {
      if (state.role === "new" && !c.new) return false;
      if (state.role === "miku" && !c.sld) return false;
      if (!["all", "new", "miku"].includes(state.role) && !c.roles.includes(state.role)) return false;
      if (!q) return true;
      return (c.name + " " + (c.text || "") + " " + (c.faces ? c.faces.map(f => f.name + " " + f.text).join(" ") : "") + " " + c.type + " " + (c.miku || "") + " " + c.why).toLowerCase().includes(q);
    });
    let groups = [];
    if (state.sort === "role") {
      for (const [k, l] of ROLES) {
        const g = list.filter(c => c.roles[0] === k);
        if (g.length) groups.push([l, g]);
      }
    } else if (state.sort === "type") {
      for (const t of TYPE_ORDER) { const g = list.filter(c => c.cat === t); if (g.length) groups.push([TYPE_PLURAL[t], g]); }
    } else if (state.sort === "mv") {
      groups = [["", list.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name))]];
    } else {
      groups = [["", list.slice().sort((a, b) => a.name.localeCompare(b.name))]];
    }
    sheetList = groups.flatMap(g => g[1]);
    $("#count").textContent = `${list.length} of ${CARDS.length} cards`;
    $("#cardList").innerHTML = list.length
      ? groups.map(([l, g]) => (l ? `<div class="group-label">${esc(l)} · ${g.length}</div>` : "") + g.map(rowHTML).join("")).join("")
      : `<div class="empty">No cards match. Try a shorter search or pick "All".</div>`;
  }

  /* ---------------------------------------------------------------- setlist + copy */
  function renderSetlist() {
    const commander = CARDS.find(c => c.roles.includes("cmd"));
    const groups = [["Commander", [commander]]].concat(TYPE_ORDER.map(t => [TYPE_PLURAL[t], CARDS.filter(c => c.cat === t && c !== commander)]));
    $("#setlist").innerHTML = groups.filter(g => g[1].length).map(([l, g]) => {
      const n = g.reduce((s, c) => s + c.qty, 0);
      return `<div class="set-group"><h4><span>${l}</span><span>${n}</span></h4>${g.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name)).map(c =>
        `<button class="set-row" type="button" data-card="${esc(c.name)}"><span class="q">${c.qty}</span><span class="nm">${esc(c.name)}</span>${c.new ? '<span class="new-dot">NEW</span>' : ""}</button>`).join("")}</div>`;
    }).join("");
  }
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 1800);
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

  /* ---------------------------------------------------------------- mana curve (equalizer) */
  function renderCurve() {
    const nonland = CARDS.filter(c => c.cat !== "Land");
    const buckets = [0, 1, 2, 3, 4, 5, 6, 7].map(v => nonland.filter(c => (v === 7 ? c.mv >= 7 : c.mv === v)));
    const eq = $("#eq");
    eq.innerHTML = `<div class="eq-grid" aria-hidden="true"><div></div><div></div><div></div><div></div></div>` + buckets.map((b, i) => {
      const n = b.reduce((s, c) => s + c.qty, 0);
      const segs = Array.from({ length: n }, (_, k) => `<i class="eq-seg${k === n - 1 ? " top" : ""}"></i>`).join("");
      return `<div class="eq-col" tabindex="0" data-i="${i}" aria-label="${n} cards at mana value ${i === 7 ? "7 or more" : i}">
        <div class="eq-stack">${segs}<span class="val">${n}</span></div><span class="lab">${i === 7 ? "7+" : i}</span></div>`;
    }).join("");
    let tip = null;
    const show = col => {
      hide();
      const i = +col.dataset.i, b = buckets[i];
      tip = document.createElement("div"); tip.className = "eq-tip";
      tip.innerHTML = `<b>MV ${i === 7 ? "7+" : i} · ${b.length} cards</b><br>${b.map(c => esc(c.name.split(",")[0].split(" // ")[0])).join(", ")}`;
      eq.appendChild(tip);
      const r = col.getBoundingClientRect(), er = eq.getBoundingClientRect();
      const x = Math.min(Math.max(r.left - er.left + r.width / 2, 110), er.width - 110);
      tip.style.left = x + "px"; tip.style.top = "0px";
    };
    const hide = () => { if (tip) { tip.remove(); tip = null; } };
    $$(".eq-col", eq).forEach(col => {
      col.addEventListener("mouseenter", () => show(col)); col.addEventListener("focus", () => show(col));
      col.addEventListener("mouseleave", hide); col.addEventListener("blur", hide);
      col.addEventListener("click", () => show(col));
    });
    // type bars
    const types = TYPE_ORDER.map(t => [TYPE_PLURAL[t], CARDS.filter(c => c.cat === t).reduce((s, c) => s + c.qty, 0)]).filter(t => t[1]);
    const tmax = Math.max(...types.map(t => t[1]));
    $("#typebars").innerHTML = types.map(([l, n]) => `<div class="typebar"><span>${l}</span><span class="bar" style="width:${(n / tmax) * 100}%"></span><span class="num">${n}</span></div>`).join("");
  }

  /* ---------------------------------------------------------------- combo simulators */
  function meter(label, val, max, dead) {
    const w = max ? Math.max(0, Math.min(100, (val / max) * 100)) : 100;
    return `<div class="meter${dead ? " dead" : ""}"><span>${label}</span><b>${val}</b>${max ? `<span class="hp"><i style="width:${w}%"></i></span>` : ""}</div>`;
  }
  function ballistaSim() {
    const el = $("#simBallista");
    let s, timer;
    const reset = () => { clearInterval(timer); s = { counters: 2, life: 40, opp: [40, 40, 40], lifelink: false, pings: 0, log: "Heliod is out. Walking Ballista has 2 counters. Give it lifelink to start." }; draw(); };
    const ping = () => {
      const t = s.opp.findIndex(x => x > 0);
      if (t < 0) return false;
      s.opp[t]--; s.pings++;
      if (s.lifelink) { s.life++; s.log = `Ping ${s.pings}: 1 damage to opponent ${t + 1}. Lifelink +1 life, Heliod puts the counter back.`; }
      else { s.counters--; s.log = `Ping without lifelink: Ballista loses a counter and nothing comes back.`; }
      if (s.opp.every(x => x <= 0)) { s.log = `${s.pings} pings. Every opponent is dead.`; clearInterval(timer); }
      return true;
    };
    function draw() {
      const done = s.opp.every(x => x <= 0);
      el.innerHTML = `<div class="sim-meters">${meter("Ballista counters", s.counters)}${meter("Your life", s.life)}${s.opp.map((o, i) => meter("Opponent " + (i + 1), o, 40, o <= 0)).join("")}</div>
        <div class="sim-log" aria-live="polite">${esc(s.log)}</div>
        <div class="btn-row">
          <button class="btn${s.lifelink ? "" : " primary"}" type="button" data-a="ll" ${s.lifelink ? "disabled" : ""}>${s.lifelink ? "Lifelink on" : "Pay " + mana("{1}{W}") + ": lifelink"}</button>
          <button class="btn" type="button" data-a="ping" ${done || s.counters < 1 ? "disabled" : ""}>Ping once</button>
          <button class="btn pink" type="button" data-a="all" ${done || !s.lifelink ? "disabled" : ""}>Loop until the table is dead</button>
          <button class="btn" type="button" data-a="reset">Reset</button></div>`;
    }
    el.addEventListener("click", e => {
      const a = e.target.closest("[data-a]"); if (!a) return;
      const k = a.dataset.a;
      if (k === "ll") { s.lifelink = true; s.log = "Ballista has lifelink until end of turn. Now every ping gains 1 life."; }
      if (k === "ping") { if (s.counters < 1) return; ping(); }
      if (k === "all") {
        clearInterval(timer);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduce) { while (ping()); draw(); return; }
        timer = setInterval(() => { for (let i = 0; i < 3; i++) ping(); draw(); if (s.opp.every(x => x <= 0)) clearInterval(timer); }, 30);
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
    let s, timer;
    const reset = (eng = (s && s.eng) || "heliod") => { clearInterval(timer); s = { eng, feeder: 2, life: 40, team: 0, loops: 0, opp: [40, 40, 40], log: `Spike Feeder has 2 counters. Engine: ${ENG[eng]}. Aetherflux Reservoir is out.` }; draw(); };
    const loop = () => {
      const gain = s.eng === "cleric" ? 3 : 2;
      s.life += gain; s.loops++;
      if (s.eng === "thune") s.team++;
      s.log = `Loop ${s.loops}: remove a counter, gain ${gain}. ${ENG[s.eng]} puts ${s.eng === "thune" ? "a counter on every creature" : "the counter back on Feeder"}.`;
    };
    function draw() {
      const alive = s.opp.some(x => x > 0);
      el.innerHTML = `<div class="chips" role="group" aria-label="Engine" style="margin:0;padding:0">${Object.entries(ENG).map(([k, l]) => `<button class="chip" type="button" data-e="${k}" aria-pressed="${s.eng === k}">${l}</button>`).join("")}</div>
        <div class="sim-meters">${meter("Feeder counters", s.feeder)}${meter("Your life", s.life)}${s.eng === "thune" ? meter("Team bonus +X/+X", s.team) : ""}${s.opp.map((o, i) => meter("Opponent " + (i + 1), o, 40, o <= 0)).join("")}</div>
        <div class="sim-log" aria-live="polite">${esc(s.log)}</div>
        <div class="btn-row">
          <button class="btn" type="button" data-a="one">Loop once</button>
          <button class="btn primary" type="button" data-a="many">Loop 25 times</button>
          <button class="btn pink" type="button" data-a="flux" ${s.life > 50 && alive ? "" : "disabled"}>Aetherflux: pay 50</button>
          <button class="btn" type="button" data-a="reset">Reset</button></div>`;
    }
    el.addEventListener("click", e => {
      const eb = e.target.closest("[data-e]"); if (eb) return reset(eb.dataset.e);
      const a = e.target.closest("[data-a]"); if (!a) return;
      const k = a.dataset.a;
      if (k === "one") loop();
      if (k === "many") {
        clearInterval(timer);
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { for (let i = 0; i < 25; i++) loop(); draw(); return; }
        let n = 0; timer = setInterval(() => { loop(); draw(); if (++n >= 25) clearInterval(timer); }, 40); return;
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
  function calc() {
    const v = id => Math.max(0, parseInt($(id).value, 10) || 0);
    const N = Math.max(1, v("#cN")), P = v("#cP"), B = Math.max(v("#cB"), P), L = Math.max(1, v("#cL"));
    const base = N * P;
    const rows = [
      ["Just attack", 0, base, ""],
      ["Beastmaster Ascension", 3, N >= 7 ? N * (P + 5) : base, N >= 7 ? "" : "needs 7 attackers"],
      ["Triumph of the Hordes", 4, N * (P + 1), "poison"],
      ["Overwhelming Stampede", 5, N * (P + B), ""],
      ["Jazal Goldmane, 1 activation", 5, N * (P + N), "Jazal must attack"],
      ["Return of the Wildspeaker", 5, N * (P + 3), "non-Humans only"],
      ["Mirror Entity, X=6", 6, N * 6, "counters add on top"],
      ["Craterhoof Behemoth", 8, base + 5 + (N + 1) * (N + 1), "Hoof attacks too"],
      ["Finale of Devastation, X=10", 12, N * (P + 10), "plus a free creature"]
    ];
    $("#calcBody").innerHTML = rows.map(([name, m, dmg, note]) => {
      let kills;
      if (note === "poison") kills = Math.min(3, Math.floor(dmg / 10));
      else kills = Math.min(3, Math.floor(dmg / L));
      const res = kills >= 3 ? `<span class="verdict win">Kills the table</span>` : kills > 0 ? `<span class="verdict win">Kills ${kills} of 3</span>` : `<span class="verdict no">Not lethal</span>`;
      const card = name.split(",")[0].replace(" Behemoth", " Behemoth");
      const nm = byName.has(card) ? `<button class="inline-card" type="button" data-card="${esc(card)}">${esc(name)}</button>` : esc(name);
      return `<tr><td>${nm}${note && note !== "poison" ? `<br><span class="muted" style="font-size:.8rem">${note}</span>` : note === "poison" ? `<br><span class="muted" style="font-size:.8rem">${dmg} poison total</span>` : ""}</td><td class="num">${m || "–"}</td><td class="num">${note === "poison" ? "☠ " + dmg : dmg}</td><td>${res}</td></tr>`;
    }).join("");
  }
  $$(".calc-inputs input").forEach(i => i.addEventListener("input", calc));
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-step]"); if (!b) return;
    const [k, d] = b.dataset.step.split(":");
    const inp = $({ n: "#cN", p: "#cP", b: "#cB", l: "#cL" }[k]);
    inp.value = Math.max(+inp.min, Math.min(+inp.max, (parseInt(inp.value, 10) || 0) + +d));
    calc();
  });

  /* ---------------------------------------------------------------- hand trainer */
  const LIBRARY = CARDS.filter(c => !c.roles.includes("cmd")).flatMap(c => Array(c.qty).fill(c));
  let deck = [], hand = [], mulls = 0;
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function newHand(isMull) {
    mulls = isMull ? mulls + 1 : 0;
    deck = shuffle(LIBRARY.slice()); hand = deck.splice(0, 7); drawHand();
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
    el.innerHTML = `<b>${head}</b><span>${why}${botTxt}</span>${hand.length > 7 ? `<span class="muted">Drew ${hand.length - 7} since the opener.</span>` : ""}`;
  }
  function drawHand() {
    $("#hand").innerHTML = hand.map(c => `<button class="slot" type="button" data-card="${esc(c.name)}"><div class="mini-card" data-art="${esc(c.name)}">${miniCard(c)}</div></button>`).join("");
    verdict();
  }
  $("#drawHand").addEventListener("click", () => newHand(false));
  $("#mullHand").addEventListener("click", () => newHand(true));
  $("#drawOne").addEventListener("click", () => { if (deck.length) { hand.push(deck.shift()); drawHand(); } });

  /* ---------------------------------------------------------------- swaps table */
  function renderSwaps() {
    const order = ["Overwhelming Stampede", "Beastmaster Ascension", "Intangible Virtue", "Mirror Entity", "Beast Within", "Adeline, Resplendent Cathar", "Spike Feeder", "Jazal Goldmane", "Elspeth, Sun's Champion", "Esika's Chariot", "Arcane Signet", "Elvish Mystic", "Crashing Drawbridge", "Return of the Wildspeaker", "Generous Gift", "Razorverge Thicket", "Heliod, Sun-Crowned", "Walking Ballista", "Cathars' Crusade", "Hero of Bladehold", "Triumph of the Hordes", "Craterhoof Behemoth"];
    const tiers = { 0: "Cheap core · ~25€", 16: "The infinite-damage combo · ~24€", 18: "Power · ~12€", 20: "Splurge · ~33€" };
    let total = 0;
    $("#swapBody").innerHTML = order.map((n, i) => {
      const c = byName.get(n); total += c.eur;
      const cm = "https://www.cardmarket.com/en/Magic/Products/Search?searchString=" + encodeURIComponent(n);
      return (tiers[i] ? `<tr><th colspan="4">${tiers[i]}</th></tr>` : "") +
        `<tr><td class="num">${i + 1}</td><td class="muted">${esc(c.cut)}</td><td><button class="inline-card" type="button" data-card="${esc(n)}">${esc(n)}</button></td><td class="num"><a href="${cm}" target="_blank" rel="noopener">${c.eur.toFixed(2)}</a></td></tr>`;
    }).join("") + `<tr><td></td><td></td><td><b>Total, all 22</b></td><td class="num"><b>~${Math.round(total)}</b></td></tr>`;
  }

  /* ---------------------------------------------------------------- theme */
  const root = document.documentElement;
  const savedTheme = store.get("mikuWiki.theme");
  if (savedTheme === "dark" || savedTheme === "light") root.dataset.theme = savedTheme;
  $("#themeBtn").addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("mikuWiki.theme", root.dataset.theme);
  });

  /* ---------------------------------------------------------------- boot */
  linkMentions();
  manaText(document.querySelector("main"));
  renderSetlist();
  renderCurve();
  renderList();
  renderSwaps();
  ballistaSim();
  feederSim();
  calc();
  newHand(false);
  route();
  paintArt();
  loadArt();
})();
