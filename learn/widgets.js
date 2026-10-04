/* Learn Magic: the interactive pieces a lesson step can show with `widget: [name, opts]`.
   Each one is (el, opts, api); api.done() unlocks Next when the step has a `gate`. */
(function () {
  "use strict";
  const LW = window.LW = window.LW || {};
  const H = () => LW._;
  const $ = (s, r) => r.querySelector(s);
  const $$ = (s, r) => Array.from(r.querySelectorAll(s));
  const C = id => window.LEARN.cards[id];
  const title = t => `<p class="wt">👆 ${t}</p>`;
  function say(el, html, kind) {
    const m = $(".msg", el);
    m.className = "msg " + (kind || "");
    m.setAttribute("role", "status");
    m.innerHTML = H().fmt(html);
  }
  const shake = node => { node.classList.remove("shake"); void node.offsetWidth; node.classList.add("shake"); };
  // count a number up or down on screen, so the change is easy to follow
  function tick(node, from, to) {
    if (!node) return;
    if (H().calm() || from === to) { node.textContent = to; return; }
    const steps = Math.min(Math.abs(to - from), 12), t0 = performance.now(), dur = 120 + steps * 45;
    const f = now => { const k = Math.min(1, (now - t0) / dur); node.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  const hearts = (n, max, sym) => { let s = ""; for (let k = 0; k < max; k++) s += `<i class="${k < n ? "" : "gone"}">${sym || "❤️"}</i>`; return `<div class="hearts" aria-hidden="true">${s}</div>`; };

  /* Lesson 1: knock the opponent from 20 to 0. */
  LW.life = function (el, o, api) {
    let opp = o.start || 20;
    const max = opp;
    el.innerHTML = title("Try it: take your opponent to zero") +
      `<div class="life"><div class="p" id="opp"><div class="who">Opponent</div><div class="n">${opp}</div>${hearts(opp, max)}</div>
       <div class="p"><div class="who">You</div><div class="n">${max}</div>${hearts(max, max)}</div></div>
       <div class="acts">${o.hits.map((h, k) => `<button class="btn sm" type="button" data-k="${k}">${h[0]}</button>`).join("")}</div><div class="msg">Tap a button to hit your opponent. Watch their number go down.</div>`;
    const box = $("#opp", el);
    $$("[data-k]", el).forEach(b => b.onclick = () => {
      if (opp <= 0) { opp = max; box.innerHTML = `<div class="who">Opponent</div><div class="n">${opp}</div>${hearts(opp, max)}`; say(el, "New game! Their life is back to " + max + "."); return; }
      const h = o.hits[+b.dataset.k];
      const was = opp;
      opp = Math.max(0, opp - h[1]);
      box.innerHTML = `<div class="who">Opponent</div><div class="n">${was}</div>${hearts(opp, max)}`;
      tick($(".n", box), was, opp);
      H().pop(box, "-" + h[1]);
      box.classList.remove("hit"); void box.offsetWidth; box.classList.add("hit");
      if (opp === 0) { say(el, "🏆 Their life reached <b>0</b>. <b>You win!</b> That is the whole goal of Magic. (Tap a button to play again.)", "good"); api.done(); }
      else say(el, `${h[2]} They lose <b>${h[1]}</b> life and have <b>${opp}</b> left.`);
    });
  };

  /* Lesson 2: tap each part of a card. */
  LW.anatomy = function (el, o, api) {
    const c = C(o.card || "angel");
    const parts = window.LEARN.anatomy;
    el.innerHTML = title("Tap each part of the card") + `<div class="anatomy">
      <div class="mcard ${c.c}"><div class="in">
        <div class="bar1"><span class="nm part" data-p="name" tabindex="0" role="button">${c.name}</span><span class="cost part" data-p="cost" tabindex="0" role="button">${H().pips(c.cost)}</span></div>
        <div class="art part" data-p="art" tabindex="0" role="button" aria-label="Picture">${c.art}</div>
        <div class="tl part" data-p="type" tabindex="0" role="button">${c.type}</div>
        <div class="tx part" data-p="text" tabindex="0" role="button">${H().fmt(c.text)}<br><i>${c.flavor || ""}</i></div>
      </div><span class="pt part" data-p="pt" tabindex="0" role="button">${c.pt[0]}/${c.pt[1]}</span></div>
      <div class="explain" aria-live="polite"><b>6 parts to find</b>Tap or click any part of the card: the name, the symbols in the corner, the picture, the line in the middle, the text box and the numbers.</div></div>`;
    const seen = new Set(), ex = $(".explain", el);
    $$(".part", el).forEach(p => {
      const show = () => {
        $$(".part", el).forEach(x => x.classList.remove("sel"));
        p.classList.add("sel", "seen");
        seen.add(p.dataset.p);
        const d = parts[p.dataset.p];
        ex.innerHTML = `<b>${d[0]}</b>${H().fmt(d[1])}<p class="small muted" style="margin:8px 0 0">${seen.size} of 6 found${seen.size === 6 ? " · all done! 🎉" : ""}</p>`;
        if (seen.size === 6) api.done();
      };
      p.onclick = show;
      p.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(); } };
    });
  };

  /* Lesson 3: the six beats of a turn. */
  LW.wheel = function (el, o, api) {
    const steps = window.LEARN.turn5;
    el.innerHTML = title("Tap each step, left to right") + `<div class="wheel">${steps.map((s, k) => `<button type="button" data-k="${k}"><i aria-hidden="true">${s[0]}</i>${s[1]}</button>`).join("")}</div><div class="msg">Start with step 1, <b>Wake up</b>.</div>`;
    const seen = new Set();
    $$("button", el).forEach(b => b.onclick = () => {
      const k = +b.dataset.k;
      if (k > seen.size) { shake(b); say(el, `One at a time, in order: tap step <b>${seen.size + 1}, ${steps[seen.size][1]}</b> next.`, "bad"); return; }
      $$("button", el).forEach(x => x.classList.remove("on"));
      b.classList.add("on", "seen"); seen.add(k);
      say(el, `<b>${k + 1}. ${steps[k][1]}</b> · ${steps[k][2]}` + (seen.size === steps.length ? `<br><br>✅ That's a whole turn! Then the next player does the same steps.` : ""), seen.size === steps.length ? "good" : "");
      if (seen.size === steps.length) api.done();
    });
  };

  /* Lesson 4: play one land per turn. */
  LW.lands = function (el, o, api) {
    let turn = 1, played = false;
    let hand = ["forest", "plains", "forest", "mountain", "forest", "island"];
    const field = [];
    function draw() {
      el.innerHTML = title(`Turn ${turn} of 4: play a land from your hand`) +
        `<div class="zone-label">Your lands on the table · they make ${field.length} mana every turn</div><div class="row-cards" id="fld">${field.map(id => H().card(id, { sm: true })).join("") || '<span class="muted small">Nothing yet.</span>'}</div>
        <div class="zone-label">Your hand</div><div class="row-cards" id="hnd">${hand.map((id, k) => H().card(id, { sm: true, button: true, data: { k } })).join("")}</div>
        <div class="acts"><button class="btn sm" type="button" id="nt">${turn < 4 ? "End turn → turn " + (turn + 1) : "Done"}</button></div><div class="msg"></div>`;
      $$("#hnd .mcard", el).forEach(b => b.onclick = () => {
        if (played) { shake(b); say(el, "✋ <b>Only one land per turn.</b> You already played one this turn. Keep this one for next turn.", "bad"); return; }
        field.push(hand.splice(+b.dataset.k, 1)[0]); played = true; draw();
        say(el, `Land played. You now have <b>${field.length}</b> ${field.length === 1 ? "land" : "lands"}: ${field.map(id => H().pips("{" + C(id).makes + "}")).join(" ")} · that's ${field.length} mana to spend each turn.`, "good");
      });
      $("#nt", el).onclick = () => {
        if (!played) { say(el, "You haven't played a land this turn. You almost always want to! Tap one in your hand first.", "bad"); return; }
        if (turn === 4) { say(el, `🎉 Four turns, four lands: ${field.map(id => H().pips("{" + C(id).makes + "}")).join(" ")}. Your mana grows by one each turn, so bigger cards become possible later in the game.`, "good"); api.done(); return; }
        turn++; played = false; draw();
        say(el, `It's turn ${turn}. A new turn means you may play another land.`);
      };
      say(el, "Tap a land in your hand to put it on the table.");
    }
    draw();
  };

  /* Lesson 5: the five colors. */
  LW.colors = function (el, o, api) {
    const cs = window.LEARN.colorInfo;
    el.innerHTML = title("Tap each color") + `<div class="colors">${cs.map((c, k) => `<button type="button" data-k="${k}">${H().pip(c.k, "big")}${c.name}</button>`).join("")}</div><div class="msg">Five colors, five personalities. Tap one to meet it.</div>`;
    const seen = new Set();
    $$("button", el).forEach(b => b.onclick = () => {
      const c = cs[+b.dataset.k]; seen.add(c.k);
      $$("button", el).forEach(x => x.classList.remove("on")); b.classList.add("on");
      say(el, `<b>${c.name}</b> · land: <b>${c.land}</b> ${H().pips("{" + c.k + "}")}<br>${c.likes}<br><span class="muted">Typical card: ${c.ex}</span>` + (seen.size === 5 ? "<br><br>✅ You've met all five." : ""));
      if (seen.size === 5) api.done();
    });
  };

  /* Lesson 6: tap lands to pay a cost. Colored symbols need that color, numbers take anything. */
  LW.pay = function (el, o, api) {
    const puzzles = o.puzzles;
    let pi = 0, solvedCount = 0;
    function load() {
      const pz = puzzles[pi], c = C(pz.card);
      const need = H().parseCost(c.cost).flatMap(s => /^\d+$/.test(s) ? Array(+s).fill("N") : [s]);
      const paid = need.map(() => false), tapped = pz.lands.map(() => false);
      el.innerHTML = title(`Puzzle ${pi + 1} of ${puzzles.length}: can you cast it?`) +
        `<div class="cards" style="margin:4px 0">${H().card(pz.card, { sm: true })}</div>
        <div class="zone-label">The cost · fill every circle</div><div class="cost-big" id="need"></div>
        <div class="zone-label">Your lands · tap one to use its mana</div><div class="row-cards" id="lands">${pz.lands.map((id, k) => H().card(id, { sm: true, button: true, data: { k } })).join("")}</div>
        <div class="acts"><button class="btn sm go" type="button" id="cast" disabled>Cast it!</button><button class="btn sm" type="button" id="cant">I can't cast this</button><button class="btn sm" type="button" id="undo">Untap all</button></div>
        <div class="msg">Tap your lands one by one. Each colored circle needs its own color. A grey number circle takes any color.</div>`;
      const drawNeed = fresh => { $("#need", el).innerHTML = need.map((s, k) => H().pip(s === "N" ? "1" : s, paid[k] ? "big paid" + (k === fresh ? " fresh" : "") : "big empty")).join(""); };
      drawNeed();
      const finishPuzzle = (html) => {
        solvedCount++;
        say(el, html + (pi < puzzles.length - 1 ? "" : "<br><br>🎉 All puzzles solved!"), "good");
        const acts = $(".acts", el);
        acts.innerHTML = pi < puzzles.length - 1 ? `<button class="btn sm go" type="button" id="nx">Next puzzle →</button>` : "";
        if (pi < puzzles.length - 1) $("#nx", el).onclick = () => { pi++; load(); };
        else api.done();
      };
      $$("#lands .mcard", el).forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (tapped[k]) { say(el, "That land is already tapped (turned sideways). A land gives mana once per turn."); shake(b); return; }
        const col = C(pz.lands[k]).makes;
        let slot = need.findIndex((s, j) => !paid[j] && s === col);
        if (slot < 0) slot = need.findIndex((s, j) => !paid[j] && s === "N");
        if (slot < 0) {
          shake(b);
          say(el, need.every((s, j) => paid[j]) ? "Everything is already paid. You don't need that land, keep it for later." : `${H().pips("{" + col + "}")} doesn't fit any empty circle. The circles left need a specific color.`, "bad");
          return;
        }
        tapped[k] = true; paid[slot] = true; b.classList.add("tapped");
        H().pop(b, "+{" + col + "}", "good"); H().sfx("tap");
        drawNeed(slot);
        if (paid.every(Boolean)) { $("#cast", el).disabled = false; say(el, "Every circle is filled. Tap <b>Cast it!</b>", "good"); }
        else say(el, `${H().pips("{" + col + "}")} paid ${need[slot] === "N" ? "a grey circle (any color is fine there)" : "a " + H().pips("{" + col + "}") + " circle"}.`);
      });
      $("#undo", el).onclick = load;
      $("#cast", el).onclick = () => finishPuzzle(`✨ <b>${c.name}</b> cast! ${pz.ok}`);
      $("#cant", el).onclick = () => {
        if (pz.possible) { say(el, `Look again: it <i>is</i> possible. ${pz.hint}`, "bad"); return; }
        finishPuzzle(`✅ Right, you can't. ${pz.why}`);
      };
    }
    load();
  };

  /* Lesson 7: tap for mana, then a new turn untaps everything and the pool empties. */
  LW.tapper = function (el, o, api) {
    let pool = [], tapped = [false, false, false], turn = 1, untapped = false;
    const ids = ["forest", "forest", "elves"];
    function draw() {
      el.innerHTML = title(turn === 1 ? "Your main phase: tap your cards for mana" : "The next turn") +
        `<p class="small muted" style="margin:0 0 8px">These three have been on your side since earlier turns, so they're ready to use.</p>` +
        `<div class="row-cards" style="justify-content:center;gap:24px;min-height:150px">${ids.map((id, k) => H().card(id, { sm: true, button: true, cls: tapped[k] ? "tapped" : "", data: { k } })).join("")}</div>
        <div class="zone-label">Your mana right now</div><div class="pool">${pool.map(p => H().pip(p)).join("") || '<span class="muted small">empty</span>'}</div>
        <div class="acts"><button class="btn sm" type="button" id="nt">Next turn</button></div><div class="msg"></div>`;
      $$(".mcard", el).forEach(b => b.onclick = () => {
        const k = +b.dataset.k;
        if (tapped[k]) { shake(b); say(el, "Already tapped. It's lying sideways, so it has been used. It stands back up at the start of your next turn.", "bad"); return; }
        H().pop(b, "+{G}", "good"); H().sfx("tap");
        tapped[k] = true; pool.push("G"); draw();
        say(el, ids[k] === "elves" ? `Llanowar Elves turned sideways to make ${H().pips("{G}")}. Creatures can have a ${H().pips("{T}")} ability too.` : `The Forest turned sideways (tapped) and made ${H().pips("{G}")}.`);
        if (tapped.every(Boolean) && turn === 1) say(el, `All three tapped: ${H().pips("{G}{G}{G}")} to spend. Now tap <b>Next turn</b> and watch what happens.`, "good");
      });
      $("#nt", el).onclick = () => {
        if (!tapped.some(Boolean)) { say(el, "First tap at least one card to make mana. Then see what the next turn does to it.", "bad"); return; }
        const had = pool.length;
        turn++; tapped = [false, false, false]; pool = []; untapped = true; draw();
        say(el, `☀️ New turn: everything <b>untapped</b> (stood back up), ready to use again. The ${had} mana you didn't spend <b>vanished</b>. Mana disappears at the end of each step of the turn, so tap lands only when you're about to spend the mana.`, "good");
        api.done();
      };
      if (!$(".msg", el).innerHTML) say(el, "Tap each card. Watch it turn sideways and make mana.");
    }
    draw();
  };

  /* Generic: sort items into buckets, one at a time. */
  LW.sort = function (el, o, api) {
    const items = o.keep ? o.items.slice() : H().shuffle(o.items);
    let k = 0, right = 0;
    el.classList.add("sort");
    function draw() {
      if (k === items.length) {
        el.innerHTML = title(o.title || "Sort them") + `<div class="msg good">🎉 Done! ${right} of ${items.length} on the first try.${right < items.length ? " The ones you missed are explained above, so they'll stick next time." : " Perfect."}</div>`;
        api.done(); return;
      }
      const it = items[k];
      el.innerHTML = title((o.title || "Sort them") + ` · ${k + 1} of ${items.length}`) +
        `<div class="item">${H().fmt(it.t)}</div><div class="buckets">${o.buckets.map((b, j) => `<button type="button" data-j="${j}">${H().fmt(b)}</button>`).join("")}</div><div class="msg">${H().fmt(o.prompt || "Where does it go?")}</div>`;
      let first = true;
      $$(".buckets button", el).forEach(b => b.onclick = () => {
        if (+b.dataset.j === it.b) {
          if (first) right++;
          say(el, "✅ " + (it.why || "Right!"), "good");
          $$(".buckets button", el).forEach(x => x.disabled = true);
          setTimeout(() => { if (!el.isConnected) return; k++; draw(); }, it.why ? 1700 : 700);
        } else { first = false; shake(b); say(el, "Not that one. " + (it.hint || "Try another box."), "bad"); }
      });
    }
    draw();
  };

  /* Generic: tap the steps in the right order. */
  LW.order = function (el, o, api) {
    const pool = H().shuffle(o.items.map((t, k) => ({ t, k })));
    let at = 0;
    el.classList.add("order");
    function draw() {
      el.innerHTML = title(o.title || "Put them in order") + `<ol>${o.items.slice(0, at).map(t => `<li>${H().fmt(t)}</li>`).join("")}</ol>
        <div class="pool2">${pool.filter(p => p.k >= at).map(p => `<button type="button" data-k="${p.k}">${H().fmt(p.t)}</button>`).join("")}</div><div class="msg"></div>`;
      $$(".pool2 button", el).forEach(b => b.onclick = () => {
        if (+b.dataset.k === at) { at++; draw(); if (at === o.items.length) { say(el, "🎉 " + (o.done || "Perfect order!"), "good"); api.done(); } else say(el, "✅ Yes. What comes next?"); }
        else { shake(b); say(el, o.hints && o.hints[at] ? "Not yet. " + o.hints[at] : "Not yet, that one comes later. Which one comes next?", "bad"); }
      });
      if (at === 0) say(el, o.prompt || "Tap the one that comes first.");
    }
    draw();
  };

  /* Generic: flashcards. */
  LW.flip = function (el, o, api) {
    let k = 0;
    const seen = new Set();
    el.classList.add("flip");
    function draw() {
      const c = o.cards[k];
      el.innerHTML = title(`Tap the card to flip it · ${k + 1} of ${o.cards.length}`) +
        `<button class="fc" type="button" aria-pressed="false" aria-label="Flashcard: ${c[1]}. Flip it to see what it means."><div class="face" aria-hidden="true"><div><span class="em" aria-hidden="true">${c[0]}</span><b>${c[1]}</b><span class="muted small">tap to see what it means</span></div></div><div class="face back" aria-hidden="true"><div>${H().fmt(c[2])}</div></div></button><p class="sr-only" aria-live="polite" id="fcback"></p>
        <div class="nav"><button class="btn sm" type="button" id="pv" ${k === 0 ? "disabled" : ""}>← Prev</button><span class="small muted">${seen.size} of ${o.cards.length} flipped</span><button class="btn sm" type="button" id="nx" ${k === o.cards.length - 1 ? "disabled" : ""}>Next →</button></div>`;
      const fc = $(".fc", el);
      fc.onclick = () => {
        const on = fc.classList.toggle("on"); seen.add(k);
        fc.setAttribute("aria-pressed", on ? "true" : "false");
        $("#fcback", el).innerHTML = on ? `${c[1]}: ${H().fmt(c[2])}` : ""; $(".nav span", el).textContent = `${seen.size} of ${o.cards.length} flipped`; if (seen.size === o.cards.length) api.done(); };
      $("#pv", el).onclick = () => { k--; draw(); };
      $("#nx", el).onclick = () => { k++; draw(); };
    }
    draw();
  };

  /* Lessons 11-13: a combat lab. Pick an attacker and a blocker, then fight. */
  LW.combat = function (el, o, api) {
    const atk = o.attackers, blk = o.blockers;
    let a = o.a || atk[0], b = o.b != null ? o.b : blk[0], oppLife = 20, myLife = 20, fights = 0, guess = null;
    const GUESSES = ["⚔️ Only the attacker dies", "🛡️ Only the blocker dies", "☠️ Both die", "🙂 Nobody dies"];
    const kws = c => (c.kw || []).map(k => `<span class="kw">${k}</span>`).join("");
    const boxes = (n, cls, hit) => { let s = ""; for (let i = 0; i < n; i++) s += `<i class="${hit && i < hit ? "x" : ""}"></i>`; return `<span class="boxes ${cls}">${s}</span>`; };
    function stats(c, hit) { return `<div class="stats"><span>⚔ ${boxes(c.pt[0], "pw")}</span><span>❤ ${boxes(c.pt[1], "hp", hit)}</span></div><div style="text-align:center">${kws(C(c.id) || c)}</div>`; }
    function draw(res) {
      const ca = C(a), cb = b ? C(b) : null;
      guess = res ? guess : null;
      el.innerHTML = title(o.title || "Combat lab: pick a fight") +
        (atk.length > 1 ? `<div class="zone-label">Your attacker</div><div class="pick" id="pa">${atk.map(id => `<button type="button" data-id="${id}" class="${id === a ? "on" : ""}">${C(id).name}</button>`).join("")}</div>` : "") +
        (blk.length > 1 ? `<div class="zone-label">Their blocker</div><div class="pick" id="pb">${blk.map(id => `<button type="button" data-id="${id || ""}" class="${id === b ? "on" : ""}">${id ? C(id).name : "No block"}</button>`).join("")}</div>` : "") +
        `<div class="fight" style="margin-top:14px"><div>${H().card(a, { sm: true, cls: res && res.aDies ? "dead" : "" })}${stats({ pt: ca.pt, kw: ca.kw }, res && res.toA)}</div><div class="vs">VS</div>
        <div>${cb ? H().card(b, { sm: true, cls: res && res.bDies ? "dead" : "" }) + stats({ pt: cb.pt, kw: cb.kw }, res && res.toB) : `<div class="p" style="text-align:center;padding:20px 8px;border:1.5px dashed var(--line);border-radius:14px;width:140px">🛡️<br><b>No blocker</b><br><span class="small muted">The attack goes straight to the player.</span></div>`}</div></div>
        <div class="life" style="margin-top:10px"><div class="p"><div class="who">Your life</div><div class="n" style="font-size:1.6rem">${myLife}</div></div><div class="p"><div class="who">Opponent's life</div><div class="n" style="font-size:1.6rem">${oppLife}</div></div></div>
        <div class="acts"><button class="btn sm pink" type="button" id="go">⚔ Fight!</button><button class="btn sm" type="button" id="rs">Reset lives</button></div><div class="msg"></div>`;
      $$("#pa button", el).forEach(x => x.onclick = () => { a = x.dataset.id; draw(); });
      $$("#pb button", el).forEach(x => x.onclick = () => { b = x.dataset.id || null; draw(); });
      const go = () => {
        const atkCard = $(".fight > div:first-child .mcard", el);
        if (atkCard && !H().calm()) { atkCard.classList.add("lunge"); setTimeout(() => el.isConnected && fight(), 380); } else fight();
      };
      $("#go", el).onclick = () => {
        $("#go", el).disabled = true;
        const ca = C(a), cb = b ? C(b) : null, has = (c, k) => (c.kw || []).includes(k);
        const blocks = cb && !(has(ca, "Flying") && !has(cb, "Flying") && !has(cb, "Reach"));
        if (!blocks || o.predict === false) { guess = null; return go(); }
        // guess first, then see: predicting is what makes the rule stick
        $(".acts", el).innerHTML = `<p class="small" style="margin:0 0 6px;width:100%"><b>Your guess first:</b> what happens?</p>` +
          GUESSES.map((g, k) => `<button class="btn sm" type="button" data-g="${k}">${g}</button>`).join("");
        say(el, "No pressure: a wrong guess just means you'll remember the answer better.");
        $$("[data-g]", el).forEach(x => x.onclick = () => { guess = +x.dataset.g; $$("[data-g]", el).forEach(y => y.disabled = true); go(); });
      };
      $("#rs", el).onclick = () => { oppLife = 20; myLife = 20; draw(); };
      say(el, res ? res.text : (o.prompt || "Pick an attacker and a blocker, then tap <b>Fight!</b>"), res ? "good" : "");
    }
    function fight() {
      const oppBefore = oppLife;
      const ca = C(a), cb = b ? C(b) : null, has = (c, k) => (c.kw || []).includes(k);
      const lines = [];
      let res = { toA: 0, toB: 0 };
      lines.push(has(ca, "Vigilance") ? `${ca.name} attacks <b>without tapping</b> (vigilance).` : `${ca.name} taps to attack.`);
      if (cb && has(ca, "Flying") && !has(cb, "Flying") && !has(cb, "Reach")) {
        lines.push(`🪽 ${cb.name} <b>can't block</b> it: ${ca.name} has flying, and ${cb.name} has neither flying nor reach.`);
        res.blockedFail = true;
      }
      if (!cb || res.blockedFail) {
        oppLife -= ca.pt[0];
        lines.push(`Nobody blocks, so all ⚔ ${ca.pt[0]} damage hits the opponent: <b>${oppLife + ca.pt[0]} → ${oppLife}</b>.`);
        if (has(ca, "Lifelink")) { myLife += ca.pt[0]; lines.push(`💗 Lifelink: you gain ${ca.pt[0]} life too.`); }
      } else {
        // Both deal damage at the same time.
        let toB = ca.pt[0], toPlayer = 0;
        if (has(ca, "Trample")) {
          const lethal = has(ca, "Deathtouch") ? 1 : cb.pt[1];
          toB = Math.min(ca.pt[0], lethal); toPlayer = ca.pt[0] - toB;
        }
        const toA = cb.pt[0];
        res.toA = toA; res.toB = toB;
        res.bDies = toB >= cb.pt[1] || (toB > 0 && has(ca, "Deathtouch"));
        res.aDies = toA >= ca.pt[1] || (toA > 0 && has(cb, "Deathtouch"));
        lines.push(`${cb.name} blocks. They hit each other <b>at the same time</b>.`);
        lines.push(`${ca.name} deals ${toB} to ${cb.name} (❤ ${cb.pt[1]}): ${res.bDies ? (toB < cb.pt[1] ? "☠️ <b>dies</b>, deathtouch makes any damage deadly." : "☠️ <b>dies</b>, the punches reach its health.") : "it survives, not enough punches."}`);
        lines.push(`${cb.name} deals ${toA} to ${ca.name} (❤ ${ca.pt[1]}): ${res.aDies ? (toA < ca.pt[1] ? "☠️ <b>dies</b> to deathtouch." : "☠️ <b>dies</b>.") : "it survives."}`);
        if (toPlayer) { oppLife -= toPlayer; lines.push(`🦶 Trample: the extra ${toPlayer} damage tramples over to the opponent (now ${oppLife}).`); }
        if (has(ca, "Lifelink") && ca.pt[0]) { myLife += ca.pt[0]; lines.push(`💗 Lifelink: you gain ${ca.pt[0]} life.`); }
        if (has(cb, "Lifelink") && toA) { oppLife += toA; lines.push(`💗 Their lifelink gains them ${toA}.`); }
        if (!res.aDies && !res.bDies) lines.push("Damage that didn't kill heals at the end of the turn.");
        if (guess != null) {
          const real = res.aDies && res.bDies ? 2 : res.aDies ? 0 : res.bDies ? 1 : 3;
          lines.unshift(guess === real ? `🎯 <b>Your guess was right!</b>` : `🤔 You guessed “${GUESSES[guess]}”. Here's what really happens:`);
        }
      }
      res.text = lines.join("<br>");
      fights++;
      if (oppLife <= 0) { oppLife = 0; res.text += "<br>🏆 Their life hit <b>0</b>: they would lose! (Tap Reset lives to keep practising.)"; }
      draw(res);
      const [ac, bc] = [$(".fight > div:first-child .mcard", el), $(".fight > div:last-child .mcard", el)];
      if (res.toA && ac) { ac.classList.add("hurt"); H().pop(ac, "-" + res.toA); }
      if (res.toB && bc) { bc.classList.add("hurt"); H().pop(bc, "-" + res.toB); }
      const oppBox = $(".life .p:last-child", el);
      if (oppLife !== oppBefore && oppBox) { tick($(".n", oppBox), oppBefore, oppLife); H().pop(oppBox, (oppLife < oppBefore ? "-" : "+") + Math.abs(oppBefore - oppLife), oppLife < oppBefore ? "" : "good"); }
      H().sfx(res.aDies && !res.bDies ? "bad" : "ok");
      if (fights >= (o.need || 3)) api.done();
    }
    draw();
  };

  /* Lesson 15: the stack. Bolt on your Bears, answer with Giant Growth, or Murder instead. */
  LW.stack = function (el, o, api) {
    let mode = "bolt", stack, bears, phase, outcome, tried = new Set();
    function reset(m) {
      mode = m || mode;
      bears = { p: 2, t: 2, alive: true };
      stack = [{ id: mode, who: "Opponent", note: "targets your Grizzly Bears" }];
      phase = "respond"; outcome = "";
      draw();
    }
    function draw() {
      const top = stack.length - 1;
      el.innerHTML = title(mode === "bolt" ? "Your opponent casts Lightning Bolt on your Bears!" : "This time they cast Murder on your Bears!") +
        `<div class="fight stackfight"><div style="display:grid;justify-items:center;gap:6px"><div class="zone-label">Your creature</div>${H().card("bears", { sm: true, cls: bears.alive ? "" : "dead" })}<b>${bears.alive ? `${bears.p}/${bears.t}` : "In the graveyard"}</b></div><span></span>
        <div style="width:100%"><div class="zone-label">The stack · top plate goes first</div><div class="stackbox">${stack.map((s, k) => `<div class="plate ${k === top ? "top" : ""}">${H().pips(C(s.id).cost)} ${C(s.id).name}<small>${s.who} · ${s.note}</small></div>`).join("") || '<span class="muted small" style="margin:auto">Empty</span>'}</div></div></div>
        <div class="acts" id="acts"></div><div class="msg"></div>`;
      const acts = $("#acts", el);
      if (phase === "respond") {
        acts.innerHTML = `<button class="btn sm go" type="button" id="gg">Respond: cast Giant Growth ${H().pips("{G}")}</button><button class="btn sm" type="button" id="pass">Do nothing</button>`;
        say(el, `${C(mode).name} is <b>on the stack</b>, waiting. It hasn't happened yet! You get a chance to respond first.`);
        $("#gg", el).onclick = () => { stack.push({ id: "growth", who: "You", note: "+3/+3 on your Bears" }); phase = "resolve"; draw(); say(el, "Giant Growth goes <b>on top</b> of the pile. Your opponent could respond again, but they pass. Now the plates come off, top first."); };
        $("#pass", el).onclick = () => { phase = "resolve"; draw(); say(el, "You let it go. Now the stack resolves."); };
      } else if (phase === "resolve") {
        acts.innerHTML = `<button class="btn sm pink" type="button" id="res">Resolve the top plate</button>`;
        $("#res", el).onclick = ev => {
          ev.currentTarget.disabled = true;
          const topPlate = $(".plate.top", el);
          if (topPlate && !H().calm()) { topPlate.classList.add("lift"); setTimeout(() => el.isConnected && resolveTop(), 320); } else resolveTop();
        };
        const resolveTop = () => {
          const s = stack.pop();
          if (s.id === "growth") { bears.p += 3; bears.t += 3; outcome = "Giant Growth happens first: your Bears become <b>5/5</b> until the end of the turn."; }
          else if (s.id === "bolt") {
            if (bears.t > 3) outcome = "Then Lightning Bolt: 3 damage to a 5/5. <b>Your Bears survive!</b> 🎉 Responding saved them.";
            else { bears.alive = false; outcome = "Lightning Bolt deals 3 damage to a 2/2 Bears. ☠️ They die."; }
          } else if (s.id === "murder") {
            bears.alive = false;
            outcome = bears.t > 2 ? "Then Murder: it says <b>destroy</b>, not damage. Size doesn't matter. ☠️ The Bears die even at 5/5. Giant Growth was the wrong answer here!" : "Murder destroys the Bears. ☠️";
          }
          if (!stack.length) { phase = "done"; tried.add(mode + (bears.alive ? "+" : "-")); }
          draw(); say(el, outcome, stack.length ? "" : (bears.alive ? "good" : ""));
          if (!stack.length) {
            $("#acts", el).innerHTML = `<button class="btn sm" type="button" id="again">Try again</button><button class="btn sm go" type="button" id="sw">${mode === "bolt" ? "Now try Murder instead" : "Back to Lightning Bolt"}</button>`;
            $("#again", el).onclick = () => reset();
            $("#sw", el).onclick = () => reset(mode === "bolt" ? "murder" : "bolt");
            if (tried.has("bolt+") && [...tried].some(t => t.startsWith("murder"))) api.done();
          }
        };
      }
    }
    reset("bolt");
  };

  /* Lesson 14: the zones of the table. */
  LW.zones = function (el, o, api) {
    const z = window.LEARN.zones;
    el.innerHTML = title("Tap each place on the table") + `<div class="board">${z.map((x, k) => `<button type="button" data-k="${k}" class="${x.cls || ""}"><i aria-hidden="true">${x.em}</i>${x.name}</button>`).join("")}</div><div class="msg">Every card is always in one of these places. Tap one.</div>`;
    const seen = new Set();
    $$("button", el).forEach(b => b.onclick = () => {
      const x = z[+b.dataset.k]; seen.add(+b.dataset.k);
      $$("button", el).forEach(y => y.classList.remove("on")); b.classList.add("on", "seen");
      say(el, `<b>${x.em} ${x.name}</b> · ${x.text}` + (seen.size === z.length ? "<br><br>✅ You've visited every zone." : ""), seen.size === z.length ? "good" : "");
      if (seen.size === z.length) api.done();
    });
  };


  /* A real four-player Commander table: three opponents and you, every permanent on the
     battlefield as a small tile (tap one to see the card big). With `pick`, the learner answers
     by tapping a permanent ("seat/key") or a player (seat number). Seats are [left, across, right, you]. */
  const COLOR = { W: "#e9dfbd", U: "#4f9fe0", B: "#6d6475", R: "#e2553b", G: "#2f9a57", M: "#d6b44c", C: "#b8b2a7", L: "#9b8b6a" };
  function permTile(spec, seat, k) {
    const p = typeof spec === "string" ? { k: spec } : spec;
    const c = p.k ? C(p.k) : null;
    const name = c ? c.name : `${p.tok} token`;
    const pt = p.pt || (c && c.pt);
    const ptTxt = pt ? `${pt[0] + (p.ctr || 0)}/${pt[1] + (p.ctr || 0)}` : "";
    const land = c && c.makes && !c.pt;
    const id = `${seat}/${p.id || p.k || p.tok.toLowerCase()}`;
    const real = c && H().useReal();
    const label = `${p.n > 1 ? p.n + " × " : ""}${name}${ptTxt ? ", " + ptTxt : ""}${p.ctr ? `, with ${p.ctr} +1/+1 counter${p.ctr > 1 ? "s" : ""}` : ""}${p.t ? ", tapped" : ""}${p.cmd ? ", their commander" : ""}`;
    return `<button class="perm ${p.tok ? "tok" : ""} ${land ? "land" : ""} ${p.t ? "tapped" : ""} ${p.cmd ? "cmdr" : ""}" type="button" data-perm="${id}"${c && !p.tok ? ` data-card="${p.k}"` : ""} style="--pc:${COLOR[(c && c.c) || p.c || "C"]}" aria-label="${H().esc(label)}" title="${H().esc(label)}">
      <span class="pic" aria-hidden="true">${real ? `<img src="${H().cardImg(c, "art_crop")}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.replaceWith(document.createTextNode('${c.art || "🃏"}'))">` : (c ? c.art : p.art) || "🃏"}</span>
      ${p.ctr ? `<span class="ctr" aria-hidden="true">+${p.ctr}</span>` : ""}${p.n > 1 ? `<span class="num" aria-hidden="true">×${p.n}</span>` : ""}${ptTxt ? `<span class="ptb" aria-hidden="true">${ptTxt}</span>` : ""}
      <span class="nm" aria-hidden="true">${H().esc(name)}</span></button>`;
  }
  LW.board = function (el, o, api) {
    const pick = o.pick;
    let solved = false;
    const seats = o.seats.map((st, k) => {
      const me = k === 3;
      const cmdOut = st.bf.some(x => x && x.cmd);
      const crit = st.bf.filter(x => { const c = typeof x === "string" ? C(x) : x.k ? C(x.k) : null; return !(c && c.makes && !c.pt); });
      const lands = st.bf.filter(x => !crit.includes(x));
      return `<section class="seat ${me ? "me" : ""} ${o.turn === k ? "turn" : ""} ${pick && pick.kind === "seat" ? "pick" : ""}" data-seat="${k}" aria-label="${H().esc(st.n)}, ${st.life} life"${pick && pick.kind === "seat" ? ' tabindex="0" role="button"' : ""}>
        <div class="who"><b>${me ? "🙂 " : ["👈 ", "👆 ", "👉 "][k]}${H().esc(st.n)}</b><span class="meta">${st.hand != null ? `✋ ${st.hand} · ` : ""}${st.lands ? `🌳 ${st.lands} lands` : ""}</span><span class="life">❤ ${st.life}</span></div>
        ${!cmdOut && st.cmd ? `<div class="cz">👑 Commander waiting in the command zone: <button class="linkish" type="button" data-zoom="${st.cmd}">${H().esc(C(st.cmd).name)}</button></div>` : ""}
        <div class="lane">${crit.map((x, i) => permTile(x, k, i)).join("") || '<span class="muted small" style="padding:8px 2px">No creatures or other permanents yet</span>'}</div>
        ${lands.length ? `<div class="lane">${lands.map((x, i) => permTile(x, k, i)).join("")}</div>` : ""}
      </section>`;
    });
    el.innerHTML = (o.title ? title(o.title) : "") + `<div class="board4">${seats.join("")}</div><div class="msg"></div>`;
    say(el, pick ? pick.prompt : (o.prompt || "Tap any card to see it big."));
    const answer = (id, node) => {
      if (solved) return;
      const ok = [].concat(pick.right).map(String).includes(String(id));
      const why = (pick.why && pick.why[id]) || (ok ? pick.ok : pick.no) || (ok ? "Yes!" : "Not this one. Have another look.");
      node.classList.add(ok ? "right" : "wrong");
      if (ok) { solved = true; say(el, "✅ " + why, "good"); H().sfx("ok"); H().pop(node, "✓", "star"); api.done(); }
      else { shake(node); say(el, why, "bad"); H().sfx("bad"); }
    };
    $$(".perm", el).forEach(b => b.onclick = e => {
      if (pick && pick.kind === "perm") return answer(b.dataset.perm, b);
      if (pick && pick.kind === "seat") return; // the seat handles it
      if (b.dataset.card) { e.stopPropagation(); H().zoom(b.dataset.card, b); }
    });
    if (pick && pick.kind === "seat") $$(".seat", el).forEach(sn => {
      const go = () => answer(sn.dataset.seat, sn);
      sn.onclick = e => { if (!e.target.closest("[data-zoom]")) go(); };
      sn.onkeydown = e => { if ((e.key === "Enter" || e.key === " ") && e.target === sn) { e.preventDefault(); go(); } };
    });
    if (!pick) api.done();
  };

  /* Lesson 18: commander tax and coming back from the command zone. */
  LW.tax = function (el, o, api) {
    let casts = 0, where = "command";
    const base = H().parseCost(C("trostani").cost);
    function draw(msg, kind) {
      const extra = casts * 2;
      el.innerHTML = title("Cast your commander again and again") +
        `<div class="fight"><div>${H().card("trostani", { sm: true })}</div><span></span>
        <div><div class="zone-label">Trostani is in the</div><b style="font-size:1.1rem">${where === "command" ? "👑 Command zone" : "⚔️ Battlefield"}</b>
        <div class="zone-label">Cost to cast her now</div><div class="cost-big">${base.map(s => H().pip(s)).join("")}${extra ? H().pip(String(extra)) : ""}</div>
        <div class="small muted" style="margin-top:6px">${extra ? `Her normal cost, plus ${Array.from({ length: casts }, () => H().pip("2")).join("")} tax (one ${H().pip("2")} per earlier cast)` : "Her normal cost, no tax yet"} · cast from the command zone ${casts} ${casts === 1 ? "time" : "times"} so far</div></div></div>
        <div class="acts">${where === "command" ? `<button class="btn sm go" type="button" id="cast">Cast her</button>` : `<button class="btn sm pink" type="button" id="die">She dies → send her home</button>`}</div><div class="msg"></div>`;
      say(el, msg || "Trostani starts in the command zone. Tap <b>Cast her</b>.", kind);
      const cast = $("#cast", el), die = $("#die", el);
      if (cast) cast.onclick = () => { casts++; where = "field"; draw(`Trostani is on the battlefield. The next time you cast her from the command zone, she'll cost ${H().pip("2")} more.`); };
      if (die) die.onclick = () => {
        where = "command";
        draw(casts >= 2 ? `👑 Back home again. Each cast from the command zone adds another ${H().pip("2")}. She's never gone for good, she just gets pricier.` : `👑 She went to the graveyard, and you moved her back to the command zone. Look at her cost now.`, casts >= 2 ? "good" : "");
        if (casts >= 2) api.done();
      };
    }
    draw();
  };

  /* Lesson 19: a whole turn, guided click by click. */
  LW.guided = function (el, o, api) {
    const S = { hand: ["forest", "growth"], lands: [{ id: "forest", t: true }], creatures: [{ id: "goblin", t: true, sick: false }], pool: 0, drawn: false, step: 0, opp: 40, bears: null };
    const T = [
      ["untap", "☀️ It's your turn. Your stuff is still tapped from last turn. Tap <b>Untap all</b>."],
      ["draw", "🃏 Draw a card: tap your <b>library</b> (the deck)."],
      ["land", "🌳 Play a land: tap the <b>Forest</b> in your hand."],
      ["mana", "💧 Tap <b>both Forests</b> on the table to make mana."],
      ["cast", "🐻 Cast <b>Grizzly Bears</b> from your hand. It costs {1}{G}."],
      ["attack", "⚔️ Time to attack! Tap <b>Raging Goblin</b> to attack. (The Bears just arrived, they're too sleepy.)"],
      ["end", "🌙 That's all. Tap <b>End turn</b>."],
      ["fin", ""]
    ];
    function draw(msg, kind) {
      const step = T[S.step][0];
      const hl = cond => cond ? "pulse" : "";
      el.classList.add("gt");
      el.innerHTML = title("Your turn, one step at a time") +
        (step !== "fin" ? `<div class="task"><span>${S.step + 1}/7</span><span>${H().fmt(T[S.step][1])}</span></div>` : `<div class="task">🎉 You just played a whole turn of Magic!</div>`) +
        `<div class="board2"><div class="area opp"><div class="zone-label">Opponent</div><b>❤ ${S.opp} life</b></div>
        <div class="area"><div class="zone-label">Your battlefield</div><div class="row-cards" id="bf">${S.creatures.map((c, k) => H().card(c.id, { sm: true, button: true, cls: [c.t ? "tapped" : "", c.sick ? "sick" : "", hl(step === "attack" && c.id === "goblin")].join(" "), data: { c: k } })).join("")}
          ${S.lands.map((c, k) => H().card(c.id, { sm: true, button: true, cls: (c.t ? "tapped " : "") + hl(step === "mana" && !c.t), data: { l: k } })).join("")}</div>
          <div class="zone-label">Mana ready</div><div class="pool">${S.pool ? H().pips("{G}".repeat(S.pool)) : '<span class="muted small">none</span>'}</div></div>
        <div class="area"><div class="zone-label">Your hand</div><div class="row-cards"><button class="libr ${hl(step === "draw")}" type="button" id="lib">Library<br>(deck)</button>${S.hand.map((id, k) => H().card(id, { sm: true, button: true, cls: hl((step === "land" && id === "forest") || (step === "cast" && id === "bears")), data: { h: k } })).join("")}</div></div></div>
        <div class="acts">${step === "untap" ? `<button class="btn sm go pulse" type="button" id="untap">Untap all</button>` : ""}${step === "end" ? `<button class="btn sm go pulse" type="button" id="end">End turn</button>` : ""}${step === "fin" ? `<button class="btn sm" type="button" id="again">Play it again</button>` : ""}</div>
        <div class="msg"></div>`;
      say(el, msg || (step === "fin" ? "Untap, draw, play a land, cast a spell, attack, done. That's the rhythm of every turn, and now you've done it." : "Follow the pink glow."), kind || (step === "fin" ? "good" : ""));
      const nope = (node, why) => { shake(node); say(el, "🙂 " + why, "bad"); };
      const adv = m => { S.step++; draw(m); };
      const u = $("#untap", el); if (u) u.onclick = () => { S.lands.forEach(c => c.t = false); S.creatures.forEach(c => c.t = false); adv("Everything stood back up. Fresh turn!"); };
      const e = $("#end", el); if (e) e.onclick = () => { S.pool = 0; adv(); api.done(); };
      const ag = $("#again", el); if (ag) ag.onclick = () => LW.guided(el, o, api);
      $("#lib", el).onclick = ev => {
        if (step !== "draw") return nope(ev.currentTarget, S.drawn ? "You only draw one card in your draw step." : "Not yet: first untap.");
        S.drawn = true; S.hand.push("bears"); adv("You drew <b>Grizzly Bears</b>!");
      };
      $$("[data-h]", el).forEach(b => b.onclick = () => {
        const id = S.hand[+b.dataset.h];
        if (id === "forest") {
          if (step !== "land") return nope(b, step === "untap" || step === "draw" ? "Lands come a bit later, in your main phase." : "You already played your land this turn.");
          S.hand.splice(+b.dataset.h, 1); S.lands.push({ id: "forest", t: false }); return adv("Two Forests on the table now.");
        }
        if (id === "bears") {
          if (step !== "cast") return nope(b, "First get the mana ready: tap both Forests.");
          if (S.pool < 2) return nope(b, "Not enough mana yet.");
          S.pool -= 2; S.hand.splice(+b.dataset.h, 1); S.creatures.push({ id: "bears", t: false, sick: true });
          return adv("🐻 Grizzly Bears enter the battlefield. The 💤 means they just arrived and can't attack this turn.");
        }
        if (id === "growth") return nope(b, "Keep Giant Growth for later. It's an instant, so you could even cast it on your opponent's turn.");
      });
      $$("[data-l]", el).forEach(b => b.onclick = () => {
        const c = S.lands[+b.dataset.l];
        if (step !== "mana") return nope(b, step === "untap" ? "Untap first." : "You don't need mana right now.");
        if (c.t) return nope(b, "That one's already tapped.");
        c.t = true; S.pool++;
        if (S.lands.every(x => x.t)) adv(`${H().pips("{G}{G}")} ready to spend.`); else draw("One more Forest!");
      });
      $$("[data-c]", el).forEach(b => b.onclick = () => {
        const c = S.creatures[+b.dataset.c];
        if (step !== "attack") return nope(b, step === "untap" ? "Untap first." : "Attacking comes after your main phase.");
        if (c.id === "bears") return nope(b, "The Bears have summoning sickness 💤: creatures can't attack the turn they arrive.");
        c.t = true; S.opp -= 1; adv("The Goblin taps and attacks. Nobody blocks: the opponent drops to <b>39</b>.");
        H().pop($(".area.opp", el), "-1");
      });
    }
    draw();
  };

  /* Lesson 20: who to attack at a four-player table. */
  /* Lesson "table": pick who to attack. Every pick is explained; the threat is the best one. */
  LW.table = function (el, o, api) {
    el.innerHTML = title(o.title || "Who do you attack?") + `<div class="life seats">${o.players.map((p, k) => `<button class="p" type="button" data-k="${k}"><span class="who">${p[0]}</span><span class="n" style="font-size:1.4rem">❤ ${p[1]}</span><span class="small">${p[2]}</span></button>`).join("")}</div><div class="msg">${o.prompt || "Tap the player you'd attack."}</div>`;
    $$(".seats .p", el).forEach(b => b.onclick = () => {
      const p = o.players[+b.dataset.k];
      $$(".seats .p", el).forEach(x => x.classList.remove("on")); b.classList.add("on");
      say(el, (p[3] ? "🎯 " : "🤔 ") + p[4], p[3] ? "good" : "bad");
      if (p[3]) api.done(); else shake(b);
    });
  };

  /* Lesson "tricks": creatures entering set off Trostani and Ajani's Pridemate by themselves. */
  LW.engine = function (el, o, api) {
    let life = 40, counters = 0, tokens = [], acts = 0, popd = false;
    function draw(msg, kind) {
      el.innerHTML = title("Your engine: watch the triggers") +
        `<div class="row-cards" style="justify-content:center">${H().card("trostani", { sm: true })}${H().card("pridemate", { sm: true })}</div>
        <div class="stats" style="font-size:.95rem;margin-top:8px"><span>🐱 Pridemate: ${counters ? `<b>${2 + counters}/${2 + counters}</b> (${counters} counter${counters > 1 ? "s" : ""} ${"➕".repeat(Math.min(counters, 8))})` : "<b>2/2</b>"}</span></div>
        <div class="zone-label">Your tokens</div><div class="row-cards">${tokens.map(t => `<span class="tok">${t === "angel" ? "👼 4/4 Angel" : "🧑 1/1 Citizen"}</span>`).join("") || '<span class="muted small">none yet</span>'}</div>
        <div class="life" style="grid-template-columns:1fr;margin-top:10px"><div class="p" id="mylife"><div class="who">Your life</div><div class="n">${life}</div></div></div>
        <div class="acts"><button class="btn sm" type="button" data-a="citizen">A 1/1 Citizen token enters</button><button class="btn sm" type="button" data-a="angel">A 4/4 Angel token enters</button><button class="btn sm go" type="button" data-a="pop" ${tokens.length ? "" : "disabled"}>Populate ${H().pips("{1}{G}{W}")}</button></div>
        <div class="msg"></div>`;
      say(el, msg || "Make a creature enter and watch what happens <b>by itself</b>.", kind);
      $$("[data-a]", el).forEach(x => x.onclick = () => {
        let t = x.dataset.a;
        if (t === "pop") {
          // populate copies a token you have: copy the best one
          t = tokens.includes("angel") ? "angel" : "citizen"; popd = true;
        }
        const tough = t === "angel" ? 4 : 1, before = life;
        tokens.push(t); life += tough; counters++; acts++;
        const how = x.dataset.a === "pop" ? `Populate made a copy of your ${t === "angel" ? "Angel" : "Citizen"} token. The copy <b>enters</b> too, so…<br>` : "";
        draw(`${how}1️⃣ <b>Trostani</b>: “whenever another creature you control enters, gain life equal to its toughness” → you gain ${tough} (${"❤".repeat(tough)}).<br>2️⃣ <b>Ajani's Pridemate</b>: “whenever you gain life” → it gets a ➕ counter.<br>You didn't press anything for those: they're <b>triggers</b>.`, "good");
        tickLife(before);
        H().pop($("#mylife", el), "+" + tough, "good");
        if (acts >= 3 && popd) api.done();
      });
    }
    function tickLife(from) { const n = $("#mylife .n", el); if (n) { n.textContent = from; let v = from; const id = setInterval(() => { if (!n.isConnected || v >= life) return clearInterval(id); n.textContent = ++v; }, 90); } }
    draw();
  };

  /* Lesson "others": an opponent attacks you. Choose a block, then whether to use Giant Growth. */
  LW.defend = function (el, o, api) {
    let blockOn = null, phase = "block";
    const tell = (msg, kind) => say(el, msg, kind);
    function draw() {
      el.innerHTML = title("Sam's turn: Sam attacks you!") +
        `<div class="zone-label">Sam's attackers</div><div class="row-cards">${H().card("giant", { sm: true, cls: "tapped" })}${H().card("goblin", { sm: true, cls: "tapped" })}</div>
        <div class="zone-label">Your untapped cards</div><div class="row-cards">${H().card("spider", { sm: true })}${H().card("forest", { sm: true })}</div>
        <div class="zone-label">In your hand</div><div class="row-cards">${H().card("growth", { sm: true })}</div>
        <div class="acts" id="dacts"></div><div class="msg"></div>`;
      const acts = $("#dacts", el);
      if (phase === "block") {
        acts.innerHTML = `<button class="btn sm" type="button" data-b="giant">Spider blocks Hill Giant</button><button class="btn sm" type="button" data-b="goblin">Spider blocks the Goblin</button><button class="btn sm" type="button" data-b="none">Don't block</button>`;
        tell("It's not your turn, but you still decide things. Your Giant Spider (2/4) is untapped, so it can <b>block</b> one attacker.");
        $$("[data-b]", el).forEach(x => x.onclick = () => { blockOn = x.dataset.b; phase = "trick"; draw(); });
      } else if (phase === "trick") {
        acts.innerHTML = `<button class="btn sm go" type="button" data-t="1">Cast Giant Growth on the Spider</button><button class="btn sm" type="button" data-t="0">Keep it, say “OK”</button>`;
        tell(`${blockOn === "none" ? "No blocks." : `The Spider blocks ${blockOn === "giant" ? "Hill Giant" : "Raging Goblin"}.`} Before damage, you can still cast an <b>instant</b>. You have an untapped Forest and Giant Growth.`);
        $$("[data-t]", el).forEach(x => x.onclick = () => { phase = "done"; result(x.dataset.t === "1"); });
      }
    }
    function result(grow) {
      const lines = [];
      let best = false;
      if (blockOn === "none") {
        lines.push("Both attackers hit you: 3 damage from the Giant and 1 from the Goblin. Nothing of yours dies.");
        if (grow) lines.push("Giant Growth did nothing useful: the Spider wasn't in a fight. Instants are best used <b>during</b> a fight.");
      } else if (blockOn === "goblin") {
        lines.push(`The Spider kills the Goblin and survives. Hill Giant hits you for 3.`);
        if (grow) lines.push("Giant Growth wasn't needed: the Spider already won that fight. Keep tricks for when they change the result.");
      } else {
        lines.push(grow ? "Giant Growth makes the Spider <b>5/7</b>: it hits the Giant for 5 and the Giant (3/3) <b>dies</b>. The Spider survives. Only the Goblin hits you, for 1." : "The Spider (2/4) takes 3 and survives; the Giant (3/3) takes 2 and survives too. The Goblin hits you for 1.");
        best = grow;
      }
      lines.push(best ? "🏆 <b>Best play!</b> You blocked the big one and used your instant to win the fight on someone else's turn." : "💡 The best play here: block <b>Hill Giant</b>, then cast <b>Giant Growth</b> so the Spider wins the fight. Try it!");
      el.querySelector("#dacts").innerHTML = `<button class="btn sm" type="button" id="again">Try again</button>`;
      say(el, lines.join("<br>"), best ? "good" : "");
      $("#again", el).onclick = () => { blockOn = null; phase = "block"; draw(); };
      if (best) api.done();
    }
    draw();
  };
})();
