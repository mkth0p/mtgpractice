/* The Origins TCG page: every section is drawn here from data.js (the simulation results, written by
   tools/origins/report.js) with the building blocks of ui.js. */
(function () {
  'use strict';
  const OT = window.OT, D = OT.data, E = OT.engine, R = OT.results, U = OT.ui;
  const { h, $, clear, pct, pts, num, SHORT, TINY, cname } = U;

  const decks = R.decks.map((d, i) => Object.assign({ i }, d));
  const byKey = Object.fromEntries(decks.map((d) => [d.key, d]));
  const legs = R.legends, legBy = Object.fromEntries(legs.map((l) => [l.id, l]));
  const pick = byKey[R.pick.key];
  const isSearch = (d) => d.source === 'search';
  const label = (d) => (d.source === 'search' ? SHORT[d.legend] + ' (search)' : d.source === 'cup' ? SHORT[d.legend] + ' (' + d.author + ')' : d.source === 'wiki' ? SHORT[d.legend] + ' (wiki guide)' : d.name);
  const SOURCE = { ladder: 'Ladder list', cup: 'Crimson Cup list', wiki: 'Wiki guide', search: 'Found by the search' };
  const SOURCE_LC = { ladder: 'ladder list', cup: 'Crimson Cup list', wiki: 'wiki guide', search: 'deck search' };
  const ranked = decks.slice().sort((a, b) => b.field - a.field);
  const ivl = (d) => [d.field - 1.96 * d.se, d.field + 1.96 * d.se];
  const reps = legs.filter((l) => l.best).map((l) => byKey[l.best]).sort((a, b) => b.field - a.field);        // best list per Legendary
  const cal = R.calibration || [];
  const calBest = cal.slice().sort((a, b) => b.pearson - a.pearson)[0];
  const common = (a, b) => a.filter((c) => b.includes(c)).length;

  // ---------------------------------------------------------------- shell: theme, tabs, header
  (function shell() {
    const btn = $('#theme'), rootEl = document.documentElement;
    const dark = () => (rootEl.dataset.theme ? rootEl.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
    const paint = () => { btn.textContent = dark() ? 'Light' : 'Dark'; };
    try { const t = localStorage.getItem('origins-theme'); if (t === 'dark' || t === 'light') rootEl.dataset.theme = t; } catch (e) { /* storage can be blocked */ }
    paint();
    btn.addEventListener('click', () => { const t = dark() ? 'light' : 'dark'; rootEl.dataset.theme = t; try { localStorage.setItem('origins-theme', t); } catch (e) { /* ignore */ } paint(); });

    const tabs = [...document.querySelectorAll('#tabs button')];
    const show = (name, push) => {
      if (!tabs.some((t) => t.dataset.tab === name)) name = 'verdict';
      for (const t of tabs) { const on = t.dataset.tab === name; t.setAttribute('aria-selected', String(on)); document.getElementById('p-' + t.dataset.tab).hidden = !on; }
      if (push) {
        history.replaceState(null, '', '#' + name);
        // when the tab bar is stuck to the top, bring the new section's start up under it
        const bar = $('#tabs'), pane = document.getElementById('p-' + name);
        if (bar.getBoundingClientRect().top <= 1) window.scrollTo({ top: window.scrollY + pane.getBoundingClientRect().top - bar.offsetHeight });
      }
      U.hideTip();
    };
    for (const t of tabs) t.addEventListener('click', () => show(t.dataset.tab, true));
    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    show(location.hash.slice(1));
    OT.showTab = (n) => show(n, true);

    $('#kick').textContent = `Origins TCG · client ${R.game.client} · ${R.made}`;
    $('#lede').textContent = `Every real top list and a deck search for each of the ${legs.length} Legendaries, played by bots on the rules read from the game files, then checked against what real players did on the ladder and in the Crimson Cup.`;
    const tiles = $('#tiles');
    const tile = (lab, big, sub, txt) => h('div', { class: 'tile' }, h('div', { class: 'lab', text: lab }), h('b', { class: txt ? 'txt' : null, text: big }), h('p', { text: sub }));
    tiles.append(
      tile('Best deck', legBy[pick.legend].name, `${pct(pick.field)} of games won against the decks on the ladder now, with ${isSearch(pick) ? 'the list found by the deck search' : label(pick)}`, true),
      tile('Games simulated', num(R.games), `on the rules of client ${R.game.client}, read from the game files`),
      tile('Lists tested', num(R.reals + (R.searchDecks || 0)), `${R.reals} real lists and ${num(R.searchDecks || 0)} drawn by the deck search`),
      tile('Simulator against real ladder', calBest ? 'r = ' + calBest.pearson.toFixed(2) : 'n/a', calBest ? `Legendary win rates, ${calBest.games.toLocaleString('en-US')} real October matches` : 'no real data loaded'));
    $('#foot').textContent = `Made ${R.made} for the patch of 4 Nov 2026 (client ${R.game.client}, data version ${R.game.data}). ${num(R.games)} simulated games. The engine, the bots and every script are in the site's repository under origins/ and tools/origins/.`;
  })();

  // ---------------------------------------------------------------- verdict
  (function verdict() {
    const L = legBy[pick.legend];
    $('#v-sub').textContent = `For the patch of 4 Nov 2026. The next balance patch is expected on ${R.nextPatch} and can change the answer.`;

    // the pick
    const [lo, hi] = ivl(pick);
    let worst = null;
    for (const r of reps) if (r.key !== pick.key && (!worst || R.wr[pick.i][r.i] < worst.p)) worst = { d: r, p: R.wr[pick.i][r.i] };
    const bestReal = L.bestReal ? byKey[L.bestReal] : null;
    const facts = h('dl', { class: 'facts' },
      h('div', null, h('dt', { text: 'Against the ladder' }), h('dd', null, pct(pick.field), h('small', { text: `95% interval ${pct(lo)} to ${pct(hi)}` }))),
      L.now ? h('div', null, h('dt', { text: 'Its Legendary, real ladder' }), h('dd', null, L.now[0].toFixed(1) + '%', h('small', { text: `${L.now[1]} real games this patch` }))) : null,
      worst ? h('div', null, h('dt', { text: 'Hardest opponent' }), h('dd', null, pct(worst.p, 0), h('small', { text: 'against ' + label(worst.d) }))) : null);
    const left = h('div', null, h('h4', { text: 'Play this' }), h('div', { class: 'big', text: isSearch(pick) ? L.name : label(pick) }),
      h('p', { class: 'by', text: isSearch(pick) ? `With the 12 cards found by the deck search${R.search[pick.legend] && R.search[pick.legend].refine && R.search[pick.legend].refine.changed ? ', then improved one card at a time on paired games' : ''}. In the charts this list is called ${label(pick)}.` : `${pick.name}, by ${pick.author}. ${SOURCE[pick.source]}. Legendary: ${L.name}.` }),
      h('p', { style: 'margin:0 0 16px;font-size:.94rem;color:var(--ink-2)' }, h('b', { text: 'Power. ' }), L.power), facts);
    const right = h('div', null, h('h4', { text: 'The 25 cards: the Legendary once, the 12 others twice' }),
      U.cardGrid([pick.legend].concat(pick.cards), (id) => ({ cls: bestReal && isSearch(pick) && id !== pick.legend && !bestReal.cards.includes(id) ? 'in' : '' })));
    const safe = $('#pick2');
    if (isSearch(pick) && bestReal) {
      const out = bestReal.cards.filter((c) => !pick.cards.includes(c));
      const gain = pick.field - bestReal.field, seG = Math.sqrt(pick.se * pick.se + bestReal.se * bestReal.se);
      right.append(h('p', { class: 'cap' }, `Blue edge: the ${12 - common(pick.cards, bestReal.cards)} cards that are not in the best real list. They replace ${out.map(cname).join(', ')}.`));
      const [l2, h2] = ivl(bestReal);
      safe.hidden = false;
      clear(safe).append(
        h('div', null, h('h4', { text: 'The proven version' }), h('div', { class: 'big', style: 'font-size:clamp(1.2rem,4vw,1.5rem)', text: label(bestReal) }),
          h('p', { class: 'by', text: `${bestReal.name}, by ${bestReal.author}. ${SOURCE[bestReal.source]}.` + (bestReal.self ? ` Its author reports ${bestReal.self[0]}% over ${bestReal.self[1]} games.` : '') }),
          h('p', { style: 'margin:0 0 16px;font-size:.94rem;color:var(--ink-2)', text: `The searched list has never been played by a person, as far as the public lists show, and it was tuned against bots. This is the best list that real players already win with. The searched list is ahead of it by ${(100 * gain).toFixed(1)} points (±${(196 * seG).toFixed(1)}), ${gain > 1.96 * seG ? 'a clear gap in the simulator' : 'which is inside the margin of error'}.` }),
          h('dl', { class: 'facts' }, h('div', null, h('dt', { text: 'Against the ladder' }), h('dd', null, pct(bestReal.field), h('small', { text: `95% interval ${pct(l2)} to ${pct(h2)}` }))),
            h('div', null, h('dt', { text: 'Shared with the pick' }), h('dd', null, `${common(pick.cards, bestReal.cards)} of 12`, h('small', { text: 'cards' }))))),
        h('div', null, h('h4', { text: 'Its 12 cards, two copies each' }), U.cardGrid(bestReal.cards, (id) => ({ cls: pick.cards.includes(id) ? '' : 'in' })), h('p', { class: 'cap', text: 'Blue edge: not in the searched list.' })));
    } else if (!isSearch(pick) && R.search[pick.legend] && R.search[pick.legend].key && R.search[pick.legend].key !== pick.key) {
      const sd = byKey[R.search[pick.legend].key];
      if (sd) right.append(h('p', { class: 'cap' }, `The deck search found ${label(sd)} at ${pct(sd.field)}: inside the margin of this list, so the list real players already win with stays the pick.`));
    }
    clear($('#pick')).append(left, right);

    const elig = R.pick.eligible.map((id) => SHORT[id]).join(', ');
    const top = byKey[R.pick.simTop];
    const topCal = R.calNow.rows.find((r) => r.legend === top.legend), over = !!(topCal && topCal.sim - topCal.real > 5);      // real lists of that Legendary do better here than on the ladder
    $('#v-rule').textContent = `How the winner is named: the list with the best simulated win rate against the ladder field, among the Legendaries that also win more than half of their real ladder games this patch (${elig}). The simulator and the ladder have to agree.` +
      (top.key !== pick.key ? ` The simulator's own number one is ${label(top)} at ${pct(top.field)}, but ${legBy[top.legend].now ? `${SHORT[top.legend]} sits at ${legBy[top.legend].now[0].toFixed(1)}% on the real ladder` : `${SHORT[top.legend]} has no real ladder games to check it against`}${over ? ' and is a Legendary the simulator rates too high' : ''}${isSearch(top) ? ', and nobody has played that list' : ''}.` : '');

    // ranking
    const drawRank = (mode) => {
      const rows = (mode === 'top' ? ranked.slice(0, 14) : mode === 'best' ? reps : mode === 'real' ? ranked.filter((d) => !isSearch(d)).slice(0, 14) : ranked);
      const list = rows.includes(pick) || mode === 'best' || mode === 'real' ? rows : rows.concat([pick]);
      const mark = mode === 'real' && isSearch(pick) && bestReal ? bestReal.key : pick.key;        // among real lists only, the proven version of the pick
      U.dots($('#rank'), list.map((d) => {
        const [a, b] = ivl(d);
        return { name: label(d), sub: d.source === 'ladder' ? SHORT[d.legend] : '', tag: isSearch(d) ? 'search' : null, em: d.key === mark, a: d.field, lo: a, hi: b, val: pct(d.field),
          tip: () => ({ title: isSearch(d) ? label(d) : d.name, rows: [['Against the ladder field', pct(d.field)], ['95% interval', pct(a) + ' to ' + pct(b)], ['Against all lists, unweighted', pct(d.flat)], ['Share of the equilibrium mix', pct(d.nash, 0)], ['Legendary', SHORT[d.legend]]],
            note: isSearch(d) ? 'Found by the deck search.' : `${SOURCE[d.source]} by ${d.author}.` + (d.self ? ` Its author reports ${d.self[0]}% over ${d.self[1]} games.` : '') }) };
      }), U.axisFor(list.flatMap((d) => ivl(d))));
    };
    drawRank('top');
    U.bindSeg($('#rank-seg'), drawRank);
    $('#rank-cap').textContent = `Field: ${R.field.label} (${num(R.field.games)} real games). Every pair of lists played ${R.perPair} games with the standard bot, ${num(decks.length * (decks.length - 1) / 2 * R.perPair)} games in all. The blue mark is the pick${isSearch(pick) && bestReal ? ', or its proven version when only real lists are shown' : ''}. The equilibrium mix is what would be left if everybody picked the best answer to everybody else.`;
    $('#rank-tbl').append(U.table([
      { t: '#', n: true, f: (d) => ranked.indexOf(d) + 1 }, { t: 'List', f: (d) => h('span', null, label(d), isSearch(d) ? h('span', { class: 'tag', text: 'search' }) : null) }, { t: 'Legendary', f: (d) => SHORT[d.legend] },
      { t: 'Against the ladder', n: true, f: (d) => pct(d.field) }, { t: '±', n: true, f: (d) => (196 * d.se).toFixed(1) }, { t: 'Against all lists', n: true, f: (d) => pct(d.flat) }, { t: 'Equilibrium share', n: true, f: (d) => pct(d.nash, 0) },
      { t: 'Author says', n: true, f: (d) => (d.self ? `${d.self[0]}% of ${d.self[1]}` : null) }], ranked, { mark: (d) => d.key === pick.key }));

    // three sources
    const rows = legs.filter((l) => l.best).sort((a, b) => b.bestP - a.bestP);
    const found = (l) => (R.search[l.id] && R.search[l.id].key ? byKey[R.search[l.id].key] : null);        // the searched list of that Legendary, when it is in the round robin
    $('#src-tbl').append(U.table([
      { t: 'Legendary', f: (l) => SHORT[l.id] },
      { t: 'Simulation, best real list', n: true, f: (l) => (l.bestRealP != null ? pct(l.bestRealP) : null) },
      { t: 'Simulation, searched list', n: true, f: (l) => (found(l) ? pct(found(l).field) : null) },
      { t: 'Real ladder now', n: true, f: (l) => (l.now ? h('span', null, l.now[0].toFixed(1) + '% ', h('small', { text: `of ${l.now[1]}` })) : null) },
      { t: 'Tier list', n: true, f: (l) => l.tier },
      { t: 'Cup: share of decks', n: true, f: (l) => (l.cup ? l.cup[0].toFixed(1) + '%' : null) },
      { t: 'Cup: banned', n: true, f: (l) => (l.cup ? l.cup[1].toFixed(1) + '%' : null) },
      { t: 'Ladder in October', n: true, f: (l) => (l.vault ? h('span', null, l.vault[0].toFixed(1) + '% ', h('small', { text: `of ${num(l.vault[1])}` })) : null) }], rows, { mark: (l) => l.id === pick.legend }));
    $('#src-cap').textContent = `Simulation: win rate against the ladder field, for the best list real players have published and for the list the deck search found. Only the first of the two can be checked against what real players do. Real ladder now: ${R.field.label}. Tier list: ${R.tiers.label}. Cup: ${R.cup.label}, ${num(R.cup.decks)} decks brought, with how often each Legendary was banned when brought. October: Origins Vault, 30 days of ladder games on the previous patch. A dash means the source has no number for that Legendary.`;

    // trust
    const trust = $('#trust');
    const card = (t, p) => h('div', { class: 'card' }, h('h3', { text: t }), h('p', { text: p }));
    if (cal.length) {
      const all = cal.flatMap((c) => c.rows.map((r) => ({ legend: r.legend, d: r.sim - r.real, n: r.games })));
      const mean = {};
      for (const r of all) (mean[r.legend] = mean[r.legend] || []).push(r.d);
      const lean = Object.keys(mean).map((k) => ({ k, d: mean[k].reduce((a, b) => a + b, 0) / mean[k].length })).sort((a, b) => b.d - a.d);
      const hiL = lean[0], loL = lean[lean.length - 1];
      trust.append(card('It follows the real ladder, loosely', `On the October patch, where real data is plentiful, the simulated Legendary win rates line up with the ladder at r = ${cal.map((c) => c.pearson.toFixed(2)).join(' and ')} across two trackers. The average miss is ${cal.map((c) => c.gap.toFixed(0)).join(' to ')} points per Legendary.`),
        card('It has a known lean', `It rates ${SHORT[hiL.k]} ${Math.round(hiL.d)} points above its real results and ${SHORT[loL.k]} ${Math.round(-loL.d)} points below. Decks that win by filling the board are easier for a bot to pilot than decks that win by timing. That is why the pick has to be confirmed by the real ladder.`));
    }
    const b = R.bots && R.bots['std-fast'];
    let third = b ? `With the same lists, the bot that plans against the opponent's likely plays beats the one that only looks at its own board ${pct(b.p, 0)} of the time. Every number on this page comes from the planning bot.` : 'Every number on this page comes from a bot that plans against the opponent\'s likely plays.';
    if (R.strong) {
      const iP = R.strong.keys.indexOf(pick.key);
      const order = R.strong.keys.map((k, i) => i).sort((x, y) => R.strong.avg[y] - R.strong.avg[x]);
      if (iP >= 0) third += ` Replayed with a stronger bot, the pick comes ${['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][order.indexOf(iP)] || 'lower'} of ${R.strong.keys.length} best lists (${pct(R.strong.avg[iP])} against ${pct(R.strong.std[iP])} with the standard bot).`;
    }
    trust.append(card('The pilot matters', third));

    // tournament trio
    const T = R.trio;
    if (!T || !T.byField.length) { $('#trio-blk').hidden = true; return; }
    const best = T.byField[0];
    const eq = T.byNash.filter((t) => t.nash > 0.03);
    const trio = clear($('#trio'));
    trio.append(h('h4', { text: 'Bring these three' }), h('div', { class: 'cards', style: 'margin-bottom:12px' }, best.decks.map((k) => { const d = byKey[k]; return h('div', { class: 'chip leg' }, h('span', { class: 'cost', text: D.CARDS[d.legend].cost }), h('span', { class: 'nm', text: label(d) })); })),
      h('p', { style: 'margin:0 0 12px' }, `This line-up wins ${pct(best.field)} of its matches against a field of line-ups drawn with the Crimson Cup's deck shares. ` +
        (eq.length ? `If every player picked the best answer to every other, the line-ups left would be ${eq.map((t) => t.legends.map((l) => SHORT[l]).join(' + ') + ' (' + pct(t.nash, 0) + ')').join(', ')}.` : '')),
      h('div', { class: 'tbl' }, U.table([{ t: 'Line-up', f: (t) => t.decks.map((k) => label(byKey[k])).join(' + ') }, { t: 'Against the cup field', n: true, f: (t) => pct(t.field) }, { t: 'Against the equilibrium', n: true, f: (t) => pct(t.vsNash) }], T.byField.slice(0, 6), { mark: (t) => t === best })),
      h('p', { class: 'cap', text: `${T.n} line-ups compared: one list per Legendary, the best one of the study. Each match value includes both bans and the choice of deck for every game. The real champion's line-up was Van Helsing, Legion and Pigs.` }));
  })();

  // ---------------------------------------------------------------- Legendaries
  (function legends() {
    const withReal = legs.filter((l) => l.now && l.mean != null).sort((a, b) => b.now[0] - a.now[0]);
    const without = legs.filter((l) => !(l.now && l.mean != null));
    $('#lg-sub').textContent = `The real number is every player and every list of that Legendary on the ladder this patch (${num(R.field.games)} games). The simulated number is the average of the real lists collected for it, all played by the same bot. Where the two marks sit close, the simulator and the ladder agree.`;
    U.dots($('#agree'), withReal.map((l) => ({ name: SHORT[l.id], sub: l.lists + (l.lists === 1 ? ' list' : ' lists'), a: l.mean, b: l.now[0] / 100, val: `${l.now[0].toFixed(0)} / ${(100 * l.mean).toFixed(0)}`, label: `${l.name}: real ${l.now[0]}%, simulated ${(100 * l.mean).toFixed(0)}%`,
      tip: () => ({ title: l.name, rows: [['Real ladder', `${l.now[0].toFixed(1)}% of ${l.now[1]} games`], ['Simulation, average', pct(l.mean)], ['Simulation, best list', pct(l.bestRealP)], ['Gap', pts(l.mean - l.now[0] / 100) + ' points']], note: `${l.lists} real ${l.lists === 1 ? 'list' : 'lists'} collected. Tier ${l.tier || 'not listed'}.` }) })),
    Object.assign(U.axisFor(withReal.flatMap((l) => [l.mean, l.now[0] / 100])), { two: true }));
    $('#agree-cap').textContent = `Right column: real / simulated, in percent. Across these Legendaries r = ${R.calNow.pearson.toFixed(2)} and the average gap is ${R.calNow.gap.toFixed(0)} points. Real samples are small this patch (${Math.min(...withReal.map((l) => l.now[1]))} to ${Math.max(...withReal.map((l) => l.now[1]))} games per Legendary), so the real marks carry several points of noise themselves.` +
      (without.length ? ` ${without.map((l) => l.name).join(' and ')} ${without.length > 1 ? 'have' : 'has'} no ladder data and no public list this patch, so ${without.length > 1 ? 'they only appear' : 'it only appears'} in the deck search.` : '');
    $('#agree-tbl').append(U.table([{ t: 'Legendary', f: (l) => l.name }, { t: 'Real ladder', n: true, f: (l) => l.now[0].toFixed(1) + '%' }, { t: 'Real games', n: true, f: (l) => l.now[1] }, { t: 'Simulation, average', n: true, f: (l) => pct(l.mean) },
      { t: 'Simulation, best list', n: true, f: (l) => pct(l.bestRealP) }, { t: 'Lists', n: true, f: (l) => l.lists }, { t: 'Gap', n: true, f: (l) => pts(l.mean - l.now[0] / 100) }], withReal));

    // matchups between one list of each Legendary: the best of the study, or the best that real players published
    const drawHeat = (mode) => {
      const from = mode === 'real' ? legs.filter((l) => l.bestReal).map((l) => byKey[l.bestReal]).sort((a, b) => b.field - a.field) : reps;
      const items = from.map((d) => ({ name: label(d), short: TINY[d.legend], d }));
      U.heat($('#heat'), items, (i, j) => R.wr[items[i].d.i][items[j].d.i], (i, j, p) => ({ title: `${label(items[i].d)} against ${label(items[j].d)}`, rows: [[SHORT[items[i].d.legend] + ' wins', pct(p)], ['Games', String(R.perPair)], ['95% interval', '±' + (196 * Math.sqrt(p * (1 - p) / R.perPair)).toFixed(0) + ' points']] }));
      clear($('#heat-tbl')).append(U.table([{ t: 'Row against column', f: (it) => it.short }].concat(items.map((c, j) => ({ t: c.short, n: true, f: (it) => (it === c ? null : Math.round(100 * R.wr[it.d.i][items[j].d.i])) }))), items));
      const none = legs.filter((l) => !l.bestReal).map((l) => SHORT[l.id]);
      $('#heat-cap').textContent = mode === 'real'
        ? `The best published list of each Legendary, the way people play them now${none.length ? ` (${none.join(' and ')} ${none.length > 1 ? 'have' : 'has'} none)` : ''}. Each cell is ${R.perPair} games, so it is good to about ${Math.round(98 / Math.sqrt(R.perPair))} points.`
        : `The best list of the study for each Legendary${reps.some(isSearch) ? ', which is the searched one wherever the search beat the real lists' : ''}. Each cell is ${R.perPair} games, so it is good to about ${Math.round(98 / Math.sqrt(R.perPair))} points.`;
    };
    drawHeat('best');
    U.bindSeg($('#heat-seg'), drawHeat);
    U.ramp($('#hm-ramp'));
    $('#hm-steps').textContent = `Steps at ${U.STEPS.map((s) => Math.round(100 * s)).join(', ')} points from 50%`;

    const order = legs.slice().sort((a, b) => (b.bestP || 0) - (a.bestP || 0));
    $('#lg-tbl').append(U.table([
      { t: 'Legendary', f: (l) => h('span', null, h('b', { text: l.name }), h('br'), h('small', { text: `${D.CARDS[l.id].cost} mana` + (D.CARDS[l.id].p != null ? `, ${D.CARDS[l.id].p}/${D.CARDS[l.id].h}` : '') })) },
      { t: 'Power (from the first round)', w: 170, f: (l) => l.power.replace(/^Game Start: /, '') },
      { t: 'The card', w: 230, f: (l) => D.CARDS[l.id].text },
      { t: 'Best list, simulated', n: true, f: (l) => (l.bestP != null ? pct(l.bestP) : null) },
      { t: 'Real ladder', n: true, f: (l) => (l.now ? l.now[0].toFixed(1) + '%' : null) },
      { t: 'Tier', n: true, f: (l) => l.tier }], order, { mark: (l) => l.id === pick.legend }));
  })();

  // ---------------------------------------------------------------- deck lab
  (function lab() {
    const S = R.search || {};
    const n = Object.keys(S).length;
    $('#lab-sub').textContent = n ? `For each Legendary a search drew lists from the whole pool of ${D.POOL.length} cards (${num(R.searchDecks)} different lists in all), kept what won, then raced the leaders and the one-card changes of the best one with the cards the search still rated against the top ladder lists: ${num(R.searchGames)} games. The real lists race too, so a searched list is only shown when it beat them. The search sees the game through the bots, which play board decks better than waiting decks, so read a searched list as the best list in their hands.` :'The deck search has not run yet: the real lists are shown.';
    const order = legs.slice().sort((a, b) => (b.bestP || 0) - (a.bestP || 0));
    let cur = pick.legend;
    const draw = () => {
      const L = legBy[cur], s = S[cur];
      const best = L.best ? byKey[L.best] : null, bestReal = L.bestReal ? byKey[L.bestReal] : null;
      const found = s && s.key ? byKey[s.key] : null;
      const main = found || best;
      const box = clear($('#lab-best'));
      if (!main) { box.append(h('h3', { text: L.name }), h('p', { class: 'sub', text: 'No list for this Legendary yet.' })); }
      else {
        const [a, b] = ivl(main);
        box.append(h('h4', { text: found && !s.real ? 'Best list found by the search' : found ? 'The search ended on a real list' : 'Best real list' }), h('h3', { style: 'font-size:1.3rem;margin-bottom:4px' }, label(main)),
          h('p', { class: 'sub', style: 'margin-bottom:12px' }, `${pct(main.field)} against the ladder field (95% interval ${pct(a)} to ${pct(b)}) in the final round robin.` + (found && !s.real && bestReal ? ` Best real list: ${label(bestReal)} at ${pct(bestReal.field)}.` : '')),
          U.cardGrid([cur].concat(main.cards), (id) => ({ cls: found && !s.real && bestReal && id !== cur && !bestReal.cards.includes(id) ? 'in' : '' })));
        if (found && !s.real && bestReal) {
          const out = bestReal.cards.filter((c) => !main.cards.includes(c));
          box.append(h('p', { class: 'cap', text: `Blue edge: not in ${label(bestReal)}. Left out of it: ${out.length ? out.map(cname).join(', ') : 'nothing'}.` }));
        }
        if (s && s.runners && s.runners.length) {
          const moved = !!(s.refine && s.refine.changed), own = moved ? s.refine.start : s.cards;      // own: the list the search itself ended on
          const ru = s.runners[0];
          const diffIn = ru.cards.filter((c) => !own.includes(c)), diffOut = own.filter((c) => !ru.cards.includes(c));
          box.append(h('p', { class: 'cap', text: (moved ? `The search itself ended on ${own.filter((c) => !s.cards.includes(c)).map(cname).join(', ')} where this list has ${s.cards.filter((c) => !own.includes(c)).map(cname).join(', ')}: the test below made the change. ` : '')
            + `Runner-up of the search: ${diffIn.length ? diffIn.map(cname).join(', ') + ' in place of ' + diffOut.map(cname).join(', ') : 'the same list'} (${pct(ru.p)} against ${pct(s.p)} for ${moved ? 'its own' : 'the'} winner in the last race, ${num(ru.games)} games each). ${s.deeper ? 'This Legendary got a second, deeper pass.' : ''}` }));
        }
      }
      const odds = clear($('#lab-odds'));
      if (s) {
        odds.append(h('h4', { text: 'What the search kept' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'How often each card was in the lists the search drew at its end. Blue cards made the final list.' }));
        const m = h('div');
        U.meters(m, s.table.slice(0, 20).map(([id, p]) => ({ name: cname(id), v: p, on: s.cards.includes(id), val: pct(p, 0), tip: () => { const t = U.cardTip(id); t.rows.push(['Kept by the search', pct(p, 0)]); return t; } })), 1);
        odds.append(m);
      } else odds.append(h('h4', { text: 'What the search kept' }), h('p', { class: 'sub', text: 'No search result for this Legendary.' }));
      // every one-card change of the search's list, tested
      const rbox = clear($('#lab-refine')), rf = s && s.refine;
      rbox.hidden = !rf;
      if (rf) {
        const rounds = rf.passes.filter((p) => p.confirm.length);
        const conf = rounds.flatMap((p, i) => p.confirm.map((c) => ({ c, round: i + 1, adopted: !!(p.adopted && p.adopted.in === c.in && p.adopted.out === c.out) })));
        const first = rf.passes.flatMap((p) => p.first);
        const nm = (c) => `${cname(c.in)} for ${cname(c.out)}`;
        const adopted = conf.filter((x) => x.adopted).map((x) => nm(x.c));
        rbox.append(h('h3', { text: 'Would one card change make it better?' }),
          h('p', { class: 'sub', style: 'margin-bottom:14px', text: `Every other card of the pool went into every slot of the search's list: ${num(rf.screen.lists)} lists, ${num(rf.screen.games)} games with the fast bot. The ${first.length} most promising changes then played the standard bot on the same seeds as the list, and the best of them were tested again on fresh games${rounds.length > 1 ? `, in ${rounds.length} rounds` : ''}.${adopted.length && rounds.length > 1 ? ' Once a change is adopted, the ones still waiting are measured against the new list.' : ''} A change takes the place of the card it replaces in the deck, so both lists start every game from the same shuffle with only that one card different, which takes part of the luck out of the comparison.` }));
        if (conf.length) {
          const span = Math.max(0.04, Math.ceil(50 * Math.max(...conf.map((x) => Math.abs(x.c.gain) + 1.96 * x.c.se))) / 50);
          const ticks = [];
          for (let t = -span; t <= span + 1e-9; t += 0.02) ticks.push(+t.toFixed(2));
          const d = h('div', { class: 'dots' });
          U.dots(d, conf.map((x) => ({ name: nm(x.c), sub: rounds.length > 1 ? 'round ' + x.round : null, tag: x.adopted ? 'adopted' : null, a: x.c.gain, lo: x.c.gain - 1.96 * x.c.se, hi: x.c.gain + 1.96 * x.c.se, em: x.adopted, val: pts(x.c.gain),
            label: `${nm(x.c)}: ${pts(x.c.gain)} points${x.adopted ? ', adopted' : ''}`,
            tip: () => ({ title: nm(x.c), rows: [['Gain over the list', pts(x.c.gain) + ' points'], ['95% interval', `${pts(x.c.gain - 1.96 * x.c.se)} to ${pts(x.c.gain + 1.96 * x.c.se)}`], ['Games each', num(x.c.games)], ['Standard errors away from zero', x.c.z.toFixed(1)]].concat(rounds.length > 1 ? [['Round', String(x.round)]] : []),
              note: x.adopted ? 'Adopted: the list above includes it.' : '' }) })),
          { lo: -span - 0.004, hi: span + 0.004, ticks, ref: 0, fmt: (t) => (t === 0 ? '0' : pts(t, 0)), minor: (t) => Math.round(100 * t) % 4 !== 0 });
          rbox.append(d);
        }
        const weak = rf.screen.slots.slice(0, 3).map((x) => cname(x.id)).join(', '), bench = rf.screen.ins.slice(0, 5).map((x) => cname(x.id)).join(', ');
        rbox.append(h('p', { class: 'cap', text: (conf.length ? `Gain of each change over the list it was tested against, in points of win rate against the search field, with its 95% interval (${num(conf[0].c.games)} games each). In each round only the best change can be adopted, and only when its gain is more than ${rf.z} standard errors. ` : 'None of the changes gained in the first test, so none went further. ')
          + (adopted.length ? `Adopted: ${adopted.join(', then ')}. The list above includes ${adopted.length > 1 ? 'them' : 'it'}.` : 'No change is clearly better: the list stands as the search left it.')
          + ` In the first pass, at ${num(rf.screen.perList)} games per list with the fast bot, the cards the list would miss least were ${weak}, and the best cards left out were ${bench}.` }));
        rbox.append(h('details', null, h('summary', { text: 'Show as a table' }),
          conf.length ? h('div', { class: 'tbl' }, U.table([{ t: 'Round', n: true, f: (x) => x.round }, { t: 'Change', f: (x) => nm(x.c) }, { t: 'Gain on fresh games', n: true, f: (x) => pts(x.c.gain) }, { t: '±', n: true, f: (x) => (196 * x.c.se).toFixed(1) }, { t: 'Games', n: true, f: (x) => num(x.c.games) },
            { t: 'Result', f: (x) => (x.adopted ? 'adopted' : '') }], conf)) : null,
          h('h4', { style: 'margin-top:14px', text: 'First test of the shortlist' }),
          h('div', { class: 'tbl' }, U.table([{ t: 'Change', f: (x) => nm(x) }, { t: 'Gain', n: true, f: (x) => pts(x.gain) }, { t: '±', n: true, f: (x) => (196 * x.se).toFixed(1) }, { t: 'Games', n: true, f: (x) => num(x.games) }], first.slice().sort((a, b) => b.gain - a.gain)))));
      }
      const lists = decks.filter((d) => d.legend === cur).sort((x, y) => y.field - x.field);
      clear($('#lab-lists')).append(h('h4', { text: `Every ${SHORT[cur]} list in the study` }), h('div', { class: 'tbl' }, U.table([
        { t: 'List', f: (d) => h('span', null, isSearch(d) ? label(d) : d.name, isSearch(d) ? h('span', { class: 'tag', text: 'search' }) : null) }, { t: 'From', w: 120, f: (d) => (isSearch(d) ? 'Deck search' : `${d.author}, ${SOURCE_LC[d.source]}`) },
        { t: 'Against the ladder', n: true, f: (d) => pct(d.field) }, { t: '±', n: true, f: (d) => (196 * d.se).toFixed(1) }, { t: 'Author says', n: true, f: (d) => (d.self ? `${d.self[0]}% of ${d.self[1]}` : null) },
        { t: 'Cards', w: 300, f: (d) => h('small', { text: d.cards.slice().sort(U.byCost).map(cname).join(', ') }) }], lists, { mark: (d) => main && d.key === main.key })));
    };
    U.seg($('#lab-seg'), order.map((l) => ({ v: l.id, t: SHORT[l.id] })), cur, (v) => { cur = v; draw(); });
    draw();

    // card ratings
    const CR = R.cardRatings.filter((c) => c.n >= 1500);
    const plain = CR.filter((c) => !D.CARDS[c.id].leg);
    const drawCR = (mode) => {
      const rows = mode === 'all' ? CR : plain.slice(0, 12).concat(plain.slice(-12));
      const span = Math.max(...CR.map((c) => Math.abs(c.drawn)));
      U.divs($('#cr'), rows.map((c) => ({ name: D.CARDS[c.id].leg ? (SHORT[c.id] || cname(c.id)) + ' ★' : cname(c.id), v: c.drawn, val: pts(c.drawn),
        tip: () => { const t = U.cardTip(c.id); t.rows.push(['Lists playing it', String(c.decks)], ['Games where it was drawn', num(c.n)], ['Win rate when drawn', pts(c.drawn) + ' points'], ['In the opening hand', c.opening == null ? 'n/a' : pts(c.opening) + ' points']); return t; } })), span);
    };
    drawCR('top');
    U.bindSeg($('#cr-seg'), drawCR);
    $('#cr-cap').textContent = `Blue to the right: the deck wins more when it draws this card than when it draws its average card. Red to the left: it wins less. In points of win rate, over the ${num(decks.length * (decks.length - 1) / 2 * R.perPair)} games of the round robin. The Legendary cards are in the full list, with a star: every one of them rates above the average card of its deck. Cards seen in fewer than 1,500 games are left out.`;
    $('#cr-tbl').append(U.table([{ t: 'Card', f: (c) => cname(c.id) }, { t: 'Cost', n: true, f: (c) => D.CARDS[c.id].cost }, { t: 'Lists', n: true, f: (c) => c.decks }, { t: 'Games drawn', n: true, f: (c) => num(c.n) },
      { t: 'When drawn', n: true, f: (c) => pts(c.drawn) }, { t: 'In the opening hand', n: true, f: (c) => (c.opening == null ? null : pts(c.opening)) }], CR));

    // builder
    const fieldOpps = decks.filter((d) => d.w > 0).map((d) => ({ key: d.key, legend: d.legend, cards: d.cards, w: d.w }));
    const st = { legend: pick.legend, cards: new Set(pick.cards), filter: '', cost: 'all', bot: 'std', n: 10, running: false };
    const B = clear($('#builder'));
    const selLeg = h('select', { 'aria-label': 'Legendary' }, D.LEGENDS.slice().sort((a, b) => SHORT[a].localeCompare(SHORT[b])).map((id) => h('option', { value: id, text: D.CARDS[id].name })));
    const selFrom = h('select', { 'aria-label': 'Start from a list' }, h('option', { value: '', text: 'Start from a list…' }), ranked.map((d) => h('option', { value: d.key, text: `${label(d)} (${pct(d.field, 0)})` })));
    const inp = h('input', { type: 'text', placeholder: 'Filter cards', 'aria-label': 'Filter cards', style: 'width:11em' });
    const costSeg = h('div', { class: 'seg' }), botSeg = h('div', { class: 'seg' }), nSeg = h('div', { class: 'seg' });
    const count = h('h4'), chosen = h('div', { class: 'cards', style: 'margin-bottom:14px' }), pool = h('div', { class: 'cards' });
    const run = h('button', { class: 'btn', type: 'button', text: 'Run' }), stop = h('button', { class: 'btn ghost', type: 'button', text: 'Stop', hidden: true });
    const prog = h('div', { class: 'prog', hidden: true }, h('i')), out = h('div', { class: 'out', 'aria-live': 'polite' });
    const drawB = () => {
      selLeg.value = st.legend;
      count.textContent = `${SHORT[st.legend]} plus ${st.cards.size} of 12 cards`;
      clear(chosen).append(...[...st.cards].sort(U.byCost).map((id) => { const c = U.chip(id, { button: true, right: '×' }); c.setAttribute('aria-label', 'Remove ' + cname(id)); c.addEventListener('click', () => { st.cards.delete(id); drawB(); }); return c; }));
      const f = st.filter.toLowerCase();
      const ids = D.POOL.filter((id) => { const c = D.CARDS[id]; if (f && !(c.name.toLowerCase().includes(f) || (c.text || '').toLowerCase().includes(f))) return false; return st.cost === 'all' || (st.cost === '6' ? c.cost >= 6 : st.cost === '1' ? c.cost <= 1 : c.cost === +st.cost); });
      clear(pool).append(...ids.sort(U.byCost).map((id) => { const c = U.chip(id, { button: true }); c.setAttribute('aria-pressed', String(st.cards.has(id))); c.addEventListener('click', () => { if (st.cards.has(id)) st.cards.delete(id); else if (st.cards.size < 12) st.cards.add(id); drawB(); }); return c; }));
      run.disabled = st.cards.size !== 12 || st.running;
    };
    selLeg.addEventListener('change', () => { st.legend = selLeg.value; drawB(); });
    selFrom.addEventListener('change', () => { const d = byKey[selFrom.value]; if (d) { st.legend = d.legend; st.cards = new Set(d.cards); drawB(); } selFrom.value = ''; });
    inp.addEventListener('input', () => { st.filter = inp.value; drawB(); });
    U.seg(costSeg, [{ v: 'all', t: 'All' }, { v: '1', t: '0-1' }, { v: '2', t: '2' }, { v: '3', t: '3' }, { v: '4', t: '4' }, { v: '5', t: '5' }, { v: '6', t: '6+' }], 'all', (v) => { st.cost = v; drawB(); });
    U.seg(botSeg, [{ v: 'std', t: 'Standard bot' }, { v: 'fast', t: 'Fast bot' }], 'std', (v) => { st.bot = v; });
    U.seg(nSeg, [10, 30, 100].map((v) => ({ v, t: `${num(2 * v * fieldOpps.length)} games` })), 10, (v) => { st.n = v; });
    const finish = () => { st.running = false; stop.hidden = true; prog.hidden = true; drawB(); };
    const report = (tally, done) => {
      const r = U.fieldRate(tally, fieldOpps);
      const groups = {};
      tally.forEach((t, j) => { if (!t.n) return; const g = groups[fieldOpps[j].legend] || (groups[fieldOpps[j].legend] = { w: 0, s: 0, n: 0 }); g.w += fieldOpps[j].w; g.s += fieldOpps[j].w * t.w / t.n; g.n += t.n; });
      clear(out).append(h('div', { class: 'hero' }, pct(r.p), h('small', { text: `±${(196 * r.se).toFixed(1)} points against the ladder field, ${num(r.games)} games${done ? '' : ' so far'}` })),
        h('p', { class: 'cap', text: `In the study the best list reaches ${pct(ranked[0].field)} and the best ${SHORT[st.legend]} list ${legBy[st.legend].bestP != null ? pct(legBy[st.legend].bestP) : 'has no number'}, with the standard bot over ${R.perPair} games per opponent.` }),
        h('div', { class: 'tbl', style: 'margin-top:10px' }, U.table([{ t: 'Against', f: (k) => SHORT[k] + ' lists' }, { t: 'Share of the ladder', n: true, f: (k) => pct(groups[k].w, 0) }, { t: 'Win rate', n: true, f: (k) => pct(groups[k].s / groups[k].w, 0) }, { t: 'Games', n: true, f: (k) => groups[k].n }],
          Object.keys(groups).sort((a, b) => groups[b].w - groups[a].w))));
    };
    run.addEventListener('click', () => {
      if (st.cards.size !== 12) return;
      st.running = true; stop.hidden = false; prog.hidden = false; prog.firstChild.style.width = '0%'; drawB();
      U.Sim.vs({ legend: st.legend, cards: [...st.cards] }, fieldOpps, st.n, st.bot, 1 + Math.floor(Math.random() * 1e6), (tally, frac) => { prog.firstChild.style.width = (100 * frac).toFixed(1) + '%'; report(tally, false); })
        .then((tally) => { report(tally, true); finish(); }, (err) => { clear(out).append(h('p', { class: 'cap', text: 'The simulation stopped: ' + err.message })); finish(); });
    });
    stop.addEventListener('click', () => { U.Sim.stop(); finish(); });
    B.append(h('div', { class: 'row-ctl' }, h('div', { class: 'ctl' }, h('span', { text: 'Legendary' }), selLeg), h('div', { class: 'ctl' }, h('span', { text: 'Load' }), selFrom)),
      count, chosen,
      h('div', { class: 'row-ctl' }, h('div', { class: 'ctl' }, h('span', { text: 'Find a card' }), inp), h('div', { class: 'ctl' }, h('span', { text: 'Cost' }), costSeg)),
      h('details', { open: true }, h('summary', { text: 'Card pool' }), h('div', { style: 'margin-top:10px' }, pool)),
      h('div', { class: 'row-ctl', style: 'margin:18px 0 0' }, h('div', { class: 'ctl' }, h('span', { text: 'Pilot' }), botSeg), h('div', { class: 'ctl' }, h('span', { text: 'Length' }), nSeg), run, stop),
      prog, out);
    drawB();
  })();

  // ---------------------------------------------------------------- play guide
  (function play() {
    const G = R.guides || [];
    const host = $('#pg');
    const sub = $('#pg-sub');
    if (!G.length) { sub.textContent = 'The play guide numbers have not been computed yet.'; }
    else {
      sub.textContent = `What the ${G[0].bot === 'strong' ? 'strong' : 'standard'} bot does with the deck over thousands of games against the strongest ladder lists, and what happens when it is forced to do otherwise. The bot is not a perfect player, but the tests below compare its own choices on the same games, so they stand on their own.`;
      let cur = 0;
      const draw = () => {
        const g = G[cur], d = byKey[g.deck.key] || { legend: g.deck.legend, cards: g.deck.cards, name: g.deck.key, source: 'search' };
        clear(host);
        host.append(h('div', { class: 'three', style: 'margin-bottom:14px' },
          h('div', { class: 'tile' }, h('div', { class: 'lab', text: 'Against the top ladder lists' }), h('b', { text: pct(g.p) }), h('p', { text: `${num(g.games)} games with the ${g.bot === 'std' ? 'standard' : g.bot} bot, ${g.rounds.toFixed(1)} rounds on average.` + (R.searchField && d.field != null ? ` These games are against the ${R.searchField.length} strongest ladder lists only, a harder field than the whole ladder (${pct(d.field)} there).` : '') })),
          h('div', { class: 'tile' }, h('div', { class: 'lab', text: 'Revealing first in round 1' }), h('b', { text: pct(g.first.first) }), h('p', { text: `against ${pct(g.first.second)} when revealing second. Who reveals first alternates every round.` })),
          h('div', { class: 'tile' }, h('div', { class: 'lab', text: 'The list' }), h('b', { class: 'txt', text: byKey[g.deck.key] ? label(byKey[g.deck.key]) : SHORT[g.deck.legend] }), h('p', { text: d.cards.slice().sort(U.byCost).map(cname).join(', ') }))));

        const two = h('div', { class: 'two' });
        if (g.mulligan) {
          const m = h('div'), span = Math.max(0.03, ...g.mulligan.map((x) => Math.abs(x.diff)));
          const sure = (x) => x.se != null && Math.abs(x.diff) > 1.96 * x.se;
          U.divs(m, g.mulligan.map((x) => ({ name: D.CARDS[x.id].leg ? (SHORT[x.id] || cname(x.id)) + ' ★' : cname(x.id), v: x.diff, dim: !sure(x), val: pts(x.diff) + (x.se != null ? ' ±' + (196 * x.se).toFixed(1) : ''),
            tip: () => { const t = U.cardTip(x.id); t.rows.push(['Always kept', pct(x.keep)], ['Always thrown back', pct(x.toss)], ['Keeping it is worth', pts(x.diff) + ' points'], ['95% interval', x.se != null ? '±' + (196 * x.se).toFixed(1) + ' points' : 'n/a'], ['Pairs of games', x.pairs != null ? num(x.pairs) : 'n/a']); return t; } })), span);
          const keepers = g.mulligan.filter((x) => sure(x) && x.diff > 0).map((x) => cname(x.id)), tossers = g.mulligan.filter((x) => sure(x) && x.diff < 0).map((x) => cname(x.id));
          two.append(h('div', { class: 'card' }, h('h3', { text: 'Mulligan: keep or throw back' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'Games where the card is among the first four dealt, each played twice: once keeping it, once throwing it back.' }), m,
            h('p', { class: 'cap', text: `Blue to the right: keeping wins more. Red to the left: throwing it back wins more. In points of win rate, with the 95% margin. Gray bars are not told apart from zero. ` + (keepers.length ? `Keep: ${keepers.join(', ')}. ` : '') + (tossers.length ? `Throw back: ${tossers.join(', ')}. ` : '') + `With ${g.mulligan.length} cards tested, one bar can cross that line by luck, so trust the long ones most. A star marks the Legendary.` })));
        }
        const op = g.opening.filter((o) => o.share > 0.02);
        two.append(h('div', { class: 'card' }, h('h3', { text: 'Opening hand' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'Win rate when the card is in the hand after the mulligan, against the games where it is not.' }),
          h('div', { class: 'tbl' }, U.table([{ t: 'Card', f: (o) => cname(o.id) }, { t: 'In hand', n: true, f: (o) => pct(o.share, 0) }, { t: 'With', n: true, f: (o) => pct(o.with) }, { t: 'Without', n: true, f: (o) => pct(o.without) },
            { t: 'Gap', n: true, f: (o) => h('span', { class: o.with - o.without >= 0 ? 'up' : 'down', text: pts(o.with - o.without) }) }], op))));
        host.append(two);

        host.append(h('div', { class: 'card', style: 'margin-top:14px' }, h('h3', { text: 'What gets played each round' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'The cards the bot plays most in each round, with the share of games where it plays them that round.' }),
          h('div', { class: 'tbl' }, U.table([{ t: 'Round', n: true, f: (r) => r.round }, { t: 'Mana', n: true, f: (r) => Math.min(10, r.round + 1) }, { t: 'Spent on cards', n: true, f: (r) => r.spent.toFixed(1) },
            { t: 'Most played', w: 240, f: (r) => r.plays.slice(0, 5).map((p) => `${cname(p.id)} ${pct(p.rate, 0)}`).join(', ') }, { t: 'Games reaching it', n: true, f: (r) => pct(r.reach, 0) }], g.rounds_))));

        if (g.legendary && g.legendary.length) {
          const never = g.legendary.find((x) => x.round === 0), rows = g.legendary.filter((x) => x.round > 0);
          host.append(h('div', { class: 'card', style: 'margin-top:14px' }, h('h3', { text: `When ${legBy[g.deck.legend] ? legBy[g.deck.legend].name : 'the Legendary'} comes down` }),
            h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'The round in which the Legendary card is played, and how those games end. Early rounds are also the games where it was drawn early, so read this as a description, not as a test.' }),
            h('div', { class: 'tbl' }, U.table([{ t: 'Played in', f: (x) => (x.round ? 'Round ' + x.round : 'Never played') }, { t: 'Share of games', n: true, f: (x) => pct(x.share, 0) }, { t: 'Win rate', n: true, f: (x) => (x.p == null ? null : pct(x.p, 0)) }], rows.concat(never ? [never] : [])))));
        }
        const mu = h('div', { class: 'dots' });
        U.dots(mu, g.matchups.slice().sort((a, b) => b.p - a.p).map((m) => { const o = byKey[m.key]; const se = Math.sqrt(m.p * (1 - m.p) / m.n);
          return { name: o ? label(o) : m.key, a: m.p, lo: m.p - 1.96 * se, hi: m.p + 1.96 * se, val: pct(m.p, 0), em: false,
            tip: () => ({ title: o ? label(o) : m.key, rows: [['Win rate', pct(m.p)], ['Games', String(m.n)], ['Average length', m.rounds.toFixed(1) + ' rounds'], ['Weight in these games', pct(m.w / g.matchups.reduce((a, x) => a + x.w, 0), 0)]] }) }; }),
        U.axisFor(g.matchups.flatMap((m) => { const se = Math.sqrt(m.p * (1 - m.p) / m.n); return [m.p - 1.96 * se, m.p + 1.96 * se]; })));
        const locs = g.locations.filter((l) => l.n >= 40);
        const locRows = locs.slice(0, 5).concat(locs.slice(-5));
        host.append(h('div', { class: 'two', style: 'margin-top:14px' },
          h('div', { class: 'card' }, h('h3', { text: 'Matchups' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'Against each of the top ladder lists, with the 95% interval.' }), mu),
          h('div', { class: 'card' }, h('h3', { text: 'Best and worst locations' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: 'Win rate in the games where the location was on the board.' }),
            h('div', { class: 'tbl' }, U.table([{ t: 'Location', f: (l) => h('span', null, h('b', { text: E.LOC[l.id] ? E.LOC[l.id].name : l.id }), h('br'), h('small', { text: E.LOC[l.id] ? E.LOC[l.id].text : '' })) }, { t: 'Win rate', n: true, f: (l) => pct(l.p, 0) }, { t: 'Games', n: true, f: (l) => l.n }], locRows)))));
      };
      if (G.length > 1) { $('#pg-ctl').hidden = false; U.seg($('#pg-seg'), G.map((g, i) => ({ v: i, t: byKey[g.deck.key] ? label(byKey[g.deck.key]) : g.deck.key })), 0, (v) => { cur = v; draw(); }); }
      draw();
    }
    const b = R.bots || {};
    const rules = [
      ['Plan for their play, not only yours.', b['std-fast'] ? `With the same lists, the bot that picks its round after imagining the opponent's likely round beats the bot that just makes its own board as strong as possible ${pct(b['std-fast'].p, 0)} of the time. No card change in this study is worth that much.` : 'The bot that picks its round after imagining the opponent\'s likely round clearly beats the bot that just makes its own board as strong as possible.'],
      ['Count barriers, not damage.', 'A barrier has 20 health and comes back at 40 after it breaks. The second break loses the game, wherever it happens. Once one of your barriers has gone, the two that still sit at 20 are the ones to guard, and the same is true on the other side.'],
      ['A Defender guards the barrier, not your characters.', 'It only steps in when an enemy character would hit the barrier of its location: it takes that hit and strikes back with its Power. A stunned Defender does not defend, and Trample pushes the damage beyond its health through to the barrier.'],
      ['Cards on the table are safe until they turn up.', 'Cards are placed face down and only work once revealed. A face-down card holds its space and counts as a card in that location, but nothing can target it. Spells can only aim at characters that were already revealed when you planned.'],
      ['Know whether you reveal first.', 'It is random in round 1 and alternates after that. Effects that hit everything on reveal, like Robin Hood or Rain of Arrows, also catch what the opponent played this round only when you reveal second.'],
      ['Snipe and Deathtouch do more than they say.', 'Snipe hits the barrier after every attack, blocked or not, even if the sniper died in the exchange. Deathtouch destroys any character the card damages, with any kind of damage, not only attacks. Shield cancels it.'],
      ['Unspent mana is gone.', 'Mana is 2 in round 1 and grows by 1 a round up to 10, with nothing carried over. A list has to have something to do with its mana every round, which is what the curve of the best lists shows.'],
    ];
    $('#pg-rules').append(...rules.map(([t, p]) => h('li', null, h('b', { text: t + ' ' }), p)));
  })();

  // ---------------------------------------------------------------- simulator
  (function sim() {
    const options = () => legs.slice().sort((a, b) => (b.bestP || 0) - (a.bestP || 0)).filter((l) => l.best).map((l) => h('optgroup', { label: l.name }, decks.filter((d) => d.legend === l.id).sort((a, b) => b.field - a.field).map((d) => h('option', { value: d.key, text: `${label(d)} (${pct(d.field, 0)})` }))));
    const other = reps.find((d) => d.legend !== pick.legend) || pick;

    // deck against deck
    const st = { bot: 'std', n: 30, running: false };
    const a = h('select', { 'aria-label': 'Deck A' }, options()), b = h('select', { 'aria-label': 'Deck B' }, options());
    a.value = pick.key; b.value = other.key;
    const botSeg = h('div', { class: 'seg' }), nSeg = h('div', { class: 'seg' });
    U.seg(botSeg, [{ v: 'std', t: 'Standard bot' }, { v: 'strong', t: 'Strong bot' }, { v: 'fast', t: 'Fast bot' }], 'std', (v) => { st.bot = v; });
    U.seg(nSeg, [{ v: 30, t: '60 games' }, { v: 120, t: '240 games' }, { v: 600, t: '1,200 games' }], 30, (v) => { st.n = v; });
    const run = h('button', { class: 'btn', type: 'button', text: 'Run' }), stop = h('button', { class: 'btn ghost', type: 'button', text: 'Stop', hidden: true });
    const prog = h('div', { class: 'prog', hidden: true }, h('i')), out = h('div', { class: 'out', 'aria-live': 'polite' });
    const finish = () => { st.running = false; run.disabled = false; stop.hidden = true; prog.hidden = true; };
    const show = (t, done) => {
      if (!t.n) return;
      const A = byKey[a.value], B = byKey[b.value], p = t.w / t.n, se = Math.sqrt(p * (1 - p) / t.n);
      clear(out).append(h('div', { class: 'hero' }, pct(p), h('small', { text: `of games won by ${label(A)} against ${label(B)}, ±${(196 * se).toFixed(1)} points over ${num(t.n)} games${done ? '' : ' so far'}` })),
        h('p', { class: 'cap', text: `Average length ${(t.rounds / t.n).toFixed(1)} rounds. In the study: ${A.key === B.key ? 'a mirror match' : pct(R.wr[A.i][B.i]) + ' over ' + R.perPair + ' games with the standard bot'}.` }));
    };
    run.addEventListener('click', () => {
      const A = byKey[a.value], B = byKey[b.value];
      // split the seeds over the workers: the same opponent several times with different seed blocks
      const parts = U.Sim.size();                    // 1 to 6, and every length offered divides by all of them
      const opps = Array.from({ length: parts }, (_, k) => ({ key: 'part' + k, legend: B.legend, cards: B.cards }));
      st.running = true; run.disabled = true; stop.hidden = false; prog.hidden = false; prog.firstChild.style.width = '0%'; clear(out);
      const sum = (tally) => tally.reduce((s, t) => ({ w: s.w + t.w, n: s.n + t.n, rounds: s.rounds + t.rounds }), { w: 0, n: 0, rounds: 0 });
      U.Sim.vs(A, opps, st.n / parts, st.bot, 1 + Math.floor(Math.random() * 1e6), (tally, frac) => { prog.firstChild.style.width = (100 * frac).toFixed(1) + '%'; show(sum(tally), false); })
        .then((tally) => { show(sum(tally), true); finish(); }, (err) => { clear(out).append(h('p', { class: 'cap', text: 'The simulation stopped: ' + err.message })); finish(); });
    });
    stop.addEventListener('click', () => { U.Sim.stop(); finish(); });
    clear($('#duel')).append(h('div', { class: 'row-ctl' }, h('div', { class: 'ctl' }, h('span', { text: 'Deck A' }), a), h('div', { class: 'ctl' }, h('span', { text: 'Deck B' }), b)),
      h('div', { class: 'row-ctl' }, h('div', { class: 'ctl' }, h('span', { text: 'Pilot' }), botSeg), h('div', { class: 'ctl' }, h('span', { text: 'Length' }), nSeg), run, stop), prog, out);

    // watch a game
    const wa = h('select', { 'aria-label': 'Deck A' }, options()), wb = h('select', { 'aria-label': 'Deck B' }, options());
    wa.value = pick.key; wb.value = other.key;
    const seed = h('input', { type: 'number', value: '1', min: '1', step: '1', 'aria-label': 'Seed', style: 'width:7em' });
    const play = h('button', { class: 'btn', type: 'button', text: 'Play the game' });
    const view = h('div');
    const nameOf = (id) => cname(id);
    const fix = (s) => s.replace(/\bP0\b/g, 'A').replace(/\bP1\b/g, 'B');
    const traits = (u) => u.kw.map((k) => U.KW[k]).concat(u.snipe ? ['Snipe ' + u.snipe] : [], u.shield ? ['Shield'] : [], u.stun ? ['Stunned'] : [], u.sil ? ['No abilities'] : []);
    const unit = (u) => {
      if (!u) return h('div', { class: 'unit empty' });
      const tr = traits(u);
      const el = h('div', { class: 'unit' }, h('b', { text: nameOf(u.id) }), h('span', { text: `${u.p}/${u.h}` + (tr.length ? ' ' + tr.map((t) => t[0]).join('') : '') }));
      return U.tip(el, () => ({ title: nameOf(u.id), rows: [['Power / health now', `${u.p} / ${u.h}`]].concat(tr.map((t) => [t, 'yes'])), note: D.CARDS[u.id] && D.CARDS[u.id].text ? D.CARDS[u.id].text : '' }));
    };
    const drawGame = (g) => {
      const A = byKey[wa.value], B = byKey[wb.value];
      let step = 0, after = false;
      const total = g.rounds.length;
      const body = h('div');
      const range = h('input', { type: 'range', min: '0', max: String(2 * total - 1), value: '0', 'aria-label': 'Round and moment' });
      const lab = h('b');
      const paint = () => {
        const r = g.rounds[step], s = after ? r.after : r.before;
        lab.textContent = `Round ${r.before.round} of ${g.rounds[total - 1].before.round}: ${after ? 'after combat' : 'before the plays'}`;
        range.value = String(2 * step + (after ? 1 : 0));
        const lane = (l) => h('div', { class: 'lane' },
          h('div', { class: 'bar' + (s.P[1].bmax[l] > 20 ? ' broken' : ''), text: `B ${Math.max(0, s.P[1].barrier[l])}/${s.P[1].bmax[l]}` + (s.P[1].bmax[l] > 20 ? ', rebuilt' : '') }),
          h('div', { class: 'side' }, s.board[1][l].map(unit)),
          h('div', { class: 'loc' }, s.locs[l] ? tipLoc(s.locs[l]) : 'not revealed yet'),
          h('div', { class: 'side' }, s.board[0][l].map(unit)),
          h('div', { class: 'bar' + (s.P[0].bmax[l] > 20 ? ' broken' : ''), text: `A ${Math.max(0, s.P[0].barrier[l])}/${s.P[0].bmax[l]}` + (s.P[0].bmax[l] > 20 ? ', rebuilt' : '') }));
        const hand = (p) => h('div', { class: 'hand' }, s.P[p].hand.length ? s.P[p].hand.map((c) => h('span', { text: `${nameOf(c.id)} (${c.cost})` })) : h('span', { text: 'empty hand' }));
        clear(body).append(
          h('div', { class: 'who' }, h('span', null, h('b', { text: 'B: ' }), label(B), `, ${s.P[1].mana} mana, ${s.P[1].deck} cards left`), h('span', { text: s.prio === 1 ? 'reveals first' : 'reveals second' })), hand(1),
          h('div', { class: 'board' }, [0, 1, 2].map(lane)),
          h('div', { class: 'who' }, h('span', null, h('b', { text: 'A: ' }), label(A), `, ${s.P[0].mana} mana, ${s.P[0].deck} cards left`), h('span', { text: s.prio === 0 ? 'reveals first' : 'reveals second' })), hand(0),
          h('h4', { style: 'margin-top:16px', text: after ? 'What happened this round' : 'Start of the round' }),
          h('ol', { class: 'log' }, (after ? r.log : r.log.filter((x) => /^Location /.test(x))).map((x) => h('li', { text: fix(x) })), !after && !r.log.some((x) => /^Location /.test(x)) ? h('li', { text: 'Both players plan their round.' }) : null));
      };
      const tipLoc = (l) => { const el = h('span', { text: l.name }); U.tip(el, () => ({ title: l.name, note: l.text })); return el; };
      const go = (v) => { v = Math.max(0, Math.min(2 * total - 1, v)); step = Math.floor(v / 2); after = v % 2 === 1; paint(); };
      range.addEventListener('input', () => go(+range.value));
      const prev = h('button', { class: 'btn ghost', type: 'button', text: '← Back' }), next = h('button', { class: 'btn', type: 'button', text: 'Next →' });
      prev.addEventListener('click', () => go(2 * step + (after ? 1 : 0) - 1));
      next.addEventListener('click', () => go(2 * step + (after ? 1 : 0) + 1));
      clear(view).append(h('p', { class: 'note', text: g.winner === -1 ? `Draw after ${g.round} rounds.` : `${g.winner === 0 ? 'A, ' + label(A) : 'B, ' + label(B)}, wins in round ${g.round}.` }), h('div', { class: 'stepper' }, prev, next, lab, range), body);
      paint();
    };
    play.addEventListener('click', () => {
      play.disabled = true; clear(view).append(h('p', { class: 'cap', text: 'Playing…' }));
      U.Sim.game(byKey[wa.value], byKey[wb.value], 'std', Math.max(1, Math.floor(+seed.value || 1))).then((g) => { play.disabled = false; drawGame(g); }, (err) => { play.disabled = false; clear(view).append(h('p', { class: 'cap', text: 'The game stopped: ' + err.message })); });
    });
    clear($('#watch')).append(h('div', { class: 'row-ctl' }, h('div', { class: 'ctl' }, h('span', { text: 'Deck A (lower row)' }), wa), h('div', { class: 'ctl' }, h('span', { text: 'Deck B (upper row)' }), wb), h('div', { class: 'ctl' }, h('span', { text: 'Seed' }), seed), play), view);
  })();

  // ---------------------------------------------------------------- method
  (function method() {
    const pairs = decks.length * (decks.length - 1) / 2;
    const rfL = Object.keys(R.search || {}).filter((k) => R.search[k].refine);
    const steps = [
      ['Read the game.', `All ${D.POOL.length} playable cards, the ${legs.length} Legendaries with their powers, the 43 locations of the standard pool with their odds, and the rule constants were taken from the game files of client ${R.game.client} (data version ${R.game.data}). An engine plays them, and 291 automatic checks compare it with the card texts and the designers' notes found in those files.`],
      ['Collect the real lists.', `${R.reals} lists: ladder lists with their authors' own records, the lists of the first four players of the Crimson Cup and of one more finalist, and the lists of the wiki's deck guides.`],
      ['Play every list against every other.', `${R.perPair} games per pair with the standard bot, ${num(pairs * R.perPair)} games. Every seed is played twice with the seats swapped: the seed fixes the three locations and who reveals first, so that luck cancels out. Games lasted ${R.rounds.toFixed(1)} rounds on average.`],
      ['Weigh the opponents like the real ladder.', `A list's headline number is its win rate against the real lists, each Legendary counting for its share of ladder games this patch (${Object.keys(R.field.share).sort((a, b) => R.field.share[b] - R.field.share[a]).slice(0, 3).map((k) => SHORT[k] + ' ' + pct(R.field.share[k], 0)).join(', ')} and so on), split evenly over its lists.`],
      ['Search for the best 12 cards of each Legendary.', R.searchGames ? `A cross-entropy search keeps a table of how likely each of the ${D.POOL.length} cards is to be in the deck, draws lists from it, and moves the table toward the cards of the lists that win. Its leaders, the real lists and the one-card changes of the best list with the cards the table still rates then race against the best ladder list of each Legendary, the weaker half dropping out each round while the number of games doubles. ${num(R.searchDecks)} different lists, ${num(R.searchGames)} games. The winners went back into the round robin so that their published numbers come from fresh games.` + (rfL.length ? ` The ${rfL.map((k) => SHORT[k]).join(' and ')} winner then went through one more test: every other card of the pool in every one of its slots, and the best of those changes again on paired games with the standard bot.` : '') : 'Not run yet.'],
      ['Check the simulator against real results.', cal.length ? `The October card pool was rebuilt from the patch history and its ${cal[0].lists} lists played ${num(cal[0].simGames)} games. The simulated Legendary win rates were then compared with two real trackers of that month.` : 'Not run yet.'],
      ['Stress the result.', (R.strong ? `The best list of each Legendary played again with the strong bot (${num(R.strong.games)} games). ` : '') + (R.sens && R.sens.length ? `They also played under ${R.sens.length} other location pools (${num(R.sens.reduce((a, s) => a + s.games, 0))} games).` : '') || 'Not run yet.'],
      ['Name a winner only where the sources agree.', `The pick is the list with the best simulated number among the Legendaries that are also above 50% on the real ladder this patch.`],
    ];
    $('#m-steps').append(...steps.map(([t, p]) => h('li', null, h('b', { text: t + ' ' }), p)));

    // calibration
    const sets = cal.map((c) => ({ key: c.key, label: c.label, rows: c.rows, pearson: c.pearson, spearman: c.spearman, gap: c.gap, matchups: c.matchups, games: c.games }))
      .concat([{ key: 'now', label: R.field.label, rows: R.calNow.rows, pearson: R.calNow.pearson, spearman: R.calNow.spearman, gap: R.calNow.gap, matchups: [], games: R.field.games }]);
    $('#m-cal-sub').textContent = 'Each point is a Legendary. Across is its real win rate on the ladder, up is the simulated win rate of its real lists against a field weighted like that ladder. On the dashed line the two match. Above it the simulator is too kind to that Legendary, below it too harsh.';
    const drawCal = (key) => {
      const c = sets.find((x) => x.key === key);
      $('#m-cal-h').textContent = `r = ${c.pearson.toFixed(2)}, average gap ${c.gap.toFixed(1)} points`;
      U.scatter($('#cal'), c.rows.map((r) => ({ x: r.real, y: r.sim, label: TINY[r.legend], aria: `${SHORT[r.legend]}: real ${r.real}%, simulated ${r.sim.toFixed(0)}%`,
        tip: () => ({ title: legBy[r.legend] ? legBy[r.legend].name : r.legend, rows: [['Real ladder', `${r.real.toFixed(1)}% of ${num(r.games)}`], ['Simulated, average', r.sim.toFixed(1) + '%'], ['Simulated, best list', r.best.toFixed(1) + '%'], ['Lists', String(r.lists)]] }) })),
      { lo: 10, hi: 80, step: 10, xt: 'Real ladder win rate', yt: 'Simulated win rate', label: 'Real against simulated win rate per Legendary' });
      $('#cal-cap').textContent = `${c.label}: ${num(c.games)} real games. Rank correlation ${c.spearman.toFixed(2)}.`;
      clear($('#cal-tbl')).append(U.table([{ t: 'Legendary', f: (r) => SHORT[r.legend] }, { t: 'Real', n: true, f: (r) => r.real.toFixed(1) + '%' }, { t: 'Games', n: true, f: (r) => num(r.games) }, { t: 'Simulated', n: true, f: (r) => r.sim.toFixed(1) + '%' },
        { t: 'Gap', n: true, f: (r) => (r.sim - r.real >= 0 ? '+' : '−') + Math.abs(r.sim - r.real).toFixed(1) }], c.rows.slice().sort((a, b) => b.real - a.real)));
      const mu = clear($('#cal-mu'));
      if (c.matchups && c.matchups.length) mu.append(h('h4', { style: 'margin-top:18px', text: 'Matchups the tracker reports' }), h('div', { class: 'tbl' }, U.table([{ t: 'Matchup', f: (m) => `${SHORT[m.a]} against ${SHORT[m.b]}` }, { t: 'Real', n: true, f: (m) => m.real + '%' + (m.games ? ` of ${m.games}` : '') }, { t: 'Simulated', n: true, f: (m) => m.sim.toFixed(0) + '%' }], c.matchups)));
    };
    U.seg($('#cal-seg'), sets.map((c) => ({ v: c.key, t: c.key === 'meta19oct' ? 'OriginsMeta, October' : c.key === 'vault30' ? 'Origins Vault, October' : 'This patch' })), sets[0].key, drawCal);
    drawCal(sets[0].key);

    // bots
    const b = R.bots || {};
    const bots = $('#m-bots');
    const bc = (t, p) => h('div', { class: 'card' }, h('h3', { text: t }), h('p', { text: p }));
    bots.append(bc('Fast', 'Tries its plays one card at a time and keeps the round that leaves its own board and barriers best after combat, as if the opponent did nothing new. Used by the deck search for its first passes because it is quick.'),
      bc('Standard', 'Deals itself a few possible opposing hands from the cards of the opposing list it has not seen yet, imagines what the opponent would play with each, and keeps the round that does best across them.' + (b['std-fast'] ? ` Beats the fast bot ${pct(b['std-fast'].p)} of the time (±${(100 * b['std-fast'].ci).toFixed(1)}, ${num(b['std-fast'].n)} games on random pairs of real lists).` : '') + ' Every published number comes from it.'),
      bc('Strong', 'The same idea with four times as many imagined hands.' + (b['strong-std'] ? ` Beats the standard bot ${pct(b['strong-std'].p)} of the time (±${(100 * b['strong-std'].ci).toFixed(1)}, ${num(b['strong-std'].n)} games).` : '') + ' Used to check that the ranking does not depend on the pilot.'));
    if (R.strong) {
      const S = R.strong, box = $('#m-strong');
      box.hidden = false;
      const rows = S.keys.map((k, i) => ({ d: byKey[k], std: S.std[i], strong: S.avg[i] })).filter((r) => r.d).sort((x, y) => y.strong - x.strong);
      box.append(h('h3', { text: 'The best lists again, with the strong bot' }), h('p', { class: 'sub', style: 'margin-bottom:12px', text: `Average win rate against the other best lists, ${S.n} games per pair, which puts each number within about ${(98 / Math.sqrt(S.n * (rows.length - 1))).toFixed(0)} points. If the order holds with a better pilot, the ranking is about the decks and not about the bot.` }),
        h('div', { class: 'tbl' }, U.table([{ t: 'List', f: (r) => label(r.d) }, { t: 'Standard bot', n: true, f: (r) => (r.std == null ? null : pct(r.std)) }, { t: 'Strong bot', n: true, f: (r) => pct(r.strong) },
          { t: 'Change', n: true, f: (r) => (r.std == null ? null : pts(r.strong - r.std)) }], rows, { mark: (r) => r.d.key === pick.key })));
    }
    if (R.sens && R.sens.length) {
      $('#m-sens-blk').hidden = false;
      const keys = R.sens[0].rows.map((r) => r.key).filter((k) => byKey[k]);
      const base = Object.fromEntries(R.sens[0].rows.map((r) => [r.key, r.base]));
      keys.sort((x, y) => base[y] - base[x]);
      $('#m-sens').append(U.table([{ t: 'List', f: (k) => label(byKey[k]) }, { t: 'Standard pool', n: true, f: (k) => pct(base[k]) }].concat(R.sens.map((s) => ({ t: s.label, n: true, f: (k) => { const r = s.rows.find((x) => x.key === k); return r ? pct(r.p) : null; } }))), keys, { mark: (k) => k === pick.key }),
        h('p', { class: 'cap', text: `Average win rate against the other best lists, ${R.sens[0].n} games per pair in each pool, which puts each number within about ${(98 / Math.sqrt(R.sens[0].n * (keys.length - 1))).toFixed(0)} points.` }));
    }

    $('#m-rules').append(...E.RULES_MODEL.map(([s, t]) => h('li', null, h('span', { class: 'tag' + (s === 'game' ? '' : ' plain'), text: s === 'game' ? 'Game files' : 'Our reading' }), h('span', { text: t }))));

    const limits = [
      'The bots are not human players. They never bluff, never play around a specific card they have seen before, and plan one round ahead. Decks that win by timing and by holding answers are played worse than decks that win on the board, which is the lean measured above.',
      'The bots know the 25 cards of the deck they face, though never the hand. That is fair against the known ladder lists and a little harsh on a searched list, which would keep some surprise in real games.',
      `Real ladder numbers are thin this patch: ${num(R.field.games)} games in all, under 100 for half of the Legendaries. They also mix every player and every list, so a Legendary can look weak there because its popular list is weak.`,
      'Only lists that somebody published can stand for a Legendary on the ladder side. King Arthur and Dorothy have one public list each, Wicked Stepmother and Dr. Frank none.',
      'The deck search judges a list by how the bots play it, so it inherits their lean: it builds board decks even for Legendaries whose real lists win by control, like Van Helsing. A searched list is the best list for these bots. That it is also the best list in human hands is likely where the gain is large and unproven where it is small, which is why the best real list is always shown next to it.',
      'The deck search optimises against the lists people play now. If the ladder moves, the best 12 cards move with it.',
      rfL.length ? `Only the ${rfL.map((k) => SHORT[k]).join(' and ')} winner went through the one-card test${rfL.some((k) => R.search[k].refine.changed) ? ', which improved it' : ''}. The searched lists of the other Legendaries stopped one step earlier and may have a few points left in them.` : null,
      'A few rules are not written anywhere in the game files and had to be chosen: they are marked "our reading" above. A handful of card effects are simplified: a Twister Toss onto a card that is still face down does nothing, Captain Ahab\'s target is chosen while planning, and Humpty gives a random card of the pool.',
      `A new balance patch is expected on ${R.nextPatch}. Card numbers can change then, and so can this page's answer.`,
    ];
    $('#m-limits').append(...limits.filter(Boolean).map((t) => h('li', { text: t })));

    const src = [
      ['The game files of Origins TCG', `client ${R.game.client}, data version ${R.game.data}: cards, Legendary powers, locations and rule constants.`, null],
      ['OriginsMeta', 'ladder tracker for this patch, the meta report of 19 Oct 2026, the tier list of 9 Nov 2026, ladder decklists and the patch history.', 'https://originsmeta.com/'],
      ['Origins Vault', '30 days of ladder results, and the Crimson Cup 2026 field, bans and decklists.', 'https://originsvault.net/'],
      ['Origins TCG wiki', 'rules pages and deck guides.', 'https://originstcg.wiki/'],
    ];
    $('#m-src').append(...src.map(([t, p, url]) => h('li', null, url ? h('a', { href: url, rel: 'noopener', text: t }) : h('b', { text: t }), ': ' + p)), h('li', { text: 'All of them were read on 12 Nov 2026.' }));
  })();
})();
