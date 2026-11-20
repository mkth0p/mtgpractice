/* Simulation worker for the Origins TCG page: bot against bot games off the main thread.
   Messages in:
     { type: 'vs', id, deck, opps: [{ key, legend, cards, j }], n, bot, seed }   deck against each opponent, n seeds x both seats
                                                                                  (j = the opponent's number in the whole field: it fixes the seeds)
     { type: 'game', id, a, b, bot, seed }                                        one game with a snapshot of every round
     { type: 'stop' }
   Messages out: { id, type: 'progress' | 'done' | 'game' | 'error', ... } */
importScripts('cards.js?v=1', 'engine.js?v=1', 'ai.js?v=1');
const E = self.OT.engine, A = self.OT.ai, D = self.OT.data;
let job = 0;

function vs(m) {
  const mine = ++job;
  const res = m.opps.map((o) => ({ key: o.key, w: 0, n: 0, rounds: 0 }));
  const todo = [];
  for (let i = 0; i < m.n; i++) for (let j = 0; j < m.opps.length; j++) for (let side = 0; side < 2; side++) todo.push([j, i, side]);
  let k = 0, last = 0;
  const bots = [A.mkBot(m.bot), A.mkBot(m.bot)];
  const step = () => {
    if (mine !== job) return;
    const t0 = Date.now();
    while (k < todo.length && Date.now() - t0 < 60) {
      const [j, i, side] = todo[k++];
      const o = m.opps[j];
      const G = E.playGame(side ? [o, m.deck] : [m.deck, o], bots, { seed: E.mix(E.mix(m.seed || 1, o.j == null ? j : o.j), i) });
      res[j].n++; res[j].rounds += G.round;
      res[j].w += G.winner === side ? 1 : (G.winner === -1 ? 0.5 : 0);
    }
    if (k >= todo.length) { postMessage({ id: m.id, type: 'done', res, done: k, total: todo.length }); return; }
    if (Date.now() - last > 250) { last = Date.now(); postMessage({ id: m.id, type: 'progress', res, done: k, total: todo.length }); }
    setTimeout(step, 0);
  };
  step();
}

const snapUnit = (G, u) => ({ id: u.id, p: E.power(G, u), h: E.hp(u), shield: u.shield, stun: u.stun, sil: u.sil, reb: u.reb,
  kw: ['defender', 'deathtouch', 'trample', 'first', 'double', 'rebirth', 'move'].filter((k) => E.kw(G, u, k)), snipe: u.sil ? 0 : (u.kw.snipe || 0) });
function snap(G) {
  return { round: G.round, over: G.over, winner: G.winner, prio: G.prio,
    locs: G.locs.map((l) => (l.id && l.revealed ? { id: l.id, name: E.LOC[l.id].name, text: E.LOC[l.id].text, ruined: l.ruined } : null)),
    P: G.P.map((P) => ({ barrier: P.barrier.slice(), bmax: P.bmax.slice(), breaks: P.notches, hand: P.hand.map((c) => ({ id: c.id, cost: E.cost(G, G.P.indexOf(P), c), bp: c.bp, bh: c.bh })), deck: P.deck.length, mana: P.mana })),
    board: G.board.map((S, p) => S.map((lane) => lane.map((u) => (u && !u.dead ? snapUnit(G, u) : null)))) };
}
function game(m) {
  const bots = [A.mkBot(m.bot), A.mkBot(m.bot)];
  const G = E.newGame([m.a, m.b], { seed: m.seed, log: true });
  const rounds = [];
  while (!G.over && G.round < 40) {
    const mark = G.log.length;
    E.startRound(G);
    if (G.over) break;
    const before = snap(G);
    const plans = [bots[0].plan(G, 0), bots[1].plan(G, 1)];
    E.resolveRound(G, plans);
    rounds.push({ before, after: snap(G), log: G.log.slice(mark).map((x) => x.s) });
  }
  postMessage({ id: m.id, type: 'game', rounds, winner: G.winner, round: G.round });
}

onmessage = (e) => {
  const m = e.data;
  try {
    if (m.type === 'stop') job++;
    else if (m.type === 'vs') vs(m);
    else if (m.type === 'game') game(m);
  } catch (err) { postMessage({ id: m.id, type: 'error', error: String((err && err.stack) || err) }); }
};
void D;
