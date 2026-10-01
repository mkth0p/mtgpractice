/* Corrupted Miku: settings that turn the shared deck-site shell (../miku/app.js) into the Corrupted
   Miku site (Shalai, Voice of Plenty, printed as Miku, Voice Over All), the game's hero (MK_SITE),
   and this deck's tools: the combo finder, the Craterhoof calculator, the tutor map, the play
   checklist, the quiz and the buy list. */
(function () {
  "use strict";
  window.MK_SITE = {
    key: "corruptedWiki", hero: "corrupted", defaultHero: "corrupted",
    title: "Take Corrupted Miku to a four-player pod",
    lede: "A real Commander game with Shalai's hexproof, lock pieces and the combos, against bots dealt at random. The Coach button (the light bulb) shows what to look for right now and the turn checklist."
  };
  window.DECK_SITE = {
    key: "corruptedWiki", short: "Corrupted Miku", gameBase: "../miku/game/",
    cards: window.CORRUPTED_CARDS, wiki: window.CORRUPTED_WIKI, guide: window.CORRUPTED_GUIDE,
    glossary: window.CORRUPTED_GLOSSARY, cuts: window.CORRUPTED_CUTS, faq: window.CORRUPTED_FAQ,
    roles: [
      ["cmd", "Commander"], ["combo", "Combo pieces"], ["tutor", "Tutors"], ["ramp", "Fast mana and ramp"],
      ["lock", "Silence and stax"], ["protect", "Protection"], ["removal", "Interaction"], ["draw", "Card advantage"],
      ["finisher", "Finishers"], ["utility", "Utility"], ["land", "Lands"]
    ],
    colors: [["G", "green", "Forest"], ["W", "white", "Plains"]],
    pipNote: "Shalai asks for {3}{W}, and her ability for {4}{G}{G}.",
    oddsNote: "Sixteen tutors make the real odds of finding a combo piece much better than these draw-only numbers: count a tutor as the piece it finds.",
    oddsGroups: ({ is, names }) => [
      { id: "dork", label: "A one-mana dork or fast mana", f: c => c.cat !== "Land" && c.roles.includes("ramp") && c.mv <= 1 },
      { id: "l2", label: "At least 2 lands", lands: 2 },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "tutor", label: "Any tutor", f: is("tutor") },
      { id: "lock", label: "A lock piece (Abolisher, Silence...)", f: is("lock") },
      { id: "piece", label: "Any combo piece", f: c => COMBO_PIECES.includes(c.name) },
      { id: "pieceortutor", label: "A combo piece or a tutor", f: c => COMBO_PIECES.includes(c.name) || c.roles.includes("tutor") },
      { id: "thune", label: "Archangel of Thune and Spike Feeder", both: [["Archangel of Thune"], ["Spike Feeder"]] },
      { id: "druid", label: "Devoted Druid and Vizier of Remedies", both: [["Devoted Druid"], ["Vizier of Remedies"]] }
    ],
    botSim: null,
    widgets: api => ({
      comboFinder: el => comboFinder(el, api), hoofCalc: el => hoofCalc(el, api), tutorMap: el => tutorMap(el, api),
      playChecklist: el => playChecklist(el, api), quiz: el => quiz(el, api), buyList: el => buyList(el, api)
    })
  };

  /* ================================================================ shared data */
  const COMBOS = [
    { id: "thune", name: "Archangel of Thune + Spike Feeder", pieces: ["Archangel of Thune", "Spike Feeder"], result: "Infinite life and infinitely big creatures, at instant speed, for no mana.", finish: "Swing with the team, or add Walking Ballista." },
    { id: "heliodBallista", name: "Heliod + Walking Ballista", pieces: ["Heliod, Sun-Crowned", "Walking Ballista"], result: "Infinite damage: each ping gains 1 life and Heliod puts the counter back.", finish: "Wins on its own. Ballista needs 2 counters and {1}{W} for lifelink first." },
    { id: "heliodFeeder", name: "Heliod + Spike Feeder", pieces: ["Heliod, Sun-Crowned", "Spike Feeder"], result: "Infinite life.", finish: "Needs Walking Ballista or Archangel of Thune to win." },
    { id: "druid", name: "Devoted Druid + Vizier of Remedies", pieces: ["Devoted Druid", "Vizier of Remedies"], result: "Infinite green mana. Druid must have been under your control since your turn began, or have haste.", finish: "Pour it into Walking Ballista, Shalai's {4}{G}{G}, or Finale of Devastation for X 10 or more." }
  ];
  const COMBO_PIECES = [...new Set(COMBOS.flatMap(c => c.pieces))];
  /* Who finds what. Each tutor lists what it can get from the combo pieces and Craterhoof, and how. */
  const TUTORS = [
    { name: "Worldly Tutor", how: "Creature card, to the top of your library", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Enlightened Tutor", how: "Artifact or enchantment, to the top", finds: ["Heliod, Sun-Crowned", "Walking Ballista"] },
    { name: "Eladamri's Call", how: "Creature card, to your hand, at instant speed", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Chord of Calling", how: "Creature with mana value X or less, onto the battlefield (convoke)", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Summoner's Pact", how: "Green creature, to your hand. Pay {2}{G}{G} next upkeep or lose", finds: ["Spike Feeder", "Devoted Druid", "Craterhoof Behemoth"] },
    { name: "Green Sun's Zenith", how: "Green creature with mana value X or less, onto the battlefield", finds: ["Spike Feeder", "Devoted Druid", "Craterhoof Behemoth"] },
    { name: "Natural Order", how: "Sacrifice a green creature: a green creature onto the battlefield", finds: ["Craterhoof Behemoth", "Spike Feeder", "Devoted Druid"] },
    { name: "Finale of Devastation", how: "Creature with mana value X or less, from library or graveyard, onto the battlefield", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Archdruid's Charm", how: "Creature card to your hand (or a land onto the battlefield tapped)", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Survival of the Fittest", how: "{G}, discard a creature card: a creature card to your hand. Repeatable", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Formidable Speaker", how: "Enters: discard a card for a creature card to your hand", finds: ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"] },
    { name: "Recruiter of the Guard", how: "Enters: creature with toughness 2 or less, to your hand", finds: ["Spike Feeder", "Walking Ballista", "Devoted Druid", "Vizier of Remedies"] },
    { name: "Ranger-Captain of Eos", how: "Enters: creature with mana value 1 or less, to your hand", finds: ["Walking Ballista"] },
    { name: "Brightglass Gearhulk", how: "Enters: up to two artifacts, creatures or enchantments with mana value 1 or less", finds: ["Walking Ballista"] },
    { name: "Crop Rotation", how: "Sacrifice a land: a land onto the battlefield (Gaea's Cradle, Urza's Saga, Dryad Arbor)", finds: [] }
  ];
  const ALL_TARGETS = ["Archangel of Thune", "Spike Feeder", "Heliod, Sun-Crowned", "Walking Ballista", "Devoted Druid", "Vizier of Remedies", "Craterhoof Behemoth"];
  const short = n => n.split(",")[0];
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ================================================================ combo finder */
  function comboFinder(el, A) {
    const { $, esc, cardChip, linkMentions, store, KEY } = A;
    let have = new Set(store.json(KEY + ".combo.v1", []));
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>What does my board do?</b></div>
      <p class="muted small">Tap the pieces you have on the battlefield. The finder shows which combos are live, which one card would complete the next one, and what finds it.</p>
      <div class="chips wrap" role="group" aria-label="Pieces on the battlefield">${COMBO_PIECES.map(n => `<button class="chip" type="button" data-p="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div>
      <div class="cf-out" data-o="out" aria-live="polite"></div>`;
    function run() {
      el.querySelectorAll("[data-p]").forEach(b => b.setAttribute("aria-pressed", String(have.has(b.dataset.p))));
      const live = COMBOS.filter(c => c.pieces.every(p => have.has(p)));
      const near = COMBOS.filter(c => !live.includes(c) && c.pieces.filter(p => have.has(p)).length === c.pieces.length - 1);
      let html = "";
      if (live.length) html += live.map(c => `<div class="note"><h4>Live: ${esc(c.name)}</h4><p>${esc(c.result)} ${esc(c.finish)}</p></div>`).join("");
      html += near.map(c => {
        const miss = c.pieces.find(p => !have.has(p));
        const ts = TUTORS.filter(t => t.finds.includes(miss));
        return `<div class="note warn"><h4>One away: ${esc(c.name)}</h4><p>Missing <i-c>${esc(miss)}</i-c>. Found by ${ts.map(t => `<i-c>${esc(t.name)}</i-c>`).join(", ")}.</p></div>`;
      }).join("");
      if (!html) html = `<p class="muted">${have.size ? "No combo is one card away yet." : "Nothing picked yet."} Each combo needs two pieces: Thune + Feeder, Heliod + Ballista, Heliod + Feeder, Druid + Vizier.</p>`;
      const out = $('[data-o="out"]', el);
      out.innerHTML = html;
      if (linkMentions) linkMentions(out);
      store.put(KEY + ".combo.v1", [...have]);
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-p]"); if (!b) return;
      const n = b.dataset.p;
      if (have.has(n)) have.delete(n); else have.add(n);
      run();
    });
    run();
  }

  /* ================================================================ Craterhoof calculator */
  function hoofCalc(el, A) {
    const { $, stepperHTML, numIn, bump } = A;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Does Craterhoof kill?</b></div>
      <div class="w-fields">${stepperHTML("n", "Creatures you control, Craterhoof included", 7, 1, 40)}${stepperHTML("a", "Creatures that can attack (Hoof has haste)", 4, 1, 40)}${stepperHTML("p", "Their total power before Hoof (Hoof's 5 not included)", 6, 0, 200)}${stepperHTML("x", "Finale of Devastation X (0 if none)", 0, 0, 40)}</div>
      <div class="w-fields">${stepperHTML("l1", "Opponent 1 life", 40, 0, 60)}${stepperHTML("l2", "Opponent 2 life", 40, 0, 60)}${stepperHTML("l3", "Opponent 3 life", 40, 0, 60)}</div>
      <div class="w-out">
        <div><b data-o="dmg">0</b><span>trample damage if nothing is blocked</span></div>
        <div><b data-o="per">0</b><span>bonus per attacker (+X/+X)</span></div>
        <div><b data-o="dead">0</b><span>opponents you can kill</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>
      <p class="muted small">Craterhoof gives each creature you control +X/+X and trample, where X is the number of creatures you control. Finale of Devastation with X 10 or more adds another +X/+X and haste, so every creature can attack. Blockers soak some damage, but trample sends the rest through.</p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    function run() {
      const n = numIn(el, "n"), x = numIn(el, "x");
      let a = Math.min(numIn(el, "a"), n);
      if (x >= 10) a = n; // Finale's haste: everyone attacks
      const per = n + (x >= 10 ? x : 0);
      const dmg = numIn(el, "p") + 5 + a * per;
      const lives = ["l1", "l2", "l3"].map(k => numIn(el, k)).sort((p, q) => p - q);
      let left = dmg, dead = 0;
      for (const l of lives) if (left >= l) { left -= l; dead++; }
      bump(out("dmg"), dmg); bump(out("per"), per); bump(out("dead"), dead);
      const need = lives.reduce((t, l) => t + l, 0);
      out("v").innerHTML = dead === 3 ? "<b>Lethal on the whole table.</b>" : dead ? `Kills ${dead}. The table needs ${need} damage; you have ${dmg}.` : `Not lethal on anyone: ${dmg} damage against ${lives[0]} life. Grow the board first or use Vorinclex.`;
    }
    el.addEventListener("input", run);
    run();
  }

  /* ================================================================ tutor map */
  function tutorMap(el, A) {
    const { $, esc, linkMentions } = A;
    let pick = ALL_TARGETS[0];
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>What finds this piece?</b></div>
      <div class="chips wrap" role="group" aria-label="Combo piece">${ALL_TARGETS.map(n => `<button class="chip" type="button" data-t="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div>
      <div class="table-wrap"><table class="stack"><thead><tr><th>Tutor</th><th>How</th></tr></thead><tbody data-o="rows"></tbody></table></div>
      <p class="muted small" data-o="miss"></p>`;
    function run() {
      el.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.t === pick)));
      const yes = TUTORS.filter(t => t.finds.includes(pick)), no = TUTORS.filter(t => !t.finds.includes(pick) && t.finds.length);
      const rows = $('[data-o="rows"]', el);
      rows.innerHTML = yes.map(t => `<tr><td><i-c>${esc(t.name)}</i-c></td><td>${esc(t.how)}</td></tr>`).join("");
      const miss = $('[data-o="miss"]', el);
      miss.innerHTML = `${yes.length} of ${TUTORS.length - 1} creature tutors find <i-c>${esc(pick)}</i-c>. Not: ${no.map(t => `<i-c>${esc(t.name)}</i-c>`).join(", ") || "none"}.`;
      if (linkMentions) { linkMentions(rows); linkMentions(miss); }
    }
    el.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { pick = b.dataset.t; run(); } });
    run();
  }

  /* ================================================================ the play checklist */
  function playChecklist(el, A) {
    const { esc, mana, store, KEY, linkMentions, toast } = A;
    const list = (window.MK_CHECKLISTS || {}).corrupted || [];
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
    const QS = window.CORRUPTED_QUIZ || [];
    const TOPICS = [["all", "All"], ["combos", "Combos"], ["tutors", "Tutors"], ["cards", "Cards"], ["rules", "Rules"], ["plan", "Game plan"], ["mana", "Mana"]];
    const SK = KEY + ".quiz.v1";
    const st = Object.assign({ box: {}, seen: 0, right: 0, topic: "all", mode: "quiz", streak: 0, best: 0 }, store.json(SK, {}));
    const save = () => store.put(SK, st);
    // answer buttons can't hold card links (a tap would open the card): names in bold instead
    const plain = h => String(h).replace(/<i-c>(.*?)<\/i-c>/g, "<b>$1</b>");
    const FLASH = CARDS.filter(c => c.why && c.cat !== "Land" || /Cradle|Saga|Boseiju|Eiganjo|Cavern|Gemstone|Arbor/.test(c.name));
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

  /* ================================================================ buy list (prices from prices.js) */
  function buyList(el, A) {
    const { esc, store, KEY, linkMentions } = A;
    const P = window.CORRUPTED_PRICES || { cards: [] };
    const SK = KEY + ".owned.v1";
    let owned = new Set(store.json(SK, null) || P.cards.filter(c => c.precon).map(c => c.name));
    const usd = n => "$" + (n >= 100 ? Math.round(n).toLocaleString("en-US") : n.toFixed(2));
    function render() {
      const rows = P.cards.slice().sort((a, b) => (b.usd || 0) - (a.usd || 0));
      const all = rows.reduce((t, c) => t + (c.usd || 0) * c.qty, 0);
      const left = rows.filter(c => !owned.has(c.name)).reduce((t, c) => t + (c.usd || 0) * c.qty, 0);
      el.innerHTML = `<div class="swap-progress"><div class="sp-top"><span><b>${rows.filter(c => owned.has(c.name)).length}</b> of ${rows.length} owned</span><span class="mono">${usd(left)} left of ${usd(all)}</span></div><div class="sp-bar"><i style="--w:${all ? ((all - left) / all) * 100 : 0}%"></i></div></div>
        <div class="swaps">${rows.map((c, i) => `<div class="swap plain${owned.has(c.name) ? " done" : ""}"><button class="tick" type="button" data-own="${esc(c.name)}" aria-pressed="${owned.has(c.name)}" aria-label="I own ${esc(c.name)}"><span><em>${i + 1}</em>${TICK}</span></button><div class="who"><span class="add"><i-c>${esc(c.name)}</i-c>${c.qty > 1 ? ` ×${c.qty}` : ""}</span><span class="sub-note">${esc(c.printing || "")}${c.precon ? '<span class="tag miku">In the precon</span>' : ""}${c.gc ? '<span class="tag new">Game Changer</span>' : ""}</span></div>${c.url ? `<a class="eur mono" href="${esc(c.url)}" target="_blank" rel="noopener">${c.usd == null ? "No price" : usd(c.usd * c.qty)}</a>` : `<span class="eur mono">${c.usd == null ? "No price" : usd(c.usd * c.qty)}</span>`}</div>`).join("")}</div>
        <p class="muted small">Cheapest paper printing on MTGGoldfish in US dollars, looked up ${esc(P.date || "")}. Basic lands have no price here. Tick what you own: the precon's cards start ticked.</p>`;
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
