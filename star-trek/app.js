/* Star Trek 2HG page: the card sheet, the all-cards explorer, practice pools with the build timer,
   and the contents bar. Card data comes from cards.js (window.TRK). */
(() => {
  "use strict";
  const CARDS = (window.TRK || []).map((a, i) => ({
    i, name: a[0], cost: a[1], type: a[2], text: a[3], pt: a[4], rar: a[5], cols: a[6], sec: a[7],
    g: a[8], z: a[9], tags: a[10] ? a[10].split(",") : [], note: a[11], mv: a[12], num: a[13]
  }));
  const BY = new Map(CARDS.map(c => [c.name, c]));
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const fold = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  CARDS.forEach(c => {
    c.body = /Creature|Spacecraft/.test(c.type);
    c.land = c.sec === "L";
    c.hybrid = c.cost.includes("/");
    c.removal = c.tags.some(t => /^(removal|sweeper)/.test(t));
    c.hay = fold([c.name, c.type, c.text, c.note].join(" "));
  });

  // ---- mana symbols, grades, rarity
  function pip(t) {
    if (t.includes("/")) return `<i class="ms ms-h ms-${t.replace("/", "").toLowerCase()}"></i>`;
    if (/^\d+$/.test(t)) return `<i class="ms ms-n">${t}</i>`;
    if (t === "T") return `<i class="ms ms-t">↷</i>`;
    return `<i class="ms ms-${t.toLowerCase()}">${t}</i>`;
  }
  const label = t => t.includes("/") ? t.replace("/", " ou ") : t === "T" ? "tap" : t;
  function pips(run) {
    const toks = [...run.matchAll(/\{([^}]+)\}/g)].map(m => m[1]);
    return `<span class="mc" role="img" aria-label="${esc(toks.map(label).join(" "))}">${toks.map(pip).join("")}</span>`;
  }
  const withPips = s => esc(s).replace(/(?:\{[^}\s]+\})+/g, pips);
  const oracle = s => s.split("\n").map(l => `<p>${withPips(l).replace(/\([^)]*\)/g, m => `<i class="rm">${m}</i>`)}</p>`).join("");
  const gcls = g => g >= 4 ? "g40" : g >= 3.5 ? "g35" : g >= 3 ? "g30" : g >= 2.5 ? "g25" : g >= 2 ? "g20" : "g0";
  const gfmt = g => g.toFixed(1);
  const badge = g => `<b class="gb ${gcls(g)}">${gfmt(g)}</b>`;
  const RAR = { C: "Commune", U: "Unco", R: "Rare", M: "Mythique", L: "Commune, Planet" };
  const rarOf = c => c.rar === "L" ? "C" : c.rar;
  const rarTag = c => `<span class="rar r-${rarOf(c)}" title="${RAR[c.rar]}">${rarOf(c)}</span>`;
  const SEC_COL = { W: "#f8f3d9", U: "#a9d9f2", B: "#c4bab6", R: "#f4a98e", G: "#9fd3ad", M: "#e8b46f", C: "#d6d0cb", L: "#c79fd6" };

  // ---- the card sheet
  const sheet = $("#sheet"), shBody = $("#sh-body");
  function openCard(c, blind) {
    shBody.innerHTML = `<div class="sh-band" style="--cc:${SEC_COL[c.sec]}"><span>TRK ${c.num}</span><span>${RAR[c.rar]}</span></div>
      <div class="sh-in">
      <div class="sh-title"><h3 id="sh-name">${esc(c.name)}</h3>${c.cost ? pips(c.cost) : ""}</div>
      <p class="sh-type">${esc(c.type)}${c.pt ? ` · <b>${esc(c.pt)}</b>` : ""}</p>
      <div class="sh-text" lang="en">${oracle(c.text)}</div>
      ${blind ? `<p class="sh-blind">Mes notes sont cachées pendant l'entraînement, coche "Montrer mes notes" pour les voir</p>` :
        `<div class="sh-gr"><div>Ma note 2HG ${badge(c.g)}</div><div>MTGAZone ${c.z == null ? `<b class="gb">pas noté</b>` : badge(c.z)}</div></div>
      <p class="sh-note">${withPips(c.note)}</p>`}
      <a class="sh-sf" href="https://scryfall.com/search?q=${encodeURIComponent(`!"${c.name}" set:trk`)}" target="_blank" rel="noopener">Voir la carte sur Scryfall ↗</a>
      </div>`;
    if (!sheet.open) { if (sheet.showModal) sheet.showModal(); else sheet.setAttribute("open", ""); }
    sheet.scrollTop = 0;
  }
  sheet.addEventListener("click", e => { if (e.target === sheet) sheet.close(); });
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-c]");
    if (!a) return;
    const c = BY.get(a.dataset.c);
    if (!c) return;
    e.preventDefault();
    openCard(c, !!a.closest("#pr-pool") && !$("#pr-grades").checked);
  });

  // ---- all cards
  const ex = { q: "", col: "", rar: "", rem: false, sort: "g", shown: 40 };
  const byName = (a, b) => a.name.localeCompare(b.name, "en");
  const SORTS = {
    g: (a, b) => b.g - a.g || byName(a, b),
    z: (a, b) => (b.z ?? -1) - (a.z ?? -1) || b.g - a.g || byName(a, b),
    cmc: (a, b) => a.land - b.land || a.mv - b.mv || byName(a, b),
    n: byName
  };
  function exList() {
    const words = fold(ex.q).split(/\s+/).filter(Boolean);
    return CARDS.filter(c => (!ex.col || c.sec === ex.col) && (!ex.rar || rarOf(c) === ex.rar) && (!ex.rem || c.removal) && words.every(w => c.hay.includes(w))).sort(SORTS[ex.sort]);
  }
  const row = c => `<li><button type="button" class="cr" data-c="${esc(c.name)}">${badge(c.g)}<span class="cr-m">
    <span class="cr-top"><b class="cr-n">${esc(c.name)}</b>${c.cost ? pips(c.cost) : ""}</span>
    <span class="cr-sub">${rarTag(c)} ${esc(c.type)}${c.pt ? " · " + esc(c.pt) : ""}${c.z != null ? " · MTGAZone " + gfmt(c.z) : ""}</span>
    <span class="cr-note">${withPips(c.note)}</span></span></button></li>`;
  function exRender() {
    const list = exList(), more = $("#ex-more");
    $("#ex-count").textContent = list.length === 1 ? "1 carte" : `${list.length} cartes`;
    $("#ex-list").innerHTML = list.slice(0, ex.shown).map(row).join("") || `<li class="none">Y a rien avec ces filtres</li>`;
    more.hidden = list.length <= ex.shown;
    more.textContent = `Voir les ${list.length - ex.shown} autres`;
  }
  if ($("#ex")) {
    let t = 0;
    $("#ex-q").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => { ex.q = e.target.value; ex.shown = 40; exRender(); }, 120); });
    for (const [id, key] of [["#ex-col", "col"], ["#ex-rar", "rar"]]) {
      $(id).addEventListener("click", e => {
        const b = e.target.closest("button");
        if (!b) return;
        $$("button", $(id)).forEach(x => x.setAttribute("aria-pressed", String(x === b)));
        ex[key] = b.dataset.v; ex.shown = 40; exRender();
      });
    }
    $("#ex-rem").addEventListener("change", e => { ex.rem = e.target.checked; ex.shown = 40; exRender(); });
    $("#ex-sort").addEventListener("change", e => { ex.sort = e.target.value; ex.shown = 40; exRender(); });
    $("#ex-more").addEventListener("click", () => { ex.shown += 60; exRender(); });
    exRender();
  }

  // ---- practice pools: the same booster model as our Python sims
  function rng(seed) {
    let s = seed | 0;
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const BYR = { C: [], U: [], R: [], M: [], L: [] };
  CARDS.forEach(c => BYR[c.rar].push(c));
  const one = (r, a) => a[Math.floor(r() * a.length)];
  function sample(r, a, n) {
    const b = a.slice();
    for (let i = 0; i < n; i++) { const j = i + Math.floor(r() * (b.length - i)); [b[i], b[j]] = [b[j], b[i]]; }
    return b.slice(0, n);
  }
  const rareSlot = r => r() < 0.13 ? one(r, BYR.M) : one(r, BYR.R);
  function booster(r) {
    const p = sample(r, BYR.C, 7).concat(sample(r, BYR.U, 3));
    p.push(rareSlot(r));
    for (const [pu, pr, pm] of [[0.576, 0.183, 0.03], [0.384, 0.08, 0.015]]) { // wildcard, then foil
      const u = r();
      p.push(u < pm ? one(r, BYR.M) : u < pm + pr ? one(r, BYR.R) : u < pm + pr + pu ? one(r, BYR.U) : one(r, BYR.C));
    }
    if (r() < 0.5) p.push(one(r, BYR.L));
    return p;
  }
  function makePool(seed) {
    const r = rng(Math.imul(seed, 2654435761) ^ 0x5eed);
    let p = [];
    for (let i = 0; i < 8; i++) p = p.concat(booster(r));
    const promo = rareSlot(r);
    return { cards: p.concat(promo), promo };
  }

  // a split = 2 decks of 2 colours; a deck's value = its best 23 cards with at least 14 bodies
  const PAIRS = ["WU", "WB", "WR", "WG", "UB", "UR", "UG", "BR", "BG", "RG"];
  const NAMES = { W: "white", U: "blue", B: "black", R: "red", G: "green" };
  const pairName = p => NAMES[p[0]] + "-" + NAMES[p[1]];
  const pairPips = p => `<span class="mc" aria-hidden="true">${pip(p[0])}${pip(p[1])}</span>`;
  const castable = (c, pair) => !c.land && (!c.cols || (c.hybrid ? [...c.cols].some(x => pair.includes(x)) : [...c.cols].every(x => pair.includes(x))));
  const byG = (a, b) => b.g - a.g;
  function deckValue(cards) {
    const bodies = cards.filter(c => c.body).sort(byG), others = cards.filter(c => !c.body);
    const takeC = bodies.slice(0, 14), rest = bodies.slice(14).concat(others).sort(byG).slice(0, 23 - takeC.length);
    const sum = a => a.reduce((s, c) => s + c.g, 0);
    return { v: sum(takeC) + sum(rest) - 1.5 * Math.max(0, 14 - takeC.length) - Math.max(0, 23 - takeC.length - rest.length), picks: takeC.concat(rest) };
  }
  function splitFor(pool, A, B) {
    const dA = [], dB = [], flex = [];
    for (const c of pool) {
      const a = castable(c, A), b = castable(c, B);
      if (a && b) flex.push(c); else if (a) dA.push(c); else if (b) dB.push(c);
    }
    flex.sort(byG); // cards both decks can play go where they add the most
    for (const c of flex) (deckValue(dA.concat(c)).v - deckValue(dA).v >= deckValue(dB.concat(c)).v - deckValue(dB).v ? dA : dB).push(c);
    const a = deckValue(dA), b = deckValue(dB);
    return { A, B, va: a.v, vb: b.v, v: a.v + b.v, pa: a.picks, pb: b.picks };
  }
  function allSplits(pool) {
    const out = [];
    for (let i = 0; i < PAIRS.length; i++) for (let j = i + 1; j < PAIRS.length; j++) out.push(splitFor(pool, PAIRS[i], PAIRS[j]));
    return out.sort((x, y) => y.v - x.v);
  }

  const GROUPS = [["W", "White"], ["U", "Blue"], ["B", "Black"], ["R", "Red"], ["G", "Green"], ["M", "Multi et hybride"], ["C", "Incolore"], ["L", "Lands"]];
  const secPip = k => "WUBRG".includes(k) ? `<span class="mc" aria-hidden="true">${pip(k)}</span>` : "";
  let cur = null; // { seed, pool, promo, splits }
  function chips(list, show, promo) {
    const n = new Map();
    list.forEach(c => n.set(c, (n.get(c) || 0) + 1));
    const sort = show ? (a, b) => b.g - a.g || a.mv - b.mv || byName(a, b) : (a, b) => a.mv - b.mv || byName(a, b);
    return [...n.keys()].sort(sort).map(c => `<button type="button" class="pc${c === promo ? " promo" : ""}" data-c="${esc(c.name)}"${c === promo ? ' title="La promo du pack"' : ""}>${n.get(c) > 1 ? `<span class="x2">${n.get(c)}×</span>` : ""}<span>${esc(c.name)}</span>${c.cost ? pips(c.cost) : ""}${show ? badge(c.g) : ""}</button>`).join("");
  }
  function renderPool() {
    if (!cur) return;
    const show = $("#pr-grades").checked, p = cur.pool;
    const spells = p.filter(c => !c.land), rares = spells.filter(c => c.rar === "R" || c.rar === "M").length, planets = p.filter(c => c.rar === "L").length;
    $("#pr-pool").innerHTML = `<p class="pool-sum"><b>Pool n° ${cur.seed}</b> · ${p.length} cartes : ${spells.length} sorts, ${rares} rares et mythiques, ${planets} Planet${planets > 1 ? "s" : ""}. La promo du pack est entourée</p>` +
      GROUPS.map(([k, name]) => {
        const cs = p.filter(c => c.sec === k);
        return cs.length ? `<div class="pool-g"><h4>${secPip(k)}<b>${name}</b> ${cs.length}</h4><div class="pool-cards">${chips(cs, show, cur.promo)}</div></div>` : "";
      }).join("");
  }
  function openPool(seed) {
    const { cards, promo } = makePool(seed);
    cur = { seed, pool: cards, promo, splits: allSplits(cards.filter(c => !c.land)) };
    $("#pr-seed").value = seed;
    renderPool();
    $("#pr-split").hidden = false;
    $("#pr-res").innerHTML = "";
    $("#pr-sim").hidden = false;
    renderYou();
  }
  function renderYou() {
    const a = $("#pr-a").value, b = $("#pr-b").value, out = $("#pr-you");
    if (!cur || !a || !b) { out.textContent = ""; return; }
    if (a === b) { out.textContent = "Choisis 2 paires différentes"; return; }
    const s = cur.splits.find(x => (x.A === a && x.B === b) || (x.A === b && x.B === a)), best = cur.splits[0];
    const gap = best.v - s.v, rank = 1 + cur.splits.filter(x => x.v > s.v + 1e-9).length;
    out.innerHTML = `Ton split : <b>${s.v.toFixed(1)}</b> points. ` + (gap < 0.05 ? "Même note que le best du sim, gg" :
      `${rank}e sur 45, à ${gap.toFixed(1)} du best (${(gap / 46).toFixed(2)} par carte). ${gap / 46 < 0.05 ? "Autant dire pareil, c'est la curve et le removal qui décident" : "Le sim trouve mieux, check son split"}`);
  }
  function deckBlock(pair, picks, v) {
    const bodies = picks.filter(c => c.body).length, rem = picks.filter(c => c.removal).length;
    return `<div class="res-deck"><h4>${pairPips(pair)} ${pairName(pair)} <span class="v">${v.toFixed(1)}</span></h4>
      <p>${picks.length} cartes, ${bodies} créatures ou Spacecraft, ${rem} removal. Moyenne ${(v / 23).toFixed(2)} par carte</p>
      <div class="pool-cards">${chips(picks, true, null)}</div></div>`;
  }
  function renderSim() {
    const best = cur.splits[0], used = best.A + best.B;
    const dropped = [..."WUBRG"].filter(x => !used.includes(x)).map(x => NAMES[x]);
    const shared = [...best.A].filter(x => best.B.includes(x)).map(x => NAMES[x]);
    const ties = cur.splits.filter(x => best.v - x.v < 0.05).length;
    $("#pr-res").innerHTML = `<div class="res"><p>Le best du sim : <b>${pairName(best.A)} + ${pairName(best.B)}</b>, ${best.v.toFixed(1)} points. ` +
      (shared.length ? `Les 2 decks partagent le ${shared.join(" et le ")}. ` : "") + `Couleur${dropped.length > 1 ? "s" : ""} droppée${dropped.length > 1 ? "s" : ""} : ${dropped.join(" et ")}</p>
      ${ties > 1 ? `<p>${ties} splits font la même note, donc là c'est la curve, le removal par deck et le plan d'équipe qui tranchent</p>` : ""}
      <div class="res-decks">${deckBlock(best.A, best.pa, best.va)}${deckBlock(best.B, best.pb, best.vb)}</div>
      <p><b>Les suivants</b></p><ol class="alts">${cur.splits.slice(1, 4).map(s => `<li>${pairName(s.A)} + ${pairName(s.B)} : ${s.v.toFixed(1)} (${best.v - s.v < 0.05 ? "pareil" : "−" + (best.v - s.v).toFixed(1)})</li>`).join("")}</ol></div>`;
  }
  if ($("#pr")) {
    const opts = `<option value="">Choisis…</option>` + PAIRS.map(p => `<option value="${p}">${p} · ${pairName(p)}</option>`).join("");
    $("#pr-a").innerHTML = opts; $("#pr-b").innerHTML = opts;
    $("#pr-a").addEventListener("change", renderYou);
    $("#pr-b").addEventListener("change", renderYou);
    $("#pr-open").addEventListener("click", () => openPool(1 + Math.floor(Math.random() * 99999)));
    $("#pr-form").addEventListener("submit", e => {
      e.preventDefault();
      const n = parseInt($("#pr-seed").value, 10);
      if (n > 0) openPool(n); else $("#pr-seed").focus();
    });
    $("#pr-grades").addEventListener("change", renderPool);
    $("#pr-sim").addEventListener("click", () => { if (cur) renderSim(); });

    // the 40-minute build timer, with the phases of our build script
    const PH = [[0, "On ouvre et on trie"], [5, "Une colonne par couleur, on compte les jouables"], [12, "Le split, le primary décide"], [16, "Chacun build son deck"], [30, "Swap et check"], [36, "Decklist, sleeves, shuffle"]];
    const TOTAL = 40 * 60000, box = $("#pr-timer"), clock = $("#t-clock"), phase = $("#t-phase"), fill = $("#t-fill"), go = $("#t-go");
    let left = TOTAL, endAt = 0, tick = 0;
    PH.slice(1).forEach(([m]) => { const i = document.createElement("i"); i.className = "tick"; i.style.left = (100 * m / 40) + "%"; $(".t-bar", box).append(i); });
    const fmt = ms => { const s = Math.ceil(ms / 1000); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };
    function draw() {
      const now = endAt ? Math.max(0, endAt - Date.now()) : left, el = (TOTAL - now) / 60000;
      clock.textContent = fmt(now);
      let k = 0;
      PH.forEach((p, i) => { if (el >= p[0]) k = i; });
      const txt = now <= 0 ? "Temps écoulé, on montre les decks" : `${PH[k][0]}-${PH[k + 1] ? PH[k + 1][0] : 40} min · ${PH[k][1]}`;
      if (phase.textContent !== txt) phase.textContent = txt;
      fill.style.width = (100 * (TOTAL - now) / TOTAL) + "%";
      box.classList.toggle("done", now <= 0);
      if (endAt && now <= 0) { clearInterval(tick); endAt = 0; left = 0; box.classList.remove("run"); go.textContent = "Lancer le timer"; }
    }
    go.addEventListener("click", () => {
      if (endAt) { left = Math.max(0, endAt - Date.now()); endAt = 0; clearInterval(tick); box.classList.remove("run"); go.textContent = "Reprendre"; draw(); return; }
      if (left <= 0) left = TOTAL;
      endAt = Date.now() + left; tick = setInterval(draw, 250); box.classList.add("run"); go.textContent = "Pause"; draw();
    });
    $("#t-reset").addEventListener("click", () => { clearInterval(tick); endAt = 0; left = TOTAL; box.classList.remove("run"); go.textContent = "Lancer le timer"; draw(); });
    draw();
  }

  // ---- contents: highlight the section on screen, keep its chip visible on phones
  const toc = $("#toc"), links = $$("#toc a"), secs = links.map(a => document.getElementById(a.getAttribute("href").slice(1)));
  let on = -1, raf = 0;
  function spy() {
    raf = 0;
    const y = innerHeight * 0.3;
    let k = 0;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= y) k = i; });
    if (k === on) return;
    on = k;
    links.forEach((a, i) => a.setAttribute("aria-current", String(i === k)));
    if (toc.scrollWidth > toc.clientWidth + 2) {
      const a = links[k], l = a.offsetLeft - 16, r = a.offsetLeft + a.offsetWidth + 16;
      if (l < toc.scrollLeft || r > toc.scrollLeft + toc.clientWidth) toc.scrollTo({ left: l, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
  }
  addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(spy); }, { passive: true });
  addEventListener("resize", () => { on = -1; spy(); });
  spy();

  window.TRKPage = { openCard, makePool, allSplits, splitFor, deckValue, cards: CARDS }; // for the screen test
})();
