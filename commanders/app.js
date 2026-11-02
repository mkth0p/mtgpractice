/* Hidden gem commanders: the list, the filters and the personality quiz. No build step. */
(() => {
  const CM = window.CMDRS || [];
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLOR = { W: "White", U: "Blue", B: "Black", R: "Red", G: "Green" };
  const HEX = { W: "#e9dfbd", U: "#3d8ee0", B: "#4a4250", R: "#e2553b", G: "#2f9a57" };
  // How much each commander looks like a known cEDH shell (for the "looks like a cEDH copy" answer).
  const KNOWN = { naru: 1, kitsa: 2, arcum: 2, teshar: 2, sharuum: 1 };

  const pips = cost => esc(cost).replace(/\{([^}]+)\}/g, (m, s) => {
    const p = s.split("/");
    if (p.length === 2) return `<span class="ms" style="background:linear-gradient(135deg, ${HEX[p[0]]} 50%, ${HEX[p[1]]} 50%)" title="${s}"></span>`;
    return `<span class="ms ${/^[WUBRG]$/.test(s) ? s : ""}">${/^[WUBRG]$/.test(s) ? "" : s}</span>`;
  });
  const art = n => "https://api.scryfall.com/cards/named?exact=" + encodeURIComponent(n) + "&format=image&version=art_crop";
  const initials = n => n.split(/[ ,]+/).filter(w => /^[A-Z]/.test(w)).slice(0, 2).map(w => w[0]).join("");
  const grad = c => { const cs = c.colors.split(""); return `--c1:${HEX[cs[0]]};--c2:${HEX[cs[cs.length - 1]] === HEX[cs[0]] ? "#10151b" : HEX[cs[cs.length - 1]]}`; };
  const dots = p => "●".repeat(p) + "<s>" + "●".repeat(5 - p) + "</s>";
  const fmt = n => n.toLocaleString("en-US");
  const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage off */ } } };

  const sorted = [...CM].map(c => c.decks).sort((a, b) => a - b);
  $("#f-n").textContent = CM.length;
  $("#f-med").textContent = fmt(Math.round((sorted[9] + sorted[10]) / 2));

  /* ---------- the list ---------- */
  const comboHtml = (k, label) => k ? `<div class="combo"><b>${esc(label)}:</b> ${esc(k.pieces)}. <br>${esc(k.result)}. <a href="https://commanderspellbook.com/combo/${esc(k.id)}/" target="_blank" rel="noopener">${fmt(k.decks)} decks on Commander Spellbook ↗</a></div>` : "";
  const card = c => `
    <article class="cmd" id="c-${c.id}">
      <div class="art" style="${grad(c)}"><span class="initials" aria-hidden="true">${initials(c.name)}</span><img src="${art(c.name)}" alt="" loading="lazy" onerror="this.remove()">
        <span class="tag decks">${fmt(c.decks)} decks</span><span class="tag rank">#${fmt(c.rank)}</span></div>
      <div class="cbody">
        <div class="cname"><b>${esc(c.name)}</b><span class="pips">${pips(c.cost) || "—"}</span></div>
        <span class="ctype">${esc(c.type)}${c.pt ? " · " + esc(c.pt) : ""}</span>
        <p class="hook">${esc(c.hook)}</p>
        <div class="stats"><span>${c.colors.split("").map(x => `<span class="cpip" style="background:${HEX[x]}" title="${COLOR[x]}"></span>`).join(" ")}</span><span title="Our estimate of its Bracket 4 ceiling">Power <span class="dots">${dots(c.power)}</span></span></div>
        <p style="margin:2px 0 0;color:var(--muted);font-size:.93rem">${esc(c.pitch)}</p>
        <details>
          <summary>Card text, combo and the catch</summary>
          <div class="blk"><h4>Card text</h4><p class="oracle">${esc(c.oracle)}${c.back ? `\n\n<b>${esc(c.back.name)}</b> (${esc(c.back.pt)})\n${esc(c.back.oracle)}` : ""}</p></div>
          <div class="blk"><h4>How it wins</h4><p>${esc(c.plan)}</p></div>
          <div class="blk"><h4>Combo</h4>${c.combo ? comboHtml(c.combo, "Main line") + comboHtml(c.alt, "Also") : `<p>${esc(c.nocombo)}</p>`}</div>
          <div class="blk warn"><h4>The catch</h4><p>${esc(c.watch)}</p></div>
          <div class="links"><a href="https://edhrec.com/commanders/${c.slug}" target="_blank" rel="noopener">EDHREC ↗</a><a href="https://scryfall.com/search?q=${encodeURIComponent('!"' + c.name + '"')}" target="_blank" rel="noopener">Scryfall ↗</a></div>
        </details>
      </div>
    </article>`;

  const view = store.get("hiddenGems.view", { colors: [], sort: "decks" });
  const tools = $("#tools");
  tools.innerHTML = Object.keys(COLOR).map(k => `<button type="button" class="chip" data-col="${k}" aria-pressed="${view.colors.includes(k)}"><span class="cpip" style="background:${HEX[k]}"></span>${COLOR[k]}</button>`).join("") +
    `<span class="shown" id="shown"></span><select id="sort" aria-label="Sort"><option value="decks">Fewest decks first</option><option value="power">Most powerful first</option><option value="name">A to Z</option></select>`;
  $("#sort").value = view.sort;
  function renderList() {
    // A color filter keeps commanders that use only colors from the picked set (what you could play with them).
    const list = CM.filter(c => !view.colors.length || c.colors.split("").every(x => view.colors.includes(x)));
    list.sort(view.sort === "power" ? (a, b) => b.power - a.power || a.decks - b.decks : view.sort === "name" ? (a, b) => a.name.localeCompare(b.name) : (a, b) => a.decks - b.decks);
    $("#grid").innerHTML = list.map(card).join("") || `<p class="note">No commander here uses only those colors. Add a color.</p>`;
    $("#shown").textContent = view.colors.length ? `${list.length} within ${view.colors.map(k => COLOR[k]).join(", ")}` : "";
    store.set("hiddenGems.view", view);
  }
  tools.addEventListener("click", e => {
    const b = e.target.closest("[data-col]"); if (!b) return;
    const k = b.dataset.col, i = view.colors.indexOf(k);
    i < 0 ? view.colors.push(k) : view.colors.splice(i, 1);
    b.setAttribute("aria-pressed", String(i < 0)); renderList();
  });
  $("#sort").onchange = e => { view.sort = e.target.value; renderList(); };
  renderList();

  /* ---------- the quiz ---------- */
  // Each answer adds weight to traits. A commander's match is how well its traits line up with yours
  // (cosine similarity), plus how well its colors and power fit what you asked for.
  const TRAIT_WHY = {
    steal: "you want to use the other players' cards against them", time: "you like bending time: extra turns, extra combats, acting when you shouldn't",
    spells: "you love instants and sorceries", artifacts: "you like artifact engines", creatures: "you like creatures doing the work", lands: "you like lands and mana tricks",
    walkers: "you love planeswalkers and enchantments", rule: "you want a commander that changes the rules just by being there", engine: "you want an engine you use every turn",
    loop: "you want a combo the table didn't see coming", finite: "you prefer one big finite turn", control: "you like holding up interaction",
    yard: "you like the graveyard as a second hand", chaos: "you enjoy chaos and surprise", tutor: "you want the same reliable line every game", complex: "you don't mind long, intricate turns"
  };
  const Q = [
    { k: "win", t: "The win that makes you grin is…", o: [
      { t: "They lose to their own cards", d: "Their spells, creatures or decks turn on them.", w: { steal: 3, rule: 1 } },
      { t: "I take turn after turn", d: "Nobody else gets to play.", w: { time: 3, finite: 1 } },
      { t: "A loop nobody saw coming", d: "Two odd cards meet, the table says “how?!”.", w: { loop: 3, tutor: 1 } },
      { t: "One giant, finite swing", d: "No infinite, just a huge turn.", w: { finite: 3, creatures: 1 } }] },
    { k: "fantasy", t: "Pick a fantasy.", o: [
      { t: "Puppet master", d: "Everyone else's stuff works for me.", w: { steal: 3, control: 1 } },
      { t: "Time mage", d: "I decide when things happen.", w: { time: 3, spells: 1 } },
      { t: "Mad engineer", d: "A machine of odd parts.", w: { artifacts: 3, engine: 1 } },
      { t: "Archmage", d: "Spells, copies and counterspells.", w: { spells: 3, control: 1 } },
      { t: "Terraformer", d: "The land itself is my weapon.", w: { lands: 3, creatures: 1 } }] },
    { k: "role", t: "Your commander should be…", o: [
      { t: "The rule", d: "It changes how the game works just by existing.", w: { rule: 3 } },
      { t: "An engine", d: "Something I use every single turn.", w: { engine: 3 } },
      { t: "Half of a combo", d: "The deck finds the other half.", w: { loop: 2, tutor: 1 } },
      { t: "The payoff", d: "I build up to it, then it cashes in.", w: { finite: 2, creatures: 1 } }] },
    { k: "board", t: "Mid-game, your board looks like…", o: [
      { t: "A few odd permanents that clearly connect", w: { artifacts: 2, engine: 1, walkers: 1 } },
      { t: "A wide board of creatures", w: { creatures: 3 } },
      { t: "Lands. Lots of lands.", w: { lands: 3 } },
      { t: "Almost empty, cards in hand", w: { spells: 2, control: 2 } },
      { t: "The graveyard is my real board", w: { yard: 3 } }] },
    { k: "answer", t: "Someone points removal at your plan. You…", o: [
      { t: "Counter it", d: "I kept the mana up.", w: { control: 3, spells: 1 } },
      { t: "Let it die, it comes back", d: "The graveyard is my backup.", w: { yard: 2, loop: 1 } },
      { t: "Have another copy of the plan", d: "Tutors and redundancy.", w: { tutor: 2, engine: 1 } },
      { t: "Smile: their cards don't work", d: "My commander already shut that down.", w: { rule: 2, steal: 1, control: 1 } }] },
    { k: "types", t: "Which card type makes you happiest?", o: [
      { t: "Planeswalkers and enchantments", w: { walkers: 3 } }, { t: "Artifacts", w: { artifacts: 3 } },
      { t: "Instants and sorceries", w: { spells: 3 } }, { t: "Creatures", w: { creatures: 3 } }, { t: "Lands", w: { lands: 3 } }] },
    { k: "luck", t: "How do you feel about luck?", o: [
      { t: "Chaos is the fun part", w: { chaos: 3 } },
      { t: "Calculated risk", d: "I'll gamble when the odds are mine.", w: { finite: 1, time: 1, chaos: 1 } },
      { t: "Same reliable line every game", w: { tutor: 2, loop: 1, chaos: -2 } }] },
    { k: "complex", t: "How intricate can your turns be?", o: [
      { t: "Keep it readable", d: "The table should follow what I do.", w: { complex: -2 } },
      { t: "Medium", d: "A few moving parts is fine.", w: { complex: .5 } },
      { t: "Bring on the 20-step loops", w: { complex: 3 } }] },
    { k: "pace", t: "Your favorite pacing is…", o: [
      { t: "Calm, then one boom turn", w: { finite: 2, time: 1, control: 1 } },
      { t: "A steady engine that snowballs", w: { engine: 2, creatures: 1 } },
      { t: "Win the moment the pieces meet", w: { loop: 2, tutor: 1 } }] },
    { k: "yard", t: "The graveyard is…", o: [
      { t: "My main zone", w: { yard: 3 } }, { t: "A backup plan", w: { yard: .5 } }, { t: "Somewhere I'd rather not depend on", w: { yard: -2 } }] },
    { k: "colors", t: "Which colors do you want to play?", help: "Pick any you'd be happy with. Pick none if colors don't matter.", multi: true },
    { k: "power", t: "How hard should it hit?", o: [
      { t: "Right at the top of Bracket 4", p: 3 }, { t: "Strong, but fun first", p: 1 }, { t: "The feel matters more than raw power", p: 0 }] },
    { k: "hate", t: "Which would you hate most?", o: [
      { t: "Being called a stax player", w: { control: -2, rule: -1 } },
      { t: "Long, fiddly turns", w: { complex: -2 } },
      { t: "Losing to random draws", w: { chaos: -2 } },
      { t: "Looking like a cEDH copy", w: { known: -3 } }] }
  ];
  // ju's answers from the 2026-10-12 commander search (project memory), mapped onto this quiz.
  const PRESET = { win: 0, fantasy: 0, role: 0, board: 0, answer: 3, types: 0, luck: 1, complex: 1, pace: 0, yard: 1, colors: ["W", "U", "B"], power: 0, hate: 3 };

  let st = store.get("hiddenGems.quiz", { step: 0, a: {} });
  const box = $("#quiz");

  function score(a) {
    const U = {};
    Q.forEach(q => { if (q.o && a[q.k] != null) { const w = q.o[a[q.k]].w || {}; for (const t in w) U[t] = (U[t] || 0) + w[t]; } });
    const powW = a.power != null ? Q.find(q => q.k === "power").o[a.power].p : 1;
    const cols = a.colors || [];
    const keys = Object.keys(U);
    const nu = Math.hypot(...keys.map(t => U[t])) || 1;
    return CM.map(c => {
      const T = { ...c.traits, known: KNOWN[c.id] || 0 };
      const nt = Math.hypot(...Object.values(T)) || 1;
      let dot = 0; const parts = [];
      keys.forEach(t => { const v = U[t] * (T[t] || 0); dot += v; if (v > 0 && TRAIT_WHY[t]) parts.push([v, t]); });
      const cos = dot / (nu * nt);                                   // -1 .. 1
      const cs = c.colors.split("");
      const colorFit = cols.length ? cs.filter(x => cols.includes(x)).length / cs.length : 1;
      const powerFit = (c.power - 1) / 4 * powW / 3;                 // 0 when power doesn't matter to you
      const s = .7 * (cos + 1) / 2 + .18 * colorFit + .12 * powerFit;
      return { c, s, colorFit, why: parts.sort((x, y) => y[0] - x[0]).slice(0, 3).map(p => TRAIT_WHY[p[1]]) };
    }).sort((x, y) => y.s - x.s);
  }

  function renderQ() {
    const q = Q[st.step], a = st.a, n = Q.length;
    const top = `<div class="qtop"><div class="bar"><i style="width:${(st.step / n) * 100}%"></i></div><span class="count">${st.step + 1} / ${n}</span></div>`;
    let body;
    if (q.multi) {
      const sel = a.colors || [];
      body = `<div class="colors">${Object.keys(COLOR).map(k => `<button type="button" class="opt" data-col="${k}" aria-pressed="${sel.includes(k)}"><span class="cpip" style="background:${HEX[k]}"></span><b>${COLOR[k]}</b></button>`).join("")}</div>`;
    } else {
      body = `<div class="opts">${q.o.map((o, i) => `<button type="button" class="opt" data-i="${i}" aria-pressed="${a[q.k] === i}"><b>${esc(o.t)}</b>${o.d ? `<small>${esc(o.d)}</small>` : ""}</button>`).join("")}</div>`;
    }
    box.innerHTML = `${top}<h2 class="qtitle">${esc(q.t)}</h2><p class="qhelp">${q.help ? esc(q.help) : st.step === 0 ? "Thirteen quick questions. Go with your gut." : "&nbsp;"}</p>${body}
      <div class="qnav"><span>${st.step > 0 ? `<button type="button" class="link" id="qback">← Back</button>` : `<button type="button" class="link" id="qpreset">Fill in my answers from October</button>`}</span>
      ${q.multi ? `<button type="button" class="btn main" id="qnext">${(a.colors || []).length ? "Next" : "Any colors, next"}</button>` : st.step === n - 1 && a[q.k] != null ? `<button type="button" class="btn main" id="qdone">See my match</button>` : ""}</div>`;
    box.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { a[q.k] = +b.dataset.i; next(); });
    box.querySelectorAll("[data-col]").forEach(b => b.onclick = () => {
      const s = a.colors = a.colors || [], k = b.dataset.col, i = s.indexOf(k);
      i < 0 ? s.push(k) : s.splice(i, 1); store.set("hiddenGems.quiz", st); renderQ();
    });
    const g = id => box.querySelector(id);
    if (g("#qback")) g("#qback").onclick = () => { st.step--; save(); };
    if (g("#qnext")) g("#qnext").onclick = () => { a.colors = a.colors || []; next(); };
    if (g("#qdone")) g("#qdone").onclick = () => { st.step = n; save(); };
    if (g("#qpreset")) g("#qpreset").onclick = () => { st = { step: n, a: JSON.parse(JSON.stringify(PRESET)), preset: true }; save(); };
  }
  function next() { st.step++; save(); }
  function save() { store.set("hiddenGems.quiz", st); st.step >= Q.length ? renderResult() : renderQ(); }

  function renderResult() {
    const r = score(st.a), w = r[0], c = w.c;
    const best = r[0].s, worst = r[r.length - 1].s;
    const pct = s => Math.round(55 + 44 * (s - worst) / ((best - worst) || 1));
    const why = w.why.length ? w.why : ["it lines up best with your answers overall"];
    if (w.colorFit < 1) why.push("it does use a color you didn't pick, but nothing in your colors scored higher");
    box.innerHTML = `
      <div class="res-head"><span class="count" style="font:600 12px/1 var(--f-mono);color:var(--muted)">${st.preset ? "FROM YOUR OCTOBER ANSWERS" : "YOUR MATCH"}</span>
        <span><button type="button" class="link" id="qedit">Change answers</button> · <button type="button" class="link" id="qreset">Start over</button></span></div>
      <div class="winner">
        <div class="art" style="${grad(c)}"><span class="initials" aria-hidden="true">${initials(c.name)}</span><img src="${art(c.name)}" alt="" onerror="this.remove()"><span class="tag decks">${fmt(c.decks)} decks</span></div>
        <div><span class="pips">${pips(c.cost)}</span>
          <h3>${esc(c.name)}</h3>
          <p class="hook">${esc(c.hook)}</p>
          <p style="margin:6px 0 0;color:var(--muted)">${esc(c.pitch)}</p>
          <ul class="why">${why.map(x => `<li>Because ${esc(x)}.</li>`).join("")}</ul>
          <div class="cta" style="margin-top:16px"><a class="btn main" href="#c-${c.id}" data-jump="${c.id}">Read the full card</a></div>
        </div>
      </div>
      <div class="runners">${r.slice(1, 5).map((x, i) => `<a class="runner" href="#c-${x.c.id}" data-jump="${x.c.id}"><span class="n">#${i + 2}</span><span><b>${esc(x.c.name)}</b><br><small style="color:var(--muted)">${esc(x.c.hook)}</small></span><span style="display:grid;gap:4px;justify-items:end"><span class="meter"><i style="width:${pct(x.s)}%"></i></span><span class="pct">${pct(x.s)}%</span></span></a>`).join("")}</div>
      ${st.preset ? `<p class="note" style="margin:14px 0 0">These answers come from what you told me on 2026-10-12: puppet master, a commander that is “the rule”, a few odd connected permanents, tricking interaction, planeswalkers and enchantments, calculated risk, medium turns, calm then one boom turn, graveyard as backup, white/blue/black. Change any of them with “Change answers”.</p>` : ""}`;
    box.querySelector("#qedit").onclick = () => { st.step = 0; st.preset = false; save(); };
    box.querySelector("#qreset").onclick = () => { st = { step: 0, a: {} }; save(); };
    box.querySelectorAll("[data-jump]").forEach(l => l.onclick = () => {
      if (view.colors.length) { view.colors = []; tools.querySelectorAll("[data-col]").forEach(b => b.setAttribute("aria-pressed", "false")); renderList(); }
      document.querySelectorAll(".cmd.hit").forEach(x => x.classList.remove("hit"));
      const el = document.getElementById("c-" + l.dataset.jump);
      if (el) { el.classList.add("hit"); const d = el.querySelector("details"); if (d) d.open = true; }
    });
  }
  save();
})();
