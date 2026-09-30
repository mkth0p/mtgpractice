/* Etrata Deck: settings that turn the shared deck-site shell (../miku/app.js) into the Etrata site,
   the game's hero (MK_SITE), and the three Etrata calculators used by the guide and the combo pages. */
(function () {
  "use strict";
  window.MK_SITE = {
    key: "etrataWiki", hero: "etrata", defaultHero: "etrata",
    title: "Take Etrata to a four-player pod",
    lede: "A real Commander game with cloaks, hit counters and Ramses, against bots dealt at random, from retail precons to Bracket 4."
  };
  window.DECK_SITE = {
    key: "etrataWiki", short: "Etrata", gameBase: "../miku/game/",
    cards: window.ETRATA_CARDS, wiki: window.ETRATA_WIKI, guide: window.ETRATA_GUIDE,
    glossary: window.ETRATA_GLOSSARY, cuts: window.ETRATA_CUTS, faq: window.ETRATA_FAQ,
    roles: [
      ["cmd", "Commander"], ["assassin", "Assassins"], ["cloak", "Face-down makers"], ["evasion", "Evasion"],
      ["enabler", "Type enablers"], ["counter", "Counterspells"], ["removal", "Removal"], ["protect", "Protection"],
      ["draw", "Card draw"], ["ramp", "Ramp"], ["combo", "Combo pieces"], ["finisher", "Finishers"],
      ["utility", "Utility"], ["land", "Lands"]
    ],
    colors: [["U", "blue", "Island"], ["B", "black", "Swamp"]],
    pipNote: "Etrata asks for {U}{B}, and her granted ability for {U}{B} more.",
    oddsNote: "No tutors here: the odds are close to what you'll see, a bit better with <i-c>Preordain</i-c>, <i-c>Consider</i-c> and <i-c>Frantic Search</i-c>.",
    oddsGroups: ({ is, names }) => [
      { id: "cheapassassin", label: "An Assassin costing 2 or less", f: c => c.cat !== "Land" && c.roles.includes("assassin") && c.mv <= 2 },
      { id: "assassin", label: "Any Assassin", f: is("assassin") },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "l4", label: "At least 4 lands", lands: 4 },
      { id: "ramp", label: "A mana rock or ramp card", f: c => c.cat !== "Land" && c.roles.includes("ramp") },
      { id: "enabler", label: "A type enabler (Roshan, Nexus, Adaptation, Leyline)", f: is("enabler") },
      { id: "counter", label: "A counterspell", f: is("counter") },
      { id: "removal", label: "A removal spell", f: is("removal") },
      { id: "draw", label: "A card draw source", f: is("draw") },
      { id: "combo1", label: "Duskmantle Guildmage and Mindcrank", both: [["Duskmantle Guildmage"], ["Mindcrank"]] },
      { id: "combo2", label: "Unstoppable Slasher and Wound Reflection", both: [["Unstoppable Slasher"], ["Wound Reflection"]] }
    ],
    // tools/sim/run.js --games 300 --decks etrata,random2,random2,random2 (and random4) --first random
    botSim: window.ETRATA_BOT_SIM || null,
    // The Bracket 4 aggro upgrade (b4.js): its 50 cards get wiki entries under their own filter.
    extraCards: window.ETRATA_B4_CARDS || [], extraWiki: window.ETRATA_B4_WIKI || {}, extraChip: "B4 aggro", extraTag: "B4 aggro",
    widgets: api => ({
      cloakCalc: el => cloakCalc(el, api), mindcrankSim: el => mindcrankSim(el, api), slasherCalc: el => slasherCalc(el, api),
      b4Swaps: el => b4Swaps(el, api), b4Compare: el => b4Compare(el, api), b4List: el => b4List(el, api)
    })
  };

  /* ================================================================ the Bracket 4 aggro upgrade */
  const B4 = window.ETRATA_B4_CARDS || [];
  const STAGES = [
    { id: 1, label: "Stage 1", sub: "Aggro core", note: "29 swaps, all cheap: 16 creatures (Mari, Black Widow, Ezio, Achilles and 12 more Assassins), Skullclamp, Kindred Discovery, Rooftop Bypass, cheap removal, both haste equipment and two Assassin lands. No Game Changers: this is a fast Bracket 3 deck." },
    { id: 2, label: "Stage 2", sub: "Top of B3", note: "11 swaps: Rhystic Study, Fierce Guardianship and Cyclonic Rift (three Game Changers, the most Bracket 3 allows), Mystic Remora, Swan Song, Deadly Rollick, Bitterblossom, and a real mana base with Watery Grave, two fetch lands and Cavern of Souls." },
    { id: 3, label: "Stage 3", sub: "Bracket 4", note: "10 swaps: fast mana (Mana Vault, Chrome Mox, Lotus Petal, Ancient Tomb), three tutors, Force of Will and two more fetch lands. Ends at 10 Game Changers and 32 lands." }
  ];
  const stageSum = n => B4.filter(c => c.b4 === n).reduce((t, c) => t + (c.eur || 0), 0);

  /* Buy it stage by stage: each row is a cut and the card that replaces it. Ticks share the Shop's store. */
  function b4Swaps(el, A) {
    const { $, $$, esc, store, KEY, checklist } = A;
    el.innerHTML = `<div class="seg" role="tablist" aria-label="Upgrade stage">${STAGES.map(st => `<button type="button" role="tab" data-stage="${st.id}" aria-selected="false">${st.label}<small>${st.sub}</small></button>`).join("")}</div>
      <div class="swap-progress" data-o="prog"></div>
      <p class="muted small az-note" data-o="note"></p>
      <div class="swaps az-list" data-o="body"></div>`;
    const itemsOf = n => B4.filter(c => c.b4 === n).map(c => ({
      id: "b4s" + n + ":" + c.name, name: c.name, cut: c.cut.split(" // ")[0], eur: c.eur,
      note: c.eur == null ? "No MTGGoldfish price: check Cardmarket" : "",
      tags: [c.gc ? ["Game Changer", "new"] : null].filter(Boolean)
    }));
    const all = [1, 2, 3].flatMap(itemsOf);
    let st = +(store.get(KEY + ".b4Stage") || 1);
    if (![1, 2, 3].includes(st)) st = 1;
    const list = checklist({
      body: $('[data-o="body"]', el), progress: $('[data-o="prog"]', el), items: itemsOf(st), done: "This stage is complete.",
      extra: () => {
        const got = JSON.parse(localStorage.getItem(KEY + ".bought.v1") || "[]");
        const spent = all.filter(it => got.includes(it.id)).reduce((t, it) => t + (it.eur || 0), 0);
        return `<div class="sp-top sp-all"><span>All three stages</span><span class="mono">${Math.round(spent)}€ / ~${Math.round(all.reduce((t, it) => t + (it.eur || 0), 0))}€</span></div>`;
      }
    });
    const pick = n => {
      st = n; store.set(KEY + ".b4Stage", String(n));
      $$("[data-stage]", el).forEach(b => b.setAttribute("aria-selected", String(+b.dataset.stage === n)));
      $('[data-o="note"]', el).textContent = STAGES[n - 1].note + ` About ${Math.round(stageSum(n))}€.`;
      list.set(itemsOf(n));
    };
    el.addEventListener("click", e => { const b = e.target.closest("[data-stage]"); if (b && +b.dataset.stage !== st) pick(+b.dataset.stage); });
    pick(st);
  }

  /* Before and after, computed from the lists. */
  function b4Compare(el, A) {
    const { esc, byName, CARDS } = A;
    const find = n => byName.get(n) || CARDS.find(c => c.name.split(" // ")[0] === n);
    const base = CARDS.flatMap(c => Array(c.qty).fill(c));
    const s1 = (window.ETRATA_B4_STAGE1 || []).map(find).concat(base.filter(c => c.roles.includes("cmd")));
    const full = (window.ETRATA_B4_LIST || []).map(find).concat(base.filter(c => c.roles.includes("cmd")));
    const DRAW_ON_HIT = ["Black Widow, Deadly Hunter", "Ezio, Blade of Vengeance", "Mari, the Killing Quill", "Gix, Yawgmoth Praetor", "Kindred Discovery", "Shadow, Mysterious Assassin", "Rooftop Bypass", "Desmond Miles", "Basim Ibn Ishaq", "Mask of Memory", "Reconnaissance Mission", "Key to the City"];
    const isCre = c => c.cat === "Creature";
    const assassin = c => isCre(c) && (/Assassin/.test(c.type) || /Changeling/.test(c.text || ""));
    const nonland = l => l.filter(c => c.cat !== "Land");
    const rows = [
      ["Creatures", l => l.filter(isCre).length],
      ["Assassins (changelings count)", l => l.filter(assassin).length],
      ["Creatures costing 1 or 2", l => l.filter(c => isCre(c) && c.mv <= 2).length],
      ["Assassin lords (+1/+1)", l => l.filter(c => ["Ramses, Assassin Lord", "Achilles Davenport"].includes(c.name)).length],
      ["Cards that draw or make value on a hit", l => l.filter(c => DRAW_ON_HIT.includes(c.name)).length],
      ["Average mana value (nonland)", l => (nonland(l).reduce((t, c) => t + c.mv, 0) / nonland(l).length).toFixed(2)],
      ["Lands", l => l.filter(c => c.cat === "Land").length],
      ["Tutors", l => l.filter(c => /Tutor|Imperial Seal/.test(c.name)).length],
      ["Counterspells", l => l.filter(c => c.roles.includes("counter")).length],
      ["Removal", l => l.filter(c => c.roles.includes("removal")).length],
      ["Game Changers", l => l.filter(c => c.gc).length]
    ];
    el.innerHTML = `<div class="table-wrap"><table class="stack"><thead><tr><th>In the 100</th><th class="num">Today</th><th class="num">Stage 1</th><th class="num">B4</th></tr></thead><tbody>
      ${rows.map(([l, f]) => `<tr><td>${esc(l)}</td><td class="num" data-label="Today">${f(base)}</td><td class="num" data-label="Stage 1">${f(s1)}</td><td class="num" data-label="B4">${f(full)}</td></tr>`).join("")}
      </tbody></table></div>`;
  }

  /* The finished list, grouped by card type, with a copy button. */
  function b4List(el, A) {
    const { esc, mana, byName, CARDS, toast } = A;
    const cmd = CARDS.find(c => c.roles.includes("cmd"));
    const names = window.ETRATA_B4_LIST || [];
    const counts = new Map();
    names.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));
    const cards = [...counts.keys()].map(n => byName.get(n)).filter(Boolean);
    const ORDER = [["Creature", "Creatures"], ["Artifact", "Artifacts"], ["Enchantment", "Enchantments"], ["Instant", "Instants"], ["Sorcery", "Sorceries"], ["Land", "Lands"]];
    const row = c => `<button class="set-row" type="button" data-card="${esc(c.name)}"><span class="q mono">${counts.get(c.name) || 1}</span><span class="nm">${esc(c.name)}</span>${c.b4 ? `<span class="new-dot">S${c.b4}</span>` : ""}<span class="sc">${mana((c.cost || "").split(" // ")[0])}</span></button>`;
    el.innerHTML = `<div class="btn-row"><button class="btn primary" type="button" data-b4copy="names">Copy decklist</button><button class="btn" type="button" data-b4copy="qty">Copy with quantities</button></div>
      <div class="setlist">${[["Commander", [cmd]]].concat(ORDER.map(([t, l]) => [l, cards.filter(c => c.cat === t)])).filter(g => g[1].length).map(([l, g]) =>
        `<details class="set-group" open><summary><span>${l}</span><span class="n mono">${g.reduce((t, c) => t + (c === cmd ? 1 : counts.get(c.name) || 1), 0)}</span></summary>${g.slice().sort((a, b) => a.mv - b.mv || a.name.localeCompare(b.name)).map(row).join("")}</details>`).join("")}</div>
      <p class="muted small">S1, S2, S3: the stage that adds the card. Everything else is already in the deck.</p>`;
    el.addEventListener("click", async e => {
      const b = e.target.closest("[data-b4copy]"); if (!b) return;
      const qty = b.dataset.b4copy === "qty";
      const text = [cmd.name].concat([...counts].sort((x, y) => x[0].localeCompare(y[0])).map(([n, k]) => (qty || k > 1 ? k + " " : "") + n)).map((l, i) => (i === 0 && qty ? "1 " + l : l)).join("\n");
      try { await navigator.clipboard.writeText(text); toast("Decklist copied"); } catch (err) { toast("Couldn't copy: select the list instead"); }
    });
  }

  /* Cloak math: triggers this combat and how the face-down army grows over the next turns. */
  function cloakCalc(el, A) {
    const { $, esc, stepperHTML, numIn, bump } = A;
    let typed = true;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Count your cloaks</b></div>
      <div class="chips wrap" role="group" aria-label="Board"><button class="chip" type="button" data-e="typed" aria-pressed="true">Roshan, Nexus or a type enabler out</button></div>
      <div class="w-fields">${stepperHTML("a", "Assassins that connect this combat", 2, 0, 20)}${stepperHTML("f", "Face-down creatures already out", 0, 0, 30)}${stepperHTML("e", "Copies of Etrata (Spark Double makes 2)", 1, 1, 2)}</div>
      <div class="w-out">
        <div><b data-o="now">0</b><span>cards cloaked this combat</span></div>
        <div><b data-o="next">0</b><span>Assassins that can attack next turn</span></div>
        <div><b data-o="t3">0</b><span>cloaks after three such turns</span></div>
      </div>
      <ol class="w-log"></ol>
      <p class="muted small">A best case: every Assassin that attacks connects, nothing dies, and each trigger cloaks one card. Without a type enabler, cloaks are plain 2/2s and don't add to the Assassins that trigger Etrata.</p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    function run() {
      const a = numIn(el, "a"), f = numIn(el, "f"), e = numIn(el, "e");
      const log = [];
      let natives = a, down = f, total = 0;
      for (let t = 1; t <= 3; t++) {
        const attackers = natives + (typed ? down : 0);
        const got = attackers * e;
        down += got; total += got;
        log.push(`Turn ${t}: ${attackers} Assassin${attackers === 1 ? "" : "s"} connect${attackers === 1 ? "s" : ""} and cloak${attackers === 1 ? "s" : ""} ${got} card${got === 1 ? "" : "s"}. ${down} face down.`);
      }
      const now = a * e + (typed ? f * e : 0);
      bump(out("now"), now);
      bump(out("next"), a + (typed ? f + now : 0));
      bump(out("t3"), down);
      $(".w-log", el).innerHTML = log.map(s => `<li>${esc(s)}</li>`).join("");
    }
    el.addEventListener("click", ev => { const b = ev.target.closest("[data-e]"); if (!b) return; typed = !typed; b.setAttribute("aria-pressed", String(typed)); run(); });
    el.addEventListener("input", run);
    run();
  }

  /* Duskmantle Guildmage + Mindcrank: each life lost mills, each milled card loses 1 life. */
  function mindcrankSim(el, A) {
    const { $, ringHTML, makeRing, meterHTML, setMeter, stepperHTML, numIn } = A;
    el.innerHTML = ringHTML(["They lose life", "Mindcrank mills that many", "Guildmage: 1 life per card", "Back to step 2"], "cards milled") +
      `<div class="w-fields">${stepperHTML("life", "Opponent's life", 40, 1, 60)}${stepperHTML("lib", "Cards in their library", 60, 0, 99)}</div>
      <div class="sim-meters">${meterHTML("life", "Their life", 60)}${meterHTML("lib", "Their library", 99)}</div>
      <div class="sim-log" aria-live="polite"></div>
      <div class="btn-row">
        <button class="btn primary" type="button" data-a="hit">Start: 1 damage</button>
        <button class="btn" type="button" data-a="mill">Start: Guildmage mills 2</button>
        <button class="btn ghost" type="button" data-a="reset">Reset</button></div>
      <p class="muted small">Guildmage's first ability must have resolved this turn. It only affects cards put into an opponent's graveyard, and Mindcrank only watches opponents.</p>`;
    const ring = makeRing(el);
    let s;
    const reset = () => { const L = numIn(el, "life"), N = numIn(el, "lib"); s = { life: L, lib: N, maxL: Math.max(L, 1), maxN: Math.max(N, 1), milled: 0, log: "Resolve Guildmage's first ability, then start the chain." }; draw(); };
    function draw() {
      setMeter(el, "life", s.life, s.maxL); setMeter(el, "lib", s.lib, s.maxN);
      ring.count(s.milled);
      $(".sim-log", el).textContent = s.log;
    }
    function chain(start, mill) {
      reset();
      let q;
      if (mill) { const m = Math.min(2, s.lib); s.lib -= m; s.milled += m; s.life -= m; q = m; }
      else { s.life -= start; q = start; }
      let loops = 0;
      while (s.life > 0 && s.lib > 0 && q > 0 && loops++ < 500) { const m = Math.min(q, s.lib); s.lib -= m; s.milled += m; s.life -= m; q = m; }
      s.log = s.life <= 0 ? `They hit 0 life after ${s.milled} cards milled. They lose the game.`
        : s.lib === 0 ? `Their library is empty at ${s.life} life. They lose the next time they would draw.`
        : "The chain stopped.";
      ring.pulse(); draw();
    }
    el.addEventListener("click", ev => {
      const b = ev.target.closest("[data-a]"); if (!b) return;
      if (b.dataset.a === "hit") chain(1, false);
      else if (b.dataset.a === "mill") chain(0, true);
      else reset();
    });
    el.addEventListener("input", reset);
    reset();
  }

  /* Unstoppable Slasher + Wound Reflection: the end-step math. */
  function slasherCalc(el, A) {
    const { $, stepperHTML, numIn, bump } = A;
    let ramses = false, reflection = true;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Does the end step kill them?</b></div>
      <div class="chips wrap" role="group" aria-label="Board"><button class="chip" type="button" data-e="ramses" aria-pressed="false">Ramses out (Slasher is 3/4)</button><button class="chip" type="button" data-e="reflection" aria-pressed="true">Wound Reflection out</button></div>
      <div class="w-fields">${stepperHTML("life", "Their life at the start of the turn", 40, 1, 80)}${stepperHTML("other", "Other combat damage to them", 0, 0, 40)}${stepperHTML("gain", "Life they gain before the end step", 0, 0, 40)}</div>
      <div class="w-out">
        <div><b data-o="after">0</b><span>life after Slasher's trigger</span></div>
        <div><b data-o="lost">0</b><span>life lost this turn</span></div>
        <div><b data-o="end">0</b><span>life after the end step</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    function run() {
      const L = numIn(el, "life"), other = numIn(el, "other"), gain = numIn(el, "gain");
      const p = ramses ? 3 : 2;
      let life = L - p - other;
      let lost = p + other;
      if (life > 0) { const half = Math.ceil(life / 2); life -= half; lost += half; }
      bump(out("after"), life);
      life += gain;
      bump(out("lost"), lost);
      const end = reflection ? life - lost : life;
      bump(out("end"), end);
      out("v").innerHTML = end <= 0 ? `<b>Dead at the end step.</b>${ramses ? " Ramses turns that into a win for you." : ""}` : reflection ? `They survive at ${end}. Lifegain after the hit saved them.` : "Without Wound Reflection they only lose half.";
    }
    el.addEventListener("click", ev => {
      const b = ev.target.closest("[data-e]"); if (!b) return;
      if (b.dataset.e === "ramses") ramses = !ramses; else reflection = !reflection;
      b.setAttribute("aria-pressed", String(b.dataset.e === "ramses" ? ramses : reflection));
      run();
    });
    el.addEventListener("input", run);
    run();
  }
})();
