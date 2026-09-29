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
    widgets: api => ({ cloakCalc: el => cloakCalc(el, api), mindcrankSim: el => mindcrankSim(el, api), slasherCalc: el => slasherCalc(el, api) })
  };

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
