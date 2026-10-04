/* Bot tournaments (the Arena tab): every deck the sites know, played against each other by bots
   over many games. This file is the part with no screen: the entrants, the four formats, the
   pods each round deals, one headless game, and the numbers drawn from the results. It runs on the
   page, in the Arena's workers (tournament-worker.js) and in Node (tools/sim/tournament.js).

   Formats
     league    every round deals all decks into pods, pairing the decks that have met least;
               it runs until the game budget is spent
     swiss     each round pods decks with a similar record: leaders face leaders
     gauntlet  one deck sits in every pod against the rest of the field
     cup       Swiss rounds to seed a knockout: pods play a series, the best go through, and the
               final pod's series names the champion

   A game is decided by its seed and its seats alone, so any game can be watched again on the
   Play table (game-ui.js Table.start with { kind: "watch", seed }). */
(function (root) {
  "use strict";
  const MK = root.MK = root.MK || {};
  const T = MK.Tournament = {};
  T.VERSION = 1;
  T.MAX_TURNS = 160;

  /* ------------------------------------------------------------ dice that don't touch the games' */
  function rng(seed) {
    let s = seed | 0;
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  // the seed of game number i of a tournament: spread out, never 0
  T.gameSeed = (seed, i) => { let h = (seed | 0) ^ Math.imul(i + 1, 0x9E3779B1); h = Math.imul(h ^ (h >>> 16), 0x85EBCA6B); h = Math.imul(h ^ (h >>> 13), 0xC2B2AE35); h ^= h >>> 16; return (h >>> 1) || 1; };
  const shuffle = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ------------------------------------------------------------ the entrants */
  // Several decks share a commander and a name (three Mikus, three Etratas): these names tell them apart.
  const SHORT = {
    miku: "Miku (full)", "miku-precon": "Miku precon", "miku-budget": "Miku 80€", corrupted: "Corrupted Miku",
    azusa: "Azusa", etrata: "Etrata", "etrata-aggro": "Etrata aggro", "etrata-b4": "Etrata B4", "corrupted-etrata": "Corrupted Etrata"
  };
  // the site each of your decks belongs to, for the art and the links
  const SITE = { miku: "miku", "miku-precon": "miku", "miku-budget": "miku", azusa: "miku", corrupted: "corrupted", etrata: "etrata", "etrata-aggro": "etrata", "etrata-b4": "etrata", "corrupted-etrata": "corrupted-etrata" };
  let cache = null;
  /* Every deck once: the decks you pilot (MK.HERO_DECKS) and the bot decks (MK.BOT_DECKS).
     group: "yours" (one of the site decks), "b4" (a Bracket 4 bot) or "precon" (a Bracket 1-2 precon). */
  T.entrants = function () {
    const heroes = MK.HERO_DECKS || [], bots = MK.BOT_DECKS || [];
    const n = heroes.length + bots.length + (MK.MIKU_DECK ? 1 : 0);
    if (cache && cache.n === n) return cache.list;
    const seen = new Map();
    for (const d of [].concat(MK.MIKU_DECK ? [MK.MIKU_DECK] : [], heroes, bots)) {
      if (!d || !d.id || seen.has(d.id) || !d.list) continue;
      const bracket = d.bracket || 4;
      const yours = heroes.includes(d);
      seen.set(d.id, {
        id: d.id, name: SHORT[d.id] || d.name, commander: d.commander, identity: (d.identity || []).slice(), bracket,
        style: d.style || d.title || "", group: yours ? "yours" : bracket <= 2 ? "precon" : "b4", site: SITE[d.id] || null,
        aggression: d.aggression == null ? 0.55 : d.aggression, deck: d
      });
    }
    const order = { yours: 0, b4: 1, precon: 2 };
    const list = [...seen.values()].sort((a, b) => order[a.group] - order[b.group] || b.bracket - a.bracket || a.name.localeCompare(b.name));
    cache = { n, list, by: new Map(list.map(e => [e.id, e])) };
    return list;
  };
  T.entrant = id => { T.entrants(); return cache.by.get(id) || null; };

  /* ------------------------------------------------------------ formats and settings */
  T.FORMATS = {
    league: { name: "League", blurb: "Every round deals all the decks into pods, matching the decks that have met least. The fairest picture of who's strongest." },
    swiss: { name: "Swiss", blurb: "Each round pods decks with a similar record, so leaders meet leaders. Sorts a big field in few rounds." },
    gauntlet: { name: "Gauntlet", blurb: "One deck sits at every table against the rest of the field. How does your deck fare against everything?" },
    cup: { name: "Cup", blurb: "Swiss rounds seed a knockout. Pods play a series, the best go through, and the final pod crowns a champion." }
  };
  T.LEVELS = { casual: 0.55, sharp: 0.9, best: 1 };
  /* The knockout field sizes for a pod size: 16 decks in pods of 4 play 4 pods, their winners the
     final. Returns each stage's field, or null when the numbers don't divide. */
  T.koSizes = function (top, pod) {
    const sizes = [top];
    let n = top;
    while (n > pod) {
      const pods = n / pod;
      if (pods !== Math.floor(pods)) return null;
      const next = pods >= pod ? pods : pod;
      const adv = next / pods;
      if (adv !== Math.floor(adv) || adv < 1 || adv >= pod) return null;
      sizes.push(next); n = next;
    }
    return n === pod ? sizes : null;
  };
  T.koTops = (pod, entrants) => [2, 3, 4, 6, 8, 9, 12, 16].filter(t => t <= entrants && t >= pod && T.koSizes(t, pod));
  T.defaults = () => ({ format: "league", entrants: T.entrants().map(e => e.id), pod: 4, games: 300, rounds: 6, series: 3, top: 8, koSeries: 5, hero: null, level: "sharp", casual: true, seed: 1 + Math.floor(Math.random() * 999999) });
  /* What a setting is short of, in words, or "" when it can run. */
  T.check = function (cfg) {
    const n = cfg.entrants.length, P = cfg.pod;
    if (cfg.format === "gauntlet") {
      if (!cfg.hero || !cfg.entrants.includes(cfg.hero)) return "Pick the deck that runs the gauntlet.";
      if (n - 1 < P - 1) return `A gauntlet in pods of ${P} needs ${P - 1} other decks.`;
      return "";
    }
    if (n < P) return `Pods of ${P} need at least ${P} decks.`;
    if (cfg.format === "cup" && !T.koSizes(cfg.top, P)) return `A knockout of ${cfg.top} doesn't split into pods of ${P}.`;
    if (cfg.format === "cup" && cfg.top > n) return `The knockout takes ${cfg.top} decks; only ${n} are in.`;
    return "";
  };
  /* How many games the settings will play, roughly (Swiss byes and the knockout are exact). */
  T.plannedGames = function (cfg) {
    const n = cfg.entrants.length, P = cfg.pod;
    const podsPerRound = cfg.format === "gauntlet" ? Math.max(1, Math.floor((n - 1) / (P - 1))) : Math.max(1, Math.floor(n / P));
    if (cfg.format === "league" || cfg.format === "gauntlet") return cfg.games;
    let g = cfg.rounds * podsPerRound * cfg.series;
    if (cfg.format === "cup") { const ks = T.koSizes(cfg.top, P) || []; g += ks.reduce((s, k) => s + (k / P) * cfg.koSeries, 0); }
    return g;
  };

  /* ------------------------------------------------------------ a tournament */
  T.create = function (cfg) {
    cfg = Object.assign(T.defaults(), cfg || {});
    const by = new Map(T.entrants().map(e => [e.id, e]));
    cfg.entrants = cfg.entrants.filter(id => by.has(id));
    const err = T.check(cfg);
    if (err) throw new Error(err);
    return {
      v: T.VERSION, engine: MK.ENGINE_VERSION || 0, id: "t" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
      created: Date.now(), cfg, status: "running", names: Object.fromEntries(cfg.entrants.map(id => [id, by.get(id).name])),
      rounds: [], games: [], champion: null, ko: null, ms: 0
    };
  };
  T.isDone = st => st.status === "done";
  T.playedGames = st => st.games.filter(Boolean).length;

  // how often each pair has shared a pod, and how many games each deck has played
  function meetings(st) {
    const meet = {}, played = {}, byes = {};
    for (const id of st.cfg.entrants) { meet[id] = {}; played[id] = 0; byes[id] = 0; }
    for (const r of st.rounds) {
      for (const id of r.byes || []) byes[id]++;
      for (const pod of r.pods) for (const a of pod.seats) {
        played[a] += pod.games;
        for (const b of pod.seats) if (a !== b) meet[a][b] = (meet[a][b] || 0) + pod.games;
      }
    }
    return { meet, played, byes };
  }
  // deal `ids` into pods of P, each pod built around the next deck by adding the decks it has met least
  function dealPods(ids, P, meet, r, prefer) {
    const left = ids.slice(), pods = [];
    while (left.length >= P) {
      const pod = [left.shift()];
      while (pod.length < P) {
        let best = -1, bestScore = Infinity;
        const look = prefer ? Math.min(left.length, P * 2) : left.length; // Swiss: stay near your own record
        for (let i = 0; i < look; i++) {
          const c = left[i];
          const score = pod.reduce((s, a) => s + (meet[a][c] || 0), 0) * 10 + (prefer ? i : 0) + r() * 0.5;
          if (score < bestScore) { bestScore = score; best = i; }
        }
        pod.push(left.splice(best, 1)[0]);
      }
      pods.push(pod);
    }
    return pods;
  }
  /* The next round's pods, added to st.rounds, or null when the tournament has dealt everything. */
  T.nextRound = function (st) {
    const cfg = st.cfg, P = cfg.pod, ri = st.rounds.length;
    const r = rng(T.gameSeed(cfg.seed, 100000 + ri));
    const { meet, played, byes } = meetings(st);
    const planned = st.rounds.reduce((s, x) => s + x.pods.reduce((t, p) => t + p.games, 0), 0);
    let round = null;
    if (cfg.format === "league") {
      if (planned >= cfg.games) return null;
      // the decks that have played most sit out when the field doesn't divide into pods
      const ids = shuffle(cfg.entrants.slice(), r).sort((a, b) => played[a] - played[b]);
      const k = Math.floor(ids.length / P) * P;
      let pods = dealPods(ids.slice(0, k), P, meet, r, false);
      pods = pods.slice(0, Math.max(1, Math.min(pods.length, cfg.games - planned)));
      round = { kind: "league", label: `Round ${ri + 1}`, pods: pods.map(s => ({ seats: s, games: 1 })), byes: ids.slice(k) };
    } else if (cfg.format === "gauntlet") {
      if (planned >= cfg.games) return null;
      const field = shuffle(cfg.entrants.filter(id => id !== cfg.hero), r).sort((a, b) => played[a] - played[b]);
      const k = Math.floor(field.length / (P - 1)) * (P - 1);
      const m = Object.assign({}, meet);
      let pods = dealPods(field.slice(0, k), P - 1, m, r, false).map(s => [cfg.hero].concat(s));
      pods = pods.slice(0, Math.max(1, Math.min(pods.length, cfg.games - planned)));
      round = { kind: "gauntlet", label: `Round ${ri + 1}`, pods: pods.map(s => ({ seats: s, games: 1 })), byes: field.slice(k) };
    } else {
      const swissRounds = cfg.rounds;
      if (ri < swissRounds) {
        // standings so far; the first round is a random draw
        const order = ri === 0 ? shuffle(cfg.entrants.slice(), r) : T.standings(st).map(s => s.id);
        const k = Math.floor(order.length / P) * P;
        // byes go to the lowest-ranked decks that have had fewest
        let sitOut = [];
        if (k < order.length) sitOut = order.slice().reverse().sort((a, b) => byes[a] - byes[b]).slice(0, order.length - k);
        const ids = order.filter(id => !sitOut.includes(id));
        const pods = dealPods(ids, P, meet, r, ri > 0);
        round = { kind: "swiss", label: `${cfg.format === "cup" ? "Qualifier" : "Round"} ${ri + 1}`, pods: pods.map(s => ({ seats: s, games: cfg.series })), byes: sitOut };
      } else if (cfg.format === "cup") {
        const sizes = T.koSizes(cfg.top, P);
        const stage = ri - swissRounds;
        if (stage >= sizes.length) return null;
        let field;
        if (stage === 0) field = T.standings(st).slice(0, cfg.top).map(s => s.id);
        else field = st.ko.stages[stage - 1].through;
        // seeded like a bracket: pod i gets seeds i, 2n-1-i, 2n+i, ... (snake)
        const n = field.length / P, pods = Array.from({ length: n }, () => []);
        field.forEach((id, i) => { const lap = Math.floor(i / n), j = i % n; pods[lap % 2 ? n - 1 - j : j].push(id); });
        const final = stage === sizes.length - 1;
        const label = final ? "Final" : n === 2 ? "Semi-finals" : n === 4 ? "Quarter-finals" : `Round of ${field.length}`;
        round = { kind: "ko", stage, label, pods: pods.map(s => ({ seats: s, games: cfg.koSeries })), byes: [], advance: final ? 1 : sizes[stage + 1] / n };
        st.ko = st.ko || { sizes, seeds: field.slice(), stages: [] };
        st.ko.stages[stage] = { label, field: field.slice(), pods: round.pods.map(p => p.seats.slice()), through: null };
      } else return null;
    }
    round.n = ri;
    round.pods.forEach(p => { p.res = []; });
    st.rounds.push(round);
    return round;
  };
  /* The games of a round, ready for T.playGame (or a worker). */
  T.jobs = function (st, round) {
    const cfg = st.cfg, out = [];
    let gi = st.rounds.slice(0, round.n).reduce((s, x) => s + x.pods.reduce((t, p) => t + p.games, 0), 0);
    const skill = T.LEVELS[cfg.level] == null ? 0.9 : T.LEVELS[cfg.level];
    round.pods.forEach((pod, pi) => {
      for (let k = 0; k < pod.games; k++, gi++) {
        out.push({
          gi, ri: round.n, pi, k, seed: T.gameSeed(cfg.seed, gi), maxTurns: T.MAX_TURNS,
          seats: pod.seats.map(id => { const e = T.entrant(id); return { deck: id, name: e.name, skill, aggression: e.aggression, casual: !!cfg.casual && e.bracket <= 2 }; })
        });
      }
    });
    return out;
  };
  /* Store one finished game. */
  T.record = function (st, job, res) {
    const g = Object.assign({ gi: job.gi, r: job.ri, p: job.pi, k: job.k, seed: job.seed, d: job.seats.map(s => s.deck) }, res);
    st.games[job.gi] = g;
    const pod = st.rounds[job.ri] && st.rounds[job.ri].pods[job.pi];
    if (pod && !pod.res.includes(job.gi)) pod.res.push(job.gi);
    return g;
  };
  T.roundDone = (st, round) => round.pods.every(p => p.res.length >= p.games);
  /* A pod's series: decks ranked by wins, then points, then finishing place, then their seed. */
  T.series = function (st, round, pod) {
    const seedOf = id => { const s = st.ko ? st.ko.seeds.indexOf(id) : -1; return s < 0 ? 99 : s; };
    const rows = pod.seats.map(id => ({ id, wins: 0, pts: 0, place: 0, n: 0, seed: seedOf(id) }));
    for (const gi of pod.res) {
      const g = st.games[gi]; if (!g) continue;
      g.d.forEach((id, i) => { const row = rows.find(x => x.id === id); row.n++; row.place += g.pl[i]; row.pts += pointsOf(g, i); if (g.w === i) row.wins++; });
    }
    return rows.sort((a, b) => b.wins - a.wins || b.pts - a.pts || a.place / (a.n || 1) - b.place / (b.n || 1) || a.seed - b.seed);
  };
  /* Close a finished round: the knockout sends its best decks on and names the champion. */
  T.closeRound = function (st, round) {
    if (round.kind === "ko") {
      const through = [];
      for (const pod of round.pods) through.push(...T.series(st, round, pod).slice(0, round.advance).map(r => r.id));
      // the field of the next stage keeps the original seeding order
      through.sort((a, b) => st.ko.seeds.indexOf(a) - st.ko.seeds.indexOf(b));
      st.ko.stages[round.stage].through = through;
      if (round.label === "Final") st.champion = through[0];
    }
  };
  T.finish = function (st) {
    st.status = "done";
    if (!st.champion && st.games.some(Boolean)) { const s = T.standings(st); st.champion = s[0] ? s[0].id : null; }
  };

  /* ------------------------------------------------------------ one game, no screen */
  /* Plays a job (see T.jobs) and returns its summary:
     f first seat, w winner seat (-1 for none), draw, rd rounds, tn turns, ms;
     per seat: pl finishing place, out round knocked out (0 = still in), why how they went out,
     dmg damage dealt to players, cast spells cast, tok tokens made, mull mulligans, life at the end. */
  T.playGame = async function (job) {
    const n = job.seats.length;
    const players = job.seats.map(s => {
      const e = T.entrant(s.deck);
      if (!e) throw new Error("Unknown deck " + s.deck);
      const d = e.deck;
      return { name: s.name || e.name, commander: d.commander, list: d.list, identity: d.identity, agent: MK.AI.create({ skill: s.skill == null ? 0.9 : s.skill, aggression: s.aggression == null ? e.aggression : s.aggression, casual: !!s.casual }), deckId: d.id };
    });
    const out = new Array(n).fill(0), seq = new Array(n).fill(0);
    let k = 0, g = null, errs = 0, err = "";
    const ui = { anim(kind, d) { if (kind === "lose" && d && d.p && !seq[d.p.idx]) { seq[d.p.idx] = ++k; out[d.p.idx] = Math.max(1, g.round || 1); } } };
    // built exactly as the Play table builds a watched game, so the seed replays it there
    g = new MK.Game({ seed: job.seed, players, endOnHumanLoss: true, maxTurns: job.maxTurns || T.MAX_TURNS, ui });
    g.players.forEach((p, i) => { p.deckId = players[i].deckId; });
    g.activeIdx = g.rand(n);
    const first = g.activeIdx;
    g.warn = (e) => { errs++; if (!err) err = String(e && e.message || e).slice(0, 160); };
    const t0 = Date.now();
    let crash = "";
    try { await g.play(); } catch (e) { crash = String(e && e.message || e).slice(0, 160); }
    // an alternate win takes everyone else out at once
    const late = g.players.filter(p => p.lost && !seq[p.idx]);
    if (late.length) { k++; for (const p of late) { seq[p.idx] = k; out[p.idx] = Math.max(1, g.round || 1); } }
    const w = g.winner ? g.winner.idx : -1;
    // places: the winner first, then whoever lasted longest; players still in at a draw share first
    const alive = g.players.filter(p => !p.lost);
    const pl = g.players.map(p => {
      if (p.idx === w) return 1;
      if (!p.lost) return w >= 0 ? 2 : 1;
      return 1 + (w >= 0 ? 1 : 0) + alive.filter(q => q.idx !== w).length + g.players.filter(q => q.lost && seq[q.idx] > seq[p.idx]).length;
    });
    return {
      f: first, w, draw: w < 0, rd: g.round, tn: g.turn, ms: Date.now() - t0, pl, out,
      why: g.players.map(p => p.lost ? p.lostReason || "life" : ""),
      dmg: g.players.map(p => p.stats.dmg), cast: g.players.map(p => Object.values(p.stats.cast).reduce((a, b) => a + b, 0)),
      tok: g.players.map(p => p.stats.tokens), mull: g.players.map(p => p.mulls || 0), life: g.players.map(p => p.life),
      err: errs + (crash ? 1 : 0), msg: crash || err || undefined
    };
  };

  /* ------------------------------------------------------------ the numbers */
  function pointsOf(g, i) { return g.w === i ? 3 : g.w < 0 && !g.out[i] ? 1 : 0; }
  T.pointsOf = pointsOf;
  // a game a worker couldn't play (x) counts toward the round but not in the numbers
  const games = st => st.games.filter(g => g && !g.x);
  // Wilson score interval for k successes in n, 95%
  T.wilson = function (k, n) {
    if (!n) return [0, 0];
    const z = 1.96, p = k / n, d = 1 + z * z / n, c = p + z * z / (2 * n), m = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
    return [Math.max(0, (c - m) / d), Math.min(1, (c + m) / d)];
  };
  /* Bradley-Terry strengths from every pair of decks in every game (finishing above = a win),
     on the Elo scale around 1500. Each deck starts with one win and one loss against an average
     deck, so a deck with a perfect record still gets a finite rating. */
  T.ratings = function (st) {
    const ids = st.cfg.entrants, idx = new Map(ids.map((id, i) => [id, i])), N = ids.length;
    const W = new Float64Array(N), Nij = Array.from({ length: N }, () => new Float64Array(N));
    for (const g of games(st)) {
      for (let a = 0; a < g.d.length; a++) for (let b = a + 1; b < g.d.length; b++) {
        const i = idx.get(g.d[a]), j = idx.get(g.d[b]);
        if (i == null || j == null) continue;
        Nij[i][j]++; Nij[j][i]++;
        if (g.pl[a] < g.pl[b]) W[i]++; else if (g.pl[b] < g.pl[a]) W[j]++; else { W[i] += 0.5; W[j] += 0.5; }
      }
    }
    let p = new Float64Array(N).fill(1);
    for (let it = 0; it < 200; it++) {
      const q = new Float64Array(N);
      let change = 0;
      for (let i = 0; i < N; i++) {
        let den = 2 / (p[i] + 1); // the prior: one game each way against strength 1
        for (let j = 0; j < N; j++) if (Nij[i][j]) den += Nij[i][j] / (p[i] + p[j]);
        q[i] = (W[i] + 1) / den;
      }
      const gm = Math.exp(q.reduce((s, x) => s + Math.log(x), 0) / N);
      for (let i = 0; i < N; i++) { q[i] /= gm; change = Math.max(change, Math.abs(Math.log(q[i] / p[i]))); }
      p = q;
      if (change < 1e-7) break;
    }
    const out = {};
    ids.forEach((id, i) => { out[id] = 1500 + 400 * Math.log10(p[i]); });
    return out;
  };
  /* Elo after each game, in the order the games were dealt: the rating line on the Standings page. */
  T.eloHistory = function (st, K) {
    K = K || 32;
    const r = {}, hist = {};
    for (const id of st.cfg.entrants) { r[id] = 1500; hist[id] = [[0, 1500]]; }
    let n = 0;
    for (const g of games(st)) {
      n++;
      const P = g.d.length, delta = new Array(P).fill(0);
      for (let a = 0; a < P; a++) for (let b = 0; b < P; b++) {
        if (a === b) continue;
        const e = 1 / (1 + Math.pow(10, (r[g.d[b]] - r[g.d[a]]) / 400));
        const s = g.pl[a] < g.pl[b] ? 1 : g.pl[a] > g.pl[b] ? 0 : 0.5;
        delta[a] += (K / (P - 1)) * (s - e);
      }
      g.d.forEach((id, a) => { r[id] += delta[a]; hist[id].push([n, r[id]]); });
    }
    return { now: r, hist, n };
  };
  /* Every deck's line in the standings, best first: points, then average place, then rating. */
  T.standings = function (st, rt) {
    rt = rt || T.ratings(st);
    const rows = {};
    for (const id of st.cfg.entrants) rows[id] = { id, name: st.names[id] || id, n: 0, wins: 0, draws: 0, pts: 0, place: 0, firstOut: 0, winRounds: [], outRounds: [], dmgs: [], dmg: 0, cast: 0, tok: 0, mull: 0, rating: rt[id], fair: 0 };
    for (const g of games(st)) {
      const P = g.d.length;
      const lastPlace = Math.max(...g.pl);
      g.d.forEach((id, i) => {
        const row = rows[id]; if (!row) return;
        row.n++; row.place += g.pl[i]; row.pts += pointsOf(g, i); row.fair += 1 / P;
        if (g.w === i) { row.wins++; row.winRounds.push(g.rd); }
        else if (g.w < 0 && !g.out[i]) row.draws++;
        if (g.out[i]) row.outRounds.push(g.out[i]);
        if (g.out[i] && g.pl[i] === lastPlace && g.pl.filter(x => x === lastPlace).length === 1) row.firstOut++;
        row.dmg += g.dmg[i]; row.dmgs.push(g.dmg[i]); row.cast += g.cast[i]; row.tok += g.tok[i]; row.mull += g.mull[i];
      });
    }
    const out = Object.values(rows).map(r => {
      const ci = T.wilson(r.wins, r.n);
      return Object.assign(r, {
        winRate: r.n ? r.wins / r.n : 0, ci, avgPlace: r.n ? r.place / r.n : 0, ppg: r.n ? r.pts / r.n : 0,
        edge: r.fair ? r.wins / r.fair : 0, // wins against a fair share: 1.0 is average, 2.0 wins twice as often
        avgWin: r.winRounds.length ? r.winRounds.reduce((a, b) => a + b, 0) / r.winRounds.length : null,
        medOut: median(r.outRounds), dmgPer: median(r.dmgs) || 0, // a median: one infinite combo would swamp an average
         castPer: r.n ? r.cast / r.n : 0, tokPer: r.n ? r.tok / r.n : 0
      });
    });
    return out.sort((a, b) => (b.n ? 1 : 0) - (a.n ? 1 : 0) || b.pts - a.pts || a.avgPlace - b.avgPlace || b.rating - a.rating || a.name.localeCompare(b.name));
  };
  function median(a) { if (!a.length) return null; const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
  T.median = median;
  /* Head to head: for each pair, the games they shared and how often the row deck finished above. */
  T.matrix = function (st) {
    const m = {};
    for (const a of st.cfg.entrants) { m[a] = {}; for (const b of st.cfg.entrants) if (a !== b) m[a][b] = { n: 0, above: 0, wins: 0 }; }
    for (const g of games(st)) for (let a = 0; a < g.d.length; a++) for (let b = 0; b < g.d.length; b++) {
      if (a === b) continue;
      const c = m[g.d[a]] && m[g.d[a]][g.d[b]]; if (!c) continue;
      c.n++;
      if (g.pl[a] < g.pl[b]) c.above++; else if (g.pl[a] === g.pl[b]) c.above += 0.5;
      if (g.w === a) c.wins++;
    }
    return m;
  };
  /* Turn order: how often the player who went first, second... won. */
  T.seatStats = function (st) {
    const by = {};
    for (const g of games(st)) {
      const P = g.d.length;
      const s = by[P] = by[P] || { P, n: 0, wins: new Array(P).fill(0) };
      s.n++;
      if (g.w >= 0) s.wins[(g.w - g.f + P) % P]++;
    }
    return Object.values(by).sort((a, b) => b.n - a.n);
  };
  /* Game lengths, in rounds, of games someone won, and how many hit the turn limit. */
  T.lengths = function (st) {
    const h = {}; let draws = 0, n = 0;
    for (const g of games(st)) { n++; if (g.w < 0) { draws++; continue; } h[g.rd] = (h[g.rd] || 0) + 1; }
    return { h, draws, n, median: median(games(st).filter(g => g.w >= 0).map(g => g.rd)) };
  };
  const HOW = { life: "damage", commander: "commander damage", poison: "poison", alt: "an alternate win", library: "decking", concede: "concession" };
  T.HOW = HOW;
  /* One deck's profile: how it wins, when, against whom, from which seat. */
  T.profile = function (st, id, ctx) {
    ctx = ctx || {};
    const mx = ctx.matrix || T.matrix(st);
    const how = {}, outHow = {}, rounds = {}, seat = {}, opp = [];
    let n = 0, wins = 0;
    for (const g of games(st)) {
      const i = g.d.indexOf(id); if (i < 0) continue;
      n++;
      const P = g.d.length, pos = (i - g.f + P) % P;
      const s = seat[pos] = seat[pos] || { n: 0, wins: 0 };
      s.n++;
      if (g.w === i) {
        wins++; s.wins++;
        rounds[g.rd] = (rounds[g.rd] || 0) + 1;
        // the way the last opponent went out is how the game was won
        let last = -1;
        g.d.forEach((_, j) => { if (j !== i && g.out[j] && (last < 0 || g.pl[j] < g.pl[last])) last = j; });
        const k = last >= 0 ? g.why[last] || "life" : "life";
        how[k] = (how[k] || 0) + 1;
      } else if (g.out[i]) outHow[g.why[i] || "life"] = (outHow[g.why[i] || "life"] || 0) + 1;
    }
    for (const b of Object.keys(mx[id] || {})) { const c = mx[id][b]; if (c.n) opp.push({ id: b, n: c.n, above: c.above / c.n, wins: c.wins }); }
    opp.sort((a, b) => b.above - a.above);
    return { id, n, wins, how, outHow, rounds, seat, opp };
  };
  /* The games worth a look: the fastest win, the longest game, the biggest upset, the most damage. */
  T.highlights = function (st, rt) {
    rt = rt || T.ratings(st);
    const gs = games(st), won = gs.filter(g => g.w >= 0), out = [];
    if (!won.length) return out;
    const by = (arr, f) => arr.reduce((b, g) => (f(g) > f(b) ? g : b), arr[0]);
    out.push({ kind: "fast", title: "Fastest win", g: by(won, g => -g.rd * 1000 - g.tn), text: g => `${st.names[g.d[g.w]]} won in round ${g.rd}` });
    out.push({ kind: "long", title: "Longest game", g: by(gs, g => g.tn), text: g => `${g.tn} turns, ${g.rd} rounds${g.w >= 0 ? `, won by ${st.names[g.d[g.w]]}` : ", a draw"}` });
    const upset = g => { const others = g.d.filter((_, i) => i !== g.w); return others.reduce((s, id) => s + rt[id], 0) / others.length - rt[g.d[g.w]]; };
    const u = by(won, upset);
    if (upset(u) > 30) out.push({ kind: "upset", title: "Biggest upset", g: u, text: g => `${st.names[g.d[g.w]]} beat a table rated ${Math.round(upset(g))} points above it` });
    const big = by(gs, g => Math.max(...g.dmg));
    out.push({ kind: "dmg", title: "Most damage", g: big, text: g => { const i = g.dmg.indexOf(Math.max(...g.dmg)); return `${st.names[g.d[i]]} dealt ${g.dmg[i]} damage`; } });
    const alt = won.filter(g => g.d.some((_, j) => j !== g.w && g.why[j] === "alt"));
    if (alt.length) out.push({ kind: "alt", title: "Alternate wins", g: alt[0], text: g => `${alt.length} game${alt.length > 1 ? "s" : ""} ended in an alternate win, first by ${st.names[g.d[g.w]]}` });
    return out.map(h => Object.assign(h, { line: h.text(h.g) }));
  };
  /* Everything the screens draw, in one go. */
  T.analyze = function (st) {
    const rt = T.ratings(st), matrix = T.matrix(st);
    return { ratings: rt, standings: T.standings(st, rt), matrix, seats: T.seatStats(st), lengths: T.lengths(st), highlights: T.highlights(st, rt), elo: T.eloHistory(st), games: T.playedGames(st) };
  };

  /* ------------------------------------------------------------ running one, without a screen */
  /* Plays a whole tournament in this thread (Node and tests). onGame(st, g) after each game. */
  T.run = async function (st, opts) {
    opts = opts || {};
    const t0 = Date.now();
    for (;;) {
      let round = st.rounds.find(r => !T.roundDone(st, r));
      if (!round) {
        const last = st.rounds[st.rounds.length - 1];
        if (last && !last.closed) { T.closeRound(st, last); last.closed = true; }
        round = T.nextRound(st);
        if (!round) break;
      }
      for (const job of T.jobs(st, round)) {
        if (st.games[job.gi]) continue;
        const res = await T.playGame(job);
        const g = T.record(st, job, res);
        if (opts.onGame) opts.onGame(st, g);
      }
    }
    T.finish(st);
    st.ms += Date.now() - t0;
    return st;
  };
})(typeof window !== "undefined" ? window : globalThis);
