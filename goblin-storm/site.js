/* Goblin Storm: settings that turn the shared deck-site shell (../miku/app.js) into the Goblin Storm
   site (Secret Lair Commander Deck: Goblin Storm, led by Zada, Hedron Grinder), the game's hero
   (MK_SITE), and this deck's tools: the Zada copy counter, the storm counter, the play checklist,
   the quiz and the price list. The printable proxies are proxies.html. */
(function () {
  "use strict";
  window.MK_SITE = {
    key: "gstormWiki", hero: "goblin-storm", defaultHero: "goblin-storm",
    title: "Take Goblin Storm to a four-player pod",
    lede: "A real Commander game with Zada's copies, storm and the Goblin swarm, against bots dealt at random. The Coach button (the light bulb) counts Zada's copies and your storm, and shows the turn checklist."
  };
  window.DECK_SITE = {
    key: "gstormWiki", short: "Goblin Storm", gameBase: "../miku/game/", sldLabel: "Secret Lair art",
    cards: window.GSTORM_CARDS, wiki: window.GSTORM_WIKI, guide: window.GSTORM_GUIDE,
    glossary: window.GSTORM_GLOSSARY, cuts: window.GSTORM_CUTS, faq: window.GSTORM_FAQ,
    roles: [
      ["cmd", "Commander"], ["zada", "Zada spells"], ["storm", "Storm"], ["ritual", "Mana and rituals"], ["tokens", "Goblin makers"],
      ["lord", "Lords and haste"], ["drain", "Sac outlets and drains"], ["draw", "Card advantage"], ["tutor", "Tutors"],
      ["removal", "Interaction"], ["protect", "Protection"], ["ramp", "Cheats"], ["utility", "Utility"], ["land", "Lands"]
    ],
    colors: [["R", "red", "Mountain"]],
    pipNote: "Zada asks for {3}{R}. Every colored symbol in the deck is red.",
    oddsNote: "Zada is in the command zone, so these odds are for the 99. Goblin Matron counts as any Goblin.",
    oddsGroups: ({ is, names }) => [
      { id: "l2", label: "At least 2 lands", lands: 2 },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "zada", label: "A spell that Zada copies", f: is("zada") },
      { id: "tokens", label: "A Goblin token maker", f: is("tokens") },
      { id: "ritual", label: "A ritual or mana card", f: is("ritual") },
      { id: "storm", label: "A storm card", f: is("storm") },
      { id: "krenko", label: "Krenko, Mob Boss or Goblin Matron", f: names(["Krenko, Mob Boss", "Goblin Matron"]) },
      { id: "loop", label: "Storm-Kiln Artist and Haze of Rage", both: [["Storm-Kiln Artist"], ["Haze of Rage"]] }
    ],
    // tools/sim/run.js, 20 Oct 2026: 400 games against three random precons (--decks goblin-storm,random2,random2,random2 --seed 11 --first random)
    // and 400 against three random Bracket 4 decks (random4, --seed 12). Wins at tables that included each deck.
    botSim: { precon: { games: 400, wins: 65, rounds: 12.7, medianWin: 11, decks: [{ name: "Ghired", games: 240, wins: 42 }, { name: "Wilhelt", games: 240, wins: 42 }, { name: "Kaalia", games: 240, wins: 40 }, { name: "Lathril", games: 240, wins: 38 }, { name: "Isperia", games: 240, wins: 33 }] }, b4: { games: 400, wins: 41, rounds: 9.2, medianWin: 10, decks: [{ name: "Brago", games: 109, wins: 22 }, { name: "Ur-Dragon", games: 109, wins: 19 }, { name: "Talrand", games: 109, wins: 17 }, { name: "Brago 1500", games: 110, wins: 16 }, { name: "Etrata B4", games: 109, wins: 15 }, { name: "Krenko", games: 108, wins: 9 }, { name: "Brago v2", games: 110, wins: 8 }, { name: "Edgar", games: 109, wins: 5 }, { name: "Corrupted Etrata", games: 109, wins: 5 }, { name: "Ghalta", games: 109, wins: 4 }, { name: "Azusa", games: 109, wins: 3 }] } },
    widgets: api => ({
      zadaCalc: el => zadaCalc(el, api), stormCalc: el => stormCalc(el, api),
      playChecklist: el => playChecklist(el, api), quiz: el => quiz(el, api), buyList: el => buyList(el, api)
    })
  };

  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ================================================================ Zada copy counter */
  const ZSPELLS = [
    { name: "Expedite", out: n => `${n} cards and haste on every creature` },
    { name: "Crimson Wisps", out: n => `${n} cards and haste on every creature` },
    { name: "Renegade Tactics", out: n => `${n} cards` },
    { name: "Ancestors' Aid", out: n => `${n} Treasures, +2/+0 and first strike on every creature` },
    { name: "Wild Ride", out: n => `+3/+0 and haste on every creature` },
    { name: "Fists of Flame", out: n => `${n} cards; the last creature gets +${n}/+0 and trample, the first +1/+0 (each copy counts the cards drawn so far)` },
    { name: "Witch's Mark", out: n => `up to ${n} loots (discard one, draw two each) and a Wicked Role on every creature` },
    { name: "Daring Discovery", out: n => `${n} discovers: ${n} free spells with mana value 4 or less` }
  ];
  function zadaCalc(el, A) {
    const { $, esc, stepperHTML, numIn, bump, linkMentions } = A;
    let pick = 0;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>What does Zada make?</b></div>
      <div class="chips wrap" role="group" aria-label="Spell">${ZSPELLS.map((s, i) => `<button class="chip" type="button" data-z="${i}" aria-pressed="false">${esc(s.name)}</button>`).join("")}</div>
      <div class="w-fields">${stepperHTML("n", "Other creatures you control", 6, 0, 60)}${stepperHTML("fh", "Frontline Heroism (0 or 1)", 0, 0, 1)}</div>
      <div class="w-fields">${stepperHTML("rt", "Roaming Throne naming Goblin (0 or 1)", 0, 0, 1)}${stepperHTML("ka", "Storm-Kiln Artist out (0 or 1)", 0, 0, 1)}</div>
      <div class="w-out">
        <div><b data-o="copies">0</b><span>copies, plus the original on Zada</span></div>
        <div><b data-o="tre">0</b><span>Treasures from Storm-Kiln Artist</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>
      <p class="muted small">Frontline Heroism's Soldier is made first, so Zada counts it. Roaming Throne makes Zada's trigger happen twice. Copies don't raise the storm count.</p>`;
    function run() {
      el.querySelectorAll("[data-z]").forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.z === pick)));
      const fh = numIn(el, "fh"), n = numIn(el, "n") + fh, rt = numIn(el, "rt"), ka = numIn(el, "ka");
      const copies = n * (rt ? 2 : 1) + fh;
      const total = copies + 1;
      bump($('[data-o="copies"]', el), copies);
      bump($('[data-o="tre"]', el), ka ? total : 0);
      const s = ZSPELLS[pick];
      $('[data-o="v"]', el).innerHTML = `<i-c>${esc(s.name)}</i-c> on Zada: ${esc(s.out(total))}.`;
      if (linkMentions) linkMentions($('[data-o="v"]', el));
    }
    el.addEventListener("click", e => { const b = e.target.closest("[data-z]"); if (b) { pick = +b.dataset.z; run(); } });
    el.addEventListener("input", run);
    run();
  }

  /* ================================================================ storm counter */
  function stormCalc(el, A) {
    const { $, stepperHTML, numIn, bump } = A;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Count your storm</b></div>
      <div class="w-fields">${stepperHTML("s", "Spells cast before it this turn (by anyone)", 5, 0, 60)}${stepperHTML("c", "Creatures you control", 8, 0, 99)}</div>
      <div class="w-fields">${stepperHTML("t", "Impact Tremors and Kreat out (0, 1 or 2)", 1, 0, 2)}${stepperHTML("m", "Ruby Medallion (0 or 1)", 0, 0, 1)}</div>
      <div class="w-out">
        <div><b data-o="gs">0</b><span>Grapeshot damage</span></div>
        <div><b data-o="ew">0</b><span>Goblins from Empty the Warrens</span></div>
        <div><b data-o="ewd">0</b><span>damage to each opponent as they enter</span></div>
        <div><b data-o="hz">0</b><span>power Haze of Rage adds to each creature</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>`;
    function run() {
      const s = numIn(el, "s"), c = numIn(el, "c"), t = numIn(el, "t"), m = numIn(el, "m");
      const k = s + 1;
      bump($('[data-o="gs"]', el), k);
      bump($('[data-o="ew"]', el), 2 * k);
      bump($('[data-o="ewd"]', el), 2 * k * t);
      bump($('[data-o="hz"]', el), k);
      const cost = 4 - m, tre = 1 + s;
      $('[data-o="v"]', el).innerHTML = `With Storm-Kiln Artist out, a buyback Haze of Rage costs ${cost} and makes ${tre} Treasure${tre > 1 ? "s" : ""}: ${tre >= cost ? "<b>it pays for itself, so the loop is on.</b>" : `${cost - tre} short. Cast ${cost - tre} more spell${cost - tre > 1 ? "s" : ""} first.`} Haze alone adds ${k * c} power across ${c} creatures.`;
    }
    el.addEventListener("input", run);
    run();
  }

  /* ================================================================ the play checklist */
  function playChecklist(el, A) {
    const { esc, mana, store, KEY, linkMentions, toast } = A;
    const list = (window.MK_CHECKLISTS || {}).gstorm || [];
    const SK = KEY + ".checklist.v1";
    let done = new Set(store.json(SK, []));
    function render() {
      el.innerHTML = `<div class="btn-row"><button class="btn" type="button" data-reset>New game: clear ticks</button></div>` + list.map(sec => `<section class="cl-sec"><h3>${esc(sec.when)}</h3><ul class="cl-list">${sec.items.map((it, i) => {
        const id = sec.key + ":" + i, on = done.has(id);
        return `<li class="swap plain${on ? " done" : ""}"><button class="tick" type="button" data-id="${esc(id)}" aria-pressed="${on}" aria-label="Done"><span><em>${i + 1}</em>${TICK}</span></button><div class="who"><span class="cl-text">${mana(it.text)}</span>${it.cards && it.cards.length ? `<span class="sub-note">${it.cards.map(n => `<i-c>${esc(n)}</i-c>`).join(" ")}</span>` : ""}</div></li>`;
      }).join("")}</ul></section>`).join("");
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => {
      if (e.target.closest("[data-reset]")) { done.clear(); store.put(SK, []); render(); toast("Ticks cleared"); return; }
      const t = e.target.closest(".tick[data-id]"); if (!t) return;
      const id = t.dataset.id;
      if (done.has(id)) done.delete(id); else done.add(id);
      store.put(SK, [...done]);
      t.setAttribute("aria-pressed", String(done.has(id)));
      t.closest(".swap").classList.toggle("done", done.has(id));
    });
    render();
  }

  /* ================================================================ the quiz
     Questions from quiz.js by topic, or flashcards from cards.js. Leitner boxes kept on this device:
     a right answer moves the question up a box, a wrong one sends it back to box 1. */
  function quiz(el, A) {
    const { $, esc, mana, rich, store, KEY, linkMentions, CARDS, toast } = A;
    const QS = window.GSTORM_QUIZ || [];
    const TOPICS = [["all", "All"], ["zada", "Zada"], ["storm", "Storm"], ["combos", "Combos"], ["cards", "Cards"], ["rules", "Rules"], ["plan", "Game plan"]];
    const SK = KEY + ".quiz.v1";
    const st = Object.assign({ box: {}, seen: 0, right: 0, topic: "all", mode: "quiz", streak: 0, best: 0 }, store.json(SK, {}));
    const save = () => store.put(SK, st);
    const plain = h => String(h).replace(/<i-c>(.*?)<\/i-c>/g, "<b>$1</b>");
    const FLASH = CARDS.filter(c => c.why && c.cat !== "Land");
    let cur = null, answered = false, picked = new Set(), flipped = false;
    const boxOf = id => st.box[id] || 0;
    function next() {
      const pool = st.mode === "flash" ? FLASH.map(c => ({ id: "f:" + c.name, card: c })) : QS.filter(q => st.topic === "all" || q.topic === st.topic).map(q => ({ id: q.id, q }));
      if (!pool.length) return null;
      const w = it => [8, 4, 2, 1, 0.5, 0.25][Math.min(5, boxOf(it.id))] * (cur && it.id === cur.id ? 0 : 1);
      const total = pool.reduce((t, it) => t + w(it), 0);
      let r = Math.random() * total;
      for (const it of pool) { r -= w(it); if (r <= 0) return it; }
      return pool[0];
    }
    function mastery() {
      const ids = st.mode === "flash" ? FLASH.map(c => "f:" + c.name) : QS.filter(q => st.topic === "all" || q.topic === st.topic).map(q => q.id);
      return [ids.filter(id => boxOf(id) >= 3).length, ids.length];
    }
    function shell() {
      el.innerHTML = `<div class="seg qz-mode" role="tablist" aria-label="Quiz mode"><button type="button" role="tab" data-mode="quiz">Questions<small>${QS.length} multiple choice</small></button><button type="button" role="tab" data-mode="flash">Flashcards<small>${FLASH.length} cards</small></button></div>
        <div class="chips wrap qz-topics" role="group" aria-label="Topic">${TOPICS.map(([k, l]) => `<button class="chip" type="button" data-topic="${k}" aria-pressed="false">${l}</button>`).join("")}</div>
        <div class="qz-stats" data-o="stats"></div>
        <div class="qz-card panel" data-o="card" aria-live="polite"></div>
        <div class="btn-row"><button class="btn ghost" type="button" data-reset>Reset progress</button></div>`;
    }
    function stats() {
      const [m, n] = mastery();
      $('[data-o="stats"]', el).innerHTML = `<div class="sp-top"><span><b>${m}</b> of ${n} learned (box 3+)</span><span class="mono">${st.right}/${st.seen} right · streak ${st.streak} · best ${st.best}</span></div><div class="sp-bar"><i style="--w:${n ? (m / n) * 100 : 0}%"></i></div>`;
      el.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.mode === st.mode)));
      el.querySelectorAll("[data-topic]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.topic === st.topic)));
      $(".qz-topics", el).hidden = st.mode === "flash";
    }
    function show() {
      cur = next(); answered = false; picked = new Set(); flipped = false;
      const box = $('[data-o="card"]', el);
      if (!cur) { box.innerHTML = `<p class="muted">No questions here.</p>`; return; }
      if (cur.card) {
        const c = cur.card;
        box.innerHTML = `<p class="qz-k mono">Flashcard · box ${boxOf(cur.id)}</p><h3 class="qz-q"><i-c>${esc(c.name)}</i-c></h3><p class="muted small">${mana(c.cost || "")} ${esc(c.type)}. What does it do in this deck, and when do you play it?</p>
          <div class="qz-back" hidden><p>${rich(c.why || "")}</p>${c.how ? `<p class="muted">${rich(c.how)}</p>` : ""}</div>
          <div class="btn-row qz-act"><button class="btn primary" type="button" data-flip>Show the answer</button></div>`;
      } else {
        const q = cur.q, multi = Array.isArray(q.answer);
        box.innerHTML = `<p class="qz-k mono">${esc(q.topic)} · box ${boxOf(cur.id)}${multi ? " · choose all that apply" : ""}</p><h3 class="qz-q">${rich(q.q)}</h3>
          <ol class="qz-opts">${q.options.map((o, i) => `<li><button type="button" class="qz-opt" data-i="${i}">${rich(plain(o))}</button></li>`).join("")}</ol>
          <div class="qz-explain" hidden></div>
          <div class="btn-row qz-act">${multi ? `<button class="btn primary" type="button" data-check>Check</button>` : ""}</div>`;
      }
      if (linkMentions) linkMentions(box);
      stats();
    }
    function grade(ok) {
      st.seen++; if (ok) { st.right++; st.streak++; st.best = Math.max(st.best, st.streak); } else st.streak = 0;
      st.box[cur.id] = ok ? Math.min(5, boxOf(cur.id) + 1) : 0;
      save(); stats();
    }
    function finishQuestion() {
      const q = cur.q, box = $('[data-o="card"]', el);
      const right = new Set([].concat(q.answer));
      const ok = right.size === picked.size && [...right].every(i => picked.has(i));
      answered = true;
      box.querySelectorAll(".qz-opt").forEach(b => { const i = +b.dataset.i; b.classList.toggle("right", right.has(i)); b.classList.toggle("wrong", picked.has(i) && !right.has(i)); b.disabled = true; });
      const ex = $(".qz-explain", box);
      ex.hidden = false;
      ex.innerHTML = `<p><b>${ok ? "Right." : "Not quite."}</b> ${rich(q.explain || "")}</p>`;
      if (linkMentions) linkMentions(ex);
      $(".qz-act", box).innerHTML = `<button class="btn primary" type="button" data-next>Next question</button>`;
      grade(ok);
    }
    el.addEventListener("click", e => {
      const t = e.target;
      const mode = t.closest("[data-mode]"); if (mode) { st.mode = mode.dataset.mode; save(); show(); return; }
      const top = t.closest("[data-topic]"); if (top) { st.topic = top.dataset.topic; save(); show(); return; }
      if (t.closest("[data-reset]")) { if (confirm("Reset your quiz progress on this device?")) { st.box = {}; st.seen = st.right = st.streak = st.best = 0; save(); show(); toast("Progress reset"); } return; }
      if (t.closest("[data-next]")) { show(); return; }
      if (t.closest("[data-flip]")) {
        const box = $('[data-o="card"]', el);
        $(".qz-back", box).hidden = false; flipped = true;
        $(".qz-act", box).innerHTML = `<span class="muted small">Did you know it?</span><button class="btn" type="button" data-know="0">Not yet</button><button class="btn primary" type="button" data-know="1">I knew it</button>`;
        return;
      }
      const kn = t.closest("[data-know]"); if (kn && flipped) { grade(kn.dataset.know === "1"); show(); return; }
      const opt = t.closest(".qz-opt"); if (opt && !answered && cur && cur.q) {
        const i = +opt.dataset.i;
        if (Array.isArray(cur.q.answer)) { if (picked.has(i)) picked.delete(i); else picked.add(i); opt.classList.toggle("picked", picked.has(i)); }
        else { picked = new Set([i]); finishQuestion(); }
        return;
      }
      if (t.closest("[data-check]") && !answered) finishQuestion();
    });
    shell(); show();
  }

  /* ================================================================ price list (prices.js, from Archidekt) */
  function buyList(el, A) {
    const { esc, store, KEY, linkMentions } = A;
    const P = window.GSTORM_PRICES || { cards: [] };
    const SK = KEY + ".price.v1";
    const SRC = [["tcg", "TCGplayer"], ["ck", "Card Kingdom"], ["mp", "Mana Pool"]];
    let src = store.get(SK) || "tcg";
    if (!SRC.some(s => s[0] === src)) src = "tcg";
    const usd = n => "$" + (n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(2));
    const printing = s => !s ? "" : s.startsWith("sld ") ? `Secret Lair #${s.slice(4)}` : s.startsWith("plst ") ? `The List ${s.slice(5)}` : s;
    function render() {
      const rows = P.cards.slice().sort((a, b) => ((b[src] || 0) * b.qty) - ((a[src] || 0) * a.qty));
      const priced = rows.filter(r => r[src] != null);
      const total = priced.reduce((t, r) => t + r[src] * r.qty, 0);
      const missing = rows.filter(r => r[src] == null);
      el.innerHTML = `<div class="seg small" role="radiogroup" aria-label="Price source">${SRC.map(([k, l]) => `<button type="button" role="radio" aria-checked="${k === src}" data-src="${k}">${l}</button>`).join("")}</div>
        <div class="swap-progress"><div class="sp-top"><span><b>${usd(total)}</b> for ${priced.reduce((t, r) => t + r.qty, 0)} of 100 cards</span><span class="mono">box price ${usd(P.msrp || 0)}</span></div><div class="sp-bar"><i style="--w:${Math.min(100, (P.msrp / total) * 100)}%"></i></div></div>
        <div class="swaps">${rows.map((c, i) => `<div class="swap plain"><span class="tick" aria-hidden="true"><span><em>${i + 1}</em></span></span><div class="who"><span class="add"><i-c>${esc(c.name)}</i-c>${c.qty > 1 ? ` ×${c.qty}` : ""}</span><span class="sub-note">${esc(printing(c.printing))}${c.printing && c.printing.startsWith("sld ") ? '<span class="tag miku">Secret Lair printing</span>' : ""}</span></div><span class="eur mono">${c[src] == null ? "No price" : usd(c[src] * c.qty)}</span></div>`).join("")}</div>
        <p class="muted small">${esc(P.source || "")}, read ${esc(P.date || "")}. Prices are per printing Archidekt shows; for the reprints that's often a The List copy, not the Secret Lair one. ${missing.length ? `${missing.length} row${missing.length > 1 ? "s" : ""} had no ${SRC.find(s => s[0] === src)[1]} price on the page${src === "ck" && P.missingCkTotal ? ` (Archidekt's Card Kingdom subtotal puts the missing sorceries at ${usd(P.missingCkTotal)})` : ""}: the lookup failed, so they're left out of the total rather than guessed.` : ""} <a href="${esc(P.url || "#")}" target="_blank" rel="noopener">Open the Archidekt list</a>.</p>`;
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => { const b = e.target.closest("[data-src]"); if (!b) return; src = b.dataset.src; store.put(SK, src); render(); });
    render();
  }
})();
