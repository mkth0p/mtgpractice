/* Learn Arcs: the interactive pieces a lesson step can show with `widget: [name, opts]`.
   Each one is (el, opts, api); api.done() unlocks Next when the step has a `gate`. */
(function () {
  "use strict";
  const LW = window.LW = window.LW || {};
  const H = () => LW._;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const title = t => `<p class="wt">👆 ${t}</p>`;
  function say(el, html, kind) {
    const m = $(".msg", el);
    m.className = "msg " + (kind || "");
    m.setAttribute("role", "status");
    m.innerHTML = H().fmt(html);
  }
  const shake = node => { if (!node) return; node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); };
  const img = (src, alt, cls) => `<img class="${cls || "piece"}" src="img/${src}" alt="${alt || ""}">`;

  /* A run of small questions, one after the other. Wrong answers explain themselves; done() after the last.
     items: [{ html, options: [{ t, ok, why }] }] */
  function series(el, items, api, intro) {
    let i = 0;
    const draw = () => {
      const it = items[i];
      el.innerHTML = (intro ? title(intro) : "") + `<div class="ser"><div class="ser-n">${i + 1} / ${items.length}</div>${H().fmt(it.html)}
        <div class="ser-opts">${it.options.map((o, k) => `<button class="btn sm" type="button" data-k="${k}">${H().fmt(o.t)}</button>`).join("")}</div></div><div class="msg"></div>`;
      $$("[data-k]", el).forEach(b => b.onclick = () => {
        const o = it.options[+b.dataset.k];
        if (!o.ok) { b.disabled = true; b.classList.add("no"); shake(b); H().sfx("bad"); say(el, "<b>Not quite.</b> " + (o.why || "Try another answer."), "bad"); return; }
        $$("[data-k]", el).forEach(x => x.disabled = true);
        b.classList.add("yes"); H().sfx("ok"); H().pop(b, "✓");
        const last = i === items.length - 1;
        say(el, "<b>Yes!</b> " + (o.why || "") + (last ? " That's all of them 🎉" : ""), "good");
        const m = $(".msg", el);
        if (last) { api.done(); return; }
        m.insertAdjacentHTML("beforeend", ` <button class="btn sm go" type="button" id="ser-next">Next one →</button>`);
        $("#ser-next", el).onclick = () => { i++; draw(); };
      });
    };
    draw();
  }

  /* Lesson 2: name the real pieces. */
  LW.pieces = function (el, o, api) {
    const names = ["Ship", "City", "Starport", "Agent", "Initiative marker", "Fuel", "Material", "Relic", "Psionic", "Weapon"];
    const why = { Ship: "Ships move and fight.", City: "Cities are taxed for resources.", Starport: "Starports build ships.", Agent: "Agents go on Court cards.", "Initiative marker": "Whoever holds it leads the round." };
    const list = [["ship-blue.png", "Ship"], ["city-yellow.png", "City"], ["starport-red.png", "Starport"], ["agent-white.png", "Agent"], ["res-fuel.png", "Fuel"], ["initiative.png", "Initiative marker"], ["res-relic.png", "Relic"], ["res-psionic.png", "Psionic"]];
    series(el, list.map(([src, name]) => {
      const opts = H().shuffle(names.filter(n => n !== name)).slice(0, 2).concat(name);
      return { html: `<div class="ser-pic">${img(src, "Which piece is this?", "big-piece")}</div><p>What is this?</p>`,
        options: H().shuffle(opts).map(t => ({ t, ok: t === name, why: t === name ? (why[name] || "A resource token.") : "Look again: it's not a " + t.toLowerCase() + "." })) };
    }), api, "Name each piece");
  };

  /* A small made-up map: 3 clusters, each a gate and 3 planets. A line = adjacent (a thin border). */
  const MAP = (() => {
    const N = {}, E = [];
    const res = ["material", "fuel", "relic", "psionic", "weapon", "fuel", "material", "psionic", "relic"];
    [100, 300, 500].forEach((x, c) => {
      const g = "G" + (c + 1);
      N[g] = { x, y: 215, gate: true, label: "Gate " + (c + 1) };
      ["a", "b", "c"].forEach((p, k) => {
        const id = "P" + (c + 1) + p;
        N[id] = { x: x + (k - 1) * 66, y: k === 1 ? 62 : 102, res: res[c * 3 + k], label: "Planet" };
        E.push([g, id]);
      });
      E.push(["P" + (c + 1) + "a", "P" + (c + 1) + "b"], ["P" + (c + 1) + "b", "P" + (c + 1) + "c"]);
    });
    E.push(["G1", "G2"], ["G2", "G3"], ["P1c", "P2a"], ["P2c", "P3a"]);
    const adj = (a, b) => E.some(e => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a));
    return { N, E, adj };
  })();
  function mapSvg(o) {
    o = o || {};
    const { N, E } = MAP;
    let s = `<svg class="minimap" viewBox="0 0 600 270" role="group" aria-label="${o.label || "Practice map"}">`;
    [100, 300, 500].forEach((x, c) => { s += `<rect class="cl" x="${x - 98}" y="22" width="196" height="238" rx="26"/><text class="cl-t" x="${x}" y="254">Cluster ${c + 1}</text>`; });
    E.forEach(([a, b]) => { s += `<line class="edge" x1="${N[a].x}" y1="${N[a].y}" x2="${N[b].x}" y2="${N[b].y}"/>`; });
    Object.entries(N).forEach(([id, n]) => {
      const cls = ["node", n.gate ? "gate" : "planet", (o.cls && o.cls[id]) || ""].join(" ");
      const r = n.gate ? 26 : 22;
      const lab = n.gate ? n.label : "Planet (" + n.res + ")";
      s += `<g class="${cls}" data-n="${id}" ${o.tap ? `tabindex="0" role="button"` : ""} aria-label="${lab}${o.aria && o.aria[id] ? ", " + o.aria[id] : ""}">
        ${n.gate ? `<polygon points="${[0, 1, 2, 3, 4, 5].map(k => `${n.x + r * Math.cos(Math.PI / 3 * k)},${n.y + r * Math.sin(Math.PI / 3 * k)}`).join(" ")}"/>` : `<circle cx="${n.x}" cy="${n.y}" r="${r}"/>`}
        ${n.gate ? `<text x="${n.x}" y="${n.y + 6}">${id.slice(1)}</text>` : `<image href="img/icon-${n.res}.png" x="${n.x - 12}" y="${n.y - 12}" width="24" height="24"/>`}
        ${o.extra && o.extra[id] ? o.extra[id] : ""}</g>`;
    });
    return s + `</svg>`;
  }
  function tapNodes(el, fn) {
    $$("[data-n]", el).forEach(g => {
      g.onclick = () => fn(g.dataset.n, g);
      g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fn(g.dataset.n, g); } };
    });
  }

  LW.mapdemo = function (el) {
    el.innerHTML = mapSvg({ label: "A practice map with 3 clusters" }) +
      `<p class="small muted legend"><span class="lg gate"></span> gate (numbered) &nbsp; <span class="lg planet"></span> planet, with its resource &nbsp; <span class="lg line"></span> thin border = adjacent</p>
       <p class="small muted">A simplified practice map. The real board has 6 clusters drawn as regions; thin borders between them show what's adjacent.</p>`;
  };

  /* Lesson 3: tap every neighbour of the glowing system. */
  LW.adjacent = function (el, o, api) {
    const rounds = ["P1b", "G2", "P1c"];
    let r = 0, found = new Set();
    const draw = (msg, kind) => {
      const t = rounds[r], cls = { [t]: "target" };
      found.forEach(f => cls[f] = "found");
      const need = Object.keys(MAP.N).filter(n => MAP.adj(t, n)).length;
      el.innerHTML = title(`Tap every system next to the glowing one (${found.size} of ${need})`) + mapSvg({ tap: true, cls, label: "Practice map, tap the neighbours" }) + `<div class="msg"></div>`;
      say(el, msg || `Round ${r + 1} of ${rounds.length}.`, kind);
      tapNodes(el, (n, g) => {
        if (n === t) { say(el, "That's the glowing system itself. Tap the ones next to it.", "bad"); return; }
        if (found.has(n)) return;
        if (!MAP.adj(t, n)) { shake(g); H().sfx("bad"); say(el, "Not adjacent: there's no line (no thin border) between them.", "bad"); return; }
        found.add(n); H().sfx("tap");
        if (found.size === need) {
          H().sfx("ok");
          if (r === rounds.length - 1) { draw("All found! You can read the map 🎉", "good"); api.done(); return; }
          const wasGate = MAP.N[t].gate;
          r++; found = new Set();
          draw(wasGate ? "Yes! A gate touches its planets and the neighbouring gates. Next one." : "Yes! Next one.", "good");
          return;
        }
        draw("Good, keep going.", "good");
      });
    };
    draw();
  };

  /* Lesson 4: who controls each system? Fresh ships only. */
  LW.control = function (el, o, api) {
    const sh = (col, n, dmg) => Array.from({ length: n }, () => img(`ship-${col}.png`, "", "mini " + (dmg ? "dmg" : ""))).join("");
    const items = [
      { html: `<div class="sys">${sh("red", 2)}${sh("blue", 1)}</div><p>Red: 2 fresh ships. Blue: 1 fresh ship.</p>`, ans: "Red", why: "2 fresh beats 1 fresh." },
      { html: `<div class="sys">${sh("red", 2)}${sh("blue", 2)}</div><p>Red: 2 fresh. Blue: 2 fresh.</p>`, ans: "Nobody", why: "A tie means nobody controls it." },
      { html: `<div class="sys">${sh("red", 3, true)}${sh("blue", 1)}</div><p>Red: 3 damaged (tipped over). Blue: 1 fresh.</p>`, ans: "Blue", why: "Damaged ships don't count. 1 fresh beats 0." },
      { html: `<div class="sys">${sh("red", 1)}${sh("red", 1, true)}${sh("blue", 1)}${img("city-blue.png", "", "mini")}</div><p>Red: 1 fresh + 1 damaged. Blue: 1 fresh ship and a city.</p>`, ans: "Nobody", why: "Buildings and damaged ships don't count: it's 1 fresh ship each, a tie." }
    ];
    series(el, items.map(it => ({ html: it.html, options: ["Red", "Blue", "Nobody"].map(t => ({ t, ok: t === it.ans, why: t === it.ans ? it.why : "Count only the fresh (standing) ships." })) })), api, "Who controls this system?");
  };

  /* Lesson 5: tap cards to read them. */
  LW.readcard = function (el, o, api) {
    const list = ["adm2", "agg6", "con4", "mob5", "agg7", "con2"];
    const seen = new Set();
    el.innerHTML = title("Tap a card to read it") + `<div class="cards">${list.map(c => H().card(c, { button: true, data: { c }, sm: true })).join("")}</div><div class="msg">Tap any card.</div>`;
    $$("[data-c]", el).forEach(b => b.onclick = () => {
      const c = b.dataset.c, s = H().SUITS[c.slice(0, 3)], n = +c.slice(3), p = H().PIPS[n], a = H().AMB[n];
      seen.add(c); $$("[data-c]", el).forEach(x => x.classList.toggle("sel", x === b));
      say(el, `<b>${s.name} ${n}</b>: ${p} pip${p > 1 ? "s" : ""}, so <b>${p} action${p > 1 ? "s" : ""}</b> when you lead or Surpass. Each one is ${s.acts.join(" or ")}. ${a === "any" ? "Ambition: <b>any one you like</b>. (7s are only used with 4 players.)" : `Ambition: <b>${a}</b>.`}${seen.size >= 3 ? " ✓" : ""}`, "good");
      if (seen.size === 3) api.done();
    });
  };

  /* Lesson 7: play a card against the lead card. */
  LW.follow = function (el, o, api) {
    const rounds = [{ lead: "agg4", hand: ["agg5", "agg2", "con6", "mob5"] }, { lead: "con4", hand: ["con6", "adm2", "con2", "mob5"] }, { lead: "mob4", hand: ["mob6", "agg4", "adm5", "mob2"] }];
    let r = 0, good = 0, pick = null;
    const draw = (msg, kind) => {
      const R = rounds[r % rounds.length];
      el.innerHTML = title(`Make a good play (${good} of 3)`) + `<div class="table-row"><div><div class="lbl">Lead card</div>${H().card(R.lead, { sm: true })}</div>
        <div><div class="lbl">Your hand: pick a card</div><div class="cards hand">${R.hand.map(c => H().card(c, { button: true, sm: true, data: { c }, cls: pick === c ? "sel" : "" })).join("")}</div></div></div>
        <div class="acts modes">${["Surpass", "Copy", "Pivot"].map(m => `<button class="btn sm" type="button" data-m="${m}" ${pick ? "" : "disabled"}>${m}</button>`).join("")}</div><div class="msg"></div>`;
      say(el, msg || "Pick a card from your hand, then how to play it.", kind);
      $$("[data-c]", el).forEach(b => b.onclick = () => { pick = b.dataset.c; draw("Now: Surpass, Copy or Pivot?"); });
      $$("[data-m]", el).forEach(b => b.onclick = () => {
        const L = R.lead, ls = L.slice(0, 3), ln = +L.slice(3), cs = pick.slice(0, 3), cn = +pick.slice(3);
        const S = H().SUITS, m = b.dataset.m;
        let ok = false, text = "";
        if (m === "Surpass") {
          if (cs !== ls) text = `A Surpass must be the same suit as the lead (${S[ls].name}).`;
          else if (cn <= ln) text = `${cn} isn't higher than ${ln}, so it can't Surpass. You could Copy with it instead.`;
          else { ok = true; text = `Surpass! You take all ${H().PIPS[cn]} pips as ${S[cs].name} actions.`; }
        } else if (m === "Copy") { ok = true; text = `Copy: the card goes face down, and you take 1 ${S[ls].name} action (${S[ls].acts.join(" / ")}).`; }
        else {
          if (cs === ls) text = "A Pivot must be a different suit. Same suit is a Surpass (if higher) or a Copy (face down).";
          else { ok = true; text = `Pivot: 1 ${S[cs].name} action (${S[cs].acts.join(" / ")}), from your own card.`; }
        }
        if (!ok) { shake(b); H().sfx("bad"); say(el, "<b>Not allowed.</b> " + text, "bad"); return; }
        good++; H().sfx("ok"); pick = null;
        if (good >= 3) { draw("<b>" + text + "</b> You've got it 🎉", "good"); $$("[data-c], [data-m]", el).forEach(x => x.disabled = true); api.done(); return; }
        r++; draw("<b>" + text + "</b> Next round, a new lead card.", "good");
      });
    };
    draw();
  };

  /* Lesson 8: who holds the initiative next? */
  LW.initiative = function (el, o, api) {
    const row = plays => `<div class="plays">${plays.map(p => `<div class="play"><div class="lbl">${p[0]}${p[2] ? ` · ${p[2]}` : ""}</div>${H().card(p[1], { sm: true })}</div>`).join("")}</div>`;
    const items = [
      { plays: [["Red (leader)", "adm2", "lead"], ["Blue", "adm5", "Surpass"], ["Yellow", { down: true }, "Copy"]], ans: "Blue", why: "Blue Surpassed with the highest number." },
      { plays: [["Red (leader)", "mob4", "lead"], ["Blue", "con6", "Pivot"], ["Yellow", { down: true }, "Copy"]], ans: "Red", why: "Nobody Surpassed, so the leader keeps it. Pivots never win the initiative, even with a 6." },
      { plays: [["Red (leader)", "agg2", "lead"], ["Blue", "agg6", "Surpass"], ["Yellow", "agg4", "Surpass + seized with an extra face-down card"]], ans: "Yellow", why: "A seizer always gets the initiative, even if someone Surpassed higher." },
      { plays: [["Red (leader)", "con2", "lead"], ["Blue", "con4", "Surpass"], ["Yellow", "con5", "Surpass"]], ans: "Yellow", why: "Two Surpasses: the higher one (5) wins." }
    ];
    series(el, items.map(it => ({ html: row(it.plays) + `<p>Who has the initiative next round?</p>`, options: ["Red", "Blue", "Yellow"].map(t => ({ t, ok: t === it.ans, why: t === it.ans ? it.why : "Check: did anyone seize? If not, who Surpassed highest?" })) })), api, "Who leads next?");
  };

  /* Lesson 9: a full round with 3 players. You are Red. */
  LW.round = function (el, o, api) {
    const lead = "mob2", hand = ["mob5", "agg2", "con6"];
    let pick = null, seize = false;
    const draw = (msg, kind, final) => {
      el.innerHTML = title("Yellow leads. Your turn, Red.") + `<div class="plays"><div class="play"><div class="lbl">Yellow (leader)</div>${H().card(lead, { sm: true })}</div></div>
        <div class="lbl">Your hand</div><div class="cards hand">${hand.map(c => H().card(c, { button: true, sm: true, data: { c }, cls: pick === c ? "sel" : "" })).join("")}</div>
        <label class="chk"><input type="checkbox" id="seize" ${seize ? "checked" : ""}> Also seize the initiative (add an extra card face down)</label>
        <div class="acts modes">${["Surpass", "Copy", "Pivot"].map(m => `<button class="btn sm" type="button" data-m="${m}" ${pick && !final ? "" : "disabled"}>${m}</button>`).join("")}</div><div class="msg"></div>`;
      say(el, msg || "Pick a card, then how to play it.", kind);
      $("#seize", el).onchange = e => { seize = e.target.checked; };
      if (final) return;
      $$("[data-c]", el).forEach(b => b.onclick = () => { pick = b.dataset.c; draw("Now choose how to play it."); });
      $$("[data-m]", el).forEach(b => b.onclick = () => {
        const m = b.dataset.m, cs = pick.slice(0, 3), cn = +pick.slice(3);
        if (m === "Surpass" && (cs !== "mob" || cn <= 2)) { shake(b); say(el, "Only a Mobilization card higher than 2 can Surpass here.", "bad"); return; }
        if (m === "Pivot" && cs === "mob") { shake(b); say(el, "Mobilization is the lead suit, so this would be a Surpass or a Copy, not a Pivot.", "bad"); return; }
        const you = m === "Surpass" ? `You Surpass with Mobilization ${cn}: ${H().PIPS[cn]} actions (Move / Influence).` : m === "Copy" ? "You Copy: 1 Mobilization action (Move or Influence)." : `You Pivot: 1 ${H().SUITS[cs].name} action.`;
        const blue = "Then Blue Surpasses with Mobilization 4 and takes 3 actions.";
        const who = seize ? "<b>You seized, so you lead next round</b>, whatever Blue did. (It cost you an extra card.)" : m === "Surpass" ? "<b>Your 5 beats Blue's 4: you lead next round!</b>" : "<b>Blue Surpassed highest: Blue leads next round.</b>";
        H().sfx("ok");
        draw(`${you} ${blue} ${who} All played cards are discarded face down.`, "good", true);
        api.done();
      });
    };
    draw();
  };

  /* Lesson 10: move a fleet, then Catapult. Blue controls gate 3. */
  LW.move = function (el, o, api) {
    let task = 0, at = "P1a", left = 3, path = [], used = 0;
    const blue = "G3";
    const ships = n => `<image href="img/ship-red.png" x="${MAP.N[n].x - 30}" y="${MAP.N[n].y - 44}" width="24" height="24"/><image href="img/ship-red.png" x="${MAP.N[n].x - 14}" y="${MAP.N[n].y - 48}" width="24" height="24"/>`;
    const draw = (msg, kind) => {
      const target = task === 0 ? "G2" : "P2b";
      const extra = { [at]: ships(at), [blue]: `<image href="img/ship-blue.png" x="${MAP.N[blue].x + 8}" y="${MAP.N[blue].y - 44}" width="24" height="24"/><image href="img/ship-blue.png" x="${MAP.N[blue].x + 22}" y="${MAP.N[blue].y - 40}" width="24" height="24"/>` };
      if (task === 1) extra.P1b = (extra.P1b || "") + `<image href="img/starport-red.png" x="${MAP.N.P1b.x + 6}" y="${MAP.N.P1b.y + 4}" width="26" height="26"/>`;
      const cls = { [target]: "target" };
      path.forEach(p => cls[p] = (cls[p] || "") + " trail");
      el.innerHTML = title(task === 0 ? `Move your ships to gate 2. Move actions left: ${left}` : `Catapult from your starport to the glowing planet in ONE Move action`) +
        mapSvg({ tap: true, cls, extra, aria: { [at]: "your ships are here", [blue]: "Blue controls it" }, label: "Practice map, move your ships" }) +
        `<p class="small muted">Blue controls gate 3. ${task === 1 ? "Your starport is on the middle planet of cluster 1." : ""}</p><div class="msg"></div><div class="acts"><button class="btn sm" type="button" id="reset">Start again</button></div>`;
      say(el, msg || (task === 0 ? "Tap a system next to your ships. Each step is one Move action." : "Tap systems one after the other. The Catapult keeps going until you enter a planet or a gate someone else controls."), kind);
      $("#reset", el).onclick = () => { at = task === 0 ? "P1a" : "P1b"; left = 3; path = []; used = 0; draw(); };
      tapNodes(el, (n, g) => {
        if (n === at) return;
        if (!MAP.adj(at, n)) { shake(g); say(el, "Ships move to an adjacent system: follow the lines.", "bad"); return; }
        if (task === 0) {
          if (!left) { say(el, "No Move actions left. Tap 'Start again'.", "bad"); return; }
          left--; at = n; H().sfx("tap");
          if (at === "G2") { task = 1; at = "P1b"; path = []; H().sfx("ok"); draw(`Made it with ${3 - left} Move actions. Now the long jump!`, "good"); return; }
          draw(); return;
        }
        // Catapult: one action, keep going until a planet or a gate someone else controls
        if (used) { say(el, "That Catapult has stopped. Tap 'Start again' to try another route.", "bad"); return; }
        path.push(n); at = n; H().sfx("tap");
        const stop = !MAP.N[n].gate || n === blue;
        if (stop) {
          used = 1;
          if (n === "P2b") { H().sfx("ok"); draw("Landed on the planet in a single Move action: the Catapult stopped there because it's a planet. 🎉", "good"); api.done(); return; }
          draw(n === blue ? "Stopped! Blue controls gate 3, so the Catapult ends there." : "Stopped: entering a planet ends the Catapult. Tap 'Start again'.", "bad");
          return;
        }
        draw("Still flying: gates you can pass through don't stop a Catapult.");
      });
    };
    draw();
  };

  /* Lesson 12: tax your cities. */
  LW.tax = function (el, o, api) {
    const cities = [{ id: "a", res: "fuel", own: "red" }, { id: "b", res: "material", own: "red" }, { id: "c", res: "relic", own: "blue", note: "Blue's city, in a system you control" }];
    const done = new Set(); const slots = []; let captives = 0;
    const draw = (msg, kind) => {
      el.innerHTML = title(`Tax each city once (Tax actions left: ${3 - done.size})`) + `<div class="taxrow">${cities.map(c => `<button class="taxcity ${done.has(c.id) ? "used" : ""}" type="button" data-t="${c.id}">${img(`city-${c.own}.png`, "")}<span>${H().icon(c.res)} planet</span><small>${c.note || "Your city"}</small></button>`).join("")}</div>
        <div class="board"><b>Your board</b><div class="slots">${[0, 1, 2, 3].map(k => `<span class="slot">${slots[k] ? H().icon(slots[k]) : ""}</span>`).join("")}</div><div class="capt">Captives: ${"<img class='mini' src='img/agent-blue.png' alt='a blue agent'>".repeat(captives) || "none"}</div></div><div class="msg"></div>`;
      say(el, msg || "Tap a city to Tax it.", kind);
      $$("[data-t]", el).forEach(b => b.onclick = () => {
        const c = cities.find(x => x.id === b.dataset.t);
        if (done.has(c.id)) { shake(b); say(el, "Each city can only be taxed once per turn.", "bad"); return; }
        done.add(c.id); slots.push(c.res); H().sfx("ok");
        let m = `You gain 1 ${c.res}.`;
        if (c.own !== "red") { captives++; m += " And because it's a Rival's city, you capture one of Blue's agents!"; }
        if (done.size === cities.length) { draw(m + " All taxed 🎉", "good"); api.done(); return; }
        draw(m, "good");
      });
    };
    draw();
  };

  /* Lesson 13: can Red Secure this Court card? */
  LW.secure = function (el, o, api) {
    const ag = (col, n) => Array.from({ length: n }, () => img(`agent-${col}.png`, "", "mini")).join("");
    const items = [
      { a: [["red", 2], ["blue", 1]], ans: true, why: "2 is more than 1. Red takes the card and Blue's agent becomes Red's captive." },
      { a: [["red", 2], ["blue", 2]], ans: false, why: "A tie isn't enough." },
      { a: [["red", 3], ["blue", 1], ["yellow", 2]], ans: true, why: "Red has more than each Rival (3 vs 1 and 3 vs 2)." },
      { a: [["red", 1], ["yellow", 3]], ans: false, why: "Yellow has more." }
    ];
    series(el, items.map(it => ({ html: `<div class="courtcard">${img("court-back.png", "", "cback")}<div class="ags">${it.a.map(([c, n]) => `<span>${ag(c, n)}<small>${c} ${n}</small></span>`).join("")}</div></div><p>Can Red Secure this card?</p>`,
      options: [{ t: "Yes", ok: it.ans, why: it.ans ? it.why : "Red needs strictly MORE agents than every Rival. " + it.why }, { t: "No", ok: !it.ans, why: !it.ans ? it.why : "Look again: " + it.why }] })), api, "Can Red Secure it?");
  };

  /* Lesson 14: the three dice, face by face. Faces read from the official dev kit. */
  const DICE = {
    skirmish: { name: "Skirmish", faces: [["hit"], ["hit"], ["hit"], [], [], []], pics: ["s13", "s13", "s13", "s45", "s45", "s45"] },
    assault: { name: "Assault", faces: [["hit", "intercept"], ["hit", "self"], ["hit", "hit", "self"], ["hit", "hit"], ["hit", "self"], []], pics: ["a1", "a25", "a3", "a4", "a25", "a6"] },
    raid: { name: "Raid", faces: [["key", "key", "intercept"], ["key", "self"], ["bhit", "self"], ["bhit", "self"], ["bhit", "key"], ["intercept"]], pics: ["r1", "r2", "r34", "r34", "r5", "r6"] }
  };
  const faceAlt = f => f.length ? f.map(k => ({ hit: "hit", self: "self-hit", intercept: "intercept", bhit: "building hit", key: "key" })[k]).join(" + ") : "blank";
  const faceHtml = (k, i) => `<img class="die" src="img/die-${DICE[k].pics[i]}.png" alt="${faceAlt(DICE[k].faces[i])}" title="${faceAlt(DICE[k].faces[i])}">`;
  LW.dicefaces = function (el) {
    el.innerHTML = `<div class="dice-tbl">${Object.entries(DICE).map(([k, d]) => `<div class="drow ${k}"><b>${d.name}</b><div class="faces">${d.faces.map((f, i) => faceHtml(k, i)).join("")}</div></div>`).join("")}</div>`;
  };

  /* Lesson 14: a battle, resolved step by step. Red: 3 fresh ships. Blue: 2 fresh ships and a city. */
  LW.battle = function (el, o, api) {
    let n = { skirmish: 1, assault: 2, raid: 0 };
    const draw = (log, kind) => {
      const tot = n.skirmish + n.assault + n.raid;
      el.innerHTML = title("Red attacks Blue with 3 ships") + `<div class="bt"><div><b>Red attacks</b><div class="sys">${img("ship-red.png", "", "mini").repeat(3)}</div></div><div><b>Blue defends</b><div class="sys">${img("ship-blue.png", "", "mini").repeat(2)}${img("city-blue.png", "", "mini")}</div></div></div>
        <div class="dicepick">${Object.entries(DICE).map(([k, d]) => `<div class="dp ${k}"><span>${d.name}</span><button class="btn sm" type="button" data-d="${k}" data-v="-1" aria-label="One less ${d.name} die">−</button><b>${n[k]}</b><button class="btn sm" type="button" data-d="${k}" data-v="1" aria-label="One more ${d.name} die">+</button></div>`).join("")}</div>
        <p class="small muted">Up to 1 die per attacking ship: ${tot} of 3. Raid dice are allowed here because Blue has a building in this system.</p>
        <div class="acts"><button class="btn go" type="button" id="roll" ${tot ? "" : "disabled"}>🎲 Roll</button></div><div class="msg"></div>`;
      say(el, log || "Choose up to 3 dice, then roll.", kind);
      $$("[data-d]", el).forEach(b => b.onclick = () => { const k = b.dataset.d, v = +b.dataset.v; if (v > 0 && n.skirmish + n.assault + n.raid >= 3) return; n[k] = Math.max(0, n[k] + v); draw(); });
      $("#roll", el).onclick = roll;
    };
    function roll() {
      const got = [];
      Object.entries(n).forEach(([k, c]) => { for (let i = 0; i < c; i++) { const f = Math.floor(Math.random() * 6); got.push([k, DICE[k].faces[f], f]); } });
      const all = got.flatMap(g => g[1]), cnt = k => all.filter(x => x === k).length;
      // red ships: 0 fresh, 1 damaged, 2 destroyed. Blue likewise, plus the city.
      const red = [0, 0, 0], blue = [0, 0]; let city = 0, redT = 0, blueT = 0;
      const steps = [];
      const hitOwn = () => { const k = red.indexOf(0) >= 0 ? red.indexOf(0) : red.indexOf(1); if (k < 0) return; red[k]++; if (red[k] === 2) blueT++; };
      let s = cnt("self");
      for (let i = 0; i < s; i++) hitOwn();
      steps.push(`{self} <b>Self-hits: ${s}.</b> ${s ? `Red spreads them over fresh ships first, so they're damaged, not destroyed${red.includes(2) ? " (one was destroyed: it goes to Blue's trophies)" : ""}.` : "None."}`);
      if (cnt("intercept")) { const f = blue.filter(x => x === 0).length; for (let i = 0; i < f; i++) hitOwn(); steps.push(`{intercept} <b>Intercept!</b> Blue has ${f} fresh ship${f === 1 ? "" : "s"}, so Red takes ${f} hit${f === 1 ? "" : "s"} (just once, however many intercepts).`); }
      else steps.push(`{intercept} <b>No intercept.</b>`);
      let h = cnt("hit"), hs = h;
      while (h > 0) {
        let k = blue.indexOf(1); if (k < 0) k = blue.indexOf(0);
        if (k >= 0) { blue[k]++; if (blue[k] === 2) redT++; h--; continue; }
        if (city < 2) { city++; if (city === 2) redT++; h--; continue; }
        break;
      }
      steps.push(`{hit} <b>Hits: ${hs}.</b> ${hs ? `Ships first: Blue now has ${blue.filter(x => x === 0).length} fresh, ${blue.filter(x => x === 1).length} damaged, ${blue.filter(x => x === 2).length} destroyed.` : ""}${city && !cnt("bhit") ? " Spare hits went on to the city." : ""}`);
      const b = cnt("bhit");
      for (let i = 0; i < b && city < 2; i++) { city++; if (city === 2) redT++; }
      steps.push(`{bhit} <b>Building hits: ${b}.</b> ${b ? (city === 2 ? "The city is destroyed! It becomes Red's trophy, and Red becomes Outraged, then Ransacks the Court." : "The city is damaged (flipped).") : ""}`);
      const keys = cnt("key"), alive = red.filter(x => x < 2).length;
      steps.push(`{key} <b>Keys: ${keys}.</b> ${keys ? (alive ? "Red can raid: spend keys equal to a raid cost to steal a resource or Guild card from Blue." : "But Red has no ships left, so no raid.") : ""}`);
      steps.push(`🏆 Trophies from this battle: Red ${redT}, Blue ${blueT}.`);
      const faces = got.map(([k, f, i]) => faceHtml(k, i)).join("");
      draw(`<div class="rolled">${faces}</div><ol class="steps">${steps.map(x => `<li>${x}</li>`).join("")}</ol>`, "good");
      H().sfx("ok");
      api.done();
    }
    draw();
  };

  /* Lesson 16: match each resource to what it gives in the Prelude. */
  LW.prelude = function (el, o, api) {
    const R = [["material", "Build or Repair"], ["fuel", "Move"], ["weapon", "Pips may Battle"], ["relic", "Secure"], ["psionic", "1 lead-card action"]];
    let pick = null; const ok = new Set(); let order = H().shuffle(R.map(r => r[1]));
    const draw = (msg, kind) => {
      el.innerHTML = title(`Tap a resource, then what it gives (${ok.size} of 5)`) + `<div class="match"><div>${R.map(([r]) => `<button class="btn sm res ${pick === r ? "sel" : ""} ${ok.has(r) ? "ok" : ""}" type="button" data-r="${r}" ${ok.has(r) ? "disabled" : ""}>${H().icon(r)} ${r}</button>`).join("")}</div>
        <div>${order.map(a => `<button class="btn sm ${[...ok].some(r => R.find(x => x[0] === r)[1] === a) ? "ok" : ""}" type="button" data-a="${a}" ${[...ok].some(r => R.find(x => x[0] === r)[1] === a) ? "disabled" : ""}>${a}</button>`).join("")}</div></div><div class="msg"></div>`;
      say(el, msg || "Pick a resource on the left.", kind);
      $$("[data-r]", el).forEach(b => b.onclick = () => { pick = b.dataset.r; draw("Now its action on the right."); });
      $$("[data-a]", el).forEach(b => b.onclick = () => {
        if (!pick) { say(el, "Pick a resource first.", "bad"); return; }
        const right = R.find(x => x[0] === pick)[1];
        if (b.dataset.a !== right) { shake(b); H().sfx("bad"); say(el, `Not that one. ${pick} gives: think again!`, "bad"); return; }
        ok.add(pick); H().sfx("ok"); pick = null;
        if (ok.size === 5) { draw("All matched 🎉", "good"); api.done(); return; }
        draw("Right!", "good");
      });
    };
    draw();
  };

  /* Lesson 17: which ambition is each player chasing? */
  LW.ambmatch = function (el, o, api) {
    const A = ["Tycoon", "Tyrant", "Warlord", "Keeper", "Empath"];
    const items = [
      ["Blue keeps taxing Rival cities and capturing agents.", "Tyrant"],
      ["Yellow has 3 {relic} Relics and a Relic Guild card.", "Keeper"],
      ["Red destroyed 5 Rival ships this chapter.", "Warlord"],
      ["White holds 2 {fuel} Fuel and 2 {material} Material.", "Tycoon"],
      ["Red is collecting {psionic} Psionics.", "Empath"]
    ];
    series(el, items.map(([h, a]) => ({ html: `<p>${h}</p><p>Which ambition is this player chasing?</p>`, options: H().shuffle(H().shuffle(A.filter(x => x !== a)).slice(0, 3).concat(a)).map(t => ({ t, ok: t === a, why: t === a ? "" : "Tycoon: Fuel + Material. Tyrant: captives. Warlord: trophies. Keeper: Relics. Empath: Psionics." })) })), api, "Match the ambition");
  };

  /* Lesson 19: score an ambition. */
  LW.score = function (el, o, api) {
    const items = [
      { html: "<p><b>Tycoon</b> has one marker: <b>5 / 3</b>.<br>Fuel + Material: Red 4, Blue 2, Yellow 1.</p>", ans: "Red 5, Blue 3, Yellow 0", opts: ["Red 5, Blue 3, Yellow 0", "Red 5, Blue 0, Yellow 0", "Red 3, Blue 2, Yellow 0"], why: "Red is 1st (5), Blue 2nd (3)." },
      { html: "<p><b>Warlord</b> has two markers: <b>5 / 3</b> and <b>2 / 0</b>.<br>Trophies: Red 1, Blue 3, Yellow 0.</p>", ans: "Blue 7, Red 3", opts: ["Blue 7, Red 3", "Blue 5, Red 3", "Blue 7, Red 2"], why: "1st adds the big numbers (5 + 2 = 7), 2nd adds the small ones (3 + 0 = 3)." },
      { html: "<p><b>Empath</b> has one marker: <b>3 / 2</b>.<br>Psionics: Red 2, Blue 2, Yellow 1.</p>", ans: "Red 2, Blue 2, Yellow 0", opts: ["Red 2, Blue 2, Yellow 0", "Red 3, Blue 3, Yellow 2", "Red 3, Blue 2, Yellow 0"], why: "Tie for 1st: both get 2nd-place Power (2), and nobody else scores." },
      { html: "<p><b>Keeper</b> has one marker: <b>5 / 3</b>.<br>Relics: Red 0, Blue 0, Yellow 0.</p>", ans: "Nobody scores", opts: ["Nobody scores", "Everyone gets 3", "Red gets 5 (first in turn order)"], why: "You need at least 1 Relic to score." }
    ];
    series(el, items.map(it => ({ html: it.html, options: H().shuffle(it.opts).map(t => ({ t, ok: t === it.ans, why: t === it.ans ? it.why : "Remember: 1st = big numbers, 2nd = small numbers, a tie for 1st pays 2nd place." })) })), api, "Who scores what?");
  };

  /* Lesson 21: put the setup steps in order. */
  LW.order = function (el, o, api) {
    const S = ["Lay out the map and the supply", "Give the initiative to a random player", "Make the action deck and the Court", "Cover the out-of-play clusters (setup card)", "Place starting pieces: A, B and C", "Gain 2 starting resources", "Deal 6 cards to each player"];
    let order = H().shuffle(S.map((s, k) => k)), got = 0;
    const draw = (msg, kind) => {
      el.innerHTML = title(`Tap the next step (${got} of ${S.length})`) + `<ol class="steps done-list">${S.slice(0, got).map(s => `<li>${s}</li>`).join("")}</ol>
        <div class="ser-opts col">${order.filter(k => k >= got).map(k => `<button class="btn sm" type="button" data-k="${k}">${S[k]}</button>`).join("")}</div><div class="msg"></div>`;
      say(el, msg || "Which comes first?", kind);
      $$("[data-k]", el).forEach(b => b.onclick = () => {
        if (+b.dataset.k !== got) { shake(b); H().sfx("bad"); say(el, "Not yet. Which step has to happen before that?", "bad"); return; }
        got++; H().sfx("tap");
        if (got === S.length) { draw("Ready to play 🎉", "good"); api.done(); return; }
        draw("Yes!", "good");
      });
    };
    draw();
  };

  /* Lesson 22: what would you do? */
  LW.choices = function (el, o, api) {
    const items = [
      { html: `<p>You lead. Your hand: Construction 2, Aggression 5, Mobilization 6. You have 1 city and want a second one.</p>`, options: [
        { t: "Lead Construction 2 and Build a city (and more)", ok: true, why: "4 pips of Construction: build a city, a starport, ships... a strong start." },
        { t: "Lead Mobilization 6", why: "Only 2 pips, and you can't Build with Mobilization." },
        { t: "Pass", why: "Passing gives the initiative away and ends the round. You'd waste your lead." }] },
      { html: `<p>Blue leads Aggression 4. You have no Aggression cards. You'd like to Tax your city.</p>`, options: [
        { t: "Pivot with an Administration card: 1 Tax", ok: true, why: "A Pivot gives 1 action from your own card's suit." },
        { t: "Copy: 1 Tax", why: "A Copy gives an action of the LEAD suit (Aggression), and Tax isn't an Aggression action." },
        { t: "Surpass with Administration 5", why: "A Surpass must be the same suit as the lead." }] },
      { html: `<p>You lead and could declare Keeper. You have 2 Relics. Nobody else has any.</p>`, options: [
        { t: "Declare Keeper: you're well ahead", ok: true, why: "Declaring an ambition you're winning is how you score Power." },
        { t: "Don't declare: declaring is bad", why: "It has a price (your card becomes 0), but it's the only way to make ambitions count." },
        { t: "Declare Tyrant instead", why: "You can only declare the ambition on your lead card (unless it's a 7)." }] }
    ];
    series(el, items, api, "What's the best play?");
  };
})();
