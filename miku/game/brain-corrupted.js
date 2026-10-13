/* The Corrupted Miku turn planner: reads a board (yours and the opponents') and works out
   - the lines that win, ranked: what each costs, which tutor fetches which piece, and whether it
     happens this turn, next turn or later;
   - the threats: the hate pieces that stop a line, the boards that can kill you, who can answer you,
     each with the answer you hold.
   It is plain data in, plain data out, so the game's companion (cards-corrupted.js) and the site's
   turn solver widget (corrupted/site.js) share it. Card names are exact.

   solve(state) takes:
     bf: [{ name, sick, counters, green }]  your permanents (green: a green creature Natural Order can sacrifice)
     hand: [names], gy: [names]             your hand and graveyard
     creaturesInHand: [names]               creature cards in hand (Survival of the Fittest discards one)
     convoke: number                        untapped creatures that could convoke Chord of Calling
     canPay(cost), canPayNext(cost)         can you pay "{2}{G}{G}" now / once you untap
     manaNow, manaNext: numbers             for the text only
     quiet: name or null                    Grand Abolisher, Kutzil or Voice of Victory on your side
     opps: [{ name, life, hand, open, power, hate: [{ name, types }], top: [{ name, types, power, score, commander }] }]
     life, myTurn, main (a sorcery-speed window now)
     hoof (optional): { creatures, attackers, power, sacAttacker, sacPower } your board, for Craterhoof math
   Returns { lines, threats, best, risk }. */
