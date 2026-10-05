/* Corrupted Etrata: settings that turn the shared deck-site shell (../miku/app.js) into the Corrupted
   Etrata site (Etrata's Shadow Market v3, a Bracket 4 Etrata, Deadly Fugitive list), the game's hero
   (MK_SITE), and this deck's tools: the combo checker, the tutor map, the double-tap calculator, the
   play checklist, the quiz and the buy list. */
(function () {
  "use strict";
  window.MK_SITE = {
    key: "cetrataWiki", hero: "corrupted-etrata", defaultHero: "corrupted-etrata",
    title: "Take Corrupted Etrata to a four-player pod",
    lede: "A real Commander game with cloaks, face-down tricks, the vampire loop and Mindcrank, against bots dealt at random. The Coach button (the light bulb) shows what's live right now and the turn checklist."
  };

  /* ================================================================ shared data */
  // Each line needs one card from every group in `need`; `plus` cards make it better but aren't required.
  const COMBOS = [
    { id: "court", name: "Vampire court loop", need: [["Exquisite Blood", "Bloodthirsty Conqueror"], ["Marauding Blight-Priest", "Starscape Cleric", "Vito, Thorn of the Dusk Rose", "Sanguine Bond", "Enduring Tenacity"]], plus: ["Hooded Blightfang", "Vampire of the Dire Moon"],
      result: "Any opponent losing life starts a loop that drains every opponent to 0.", start: "Any opponent losing life, or you gaining life, starts it: an attack, a Hooded Blightfang trigger, Vampire of the Dire Moon's lifelink, their fetch land or shock land, Mindcrank. Your own life loss (Night's Whisper, Necropotence) doesn't." },
    { id: "crank", name: "Mindcrank + Duskmantle Guildmage", need: [["Mindcrank"], ["Duskmantle Guildmage"]],
      result: "Each card put into their graveyard costs them 1 life, and each life lost mills them again, until they're dead. Each opponent needs their own starter.", start: "Activate the Guildmage ({1}{U}{B}), then any life loss or mill starts it. Do it on an opponent's turn when they cast a spell." },
    { id: "double", name: "Double tap", need: [["Bloodletter of Aclazotz"], ["Virtus the Veiled"]], plus: ["Tetsuko Umezawa, Fugitive", "Rogue's Passage"],
      result: "Virtus's hit makes that player lose half their life, rounded up. Bloodletter doubles that on your turn: all of it. It kills one player, not the table.", start: "Tetsuko makes the 1/1 Virtus unblockable. Without Tetsuko, use Rogue's Passage ({4}, {T}) or attack a player with no untapped blockers." },
    { id: "manta", name: "Infinite turns", need: [["Scroll of Fate"], ["Wormfang Manta"], ["Crystal Shard"]], plus: ["Training Grounds"],
      result: "An extra turn every turn. The Manta is summoning sick each time, so win the extra turns with your other creatures.", start: "Manifest the Manta with Scroll of Fate, flip it with Etrata ({2}{U}{B}), bounce it with Crystal Shard ({U}, {T}). Manifested again next turn: 5 mana a turn, 3 with Training Grounds." }
  ];
  const COMBO_PIECES = [...new Set(COMBOS.flatMap(c => c.need.flat()))];
  const ALL_PLUS = [...new Set(COMBOS.flatMap(c => c.plus || []))].filter(n => !COMBO_PIECES.includes(n));
  /* Who finds what. `any`: any card. `mv`: transmute, a card with that mana value. `list`: named cards. */
  const TUTORS = [
    { name: "Demonic Tutor", how: "Any card, to your hand. {1}{B}, sorcery.", any: true },
    { name: "Vampiric Tutor", how: "Any card, to the top. {B}, instant, 2 life.", any: true },
    { name: "Imperial Seal", how: "Any card, to the top. {B}, sorcery, 2 life.", any: true },
    { name: "Grim Tutor", how: "Any card, to your hand. {1}{B}{B}, sorcery, 3 life.", any: true },
    { name: "Diabolic Intent", how: "Any card, to your hand. {1}{B}, sacrifice a creature (a stolen cloak is ideal).", any: true },
    { name: "Beseech the Mirror", how: "Any card, to your hand. Bargained, you may cast it free if its mana value is 4 or less.", any: true },
    { name: "Lim-Dûl's Vault", how: "Look at five at a time, paying 1 life to dig again; one pile goes on top.", any: true },
    { name: "Scheming Symmetry", how: "You and another player each put any card on top. {B}, sorcery. Pick the opponent least likely to use it.", any: true },
    { name: "Wishclaw Talisman", how: "Any card, to your hand. Then an opponent gets the Talisman: use it on the turn you win.", any: true },
    { name: "Tribute Mage", how: "Enters: an artifact with mana value 2, to your hand.", list: ["Mindcrank", "Wishclaw Talisman", "Dimir Signet", "Talisman of Dominance", "Arcane Signet", "Mind Stone", "Fellwar Stone"] },
    { name: "Shred Memory", how: "Transmute {1}{B}{B}: a card with mana value 2.", mv: 2 },
    { name: "Muddle the Mixture", how: "Transmute {1}{U}{U}: a card with mana value 2.", mv: 2 },
    { name: "Drift of Phantasms", how: "Transmute {1}{U}{U}: a card with mana value 3.", mv: 3 },
    { name: "Dimir House Guard", how: "Transmute {1}{B}{B}: a card with mana value 4.", mv: 4 }
  ];
  const TUTOR_NAMES = TUTORS.map(t => t.name);
  const short = n => n.split(",")[0];
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const cardMV = name => { const c = (window.CETRATA_CARDS || []).find(x => x.name === name); return c ? c.mv : null; };
  const finds = (t, name) => !!(t.any || (t.list && t.list.includes(name)) || (t.mv != null && cardMV(name) === t.mv));

  window.DECK_SITE = {
    key: "cetrataWiki", short: "Corrupted Etrata", gameBase: "../miku/game/",
    cards: window.CETRATA_CARDS, wiki: window.CETRATA_WIKI, guide: window.CETRATA_GUIDE,
    glossary: window.CETRATA_GLOSSARY, cuts: window.CETRATA_CUTS, faq: window.CETRATA_FAQ,
    roles: [
      ["cmd", "Commander"], ["combo", "Combo pieces"], ["steal", "Theft"], ["tutor", "Tutors"], ["facedown", "Face-down tricks"],
      ["draw", "Card advantage"], ["ramp", "Mana"], ["removal", "Interaction"], ["utility", "Utility"], ["land", "Lands"]
    ],
    colors: [["U", "blue", "Island"], ["B", "black", "Swamp"]],
    pipNote: "Etrata asks for {1}{U}{B}, and her flip for {2}{U}{B} ({U}{B} with Training Grounds).",
    oddsNote: "Fourteen tutors make the real odds of finding a combo piece much better than these draw-only numbers: count a tutor as the piece it finds.",
    oddsGroups: ({ is }) => [
      { id: "l2", label: "At least 2 lands", lands: 2 },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "rock", label: "A mana rock or Dark Ritual", f: c => c.cat !== "Land" && c.roles.includes("ramp") },
      { id: "tutor", label: "Any tutor", f: is("tutor") },
      { id: "piece", label: "Any combo piece", f: c => COMBO_PIECES.includes(c.name) },
      { id: "pieceortutor", label: "A combo piece or a tutor", f: c => COMBO_PIECES.includes(c.name) || c.roles.includes("tutor") },
      { id: "steal", label: "A theft card", f: is("steal") },
      { id: "court", label: "A vampire drain and a payoff", both: [["Exquisite Blood", "Bloodthirsty Conqueror"], ["Marauding Blight-Priest", "Starscape Cleric", "Vito, Thorn of the Dusk Rose", "Sanguine Bond", "Enduring Tenacity"]] },
      { id: "crank", label: "Mindcrank and Duskmantle Guildmage", both: [["Mindcrank"], ["Duskmantle Guildmage"]] }
    ],
    botSim: null,
    widgets: api => ({
      comboFinder: el => comboFinder(el, api), tutorMap: el => tutorMap(el, api), doubleTap: el => doubleTap(el, api),
      playChecklist: el => playChecklist(el, api), quiz: el => quiz(el, api), buyList: el => buyList(el, api), proxyList: el => proxyList(el, api)
    })
  };

  /* ================================================================ combo checker
     Tick what you have (in hand or on the battlefield) and the tutors in your hand: each win line says
     whether it's live, one card away (and which of your tutors finds that card), or further off. */
  function comboFinder(el, A) {
    const { $, esc, mana, store, KEY, linkMentions } = A;
    const SK = KEY + ".combo.v1";
    const st = { have: new Set(store.json(SK, [])) };
    const group = (label, names) => `<div class="ts-group"><p class="ts-l mono">${label}</p><div class="chips wrap" role="group" aria-label="${esc(label)}">${names.map(n => `<button class="chip" type="button" data-have="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div></div>`;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Which win line is live?</b></div>
      <p class="muted small">Tap the cards you have, in hand or on the battlefield, and the tutors in your hand. Etrata is assumed to be out or castable.</p>
      <div class="ts-in">
        ${group("Combo pieces", COMBO_PIECES)}
        ${group("Helpers", ALL_PLUS)}
        ${group("Tutors in hand", TUTOR_NAMES)}
      </div>
      <div class="cc-lines" data-o="out" aria-live="polite"></div>`;
    function run() {
      el.querySelectorAll("[data-have]").forEach(b => b.setAttribute("aria-pressed", String(st.have.has(b.dataset.have))));
      store.put(SK, [...st.have]);
      const tutors = TUTORS.filter(t => st.have.has(t.name));
      const rows = COMBOS.map(c => {
        const missing = c.need.filter(g => !g.some(n => st.have.has(n)));
        const got = c.need.length - missing.length;
        // one tutor per missing piece, and each tutor only once
        const used = new Set();
        const fixes = missing.map(g => { const t = tutors.find(t => !used.has(t.name) && g.some(n => finds(t, n))); if (t) used.add(t.name); return t ? { t, n: g.find(n => finds(t, n)) } : null; });
        const reach = missing.length && fixes.every(Boolean);
        const state = !missing.length ? "live" : reach ? "near" : missing.length === 1 ? "near" : "far";
        return { c, missing, got, fixes, reach, state, score: (missing.length ? 0 : 100) + (reach ? 50 : 0) - missing.length * 10 + got };
      }).sort((a, b) => b.score - a.score);
      const label = r => !r.missing.length ? "Live" : r.reach ? "Tutor it" : r.missing.length === 1 ? "One away" : `${r.missing.length} away`;
      $('[data-o="out"]', el).innerHTML = rows.map(r => `<div class="cc-line ${r.state}">
        <div class="ts-hd"><span class="ts-when-b mono">${label(r)}</span><b>${esc(r.c.name)}</b></div>
        <p>${mana(esc(r.c.result))}</p>
        ${r.missing.length ? `<p class="cc-need">Missing: ${r.missing.map((g, i) => g.map(n => `<i-c>${esc(n)}</i-c>`).join(" or ") + (r.fixes[i] ? ` (your <i-c>${esc(r.fixes[i].t.name)}</i-c> finds <i-c>${esc(r.fixes[i].n)}</i-c>)` : "")).join("; ")}.</p>` : `<p>${mana(esc(r.c.start))}</p>`}
        ${(r.c.plus || []).length ? `<p class="muted small">Better with ${r.c.plus.map(n => `<i-c>${esc(n)}</i-c>${st.have.has(n) ? " ✓" : ""}`).join(", ")}.</p>` : ""}
      </div>`).join("");
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-have]");
      if (b) { const n = b.dataset.have; if (st.have.has(n)) st.have.delete(n); else st.have.add(n); run(); }
    });
    run();
  }

  /* ================================================================ tutor map */
  function tutorMap(el, A) {
    const { $, esc, linkMentions } = A;
    let pick = COMBO_PIECES[0];
    const targets = COMBO_PIECES.concat(ALL_PLUS);
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>What finds this piece?</b></div>
      <div class="chips wrap" role="group" aria-label="Combo piece">${targets.map(n => `<button class="chip" type="button" data-t="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div>
      <div class="table-wrap"><table class="stack"><thead><tr><th>Tutor</th><th>How</th></tr></thead><tbody data-o="rows"></tbody></table></div>
      <p class="muted small" data-o="miss"></p>`;
    function run() {
      el.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.t === pick)));
      const yes = TUTORS.filter(t => finds(t, pick)), no = TUTORS.filter(t => !finds(t, pick));
      const rows = $('[data-o="rows"]', el);
      rows.innerHTML = yes.map(t => `<tr><td data-label="Tutor"><i-c>${esc(t.name)}</i-c></td><td data-label="How">${A.mana(esc(t.how))}</td></tr>`).join("");
      const miss = $('[data-o="miss"]', el);
      const mv = cardMV(pick);
      miss.innerHTML = `${yes.length} of ${TUTORS.length} tutors find <i-c>${esc(pick)}</i-c>${mv != null ? ` (mana value ${mv})` : ""}. Not: ${no.map(t => `<i-c>${esc(t.name)}</i-c>`).join(", ") || "none"}.`;
      if (linkMentions) { linkMentions(rows); linkMentions(miss); }
    }
    el.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { pick = b.dataset.t; run(); } });
    run();
  }

  /* ================================================================ double tap calculator
     Combat damage first (doubled by Bloodletter on your turn), then Virtus's trigger: "that player loses
     half their life, rounded up", doubled again. Mindcrank mills one card per life lost. */
  function doubleTap(el, A) {
    const { $, stepperHTML, numIn, bump } = A;
    const tg = (k, label, on) => `<button class="chip" type="button" data-k="${k}" aria-pressed="${on}">${label}</button>`;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Does the double tap kill?</b></div>
      <div class="w-fields">${stepperHTML("life", "Their life", 40, 1, 99)}${stepperHTML("dmg", "Other combat damage to them (Virtus's 1 not included)", 0, 0, 60)}</div>
      <div class="chips wrap" role="group" aria-label="What's out">${tg("blood", "Bloodletter of Aclazotz out (your turn)", true)}${tg("virtus", "Virtus connects", true)}${tg("crank", "Mindcrank out", false)}</div>
      <div class="w-out">
        <div><b data-o="combat">0</b><span>life lost to combat damage</span></div>
        <div><b data-o="half">0</b><span>life lost to Virtus's trigger</span></div>
        <div><b data-o="left">0</b><span>life left</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>
      <p class="muted small">Bloodletter: "If an opponent would lose life during your turn, they lose twice that much life instead." Damage makes a player lose life, so combat damage doubles too. Virtus is a 1/1 Assassin, so <i-c>Tetsuko Umezawa, Fugitive</i-c> makes it unblockable; without Tetsuko, use <i-c>Rogue's Passage</i-c>. It kills only the player it hits. Mindcrank's mill doesn't loop on its own here: it needs <i-c>Duskmantle Guildmage</i-c>.</p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    const on = k => { const i = el.querySelector(`[data-k="${k}"]`); return !!i && i.getAttribute("aria-pressed") === "true"; };
    function run() {
      const blood = on("blood"), virtus = on("virtus");
      let life = numIn(el, "life");
      const raw = numIn(el, "dmg") + (virtus ? 1 : 0);
      const combat = Math.min(life, raw * (blood ? 2 : 1));
      life -= combat;
      let half = 0;
      if (virtus && life > 0) half = Math.min(life, Math.ceil(life / 2) * (blood ? 2 : 1));
      life -= half;
      bump(out("combat"), combat); bump(out("half"), half); bump(out("left"), Math.max(0, life));
      const lost = combat + half;
      let v = life <= 0 ? "<b>Dead.</b>" : `They live at ${life}.${!blood && virtus ? " Without Bloodletter, Virtus only takes half." : ""}`;
      if (on("crank")) v += ` Mindcrank mills ${lost} card${lost === 1 ? "" : "s"}.`;
      out("v").innerHTML = v;
    }
    el.addEventListener("input", run);
    el.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); run(); } });
    run();
  }

  /* ================================================================ the play checklist */
  function playChecklist(el, A) {
    const { esc, mana, store, KEY, linkMentions, toast } = A;
    const list = (window.MK_CHECKLISTS || {})["corrupted-etrata"] || [];
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
     Two modes. Questions: multiple choice from quiz.js, by topic. Flashcards: a card's name, then what
     it does in this deck (from cards.js). Both use Leitner boxes kept on this device: a right answer
     moves the question up a box, a wrong one sends it back to box 1, and box 1 comes up most. */
  function quiz(el, A) {
    const { $, esc, mana, rich, store, KEY, linkMentions, CARDS, toast } = A;
    const QS = window.CETRATA_QUIZ || [];
    const TOPICS = [["all", "All"], ["combos", "Combos"], ["tutors", "Tutors"], ["theft", "Theft"], ["cards", "Cards"], ["rules", "Rules"], ["plan", "Game plan"], ["mana", "Mana"], ["rulings", "Hard rulings"]]
      .filter(([k]) => k === "all" || QS.some(q => q.topic === k));
    const SK = KEY + ".quiz.v1";
    const st = Object.assign({ box: {}, seen: 0, right: 0, topic: "all", mode: "quiz", streak: 0, best: 0 }, store.json(SK, {}));
    const save = () => store.put(SK, st);
    // answer buttons can't hold card links (a tap would open the card): names in bold instead
    const plain = h => String(h).replace(/<i-c>(.*?)<\/i-c>/g, "<b>$1</b>");
    const FLASH = CARDS.filter(c => c.why && (c.cat !== "Land" || /Otawara|Takenuma|Rogue's Passage|Path of Ancestry|Secluded Courtyard|Morphic Pool/.test(c.name)));
    let cur = null, answered = false, picked = new Set(), flipped = false;
    const boxOf = id => st.box[id] || 0;
    // pick the next item: weight box 0 and 1 heavily, never the same one twice in a row
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
      const m = ids.filter(id => boxOf(id) >= 3).length;
      return [m, ids.length];
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


  /* ================================================================ proxy plan
     ju builds this deck by taking what carries over from the Etrata deck (../etrata/) and proxying the
     rest. Cards marked base in prices.js are the ones the Etrata deck already has. */
  function proxyList(el, A) {
    const { esc, store, KEY, linkMentions, toast } = A;
    const P = window.CETRATA_PRICES || { cards: [] };
    const SK = KEY + ".proxied.v1";
    let done = new Set(store.json(SK, []));
    const cat = n => { const c = (window.CETRATA_CARDS || []).find(x => x.name === n); return c ? c.cat : ""; };
    const ORDER = ["Creature", "Instant", "Sorcery", "Artifact", "Enchantment", "Land"];
    const sortCards = l => l.slice().sort((a, b) => ORDER.indexOf(cat(a.name)) - ORDER.indexOf(cat(b.name)) || a.name.localeCompare(b.name));
    const keep = sortCards(P.cards.filter(c => c.base)), proxy = sortCards(P.cards.filter(c => !c.base));
    const count = l => l.reduce((t, c) => t + c.qty, 0);
    const text = l => l.map(c => `${c.qty} ${c.name}`).join("\n");
    function render() {
      const left = proxy.filter(c => !done.has(c.name));
      el.innerHTML = `<div class="w-out">
          <div><b>${count(keep)}</b><span>cards come from your Etrata deck</span></div>
          <div><b>${count(proxy)}</b><span>cards to proxy</span></div>
          <div><b>${count(left)}</b><span>proxies still to print</span></div>
        </div>
        <div class="btn-row"><button class="btn primary" type="button" data-copy-proxy>Copy the proxy list</button><a class="btn" href="proxies-A4.pdf" target="_blank" rel="noopener">Print the proxies (A4 PDF)</a><button class="btn ghost" type="button" data-reset>Clear ticks</button></div>
        <section class="cl-sec"><h3>Proxy these (${count(proxy)})</h3><p class="muted small">Tick each one once it's printed and sleeved. The price is what the real card would cost.</p>
        <div class="swaps">${proxy.map((c, i) => `<div class="swap plain${done.has(c.name) ? " done" : ""}"><button class="tick" type="button" data-px="${esc(c.name)}" aria-pressed="${done.has(c.name)}" aria-label="Printed ${esc(c.name)}"><span><em>${i + 1}</em>${TICK}</span></button><div class="who"><span class="add"><i-c>${esc(c.name)}</i-c>${c.qty > 1 ? ` ×${c.qty}` : ""}</span><span class="sub-note">${esc(cat(c.name))}${c.gc ? '<span class="tag new">Game Changer</span>' : ""}</span></div><span class="eur mono">${c.usd == null ? "" : "$" + (c.usd * c.qty).toFixed(2)}</span></div>`).join("")}</div></section>
        <section class="cl-sec"><h3>Take from your Etrata deck (${count(keep)})</h3><p class="muted small">Pull these out of the Etrata deck. Your Etrata deck has 11 Islands and 10 Swamps; this one needs 7 Islands and 9 Swamps.</p>
        <div class="swaps">${keep.map((c, i) => `<div class="swap plain done"><span class="tick" aria-hidden="true"><span><em>${i + 1}</em>${TICK}</span></span><div class="who"><span class="add"><i-c>${esc(c.name)}</i-c>${c.qty > 1 ? ` ×${c.qty}` : ""}</span><span class="sub-note">${esc(cat(c.name))}</span></div></div>`).join("")}</div></section>`;
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => {
      if (e.target.closest("[data-copy-proxy]")) {
        const t = text(proxy);
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("Proxy list copied"), () => toast("Couldn't copy"));
        return;
      }
      if (e.target.closest("[data-reset]")) { done.clear(); store.put(SK, []); render(); return; }
      const b = e.target.closest("[data-px]"); if (!b) return;
      const n = b.dataset.px;
      if (done.has(n)) done.delete(n); else done.add(n);
      store.put(SK, [...done]);
      render();
    });
    render();
  }

  /* ================================================================ buy list (prices from prices.js) */
  function buyList(el, A) {
    const { esc, store, KEY, linkMentions } = A;
    const P = window.CETRATA_PRICES || { cards: [] };
    const SK = KEY + ".owned.v1";
    // cards that are also in the Etrata deck start ticked
    let owned = new Set(store.json(SK, null) || P.cards.filter(c => c.base).map(c => c.name));
    const usd = n => "$" + (n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(2));
    const printing = s => String(s || "").replace(/\s*\(.*\)\s*$/, "");
    function render() {
      const rows = P.cards.slice().sort((a, b) => (b.usd || 0) - (a.usd || 0));
      const all = rows.reduce((t, c) => t + (c.usd || 0) * c.qty, 0);
      const left = rows.filter(c => !owned.has(c.name)).reduce((t, c) => t + (c.usd || 0) * c.qty, 0);
      el.innerHTML = `<div class="swap-progress"><div class="sp-top"><span><b>${rows.filter(c => owned.has(c.name)).length}</b> of ${rows.length} owned</span><span class="mono">${usd(left)} left of ${usd(all)} (about ${Math.round(left * 0.85)}€)</span></div><div class="sp-bar"><i style="--w:${all ? ((all - left) / all) * 100 : 0}%"></i></div></div>
        <div class="swaps">${rows.map((c, i) => `<div class="swap plain${owned.has(c.name) ? " done" : ""}"><button class="tick" type="button" data-own="${esc(c.name)}" aria-pressed="${owned.has(c.name)}" aria-label="I own ${esc(c.name)}"><span><em>${i + 1}</em>${TICK}</span></button><div class="who"><span class="add"><i-c>${esc(c.name)}</i-c>${c.qty > 1 ? ` ×${c.qty}` : ""}</span><span class="sub-note">${esc(printing(c.printing))}${c.base ? '<span class="tag miku">In the Etrata deck</span>' : ""}${c.gc ? '<span class="tag new">Game Changer</span>' : ""}</span></div>${c.url ? `<a class="eur mono" href="${esc(c.url)}" target="_blank" rel="noopener">${c.usd == null ? "No price" : usd(c.usd * c.qty)}</a>` : `<span class="eur mono">${c.usd == null ? "No price" : usd(c.usd * c.qty)}</span>`}</div>`).join("")}</div>
        <p class="muted small">Cheapest legal regular printing, TCGplayer prices via Archidekt or MTGGoldfish, in US dollars, looked up ${esc(P.date || "")}; euros at ×0.85. Check Cardmarket before buying. Basic lands and the cards marked "No price" (their lookup didn't go through) aren't counted in the total. Cards that are also in the <a href="../etrata/">Etrata deck</a> start ticked.</p>`;
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-own]"); if (!b) return;
      const n = b.dataset.own;
      if (owned.has(n)) owned.delete(n); else owned.add(n);
      store.put(SK, [...owned]);
      render();
    });
    render();
  }
})();
