/* Origins TCG rules engine (unofficial model). Runs in the browser and in Node.
   The numbers and keyword rules follow the data extracted from the game files on 2026-11-12 (client 0.8.2): hand,
   mana, barriers, fatigue, who reveals first, combat order, Move, Shield, Defender, Snipe, Trample, Deathtouch,
   First Strike, Double Attack, Rebirth, Stun, the location pool and its odds. Card effects follow the card texts and
   the designers' notes in that data. What is still our reading is listed in RULES_MODEL (shown on the Method tab). */
(function (root) {
  const D = (typeof module !== 'undefined' && module.exports) ? require('./cards.js') : root.OT.data;
  const { CARDS, POOL, SPELLS, LOCATIONS } = D;
  const LOC = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));
  const CUP_OFF = ['junkyard', 'cloning-lab', 'reflecting-pool', 'amphitheatre', 'giants-beacon', 'colosseum', 'nostradamus'];

  const DEFAULT_RULES = {
    legend: 'deck',     // the Legendary is shuffled into the 25 cards ('hand': it starts in hand, for sensitivity runs)
    powers: true,       // Legendary "Game Start" powers are on (false, or a list of Legendary ids, for sensitivity runs)
    barrier: 20,        // starting barrier health
    rebuilt: 40,        // health of a barrier that comes back after breaking
    breaks: 2,          // barrier breaks that lose the game
    spill: false,       // true: leftover combat damage always goes on to the barrier, not only with Trample
    moveOnce: true,     // Move can be used once per unit (Dorothy: every round)
    handMax: 10,
    locations: true,    // false: a bare board with no locations (for sensitivity runs)
    locOdds: true,      // locations are drawn with the game's rarity odds (false: all equally likely)
    cup: false,         // Crimson Cup location pool (the 7 swingy locations are off)
  };

  // [status, text]. status: 'game' = read in the game files, 'ours' = our reading where the files leave room.
  const RULES_MODEL = [
    ['game', 'Deck of 25: the Legendary plus 12 cards twice. Opening hand 4, one mulligan of up to 4 cards, then 1 card every round. Hand limit 10: a card that arrives in a full hand is removed.'],
    ['game', 'Each Legendary has a Game Start power that works from the first round, whether or not the card is drawn.'],
    ['game', 'Mana is 2 in round 1 and grows by 1 per round up to 10. Unspent mana is lost.'],
    ['game', 'Barriers have 20 health. A broken barrier comes back at 40. The second break, of any barrier, loses the game. There is no round limit.'],
    ['game', 'Empty deck: every draw you cannot make deals 1, then 2, then 3 damage (and so on) to each of your barriers.'],
    ['game', 'Who reveals first is random in round 1 and alternates every round.'],
    ['game', 'Combat runs location by location, left to right, and space by space. Two characters facing each other strike at the same time (First Strike goes first). A character with nothing in front hits the barrier.'],
    ['game', 'Defender: when an enemy character would hit your barrier in that location, the Defender takes the hit instead and strikes back with its Power. A stunned Defender does not defend.'],
    ['game', 'Move: once per game a character with Move can go to any free space on your side, before you play cards for the round (Dorothy: every round).'],
    ['game', 'Trample sends the damage beyond the blocker\'s health to the barrier. Snipe hits the barrier after every attack, blocked or not. Deathtouch destroys any character the card damages, with any kind of damage. Shield cancels the next damage. Rebirth returns once with 1 health.'],
    ['game', 'Three locations drawn from the 43 of the standard pool with rarity odds: 53% common, 40% rare, 6% very rare, 1% ultra rare, one revealed per round in rounds 1 to 3.'],
    ['game', 'Cards are put face down while planning and only work once they reveal. Face-down cards hold their space and count as cards "here", but cannot be targeted.'],
    ['ours', 'Cards are paid for when they are put down, so a discount that only starts when a card reveals does not help in the same round. A player\'s cards reveal in the order they were planned.'],
    ['ours', 'Both players\' moves happen before any card reveals, the player who reveals first moving first.'],
    ['ours', 'A target is chosen while planning among the characters already revealed. If it is gone when the card reveals, the card does nothing. A repeated spell hits the same target again.'],
    ['ours', 'When two barriers would break in the same instant for both players, the game is a draw.'],
    ['ours', 'When several Defenders stand in a location, the one that entered play first defends.'],
    ['ours', 'The three locations of a game are different from each other.'],
  ];

  // ---------- RNG
  function rngFrom(seed) {
    let a = seed >>> 0;
    return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const mix = (a, b) => { let h = (a ^ Math.imul(b + 0x9E3779B1, 0x85EBCA6B)) >>> 0; h = Math.imul(h ^ (h >>> 15), 0x2C1B3C6D); h = Math.imul(h ^ (h >>> 12), 0x297A2D39); return (h ^ (h >>> 15)) >>> 0; };
  const pick = (G, arr) => arr[Math.floor(G.rng() * arr.length)];
  function shuffle(G, a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(G.rng() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- setup
  // Card objects always carry the same fields (bp/bh: stat bonus, cm: cost change, tmp: round it is discarded, setCost).
  function mkCard(G, id, x) { return { hid: G.uid++, id, bp: (x && x.bp) || 0, bh: (x && x.bh) || 0, cm: (x && x.cm) || 0, tmp: x && x.tmp != null ? x.tmp : null, setCost: x && x.setCost != null ? x.setCost : null }; }
  const copyCard = (c) => ({ hid: c.hid, id: c.id, bp: c.bp, bh: c.bh, cm: c.cm, tmp: c.tmp, setCost: c.setCost });
  // Deck cards are shared between a game and its copies, so a copy takes its own version when it draws one.
  const take = (G, c) => (G.cow ? copyCard(c) : c);

  function newGame(decks, opts = {}) {
    const seed = opts.seed == null ? (Math.random() * 2 ** 31) | 0 : opts.seed;
    const R = Object.assign({}, DEFAULT_RULES, opts.rules || {});
    const G = { seed, rng: rngFrom(seed), cloneN: 0, R, round: 0, uid: 1, over: false, winner: null, log: opts.log ? [] : null, opts,
      P: null, board: null, locs: null, prio: 0, first: 0, enemyPlayed: null, discardedRound: false, treasurer: false, leyline: 0, cow: false, resv: null, fdown: null };
    G.P = [0, 1].map((p) => {
      const d = decks[p];
      const deck = [];
      for (const id of d.cards) { deck.push(mkCard(G, id)); deck.push(mkCard(G, id)); }
      const leg = mkCard(G, d.legend);
      if (R.legend === 'deck') deck.push(leg);
      shuffle(G, deck);
      const P = { deck, hand: [], grave: [], name: d.name || d.legend, legend: d.legend, barrier: [R.barrier, R.barrier, R.barrier], bmax: [R.barrier, R.barrier, R.barrier],
        notches: R.breaks, fatigue: 0, revealed: [], perm: 0, bonusNext: 0, carry: 0, mana: 0, moves: 0, spellbook: 0, prophecy: 0, merlinUsed: false, wallUsed: [false, false, false],
        track: opts.track ? { opening: [], drawn: [], played: [], tossed: [] } : null };
      if (R.legend === 'hand') P.hand.push(leg);
      return P;
    });
    G.board = [0, 1].map(() => [0, 1, 2].map(() => [null, null, null]));
    if (opts.noLocations || !R.locations) { drawLocations(G); G.locs = [0, 1, 2].map(() => ({ id: null, revealed: false, ruined: false, filled: null })); }
    else {
      const drawn = drawLocations(G);        // always drawn, so the random stream is the same with fixed locations
      const ids = opts.locs || drawn;
      G.locs = ids.map((id) => ({ id, revealed: false, ruined: false, filled: null }));
    }
    G.prio = opts.first != null ? opts.first : (G.rng() < 0.5 ? 0 : 1);
    G.first = G.prio;                        // who reveals first in round 1
    G.enemyPlayed = [[false, false, false], [false, false, false]];
    for (const p of [0, 1]) for (let i = 0; i < 4; i++) drawRaw(G, p);
    if (opts.mulligan !== false) for (const p of [0, 1]) mulligan(G, p, opts.mull && opts.mull[p]);
    for (const p of [0, 1]) if (G.P[p].track) G.P[p].track.opening = G.P[p].hand.map((c) => c.id);
    const pw = R.powers === true ? null : R.powers;   // true = all known powers, or a list of legend ids, or false
    if (R.powers) for (const p of [G.prio, 1 - G.prio]) { const id = G.P[p].legend; const f = POWER[id]; if (f && (!pw || pw.includes(id))) f(G, p); }
    return G;
  }

  // Three different locations: a rarity bucket by its weight, then a location inside it.
  function drawLocations(G) {
    const left = G.R.cup ? LOCATIONS.filter((l) => !CUP_OFF.includes(l.id)) : LOCATIONS.slice();
    const ids = [];
    for (let k = 0; k < 3; k++) {
      let cand = left;
      const x0 = G.rng();
      if (G.R.locOdds) {
        const by = {};
        for (const l of left) (by[l.rar] || (by[l.rar] = [])).push(l);
        let tot = 0;
        for (const r in by) tot += D.BUCKET[r];
        let x = x0 * tot;
        for (const r of ['C', 'R', 'V', 'U']) { if (!by[r]) continue; cand = by[r]; x -= D.BUCKET[r]; if (x < 0) break; }
      }
      const l = cand[Math.floor(G.rng() * cand.length)];
      ids.push(l.id); left.splice(left.indexOf(l), 1);
    }
    return ids;
  }

  // Free mulligan. keep(card, hand) -> true to keep. The default rule throws back cards that are too expensive to use early.
  function defaultKeep(c, hand) {
    const C = CARDS[c.id];
    if (C.leg) return C.cost <= 5;
    if (C.cost >= 6) return false;
    if (C.cost === 5) return hand.filter((x) => CARDS[x.id].cost <= 3).length >= 2;
    return true;
  }
  function mulligan(G, p, keep) {
    const P = G.P[p];
    const k = keep || defaultKeep;
    const out = P.hand.filter((c) => !k(c, P.hand));
    if (!out.length) return;
    if (P.track) P.track.tossed = out.map((c) => c.id);
    P.hand = P.hand.filter((c) => !out.includes(c));
    for (let i = 0; i < out.length; i++) drawRaw(G, p);
    for (const c of out) P.deck.push(c);
    shuffle(G, P.deck);
  }

  function log(G, s) { if (G.log) G.log.push({ r: G.round, s }); }
  const nm = (id) => CARDS[id].name;

  // ---------- helpers
  const locOn = (G, lane, id) => { const l = G.locs[lane]; return l.id === id && l.revealed && !l.ruined; };
  const anyLoc = (G, id) => locOn(G, 0, id) || locOn(G, 1, id) || locOn(G, 2, id);
  const silenced = (G, u) => u.sil || locOn(G, u.lane, 'anti-magic');
  const has = (G, u, id) => u.id === id && !silenced(G, u);
  function units(G, p) { const r = []; const B = G.board[p]; for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = B[l][s]; if (u && !u.dead) r.push(u); } return r; }
  function unitsIn(G, p, lane) { const r = []; const L = G.board[p][lane]; for (let s = 0; s < 3; s++) { const u = L[s]; if (u && !u.dead) r.push(u); } return r; }
  const allUnits = (G) => units(G, 0).concat(units(G, 1));
  function findU(G, uid) { for (let p = 0; p < 2; p++) for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = G.board[p][l][s]; if (u && u.uid === uid && !u.dead) return u; } return null; }
  const across = (G, u) => { const v = G.board[1 - u.owner][u.lane][u.slot]; return v && !v.dead ? v : null; };
  const hp = (u) => u.h - u.dmg;
  // Free spaces of player p. Spaces holding a face-down card (planned this round, not revealed yet) are not free.
  function empties(G, p, lanes) { const r = []; const rv = G.resv ? G.resv[p] : null; for (const l of lanes || [0, 1, 2]) for (let s = 0; s < 3; s++) if (!G.board[p][l][s] && !(rv && rv[l * 3 + s])) r.push([l, s]); return r; }
  const isFree = (G, p, l, s) => !G.board[p][l][s] && !(G.resv && G.resv[p][l * 3 + s]);
  function anyUnit(G, p, id) { const B = G.board[p]; for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = B[l][s]; if (u && !u.dead && u.id === id && !silenced(G, u)) return true; } return false; }
  function countUnit(G, p, id) { let n = 0; const B = G.board[p]; for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = B[l][s]; if (u && !u.dead && u.id === id && !silenced(G, u)) n++; } return n; }

  function power(G, u) {
    let x = u.p + u.tp;
    if (locOn(G, u.lane, 'vacant-armory')) x += 1;
    return x > 0 ? x : 0;
  }
  function kw(G, u, k) {
    if (silenced(G, u)) return false;
    if (u.kw[k]) return true;
    if (k === 'trample') {
      if (u.tt || locOn(G, u.lane, 'stomping')) return true;
      const a = across(G, u); if (a && has(G, a, 'red-knight')) return true;
    } else if (k === 'double') { if (locOn(G, u.lane, 'colosseum')) return true; }
    else if (k === 'defender') {
      if (locOn(G, u.lane, 'windmill')) return true;
      const es = G.board[1 - u.owner][u.lane];
      for (let s = 0; s < 3; s++) { const v = es[s]; if (v && !v.dead && v.id === 'don-quixote' && !v.sil) return true; }
    } else if (k === 'deathtouch') { if (u.al === 'E' && locOn(G, u.lane, 'poison-grounds')) return true; }
    return false;
  }
  const canMove = (G, u) => !silenced(G, u) && !u.moved && (u.id === 'dorothy' || (u.kw.move && !(G.R.moveOnce && u.usedMove)));

  function cost(G, p, c) {
    if (c.setCost != null) return c.setCost;
    const C = CARDS[c.id];
    let x = C.cost + c.cm;
    if (anyLoc(G, 'gold-wheel')) x -= 1;
    if (C.cost >= 7 && anyLoc(G, 'castle-clouds')) x -= 1;
    if (G.treasurer) x += 1;
    if (C.spell) x -= countUnit(G, p, 'sandman');
    return x > 0 ? x : 0;
  }

  // ---------- cards in hand
  function drawRaw(G, p) { const P = G.P[p]; if (!P.deck.length) return null; const c = P.deck.pop(); P.hand.push(c); return c; }
  function toHand(G, p, c) {
    const P = G.P[p];
    if (P.hand.length >= G.R.handMax) { log(G, 'P' + p + ' hand is full, ' + nm(c.id) + ' is burnt'); return null; }
    P.hand.push(c);
    const B = G.board[p];
    for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = B[l][s]; if (u && !u.dead && u.id === 'shahrazad' && !silenced(G, u)) healBarrier(G, p, l, 1); }
    return c;
  }
  function draw(G, p, n = 1) {
    const P = G.P[p];
    for (let i = 0; i < n; i++) {
      if (!P.deck.length) return;
      const c = take(G, P.deck.pop());
      if (c.id === 'pumpkin') { damageBarrier(G, p, Math.floor(G.rng() * 3), 5, { kind: 'ability' }); i--; continue; }
      if (P.track) P.track.drawn.push(c.id);
      toHand(G, p, c);
    }
  }
  function addNew(G, p, id, extra) { return toHand(G, p, mkCard(G, id, extra)); }

  function discard(G, p, c) {
    const P = G.P[p];
    const i = P.hand.indexOf(c); if (i < 0) return;
    P.hand.splice(i, 1);
    const C = CARDS[c.id];
    log(G, 'P' + p + ' discards ' + C.name);
    let toGrave = !C.token;
    if (c.id === 'koschei') { toGrave = false; addNew(G, p, 'koschei', { bp: c.bp + 2, bh: c.bh + 2 }); }
    else if (c.id === 'aladdin') { const sp = empties(G, p); if (sp.length) { toGrave = false; const [l, s] = pick(G, sp); summon(G, p, 'aladdin', l, s, { bp: c.bp, bh: c.bh }); } }
    else if (c.id === 'esmeralda') { const us = units(G, p); if (us.length) pick(G, us).shield = true; }
    else if (c.id === 'underworld-flare') { const es = units(G, 1 - p); if (es.length) damageUnit(G, pick(G, es), 6, { kind: 'spell', p }); }
    if (toGrave) P.grave.push({ id: c.id, bp: c.bp, bh: c.bh });
    if (c.id !== 'dracula') { const di = P.grave.findIndex((g) => g.id === 'dracula'); if (di >= 0) { P.grave.splice(di, 1); addNew(G, p, 'dracula'); } }
    for (const u of units(G, p)) {
      if (silenced(G, u)) continue;
      if (u.id === 'brides-of-dracula') { damageBarrier(G, 1 - p, u.lane, 1, { kind: 'ability', p, u }); u.h += 1; }
      else if (u.id === 'ugly-duckling') transform(G, u, 'beautiful-swan');
      else if (u.id === 'doppelganger' && !C.spell && !C.token) transform(G, u, c.id);
    }
    if (!G.discardedRound) {
      G.discardedRound = true;
      for (const q of [0, 1]) for (let n = countUnit(G, q, 'old-macdonald'); n > 0; n--) {
        const opp = G.P[1 - q]; for (let k = 0; k < 3; k++) opp.deck.splice(Math.floor(G.rng() * (opp.deck.length + 1)), 0, mkCard(G, 'pumpkin'));
      }
    }
    processDeaths(G);
  }

  // ---------- units
  function mkUnit(G, p, id, extra) {
    const C = CARDS[id];
    // kw is shared with the card (and with copies of the game): never write into it, replace it (see addKw).
    return { uid: G.uid++, id, owner: p, lane: 0, slot: 0, p: C.p + ((extra && extra.bp) || 0), h: C.h + ((extra && extra.bh) || 0), dmg: 0, kw: C.kw, al: C.al,
      shield: !!C.kw.shield, stun: false, sil: false, moved: false, usedMove: false, reb: false, dead: false, born: G.round, nograve: !!(extra && extra.nograve) || !!C.token, tp: 0, tt: false, kills: 0 };
  }
  const addKw = (u, k) => { if (!u.kw[k]) { u.kw = Object.assign({}, u.kw); u.kw[k] = true; } };
  const NO_KW = Object.freeze({});
  function place(G, u, lane, slot) { u.lane = lane; u.slot = slot; G.board[u.owner][lane][slot] = u; }

  // A character enters play (played, summoned or copied). Returns the unit or null if there is no room.
  function summon(G, p, id, lane, slot, extra) {
    if (!isFree(G, p, lane, slot)) { const sp = empties(G, p, [lane]); if (!sp.length) return null; [lane, slot] = pick(G, sp); }
    const u = mkUnit(G, p, id, extra);
    if (extra && extra.copyOf) { const o = extra.copyOf; u.p = o.p; u.h = o.h; u.kw = o.kw; u.shield = o.shield; u.al = o.al; u.nograve = true; }
    place(G, u, lane, slot);
    if (id === 'dorothy' && G.P[p].moves) { u.p += G.P[p].moves; u.h += G.P[p].moves; }
    if (locOn(G, lane, 'field-mice')) u.stun = true;
    if (locOn(G, lane, 'open-meadow')) addKw(u, 'move');
    if (locOn(G, lane, 'gallows')) { const a = across(G, u); if (a) kill(G, a); }
    const L = G.locs[lane];
    if (L.filled == null && L.revealed && !L.ruined && (L.id === 'knowledge-vault' || L.id === 'overloaded') && !empties(G, p, [lane]).length) {
      L.filled = p;
      if (L.id === 'knowledge-vault') draw(G, p); else damageBarrier(G, 1 - p, lane, 5, { kind: 'location' });
    }
    return u;
  }
  function summonRandom(G, p, id, lanes, extra) { const sp = empties(G, p, lanes); if (!sp.length) return null; const [l, s] = pick(G, sp); return summon(G, p, id, l, s, extra); }

  function transform(G, u, id) {
    const C = CARDS[id];
    u.id = id; u.p = C.p; u.h = C.h; u.dmg = 0; u.kw = C.kw; u.al = C.al; u.shield = !!C.kw.shield; u.sil = false;
    log(G, 'a unit of P' + u.owner + ' transforms into ' + C.name);
  }
  const buff = (u, a, b) => { u.p += a; u.h += b; };

  // ---------- damage, healing
  function damageUnit(G, u, amt, src) {
    if (!u || u.dead || amt <= 0) return 0;
    if (locOn(G, u.lane, 'amphitheatre')) amt *= 2;
    if (u.shield) { u.shield = false; return 0; }
    u.dmg += amt;
    if (u.h - u.dmg <= 0 || (src && (src.dt || (src.u && src.u !== u && kw(G, src.u, 'deathtouch'))))) u.dead = true;
    if (u.id === 'jill' && !silenced(G, u)) healBarrier(G, u.owner, u.lane, 2);
    if (!u.dead && u.id === 'wicked-witch-of-the-west' && !silenced(G, u)) {
      addNew(G, u.owner, 'flying-monkey');
      const L = u.lane * 3 + u.slot - 1;
      if (L >= 0) moveUnit(G, u, (L / 3) | 0, L % 3);
    }
    if (u.dead && src && src.kind === 'combat' && src.u) src.u.kills += 1;
    return amt;
  }
  function kill(G, u) { if (u && !u.dead) u.dead = true; }

  // Puck (game files): an enemy heal of any size is cancelled and deals its full value as damage, even at full health.
  function healUnit(G, u, amt) {
    if (!u || u.dead || amt <= 0) return;
    if (anyUnit(G, 1 - u.owner, 'puck')) { damageUnit(G, u, amt, { kind: 'ability', p: 1 - u.owner }); return; }
    const d = Math.min(amt, u.dmg); if (d <= 0) return;
    u.dmg -= d; healed(G, u.owner);
  }
  function healBarrier(G, p, lane, amt) {
    if (amt <= 0) return;
    if (anyUnit(G, 1 - p, 'puck')) { damageBarrier(G, p, lane, amt, { kind: 'ability', p: 1 - p }); return; }
    const P = G.P[p]; const d = Math.min(amt, P.bmax[lane] - P.barrier[lane]); if (d <= 0) return;
    P.barrier[lane] += d; healed(G, p);
  }
  function healed(G, p) { const B = G.board[p]; for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = B[l][s]; if (u && !u.dead && u.id === 'phuong-hoang' && !silenced(G, u)) buff(u, 1, 1); } }

  // Damage to player p's barrier in a lane. src.kind: 'combat' | 'spell' | 'ability' | 'fatigue'; src.u = the unit dealing it.
  function damageBarrier(G, p, lane, amt, src) {
    if (amt <= 0 || G.over) return 0;
    src = src || {};
    if ((src.kind === 'spell' || src.kind === 'ability') && !src.noRedirect && anyUnit(G, p, 'boitata')) {
      return damageBarrier(G, 1 - p, lane, amt, { kind: src.kind, p: src.p, noRedirect: true });
    }
    if (locOn(G, lane, 'amphitheatre')) amt *= 2;
    const P = G.P[p];
    P.barrier[lane] -= amt;
    const u = src.u;
    if (u && u.owner !== p) {
      if (u.id === 'ali-baba' && !silenced(G, u)) draw(G, u.owner);
      if (!u.dead) for (const b of unitsIn(G, p, lane)) {
        if (silenced(G, b)) continue;
        if (b.id === 'baby-bear') damageUnit(G, u, 1, { kind: 'ability', p, u: b });
        else if (b.id === 'papa-bear') damageUnit(G, u, 3, { kind: 'ability', p, u: b });
        else if (b.id === 'mama-bear') kill(G, u);
      }
    }
    if (P.barrier[lane] <= 0 && P.notches > 0) {
      P.notches -= 1;
      const reset = locOn(G, lane, 'broken-gate') ? 10 : G.R.rebuilt;
      P.barrier[lane] = reset; P.bmax[lane] = reset;
      log(G, 'P' + p + '\'s barrier ' + (lane + 1) + ' breaks');
    }
    return amt;
  }

  // ---------- deaths
  function processDeaths(G) {
    for (let guard = 0; guard < 30; guard++) {
      let dying = null;
      for (let p = 0; p < 2; p++) for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = G.board[p][l][s]; if (u && u.dead) (dying || (dying = [])).push(u); }
      if (!dying) return;
      for (const u of dying) {
        if (G.board[u.owner][u.lane][u.slot] !== u) continue;
        G.board[u.owner][u.lane][u.slot] = null;
        const sil = silenced(G, u);
        log(G, nm(u.id) + ' (P' + u.owner + ') dies');
        if (u.kw.rebirth && !u.reb && !sil) {
          const v = mkUnit(G, u.owner, u.id); v.uid = u.uid; v.p = u.p; v.h = 1; v.reb = true; v.kw = u.kw; v.shield = false; v.usedMove = u.usedMove; v.nograve = u.nograve; v.moved = u.moved; v.born = u.born;
          place(G, v, u.lane, u.slot);
          fromGrave(G, v);
          continue;
        }
        const P = G.P[u.owner];
        if (!u.nograve && u.id !== 'koschei') P.grave.push({ id: u.id, bp: u.p - CARDS[u.id].p, bh: u.h - CARDS[u.id].h });
        if (!sil && DEATH[u.id]) {
          let times = 1;
          if (locOn(G, u.lane, 'burial')) times++;
          if (u.id !== 'koschei' && anyUnit(G, u.owner, 'queen-of-hearts')) times++;
          if (u.id === 'koschei') times = 1;
          for (let t = 0; t < times; t++) DEATH[u.id](G, u);
        }
        if (locOn(G, u.lane, 'soul-artillery')) { damageBarrier(G, 0, u.lane, 1, { kind: 'location' }); damageBarrier(G, 1, u.lane, 1, { kind: 'location' }); }
      }
    }
  }

  const DEATH = {
    'banshee': (G, u) => { for (const v of units(G, u.owner)) v.p += 1; },
    'billy': (G, u) => { const es = unitsIn(G, 1 - u.owner, u.lane); if (es.length) damageUnit(G, pick(G, es), 2, { kind: 'ability', p: u.owner, u }); },
    'jack-in-the-box': (G, u) => damageBarrier(G, 1 - u.owner, u.lane, 2, { kind: 'ability', p: u.owner }),
    'three-blind-mice': (G, u) => { summonRandom(G, u.owner, 'mouse'); summonRandom(G, u.owner, 'mouse'); },
    'baby-bear': (G, u) => addNew(G, u.owner, 'papa-bear'),
    'papa-bear': (G, u) => addNew(G, u.owner, 'mama-bear'),
    'golden-egg': (G, u) => { if (isFree(G, u.owner, u.lane, u.slot)) summon(G, u.owner, 'golden-goose', u.lane, u.slot); },   // cancelled if the space was retaken
    'humpty': (G, u) => { let id = pick(G, POOL); while (id === 'humpty') id = pick(G, POOL); addNew(G, u.owner, id); },
    'imhotep': (G, u) => { for (const v of unitsIn(G, 1 - u.owner, u.lane)) damageUnit(G, v, 2, { kind: 'ability', p: u.owner, u }); },
    'davy-crockett': (G, u) => { const d = G.P[u.owner].deck; for (let i = d.length - 1; i >= 0; i--) if (!CARDS[d[i].id].spell) { const c = copyCard(d[i]); c.bp += 2; c.bh += 2; d[i] = c; break; } },
    'mary': (G, u) => { for (const v of units(G, u.owner)) if (v.id === 'little-lamb') buff(v, 3, 3); for (const c of G.P[u.owner].hand) if (c.id === 'little-lamb') { c.bp += 3; c.bh += 3; } },
    'cockatrice': (G, u) => { const es = units(G, 1 - u.owner); if (es.length) kill(G, pick(G, es)); },
    'koschei': (G, u) => addNew(G, u.owner, 'koschei', { bp: u.p - CARDS.koschei.p + 2, bh: u.h - CARDS.koschei.h + 2 }),
  };

  // ---------- movement
  function moveUnit(G, u, lane, slot, swap) {
    const p = u.owner; const occ = G.board[p][lane][slot];
    if (occ === u) return false;
    if (occ ? !swap : !isFree(G, p, lane, slot)) return false;
    const fl = u.lane, fs = u.slot;
    G.board[p][fl][fs] = null;
    if (occ) place(G, occ, fl, fs);
    place(G, u, lane, slot);
    afterMove(G, u, fl, fs);
    if (occ) afterMove(G, occ, lane, slot);
    return true;
  }
  function afterMove(G, u, fl, fs) {
    const p = u.owner;
    u.moved = true;
    G.P[p].moves += 1;
    for (const d of units(G, p)) if (has(G, d, 'dorothy')) buff(d, 1, 1);
    if (has(G, u, 'pegasus')) u.p *= 2;
    if (has(G, u, 'card-soldier') && !G.board[p][fl][fs]) summon(G, p, 'card-soldier', fl, fs, { copyOf: u });
  }

  // ---------- playing cards
  function playCard(G, p, a, c) {
    const P = G.P[p];
    if (!c) { c = P.hand.find((x) => x.hid === a.hid); if (!c) return; P.hand.splice(P.hand.indexOf(c), 1); }
    const C = CARDS[c.id];
    if (P.track) P.track.played.push([G.round, c.id]);
    if (C.spell) { castSpell(G, p, c, a); return; }
    let lane = a.lane, slot = a.slot;
    if (G.resv && G.resv[p][lane * 3 + slot]) { G.resv[p][lane * 3 + slot] = false; G.fdown[p][lane] -= 1; }   // the card turns face up
    if (G.board[p][lane][slot]) {
      const here = empties(G, p, [lane]);
      const sp = here.length ? here : empties(G, p);
      if (!sp.length) return;
      [lane, slot] = pick(G, sp);
    }
    log(G, 'P' + p + ' plays ' + C.name + ' (location ' + (lane + 1) + ', space ' + (slot + 1) + ')');
    const u = summon(G, p, c.id, lane, slot, { bp: c.bp, bh: c.bh });
    if (!u) return;
    G.enemyPlayed[1 - p][lane] = true;
    if (locOn(G, lane, 'human-cannon')) { kill(G, u); damageBarrier(G, 1 - p, lane, power(G, u), { kind: 'location' }); processDeaths(G); return; }
    if (locOn(G, lane, 'wall-dumpty') && !P.wallUsed[lane]) { P.wallUsed[lane] = true; kill(G, u); processDeaths(G); return; }
    if (locOn(G, lane, 'the-well')) healBarrier(G, p, lane, 1);
    if (locOn(G, lane, 'blessed') && u.al === 'G') u.shield = true;
    if (locOn(G, lane, 'cloning-lab')) for (const [l, s] of empties(G, p, [lane])) summon(G, p, u.id, l, s, { copyOf: u });
    if (locOn(G, lane, 'reflecting-pool')) summonRandom(G, p, u.id, [0, 1, 2].filter((l) => l !== lane), { copyOf: u });
    for (const v of units(G, p)) {
      if (v === u || silenced(G, v)) continue;
      if (v.id === 'beast') buff(v, 1, 1);
      else if (v.id === 'beauty') draw(G, p);
      else if (v.id === 'lady-of-the-lake') { if (u.al === 'G') addKw(u, 'defender'); }
      else if (v.id === 'lancelot') { if (u.al === 'G' && v.lane === u.lane) buff(u, 2, 2); }
    }
    for (const v of unitsIn(G, 1 - p, lane)) if (has(G, v, 'toto')) {
      const sp = empties(G, 1 - p, [0, 1, 2].filter((l) => l !== lane));
      if (sp.length) { const [l, s] = pick(G, sp); moveUnit(G, v, l, s); v.p += 1; }
    }
    P.revealed.push([u, a]);
    onReveal(G, u, a);
    processDeaths(G);
  }
  function onReveal(G, u, a) {
    if (u.dead || !REVEAL[u.id] || silenced(G, u) || anyMorgiana(G, u.lane)) return;
    let times = 1;
    if (locOn(G, u.lane, 'mirror')) times++;
    if (units(G, u.owner).some((v) => v !== u && has(G, v, 'mulan'))) times++;
    for (let t = 0; t < times && !G.over; t++) { REVEAL[u.id](G, u, a); processDeaths(G); }
  }
  function anyMorgiana(G, lane) { for (let p = 0; p < 2; p++) for (let s = 0; s < 3; s++) { const v = G.board[p][lane][s]; if (v && !v.dead && v.id === 'morgiana' && !silenced(G, v)) return true; } return false; }

  const REVEAL = {
    'dracula': (G, u) => summonRandom(G, u.owner, 'brides-of-dracula', [u.lane]),
    'wicked-stepmother': (G, u) => { for (const v of units(G, u.owner)) if (v.al === 'E') addKw(v, 'deathtouch'); },
    'king-arthur': (G, u) => { for (const v of units(G, u.owner)) if (v.al === 'G') v.shield = true; },
    'three-not-so-little-pigs': (G, u) => { for (const l of [0, 1, 2]) if (l !== u.lane) summonRandom(G, u.owner, 'not-so-little-pig', [l]); },
    'bagheera': (G, u) => { if (u.slot === 1) buff(u, 2, 2); },
    'morgan-le-fay': (G, u) => { const h = G.P[u.owner].hand; if (h.length) discard(G, u.owner, h[h.length - 1]); addNew(G, u.owner, pick(G, SPELLS), { cm: -2 }); },
    'piglet': (G, u) => { for (const v of unitsIn(G, u.owner, u.lane)) if (v !== u) v.p += 1; },
    'rumple': (G, u) => { G.P[u.owner].bonusNext += 1; },
    'scarecrow': (G, u) => draw(G, u.owner),
    'asanbosam': (G, u) => { const h = G.P[u.owner].hand.filter((c) => CARDS[c.id].cost % 2 === 0); if (h.length) discard(G, u.owner, pick(G, h)); },
    'black-knight': (G, u) => { const a = across(G, u); if (a) damageUnit(G, a, 2, { kind: 'ability', p: u.owner, u }); },
    'robin-hood': (G, u) => { for (const v of units(G, 1 - u.owner)) damageUnit(G, v, 2, { kind: 'ability', p: u.owner, u }); },
    'flying-monkey': (G, u, a) => {
      const t = a && a.tgt != null ? findU(G, a.tgt) : null;
      if (!t || t === u) return;
      const sp = empties(G, t.owner, [u.lane]); if (!sp.length) return;
      const [l, s] = pick(G, sp); moveUnit(G, t, l, s);
    },
    'frog-prince': (G, u, a) => { if (a && a.mode === 1) buff(u, 0, 3); else buff(u, 3, 0); },
    'jack': (G, u) => { const es = units(G, 1 - u.owner).filter((v) => power(G, v) >= 7); if (es.length) kill(G, pick(G, es)); },
    'mary': (G, u) => addNew(G, u.owner, 'little-lamb'),
    'quasimodo': (G, u) => { const h = G.P[u.owner].hand; if (h.length) { let lo = h[0]; for (const c of h) if (cost(G, u.owner, c) < cost(G, u.owner, lo)) lo = c; discard(G, u.owner, lo); } draw(G, u.owner); },
    'boogeyman': (G, u) => { let lo = null; for (const v of unitsIn(G, u.owner, u.lane)) if (!lo || power(G, v) < power(G, lo) || (power(G, v) === power(G, lo) && hp(v) < hp(lo))) lo = v; if (lo) kill(G, lo); },   // ties: lowest health
    'jekyll': (G, u) => healHere(G, u, 3),
    'tin-woodman': (G, u) => healHere(G, u, 8),
    'little-john': (G, u) => { if (G.enemyPlayed[u.owner][u.lane]) buff(u, 2, 2); },
    'magic-carpet': (G, u, a) => {
      const dir = a && a.mode === 1 ? 1 : -1;
      const al = units(G, u.owner).filter((v) => v !== u).sort((x, y) => dir * ((y.lane * 3 + y.slot) - (x.lane * 3 + x.slot)));
      for (const v of al) { const L = v.lane * 3 + v.slot + dir; if (L >= 0 && L <= 8) moveUnit(G, v, (L / 3) | 0, L % 3); }
    },
    'mothman': (G, u) => { G.locs[u.lane].ruined = true; },
    'necromancer': (G, u) => {
      const h = G.P[u.owner].hand; if (!h.length) return;
      const c = pick(G, h); const evil = CARDS[c.id].al === 'E' && !CARDS[c.id].spell; discard(G, u.owner, c);
      for (let i = 0; i < 2; i++) { if (!evil || !summonRandom(G, u.owner, 'zombie')) addNew(G, u.owner, 'zombie'); }   // no room: to hand
    },
    'tweedledum': (G, u) => summonRandom(G, u.owner, 'tweedledee', [0, 1, 2].filter((l) => l !== u.lane), { copyOf: u }),
    'captain-ahab': (G, u, a) => {
      const h = G.P[u.owner].hand; if (!h.length) return;
      let hi = h[0]; for (const c of h) if (CARDS[c.id].cost > CARDS[hi.id].cost) hi = c;
      const dmg = CARDS[hi.id].cost; discard(G, u.owner, hi);
      let t = a && a.tgt != null ? findU(G, a.tgt) : null;
      if (!t || t.owner === u.owner) t = bestKillTarget(G, u.owner, dmg);
      if (t) damageUnit(G, t, dmg, { kind: 'ability', p: u.owner, u });
    },
    'fairy-godmother': (G, u, a) => {
      let t = a && a.tgt != null ? findU(G, a.tgt) : null;
      if (!t || t.owner !== u.owner || t === u) t = units(G, u.owner).filter((v) => v !== u).sort((x, y) => power(G, y) - power(G, x))[0];
      if (t) buff(t, 3, 3);
    },
    'galahad': (G, u) => { for (const v of units(G, u.owner)) if (v !== u) buff(v, 1, 1); },
    'genie': (G, u) => { for (const c of G.P[u.owner].hand.slice()) discard(G, u.owner, c); for (let i = 0; i < 3; i++) addNew(G, u.owner, pick(G, SPELLS)); },
    'three-musketeers': (G, u) => { for (const [l, s] of empties(G, u.owner, [u.lane])) summon(G, u.owner, 'musketeer', l, s, { nograve: true }); },
    'mowgli': (G, u) => summonRandom(G, u.owner, 'baloo', [0, 1, 2].filter((l) => l !== u.lane), { nograve: true }),
    'ellen-trechend': (G, u) => { const n = unitsIn(G, 1 - u.owner, u.lane).length + (G.fdown ? G.fdown[1 - u.owner][u.lane] : 0); buff(u, 3 * n, 3 * n); },   // face-down enemy cards count
    'white-queen': (G, u, a) => { const t = a && a.tgt != null ? findU(G, a.tgt) : null; if (t && t !== u) bounce(G, t); },
  };

  function healHere(G, u, amt) {
    const P = G.P[u.owner];
    const miss = P.bmax[u.lane] - P.barrier[u.lane];
    const al = unitsIn(G, u.owner, u.lane).filter((v) => v !== u && v.dmg > 0).sort((x, y) => y.dmg - x.dmg)[0];
    if (al && al.dmg > miss) healUnit(G, al, amt); else healBarrier(G, u.owner, u.lane, amt);
  }
  function bestKillTarget(G, p, dmg) {
    const es = units(G, 1 - p); if (!es.length) return null;
    const k = es.filter((v) => !v.shield && hp(v) <= dmg).sort((x, y) => power(G, y) - power(G, x));
    return k[0] || es.sort((x, y) => power(G, y) - power(G, x))[0];
  }
  function bounce(G, t) {
    G.board[t.owner][t.lane][t.slot] = null;
    log(G, nm(t.id) + ' returns to P' + t.owner + '\'s hand');
    toHand(G, t.owner, mkCard(G, t.id));
  }
  function fromGrave(G, u) {
    if (silenced(G, u)) return;
    if (u.id === 'franken-bride') healBarrier(G, u.owner, u.lane, 4);
    else if (u.id === 'franks-monster') u.p *= 2;
  }
  function raise(G, p) {
    const P = G.P[p];
    const gr = P.grave.filter((g) => !CARDS[g.id].spell); if (!gr.length) return;
    const sp = empties(G, p); if (!sp.length) return;
    const g = pick(G, gr); P.grave.splice(P.grave.indexOf(g), 1);
    const [l, s] = pick(G, sp);
    const u = summon(G, p, g.id, l, s, { bp: g.bp, bh: g.bh });
    if (u) { log(G, nm(g.id) + ' rises from P' + p + '\'s graveyard'); fromGrave(G, u); }
  }

  // ---------- spells
  function castSpell(G, p, c, a) {
    const P = G.P[p];
    const C = CARDS[c.id];
    log(G, 'P' + p + ' casts ' + C.name + (a.mode != null && c.id === 'van-helsings-tools' ? ' (' + TOOLS[a.mode] + ')' : ''));
    if (!C.token) P.grave.push({ id: c.id, bp: 0, bh: 0 });
    let times = 1;
    if (c.id !== 'merlins-prophecy') {
      if (P.prophecy > 0) { times++; P.prophecy--; }
      if (!P.merlinUsed && anyUnit(G, p, 'merlin')) { P.merlinUsed = true; times++; }
    }
    const f = SPELL[c.id];
    for (let t = 0; t < times && !G.over && f; t++) { f(G, p, a); processDeaths(G); }
    for (const u of units(G, p)) {
      if (silenced(G, u)) continue;
      if (u.id === 'glinda') { for (const v of units(G, p)) v.p += 1; }
      else if (u.id === 'queen-of-the-night') damageBarrier(G, 1 - p, u.lane, 2, { kind: 'ability', p, u });
      else if (u.id === 'sorcerers-apprentice') summonRandom(G, p, 'broomstick');
      else if (u.id === 'broomstick') buff(u, 1, 1);
    }
    for (let l = 0; l < 3; l++) if (locOn(G, l, 'broom-closet')) for (const v of unitsIn(G, p, l)) buff(v, 1, 1);
    processDeaths(G);
  }
  const TOOLS = ['Holy Water', 'Silver Bullet', 'Garlic', 'Wooden Stake'];
  const T = (G, a) => (a && a.tgt != null ? findU(G, a.tgt) : null);
  const SPELL = {
    'bullseye': (G, p, a) => damageUnit(G, T(G, a), 3, { kind: 'spell', p }),
    'axe-throw': (G, p, a) => damageUnit(G, T(G, a), 4, { kind: 'spell', p }),
    'defense-matrix': (G, p, a) => { const t = T(G, a); if (t) t.shield = true; },
    'freeze': (G, p, a) => { const t = T(G, a); if (t) t.stun = true; },
    'poison-apple': (G, p, a) => { const t = T(G, a); if (t) addKw(t, 'deathtouch'); },
    'reinforcements': (G, p) => { summonRandom(G, p, 'merry-man'); summonRandom(G, p, 'merry-man'); },
    'stroke-of-midnight': (G, p, a) => { const t = T(G, a); if (t) bounce(G, t); },
    'twister-toss': (G, p, a) => { const t = T(G, a); if (t && t.owner === p && a.lane2 != null) moveUnit(G, t, a.lane2, a.slot2, true); },
    'animate-object': (G, p, a) => { if (a.lane2 != null) { if (isFree(G, p, a.lane2, a.slot2)) summon(G, p, 'broomstick', a.lane2, a.slot2); } else summonRandom(G, p, 'broomstick'); },
    'first-aid': (G, p, a) => { const t = T(G, a); if (t) healUnit(G, t, 6); else if (a.tgt == null) healBarrier(G, p, a.lane2 != null ? a.lane2 : weakLane(G, p), 6); },
    'lightning-strike': (G, p, a) => { const t = T(G, a); if (t) damageUnit(G, t, 3, { kind: 'spell', p }); else if (a.tgt == null) damageBarrier(G, 1 - p, a.lane2 != null ? a.lane2 : weakLane(G, 1 - p), 3, { kind: 'spell', p }); },
    'obliterate': (G, p, a) => { const t = T(G, a); if (t) damageUnit(G, t, 10, { kind: 'spell', p }); else if (a.tgt == null) damageBarrier(G, 1 - p, a.lane2 != null ? a.lane2 : weakLane(G, 1 - p), 10, { kind: 'spell', p }); },
    'merlins-prophecy': (G, p) => { G.P[p].prophecy += 1; },
    'trash-for-treasure': (G, p, a) => { const t = T(G, a); if (t && t.owner === p) { kill(G, t); processDeaths(G); draw(G, p, 2); } },
    'dark-omen': (G, p, a) => { const t = T(G, a); if (t) kill(G, t); },
    'en-passant': (G, p, a) => { const t = T(G, a); if (!t || t.owner !== p) return; if (a.lane2 != null && isFree(G, p, a.lane2, a.slot2)) moveUnit(G, t, a.lane2, a.slot2); const x = across(G, t); if (x) damageUnit(G, x, power(G, t), { kind: 'spell', p, u: t, dt: kw(G, t, 'deathtouch') }); },
    'its-alive': (G, p) => raise(G, p),
    'mind-palace': (G, p) => draw(G, p, 2),
    'piggy-bank': (G, p) => { G.P[p].perm += 1; },
    'searing-light': (G, p, a) => { const t = T(G, a); if (t && t.owner !== p) { const lane = t.lane; damageUnit(G, t, 4, { kind: 'spell', p }); healBarrier(G, p, lane, 4); } },
    'blow-the-house-down': (G, p, a) => { const t = T(G, a); if (!t || t.owner !== p) return; const pw = power(G, t), dt = kw(G, t, 'deathtouch'); for (const v of unitsIn(G, 1 - p, t.lane)) damageUnit(G, v, pw, { kind: 'spell', p, u: t, dt }); },
    'spellbook': (G, p) => { G.P[p].spellbook += 1; },
    'underworld-flare': (G, p, a) => { const t = T(G, a); if (t && t.owner !== p) damageUnit(G, t, 6, { kind: 'spell', p }); },
    'rain-of-arrows': (G, p) => { for (const v of units(G, 1 - p)) damageUnit(G, v, 2, { kind: 'spell', p }); },
    'heroic-charge': (G, p) => { for (const v of units(G, p)) { v.tp += 2; v.tt = true; } },   // only the allies already revealed
    'reflection': (G, p) => { for (const [u, a] of G.P[p].revealed.slice()) if (!u.dead && G.board[p][u.lane][u.slot] === u) onReveal(G, u, a); },
    'forbidden-knowledge': (G) => { for (const v of allUnits(G)) kill(G, v); },
    'off-with-your-head': (G, p, a) => {
      const t = T(G, a); if (!t || t.owner !== p) return;
      const id = t.id, lane = t.lane;
      kill(G, t); processDeaths(G);
      for (let l = 0; l < 3; l++) if (l !== lane) summonRandom(G, p, id, [l]);
    },
    'legion-of-the-dead': (G, p) => { for (const [l, s] of empties(G, p)) summon(G, p, 'zombie', l, s); },
    'van-helsings-tools': (G, p, a) => {
      if (a.mode === 1 && a.tgt == null) { damageBarrier(G, 1 - p, a.lane2 != null ? a.lane2 : weakLane(G, 1 - p), 1, { kind: 'spell', p }); return; }
      const t = T(G, a); if (!t) return;
      if (a.mode === 0) { t.sil = true; t.kw = NO_KW; t.shield = false; }
      else if (a.mode === 1) damageUnit(G, t, 1, { kind: 'spell', p });
      else if (a.mode === 2) t.stun = true;
      else if (a.mode === 3) { if (t.dmg > 0) kill(G, t); }
    },
  };
  function weakLane(G, p) { const b = G.P[p].barrier; let w = 0; for (let l = 1; l < 3; l++) if (b[l] < b[w]) w = l; return w; }

  // ---------- Legendary powers (Game Start), from the game files; see cards.js POWERS for the text.
  const POWER = {
    'van-helsing': (G, p) => { addNew(G, p, 'van-helsings-tools'); },
    'king-arthur': (G, p) => { addNew(G, p, 'defense-matrix', { cm: -1 }); },
    'robin-hood': (G, p) => { addNew(G, p, 'bullseye', { cm: -1 }); },
    'wicked-stepmother': (G, p) => { addNew(G, p, 'poison-apple', { cm: -1 }); },
    'merlin': (G, p) => { addNew(G, p, 'merlins-prophecy'); },
    'mulan': (G, p) => { addNew(G, p, 'reflection'); },
    'dr-frank': (G, p) => { addNew(G, p, 'its-alive'); },
    'queen-of-hearts': (G, p) => { addNew(G, p, 'off-with-your-head'); },
    'dracula': (G, p) => { addNew(G, p, 'brides-of-dracula'); },
    'dorothy': (G, p) => { addNew(G, p, 'twister-toss'); },
    'three-not-so-little-pigs': (G, p) => { for (let l = 0; l < 3; l++) summonRandom(G, p, 'little-pig', [l]); },
    'legion-of-the-dead': (G, p) => { summonRandom(G, p, 'zombie'); },
  };

  // ---------- round structure
  function resetRound(G) {
    G.discardedRound = false; G.treasurer = false;
    G.enemyPlayed = [[false, false, false], [false, false, false]];
    for (let p = 0; p < 2; p++) {
      const P = G.P[p]; P.merlinUsed = false; P.prophecy = 0; P.revealed = [];
      for (let l = 0; l < 3; l++) for (let s = 0; s < 3; s++) { const u = G.board[p][l][s]; if (u) u.moved = false; }
    }
  }
  function startRound(G) {
    G.round += 1;
    resetRound(G);
    if (G.round > 1) G.prio = 1 - G.prio;
    if (G.round <= 3) {
      const l = G.round - 1; const L = G.locs[l];
      if (L.id) { L.revealed = true; log(G, 'Location ' + (l + 1) + ' is ' + LOC[L.id].name + ': ' + LOC[L.id].text); revealLocation(G, l); }
    }
    for (let p = 0; p < 2; p++) {
      const P = G.P[p];
      P.mana = Math.min(10, G.round + 1) + P.perm + P.bonusNext + (anyLoc(G, 'mana-battery') ? P.carry : 0) + (G.leyline === G.round ? 2 : 0);
      P.bonusNext = 0;
    }
    if (G.round === 6 && anyLoc(G, 'nostradamus')) for (let p = 0; p < 2; p++) G.P[p].deck = [];
    for (let p = 0; p < 2; p++) {
      const P = G.P[p];
      if (P.deck.length) draw(G, p);
      else { P.fatigue += 1; for (let l = 0; l < 3; l++) damageBarrier(G, p, l, P.fatigue, { kind: 'fatigue' }); }
      for (let n = countUnit(G, p, 'king-shahryar'); n > 0; n--) drawTmp(G, p);
      for (let i = 0; i < P.spellbook; i++) { let id = pick(G, SPELLS); while (id === 'spellbook') id = pick(G, SPELLS); addNew(G, p, id, { tmp: G.round }); }
      if (anyLoc(G, 'sultans-court')) drawTmp(G, p);
    }
    if (anyLoc(G, 'sherwood')) for (let p = 0; p < 2; p++) summonRandom(G, p, 'merry-man');
    processDeaths(G);
    checkEnd(G);
  }
  function drawTmp(G, p) { const P = G.P[p]; if (!P.deck.length) return; const c = take(G, P.deck.pop()); if (c.id === 'pumpkin') { damageBarrier(G, p, Math.floor(G.rng() * 3), 5, { kind: 'ability' }); return; } c.tmp = G.round; if (P.track) P.track.drawn.push(c.id); toHand(G, p, c); }

  function revealLocation(G, l) {
    const id = G.locs[l].id;
    if (id === 'leyline') G.leyline = G.round;
    else if (id === 'treasurer') G.treasurer = true;
    else if (id === 'giants-beacon') for (let p = 0; p < 2; p++) { const d = G.P[p].deck; if (!d.length) continue; let hi = 0; for (let i = 1; i < d.length; i++) if (CARDS[d[i].id].cost > CARDS[d[hi].id].cost) hi = i; const c = take(G, d.splice(hi, 1)[0]); c.setCost = 1; if (G.P[p].track) G.P[p].track.drawn.push(c.id); toHand(G, p, c); }
    else if (id === 'hero-emerges') for (let p = 0; p < 2; p++) { const d = G.P[p].deck; const i = d.findIndex((c) => CARDS[c.id].leg); if (i >= 0) { const c = take(G, d.splice(i, 1)[0]); if (G.P[p].track) G.P[p].track.drawn.push(c.id); toHand(G, p, c); } else draw(G, p); }
    else if (id === 'hundred-acre') for (let p = 0; p < 2; p++) summonRandom(G, p, 'christopher-robin', [l], { nograve: true });
    else if (id === 'junkyard') for (let p = 0; p < 2; p++) { const h = G.P[p].hand; if (h.length) discard(G, p, pick(G, h)); }
    else if (id === 'tinkerer') for (let p = 0; p < 2; p++) { const d = G.P[p].deck; const ones = d.filter((c) => CARDS[c.id].cost === 1); if (ones.length) { const c0 = pick(G, ones); d.splice(d.indexOf(c0), 1); const c = take(G, c0); if (G.P[p].track) G.P[p].track.drawn.push(c.id); toHand(G, p, c); } }
  }

  // One round. plans[p] = array of actions:
  //   { move: uid, lane, slot }                         move a character that has Move, to any free space of its side
  //   { hid, lane, slot, tgt?, mode?, lane2?, slot2? }  play a card from hand
  // 1. Moves, the player who reveals first moving first. 2. Both players put their cards down: the mana is paid, the
  // card leaves the hand and holds its space face down. 3. The cards reveal, first player first, each player's cards
  // in the order of the plan. 4. Combat.
  function resolveRound(G, plans) {
    const order = [G.prio, 1 - G.prio];
    for (const p of order) for (const a of plans[p] || []) {
      if (a.move == null || G.over) continue;
      const u = findU(G, a.move);
      if (!u || u.owner !== p || !canMove(G, u) || G.board[p][a.lane][a.slot]) continue;
      u.usedMove = true;
      log(G, 'P' + p + ' moves ' + nm(u.id) + ' to location ' + (a.lane + 1) + ', space ' + (a.slot + 1));
      moveUnit(G, u, a.lane, a.slot);
    }
    processDeaths(G);
    G.resv = [[false, false, false, false, false, false, false, false, false], [false, false, false, false, false, false, false, false, false]];
    G.fdown = [[0, 0, 0], [0, 0, 0]];
    const pend = [[], []];
    for (const p of order) {
      const P = G.P[p];
      let mana = P.mana;
      for (const a of plans[p] || []) {
        if (a.move != null) continue;
        const i = P.hand.findIndex((x) => x.hid === a.hid);
        if (i < 0) continue;
        const c = P.hand[i];
        const k = cost(G, p, c);
        if (k > mana) continue;
        if (!CARDS[c.id].spell) {
          if (!isFree(G, p, a.lane, a.slot)) continue;
          G.resv[p][a.lane * 3 + a.slot] = true; G.fdown[p][a.lane] += 1; G.enemyPlayed[1 - p][a.lane] = true;
        }
        mana -= k;
        P.hand.splice(i, 1);
        pend[p].push(a, c);
      }
      P.carry = mana;
    }
    for (const p of order) { const q = pend[p]; for (let i = 0; i < q.length && !G.over; i += 2) { playCard(G, p, q[i], q[i + 1]); checkEnd(G); } }
    G.resv = null; G.fdown = null;
    fight(G);
    if (!G.over && G.round >= (G.opts.maxRounds || 40)) endByCount(G);
  }
  function fight(G) {
    if (!G.over) beforeCombat(G);
    if (!G.over) combat(G);
    if (!G.over) afterCombat(G);
    checkEnd(G);
  }
  // One more combat with the board as it stands and no new cards (used by the bots to look one round ahead).
  function phantomRound(G) { if (G.over) return; resetRound(G); fight(G); }

  function beforeCombat(G) {
    for (let p = 0; p < 2; p++) {
      const P = G.P[p];
      if (anyUnit(G, p, 'van-helsing') && !P.hand.some((c) => c.id === 'van-helsings-tools')) addNew(G, p, 'van-helsings-tools');
      for (let n = countUnit(G, p, 'kanga'); n > 0; n--) for (const v of units(G, p)) if (v.moved) buff(v, 1, 1);
      for (let n = countUnit(G, p, 'dr-frank'); n > 0; n--) raise(G, p);
      for (const c of P.hand.slice()) if (c.tmp != null && c.tmp <= G.round) discard(G, p, c);
    }
    processDeaths(G);
    checkEnd(G);
  }

  // The Defender that answers an attack on player p's barrier: not stunned, and the first to have entered play.
  function defenderOf(G, p, lane) {
    const L = G.board[p][lane];
    let best = null;
    for (let s = 0; s < 3; s++) { const d = L[s]; if (d && !d.dead && !d.stun && kw(G, d, 'defender') && (!best || d.uid < best.uid)) best = d; }
    return best;
  }

  // One basic attack. t is the character u faces (fixed before the exchange, so both sides of a fight hit each other)
  // or null: then u goes for the barrier, where a Defender may step in, take the hit and strike back.
  function strike(G, u, t) {
    const pw = power(G, u);
    const sil = silenced(G, u);
    const e = 1 - u.owner, lane = u.lane;
    if (pw > 0) {
      const d = t || defenderOf(G, e, lane);
      if (!d) damageBarrier(G, e, lane, pw, { kind: 'combat', p: u.owner, u });
      else {
        const mult = locOn(G, lane, 'amphitheatre') ? 2 : 1;
        const left = d.shield || d.dead ? Infinity : hp(d);
        const tr = G.R.spill || kw(G, u, 'trample');
        damageUnit(G, d, pw, { kind: 'combat', p: u.owner, u });
        if (tr && left !== Infinity) { const over = Math.floor((pw * mult - left) / mult); if (over > 0) damageBarrier(G, e, lane, over, { kind: 'combat', p: u.owner, u }); }
        if (d !== t) damageUnit(G, u, power(G, d), { kind: 'combat', p: e, u: d });
      }
    }
    if (sil) return;
    if (u.id === 'impundulu') addNew(G, u.owner, 'lightning-strike', { tmp: G.round + 1 });
    if (u.kw.snipe) damageBarrier(G, e, lane, u.kw.snipe, { kind: 'ability', p: u.owner, u });   // after the attack, blocked or not
  }
  // On Kill (Huntsman): it destroyed a character in combat and is still standing.
  function onKill(G, lane) {
    for (let p = 0; p < 2; p++) for (let s = 0; s < 3; s++) {
      const u = G.board[p][lane][s];
      if (u && u.kills) { if (!u.dead && has(G, u, 'huntsman')) buff(u, u.kills, u.kills); u.kills = 0; }
    }
  }

  // Location by location and space by space, left to right (Wonderland: right to left). In a space, the two
  // characters hit each other at the same time unless one has First Strike; a character alone hits the barrier.
  // Double Attack gives a second attack once the first ones are done. Stunned characters neither attack nor defend.
  function combat(G) {
    const rev = anyLoc(G, 'wonderland');
    for (let li = 0; li < 3; li++) {
      const l = rev ? 2 - li : li;
      for (let si = 0; si < 3; si++) {
        if (G.over) return;
        const s = rev ? 2 - si : si;
        const a = G.board[0][l][s], b = G.board[1][l][s];
        const live = [];
        if (a && !a.dead && !a.stun) live.push(a);
        if (b && !b.dead && !b.stun) live.push(b);
        if (!live.length) continue;
        for (let k = 0; k < 2; k++) {
          for (let fs = 1; fs >= 0; fs--) {
            const st = [];
            for (const u of live) if (!u.dead && G.board[u.owner][l][s] === u && (k === 0 || kw(G, u, 'double')) && (kw(G, u, 'first') ? 1 : 0) === fs) st.push(u);
            if (!st.length) continue;
            const t0 = across(G, st[0]), t1 = st.length > 1 ? across(G, st[1]) : null;
            strike(G, st[0], t0);
            if (st.length > 1) strike(G, st[1], t1);
            onKill(G, l);
            processDeaths(G);
            if (checkEnd(G)) return;
          }
        }
      }
    }
  }

  function afterCombat(G) {
    for (const u of allUnits(G)) {
      if (!silenced(G, u)) {
        if (u.id === 'big-bad-wolf') buff(u, 1, 1);
        else if (u.id === 'the-green-knight') u.dmg = 0;
      }
      if (locOn(G, u.lane, 'training-dojo')) u.p += 1;
      u.stun = false; u.tp = 0; u.tt = false;
    }
    for (let l = 0; l < 3; l++) {
      const L = G.locs[l];
      if (!L.revealed || L.ruined) continue;
      if (L.id === 'burnturn') { for (const u of unitsIn(G, 0, l).concat(unitsIn(G, 1, l))) damageUnit(G, u, 1, { kind: 'location' }); processDeaths(G); }
      else if (L.id === 'ballroom') { for (let p = 0; p < 2; p++) { const us = unitsIn(G, p, l); if (us.length) bounce(G, pick(G, us)); } }
      else if (L.id === 'tectonic') { damageBarrier(G, 0, l, 1, { kind: 'location' }); damageBarrier(G, 1, l, 1, { kind: 'location' }); }
      else if (L.id === 'conveyor') { for (let p = 0; p < 2; p++) for (let s = 1; s >= 0; s--) { const u = G.board[p][l][s]; if (u && !G.board[p][l][s + 1]) moveUnit(G, u, l, s + 1); } }
      else if (L.id === 'the-hill') {
        const all = unitsIn(G, 0, l).concat(unitsIn(G, 1, l));
        if (all.length > 1) { let lo = Infinity; for (const u of all) lo = Math.min(lo, power(G, u)); for (const u of all) if (power(G, u) === lo) kill(G, u); processDeaths(G); }
      }
    }
    for (let p = 0; p < 2; p++) for (const c of G.P[p].hand) { if (c.id === 'jekyll') c.id = 'hyde'; else if (c.id === 'hyde') c.id = 'jekyll'; }
  }

  function checkEnd(G) {
    if (G.over) return true;
    const a = G.P[0].notches <= 0, b = G.P[1].notches <= 0;
    if (a || b) { G.over = true; G.winner = a && b ? -1 : (a ? 1 : 0); return true; }
    return false;
  }
  function endByCount(G) {
    const sc = (p) => G.P[p].notches * 100 + G.P[p].barrier[0] + G.P[p].barrier[1] + G.P[p].barrier[2];
    const a = sc(0), b = sc(1);
    G.over = true; G.winner = a === b ? -1 : (a > b ? 0 : 1);
  }

  // ---------- copying a game (for the bots). The copy gets its own random stream so it cannot see the real future.
  function clone(G, seed) {
    const sd = seed != null ? seed : mix(G.seed, ++G.cloneN);
    const a = G.locs[0], b = G.locs[1], c = G.locs[2], e = G.enemyPlayed;
    return { seed: sd, rng: rngFrom(sd), cloneN: 0, R: G.R, round: G.round, uid: G.uid, over: G.over, winner: G.winner, log: null, opts: G.opts,
      P: [cloneP(G.P[0]), cloneP(G.P[1])], board: [cloneSide(G.board[0]), cloneSide(G.board[1])],
      locs: [{ id: a.id, revealed: a.revealed, ruined: a.ruined, filled: a.filled }, { id: b.id, revealed: b.revealed, ruined: b.ruined, filled: b.filled }, { id: c.id, revealed: c.revealed, ruined: c.ruined, filled: c.filled }],
      prio: G.prio, first: G.first, enemyPlayed: [[e[0][0], e[0][1], e[0][2]], [e[1][0], e[1][1], e[1][2]]], discardedRound: G.discardedRound, treasurer: G.treasurer, leyline: G.leyline, cow: true, resv: null, fdown: null };
  }
  function cloneP(P) {
    const h = P.hand, hand = new Array(h.length);
    for (let i = 0; i < h.length; i++) { const c = h[i]; hand[i] = { hid: c.hid, id: c.id, bp: c.bp, bh: c.bh, cm: c.cm, tmp: c.tmp, setCost: c.setCost }; }
    const b = P.barrier, m = P.bmax, w = P.wallUsed;
    return { deck: P.deck.slice(), hand, grave: P.grave.slice(), name: P.name, legend: P.legend, barrier: [b[0], b[1], b[2]], bmax: [m[0], m[1], m[2]],
      notches: P.notches, fatigue: P.fatigue, revealed: [], perm: P.perm, bonusNext: P.bonusNext, carry: P.carry, mana: P.mana, moves: P.moves, spellbook: P.spellbook,
      prophecy: P.prophecy, merlinUsed: P.merlinUsed, wallUsed: [w[0], w[1], w[2]], track: null };
  }
  function cloneU(u) {
    return { uid: u.uid, id: u.id, owner: u.owner, lane: u.lane, slot: u.slot, p: u.p, h: u.h, dmg: u.dmg, kw: u.kw, al: u.al, shield: u.shield, stun: u.stun, sil: u.sil,
      moved: u.moved, usedMove: u.usedMove, reb: u.reb, dead: u.dead, born: u.born, nograve: u.nograve, tp: u.tp, tt: u.tt, kills: u.kills };
  }
  function cloneSide(S) {
    const out = [null, null, null];
    for (let l = 0; l < 3; l++) { const r = S[l]; out[l] = [r[0] ? cloneU(r[0]) : null, r[1] ? cloneU(r[1]) : null, r[2] ? cloneU(r[2]) : null]; }
    return out;
  }
  const nextSeed = (G) => mix(G.seed, ++G.cloneN);

  // ---------- full game driver
  function playGame(decks, bots, opts = {}) {
    const mull = [bots[0].keep ? (c, h) => bots[0].keep(c, h, decks[0]) : null, bots[1].keep ? (c, h) => bots[1].keep(c, h, decks[1]) : null];
    const G = newGame(decks, Object.assign({ mull }, opts));
    while (!G.over) {
      startRound(G);
      if (G.over) break;
      const plans = [bots[0].plan(G, 0), bots[1].plan(G, 1)];
      resolveRound(G, plans);
    }
    return G;
  }

  const API = { DEFAULT_RULES, RULES_MODEL, CUP_OFF, POWER, newGame, startRound, resolveRound, phantomRound, playGame, clone, nextSeed, cost, power, kw, hp, units, unitsIn, empties, across, findU, canMove, silenced, anyUnit,
    CARDS, POOL, SPELLS, LOC, rngFrom, mix, defaultKeep, copyCard,
    _: { summon, summonRandom, discard, draw, addNew, damageUnit, damageBarrier, healBarrier, healUnit, mkCard, processDeaths, bounce, playCard, fight, combat, checkEnd, moveUnit } };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else (root.OT = root.OT || {}).engine = API;
})(typeof self !== 'undefined' ? self : this);