(function (root) {
  "use strict";

  const PIECES = {
    "Archangel of Thune": { cost: "{3}{W}{W}", mv: 5, green: false, tough: 4 },
    "Spike Feeder": { cost: "{1}{G}{G}", mv: 3, green: true, tough: 0 },
    "Heliod, Sun-Crowned": { cost: "{2}{W}", mv: 3, green: false, tough: 5, artEnch: true },
    "Walking Ballista": { cost: "{4}", mv: 0, green: false, tough: 0, artEnch: true, note: "X=2" },
    "Devoted Druid": { cost: "{1}{G}", mv: 2, green: true, tough: 2 },
    "Vizier of Remedies": { cost: "{1}{W}", mv: 2, green: false, tough: 1 }
  };
  const COMBOS = [
    { short: "Thune + Feeder", key: "thune", pieces: ["Archangel of Thune", "Spike Feeder"], title: "Archangel of Thune + Spike Feeder", kill: true, extra: "",
      how: "Remove a counter from Spike Feeder (×N): each 2 life puts a +1/+1 counter on every creature you control. Infinite life, an army of giants." },
    { short: "Heliod + Ballista", key: "heliodBallista", pieces: ["Heliod, Sun-Crowned", "Walking Ballista"], title: "Heliod + Walking Ballista", kill: true, extra: "{1}{W}",
      how: "Pay {1}{W}: Heliod gives Walking Ballista lifelink. Ping (×N): each 1 damage gains 1 life and Heliod puts the counter back. Infinite damage." },
    { short: "Druid + Vizier", key: "druid", pieces: ["Devoted Druid", "Vizier of Remedies"], title: "Devoted Druid + Vizier of Remedies", kill: false, extra: "",
      how: "Tap and untap Devoted Druid (×N): Vizier stops the -1/-1 counter, so it's infinite {G}." },
    { short: "Heliod + Feeder", key: "heliodFeeder", pieces: ["Heliod, Sun-Crowned", "Spike Feeder"], title: "Heliod + Spike Feeder", kill: false, extra: "",
      how: "Remove a counter from Spike Feeder: gain 2, Heliod puts the counter back. Infinite life." }
  ];
  /* Who fetches what, where it puts it and what it costs for a piece of mana value mv. */
  const TUTORS = {
    "Worldly Tutor": { cost: () => "{G}", dest: "top", instant: true, finds: () => true },
    "Enlightened Tutor": { cost: () => "{W}", dest: "top", instant: true, finds: n => !!PIECES[n].artEnch },
    "Eladamri's Call": { cost: () => "{G}{W}", dest: "hand", instant: true, finds: () => true },
    "Archdruid's Charm": { cost: () => "{G}{G}{G}", dest: "hand", instant: true, finds: () => true },
    "Summoner's Pact": { cost: () => "{0}", dest: "hand", instant: true, pact: true, finds: n => PIECES[n].green },
    "Chord of Calling": { cost: mv => `{${mv}}{G}{G}{G}`, dest: "battlefield", instant: true, convoke: true, cage: true, finds: n => n !== "Walking Ballista" },
    "Green Sun's Zenith": { cost: mv => `{${mv}}{G}`, dest: "battlefield", cage: true, finds: n => PIECES[n].green },
    "Finale of Devastation": { cost: mv => `{${mv}}{G}{G}`, dest: "battlefield", cage: true, graveyard: true, finds: n => n !== "Walking Ballista" },
    "Natural Order": { cost: () => "{2}{G}{G}", dest: "battlefield", cage: true, sac: true, finds: n => PIECES[n].green },
    "Survival of the Fittest": { cost: () => "{G}", dest: "hand", instant: true, onBoard: true, discardCreature: true, finds: () => true },
    "Recruiter of the Guard": { cost: () => "{2}{W}", dest: "hand", etb: true, finds: n => PIECES[n].tough <= 2 },
    "Ranger-Captain of Eos": { cost: () => "{1}{W}{W}", dest: "hand", etb: true, finds: n => PIECES[n].mv <= 1 },
    "Brightglass Gearhulk": { cost: () => "{G}{G}{W}{W}", dest: "hand", etb: true, finds: n => PIECES[n].mv <= 1 },
    "Formidable Speaker": { cost: () => "{2}{G}", dest: "hand", etb: true, discard: true, finds: () => true },
    "Congregation at Dawn": { cost: () => "{G}{G}{W}", dest: "top", instant: true, finds: () => true },
    "Idyllic Tutor": { cost: () => "{2}{W}", dest: "hand", finds: n => n === "Heliod, Sun-Crowned" }
  };
  /* What each hate piece shuts off. */
  const HATE = {
    "Grafdigger's Cage": { types: ["Artifact"], stops: { cage: true }, why: "Creatures can't enter from your library, so Chord, Green Sun's Zenith, Finale and Natural Order whiff" },
    "Torpor Orb": { types: ["Artifact"], stops: { etb: true }, why: "Your creatures' enters abilities don't trigger, so Recruiter, Ranger-Captain, Gearhulk and Speaker find nothing" },
    "Hushbringer": { types: ["Creature"], stops: { etb: true }, why: "Enters abilities don't trigger, so your creature tutors find nothing" },
    "Null Rod": { types: ["Artifact"], stops: { ballista: true }, why: "Artifacts' abilities stop: Walking Ballista can't ping and your rocks make no mana" },
    "Collector Ouphe": { types: ["Creature"], stops: { ballista: true }, why: "Artifacts' abilities stop: Walking Ballista can't ping and your rocks make no mana" },
    "Stony Silence": { types: ["Enchantment"], stops: { ballista: true }, why: "Artifacts' abilities stop: Walking Ballista and your rocks" },
    "Cursed Totem": { types: ["Artifact"], stops: { all: true }, why: "Creatures' activated abilities stop: Feeder, Druid, Ballista and your dorks, so every combo" },
    "Linvala, Keeper of Silence": { types: ["Creature"], stops: { all: true }, why: "Your creatures can't activate abilities, so every combo and your dorks are off" },
    "Humility": { types: ["Enchantment"], stops: { all: true }, why: "Every creature is a 1/1 with no abilities, so every combo is off" },
    "Rest in Peace": { types: ["Enchantment"], stops: { graveyard: true }, why: "Your graveyard is exiled: Finale can't fetch from it and Eternal Witness gets nothing" },
    "Drannith Magistrate": { types: ["Creature"], stops: { shalai: true }, why: "You can't cast Shalai from the command zone" },
    "Aven Mindcensor": { types: ["Creature"], stops: { search: true }, why: "Your searches see only the top four cards, so every tutor may miss" }
  };
  /* Your answers and what they hit. */
  const ANSWERS = [
    { name: "Swords to Plowshares", hits: ["Creature"], cost: "{W}" },
    { name: "Path to Exile", hits: ["Creature"], cost: "{W}" },
    { name: "Solitude", hits: ["Creature"], cost: "{0}", note: "evoke: exile a white card" },
    { name: "Kenrith's Transformation", hits: ["Creature"], cost: "{1}{G}" },
    { name: "Force of Vigor", hits: ["Artifact", "Enchantment"], cost: "{0}", note: "free on their turn: exile a green card" },
    { name: "Archdruid's Charm", hits: ["Artifact", "Enchantment"], cost: "{G}{G}{G}" },
    { name: "Boseiju, Who Endures", hits: ["Artifact", "Enchantment"], cost: "{1}{G}", note: "channel from your hand" },
    { name: "Generous Gift", hits: ["Artifact", "Enchantment", "Creature"], cost: "{2}{W}" }
  ];
  const QUIET = ["Grand Abolisher", "Kutzil, Malamet Exemplar", "Voice of Victory"];
  const SILENCE = ["Silence", "Orim's Chant"];

  const short = n => n.split(",")[0];
  const list = names => names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " or " + names[names.length - 1];
  /* {3}{G}{W} -> { n: 3, G: 1, W: 1 }; costs add up and print back. */
  function parse(c) {
    const o = { n: 0, G: 0, W: 0 };
    String(c || "").replace(/\{([^}]+)\}/g, (m, s) => { if (/^\d+$/.test(s)) o.n += +s; else if (s === "G" || s === "W") o[s]++; else if (s !== "X") o.n++; });
    return o;
  }
  const add = (a, b) => ({ n: a.n + b.n, G: a.G + b.G, W: a.W + b.W });
  const sub = (a, b) => ({ n: Math.max(0, a.n - b.n), G: Math.max(0, a.G - b.G), W: Math.max(0, a.W - b.W) });
  const ZERO = { n: 0, G: 0, W: 0 };
  const fmt = o => (o.n || (!o.G && !o.W) ? `{${o.n}}` : "") + "{G}".repeat(o.G) + "{W}".repeat(o.W);
  const total = o => o.n + o.G + o.W;

  function solve(s) {
    const bf = s.bf || [], hand = s.hand || [], gy = s.gy || [];
    const onBf = n => bf.find(o => o.name === n);
    const inHand = n => hand.includes(n);
    const hate = [];
    for (const q of s.opps || []) for (const h of q.hate || []) if (HATE[h.name]) hate.push(Object.assign({ owner: q.name, types: h.types || HATE[h.name].types }, HATE[h.name], { name: h.name }));
    const stopped = k => hate.filter(h => h.stops[k] || (k !== "shalai" && k !== "search" && k !== "graveyard" && h.stops.all));
    const canPay = s.canPay || (() => false), canPayNext = s.canPayNext || canPay;
    const greaves = !!onBf("Lightning Greaves");
    const creaturesInHand = s.creaturesInHand || hand.filter(h => PIECES[h]);
    const pactOk = canPayNext("{2}{G}{G}");
    const mindcensor = hate.some(h => h.stops.search);

    /* Every way to get piece n onto the battlefield, ready to use. */
    function routes(n, used) {
      const P = PIECES[n], out = [];
      const sickDruid = n === "Devoted Druid" && !greaves;
      if (inHand(n) && !used.has(n)) out.push({ cards: [n], cost: parse(P.cost), sorcery: true, when: sickDruid ? "next" : "now", steps: [{ text: `Cast ${short(n)} (${P.cost}${P.note ? `, ${P.note}` : ""}).`, cards: [n] }] });
      for (const t in TUTORS) {
        const T = TUTORS[t];
        if (used.has(t) || !T.finds(n)) continue;
        const have = T.onBoard ? !!onBf(t) : inHand(t);
        if (!have) continue;
        if (T.cage && stopped("cage").length) continue;
        if (T.etb && stopped("etb").length) continue;
        if (T.discardCreature && !creaturesInHand.some(h => h !== n && !used.has(h))) continue;
        if (T.discard && hand.filter(h => h !== t && !used.has(h)).length < 1) continue;
        if (T.sac && !bf.some(o => o.green && !PIECES[o.name])) continue;
        if (T.pact && !pactOk) continue;
        const tc = parse(T.cost(P.mv));
        if (T.convoke) tc.n = Math.max(0, tc.n - (s.convoke || 0));
        const via = [t];
        let cost = tc, when = "now";
        const steps = [];
        const tName = T.onBoard ? `${t} ({G}, discard a creature card)` : `${t} (${T.cost(P.mv)}${T.convoke && s.convoke ? `, convoke up to ${s.convoke}` : ""})`;
        if (T.dest === "battlefield") {
          const x = T.cost(0) !== T.cost(1) ? ` with X=${P.mv}` : "";
          steps.push({ text: `Cast ${tName}${x}${T.sac ? ", sacrificing a green creature" : ""}: ${short(n)} goes straight onto the battlefield.`, cards: [t, n] });
          if (sickDruid) when = "next";
        } else if (T.dest === "hand") {
          steps.push({ text: `${T.etb ? "Cast" : T.onBoard ? "Activate" : "Cast"} ${tName} for ${short(n)} to your hand.${T.pact ? " Pay {2}{G}{G} next upkeep." : ""}`, cards: [t, n] });
          steps.push({ text: `Cast ${short(n)} (${P.cost}${P.note ? `, ${P.note}` : ""}).`, cards: [n] });
          cost = add(cost, parse(P.cost));
          if (sickDruid) when = "next";
        } else {
          steps.push({ text: `${t} (${T.cost(P.mv)}) puts ${short(n)} on top: you draw it next turn. Best at the end of the turn before yours.`, cards: [t, n] });
          cost = add(cost, parse(P.cost));
          when = sickDruid ? "later" : "next";
          via.push("top");
        }
        // a creature you then cast, an enters trigger or a sorcery: only in your main phase
        const sorcery = T.dest !== "battlefield" || !T.instant;
        out.push({ cards: via.filter(x => x !== "top"), tutor: t, dest: T.dest, instant: !!T.instant, sorcery, cost, tutorCost: tc, when, steps });
      }
      // Finale can also take it back from your graveyard
      if (gy.includes(n) && inHand("Finale of Devastation") && !used.has("Finale of Devastation") && n !== "Walking Ballista" && !stopped("cage").length && !stopped("graveyard").length)
        out.push({ cards: ["Finale of Devastation"], tutor: "Finale of Devastation", dest: "battlefield", sorcery: true, cost: parse(`{${P.mv}}{G}{G}`), when: n === "Devoted Druid" && !greaves ? "next" : "now", steps: [{ text: `Cast Finale of Devastation (X=${P.mv}) for ${short(n)} from your graveyard.`, cards: ["Finale of Devastation", n] }] });
      return out;
    }

    const lines = [];
    for (const c of COMBOS) {
      // a hate piece that switches this combo off
      const off = hate.filter(h => h.stops.all || (h.stops.ballista && c.pieces.includes("Walking Ballista")));
      const missing = [], ready = [];
      for (const n of c.pieces) {
        const o = onBf(n);
        if (!o) { missing.push(n); continue; }
        if (n === "Devoted Druid" && o.sick && !greaves) ready.push({ n, sick: true });
        else ready.push({ n });
      }
      if (missing.length === 2 && !missing.some(n => inHand(n) || hand.some(t => TUTORS[t] && TUTORS[t].finds(n)) || (onBf("Survival of the Fittest")))) continue;
      // pick a route per missing piece, cards not reused
      let best = null;
      const pick = (i, used, acc) => {
        if (i === missing.length) {
          let cost = acc.reduce((t, r) => add(t, r.cost), { n: 0, G: 0, W: 0 });
          const steps = [].concat(...acc.map(r => r.steps));
          let when = acc.some(r => r.when === "later") ? "later" : acc.some(r => r.when === "next") ? "next" : "now";
          // outside your main phase, anything at sorcery speed waits for your next turn
          if (when === "now" && !s.main && acc.some(r => r.sorcery)) when = "next";
          if (ready.some(r => r.sick)) { when = "next"; }
          // Ballista needs 2 counters before Heliod's loop
          if (c.key === "heliodBallista") {
            const b = onBf("Walking Ballista");
            if (b && (b.counters || 0) < 2) { const k = 2 - (b.counters || 0); cost = add(cost, { n: 4 * k, G: 0, W: 0 }); steps.push({ text: `Pay {4} ${k > 1 ? "twice " : ""}for Ballista's counter${k > 1 ? "s" : ""}: it needs 2.`, cards: ["Walking Ballista"] }); }
          }
          if (c.key === "thune") {
            const f = onBf("Spike Feeder");
            if (f && !(f.counters > 0)) return; // a Feeder with no counters does nothing
          }
          cost = add(cost, parse(c.extra));
          // not this turn: instant tutors go at the end of the turn before yours, with mana you'd untap anyway
          let early = ZERO;
          const later = () => {
            early = ZERO;
            for (const r of acc) if (r.instant && r.tutorCost && canPay(fmt(add(early, r.tutorCost)))) early = add(early, r.tutorCost);
            return canPayNext(fmt(sub(cost, early)));
          };
          if (when === "now" && !canPay(fmt(cost))) when = later() ? "next" : "later";
          else if (when === "next" && !later()) when = "later";
          else if (when === "later") later();
          const r = { acc, cost, early: when === "now" ? ZERO : early, steps, when };
          const rank = x => ({ now: 0, next: 1, later: 2 }[x.when] * 100 + total(sub(x.cost, x.early)) + x.acc.reduce((t, y) => t + y.cards.length + (y.dest === "top" ? 1 : 0), 0) * 2 + (x.acc.some(y => y.tutor === "Summoner's Pact") ? 3 : 0));
          if (!best || rank(r) < rank(best)) best = r;
          return;
        }
        for (const r of routes(missing[i], used)) {
          const u = new Set(used); r.cards.forEach(x => u.add(x));
          pick(i + 1, u, acc.concat([r]));
        }
      };
      pick(0, new Set(), []);
      if (!best) continue;
      // the finisher: what turns the loop into a win
      const steps = best.steps.slice();
      let kill = c.kill, finish = "";
      if (c.key === "druid") {
        const sink = onBf("Walking Ballista") ? "Walking Ballista is out: pour the mana into its {4} ability and ping everyone out." : inHand("Walking Ballista") ? "Cast Walking Ballista for a huge X with the mana and ping everyone out." : inHand("Finale of Devastation") ? "Cast Finale of Devastation for X 10+: Craterhoof, then the team gets +X/+X and haste." : "No outlet yet: Shalai's {4}{G}{G} makes the whole team huge, but the real kill needs Walking Ballista.";
        kill = /ping|Finale/.test(sink); finish = sink;
      } else if (c.key === "heliodFeeder") {
        finish = onBf("Walking Ballista") || inHand("Walking Ballista") ? "Add Walking Ballista to turn the life into damage." : "You can't lose to damage, but you still need Walking Ballista or Archangel of Thune to win.";
        kill = false;
      } else if (c.key === "thune") {
        finish = onBf("Walking Ballista") ? "Ballista grows with each loop: ping everyone out." : "Then attack: every creature is enormous and Shalai's team has hexproof.";
      }
      if (ready.some(r => r.sick)) steps.unshift({ text: "Devoted Druid is summoning sick: it taps for mana next turn (Lightning Greaves gives it haste).", cards: ["Devoted Druid", "Lightning Greaves"] });
      steps.push({ text: c.how + (finish ? " " + finish : ""), cards: c.pieces });
      lines.push({
        key: c.key, title: c.title, short: c.short, kill, when: off.length ? "blocked" : best.when, cost: fmt(best.cost), mana: total(best.cost),
        early: total(best.early) ? fmt(best.early) : "", onTurn: total(best.early) ? fmt(sub(best.cost, best.early)) : fmt(best.cost),
        have: ready.map(r => r.n), missing, tutors: best.acc.map(r => r.tutor).filter(Boolean), steps, blockedBy: off,
        instantTutor: best.acc.every(r => !r.tutor || r.instant), score: 0
      });
    }
    // Craterhoof: Natural Order, Green Sun's Zenith, Chord or Finale for it, or cast from hand
    if (s.hoof && (s.opps || []).length) {
      const H = s.hoof, lives = (s.opps || []).filter(q => q.life > 0).map(q => q.life).sort((a, b) => a - b);
      const ways = [];
      if (inHand("Natural Order") && bf.some(o => o.green && !PIECES[o.name])) ways.push({ via: "Natural Order", cost: "{2}{G}{G}", sac: true });
      if (inHand("Green Sun's Zenith")) ways.push({ via: "Green Sun's Zenith", cost: "{8}{G}" });
      if (inHand("Chord of Calling")) ways.push({ via: "Chord of Calling", cost: `{${Math.max(0, 8 - (s.convoke || 0))}}{G}{G}{G}` });
      if (inHand("Craterhoof Behemoth")) ways.push({ via: "Craterhoof Behemoth", cost: "{5}{G}{G}{G}" });
      const ok = ways.filter(w => !(w.via !== "Craterhoof Behemoth" && stopped("cage").length));
      if (ok.length) {
        const w = ok.find(x => canPay(x.cost)) || ok[0];
        const n = H.creatures - (w.sac ? 1 : 0) + 1, a = H.attackers - (w.sac && H.sacAttacker ? 1 : 0) + 1;
        const dmg = H.power - (w.sac && H.sacAttacker ? H.sacPower || 0 : 0) + 5 + a * n;
        let left = dmg, dead = 0;
        for (const l of lives) if (left >= l) { left -= l; dead++; }
        const when = canPay(w.cost) && s.main ? "now" : canPayNext(w.cost) ? "next" : "later";
        lines.push({
          key: "hoof", title: w.via === "Craterhoof Behemoth" ? "Craterhoof Behemoth" : `${w.via} for Craterhoof`, short: w.via === "Craterhoof Behemoth" ? "Craterhoof" : `${short(w.via)} → Hoof`, kill: dead === lives.length, when: hate.some(h => h.name === "Humility") ? "blocked" : when,
          cost: w.cost, mana: total(parse(w.cost)), have: [], missing: ["Craterhoof Behemoth"], tutors: w.via === "Craterhoof Behemoth" ? [] : [w.via],
          steps: [
            { text: w.via === "Craterhoof Behemoth" ? `Cast Craterhoof (${w.cost}): it has haste.` : `Cast ${w.via} (${w.cost})${w.sac ? ", sacrificing a dork" : ""} for Craterhoof Behemoth.`, cards: [w.via, "Craterhoof Behemoth"].filter((x, i, arr) => arr.indexOf(x) === i) },
            { text: `Attack with ${a} creature${a > 1 ? "s" : ""}, each +${n}/+${n} with trample: about ${dmg} damage. ${dead === lives.length ? "That kills the whole table." : dead ? `That kills ${dead} of ${lives.length} (they're at ${lives.join(", ")}).` : `Not lethal on anyone (lowest is ${lives[0]}): grow the board first.`}`, cards: [] }
          ],
          blockedBy: hate.filter(h => h.name === "Humility"), early: "", onTurn: w.cost, instantTutor: false, score: 0, damage: dmg, kills: dead
        });
      }
    }
    const W = { now: 0, next: 1, later: 2, blocked: 3 };
    for (const l of lines) l.score = W[l.when] * 100 + (l.kill ? 0 : l.kills ? 25 : 40) + l.mana + l.missing.length * 5;
    lines.sort((a, b) => a.score - b.score);

    /* threats: the board you face, most urgent first */
    const threats = [];
    const answersFor = types => ANSWERS.filter(a => inHand(a.name) && a.hits.some(t => types.includes(t)));
    const bestLive = lines.find(l => l.when !== "blocked");
    for (const h of hate) {
      const blocks = lines.filter(l => l.blockedBy.includes(h)).map(l => l.title);
      const tutorHit = (h.stops.cage || h.stops.etb) ? Object.keys(TUTORS).filter(t => (h.stops.cage && TUTORS[t].cage) || (h.stops.etb && TUTORS[t].etb)).filter(t => inHand(t)) : [];
      const ans = answersFor(h.types);
      const critical = blocks.length || tutorHit.length || h.stops.all;
      threats.push({
        level: critical ? "high" : "mid", kind: "hate", name: h.name, owner: h.owner,
        title: `${h.owner}'s ${short(h.name)}`,
        text: `${h.why}.${blocks.length > 2 ? " It switches off every combo you have." : blocks.length ? ` It switches off ${list(blocks)}.` : ""}${tutorHit.length ? ` In your hand that means ${list(tutorHit)}.` : ""}`,
        answers: ans.map(a => a.name), answerText: ans.length ? `Answer: ${ans[0].name} (${ans[0].cost}${ans[0].note ? `, ${ans[0].note}` : ""}).` : "No answer in hand: tutor around it or find Force of Vigor or Generous Gift."
      });
    }
    // their best permanents (the game scores them), with the answer you hold
    for (const q of s.opps || []) for (const o of (q.top || []).filter(x => !hate.some(h => h.name === x.name)).slice(0, 1)) {
      const ans = answersFor(o.types || []);
      threats.push({ level: o.score >= 12 ? "high" : "mid", kind: "threat", name: o.name, owner: q.name, title: `${q.name}'s ${short(o.name)}`,
        text: `Their biggest threat${o.power ? ` (${o.power} power)` : ""}${o.commander ? ", and it's their commander" : ""}.`,
        answers: ans.map(a => a.name), answerText: ans.length ? `${ans[0].name} (${ans[0].cost}) handles it, but spend removal on what stops your combo or kills you first.` : "" });
    }
    for (const q of s.opps || []) {
      if (q.power >= (s.life || 40)) threats.push({ level: "high", kind: "lethal", name: q.name, owner: q.name, title: `${q.name} can kill you`, text: `${q.name}'s creatures have ${q.power} power and you're at ${s.life}. Keep blockers back, or win first.`, answers: ["Swords to Plowshares", "Path to Exile", "Teferi's Protection"].filter(inHand), answerText: "" });
      else if (q.power >= (s.life || 40) * 0.6) threats.push({ level: "mid", kind: "pressure", name: q.name, owner: q.name, title: `${q.name} hits hard`, text: `${q.power} power on board against your ${s.life} life.`, answers: [], answerText: "" });
    }
    const respond = s.quiet ? [] : (s.opps || []).filter(q => q.hand > 0 && q.open >= 1).map(q => q.name);
    const risk = { who: respond, quiet: s.quiet || null, silence: SILENCE.filter(inHand) };
    threats.sort((a, b) => (a.level === "high" ? 0 : 1) - (b.level === "high" ? 0 : 1));
    return { lines, threats, best: bestLive || null, risk, mindcensor };
  }

  const B = { solve, PIECES, COMBOS, TUTORS, HATE, ANSWERS, QUIET, parse, fmt };
  root.CorruptedBrain = B;
  if (root.MK) root.MK.CorruptedBrain = B;
})(typeof window !== "undefined" ? window : globalThis);
