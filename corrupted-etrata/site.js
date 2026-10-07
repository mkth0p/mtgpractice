/* Corrupted Etrata: settings that turn the shared deck-site shell (../miku/app.js) into the Corrupted
   Etrata site, built around the Etrata heist closer (a Bracket 4 Etrata, Deadly Fugitive theft-aggro list:
   research/etrata-theft-aggro/local/REPORT.md), the game's heroes (MK_SITE: the heist closer by default, the
   v3 drain list as a variant) and this deck's tools: the kill finder, the tutor map, the halving calculator,
   the nine piloting rules, the numbers table, the play checklist, the list picker, the quiz, the buy list and
   the proxy plan. */
(function () {
  "use strict";
  window.MK_SITE = {
    key: "cetrataWiki", hero: "corrupted-etrata", defaultHero: "etrata-heist-aggro", heroOrder: ["etrata-heist-aggro", "corrupted-etrata"],
    title: "Take Corrupted Etrata to a four-player pod",
    lede: "A real Commander game with the Etrata heist: cheap Assassins, cloaks, Ramses and the drain loop, against bots dealt at random. The v3 drain list is in the deck picker too. The Coach button (the light bulb) shows what's live right now and the turn checklist."
  };

  /* ================================================================ shared data */
  const RAMSES = "Ramses, Assassin Lord", BLOOD = "Bloodletter of Aclazotz";
  const HALVERS = ["Virtus the Veiled", "Unstoppable Slasher", "Quietus Spike"];
  const DRAINS = ["Exquisite Blood", "Bloodthirsty Conqueror"], PAYOFFS = ["Sanguine Bond", "Vito, Thorn of the Dusk Rose"];
  // Each line needs one card from every group in `need`; `plus` cards make it better but aren't required.
  const COMBOS = [
    { id: "verdict", name: "Ramses' verdict", need: [[RAMSES], [BLOOD], HALVERS], plus: ["Tetsuko Umezawa, Fugitive", "Rogue's Passage", "Reverse the Polarity", "Changeling Outcast"],
      result: "The game. A halver's hit on your turn, doubled by Bloodletter, takes all of that player's life; they lose, they were attacked by an Assassin you controlled, and Ramses wins you the game.", start: "Attack one player with the halver and every Assassin that gets through. Tetsuko makes a creature with power or toughness 1 or less unblockable (Virtus is a 1/1, but Ramses' +1/+1 makes it 2/2); Rogue's Passage ({4}, {T}) and Reverse the Polarity work on anything." },
    { id: "loop", name: "The drain loop", need: [DRAINS, PAYOFFS], plus: [BLOOD, "Changeling Outcast", "Vein Ripper", "Ashnod's Altar"],
      result: "Every opponent dies: each drain gains you life, each gain drains an opponent, until the table is dead.", start: "Any opponent losing life starts it: one point of combat damage from Changeling Outcast, Vein Ripper or Ashnod's Altar with a stolen 2/2, a fetch land or shock land they pay life for." },
    { id: "half", name: "Half, doubled", need: [[BLOOD], HALVERS], plus: ["Tetsuko Umezawa, Fugitive", "Rogue's Passage"],
      result: "One player dies on your turn: half their life rounded up, doubled, is all of it. Without Ramses that's one player, not the game.", start: "Get the halver through: Tetsuko for a 1/1 Virtus, Rogue's Passage or Reverse the Polarity for the Slasher or a Quietus Spike carrier." },
    { id: "ramses", name: "Ramses and a death", need: [[RAMSES]], plus: ["Teferi's Veil", "Eldrazi Monument", "Kindred Dominance", "Coat of Arms", "Leyline of Transformation"],
      result: "Any player who loses the game after an Assassin you controlled attacked them that turn wins you the game: combat, the loop, a halver.", start: "Pick the mark (whoever your board kills soonest) and send everything that gets through at them. Rule 7: one death is the game." }
  ];
  const COMBO_PIECES = [...new Set(COMBOS.flatMap(c => c.need.flat()))];
  const ALL_PLUS = [...new Set(COMBOS.flatMap(c => c.plus || []))].filter(n => !COMBO_PIECES.includes(n));
  /* Who finds what. `any`: any card. `list`: named cards. */
  const PYRE_FINDS = [RAMSES, BLOOD, "Achilles Davenport", "Roshan, Hidden Magister", "Virtus the Veiled", "Unstoppable Slasher", "Mari, the Killing Quill", "Bloodthirsty Conqueror", "Vein Ripper"];
  const TUTORS = [
    { name: "Demonic Tutor", how: "Any card, to your hand. {1}{B}, sorcery.", any: true },
    { name: "Vampiric Tutor", how: "Any card, to the top. {B}, instant, 2 life: cast it at the end of the turn before yours.", any: true },
    { name: "Imperial Seal", how: "Any card, to the top. {B}, sorcery, 2 life.", any: true },
    { name: "Grim Tutor", how: "Any card, to your hand. {1}{B}{B}, sorcery, 3 life.", any: true },
    { name: "Diabolic Intent", how: "Any card, to your hand. {1}{B}, sacrifice a creature (a stolen 2/2 is ideal).", any: true },
    { name: "Demonic Consultation", how: "Name a card: exile the top six, then reveal until you find it. {B}, instant. It finds anything still in your library, but exiles everything it passes: never name a card that's already gone.", any: true },
    { name: "Pyre of Heroes", how: "{2}, {T}, sacrifice a creature: a creature that shares a type and costs one more, onto the battlefield. Etrata or Mari (3-mana Vampire Assassins) find Ramses or Bloodletter; a 2-mana Assassin finds Virtus, the Slasher or Mari; Changeling Outcast (every type) finds any 2-drop.", list: PYRE_FINDS },
    { name: "Reanimate", how: "A creature card from any graveyard, onto the battlefield. {B}, lose life equal to its mana value. Ramses back for 4 life.", list: PYRE_FINDS.concat(["Etrata, Deadly Fugitive", "Vito, Thorn of the Dusk Rose"]), grave: true }
  ];
  const TUTOR_NAMES = TUTORS.map(t => t.name);
  const short = n => n.split(",")[0];
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const finds = (t, name) => !!(t.any || (t.list && t.list.includes(name)));
  const TUTOR_TARGETS = [RAMSES, BLOOD].concat(HALVERS, DRAINS, PAYOFFS, ["Teferi's Veil", "Kindred Dominance", "Eldrazi Monument", "Leyline of Transformation"]);

  /* The nine piloting rules (REPORT.md "How to pilot it"), with their measured gains: Δ win rate in bot games,
     against three precons / against three Bracket 4 bots, 2,016 or 5,040 paired games. */
  const RULES = [
    { n: 1, title: "Mulligan is the default", text: "Keep a hand that does something by turn 3: two or more lands with blue and black, a 1-2 mana evasive Assassin, and Etrata castable on turn 3 with an Assassin ready to hit; or fast mana plus a real threat; or a turn 1-2 engine with the lands for it. Interaction alone, or draw without development, is not a keep.", gain: "+0.2 / +1.3", cards: ["Changeling Outcast", "Rhystic Study", "Mystic Remora"] },
    { n: 2, title: "Etrata when an Assassin connects", text: "Her trigger works the turn she's cast, and she's kill-on-sight: cast her on the turn an Assassin is already getting through. Greaves on her as soon as you can.", gain: "−0.2 / +1.0", cards: ["Etrata, Deadly Fugitive", "Lightning Greaves"] },
    { n: 3, title: "Tutor for Ramses first", text: "After him the order barely matters. Cast him right before combat, with a counter up if you can.", gain: "anything else first: −8 to −11", cards: [RAMSES, "Demonic Tutor", "Pyre of Heroes"] },
    { n: 4, title: "Don't wait to protect him", text: "Holding Ramses until Greaves can go on him the same turn costs points: he lands in fewer games and a turn later. A turn of his anthem and pressure is worth more than the games he's removed in.", gain: "holding him: −3.8 / −4.8", cards: [RAMSES] },
    { n: 5, title: "Save the last counter for the wrath", text: "And for removal aimed at Ramses or Etrata. Let single creatures and commanders resolve.", gain: "+1.0 / 0.0", cards: ["Force of Will", "Fierce Guardianship", "Swan Song"] },
    { n: 6, title: "Attack with everything once Teferi's Veil is out", text: "The attackers phase out through everyone else's turn and the wraths miss them. Eldrazi Monument does the same job against destroy effects.", gain: "Veil +1.0, Monument +1.9", cards: ["Teferi's Veil", "Eldrazi Monument"] },
    { n: 7, title: "Pick one player and kill them", text: "With Ramses out, one death is the game: the mark is whoever your board kills soonest, every attacker that gets through goes at them, and the rest hit whoever is open. Without Ramses, spread the hits.", gain: "the marking attack: +3.1 / +1.6", cards: [RAMSES, "Virtus the Veiled", BLOOD] },
    { n: 8, title: "Flip rarely", text: "Turn a stolen card up only when it beats the 2/2 it is, after your own spells, never before combat. Cast stolen instants and sorceries through Etrata's exile clause when they matter.", gain: "flipping first: −1.7 / −0.7", cards: ["Etrata, Deadly Fugitive"] },
    { n: 9, title: "Don't hold mana for one-shots", text: "Don't hold five mana for a Hatred-style kill, and don't hold the board back for the crack-back: neither measured anything.", gain: "−0.8 / −0.5 and +0.2 / +0.4", cards: [] }
  ];
  /* REPORT.md's numbers table, bot games (5,040 a field unless noted). */
  const BENCH = [
    { name: "Heist closer (this site's deck)", pre: "47.9% ±0.7", b4: "27.5% ±0.6", round: "9.0 / 8.0", usd: "$1,323", me: true },
    { name: "Heist snowball (no loop)", pre: "40.4% ±0.7", b4: "23.6% ±0.6", round: "8.8 / 7.8", usd: "$1,238" },
    { name: "The snowball without its commander", pre: "23.7% ±0.6", b4: "16.6% ±0.5", round: "9.0 / 8.1", usd: "" },
    { name: "Heist blitz", pre: "31.1% ±0.7", b4: "18.9% ±0.6", round: "9.0 / 8.1", usd: "$1,347" },
    { name: "Etrata B4 aggro (the Etrata site's upgrade, 2,016 / 1,260 games)", pre: "25.4% ±1.0", b4: "14.7% ±1.0", round: "9.4 / 8.7", usd: "" },
    { name: "v3 drain list (this site's old deck, 2,016 / 1,260 games)", pre: "68.0% ±1.0", b4: "41.7% ±1.4", round: "8.2 / 7.3", usd: "about $1,099" }
  ];

  window.DECK_SITE = {
    key: "cetrataWiki", short: "Corrupted Etrata", gameBase: "../miku/game/",
    cards: window.CETRATA_CARDS, wiki: window.CETRATA_WIKI, guide: window.CETRATA_GUIDE,
    glossary: window.CETRATA_GLOSSARY, cuts: window.CETRATA_CUTS, faq: window.CETRATA_FAQ,
    roles: [
      ["cmd", "Commander"], ["assassin", "Evasive Assassins"], ["snowball", "Cloak snowball"], ["kill", "Ramses and the kill"], ["loop", "Drain loop"],
      ["tutor", "Tutors"], ["evasion", "Getting through"], ["removal", "Interaction"], ["draw", "Card advantage"], ["ramp", "Mana"], ["utility", "Utility"], ["land", "Lands"]
    ],
    colors: [["U", "blue", "Island"], ["B", "black", "Swamp"]],
    pipNote: "Etrata asks for {1}{U}{B}, and her flip for {2}{U}{B}. Most of the one-drops are black: Hired Poisoner and Dark Ritual want a Swamp on turn 1.",
    oddsNote: "Eight tutors (Pyre of Heroes and Reanimate included) make the real odds of finding Ramses much better than these draw-only numbers: count a tutor as Ramses.",
    oddsGroups: ({ is }) => [
      { id: "l2", label: "At least 2 lands", lands: 2 },
      { id: "l3", label: "At least 3 lands", lands: 3 },
      { id: "rock", label: "Fast mana (a rock, a Mox, Lotus Petal, Dark Ritual)", f: c => c.cat !== "Land" && c.roles.includes("ramp") },
      { id: "one", label: "A 1-2 mana Assassin", f: c => c.roles.includes("assassin") && c.mv <= 2 },
      { id: "tutor", label: "Any tutor", f: is("tutor") },
      { id: "ramses", label: "Ramses or a tutor", f: c => c.name === RAMSES || c.roles.includes("tutor") },
      { id: "loop", label: "Both halves of the drain loop", both: [DRAINS, PAYOFFS] },
      { id: "verdict", label: "Bloodletter and a halver", both: [[BLOOD], HALVERS] }
    ],
    botSim: null,
    // The v3 drain list's cards that the heist doesn't play keep their wiki entries under their own filter.
    extraCards: window.CETRATA_V3_CARDS || [], extraWiki: window.CETRATA_V3_WIKI || {}, extraChip: "v3 drain list", extraTag: "v3 drain list",
    widgets: api => ({
      killFinder: el => killFinder(el, api), tutorMap: el => tutorMap(el, api), halveCalc: el => halveCalc(el, api),
      pilotRules: el => pilotRules(el, api), benchTable: el => benchTable(el, api), listPicker: el => listPicker(el, api),
      playChecklist: el => playChecklist(el, api), quiz: el => quiz(el, api), buyList: el => buyList(el, api), proxyList: el => proxyList(el, api)
    })
  };

  /* ================================================================ kill finder
     Tick what you have (in hand or on the battlefield) and the tutors in your hand: each kill says whether it's
     live, one tutor away, or further off. */
  function killFinder(el, A) {
    const { $, esc, mana, store, KEY, linkMentions } = A;
    const SK = KEY + ".kill.v1";
    const st = { have: new Set(store.json(SK, [])) };
    const group = (label, names) => `<div class="ts-group"><p class="ts-l mono">${label}</p><div class="chips wrap" role="group" aria-label="${esc(label)}">${names.map(n => `<button class="chip" type="button" data-have="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div></div>`;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Which kill is live?</b></div>
      <p class="muted small">Tap the cards you have, in hand or on the battlefield, and the tutors in your hand. Etrata and an Assassin that can attack are assumed.</p>
      <div class="ts-in">
        ${group("Kill pieces", COMBO_PIECES)}
        ${group("Helpers", ALL_PLUS)}
        ${group("Tutors in hand", TUTOR_NAMES)}
      </div>
      <div class="cc-lines" data-o="out" aria-live="polite"></div>`;
    function run() {
      el.querySelectorAll("[data-have]").forEach(b => b.setAttribute("aria-pressed", String(st.have.has(b.dataset.have))));
      store.put(SK, [...st.have]);
      const tutors = TUTORS.filter(t => st.have.has(t.name) && !t.grave);
      const rows = COMBOS.map((c, k) => {
        const missing = c.need.filter(g => !g.some(n => st.have.has(n)));
        const got = c.need.length - missing.length;
        const used = new Set();
        const fixes = missing.map(g => { const t = tutors.find(t => !used.has(t.name) && g.some(n => finds(t, n))); if (t) used.add(t.name); return t ? { t, n: g.find(n => finds(t, n)) } : null; });
        const reach = missing.length && fixes.every(Boolean);
        const state = !missing.length ? "live" : reach || missing.length === 1 ? "near" : "far";
        return { c, missing, fixes, reach, state, score: (missing.length ? 0 : 100) + (reach ? 50 : 0) - missing.length * 10 + got - k * 0.1 };
      }).sort((a, b) => b.score - a.score);
      const label = r => !r.missing.length ? "Live" : r.reach ? "Tutor it" : r.missing.length === 1 ? "One away" : `${r.missing.length} away`;
      $('[data-o="out"]', el).innerHTML = rows.map(r => `<div class="cc-line ${r.state}">
        <div class="ts-hd"><span class="ts-when-b mono">${label(r)}</span><b>${esc(r.c.name)}</b></div>
        <p>${mana(esc(r.c.result))}</p>
        ${r.missing.length ? `<p class="cc-need">Missing: ${r.missing.map((g, i) => g.map(n => `<i-c>${esc(n)}</i-c>`).join(" or ") + (r.fixes[i] ? ` (your <i-c>${esc(r.fixes[i].t.name)}</i-c> finds <i-c>${esc(r.fixes[i].n)}</i-c>)` : "")).join("; ")}.</p>` : `<p>${mana(esc(r.c.start))}</p>`}
        ${(r.c.plus || []).length ? `<p class="muted small">Better with ${r.c.plus.map(n => `<i-c>${esc(n)}</i-c>${st.have.has(n) ? " ✓" : ""}`).join(", ")}.</p>` : ""}
      </div>`).join("") + (st.have.has(RAMSES) ? "" : `<p class="muted small">No Ramses: the tutors fetch him first (rule 3). With him out the deck won 56% of its bot games against precons, without him 38%.</p>`);
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
    let pick = RAMSES;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>What finds this card?</b></div>
      <div class="chips wrap" role="group" aria-label="Card">${TUTOR_TARGETS.map(n => `<button class="chip" type="button" data-t="${esc(n)}" aria-pressed="false">${esc(short(n))}</button>`).join("")}</div>
      <div class="table-wrap"><table class="stack"><thead><tr><th>Tutor</th><th>How</th></tr></thead><tbody data-o="rows"></tbody></table></div>
      <p class="muted small" data-o="miss"></p>`;
    function run() {
      el.querySelectorAll("[data-t]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.t === pick)));
      const yes = TUTORS.filter(t => finds(t, pick)), no = TUTORS.filter(t => !finds(t, pick));
      const rows = $('[data-o="rows"]', el);
      rows.innerHTML = yes.map(t => `<tr><td data-label="Tutor"><i-c>${esc(t.name)}</i-c></td><td data-label="How">${A.mana(esc(t.how))}</td></tr>`).join("");
      const miss = $('[data-o="miss"]', el);
      miss.innerHTML = `${yes.length} of ${TUTORS.length} find <i-c>${esc(pick)}</i-c>${yes.some(t => t.grave) ? " (Reanimate only once it's in a graveyard)" : ""}. Not: ${no.map(t => `<i-c>${esc(t.name)}</i-c>`).join(", ") || "none"}.${pick === RAMSES ? " Ramses is the first pick for every tutor (rule 3)." : ""}`;
      if (linkMentions) { linkMentions(rows); linkMentions(miss); }
    }
    el.addEventListener("click", e => { const b = e.target.closest("[data-t]"); if (b) { pick = b.dataset.t; run(); } });
    run();
  }

  /* ================================================================ halving calculator
     Combat damage first (doubled by Bloodletter on your turn), then each halving trigger in turn: "that player
     loses half their life, rounded up", each doubled by Bloodletter on your turn. */
  function halveCalc(el, A) {
    const { $, stepperHTML, numIn, bump } = A;
    const tg = (k, label, on) => `<button class="chip" type="button" data-k="${k}" aria-pressed="${on}">${label}</button>`;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Try it</span><b>Does the hit kill?</b></div>
      <div class="w-fields">${stepperHTML("life", "Their life", 40, 1, 99)}${stepperHTML("dmg", "Combat damage to them, all attackers", 1, 0, 60)}${stepperHTML("halves", "Halving triggers (Virtus, the Slasher, Quietus Spike)", 1, 0, 4)}</div>
      <div class="chips wrap" role="group" aria-label="What's out">${tg("blood", "Bloodletter of Aclazotz out, your turn", true)}${tg("ramses", "Ramses out, and an Assassin attacked them", false)}</div>
      <div class="w-out">
        <div><b data-o="combat">0</b><span>life lost to combat damage</span></div>
        <div><b data-o="half">0</b><span>life lost to the halving</span></div>
        <div><b data-o="left">0</b><span>life left</span></div>
      </div>
      <p class="w-verdict" data-o="v"></p>
      <p class="muted small">Bloodletter: "If an opponent would lose life during your turn, they lose twice that much life instead." Damage makes a player lose life, so combat damage doubles too. Each halving trigger resolves on its own, after combat damage: the second takes half of what the first left. Quietus Spike on Virtus or the Slasher is two triggers from one hit.</p>`;
    const out = k => $(`[data-o="${k}"]`, el);
    const on = k => { const i = el.querySelector(`[data-k="${k}"]`); return !!i && i.getAttribute("aria-pressed") === "true"; };
    function run() {
      const blood = on("blood"), n = numIn(el, "halves");
      let life = numIn(el, "life");
      const combat = Math.min(life, numIn(el, "dmg") * (blood ? 2 : 1));
      life -= combat;
      let half = 0;
      for (let i = 0; i < n && life > 0; i++) { const x = Math.min(life, Math.ceil(life / 2) * (blood ? 2 : 1)); half += x; life -= x; }
      bump(out("combat"), combat); bump(out("half"), half); bump(out("left"), Math.max(0, life));
      out("v").innerHTML = life <= 0 ? (on("ramses") ? "<b>Dead, and Ramses wins you the game.</b>" : "<b>Dead.</b> One player, not the game: Ramses turns this into the win.") : `They live at ${life}.${!blood && n ? " Without Bloodletter each trigger only takes half." : ""}`;
    }
    el.addEventListener("input", run);
    el.addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) { b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); run(); } });
    run();
  }

  /* ================================================================ the nine rules and the numbers table */
  function pilotRules(el, A) {
    const { esc, mana, linkMentions } = A;
    el.innerHTML = `<div class="w-head"><span class="w-tag mono">Measured</span><b>The nine piloting rules</b></div>
      <ol class="cl-list">${RULES.map(r => `<li class="swap plain"><span class="tick" aria-hidden="true"><span><em>${r.n}</em></span></span><div class="who"><span class="add"><b>${esc(r.title)}</b></span><span class="cl-text">${mana(esc(r.text))}</span><span class="sub-note"><span class="tag">${esc(r.gain)}</span> ${r.cards.map(n => `<i-c>${esc(n)}</i-c>`).join(" ")}</span></div></li>`).join("")}</ol>
      <p class="muted small">Gains are win-rate points in bot games against three precons / three Bracket 4 bots (paired seeds, 2,016 or 5,040 games). Bots pilot worse than people: the order of the rules transfers better than the exact numbers.</p>`;
    if (linkMentions) linkMentions(el);
  }
  function benchTable(el, A) {
    const { esc } = A;
    el.innerHTML = `<div class="table-wrap"><table class="stack"><thead><tr><th>List</th><th>vs 3 precons</th><th>vs 3 Bracket 4</th><th>Winning round</th><th>Price</th></tr></thead><tbody>${BENCH.map(b => `<tr${b.me ? ' class="me"' : ""}><td data-label="List">${b.me ? `<b>${esc(b.name)}</b>` : esc(b.name)}</td><td data-label="vs 3 precons">${esc(b.pre)}</td><td data-label="vs 3 Bracket 4">${esc(b.b4)}</td><td data-label="Winning round">${esc(b.round)}</td><td data-label="Price">${esc(b.usd)}</td></tr>`).join("")}</tbody></table></div>
      <p class="muted small">Four-player bot games in this site's engine, the hero piloted by a brain written for each deck. Humans at a Bracket 4 table kill Ramses faster and hold up more interaction, so expect lower real numbers. The v3 drain list wins more bot games; the heist is the attacking deck.</p>`;
  }

  /* ================================================================ list picker: the three Etrata lists */
  function listPicker(el, A) {
    const { $, esc, store, KEY, linkMentions, toast } = A;
    const LISTS = window.CETRATA_LISTS || [];
    const SK = KEY + ".list.v1";
    let pick = store.json(SK, "closer");
    if (!LISTS.some(l => l.id === pick)) pick = LISTS[0] && LISTS[0].id;
    const base = LISTS[0];
    const names = l => new Map(l.cards.map(([q, n]) => [n, q]));
    const text = l => l.cards.map(([q, n]) => `${q} ${n}`).join("\n");
    el.innerHTML = `<div class="seg" role="tablist" aria-label="List">${LISTS.map(l => `<button type="button" role="tab" data-l="${esc(l.id)}">${esc(l.short)}<small>${l.vsPrecon}% / ${l.vsB4}%</small></button>`).join("")}</div><div data-o="body"></div>`;
    function run() {
      store.put(SK, pick);
      el.querySelectorAll("[data-l]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.l === pick)));
      const l = LISTS.find(x => x.id === pick);
      const a = names(base), b = names(l);
      const adds = l === base ? [] : [...b].filter(([n, q]) => (a.get(n) || 0) < q).map(([n, q]) => [q - (a.get(n) || 0), n]);
      const cuts = l === base ? [] : [...a].filter(([n, q]) => (b.get(n) || 0) < q).map(([n, q]) => [q - (b.get(n) || 0), n]);
      const link = n => `<i-c>${esc(n)}</i-c>`;
      $('[data-o="body"]', el).innerHTML = `<p class="prose"><b>${esc(l.name)}.</b> ${esc(l.blurb)}</p>
        <div class="w-out"><div><b>${l.vsPrecon}%</b><span>vs three precons (bot games)</span></div><div><b>${l.vsB4}%</b><span>vs three Bracket 4 bots</span></div><div><b>${esc(l.round)}</b><span>average winning round</span></div></div>
        ${l === base ? "" : `<div class="swaps-2"><section class="cl-sec"><h3>In this list, not in the closer (${adds.reduce((s, [q]) => s + q, 0)})</h3><p class="small">${adds.map(([q, n]) => (q > 1 ? q + " " : "") + link(n)).join(", ")}</p></section><section class="cl-sec"><h3>In the closer, not in this list (${cuts.reduce((s, [q]) => s + q, 0)})</h3><p class="small">${cuts.map(([q, n]) => (q > 1 ? q + " " : "") + link(n)).join(", ")}</p></section></div>`}
        <div class="btn-row"><button class="btn primary" type="button" data-copy>Copy this list (${l.total} cards)</button></div>
        <p class="muted small">${l.id === "v3" ? "The v3 list is still playable: pick it in the Play tab's deck picker." : "Paste it into Moxfield or Archidekt to build or tweak it."}</p>`;
      if (linkMentions) linkMentions(el);
    }
    el.addEventListener("click", e => {
      const b = e.target.closest("[data-l]"); if (b) { pick = b.dataset.l; run(); return; }
      if (e.target.closest("[data-copy]")) {
        const t = text(LISTS.find(x => x.id === pick));
        (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast("List copied"), () => toast("Couldn't copy"));
      }
    });
    run();
  }

  /* ================================================================ the play checklist */
  function playChecklist(el, A) {
    const { esc, mana, store, KEY, linkMentions, toast } = A;
    const list = (window.MK_CHECKLISTS || {})["etrata-heist"] || [];
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
    const TOPICS = [["all", "All"], ["kills", "Kills"], ["snowball", "Snowball"], ["tutors", "Tutors"], ["cards", "Cards"], ["rules", "Rules"], ["plan", "Game plan"], ["mana", "Mana"], ["rulings", "Hard rulings"]]
      .filter(([k]) => k === "all" || QS.some(q => q.topic === k));
    const SK = KEY + ".quiz.v1";
    const st = Object.assign({ box: {}, seen: 0, right: 0, topic: "all", mode: "quiz", streak: 0, best: 0 }, store.json(SK, {}));
    const save = () => store.put(SK, st);
    // answer buttons can't hold card links (a tap would open the card): names in bold instead
    const plain = h => String(h).replace(/<i-c>(.*?)<\/i-c>/g, "<b>$1</b>");
    const FLASH = CARDS.filter(c => c.why && (c.cat !== "Land" || /Rogue's Passage|Path of Ancestry|Secluded Courtyard|Cavern of Souls|Brotherhood Headquarters|Mutavault|Ancient Tomb/.test(c.name)));
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
        <section class="cl-sec"><h3>Take from your Etrata deck (${count(keep)})</h3><p class="muted small">Pull these out of the Etrata deck. Your Etrata deck has 11 Islands and 10 Swamps; this one needs 8 Islands and 7 Swamps.</p>
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
        <p class="muted small">Cheapest nonfoil paper printing, Scryfall's TCGplayer market price in US dollars from its data of ${esc(P.date || "")}; each price links to the TCGplayer page. Euros at ×0.85. Check Cardmarket before buying. Cards that are also in the <a href="../etrata/">Etrata deck</a> start ticked.</p>`;
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
